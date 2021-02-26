import { DH_CHECK_P_NOT_SAFE_PRIME } from 'constants';
import FS from 'fs';
import Path from 'path';
import Constants from './constants.js';

class Extractor{

    extract(){
        const filename = FS.readFileSync(Constants.SAVE_FILE_NAME);
        const file = FS.readFileSync(filename);
        const json = JSON.parse(file);
        this.clearDirectory(Constants.EXTRACT_DIR);

        for(const objectState of json.ObjectStates){
            console.log(objectState);
            let name = objectState.Name.trim();
            let guid = objectState.GUID;

            let dir = Constants.EXTRACT_DIR;
            if (name.length > 0){
                dir = Path.join(Constants.EXTRACT_DIR, name.replaceAll(/[ ]/g, "_"));
                if (!FS.existsSync(dir)) FS.mkdirSync(dir);
            }

            FS.writeFileSync(Path.join(dir, guid + ".lua"), objectState.LuaScript);
        }
    }

    clearDirectory(directory) {
        if (!FS.existsSync(directory)) {
            FS.mkdirSync(directory);
        }

        let files = FS.readdirSync(directory);
        for (const file of files) {
            FS.unlinkSync(Path.join(directory, file));
        };
    }

}

export default Extractor;