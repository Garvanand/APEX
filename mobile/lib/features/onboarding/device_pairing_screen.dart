import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:http/http.dart' as http;
import '../../core/theme.dart';
import '../../services/providers.dart';

class DevicePairingScreen extends ConsumerStatefulWidget {
  final VoidCallback onPaired;

  const DevicePairingScreen({super.key, required this.onPaired});

  @override
  ConsumerState<DevicePairingScreen> createState() => _DevicePairingScreenState();
}

class _DevicePairingScreenState extends ConsumerState<DevicePairingScreen> {
  bool _isScanning = false;
  bool _isProcessing = false;
  MobileScannerController cameraController = MobileScannerController();

  Future<void> _processQRCode(String rawValue) async {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);

    try {
      final payload = jsonDecode(rawValue);
      final token = payload['token'];
      final serverUrl = payload['server']; // e.g. http://192.168.x.x:8000

      // Hit the pairing endpoint
      final response = await http.post(
        Uri.parse('$serverUrl/api/v1/pairing/verify'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'token': token,
          'device_name': 'iQOO Companion',
          'device_id': 'iqoo-99482',
          'platform': 'Flutter/Android',
          'version': '1.0.0'
        }),
      );

      if (response.statusCode == 200) {
        ref.read(isPairedProvider.notifier).state = true;
        widget.onPaired();
      } else {
        _showError('Pairing failed. Invalid token.');
      }
    } catch (e) {
      _showError('Invalid QR Code format.');
    } finally {
      setState(() => _isProcessing = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
    setState(() => _isScanning = false);
  }

  @override
  void dispose() {
    cameraController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isScanning) {
      return Scaffold(
        backgroundColor: ApexTheme.black,
        body: Stack(
          children: [
            MobileScanner(
              controller: cameraController,
              onDetect: (capture) {
                final List<Barcode> barcodes = capture.barcodes;
                if (barcodes.isNotEmpty && barcodes.first.rawValue != null) {
                  _processQRCode(barcodes.first.rawValue!);
                }
              },
            ),
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('SCAN QR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white),
                          onPressed: () => setState(() => _isScanning = false),
                        )
                      ],
                    ),
                    const Spacer(),
                    if (_isProcessing)
                      const CircularProgressIndicator(color: ApexTheme.iqooYellow),
                    const Spacer(),
                  ],
                ),
              ),
            )
          ],
        ),
      );
    }

    return Scaffold(
      backgroundColor: ApexTheme.black,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'APEX SETUP',
                style: Theme.of(context).textTheme.labelSmall,
              ),
              const Spacer(),
              Text(
                'Connect to Desktop Canvas',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 48),
              ),
              const SizedBox(height: 16),
              Text(
                'Your iQOO phone acts as the cognitive sensor array. Keep it nearby.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 18, height: 1.3),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 64,
                child: ElevatedButton(
                  onPressed: () => setState(() => _isScanning = true),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ApexTheme.iqooYellow,
                    foregroundColor: ApexTheme.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
                  ),
                  child: const Text(
                    'OPEN SCANNER',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1.5),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
