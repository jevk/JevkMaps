import { Difficulty, initialize } from "./map/initialize";
import { finalize } from "./map/finalize";
import filter from "./functions/filter";
import Note, { notes } from "./objects/note";
import { BaseColor } from "./types/colorModifiers";
import ease from "./consts/easing";
import PointDefinition from "./map/pointDefinition";
import random from "./functions/random";
import PLUGIN from "./consts/plugin";
import AnimateTrack from "./events/animateTrack";
import track from "./functions/track";
import { vec1anim, vec3anim } from "./types/vectors";
import { bombs } from "./map/variables";
import { blur, chaosPath, kickWow, particleControl, randomPath, setMaterialOnPPEvent, sideBlocks } from "./functions";
import ApplyPostProcessing from "./events/applyPostProcessing";
import DestroyPrefab from "./events/destroyObject";
import InstantiatePrefab from "./events/instantiatePrefab";
import Environment from "./environment/environment";
import Bomb from "./objects/bomb";
import assets = require("./assetinfo.json");

const INPUT = Difficulty.EXPERT_PLUS_STANDARD;  // This is your vanilla/input difficulty.
const OUTPUT = Difficulty.EXPERT_PLUS_LAWLESS;  // This is your modded output difficulty.

const DIFFICULTY = initialize(INPUT, OUTPUT);   // This initializes the map.

let previousTime = 0;
// #region MAP SCRIPT

new InstantiatePrefab(0, {
    asset: assets.prefabs.karindance,
    position: [0, 0, -2.5]
}).push();
new Environment({
    id: /PlayersPlace$/,
    lookupMethod: "Regex",
    duplicate: 1,
    position: [0, 0, -2.5],
    scale: [0.5, 1, 0.5]
}).push()

// Removes the default environment
new Environment({
    id: /Building|Back|Big|Small|Spectro|Light|Laser|Neon|Track/,
    lookupMethod: "Regex",
    active: false
}).push();

bombs.forEach((b: Bomb) => {
    b.customData.color = [1,1,1,1]; // make the bombs white
})

// Instantiate the background prefab
new InstantiatePrefab(4, {
    asset: assets.prefabs.universesphere,
    id: "background"
}).push();

// Take all the notes and do something for each one of them
notes.forEach((n: Note) => {
    n.customData.disableSpawnEffect = true; // Disables the spawn flash
});

// Function to shorten the syntax of controlling the materialproperty of the background prefab
particleControl({ 
    start: 0, // Start time of the event
    duration: 1, // Duration of the event
    properties: {
        UFPS: [0], // (Use For Particle System)
        B: [1], 
        _Cull: [1],
        _ZWrite: [1],
        _fs: [-2.16],
        _fe: [0],
        _tc: [0, 0, 0, 1],
        _samples: [2], // The amount of samples the shader will generate
        _scale: [1], // Background size control
        _ms: [0],
        _mo: [0.04],
        _sms: [0.243],
        _smo: [1.56],
        _dbs: [0.147],
        _s: [0], // Background dot control
        _lpow: [0], // Background line strength control
        _lt: [0.029],
        _rspeed: [0.01],
        _roffset: [0.28],
        _near: [1.12],
        _far: [8.74],
        _appearfade: [0.1],
        _disappearfade: [0.2],
        _Color: [0.759434, 0.8911725, 1, 1], //  Should be self-explanatory
        _rb: [0.357], // How much variety should the background color have
        _rbo: [0],
        _rbs: [1],
        _v: [1],
        _Src: [1],
        _Dst: [1]
    }
});
particleControl({
    start: 4,
    duration: 8,
    properties: {
        _lpow: [[1, 0], [0, 0.5, ease.Out.Quad]], // Background line strength control
        _s: [[1, 0], [0.01, 1, ease.Out.Quad]] // Background dot control
    }
});

// The glitch effect at the first notes.
new ApplyPostProcessing(4, {
    asset: assets.materials.glitch.path,
    duration: 2,
    easing: ease.Out.Sine,
    properties: [{
        id: "_Juice",
        type: "Float",
        value: [
            [2, 0],
            [0, 1]
        ]
    }]
}).push();

// 
for (let j = 4; j <= 52; j += 16) {
    for (let i = 12; i <= 16; i+=2) new ApplyPostProcessing(i+j, {
        asset: assets.materials.chromaticaberration.path,
        duration: 1,
        easing: ease.Out.Quad,
        properties: [{
            id: "_IntensityX",
            type: "Float",
            value: [
                [0.25, 0],
                [0, 1]
            ]
        }, {
            id: "_IntensityY",
            type: "Float",
            value: [
                [0.04, 0],
                [0, 1]
            ]
        }]
    }).push();
}

