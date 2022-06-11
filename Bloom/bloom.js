
const fs = require("fs");

const INPUT = __dirname+"\\HardStandard.dat";
const OUTPUT = __dirname+"\\HardLawless.dat";

let difficulty = JSON.parse(fs.readFileSync(INPUT));



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
    wall._noteJumpMovementSpeed = 16;
    wall._noteJumpStartBeatOffset = 0;
  }
});

_notes.forEach(note => {
  if (!note._customData) {
    note._customData = {};
    note._noteJumpMovementSpeed = 16;
    note._noteJumpStartBeatOffset = 0;
  }
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

function noteTrack(track, p1, p2, potentialOffset) {
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

function random(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

function floatingPath(Start, End, assignTrack, offset, posx, posx2, posy, posy2) {
  
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {

    let xpos = (random(posx,posx2) * 0.1);
    let ypos = (random(posy,posy2) * 0.1);

    let xrot = posy * -1;
    let yrot = posx / 2;

    if (!note._customData._animation) note._customData._animation = {};

    note._customData._disableNoteLook = true;
    note._customData._noteJumpStartBeatOffset = offset;
    note._customData._track = assignTrack;
    //note._customData._easing = "easeOutCirc";
    note._customData._animation._position = [
      [(random(posx,posx2) * 0.1), (random(posy,posy2) * 0.1), 0, 0],
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

function movePattern(Start, End, assignTrack) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {
    data = note._customData;
    floorTime = Math.floor(note._time);
    track = `${assignTrack+note._time}`;
    rotationX = random(-50, 50);
    rotationY = random(-50, 50);
    rotationZ = random(-50, 50);
    xPos = random(-50, 50)/10;
    yPos = random(-50, 50)/10;
    if (!data._animation) data._animation = {};

    data._track = track;
    data._disableNoteLook = true;
    data._disableSpawnEffect = true;
    data._disableNoteGravity = true;
    data._noteJumpStartBeatOffset = 2;
    anim = data._animation;
    anim._dissolve = "appearDis";
    anim._dissolveArrow = "appearDis";
    anim._scale = "assembleSca";

    _customEvents.push({
      _time: floorTime-5,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: 4,
        _dissolve: "assembleDis",
        _dissolveArrow: "assembleDis",
        _position: [
          [xPos, yPos, -15, 0],
          [xPos+(xPos/4), yPos+(yPos/4), -15, 0.75, "easeOutQuad"],
          [random(-2.5, 2.5), random(-5, 5), 0, 0.875, "easeInCirc", "splineCatmullRom"],
          [0, 0, 0, 1, "easeOutCirc", "splineCatmullRom"]
        ],
        _rotation: "assembleRot",
        _localRotation: [
          [rotationX, rotationY, rotationZ, 0],
          [rotationX, rotationY, rotationZ, 0.875],
          [0, 0, 0, 1, "easeInOutSine"]
        ]
      }
    })
  });
}

function arrowScatterTrail(start, end, density, length, scatterAmp, distance, offset, track) {
  filterednotes = _notes.filter(n => n._time >= start && n._time < end);
  filterednotes.forEach(note => {
    defPosX = random(-5, 5);
    defPosY = random(-15, 15);
    for (i = 0 ; i <= length ; i += density) {
      n1 = JSON.parse(JSON.stringify(note));
      data = n1._customData;
      if (!data._animation) data._animation = {};
      anim = n1._customData._animation;
      n1._time += i;

      data._fake = true;
      data._interactable = false;
      data._noteJumpStartBeatOffset = offset;
      data._disableNoteGravity = true;
      data._disableNoteLook = true;
      data._disableSpawnEffect = true;
      if (Array.isArray(data._track)) {
        const tracks = data._track;
        tracks.push(track)
        data._track = tracks;
      } else {
        data._track = [data._track, track];
      }

      anim._definitePosition = [
        [n1._lineIndex-2, n1._lineLayer, 0, 0],
        [n1._lineIndex-2, n1._lineLayer, 0, 0.5],
        [defPosX, defPosY, distance, 1, "easeOutQuad"]
      ];
      anim._rotation = [
        [0, 0, 0, 0.5],
        [random(-100, 100)*scatterAmp, random(-100, 100)*scatterAmp, random(-160, 160)*scatterAmp, 1, "easeInOutQuad"]
      ];
      anim._scale = [
        [1, 1, 1, 0.5],
        [4, 4, 4, 1, "easeInOutQuad"]
      ];
      anim._dissolve = [
        [0, 0],
        [random(0, 100)/300, 0.5, "easeStep"],
        [0, 1, "easeOutQuart"]
      ];
      anim._dissolveArrow = [
        [0, 0],
        [0.9, 0.5, "easeStep"],
        [0.9, 0.875],
        [0, 1, "easeOutQuart"]
      ];
      _notes.push(n1);
    }
  });
}

function downToUp(start, end, offset) {
  filterednotes = _notes.filter(n => n._time >= start && n._time <= end);
  filterednotes.forEach(note => {
    data = note._customData;
    if (!data._animation) data._animation = {};
    anim = data._animation;

    data._noteJumpStartBeatOffset = offset;
    data._disableNoteGravity = true;
    data._disableSpawnEffect = true;
    data._disableNoteLook = true;

    anim._dissolve = "dissolveIn";
    anim._dissolveArrow = "appearDis";
    anim._position = [
      [random(-2, 2), -10, 0, 0],
      [0, 0, 0, 0.45, "easeOutCirc"]
    ];
    if (note._type === 0) {
      anim._rotation = [
        [0, 0, -150, 0],
        [0, 0, 0, 0.45, "easeOutCirc"]
      ];
    } else {
      anim._rotation = [
        [0, 0, 150, 0],
        [0, 0, 0, 0.45, "easeOutCirc"]
      ]
    }
  });
}

//#region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -

_pointDefinitions.push({
  _name: "dissolveIn",
  _points: [
    [0, 0],
    [1, 0.6]
  ]
}, {
  _name: "appearDis",
  _points: [
    [0, 0],
    [1, 0.125, "easeOutExpo"]
  ]
}, {
  _name: "assembleSca",
  _points: [
    [1.1, 1.1, 1.1, 0],
    [1.1, 1.1, 1.1, 0.0625],
    [2.5, 1, 1, 0.125, "easeInOutCirc"],
    [1, 1, 1, 0.25]
  ]
}, {
  _name: "assembleDis",
  _points: [
    [0, 0],
    [0.5, 0.75, "easeOutQuad"],
    [1, 0.875, "easeInOutCubic"]
  ]
}, {
  _name: "assembleRot",
  _points: [
    [0, 0, 0, 0.25],
    [-10, 0, 0, 0.5, "easeInOutCubic"],
    [0, 0, 0, 1, "easeInOutCubic"]
  ]
});

noteTrack("introFreeze", 0, 8.25, 10)
_customEvents.push({
  _time: 0.125,
  _type: "AnimateTrack",
  _data: {
    _track: "introFreeze",
    _duration: 8,
    _position: [
      [0, 0, -88, 0],
      [0, 0, 0, 0.875]
    ],
    _dissolve: [
      [0.5, 0],
      [1, 0.875, "easeStep"]
    ]
  }
});

floatingPath(296, 303, "floatThingTrackIGuess", 1, -25, 25, -7, 30)

downToUp(8.5, 103.9, 1.5)
downToUp(170, 295.5, 1.5)
downToUp(360, 420, 1.5)
filterednotes = _notes.filter(n => n._time == 392);
filterednotes.forEach(note => {
  n1 = JSON.parse(JSON.stringify(note));
  data = n1._customData;
  if (!data._animation) data._animation = {};
  data._disableNoteGravity = true;
  data._disableNoteLook = true;
  data._disableSpawnEffect = true;
  data._noteJumpStartBeatOffset = 2;
  data._fake = true;
  data._interactable = false;

  anim = data._animation;
  anim._localRotation = [
    [0, 0, 0, 0.5],
    [random(-75, 75), random(-75, 75), random(-75, 75), 1, "easeInOutQuart"]
  ];
  anim._dissolve = [
    [0, 0],
    [1, 0.5, "easeStep"],
    [0, 1, "easeOutQuad"]
  ];
  anim._dissolveArrow = [
    [0, 0],
    [1, 0.5, "easeStep"],
    [0, 1, "easeOutQuad"]
  ];
  realX = n1._lineIndex-2;
  realY = n1._lineLayer;
  anim._definitePosition = [
    [realX, realY, 0, 0],
    [realX, realY, 0, 0.5],
    [realX, realY, 10, 0.75, "splineCatmullRom"],
    [realX+random(-4, 4), realY+10, 10, 1, "splineCatmullRom"]
  ];
  _notes.push(n1)
})

/* for (i = 42, t = 1 ; i <= 69.9 ; i += 4, t++) {
  noteTrack(`pogJump${t}`, i, i+4, 0.5)
  _customEvents.push({
    _time: i,
    _type: "AssignPathAnimation",
    _data: {
      _track: `pogJump${t}`,
      _position: [
        [0, 0, 0, 0],
        [0, 3, 0, 0.125, "easeInOutCirc"],
        [0, 0, 0, 0.25, "easeOutBack"]
      ],
      _scale: [
        [1,1,1,0],
        [1,1.5,1,0.0625,"easeInCirc"],
        [1,1,1,0.125,"easeOutCirc"],
        [1,1.5,1,0.1875,"easeInSine"],
        [1,1,1,0.25,"easeOutBack"]
      ]
    }
  });
} */

for(i = 72 ; i <= 86 ; i+=2) {
  scaleOnNote(i, i+0.01, "YEPtheyDoScale", 2)
}
for(i = 88 ; i <= 95 ; i++) {
  scaleOnNote(i, i+0.01, "YEPtheyDoScale", 2)
}
for(i = 96 ; i <= 99.5 ; i+=0.5) {
  scaleOnNote(i, i+0.01, "YEPtheyDoScale", 2)
}
scaleOnNote(70, 71.5, "YEPtheyDoScale", 2)
noteTrack("YEPtheyDoScale", 72, 101)
noteTrack("buildupTrack", 72, 101)


/* arrowScatterTrail(i, i+1.9, 0.125, 0.5, 0.5, 100, 4)
arrowScatterTrail(i+3, i+5.9, 0.125, 0.5, 0.5, 100, 4)
arrowScatterTrail(i+8, i+9.9, 0.125, 0.5, 0.5, 100, 4)
arrowScatterTrail(i+11, i+12.9, 0.125, 0.5, 0.5, 100, 4)
arrowScatterTrail(i+14, i+14.9, 0.125, 0.5, 0.5, 100, 4) */



movePattern(105, 135, "funnyMove")
movePattern(139, 167, "funnyMove")
filterednotes = _notes.filter(n => n._time >= 136 && n._time < 139);
filterednotes.forEach(note => {
  data = note._customData;
  if (!data._animation) data._animation = {};
  anim = data._animation;

  data._disableNoteLook = true;
  data._disableNoteGravity = true;
  data._disableSpawnEffect = true;
  data._noteJumpStartBeatOffset = 2;
  
  anim._position = [
    [random(-7, 7), random(-15, 5), 0, 0],
    [0, 0, 0, 0.45, "easeOutCirc"]
  ];
  anim._rotation = [
    [random(-10, 10), random(-10, 10), random(-150, 150), 0],
    [0, 0, 0, 0.45, "easeOutCirc"]
  ];
});

movePattern(306, 359, "funnyMove")




noteTrack("globalTrack", 0, 900)
_customEvents.push({
  _time: 0,
  _type: "AssignTrackParent",
  _data: {
    _childrenTracks: ["HUDTrack"],
    _parentTrack: "globalTrack"
  }
}, {
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "doors",
    _duration: 0,
    _position: [
      [0, 50, 150, 0]
    ]
  }
}, {
  _time: 0,
  _type: "AssignFogTrack",
  _data: {
    _track: "fog"
  }
}, {
  _time: 7,
  _type: "AnimateTrack",
  _data: {
    _track: "fog",
    _duration: 0,
    _startY: [
      [-3.75, 0]
    ]
  }
}, {
  _time: 104,
  _type: "AnimateTrack",
  _data: {
    _track: "fog",
    _duration: 0,
    _startY: [
      [-500, 0]
    ]
  }
}, {
  _time: 168,
  _type: "AnimateTrack",
  _data: {
    _track: "fog",
    _duration: 0,
    _startY: [
      [-3.75, 0]
    ]
  }
}, {
  _time: 304,
  _type: "AnimateTrack",
  _data: {
    _track: "fog",
    _duration: 0,
    _startY: [
      [-500, 0]
    ]
  }
}, {
  _time: 359,
  _type: "AnimateTrack",
  _data: {
    _track: "fog",
    _duration: 0,
    _startY: [
      [-3.75, 0]
    ]
  }
}, {
  _time: 0,
  _type: "AssignPlayerToTrack",
  _data: {
    _track: "globalTrack"
  }
}, {
  _time: 104,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 0,
    _position: [
      [0, 50, 0, 0]
    ]
  }
}, {
  _time: 104,
  _type: "AnimateTrack",
  _data: {
    _track: "doors",
    _duration: 0,
    _position: [
      [0, 200, 150, 0]
    ]
  }
}, {
  _time: 168,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 0,
    _position: [
      [0, 0, 0, 0]
    ]
  }
}, {
  _time: 168,
  _type: "AnimateTrack",
  _data: {
    _track: "doors",
    _duration: 0,
    _position: [
      [0, 50, 150, 0]
    ]
  }
}, {
  _time: 296,
  _type: "AnimateTrack",
  _data: {
    _track: "doors",
    _duration: 0,
    _position: [
      [0, 200, 150, 0]
    ]
  }
}, {
  _time: 296,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 8,
    _position: [
      [0, 0, 0, 0],
      [0, 10, 0, 0.5, "easeInSine"],
      [0, 50, 0, 1, "easeStep"]
    ]
  }
}, {
  _time: 359,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 0,
    _position: [
      [0, 0, 0, 0],
    ]
  }
}, {
  _time: 359,
  _type: "AnimateTrack",
  _data: {
    _track: "doors",
    _duration: 0,
    _position: [
      [0, 50, 150, 0]
    ]
  }
}, {
  _time: 392,
  _type: "AnimateTrack",
  _data: {
    _track: "fog",
    _duration: 0,
    _startY: [
      [-1000, 0]
    ],
    _height: [
      [0, 0]
    ],
    _offset: [
      [-1000, 0]
    ]
  }
}, {
  _time: 359,
  _type: "AnimateTrack",
  _data: {
    _track: "scatteringArrow",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 0, "easeOutExpo"]
    ],
    _dissolveArrow: [
      [1, 0],
      [0, 0, "easeOutExpo"]
    ]
  }
});




