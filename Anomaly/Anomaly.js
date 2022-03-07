const fs = require("fs");

const INPUT = "ExpertStandard.dat";
const OUTPUT = "ExpertPlusStandard.dat";

let difficulty = JSON.parse(fs.readFileSync(INPUT));

//#region this just counts how many time you ran it for fun, feel free to remove.
if (!fs.existsSync("count.txt")) {
  fs.writeFileSync("count.txt", parseInt("0").toString());
}
let count = parseInt(fs.readFileSync("count.txt"));
count++;
fs.writeFileSync("count.txt", count.toString());
console.log("GIVE IT UP FOR RUN " + count);
//#endregion

//        -  -  -  -  -  -  -  -  -  -  -  -  -  LOOK BELOW FOR COMMENT TEXT WITH A LINE LIKE THIS. READ ALL OF THESE BEFORE USING!  -  -  -  -  -  -  -  -  -  -  -  -  -

difficulty._customData = { _pointDefinitions: [], _customEvents: [] };

const _customData = difficulty._customData;
const _obstacles = difficulty._obstacles;
const _notes = difficulty._notes;
const _customEvents = _customData._customEvents;
const _pointDefinitions = _customData._pointDefinitions;

let filterednotes;

_obstacles.forEach((wall) => {
  if (!wall._customData) {
    wall._customData = {};
  }
});

_notes.forEach((note) => {
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
          [1, 1, 1, 0.9, "easeOutBack"],
        ],
      },
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
        _dissolveArrow: [
          [0, 0.499],
          [1, 0.5],
          [1, 1],
        ],
      },
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
        _dissolve: [
          [0, 0.499],
          [1, 0.5],
          [1, 1],
        ],
      },
    });
  }
}

function genCircle(radius, n) {
  let pointss = [];
  for (let i = 0; i < n; i++) {
    pointss.push([
      radius * Math.cos(((2 * Math.PI) / n) * i) - 0.5,
      radius * Math.sin(((2 * Math.PI) / n) * i) * 1.16 - 1.6,
    ]);
  }
  return pointss;
}
function genCircleNoCorrection(radius, n) {
  let pointss = [];

  for (let i = 0; i < n; i++) {
    pointss.push([
      radius * Math.cos(((2 * Math.PI) / n) * i),
      radius * Math.sin(((2 * Math.PI) / n) * i),
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
  filterednotes = _notes.filter((n) => n._time >= p1 && n._time <= p2);
  filterednotes.forEach((object) => {
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
  return _notes.filter((n) => times.some((t) => n._time == t));
}

function trackOnNotesBetween(track, p1, p2, potentialOffset) {
  filterednotes = _notes.filter((n) => n._time >= p1 && n._time <= p2);
  filterednotes.forEach((object) => {
    object._customData._track = track;
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
  });
  return filterednotes;
}

function trackOnWallsBetween(track, p1, p2, potentialOffset) {
  filterednotes = _obstacles.filter((n) => n._time >= p1 && n._time <= p2);
  filterednotes.forEach((object) => {
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
  filterednotes = _notes.filter((n) => n._time >= p1 && n._time <= p2);
  filterednotes.forEach((object) => {
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
  filterednotes = _notes.filter((n) => n._time >= p1 && n._time <= p2);
  filterednotes.forEach((object) => {
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
  filterednotes = _notes.filter((n) => n._time >= p1 && n._time <= p2);
  filterednotes.forEach((object) => {
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

function goBack(Start, End) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time < End);
  filterednotes.forEach((note) => {
    let n1 = JSON.parse(JSON.stringify(note));
    n1._time = note._time;
    n1._customData._fake = true;
    n1._customData._interactable = false;
    if (!n1._customData._animation) n1._customData._animation = {};
    n1._customData._animation._scale = [
      [0, 0, 0, 0.5],
      [0.75, 0.75, 0.75, 0.65],
    ];
    n1._customData._animation._position = [
      [0, 0, 0, 0.5],
      [2, 0, 0, 0.6],
      [-2, 0, 0, 0.7],
      [2, 0, 0, 0.8],
      [-2, 0, 0, 0.9],
      [0, 0, -10, 1],
    ];
    n1._customData._animation._dissolveArrow = [[0, 0]];
    n1._customData._animation._dissolve = [
      [0, 0],
      [0, 0.5],
      [1, 0.55],
      [0.1, 1],
    ];
    n1._customData._animation._definitePosition = [
      [0, 0, 1, 0.5],
      [0, 0, 30, 1],
    ];
    n1._customData._animation._localRotation = [
      [0, 0, 0, 0.5],
      [0, 0, 90, 0.6],
      [0, 0, 180, 0.7],
      [0, 0, 270, 0.8],
      [0, 0, 360, 0.9],
      [0, 0, 450, 1],
    ];
    _notes.push(n1);
  });
}

function trackDup(Start, End, Amount, AssignTrackR, AssignTrackB, invisTrack) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time < End);
  filterednotes.forEach((note) => {
    notePos = note._lineIndex + 2;
    for (npos = 1; npos <= Amount; npos++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._customData._position = [notePos + npos * 4, 0];
      if (n1._type == 0) {
        n1._customData._track = AssignTrackR;
      }
      if (n1._type == 1) {
        n1._customData._track = AssignTrackB;
      }
      n1._customData._fake = true;
      n1._customData._interactable = false;
      _notes.push(n1);
    }
    for (npos = 1; npos <= Amount; npos++) {
      let n2 = JSON.parse(JSON.stringify(note));
      n2._customData._position = [notePos - npos * 4, 0];
      if (n2._type == 0) {
        n2._customData._track = AssignTrackR;
      }
      if (n2._type == 1) {
        n2._customData._track = AssignTrackB;
      }
      n2._customData._fake = true;
      n2._customData._interactable = false;
      _notes.push(n2);
    }
    if (invisTrack == true) {
      let n3 = JSON.parse(JSON.stringify(note));
      n3._customData._interactable = false;
      n3._customData._fake = true;
      n3._customData._position = [notePos, 0];
      if (n3._type == 0) {
        n3._customData._track = AssignTrackR;
      }
      if (n3._type == 1) {
        n3._customData._track = AssignTrackB;
      }
      if (!note._customData._animation) note._customData._animation = {};
      note._customData._animation._dissolve = [[0, 0]];
      note._customData._animation._dissolveArrow = [[0, 0]];
      _notes.push(n3);
      _notes.push(note);
    }
  });
}

function arrowBloq(Start, End, AssignTrackArr) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    let nArr = JSON.parse(JSON.stringify(note));
    nArr._time = note._time;
    nArr._customData._track = AssignTrackArr;
    nArr._customData._interactable = false;
    nArr._customData._fake = true;
    if (!nArr._customData._animation) nArr._customData._animation = {};
    nArr._customData._animation._dissolve = [[0, 0]];
    _notes.push(nArr);
  });
}

function randPath(Start, End, AssignTrack) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    if (!note._customData._animation) note._customData._animation = {};
    randPosX1 = getRndInteger(-5, 5);
    randPosY1 = getRndInteger(-2, 2);
    randPosX2 = getRndInteger(-5, 5);
    randPosY2 = getRndInteger(-2, 2);
    randPosX3 = getRndInteger(-5, 5);
    randPosY3 = getRndInteger(-2, 2);

    randRotX1 = getRndInteger(-180, 180);
    randRotX2 = getRndInteger(-180, 180);
    randRotX3 = getRndInteger(-180, 180);

    randRotY1 = getRndInteger(-180, 180);
    randRotY2 = getRndInteger(-180, 180);
    randRotY3 = getRndInteger(-180, 180);

    randRotZ1 = getRndInteger(-180, 180);
    randRotZ2 = getRndInteger(-180, 180);
    randRotZ3 = getRndInteger(-180, 180);

    note._customData._track = AssignTrack;
    note._customData._animation._definitePosition = [
      [randPosX1, randPosY1, 30, 0],
      [randPosX2, randPosY2, 25, 0.1, "splineCatmullRom"],
      [randPosX3, randPosY3, 20, 0.2, "splineCatmullRom"],
      [0, 0, 10, 0.3, "splineCatmullRom"],
      [0, 0, 0, 0.5],
      [0, 0, -10, 1],
    ];
    note._customData._animation._localRotation = [
      [randRotX1, randRotY1, randRotZ1, 0],
      [randRotX2, randRotY2, randRotZ3, 0.1, "easeInOutBack"],
      [randRotX3, randRotY3, randRotZ3, 0.2, "easeInOutBack"],
      [0, 0, 0, 0.75, "easeInOutBack"],
    ];
  });
}

function randPath(Start, End, AssignTrack) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    if (!note._customData._animation) note._customData._animation = {};
    randPosX1 = getRndInteger(-5, 5);
    randPosY1 = getRndInteger(-2, 2);
    randPosX2 = getRndInteger(-5, 5);
    randPosY2 = getRndInteger(-2, 2);
    randPosX3 = getRndInteger(-5, 5);
    randPosY3 = getRndInteger(-2, 2);
    randRot1 = getRndInteger(-90, 90);
    randRot2 = getRndInteger(-90, 90);
    randRot3 = getRndInteger(-90, 90);

    note._customData._track = AssignTrack;
    note._customData._animation._definitePosition = [
      [randPosX1, randPosY1, 30, 0],
      [randPosX2, randPosY2, 25, 0.1, "splineCatmullRom"],
      [randPosX3, randPosY3, 20, 0.2, "splineCatmullRom"],
      [0, 0, 15, 0.3, "splineCatmullRom"],
      [0, 0, 0, 0.5],
      [0, 0, -15, 1],
    ];
    note._customData._animation._localRotation = [
      [randRot1, randRot1, randRot1, 0],
      [randRot2, randRot2, randRot2, 0.1],
      [randRot3, randRot3, randRot3, 0.2],
      [0, 0, 0, 0.3],
    ];
  });
}

function sideCreate(
  Start,
  End,
  AssignTrack,
  AssignTrackLeft,
  AssignTrackRight
) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    let n1 = JSON.parse(JSON.stringify(note));
    n1._customData._position = [note._lineIndex - 2 - 6, note._lineLayer];
    n1._customData._scale = [0.5, 0.5, 0.5];
    n1._customData._track = AssignTrackLeft;
    n1._customData._fake = true;
    n1._customData._interactable = false;

    let n2 = JSON.parse(JSON.stringify(note));
    n2._customData._position = [note._lineIndex - 2 + 6, note._lineLayer];
    n2._customData._scale = [0.5, 0.5, 0.5];
    n2._customData._track = AssignTrackRight;
    n2._customData._fake = true;
    n2._customData._interactable = false;

    note._customData._track = AssignTrack;

    _notes.push(n1);
    _notes.push(n2);
  });
}

