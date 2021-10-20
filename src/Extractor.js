import FS from 'fs';
import Path from 'path';
import Constants from './include/constants.js';
import IncludeCleaner from './IncludeCleaner.js';

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
     static extract(objectState){
        let library = {};
        library[objectState.GUID ?? -1] = objectState;
        const objectStates = objectState.ObjectStates ?? objectState.ContainedObjects;

        for(const containedObject of objectStates ?? []){
            library = {...library, ...Extractor.extract(containedObject)};
        }

        return library;
    }

    /**
     * Write the script objects to the output directory.
     * Writes all non-empty scripts to Constants.SCRIPT_DIR.
     * Writes all empty scripts to Constants.EMPTY_SCRIPT_DIR.
     */
    async static writeOut(projectDirectory, library){
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
        if (!FS.existsSync(Constants.SCRIPT_DIR)) FS.mkdirSync(Constants.SCRIPT_DIR, {recursive : true});
        if (!FS.existsSync(Constants.EMPTY_SCRIPT_DIR)) FS.mkdirSync(Constants.EMPTY_SCRIPT_DIR, {recursive : true});

        const targetDir = script.length > 0 ? Constants.SCRIPT_DIR : Constants.EMPTY_SCRIPT_DIR;
        const outPath = Path.join(projectDirectory, targetDir);

        if (!FS.existsSync(outPath)) FS.mkdirSync(outPath, { recursive: true });
        const scriptPath = Path.join(projectDirectory, targetDir, name);
        FS.writeFileSync(scriptPath, script);
    }   
}

export default Extractor;