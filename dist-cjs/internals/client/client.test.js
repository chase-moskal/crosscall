"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_js_1 = require("../testing.js");
const crosscall_client_js_1 = require("../../crosscall-client.js");
describe("crosscall client", () => {
    it("ignores messages with the wrong namespace", async () => {
        const { shims, ...opts } = testing_js_1.makeClientOptions();
        let handler;
        shims.addEventListener = ((eventName, handler2) => {
            handler = handler2;
        });
        crosscall_client_js_1.crosscallClient({ ...opts, shims });
        expect(handler).toBeTruthy();
        const messageWasUsed = await handler({
            data: {},
            origin: testing_js_1.badOrigin,
        });
        expect(messageWasUsed).toBe(false);
    });
});
//# sourceMappingURL=client.test.js.map