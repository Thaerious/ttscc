import FS from 'fs';
import Path from 'path';
import Constants from './constants.js';
import IncludeCleaner from './IncludeCleaner.js';

class Extractor{
    constructor(){
        this.guidLookup = {};
        this.library = {}; // save all scripts here.
    }

    getTTSObject(guid){
        return this.library[guid];
    }

    async extract(){
        try{
            const filename = FS.readFileSync(Constants.SAVE_FILE_NAME);
            const file = FS.readFileSync(filename);
            const json = JSON.parse(file);

            for(const objectState of json.ObjectStates){
                await this.extractFromObject(objectState);
            }
        } catch (err){
            console.log("Error reading saved file name.");
            console.log("Try executing 'get' command or loading a game from TTS.");
        }

        FS.writeFileSync(
            Path.join(Constants.EXTRACT_DIR, Constants.EXTRACT_DICTIONARY_FILE), 
            JSON.stringify(this.guidLookup, null, 2)
        );   

        return this;
    }

    async extractFromObject(objectState){
        let name = objectState.Nickname.trim();
        let guid = objectState.GUID;
        this.library[guid] = objectState;

        if (objectState.ContainedObjects){
            for(const containedObject of objectState.ContainedObjects){
                await this.extractFromObject(containedObject);
            }
        }
    }

    /**
     * Write the script objects to the output directory.
     */
    async writeOut(){
        this.clearDirectory(Constants.EXTRACT_DIR);
        for (const guid in this.library){
            const objectState = this.library[guid];
            let name = objectState.Nickname.trim();
            let dir = Constants.EXTRACT_DIR;

            if (name.length > 0){
                dir = Path.join(Constants.EXTRACT_DIR, name.replaceAll(/[ ]/g, "_"));
                if (!FS.existsSync(dir)) FS.mkdirSync(dir);
            }

            const savedScript = objectState.LuaScript ?? "";
            const script = await new IncludeCleaner().processString(savedScript);
            this.guidLookup[guid] = Path.join(dir, guid + ".lua");
            FS.writeFileSync(this.guidLookup[guid], script);     
        }
    }

    clearDirectory(directory) {
        if (FS.existsSync(directory)) {
            FS.rmdirSync(directory, {recursive: true});
        }
        FS.mkdirSync(directory);
    }

}

export default Extractor;