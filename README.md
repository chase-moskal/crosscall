
# crosscall <br/> &nbsp;<small><em>postmessage rpc across origins</em></small>

**`npm install crosscall`**

- **facilitate remote procedure calls between webpages**  
	even if they are on different origins

- **expose async functionality across pages**  
	which other pages can call remotely  
	with a seamless calling experience  
	using iframe/postmessage under the hood  

- **great example: localstorage**  
	a page can securely expose access to its `localStorage`  
	allowing access to a single localstorage from any domain  

- [**live demo**](https://chasemoskal.com/crosscall/)

## usage by example

- **host page, at "`https://localhost:8080/host.html`"**  
	sourcecode [host.ts](./source/host.ts)

	```js
	// create crosscall host on page that will be embedded as iframe
	const host = new crosscall.Host({

		// functionality exposed for clients to call
		callee: {
			testTopic: {
				async test1(x) { return x },
				async test2(x) { return x + 1 }
			}
		},

		// each client origin gets its own callee access permission
		permissions: [{
			origin: /^http:\/\/localhost:8080/,
			allowed: {
				testTopic: ["test1", "test2"]
			},
			allowedEvents: []
		}]
	})
	```

- **client page, at "`https://localhost:8080/index.html`"**  
	sourcecode [client.ts](./source/client.ts)

	```js
	// create crosscall client which opens the host page in a hidden iframe
	const client = new crosscall.Client({
		link: "http://localhost:8080/host.html",
		hostOrigin: "http://localhost:8080"
	})

	// wait for the callable object to become available
	const {testTopic} = await client.callable

	// seamlessly utilize the host's functionality
	const result1 = await testTopic.test1(4)
	const result2 = await testTopic.test2(4)

	console.log(result1) //> 4
	console.log(result2) //> 5
	```

## noteworthy design points

- **seamless calling experience for the client**
	- no awful-to-maintain string literals
		```js
		// garbage
		const result = await rpc.request("testTopic", "test1", [5])
		```
	- crosscall feels like the real thing *(and maintains proper typescript
		typings)*
		```js
		// crosscall experience
		const result = await testTopic.test1(5)
		```

- **simple permissions system**
	- specify allowed access for each origin, on a per-method basis
	- both client and host will reject messages from untrusted origins

	```typescript
	// each client origin gets its own callee access permission
	permissions: [{
		origin: /^http:\/\/localhost:8080/,
		allowed: {
			testTopic: ["test1", "test2"]
		},
		allowedEvents: []
	}]
	```

## event system *(experimental)*

- this event system allows the client page to listen for events on the host page.  
	this allows for bi-directional communication between the client and host pages

- **host page**

	```js
	const host = new crosscall.Host({

		// functionality exposed for clients to call
		callee: {
			testTopic: {
				async test1(x) { return x },
				async test2(x) { return x + 1 }
			}
		},

		// events available for the client to listen for
		events: {
			testExplosion: {
				listen(listener) {
					window.addEventListener("explosion", listener)
				}
				unlisten(listener) {
					window.removeEventListener("explosion", listener)
				}
			}
		},

		// each client origin gets its own callee access permission
		permissions: [{
			origin: /^http:\/\/localhost:8080/,
			allowed: {
				testTopic: ["test1", "test2"]
			},
			allowedEvents: ["testExplosion"]
		}]
	})
	```

- **client page**

	```js
	const client = new crosscall.Client({
		link: "http://localhost:8080/host.html",
		hostOrigin: "http://localhost:8080"
	})

	// wait for the callable object to become available
	const {testTopic} = await client.callable
	const {testEvent} = await client.events

	// seamlessly utilize the host's functionality
	const result1 = await testTopic.test1(4)
	const result2 = await testTopic.test2(4)

	testEvent.listen(() => console.log("testEvent"))

	console.log(result1) //> 4
	console.log(result2) //> 5
	```

## staying secure

- i'm not responsible for how you use this tech
- in production, you've really got to use this stuff over **HTTPS**
