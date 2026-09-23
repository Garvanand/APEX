import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../core/theme.dart';
import '../../core/app_config.dart';
import '../../services/websocket_service.dart';
import '../agent_hub/agent_hub_screen.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  bool _hasNavigated = false;

  void _activateAndNavigate() {
    if (_hasNavigated) return;
    _hasNavigated = true;

    try {
      if (kIsWeb && Uri.base.host.isNotEmpty) {
        AppConfig().serverIp = Uri.base.host;
      }
    } catch (_) {}

    final ws = WebSocketService();
    ws.connect();
    ws.sendEvent('ACTIVATE_OFFICE_KIT', true);
    ws.sendEvent('TOGGLE_APEX', true);
    ws.sendEvent('DEVICE_PAIRED', {
      'device': 'iQOO Mobile Companion',
      'status': 'Connected',
      'ip': AppConfig().serverIp,
    });

    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const AgentHubScreen()));
  }

  void _onDetect(BarcodeCapture capture) {
    if (_hasNavigated) return;

    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final String? rawValue = barcode.rawValue;
      if (rawValue != null && rawValue.startsWith("http")) {
        try {
          final uri = Uri.parse(rawValue);
          AppConfig().serverIp = uri.host;
        } catch (e) {
          AppConfig().serverIp = rawValue.replaceAll("http://", "").split(":")[0];
        }

        _activateAndNavigate();
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
          if (!kIsWeb)
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
                    "iQOO OFFICE KIT BRIDGE",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2
                    ),
                  ),
                ),
                Expanded(
                  child: Center(
                    child: Container(
                      width: 280,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: const Color(0xFF141414),
                        border: Border.all(color: ApexTheme.iqooYellow, width: 2),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: ApexTheme.iqooYellow.withOpacity(0.15),
                            blurRadius: 20,
                            spreadRadius: 2,
                          )
                        ]
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.wifi_tethering, color: ApexTheme.iqooYellow, size: 64),
                          const SizedBox(height: 16),
                          const Text(
                            "Local Mesh Link Ready",
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            "Connected Host: ${AppConfig().serverIp}:8080",
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.white54, fontSize: 12, fontFamily: 'monospace'),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ApexTheme.iqooYellow,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                            ),
                            onPressed: _activateAndNavigate,
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.bolt, size: 18),
                                SizedBox(width: 6),
                                Text("ACTIVATE WORKSPACE", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1)),
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(bottom: 40),
                  child: GestureDetector(
                    onTap: _activateAndNavigate,
                    child: const Text(
                      "CONNECT TO WORKSPACE NOW",
                      style: TextStyle(color: ApexTheme.iqooYellow, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1),
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
