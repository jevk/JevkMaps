
const fs = require("fs");

const INPUT = "ExpertPlusStandard.dat";
const OUTPUT = "ExpertPlusLawless.dat";

let difficulty = JSON.parse(fs.readFileSync(INPUT));

//#region this just counts how many time you ran it for fun, feel free to remove.
if (!fs.existsSync("count.txt")) {
  fs.writeFileSync("count.txt", parseInt("0").toString());
}
let count = parseInt(fs.readFileSync("count.txt"));
count++;
fs.writeFileSync("count.txt", count.toString());
console.log("YOU FUCKED UP "+count+" TIMES, FUCK YOU!");
//#endregion



//        -  -  -  -  -  -  -  -  -  -  -  -  -  LOOK BELOW FOR COMMENT TEXT WITH A LINE LIKE THIS. READ ALL OF THESE BEFORE USING!  -  -  -  -  -  -  -  -  -  -  -  -  -  





difficulty._customData = { _pointDefinitions: [], _customEvents: [], _environment: [] };

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
});

_notes.forEach(note => {
  if (!note._customData) {
    note._customData = {};
  }
});










//#region helper functions -  -  -  - These make life a LOT eassier, look through, figure out what they do, add your own, have fun :)  ---   Many are very specific use cases and might need to be modified depnding on use.

function getJumps(njs, offset) {
  const _startHalfJumpDurationInBeats = 4;
  const _maxHalfJumpDistance = 18;
  const _startBPM = 420; //INSERT BPM HERE -  -  -  -  -  -  -  -  -  -  -  -  -  
  const bpm = 666; //AND HERE -  -  -  -  -  -  -  -  -  -  -  -  -  
  const _startNoteJumpMovementSpeed = 23; //NJS -  -  -  -  -  -  -  -  -  -  -  -  -  
  const _noteJumpStartBeatOffset = -0.5; //OFFSET -  -  -  -  -  -  -  -  -  -  -  -  -  

  let _noteJumpMovementSpeed = (_startNoteJumpMovementSpeed * bpm) / _startBPM;
  let num = 60 / bpm;
  let num2 = _startHalfJumpDurationInBeats;
  while (_noteJumpMovementSpeed * num * num2 > _maxHalfJumpDistance) {
    num2 /= 2;
  }
  num2 += _noteJumpStartBeatOffset;
  if (num2 < 1) {
    num2 = 1;
  }
  const _jumpDuration = num * num2 * 2;
  const _jumpDistance = _noteJumpMovementSpeed * _jumpDuration;
  return { half: num2, dist: _jumpDistance };
}

function noteScale(startBeat, endBeat, track, interval, duration, magnitude) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _scale: [
          [magnitude, magnitude, magnitude, 0, "easeOutExpo"],
          [1, 1, 1, 0.9, "easeOutBack"]
        ]
      }
    });
  }
}

function arrowFlash(startBeat, endBeat, track, interval, duration) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _dissolveArrow: [[0, 0.499], [1, 0.5], [1, 1]]
      }
    });
  }
}

function bloqFlash(startBeat, endBeat, track, interval, duration) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _dissolve: [[0, 0.499], [1, 0.5], [1, 1]]
      }
    });
  }
}

function genCircle(radius, n) {
  let pointss = [];
  for (let i = 0; i < n; i++) {
    pointss.push([
      radius * Math.cos(((2 * Math.PI) / n) * i) - 0.5,
      radius * Math.sin(((2 * Math.PI) / n) * i) * 1.16 - 1.6
    ]);
  }
  return pointss;
}
function genCircleNoCorrection(radius, n) {
  let pointss = [];

  for (let i = 0; i < n; i++) {
    pointss.push([
      radius * Math.cos(((2 * Math.PI) / n) * i),
      radius * Math.sin(((2 * Math.PI) / n) * i)
    ]);
  }
  return pointss;
}

function round(value, decimals) {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}

function DecayShakePath(xAmp, yAmp, zAmp, points, easing = "easeStep") {
  let step = 1 / points;
  let tog = false;
  let WOWTHISISANAME = [[0, 0, 0, 0]];
  for (let i = 0; i < points; i++) {
    let xVal = xAmp * (1 - i * step);
    let yVal = yAmp * (1 - i * step);
    let zVal = zAmp * (1 - i * step);
    if (tog) {
      xVal = -xVal;
      yVal = -yVal;
      zVal = -zVal;
    }
    WOWTHISISANAME.push([xVal, yVal, zVal, (i + 1) * step, easing]);

    tog = !tog;
  }
  return WOWTHISISANAME;
}

function offestOnNotesBetween(p1, p2, offset) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    //always worth having.
    //man this shit BETTER not be undefined.
    if (typeof offset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = offset;
    }
  });
  return filterednotes;
}

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

function trackOnNotesBetweenTimeSep(track, Start, End, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(object => {
    object._customData._track = `${track + object._time}`;

    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
  });
  return filterednotes;
}
function disableNoteLook(Start, End) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time < End);
  filterednotes.forEach((note) => {
    note._customData._disableNoteLook = true;
  });
}
function notesAt(times) {
  return _notes.filter(n => times.some(t => n._time == t));
}

function trackOnNotesBetween(track, p1, p2, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    object._customData._track = track;
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
  });
  return filterednotes;
}

//applies a track to notes on two tracks between two times based on the color of the notes
//IT GONNA FUCK UP WITH BOMBS I TELL YOU HWAT BOI
//red, blue, p1, p2, potentialOffset
function trackOnNotesBetweenRBSep(trackR, trackB, p1, p2, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
    if (object._type == 0) {
      object._customData._track = trackR;
    }
    if (object._type == 1) {
      object._customData._track = trackB;
    }
  });
  return filterednotes;
}

