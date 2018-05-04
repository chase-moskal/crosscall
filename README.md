
# CROSSCALL <br/> cross-origin postmessage rpc

`npm install crosscall`

- **facilitates remote procedure calls between webpages**  
	even if they are on different origins

- **expose async functionality**  
	which other pages can call remotely  
	with a seamless calling experience

- **great example: localstorage**  
	you could expose an async adapter for `localStorage`  
	allowing access to a single localstorage from any domain  
	— actually that's my next project, stay tuned

## usage by example

- host page, at "`https://alpha.egg/host.html`"

	```js
	const host = new Host({

		// object with async functionality to be exposed
		callee: {
			testTopic: {
				async test1(x) { return x },
				async test2(x) { return x + 1 }
			}
		},

		// each client origin gets its own callee access permission
		permissions: [{
			origin: /^https:\/\/bravo.egg/,
			allowed: {
				testTopic: ["test1", "test2"]
			}
		}]
	}
	```

- client page, at "`https://bravo.egg/client.html`"

	```js
	const client = new Client({
		link: "https://alpha.egg/host.html",
		targetOrigin: "https://alpha.egg"
	})

	async function demoBusiness() {

		// wait for the client to provide the callable object
		const {testTopic} = await client.callable

		// each topic is seamlessly usable
		const result1 = await testTopic.test1(4) //> 4
		const result2 = await testTopic.test2(4) //> 5
	}
	```

## design ideas

- **seamless calling experience for the client**
	- no more awful-to-maintain string literals:
		```js
		// garbage
		const result = await rpc.request("testTopic", "test1", [5])
		```
	- we want it to look like the real thing  
	(yes even with the right typescript typings):
		```js
		// crosscall experience
		const result = await testTopic.test1(5)
		```

- **simple permissions system**
	- can allow access differently for each origin, on a per-method basis

- **secure** *[coming soon hahah]*
	- both client and server will reject messages from untrusted origins
	- it's architected with security in mind, but many more unit tests are needed  
		to really lock this thing down — it's young yet :)
