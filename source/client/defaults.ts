
import {ClientShims, PopupOptions} from "../interfaces.js"

export const defaultShims: ClientShims = {
	createElement: document.createElement.bind(document),
	appendChild: document.body.appendChild.bind(document.body),
	removeChild: document.body.removeChild.bind(document.body),
	addEventListener: window.addEventListener.bind(window),
	removeEventListener: window.removeEventListener.bind(window)
}

export const defaultPopupOptions: PopupOptions = {
	target: undefined,
	features: undefined,
	replace: undefined
}