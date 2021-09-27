import FS from 'fs';
import Path from 'path';
import Constants from './constants.js';
import IncludeCleaner from './IncludeCleaner.js';
import AbstractExtractor from './include/AbstractExtractor.js';

/**
 * Extract script state from game file and save them as json files.
 * Only files with a state are created.
 * All state information is (temporarily) removed from the game file.
 **/
class StateExtractor extends AbstractExtractor{
    constructor(){
        super();
        this.guidLookup = {}; // guid -> filename
        this.library    = {}; // guid -> object state
    }

    /**
     * Extracts scipts from game file.
     * @param {*} filename save descripted game file here
     * @returns 
     */
    async extract(filename = Constants.SAVE_FILE_NAME){        
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
     * Extract script states from object and all contained objects.
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
        return `${parsedName}.${objectState.GUID}.json`;
    }

    /**
     * Write the script objects to the output directory.
     * Writes all non-empty scripts to Constants.SCRIPT_DIR.
     * Writes all empty scripts to Constants.EMPTY_SCRIPT_DIR.
     */
    async writeOut(projectDirectory){
        const outPath = Path.join(projectDirectory, Constants.OBJECT_STATE_DIR);
        if (!FS.existsSync(outPath)) FS.mkdirSync(outPath, { recursive: true })

        /* write out scripts from objects & remove scripts from objects */
        for (const guid in this.library){
            const objectState = this.library[guid];
            const name = this.guidLookup[guid];
            const savedScript = objectState.LuaScriptState ?? "";
            this.writeScript(projectDirectory, name, savedScript);
            objectState.LuaScriptState = "";
        }

        /* save the tts json file (without scripts) */
        FS.writeFileSync(
            Path.join(Constants.STRIPPED_FILE), 
            JSON.stringify(this.json, null, 2)
        );
    }

    /**
     * Write the actual script state file if it's not empty.
     * @param {*} projectDirectory 
     * @param {*} name 
     * @param {*} script 
     */
    writeScript(projectDirectory, name, script){
        const trimScript = script.trim();

        if (trimScript.length > 0){
            const jsonObject = JSON.parse(trimScript);
            const jsonString = JSON.stringify(jsonObject, null, 2);

            const scriptPath = Path.join(projectDirectory, Constants.OBJECT_STATE_DIR, name);
            FS.writeFileSync(scriptPath, jsonString);
        }
    }
}

export default StateExtractor;