"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crosscall_host_js_1 = require("../../crosscall-host.js");
class ReactorTopic {
    constructor() {
        this.alarm = {
            listen: (listener) => { },
            unlisten: (listener) => { }
        };
    }
    async generatePower(a, b) {
        return a + b;
    }
    async radioactiveMeltdown() {
        throw new Error("meltdown!");
    }
}
exports.ReactorTopic = ReactorTopic;
async function exampleHost() {
    crosscall_host_js_1.crosscallHost({
        namespace: "crosscall-example",
        exposures: {
            reactor: {
                exposed: new ReactorTopic(),
                cors: {
                    allowed: /^.*$/i,
                    forbidden: null
                }
            }
        }
    });
}
exports.exampleHost = exampleHost;
//# sourceMappingURL=example-host.js.map