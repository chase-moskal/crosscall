
import {
	Api,
	Shape,
	Topic,
	ApiShape,
	EventMediator,
} from "../../interfaces.js"

import {
	Signal,
	ClientState,
	RequestFunc,
	CallRequest,
	CallResponse,
	EventListenRequest,
	EventListenResponse,
	EventUnlistenRequest,
	EventUnlistenResponse,
} from "../internal-interfaces.js"

export function makeCallable<A extends Api<A> = Api>({
	state,
	shape,
	request,
}: {
	shape: ApiShape
	state: ClientState
	request: RequestFunc
}): A {
	const callable: Api<any> = {}

	const requestCall = async(message: CallRequest) =>
		(<RequestFunc<CallRequest, CallResponse>>request)
			(message)

	const requestListen = async(message: EventListenRequest) =>
		(<RequestFunc<EventListenRequest, EventListenResponse>>request)
			(message)

	const requestUnlisten = async(message: EventUnlistenRequest) =>
		(<RequestFunc<EventUnlistenRequest, EventUnlistenResponse>>request)
			(message)

	// create topics
	for (const [topic, topicShape] of Object.entries<Shape<Topic>>(shape)) {
		const topicObject: Topic = {methods: {}, events: {}}

		// create methods
		for (const func of Object.keys(topicShape.methods)) {
			topicObject.methods[func] = async(...params: any[]) => {
				const response = await requestCall({
					signal: Signal.CallRequest,
					topic,
					func,
					params,
				})
				return response.result
			}
		}

		// create events
		for (const eventName of Object.keys(topicShape.events)) {
			topicObject.events[eventName] = <EventMediator>{

				async listen(listener) {
					const {listenerId} = await requestListen({
						topic,
						eventName,
						signal: Signal.EventListenRequest,
					})
					state.listenerOrganizer.add(listenerId, listener)
				},

				async unlisten(listener) {
					const listenerId = state.listenerOrganizer.ids.get(listener)
					if (listenerId === undefined)
						throw new Error(`cannot unlisten to unknown listener`)
					await requestUnlisten({
						listenerId,
						signal: Signal.EventUnlistenRequest,
					})
					state.listenerOrganizer.remove(listenerId, listener)
				}
			}
		}

		callable[topic] = topicObject
	}

	return <A>callable
}
