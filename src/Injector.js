import FS from 'fs';
import Path from 'path';
import { stringify } from 'querystring';
import Constants from './constants.js';

class Injector{

    inject(){
        const filename = FS.readFileSync(Constants.SAVE_FILE_NAME, "utf-8");
        const file = FS.readFileSync(filename);
        const json = JSON.parse(file);

        for(const objectState of json.ObjectStates){
            const name = objectState.Name.trim();
            const guid = objectState.GUID;

            let dir = Constants.EXTRACT_DIR;
            if (name.length > 0){
                dir = Path.join(Constants.EXTRACT_DIR, name.replaceAll(/[ ]/g, "_"));                
            }

            const path = Path.join(dir, guid + ".lua");
            if (FS.existsSync(path)){
                objectState.LuaScript = FS.readFileSync(path, "utf-8");
            }
        }

        FS.writeFileSync(filename, JSON.stringify(json, null, 2));
    }

}

export default Injector;