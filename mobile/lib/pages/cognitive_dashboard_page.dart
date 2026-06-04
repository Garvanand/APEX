import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/cognitive_state.dart';
import '../services/websocket_service.dart';
import 'emergency_page.dart';

class CognitiveDashboardPage extends StatefulWidget {
  const CognitiveDashboardPage({super.key});

  @override
  State<CognitiveDashboardPage> createState() => _CognitiveDashboardPageState();
}

class _CognitiveDashboardPageState extends State<CognitiveDashboardPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  String _activeTimeframe = '1H';
  
  // Historical data mock points for different timeframes (0.0 to 1.0)
  final Map<String, List<double>> _mockHistory = {
    '1H': [0.65, 0.72, 0.85, 0.94, 0.92, 0.88, 0.91, 0.94, 0.93, 0.85, 0.78, 0.82, 0.88, 0.94, 0.92, 0.94],
    '24H': [0.80, 0.85, 0.74, 0.60, 0.45, 0.30, 0.50, 0.75, 0.82, 0.88, 0.90, 0.94, 0.85, 0.80, 0.78, 0.85],
    '7D': [0.75, 0.78, 0.82, 0.80, 0.84, 0.88, 0.91, 0.85, 0.82, 0.74, 0.79, 0.84, 0.89, 0.87, 0.85, 0.88],
  };

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Color _getStateColor(String state) {
    switch (state) {
      case 'Flow':
        return const Color(0xFF00D26A);
      case 'Distracted':
        return const Color(0xFFFFB800);
      case 'Fatigued':
        return const Color(0xFF00A3FF);
      case 'Overloaded':
        return const Color(0xFFFF4D4F);
      default:
        return Colors.white;
    }
  }

  @override
  Widget build(BuildContext context) {
    final wsService = Provider.of<WebSocketService>(context);
    final displayedState = wsService.currentState?.state ?? 'Flow';
    final confidence = wsService.currentState?.confidenceScore ?? 0.92;
    final stateColor = _getStateColor(displayedState);

    // Adjust pulse speed based on cognitive state
    if (displayedState == 'Overloaded') {
      _pulseController.duration = const Duration(milliseconds: 800);
      if (!_pulseController.isAnimating) _pulseController.repeat();
    } else if (displayedState == 'Fatigued') {
      _pulseController.duration = const Duration(milliseconds: 3000);
      if (!_pulseController.isAnimating) _pulseController.repeat();
    } else {
      _pulseController.duration = const Duration(milliseconds: 2000);
      if (!_pulseController.isAnimating) _pulseController.repeat();
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'COGNITIVE TELEMETRY',
          style: TextStyle(
            fontFamily: 'Cabinet Grotesk',
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            color: Colors.grey[400],
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on, color: Color(0xFFFFD400)),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const EmergencyPage()),
              );
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Concentric Telemetry Pulsing Rings
            Center(
              child: Container(
                width: double.infinity,
                height: 220,
                decoration: BoxDecoration(
                  color: const Color(0xFF000000),
                  borderRadius: BorderRadius.circular(12),
                  border: BorderSide(color: const Color(0xFF1F1F1F)),
                ),
                child: ClipRect(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      AnimatedBuilder(
                        animation: _pulseController,
                        builder: (context, child) {
                          return CustomPaint(
                            painter: PulseRingsPainter(
                              progress: _pulseController.value,
                              color: stateColor,
                            ),
                            size: const Size(double.infinity, 220),
                          );
                        },
                      ),
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${(confidence * 100).round()}%',
                            style: const TextStyle(
                              fontSize: 48,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Cabinet Grotesk',
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: stateColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                              border: BorderSide(color: stateColor.withOpacity(0.3)),
                            ),
                            child: Text(
                              '${displayedState.toUpperCase()} STATE',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: stateColor,
                                letterSpacing: 1.0,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Timeframe Selector Buttons
            Row(
              children: [
                _buildTimeframeButton('1H'),
                const SizedBox(width: 8),
                _buildTimeframeButton('24H'),
                const SizedBox(width: 8),
                _buildTimeframeButton('7D'),
              ],
            ),
            const SizedBox(height: 12),

            // Area Spline Chart Card
            Container(
              width: double.infinity,
              height: 200,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF121212),
                borderRadius: BorderRadius.circular(8),
                border: BorderSide(color: const Color(0xFF2C2C2C)),
              ),
              child: CustomPaint(
                painter: AreaSplineChartPainter(
                  data: _mockHistory[_activeTimeframe]!,
                  accentColor: const Color(0xFFFFD400),
                ),
                size: const Size(double.infinity, 168),
              ),
            ),
            const SizedBox(height: 24),

            // Signal Breakdown Grid Header
            Text(
              'LIVE TELEMETRY SIGNALS',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.0,
                color: Colors.grey[500],
              ),
            ),
            const SizedBox(height: 12),

            // 2x2 Grid of sensor outputs
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 2.1,
              children: [
                _buildSignalCard(
                  'HRV Stability',
                  '72 ms',
                  Icons.favorite_outline,
                  const Color(0xFF00D26A),
                ),
                _buildSignalCard(
                  'Gaze Fixation',
                  '96%',
                  Icons.remove_red_eye_outlined,
                  const Color(0xFF00D26A),
                ),
                _buildSignalCard(
                  'Typing Cadence',
                  'Normal',
                  Icons.keyboard_outlined,
                  const Color(0xFF00D26A),
                ),
                _buildSignalCard(
                  'Ambient Audio',
                  '38 dB',
                  Icons.volume_up_outlined,
                  Colors.white,
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Manual override action trigger
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      side: const BorderSide(color: Color(0xFF2C2C2C)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                      backgroundColor: const Color(0xFF121212),
                    ),
                    onPressed: () => _showOverrideSheet(context),
                    child: Text(
                      'MANUAL OVERRIDE',
                      style: TextStyle(
                        color: Colors.grey[300],
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeframeButton(String label) {
    final isActive = _activeTimeframe == label;
    return GestureDetector(
      onTap: () {
        setState(() {
          _activeTimeframe = label;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFFFFD400) : const Color(0xFF121212),
          borderRadius: BorderRadius.circular(4),
          border: BorderSide(
            color: isActive ? const Color(0xFFFFD400) : const Color(0xFF2C2C2C),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? const Color(0xFF0A0A0A) : const Color(0xFFA5A5A5),
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildSignalCard(String label, String value, IconData icon, Color stateColor) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF121212),
        borderRadius: BorderRadius.circular(8),
        border: BorderSide(color: const Color(0xFF2C2C2C)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF0A0A0A),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Icon(icon, size: 18, color: Colors.grey[400]),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  label,
                  style: TextStyle(color: Colors.grey[500], fontSize: 10),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Text(
                      value,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: stateColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showOverrideSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF121212),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'MANUAL STATE OVERRIDE',
                style: TextStyle(
                  fontFamily: 'Cabinet Grotesk',
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Directly override the state baseline for testing purposes.',
                style: TextStyle(color: Colors.grey[400], fontSize: 12),
              ),
              const SizedBox(height: 24),
              _buildOverrideOption(context, 'Flow', 'Quiet environment, notifications muted'),
              const SizedBox(height: 12),
              _buildOverrideOption(context, 'Distracted', 'Focus redirection indicators active'),
              const SizedBox(height: 12),
              _buildOverrideOption(context, 'Fatigued', 'Suggested rest/recovery notifications active'),
              const SizedBox(height: 12),
              _buildOverrideOption(context, 'Overloaded', 'Emergency task triage workspace active'),
            ],
          ),
        );
      },
    );
  }

  Widget _buildOverrideOption(BuildContext context, String state, String desc) {
    final stateColor = _getStateColor(state);
    return InkWell(
      onTap: () {
        final wsService = Provider.of<WebSocketService>(context, listen: false);
        if (wsService.isConnected) {
          double hr = 72;
          double hrv = 54;
          int blinks = 12;
          double density = 0.5;
          double db = 35;
          String app = "VS Code";

          if (state == 'Flow') {
            hr = 66; hrv = 68; blinks = 10; density = 0.25; db = 31; app = "VS Code";
          } else if (state == 'Distracted') {
            hr = 76; hrv = 44; blinks = 16; density = 0.85; db = 48; app = "Discord";
          } else if (state == 'Fatigued') {
            hr = 58; hrv = 32; blinks = 7; density = 0.15; db = 30; app = "Chrome";
          } else if (state == 'Overloaded') {
            hr = 94; hrv = 20; blinks = 13; density = 0.95; db = 56; app = "Slack";
          }

          wsService.sendTelemetry(TelemetrySignals(
            heartRate: hr,
            hrv: hrv,
            blinkRatePerMin: blinks,
            screenInteractionDensity: density,
            activeApplication: app,
            ambientNoiseDb: db,
            timestamp: DateTime.now(),
          ));
        }
        Navigator.pop(context);
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0A0A0A),
          border: BorderSide(color: const Color(0xFF2C2C2C)),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  state,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: stateColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  desc,
                  style: TextStyle(color: Colors.grey[500], fontSize: 11),
                ),
              ],
            ),
            Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey[700]),
          ],
        ),
      ),
    );
  }
}