const introOffsets = [36, 39, 40, 44, 48, 52, 55, 56, 60]; // Timings for the kicks in the intro of the song.
for (let offset of introOffsets) {
    particleControl({
        start: offset,
        properties: {
            _s: [[1, 0], [0, 1, ease.Out.Quad]] // Background dot control
        }
    });
    new ApplyPostProcessing(offset, {
        asset: assets.materials.offset.path,
        duration: 0.5,
        properties: [{
            id: "_Offset",
            type: "Float",
            value: [
                [0, 0],
                [1, 1]
            ]
        }, {
            id: "_Intensity",
            type: "Float",
            value: [0.1]
        }, {
            id: "_Color",
            type: "Color",
            value: [
                [1, 0, 0, 1, 0],
                [1, 1, 1, 1, 1]
            ]
        }]
    }).push();
}

// Define timing offsets for the background piano loop after the intro of the song.
const PianoLoopTimings: number[] = [0, 8, 12, 14];

for (let i = 68; i <= 131.99; i+=16)
for (let offset of PianoLoopTimings) {
    new ApplyPostProcessing(i + offset, {
        asset: assets.materials.chromaticaberration.path,
        duration: 1, 
        properties: [{
            id: "_IntensityX",
            type: "Float",
            value: [
                [0.5, 0],
                [0, 1]
            ]
        }, 
        {
            id: "_IntensityY",
            type: "Float",
            value: [
                [0.5, 0],
                [0, 1]
            ]
        }]
    }).push();
}

new PointDefinition("disIn", [
    [0, 0],
    [1, 0.4]
]).push();

for (let i = -10; i <= 10; i++) {
    new PointDefinition(`rndPos${i+10}`, [
        [i, random(0, 4), 10, 0],
        [0, 0, 0, 0.475, ease.Out.Circ]
    ]).push();
}

for (let i = -90, j = 0; i <= 90; i += 18, j++) {
    for (let k = 1; k <= 2; k++) {
        new PointDefinition(`rndRot${(j+"")+(k)}`, [
            [random(-45, 45, 0), i, random(-45, 45, 0), 0],
            [0, 0, 0, 0.475, ease.Out.Circ]
        ]).push();
        new PointDefinition(`rndLocRot${(j+"")+(k)}`, [
            [random(-90, 90, 0), i, random(-180, 180, 0), 0],
            [0, 0, 0, 0.475, ease.Out.Circ]
        ]).push();
    }
}

for (let i = 1/16; i <= 1; i += 1/16) {
    new PointDefinition(`disArrTrail${i}`, [
        [Math.abs(i - 1), 0],
        [Math.abs(i - 1), 0.3],
        [0, 0.45]
    ]).push();
    new PointDefinition(`disTrail${i}`, [
        [Math.abs(i - 1) / 2, 0],
        [Math.abs(i - 1) / 2, 0.25],
        [0, 0.45]
    ]).push();
}

track(filter(notes, 68, 134), "pianoEffect");
filter(notes, 0, 131.99).forEach((n: Note) => {
    const d = n.customData;
    const a = n.animation;

    d.offset = 4;
    d.disableNoteGravity = true;
    d.disableNoteLook = true;
    d.disableSpawnEffect = true;
    d.link = `l${n.time},${n.x}${n.y}`;
    
    a.color = [
        [0, 0, 0, 0, 0],
        [`baseNote${n.type}Color` as BaseColor, 0.45, ease.Out.Quad],
    ];
    a.dissolve = "disIn";
    a.dissolveArrow = "disIn";
    a.position = `rndPos${random(0, 20, 0)}`;
    a.rotation = `rndRot${random(0, 10, 0)}${random(1,2,0)}`;
    a.localRotation = `rndLocRot${random(0, 10, 0)}${random(1,2,0)}`;

    for (let i = 1/16; i <= 1; i += 1/16) {
        const dupe = n.duplicate();

        dupe.time += i;

        dupe.customData.fake = true;
        dupe.customData.interactable = false;

        dupe.animation.dissolve = `disTrail${i}`;
        dupe.animation.dissolveArrow = `disArrTrail${i}`;

        dupe.push();
    }
});

new ApplyPostProcessing(100, {
    asset: assets.materials.offset.path,
    duration: 0.5,
    properties: [{
        id: "_Offset",
        type: "Float",
        value: [
            [0, 0],
            [1, 1]
        ]
    }, {
        id: "_Intensity",
        type: "Float",
        value: [0.1]
    }, {
        id: "_Color",
        type: "Color",
        value: [
            [1, 0, 0, 1, 0],
            [1, 1, 1, 1, 1]
        ]
    }]
}).push();

const pianoScaleAnimation: vec3anim = [];
const pianoDissolveAnimation: vec1anim = [];
const pianoLpowAnimation: vec1anim = [];

