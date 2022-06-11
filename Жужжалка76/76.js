
const fs = require("fs");

const INPUT = __dirname+"\\ExpertStandard.dat";
const OUTPUT =__dirname+"\\ExpertPlusLawless_Old.dat";

let difficulty = JSON.parse(fs.readFileSync(INPUT));




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
  wall._customData._noteJumpStartBeatOffset = -0.5;
  wall._customData._noteJumpMovementSpeed = 19;
});

_notes.forEach(note => {
  if (!note._customData) {
    note._customData = {};
  }
  note._customData._disableSpawnEffect = true;
  note._customData._noteJumpStartBeatOffset = -0.5;
  note._customData._noteJumpMovementSpeed = 19;
});










//#region helper functions -  -  -  - These make life a LOT eassier, look through, figure out what they do, add your own, have fun :)  ---   Many are very specific use cases and might need to be modified depnding on use.

function chooseBetweenTwo(n1, n2) {
  let ran = Math.round(Math.random());
  if (ran === 0) return n1;
  if (ran === 1) return n2;
}

function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
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

function trackOnNotesBetween(track, p1, p2, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (object._customData._track != track) {
      if (!object._customData._track) object._customData._track = track;
      else if (Array.isArray(object._customData._track)) {
        object._customData._track.push(track)
      } else {
        object._customData._track = [object._customData._track, track];
      }
      if (typeof potentialOffset !== "undefined") {
        object._customData._noteJumpStartBeatOffset = potentialOffset;
      }
    }
  });
  return filterednotes;
}

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

function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function floatingPath(Start, End, assignTrack, offset) {
  trackOnNotesBetween(assignTrack, Start, End)
  offestOnNotesBetween(Start, End, offset)
  
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {

    let xpos = (random(-100,60) * 0.1);
    let ypos = (random(-20,40) * 0.1);

    let xrot = random(-15,15);
    let yrot = random(-10,10);
    let zrot = random(-100,100);

    if (!note._customData._animation) note._customData._animation = {};

    trackOnNotesBetween(assignTrack, note._time, note._time);
    //note._customData._easing = "easeOutCirc";
    note._customData._animation._position = [
      [xpos, ypos-1.5, 3, 0],
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

function chaosPath(Start, End, track, offset, posAmp, rotAmp, scaleAmp, disAmp) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {
    trackOnNotesBetween(track, note._time, note._time)
    if (typeof offset !== 'undefined' || offset !== null) {
      note._customData._noteJumpStartBeatOffset = offset;
    }

    note._customData._disableSpawnEffect = true;
    xValue = random(posAmp*-1, posAmp)
    if (xValue >= -3 && xValue <= 2) {
      direc = random(0, 1)
      if (direc == 0) xPosition = -5;
      if (direc == 1) xPosition = 4;
    }

    if (!note._customData._animation) note._customData._animation = {};

    if (posAmp <= 3) yPosition = random(-1, posAmp);
    if (posAmp >= 3) yPosition = random((posAmp*0.75)*-1, posAmp*0.75);
    xPosition = random(posAmp*-1, posAmp);
    note._customData._animation._position = [
      [xPosition, yPosition, 0, 0],
      [xPosition, 0, 0, 0.125, "splineCatmullRom"],
      [0, 0, 0, 0.25, "easeOutCubic", "splineCatmullRom"]
    ];

    xDiv = random(1,4)
    yDiv = random(2,4)
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
      [random(scaleAmp*0.75, scaleAmp*1.25), random(scaleAmp*0.75, scaleAmp*1.25), random(scaleAmp*0.75, scaleAmp*1.25), 0],
      [1, 1, 1, 0.25, "easeOutBack"]
    ];

    if (disAmp < 1 || typeof disAmp !== 'undefined' || disAmp !== null) {
      note._customData._animation._dissolve = [
        [0, 0],
        [random(disAmp, 1), 0.0625],
        [1, 0.125, "easeOutCirc"]
      ];
    }
  });
}

function noteFly(Start, End, potentialTrack, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {
    if (typeof potentialOffset !== 'undefined' || potentialOffset !== null) note._customData._noteJumpStartBeatOffset = potentialOffset;
    if (typeof potentialTrack !== 'undefined' || potentialTrack !== null) {
      if (!note._customData._track) note._customData._track = [potentialTrack];
      else trackOnNotesBetween(potentialTrack, note._time, note._time)
    }
    if (!note._customData._animation) note._customData._animation = {};

    note._customData._disableNoteLook = true;
    note._customData._disableNoteGravity = true;
    note._customData._disableSpawnEffect = true;

    scaleValue = Math.fround(random(60,100)/10);
    note._customData._animation._scale = [
      [scaleValue, scaleValue, scaleValue*4, 0],
      [Math.fround(scaleValue/16), scaleValue*1.25, Math.fround(scaleValue/16), 0.1, "easeInCubic"],
      [1, 1, 1, 0.45, "easeOutExpo"]
    ];

    numba = chooseBetweenTwo(-1,1)
    posValue = Math.fround((random(150,500)*numba)/10);

    note._customData._animation._position = [
      [random(-2,2), posValue, -100, 0],
      [0, posValue, 0, 0.1, "easeInCubic", "splineCatmullRom"],
      [0, 0, 0, 0.45, "easeOutExpo", "splineCatmullRom"]
    ];

    yRot = random(-20,20);
    zRot = random(-180,180);
    note._customData._animation._rotation = [
      [0, yRot+Math.fround(random(-50,50)/10), zRot+Math.fround(random(-50,50)/10), 0],
      [0, yRot, Math.round((zRot/3))*-1, 0.125, "easeInOutSine"],
      [0, 0, 0, 0.25, "easeOutCubic"]
    ];

    note._customData._animation._dissolve = [
      [random(1,30)/100, 0],
      [1, 0.4, "easeOutExpo"]
    ];
  });
}

