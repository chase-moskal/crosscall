
import {
	errtag,
	Callee,
	Signal,
	Allowed,
	Message,
	HostShims,
	Permission,
	CallRequest,
	HostOptions,
	CallResponse,
	ErrorMessage,
	HandshakeRequest,
	HandshakeResponse,
	HandleMessageParams,
	HostMessageHandlers
} from "./interfaces"

export default class Host<gCallee extends Callee = Callee> {
	private readonly callee: gCallee
	private readonly permissions: Permission[]
	private readonly shims: HostShims
	private messageId = 0

	constructor({
		callee,
		permissions,
		shims = {}
	}: HostOptions<gCallee>) {
		this.shims = {...defaultShims, ...shims}
		this.callee = callee
		this.permissions = permissions
		this.shims.addEventListener("message", this.handleMessageEvent, false)
		this.sendMessage({signal: Signal.Wakeup}, "*")
	}

	destructor() {
		const {handleMessageEvent} = this
		const {removeEventListener} = this.shims
		removeEventListener("message", handleMessageEvent)
	}

	async receiveMessage<gMessage extends Message = Message>({message, origin}: {
		message: gMessage
		origin: string
	}) {
		try {
			const {permissions} = this
			const permission = getOriginPermission({origin, permissions})
			const handler = this.messageHandlers[message.signal]
			const response = await handler({message, origin, permission})
		}
		catch (error) {
			const errorMessage: ErrorMessage = {
				signal: Signal.Error,
				error: error.message,
				associate: message.id
			}
			this.sendMessage(errorMessage, origin)
			throw error
		}
	}

	private readonly handleMessageEvent = async({
		origin, data: message
	}: MessageEvent) => this.receiveMessage({origin, message})

	private sendMessage<gMessage extends Message = Message>(message: gMessage, origin: string) {
		const {postMessage} = this.shims
		const payload: gMessage = {...<any>message, id: this.messageId++}
		postMessage(payload, origin)
	}

	private readonly messageHandlers: HostMessageHandlers = {

		[Signal.Handshake]: async({
			message, origin, permission
		}: HandleMessageParams<HandshakeRequest>): Promise<void> => {
			const {allowed} = permission
			this.sendMessage<HandshakeResponse>({
				signal: Signal.Handshake,
				associate: message.id,
				allowed
			}, origin)
		},

		[Signal.Call]: async({
			message, origin, permission
		}: HandleMessageParams<CallRequest>): Promise<void> => {
			const {callee} = this
			const {id, signal, topic, method, params} = message
			const {allowed} = permission
			validateMethodPermission({allowed, topic, method, origin})
			this.sendMessage<CallResponse>({
				signal: Signal.Call,
				associate: id,
				result: await callee[method](...params)
			}, origin)
		}
	}
}

const defaultShims: HostShims = {
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
