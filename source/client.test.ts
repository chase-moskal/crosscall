
import {makeClientOptions, TestClient as Client} from "./testing"
import {
	Signal,
	Message
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

	it("unbinds message event listener on deconstructor", async() => {
		const {shims, ...opts} = makeClientOptions()
		const client = new Client({shims, ...opts})
		client.deconstructor()
		const [event, listener, cap] = shims.removeEventListener.mock.calls[0]
		expect(event).toBe("message")
		expect(listener).toBeDefined()
	})

	it("accepts wakeup message and launches handshake request", async() => {
		const {shims, ...opts} = makeClientOptions()
		const client = new Client({shims, ...opts})
		const message: Message = {signal: Signal.Wakeup}
		const origin = goodOrigin
		await client.testReceiveMessage({message, origin})
		expect(shims.postMessage.mock.calls.length).toBe(1)
	})
})
