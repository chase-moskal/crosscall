import { CreatePopupOptions } from "./interfaces.js";
export declare function createPopup({ url, target, features, replace, windowOpen }: CreatePopupOptions): {
    postMessage: any;
    popup: Window;
};
