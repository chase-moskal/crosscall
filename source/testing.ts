
import {Host} from "./host.js"
import {Client} from "./client.js"
import {
	Message,
	HostCallee,
	ClientOptions,
	ClientCallable,
} from "./interfaces"

export type TestListener = (value: number) => void

export interface TestCallee extends HostCallee {
	topics: {
		testTopic: {
			test1(x: number): Promise<number>
			test2(x: number): number
		}
	}
}

export interface TestCallable extends ClientCallable {
	topics: {
		testTopic: {
			test1(x: number): Promise<number>
			test2(x: number): Promise<number>
		}
	}
}

const hostUrl = "https://alpha.egg/crosscall-host.html"

export const makeClientOptions = (): ClientOptions => ({
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

export const makeHostOptions = () => ({
	callee: {
		topics: {
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
		}
	},
	permissions: [{
		origin: /^https:\/\/alpha.egg$/i,
		allowedTopics: {
			testTopic: ["test1", "test2"]
		},
		allowedEvents: ["testEvent"]
	}],
	shims: {
		postMessage: <typeof window.postMessage>jest.fn(),
		addEventListener: <typeof window.addEventListener>jest.fn(),
		removeEventListener: <typeof window.removeEventListener>jest.fn()
	}
})

export class TestHost<gCallee extends HostCallee = HostCallee> extends Host<gCallee> {

	async testReceiveMessage<gMessage extends Message = Message>(params: {
		message: gMessage
		origin: string
	}) {
		return this.receiveMessage(params)
	}

	async testFireEvent(listenerId: number, event: any, origin: string) {
		return this.fireEvent(listenerId, event, origin)
	}
}

export class TestClient<
	gCallable extends ClientCallable = any
>extends Client<gCallable> {

	async testReceiveMessage<gMessage extends Message = Message>(params: {
		message: gMessage
		origin: string
	}): Promise<void> {
		return this.receiveMessage(params)
	}
}


export const nap = async() => sleep(100)
export const sleep = async(ms: number) =>
	new Promise((resolve, reject) => setTimeout(resolve, ms))

export const goodOrigin = "https://alpha.egg"
export const badOrigin = "https://beta.bad"

export const makeBridgedSetup = () => {
	const clientOptions = makeClientOptions()
	const hostOptions = makeHostOptions()

	let client: TestClient<TestCallable>
	let host: TestHost<TestCallee>

	// route host output to client input
	hostOptions.shims.postMessage = <any><typeof window.postMessage>jest.fn(
		async(message: Message, origin: string) => {
			await sleep(0)
			await client.testReceiveMessage({message, origin: goodOrigin})
		}
	)

	// route client output to host input
	clientOptions.postMessage = (<typeof window.postMessage>jest.fn(
		<any>(async(message: Message, origin: string) => {
			await sleep(0)
			await host.testReceiveMessage({message, origin: goodOrigin})
		})
	))

	// client created first, the way iframes work
	client = new TestClient<TestCallable>(clientOptions)
	host = new TestHost<TestCallee>(hostOptions)

	return {client, host, clientOptions, hostOptions}
}
