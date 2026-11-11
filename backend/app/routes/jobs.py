from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Employer, Job


jobs_bp = Blueprint("jobs", __name__)


def serialize_job(job):
    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "description": job.description,
        "location": job.location,
        "type": job.job_type,
        "job_type": job.job_type,
        "salary": job.salary_range,
        "salary_range": job.salary_range,
        "skills": job.skills or [],
        "verified": job.is_verified,
        "is_verified": job.is_verified,
        "source_type": job.source_type or "platform",
        "source_name": job.source_name,
        "application_url": job.application_url,
        "application_deadline": (
            job.application_deadline.isoformat()
            if job.application_deadline else None
        ),
        "work_arrangement": job.work_arrangement,
        "last_checked_at": (
            job.last_checked_at.isoformat()
            if job.last_checked_at else None
        ),
        "created_at": (
            job.created_at.isoformat()
            if job.created_at else None
        )
    }


@jobs_bp.get("/")
def get_jobs():
    query = Job.query.filter_by(is_verified=True)

    search = request.args.get("search", "").strip()
    location = request.args.get("location", "").strip()
    job_type = request.args.get("type", "").strip()
    source_type = request.args.get("source", "").strip()
    work_arrangement = request.args.get("work_arrangement", "").strip()

    if search:
        query = query.filter(
            db.or_(
                Job.title.ilike(f"%{search}%"),
                Job.company.ilike(f"%{search}%"),
                Job.description.ilike(f"%{search}%"),
                Job.skills.cast(db.String).ilike(f"%{search}%")
            )
        )

    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))

    if job_type:
        query = query.filter(Job.job_type.ilike(f"%{job_type}%"))

    if source_type in ("platform", "external"):
        query = query.filter(Job.source_type == source_type)

    if work_arrangement:
        query = query.filter(
            Job.work_arrangement.ilike(f"%{work_arrangement}%")
        )

    # Hide expired external listings from the public feed.
    query = query.filter(
        db.or_(
            Job.application_deadline.is_(None),
            Job.application_deadline >= date.today()
        )
    )

    jobs = query.order_by(Job.created_at.desc()).all()

    return jsonify([serialize_job(job) for job in jobs])


@jobs_bp.get("/mine")
@jwt_required()
def my_jobs():
    user = db.session.get(User, int(get_jwt_identity()))

    if not user or user.role != "employer":
        return jsonify({"error": "Employer account required"}), 403

    employer = Employer.query.filter_by(user_id=user.id).first()

    if not employer:
        return jsonify({"error": "Create an employer profile first"}), 404

    jobs = Job.query.filter_by(
        employer_id=employer.id
    ).order_by(Job.created_at.desc()).all()

    return jsonify([serialize_job(job) for job in jobs])


@jobs_bp.post("/")
@jwt_required()
def create_job():
    user = db.session.get(User, int(get_jwt_identity()))

    if not user or user.role != "employer":
        return jsonify({"error": "Employer account required"}), 403

    employer = Employer.query.filter_by(user_id=user.id).first()

    if not employer:
        return jsonify({"error": "Create your employer profile first"}), 404

    if not employer.is_verified:
        return jsonify({
            "error": "Your company must be verified before posting jobs"
        }), 403

    data = request.get_json(silent=True) or {}

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    skills = data.get("skills", [])

    if not title or not description:
        return jsonify({
            "error": "Job title and description are required"
        }), 400

    if len(title) > 150:
        return jsonify({
            "error": "Job title must be 150 characters or fewer"
        }), 400

    if not isinstance(skills, list) or not all(
        isinstance(skill, str) for skill in skills
    ):
        return jsonify({
            "error": "Skills must be a list of text values"
        }), 400

    job = Job(
        employer_id=employer.id,
        title=title,
        company=employer.company_name,
        description=description,
        location=data.get("location"),
        job_type=data.get("type"),
        salary_range=data.get("salary"),
        skills=skills,
        is_verified=False,
        source_type="platform",
        source_name=employer.company_name,
        work_arrangement=data.get("work_arrangement")
    )

    db.session.add(job)
    db.session.commit()

    return jsonify({
        "message": "Job submitted for verification",
        "id": job.id,
        "verified": job.is_verified
    }), 201
