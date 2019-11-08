
import {createIframe} from "../toolbox/create-iframe.js"
import {NuclearApi, nuclearShape as shape} from "./example-common.js"
import {createCrosscallClient} from "../client/create-crosscall-client.js"

export async function exampleClient() {
	const {postMessage} = await createIframe({
		url: "http://localhost:8000/host.html"
	})

	const client = createCrosscallClient<NuclearApi>({
		shape,
		postMessage,
		namespace: "crosscall-example",
		hostOrigin: "http://localhost:8000",
	})

	const nuclear = await client.callable
	const result1 = await nuclear.reactor.methods.generatePower(1, 2)
	console.log(result1)
}
