# ScuffedWalls v2.0.1

# Documentation on functions can be found at
# https://github.com/thelightdesigner/ScuffedWalls/blob/main/Functions.md
            
# DM @thelightdesigner#1337 for more help?

# Using this tool requires an understanding of Noodle Extensions.
# https://github.com/Aeroluna/Heck/wiki

# Playtest your maps

Workspace:Default


0: Import
   Path:ExpertPlusLawless_Old.dat

0: Run
   Javascript:bloom.js
   runbefore:true
   refreshonsave:true

394: TextToWall
   Path:font.dae
   thicc:12
   line:Mapped by Jevk
   duration: 8
   animatedefiniteposition:[0,3,40,0],[0,7,40,1]
   animatedissolve:[0,0],[1,0.125,"easeInOutQuad"],[1,0.875],[0,1,"easeInOutQuad"]
   color:[2,2,2,5]
