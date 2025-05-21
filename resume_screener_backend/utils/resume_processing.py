import os
import re
import json
from io import BytesIO

from azure.storage.blob import BlobServiceClient
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv

import google.generativeai as genai
from pymongo import MongoClient # Import MongoClient for MongoDB
from bson.objectid import ObjectId # For querying MongoDB by _id
from django.conf import settings
from utils.mongo import get_engine
from resume_screener.models import *

load_dotenv()

# Environment variables
FORM_RECOGNIZER_ENDPOINT = os.getenv("FORM_RECOGNIZER_ENDPOINT")
FORM_RECOGNIZER_KEY = os.getenv("FORM_RECOGNIZER_KEY")
BLOB_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
BLOB_CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER_NAME")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")

# Define your blob folder paths globally
RAW_RESUMES_BASE_FOLDER = "jobs/" # Base for job-specific raw resume folders
STRUCTURED_JSON_BASE_FOLDER = "jobs/" # Base for job-specific structured JSON folders

# Initialize clients
blob_service_client = BlobServiceClient(
            account_url=f"https://{settings.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net",
            credential=settings.AZURE_STORAGE_ACCOUNT_KEY
        )
# blob_service_client = BlobServiceClient.from_connection_string(BLOB_CONNECTION_STRING)
document_analysis_client = DocumentAnalysisClient(
    endpoint=FORM_RECOGNIZER_ENDPOINT,
    credential=AzureKeyCredential(FORM_RECOGNIZER_KEY)
)
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

# Initialize MongoDB client
# mongo_client = MongoClient(MONGODB_CONNECTION_STRING)
# # IMPORTANT: Replace "your_database_name" and "job_descriptions" with your actual database and collection names
# mongo_db = mongo_client.get_database("your_database_name")
# job_descriptions_collection = mongo_db.get_collection("job_descriptions")


# --- Utility Functions ---

def fetch_pdf_from_blob(blob_name: str) -> BytesIO:
    """
    Fetch a PDF file from Azure Blob Storage as a BytesIO stream.
    `blob_name` should be the full virtual path inside the container,
    e.g., 'jobs/<job_id>/raw/filename.pdf'
    """
    try:
        connection_string = os.getenv("STORAGE_VAULT_CONNECTION_STRING")
        container_name = os.getenv("AZURE_CONTAINER_NAME", "jobs")  # This should be like 'resumes', NOT a path

        blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)

        stream = BytesIO()
        download_stream = blob_client.download_blob()
        download_stream.readinto(stream)
        stream.seek(0)
        return stream

    except Exception as e:
        print(f"Error fetching blob '{blob_name}': {e}")
        raise

def analyze_resume_pdf(pdf_stream: BytesIO) -> dict:
    """Analyze PDF stream with Azure Form Recognizer prebuilt-document model"""
    poller = document_analysis_client.begin_analyze_document(
        model_id="prebuilt-document",
        document=pdf_stream
    )
    result = poller.result()

    extracted = {
        "content": result.content,
        "key_value_pairs": [],
        "paragraphs": [p.content for p in result.paragraphs]
    }

    for kv in result.key_value_pairs:
        key = kv.key.content if kv.key else ""
        value = kv.value.content if kv.value else ""
        extracted["key_value_pairs"].append({"key": key, "value": value})

    return extracted

