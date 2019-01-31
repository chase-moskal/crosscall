
import {CreatePopupOptions} from "./interfaces"

export default function createPopup({
	url,
	target,
	features,
	replace,
	windowOpen = window.open.bind(window)
}: CreatePopupOptions) {

	const popup = windowOpen(url, target, features, replace)
	const postMessage = popup.postMessage.bind(popup)

	return {postMessage, popup}
}
