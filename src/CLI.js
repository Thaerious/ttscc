import Readline from 'readline';
import Uploader from "./Uploader.js"
import {TTSListener, get, MessageParser} from "./TTSListener.js";
import FileListener from './FileListener.js';
import IncludeScanner from './IncludeScanner.js';
import ErrorFinder from './ErrorFinder.js';
import IncludeCleaner from './IncludeCleaner.js';
import FS from "fs";
import Extractor from './Extractor.js';
import Packer from './Packer.js';
import Constants from './constants.js';
import Path from 'path';
import {download, listenOnce} from "./TTSInterface.js";
import constants from './constants.js';
import StateExtractor from './StateExtractor.js';

/**
 * Command Line Interface
 * 'CLI.start' is the main entry point for the program as called from 'watch-tts.js'.
 */
class CLI{
    constructor(){
        // this.uploader = new Uploader();
        // this.includeScanner = new IncludeScanner();
        // this.fileListener = new FileListener(this.includeScanner, (guids)=>this.uploader.upload(guids));
        // this.ttsListener = new TTSListener(this.fileListener);
    }

    start(args){
        if (args.length <= 0){
            console.log("SYNOPSIS");
            console.log("\tttscc [OPTIONS]");
            console.log("\n");
            console.log("DESCRIPTION");
            console.log("\textract [source_file] [target_directory]");
            console.log("\t  - retrieve scripts from the source game file and put into project directories");
            console.log("\n");
            console.log("\tpack [game_file_name] [project_directory]");
            console.log("\t  - retrieve scripts from directories and insert into game file");
            console.log("\n");
            console.log("\tclean [target_directory]");
            console.log("\t  - remove project directories from target directory");
            console.log("\n");
            console.log("\tdownload [target_directory]");
            console.log("\t  - download and extract the game currently loaded in TTS");

            process.exit();
        }
        this.command(args);
    }

    listen(){
        this.ttsListener.listen();
        const RL = Readline.createInterface(process.stdin, process.stdout);
        RL.setPrompt('WTTS> ');
        RL.prompt();

        RL.on('line', line => {
            try {
                this.command(line);
            }catch(err){
                console.log("CLI error");
                console.log(err);
                this.uploader.close();
                this.ttsListener.close();
                process.exit(1);
            }
            RL.prompt();
        });

        RL.on('close', function() {
            if (this.uploader) this.uploader.close();
            if (this.ttsListener) this.ttsListener.close();
            process.exit(0);
        });
    }

    async command(args){
        let projectDirectory = ".";
        let targetFile = constants.SAVE_FILE_NAME;

        console.log(args);
        switch (args[0].trim()){
            case "get":
                get();
                break;
            case "put":
                this.uploader.upload();
                break;
            case "load":
                this.uploader.upload();
                break;                
            case "inc":
            case "includes":
                if (args.length == 1){
                    console.log(this.includeScanner.getMap());
                } else {
                    console.log(this.includeScanner.getMap()[args[1]]);
                }
                break;
            case "resume":
                this.fileListener.resume();
                break;            
            case "find":
                // used to test error fuctionality
                let ef = new ErrorFinder();
                let r = await ef.seek(args[1], args[2]);
                console.log(r);
                break;
            case "e":
            case "extract":
                // cli extract [source] [destination]
                // extract scripts from the save file into the project directory
                projectDirectory = args[2] ?? ".";
                const ex = new Extractor()
                await ex.load(args[1]).extract();
                await ex.writeOut(projectDirectory);

                const stExt = new StateExtractor();
                stExt.game = ex.game;
                await stExt.extract();
                await stExt.writeOut(projectDirectory);

                console.log("extracted object count: " + Object.keys(ex.library).length);
                break;
            case "p":
            case "pack":
                // save scripts to the save file
                projectDirectory = args[2] ?? ".";
                targetFile = args[1] ?? "a.json";
                new Packer().inject(projectDirectory).write(targetFile);
                break;
            case "d":
            case "download":
                // save scripts to the save file
                await download();
            break;         
            case "listen":
                console.log(await listenOnce());
            break;       
            case "clean":
                projectDirectory = args[1] ?? ".";
                for (let dir of Constants.CLEAN){
                    cleanIf(projectDirectory, dir);
                }
                break;
            case "exit":
            case "x":
                if (this.ttsListener) this.ttsListener.close();
                process.exit(0);
                break;
        }
    }
}

function cleanIf(root, dir){
    const path = Path.join(root, dir);
    console.log("removing directory: " + path);
    if (FS.existsSync(path)) FS.rmSync(path, { recursive: true });
}

export default CLI;