"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaults_js_1 = require("./internals/client/defaults.js");
const make_callable_js_1 = require("./internals/client/make-callable.js");
const listener_organizer_js_1 = require("./internals/client/listener-organizer.js");
const prepare_request_function_js_1 = require("./internals/client/prepare-request-function.js");
const prepare_message_handlers_js_1 = require("./internals/client/prepare-message-handlers.js");
const prepare_message_listener_js_1 = require("./internals/client/prepare-message-listener.js");
function crosscallClient({ shape, namespace, hostOrigin, postMessage, shims: moreShims = {}, }) {
    //
    // preparing stuff
    //
    let resolveReady;
    const ready = new Promise(resolve => resolveReady = resolve);
    const shims = { ...defaults_js_1.defaultShims, ...moreShims };
    const state = {
        messageId: 0,
        iframe: null,
        isReady: false,
        requests: new Map(),
        listenerOrganizer: new listener_organizer_js_1.ListenerOrganizer(),
    };
    const request = prepare_request_function_js_1.prepareRequestFunction({
        state,
        namespace,
        hostOrigin,
        postMessage,
    });
    const callable = make_callable_js_1.makeCallable({
        state,
        shape,
        request,
    });
    const messageHandlers = prepare_message_handlers_js_1.prepareMessageHandlers({
        state,
        resolveReady
    });
    const messageListener = prepare_message_listener_js_1.prepareMessageListener({
        namespace,
        hostOrigin,
        messageHandlers,
    });
    //
    // actual initialization
    //
    shims.addEventListener("message", messageListener, false);
    //
    // return a stop function
    //
    return {
        callable: ready.then(() => callable),
        stop() {
            shims.removeEventListener("message", messageListener);
            if (state.iframe) {
                shims.removeChild(state.iframe);
                state.iframe = null;
            }
        }
    };
}
exports.crosscallClient = crosscallClient;
//# sourceMappingURL=crosscall-client.js.map