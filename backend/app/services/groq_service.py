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

async def classify_chat_message(message_text: str, current_task: str) -> Dict[str, Any]:
    """
    Invokes Groq Cloud's llama-3.1-8b-instant to classify and score incoming chat notifications.
    Returns:
    {
        "category": "academic" | "social" | "noise",
        "relevance_score": float,
        "summary": str,
        "should_override": bool
    }
    """
    system_prompt = (
        "You are the APEX Peer Radar message analyst. Your task is to process incoming chat notifications "
        "and classify them into one of: 'academic', 'social', or 'noise'. You must compute a relevance score "
        "relative to the user's current task description. "
        "If a message is academic and highly relevant, or contains critical academic warnings, determine if "
        "it should override Focus DND rules.\n\n"
        "Respond ONLY with a JSON object containing keys:\n"
        "- 'category': 'academic' | 'social' | 'noise'\n"
        "- 'relevance_score': float between 0.0 and 1.0\n"
        "- 'summary': brief 1-sentence summary\n"
        "- 'should_override': boolean (true if highly urgent academic action needed)\n\n"
        "Do not include markdown code block formatting or pre/post conversational text."
    )

    if not groq_client:
        return mock_classify_chat_message(message_text, current_task)

    try:
        response = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps({"message_text": message_text, "current_task": current_task})}
            ],
            temperature=0.1,
            max_tokens=256,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        logger.info(f"Groq chat classification response: {content}")
        return json.loads(content)
    except Exception as e:
        logger.error(f"Failed calling Groq Chat API: {e}. Falling back to rule-based logic.")
        return mock_classify_chat_message(message_text, current_task)

def mock_classify_chat_message(message_text: str, current_task: str) -> Dict[str, Any]:
    """Heuristic fallback for Peer Radar chat message classifier."""
    msg = message_text.lower()
    task = current_task.lower()
    
    # Simple heuristics
    is_academic = any(word in msg for word in ["assignment", "project", "exam", "grade", "quiz", "lecture", "due", "professor", "ta", "compilers", "csl"])
    is_urgent = any(word in msg for word in ["urgent", "emergency", "fail", "now", "help", "extension"])
    
    # Calculate relevance
    relevance = 0.1
    if is_academic:
        relevance = 0.5
        # Cross-reference with task keywords
        task_words = [w for w in task.split() if len(w) > 3]
        matching_words = [w for w in task_words if w in msg]
        if matching_words:
            relevance = min(0.95, 0.5 + (len(matching_words) * 0.15))
            
    category = "noise"
    if is_academic:
        category = "academic"
    elif any(word in msg for word in ["party", "dinner", "game", "lol", "haha", "hey", "bro", "movie"]):
        category = "social"
        
    return {
        "category": category,
        "relevance_score": relevance,
        "summary": message_text[:60] + "..." if len(message_text) > 60 else message_text,
        "should_override": is_academic and (relevance > 0.7 or is_urgent)
    }

