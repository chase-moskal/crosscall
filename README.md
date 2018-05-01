
# CROSSCALL <br/> cross-domain iframe postmessage rpc

```js
// iframe

const host = new Host({
	expose: {
		asyncLocalStorage: {
			callee: new AsyncLocalStorage(),
			origin: /example\.com$/,
			methods: ["getItem", "setItem"]
		}
	}
}

// client

const client = new Client({
	link: "https://example.com/crosscall"
})
const {asyncLocalStorage} = await client.callable
const value = await asyncLocalStorage.getItem("lol")
```
