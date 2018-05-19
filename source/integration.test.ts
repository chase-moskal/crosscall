
import {Message, Signal} from "./interfaces"
import {
	makeClientOptions,
	makeHostOptions,
	TestCallee,
	TestClient as Client,
	TestHost as Host
} from "./testing"

const nap = async() => sleep(10)
const sleep = async(ms: number) =>
	new Promise((resolve, reject) => setTimeout(resolve, ms))

const goodOrigin = "https://alpha.egg"

const makeBridgedSetup = () => {
	const clientOptions = makeClientOptions()
	const hostOptions = makeHostOptions()

	// route host output to client input
	hostOptions.shims.postMessage = (jest.fn<typeof window.postMessage>(
		async(message: Message, origin: string) => {
			await sleep(0)
			client.testReceiveMessage({message, origin: goodOrigin})
		}
	))

	// route client output to host input
	clientOptions.shims.postMessage = (jest.fn<typeof window.postMessage>(
		async(message: Message, origin: string) => {
			await sleep(0)
			host.testReceiveMessage({message, origin: goodOrigin})
		}
	))

	// client created first, the way iframes work
	const client = new Client<TestCallee>(clientOptions)
	const host = new Host(hostOptions)

	return {client, host, clientOptions, hostOptions}
}

describe("crosscall host/client integration", () => {

	test("wakeup call from host is received by client", async() => {
		const {client, host, hostOptions, clientOptions} = makeBridgedSetup()
		const {postMessage: hostPostMessage} = hostOptions.shims
		const {postMessage: clientPostMessage} = clientOptions.shims
		await nap()
		expect(hostPostMessage).toHaveBeenCalled()
		expect(clientPostMessage).toHaveBeenCalled()
		expect(hostPostMessage.mock.calls[0][0].signal).toBe(Signal.Wakeup)
	})

	test("handshake is exchanged", async() => {
		const {client, host, hostOptions, clientOptions} = makeBridgedSetup()
		const {postMessage: hostPostMessage} = hostOptions.shims
		const {postMessage: clientPostMessage} = clientOptions.shims
		await nap()
		expect(clientPostMessage.mock.calls[0][0].signal).toBe(Signal.HandshakeRequest)
		expect(hostPostMessage.mock.calls[1][0].signal).toBe(Signal.HandshakeResponse)
	})

	test("callable resolves", async() => {
		const {client, host, hostOptions, clientOptions} = makeBridgedSetup()
		const callable = await client.callable
		expect(callable).toBeDefined()
		expect(callable.testTopic).toBeDefined()
		expect(callable.testTopic).toHaveProperty("test1")
		expect(callable.testTopic).toHaveProperty("test2")
	})

	test("end to end call requests", async() => {
		const {client, host, hostOptions, clientOptions} = makeBridgedSetup()
		const {testTopic} = await client.callable
		const result = await testTopic.test1(5)
		expect(result).toBe(5)
		const result2 = await testTopic.test2(5)
		expect(result2).toBe(6)
	})
})
