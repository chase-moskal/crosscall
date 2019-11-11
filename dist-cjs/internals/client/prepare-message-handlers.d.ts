import { ClientState, ClientMessageHandlers } from "../internal-interfaces.js";
export declare const prepareMessageHandlers: ({ state, resolveReady }: {
    state: ClientState;
    resolveReady: () => void;
}) => ClientMessageHandlers;
