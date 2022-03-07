
const fs = require("fs");

const INPUT = "ExpertStandardd.dat";
const OUTPUT = "ExpertPlusStandard_Old.dat";

let difficulty = JSON.parse(fs.readFileSync(INPUT));

//#region this just counts how many time you ran it for fun, feel free to remove.
if (!fs.existsSync("count.txt")) {
  fs.writeFileSync("count.txt", parseInt("0").toString());
}
let count = parseInt(fs.readFileSync("count.txt"));
count++;
fs.writeFileSync("count.txt", count.toString());
console.log("YOU'VE FUCKED UP " + count + " TIMES!");
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

function noteGlitch1(Start, End) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    let n1 = JSON.parse(JSON.stringify(note));
    n1._disableSpawnEffect = true;
    n1._disableNoteGravity = true;
    n1._time -= 0.025;
    n1._customData._track = "glitchNote";
    n1._customData._fake = true;
    n1._customData._interactable = false;
    if (!n1._customData._animation) n1._customData._animation = {};
    n1._customData._animation._dissolve = [[0, 0]];
    _notes.push(n1);

    note._customData._track = "glitchNoteBloq";
    note._disableSpawnEffect = true;
    note._disableNoteGravity = true;
  });
}

function noteGlitch2(Duration, Intensity, Start) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= Start);
  filterednotes.forEach((note) => {
    _customEvents.push({ 
      _time: note._time,
      _type: "AnimateTrack",
      _data: {
        _track: "glitchNote",
        _duration: Duration,
        _position: [
          [getRndInteger(Intensity * -1,Intensity)*0.1,getRndInteger(Intensity * -1,Intensity)*0.1,getRndInteger(Intensity * -1,Intensity)*0.1,0],
          [getRndInteger(Intensity * -1,Intensity)*0.1,getRndInteger(Intensity * -1,Intensity)*0.1,getRndInteger(Intensity * -1,Intensity)*0.1,0.25],
          [getRndInteger(Intensity * -1,Intensity)*0.1,getRndInteger(Intensity * -1,Intensity)*0.1,getRndInteger(Intensity * -1,Intensity)*0.1,0.5],
          [getRndInteger(Intensity * -1,Intensity)*0.1,getRndInteger(Intensity * -1,Intensity)*0.1,getRndInteger(Intensity * -1,Intensity)*0.1,0.75],
          [getRndInteger(Intensity * -1,Intensity)*0.1,getRndInteger(Intensity * -1,Intensity)*0.1,getRndInteger(Intensity * -1,Intensity)*0.1,1]
        ],
        _dissolveArrow: [
          [0, 0],
          [1, 0.25, "easeStep"],
          [0, 0.5, "easeStep"],
          [1, 0.75, "easeStep"],
          [0, 1, "easeStep"]
        ]
      }
    }, {
      _time: note._time,
      _type: "AnimateTrack",
      _data: {
        _track: "glitchNoteBloq",
        _duration: 1,
        _dissolveArrow: [
          [1, 0],
          [0, 0.25, "easeStep"],
          [1, 0.5, "easeStep"],
          [0, 0.75, "easeStep"],
          [1, 1, "easeStep"]
        ]
      }
    });
  });
}

function shake(Start, assignTrack) {
  _customEvents.push({
    _time: Start,
    _type: "AnimateTrack",
    _data: {
      _track: assignTrack, 
      _duration: 0.5,
      _localPosition: [
        [0,0,0,0],
        [0,0.25,0,0.25,"easeInOutSine"],
        [0,0,0,0.75]
      ]
    }
  });
}

function momentumEffect(Start, End) {
  for (i = Start ; i <= End ; i += 0.25) {
    for (times = 1 ; times <= 4 ; times ++) {
      let xpos = getRndInteger(3, 20) * (Math.random() > 0.5 ? 1 : -1);
      let ypos = getRndInteger(-20, 20);
      let nScale = (getRndInteger(10,40) * 0.01);
      let n1 = {};
      n1._time = i;
      n1._lineIndex = 1;
      n1._lineLayer = 1;
      n1._type = 1;
      n1._cutDirection = 8;
      n1._customData = {};
      n1._customData._position = [xpos, ypos];
      n1._customData._color = [1, 1, 1, 1];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._noteJumpMovementSpeed = 40;
      n1._customData._disableSpawnEffect = true;
      if (!n1._customData._animation) n1._customData._animation = {};
      n1._customData._animation._dissolve = [[getRndInteger(5,100) * 0.01, 0]];
      n1._customData._animation._dissolveArrow = [[0, 0]];
      n1._customData._animation._scale = [[nScale, nScale, 5, 0]];
      n1._customData._animation._definitePosition = [
        [xpos, ypos, 100, 0],
        [xpos, ypos, -10, 0.5]
      ];
      _notes.push(n1);
    }
  }
}

function envOffset(Regex, scale, rot, localRot, pos, localPos, dupe, active) {
  _environment.push(
    { _id: Regex, _lookupMethod: "Regex", _scale: scale, _rotation: rot, _localRotation: localRot, _position: pos, _localPosition: localPos, _duplicate: dupe, _active: active}
  )
}

function envDupeOffset(Regex, scale, rot, localRot, pos, localPos, dupe, active) {
  for (
    i = 1,
    fRot = rot,
    fLocRot = localRot,
    fPos = pos,
    fLocPos = localPos;

    i <= dupe;
    
    i++,
    fRot += rot,
    fLocRot += localRot,
    fPos += pos,
    fLocPos += localPos
  ) {
    _environment.push(
      { _id: Regex, _lookupMethod: "Regex", _scale: scale, _rotation: fRot, _localRotation: fLocRot, _position: fPos, _localPosition: fLocPos, _duplicate: 1, _active: active}
    );
  }
}


function scaleOnNote(Start, End, AssignTrack) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    if (note._type != 3 || note._direction != 8) {
      _customEvents.push({
        _time: note._time,
        _type: "AnimateTrack",
        _data: {
          _track: AssignTrack,
          _duration: 1,
          _scale: [
            [1,1,1,0],
            [30,1,1,0.125],
            [1,1,1,0.625]
          ]
        }
      });   
    }
  });
}

function visionGlitch(Start, End, Interval, assignTrack) {
  for (i = Start ; i <= End ; i += Interval) {
    _customEvents.push({
      _time: i,
      _type: "AnimateTrack",
      _data:{
        _track: assignTrack,
        _duration: Interval,
        _position:[
          [0, -0.5, 5, 0],
          [0, 0, -10, 0.5, "easeInExpo"],
          [0, -0.5, 5, 1, "easeStep"]
        ],
        _color: [
          [0, 0, 0, -69, 0],
          [0, 0, 0, 69, 0.5, "easeOutCirc"],
          [0, 0, 0, -69, 1, "easeStep"] 
        ]
      }
    });
  }
}

