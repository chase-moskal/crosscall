import { CreateIframeOptions } from "./interfaces.js";
export declare function createIframe({ url, documentCreateElement, documentBodyAppendChild }: CreateIframeOptions): Promise<{
    postMessage: any;
    iframe: HTMLIFrameElement;
}>;
