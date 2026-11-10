from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Employer, Job

admin_bp = Blueprint("admin", __name__)

def get_admin():
    user = db.session.get(User, int(get_jwt_identity()))
    return user if user and user.role == "admin" else None

@admin_bp.get("/dashboard")
@jwt_required()
def dashboard():
    if not get_admin():
        return jsonify({"error": "Admin access required"}), 403

    return jsonify({
        "users": User.query.count(),
        "employers": Employer.query.count(),
        "jobs": Job.query.count(),
        "pending_employers": Employer.query.filter_by(is_verified=False).count(),
        "pending_jobs": Job.query.filter_by(is_verified=False).count()
    })

@admin_bp.get("/employers")
@jwt_required()
def employers():
    if not get_admin():
        return jsonify({"error": "Admin access required"}), 403

    records = Employer.query.all()
    return jsonify([{
        "id": item.id,
        "company_name": item.company_name,
        "location": item.location,
        "verified": item.is_verified
    } for item in records])

@admin_bp.patch("/employers/<int:employer_id>/verify")
@jwt_required()
def verify_employer(employer_id):
    if not get_admin():
        return jsonify({"error": "Admin access required"}), 403

    employer = db.session.get(Employer, employer_id)
    if not employer:
        return jsonify({"error": "Employer not found"}), 404

    employer.is_verified = True
    db.session.commit()
    return jsonify({"message": "Employer verified"})

@admin_bp.get("/jobs")
@jwt_required()
def jobs():
    if not get_admin():
        return jsonify({"error": "Admin access required"}), 403

    records = Job.query.all()
    return jsonify([{
        "id": item.id,
        "title": item.title,
        "company": item.company,
        "verified": item.is_verified
    } for item in records])

@admin_bp.patch("/jobs/<int:job_id>/verify")
@jwt_required()
def verify_job(job_id):
    if not get_admin():
        return jsonify({"error": "Admin access required"}), 403

    job = db.session.get(Job, job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    job.is_verified = True
    db.session.commit()
    return jsonify({"message": "Job verified"})
