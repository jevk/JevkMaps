
const fs = require("fs");

const INPUT =  __dirname+"\\ExpertPlusStandard.dat";
const OUTPUT = __dirname+"\\ExpertPlusLawless_Old.dat";

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
    object._customData._track = track;
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
  });
  return filterednotes;
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function noteFly(Start, End, potentialTrack, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {
    if (typeof potentialTrack !== 'undefined' || potentialTrack !== null) {
      note._customData._track = potentialTrack;
    }
    
    note._customData._disableSpawnEffect = true;
    note._customData._disableNoteLook = true;
    note._customData._noteJumpStartBeatOffset = potentialOffset;

    if (!note._customData._animation) note._customData._animation = {};

    noteScale1 = Math.fround(getRndInteger(40,60)/10);
    noteScale2 = Math.fround(noteScale1/4);

    note._customData._animation._scale = [
      [noteScale1, noteScale1, noteScale1, 0],
      [noteScale2, noteScale2, noteScale2, 0.125],
      [1, 1, 1, 0.25]
    ];

    noteDissolve = Math.fround(getRndInteger(10,50)/100);
    note._customData._animation._dissolve = [
      [0, 0],
      [noteDissolve, 0.0625],
      [noteDissolve*2, 0.125],
      [1, 0.25, "easeOutCubic"]
    ];

    note._customData._animation._rotation = [
      [getRndInteger(-10,10), getRndInteger(-25,25), 0, 0],
      [0, 0, 0, 0.25, "easeOutBack"]
    ];

    note._customData._animation._localRotation = [
      [getRndInteger(-110,110), getRndInteger(-110,110), getRndInteger(-110,110), 0],
      [0, 0, 0, 0.25, "easeOutQuad"]
    ];

    note._customData._animation._position = [
      [Math.fround(getRndInteger(-45,45)/10), Math.fround(getRndInteger(-150,150)/10), Math.fround(getRndInteger(-45,45)/10), 0],
      [0, 0, 0, 0.25, "easeOutQuart"]
    ];
  });
}

function poggerPath(Start, End, assignTrack, potentialOffset, intensity) { 
  filterednotes = _notes.filter(n => n._time >= Start && n._time <= End);
  filterednotes.forEach(note => {
    note._customData._noteJumpStartBeatOffset = potentialOffset;
    note._customData._disableNoteGravity = true;
    note._customData._disableSpawnEffect = true;
    note._customData._disableNoteLook = true;
    note._customData._track = assignTrack;
    if (!note._customData._animation) note._customData._animation = {};
    
      posX = Math.fround(getRndInteger(-75, 75)/10) * intensity;
      posY = Math.fround(getRndInteger(-75, 75)/10) * intensity;
    note._customData._animation._position = [
      [posX, posY, 5, 0],
      [posX/2, 0, 0, 0.25, "easeInSine", "splineCatmullRom"],
      [0, 0, 0, 0.48, "easeOutCirc", "splineCatmullRom"]
    ];

    rotX = Math.fround(getRndInteger(-100, 20)/10) * intensity;
    note._customData._animation._rotation = [
      [rotX, posX*0.8, getRndInteger(-15,15), 0],
      [0, 0, 0, 0.25, "easeOutCubic"]
    ];

    note._customData._animation._localRotation = [
      [getRndInteger(-60,60) * intensity, getRndInteger(-30,30) * intensity, getRndInteger(-180,180) * intensity, 0],
      [0, 0, 0, getRndInteger(10, 35)/100, "easeOutCubic"]
    ];

    note._customData._animation._dissolve = [
      [0, 0],
      [1, 0.4, "easeOutCubic"]
    ];
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




noteFly(158, 171.75, "flyingTrack", 0.5, true)
poggerPath(60, 91.9, "poggers", 2, 1.1)
noteFly(174, 185.75, "flyingTrack", 0.5, true)
noteFly(190, 203.75, "flyingTrack", 0.5, true)
noteFly(208, 219.75, "flyingTrack", 0.5, true)
noteFly(222, 235.75, "flyingTrack", 0.5, true)
noteFly(238, 249.75, "flyingTrack", 0.5, true)

for (i = 158 ; i <= 220 ; i+=2) {
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


for (i = 376, i2 = 0.1; i <= 379.5 ; i += 0.5, i2 += 0.1) {
  poggerPath(i, i, "poggers1", 2, i2)
}

poggerPath(380, 412, "poggers", 2, 1.1)

for (i = 380 ; i <= 412 ; i+=2) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "poggers",
      _duration: 1,
      _scale: [
        [1, 1, 1, 0],
        [1.5, 1.5, 1.5, 0.125, "easeOutBack"],
        [1, 1, 1, 0.625, "easeInOutCubic"]
      ]
    }
  });
}

poggerPath(476, 503.9, "Pog", 2, 1.2)

for (i = 476 ; i <= 504 ; i+=2) {
  _customEvents.push({
    _time: i-0.125,
    _type: "AnimateTrack",
    _data: {
      _track: "Pog",
      _duration: 1,
      _scale: [
        [1, 1, 1, 0],
        [1.5, 1.5, 1.5, 0.125, "easeOutBack"],
        [1, 1, 1, 0.625, "easeInOutCubic"]
      ]
    }
  });
}



noteFly(510, 523.75, "flyingTrack", 0.5, true)
noteFly(526, 539.75, "flyingTrack", 0.5, true)
noteFly(574, 587.75, "flyingTrack", 0.5, true)
noteFly(590, 602.75, "flyingTrack", 0.5, true)

