import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/state_models.dart';

final cognitiveStateProvider = StateProvider<CognitiveState>((ref) {
  return CognitiveState.initial();
});

final intelligenceFeedProvider = StateProvider<List<IntelligenceEvent>>((ref) {
  return [
    IntelligenceEvent(
      agentName: 'STATE AGENT',
      description: 'Flow state locked. Notifications suppressed.',
      isHighlight: true,
    ),
    IntelligenceEvent(
      agentName: 'ENVIRONMENT SCULPTOR',
      description: 'Closed 20 inactive tabs to free memory.',
    ),
    IntelligenceEvent(
      agentName: 'PEER RADAR',
      description: 'Synthesized 4 Discord messages into 1 insight.',
    ),
  ];
});

final isPairedProvider = StateProvider<bool>((ref) => false);