def extract_structured_fields(resume_data: dict) -> dict:
    """Extract structured fields from Form Recognizer raw output"""
    # Your existing extract_structured_fields function.
    content = resume_data.get("content", "")
    paragraphs = resume_data.get("paragraphs", [])
    key_value_pairs = resume_data.get("key_value_pairs", [])

    result = {
        "name": None,
        "address": None,
        "email": None,
        "phone": None,
        "github": None,
        "linkedin": None,
        "objective": None,
        "education": [],
        "projects": [],
        "work_experience": [],
        "certifications": [],
        "skills": {
            "coding_languages": [],
            "technical_skills": [],
            "soft_skills": []
        },
        "extra_curricular": [],
    }

    text = "\n".join(paragraphs)

    # Basic personal info regex extraction
    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    result["email"] = email_match.group() if email_match else None

    phone_match = re.search(r"(\+91[-\s]?)?\d{10}", text)
    result["phone"] = phone_match.group() if phone_match else None

    github_match = re.search(r"github\.com[^\s]+", text)
    result["github"] = github_match.group() if github_match else None

    linkedin_match = re.search(r"(https?:\/\/)?(www\.)?linkedin\.com\/[A-Za-z0-9\-_/]+", text)
    result["linkedin"] = linkedin_match.group() if linkedin_match else None

    # Naively get name from line containing email
    for para in paragraphs:
        if result["email"] and result["email"] in para:
            result["name"] = para.split(result["email"])[0].strip()
            break

    # Extract Objective section
    if "Objective" in text:
        obj_lines = []
        capture = False
        for para in paragraphs:
            if "Objective" in para:
                capture = True
                continue
            if capture:
                if para.strip() == "":
                    break
                obj_lines.append(para.strip())
        result["objective"] = " ".join(obj_lines)

    def extract_section(title, stopwords):
        section_lines = []
        capture = False
        for para in paragraphs:
            if title.lower() in para.lower():
                capture = True
                continue
            if capture and any(stop.lower() in para.lower() for stop in stopwords):
                break
            if capture:
                section_lines.append(para.strip())
        return section_lines

    # Education section extraction
    edu_lines = extract_section("Education", ["Skills", "Work Experience", "Projects"])
    edu_entry = {}
    for line in edu_lines:
        if re.match(r"[·•\-]", line):
            if edu_entry:
                result["education"].append(edu_entry)
                edu_entry = {}
            edu_entry["institution"] = line.strip("·•- ").strip()
        elif re.search(r"\d{4}", line):
            edu_entry["duration"] = line.strip()
        else:
            edu_entry["description"] = edu_entry.get("description", "") + " " + line
    if edu_entry:
        result["education"].append(edu_entry)

    # Skills from key_value_pairs
    for pair in key_value_pairs:
        key, value = pair["key"].lower(), pair["value"]
        if "coding language" in key:
            result["skills"]["coding_languages"] = [s.strip() for s in value.split(",")]
        elif "technical skill" in key:
            result["skills"]["technical_skills"] = [s.strip() for s in value.split(",")]
        elif "soft skill" in key:
            result["skills"]["soft_skills"] = [s.strip() for s in value.split(",")]

    # Work experience extraction
    work_lines = extract_section("Work Experience", ["Projects", "Certifications", "Extra-Curricular", "Skills"])
    current_exp = {}
    duration_pattern = r"((\d{1,2}\s)?(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*[ ,]*\d{4})\s*(to|–|-)\s*((\d{1,2}\s)?(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*[ ,]*\d{4}|Present)"

    for line in work_lines:
        line = line.strip()
        if not line:
            continue

        duration_match = re.search(duration_pattern, line, re.IGNORECASE)
        duration = duration_match.group() if duration_match else None

        if duration_match:
            if current_exp:
                result["work_experience"].append(current_exp)
                current_exp = {}

            title = line.replace(duration, "").strip("·-•– ").strip()
            current_exp["title"] = title
            current_exp["duration"] = duration
            current_exp["description"] = ""
        else:
            if not current_exp.get("description"):
                current_exp["description"] = line
            else:
                current_exp["description"] += " " + line
    if current_exp:
        result["work_experience"].append(current_exp)

    # Projects extraction
    proj_lines = extract_section("Projects", ["Certifications", "Extra-Curricular"])
    current_proj = {}
    for line in proj_lines:
        if " - Link" in line:
            if current_proj:
                result["projects"].append(current_proj)
                current_proj = {}
            current_proj["name"] = line.replace(" - Link", "").strip()
        else:
            current_proj["description"] = current_proj.get("description", "") + " " + line
    if current_proj:
        result["projects"].append(current_proj)

    # Certifications extraction
    cert_lines = extract_section("Certifications", ["Extra-Curricular"])
    issuer = None
    for line in cert_lines:
        if line.startswith("·") or line.startswith("."):
            if issuer:
                result["certifications"].append({
                    "certificate": line.strip("·. ").strip(),
                    "issuer": issuer
                })
                issuer = None
        else:
            issuer = line.strip()

    # Extra-curricular extraction
    extra_lines = extract_section("Extra-Curricular", [])
    current_extra = {}
    for line in extra_lines:
        if "hackathon" in line.lower() or "team" in line.lower() or "volunteering" in line.lower():
            if current_extra:
                result["extra_curricular"].append(current_extra)
                current_extra = {}
            current_extra["name"] = line.strip()
        else:
            current_extra["description"] = current_extra.get("description", "") + " " + line
    if current_extra:
        result["extra_curricular"].append(current_extra)

    return result