function floatingPath(Start, End, assignTrack, offset) {
  trackOnNotesBetween(assignTrack, Start, End)
  offestOnNotesBetween(Start, End, offset)
  
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {

    let xpos = (getRndInteger(-100,60) * 0.1);
    let ypos = (getRndInteger(-20,40) * 0.1);

    let xrot = getRndInteger(-15,15);
    let yrot = getRndInteger(-10,10);
    let zrot = getRndInteger(-100,100);

    if (!note._customData._animation) note._customData._animation = {};

    note._customData._track = assignTrack;
    //note._customData._easing = "easeOutCirc";
    note._customData._animation._position = [
      [xpos, ypos, 0, 0],
      [0, 0, 0, 0.48, "easeOutCirc"]
    ];
    note._customData._animation._localRotation = [
      [xrot, yrot, zrot, 0],
      [0, 0, 0, 0.45, "easeOutSine"]
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

function springShake(Start, End, assignTrack, duration, interval, posAmp, scaAmp, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {

    if (typeof potentialOffset !== "undefined") {
      note._customData._noteJumpStartBeatOffset = potentialOffset;
    }
    
    note._customData._track = assignTrack;

    for (i = Start ; i <= End ; i += interval) {
      let x = (getRndInteger(-25, 25) / 100);
      let y = (getRndInteger(-5, 5) / 10);
      let scaleAmp = (getRndInteger(100, 175) / 100);
      let dissolveAmp = (scaleAmp-2) * -1;
      _customEvents.push({
        _time: i,
        _type: "AnimateTrack",
        _data: {
          _track: assignTrack,
          _duration: duration,
          _scale: [
            [scaleAmp*scaAmp, scaleAmp*scaAmp, scaleAmp*scaAmp, 0],
            [1, 1, 1, 1, "easeOutCubic"]
          ],
          _dissolve: [
            [dissolveAmp, 0],
            [1, 1, "easeOutCubic"]
          ],
          _dissolveArrow: [
            [dissolveAmp, 0],
            [1, 1, "easeOutCubic"]
          ],
          _position: [
            [x*posAmp, y*posAmp, 0, 0],
            [((x*posAmp)/2)*-1, ((y*posAmp)/2)*-1, 0, 0.1, "splineCatmullRom"],
            [0, 0, 0, 1, "splineCatmullRom", "easeOutElastic"]
          ]
        }
      });
    }
  });
}

function flickerNotes(Start, End, assignTrack, duration, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {

    if (typeof potentialOffset !== "undefined") {
      note._customData._noteJumpStartBeatOffset = potentialOffset;
    }
    
    note._customData._track = assignTrack;
  
    _customEvents.push({
      _time: note._time,
      _type: "AnimateTrack",
      _data: {
        _track: assignTrack,
        _duration: duration,
        _dissolve: [
          [0, 0],
          [1, 0.5, "easeStep"]
        ]
      }
    })
  });
}

function funyPosOffset(Start, End, assignTrack, duration, posAmp, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {

    if (typeof potentialOffset !== "undefined") {
      note._customData._noteJumpStartBeatOffset = potentialOffset;
    }
    
    note._customData._track = `${assignTrack+note._time}`;
    
    _customEvents.push({
      _time: Start,
      _type: "AnimateTrack",
      _data: {
        _track: `${assignTrack+note._time}`,
        _duration: duration,
        _localRotation: [
          [0, 0, 0, 0],
          [0, 0, getRndInteger(posAmp*-1, posAmp), 0.9, "easeInCirc"],
          [0, 0, 0, 1, "easeInOutBack"]
        ],
        _scale: [
          [1, 1, 1, 0],
          [1.5, 1.5, 1.5, 0.9, "easeInCirc"],
          [1, 1, 1, 1, "easeInOutBack"]
        ],
        _dissolve: [
          [1, 0],
          [0.5, 0.9, "easeInCirc"],
          [1, 1]
        ],
        _position: [
          [0, 0, 0, 0],
          [getRndInteger((posAmp*-1)/2,posAmp/2)*0.1, getRndInteger(0,posAmp)*0.1, 0, 0.9, "easeInCirc"],
          [0, 0, 0, 1, "easeInOutBack"]
        ]
      }
    });
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

function chaosPath(Start, End, track, offset, posAmp, rotAmp, scaleAmp, disAmp) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {
    note._track = track;
    if (typeof offset !== 'undefined' || offset !== null) {
      note._customData._noteJumpStartBeatOffset = offset;
    }

    note._customData._disableSpawnEffect = true;
    xValue = getRndInteger(posAmp*-1, posAmp)
    if (xValue >= -3 && xValue <= 2) {
      direc = getRndInteger(0, 1)
      if (direc == 0) xPosition = -5;
      if (direc == 1) xPosition = 4;
    }

    if (!note._customData._animation) note._customData._animation = {};

    if (posAmp <= 3) yPosition = getRndInteger(-1, posAmp);
    if (posAmp >= 3) yPosition = getRndInteger((posAmp*0.75)*-1, posAmp*0.75);
    xPosition = getRndInteger(posAmp*-1, posAmp);
    note._customData._animation._position = [
      [xPosition, yPosition, 0, 0],
      [xPosition, 0, 0, 0.125, "splineCatmullRom"],
      [0, 0, 0, 0.25, "easeOutCubic", "splineCatmullRom"]
    ];

    xDiv = getRndInteger(1,4)
    yDiv = getRndInteger(2,4)
    note._customData._animation._localRotation = [
      [(rotAmp/xDiv)*2, (rotAmp/yDiv)*2, rotAmp*2, 0],
      [((rotAmp/xDiv)*2)-((rotAmp/xDiv)/4), ((rotAmp/yDiv)*2)-((rotAmp/yDiv)/4), (rotAmp*2)-(rotAmp/4), 0.0625/2],
      [((rotAmp/xDiv)*2)-(rotAmp/2), ((rotAmp/yDiv)*2)-((rotAmp/yDiv)/2), (rotAmp*2)/2, 0.125/2],
      [((rotAmp/xDiv)*2)-(((rotAmp/xDiv)/4)*3), ((rotAmp/yDiv)*2)-(((rotAmp/yDiv)/4)*3), (rotAmp*2)-(rotAmp/4)*3, 0.1875/2],
      [rotAmp/xDiv, rotAmp/yDiv, rotAmp, 0.25/2],
      [(rotAmp/xDiv)-((rotAmp/xDiv)/4), (rotAmp/yDiv)-((rotAmp/yDiv)/4), (rotAmp)-(rotAmp/4), 0.3125/2],
      [(rotAmp/xDiv)-(rotAmp/2), (rotAmp/yDiv)/2, rotAmp/2, 0.375/2],
      [(rotAmp/xDiv)-(((rotAmp/xDiv)/4)*3), (rotAmp/yDiv)-(((rotAmp/yDiv)/4)*3), (rotAmp)-((rotAmp/4)*3), 0.4375/2],
      [0, 0, 0, 0.5/2, "easeOutBack"]
    ];

    note._customData._animation._scale = [
      [getRndInteger(scaleAmp*0.75, scaleAmp*1.25), getRndInteger(scaleAmp*0.75, scaleAmp*1.25), getRndInteger(scaleAmp*0.75, scaleAmp*1.25), 0],
      [1, 1, 1, 0.25, "easeOutBack"]
    ];

    if (disAmp < 1 || typeof disAmp !== 'undefined' || disAmp !== null) {
      note._customData._animation._dissolve = [
        [0, 0],
        [getRndInteger(disAmp, 1), 0.0625],
        [1, 0.125, "easeOutCirc"]
      ];
    }
  });
}

function assembleTrack(Start, End, duration, assignTrack, offset) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {
    nTime = note._time;
    nTrack = `trackAssemble${assignTrack+nTime}`;
    xStartPos = (getRndInteger(-40, 40)/10);
    yStartPos = (getRndInteger(5, 70)/10);

    if (typeof note._customData._track !== 'undefined' || note._customData._track === null) {
      oldTrack = note._customData._track;
      note._customData._track = [oldTrack, nTrack];
    } else {
      note._customData._track = nTrack;
    }

    note._customData._noteJumpStartBeatOffset = offset;

    let EventTime = Start - duration;


    _customEvents.push({
      _time: 0,
      _type: "AnimateTrack",
      _data: {
        _track: nTrack,
        _duration: 1,
        _dissolve: [
          [0, 0]
        ],
        _dissolveArrow: [
          [0, 0]
        ],
        _position: [
          [xStartPos, yStartPos, 0, 0]
        ]
      }
    }, {
      _time: EventTime,
      _type: "AnimateTrack",
      _data: {
        _track: nTrack,
        _duration: duration,
        _position: [
          [xStartPos, yStartPos, 0, 0],
          [xStartPos/2, yStartPos/2, 5, 0.5, "easeInSine", "splineCatmullRom"],
          [0, 0, 0, 1, "easeOutCubic", "splineCatmullRom"]
        ],
        _dissolve: [
          [0, 0],
          [1, 0.25]
        ],
        _dissolveArrow: [
          [0, 0],
          [1, 0.125]
        ]
      }
    });
  });
}

