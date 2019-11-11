import { SendMessage, HostMessageHandlers } from "../internal-interfaces.js";
export declare function prepareMessageListener({ namespace, sendMessage, messageHandlers, }: {
    namespace: string;
    sendMessage: SendMessage;
    messageHandlers: HostMessageHandlers;
}): ({ origin, data: message }: MessageEvent) => Promise<boolean>;
