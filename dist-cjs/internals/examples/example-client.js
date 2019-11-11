"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_iframe_js_1 = require("../../create-iframe.js");
const crosscall_client_js_1 = require("../../crosscall-client.js");
const example_common_js_1 = require("./example-common.js");
async function exampleClient(url) {
    const { href, origin: hostOrigin } = new URL(url);
    const { postMessage } = await create_iframe_js_1.createIframe({
        url: href
    });
    const client = crosscall_client_js_1.crosscallClient({
        shape: example_common_js_1.nuclearShape,
        hostOrigin,
        postMessage,
        namespace: "crosscall-example",
    });
    const nuclear = await client.callable;
    const result = await nuclear.reactor.generatePower(1, 2);
    const success = result === 3;
    return success;
}
exports.exampleClient = exampleClient;
//# sourceMappingURL=example-client.js.map