function unoriginalSpinningEffectImNotSorryAerolunaFuckYouSmileyFace(Start, End, AssignTrack, offset) {
  for (i = 0, mult = -1 ; i <= 1 ; mult *= -1, i++) {
    _customEvents.push({
      _time: 0,
      _type: "AssignPathAnimation",
      _data: {
        _track: `${AssignTrack+i}`,
        //_position: [
        //  [5*mult, 5, -200, 0],
        //  [0, 0, 0, 0.25]
        //],
        _dissolve: [
          [0, 0],
          [1, 0.25]
        ],
        _dissolveArrow: [
          [0, 0],
          [1, 0.125]
        ],
        _rotation: [
          [0, 90*mult, 0, 0],
          //[0, -90 *mult, 0, 0.0625],
          //[0, -270*mult, 0, 0.1875],
          [0, 0*mult, 0, 0.25]
        ]
      }
    });
  }
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {
    noteSc = getRndInteger(80,160);
    noteSize = noteSc/10;
    if (!note._customData._animation) note._customData._animation = {};
    note._customData._animation._interactable = [
      [0, 0],
      [0, 0.39],
      [1, 0.42, "easeStep"]
    ];
    if (note._type == 0) {
      note._customData._animation._position = [
        [getRndInteger(-16,-5), getRndInteger(-30,30), -60, 0],
        [0, 0, 0, 0.25]
      ];
    } else if (note._type == 1) {
      note._customData._animation._position = [
        [getRndInteger(5,16), getRndInteger(-30,30), -60, 0],
        [0, 0, 0, 0.25]
      ];
    }
    note._customData._animation._localRotation = [
      [0, 0, -180, 0],
      [90, 0, -225, 0.0625],
      [180, 0, -270, 0.125],
      [270, 0, -315, 0.1875],
      [360, 0, -360, 0.25]
    ];
    note._customData._animation._scale = [
      [noteSize, noteSize/2, noteSize*0.75, 0],
      [1, 0.5, 0.75, 0.25],
      [0.5, 2, 1, 0.265, "easeOutCirc"],
      [1, 1, 1, 0.28, "easeOutQuint"]
    ];
    note._customData._track = `${AssignTrack+note._type}`;
    note._customData._noteJumpStartBeatOffset = offset;
  });
}

//#endregion

//#region  EXAMPLES   -  -  -  -  -  -  -  -  -  -  -  -  -  use these as a copy/paste template for the lazy   -  -  -  -  -  -  -  -  -  -  -  -  -  




// ---- function calling example - use these when possible to get rid of clutter and make life easier

//trackOnNotesBetween("dumb track name here", start beat here, end beat here, offset here);    





// These three bits below are different ways of filtering notes by time. You can filter notes by specific beats, or by sections of beats. 
// Data written here, will be applied directly to the note, and any animation data will act as a "path animation" and will animate over the course of each individual notes life, not by specific beats. 
// ----  Usually follows [x,y,z,time]  ----  Note: when adding animatios directly to the note (path animations); time "0" is note spawn - "0.5" is when the note is at players feet, and "1" is when the note dies

// It's good practice to have the note at it's original position by ~0.4,0.45 to compensate for sabers being long and the player usually cutting the note before it arrives ath the feet on the platform. 
// Also, if you want to do funny animations, use a longer offset - as long as your custom animation finishes around "0.45" the player will percieve it as a comfortable offset (yes, even if it's at like +10)




//filterednotes = notesAt([insert specific note time/beat here]);
//filterednotes.forEach(note => {
//  note._customData._noteJumpStartBeatOffset = -0.1;       // tbh I only really use this for NJS/offset changes and to remove the spawn effect.
//  note._customData._noteJumpMovementSpeed = 17;       
//  note._customData._animation = {}         // this chunk of text is required if doing any note animations this way
//  note._customData._animation._rotation = [[-90, 0, 0, 0],[0,0,0,0.5,"easeOutElastic"]];     // feel free to use any of the other animation properties from the github --- these will add each animation on a per note basis
//});
//
//filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
//filterednotes.forEach(note => {
//  note._customData._track = "dumb track name here";
//  note._customData._noteJumpStartBeatOffset = 69;
//  note._customData._noteJumpMovementSpeed = 420;
//});
//
//filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
//filterednotes.forEach(note => {
//  note._customData._track = "dumb track name here";
//  note._customData._noteJumpStartBeatOffset = 666;
//  note._customData._noteJumpMovementSpeed = 777;
//  note._customData._fake = true;
//  note._customData._interactable = false;
//  note._customData._disableSpawnEffect = "true"   // NOTE: removing spawn effect will scuff practice mode if you try and play at a section or track with a note already spawnd that has this property set to true - you need to start playing before these spawn in
//});









//use this to push "_customEvents" like track animations, path animations, track parenting, assigning player to track, etc.

//_customEvents.push({
//  _time: 69,
//  _type: "AnimateTrack",
//  _data: {
//    _track: "dumb track name here",
//    _duration: 420,
//    _easing: "easeOutQuad",
//    _position: [[0, 0, 0, 0], [0, 10, 10, 1]],
//    _rotation: [[0, 180, 0, 0]],
//    _dissolve: [[1, 0], [0, 0.8]],
//    _dissolveArrow: [[1, 0], [0, 1]]
//  }
//});       



// you can string together multiple thingies by adding a comma after ""}"" and slapping in another {} thingy - like so vvvvvvvvv

// If your track/note animation spawns normally, and kind of "jumps" or snaps to the next spot, make sure the note/track is in the desired position before the notes spawn. - Adjust animation time to before note spawns
//   ---   The example below will snap to _rotation "20" on the y axis, because at _time "0", y axis was at "-15"   ---   you gotta make sure these match :)

