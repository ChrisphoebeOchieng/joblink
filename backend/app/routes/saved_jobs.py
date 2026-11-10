from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Job, SavedJob

saved_jobs_bp = Blueprint("saved_jobs", __name__)


@saved_jobs_bp.get("/")
@jwt_required()
def get_saved_jobs():
    user_id = int(get_jwt_identity())
    records = SavedJob.query.filter_by(user_id=user_id).order_by(
        SavedJob.created_at.desc()
    ).all()
    return jsonify([record.job_id for record in records])


@saved_jobs_bp.post("/<int:job_id>")
@jwt_required()
def save_job(job_id):
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user or user.role != "job_seeker":
        return jsonify({"error": "Job seeker account required"}), 403

    job = db.session.get(Job, job_id)
    if not job or not job.is_verified:
        return jsonify({"error": "Verified job not found"}), 404

    existing = SavedJob.query.filter_by(
        user_id=user_id, job_id=job_id
    ).first()

    if existing:
        return jsonify({"message": "Job is already saved"}), 200

    db.session.add(SavedJob(user_id=user_id, job_id=job_id))
    db.session.commit()
    return jsonify({"message": "Job saved successfully"}), 201


@saved_jobs_bp.delete("/<int:job_id>")
@jwt_required()
def unsave_job(job_id):
    user_id = int(get_jwt_identity())
    record = SavedJob.query.filter_by(
        user_id=user_id, job_id=job_id
    ).first()

    if record:
        db.session.delete(record)
        db.session.commit()

    return jsonify({"message": "Job removed from saved jobs"})
