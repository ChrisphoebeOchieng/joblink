"""add external job listing fields

Revision ID: 20261111_external_jobs
Revises: fe7de087c6c3
Create Date: 2026-11-11
"""

from alembic import op
import sqlalchemy as sa


revision = "20261111_external_jobs"
down_revision = "fe7de087c6c3"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "jobs",
        sa.Column(
            "source_type",
            sa.String(length=20),
            nullable=False,
            server_default="platform"
        )
    )
    op.add_column(
        "jobs",
        sa.Column("source_name", sa.String(length=150), nullable=True)
    )
    op.add_column(
        "jobs",
        sa.Column("application_url", sa.String(length=2048), nullable=True)
    )
    op.add_column(
        "jobs",
        sa.Column("application_deadline", sa.Date(), nullable=True)
    )
    op.add_column(
        "jobs",
        sa.Column("work_arrangement", sa.String(length=30), nullable=True)
    )
    op.add_column(
        "jobs",
        sa.Column("last_checked_at", sa.DateTime(), nullable=True)
    )


def downgrade():
    op.drop_column("jobs", "last_checked_at")
    op.drop_column("jobs", "work_arrangement")
    op.drop_column("jobs", "application_deadline")
    op.drop_column("jobs", "application_url")
    op.drop_column("jobs", "source_name")
    op.drop_column("jobs", "source_type")
