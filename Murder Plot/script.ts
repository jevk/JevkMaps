import { LineIndex, LineLayer, LogType, LookupMethod, MaterialShader, PLUGIN } from "./hecklib/util/enums";
import Difficulty from "./hecklib/v3/map/Difficulty";
import { Ease } from "./hecklib/util/easings";
import Environment from "./hecklib/v3/environment/Environment";
import ApplyPostProcessing from "./hecklib/v3/events/customEvents/Blit";
import DestroyObject from "./hecklib/v3/events/customEvents/DestroyObject";
import InstantiatePrefab from "./hecklib/v3/events/customEvents/InstantiatePrefab";
import PointDefinition from "./hecklib/v3/events/PointDefinition";
import AnimeFromJapan from "./hecklib/v3/events/customEvents/AnimateTrack"
import AssignPathAnimation from "./hecklib/v3/events/customEvents/AssignPathAnimation";
import AnimateTrack from "./hecklib/v3/events/customEvents/AnimateTrack";
import {Random} from "./hecklib/util/functions";
import Assets from "./bundleinfo.json";
import PlayerTransformModifier from "./hecklib/util/baseValues/PlayerTransformModifier";
import BaseCustomData from "./hecklib/v3/objects/customData/BaseCustomData";
import SetMaterialProperty from "./hecklib/v3/events/customEvents/SetMaterialProperty";
import ColorModifier from "./hecklib/util/baseValues/ColorModifier";
import CreateCamera from "./hecklib/v3/events/customEvents/CreateCamera";
import Material from "./hecklib/v3/environment/Material";
import { Vec3 } from "./hecklib/util/vec";
import Geometry from "./hecklib/v3/environment/Geometry";
import { lookup } from "dns";
import Note from "./hecklib/v3/objects/Note";
import Obstacle from "./hecklib/v3/objects/Obstacle";
import Slider from "./hecklib/v3/objects/Slider";

const Diff = new Difficulty(
    Difficulty.STANDARD.Expert,
    Difficulty.LAWLESS.Expert,
    {
        ForcedNJS: 18,
        ForcedOffset: -0.75,
        Logs: "Info"
    }
);

Diff.DifficultyInfo.CustomData.Requirements = [
    PLUGIN.Chroma,
    PLUGIN.NoodleExtensions,
    PLUGIN.Vivify
];
Diff.DifficultyInfo
Diff.DifficultyInfo.CustomData.Warnings = [
    "Moving notes",
    "Post processing shaders",
];
Diff.DifficultyInfo.CustomData.Information = [
    "Kordhell is cool"
];
Diff.DifficultyInfo.CustomData.DifficultyLabel = "Murdered...";
Diff.DifficultyInfo.CustomData.EnvColorLeft = [1,0,1];
Diff.DifficultyInfo.CustomData.EnvColorRight = [1,0,1];

const { ColorNotes: notes, BombNotes: bombs, Obstacles: walls, Sliders: arcs, BurstSliders: chains, BasicBeatmapEvents: events } = Diff.Map;
const { FakeColorNotes: fakeNotes, FakeBombNotes: fakeBombs, FakeObstacles: fakeWalls, FakeSliders: fakeArcs, FakeBurstSliders: fakeChains, CustomEvents: customEvents, PointDefinitions: pointDefinitions, Materials: materials, Environment: environment} = Diff.Map.CustomData;

//#region Functions Below
for (let i = 1; i <= 32; i++) {
    pointDefinitions.set(`neR${i}`, [
        [0, 0, 0, .5],
        [Random(-180, 180), Random(-180, 180), Random(-180, 180), 0.85, Ease.OutCirc]
    ]);
    pointDefinitions.set(`neDP${i}`, [
        [0, 90, 72, .5],
        [Random(-50, 50), Random(40, 5), Random(-50, 50), 0.85, Ease.OutCirc],
        [0, 0, 0, 1, Ease.InCirc]
    ]);
    pointDefinitions.set(`neD${i}`, [
        [0, 0],
        [0, 0.5],
        [i / 32, 30.5/60],
        [i / 32, 59/60],
        [0, .9, Ease.OutCirc]
    ]);
}
pointDefinitions.set("neLR", [
    [0, 0, 0, 0],
    [1500, 1500, 1500, 1]
]);
pointDefinitions.set("555", [5, 5, 5]);
pointDefinitions.set("1011", [1, 0, 1, 1]);
function noteExplosion(time: number) {
    const tempNotes = [];

    for (let i = 0; i <= 125; i++) {
        const fakeNote = new Note();
        const d = fakeNote.CustomData;
        const a = fakeNote.Animation;
    
        fakeNote.Beat = time + 0.05 + i * 0.001; // Stagger the notes slightly
        fakeNote.Color = i % 2;
        fakeNote.CutDirection = Random(0, 9, 0);
        fakeNote.X = LineIndex.Left;
        fakeNote.Y = LineLayer.Bottom;
            
        d.Offset = 30;
        d.DisableNoteGravity = true;
        d.DisableNoteLook = true;
        d.DisableNoteDebris = true;
        d.SpawnEffect = true;
        d.Uninteractable = true;
    
        a.DefinitePosition = `neDP${Random(1, 32)}`;
        a.OffsetWorldRotation = `neR${Random(1, 32)}`;
        a.LocalRotation = "neLR";
        a.Dissolve = `neD${Random(1, 32)}`;
        a.DissolveArrow = `neD${Random(1, 32)}`;
        a.Scale = "555";
        a.Color = "1011";
    
        tempNotes.push(fakeNote);
    }

    fakeNotes.push(...tempNotes);
}

