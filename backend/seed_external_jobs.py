from datetime import date, datetime, timezone

from app import create_app
from app.extensions import db
from app.models import Job


EXTERNAL_JOBS = [
    {
        "title": "Graduate / Junior Software Developer",
        "company": "Saolix Group",
        "description": (
            "Saolix Group is seeking a graduate or junior software developer "
            "to help build and improve its software products. The role involves "
            "developing features using React, FastAPI, Python, Go and PostgreSQL, "
            "writing tests, fixing bugs, documenting work and participating "
            "in code reviews. Applicants should have a degree or diploma in "
            "Computer Science, Software Engineering or a related field, or "
            "equivalent self-taught experience. Graduates and interns are welcome. "
            "Applicants should have up to two years of development experience "
            "and be based in Nairobi or able to relocate. "
            "To apply, email your CV and links to your GitHub or projects to "
            "info@saolix.com."
        ),
        "location": "Nairobi, Kenya",
        "job_type": "Contract",
        "salary_range": "Discussed with shortlisted candidates",
        "skills": [
            "JavaScript",
            "React",
            "Python",
            "FastAPI",
            "Go",
            "PostgreSQL",
            "SQL",
            "REST APIs",
            "Software Testing",
            "Git"
        ],
        "source_type": "external",
        "source_name": "Saolix Group Careers",
        "application_url": (
            "https://saolixgroup.com/careers/junior-software-developer/"
        ),
        "application_deadline": date(2026, 11, 30),
        "work_arrangement": "On-site",
    }
]


def seed_jobs():
    app = create_app()

    with app.app_context():
        added = 0
        skipped = 0

        for item in EXTERNAL_JOBS:
            existing = Job.query.filter_by(
                application_url=item["application_url"]
            ).first()

            if existing:
                print(f"Already exists: {item['title']}")
                skipped += 1
                continue

            job = Job(
                employer_id=None,
                title=item["title"],
                company=item["company"],
                description=item["description"],
                location=item["location"],
                job_type=item["job_type"],
                salary_range=item["salary_range"],
                skills=item["skills"],
                is_verified=True,
                source_type=item["source_type"],
                source_name=item["source_name"],
                application_url=item["application_url"],
                application_deadline=item["application_deadline"],
                work_arrangement=item["work_arrangement"],
                last_checked_at=datetime.now(timezone.utc),
            )

            db.session.add(job)
            added += 1
            print(f"Prepared: {item['title']}")

        try:
            db.session.commit()
            print(f"\nFinished. Added: {added}, already present: {skipped}")
        except Exception:
            db.session.rollback()
            raise


if __name__ == "__main__":
    seed_jobs()
