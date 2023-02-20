
import { arrowExplosion, arrowTrail, randPath, stars } from "./functions.ts";
import { AnimateTrack, ease, Environment, filter, Map, notes, PointDefinition, Requirement, Settings, track } from "./src/main.ts";

const INPUT = 'ExpertPlusStandard.dat'
const OUTPUT = 'ExpertPlusLawless.dat'

const difficulty = Map.initialize(INPUT, OUTPUT, 18, -0.5)

Map.formatFile(false)
// #region Noodle stuff below

//new ModelEnvironment('yo.json', [0, -20, 0]);

track(filter(notes, 0, 16), "startDissolve")
new AnimateTrack(0)
.track("startDissolve")
.duration(14)
.easing(ease.InOut.Sine)
.dis([
    [0.3, 0],
    [0.3, 12/14],
    [1, 1]
])
.push();

new PointDefinition()
.name("kScale")
.points([
    [1.5, 1.5, 1.5, 0],
    [1, 1, 1, 1, ease.Out.Quart]
])
.push();

track(filter(notes, 28, 93), "kickNotes")
const kicks = [0, 1, 2.5, 3, 4, 5, 6.5, 7, 8, 9, 10.5, 11, 12, 13, 14.5, 15, 15.5, 16, 17, 18.5, 19, 20, 21, 22.5, 23, 24, 25, 26.5, 27, 28, 28.5, 29, 29.5, 30.5, 31]
for (let i = 28; i <= 91; i += 32) {
    for (const j of kicks) {
        new AnimateTrack(i + j)
        .track("kickNotes")
        .duration(1)
        .scale("kScale")
        .push();
    }
} 

randPath(0, 27.9, 0.5)
randPath(28, 30.9, 0.5)

stars(124, 188, 12, 24)

randPath(124, 188, 2)

arrowExplosion(124, 5)
arrowExplosion(156, 10)

arrowTrail(188, 4, 8, 1)

track(filter(notes, 204, 269), "kickNotes")
for (let i = 204; i <= 267; i += 32) {
    for (const j of kicks) {
        new AnimateTrack(i + j)
        .track("kickNotes")
        .duration(1)
        .scale("kScale")
        .push();
    }
} 

stars(300, 428, 12, 24)

randPath(300, 428, 2)

arrowExplosion(300, 5)
arrowExplosion(332, 5)
arrowExplosion(364, 5)
arrowExplosion(396, 5)

arrowTrail(427.5, 2, 8, 0.5)

// #endregion Noodle stuff above

new Environment()
    .contains("Spectro")
    .active(false)
    .push();

new Environment()
    .contains("SidePS")
    .active(false)
    .push();

new Environment()
    .regex(/Ring\(\w+\).+Laser( .\d.)?$/)
    .scale([3, 1.5, 4])
    .push();

new Environment()
    .regex(/Ring\(\w+\)$/)
    .scale([1.69, 1.69, 1.69])
    .push();

new Environment()
    .regex(/LasersPair.+[LR]$/)
    .scale([2, 2, 2])
    .push();

new Requirement(OUTPUT)
.noodle()
.chroma()

new Settings(OUTPUT)
.bloom(true)
.screenDistortions(true)
.shockwaveParticles(0)
.effects("AllEffects")
.effectsExpertPlus("AllEffects")
.enabledWalls("All")
.disableChroma(false)
.disableEnvironment(false)
.disableNoteColors(false)
.countersPlus(false)
.push();

Map.finalize(difficulty);