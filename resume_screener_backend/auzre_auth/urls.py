from django.urls import path
from auzre_auth.views import login_redirect, register, get_csrf_token, azure_callback

urlpatterns = [
    path('register/', register),
    path('login/', login_redirect),
    path('callback/', azure_callback),
    path('csrf/', get_csrf_token)

]