//_customEvents.push({
//  _time: 0,
//  _type: "AnimateTrack",
//  _data: {
//    _track: "dumb track name here",
//    _duration: 1,
//    _position: [[0, 0, 0, 0]],
//    _rotation: [[0, -15, 0, 0]],
//    _dissolve: [[1, 0]],
//    _dissolveArrow: [[1, 0]]
//  }
//}, {
//  _time: 69,
//  _type: "AnimateTrack",
//  _data: {
//    _track: "dumb track name here",
//    _duration: 420,
//    _easing: "easeOutQuad",
//    _position: [[0, 0, 0, 0], [0, 10, 10, 1]],
//    _rotation: [[0, 20, 0, 0]],
//    _dissolve: [[1, 0], [0, 0.8]],
//    _dissolveArrow: [[1, 0], [0, 1]]
//  }
//});
// you can also modify these push things to add in _pointDefinitions, _notes, _obstacles, and _events (lighting)   ----    There are better examples of this in the original demo.js file from the NE Documentation and some of the functions above. 

//#endregion





//#region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -

offestOnNotesBetween(0, 600, 0)

_customEvents.push({
  _time: 0,
  _type: "AssignTrackParent",
  _data: {
    _childrenTracks: ["ConstTrack", "TrackConstTrack"],
    _parentTrack: "ConstParent"
  }
}, {
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "ConstParent",
    _duration: 1,
    _position: [[0, -1, 5, 0]]
  }
}, {
  _time: 12.01,
  _type: "AnimateTrack",
  _data: {
    _track: "ConstParent",
    _duration: 4,
    _position: [
      [(getRndInteger(-0.2, -0.2)*(0.007/0.0047)), (getRndInteger(-1, -0.9)*(0.007/2)), 5, 0.875],
      [0, -1, 5, 0, "easeOutSine"]
    ]
  }
});


for (i = 8, amp = 0.7, amp2 = 1.5; i <= 11.5 ; i+=0.5, amp -= 0.099) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "ConstParent",
      _duration: 0.5,
      _position: [
        [(getRndInteger(1.0, 2.5) * amp), (getRndInteger(-1, 0.6)*amp), 5, 0],
        [(getRndInteger(-2.5, -1) * amp), (getRndInteger(-1, 0.4)*amp), 5, 0.125],
        [(getRndInteger(1.0, 2.5) * amp), (getRndInteger(-1, 0.2)*amp), 5, 0.25],
        [(getRndInteger(-2.5, -1) * amp), (getRndInteger(-1, 0)*amp), 5, 0.375],
        [(getRndInteger(1.0, 2.5) * (amp/amp2)), (getRndInteger(-1, -0.2)*(amp/2)), 5, 0.5],
        [(getRndInteger(-2.5, -1) * (amp/amp2)), (getRndInteger(-1, -0.4)*(amp/2)), 5, 0.625],
        [(getRndInteger(1.0, 2.5) * (amp/amp2)), (getRndInteger(-1, -0.6)*(amp/2)), 5, 0.75],
        [(getRndInteger(-0.2, -0.2)*(amp/amp2)), (getRndInteger(-1, -0.9)*(amp/2)), 5, 0.875],
        [0, -1, 5, 1],
      ]
    }
  });
}


// shaky effect


springShake(24, 48.01, "kickShake", 4, 8, 2, 1.1, 1)
springShake(52, 55, "kickShake", 1, 1.5, 2, 1.2, 1)
trackOnNotesBetween("kickShake", 48.02, 51.9, 1)
trackOnNotesBetween("kickShake", 55, 58, 1)




//

flickOnNote(60, 64, "flickNote", 15)
trackOnNotesBetween("flickNote", 65, 70)

floatingPath(72, 83.9, "floatPath", 2)

trackOnNotesBetweenRBSep("curveToPosR", "curveToPosB", 88, 115.55, 1)
//trackOnNotesBetweenRBSep("curveToPosR2", "curveToPosB2", 104, 115.55, 1)
_customEvents.push({
  _time: 88,
  _type: "AssignPathAnimation",
  _data: {
    _track: "curveToPosB",
    _position: [
      [-3, -1, 0, 0],
      [-1, 0.5, 0, 0.125, "splineCatmullRom", "easeInSine"],
      [0, 0, 0, 0.25, "splineCatmullRom", "easeOutBack"]
    ]
  }
}, {
  _time: 88,
  _type: "AssignPathAnimation",
  _data: {
    _track: "curveToPosR",
    _position: [
      [3, -1, 0, 0],
      [1, 0.5, 0, 0.125, "splineCatmullRom", "easeInSine"],
      [0, 0, 0, 0.25, "splineCatmullRom", "easeOutBack"]
    ]
  }
//}, {
//  _time: 104,
//  _type: "AssignPathAnimation",
//  _data: {
//    _track: "curveToPosB2",
//    _position: [
//      [-3, -1, 0, 0],
//      [-1, 0.5, 0, 0.125, "splineCatmullRom", "easeInSine"],
//      [0, 0, 0, 0.25, "splineCatmullRom", "easeOutBack"]
//    ]
//  }
//}, {
//  _time: 112,
//  _type: "AssignPathAnimation",
//  _data: {
//    _track: "curveToPosR2",
//    _position: [
//      [3, -1, 0, 0],
//      [1, 0.5, 0, 0.125, "splineCatmullRom", "easeInSine"],
//      [0, 0, 0, 0.25, "splineCatmullRom", "easeOutBack"]
//    ]
//  }
});

flickerNotes(116, 119.9, "flickeringTracc", 0.25)

_customEvents.push({
  _time: 120,
  _type: "AnimateTrack",
  _data: {
    _track: "flickeringTracc",
    _duration: 0.25,
    _dissolve: [
      [0, 0],
      [1, 0.5, "easeStep"]
    ]
  }
});

trackOnNotesBetweenRBSep(["curveToPosR1", "flickeringTracc"], ["curveToPosB1", "flickeringTracc"], 120, 147.55, 1)
_customEvents.push({
  _time: 120,
  _type: "AssignPathAnimation",
  _data: {
    _track: "curveToPosR1",
    _position: [
      [3, -1, 0, 0],
      [1, 0.5, 0, 0.125, "splineCatmullRom", "easeInSine"],
      [0, 0, 0, 0.25, "splineCatmullRom", "easeOutBack"]
    ]
  }
}, {
  _time: 120,
  _type: "AssignPathAnimation",
  _data: {
    _track: "curveToPosB1",
    _position: [
      [-3, -1, 0, 0],
      [-1, 0.5, 0, 0.125, "splineCatmullRom", "easeInSine"],
      [0, 0, 0, 0.25, "splineCatmullRom", "easeOutBack"]
    ]
  }
});

flickerNotes(148, 151.9, "flickeringTracc", 0.25)

trackOnNotesBetween("disolv", 152, 155.5)
_customEvents.push({
  _time: 152,
  _type: "AnimateTrack",
  _data: {
    _track: "disolv",
    _dissolve: [
      [0, 0]
    ]
  }
});

chaosPath(160, 211.2, null, 1.5, 5, 100 , 2, 0.5)

flickerNotes(156, 160, "disolv", 0.33)

trackOnNotesBetween("disolv", 160, 165)
//trackOnNotesBetween("noteAlign", 166, 166.01, 3)
//trackOnNotesBetween("noteAlign1", 166.02, 166.125, 3)
trackOnNotesBetween("trölling", 167, 167.01, 3)
trackOnNotesBetween("trölling", 167.1, 173)