function IntroOn(StartBeat: number, EndBeat: number, Interval: number) {
    for (let i = StartBeat; i <= EndBeat; i += Interval) {
        customEvents.push(new ApplyPostProcessing(i, {
            Asset: Assets.materials.chromaticabb.path,
            Duration: 0.5,
            Properties: [{
                ID: "_AberrationAmount",
                Type: "Float",
                Value: [[0.0025,0]]
            }]
        }));
    }
}
IntroOn(50, 51, 1)
IntroOn(58, 59, 1)
IntroOn(66, 67, 1)
IntroOn(82, 83, 1)
IntroOn(90, 91, 1)
IntroOn(98, 99, 1)

IntroOn(146, 147, 1)
IntroOn(154, 155, 1)
IntroOn(162, 163, 1)
IntroOn(178, 179, 1)
IntroOn(186, 187, 1)
IntroOn(194, 195, 1)

function IntroOff(StartBeat: number, EndBeat: number, Interval: number) {
    for (let i = StartBeat; i <= EndBeat; i += Interval) {
        customEvents.push(new ApplyPostProcessing(i, {
            Asset: Assets.materials.chromaticabb.path,
            Duration: 0.5,
            Properties: [{
                ID: "_AberrationAmount",
                Type: "Float",
                Value: [[0.0012,0]]
            }]
        }));
    }
}

IntroOff(50.5, 51.5, 1)
IntroOff(58.5, 59.5, 1)
IntroOff(66.5, 57.5, 1)
IntroOff(82.5, 83.5, 1)
IntroOff(90.5, 91.5, 1)
IntroOff(98.5, 99.5, 1)

IntroOff(146.5, 147.5, 1)
IntroOff(154.5, 155.5, 1)
IntroOff(162.5, 163.5, 1)
IntroOff(178.5, 179.5, 1)
IntroOff(186.5, 187.5, 1)
IntroOff(194.5, 195.5, 1)

function IntroOn2(StartBeat: number, EndBeat: number, Interval: number) {
    for (let i = StartBeat; i <= EndBeat; i += Interval) {
        customEvents.push(new ApplyPostProcessing(i, {
            Asset: Assets.materials.chromaticabb.path,
            Duration: 1,
            Properties: [{
                ID: "_AberrationAmount",
                Type: "Float",
                Value: [[0.0025,0],[0.0012,1, Ease.OutSine]]
            }]
        }));
    }
}
IntroOn2(52, 68, 8)
IntroOn2(84, 100, 8)

IntroOn2(148, 164, 8)
IntroOn2(180, 196, 8)


function DropOn(StartBeat: number, EndBeat: number, Interval: number) {
    for (let i = StartBeat; i <= EndBeat; i += Interval) {
        customEvents.push(new ApplyPostProcessing(i, {
            Asset: Assets.materials.chromaticabb.path,
            Duration: 1,
            Properties: [{
                ID: "_AberrationAmount",
                Type: "Float",
                Value: [[0.0025,0],[0.0012,0.5, Ease.OutSine]]
            }]
        }));
    }
}
DropOn(108, 136, 1)
DropOn(204, 232, 1)
DropOn(236, 264, 1)

function Pulses(StartBeat: number, EndBeat: number, Interval: number) {
    for (let i = StartBeat; i <= EndBeat; i += Interval) {
        customEvents.push(
            new SetMaterialProperty(i + 0.05, {
                Asset: Assets.materials.blackholemat.path,
                Duration: 1,
                Properties: [{
                    ID: "_CoreThreshold",
                    Type: "Float",
                    Value: [[0.7,0],[0.788,0.3]]
                }]
            }));
    }   
}
Pulses(44,72,1)
Pulses(75,104,1)

Pulses(140,168,1)
Pulses(172,200,1)


function dropkick(StartBeat: number, EndBeat: number, Interval: number) {
    for (let i = StartBeat; i <= EndBeat; i += Interval) {
        customEvents.push(
            new ApplyPostProcessing(i + 0.10, {
                Asset: Assets.materials.motionblur.path,
                Duration: 1,
                Properties: [{
                    ID: "_MotionBlurLength",
                    Type: "Float",
                    Value: [[10,0],[0,0.75, Ease.OutExpo]]
                }]
            }))
    }
}

function dropkickCrunch(StartBeat: number, EndBeat: number, Interval: number) {
    for (let i = StartBeat; i <= EndBeat; i += Interval) {
        customEvents.push(
            new ApplyPostProcessing(i + 0.10, {
                Asset: Assets.materials.kick.path,
                Duration: 1,
                Properties: [{
                    ID: "_Intensity",
                    Type: "Float",
                    Value: [[0.1,0],[0,0.75, Ease.OutExpo]]
                }]
            }),
            new ApplyPostProcessing(i + 0.10, {
                Asset: Assets.materials.motionblur.path,
                Duration: 1,
                Properties: [{
                    ID: "_MotionBlurLength",
                    Type: "Float",
                    Value: [[10,0],[0,0.75, Ease.OutExpo]]
                }]
            }))
    }
}
dropkick(44, 72, 2)
dropkickCrunch(45, 71, 2)
dropkick(76, 104, 2)
dropkickCrunch(77, 103, 2)

dropkick(108, 136, 2)
dropkickCrunch(109, 135, 2)

dropkick(142, 168, 2)
dropkickCrunch(141, 167, 2)
dropkick(172, 200, 2)
dropkickCrunch(173, 199, 2)

dropkick(206, 232, 2)
dropkickCrunch(205, 231, 2)
dropkick(238, 264, 2)
dropkickCrunch(237, 263, 2)

