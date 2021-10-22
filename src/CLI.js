import Extractor from './Extractor.js';
import Constants from './include/constants.js';
import ParseArgs from "@thaerious/parseargs"
import Packer from './Packer.js';
import Uploader from './Uploader.js';
import loadJSON from './include/loadJSON.js';

const parseArgsProps = {
    flags : [
            {
                "long"    : "pack",
                "short"   : "p",
                "desc"    : "retrieve scripts from directories and insert into a game file",
                "boolean" : true
            },
            {
                "long"    : "extract",
                "short"   : "x",
                "desc"    : "retrieve scripts from game file and put them into the project's directories",
                "boolean" : true
            },                         
            {
                "long"    : "help",
                "short"   : "h",
                "desc"    : "display this output",
                "boolean" : true
            },        
            {
                "long"    : "clean",
                "desc"    : "remove project directories and files",
                "boolean" : true
            },
            {
                "long"    : "download",
                "short"   : "d",
                "desc"    : "download and extract the game currently loaded in TTS",
                "boolean" : true
            },
            {
                "long"    : "upload",
                "short"   : "u",
                "desc"    : "upload the scripts to the server",
                "boolean" : true
            },            
            {
                "long"    : "target",
                "short"   : "t",
                "desc"    : "location of the project directory",
                "boolean" : false,
                "default" : "."
            },
            {
                "long"    : "game_file",
                "short"   : "g",
                "desc"    : "location of the game file",
                "boolean" : false,
                "default" : "a.json"
            }  
        ]
    };

/**
 * Command Line Interface
 * 'CLI.start' is the main entry point for the program as called from 'watch-tts.js'.
 */
class CLI{
    constructor(){
        this.args = new ParseArgs().loadOptions(parseArgsProps).run();
        this.start();
    }

    async start(){
        if (this.args.flags.help){
            console.log("SYNOPSIS");
            console.log("\tttscc [OPTIONS]");
            console.log("\n");
            console.log("DESCRIPTION");
            console.log("\t-x, --extract [source_file]");
            console.log("\t  - retrieve scripts from the source game file and put into project directories");
            console.log("\n");
            console.log("\t-p, --pack");
            console.log("\t  - retrieve scripts from directories and insert into game file");
            console.log("\n");
            console.log("\t-c --clean");
            console.log("\t  - remove project directories from target directory");
            console.log("\n");
            console.log("\t-d --download");
            console.log("\t  - download and extract the game currently loaded in TTS");
            console.log("\n");
            console.log("\t-u --upload");
            console.log("\t  - upload the game to the server");
            console.log("\n");            
            console.log("\t-t, --target");
            console.log("\t  - location of the project directory, default '.'");
            console.log("\n");
            console.log("\t-g, --game_file");
            console.log("\t  - game file output location, default 'a.json'");   
            console.log("\n");     
            console.log("\t-h, --help");
            console.log("\t  - display this output");         
            process.exit();
        }

        if (this.args.flags.extract){
                const projectDirectory = this.args.flags.target;
                const sourceFile = this.args.flags.game_file;
                const ex = new Extractor()
                const json = loadJSON(sourceFile);
                ex.extract(json);
                await ex.writeOut(projectDirectory);
                console.log("extracted object count: " + Object.keys(ex.library).length);            
        }

        if (this.args.flags.pack){
            const projectDirectory = this.args.flags.target;
            const targetFile = this.args.flags.game_file;
            console.log("PACK " + projectDirectory + " -> " + targetFile);
            new Packer().inject(projectDirectory).write(targetFile);
        }

        if (this.args.flags.upload){
            const projectDirectory = this.args.flags.target;
            const targetFile = this.args.flags.game_file;
            console.log("UPLOAD " + projectDirectory + " -> TTS");
            new Uploader().inject(projectDirectory).upload();
        }        

        if (this.args.flags.clean){
            const projectDirectory = this.args.flags.target;
            for (let dir of Constants.CLEAN){
                cleanIf(projectDirectory, dir);
            }
        }
    }
}

export default CLI;