
# crosscall

*postmessage rpc across origins*

**`npm install crosscall`**

- **remote procedure calls and events between webpages**  
  even if they are on different origins  

- **crosscall client opens the host page in an iframe or a popup**  
  the host can expose async functionality to the client  
  crosscall mediates the client and host via postmessage  

- **use-case example: cross-origin token storage**  
  a crosscall host could provide access to its `localStorage`  
  this allows for secure cross-domain token storage (federated identity)  

- [**live demo**](https://chasemoskal.com/crosscall/)

## usage by example

- **host page, at "`https://localhost:8080/host.html`"**

  ```js
  // create crosscall host on page, which will be in popup or iframe
  const host = new crosscall.Host({

    callee: {

      // async functions exposed for client to use
      topics: {
        exampleTopic: {
          async exampleMethodAlpha(x) { return x },
          async exampleMethodBravo(x) { return x + 1 }
        }
      },

      // events exposed for client to use
      events: {
        exampleEvent: {
          listen(listener) {
            window.addEventListener("explosion", listener)
          }
          unlisten(listener) {
            window.removeEventListener("explosion", listener)
          }
        }
      }
    },

    // each client origin gets its own access permissions
    permissions: [{
      origin: /^http:\/\/localhost:8080$/,
      allowedTopics: {
        exampleTopic: ["exampleMethodAlpha", "exampleMethodBravo"]
      },
      allowedEvents: ["exampleEvent"]
    }]
  })
  ```

- **client page, at "`https://localhost:8080/index.html`"**

  ```js
  // create crosscall client spawn host page in an iframe or a popup
  const client = new crosscall.Client({
    hostUrl: "http://localhost:8080/host.html",
    hostOrigin: "http://localhost:8080",
    popup: false // spawn host in iframe instead of popup (default)
  })

  // wait for the callable object to become available
  const {topics, events} = await client.callable

  // seamlessly utilize the host's functionality
  const result1 = await topics.exampleTopic.exampleMethodAlpha(4) //> 4
  const result2 = await topics.exampleTopic.exampleMethodBravo(4) //> 5

  // listen for an event
  events.exampleEvent.listen(() => console.log("exampleEvent"))

  ```

## noteworthy design points

- **seamless calling experience for the client**
  ```js
  // garbage — we don't need these awful-to-maintain string literals
  const result = await rpc.request("exampleTopic", "exampleMethodAlpha", [5])

  // seamless crosscall experience — feels just like the real thing
  const result = await topics.exampleTopic.exampleMethodAlpha(5)
  ```

- **simple permissions system**
  - specify allowed access for each origin, on a per-method basis
  - both client and host will reject messages from untrusted origins

  ```typescript
  // each client origin gets its own callee access permission
  permissions: [{
    origin: /^http:\/\/localhost:8080$/,
    allowedTopics: {
      exampleTopic: ["exampleMethodAlpha", "exampleMethodBravo"]
    },
    allowedEvents: []
  }]
  ```

## staying secure

- i'm not responsible for how you use this tech
- you've really got to use this stuff over **HTTPS**
