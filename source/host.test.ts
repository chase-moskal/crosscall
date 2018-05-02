
import Host from "./host"
import {Callee, Permission, Shims, Signal, Message} from "./interfaces"

describe("crosscall host", () => {

	const makeTestOptions = () => ({
		callee: {
			async test1() { return 1 },
			async test2() { return 2 }
		},
		permissions: [{
			origin: /^https:\/\/bravo.egg$/i,
			allowed: {
				"testbed": ["test1", "test2"]
			}
		}],
		shims: {
			postMessage: jest.fn(),
			addEventListener: jest.fn(),
			removeEventListener: jest.fn()
		}
	})

	describe("constructor", () => {

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

	})
	describe("destructor", () => {

		it.skip("unbinds message event listener on destructor", async() => {
			const {callee, permissions, shims} = makeTestOptions()
			const host = new Host({callee, permissions, shims})
			expect(shims.removeEventListener.mock.calls.length).toBe(1)
		})

	})
	describe("send message", () => {

		it.skip("posts message to parent window", async() => {
			expect(false).toBeTruthy()
		})

	})
	describe("handle message", () => {
		describe("handshake handling", () => {

			it.skip("responds to handshake message", async() => {
				expect(false).toBeTruthy()
			})

		})
		describe("call handling", () => {

			it.skip("responds to call message", async() => {
				expect(false).toBeTruthy()
			})

		})
	})
})
