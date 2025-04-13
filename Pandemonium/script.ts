import { PLUGIN } from "hecklib/util/enums";
import { log, LogLevel } from "hecklib/util/logs";
import { Vec1Animation, Vec3Animation, Vec4Animation } from "hecklib/util/vec";
import { Difficulty, Environment } from "hecklib/v3";
import { AnimateTrack, AssignPathAnimation, Blit, DestroyObject, InstantiatePrefab, SetMaterialProperty } from "hecklib/v3/events/customEvents";
import assets from "./bundleinfo.json";
import { IMaterialPropertyData } from "hecklib/v3/events/customEvents/properties/IProperty";
import { Ease } from "hecklib/util/easings";
import { Random } from "hecklib/util/functions"
import { Note } from "hecklib/v3/objects";

const START = performance.now();

const DIFFICULTIES = [
    { input: Difficulty.STANDARD.Expert, output: Difficulty.LAWLESS.Expert, njs: 18, offset: 0 },
    { input: Difficulty.STANDARD.ExpertPlus, output: Difficulty.LAWLESS.ExpertPlus, njs: 19, offset: -0.25 },
];

for (let currentDiff of DIFFICULTIES) {

const Diff = new Difficulty(
    currentDiff.input,
    currentDiff.output,
    {
        NoLogo: true,
        Logs: LogLevel.Warning
    }
);

Diff.DifficultyInfo.CustomData.Requirements = [
    PLUGIN.NoodleExtensions,
    PLUGIN.Chroma,
    PLUGIN.Vivify
];

Diff.DifficultyInfo.CustomData.Settings = {
    Chroma: {
        DisableChromaEvents: false,
        DisableEnvironmentEnhancements: false,
        DisableNoteColoring: false
    },
    Colors: {
        OverrideDefaultColors: true
    },
    Environments: {
        OverrideEnvironments: false
    },
    Graphics: {
        Bloom: 1,
        MaxShockwaveParticles: 0,
        Mirror: 0,
        ScreenDisplacementEffectsEnabled: true
    },
    PlayerOptions: {
        ReduceDebris: true
    }
};

Diff.DifficultyInfo.CustomData.ColorLeft = {
    r: 1,
    g: .128,
    b: .128
};
Diff.DifficultyInfo.CustomData.ColorRight = {
    r: .128,
    g: .128,
    b: 1
};

const { ColorNotes: notes, BombNotes: bombs, Obstacles: walls, Sliders: arcs, BurstSliders: chains, BasicBeatmapEvents: events } = Diff.Map;
const { FakeColorNotes: fakeNotes, FakeBombNotes: fakeBombs, FakeObstacles: fakeWalls, FakeSliders: fakeArcs, FakeBurstSliders: fakeChains, CustomEvents: customEvents, PointDefinitions: pointDefinitions, Materials: materials, Environment: environment } = Diff.Map.CustomData;

//#region       =============== Functions Below  ===============


interface IParticleControl {
    Start: number;
    Duration?: number;
    Properties?: IParticleProperties
}
interface IParticleProperties {
    UFPS?: Vec1Animation;
    B?: Vec1Animation;
    _Cull?: Vec1Animation;
    _ZWrite?: Vec1Animation;
    _fs?: Vec1Animation;
    _fe?:  Vec1Animation;
    _tc?: Vec4Animation;
    _samples?: Vec1Animation;
    _scale?: Vec1Animation;
    _ms?: Vec1Animation;
    _mo?: Vec1Animation;
    _sms?: Vec1Animation;
    _smo?: Vec1Animation;
    _dbs?: Vec1Animation;
    _s?: Vec1Animation;
    _lpow?: Vec1Animation;
    _lt?: Vec1Animation;
    _rspeed?: Vec1Animation;
    _rOffset?: Vec1Animation;
    _near?: Vec1Animation;
    _far?: Vec1Animation;
    _appearfade?: Vec1Animation;
    _disappearfade?: Vec1Animation;
    _Color?: Vec4Animation;
    _rb?: Vec1Animation;
    _rbo?: Vec1Animation;
    _rbs?: Vec1Animation;
    _v?: Vec1Animation;
    _Src?: Vec1Animation;
    _Dst?: Vec1Animation;
}

function particleControl(p: IParticleControl|number): void {
    if (typeof p == "number") p = { Start: p };
    if (!p.Duration) p.Duration = 1;

    let mat = new SetMaterialProperty(p.Start, {
        Asset: assets.materials.universemesh.path,
        Duration: p.Duration,
        Properties: []
    });

    if (p.Properties != null) {
        for (let key in p.Properties) {
            let tempProp: IMaterialPropertyData = {
                ID: key,
                Type: ["_Color", "_tc"].includes(key) ? "Color" : "Float",
                Value: p.Properties[key]
            };
            
            (mat.Properties as IMaterialPropertyData[]).push(tempProp);
        }
    }

    customEvents.push(mat);
}

function setMaterialOnPPEvent(start: number, end: number, properties: IParticleProperties = {
        _lpow : [
            [1, 0],
            [0, 1]
        ],
        _s : [
            [1, 0],
            [0.01, 1]
        ],
        _Color : [
            [1, 0, 0, 1, 0],
            [1, 0.7, 0.7, 0.25, 1]
        ]
    }): void {
    events.forEach((e: any) => {
        if (e.type == "Blit" && e.time >= start && e.time <= end && e.data.duration != null && typeof e.data.duration == "number") {
            particleControl({
                Start: e.time,
                Duration: e.data.duration,
                Properties: properties
            });
        }
    });
}

pointDefinitions?.set("chaosDis", [
    [0, 0],
    [0.5, 0.0625],
    [1, 0.125, Ease.OutCirc]
]);
for (let i = -2, j = -2; i <= 2; i++, j *= -1) {
    pointDefinitions?.set(`chaosPos${i+2}`, [
        [i, Random(-1, 2), j, 0],
        [-i, Random(-1, 2), -j, 0.125, Ease.InCubic, "splineCatmullRom"],
        [0, 0, 0, 0.25, Ease.OutCubic, "splineCatmullRom"]
    ]);
}
for (let i = 0; i <= 30; i ++) {
    pointDefinitions?.set(`chaosRot${i}`, [
        [Random(-180, 180), Random(-180, 180), Random(-180, 180), 0],
        [Random(-180, 180), Random(-180, 180), Random(-180, 180), 0.0625, Ease.InCubic],
        [Random(-180, 180), Random(-180, 180), Random(-180, 180), 0.125, Ease.InCubic],
        [Random(-180, 180), Random(-180, 180), Random(-180, 180), 0.1875, Ease.InCubic],
        [0, 0, 0, 0.25, Ease.OutBack]
    ]);
}
for (let i = 0; i <= 7; i++) {
    pointDefinitions?.set(`chaosScale${i}`, [
        [Random(0.5, 3), Random(0.5, 3), Random(0.5, 3), 0],
        [1, 1, 1, 0.25, Ease.OutBack]
    ]);
}

function chaosPath(start: number, end: number) {
    notes.select({
        StartBeat: start,
        EndBeat: end,
    }).forEach(n => {
        const d = n.CustomData;
        const a = n.Animation;

        d.DisableNoteGravity = true;
        d.DisableNoteLook = true;
        d.SpawnEffect = false;
        d.Offset = 1;

        a.Dissolve = "chaosDis"
        a.Scale = `chaosScale${Random(0, 7, 0)}`;
        a.OffsetPosition = `chaosPos${Random(0, 4, 0)}`;
        a.LocalRotation = `chaosRot${Random(0, 30, 0)}`;
    });
}

for (let i = -2, j = 1; i <= 2; i++, j *= -1)
    pointDefinitions?.set(`spinPos${i+2}`, [
        [-15 * j, i * 2, 0, 0],
        [0, 0, 0, 0.475, Ease.OutCirc]
    ]);

function randomPath(start: number, end: number) {
    notes.select({
        StartBeat: start,
        EndBeat: end
    }).forEach(n => {
        const d = n.CustomData;
        const a = n.Animation;

        d.Offset = 3;
        d.DisableNoteGravity = true;
        d.DisableNoteLook = true;
        d.SpawnEffect = false;
        
        a.OffsetPosition = `spinPos${Random(0, 4, 0)}`;
        a.Dissolve = "disIn";
        a.DissolveArrow = "disIn";
    });
}

function blur(time: number, duration: number = 0.5, properties: {
    radius: Vec1Animation,
    resolution?: Vec1Animation,
    hstep?: Vec1Animation,
    vstep?: Vec1Animation,
} = {
    radius: [
        [15, 0],
        [0, 1]
    ]
}) {
    if (!properties.hstep) properties.hstep = [.3];
    if (!properties.vstep) properties.vstep = [.3];
    if (!properties.resolution) properties.resolution = [200];

    const pp = new Blit(time, {
        Asset: assets.materials.blur.path,
        Duration: duration,
        Properties: []
    });

    Object.keys(properties).forEach((key) => {
        (pp.Properties as IMaterialPropertyData[]).push({
            ID: key,
            Type: "Float",
            Value: properties[key]
        });
    });

    customEvents.push(pp);
}

function kickWow(time: number, duration: number = 0.5, properties: {
    _Intensity?: Vec1Animation,
    _Color?: Vec4Animation,
} = {
    _Intensity: [
        [1, 0],
        [0, 1, Ease.OutQuad]
    ]
}) {
    if (properties._Intensity == null || typeof properties._Intensity === "undefined") properties._Intensity = [
        [1, 0],
        [0, 1, Ease.OutQuad]
    ];

    const pp = new Blit(time, {
        Asset: assets.materials.kickwow.path,
        Duration: duration,
        Properties: []
    });

    Object.keys(properties).forEach((key) => {
        (pp.Properties as IMaterialPropertyData[]).push({
            ID: key,
            Type: key == "_Intensity" ? "Float" : "Color",
            Value: properties[key]
        });
    });

    customEvents.push(pp);
}

function sideBlocks(start: number, end: number, moveInterval = 1) {
    customEvents.push(
        new AnimateTrack(start-4, {
            Track: "side",
            Duration: 5,
            Dissolve: [
                [0, 0],
                [0, 3/5],
                [1, 4/5, Ease.OutCubic]
            ],
            Scale: [
                [4, 4, 4, 0],
                [4, 4, 4, 3/5],
                [1, 1, 1, 4/5, Ease.OutCubic]
            ]
        }),
        new AnimateTrack(start-4, {
            Track: "sideReal",
            Duration: 5,
            Dissolve: [
                [2, 0],
                [2, 3/5],
                [1, 4/5, Ease.OutCubic]
            ],
        }),
        new AnimateTrack(start, {
            Track: "sideMerges",
            Duration: moveInterval,
            Easing: Ease.OutQuad,
            Dissolve: [
                [0.9, 0],
                [0.1, 0.5],
                [0, 1]
            ],
            Repeat: end - start - 1
        }),
        new AnimateTrack(start, {
            Track: "side",
            Duration: moveInterval,
            Easing: Ease.OutQuad,
            OffsetPosition: [
                [0, 0, -1, 0],
                [-4, 0, -1, 1]
            ],
            Scale: [
                [2, 1, 1, 0],
                [1, 1, 1, 1]
            ],
            Dissolve: [
                [0.9, 0],
                [0.1, 0.5],
                [0.9, 1]
            ],
            DissolveArrow: [0],
            Repeat: end - start - 1
        }),
        new AnimateTrack(start, {
            Track: "farLeft",
            Duration: moveInterval,
            Easing: Ease.OutQuad,
            Dissolve: [
                [0.9, 0],
                [0, 1],
            ],
            Repeat: end - start - 1
        }),
        new AnimateTrack(start, {
            Track: "farRight",
            Duration: moveInterval,
            Easing: Ease.OutQuad,
            Dissolve: [
                [0, 0],
                [0.9, 1],
            ],
            Repeat: end - start - 1
        }),
        new AnimateTrack(start, {
            Track: "sideReal",
            Duration: moveInterval,
            Easing: Ease.OutQuad,
            Dissolve: [
                [.9, 0],
                [.75, 0.5],
                [.9, 1],
            ],
            Repeat: end - start - 1
        })
    );

    const tempFakeNotes: Note[] = [];

    notes.select({
        StartBeat: start,
        EndBeat: end
    }).forEach(n => {
        {
            // Real notes
            const d = n.CustomData;
            const a = n.Animation;
    
            d.DisableNoteLook = true;
            d.SpawnEffect = false;
            d.Track = "sideReal";
            d.Link = `l${n.Beat},${n.X}${n.Y}`;;
    
            a.Dissolve = [0.9];
        }
    
        for (let i = -2; i <= 3; i ++) {
            // Duplicated notes
            const dupe = n.Duplicate();
            const d = dupe.CustomData;
    
            dupe.Beat += 0.05;

            d.Track = "side";
            if (i == -1 || i == 2) d.Track = ["side", `far${i == -1 ? "Left" : "Right"}`];
            if (i == 1) d.Track = ["side", "sideMerges"];

            d.Uninteractable = true;
            d.Coordinates = [((dupe.X - 2) + 4 * i), dupe.Y];

            dupe.Animation = undefined;
    
            tempFakeNotes.push(dupe);
        }
    });

    fakeNotes.push(...tempFakeNotes);
}


//#endregion    =============== Functions Above  ===============

//#region       =============== Map Script Below ===============

// Removes the default environment
environment?.push(new Environment({
    ID: "Building|Back|Big|Small|Spectro|Light|Laser|Neon|Track",
    LookupMethod: "Regex",
    Active: false
}));

bombs.forEach(b => {
    b.CustomData.Color = [1,1,1,1]; // make the bombs white
});

// Instantiate the background prefab
customEvents.push(
    new InstantiatePrefab(4, {
        Asset: assets.prefabs.universesphere,
        ID: "background",
        Scale: [150, 150, 150]
    }),
);

// Take all the notes and do something for each one of them
notes.forEach(n => {
    n.CustomData.Offset = currentDiff.offset;
    n.CustomData.NJS = currentDiff.njs;
    n.CustomData.SpawnEffect = false; // Disables the spawn flash
});

// Function to shorten the syntax of controlling the materialproperty of the background prefab
particleControl({ 
    Start: 0, // Start time of the event
    Duration: 1, // Duration of the event
    Properties: {
        UFPS: [0], // (Use For Particle System)
        B: [1], 
        _Cull: [1],
        _ZWrite: [1],
        _fs: [-2.16],
        _fe: [0],
        _tc: [0, 0, 0, 1],
        _samples: [1], // The amount of samples the shader will generate
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
        _rOffset: [0.28],
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
    Start: 4,
    Duration: 8,
    Properties: {
        _lpow: [[1, 0], [0, 0.5, Ease.OutQuad]], // Background line strength control
        _s: [[1, 0], [0.01, 1, Ease.OutQuad]] // Background dot control
    }
});

// The glitch effect at the first notes.
customEvents.push(new Blit(4, {
    Asset: assets.materials.glitch.path,
    Duration: 2,
    Easing: Ease.OutSine,
    Properties: [{
        ID: "_Juice",
        Type: "Float",
        Value: [
            [2, 0],
            [0, 1]
        ]
    }]
}));

// 
for (let j = 4; j <= 52; j += 16) {
    for (let i = 12; i <= 16; i+=2) customEvents.push(new Blit(i+j, {
        Asset: assets.materials.chromaticaberration.path,
        Duration: 1,
        Easing: Ease.OutQuad,
        Properties: [{
            ID: "_IntensityX",
            Type: "Float",
            Value: [
                [0.25, 0],
                [0, 1]
            ]
        }, {
            ID: "_IntensityY",
            Type: "Float",
            Value: [
                [0.04, 0],
                [0, 1]
            ]
        }]
    }));
}

const introOffsets = [36, 39, 40, 44, 48, 52, 55, 56, 60]; // Timings for the kicks in the intro of the song.
for (let Offset of introOffsets) {
    particleControl({
        Start: Offset,
        Properties: {
            _s: [[1, 0], [0, 1, Ease.OutQuad]] // Background dot control
        }
    });
    customEvents.push(new Blit(Offset, {
        Asset: assets.materials.offset.path,
        Duration: 0.5,
        Properties: [{
            ID: "_Offset",
            Type: "Float",
            Value: [
                [0, 0],
                [1, 1]
            ]
        }, {
            ID: "_Intensity",
            Type: "Float",
            Value: [0.1]
        }, {
            ID: "_Color",
            Type: "Color",
            Value: [
                [1, 0, 0, 1, 0],
                [1, 1, 1, 1, 1]
            ]
        }]
    }));
}

// Define timing Offsets for the background piano loop after the intro of the song.
const PianoLoopTimings: number[] = [0, 8, 12, 14];

for (let i = 68; i <= 131.99; i+=16)
for (let Offset of PianoLoopTimings) {
    customEvents.push(new Blit(i + Offset, {
        Asset: assets.materials.chromaticaberration.path,
        Duration: 1, 
        Properties: [{
            ID: "_IntensityX",
            Type: "Float",
            Value: [
                [0.5, 0],
                [0, 1]
            ]
        }, 
        {
            ID: "_IntensityY",
            Type: "Float",
            Value: [
                [0.5, 0],
                [0, 1]
            ]
        }]
    }));
}

pointDefinitions?.set("disIn", [
    [0, 0],
    [1, 0.4]
]);

for (let i = -10; i <= 10; i++) {
    pointDefinitions?.set(`rndPos${i+10}`, [
        [i, Random(0, 4), 10, 0],
        [0, 0, 0, 0.475, Ease.OutCirc]
    ]);
}

for (let i = -90, j = 0; i <= 90; i += 18, j++) {
    for (let k = 1; k <= 2; k++) {
        pointDefinitions?.set(`rndRot${(j+"")+(k)}`, [
            [Random(-45, 45, 0), i, Random(-45, 45, 0), 0],
            [0, 0, 0, 0.475, Ease.OutCirc]
        ]);
        pointDefinitions?.set(`rndLocRot${(j+"")+(k)}`, [
            [Random(-90, 90, 0), i, Random(-180, 180, 0), 0],
            [0, 0, 0, 0.475, Ease.OutCirc]
        ]);
    }
}

for (let i = 1/10; i <= 1; i += 1/10) {
    pointDefinitions?.set(`disArrTrail${i}`, [
        [Math.abs(i - 1), 0],
        [Math.abs(i - 1), 0.3],
        [0, 0.45]
    ]);
    pointDefinitions?.set(`disTrail${i}`, [
        [Math.abs(i - 1) / 2, 0],
        [Math.abs(i - 1) / 2, 0.25],
        [0, 0.45]
    ]);
}

notes.select({ StartBeat: 68, EndBeat: 134 }).forEach(n => n.AddTrack("pianoEffect"));
notes.select({ StartBeat: 0, EndBeat: 131.99 }).forEach(n => {
    const tempFakeNotes: Note[] = [];

    const d = n.CustomData;
    const a = n.Animation;

    d.Offset = 4;
    d.DisableNoteGravity = true;
    d.DisableNoteLook = true;
    d.SpawnEffect = false;
    d.Link = `l${n.Beat},${n.X}${n.Y}`;
    
    a.Dissolve = "disIn";
    a.DissolveArrow = "disIn";
    a.OffsetPosition = `rndPos${Random(0, 20, 0)}`;
    a.OffsetWorldRotation = `rndRot${Random(0, 10, 0)}${Random(1,2,0)}`;
    a.LocalRotation = `rndLocRot${Random(0, 10, 0)}${Random(1,2,0)}`;

    for (let i = 1/10; i <= 1; i += 1/10) {
        const dupe = n.Duplicate();

        dupe.Beat += i;

        dupe.CustomData.Uninteractable = true;

        dupe.Animation.Dissolve = `disTrail${i}`;
        dupe.Animation.DissolveArrow = `disArrTrail${i}`;

        tempFakeNotes.push(dupe);
    }

    fakeNotes.push(...tempFakeNotes);
});

customEvents.push(new Blit(100, {
    Asset: assets.materials.offset.path,
    Duration: 0.5,
    Properties: [{
        ID: "_Offset",
        Type: "Float",
        Value: [
            [0, 0],
            [1, 1]
        ]
    }, {
        ID: "_Intensity",
        Type: "Float",
        Value: [0.1]
    }, {
        ID: "_Color",
        Type: "Color",
        Value: [
            [1, 0, 0, 1, 0],
            [1, 1, 1, 1, 1]
        ]
    }]
}));

const pianoScaleAnimation: Vec3Animation = [];
const pianoDissolveAnimation: Vec1Animation = [];
const pianoLpowAnimation: Vec1Animation = [];

for (let Offset of PianoLoopTimings) {
    pianoScaleAnimation.push(
        [1, 1, 1, Offset / 16 - 0.001],
        [1.5, 1.5, 1.5, Offset / 16, Ease.Step],
        [1, 1, 1, (Offset + 1.99) / 16, Ease.OutExpo]
    );
    pianoDissolveAnimation.push(
        [1, Offset / 16 - 0.001],
        [0.75, Offset / 16, Ease.Step],
        [1, (Offset + 1.5) / 16, Ease.OutExpo]
    );
    pianoLpowAnimation.push(
        [0, Offset / 16 - 0.001],
        [0.25, Offset / 16, Ease.Step],
        [0, (Offset + 1.5) / 16, Ease.OutQuad]
    );
}
for (let i = 68; i <= 131.99; i += 16) particleControl({
    Start: i,
    Duration: 16,
    Properties: {
        _lpow: pianoLpowAnimation,
        _s: pianoLpowAnimation
    }
});

customEvents.push(new AnimateTrack(68, {
    Track: "pianoEffect",
    Duration: 16,
    Scale: pianoScaleAnimation,
    Dissolve: pianoDissolveAnimation,
    DissolveArrow: pianoDissolveAnimation,
    Repeat: 3
}));

const buildUp: Vec1Animation = [];
for (let i = 0; i <= 29; i++) {
    buildUp.push(
        [1, i / 29, Ease.Step],
        [0, (i + 0.5) / 29, Ease.OutQuad]
    );
}
particleControl({
    Start: 132,
    Duration: 29,
    Properties: {
        _lpow: buildUp,
        _s: buildUp,
        _rb: [[0, 0], [0.5, 1]], // How much variety should the background color have
        _Color: [[1, 1, 1, 1, 0], [1, 0, 0, 1, 1]] //  Should be self-explanatory
    }
});

customEvents.push(
    new Blit(160, {
        Asset: assets.materials.offset.path,
        Duration: 1,
        Properties: [{
            ID: "_Offset",
            Type: "Float",
            Value: [
                [0, 0],
                [1, 1]
            ]
        }, {
            ID: "_Intensity",
            Type: "Float",
            Value: [0.5]
        }, {
            ID: "_Color",
            Type: "Color",
            Value: [
                [1, 0, 0, 1, 0],
                [1, 1, 1, 1, 1]
            ]
        }]
    }),
    new Blit(164, {
        Asset: assets.materials.kickwow.path,
        Duration: 6,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [
                [1, 0],
                [1, 2.5/6, Ease.OutCubic],
                [0.5, 5/6],
                [0, 1, Ease.OutCubic]
            ]
        }]
    })
);

