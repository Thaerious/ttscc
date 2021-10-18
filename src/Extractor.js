import FS from "fs";
import Path from "path";
import Constants from "./include/constants.js";
import IncludeCleaner from "./IncludeCleaner.js";
import AbstractExtractor from "./include/AbstractExtractor.js";
import getFiles from "./include/getFiles.js";
import getFilename from "./include/getFilename.js";

/**
 * Extract LUA scripts from a game file.
 **/
class Extractor {
    constructor() {
        super();
        this.library = {}; // guid -> object state

        // ensure script directory exists even if it's empty
        if (!FS.existsSync(Constants.SCRIPT_DIR)) {
            FS.mkdirSync(Constants.SCRIPT_DIR, { recursive: true });
        }        
    }

    /**
     * Extracts scripts from game file.
     * Creates a project directory (project files) where the object dictionary
     * ,stripped game json, and transcribed script files are stored.
     *
     * All raw script files are placed in the source directory (tts-src) either
     * under the empty objects (tts-src/empty) or the script (tts-src/script)
     * directories.
     *
     * If the script has previously been extracted and exists in the source directory
     * than it is skipped.
     *
     * @param {*} filename save descripted game file here
     * @returns
     */
    extract() {
        // ensure load has been called successfully
        if (!this.json) throw new Error("Game file not set.");

        this.identifyObjects(this.json);
        
        if (!FS.existsSync(Constants.PROJECT_FILES_DIR))
            FS.mkdirSync(Constants.PROJECT_FILES_DIR, { recursive: true });

        if (!FS.existsSync(Constants.SCRIPT_DIR))
            FS.mkdirSync(Constants.SCRIPT_DIR, { recursive: true });

        return this;
    }

    /**
     * Store all object by GUID (guid->object_state).
     * Looks in either ObjectStates or ContainedObjects field to recurse.
     * @param {*} objectState
     * @param {*} srcname set to override nickname extraction
     */
    identifyObjects(objectState) {        
        const name = getFilename(objectState);
        const guid = objectState.GUID ?? -1;
        this.library[guid] = objectState;

        const objectStates = objectState.ObjectStates ?? objectState.ContainedObjects;

        if (objectStates) {
            for (const containedObject of objectStates) {
                this.identifyObjects(containedObject);
            }
        }
    }

    /**
     * Write the script objects to the output directory.
     * Writes all non-empty scripts to Constants.SCRIPT_DIR.
     * Writes all empty scripts to Constants.EMPTY_SCRIPT_DIR.
     *
     */
    async writeOut(projectDirectory) {
        this.dictionary = this.buildDictionary(projectDirectory);
        console.log(this.dictionary);

        /* write out scripts from objects & remove scripts from objects */
        for (const guid in this.library) {
            const objectState = this.library[guid];
            const name = getFilename(objectState) + ".tua";
            const savedScript = objectState.LuaScript ?? "";
            const cleanedScript = await new IncludeCleaner().processString(savedScript);
            this.writeScript(projectDirectory, name, cleanedScript);
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
    writeScript(projectDirectory, name, script) {
        console.log(name);
        if (this.dictionary[name]) return;
        const trimScript = script.trim();

        if (trimScript.length > 0) {
            const outPath = Path.join(projectDirectory, Constants.SCRIPT_DIR);
            if (!FS.existsSync(outPath))
                FS.mkdirSync(outPath, { recursive: true });
            const scriptPath = Path.join(
                projectDirectory,
                Constants.SCRIPT_DIR,
                name
            );
            FS.writeFileSync(scriptPath, trimScript);
        } else {
            const outPath = Path.join(
                projectDirectory,
                Constants.EMPTY_SCRIPT_DIR
            );
            if (!FS.existsSync(outPath))
                FS.mkdirSync(outPath, { recursive: true });
            const scriptPath = Path.join(
                projectDirectory,
                Constants.EMPTY_SCRIPT_DIR,
                name
            );
            FS.closeSync(FS.openSync(scriptPath, "w"));
        }
    }

    /**
     * Search the source directory (tts-src) for script files associated with a
     * an objects GUID.  Place these into a dictionary (guid->filepath).  Preference
     * is given to the script dirctory (tts-src/script) over the empty script dirctory (tts-src/empty).
     *
     * @param {*} fullPath
     * @param {*} dictionary
     * @returns
     */
    buildDictionary(projectDirectory) {
        const path = Path.join(projectDirectory, Constants.SCRIPT_DIR);
        const files = getFiles(path);
        return Object.assign(
            {},
            ...files.map((x) => ({ [x.name]: x.fullpath }))
        );
    }
}

export default Extractor;
