
import {
	errtag,
	Callee,
	Message,
	ClientShims,
	ClientOptions
} from "./interfaces"

export default class Client<gCallee extends Callee = Callee> {
	private readonly targetOrigin: string
	private readonly iframe: HTMLIFrameElement
	private readonly shims: ClientShims
	private messageId = 0

	constructor({link, targetOrigin, shims = {}}: ClientOptions) {
		this.shims = {...defaultShims, ...shims}
		this.targetOrigin = targetOrigin

		if (!this.shims.postMessage) {
			this.iframe = this.shims.createElement("iframe")
			this.iframe.src = link
			this.shims.appendChild(this.iframe)
			this.shims.postMessage = this.iframe.contentWindow.postMessage.bind(
				this.iframe.contentWindow
			)
		}

		this.shims.addEventListener("message", this.handleMessage, false)
	}

	destructor() {
		if (this.iframe) this.shims.removeChild(this.iframe)
		this.shims.removeEventListener("message", this.handleMessage)
	}

	get callable(): Promise<gCallee> {
		return
	}

	private sendMessage(data: Message) {
		const {iframe, targetOrigin} = this
		const payload = {...data, id: this.messageId++}
		this.shims.postMessage("", targetOrigin)
	}

	private readonly handleMessage = ({origin, data}: MessageEvent) => {
		const {targetOrigin} = this
		if (origin === this.targetOrigin) {}
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
