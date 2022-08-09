export function LogError(errorCode: number, erroredRoute: string, errorMessage: string) {
  console.error(`[ERROR] ${erroredRoute} (${errorCode}) - ${errorMessage}`);
}

export function LogInfo(route: string, message: string) {
  console.info(`[INFO] ${route} - ${message}`);
}