function arrowCurve(Start, End, amount) {
  rotatoX = -6;
  rotatoY = 2;
  rotatoZ = 7;
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
        _notes.push(n1);
      }
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

function pulseOnNote(Start, End, Multiplier) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    let n1 = JSON.parse(JSON.stringify(note));
    _customEvents.push({
      _time: n1._time,
      _type: "AnimateTrack",
      _data: {
        _track: "pulseFunction",
        _duration: 0.25,
        _scale: [
          [1, 1, 1, 0],
          [Multiplier, Multiplier, Multiplier, 0.025],
          [1, 1, 1, 0.75, "easeOutQuad"]
        ]
      }
    });
  });
}


//#endregion

/*
//#region  EXAMPLES   -  -  -  -  -  -  -  -  -  -  -  -  -  use these as a copy/paste template for the lazy   -  -  -  -  -  -  -  -  -  -  -  -  -  




// ---- function calling example - use these when possible to get rid of clutter and make life easier

trackOnNotesBetween("dumb track name here", start beat here, end beat here, offset here);    





// These three bits below are different ways of filtering notes by time. You can filter notes by specific beats, or by sections of beats. 
// Data written here, will be applied directly to the note, and any animation data will act as a "path animation" and will animate over the course of each individual notes life, not by specific beats. 
// ----  Usually follows [x,y,z,time]  ----  Note: when adding animatios directly to the note (path animations); time "0" is note spawn - "0.5" is when the note is at players feet, and "1" is when the note dies

// It's good practice to have the note at it's original position by ~0.4,0.45 to compensate for sabers being long and the player usually cutting the note before it arrives ath the feet on the platform. 
// Also, if you want to do funny animations, use a longer offset - as long as your custom animation finishes around "0.45" the player will percieve it as a comfortable offset (yes, even if it's at like +10)




filterednotes = notesAt([insert specific note time/beat here]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = -0.1;       // tbh I only really use this for NJS/offset changes and to remove the spawn effect.
  note._customData._noteJumpMovementSpeed = 17;       
  note._customData._animation = {}         // this chunk of text is required if doing any note animations this way
  note._customData._animation._rotation = [[-90, 0, 0, 0],[0,0,0,0.5,"easeOutElastic"]];     // feel free to use any of the other animation properties from the github --- these will add each animation on a per note basis
});

filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
filterednotes.forEach(note => {
  note._customData._track = "dumb track name here";
  note._customData._noteJumpStartBeatOffset = 69;
  note._customData._noteJumpMovementSpeed = 420;
});

filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
filterednotes.forEach(note => {
  note._customData._track = "dumb track name here";
  note._customData._noteJumpStartBeatOffset = 666;
  note._customData._noteJumpMovementSpeed = 777;
  note._customData._fake = true;
  note._customData._interactable = false;
  note._customData._disableSpawnEffect = "true"   // NOTE: removing spawn effect will scuff practice mode if you try and play at a section or track with a note already spawnd that has this property set to true - you need to start playing before these spawn in
});









//use this to push "_customEvents" like track animations, path animations, track parenting, assigning player to track, etc.

_customEvents.push({
  _time: 69,
  _type: "AnimateTrack",
  _data: {
    _track: "dumb track name here",
    _duration: 420,
    _easing: "easeOutQuad",
    _position: [[0, 0, 0, 0], [0, 10, 10, 1]],
    _rotation: [[0, 180, 0, 0]],
    _dissolve: [[1, 0], [0, 0.8]],
    _dissolveArrow: [[1, 0], [0, 1]]
  }
});       



// you can string together multiple thingies by adding a comma after ""}"" and slapping in another {} thingy - like so vvvvvvvvv

// If your track/note animation spawns normally, and kind of "jumps" or snaps to the next spot, make sure the note/track is in the desired position before the notes spawn. - Adjust animation time to before note spawns
//   ---   The example below will snap to _rotation "20" on the y axis, because at _time "0", y axis was at "-15"   ---   you gotta make sure these match :)

_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "dumb track name here",
    _duration: 1,
    _position: [[0, 0, 0, 0]],
    _rotation: [[0, -15, 0, 0]],
    _dissolve: [[1, 0]],
    _dissolveArrow: [[1, 0]]
  }
}, {
  _time: 69,
  _type: "AnimateTrack",
  _data: {
    _track: "dumb track name here",
    _duration: 420,
    _easing: "easeOutQuad",
    _position: [[0, 0, 0, 0], [0, 10, 10, 1]],
    _rotation: [[0, 20, 0, 0]],
    _dissolve: [[1, 0], [0, 0.8]],
    _dissolveArrow: [[1, 0], [0, 1]]
  }
});

// you can also modify these push things to add in _pointDefinitions, _notes, _obstacles, and _events (lighting)   ----    There are better examples of this in the original demo.js file from the NE Documentation and some of the functions above. 






*/
//#region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -

