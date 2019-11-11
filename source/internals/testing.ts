
import {crosscallHost} from "../crosscall-host.js"
import {crosscallClient } from "../crosscall-client.js"
import {ReactorTopic} from "./examples/example-host.js"
import {NuclearApi, nuclearShape} from "./examples/example-common.js"

import {Message} from "./internal-interfaces.js"
import {
	Host,
	Client,
	Listener,
	HostOptions,
	ClientOptions,
	EventMediator,
} from "../interfaces.js"

export const makeClientOptions = (): ClientOptions<NuclearApi> => ({
	shape: nuclearShape,
	namespace: "crosscall-testing",
	hostOrigin: "https://alpha.egg",
	postMessage: jest.fn<typeof window.postMessage, any>(),
	shims: {
		createElement: <typeof document.createElement>jest.fn(),
		appendChild: <typeof document.appendChild>jest.fn(),
		removeChild: <typeof document.removeChild>jest.fn(),
		addEventListener: <typeof window.addEventListener>jest.fn(),
		removeEventListener: <typeof window.removeEventListener>jest.fn()
	}
})

export const makeHostOptions = (): HostOptions<NuclearApi> => ({
	namespace: "crosscall-testing",
	exposures: {
		reactor: {
			exposed: new ReactorTopic(),
			cors: {
				allowed: /^https:\/\/alpha\.egg$/i,
				forbidden: null
			}
		}
	},
	shims: {
		postMessage: <typeof window.postMessage>jest.fn(),
		addEventListener: <typeof window.addEventListener>jest.fn(),
		removeEventListener: <typeof window.removeEventListener>jest.fn()
	}
})

export const nap = async() => sleep(100)
export const sleep = async(ms: number) =>
	new Promise((resolve, reject) => setTimeout(resolve, ms))

export const goodOrigin = "https://alpha.egg"
export const badOrigin = "https://beta.bad"

export function mockReactorAlarm(): {
	dispatchAlarmEvent: (event: any) => void
	alarm: EventMediator
} {
	let subs: Listener[] = []
	return {
		alarm: {
			listen: listener => {
				subs.push(listener)
			},
			unlisten: listener => {
				subs = subs.filter(sub => sub !== listener)
			}
		},
		dispatchAlarmEvent: (event: any) => {
			for (const sub of subs) sub(event)
		}
	}
}

export const makeBridgedSetup = () => {
	const hostOptions = makeHostOptions()
	const clientOptions = makeClientOptions()
	const {alarm, dispatchAlarmEvent} = mockReactorAlarm()
	hostOptions.exposures.reactor.exposed.alarm = alarm

	let host: Host<NuclearApi>
	let client: Client<NuclearApi>

	// get message senders
	let messageHost: (o: Partial<MessageEvent>) => void
	let messageClient: (o: Partial<MessageEvent>) => void
	hostOptions.shims.addEventListener = jest.fn(
		async(eventName, func: any) => messageHost = func
	)
	clientOptions.shims.addEventListener = jest.fn(
		async(eventName, func: any) => messageClient = func
	)

	// route host output to client input
	hostOptions.shims.postMessage = <any><typeof window.postMessage>jest.fn(
		async(message: Message, origin: string) => {
			await sleep(0)
			messageClient({origin: goodOrigin, data: message})
		}
	)

	// route client output to host input
	clientOptions.postMessage = (<typeof window.postMessage>jest.fn(
		<any>(async(message: Message, origin: string) => {
			await sleep(0)
			messageHost({origin: goodOrigin, data: message})
		})
	))

	// client created first, the way iframes work
	client = crosscallClient<NuclearApi>(clientOptions)
	host = crosscallHost<NuclearApi>(hostOptions)

	return {client, host, clientOptions, hostOptions, dispatchAlarmEvent}
}
