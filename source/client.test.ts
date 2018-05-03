
import Client from "./client"
import {
	ClientShims,
	ClientOptions
} from "./interfaces"

describe("crosscall client", (): any => {
	const makeTestOptions = () => ({
		link: "https://alpha.egg/host.html",
		targetOrigin: "https://alpha.egg",
		shims: <any>{
			createElement: jest.fn(),
			appendChild: jest.fn(),
			removeChild: jest.fn(),
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			postMessage: jest.fn()
		}
	})

	it("binds message event listener", async() => {
		const {shims, ...opts} = makeTestOptions()
		const client = new Client({shims, ...opts})
		const [event, listener, cap] = shims.addEventListener.mock.calls[0]
		expect(event).toBe("message")
		expect(listener).toBeDefined()
	})

	it("unbinds message event listener on destructor", async() => {
		const {shims, ...opts} = makeTestOptions()
		const client = new Client({shims, ...opts})
		client.destructor()
		const [event, listener, cap] = shims.removeEventListener.mock.calls[0]
		expect(event).toBe("message")
		expect(listener).toBeDefined()
	})
})
