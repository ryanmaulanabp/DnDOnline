"use server";

import { logger } from "@/lib/logger";

/**
 * Server Action untuk mencatat crash render dari sisi client (React Error Boundary)
 * ke dalam backend structured log stream.
 */
export async function reportClientErrorAction(
  errorName: string,
  errorMessage: string,
  errorStack: string
) {
  try {
    logger.error("ClientErrorBoundary", `Client Crash Terdeteksi: ${errorMessage}`, {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
    });
    return { success: true };
  } catch (err: any) {
    // Telemetry fail-silent: Jangan biarkan kegagalan pencatatan telemetry merusak UI pahlawan lebih jauh
    return { success: false };
  }
}