// NJS, Offset and PointDefinitions

_customEvents.push({
  _time: 0,
  _type: "AssignPlayerToTrack",
  _data: {
    _track: "playerTrack",
  },
});

_pointDefinitions.push(
  {
    _name: "kickScale",
    _points: [
      [1, 1, 1, 0],
      [4.5, 0.2, 1, 0.1, "easeStep"],
      [1, 1, 1, 0.75, "easeInOutElastic"],
    ],
  },
  {
    _name: "kickPos",
    _points: [
      [0, 0, 0, 0],
      [-0.4, 0, 0, 0.1, "easeOutElastic"],
      [0.4, 0, 0, 0.2, "easeOutElastic"],
      [-0.3, 0, 0, 0.3, "easeOutElastic"],
      [0.3, 0, 0, 0.4, "easeOutElastic"],
      [-0.2, 0, 0, 0.5, "easeOutElastic"],
      [0.2, 0, 0, 0.6, "easeOutElastic"],
      [-0.1, 0, 0, 0.7, "easeOutElastic"],
      [0, 0, 0, 0.75, "easeOutElastic"],
    ],
  },
  {
    _name: "kickDis",
    _points: [
      [1, 0],
      [0.4, 0.1, "easeInOutBack"],
      [0.7, 0.6, "easeInOutBack"],
      [1, 0.75, "easeOutBounce"],
    ],
  },
  {
    _name: "doubleRotato",
    _points: [
      [0, 0, 0, 0],
      [0, 0, 90, 0.125],
      [0, 0, 180, 0.25],
      [0, 0, 270, 0.375],
      [0, 0, 360, 0.5],
      [0, 0, 0, 0.5],
      [0, 0, 90, 0.625],
      [0, 0, 180, 0.75],
      [0, 0, 270, 0.875],
      [0, 0, 360, 1],
    ],
  },
  {
    _name: "singleRotato",
    _points: [
      [0, 0, 0, 0],
      [0, 0, 90, 0.25],
      [0, 0, 180, 0.5],
      [0, 0, 270, 0.75],
      [0, 0, 360, 1],
    ],
  },
  {
    _name: "lRSpline",
    _points: [
      [0, -15, 0, 0],
      [-5, 0, 0, 0.5, "splineCatmullRom"],
      [0, 15, 0, 1, "splineCatmullRom"],
    ],
  },
  {
    _name: "rLSpline",
    _points: [
      [0, 15, 0, 0],
      [-5, 0, 0, 0.5, "splineCatmullRom"],
      [0, -15, 0, 1, "splineCatmullRom"],
    ],
  }
);

_customEvents.push(
  {
    _time: 0,
    _type: "AssignTrackParent",
    _data: {
      _childrenTracks: ["trackWalkR", "trackWalkB"],
      _parentTrack: "trackWalk",
    },
  },
  {
    _time: 0,
    _type: "AssignTrackParent",
    _data: {
      _childrenTracks: ["kickPos"],
      _parentTrack: "kickPosParent",
    },
  }
);

filterednotes = _notes.filter((n) => n._time >= 0 && n._time <= 19);
filterednotes.forEach((note) => {
  if (note._type == 1) {
    note._customData._position = [15, 0];
  }
  if (note._type == 0) {
    note._customData._position = [-16, 0];
  }
  note._customData._track = "dScaleIntro";
  note._customData._fake = true;
  note._customData._interactable = false;
  note._customData._noteJumpStartBeatOffset = 69;
  note._customData._noteJumpMovementSpeed = 10;
  if (!note._customData._animation) note._customData._animation = {};
  note._customData._animation._dissolveArrow = [[0, 0]];
});

filterednotes = _notes.filter((n) => n._time >= 83 && n._time <= 90);
filterednotes.forEach((note) => {
  note._customData._noteJumpStartBeatOffset = 80;
});

// Intro

trackOnNotesBetween("intro", 20, 78);

for (i = 20; i <= 77; i += 16) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 1.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 4,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 5.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 8,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 9.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 12,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 13.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 14.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    }
  );
}

trackOnNotesBetween("intro", 308, 324);

for (i = 308; i <= 324; i += 16) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      },
    },
    {
      _time: i + 1.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      },
    },
    {
      _time: i + 4,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      },
    },
    {
      _time: i + 5.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      },
    },
    {
      _time: i + 8,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      },
    },
    {
      _time: i + 9.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      },
    },
    {
      _time: i + 12,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      },
    },
    {
      _time: i + 13.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      },
    },
    {
      _time: i + 14.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      },
    }
  );
}

_customEvents.push({
  _time: 80,
  _type: "AnimateTrack",
  _data: {
    _track: "kickPosParent",
    _duration: 4,
    _dissolve: [
      [0, 0],
      [1, 0.875, "easeStep"],
    ],
    _position: [
      [-4, 0, 0, 0],
      [2, 0, 0, 0.125, "easeInOutBack"],
      [-2, 0, 0, 0.25, "easeInOutBack"],
      [1, 0, 0, 0.375, "easeInOutBack"],
      [-1, 0, 0, 0.5, "easeInOutBack"],
      [0.5, 0, 0, 0.625, "easeInOutBack"],
      [-0.5, 0, 0, 0.75, "easeInOutBack"],
      [0, 0, 0, 0.875, "easeInOutBack"],
    ],
  },
});

// kicks

trackOnNotesBetween("kickPos", 84, 131);

for (i = 84; i <= 131; i += 2) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "kickPos",
        _duration: 0.3,
        _position: [
          [0, 0, 0, 0],
          [1.2, 0, 0, 0.5, "easeInOutElastic"],
          [0, 0, 0, 1, "easeInOutElastic"],
        ],
        _scale: [
          [1, 1, 1, 0],
          [1.5, 0.75, 0.75, 0.25, "easeOutQuad"],
          [1, 1, 1, 0.5, "easeInOutQuad"],
          [1.5, 0.75, 0.75, 0.75, "easeOutQuad"],
          [1, 1, 1, 1, "easeInOutQuad"],
        ],
      },
    },
    {
      _time: i + 1,
      _type: "AnimateTrack",
      _data: {
        _track: "kickPos",
        _duration: 0.3,
        _position: [
          [0, 0, 0, 0],
          [-1.2, 0, 0, 0.5, "easeInOutElastic"],
          [0, 0, 0, 1, "easeInOutElastic"],
        ],
        _scale: [
          [1, 1, 1, 0],
          [1.5, 0.75, 0.75, 0.25, "easeOutQuad"],
          [1, 1, 1, 0.5, "easeInOutQuad"],
          [1.5, 0.75, 0.75, 0.75, "easeOutQuad"],
          [1, 1, 1, 1, "easeInOutQuad"],
        ],
      },
    }
  );
}

