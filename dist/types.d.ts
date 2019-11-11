export declare type Method = (...args: any[]) => Promise<any>;
export declare type Topic<T extends {} = {}> = {
    [P in keyof T]: Method | EventMediator;
};
export declare type Shape<T extends {} = {}> = {
    [P in keyof T]: T[P] extends Method ? "method" : "event";
};
export interface CorsPermissions {
    allowed: RegExp;
    forbidden: RegExp;
}
export interface Exposure<E extends Topic = Topic<any>> {
    exposed: E;
    cors: CorsPermissions;
}
export declare type Api<X extends {} = {}> = {
    [P in keyof X]: Topic;
};
export declare type ApiToExposures<A extends Api<A> = {}> = {
    [P in keyof A]: Exposure<A[P]>;
};
export declare type ApiShape<A extends Api<A> = Api> = {
    [P in keyof A]: Shape<A[P]>;
};
export interface EventMediator<GListener extends Listener = Listener> {
    listen(listener: GListener): void | Promise<void>;
    unlisten(listener: GListener): void | Promise<void>;
}
export interface Listener<EventPayload extends Object = any> {
    (event: EventPayload): void;
}
export interface CreateIframeOptions {
    url: string;
    documentCreateElement?: typeof document.createElement;
    documentBodyAppendChild?: typeof document.body.appendChild;
}
export interface CreatePopupOptions {
    url: string;
    target?: string;
    features?: string;
    replace?: boolean;
    windowOpen?: typeof window.open;
}
export interface PopupOptions {
    target?: string;
    features?: string;
    replace?: boolean;
}
export interface HostOptions<A extends Api<A> = Api> {
    namespace: string;
    exposures: ApiToExposures<A>;
    shims?: Partial<HostShims>;
}
export interface Host<A extends Api<A> = Api> {
    stop(): void;
}
export interface HostShims {
    postMessage: typeof window.parent.postMessage;
    addEventListener: typeof window.addEventListener;
    removeEventListener: typeof window.removeEventListener;
}
export interface ClientShims {
    createElement: typeof document.createElement;
    appendChild: typeof document.body.appendChild;
    removeChild: typeof document.body.removeChild;
    addEventListener: typeof window.addEventListener;
    removeEventListener: typeof window.removeEventListener;
}
export interface ClientOptions<A extends Api<A> = Api> {
    shape: ApiShape<A>;
    namespace: string;
    hostOrigin: string;
    postMessage: typeof window.postMessage;
    shims?: Partial<ClientShims>;
}
export interface Client<A extends Api<A> = Api> {
    stop(): void;
    callable: Promise<A>;
}
