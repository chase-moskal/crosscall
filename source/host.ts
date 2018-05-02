
import {
	errtag,
	Callee,
	Signal,
	Message,
	MessageParams,
	ErrorMessage,
	CallRequest,
	CallResponse,
	HandshakeRequest,
	HandshakeResponse,
	Permission,
	Allowed,
	Shims,
	HostOptions
} from "./interfaces"

export default class Host<gCallee extends Callee = Callee> {
	private readonly callee: gCallee
	private readonly permissions: Permission[]
	private readonly shims: Shims
	private messageId = 0

	constructor({
		callee,
		permissions,
		shims = {}
	}: HostOptions<gCallee>) {
		this.shims = {...defaultShims, ...shims}
		this.callee = callee
		this.permissions = permissions
		this.shims.addEventListener("message", this.handleMessage, false)
		this.sendMessage({signal: Signal.Wakeup}, "*")
	}

	destructor() {
		const {handleMessage} = this
		const {removeEventListener} = this.shims
		removeEventListener("message", handleMessage)
	}

	private sendMessage(data: Message, target: string) {
		const {postMessage} = this.shims
		const payload = {...data, id: this.messageId++}
		postMessage(payload, target)
	}

	private readonly handleMessage = async({origin, data: message}: MessageEvent) => {
		this.message({origin, message}).catch(error => console.error(error))
	}

	async message({message: m, origin}: MessageParams) {
		switch (m.signal) {
			case Signal.Handshake: {
				const message = <HandshakeRequest>m
				await this.handleHandshakeMessage({message, origin})
				break
			}
			case Signal.Call: {
				const message = <CallRequest>m
				await this.handleCallMessage({message, origin})
				break
			}
		}
	}

	private async handleHandshakeMessage({message, origin}: MessageParams<HandshakeRequest>): Promise<void> {
		const {permissions} = this
		const {allowed} = getOriginPermission({origin, permissions})
		const response: HandshakeResponse = {
			signal: Signal.Handshake,
			response: message.id,
			allowed
		}
		this.sendMessage(response, origin)
	}

	private async handleCallMessage({message, origin}: MessageParams<CallRequest>): Promise<void> {
		const {callee, permissions} = this
		const {id, signal, topic, method, params} = message

		try {
			const {allowed} = getOriginPermission({origin, permissions})
			validateMethodPermission({allowed, topic, method, origin})
			const response: CallResponse = {
				signal: Signal.Call,
				response: id,
				result: await callee[method](...params)
			}
			this.sendMessage(response, origin)
		}

		catch (error) {
			const errorMessage: ErrorMessage = {
				signal: Signal.Error,
				error: error.message,
				response: id
			}
			this.sendMessage(errorMessage, origin)
		}
	}
}

const defaultShims: Shims = {
	postMessage: window.parent.postMessage.bind(window.parent),
	addEventListener: window.addEventListener.bind(window),
	removeEventListener: window.removeEventListener.bind(window)
}

function getOriginPermission({origin, permissions}: {
	origin: string
	permissions: Permission[]
}): Permission {
	const permission = permissions.find(({origin: o, allowed}) => o.test(origin))
	if (!permission) throw new Error(`${errtag} no permission for origin "${origin}"`)
	return permission
}

function validateMethodPermission({allowed, topic, method, origin}: {
	allowed: Allowed
	topic: string
	method: string
	origin: string
}) {
	const methods = allowed[topic]
	const granted = methods && methods.find(m => m === method)
	if (!granted) throw new Error(`${errtag} no permission for method "${topic}.${method}" for origin "${origin}"`)
}
