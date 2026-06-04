import 'package:flutter/material.dart';

class AgentPage extends StatefulWidget {
  const AgentPage({super.key});

  @override
  State<AgentPage> createState() => _AgentPageState();
}

class _AgentPageState extends State<AgentPage> {
  int _selectedAgentIndex = 0;
  double _globalAutonomy = 0.80;

  final List<Map<String, dynamic>> _agents = [
    {
      "name": "State Agent",
      "status": "Active",
      "metric": "Flow Calibrated",
      "isActive": true,
      "details": {
        "thread": "thread_state_main",
        "load": "1.2% CPU",
        "signals": "HRV, Eye-Gaze, Cadence",
        "description": "Continuous telemetry signal aggregation and cognitive state determination. Processes low-latency heuristic classifications."
      }
    },
    {
      "name": "Deadline Sentinel",
      "status": "Auditing",
      "metric": "3 tasks monitored",
      "isActive": false,
      "details": {
        "thread": "thread_sentinel_cron",
        "load": "0.4% CPU",
        "signals": "Canvas API, Google Cal",
        "description": "Monitors assignment timelines, computes risk coefficient thresholds, and schedules de-escalation actions."
      }
    },
    {
      "name": "Environment Sculptor",
      "status": "Standby",
      "metric": "DND Auto-Trigger",
      "isActive": false,
      "details": {
        "thread": "thread_sculptor_bridge",
        "load": "0.1% CPU",
        "signals": "iQOO Office Kit Bridge",
        "description": "Orchestrates external device window lockouts, notifications silence filters, and grayscale canvas conversions."
      }
    },
    {
      "name": "Peer Radar",
      "status": "Listening",
      "metric": "2 channels active",
      "isActive": false,
      "details": {
        "thread": "thread_radar_scrape",
        "load": "0.8% CPU",
        "signals": "Slack, Discord Webhooks",
        "description": "Extracts conversation topics and summarizes key academic notices using localized natural language processors."
      }
    },
    {
      "name": "Socratic Challenger",
      "status": "Active",
      "metric": "1 review pending",
      "isActive": true,
      "details": {
        "thread": "thread_socratic_groq",
        "load": "3.5% CPU",
        "signals": "Groq LLM Context",
        "description": "Triggers review questions on conceptual notes, evaluates answer accuracy, and calibrates challenging difficulty profiles."
      }
    }
  ];

  @override
  Widget build(BuildContext context) {
    final selectedAgent = _agents[_selectedAgentIndex];

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        title: const Text(
          "AGENT MATRIX",
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
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Diagnostics Summary
              const Text(
                "Orchestrator Thread Monitor",
                style: TextStyle(
                  fontFamily: 'Cabinet Grotesk',
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                "5 active daemon threads operating over P2P local bridge.",
                style: TextStyle(fontSize: 12, color: Color(0xFFA5A5A5)),
              ),
              const SizedBox(height: 20),

              // Grid of Agent Cards
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _agents.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.6,
                ),
                itemBuilder: (context, index) {
                  final agent = _agents[index];
                  final isSelected = _selectedAgentIndex == index;
                  final isRunning = agent['isActive'] as bool;

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedAgentIndex = index;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF121212),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: isSelected
                              ? const Color(0xFFFFD400)
                              : const Color(0xFF2C2C2C),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  agent['name'],
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Container(
                                width: 6,
                                height: 6,
                                decoration: BoxDecoration(
                                  color: isRunning
                                      ? const Color(0xFFFFD400)
                                      : const Color(0xFF2C2C2C),
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                agent['status'].toString().toUpperCase(),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isRunning ? const Color(0xFFFFD400) : const Color(0xFFA5A5A5),
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                agent['metric'],
                                style: const TextStyle(fontSize: 11, color: Color(0xFFA5A5A5)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),

              // Detailed parameters panel
              const Text(
                "THREAD DIAGNOSTICS",
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFA5A5A5),
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF121212),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: const Color(0xFF2C2C2C)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          selectedAgent['name'],
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0A0A0A),
                            borderRadius: BorderRadius.circular(2),
                            border: Border.all(color: const Color(0xFF2C2C2C)),
                          ),
                          child: Text(
                            selectedAgent['details']['load'],
                            style: const TextStyle(
                              fontFamily: 'JetBrains Mono',
                              fontSize: 10,
                              color: Color(0xFFFFD400),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      selectedAgent['details']['description'],
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFFA5A5A5),
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Divider(color: Color(0xFF2C2C2C)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Text(
                          "THREAD:",
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFA5A5A5)),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          selectedAgent['details']['thread'],
                          style: const TextStyle(fontFamily: 'JetBrains Mono', fontSize: 11, color: Colors.white),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Text(
                          "SIGNALS:",
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFA5A5A5)),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            selectedAgent['details']['signals'],
                            style: const TextStyle(fontSize: 11, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Autonomy controls
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF121212),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: const Color(0xFF2C2C2C)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "SYSTEM AUTONOMY CONSTRAINT",
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 0.5),
                        ),
                        Text(
                          "${(_globalAutonomy * 100).round()}%",
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFFFD400)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      "Sets maximum threshold for automated de-escalation actions.",
                      style: TextStyle(fontSize: 11, color: Color(0xFFA5A5A5)),
                    ),
                    const SizedBox(height: 12),
                    SliderTheme(
                      data: SliderTheme.of(context).copyWith(
                        activeTrackColor: const Color(0xFFFFD400),
                        inactiveTrackColor: const Color(0xFF2C2C2C),
                        thumbColor: const Color(0xFFFFD400),
                        overlayColor: const Color(0xFFFFD400).withOpacity(0.1),
                        trackHeight: 2.0,
                      ),
                      child: Slider(
                        value: _globalAutonomy,
                        min: 0.0,
                        max: 1.0,
                        onChanged: (val) {
                          setState(() {
                            _globalAutonomy = val;
                          });
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
