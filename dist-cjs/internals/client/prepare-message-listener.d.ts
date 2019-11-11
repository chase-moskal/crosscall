import { ClientMessageHandlers } from "../internal-interfaces.js";
export declare function prepareMessageListener({ namespace, hostOrigin, messageHandlers, }: {
    namespace: string;
    hostOrigin: string;
    messageHandlers: ClientMessageHandlers;
}): ({ origin, data: message }: MessageEvent) => Promise<boolean>;