function rndColorToNormal(Start, End, potentialTrack, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End && (n._type === 0 || n._type === 1));
  filterednotes.forEach(note => {
    if (typeof potentialOffset !== 'undefined' || potentialOffset !== null) note._customData._noteJumpStartBeatOffset = potentialOffset;
    if (typeof potentialTrack !== 'undefined' || potentialTrack !== null) trackOnNotesBetween(potentialTrack, note._time, note._time);
    if (!note._customData._animation) note._customData._animation = {};
    if (typeof note._customData._color !== 'undefined' || note._customData._color !== null) delete note._customData._color;

    

    uwu = HSVtoRGB(random(1,100)/100, 1, 1)
    uwu2 = HSVtoRGB(random(1,100)/100, 1, 1)

    if (note._type === 0) {
      note._customData._animation._color = [
        [...uwu, 5, 0],
        [...uwu2, 5, 0.2],
        [0.658823549747467, 0.125490203499794, 0.125490203499794, 1.0, 0.3, "easeOutCubic"]
      ];
    }
    if (note._type === 1) {
      note._customData._animation._color = [
        [...uwu, 5, 0],
        [...uwu2, 5, 0.2],
        [0.125490203499794, 0.3921568691730499, 0.658823549747467, 1.0, 0.3, "easeOutCubic"]
      ];
    }
  });
}

function edgeAnimation(Start, End, potentialTrack, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End && (n._type === 0 || n._type === 1));
  filterednotes.forEach(note => {
    if (typeof potentialOffset !== 'undefined' || potentialOffset !== null) note._customData._noteJumpStartBeatOffset = potentialOffset;
    if (typeof potentialTrack !== 'undefined' || potentialTrack !== null) trackOnNotesBetween(potentialTrack, note._time, note._time);
    if (!note._customData._animation) note._customData._animation = {};
    if (typeof note._customData._color !== 'undefined' || note._customData._color !== null) delete note._customData._color;

    note._customData._animation._position = [
      [chooseBetweenTwo(-1,1), 1, 0, 0],
      [0, 1, 0, 0.125],
      [0, 0, 0, 0.25]
    ];

    _customEvents.push({
      _time: 0,
      _type: "AssignPathAnimation",
      _data: {
        _track: potentialTrack,
        _dissolve: [
          [0, 0],
          [1, 0.25, "easeInOutQuad"]
        ]
      }
    });
  });
}

function pulseRelNotes(Start, End, track, interval, duration, amplitude) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End && n._type < 3);
  filterednotes.forEach(note => {
    trackName = `${track+'Index'+note._lineIndex+'Layer'+note._lineLayer}`;
    if (!note._customData._track) note._customData._track = `${track+'Index'+note._lineIndex+'Layer'+note._lineLayer}`;
    else if (Array.isArray(note._customData._track)) {
      note._customData._track.push(`${track+'Index'+note._lineIndex+'Layer'+note._lineLayer}`); 
    } else {
      note._customData._track = [note._customData._track, `${track+'Index'+note._lineIndex+'Layer'+note._lineLayer}`];
    }
  });
  for (layerNum = 0 ; layerNum <= 2 ; layerNum++) {
    for (indexNum = 0 ; indexNum <= 3 ; indexNum++) {
      for (i = Start ; i <= End ; i += interval) {
        _customEvents.push({
          _time: i-(duration/8),
          _type: "AnimateTrack",
          _data: {
            _track: `${track+'Index'+indexNum+'Layer'+layerNum}`,
            _duration: duration,
            _scale: [
              [1, 1, 1, 0],
              [1.25, 1.25, 1.25, 0.125, "easeInOutBack"],
              [1, 1, 1, 1, "easeOutElastic"]
            ],
            _position: [
              [0, 0, 0, 0],
              [((indexNum-1.5)/2.5)*(amplitude/2), ((layerNum-1)/5)*(amplitude/2), (Math.abs(layerNum-1.25)/50)*(amplitude/4), 0.125],
              [0, 0, 0, 0.625]
            ]
          }
        });
      }
    }
  }
}

function originRotation(Start, End) {
  bruhMoment = 0;
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {
    note._customData._noteJumpStartBeatOffset = 0;
    bruhMoment-= 0.2;
    if (!note._customData._animation) note._customData._animation = {};
    
    bruhY = Math.abs((bruhMoment/4)*random(0.25, 2));
    bruhZ = Math.abs((bruhMoment/20)*random(0.25, 2));
    note._customData._animation._rotation = [
      [bruhMoment, bruhY, bruhZ, 0],
      [bruhMoment/2, bruhY/2, bruhZ/2, 0.125, "easeInCubic"],
      [0, 0, 0, 0.25, "easeOutCubic"]
    ]
  });
}

//#endregion

 

//#region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -

// 0.658823549747467
// 0.125490203499794
// 0.125490203499794
// 1.0

// 0.125490203499794
// 0.3921568691730499
// 0.658823549747467
// 1.0

//fixTowerRotation(0,900)

filterednotes = _notes.filter(n => n._time >= 0 && n._time <= 900);
filterednotes.forEach(note => {
  // if (note._type === 0) {
  //   note._customData._color = [0.658823549747467, 0.125490203499794, 0.125490203499794, 1];
  // }
  // if (note._type === 1) {
  //   note._customData._color = [0.125490203499794, 0.3921568691730499, 0.658823549747467, 1];
  // }
  note._customData._noteJumpStartBeatOffset = -0.5;
  note._customData._noteJumpMovementSpeed = 19;
  if (note._type != 3) trackOnNotesBetween("globalTrack", note._time, note._time)
  if (note._type == 3) trackOnNotesBetween("globalBombTrack", note._time, note._time)
});

//for (energy = 1 ; energy <= 7 ; energy++) {
//  _customEvents.push({
//    _time: 0,
//    _type: "AnimateTrack",
//    _data: {
//      _track: `EnergyPanel${energy}`,
//      _duration: 4,
//      _position: [
//        [0, 0, 9.1, 0]
//      ],
//      _localRotation: [
//        [0, 0, 0, 0]
//      ]
//    }
//  });
//}


_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "LeftPanelParent",
    _duration: 4,
    _position: [
      [-5.12, 0, 0, 0],
      [-5.12, 0, 9.1, 1, "easeOutQuad"]
    ],
    _rotation: [
      [90, 90, 100, 0],
      [0, 0, 0, 1, "easeOutQuad"]
    ],
    _localRotation: [
      [0, 0, 0, 0]
    ]
  }
}, {
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "RightPanelParent",
    _duration: 4,
    _position: [
      [5.12, 0, 0, 0],
      [5.12, 0, 9.1, 1, "easeOutQuad"]
    ],
    _rotation: [
      [90, -90, -100, 0],
      [0, 0, 0, 1, "easeOutQuad"]
    ],
    _localRotation: [
      [0, 0, 0, 0]
    ]
  }
});
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "HUDParent",
    _duration: 4,
    _rotation: [
      [0, 0, 0, 0]
    ],
    _position: [
      [0, 1, 0, 0]
    ]
  }
});


