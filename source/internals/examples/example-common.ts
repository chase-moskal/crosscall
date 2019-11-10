
import {Api, ApiShape} from "../../interfaces.js"
import {ReactorEvents, ReactorMethods} from "./example-host.js"

export interface NuclearApi extends Api<NuclearApi> {
	reactor: {
		events: ReactorEvents
		methods: ReactorMethods
	}
}

export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		events: {
			alarm: true
		},
		methods: {
			generatePower: true,
			radioactiveMeltdown: true,
		}
	}
}
