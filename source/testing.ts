
import {Callee, Message} from "./interfaces"
import Client from "./client"
import Host from "./host"

export interface TestCallee extends Callee {
	testTopic: {
		test1(x: number): Promise<number>
		test2(x: number): Promise<number>
	}
}

export const makeClientOptions = () => ({
	link: "https://alpha.egg/crosscall-host.html",
	targetOrigin: "https://alpha.egg",
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
			async test2(x: number) { return x + 1 }
		}
	},
	permissions: [{
		origin: /^https:\/\/alpha.egg$/i,
		allowed: {
			testTopic: ["test1", "test2"]
		}
	}],
	shims: {
		postMessage: jest.fn<typeof window.postMessage>(),
		addEventListener: jest.fn<typeof window.addEventListener>(),
		removeEventListener: jest.fn<typeof window.removeEventListener>()
	}
})

export class TestHost<gCallee extends Callee = Callee> extends Host<gCallee> {
	async testReceiveMessage<gMessage extends Message = Message>(params: {
		message: gMessage
		origin: string
	}) {
		return this.receiveMessage(params)
	}
}

export class TestClient<gCallee extends Callee = Callee> extends Client<gCallee> {
	async testReceiveMessage<gMessage extends Message = Message>(params: {
		message: gMessage
		origin: string
	}): Promise<void> {
		return this.receiveMessage(params)
	}
}
