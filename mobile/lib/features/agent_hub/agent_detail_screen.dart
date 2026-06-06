import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../core/app_config.dart';
import '../../services/websocket_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AgentDetailScreen extends StatefulWidget {
  final Map<String, dynamic> agent;
  const AgentDetailScreen({super.key, required this.agent});

  @override
  State<AgentDetailScreen> createState() => _AgentDetailScreenState();
}

class _AgentDetailScreenState extends State<AgentDetailScreen> {
  final TextEditingController _controller = TextEditingController();
  final _ws = WebSocketService();
  bool _isLoading = false;
  Map<String, dynamic>? _result;
  String _error = "";

  // Pipeline execution step 0 to 5
  int _pipelineStep = 0;

  String get _apiUrl => "http://${AppConfig().serverIp}:8080/api/v1/agent/execute";

  @override
  void initState() {
    super.initState();
    _ws.addListener(_onWsUpdate);
  }

  @override
  void dispose() {
    _ws.removeListener(_onWsUpdate);
    super.dispose();
  }

  void _onWsUpdate() {
    if (!_isLoading) return;
    
    if (_ws.activeExecutionStatus == "Processing" && _pipelineStep < 3) {
      setState(() => _pipelineStep = 3);
      // Automatically transition to step 4 after a short delay since openrouter takes time
      Future.delayed(const Duration(milliseconds: 600), () {
        if (mounted && _pipelineStep == 3) setState(() => _pipelineStep = 4);
      });
    } else if (_ws.activeExecutionStatus == "Complete" && _pipelineStep < 5) {
      setState(() => _pipelineStep = 5);
    }
  }

  String _getSystemPrompt(String agentId) {
    switch (agentId) {
      case "study": return "Study Agent: Extract key concepts into flashcards.";
      case "schedule": return "Schedule Agent: Extract meetings/deadlines into events.";
      case "expense": return "Expense Agent: Parse receipt text into items.";
      case "content": return "Content Agent: Draft email.";
      default: return "Return JSON.";
    }
  }

  Future<void> _executeAgent() async {
    if (_controller.text.trim().isEmpty) return;
    
    setState(() {
      _isLoading = true;
      _result = null;
      _error = "";
      _pipelineStep = 1; // Phone captured intent
    });

    try {
      // Step 2: Transmitting over Bridge
      await Future.delayed(const Duration(milliseconds: 400));
      setState(() => _pipelineStep = 2);

      final response = await http.post(
        Uri.parse(_apiUrl),
        headers: { "Content-Type": "application/json" },
        body: jsonEncode({
          "agentType": widget.agent["id"],
          "systemPrompt": _getSystemPrompt(widget.agent["id"]),
          "inputData": _controller.text.trim()
        })
      );

      final data = jsonDecode(response.body);
      
      setState(() { _pipelineStep = 5; }); // Ensure step 5
      await Future.delayed(const Duration(milliseconds: 300)); // Let the user see step 5

      if (response.statusCode == 200 && data["success"]) {
        setState(() { _result = data["result"]; });
      } else {
        setState(() { _error = data["error"] ?? "Failed to execute agent."; });
      }
    } catch (e) {
      setState(() { _error = "Muscle Disconnected. Check iQOO Office Kit Bridge."; });
    } finally {
      setState(() { _isLoading = false; });
    }
  }

  Widget _buildPipelineStep(int stepIndex, String title, IconData icon) {
    bool isCompleted = _pipelineStep >= stepIndex;
    bool isActive = _pipelineStep == stepIndex - 1; // The step before it just completed, so THIS is active

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: isCompleted ? ApexTheme.success.withOpacity(0.2) : (isActive ? ApexTheme.iqooYellow.withOpacity(0.2) : Colors.white10),
              shape: BoxShape.circle,
              border: Border.all(color: isCompleted ? ApexTheme.success : (isActive ? ApexTheme.iqooYellow : Colors.white24)),
            ),
            child: Icon(
              isCompleted ? Icons.check : icon, 
              color: isCompleted ? ApexTheme.success : (isActive ? ApexTheme.iqooYellow : Colors.white54),
              size: 16
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(
                  color: isCompleted || isActive ? Colors.white : Colors.white54, 
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal
                )),
                if (isActive)
                  LinearProgressIndicator(backgroundColor: Colors.transparent, color: ApexTheme.iqooYellow, minHeight: 2),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildResultUI() {
    if (_result == null) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: ApexTheme.darkGray, borderRadius: BorderRadius.circular(12)),
      child: Text(jsonEncode(_result), style: const TextStyle(fontFamily: 'monospace', color: ApexTheme.iqooYellow)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ApexTheme.black,
      appBar: AppBar(
        backgroundColor: ApexTheme.black,
        title: Text(widget.agent["name"], style: const TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_isLoading) ...[
                      const Text("EXECUTION ORCHESTRATION", style: TextStyle(color: Colors.white54, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 24),
                      _buildPipelineStep(1, "PHONE (Intent Captured)", Icons.smartphone),
                      _buildPipelineStep(2, "iQOO OFFICE KIT (Bridge Transmitting)", Icons.router),
                      _buildPipelineStep(3, "LAPTOP (Agent Engine Invoked)", Icons.laptop),
                      _buildPipelineStep(4, "OPENROUTER (LLM Inference)", Icons.cloud),
                      _buildPipelineStep(5, "PHONE (Structured Result)", Icons.download_done),
                    ] else if (_error.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        color: Colors.red.withOpacity(0.1),
                        child: Text(_error, style: const TextStyle(color: Colors.red)),
                      )
                    ] else ...[
                      _buildResultUI()
                    ]
                  ],
                ),
              ),
            ),
            
            // Input Area
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(border: Border(top: BorderSide(color: Colors.white10))),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      style: const TextStyle(color: Colors.white),
                      maxLines: 3,
                      minLines: 1,
                      decoration: InputDecoration(
                        hintText: "Paste raw text...",
                        hintStyle: const TextStyle(color: ApexTheme.textMuted),
                        filled: true,
                        fillColor: ApexTheme.darkGray,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: _isLoading ? null : _executeAgent,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: _isLoading ? Colors.white24 : widget.agent["color"], borderRadius: BorderRadius.circular(12)),
                      child: const Icon(Icons.send, color: ApexTheme.black),
                    ),
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
