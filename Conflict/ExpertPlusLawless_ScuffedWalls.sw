# ScuffedWalls v1.3.5

# Documentation on functions can be found at
# https://github.com/thelightdesigner/ScuffedWalls/blob/main/Functions.md
            
# DM @thelightdesigner#1337 for more help?

# Using this tool requires an understanding of Noodle Extensions.
# https://github.com/Aeroluna/NoodleExtensions/blob/master/Documentation/AnimationDocs.md

# Playtest your maps

Workspace:Default

0: Import
   Path:ExpertPlusLawless_Old.dat

36: wall
   repeat: 50
   duration: 30
   color: [0,0,0,-69]
   position:[0,0,25]
   animaterotation: [0, Random(0,360), 0, 0],[0, {Random(-2880,-2520)*32}, 0, 1]
   animatelocalrotation: [Random(0,45), Random(0,45), Random(0,45), 0], [Random(-360,360), Random(-360,360), Random(-360,360), 1]
   animatedefiniteposition: [0, Random(5,11), Random(3,9), 0]
   scale: [Random(0.01,1.25), Random(0.01,1.25), Random(0.01,1.25)]
   fake:true
   interactable:false
   track: arrowCircleTrack

36: wall
   repeat: 50
   duration: 30
   color: [0,0,0,-69]
   position:[0,0,25]
   animaterotation: [0, Random(-360,0), 0, 0],[0, {Random(2520,2880)*32}, 0, 1]
   animatelocalrotation: [Random(0,45), Random(0,45), Random(0,45), 0], [Random(-360,360), Random(-360,360), Random(-360,360), 1]
   animatedefiniteposition: [0, Random(5,11), Random(3,9), 0]
   scale: [Random(0.01,1.25), Random(0.01,1.25), Random(0.01,1.25)]
   fake:true
   interactable:false
   track: arrowCircleTrack
   
67: wall
   repeat: 50
   duration: 36
   color: [0,0,0,-69]
   animaterotation: [0, Random(0,360), 0, 0],[0, {Random(-2880,-2520)*32}, 0, 1]
   animatelocalrotation: [Random(0,45), Random(0,45), Random(0,45), 0], [Random(-360,360), Random(-360,360), Random(-360,360), 1]
   animatedefiniteposition: [0, Random(5,11), Random(3,9), 0]
   scale: [Random(0.01,1.25), Random(0.01,1.25), Random(0.01,1.25)]
   fake:true
   interactable:false
   track: arrowCircleTrack

67: wall
   repeat: 50
   duration: 36
   color: [0,0,0,-69]
   animaterotation: [0, Random(-360,0), 0, 0],[0, {Random(2520,2880)*32}, 0, 1]
   animatelocalrotation: [Random(0,45), Random(0,45), Random(0,45), 0], [Random(-360,360), Random(-360,360), Random(-360,360), 1]
   animatedefiniteposition: [0, Random(5,11), Random(3,9), 0]
   scale: [Random(0.01,1.25), Random(0.01,1.25), Random(0.01,1.25)]
   fake:true
   interactable:false
   track: arrowCircleTrack

132: wall
   repeat: 300
   duration: 32
   color: [1,1,1,-10]
   animaterotation: [0,0,Random(0,360),0],[0,0,Random(360,720),1]
   animatedefiniteposition: [Random(5,10), 0, Random(0,20), 0]
   scale: [0.01, Random(0.01,0.1),Random(0.01,0.1)]
   fake:true
   interactable:false
   animatedissolve: [0,0], [1,0.75], [1, 0.8125], [0, 0.875]
   
252: wall
   repeat: 50
   duration: 30
   color: [0,0,0,-69]
   animaterotation: [0, Random(-360,360), 0, 0],[0, Random(-2880,2880), 0, 1]
   animatelocalrotation: [Random(0,45), Random(0,45), Random(0,45), 0], [Random(-360,360), Random(-360,360), Random(-360,360), 1]
   animatedefiniteposition: [0, Random(5,11), Random(3,9), 0]
   scale: [Random(0.01,1.25), Random(0.01,1.25), Random(0.01,1.25)]
   fake:true
   interactable:false
   track: arrowCircleTrack

252: wall
   repeat: 50
   duration: 30
   color: [0,0,0,-69]
   animaterotation: [0, Random(-360,0), 0, 0],[0, {Random(2520,2880)*32}, 0, 1]
   animatelocalrotation: [Random(0,45), Random(0,45), Random(0,45), 0], [Random(-360,360), Random(-360,360), Random(-360,360), 1]
   animatedefiniteposition: [0, Random(5,11), Random(3,9), 0]
   scale: [Random(0.01,1.25), Random(0.01,1.25), Random(0.01,1.25)]
   fake:true
   interactable:false
   track: arrowCircleTrack
   
280: wall
   repeat: 50
   duration: 36
   color: [0,0,0,-69]
   animaterotation: [0, Random(-360,360), 0, 0],[0, Random(-2880,2880), 0, 1]
   animatelocalrotation: [Random(0,45), Random(0,45), Random(0,45), 0], [Random(-360,360), Random(-360,360), Random(-360,360), 1]
   animatedefiniteposition: [0, Random(5,11), Random(3,9), 0]
   scale: [Random(0.01,1.25), Random(0.01,1.25), Random(0.01,1.25)]
   fake:true
   interactable:false
   track: arrowCircleTrack

280: wall
   repeat: 50
   duration: 36
   color: [0,0,0,-69]
   animaterotation: [0, Random(-360,0), 0, 0],[0, {Random(2520,2880)*32}, 0, 1]
   animatelocalrotation: [Random(0,45), Random(0,45), Random(0,45), 0], [Random(-360,360), Random(-360,360), Random(-360,360), 1]
   animatedefiniteposition: [0, Random(5,11), Random(3,9), 0]
   scale: [Random(0.01,1.25), Random(0.01,1.25), Random(0.01,1.25)]
   fake:true
   interactable:false
   track: arrowCircleTrack