function DpKm(StartBeat: number, EndBeat: number, Interval: number) {
    for (let i = StartBeat; i <= EndBeat; i += Interval) {
        customEvents.push(
            new AnimeFromJapan(i + 0.10, {
                Track: "dpkm",
                Duration: 0.5,
                Position: [
                    [0,-1,0,0],
                    [0,0,0,0.4],
                ]
            }))
    }
}
DpKm(108, 136, 1)
DpKm(204, 232, 1)
DpKm(236, 264, 1)

for (let i = -4, k = 0; i <= 4; i++, k++) {
    if (i === -2) i = 3;
    pointDefinitions.set(`meP${k}`, [
        [i, -10, -15, 0],
        [i, Random(0, 1) ? -1 : 1, -20, 0.25, Ease.OutBack],
        [0, 0, 0, 0.475, Ease.OutExpo]
    ]);
}
pointDefinitions.set("meI", [
    [0, 0],
    [1, 0.4, Ease.Step]
]);
pointDefinitions.set("meD", [
    [0, 0],
    [0, 0.25],
    [1, 0.5, Ease.OutCubic]
]);
for (let i = 1/8; i <= 1; i += 1/8) pointDefinitions.set(`meTD${(i / 2).toFixed(2)}`, [
    [0, 0],
    [0, 0.25],
    [Math.abs(i - 1) / 3, 0.3, Ease.OutCubic],
    [Math.abs(i - 1) / 3, 0.4],
    [0, 0.475, Ease.OutCubic]
]);
for (let i = 0; i < 20; i++) pointDefinitions.set(`meR${i}`, [
    [Random(120, 179) * (i % 2 ? -1 : 1), Random(120, 179) * (i % 2 ? -1 : 1), Random(120, 179) * (i % 2 ? -1 : 1), 0],
    [0, 0, 0, 0.55, Ease.OutBack]
]);
function mainEffect(start: number, end: number) {
    const tempNotes = [];
    notes.select({ StartBeat: start, EndBeat: end }).forEach(n => {
        n.CustomData.Offset = 1;
        n.CustomData.NJS += 2
        n.CustomData.DisableNoteGravity = true;
        n.CustomData.DisableNoteLook = true;
        n.CustomData.Link = `${n.Beat},${n.X},${n.Y}`;
        
        const a = n.Animation;
        a.DissolveArrow = "meD";
        a.Dissolve = "meD";
        a.OffsetPosition = `meP${Random(0, 3)}`;
        a.LocalRotation = `meR${Random(0, 19)}`;
        a.Interactable = "meI";

        for (let i = 1/16; i <= 0.5; i += 1/16) {
            const d = n.Duplicate();
            d.Beat += i + 0.01;

            d.CustomData.DisableNoteDebris = true;
            d.CustomData.Uninteractable = true;

            d.Animation.Dissolve = `meTD${i.toFixed(2)}`;
            d.Animation.DissolveArrow = `meTD${i.toFixed(2)}`;
            tempNotes.push(d);
        }
    });
    fakeNotes.push(...tempNotes);
}

pointDefinitions.set("dnP", [
    [0, 6, 0, 0],
    [0, 6, 0, 0.5],
    [0, 0, 0, 0.75, Ease.InExpo],
    [0, -.5, 0, 0.775],
    [0, 0, 0, 0.8, Ease.OutBack]
]);
pointDefinitions.set("dnD", [
    [0, 0],
    [0, 0.5, Ease.OutCubic],
    [1, .75, Ease.OutCubic]
]);
pointDefinitions.set("dnS", [
    [1, 1, 1, 0],
    [1, 1, 1, 0.5],
    [1, 4, 1, 0.749, Ease.InExpo],
    [2, 0.5, 1, 0.75, Ease.OutExpo],
    [1, 1, 1, 0.8]
]);
function dropNextBeat(start: number, end: number) {
    customEvents.push(new AssignPathAnimation(start - 4, {
        Track: "dropNote",
        Dissolve: [
            [0, 0],
            [1, 0.25, Ease.OutCubic]
        ],
        DissolveArrow: [
            [0, 0],
            [1, 0.25, Ease.OutCubic]
        ]
    }));

    notes.select({ StartBeat: start, EndBeat: end }).forEach(n => {
        const d = n.CustomData;

        n.AddTrack("dropNote", `dropNote${Math.floor(n.Beat)}`);
        d.Offset = 1;
        d.NJS += 2;
        d.DisableNoteGravity = true;
        d.DisableNoteLook = true;
        d.SpawnEffect = false;
    });

    for (let i = start; i <= end; i++) {
        customEvents.push(new AnimateTrack(i - 4, {
            Track: `dropNote${i}`,
            Duration: 4,
            OffsetPosition: "dnP",
            Dissolve: "dnD",
            DissolveArrow: "dnD",
            Scale: "dnS"
        }));
    }
}

pointDefinitions.set("Di", [
    [0, 0],
    [1, 0.4, Ease.OutCirc]
]);
function randomPath(start: number, end: number) {
    notes.select({
        StartBeat: start,
        EndBeat: end
    }).forEach(n => {
        const d = n.CustomData
        const a = n.Animation;
    
        d.Offset = 1;
        d.DisableNoteGravity = true;
        d.DisableNoteLook = true;
        d.SpawnEffect = false;
    
        a.Dissolve = "Di";
        a.DissolveArrow = "Di";
        a.OffsetPosition = [
            [Random(0, 7, 1), Random(-7, 7, 1), 0, 0],
            [0, 0, 0, 0.475, Ease.OutCirc]
        ];
        a.OffsetWorldRotation = [
            [Random(-45, -15), Random(-45, 45), Random(-45, 45), 0],
            [0, 0, 0, 0.475, Ease.OutCirc]
        ];
        a.LocalRotation = [
            [Random(-180, 180), Random(-180, 180), Random(-180, 180), 0],
            [0, 0, 0, 0.475, Ease.OutCirc]
        ]
    });
}


