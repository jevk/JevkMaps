import ease from "./consts/easing";
import SPLINE from "./consts/spline";
import Polygon from "./effects/polygon";
import AnimateTrack from "./events/animateTrack";
import AssignPathAnimation from "./events/assignPathAnimation";
import AssignTrackParent from "./events/assignTrackParent";
import filter from "./functions/filter";
import random from "./functions/random";
import track from "./functions/track";
import PointDefinition from "./map/pointDefinition";
import { definitionNames } from "./map/variables";
import Note, { notes } from "./objects/note";
import Wall from "./objects/wall";
import { vec4 } from "./types/vectors";

const trackParents:string[] = [];

const rCol: vec4 = [0.6588, 0.1254, 0.1254, 1];
const bCol: vec4 = [0.1254, 0.3921, 0.6588, 1];

export function bzzrt(time: number, duration: number) {
    if (!definitionNames.includes("bzScale")) {
        new PointDefinition("bzScale", [
            [random(3, 5), 1, 1, 0],
            [random(3, 5), 1, 1, 0.125, ease.InOut.Expo],
            [random(3, 4), 1, 1, 0.25, ease.InOut.Expo],
            [random(3, 4), 1, 1, 0.375, ease.InOut.Expo],
            [random(2, 3), 1, 1, 0.5, ease.InOut.Expo],
            [random(2, 3), 1, 1, 0.625, ease.InOut.Expo],
            [random(1, 2), 1, 1, 0.75, ease.InOut.Expo],
            [random(1, 2), 1, 1, 0.875, ease.InOut.Expo],
            [1, 1, 1, 1, ease.InOut.Expo]
        ]).push();
        new PointDefinition("bzDis", [
            [0.5, 0],
            [0.4, 0.25, ease.InOut.Elastic],
            [0.6, 0.5, ease.InOut.Elastic],
            [0.8, 0.75, ease.InOut.Elastic],
            [1, 1, ease.InOut.Elastic]
        ]).push();
        new PointDefinition("bzPos", [
            [random(-10, 10, 0) / 10, 0, 0, 0],
            [0, 0, 0, 0.125, ease.InOut.Expo],
            [random(-8, 8, 0) / 10, 0, 0, 0.25, ease.InOut.Expo],
            [0, 0, 0, 0.375, ease.InOut.Expo],
            [random(4, 4, 0) / 10, 0, 0, 0.5],
            [0, 0, 0, 0.625, ease.InOut.Expo],
            [random(-2, 2, 0) / 10, 0, 0, 0.75, ease.InOut.Expo],
            [0, 0, 0, 0.875, ease.InOut.Expo],
        ]).push();
    }
    const trackName = `bzrt${Math.round(time / 10)}`;
    track(filter(notes, time, time + duration + 2), trackName);
    new AnimateTrack(time, {
        track: trackName,
        duration: duration,
        scale: "bzScale",
        dissolve: "bzDis",
        position: "bzPos"
        
    }).push();
}

export function preDrop(start: number, end: number) {
    track(filter(notes, start, end + 4), "dissolveDeez")
    filter(notes, start, end).forEach((n: Note) => {
        const dupeNote = n.duplicate();
        const d = dupeNote.customData;
        const a = dupeNote.animation;

        n.customData.disableNoteGravity = true;


        d.track = `move${dupeNote.x, dupeNote.y}`;
        d.fake = true;
        d.interactable = false;
        d.disableNoteGravity = true;

        n.animation.dissolveArrow = [0];
        
        a.dissolve = [0];
        a.dissolveArrow = [
            [1, 0],
            [1, 0.4],
            [0, 0.48]
        ];

        notes.push(dupeNote);

        new AssignPathAnimation(n.time, {
            track: "dissolveDeez",
            position: [
                [random(-4, 4), random(-1, 3), 0, 0],
                [0, 0, 0, 0.45]
            ]
        }).push();

        new AnimateTrack(start - 1, {
            track: `move${dupeNote.x, dupeNote.y}`,
            duration: 1,
            position: [
                [0, 0, 0, 0],
                [random(-2, 2), 0, 0, 1]
            ]
        }).push();
    });
    new AssignPathAnimation(end + 0.001, {
        track: "dissolveDeez",
        position: [0, 0, 0]
    }).push();
}

export function zoomies(start: number, end: number, dir: number) {
    if (!definitionNames.includes("zoomDistraccRot")) {
        new PointDefinition("zoomDistraccRot", [
            [0, 0, 0, 0],
            [0, 15, 0, 1, ease.Out.Back]
        ]).push();
    }
    new AssignPathAnimation(start - 2, {
        track: "distracc",
        dissolve: [
            [1, 0],
            [0, 1, ease.Out.Cubic]
        ],
        dissolveArrow: [
            [1, 0],
            [0, 1, ease.Out.Cubic]
        ],
        color: [
            [1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0.4, ease.Out.Cubic]
        ]
    }).push();
        
    let f = filter(notes, start, end);
    f.forEach((n: Note) => {
        n.customData.offset = 2;

        new AnimateTrack(n.time, {
            track: `distracc${Math.floor(n.time)}`,
            duration: 1,
            rotation: "zoomDistraccRot"
        }).push();
    })
    f = filter(notes, start, end + 2);
    f.forEach((n: Note) => {
        for (let i = -4; i <= 4; i++) {
            const dupeNote = n.duplicate();
            const d = dupeNote.customData;
            d.track = [`distracc${Math.floor(n.time) - 1}`, "distracc"];
            d.rotation = [0, 15 * i * dir, -5];
            d.fake = true;
            d.interactable = false;

            notes.push(dupeNote);
        }
    })
}

