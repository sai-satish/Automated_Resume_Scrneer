import json
import asyncio
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from resume_screener.models import Job, Application
from utils.mongo import get_engine
from bson import ObjectId
from utils.resume_processing import run_resume_analysis_pipeline




@csrf_exempt
@api_view(["POST"])
# @permission_classes([IsAuthenticated])
def post_job(request):
    try:
        data = JSONParser().parse(request)
        recruiter_id = str(request.user.id)

        job_doc = Job(
            title=data["title"],
            required_skills=data["required_skills"],
            preferred_skills=data["preferred_skills"],
            experience_keywords=data["experience_keywords"],
            required_education=data["required_education"],
            min_experience=data["min_experience"],
            recruiter_id=recruiter_id,
        )

        async def save_job():
            engine = get_engine()
            await engine.save(job_doc)

        asyncio.run(save_job())
        return JsonResponse({"message": "Job posted successfully!"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
# @permission_classes([IsAuthenticated])
def get_all_jobs(request):
    recruiter_id = str(request.user.id)

    async def fetch_jobs():
        engine = get_engine()
        jobs = await engine.find(Job, Job.recruiter_id == recruiter_id)

        return [
            {
                "id": str(job.id),
                "title": job.title,
                "required_skills": job.required_skills,
                "preferred_skills": job.preferred_skills,
                "experience_keywords": job.experience_keywords,
                "required_education": job.required_education,
                "min_experience": job.min_experience,
                "is_active": job.is_active,
            }
            for job in jobs
        ]

    try:
        job_data = asyncio.run(fetch_jobs())
        return JsonResponse(job_data, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



async def get_applications_for_job(request, job_id):
    engine = get_engine()

    try:
        job = await engine.find_one(Job, Job.id == ObjectId(job_id))
        if not job:
            return JsonResponse({'error': 'Job not found'}, status=404)

        applications = await engine.find(Application, Application.job_id == job.id)

        good_fit = []
        others = []
        raw = []

        for app in applications:
            if app.fit_status == "raw":
                raw.append(app.resume_file)
            elif app.fit_status == "good_fit":
                good_fit.append({
                    "filename": app.resume_file,
                    "score": app.relevance_score
                })
            else:
                others.append({
                    "filename": app.resume_file,
                    "score": app.relevance_score
                })

        data = {
            "metadata": {
                "title": job.title,
                "job_description": "Sample job description",  # Replace with actual if available
                "is_active": job.is_active
            },
            "resumes": {
                "good_fit": good_fit,
                "others": others,
                "raw": raw
            }
        }

        return JsonResponse(data, safe=False)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
def update_job_status(request, job_id):
    if request.method != 'PATCH':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        body = json.loads(request.body)
        is_active = body.get('is_active')
        if is_active is None:
            return JsonResponse({'error': 'Missing is_active field'}, status=400)

        async def update_status():
            engine = get_engine()
            job = await engine.find_one(Job, Job.id == ObjectId(job_id))
            if not job:
                return None
            job.is_active = is_active
            await engine.save(job)
            if not is_active:
                await run_resume_analysis_pipeline(job_id)
            return True

        result = asyncio.run(update_status())
        if result is None:
            return JsonResponse({'error': 'Job not found'}, status=404)

        return JsonResponse({'success': True})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

def update_application_status(request, application_id):
    if request.method != 'PATCH':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        body = json.loads(request.body)
        relevance_score = body.get('relevance_score')
        fit_status = body.get('fit_status')

        # Validation - at least one field should be present to update
        if relevance_score is None and fit_status is None:
            return JsonResponse({'error': 'Missing relevance_score or fit_status field'}, status=400)

        async def update_status():
            engine = get_engine()
            app = await engine.find_one(Application, Application.id == ObjectId(application_id))
            if not app:
                return None
            if relevance_score is not None:
                app.relevance_score = relevance_score
            if fit_status is not None:
                app.fit_status = fit_status
            await engine.save(app)
            return True

        result = asyncio.run(update_status())
        if result is None:
            return JsonResponse({'error': 'Application not found'}, status=404)

        return JsonResponse({'success': True})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)