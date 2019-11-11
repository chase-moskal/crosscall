"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function prepareMessageListener({ namespace, sendMessage, messageHandlers, }) {
    return async function messageListener({ origin, data: message }) {
        const isMessageForUs = typeof message === "object"
            && message.namespace === namespace;
        if (isMessageForUs) {
            try {
                const handler = messageHandlers[message.signal];
                if (!handler)
                    throw new Error(`unknown message signal "${message.signal}"`);
                await handler({ message, origin });
            }
            catch (error) {
                const errorResponse = {
                    signal: 0 /* Error */,
                    error: error.message,
                    associate: message.id
                };
                sendMessage({ origin, message: errorResponse });
                throw error;
            }
        }
        return isMessageForUs;
    };
}
exports.prepareMessageListener = prepareMessageListener;
//# sourceMappingURL=prepare-message-listener.js.map