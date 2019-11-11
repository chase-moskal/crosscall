export declare class CrosscallApiError extends Error {
    readonly name: string;
    constructor(message: string);
}
export declare function err(message: string): CrosscallApiError;
