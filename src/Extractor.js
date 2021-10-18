import FS from 'fs';
import Path from 'path';
import Constants from './include/constants.js';
import IncludeCleaner from './IncludeCleaner.js';

/**
 * Extract LUA scripts from a game file.
 **/
class Extractor{
    constructor(){
        this.guidLookup = {}; // guid -> filename
        this.library    = {}; // guid -> object state
    }

    /**
     * Extracts scripts from game file.
     * @param {*} filename save descripted game file here
     * @returns 
     */
    async extract(){        
        if (!this.json) throw new Error("Game file not set.");

        await this.extractFromObject(this.json, Constants.GLOBAL_FILENAME);

        if (!FS.existsSync(Constants.PROJECT_FILES_DIR)) FS.mkdirSync(Constants.PROJECT_FILES_DIR, {recursive : true});
        if (!FS.existsSync(Constants.SCRIPT_DIR)) FS.mkdirSync(Constants.SCRIPT_DIR, {recursive : true});

        FS.writeFileSync(
            Path.join(Constants.PROJECT_FILES_DIR, Constants.EXTRACT_DICTIONARY_FILE), 
            JSON.stringify(this.guidLookup, null, 2)
        );

        return this;
    }

    /**
     * Extract scripts from object and all contained objects.
     * Looks in either ObjectStates or ContainedObjects field to recurse.
     * @param {*} objectState 
     * @param {*} srcname set to override nickname extraction
     */
    async extractFromObject(objectState, srcname){
        const name = srcname ?? this.getFilename(objectState);
        const guid = objectState.GUID;
        this.guidLookup[guid] = name;
        this.library[guid] = objectState;

        const objectStates = objectState.ObjectStates ?? objectState.ContainedObjects;

        if (objectStates){
            for(const containedObject of objectStates){
                await this.extractFromObject(containedObject);
            }
        }
    }

    /**
     * Determine an objects filename from it's nickname & guid.
     * @param {*} objectState 
     * @returns 
     */
    getFilename(objectState){
        let rawName = objectState.Nickname.trim();
        let parsedName = rawName.replaceAll(/[ ]/g, "_");
        return `${parsedName}.${objectState.GUID}.tua`;
    }

    /**
     * Write the script objects to the output directory.
     * Writes all non-empty scripts to Constants.SCRIPT_DIR.
     * Writes all empty scripts to Constants.EMPTY_SCRIPT_DIR.
     * 
     */
    async writeOut(projectDirectory){
        /* write out scripts from objects & remove scripts from objects */
        for (const guid in this.library){
            const objectState = this.library[guid];
            const name = this.guidLookup[guid];
            const savedScript = objectState.LuaScript ?? "";
            const cleanedScript = await new IncludeCleaner().processString(savedScript); 
            this.writeScript(projectDirectory, name, cleanedScript);
            objectState.LuaScript = "";
        }

        /* save the tts json file (without scripts) */
        FS.writeFileSync(
            Path.join(Constants.STRIPPED_FILE), 
            JSON.stringify(this.json, null, 2)
        );
    }

    /**
     * Write the actual script file to tts-scripts or to tts-empty directory.
     * @param {*} projectDirectory 
     * @param {*} name 
     * @param {*} script 
     */
    writeScript(projectDirectory, name, script){
        const trimScript = script.trim();

        if (trimScript.length > 0){
            const outPath = Path.join(projectDirectory, Constants.SCRIPT_DIR);
            if (!FS.existsSync(outPath)) FS.mkdirSync(outPath, { recursive: true });
            const scriptPath = Path.join(projectDirectory, Constants.SCRIPT_DIR, name);
            FS.writeFileSync(scriptPath, trimScript);
        } else {
            const outPath = Path.join(projectDirectory, Constants.EMPTY_SCRIPT_DIR);
            if (!FS.existsSync(outPath)) FS.mkdirSync(outPath, { recursive: true });
            const scriptPath = Path.join(projectDirectory, Constants.EMPTY_SCRIPT_DIR, name);
            FS.closeSync(FS.openSync(scriptPath, 'w'))
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