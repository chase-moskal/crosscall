
import {
	Id,
	errtag,
	Callee,
	Signal,
	Allowed,
	Message,
	Associated,
	ClientShims,
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
	private resolveCallable: any
	private readonly callable = new Promise<gCallee>((resolve, reject) => {
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

	async receiveMessage({message, origin}: {message: Message; origin: string}) {
		
	}

	private preparePostMessage(link: string) {
		if (this.shims.postMessage) return
		this.iframe = this.shims.createElement("iframe")
		this.iframe.src = link
		this.shims.appendChild(this.iframe)
		this.shims.postMessage = this.iframe.contentWindow.postMessage.bind(
			this.iframe.contentWindow
		)
	}

	private readonly handleMessageEvent = (event: MessageEvent) => {
		const {origin, data: message} = event
		const {hostOrigin} = this

		if (origin !== this.hostOrigin)
			throw new Error(`${errtag} message from origin not allowed "${origin}"`)

		const handler = this.messageHandlers[message.signal]
		handler(message)
	}

	private async request<gResponse extends ResponseMessage = ResponseMessage>(
		message: Message
	): Promise<gResponse> {
		this.sendMessage(message)
		return new Promise<gResponse>((resolve, reject) => {
			this.requests.set(message.id, {resolve,reject})
		})
	}

	private sendMessage(message: Message): void {
		const {iframe, hostOrigin} = this
		const payload: Message = {...message, id: this.messageId++}
		this.shims.postMessage(payload, hostOrigin)
	}

	private passResponseToRequest(response: Message & Associated): void {
		const pending = this.requests.get(response.associate)
		if (!pending) throw new Error(
			`${errtag} unknown response, id "${response.id}" responding to `
			+ `"${response.associate}"`
		)
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
				obj[method] = async() => {}
			}
			callable[topic] = obj
		}
		return callable
	}

	private readonly messageHandlers: ClientMessageHandlers = {
		[Signal.Wakeup]: async(message: Message): Promise<void> => {
			const request: HandshakeRequest = {signal: Signal.Handshake}
			const {allowed} = await this.request<HandshakeResponse>(request)
			const callable = this.makeCallable(allowed)
		},
		[Signal.Handshake]: async(response: HandshakeResponse): Promise<void> => {
			this.passResponseToRequest(response)
		},
		[Signal.Call]: async(response: CallResponse): Promise<void> => {
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