function offestOnNotesBetweenRBSep(
  trackR,
  trackB,
  p1,
  p2,
  potentialOffset,
  offsetR,
  offsetB
) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
    if (object._type == 0) {
      object._customData._track = trackR;
      object._customData._noteJumpStartBeatOffset = offsetR;
    }
    if (object._type == 1) {
      object._customData._track = trackB;
      object._customData._noteJumpStartBeatOffset = offsetB;
    }
  });
  return filterednotes;
}

//p1, p2, potentialoffset, up, down, left, right,
//TODO: ADD OTHER DIRS
function trackOnNotesBetweenDirSep(
  p1,
  p2,
  potentialOffset,
  trackUp,
  trackDown,
  trackLeft,
  trackRight
) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (object._cutDirection == 0 && typeof trackUp !== "undefined") {
      object._customData._track = trackUp;
    }
    if (object._cutDirection == 1 && typeof trackUp !== "undefined") {
      object._customData._track = trackDown;
    }
    if (object._cutDirection == 2 && typeof trackUp !== "undefined") {
      object._customData._track = trackLeft;
    }
    if (object._cutDirection == 3 && typeof trackUp !== "undefined") {
      object._customData._track = trackRight;
    }
    //i might want to make this only run if I assign a track...
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
  });
  return filterednotes;
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function floatingPath(Start, End, assignTrack, offset, posx, posx2, posy, posy2) {
  disableNoteLook(Start, End)
  trackOnNotesBetween(assignTrack, Start, End)
  offestOnNotesBetween(Start, End, offset)
  
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {

    let xpos = (getRndInteger(posx,posx2) * 0.1);
    let ypos = (getRndInteger(posy,posy2) * 0.1);

    let xrot = posy * -1;
    let yrot = posx / 2;

    if (!note._customData._animation) note._customData._animation = {};

    note._customData._track = assignTrack;
    //note._customData._easing = "easeOutCirc";
    note._customData._animation._position = [
      [(getRndInteger(posx,posx2) * 0.1), (getRndInteger(posy,posy2) * 0.1), 0, 0],
      [0, 0, 0, 0.48, "easeOutCirc"]
    ];
    note._customData._animation._localRotation = [
      [xrot, yrot, 0, 0],
      [0, 0, 0, 0.35, "easeOutSine"]
    ];
    note._customData._animation._dissolveArrow = [ 
      [0, 0],
      [1, 0.3, "easeInOutCubic"]
    ];
    note._customData._animation._dissolve = [
      [0, 0],
      [1, 0.7, "easeOutCubic"]
    ];
  });
}

function flickOnNote(Start, End, assignTrack, rot, potentialOffset) {
  let currentRotation = rot;
  _customEvents.push({
    _time: Start-0.1,
    _type: "AnimateTrack",
    _data: {
      _track: assignTrack,
      _duration: 1,
      _localRotation: [
        [0, 0, 0, 0],
        [0, 0, currentRotation, 0.1, "easeInCubic"]
      ]
    }
  }, {
    _time: End + 0.5,
    _type: "AnimateTrack",
    _data: {
      _track: assignTrack,
      _duration: 1,
      _localRotation: [
        [0, 0, 0, 0]
      ]
    }
  });
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {
    note._customData._track = assignTrack;
    trackOnNotesBetween(assignTrack, Start, End)
    currentRotation *= -1;
    _customEvents.push({
      _time: note._time-0.25,
      _type: "AnimateTrack",
      _data: {
        _track: assignTrack,
        _duration: 1,
        _localRotation: [
          [0, 0, currentRotation*-1, 0],
          [0, 0, currentRotation, 0.25, "easeInCubic"]
        ]
      }
    });
    if (typeof potentialOffset !== "undefined") {
      note._customData._noteJumpStartBeatOffset = potentialOffset;
    }
  });
}

function randPath(Start, End, AssignTrack, x1, x2, y1, y2, potentialOffset) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {    
    if (typeof potentialOffset !== "undefined") {
      note._customData._noteJumpStartBeatOffset = potentialOffset;
    }

    if (!note._customData._animation) note._customData._animation = {};
    randPosX1 = getRndInteger(x1, x2);
    randPosX2 = getRndInteger(x1, x2);
    randPosY = getRndInteger(y1, y2);

    note._customData._track = AssignTrack;
    note._customData._animation._position = [
      [randPosX1, randPosY, 0, 0],
      [randPosX2, randPosY/2, 0, 0.25, "splineCatmullRom"],
      [0, 0, 0, 0.47, "splineCatmullRom", "easeOutCubic"]
    ];
  });
}

