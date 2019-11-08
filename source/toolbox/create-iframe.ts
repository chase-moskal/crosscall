
import {CreateIframeOptions} from "../interfaces.js"

export async function createIframe({
	url,
	documentCreateElement = document.createElement.bind(document),
	documentBodyAppendChild = document.body.appendChild.bind(document.body)
}: CreateIframeOptions) {

	try {
		const precheck = await fetch(url)
		if (precheck.status !== 200)
			console.error(`createIframe failed to load "${url}"`)
	}
	catch (error) {
		console.error(`createIframe failed to load "${url}": ${error.message}`)
	}

	const iframe = documentCreateElement("iframe")
	iframe.style.display = "none"
	iframe.src = url
	documentBodyAppendChild(iframe)

	const {contentWindow} = iframe
	const postMessage = contentWindow.postMessage.bind(contentWindow)

	return {postMessage, iframe}
}