particleControl({
    Start: 164,
    Duration: 8,
    Properties: {
        _scale: [[2.5, 0], [1, 1, Ease.Step]], // Background size control
        _near: [[1.12, 0], [2, 6/8, Ease.InExpo], [1, 1]],
        _far: [[8.74, 0], [16, 6/8, Ease.InExpo], [8, 1]],
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

customEvents.push(new Blit(194, {
    Asset: assets.materials.offset.path,
    Duration: 0.5,
    Properties: [{
        ID: "_Offset",
        Type: "Float",
        Value: [
            [0, 0],
            [1, 1]
        ]
    }, {
        ID: "_Intensity",
        Type: "Float",
        Value: [0.4]
    }, {
        ID: "_Color",
        Type: "Color",
        Value: [
            [1, 0, 0, 1, 0],
            [1, 1, 1, 1, 1]
        ]
    }]
}));

for (let i = 196; i <= 219; i++) blur(i);
blur(211);
notes.select({StartBeat: 220, EndBeat: 223.99}).forEach(n => {
    blur(n.Beat, 0.25)
});

let previousTime: number = 0;
notes.select({StartBeat: 228, EndBeat: 229}).forEach(n => {
    if (previousTime != n.Beat) {
        let duration = 0.5;
        if (n.Beat == 228.5 || n.Beat == 228.75) duration = 0.25;
        blur(n.Beat, duration);
    }
    previousTime = n.Beat;
});
blur(230, 0.5, {
    radius: [
        [25, 0],
        [0, 1]
    ]
});

chaosPath(172, 227);
setMaterialOnPPEvent(172, 191);

particleControl({
    Start: 192,
    Duration: 4,
    Properties: {
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
    Start: 228,
    Properties: {
        _lpow: [
            [1, 0],
            [0, 1/4],
            [1, 2/4, Ease.Step],
            [0, 2.99/4],
            [2, 3/4, Ease.Step],
            [0, 0.99]
        ],
        _s: [
            [1, 0],
            [0, 1/4],
            [1, 2/4, Ease.Step],
            [0, 2.99/4],
            [2, 3/4, Ease.Step],
            [0, 0.99]
        ],
        _Color: [[1, 0, 0, 1, 0], [0.75, 0.9, 1, 1, 1]], //  Should be self-explanatory
        _rspeed: [[0.7, 0], [0.01, 1/3, Ease.Step]]
    }
});

particleControl({
    Start: 231,
    Properties: {
        _s: [[0.7, 0], [0.001, 0.99]], // Background dot control
        _lpow: [[0.7, 0], [0, 0.99]], // Background line strength control
    }
});
const halfKick: Vec1Animation = [[0.5, 0], [0, 1, Ease.OutQuad]];
for (let i = 231; i <= 257.99; i++) kickWow(i);
kickWow(243.5);
notes.select({StartBeat: 258, EndBeat: 259.99}).forEach(n => {
    kickWow(n.Beat, 0.25, {_Intensity: halfKick});
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
    _far: [[16, 0], [4, 1]]
});

sideBlocks(231, 292)
particleControl({
    Start: 292,
    Properties: {
        _s: [0.001], // Background dot control
        _rspeed: [0.0001],
        _ms: [0.0001],
        _far: [1],
        _Color: [1, 1, 1, 1] //  Should be self-explanatory
    }
});

customEvents.push(new Blit(292, {
    Asset: assets.materials.grayscale.path,
    Duration: 64,
    Properties: [{
        ID: "_Intensity",
        Type: "Float",
        Value: [
            [0, 0],
            [.9, 1/64, Ease.OutCubic],
            [.9, 62/64],
            [0, 1, Ease.OutCubic]
        ]
    }]
}));

randomPath(293, 355.99);
// Define timings for the background control of the lo-fi kicks
const Kicks: number[] = [324, 327.5, 328, 329, 332, 335.666, 336, 337, 338.5, 340, 343.5, 344, 345, 348, 351.5, 352];
for (let i of Kicks) {
    particleControl({
        Start: i,
        Duration: 0.5,
        Properties: {
            _s: [[1, 0], [0, 0.99]] // Background dot control
        }
    });
}
for (let i = 294; i <= 350; i+=4) {
    particleControl({
        Start: i,
        Duration: 1,
        Properties: {
            _lpow: [[1, 0], [0, 0.99]], // Background line strength control
        }
    });
}

particleControl({
    Start: 353,
    Duration: 3,
    Properties: {
        _far: [[8, 1, Ease.Step]],
        _near: [[2, 1, Ease.Step]],
        _scale: [[1, 0], [2, 1, Ease.Step]], // Background size control
        _lpow: [[0.001, 0], [0, 0.66]], // Background line strength control
        _s: [[0.01, 0], [0, 0.66]] // Background dot control
    }
});

notes.select({StartBeat: 356, EndBeat: 370}).forEach(n => {
    if (previousTime != n.Beat) {
        particleControl({
            Start: n.Beat,
            Duration: (n.Beat >= 363 && n.Beat <= 364) ? 0.25 : 0.5,
            Properties: {
                _lpow: [[0.5, 0], [0, 1]], // Background line strength control
                _s: [[0.5, 0], [0, 1]] // Background dot control
            }
        });
    }
    previousTime = n.Beat;
});

particleControl({
    Start: 372,
    Duration: 7.99,
    Properties: {
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
    Start: 380,
    Duration: 4.999,
    Properties: {
        _Color: [
            [1, 0, 0, 1, 0],
            [1, 0.8, 0.8, 1, 1/5],
            [1, 0, 0, 1, 2/5, Ease.InExpo],
            [1, 0.8, 0.8, 1, 3/5],
            [1, 0, 0, 1, 4/5, Ease.InExpo],
            [1, 0.8, 0.8, 1, 1]
        ]
    }
});

for (let i = 380; i <= 382; i += 2) kickWow(i, 1, {_Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]]});
kickWow(384, 1, {_Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]]});

for (let i = 385; i <= 387; i++) new Blit(i, {
    Asset: assets.materials.offset.path,
    Duration: .5,
    Properties: [{
        ID: "_Offset",
        Type: "Float",
        Value: [
            [0, 0],
            [1, 1]
        ]
    }, {
        ID: "_Intensity",
        Type: "Float",
        Value: [0.2]
    }, {
        ID: "_Color",
        Type: "Color",
        Value: [
            [1, 0, 0, 1, 0],
            [1, 1, 1, 1, 1]
        ]
    }]
});

notes.select({StartBeat: 388, EndBeat: 393}).forEach(n => {
    if (previousTime < n.Beat) blur(n.Beat, 0.5, {
        radius: [
            [30, 0],
            [0, 1]
        ]
    });
    previousTime = n.Beat;
});

notes.select({StartBeat: 396, EndBeat: 407.5}).forEach(n => {
    if (previousTime < n.Beat) {
        if (n.Beat == 403) {
            blur(n.Beat, 1, {
                radius: [
                    [50, 0],
                    [0, 1]
                ]
            });
        } else kickWow(n.Beat);
    }
});

notes.select({StartBeat: 408, EndBeat: 411}).forEach(n => {
    n.CustomData.Offset = (n.CustomData.Offset ?? 0) + 1;
    n.Animation.OffsetPosition = [
        [8 * (n.Color ? -1 : 1), 0, 0, 0],
        [0, 0, 0, 0.5, Ease.OutExpo],
    ]
});

let alreadyPlaced: number[] = [];
notes.select({StartBeat: 412, EndBeat: 420}).forEach(n => {
    if (previousTime == n.Beat && !alreadyPlaced.includes(n.Beat)) {
        kickWow(n.Beat, 0.25);
        alreadyPlaced.push(n.Beat);
    }
    if (n.Beat >= 418) {
        blur(n.Beat, 0.25);
    }
    previousTime = n.Beat;
});

for (let i = 420; i <= 424; i+=4) new Blit(i, {
    Asset: assets.materials.chromaticaberration.path,
    Duration: 2,
    Properties: [{
        ID: "_IntensityX",
        Type: "Float",
        Value: [
            [1, 0],
            [0, 1, Ease.OutQuint]
        ]
    }, {
        ID: "_IntensityY",
        Type: "Float",
        Value: [0.01]
    }]
});

for (let i = 385; i <= 387; i++) particleControl({
    Start: i, 
    Duration: 1,
    Properties: {
        _lpow: [[1, 0], [0, 1]], // Background line strength control
        _s: [[1, 0], [0, 1]], // Background dot control
        _Color: [
            [1, 0, 0, 1, 0],
            [1, 0.8, 0.8, 1, 1]
        ]
    }
})


notes.select({StartBeat: 388, EndBeat: 393}).forEach(n => {
    if (n.Beat - previousTime > 0.125) {
        particleControl({
            Start: n.Beat,
            Duration: 0.5,
            Properties: {
                _lpow: [[1.5, 0], [0, 1]], // Background line strength control
                _s: [[1.5, 0], [0, 1]], // Background dot control
                _Color: [
                    [1, 0, 0, 1, 0],
                    [1, 0.8, 0.8, 1, 1]
                ]
            }
        });
    }

    previousTime = n.Beat;
});

notes.select({StartBeat: 396, EndBeat: 407.5}).forEach(n => {
    n.Animation.Dissolve = [0.1];
});;

particleControl({
    Start: 394,
    Duration: 2,
    Properties: {
        _lpow: [[1.5, 0], [0, 1]], // Background line strength control
        _s: [[1.5, 0], [0, 1]], // Background dot control
        _scale: [[2, 0], [1, 1, Ease.Step]] // Background size control
    }
});

particleControl({
    Start: 414,
    Duration: 6,
    Properties: {
        _scale: [3], // Background size control
        _rb: [[1, 0], [0, 1]], // How much variety should the background color have
        _near: [
            [2, 0],
            [8, 5/6, Ease.InExpo],
            [1, 1]
        ],
        _far: [
            [8, 0],
            [16, 5/6, Ease.InExpo],
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

notes.select({StartBeat: 428, EndBeat: 443.5}).forEach(n => n.AddTrack("hardKicks"));
notes.select({StartBeat: 428, EndBeat: 441.5}).forEach(n => {
    if (previousTime < n.Beat) {
        customEvents.push(new AnimateTrack(n.Beat, {
            Track: "hardKicks",
            Duration: n.Beat != 440.75 ? 0.5 : 0.25,
            Scale: [
                [1.5, 1.5, 1.5, 0],
                [1, 1, 1, 1, Ease.OutQuad]
            ],
            Dissolve: [
                [0.6, 0],
                [1, 1]
            ]
        }));
        particleControl({
            Start: n.Beat,
            Duration: n.Beat != 440.75 ? 0.5 : 0.25,
            Properties: {
                _Color: [
                    [2, 0, 0, 1, 0],
                    [0, 0, 0, 0, 0.99]
                ],
                _s: [[2, 0], [0.01, 0.99]], // Background dot control
            }
        })
        blur(n.Beat, 0.5, {
            radius: [
                [50, 0],
                [0, 1]
            ],
            resolution: [300]
        });
    }
    previousTime = n.Beat;
});

customEvents.push(new Blit(444, {
    Asset: assets.materials.pixelate.path,
    Duration: 1,
    Properties: [{
        ID: "_Pixels",
        Type: "Float",
        Value: [
            [2000, 0],
            [100, .75, Ease.OutCubic],
            [2000, 1, Ease.OutExpo]
        ]
    }]
}));

particleControl({
    Start: 445,
    Duration: 11,
    Properties: {
        _near: [[1, 0], [8, 5/11, Ease.InExpo], [8, 7/11], [1, 0.99]],
        _far: [[4, 0], [16, 5/11, Ease.InExpo], [16, 7/11], [1, 0.99]],
        _s: [[0, 0], [2, 4.99/11, Ease.InExpo], [0, 5/11, Ease.Step], [2, 7/11, Ease.Step], [0, 0.99]], // Background dot control
        _lpow: [[0, 0], [2, 4.99/11, Ease.InExpo], [0, 5/11, Ease.Step], [2, 7/11, Ease.Step], [0, 0.99]], // Background line strength control
        _Color: [
            [0, 0, 0, 0, 0],
            [1, 0, 1, 1, 4.99/11],
            [0, 0, 0, 0, 5/11, Ease.Step],
            [1, 0, 0, 1, 7/11, Ease.Step],
            [0, 0, 0, 0, 0.99, Ease.OutQuad]
        ],
        _rb: [[0, 0], [1, 4.99/11, Ease.InExpo], [0, 5/11, Ease.Step], [1, 7/11, Ease.Step], [0, 0.99]], // How much variety should the background color have
    }
});

notes.select({StartBeat: 445, EndBeat: 458}).forEach((n) => {
    n.AddTrack("pm");
    n.CustomData.Offset = (n.CustomData.Offset ?? 0) + (n.Beat - 445) / 6.5;
    n.CustomData.DisableNoteGravity = true;
    n.CustomData.DisableNoteLook = true;
    n.CustomData.SpawnEffect = false;
})
for (let i = 0; i <= 5; i += 1/12) {
    customEvents.push(new AssignPathAnimation(445 + i, {
        Track: "pm",
        OffsetWorldRotation: [
            [-90 * (i / 5), 0, 0, 0],
            [0, 0, 0, 0.475, Ease.OutCirc]
        ]
    }));
}
for (let i = 0; i <= 4; i += 1/12) {
    const rotation = -90 * Math.abs((i / 4) - 1);
    customEvents.push(new AssignPathAnimation(452 + i, {
        Track: "pm",
        OffsetWorldRotation: [
            [rotation, 0, 0, 0],
            [0, 0, 0, 0.475, Ease.OutCirc]
        ]
    }));
}


pointDefinitions?.set("distKickScale", [
    [1.5, 1.5, 1.5, 0],
    [1, 1, 1, 1]
]);
pointDefinitions?.set("distKickDis", [
    [0.5, 0],
    [1, 1]
]);

notes.select({StartBeat: 459, EndBeat: 490}).forEach(n => n.AddTrack("distortedKicks"));
notes.select({StartBeat: 459, EndBeat: 474.99}).forEach(n => {
    if (previousTime < n.Beat) {
        kickWow(n.Beat, 0.125);
        customEvents.push(new AnimateTrack(n.Beat, {
            Track: "distortedKicks",
            Duration: 0.5,
            Easing: Ease.OutCubic,
            Scale: "distKickScale",
            Dissolve: "distKickDis"
        }));
    }
});
blur(475, 0.5, {
    radius: [
        [50, 0],
        [0, 1]
    ]
});
notes.select({StartBeat: 476, EndBeat: 487.99}).forEach(n => {
    if (previousTime < n.Beat) {
        kickWow(n.Beat, 0.125);
        customEvents.push(new AnimateTrack(n.Beat, {
            Track: "distortedKicks",
            Duration: 0.5,
            Easing: Ease.OutCubic,
            Scale: "distKickScale",
            Dissolve: "distKickDis"
        }));
    }
});

blur(488, 4, {
    radius: [
        [50, 0],
        [0, 1, Ease.OutCubic]
    ],
    resolution: [300]
});



notes.select({StartBeat: 508, EndBeat: 513.5}).forEach(n => {
    if (n.Beat == previousTime) customEvents.push(new Blit(n.Beat, {
        Asset: assets.materials.kickwow.path,
        Duration: 0.5,
        Properties: [
            {
                ID: "_Intensity",
                Type: "Float",
                Value: [
                    [1, 0],
                    [0, 1, Ease.OutQuad]
                ]
            }, {
                ID: "_Color",
                Type: "Color",
                Value: [
                    [1, 0, 0, 1, 0],
                    [1, 1, 1, 1, 1]
                ]
            }
        ]
    }));
    previousTime = n.Beat;
});
for (let i = 514; i <= 515.99; i+=1/4) {
    customEvents.push(new Blit(i, {
        Asset: assets.materials.kickwow.path,
        Duration: 0.25,
        Properties: [
            {
                ID: "_Intensity",
                Type: "Float",
                Value: [
                    [1, 0],
                    [0, 1, Ease.OutQuad]
                ]
            }, {
                ID: "_Color",
                Type: "Color",
                Value: [
                    [1, 0, 0, 1, 0],
                    [1, 1, 1, 1, 1]
                ]
            }
        ]
    }));
}

customEvents.push(new Blit(516, {
    Asset: assets.materials.chromaticaberration.path,
    Duration: 8, 
    Properties: [
        {
            ID: "_IntensityX",
            Type: "Float",
            Value: [
                [1.5, 0],
                [0, 1]
            ]
        }
    ]
}));

for (let i = 492; i <= 493.99; i+=0.5) kickWow(i, 0.5);

notes.select({StartBeat: 494, EndBeat: 515.99}).forEach(n => {
    if (previousTime == n.Beat && !alreadyPlaced.includes(n.Beat)) {
        alreadyPlaced.push(n.Beat);
        if (n.Beat < 508) {
            blur(n.Beat, 0.25, {
                radius: [
                    [30, 0],
                    [0, 1]
                ]
            });
        }
        if (n.Beat == 508) new Blit(508, {
            Asset: assets.materials.wtfisgoingon.path,
            Duration: 1,
            Properties: [{
                ID: "_Intensity",
                Type: "Float",
                Value: [
                    [8, 0],
                    [0, 1]
                ]
            }, {
                ID: "_Lerp",
                Type: "Float",
                Value: [
                    [1.1, 0],
                    [0, 1]
                ]
            }, {
                ID: "_Closing",
                Type: "Float",
                Value: [[1, 0], [0, 1]]
            }]
        });
    }
    previousTime = n.Beat
});

particleControl({
    Start: 494,
    Properties: {
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
        [5000, 1, Ease.InExpo],
    ], resolution: [300]
})

for (let i = 556; i <= 587; i++) particleControl({
    Start: i,
    Properties: {
        _Color: [
            [1, 0, 0, 1, 0],
            [1, 0.5, 0.5, 0, 0.99]
        ],
        _s: [[1, 0], [0.1, 0.99]], // Background dot control
        _lpow: [0] // Background line strength control
    }
});

{
    const tempFakeNotes: Note[] = [];
    notes.select({StartBeat: 556, EndBeat: 619}).forEach(n => {
        {
            const d = n.CustomData;
    
            d.DisableNoteLook = true;
            d.SpawnEffect = false;
            d.Link = `l${n.Beat},${n.X}${n.Y}`;;
        }
    
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (j == 0 && i == 0) continue;
                const dupe = n.Duplicate();
                const d = dupe.CustomData;
    
                dupe.Beat += 0.01;
    
                d.DisableNoteGravity = true;
                d.Uninteractable = true;
                d.Track = ["array"];
                if (i != 0) d.Track.push(`array${i > 0 ? "R" : "L"}`);
                if (j != 0) d.Track.push(`array${j > 0 ? "U" : "D"}`);
    
                tempFakeNotes.push(dupe);
            }
        }
    });
    fakeNotes.push(...tempFakeNotes);
}
for (let i = -1; i <= 1; i++) {
    if (i == 0) continue;
    customEvents.push(
        new AnimateTrack(552, {
            Track: `array${i > 0 ? "R" : "L"}`,
            Duration: 0,
            OffsetPosition: [0, 0, 0]
        }),
        new AnimateTrack(556, {
            Track: `array${i > 0 ? "R" : "L"}`,
            Duration: 1,
            Easing: Ease.OutCubic,
            OffsetPosition: [
                [0, 0, 0, 0],
                [6 * i, 0, 0, 1]
            ]
        })
    );
}
for (let i = -1; i <= 1; i++) {
    if (i == 0) continue;
    customEvents.push(
        new AnimateTrack(552, {
            Track: `array${i > 0 ? "U" : "D"}`,
            Duration: 0,
            OffsetPosition: [0, 0, 0]
        }),
        new AnimateTrack(556, {
            Track: `array${i > 0 ? "U" : "D"}`,
            Duration: 1,
            Easing: Ease.OutCubic,
            OffsetPosition: [
                [0, 0, 0, 0],
                [0, 5 * i, 0, 1]
            ]
        })
    )
}
customEvents.push(
    new AnimateTrack(552, {
        Track: "array",
        Duration: 0,
        Dissolve: [0],
        DissolveArrow: [0]
    }),
    new AnimateTrack(556, {
        Track: "array",
        Duration: 1,
        Easing: Ease.OutCubic,
        Dissolve: [
            [0, 0],
            [1, 0.5]
        ],
        DissolveArrow: [
            [0, 0],
            [1, 0.5]
        ]
    })
);

for (let i = 556; i <= 579; i++) kickWow(i, 0.5, {
    _Intensity: [
        [1, 0],
        [0, 1, Ease.OutCirc]
    ]
});
kickWow(571.5, 0.5, {
    _Intensity: [
        [1, 0],
        [0, 1, Ease.OutCirc]
    ]
});
notes.select({StartBeat: 580, EndBeat: 587}).forEach(n => {
    if (previousTime == n.Beat) {
        kickWow(n.Beat, 0.5, {
            _Intensity: [
                [0.5, 0],
                [0, 1, Ease.OutCirc]
            ]
        });
    }
    previousTime = n.Beat;
});
for (let i = 588; i <= 603; i++) kickWow(i, 1, {
    _Intensity: [
        [1, 0],
        [0, 1, Ease.OutExpo]
    ],
    _Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]]
});
kickWow(588.5, 0.5, {
    _Intensity: [
        [1, 0],
        [0, 1, Ease.OutCirc]
    ],
    _Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]]
});
for (let i = 604; i <= 610; i += 2) kickWow(i, 2, {
    _Intensity: [
        [1, 0],
        [0, 1, Ease.OutExpo]
    ],
    _Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]]
});
notes.select({StartBeat: 612, EndBeat: 619}).forEach(n => {
    if (previousTime < n.Beat) {
        kickWow(n.Beat, 0.25, {
            _Intensity: [
                [1, 0],
                [0, 1, Ease.OutQuad]
            ],
            _Color: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 1]]
        });
    }
    previousTime = n.Beat;
});

