type LogLevel = "INFO" | "WARN" | "ERROR";

class Logger {
  private formatLog(level: LogLevel, context: string, message: string, metadata?: any) {
    const timestamp = new Date().toISOString();
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      // Human-readable, beautiful colored terminal style for developer experience
      let colorCode = "\x1b[36m"; // Cyan for INFO
      if (level === "WARN") colorCode = "\x1b[33m"; // Yellow for WARN
      if (level === "ERROR") colorCode = "\x1b[31m"; // Red for ERROR

      const resetCode = "\x1b[0m";
      const metaStr = metadata ? ` | Meta: ${JSON.stringify(metadata)}` : "";
      
      console.log(
        `[${timestamp}] ${colorCode}${level}${resetCode} \x1b[35m[${context}]\x1b[0m ${message}${metaStr}`
      );
    } else {
      // Single-line JSON format standard for Vercel, Datadog, AWS, GCP, and other collectors
      const logObject = {
        timestamp,
        level,
        context,
        message,
        ...(metadata && { metadata }),
      };
      console.log(JSON.stringify(logObject));
    }
  }

  public info(context: string, message: string, metadata?: any) {
    this.formatLog("INFO", context, message, metadata);
  }

  public warn(context: string, message: string, metadata?: any) {
    this.formatLog("WARN", context, message, metadata);
  }

  public error(context: string, message: string, error?: any, metadata?: any) {
    let errorDetails: any = undefined;
    if (error) {
      if (error instanceof Error) {
        errorDetails = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      } else {
        errorDetails = error;
      }
    }

    const mergedMetadata = {
      ...metadata,
      ...(errorDetails && { error: errorDetails }),
    };

    this.formatLog("ERROR", context, message, mergedMetadata);
  }
}

export const logger = new Logger();
