from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Job, Application, Employer, Notification

applications_bp = Blueprint("applications", __name__)

@applications_bp.post("/")
@jwt_required()
def apply_for_job():
    user = db.session.get(User, int(get_jwt_identity()))
    data = request.get_json() or {}

    if not user or user.role != "job_seeker":
        return jsonify({"error": "Job seeker account required"}), 403

    job = db.session.get(Job, data.get("job_id"))

    if not job:
        return jsonify({"error": "Job not found"}), 404

    existing = Application.query.filter_by(
        job_id=job.id,
        user_id=user.id
    ).first()

    if existing:
        return jsonify({"error": "You have already applied for this job"}), 409

    application = Application(job_id=job.id, user_id=user.id)

    db.session.add(application)
    db.session.commit()

    return jsonify({
        "message": "Application submitted successfully",
        "application_id": application.id
    }), 201


@applications_bp.get("/mine")
@jwt_required()
def my_applications():
    user = db.session.get(User, int(get_jwt_identity()))

    if not user or user.role != "job_seeker":
        return jsonify({"error": "Job seeker account required"}), 403

    applications = Application.query.filter_by(user_id=user.id).all()

    return jsonify([
        {
            "id": application.id,
            "job_id": application.job_id,
            "job_title": application.job.title,
            "company": application.job.company,
            "status": application.status,
            "applied_at": application.applied_at.isoformat()
        }
        for application in applications
    ])


@applications_bp.get("/employer")
@jwt_required()
def employer_applications():
    user = db.session.get(User, int(get_jwt_identity()))

    if not user or user.role != "employer":
        return jsonify({"error": "Employer account required"}), 403

    employer = Employer.query.filter_by(user_id=user.id).first()

    if not employer:
        return jsonify({"error": "Create an employer profile first"}), 404

    applications = Application.query.join(Job).filter(
        Job.employer_id == employer.id
    ).all()

    return jsonify([
        {
            "id": application.id,
            "job_title": application.job.title,
            "applicant": f"{application.applicant.first_name} {application.applicant.last_name}",
            "email": application.applicant.email,
            "status": application.status,
            "applied_at": application.applied_at.isoformat()
        }
        for application in applications
    ])


@applications_bp.patch("/<int:application_id>/status")
@jwt_required()
def update_status(application_id):
    user = db.session.get(User, int(get_jwt_identity()))

    if not user or user.role != "employer":
        return jsonify({"error": "Employer account required"}), 403

    employer = Employer.query.filter_by(user_id=user.id).first()

    if not employer:
        return jsonify({"error": "Employer profile not found"}), 404

    application = db.session.get(Application, application_id)

    if not application or application.job.employer_id != employer.id:
        return jsonify({"error": "Application not found"}), 404

    status = (request.get_json() or {}).get("status")
    allowed = ["Under Review", "Shortlisted", "Interview", "Rejected", "Accepted"]

    if status not in allowed:
        return jsonify({"error": "Invalid application status"}), 400

    application.status = status

    db.session.add(Notification(
        user_id=application.user_id,
        message=f"Your application for {application.job.title} is now {status}."
    ))

    db.session.commit()

    return jsonify({"message": "Application status updated"})
