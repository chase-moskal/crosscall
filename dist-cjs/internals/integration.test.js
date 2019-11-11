"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_js_1 = require("./testing.js");
describe("crosscall host/client integration", () => {
    test("wakeup call from host is received by client", async () => {
        const { hostOptions } = testing_js_1.makeBridgedSetup();
        const { postMessage: hostPostMessage } = hostOptions.shims;
        await testing_js_1.nap();
        expect(hostPostMessage).toHaveBeenCalled();
        expect(hostPostMessage.mock.calls[0][0].signal).toBe(1 /* Wakeup */);
    });
    test("callable resolves", async () => {
        const { client } = testing_js_1.makeBridgedSetup();
        const nuclear = await client.callable;
        expect(nuclear).toBeDefined();
        expect(nuclear.reactor).toBeDefined();
        expect(nuclear.reactor.generatePower).toBeDefined();
        expect(nuclear.reactor.radioactiveMeltdown).toBeDefined();
    });
    test("end to end call requests", async () => {
        const { client } = testing_js_1.makeBridgedSetup();
        const { reactor } = await client.callable;
        const result1 = await reactor.generatePower(1, 2);
        expect(result1).toBe(3);
        const result2 = await reactor.generatePower(2, 3);
        expect(result2).toBe(5);
    });
    test("client can listen and unlisten to host events", async () => {
        const { client, dispatchAlarmEvent } = testing_js_1.makeBridgedSetup();
        const { reactor } = await client.callable;
        let result = false;
        const listener = event => { result = event.alpha; };
        await reactor.alarm.listen(listener);
        dispatchAlarmEvent({ alpha: true });
        await testing_js_1.nap();
        expect(result).toBe(true);
        result = false;
        await reactor.alarm.unlisten(listener);
        dispatchAlarmEvent({ alpha: true });
        await testing_js_1.nap();
        expect(result).toBe(false);
    });
});
//# sourceMappingURL=integration.test.js.map