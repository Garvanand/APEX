import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';

class VoiceCapturePage extends StatefulWidget {
  const VoiceCapturePage({super.key});

  @override
  State<VoiceCapturePage> createState() => _VoiceCapturePageState();
}

class _VoiceCapturePageState extends State<VoiceCapturePage> with TickerProviderStateMixin {
  late AnimationController _waveformController;
  Timer? _recordingTimer;
  int _secondsRecorded = 0;
  bool _isRecording = false;

  final List<double> _waveValues = List.generate(30, (_) => 0.1);
  final List<String> _fullTranscript = [
    "The", "compiler", "parses", "grammar", "structures",
    "into", "an", "AST", "or", "abstract", "syntax", "tree",
    "to", "facilitate", "semantic", "analysis", "and",
    "optimization", "passes", "before", "generating",
    "target", "machine", "code", "instructions."
  ];

  int _visibleWordsCount = 0;
  Timer? _transcriptTimer;

  @override
  void initState() {
    super.initState();
    _waveformController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    )..repeat(reverse: true);
  }

  void _toggleRecording() {
    if (_isRecording) {
      _stopRecording();
    } else {
      _startRecording();
    }
  }

  void _startRecording() {
    setState(() {
      _isRecording = true;
      _secondsRecorded = 0;
      _visibleWordsCount = 0;
    });

    _recordingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _secondsRecorded++;
      });
    });

    _transcriptTimer = Timer.periodic(const Duration(milliseconds: 600), (timer) {
      if (_visibleWordsCount < _fullTranscript.length) {
        setState(() {
          _visibleWordsCount++;
        });
      } else {
        _transcriptTimer?.cancel();
      }
    });
  }

  void _stopRecording() {
    _recordingTimer?.cancel();
    _transcriptTimer?.cancel();
    setState(() {
      _isRecording = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Voice note recorded and synced to Knowledge Hub"),
        backgroundColor: Color(0xFF00D26A),
      ),
    );
  }

  @override
  void dispose() {
    _waveformController.dispose();
    _recordingTimer?.cancel();
    _transcriptTimer?.cancel();
    super.dispose();
  }

  String _formatDuration(int totalSeconds) {
    int minutes = totalSeconds ~/ 60;
    int seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "VOICE CAPTURE",
          style: TextStyle(
            fontFamily: 'Cabinet Grotesk',
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            color: Colors.white,
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Header duration indicators
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _isRecording ? "RECORDING ACTIVE" : "STANDBY",
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFA5A5A5),
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    _formatDuration(_secondsRecorded),
                    style: const TextStyle(
                      fontFamily: 'JetBrains Mono',
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Waveform display card (140px height)
              Container(
                height: 140,
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFF121212),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: const Color(0xFF2C2C2C)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: List.generate(30, (index) {
                    return AnimatedBuilder(
                      animation: _waveformController,
                      builder: (context, child) {
                        double factor = _isRecording
                            ? (math.sin(index + _waveformController.value * 2 * math.pi).abs() * 0.8 + 0.2)
                            : 0.1;
                        return Container(
                          width: 4,
                          height: 100 * factor,
                          decoration: BoxDecoration(
                            color: _isRecording ? const Color(0xFFFF4D4F) : const Color(0xFF2C2C2C),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        );
                      },
                    );
                  }),
                ),
              ),
              const SizedBox(height: 24),

              // Transcript preview card (220px height)
              Expanded(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF121212),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: const Color(0xFF2C2C2C)),
                  ),
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: RichText(
                      text: TextSpan(
                        children: List.generate(_visibleWordsCount, (index) {
                          final word = _fullTranscript[index];
                          final isKeyword = word.toUpperCase() == "AST" || word.toUpperCase() == "COMPILER";
                          return TextSpan(
                            text: "$word ",
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 14,
                              height: 1.5,
                              color: isKeyword
                                  ? const Color(0xFFFFD400)
                                  : Colors.white,
                              fontWeight: isKeyword ? FontWeight.bold : FontWeight.normal,
                            ),
                          );
                        }),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Capture controller
              Container(
                height: 100,
                alignment: Alignment.center,
                child: GestureDetector(
                  onTap: _toggleRecording,
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: const Color(0xFF121212),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: _isRecording ? const Color(0xFFFF4D4F) : const Color(0xFF2C2C2C),
                        width: 2,
                      ),
                    ),
                    child: Center(
                      child: Container(
                        width: _isRecording ? 24 : 32,
                        height: _isRecording ? 24 : 32,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFF4D4F),
                          borderRadius: BorderRadius.circular(_isRecording ? 4 : 16),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
