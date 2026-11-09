import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "joblink-dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "joblink-jwt-secret")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///joblink.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
