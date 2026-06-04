import 'package:flutter/material.dart';
import 'settings_page.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        title: const Text(
          "PROFILE",
          style: TextStyle(
            fontFamily: 'Cabinet Grotesk',
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            color: Colors.white,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Colors.white),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SettingsPage()),
              );
            },
          )
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 24),
              // User details avatar block
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF121212),
                        border: Border.all(color: const Color(0xFF2C2C2C)),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.person_outline,
                          size: 40,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      "Garv Anand",
                      style: TextStyle(
                        fontFamily: 'Cabinet Grotesk',
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      "Computer Science Major",
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        color: Color(0xFFA5A5A5),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Baseline analytics parameters card (342px width, 140px height)
              Container(
                width: double.infinity,
                height: 140,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF121212),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: const Color(0xFF2C2C2C)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "BASELINE PARAMETERS",
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFA5A5A5),
                        letterSpacing: 1.0,
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildBaselineStat("Typing Speed", "82 WPM"),
                        Container(width: 1, height: 40, color: const Color(0xFF2C2C2C)),
                        _buildBaselineStat("Average HRV", "64 ms"),
                        Container(width: 1, height: 40, color: const Color(0xFF2C2C2C)),
                        _buildBaselineStat("Calibration", "Stable"),
                      ],
                    ),
                    const Text(
                      "Last updated on 2026-06-03 at 14:02 UTC",
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 9,
                        color: Color(0xFFA5A5A5),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Action buttons stack
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                  side: const BorderSide(color: Color(0xFF2C2C2C)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                  backgroundColor: const Color(0xFF121212),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Preparing encrypted CSV export package...")),
                  );
                },
                child: const Text(
                  "EXPORT COGNITIVE RECORD",
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 1.0,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                  side: const BorderSide(color: Color(0xFFFF4D4F)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                  backgroundColor: const Color(0xFF121212),
                ),
                onPressed: () {
                  _showDisconnectDialog(context);
                },
                child: const Text(
                  "DISCONNECT APEX CLIENT",
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFFF4D4F),
                    letterSpacing: 1.0,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBaselineStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(fontFamily: 'Inter', fontSize: 9, color: Color(0xFFA5A5A5)),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontFamily: 'Cabinet Grotesk',
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  void _showDisconnectDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF121212),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: const BorderSide(color: Color(0xFF2C2C2C))),
          title: const Text(
            "DISCONNECT CLIENT?",
            style: TextStyle(fontFamily: 'Cabinet Grotesk', fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          content: const Text(
            "Disconnecting stops all background telemetry streaming and cancels the local P2P bridge sync. Confirm deletion of keys?",
            style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: Color(0xFFA5A5A5), height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("CANCEL", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Client disconnected successfully"), backgroundColor: Color(0xFFFF4D4F)),
                );
              },
              child: const Text("DISCONNECT", style: TextStyle(color: Color(0xFFFF4D4F), fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }
}
