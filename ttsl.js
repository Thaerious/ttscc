import { setServers } from 'dns';
import Net from 'net';
import FS from 'fs';
import Path from 'path';
import Constants from './Constants.js';
import IncludeCleaner from './IncludeCleaner.js';
import OS from 'os';

class WatchTTS {

    constructor() {
        /** wait for TTS to request a connection */
        this.server = new Net.Server();        
    }

    listen(){
        this.server.listen(Constants.READ_PORT);
        console.log("awaiting connection");
        this.server.on("connection", (socket) => {
            console.log("Server connection initiated");
            this.setupReadSocket(socket);
        });
    }

    listenOnce(){
        this.server.listen(Constants.READ_PORT);
        console.log("awaiting connection");
        this.server.on("connection", (socket) => {
            console.log("Server connection initiated");
            this.setupReadSocket(socket);
            this.server.close();
        });
    }

    close(){
        if (this.readSocket) this.readSocket.close();
        if (this.writeSocket) this.writeSocket.close();
    }

    setupWriteSocket() {
        this.writeSocket = new Net.Socket();
        this.writeSocket.connect(Constants.WRITE_PORT);
        this.writeSocket.on("connect", () => this.sendHandshake());
    }

    setupReadSocket(socket) {
        this.readSocket = socket;
        this.messageParser = new MessageParser();
        socket.setEncoding("utf8");
        
        let amalgametedData = "";
        socket.on("data", (data) =>{
            amalgametedData = amalgametedData + data;
        });

        socket.on("close", () =>{
            this.messageParser.parse(JSON.parse(amalgametedData));
        });        
    }

    sendHandshake() {
        let msg = { messageID: 0 };
        this.write(JSON.stringify(msg));
    }

    write(data) {
        this.writeSocket.write(data);
    }
}

/**
 * Read all incoming messages and perform the appropriate action.
 * See: https://api.tabletopsimulator.com/externaleditorapi/
 */
class MessageParser {

    /**
     * Main entry point for incoming messages.
     * @param {object} message 
     */
    parse(message) {
        switch (message.messageID) {
            case 1: // game loaded
                this.gameLoaded(message);
                break;
            case 2: // print message
                break;
            case 3: // error message
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

    /**
     * Parse the message field "scriptStates" to determine object contents. Create a file 
     * in /tts-script for each TTS object that has a script.  Create a file in /tts-ui for
     * each TTS object that has ui.
     * @param {object} message 
     */
    async gameLoaded(message) {
        console.log("Game loaded from: " + message.savePath);
        this.clearDirectory(Constants.SCRIPT_DIR);
        this.clearDirectory(Constants.UI_DIR);
        let names = {};
        
        for (let element of message.scriptStates) {
            let filename = element.guid;
            if (element.guid === "-1") filename = Constants.GLOBAL_FILENAME;

            if (element.script){
                let cleanText = await new IncludeCleaner().processString(element.script);
                FS.writeFileSync(Path.join(Constants.SCRIPT_DIR, filename + ".lua"), cleanText);
            } 
            if (element.ui){
                 FS.writeFileSync(Path.join(Constants.UI_DIR, filename + ".xml"), element.ui);
            }

            names[element.guid] = `${element.name}`;
        };

        if (!FS.existsSync(Constants.DATA_DIR)) {
            FS.mkdirSync(Constants.DATA_DIR);
        }
        FS.writeFileSync(Path.join(Constants.DATA_DIR, Constants.NAME_FILE), JSON.stringify(names));
        console.log("write names");
        console.log(names);
    }

    /**
     * If the directory exists, empty it, otherwise create it.
     * @param {string} dir 
     */
    clearDirectory(directory) {
        if (!FS.existsSync(directory)) {
            FS.mkdirSync(directory);
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
        if (err.code === 'ECONNREFUSED') console.log("Connection to TTS refused");
        else console.log(err);
    });

    socket.on("connect", () => {            
        socket.write(message);
    });
}

export {WatchTTS, get};
