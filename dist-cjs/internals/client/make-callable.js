"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_js_1 = require("../../errors.js");
function makeCallable({ state, shape, request, }) {
    const callable = {};
    const requestCall = async (message) => request(message);
    const requestListen = async (message) => request(message);
    const requestUnlisten = async (message) => request(message);
    // create topics
    for (const [topic, topicShape] of Object.entries(shape)) {
        const topicObject = {};
        for (const [key, value] of Object.entries(topicShape)) {
            // create methods
            if (value === "method") {
                const func = key;
                topicObject[func] = async (...params) => (await requestCall({
                    signal: 2 /* CallRequest */,
                    topic,
                    func,
                    params,
                })).result;
            }
            // create events
            else if (value === "event") {
                const eventName = key;
                topicObject[eventName] = {
                    async listen(listener) {
                        const { listenerId } = await requestListen({
                            topic,
                            eventName,
                            signal: 5 /* EventListenRequest */,
                        });
                        state.listenerOrganizer.add(listenerId, listener);
                    },
                    async unlisten(listener) {
                        const listenerId = state.listenerOrganizer.ids.get(listener);
                        if (listenerId === undefined)
                            throw new Error(`cannot unlisten to unknown listener`);
                        await requestUnlisten({
                            listenerId,
                            signal: 7 /* EventUnlistenRequest */,
                        });
                        state.listenerOrganizer.remove(listenerId, listener);
                    }
                };
            }
            else
                throw errors_js_1.err(`unknown shape item, ${topic}.${key}: "${value}"`);
        }
        callable[topic] = topicObject;
    }
    return callable;
}
exports.makeCallable = makeCallable;
//# sourceMappingURL=make-callable.js.map