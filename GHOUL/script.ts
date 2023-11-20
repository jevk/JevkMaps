import ease from "./consts/easing";
import Env from "./environment/environment";
import AnimateTrack from "./events/animateTrack";
import AssignTrackParent from "./events/assignTrackParent";
import { arrowshit, bombTornado, bounce, bzzrt, changePath, diagonalUpWalls, flickerNotes, fourTracks, grid, hideArrow, honestlyIdk, jumpFromSide, moveToSide, offsetPulse, osu, preDrop, pulseOnNote, pulsePolygon, randomDissolve, randomX, sidePath, sideWalls, sineWavePath, uhhShitHappens, upWalls, wallDistort, wallFuckery, zoomies } from "./functions";
import filter from "./functions/filter";
import random from "./functions/random";
import track from "./functions/track";
import Map from './map/mod';
import PointDefinition from "./map/pointDefinition";
import Note from "./objects/note";
import Material from "./environment/material";
import Geo from "./environment/geometry";
import { Difficulty } from "./map/initialize";
import { vec3, vec3anim, vec4 } from "./types/vectors";
import { notes } from "./objects/note";
import SPLINE from "./consts/spline";
import INote from "./interfaces/objects/note";
import Wall from "./objects/wall";
import AssignFogTrack from "./events/assignFogTrack";
import { lightEvents } from "./map/variables";

const INPUT = Difficulty.EXPERT_PLUS_LAWLESS;
const OUTPUT =Difficulty.EXPERT_PLUS_STANDARD;

const difficulty = Map.initialize(INPUT, OUTPUT, {
    njs: 19,    // E+ 19 E 18 H 16
    offset: 0  // E+ 0  E 0  H -1.5
});
// #region Noodle stuff below

const rCol: vec4 = [0.6588, 0.1254, 0.1254, 1];
const bCol: vec4 = [0.1254, 0.3921, 0.6588, 1];

notes.forEach((n: INote) => {
    n.customData.disableSpawnEffect = true;
    if (n.type == 0) n.customData.color = rCol;   // Forces the left notes colored red
    if (n.type == 1) n.customData.color = bCol;   // Forces the right notes colored blue

    n.animation.scale = [1, 1, 1];   // Force notes' scale to normal.
});

new AssignFogTrack(0, {
    track: "FOG",
}).push();

new AnimateTrack(0, {
    track: "FOG",
    duration: 0,
    startY: [-69727],
    offset: [0],
    attenuation: [0]
}).push();

new AssignTrackParent(0, {
    parentTrack: "introParent",     // Parenting the intro wall so I can spin it easier
    childrenTracks: ["IntroWall"]
}).push()

new PointDefinition("speen", [ // Point definition for spinning the intro wall
    [0, 0, 0, 0],
    [90, 0, 0, 0.25],
    [180, 0, 0, 0.5],
    [270, 0, 0, 0.75],
    [0, 0, 0, 1],
]).push();
    
for (let i = 0; i <= 84; i += 16) {
    new AnimateTrack(i, {
        track: "introParent",
        duration: 16,
        rotation: "speen"
    }).push();
}
for (let i = 0; i <= 3; i++)
new Wall({
    //Vanilla data
    time: 4,
    duration: 80
}, {
    //Custom data
    track: "IntroWall",
    fake: true,
    interactable: false,
    rotation: [90 * i, 0, 0],
    scale: [100, 10, 10]
}, {
    //Animation data
    scale: [100, 100, 100],
    definitePosition: [-50, -100, -150],
    color: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, -300, 10/80, ease.InOut.Quad],
        [0, 0, 0, -600, 1, ease.Out.Cubic]
    ]
}).push();

wallFuckery(84, 148)

arrowshit(148, 179.9, 7)
arrowshit(492, 499.9, 5)
arrowshit(508, 514.9, 5)
arrowshit(708, 739.9, 6)
arrowshit(971, 988, 4)
offsetPulse(972, 988)

jumpFromSide(740, 755);

sineWavePath(180, 208)

