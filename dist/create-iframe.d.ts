import { CreateIframeOptions } from "./types.js";
export declare class CreateIframeError extends Error {
    readonly name: string;
}
export declare function createIframe({ url, documentCreateElement, documentBodyAppendChild }: CreateIframeOptions): Promise<{
    postMessage: (message: any, targetOrigin: string, transfer?: Transferable[]) => void;
    iframe: HTMLIFrameElement;
}>;
