from msal import ConfidentialClientApplication
from django.shortcuts import redirect
from django.conf import settings
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_GET
from django.http import JsonResponse
import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

AZURE_AUTH = settings.AZURE_AUTH

# Map roles to Azure AD group object IDs
ROLE_GROUPS = {
    "Applicants": os.getenv("APPLICANT_OBJECT_ID"),
    "Recruiters": os.getenv("RECRUITER_OBJECT_ID"),
}

@require_GET
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set"})

def login_redirect(request):
    app = ConfidentialClientApplication(
        settings.AZURE_CLIENT_ID,
        authority=settings.AZURE_AUTHORITY,
        client_credential=settings.AZURE_CLIENT_SECRET
    )

    auth_url = app.get_authorization_request_url(
        scopes=settings.AZURE_SCOPE,
        redirect_uri=settings.AZURE_REDIRECT_URI
    )
    return redirect(auth_url)

def azure_callback(request):
    code = request.GET.get('code')

    app = ConfidentialClientApplication(
        settings.AZURE_CLIENT_ID,
        authority=settings.AZURE_AUTHORITY,
        client_credential=settings.AZURE_CLIENT_SECRET
    )

    result = app.acquire_token_by_authorization_code(
        code,
        scopes=settings.AZURE_SCOPE,
        redirect_uri=settings.AZURE_REDIRECT_URI
    )

    access_token = result.get('access_token')
    user_info = result.get("id_token_claims", {})
    print("details", user_info)
    email = user_info.get("preferred_username")  # or 'email'
    name = user_info.get("name")
    graph_api_url = f"https://graph.microsoft.com/v1.0/users/{user_info['oid']}/memberOf"
    # graph_api_url = ""
    # headers = {"Authorization": f"Bearer {access_token}"}
    # response = requests.get(graph_url, headers=headers)

    # if response.status_code != 200:
    #     return redirect('/unauthorized')

    # groups = response.json().get('value', [])

    # # You can check group displayNames or IDs
    # group_names = [g.get('displayName') for g in groups]
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(graph_api_url, headers=headers)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)

        group_data = response.json()
        groups = group_data.get('value', [])

        
        print("User Group Memberships:")
        if groups:
            for group in groups:
                if ROLE_GROUPS["Applicants"] == group.get('id'):
                    return redirect('http://localhost:5173/applicant/')
                else:
                    return redirect('http://localhost:5173/recruiter/')
                    
        else:
            print("  No group memberships found or insufficient permissions.")
    except:
        print("Exception")
    # if 'Recruiters' in group_names:
    #     return redirect('/recruiter/dashboard')
    # elif 'Applicants' in group_names:
    #     return redirect('/candidate/dashboard')

    # Mock registration logic: create user and assign role/group here
    print(f"Signed in as {email}, {name}")
    return redirect('/dashboard')

# views.py





@csrf_exempt
def register(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request method. POST required."}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)

    required_fields = ["email", "password", "role"]
    for field in required_fields:
        if not data.get(field):
            return JsonResponse({"error": f"{field} is required"}, status=400)

    email = data["email"]
    password = data["password"]
    role = data["role"]

    if role not in ROLE_GROUPS:
        return JsonResponse({"error": "Invalid role"}, status=400)

    # Optional fields
    given_name = data.get("givenName")
    surname = data.get("surname")
    job_title = data.get("jobTitle")
    mobile_phone = data.get("mobilePhone")
    preferred_language = data.get("preferredLanguage", "en-US")

    # MSAL - Token Acquisition
    app = ConfidentialClientApplication(
        AZURE_AUTH["CLIENT_ID"],
        client_credential=AZURE_AUTH["CLIENT_SECRET"],
        authority=f"https://login.microsoftonline.com/{AZURE_AUTH['TENANT_ID']}"
    )

    token_response = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
    access_token = token_response.get("access_token")
    if not access_token:
        return JsonResponse({
            "error": "Token acquisition failed",
            "details": token_response.get("error_description")
        }, status=500)

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    user_payload = {
        "accountEnabled": True,
        "displayName": f"{given_name or email.split('@')[0]} {surname or ''}".strip(),
        "mailNickname": email.split('@')[0],
        "userPrincipalName": email,
        "passwordProfile": {
            "forceChangePasswordNextSignIn": False,
            "password": password
        },
        "givenName": given_name,
        "surname": surname,
        "jobTitle": job_title,
        "mobilePhone": mobile_phone,
        "preferredLanguage": preferred_language
    }

    # Remove None fields
    user_payload = {k: v for k, v in user_payload.items() if v is not None}

    try:
        user_create_resp = requests.post(
            "https://graph.microsoft.com/v1.0/users",
            headers=headers,
            json=user_payload
        )
        user_create_resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": "User creation failed", "details": str(e)}, status=500)

    user_id = user_create_resp.json().get("id")

    # Add user to group
    group_id = ROLE_GROUPS[role]
    group_url = f"https://graph.microsoft.com/v1.0/groups/{group_id}/members/$ref"

    try:
        group_resp = requests.post(
            group_url,
            headers=headers,
            json={"@odata.id": f"https://graph.microsoft.com/v1.0/directoryObjects/{user_id}"}
        )
        group_resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": "Group assignment failed", "details": str(e)}, status=500)

    return JsonResponse({"message": "User registered successfully"})