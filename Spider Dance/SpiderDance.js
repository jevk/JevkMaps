
"use strict";

const fs = require("fs");

const INPUT = __dirname+ "\\ExpertStandard.dat";
const OUTPUT = __dirname+"\\ExpertLawless.dat";

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

    data._track = ["wallTrack", "everything"];
    data._noteJumpStartBeatOffset = -0.5;
});

_notes.forEach(note => {
    if (!note._customData) {
        note._customData = {};

    }
    let data = note._customData;

    data._noteJumpStartBeatOffset = -0.5;
    data._track = ["noteTrack", "everything"];
}); 

class Wall {
    constructor(time, duration, data) {
        this._time = time;
        this._type = 1;
        this._width = 1;
        this._lineIndex = 0;
        this._duration = duration;
        this._customData = data;
    }
}

class AnimateTrack {
    constructor(time, data) {
        this._time = time;
        this._type = "AnimateTrack";
        this._data = data;
    }
}

class Note {
    constructor(time, x, y, type, direction, data) {
        this._time = time;
        this._lineIndex = x + 2;
        this._lineLayer = y;
        this._type = type;
        this._cutDirection = direction;
        this._customData = data;
    }
}

function filterNotes(start, end) {
    filterednotes = _notes.filter(n => n._time >= start && n._time <= end);
    return filterednotes;
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

function arrowToBloq(Start, End) {
    filterednotes = _notes.filter(n => n._time >= Start && n._time < End);
    filterednotes.forEach(note => {
        let data1 = note._customData;
        if (!data1._animation) data1._animation = {};
        let anim1 = data1._animation;

        data1._disableNoteGravity = true;
        data1._disableNoteLook = true;

        anim1._dissolveArrow = [
            [0, 0],
            [1, 0.5, "easeStep"]
        ];

        for (let i = 0, side = 1; i < 2; i++, side *= -1) { 
            let dupe = JSON.parse(JSON.stringify(note));
            let data = dupe._customData;
            data._fake = true;
            data._interactable = false;
  
            if (!data._animation) data._animation = {};
            let anim = data._animation;

            anim._position = [
                [1.5*side, 0, 0, 0],
                [1.5*side, 0, 0, 0.125],
                [0, 0, 0, 0.25, "easeInCirc"]
            ];
            anim._dissolve = [[0, 0]];
            anim._dissolveArrow = [
                [1, 0],
                [0, 0.5, "easeStep"]
            ];
  
            _notes.push(dupe);
        }
    });
}

function glitchKickOnDouble(start, end, track) {
    let previousTime = 0;
    _customEvents.push({
        _time: 0,
        _type: "AnimateTrack",
        _data: {
            _track: `0${track}`,
            _duration: 0,
            _dissolveArrow: [[0, 0]]
        }
    })
    filterNotes(start, end).forEach(n => {
        let data = n._customData;
        if (!data._animation) data._animation = {};
        let anim = data._animation;

        data._disableNoteLook = true;
        data._disableNoteGravity = true;

        
        for (let i = 0, s = -1; i <= 1; i++, s *= -1) {
            let n1 = JSON.parse(JSON.stringify(n));
            let d1 = n1._customData;
            let a1 = d1._animation;

            a1._dissolve = [[0,0]];

            d1._disableSpawnEffect = true;
            d1._interactable = false;
            d1._fake = true;
            d1._track.push(`${i + track}`);

            _notes.push(n1);

            if (previousTime == n._time) {
                _customEvents.push({
                    _time: n._time,
                    _type: "AnimateTrack",
                    _data: {
                        _track: `${i + track}`,
                        _duration: 0.5,
                        _position: [
                            [random(2, 9)/10 * s, random(-2,2)/10, 0, 0, "easeStep"],
                            [random(2, 9)/10 * -1 * s, random(-2,2)/10, 0, 0.25, "easeStep"],
                            [random(2, 9)/10 * s, random(-2,2)/10, 0, 0.5, "easeStep"],
                            [random(2, 9)/10 * -1 * s, random(-2,2)/10, 0, 0.75, "easeStep"],
                            [0, 0, 0, 1, "easeStep"]
                        ],
                        _dissolveArrow: [
                            [1, 0],
                            [i, 1, "easeStep"]
                        ],
                        _localRotation: [
                            [random(-5, 5), random(-5,5), random(-15, 15), 0, "easeStep"],
                            [random(-5, 5), random(-5,5), random(-15, 15), 0.25, "easeStep"],
                            [random(-5, 5), random(-5,5), random(-15, 15), 0.5, "easeStep"],
                            [random(-5, 5), random(-5,5), random(-15, 15), 0.75, "easeStep"],
                            [0, 0, 0, 1, "easeStep"]
                        ]
                    }
                });
            }
        }
        anim._dissolveArrow = [[0, 0]];
        previousTime = n._time;
    });
}

function chaoticAppear(start, end) {
    filterednotes = _notes.filter(n => n._time >= start && n._time <= end);
    filterednotes.forEach(note => {
        let data = note._customData;
        if (!data._animation) data._animation = {};
        let anim = data._animation;

        data._disableNoteGravity = true;
        data._disableSpawnEffect = true;
        data._noteJumpStartBeatOffset = 0;

        anim._dissolve = [
            [0, 0],
            [1, 0.25, "easeOutQuad"]
        ];
        anim._position = [
            [random(-5, 5), random(-1, 5), 6.9, 0],
            [random(-5, 5), random(-1, 5), -7.5, 0.125, "splineCatmullRom", "easeInCubic"],
            [0, 0, 0, 0.25, "splineCatmullRom", "easeOutCubic"]
        ];
        anim._scale = [
            [2, 2, 2, 0],
            [1, 1, 1, 0.25, "easeOutQuad"]
        ];
        anim._localRotation = [
            [random(-90, 90), random(-90, 90), random(-90, 90), 0],
            [random(-90, 90), random(-90, 90), random(-90, 90), 0.125, "easeInCubic"],
            [0, 0, 0, 0.25, "easeOutCubic"]
        ];
    });
}

// #region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -



let a23 = new AnimateTrack(0, {
    _track: "sideWall",
    _duration: 4,
    _dissolve: [
        [0, 0],
        [0, 0.75],
        [1, 1]
    ]
});
_customEvents.push(a23)



_pointDefinitions.push({
    _name: "dissolveIn",
    _points: [
        [0, 0],
        [1, 0.0625]
    ]
}, {
    _name: "upToDown",
    _points: [
        [0, 5, 0, 0],
        [0, 0, 0, 0.48, "easeOutCirc"]
    ]
});

filterednotes = _notes.filter(n => n._time <= 36);
filterednotes.forEach(note => {
    let data = note._customData;
    data._noteJumpStartBeatOffset = 4;
    data._disableNoteGravity = true;
    data._disableSpawnEffect = true;
});

noteTrackRB("introR", "introB", 0, 36)

for (let i = 0, j = 0 ; i <= 36 ; i += 1/32, j += 0.05) {
    let u = Math.sin(5*j/2)*180;
    //let u = Math.sin(Math.tan(Math.cos(5*j/2))*1.75)*180
    _customEvents.push({
        _time: i,   
        _type: "AssignPathAnimation",
        _data: {
            _track: "introR",
            _position: "upToDown",
            _dissolve: "dissolveIn",
            _dissolveArrow: "dissolveIn",
            _rotation: [
                [-20, 0, u, 0],
                [0, 0, 0, 0.48, "easeInOutCubic"]
            ]
        }
    }, {
        _time: i,
        _type: "AssignPathAnimation",
        _data: {
            _track: "introB",
            _position: "upToDown",
            _dissolve: "dissolveIn",
            _dissolveArrow: "dissolveIn",
            _rotation: [
                [-20, 0, -u, 0],
                [0, 0, 0, 0.48, "easeInOutCubic"]
            ]
        }
    });
}

glitchKickOnDouble(39.375, 52)
chaoticAppear(71.375, 98.375)


for (let i = 55.375; i <= 67; i += 0.5) {
    let a = new AnimateTrack(i, {
        _track: "noteTrack",
        _duration: 0.5,
        _scale: [
            [1.5, 1, 1, 0],
            [1, 1, 1, 1, "easeOutQuad"]
        ]
    });
    _customEvents.push(a);
}


arrowToBloq(103.375, 131.125)

filterNotes(131.375, 135).forEach(n => {
    let data = n._customData;
    if (!data._animation) data._animation = {};
    let anim = data._animation;

    data._disableNoteLook = true;
    data._disableNoteGravity = true;
    data._disableSpawnEffect = true;
    data._noteJumpStartBeatOffset = 1;
    
    anim._position = [
        [random(-5, 5), random(6, 12), 0, 0],
        [0, 0, 0, 0.475, "easeInOutCirc"]
    ];
    anim._rotation = [
        [0, random(-10, 10), random(-50, 50), 0],
        [0, 0, 0, 0.475, "easeInOutCirc"]
    ];
    anim._dissolve = "dissolveIn";
    anim._dissolveArrow = "dissolveIn"; 
});

noteTrack("leBruh", 133.375, 135.375)

for (let i = 133.375; i <= 135.375; i += 0.5) {
    let a = new AnimateTrack(i, {
        _track: "leBruh",
        _duration: 0.25,
        _easing: "easeOutQuad",
        _localRotation: [
            [0, 0, 0, 0],
            [0, 0, 90, 0.25],
            [0, 0, 180, 0.5],
            [0, 0, 270, 0.75],
            [0, 0, 0, 1],
        ]
    });
    _customEvents.push(a)
}








_environment.push(
    {_id: "Spectro", _lookupMethod: "Regex", _active: false},
    {_id: "Cones", _lookupMethod: "Regex", _active: false},
    {_id: "Window", _lookupMethod: "Regex", _active: false}
);







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

console.log("succesfully ran script");