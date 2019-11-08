
import {
	Id,
	Api,
	ClientState,
	ClientShims,
	ClientOptions,
	Client,
	PendingRequest,
} from "../interfaces.js"

import {defaultShims} from "./defaults.js"
import {makeCallable} from "./make-callable.js"
import {ListenerOrganizer} from "./listener-organizer.js"
import {prepareRequestFunction} from "./prepare-request-function.js"
import {prepareMessageHandlers} from "./prepare-message-handlers.js"
import {prepareMessageListener} from "./prepare-message-listener.js"

export function createCrosscallClient<A extends Api<A>>({
	shape,
	namespace,
	hostOrigin,
	postMessage,
	shims: moreShims = {},
}: ClientOptions<A>): Client<A> {

	//
	// preparing stuff
	//

	let resolveReady: () => void
	const ready = new Promise(resolve => resolveReady = resolve)

	const shims: ClientShims = {...defaultShims, ...moreShims}
	const state: ClientState = {
		messageId: 0,
		iframe: null,
		isReady: false,
		requests: new Map<Id, PendingRequest>(),
		listenerOrganizer: new ListenerOrganizer(),
	}

	const request = prepareRequestFunction({
		state,
		namespace,
		hostOrigin,
		postMessage,
	})

	const callable = makeCallable<A>({
		state,
		shape,
		request,
	})

	const messageHandlers = prepareMessageHandlers({
		state,
		resolveReady
	})

	const messageListener = prepareMessageListener({
		namespace,
		hostOrigin,
		messageHandlers,
	})

	//
	// actual initialization
	//

	shims.addEventListener("message", messageListener, false)

	//
	// return a stop function
	//

	return {
		callable: ready.then(() => callable),
		stop() {
			shims.removeEventListener("message", messageListener)
			if (state.iframe) {
				shims.removeChild(state.iframe)
				state.iframe = null
			}
		}
	}
}
