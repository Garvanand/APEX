import 'package:flutter/material.dart';

class EmergencyPage extends StatelessWidget {
  const EmergencyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Emergency Overload Triage', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 16)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                border: BorderSide(color: Colors.red.withOpacity(0.3)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning, color: Colors.red),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Biometrics indicate critical fatigue levels. System triage is active. Avoid expanding focus parameters.',
                      style: TextStyle(color: Colors.white, fontSize: 13, height: 1.4),
                    ),
                  )
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            const Text(
              'Triage Actions',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 12),
            
            _buildTriageCard(
              context,
              'Draft Extension Template',
              'Generate an academic extension request letter using historical focus metrics and Groq proof logs.',
              Icons.email,
              Colors.blue,
            ),
            const SizedBox(height: 12),
            _buildTriageCard(
              context,
              'Peer Task Delegation',
              'Delegate compiler tasks to team members listed under Peer Radar group.',
              Icons.group,
              Colors.green,
            ),
            const SizedBox(height: 12),
            _buildTriageCard(
              context,
              'Enforce Strict Lockout',
              'Initiate 30-minute system block. Freezes browser navigation and blocks non-academic tools.',
              Icons.lock,
              Colors.orange,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTriageCard(BuildContext context, String title, String desc, IconData icon, Color accent) {
    return Card(
      color: const Color(0xFF121212),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[900]!),
      ),
      child: InkWell(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Triage Action Initiated: $title'),
              backgroundColor: accent,
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: accent, size: 28),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    Text(desc, style: const TextStyle(color: Colors.grey, fontSize: 12, height: 1.3)),
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