_customEvents.push({
  _time: 160,
  _type: "AnimateTrack",
  _data: {
    _track: "disolv",
    _duration: 2,
    _dissolve: [
      [1, 0],
      [0, 0.25, "easeOutQuad"],
      [1, 1, "easeOutCubic"]
    ]
  }
}
//}, {
//  _time: 164,
//  _type: "AnimateTrack",
//  _data: {
//    _track: "noteAlign",
//    _duration: 2,
//    _position: [
//      [0, 0, 0, 0],
//      [-1, -1, 0, 1, "easeInOutSine"],
//    ],
//    _localRotation: [
//      [0, 0, 0, 0],
//      [0, 0, -45, 1, "easeInOutSine"]
//    ]
//  }
//}, {
//  _time: 164,
//  _type: "AnimateTrack",
//  _data: {
//    _track: "noteAlign1",
//    _duration: 2,
//    _position: [
//      [0, 0, 0, 0],
//      [0, -1, 0, 1, "easeInOutSine"],
//    ],
//  }
//}, {
//  _time: 164,
//  _type: "AnimateTrack",
//  _data: {
//    _track: "noteAlign2",
//    _duration: 2,
//    _position: [
//      [0, 0, 0, 0],
//      [0, 1, 0, 1, "easeInOutSine"],
//    ],
//    _localRotation: [
//      [0, 0, 0, 0],
//      [0, 0, -45, 1, "easeInOutSine"]
//    ]
//  }
//}, {
//  _time: 166,
//  _type: "AnimateTrack",
//  _data: {
//    _track: "noteAlign2",
//    _duration: 2,
//    _position: [
//      [0, 1, 0, 0],
//      [0, 0, 0, 1, "easeInOutSine"],
//    ],
//    _localRotation: [
//      [0, 0, -45, 0],
//      [0, 0, 45, 1, "easeInOutSine"]
//    ]
//  }
//}
, {
  _time: 167,
  _type: "AnimateTrack",
  _data: {
    _track: "trölling",
    _duration: 2,
    _dissolve: [
      [0, 0],
      [0, 0.5],
      [1, 0.75, "easeOutCirc"]
    ]
  }
}, {
  _time: 172,
  _type: "AnimateTrack",
  _data: {
    _track: "trölling",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 0.25, "easeOutCubic"],
      [0.25, 1, "easeInCubic"]
    ]
  }
}, {
  _time: 174,
  _type: "AnimateTrack",
  _data: {
    _track: "trölling",
    _dissolve: [
      [0.5, 0]
    ],
    _dissolveArrow: [
      [0, 0]
    ]
  }
}, {
  _time: 175,
  _type: "AnimateTrack",
  _data: {
    _track: "trölling",
    _dissolve: [
      [0.75, 0]
    ],
    _dissolveArrow: [
      [1, 0]
    ]
  }
}, {
  _time: 176,
  _type: "AnimateTrack",
  _data: {
    _track: "trölling",
    _dissolve: [
      [1, 0]
    ]
  }
}, {
  _time: 191,
  _type: "AnimateTrack",
  _data: {
    _track: "trölling",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 0.125, "easeOutExpo"],
      [0, 0.5],
      [1, 1, "easeInQuad"]
    ]
  }
}, {
  _time: 199,
  _type: "AnimateTrack",
  _data: {
    _track: "trölling",
    _duration: 1,
    _dissolve: [
      [0, 0],
      [1, 1, "easeStep"]
    ]
  }
}, {
  _time: 204,
  _type: "AnimateTrack",
  _data: {
    _track: "trölling",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 0.25, "easeOutCubic"],
      [0.25, 1, "easeInCubic"]
    ]
  }
}, {
  _time: 206,
  _type: "AnimateTrack",
  _data: {
    _track: "trölling",
    _dissolve: [
      [0.5, 0]
    ],
    _dissolveArrow: [
      [0, 0]
    ]
  }
}, {
  _time: 207,
  _type: "AnimateTrack",
  _data: {
    _track: "trölling",
    _dissolve: [
      [0.75, 0]
    ],
    _dissolveArrow: [
      [1, 0]
    ]
  }
}, {
  _time: 208,
  _type: "AnimateTrack",
  _data: {
    _track: "trölling",
    _dissolve: [
      [1, 0]
    ]
  }
});

trackOnNotesBetween(["coolDefinite", "trölling"], 174, 174.1, 2)
trackOnNotesBetween("trölling", 174.5, 179, 2)
trackOnNotesBetween("trölling", 191, 194, 2)
trackOnNotesBetween("trölling", 199, 211.5, 2)

_customEvents.push({
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "coolDefinite",
    _position: [
      [2.5, -2.5, 0, 0],
      [2.5, 0, 0, 0.125, "splineCatmullRom"],
      [0, 0, 0, 0.25, "easeOutQuad", "splineCatmullRom"]
    ]
  }
});

trackOnNotesBetween("jooBiden", 183.125, 187, 1)

_customEvents.push({
  _time: 183,
  _type: "AnimateTrack",
  _data: {
    _track: "jooBiden",
    _duration: 1,
    _dissolve: [
      [0.75, 0],
      [1, 1, "easeStep"]
    ],
    _position: [
      [(getRndInteger(-50,50)/100), (getRndInteger(-25,25)/100), 0, 0],
      [(getRndInteger(-50,50)/100), (getRndInteger(-25,25)/100), 0, 0.125],
      [(getRndInteger(-50,50)/100), (getRndInteger(-25,25)/100), 0, 0.25],
      [(getRndInteger(-50,50)/100), (getRndInteger(-25,25)/100), 0, 0.375],
      [(getRndInteger(-50,50)/100), (getRndInteger(-25,25)/100), 0, 0.5],
      [(getRndInteger(-50,50)/100), (getRndInteger(-25,25)/100), 0, 0.625],
      [(getRndInteger(-50,50)/100), (getRndInteger(-25,25)/100), 0, 0.75],
      [(getRndInteger(-50,50)/100), (getRndInteger(-25,25)/100), 0, 0.875],
      [0, 0, 0, 1]
    ],
    _scale: [
      [1, 1, 1, 0],
      [1.5, 0.5, 1, 0.75, "easeOutCirc"],
      [1, 1, 1, 1, "easeStep"]
    ]
  }
});

trackOnNotesBetween("move1smile", 214, 214.5,1)
trackOnNotesBetween("move2smile", 216, 216.01,1)

_customEvents.push({
  _time: 212,
  _type: "AnimateTrack",
  _data: {
    _track: "move1smile",
    _duration: 1.5,
    _position: [
      [0, 0, 0, 0],
      [-1, 0, 0, 1, "easeOutCirc"]
    ]
  }
}, {
  _time: 212,
  _type: "AnimateTrack",
  _data: {
    _track: "move2smile",
    _duration: 1.5,
    _position: [
      [0, 0, 0, 0],
      [-1, 0, 0, 1, "easeOutCirc"]
    ]
  }
}, {
  _time: 214,
  _type: "AnimateTrack",
  _data: {
    _track: "move2smile",
    _duration: 1.5,
    _position: [
      [-1, 0, 0, 0],
      [0, 0, 0, 1, "easeOutCirc"]
    ]
  }
});

