import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class CognitiveStateEngine:
    """
    Complete state machine and inference service for Cognitive Load.
    Replaces the LLM fallback for real-time deterministic evaluation.
    """

    STATES = ["FLOW", "DISTRACTED", "FATIGUED", "OVERLOADED"]

    @classmethod
    def evaluate(cls, telemetry: Dict[str, Any], current_state: str = "FLOW") -> Dict[str, Any]:
        """
        Evaluates a complete cognitive state block based on raw telemetry.
        """
        # Parse inputs with defaults
        typing_cadence = telemetry.get("typing_cadence", 60) # WPM
        context_switching = telemetry.get("context_switches_per_min", 2)
        idle_duration = telemetry.get("idle_duration_sec", 0)
        deadline_proximity = telemetry.get("deadline_proximity_hrs", 24)
        active_app = telemetry.get("active_app", "VS Code")

        # Core logic weights
        # High cadence + Low context switching = FLOW
        # High context switching + Low cadence = DISTRACTED
        # High idle + low cadence = FATIGUED
        # High context switching + close deadline = OVERLOADED

        new_state = current_state
        confidence = 0.85
        attention_stability = "Stable"
        focus_trend = "Positive"
        cognitive_load = "Optimal"

        # Determine raw cognitive load score (0-100)
        load_score = 50 + (context_switching * 5) - (typing_cadence * 0.2) + (24 / max(1, deadline_proximity) * 10)

        # Base State Machine Transitions
        if context_switching > 10 and deadline_proximity < 2:
            new_state = "OVERLOADED"
            confidence = 0.92
            attention_stability = "Erratic"
            focus_trend = "Negative"
            cognitive_load = "Critical"
        elif idle_duration > 300 and typing_cadence < 10:
            new_state = "FATIGUED"
            confidence = 0.88
            attention_stability = "Drifting"
            focus_trend = "Negative"
            cognitive_load = "Depleted"
        elif context_switching > 6:
            new_state = "DISTRACTED"
            confidence = 0.89
            attention_stability = "Erratic"
            focus_trend = "Negative"
            cognitive_load = "High"
        elif typing_cadence > 40 and context_switching <= 3:
            new_state = "FLOW"
            confidence = 0.94
            attention_stability = "Optimal"
            focus_trend = "Positive"
            cognitive_load = "Optimal"

        # Return standardized output mapping
        return {
            "state": new_state,
            "confidence": confidence,
            "attention_stability": attention_stability,
            "focus_trend": focus_trend,
            "cognitive_load": cognitive_load
        }
