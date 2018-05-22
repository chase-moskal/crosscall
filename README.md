
# CROSSCALL <br/> cross-origin postmessage rpc

`npm install crosscall`

- **facilitate remote procedure calls between webpages**  
	even if they are on different origins

- **expose async functionality across pages**  
	which other pages can call remotely  
	with a seamless calling experience  
	using iframe/postmessage under the hood  

- **great example: localstorage**  
	a page can expose access to its `localStorage`  
	allowing access to a single localstorage from any domain  

- [**live demo**](https://chasemoskal.com/crosscall/)

## usage by example

- **host page, at "`https://localhost:8080/host.html`"**  
	see sourcecode [host.ts](./source/host.ts)

	```js
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
			}
		}]
	})
	```

- **client page, at "`https://localhost:8080/index.html`"**  
	see sourcecode [client.ts](./source/client.ts)

	```js
	// create crosscall client
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
	- no more awful-to-maintain string literals:
		```js
		// garbage
		const result = await rpc.request("testTopic", "test1", [5])
		```
	- crosscall feels like the real thing  
	(yes even with the right typescript typings):
		```js
		// crosscall experience
		const result = await testTopic.test1(5)
		```

- **simple permissions system**
	- can allow access differently for each origin, on a per-method basis
	- both client and host will reject messages from untrusted origins

	```typescript
	// each client origin gets its own callee access permission
	permissions: [{
		origin: /^http:\/\/localhost:8080/,
		allowed: {
			testTopic: ["test1", "test2"]
		}
	}]
	```