new PointDefinition("gridRot", [
    [-45, 0, 15, 0],
    [0, 0, 15, 0.25, ease.In.Sine],
    [45, 0, 15, 0.5, ease.Out.Sine],
    [0, 0, 15, 0.75, ease.In.Sine],
    [-45, 0, 15, 1, ease.Out.Sine]
]).push();
new PointDefinition("gridRotP",[
    [0, 0, 0, 0],
    [0, 90, 0, 0.25],
    [0, 180, 0, 0.5],
    [0, 270, 0, 0.75],
    [0, 0, 0, 1]
]).push();
new AssignTrackParent(0, {
    parentTrack: "gridParent",
    childrenTracks: ["grid"]
}).push();
grid(84, 147.5);
for (let i = 84; i <= 144; i += 8) {
    new AnimateTrack(i, {
        track: "gridParent",
        duration: 8,
        rotation: "gridRotP"
    }).push();
    new AnimateTrack(i, {
        track: "grid",
        duration: 8,
        rotation: "gridRot"
    }).push();
}

wallDistort(284, 286, 0.125)
wallDistort(300, 302, 0.125)
wallDistort(316, 318, 0.125)
wallDistort(332, 334, 0.125)
wallDistort(348, 350, 0.125)

hideArrow(294, 300)
hideArrow(302, 308)
bzzrt(292, 2)

hideArrow(310, 316)
hideArrow(318, 324)
bzzrt(308, 2)

hideArrow(326, 332)
hideArrow(334, 340)
bzzrt(324, 2)

hideArrow(342, 348)
hideArrow(350, 354)
bzzrt(340, 2)

honestlyIdk(356, 403);

//offsetPulse(492, 500)
//offsetPulse(508, 516)

randomDissolve(215, 223)
changePath(215, 223, 1)
sidePath(224, 227, 2, 40)

randomDissolve(231, 236)
changePath(231, 235.9, 1)
sidePath(236, 241.5, 2, 40)
sidePath(242, 244, 1, 20)

randomDissolve(247, 255)
changePath(247, 255, 1)
sidePath(256, 259, 2, 40)

changePath(263, 264, 0.25)
changePath(267, 268, 0.25)
changePath(271, 272, 0.25)

filter(notes, 660, 671.99).forEach((n: Note) => {
    changePath(n.time, n.time + 0.01, 0.25);
});

pulseOnNote(380, 387)
pulseOnNote(404, 405)
pulseOnNote(408, 409)

const f = filter(notes, 412, 420);
f.forEach((n: Note) => {
    n.customData.track = "uhShakeMaybe";
    n.customData.disableNoteGravity = true;
});

new AnimateTrack(412, {
    track: "uhShakeMaybe",
    duration: 8,
    scale: [
        [1, 1, 1, 0],
        [2, 2, 2, 1]
    ],
    dissolve: [
        [1, 0],
        [0.4, 1]
    ]
}).push();
f.forEach((n: Note) => {
    new AnimateTrack(n.time, {
        track: "uhShakeMaybe",
        duration: 0.25,
        position: [
            [random(-1, 1)/2, random(-1, 1)/2, 0, 0],
            [0, 0, 0, 1, ease.Out.Expo]
        ]
        
    }).push();
})

bombTornado(420, 452)
const anim: vec3anim = [[0, 0, 0, 0]];
for (let i = 1/32, j = 90; i <= 1; i += 1/32, j += 90) {
    if (j == 360) j = 0;
    anim.push([0, j, 0, i]);
}
new AnimateTrack(420, {
    track: "bombTornado",
    duration: 34,
    rotation: anim,
    easing: ease.Out.Quart
}).push();

track(filter(notes, 544, 548), "reappear")
for (let i = 544; i <= 546; i++) {
    new AnimateTrack(i, {
        track: "reappear",
        duration: 0.5,
        dissolve: [
            [0, 0],
            [1, 1, ease.Step]
        ],
        dissolveArrow: [
            [0, 0],
            [1, 1, ease.Step]
        ]
    }).push();
}

randomX(452, 480)
track(filter(notes, 452, 484, {type: Note.TYPE.RED}), "colorShitR")
track(filter(notes, 452, 484, {type: Note.TYPE.BLUE}), "colorShitB")

