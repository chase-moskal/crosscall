
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

	/** notification of an event taking place */
	Event
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

export interface PendingRequest {
	resolve: any
	reject: any
}

export interface Allowed {
	[topic: string]: AllowedMethods
}

export type AllowedMethods = string[]

export interface HandshakeResponse extends Message, Associated {
	signal: Signal.HandshakeResponse
	allowed: Allowed
}

export interface CallResponse<R = any> extends Message, Associated {
	signal: Signal.CallResponse
	result: R
}

export interface Permission {
	origin: RegExp
	allowed: Allowed
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

export interface Callable {
	[topic: string]: CallableTopic
}

export interface CallableTopic {
	[method: string]: CallableMethod
}

export type CallableMethod = (...args: any[]) => Promise<any>

export interface Callee {
	[topic: string]: CalleeTopic
}

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
	postMessage: typeof window.postMessage
}

export interface HostOptions<gCallee extends Callee = Callee> {
	callee: gCallee
	permissions: Permission[]
	shims?: Partial<HostShims>
}

export interface ClientOptions {
	link: string
	hostOrigin: string
	shims?: Partial<ClientShims>
}

export interface AsyncStorage {

	// standard methods
	clear(): Promise<void>
	getItem(key: string): Promise<string>
	key(index: number): Promise<string>
	removeItem(key: string): Promise<void>
	setItem(key: string): Promise<void>

	// non-standard
	getKeys(): Promise<string[]>
	listen(listener: (e: any) => void): Promise<number>
	unlisten(id: number): Promise<void>
}
