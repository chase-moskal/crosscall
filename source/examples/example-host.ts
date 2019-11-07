
import {Events, Methods, HostOptions, Api} from "../interfaces.js"

class ReactorEvents implements Events<ReactorEvents> {
	alarm = {
		listen() {},
		unlisten() {}
	}
	powerReport = {
		listen() {},
		unlisten() {}
	}
}

class ReactorMethods implements Methods<ReactorMethods> {
	async generatePower() {}
	async radioactiveMeltdown() {}
}

interface NuclearApi extends Api<NuclearApi> {
	reactor: {
		events: ReactorEvents
		methods: ReactorMethods
	}
}

const options: HostOptions<NuclearApi> = {
	debug: true,
	namespace: "crosscall",
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
}
