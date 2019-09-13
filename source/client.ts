
import {error} from "./error.js"
import {ListenerOrganizer} from "./listener-organizer.js"
import {
	Id,
	Signal,
	Message,
	ClientShims,
	CallRequest,
	CallResponse,
	ErrorMessage,
	EventMessage,
	PopupOptions,
	AllowedTopics,
	AllowedEvents,
	ClientOptions,
	PendingRequest,
	ClientCallable,
	ResponseMessage,
	HandshakeRequest,
	HandshakeResponse,
	EventListenRequest,
	ClientEventMediator,
	EventListenResponse,
	EventUnlistenRequest,
	ClientMessageHandlers,
} from "./interfaces.js"

export class Client<gCallable extends ClientCallable = ClientCallable> {
	private readonly hostOrigin: string
	private readonly postMessage: typeof window.postMessage
	private readonly shims: ClientShims
	private readonly requests: Map<Id, PendingRequest> = new Map()
	private readonly listenerOrganizer = new ListenerOrganizer()
	private iframe: HTMLIFrameElement
	private messageId = 0

	private callableReady = false
	private resolveCallable: any
	readonly callable = new Promise<gCallable>((resolve, reject) => {
		this.resolveCallable = resolve
	})

	constructor({
		hostOrigin,
		postMessage,
		shims = {}
	}: ClientOptions) {
		const {handleMessageEvent} = this
		this.shims = {...defaultShims, ...shims}
		this.hostOrigin = hostOrigin
		this.postMessage = postMessage
		this.shims.addEventListener("message", handleMessageEvent, false)
	}

	deconstructor() {
		const {iframe, shims, handleMessageEvent} = this
		if (iframe) {
			shims.removeChild(iframe)
			this.iframe = null
		}
		shims.removeEventListener("message", handleMessageEvent)
	}

	private readonly handleMessageEvent = ({
		origin,
		data: message
	}: MessageEvent) => this.receiveMessage({message, origin})

	protected async receiveMessage<gMessage extends Message = Message>({
		message,
		origin
	}: {
		message: gMessage
		origin: string
	}): Promise<void> {
		const {hostOrigin, messageHandlers} = this

		if (origin !== hostOrigin)
			throw error(`message rejected from origin "${origin}"`)

		const handler = messageHandlers[message.signal]
		if (!handler)
			throw error(`unknown message signal ${message.signal}`)

		handler(message)
	}

	private async request<
		gMessage extends Message = Message,
		gResponse extends ResponseMessage = ResponseMessage
	>(
		message: gMessage
	): Promise<gResponse> {
		const id = await this.sendMessage<gMessage>(message)
		return new Promise<gResponse>((resolve, reject) => {
			this.requests.set(id, {resolve, reject})
		})
	}

	private async sendMessage<gMessage extends Message = Message>(message: gMessage): Promise<Id> {
		const id = this.messageId++
		const payload: gMessage = {...<any>message, id}
		await this.postMessage(payload, this.hostOrigin)
		return id
	}

	private async callRequest({topic, method, params}: {
		topic: string
		method: string
		params: any[]
	}): Promise<CallResponse> {
		return this.request<CallRequest, CallResponse>({
			signal: Signal.CallRequest,
			topic,
			method,
			params
		})
	}

	private passResponseToRequest(response: ResponseMessage): void {
		const {requests} = this
		const pending = requests.get(response.associate)
		if (!pending) throw error(`unknown response, id "${response.id}" `
			+ `responding to "${response.associate}"`)
		const {resolve, reject} = pending
		requests.delete(response.associate)
		if (response.signal === Signal.Error) reject((<ErrorMessage>response).error)
		else resolve(response)
	}

	private makeCallable(allowedTopics: AllowedTopics, allowedEvents: AllowedEvents): gCallable {

		const callable = <gCallable>{
			topics: {},
			events: {}
		}

		// prepare topics
		for (const topic of Object.keys(allowedTopics)) {
			const methods = allowedTopics[topic]
			const obj: any = {}
			for (const method of methods) {
				obj[method] = async(...params: any[]) => {
					const response = await this.callRequest({topic, method, params})
					return response.result
				}
			}
			callable.topics[topic] = obj
		}

		// prepare events
		const {listenerOrganizer} = this
		for (const eventName of allowedEvents) {
			const event: ClientEventMediator = {
				listen: async(listener) => {
					const {listenerId} = await this.request<EventListenRequest, EventListenResponse>({
						signal: Signal.EventListenRequest,
						eventName
					})
					listenerOrganizer.add(listenerId, listener)
				},
				unlisten: async(listener) => {
					const listenerId = listenerOrganizer.ids.get(listener)
					if (listenerId === undefined) throw error(`cannot unlisten to unknown listener`)
					await this.request<EventUnlistenRequest>({
						signal: Signal.EventUnlistenRequest,
						listenerId
					})
					listenerOrganizer.remove(listenerId, listener)
				}
			}
			callable.events[eventName] = event
		}

		// return the whole callable object
		return callable
	}

	private prepPasser = () => async(response: ResponseMessage): Promise<void> => {
		this.passResponseToRequest(response)
	}

	private readonly messageHandlers: ClientMessageHandlers = {
		[Signal.Wakeup]: async(message: Message): Promise<void> => {
			const {allowedTopics, allowedEvents}
				= await this.request<HandshakeRequest, HandshakeResponse>({
					signal: Signal.HandshakeRequest
				})
			const callable = this.makeCallable(allowedTopics, allowedEvents)
			if (!this.callableReady) {
				this.resolveCallable(callable)
				this.callableReady = true
			}
		},
		[Signal.HandshakeResponse]: this.prepPasser(),
		[Signal.CallResponse]: this.prepPasser(),
		[Signal.EventListenResponse]: this.prepPasser(),
		[Signal.EventUnlistenResponse]: this.prepPasser(),
		[Signal.Event]: async(message: EventMessage): Promise<void> => {
			const {listenerOrganizer} = this
			const {listenerId, eventPayload} = message
			const listener = listenerOrganizer.listeners.get(listenerId)
			if (listener) listener(eventPayload)
		}
	}
}

const defaultShims: ClientShims = {
	createElement: document.createElement.bind(document),
	appendChild: document.body.appendChild.bind(document.body),
	removeChild: document.body.removeChild.bind(document.body),
	addEventListener: window.addEventListener.bind(window),
	removeEventListener: window.removeEventListener.bind(window)
}

const defaultPopupOptions: PopupOptions = {
	target: undefined,
	features: undefined,
	replace: undefined
}
