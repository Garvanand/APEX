class AppConfig {
  static final AppConfig _instance = AppConfig._internal();

  factory AppConfig() {
    return _instance;
  }

  AppConfig._internal();

  String serverIp = "192.168.31.2"; // Fallback, will be overwritten by QR
}
