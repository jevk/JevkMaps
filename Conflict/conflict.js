
const fs = require("fs");

const INPUT = "ExpertPlusStandard.dat";
const OUTPUT ="ExpertPlusLawless_old.dat";

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

function arrowSpin(Start, End, R, G, B, Scale) {

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

function rotateOnNote(Start, End, Multiplier) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    let n1 = JSON.parse(JSON.stringify(note));
    _customEvents.push({
      _time: n1._time,
      _type: "AnimateTrack",
      _data: {
        _track: "pulseFunction",
        _duration: 2,
        _localRotation: [
          [0, 0, 0, 0],
          [Multiplier, Multiplier, Multiplier, 0.025],
          [Multiplier * -1, Multiplier * -1, Multiplier * -1, 0.75, "easeOutQuad"],
          [0, 0, 0, 1]
        ]
      }
    });
  });
}

function appearFromSides(Start, End) {
  let filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    if (note._lineIndex == 0 || note._lineIndex == 1) {
      note._customData._track = "leftTrack";
      note._customData._disableSpawnEffect = true;
      note._customData._noteJumpStartBeatOffset = 1;
    }
    if (note._lineIndex == 2 || note._lineIndex == 3) {
      note._customData._track = "rightTrack";
      note._customData._disableSpawnEffect = true;
      note._customData._noteJumpStartBeatOffset = 1;
    }
    _customEvents.push({
      _time: Start - 4,
      _type: "AssignPathAnimation",
      _data: {
        _track: "leftTrack",
        _duration: 6,
        _position: [
          [-10, 0, 0, 0],
          [0, 0, 0, 0.45, "easeOutCubic"]
        ]
      }
    }, {
      _time: Start - 4,
      _type: "AssignPathAnimation",
      _data: {
        _track: "rightTrack",
        _duration: 6,
        _position: [
          [10, 0, 0, 0],
          [0, 0, 0, 0.45, "easeOutCubic"]
        ]
      }
    });
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

function randPath(Start, End, AssignTrack) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    if (!note._customData._animation) note._customData._animation = {};
    randPosX1 = getRndInteger(-10, 10);
    randPosX2 = getRndInteger(-10, 10);

    note._customData._track = AssignTrack;
    note._customData._animation._position = [
      [randPosX1, 10, 0, 0],
      [randPosX2, 5, 0, 0.25, "splineCatmullRom"],
      [0, 0, 0, 0.47, "splineCatmullRom", "easeOutCubic"]
    ];
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


_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "envTrack",
    _duration: 0.01,
    _position: [
      [0, -100, -100, 0, "easeStep"]
    ]
  }
},{
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "smokeTrack",
    _duration: 0.01,
    _position: [
      [0, -100, -100, 0, "easeStep"]
    ]
  }
});


_customEvents.push({
  _time: 0,
  _type: "AssignTrackParent",
  _data: {
    _parentTrack: "bounce",
    _childrenTracks: ["chorusNote", "leftTrack", "rightTrack", "arrowCircleTrackParent"]
  }
});

for (i = 4 ; i <= 131 ; i++) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "bounce",
      _duration: 1,
      _position: [
        [0, -0.15, 0, 0],
        [0, 0.15, 0, 0.5, "easeOutSine"],
        [0, 0, 0, 1, "easeInSine"]
      ]
    }
  }, {
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "leftPanelTrack",
      _duration: 1,
      _localPosition: [
        [-3, 1, 10, 0],
        [-3, 1.4, 10, 0.5, "easeOutSine"],
        [-3, 1, 10, 1, "easeInSine"]
      ]
    }
  }, {
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "rightPanelTrack",
      _duration: 1,
      _localPosition: [
        [3, 1, 10, 0],
        [3, 1.4, 10, 0.5, "easeOutSine"],
        [3, 1, 10, 1, "easeInSine"]
      ]
    }
  });
}
for (i = 253 ; i <= 328 ; i++) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "bounce",
      _duration: 1,
      _position: [
        [0, -0.15, 0, 0],
        [0, 0.15, 0, 0.5, "easeOutSine"],
        [0, 0, 0, 1, "easeInSine"]
      ]
    }
  }, {
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "leftPanelTrack",
      _duration: 1,
      _localPosition: [
        [-3, 1, 10, 0],
        [-3, 1.4, 10, 0.5, "easeOutSine"],
        [-3, 1, 10, 1, "easeInSine"]
      ]
    }
  }, {
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "rightPanelTrack",
      _duration: 1,
      _localPosition: [
        [3, 1, 10, 0],
        [3, 1.4, 10, 0.5, "easeOutSine"],
        [3, 1, 10, 1, "easeInSine"]
      ]
    }
  });
}


