
import {DisabledLogger} from "renraku/dist/toolbox/logging.js"

import {
	Id,
	Signal,
	Message,
	HostShims,
	HostState,
	HostOptions,
	ErrorMessage,
	ListenerData,
} from "../interfaces.js"

import {error} from "../error.js"
import {prepareMessageHandlers} from "./prepare-message-handlers.js"

export function createCrosscallHost({
	namespace,
	exposures,
	debug = false,
	shims: rawShims = {},
	logger = new DisabledLogger,
}: HostOptions) {

	const shims = {...defaultShims, ...rawShims}
	if (!shims.postMessage) throw error(`crosscall host has invalid `
		+ `postmessage (could not find window parent or opener)`)

	const state: HostState = {
		messageId: 0,
		listenerId: 0,
		listeners: new Map<number, ListenerData>()
	}

	const messageHandlers = prepareMessageHandlers({
		state,
		exposures,
		sendMessage
	})

	async function sendMessage<gMessage extends Message = Message>({
		origin,
		message
	}: {
		origin: string
		message: gMessage
	}): Promise<Id> {
		const id = state.messageId++
		const payload: gMessage = {...<any>message, id, namespace}
		await shims.postMessage(payload, origin)
		return id
	}

	async function handleMessageEvent({
		origin,
		data: message
	}: MessageEvent) {

		const isMessageForUs = typeof message === "object"
			&& message.namespace === namespace

		if (isMessageForUs) {
			try {
				const handler = messageHandlers[message.signal]
				if (!handler) throw new Error(
					`unknown message signal "${message.signal}"`
				)
				await handler({message, origin})
			}
			catch (error) {
				const errorResponse: ErrorMessage = {
					signal: Signal.Error,
					error: error.message,
					associate: message.id
				}
				sendMessage({origin, message: errorResponse})
				throw error
			}
		}

		return isMessageForUs
	}

	// listen for client messages
	shims.addEventListener("message", handleMessageEvent, false)

	// send wakeup message to client
	sendMessage({
		origin: "*",
		message: {signal: Signal.Wakeup}, 
	})

	return {
		stop() {

			// stop listening to client messages
			shims.removeEventListener("message", handleMessageEvent)

			// cleanup all existing event listeners
			for (const [, listenerData] of state.listeners.entries())
				listenerData.cleanup()
		}
	}
}

const defaultShims: HostShims = {
	postMessage: (() => {
		const {parent, opener} = window
		if (parent && parent !== window) return parent.postMessage.bind(parent)
		else if (opener && opener !== window) return opener.postMessage.bind(opener)
		else return null
	})(),
	addEventListener: window.addEventListener.bind(window),
	removeEventListener: window.removeEventListener.bind(window)
}
