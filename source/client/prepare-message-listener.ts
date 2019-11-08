
import {ClientMessageHandlers} from "../interfaces.js"

export function prepareMessageListener({
	namespace,
	hostOrigin,
	messageHandlers,
}: {
	namespace: string
	hostOrigin: string
	messageHandlers: ClientMessageHandlers
}) {

	return async function messageListener({origin, data: message}: MessageEvent) {
		const isMessageForUs = typeof message === "object"
			&& message.namespace === namespace

		if (!isMessageForUs) return

		if (origin !== hostOrigin)
			throw new Error(`message rejected from "${origin}"`)

		try {
			const handler = messageHandlers[message.signal]
			if (!handler) throw new Error(`unknown signal "${message.signal}"`)
			await handler(message)
		}
		catch (error) {
			error.message = `crosscall client error: ${error.message}`
			throw error
		}
	}
}
