
import {makeHostOptions, TestHost as Host} from "./testing.js"
import {
	Signal,
	Message,
	Permission,
	CallRequest,
	CallResponse,
	HandshakeRequest,
	HandshakeResponse,
} from "./interfaces.js"

const goodOrigin = "https://alpha.egg"
const badOrigin = "https://bravo.egg"

describe("crosscall host", () => {
	it("ignores messages with the wrong namespace", async() => {
		const {callee, permissions, shims, ...opts} = makeHostOptions()
		let handler: Function
		shims.addEventListener = <any>((eventName: string, handler2: Function) => {
			handler = handler2
		})
		const host = new Host({callee, permissions, shims, ...opts})
		const messageWasUsed: boolean = await handler({
			origin: "incorrect-origin",
			data: "lul"
		})
		expect(messageWasUsed).toBe(false)
	})

	it("sends a wakeup mesesage", async() => {
		const {callee, permissions, shims, ...opts} = makeHostOptions()
		const host = new Host({callee, permissions, shims, ...opts})
		const [message, origin] = <[Message, string]>(<any>shims.postMessage).mock.calls[0]
		expect(message.id).toBe(0)
		expect(message.signal).toBe(Signal.Wakeup)
		expect(origin).toBe("*")
	})

	it("binds message event listener", async() => {
		const {callee, permissions, shims, ...opts} = makeHostOptions()
		const host = new Host({callee, permissions, shims, ...opts})
		expect((<any>shims.addEventListener).mock.calls.length).toBe(1)
	})

	it("unbinds message event listener on deconstructor", async() => {
		const {callee, permissions, shims, ...opts} = makeHostOptions()
		const host = new Host({callee, permissions, shims, ...opts})
		host.deconstructor()
		expect((<any>shims.removeEventListener).mock.calls.length).toBe(1)
	})

	it("responds to handshake message", async() => {
		const {callee, permissions, shims, namespace} = makeHostOptions()
		const host = new Host({callee, permissions, shims, namespace})
		const id = 123
		const message: HandshakeRequest = {
			id,
			namespace,
			signal: Signal.HandshakeRequest
		}
		const origin = goodOrigin
		await host.testReceiveMessage({message, origin})
		const [m, o] = <[HandshakeResponse, string]>(<any>shims.postMessage).mock.calls[1]
		expect(m.associate).toBe(id)
		expect(o).toBe(origin)
	})

	it("responds to call messages", async() => {
		const {callee, permissions, shims, namespace} = makeHostOptions()
		const host = new Host({callee, permissions, shims, namespace})
		const origin = goodOrigin

		await host.testReceiveMessage({
			message: <CallRequest>{
				id: 123,
				namespace,
				signal: Signal.CallRequest,
				topic: "testTopic",
				method: "test1",
				params: [5]
			},
			origin
		})

		const [call1message, call1origin] = <[CallResponse<number>, string]>(
			<any>shims.postMessage
		).mock.calls[1]

		expect(call1message.associate).toBe(123)
		expect(call1origin).toBe(origin)
		expect(call1message.result).toBe(5)

		await host.testReceiveMessage({
			message: <CallRequest>{
				id: 124,
				namespace,
				signal: Signal.CallRequest,
				topic: "testTopic",
				method: "test2",
				params: [5]
			},
			origin
		})

		const [call2message, call2origin] = <[CallResponse<number>, string]>(
			<any>shims.postMessage
		).mock.calls[2]

		expect(call2message.associate).toBe(124)
		expect(call2origin).toBe(origin)
		expect(call2message.result).toBe(6)
	})

	it("rejects unauthorized handshake requests", async() => {
		const {callee, permissions, shims, namespace, ...opts} = makeHostOptions()
		const host = new Host({callee, permissions, shims, namespace, ...opts})
		const origin = badOrigin

		expect(host.testReceiveMessage({
			message: <CallRequest>{
				id: 123,
				namespace,
				signal: Signal.CallRequest,
				topic: "testTopic",
				method: "test1",
				params: [5]
			},
			origin
		})).rejects.toBeDefined()
	})

	it("rejects unauthorized call requests", async() => {
		const {callee, permissions, shims, namespace, ...opts} = makeHostOptions()
		const host = new Host({callee, permissions, shims, namespace, ...opts})
		const origin = badOrigin

		expect(host.testReceiveMessage({
			message: <CallRequest>{
				id: 123,
				namespace,
				signal: Signal.CallRequest,
				topic: "testTopic",
				method: "test1",
				params: [5]
			},
			origin
		})).rejects.toBeDefined()
	})

	it("rejects unknown topics and methods", async() => {
		const {callee, permissions, shims, namespace, ...opts} = makeHostOptions()
		const host = new Host({callee, permissions, shims, namespace, ...opts})
		const origin = goodOrigin

		expect(host.testReceiveMessage({
			message: <CallRequest>{
				id: 123,
				namespace,
				signal: Signal.CallRequest,
				topic: "000",
				method: "test1",
				params: [5]
			},
			origin
		})).rejects.toBeDefined()

		expect(host.testReceiveMessage({
			message: <CallRequest>{
				id: 123,
				namespace,
				signal: Signal.CallRequest,
				topic: "testTopic",
				method: "000",
				params: [5]
			},
			origin
		})).rejects.toBeDefined()
	})

	it("throws an error when permissions are ill-defined", async() => {
		const {callee, permissions, shims, ...opts} = makeHostOptions()

		const overridePermissions = (override: Partial<Permission>) =>
			permissions.map(permission => ({...permission, ...override}))

		expect(() => new Host({
			callee,
			shims,
			permissions: overridePermissions({allowedTopics: undefined}),
			...opts
		})).toThrow()

		expect(() => new Host({
			callee,
			shims,
			permissions: overridePermissions({allowedTopics: undefined}),
			...opts
		})).toThrow()
	})
})
