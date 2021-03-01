#!/usr/bin/env node
import FS from 'fs';
import CLI from './CLI.js';
import Constants from './constants.js';

if (process.argv.length >= 3){
    if (process.argv[2] === "clean"){
        FS.rmdirSync(Constants.SCRIPT_DIR, { recursive: true });
        FS.rmdirSync(Constants.UI_DIR, { recursive: true });
        FS.rmdirSync(Constants.DATA_DIR, { recursive: true });
        FS.rmdirSync(Constants.EXTRACT_DIR, { recursive: true });
        process.exit(0);
    }
}

new CLI().start();