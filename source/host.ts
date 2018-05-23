
import {error} from "./error"
import {
	Id,
	Callee,
	Signal,
	Allowed,
	Message,
	Listener,
	HostShims,
	Permission,
	HostEvents,
	CallRequest,
	HostOptions,
	CallResponse,
	ErrorMessage,
	EventMessage,
	AllowedEvents,
	HandshakeRequest,
	HostEventMediator,
	HandshakeResponse,
	EventListenRequest,
	EventListenResponse,
	HandleMessageParams,
	HostMessageHandlers,
	EventUnlistenRequest,
	EventUnlistenResponse
} from "./interfaces"

export class Host<
	gCallee extends Callee = Callee,
	gEvents extends HostEvents = HostEvents
> {
	private readonly callee: gCallee
	private readonly events: gEvents
	private readonly permissions: Permission[]
	private readonly shims: HostShims
	private listeners = new Map<number, {
		listener: Listener
		eventName: string
	}>()
	private messageId = 0
	private listenerId = 0

	constructor({
		callee,
		permissions,
		events = <gEvents>{},
		shims = {}
	}: HostOptions<gCallee, gEvents>) {
		this.shims = {...defaultShims, ...shims}
		this.callee = callee
		this.events = events
		this.permissions = permissions
		this.shims.addEventListener("message", this.handleMessageEvent, false)
		this.sendMessage({signal: Signal.Wakeup}, "*")
	}

	destructor() {
		const {handleMessageEvent} = this
		const {removeEventListener} = this.shims
		this.shims.removeEventListener("message", handleMessageEvent)
	}

	protected async receiveMessage<gMessage extends Message = Message>({
		message,
		origin
	}: {
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
		origin,
		data: message
	}: MessageEvent) => this.receiveMessage({origin, message})

	private sendMessage<gMessage extends Message = Message>(
		message: gMessage,
		origin: string
	): Id {
		const {postMessage} = this.shims
		const id = this.messageId++
		const payload: gMessage = {...<any>message, id}
		postMessage(payload, origin)
		return id
	}

	protected fireEvent(listenerId: number, eventPayload: any, origin: string) {
		this.sendMessage<EventMessage>({
			signal: Signal.Event,
			listenerId,
			eventPayload
		}, origin)
	}

	private readonly messageHandlers: HostMessageHandlers = {

		[Signal.HandshakeRequest]: async({message, origin, permission}:
		HandleMessageParams<HandshakeRequest>): Promise<void> => {
			const {allowed, allowedEvents} = permission
			this.sendMessage<HandshakeResponse>({
				signal: Signal.HandshakeResponse,
				associate: message.id,
				allowed,
				allowedEvents
			}, origin)
		},

		[Signal.CallRequest]: async({message, origin, permission}:
		HandleMessageParams<CallRequest>): Promise<void> => {
			const {callee} = this
			const {id, signal, topic, method, params} = message
			const {allowed} = permission
			validateMethodPermission({allowed, topic, method, origin})
			this.sendMessage<CallResponse>({
				signal: Signal.CallResponse,
				associate: id,
				result: await callee[topic][method](...params)
			}, origin)
		},

		[Signal.EventListenRequest]: async({message, origin, permission}:
		HandleMessageParams<EventListenRequest>) => {
			const {eventName, id: associate} = message
			const {allowedEvents} = permission
			validateEventPermission({eventName, allowedEvents, origin})
			const {events, listeners} = this
			const hostEventHandler = events[eventName]
			const listenerId = this.listenerId++
			const listener: Listener = event => {
				this.fireEvent(listenerId, event, origin)
			}
			hostEventHandler.listen(listener)
			this.listeners.set(listenerId, {listener, eventName})
			this.sendMessage<EventListenResponse>({
				signal: Signal.EventListenResponse,
				associate,
				listenerId
			}, origin)
		},

		[Signal.EventUnlistenRequest]: async({message, origin, permission}:
		HandleMessageParams<EventUnlistenRequest>) => {
			const {events, listeners} = this
			const {listenerId, id: associate} = message
			const {listener, eventName} = this.listeners.get(listenerId)
			const {allowedEvents} = permission
			validateEventPermission({eventName, allowedEvents, origin})
			const hostEventHandler = events[eventName]
			hostEventHandler.unlisten(listener)
			this.sendMessage<EventUnlistenResponse>({
				signal: Signal.EventUnlistenResponse,
				associate
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
	if (!permission) throw error(`no permission for origin "${origin}"`)
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
	if (!granted) throw error(`no permission for method "${topic}.${method}" for `
		+ `origin "${origin}"`)
}

function validateEventPermission({eventName, allowedEvents, origin}: {
	eventName: string
	allowedEvents: AllowedEvents
	origin: string
}) {
	const granted = allowedEvents.find(name => name === eventName) !== undefined
	if (!granted) throw error(`no permission for eventName "${eventName}" for`
		+ ` origin "${origin}"`)
}
