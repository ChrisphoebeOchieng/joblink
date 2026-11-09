from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models import Job

jobs_bp = Blueprint("jobs", __name__)

@jobs_bp.get("/")
def get_jobs():
    query = Job.query

    search = request.args.get("search", "").strip()
    location = request.args.get("location", "").strip()
    job_type = request.args.get("type", "").strip()

    if search:
        query = query.filter(
            db.or_(
                Job.title.ilike(f"%{search}%"),
                Job.company.ilike(f"%{search}%"),
                Job.description.ilike(f"%{search}%")
            )
        )

    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))

    if job_type:
        query = query.filter(Job.job_type.ilike(f"%{job_type}%"))

    jobs = query.order_by(Job.created_at.desc()).all()

    return jsonify([
        {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "description": job.description,
            "location": job.location,
            "type": job.job_type,
            "salary": job.salary_range,
            "skills": job.skills or [],
            "verified": job.is_verified
        }
        for job in jobs
    ])

@jobs_bp.post("/")
def create_job():
    data = request.get_json() or {}

    required = ["title", "company", "description"]
    if any(not data.get(field) for field in required):
        return jsonify({"error": "Title, company and description are required"}), 400

    job = Job(
        title=data["title"],
        company=data["company"],
        description=data["description"],
        location=data.get("location"),
        job_type=data.get("type"),
        salary_range=data.get("salary"),
        skills=data.get("skills", [])
    )

    db.session.add(job)
    db.session.commit()

    return jsonify({"message": "Job created", "id": job.id}), 201
