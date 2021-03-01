import Net from 'net';
import FS from 'fs';
import Path from 'path';
import Constants from './Constants.js';
import IncludeCleaner from './IncludeCleaner.js';
import ErrorFinder from './ErrorFinder.js';

/**
 * WatchTTS listens to the TTS port for messages and interprets them accordingly.
 */
class TTSListener {

    /**
     * 
     * @param {*} filelistener The filelistener will be paused when accepting incoming files.
     */
    constructor(filelistener) {
        if (!filelistener) throw new Error(`NULL parameter: filelistener`);
        this.filelistener = filelistener;
        this.messageParser = new MessageParser(this.filelistener);

        /** wait for TTS to request a connection */
        this.server = new Net.Server();        
    }

    close(){
        if (this.server) this.server.close();
    }

    listen(){
        this.server.listen(Constants.READ_PORT);
        this.server.on("connection", (socket) => {
            this.setupReadSocket(socket);
        });
    }

    listenOnce(){
        this.server.listen(Constants.READ_PORT);
        this.server.on("connection", (socket) => {
            this.setupReadSocket(socket);
            this.server.close();
        });
    }

    setupReadSocket(socket) {
        this.readSocket = socket;        
        socket.setEncoding("utf8");

        let amalgametedData = "";
        socket.on("data", (data) =>{
            amalgametedData = amalgametedData + data;
        });

        socket.on("close", () =>{
            this.messageParser.parse(JSON.parse(amalgametedData));
        });
    }
}

/**
 * Read all incoming messages and perform the appropriate action.
 * See: https://api.tabletopsimulator.com/externaleditorapi/
 */
class MessageParser {

    constructor(filelistener){
        if (!filelistener) throw new Error(`NULL parameter: filelistener`);
        this.filelistener = filelistener;

        if (!FS.existsSync(Constants.DATA_DIR)) FS.mkdirSync(Constants.DATA_DIR);

        if (FS.existsSync(Path.join(Constants.DATA_DIR, Constants.NAME_FILE))){
            let json = FS.readFileSync(Path.join(Constants.DATA_DIR, Constants.NAME_FILE));
            this.names = JSON.parse(json);
        } else {
            this.names = {};
        }

        this.msgQueue = [];
        this.processing = false;
    }

    parse(message){
        this.msgQueue.push(message);
        if (!this.processing) this.process();
    }

    /**
     * Main entry point for incoming messages.
     * @param {object} message
     */
    async process() {
        this.processing = true;
        while(this.msgQueue.length > 0){
            let message = this.msgQueue.shift();

            switch (message.messageID) {
                case 0: // new object push
                    await this.filelistener.skipNextUpdate();
                    await this.pushObjects(message);
                    this.lastError = null;
                    break;
                case 1: // game loaded
                    await this.filelistener.skipNextUpdate();
                    await this.gameLoaded(message);
                    this.lastError = null;
                    break;
                case 2: // print message
                    console.log("SERVER> " + message.message);
                    this.lastError = null;
                    break;
                case 3: // error message     
                    if (message.error !== this.lastError){
                        let ef = new ErrorFinder();
                        await ef.find(message);                
                        ef.report();
                        this.lastError = message.error;
                    }      
                    break;
                case 4: // custom message (ignored)
                    break;
                case 5: // return message (ignored)
                    break;
                case 6: // game saved
                    break;
                case 7: // object created
                    break;
            }
        }
        this.processing = false;
    }

    /**
     * Add a new object script/ui to the project.
     * @param {*} message
     */
    async pushObjects(message){
        console.log("Object push received: ");

        for (let element of message.scriptStates) await this.processGameElement(element);
        this.updateNameFile();
    }

    /**
     * Parse the message field "scriptStates" to determine object contents. Create a file
     * in /tts-script for each TTS object that has a script.  Create a file in /tts-ui for
     * each TTS object that has ui.
     * @param {object} message
     */
    async gameLoaded(message) {
        console.log("Game Loaded: " + message.savePath);
        this.clearDirectory(Constants.SCRIPT_DIR);
        this.clearDirectory(Constants.UI_DIR);
        this.clearDirectory(Constants.RECV_FILE_DIR);

        FS.writeFileSync(Constants.SAVE_FILE_NAME, message.savePath);

        for (let element of message.scriptStates){
            await this.processGameElement(element);            
        } 
        this.updateNameFile();
    }

    /**
     * Process a single element of the 'scriptStates' field as sent by the server.
     * Creates a new script file or ui file if the fields exist.
     * The is effectivly where the script get's transfered from the server.
     * @param {*} element
     */
    async processGameElement(element){
        let filename = element.guid;
        if (element.guid === "-1") filename = Constants.GLOBAL_FILENAME;

        if (element.script !== undefined){
            FS.writeFileSync(Path.join(Constants.RECV_FILE_DIR, filename + ".lua"), element.script);
            let cleanText = await new IncludeCleaner().processString(element.script);
            FS.writeFileSync(Path.join(Constants.SCRIPT_DIR, filename + ".lua"), cleanText);
        }
        if (element.ui !== undefined){
             FS.writeFileSync(Path.join(Constants.UI_DIR, filename + ".xml"), element.ui);
        }

        this.names[element.guid] = `${element.name}`;
    }

    updateNameFile(){
        let json = JSON.stringify(this.names);
        FS.writeFileSync(Path.join(Constants.DATA_DIR, Constants.NAME_FILE), JSON.stringify(this.names, null, 2));
    }

    /**
     * If the directory exists, empty it, otherwise create it.
     * @param {string} dir
     */
    clearDirectory(directory) {
        if (!FS.existsSync(directory)) {
            FS.mkdirSync(directory, {recursive : true});
        }

        let files = FS.readdirSync(directory);
        for (const file of files) {
            FS.unlinkSync(Path.join(directory, file));
        };
    }
}

/**
 * Send a get request to the server.
 */
function get(){
    let socket = new Net.Socket();
    socket.connect(Constants.WRITE_PORT);
    let message = '{"messageID" : "0"}'

    socket.on("error", (err)=>{
        console.log(err);
    });

    socket.on("connect", () => {
        socket.write(message);
    });
}

export {TTSListener, get, MessageParser};
