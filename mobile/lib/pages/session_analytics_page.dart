import 'package:flutter/material.dart';

class SessionAnalyticsPage extends StatefulWidget {
  const SessionAnalyticsPage({super.key});

  @override
  State<SessionAnalyticsPage> createState() => _SessionAnalyticsPageState();
}

class _SessionAnalyticsPageState extends State<SessionAnalyticsPage> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  
  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        title: const Text(
          "SESSION ANALYTICS",
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
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 3 Horizontal Stat Boxes
              Row(
                children: [
                  Expanded(
                    child: _buildStatBox("Flow Time", "12.4h", false),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildStatBox("Focus Score", "88%", true),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildStatBox("Blocked", "42", false),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Donut State Distribution Header
              const Text(
                "COGNITIVE STATE DISTRIBUTION",
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFA5A5A5),
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 12),

              // Donut Chart Container
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF121212),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: const Color(0xFF2C2C2C)),
                ),
                child: Row(
                  children: [
                    SizedBox(
                      width: 120,
                      height: 120,
                      child: AnimatedBuilder(
                        animation: _animationController,
                        builder: (context, child) {
                          return CustomPaint(
                            painter: _DonutChartPainter(
                              progress: _animationController.value,
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 24),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLegendItem("Flow State", "62%", const Color(0xFF00D26A)),
                          const SizedBox(height: 8),
                          _buildLegendItem("Fatigued State", "18%", const Color(0xFF00A3FF)),
                          const SizedBox(height: 8),
                          _buildLegendItem("Distracted State", "12%", const Color(0xFFFFB800)),
                          const SizedBox(height: 8),
                          _buildLegendItem("Overloaded State", "8%", const Color(0xFFFF4D4F)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Hourly timeline chart card
              const Text(
                "WEEKLY COGNITIVE LOAD TREND",
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFA5A5A5),
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 12),

              Container(
                height: 220,
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF121212),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: const Color(0xFF2C2C2C)),
                ),
                child: CustomPaint(
                  painter: _WeeklyTimelinePainter(),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatBox(String label, String value, bool isHighlighted) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF121212),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(
          color: isHighlighted ? const Color(0xFFFFD400) : const Color(0xFF2C2C2C),
        ),
      ),
      child: Column(
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              color: Color(0xFFA5A5A5),
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Cabinet Grotesk',
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: isHighlighted ? const Color(0xFFFFD400) : Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, String percentage, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(fontFamily: 'Inter', fontSize: 12, color: Colors.white),
            ),
          ],
        ),
        Text(
          percentage,
          style: const TextStyle(
            fontFamily: 'JetBrains Mono',
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: Color(0xFFA5A5A5),
          ),
        ),
      ],
    );
  }
}

class _DonutChartPainter extends CustomPainter {
  final double progress;

  _DonutChartPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final rect = Rect.fromCircle(center: center, radius: radius - 10);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 14;

    double startAngle = -3.14 / 2;

    // Segment values: Flow: 62%, Fatigue: 18%, Distracted: 12%, Overload: 8%
    final segments = [
      {"angle": 2 * 3.14 * 0.62, "color": const Color(0xFF00D26A)},
      {"angle": 2 * 3.14 * 0.18, "color": const Color(0xFF00A3FF)},
      {"angle": 2 * 3.14 * 0.12, "color": const Color(0xFFFFB800)},
      {"angle": 2 * 3.14 * 0.08, "color": const Color(0xFFFF4D4F)},
    ];

    for (var segment in segments) {
      final sweepAngle = (segment['angle'] as double) * progress;
      paint.color = segment['color'] as Color;
      canvas.drawArc(rect, startAngle, sweepAngle, false, paint);
      startAngle += (segment['angle'] as double);
    }
  }

  @override
  bool shouldRepaint(covariant _DonutChartPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

class _WeeklyTimelinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Draw horizontal grid lines
    final gridPaint = Paint()
      ..color = const Color(0xFF1F1F1F)
      ..strokeWidth = 1.0;

    for (int i = 1; i < 4; i++) {
      double y = size.height * (i / 4.0);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    final points = [
      Offset(0, size.height * 0.4),
      Offset(size.width * 0.16, size.height * 0.3),
      Offset(size.width * 0.32, size.height * 0.6),
      Offset(size.width * 0.48, size.height * 0.2),
      Offset(size.width * 0.64, size.height * 0.5),
      Offset(size.width * 0.80, size.height * 0.8),
      Offset(size.width, size.height * 0.1),
    ];

    final path = Path();
    path.moveTo(points[0].dx, points[0].dy);

    for (int i = 0; i < points.length - 1; i++) {
      final p1 = points[i];
      final p2 = points[i + 1];
      final controlX = p1.dx + (p2.dx - p1.dx) / 2;
      path.cubicTo(controlX, p1.dy, controlX, p2.dy, p2.dx, p2.dy);
    }

    // Paint spline
    final linePaint = Paint()
      ..color = const Color(0xFFFFD400)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    canvas.drawPath(path, linePaint);

    // Draw little baseline circles
    final pointPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    for (var point in points) {
      canvas.drawCircle(point, 3, pointPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _WeeklyTimelinePainter oldDelegate) => false;
}
