from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import psycopg2.extras
import requests
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# =====================================================================
# ⚙️ SYSTEM BOOTSTRAP: CUSTOM .ENV LOADER
# =====================================================================
def load_dotenv():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dotenv_path = os.path.join(base_dir, ".env")
    if os.path.exists(dotenv_path):
        with open(dotenv_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    os.environ[key] = val

load_dotenv()

app = FastAPI(title="QuirkAcademy Anime Counseling API", version="3.0")

# --- ENABLE CORS (Crucial for frontend connection) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- YOUR GEMINI API KEY ---
# We prioritize an environment variable "GEMINI_API_KEY", otherwise fallback to the hardcoded value below.
GEMINI_KEY = "YOUR_KEY_HERE"

def generate_ai_report(first_name, last_name, codename, stream, hobbies, assigned_track):
    # Choose key: environment variable or hardcoded config
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "":
        if GEMINI_KEY and GEMINI_KEY != "YOUR_KEY_HERE":
            api_key = GEMINI_KEY
        else:
            return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    prompt = f"""
    Act as the Chief AI Quirks & Talents Counselor at UA High Academy. Write an elite, high-energy, parent-friendly tactical career breakdown evaluation report for Candidate {first_name} {last_name} (Alias: '{codename}').
    Their academic focus stream is: {stream}
    Their hobbies and active passions are: {hobbies}
    Assigned Academy Track: {assigned_track}

    The report must:
    1. Explain to their parents in an incredibly enthusiastic, tactical, hero-analysis style (like Izuku Midoriya's hero notebooks) why their academic focus combined with their hobbies unlocks a highly specialized, unique 'Quirk' for real-world professional leadership.
    2. Bridge what the parents want (solid, prestigious, high-paying career guidance) with high-energy anime hero flavor.
    3. Be encouraging, highly motivating, and end with a roaring 'Plus Ultra!'.
    4. Keep the length to about 100-150 words. Do NOT use markdown headers, bold headers, or lists; write it as a beautiful, cohesive paragraph.
    """
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 250
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=8)
        if response.status_code == 200:
            res_json = response.json()
            report_text = res_json['candidates'][0]['content']['parts'][0]['text']
            return report_text.strip()
    except Exception as e:
        print(f"Gemini API call failed, falling back: {e}")
    return None

# --- INITIALIZE COUNSELING DATABASE ---