offestOnNotesBetween(217, 243.5, 2)
trackOnNotesBetween("bounce1", 217, 231.5)
trackOnNotesBetween("bounce2", 232, 243.5)

flickerNotes(244, 248, "AAAAAAAAAAAAAAAAAAA", 0.25)
chaosPath(248, 279.9, "AAAAAAAAAAAAAAAAAAA", 1.5, 3, 100, 4, 0.25)

_customEvents.push({
  _time:216,
  _type:"AssignPathAnimation",
  _data: {
    _track: "bounce1",
    _position: [
      [0,0,0,0.125],
      [0,1.5,0,0.25,"easeOutCirc"],
      [0,0,0,0.375,"easeInCirc"]
    ],
  }
}, {
  _time:216,
  _type:"AssignPathAnimation",
  _data: {
    _track: "bounce2",
    _position: [
      [0,0,0,0.125],
      [0,1.5,0,0.25,"easeOutCirc"],
      [0,0,0,0.375,"easeInCirc"]
    ],
  }
});

flickerNotes(244, 243.9, "flickerrrrr", 0.33)

trackOnNotesBetween("funyyy", 280, 288, 2)

floatingPath(289, 305, "floot", 4)


_customEvents.push({
  _time: 282,
  _type: "AnimateTrack",
  _data: {
    _track: "funyyy",
    _duration: 0.6666666,
    _position: [
      [0, 0, 0, 0],
      [-1, 0, 0, 0.75, "easeInOutCirc"]
    ]
  }
});
for (i = 282+(2/3) ; i <= 286 ; i += (2/3)) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "funyyy",
      _duration: 2/3,
      _position: [
        [-1, 0, 0, 0],
        [0, 0, 0, 0.75, "easeInOutCirc"]
      ]
    }
  }, {
    _time: i += (2/3),
    _type: "AnimateTrack",
    _data: {
      _track: "funyyy",
      _duration: 2/3,
      _position: [
        [0, 0, 0, 0],
        [-1, 0, 0, 0.75, "easeInOutCirc"]
      ]
    }
  });
}

springShake(312, 336, "kiccccShake", 4, 8, 1.5, 1.25, 1)
springShake(337, 342, "kiccccShake", 0.75, 1.5, 1.5, 1.25, 1)
springShake(344, 350, "kiccccShake", 4, 8, 1.5, 1.25, 1)
trackOnNotesBetween("kiccccShake", 312, 350)
trackOnNotesBetween(["kiccccShake", "kickScale"], 344, 375)

for (i = 344 ; i <= 367 ; i++) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "kickScale",
      _duration: 1,
      _position: [
        [0, 0, 0, 0],
        [(getRndInteger(-7,7)/10), (getRndInteger(-3,3)/10), 0, 0.125, "easeInOutElastic"],
        [0, 0, 0, 0.625, "easeOutBack"]
      ],
      _scale: [
        [1, 1, 1, 0],
        [1.25, 1.1, 1, 0.125, "easeOutBack"],
        [1, 1, 1, 0.625, "easeOutCubic"]
      ]
    }
  });
}
for (i = 368 ; i <= 371.55 ; i += 0.5) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "kickScale",
      _duration: 1,
      _position: [
        [0, 0, 0, 0],
        [(getRndInteger(-7,7)/10), (getRndInteger(-3,3)/10), 0, 0.125, "easeInOutElastic"],
        [0, 0, 0, 0.625, "easeOutBack"]
      ],
      _scale: [
        [1, 1, 1, 0],
        [1.25, 1.1, 1, 0.125, "easeOutBack"],
        [1, 1, 1, 0.625, "easeOutCubic"]
      ]
    }
  });
}
for (i = 372 ; i <= 374 ; i += 0.25) {
  _customEvents.push({
    _time: i-0.0625,
    _type: "AnimateTrack",
    _data: {
      _track: "kickScale",
      _duration: 0.5,
      _position: [
        [0, 0, 0, 0],
        [(getRndInteger(-2,2)/10), (getRndInteger(-1,1)/10), 0, 0.125, "easeInOutElastic"],
        [0, 0, 0, 0.625, "easeOutBack"]
      ],
      _scale: [
        [1, 1, 1, 0],
        [1.25, 1.1, 1, 0.125, "easeOutBack"],
        [1, 1, 1, 0.625, "easeOutCubic"]
      ]
    }
  });
}

floatingPath(376, 387.9, "floatPath2", 2)


// some dissolv stuffs

trackOnNotesBetween(["bridgeDissolv", "kickScale"], 351, 372)
trackOnNotesBetween(["bridgeDissolv2", "kickScale"], 373, 375)
trackOnNotesBetween(["floatPath2", "bridgeDissolv2", "kickScale"], 376, 378)
_customEvents.push({
  _time: 351,
  _type: "AnimateTrack",
  _data: {
    _track: "bridgeDissolv",
    _duration: 2,
    _dissolve: [
      [1, 0],
      [0, 0.5, "easeInCirc"],
      [1, 0.75, "easeOutCubic"]
    ]
  }
}, {
  _time: 359,
  _type: "AnimateTrack",
  _data: {
    _track: "bridgeDissolv",
    _duration: 2,
    _dissolve: [
      [1, 0],
      [0, 0.5, "easeInCirc"],
      [1, 0.75, "easeOutCubic"]
    ]
  }
}, {
  _time: 368-0.25,
  _type: "AnimateTrack",
  _data: {
    _track: "bridgeDissolv",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 0.25, "easeInCirc"],
      [1, 1, "easeOutCubic"]
    ]
  }
}, {
  _time: 369-0.25,
  _type: "AnimateTrack",
  _data: {
    _track: "bridgeDissolv",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 0.25, "easeInCirc"],
      [1, 1, "easeOutCubic"]
    ]
  }
}, {
  _time: 370.5-0.25,
  _type: "AnimateTrack",
  _data: {
    _track: "bridgeDissolv",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 0.25, "easeInCirc"],
      [1, 1, "easeOutCubic"]
    ]
  }
}, {
  _time: 372-0.25,
  _type: "AnimateTrack",
  _data: {
    _track: "bridgeDissolv",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 0.25, "easeInCirc"],
      [1, 1, "easeOutCubic"]
    ]
  }
}, {
  _time: 372,
  _type: "AnimateTrack",
  _data: {
    _track: "bridgeDissolv2",
    _duration: 4,
    _dissolve: [
      [1, 0],
      [0, 0.5, "easeInCirc"],
      [1, 0.75, "easeOutCubic"]
    ]
  }
});

//#region end glitch

_customEvents.push(
//{
//  _time:0,
//  _type:"AssignTrackParent",
//  _data:{
//    _childrenTracks:["particleSphere"],
//    _parentTrack: "particleParent"
//  }
//},
{
  _time:0,
  _type:"AssignTrackParent",
  _data:{
    _childrenTracks:["sphere"],
    _parentTrack: "sphereParent"
  }
}, {
  _time:0,
  _type:"AnimateTrack",
  _data:{
    _track:"sphereParent",
    _scale: [
      [2,2,2,0]
    ],
    _position:[
      [0,5,50,0]
    ]
  }
});