for (i = 510 ; i <= 602 ; i+=2) {
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

_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "sussy",
    _duration: 0,
    _dissolve: [
      [0,0]
    ]
  }
}, {
  _time: 156,
  _type: "AnimateTrack",
  _data: {
    _track: "sussy",
    _duration: 0.75,
    _dissolve: [
      [0, 0],
      [1, 1, "easeOutCubic"]
    ]
  }
}, {
  _time: 156.75,
  _type: "AnimateTrack",
  _data: {
    _track: "sussy",
    _duration: 0.75,
    _position: [
      [0, 0, 0, 0],
      [0, 3, 0, 1, "easeOutBack"]
    ],
    _rotation: [
      [0, 0, 0, 0],
      [0, 0, -16, 1, "easeOutElastic"]
    ]
  }
}, {
  _time: 157.25,
  _type: "AnimateTrack",
  _data: {
    _track: "sussy",
    _duration: 2,
    _position: [
      [0, 3, 0, 0],
      [45, 3, 0, 1, "easeInBack"]
    ],
    _dissolve: [
      [1, 0],
      [0, 0.75, "easeOutCubic"]
    ]
  }
});
_customEvents.push({
  _time: 160,
  _type: "AnimateTrack",
  _data: {
    _track: "sussy",
    _duration: 0,
    _dissolve: [
      [0,0]
    ]
  }
}, {
  _time: 508,
  _type: "AnimateTrack",
  _data: {
    _track: "sussy",
    _duration: 0.75,
    _dissolve: [
      [0, 0],
      [1, 1, "easeOutCubic"]
    ]
  }
}, {
  _time: 508.75,
  _type: "AnimateTrack",
  _data: {
    _track: "sussy",
    _duration: 0.75,
    _position: [
      [0, 0, 0, 0],
      [0, 3, 0, 1, "easeOutBack"]
    ],
    _rotation: [
      [0, 0, 0, 0],
      [0, 0, -16, 1, "easeOutElastic"]
    ]
  }
}, {
  _time: 509.25,
  _type: "AnimateTrack",
  _data: {
    _track: "sussy",
    _duration: 2,
    _position: [
      [0, 3, 0, 0],
      [45, 3, 0, 1, "easeInBack"]
    ],
    _dissolve: [
      [1, 0],
      [0, 0.75, "easeOutCubic"]
    ]
  }
});

























_customEvents.push({
  _time: 158,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20, 20, 20, 0]
    ]
  }
}, {
  _time: 172,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1,1,1,0]
    ]
  }
}, {
  _time: 174,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20,20,20,0]
    ]
  }
}, {
  _time: 186,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1,1,1,0]
    ]
  }
}, {
  _time: 192,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20,20,20,0]
    ]
  }
}, {
  _time: 196,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1,1,1,0]
    ]
  }
}, {
  _time: 198,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20,20,20,0]
    ]
  }
}, {
  _time: 204,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1,1,1,0]
    ]
  }
}, {
  _time: 206,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1,3,1,0]
    ]
  }
}, {
  _time: 208,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20,20,20,0]
    ]
  }
}, {
  _time: 212,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1,1,1,0]
    ]
  }
}, {
  _time: 214,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20,20,20,0]
    ]
  }
}, {
  _time: 236,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1,1,1,0]
    ]
  }
}, {
  _time: 238,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20,20,20,0]
    ]
  }
}, {
  _time: 251,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 1,
    _scale: [
      [20,20,20,0],
      [1,1,1,1,"easeOutCubic"]
    ]
  }
}, {
  _time: 254,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 2,
    _scale: [
      [1,1,1,0],
      [20,20,20,1,"easeInCirc"]
    ]
  }
}, {
  _time: 268,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1,1,1,0]
    ]
  }
}, {
  _time: 272,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20,20,20,0]
    ]
  }
}, {
  _time: 276,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1,1,1,0]
    ]
  }
}, {
  _time: 278,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20,20,20,0]
    ]
  }
}, {
  _time: 284,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 4,
    _scale: [
      [20, 20, 20, 0],
      [1, 20, 1, 1]
    ]
  }
}, {
  _time: 509,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20, 20, 20, 0]
    ]
  }
}, {
  _time: 539,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1, 1, 1, 0]
    ]
  }
}, {
  _time: 543,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20, 20, 20, 0]
    ]
  }
}, {
  _time: 548,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1, 1, 1, 0]
    ]
  }
},{
  _time: 550,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20, 20, 20, 0]
    ]
  }
},{
  _time: 556,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1, 1, 1, 0]
    ]
  }
},{
  _time: 559,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20, 20, 20, 0]
    ]
  }
}, {
  _time: 572.5,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1, 1, 1, 0]
    ]
  }
},{
  _time: 573.99,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20, 20, 20, 0]
    ]
  }
},{
  _time: 588.5,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1, 1, 1, 0]
    ]
  }
},{
  _time: 589.5,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20, 20, 20, 0]
    ]
  }
}, {
  _time: 603,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 1,
    _scale: [
      [20, 20, 20, 0],
      [1,1,1,1]
    ]
  }
}, {
  _time: 608,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20, 20, 20, 0]
    ]
  }
}, {
  _time: 612,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1, 1, 1, 0]
    ]
  }
},{
  _time: 614,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20, 20, 20, 0]
    ]
  }
},{
  _time: 620,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [1, 1, 1, 0]
    ]
  }
},{
  _time: 623,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 0,
    _scale: [
      [20, 20, 20, 0]
    ]
  }
}, {
  _time: 636,
  _type: "AnimateTrack",
  _data: {
    _track: "ringTrack",
    _duration: 1,
    _scale: [
      [20, 20, 20, 0],
      [1, 1, 1, 1]
    ]
  }
});

_environment.push(
  { _id: "Ring.*Laser(| .\\d.)$", _lookupMethod: "Regex", _track: "ringTrack"},
  { _id: "Spectrograms", _lookupMethod: "Regex", _active: false}
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
