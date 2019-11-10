
import {ListenerData} from "../internal-interfaces.js"
import {Exposure, EventMediator} from "../../interfaces.js"

export function enforcePermissions({origin, exposure}: {
	origin: string
	exposure: Exposure
}): boolean {
	let permitted = false

	if (!exposure.cors) throw new Error(`cors permissions must be specified`)

	const {allowed, forbidden} = exposure.cors
	if (!allowed) throw new Error(`cors.allowed must be specified`)

	if (allowed.test(origin)) permitted = true
	if (forbidden && forbidden.test(origin)) permitted = false
	if (!permitted) throw new Error(`not permitted`)

	return permitted
}

export function getExposure({topic, exposures}: {
	topic: string
	exposures: {[key: string]: Exposure}
}) {
	const exposure = exposures[topic]
	if (!exposure) throw new Error(`unknown exposure topic "${topic}"`)
	return exposure
}

export function getMethodExecutor({func, params, exposure}: {
	func: string
	params: any[]
	exposure: Exposure<any, any>
}) {
	const method = exposure.methods[func]
	if (!method) throw new Error(`unknown method "${func}"`)
	return () => method.apply(exposure.methods, params)
}

export function getEventMediator({eventName, exposure}: {
	eventName: string
	exposure: Exposure<any, any>
}) {
	const mediator: EventMediator = exposure.events[eventName]
	if (!mediator) throw new Error(`unknown event "${eventName}"`)
	return mediator
}

export function getListenerData({listenerId, listeners}: {
	origin: string
	listenerId: number
	listeners: Map<number, ListenerData>
}) {
	const listenerData = listeners.get(listenerId)
	if (!listenerData) throw new Error(`unknown listener id "${listenerId}"`)
	return listenerData
}