_customEvents.push({
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "floot",
    _dissolve: [
      [0, 0],
      [1, 0.25, "easeOutCubic"]
    ],
    _dissolveArrow: [
      [0, 0],
      [1, 0.25, "easeOutCubic"]
    ],
    _position: [
      [0, 0, -10, 0],
      [0, 0, 0, 0.25, "easeOutCubic"]
    ]
  }
});

_customEvents.push({
  _time: 72,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 6,
    _dissolve: [
      [0, 0],
      [0.9, 1]
    ]
  }
}, {
  _time: 78,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 1,
    _dissolve: [
      [0, 0],
      [1, 0.571, "easeStep"]
    ]
  }
}, {
  _time: 79,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 1]
    ]
  }
}, {
  _time: 80,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 6,
    _dissolve: [
      [0, 0],
      [0.9, 1]
    ]
  }
}, {
  _time: 86,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 1,
    _dissolve: [
      [0, 0]
    ]
  }
}, {
  _time: 88,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 6,
    _dissolve: [
      [0, 0],
      [0.9, 1]
    ]
  }
}, {
  _time: 94,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 1.5,
    _dissolve: "fastFlicker"
  }
}, {
  _time: 95.5,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 0.5,
    _dissolve: [
      [0, 0],
      [1, 1]
    ]
  }
}, {
  _time: 96,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 6,
    _dissolve: [
      [0.2, 0],
      [1, 1]
    ]
  }
}, {
  _time: 100,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 0.125,
    _dissolve: [
      [1, 0],
      [0, 1]
    ]
  }
}, {
  _time: 100.5,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 0,
    _dissolve: [
      [0.5, 0]
    ]
  }
}, {
  _time: 101.143,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: (1/7)*2,
    _dissolve: [
      [0.5, 0],
      [0.25, 0.5, "easeStep"],
      [0, 1, "easeStep"]
    ]
  }
}, {
  _time: 102,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 1,
    _dissolve: [
      [0, 0],
      [1, 1]
    ]
  }
}, {
  _time: 103,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 1,
    _dissolve: "dissolveDistort"
  }
}, {
  _time: 104,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 0,
    _dissolve: [
      [1, 0]
    ]
  }
});

const dissolvingArray1 = [];

for (i = 0, state = 1, arrayNum = 0 ; i <= 1 ; i += 0.0625, arrayNum++) {
  if (state == 1) {
    state = 0;
  } else state = 1;
  dissolvingArray1.push([state, i, "easeStep"]);
}
_pointDefinitions.push({
  _name: "fastFlicker",
  _points: dissolvingArray1
});

const dissolvingArray2 = [];

for (i = 0, state = 0.3, arrayNum = 0 ; i <= 1 ; i += 0.0625, arrayNum++) {
  if (state == 0.3) {
    state = 0.6;
  } else state = 0.3;
  dissolvingArray2.push([state, i]);
}
_pointDefinitions.push({
  _name: "dissolveDistort",
  _points: dissolvingArray2
});

originRotation(104, 131.99)



pulseRelNotes(137, 167, "ohNo", 1, 1, 1.25)
pulseRelNotes(169, 184, "ohNo", 1, 1, 1.25)
pulseRelNotes(200.0625, 207, "ohNo", 1, 0.5, 1.25)
pulseRelNotes(216.0625, 222.9, "ohNo", 1, 0.5, 1.25)

for(i1 = 232, amp = 0.1; i1 <= 247 ; i1++, amp+=0.05) {
  pulseRelNotes(i1, i1+2, "man", 8, 1, amp)
}

pulseRelNotes(248, 255.9, "man", 1, 0.75, 2)

pulseRelNotes(344, 371, "lessgoo", 1, 0.5, 1.25)
pulseRelNotes(372, 376, "lessgoo", 8, 0.5, 1.25)
pulseRelNotes(376, 386, "lessgoo", 1, 0.5, 1.25)
pulseRelNotes(387, 391.99, "lessgoo", 8, 0.5, 1.25)
pulseRelNotes(392, 393.25, "lessgoo", 8, 0.5, 1.25)

for (i1 = 393.5 ; i1 <= 398 ; i1+=2) {
  pulseRelNotes(i1, i1+0.45, "hmmWatsDis", 0.25, 0.125, 1.25)
  pulseRelNotes(i1+0.5, i1+1.9, "hmmWatsDis", 8, 0.125, 1.25)
}

pulseRelNotes(399, 399.5, "lessgoo", 1/3.5, 0.5, 1)
pulseRelNotes(399.8, 399.8, "lessgoo", 1, 0.5, 1)
pulseRelNotes(400, 402, "lessgoo", 1, 0.5, 1)
pulseRelNotes(403, 406, "lessgoo", 8, 0.5, 1)
pulseRelNotes(472, 499, "srslyWtfAreTheseTrackNamesLol", 8, 0.75, 1)
pulseRelNotes(504, 509, "srslyWtfAreTheseTrackNamesLol", 1, 0.75, 1)
pulseRelNotes(510, 511.99, "srslyWtfAreTheseTrackNamesLol", 8, 0.75, 1)
pulseRelNotes(512, 516, "srslyWtfAreTheseTrackNamesLol", 1, 0.75, 1)
pulseRelNotes(517, 519.99, "srslyWtfAreTheseTrackNamesLol", 8, 0.75, 1)
pulseRelNotes(528, 531.9, "srslyWtfAreTheseTrackNamesLol", 1, 0.25, 1)
pulseRelNotes(532, 534.99, "srslyWtfAreTheseTrackNamesLol", 8, 0.5, 1)
pulseRelNotes(536, 538.99, "srslyWtfAreTheseTrackNamesLol", 8, 0.75, 1)
pulseRelNotes(688, 694.99, "hereWeGoAgainnnnnn", 1, 1, 1.25)
pulseRelNotes(695, 696.9, "hereWeGoAgainnnnnn", 8, 1, 1.25)
pulseRelNotes(697, 738.9, "hereWeGoAgainnnnnn", 1, 1, 1.25)
pulseRelNotes(739, 742.9, "hereWeGoAgainnnnnn", 8, 1, 1.25)
pulseRelNotes(773, 777.1, "hereWeGoAgainnnnnn", 1.5, 1, 2)
pulseRelNotes(777.5, 780, "hereWeGoAgainnnnnn", 8, 1, 2)

