import { Api, Client, ClientOptions } from "./interfaces.js";
export declare function crosscallClient<A extends Api<A>>({ shape, namespace, hostOrigin, postMessage, shims: moreShims, }: ClientOptions<A>): Client<A>;
