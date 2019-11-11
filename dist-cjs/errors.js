"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CrosscallApiError extends Error {
    constructor(message) {
        super(`crosscall-error: ${message}`);
        this.name = this.constructor.name;
    }
}
exports.CrosscallApiError = CrosscallApiError;
function err(message) {
    return new CrosscallApiError(message);
}
exports.err = err;
//# sourceMappingURL=errors.js.map