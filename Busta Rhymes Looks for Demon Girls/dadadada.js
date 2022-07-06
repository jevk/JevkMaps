
"use strict";

const fs = require("fs");

const INPUT = __dirname+"\\ExpertStandard.dat";
const OUTPUT =__dirname+"\\ExpertLawless.dat";

const NJS = 18; //NJS HERE
const OFFSET = -0.375; //OFFSET HERE

let difficulty = JSON.parse(fs.readFileSync(INPUT));


difficulty._customData = {
    _pointDefinitions: [],
    _customEvents: [],
    _environment: []
};

const _customData = difficulty._customData;
const _obstacles = difficulty._obstacles;
const _notes = difficulty._notes;
const _customEvents = _customData._customEvents;
const _pointDefinitions = _customData._pointDefinitions;
const _environment = _customData._environment;

let filterednotes;

_obstacles.forEach(wall => {
    if (!wall._customData) {
        wall._customData = {};
    }
    let data = wall._customData;
    data._noteJumpMovementSpeed = NJS;
    data._noteJumpStartBeatOffset = OFFSET;
});

_notes.forEach(note => {
    if (!note._customData) {
        note._customData = {};
    }
    let data = note._customData;
    data._noteJumpMovementSpeed = NJS;
    data._noteJumpStartBeatOffset = OFFSET;
    data._track = "globalNotes"
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
    constructor(time, lineIndex, lineLayer, type, direction, data) {
        this._time = time;
        this._lineIndex = lineIndex;
        this._lineLayer = lineLayer;
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
        _customEvents.push(this);
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

class AssignPlayerToTrack {
    constructor(time, track) {
        this._time = time;
        this._type = "AssignPlayerToTrack";
        this._data = {
            _track: track
        }
        _customEvents.push(this);
    }
}

class AssignTrackParent {
    constructor(time, childrenTracks, parentTrack) {
        this._time = time;
        this._type = "AssignTrackParent";
        this._data = {
            _childrenTracks: childrenTracks,
            _parentTrack: parentTrack
        }
        _customEvents.push(this);
    }
}

class AssignFogTrack {
    constructor(time, track) {
        this._time = time;
        this._type = "AssignFogTrack",
        this._data = {
            _track: track
        }
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

function HSVtoRGB(h, s, v) {
    let r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        (s = h.s), (v = h.v), (h = h.h);
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0:
            (r = v), (g = t), (b = p);
            break;
        case 1:
            (r = q), (g = v), (b = p);
            break;
        case 2:
            (r = p), (g = v), (b = t);
            break;
        case 3:
            (r = p), (g = q), (b = v);
            break;
        case 4:
            (r = t), (g = p), (b = v);
            break;
        case 5:
            (r = v), (g = p), (b = q);
            break;
    }
    return [r, g, b];
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
    filterNotes(p1, p2).forEach(object => {
        let d = object._customData;
        if (!d._track) 
            d._track = track;
         else if (Array.isArray(d._track)) {
            d._track.push(track)
        } else {
            d._track = [d._track, track];
        }
        if (typeof potentialOffset !== "undefined") {
            d._noteJumpStartBeatOffset = potentialOffset;
        }
    });
    return filterednotes;
}

function noteTrackRB(trackR, trackB, p1, p2, potentialOffset) {
    filterNotes(p1, p2).forEach(object => {
        let d = object._customData;
        if (typeof potentialOffset !== "undefined") {
            d._noteJumpStartBeatOffset = potentialOffset;
        }
        if (object._type == 0) {
            if (!d._track) 
                d._track = trackR;
             else if (Array.isArray(d._track)) {
                d._track.push(trackR)
            } else {
                d._track = [d._track, trackR];
            }
        }
        if (object._type == 1) {
            if (!d._track) 
                d._track = trackB;
             else if (Array.isArray(d._track)) {
                d._track.push(trackB)
            } else {
                d._track = [d._track, trackB];
            }
        }
    });
    return filterednotes;
}

function random(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

function chaos(start, end, offset) {
    filterNotes(start, end).forEach(n => {
        let data = n._customData;
        if (!data._animation) data._animation = {};
        let anim = data._animation;

        data._disableSpawnEffect = true;
        data._disableNoteGravity = true;
        data._noteJumpStartBeatOffset = offset;

        anim._position = [
            [random(-7, 7), random(-2, 8), random(-20, -10), 0],
            [random(-7, 7), random(3, 8), random(10, 20), 0.125, "easeInOutCubic"],
            [random(-7, 7), random(-2, 3), random(-5, -10), 0.25, "easeInOutCubic"],
            [random(-7, 7), random(1, 10), random(5, 10), 0.375, "easeInOutCubic", "splineCatmullRom"],
            [0, 0, 0, 0.45, "easeOutCirc", "splineCatmullRom"]
        ];
        anim._dissolve = "disIn";
        anim._dissolveArrow = "disIn";
    })
}

// #region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -

filterNotes(4, 48).forEach(n => {
    if (n._cutDirection == 8) {
        new AnimateTrack(n._time, {
            _track: "globalNotes",
            _duration: 1,
            _dissolve: [
                [0.5, 0],
                [1, 1, "easeOutCubic"]
            ]
        });
    }
});

new AnimateTrack(48, {
    _track: "globalNotes",
    _duration: 5,
    _dissolve: [
        [1, 0],
        [0, 0.5/5, "easeOutExpo"],
        [0, 4/5],
        [1, 1, "easeOutExpo"]
    ]
});

new PointDefinition("disIn", [
    [0, 0],
    [1, 0.125, "easeOutCubic"]
]);

chaos(53, 68, 6)
chaos(69, 83.99, 6)
chaos(131, 194, 6)

noteTrackRB("gradualPathR1", "gradualPathB1", 84, 99.9, 1)
for (let i = 84, j = 0; i <= 100; i += 1/16, j += 0.5) {
    new AssignPathAnimation(i, {
        _track: "gradualPathR1",
        _rotation: [
            [-j / 4, -j, j / 10, 0],
            [-j / 400, j / 100, 0, 0.45, "easeOutCirc"]
        ]
    });
    new AssignPathAnimation(i, {
        _track: "gradualPathB1",
        _rotation: [
            [-j / 4, j, -j / 10, 0],
            [-j / 400, j / 100, 0, 0.45, "easeOutCirc"]
        ]
    })
}
noteTrackRB("gradualPathR2", "gradualPathB2", 100, 115, 1)
for (let i = 100, j = 0; i <= 115; i += 1/16, j += 0.5) {
    new AssignPathAnimation(i, {
        _track: "gradualPathR2",
        _rotation: [
            [-j / 4, j, j / 10, 0],
            [-j / 400, j / 100, 0, 0.45, "easeOutCirc"]
        ]
    });
    new AssignPathAnimation(i, {
        _track: "gradualPathB2",
        _rotation: [
            [-j / 4, -j, -j / 10, 0],
            [-j / 400, j / 100, 0, 0.45, "easeOutCirc"]
        ]
    })
}

new AnimateTrack(124, {
    _duration: 8,
    _track: "globalNotes",
    _dissolve: [
        [1, 0],
        [0, 1/8, "easeOutExpo"],
        [0, 7.5/8],
        [1, 1, "easeInExpo"]
    ]
})

for (let i = 144, dir = 1; i <= 147.5; i += 0.5, dir *= -1) {
    if (i != 146 && i != 147) new Wall(i + 1, 4, {
        _scale: [1, 100, 1],
        _color: [1.2, 1.2, 1.2, -69],
        _localRotation: [random(-20, 20), random(-180, 180), 0],
        _fake: true,
        _interactable: false,
        _animation: {
            _dissolve: [
                [0, 0],
                [1, 0.125, "easeInExpo"],
                [0, 1, "easeOutQuad"]
            ],
            _definitePosition: [random(75, 150) / 10 * dir, -30, random(10, 30)]
        }
    })
}
for (let i = 160.5, dir = 1; i <= 161; i += 0.5, dir *= -1) {
    new Wall(i + 1, 4, {
        _scale: [1, 100, 1],
        _color: [1.2, 1.2, 1.2, -69],
        _localRotation: [random(-20, 20), random(-180, 180), 0],
        _fake: true,
        _interactable: false,
        _animation: {
            _dissolve: [
                [0, 0],
                [1, 0.125, "easeInExpo"],
                [0, 1, "easeOutQuad"]
            ],
            _definitePosition: [random(75, 150) / 10 * dir, -30, random(10, 30)]
        }
    })
}
for (let i = 0; i <= 3; i++) {
    new Wall(195, 20, {
        _scale: [100, 100, 1],
        _color: [0.3, 0.1, 0.1, -69],
        _rotation: [0, 90 * i, 0],
        _fake: true,
        _interactable: false,
        _animation: {
            _dissolve: [
                [0, 0],
                [1, 0.5/20, "easeInCirc"]
            ],
            _definitePosition: [-50, -25, 4]
        }
    })
}




















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

fs.writeFileSync(OUTPUT, JSON.stringify(difficulty, null, 0));

// #endregion

const data = JSON.parse(fs.readFileSync(OUTPUT))

console.log("\n--------------- NOODLE/CHROMA EVENTS STATS ---------------\n\n", data._customData._environment.length, "Environment pieces pushed\n", data._customData._customEvents.length, "Custom events pushed\n\n--------------- NORMAL MAP STATS ---------------\n\n", data._notes.length, "Notes\n", data._obstacles.length, "Walls\n", data._events.length, "Events")
console.log("\x1b[1m\x1b[32m", "\nAll pushes ran successfully!\n")