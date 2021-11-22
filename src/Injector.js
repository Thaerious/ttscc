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
        this.includePaths = [];    // a list of paths to search for include files
        this._fileMap = {};        // a dictionary of filenames to file location
        this._field = "LuaScript"; // the name of the field to inject to
        this._extension = ".tua";
        this.transpile = true;
    }

    set extension(value){
        this._extension = value;
    }

    get extension(){
        return this._extension;
    }

    set field(value){
        this._field = value;
    }    

    get field(){
        return this._field;
    }

    get filemap(){
        return structuredClone(this._fileMap);
    }

    get rootGameObject(){
        return structuredClone(this._rootGameObject);
    }

    clearFilemap(){
        this._fileMap = {}
    }

    /**
     * @param {*} projectDirectory Location of project directories and files.
     * @param {*} sourceDirectory Location of source files within project directory.
     */
    inject(projectDirectory, sourceDirectory = Constants.SCRIPT_DIR){
        this.projectDirectory = projectDirectory;

        // create a filename -> fullpath dictionary of all files in target directory
        const targetDirectory = Path.join(this.projectDirectory, sourceDirectory);
        const files = getFiles(targetDirectory);
        this._fileMap = Object.assign({}, ...files.map(x=>({[x.name] : x.fullpath})));

        const gameFilePath = Path.join(projectDirectory, Constants.STRIPPED_FILE);
        this._rootGameObject = this._rootGameObject ?? loadJSON(gameFilePath);

        this.injectObject(this._rootGameObject);
        return this._rootGameObject;
    }

    addIncludePath(...paths){
        for (const path of paths) this.includePaths.push(path);
    }

    /**
     * If there is a file that matches the object's GUID as determined by getFilename
     * then set the "Luascript" field value to the contents of the file.
     * @param {} objectState The json object found in the game file
     */
    injectObject(objectState){
        const filename = Path.basename(getFilename(objectState, this.extension));

        /* inject script into object */
        if (this._fileMap[filename]){  
            if (this.transpile){          
                const tuaTranslator = new TuaTranslator();
                tuaTranslator.addIncludePath(...this.includePaths);
                tuaTranslator.addSource(this._fileMap[filename]);
                tuaTranslator.parseClasses();
                objectState[this.field] = tuaTranslator.toString();
            } else {
                const fileContents = FS.readFileSync(this._fileMap[filename], "utf-8");
                objectState[this.field] = fileContents;
            }
        }

        const childStates = objectState["ContainedObjects"] ?? objectState["ObjectStates"];

        /* recurse over any contained objects */
        if (childStates){
            for(const childState of childStates){
                this.injectObject(childState);
            }
        }
    }

    writeDebugFiles(projectDirectory = ".", objectState = this._rootGameObject){
        if (objectState[this.field] !== ""){
            const name = getFilename(objectState, this.extension);
            const fullpath = Path.join(projectDirectory, Constants.PACKED_DIRECTORY, name);
            const dir = Path.dirname(fullpath);
            if (!FS.existsSync(dir)) FS.mkdirSync(dir, {recursive : true});     
            FS.writeFileSync(fullpath, objectState[this.field]);
        }

        const childStates = objectState["ContainedObjects"] ?? objectState["ObjectStates"];

        /* recurse over any contained objects */
        if (childStates){
            for(const childState of childStates){
                this.writeDebugFiles(projectDirectory, childState);
            }
        }
    }
}

export default Injector;