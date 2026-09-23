import 'package:flutter/foundation.dart';

class AppConfig {
  static final AppConfig _instance = AppConfig._internal();

  factory AppConfig() {
    return _instance;
  }

  AppConfig._internal() {
    if (kIsWeb && Uri.base.host.isNotEmpty) {
      serverIp = Uri.base.host;
    }
  }

  String serverIp = "192.168.31.254"; // Default fallback, overwritten by Uri.base.host on Web or QR
}