function arrowCurve(Start, End, amount, xRot, yRot, zRot) {
  rotatoX = xRot; //Original Value -6
  rotatoY = yRot; //Original Value 2
  rotatoZ = zRot; //Original Value 7
  filterednotes = _notes.filter((n) => n._time >= Start && n._time < End);
  filterednotes.forEach((note) => {
    for (let index = 1; index < amount; index++) {
      rotatoX += -6;
      rotatoY += 2;
      rotatoZ += 7;
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 0.0625 * index;
      if (!n1._customData._animation) n1._customData._animation = {};
      if (n1._type == 1) {
        n1._customData._animation._definitePosition = [
          [0, 0, 1, 0.5],
          [6 * index, 8, 30, 1],
        ];
        n1._customData._animation._rotation = [
          [0, 0, 0, 0.45],
          [rotatoX, rotatoY, rotatoZ, 1],
        ];
        n1._customData._animation._localRotation = [
          [0, 0, 0, 0.45],
          [rotatoX, rotatoY, rotatoZ, 1],
        ];
        n1._customData._animation._dissolve = [[0, 0]];
        n1._customData._animation._dissolveArrow = [
          [0, 0],
          [0, 0.5],
          [1, 0.55],
        ];
        n1._customData._fake = true;
        n1._customData._interactable = false;
        n1._customData._disableSpawnEffect = true;
        _notes.push(n1);
      }
      if (n1._type == 0) {
        n1._customData._animation._definitePosition = [
          [0, 0, 1, 0.5],
          [-6 * index, 8, 30, 1],
        ];
        n1._customData._animation._rotation = [
          [0, 0, 0, 0.45],
          [rotatoX, -1 * rotatoY, -1 * rotatoZ, 1],
        ];
        n1._customData._animation._localRotation = [
          [0, 0, 0, 0.45],
          [rotatoX, -1 * rotatoY, -1 * rotatoZ, 1],
        ];
        n1._customData._animation._dissolve = [[0, 0]];
        n1._customData._animation._dissolveArrow = [
          [0, 0],
          [0, 0.5],
          [1, 0.55],
        ];
        n1._customData._fake = true;
        n1._customData._interactable = false;
        n1._customData._disableSpawnEffect = true;
        _notes.push(n1);
      }
    }
  });
} 

function dissolveGlitch(Start, End, interval, duration, assignTrack) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time < End);
  filterednotes.forEach((note) => {
    note._customData._track = assignTrack;
  });
  for (i = Start ; i <= End ; i += interval) {
    _customEvents.push({
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: assignTrack,
        _duration: duration,
        _dissolve: "kickDis",
        _dissolveArrow: "kickDis",
        _position: "kickPos",
        _scale: "kickScale"
      }
    });
  }
}

function bounceRot(Start, End, height, side, interval, assignTrack, easing, potentialOffset) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time < End);
  filterednotes.forEach((note) => {    
    if (typeof potentialOffset !== "undefined") {
      note._customData._noteJumpStartBeatOffset = potentialOffset;
    }
    note._customData._track = assignTrack;
  });
  for (i = Start ; i <= End ; i += interval*2) {
    _customEvents.push({
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: assignTrack,
        _duration: interval,
        _rotation: [
          [0, side*-1, 0, 0],
          [height*-1, 0, 0, 0.5, "splineCatmullRom", `easeIn${easing}`],
          [0, side, 0, 1, "splineCatmullRom", `easeOut${easing}`]
        ],
        _scale: [
          [1.25, 0.875, 1, 0],
          [1, 1, 1, 0.5, `easeIn${easing}`],
          [1.25, 0.875, 1, 1, `easeOut${easing}`]
        ]
      }
    });
  }
  for (i = Start + 1 ; i <= End ; i += interval*2) {
    _customEvents.push({
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: assignTrack,
        _duration: interval,
        _rotation: [
          [0, side, 0, 0],
          [height*-1, 0, 0, 0.5, "splineCatmullRom", `easeIn${easing}`],
          [0, side*-1, 0, 1, "splineCatmullRom", `easeOut${easing}`]
        ],
        _scale: [
          [1.25, 0.875, 1, 0],
          [1, 1, 1, 0.5, `easeIn${easing}`],
          [1.25, 0.875, 1, 1, `easeOut${easing}`]
        ]
      }
    });
  }
}

function sidePath(Start, End, side, assignTrack, easing, potentialOffset) {
  _customEvents.push({
    _time: (Start - 2 - potentialOffset),
    _type: "AssignPathAnimation",
    _data: {
      _track: `${assignTrack + "B"}`,
      _dissolve: [
        [0, 0],
        [0.25, 0.1, `easeOut${easing}`],
        [0.5, 0.2, `easeInOut${easing}`],
        [1, 0.7, `easeInOut${easing}`]
      ],
      _dissolveArrow: [
        [0, 0],
        [1, 0.3],
      ],
      _position: [
        [side, 0, 0, 0],
        [((side / 2) * -1), 0, 0, 0.05, `easeOut${easing}`],
        [((side / 3) * -1), 0, 0, 0.125, `easeOut${easing}`],
        [0, 0, 0, 0.25, `easeInOut${easing}`]
      ]
    }
  }, {
    _time: (Start - 2 - potentialOffset),
    _type: "AssignPathAnimation",
    _data: {
      _track: `${assignTrack + "R"}`,
      _dissolve: [
        [0, 0],
        [0.25, 0.1, `easeOut${easing}`],
        [0.5, 0.2, `easeInOut${easing}`],
        [1, 0.7, `easeInOut${easing}`]
      ],
      _dissolveArrow: [
        [0, 0],
        [1, 0.3],
      ],
      _position: [
        [side * -1, 0, 0, 0],
        [side / 2, 0, 0, 0.05, `easeOut${easing}`],
        [side / 3, 0, 0, 0.125, `easeInOut${easing}`],
        [0, 0, 0, 0.25, `easeInOut${easing}`]
      ]
    }
  });

  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {
    if (note._type == 0) {note._customData._track = `${assignTrack + "R"}`};
    if (note._type == 1) {note._customData._track = `${assignTrack + "B"}`};    
    if (typeof potentialOffset !== "undefined") {
      note._customData._noteJumpStartBeatOffset = potentialOffset;
    }
  });
}

function freeze(Start, End, freezeDuration, duration, assignTrack, potentialOffset) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time < End);
  filterednotes.forEach((note) => {
    note._customData._track = `${assignTrack + note._time}`;

    if (typeof potentialOffset !== "undefined") {
      note._customData._noteJumpStartBeatOffset = potentialOffset;
    }
    _customEvents.push({
      _time: 0,
      _type: "AssignPathAnimation",
      _data: {
        _track: `${assignTrack + note._time}`,
        _duration: duration,
        _definitePosition: [
          [0, 0, (note._time - Start + 20), 0],
          [0, 0, (note._time - Start + 20), (freezeDuration / duration)],
          [0, 0, 0, ((freezeDuration / duration) + 0.5)],
          [0, 0, (note._time - Start - 20), 1]
        ]
      }
    });
  });
}



