import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

load_dotenv()

app = FastAPI(title="CareFlow AI Assistant Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are CareFlow AI, a helpful, empathetic, and professional virtual medical assistant for the CareFlow Hospital Management System.
Your job is to assist patients using the CareFlow platform.
Here are the key details about CareFlow:
- CareFlow is an advanced hospital management platform that allows patients to search for nearby hospitals, view department doctors, check availability, book appointments, and manage their health reports.
- The Patient Home page lists nearby hospitals, where patients can search by name or area and click 'View' to see hospital details.
- In hospital details, patients can see departments and their associated doctors.
- Patients can choose a doctor, select an available date/time slot, and book an appointment.
- Under 'Booked Appointments', patients can view all their upcoming and past appointments.

Provide concise, friendly, and clear guidance. If asked medical questions, give general helpful advice but always remind the patient that you are an AI assistant and they should consult a qualified doctor for professional diagnosis or treatment.
"""

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

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
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0.7,
        )
        
        messages = [SystemMessage(content=SYSTEM_PROMPT)]
        
        for msg in request.history:
            role = msg.get("role")
            content = msg.get("content")
            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                messages.append(AIMessage(content=content))
                
        
        messages.append(HumanMessage(content=request.message))
        
        # Invoke LLM
        response = llm.invoke(messages)
        return ChatResponse(response=response.content)
        
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "api_key_configured": bool(os.getenv("GEMINI_API_KEY"))
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
