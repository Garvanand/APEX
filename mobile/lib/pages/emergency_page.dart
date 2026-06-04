import 'package:flutter/material.dart';

class EmergencyPage extends StatefulWidget {
  const EmergencyPage({super.key});

  @override
  State<EmergencyPage> createState() => _EmergencyPageState();
}

class _EmergencyPageState extends State<EmergencyPage> {
  final List<Map<String, dynamic>> _triageActions = [
    {
      "title": "Draft Extension Request",
      "desc": "Autofills an email draft to Dr. Miller citing biometrics strain indices and verified focus timeline certificates.",
      "icon": Icons.edit_note_outlined,
      "completed": false,
    },
    {
      "title": "De-prioritize non-essential items",
      "desc": "Reschedules CS229 homework tasks to create 24h capacity buffer.",
      "icon": Icons.calendar_today_outlined,
      "completed": false,
    },
    {
      "title": "Delegate task to study partner",
      "desc": "Splits parser register allocation task and syncs logs to Alex via P2P link.",
      "icon": Icons.share_outlined,
      "completed": false,
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      appBar: AppBar(
        backgroundColor: const Color(0xFF000000),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: Color(0xFFFF4D4F)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "OVERLOAD ACTIVE",
          style: TextStyle(
            fontFamily: 'Cabinet Grotesk',
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            color: Color(0xFFFF4D4F),
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Description warning box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1F0D0E),
                  border: Border.all(color: const Color(0xFFFF4D4F)),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.warning, color: Color(0xFFFF4D4F), size: 18),
                        SizedBox(width: 8),
                        Text(
                          "CRITICAL BIOMETRIC STRAIN",
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFFF4D4F),
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
                    Text(
                      "Your cognitive indicators suggest severe fatigue. APEX has enabled the triage workspace to help de-escalate workloads.",
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: Colors.white,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Checklist Stack header
              const Text(
                "TRIAGE RECOMMENDATIONS",
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFA5A5A5),
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 12),

              // Action list
              Expanded(
                child: ListView.builder(
                  itemCount: _triageActions.length,
                  physics: const BouncingScrollPhysics(),
                  itemBuilder: (context, index) {
                    final action = _triageActions[index];
                    final isDone = action['completed'] as bool;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF121212),
                        border: Border.all(color: const Color(0xFF2C2C2C)),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        leading: Icon(
                          action['icon'] as IconData,
                          color: isDone ? const Color(0xFF00D26A) : const Color(0xFFFF4D4F),
                        ),
                        title: Text(
                          action['title'],
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            decoration: isDone ? TextDecoration.lineThrough : null,
                          ),
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            action['desc'],
                            style: const TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 11,
                              color: Color(0xFFA5A5A5),
                              height: 1.3,
                            ),
                          ),
                        ),
                        trailing: Checkbox(
                          activeColor: const Color(0xFFFF4D4F),
                          value: isDone,
                          onChanged: (val) {
                            setState(() {
                              _triageActions[index]['completed'] = val;
                            });
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),

              // De-escalate button
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFFFF4D4F)),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        backgroundColor: const Color(0xFF121212),
                      ),
                      onPressed: () {
                        // De-escalate action
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text("Autonomic de-escalation signal sent to workspace"),
                            backgroundColor: Color(0xFFFF4D4F),
                          ),
                        );
                        Navigator.pop(context);
                      },
                      child: const Text(
                        "DE-ESCALATE SYSTEM",
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFFF4D4F),
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
