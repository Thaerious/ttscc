import FS, { fstat } from 'fs';
import Uploader from './Uploader.js';
import constants from './Constants.js';
import Path from 'path';

/**
 * Listen for changes in the TTS script directories.
 * Delays the notification in case of multiple updates.
 */
class FileListener{

    /**
     * When one or more valid updates occur callback is invoked with all the
     * root GUIDs.  
     * @param {object} includes a map of includes to GUIDs
     * @param {function} cb callback function invoked on update with the list of script GUIDs that are affected.
     */
    constructor(includeScanner, cb){
        FS.watch(Path.join(constants.INCLUDE_DIR), (eventtype, filename) => this.includeUpdate(eventtype, filename));
        FS.watch(Path.join(constants.SCRIPT_DIR), (eventtype, filename) => this.scriptUpdate(eventtype, filename));

        this.updatedFiles = new Set();
        this.includeScanner = includeScanner;
        this.timeout = null;
        this.cb = cb;

        console.log(this.includeScanner.getMap());
    }

    includeUpdate(eventtype, filename){
        let scriptName = filename.substr(0, filename.indexOf("."));
        let guids = this.includeScanner.getMap()[scriptName];
        if (!guids) return;

        for (let guid of guids){
            this.includeScanner.scan([guid]);  
            this.updatedFiles.add(guid);
        }

        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout((event)=>{
            this.cb(this.updatedFiles);
            this.updatedFiles = new Set();
        }, 500);
    }

    scriptUpdate(eventtype, filename){
        let guid = filename.substr(0, filename.indexOf("."));
        this.includeScanner.scan([guid]);
        this.updatedFiles.add(guid);

        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout((event)=>{
            this.cb(this.updatedFiles);
            this.updatedFiles = new Set();
        }, 500);
    }    
}

export default FileListener;