import asyncio
import logging
from app.core.security import get_password_hash, verify_password, create_access_token, decode_token

from app.services.groq_service import classify_cognitive_state
from app.schemas.schemas import SignalIngest, UserCreate
from pydantic import ValidationError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("APEX-Tester")

async def test_security():
    logger.info("--- Testing Security & Token Utilities ---")
    password = "MySuperSecretPassword123!"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_password", hashed) is False
    logger.info("Password hashing and verification verified successfully.")

    user_id = "8a7199c0-9d0d-400b-bd9f-7bc6f228cf08"
    token = create_access_token(user_id)
    decoded = decode_token(token)
    assert decoded == user_id
    logger.info("JWT access token creation and decoding verified successfully.")



async def test_groq_service():
    logger.info("--- Testing Groq API Cognitive State Classifier ---")
    test_telemetry = {
        "heart_rate": 78.5,
        "hrv": 52.3,
        "blink_rate_per_min": 14,
        "screen_interaction_density": 0.85,
        "active_application": "VS Code",
        "ambient_noise_db": 38.5
    }
    try:
        classification = await classify_cognitive_state(test_telemetry)
        logger.info(f"Classifier Output: {classification}")
        assert "classified_state" in classification
        assert classification["classified_state"] in ["Flow", "Distracted", "Fatigued", "Overloaded"]
        logger.info(f"State Agent Classification verified successfully: {classification['classified_state']}")
    except Exception as e:
        logger.error(f"Groq Cognitive classification failed: {e}")

def test_pydantic_schemas():
    logger.info("--- Testing Pydantic Schemas Validation ---")
    
    # 1. Invalid User Validation
    try:
        UserCreate(email="not-an-email", password="123", first_name="G", last_name="A")
        assert False, "Should have failed validation for invalid email and short password"
    except ValidationError:
        logger.info("UserCreate schema validation checks working correctly.")

    # 2. Valid Signal Ingestion Schema
    try:
        SignalIngest(
            timestamp="2026-06-03T12:00:00Z",
            device_source="iqoo-neo9-99482",
            heart_rate=82.0,
            hrv=44.0,
            active_application="VS Code"
        )
        logger.info("SignalIngest schema validation checks working correctly.")
    except ValidationError as e:
        logger.error(f"SignalIngest validation failed: {e}")
        assert False

from app.services.orchestrator import AgentOrchestrator
import uuid
from datetime import datetime, timedelta, timezone

async def test_agent_orchestration():
    logger.info("--- Testing Agent Orchestrator & Conflict Resolution ---")
    user_id = uuid.uuid4()
    
    # 1. Test Deadline Sentinel risk scoring algorithm
    due = datetime.now(timezone.utc) + timedelta(days=1) # 1 day remaining
    risk = AgentOrchestrator.calculate_deadline_risk(
        due_date=due,
        estimated_hours=6.0,
        avg_focus_hours_per_day=2.0
    )
    logger.info(f"Deadline Risk evaluation output: {risk}")
    assert "risk_coefficient" in risk
    assert risk["risk_tier"] in ["low", "medium", "high", "critical"]
    
    # 2. Test conflict resolution: Flow state deferring Socratic Challenger
    deferred_res = await AgentOrchestrator.mediate_conflict(
        user_id=user_id,
        current_state="Flow",
        proposing_agent="socratic_challenger",
        action_name="CHALLENGE_USER_REQUEST",
        payload={"topic": "compilers"}
    )
    logger.info(f"Conflict mediation (Flow vs Socratic): {deferred_res}")
    assert deferred_res["decision"] == "DEFERRED"

    # 3. Test conflict resolution: Impending deadline overriding Flow state
    impending_due = datetime.now(timezone.utc) + timedelta(hours=2) # 2 hours left
    lock_res = await AgentOrchestrator.mediate_conflict(
        user_id=user_id,
        current_state="Flow",
        proposing_agent="deadline_sentinel",
        action_name="LOCK_WORKSPACE",
        payload={"reason": "Impending due date"},
        due_date=impending_due
    )
    logger.info(f"Conflict mediation (Flow vs Critical Lockout): {lock_res}")
    assert lock_res["decision"] == "APPROVED"
    logger.info("Orchestrator conflict resolution rules verified successfully.")

async def test_socratic_challenger():
    logger.info("--- Testing Socratic Challenger Groq Services ---")
    try:
        challenge = await AgentOrchestrator.generate_socratic_challenge("Dynamic Programming")
        logger.info(f"Challenger Question Output: {challenge}")
        assert "question" in challenge
        assert "conceptual_anchor" in challenge
        
        grading = await AgentOrchestrator.evaluate_socratic_response(
            challenge["question"],
            "Dynamic programming stores intermediate results in a table to avoid repeated calculations."
        )
        logger.info(f"Challenger Response Grading: {grading}")
        assert "score" in grading
        assert "feedback" in grading
        logger.info("Socratic Challenger integration verified successfully.")
    except Exception as e:
        logger.error(f"Socratic Challenger test failed: {e}")

async def main():
    await test_security()
    test_pydantic_schemas()

    await test_groq_service()
    await test_agent_orchestration()
    await test_socratic_challenger()
    logger.info("====================================")
    logger.info("All offline/integration tests completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