filterednotes = _notes.filter(n => n._time >= 8 && n._time <= 36.1);
filterednotes.forEach(note => {
  trackOnNotesBetween("floot", note._time, note._time)
  note._customData._disableNoteGravity = true;
  note._customData._disableNoteLook = true;
  note._customData._disableSpawnEffect = true;
  note._customData._noteJumpStartBeatOffset += 1
  if (!note._customData._animation) note._customData._animation = {};

  note._customData._animation._rotation = [
    [random(-10,10), random(-15,15), random(-5,5), 0],
    [0, 0, 0, 0.25, "easeOutQuad"]
  ];
  lRotX = random(-170, 170);
  lRotY = random(-170, 170);
  lRotZ = random(-170, 170);
  note._customData._animation._localRotation = [
    [lRotX, lRotY, lRotZ, 0],
    [lRotX/2, lRotY/2, lRotZ/2, 0.24, "easeInCirc"],
    [0, 0, 0, 0.48, "easeOutCirc"]
  ];
});

filterednotes = _notes.filter(n => n._time >= 232 && n._time <= 247 && n._type != 3);
filterednotes.forEach(note => {
  trackOnNotesBetween("floot", note._time, note._time)
  note._customData._disableNoteGravity = true;
  note._customData._disableNoteLook = true;
  note._customData._disableSpawnEffect = true;
  note._customData._noteJumpStartBeatOffset += 1
  if (!note._customData._animation) note._customData._animation = {};

  note._customData._animation._rotation = [
    [random(-10,10), random(-15,15), random(-5,5), 0],
    [0, 0, 0, 0.25, "easeOutQuad"]
  ];
  lRotX = random(-170, 170);
  lRotY = random(-170, 170);
  lRotZ = random(-170, 170);
  note._customData._animation._localRotation = [
    [lRotX, lRotY, lRotZ, 0],
    [lRotX/2, lRotY/2, lRotZ/2, 0.24, "easeInCirc"],
    [0, 0, 0, 0.48, "easeOutCirc"]
  ];
});

filterednotes = _notes.filter(n => n._time >= 504 && n._time <= 531 && n._type != 3);
filterednotes.forEach(note => {
  trackOnNotesBetween("floot", note._time, note._time)
  note._customData._disableNoteGravity = true;
  note._customData._disableNoteLook = true;
  note._customData._disableSpawnEffect = true;
  note._customData._noteJumpStartBeatOffset += 1
  if (!note._customData._animation) note._customData._animation = {};

  note._customData._animation._rotation = [
    [random(-10,10), random(-15,15), random(-5,5), 0],
    [0, 0, 0, 0.25, "easeOutQuad"]
  ];
  lRotX = random(-170, 170);
  lRotY = random(-170, 170);
  lRotZ = random(-170, 170);
  note._customData._animation._localRotation = [
    [lRotX, lRotY, lRotZ, 0],
    [lRotX/2, lRotY/2, lRotZ/2, 0.24, "easeInCirc"],
    [0, 0, 0, 0.48, "easeOutCirc"]
  ];
});

filterednotes = _notes.filter(n => n._time >= 554 && n._time <= 559 && n._type != 3);
filterednotes.forEach(note => {
  if (note._type == 0) trackOnNotesBetween("floot", note._time, note._time);
  note._customData._disableNoteGravity = true;
  note._customData._disableNoteLook = true;
  note._customData._disableSpawnEffect = true;
  note._customData._noteJumpStartBeatOffset += 1
  if (!note._customData._animation) note._customData._animation = {};

  note._customData._animation._rotation = [
    [random(-10,10), random(-15,15), random(-5,5), 0],
    [0, 0, 0, 0.25, "easeOutQuad"]
  ];
  lRotX = random(-170, 170);
  lRotY = random(-170, 170);
  lRotZ = random(-170, 170);
  note._customData._animation._localRotation = [
    [lRotX, lRotY, lRotZ, 0],
    [lRotX/2, lRotY/2, lRotZ/2, 0.24, "easeInCirc"],
    [0, 0, 0, 0.48, "easeOutCirc"]
  ];
});

filterednotes = _notes.filter(n => n._time >= 561 && n._time <= 567 && n._type != 3);
filterednotes.forEach(note => {
  if (note._type == 1) trackOnNotesBetween("floot", note._time, note._time);
  note._customData._disableNoteGravity = true;
  note._customData._disableNoteLook = true;
  note._customData._disableSpawnEffect = true;
  note._customData._noteJumpStartBeatOffset += 1
  if (!note._customData._animation) note._customData._animation = {};

  note._customData._animation._rotation = [
    [random(-10,10), random(-15,15), random(-5,5), 0],
    [0, 0, 0, 0.25, "easeOutQuad"]
  ];
  lRotX = random(-170, 170);
  lRotY = random(-170, 170);
  lRotZ = random(-170, 170);
  note._customData._animation._localRotation = [
    [lRotX, lRotY, lRotZ, 0],
    [lRotX/2, lRotY/2, lRotZ/2, 0.24, "easeInCirc"],
    [0, 0, 0, 0.48, "easeOutCirc"]
  ];
});

filterednotes = _notes.filter(n => n._time >= 569 && n._time <= 575 && n._type != 3);
filterednotes.forEach(note => {
  if (note._type == 1) trackOnNotesBetween("floot", note._time, note._time);
  note._customData._disableNoteGravity = true;
  note._customData._disableNoteLook = true;
  note._customData._disableSpawnEffect = true;
  note._customData._noteJumpStartBeatOffset += 1
  if (!note._customData._animation) note._customData._animation = {};

  note._customData._animation._rotation = [
    [random(-10,10), random(-15,15), random(-5,5), 0],
    [0, 0, 0, 0.25, "easeOutQuad"]
  ];
  lRotX = random(-170, 170);
  lRotY = random(-170, 170);
  lRotZ = random(-170, 170);
  note._customData._animation._localRotation = [
    [lRotX, lRotY, lRotZ, 0],
    [lRotX/2, lRotY/2, lRotZ/2, 0.24, "easeInCirc"],
    [0, 0, 0, 0.48, "easeOutCirc"]
  ];
});

