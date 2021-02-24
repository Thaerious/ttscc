import Constants from './constants.js';
import FS from 'fs';
import Path from 'path';
import Net from 'net';
import OS from 'os';

/**
 * Searches for #include directives in files.
 */
class IncludeScanner{
    constructor(){
        this.includeMap = {};
        this.scan();
    }

    getMap(){
        return this.includeMap;
    }

    addInclude(filename, guid){
        let scriptName = guid;        
        if (scriptName === "-1") scriptName = Constants.GLOBAL_FILENAME;
        filename = filename.replaceAll("\\", "/");
        if (this.includeMap[filename] == undefined) this.includeMap[filename] = [];
        if (this.includeMap[filename].indexOf(guid) == -1) this.includeMap[filename].push(scriptName);
    }

    clearIncludes(guid){
        for(let includeFN in this.includeMap){
            let index = this.includeMap[includeFN].indexOf(guid);
            if (index === -1) continue;
            this.includeMap[includeFN].splice(index, 1);
        }
    }

    /**
     * Scan files in the script directory for include statements.
     * Include a set of guids to perform a partial scan. 
     * Omit it to scan all GUIDs present in the names.json 
     * file, which is created when a game is downloaded from TTS.
     * @param {Set} guids 
     */
    scan(guids){
        this.included = [];
        if (!guids && !FS.existsSync(Path.join(Constants.DATA_DIR, Constants.NAME_FILE))) return;
        let namesJSON = FS.readFileSync(Path.join(Constants.DATA_DIR, Constants.NAME_FILE));
        let names = JSON.parse(namesJSON);

        if (guids){
            for (let guid of guids){
                this.scanFile(guid, names);
            }
        } else {
            for (let guid in names){
                this.scanFile(guid, names);
            }
        }
    }

    scanFile(guid){
        this.clearIncludes(guid);
        let filename = guid + ".lua";
        if (guid === "-1") filename = Constants.GLOBAL_FILENAME + ".lua";

        let path = Path.join(Constants.SCRIPT_DIR, filename);
        if (!FS.existsSync(path)) return;
        let data = FS.readFileSync(path);
        let script = data.toString('ascii', 0, data.length);
        this.seekInclude(script, guid);
    }

    seekInclude(text, guid){
        let targetText = "";
        let lines = text.split(OS.EOL);   
        
        for (let line of lines){
            if (line.match(/^#include [a-zA-Z0-9./]+[ \t]*/)){
                let filename = line.substring(9).trim();                
                let includedText = this.getIncludeFile(filename);
                this.seekInclude(includedText, guid);    
                this.addInclude(filename, guid);
            } else {
                targetText = targetText + line + OS.EOL;                
            }
        }        
        return targetText;
    }

    getIncludeFile(filename){
        if (this.included.indexOf(filename) !== -1) return "";
        this.included.push(filename);

        let contents = null;
        contents = contents ?? this.getIncludeExt(filename, ".lua");
        contents = contents ?? this.getIncludeExt(filename, ".ttslua");
        contents = contents ?? `---- #include ${filename} file not found`;
        return contents;
    }

    getIncludeExt(filename, ext){
        if (FS.existsSync(Path.join(Constants.INCLUDE_DIR, filename + ext))){
            let data = FS.readFileSync(Path.join(Constants.INCLUDE_DIR, filename + ext));
            let contents = data.toString('ascii', 0, data.length);
            contents = `---> #include ${filename}` 
                     + OS.EOL
                     + contents 
                     + OS.EOL 
                     + `---< #include ${filename}`
                     ;
            return contents;
        } 
        return null;
    }
}

export default IncludeScanner;