// The other zigzag thing

trackOnNotesBetween("noteGoBRRRtoSide", 132, 139.7);

for (i = 132; i <= 139.9; i += 2) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "noteGoBRRRtoSide",
        _duration: 1,
        _position: [
          [0, 0, 0, 0],
          [0.45, 0, 0, 0.15, "easeOutBack"],
          [0.5, 0, 0, 0.75],
        ],
      },
    },
    {
      _time: i + 0.75,
      _type: "AnimateTrack",
      _data: {
        _track: "noteGoBRRRtoSide",
        _duration: 1,
        _position: [
          [0.5, 0, 0, 0],
          [0, 0, 0, 0.15, "easeOutBack"],
          [-0.05, 0, 0, 0.75],
        ],
      },
    },
    {
      _time: i + 1.25,
      _type: "AnimateTrack",
      _data: {
        _track: "noteGoBRRRtoSide",
        _duration: 1,
        _position: [
          [-0.05, 0, 0, 0],
          [-0.45, 0, 0, 0.15, "easeOutBack"],
          [-0.5, 0, 0, 0.75],
        ],
      },
    },
    {
      _time: i + 1.5,
      _type: "AnimateTrack",
      _data: {
        _track: "noteGoBRRRtoSide",
        _duration: 1,
        _position: [
          [-0.5, 0, 0, 0],
          [0, 0, 0, 0.15, "easeOutBack"],
          [0.05, 0, 0, 0.75],
        ],
      },
    }
  );
}
// drop stream

trackOnNotesBetween("introStrem", 140, 144);
_customEvents.push({
  _time: 140,
  _type: "AnimateTrack",
  _data: {
    _track: "introStrem",
    _duration: 4,
    _dissolveArrow: [
      [1, 0],
      [0, 1]
    ],
  },
});

// Track Dupe

trackDup(148, 161, 9, "trackWalkR", "trackWalkB", true);
trackDup(164, 171, 9, "trackWalkR", "trackWalkB", true);
trackDup(180, 188, 9, "trackWalkR", "trackWalkB", true);

for (i = 148; i <= 161; i += 2) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "trackWalkB",
        _duration: 0.8,
        _position: [
          [0, 0, 0, 0],
          [-2, 1.1, 0, 0.5, "splineCatmullRom"],
          [-4, 0, 0, 1, "splineCatmullRom"],
        ]
      },
    },
    {
      _time: i + 1,
      _type: "AnimateTrack",
      _data: {
        _track: "trackWalkR",
        _duration: 0.8,
        _position: [
          [0, 0, 0, 0],
          [-2, 1.1, 0, 0.5, "splineCatmullRom"],
          [-4, 0, 0, 1, "splineCatmullRom"],
        ]
      },
    }
  );
}

for (i = 164; i <= 171; i += 2) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "trackWalkB",
        _duration: 0.8,
        _position: [
          [0, 0, 0, 0],
          [2, 1.1, 0, 0.5, "splineCatmullRom"],
          [4, 0, 0, 1, "splineCatmullRom"],
        ]
      },
    },
    {
      _time: i + 1,
      _type: "AnimateTrack",
      _data: {
        _track: "trackWalkR",
        _duration: 0.8,
        _position: [
          [0, 0, 0, 0],
          [2, 1.1, 0, 0.5, "splineCatmullRom"],
          [4, 0, 0, 1, "splineCatmullRom"],
        ]
      },
    }
  );
}

for (i = 180; i <= 188; i += 2) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "trackWalkB",
        _duration: 0.8,
        _position: [
          [0, 0, 0, 0],
          [-2, 1.1, 0, 0.5, "splineCatmullRom"],
          [-4, 0, 0, 1, "splineCatmullRom"],
        ]
      },
    },
    {
      _time: i + 1,
      _type: "AnimateTrack",
      _data: {
        _track: "trackWalkR",
        _duration: 0.8,
        _position: [
          [0, 0, 0, 0],
          [-2, 1.1, 0, 0.5, "splineCatmullRom"],
          [-4, 0, 0, 1, "splineCatmullRom"],
        ]
      },
    }
  );
}

// transition to zigzag

goBack(204, 209);
trackOnNotesBetween("freezeBloq", 196, 203.5);
arrowBloq(196, 203.5, "arrow");

filterednotes = _notes.filter((n) => n._time >= 195.9 && n._time <= 203.9);
filterednotes.forEach((note) => {
  if (note._customData._track == "freezeBloq") {
    note._customData._fake = true;
    note._customData._interactable = false;
  }
});

filterednotes = _notes.filter((n) => n._time >= 195.9 && n._time <= 203.9);
filterednotes.forEach((note) => {
  if (note._customData._track == "arrow") {
    note._customData._fake = false;
    note._customData._interactable = true;
  }
});

_customEvents.push(
  {
    _time: 190,
    _type: "AssignPathAnimation",
    _data: {
      _track: "freezeBloq",
      _duration: 2.5,
      _definitePosition: [
        [0, 0, 30, 0],
        [0, 0, 15, 0.25],
        [0, 0, 10, 1],
      ],
      _dissolve: [
        [0.5, 0],
        [0.5, 0.6],
        [0, 0.75],
      ],
      _dissolveArrow: [[0, 0]],
    },
  },
  {
    _time: 190,
    _type: "AssignPathAnimation",
    _data: {
      _track: "arrow",
      _duration: 2.5,
      _definitePosition: [
        [0, 0, 30, 0],
        [0, 0, 15, 0.25],
        [0, 0, 0, 0.5],
        [0, 0, -15, 0.75],
        [0, 0, -30, 1],
      ],
    },
  }
);

// Weird glitch/jump

trackOnNotesBetween("wtfIsThis", 212, 275.9);

for (i = 212; i <= 258; i += 2) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "wtfIsThis",
        _easing: "easeInOutBounce",
        _duration: 2,
        _position: [
          [0, 0, 0, 0.25],
          [-0.2, 0, 0, 0.26],
          [0, 0, 0, 0.5],
          [0, 0, 0, 0.75],
          [0.2, 0, 0, 0.76],
          [0, 0, 0, 1]
        ],
        _dissolve: [
          [1, 0.25],
          [0.1, 0.26],
          [1, 0.5],
          [1, 0.75],
          [0.1, 0.76],
          [1, 1]
        ],
        _dissolveArrow: [
          [1, 0.25],
          [0.1, 0.26],
          [1, 0.5],
          [1, 0.75],
          [0.1, 0.76],
          [1, 1]
        ],
        _localRotation: [
          [0, 0, 0, 0],
          [0, 0, -10, 0.25],
          [0, 0, 10, 0.75],
          [0, 0, 0, 1]
        ]
      }
    }
  );
}

