from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Notification

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.get("/")
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    records = Notification.query.filter_by(
        user_id=user_id
    ).order_by(Notification.created_at.desc()).all()

    return jsonify([{
        "id": item.id,
        "message": item.message,
        "is_read": item.is_read,
        "created_at": item.created_at.isoformat()
    } for item in records])

@notifications_bp.patch("/<int:notification_id>/read")
@jwt_required()
def mark_read(notification_id):
    user_id = int(get_jwt_identity())
    item = db.session.get(Notification, notification_id)

    if not item or item.user_id != user_id:
        return jsonify({"error": "Notification not found"}), 404

    item.is_read = True
    db.session.commit()
    return jsonify({"message": "Notification marked as read"})