function dissolveOnArrow(Start, End, duration, track, potentialOffset) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time < End);
  filterednotes.forEach((note) => {
    note._customData._track = track;

    if (typeof potentialOffset !== "undefined") {
      note._customData._noteJumpStartBeatOffset = potentialOffset;
    }

    if (note._cutDirection != 8) {
      _customEvents.push({
        _time: note._time,
        _type: "AnimateTrack",
        _data: {
          _track: track,
          _easing: "easeStep",
          _duration: duration,
          _dissolve: [
            [0, 0],
            [1, 1]
          ]
        }
      });
    }
  });
}

function scaleOnNote(Start, End, AssignTrack, amplitude) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    note._customData._track = AssignTrack;
    if (note._type != 3 || note._direction != 8) {
      _customEvents.push({
        _time: note._time,
        _type: "AnimateTrack",
        _data: {
          _track: AssignTrack,
          _duration: 1,
          _scale: [
            [1,1,1,0],
            [amplitude,1,1,0.125],
            [1,1,1,0.625]
          ]
        }
      });   
    }
  });
}

function kickOnDouble(Start, End, AssignTrack, rotAmp, posAmp, rotEasing, posEasing) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  previousNoteTime = 0;
  rotationDir = 1;
  filterednotes.forEach((note) => {
    note._customData._track = AssignTrack;
    currentNoteTime = note._time;
    if (currentNoteTime == previousNoteTime && note._type != 3) {
      _customEvents.push({
        _time: note._time,
        _type: "AnimateTrack",
        _data: {
          _track: AssignTrack,
          _duration: 1,
          _position: [
            [0, posAmp, 0, 0],
            [0, (posAmp * -1) / 2, 0, 0.5, `easeOut${posEasing}`],
            [0, 0, 0, 1, `easeInOut${posEasing}`]
          ],
          _localRotation: [
            [0, 0, rotAmp*rotationDir, 0],
            [0, 0, 0, 1, `easeOut${rotEasing}`]
          ],
          _dissolve: [
            [0, 0],
            [0.5, 0.25, "easeOutExpo"],
            [1, 1, `easeInOut${posEasing}`]
          ]
        }
      });
      rotationDir *= -1
    }
    previousNoteTime = currentNoteTime;
  });
}
function sepHitbox(Start, End, AssignTrack) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    let n1 = JSON.parse(JSON.stringify(note));
    n1._time = note._time;
    n1._customData._track = AssignTrack;
    if (!n1._customData._animation) n1._customData._animation = {};
    n1._customData._animation._dissolve = [[0, 0],[1,0.49,"easeStep"]];
    n1._customData._animation._dissolveArrow = [[0, 0],[1,0.49,"easeStep"]];
    _notes.push(n1);
    note._customData._fake = true;
    note._customData._interactable = false;
    if (!note._customData._animation) note._customData._animation = {};
    note._customData._animation._dissolve = [[1, 0],[0,0.49,"easeStep"]];
    note._customData._animation._dissolveArrow = [[1, 0],[0,0.49,"easeStep"]];
  });
}
//#endregion

//#region  EXAMPLES   -  -  -  -  -  -  -  -  -  -  -  -  -  use these as a copy/paste template for the lazy   -  -  -  -  -  -  -  -  -  -  -  -  - 


// ---- function calling example - use these when possible to get rid of clutter and make life easier

// trackOnNotesBetween("dumb track name here", start beat here, end beat here, offset here);    





// These three bits below are different ways of filtering notes by time. You can filter notes by specific beats, or by sections of beats. 
// Data written here, will be applied directly to the note, and any animation data will act as a "path animation" and will animate over the course of each individual notes life, not by specific beats. 
// ----  Usually follows [x,y,z,time]  ----  Note: when adding animatios directly to the note (path animations); time "0" is note spawn - "0.5" is when the note is at players feet, and "1" is when the note dies

// It's good practice to have the note at it's original position by ~0.4,0.45 to compensate for sabers being long and the player usually cutting the note before it arrives ath the feet on the platform. 
// Also, if you want to do funny animations, use a longer offset - as long as your custom animation finishes around "0.45" the player will percieve it as a comfortable offset (yes, even if it's at like +10)




// filterednotes = notesAt([insert specific note time/beat here]);
// filterednotes.forEach(note => {
//   note._customData._noteJumpStartBeatOffset = -0.1;       // tbh I only really use this for NJS/offset changes and to remove the spawn effect.
//   note._customData._noteJumpMovementSpeed = 17;       
//   note._customData._animation = {}         // this chunk of text is required if doing any note animations this way
//   note._customData._animation._rotation = [[-90, 0, 0, 0],[0,0,0,0.5,"easeOutElastic"]];     // feel free to use any of the other animation properties from the github --- these will add each animation on a per note basis
// });
// 
// filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
// filterednotes.forEach(note => {
//   note._customData._track = "dumb track name here";
//   note._customData._noteJumpStartBeatOffset = 69;
//   note._customData._noteJumpMovementSpeed = 420;
// });
// 
// filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
// filterednotes.forEach(note => {
//   note._customData._track = "dumb track name here";
//   note._customData._noteJumpStartBeatOffset = 666;
//   note._customData._noteJumpMovementSpeed = 777;
//   note._customData._fake = true;
//   note._customData._interactable = false;
//   note._customData._disableSpawnEffect = "true"   // NOTE: removing spawn effect will scuff practice mode if you try and play at a section or track with a note already spawnd that has this property set to true - you need to start playing before these spawn in
// });