// flicker

trackOnNotesBetween("flickerStream", 272, 275.9);

for (i = 272; i <= 275.75; i += 0.5) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "flickerStream",
        _duration: 0.5,
        _easing: "easeStep",
        _dissolve: [
          [1, 0],
          [0, 0.5],
          [1, 0]
        ]
      }
    }
  );
}

trackOnNotesBetween("flickerStream", 864, 867.9);

for (i = 864; i <= 864.75; i += 0.5) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "flickerStream",
        _duration: 0.5,
        _easing: "easeStep",
        _dissolve: [
          [1, 0],
          [0, 0.5],
          [1, 0]
        ]
      }
    }
  );
}

for (i = 865.5; i <= 866.25; i += 0.5) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "flickerStream",
        _duration: 0.5,
        _easing: "easeStep",
        _dissolve: [
          [1, 0],
          [0, 0.5],
          [1, 0]
        ]
      }
    }
  );
}

for (i = 867; i <= 868; i += 0.5) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "flickerStream",
        _duration: 0.5,
        _easing: "easeStep",
        _dissolve: [
          [1, 0],
          [0, 0.5],
          [1, 0]
        ]
      }
    }
  );
}

// note go brrr

trackOnNotesBetween("epilepsy", 276, 308);

for (i = 276; i <= 307.5; i += 0.25) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "epilepsy",
        _easing: "easeStep",
        _duration: 0.25,
        _dissolveArrow: [[0, 0]],
        _dissolve: [[0, 0]],
      },
    },
    {
      _time: i + 0.125,
      _type: "AnimateTrack",
      _data: {
        _track: "epilepsy",
        _easing: "easeStep",
        _duration: 0.25,
        _dissolveArrow: [[1, 0]],
        _dissolve: [[1, 0]],
      },
    }
  );
}

trackOnNotesBetween("epilepsy", 868, 896);

for (i = 868; i <= 895.75; i += 0.25) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "epilepsy",
        _easing: "easeStep",
        _duration: 0.25,
        _dissolveArrow: [[0, 0]],
        _dissolve: [[0, 0]],
      },
    },
    {
      _time: i + 0.125,
      _type: "AnimateTrack",
      _data: {
        _track: "epilepsy",
        _easing: "easeStep",
        _duration: 0.25,
        _dissolveArrow: [[1, 0]],
        _dissolve: [[1, 0]],
      },
    }
  );
}

// t h i c c

trackOnNotesBetween("thic", 325, 328);
trackOnNotesBetween("thic", 341, 344.9);
trackOnNotesBetween("thic", 357, 361.9);
trackOnNotesBetween("thic", 373, 375.9);

_pointDefinitions.push({
  _name: "boing",
  _points: [
    [1.25, 0.85, 0.85, 0, "easeInOutBack"],
    [0.85, 1.25, 0.85, 0.25, "easeInOutBack"],
    [1.25, 0.85, 0.85, 0.5, "easeInOutBack"],
    [0.85, 1.5, 0.85, 0.75, "easeInOutBack"],
    [1, 1, 1, 1, "easeInOutBack"],
  ],
});

_customEvents.push(
  {
    _time: 325,
    _type: "AnimateTrack",
    _data: {
      _track: "thic",
      _duration: 2,
      _scale: "boing",
    },
  },
  {
    _time: 327,
    _type: "AnimateTrack",
    _data: {
      _track: "thic",
      _duration: 2,
      _scale: "boing",
    },
  },
  {
    _time: 341,
    _type: "AnimateTrack",
    _data: {
      _track: "thic",
      _duration: 2,
      _scale: "boing",
    },
  },
  {
    _time: 343,
    _type: "AnimateTrack",
    _data: {
      _track: "thic",
      _duration: 2,
      _scale: "boing",
    },
  },
  {
    _time: 357,
    _type: "AnimateTrack",
    _data: {
      _track: "thic",
      _duration: 2,
      _scale: "boing",
    },
  },
  {
    _time: 359,
    _type: "AnimateTrack",
    _data: {
      _track: "thic",
      _duration: 2,
      _scale: "boing",
    },
  },
  {
    _time: 373,
    _type: "AnimateTrack",
    _data: {
      _track: "thic",
      _duration: 2,
      _scale: "boing",
    },
  },
  {
    _time: 375,
    _type: "AnimateTrack",
    _data: {
      _track: "thic",
      _duration: 2,
      _scale: "boing",
    },
  }
);

// swing

_customEvents.push({
  _time: 328,
  _type: "AssignTrackParent",
  _data: {
    _childrenTracks: ["playerTrack", "swingTrack"],
    _parentTrack: "swingParent",
  },
});

trackOnNotesBetween("swingTrack", 329, 335.9);
arrowBloq(329, 335.9, "swingArrow");

for (i = 326; i <= 335; i += 2) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "swingParent",
        _duration: 2,
        _position: [
          [0, 0, 0, 0],
          [0, 0.25, 0, 0.25, "easeOutQuad"],
          [0, 0, 0, 0.5],
          [0, -0.25, 0, 0.75, "easeOutQuad"],
          [0, 0, 0, 1],
        ],
      },
    },
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "swingTrack",
        _duration: 2,
        _dissolveArrow: [[0, 0]],
        _rotation: [
          [0, 0, 0, 0],
          [-2.5, -2.5, 2.5, 0.25, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 0.5, "splineCatmullRom"],
          [-2.5, 2.5, -2.5, 0.75, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 1, "splineCatmullRom"],
        ],
      },
    },
    {
      _time: i + 0.1,
      _type: "AnimateTrack",
      _data: {
        _track: "swingArrow",
        _duration: 2,
        _rotation: [
          [0, 0, 0, 0],
          [-2.5, -2.5, 2.5, 0.25, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 0.5, "splineCatmullRom"],
          [-2.5, 2.5, -2.5, 0.75, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 1, "splineCatmullRom"],
        ],
      },
    }
  );
}

trackOnNotesBetween("swingTrack", 345, 354);
arrowBloq(345, 354, "swingArrow");

for (i = 342; i <= 354; i += 2) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "swingParent",
        _duration: 2,
        _position: [
          [0, 0, 0, 0],
          [0, 0.25, 0, 0.25, "easeOutQuad"],
          [0, 0, 0, 0.5],
          [0, -0.25, 0, 0.75, "easeOutQuad"],
          [0, 0, 0, 1],
        ],
      },
    },
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "swingTrack",
        _duration: 2,
        _dissolveArrow: [[0, 0]],
        _rotation: [
          [0, 0, 0, 0],
          [-2.5, -2.5, 2.5, 0.25, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 0.5, "splineCatmullRom"],
          [-2.5, 2.5, -2.5, 0.75, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 1, "splineCatmullRom"],
        ],
      },
    },
    {
      _time: i + 0.1,
      _type: "AnimateTrack",
      _data: {
        _track: "swingArrow",
        _duration: 2,
        _rotation: [
          [0, 0, 0, 0],
          [-2.5, -2.5, 2.5, 0.25, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 0.5, "splineCatmullRom"],
          [-2.5, 2.5, -2.5, 0.75, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 1, "splineCatmullRom"],
        ],
      },
    }
  );
}