export function sineWavePath(start: number, end: number) {
    const f = filter(notes, start, end)
    track(f, "sinePath")
    f.forEach((n: Note) => {
        n.customData.offset = 4;
    });
    for (let i = start, j = 0; i <= end; i += 1/12, j += 1/24) {
        new AssignPathAnimation(i, {
            track: "sinePath",
            position: [
                [Math.sin(i * j) * j * -1, 0, 0, 0],
                [Math.sin(i * j) * j, 0, 0, 0.25, ease.In.Circ],
                [0, 0, 0, 0.45, ease.Out.Circ]
            ]
        }).push();
    }
    new AssignPathAnimation(end, {
        track: "sinePath",
        position: [0, 0, 0]
    }).push();
}

export function arrowshit(start: number, end: number, amount: number, direction?: "ccw"|"cw") {
    let prev = 0;
    let side: number;
    const duration = end - start + 2;
    if (!definitionNames.includes("shitDis")) {
        new PointDefinition("shitDis", [
            [0, 0],
            [1, 1, ease.Out.Cubic]
        ]).push();
        new PointDefinition("shitScale", [
            [4, 4, 4, 0],
            [1, 1, 1, 1, ease.Out.Cubic]
        ]).push();
    }
    new AnimateTrack(start - 2, {
        track: "goofy",
        duration: duration,
        dissolve: [
            [0, 0],
            [0, 2/duration],
            [1, 3/duration, ease.Out.Quart],
            [1, (duration-1)/duration],
            [0, 1, ease.Out.Quart]
        ],
        dissolveArrow: [
            [0, 0],
            [0, 2/duration],
            [1, 3/duration, ease.Out.Quart],
            [1, (duration-1)/duration],
            [0, 1, ease.Out.Quart]
        ],
        position: [
            [0, 0, 0, 0],
            [0, 0, 0, 2/duration],
            [0, 4, 0, 3/duration, ease.Out.Quad],
            [0, 4, 0, (duration - 1)/duration],
            [0, 0, 0, 1, ease.Out.Quad]
        ]
    }).push();

    const f = filter(notes, start, end + 4);
    track(f, "goofyReal")
    f.forEach((n: Note) => {
        for (let i = 0; i < amount; i++) {
            const dupeNote = n.duplicate()
            const d = dupeNote.customData;

            d.fake = true;
            d.interactable = false;
            d.rotation = [0, 0, 360 / amount * i];
            d.disableSpawnEffect = true;
            d.disableNoteGravity = true;
            d.track = "goofy";

            notes.push(dupeNote)
        }
        if (n.time != prev && n.direction != Note.DIRECTION.DOT) {
            switch(direction) {
                case "ccw":
                    side = -1;
                    break;
                case "cw":
                    side = 1;
                    break;
                default:
                    let bruh = true;
                    while (bruh) {
                        side = random(-2, 2, 0);
                        if (side != 0) bruh = false;
                    }
                    break;
            }
            new AnimateTrack(n.time, {
                track: "goofy",
                duration: 1,
                easing: ease.Out.Quad,
                rotation: [
                    [0, 0, 0, 0],
                    [0, 0, 360 / amount * side, 1]
                ]
            }).push();
        }
        if (n.direction == Note.DIRECTION.DOT) {
            new AnimateTrack(n.time, {
                track: "goofyReal",
                duration: 1,
                dissolve: "shitDis",
                dissolveArrow: "shitDis"
            }).push();
            new AnimateTrack(n.time, {
                track: "goofy",
                duration: 1,
                scale: "shitScale"
            }).push();
        }
        prev = n.time;
    })
}

export function wallFuckery(start: number, end: number) {
    const duration = end - start;
    new AssignTrackParent(0, {
        parentTrack: "funnywallrot",
        childrenTracks: ["funnywall"]
    }).push()
    new AnimateTrack(start, {
        track: 'funnywall',
        duration: duration,
        dissolve: [
            [0, 0],
            [1, 1/duration, ease.In.Cubic],
            [1, (duration - 2) / duration],
            [0, 1, ease.Out.Cubic]
        ]
    }).push();

    for (let i = 0; i <= 3; i++) {
        new Wall({
            //Vanilla data
            time: start,
            duration: duration
        }, {
            //Custom data
            track: "funnywall",
            fake: true,
            interactable: false,
            rotation: [90 * i, 0, 0],
            scale: [10, 10, 10]
        }, {
            //Animation data
            dissolve: [
                [0, 0],
                [0, 1/duration],
                [1, 2/duration]
            ],
            scale: [100, 100, 0.1],
            definitePosition: [0, -100, 30],
            color: [
                [0, 0, 0, 600, 0],
                [0, 0, 0, 600, 62/64],
                [0, 0, 0, 0, 1, ease.Out.Expo]
            ]
        }).push();
    }
    
    for (let i = start; i <= end; i += 8) {
        new AnimateTrack(i, {
            track: "funnywallrot",
            duration: 8,
            rotation: "speen"
        }).push();
    }
}

