import { Api, ApiShape } from "../../interfaces.js";
import { ClientState, RequestFunc } from "../internal-interfaces.js";
export declare function makeCallable<A extends Api<A> = Api>({ state, shape, request, }: {
    shape: ApiShape;
    state: ClientState;
    request: RequestFunc;
}): A;
