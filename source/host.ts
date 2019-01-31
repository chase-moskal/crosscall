
import error from "./error"
import {
	Id,
	Callee,
	Signal,
	Message,
	Listener,
	HostShims,
	Permission,
	CallRequest,
	HostOptions,
	CallResponse,
	ErrorMessage,
	EventMessage,
	AllowedTopics,
	AllowedEvents,
	HandshakeRequest,
	HandshakeResponse,
	EventListenRequest,
	EventListenResponse,
	HandleMessageParams,
	HostMessageHandlers,
	EventUnlistenRequest,
	EventUnlistenResponse
} from "./interfaces"

export default class Host<gCallee extends Callee = Callee> {
	private readonly callee: gCallee
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
		shims = {}
	}: HostOptions<gCallee>) {
		this.shims = {...defaultShims, ...shims}
		if (!this.shims.postMessage) throw error(`crosscall host has invalid `
			+ `postmessage (could not find window parent or opener)`)
		validatePermissionsAreWellFormed(permissions)
		this.callee = callee
		this.permissions = permissions
		this.shims.addEventListener("message", this.handleMessageEvent, false)
		this.sendMessage({signal: Signal.Wakeup}, "*")
	}

	deconstructor() {
		const {handleMessageEvent} = this
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
			await handler({message, origin, permission})
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

	private async sendMessage<gMessage extends Message = Message>(
		message: gMessage,
		origin: string
	): Promise<Id> {
		const {postMessage} = this.shims
		const id = this.messageId++
		const payload: gMessage = {...<any>message, id}
		await postMessage(payload, origin)
		return id
	}

	protected async fireEvent(
		listenerId: number,
		eventPayload: any,
		origin: string
	) {
		return this.sendMessage<EventMessage>({
			signal: Signal.Event,
			listenerId,
			eventPayload
		}, origin)
	}

	private readonly messageHandlers: HostMessageHandlers = {

		[Signal.HandshakeRequest]: async({
			message, origin, permission
		}: HandleMessageParams<HandshakeRequest>): Promise<void> => {
			const {allowedTopics: allowed, allowedEvents} = permission
			const {id: associate} = message
			this.sendMessage<HandshakeResponse>({
				signal: Signal.HandshakeResponse,
				associate,
				allowedTopics: allowed,
				allowedEvents
			}, origin)
		},

		[Signal.CallRequest]: async({
			message, origin, permission
		}: HandleMessageParams<CallRequest>): Promise<void> => {
			const {callee} = this
			const {allowedTopics: allowed} = permission
			const {id: associate, topic, method, params} = message
			validateMethodPermission({allowedTopics: allowed, topic, method, origin})
			const result = await callee.topics[topic][method](...params)
			this.sendMessage<CallResponse>({
				signal: Signal.CallResponse,
				associate,
				result
			}, origin)
		},

		[Signal.EventListenRequest]: async({
			message, origin, permission
		}: HandleMessageParams<EventListenRequest>) => {
			const {listeners, callee} = this
			const {allowedEvents} = permission
			const {eventName, id: associate} = message
			validateEventPermission({eventName, allowedEvents, origin})
			const hostEventHandler = callee.events[eventName]
			const listenerId = this.listenerId++
			const listener: Listener = event => {
				this.fireEvent(listenerId, event, origin)
			}
			hostEventHandler.listen(listener)
			listeners.set(listenerId, {listener, eventName})
			this.sendMessage<EventListenResponse>({
				signal: Signal.EventListenResponse,
				associate,
				listenerId
			}, origin)
		},

		[Signal.EventUnlistenRequest]: async({
			message, origin, permission
		}: HandleMessageParams<EventUnlistenRequest>) => {
			const {listeners, callee} = this
			const {listenerId, id: associate} = message
			const {listener, eventName} = listeners.get(listenerId)
			const {allowedEvents} = permission
			validateEventPermission({eventName, allowedEvents, origin})
			const hostEventHandler = callee.events[eventName]
			hostEventHandler.unlisten(listener)
			this.sendMessage<EventUnlistenResponse>({
				signal: Signal.EventUnlistenResponse,
				associate
			}, origin)
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

function getOriginPermission({origin, permissions}: {
	origin: string
	permissions: Permission[]
}): Permission {
	const permission = permissions.find(
		({origin: originRegex}) => originRegex.test(origin)
	)
	if (!permission) throw error(`no permission for origin "${origin}"`)
	return permission
}

function validatePermissionsAreWellFormed(permissions: Permission[]) {
	for (const permission of permissions) {

		if (typeof permission.allowedTopics !== "object")
			throw error(`badly formed permission for ${permission.origin}, invalid `
				+ `'allowed' object`)

		if (!Array.isArray(permission.allowedEvents))
			throw error(`badly formed permission for ${permission.origin}, invalid `
				+ `'allowedEvents' array`)
	}
}

function validateMethodPermission({allowedTopics, topic, method, origin}: {
	topic: string
	method: string
	origin: string
	allowedTopics: AllowedTopics
}) {
	const methods = allowedTopics[topic]
	const granted = methods && methods.find(m => m === method)
	if (!granted) throw error(`no permission for method "${topic}.${method}" for `
		+ `origin "${origin}"`)
}

function validateEventPermission({eventName, allowedEvents, origin}: {
	origin: string
	eventName: string
	allowedEvents: AllowedEvents
}) {
	const granted = allowedEvents.find(name => name === eventName) !== undefined
	if (!granted) throw error(`no permission for eventName "${eventName}" for`
		+ ` origin "${origin}"`)
}