export function jumpFromSide(start: number, end: number) {
    const r = filter(notes, start, end, {type: Note.TYPE.RED});
    const b = filter(notes, start, end, {type: Note.TYPE.BLUE});
    track(r, "jump0");
    track(b, "jump1");
    const all = [...r, ...b];

    all.forEach((n: Note) => {
        n.customData.offset = 1;
        n.customData.disableSpawnEffect = true;
    });

    if (!definitionNames.includes("disIn")) {
        new PointDefinition("disIn", [
            [0, 0],
            [1, 0.25, ease.Out.Quad]
        ]).push();

        for (let i = 0; i <= 1; i++) {
            const side = (i - 0.5) * 2;
            new AssignPathAnimation(start - 4, {
                track: `jump${i}`,
                easing: ease.In.Quad,
                position: [
                    [side * 2, 0, 0, 0],
                    [side, 1.5, 0, 0.125, SPLINE],
                    [0, 0, 0, 0.25, SPLINE]
                ],
                dissolve: "disIn"
            }).push();
        }
    }
}

export function spinPath(start: number, end: number) {
    const f = filter(notes, start, end);
    track(f, "spinPath");
    f.forEach((n: Note) => {
        n.customData.offset = 4;
    });
    new AssignPathAnimation(start - 16, {
        track: "spinPath",
        position: [
            [0, 0, 0, 0],
            [-2, 0, 0, 1/32, SPLINE],
            [-2, 0, 2, 2/32, SPLINE],
            [-2, 0, 2, 2/32+0.001],
            [-2, 0, 4, 3/32, SPLINE],
            [0, 0, 4, 4/32, SPLINE],
            [0, 0, 4, 4/32+0.001],
            [2, 0, 4, 5/32, SPLINE],
            [2, 0, 2, 6/32, SPLINE],
            [-2, 0, 2, 6/32+0.001],
            [-2, 0, 0, 7/32, SPLINE],
            [0, 0, 0, 8/32, SPLINE]
        ]
    }).push();
}

export function bounce(start: number, end: number, interval: number, side: 1|-1) {
    track(filter(notes, start, end), "bouncing")
    new AnimateTrack(start, {
        track: "bouncing",
        duration: end - start,
        easing: ease.InOut.Sine,
        rotation: [
            [0, 0, 0, 0],
            [0, 0, 10 * side, 0.5],
            [0, 0, 0, 1]
        ]
    }).push();
    for (let i = start; i <= end; i += interval) {
        new AnimateTrack(i, {
            track: "bouncing",
            duration: interval,
            position: [
                [0, -0.3, 0, 0],
                [0, 0.1, 0, 0.5, ease.Out.Sine],
                [0, -0.3, 0, 1, ease.In.Sine]
            ]
        }).push();
    }
}

export function randomX(start: number, end: number) {
    filter(notes, start, end).forEach((n: Note) => {
        n.customData.offset = 2;
        n.customData.disableNoteGravity = true;

        n.animation.position = [
            [random(-10, 10), 0, 0, 0],
            [random(-10, 10), 0, 0, 0.15, ease.In.Sine, SPLINE],
            [0, 0, 0, 0.35, ease.Out.Circ, SPLINE]
        ];
    })
}

export function moveToSide(start: number, end: number, direction: "l"|"r") {
    if (!definitionNames.includes("moveSider")) {
        new PointDefinition("moveSider", [
            [-15, 0, 0, 0],
            [-15, 0, 0, 6/8],
            [0, 0, 0, 7/8, ease.In.Cubic]
        ]).push();
        new PointDefinition("moveSidel", [
            [15, 0, 0, 0],
            [15, 0, 0, 6/8],
            [0, 0, 0, 7/8, ease.In.Cubic]
        ]).push();
        new PointDefinition("colorr", [
            [0.128, 0.128, 0.8, 1, 0],
            [1, 1, 1, 1, 0.5, ease.Out.Circ],
            [1, 1, 1, 1, 4/8],
            [0.128, 0.128, 0.8, 1, 1, ease.InOut.Sine],
        ]).push();
        new PointDefinition("colorl", [
            [0.8, 0.128, 0.128, 1, 0],
            [1, 1, 1, 1, 0.5, ease.Out.Circ],
            [1, 1, 1, 1, 4/8],
            [0.8, 0.128, 0.128, 1, 1, ease.InOut.Sine],
        ]).push();
    }
    new AnimateTrack(start, {
        track: `moveColor${direction}`,
        duration: 8,
        color: `color${direction}`,
        dissolve: [
            [1, 0],
            [0.5, 0.75],
            [1, 1]
        ],
        dissolveArrow: [
            [1, 0],
            [0.5, 0.75],
            [1, 1]
        ]
    }).push();
    filter(notes, start, end).forEach((n: Note) => {
        const d = n.customData;

        d.track = [`move${n.time}`, `moveColor${direction}`];
        d.offset = 4;

        new AnimateTrack(n.time - 9.5, {
            track: `move${n.time}`,
            duration: 8,
            position: `moveSide${direction}`
        }).push();  
    })
}