const dissolve = [];
const dissolveArrow = [];
for (j = 0 ; j <= 1 ; j += 1/32) {
  dissolve.push([random(0,10)/800,j]);
  dissolveArrow.push([random(0,10)/500,j]);
}
_pointDefinitions.push({
  _name: "varDis",
  _points: dissolve
}, {
  _name: "varDisArr",
  _points: dissolveArrow
});

/* for (i = 4.01 ; i <= 72 ; i+=0.25) {
  const shade = random(-2, 2);
  const rot = random(-360, 360);
  let note = new Note(i, 0, 0, 0, 8, {
    _track: "aserdgadsfg",
    _color: [shade, shade, shade, random(-3, 3)],
    _localRotation: [0, 0, random(-180, 180)],
    _rotation: [0, 0, random(-180, 180)],
    _fake: true,
    _interactable: false,
    _noteJumpStartBeatOffset: 4,
    _disableNoteGravity: true,
    _disableNoteLook: true,
    _disableSpawnEffect: true,
    _animation: {
      _scale: [
        [random(20,50), random(20,50), random(20,50), 0]
      ],
      _localRotation: [
        [0, 0, rot, 0],
        [0, 0, rot*0.75, 0.125],
        [0, 0, rot*0.50, 0.25],
        [0, 0, rot*0.25, 0.375],
        [0, 0, 0, 0.5],
        [0, 0, -rot*0.25, 0.625],
        [0, 0, -rot*0.50, 0.75],
        [0, 0, -rot*0.75, 0.875],
        [0, 0, -rot, 1]
      ],
      _rotation: [
        [0, 0, rot, 0],
        [0, 0, rot*0.75, 0.125],
        [0, 0, rot*0.50, 0.25],
        [0, 0, rot*0.25, 0.375],
        [0, 0, 0, 0.5],
        [0, 0, -rot*0.25, 0.625],
        [0, 0, -rot*0.50, 0.75],
        [0, 0, -rot*0.75, 0.875],
        [0, 0, -rot, 1]
      ],
      _definitePosition: [
        [random(-2, 2), random(-2, 2), random(2, 30), 0],
        [random(-2, 2), random(-2, 2), random(2, 30), 1]
      ],
      _dissolve: "varDis",
      _dissolveArrow: "varDisArr"
    }
  });
  _notes.push(note);
} */