for (let offset of PianoLoopTimings) {
    pianoScaleAnimation.push(
        [1, 1, 1, offset / 16 - 0.001],
        [1.5, 1.5, 1.5, offset / 16, ease.Step],
        [1, 1, 1, (offset + 1.99) / 16, ease.Out.Expo]
    );
    pianoDissolveAnimation.push(
        [1, offset / 16 - 0.001],
        [0.75, offset / 16, ease.Step],
        [1, (offset + 1.5) / 16, ease.Out.Expo]
    );
    pianoLpowAnimation.push(
        [0, offset / 16 - 0.001],
        [0.25, offset / 16, ease.Step],
        [0, (offset + 1.5) / 16, ease.Out.Quad]
    );
}
for (let i = 68; i <= 131.99; i += 16) particleControl({
    start: i,
    duration: 16,
    properties: {
        _lpow: pianoLpowAnimation,
        _s: pianoLpowAnimation
    }
});

new AnimateTrack(68, {
    track: "pianoEffect",
    duration: 16,
    scale: pianoScaleAnimation,
    dissolve: pianoDissolveAnimation,
    dissolveArrow: pianoDissolveAnimation,
    repeat: 3
}).push();

const buildUp: vec1anim = [];
for (let i = 0; i <= 29; i++) {
    buildUp.push(
        [1, i / 29, ease.Step],
        [0, (i + 0.5) / 29, ease.Out.Quad]
    );
}
particleControl({
    start: 132,
    duration: 29,
    properties: {
        _lpow: buildUp,
        _s: buildUp,
        _rb: [[0, 0], [0.5, 1]], // How much variety should the background color have
        _Color: [[1, 1, 1, 1, 0], [1, 0, 0, 1, 1]] //  Should be self-explanatory
    }
});

new ApplyPostProcessing(160, {
    asset: assets.materials.offset.path,
    duration: 1,
    properties: [{
        id: "_Offset",
        type: "Float",
        value: [
            [0, 0],
            [1, 1]
        ]
    }, {
        id: "_Intensity",
        type: "Float",
        value: [0.5]
    }, {
        id: "_Color",
        type: "Color",
        value: [
            [1, 0, 0, 1, 0],
            [1, 1, 1, 1, 1]
        ]
    }]
}).push();

new ApplyPostProcessing(164, {
    asset: assets.materials.kickwow.path,
    duration: 6,
    properties: [{
        id: "_Intensity",
        type: "Float",
        value: [
            [1, 0],
            [1, 2.5/6, ease.Out.Cubic],
            [0.5, 5/6],
            [0, 1, ease.Out.Cubic]
        ]
    }]
}).push();

particleControl({
    start: 164,
    duration: 8,
    properties: {
        _scale: [[2.5, 0], [1, 1, ease.Step]], // Background size control
        _near: [[1.12, 0], [2, 6/8, ease.In.Expo], [1, 1]],
        _far: [[8.74, 0], [16, 6/8, ease.In.Expo], [8, 1]],
        _lpow: [[0, 0], [1, 0.5/8], [1, 7/8], [0, 1]], // Background line strength control
        _s: [[0, 0], [1, 0.5/8], [1, 7/8], [0.01, 1]], // Background dot control
        _dbs: [[0.147, 0], [2, 7/8], [0.1, 1]],
        _rb: [[0.5, 0], [0.75, 7/8], [0.1, 1]], // How much variety should the background color have
        _rspeed: [[0.01, 0], [0.01, 7/8], [0.7, 1]]
    }
});

for (let i = 171; i <= 191; i++) blur(i);
blur(187.5);
for (let i = 191.5; i <= 192; i+=0.25) blur(i, 0.25);

new ApplyPostProcessing(194, {
    asset: assets.materials.offset.path,
    duration: 0.5,
    properties: [{
        id: "_Offset",
        type: "Float",
        value: [
            [0, 0],
            [1, 1]
        ]
    }, {
        id: "_Intensity",
        type: "Float",
        value: [0.4]
    }, {
        id: "_Color",
        type: "Color",
        value: [
            [1, 0, 0, 1, 0],
            [1, 1, 1, 1, 1]
        ]
    }]
}).push();

for (let i = 196; i <= 219; i++) blur(i);
blur(211);
filter(notes, 220, 223.99).forEach((n: Note) => {
    blur(n.time, 0.25)
});

filter(notes, 228, 229).forEach((n: Note) => {
    if (previousTime != n.time) {
        let duration = 0.5;
        if (n.time == 228.5 || n.time == 228.75) duration = 0.25;
        blur(n.time, duration);
    }
    previousTime = n.time;
});
blur(230, 0.5, {
    radius: [
        [50, 0],
        [0, 1]
    ]
});

chaosPath(172, 227);
setMaterialOnPPEvent(172, 191);

particleControl({
    start: 192,
    duration: 4,
    properties: {
        _lpow: [
            [1, 0],
            [0, 0.25],
            [0.1, 0.5],
            [0, 0.75],
            [1, 1]
        ],
        _s: [
            [1, 0],
            [0, 0.25],
            [0.2, 0.5],
            [0, 0.75],
            [1, 1]
        ],
        _rspeed: [
            [0.7, 0],
            [0, 0.25],
            [0, 0.9],
            [0.7, 1]
        ]
    }
})