export function changePath(start: number, end: number, interval: number) {
    filter(notes, start, end + 2).forEach((n: Note) => {n.customData.offset = 2});
    track(filter(notes, start, end + 2, {type: 0}), "pathAlt0");
    track(filter(notes, start, end + 2, {type: 1}), "pathAlt1");
    for (let i = start; i <= end; i += interval) {
        if (i == end) {
            new AssignPathAnimation(i, {
                track: "pathAlt0",
                position: [0, 0, 0],
                rotation: [0, 0, 0]
            }).push();
            new AssignPathAnimation(i, {
                track: "pathAlt1",
                position: [0, 0, 0],
                rotation: [0, 0, 0]
            }).push();
            return;
        }
        new AssignPathAnimation(i, {
            track: "pathAlt0",
            position: [
                [random(-7, 7), random(-1, 7), 0, 0],
                [0, 0, 0, 0.45, ease.Out.Circ]
            ],
            rotation: [
                [random(-25, 0), random(-40, 40), random(-10, 10), 0],
                [0, 0, 0, 0.45, ease.Out.Circ]
            ]
        }).push();
        new AssignPathAnimation(i, {
            track: "pathAlt1",
            position: [
                [random(-7, 7), random(-1, 7), 0, 0],
                [0, 0, 0, 0.45, ease.Out.Circ]
            ],
            rotation: [
                [random(-25, 0), random(-40, 40), random(-10, 10), 0],
                [0, 0, 0, 0.45, ease.Out.Circ]
            ]
        }).push();
    }
}

export function wallDistort(start: number, end: number, flicker?: number) {
    const duration = end - start;
    new Wall({
        //Vanilla data
        time: start,
        duration: duration
    }, {
        //Custom data
        track: "wallDistortion",
        fake: true,
        interactable: false,
        scale: [10, 10, 10],
        color: [0, 0, 0, 500]
    }, {
        //Animation data
        scale: [100, 100, 0.1],
        definitePosition: [-50, -100, 15],
        localRotation: [
            [-10, 0, 0, 0],
            [10, 0, 0, 1]
        ]
    }).push();

    new AnimateTrack(start - 8, {
        track: "wallDistortion",
        duration: 9,
        dissolve: [
            [0, 0],
            [0, 8/9],
            [1, 1, ease.Out.Cubic]
        ]
    }).push();
    
    new AnimateTrack(end+0.001, {
        track: "wallDistortion",
        duration: 1,
        dissolve: [
            [1, 0],
            [0, 1, ease.Out.Cubic]
        ]
    }).push();
    if (flicker) {
        for (let i = start; i <= end; i += flicker) {
            new AnimateTrack(i , {
                track: "wallDistortion",
                duration: flicker,
                dissolve: [
                    [0, 0],
                    [1, 0.5, ease.Step]
                ]
            }).push();
        }
    }
}

export function hideArrow(start: number, end: number) {
    const f = filter(notes, start, end);
    f.forEach((n: Note) => {
        const dupeNote1 = n.duplicate();
        const d = dupeNote1.customData;
        d.track = "arrowFlip";
        d.fake = true;
        d.disableSpawnEffect = true;
        d.disableNoteGravity = true;
        const dupeNote2 = dupeNote1.duplicate();

        dupeNote2.customData.track = "rotatingArrowFlip"
        dupeNote2.customData.interactable = true;
        
        dupeNote2.animation.dissolveArrow = [0];
        if (n.direction == Note.DIRECTION.DOWN_LEFT || n.direction == Note.DIRECTION.DOWN_RIGHT || n.direction == Note.DIRECTION.UP_LEFT || n.direction == Note.DIRECTION.UP_RIGHT) {
            dupeNote2.customData.localRotation = [0, 0, 45];
        }
        dupeNote2.direction = Note.DIRECTION.DOT;

        dupeNote1.animation.dissolve = [0];

        new AnimateTrack(n.time, {
            track: "rotatingArrowFlip",
            duration: 0.25,
            easing: ease.Out.Quad,
            localRotation: [
                [0, 0, 0, 0],
                [0, 0, 90, 1]
            ]
        }).push();
        notes.push(dupeNote1, dupeNote2);
    });
    f.forEach((n: Note) => {
        const a = n.animation;
        a.dissolve = [0];
        a.dissolveArrow = [0];
    });

    const duration = end - start;

    new AnimateTrack(start, {
        track: "arrowFlip",
        duration: duration,
        localRotation: [
            [0, 0, 0, 0],
            [0, 180, 0, 1/duration, ease.InOut.Back],
            [0, 180, 0, (duration - 1)/duration],
            [0, 0, 0, 1, ease.InOut.Back]
        ],
        dissolveArrow: [
            [1, 0],
            [0, 1/duration, ease.Step],
            [1, (duration-1)/duration, ease.Step]
        ]
    }).push();
}

export function sidePath(start: number, end: number, interval: number, intensity: number) {
    const f = filter(notes, start, end + 2);
    track(f, "sidePath");
    f.forEach((n: Note) => {
        n.customData.offset = 2;
    });
    for (let i = start; i <= end; i += 1/16) {
        if (i == end) {
            new AssignPathAnimation(i, {
                track: "sidePath",
                rotation: [0, 0, 0]
            }).push();
            return;
        }
        new AssignPathAnimation(i, {
            track: "sidePath",
            rotation: [
                [0, intensity * Math.sin(i * Math.PI * interval), 0, 0],
                [0, 0, 0, 0.45, ease.Out.Circ]
            ]
        }).push();
    }
}

