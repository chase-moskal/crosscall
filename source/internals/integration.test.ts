
import {
	nap,
	makeBridgedSetup,
} from "./testing.js"
import {Listener} from "../interfaces.js"
import {Signal} from "./internal-interfaces.js"

describe("crosscall host/client integration", () => {

	test("wakeup call from host is received by client", async() => {
		const {hostOptions} = makeBridgedSetup()
		const {postMessage: hostPostMessage} = hostOptions.shims
		await nap()
		expect(hostPostMessage).toHaveBeenCalled()
		expect((<any>hostPostMessage).mock.calls[0][0].signal).toBe(Signal.Wakeup)
	})

	test("callable resolves", async() => {
		const {client} = makeBridgedSetup()
		const nuclear = await client.callable
		expect(nuclear).toBeDefined()
		expect(nuclear.reactor).toBeDefined()
		expect(nuclear.reactor.generatePower).toBeDefined()
		expect(nuclear.reactor.radioactiveMeltdown).toBeDefined()
	})

	test("end to end call requests", async() => {
		const {client} = makeBridgedSetup()
		const {reactor} = await client.callable

		const result1 = await reactor.generatePower(1, 2)
		expect(result1).toBe(3)
	
		const result2 = await reactor.generatePower(2, 3)
		expect(result2).toBe(5)
	})

	test("client can listen and unlisten to host events", async() => {
		const {client, dispatchAlarmEvent} = makeBridgedSetup()
		const {reactor} = await client.callable

		let result: boolean = false
		const listener: Listener = event => { result= event.alpha }
		await reactor.alarm.listen(listener)
		dispatchAlarmEvent({alpha: true})
		await nap()
		expect(result).toBe(true)

		result = false
		await reactor.alarm.unlisten(listener)
		dispatchAlarmEvent({alpha: true})
		await nap()
		expect(result).toBe(false)
	})
})