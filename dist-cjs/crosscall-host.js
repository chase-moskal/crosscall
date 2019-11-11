"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_js_1 = require("./errors.js");
const defaults_js_1 = require("./internals/host/defaults.js");
const prepare_send_message_js_1 = require("./internals/host/prepare-send-message.js");
const prepare_message_handlers_js_1 = require("./internals/host/prepare-message-handlers.js");
const prepare_message_listener_js_1 = require("./internals/host/prepare-message-listener.js");
function crosscallHost({ namespace, exposures, shims: moreShims = {}, }) {
    //
    // preparing stuff
    //
    // mixin shim defaults
    const shims = { ...defaults_js_1.defaultShims, ...moreShims };
    if (!shims.postMessage)
        throw errors_js_1.err(`crosscall host has invalid `
            + `postmessage (could not find window parent or opener)`);
    // establish initial values for our host state
    const state = {
        messageId: 0,
        listenerId: 0,
        listeners: new Map()
    };
    // function to send messages
    const sendMessage = prepare_send_message_js_1.prepareSendMessage({ state, shims, namespace });
    // handlers for each type of incoming message
    const messageHandlers = prepare_message_handlers_js_1.prepareMessageHandlers({
        state,
        exposures,
        sendMessage,
    });
    // message event listener added to the window
    const messageListener = prepare_message_listener_js_1.prepareMessageListener({
        namespace,
        sendMessage,
        messageHandlers,
    });
    //
    // actual initialization
    //
    // listen for messages from clients
    shims.addEventListener("message", messageListener, false);
    // send initial wakeup message to client
    sendMessage({
        origin: "*",
        message: { signal: 1 /* Wakeup */ },
    });
    //
    // return a method to stop
    //
    return {
        stop() {
            // stop listening to client messages
            shims.removeEventListener("message", messageListener);
            // cleanup all existing event listeners
            for (const [, listenerData] of state.listeners.entries())
                listenerData.cleanup();
        }
    };
}
exports.crosscallHost = crosscallHost;
//# sourceMappingURL=crosscall-host.js.map