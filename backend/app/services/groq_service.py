import json
import logging
from typing import Dict, Any
from groq import AsyncGroq
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize AsyncGroq client if API key is provided
groq_client = None
if settings.GROQ_API_KEY:
    groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)

async def classify_cognitive_state(signals: Dict[str, Any]) -> Dict[str, Any]:
    """
    Invokes Groq Cloud's llama-3.1-8b-instant to classify cognitive state.
    Returns a dictionary matching the schema:
    {
        "classified_state": "Flow" | "Distracted" | "Fatigued" | "Overloaded",
        "confidence_score": float,
        "contributing_metrics": List[str]
    }
    """
    system_prompt = (
        "You are the APEX State Agent telemetry classifier. Your task is to process user telemetry logs "
        "and classify their current cognitive state. You must analyze the incoming JSON telemetry and output "
        "a single, structured JSON document containing the classification.\n\n"
        "Classifications:\n"
        "- \"Flow\": User is focused and productive. Characterized by stable HR, normal-to-high HRV, high interaction density, and low context switching.\n"
        "- \"Distracted\": User is distracted. Characterized by frequent context switching, high blink rates, and access to non-work applications.\n"
        "- \"Fatigued\": User is fatigued. Characterized by low HRV, low screen interaction density, and slow inputs.\n"
        "- \"Overloaded\": User is stressed or overwhelmed. Characterized by elevated HR, low HRV, and high screen interaction density.\n\n"
        "Respond ONLY with a JSON object containing keys: 'classified_state' (must be one of 'Flow', 'Distracted', 'Fatigued', 'Overloaded'), "
        "'confidence_score' (float between 0.0 and 1.0), and 'contributing_metrics' (list of strings). "
        "Do not include markdown code block formatting (like ```json or ```) or any pre/post conversational text."
    )

    if not groq_client:
        logger.warning("GROQ_API_KEY is not configured. Falling back to rule-based classification.")
        return mock_classify_cognitive_state(signals)

    try:
        response = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(signals)}
            ],
            temperature=0.1,
            max_tokens=256,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        logger.info(f"Groq classification response: {content}")
        return json.loads(content)
    except Exception as e:
        logger.error(f"Failed calling Groq API: {e}. Falling back to rule-based logic.")
        return mock_classify_cognitive_state(signals)

def mock_classify_cognitive_state(signals: Dict[str, Any]) -> Dict[str, Any]:
    """Heuristic fallback when Groq is unavailable."""
    active_app = (signals.get("active_application") or "").lower()
    hrv = signals.get("hrv") or 50.0
    heart_rate = signals.get("heart_rate") or 75.0
    screen_interaction = signals.get("screen_interaction_density") or 0.5

    if any(app in active_app for app in ["youtube", "discord", "whatsapp", "slack", "chrome"]):
        # Check if they are actually reading or writing vs scrolling leisure sites
        if active_app in ["youtube", "facebook", "twitter", "reddit"]:
            return {
                "classified_state": "Distracted",
                "confidence_score": 0.85,
                "contributing_metrics": ["active_app_category_leisure"]
            }
            
    if heart_rate > 95.0 and hrv < 35.0:
        return {
            "classified_state": "Overloaded",
            "confidence_score": 0.82,
            "contributing_metrics": ["elevated_heart_rate", "low_hrv"]
        }
    
    if hrv < 30.0 and screen_interaction < 0.2:
        return {
            "classified_state": "Fatigued",
            "confidence_score": 0.78,
            "contributing_metrics": ["critically_low_hrv", "low_screen_interaction"]
        }
        
    return {
        "classified_state": "Flow",
        "confidence_score": 0.88,
        "contributing_metrics": ["stable_biometrics", "active_work_context"]
    }
