import { HostState, SendMessage, HostMessageHandlers } from "../internal-interfaces.js";
import { Exposure } from "../../interfaces.js";
export declare const prepareMessageHandlers: ({ state, exposures, sendMessage, }: {
    state: HostState;
    sendMessage: SendMessage<import("../internal-interfaces.js").Message>;
    exposures: {
        [key: string]: Exposure<import("../../interfaces.js").Topic<any>>;
    };
}) => HostMessageHandlers;