trackOnNotesBetween("intro", 4, 35.5)
sepHitbox(4, 35.5, "hitboxTrack")

for (i = 4 ; i <= 35 ; i++) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "intro",
      _duration: 0.25,
      _rotation: [
        [0, 0, 0, 0],
        [2.5, -2.5, 0.5, "splineCatmullRom"],
        [5, 0, 0, 1, "splineCatmullRom"]
      ],
    }
  }, {
    _time: i+0.25,
    _type: "AnimateTrack",
    _data: {
      _track: "intro",
      _duration: 0.25,
      _rotation: [  
        [5, 0, 0, 0],
        [2.5, 2.5, 0, 0.5, "splineCatmullRom"],
        [0, 0, 0, 1, "splineCatmullRom"]
      ]
    }
  });
}



// Chorus


_customEvents.push({
  _time: 36,
  _type: "AnimateTrack",
  _data: {
    _track: "envTrack",
    _duration: 0.01,
    _position: [
      [0, 0, 25, 0, "easeStep"]
    ]
  }
},{
  _time: 36,
  _type: "AnimateTrack",
  _data: {
    _track: "smokeTrack",
    _duration: 0.01,
    _position: [
      [0, 0, 25, 0, "easeStep"]
    ]
  }
});

trackOnNotesBetween("chorusNote", 36, 63.9)
trackOnNotesBetween("chorusNote", 68, 99.9)

_customEvents.push({
  _time: 0,
  _type: "AssignTrackParent",
  _data:{
    _parentTrack:"arrowCircleTrackParent",
    _childrenTracks:["arrowCircleTrack"]
  }
}, {
  _time: 25,
  _type: "AnimateTrack",
  _data:{
    _duration:1,
    _track:"arrowCircleTrackParent",
    _position:[
      [0,0,25,0]
    ]
  }
}, {
  _time: 30,
  _type: "AnimateTrack",
  _data:{
    _duration:2,
    _track:"arrowCircleTrack",
    _dissolve:[
      [0,0]
    ]
  }
}, {
  _time: 36,
  _type: "AnimateTrack",
  _data:{
    _duration:4,
    _track:"arrowCircleTrack",
    _dissolve:[
      [0,0],
      [1,1]
    ]
  }
});


_customEvents.push({
  _time: 63,
  _type: "AnimateTrack",
  _data:{
    _duration:1,
    _track:"arrowCircleTrack",
    _dissolve:[
      [1,0],
      [0,0.75]
    ]
  }
});
_customEvents.push({
  _time: 68,
  _type: "AnimateTrack",
  _data:{
    _duration:4,
    _track:"arrowCircleTrack",
    _dissolve:[
      [0,0],
      [1,1]
    ]
  }
});

