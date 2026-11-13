from flask import Flask, jsonify
import click
from werkzeug.security import generate_password_hash
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
    from app.routes.admin import admin_bp
    from app.routes.notifications import notifications_bp
    from app.routes.saved_jobs import saved_jobs_bp
    from app.routes.ai import ai_bp

    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(employers_bp, url_prefix="/api/employers")
    app.register_blueprint(applications_bp, url_prefix="/api/applications")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(saved_jobs_bp, url_prefix="/api/saved-jobs")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")

    @app.get("/")
    def home():
        return jsonify({
            "name": "JobLink API",
            "status": "running"
        })

    @app.get("/api/health")
    def health():
        return jsonify({"status": "healthy"})


    @app.cli.command("create-admin")
    def create_admin_command():
        """Create an administrator account securely."""
        from app.models import User

        click.echo("\\nCreate a JobLink administrator")
        first_name = click.prompt("First name").strip()
        last_name = click.prompt("Last name").strip()
        email = click.prompt("Email").strip().lower()

        if not first_name or not last_name or not email or "@" not in email:
            raise click.ClickException("Enter valid names and an email address.")

        if User.query.filter_by(email=email).first():
            raise click.ClickException("An account with that email already exists.")

        password = click.prompt("Password", hide_input=True, confirmation_prompt=True)
        if len(password) < 12:
            raise click.ClickException("Password must contain at least 12 characters.")

        admin = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=generate_password_hash(password),
            role="admin"
        )

        try:
            db.session.add(admin)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise click.ClickException("Could not create the administrator account.")

        click.echo(f"Administrator account created for {email}.")

    return app
