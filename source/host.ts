
import {
	Shims,
	errtag,
	Callee,
	Signal,
	Allowed,
	Message,
	Permission,
	CallRequest,
	HostOptions,
	CallResponse,
	ErrorMessage,
	MessageHandlers,
	HandshakeRequest,
	HandshakeResponse,
	HandleMessageParams
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

	async message<gMessage extends Message = Message>({message, origin}: {
		message: gMessage
		origin: string
	}) {
		try {
			const {permissions} = this
			const permission = getOriginPermission({origin, permissions})

			const handler = this.messageHandlers[message.signal]
			const response = await handler({message, origin, permission})

			this.sendMessage(response, origin)
		}
		catch (error) {
			const errorMessage: ErrorMessage = {
				signal: Signal.Error,
				error: error.message,
				response: message.id
			}
			this.sendMessage(errorMessage, origin)
			throw error
		}
	}

	private readonly handleMessage = async({
		origin, data: message
	}: MessageEvent) => this.message({origin, message})

	private sendMessage(data: Message, target: string) {
		const {postMessage} = this.shims
		const payload = {...data, id: this.messageId++}
		postMessage(payload, target)
	}

	private readonly messageHandlers: MessageHandlers = {
		[Signal.Handshake]: async({
			message, origin, permission
		}: HandleMessageParams<HandshakeRequest>): Promise<HandshakeResponse> => {
			const {allowed} = permission
			return {
				signal: Signal.Handshake,
				response: message.id,
				allowed
			}
		},

		[Signal.Call]: async({
			message, origin, permission
		}: HandleMessageParams<CallRequest>): Promise<CallResponse> => {
			const {callee} = this
			const {id, signal, topic, method, params} = message
			const {allowed} = permission

			validateMethodPermission({allowed, topic, method, origin})

			return {
				signal: Signal.Call,
				response: id,
				result: await callee[method](...params)
			}
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
	if (!permission)
		throw new Error(`${errtag} no permission for origin "${origin}"`)
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
	if (!granted) throw new Error(
		`${errtag} no permission for method "${topic}.${method}" for origin` +
		` "${origin}"`)
}