//#endregion Functions

const SCRIPT_START_TIME = performance.now();

// #region MAP SCRIPT
// #region ENV
environment.push(
    new Environment({
        // ID: /Building|Columns|PS|Ring|Track(Construction|Mirror)|Spectro|FrontLights|Rotating|NeonTube|/,
        ID: /Building|PlayerSpace(Construction)|Columns|Back|Big|Small|Spectro|Neon|Track|Dust|Smoke/,
        LookupMethod: LookupMethod.Regex,
        Active: false
    }),
    new Environment({
        ID: "RotatingLasersPair\\..*L$",
        LookupMethod: "Regex",
        Active: true,
        Scale: [
            10,
            10,
            10
        ],
        LocalPosition: [
            -11.1,
            -2.8,
            32.6
        ],
        LocalRotation: [
            -61.8,
            -39.6,
            -11.5
        ]
    }),
    new Environment({
        ID: "RotatingLasersPair\\..*R$",
        LookupMethod: "Regex",
        Active: true,
        Scale: [
            10,
            10,
            10
        ],
        LocalPosition: [
            -20.2,
            3.6,
            25.3
        ],
        LocalRotation: [
            -12.2,
            -12.8,
            -70.2
        ]
    }),
    new Environment({
        ID: "RotatingLasersPair( \\(1\\))\\..*L$",
        LookupMethod: "Regex",
        Active: true,
        Scale: [
            10,
            10,
            10
        ],
        LocalPosition: [
            12.7,
            -1.7,
            14.3
        ],
        LocalRotation: [
            -70.6,
            2.1,
            -35.6
        ]
    }),
    new Environment({
        ID: "RotatingLasersPair( \\(1\\))\\..*R$",
        LookupMethod: "Regex",
        Active: true,
        Scale: [
            10,
            10,
            10
        ],
        LocalPosition: [
            16.7,
            -3.1,
            35.7
        ],
        LocalRotation: [
            12,
            22.5,
            -0.7
        ]
    }),
    new Environment({
        ID: "RotatingLasersPair( \\(2\\))\\..*L$",
        LookupMethod: "Regex",
        Active: true,
        Scale: [
            10,
            10,
            10
        ],
        LocalPosition: [
            19.6,
            3.9,
            38
        ],
        LocalRotation: [
            -88.3,
            23.3,
            -46.6
        ]
    }),
    new Environment({
        ID: "RotatingLasersPair( \\(2\\))\\..*R$",
        LookupMethod: "Regex",
        Active: true,
        Scale: [
            10,
            10,
            10
        ],
        LocalPosition: [
            -13.8,
            -4.2,
            27.9
        ],
        LocalRotation: [
            18.9,
            -22,
            -52.8
        ]
    }),
    new Environment({
        ID: "RotatingLasersPair( \\(3\\))\\..*L$",
        LookupMethod: "Regex",
        Active: true,
        Scale: [
            10,
            10,
            10
        ],
        LocalPosition: [
            12.8,
            4.3,
            19.5
        ],
        LocalRotation: [
            9.9,
            0.3,
            34.9
        ]
    }),
    new Environment({
        ID: "RotatingLasersPair( \\(3\\))\\..*R$",
        LookupMethod: "Regex",
        Active: true,
        Scale: [
            10,
            10,
            10
        ],
        LocalPosition: [
            24,
            4.5,
            20.3
        ],
        LocalRotation: [
            -32.7,
            14.3,
            27.8
        ]
    })
);

// for (let i = 0; i <= 3; i++) {
//     for (let j = -1; j <= 1; j += 2) {
//         const regex = new RegExp(`RotatingLasersPair${i !== 0 ? `( \\(${i}\\))` : ""}\\..*${j < 0 ? "L" : "R"}$`);
//         console.log(regex)
//         environment.push(
//             new Environment({
//                 ID: regex,
//                 LookupMethod: LookupMethod.Regex,
//                 LocalPosition: [Random(-25, 25, 1), Random(-5, 5, 1), Random(5, 50, 1)],
//                 LocalRotation: [Random(-90, 90, 1), Random(-45, 45, 1), Random(-90, 90, 1)],
//                 Scale: [10,10,10],
//                 Active: true
//             })
//         );
//     }
// }




// environment.push(
//     new Environment({
//         // ID: /Building|Columns|PS|Ring|Track(Construction|Mirror)|Spectro|FrontLights|Rotating|NeonTube|/,
//         ID: /Rotating/,
//         LookupMethod: LookupMethod.Regex,
//         Active: true
//     }));
// materials.set("sphereMat", new Material({
//     Color: [1,1,1],
//     Shader: MaterialShader.Standard,
//     ShaderKeywords: [],
//     Track: "sphereColor"
// }));
// for (let i = -30; i <= 30; i++) {
//     if (i == 0) continue;
//     environment.push(
//         new Environment({
//             Geometry: {
//                 Material: "sphereMat",
//                 Type: Geometry.SHAPE.Sphere
//             },
//             Scale: [.1, .1, .1],
//             Track: `sphere${i}`,
//             LookupMethod: null

//         })
//     );
//     customEvents.push(
//         new AnimeFromJapan(0, {
//             Track: `sphere${i}`,
//             Duration: 16,
//             Position: [
//                 [Random(5, 15, 1) * (i < 0 ? -1 : 1), Random(-7, 7, 1), Random(2, 20, 1), 0],
//                 [Random(5, 15, 1) * (i < 0 ? -1 : 1), Random(-7, 7, 1), Random(2, 20, 1), .5, Ease.Linear, "splineCatmullRom"],
//                 [Random(5, 15, 1) * (i < 0 ? -1 : 1), Random(-7, 7, 1), Random(2, 20, 1), 1, Ease.Linear, "splineCatmullRom"],
//             ]
//         })
//     );
// }

