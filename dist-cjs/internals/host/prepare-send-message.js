"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function prepareSendMessage({ state, shims, namespace, }) {
    return async function sendMessage({ origin, message }) {
        const id = state.messageId++;
        const payload = { ...message, id, namespace };
        await shims.postMessage(payload, origin);
        return id;
    };
}
exports.prepareSendMessage = prepareSendMessage;
//# sourceMappingURL=prepare-send-message.js.map