//use this to push "_customEvents" like track animations, path animations, track parenting, assigning player to track, etc.

// _customEvents.push({
//   _time: 69,
//   _type: "AnimateTrack",
//   _data: {
//     _track: "dumb track name here",
//     _duration: 420,
//     _easing: "easeOutQuad",
//     _position: [[0, 0, 0, 0], [0, 10, 10, 1]],
//     _rotation: [[0, 180, 0, 0]],
//     _dissolve: [[1, 0], [0, 0.8]],
//     _dissolveArrow: [[1, 0], [0, 1]]
//   }
// });       



// you can string together multiple thingies by adding a comma after ""}"" and slapping in another {} thingy - like so vvvvvvvvv

// If your track/note animation spawns normally, and kind of "jumps" or snaps to the next spot, make sure the note/track is in the desired position before the notes spawn. - Adjust animation time to before note spawns
//   ---   The example below will snap to _rotation "20" on the y axis, because at _time "0", y axis was at "-15"   ---   you gotta make sure these match :)

// _customEvents.push({
//   _time: 0,
//   _type: "AnimateTrack",
//   _data: {
//     _track: "dumb track name here",
//     _duration: 1,
//     _position: [[0, 0, 0, 0]],
//     _rotation: [[0, -15, 0, 0]],
//     _dissolve: [[1, 0]],
//     _dissolveArrow: [[1, 0]]
//   }
// }, {
//   _time: 69,
//   _type: "AnimateTrack",
//   _data: {
//     _track: "dumb track name here",
//     _duration: 420,
//     _easing: "easeOutQuad",
//     _position: [[0, 0, 0, 0], [0, 10, 10, 1]],
//     _rotation: [[0, 20, 0, 0]],
//     _dissolve: [[1, 0], [0, 0.8]],
//     _dissolveArrow: [[1, 0], [0, 1]]
//   }
// });

// you can also modify these push things to add in _pointDefinitions, _notes, _obstacles, and _events (lighting)   ----    There are better examples of this in the original demo.js file from the NE Documentation and some of the functions above. 


//#endregion

//#region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -

_pointDefinitions.push(
  {
    _name: "kickScale",
    _points: [
      [1, 1, 1, 0],
      [1.5, 1, 1, 0.1, "easeStep"],
      [1, 1, 1, 0.75, "easeInOutElastic"],
    ]
  },
  {
    _name: "kickPos",
    _points: [
      [0, 0, 0, 0],
      [-0.2, 0, 0, 0.1, "easeOutElastic"],
      [0.2, 0, 0, 0.2, "easeOutElastic"],
      [-0.15, 0, 0, 0.3, "easeOutElastic"],
      [0.15, 0, 0, 0.4, "easeOutElastic"],
      [-0.1, 0, 0, 0.5, "easeOutElastic"],
      [0.1, 0, 0, 0.6, "easeOutElastic"],
      [-0.05, 0, 0, 0.7, "easeOutElastic"],
      [0, 0, 0, 0.75, "easeOutElastic"],
    ]
  },
  {
    _name: "kickDis",
    _points: [
      [1, 0],
      [0.4, 0.1, "easeInOutBack"],
      [0.7, 0.6, "easeInOutBack"],
      [1, 0.75, "easeOutBounce"],
    ]
  }
);


_customEvents.push({
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "floatingPathTrack",
    _dissolve: [
      [0, 0],
      [0.85, 0.5]
    ],
    _dissolveArrow: [
      [0, 0],
      [1, 0.3]
    ]
  }
}, {
  _time: 76,
  _type: "AnimateTrack",
  _data: {
    _track: "randomPath",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0.5, 1, "easeInOutCubic"]
    ]
  }
});

for (i = 78 ; i <= 103.99 ; i += 4) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "randomPath",
      _duration: 1,
      _dissolve: [
        [0.5, 0],
        [0.75, 1]
      ]
    }
  }, {
    _time: i + 2,
    _type: "AnimateTrack",
    _data: {
      _track: "randomPath",
      _duration: 1,
      _dissolve: [
        [0.75, 0],
        [0.5, 1]
      ]
    }
  });
}

_customEvents.push({
  _time: 160,
  _type: "AnimateTrack",
  _data: {
    _track: "randomPath",
    _duration: 1,
    _dissolve: [
      [1, 0]
    ]
  }
});

floatingPath(12, 43, "floatingPathTrack", 2, -30, 30, -10, 60)
flickOnNote(44, 75.51, "flickTrack", 20)

randPath(76, 103.99, "randomPath", -10, 10, 10, 10, 4)
arrowCurve(76 , 76.10, 6, 4, 1, 5)
arrowCurve(84 , 84.10, 6, 4, 1, 5)
arrowCurve(92 , 92.10, 6, 4, 1, 5)
arrowCurve(96 , 96.10, 6, 4, 1, 5)
arrowCurve(100, 100.1, 6, 4, 1, 5)
arrowCurve(102, 102.1, 6, 4, 1, 5)
arrowCurve(104, 107.5, 3, 4, 1, 5)


trackOnNotesBetween("kickGlitch", 153.01, 155.99)
dissolveGlitch(108, 135, 1, 0.75, "kickGlitch")
dissolveGlitch(140, 153, 1, 0.75, "kickGlitch")
dissolveGlitch(156, 164, 1, 0.75, "kickGlitch")

trackOnNotesBetween("flickTrack", 171, 171.9)
flickOnNote(168, 171, "flickTrack", 20)

_customEvents.push({
  _time: 160,
  _type: "AnimateTrack",
  _data: {
    _track: "bouncy",
    _duration: 1,
    _rotation: [
      [0, 0, 0, 0],
      [0, -5, 0, 1,"easeInOutCubic"]
    ]
  }
});