setMaterialOnPPEvent(196, 228);

particleControl({
    start: 228,
    properties: {
        _lpow: [
            [1, 0],
            [0, 1/4],
            [1, 2/4, ease.Step],
            [0, 2.99/4],
            [2, 3/4, ease.Step],
            [0, 0.99]
        ],
        _s: [
            [1, 0],
            [0, 1/4],
            [1, 2/4, ease.Step],
            [0, 2.99/4],
            [2, 3/4, ease.Step],
            [0, 0.99]
        ],
        _Color: [[1, 0, 0, 1, 0], [0.75, 0.9, 1, 1, 1]], //  Should be self-explanatory
        _rspeed: [[0.7, 0], [0.01, 1/3, ease.Step]]
    }
});

particleControl({
    start: 231,
    properties: {
        _s: [[0.7, 0], [0.001, 0.99]], // Background dot control
        _lpow: [[0.7, 0], [0, 0.99]], // Background line strength control
    }
});
const halfKick: vec1anim = [[0.5, 0], [0, 1, ease.Out.Quad]];
for (let i = 231; i <= 257.99; i++) kickWow(i);
kickWow(243.5);
filter(notes, 258, 259.99).forEach((n: Note) => {
    kickWow(n.time, 0.25, {_Intensity: halfKick});
});
for (let i = 260; i <= 282; i++) kickWow(i);
kickWow(274.75, 0.25, {_Intensity: halfKick});
kickWow(275.5, 0.25, {_Intensity: halfKick});
kickWow(279.5, 0.25, {_Intensity: halfKick});
kickWow(282.5, 0.25, {_Intensity: halfKick});
kickWow(282.75, 0.25, {_Intensity: halfKick});
for (let i = 283; i <= 287.5; i += 0.5) kickWow(i, 0.33, {_Intensity: halfKick});
for (let i = 288; i <= 291; i += 0.25) kickWow(i, 0.166, {_Intensity: halfKick});

setMaterialOnPPEvent(231, 291, {
    _samples: [1], // The amount of samples the shader will generate
    _far: [[16, 0], [4, 1]]
});

sideBlocks(231, 292)
particleControl({
    start: 292,
    properties: {
        _s: [0.001], // Background dot control
        _rspeed: [0.0001],
        _ms: [0.0001],
        _far: [1],
        _Color: [1, 1, 1, 1] //  Should be self-explanatory
    }
});

new ApplyPostProcessing(292, {
    asset: assets.materials.grayscale.path,
    duration: 64,
    properties: [{
        id: "_Intensity",
        type: "Float",
        value: [
            [0, 0],
            [.9, 1/64, ease.Out.Cubic],
            [.9, 62/64],
            [0, 1, ease.Out.Cubic]
        ]
    }]
}).push();

randomPath(293, 355.99);
// Define timings for the background control of the lo-fi kicks
const Kicks: number[] = [324, 327.5, 328, 329, 332, 335.666, 336, 337, 338.5, 340, 343.5, 344, 345, 348, 351.5, 352];
for (let i of Kicks) {
    particleControl({
        start: i,
        duration: 0.5,
        properties: {
            _s: [[1, 0], [0, 0.99]] // Background dot control
        }
    });
}
for (let i = 294; i <= 350; i+=4) {
    particleControl({
        start: i,
        duration: 1,
        properties: {
            _lpow: [[1, 0], [0, 0.99]], // Background line strength control
        }
    });
}

particleControl({
    start: 353,
    duration: 3,
    properties: {
        _far: [[8, 1, ease.Step]],
        _near: [[2, 1, ease.Step]],
        _samples: [[1, 0], [2, 1, ease.Step]], // The amount of samples the shader will generate
        _scale: [[1, 0], [2, 1, ease.Step]], // Background size control
        _lpow: [[0.001, 0], [0, 0.66]], // Background line strength control
        _s: [[0.01, 0], [0, 0.66]] // Background dot control
    }
});

filter(notes, 356, 370).forEach((n: Note) => {
    if (previousTime != n.time) {
        particleControl({
            start: n.time,
            duration: (n.time >= 363 && n.time <= 364) ? 0.25 : 0.5,
            properties: {
                _lpow: [[0.5, 0], [0, 1]], // Background line strength control
                _s: [[0.5, 0], [0, 1]] // Background dot control
            }
        });
    }
    previousTime = n.time;
});

particleControl({
    start: 372,
    duration: 7.99,
    properties: {
        _scale: [
            [1, 0],
            [4, 1]
        ],
        _lpow: [[0, 0], [1, 1]], // Background line strength control
        _s: [[0, 0], [1, 1]], // Background dot control
        _Color: [
            [0.75, 0.9, 1, 1, 1],
            [1, 0, 0, 1, 0]
        ]
    }
});

