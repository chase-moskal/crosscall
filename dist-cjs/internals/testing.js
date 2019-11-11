"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crosscall_host_js_1 = require("../crosscall-host.js");
const crosscall_client_js_1 = require("../crosscall-client.js");
const example_host_js_1 = require("./examples/example-host.js");
const example_common_js_1 = require("./examples/example-common.js");
exports.makeClientOptions = () => ({
    shape: example_common_js_1.nuclearShape,
    namespace: "crosscall-testing",
    hostOrigin: "https://alpha.egg",
    postMessage: jest.fn(),
    shims: {
        createElement: jest.fn(),
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    }
});
exports.makeHostOptions = () => ({
    namespace: "crosscall-testing",
    exposures: {
        reactor: {
            exposed: new example_host_js_1.ReactorTopic(),
            cors: {
                allowed: /^https:\/\/alpha\.egg$/i,
                forbidden: null
            }
        }
    },
    shims: {
        postMessage: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    }
});
exports.nap = async () => exports.sleep(100);
exports.sleep = async (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));
exports.goodOrigin = "https://alpha.egg";
exports.badOrigin = "https://beta.bad";
function mockReactorAlarm() {
    let subs = [];
    return {
        alarm: {
            listen: listener => {
                subs.push(listener);
            },
            unlisten: listener => {
                subs = subs.filter(sub => sub !== listener);
            }
        },
        dispatchAlarmEvent: (event) => {
            for (const sub of subs)
                sub(event);
        }
    };
}
exports.mockReactorAlarm = mockReactorAlarm;
exports.makeBridgedSetup = () => {
    const hostOptions = exports.makeHostOptions();
    const clientOptions = exports.makeClientOptions();
    const { alarm, dispatchAlarmEvent } = mockReactorAlarm();
    hostOptions.exposures.reactor.exposed.alarm = alarm;
    let host;
    let client;
    // get message senders
    let messageHost;
    let messageClient;
    hostOptions.shims.addEventListener = jest.fn(async (eventName, func) => messageHost = func);
    clientOptions.shims.addEventListener = jest.fn(async (eventName, func) => messageClient = func);
    // route host output to client input
    hostOptions.shims.postMessage = jest.fn(async (message, origin) => {
        await exports.sleep(0);
        messageClient({ origin: exports.goodOrigin, data: message });
    });
    // route client output to host input
    clientOptions.postMessage = jest.fn((async (message, origin) => {
        await exports.sleep(0);
        messageHost({ origin: exports.goodOrigin, data: message });
    }));
    // client created first, the way iframes work
    client = crosscall_client_js_1.crosscallClient(clientOptions);
    host = crosscall_host_js_1.crosscallHost(hostOptions);
    return { client, host, clientOptions, hostOptions, dispatchAlarmEvent };
};
//# sourceMappingURL=testing.js.map