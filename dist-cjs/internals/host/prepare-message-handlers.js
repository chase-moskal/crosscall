"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_js_1 = require("./validation.js");
exports.prepareMessageHandlers = ({ state, exposures, sendMessage, }) => ({
    /**
     * Call request
     * - a client wants to execute some exposed host functionality
     * - the results are sent back to the client
     */
    [2 /* CallRequest */]: async ({ message, origin }) => {
        const { id: associate, topic, func, params } = message;
        const exposure = validation_js_1.getExposure({ topic, exposures });
        validation_js_1.enforcePermissions({ origin, exposure });
        const execute = validation_js_1.getMethodExecutor({ func, params, exposure });
        sendMessage({
            origin,
            message: {
                associate,
                result: await execute(),
                signal: 3 /* CallResponse */,
            }
        });
    },
    /**
     * Event listen request
     * - a client is asking to subscribe to a host event
     * - we send back the generated listener id
     */
    [5 /* EventListenRequest */]: async ({ message, origin }) => {
        const { topic, eventName, id: associate } = message;
        const exposure = validation_js_1.getExposure({ topic, exposures });
        validation_js_1.enforcePermissions({ origin, exposure });
        const mediator = validation_js_1.getEventMediator({ eventName, exposure });
        // create the listener
        const listenerId = state.listenerId++;
        const listener = eventPayload => sendMessage({
            origin,
            message: {
                listenerId,
                eventPayload,
                signal: 4 /* Event */,
            }
        });
        const cleanup = () => {
            mediator.unlisten(listener);
            state.listeners.delete(listenerId);
        };
        // start listening
        state.listeners.set(listenerId, { exposure, cleanup });
        mediator.listen(listener);
        sendMessage({
            origin,
            message: {
                associate,
                listenerId,
                signal: 6 /* EventListenResponse */,
            }
        });
    },
    /**
     * Event unlisten request
     * - a client wants to cancel an event subscription
     */
    [7 /* EventUnlistenRequest */]: async ({ message, origin }) => {
        const { listeners } = state;
        const { listenerId, id: associate } = message;
        const { exposure, cleanup } = validation_js_1.getListenerData({ listenerId, listeners, origin });
        validation_js_1.enforcePermissions({ origin, exposure });
        cleanup();
        sendMessage({
            origin,
            message: {
                associate,
                signal: 8 /* EventUnlistenResponse */
            }
        });
    }
});
//# sourceMappingURL=prepare-message-handlers.js.map