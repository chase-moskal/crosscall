import { Api, Host, HostOptions } from "./interfaces.js";
export declare function crosscallHost<A extends Api<A> = Api>({ namespace, exposures, shims: moreShims, }: HostOptions<A>): Host;
