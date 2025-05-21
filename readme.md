# 🧑‍💼 Job Portal Application

## 📌 Project Overview

This project is a full-stack job portal application designed to streamline the recruitment process. It features:

- **Applicant Dashboard**: Allows users to browse job listings, upload resumes, and track application statuses.
- **Recruiter Dashboard**: Enables recruiters to post job openings, review applicant resumes, and assess candidate suitability.
- **Resume Evaluation**: Integrates with the Gemini API to analyze resumes and provide fit scores based on job descriptions.
- **Azure Integration**: Utilizes Azure services for authentication, storage, and database management.

---

## 🛠️ Technologies Used

- **Frontend**: React.js
- **Backend**: Django (Python)
- **Database**: MongoDB (via Azure Cosmos DB)
- **Authentication**: Azure Active Directory
- **Storage**: Azure Blob Storage
- **Resume Analysis**: Gemini API

---

## ⚙️ Backend Setup (Django)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/job-portal.git
cd resume-screener
```

### 2. Create and Activate Virtual Environment

**For Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

```pip install -r requirements.txt```

### 4. setup secrets
Create a .env file in the backend directory and add the following:

```
# Django secret key for cryptographic signing
DJANGO_SECRET_KEY=your_django_secret_key_here

# Azure Form Recognizer credentials for resume parsing
FORM_RECOGNIZER_ENDPOINT=https://<your-form-recognizer-resource>.cognitiveservices.azure.com/
FORM_RECOGNIZER_KEY=your_form_recognizer_key_here

# Azure Active Directory (AAD) configuration
AD_APPLICATION_ID=your_aad_application_id_here
AD_DIRECTORY_ID=your_aad_directory_tenant_id_here

# Azure AD application secrets for the Resume Screener app registration
RESUME_SCREENER_AD_APPLICATION_SECRET_VALUE=your_resume_screener_client_secret_value_here
RESUME_SCREENER_AD_APPLICATION_SECRET_ID=your_resume_screener_client_secret_id_here

# Azure AD Object IDs for role-based access control
APPLICANT_OBJECT_ID=object_id_for_applicant_role_group
RECRUITER_OBJECT_ID=object_id_for_recruiter_role_group

# Azure Cosmos DB (MongoDB API) configuration
AZURE_COSMOS_DB_ENDPOINT=https://<your-cosmosdb-account>.mongo.cosmos.azure.com/
AZURE_COSMOS_DB_USERNAME=your_cosmos_db_username_here
AZURE_COSMOS_DB_KEY=your_cosmos_db_primary_key_here

# Gemini AI API Key for resume competency analysis
GEMINI_API_KEY=your_gemini_api_key_here

# Azure Blob Storage connection string
STORAGE_VAULT_CONNECTION_STRING=your_full_azure_blob_connection_string_here

# Azure Storage Account details for resume and JSON storage
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name_here
AZURE_STORAGE_ACCOUNT_KEY=your_storage_account_key_here
AZURE_CONTAINER_NAME=jobs  # Default container name used in project

```

### 5. Run the Development Server

```python manage.py runserver```


## Frontend setup

### 1. Navigate to the Frontend Directory

```cd ../frontend```

### 2. Install Dependencies

```npm install```

### 3. Start the Development Server
```npm run dev```

Frontend will be available at http://localhost:5173/

Backend will be running at http://localhost:8000/

## 🔗 Azure Services Integration

1. Authentication: Implemented using Azure Active Directory for secure user login and role management.

2. Blob Storage: Stores uploaded resumes and processed JSON data.

3. Cosmos DB: Manages job postings and application data.

4. Azure Document Intelligence: Extracts the contents of the resume into structured json format

5. Gemini API: Analyzes resumes to provide fit scores and summaries.

