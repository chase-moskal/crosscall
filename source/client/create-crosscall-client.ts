
import {
	Id,
	Api,
	ClientState,
	ClientShims,
	ClientOptions,
	PendingRequest,
} from "../interfaces.js"

import {defaultShims} from "./defaults.js"

export function createCrosscallClient<A extends Api<A>>({
	shape,
	namespace,
	hostOrigin,
	shims: moreShims = {},
}: ClientOptions<A>) {
	const shims: ClientShims = {...defaultShims, ...moreShims}

	const state: ClientState = {
		messageId: 0,
		iframe: null,
		requests: new Map<Id, PendingRequest>(),
	}

	shims.addEventListener("message", handleMessageEvent, false)

	return {
		stop() {
			shims.removeEventListener("message", handleMessageEvent)
			if (state.iframe) {
				shims.removeChild(state.iframe)
				state.iframe = null
			}
		}
	}
}
