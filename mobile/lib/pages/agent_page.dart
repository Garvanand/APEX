import 'package:flutter/material.dart';

class AgentPage extends StatefulWidget {
  const AgentPage({super.key});

  @override
  State<AgentPage> createState() => _AgentPageState();
}

class _AgentPageState extends State<AgentPage> {
  // Autonomy sliders
  double _sculptorAutonomy = 0.75;
  double _sentinelAutonomy = 0.90;
  bool _peerRadarEnabled = true;
  bool _socraticEnabled = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        title: const Text('Agent Settings', style: TextStyle(color: Colors.white, fontSize: 16)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Agent Autonomy Matrix',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              'Configure the slider constraints. Higher levels authorize autonomous actions without seeking confirmation dialogs.',
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
            const SizedBox(height: 24),
            
            // Environment Sculptor
            _buildAgentHeader('Environment Sculptor', Colors.orange),
            Card(
              color: const Color(0xFF121212),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Autonomy Level', style: TextStyle(color: Colors.white, fontSize: 14)),
                        Text('${(_sculptorAutonomy * 100).round()}%', style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Slider(
                      value: _sculptorAutonomy,
                      activeColor: Colors.orange,
                      inactiveColor: Colors.grey[800],
                      onChanged: (val) {
                        setState(() {
                          _sculptorAutonomy = val;
                        });
                      },
                    ),
                    Text(
                      _sculptorAutonomy > 0.8
                          ? 'Extremely Autonomous. Automatically shuts apps and triggers greyscale mode.'
                          : 'Moderate safety. Asks before closing Chrome groups.',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Deadline Sentinel
            _buildAgentHeader('Deadline Sentinel', Colors.red),
            Card(
              color: const Color(0xFF121212),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Alert Sensitivity', style: TextStyle(color: Colors.white, fontSize: 14)),
                        Text('${(_sentinelAutonomy * 100).round()}%', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Slider(
                      value: _sentinelAutonomy,
                      activeColor: Colors.red,
                      inactiveColor: Colors.grey[800],
                      onChanged: (val) {
                        setState(() {
                          _sentinelAutonomy = val;
                        });
                      },
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Switch lists
            _buildAgentHeader('Academic Integrations', Colors.blue),
            Card(
              color: const Color(0xFF121212),
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('Peer Radar Active', style: TextStyle(color: Colors.white, fontSize: 14)),
                    subtitle: const Text('Summarize group chat assignment threads', style: TextStyle(color: Colors.grey, fontSize: 12)),
                    value: _peerRadarEnabled,
                    activeColor: const Color(0xFFFFD400),
                    onChanged: (val) {
                      setState(() {
                        _peerRadarEnabled = val;
                      });
                    },
                  ),
                  const Divider(color: Colors.black),
                  SwitchListTile(
                    title: const Text('Socratic Challenger Active', style: TextStyle(color: Colors.white, fontSize: 14)),
                    subtitle: const Text('Inject periodic concepts review checkups', style: TextStyle(color: Colors.grey, fontSize: 12)),
                    value: _socraticEnabled,
                    activeColor: const Color(0xFFFFD400),
                    onChanged: (val) {
                      setState(() {
                        _socraticEnabled = val;
                      });
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAgentHeader(String name, Color tint) {
    return Padding(
      padding: const EdgeInsets.only(left: 4.0, bottom: 8.0),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(shape: BoxShape.circle, color: tint),
          ),
          const SizedBox(width: 8),
          Text(name, style: const TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
        ],
      ),
    );
  }
}