_customEvents.push({
  _time: 100,
  _type: "AnimateTrack",
  _data:{
    _duration:5,
    _track:"arrowCircleTrack",
    _dissolve:[[1,0],[0,1]]
  }
});
for (i = 36 ; i <= 100 ; i++) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 0.5,
      _scale: [
        [0.05, 1, 0.05, 0],
        [0.15, 1, 0.15, 0.05],
        [0.05, 1, 0.05, 1]
      ]
    }
  });
}
for (i = 36 ; i <= 63.9 ; i += 32) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "envTrack",
      _duration: 8,
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 10, 1, "easeOutSine"]
      ]
    }
  }, {
    _time: i + 8,
    _type: "AnimateTrack",
    _data: {
      _track: "envTrack",
      _duration: 16,
      _easing: "easeInOutSine",
      _rotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1]
      ]
    }
  }, {
    _time: i + 24,
    _type: "AnimateTrack",
    _data: {
      _track: "envTrack",
      _duration: 8,
      _rotation: [
        [0, 0, -10, 0],
        [0, 0, 0, 1]
      ]
    }
  }, {
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 8,
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 10, 1, "easeOutSine"]
      ]
    }
  }, {
    _time: i + 8,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 16,
      _easing: "easeInOutSine",
      _rotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1]
      ]
    }
  }, {
    _time: i + 24,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 8,
      _rotation: [
        [0, 0, -10, 0],
        [0, 0, 0, 1]
      ]
    }
  });
}
for (i = 36 ; i <= 63.9 ; i += 32) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "chorusNote",
      _duration: 8,
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 10, 1, "easeOutSine"]
      ]
    }
  }, {
    _time: i + 8,
    _type: "AnimateTrack",
    _data: {
      _track: "chorusNote",
      _duration: 16,
      _easing: "easeInOutSine",
      _rotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1]
      ]
    }
  }, {
    _time: i + 24,
    _type: "AnimateTrack",
    _data: {
      _track: "chorusNote",
      _duration: 8,
      _rotation: [
        [0, 0, -10, 0],
        [0, 0, 0, 1]
      ]
    }
  });
}


for (i = 64 ; i <= 67.9 ; i += 2) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "leftPanelTrack",
      _duration: 1,
      _scale: [
        [1, 1, 1, 0],
        [1.5, 2, 0, 0.25, "easeInOutCirc"],
        [1.5, 2, 0, 0.75],
        [1, 1, 1, 1, "easeInCirc"]
      ],
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 25, 0.25, "easeInOutCirc"],
        [0, 0, 25, 0.75],
        [0, 0, 0, 1, "easeInCirc"]
      ]
    }
  }, {
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "rightPanelTrack",
      _duration: 1,
      _scale: [
        [1, 1, 1, 0],
        [1.5, 2, 0, 0.25, "easeInOutCirc"],
        [1.5, 2, 0, 0.75],
        [1, 1, 1, 1, "easeInCirc"]
      ],
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, -25, 0.25, "easeInOutCirc"],
        [0, 0, -25, 0.75],
        [0, 0, 0, 1, "easeInCirc"]
      ]
    }
  }, {
    _time: i + 1,
    _type: "AnimateTrack",
    _data: {
      _track: "leftPanelTrack",
      _duration: 1,
      _scale: [
        [1, 1, 1, 0],
        [1.5, 2, 0, 0.25, "easeInOutCirc"],
        [1.5, 2, 0, 0.75],
        [1, 1, 1, 1, "easeInCirc"]
      ],
      _localRotation: [
        [0, 0, 0, 0],
        [0, 0, -25, 0.25, "easeInOutCirc"],
        [0, 0, -25, 0.75],
        [0, 0, 0, 1, "easeInCirc"]
      ]
    }
  }, {
    _time: i + 1,
    _type: "AnimateTrack",
    _data: {
      _track: "rightPanelTrack",
      _duration: 1,
      _scale: [
        [1, 1, 1, 0],
        [1.5, 2, 0, 0.25, "easeInOutCirc"],
        [1.5, 2, 0, 0.75],
        [1, 1, 1, 1, "easeInCirc"]
      ],
      _localRotation: [
        [0, 0, 0, 0],
        [0, 0, 25, 0.25, "easeInOutCirc"],
        [0, 0, 25, 0.75],
        [0, 0, 0, 1, "easeInCirc"]
      ]
    }
  });
}