new AnimateTrack(452, {
    track: "colorShitR",
    duration: 484 - 452,
    color: [
        [...rCol, 0],
        [1, 1, 1, 1, 1]
    ]
}).push();
new AnimateTrack(452, {
    track: "colorShitB",
    duration: 484 - 452,
    color: [
        [...bCol, 0],
        [1, 1, 1, 1, 1]
    ]
}).push();

new AnimateTrack(544, {
    track: "wTo0",
    duration: 18,
    easing: ease.In.Sine,
    color: [
        [1, 1, 1, 1, 0],
        [1, 1, 1, 1, 2/18],
        [...rCol, 1]
    ],
    dissolve: [
        [0.2, 0],
        [0.2, 2/18],
        [1, 1]
    ]
}).push();

new AnimateTrack(544, {
    track: "wTo1",
    duration: 18,
    easing: ease.In.Sine,
    color: [
        [1, 1, 1, 1, 0],
        [1, 1, 1, 1, 2/18],
        [...bCol, 1]
    ],
    dissolve: [
        [0.2, 0],
        [0.2, 2/18],
        [1, 1]
    ]
}).push();

new AnimateTrack(548, {
    track: [`548quadTracks1`, `548quadTracks2`, `548quadTracks3`, `548quadTracks4`],
    duration: 1,
    scale: [
        [0, 0, 0, 0],
        [2, 2, 2, 0.75, ease.Out.Back],
        [1, 1, 1, 1, ease.InOut.Cubic]
    ]
}).push();
fourTracks(548, 579.5, 2, 1)
fourTracks(580, 581.5, 0.5, 0)
fourTracks(582, 595.5, 2, 1)
fourTracks(596, 603.5, 0.75, 0)

track(filter(notes, 604, 612, {type: Note.TYPE.RED}), "whiteDissolveR");
track(filter(notes, 604, 612, {type: Note.TYPE.BLUE}), "whiteDissolveB");
new AnimateTrack(604, {
    track: "whiteDissolveR",
    duration: 4,
    color: [
        [...rCol, 0],
        [1, 1, 1, 1, 1]
    ],
    dissolve: [
        [1, 0],
        [0.1, 1, ease.In.Cubic]
    ]
}).push();
new AnimateTrack(604, {
    track: "whiteDissolveB",
    duration: 4,
    color: [
        [...bCol, 0],
        [1, 1, 1, 1, 1]
    ],
    dissolve: [
        [1, 0],
        [0.1, 1, ease.In.Cubic]
    ]
}).push();
new AnimateTrack(608, {
    track: "whiteDissolveR",
    duration: 4,
    color: [
        [1, 1, 1, 1, 0],
        [...rCol, 0.25]
    ],
    dissolve: [
        [0, 0],
        [1, 1, ease.Out.Cubic]
    ]
}).push();
new AnimateTrack(608, {
    track: "whiteDissolveB",
    duration: 4,
    color: [
        [1, 1, 1, 1, 0],
        [...bCol, 0.25]
    ],
    dissolve: [
        [0, 0],
        [1, 1, ease.Out.Cubic]
    ]
}).push();

preDrop(213, 214)
preDrop(229, 230)
preDrop(245, 246)

preDrop(613, 614)
preDrop(629, 630)
preDrop(645, 646)

randomDissolve(614, 623)
changePath(614, 623, 1)
sidePath(624, 627, 2, 40)
sidePath(628, 630, 1, 20)

randomDissolve(631, 636)
changePath(631, 636, 1)
sidePath(636, 636.9, 2, 30)
sidePath(637, 637.25, 4, 10)
sidePath(637.5, 639, 2, 30)
sidePath(639.5, 639.9, 4, 10)
sidePath(640, 642, 2, 20)

randomDissolve(647, 655)
changePath(647, 655, 1)
sidePath(656, 659, 2, 40)

