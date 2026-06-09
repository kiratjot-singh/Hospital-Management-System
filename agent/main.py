import os
import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from dotenv import load_dotenv
from bson import ObjectId
from pymongo import MongoClient
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool

load_dotenv()

app = FastAPI(title="CareFlow AI Assistant Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB
mongo_uri = os.getenv("MONGO_URI")
db_name = "test"
db_client = None
db = None

if mongo_uri:
    try:
        db_client = MongoClient(mongo_uri)
        db = db_client[db_name]
        print(f"CareFlow Agent successfully connected to database: {db_name}")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
else:
    print("WARNING: MONGO_URI environment variable not configured.")

SYSTEM_PROMPT = """You are CareFlow AI, a helpful, empathetic, and professional virtual medical assistant for the CareFlow Hospital Management System.
Your job is to assist patients using the CareFlow platform.
Here are the key details about CareFlow:
- CareFlow is an advanced hospital management platform that allows patients to search for nearby hospitals, view department doctors, check availability, book appointments, and manage their health reports.
- The Patient Home page lists nearby hospitals, where patients can search by name or area and click 'View' to see hospital details.
- In hospital details, patients can see departments and their associated doctors.
- Patients can choose a doctor, select an available date/time slot, and book an appointment.
- Under 'Booked Appointments', patients can view all their upcoming and past appointments.

Provide concise, friendly, and clear guidance. If asked medical questions, give general helpful advice but always remind the patient that you are an AI assistant and they should consult a qualified doctor for professional diagnosis or treatment.
You have tools to access real-time hospital, doctor, and schedule data from the database. Use them whenever needed to give precise answers.
"""

def generate_slots(start_time: str, end_time: str, duration: int):
    slots = []
    try:
        h, m = map(int, start_time.split(":"))
        start_min = h * 60 + m
        
        eh, em = map(int, end_time.split(":"))
        end_min = eh * 60 + em
        
        def format_min(x):
            return f"{x // 60:02d}:{x % 60:02d}"
            
        while start_min + duration <= end_min:
            slots.append(f"{format_min(start_min)}-{format_min(start_min + duration)}")
            start_min += duration
    except Exception as e:
        print(f"Error generating slots: {e}")
    return slots

# Define Agent Tools

@tool
def get_hospitals(search_query: str = None) -> str:
    """
    Search and fetch the list of available hospitals.
    Args:
        search_query: Optional search keyword to filter hospitals by name or city.
    """
    if db is None:
        return "Error: Database not connected."
    
    try:
        query = {}
        if search_query:
            query = {
                "$or": [
                    {"name": {"$regex": search_query, "$options": "i"}},
                    {"address.city": {"$regex": search_query, "$options": "i"}},
                    {"address.state": {"$regex": search_query, "$options": "i"}}
                ]
            }
        
        hospitals_cursor = db["hospitals"].find(query)
        results = []
        for h in hospitals_cursor:
            results.append({
                "id": str(h["_id"]),
                "name": h.get("name"),
                "address": h.get("address", {}),
                "contact": h.get("contact", {}),
                "establishedYear": h.get("establishedYear"),
                "isPrivate": h.get("isPrivate", True)
            })
            
        if not results:
            return "No hospitals found matching the search criteria."
            
        import json
        return json.dumps(results, indent=2)
    except Exception as e:
        return f"Error retrieving hospitals: {str(e)}"

@tool
def get_hospital_details(hospital_id: str) -> str:
    """
    Get detailed information about a specific hospital, including its departments and doctors.
    Args:
        hospital_id: The unique ID (ObjectId string) of the hospital.
    """
    if db is None:
        return "Error: Database not connected."
    
    try:
        hospital = db["hospitals"].find_one({"_id": ObjectId(hospital_id)})
        if not hospital:
            return "Hospital not found."
            
        # Get departments
        depts_cursor = db["departments"].find({"hospital": ObjectId(hospital_id)})
        departments = [{"id": str(d["_id"]), "name": d.get("name")} for d in depts_cursor]
        
        # Get doctors
        docs_cursor = db["doctors"].find({"hospital": ObjectId(hospital_id)})
        doctors = []
        for doc in docs_cursor:
            # Get names of departments doctor belongs to
            doc_depts = []
            for dept_id in doc.get("departments", []):
                dept_doc = db["departments"].find_one({"_id": ObjectId(dept_id)})
                if dept_doc:
                    doc_depts.append(dept_doc.get("name"))
                    
            doctors.append({
                "id": str(doc["_id"]),
                "name": doc.get("name"),
                "phone": doc.get("phone"),
                "experience": doc.get("experience"),
                "qualifications": doc.get("qualifications", "MBBS"),
                "available": doc.get("available", True),
                "departments": doc_depts,
                "workingHours": doc.get("workingHours", {})
            })
            
        details = {
            "id": str(hospital["_id"]),
            "name": hospital.get("name"),
            "address": hospital.get("address", {}),
            "contact": hospital.get("contact", {}),
            "establishedYear": hospital.get("establishedYear"),
            "departments": departments,
            "doctors": doctors
        }
        
        import json
        return json.dumps(details, indent=2)
    except Exception as e:
        return f"Error retrieving hospital details: {str(e)}"

@tool
def get_doctor_details(doctor_id: str) -> str:
    """
    Get detailed profile of a doctor including experience, qualifications, department, hospital, and working hours.
    Args:
        doctor_id: The unique ID (ObjectId string) of the doctor.
    """
    if db is None:
        return "Error: Database not connected."
    
    try:
        doctor = db["doctors"].find_one({"_id": ObjectId(doctor_id)})
        if not doctor:
            return "Doctor not found."
            
        # Resolve hospital name
        hospital = db["hospitals"].find_one({"_id": ObjectId(doctor.get("hospital"))})
        hospital_name = hospital.get("name") if hospital else "Unknown Hospital"
        
        # Resolve departments
        doc_depts = []
        for dept_id in doctor.get("departments", []):
            dept_doc = db["departments"].find_one({"_id": ObjectId(dept_id)})
            if dept_doc:
                doc_depts.append(dept_doc.get("name"))
                
        details = {
            "id": str(doctor["_id"]),
            "name": doctor.get("name"),
            "phone": doctor.get("phone"),
            "hospitalId": str(doctor.get("hospital")),
            "hospitalName": hospital_name,
            "departments": doc_depts,
            "experience": doctor.get("experience"),
            "qualifications": doctor.get("qualifications", "MBBS"),
            "available": doctor.get("available", True),
            "workingHours": doctor.get("workingHours", {}),
            "slotDuration": doctor.get("slotDuration", 15)
        }
        
        import json
        return json.dumps(details, indent=2)
    except Exception as e:
        return f"Error retrieving doctor details: {str(e)}"

@tool
def get_available_slots(doctor_id: str, hospital_id: str, date_str: str) -> str:
    """
    Get available appointment slots for a doctor at a hospital on a specific date.
    Args:
        doctor_id: The doctor's ObjectId string.
        hospital_id: The hospital's ObjectId string.
        date_str: Date in format YYYY-MM-DD.
    """
    if db is None:
        return "Error: Database not connected."
        
    try:
        doctor = db["doctors"].find_one({"_id": ObjectId(doctor_id)})
        if not doctor:
            return "Doctor not found."
            
        working_hours = doctor.get("workingHours", {})
        start_time = working_hours.get("start", "10:00")
        end_time = working_hours.get("end", "17:00")
        duration = doctor.get("slotDuration", 15)
        
        all_slots = generate_slots(start_time, end_time, duration)
        
        # Format the start and end range for that date
        dt = datetime.datetime.strptime(date_str, "%Y-%m-%d")
        day_start = datetime.datetime.combine(dt.date(), datetime.time.min)
        day_end = datetime.datetime.combine(dt.date(), datetime.time.max)
        
        # Fetch booked appointments
        booked_cursor = db["appointments"].find({
            "doctor": ObjectId(doctor_id),
            "hospital": ObjectId(hospital_id),
            "date": {"$gte": day_start, "$lte": day_end},
            "status": "booked"
        })
        
        booked_slots = [b.get("slot") for b in booked_cursor]
        free_slots = [s for s in all_slots if s not in booked_slots]
        
        result = {
            "doctorName": doctor.get("name"),
            "date": date_str,
            "totalSlots": len(all_slots),
            "bookedSlots": booked_slots,
            "availableSlots": free_slots
        }
        
        import json
        return json.dumps(result, indent=2)
    except Exception as e:
        return f"Error retrieving slots: {str(e)}"

@tool
def get_patient_appointments(patient_id: str) -> str:
    """
    List all appointments booked by a patient.
    Args:
        patient_id: The patient's unique ObjectId string.
    """
    if db is None:
        return "Error: Database not connected."
        
    try:
        appointments_cursor = db["appointments"].find({"patient": ObjectId(patient_id)}).sort("date", 1)
        results = []
        for app in appointments_cursor:
            # Resolve doctor name
            doc = db["doctors"].find_one({"_id": ObjectId(app.get("doctor"))})
            doc_name = doc.get("name") if doc else "Unknown Doctor"
            
            # Resolve hospital name
            hosp = db["hospitals"].find_one({"_id": ObjectId(app.get("hospital"))})
            hosp_name = hosp.get("name") if hosp else "Unknown Hospital"
            
            results.append({
                "appointmentId": str(app["_id"]),
                "doctorId": str(app.get("doctor")),
                "doctorName": doc_name,
                "hospitalId": str(app.get("hospital")),
                "hospitalName": hosp_name,
                "date": app.get("date").strftime("%Y-%m-%d") if isinstance(app.get("date"), datetime.datetime) else str(app.get("date")),
                "slot": app.get("slot"),
                "status": app.get("status"),
                "reason": app.get("reason", "")
            })
            
        if not results:
            return "No appointments found for this patient."
            
        import json
        return json.dumps(results, indent=2)
    except Exception as e:
        return f"Error retrieving appointments: {str(e)}"

@tool
def book_appointment(patient_id: str, doctor_id: str, hospital_id: str, date_str: str, slot: str, reason: str = "") -> str:
    """
    Book a new appointment for the patient.
    Args:
        patient_id: The patient's ObjectId string.
        doctor_id: The doctor's ObjectId string.
        hospital_id: The hospital's ObjectId string.
        date_str: The date string (format YYYY-MM-DD).
        slot: The specific time slot string (e.g. "10:15-10:30").
        reason: Optional brief reason for appointment.
    """
    if db is None:
        return "Error: Database not connected."
        
    try:
        doctor = db["doctors"].find_one({"_id": ObjectId(doctor_id)})
        if not doctor:
            return "Error: Doctor not found."
            
        patient = db["patients"].find_one({"_id": ObjectId(patient_id)})
        if not patient:
            return "Error: Patient not found."
            
        hospital = db["hospitals"].find_one({"_id": ObjectId(hospital_id)})
        if not hospital:
            return "Error: Hospital not found."
            
        dt = datetime.datetime.strptime(date_str, "%Y-%m-%d")
        # Ensure date is not in the past
        today = datetime.datetime.combine(datetime.date.today(), datetime.time.min)
        if dt < today:
            return "Error: Cannot book an appointment in the past."
            
        # Verify slot is valid
        working_hours = doctor.get("workingHours", {})
        start_time = working_hours.get("start", "10:00")
        end_time = working_hours.get("end", "17:00")
        duration = doctor.get("slotDuration", 15)
        
        valid_slots = generate_slots(start_time, end_time, duration)
        if slot not in valid_slots:
            return f"Error: Invalid slot. Available slots are: {', '.join(valid_slots)}"
            
        # Check if slot is already booked
        day_start = datetime.datetime.combine(dt.date(), datetime.time.min)
        day_end = datetime.datetime.combine(dt.date(), datetime.time.max)
        
        exists = db["appointments"].find_one({
            "doctor": ObjectId(doctor_id),
            "hospital": ObjectId(hospital_id),
            "slot": slot,
            "date": {"$gte": day_start, "$lte": day_end},
            "status": "booked"
        })
        
        if exists:
            return "Error: This slot is already booked."
            
        # Create appointment doc
        app_doc = {
            "doctor": ObjectId(doctor_id),
            "patient": ObjectId(patient_id),
            "hospital": ObjectId(hospital_id),
            "date": dt,
            "slot": slot,
            "reason": reason,
            "status": "booked",
            "createdAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow(),
            "__v": 0
        }
        
        res = db["appointments"].insert_one(app_doc)
        created_id = str(res.inserted_id)
        
        # Link appointment to patient
        db["patients"].update_one(
            {"_id": ObjectId(patient_id)},
            {"$push": {"bookedAppointments": ObjectId(created_id)}}
        )
        
        return f"Success! Appointment successfully booked with Dr. {doctor.get('name')} at {hospital.get('name')} on {date_str} at {slot}. Appointment ID is: {created_id}"
    except Exception as e:
        return f"Error booking appointment: {str(e)}"

@tool
def cancel_appointment(appointment_id: str) -> str:
    """
    Cancel a booked appointment.
    Args:
        appointment_id: The appointment's unique ObjectId string.
    """
    if db is None:
        return "Error: Database not connected."
        
    try:
        app = db["appointments"].find_one({"_id": ObjectId(appointment_id)})
        if not app:
            return "Error: Appointment not found."
            
        if app.get("status") == "cancelled":
            return "Error: Appointment is already cancelled."
            
        db["appointments"].update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": {"status": "cancelled", "updatedAt": datetime.datetime.utcnow()}}
        )
        
        # Update references in patient's bookedAppointments and previousAppointments
        patient_id = app.get("patient")
        if patient_id:
            db["patients"].update_one(
                {"_id": ObjectId(patient_id)},
                {
                    "$pull": {"bookedAppointments": ObjectId(appointment_id)},
                    "$push": {"previousAppointements": ObjectId(appointment_id)}
                }
            )
            
        return f"Success! Appointment {appointment_id} has been cancelled."
    except Exception as e:
        return f"Error cancelling appointment: {str(e)}"


