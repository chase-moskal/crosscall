import { ClientState, RequestFunc } from "../internal-types.js";
export declare function prepareRequestFunction({ state, namespace, hostOrigin, postMessage, }: {
    namespace: string;
    hostOrigin: string;
    state: ClientState;
    postMessage: typeof window.postMessage;
}): RequestFunc;
