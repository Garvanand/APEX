import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from uuid import UUID
from groq import AsyncGroq
from app.core.config import settings
from app.database.models import AgentLog, AgentApproval
from sqlalchemy.ext.asyncio import AsyncSession

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