particleControl({
    start: 380,
    duration: 4.999,
    properties: {
        _Color: [
            [1, 0, 0, 1, 0],
            [1, 0.8, 0.8, 1, 1/5],
            [1, 0, 0, 1, 2/5, ease.In.Expo],
            [1, 0.8, 0.8, 1, 3/5],
            [1, 0, 0, 1, 4/5, ease.In.Expo],
            [1, 0.8, 0.8, 1, 1]
        ]
    }
});

for (let i = 380; i <= 382; i += 2) kickWow(i, 1, {_Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]]});
kickWow(384, 1, {_Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]]});

for (let i = 385; i <= 387; i++) new ApplyPostProcessing(i, {
    asset: assets.materials.offset.path,
    duration: .5,
    properties: [{
        id: "_Offset",
        type: "Float",
        value: [
            [0, 0],
            [1, 1]
        ]
    }, {
        id: "_Intensity",
        type: "Float",
        value: [0.2]
    }, {
        id: "_Color",
        type: "Color",
        value: [
            [1, 0, 0, 1, 0],
            [1, 1, 1, 1, 1]
        ]
    }]
}).push()

filter(notes, 388, 393).forEach((n: Note) => {
    if (previousTime < n.time) blur(n.time, 0.5, {
        radius: [
            [60, 0],
            [0, 1]
        ]
    });
    previousTime = n.time;
});

filter(notes, 396, 407.5).forEach((n: Note) => {
    if (previousTime < n.time) {
        if (n.time == 403) {
            blur(n.time, 1, {
                radius: [
                    [100, 0],
                    [0, 1]
                ]
            });
        } else kickWow(n.time);
    }
});

filter(notes, 408, 411).forEach((n: Note) => {
    n.customData.offset += 1;
    n.animation.position = [
        [8 * (n.type ? -1 : 1), 0, 0, 0],
        [0, 0, 0, 0.5, ease.Out.Expo],
    ]
});
let alreadyPlaced = [];
filter(notes, 412, 420).forEach((n: Note) => {
    if (previousTime == n.time && !alreadyPlaced.includes(n.time)) {
        kickWow(n.time, 0.25);
        alreadyPlaced.push(n.time);
    }
    if (n.time >= 418) {
        blur(n.time, 0.25);
    }
    previousTime = n.time;
});

for (let i = 420; i <= 424; i+=4) new ApplyPostProcessing(i, {
    asset: assets.materials.chromaticaberration.path,
    duration: 2,
    properties: [{
        id: "_IntensityX",
        type: "Float",
        value: [
            [1, 0],
            [0, 1, ease.Out.Quint]
        ]
    }, {
        id: "_IntensityY",
        type: "Float",
        value: [0.01]
    }]
}).push();

for (let i = 385; i <= 387; i++) particleControl({
    start: i, 
    duration: 1,
    properties: {
        _lpow: [[1, 0], [0, 1]], // Background line strength control
        _s: [[1, 0], [0, 1]], // Background dot control
        _Color: [
            [1, 0, 0, 1, 0],
            [1, 0.8, 0.8, 1, 1]
        ]
    }
})


filter(notes, 388, 393).forEach((n: Note) => {
    if (n.time - previousTime > 0.125) {
        particleControl({
            start: n.time,
            duration: 0.5,
            properties: {
                _lpow: [[1.5, 0], [0, 1]], // Background line strength control
                _s: [[1.5, 0], [0, 1]], // Background dot control
                _Color: [
                    [1, 0, 0, 1, 0],
                    [1, 0.8, 0.8, 1, 1]
                ]
            }
        });
    }

    previousTime = n.time;
});

filter(notes, 396, 407.5).forEach((n: Note) => {
    n.animation.dissolve = [0.1];
});;

particleControl({
    start: 394,
    duration: 2,
    properties: {
        _lpow: [[1.5, 0], [0, 1]], // Background line strength control
        _s: [[1.5, 0], [0, 1]], // Background dot control
        _scale: [[2, 0], [1, 1, ease.Step]] // Background size control
    }
});

particleControl({
    start: 414,
    duration: 6,
    properties: {
        _samples: [3], // The amount of samples the shader will generate
        _scale: [2], // Background size control
        _rb: [[1, 0], [0, 1]], // How much variety should the background color have
        _near: [
            [2, 0],
            [8, 5/6, ease.In.Expo],
            [1, 1]
        ],
        _far: [
            [8, 0],
            [16, 5/6, ease.In.Expo],
            [4, 1]
        ],
        _lpow: [[0, 0], [1, 5/6], [0, 0.95]], // Background line strength control
        _s: [[0, 0], [1, 5/6], [0, 1]], // Background dot control
        _Color: [
            [1, 0, 0, 1, 0],
            [1, 0.8, 0.8, 0, 1]
        ]
    }
});

randomPath(420, 427.99);

