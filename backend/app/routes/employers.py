from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Employer, Job

employers_bp = Blueprint("employers", __name__)

@employers_bp.post("/profile")
@jwt_required()
def create_profile():
    user = db.session.get(User, int(get_jwt_identity()))
    data = request.get_json() or {}

    if not user or user.role != "employer":
        return jsonify({"error": "Employer account required"}), 403

    if not data.get("company_name"):
        return jsonify({"error": "Company name is required"}), 400

    if Employer.query.filter_by(user_id=user.id).first():
        return jsonify({"error": "Employer profile already exists"}), 409

    employer = Employer(
        user_id=user.id,
        company_name=data["company_name"],
        location=data.get("location"),
        description=data.get("description")
    )

    db.session.add(employer)
    db.session.commit()

    return jsonify({"message": "Employer profile created", "id": employer.id}), 201


@employers_bp.get("/profile")
@jwt_required()
def get_profile():
    user = db.session.get(User, int(get_jwt_identity()))

    if not user or user.role != "employer":
        return jsonify({"error": "Employer account required"}), 403

    employer = Employer.query.filter_by(user_id=user.id).first()

    if not employer:
        return jsonify({"error": "Employer profile not found"}), 404

    return jsonify({
        "id": employer.id,
        "company_name": employer.company_name,
        "location": employer.location,
        "description": employer.description,
        "is_verified": employer.is_verified
    })
