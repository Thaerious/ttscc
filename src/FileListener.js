import Uploader from './Uploader.js';
import constants from './Constants.js';
import Path from 'path';
import chokidar from 'chokidar';

/**
 * Listen for changes in the TTS script directories.
 * Delays the notification in case of multiple updates.
 */
class FileListener {

    /**
     * When one or more valid updates occur callback is invoked with all the
     * root GUIDs.  
     * @param {object} includes a map of includes to GUIDs
     * @param {function} cb callback function invoked on update with the list of script GUIDs that are affected.
     */
    constructor(includeScanner, cb) {
        this.updatedFiles = new Set();
        this.includeScanner = includeScanner;
        this.timeout = null;
        this.cb = cb;
        this.start();
    }

    skipNextUpdate(){
        this.skip = true;
    }

    start() {
        this.includeWatcher = chokidar.watch(constants.INCLUDE_DIR, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true
        });

        this.scriptWatcher = chokidar.watch(constants.SCRIPT_DIR, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true
        });

        this.includeWatcher.on('change', path => this.includeUpdate(path));
        this.scriptWatcher.on('change', path => this.scriptUpdate(path));
    }

    includeUpdate(filename) {        
        let scriptName = filename.substring(constants.INCLUDE_DIR.length - 1, filename.indexOf("."));
        let guids = this.includeScanner.getMap()[scriptName];
        if (!guids) return;

        for (let guid of guids) {
            this.includeScanner.scan([guid]);
            this.updatedFiles.add(guid);
        }
        this.setTimer();
    }

    scriptUpdate(filename) {
        let guid = filename.substring(constants.SCRIPT_DIR.length - 1, filename.indexOf("."));
        this.includeScanner.scan([guid]);
        this.updatedFiles.add(guid);
        this.setTimer();
    }
    
    setTimer(){
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout((event) => {
            if (this.skip){
                this.skip = false;
            } else {
                console.log(this.updatedFiles);
                this.cb(this.updatedFiles);                
            }
            this.updatedFiles = new Set();
        }, constants.UPDATE_DELAY);
    }
}

export default FileListener;