track(filter(notes, 428, 443.5), "hardKicks");
filter(notes, 428, 441.5).forEach((n: Note) => {
    if (previousTime < n.time) {
        new AnimateTrack(n.time, {
            track: "hardKicks",
            duration: n.time != 440.75 ? 0.5 : 0.25,
            scale: [
                [1.5, 1.5, 1.5, 0],
                [1, 1, 1, 1, ease.Out.Quad]
            ],
            dissolve: [
                [0.6, 0],
                [1, 1]
            ]
        }).push();
        particleControl({
            start: n.time,
            duration: n.time != 440.75 ? 0.5 : 0.25,
            properties: {
                _Color: [
                    [2, 0, 0, 1, 0],
                    [0, 0, 0, 0, 0.99]
                ],
                _s: [[2, 0], [0.01, 0.99]], // Background dot control
            }
        })
        blur(n.time, 0.5, {
            radius: [
                [100, 0],
                [0, 1]
            ],
            resolution: [700]
        });
    }
    previousTime = n.time;
});

new ApplyPostProcessing(444, {
    asset: assets.materials.pixelate.path,
    duration: 1,
    properties: [{
        id: "_Pixels",
        type: "Float",
        value: [
            [2000, 0],
            [100, .75, ease.Out.Cubic],
            [2000, 1, ease.Out.Expo]
        ]
    }]
}).push();

new ApplyPostProcessing(445, {
    asset: assets.materials.buildup.path,
    duration: 11,
    properties: [
        {
            id: "_Intensity",
            type: "Float",
            value: [
                [
                    0,
                    0
                ],
                [
                    0.3,
                    0.454
                ],
                [
                    0.25,
                    0.636,
                    "easeStep"
                ],
                [
                    0.2,
                    0.681,
                    "easeStep"
                ],
                [
                    0.15,
                    0.704,
                    "easeStep"
                ],
                [
                    0.1,
                    0.727,
                    "easeStep"
                ],
                [
                    0.05,
                    0.818,
                    "easeStep"
                ],
                [
                    0,
                    0.909,
                    "easeStep"
                ]
            ]
        }
    ]
}).push()

particleControl({
    start: 445,
    duration: 11,
    properties: {
        _near: [[1, 0], [8, 5/11, ease.In.Expo], [8, 7/11], [1, 0.99]],
        _far: [[4, 0], [16, 5/11, ease.In.Expo], [16, 7/11], [1, 0.99]],
        _s: [[0, 0], [2, 4.99/11, ease.In.Expo], [0, 5/11, ease.Step], [2, 7/11, ease.Step], [0, 0.99]], // Background dot control
        _lpow: [[0, 0], [2, 4.99/11, ease.In.Expo], [0, 5/11, ease.Step], [2, 7/11, ease.Step], [0, 0.99]], // Background line strength control
        _Color: [
            [0, 0, 0, 0, 0],
            [1, 0, 1, 1, 4.99/11],
            [0, 0, 0, 0, 5/11, ease.Step],
            [1, 0, 0, 1, 7/11, ease.Step],
            [0, 0, 0, 0, 0.99, ease.Out.Quad]
        ],
        _rb: [[0, 0], [1, 4.99/11, ease.In.Expo], [0, 5/11, ease.Step], [1, 7/11, ease.Step], [0, 0.99]], // How much variety should the background color have
    }
});

new PointDefinition("distKickScale", [
    [1.5, 1.5, 1.5, 0],
    [1, 1, 1, 1]
]).push()
new PointDefinition("distKickDis", [
    [0.5, 0],
    [1, 1]
]).push()
track(filter(notes, 459, 490), "distortedKicks");
filter(notes, 459, 474.99).forEach((n: Note) => {
    if (previousTime < n.time) {
        kickWow(n.time, 0.125);
        new AnimateTrack(n.time, {
            track: "distortedKicks",
            duration: 0.5,
            easing: ease.Out.Cubic,
            scale: "distKickScale",
            dissolve: "distKickDis"
        }).push();
    }
});
blur(475, 0.5, {
    radius: [
        [100, 0],
        [0, 1]
    ]
});
filter(notes, 476, 487.99).forEach((n: Note) => {
    if (previousTime < n.time) {
        kickWow(n.time, 0.125);
        new AnimateTrack(n.time, {
            track: "distortedKicks",
            duration: 0.5,
            easing: ease.Out.Cubic,
            scale: "distKickScale",
            dissolve: "distKickDis"
        }).push();
    }
});

blur(488, 4, {
    radius: [
        [100, 0],
        [0, 1, ease.Out.Cubic]
    ],
    resolution: [700]
});