// #endregion ENV

// #region FAKENOTESDROP


noteExplosion(108);
noteExplosion(204);

pointDefinitions.set("1001", [1, 0, 0, 1]);
{
    const tempWalls = [];

    for (let i = 0; i <= 175; i++) {
        const fakeWall = new Obstacle()
        const d = fakeWall.CustomData;
        const a = fakeWall.Animation;
    
        fakeWall.Beat = 236 + i * 0.001;
        fakeWall.X = LineIndex.Left;
        fakeWall.Y = LineLayer.Bottom;
        fakeWall.Duration = 1;
        fakeWall.Height = 1;
        fakeWall.Width = Random(1, 3);
    
        d.Offset = 29;
        d.Uninteractable = true;

        a.OffsetWorldRotation = `neR${Random(1, 32)}`;
        a.DefinitePosition = `neDP${Random(1, 32)}`;
        a.LocalRotation = "neLR";
        a.Dissolve = `neD${Random(1, 32)}`;
        a.Scale = "555";
        a.Color = "1001";
    
        tempWalls.push(fakeWall);
    }

    fakeWalls.push(...tempWalls);
}


// #endregion FAKENOTESDROP


//#region NOTEMODS
notes.select({EndBeat: 11.9}).forEach(n => {
    n.AddTrack(`intro${n.Color}`);
    n.CustomData.Offset += 2;
});
const pathAnimation = new AssignPathAnimation();
for (let i = 0, j = -1; i <= 1; i++, j *= -1) {
    pathAnimation.Beat = 0;
    pathAnimation.Track = `intro${i}`;
    pathAnimation.OffsetWorldRotation = [
        [-45, 20 * j, 20 * j, 0],
        [0, 0, 0, 0.475, Ease.OutCirc]
    ];

    customEvents.push(pathAnimation);
}

notes.select({StartBeat: 12, EndBeat: 42}).forEach(n => {
    n.AddTrack("pulse");
});
customEvents.push(new AnimateTrack(12, {
    Track: "pulse",
    Duration: 1,
    Repeat: 26,
    Easing: Ease.OutExpo,
    Scale: [
        [2, 2, 2, 0],
        [1, 1, 1, 1]
    ],
    Dissolve: [
        [0.7, 0],
        [1, 1]
    ]
}));

notes.select({StartBeat: 40, EndBeat: 43}).forEach(n => {
    n.CustomData.Offset = 1;
    n.Animation.OffsetWorldRotation = [
        [0, 45 * (n.Color ? -1 : 1), 0, 0],
        [0, 0, 0, 0.475, Ease.OutCirc]
    ];
});


notes.select({StartBeat: 104, EndBeat: 108}).forEach(n => {
    n.CustomData.Track = "CullMask";
});
mainEffect(44, 103);

randomPath(104, 107.5);

notes.select({StartBeat: 107, EndBeat: 112}).forEach(n => n.CustomData.Track = "dissolveOutIn");
customEvents.push(new AnimateTrack(107, {
    Track: "dissolveOutIn",
    Duration: 1,
    Dissolve: [
        [1, 0],
        [0.1, 0.25, Ease.OutCubic],
        [0.1, 0.5],
        [1, 1, Ease.OutCubic]
    ],
    Scale: [
        [1, 1, 1, 0],
        [1.5, 0.8, 1, 0.25, Ease.OutCubic],
        [1.5, 0.8, 1, 0.5],
        [1, 1, 1, 0.75, Ease.OutCubic]
    ]
}));

dropNextBeat(108, 136);

mainEffect(140, 199);

randomPath(200, 203.5);

dropNextBeat(204, 231.99);
randomPath(232, 235);

dropNextBeat(236, 263.99);
randomPath(264, 268);

pointDefinitions.set("ltDA", [
    [0, 0],
    [1, 0.6, Ease.Step],
    [1, 0.875],
    [0, 1]
]);
pointDefinitions.set("ltD", [
    [0, 0],
    [.1, 0.5, Ease.Step],
    [.5, 0.875],
    [0, 1]
]);
notes.select({StartBeat: 268}).forEach(n => {
    pointDefinitions.set(`ltDP${n.X},${n.Y}`, [
        [n.X -2, n.Y, 0, 0],
        [n.X -2, n.Y, 1, .5],
        [n.X -2, n.Y, 100, 1]
    ]);
    pointDefinitions.set(`ltR${n.X},${n.Y}`, [
        [0, 0, 0, 0],
        [0, 0, 0, 0.5],
        [-Random(-20, 20), Random(-20, 20), Random(-20, 20), 1]
    ]);

    for (let i = 0; i <= 4; i += 1/6) {
        const dupe = n.Duplicate();
        const d = dupe.CustomData;
        const a = dupe.Animation;

        dupe.Beat += i;

        d.Track = "lt";
        d.Uninteractable = true;
        d.DisableNoteDebris = true;
        d.DisableNoteGravity = true;
        d.DisableNoteLook = true;
        d.SpawnEffect = false;
        d.Offset = 1;

        a.DefinitePosition = `ltDP${n.X},${n.Y}`;
        a.OffsetWorldRotation = `ltR${n.X},${n.Y}`;
        a.Dissolve = "ltD"
        a.DissolveArrow = "ltDA";

        fakeNotes.push(dupe);
    }
    
    customEvents.push(new AnimateTrack(260, {
        Track: "lt",
        Duration: 8,
        DissolveArrow: [
            [0, 0],
            [1, 1, Ease.Step]
        ],
        Dissolve: [
            [0, 0],
            [1, 1, Ease.Step]
        ]
    }));
});

