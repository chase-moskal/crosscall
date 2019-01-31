
import {CreateIframeOptions} from "./interfaces"

export default function createIframe({
	url,
	documentCreateElement = document.createElement.bind(document),
	documentBodyAppendChild = document.body.appendChild.bind(document.body)
}: CreateIframeOptions) {

	const iframe = documentCreateElement("iframe")
	iframe.style.display = "none"
	iframe.src = url
	documentBodyAppendChild(iframe)

	const {contentWindow} = iframe
	const postMessage = contentWindow.postMessage.bind(contentWindow)

	return {postMessage, iframe}
}
