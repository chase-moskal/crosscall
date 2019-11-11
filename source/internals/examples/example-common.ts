
import {ReactorTopic} from "./example-host.js"
import {Api, ApiShape} from "../../interfaces.js"

export interface NuclearApi extends Api<NuclearApi> {
	reactor: ReactorTopic
}

export const nuclearShape: ApiShape<NuclearApi> = {
	reactor: {
		alarm: "event",
		generatePower: "method",
		radioactiveMeltdown: "method"
	}
}
