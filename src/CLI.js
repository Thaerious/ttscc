import Extractor from './Extractor.js';
import ParseArgs from "@thaerious/parseargs"
import Injector from './Injector.js';
import Uploader from './Uploader.js';
import loadJSON from './include/loadJSON.js';
import FS from 'fs';
import constants from './include/constants.js';

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
                "long"    : "include",
                "short"   : "i",
                "desc"    : "specify the include directories in a colon delimted string",
                "default" : "include",
                "boolean" : false
            },                                     
            {
                "long"    : "help",
                "short"   : "h",
                "desc"    : "display this output",
                "boolean" : true
            },        
            // {
            //     "long"    : "download",
            //     "short"   : "d",
            //     "desc"    : "download and extract the game currently loaded in TTS",
            //     "boolean" : true
            // },
            {
                "long"    : "upload",
                "short"   : "u",
                "desc"    : "upload the scripts to the server",
                "boolean" : true
            },   
            {
                "long"    : "debug",
                "short"   : "d",
                "desc"    : "create debug files",
                "boolean" : true,
                "default" : false
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
            // console.log("\t-d --download");
            // console.log("\t  - download and extract the game currently loaded in TTS");
            // console.log("\n");
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
            console.log("Extract " + this.args.flags.game_file + " -> " + this.args.flags.target);
            const ex = new Extractor();
            ex.extract(loadJSON(this.args.flags.game_file));
            ex.writeOut(this.args.flags.target);
        }

        if (this.args.flags.pack || this.args.flags.upload){
            const includes = this.args.flags["include"].split(":");            
            const injector = new Injector();
            injector.addIncludePath(...includes);
            injector.inject(this.args.flags.target);

            injector.clearFilemap();
            injector.field = "XmlUI";
            injector.extension = ".xml";
            injector.transpile = false;
            const gameobject = injector.inject(this.args.flags.target, constants.UI_DIR);
            console.log(injector.filemap);

            if (this.args.flags.pack){
                console.log("PACK " + this.args.flags.target + " -> " + this.args.flags.game_file);
                FS.writeFileSync(this.args.flags.game_file, JSON.stringify(gameobject, null, 2));
            }

            if (this.args.flags.debug){
                injector.writeDebugFiles(this.args.flags.target);
            }

            if (this.args.flags.upload){
                console.log("UPLOAD " + this.args.flags.target);
                const uploader = new Uploader();
                const message = uploader.buildMessage(gameobject);
                uploader.upload(message);
            }              
        }
    }
}

export default CLI;