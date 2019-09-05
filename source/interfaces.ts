
export interface Message {
	id?: Id
	signal: Signal
}

export type Id = number

/**
 * SIGNAL ENUM
 *  - types of messages transferred between client and host
 */
export const enum Signal {

	/** indicates an error */
	Error,

	/** host broadcasts wakeup call when it finishes loading in the iframe */
	Wakeup,

	/** client sends a handshake request when it hears the wakeup call */
	HandshakeRequest,

	/** host responds to the handshake, and communicates which functions are
		allowed to it */
	HandshakeResponse,

	/** client wants to call functionality on the host's callee */
	CallRequest,

	/** host responds with the results of a client call */
	CallResponse,

	Event,
	EventListenRequest,
	EventListenResponse,
	EventUnlistenRequest,
	EventUnlistenResponse
}

/**
 * - object which is associated with a message
 * - eg response messages may implement this
 */
export interface Associated {
	associate: Id
}

export interface ResponseMessage extends Message, Associated {}

export interface ErrorMessage extends Message, Partial<Associated> {
	signal: Signal.Error
	error: string
}

export interface HandshakeRequest extends Message {
	signal: Signal.HandshakeRequest
}

export interface CallRequest extends Message {
	signal: Signal.CallRequest
	topic: string
	method: string
	params: any[]
}

export interface EventListenRequest extends Message {
	signal: Signal.EventListenRequest
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

export interface AllowedTopics {
	[topic: string]: AllowedMethods
}

export type AllowedMethods = string[]
export type AllowedEvents = string[]

export interface HandshakeResponse extends ResponseMessage {
	signal: Signal.HandshakeResponse
	allowedTopics: AllowedTopics
	allowedEvents: AllowedEvents
}

export interface CallResponse<R = any> extends ResponseMessage {
	signal: Signal.CallResponse
	result: R
}

export interface Permission {
	origin: RegExp
	allowedTopics: AllowedTopics
	allowedEvents: string[]
}

export interface HandleMessageParams<gMessage extends Message = Message> {
	message: gMessage
	origin: string
	permission: Permission
}

export interface HostMessageHandlers {
	[key: string]: (params: HandleMessageParams) => Promise<void>
}

export interface ClientMessageHandlers {
	[key: string]: (message: Message) => Promise<void>
}

export interface ClientCallable {
	topics: CallableTopics
	events: ClientEvents
}

export interface HostCallee {
	topics: CalleeTopics
	events: HostEvents
}

export interface CallableTopics {
	[topic: string]: CallableTopic
}

export interface CalleeTopics {
	[topic: string]: CalleeTopic
}

export interface CallableTopic {
	[method: string]: CallableMethod
}

export type CallableMethod = (...args: any[]) => Promise<any>

export interface CalleeTopic {
	[method: string]: CalleeMethod
}

export type CalleeMethod = (...args: any[]) => any

export interface HostShims {
	postMessage: typeof window.parent.postMessage
	addEventListener: typeof window.addEventListener
	removeEventListener: typeof window.removeEventListener
}

export interface ClientShims {
	createElement: typeof document.createElement
	appendChild: typeof document.body.appendChild
	removeChild: typeof document.body.removeChild
	addEventListener: typeof window.addEventListener
	removeEventListener: typeof window.removeEventListener
}

export interface Listener<EventPayload extends Object = any> {
	(event: EventPayload): void
}

export interface HostEventMediator<GListener extends Listener = Listener> {
	listen(listener: GListener): void
	unlisten(listener: GListener): void
}

export interface ClientEventMediator<GListener extends Listener = Listener> {
	listen(listener: GListener): Promise<void>
	unlisten(listener: GListener): Promise<void>
}

export interface HostEvents {
	[eventName: string]: HostEventMediator
}

export interface ClientEvents {
	[eventName: string]: ClientEventMediator
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

export interface HostOptions<gCallee extends HostCallee = HostCallee> {
	callee: gCallee
	permissions: Permission[]
	shims?: Partial<HostShims>
}

export interface PopupOptions {
	target?: string
	features?: string
	replace?: boolean
}

export interface ClientOptions {
	hostOrigin: string
	postMessage: typeof window.postMessage
	shims?: Partial<ClientShims>
}
