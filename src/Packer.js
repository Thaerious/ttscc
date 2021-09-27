import FS from 'fs';
import Path from 'path';
import Constants from './constants.js';
import TuaTranslator from "tua";

/**
 * Pack scripts into a save game file.
 */
class Packer{
    constructor(){
        // ensure script directory exists even if it's empty
        if (!FS.existsSync(Constants.SCRIPT_DIR)){
            FS.mkdirSync(Constants.SCRIPT_DIR, { recursive: true });
        }
        // create (or empty) the debug packed file directory
        if (FS.existsSync(Constants.PACKED_DIRECTORY)){
            FS.rmSync(Constants.PACKED_DIRECTORY, { recursive: true });
        } 
        FS.mkdirSync(Constants.PACKED_DIRECTORY, { recursive: true });
    }

    /**
     * Retrieve the guid -> filename dictionary from file.
     */
    getDictionary(){
        const fullpath = Path.join(Constants.PROJECT_FILES_DIR, Constants.EXTRACT_DICTIONARY_FILE);
        try{
            const file = FS.readFileSync(fullpath);
            const json = JSON.parse(file);
            return json;
        } catch (err) {
            console.error("Unable to open dictionary: " + fullpath);
            console.error(err);
            process.exit();
        }
    }

    /**
     * Retrive the unscripted game file.
     * @returns 
     */
    getGameFile(){
        const fullpath = Path.join(Constants.STRIPPED_FILE);
        try{
            const file = FS.readFileSync(fullpath);
            const json = JSON.parse(file);
            return json;
        } catch (err){
            console.error("Unable to game file: " + fullpath);
            console.error(err);
            process.exit();
        }
    }

    /**
     * Insert scripts into the main game file.
     * See files in project-files/packed for debugging.
     * @param {*} projectDirectory 
     * @returns 
     */
    inject(projectDirectory, mainFile = Constants.GLOBAL_FILENAME){   
        this.projectDirectory = projectDirectory;
        this.log = [];
        this.dictionary = this.getDictionary();
        this.json = this.getGameFile();
        this.injectObject(this.json, mainFile);

        console.log("objects processed: " + this.log.length);
        return this;
    }

    /**
     * Insert the script from 'scriptFileName' file into 'gameObject'.
     * @param {*} gameObject A json field from the game file.
     * @param {*} scriptFileName Name of the script to insert.
     */
    injectObject(gameObject, scriptFileName){
        const guid = gameObject.GUID;
        const name =  scriptFileName ?? this.dictionary[guid];  
        const path = Path.join(this.projectDirectory, Constants.SCRIPT_DIR, name);

        if (FS.existsSync(path)){
            // get the file from the tts-objects directory.
            let script = FS.readFileSync(path, "utf-8");            
            const tuaTranslator = new TuaTranslator();
            tuaTranslator.addSource(path);
            tuaTranslator.parseClasses();
            gameObject.LuaScript = tuaTranslator.toString();

            // write debug file
            const debugPath = Path.join(this.projectDirectory, Constants.PACKED_DIRECTORY, name);
            FS.writeFileSync(debugPath, gameObject.LuaScript);

            this.log.push(guid);
        }
        else {
            // check in empty directory for file, copy to the tts-objects directory if it exists.
            const emptyPath = Path.join(this.projectDirectory, Constants.EMPTY_SCRIPT_DIR, name);
            const stats = FS.statSync(emptyPath)
            const fileSizeInBytes = stats.size;

            if (FS.existsSync(emptyPath) && fileSizeInBytes > 0){
                console.log("inject " + name + ", " + fileSizeInBytes);
                console.warn(`warning: ${name} found in ${Constants.EMPTY_SCRIPT_DIR} moving to ${Constants.SCRIPT_DIR}`);
                FS.copyFileSync(emptyPath, path);
                this.injectObject(gameObject, scriptFileName);
                return;
            }
        }

        // Write to all contained objects.
        // ObjectStates if global, ContainedObjects if not.
        const objectStates = gameObject.ObjectStates ?? gameObject.ContainedObjects;
        if (objectStates){
            for(const containedObject of objectStates){
                this.injectObject(containedObject);
            }
        }
    }

    write(fileName){
        FS.writeFileSync(fileName, JSON.stringify(this.json, null, 2));
        console.log("reload game in TTS");
    }
}

export default Packer;