export function fourTracks(start: number, end: number, interval: number, rotationOffset: number) {
    new AnimateTrack(start - 2, {
        track: [`${start}quadTracks1`, `${start}quadTracks2`, `${start}quadTracks3`, `${start}quadTracks4`],
        duration: 2,
        dissolve: [
            [0, 0],
            [0, 0.5],
            [1, 1]
        ],
        dissolveArrow: [
            [0, 0],
            [0, 0.5],
            [1, 1]
        ]
    }).push();

    new AnimateTrack(start, {
        track: `${start}quadTracks1`,
        duration: 1,
        position: [0, 0, 0]
    }).push();
    new AnimateTrack(start, {
        track: `${start}quadTracks2`,
        duration: 1,
        position: [4, 0, 4]
    }).push();
    new AnimateTrack(start, {
        track: `${start}quadTracks3`,
        duration: 1,
        position: [0, 0, 8]
    }).push();
    new AnimateTrack(start, {
        track: `${start}quadTracks4`,
        duration: 1,
        position: [-4, 0, 4]
    }).push();

    new AnimateTrack(start, {
        track: `${start}ogTrack`,
        duration: 1,
        dissolve: [
            [1, 0],
            [0, 1]
        ],
        dissolveArrow: [
            [1, 0],
            [0, 1]
        ]
    }).push();

    const f = filter(notes, start, end);
    f.forEach((n: Note) => {
        n.customData.disableNoteGravity = true;
        for (let i = 1; i <= 4; i++) {
            const dupeNote = n.duplicate();
            const d = dupeNote.customData;
            const a = dupeNote.animation;


            // WYSI

            d.fake = true;
            d.interactable = false;
            d.disableNoteGravity = true;
            d.disableSpawnEffect = true;

            a.dissolve = [
                [1, 0],
                [1, 0.4],
                [0, 0.5]
            ];
            a.dissolveArrow = [
                [1, 0],
                [1, 0.4],
                [0, 0.5]
            ];

            d.track = [`${start}quadTracks${i}`, `wTo${dupeNote.type}`];
            notes.push(dupeNote);
        }
        if (!definitionNames.includes("quadRot1")) {
            new PointDefinition("quadRot1", [
                [0, 0, 0, 0],
                [6, 0, 0, 0.5, SPLINE],
                [6, 0, 6, 1, SPLINE]
            ]).push();
            new PointDefinition("quadRot2", [
                [6, 0, 12, 0],
                [6, 0, 6, 0.5, SPLINE],
                [0, 0, 6, 1, SPLINE]
            ]).push();
            new PointDefinition("quadRot3", [
                [0, 0, 12, 0],
                [-6, 0, 12, 0.5, SPLINE],
                [-6, 0, 4, 1, SPLINE]
            ]).push();
            new PointDefinition("quadRot4", [
                [-6, 0, 6, 0],
                [-6, 0, 0, 0.5, SPLINE],
                [0, 0, 0, 1, SPLINE]
            ]).push();

            new PointDefinition("quadDis1", [
                [0.5, 0],
                [1, 1]
            ]).push();
            new PointDefinition("quadDis2", [
                [1, 0],
                [0.5, 1]
            ]).push();
            new PointDefinition("quadDis3", [
                [0.5, 0],
                [1, 1]
            ]).push();
            new PointDefinition("quadDis4", [
                [1, 0],
                [1, 0.75],
                [0, 1]
            ]).push();
        }
    });
    for (let i = start + rotationOffset; i <= end; i += interval) {
        for (let j = 1; j <= 4; j++) {
            new AnimateTrack(i, {
                track: `${start}quadTracks${j}`,
                duration: interval,
                easing: ease.Out.Sine,
                position: `quadRot${j}`,
                dissolve: `quadDis${j}`,
                dissolveArrow: `quadDis${j}`
            }).push();
        }
        new AnimateTrack(i, {
            track: `${start}ogTrack`,
            duration: interval,
            dissolve: "genDis",
            dissolveArrow: "genDis"
        }).push();
    }
    track(f, `${start}ogTrack`)
}

export function uhhShitHappens(start: number, end: number) {
    if (!definitionNames.includes("bandScale")) {
        new PointDefinition("bandScale", [
            [10, 10, 10, 0],
            [0.5, 0.5, 0.5, 0.085, ease.InOut.Circ],
            [5, 5, 5, 0.17, ease.InOut.Circ],
            [1, 1, 1, 0.25, ease.InOut.Circ]
        ]).push();
        new PointDefinition("i", [
            [0, 0],
            [1, 0.3]
        ]).push();
        for (let i = 0; i <= 30; i++) {
            new PointDefinition(`randRot${i}`, [
                [(i - 15) / 2, (i - 15) * 2, i - 15, 0],
                [0, 0, 0, 0.25, ease.Out.Circ]
            ]).push();
            new PointDefinition(`bandPos${i}`, [
                [random(-10, 10), random(-2, 10), random(-10, 10), 0],
                [random(-10, 10), random(-2, 10), random(0, 10), 0.085, ease.In.Cubic, SPLINE],
                [random(-10, 10), random(-2, 10), random(-5, 5), 0.17, ease.Out.Cubic, SPLINE],
                [0, 0, 0, 0.25, ease.InOut.Circ]
            ]).push();
        }
    }
    const f = filter(notes, start, end);
    f.forEach((n: Note) => {
        const a = n.animation;

        n.customData.offset = 1.5;

        a.interactable = "i";
        a.localRotation = `randRot${random(0, 29, 0)}`;
        a.position = `bandPos${random(0, 29, 0)}`;
        a.scale = "bandScale";
        a.dissolve = "disIn";
    });
}

