from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/register")
def register():
    data = request.get_json() or {}

    required = ["first_name", "last_name", "email", "password"]
    if any(not data.get(field) for field in required):
        return jsonify({"error": "All required fields must be provided"}), 400

    email = data["email"].strip().lower()

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    role = data.get("role", "job_seeker")
    if role not in ["job_seeker", "employer"]:
        return jsonify({"error": "Invalid registration role"}), 400

    if len(data["password"]) < 8:
        return jsonify({"error": "Password must contain at least 8 characters"}), 400

    user = User(
        first_name=data["first_name"].strip(),
        last_name=data["last_name"].strip(),
        email=email,
        password_hash=generate_password_hash(data["password"]),
        role=role
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Account created successfully",
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role
        }
    }), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "access_token": token,
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role
        }
    })


@auth_bp.get("/me")
@jwt_required()
def current_user():
    user = db.session.get(User, int(get_jwt_identity()))

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role
    })
