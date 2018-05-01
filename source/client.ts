
import {
	errtag,
	Callee,
	Message,
	ClientOptions
} from "./interfaces"

/**
 * CROSS CALL CLIENT
 */
export default class Client<gCallee extends Callee = Callee> {
	private readonly targetOrigin: string
	private readonly iframe: HTMLIFrameElement
	private messageId = 0

	constructor({link, targetOrigin}: ClientOptions) {
		this.targetOrigin = targetOrigin
		this.iframe = document.createElement("iframe")
		this.iframe.src = link
		document.body.appendChild(this.iframe)
		window.addEventListener("message", this.handleMessage, false)
	}

	destructor() {
		document.body.removeChild(this.iframe)
		window.removeEventListener("message", this.handleMessage)
	}

	get callable(): Promise<gCallee> {
		return
	}

	private sendMessage(data: Message) {
		const {iframe, targetOrigin} = this
		const payload = {...data, id: this.messageId++}
		iframe.contentWindow.postMessage("", targetOrigin)
	}

	private readonly handleMessage = ({origin, data}: MessageEvent) => {
		const {targetOrigin} = this
		if (origin === this.targetOrigin) {}
	}
}