//#endregion NOTEMODS

//#region VIVIFY

//#region animTrack

customEvents.push(
    new ApplyPostProcessing(72, {
        Asset: Assets.materials.blackwhite.path,
        Duration: 0.5,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[1,0],[1, 0.99],[0,1]]
        }]
    }),
    new ApplyPostProcessing(72, {
        Asset: Assets.materials.kick.path,
        Duration: 0.5,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0.25,0],[0.25, 0.99],[0,1]]
        }]
    }),
    new ApplyPostProcessing(72.719, {
        Asset: Assets.materials.blackwhite.path,
        Duration: 0.5,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[1,0],[1, 0.99],[0,1]]
        }]
    }),
    new ApplyPostProcessing(72.719, {
        Asset: Assets.materials.kick.path,
        Duration: 0.5,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0.25,0],[0.25, 0.99],[0,1]]
        }]
    }),
    new ApplyPostProcessing(73.469, {
        Asset: Assets.materials.blackwhite.path,
        Duration: 0.5,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[1,0],[1, 0.99],[0,1]]
        }]
    }),
    new ApplyPostProcessing(73.469, {
        Asset: Assets.materials.kick.path,
        Duration: 0.5,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0.25,0],[0.25, 0.99],[0,1]]
        }]
    })
)

customEvents.push(
new AnimeFromJapan(72.469, {
    Track: "FunnyThing",
    Duration: 0.125,
    Position: [
        [-69420,-69420,-69420,0]
    ]
    
}),
new AnimeFromJapan(72.719, {
    Track: "FunnyThing",
    Duration: 0.125,
    Position: [
        [0,0,0,0]
    ]
    
}),
new AnimeFromJapan(73.219, {
    Track: "FunnyThing",
    Duration: 0.125,
    Position: [
        [-69420,-69420,-69420,0]
    ]
    
}),
new AnimeFromJapan(73.469, {
    Track: "FunnyThing",
    Duration: 0.125,
    Position: [
        [0,0,0,0]
    ]
    
}),
new AnimeFromJapan(74, {
    Track: "FunnyThing",
    Duration: 0.125,
    Position: [
        [-69420,-69420,-69420,0]
    ]
    
})
);

customEvents.push(
new AnimeFromJapan(140, {
    Track: "bhthing",
    Duration: 1,
    Scale: [
    [0.4,0.4,0.4,0],
    [0.66,0.66,0.66,0.5, Ease.InOutCubic],
],
}));
//#endregion animTrack

//#region offsets

const IntroBassLineDefaultPos = [12.5,13.25,14,16.5,17.25,20.5,21.25,22,24.5,25.25,28.5,29.25,30,32.5,33.25,36.5,37.25,38]

for (let offset of IntroBassLineDefaultPos) {
    customEvents.push(
    new AnimeFromJapan(offset, {
        Track: "LightFlickerPos",
        Duration: 1,
        Position: [
            [0,0,0,0],
            [0,0,0,0.5],
            [-69420,-69420,-69420,0.51],
            [-69420,-69420,-69420,1]
        ]
    }))
}

const IntroBassLineRandomPos = [18,18.5,19,19.5,26,26.5,27,27.5,34,34.5,35,35.5]

for (let offset of IntroBassLineRandomPos) {
    customEvents.push(
    new AnimeFromJapan(offset, {
        Track: "LightFlickerPos",
        Duration: 1,
        Position: [
            [Random(-250, 250),Random(0,150),Random(-50,250),0.5],
            [-69420,-69420,-69420,0.51],
            [-69420,-69420,-69420,1]
        ]
    }))
}

for (let i = 13; i < 41; i++) {
    customEvents.push(
    new ApplyPostProcessing(i + 0.10, {
        Asset: Assets.materials.motionblur.path,
        Duration: 1,
        Properties: [{
            ID: "_MotionBlurLength",
            Type: "Float",
            Value: [[10,0],[0,0.75, Ease.OutExpo]]
        }]
    }))
}


//#endregion offsets

