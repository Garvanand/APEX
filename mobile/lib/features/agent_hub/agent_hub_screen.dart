import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/websocket_service.dart';
import 'agent_detail_screen.dart';

class AgentHubScreen extends StatefulWidget {
  const AgentHubScreen({super.key});

  @override
  State<AgentHubScreen> createState() => _AgentHubScreenState();
}

class _AgentHubScreenState extends State<AgentHubScreen> {
  final _ws = WebSocketService();
  
  Map<String, dynamic> _demoState = {
    "step": -1,
    "cognitiveState": "IDLE",
    "failureRisk": "--",
    "activeIntervention": "None",
    "flowConfidence": "--",
    "timeSaved": "--",
    "contextSwitches": "--",
    "estimatedCompletion": "--",
    "causality": null,
    "before": {
      "failureRisk": "89%", "estimatedCompletion": "11:58 PM", "contextSwitches": "17", "timeSaved": "0m"
    },
    "after": {
      "failureRisk": "--", "estimatedCompletion": "--", "contextSwitches": "--", "timeSaved": "--"
    }
  };

  final List<Map<String, dynamic>> agents = [
    { "id": "study", "name": "Study", "desc": "Notes", "icon": Icons.menu_book, "color": const Color(0xFF2AD98F) },
    { "id": "schedule", "name": "Schedule", "desc": "Timeline", "icon": Icons.calendar_month, "color": const Color(0xFFE94A4A) },
    { "id": "expense", "name": "Expense", "desc": "Receipts", "icon": Icons.receipt_long, "color": const Color(0xFFFFB800) },
    { "id": "content", "name": "Content", "desc": "Drafts", "icon": Icons.edit_document, "color": const Color(0xFF9D4EDD) }
  ];

  final List<Map<String, dynamic>> timelineSteps = [
    { "id": 0, "label": "Distraction Detected" },
    { "id": 1, "label": "Deadline Risk Calculated" },
    { "id": 2, "label": "Environment Adapted" },
    { "id": 3, "label": "Critical Insight Surfaced" },
    { "id": 4, "label": "Understanding Validated" },
    { "id": 5, "label": "Flow Restored" }
  ];

  @override
  void initState() {
    super.initState();
    _ws.connect();
    _ws.addListener(_onWsUpdate);
  }

  void _onWsUpdate() {
    if (_ws.lastDemoSync != null) {
      setState(() {
        _demoState = _ws.lastDemoSync!;
      });
    } else {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _ws.removeListener(_onWsUpdate);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final beforeMetrics = _demoState["before"] ?? { "failureRisk": "89%", "estimatedCompletion": "11:58 PM", "contextSwitches": "17", "timeSaved": "0m" };
    final afterMetrics = _demoState["after"] ?? { "failureRisk": "--", "estimatedCompletion": "--", "contextSwitches": "--", "timeSaved": "--" };
    final currentStep = _demoState["step"] ?? -1;

    return Scaffold(
      backgroundColor: ApexTheme.black,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. GLOBAL CONNECTION STATUS
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Colors.white10)),
                color: Color(0xFF111111),
              ),
              child: Row(
                children: [
                  Icon(
                    _ws.isConnected ? Icons.cloud_done : Icons.cloud_off, 
                    color: _ws.isConnected ? ApexTheme.success : ApexTheme.textMuted,
                    size: 16
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _ws.isConnected ? "iQOO Office Kit Bridge Connected" : "Connecting to Bridge...", 
                          style: TextStyle(color: _ws.isConnected ? ApexTheme.success : ApexTheme.textMuted, fontSize: 12, fontWeight: FontWeight.bold)
                        ),
                        if (_ws.isConnected)
                          Text("Laptop Agent Engine Connected • ${_ws.latencyMs}ms RTT", style: const TextStyle(color: Colors.white54, fontSize: 10)),
                      ],
                    ),
                  ),
                ],
              ),
            ),



            // MISSION CONTROL
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("APEX AgentOS", style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: -1)),
                        if (currentStep < 0)
                          ElevatedButton.icon(
                            onPressed: () {
                              _ws.sendEvent("DEMO_START", {});
                            },
                            icon: const Icon(Icons.play_arrow, size: 16, color: Colors.white),
                            label: const Text("START DEMO", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: Colors.white)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blueAccent,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // PHASE 2: OUTCOME BOARD
                    const Text("OUTCOME BOARD", style: TextStyle(color: Colors.white54, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(color: Colors.redAccent.withOpacity(0.05), border: Border.all(color: Colors.redAccent.withOpacity(0.2)), borderRadius: BorderRadius.circular(12)),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text("BEFORE", style: TextStyle(color: Colors.redAccent, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                                const SizedBox(height: 8),
                                _buildSmallMetric("Failure Risk", beforeMetrics["failureRisk"], Colors.white),
                                _buildSmallMetric("Switches", beforeMetrics["contextSwitches"], Colors.white),
                                _buildSmallMetric("Est. Finish", beforeMetrics["estimatedCompletion"], Colors.white),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(color: ApexTheme.success.withOpacity(0.05), border: Border.all(color: ApexTheme.success.withOpacity(0.2)), borderRadius: BorderRadius.circular(12)),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text("AFTER", style: TextStyle(color: ApexTheme.success, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                                const SizedBox(height: 8),
                                _buildSmallMetric("Failure Risk", afterMetrics["failureRisk"], ApexTheme.success),
                                _buildSmallMetric("Time Saved", afterMetrics["timeSaved"], ApexTheme.success),
                                _buildSmallMetric("Est. Finish", afterMetrics["estimatedCompletion"], ApexTheme.success),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // PHASE 3: MISSION TIMELINE
                    const Text("EXECUTION TIMELINE", style: TextStyle(color: Colors.white54, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Column(
                      children: timelineSteps.map((step) {
                        final isCompleted = currentStep > step["id"];
                        final isActive = currentStep == step["id"];
                        final isFuture = currentStep < step["id"];

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Row(
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: isCompleted ? ApexTheme.success : (isActive ? Colors.blueAccent : Colors.white10),
                                    width: 2
                                  ),
                                  color: isActive ? Colors.blueAccent.withOpacity(0.2) : Colors.transparent,
                                ),
                                child: isCompleted ? Icon(Icons.check, size: 12, color: ApexTheme.success) : null,
                              ),
                              const SizedBox(width: 16),
                              Text(
                                step["label"],
                                style: TextStyle(
                                  color: isCompleted ? Colors.white60 : (isActive ? Colors.blueAccent : Colors.white24),
                                  fontSize: 14,
                                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 32),

                    // SECONDARY CAPABILITIES (Agents)
                    const Text("SECONDARY CAPABILITIES", style: TextStyle(color: Colors.white54, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 100,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: agents.length,
                        separatorBuilder: (context, index) => const SizedBox(width: 12),
                        itemBuilder: (context, index) {
                          final agent = agents[index];
                          return GestureDetector(
                            onTap: () {
                              Navigator.push(context, MaterialPageRoute(
                                builder: (context) => AgentDetailScreen(agent: agent)
                              ));
                            },
                            child: Container(
                              width: 120,
                              decoration: BoxDecoration(
                                color: ApexTheme.darkGray,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: ApexTheme.borderGray),
                              ),
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(agent['icon'], color: agent['color'], size: 20),
                                  const Spacer(),
                                  Text(agent['name'], style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                                  Text(agent['desc'], style: const TextStyle(color: ApexTheme.textMuted, fontSize: 10)),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallMetric(String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 9)),
          Text(value, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
        ],
      ),
    );
  }
}