trackOnNotesBetween("swingTrack", 362, 367.9);
arrowBloq(362, 367.9, "swingArrow");

for (i = 359; i <= 367; i += 2) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "swingParent",
        _duration: 2,
        _position: [
          [0, 0, 0, 0],
          [0, 0.25, 0, 0.25, "easeOutQuad"],
          [0, 0, 0, 0.5],
          [0, -0.25, 0, 0.75, "easeOutQuad"],
          [0, 0, 0, 1],
        ],
      },
    },
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "swingTrack",
        _duration: 2,
        _dissolveArrow: [[0, 0]],
        _rotation: [
          [0, 0, 0, 0],
          [-2.5, -2.5, 2.5, 0.25, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 0.5, "splineCatmullRom"],
          [-2.5, 2.5, -2.5, 0.75, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 1, "splineCatmullRom"],
        ],
      },
    },
    {
      _time: i + 0.1,
      _type: "AnimateTrack",
      _data: {
        _track: "swingArrow",
        _duration: 2,
        _rotation: [
          [0, 0, 0, 0],
          [-2.5, -2.5, 2.5, 0.25, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 0.5, "splineCatmullRom"],
          [-2.5, 2.5, -2.5, 0.75, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 1, "splineCatmullRom"],
        ],
      },
    }
  );
}

trackOnNotesBetween("swingTrack", 376, 384);
arrowBloq(376, 384, "swingArrow");

for (i = 373; i <= 384; i += 2) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "swingParent",
        _duration: 2,
        _position: [
          [0, 0, 0, 0],
          [0, 0.25, 0, 0.25, "easeOutQuad"],
          [0, 0, 0, 0.5],
          [0, -0.25, 0, 0.75, "easeOutQuad"],
          [0, 0, 0, 1],
        ],
      },
    },
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "swingTrack",
        _duration: 2,
        _dissolveArrow: [[0, 0]],
        _rotation: [
          [0, 0, 0, 0],
          [-2.5, -2.5, 2.5, 0.25, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 0.5, "splineCatmullRom"],
          [-2.5, 2.5, -2.5, 0.75, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 1, "splineCatmullRom"],
        ],
      },
    },
    {
      _time: i + 0.1,
      _type: "AnimateTrack",
      _data: {
        _track: "swingArrow",
        _duration: 2,
        _rotation: [
          [0, 0, 0, 0],
          [-2.5, -2.5, 2.5, 0.25, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 0.5, "splineCatmullRom"],
          [-2.5, 2.5, -2.5, 0.75, "splineCatmullRom", "easeOutQuad"],
          [0, 0, 0, 1, "splineCatmullRom"],
        ],
      },
    }
  );
}

// brrr rotat on zZZZZ

trackOnNotesBetween("brrr", 391, 452);

for (i = 391; i <= 430; i += 8) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "brrr",
      _duration: 8,
      _rotation: [
        [0, 0, 22.5, 0],
        [0, 0, -22.5, 0.5, "easeInOutCubic"],
        [0, 0, 22.5, 1, "easeInOutCubic"],
      ],
    },
  });
}
_customEvents.push({
  _time: 431,
  _type: "AnimateTrack",
  _data: {
    _track: "brrr",
    _duration: 4,
    _rotation: [
      [0, 0, 22.5, 0, "easeInOutCubic"],
      [0, 0, 0, 1, "easeInOutCubic"],
    ],
  },
});
for (i = 391; i <= 400; i += 0.25) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "brrr",
      _duration: 0.25,
      _dissolve: [
        [1, 0],
        [0, 0.5, "easeStep"],
        [1, 1, "easeStep"],
      ],
      _dissolveArrow: [
        [0, 0],
        [1, 0.5, "easeStep"],
        [0, 1, "easeStep"],
      ],
    },
  });
}
for (i = 407; i <= 420; i += 0.25) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "brrr",
      _duration: 0.25,
      _dissolve: [
        [1, 0],
        [0, 0.5, "easeStep"],
        [1, 1, "easeStep"],
      ],
      _dissolveArrow: [
        [0, 0],
        [1, 0.5, "easeStep"],
        [0, 1, "easeStep"],
      ],
    },
  });
}
for (i = 423; i <= 432; i += 0.25) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "brrr",
      _duration: 0.25,
      _dissolve: [
        [1, 0],
        [0, 0.5, "easeStep"],
        [1, 1, "easeStep"],
      ],
      _dissolveArrow: [
        [0, 0],
        [1, 0.5, "easeStep"],
        [0, 1, "easeStep"],
      ],
    },
  });
}
for (i = 437; i <= 448; i += 0.25) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "brrr",
      _duration: 0.25,
      _dissolve: [
        [1, 0],
        [0, 0.5, "easeStep"],
        [1, 1, "easeStep"],
      ],
      _dissolveArrow: [
        [0, 0],
        [1, 0.5, "easeStep"],
        [0, 1, "easeStep"],
      ],
    },
  });
}
_customEvents.push({
  _time: 448,
  _type: "AnimateTrack",
  _data: {
    _track: "brrr",
    _duration: 0.25,
    _dissolve: [[1, 0]],
    _dissolveArrow: [[1, 0]],
  },
});

// assemble notes

sideCreate(453, 504, "disolv", "assL", "assR");

_customEvents.push(
  {
    _time: 450,
    _type: "AssignPathAnimation",
    _data: {
      _duration: 1,
      _track: "assL",
      _scale: [
        [0.5, 0.5, 0.5, 0],
        [0.5, 0.5, 0.5, 0.15],
        [1, 1, 1, 0.3],
      ],
      _dissolveArrow: [[0, 0]],
      _position: [
        [0, 0, 0, 0.15],
        [6, 0, 0, 0.3, "easeInCubic"],
      ],
      _localRotation: [
        [0, 0, 0, 0.1],
        [0, 0, 90, 0.2, "easeInBack"],
        [0, 0, 180, 0.3, "easeOutBack"],
      ],
    },
  },
  {
    _time: 450,
    _type: "AssignPathAnimation",
    _data: {
      _duration: 1,
      _track: "assR",
      _scale: [
        [0.5, 0.5, 0.5, 0],
        [0.5, 0.5, 0.5, 0.15],
        [1, 1, 1, 0.3],
      ],
      _dissolveArrow: [[0, 0]],
      _position: [
        [0, 0, 0, 0.15],
        [-6, 0, 0, 0.3, "easeInCubic"],
      ],
      _localRotation: [
        [0, 0, 0, 0.1],
        [0, 0, -90, 0.2, "easeInBack"],
        [0, 0, -180, 0.3, "easeOutBack"],
      ],
    },
  },
  {
    _time: 450,
    _type: "AnimateTrack",
    _data: {
      _duration: 1,
      _track: "disolv",
      _dissolve: [[0, 0]],
    },
  }
);

// circle

trackOnNotesBetween("lmao", 516, 545);

for (i = 516; i <= 545; i += 2) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "lmao",
      _duration: 2,
      _dissolve: [
        [1, 0],
        [0.1, 0.5],
        [1, 1]
      ]
    }
  });
}

// fuyny

trackOnNotesBetween("pulseFunction", 546, 576)
pulseOnNote(546, 576, 1.5)

// Flickering curve drop
 


trackOnNotesBetween("brrrR", 580, 627.5);