//#region prefabs
customEvents.push(
    new InstantiatePrefab(72, {
        Asset: Assets.prefabs.dropsceneanimation,
        Track: "FunnyThing",
        ID: "dropscenefunny"
    }),
    new InstantiatePrefab(108, {
        Asset: Assets.prefabs.dropscene,
        ID: "dropscene",
        Track: "dpkm"
    }),
    new InstantiatePrefab(108, {
        Asset: Assets.prefabs.dropscenefloor,
        ID: "dropscenefloor",
        Track: "df"
    }),
    new InstantiatePrefab(108, {
        Asset: Assets.prefabs.dropdirl,
        ID: "dropdir",
    }),
    new InstantiatePrefab(44, {
        Asset: Assets.prefabs.defaultdirl,
        ID: "defdir",
    }),
    new InstantiatePrefab(140, {
        Asset: Assets.prefabs.defaultdirl,
        ID: "defdir2",
    }),
    new InstantiatePrefab(108, {
        Asset: Assets.prefabs.drop,
        ID: "dropsys",
    }),
    // new InstantiatePrefab(0, {
    //     Asset: Assets.prefabs.defaultscene2,
    //     ID: "defaultscene2"
    // }),
    new InstantiatePrefab(140, {
        Asset: Assets.prefabs.bhthing,
        Track: "bhthing",
        ID: "bhthing"
    }),
    new InstantiatePrefab(204, {
        Asset: Assets.prefabs.dropscene,
        ID: "dropscene2",
        Track: "dpkm"
    }),
    new InstantiatePrefab(204, {
        Asset: Assets.prefabs.dropscenefloor,
        ID: "dropscenefloor2",
    }),
    new InstantiatePrefab(204, {
        Asset: Assets.prefabs.dropdirl,
        ID: "dropdir2",
    }),
    new InstantiatePrefab(204, {
        Asset: Assets.prefabs.drop,
        ID: "dropsys2",
    }),
    new InstantiatePrefab(236, {
        Asset: Assets.prefabs["particle system"],
        ID: "partys3",
    }),
    new InstantiatePrefab(236, {
        Asset: Assets.prefabs.dropscene,
        ID: "dropscene3",
        Track: "dpkm"
    }),
    new InstantiatePrefab(236, {
        Asset: Assets.prefabs.dropscenefloor,
        ID: "dropscenefloor3",
    }),
    new InstantiatePrefab(236, {
        Asset: Assets.prefabs.dropdirl,
        ID: "dropdir3",
    }),
    new InstantiatePrefab(12, {
        Asset: Assets.prefabs.lightflicker,
        Track: "LightFlickerPos",
        ID: "lightflicker"
    }),
    new InstantiatePrefab(268, {
        Asset: Assets.prefabs.credits,
        ID: "credit"
    }),
    new InstantiatePrefab(12, {
        Asset: Assets.prefabs.introscene,
        ID: "introscene"
    }),
    new InstantiatePrefab(0, {
        Asset: Assets.prefabs.defaultscene,
        ID: "defscene",
        Track: "defscenemove"
    }),
    new InstantiatePrefab(0, {
        Asset: Assets.prefabs["particle system"],
        ID: "partsys"
    }),
    new InstantiatePrefab(140, {
        Asset: Assets.prefabs["particle system"],
        ID: "partsys2"
    }),
    new InstantiatePrefab(140, {
        Asset: Assets.prefabs["particle system (1)"],
        ID: "partsysShoot"
    })
)
//#endregion prefabs

//#region blit

