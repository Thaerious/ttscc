import FS from 'fs';
import Path from 'path';
import OS from 'os';
import Constants from './constants.js';

/**
 * Replaces include directives with the contents of the 
 * inlucde file.
 */
class Includer{
    constructor(){
        this.included = [];
    }

    replaceInclude(text, guid){        
        let targetText = "";
        let lines = text.split(OS.EOL);
        
        for (let line of lines){
            if (line.match(/^#include [a-zA-Z0-9./]+[ \t]*/)){
                let filename = line.substring(9).trim();                
                let includedText = this.getIncludeFile(filename);
                includedText = this.replaceInclude(includedText, guid);    
                targetText = targetText + includedText;     
            } else {
                targetText = targetText + line + OS.EOL;                
            }
        }        
        return targetText;
    }

    getIncludeFile(filename){
        if (this.included.indexOf(filename) !== -1 && this.options.multiple_includes === false) return "";

        let contents = null;
        contents = contents ?? this.getIncludeExt(filename, ".tua");
        contents = contents ?? this.getIncludeExt(filename, ".lua");
        contents = contents ?? this.getIncludeExt(filename, ".ttslua");

        if (contents !== null){
            this.included.push(filename);
        }

        contents = contents ?? `---x file not found #include ${filename}`;
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

export default Includer;