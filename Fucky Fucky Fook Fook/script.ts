import { Difficulty, MAPDATA, initialize } from "./map/initialize";
import { finalize } from "./map/finalize";
import Note, { notes } from "./objects/note";
import filter from "./functions/filter";
import { vec4 } from "./types/vectors";
import PLUGIN from "./consts/plugin";
import { flickerNotes, osu, yippee } from "./functions";
import Arc, { arcs } from "./objects/arc";

const INPUT = Difficulty.HARD_LAWLESS;  // This is your vanilla/input difficulty.
const OUTPUT = Difficulty.EXPERT_PLUS_LAWLESS;  // This is your modded output difficulty.

const DIFFICULTY = initialize(INPUT, OUTPUT);   // This initializes the map.

const RCOLOR: vec4 = [1, 1/8, 1/8, 1];
const BCOLOR: vec4 = [1/8, 1/8, 1, 1];

// REMOVE THIS FOREACH LOOP IF YOU DO NOT WISH TO USE NOODLE
notes.forEach(note => {
    note.customData = {};
    note.animation = {};
    note.customData.njs = MAPDATA.njs;
    note.customData.offset = MAPDATA.offset;
    switch (note.type) {
        case Note.TYPE.BLUE:
            note.customData.color = BCOLOR;
            break;
        case Note.TYPE.RED:
            note.customData.color = RCOLOR;
            break;
    }
});

// #region MAP SCRIPT

//#region EXPERT PLUS DIFF

if (OUTPUT == Difficulty.EXPERT_PLUS_LAWLESS) {
    yippee(12, 41.9);
    flickerNotes(12, 41.9);

    notes.forEach((note: Note) => {
        note.customData.disableSpawnEffect = false;
    });
    filter(notes, 42, 69).forEach((note: Note) => {
        note.customData.offset = 69;
        note.customData.disableNoteGravity = true;
    });
    filter(arcs, 42, 69).forEach((arc: Arc) => {
        arc.customData.offset = 69;
        arc.customData.disableSpawnEffect = true;
    });
}
//#endregion EXPERT PLUS DIFF

//#region HARD DIFF
else {
    osu(12, 69)
}
//#endregion HARD DIFF


// #endregion MAP SCRIPT

finalize(DIFFICULTY, {
    sortObjects: true,
    formatting: true,
    requirements: [
        PLUGIN.NOODLE_EXTENSIONS,
        PLUGIN.CHROMA
    ]
});