filterednotes = _notes.filter(n => n._time >= 586 && n._time <= 592 && n._type != 3);
filterednotes.forEach(note => {
  if (note._type == 0) trackOnNotesBetween("floot", note._time, note._time);
  note._customData._disableNoteGravity = true;
  note._customData._disableNoteLook = true;
  note._customData._disableSpawnEffect = true;
  note._customData._noteJumpStartBeatOffset += 1
  if (!note._customData._animation) note._customData._animation = {};

  note._customData._animation._rotation = [
    [random(-10,10), random(-15,15), random(-5,5), 0],
    [0, 0, 0, 0.25, "easeOutQuad"]
  ];
  lRotX = random(-170, 170);
  lRotY = random(-170, 170);
  lRotZ = random(-170, 170);
  note._customData._animation._localRotation = [
    [lRotX, lRotY, lRotZ, 0],
    [lRotX/2, lRotY/2, lRotZ/2, 0.24, "easeInCirc"],
    [0, 0, 0, 0.48, "easeOutCirc"]
  ];
});

filterednotes = _notes.filter(n => n._time >= 594 && n._time <= 599 && n._type != 3);
filterednotes.forEach(note => {
  if (note._type == 0) trackOnNotesBetween("floot", note._time, note._time);
  note._customData._disableNoteGravity = true;
  note._customData._disableNoteLook = true;
  note._customData._disableSpawnEffect = true;
  note._customData._noteJumpStartBeatOffset += 1
  if (!note._customData._animation) note._customData._animation = {};

  note._customData._animation._rotation = [
    [random(-10,10), random(-15,15), random(-5,5), 0],
    [0, 0, 0, 0.25, "easeOutQuad"]
  ];
  lRotX = random(-170, 170);
  lRotY = random(-170, 170);
  lRotZ = random(-170, 170);
  note._customData._animation._localRotation = [
    [lRotX, lRotY, lRotZ, 0],
    [lRotX/2, lRotY/2, lRotZ/2, 0.24, "easeInCirc"],
    [0, 0, 0, 0.48, "easeOutCirc"]
  ];
});

filterednotes = _notes.filter(n => n._time >= 608 && n._time <= 611.99 && n._type != 3);
filterednotes.forEach(note => {
  if (note._type == 0) trackOnNotesBetween("floot", note._time, note._time);
  note._customData._disableNoteGravity = true;
  note._customData._disableNoteLook = true;
  note._customData._disableSpawnEffect = true;
  note._customData._noteJumpStartBeatOffset += 1
  if (!note._customData._animation) note._customData._animation = {};

  note._customData._animation._rotation = [
    [random(-10,10), random(-15,15), random(-5,5), 0],
    [0, 0, 0, 0.25, "easeOutQuad"]
  ];
  lRotX = random(-170, 170);
  lRotY = random(-170, 170);
  lRotZ = random(-170, 170);
  note._customData._animation._localRotation = [
    [lRotX, lRotY, lRotZ, 0],
    [lRotX/2, lRotY/2, lRotZ/2, 0.24, "easeInCirc"],
    [0, 0, 0, 0.48, "easeOutCirc"]
  ];
});

noteFly(264, 323.99, "flyingTrack", 1.5)
rndColorToNormal(264, 323.99, "yourMother", 1.5)

pulseRelNotes(264+(0.25/8),324,"okayMan",1,0.25, 1.25)


for (i = 264, parentRotation = 10 ; i <= 323 ; i++, parentRotation *= -1) {
  xyPos = random(-50, 50)/10;
  zPos = random(-2,2);
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "LeftPanelParent",
      _duration: 1,
      _position: [
        [(xyPos+(random(-20,20)/10))*-0.75, (xyPos+(random(-20,20)/10))*-0.75, zPos*-1, 0],
        [xyPos, xyPos, zPos, 1, "easeOutExpo"]
      ],
      _localRotation: [
        [random(-170, 170), random(-170, 170), random(-170, 170), 0],
        [random(-170, 170), random(-170, 170), random(-170, 170), 1, "easeOutCirc"]
      ]
    }
  });
  xyPos = random(-50, 50)/10;
  zPos = random(-2,2);
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "RightPanelParent",
      _duration: 1,
      _position: [
        [(xyPos+(random(-20,20)/10))*-0.75, (xyPos+(random(-20,20)/10))*-0.75, zPos*-1, 0],
        [xyPos, xyPos, zPos, 1, "easeOutExpo"]
      ],
      _localRotation: [
        [random(-170, 170), random(-170, 170), random(-170, 170), 0],
        [random(-170, 170), random(-170, 170), random(-170, 170), 1, "easeOutCirc"]
      ]
    }
  });
  xyPos = random(-30, 30)/10;
  zPos = random(5,15);
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "HUDParent",
      _duration: 1,
      _rotation: [
        [0, 0, parentRotation*-1, 0],
        [0, 0, parentRotation, 1, "easeOutExpo"]
      ],
      _position: [
        [(xyPos+(random(-20,20)/10))*-0.75, (xyPos+(random(-20,20)/10))*-0.75, 1.5+zPos, 0],
        [xyPos, xyPos, zPos, 1, "easeOutExpo"]
      ]
    }
  });
}



