from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from app.core.database import get_db
from app.api.deps import get_current_user
from app.database.models import User, AgentLog, AgentApproval, Deadline, Agent
from app.services.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/agents", tags=["Agent Management"])

@router.get("/status")
async def get_agent_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns the operational status of all 5 cognitive agents."""
    result = await db.execute(select(Agent))
    agents = result.scalars().all()
    if not agents:
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
    return {
        "status": "success",
        "data": {a.agent_name: a.status for a in agents}
    }

@router.get("/logs")
async def get_agent_logs(
    agent_name: Optional[str] = None,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns the action audit log trails for the user from the database."""
    query = (
        select(AgentLog, Agent.agent_name)
        .join(Agent, AgentLog.agent_id == Agent.id)
        .filter(AgentLog.user_id == current_user.id)
    )
    if agent_name:
        query = query.filter(Agent.agent_name == agent_name)
    query = query.order_by(AgentLog.timestamp.desc()).limit(limit)
    
    result = await db.execute(query)
    logs = []
    for row in result.all():
        log_entry, name = row
        logs.append({
            "timestamp": log_entry.timestamp.isoformat(),
            "agent_name": name,
            "action": log_entry.action_taken,
            "details": log_entry.execution_details
        })
    return logs

@router.get("/approvals/pending")
async def get_pending_approvals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns pending approvals/interventions from Environment Sculptor."""
    result = await db.execute(
        select(AgentApproval)
        .filter(AgentApproval.user_id == current_user.id)
        .filter(AgentApproval.status == "pending")
    )
    approvals = result.scalars().all()
    return [
        {
            "id": str(app.action_id),
            "agent": app.payload.get("agent", "Environment Sculptor"),
            "action": app.action_type,
            "desc": app.payload.get("desc", ""),
            "target": app.payload.get("target", "")
        }
        for app in approvals
    ]

@router.post("/approvals")
async def handle_agent_approval(
    action_id: str,
    approved: bool,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Saves student confirmation responses (approvals/rejections) for Sculptor actions."""
    try:
        act_uuid = UUID(action_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action ID format"
        )
        
    result = await db.execute(select(AgentApproval).filter(AgentApproval.action_id == act_uuid))
    approval = result.scalars().first()
    if not approval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intervention request not found"
        )
        
    approval.status = "approved" if approved else "rejected"
    
    # Audit trail log
    agent_id = await AgentOrchestrator.get_or_create_agent_id(db, "environment_sculptor")
    log = AgentLog(
        user_id=current_user.id,
        agent_id=agent_id,
        action_taken=f"INTERVENTION_{approval.status.upper()}",
        execution_details={
            "action_id": action_id,
            "action_type": approval.action_type,
            "target": approval.payload.get("target"),
            "desc": approval.payload.get("desc")
        }
    )
    db.add(log)
    await db.commit()
    
    return {
        "status": "executed",
        "action_id": action_id,
        "approved": approved,
        "resolved_at": datetime.utcnow().isoformat()
    }

@router.post("/peer-radar/message")
async def ingest_peer_radar_message(
    message_text: str,
    current_task: str,
    current_state: str = "Flow",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Ingests incoming chat message and determines suppression action via Peer Radar."""
    decision = await AgentOrchestrator.process_peer_radar_message(
        user_id=current_user.id,
        message_text=message_text,
        current_task=current_task,
        current_state=current_state,
        db=db
    )
    await db.commit()
    return decision

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
