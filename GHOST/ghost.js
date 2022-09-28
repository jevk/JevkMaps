
"use strict";

const fs = require("fs");

const LIGHTS = __dirname+"\\HardStandard.dat";
const INPUT = __dirname+"\\HardStandard.dat";
const OUTPUT = __dirname+"\\ExpertLawless.dat";

const NJS = 19;
const OFFSET = 0.5;

let difficulty = JSON.parse(fs.readFileSync(INPUT));
let light = JSON.parse(fs.readFileSync(LIGHTS));

const redNote = [0.658823549747467, 0.125490203499794, 0.125490203499794, 1];
const blueNote = [0.125490203499794, 0.3921568691730499, 0.658823549747467, 1];

difficulty._customData = {
    _pointDefinitions: [],
    _customEvents: [],
    _environment: []
};

difficulty._events = light._events;

const _customData = difficulty._customData;
const _obstacles = difficulty._obstacles;
const _notes = difficulty._notes;
const _events = difficulty._events;
const _customEvents = _customData._customEvents;
const _pointDefinitions = _customData._pointDefinitions;
const _environment = _customData._environment;

console.log(_notes.length);

let filterednotes;

_obstacles.forEach(wall => {
    if (!wall._customData) {
        wall._customData = {};
    }
    wall._customData._track = "globalWalls";
    wall._customData._noteJumpStartBeatOffset = OFFSET;
    wall._customData._noteJumpMovementSpeed = NJS;
});

_notes.forEach(note => {
    if (!note._customData) {
        note._customData = {};
    }
    note._customData._track = "globalNotes";
    note._customData._noteJumpStartBeatOffset = OFFSET;
    note._customData._noteJumpMovementSpeed = NJS;
});


class Wall {
    constructor(time, duration, data) {
        this._time = time;
        this._type = 1;
        this._width = 1;
        this._lineIndex = 0;
        this._duration = duration;
        this._customData = data;
        _obstacles.push(this);
    }
}

class Note {
    constructor(time, x, y, type, direction, data) {
        this._time = time;
        this._lineIndex = x - 2;
        this._lineLayer = y;
        this._type = type;
        this._cutDirection = direction;
        this._customData = data;
        _notes.push(this);
    }
}

class AnimateTrack {
    constructor(time, data) {
        this._time = time;
        this._type = "AnimateTrack";
        this._data = data;
    }
}

class AssignPathAnimation {
    constructor(time, data) {
        this._time = time;
        this._type = "AssignPathAnimation";
        this._data = data;
        _customEvents.push(this);
    }
}

class TrackParent {
    constructor(time, parent, children) {
        this._time = time - 8;
        this._type = "AssignTrackParent";
        this._data = {
            _childrenTracks: children,
            _parentTrack: parent
        };
        _customEvents.push(this);
    }
}

class PointDefinition {
    constructor(name, points) {
        this._name = name;
        this._points = points;
        _pointDefinitions.push(this);
    }
}

function filterNotes(start, end, type) {
    filterednotes = _notes.filter(n => n._time >= start && n._time <= end);
    if (typeof type !== 'undefined' && type !== null)
        filterednotes = filterednotes.filter(n1 => n1._type == type);
    return filterednotes;
}

function filterDoubles(start, end) {
    const filteredStacks = [];
    let prevTime = -1;
    filterednotes = _notes.filter(n => n._time >= start && n._time <= end);
    filterednotes.forEach(note => {
        if (note._time == prevTime) {
            filteredStacks.push(note, filterednotes[filterednotes.indexOf(note) - 1]);
        }
        prevTime = note._time;
    });
    return filteredStacks;
}

function noteTrack(track, p1, p2, potentialOffset) {
    filterednotes = _notes.filter(n => n._time >= p1 && n._time<= p2);
    filterednotes.forEach(object => {
        if (!object._customData._track) 
            object._customData._track = track;
         else if (Array.isArray(object._customData._track)) {
            object._customData._track.push(track)
        } else {
            object._customData._track = [object._customData._track, track];
        }
        if (typeof potentialOffset !== "undefined") {
            object._customData._noteJumpStartBeatOffset = potentialOffset;
        }
    });
    return filterednotes;
}

function noteTrackRB(trackR, trackB, p1, p2, potentialOffset) {
    filterednotes = _notes.filter(n => n._time >= p1 && n._time<= p2);
    filterednotes.forEach(object => {
        if (typeof potentialOffset !== "undefined") {
            object._customData._noteJumpStartBeatOffset = potentialOffset;
        }
        if (object._type == 0) {
            if (!object._customData._track) 
                object._customData._track = trackR;
             else if (Array.isArray(object._customData._track)) {
                object._customData._track.push(trackR)
            } else {
                object._customData._track = [object._customData._track, trackR];
            }
        }
        if (object._type == 1) {
            if (!object._customData._track) 
                object._customData._track = trackB;
             else if (Array.isArray(object._customData._track)) {
                object._customData._track.push(trackB)
            } else {
                object._customData._track = [object._customData._track, trackB];
            }
        }
    });
    return filterednotes;
}

