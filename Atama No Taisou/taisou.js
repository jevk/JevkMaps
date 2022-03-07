
const fs = require("fs");
const { get } = require("http");

const INPUT = "ExpertStandard.dat";
const OUTPUT = "ExpertPlusStandard_old.dat";

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

function noteGlitch1(Start, End) {
  filterednotes = _notes.filter((n) => n._time >= Start && n._time <= End);
  filterednotes.forEach((note) => {
    let n1 = JSON.parse(JSON.stringify(note));
    n1._customData._disableSpawnEffect = true;
    n1._customData._disableNoteGravity = true;
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
//#region Walls


_customEvents.push({
  _time: 0,
  _type: "AssignTrackParent",
  _data: {
    _parentTrack: "Osu",
    _childrenTracks: ["osuWhite", "osuPink", "osuText"]
  }
}, {
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "Osu",
    _duration: 1,
    _position: [
      [-1,-5,20,0]
    ],
    _rotation: [
      [-20,0,0,0]
    ]
  }
}, {
  _time: 240,
  _type: "AnimateTrack",
  _data: {
    _track: "Osu",
    _duration: 4,
    _position: [
      [-1,-5,10,0],
      [-1,150,10,1,"easeInCirc"]
    ]
  }
});
//#endregion

//#region Note mods

trackOnNotesBetween("dissolve", 272, 279)
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "glitchNote",
    _duration: 1,
    _dissolve: [[0,0]],
    _dissolveArrow: [[0,0]]
  }
}, {
  _time: 272,
  _type: "AnimateTrack",
  _data: {
    _track: "dissolve",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 1, "easeOutCirc"]
    ]
  }
});
noteGlitch1(288, 320)
for(i = 288 ; i <= 311 ; i ++) {
  noteGlitch2(0.5,5,i)
}
noteGlitch1(452, 484.5)
for(i = 452 ; i <= 454 ; i ++) {
  noteGlitch2(0.5,5,i)
}
for(i = 456 ; i <= 478 ; i ++) {
  noteGlitch2(0.5,5,i)
}
noteGlitch1(488, 517)
for(i = 488 ; i <= 511 ; i ++) {
  noteGlitch2(0.5,5,i)
}
noteGlitch1(519,525)
noteGlitch2(0.5,5,519)
noteGlitch1(532, 540)
for(i = 532 ; i <= 535 ; i ++) {
  noteGlitch2(0.5,5,i)
}
noteGlitch1(548, 557)
for(i = 548 ; i <= 511 ; i ++) {
  noteGlitch2(0.5,5,i)
}
noteGlitch1(584, 617)
for(i = 584 ; i <= 611 ; i ++) {
  noteGlitch2(0.5,5,i)
}
noteGlitch1(628, 660)
for(i = 628 ; i <= 631.75 ; i += 0.25) {
  noteGlitch2(0.5,5,i)
}
for(i = 632 ; i <= 654 ; i ++) {
  noteGlitch2(0.5,5,i)
}
noteGlitch1(664, 693)
for(i = 664 ; i <= 675 ; i ++) {
  noteGlitch2(0.5,5,i)
}
for(i = 680 ; i <= 687 ; i ++) {
  noteGlitch2(0.5,5,i)
}

noteGlitch1(699,701)
noteGlitch2(1,20,699)

//#endregion











//#region Environment stuffs

//#region Neon Tube Pulse
_customEvents.push({
  _time: 247.375,
  _type: "AnimateTrack",
  _data: {
    _track: "neonToob",
    _duration: 1,
    _scale: [
      [1,1,1,0],
      [30,1,1,0.125],
      [1,1,1,0.625]
    ]
  }
}, {
  _time: 254.375,
  _type: "AnimateTrack",
  _data: {
    _track: "neonToob",
    _duration: 1,
    _scale: [
      [1,1,1,0],
      [30,1,1,0.125],
      [1,1,1,0.625]
    ]
  }
}, {
  _time: 255.375,
  _type: "AnimateTrack",
  _data: {
    _track: "neonToob",
    _duration: 1,
    _scale: [
      [1,1,1,0],
      [30,1,1,0.125],
      [1,1,1,0.625]
    ]
  }
}, {
  _time: 263.375,
  _type: "AnimateTrack",
  _data: {
    _track: "neonToob",
    _duration: 1,
    _scale: [
      [1,1,1,0],
      [30,1,1,0.125],
      [1,1,1,0.625]
    ]
  }
});

for(i = 240 ; i <= 254 ; i++) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "neonToob",
      _duration: 1,
      _scale: [
        [1,1,1,0],
        [30,1,1,0.125],
        [1,1,1,0.625]
      ]
    }
  });
}

for(i = 256 ; i <= 265 ; i++) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "neonToob",
      _duration: 1,
      _scale: [
        [1,1,1,0],
        [30,1,1,0.125],
        [1,1,1,0.625]
      ]
    }
  });
}

for(i = 266 ; i <= 265 ; i++) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "neonToob",
      _duration: 1,
      _scale: [
        [1,1,1,0],
        [30,1,1,0.125],
        [1,1,1,0.625]
      ]
    }
  });
}

scaleOnNote(266,287.9,"neonToob")