bounceRot(180, 187.5, 3.5, 5, 1, "bouncy", "Quad")
bounceRot(196, 203.5, 3.5, 5, 1, "bouncy","Quad")
bounceRot(212, 219.5, 3.5, 5, 1, "bouncy", "Quad")

sidePath(172, 179, 15, "sideAppear", "Circ", 2)
sidePath(188, 195, 15, "sideAppear", "Circ", 2)
sidePath(204, 211, 10, "sideAppear", "Circ", 4)
sidePath(220, 228, 5 , "sideAppear", "Circ", 4)


// weird appearing thingy I guess 

trackOnNotesBetween("appearingThing", 230, 235.9, 6)

_customEvents.push({
  _time: 160,
  _type: "AnimateTrack",
  _data: {
    _track: "appearingThing",
    _duration: 1,
    _dissolve: [[0,0]],
    _dissolveArrow: [[0,0]]
  }
}, {
  _time: 227,
  _type: "AnimateTrack",
  _data: {
    _track: "appearingThing",
    _duration: 1,
    _dissolve: [
      [0,0],
      [0.5,1,"easeOutCirc"]
    ],
    _dissolveArrow: [
      [0,0],
      [1,1,"easeOutCirc"]
    ]
  }
}, {
  _time: 228,
  _type: "AnimateTrack",
  _data: {
    _track: "appearingThing",
    _duration: 1,
    _dissolve: [
      [0.5,0],
      [1,1,"easeOutCirc"]
    ]
  }
}, {
  _time: 227,
  _type: "AnimateTrack",
  _data: {
    _track: "appearingThing",
    _duration: 4,
    _position: [
      [0, 0, -8, 0],
      [0, 0, 0, 0.25]
    ]
  }
});



//break

floatingPath(301, 316.9, "floatPath1", 1, -50,-25, 0, 10)
floatingPath(317, 332.9, "floatPath2", 1, 50,25, 0, 10)
floatingPath(333, 348.9, "floatPath3", 1, -50,-25, 75,50)
floatingPath(349, 364.9, "floatPath4", 1, 50,25, 75,50)

flickOnNote(365, 428, "flickNote", 10)

scaleOnNote(429, 494, "scalePulse", 1.5)

dissolveOnArrow(248, 252, 0.25, "flicker")
trackOnNotesBetween("flicker", 252, 254)

//poggers


randPath(252, 265, "figgerNaggot", -15, 15, -5, 5, 4)


//reverse

trackOnNotesBetween("reverseTrack", 269, 282.5, 14)
disableNoteLook(269, 282.5)

_customEvents.push({
  _time: 265-0.125,
  _type: "AnimateTrack",
  _data: {
    _track: "reverseTrack",
    _duration: 4,
    _rotation: [
      [0, 0, 0, 0],
      [-1, 0, 0, 0.125],
      [-1, 0, 0, 0.75],
      [0, 0, 0, 0.875, "easeOutBack"]
    ],
    _scale: [
      [1, 1, 1, 0.075],
      [1, 1.25, 1.25, 0.125, "easeInOutCubic"],
      [1, 1, 1, 0.175, "easeInOutCubic"],
      [1, 1, 1, 0.7],
      [1, 1.25, 1.25, 0.75, "easeInOutCubic"],
      [1, 1, 1, 0.8, "easeInOutCubic"]
    ],
    _dissolve: [
      [1, 0],
      [0.75, 0.125, "easeInExpo"],
      [1, 0.875, "easeStep"]
    ],
    _position: [
      [0, 0, 23, 0],
      [0, 0, -20, 0.125, "easeOutSine"],
      [0, 0, 0, 0.75],
      [0, 0, 0, 0.875, "easeInOutCirc"]
    ]
  }
});
trackOnNotesBetween(["flicker", "reverseTrack"], 281, 284.9)
dissolveOnArrow(281, 281, 0.25, ["flicker", "reverseTrack"])
dissolveOnArrow(283, 283, 0.25, ["flicker", "reverseTrack"])

//scale up

trackOnNotesBetween(["flicker", "scaleUpOnNote"], 285, 290.9)
trackOnNotesBetween(["flicker", "scaleUpOnNote", "itDoDis"], 291, 291)
dissolveOnArrow(288, 288, 1, ["flicker", "scaleUpOnNote"])

_customEvents.push({
  _time: 285,
  _type: "AnimateTrack",
  _data: {
    _track: "scaleUpOnNote",
    _duration: 0.75,
    _scale: [
      [1, 1, 1, 0],
      [1.15, 1.15, 1.15, 1, "easeOutCubic"]
    ]
  }
}, {
  _time: 286,
  _type: "AnimateTrack",
  _data: {
    _track: "scaleUpOnNote",
    _duration: 1,
    _scale: [
      [1.15, 1.15, 1.15, 0],
      [1.3, 1.3, 1.3, 0.25, "easeOutCubic"],
      [1.3, 1.3, 1.3, 0.5],
      [1.45, 1.45, 1.45, 1, "easeOutCubic"],
    ]
  }
}, {
  _time: 289,
  _type: "AnimateTrack",
  _data: {
    _track: "scaleUpOnNote",
    _duration: 2,
    _scale: [
      [1.45, 1.45, 1.45, 0],
      [1.45, 1.45, 1.45, 0.25],
      [1.6, 1.6, 1.6, 0.375, "easeOutCubic"],
      [1.6, 1.6, 1.6, 0.5],
      [1.75, 1.75, 1.75, 1, "easeOutCubic"],
    ]
  }
}, {
  _time: 290.5,
  _type: "AnimateTrack",
  _data: {
    _track: "itDoDis",
    _dissolve: [
      [1, 0],
      [0, 0.481, "easeStep"]
    ],
    _dissolveArrow: [
      [1, 0],
      [0, 0.481, "easeStep"]
    ]
  }
}, {
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "itFlyDoe",
    _dissolve: [
      [0, 0],
      [1, 0.48, "easeStep"],
      [0, 1],
    ],
    _localRotation: [
      [0, 0, 0, 0.48],
      [0, 0, 45, 1]
    ],
    _dissolveArrow: [
      [0, 0],
      [1, 0.48, "easeStep"],
      [0, 1],
    ],
    _scale: [
      [1.45, 1.45, 1.45, 0.48],
      [0, 0, 0, 1, "easeOutSine"],
    ],
    _definitePosition: [
      [1, 1, 0.5, 0.48],
      [1, 1, 15, 0.75, "splineCatmullRom"],
      [-5, 5, 15, 1, "splineCatmullRom", "easeOutCirc"]
    ]
  }
});

