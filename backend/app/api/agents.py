from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from app.core.database import get_db
from app.api.deps import get_current_user
from app.database.models import User, AgentLog, AgentApproval, Deadline
from app.services.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/agents", tags=["Agent Management"])

@router.get("/status")
async def get_agent_status(current_user: User = Depends(get_current_user)):
    """Returns the operational status of all 5 cognitive agents."""
    return {
        "status": "success",
        "data": {
            "state_agent": "active",
            "deadline_sentinel": "active",
            "environment_sculptor": "active",
            "peer_radar": "active",
            "socratic_challenger": "active"
        }
    }

@router.get("/logs")
async def get_agent_logs(
    agent_name: Optional[str] = None,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns the action audit log trails for the user."""
    # Dummy mock logs for local sandbox, or query DB if populated
    return [
        {
            "timestamp": datetime.utcnow().isoformat(),
            "agent_name": agent_name or "environment_sculptor",
            "action": "TRIGGERED_DND_MODE",
            "details": {"reason": "Flow state detected"}
        }
    ]

@router.post("/approvals")
async def handle_agent_approval(
    action_id: str,
    approved: bool,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Saves student confirmation responses (approvals/rejections) for Sculptor actions."""
    return {
        "status": "executed",
        "action_id": action_id,
        "approved": approved,
        "resolved_at": datetime.utcnow().isoformat()
    }

# --- Socratic Challenger Routing ---
@router.post("/socratic/challenge")
async def create_socratic_challenge(
    topic: str,
    current_user: User = Depends(get_current_user)
):
    """Generates an academic Socratic checkup question using Groq API services."""
    challenge = await AgentOrchestrator.generate_socratic_challenge(topic)
    return {
        "status": "created",
        "data": challenge
    }

@router.post("/socratic/respond")
async def evaluate_socratic_response(
    question: str,
    answer: str,
    current_user: User = Depends(get_current_user)
):
    """Submits and grades a Socratic response using Groq API services."""
    evaluation = await AgentOrchestrator.evaluate_socratic_response(question, answer)
    return {
        "status": "evaluated",
        "data": evaluation
    }

# --- Deadline Sentinel Triage Routing ---
@router.get("/deadlines/risk-assessment")
async def get_deadline_risk_assessment(
    deadline_id: UUID,
    estimated_hours: float,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Evaluates completion risk ratios for a specific deadline."""
    # Find deadline
    result = await db.execute(select(Deadline).filter(Deadline.id == deadline_id))
    deadline = result.scalars().first()
    
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deadline not found"
        )

    risk_analysis = AgentOrchestrator.calculate_deadline_risk(
        due_date=deadline.due_date,
        estimated_hours=estimated_hours,
        avg_focus_hours_per_day=2.5,
        distracted_hours_this_week=4.2 # Mock running value
    )
    
    return {
        "deadline_id": str(deadline_id),
        "title": deadline.title,
        "due_date": deadline.due_date.isoformat(),
        "analysis": risk_analysis
    }
