from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.extensions import db, migrate, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from app import models
    from app.routes.jobs import jobs_bp
    from app.routes.auth import auth_bp
    from app.routes.employers import employers_bp
    from app.routes.applications import applications_bp

    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(employers_bp, url_prefix="/api/employers")
    app.register_blueprint(applications_bp, url_prefix="/api/applications")

    @app.get("/")
    def home():
        return jsonify({
            "name": "JobLink API",
            "status": "running"
        })

    @app.get("/api/health")
    def health():
        return jsonify({"status": "healthy"})

    return app