export function bombTornado(start: number, end: number) {
    if (!definitionNames.includes("tornadoPos")) {
        new PointDefinition("tornadoPos", [
            [0, -20, 10, 0],
            [0, 40, 10, 1]
        ]).push();
        new PointDefinition("genDis", [
            [0, 0],
            [1, 0.0625],
            [1, 0.75],
            [0, 1]
        ]).push();
    }
    new AnimateTrack(start - 16, {
        track: "bombTornado",
        duration: 0,
        dissolve: [0]
    }).push();
    new AnimateTrack(start - 1, {
        track: "bombTornado",
        duration: end - start + 2,
        dissolve: [
            [0, 0],
            [0, 1/(end - start + 2)],
            [1, 2/(end - start + 2)],
            [1, (end - start + 1)/(end - start + 2)],
            [0, 1]
        ]
    }).push();
    for(let i = 0; i <= 4; i++) {
        for(let j = start - 8; j <= end + 8; j += 1/2) {
            new Note({
                //Vanilla data
                time: j,
                type: Note.TYPE.BOMB
            }, {
                //Custom data
                track: "bombTornado",
                fake: true,
                disableSpawnEffect: true,
                interactable: false,
                scale: [5, 5, 0.1],
                color: [2, 2, 2, 2],
                rotation: [0, 90 * i + random(-35, 35, 0), 0],
                offset: 4
            }, {
                //Animation data
                definitePosition: "tornadoPos",
                dissolve: "genDis"
            }).push();
        }
    }
}

export function offsetPulse(start: number, end: number) {
    let previousTime = 0;
    filter(notes, start, end).forEach((n: Note) => {
        const dupeNote = n.duplicate();
        const d1 = n.customData;
        const a1 = n.animation;
        const d2 = dupeNote.customData;
        const a2 = dupeNote.animation;
        
        d1.disableNoteGravity = true;
        d1.disableSpawnEffect = true;
        d1.disableNoteLook = true;

        a1.dissolve = [0];

        d2.track = `offsetShit${n.type}`;
        d2.disableNoteGravity = true;
        d2.disableNoteLook = true;
        d2.fake = true;
        d2.interactable = false;

        a2.dissolveArrow = [0];
        
        notes.push(dupeNote);
        if (previousTime == n.time && n.time != start || n.time == start) {
            for (let i = 0; i <= 1; i++) {
                new AnimateTrack(n.time, {
                    track: `offsetShit${i}`,
                    duration: random(0.5, 1.5, 2),
                    position: [
                        [random(-2, 2), random(-1, 2), random(-0.5, 0), 0],
                        [0, 0, 0, 1]
                    ],
                    localRotation: [
                        [random(-45, 45), random(-45, 45), random(-45, 45), 0],
                        [0, 0, 0, 1]
                    ],
                    rotation: [
                        [0, random(-5, 5), random(-5, 5), 0],
                        [0, 0, 0, 1]
                    ]
                }).push();
            }
        }
        previousTime = n.time;
    })
}

export function pulseOnNote(start: number, end: number) {
    if (!definitionNames.includes("pScale")) {
        new PointDefinition("pScale", [
            [2, 2, 2, 0],
            [1, 1, 1, 1, ease.Out.Expo]
        ]).push();
    }
    let previousTime = 0;
    track(filter(notes, start, end + 2), "pulseScale")
    filter(notes, start, end).forEach((n: any) => {
        if ((n._time - previousTime) < (1/8)) {
            new AnimateTrack(n._time, {
                track: "pulseScale",
                duration: 1,
                scale: "pScale"
            }).push();
        }
        previousTime = n._time;
    })
}

export function randomDissolve(start: number, end: number) {
    track(filter(notes, start, end + 2), "dissolveThing");
    if (!definitionNames.includes("randDisDef")) {
        new PointDefinition("randDisDef", [
            [1, 0],
            [0, 0.5, ease.In.Quad],
            [1, 1, ease.Out.Quad]
        ]).push();  
        new PointDefinition("randDisDefArr", [
            [1, 0],
            [0.3, 0.5, ease.In.Quad],
            [1, 1, ease.Out.Quad]
        ]).push();
    }
    let increment = 1;
    for (let i = start; i <= end; i += increment) {
        increment = random(1, 4, 1)/3;
        new AnimateTrack(i, {
            track: "dissolveThing",
            duration: increment,
            dissolve: "randDisDef",
            dissolveArrow: "randDisDefArr"
        }).push();
    }
}

export function grid(start: number, end: number) {
    if (!definitionNames.includes("gridDis")) {
        new PointDefinition("gridDis", [
            [0, 0],
            [1, 0.125, ease.Out.Circ],
            [1, 0.42],
            [0, 0.45, ease.In.Sine]
        ]).push();
    }
    filter(notes, start - 4, end).forEach((n: Note) => {
        for (let i = -4; i <= 3; i++) {
            for (let j = -1; j <= 1; j++) {
                const dupeNote = n.duplicate();
                dupeNote.time += i / 100;
                const d = dupeNote.customData;
                const a = dupeNote.animation;

                d.fake = true;
                d.interactable = false;
                d.rotation = [45 * j, 45 * i, 0];
                d.scale = [1.2, 1.2, 1.2];
                d.track = "grid";
                
                a.dissolve = "gridDis";
                a.dissolveArrow = "gridDis"

                notes.push(dupeNote);
            }
        }
    });
}

