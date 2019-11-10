
import {makeClientOptions, badOrigin} from "../testing.js"
import {crosscallClient} from "../../crosscall-client.js"

describe("crosscall client", () => {

	it("ignores messages with the wrong namespace", async() => {
		const {shims, ...opts} = makeClientOptions()
		let handler: Function
		shims.addEventListener = <any>((eventName: string, handler2: Function) => {
			handler = handler2
		})
		crosscallClient({...opts, shims})
		expect(handler).toBeTruthy()
		const messageWasUsed: boolean = await handler({
			data: {},
			origin: badOrigin,
		})
		expect(messageWasUsed).toBe(false)
	})
})
