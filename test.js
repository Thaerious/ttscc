import IncludeCleaner from './IncludeCleaner.js';

let ic = new IncludeCleaner();
// ic.readFile("./tts-data/sent/global.lua")
ic.readString(
    "hello world\n" +
    "---> #include dummy\n" + 
    "this line excluded" +
    "---< #include dummy\n"

    );