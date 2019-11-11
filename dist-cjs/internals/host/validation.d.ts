import { ListenerData } from "../internal-interfaces.js";
import { Exposure, EventMediator } from "../../interfaces.js";
export declare function enforcePermissions({ origin, exposure }: {
    origin: string;
    exposure: Exposure;
}): boolean;
export declare function getExposure({ topic, exposures }: {
    topic: string;
    exposures: {
        [key: string]: Exposure;
    };
}): Exposure<import("../../interfaces.js").Topic<any>>;
export declare function getMethodExecutor({ func, params, exposure }: {
    func: string;
    params: any[];
    exposure: Exposure;
}): () => any;
export declare function getEventMediator({ eventName, exposure }: {
    eventName: string;
    exposure: Exposure;
}): EventMediator<import("../../interfaces.js").Listener<any>>;
export declare function getListenerData({ listenerId, listeners }: {
    origin: string;
    listenerId: number;
    listeners: Map<number, ListenerData>;
}): ListenerData;
