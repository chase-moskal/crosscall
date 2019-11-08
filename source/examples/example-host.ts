
import {NuclearApi} from "./example-common.js"
import {Events, Methods, Api, Listener} from "../interfaces.js"
import {createCrosscallHost} from "../host/create-crosscall-host.js"

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
	createCrosscallHost<NuclearApi>({
		debug: true,
		namespace: "crosscall-example",
		exposures: {
			reactor: {
				events: new ReactorEvents(),
				methods: new ReactorMethods(),
				cors: {
					allowed: /^https?:\/\/localhost:8\d{3}$/i,
					forbidden: null
				}
			}
		}
	})
}
