import { ReactorTopic } from "./example-host.js";
import { Api, ApiShape } from "../../interfaces.js";
export interface NuclearApi extends Api<NuclearApi> {
    reactor: ReactorTopic;
}
export declare const nuclearShape: ApiShape<NuclearApi>;
