
import error from "./error"
import {
	Id,
	Callee,
	Signal,
	Allowed,
	Message,
	Associated,
	ClientShims,
	CallRequest,
	CallResponse,
	ErrorMessage,
	ClientOptions,
	PendingRequest,
	ResponseMessage,
	HandshakeRequest,
	HandshakeResponse,
	HostMessageHandlers,
	HandleMessageParams,
	ClientMessageHandlers
} from "./interfaces"

export default class Client<gCallee extends Callee = Callee> {
	private readonly hostOrigin: string
	private readonly shims: ClientShims
	private readonly requests: Map<Id, PendingRequest> = new Map()
	private iframe: HTMLIFrameElement
	private messageId = 0
	private callableReady = false
	private resolveCallable: any

	readonly callable = new Promise<gCallee>((resolve, reject) => {
		this.resolveCallable = resolve
	})

	constructor({link, targetOrigin, shims = {}}: ClientOptions) {
		this.shims = {...defaultShims, ...shims}
		this.hostOrigin = targetOrigin
		this.preparePostMessage(link)
		this.shims.addEventListener("message", this.handleMessageEvent, false)
	}

	destructor() {
		if (this.iframe) {
			this.shims.removeChild(this.iframe)
			this.iframe = null
		}
		this.shims.removeEventListener("message", this.handleMessageEvent)
	}

	private preparePostMessage(link: string) {
		if (this.shims.postMessage) return
		this.iframe = this.shims.createElement("iframe")
		this.iframe.style.display = "none"
		this.iframe.src = link
		this.shims.appendChild(this.iframe)
		this.shims.postMessage = this.iframe.contentWindow.postMessage.bind(
			this.iframe.contentWindow
		)
	}

	protected async receiveMessage<gMessage extends Message = Message>({
		message,
		origin
	}: {
		message: gMessage
		origin: string
	}): Promise<void> {

		const {hostOrigin} = this

		if (origin !== this.hostOrigin)
			throw error(`message rejected from origin "${origin}"`)

		const handler = this.messageHandlers[message.signal]
		if (!handler)
			throw error(`unknown message signal ${message.signal}`)

		handler(message)
	}

	private readonly handleMessageEvent = ({
		origin, data: message
	}: MessageEvent) => this.receiveMessage({message, origin})

	private async request<gResponse extends ResponseMessage = ResponseMessage>(
		message: Message
	): Promise<gResponse> {
		const id = this.sendMessage(message)
		return new Promise<gResponse>((resolve, reject) => {
			this.requests.set(id, {resolve,reject})
		})
	}

	private sendMessage(message: Message): Id {
		const {iframe, hostOrigin} = this
		const id = this.messageId++
		const payload: Message = {...message, id}
		this.shims.postMessage(payload, hostOrigin)
		return id
	}

	private async callRequest({topic, method, params}: {
		topic: string
		method: string
		params: any[]
	}): Promise<CallResponse> {
		return this.request<CallResponse>(<CallRequest>{
			signal: Signal.CallRequest,
			topic,
			method,
			params
		})
	}

	private passResponseToRequest(response: Message & Associated): void {
		const pending = this.requests.get(response.associate)
		if (!pending) throw error(`unknown response, id "${response.id}" `
			+ `responding to "${response.associate}"`)
		const {resolve, reject} = pending
		this.requests.delete(response.associate)
		if (response.signal === Signal.Error) reject((<ErrorMessage>response).error)
		else resolve(response)
	}

	private makeCallable(allowed: Allowed): gCallee {
		const callable = <gCallee>{}
		for (const topic of Object.keys(allowed)) {
			const methods = allowed[topic]
			const obj: any = {}
			for (const method of methods) {
				obj[method] = async(...params: any[]) => {
					const response = await this.callRequest({topic, method, params})
					return response.result
				}
			}
			callable[topic] = obj
		}
		return callable
	}

	private readonly messageHandlers: ClientMessageHandlers = {
		[Signal.Wakeup]: async(message: Message): Promise<void> => {
			const request: HandshakeRequest = {signal: Signal.HandshakeRequest}
			const {allowed} = await this.request<HandshakeResponse>(request)
			const callable = this.makeCallable(allowed)
			if (!this.callableReady) {
				this.resolveCallable(callable)
				this.callableReady = true
			}
		},
		[Signal.HandshakeResponse]: async(response: HandshakeResponse): Promise<void> => {
			this.passResponseToRequest(response)
		},
		[Signal.CallResponse]: async(response: CallResponse): Promise<void> => {
			this.passResponseToRequest(response)
		}
	}
}

const defaultShims: ClientShims = {
	createElement: document.createElement.bind(document),
	appendChild: document.body.appendChild.bind(document.body),
	removeChild: document.body.removeChild.bind(document.body),
	addEventListener: window.addEventListener.bind(window),
	removeEventListener: window.removeEventListener.bind(window),
	postMessage: null
}
