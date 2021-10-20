import FS from "fs";
import Injector from "./Injector.js";

/**
 * Pack scripts into a save game file.
 */
class Packer extends Injector {
    constructor() {
        super();
    }

    write(fileName) {
        FS.writeFileSync(fileName, JSON.stringify(this.json, null, 2));
        console.log("reload game in TTS");
    }
}

export default Packer;