for (i = 68 ; i <= 99.9 ; i += 32) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "envTrack",
      _duration: 8,
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 10, 1, "easeOutSine"]
      ]
    }
  }, {
    _time: i + 8,
    _type: "AnimateTrack",
    _data: {
      _track: "envTrack",
      _duration: 16,
      _easing: "easeInOutSine",
      _rotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1]
      ]
    }
  }, {
    _time: i + 24,
    _type: "AnimateTrack",
    _data: {
      _track: "envTrack",
      _duration: 8,
      _rotation: [
        [0, 0, -10, 0],
        [0, 0, 0, 1]
      ]
    }
  }, {
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 8,
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 10, 1, "easeOutSine"]
      ]
    }
  }, {
    _time: i + 8,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 16,
      _easing: "easeInOutSine",
      _rotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1]
      ]
    }
  }, {
    _time: i + 24,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 8,
      _rotation: [
        [0, 0, -10, 0],
        [0, 0, 0, 1]
      ]
    }
  });
}
for (i = 68 ; i <= 99.9 ; i += 32) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "chorusNote",
      _duration: 8,
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 10, 1, "easeOutSine"]
      ]
    }
  }, {
    _time: i + 8,
    _type: "AnimateTrack",
    _data: {
      _track: "chorusNote",
      _duration: 16,
      _easing: "easeInOutSine",
      _rotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1]
      ]
    }
  }, {
    _time: i + 24,
    _type: "AnimateTrack",
    _data: {
      _track: "chorusNote",
      _duration: 8,
      _rotation: [
        [0, 0, -10, 0],
        [0, 0, 0, 1]
      ]
    }
  });
}


_customEvents.push({
  _time: 100,
  _type: "AnimateTrack",
  _data: {
    _track: "envTrack",
    _duration: 0.01,
    _position: [
      [0, -100, -100, 0, "easeStep"]
    ]
  }
},{
  _time: 100,
  _type: "AnimateTrack",
  _data: {
    _track: "smokeTrack",
    _duration: 0.01,
    _position: [
      [0, -100, -100, 0, "easeStep"]
    ]
  }
});

// appear sides


appearFromSides(100, 131.9)


// Chorus 2

_customEvents.push({
  _time: 253,
  _type: "AnimateTrack",
  _data: {
    _track: "envTrack",
    _duration: 0.01,
    _position: [
      [0, 0, 25, 0, "easeStep"]
    ]
  }
},{
  _time: 253,
  _type: "AnimateTrack",
  _data: {
    _track: "smokeTrack",
    _duration: 0.01,
    _position: [
      [0, 0, 25, 0, "easeStep"]
    ]
  }
});
_customEvents.push({
  _time: 253,
  _type: "AnimateTrack",
  _data:{
    _duration:4,
    _track:"arrowCircleTrack",
    _dissolve:[
      [0,0],
      [1,1]
    ]
  }
});

trackOnNotesBetween("chorusNote", 253, 280.9)
trackOnNotesBetween("chorusNote", 285, 316.9)
trackOnNotesBetween("bounce", 317,324.9 )

for (i = 253 ; i <= 317 ; i++) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 0.5,
      _scale: [
        [0.05, 1, 0.05, 0],
        [0.15, 1, 0.15, 0.05],
        [0.05, 1, 0.05, 1]
      ]
    }
  });
}
for (i = 253 ; i <= 280.9 ; i += 32) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "envTrack",
      _duration: 8,
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 10, 1, "easeOutSine"]
      ]
    }
  }, {
    _time: i + 8,
    _type: "AnimateTrack",
    _data: {
      _track: "envTrack",
      _duration: 16,
      _easing: "easeInOutSine",
      _rotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1]
      ]
    }
  }, {
    _time: i + 24,
    _type: "AnimateTrack",
    _data: {
      _track: "envTrack",
      _duration: 8,
      _rotation: [
        [0, 0, -10, 0],
        [0, 0, 0, 1]
      ]
    }
  }, {
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 8,
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 10, 1, "easeOutSine"]
      ]
    }
  }, {
    _time: i + 8,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 16,
      _easing: "easeInOutSine",
      _rotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1]
      ]
    }
  }, {
    _time: i + 24,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 8,
      _rotation: [
        [0, 0, -10, 0],
        [0, 0, 0, 1]
      ]
    }
  });
}
for (i = 253 ; i <= 280.9 ; i += 32) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "chorusNote",
      _duration: 8,
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 10, 1, "easeOutSine"]
      ]
    }
  }, {
    _time: i + 8,
    _type: "AnimateTrack",
    _data: {
      _track: "chorusNote",
      _duration: 16,
      _easing: "easeInOutSine",
      _rotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1]
      ]
    }
  }, {
    _time: i + 24,
    _type: "AnimateTrack",
    _data: {
      _track: "chorusNote",
      _duration: 8,
      _rotation: [
        [0, 0, -10, 0],
        [0, 0, 0, 1]
      ]
    }
  });
}

