
import {Suite} from "cynic"

import {Listener} from "../interfaces.js"
import {crosscallHost} from "../crosscall-host.js"
import {crosscallClient} from "../crosscall-client.js"

import {
	nap,
	badOrigin,
	MockFunction,
	makeHostOptions,
	makeBridgedSetup,
	makeClientOptions,
} from "./testing.js"
import {Signal, Message} from "./internal-interfaces.js"

const isDefined = (x: any) => x !== null && x !== undefined

export default <Suite>{

	"client/host integration": {
		"wakeup call from host is received by client": async() => {
			const {hostOptions} = makeBridgedSetup()
			const {postMessage: hostPostMessage} = hostOptions.shims
			await nap()
			return (
				((<MockFunction>hostPostMessage).calls.length > 0)
				 &&
				((<MockFunction & any>hostPostMessage)
					.calls[0].provided[0].signal === Signal.Wakeup)
			)
		},
		"callable resolves": async() => {
			const {client} = makeBridgedSetup()
			const nuclear = await client.callable
			return (
				isDefined(nuclear)
				 &&
				isDefined(nuclear.reactor)
				 &&
				isDefined(nuclear.reactor.generatePower)
				 &&
				isDefined(nuclear.reactor.radioactiveMeltdown)
			)
		},
		"end to end call requests": async() => {
			const {client} = makeBridgedSetup()
			const {reactor} = await client.callable

			const result1 = await reactor.generatePower(1, 2)
			const result2 = await reactor.generatePower(2, 3)

			return (
				(result1 === 3)
				 &&
				(result2 === 5)
			)
		},
		"client can listen and unlisten to host events": async() => {
			const {client, dispatchAlarmEvent} = makeBridgedSetup()
			const {reactor} = await client.callable

			let result1 = <boolean>false
			let result2 = <boolean>false

			const listener: Listener = event => { result1 = event.alpha }
			await reactor.alarm.listen(listener)
			dispatchAlarmEvent({alpha: true})
			await nap()

			result2 = false
			await reactor.alarm.unlisten(listener)
			dispatchAlarmEvent({alpha: true})
			await nap()

			return (
				(result1 === true)
				 &&
				(result2 === false)
			)
		}
	},

	"host": {
		"ignores messages with the wrong namespace": async() => {
			const options = makeHostOptions()
			let handler: Function
			options.shims.addEventListener = <any>((eventName: string, handler2: Function) => {
				handler = handler2
			})
			crosscallHost(options)
			await nap()
			const messageWasUsed: boolean = await handler({
				data: {},
				origin: badOrigin,
			})
			return (
				(messageWasUsed === false)
			)
		},
		"sends a wakeup mesesage": async() => {
			const options = makeHostOptions()
			crosscallHost(options)
			const [message, origin] = <[Message, string]>(
				<any>options.shims.postMessage
			).calls[0].provided
			return (
				(message.id === 0)
				 &&
				(message.signal === Signal.Wakeup)
				 &&
				(origin === "*")
			)
		},
		"binds message event listener": async() => {
			const options = makeHostOptions()
			crosscallHost(options)
			return (
				(<any>options.shims.addEventListener).calls.length === 1
			)
		},
		"unbinds message event listener on deconstructor": async() => {
			const options = makeHostOptions()
			const host = crosscallHost(options)
			host.stop()
			return (
				(<any>options.shims.removeEventListener).calls.length === 1
			)
		},
	},

	"client": {
		"ignores messages with the wrong namespace": async() => {
			const {shims, ...opts} = makeClientOptions()
			let handler: Function
			shims.addEventListener = <any>(
				(eventName: string, handler2: Function) => {
					handler = handler2
				}
			)
			crosscallClient({...opts, shims})
			const messageWasUsed: boolean = await handler({
				data: {},
				origin: badOrigin,
			})
			return (
				(!!handler)
				 &&
				(messageWasUsed === false)
			)
		},
	},
}