// filteredobstacles = _obstacles.filter(o => o._time >= 394 && o._time <= 500 && o._customData._track == "particleSphere");
// filteredobstacles.forEach(obstacle => {
//   secondaryObstacleTrack = `particleSphere${obstacle._time}`;
//   obstacle._customData._track = ["particleSphere", secondaryObstacleTrack];
//   pointDfnName = `particleRotUD${obstacle._time}`;
//   rotation1 = getRndInteger(35,65);
//   rotation2 = getRndInteger(-65,-35);
// 
//   _pointDefinitions.push({
//     _name: pointDfnName,
//     _points: [
//       [rotation1, null, null, 0],
//       [rotation2, null, null, 0.5, "easeInOutCirc"],
//       [rotation1, null, null, 1, "easeInOutCirc"]
//     ]
//   });
//   _customEvents.push({
//     _time: obstacle._time,
//     _type: "AnimateTrack",
//     _data: {
//       _track: secondaryObstacleTrack,
//       _duration: 0.25,
//       _rotation: [
//         [null, null, null, 0],
//         [rotation1, null, null, 1, "easeInOutCirc"]
//       ]
//     }
//   });
//   for (i = obstacle._time+0.25 ; i <= obstacle._time+110 ; i+=0.25) {
//     _customEvents.push({
//       _time: i,
//       _type: "AnimateTrack",
//       _data: {
//         _track: secondaryObstacleTrack,
//         _duration: 0.25,
//         _rotation: pointDfnName
//       }
//     });
//   }
// });
//for (i = 388 ; i <= 490 ; i += 0.5) {
//  _customEvents.push(
//    {
//    _time: i,
//    _type:"AnimateTrack",
//    _data:{
//      _track: "particleParent",
//      _duration: 0.5,
//      _rotation: [
//        [0, 0, 0, 0],
//        [0, 90, 0, 0.25],
//        [0, 180, 0, 0.5],
//        [0, 270, 0, 0.75],
//        [0, 360, 0, 1]
//      ]
//    }
//  });
//}

// for (i = 388 ; i <= 490 ; i += 4) {
_customEvents.push({
  _time: 420,
  _type: "AnimateTrack",
  _data: {
    _track: "sphere",
    _duration: 1,
    _dissolve: [
      [0, 0]
    ]
  }
}, 
{
  _time: 480,
  _type:"AnimateTrack",
  _data:{
    _track: "sphere",
    _duration: 4,
    _dissolve: [
      [0, 0],
      [1, 1]
    ],
    _scale: [
      [2,2,2,0]
    ],
    _color: [
      [6, 4.6, 5, 1, 0],
      [10, 4.6, 0, -69, 0.125, "easeOutSine"],
      [6, 4.6, 5, 1, 0.25, "easeStep"],
      [10, 4.6, 0, -69, 0.375, "easeOutSine"],
      [6, 4.6, 5, 1, 0.5, "easeStep"],
      [10, 4.6, 0, -69, 0.625, "easeOutSine"],
      [6, 4.6, 5, 1, 0.75, "easeStep"],
      [10, 4.6, 0, -69, 0.875, "easeOutSine"],
      [6, 4.6, 5, 1, 1, "easeStep"],
    ],
    _position: [
      [0, 5, 25, 0],
      [-2, -2, 25, 0.25,"easeOutCirc"],
      [2, 7, 25, 0.5, "easeInOutCirc"],
      [-2, -2,25,0.75,"easeInOutCirc"],
      [0, 5, 25.0, 1.0, "easeInCirc"]
    ]
  }
});
// }


_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "screenTrack",
    _duration: 1,
    _position: [
      [0,25,150,0]
    ]
  }
}, {
  _time: 394,
  _type: "AnimateTrack",
  _data: {
    _track: "screenTrack",
    _duration: 1,
    _position: [
      [0,25,150,0],
      [0,0,150,1]
    ]
  }
}, {
  _time: 484,
  _type: "AnimateTrack",
  _data: {
    _track: "ConstParent",
    _duration: 4,
    _position: [
      [0, -1, 5, 0],
      [0, -75, 5, 1]
    ],
    _scale: [
      [1, 1, 1, 0],
      [50, 1, 1, 1]
    ]
  }
}, {
  _time: 484,
  _type: "AnimateTrack",
  _data: {
    _track: "NeonTubeTrack",
    _duration: 1,
    _position: [
      [0, 69420, 69420, 0]
    ]
  }
}, {
  _time: 484,
  _type: "AnimateTrack",
  _data: {
    _track: "screenTrack",
    _duration: 0.5,
    _position: [
      [0,0,150,0],
      [0,0,195,1]
    ]
  }
});

trackOnNotesBetween("playerTrack", 484, 389)

unoriginalSpinningEffectImNotSorryAerolunaFuckYouSmileyFace(396, 484, "spinEternally", 2.5)

//chaosPath(396, 484, null, 2, 3, 360, 5, 0.75)

_customEvents.push({
  _time: 392,
  _type: "AnimateTrack",
  _data: {
    _track: "glitch",
    _duration: 4,
    _dissolve: [
      [0.125, 0],
      [0.125, 0.5],
      [0, 0.999, "easeOutCirc"],
      [1, 1, "easeStep"]
    ],
    _color: [
      [1.25, 1.25, 1.25, 5, 0]
    ]
  }
});

visionGlitch(388, 392, 0.25, "glitch")
visionGlitch(394, 395.9, 0.25, "glitch")
visionGlitch(396, 417.9, 1, "glitch")
visionGlitch(416, 419.9, 0.5, "glitch")
visionGlitch(420, 423.9, 0.25, "glitch")
visionGlitch(424, 447.9, 1, "glitch")
visionGlitch(448, 451.9, 0.5, "glitch")
visionGlitch(452, 455.9, 0.25, "glitch")
visionGlitch(456, 471.9, 1, "glitch")
visionGlitch(472, 479.9, 0.5, "glitch")
visionGlitch(480, 483.9, 0.25, "glitch")
visionGlitch(484, 484.1, 1, "glitch")
visionGlitch(485.5, 486.1, 0.5, "glitch")

trackOnNotesBetween("playerTrack", 483, 486)
trackOnNotesBetween("playerTrack", 486.1, 490, 8)
_customEvents.push({
  _time: 0,
  _type: "AssignPlayerToTrack",
  _data: {
    _track: "playerTrack"
  }
}, {
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "glitch",
    _duration: 1,
    _scale: [
      [2,2,1,0]
    ]
  }
},{
  _time: 487,
  _type: "AnimateTrack",
  _data: {
    _track: "glitch",
    _duration: 1,
    _dissolve: [
      [1,0],[0,1]
    ]
  }
}, {
  _time: 484,
  _type: "AnimateTrack",
  _data: {
    _track: "playerTrack",
    _duration: 4,
    _position: [
      [0, 0, 0, 0],
      [0, 0, 100, 1, "easeInExpo"]
    ]
  }
}, {
  _time: 484,
  _type: "AnimateTrack",
  _data: {
    _track: "sphere",
    _duration: 4,
    _dissolve: [
      [1, 0],
      [0, 1]
    ]
  }
}, 
//{
//  _time: 484,
//  _type: "AnimateTrack",
//  _data: {
//    _track: "particleSphere",
//    _duration: 4,
//    _dissolve: [
//      [1, 0],
//      [0, 1]
//    ]
//  }
//}, 
{
  _time: 480,
  _type: "AnimateTrack",
  _data: {
    _track: "sphere",
    _duration: 1,
    _color: [
      [6, 4.6, 5, 1, 0],
      [9,4.6,0,-69,1]
    ]
  }
});