_customEvents.push({
  _time: 280,
  _type: "AnimateTrack",
  _data:{
    _duration:1,
    _track:"arrowCircleTrack",
    _dissolve:[
      [1,0],
      [0,0.75]
    ]
  }
});
_customEvents.push({
  _time: 284,
  _type: "AnimateTrack",
  _data:{
    _duration:4,
    _track:"arrowCircleTrack",
    _dissolve:[
      [0,0],
      [1,1]
    ]
  }
});
for (i = 281 ; i <= 284.9 ; i += 2) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "leftPanelTrack",
      _duration: 1,
      _scale: [
        [1, 1, 1, 0],
        [1.5, 2, 0, 0.25, "easeInOutCirc"],
        [1.5, 2, 0, 0.75],
        [1, 1, 1, 1, "easeInCirc"]
      ],
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 25, 0.25, "easeInOutCirc"],
        [0, 0, 25, 0.75],
        [0, 0, 0, 1, "easeInCirc"]
      ]
    }
  }, {
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "rightPanelTrack",
      _duration: 1,
      _scale: [
        [1, 1, 1, 0],
        [1.5, 2, 0, 0.25, "easeInOutCirc"],
        [1.5, 2, 0, 0.75],
        [1, 1, 1, 1, "easeInCirc"]
      ],
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, -25, 0.25, "easeInOutCirc"],
        [0, 0, -25, 0.75],
        [0, 0, 0, 1, "easeInCirc"]
      ]
    }
  }, {
    _time: i + 1,
    _type: "AnimateTrack",
    _data: {
      _track: "leftPanelTrack",
      _duration: 1,
      _scale: [
        [1, 1, 1, 0],
        [1.5, 2, 0, 0.25, "easeInOutCirc"],
        [1.5, 2, 0, 0.75],
        [1, 1, 1, 1, "easeInCirc"]
      ],
      _localRotation: [
        [0, 0, 0, 0],
        [0, 0, -25, 0.25, "easeInOutCirc"],
        [0, 0, -25, 0.75],
        [0, 0, 0, 1, "easeInCirc"]
      ]
    }
  }, {
    _time: i + 1,
    _type: "AnimateTrack",
    _data: {
      _track: "rightPanelTrack",
      _duration: 1,
      _scale: [
        [1, 1, 1, 0],
        [1.5, 2, 0, 0.25, "easeInOutCirc"],
        [1.5, 2, 0, 0.75],
        [1, 1, 1, 1, "easeInCirc"]
      ],
      _localRotation: [
        [0, 0, 0, 0],
        [0, 0, 25, 0.25, "easeInOutCirc"],
        [0, 0, 25, 0.75],
        [0, 0, 0, 1, "easeInCirc"]
      ]
    }
  });
}

_customEvents.push({
  _time: 317,
  _type: "AnimateTrack",
  _data:{
    _duration:5,
    _track:"arrowCircleTrack",
    _dissolve:[[1,0],[0,1]]
  }
});

