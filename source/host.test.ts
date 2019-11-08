
import {
	nap,
	badOrigin,
	makeHostOptions,
} from "./testing.js"
import {Message, Signal} from "./interfaces.js"
import {createCrosscallHost} from "./host/create-crosscall-host.js"

describe("crosscall host", () => {
	it("ignores messages with the wrong namespace", async() => {
		const options = makeHostOptions()
		let handler: Function
		options.shims.addEventListener = <any>((eventName: string, handler2: Function) => {
			handler = handler2
		})
		createCrosscallHost(options)
		await nap()
		const messageWasUsed: boolean = await handler({
			data: {},
			origin: badOrigin,
		})
		expect(messageWasUsed).toBe(false)
	})

	it("sends a wakeup mesesage", async() => {
		const options = makeHostOptions()
		createCrosscallHost(options)
		const [message, origin] = <[Message, string]>(
			<any>options.shims.postMessage
		).mock.calls[0]
		expect(message.id).toBe(0)
		expect(message.signal).toBe(Signal.Wakeup)
		expect(origin).toBe("*")
	})

	it("binds message event listener", async() => {
		const options = makeHostOptions()
		createCrosscallHost(options)
		expect((<any>options.shims.addEventListener).mock.calls.length).toBe(1)
	})

	it("unbinds message event listener on deconstructor", async() => {
		const options = makeHostOptions()
		const host = createCrosscallHost(options)
		host.stop()
		expect((<any>options.shims.removeEventListener).mock.calls.length).toBe(1)
	})
})
