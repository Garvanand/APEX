type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private static instance: Logger;
  private logs: Array<{ level: LogLevel; message: string; timestamp: string }> = [];

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    this.logs.push({ level, message, timestamp });

    // In production, we would ship this batch to a Datadog/Sentry sink.
    if (import.meta.env.PROD) {
      if (this.logs.length > 100) {
        // Flush buffer (Simulated)
        this.logs = [];
      }
    } else {
      switch (level) {
        case "info": console.info(`[INFO ${timestamp}]`, message, ...args); break;
        case "warn": console.warn(`[WARN ${timestamp}]`, message, ...args); break;
        case "error": console.error(`[ERROR ${timestamp}]`, message, ...args); break;
        case "debug": console.debug(`[DEBUG ${timestamp}]`, message, ...args); break;
      }
    }
  }

  public trackPerformance(metricName: string, durationMs: number) {
    this.log("info", `[PERF] ${metricName} took ${durationMs.toFixed(2)}ms`);
  }
}

export const logger = Logger.getInstance();
