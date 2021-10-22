export default {           
    EXTRACT_DICTIONARY_FILE : "dictionary.json",   // name of guid -> file map, location is PROJECT_FILES_DIR
    SAVE_FILE_NAME : "a.json",                     // default save name for game file
    STRIPPED_FILE : "./ttscc-files/game.json",   // location of the backup game file
    GLOBAL_FILENAME : "global",                    // main entry point filename (w/o ext)

    PROJECT_FILES_DIR : "./ttscc-files",         // location of project management files
    PACKED_DIRECTORY :  "./ttscc-files/packed",  // location of packed script files for debugging
    
    SCRIPT_DIR : "./tts-src/script",               // location of non-empty object-scripts
    EMPTY_SCRIPT_DIR : "./tts-src/empty",          // location of empty object-scripts
    OBJECT_STATE_DIR : "./tts-src/state",          // location of empty object-states
    UI_DIR : "./tts-src/ui",                       // location of ui json    

    SCRIPT_EXTENSION : "tua",                      // appended to filenames returned from getFilename()

    DATA_DIR : "./tts-data",
    SENT_FILE_DIR : "./tts-data/sent",
    RECV_FILE_DIR : "./tts-data/recv",
    NAME_FILE : "names.json",
    LAST_MESSAGE_FILE : "last.json",
    WRITE_PORT : 39999,
    READ_PORT : 39998,
    TTS_URL : "localhost",
    UPDATE_DELAY : 500,
    CLASS_PREFIX : "__",

    // removes these directories in order
    CLEAN : [
        "./ttscc-files"
    ]
};