
import {Methods, Shape} from "renraku/dist/interfaces.js"

//
// COMMON TYPES
//

export {Methods, Shape}

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

export interface Topic<M extends {} = any, E extends {} = any> {
	events: E
	methods: M
}

export type Api<X extends {} = {}> = {
	[P in keyof X]: Topic
}

export type ApiToExposures<A extends Api<A> = {}> = {
	[P in keyof A]: Exposure<A[P]["methods"], A[P]["events"]>
}

export type ApiShape<A extends Api<A> = Api> = {
	[P in keyof A]: {
		[X in keyof A[P]]: Shape<A[P][X]>
	}
}

export interface EventMediator<GListener extends Listener = Listener> {
	listen(listener: GListener): void | Promise<void>
	unlisten(listener: GListener): void | Promise<void>
}

export interface Callable {
	events: Events
	methods: Methods
}

export interface Listener<EventPayload extends Object = any> {
	(event: EventPayload): void
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

//
// HOST
//

export interface HostOptions<A extends Api<A> = Api> {
	namespace: string
	exposures: ApiToExposures<A>
	shims?: Partial<HostShims>
}

export interface Host<A extends Api<A> = Api> {
	stop(): void
}

export interface HostShims {
	postMessage: typeof window.parent.postMessage
	addEventListener: typeof window.addEventListener
	removeEventListener: typeof window.removeEventListener
}

//
// CLIENT
//

export interface ClientShims {
	createElement: typeof document.createElement
	appendChild: typeof document.body.appendChild
	removeChild: typeof document.body.removeChild
	addEventListener: typeof window.addEventListener
	removeEventListener: typeof window.removeEventListener
}

export interface ClientOptions<A extends Api<A> = Api> {
	shape: ApiShape<A>
	namespace: string
	hostOrigin: string
	postMessage: typeof window.postMessage
	shims?: Partial<ClientShims>
}

export interface Client<A extends Api<A> = Api> {
	stop(): void
	callable: Promise<A>
}