//second part

kickOnDouble(520, 575, "kickTrack", 15, 0.75, "Cubic", "Bounce")
flickOnNote(576, 582, "flickTrack", 20)
trackOnNotesBetween(["kickTrack", "flickTrack"], 576, 580)



flickOnNote(614, 615.5, "flicc", 20)
flickOnNote(630, 631.5, "flicc", 20)
flickOnNote(678, 679.5, "flicc", 20)
flickOnNote(709, 713, "flicc", 20)

dissolveGlitch(584, 613, 1, 0.75, "kickGlitch")
dissolveGlitch(616, 629, 1, 0.75, "kickGlitch")
dissolveGlitch(632, 640, 1, 0.75, "kickGlitch")
dissolveGlitch(664, 677, 1, 0.75, "kickGlitch")
dissolveGlitch(680, 712, 1, 0.75, "kickGlitch")

trackOnNotesBetween(["kickGlitch", "flicc"], 613, 616)
trackOnNotesBetween(["kickGlitch", "flicc"], 629, 632)
trackOnNotesBetween(["kickGlitch", "flicc"], 677, 680)
trackOnNotesBetween(["kickGlitch", "flicc"], 709, 713)


kickOnDouble(648, 660, "kickTrack", 15, 0.75, "Cubic", "Bounce")

//y yes

trackOnNotesBetween(["dissolveRev", "effecc"], 760, 764)
_customEvents.push({
  _time: 760,
  _type: "AnimateTrack",
  _data: {
    _track: "dissolveRev",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 0.5, "easeOutCirc"],
      [1, 1, "easeInOutCirc"]
    ]
  }
}, {
  _time: 761,
  _type: "AnimateTrack",
  _data: {
    _track: "dissolveRev",
    _duration: 1,
    _dissolve: [
      [0, 0],
      [1, 1, "easeStep"]
    ]
  }
});

trackOnNotesBetween("scaleUpTrack", 720, 726)
_customEvents.push({
  _time: 700,
  _type: "AnimateTrack",
  _data: {
    _track: "scaleUpTrack",
    _duration: 1,
    _scale: [
      [0.5, 0.5, 0.5, 0]
    ]
  }
}, {
  _time: 720,
  _type: "AnimateTrack",
  _data: {
    _track: "scaleUpTrack",
    _duration: 4,
    _dissolve: [
      [1, 0],
      [0.5  , 1]
    ],
    _scale: [
      [0.5, 0.5, 0.5, 0],
      [1, 1, 1, 1]
    ]
  }
});
sepHitbox(720, 724, "hitbox")

trackOnNotesBetween(["disIsDisIlvi", "scaleUpTrack"], 725, 731)
_customEvents.push({
  _time: 725,
  _type: "AnimateTrack",
  _data: {
    _track: "disIsDisIlvi",
    _duration: 3,
    _dissolve: [
      [0,0],
      [1,1,"easeStep"]
    ]
  }
})

flickOnNote(792, 823.5, "flicc2", 15)

_customEvents.push({
  _time: 824,
  _type: "AnimateTrack",
  _data: {
    _track: "dissolve12",
    _duration: 2,
    _dissolve: [
      [1, 0],
      [0.1, 0.9, "easeOutCirc"],
      [1, 1, "easeStep"]
    ]
  }
});
trackOnNotesBetween("dissolve12", 824, 829.5)

_environment.push(
  { _id: "^.*Spectrogram.*$", _lookupMethod: "Regex", _active: false}
);

arrowCurve(890 , 893.10, 3, 4, 1, 5)

randPath(776, 784, "randomJizz:flushed:", -5, 5, 0, 2, 4)
_customEvents.push({
  _time: 776,
  _type: "AnimateTrack",
  _data: {
    _track: "randomJizz:flushed:",
    _duration: 0.5,
    _dissolve: [
      [1, 0],
      [0, 1, "easeOutExpo"]
    ]
  }
});
flickOnNote(784.1, 791.9, "fleick", 10)

//flot

floatingPath(792, 823.9, "flicc2", 2, -35, 35, -35, 35)

sidePath(830, 884, 10, "side", "Circ", 2)
trackOnNotesBetween(["side", "flickeringTrack"], 858, 866)
trackOnNotesBetween("flickeringTrack", 868, 870)
trackOnNotesBetween("flickeringTrack", 874, 878)
for (i = 858 ; i <= 861.9 ; i += 0.125) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "flickeringTrack",
      _duration: 0.125,
      _dissolve: [
        [0, 0],
        [1, 0.5, "easeStep"]
      ]
    }
  });
}

flickOnNote(826, 828, "fleec", 10)
scaleOnNote(874, 877.9, "scalePulseTrack", 2)
for (i = 885 ; i <= 885.9 ; i += 0.25) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "flickeringTrack",
      _duration: 0.25,
      _dissolve: [
        [0, 0],
        [1, 0.5, "easeStep"]
      ]
    }
  });
}