export function osu(start: number, end: number, track?: string) {
    if (!definitionNames.includes("osuDis1")) {
        new PointDefinition("osuDis1", [       
            [0, 0],
            [0, 0.375],
            [1, 0.5, ease.InOut.Circ]
        ]).push();
        new PointDefinition("osuDis2", [
            [1, 0],
            [1, 0.75],
            [0, 1]
        ]).push();
        new PointDefinition("osuDis3", [
            [0, 0],
            [0, 0.125],
            [1, 0.25],
        ]).push();
        new PointDefinition("osuDis4", [
            [0, 0],
            [0, 0.25],
            [1, 0.375, ease.Out.Cubic],
            [0, 0.46875, ease.InOut.Circ]
        ]).push();
        new PointDefinition("osuPos", [
            [0, 0, -14, 0],
            [0, 0, 20, 0.5]
        ]).push();
        new PointDefinition("osuScale", [
            [1, 1, 1, 0],
            [0.25, 0.25, 1, 0.99],
            [1, 1, 1, 1, ease.Step]
        ]).push();
    }
    filter(notes, start, end).forEach((note: Note) => {
        const d = note.customData;
        const a = note.animation;
        let color: vec4

        switch (note.type) {
            case 0:
                color = rCol;
                break;
            case 1:
                color = bCol;
                break;
            default:
                color = [1, 1, 1, 0.5];
                break;
        }

        d.disableNoteGravity = true;
        d.disableNoteLook = true;
        d.disableSpawnEffect = true;
        d.offset = 2;
        d.njs = 14;
        d.color = color;

        a.dissolve = "osuDis1";
        a.dissolveArrow = "osuDis1";

        const dupeNote = note.duplicate()
        const d12 = dupeNote.customData;
        const a12 = dupeNote.animation;

        d12.fake = true;
        d12.interactable = false;
        d12.disableNoteGravity = false;
        d12.disableSpawnEffect = true;
        d12.disableNoteLook = true;
        a12.dissolve = "osuDis4";
        a12.dissolveArrow = "osuDis4";
        a12.definitePosition = [
            [0, (dupeNote.y - 1)/10, 10, 0]
        ];

        notes.push(dupeNote);

        let noteRotation: number;
        if (typeof note.direction !== 'undefined' && note.direction < 3 || note.direction == 8) {
            noteRotation = 0;
        } else noteRotation = 45;
        const parentTrackName = `osuParentIndex${note.x}layer${note.y}color${note.type}rot${noteRotation}`;
        const circleTrackName = `squareWallIndex${note.x}layer${note.y}color${note.type}rot${noteRotation}`;

        for (let i = 0; i <= 3; i++) {
            let wallTrack;
            if (!track) {
                wallTrack = circleTrackName;
            } else wallTrack = [circleTrackName, track];

            new Wall({
                //Vanilla data
                time: note.time - 1,
                duration: 4
            }, {
                //Custom data
                color: color,
                track: wallTrack,
                scale: [2.1, 0.05, 0.5],
                position: [-1.05, 0.85],
                rotation: [0, 0, 90 * i],
                fake: true,
                interactable: false,
                njs: 18,
                offset: 1
            }, {
                //Animation data
                definitePosition: [0, 0, 10],
                dissolve: "osuDis3"
            }).push();
        }

        if (!trackParents.includes(parentTrackName)) {
            new AssignTrackParent(note.time - 16, {
                parentTrack: parentTrackName,
                childrenTracks: [circleTrackName]
            }).push()
            let xy = {
                x: 0,
                y: 0
            }
            if (note.x) xy.x = note.x;
            if (note.y) xy.y = note.y;
            new AnimateTrack(note.time - 16, {
                track: parentTrackName,
                duration: 0,
                position: [
                    [xy.x - 1.5, xy.y + 1.25, 0, 0]
                ],
                localRotation: [0, 0, noteRotation]
            }).push();
        }

        new AnimateTrack(note.time - 2, {
            track: parentTrackName,
            duration: 1,
            scale: "osuScale"
        }).push();

        new AnimateTrack(note.time - 2, {
            track: circleTrackName,
            duration: 1,
            dissolve: "osuDis2"
        }).push();
    });
}

export function honestlyIdk(start: number, end: number) {
    if (!definitionNames.includes("fastDisIn")) {
        new PointDefinition("fastDisIn", [
            [0, 0],
            [1, 0.125, ease.Out.Cubic],
        ]).push();
        new PointDefinition("fakeDisInOut", [
            [0, 0],
            [1, 0.125, ease.Out.Cubic],
            [0, 0.425, ease.Out.Cubic]
        ]).push();
        new PointDefinition("0toWhite", [
            [...rCol, 0],
            [1, 1, 1, 1, 0.45, ease.Out.Cubic]
        ]).push();
        new PointDefinition("1toWhite", [
            [...bCol, 0],
            [1, 1, 1, 1, 0.45, ease.Out.Cubic]
        ]).push();
    }
    const f = filter(notes, start, end);
    f.forEach((n: Note) => {
        const nd = n.customData;
        const na = n.animation;
        nd.disableNoteLook = true;
        nd.disableSpawnEffect = true;
        nd.offset = 2;

        na.dissolve = "fastDisIn";
        na.dissolveArrow = "fastDisIn";
        na.position = [
            [random(-10, 10), random(-10, 10), 0, 0],
            [0, 0, 0, 0.425, ease.Out.Circ]
        ];
        na.rotation = [
            [random(-90, 90), random(-90, 90), random(-180, 180), 0],
            [0, 0, 0, 0.25, ease.Out.Circ]
        ];

        if (n.type == Note.TYPE.BOMB) {
            nd.color = [1, 1, 1, 1];
            na.position[1][3] = 0.25;
        }

        for (let i = 0; i <= 3; i++) {
            if (n.type == Note.TYPE.BOMB) break;
            const duplicate = n.duplicate();
            const dd = duplicate.customData;
            const da = duplicate.animation;

            dd.fake = true;
            dd.interactable = false;
            dd.disableNoteGravity = true;

            da.position = [
                [random(-10, 10), random(-10, 10), 0, 0],
                [0, 0, 0, 0.475, ease.Out.Circ]
            ];
            da.rotation = [
                [random(-90, 90), random(-90, 90), random(-180, 180), 0],
                [0, 0, 0, 0.25, ease.Out.Circ]
            ];
            da.dissolve = "fakeDisInOut";
            da.dissolveArrow = "fakeDisInOut";
            da.color = `${n.type}toWhite`;

            notes.push(duplicate)
        }
    });
}

