
import {
	nap,
	badOrigin,
	makeHostOptions,
} from "../testing.js"
import {crosscallHost} from "../../crosscall-host.js"
import {Message, Signal} from "../internal-interfaces.js"

describe("crosscall host", () => {
	it("ignores messages with the wrong namespace", async() => {
		const options = makeHostOptions()
		let handler: Function
		options.shims.addEventListener = <any>((eventName: string, handler2: Function) => {
			handler = handler2
		})
		crosscallHost(options)
		await nap()
		const messageWasUsed: boolean = await handler({
			data: {},
			origin: badOrigin,
		})
		expect(messageWasUsed).toBe(false)
	})

	it("sends a wakeup mesesage", async() => {
		const options = makeHostOptions()
		crosscallHost(options)
		const [message, origin] = <[Message, string]>(
			<any>options.shims.postMessage
		).mock.calls[0]
		expect(message.id).toBe(0)
		expect(message.signal).toBe(Signal.Wakeup)
		expect(origin).toBe("*")
	})

	it("binds message event listener", async() => {
		const options = makeHostOptions()
		crosscallHost(options)
		expect((<any>options.shims.addEventListener).mock.calls.length).toBe(1)
	})

	it("unbinds message event listener on deconstructor", async() => {
		const options = makeHostOptions()
		const host = crosscallHost(options)
		host.stop()
		expect((<any>options.shims.removeEventListener).mock.calls.length).toBe(1)
	})
})
