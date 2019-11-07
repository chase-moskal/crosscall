
import {HostShims, HostState, Message, Id} from "../interfaces.js"

export function prepareSendMessage({
	state,
	shims,
	namespace,
}: {
	state: HostState
	shims: HostShims
	namespace: string
}) {

	return async function sendMessage<gMessage extends Message = Message>({
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
}