customEvents.push(
    new ApplyPostProcessing(0, {
        Asset: Assets.materials.chromaticabb.path,
        Duration: 108,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0.0012,0]]
        }]
    }),
    new ApplyPostProcessing(140, {
        Asset: Assets.materials.chromaticabb.path,
        Duration: 64,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0.0012,0]]
        }]
    }),
    new ApplyPostProcessing(0, {
        Asset: Assets.materials.vignette.path,
        Duration: 299.5,
        Properties: [{
            ID: "_VignetteIntensity",
            Type: "Float",
            Value: [[0.76,0]]
        }]
    }),
    new ApplyPostProcessing(12, {
        Asset: Assets.materials.kick.path,
        Duration: 1,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0.5,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(104, {
        Asset: Assets.materials.kick.path,
        Duration: 3,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0,0],[0.75,1, Ease.InExpo]]
        }
        ]
    }),
    new ApplyPostProcessing(104, {
        Asset: Assets.materials.vhs.path,
        Duration: 4,
        Properties: [{
            ID: "_ScanlineIntensity",
            Type: "Float",
            Value: [[0,0],[1,1, Ease.InCirc]]
        },
        {
            ID: "_DistortionAmount",
            Type: "Float",
            Value: [[0,0],[0.005,1, Ease.InCirc]]
        },
        {
            ID: "_NoiseIntensity",
            Type: "Float",
            Value: [[0,0],[-0.07,1, Ease.InCirc]]
        },
        {
            ID: "_ChromaticAberration",
            Type: "Float",
            Value: [[0,0],[0.005,1, Ease.InCirc]]
        }
        ]
    }),
    new ApplyPostProcessing(200, {
        Asset: Assets.materials.kick.path,
        Duration: 3,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0,0],[0.75,1, Ease.InExpo]]
        }
        ]
    }),
    new ApplyPostProcessing(200, {
        Asset: Assets.materials.vhs.path,
        Duration: 4,
        Properties: [{
            ID: "_ScanlineIntensity",
            Type: "Float",
            Value: [[0,0],[1,1, Ease.InCirc]]
        },
        {
            ID: "_DistortionAmount",
            Type: "Float",
            Value: [[0,0],[0.005,1, Ease.InCirc]]
        },
        {
            ID: "_NoiseIntensity",
            Type: "Float",
            Value: [[0,0],[-0.07,1, Ease.InCirc]]
        },
        {
            ID: "_ChromaticAberration",
            Type: "Float",
            Value: [[0,0],[0.005,1, Ease.InCirc]]
        }
        ]
    }),
    new ApplyPostProcessing(12, {
        Asset: Assets.materials.motionblur.path,
        Duration: 1,
        Properties: [{
            ID: "_MotionBlurLength",
            Type: "Float",
            Value: [[100,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(44, {
        Asset: Assets.materials.kick.path,
        Duration: 1,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0.5,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(44, {
        Asset: Assets.materials.motionblur.path,
        Duration: 1,
        Properties: [{
            ID: "_MotionBlurLength",
            Type: "Float",
            Value: [[100,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(75, {
        Asset: Assets.materials.kick.path,
        Duration: 1,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0.5,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(75, {
        Asset: Assets.materials.motionblur.path,
        Duration: 1,
        Properties: [{
            ID: "_MotionBlurLength",
            Type: "Float",
            Value: [[100,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(108, {
        Asset: Assets.materials.kick.path,
        Duration: 1,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[5,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(108, {
        Asset: Assets.materials.motionblur.path,
        Duration: 1,
        Properties: [{
            ID: "_MotionBlurLength",
            Type: "Float",
            Value: [[100,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(134, {
        Asset: Assets.materials.blackwhite.path,
        Duration: 6,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0,0],[1,1, Ease.InSine]]
        }]
    }),
    new ApplyPostProcessing(140, {
        Asset: Assets.materials.kick.path,
        Duration: 1,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[5,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(140, {
        Asset: Assets.materials.motionblur.path,
        Duration: 1,
        Properties: [{
            ID: "_MotionBlurLength",
            Type: "Float",
            Value: [[100,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(171, {
        Asset: Assets.materials.kick.path,
        Duration: 1,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[5,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(171, {
        Asset: Assets.materials.motionblur.path,
        Duration: 1,
        Properties: [{
            ID: "_MotionBlurLength",
            Type: "Float",
            Value: [[100,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(204, {
        Asset: Assets.materials.kick.path,
        Duration: 1,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[5,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(204, {
        Asset: Assets.materials.motionblur.path,
        Duration: 1,
        Properties: [{
            ID: "_MotionBlurLength",
            Type: "Float",
            Value: [[100,0],[0,0.75, Ease.OutExpo]]
        }]
    }),
    new ApplyPostProcessing(232, {
        Asset: Assets.materials.blackwhite.path,
        Duration: 3,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0,0],[1,1]]
        }]
    }),
    new ApplyPostProcessing(232, {
        Asset: Assets.materials.kick.path,
        Duration: 3,
        Properties: [{
            ID: "_Intensity",
            Type: "Float",
            Value: [[0,0],[0.75,1, Ease.InExpo]]
        }
        ]
    }),
    new ApplyPostProcessing(108.01, {
        Asset: Assets.materials.vhs.path,
        Duration: 32,
        Properties: [{
            ID: "_ScanlineIntensity",
            Type: "Float",
            Value: [[0.0125,0]]
        },
        {
            ID: "_DistortionAmount",
            Type: "Float",
            Value: [[0.00125,0]]
        },
        {
            ID: "_NoiseIntensity",
            Type: "Float",
            Value: [[-0.035,0]]
        },
        {
            ID: "_ChromaticAberration",
            Type: "Float",
            Value: [[0.00125,0]]
        }
        ]
    }),
    new ApplyPostProcessing(204, {
        Asset: Assets.materials.vhs.path,
        Duration: 32,
        Properties: [{
            ID: "_ScanlineIntensity",
            Type: "Float",
            Value: [[0.0125,0]]
        },
        {
            ID: "_DistortionAmount",
            Type: "Float",
            Value: [[0.00125,0]]
        },
        {
            ID: "_NoiseIntensity",
            Type: "Float",
            Value: [[-0.035,0]]
        },
        {
            ID: "_ChromaticAberration",
            Type: "Float",
            Value: [[0.00125,0]]
        }
        ]
    }),
    new ApplyPostProcessing(236, {
        Asset: Assets.materials.vhs.path,
        Duration: 32,
        Properties: [{
            ID: "_ScanlineIntensity",
            Type: "Float",
            Value: [[0.0125,0]]
        },
        {
            ID: "_DistortionAmount",
            Type: "Float",
            Value: [[0.00125,0]]
        },
        {
            ID: "_NoiseIntensity",
            Type: "Float",
            Value: [[-0.035,0]]
        },
        {
            ID: "_ChromaticAberration",
            Type: "Float",
            Value: [[0.00125,0]]
        }
        ]
    })
)

//#endregion blit

//#region destroy
customEvents.push(
    new DestroyObject(203, {
        ID: "defscene"
    }),
    new DestroyObject(107, {
        ID: "defdir"
    }),
    new DestroyObject(203, {
        ID: "defdir2"
    }),
    new DestroyObject(268, {
        ID: "dropscene"
    }),
    new DestroyObject(139.97, {
        ID: "partsys"
    }),
    new DestroyObject(140, {
        ID: "dropscenefloor"
    }),
    new DestroyObject(139.99, {
        ID: "dropscene"
    }),
    new DestroyObject(234.99, {
        ID: "dropscene2"
    }),
    new DestroyObject(267.99, {
        ID: "dropscene3"
    }),
    new DestroyObject(140, {
        ID: "dropdir"
    }),
    new DestroyObject(235, {
        ID: "dropscenefloor2"
    }),
    new DestroyObject(235, {
        ID: "dropdir2"
    }),
    new DestroyObject(268, {
        ID: "dropscenefloor3"
    }),
    new DestroyObject(268, {
        ID: "dropdir3"
    }),
    new DestroyObject(200, {
        ID: "dropsys"
    }),
    new DestroyObject(235, {
        ID: "dropsys2"
    }),
    new DestroyObject(76, {
        ID: "dropscenefunny"
    }),
    new DestroyObject(203, {
        ID: "partsys2"
    }),
    new DestroyObject(203, {
        ID: "partsysShoot"
    }),
    new DestroyObject(203, {
        ID: "bhthing"
    }),
    new DestroyObject(44, {
        ID: "introscene"
    }),
    new DestroyObject(50, {
        ID: "lightflicker"
    }),
    new DestroyObject(299, {
        ID: "credit"
    })
);


customEvents.push(
    new AnimateTrack(0, {
        Duration: 1,
        Track: "defscenemove",
        Position: [[0,0,0,0],[69420,69420,69420,0.1]]
    }),
    new AnimateTrack(44, {
        Duration: 1,
        Track: "defscenemove",
        Position: [[69420,69420,69420,0],[0,0,0,0.1]]
    }),
    new AnimateTrack(107, {
        Duration: 1,
        Track: "defscenemove",
        Position: [[0,0,0,0],[69420,69420,69420,0.1]]
    }),
    new AnimateTrack(140, {
        Duration: 1,
        Track: "defscenemove",
        Position: [[69420,69420,69420,0],[0,0,0,0.1]]
    })
);
//#endregion destroy

//#endregion VIVIFY


// #endregion MAP SCRIPT

Diff.Push({format: true});