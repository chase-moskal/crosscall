
import {Host} from "./host"
import {Client} from "./client"
import {
	Callee,
	Message,
	CalleeTopic,
	Callable,
	HostOptions,
	ClientOptions,
	HostEvents
} from "./interfaces"

export type TestListener = (value: number) => void

export interface TestCallee extends Callee {
	testTopic: {
		test1(x: number): Promise<number>
		test2(x: number): number
	}
}

export interface TestCallable extends Callable {
	testTopic: {
		test1(x: number): Promise<number>
		test2(x: number): Promise<number>
	}
}

export const makeClientOptions = () => ({
	link: "https://alpha.egg/crosscall-host.html",
	hostOrigin: "https://alpha.egg",
	shims: {
		createElement: jest.fn<typeof document.createElement>(),
		appendChild: jest.fn<typeof document.appendChild>(),
		removeChild: jest.fn<typeof document.removeChild>(),
		addEventListener: jest.fn<typeof window.addEventListener>(),
		removeEventListener: jest.fn<typeof window.removeEventListener>(),
		postMessage: jest.fn<typeof window.postMessage>()
	}
})

export const makeHostOptions = () => ({
	callee: <TestCallee>{
		testTopic: {
			async test1(x: number) { return x },
			test2(x: number) { return x + 1 }
		}
	},
	events: {
		testEvent: {
			listen: <any>jest.fn(),
			unlisten: <any>jest.fn()
		}
	},
	permissions: [{
		origin: /^https:\/\/alpha.egg$/i,
		allowed: {
			testTopic: ["test1", "test2"]
		},
		allowedEvents: ["testEvent"]
	}],
	shims: {
		postMessage: jest.fn<typeof window.postMessage>(),
		addEventListener: jest.fn<typeof window.addEventListener>(),
		removeEventListener: jest.fn<typeof window.removeEventListener>()
	}
})

export class TestHost<
	gCallee extends Callee = Callee,
	gEvents extends HostEvents = HostEvents
> extends Host<gCallee> {

	async testReceiveMessage<gMessage extends Message = Message>(params: {
		message: gMessage
		origin: string
	}) {
		return this.receiveMessage(params)
	}

	async testFireEvent(listenerId: number, event: any, origin: string) {
		this.fireEvent(listenerId, event, origin)
	}
}

export class TestClient<
	gCallable extends Callable = any
>extends Client<gCallable> {

	async testReceiveMessage<gMessage extends Message = Message>(params: {
		message: gMessage
		origin: string
	}): Promise<void> {
		return this.receiveMessage(params)
	}
}
