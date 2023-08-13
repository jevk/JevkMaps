import ease from "./consts/easing";
import SPLINE from "./consts/spline";
import AnimateTrack from "./events/animateTrack";
import AssignTrackParent from "./events/assignTrackParent";
import filter from "./functions/filter";
import random from "./functions/random";
import track from "./functions/track";
import PointDefinition from "./map/pointDefinition";
import { definitionNames } from "./map/variables";
import Note, { notes } from "./objects/note";
import Wall from "./objects/wall";
import { vec4 } from "./types/vectors";

const rCol: vec4 = [1, 1/8, 1/8, 1];
const bCol: vec4 = [1/8, 1/8, 1, 1];
const trackParents: string[] = [];
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
        d12.disableNoteGravity = true;
        d12.disableSpawnEffect = true;
        d12.disableNoteLook = true;
        a12.dissolve = "osuDis4";
        a12.dissolveArrow = "osuDis4";
        a12.definitePosition = [
            [0, dupeNote.y - 1.5, 10, 0]
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
                time: note.time,
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

        new AnimateTrack(note.time - 1, {
            track: parentTrackName,
            duration: 1,
            scale: "osuScale"
        }).push();

        new AnimateTrack(note.time - 1, {
            track: circleTrackName,
            duration: 1,
            dissolve: "osuDis2"
        }).push();
    });
}
export function flickerNotes(start: number, end: number) {
    let flickerSide = 1;
    let previoustime = 0;
    track(filter(notes, start, end + 2, {type: Note.TYPE.RED}), "flicker-1");
    track(filter(notes, start, end + 2, {type: Note.TYPE.BLUE}), "flicker1");
    filter(notes, start, end).forEach((n: Note) => {
        if (n.time - previoustime > 0.2) {
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
        }
        previoustime = n.time;
    })
}

export function yippee(start: number, end: number, fakesTrack: string = "fakes") {
    new PointDefinition("haiii :3", [
        [0, 0],
        [1, 0.1, ease.In.Cubic],
        [0, 0.4, ease.Out.Circ],
    ]).push();

    new AnimateTrack(0, {
        track: fakesTrack, 
        duration: start + 1,
        dissolve: [
            [0, 0],
            [0, start / (start + 1)],
            [1, 1, ease.In.Expo],
        ]
    }).push();
    
    filter(notes, start, end).forEach((note: Note) => {
        note.customData.offset = 4;
        note.animation.position = [
            [random(-20, 20), random(-1, 20), 0, 0],
            [random(-20, 20), random(-1, 20), 0, 0.125, ease.In.Circ, SPLINE],
            [0, 0, 0, 0.45, ease.Out.Circ, SPLINE],
        ];
        note.animation.rotation = [
            [random(-100, 100), random(-45, 45), random(-90, 90), 0],
            [0, 0, 0, 0.45, ease.Out.Circ]
        ];
    
        for (let i = 1; i <= 8; i++) {
            const dupe = note.duplicate();
            const data = dupe.customData;
            const anim = dupe.animation;

            data.offset = i / 2;

            anim.position = [
                [random(-10, 10), random(-10, 10), 0, 0],
                [random(-10, 10), random(-10, 10), 0, 0.125, ease.In.Circ, SPLINE],
                [0, 0, 0, 0.45, ease.Out.Circ, SPLINE],
            ];
            anim.rotation = [
                [random(-100, 100), random(-45, 45), random(-90, 90), 0],
                [0, 0, 0, 0.45, ease.Out.Circ]
            ];
    
            anim.dissolve = "haiii :3";
            anim.dissolveArrow = "haiii :3";
    
            data.color = [1, 1, 1, 1];
            data.fake = true;
            data.interactable = false;
            data.track = fakesTrack;
    
            dupe.push();
        }
    });
}