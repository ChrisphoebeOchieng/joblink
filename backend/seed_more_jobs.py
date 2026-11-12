from datetime import date, datetime, timezone

from app import create_app
from app.extensions import db
from app.models import Job


NEW_JOBS = [
    {
        "title": "Graduate Trainee: Software Engineering",
        "company": "Cellulant Corporation",
        "description": (
            "Graduate software engineering opportunity in Nairobi. "
            "Work with experienced engineers to design, develop, test and "
            "maintain software applications. Participate in an agile "
            "engineering environment, document code and learn through "
            "on-the-job mentorship. Suitable for early-career software "
            "engineering candidates."
        ),
        "location": "Nairobi, Kenya",
        "job_type": "Graduate Trainee",
        "salary_range": "Not disclosed",
        "skills": ["Software Engineering", "Programming", "Testing", "Git", "Agile", "Documentation"],
        "source_name": "KaziKit",
        "application_url": "https://www.kazikit.co.ke/jobs/4edb7d79-8daf-413e-93e8-86b587867100",
        "application_deadline": date(2026, 11, 19),
        "work_arrangement": "Not specified",
    },
    {
        "title": "Internship Programme 2026",
        "company": "Kobby Technologies",
        "description": (
            "Six-month internship programme in Nairobi, starting 14 December "
            "2026. Opportunities include finance, data centre operations, "
            "IT support and office administration. Interns gain practical "
            "experience, mentorship, exposure to live projects, and a "
            "certificate of completion. Applicants should be students or "
            "recent graduates. Apply with a CV, short cover letter and "
            "academic transcript, indicating the preferred department."
        ),
        "location": "Nairobi, Kenya",
        "job_type": "Internship",
        "salary_range": "Not disclosed",
        "skills": ["IT Support", "Finance", "Data Centre Operations", "Administration", "Communication", "Problem Solving"],
        "source_name": "Jobs in Kenya",
        "application_url": "https://www.jobsinkenya.co.ke/job/internship-programme-kobby-technologies/",
        "application_deadline": date(2026, 11, 25),
        "work_arrangement": "On-site",
    },
    {
        "title": "Associate Financial Analyst - Intern",
        "company": "Tatu City",
        "description": (
            "Finance internship supporting analysis of business opportunities "
            "and real estate development projects. Responsibilities include "
            "assisting with financial and commercial analysis, maintaining "
            "financial models, preparing management presentations and "
            "supporting strategy development. Useful experience for candidates "
            "interested in finance, accounting and financial modelling."
        ),
        "location": "Tatu City, Kiambu County, Kenya",
        "job_type": "Internship",
        "salary_range": "Not disclosed",
        "skills": ["Finance", "Accounting", "Financial Modelling", "Microsoft Excel", "Analysis", "Communication"],
        "source_name": "ZeroXP Careers",
        "application_url": "https://zeroxp.careers/jobs/associate-financial-analyst-intern-tatucity-d11f6b38-4c61-440a-a5f7-771d90fbbad7",
        "application_deadline": None,
        "work_arrangement": "On-site",
    },
    {
        "title": "Digital Marketing Intern",
        "company": "LOLC Kenya Microfinance Bank",
        "description": (
            "Support digital marketing activities for financial products and "
            "services. Responsibilities include managing social media platforms, "
            "preparing content calendars, creating graphics, supporting paid "
            "advertising campaigns and analysing campaign performance. "
            "Applicants should be pursuing or have recently completed a "
            "diploma or degree in marketing, communications, IT, design or "
            "a related field."
        ),
        "location": "Nairobi, Kenya",
        "job_type": "Internship",
        "salary_range": "Not disclosed",
        "skills": ["Digital Marketing", "Social Media", "Graphic Design", "Canva", "Google Ads", "Meta Ads", "Analytics"],
        "source_name": "Fuzu",
        "application_url": "https://www.fuzu.com/kenya/jobs/digital-marketing-intern-lolc-kenya-microfinance-bank",
        "application_deadline": date(2026, 11, 29),
        "work_arrangement": "On-site",
    },
    {
        "title": "E-Commerce Assistant Internship",
        "company": "Vivo Fashion Group",
        "description": (
            "Entry-level internship supporting digital marketing and online "
            "sales operations. The role offers practical experience in "
            "e-commerce, campaign delivery, online sales, marketing analytics "
            "and the use of AI tools to improve brand visibility and engagement. "
            "The employer seeks candidates with good communication, organisation "
            "and an interest in fashion and e-commerce."
        ),
        "location": "Nairobi, Kenya",
        "job_type": "Internship",
        "salary_range": "Not disclosed",
        "skills": ["E-Commerce", "Digital Marketing", "Graphic Design", "AI Tools", "Marketing Analytics", "Shopify", "Communication"],
        "source_name": "Vivo Fashion Group Careers",
        "application_url": "https://vivofashiongroup.com/pages/careers",
        "application_deadline": date(2026, 11, 17),
        "work_arrangement": "On-site",
    },
    {
        "title": "Customer Support Intern - Regional Service Centers",
        "company": "Sun King",
        "description": (
            "Customer service internship based at a regional service centre "
            "in Kenya. The intern assists customers with after-sales enquiries, "
            "product repairs and replacements, receives and registers faulty "
            "units, performs basic troubleshooting, maintains records and "
            "coordinates with technicians and shop teams. A relevant bachelor's "
            "degree and strong communication and customer service skills are "
            "listed among the requirements."
        ),
        "location": "Kenya - Regional Service Centres",
        "job_type": "Internship",
        "salary_range": "Not disclosed",
        "skills": ["Customer Service", "Communication", "Troubleshooting", "After-Sales Support", "Record Keeping", "Coordination"],
        "source_name": "Sun King Careers",
        "application_url": "https://sunking.pinpointhq.com/en/postings/794d87cd-3fae-42e8-b0b0-40750412c3d2",
        "application_deadline": None,
        "work_arrangement": "On-site",
    },
    {
        "title": "Internship Programme",
        "company": "Coca-Cola Beverages Africa",
        "description": (
            "Three-month internship programme in Kenya with opportunities "
            "across business, accounting and finance, data science, engineering, "
            "environmental science, human resources, IT, procurement and supply "
            "chain. The programme is intended for candidates seeking practical "
            "experience and mentorship. Review the original listing for the "
            "specific discipline requirements and application instructions."
        ),
        "location": "Kenya",
        "job_type": "Internship",
        "salary_range": "Not disclosed",
        "skills": ["Business", "Finance", "Data Science", "Engineering", "IT", "Human Resources", "Supply Chain"],
        "source_name": "CampusBiz Careers",
        "application_url": "https://campusbiz.co.ke/careers/vacancy/990950-ccba-kenya-internship-program/",
        "application_deadline": date(2026, 11, 16),
        "work_arrangement": "Not specified",
    },
]


def seed_jobs():
    app = create_app()

    with app.app_context():
        added = 0
        skipped = 0

        for item in NEW_JOBS:
            existing = Job.query.filter_by(
                application_url=item["application_url"]
            ).first()

            if existing:
                print(f"Skipped duplicate: {item['title']}")
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
                source_type="external",
                source_name=item["source_name"],
                application_url=item["application_url"],
                application_deadline=item["application_deadline"],
                work_arrangement=item["work_arrangement"],
                last_checked_at=datetime.now(timezone.utc),
            )

            db.session.add(job)
            added += 1
            print(f"Added: {item['title']} - {item['company']}")

        try:
            db.session.commit()
            print(f"\nFinished. Added: {added}; skipped: {skipped}")
            print("Total jobs:", Job.query.count())
            print("External jobs:", Job.query.filter_by(source_type="external").count())
        except Exception:
            db.session.rollback()
            raise


if __name__ == "__main__":
    seed_jobs()
