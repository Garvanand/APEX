import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../core/app_config.dart';
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
  bool _isLoading = false;
  Map<String, dynamic>? _result;
  String _error = "";

  // The Relay Muscle API
  String get _apiUrl => "http://${AppConfig().serverIp}:8080/api/v1/agent/execute";

  String _getSystemPrompt(String agentId) {
    switch (agentId) {
      case "study":
        return "You are a Study Agent. Take the user's raw notes and extract key concepts into an array of flashcards. Return ONLY a JSON object with a 'flashcards' array. Each flashcard should have 'question' and 'answer'.";
      case "schedule":
        return "You are a Schedule Agent. Parse the unstructured text and extract meetings/deadlines. Return ONLY a JSON object with an 'events' array. Each event should have 'title', 'time', 'type' (meeting, deadline, reminder).";
      case "expense":
        return "You are an Expense Agent. Parse the unstructured receipt text. Return ONLY a JSON object with 'total', 'category', and an 'items' array (each with 'name' and 'price').";
      case "content":
        return "You are a Content Agent. Draft a professional email or application based on the user's intent. Return ONLY a JSON object with 'subject' and 'body'.";
      default:
        return "You are a helpful AI assistant. Return JSON.";
    }
  }

  Future<void> _executeAgent() async {
    if (_controller.text.trim().isEmpty) return;
    
    setState(() {
      _isLoading = true;
      _result = null;
      _error = "";
    });

    try {
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
      if (response.statusCode == 200 && data["success"]) {
        setState(() { _result = data["result"]; });
      } else {
        setState(() { _error = data["error"] ?? "Failed to execute agent."; });
      }
    } catch (e) {
      setState(() { _error = "Muscle Disconnected. Check iQOO Office Kit Bridge. ($e)"; });
    } finally {
      setState(() { _isLoading = false; });
    }
  }

  Widget _buildResultUI() {
    if (_result == null) return const SizedBox.shrink();

    final agentId = widget.agent["id"];
    
    if (agentId == "schedule" && _result!["events"] != null) {
      List events = _result!["events"];
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: events.map((e) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: ApexTheme.darkGray, borderRadius: BorderRadius.circular(12), border: Border.all(color: ApexTheme.borderGray)),
          child: Row(
            children: [
              Icon(e["type"] == "deadline" ? Icons.warning_amber : Icons.event, color: widget.agent["color"]),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(e["title"] ?? "Event", style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(e["time"] ?? "TBD", style: const TextStyle(color: ApexTheme.iqooYellow, fontSize: 14)),
                  ],
                ),
              )
            ],
          ),
        )).toList()
      );
    }
    
    if (agentId == "study" && _result!["flashcards"] != null) {
      List cards = _result!["flashcards"];
      return Column(
        children: cards.map((c) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: widget.agent["color"].withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: widget.agent["color"].withOpacity(0.3))),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Q: ${c["question"]}", style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              const Divider(color: Colors.white24, height: 24),
              Text("A: ${c["answer"]}", style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14)),
            ],
          )
        )).toList(),
      );
    }

    if (agentId == "content" && _result!["body"] != null) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: ApexTheme.darkGray, borderRadius: BorderRadius.circular(12), border: Border.all(color: ApexTheme.borderGray)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Subject: ${_result!["subject"]}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            const Divider(color: Colors.white24, height: 24),
            Text(_result!["body"], style: const TextStyle(color: ApexTheme.textMuted, fontSize: 14, height: 1.5)),
          ],
        )
      );
    }

    // Generic JSON Fallback
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
                      Center(
                        child: Column(
                          children: [
                            const SizedBox(height: 40),
                            const CircularProgressIndicator(color: ApexTheme.iqooYellow),
                            const SizedBox(height: 24),
                            // OFFICE KIT BRIDGE VISUALIZATION
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(color: ApexTheme.darkGray, borderRadius: BorderRadius.circular(12), border: Border.all(color: ApexTheme.iqooYellow.withOpacity(0.3))),
                              child: const Column(
                                children: [
                                  Text("PHONE INTERFACE", style: TextStyle(color: Colors.white54, fontSize: 10, letterSpacing: 1)),
                                  Icon(Icons.arrow_downward, color: ApexTheme.iqooYellow, size: 16),
                                  Text("iQOO OFFICE KIT BRIDGE", style: TextStyle(color: ApexTheme.iqooYellow, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1)),
                                  Icon(Icons.arrow_downward, color: ApexTheme.iqooYellow, size: 16),
                                  Text("DESKTOP MUSCLE", style: TextStyle(color: Colors.white54, fontSize: 10, letterSpacing: 1)),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text("Running Heavy LLM Inference on Laptop...", style: TextStyle(color: widget.agent["color"], fontFamily: 'monospace', fontSize: 12))
                          ],
                        )
                      )
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
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: ApexTheme.borderGray))
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      style: const TextStyle(color: Colors.white),
                      maxLines: 3,
                      minLines: 1,
                      decoration: InputDecoration(
                        hintText: "Paste raw text, notes, or OCR data...",
                        hintStyle: const TextStyle(color: ApexTheme.textMuted),
                        filled: true,
                        fillColor: ApexTheme.darkGray,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: _executeAgent,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: widget.agent["color"], borderRadius: BorderRadius.circular(12)),
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
