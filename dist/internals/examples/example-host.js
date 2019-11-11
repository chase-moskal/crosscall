import { crosscallHost } from "../../crosscall-host.js";
export class ReactorTopic {
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
export async function exampleHost() {
    crosscallHost({
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
//# sourceMappingURL=example-host.js.map