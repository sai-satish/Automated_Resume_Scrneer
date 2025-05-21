from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


from azure.storage.blob import BlobServiceClient
from django.conf import settings
from bson import ObjectId
import uuid
import asyncio

from utils.mongo import get_engine
from resume_screener.models import *

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def applicant_dashboard(request):
    user_id = str(request.user.id)  # assumes Azure AD injects user object

    async def get_data():
        engine = get_engine()

        apps = await engine.find(Application, Application.applicant_id == user_id)
        applied_job_ids = {str(app.job_id) for app in apps}

        all_jobs = await engine.find(Job, Job.is_active == True)
        available_jobs = [job for job in all_jobs if str(job.id) not in applied_job_ids]

        return {
            'available_jobs': [
                {
                    'id': str(job.id),
                    'title': job.title,
                    'min_experience': job.min_experience,
                    'required_skills': job.required_skills,
                } for job in available_jobs
            ],
            'previous_applications': [
                {
                    'job_id': str(app.job_id),
                    'resume_file': app.resume_file,
                    'fit_status': app.fit_status,
                    'relevance_score': app.relevance_score,
                } for app in apps
            ]
        }

    data = asyncio.run(get_data())
    return Response(data, status=200)


# --------------------------
# Apply to Job (Async view)
# --------------------------
@api_view(['POST'])
@parser_classes([MultiPartParser])
# @permission_classes([IsAuthenticated])
def apply_to_job(request):
    async def handle_application():
        file_obj = request.FILES.get('file')
        job_id = request.POST.get('job_id')
        user = request.user

        if not file_obj or not job_id:
            return {'error': 'Missing file or job_id'}, 400

        engine = get_engine()
        job = await engine.find_one(Job, Job.id == ObjectId(job_id))
        if not job:
            return {'error': 'Job not found'}, 404

        unique_filename = f"{uuid.uuid4()}_{file_obj.name}"
        blob_path = f"jobs/{job_id}/raw/{unique_filename}"
        blob_service_client = BlobServiceClient(
            account_url=f"https://{settings.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net",
            credential=settings.AZURE_STORAGE_ACCOUNT_KEY
        )
        container_client = blob_service_client.get_container_client(settings.AZURE_CONTAINER_NAME)
        container_client.upload_blob(name=blob_path, data=file_obj, overwrite=True)

        application = Application(
            job_id=job.id,
            applicant_id=str(user.id),
            resume_file=blob_path
        )
        await engine.save(application)

        return {'message': 'Application submitted successfully'}, 201

    data, status_code = asyncio.run(handle_application())
    return Response(data, status=status_code)