_customEvents.push({
  _time: 570,
  _type: "AssignPathAnimation",
  _data: {
    _track: "brrrR",
    _duration: 10,
    _position: [
      [-15, 0, 0, 0],
      [1, 0, 0, 0.15, "splineCatmullRom"],
      [0, 0, 0, 0.2, "splineCatmullRom"],
    ],
    _localRotation: [
      [0, -20, 0, 0],
      [0, 20, 0, 0.15],
      [0, 0, 0, 0.2],
    ]
  }
});

_customEvents.push({
  _time: 608,
  _type: "AssignPathAnimation",
  _data: {
    _track: "brrrR",
    _duration: 1,
    _position: [
      [0, 0, 0, 0],
    ]
  }
});

for (i = 608; i <= 611; i += 1.5) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "brrrR",
      _duration: 1,
      _dissolve: [
        [0.25, 0],
        [1, 1],
      ],
      _scale: [
        [1.5, 0.75, 1, 0],
        [1, 1, 1, 1],
      ],
    },
  });
}

_customEvents.push({
  _time: 612,
  _type: "AssignPathAnimation",
  _data: {
    _track: "brrrR",
    _duration: 10,
    _position: [
      [15, 0, 0, 0],
      [-1, 0, 0, 0.15, "splineCatmullRom"],
      [0, 0, 0, 0.2, "splineCatmullRom"],
    ],
    _localRotation: [
      [0, 20, 0, 0],
      [0, -20, 0, 0.15],
      [0, 0, 0, 0.2],
    ]
  }
});

_customEvents.push({
  _time: 619.5,
  _type: "AnimateTrack",
  _data: {
    _track: "brrrR",
    _duration: 1.5,
    _easing: "easeInOutBack",
    _dissolve: [[1, 0]],
    _scale: [
      [1, 1, 1, 0],
      [0.5, 0.5, 0.5, 0.85],
      [1, 1, 1, 1],
    ],
  },
});



// Appear from side



trackOnNotesBetweenRBSep("appearSideR", "appearSideB", 628, 639.9)

_customEvents.push({
  _time: 620,
  _type: "AssignPathAnimation",
  _data: {
    _track: "appearSideR",
    _duration: 5,
    _position: [
      [-15, 0, 0, 0],
      [0, 0, 0, 0.25]
    ],
    _scale: [
      [1.5, 0.5, 1, 0],
      [1.5, 0.5, 1, 0.25],
      [1, 1, 1, 0.3]
    ]
  }
}, {
  _time: 620,
  _type: "AssignPathAnimation",
  _data: {
    _track: "appearSideB",
    _duration: 5,
    _position: [
      [15, 0, 0, 0],
      [0, 0, 0, 0.25]
    ],
    _scale: [
      [1.5, 0.5, 1, 0],
      [1.5, 0.5, 1, 0.25],
      [1, 1, 1, 0.3]
    ]
  }
});



// Momentum



momentumEffect(644, 708)

trackOnNotesBetween("moveToVoid", 644, 708)
_customEvents.push({
  _time: 643,
  _type: "AssignPlayerToTrack",
  _data: {
    _track: "moveToVoid"
  }
}, {
  _time: 644,
  _type: "AnimateTrack",
  _data: {
    _duration: 1,
    _easing: "easeStep",
    _track: "moveToVoid",
    _position: [
      [0, 6969, 0, 0]
    ]
  }
}, {
  _time: 708,
  _type: "AnimateTrack",
  _data: {
    _duration: 1,
    _easing: "easeStep",
    _track: "moveToVoid",
    _position: [
      [0, 0, 0, 0]
    ]
  }
});



// Appear from back



trackOnNotesBetween("crazyEffect", 708.1, 713)
trackOnNotesBetween("crazyEffect", 716, 721)
trackOnNotesBetween("crazyEffect", 724, 729)
trackOnNotesBetween("crazyEffect", 732, 735)

for (i = 708 ; i <= 713 ; i += 1.5) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "crazyEffect",
      _duration: 1,
      _dissolve: [
        [1, 0],
        [0.25, 0.05],
        [1, 0.5]
      ],
      _scale: [
        [1, 1, 1, 0],
        [1.2, 1.2, 1.2, 0.05],
        [1, 1, 1, 0.5]
      ]
    }
  });
}

for (i = 716 ; i <= 721 ; i += 1.5) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "crazyEffect",
      _duration: 1,
      _dissolve: [
        [1, 0],
        [0.25, 0.05],
        [1, 0.5]
      ],
      _scale: [
        [1, 1, 1, 0],
        [1.2, 1.2, 1.2, 0.05],
        [1, 1, 1, 0.5]
      ]
    }
  });
}

for (i = 724 ; i <= 729 ; i += 1.5) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "crazyEffect",
      _duration: 1,
      _dissolve: [
        [1, 0],
        [0.25, 0.05],
        [1, 0.5]
      ],
      _scale: [
        [1, 1, 1, 0],
        [1.2, 1.2, 1.2, 0.05],
        [1, 1, 1, 0.5]
      ]
    }
  });
}

for (i = 732 ; i <= 736 ; i += 1.5) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "crazyEffect",
      _duration: 1,
      _dissolve: [
        [1, 0],
        [0.25, 0.05],
        [1, 0.5]
      ],
      _scale: [
        [1, 1, 1, 0],
        [1.2, 1.2, 1.2, 0.05],
        [1, 1, 1, 0.5]
      ]
    }
  });
}



// Dissolve thing

trackOnNotesBetween("intro", 740, 750);

for (i = 740; i <= 750; i += 10) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 1.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 4,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 5.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 8,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 9.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    }
  );
}

trackOnNotesBetween("intro", 756, 787);

for (i = 756; i <= 788; i += 16) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 1.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 4,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 5.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 8,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 9.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    }
  );
}
trackOnNotesBetween("intro", 900, 914);

for (i = 900; i <= 914; i += 16) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 1.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 4,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 5.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 8,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    },
    {
      _time: i + 9.5,
      _type: "AnimateTrack",
      _data: {
        _track: "intro",
        _duration: 1.5,
        _dissolve: "kickDis",
        _position: "kickPos",
        _scale: "kickScale",
      }
    }
  );
}

// buildup

trackOnNotesBetween("buildup", 772, 787)

for (i = 772 ; i <= 786 ; i += 4) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "buildup",
      _duration: 4,
      _scale: [
        [1, 1, 1, 0],
        [2, 2, 2, 0.1],
        [1, 1, 1, 1]
      ],
      _dissolve: [
        [1, 0],
        [0.5, 0.1],
        [1, 1],
      ]
    }
  })
}

// brrr

trackOnNotesBetween("noteGoBRRRtoSide", 788, 795.7);

