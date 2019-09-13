
import {Signal, Message} from "./interfaces.js"
import {makeClientOptions, TestClient as Client} from "./testing.js"

const goodOrigin = "https://alpha.egg"

describe("crosscall client", () => {
	it("binds message event listener", async() => {
		const {shims, ...opts} = makeClientOptions()
		const client = new Client({shims, ...opts})
		const [event, listener, cap] = (<any>shims.addEventListener).mock.calls[0]
		expect(event).toBe("message")
		expect(listener).toBeDefined()
	})

	it("unbinds message event listener on deconstructor", async() => {
		const {shims, ...opts} = makeClientOptions()
		const client = new Client({shims, ...opts})
		client.deconstructor()
		const [event, listener, cap] = (<any>shims.removeEventListener).mock.calls[0]
		expect(event).toBe("message")
		expect(listener).toBeDefined()
	})

	it("accepts wakeup message and launches handshake request", async() => {
		const {shims, ...opts} = makeClientOptions()
		const client = new Client({shims, ...opts})
		const message: Message = {signal: Signal.Wakeup}
		const origin = goodOrigin
		await client.testReceiveMessage({message, origin})
		expect((<any>opts.postMessage).mock.calls.length).toBe(1)
	})
})
