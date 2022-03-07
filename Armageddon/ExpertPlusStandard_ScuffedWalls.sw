# ScuffedWalls v1.4.2

# Documentation on functions can be found at
# https://github.com/thelightdesigner/ScuffedWalls/blob/main/Functions.md
            
# DM @thelightdesigner#1337 for more help?

# Using this tool requires an understanding of Noodle Extensions.
# https://github.com/Aeroluna/NoodleExtensions/blob/master/Documentation/AnimationDocs.md

# Playtest your maps

Workspace:Default

var:red
   data:Random(0.5,1.5)
   recompute:1

var:white
   data:Random(0.75,2)
   recompute:1

var:Fuck
   data:Random(0.01,0.25)
   recompute:1

0: Import
   Path:ExpertPlusStandard_Old.dat
   RefreshOnSave:true

# 0:Run
#   Javascript:noodle.js
#   RunBefore: false

394: modeltowall
   Path:untitled.dae
   hasAnimation:false
   duration:100
   color:[0,0,0,-69]
   animatedefiniteposition:[0,0,25,0]
   track:glitch
   fake:true
   interactable:false
   thicc:0.00005


472: modeltowall
   Path:Spher.dae
   hasAnimation:false
   duration: 14
   color:[3, 1, 0, 4]
   animatedefiniteposition:[0,0,25,0]
   track:sphere
   fake:true
   interactable:false
   thicc:0.01

# 394: wall
#    repeat: 50
#    repeatAddTime: 0.025
#    duration: 100
#    animatedefiniteposition: [0, 0, Random(20,30), 0]
#    rotation: [Random(-60,60), Random(-180,180), 0]
#    scale: [{Fuck*8}, Fuck, Fuck]
#    color: [red, {red*Random(0,0.05)}, 0, -69]
#    animatedissolve: [Random(0.1,0.75), 0]
#    track:particleSphere
# 
# 394: wall
#    repeat: 75
#    repeatAddTime: 0.025
#    duration: 100
#    animatedefiniteposition: [0, 0, Random(20,30), 0]
#    rotation: [Random(-60,60), Random(-180,180), 0]
#    scale: [{Fuck*8}, Fuck, Fuck]
#    color: [red, {red*Random(0.25,0.75)}, 0, -69]
#    animatedissolve: [Random(0.1,0.75), 0]
#    track:particleSphere
# 
# 394: wall
#    repeat: 30
#    repeatAddTime: 0.025
#    duration: 100
#    animatedefiniteposition: [0, 0, Random(20,30), 0]
#    rotation: [Random(-60,60), Random(-180,180), 0]
#    scale: [{Fuck*8}, Fuck, Fuck]
#    color: [white, white, white, {Random(-1,1)*50}]
#    animatedissolve: [Random(0.1,0.75), 0]
#    track:particleSphere

# 394: modeltowall
#    Path:particleSphere.dae
#    hasAnimation:false
#    duration:100
#    color:[3.2,4,8,-69]
#    scale:[0.125,0.125,0.125]
#    animatedefiniteposition:[0,0,25,0]
#    track:particleSphere
#    fake:true
#    interactable:false
#    thicc:13