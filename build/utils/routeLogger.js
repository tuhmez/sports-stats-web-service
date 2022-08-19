"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogInfo = exports.LogError = void 0;
function LogError(errorCode, erroredRoute, errorMessage) {
    console.error(`[ERROR] ${erroredRoute} (${errorCode}) - ${errorMessage}`);
}
exports.LogError = LogError;
function LogInfo(route, message) {
    console.info(`[INFO] ${route} - ${message}`);
}
exports.LogInfo = LogInfo;
//# sourceMappingURL=routeLogger.js.map