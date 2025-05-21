from odmantic import Model, Field
from bson import ObjectId

class Job(Model):
    title: str
    required_skills: list[str]
    preferred_skills: list[str]
    experience_keywords: list[str]
    required_education: list[str]
    min_experience: str
    recruiter_id: str
    is_active: bool = True

    model_config = {"collection": "jobs"}
    # collection = "jobs"

class Application(Model):
    job_id: ObjectId
    applicant_id: str# = ObjectId("682cacf3c7b42fd40e5260da")
    resume_file: str = "default-resume-url"
    relevance_score: float = 0
    fit_status: str = "raw"

    # class Config:
    model_config = {"collection": "applications"}
    # collection = "applications"