# --- FIXED: process_resume_from_blob implementation ---
def process_resume_from_blob(blob_name: str) -> dict:
    """
    Fetches resume PDF from blob, analyzes it with Form Recognizer,
    and extracts structured JSON fields.
    """
    pdf_stream = fetch_pdf_from_blob(blob_name)
    print("pdf fetched from blob")
    raw_resume_data = analyze_resume_pdf(pdf_stream)
    print("pdf analysed from blob")
    structured_resume = extract_structured_fields(raw_resume_data)
    print("pdf labelled properly")
    return structured_resume
# --- END FIXED ---

def analyze_competency_with_gemini(structured_resume_data: dict, job_description: str) -> dict:
    """
    Analyzes the extracted resume data against a job description using Gemini.
    Returns a structured assessment of competency.
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set. Please set it in your .env file.")

    prompt_template = """
    You are an AI resume analyst. Your task is to evaluate a candidate's resume against a given job description and assess their competency.
    Provide a concise analysis focusing on matching skills, experience, and potential gaps. You should only return a json of with the following fields. That should not include the resume of the user
    You need to provide your assessment in a JSON object with the following keys:
    - `overall_fit_score`: A numerical score from 1 to 10 (10 being perfect fit).
    - `overall_summary`: A brief paragraph summarizing the candidate's overall fit.
    - `strengths_matching_jd`: A list of bullet points highlighting specific skills/experiences from the resume that directly match the job description's requirements.
    - `gaps_in_competency`: A list of bullet points identifying key skills/experiences mentioned in the job description that are missing or weak in the resume.
    - `fit_status`: Whether the resume is a good or bad fit for the role of the job being applied by the candidate by analysing his resume
    What ever your thought give a float value from 0 to 10 for field overall_fit_score and fit_status has two options good_fit, bad_fit.

    Job Description:
    ```
    {job_description}
    ```

    Resume Data (JSON):
    ```json
    {resume_json}
    ```

    

   
    """

    resume_for_prompt = structured_resume_data.copy()
    resume_for_prompt.pop('content', None)
    resume_for_prompt.pop('paragraphs', None)

    prompt = prompt_template.format(
        resume_json=json.dumps(resume_for_prompt, indent=2),
        job_description=job_description
    )

    try:
        response = gemini_model.generate_content(prompt)
        response_text = response.text.strip()
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1

        if json_start != -1 and json_end != -1 and json_end > json_start:
            json_string = response_text[json_start:json_end]
            return json.loads(json_string)
        else:
            return {"error": "Failed to parse Gemini response as JSON", "raw_response": response_text}

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return {"error": f"Gemini API call failed: {e}"}


from azure.storage.blob import BlobServiceClient, ContentSettings

def save_json_to_blob(data: dict, blob_name: str, job_id: str):
    """
    Saves a dictionary as a JSON file to Azure Blob Storage inside
    the 'jobs' container under {job_id}/processed/.
    """
    try:
        connection_string = os.getenv("STORAGE_VAULT_CONNECTION_STRING")
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)

        container_name = f"jobs"
        container_client = blob_service_client.get_container_client(container_name)

        # Target path inside the container
        target_blob_name = f"{job_id}/processed/{blob_name}"

        json_data = json.dumps(data, indent=2)
        json_bytes = json_data.encode('utf-8')

        blob_client = container_client.get_blob_client(target_blob_name)
        blob_client.upload_blob(
            json_bytes,
            overwrite=True,
            content_settings=ContentSettings(content_type="application/json")
        )

        print(f"✅ Successfully saved structured JSON to: {target_blob_name}")
    except Exception as e:
        print(f"❌ Failed to save JSON to blob: {e}")


def list_blobs_in_folder(container_name, folder_name: str, job_id: str, file_extension: str = ".pdf") -> list[str]:
    """
    List all blob names under a folder (prefix) in the container with a specific extension.
    """
    try:
        connection_string = os.getenv("STORAGE_VAULT_CONNECTION_STRING")
        print("connection string:", connection_string)
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)

        # This must be the actual container name — not a path!
        # container_name = os.getenv("AZURE_CONTAINER_NAME","jobs")  # Make sure this is set correctly
        container_client = blob_service_client.get_container_client(container_name)
        print("connected to container:", container_name)

        # The folder name should be something like: "jobs/{job_id}/raw/"
        prefix = folder_name.rstrip("/") + "/"
        print("listing blobs with prefix:", prefix)

        blobs = container_client.list_blobs(name_starts_with=prefix)
        blob_names = [blob.name for blob in blobs if blob.name.lower().endswith(file_extension.lower())]
        
        return blob_names
    except Exception as e:
        print(f"Error listing blobs in folder '{folder_name}': {e}")
        return []


async def get_job_description_from_mongodb(job_id: str) -> str | None:
    """
    Fetches job description details from MongoDB and formats it into a single string.
    Returns None if the job is not found.
    """
    try:
        # Convert job_id to ObjectId if possible
        try:
            query_id = ObjectId(job_id)
        except Exception:
            print(f"Invalid ObjectId format: {job_id}")
            return None

        engine = get_engine()
        job_doc = await engine.find_one(Job, Job.id == query_id)

        if job_doc:
            title = job_doc.title or "N/A"
            required_skills = ", ".join(job_doc.required_skills or [])
            preferred_skills = ", ".join(job_doc.preferred_skills or [])
            experience_keywords = ", ".join(job_doc.experience_keywords or [])
            required_education = ", ".join(job_doc.required_education or [])
            min_experience = job_doc.min_experience or "N/A"

            job_description_text = f"""Job Title: {title}