customEvents.push(new Blit(620, {
    Asset: assets.materials.grayscale.path,
    Duration: 33,
    Properties: [{
        ID: "_Intensity",
        Type: "Float",
        Value: [
            [0, 0],
            [1, 32/33],
            [0, 1]
        ]
    }]
}));

randomPath(623, 652)
particleControl({
    Start: 588,
    Properties: {
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

notes.select({StartBeat: 589, EndBeat: 619}).forEach(n => {
    if (n.Beat - previousTime > 0.125) particleControl({
        Start: n.Beat,
        Properties: {
            _Color: [
                [2, 0, 0, 1, 0],
                [1, 0.5, 0.5, 1, 1]
            ],
            _s: [[1, 0], [0.2, 1]], // Background dot control
            _lpow: [[1, 0], [0.1, 1]] // Background line strength control
        }
    });
    previousTime = n.Beat;
}); 

particleControl({
    Start: 620,
    Duration: 4,
    Properties: {
        _Color: [
            [1, 0, 0, 1, 0],
            [1, 0.8, 0.8, 1, 0.99]
        ],
        _s: [[2, 0], [0.01, 0.99]], // Background dot control
        _lpow: [[2, 0], [0, 0.99]], // Background line strength control
        _rspeed: [0],
        _scale: [[2, 0], [1, 0.99, Ease.OutQuad]] // Background size control
    }
});

customEvents.push(new Blit(652, {
    Asset: assets.materials.grayscale.path,
    Duration: 8,
    Properties: [
        {
            ID: "_Juice",
            Type: "Float",
            Value: [
                [4, 0],
                [0, 1, Ease.OutCirc]
            ]
        }
    ]
}));
particleControl({
    Start: 652,
    Duration: 8,
    Properties: {
        _lpow: [[1, 0], [0, 0.99]], // Background line strength control
        _s: [[1, 0], [0, 0.99]], // Background dot control
        _Color: [
            [1, 0, 0, 1, 0],
            [0, 0, 0, 0, 0.99]
        ]
    }
});
customEvents.push(new DestroyObject(660, {
    ID: "background"
}));

//#endregion    =============== Map Script Above ===============

Diff.Push({
    format: true // Change this to true to indent the JSON output
});
}

log.success("HeckLib ran", { StartTime: START });
log.printLogBuffer();