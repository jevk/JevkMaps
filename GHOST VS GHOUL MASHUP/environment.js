
const fs = require("fs");

const INPUT = "EasyLightshow.dat";
const OUTPUT = "NormalLightshow.dat";

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
    if (!object._customData._track) object._customData._track = track;
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
      if (!object._customData._track) object._customData._track = trackR;
      else if (Array.isArray(object._customData._track)) {
        object._customData._track.push(trackR)
      } else {
        object._customData._track = [object._customData._track, trackR];
      }
    }
    if (object._type == 1) {
      if (!object._customData._track) object._customData._track = trackB;
      else if (Array.isArray(object._customData._track)) {
        object._customData._track.push(trackB)
      } else {
        object._customData._track = [object._customData._track, trackB];
      }
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

function hudPulse(Start, End, Interval, Duration, Intensity) {
  for (i = Start ; i <= End ; i+=Interval) {
    let panelScale = Math.fround(getRndInteger(1125, 1500)/1000)*Intensity;
    for (i1 = 1, i2 = -1; i1 <= 2 ; i1++, i2 *= -1) {
      _customEvents.push({
        _time: i-0.125,
        _type: "AnimateTrack",
        _data: {
          _track: `${i1}PanelParent`,
          _duration: Duration,
          //_rotation: [
          //  [0, 0, 0, 0],
          //  [getRndInteger(-15,15)*Intensity, getRndInteger(-10,10)*Intensity, getRndInteger(-75,75)*Intensity, 0.25, "easeOutCubic"],
          //  [0, 0, 0, 1, "easeInOutCubic"]
          //],
          _scale: [
            [1, 1, 1, 0],
            [panelScale, Math.abs(1-(panelScale)), 1, 0.125, "easeOutCirc"],
            [Math.abs(1-(panelScale)), panelScale*2*Math.fround(Intensity),  1, 0.25, "easeInOutCubic"],
            [1, 1, 1, 1, "easeInOutSine"]
          ],
          _position: [
            [0, 0, 0, 0],
            [getRndInteger(2,6)*i2*Intensity, getRndInteger(-2,2)*Intensity, getRndInteger(-1,3)*Intensity, 0.25, "easeOutBack"],
            [0, 0, 0, 1, "easeInOutSine"]
          ]
        }
      }, {
        _time: i-0.125,
        _type: "AnimateTrack",
        _data: {
          _track: `${i1}PanelTrack`,
          _duration: Duration,
          //_scale: [
          //  [1, 1, 1, 0],
          //  [panelScale, Math.abs(1-(panelScale)), 1, 0.125, "easeOutCirc"],
          //  [Math.abs(1-(panelScale))/2, panelScale*2*Math.fround(Intensity/1.5),  1, 0.25, "easeInOutCubic"],
          //  [1, 1, 1, 1, "easeInOutCubic"]
          //],
          _rotation: [
            [0, 0, 0, 0],
            [getRndInteger(-15,15)*Intensity*1.5, getRndInteger(-10,10)*Intensity*1.5, getRndInteger(-75,75)*Intensity*1.5, 0.25, "easeOutCubic"],
            [0, 0, 0, 1, "easeInOutSine"]
          ]
        }
      });
    }
  }
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

const envTracks = [];
for (i = 1, y = 2.3, pos = 35 ; i <= 15 ; i++, y -= 0.15, pos+=10) {
  _environment.push(
    { _id: `^.*\\[${i}\\]LightsTrackLaneRing.Clone.*Laser.{0,4}$`, _lookupMethod: "Regex", _scale: [1, 1.941, 1]},
    { _id: `^.*\\[${i}\\].{15}Ring.Clone.$`, _lookupMethod: "Regex", _scale: [y,y,1], _localPosition: [0,0,pos]}
  );
}
for (i = 1, zpos = 0, lightid = 11 ; i <= 10 ; i++, zpos += 10, lightid += 2) {
  _environment.push(
    { _id: "33\\]Laser$" , _lookupMethod: "Regex" , _duplicate: 1 , _localPosition: [0, 12.199, 19+zpos], _scale: [3, 0.008, 10], _rotation: [0, 0, 22.5], _lightID: lightid},
    { _id: "34\\]Laser \\(1\\)$",_lookupMethod:"Regex",_duplicate:1,_localPosition: [0, 12.199, 19+zpos], _scale: [3, 0.008, 10], _rotation: [0, 0,-22.5], _lightID: lightid+1}
  );
}
for (i = 1, zpos = 0, lightid = 11 ; i <= 10 ; i++, zpos += 10, lightid += 2) {
  _environment.push(
    { _id: "Lights\\.\\[[0]\\]NeonTube$", _lookupMethod: "Regex", _active: true, _duplicate: 1, _scale:[0.45, 0.8, 5], _position: [1.85, -0.15, 15+zpos], _rotation: [0, 0, 90], _track: `LRailTrack${i}`, _lightID: lightid},
    { _id: "Lights\\.\\[[0]\\]NeonTube$", _lookupMethod: "Regex", _active: true, _duplicate: 1, _scale:[0.45, 0.8, 5], _position:[-1.85, -0.15, 15+zpos], _rotation:[0, 0, -90], _track: `RRailTrack${i}`, _lightID: lightid+1}
  );
  _customEvents.push({
    _time: 408,
    _type: "AnimateTrack",
    _data: {
      _duration: 472-408,
      _track: `LRailTrack${i}`,
      _position: [
        [1.85, -0.15, 15+zpos, 0],
        [getRndInteger(-50, -5), getRndInteger(10, 150)/10, getRndInteger(20, 70), 0.5],
        [getRndInteger(-2, 2), getRndInteger(10, 150)/10, getRndInteger(20, 70), 0.75, "splineCatmullRom"],
        [1.85, -0.15, 15+zpos, 1, "splineCatmullRom", "easeOutCubic"]
      ],
      _rotation: [
        [0, 0, 90, 0],
        [getRndInteger(-100,100),getRndInteger(-100,100),getRndInteger(-100,100),0.5, "easeOutCubic"],
        [0, 0, 90, 1, "easeInOutCubic"]
      ]
    }
  }, {
    _time: 408,
    _type: "AnimateTrack",
    _data: {
      _duration: 472-408,
      _track: `RRailTrack${i}`,
      _position: [
        [-1.85, -0.15, 15+zpos, 0],
        [getRndInteger(5, 50), getRndInteger(10, 150)/10, getRndInteger(20, 70), 0.5],
        [getRndInteger(-2, -2), getRndInteger(10, 150)/10, getRndInteger(20, 70), 0.75, "splineCatmullRom"],
        [-1.85, -0.15, 15+zpos, 1, "splineCatmullRom", "easeOutCubic"]
      ],
      _rotation: [
        [0, 0, -90, 0],
        [getRndInteger(-100,100),getRndInteger(-100,100),getRndInteger(-100,100),0.5, "easeOutCubic"],
        [0, 0, -90, 1, "easeInOutCubic"]
      ]
    }
  });
}
//for (i = 1, numberId = 28, zpos = 0 ; i <= 5 ; i++, numberId++, zpos += 6) {
//  _environment.push(
//    { _id: `${numberId}\\]Rotating\\.+\\.\\[0\\]BaseL$`, _lookupMethod: "Regex", _scale: [2, 2, 2], _localPosition: [getRndInteger(7,12) ,  0, 10 + zpos]},
//    { _id: `${numberId}\\]Rotating\\.+\\.\\[1\\]BaseR$`, _lookupMethod: "Regex", _scale: [2, 2, 2], _localPosition: [getRndInteger(-12,-7), 0, 10 + zpos]}
//  );
//}
for (i = 1, numberId = 28, zpos = 0 ; i <= 5 ; i++, numberId++, zpos += 1.5) {
  _environment.push(
    { _id: `${numberId}\\]RotatingLasersPair( \\(\\d\\))?$`, _lookupMethod: "Regex", _position: [0, 0, 0]},
    { _id: `${numberId}\\]RotatingLasersPair.*BaseL$`, _lookupMethod: "Regex", _scale: [2, 2, 2], _position: [-15-zpos, -0.15, 68.99]},
    { _id: `${numberId}\\]RotatingLasersPair.*BaseR$`, _lookupMethod: "Regex", _scale: [2, 2, 2], _position: [ 15+zpos, -0.15, 68.99]}
  )
}
_environment.push(
  { _id: "Environment\\.\\[\\d{2}\\]NeonTube$", _lookupMethod: "Regex", _position: [-0.996, -0.0833, 12.928], _scale: [3, 1, 1]},
  { _id: "Environment\\.\\[\\d{2}\\]NeonTube \\(1\\)$", _lookupMethod: "Regex", _position: [0.996, -0.0833, 12.928], _scale: [3, 1, 1]},
  { _id: "SidePSL", _lookupMethod: "Regex", _rotation: [45, 90, 90], _scale: [6, 6, 6], _localPosition: [0, 0, 20], _track: "particleSystemL"},
  { _id: "SidePSR", _lookupMethod: "Regex", _rotation: [45, 90, 90], _scale: [6, 6, 6], _localPosition: [0, 0, 20], _track: "particleSystemR"},
  { _id: "PlayersPlace.\\[2\\]Construction$", _lookupMethod: "Regex", _duplicate: 1, _localPosition: [90, -0.24, 68.99], _scale: [0.5, 2, 0.1], _rotation: [90, 90, 0]},

  { _id: "Spectro", _lookupMethod: "Regex", _active: false},
  { _id: "3.\\]Laser( \\((1|2|3)\\))?$", _lookupMethod: "Regex", _active: false},
  { _id: "Lights\\.\\[[0,1]\\]NeonTube( \\(1\\))?$", _lookupMethod: "Regex", _active: false}
)


_environment.push(
    { _id: `LeftPanel$`, _position: [-4,1,10], _lookupMethod: "Regex", _track: `1Panel`, _active: true},
    { _id: `RightPanel$`, _position: [4,1,10], _lookupMethod: "Regex", _track: `2Panel`, _active: true}
);

_pointDefinitions.push({
  _name: "rotPSL",
  _points: [
    [0,   90, 90, 0],
    [90,  90, 90, 0.25],
    [180, 90, 90, 0.5],
    [270, 90, 90, 0.75],
    [360, 90, 90, 1]
  ]
}, {
  _name: "rotPSR",
  _points: [
    [0,   90, 90, 0],
    [-90,  90, 90, 0.25],
    [-180, 90, 90, 0.5],
    [-270, 90, 90, 0.75],
    [-360, 90, 90, 1]
  ]
});

for (i = 0 ; i <= 1143 ; i+=32) {
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "particleSystemL",
      _duration: 32,
      _rotation: "rotPSL",
    }
  }, {
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "particleSystemR",
      _duration: 32,
      _rotation: "rotPSR",
    }
  });
}



