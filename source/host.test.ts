
import Host from "./host"
import {
	Callee,
	Permission,
	HostShims,
	Signal,
	Message,
	HandshakeRequest,
	HandshakeResponse,
	CallRequest,
	CallResponse
} from "./interfaces"

const testTopic = "testTopic"
const test1 = "test1"
const test2 = "test2"

const makeTestOptions = () => ({
	callee: {
		[testTopic]: {
			async ["test1"](x: number) { return x },
			async ["test2"](x: number) { return x + 1 }
		}
	},
	permissions: [{
		origin: /^https:\/\/alpha.egg$/i,
		allowed: {
			testTopic: [test1, test2]
		}
	}],
	shims: {
		postMessage: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn()
	}
})

const goodOrigin = "https://alpha.egg"
const badOrigin = "https://bravo.egg"

describe("crosscall host", () => {

	it("sends a wakeup mesesage", async() => {
		const {callee, permissions, shims} = makeTestOptions()
		const host = new Host({callee, permissions, shims})
		const [message, origin] = <[Message, string]>shims.postMessage.mock.calls[0]
		expect(message.id).toBe(0)
		expect(message.signal).toBe(Signal.Wakeup)
		expect(origin).toBe("*")
	})

	it("binds message event listener", async() => {
		const {callee, permissions, shims} = makeTestOptions()
		const host = new Host({callee, permissions, shims})
		expect(shims.addEventListener.mock.calls.length).toBe(1)
	})

	it("unbinds message event listener on destructor", async() => {
		const {callee, permissions, shims} = makeTestOptions()
		const host = new Host({callee, permissions, shims})
		host.destructor()
		expect(shims.removeEventListener.mock.calls.length).toBe(1)
	})

	it("responds to handshake message", async() => {
		const {callee, permissions, shims} = makeTestOptions()
		const host = new Host({callee, permissions, shims})
		const id = 123
		const message: HandshakeRequest = {
			id,
			signal: Signal.Handshake
		}
		const origin = goodOrigin
		await host.receiveMessage({message, origin})
		const [m, o] = <[HandshakeResponse, string]>shims.postMessage.mock.calls[1]
		expect(m.associate).toBe(id)
		expect(o).toBe(origin)
	})

	it("responds to call messages", async() => {
		const {callee, permissions, shims} = makeTestOptions()
		const host = new Host({callee, permissions, shims})
		const origin = goodOrigin

		await host.receiveMessage({
			message: <CallRequest>{
				id: 123,
				signal: Signal.Call,
				topic: testTopic,
				method: test1,
				params: [5]
			},
			origin
		})

		const [call1message, call1origin] = <[CallResponse<number>, string]>shims.postMessage.mock.calls[1]
		expect(call1message.associate).toBe(123)
		expect(call1origin).toBe(origin)
		expect(call1message.result).toBe(5)

		await host.receiveMessage({
			message: <CallRequest>{
				id: 124,
				signal: Signal.Call,
				topic: testTopic,
				method: test2,
				params: [5]
			},
			origin
		})

		const [call2message, call2origin] = <[CallResponse<number>, string]>shims.postMessage.mock.calls[2]
		expect(call2message.associate).toBe(124)
		expect(call2origin).toBe(origin)
		expect(call2message.result).toBe(6)
	})

	it("rejects unauthorized handshake requests", async() => {
		const {callee, permissions, shims} = makeTestOptions()
		const host = new Host({callee, permissions, shims})
		const origin = badOrigin

		expect(host.receiveMessage({
			message: <CallRequest>{
				id: 123,
				signal: Signal.Call,
				topic: testTopic,
				method: test1,
				params: [5]
			},
			origin
		})).rejects.toBeDefined()
	})

	it("rejects unauthorized call requests", async() => {
		const {callee, permissions, shims} = makeTestOptions()
		const host = new Host({callee, permissions, shims})
		const origin = badOrigin

		expect(host.receiveMessage({
			message: <CallRequest>{
				id: 123,
				signal: Signal.Call,
				topic: testTopic,
				method: test1,
				params: [5]
			},
			origin
		})).rejects.toBeDefined()
	})

	it("rejects unknown topics and methods", async() => {
		const {callee, permissions, shims} = makeTestOptions()
		const host = new Host({callee, permissions, shims})
		const origin = goodOrigin

		expect(host.receiveMessage({
			message: <CallRequest>{
				id: 123,
				signal: Signal.Call,
				topic: "000",
				method: test1,
				params: [5]
			},
			origin
		})).rejects.toBeDefined()

		expect(host.receiveMessage({
			message: <CallRequest>{
				id: 123,
				signal: Signal.Call,
				topic: testTopic,
				method: "000",
				params: [5]
			},
			origin
		})).rejects.toBeDefined()
	})
})