filter(notes, 508, 513.5).forEach((n: Note) => {
    if (n.time == previousTime) new ApplyPostProcessing(n.time, {
        asset: assets.materials.kickwow.path,
        duration: 0.5,
        properties: [
            {
                id: "_Intensity",
                type: "Float",
                value: [
                    [1, 0],
                    [0, 1, ease.Out.Quad]
                ]
            }, {
                id: "_Color",
                type: "Color",
                value: [
                    [1, 0, 0, 1, 0],
                    [1, 1, 1, 1, 1]
                ]
            }
        ]
    }).push();
    previousTime = n.time;
});
for (let i = 514; i <= 515.99; i+=1/4) {
    new ApplyPostProcessing(i, {
        asset: assets.materials.kickwow.path,
        duration: 0.25,
        properties: [
            {
                id: "_Intensity",
                type: "Float",
                value: [
                    [1, 0],
                    [0, 1, ease.Out.Quad]
                ]
            }, {
                id: "_Color",
                type: "Color",
                value: [
                    [1, 0, 0, 1, 0],
                    [1, 1, 1, 1, 1]
                ]
            }
        ]
    }).push();
}

new ApplyPostProcessing(516, {
    asset: assets.materials.chromaticaberration.path,
    duration: 8, 
    properties: [
        {
            id: "_IntensityX",
            type: "Float",
            value: [
                [1.5, 0],
                [0, 1]
            ]
        }
    ]
}).push();

for (let i = 492; i <= 493.99; i+=0.5) kickWow(i, 0.5);

filter(notes, 494, 515.99).forEach((n: Note) => {
    if (previousTime == n.time && !alreadyPlaced.includes(n.time)) {
        alreadyPlaced.push(n.time);
        if (n.time < 508) {
            blur(n.time, 0.25, {
                radius: [
                    [60, 0],
                    [0, 1]
                ]
            });
        }
        if (n.time == 508) new ApplyPostProcessing(508, {
            asset: assets.materials.wtfisgoingon.path,
            duration: 1,
            properties: [{
                id: "_Intensity",
                type: "Float",
                value: [
                    [8, 0],
                    [0, 1]
                ]
            }, {
                id: "_Lerp",
                type: "Float",
                value: [
                    [1.1, 0],
                    [0, 1]
                ]
            }, {
                id: "_Closing",
                type: "Float",
                value: [[1, 0], [0, 1]]
            }]
        }).push();
    }
    previousTime = n.time
});

particleControl({
    start: 494,
    properties: {
        _rspeed: [0.7],
        _Color: [
            [1, 0, 0, 1, 0],
            [1, 0.2, 0.2, 1, 1]
        ]
    }
})
chaosPath(494, 515.99);
randomPath(516, 523.99);

for(let i = 524; i <= 540; i += 8) kickWow(i, 1, {
    _Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]],
    _Intensity: [[1, 0], [0, 1]]
});

blur(548, 1, {
    radius: [
        [0, 0],
        [5000, 1, ease.In.Expo],
    ], resolution: [500]
})

for (let i = 556; i <= 587; i++) particleControl({
    start: i,
    properties: {
        _Color: [
            [1, 0, 0, 1, 0],
            [1, 0.5, 0.5, 0, 0.99]
        ],
        _s: [[1, 0], [0.1, 0.99]], // Background dot control
        _lpow: [0] // Background line strength control
    }
});

filter(notes, 556, 619).forEach((n: Note) => {
    {
        const d = n.customData;

        d.disableNoteLook = true;
        d.disableSpawnEffect = true;
        d.link = `l${n.time},${n.x}${n.y}`;;
    }

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (j == 0 && i == 0) continue;
            const dupe = n.duplicate();
            const d = dupe.customData;

            dupe.time += 0.01;

            d.disableNoteGravity = true;
            d.fake = true;
            d.interactable = false;
            d.track = ["array"];
            if (i != 0) d.track.push(`array${i > 0 ? "R" : "L"}`);
            if (j != 0) d.track.push(`array${j > 0 ? "U" : "D"}`);

            dupe.push();
        }
    }
});
for (let i = -1; i <= 1; i++) {
    if (i == 0) continue;
    new AnimateTrack(552, {
        track: `array${i > 0 ? "R" : "L"}`,
        duration: 0,
        offsetPosition: [0, 0, 0]
    }).push();
    new AnimateTrack(556, {
        track: `array${i > 0 ? "R" : "L"}`,
        duration: 1,
        easing: ease.Out.Cubic,
        offsetPosition: [
            [0, 0, 0, 0],
            [6 * i, 0, 0, 1]
        ]
    }).push()
}
for (let i = -1; i <= 1; i++) {
    if (i == 0) continue;
    new AnimateTrack(552, {
        track: `array${i > 0 ? "U" : "D"}`,
        duration: 0,
        offsetPosition: [0, 0, 0]
    }).push();
    new AnimateTrack(556, {
        track: `array${i > 0 ? "U" : "D"}`,
        duration: 1,
        easing: ease.Out.Cubic,
        offsetPosition: [
            [0, 0, 0, 0],
            [0, 5 * i, 0, 1]
        ]
    }).push()
}
new AnimateTrack(552, {
    track: "array",
    duration: 0,
    dissolve: [0],
    dissolveArrow: [0]
}).push();
new AnimateTrack(556, {
    track: "array",
    duration: 1,
    easing: ease.Out.Cubic,
    dissolve: [
        [0, 0],
        [1, 0.5]
    ],
    dissolveArrow: [
        [0, 0],
        [1, 0.5]
    ]
}).push();