for (i = 285 ; i <= 316.9 ; i += 32) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "envTrack",
      _duration: 8,
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 10, 1, "easeOutSine"]
      ]
    }
  }, {
    _time: i + 8,
    _type: "AnimateTrack",
    _data: {
      _track: "envTrack",
      _duration: 16,
      _easing: "easeInOutSine",
      _rotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1]
      ]
    }
  }, {
    _time: i + 24,
    _type: "AnimateTrack",
    _data: {
      _track: "envTrack",
      _duration: 8,
      _rotation: [
        [0, 0, -10, 0],
        [0, 0, 0, 1]
      ]
    }
  }, {
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 8,
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 10, 1, "easeOutSine"]
      ]
    }
  }, {
    _time: i + 8,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 16,
      _easing: "easeInOutSine",
      _rotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1]
      ]
    }
  }, {
    _time: i + 24,
    _type: "AnimateTrack",
    _data: {
      _track: "smokeTrack",
      _duration: 8,
      _rotation: [
        [0, 0, -10, 0],
        [0, 0, 0, 1]
      ]
    }
  });
}
for (i = 285 ; i <= 316.9 ; i += 32) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "chorusNote",
      _duration: 8,
      _rotation: [
        [0, 0, 0, 0],
        [0, 0, 10, 1, "easeOutSine"]
      ]
    }
  }, {
    _time: i + 8,
    _type: "AnimateTrack",
    _data: {
      _track: "chorusNote",
      _duration: 16,
      _easing: "easeInOutSine",
      _rotation: [
        [0, 0, 10, 0],
        [0, 0, -10, 1]
      ]
    }
  }, {
    _time: i + 24,
    _type: "AnimateTrack",
    _data: {
      _track: "chorusNote",
      _duration: 8,
      _rotation: [
        [0, 0, -10, 0],
        [0, 0, 0, 1]
      ]
    }
  });
}


_customEvents.push({
  _time: 317,
  _type: "AnimateTrack",
  _data: {
    _track: "envTrack",
    _duration: 0.01,
    _position: [
      [0, -100, -100, 0, "easeStep"]
    ]
  }
},{
  _time: 317,
  _type: "AnimateTrack",
  _data: {
    _track: "smokeTrack",
    _duration: 0.01,
    _position: [
      [0, -100, -100, 0, "easeStep"]
    ]
  }
});

// curve



filterednotes = _notes.filter(n => n._time >= 132 && n._time <= 162);
filterednotes.forEach(note => {
  note._customData._track = "curveNote";
  note._customData._noteJumpStartBeatOffset = 2;
  note._customData._disableSpawnEffect = "true"   // NOTE: removing spawn effect will scuff practice mode if you try and play at a section or track with a note already spawnd that has this property set to true - you need to start playing before these spawn in
});

for (i = 131 ; i <= 160.9 ; i += 4) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "leftPanelTrack",
      _duration: 2,
      _easing: "easeInOutQuad",
      _localPosition: [
        [-3, 1, 10, 0],
        [-3.5, 0, 10, 0.5, "splineCatmullRom"],
        [-4, 1, 10, 1, "splineCatmullRom"]
      ]
    }
  }, {
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "rightPanelTrack",
      _duration: 2,
      _easing: "easeInOutQuad",
      _localPosition: [
        [3, 1, 10, 0],
        [3.5, 0, 10, 0.5, "splineCatmullRom"],
        [4, 1, 10, 1, "splineCatmullRom"]
      ]
    }
  }, {
    _time: i+2,
    _type: "AnimateTrack",
    _data: {
      _track: "leftPanelTrack",
      _duration: 2,
      _easing: "easeInOutQuad",
      _localPosition: [
        [-4, 1, 10, 0],
        [-3.5, 0, 10, 0.5, "splineCatmullRom"],
        [-3, 1, 10, 1, "splineCatmullRom"]
      ]
    }
  }, {
    _time: i+2,
    _type: "AnimateTrack",
    _data: {
      _track: "rightPanelTrack",
      _duration: 2,
      _easing: "easeInOutQuad",
      _localPosition: [
        [4, 1, 10, 0],
        [3.5, 0, 10, 0.5, "splineCatmullRom"],
        [3, 1, 10, 1, "splineCatmullRom"]
      ]
    }
  });
}

