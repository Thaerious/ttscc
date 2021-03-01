import FS from 'fs';
import Path from 'path';
import Constants from './constants.js';
import Includer from "./Includer.js";

class Injector{

    inject(){
        this.log = [];
        const filename = FS.readFileSync(Constants.SAVE_FILE_NAME, "utf-8");
        const file = FS.readFileSync(filename);
        const json = JSON.parse(file);

        for(const objectState of json.ObjectStates){
            this.injectObject(objectState, json);
        }

        FS.writeFileSync(filename, JSON.stringify(json, null, 2));
        console.log("objects processed: " + this.log.length);
        console.log("reload game in TTS");
    }

    injectObject(objectState, targetObject){
        const name = objectState.Nickname.trim();
        const guid = objectState.GUID;
        const path = Injector.filepath(guid, name);
        
        console.log(path);
        if (FS.existsSync(path)){            
            let script = FS.readFileSync(path, "utf-8");
            objectState.LuaScript = new Includer().replaceInclude(script, guid);
            this.log.push(guid);
        }

        if (objectState.ContainedObjects){
            for(const containedObject of objectState.ContainedObjects){
                this.injectObject(containedObject, objectState);
            }
        }
    }

    static filepath(guid, name){
        if (name !== undefined){
            return Path.join(Constants.EXTRACT_DIR, name.replaceAll(/[ ]/g, "_"), guid + ".lua");
        }

        const json = FS.readFileSync(
            Path.join(Constants.EXTRACT_DIR, Constants.EXTRACT_DICTIONARY_FILE), 
            JSON.stringify(this.guidLookup, null, 2)
        );

        const dict = JSON.parse(json);
        return dict[guid];
    }
}

export default Injector;