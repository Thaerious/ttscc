import FS from "fs";
import Injecter from "./Injecter.js";

/**
 * Pack scripts into a save game file.
 */
class Packer extends Injecter {
    constructor() {
        super();
    }

    write(fileName) {
        FS.writeFileSync(fileName, JSON.stringify(this.json, null, 2));
        console.log("reload game in TTS");
    }
}

export default Packer;
