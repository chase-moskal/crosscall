
// import {Signal, Message} from "./interfaces.js"
// import {makeClientOptions, TestClient as Client} from "./testing.js"

// const goodOrigin = "https://alpha.egg"

// describe("crosscall client", () => {
// 	it("ignores messages with the wrong namespace", async() => {
// 		const {shims, ...opts} = makeClientOptions()
// 		let handler: Function
// 		shims.addEventListener = <any>((eventName: string, handler2: Function) => {
// 			handler = handler2
// 		})
// 		const client = new Client({shims, ...opts})
// 		expect(handler).toBeTruthy()
// 		const messageWasUsed: boolean = await handler({
// 			origin: "incorrect-origin",
// 			data: "lul"
// 		})
// 		expect(messageWasUsed).toBe(false)
// 	})

// 	it("binds message event listener", async() => {
// 		const {shims, ...opts} = makeClientOptions()
// 		const client = new Client({shims, ...opts})
// 		const [event, listener, cap] = (<any>shims.addEventListener).mock.calls[0]
// 		expect(event).toBe("message")
// 		expect(listener).toBeDefined()
// 	})

// 	it("unbinds message event listener on deconstructor", async() => {
// 		const {shims, ...opts} = makeClientOptions()
// 		const client = new Client({shims, ...opts})
// 		client.deconstructor()
// 		const [event, listener, cap] = (<any>shims.removeEventListener).mock.calls[0]
// 		expect(event).toBe("message")
// 		expect(listener).toBeDefined()
// 	})

// 	it("accepts wakeup message and launches handshake request", async() => {
// 		const {shims, namespace, ...opts} = makeClientOptions()
// 		const client = new Client({shims, namespace, ...opts})
// 		const message: Message = {signal: Signal.Wakeup, namespace}
// 		const origin = goodOrigin
// 		await client.testReceiveMessage({message, origin})
// 		expect((<any>opts.postMessage).mock.calls.length).toBe(1)
// 	})
// })