def get_db_connection():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise Exception('DATABASE_URL environment variable is missing!')
    conn = psycopg2.connect(db_url)
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS counseled_students (
            codename TEXT PRIMARY KEY,
            first_name TEXT,
            last_name TEXT,
            dob TEXT,
            stream TEXT,
            hobbies TEXT,
            assigned_track TEXT,
            parent_report TEXT,
            aptitude_score INTEGER DEFAULT 0,
            secret_pass TEXT,
            logic INTEGER DEFAULT 0,
            creativity INTEGER DEFAULT 0,
            leadership INTEGER DEFAULT 0,
            grit INTEGER DEFAULT 0
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sent_emails (
            id SERIAL PRIMARY KEY,
            recipient TEXT,
            subject TEXT,
            body_html TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contact_messages (
            id SERIAL PRIMARY KEY,
            codename TEXT,
            subject TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    for col in ["secret_pass", "logic", "creativity", "leadership", "grit"]:
        try:
            cursor.execute(f"ALTER TABLE counseled_students ADD COLUMN {col} INTEGER DEFAULT 0")
            conn.commit()
        except Exception:
            pass
    for col in ["vault_notes", "parent_name", "parent_email", "booking_date", "booking_time", "payment_status"]:
        try:
            cursor.execute(f"ALTER TABLE counseled_students ADD COLUMN {col} TEXT DEFAULT ''")
            conn.commit()
        except Exception:
            pass
    for col in ["enrolled_courses", "completed_courses", "claimed_rewards"]:
        try:
            cursor.execute(f"ALTER TABLE counseled_students ADD COLUMN {col} TEXT DEFAULT '[]'")
            conn.commit()
        except Exception:
            pass
    for col in ["shipping_address"]:
        try:
            cursor.execute(f"ALTER TABLE counseled_students ADD COLUMN {col} TEXT DEFAULT '{{}}'")
            conn.commit()
        except Exception:
            pass
            
    # Auto-repair migration for already completed students with empty directives
    try:
        cursor.execute("SELECT codename, logic, creativity, leadership, grit, vault_notes FROM counseled_students WHERE aptitude_score > 0")
        completed = cursor.fetchall()
        for r in completed:
            c_name, logic_val, creat_val, lead_val, grit_val, v_notes = r
            if not v_notes or v_notes.strip() == "":
                metrics = {
                    "Logic": logic_val or 0,
                    "Creativity": creat_val or 0,
                    "Leadership": lead_val or 0,
                    "Grit": grit_val or 0
                }
                highest_metric = max(metrics, key=metrics.get) if any(metrics.values()) else "Logic"
                
                if highest_metric == "Logic":
                    notes = (
                        "Your diagnostic vectors demonstrate exceptional logical synthesis and high-performance precision. "
                        "Recommended Career Action Plan: Prioritize backend systems engineering, distributed database scaling, and DevOps orchestration. "
                        "Focus on establishing structural stability in high-throughput, real-time cloud environments. "
                        "To maximize team productivity, practice delegating visual and user-facing design responsibilities to auxiliary creative designers under your guidance."
                    )
                elif highest_metric == "Creativity":
                    notes = (
                        "Your diagnostics reveal highly advanced conceptual creativity and abstract, multi-dimensional problem-solving frameworks. "
                        "Recommended Career Action Plan: Anchor your path in corporate brand identity, high-fidelity UI/UX visual architecture, and digital illustration campaigns. "
                        "Focus on crafting human-centered designs that cultivate client engagement. "
                        "Ensure that you collaborate with analytical engineering peers to optimize database boundaries and functional logic structures."
                    )
                elif highest_metric == "Leadership":
                    notes = (
                        "You possess dominant crisis leadership vectors and strategic, cross-functional project command. "
                        "Recommended Career Action Plan: Scale your career toward operations management, constitutional legal systems, or executive consulting. "
                        "Focus on building multi-disciplinary, high-synergy engineering squads and optimizing material/service resource pipelines during rapid organizational growth."
                    )
                else:
                    notes = (
                        "Your metrics display absolute personal resilience, deep emotional anchoring, and outstanding social grit. "
                        "Recommended Career Action Plan: Excel in high-pressure team management, product ownership, or senior user-experience consulting. "
                        "Your exceptional trait is customer empathy and team motivation. "
                        "Ensure that you collaborate with data-driven system analysts to establish objective logical KPIs alongside your human-centered methods."
                    )
                cursor.execute("UPDATE counseled_students SET vault_notes = %s WHERE codename = %s", (notes, c_name))
        conn.commit()
    except Exception as e:
        print(f" [MIGRATION EXCEPTION] Failed to run automated vault repair: {e}")
        
    conn.close()

init_db()

@app.get("/")
def home():
    return {
        "status": "online",
        "agency": "QuirkAcademy Anime Counseling Agency",
        "version": "3.0",
        "motto": "Plus Ultra! ⚡",
        "documentation": "Visit /docs for the interactive API manual."
    }

# --- COUNSELING DATA STRUCTURES ---
class RegisterStudent(BaseModel):
    codename: str
    first_name: str
    last_name: str
    dob: str
    stream: str
    hobbies: str
    secret_pass: str
    parent_name: str = ""
    parent_email: str = ""


class LoginRequest(BaseModel):
    username: str
    password: str

class UpdateAptitude(BaseModel):
    codename: str
    aptitude_score: int  # e.g., overall score from an aptitude/personality test
    logic: int = 0
    creativity: int = 0
    leadership: int = 0
    grit: int = 0

class UpdateVaultNotes(BaseModel):
    codename: str
    vault_notes: str

class EnrollRequest(BaseModel):
    codename: str
    course_id: str

class BookConsultation(BaseModel):
    codename: str
    parent_name: str
    parent_email: str
    booking_date: str
    booking_time: str
    payment_status: str = 'unpaid'

class RescheduleConsultation(BaseModel):
    codename: str
    new_date: str
    new_time: str

class CompleteCourseRequest(BaseModel):
    codename: str
    course_id: str

class ClaimRewardRequest(BaseModel):
    codename: str
    reward_id: str
    address: dict

# ==========================================
# PHASE 1 ENDPOINT: THE SORTING & AI ANALYSIS
# ==========================================
@app.post("/api/phase1/register")
def register_student(student: RegisterStudent, background_tasks: BackgroundTasks):
    # 1. Determine tactical track based on their chosen Stream
    stream_lower = student.stream.lower()
    if "design" in stream_lower or "art" in stream_lower or "creative" in stream_lower:
        assigned_track = "The Strategy & Design Guild"
    elif "management" in stream_lower or "business" in stream_lower or "commerce" in stream_lower or "upsc" in stream_lower:
        assigned_track = "The Grand Commander Force (Management/Civil Services)"
    else:
        assigned_track = "The Prime Tech & Support Course (Engineering)"

    # 2. Try generating parent-friendly AI Counseling Report Text with Gemini, fallback if not configured
    ai_report = generate_ai_report(
        student.first_name, 
        student.last_name, 
        student.codename, 
        student.stream, 
        student.hobbies, 
        assigned_track
    )

    if ai_report:
        parent_report = ai_report
    else:
        parent_report = (
            f"Official Evaluation for Candidate {student.first_name} {student.last_name}. "
            f"Our diagnosis shows that their baseline academic focus in {student.stream} acting alongside their active "
            f"passion for '{student.hobbies}' unlocks an exceptional 'Quirk' for specialized problem-solving! "
            f"We have allocated them to {assigned_track}, where their natural analytical traits will scale directly "
            f"into high-value, real-world professional leadership. Their potential is truly Plus Ultra!"
        )

    # 3. Save to database backend
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO counseled_students (
            codename, first_name, last_name, dob, stream, hobbies, assigned_track, parent_report, aptitude_score, secret_pass, parent_name, parent_email
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 0, %s, %s, %s)
    """, (
        student.codename, 
        student.first_name, 
        student.last_name, 
        student.dob, 
        student.stream, 
        student.hobbies, 
        assigned_track, 
        parent_report,
        student.secret_pass,
        student.parent_name,
        student.parent_email
    ))
    conn.commit()
    conn.close()

    # 4. Trigger real-time parent registration email notification
    if student.parent_email:
        background_tasks.add_task(
            send_parent_registration_email_task,
            parent_name=student.parent_name,
            parent_email=student.parent_email,
            codename=student.codename,
            first_name=student.first_name,
            last_name=student.last_name,
            stream=student.stream,
            assigned_track=assigned_track,
            parent_report=parent_report
        )

    return {
        "status": "success",
        "codename": student.codename,
        "full_name": f"{student.first_name} {student.last_name}",
        "allocated_department": assigned_track,
        "counseling_summary": parent_report,
        "initial_aptitude": 0
    }

@app.get("/api/phase1/student/{codename}")
def get_student(codename: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT codename, first_name, last_name, dob, stream, hobbies, assigned_track, parent_report, aptitude_score, secret_pass, logic, creativity, leadership, grit, enrolled_courses, parent_name, parent_email, booking_date, booking_time, completed_courses, claimed_rewards, shipping_address, payment_status
        FROM counseled_students WHERE codename = %s
    """, (codename,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Student profile not found in archives.")
        
    import json
    enrolled_courses_raw = row[14] if len(row) > 14 and row[14] is not None else "[]"
    completed_courses_raw = row[19] if len(row) > 19 and row[19] is not None else "[]"
    claimed_rewards_raw = row[20] if len(row) > 20 and row[20] is not None else "[]"
    shipping_address_raw = row[21] if len(row) > 21 and row[21] is not None else "{}"

    try:
        enrolled_courses = json.loads(enrolled_courses_raw)
    except Exception:
        enrolled_courses = []
    
    try:
        completed_courses = json.loads(completed_courses_raw)
    except Exception:
        completed_courses = []
        
    try:
        claimed_rewards = json.loads(claimed_rewards_raw)
    except Exception:
        claimed_rewards = []
        
    try:
        shipping_address = json.loads(shipping_address_raw)
    except Exception:
        shipping_address = {}

    return {
        "codename": row[0],
        "first_name": row[1],
        "last_name": row[2],
        "full_name": f"{row[1]} {row[2]}",
        "dob": row[3],
        "stream": row[4],
        "hobbies": row[5],
        "allocated_department": row[6],
        "counseling_summary": row[7],
        "aptitude_score": row[8],
        "secret_pass": row[9],
        "logic": row[10] if row[10] is not None else 0,
        "creativity": row[11] if row[11] is not None else 0,
        "leadership": row[12] if row[12] is not None else 0,
        "grit": row[13] if row[13] is not None else 0,
        "enrolled_courses": enrolled_courses,
        "parent_name": row[15] if row[15] is not None else "",
        "parent_email": row[16] if row[16] is not None else "",
        "booking_date": row[17] if row[17] is not None else "",
        "booking_time": row[18] if row[18] is not None else "",
        "completed_courses": completed_courses,
        "claimed_rewards": claimed_rewards,
        "shipping_address": shipping_address,
        "payment_status": row[22] if len(row) > 22 and row[22] is not None else "unpaid"
    }

@app.get("/api/phase1/students")
def get_students():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT codename, first_name, last_name, stream, assigned_track, aptitude_score, parent_name, parent_email, booking_date, booking_time, completed_courses, claimed_rewards, shipping_address, payment_status FROM counseled_students")
    rows = cursor.fetchall()
    conn.close()
    
    import json
    students_list = []
    for r in rows:
        c_courses = []
        c_rewards = []
        s_addr = {}
        try:
            if r[10]: c_courses = json.loads(r[10])
        except: pass
        try:
            if r[11]: c_rewards = json.loads(r[11])
        except: pass
        try:
            if r[12]: s_addr = json.loads(r[12])
        except: pass
        
        students_list.append({
            "codename": r[0],
            "first_name": r[1],
            "last_name": r[2],
            "full_name": f"{r[1]} {r[2]}",
            "stream": r[3],
            "allocated_department": r[4],
            "aptitude_score": r[5],
            "parent_name": r[6] if r[6] is not None else "",
            "parent_email": r[7] if r[7] is not None else "",
            "booking_date": r[8] if r[8] is not None else "",
            "booking_time": r[9] if r[9] is not None else "",
            "completed_courses": c_courses,
            "claimed_rewards": c_rewards,
            "shipping_address": s_addr,
            "payment_status": r[13] if len(r) > 13 and r[13] is not None else "unpaid"
        })
    return students_list

@app.post("/api/login")
def login_user(req: LoginRequest):
    u_lower = req.username.strip().lower()
    
    # Pre-configured core fallback credentials
    if u_lower == "heroagent" and req.password == "PlusUltra":
        return {"status": "success", "message": "UA Access Granted.", "role": "admin", "codename": "HeroAgent"}
    if u_lower == "admin" and req.password == "admin":
        return {"status": "success", "message": "UA Access Granted.", "role": "admin", "codename": "admin"}
        
    # Check Database (Case-Insensitive matching on Student Codename)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT secret_pass, codename FROM counseled_students WHERE LOWER(codename) = LOWER(%s)", (req.username.strip(),))
    row = cursor.fetchone()
    conn.close()
    
    if row and row[0] == req.password:
        return {"status": "success", "message": "UA Access Granted.", "role": "student", "codename": row[1]}
        
    raise HTTPException(status_code=401, detail="Invalid Hero credentials. Check codename or secret pass.")

# ==========================================
# PHASE 2 ENDPOINT: UPDATE APTITUDE METRICS
# ==========================================
@app.post("/api/phase2/update-aptitude")
def update_aptitude(data: UpdateAptitude):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT vault_notes FROM counseled_students WHERE codename = %s", (data.codename,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Student profile not found in Academy archives.")
        
    existing_notes = row[0] if row[0] is not None else ""
    
    # Generate directives text based on highest score
    metrics = {
        "Logic": data.logic,
        "Creativity": data.creativity,
        "Leadership": data.leadership,
        "Grit": data.grit
    }
    highest_metric = max(metrics, key=metrics.get)
    
    if highest_metric == "Logic":
        generated_notes = (
            "Your diagnostic vectors demonstrate exceptional logical synthesis and high-performance precision. "
            "Recommended Career Action Plan: Prioritize backend systems engineering, distributed database scaling, and DevOps orchestration. "
            "Focus on establishing structural stability in high-throughput, real-time cloud environments. "
            "To maximize team productivity, practice delegating visual and user-facing design responsibilities to auxiliary creative designers under your guidance."
        )
    elif highest_metric == "Creativity":
        generated_notes = (
            "Your diagnostics reveal highly advanced conceptual creativity and abstract, multi-dimensional problem-solving frameworks. "
            "Recommended Career Action Plan: Anchor your path in corporate brand identity, high-fidelity UI/UX visual architecture, and digital illustration campaigns. "
            "Focus on crafting human-centered designs that cultivate client engagement. "
            "Ensure that you collaborate with analytical engineering peers to optimize database boundaries and functional logic structures."
        )
    elif highest_metric == "Leadership":
        generated_notes = (
            "You possess dominant crisis leadership vectors and strategic, cross-functional project command. "
            "Recommended Career Action Plan: Scale your career toward operations management, constitutional legal systems, or executive consulting. "
            "Focus on building multi-disciplinary, high-synergy engineering squads and optimizing material/service resource pipelines during rapid organizational growth."
        )
    else:
        generated_notes = (
            "Your metrics display absolute personal resilience, deep emotional anchoring, and outstanding social grit. "
            "Recommended Career Action Plan: Excel in high-pressure team management, product ownership, or senior user-experience consulting. "
            "Your exceptional trait is customer empathy and team motivation. "
            "Ensure that you collaborate with data-driven system analysts to establish objective logical KPIs alongside your human-centered methods."
        )
        
    if not existing_notes or existing_notes.strip() == "":
        cursor.execute("""
            UPDATE counseled_students 
            SET aptitude_score = %s, logic = %s, creativity = %s, leadership = %s, grit = %s, vault_notes = %s 
            WHERE codename = %s
        """, (data.aptitude_score, data.logic, data.creativity, data.leadership, data.grit, generated_notes, data.codename))
    else:
        cursor.execute("""
            UPDATE counseled_students 
            SET aptitude_score = %s, logic = %s, creativity = %s, leadership = %s, grit = %s 
            WHERE codename = %s
        """, (data.aptitude_score, data.logic, data.creativity, data.leadership, data.grit, data.codename))
        
    conn.commit()
    conn.close()
    
    return {"status": "success", "codename": data.codename, "updated_aptitude_score": f"{data.aptitude_score}%"}

@app.post("/api/phase2/enroll")
def enroll_course(data: EnrollRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT enrolled_courses FROM counseled_students WHERE codename = %s", (data.codename,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Student profile not found in Academy archives.")
        
    import json
    try:
        enrolled = json.loads(row[0]) if row[0] else []
    except Exception:
        enrolled = []
        
    if data.course_id not in enrolled:
        enrolled.append(data.course_id)
        cursor.execute("""
            UPDATE counseled_students 
            SET enrolled_courses = %s 
            WHERE codename = %s
        """, (json.dumps(enrolled), data.codename))
        conn.commit()
        
    conn.close()
    return {"status": "success", "codename": data.codename, "enrolled_courses": enrolled}

# ==========================================
# PHASE 3 ENDPOINT: REPORT CARD VAULT
# ==========================================
@app.get("/api/phase3/vault/{codename}")
def check_rewards(codename: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT assigned_track, aptitude_score, vault_notes, 
               first_name, last_name, stream, hobbies, parent_report, 
               logic, creativity, leadership, grit,
               parent_name, parent_email, booking_date, booking_time, enrolled_courses, payment_status 
        FROM counseled_students WHERE codename = %s
    """, (codename,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    track, score, vault_notes, first_name, last_name, stream, hobbies, parent_report, logic, creativity, leadership, grit, parent_name, parent_email, booking_date, booking_time, enrolled_courses_raw, payment_status = row
    
    import json
    try:
        enrolled_courses = json.loads(enrolled_courses_raw) if enrolled_courses_raw else []
    except Exception:
        enrolled_courses = []

    # Unlock special perks based on counseling progress scores
    perks = {
        "career_manifesto_pdf": "🔓 UNLOCKED! Code: FUTUREHERO" if score > 0 else "🔒 LOCKED (Complete Aptitude Test)",
        "premium_parent_consultation": "🔓 UNLOCKED! Code: SMASH100" if score > 0 else "🔒 LOCKED (Complete Aptitude Test)"
    }
    
    return {
        "codename": codename,
        "first_name": first_name,
        "last_name": last_name,
        "full_name": f"{first_name} {last_name}",
        "stream": stream,
        "hobbies": hobbies,
        "allocated_department": track,
        "assessment_completion": f"{score}%",
        "counseling_summary": parent_report,
        "logic": logic if logic is not None else 0,
        "creativity": creativity if creativity is not None else 0,
        "leadership": leadership if leadership is not None else 0,
        "grit": grit if grit is not None else 0,
        "vault_notes": vault_notes if vault_notes is not None else "",
        "parent_name": parent_name if parent_name is not None else "",
        "parent_email": parent_email if parent_email is not None else "",
        "booking_date": booking_date if booking_date is not None else "",
        "booking_time": booking_time if booking_time is not None else "",
        "payment_status": payment_status if payment_status is not None else "unpaid",
        "unlocked_perks": perks,
        "enrolled_courses": enrolled_courses
    }

@app.post("/api/phase3/vault/update")
def update_vault_notes(data: UpdateVaultNotes):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT codename FROM counseled_students WHERE codename = %s", (data.codename,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Student profile not found in Academy archives.")
        
    cursor.execute("""
        UPDATE counseled_students 
        SET vault_notes = %s 
        WHERE codename = %s
    """, (data.vault_notes, data.codename))
    conn.commit()
    conn.close()
    
    return {"status": "success", "codename": data.codename, "vault_notes": data.vault_notes}

def send_parent_registration_email_task(parent_name: str, parent_email: str, codename: str, first_name: str, last_name: str, stream: str, assigned_track: str, parent_report: str):
    html_content = f"""
    <html>
      <body style="margin: 0; padding: 0; font-family: 'Space Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f0f12; color: #ffffff;">
        <div style="max-width: 600px; margin: 20px auto; background: #13131a; border: 2px solid #00FF66; border-radius: 12px; overflow: hidden; box-shadow: 0 0 25px rgba(0, 255, 102, 0.25);">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #0a3200 0%, #13131a 100%); padding: 35px 30px; border-bottom: 2px solid #00FF66; text-align: center;">
            <h1 style="color: #00FF66; font-size: 30px; margin: 0; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">UA HIGH ACADEMY</h1>
            <p style="color: #888888; font-size: 11px; margin: 5px 0 0 0; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Official Sorting & Quirk Assessment Division</p>
          </div>
          
          <!-- Content Body -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #e2e2e8; margin-top: 0;">
              Greetings Agent <strong>{parent_name}</strong>,
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #a0a0ab;">
              We have completed our high-level cognitive sorting metrics and quirk-to-career calibrations for your child. Their dossier records have been committed to the secure UA High Academy archives. Below is their official evaluation report:
            </p>
            
            <!-- Student Specs Dossier Box -->
            <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid #333339; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #00FF66; margin: 0 0 15px 0; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; border-bottom: 1px dashed #333339; padding-bottom: 5px;">
                SORTED CANDIDATE SPECIFICATIONS
              </h3>
              <table style="width: 100%; font-size: 14px; color: #e2e2e8; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #888888; width: 40%;"><strong>Full Name:</strong></td>
                  <td style="padding: 6px 0; font-weight: bold;">{first_name} {last_name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #888888;"><strong>Hero Codename:</strong></td>
                  <td style="padding: 6px 0; font-weight: bold; color: #ff9900;">{codename.upper()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #888888;"><strong>Academic Stream:</strong></td>
                  <td style="padding: 6px 0;">{stream}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #888888;"><strong>Allocated Track:</strong></td>
                  <td style="padding: 6px 0; font-weight: bold; color: #00bfff;">{assigned_track}</td>
                </tr>
              </table>
            </div>

            <!-- AI Counseling Digest -->
            <div style="background: linear-gradient(135deg, rgba(0, 255, 102, 0.05) 0%, rgba(19, 19, 26, 0.5) 100%); border: 1px solid #00FF66; border-radius: 8px; padding: 25px; margin: 25px 0; background-color: rgba(0, 255, 102, 0.03);">
              <h3 style="color: #00FF66; margin: 0 0 12px 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                🧠 CHIEF COUNSELOR DIAGNOSTIC SUMMARY
              </h3>
              <p style="font-size: 15px; line-height: 1.8; color: #ffffff; font-style: italic; margin: 0; text-align: justify;">
                "{parent_report}"
              </p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #a0a0ab;">
              This diagnostic summary indicates exceptional professional potential. To view complete metrics, calibrate their situational cognitive vectors, and unlock the Career Manifesto PDF, your child must log into their student dashboard and complete the <strong>Phase 2 Aptitude Matrix Quiz</strong>.
            </p>
            
            <div style="margin: 30px 0; height: 1px; border-bottom: 1px solid #333339;"></div>

            <!-- Signatures Section -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="width: 50%; vertical-align: top;">
                  <div style="font-size: 13px; font-weight: bold; color: #ffffff; border-bottom: 1px solid #333339; padding-bottom: 5px; display: inline-block; min-width: 120px;">ALL MIGHT</div>
                  <div style="font-size: 11px; color: #888888; margin-top: 3px;">Chief Hero Counselor</div>
                  <div style="font-size: 10px; color: #55555e;">UA High Agency</div>
                </td>
                <td style="width: 50%; vertical-align: top; text-align: right;">
                  <div style="font-size: 13px; font-weight: bold; color: #ffffff; border-bottom: 1px solid #333339; padding-bottom: 5px; display: inline-block; min-width: 120px;">PRINCIPAL NEZU</div>
                  <div style="font-size: 11px; color: #888888; margin-top: 3px;">Academy Superintendent</div>
                  <div style="font-size: 10px; color: #55555e;">UA High School</div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Footer -->
          <div style="background: #0f0f12; padding: 20px; text-align: center; border-top: 1px solid #222228; font-size: 12px; color: #55555e;">
            <p style="margin: 0; color: #ff9900; font-weight: bold; font-size: 16px; letter-spacing: 2px;">PLUS ULTRA! ⚡</p>
            <p style="margin: 10px 0 5px 0; font-size: 10px; color: #a0a0ab;">Official Mail: uahigh2345@gmail.com | Contact: +1-800-PLUS-ULTRA</p>
            <p style="margin: 0; font-size: 10px;">This is an encrypted official UA Academy transmission. Please do not reply directly to this frequency.</p>
          </div>
        </div>
      </body>
    </html>
    """

    # Record outbound email in SQLite Database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO sent_emails (recipient, subject, body_html)
            VALUES (%s, %s, %s)
        """, (parent_email, f"🧪 [UA High Academy] Quirk Sorting & Career Allocation Report: {codename.upper()}", html_content))
        conn.commit()
        conn.close()
        print(f" [DATABASE LOG] Registration email logged to local archive for student {codename}.")
    except Exception as db_err:
        print(f" [DATABASE ERROR] Failed to archive outgoing email: {db_err}")

    smtp_server = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
    try:
        smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    except ValueError:
        smtp_port = 587
        
    sender_email_env = os.environ.get("SMTP_EMAIL", "")
    sender_password = os.environ.get("SMTP_PASSWORD", "")
    sender_email = sender_email_env if sender_email_env else "ua@gmail.com"
    
    if not sender_email_env or not sender_password:
        print(" [SMTP WARNING] SMTP_EMAIL and SMTP_PASSWORD not set in environment. Simulated transponder registration email body:")
        print(f"=================================================================")
        print(f"FROM: ua@gmail.com (UA High Academy)")
        print(f"TO: {parent_email} ({parent_name})")
        print(f"SUBJECT: [UA High Academy] Real-Time Quirk & Career Allocation Report - {codename.upper()}")
        print(f"DEAR {parent_name}, child {first_name} {last_name} ({codename}) allocated to {assigned_track}.")
        print(f"AI REPORT: {parent_report}")
        print(f"=================================================================")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🧪 [UA High Academy] Quirk Sorting & Career Allocation Report: {codename.upper()}"
    msg["From"] = "UA High Academy Counseling Office <ua@gmail.com>"
    msg["To"] = parent_email
    msg.attach(MIMEText(html_content, "html"))
    
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, parent_email, msg.as_string())
        server.quit()
        print(f" [SMTP SUCCESS] Real-time Quirk report email sent to parent {parent_email} for student {codename}.")
        return True
    except Exception as e:
        print(f" [SMTP ERROR] Failed to send sorting report email via SMTP to {parent_email}: {e}")
        return False

def send_parent_email_task(parent_name: str, parent_email: str, codename: str, first_name: str, last_name: str, stream: str, assigned_track: str, booking_date: str, booking_time: str):
    html_content = f"""
    <html>
      <body style="margin: 0; padding: 0; font-family: 'Space Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f0f12; color: #ffffff;">
        <div style="max-width: 600px; margin: 20px auto; background: #13131a; border: 2px solid #00FF66; border-radius: 12px; overflow: hidden; box-shadow: 0 0 20px rgba(0, 255, 102, 0.15);">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #0a3200 0%, #13131a 100%); padding: 30px; border-bottom: 2px solid #00FF66; text-align: center;">
            <h1 style="color: #00FF66; font-size: 28px; margin: 0; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">UA HIGH ACADEMY</h1>
            <p style="color: #888888; font-size: 11px; margin: 5px 0 0 0; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase;">Official Admission & Transponder Link</p>
          </div>
          
          <!-- Content Body -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #e2e2e8; margin-top: 0;">
              Greetings Agent <strong>{parent_name}</strong>,
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #a0a0ab;">
              We are pleased to inform you that your secure parental career transponder consultation slot has been <strong>successfully locked</strong> in the UA archives for your child:
            </p>
            
            <!-- Student Specs Dossier Box -->
            <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid #333339; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #00FF66; margin: 0 0 15px 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px dashed #333339; padding-bottom: 5px;">
                CANDIDATE DOSSIER
              </h3>
              <table style="width: 100%; font-size: 14px; color: #e2e2e8; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #888888; width: 40%;"><strong>Full Name:</strong></td>
                  <td style="padding: 6px 0; font-weight: bold;">{first_name} {last_name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #888888;"><strong>Hero Codename:</strong></td>
                  <td style="padding: 6px 0; font-weight: bold; color: #ff9900;">{codename.upper()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #888888;"><strong>Academic Stream:</strong></td>
                  <td style="padding: 6px 0;">{stream}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #888888;"><strong>Allocated Track:</strong></td>
                  <td style="padding: 6px 0; font-weight: bold; color: #00bfff;">{assigned_track}</td>
                </tr>
              </table>
            </div>

            <!-- Booking Slot Box -->
            <div style="background: linear-gradient(135deg, rgba(255, 122, 0, 0.1) 0%, rgba(19, 19, 26, 0.5) 100%); border: 1px solid #ff7a00; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <h3 style="color: #ff7a00; margin: 0 0 10px 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                🔒 APPOINTMENT LOCKED
              </h3>
              <p style="font-size: 18px; font-weight: bold; margin: 10px 0; color: #ffffff;">
                {booking_date}
              </p>
              <p style="font-size: 16px; margin: 5px 0; color: #ff9900; font-weight: bold;">
                at {booking_time}
              </p>
              <p style="font-size: 12px; color: #888888; margin: 10px 0 0 0;">
                (An encrypted call link will be transmitted 15 minutes before setup)
              </p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #a0a0ab;">
              During this secure session, Chief Counselor <strong>All Might</strong> and our academy staff will present you with the deep-dive diagnostic career matrices, specialized quirk classifications, and tactical industry leadership paths engineered for your student's professional ascent.
            </p>
            
            <div style="margin: 30px 0; height: 1px; border-bottom: 1px solid #333339;"></div>

            <!-- Signatures Section -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="width: 50%; vertical-align: top;">
                  <div style="font-size: 13px; font-weight: bold; color: #ffffff; border-bottom: 1px solid #333339; padding-bottom: 5px; display: inline-block; min-width: 120px;">ALL MIGHT</div>
                  <div style="font-size: 11px; color: #888888; margin-top: 3px;">Chief Hero Counselor</div>
                  <div style="font-size: 10px; color: #55555e;">UA High Agency</div>
                </td>
                <td style="width: 50%; vertical-align: top; text-align: right;">
                  <div style="font-size: 13px; font-weight: bold; color: #ffffff; border-bottom: 1px solid #333339; padding-bottom: 5px; display: inline-block; min-width: 120px;">PRINCIPAL NEZU</div>
                  <div style="font-size: 11px; color: #888888; margin-top: 3px;">Academy Superintendent</div>
                  <div style="font-size: 10px; color: #55555e;">UA High High-School</div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Footer -->
          <div style="background: #0f0f12; padding: 20px; text-align: center; border-top: 1px solid #222228; font-size: 12px; color: #55555e;">
            <p style="margin: 0; color: #ff9900; font-weight: bold; font-size: 16px; letter-spacing: 2px;">PLUS ULTRA! ⚡</p>
            <p style="margin: 10px 0 5px 0; font-size: 10px; color: #a0a0ab;">Official Mail: uahigh2345@gmail.com | Contact: +1-800-PLUS-ULTRA</p>
            <p style="margin: 0; font-size: 10px;">This is a secure, automated UA counseling transponder transmission. Please do not reply directly to this frequency.</p>
          </div>
        </div>
      </body>
    </html>
    """

    # Record outbound email in SQLite Database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO sent_emails (recipient, subject, body_html)
            VALUES (%s, %s, %s)
        """, (parent_email, f"⚡ [UA High Academy] Secure Parent Consultation Transponder Locked - {codename.upper()}", html_content))
        conn.commit()
        conn.close()
        print(f" [DATABASE LOG] Booking email logged to local archive for student {codename}.")
    except Exception as db_err:
        print(f" [DATABASE ERROR] Failed to archive outgoing email: {db_err}")

    smtp_server = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
    try:
        smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    except ValueError:
        smtp_port = 587
        
    sender_email_env = os.environ.get("SMTP_EMAIL", "")
    sender_password = os.environ.get("SMTP_PASSWORD", "")
    sender_email = sender_email_env if sender_email_env else "ua@gmail.com"
    
    if not sender_email_env or not sender_password:
        print(" [SMTP WARNING] SMTP_EMAIL and SMTP_PASSWORD not set in environment. Simulated transponder email body:")
        print(f"=================================================================")
        print(f"FROM: ua@gmail.com (UA High Academy)")
        print(f"TO: {parent_email} ({parent_name})")
        print(f"SUBJECT: [UA High Academy] Secure Parent Consultation Transponder Locked - {codename.upper()}")
        print(f"DEAR {parent_name}, child {first_name} {last_name} ({codename}) allocated to {assigned_track} has locked consultation slot: {booking_date} at {booking_time}.")
        print(f"=================================================================")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"⚡ [UA High Academy] Secure Parent Consultation Transponder Locked - {codename.upper()}"
    msg["From"] = "UA High Academy Counselor Office <ua@gmail.com>"
    msg["To"] = parent_email
    msg.attach(MIMEText(html_content, "html"))
    
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, parent_email, msg.as_string())
        server.quit()
        print(f" [SMTP SUCCESS] Secure parental consultation email sent to {parent_email} for student {codename}.")
        return True
    except Exception as e:
        print(f" [SMTP ERROR] Failed to send email via SMTP to {parent_email}: {e}")
        return False

@app.post("/api/phase3/vault/book")
def book_consultation(data: BookConsultation, background_tasks: BackgroundTasks):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT first_name, last_name, stream, assigned_track FROM counseled_students WHERE codename = %s", (data.codename,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Student profile not found in Academy archives.")
    
    first_name, last_name, stream, assigned_track = row
    
    # Collision check
    cursor.execute("SELECT codename FROM counseled_students WHERE booking_date = %s AND booking_time = %s AND codename != %s", (data.booking_date, data.booking_time, data.codename))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail="This time slot is already booked by another student. Please select a different time.")
        
    cursor.execute("""
        UPDATE counseled_students 
        SET parent_name = %s, parent_email = %s, booking_date = %s, booking_time = %s, payment_status = %s
        WHERE codename = %s
    """, (data.parent_name, data.parent_email, data.booking_date, data.booking_time, data.payment_status, data.codename))
    conn.commit()
    conn.close()
    
    # Trigger non-blocking real-time parental transponder email notification
    background_tasks.add_task(
        send_parent_email_task,
        parent_name=data.parent_name,
        parent_email=data.parent_email,
        codename=data.codename,
        first_name=first_name,
        last_name=last_name,
        stream=stream,
        assigned_track=assigned_track,
        booking_date=data.booking_date,
        booking_time=data.booking_time
    )
    
    return {
        "status": "success", 
        "codename": data.codename, 
        "parent_name": data.parent_name,
        "parent_email": data.parent_email,
        "booking_date": data.booking_date,
        "booking_time": data.booking_time,
        "email_notified": True
    }

@app.post("/api/admin/reschedule")
def admin_reschedule(data: RescheduleConsultation, background_tasks: BackgroundTasks):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT first_name, last_name, stream, assigned_track, parent_name, parent_email FROM counseled_students WHERE codename = %s", (data.codename,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found.")
        
    first_name, last_name, stream, assigned_track, parent_name, parent_email = row
    
    # Collision check
    cursor.execute("SELECT codename FROM counseled_students WHERE booking_date = %s AND booking_time = %s AND codename != %s", (data.new_date, data.new_time, data.codename))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail="This time slot is already booked. Please select a different time.")
        
    cursor.execute("UPDATE counseled_students SET booking_date = %s, booking_time = %s WHERE codename = %s", (data.new_date, data.new_time, data.codename))
    conn.commit()
    conn.close()
    
    if parent_email and parent_name:
        background_tasks.add_task(
            send_parent_email_task,
            parent_name=parent_name,
            parent_email=parent_email,
            codename=data.codename,
            first_name=first_name,
            last_name=last_name,
            stream=stream,
            assigned_track=assigned_track,
            booking_date=data.new_date,
            booking_time=data.new_time
        )
        
    return {"status": "success", "message": "Rescheduled successfully"}

@app.delete("/api/admin/student/{codename}")
def delete_student(codename: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT codename FROM counseled_students WHERE codename = %s", (codename,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found.")
        
    cursor.execute("DELETE FROM counseled_students WHERE codename = %s", (codename,))
    conn.commit()
    conn.close()
    
    return {"status": "success", "message": f"Student {codename} removed successfully."}

# ==========================================
# PHASE 3 ADD-ONS: REAL-TIME SIMULATED OUTBOX & MESSAGE HELPDESK
# ==========================================
class SupportMessageRequest(BaseModel):
    codename: str
    subject: str
    message: str

@app.get("/api/emails")
def get_emails():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, recipient, subject, body_html, timestamp FROM sent_emails ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    emails = []
    for r in rows:
        emails.append({
            "id": r[0],
            "recipient": r[1],
            "subject": r[2],
            "body_html": r[3],
            "timestamp": r[4]
        })
    return emails

@app.delete("/api/emails/clear")
def clear_emails():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sent_emails")
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Simulated transponder outbox cleared."}

@app.post("/api/support/message")
def submit_support_message(data: SupportMessageRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO contact_messages (codename, subject, message)
        VALUES (%s, %s, %s)
    """, (data.codename, data.subject, data.message))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Your transmission has been dispatched to Principal Counselors. Plus Ultra! ⚡"}

@app.get("/api/support/messages")
def get_support_messages():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, codename, subject, message, timestamp FROM contact_messages ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    messages = []
    for r in rows:
        messages.append({
            "id": r[0],
            "codename": r[1],
            "subject": r[2],
            "message": r[3],
            "timestamp": r[4]
        })
    return messages

@app.post("/api/phase4/complete_course")
def complete_course(data: CompleteCourseRequest):
    import json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT completed_courses FROM counseled_students WHERE codename = %s", (data.codename,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found.")
        
    try:
        completed = json.loads(row[0]) if row[0] else []
    except Exception:
        completed = []
        
    if data.course_id not in completed:
        completed.append(data.course_id)
        
    cursor.execute("UPDATE counseled_students SET completed_courses = %s WHERE codename = %s", (json.dumps(completed), data.codename))
    conn.commit()
    conn.close()
    return {"status": "success", "completed_courses": completed}

@app.post("/api/phase4/claim_reward")
def claim_reward(data: ClaimRewardRequest):
    import json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT claimed_rewards, shipping_address FROM counseled_students WHERE codename = %s", (data.codename,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found.")
        
    try:
        rewards = json.loads(row[0]) if row[0] else []
    except Exception:
        rewards = []
        
    if data.reward_id not in rewards:
        rewards.append(data.reward_id)
        
    cursor.execute("UPDATE counseled_students SET claimed_rewards = %s, shipping_address = %s WHERE codename = %s", (json.dumps(rewards), json.dumps(data.address), data.codename))
    conn.commit()
    conn.close()
    return {"status": "success", "claimed_rewards": rewards, "shipping_address": data.address}
