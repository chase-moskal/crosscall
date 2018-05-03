
export const errtag = "crosscall error -"

export interface Callee {
	[method: string]: (...args: any[]) => Promise<any>
}

export const enum Signal {
	Error,
	Wakeup,
	Handshake,
	Call
}

export type Id = number

export interface Message {
	id?: Id
	signal: Signal
}

export interface Response {
	response: Id
}

export interface ErrorMessage extends Message, Partial<Response> {
	signal: Signal.Error
	error: string
}

export interface HandshakeRequest extends Message {
	signal: Signal.Handshake
}

export interface CallRequest extends Message {
	signal: Signal.Call
	topic: string
	method: string
	params: any[]
}

export interface Allowed {

	/** array of method names */
	[topicName: string]: string[]
}

export interface HandshakeResponse extends Message, Response {
	signal: Signal.Handshake
	allowed: Allowed
}

export interface CallResponse<R = any> extends Message, Response {
	signal: Signal.Call
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

export interface MessageHandlers {
	[key: string]: (params: HandleMessageParams) => Promise<Message & Response>
}

export interface Shims {
	postMessage: typeof window.parent.postMessage
	addEventListener: typeof window.addEventListener
	removeEventListener: typeof window.removeEventListener
}

export interface HostOptions<gCallee extends Callee = Callee> {
	callee: gCallee
	permissions: Permission[]
	shims?: Partial<Shims>
}

export interface ClientOptions {
	link: string
	targetOrigin: string
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
