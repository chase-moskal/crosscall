
# CROSSCALL <br/> cross-domain iframe postmessage rpc

```js
// host iframe

const host = new Host({

	// object with async functionality to be exposed
	callee: {
		testTopic: {
			async test1(x) { return x },
			async test2(x) { return x + 1 }
		}
	},

	// each client origin gets its own permission set for callee access
	permissions: [{
		origin: /^https:\/\/alpha.egg/,
		allowed: {
			testTopic: ["test1", "test2"]
		}
	}]
}
```

```js
// client page

const client = new Client({
	link: "https://example.com/crosscall",
	targetOrigin: "https://example.com"
})

async function demoBusiness() {

	// wait for the client to provide the callable object
	const {testTopic} = await client.callable

	// each topic is seamlessly usable
	const result1 = await testTopic.test1(4) //> 4
	const result2 = await testTopic.test2(4) //> 5
}
```