Required Skills: {required_skills}
Preferred Skills: {preferred_skills}
Experience Keywords: {experience_keywords}
Required Education: {required_education}
Minimum Experience: {min_experience}"""
            return job_description_text
        else:
            print(f"❌ Job with ID '{job_id}' not found in MongoDB.")
            return None
    except Exception as e:
        print(f"❌ Error fetching job description from MongoDB for ID '{job_id}': {e}")
        return None


async def process_and_store_resumes(job_id: str):
    """
    Stage 1: Fetches raw PDF resumes, processes them, and stores
    the structured JSON output in a separate blob folder.
    """
    raw_resumes_folder = f"jobs/{job_id}/raw/"
    structured_json_folder = f"jobs/{job_id}/structured/"

    print(f"--- Stage 1: Processing raw resumes from '{raw_resumes_folder}' ---")
    pdf_blob_names = list_blobs_in_folder("jobs",raw_resumes_folder,job_id, file_extension=".pdf")
    print("blobs listed:", pdf_blob_names)
    if not pdf_blob_names:
        print(f"No PDF resumes found in '{raw_resumes_folder}'.")
        return

    # Fetch job description only once for all resumes
    job_description = await get_job_description_from_mongodb(job_id)
    if not job_description:
        print(f"⚠️ No job description found for job ID {job_id}. Skipping processing.")
        return

    for blob_name in pdf_blob_names:
        try:
            print(f"Processing PDF: {blob_name}")

            # Process the resume using job description context
            structured_resume = process_resume_from_blob(blob_name)

            base_filename = os.path.splitext(os.path.basename(blob_name))[0]
            json_blob_name = f"{base_filename}.json"
            print("saving")
            save_json_to_blob(structured_resume, json_blob_name, job_id)
            print(f"  -> Saved structured data for {blob_name} to {structured_json_folder}{json_blob_name}")
        except Exception as e:
            print(f"  -> Error processing {blob_name}: {e}")


async def update_application_fit(application_id: str, fit_status: str, relevance_score: float):
    engine = get_engine()
    app = await engine.find_one(Application, Application.applicant_id == application_id)
    if not app:
        print("returning false")
        return False
    app.fit_status = fit_status
    app.relevance_score = relevance_score
    await engine.save(app)
    return True

async def evaluate_stored_resumes_competency(job_id: str, job_description: str) -> dict:
    """
    Stage 2: Fetches structured JSON resumes, evaluates their competency
    against a job description using Gemini, and returns the results.
    """
    structured_json_folder = f"{job_id}/processed/"
    print(f"\n--- Stage 2: Analyzing competency for resumes in '{structured_json_folder}' ---")

    # Use the existing blob listing logic
    json_blob_names = list_blobs_in_folder("jobs",structured_json_folder, job_id, file_extension=".json")
    print("blobs listing success")
    if not json_blob_names:
        print(f"No structured JSON resumes found in '{structured_json_folder}'.")
        return {}

    all_competency_results = {}

    try:
        connection_string = os.getenv("STORAGE_VAULT_CONNECTION_STRING")
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        container_name = os.getenv("AZURE_CONTAINER_NAME", "jobs")
        container_client = blob_service_client.get_container_client(container_name)

        for blob_name in json_blob_names:
            try:
                print(f"Analyzing JSON resume: {blob_name}")
                blob_client = container_client.get_blob_client(blob_name)
                download_stream = blob_client.download_blob()
                structured_resume_data = json.loads(download_stream.readall().decode('utf-8'))

                # Call your competency analysis function (assumed to be defined elsewhere)
                print("calling gemini api")
                competency_analysis = analyze_competency_with_gemini(structured_resume_data, job_description)
                print("success gemini api")
                base_filename = os.path.basename(blob_name)
                all_competency_results[base_filename] = {
                    "structured_resume_data": structured_resume_data,
                    "competency_analysis": competency_analysis
                }
                await update_application_fit(application_id="682cacf3c7b42fd40e5260da", fit_status=competency_analysis['fit_status'], relevance_score=competency_analysis['overall_fit_score'])
                print(f"  -> Competency analysis complete for {base_filename}")
            except Exception as e:
                print(f"  -> Error analyzing {blob_name}: {e}")
                all_competency_results[os.path.basename(blob_name)] = {"error": str(e)}

    except Exception as e:
        print(f"❌ Could not connect to blob storage: {e}")
    print("report done")
    return all_competency_results

# --- Main execution function for your pipeline ---
async def run_resume_analysis_pipeline(job_id: str) -> dict:
    """
    Orchestrates the entire resume analysis pipeline for a given job ID.
    1. Fetches job description from MongoDB.
    2. Processes raw PDF resumes for that job and stores structured JSON.
    3. Evaluates stored JSON resumes' competency using Gemini.

    Args:
        job_id (str): The ID of the job to analyze resumes for.

    Returns:
        dict: A dictionary containing the competency analysis results for all resumes,
              or an error message if the job description can't be fetched.
    """
    # Define job-specific folder paths using the job_id
    raw_resumes_job_folder = f"{RAW_RESUMES_BASE_FOLDER}{job_id}/raw/"
    structured_json_job_folder = f"{STRUCTURED_JSON_BASE_FOLDER}{job_id}/structured_json/"

    # Stage 0: Fetch job description from MongoDB
    print(f"--- Fetching Job Description for Job ID: {job_id} ---")
    job_description = await get_job_description_from_mongodb(job_id)

    if not job_description:
        return {"error": f"Could not retrieve job description for job ID: {job_id}. Analysis aborted."}

    print("Job Description fetched successfully.")

    # Stage 1: Process raw PDFs and store structured JSONs
    # This will use the now-implemented process_resume_from_blob internally
    await process_and_store_resumes(job_id)

    # Stage 2: Evaluate stored JSONs against the job description using Gemini
    print(f"\n--- Starting Competency Analysis for Job ID: {job_id} ---")
    final_competency_report =await evaluate_stored_resumes_competency(job_id, job_description)
    print("final report", final_competency_report)
    print("\n--- Pipeline Execution Complete ---")
    return final_competency_report


# Example usage (for testing outside Django):
if __name__ == "__main__":
    # IMPORTANT:
    # 1. Replace "your_database_name" and "job_descriptions" in the script
    #    with your actual MongoDB database and collection names.
    # 2. Replace the 'test_job_id' with an actual '_id' from your MongoDB.
    #    E.g., if your job document has "_id": ObjectId("682cb688bd4146d560619bda"),
    #    then test_job_id should be "682cb688bd4146d560619bda".
    # 3. Ensure you have PDF resumes uploaded to your Azure Blob Storage container
    #    under the path like 'jobs/{test_job_id}/raw/'.

    test_job_id = "682cb688bd4146d560619bda" # REPLACE THIS WITH YOUR ACTUAL JOB ID

    print(f"Running full resume analysis pipeline for job ID: {test_job_id}")
    results = run_resume_analysis_pipeline(test_job_id)
    print(json.dumps(results, indent=2))

    # Close MongoDB connection when done