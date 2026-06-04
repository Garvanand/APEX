import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from uuid import UUID
from groq import AsyncGroq
from app.core.config import settings
from app.database.models import AgentLog, AgentApproval, Agent, Deadline, UserPreference, CognitiveState
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.groq_service import classify_chat_message

logger = logging.getLogger(__name__)

# Initialize Groq client
groq_client = None
if settings.GROQ_API_KEY:
    groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)

class AgentOrchestrator:
    """
    APEX Agent Orchestrator.
    Mediates conflicts between the 5 cognitive agents and executes LLM-driven
    decisions for Socratic Challenger and Deadline Sentinel.
    """
    
    # Priority matrix mapping
    PRIORITIES = {
        "deadline_sentinel": 10,
        "state_agent": 8,
        "socratic_challenger": 6,
        "environment_sculptor": 5,
        "peer_radar": 4
    }

    @classmethod
    def calculate_deadline_risk(
        cls,
        due_date: datetime,
        estimated_hours: float,
        avg_focus_hours_per_day: float = 2.5,
        distracted_hours_this_week: float = 0.0
    ) -> Dict[str, Any]:
        """
        Urgency & Risk Scoring Algorithm.
        Estimates the probability of deadline failure from first principles.
        """
        now = datetime.now(timezone.utc)
        time_left = due_date - now
        days_left = max(0.1, time_left.total_seconds() / 86400.0)

        # Procrastination penalty scales focus capacity down based on distracted hours logged
        procrastination_factor = max(0.3, 1.0 - (distracted_hours_this_week / 20.0))
        effective_capacity = days_left * avg_focus_hours_per_day * procrastination_factor
        
        # Risk ratio of hours needed vs focus capacity left
        capacity_ratio = estimated_hours / effective_capacity if effective_capacity > 0 else 9.9
        
        # Sigmoid function maps capacity ratio to risk coefficient [0.0 - 1.0]
        import math
        risk_coefficient = 1.0 / (1.0 + math.exp(-2.0 * (capacity_ratio - 1.0)))
        risk_coefficient = min(1.0, max(0.0, risk_coefficient))

        # Classify risk tier
        if risk_coefficient >= 0.85:
            tier = "critical"
        elif risk_coefficient >= 0.60:
            tier = "high"
        elif risk_coefficient >= 0.35:
            tier = "medium"
        else:
            tier = "low"

        return {
            "risk_coefficient": round(risk_coefficient, 2),
            "risk_tier": tier,
            "days_remaining": round(days_left, 1),
            "estimated_hours": estimated_hours,
            "effective_focus_capacity": round(effective_capacity, 1),
            "ratio": round(capacity_ratio, 2)
        }

    @classmethod
    async def mediate_conflict(
        cls,
        user_id: UUID,
        current_state: str,
        proposing_agent: str,
        action_name: str,
        payload: Dict[str, Any],
        due_date: Optional[datetime] = None,
        db: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """
        Priority Resolution & Contextual Exclusions.
        Mediates concurrent actions using priority rankings and cognitive rules.
        """
        proposed_priority = cls.PRIORITIES.get(proposing_agent, 1)
        
        # Rule 1: Flow protection blocks lower-priority interruptions
        if current_state == "Flow" and proposed_priority < cls.PRIORITIES["state_agent"]:
            logger.info(f"Orchestrator: DEFERRED action '{action_name}' from '{proposing_agent}' to protect active Flow state.")
            return {
                "decision": "DEFERRED",
                "reason": "Active Flow state suppresses Socratic challenges and notifications."
            }

        # Rule 2: Intersecting Flow & Impending Deadline Conflict
        if proposing_agent == "deadline_sentinel" and action_name == "LOCK_WORKSPACE" and due_date:
            now = datetime.now(timezone.utc)
            hours_to_deadline = (due_date - now).total_seconds() / 3600.0
            
            if current_state == "Flow" and hours_to_deadline >= 4.0:
                logger.info(f"Orchestrator: EXCLUDED 'LOCK_WORKSPACE'. Deferring due to active Flow state (>4h remaining).")
                return {
                    "decision": "DEFERRED",
                    "reason": "User is in Flow state and deadline due date exceeds 4-hour critical window."
                }

        # Save to agent logs audit trail if DB session is active
        if db:
            agent_id_result = await db.execute(
                "SELECT id FROM agents WHERE agent_name = :name",
                {"name": proposing_agent}
            )
            agent_id = agent_id_result.scalar()
            
            if agent_id:
                log_entry = AgentLog(
                    user_id=user_id,
                    agent_id=agent_id,
                    action_taken=action_name,
                    execution_details=payload
                )
                db.add(log_entry)
                await db.flush()

        return {
            "decision": "APPROVED",
            "reason": f"Action satisfies priority boundaries ({proposed_priority}) for state: {current_state}."
        }

    @classmethod
    async def generate_socratic_challenge(cls, conceptual_anchor: str) -> Dict[str, Any]:
        """
        Socratic Challenger generation using llama-3.3-70b-versatile.
        Formulates interactive conceptual questions to check user comprehension.
        """
        if not groq_client:
            return {
                "challenge": f"Explain key constraints and parameters involved in {conceptual_anchor}.",
                "conceptual_anchor": conceptual_anchor
            }

        system_prompt = (
            "You are the APEX Socratic Challenger. Your task is to evaluate student study topics "
            "and generate a single, highly-focused conceptual question. "
            "The question must challenge the student to explain a core mechanism from first principles, "
            "forcing them to formulate an explanation rather than recalling facts.\n\n"
            "Respond ONLY with a JSON object containing keys: 'question' and 'conceptual_anchor'."
        )

        try:
            response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Topic: {conceptual_anchor}"}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Socratic Challenger failed: {e}")
            return {
                "question": f"Detail the structural optimization benefits of {conceptual_anchor}.",
                "conceptual_anchor": conceptual_anchor
            }

    @classmethod
    async def evaluate_socratic_response(
        cls,
        question: str,
        student_response: str
    ) -> Dict[str, Any]:
        """
        Evaluates student responses using llama-3.3-70b-versatile.
        Provides scoring feedback on conceptual correctness.
        """
        if not groq_client:
            return {
                "score": 0.85,
                "feedback": "Response ingested. Groq evaluation offline."
            }

        system_prompt = (
            "You are the APEX Socratic Challenger evaluator. Analyze the user's explanation "
            "against the question asked. Evaluate correctness and assign a score [0.0 - 1.0]. "
            "Provide brief, constructive feedback explaining what mechanism was correct or missed.\n\n"
            "Respond ONLY with a JSON object containing keys: 'score' (float) and 'feedback' (string)."
        )

        try:
            response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Question: {question}\nStudent Answer: {student_response}"}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Response evaluation failed: {e}")
            return {
                "score": 0.50,
                "feedback": "Unable to connect to evaluation engine. Default score applied."
            }

    @classmethod
    async def get_or_create_agent_id(cls, db: AsyncSession, agent_name: str) -> UUID:
        """Helper to get or create an agent metadata entry in the database."""
        import uuid
        result = await db.execute(select(Agent.id).filter(Agent.agent_name == agent_name))
        agent_id = result.scalar()
        if not agent_id:
            new_agent = Agent(
                id=uuid.uuid4(),
                agent_name=agent_name,
                version="1.0.0",
                status="active"
            )
            db.add(new_agent)
            await db.flush()
            agent_id = new_agent.id
        return agent_id

    @classmethod
    async def apply_state_hysteresis(
        cls,
        user_id: UUID,
        proposed_state: str,
        confidence: float,
        db: AsyncSession
    ) -> str:
        """
        State Agent Hysteresis.
        Prevents rapid cognitive state oscillation. Transitioning out of Flow
        or into Overloaded requires multiple consecutive signals or high confidence.
        """
        # Query the last 3 determined states
        result = await db.execute(
            select(CognitiveState.state)
            .filter(CognitiveState.user_id == user_id)
            .order_by(CognitiveState.determined_at.desc())
            .limit(3)
        )
        recent_states = [row[0] for row in result.all()]

        if len(recent_states) < 2:
            return proposed_state

        current_committed_state = recent_states[0]

        # Rule 1: Transitioning out of Flow requires 2 consecutive matching proposed ticks or high confidence
        if current_committed_state == "Flow" and proposed_state != "Flow":
            if confidence < 0.85 and recent_states[1] != proposed_state:
                logger.info(f"Hysteresis: Suppressed state transition Flow -> {proposed_state} to prevent jitter.")
                return "Flow"

        # Rule 2: Transitioning into Overloaded requires high confidence or consecutive ticks
        if proposed_state == "Overloaded" and current_committed_state != "Overloaded":
            if confidence < 0.75 and recent_states[1] != "Overloaded":
                logger.info("Hysteresis: Suppressed transition into Overloaded due to low confidence threshold.")
                return current_committed_state

        return proposed_state

    @classmethod
    async def evaluate_sculptor_interventions(
        cls,
        user_id: UUID,
        current_state: str,
        active_app: str,
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """
        Environment Sculptor Decision Rules.
        Checks user settings and generates workspace intervention proposals (DND, blocking, greyscale).
        """
        import uuid
        from datetime import datetime, timedelta, timezone

        # 1. Fetch user preferences
        pref_result = await db.execute(select(UserPreference).filter(UserPreference.user_id == user_id))
        pref = pref_result.scalar()
        if not pref or not pref.environment_sculpt_enabled:
            return []

        interventions = []
        agent_id = await cls.get_or_create_agent_id(db, "environment_sculptor")

        # 2. Flow state -> Trigger DND
        if current_state == "Flow" and pref.dnd_during_flow:
            action = "ENABLE_DND"
            logger.info("Environment Sculptor: Triggering ENABLE_DND action for Flow state.")
            interventions.append({
                "action": action,
                "agent": "Environment Sculptor",
                "desc": "Muted notifications and system triggers to protect Flow state.",
                "target": "OS"
            })
            
            # Log action directly (fully autonomous)
            log = AgentLog(
                user_id=user_id,
                agent_id=agent_id,
                action_taken=action,
                execution_details={"reason": "Flow state entered"},
                timestamp=datetime.now(timezone.utc)
            )
            db.add(log)

        # 3. Distracted state with blacklisted process -> Propose BLOCK_APP approval
        distractors = ["discord", "spotify", "twitter", "reddit", "whatsapp", "tiktok", "steam"]
        app_lower = active_app.lower()
        if current_state == "Distracted" and any(d in app_lower for d in distractors):
            action_id = uuid.uuid4()
            desc = f"Block focus-diverting application: '{active_app}'?"
            
            # Insert approval request in DB
            approval = AgentApproval(
                id=uuid.uuid4(),
                user_id=user_id,
                action_id=action_id,
                action_type="BLOCK_APP",
                status="pending",
                payload={"agent": "Environment Sculptor", "desc": desc, "target": active_app},
                expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
                created_at=datetime.now(timezone.utc)
            )
            db.add(approval)
            
            interventions.append({
                "id": str(action_id),
                "action": "BLOCK_APP",
                "agent": "Environment Sculptor",
                "desc": desc,
                "target": active_app,
                "require_approval": True
            })

        # 4. Overloaded state -> Propose greyscale mode
        if current_state == "Overloaded" and pref.screen_greyscale_trigger in ["Overloaded", "Fatigued"]:
            action = "TRIGGER_GREYSCALE"
            interventions.append({
                "action": action,
                "agent": "Environment Sculptor",
                "desc": "Activated greyscale rendering mode to lower visual cognitive stress.",
                "target": "OS"
            })
            
            log = AgentLog(
                user_id=user_id,
                agent_id=agent_id,
                action_taken=action,
                execution_details={"reason": "Stress thresholds exceeded"},
                timestamp=datetime.now(timezone.utc)
            )
            db.add(log)

        await db.flush()
        return interventions

    @classmethod
    async def process_peer_radar_message(
        cls,
        user_id: UUID,
        message_text: str,
        current_task: str,
        current_state: str,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Peer Radar Message Processing.
        Ingests external notifications, classifies them via Groq, matches relevance,
        and decides whether to suppress or alert the user.
        """
        from datetime import datetime, timezone
        
        # 1. Run LLM/Heuristic classification
        classification = await classify_chat_message(message_text, current_task)
        category = classification.get("category", "noise")
        relevance = classification.get("relevance_score", 0.0)
        should_override = classification.get("should_override", False)
        
        # 2. Determine intervention
        action = "PASS"
        reason = "Message allowed under normal state bounds."
        
        if current_state == "Flow":
            if category != "academic":
                action = "SUPPRESS"
                reason = "Non-academic message suppressed to protect active Flow session."
            elif not should_override:
                action = "SUPPRESS"
                reason = "Academic message suppressed (insufficient urgency threshold) to protect Flow."
            else:
                action = "ALERT"
                reason = "High-urgency academic alert allowed to bypass active DND rules."
        else:
            if should_override or (category == "academic" and relevance > 0.6):
                action = "ALERT"
                reason = "Relevant academic message highlighted."
                
        # 3. Log Peer Radar activity
        agent_id = await cls.get_or_create_agent_id(db, "peer_radar")
        log = AgentLog(
            user_id=user_id,
            agent_id=agent_id,
            action_taken=f"CLASSIFY_MESSAGE_{action}",
            execution_details={
                "message_sample": message_text[:40] + "...",
                "category": category,
                "relevance": relevance,
                "reason": reason
            },
            timestamp=datetime.now(timezone.utc)
        )
        db.add(log)
        await db.flush()
        
        return {
            "action": action,
            "category": category,
            "relevance_score": relevance,
            "summary": classification.get("summary", ""),
            "reason": reason
        }