new Note({
    //Vanilla data
    time: 676,
    type: 1
}, {
    //Custom data
    offset: 2,
    fake: true,
    interactable: false,
    disableNoteGravity: true,
    disableNoteLook: true,
    disableSpawnEffect: true,
    color: [0.1, 0.1, 0.1, 1],
    scale: [15, 15, 15],
}, {
    //Animation data
    scale: [15, 15, 15],
    localRotation: [random(-10, 10), random(-10, 10), random(-180, 180)],
    dissolve: [
        [0, 0],
        [0, 0.5],
        [1, 0.7, ease.Out.Expo],
        [0, 0.75]
    ],
    dissolveArrow: [
        [0, 0],
        [0, 0.5],
        [1, 0.7, ease.Out.Expo],
        [0, 0.75]
    ],
    definitePosition: [
        [0, -20, 22, 0],
        [0, -20, 22, 0.5],
        [0, 10, 22, 0.75, ease.Out.Circ],
        [0, -1000, 0, 0.76, ease.Step]
    ]
}).push();

moveToSide(678, 687, "r");
moveToSide(695, 698, "l");
moveToSide(700, 703, "l");
zoomies(678, 687.5, -1);    // It's the part where the notes go like zoomies from side YEP
zoomies(695, 698, 1);

changePath(698, 700, 0.333);

zoomies(700, 703, 1);
randomX(688, 691);          // Randomizes the X path of the notes
changePath(691.2, 692, 0.25)

track(filter(notes, 708, 710), "flickerThing")  // Assign the track to notes
new AnimateTrack(707, {                         // Flicker the track
    track: "flickerThing",
    duration: 1,
    dissolve: [
        [0, 0],
        [1, 0.125, ease.Step],
        [0, 0.25],
        [1, 0.375, ease.Step],
        [0, 0.5],
        [1, 0.625, ease.Step],
        [0, 0.75],
        [1, 0.875, ease.Step],
    ],
    dissolveArrow: [
        [0, 0],
        [1, 0.125, ease.Step],
        [0, 0.25],
        [1, 0.375, ease.Step],
        [0, 0.5],
        [1, 0.625, ease.Step],
        [0, 0.75],
        [1, 0.875, ease.Step],
    ]
}).push();

bounce(772, 788, 2, 1);     // VeggieTales
uhhShitHappens(788, 803.9); // It's some random function that makes the notes go crazy
bounce(804, 820, 2, -1);    // VeggieTales

filter(notes, 756, 780).forEach((n: Note) => {
    track([n], `noteToWhite${n.type}`);
});
new AnimateTrack(756, {
    track: "noteToWhite0",
    duration: 14,
    color: [
        [...rCol, 0],
        [1, 1, 1, 1, 8/14],
        [1, 1, 1, 1, 13.5/14],
        [...rCol, 1]
    ]
}).push();
new AnimateTrack(756, {
    track: "noteToWhite1",
    duration: 14,
    color: [
        [...bCol, 0],
        [1, 1, 1, 1, 8/14],
        [1, 1, 1, 1, 13.5/14],
        [...bCol, 1]
    ]
}).push();

// Set the last half of the stream to the osu to be fake notes, so they don't interact with the player
filter(notes, 842, 843.99).forEach((n: Note) => {
    const d = n.customData;

    d.fake = true; 
    d.interactable = false;
});
track(filter(notes, 841, 843.99), "dissolveFakeNotes");

// Fade out the fake notes
new AnimateTrack(841, {
    track: "dissolveFakeNotes",
    duration: 1,
    easing: ease.Out.Cubic,
    dissolve: [
        [1, 0],
        [0, 1],
    ],
    dissolveArrow: [
        [1, 0],
        [0, 1],
    ]
}).push();

// Osu part, where the notes spawn in and the approach square indicates the hit timings
osu(844, 899.5)
osu(908, 928, "dissolveOsu")
track(filter(notes, 916, 926), "dissolveOsu")
new AnimateTrack(916, {
    track: "dissolveOsu",
    duration: 9,
    dissolve: [
        [1, 0],
        [0.2, 8/9],
        [1, 8.5/9, ease.Out.Circ],
        [1, 1]
    ],
    dissolveArrow: [
        [1, 0],
        [0.2, 8/9],
        [1, 8.5/9, ease.Out.Circ],
        [1, 1]
    ]
}).push();

flickerNotes(932, 964);
uhhShitHappens(932, 964);



// #endregion Noodle stuff above

//#region Environment stuffs