_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "aserdgadsfg",
    _duration: 7,
    _dissolve: [
      [0, 0],
      [1, 1, "easeStep"]
    ],
    _dissolveArrow: [
      [0, 0],
      [1, 1, "easeStep"]
    ]
  }
}, {
  _time: 72,
  _type: "AnimateTrack",
  _data: {
    _track: "aserdgadsfg",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 1]
    ],
    _dissolveArrow: [
      [1, 0],
      [0, 1]
    ]
  }
})

arrowScatterTrail(104, 105.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(107, 109.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(112, 113.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(115, 116.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(118, 118.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")

arrowScatterTrail(120, 121.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(123, 125.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(128, 129.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(131, 133.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")

arrowScatterTrail(139, 141.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(144, 145.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(147, 148.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(150, 150.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")

arrowScatterTrail(152, 153.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(155, 157.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(160, 161.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(163, 165.9, 0.125, 0.25, 1, 100, 2, "scatteringArrow")



arrowScatterTrail(304, 305.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(307, 307.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(309, 310.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(312, 314.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(317, 321.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(323, 323.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(325, 326.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(328, 331.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(333, 337.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(339, 339.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(341, 342.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(344, 347.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(349, 353.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(355, 355.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")
arrowScatterTrail(357, 358.9, 0.125, 0.5, 1, 100, 2, "scatteringArrow")


/* for (i = 104 ; i <= 150 ; i += 16) {
  arrowScatterTrail(i, i+1.9, 0.125, 0.5, 0.5, 100, 4)
  arrowScatterTrail(i+3, i+5.9, 0.125, 0.5, 0.5, 100, 4)
  arrowScatterTrail(i+8, i+9.9, 0.125, 0.5, 0.5, 100, 4)
  arrowScatterTrail(i+11, i+12.9, 0.125, 0.5, 0.5, 100, 4)
  arrowScatterTrail(i+14, i+14.9, 0.125, 0.5, 0.5, 100, 4)
} */


_environment.push(
  { _id: "Pillar", _lookupMethod: "Regex", _active: false},
  { _id: "HighClouds\\w+$", _lookupMethod: "Regex", _active: false, _track: "Clouds1", _position: [0, 70, 0], _scale: [0.5, 0.5, 0.5]},
  { _id: "HighClouds\\w+$", _lookupMethod: "Regex", _active: false, _track: "Clouds2", _position: [0, 65, 0], _scale: [0.5, 0.5, 0.5], _duplicate: 1, _rotation: [0, 45, 0]},
  { _id: "LowClouds\\w+$", _lookupMethod: "Regex", _active: false},
  { _id: "PlayersPlace$", _lookupMethod: "Regex", _track: "globalTrack"},
  { _id: "HUD$", _lookupMethod: "Regex", _track: "HUDTrack"},
  { _id: "MagicDoorSprite$", _lookupMethod: "Regex", _scale: [0.001, 0.001, 0.001]},
  { _id: "MagicDoorSprite.+Bloom\\w$", _lookupMethod: "Regex", _scale: [1000, 1000, 1000], _track: "doors"},
  { _id: "TrackMirror", _lookupMethod: "Regex", _active: false},
  { _id: "Construction", _lookupMethod: "Regex", _active: false},
  { _id: "BottomGlow", _lookupMethod: "Regex", _active: false},
  { _id: "SideLaser$", _lookupMethod: "Regex", _scale: [100, 100, 100]}
)






//#endregion
//#region wall mapping


//pointdefs
const dissolveDefinition = [[0, 0]];
for (i = 1/32 ; i <= 1-(1/32) ; i += 1/32) {
  dissolveDefinition.push([random(300, 450)/500, i]);
}
dissolveDefinition.push([0, 1]);
const colorDefinition1 = [];
for (i = 0 ; i <= 1 ; i += 0.0625) {
  let colorValue = random(-1,5)
  colorDefinition1.push([colorValue, colorValue, colorValue, random(-3, 5), i])
}
const colorDefinition2 = [];
for (i = 0 ; i <= 1 ; i += 1/8) {
  let colorValue = random(5,20)/10
  colorDefinition2.push([colorValue, colorValue, colorValue, random(-5, 15)/10, i])
}
_pointDefinitions.push({
  _name: "flickerDis",
  _points: dissolveDefinition
}, {
  _name: "flickerCol",
  _points: colorDefinition1
}, {
  _name: "flickerCol2",
  _points: colorDefinition2
});


//stars

for (i = 4 ; i <= 101 ; i += 0.25) {
  const rotX = random(-180, 180);
  const rotY = random(-180, 180);
  const rotZ = random(-180, 180);
  let wall = new Wall(i, 8, {
    _track: "particleTrack",
    _scale: [0.1/6, 0.1/6, 0.1/6],
    _color: [1.5, 1.5, 1.5, 2.5],
    _rotation: [random(-180, 180), random(-180, 180), random(-180, 180)],
    _interactable: false,
    _fake: true,
    _animation: {
      _scale: [[3, 3, 3, 0]],
      _definitePosition: [
        [random(-3, 3), random(5, 15), random(10, 20), 0],
        [random(-3, 3), random(5, 15), random(10, 20), 1, "easeInOutQuad"]
      ],
      _rotation: [
        [rotX, rotY, rotZ, 0],
        [rotX*0.75, rotY*0.75, rotZ*0.75, 0.25],
        [rotX*0.5, rotY*0.5, rotZ*0.5, 0.5],
        [rotX*0.25, rotY*0.25, rotZ*0.25, 0.75],
        [0, 0, 0, 1]
      ],
      _dissolve: "flickerDis",
      _color: "flickerCol"
    }
  });
  _obstacles.push(wall)
}

for (i = 167 ; i <= 295 ; i += 0.25) {
  const rotX = random(-180, 180);
  const rotY = random(-180, 180);
  const rotZ = random(-180, 180);
  let wall = new Wall(i, 8, {
    _track: "particleTrack",
    _scale: [0.1/6, 0.1/6, 0.1/6],
    _color: [1.5, 1.5, 1.5, 2.5],
    _rotation: [random(-180, 180), random(-180, 180), random(-180, 180)],
    _interactable: false,
    _fake: true,
    _animation: {
      _scale: [[3, 3, 3, 0]],
      _definitePosition: [
        [random(-3, 3), random(5, 15), random(10, 20), 0],
        [random(-3, 3), random(5, 15), random(10, 20), 1, "easeInOutQuad"]
      ],
      _rotation: [
        [rotX, rotY, rotZ, 0],
        [rotX*0.75, rotY*0.75, rotZ*0.75, 0.25],
        [rotX*0.5, rotY*0.5, rotZ*0.5, 0.5],
        [rotX*0.25, rotY*0.25, rotZ*0.25, 0.75],
        [0, 0, 0, 1]
      ],
      _dissolve: "flickerDis",
      _color: "flickerCol"
    }
  });
  _obstacles.push(wall)
}

for (i = 358 ; i <= 295 ; i += 0.25) {
  const rotX = random(-180, 180);
  const rotY = random(-180, 180);
  const rotZ = random(-180, 180);
  let wall = new Wall(i, 8, {
    _track: "particleTrack",
    _scale: [0.1/6, 0.1/6, 0.1/6],
    _color: [1.5, 1.5, 1.5, 2.5],
    _rotation: [random(-180, 180), random(-180, 180), random(-180, 180)],
    _interactable: false,
    _fake: true,
    _animation: {
      _scale: [[3, 3, 3, 0]],
      _definitePosition: [
        [random(-3, 3), random(5, 15), random(10, 20), 0],
        [random(-3, 3), random(5, 15), random(10, 20), 1, "easeInOutQuad"]
      ],
      _rotation: [
        [rotX, rotY, rotZ, 0],
        [rotX*0.75, rotY*0.75, rotZ*0.75, 0.25],
        [rotX*0.5, rotY*0.5, rotZ*0.5, 0.5],
        [rotX*0.25, rotY*0.25, rotZ*0.25, 0.75],
        [0, 0, 0, 1]
      ],
      _dissolve: "flickerDis",
      _color: "flickerCol"
    }
  });
  _obstacles.push(wall)
}

_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "particleTrack",
    _duration: 0,
    _dissolve: [[0,0]]
  }
}, {
  _time: 7,
  _type: "AnimateTrack",
  _data: {
    _track: "particleTrack",
    _duration: 1,
    _dissolve: [
      [0, 0],
      [1, 1, "easeOutCirc"]
    ]
  }
}, {
  _time: 103,
  _type: "AnimateTrack",
  _data: {
    _track: "particleTrack",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 1, "easeInOutCubic"]
    ]
  }
}, {
  _time: 168,
  _type: "AnimateTrack",
  _data: {
    _track: "particleTrack",
    _duration: 1,
    _dissolve: [
      [0, 0],
      [1, 1, "easeOutCirc"]
    ]
  }
}, {
  _time: 295,
  _type: "AnimateTrack",
  _data: {
    _track: "particleTrack",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 1, "easeInOutCubic"]
    ]
  }
}, {
  _time: 359,
  _type: "AnimateTrack",
  _data: {
    _track: "particleTrack",
    _duration: 1,
    _dissolve: [
      [0, 0],
      [1, 1, "easeOutCirc"]
    ]
  }
});


// BEEEEEG PEEELLAAAAAAAAR

for (i = 96 ; i <= 168 ; i ++) {
  for (j = 1, mult = 1 ; j <= 2 ; j++, mult *= -1) {
    const wallColor = HSVtoRGB(random(0,100)/100, 1, 1.25);
    const defX = random(-40, -30);
    const defY = random(-200, -150);
    let wall = new Wall(i, 16, {
      _color: [...wallColor, -69],
      _track: "sideWalls",
      _scale: [2, 1000, 2],
      _interactable: false,
      _fake: true,
      _animation: {
        _color: "flickerCol2",
        _definitePosition: [
          [defX*mult, defY, 200, 0],
          [(defX-20)*mult, defY, 90, 0.5, "splineCatmullRom"],
          [(defX-100)*mult, defY, -20, 1, "splineCatmullRom"]
        ],
        _dissolve: [
          [random(2, 10)/10, 0],
          [random(2, 10)/10, 1]
        ],
        _localRotation: [
          [random(-10, 10), random(-10, 10), random(-90, 90), 0],
          [random(-10, 10), random(-10, 10), random(-90, 90), 0.56, "easeInOutQuad"],
          [0, 0, 0, 0.8, "easeInOutQuad"]
        ]
      }
    });
    _obstacles.push(wall)
  }
}
for (i = 280 ; i <= 359 ; i ++) {
  for (j = 1, mult = 1 ; j <= 2 ; j++, mult *= -1) {
    const wallColor = HSVtoRGB(random(25,75)/100, 1, 1.25);
    const defX = random(40, 30);
    const defY = random(-200, -150);
    const thicc = random(1, 30);
    const width = random(1,5);
    let wallCol = [...wallColor];
    wallCol[0] *= 1.6;
    wallCol[1] *= 1.6;
    wallCol[2] *= 1.2;
    let wall = new Wall(i, 16, {
      _color: [...wallColor, -69],
      _track: "sideWalls",
      _scale: [width/thicc, 1000/thicc, width/thicc],
      _interactable: false,
      _fake: true,
      _animation: {
        _color: [
          [...wallCol, -69, 0],
          [...wallColor, -69, 1]
        ],
        _scale: [[thicc, thicc, thicc, 0]],
        _definitePosition: [
          [defX*mult, defY, 200, 0],
          [(defX-20)*mult, defY, 90, 0.5, "splineCatmullRom"],
          [(defX-100)*mult, defY, -20, 1, "splineCatmullRom"]
        ], 
        _dissolve: [
          [random(0, 2)/10, 0],
          [random(6, 10)/10, random(4, 10)/10, "easeOutCirc"]
        ],
        _localRotation: [
          [random(-10, 10), random(-10, 10), random(-90, 90), 0],
          [random(-10, 10), random(-10, 10), random(-90, 90), 0.56, "easeInOutQuad"],
          [0, 0, 0, 0.8, "easeInOutQuad"]
        ]
      }
    });
    _obstacles.push(wall)
  }
}

_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "sideWalls",
    _duration: 0,
    _dissolve: [
      [0, 0]
    ]
  }
}, {
  _time: 104,
  _type: "AnimateTrack",
  _data: {
    _track: "sideWalls",
    _duration: 1,
    _dissolve: [
      [0, 0],
      [1, 1, "easeInOutQuart"]
    ]
  }
}, {
  _time: 168,
  _type: "AnimateTrack",
  _data: {
    _track: "sideWalls",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 0, "easeOutExpo"]
    ]
  }
}, {
  _time: 296,
  _type: "AnimateTrack",
  _data: {
    _track: "sideWalls",
    _duration: 8,
    _dissolve: [
      [0, 0],
      [0.5, 0.875, "easeInQuad"],
      [1, 1, "easeStep"]
    ]
  }
}, {
  _time: 359,
  _type: "AnimateTrack",
  _data: {
    _track: "sideWalls",
    _duration: 1,
    _dissolve: [
      [1, 0],
      [0, 1, "easeOutExpo"]
    ]
  }
});

//ending

filteredwalls = _obstacles.filter(w => w._time >= 388 && typeof w._customData._animation !== 'undefined' && w._customData._animation !== null);
filteredwalls.forEach(wall => {
  wall._duration *= 2;
  data = wall._customData;
  anim = wall._customData._animation;
  
  data._fake = true;
  data._interactable = false;
  anim._dissolve = [
    [0, 0],
    [1, 0.25, "easeOutCirc"],
    [1, 0.5],
    [0, 1, "easeInOutCirc"]
  ];
  let defPos = anim._definitePosition;
  defPos[0][3] /= 4;
  defPos[0][2] *= 2;
  defPos[0][2] += -4000;
  defPos[1][3] /= 4;
  defPos[1][2] *= 2;
  defPos[1][2] += -4000;
  const defPosConst = defPos;
  defPosConst.push([defPos[1][0]*random(10, 1000), defPos[1][1]*random(-15, 15), random(-35, 35)-4000, 1, "easeOutCirc"])
});

_customEvents.push({
  _time: 392,
  _type: "AnimateTrack",
  _data: {
    _track: "globalTrack",
    _duration: 0,
    _position: [
      [0, 0, -4000, 0]
    ]
  }
}, {
  _time: 392,
  _type: "AnimateTrack",
  _data: {
    _track: "HUDTrack",
    _duration: 0,
    _position: [
      [4000, 4000, 4000, 0]
    ]
  }
});

//



















//#endregion


//#endregion                     -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  STOP  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -





//#region write file
const precision = 5; //decimals to round to  --- use this for better wall precision or to try and decrease JSON file size

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