//for (energy = 1 ; energy <= 7 ; energy++) {
//  _customEvents.push({
//    _time: 324,
//    _type: "AnimateTrack",
//    _data: {
//      _track: `EnergyPanel${energy}`,
//      _duration: 4,
//      _position: [
//        [null, null, null, 0],
//        [0, -1, 9.1, 1, "easeInOutCubic"]
//      ],
//      _localRotation: [
//        [null, null, null, 0],
//        [0, 0, 0, 1, "easeInOutCubic"]
//      ]
//    }
//  });
//}
_customEvents.push({
  _time: 324,
  _type: "AnimateTrack",
  _data: {
    _track: "LeftPanelParent",
    _duration: 4,
    _position: [
      [-1.5, random(-2,2), random(-2,2), 0],
      [-5.12, 0, 9.1, 1, "easeInOutCubic"]
    ],
    _localRotation: [
      [random(-170, 170), random(-170, 170), random(-170, 170), 0],
      [0, 0, 0, 1, "easeInOutCubic"]
    ]
  }
}, {
  _time: 324,
  _type: "AnimateTrack",
  _data: {
    _track: "RightPanelParent",
    _duration: 4,
    _position: [
      [1.5, random(-2,2), random(-2,2), 0],
      [5.12, 0, 9.1, 1, "easeInOutCubic"]
    ],
    _localRotation: [
      [random(-170, 170), random(-170, 170), random(-170, 170), 0],
      [0, 0, 0, 1, "easeInOutCubic"]
    ]
  }
});
_customEvents.push({
  _time: 324,
  _type: "AnimateTrack",
  _data: {
    _track: "HUDParent",
    _duration: 4,
    _rotation: [
      [null, null, null, 0],
      [0, 0, 0, 1, "easeOutExpo"]
    ],
    _position: [
      [null, null, null, 0],
      [0, 1, 0, 1, "easeOutExpo"]
    ]
  }
});
//LEFTPANEL
//for (leftpanel = 1 ; leftpanel <= 4 ; leftpanel++) {
//  _customEvents.push({
//    _time: 324,
//    _type: "AnimateTrack",
//    _data: {
//      _track: `LeftPanel${leftpanel}`,
//      _duration: 1,
//      _position: [
//        [null, null, null, 0],
//        [0, 0, 9.1, 1, "easeInOutCubic"]
//      ],
//      _localRotation: [
//        [null, null, null, 0],
//        [0, 0, 0, 1, "easeInOutCubic"]
//      ]
//    }
//  });
//}
////RIGHTPANEL
//for (rightpanel = 1 ; rightpanel <= 4 ; rightpanel++) {
//  _customEvents.push({
//    _time: 324,
//    _type: "AnimateTrack",
//    _data: {
//      _track: `RightPanel${rightpanel}`,
//      _duration: 1,
//      _position: [
//        [null, null, null, 0],
//        [0, 0, 0, 1, "easeInOutCubic"]
//      ],
//      _localRotation: [
//        [null, null, null, 0],
//        [0, 0, 0, 1, "easeInOutCubic"]
//      ]
//    }
//  });
//}





_customEvents.push({
  _time: 260,
  _type: "AnimateTrack",
  _data: {
    _track: "EnvironmentParentTrack",
    _duration: 3,
    _easing: "easeInExpo",
    _position: [
      [null, null, 0, 0],
      [null, null, -500, 1]
    ],
    _scale: [
      [1, 1, 1, 0],
      [4, 1, 0.5, 1]
    ]
  }
}, {
  _time: 324,
  _type: "AnimateTrack",
  _data: {
    _track: "EnvironmentParentTrack",
    _duration: 4,
    _easing: "easeOutCirc",
    _position: [
      [null, null, -500, 0],
      [null, null, 0, 1]
    ],
    _scale: [
      [4, 1, 0.5, 0],
      [1, 1, 1, 1]
    ]
  }
}, {
  _time: 676.5,
  _type: "AnimateTrack",
  _data: {
    _track: "EnvironmentParentTrack",
    _duration: 687.5-676.5,
    _easing: "easeInExpo",
    _position: [
      [null, null, 0, 0],
      [null, null, -500, 1]
    ],
    _scale: [
      [1, 1, 1, 0],
      [4, 1, 0.5, 1]
    ]
  }
}, {
  _time: 740,
  _type: "AnimateTrack",
  _data: {
    _track: "EnvironmentParentTrack",
    _duration: 4,
    _easing: "easeOutCirc",
    _position: [
      [null, null, -500, 0],
      [null, null, 0, 1]
    ],
    _scale: [
      [4, 1, 0.5, 0],
      [1, 1, 1, 1]
    ]
  }
});
for (i = 264 ; i <= 323 ; i++) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "flyingTrack",
      _duration: 1,
      _scale: [
        [1, 1, 1, 0],
        [1.25, 1.25, 1.25, 0.125, "easeOutBack"],
        [1, 1, 1, 0.625, "easeInOutCubic"]
      ]
    }
  });
}

edgeAnimation(345, 350.49, "squareTrack", 1.5)
edgeAnimation(353, 355.99, "squareTrack", 1.5)
edgeAnimation(361, 367.99, "squareTrack", 1.5)
edgeAnimation(377, 382, "squareTrack", 1.5)
edgeAnimation(385, 387.99, "squareTrack", 1.5)
edgeAnimation(404, 407.99, "squareTrack", 1.5)


floatingPath(410.01, 470.99, "JIZZ", 1)

_customEvents.push({
  _time: 532,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 0,
    _dissolve: [
      [0,0]
    ]
  }
}, {
  _time: 535,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 1,
    _dissolve: [
      [0,0],
      [1,1,"easeOutQuad"]
    ]
  }
}, {
  _time: 536.75,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 0.25,
    _dissolve: [
      [1,0],
      [0,1]
    ]
  }
}, {
  _time: 537,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 7,
    _dissolve: [
      [0,0],
      [1,1,"easeInOutSine"]
    ]
  }
}, {
  _time: 612,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 4,
    _dissolve: [
      [0,0],
      [0.5,0.75,"easeStep"],
      [0.75,0.875,"easeStep"],
      [0.875,0.9375,"easeStep"],
      [1,1,"easeStep"]
    ]
  }
});

pulseRelNotes(552+(0.25/8), 583, "hmmmmmmmmmmmmmmm", 1, 0.25, 1.25)
pulseRelNotes(583+(0.25/8), 584, "hmmmmmmmmmmmmmmm", 2, 0.25, 1.25)
pulseRelNotes(585+(0.25/8), 600.1, "hmmmmmmmmmmmmmmm", 1, 0.25, 1.25)