new Env({
    id: /Crow|Zomb|Castle|Bat|Gate|NeonTube(L|R)|CoreLighting|GlowLine|Rotating|Tree|Ground|Grave|Fence|Tomb|Moon/,
    lookupMethod: "Regex",
    active: false
}).push();

new Material("PureWhite", {
    color: [2, 2, 2, 1],
    shader: Material.SHADER.STANDARD,
    shaderKeywords: ["_EMISSION"],
}).push();

const children = [];
for (let i = 0; i <= 100; i ++) {
    children.push(`envoTrack${i}`);
}
new AssignTrackParent(0, {
    parentTrack: "IntroParticles",
    childrenTracks: children
}).push();

for (let i = 0, side = 1; i <= 100; i++, side *= -1) {
    const initialZ = random(10, 40);
    const scale = random(5, 20) / 40;
    const secondPos: vec3 = [random(8, 20) * side, random(0, 10), initialZ + random(-3, 3)];

    new Geo({
        geometry: {
            material: "PureWhite",
            type: "Sphere",
        },
        track: `envoTrack${i}`,
        position: [0, -10, initialZ],
        scale: [scale, scale, scale],
    }).push();

    const first = new AnimateTrack(0, {
        track: `envoTrack${i}`,
        duration: 100,
        easing: ease.Out.Cubic,
        position: [
            [random(4, 10) * side, random(-20, -10), initialZ, 0],
            [...secondPos, 0.5, SPLINE],
            [secondPos[0] + random(-10, 15) * side, secondPos[1]+ random(-3, 3), secondPos[2] + random(-15, 15), 1, SPLINE]
            
        ]
    });
    const pos = first.data.position[2];
    first.push();
    new AnimateTrack(79, {
        track: `envoTrack${i}`,
        duration: 4,
        position: [
            [pos[0], pos[1], pos[2], 0],
            [(pos[0] + 10*side) * 100, pos[1] + random(0, 3), pos[2] + random(-3, 3), 1, ease.In.Circ]
        ]
    }).push();
}

new AnimateTrack(79, {
    track: "IntroParticles",
    duration: 4,
    scale: [
        [1, 1, 1, 0],
        [20, 0.5, 1, 1, ease.In.Circ]
    ]
}).push();

lightEvents.length = 0;
// lightEvents.push({
//     time : 0,
//     type : 1,
//     value : 5,
//     float : 1,
//     data : {
//       color : [
//         0.867,
//         0.958,
//         1,
//         0.5
//       ]
//     }
// })


// #endregion Environment stuffs

// #region Walls

sideWalls(204, 208);


new Wall({
    time: 212,
    duration: 4
}, {
    color: [1, 1, 1, 69],
    scale: [2/24, 2/24, 0.5/24],
    fake: true,
    interactable: false
}, {
    definitePosition: [
        [1.5, -50, 30, 0],
        [1.5, 5, 30, 1/4, ease.Out.Cubic]
    ],
    localRotation: [
        [0, 0, 45, 0],
        [0, 0, 45, 1/4],
        [0, 0, 90 + 45, 1.125/4],
        [0, 0, 180 + 45, 1.25/4],
        [0, 0, 270 + 45, 1.375/4],
        [0, 0, 45, 1.5/4],
        [0, 0, 90 + 45, 1.625/4],
        [0, 0, 180 + 45, 1.75/4],
        [0, 0, 270 + 45, 1.875/4],
        [0, 0, 45, 2/4]
    ],
    scale: [
        [24, 24, 24, 0],
        [24, 24, 24, 1/4],
        [120, 120, 24, 2/4]
    ],
    dissolve: [
        [0, 0],
        [1, 0.125/4, ease.In.Cubic],
        [1, 1/4],
        [0, 2.25/4, ease.Out.Quad]
    ]
}).push();


diagonalUpWalls(292, 2, -22.5)
upWalls(300, 2, 1/8);
diagonalUpWalls(308, 2, 22.5);
upWalls(316, 2, 1/8);
diagonalUpWalls(324, 2, -22.5);
upWalls(332, 2, 1/8);
diagonalUpWalls(340, 2, 22.5);
upWalls(348, 2, 1/8);

