import { HostShims } from "../../interfaces.js";
import { HostState, Message } from "../internal-interfaces.js";
export declare function prepareSendMessage({ state, shims, namespace, }: {
    state: HostState;
    shims: HostShims;
    namespace: string;
}): <gMessage extends Message = Message>({ origin, message }: {
    origin: string;
    message: gMessage;
}) => Promise<number>;