for (i = 788; i <= 795.9; i += 2) {
  _customEvents.push(
    {
      _time: i,
      _type: "AnimateTrack",
      _data: {
        _track: "noteGoBRRRtoSide",
        _duration: 1,
        _position: [
          [0, 0, 0, 0],
          [0.45, 0, 0, 0.15, "easeOutBack"],
          [0.5, 0, 0, 0.75],
        ],
      },
    },
    {
      _time: i + 0.75,
      _type: "AnimateTrack",
      _data: {
        _track: "noteGoBRRRtoSide",
        _duration: 1,
        _position: [
          [0.5, 0, 0, 0],
          [0, 0, 0, 0.15, "easeOutBack"],
          [-0.05, 0, 0, 0.75],
        ],
      },
    },
    {
      _time: i + 1.25,
      _type: "AnimateTrack",
      _data: {
        _track: "noteGoBRRRtoSide",
        _duration: 1,
        _position: [
          [-0.05, 0, 0, 0],
          [-0.45, 0, 0, 0.15, "easeOutBack"],
          [-0.5, 0, 0, 0.75],
        ],
      },
    },
    {
      _time: i + 1.5,
      _type: "AnimateTrack",
      _data: {
        _track: "noteGoBRRRtoSide",
        _duration: 1,
        _position: [
          [-0.5, 0, 0, 0],
          [0, 0, 0, 0.15, "easeOutBack"],
          [0.05, 0, 0, 0.75],
        ],
      },
    }
  );
}

trackOnNotesBetween("introStrem", 796, 800);
_customEvents.push({
  _time: 796,
  _type: "AnimateTrack",
  _data: {
    _track: "introStrem",
    _duration: 4,
    _dissolveArrow: [
      [1, 0],
      [0, 1]
    ]
  },
});

// weird rotat efectr

trackOnNotesBetween("Trac", 804, 835);

_customEvents.push({
  _time: 803,
  _type: "AnimateTrack",
  _data: {
    _track: "Trac",
    _duration: 0.5,
    _position: [
      [0, 0, 0, 0],
      [-0.5, 0, 0, 1, "easeInQuad"]
    ],
    _localRotation: [
      [0, 0, 0, 0],
      [0, 0, 10, 1, "easeInBack"]
    ]
  }
});

for (i = 803.5 ; i <= 815 ; i += 2) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "Trac",
      _duration: 1,
      _position: [
        [-0.5, 0, 0, 0],
        [0, -0.5, 0, 0.5, "easeInCubic", "splineCatmullRom"],
        [0.5, 0, 0, 1, "easeOutCubic", "splineCatmullRom"]
      ],
      _localRotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1, "easeInOutCubic"]
      ]
    }
  }, {
    _time: i + 1,
    _type: "AnimateTrack",
    _data: {
      _track: "Trac",
      _duration: 1,
      _position: [
        [0.5, 0, 0, 0],
        [0, -0.5, 0, 0.5, "easeInCubic", "splineCatmullRom"],
        [-0.5, 0, 0, 1, "easeOutCubic", "splineCatmullRom"]
      ],
      _localRotation: [
        [0, 0, -10, 0],
        [0, 0, 10, 1, "easeInOutCubic"]
      ]
    }
  });
}
_customEvents.push({
  _time: 815.5,
  _type: "AnimateTrack",
  _data: {
    _track: "Trac",
    _duration: 0.5,
    _position: [
      [-0.5, 0, 0, 0],
      [0, 0, 0, 1, "easeInQuad"]
    ],
    _localRotation: [
      [0, 0, 10, 0],
      [0, 0, 0, 1, "easeInBack"]
    ]
  }
});
for (i = 819.5 ; i <= 831 ; i += 2) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "Trac",
      _duration: 1,
      _position: [
        [-0.5, 0, 0, 0],
        [0, -0.5, 0, 0.5, "easeInCubic", "splineCatmullRom"],
        [0.5, 0, 0, 1, "easeOutCubic", "splineCatmullRom"]
      ],
      _localRotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1, "easeInOutCubic"]
      ]
    }
  }, {
    _time: i + 1,
    _type: "AnimateTrack",
    _data: {
      _track: "Trac",
      _duration: 0.75,
      _position: [
        [0.5, 0, 0, 0],
        [0, -0.75, 0, 0.5, "easeInCubic", "splineCatmullRom"],
        [-0.5, 0, 0, 1, "easeOutCubic", "splineCatmullRom"]
      ],
      _localRotation: [
        [0, 0, -10, 0],
        [0, 0, 10, 1, "easeInOutCubic"]
      ]
    }
  });
}
_customEvents.push({
  _time: 831.5,
  _type: "AnimateTrack",
  _data: {
    _track: "Trac",
    _duration: 0.5,
    _position: [
      [-0.5, 0, 0, 0],
      [0, 0, 0, 1, "easeInQuad"]
    ],
    _localRotation: [
      [0, 0, 10, 0],
      [0, 0, 0, 1, "easeInBack"]
    ]
  }
});


// bruuuuuuuuh



trackOnNotesBetween("bruhEffecc", 836, 847.9);
trackOnNotesBetween("bruhEffecc", 852, 858);

for (i = 836 ; i <= 841.5 ; i += 0.5) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "bruhEffecc",
      _duration: 0.5,
      _dissolve: [
        [0.1, 0],
        [1, 1, "easeStep"],
      ],
    }
  });
}

for (i = 844 ; i <= 847 ; i += 0.5) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "bruhEffecc",
      _duration: 0.5,
      _dissolve: [
        [0.1, 0],
        [1, 1, "easeStep"],
      ],
    }
  });
}

for (i = 852 ; i <= 858 ; i += 0.5) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "bruhEffecc",
      _duration: 0.5,
      _dissolve: [
        [0.1, 0],
        [1, 1, "easeStep"],
      ],
    }
  });
}



// Vibration Strim

trackOnNotesBetween("vibStream", 860, 863);

for (i = 860; i <= 862; i++) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "vibStream",
      _easing: "easeStep",
      _duration: 1,
      _position: [
        [0, 0, 0, 0],
        [0.1, 0, 0, 0.25],
        [0, 0, 0, 0.5],
        [-0.1, 0, 0, 0.75],
        [0, 0, 0, 1]
      ]
    }
  });
}

// Vibrate glitch

trackOnNotesBetween("endGlitch", 916, 916);

_customEvents.push({
  _time: 914.5,
  _type: "AnimateTrack",
  _data: {
    _track: "endGlitch",
    _duration: 1.5,
    _dissolve: [
      [1, 0],
      [0.5, 0.25, "easeStep"],
      [1, 0.5, "easeStep"],
      [0.5, 0.75, "easeStep"],
      [1, 1, "easeStep"]
    ],
    _position: [
      [0.5, 0, 0, 0],
      [-0.5, 0, 0, 0.125, "easeInElastic"],
      [0, -1, -1, 0.25, "easeInElastic", "splineCatmullRom"],
      [0.25, 0, 0, 0.375, "easeInElastic", "splineCatmullRom"],
      [0, 0, 0, 0.5, "easeInElastic"],
      [0.5, 0, 0, 0.625],
      [-0.5, 0, 0, 0.75, "easeInElastic"],
      [0, -1, -1, 0.875, "easeInElastic", "splineCatmullRom"],
      [0, 0, 0, 1, "easeInElastic"]
    ],
    _scale: [
      [1, 0.5, 1, 0],
      [2, 0.75, 1, 0.25, "easeInBounce"],
      [0.5, 2.5, 1, 0.5, "easeInBounce"],
      [2.5, 0.1, 5, 0.75, "easeInBounce"],
      [1.5, 0.25, 1, 1, "easeInBounce"]
    ]
  }
});


//#endregion                     -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  STOP  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -

//#region write file
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
