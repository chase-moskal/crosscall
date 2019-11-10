
import {NuclearApi} from "./example-common.js"
import {crosscallHost} from "../../crosscall-host.js"
import {Events, Methods, Listener} from "../../interfaces.js"

export class ReactorMethods implements Methods<ReactorMethods> {
	async generatePower(a: number, b: number) {
		return a + b
	}
	async radioactiveMeltdown() {
		throw new Error("meltdown!")
	}
}

export class ReactorEvents implements Events<ReactorEvents> {
	alarm = {
		listen: (listener: Listener) => {},
		unlisten: (listener: Listener) => {}
	}
}

export async function exampleHost() {
	crosscallHost<NuclearApi>({
		namespace: "crosscall-example",
		exposures: {
			reactor: {
				events: new ReactorEvents(),
				methods: new ReactorMethods(),
				cors: {
					allowed: /^.*$/i,
					forbidden: null
				}
			}
		}
	})
}
