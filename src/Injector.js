import FS from 'fs';
import Path from 'path';
import Constants from './include/constants.js';

/**
 * Moves scripts from source files into the the game file.
 * Puts the script into the game object using the script filename as GUID.
 * Script #include syntax is replaced by the script file (see TUA project).
 * The scripts will be injected into the stripped game file found in (ttscc-files/game.json).
 */
class Injector{
    inject(projectDirectory, targetFilepath){
        const targetDirectory = Path.dirname(targetFilepath);
        if (!FS.existsSync(targetDirectory)) FS.mkdirSync(targetDirectory, { recursive: true });
    }

    _inject(projectDirectory = "."){
        // const gameFilePath = Path.join(projectDirectory, Constants.SAVE_FILE_NAME);
        // const file = FS.readFileSync(, "utf-8");        
        // const json = JSON.parse(file);

        // for(const objectState of json.ObjectStates) this.injectObject(objectState, json);

        // FS.writeFileSync(filename, JSON.stringify(json, null, 2));
        // console.log("reload game in TTS");
    }

    injectObject(objectState){
        const name = objectState.Nickname.trim();
        const guid = objectState.GUID;
        const path = Injector.filepath(guid, name);
        
        if (FS.existsSync(path)){            
            let script = FS.readFileSync(path, "utf-8");
            objectState.LuaScript = new Includer().replaceInclude(script, guid);
        }

        if (objectState.ContainedObjects){
            for(const containedObject of objectState.ContainedObjects){
                this.injectObject(containedObject, objectState);
            }
        }
    }
}

export default Injector;