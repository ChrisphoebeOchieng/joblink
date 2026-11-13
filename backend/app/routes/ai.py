import logging

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User
from app.services.gemini_service import generate_career_response

ai_bp = Blueprint("ai", __name__)


@ai_bp.post("/chat")
@jwt_required()
def career_chat():
    user = db.session.get(User, int(get_jwt_identity()))

    if not user:
        return jsonify({"error": "User not found."}), 404

    if user.role != "job_seeker":
        return jsonify({
            "error": "The AI Career Assistant is available to job seekers only."
        }), 403

    data = request.get_json(silent=True) or {}
    message = data.get("message", "")

    if not isinstance(message, str) or not message.strip():
        return jsonify({"error": "Please enter a message."}), 400

    message = message.strip()

    if len(message) > 2000:
        return jsonify({
            "error": "Your message must be 2,000 characters or fewer."
        }), 400

    try:
        answer = generate_career_response(message, user.first_name)

        return jsonify({"response": answer}), 200

    except RuntimeError as error:
        logging.exception("AI Career Assistant error")
        return jsonify({"error": str(error)}), 503

    except Exception:
        logging.exception("Gemini API request failed")

        return jsonify({
            "error": "The AI assistant is temporarily unavailable. Please try again."
        }), 502
