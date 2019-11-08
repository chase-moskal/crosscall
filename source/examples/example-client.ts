
import {createIframe} from "../toolbox/create-iframe.js"
import {NuclearApi, nuclearShape as shape} from "./example-common.js"
import {createCrosscallClient} from "../client/create-crosscall-client.js"

export async function exampleClient(url: string) {
	const {href, origin: hostOrigin} = new URL(url)

	const {postMessage} = await createIframe({
		url: href
	})

	const client = createCrosscallClient<NuclearApi>({
		shape,
		hostOrigin,
		postMessage,
		namespace: "crosscall-example",
	})

	const nuclear = await client.callable
	const result = await nuclear.reactor.methods.generatePower(1, 2)

	const success = result === 3
	return success
}