_customEvents.push({
  _time: 519.99,
  _type: "AnimateTrack",
  _data: {
    _track: "playerTrack",
    _duration: 1,
    _position: [
      [0, 0, 0, 0]
    ]
  }
});
//#endregion


//path assemble


assembleTrack(24, 31, 4, "intro", 16)
assembleTrack(32, 39, 4, "intro", 16)
assembleTrack(40, 47, 4, "intro", 16)
assembleTrack(48, 51, 4, "intro", 16)

assembleTrack(58, 59, 4, "intro", 16)
assembleTrack(59, 64, 4, "intro", 16)
assembleTrack(282, 286, 4, "haha",16)
assembleTrack(11, 12, 4, "intro", 10)
assembleTrack(15, 16, 4, "intro", 10)

//#region Environment Stuff


_environment.push(
  { _id: "7\\]\\w{14}ion", _scale: [5, 1, 5], _localPosition: [0, -10, -50], _lookupMethod: "Regex", _active: true, _track: "TrackConstTrack"},
  { _id: "6\\]\\w{8}tion", _scale: [9, 5, 1], _localPosition: [0, 20, 0], _lookupMethod: "Regex", _active: true, _track: "ConstTrack"},
  { _id: "6\\]\\w{8}tion", _duplicate: 1, _scale: [9, 5, 1], _localPosition: [0, 20, 15], _lookupMethod: "Regex", _active: true, _track: "ConstTrack"},
  { _id: "Mirror", _lookupMethod: "Regex", _active:false},
  { _id: "Player\\w+\\.\\[\\d\\]Mirror", _lookupMethod: "Regex", _active: true},
  { _id: "Spectrograms$", _lookupMethod: "Regex", _active:false},
  { _id: "CinemaScreen$", _lookupMethod: "Regex", _track: "screenTrack", _active:true},
  { _id: "SidePS.$", _lookupMethod: "Regex", _rotation: [0,0,0], _scale:[10,1,1]},
  { _id: "NeonTube", _lookupMethod: "Regex", _track: "NeonTubeTrack"}
);

//for (i = 28 ; i <= 31 ; i++) {
//  _environment.push(
//    { _id: `\\[${i}\\]RotatingLasersPair(\\.| \\(\\d\\)\\.)\\[0\\]BaseL$`, _lookupMethod: "Regex", _localPosition: [-9.5795, -11.2455, null]},
//    { _id: `\\[${i}\\]RotatingLasersPair(\\.| \\(\\d\\)\\.)\\[1\\]BaseR$`, _lookupMethod: "Regex", _localPosition: [9.5795, 11.2455, null]}
//  )
//}
for (i = 1 ; i <= 16 ; i++) {
  _environment.push(
    { _id: "RotatingLasersPair$", _lookupMethod: "Regex", _duplicate: 1, _scale: [2*getRndInteger(0.5,2), 2*getRndInteger(0.5,2), 2*getRndInteger(0.5,2)], _localPosition: [getRndInteger(-80,80)*i/20, getRndInteger(-30,50)/20, getRndInteger(40,160)*i/20]},
    { _id: "RotatingLasersPair\\(Clone\\)..0.BaseL$", _lookupMethod: "Regex", _scale: [2*getRndInteger(0.25,4), 2*getRndInteger(0.25,4), 2*getRndInteger(0.25,4)]},
    { _id: "RotatingLasersPair\\(Clone\\)..1.BaseR$", _lookupMethod: "Regex", _scale: [2*getRndInteger(0.25,4), 2*getRndInteger(0.25,4), 2*getRndInteger(0.25,4)]}
  );
}

//for (i = 1; i <= 2 ; i++) {
//  _environment.push(
//    { _id: "SmokePS$", _lookupMethod: "Regex", _duplicate: 1, _scale: [0.25*(i*0.75), 0.25*(i*0.75), 0.25*(i*0.75)], _track: "SmokeTrack"}
//  );
//}


_environment.push(
  { _id: "RotatingLasersPair\\(Clone\\)$", _lookupMethod: "Regex", _duplicate: 1, _scale: [0.01, 0.01, 0.01], _position: [0, 10000, -10000]},
  { _id: "RotatingLasersPair\\(Clone\\)\\(Clone\\).*BaseL$", _lookupMethod: "Regex", _position: [0,1000,-1000]},
  { _id: "RotatingLasersPair\\(Clone\\)\\(Clone\\).*BaseR$", _lookupMethod: "Regex", _position: [0,1000,-1000]}
);
//
//
//_customEvents.push({
//  _time: 0,
//  _type: "AssignTrackParent",
//  _data: {
//    _parentTrack: "SmokeParent",
//    _childrenTracks: [
//      "SmokeTrack1",
//      "SmokeTrack2",
//      "SmokeTrack3",
//      "SmokeTrack4",
//      "SmokeTrack5",
//      "SmokeTrack6",
//      "SmokeTrack7",
//      "SmokeTrack8",
//    ]
//  }
//}, {
//  _time: 395.99,
//  _type: "AnimateTrack",
//  _data: {
//    _track: "SmokeParent",
//    _duration: 1,
//    _position: [
//      [0, 0, 0, 0],
//      [0, 0, -5, 1]
//    ]
//  }
//});
//
//for (i = 396 ; i <= 488 ; i++) {
//  _customEvents.push({
//    _time: i,
//    _type: "AnimateTrack",
//    _data: {
//      _track: "SmokeParent",
//      _duration: 1,
//      _rotation: [
//        [0, 0, 0, 0],
//        [0, 90, 0, 0.25],
//        [0, 180, 0, 0.5],
//        [0, 270, 0, 0.75],
//        [0, 360, 0, 1]
//      ],
//      _scale: [
//        [0.5, 0.5, 0.5, 0],
//        [0.0625, 0.0625, 0.0625, 0.5, "easeInOutSine"],
//        [0.5, 0.5, 0.5, 1, "easeOutSine"]
//      ]
//    }
//  });
//}

for (i = 1, y = 2.3, pos = 200 ; i <= 15 ; i++, y -= 0.15, pos-=10) {
  _environment.push(
    { _id: `\\[${i}\\]LightsTrackLaneRing.Clone.*Laser.{0,4}$`, _lookupMethod: "Regex", _scale: [1, 1.925, 1]},
    { _id: `\\[${i}\\].{15}Ring.Clone.$`, _lookupMethod: "Regex", _scale: [y,y,1], _localPosition: [0,0,pos]}
  );
}

for (times = 1, i = -8.666, i2 = 1.666 ; times <= 16 ; times++, i+=0.5, i2 += 0.5) {
  _environment.push(
    { _id: "33\\]Laser$", _lookupMethod: "Regex", _duplicate: 1, _rotation: [0, 0,-7.5], _localPosition: [i+5, 50, 20], _track: "laserTrack"},
    { _id: "33\\]Laser$", _lookupMethod: "Regex", _duplicate: 1, _rotation: [0, 0, 7.5], _localPosition: [i2-5, 50, 20], _track: "laserTrack"}
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
