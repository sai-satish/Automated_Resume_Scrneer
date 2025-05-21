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
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_storage_account_key
AZURE_CONTAINER_NAME=jobs
STORAGE_VAULT_CONNECTION_STRING=your_connection_string
GEMINI_API_KEY=your_gemini_api_key
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