_customEvents.push({
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "curveNote",
    _duration: 8,
    _position: [
      [0.0, 0, 0, 0.00, "easeInOutSine"],
      [-1, 0, 0, 0.125, "easeInOutSine"],
      [1.0, 0, 0, 0.25, "easeInOutSine"],
      [-1, 0, 0, 0.375, "easeInOutSine"],
      [0, 0, 0.0, 0.50, "easeInOutSine"]
    ]
  }
});

trackOnNotesBetween("spin", 128, 131.9)
for (i = 128 ; i <= 130.5 ; i += 0.75) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "spin",
      _duration: 0.5,
      _localRotation: [
        [0, 0, 0, 0],
        [0, 0, 90, 0.25],
        [0, 0, 180, 0.5],
        [0, 0, 270, 0.75],
        [0, 0, 360, 1]
      ]
    }
  });
}

trackOnNotesBetween("spin", 249, 252.9)
for (i = 249 ; i <= 251.5 ; i += 0.75) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "spin",
      _duration: 0.5,
      _localRotation: [
        [0, 0, 0, 0],
        [0, 0, 90, 0.25],
        [0, 0, 180, 0.5],
        [0, 0, 270, 0.75],
        [0, 0, 360, 1]
      ]
    }
  });
}
trackOnNotesBetween("pulseFunction", 224, 248)
pulseOnNote(224, 246, 1.25)
trackOnNotesBetween("pulseFunction", 325, 329)
pulseOnNote(325, 329, 1.5)


// DU N DU ND N DUN

randPath(164, 197, "randTrack")
arrowCurve(164, 197, 10)

filterednotes = _notes.filter(n => n._time >= 164 && n._time <= 197);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = 1.5;
  note._customData._disableSpawnEffect = "true"   // NOTE: removing spawn effect will scuff practice mode if you try and play at a section or track with a note already spawnd that has this property set to true - you need to start playing before these spawn in
});

// Hud Spin

_customEvents.push({
  _time: 216,
  _type: "AnimateTrack",
  _data: {
    _track: "leftPanelTrack",
    _duration: 1,
    _localRotation: [
      [0, 0, 0, 0],
      [0, 90, 0, 0.25,"easeInExpo"],
      [0, 180, 0, 0.5],
      [0, 270, 0, 0.75],
      [0, 360, 0, 1, "easeOutSine"]
    ]
  } 
}, {
  _time: 216,
  _type: "AnimateTrack",
  _data: {
    _track: "rightPanelTrack",
    _duration: 1,
    _localRotation: [
      [0, 0, 0, 0],
      [0, 90, 0, 0.25,"easeInExpo"],
      [0, 180, 0, 0.5],
      [0, 270, 0, 0.75],
      [0, 360, 0, 1, "easeOutSine"]
    ]
  }
});

// ENVIRONMENT STUFF


_environment.push(
  { _id: "^.*.Smoke.*$", _lookupMethod : "Regex", _duplicate: 1, _scale: [0.05,1,0.05], _localPosition: [0, 0, 25], _track: "smokeTrack", _active: true},
  { _id: "^.*.Smoke.*$", _lookupMethod : "Regex", _duplicate: 1, _scale: [0.05,1,0.05], _localPosition: [0, 0, 25.0], _track: "envTrack", _active: true},
  { _id: "^.*Environment\\..{4}NeonTube.*\\(1\\)$", _lookupMethod : "Regex", _duplicate: 1, _active: true, _localPosition: [0, 0, 25], _scale: [5,5,5], _track: "envTrack"},
  { _id: "^.*SidePSR$", _lookupMethod : "Regex", _active: false},
  { _id: "^.*LeftPanel$", _lookupMethod : "Regex", _active: true, _track: "leftPanelTrack"},
  { _id: "^.*RightPanel$", _lookupMethod : "Regex", _active: true, _track: "rightPanelTrack"},
  { _id: "^.*Smoke.*$", _lookupMethod : "Regex", _active: true },
  { _id: "^.*HUD$", _lookupMethod: "Regex", _active: true}
);



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
