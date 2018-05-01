
import {
	errtag,
	Callee,
	Signal,
	Message,
	ErrorMessage,
	CallRequest,
	CallResponse,
	HandshakeRequest,
	HandshakeResponse,
	Expose,
	Available,
	HostOptions
} from "./interfaces"

/**
 * CROSSCALL HOST
 */
export default class Host<gCallee extends Callee = Callee> {
	private readonly expose: Expose
	private messageId = 0

	/**
	 * CROSSCALL CONSTRUCTOR
	 *  - establish message listener
	 */
	constructor({expose}: HostOptions) {
		this.expose = expose
		window.addEventListener("message", this.handleMessage, false)

		// send wakeup message to initiate handshake
		this.sendMessage({signal: Signal.Awaken}, "*")
	}

	/**
	 * DESTRUCTOR
	 */
	destructor() {
		const {handleMessage} = this
		window.removeEventListener("message", handleMessage)
	}

	/**
	 * SEND MESSAGE
	 */
	private sendMessage(data: Message, target: string) {
		const payload = {...data, id: this.messageId++}
		window.parent.postMessage(payload, target)
	}

	/**
	 * HANDLE MESSAGE
	 */
	private readonly handleMessage = async(event: MessageEvent) => {
		const {expose} = this
		const messageOrigin = event.origin
		const {signal} = <Message>event.data

		switch (signal) {
			case Signal.Handshake: {
				const message = <HandshakeRequest>event.data
				this.handleHandshakeMessage(event)
				break
			}
			case Signal.Call: {
				const message = <CallRequest>event.data
				this.handleCallMessage(event)
				break
			}
		}
	}

	/**
	 * HANDLE HANDSHAKE MESSAGE
	 */
	private async handleHandshakeMessage(event: MessageEvent) {
		const {expose} = this
		const messageOrigin = event.origin
		const message = <HandshakeRequest>event.data

		const available: Available = {}
		Object.keys(expose).forEach(topic => available[topic] = expose[topic].methods)
		const response = <HandshakeResponse>{
			signal: Signal.Handshake,
			response: message.id,
			available
		}
		this.sendMessage(response, messageOrigin)
	}

	/**
	 * HANDLE CALL MESSAGE
	 */
	private async handleCallMessage(event: MessageEvent) {
		const {expose} = this
		const messageOrigin = event.origin
		const message = <CallRequest>event.data
		const {id, signal, topic, method, params} = message

		try {

			// ensure topic is exposed
			const permission = expose[topic]
			if (!permission) throw new Error(`${errtag} unknown topic "${topic}" not exposed`)

			// ensure message origin is allowed topic access
			const {callee, origin: originRegex, methods} = permission
			const originAllowed = originRegex.test(messageOrigin)
			if (!originAllowed) throw new Error(`${errtag} origin "${messageOrigin}" not allowed to access "${topic}"`)

			// ensure requested method is allowed
			const allowed = methods.find(m => m === method)
			if (!allowed) throw new Error(`${errtag} method "${topic}.${method}" not exposed`)

			// call the method and prepare the response
			const response = <CallResponse>{
				signal: Signal.Call,
				response: id,
				result: await callee[method](...params)
			}

			// send the response
			this.sendMessage(response, messageOrigin)
		}

		// send back any errors
		catch (error) {
			this.sendMessage(<ErrorMessage>{id, error: error.message}, messageOrigin)
		}
	}
}
