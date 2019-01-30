
import {Signal, Listener} from "./interfaces"
import {
	nap,
	goodOrigin,
	makeBridgedSetup,
} from "./testing"

describe("crosscall host/client integration", () => {

	test("wakeup call from host is received by client", async() => {
		const {hostOptions, clientOptions} = makeBridgedSetup()
		const {postMessage: hostPostMessage} = hostOptions.shims
		const {postMessage: clientPostMessage} = clientOptions.shims
		await nap()
		expect(hostPostMessage).toHaveBeenCalled()
		expect(clientPostMessage).toHaveBeenCalled()
		expect(hostPostMessage.mock.calls[0][0].signal).toBe(Signal.Wakeup)
	})

	test("handshake is exchanged", async() => {
		const {hostOptions, clientOptions} = makeBridgedSetup()
		const {postMessage: hostPostMessage} = hostOptions.shims
		const {postMessage: clientPostMessage} = clientOptions.shims
		await nap()
		expect(clientPostMessage.mock.calls[0][0].signal).toBe(Signal.HandshakeRequest)
		expect(hostPostMessage.mock.calls[1][0].signal).toBe(Signal.HandshakeResponse)
	})

	test("callable resolves", async() => {
		const {client} = makeBridgedSetup()
		const callable = await client.callable
		expect(callable).toBeDefined()
		expect(callable.topics.testTopic).toBeDefined()
		expect(callable.topics.testTopic).toHaveProperty("test1")
		expect(callable.topics.testTopic).toHaveProperty("test2")
	})

	test("end to end call requests", async() => {
		const {client} = makeBridgedSetup()
		const {testTopic} = (await client.callable).topics
		const result = await testTopic.test1(5)
		expect(result).toBe(5)
		const result2 = await testTopic.test2(5)
		expect(result2).toBe(6)
	})

	test("client can listen and unlisten to host events", async() => {
		const {client, host} = makeBridgedSetup()
		const eventPayload = {alpha: true}
		const {testEvent} = (await client.callable).events
		let result
		const listener: Listener = event => { result = event.alpha }
		await testEvent.listen(listener)
		await host.testFireEvent(0, eventPayload, goodOrigin)
		expect(result).toBe(true)
		result = false
		await testEvent.unlisten(listener)
		await host.testFireEvent(0, eventPayload, goodOrigin)
		await nap()
		expect(result).toBe(false)
	})
})