for (let i = 0; i < 16; i++)
new Wall({
    time: 418,
    duration: 4,
}, {
    color: [1, 1, 1, 69],
    scale: [50/2000, 50/2000, 0.5/10],
    rotation: [0, 22.5 * i, 0],
    fake: true,
    interactable: false
}, {
    definitePosition: [30, -50, 30],
    scale: [2000, 2000, 10],
    dissolve: [
        [0, 0],
        [0, 1.5/4],
        [1, 2/4, ease.In.Expo],
        [0, 2.25/4, ease.Out.Expo]
    ]
}).push();


upWalls(468, 12, 1/2, true);

sideWalls(540, 544);

diagonalUpWalls(672, 4, 30)

new PointDefinition("SwipeWallL", [
    [300, 0, 40, 0],
    [-300, 0, 40, 1]
]).push();
new PointDefinition("SwipeWallR", [
    [-300, 0, 40, 0],
    [300, 0, 40, 1]
]).push();
for (let i = 679; i <= 687.5; i+=1/2) {
    new Wall({
        time: i,
        duration: 0.5,
    }, {
        scale: [20/480, 10/240, 0.5/10],
        color: [1, 0, 1, -69],
        fake: true,
        interactable: false
    }, {
        scale: [480, 240, 10],
        definitePosition: "SwipeWallL",
        dissolve: "UpWallDis"
    }).push();
}
for (let i = 695; i <= 703.5; i+=1/2) {
    new Wall({
        time: i,
        duration: 0.5,
    }, {
        scale: [20/480, 10/240, 0.5/10],
        color: [1, 0, 1, -69],
        fake: true,
        interactable: false
    }, {
        scale: [480, 240, 10],
        definitePosition: "SwipeWallR",
        dissolve: "UpWallDis"
    }).push();
}


for (let i = 740; i <= 768; i+= 1/16) {
    new Wall({
        time: i,
        duration: 8
    }, {
        color: [2, 2, 2, 727], 
        track: "particleTrack",
        scale: [0.1, 0.1, 0.1],
        rotation: [0, random(-180, 180), 0],
        fake: true,
        interactable: false
    }, {
        definitePosition: [
            [0, -5, random(5, 15), 0],
            [0, random(5, 10), random(5, 15), 1],
        ],
        rotation: [
            [0, 0, 0, 0],
            [0, random(-90, 90), 0, 1]
        ],
        localRotation: [
            [random(-180, 180), random(-180, 180), random(-180, 180), 0],
            [random(-180, 180), random(-180, 180), random(-180, 180), 1]
        ],
        dissolve: [
            [0, 0],
            [1, 1/8],
            [1, 7/8],
            [0, 1]
        ]
    }).push();
}
new AnimateTrack(768, {
    track: "particleTrack",
    duration: 1,
    dissolve: [
        [1, 0],
        [0, 1]
    ]
}).push();

pulsePolygon(772, 786, 2);
pulsePolygon(804, 818, 2);

upWalls(827, 836 - 827, 1/4, true);
upWalls(836, 0.5, 1/4);
upWalls(838, 0.5, 1/4);
upWalls(840, 2, 1/4, true);


// #endregion Walls


//#endregion

Map.finalize(difficulty, {
    formatting: false,
    roundNumbers: 4,
    showModdedStats: {
        notes: true,
        customEvents: true,
        pointDefinitions: true,
        showEnvironmentStats: true
    },
    requirements: [
        "Noodle Extensions",
        "Chroma"
    ],
    settings: {
        playerOptions: {
            advancedHud: true,
            environmentEffectsFilterDefaultPreset: "AllEffects",
            environmentEffectsFilterExpertPlusPreset: "AllEffects",
            leftHanded: false
        },
        graphics: {
            mainEffectGraphicsSettings: 1,
            screenDisplacementEffectsEnabled: true,
            maxShockwaveParticles: 0,
            mirrorGraphicsSettings: 0,
            smokeGraphicsSettings: false
        },
        chroma: {
            disableChromaEvents: false,
            disableEnvironmentEnhancements: false,
            disableNoteColoring: false
        },
        countersPlus: {
            mainEnabled: false
        },
        colors: {
            overrideDefaultColors: true
        },
        environments: {
            overrideEnvironments: false
        }
    }
});