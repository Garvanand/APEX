import 'package:flutter/material.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _handoverEnabled = true;
  bool _dndSyncEnabled = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        title: const Text(
          "SETTINGS",
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
        child: ListView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          children: [
            // INTEGRATIONS SECTION
            _buildSectionHeader("INTEGRATIONS"),
            const SizedBox(height: 8),
            _buildSettingsRow(
              label: "Canvas LMS Link",
              trailing: const Text(
                "Linked",
                style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: Color(0xFF00D26A), fontWeight: FontWeight.bold),
              ),
              onTap: () {},
            ),
            _buildSettingsRow(
              label: "Google Calendar Sync",
              trailing: const Text(
                "Linked",
                style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: Color(0xFF00D26A), fontWeight: FontWeight.bold),
              ),
              onTap: () {},
            ),
            _buildSettingsRow(
              label: "Office Kit Local Bridge",
              trailing: const Text(
                "12ms P2P",
                style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: Color(0xFF00D26A)),
              ),
              onTap: () {},
            ),

            const SizedBox(height: 32),

            // SYSTEM OPTIONS SECTION
            _buildSectionHeader("SYSTEM OPTIONS"),
            const SizedBox(height: 8),
            _buildSettingsRow(
              label: "Eye-Gaze Calibration",
              trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Color(0xFF2C2C2C)),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Triggering gaze baseline calibration cycle...")),
                );
              },
            ),
            _buildSettingsToggleRow(
              label: "Device Handover Settings",
              value: _handoverEnabled,
              onChanged: (val) {
                setState(() {
                  _handoverEnabled = val;
                });
              },
            ),
            _buildSettingsToggleRow(
              label: "Cross-Device DND Stream",
              value: _dndSyncEnabled,
              onChanged: (val) {
                setState(() {
                  _dndSyncEnabled = val;
                });
              },
            ),

            const SizedBox(height: 32),

            // LOCAL DATABASE OPTIONS
            _buildSectionHeader("DATABASE UTILITIES"),
            const SizedBox(height: 8),
            _buildSettingsRow(
              label: "Clear Cache Store",
              trailing: const Icon(Icons.delete_outline, size: 18, color: Color(0xFFFF4D4F)),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Local cache store purged successfully.")),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontFamily: 'Inter',
        fontSize: 10,
        fontWeight: FontWeight.bold,
        color: Color(0xFFA5A5A5),
        letterSpacing: 1.0,
      ),
    );
  }

  Widget _buildSettingsRow({
    required String label,
    required Widget trailing,
    required VoidCallback onTap,
  }) {
    return Container(
      height: 56,
      margin: const EdgeInsets.only(bottom: 1),
      decoration: const BoxDecoration(
        color: Color(0xFF121212),
        border: Border(bottom: BorderSide(color: Color(0xFF1F1F1F))),
      ),
      child: InkWell(
        onTap: onTap,
        splashColor: const Color(0xFF181818),
        highlightColor: const Color(0xFF181818),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              trailing,
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsToggleRow({
    required String label,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      height: 56,
      margin: const EdgeInsets.only(bottom: 1),
      decoration: const BoxDecoration(
        color: Color(0xFF121212),
        border: Border(bottom: BorderSide(color: Color(0xFF1F1F1F))),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SwitchTheme(
              data: SwitchThemeData(
                thumbColor: MaterialStateProperty.resolveWith((states) {
                  if (states.contains(MaterialState.selected)) {
                    return const Color(0xFFFFD400);
                  }
                  return const Color(0xFFA5A5A5);
                }),
                trackColor: MaterialStateProperty.resolveWith((states) {
                  if (states.contains(MaterialState.selected)) {
                    return const Color(0xFFFFD400).withOpacity(0.3);
                  }
                  return const Color(0xFF2C2C2C);
                }),
              ),
              child: Switch(
                value: value,
                onChanged: onChanged,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
