"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_js_1 = require("../testing.js");
const crosscall_host_js_1 = require("../../crosscall-host.js");
describe("crosscall host", () => {
    it("ignores messages with the wrong namespace", async () => {
        const options = testing_js_1.makeHostOptions();
        let handler;
        options.shims.addEventListener = ((eventName, handler2) => {
            handler = handler2;
        });
        crosscall_host_js_1.crosscallHost(options);
        await testing_js_1.nap();
        const messageWasUsed = await handler({
            data: {},
            origin: testing_js_1.badOrigin,
        });
        expect(messageWasUsed).toBe(false);
    });
    it("sends a wakeup mesesage", async () => {
        const options = testing_js_1.makeHostOptions();
        crosscall_host_js_1.crosscallHost(options);
        const [message, origin] = options.shims.postMessage.mock.calls[0];
        expect(message.id).toBe(0);
        expect(message.signal).toBe(1 /* Wakeup */);
        expect(origin).toBe("*");
    });
    it("binds message event listener", async () => {
        const options = testing_js_1.makeHostOptions();
        crosscall_host_js_1.crosscallHost(options);
        expect(options.shims.addEventListener.mock.calls.length).toBe(1);
    });
    it("unbinds message event listener on deconstructor", async () => {
        const options = testing_js_1.makeHostOptions();
        const host = crosscall_host_js_1.crosscallHost(options);
        host.stop();
        expect(options.shims.removeEventListener.mock.calls.length).toBe(1);
    });
});
//# sourceMappingURL=host.test.js.map