for(i = 288 ; i <= 313 ; i++) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "neonToob",
      _duration: 1,
      _scale: [
        [1,1,1,0],
        [30,1,1,0.125],
        [1,1,1,0.625]
      ]
    }
  });
}

scaleOnNote(314,318,"neonToob")

for(i = 320 ; i <= 381 ; i++) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "neonToob",
      _duration: 1,
      _scale: [
        [1,1,1,0],
        [30,1,1,0.125],
        [1,1,1,0.625]
      ]
    }
  });
}

scaleOnNote(382,383.9,"neonToob")

for(i = 384 ; i <= 406 ; i++) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "neonToob",
      _duration: 1,
      _scale: [
        [1,1,1,0],
        [30,1,1,0.125],
        [1,1,1,0.625]
      ]
    }
  });
}

scaleOnNote(407,416,"neonToob")

for(i = 428 ; i <= 447 ; i++) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "neonToob",
      _duration: 1,
      _scale: [
        [1,1,1,0],
        [30,1,1,0.125],
        [1,1,1,0.625]
      ]
    }
  });
}

scaleOnNote(448,454,"neonToob")
scaleOnNote(456,519,"neonToob")

for(i = 520 ; i <= 531 ; i++) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "neonToob",
      _duration: 1,
      _scale: [
        [1,1,1,0],
        [30,1,1,0.125],
        [1,1,1,0.625]
      ]
    }
  });
}

scaleOnNote(532,535.9,"neonToob")

for(i = 536 ; i <= 547 ; i++) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "neonToob",
      _duration: 1,
      _scale: [
        [1,1,1,0],
        [30,1,1,0.125],
        [1,1,1,0.625]
      ]
    }
  });
}

scaleOnNote(548,551.9,"neonToob")

for(i = 552 ; i <= 575 ; i+=2) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "neonToob",
      _duration: 1,
      _scale: [
        [1,1,1,0],
        [30,1,1,0.125],
        [1,1,1,0.625]
      ]
    }
  });
}

scaleOnNote(576,700,"neonToob")

//#endregion

// envOffset("regex here", scale, rotation, localRotation, position, localPosition, duplicate, active)
// envDupeOffset("regex here", scale, rotation from previous, localRotation from previous, position from previous, localPosition from previous, duplicate amount, active)

//let rY= -60;
//for (i = -340, rY = -120, z = 110 ; i <= 0 ; i += 80, rY += 30, z += 20) {
//  _environment.push(
//    { _id: "^.*SidePSL$", _lookupMethod: "Regex", _duplicate: 1, _scale: [4,2,1], _localRotation: [0,rY,0], _position: [i,20,z]},
//    { _id: "^.*SidePSR$", _lookupMethod: "Regex", _duplicate: 1, _scale: [4,2,1], _localRotation: [0,rY,0], _position: [i,20,z]},
//  );
//}
//for (i = 0, rY = 0, z = 150 ; i <= 340 ; i += 80, rY += 30, z -= 20) {
//  _environment.push(
//    { _id: "^.*SidePSL$", _lookupMethod: "Regex", _duplicate: 1, _scale: [4,2,1], _localRotation: [0,rY,0], _position: [i,20,z]},
//    { _id: "^.*SidePSR$", _lookupMethod: "Regex", _duplicate: 1, _scale: [4,2,1], _localRotation: [0,rY,0], _position: [i,20,z]},
//  );
//}
_environment.push(
  { _id: "^.*LightsTrackLaneRing.Clone.*Laser.{0,4}$", _lookupMethod: "Regex", _scale:[2.5,5,2.5]},
  { _id: "^.*PlayersPlace..[^023].*$", _lookupMethod: "Regex", _scale:[100,1,1000]},
  { _id: "^.*PlayersPlace..[0].*$", _lookupMethod: "Regex", _scale:[100,1,1000], _position: [0, -2, 0], _duplicate: 1},
  { _id: "^.*Environment.{3,6}NeonTube.{0,5}$", _lookupMethod: "Regex", _track: "neonToob"},
  { _id: "^.*SidePS.$", _lookupMethod: "Regex", _active: false},
  { _id: "^.*Spectrograms$", _lookupMethod: "Regex", _active: false},
  { _id: "^.*PlayersPlace.*Construction$", _lookupMethod: "Regex", _rotation: [280,0,0], _position:[0,-1.7,1.25], _duplicate:1},
  { _id: "^.*PlayersPlace.*Construction$", _lookupMethod: "Regex", _rotation: [270,0,0], _position:[0,-3.15,0], _duplicate:1},
  { _id: "^.*TrackMirror$", _lookupMethod: "Regex", _active: false},
  { _id: "^.*NarrowGameHUD$", _lookupMethod: "Regex", _localPosition:[0, 7.36, 11.1]},
  { _id: "^.*HUD.*EnergyPanel$", _lookupMethod: "Regex", _localPosition:[0,-8.69,1]},
  { _id: "^.*LeftPanel$" , _lookupMethod: "Regex", _localPosition:[-5.16, -8.81, 1]},
  { _id: "^.*RightPanel$", _lookupMethod: "Regex", _localPosition: [5.16, -8.81, 1]}
);


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
