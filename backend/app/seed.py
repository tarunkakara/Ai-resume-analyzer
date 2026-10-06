from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import User, JobDescription
from .auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 1. Create Default Admin user if not exists
        admin_user = db.query(User).filter(User.email == "admin.mavericks@gmail.com").first()
        if not admin_user:
            admin_user = User(
                full_name="System Admin",
                email="admin.mavericks@gmail.com",
                password_hash=hash_password("Admin@12345"),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

        # 2. Create Default Recruiter user if not exists
        recruiter_user = db.query(User).filter(User.email == "recruiter.tech@gmail.com").first()
        if not recruiter_user:
            recruiter_user = User(
                full_name="Senior Tech Recruiter",
                email="recruiter.tech@gmail.com",
                password_hash=hash_password("Recruiter@12345"),
                role="recruiter"
            )
            db.add(recruiter_user)
            db.commit()
            db.refresh(recruiter_user)

        # 3. Create Benchmark Job Descriptions
        existing_jds = db.query(JobDescription).count()
        if existing_jds == 0:
            jds = [
                JobDescription(
                    user_id=recruiter_user.id,
                    title="Senior Python & AI/ML Engineer",
                    department="Artificial Intelligence",
                    raw_text="""We are looking for a Senior Python & AI/ML Engineer.
Key Requirements:
- Expert proficiency in Python, FastAPI, and Flask.
- Hands-on experience with Machine Learning, NLP, Scikit-learn, TensorFlow, PyTorch, Pandas, and NumPy.
- Strong knowledge of PostgreSQL, SQLite, Redis, Docker, Kubernetes, AWS, and Git.
- Demonstrated experience in building REST APIs, Microservices, and CI/CD pipelines.
- Bachelor's or Master's degree in Computer Science or related field.""",
                    required_skills=["Python", "Fastapi", "Flask", "Machine Learning", "Nlp", "Scikit-Learn", "Tensorflow", "Pytorch", "Pandas", "Numpy", "Postgresql", "Docker", "Aws", "Git"],
                    min_experience="2-5 years"
                ),
                JobDescription(
                    user_id=recruiter_user.id,
                    title="Full Stack React & Node Developer",
                    department="Web Engineering",
                    raw_text="""Join our team as a Full Stack React & Node Developer.
Required Qualifications:
- Expertise in JavaScript, TypeScript, React.js, Next.js, Node.js, and Express.
- Experience with HTML5, CSS3, Tailwind CSS, REST APIs, GraphQL, and MongoDB.
- Version control with Git/GitHub and agile project management tools.
- Passion for responsive web design, performance optimization, and clean code.""",
                    required_skills=["Javascript", "Typescript", "React", "Next.Js", "Node.Js", "Express", "Html", "Css", "Tailwind", "Rest Api", "Mongodb", "Git"],
                    min_experience="1-3 years"
                ),
                JobDescription(
                    user_id=recruiter_user.id,
                    title="Data Analyst & Visualization Specialist",
                    department="Analytics",
                    raw_text="""We are hiring a Data Analyst to translate data into business insights.
Key Responsibilities:
- Perform data extraction, cleaning, and statistical modeling using Python, SQL, and Pandas.
- Create interactive dashboards in Power BI and Tableau.
- Perform exploratory data analysis and predictive modeling using Scikit-Learn.
- Excellent communication and presentation skills.""",
                    required_skills=["Python", "Sql", "Pandas", "Power Bi", "Tableau", "Statistics", "Scikit-Learn", "Data Analysis", "Communication"],
                    min_experience="0-2 years"
                )
            ]
            db.add_all(jds)
            db.commit()
            print("Successfully seeded initial job descriptions!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
