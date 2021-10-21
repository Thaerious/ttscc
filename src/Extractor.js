import FS from 'fs';
import Path from 'path';
import Constants from './include/constants.js';
import IncludeCleaner from './IncludeCleaner.js';
import getFilename from './include/getFilename.js';

/**
 * Extract LUA scripts from a game file.
 **/
class Extractor{
    /**
     * Extract scripts from object and all contained objects recursively.
     * Looks in either ObjectStates or ContainedObjects field to recurse.
     * @param {*} objectState
     * @param {*} srcname set to override nickname extraction
     * @returns An object with guid->script pairs.
     */
     extract(objectState){
        this.library = {};
        this.library[objectState.GUID ?? -1] = objectState;
        const objectStates = objectState.ObjectStates ?? objectState.ContainedObjects;

        for(const containedObject of objectStates ?? []){
            this.library = {...this.library, ...this.extract(containedObject)};
        }

        return this.library;
    }

    /**
     * Write the script objects to the output directory.
     * Writes all non-empty scripts to Constants.SCRIPT_DIR.
     * Writes all empty scripts to Constants.EMPTY_SCRIPT_DIR.
     */
    async writeOut(projectDirectory = ".", library = this.library){
        const scriptDir = Path.join(projectDirectory, Constants.SCRIPT_DIR);
        const emptyScriptDir = Path.join(projectDirectory, Constants.EMPTY_SCRIPT_DIR);

        if (!FS.existsSync(scriptDir)) FS.mkdirSync(scriptDir, {recursive : true});
        if (!FS.existsSync(emptyScriptDir)) FS.mkdirSync(emptyScriptDir, {recursive : true});

        /* write out scripts from objects & remove scripts from objects */
        for (const guid in library){
            const objectState = library[guid];
            const name = getFilename(objectState);
            const savedScript = objectState.LuaScript ?? "";
            const cleanedScript = await new IncludeCleaner().processString(savedScript); 
            Extractor.writeScript(projectDirectory, name, cleanedScript.trim());
            objectState.LuaScript = "";
        }

        /* save the main tts json file (without scripts) */
        if (library['-1']) FS.writeFileSync(
            Path.join(Constants.STRIPPED_FILE), 
            JSON.stringify(library['-1'], null, 2)
        );
    }

    /**
     * Write the actual script file to tts-scripts or to tts-empty directory.
     * If the script is empty it get's written to tts-empty.
     * If it's not empty it get's written to tts-scripts.
     * @param {*} projectDirectory project root directory
     * @param {*} name name of the script file to be written
     * @param {*} script contents of the script file to be written
     */
    static writeScript(projectDirectory, name, script){
        const targetDir = script.length > 0 ? Constants.SCRIPT_DIR : Constants.EMPTY_SCRIPT_DIR;
        const outPath = Path.join(projectDirectory, targetDir);

        if (!FS.existsSync(outPath)) FS.mkdirSync(outPath, { recursive: true });
        const scriptPath = Path.join(projectDirectory, targetDir, name);
        FS.writeFileSync(scriptPath, script);
    }   
}

export default Extractor;