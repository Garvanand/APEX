import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../core/theme.dart';
import '../../core/app_config.dart';
import '../agent_hub/agent_hub_screen.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  bool _hasNavigated = false;

  void _onDetect(BarcodeCapture capture) {
    if (_hasNavigated) return;

    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final String? rawValue = barcode.rawValue;
      if (rawValue != null && rawValue.startsWith("http")) {
        _hasNavigated = true;
        
        // Extract IP. Expected format: http://192.168.x.x:8080
        try {
          final uri = Uri.parse(rawValue);
          AppConfig().serverIp = uri.host;
        } catch (e) {
          // fallback if parsing fails but it shouldn't
          AppConfig().serverIp = rawValue.replaceAll("http://", "").split(":")[0];
        }

        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const AgentHubScreen()));
        break;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ApexTheme.black,
      body: Stack(
        children: [
          MobileScanner(
            onDetect: _onDetect,
            controller: MobileScannerController(
              detectionSpeed: DetectionSpeed.noDuplicates,
              facing: CameraFacing.back,
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.all(24.0),
                  child: Text(
                    "SCAN iQOO OFFICE KIT QR CODE ON DESKTOP",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2
                    ),
                  ),
                ),
                Expanded(
                  child: Center(
                    child: Container(
                      width: 250,
                      height: 250,
                      decoration: BoxDecoration(
                        border: Border.all(color: ApexTheme.iqooYellow, width: 3),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          const Icon(Icons.qr_code_scanner, color: Colors.white24, size: 100),
                          Positioned(
                            bottom: 20,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(color: ApexTheme.black.withOpacity(0.7), borderRadius: BorderRadius.circular(8)),
                              child: const Text("Searching for Muscle...", style: TextStyle(color: ApexTheme.iqooYellow, fontSize: 10, fontFamily: 'monospace')),
                            )
                          )
                        ],
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(bottom: 40),
                  child: GestureDetector(
                    onTap: () {
                      // Fallback for emulator testing or if QR fails due to HTTP camera block
                      AppConfig().serverIp = "172.30.214.101";
                      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const AgentHubScreen()));
                    },
                    child: const Text(
                      "SKIP (DEV OVERRIDE)",
                      style: TextStyle(color: Colors.white38, fontSize: 12, decoration: TextDecoration.underline),
                    ),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