export function flickerNotes(start: number, end: number) {
    let flickerSide = 1;
    track(filter(notes, start, end + 2, {type: Note.TYPE.RED}), "flicker-1");
    track(filter(notes, start, end + 2, {type: Note.TYPE.BLUE}), "flicker1");
    filter(notes, start, end).forEach((n: any) => {
        flickerSide *= -1;
        new AnimateTrack(n.time, {
            track: `flicker${flickerSide}`,
            duration: 0,
            dissolve: [0],
            dissolveArrow: [1]
        }).push();
        new AnimateTrack(n.time, {
            track: `flicker${flickerSide * -1}`,
            duration: 0,
            dissolve: [1],
            dissolveArrow: [0]
            
        }).push();
    })
}

export function diagonalUpWalls(time: number, duration: number, rotation: number) {
    for (let i = time; i <= time + duration; i += 1/16) {
        const rX = random(-10, 10);
        new Wall({
            time: i - 0.25,
            duration: 1,
        }, {
            color: [1, 0, 0, -69],
            track: "redUpWall",
            scale: [3/48, 20/48, 1/24],
            fake: true,
            interactable: false
        }, {
            definitePosition: [
                [rX, -250, 30, 0],
                [rX, 250, 30, 1]
            ],
            scale: [48, 48, 12],
            dissolve: "UpWallDis"
        }).push();
    }
    new AnimateTrack(time, {
        track: "redUpWall",
        duration: 2,
        rotation: [0, 0, rotation]
    }).push();
}

export function upWalls(time: number, duration: number, interval: number, rotation: boolean = false) {
    new PointDefinition("UpWallDis", [
        [0, 0],
        [0.8, 0.25/4, ease.In.Cubic],
        [0.8, 3.75/4],
        [0, 1, ease.Out.Cubic]
    ]).push();
    new PointDefinition("UpWallDefPos", [
        [2.5, -300, 20, 0],
        [2.5, 300, 20, 1]
    ]).push();

    for (let j = -1; j < 2; j++) {
        for (let i = time; i <= time + duration; i += interval) {
            new Wall({
                time: i - 0.5,
                duration: 2
            }, {
                color: [1, 1, 1, 69],
                track: `UpWall${j}`,
                scale: [2/24, 10/24, 2/24],
                fake: true,
                interactable: false
            }, {
                definitePosition: "UpWallDefPos",
                scale: [24, 24, 24],
                dissolve: "UpWallDis"
            }).push();
        }
        if (!rotation) break;
        new AnimateTrack(time, {
            duration: duration,
            track: `UpWall${j}`,
            rotation: [
                [0, 0, 0, 0],
                [10, 0, j * 35, 1]
            ]
        }).push();
    }
}

export function sideWalls(start: number, end: number, interval: number = 1/4) {
    for (let i = start, j = 1; i <= end; i += interval, j *= -1) {
        const yPos = random(-5, 5);
        new Wall({
            time: i - 0.25,
            duration: 1,
        }, {
            color: [1, 1, 1, 69],
            scale: [5/12, 1/12, 1/12],
            fake: true,
            interactable: false
        }, {
            definitePosition: [
                [250 * j, yPos, 25, 0],
                [250 * -j, yPos, 25, 1]
            ],
            scale: [12, 12, 12],
            dissolve: "UpWallDis"
        }).push();
    }
}

export function pulsePolygon(start: number, end: number, interval: number) {
    for (let i = 1, j = 1; i <= 8; i++, j *= -1) {
        new Polygon({
            time: start,
            duration: end - start - 1,
            amount: 6,
            color: [1, 1, 1, 69],
            radius: 8,
            h: 0.5,
            l: 0.5,
            position: [0, 0, i * 10],
            track: "pulsePolygon",
            animation: {
                dissolve: [
                    [0, 0],
                    [1, 0.5/(end - start)],
                    [1, (end - start - 0.5 - 1)/(end - start - 1)],
                    [0, 1]
                ],
                rotation: [
                    [0, 0, 0, 0],
                    [0, 0, j * 90, 1/8],
                    [0, 0, j * 180, 2/8],
                    [0, 0, j * 270, 3/8],
                    [0, 0, j * 360, 4/8],
                    [0, 0, j * 450, 5/8],
                    [0, 0, j * 540, 6/8],
                    [0, 0, j * 630, 7/8],
                    [0, 0, j * 720, 1]
                ]
            }
        }).push();
    }

    for (let i = start; i <= end; i += interval) {
        new AnimateTrack(i, {
            duration: 1,
            track: "pulsePolygon",
            scale: [
                [2, 2, 2, 0],
                [1, 1, 1, 1, ease.Out.Circ]
            ]
        }).push();
    }
}