for (let i = 556; i <= 579; i++) kickWow(i, 0.5, {
    _Intensity: [
        [1, 0],
        [0, 1, ease.Out.Circ]
    ]
});
kickWow(571.5, 0.5, {
    _Intensity: [
        [1, 0],
        [0, 1, ease.Out.Circ]
    ]
});
filter(notes, 580, 587).forEach((n: Note) => {
    if (previousTime == n.time) {
        kickWow(n.time, 0.5, {
            _Intensity: [
                [0.5, 0],
                [0, 1, ease.Out.Circ]
            ]
        });
    }
    previousTime = n.time;
});
for (let i = 588; i <= 603; i++) kickWow(i, 1, {
    _Intensity: [
        [1, 0],
        [0, 1, ease.Out.Expo]
    ],
    _Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]]
});
kickWow(588.5, 0.5, {
    _Intensity: [
        [1, 0],
        [0, 1, ease.Out.Circ]
    ],
    _Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]]
});
for (let i = 604; i <= 610; i += 2) kickWow(i, 2, {
    _Intensity: [
        [1, 0],
        [0, 1, ease.Out.Expo]
    ],
    _Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]]
});
filter(notes, 612, 619).forEach((n: Note) => {
    if (previousTime < n.time) {
        kickWow(n.time, 0.25, {
            _Intensity: [
                [1, 0],
                [0, 1, ease.Out.Quad]
            ],
            _Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]]
        });
    }
    previousTime = n.time;
});

new ApplyPostProcessing(620, {
    asset: assets.materials.grayscale.path,
    duration: 33,
    properties: [{
        id: "_Intensity",
        type: "Float",
        value: [
            [0, 0],
            [1, 32/33],
            [0, 1]
        ]
    }]
}).push();

randomPath(623, 652)
particleControl({
    start: 588,
    properties: {
        _Color: [
            [2, 0, 0, 1, 0],
            [1, 0.5, 0.5, 1, 1]
        ],
        _s: [[1, 0], [0.1, 1]], // Background dot control
        _lpow: [[1, 0], [0.2, 1]], // Background line strength control
        _scale: [
            [0.1, 0],
            [2, 1]
        ]
    }
});

filter(notes, 589, 619).forEach((n: Note) => {
    if (n.time - previousTime > 0.125) particleControl({
        start: n.time,
        properties: {
            _Color: [
                [2, 0, 0, 1, 0],
                [1, 0.5, 0.5, 1, 1]
            ],
            _s: [[1, 0], [0.2, 1]], // Background dot control
            _lpow: [[1, 0], [0.1, 1]] // Background line strength control
        }
    });
    previousTime = n.time;
}); 

particleControl({
    start: 620,
    duration: 4,
    properties: {
        _Color: [
            [1, 0, 0, 1, 0],
            [1, 0.8, 0.8, 1, 0.99]
        ],
        _s: [[2, 0], [0.01, 0.99]], // Background dot control
        _lpow: [[2, 0], [0, 0.99]], // Background line strength control
        _rspeed: [0],
        _scale: [[2, 0], [1, 0.99, ease.Out.Quad]] // Background size control
    }
});

new ApplyPostProcessing(652, {
    asset: assets.materials.grayscale.path,
    duration: 8,
    properties: [
        {
            id: "_Juice",
            type: "Float",
            value: [
                [4, 0],
                [0, 1, ease.Out.Circ]
            ]
        }
    ]
}).push();
particleControl({
    start: 652,
    duration: 8,
    properties: {
        _lpow: [[1, 0], [0, 0.99]], // Background line strength control
        _s: [[1, 0], [0, 0.99]], // Background dot control
        _Color: [
            [1, 0, 0, 1, 0],
            [0, 0, 0, 0, 0.99]
        ]
    }
});
new DestroyPrefab(660, {
    id: "universe"
}).push();


// #endregion MAP SCRIPT



finalize(DIFFICULTY, {
    requirements: [
        PLUGIN.CHROMA,
        PLUGIN.NOODLE_EXTENSIONS,
        PLUGIN.VIVIFY
    ],
    sortObjects: true,
    formatting: true,
    colorLeft: {
        r: 1,
        g: .128,
        b: .128
    },
    colorRight: {
        r: .128,
        g: .128,
        b: 1
    },
    settings: {
        chroma: {
            disableChromaEvents: false,
            disableEnvironmentEnhancements: false,
            disableNoteColoring: false
        },
        colors: {
            overrideDefaultColors: true
        },
        environments: {
            overrideEnvironments: false
        },
        graphics: {
            mainEffectGraphicsSettings: 1,
            maxShockwaveParticles: 0,
            mirrorGraphicsSettings: 0,
            screenDisplacementEffectsEnabled: true
        },
        playerOptions: {
            reduceDebris: true
        }
    }
});