class CognitiveState {
  final String status; // FLOW, DISTRACTED, FATIGUED
  final int confidence;
  final String currentObjective;
  final String workspaceStatus;
  final int minutesRemaining;

  CognitiveState({
    required this.status,
    required this.confidence,
    required this.currentObjective,
    required this.workspaceStatus,
    required this.minutesRemaining,
  });

  factory CognitiveState.initial() => CognitiveState(
        status: 'FLOW',
        confidence: 92,
        currentObjective: 'Compiler Construction',
        workspaceStatus: 'Deep Work Locked',
        minutesRemaining: 38,
      );
}

class IntelligenceEvent {
  final String agentName;
  final String description;
  final bool isHighlight;

  IntelligenceEvent({
    required this.agentName,
    required this.description,
    this.isHighlight = false,
  });
}
