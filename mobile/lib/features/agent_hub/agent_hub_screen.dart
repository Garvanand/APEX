import 'package:flutter/material.dart';
import '../../core/theme.dart';
import 'agent_detail_screen.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'dart:async';

class AgentHubScreen extends StatefulWidget {
  const AgentHubScreen({super.key});

  @override
  State<AgentHubScreen> createState() => _AgentHubScreenState();
}

class _AgentHubScreenState extends State<AgentHubScreen> {
  double _accelX = 0, _accelY = 0, _accelZ = 0;
  StreamSubscription? _accelSub;

  final List<Map<String, dynamic>> agents = [
    {
      "id": "study",
      "name": "Study Agent",
      "desc": "Converts notes to flashcards & quizzes",
      "icon": Icons.menu_book,
      "color": const Color(0xFF2AD98F)
    },
    {
      "id": "schedule",
      "name": "Schedule Agent",
      "desc": "Parses messy text into a timeline",
      "icon": Icons.calendar_month,
      "color": const Color(0xFFE94A4A)
    },
    {
      "id": "expense",
      "name": "Expense Agent",
      "desc": "Categorizes receipt text",
      "icon": Icons.receipt_long,
      "color": const Color(0xFFFFB800)
    },
    {
      "id": "content",
      "name": "Content Agent",
      "desc": "Drafts emails and proposals",
      "icon": Icons.edit_document,
      "color": const Color(0xFF9D4EDD)
    }
  ];

  @override
  void initState() {
    super.initState();
    _accelSub = accelerometerEventStream().listen((event) {
      setState(() {
        _accelX = event.x;
        _accelY = event.y;
        _accelZ = event.z;
      });
    });
  }

  @override
  void dispose() {
    _accelSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ApexTheme.black,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Sensor Header
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("APEX AgentOS", style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: -1)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: ApexTheme.darkGray,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: ApexTheme.borderGray)
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.sensors, color: ApexTheme.iqooYellow, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          "SENSORS: [X:${_accelX.toStringAsFixed(1)} Y:${_accelY.toStringAsFixed(1)} Z:${_accelZ.toStringAsFixed(1)}]",
                          style: const TextStyle(color: ApexTheme.iqooYellow, fontFamily: 'monospace', fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            // Agent Grid
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.85
                ),
                itemCount: agents.length,
                itemBuilder: (context, index) {
                  final agent = agents[index];
                  return GestureDetector(
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(
                        builder: (context) => AgentDetailScreen(agent: agent)
                      ));
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: ApexTheme.darkGray,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: ApexTheme.borderGray),
                      ),
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: agent['color'].withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12)
                            ),
                            child: Icon(agent['icon'], color: agent['color'], size: 28),
                          ),
                          const Spacer(),
                          Text(agent['name'], style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          Text(agent['desc'], style: const TextStyle(color: ApexTheme.textMuted, fontSize: 12, height: 1.3)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
