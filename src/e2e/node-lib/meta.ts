import { Furi } from "furi";
import { pathToFileURL } from "url";

export const dirname: Furi = new Furi(pathToFileURL(__dirname).toString());

// tslint:disable-next-line:no-default-export
export default {dirname};
