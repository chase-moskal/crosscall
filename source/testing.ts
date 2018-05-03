
export const makeClientOptions = () => ({
	link: "https://alpha.egg/crosscall-host.html",
	targetOrigin: "https://alpha.egg",
	shims: <any>{
		createElement: jest.fn(),
		appendChild: jest.fn(),
		removeChild: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		postMessage: jest.fn()
	}
})

export const makeHostOptions = () => ({
	callee: {
		testTopic: {
			async test1(x: number) { return x },
			async test2(x: number) { return x + 1 }
		}
	},
	permissions: [{
		origin: /^https:\/\/alpha.egg$/i,
		allowed: {
			testTopic: ["test1", "test2"]
		}
	}],
	shims: {
		postMessage: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn()
	}
})