_customEvents.push({
  _time: 408,
  _type: "AnimateTrack",
  _data: {
    _track: "1Panel",
    _duration: 472-408,
    _easing: "easeOutCubic",
    _position: [
      [-4, 1, 10, 0],
      [getRndInteger(-5,5), getRndInteger(5,20), getRndInteger(20,50), 0.25],
      [getRndInteger(-5,5), getRndInteger(5,20), getRndInteger(20,50), 0.75, "splineCatmullRom"],
      [-4, 1, 10, 1, "splineCatmullRom"]
    ],
    _rotation: [
      [0, 0, 0, 0],
      [getRndInteger(-179, 179), getRndInteger(-179, 179), getRndInteger(-179, 179),0.125, "easeOutCubic"],
      [getRndInteger(-350, 350), getRndInteger(-350, 350), getRndInteger(-350, 350),0.25, "easeInOutCubic"],
      [getRndInteger(-179, 179), getRndInteger(-179, 179), getRndInteger(-179, 179),0.375, "easeInOutCubic"],
      [getRndInteger(-350, 350), getRndInteger(-350, 350), getRndInteger(-350, 350),0.5, "easeInOutCubic"],
      [getRndInteger(-179, 179), getRndInteger(-179, 179), getRndInteger(-179, 179),0.625, "easeInOutCubic"],
      [getRndInteger(-350, 350), getRndInteger(-350, 350), getRndInteger(-350, 350),0.75, "easeInOutCubic"],
      [getRndInteger(-179, 179), getRndInteger(-179, 179), getRndInteger(-179, 179),0.875, "easeInOutCubic"],
      [0, 0, 0, 1, "easeInOutCubic"]
    ]
  }
}, {
  _time: 408,
  _type: "AnimateTrack",
  _data: {
    _track: "2Panel",
    _duration: 472-408,
    _easing: "easeOutCirc",
    _position: [
      [4, 1, 10, 0],
      [getRndInteger(-5,5), getRndInteger(5,20), getRndInteger(20,50), 0.25],
      [getRndInteger(-5,5), getRndInteger(5,20), getRndInteger(20,50), 0.75, "splineCatmullRom"],
      [4, 1, 10, 1, "splineCatmullRom"]
    ],
    _rotation: [
      [0, 0, 0, 0],
      [getRndInteger(-179, 179), getRndInteger(-179, 179), getRndInteger(-179, 179),0.125, "easeOutCubic"],
      [getRndInteger(-350, 350), getRndInteger(-350, 350), getRndInteger(-350, 350),0.25, "easeInOutCubic"],
      [getRndInteger(-179, 179), getRndInteger(-179, 179), getRndInteger(-179, 179),0.375, "easeInOutCubic"],
      [getRndInteger(-350, 350), getRndInteger(-350, 350), getRndInteger(-350, 350),0.5, "easeInOutCubic"],
      [getRndInteger(-179, 179), getRndInteger(-179, 179), getRndInteger(-179, 179),0.625, "easeInOutCubic"],
      [getRndInteger(-350, 350), getRndInteger(-350, 350), getRndInteger(-350, 350),0.75, "easeInOutCubic"],
      [getRndInteger(-179, 179), getRndInteger(-179, 179), getRndInteger(-179, 179),0.875, "easeInOutCubic"],
      [0, 0, 0, 1, "easeInOutCubic"]
    ]
  }
});













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