class PulseRingsPainter extends CustomPainter {
  final double progress;
  final Color color;

  PulseRingsPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    // Concurrently paint 3 expanding waves
    for (int i = 0; i < 3; i++) {
      final ringProgress = (progress + i / 3.0) % 1.0;
      final radius = 30.0 + ringProgress * 70.0;
      paint.color = color.withOpacity((1.0 - ringProgress) * 0.4);
      canvas.drawCircle(center, radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant PulseRingsPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.color != color;
  }
}

class AreaSplineChartPainter extends CustomPainter {
  final List<double> data;
  final Color accentColor;

  AreaSplineChartPainter({required this.data, required this.accentColor});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final widthStep = size.width / (data.length - 1);
    
    // Draw horizontal grid lines
    final gridPaint = Paint()
      ..color = const Color(0xFF1F1F1F)
      ..strokeWidth = 1.0;
    
    for (int i = 1; i < 4; i++) {
      double y = size.height * (i / 4.0);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    final splinePath = Path();
    final areaPath = Path();

    // Start coordinates
    double startY = size.height - (data[0] * size.height);
    splinePath.moveTo(0, startY);
    areaPath.moveTo(0, size.height);
    areaPath.lineTo(0, startY);

    for (int i = 0; i < data.length - 1; i++) {
      double x1 = i * widthStep;
      double y1 = size.height - (data[i] * size.height);
      double x2 = (i + 1) * widthStep;
      double y2 = size.height - (data[i + 1] * size.height);

      // Control points for smooth bezier interpolation
      double cx1 = x1 + widthStep / 2;
      double cy1 = y1;
      double cx2 = x2 - widthStep / 2;
      double cy2 = y2;

      splinePath.cubicTo(cx1, cy1, cx2, cy2, x2, y2);
      areaPath.cubicTo(cx1, cy1, cx2, cy2, x2, y2);
    }

    areaPath.lineTo(size.width, size.height);
    areaPath.close();

    // Paint the filled area with gradient
    final areaPaint = Paint()
      ..style = PaintingStyle.fill
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          accentColor.withOpacity(0.15),
          accentColor.withOpacity(0.0),
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    canvas.drawPath(areaPath, areaPaint);

    // Paint the spline line
    final linePaint = Paint()
      ..color = accentColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    canvas.drawPath(splinePath, linePaint);
  }

  @override
  bool shouldRepaint(covariant AreaSplineChartPainter oldDelegate) {
    return oldDelegate.data != data || oldDelegate.accentColor != accentColor;
  }
}
