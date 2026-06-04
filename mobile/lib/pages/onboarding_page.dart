import 'package:flutter/material.dart';
import 'permissions_page.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final PageController _pageController = PageController();
  int _currentStep = 0;

  // Form controllers
  final TextEditingController _universityController = TextEditingController(text: "Stanford University");
  final TextEditingController _majorController = TextEditingController(text: "Computer Science");

  // Calibration progress
  double _calibrationProgress = 0.0;
  bool _isCalibrating = false;
  String _calibrationSignal = "WAITING FOR HEART RATE SENSOR...";

  // Autonomy settings
  double _sculptorAutonomy = 0.75;
  double _sentinelAutonomy = 0.90;

  @override
  void dispose() {
    _pageController.dispose();
    _universityController.dispose();
    _majorController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < 4) {
      setState(() {
        _currentStep++;
      });
      _pageController.animateToPage(
        _currentStep,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      // Go to Permissions Flow screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const PermissionsPage()),
      );
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() {
        _currentStep--;
      });
      _pageController.animateToPage(
        _currentStep,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _startCalibration() async {
    setState(() {
      _isCalibrating = true;
      _calibrationProgress = 0.0;
      _calibrationSignal = "ACQUIRING BIOMETRIC SENSORS...";
    });

    final signals = [
      "ACQUIRING BIOMETRIC SENSORS...",
      "CALIBRATING TYPING CADENCE (82 WPM BASELINE)...",
      "MEASURING HRV STABILITY (72 ms STABLE)...",
      "MAPPING EYE-GAZE RANGE (96% FIXATION ACCURACY)...",
      "ESTABLISHING COGNITIVE SHIELD BOUNDARIES...",
      "CALIBRATION COMPLETE"
    ];

    for (int i = 0; i < signals.length; i++) {
      await Future.delayed(const Duration(milliseconds: 600));
      if (!mounted) return;
      setState(() {
        _calibrationProgress = (i + 1) / signals.length;
        _calibrationSignal = signals[i];
      });
    }

    await Future.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;
    setState(() {
      _isCalibrating = false;
    });
    _nextStep();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: SafeArea(
        child: Column(
          children: [
            // Top Step Progress Indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                children: List.generate(5, (index) {
                  return Expanded(
                    child: Container(
                      height: 3,
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        color: index <= _currentStep ? const Color(0xFFFFD400) : const Color(0xFF2C2C2C),
                        borderRadius: BorderRadius.circular(1.5),
                      ),
                    ),
                  );
                }),
              ),
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildWelcomeStep(),
                  _buildIdentityStep(),
                  _buildCalibrationStep(),
                  _buildAgentStep(),
                  _buildFinalizeStep(),
                ],
              ),
            ),
            // Bottom Action Row
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (_currentStep > 0 && !_isCalibrating)
                    TextButton(
                      onPressed: _previousStep,
                      child: const Text(
                        "BACK",
                        style: TextStyle(
                          color: Color(0xFFA5A5A5),
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                          letterSpacing: 1.0,
                        ),
                      ),
                    )
                  else
                    const SizedBox(width: 48),
                  if (!_isCalibrating)
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF0A0A0A),
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      onPressed: _nextStep,
                      child: Text(
                        _currentStep == 4 ? "INITIALIZE SYSTEM" : "CONTINUE",
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeStep() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Welcome to APEX",
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              fontFamily: 'Cabinet Grotesk',
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            "Your mobile device is now a biometric sensor array. APEX tracks your real-time cognitive workload to curate focus environments and shield distractions across screens.",
            style: TextStyle(
              fontSize: 15,
              color: Color(0xFFA5A5A5),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF121212),
              border: Border.all(color: const Color(0xFF2C2C2C)),
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Row(
              children: [
                Icon(Icons.security, color: Color(0xFFFFD400), size: 24),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    "All telemetry data stays fully encrypted and is processed on-device whenever possible.",
                    style: TextStyle(
                      fontSize: 12,
                      color: Color(0xFFA5A5A5),
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIdentityStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 48),
          const Text(
            "Academic Identity",
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              fontFamily: 'Cabinet Grotesk',
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "Provide details to pull calendar schedules and LMS documents automatically.",
            style: TextStyle(fontSize: 14, color: Color(0xFFA5A5A5)),
          ),
          const SizedBox(height: 32),
          const Text(
            "UNIVERSITY",
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFA5A5A5), letterSpacing: 1.0),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _universityController,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              filled: true,
              fillColor: const Color(0xFF121212),
              enabledBorder: OutlineInputBorder(
                borderSide: const BorderSide(color: Color(0xFF2C2C2C)),
                borderRadius: BorderRadius.circular(4),
              ),
              focusedBorder: OutlineInputBorder(
                borderSide: const BorderSide(color: Color(0xFFFFD400)),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            "FIELD OF STUDY / MAJOR",
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFA5A5A5), letterSpacing: 1.0),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _majorController,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              filled: true,
              fillColor: const Color(0xFF121212),
              enabledBorder: OutlineInputBorder(
                borderSide: const BorderSide(color: Color(0xFF2C2C2C)),
                borderRadius: BorderRadius.circular(4),
              ),
              focusedBorder: OutlineInputBorder(
                borderSide: const BorderSide(color: Color(0xFFFFD400)),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
          const SizedBox(height: 32),
          InkWell(
            onTap: () {
              // Simulate file picker success
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text("Syllabus & Schedule documents uploaded successfully"),
                  backgroundColor: Color(0xFF00D26A),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 20),
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF121212),
                border: Border.all(color: const Color(0xFF2C2C2C), style: BorderStyle.solid),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Column(
                children: [
                  Icon(Icons.cloud_upload_outlined, color: Color(0xFFA5A5A5), size: 32),
                  SizedBox(height: 8),
                  Text(
                    "IMPORT COURSE SYLLABI / SCHEDULES",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.0),
                  ),
                  SizedBox(height: 4),
                  Text(
                    "Supports PDF, ICS formats or Canvas credentials",
                    style: TextStyle(fontSize: 10, color: Color(0xFFA5A5A5)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCalibrationStep() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Biometric Calibration",
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              fontFamily: 'Cabinet Grotesk',
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "Set up your cognitive baseline. This calibrates sensor outputs for Flow state assessment.",
            style: TextStyle(fontSize: 14, color: Color(0xFFA5A5A5), height: 1.4),
          ),
          const SizedBox(height: 48),
          Center(
            child: Column(
              children: [
                if (_isCalibrating) ...[
                  SizedBox(
                    width: 200,
                    child: LinearProgressIndicator(
                      value: _calibrationProgress,
                      backgroundColor: const Color(0xFF121212),
                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFFD400)),
                      minHeight: 4,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _calibrationSignal,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11,
                      color: Color(0xFFFFD400),
                      letterSpacing: 0.5,
                    ),
                  ),
                ] else ...[
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF121212),
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Color(0xFF2C2C2C)),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                    ),
                    onPressed: _startCalibration,
                    icon: const Icon(Icons.flash_on, color: Color(0xFFFFD400)),
                    label: const Text(
                      "START 3-MIN BASELINE TEST",
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    "Requires 3 mins of typing and gaze tracking calibration",
                    style: TextStyle(fontSize: 11, color: Color(0xFFA5A5A5)),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAgentStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 48),
          const Text(
            "Agent Integration",
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              fontFamily: 'Cabinet Grotesk',
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "APEX uses five specialized agents. Configure default autonomy thresholds below.",
            style: TextStyle(fontSize: 14, color: Color(0xFFA5A5A5)),
          ),
          const SizedBox(height: 32),
          // Environment Sculptor
          _buildAgentSlider(
            "ENVIRONMENT SCULPTOR",
            "Manages desktop layouts, tabs, and DND states autonomously.",
            _sculptorAutonomy,
            (val) => setState(() => _sculptorAutonomy = val),
          ),
          const SizedBox(height: 24),
          // Deadline Sentinel
          _buildAgentSlider(
            "DEADLINE SENTINEL",
            "Monitors deadlines and schedules risk assessments dynamically.",
            _sentinelAutonomy,
            (val) => setState(() => _sentinelAutonomy = val),
          ),
        ],
      ),
    );
  }

  Widget _buildAgentSlider(String title, String desc, double value, ValueChanged<double> onChanged) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF121212),
        border: Border.all(color: const Color(0xFF2C2C2C)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 0.5),
              ),
              Text(
                "${(value * 100).round()}%",
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFFFD400)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            desc,
            style: const TextStyle(fontSize: 11, color: Color(0xFFA5A5A5), height: 1.3),
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
              value: value,
              min: 0.0,
              max: 1.0,
              onChanged: onChanged,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinalizeStep() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Calibration Complete",
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              fontFamily: 'Cabinet Grotesk',
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            "APEX is ready to monitor. Next, configure permissions to enable local background captures.",
            style: TextStyle(
              fontSize: 15,
              color: Color(0xFFA5A5A5),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF121212),
              border: Border.all(color: const Color(0xFF2C2C2C)),
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "EXPECTED ACCURACY LEVEL",
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFA5A5A5), letterSpacing: 1.0),
                ),
                SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.check_circle_outline, color: Color(0xFF00D26A), size: 18),
                    SizedBox(width: 8),
                    Text(
                      "94% Flow State Calibration",
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
