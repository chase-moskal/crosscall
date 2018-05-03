
import {makeClientOptions} from "./testing"
import Client from "./client"
import {
	Signal,
	Message,
	ClientShims,
	ClientOptions
} from "./interfaces"

const goodOrigin = "https://alpha.egg"

describe("crosscall client", (): any => {
	it("binds message event listener", async() => {
		const {shims, ...opts} = makeClientOptions()
		const client = new Client({shims, ...opts})
		const [event, listener, cap] = shims.addEventListener.mock.calls[0]
		expect(event).toBe("message")
		expect(listener).toBeDefined()
	})

	it("unbinds message event listener on destructor", async() => {
		const {shims, ...opts} = makeClientOptions()
		const client = new Client({shims, ...opts})
		client.destructor()
		const [event, listener, cap] = shims.removeEventListener.mock.calls[0]
		expect(event).toBe("message")
		expect(listener).toBeDefined()
	})

	it("accepts wakeup message and launches handshake request", async() => {
		const {shims, ...opts} = makeClientOptions()
		const client = new Client({shims, ...opts})
		const message: Message = {signal: Signal.Wakeup}
		const origin = goodOrigin
		await client.receiveMessage({message, origin})
		expect(shims.postMessage.mock.calls.length).toBe(1)
	})
})
