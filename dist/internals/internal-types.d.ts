import { Exposure } from "../types.js";
import { ListenerOrganizer } from "./client/listener-organizer.js";
export interface HandleMessageParams<gMessage extends Message = Message> {
    message: gMessage;
    origin: string;
}
export interface HostMessageHandlers {
    [key: string]: (params: HandleMessageParams) => Promise<void>;
}
export interface ListenerData {
    exposure: Exposure;
    cleanup: () => void;
}
export declare type RequestFunc<M extends Message = Message, R extends ResponseMessage = ResponseMessage> = (message: M) => Promise<R>;
export interface ClientMessageHandlers {
    [key: string]: (message: Message) => Promise<void>;
}
export interface Message {
    id?: Id;
    signal: Signal;
    namespace?: string;
}
export declare type Id = number;
export interface Associated {
    associate: Id;
}
export declare const enum Signal {
    Error = 0,
    Wakeup = 1,
    CallRequest = 2,
    CallResponse = 3,
    Event = 4,
    EventListenRequest = 5,
    EventListenResponse = 6,
    EventUnlistenRequest = 7,
    EventUnlistenResponse = 8
}
export interface ResponseMessage extends Message, Associated {
}
export interface ErrorMessage extends Message, Partial<Associated> {
    signal: Signal.Error;
    error: string;
}
export interface CallRequest extends Message {
    signal: Signal.CallRequest;
    topic: string;
    func: string;
    params: any[];
}
export interface EventListenRequest extends Message {
    signal: Signal.EventListenRequest;
    topic: string;
    eventName: string;
}
export interface EventListenResponse extends ResponseMessage {
    signal: Signal.EventListenResponse;
    listenerId: number;
}
export interface EventUnlistenRequest extends Message {
    signal: Signal.EventUnlistenRequest;
    listenerId: number;
}
export interface EventUnlistenResponse extends ResponseMessage {
    signal: Signal.EventUnlistenResponse;
}
export interface EventMessage extends Message {
    signal: Signal.Event;
    listenerId: number;
    eventPayload: any;
}
export interface PendingRequest {
    resolve: any;
    reject: any;
}
export interface CallResponse<R = any> extends ResponseMessage {
    signal: Signal.CallResponse;
    result: R;
}
export interface SendMessage<M extends Message = Message> {
    (o: {
        origin: string;
        message: M;
    }): Promise<Id>;
}
export interface HostState {
    messageId: number;
    listenerId: number;
    listeners: Map<number, ListenerData>;
}
export interface ClientState {
    isReady: boolean;
    messageId: number;
    iframe: HTMLIFrameElement;
    requests: Map<Id, PendingRequest>;
    listenerOrganizer: ListenerOrganizer;
}
