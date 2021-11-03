import FS from 'fs';
import Path from 'path';
import Constants from './include/constants.js';
import getFilename from './include/getFilename.js';
import loadJSON from './include/loadJSON.js';
import getFiles from './include/getFiles.js';
import TuaTranslator from 'Tua';

/**
 * Moves scripts from source files into the the game file.
 * Puts the script into the game object using the script filename as GUID.
 * Script #include syntax is replaced by the script file (see TUA project).
 * The scripts will be injected into the stripped game file found in (ttscc-files/game.json).
 * 
 * Fails if there is no game file in the project directory.
 */
class Injector{

    constructor(){
        this.includePaths = [];
    }

    /**
     * @param {*} projectDirectory Location of project directories and files.
     * @param {*} targetFilepath Location of game file after inject is complete.
     */
    inject(projectDirectory){
        this.projectDirectory = projectDirectory;
        const files = getFiles(Path.join(this.projectDirectory, Constants.SCRIPT_DIR));
        this.fileMap = Object.assign({}, ...files.map(x=>({[x.name] : x.fullpath})));

        const gameFilePath = Path.join(projectDirectory, Constants.STRIPPED_FILE);
        const gameFile = loadJSON(gameFilePath);

        this.injectObject(gameFile);
        return gameFile;
    }

    addIncludePath(...paths){
        for (const path of paths) this.includePaths.push(path);
    }

    /**
     * If there is a file that matches the object's GUID as determined by getFilename
     * then set the "Luascript" field value to the contents of the file.
     * @param {} objectState 
     */
    injectObject(objectState){
        const filename = Path.basename(getFilename(objectState));
        
        /* inject script into object */
        if (this.fileMap[filename]){
            const tuaTranslator = new TuaTranslator();
            tuaTranslator.addIncludePath(...this.includePaths);
            tuaTranslator.addSource(this.fileMap[filename]);            
            tuaTranslator.parseClasses();
            objectState["LuaScript"] = tuaTranslator.toString();
            this.writeDebugFile(objectState);
        }

        const childStates = objectState["ContainedObjects"] ?? objectState["ObjectStates"];

        /* recurse over any contained objects */
        if (childStates){
            for(const childState of childStates){
                this.injectObject(childState);
            }
        }
    }

    writeDebugFile(objectState){
        if (objectState.LuaScript === "") return;
        const name = objectState.GUID ?? "global";
        const fullpath = Path.join(Constants.PACKED_DIRECTORY, name + ".tua");
        const dir = Path.dirname(fullpath);
        if (!FS.existsSync(dir)) FS.mkdirSync(dir, {recursive : true});
        FS.writeFileSync(fullpath, objectState.LuaScript);
    }
}

export default Injector;