tools_list = [
    get_hospitals,
    get_hospital_details,
    get_doctor_details,
    get_available_slots,
    get_patient_appointments,
    book_appointment,
    cancel_appointment
]
tools_map = {t.name: t for t in tools_list}


class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    patientId: Optional[str] = None

class ChatResponse(BaseModel):
    response: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured on the server. Please set it in the agent/.env file."
        )
    
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash",
            google_api_key=api_key,
            temperature=0.7,
        )
        
        # Customize the system prompt based on current date & patient identity
        current_date = datetime.date.today().strftime("%Y-%m-%d")
        custom_prompt = SYSTEM_PROMPT + f"\nToday's date is: {current_date}.\n"
        
        if request.patientId:
            custom_prompt += f"The current logged-in patient's ID is: {request.patientId}.\n"
            try:
                # Look up patient name to personalize
                p_doc = db["patients"].find_one({"_id": ObjectId(request.patientId)})
                if p_doc:
                    custom_prompt += f"The patient's name is: {p_doc.get('name')}.\n"
            except Exception:
                pass
        else:
            custom_prompt += "No patient is currently logged in. You cannot perform booking or cancellation tasks without a patient log-in.\n"
            
        messages = [SystemMessage(content=custom_prompt)]
        
        for msg in request.history:
            role = msg.get("role")
            content = msg.get("content")
            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                messages.append(AIMessage(content=content))
                
        messages.append(HumanMessage(content=request.message))
        
        # Bind the tools
        llm_with_tools = llm.bind_tools(tools_list)
        
        # Invoke LLM with tool calling loop
        response = llm_with_tools.invoke(messages)
        
        iterations = 0
        while response.tool_calls and iterations < 5:
            messages.append(response)
            
            for tool_call in response.tool_calls:
                tool_name = tool_call.get("name")
                tool_args = tool_call.get("args", {})
                tool_id = tool_call.get("id")
                
                print(f"Agent executing tool: {tool_name} with arguments: {tool_args}")
                
                if tool_name in tools_map:
                    try:
                        tool_result = tools_map[tool_name].invoke(tool_args)
                    except Exception as tool_err:
                        tool_result = f"Error executing tool: {str(tool_err)}"
                else:
                    tool_result = f"Error: Tool {tool_name} not found."
                    
                messages.append(ToolMessage(content=str(tool_result), tool_call_id=tool_id))
                
            response = llm_with_tools.invoke(messages)
            iterations += 1
            
        response_text = response.content
        if isinstance(response_text, list):
            text_parts = []
            for part in response_text:
                if isinstance(part, dict) and "text" in part:
                    text_parts.append(part["text"])
                elif isinstance(part, str):
                    text_parts.append(part)
                elif hasattr(part, "get") and part.get("text"):
                    text_parts.append(part.get("text"))
                elif hasattr(part, "text"):
                    text_parts.append(part.text)
            response_text = "".join(text_parts)
            
        return ChatResponse(response=response_text)
    except Exception as e:
        err_msg = str(e)
        print(f"Error calling Gemini API: {e}")
        if "RESOURCE_EXHAUSTED" in err_msg or "429" in err_msg or "Quota" in err_msg:
            return ChatResponse(response="CareFlow AI is currently experiencing a high volume of requests. Please wait a few seconds and try sending your message again.")
        elif "UNAVAILABLE" in err_msg or "503" in err_msg:
            return ChatResponse(response="CareFlow AI is currently experiencing high demand or temporary server status issues. Please try again in a moment.")
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "api_key_configured": bool(os.getenv("GEMINI_API_KEY")),
        "database_connected": db is not None
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
