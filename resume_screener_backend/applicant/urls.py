from django.urls import path
# from .views import upload_resume

# urlpatterns = [
#     path('upload-resume/', upload_resume),
    
# ]

from .views import applicant_dashboard, apply_to_job

urlpatterns = [
    path('', applicant_dashboard),
    path('apply/', apply_to_job),
]