function random(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

function hideFog() {
    _customEvents.push({
        _time: 0,
        _type: "AssignFogTrack",
        _data: {
            _track: "FOG"
        }
    });
    let a = new AnimateTrack(0, {
        _track: "FOG",
        _duration: 0,
        _height: [0],
        _startY: [-1000]
    });
    _customEvents.push(a);
}

function moveBloqToSide (start, end, interval, direction, track) {
    filterednotes = _notes.filter(n => n._time >= start && n._time <= end);
    filterednotes.forEach(note => {
        let data = note._customData;
        if (!data._animation) data._animation = {};
        let anim = data._animation;

        data._disableNoteGravity = true;
        data._disableNoteLook = true;

        for (let i = 1; i <= 2; i++) {
            let n1 = JSON.parse(JSON.stringify(note));
            let d1 = n1._customData;
            let a1 = d1._animation;
            const trackName = `${track+i}`;

            if (Array.isArray(d1)) {
                const tracks = [d1._track];
                tracks.push(trackName);
                d1._track = tracks;
            } else {
                d1._track = [d1._track, trackName]
            }

            d1._interactable = false;
            d1._fake = true;
            d1._disableSpawnEffect = true;

            a1._dissolveArrow = [[0, 0]];

            _notes.push(n1);
        }
        
        anim._dissolve = [[0, 0]];
    });
    for (let i = start; i <= end - 1; i++) {
        _customEvents.push({
            _time: i,
            _type: "AnimateTrack",
            _data: {
                _track: "globalNotes",
                _duration: 0.5,
                _scale: "scaleShake",
                _position: "posShake"
            }
        })
    }
    for (let i = start; i <= end; i += interval) {
        _customEvents.push({
            _time: i,
            _type: "AnimateTrack",
            _data: {
                _track: `${track}1`,
                _duration: 1,
                _dissolve: "moveDis",
                _position: [
                    [0, 0, 0, 0],
                    [10 * direction, 0, 0, 0.5, "easeOutSine"]
                ]
            }
        }, {
            _time: i,
            _type: "AnimateTrack",
            _data: {
                _track: `${track}2`,
                _duration: 1,
                _dissolve: "moveDisInv",
                _position: [
                    [-10 * direction, 0, 0, 0],
                    [0, 0, 0, 0.5, "easeOutSine"]
                ]
            }
        }, {
            _time: i,
            _type: "AnimateTrack",
            _data: {
                _track: "LeftPanel",
                _duration: 1,
                _rotation: [
                    [0, 0, -17 * direction, 0],
                    [0, 0, -23 * direction, 0.75, "easeInOutBack"],
                    [0, 0, 0, 1, "easeOutCubic"]
                ]
            }
        }, {
            _time: i,
            _type: "AnimateTrack",
            _data: {
                _track: "RightPanel",
                _duration: 1,
                _rotation: [
                    [0, 0, -17 * direction, 0],
                    [0, 0, -23 * direction, 0.75, "easeInOutBack"],
                    [0, 0, 0, 1, "easeOutCubic"]
                ]
            }
        });
    }
}

function grid(start, end, track) {
    filterednotes = _notes.filter(n => n._time >= start - 2 && n._time <= end);
    filterednotes.forEach(note => {
        let data = note._customData;
        if (!data._animation) data._animation = {};
        let anim = data._animation;
        
        data._disableNoteGravity = true;
        data._disableNoteLook = true;
        data._disableSpawnEffect = true;

        if (note._time > start) {
            anim._dissolve = [[0, 0]]//"gridDisInv";
        }

        for (let j = -2; j <= 2; j++) {
            for (let i = 1, yRot = -60; i <= 5; i++, yRot += 30) {
                let n1 = JSON.parse(JSON.stringify(note));
                let d1 = n1._customData;
                let a1 = d1._animation;
                if (Array.isArray(d1._track)) {
                    d1._track.push(track, "PLAYER");
                } else {
                    const tracks = [d1._track, track, "PLAYER"];
                    d1._track = tracks;
                }
                d1._fake = true;
                d1._interactable = false;
                d1._rotation = [0, yRot, 0];
                d1._position = [n1._lineIndex - 2, 5 * j + n1._lineLayer, 0];

                a1._dissolve = "gridDis";
                a1._dissolveArrow = "gridDis";
                _notes.push(n1)
            }
        }
    });
}

function randomXpath (start, end, amp, offset) {
    filterednotes = _notes.filter(n => n._time >= start && n._time <= end);
    filterednotes.forEach(note => {
        let data = note._customData;
        if (!data._animation) data._animation = {};
        let anim = data._animation;

        data._disableNoteGravity = true;
        data._disableNoteLook = true;
        data._disableSpawnEffect = true;
        data._noteJumpStartBeatOffset = offset;

        anim._position = [
            [random(amp * -1, amp), 0, 0, 0],
            [random(amp * -1, amp) * 0.75, 0, 0, 0.25, "easeInOutCirc"],
            [0, 0, 0, 0.5, "easeInOutCirc"],
        ];
        anim._dissolve = "disIn";
        anim._dissolveArrow = "disIn";
    });
}

function toggleArrowBloq (start, end, track) {
    let previousTime = 0;
    let disStateR = 0;
    let disStateB = 1;
    filterednotes = _notes.filter(n => n._time >= start && n._time <= end && n._type != 3);
    filterednotes.forEach(note => {
        let data = note._customData;
        const trackName = `${note._type + track}`;

        if (Array.isArray(data._track) && !data._track.includes(trackName)) {
            data._track.push(trackName);
        } else {
            const tracks = [data._track, trackName];
            data._track = tracks;
        }

        if (note._time > previousTime + 0.1) {
            _customEvents.push({
                _time: note._time,
                _type: "AnimateTrack",
                _data: {
                    _track: `0${track}`,
                    _duration: 0,
                    _dissolve: [[disStateR, 0]],
                    _dissolveArrow: [[disStateB, 0]]
                }
            }, {
                _time: note._time,
                _type: "AnimateTrack",
                _data: {
                    _track: `1${track}`,
                    _duration: 0,
                    _dissolve: [[disStateB, 0]],
                    _dissolveArrow: [[disStateR, 0]]
                }
            });

            if (disStateB == 0) {
                disStateB = 1;
                disStateR = 0;
            } else if (disStateB == 1) {
                disStateB = 0;
                disStateR = 1;
            }
        }
        previousTime = note._time;
    });
}

function bloqArrowSep(start, end, aTrack, bTrack, intBloq) {
    filterednotes = _notes.filter(n => n._time >= start && n._time <= end);
    filterednotes.forEach(note => {
        let data = note._customData;
        if (!data._animation) data._animation = {};
        let anim = data._animation;
        data._disableNoteGravity = true;
        data._disableNoteLook = true;

        let n1 = JSON.parse(JSON.stringify(note));
        let d1 = n1._customData;
        let a1 = d1._animation;

        if (intBloq) {
            data._interactable = false;
            data._fake = true;
        } else {
            d1._interactable = false;
            d1._fake = true;
        }

        d1._disableSpawnEffect = true;

        if (Array.isArray(data._track) && !data._track.includes(aTrack)) {
            data._track.push(aTrack);
        } else {
            const tracks = [data._track, aTrack];
            data._track = tracks;
        }
        if (Array.isArray(d1._track) && !d1._track.includes(bTrack)) {
            d1._track.push(bTrack);
        } else {
            const tracks = [d1._track, bTrack];
            d1._track = tracks;
        }
        
        a1._dissolveArrow = [[0, 0]];
        anim._dissolve = [[0, 0]];
        _notes.push(n1);
    });
}

const dissolvedTracks = [];
function dissolveTrackInOut (start, end, durationIn, durationOut, track) {
    if (!dissolvedTracks.includes(track)) {
        _customEvents.push({
            _time: 0,
            _type: "AnimateTrack",
            _data: {
                _track: track,
                _duration: 0,
                _dissolve: [[0, 0]]
            }
        });
        dissolvedTracks.push(track);
    }
    const animDur = end - start;
    _customEvents.push({
        _time: start,
        _type: "AnimateTrack",
        _data: {
            _track: track,
            _duration: animDur,
            _dissolve: [
                [0, 0],
                [1, durationIn / animDur, "easeOutSine"],
                [1, (animDur - durationOut) / animDur],
                [0, 0.999, "easeInSine"],
                [0, 1]
            ]
        }
    });
}

function arrowBloqSurround(start, end, track, amount, direction) {
    filterednotes = _notes.filter(n => n._time >= start && n._time <= end);
    filterednotes.forEach(note => {
        let data = note._customData;
        
        data._disableNoteGravity = true;
        data._disableSpawnEffect = true;

        for (let i = 0; i < 360; i += (360 / amount)) {
            let n1 = JSON.parse(JSON.stringify(note));
            let d1 = n1._customData;
            
            d1._track = [d1._track, `${track}Outer`];
            d1._position = [note._lineIndex - 2, 4 + note._lineLayer, 0];
            d1._rotation = [0, 0, i];
            d1._fake = true;
            d1._interactable = false;
            
            _notes.push(n1);
        }
        data._track = [data._track, track];
        
        for (let i = start; i < end; i += 4) {
            let a = new AnimateTrack(i, {
                _track: `${track}Outer`,
                _duration: 4,
                _rotation: `rot${direction}`
            });
            _customEvents.push(a);
        }
        let animt = new AnimateTrack(start, {
            _duration: end - start + 0.1,
            _track: `${track}Outer`,
            _dissolveArrow: [
                [1, 0],
                [0, 1, "easeStep"]
            ],
            _dissolve: [
                [0, 1]
            ]
        })
        _customEvents.push(animt);
    });
}

function osu(start, end) {
    filterednotes = _notes.filter(n => n._time >= start && n._time <= end);
    filterednotes.forEach(note => {
        let data = note._customData;
        if (!data._animation) data._animation = {};
        let anim = data._animation;
        let color, div = 90;

        switch (note._type) {
            case 0:
                color = [0.658, 0.125, 0.125, 0.5];
                break;
            case 1:
                color = [0.125, 0.125, 0.658, 0.5];
                break;
        }

        data._disableNoteGravity = true;
        data._disableNoteLook = true;
        data._disableSpawnEffect = true;
        data._noteJumpStartBeatOffset = 2;
        data._noteJumpMovementSpeed = 12;
        data._color = color;

        anim._dissolve = [
            [0, 0],
            [0, 0.375],
            [1, 0.5, "easeInOutCirc"]
        ];
        anim._dissolveArrow = [
            [0, 0],
            [0, 0.375],
            [1, 0.5, "easeInOutCirc"]
        ];
        //anim._position = [
        //    [0, 0, -16, 0],
        //    [0, 0, 0, 0.4]
        //];
        //anim._scale = [
        //    [1.5, 1.5, 1.5, 0],
        //    [1, 1, 1, 0.45, "easeInExpo"]
        //];

        let dupe = JSON.parse(JSON.stringify(note));
        let d12 = dupe._customData;
        let a12 = d12._animation;

        d12._fake = true;
        d12._interactable = false;
        d12._disableNoteGravity = true;
        d12._disableSpawnEffect = true;
        d12._disableNoteLook = true;
        a12._dissolve = [
            [0, 0],
            [0, 0.25],
            [1, 0.375, "easeOutCubic"],
            [0, 0.46875, "easeInOutCirc"]
        ];
        a12._dissolveArrow = [
            [0, 0],
            [0, 0.25],
            [1, 0.375, "easeOutCubic"],
            [0, 0.46875, "easeInOutCirc"]
        ];
        a12._position = [
            [0, 0, -22, 0],
            [0, 0, 6, 0.5]
        ];
        //a12._scale = [1.5,1.5,0.1]

        _notes.push(dupe);
       
        if (note._cutDirection > 3) {
            div = 45;
        }

        let parentTrackName = `asdf${note._time}index${note._lineIndex}layer${note._lineLayer}color${note._type}`;
        let circleTrackName = `squareWall${note._time}color${note._type}`;

        for (let i = 0; i <= 3; i++) {
            new Wall(note._time, 4, {
                _track: circleTrackName,
                _color: color,
                _scale: [2.1, 0.05, 0.5],
                _position: [-1.05, 0.85],
                _rotation: [0, 0, 90 * i],
                _fake: true,
                _interactable: false,
                _noteJumpMovementSpeed: 18,
                _noteJumpStartBeatOffset: 1,
                _animation: {
                    //_scale: [
                    //    [1, 1, 1, 0],
                    //    [0.35, 1, 1, 0.3]
                    //],
                    _position: [
                        [0, 0, -14, 0],
                        [0, 0, 20, 0.5]
                    ],
                    _dissolve: [
                        [0, 0],
                        [0, 0.125],
                        [1, 0.25],
                    ]
                }
            });
        }

        new TrackParent(note._time, parentTrackName, [circleTrackName]);
        let a = new AnimateTrack(note._time - 8, {
            _track: parentTrackName,
            _duration: 0,
            _position: [
                [note._lineIndex - 1.5, note._lineLayer + 1.25, 0, 0]
            ],
            _localRotation: [0, 0, div]
        });
        let asdf = new AnimateTrack(note._time - 1, {
            _track: parentTrackName,
            _duration: 1,
            _scale: [
                [1, 1, 1, 0],
                [0.25, 0.25, 1, 1]
            ]
        });
        let sadf = new AnimateTrack(note._time - 1, {
            _track: circleTrackName,
            _duration: 1,
            _dissolve: [
                [1, 0],
                [1, 0.75],
                [0, 1]
            ]
        })
        _customEvents.push(a, asdf, sadf);
        console.log("a")
    });
}

function randomChaosIHonestlyDontKnowWhatAmIDoingAtThisPointAAAPlsHelpMe(start, end) {
    filterednotes = _notes.filter(n => n._time >= start && n._time <= end);
    filterednotes.forEach(note => {
        let data = note._customData;
        if (!data._animation) data._animation = {};
        let anim = data._animation;

        data._noteJumpStartBeatOffset = 8;
        data._disableSpawnEffect = true;
        
        anim._position = [
            [random(-4, 4), random(-10, 10), random(-15, 15), 0],
            [random(-4, 4), random(-10, 10), random(-10, 10), 0.125, "easeInOutQuad"],
            [random(-4, 4), random(-10, 10), -8.69, 0.25, "easeInOutQuad"],
            [0, 0, 0, 0.475, "easeInOutCirc"]
        ];
        anim._dissolve = "dissolveIn";
        anim._dissolveArrow = "dissolveIn";
        
    });
}

function fromSides(start, end) {
    let tempNum = -1;
    filterednotes = _notes.filter(n => n._time >= start && n._time <= end);
    filterednotes.forEach(note => {
        let data = note._customData;
        if (!data._animation) data._animation = {};
        let anim = data._animation;

        data._noteJumpStartBeatOffset = 2;
        
        anim._position = [
            [6.9 * tempNum, random(-1, 1), 0, 0],
            [0, 0, 0, 0.48, "easeOutCirc"]
        ];
        tempNum *= -1;
    });
}

function lrPath(start, end, track, offset, duration, interval, rotation) {
    noteTrack(track, start, end, offset);
    for (let i = start, dir = 1; i <= end; i += interval, dir *= -1) {
        for (let j = 0, time = 0; j <= rotation; j += 1, time += duration/rotation) {
            new AssignPathAnimation(i + time, {
                _track: track,
                _rotation: [
                    [0, j * dir, 0, 0],
                    [0, 0, 0, 0.45, "easeOutCirc"]
                ]
            });
        }
    }
}
// #region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -


//#region point definitions
_pointDefinitions.push({
    _name: "dissolveIn",
    _points: [
        [0, 0],
        [1, 0.125, "easeOutCubic"]
    ]
}, {
    _name: "btRot",
    _points: [
        [0, 0, 0, 0],
        [0, 90, 0, 0.125],
        [0, 180, 0, 0.25],
        [0, 270, 0, 0.375],
        [0, 0, 0, 0.5],
        [0, 90, 0, 0.625],
        [0, 180, 0, 0.75],
        [0, 270, 0, 0.875],
        [0, 0, 0, 1]
    ]
}, {
    _name: "rot1",
    _points: [
        [0, 0, 0, 0],
        [0, 0, 90, 0.25],
        [0, 0, 180, 0.5],
        [0, 0, 270, 0.75],
        [0, 0, 0, 1]
    ]
}, {
    _name: "rot-1",
    _points: [
        [0, 0, 0, 0],
        [0, 0, -90, 0.25],
        [0, 0, -180, 0.5],
        [0, 0, -270, 0.75],
        [0, 0, 0, 1]
    ]
}, {
    _name: "btDis",
    _points: [
        [0, 0],
        [0.9, 0.05, "easeOutCubic"],
        [0.9, 0.95],
        [0, 0.99, "easeInOutCubic"],
        [0, 1]
    ]
}, {
    _name: "disIn",
    _points: [
        [0, 0],
        [1, 0.125, "easeOutCubic"],
        [1, 0.126]
    ]
}, {
    _name: "g1",
    _points: [
        [0, 0, 0, 0],
        [0, -30, 0, 0.99, "easeOutCubic"],
        [0, 0, 0, 1, "easeStep"]
    ]
}, {
    _name: "g2",
    _points: [
        [0, 0, 0, 0],
        [0, 30, 0, 0.99, "easeOutCubic"],
        [0, 0, 0, 1, "easeStep"]
    ]
}, {
    _name: "gp1",
    _points: [
        [0, 0, 0, 0],
        [0, 4.5, 0, 0.99, "easeOutCubic"],
        [0, 0, 0, 1, "easeStep"]
    ]
}, {
    _name: "gp2",
    _points: [
        [0, 0, 0, 0],
        [0, -4.5, 0, 0.99, "easeOutCubic"],
        [0, 0, 0, 1, "easeStep"]
    ]
}, {
    _name: "ghs",
    _points: [
        [1.5, 1, 1, 0],
        [1, 1, 1, 1, "easeOutCubic"]
    ]
}, {
    _name: "gvs",
    _points: [
        [1, 1.5, 1, 0],
        [1, 1, 1, 1, "easeOutCubic"]
    ]
}, {
    _name: "posShake",
    _points: [
        [random(-5, 5)/100, random(-5, 5)/100, 0, 0],
        [random(-5, 5)/100, random(-5, 5)/100, 0, 0.125, "easeInOutElastic"],
        [random(-5, 5)/100, random(-5, 5)/100, 0, 0.25, "easeInOutElastic"],
        [random(-5, 5)/100, random(-5, 5)/100, 0, 0.375, "easeInOutElastic"],
        [random(-5, 5)/100, random(-5, 5)/100, 0, 0.5, "easeInOutElastic"],
        [random(-5, 5)/100, random(-5, 5)/100, 0, 0.625, "easeInOutElastic"],
        [random(-5, 5)/100, random(-5, 5)/100, 0, 0.75, "easeInOutElastic"],
        [random(-5, 5)/100, random(-5, 5)/100, 0, 0.875, "easeInOutElastic"],
        [0, 0, 0, 1, "easeInOutElastic"]
    ]
}, {
    _name: "scaleShake",
    _points: [
        [random(95, 105)/100, random(95, 105)/100, random(95, 105)/100, 0],
        [random(95, 105)/100, random(95, 105)/100, random(95, 105)/100, 0.125],
        [random(95, 105)/100, random(95, 105)/100, random(95, 105)/100, 0.25],
        [random(95, 105)/100, random(95, 105)/100, random(95, 105)/100, 0.375],
        [random(95, 105)/100, random(95, 105)/100, random(95, 105)/100, 0.5],
        [random(95, 105)/100, random(95, 105)/100, random(95, 105)/100, 0.625],
        [random(95, 105)/100, random(95, 105)/100, random(95, 105)/100, 0.75],
        [random(95, 105)/100, random(95, 105)/100, random(95, 105)/100, 0.875],
        [1, 1, 1, 1]
    ]
}, {
    _name: "moveDisInv",
    _points: [
        [0, 0],
        [1, 0.25, "easeOutCirc"]
    ]
}, {
    _name: "moveDis",
    _points: [
        [1, 0],
        [1, 0.5],
        [0, 0.75, "easeInCirc"],
        [0, 0.751]
    ]
}, {
    _name: "gridDis",
    _points: [
        [1, 0],
        [1, 0.25],
        [0, 0.375, "easeOutCubic"],
        [0, 0.376]
    ]
}, {
    _name: "gridDisInv",
    _points: [
        [0, 0],
        [0, 0.25],
        [1, 0.375, "easeOutCubic"],
        [1, 0.376]
    ]
});
//#endregion
//#region intro


noteTrack("intro", 0, 91.5);

let side = 1;
filterednotes = _notes.filter(n => n._time >= 0 && n._time <= 91.5);
filterednotes.forEach(note => {
    if (!note._customData._animation) note._customData._animation = {};
    let dupe = JSON.parse(JSON.stringify(note));
    dupe._customData._track = "globalNotes";
    dupe._customData._animation._dissolve = [0];
    dupe._customData._animation._dissolveArrow = [
        [1, 0],
        [0, 0.49, "easeStep"]
    ];
    side *= -1;
    note._customData._fake = true;
    note._customData._interactable = false;
    note._customData._animation._dissolveArrow = [0];
    note._customData._animation._dissolve = [
        [1, 0],
        [0, 0.49, "easeStep"]
    ];
    _notes.push(dupe);
    _customEvents.push({
        _time: note._time,
        _type: "AnimateTrack",
        _data: {
            _track: "intro",
            _duration: 1,
            _position: [
                [0, 0, 0, 0],
                [0, 0, 4, 0.5, "easeOutQuart"],
                [0, 0, 0, 1, "easeInQuart"]
            ],
            _localRotation: [
                [0, 0, 20 * side, 0],
                [0, 0, 0, 0.5, "easeInOutCubic"]
            ]
        }
    });
});

//#endregion
//#region grid of notes

_customEvents.push({
    _time: 0,
    _type: "AnimateTrack",
    _data: {
        _track: "gridTracks",
        _duration: 0,
        _dissolve: [
            [0, 0]
        ],
        _dissolveArrow: [
            [0, 0]
        ]
    }
}, {
    _time: 96,
    _type: "AnimateTrack",
    _data: {
        _track: "gridTracks",
        _duration: 1,
        _dissolve: [
            [0, 0],
            [1, 1, "easeOutCubic"]
        ],
        _dissolveArrow: [
            [0, 0],
            [1, 1, "easeOutCubic"]
        ]
    }
}, {
    _time: 159,
    _type: "AnimateTrack",
    _data: {
        _track: "gridTracks",
        _duration: 1,
        _dissolve: [
            [1, 0],
            [0, 1, "easeOutCubic"]
        ],
        _dissolveArrow: [
            [1, 0],
            [0, 1, "easeOutCubic"]
        ]
    }
});

grid(96, 159.9, "gridTracks");

let asd = new AnimateTrack(152, {
    _track: "gridTracks",
    _duration: 2,
    _dissolve: [
        [1, 0],
        [0, 1, "easeOutCubic"]
    ],
    _dissolveArrow: [
        [1, 0],
        [0, 1, "easeOutCubic"]
    ]
});
_customEvents.push(asd);

for (let i = 96; i <= 152; i += 8) {
    _customEvents.push({
        _time: i,
        _type: "AnimateTrack",
        _data: {
            _track: "gridTracks",
            _duration: 1,
            _rotation: `g${random(1, 2)}`,
            _scale: "ghs"
        }
    }, {
        _time: i + 2,
        _type: "AnimateTrack",
        _data: {
            _track: "gridTracks",
            _duration: 1,
            _position: `gp${random(1, 2)}`,
            _scale: "gvs"
        }
    }, {
        _time: i + 3,
        _type: "AnimateTrack",
        _data: {
            _track: "gridTracks",
            _duration: 1,
            _rotation: `g${random(1, 2)}`,
            _scale: "ghs"
        }
    }, {
        _time: i + 5,
        _type: "AnimateTrack",
        _data: {
            _track: "gridTracks",
            _duration: 1,
            _rotation: `g${random(1, 2)}`,
            _scale: "ghs"
        }
    }, {
        _time: i + 6,
        _type: "AnimateTrack",
        _data: {
            _track: "gridTracks",
            _duration: 1,
            _position: `gp${random(1, 2)}`,
            _scale: "gvs"
        }
    });
}

//#endregion
//#region buildup

noteTrack("buildup", 160, 223.9);

for (let i = 160; i <= 191; i += 8) {
    for (let j = 1, k = 1; j <= 16; j++, k -= 1/16) {
        _customEvents.push({
            _time: i + (1/16) * j,
            _type: "AssignPathAnimation",
            _data: {
                _track: "buildup",
                _rotation: [
                    [0, Math.sin(Math.PI/j)*5*k, 0, 0],
                    [0, Math.sin(Math.PI/j)*5*-1*k, 0, 0.125, "easeInOutCubic"],
                    [0, 0, 0, 0.25, "easeInOutCubic"],
                ]
            }
        }, {
            _time: i + (1/16) * j + 3,
            _type: "AssignPathAnimation",
            _data: {
                _track: "buildup",
                _rotation: [
                    [0, Math.sin(Math.PI/j)*5*k, 0, 0],
                    [0, Math.sin(Math.PI/j)*5*-1*k, 0, 0.125, "easeInOutCubic"],
                    [0, 0, 0, 0.25, "easeInOutCubic"],
                ]
            }
        });
    }
}

for (let i = 192; i <= 207.5; i++) {
    for (let j = 1, k = 1; j <= 16; j++, k -= 1/16) {
        _customEvents.push({
            _time: i + (1/16) * j,
            _type: "AssignPathAnimation",
            _data: {
                _track: "buildup",
                _rotation: [
                    [0, Math.sin(Math.PI/j)*8*k, 0, 0],
                    [0, Math.sin(Math.PI/j)*8*-1*k, 0, 0.125, "easeInOutCubic"],
                    [0, 0, 0, 0.25, "easeInOutCubic"],
                ]
            }
        });
    }
}

filterednotes = _notes.filter(n => n._time >= 208 && n._time < 216);
filterednotes.forEach(note => {
    for (let j = 1, k = 1; j <= 8; j += 0.5, k -= 1/16) {
        _customEvents.push({
            _time: note._time + (1/16) * j,
            _type: "AssignPathAnimation",
            _data: {
                _track: "buildup",
                _rotation: [
                    [0, Math.sin(Math.PI/j)*10*k, 0, 0],
                    [0, Math.sin(Math.PI/j)*10*-1*k, 0, 0.125, "easeInOutCubic"],
                    [0, 0, 0, 0.25, "easeInOutCubic"],
                ]
            }
        });
    }
});



_customEvents.push({
    _time: 222,
    _type: "AnimateTrack",
    _data: {
        _track: "globalNotes",
        _duration: 1,
        _dissolve: [
            [1, 0],
            [0, 1]
        ],
        _dissolveArrow: [
            [1, 0],
            [0.003, 1]
        ]
    }
}, {
    _time: 224,
    _type: "AnimateTrack",
    _data: {
        _track: "globalNotes",
        _duration: 2,
        _dissolve: [
            [0, 0],
            [1, 0.125]
        ],
        _dissolveArrow: [
            [0.003, 0],
            [1, 0.125]
        ],
        _position: [
            [0, 0, 0, 0],
            [1, 0, 0, 0.45],
            [1, 0, 0, 0.5],
            [0, 0, 0, 0.95]
        ]
    }
}, {
    _time: 226,
    _type: "AnimateTrack",
    _data: {
        _track: "globalNotes",
        _duration: 1,
        _dissolve: [
            [0.5, 0],
            [1, 0.25]
        ],
        _position: [
            [-1, 0, 0, 0],
            [1, 0, 0, 0.125, "easeInOutElastic"],
            [-0.5, 0, 0, 0.25, "easeInOutElastic"],
            [0.5, 0, 0, 0.375, "easeInOutElastic"],
            [0, 0, 0, 0.5, "easeInOutElastic"]
        ]
    }
})

//#endregion
//#region drop

moveBloqToSide(227, 235.9, 0.5, -1, "sdjfn")
moveBloqToSide(236, 236.9, 0.25, -1, "sdjfn")
moveBloqToSide(237, 239, 0.5, -1, "sdjfn")

randomXpath(240, 242, 6, 4)
_customEvents.push({
    _time: 240,
    _type: "AnimateTrack",
    _data: {
        _track: "globalNotes",
        _duration: 1,
        _scale: "scaleShake",
        _position: "posShake"
    }
});

moveBloqToSide(243, 253, 1, 1, "jsdn")
moveBloqToSide(254, 255.5, 0.5, 1, "jsdn")

randomXpath(256, 258, 6, 4)
_customEvents.push({
    _time: 256,
    _type: "AnimateTrack",
    _data: {
        _track: "globalNotes",
        _duration: 1,
        _scale: "scaleShake",
        _position: "posShake"
    }
});

moveBloqToSide(259, 267.9, 0.5, -1, "sdjfn")
moveBloqToSide(268, 268.9, 0.25, -1, "sdjfn")
moveBloqToSide(269, 271, 0.5, -1, "sdjfn")

let previousTime = 0;
let rotSide = 1;

filterednotes = _notes.filter(n => n._time >= 272 && n._time <= 285.5);
filterednotes.forEach(note => {
    rotSide *= -1;

    let data = note._customData;
    if (!data._animation) data._animation = {};
    let anim = data._animation;

    data._disableNoteGravity = true;

    let dupe = JSON.parse(JSON.stringify(note));
    let d1 = dupe._customData;
    let a1 = d1._animation;

    dupe._time += 0.05
    d1._fake = true;
    d1._interactable = false;
    d1._track = "flick";
    
    a1._dissolveArrow = [[0, 0]];

    anim._dissolve = [[0, 0]];

    if (previousTime != note._time) {
        _customEvents.push({
            _time: note._time,
            _type: "AnimateTrack",
            _data: {
                _track: "flick",
                _duration: 0.5,
                _dissolve: [
                    [0.25, 0],
                    [1, 0.5]
                ],
                _localRotation: [
                    [0, 0, 22 * rotSide, 0],
                    [0, 0, -22 * rotSide, 1, "easeOutElastic"]
                ]
            }
        });
    }
    previousTime = note._time;
    _notes.push(dupe);
})

//#endregion

//#region long streams

let a = new AnimateTrack(0, {
    _duration: 0,
    _track: "spinningNotesOuter",
    _dissolveArrow: [
        [0, 0]
    ],
    _dissolve: [
        [0, 0]
    ]
});
_customEvents.push(a);

for (let i = 320; i < 382; i += 8) {
    let o1 = new AnimateTrack(i, {
        _track: `spinningNotesOuter`,
        _duration: 0.25,
        _dissolve: [
            [0, 0],
            [1, 1]
        ],
        _dissolveArrow: [
            [1, 0],
            [0, 1]
        ]
    });
    let i1 = new AnimateTrack(i, {
        _track: 'spinningNotes',
        _duration: 0.25,
        _dissolve: [
            [1, 0],
            [0, 1]
        ],
        _dissolveArrow: [
            [0, 0],
            [1, 1]
        ]
    });
    _customEvents.push(o1, i1);

    let o2 = new AnimateTrack(i + 2, {
        _track: `spinningNotesOuter`,
        _duration: 0.25,
        _dissolve: [
            [1, 0],
            [0, 1]
        ],
        _dissolveArrow: [
            [0, 0],
            [1, 1]
        ]
    });
    let i2 = new AnimateTrack(i + 2, {
        _track: 'spinningNotes',
        _duration: 0.25,
        _dissolve: [
            [0, 0],
            [1, 1]
        ],
        _dissolveArrow: [
            [1, 0],
            [0, 1]
        ]
    });
    _customEvents.push(o2, i2);

    let o3 = new AnimateTrack(i + 3, {
        _track: `spinningNotesOuter`,
        _duration: 0.25,
        _dissolve: [
            [0, 0],
            [1, 1]
        ],
        _dissolveArrow: [
            [1, 0],
            [0, 1]
        ]
    });
    let i3 = new AnimateTrack(i + 3, {
        _track: 'spinningNotes',
        _duration: 0.25,
        _dissolve: [
            [1, 0],
            [0, 1]
        ],
        _dissolveArrow: [
            [0, 0],
            [1, 1]
        ]
    });
    _customEvents.push(o3, i3);

    let o4 = new AnimateTrack(i + 5, {
        _track: `spinningNotesOuter`,
        _duration: 0.25,
        _dissolve: [
            [0, 0],
            [1, 1]
        ],
        _dissolveArrow: [
            [1, 0],
            [0, 1]
        ]
    });
    let i4 = new AnimateTrack(i + 5, {
        _track: 'spinningNotes',
        _duration: 0.25,
        _dissolve: [
            [1, 0],
            [0, 1]
        ],
        _dissolveArrow: [
            [0, 0],
            [1, 1]
        ]
    });
    _customEvents.push(o4, i4);

    let o5 = new AnimateTrack(i + 6, {
        _track: `spinningNotesOuter`,
        _duration: 0.25,
        _dissolve: [
            [1, 0],
            [0, 1]
        ],
        _dissolveArrow: [
            [0, 0],
            [1, 1]
        ]
    });
    let i5 = new AnimateTrack(i + 6, {
        _track: 'spinningNotes',
        _duration: 0.25,
        _dissolve: [
            [0, 0],
            [1, 1]
        ],
        _dissolveArrow: [
            [1, 0],
            [0, 1]
        ]
    });
    _customEvents.push(o5, i5);
}

for (let i = 384; i < 446; i += 4) {
    let o1 = new AnimateTrack(i, {
        _track: `spinningNotesOuter`,
        _duration: 0.25,
        _dissolve: [
            [0, 0],
            [1, 1]
        ],
        _dissolveArrow: [
            [1, 0],
            [0, 1]
        ]
    });
    let i1 = new AnimateTrack(i, {
        _track: 'spinningNotes',
        _duration: 0.25,
        _dissolve: [
            [1, 0],
            [0, 1]
        ],
        _dissolveArrow: [
            [0, 0],
            [1, 1]
        ]
    });
    _customEvents.push(o1, i1);

    let o2 = new AnimateTrack(i + 1.5, {
        _track: `spinningNotesOuter`,
        _duration: 0.25,
        _dissolve: [
            [1, 0],
            [0, 1]
        ],
        _dissolveArrow: [
            [0, 0],
            [1, 1]
        ]
    });
    let i2 = new AnimateTrack(i + 1.5, {
        _track: 'spinningNotes',
        _duration: 0.25,
        _dissolve: [
            [0, 0],
            [1, 1]
        ],
        _dissolveArrow: [
            [1, 0],
            [0, 1]
        ]
    });
    _customEvents.push(o2, i2);

    let o3 = new AnimateTrack(i + 2, {
        _track: `spinningNotesOuter`,
        _duration: 0.25,
        _dissolve: [
            [0, 0],
            [1, 1]
        ],
        _dissolveArrow: [
            [1, 0],
            [0, 1]
        ]
    });
    let i3 = new AnimateTrack(i + 2, {
        _track: 'spinningNotes',
        _duration: 0.25,
        _dissolve: [
            [1, 0],
            [0, 1]
        ],
        _dissolveArrow: [
            [0, 0],
            [1, 1]
        ]
    });
    _customEvents.push(o3, i3);

    let o4 = new AnimateTrack(i + 3, {
        _track: `spinningNotesOuter`,
        _duration: 0.25,
        _dissolve: [
            [1, 0],
            [0, 1]
        ],
        _dissolveArrow: [
            [0, 0],
            [1, 1]
        ]
    });
    let i4 = new AnimateTrack(i + 3, {
        _track: 'spinningNotes',
        _duration: 0.25,
        _dissolve: [
            [0, 0],
            [1, 1]
        ],
        _dissolveArrow: [
            [1, 0],
            [0, 1]
        ]
    });
    _customEvents.push(o4, i4);

}

arrowBloqSurround(323, 335.9, "spinningNotes", 6, 1);
noteTrack("spinningNotes", 336, 338);
arrowBloqSurround(339, 349.9, "spinningNotes", 8, 1);
noteTrack("spinningNotes", 350, 354);
arrowBloqSurround(355, 367.9, "spinningNotes", 6, 1);
noteTrack("spinningNotes", 368, 370);
arrowBloqSurround(371, 382, "spinningNotes", 8, 1);
noteTrack("spinningNotes", 384, 386.5);

arrowBloqSurround(387, 399.9, "spinningNotes", 8, -1);
noteTrack("spinningNotes", 400, 402);
arrowBloqSurround(403, 413.9, "spinningNotes", 8, -1);
noteTrack("spinningNotes", 414, 418);
arrowBloqSurround(419, 431.9, "spinningNotes", 8, -1);    
noteTrack("spinningNotes", 432, 434);
arrowBloqSurround(435, 445.9, "spinningNotes", 8, -1);

//#endregion

//#region buildup 2

noteTrack("buildup2", 288, 320)
filterednotes = _notes.filter(n => n._time >= 288 && n._time < 311.9);
filterednotes.forEach(note => {
    const intensity = random(4, 12);
    for (let j = 1, k = 1, side = 1; j <= 4; j += 0.25, k -= 1/16, side *= -1) {
        _customEvents.push({
            _time: note._time + (1/16) * j,
            _type: "AssignPathAnimation",
            _data: {
                _track: "buildup2",
                _rotation: [
                    [0, Math.sin(Math.PI/j)*intensity*k*side, 0, 0],
                    [0, Math.sin(Math.PI/j)*intensity*-1*k*side, 0, 0.125, "easeInOutCubic"],
                    [0, 0, 0, 0.25, "easeInOutCubic"],
                ]
            }
        });
    }
});

//#endregion
//#region 1/3s

noteTrack("thirdsColor", 320, 322);
noteTrack("thirds", 322.1, 336);
_customEvents.push({
    _time: 320,
    _type: "AnimateTrack",
    _data: {
        _track: "thirdsColor",
        _duration: 2,
        _color: [
            [1, 1, 1, 1, 0],
            [0.25, 0.25, 0.25, 1, 1]
        ]
    }
}, {
    _time: 320,
    _type: "AnimateTrack",
    _data: {
        _track: "thirdsNotes",
        _duration: 2,
        _localRotation: [
            [0, 0, 0, 0],
            [0, 0, 60, 1/6, "easeOutExpo"],
            [0, 0, 120, 1/3, "easeOutExpo"],
            [0, 0, 180, 0.5, "easeOutExpo"],
            [0, 0, 240, 2/3, "easeOutExpo"],
            [0, 0, 300, 5/6, "easeOutExpo"],
            [0, 0, 360, 1, "easeOutExpo"]
        ]
    }
}, {
    _time: 322,
    _type: "AnimateTrack",
    _data: {
        _track: "thirds",
        _duration: 0.5,
        _easing: "easeOutCubic",
        _dissolve: [
            [0.1, 0],
            [1, 1]
        ],
        _localRotation: [
            [0, 0, 0, 0],
            [0, 0, 90, 0.25],
            [0, 0, 180, 0.5],
            [0, 0, 270, 0.75],
            [0, 0, 360, 1]
        ]
    }
});

filterednotes = _notes.filter(n => n._time >= 320 && n._time <= 322);
filterednotes.forEach(note => {
    let data = note._customData;
    if (!data._animation) data._animation = {};
    let anim = data._animation;

    data._disableNoteGravity = true;
    data._disableNoteLook = true;

    anim._dissolve = [[0, 0]];

    let dupe = JSON.parse(JSON.stringify(note));

    let d1 = dupe._customData;
    let a1 = d1._animation;

    d1._fake = true;
    d1._interactable = false;
    d1._disableSpawnEffect = true;
    d1._track = [
        "thirdsNotes",
        "thirdsColor",
        "globalNotes"
    ];

    a1._dissolve = [[1, 0]];
    a1._dissolveArrow = [[0, 0]];
    _notes.push(dupe);
});


//#endregion

//#region dissolve bombs
//noteTrack("dissolveBombs", 448.5, 449.5);
noteTrack("playerTrack", 448, 449);
//_customEvents.push({
//    _time: 448,
//    _type: "AnimateTrack",
//    _data: {
//        _track: "dissolveBombs",
//        _duration: 1,
//        _dissolve: [
//            [1, 0],
//            [0, 0.9, "easeOutCirc"],
//            [0, 1]
//        ],
//        _color: [
//            [1, 1, 1, 1, 0]
//        ]
//    }
//});
//#endregion

//#region bomb tornado
for (let i = 448, k = 1; i <= 512; i++, k += 0.01) {
    for (let j = 1; j <= 4; j++) {
        new Note(i, 0, 0, 3, 8, {
            _color: [2, 2, 2, 4],
            _rotation: [0, 90 * j, 0],
            _fake: true,
            _interactable: false,
            _disableNoteGravity: true,
            _disableNoteLook: true,
            _disableSpawnEffect: true,
            _noteJumpStartBeatOffset: 4,
            _track: "bombTornado",
            _animation: {
                _dissolve: "btDis",
                _definitePosition: [
                    [0, -10 * (k * 1.2), 10 * k, 0],
                    [0, 5 * (k * 1.2), 15 * k, 0.5, "splineCatmullRom"],
                    [0, 20 * (k * 1.2), 7 * k, 1, "splineCatmullRom"]
                ],
                _rotation: "btRot",
                _scale: [
                    [4 * (k / 2), 4 * (k / 2), 1 / k, 0]
                ]
            }
        });
    }
}
/*
for (let i = 448, k = 1; i <= 512; i++, k += 0.1) {
    for (let j = 1; j <= 4; j++) {
        new Note(i, 0, 0, 3, 8, {
            _color: [2, 2, 2, 4],
            _rotation: [0, 90 * j, 0],
            _fake: true,
            _interactable: false,
            _disableNoteGravity: true,
            _disableNoteLook: true,
            _disableSpawnEffect: true,
            _noteJumpStartBeatOffset: 4,
            _track: "bombTornado",
            _animation: {
                _dissolve: "btDis",
                _definitePosition: [
                    [0, -10 * (k * 1.2), 10 * k, 0],
                    [0, 5 * (k * 1.2), 15 * k, 0.5, "splineCatmullRom"],
                    [0, 20 * (k * 1.2), 7 * k, 1, "splineCatmullRom"]
                ],
                _rotation: "btRotI",
                _scale: [
                    [4 * (k / 2), 4 * (k / 2), 1 / k, 0]
                ]
            }
        });
    }
}
*/
_customEvents.push({
    _time: 0,
    _type: "AnimateTrack",
    _data: {
        _track: "bombTornado",
        _duration: 0,
        _dissolve: [[0, 0]]
    }
}, {
    _time: 444,
    _type: "AssignPlayerToTrack",
    _data: {
        _track: "playerTrack"
    }
}, {
    _time: 448,
    _type: "AnimateTrack",
    _data: {
        _track: "playerTrack",
        _duration: 0,
        _position: [
            [0, 6969, 0, 0]
        ]
    }
}, {
    _time: 448,
    _type: "AnimateTrack",
    _data: {
        _track: "bombTornado",
        _duration: 1,
        _position: [
            [0, 6969, 0, 0]
        ],
        _dissolve: [
            [0, 0],
            [1, 1, "easeOutCirc"]
        ]
    }
}, {
    _time: 512,
    _type: "AnimateTrack",
    _data: {
        _track: "playerTrack",
        _duration: 0,
        _position: [[0, 0, 0, 0]]
    }
});


noteTrackRB("breakR", "breakB", 512, 570);
noteTrack("playerTrack", 512, 570);
_customEvents.push({
    _time: 512,
    _type: "AnimateTrack",
    _data: {
        _track: "breakR",
        _duration: (570 - 512) * 0.75,
        _color: [
            [0.658, 0.125, 0.125, 1, 0],
            [1, 0.95, 0.95, 1, 1]
        ]
    }
}, {
    _time: 512,
    _type: "AnimateTrack",
    _data: {
        _track: "breakB",
        _duration: (570 - 512) * 0.75,
        _color: [
            [0.125, 0.392, 0.658, 1, 0],
            [0.95, 0.95, 1, 1, 1]
        ]
    }
});

toggleArrowBloq(512, 570, "arrowBloq")

//#endregion

//#region rotate notes

_notes.forEach(note => {
    if (note._time == 576) {
        let data = note._customData, mult;
        if (!data._animation) data._animation = {};
        let anim = data._animation;

        switch (note._type) {
            case 0:
                mult = 1;
                break;
            case 1:
                mult = -1;
                break;
        }

        data._disableNoteGravity = true;
        data._disableNoteLook = true;
        data._noteJumpStartBeatOffset = 2;

        let n1 = JSON.parse(JSON.stringify(note));
        let d1 = n1._customData;
        let a1 = d1._animation;
    
        d1._fake = true;
        d1._interactable = false;
    
        const dissolveAnim = [];
        for (let j = 0; j <= 1; j += 0.125) {
            dissolveAnim.push([(random(70, 100)/100)*j, j]);
        }
    
        a1._dissolve = dissolveAnim;
        a1._dissolveArrow = [[0.01, 0]];
        a1._rotation = [
            [0, 0, -22.5 * mult, 0],
            [0, 0, 0, 0.375, "easeInCirc"]
        ];
        _notes.push(n1);

        anim._dissolve = [
            [0.8, 0],
            [1, 0.48, "easeOutCirc"]
        ];
        anim._scale = [
            [1, 1, 1, 0],
            [1.25, 1, 1, 0.48, "easeInCirc"],
            [1, 1, 1, 0.481]
        ];
        anim._position = [
            [0.75 * mult, 0, 0, 0],
            [0, 0, 0, 0.375, "easeInCirc"]
        ];
        anim._rotation = [
            [0, 0, -45 * mult, 0],
            [0, 0, 0, 0.375, "easeInCirc"]
        ];
    }
});

//#endregion

//#region grid of notes 2
_customEvents.push({
    _time: 576,
    _type: "AnimateTrack",
    _data: {
        _track: "gridTracks",
        _duration: 1,
        _dissolve: [
            [0, 0],
            [1, 1, "easeOutCubic"]
        ],
        _dissolveArrow: [
            [0, 0],
            [1, 1, "easeOutCubic"]
        ]
    }
}, {
    _time: 635,
    _type: "AnimateTrack",
    _data: {
        _track: "gridTracks",
        _duration: 1,
        _dissolve: [
            [1, 0],
            [0, 1, "easeOutCubic"]
        ],
        _dissolveArrow: [
            [1, 0],
            [0, 1, "easeOutCubic"]
        ]
    }
});

grid(576.1, 638, "gridTracks");

for (let j = 590.5; j <= 624; j += 16) {
    const downs = [0, 1, 1.5];
    for (let i of downs) {
        _customEvents.push({
            _time: i + j,
            _type: "AnimateTrack",
            _data: {
                _track: "gridTracks",
                _duration: 1,
                _position: [
                    [0, 0, 0, 0],
                    [0, -4.5, 0, 0.99, "easeOutElastic"],
                    [0, 0, 0, 1, "easeStep"]
                ]
            }
        });
    }
}
for (let i = 576; i <= 635; i += 8) {
    _customEvents.push({
        _time: i,
        _type: "AnimateTrack",
        _data: {
            _track: "gridTracks",
            _duration: 1,
            _rotation: `g${random(1, 2)}`,
            _scale: "ghs"
        }
    }, {
        _time: i + 3,
        _type: "AnimateTrack",
        _data: {
            _track: "gridTracks",
            _duration: 1,
            _position: `gp${random(1, 2)}`,
            _scale: "gvs"
        }
    }, {
        _time: i + 5,
        _type: "AnimateTrack",
        _data: {
            _track: "gridTracks",
            _duration: 1,
            _rotation: `g${random(1, 2)}`,
            _scale: "ghs"
        }
    });
}


//#endregion

//#region buildup 2

noteTrack("buildup2", 640, 688)

for (let i = 640, mult = 1; i <= 671; i++, mult *= -1) {
    for (let j = 1, k = 1; j <= 16; j++, k -= 1/16) {
        _customEvents.push({
            _time: i + (1/16) * j,
            _type: "AssignPathAnimation",
            _data: {
                _track: "buildup2",
                _rotation: [
                    [0, Math.sin(Math.PI/j)*8*k*mult, 0, 0],
                    [0, Math.sin(Math.PI/j)*8*-1*k*mult, 0, 0.125, "easeInOutCubic"],
                    [0, 0, 0, 0.25, "easeInOutCubic"],
                ]
            }
        });
    }
}
for (let i = 672, mult = 1; i <= 688; i++, mult *= -1) {
    for (let j = 1, k = 1; j <= 16; j++, k -= 1/16) {
        _customEvents.push({
            _time: i + (1/16) * j,
            _type: "AssignPathAnimation",
            _data: {
                _track: "buildup2",
                _rotation: [
                    [0, Math.sin(Math.PI/j)*10*k*mult, 0, 0],
                    [0, Math.sin(Math.PI/j)*10*-1*k*mult, 0, 0.125, "easeInOutCubic"],
                    [0, 0, 0, 0.25, "easeInOutCubic"],
                ]
            }
        });
    }
}

bloqArrowSep(688, 702, "arrowBuildup", "bloqBuildup", false);

for (let i = 688; i < 702; i++) {
    _customEvents.push({
        _time: i,
        _type: "AnimateTrack",
        _data: {
            _track: "bloqBuildup",
            _duration: 1,
            _localRotation: [
                [0, 0, 0, 0],
                [0, 0, 90, 0.25],
                [0, 0, 180, 0.5],
                [0, 0, 270, 0.75],
                [0, 0, 0, 1]
            ]
        }
    });
}

new AssignPathAnimation(688, {
    _track: "arrowBuildup",
    _dissolveArrow: [
        [1, 0],
        [0, 0.49, "easeStep"]
    ]
});
new AssignPathAnimation(688, {
    _track: "bloqBuildup",
    _dissolve: [
        [1, 0],
        [0, 0.49, "easeStep"]
    ]
});

noteTrackRB("buildupR", "buildupB", 688, 702);

_customEvents.push({
    _time: 688,
    _type: "AnimateTrack",
    _data: {
        _track: "buildupR",
        _duration: 702 - 688,
        _color: [
            [0.658, 0.125, 0.125, 1, 0],
            [1, 1, 1, 1, 1, "easeInCirc"]
        ]
    }
}, {
    _time: 688,
    _type: "AnimateTrack",
    _data: {
        _track: "buildupB",
        _duration: 702 - 688,
        _color: [
            [0.125, 0.125, 0.658, 1, 0],
            [1, 1, 1, 1, 1, "easeInCirc"]
        ]
    }
});


//#endregion

//#region bomb resets
new PointDefinition("brBloq", [
    [1, 0],
    [0.1, 1]
]);
new PointDefinition("brArrow", [
    [1, 0],
    [0.5, 1]
]);
let doubles = filterDoubles(832, 888);
doubles.forEach(n => {
    if (doubles.indexOf(n) % 2) {
        let a = new AnimateTrack(n._time, {
            _track: "globalNotes",
            _duration: 2,
            _easing: "easeOutCirc",
            _dissolve: "brBloq",
            _dissolveArrow: "brArrow"
        });
        _customEvents.push(a)
    }
});
a = new AnimateTrack(890, {
    _track: "globalNotes",
    _duration: 1.5,
    _easing: "easeInOutQuad",
    _dissolve: [
        [0.1, 0],
        [1, 1]
    ],
    _dissolveArrow: [
        [0.5, 0],
        [1, 1]
    ]
});
_customEvents.push(a)
//#endregion

//#region drum hits
for (let i = 892; i <= 895; i++) {
    a = new AnimateTrack(i, {
        _track: "globalNotes",
        _duration: 0.25,
        _dissolve: [
            [0, 0],
            [1, 1, "easeStep"]
        ]
    });
    _customEvents.push(a);
}
//#endregion

//#region drop 2


// I added 64 to everything here because I changed the audio
moveBloqToSide(835 + 64, 847 + 64, 0.5, 1, "sdjfn2");
randomXpath(848 + 64, 850.5 + 64, 6, 4)

moveBloqToSide(851 + 64, 861 + 64, 1, -1, "sdjfn2");
moveBloqToSide(862 + 64, 863.5 + 64, 0.5, -1, "sdjfn2");
randomXpath(864 + 64, 866 + 64, 6, 4)

moveBloqToSide(867 + 64, 875.9 + 64, 0.5, 1, "sdjfn2");
moveBloqToSide(876 + 64, 876.9 + 64, 0.25, 1, "sdjfn2");
moveBloqToSide(877 + 64, 879 + 64, 0.5, 1, "sdjfn2");

filterednotes = _notes.filter(n => n._time >= 880 + 64 && n._time <= 893.5 + 64);
filterednotes.forEach(note => {
    rotSide *= -1;

    let data = note._customData;
    if (!data._animation) data._animation = {};
    let anim = data._animation;

    data._disableNoteGravity = true;

    let dupe = JSON.parse(JSON.stringify(note));
    let d1 = dupe._customData;
    let a1 = d1._animation;

    dupe._time += 0.05
    d1._fake = true;
    d1._interactable = false;
    d1._track = "flick";
    
    a1._dissolveArrow = [[0, 0]];

    anim._dissolve = [[0, 0]];

    if (previousTime != note._time) {
        _customEvents.push({
            _time: note._time,
            _type: "AnimateTrack",
            _data: {
                _track: "flick",
                _duration: 0.5,
                _dissolve: [
                    [0.25, 0],
                    [1, 0.5]
                ],
                _localRotation: [
                    [0, 0, 22 * rotSide, 0],
                    [0, 0, -22 * rotSide, 1, "easeOutElastic"]
                ]
            }
        });
    }
    previousTime = note._time;
    _notes.push(dupe);
})
//#endregion
//#region 1/3s 2


// I added 64 to everything here because I changed the audio
noteTrack("thirdsColor", 896 + 64, 898 + 64);
_customEvents.push({
    _time: 896 + 64,
    _type: "AnimateTrack",
    _data: {
        _track: "thirdsColor",
        _duration: 2,
        _color: [
            [1, 1, 1, 1, 0],
            [0.25, 0.25, 0.25, 1, 1]
        ]
    }
}, {
    _time: 896 + 64,
    _type: "AnimateTrack",
    _data: {
        _track: "thirdsNotes",
        _duration: 2,
        _localRotation: [
            [0, 0, 0, 0],
            [0, 0, 60, 1/6, "easeOutExpo"],
            [0, 0, 120, 1/3, "easeOutExpo"],
            [0, 0, 180, 0.5, "easeOutExpo"],
            [0, 0, 240, 2/3, "easeOutExpo"],
            [0, 0, 300, 5/6, "easeOutExpo"],
            [0, 0, 360, 1, "easeOutExpo"]
        ]
    }
});
filterednotes = _notes.filter(n => n._time >= 896 + 64 && n._time <= 898 + 64);
filterednotes.forEach(note => {
    let data = note._customData;
    if (!data._animation) data._animation = {};
    let anim = data._animation;

    data._disableNoteGravity = true;
    data._disableNoteLook = true;

    anim._dissolve = [[0, 0]];

    let dupe = JSON.parse(JSON.stringify(note));

    let d1 = dupe._customData;
    let a1 = d1._animation;

    d1._fake = true;
    d1._interactable = true;
    d1._disableSpawnEffect = true;
    d1._track = [
        "thirdsNotes",
        "thirdsColor",
        "globalNotes"
    ];

    a1._dissolve = [[1, 0]];
    a1._dissolveArrow = [[0, 0]];
    _notes.push(dupe);
});

//#endregion

//#region osu
osu(705, 767);
filterednotes = _notes.filter(n => n._time >= 705 && n._time <= 706 && !n._customData._fake);
filterednotes.forEach(note => {
    note._customData._animation._dissolve = [
        [0, 0],
        [1, 0.25]
    ];
    note._customData._animation._dissolveArrow = [
        [0, 0],
        [1, 0.25]
    ]
})
//#endregion
//#region bridge
new PointDefinition("slightPulse", [
    [1.5, 1.5, 1.5, 0],
    [1, 1, 1, 1, "easeOutCirc"]
]);

randomChaosIHonestlyDontKnowWhatAmIDoingAtThisPointAAAPlsHelpMe(768, 783.9)
fromSides(784, 799)
for (let i = 768; i <= 784; i++) {
    let a = new AnimateTrack(i, {
        _track: "globalNotes",
        _duration: 1,
        _scale: "slightPulse"
    });
    _customEvents.push(a);
}

randomChaosIHonestlyDontKnowWhatAmIDoingAtThisPointAAAPlsHelpMe(800, 815.9)
fromSides(816, 823.5)
for (let i = 800; i <= 816; i++) {
    let a = new AnimateTrack(i, {
        _track: "globalNotes",
        _duration: 1,
        _scale: "slightPulse"
    });
    _customEvents.push(a);
}
//#endregion
//#region long streams 2

// I added 64 to everything here because I changed the audio
let a2 = new AnimateTrack(0, {
    _duration: 0,
    _track: "spinningNotesOuter",
    _dissolveArrow: [
        [0, 0]
    ],
    _dissolve: [
        [0, 0]
    ]
});
_customEvents.push(a2);

for (let i = 898 + 64; i < 920 + 64; i++) {
    let o1 = new AnimateTrack(i, {
        _track: `spinningNotes`,
        _duration: 0.25,
        _dissolve: [
            [0, 0],
            [1, 1]
        ],
        _dissolveArrow: [
            [1, 0],
            [0, 1]
        ]
    });
    let i1 = new AnimateTrack(i, {
        _track: 'spinningNotesOuter',
        _duration: 0.25,
        _dissolve: [
            [1, 0],
            [0, 1]
        ],
        _dissolveArrow: [
            [0, 0],
            [1, 1]
        ]
    });
    _customEvents.push(o1, i1);
}

arrowBloqSurround(899 + 64, 911.9 + 64, "spinningNotes", 6, -1);
noteTrack("spinningNotes", 912 + 64, 914.9 + 64)
arrowBloqSurround(915 + 64, 919.9 + 64, "spinningNotes", 8, -1);

//#endregion

//#region 3/4 kicks
filterednotes = _notes.filter(n => n._time >= 984 && n._time <= 990.5 && Math.floor(n._time) !== 987);
filterednotes.forEach(note => {
    let a = new AnimateTrack(note._time, {
        _track: "globalNotes",
        _duration: 0.5,
        _scale: [
            [1.5, 1.5, 1.5, 0],
            [1, 1, 1, 0.99, "easeOutCubic"]
        ]
    });
    _customEvents.push(a);
});
//#endregion
//#region floating notes
filterNotes(993, 1007).forEach(n => {
    let data = n._customData;
    if (!data._animation) data._animation = {};
    let anim = data._animation;

    data._noteJumpStartBeatOffset = 2;
    data._disableNoteGravity = true;
    data._disableSpawnEffect = true;
    data._disableNoteLook = true;
    
    anim._position = [
        [random(-69, 69) / 10, random(-5, 50) / 10, -10, 0],
        [0, 0, 0, 0.45, "easeOutCirc"]
    ];
    anim._rotation = [
        [0, random(-45, 45), random(-60, 60), 0],
        [0, 0, 0, 0.45, "easeOutCirc"]
    ];
    anim._dissolve = "dissolveIn";
    anim._dissolveArrow = "dissolveIn";
});
//#endregion
//#region shakeeeeeeeeeeeeeeeeeee
for (let i = 1008, j = 0.1; i <= 1019.9; i++, j += 0.1) {
    let a = new AnimateTrack(i, {
        _track: "globalNotes",
        _duration: 1,
        _position: [
            [random(-7, 7)/20*j, random(-5, 5)/20*j, 0, 0],
            [random(-7, 7)/20*j, random(-5, 5)/20*j, 0, 0.125, "easeOutExpo"],
            [random(-7, 7)/20*j, random(-5, 5)/20*j, 0, 0.25, "easeOutExpo"],
            [random(-7, 7)/20*j, random(-5, 5)/20*j, 0, 0.375, "easeOutExpo"],
            [random(-7, 7)/20*j, random(-5, 5)/20*j, 0, 0.5, "easeOutExpo"],
            [random(-7, 7)/20*j, random(-5, 5)/20*j, 0, 0.625, "easeOutExpo"],
            [random(-7, 7)/20*j, random(-5, 5)/20*j, 0, 0.75, "easeOutExpo"],
            [random(-7, 7)/20*j, random(-5, 5)/20*j, 0, 0.875, "easeOutExpo"],
            [0, 0, 0, 1, "easeOutExpo"]
        ]
    });
    _customEvents.push(a);
}
let animate = new AnimateTrack(1008, {
    _track: "globalNotes",
    _duration: 11,
    _scale: [
        [1, 1, 1, 0],
        [1.5, 1.5, 1.5, 0.99],
        [1, 1, 1, 1]
    ]
});
_customEvents.push(animate);
//#endregion

//#region last drop
osu(1024, 1046);
osu(1057, 1064);
osu(1065, 1070);
/*
noteTrack(1024, 1072, "funnyPath", 1);
lrPath(1024, 1039, "funnyPath", 1, 0.5, 1, 12);
new AssignPathAnimation(1040, {
    _track: "funnyPath",
    _rotation: [0, 0, 0]
});
lrPath(1041, 1055, "funnyPath", 1, 0.5, 1, 12)
new AssignPathAnimation(1056, {
    _track: "funnyPath",
    _rotation: [0, 0, 0]
});
lrPath(1057, 1063, "funnyPath", 1, 0.5, 1, 12);
new AssignPathAnimation(1064, {
    _track: "funnyPath",
    _rotation: [0, 0, 0]
});
lrPath(1065, 1067, "funnyPath", 1, 0.5, 1, 12);
lrPath(1068, 1069.9, "funnyPath", 1, 0.5, 2/3, 12);
new AssignPathAnimation(1070, {
    _track: "funnyPath",
    _rotation: [0, 0, 0]
});
*/
//#endregion
//#region floating notes 2 (real)
filterNotes(1072, 1087).forEach(n => {
    let data = n._customData;
    if (!data._animation) data._animation = {};
    let anim = data._animation;

    data._noteJumpStartBeatOffset = 2;
    data._disableNoteGravity = true;
    data._disableSpawnEffect = true;
    data._disableNoteLook = true;
    
    anim._position = [
        [random(-69, 69) / 10, random(-5, 50) / 10, -10, 0],
        [0, 0, 0, 0.45, "easeOutCirc"]
    ];
    anim._rotation = [
        [0, random(-45, 45), random(-60, 60), 0],
        [0, 0, 0, 0.45, "easeOutCirc"]
    ];
    anim._dissolve = "dissolveIn";
    anim._dissolveArrow = "dissolveIn";
});
//#endregion
//#region wrist rolls
const rollKicks = [0, 1.5, 3, 4.5, 6, 7, 8, 9.5, 11, 12.5];
for (let i in rollKicks) {
    a = new AnimateTrack(1088 + rollKicks[i], {
        _track: "globalNotes",
        _duration: 2,
        _easing: "easeOutCirc",
        _dissolve: "brBloq",
        _dissolveArrow: "brArrow"
    });
    _customEvents.push(a);
}
a = new AnimateTrack(1102, {
    _track: "globalNotes",
    _duration: 1,
    _easing: "easeInExpo",
    _dissolve: "brBloq",
    _dissolveArrow: [
        [0.5, 0],
        [1, 1]
    ],
    _dissolve: [
        [0.1, 0],
        [1, 1]
    ]
});
_customEvents.push(a);

for (let i in rollKicks) {
    a = new AnimateTrack(1104 + rollKicks[i], {
        _track: "globalNotes",
        _duration: 2,
        _easing: "easeOutCirc",
        _dissolve: "brBloq",
        _dissolveArrow: "brArrow"
    });
    _customEvents.push(a);
}
a = new AnimateTrack(1118, {
    _track: "globalNotes",
    _duration: 1,
    _easing: "easeInExpo",
    _dissolve: "brBloq",
    _dissolveArrow: [
        [0.5, 0],
        [1, 1]
    ],
    _dissolve: [
        [0.1, 0],
        [1, 1]
    ]
});
_customEvents.push(a);

for (let i in rollKicks) {
    a = new AnimateTrack(1120 + rollKicks[i], {
        _track: "globalNotes",
        _duration: 2,
        _easing: "easeOutCirc",
        _dissolve: "brBloq",
        _dissolveArrow: "brArrow"
    });
    _customEvents.push(a);
}
a = new AnimateTrack(1134, {
    _track: "globalNotes",
    _duration: 1,
    _easing: "easeInExpo",
    _dissolve: "brBloq",
    _dissolveArrow: [
        [0.5, 0],
        [1, 1]
    ],
    _dissolve: [
        [0.1, 0],
        [1, 1]
    ]
});
_customEvents.push(a);

for (let i in rollKicks) {
    if (1136 + rollKicks[i] < 1144) {
        a = new AnimateTrack(1136 + rollKicks[i], {
            _track: "globalNotes",
            _duration: 2,
            _easing: "easeOutCirc",
            _dissolve: "brBloq",
            _dissolveArrow: "brArrow"
        });
        _customEvents.push(a);
    }
}
a = new AnimateTrack(1145, {
    _track: "globalNotes",
    _duration: 1,
    _easing: "easeInExpo",
    _dissolve: "brBloq",
    _dissolveArrow: [
        [0.5, 0],
        [1, 1]
    ],
    _dissolve: [
        [0.1, 0],
        [1, 1]
    ]
});
_customEvents.push(a);

//#endregion
//#region drums
for (let i = 1148; i <= 1151; i++) {
    a = new AnimateTrack(i, {
        _track: "globalNotes",
        _duration: 0.25,
        _dissolve: [
            [0, 0],
            [1, 1, "easeStep"]
        ]
    });
    _customEvents.push(a);
}
//#endregion
//#region ending
let direction = 1;
filterNotes(1155, 1184).forEach(n => {
    let data = n._customData;
    if (!data._animation) data._animation = {};
    let anim = data._animation;

    data._noteJumpStartBeatOffset = 2;
    data._disableSpawnEffect = true;
    data._disableNoteGravity = true;
    data._disableNoteLook = true;
    anim._dissolve = [0];

    for (let i = -4; i <= 4; i++) {
        for (let j = -4; j <= 4; j++) {
            let dupe = JSON.parse(JSON.stringify(n));
            let d1 = dupe._customData;
            let a1 = d1._animation;

            d1._fake = true;
            d1._interactable = false;
            d1._rotation = [22.5 * i, 22.5 * j, 0];
            d1._track = "elasticNote";

            a1._dissolve = [
                [0, 0],
                [1, 0.125],
                [1, 0.375],
                [0, 0.5, "easeOutCubic"]
            ];
            a1._dissolveArrow = [0];

            _notes.push(dupe)
        }
    }
    let posArr = [];
    switch (direction) {
        case 1:
            posArr = [-22.5, 0, 0, 0.99, "easeOutElastic"];
            break;
        case 2:
            posArr = [0, -22.5, 0, 0.99, "easeOutElastic"];
            break;
        case 3:
            posArr = [22.5, 0, 0, 0.99, "easeOutElastic"];
            break;
        case 4:
            posArr = [0, 22.5, 0, 0.99, "easeOutElastic"];
            break;
    }
    let a = new AnimateTrack(n._time, {
        _track: "elasticNote",
        _duration: 1,
        _rotation: [
            [0, 0, 0, 0],
            posArr,
            [0, 0, 0, 1, "easeStep"]
        ]
    });
    _customEvents.push(a);
    if (direction == 4) direction = 1; else direction++;
})
//#endregion

//#region Environment

_environment.push(
    {_id: "EnergyPanel$", _lookupMethod: "Regex", _track: "EnergyPanel"},
    {_id: "LeftPanel$", _lookupMethod: "Regex", _track: "LeftPanel"},
    {_id: "RightPanel$", _lookupMethod: "Regex", _track: "RightPanel"},
    {_id: "PlayersPlace$", _lookupMethod: "Regex", _track: "playerTrack"},
    {_id: "TrackMirror", _lookupMethod: "Contains", _active: false},
    {_id: "PS", _lookupMethod: "Contains", _active: false}
);


for (let i = 1, y = 2.3, pos = 35 ; i <= 15 ; i++, y -= 0.15, pos+=10) {
    _environment.push(
        { _id: `^.*\\[${i}\\]LightsTrackLaneRing.Clone.*Laser.{0,4}$`, _lookupMethod: "Regex", _scale: [1, 1.941, 1]},
        { _id: `^.*\\[${i}\\].{15}Ring.Clone.$`, _lookupMethod: "Regex", _scale: [y,y,1], _localPosition: [0,0,pos]}
    );
}
for (let i = 1, zpos = 0, lightid = 11 ; i <= 10 ; i++, zpos += 10, lightid += 2) {
    _environment.push(
        { _id: "34\\]Laser$" , _lookupMethod: "Regex" , _duplicate: 1 ,_localPosition: [0, 12.199, 19+zpos], _scale: [3, 0.008, 10], _rotation: [0, 0, 22.5], _lightID: lightid},
        { _id: "34\\]Laser$" , _lookupMethod: "Regex" , _duplicate: 1 ,_localPosition: [0, 12.199, 19+zpos], _scale: [3, 0.008, 10], _rotation: [0, 0,-22.5], _lightID: lightid+1}
    );
}
for (let i = 1, zpos = 0, lightid = 11 ; i <= 10 ; i++, zpos += 10, lightid += 2) {
    _environment.push(
        { _id: "Lights\\.\\[[0]\\]NeonTube$", _lookupMethod: "Regex", _active: true, _duplicate: 1, _scale:[0.25, 0.8, 3], _position: [1.85, -0.09, 19+zpos], _rotation: [0, 0, 90], _track: `LRailTrack`, _lightID: lightid},
        { _id: "Lights\\.\\[[0]\\]NeonTube$", _lookupMethod: "Regex", _active: true, _duplicate: 1, _scale:[0.25, 0.8, 3], _position:[-1.85, -0.09, 19+zpos], _rotation:[0, 0, -90], _track: `RRailTrack`, _lightID: lightid+1}
    );
}
for (let i = 1, numberId = 29, zpos = 0 ; i <= 5 ; i++, numberId++, zpos += 4.20) {
    _environment.push(
        { _id: `${numberId}\\]RotatingLasersPair( \\(\\d\\))?$`, _lookupMethod: "Regex", _position: [0, 0, 0]},
        { _id: `${numberId}\\]RotatingLasersPair.*BaseL$`, _lookupMethod: "Regex", _scale: [2, 2, 2], _position: [-16.9-zpos, -0.15, 68.99]},
        { _id: `${numberId}\\]RotatingLasersPair.*BaseR$`, _lookupMethod: "Regex", _scale: [2, 2, 2], _position: [ 16.9+zpos, -0.15, 68.99]}
    )
}
_environment.push(
    { _id: "Environment\\.\\[\\d{2}\\]NeonTube$", _lookupMethod: "Regex", _position: [-5.083, -0.0833, 18.666], _scale: [3, 1, 1]},
    { _id: "Environment\\.\\[\\d{2}\\]NeonTube \\(1\\)$", _lookupMethod: "Regex", _position: [5.083, -0.0833, 18.666], _scale: [3, 1, 1]},
    { _id: "Environment.{4}(Track)?(Construction|Mirror)", _lookupMethod: "Regex", _active: false},
    { _id: "PlayersPlace.\\[2\\]Construction$", _lookupMethod: "Regex", _duplicate: 1, _localPosition: [90, -0.24, 68.99], _scale: [0.5, 2, 0.1], _rotation: [90, 90, 0]},
  
    { _id: "Spectro", _lookupMethod: "Regex", _active: false},
    { _id: "3.\\]Laser( \\((1|2|3)\\))?$", _lookupMethod: "Regex", _active: false},
    { _id: "Lights\\.\\[[0,1]\\]NeonTube( \\(1\\))?$", _lookupMethod: "Regex", _active: false}
);
//_environment.push(
//    { _id: "(Environment.{1,5}Construction|Spectro|PS|Light|Neon|Laser|Track)", _lookupMethod: "Regex", _active: false}
//)
hideFog();


//#endregion




// #endregion                     -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  STOP  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -


// #region write file
const precision = 4; // decimals to round to  --- use this for better wall precision or to try and decrease JSON file size

const jsonP = Math.pow(10, precision);
const sortP = Math.pow(10, 2);
function deeperDaddy(obj) {
    if (obj) 
        for (const key in obj) {
            if (obj[key] == null) {
                delete obj[key];
            } else if (typeof obj[key] === "object" || Array.isArray(obj[key])) {
                deeperDaddy(obj[key]);
            } else if (typeof obj[key] == "number") {
                obj[key] = parseFloat(Math.round((obj[key] + Number.EPSILON) * jsonP) / jsonP);
            }
        }
    
}
deeperDaddy(difficulty);

difficulty._notes.sort((a, b) => parseFloat(Math.round((a._time + Number.EPSILON) * sortP) / sortP) - parseFloat(Math.round((b._time + Number.EPSILON) * sortP) / sortP) || parseFloat(Math.round((a._lineIndex + Number.EPSILON) * sortP) / sortP) - parseFloat(Math.round((b._lineIndex + Number.EPSILON) * sortP) / sortP) || parseFloat(Math.round((a._lineLayer + Number.EPSILON) * sortP) / sortP) - parseFloat(Math.round((b._lineLayer + Number.EPSILON) * sortP) / sortP));
difficulty._obstacles.sort((a, b) => a._time - b._time);
difficulty._events.sort((a, b) => a._time - b._time);

fs.writeFileSync(OUTPUT, JSON.stringify(difficulty, null, "\t"));

// #endregion
const data = JSON.parse(fs.readFileSync(OUTPUT))

console.log("\n--------------- NOODLE/CHROMA EVENTS STATS ---------------\n\n", data._customData._environment.length, "Environment pieces pushed\n", data._customData._customEvents.length, "Custom events pushed\n\n--------------- NORMAL MAP STATS ---------------\n\n", data._notes.length, "Notes\n", data._obstacles.length, "Walls\n", data._events.length, "Events")
console.log("\x1b[1m\x1b[32m", "\nAll pushes ran successfully!\n")