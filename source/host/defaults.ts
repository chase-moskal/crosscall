
import {HostShims} from "../interfaces.js"

export const defaultShims: HostShims = {
	postMessage: (() => {
		const {parent, opener} = window
		if (parent && parent !== window) return parent.postMessage.bind(parent)
		else if (opener && opener !== window) return opener.postMessage.bind(opener)
		else return null
	})(),
	addEventListener: window.addEventListener.bind(window),
	removeEventListener: window.removeEventListener.bind(window)
}
