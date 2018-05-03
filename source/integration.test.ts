
import {Host, Client} from "./index"
import {makeClientOptions, makeHostOptions} from "./testing"

describe("crosscall host/client integration", () => {
	it("wakeup call from host is received by client", async() => {
		const client = new Client(makeClientOptions())
		const host = new Host(makeHostOptions())
	})
})