chaosPath(616,622.99,"chaos",0.5,1.25,90,1.5,0.2)
pulseRelNotes(616+(0.25/8), 622.99, "chaos", 1, 0.25, 1.25)
chaosPath(632,638.99,"chaos",0.5,1.25,90,1.5,0.2)
pulseRelNotes(632+(0.25/8), 638.99, "chaos", 1, 0.25, 1.25)
trackOnNotesBetweenRBSep("yepR", "yepB", 504, 531.99, 0)
trackOnNotesBetweenRBSep("yepR", "yepB", 624, 630.99, 0)
trackOnNotesBetweenRBSep("yepR", "yepB", 640, 646.99, 0)
trackOnNotesBetweenRBSep("yepR2", "yepB2", 648, 676, 0)
_customEvents.push({
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "yepR",
    _rotation: [
      [0, 0, 90, 0],
      [0, 0, 0, 0.25, "easeOutCirc"]
    ],
    _dissolve: [
      [0, 0],
      [1, 0.125]
    ]
  }
}, {
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "yepB",
    _rotation: [
      [0, 0, -90, 0],
      [0, 0, 0, 0.25, "easeOutCirc"]
    ],
    _dissolve: [
      [0, 0],
      [1, 0.125]
    ]
  }
}, {
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "yepR2",
    _rotation: [
      [0, 0, 120, 0],
      [0, 0, 0, 0.25, "easeOutCirc"]
    ],
    _dissolve: [
      [0, 0],
      [1, 0.125]
    ]
  }
}, {
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "yepB2",
    _rotation: [
      [0, 0, -120, 0],
      [0, 0, 0, 0.25, "easeOutCirc"]
    ],
    _dissolve: [
      [0, 0],
      [1, 0.125]
    ]
  }
});

pulseRelNotes(648, 653.99, "bridge", 1.5, 0.25, 1.25)
pulseRelNotes(654, 655.99, "bridge", 1, 0.25, 1.25)
pulseRelNotes(656, 661.99, "bridge", 1.5, 0.25, 1.25)
pulseRelNotes(662, 664.99, "bridge", 1, 0.25, 1.25)

_customEvents.push({
  _time: 680,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 8,
    _dissolve: [
      [1, 0],
      [0, 0.25, "easeOutExpo"],
      [0, 0.5],
      [1, 1, "easeOutCubic"]
    ]
  }
});

noteFly(688, 739.99, "flyingTrack", 1.5)
rndColorToNormal(688, 739.99, "yourMother", 1.5)

for (i = 688, parentRotation = 10 ; i <= 739 ; i++, parentRotation *= -1) {
  //ENERGY
  //for (energy = 1 ; energy <= 7 ; energy++) {
  //  _customEvents.push({
  //    _time: i,
  //    _type: "AnimateTrack",
  //    _data: {
  //      _track: `EnergyPanel${energy}`,
  //      _duration: 1,
  //      _position: [
  //        [null, null, 10, 0],
  //        [random(-50, 50)/10, random(-50, 50)/10, random(5,10), 1, "easeOutExpo"]
  //      ],
  //      _localRotation: [
  //        [null, null, null, 0],
  //        [random(-170, 170), random(-170, 170), random(-170, 170), 1, "easeOutCirc"]
  //      ]
  //    }
  //  });
  //}
  //LEFTPANEL
  //for (leftpanel = 1 ; leftpanel <= 4 ; leftpanel++) {
  //  _customEvents.push({
  //    _time: i,
  //    _type: "AnimateTrack",
  //    _data: {
  //      _track: `LeftPanel${leftpanel}`,
  //      _duration: 1,
  //      _position: [
  //        [null, null, 10, 0],
  //        [random(-50, 50)/10, random(-50, 50)/10, random(5,10), 1, "easeOutExpo"]
  //      ],
  //      _localRotation: [
  //        [null, null, null, 0],
  //        [random(-170, 170), random(-170, 170), random(-170, 170), 1, "easeOutCirc"]
  //      ]
  //    }
  //  });
  //}
  //RIGHTPANEL
  //for (rightpanel = 1 ; rightpanel <= 4 ; rightpanel++) {
  //  _customEvents.push({
  //    _time: i,
  //    _type: "AnimateTrack",
  //    _data: {
  //      _track: `RightPanel${rightpanel}`,
  //      _duration: 1,
  //      _position: [
  //        [null, null, null, 0],
  //        [random(-50, 50)/10, random(-50, 50)/10, random(5,10), 1, "easeOutExpo"]
  //      ],
  //      _localRotation: [
  //        [null, null, null, 0],
  //        [random(-170, 170), random(-170, 170), random(-170, 170), 1, "easeOutCirc"]
  //      ]
  //    }
  //  });
  //}
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "LeftPanelParent",
      _duration: 1,
      _position: [
        [null, null, 10, 0],
        [random(-50, 50)/10, random(-50, 50)/10, random(5,10), 1, "easeOutExpo"]
      ],
      _localRotation: [
        [null, null, null, 0],
        [random(-170, 170), random(-170, 170), random(-170, 170), 1, "easeOutCirc"]
      ]
    }
  });
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "RightPanelParent",
      _duration: 1,
      _position: [
        [null, null, 10, 0],
        [random(-50, 50)/10, random(-50, 50)/10, random(5,10), 1, "easeOutExpo"]
      ],
      _localRotation: [
        [null, null, null, 0],
        [random(-170, 170), random(-170, 170), random(-170, 170), 1, "easeOutCirc"]
      ]
    }
  });
  _customEvents.push({
    _time: i,
    _type: "AnimateTrack",
    _data: {
      _track: "HUDParent",
      _duration: 1,
      _rotation: [
        [null, null, null, 0],
        [null, null, parentRotation, 1, "easeOutExpo"]
      ],
      _position: [
        [null, null, null, 0],
        [random(-30, 30)/10, random(-30, 30)/10, random(2,6), 1, "easeOutExpo"]
      ]
    }
  });
}
_customEvents.push({
  _time: 740,
  _type: "AnimateTrack",
  _data: {
    _track: "LeftPanelParent",
    _duration: 4,
    _position: [
      [-1.5, random(-2,2), random(-2,2), 0],
      [-5.12, 0, 9.1, 1, "easeInOutCubic"]
    ],
    _localRotation: [
      [random(-170, 170), random(-170, 170), random(-170, 170), 0],
      [0, 0, 0, 1, "easeInOutCubic"]
    ]
  }
}, {
  _time: 740,
  _type: "AnimateTrack",
  _data: {
    _track: "RightPanelParent",
    _duration: 4,
    _position: [
      [1.5, random(-2,2), random(-2,2), 0],
      [5.12, 0, 9.1, 1, "easeInOutCubic"]
    ],
    _localRotation: [
      [random(-170, 170), random(-170, 170), random(-170, 170), 0],
      [0, 0, 0, 1, "easeInOutCubic"]
    ]
  }
});
_customEvents.push({
  _time: 740,
  _type: "AnimateTrack",
  _data: {
    _track: "HUDParent",
    _duration: 4,
    _rotation: [
      [null, null, null, 0],
      [0, 0, 0, 1, "easeOutExpo"]
    ],
    _position: [
      [null, null, null, 0],
      [0, 1, 0, 1, "easeOutExpo"]
    ]
  }
});
for (i = 688 ; i <= 739.99 ; i++) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "flyingTrack",
      _duration: 1,
      _scale: [
        [1, 1, 1, 0],
        [1.25, 1.25, 1.25, 0.125, "easeOutBack"],
        [1, 1, 1, 0.625, "easeInOutCubic"]
      ]
    }
  });
}




