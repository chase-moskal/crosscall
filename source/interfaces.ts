
import {Methods} from "renraku/dist/interfaces.js"
import {Logger} from "renraku/dist/toolbox/logging.js"

//
// COMMON TYPES
// ============
//

export {Methods}

export type Events<X extends {} = {}> = {
	[P in keyof X]: EventMediator
}

export interface CorsPermissions {
	allowed: RegExp
	forbidden: RegExp
}

export interface Exposure<
	M extends Methods<M> = Methods,
	E extends Events<E> = Events
> {
	methods: M
	events: E
	cors: CorsPermissions
}

export interface Topic {
	events: Events
	methods: Methods
}

export type Api<X extends {} = {}> = {
	[name in keyof X]: Topic
}

export type ApiToExposures<A extends Api<A> = {}> = {
	[P in keyof A]: Exposure<A[P]["methods"], A[P]["events"]>
}

export interface EventMediator<GListener extends Listener = Listener> {
	listen(listener: GListener): void | Promise<void>
	unlisten(listener: GListener): void | Promise<void>
}

export interface Callable {
	events: Events
	methods: Methods
}

//
// HOST TYPES
// ==========
//

export interface HostOptions<A extends Api<A> = {}> {
	debug: boolean
	namespace: string
	exposures: ApiToExposures<A>
	logger?: Logger
	shims?: Partial<HostShims>
}

export interface HostShims {
	postMessage: typeof window.parent.postMessage
	addEventListener: typeof window.addEventListener
	removeEventListener: typeof window.removeEventListener
}

export interface HostState {
	messageId: number
	listenerId: number
	listeners: Map<number, ListenerData>
}

export interface SendMessage<M extends Message = Message> {
	(o: {origin: string; message: M}): Promise<Id>
}

//
// CLIENT TYPES
// ============
//

export interface ClientShims {
	createElement: typeof document.createElement
	appendChild: typeof document.body.appendChild
	removeChild: typeof document.body.removeChild
	addEventListener: typeof window.addEventListener
	removeEventListener: typeof window.removeEventListener
}

//
// COMMON INTERNALS
// ================
//

export interface Message {
	id?: Id
	signal: Signal
	namespace?: string
}

export type Id = number

export interface Associated {
	associate: Id
}

export const enum Signal {
	Error,
	Wakeup,

	CallRequest,
	CallResponse,

	Event,
	EventListenRequest,
	EventListenResponse,
	EventUnlistenRequest,
	EventUnlistenResponse
}

export interface ResponseMessage extends Message, Associated {}

export interface ErrorMessage extends Message, Partial<Associated> {
	signal: Signal.Error
	error: string
}

export interface CallRequest extends Message {
	signal: Signal.CallRequest
	topic: string
	func: string
	params: any[]
}

export interface EventListenRequest extends Message {
	signal: Signal.EventListenRequest
	topic: string
	eventName: string
}

export interface EventListenResponse extends ResponseMessage {
	signal: Signal.EventListenResponse
	listenerId: number
}

export interface EventUnlistenRequest extends Message {
	signal: Signal.EventUnlistenRequest
	listenerId: number
}

export interface EventUnlistenResponse extends ResponseMessage {
	signal: Signal.EventUnlistenResponse
}

export interface EventMessage extends Message {
	signal: Signal.Event
	listenerId: number
	eventPayload: any
}

export interface PendingRequest {
	resolve: any
	reject: any
}

export interface CallResponse<R = any> extends ResponseMessage {
	signal: Signal.CallResponse
	result: R
}

export interface Listener<EventPayload extends Object = any> {
	(event: EventPayload): void
}

export interface ClientMessageHandlers {
	[key: string]: (message: Message) => Promise<void>
}

export interface CreateIframeOptions {
	url: string
	documentCreateElement?: typeof document.createElement
	documentBodyAppendChild?: typeof document.body.appendChild
}

export interface CreatePopupOptions {
	url: string
	target?: string
	features?: string
	replace?: boolean
	windowOpen?: typeof window.open
}

export interface PopupOptions {
	target?: string
	features?: string
	replace?: boolean
}

export interface HandleMessageParams<gMessage extends Message = Message> {
	message: gMessage
	origin: string
}

export interface HostMessageHandlers {
	[key: string]: (params: HandleMessageParams) => Promise<void>
}

export interface ListenerData {
	cleanup: () => void
	exposure: Exposure<any, any>
}