//#region Don't FUCKING touch this area

































//I SAID DON'T!
_environment.push(
  { _id: `Pair\\.\\[0\\]BaseL$`, _lookupMethod: "Regex", _duplicate: 1, _localPosition: [null+20, null-20, 25]},
  { _id: `Pair\\.\\[1\\]BaseR$`, _lookupMethod: "Regex", _duplicate: 1, _localPosition: [null-20, null-20, 25]},
);
for (i = 1 ; i <= 4 ; i++) {
  _environment.push(
    { _id: `Pair( .${i}.)\\.\\[0\\]BaseL$`, _lookupMethod: "Regex", _duplicate: 1, _localPosition: [null+20-(i*5), null-20, 25]},
    { _id: `Pair( .${i}.)\\.\\[1\\]BaseR$`, _lookupMethod: "Regex", _duplicate: 1, _localPosition: [null-20+(i*5), null-20, 25]}
  );
}
_environment.push(
  { _id: `Pair\\.\\[0\\]BaseL$`, _lookupMethod: "Regex", _duplicate: 1, _localPosition: [null+20, null-20, 20]},
  { _id: `Pair\\.\\[1\\]BaseR$`, _lookupMethod: "Regex", _duplicate: 1, _localPosition: [null-20, null-20, 20]},
);
for (i = 1 ; i <= 4 ; i++) {
  _environment.push(
    { _id: `Pair( .${i}.)\\.\\[0\\]BaseL$`, _lookupMethod: "Regex", _duplicate: 1, _localPosition: [null+20-(i*5), null-20, 20]},
    { _id: `Pair( .${i}.)\\.\\[1\\]BaseR$`, _lookupMethod: "Regex", _duplicate: 1, _localPosition: [null-20+(i*5), null-20, 20]}
  );
}



for (i = 1.666 ; i <= 8.666 ; i++) {
  _environment.push(
    { _id: "^.*33\\]Laser$", _lookupMethod: "Regex", _duplicate: 1, _rotation: [0, 0, 0], _localPosition: [i, 50, 10], _track: "laserTrack"},
    { _id: "^.*33\\]Laser$", _lookupMethod: "Regex", _duplicate: 1, _rotation: [0, 0, 0], _localPosition: [i * -1, 50, 10], _track: "laserTrack"}
  );
}

//for (i = 15, n = 0; i <= 18.75 ; i += 0.75, n++) {
//   _environment.push(
//    { _id: `^.*RotatingLasersPair( \\(${n}\\))?`, _duplicate: 1, _position: [0, 0, i]},
//    { _id: `^.*RotatingLasersPair( \\(${n}\\))?.Clon.*BaseR`, _rotation: [null, 90, null]},
//    { _id: `^.*RotatingLasersPair( \\(${n}\\))?.Clon.*BaseL`, _rotation: [null, -90, null]}
//    //{ _id: `^.+RotatingLasersPair.\\[1\\]BaseR$`, _lookupMethod: "Regex", _duplicate: 1, _localPosition: [i, -10, 40]},
//    //{ _id: `^.+RotatingLasersPair.\\[0\\]BaseL$`, _lookupMethod: "Regex", _duplicate: 1, _localPosition: [i*-1, -10, 40]}
//  )
//}
//for (i = 25, n = 0; i <= 28.75 ; i += 0.75, n++) {
//  _environment.push(
//    { _id: `^.*RotatingLasersPair( \\(${n}\\))?.Clone.$`, _duplicate: 1, _position: [0, 0, i]},
//    { _id: `^.*RotatingLasersPair( \\(${n}\\))?.Clone..Clon.*BaseR`, _rotation: [null, 90, null]},
//    { _id: `^.*RotatingLasersPair( \\(${n}\\))?.Clone..Clon.*BaseL`, _rotation: [null, -90, null]}
//    //{ _id: `^.+RotatingLasersPair.\\[1\\]BaseR$`, _lookupMethod: "Regex", _duplicate: 1, _localPosition: [i, -10, 40]},
//    //{ _id: `^.+RotatingLasersPair.\\[0\\]BaseL$`, _lookupMethod: "Regex", _duplicate: 1, _localPosition: [i*-1, -10, 40]}
//  )
//}

for (i = 1, y = 2.3, pos = 35 ; i <= 15 ; i++, y -= 0.15, pos+=10) {
  _environment.push(
    { _id: `^.*\\[${i}\\]LightsTrackLaneRing.Clone.*Laser.{0,4}$`, _lookupMethod: "Regex", _scale: [1, 1.925, 1]},
    { _id: `^.*\\[${i}\\].{15}Ring.Clone.$`, _lookupMethod: "Regex", _scale: [y,y,1], _localPosition: [0,0,pos]}
  );
}









//#endregion


//#endregion                     -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  STOP  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -





//#region write file
const precision = 4; //decimals to round to  --- use this for better wall precision or to try and decrease JSON file size

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
        obj[key] = parseFloat(
          Math.round((obj[key] + Number.EPSILON) * jsonP) / jsonP
        );
      }
    }
}
deeperDaddy(difficulty);

difficulty._notes.sort(
  (a, b) =>
    parseFloat(Math.round((a._time + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b._time + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a._lineIndex + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b._lineIndex + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a._lineLayer + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b._lineLayer + Number.EPSILON) * sortP) / sortP)
);
difficulty._obstacles.sort((a, b) => a._time - b._time);
difficulty._events.sort((a, b) => a._time - b._time);

fs.writeFileSync(OUTPUT, JSON.stringify(difficulty, null, 0));

//#endregion
