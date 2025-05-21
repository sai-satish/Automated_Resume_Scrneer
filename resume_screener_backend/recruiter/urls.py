from django.urls import path
from recruiter.views import post_job, get_all_jobs, get_applications_for_job, update_job_status

urlpatterns = [
    path('post-job/', post_job),
    path('list-all-jobs/', get_all_jobs),
    path('job/<str:job_id>/applications/', get_applications_for_job, name='job_applications'),
    path('job/<str:job_id>/', update_job_status, name='update_job'),
]
