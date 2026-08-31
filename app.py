from flask import Flask, render_template, request, jsonify
import sqlite3
app = Flask(__name__)

DATABASE = "career_tracker.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS applications(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            role TEXT NOT NULL,
            location TEXT,
            status TEXT NOT NULL DEFAULT 'Applied',
            application_date TEXT NOT NULL,
            job_url TEXT,
            notes TEXT
        )
    """)
    try: 
         conn.execute(" ALTER TABLE applications ADD COLUMN deadline TEXT")
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/applications", methods=["GET"])
def get_applications():
    conn = get_db_connection()
    applications = conn.execute("""
            SELECT * FROM applications ORDER BY application_date DESC
    """).fetchall()

    conn.close()

    return jsonify([
        dict(application)
        for application in applications
    ])

@app.route("/api/applications", methods=["POST"])
def create_application():
    data = request.get_json()

    company = data.get("company")
    role = data.get("role")
    location = data.get("location")
    status = data.get("status", "Applied")
    application_date = data.get("application_date")
    deadline = data.get("deadline")
    job_url = data.get("job_url")
    notes = data.get("notes")

    conn = get_db_connection()

    cursor = conn.execute("""
        INSERT INTO applications(company,role,location,status,application_date,job_url,notes,deadline) VALUES(?,?,?,?,?,?,?,?)""",
        (company,role,location,status,application_date,job_url,notes,deadline))

    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({
        "message": "Application created",
        "id": new_id
    }), 201

@app.route("/api/applications/<int:id>", methods=["DELETE"])
def delete_application(id):
    conn = get_db_connection()
    conn.execute("DELETE FROM applications WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Application deleted"})

@app.route("/api/applications/<int:id>", methods=["PUT"])
def update_applications(id):
    data = request.get_json()
    conn = get_db_connection()
    conn.execute("""
        UPDATE applications SET company=?, role=?, location=?, status?, application_date=?, job_url=?, notes=? WHERE id=?
    """,
    (data["company"], data["role"], data["location"], data["status"], data["application_date"], data["job_url"], data["notes"], id
    ))
    conn.commit()
    conn.close()
    return jsonify({"message": "Application updated"})

if __name__ == "__main__":
    init_db()
    #alter_db()
    app.run(debug=True)