trackOnNotesBetween("endSpiral", 777, 798)
_customEvents.push({
  _time: 777.5,
  _type: "AnimateTrack",
  _data: {
    _track: "endSpiral",
    _duration: 20,
    _dissolve: [
      [1, 0],
      [0, 1]
    ]
  }
});





const EnvironmentTracks = ["TrackConstruction", "TrackMirror", "BottomCones", "TopCones", "NeonTube1", "NeonTube2"];

for (i = 1 ; i <= 30 ; i++) {
  _environment.push(
    { _id: `\\[${i}\\]Panels\\w+Ring\\(Clone\\)$`, _lookupMethod: "Regex", _scale: [1,4,6], _track: `Ring${i}`}
  );
  EnvironmentTracks.push(
    `Ring${i}`
  );
}

for (i = 19, number = 1 ; i <= 24 ; i++, number++) {
  _environment.push(
    { _id: `\\[${i}\\]ConstructionGlowLine \\(\\d+\\)$`, _lookupMethod: "Regex", _track: `ConstructionGlow${number}`}
  );
  EnvironmentTracks.push(
    `ConstructionGlow${number}`
  );
}

for (i = 1, distance = 14.76; i <= 20 ; i++, distance += 2) {
  _environment.push(
    { _id: "RotatingLasersPair\\..*BaseL.*Laser$", _lookupMethod: "Regex", _duplicate: 1, _track: `ConstructionLasersL${i}`, _lightId: i+9, _rotation: [0, 0, 20], _scale: [0.7, 0.005, 0.7], _localPosition: [-2.54, 1.9, distance]},
    { _id: "RotatingLasersPair\\..*BaseR.*Laser$", _lookupMethod: "Regex", _duplicate: 1, _track: `ConstructionLasersR${i}`, _lightId: i+9, _rotation: [0, 0, -20], _scale: [0.7, 0.005, 0.7], _localPosition: [2.54, 1.9, distance]},   
  );
  EnvironmentTracks.push(
    `ConstructionLasersL${i}`,
    `ConstructionLasersR${i}`
  );
}

_environment.push(
  { _id: "Spectro", _lookupMethod: "Regex", _active: false},
  { _id: "TrackConstruction", _lookupMethod: "Regex", _track: "TrackConstruction"},
  { _id: "TrackMirror$", _lookupMethod: "Regex", _track: "TrackMirror"},
  { _id: "TopCones", _lookupMethod: "Regex", _track: "TopCones"},
  { _id: "BottomCones", _lookupMethod: "Regex", _track: "BottomCones"},
  { _id: "Window", _lookupMethod: "Regex", _scale: [5, 5, 5 ], _active: false},
  { _id: "NeonTube$", _lookupMethod: "Regex", _track: "NeonTube1"},
  { _id: "NeonTube \\(1\\)$", _lookupMethod: "Regex", _track: "NeonTube2"},
  { _id: "HUD", _lookupMethod: "Regex", _active: true},
  { _id: "EnergyPanel\\.\\[[5,6]\\]", _lookupMethod: "Regex", _active: false}
);


//#region HUD STUFF

//energypanel

//const EnergyTracks = [];
//
//for (i = 0 ; i <= 6 ; i++) {
//  _environment.push(
//    { _id: `EnergyPanel\\.\\[${i}\\]\\w+$`, _lookupMethod: "Regex", _active: true, _track: `EnergyPanel${(i+1)}`}
//  );
//  EnergyTracks.push(
//    `EnergyPanel${(i+1)}`
//  );
//}
//_customEvents.push({
//  _time: 0,
//  _type: "AssignTrackParent",
//  _data: {
//    _childrenTracks: EnergyTracks,
//    _parentTrack: "EnergyPanelParent"
//  }
//});


//leftpanel

const LeftPanelTracks = [];

for (i = 0 ; i <= 3 ; i++) {
  _environment.push(
    { _id: `LeftPanel\\.\\[${i}\\]\\w+$`, _lookupMethod: "Regex", _active: true, _track: `LeftPanel${(i+1)}`}
  );
  LeftPanelTracks.push(
    `LeftPanel${(i+1)}`
  );
}
_customEvents.push({
  _time: 0,
  _type: "AssignTrackParent",
  _data: {
    _childrenTracks: LeftPanelTracks,
    _parentTrack: "LeftPanelParent"
  }
});



//rightpanel

const RightPanelTracks = [];

for (i = 0 ; i <= 3 ; i++) {
  _environment.push(
    { _id: `RightPanel\\.\\[${i}\\]\\w+$`, _lookupMethod: "Regex", _active:true, _track: `RightPanel${(i+1)}`}
  );
  RightPanelTracks.push(
    `RightPanel${(i+1)}`
  );
}
_customEvents.push({
  _time: 0,
  _type: "AssignTrackParent",
  _data: {
    _childrenTracks: RightPanelTracks,
    _parentTrack: "RightPanelParent"
  }
});



//hud

_customEvents.push({
  _time: 0,
  _type: "AssignTrackParent",
  _data: {
    _childrenTracks: ["LeftPanelParent", "RightPanelParent"],
    _parentTrack: "HUDParent"
  }
});


//#endregion

_customEvents.push({
  _time: 0,
  _type: "AssignTrackParent",
  _data: {
    _childrenTracks: EnvironmentTracks,
    _parentTrack: "EnvironmentParentTrack"
  }
});

//#endregion                     -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  STOP  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -



//AVOID VISION BLOCKS WITH NOTE MOVEMENT

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
