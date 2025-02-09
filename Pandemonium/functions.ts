import assets = require("./assetinfo.json");
import ease from "./consts/easing";
import SPLINE from "./consts/spline";
import AnimateTrack from "./events/animateTrack";
import ApplyPostProcessing from "./events/applyPostProcessing";
import SetMaterialProperty from "./events/setMaterialProperty";
import filter from "./functions/filter";
import random from "./functions/random";
import IPPProperty from "./interfaces/events/eventData/IPPProperty";
import PointDefinition from "./map/pointDefinition";
import { definitionNames, events } from "./map/variables";
import Note, { notes } from "./objects/note";
import { vec1anim, vec4anim } from "./types/vectors";

interface IParticleControl {
    start: number;
    duration?: number;
    properties?: IParticleProperties
}
interface IParticleProperties {
    UFPS?: vec1anim;
    B?: vec1anim;
    _Cull?: vec1anim;
    _ZWrite?: vec1anim;
    _fs?: vec1anim;
    _fe?:  vec1anim;
    _tc?: vec4anim;
    _samples?: vec1anim;
    _scale?: vec1anim;
    _ms?: vec1anim;
    _mo?: vec1anim;
    _sms?: vec1anim;
    _smo?: vec1anim;
    _dbs?: vec1anim;
    _s?: vec1anim;
    _lpow?: vec1anim;
    _lt?: vec1anim;
    _rspeed?: vec1anim;
    _roffset?: vec1anim;
    _near?: vec1anim;
    _far?: vec1anim;
    _appearfade?: vec1anim;
    _disappearfade?: vec1anim;
    _Color?: vec4anim;
    _rb?: vec1anim;
    _rbo?: vec1anim;
    _rbs?: vec1anim;
    _v?: vec1anim;
    _Src?: vec1anim;
    _Dst?: vec1anim;
}

export function particleControl(p: IParticleControl|number): void {
    if (typeof p == "number") p = { start: p };
    if (!p.duration) p.duration = 1;
    let mat = new SetMaterialProperty(p.start, {
        asset: assets.materials.universemesh.path,
        duration: p.duration,
        properties: []
    });
    if (p.properties != null) {
        for (let key in p.properties) {
            let tempProp: IPPProperty = {
                id: key,
                type: "Float",
                value: p.properties[key]
            }
            if (["_Color", "_tc"].includes(key)) {
                tempProp.type = "Color";
            }
            mat.data.properties.push(tempProp);
        }
    }
    mat.push();
}

export function setMaterialOnPPEvent(start: number, end: number, properties: IParticleProperties = {
        _lpow : [
            [1, 0],
            [0, 1]
        ],
        _s : [
            [1, 0],
            [0.01, 1]
        ],
        _Color : [
            [1, 0, 0, 1, 0],
            [1, 0.7, 0.7, 0.25, 1]
        ]
    }): void {
    events.forEach((e: any) => {
        if (e.type == "Blit" && e.time >= start && e.time <= end && e.data.duration != null && typeof e.data.duration == "number") {
            particleControl({
                start: e.time,
                duration: e.data.duration,
                properties: properties
            });
        }
    });
}

export function chaosPath(start: number, end: number) {
    new PointDefinition("chaosDis", [
        [
            0,
            0
        ],
        [
            0.5,
            0.0625
        ],
        [
            1,
            0.125,
            "easeOutCirc"
        ]
    ]).push();
    filter(notes, start, end).forEach((n: Note) => {
        const d = n.customData;
        const a = n.animation;

        d.disableNoteGravity = true;
        d.disableNoteLook = true;
        d.disableSpawnEffect = true;
        d.offset = 1;

        a.dissolve = "chaosDis"
        a.scale = [
            [random(0.5, 3), random(0.5, 3), random(0.5, 3), 0],
            [1, 1, 1, 0.25, ease.Out.Back]
        ];
        a.position = [
            [random(-2, 2), random(-1, 2), random(-2, 2), 0],
            [random(-2, 2), random(-1, 2), random(-2, 2), 0.125, ease.In.Cubic, SPLINE],
            [0, 0, 0, 0.25, ease.Out.Cubic, SPLINE]
        ];
        a.localRotation = [
            [random(-180, 180), random(-180, 180), random(-180, 180), 0],
            [random(-180, 180), random(-180, 180), random(-180, 180), 0.0625, ease.In.Cubic, SPLINE],
            [random(-180, 180), random(-180, 180), random(-180, 180), 0.125, ease.In.Cubic, SPLINE],
            [random(-180, 180), random(-180, 180), random(-180, 180), 0.1875, ease.In.Cubic, SPLINE],
            [0, 0, 0, 0.25, ease.Out.Back, SPLINE]
        ]
    });
}

export function randomPath(start: number, end: number) {
    for (let i = -2, j = 1; i <= 2; i++, j *= -1) {
        if (definitionNames.includes(`randomPos${i}`)) break;
        new PointDefinition(`spinPos${i+2}`, [
            [-15 * j, i * 2, 0, 0],
            [0, 0, 0, 0.475, ease.Out.Circ]
        ]).push();
    }

    filter(notes, start, end).forEach((n: Note) => {
        const d = n.customData;
        const a = n.animation;

        d.offset = 3;
        d.disableNoteGravity = true;
        d.disableNoteLook = true;
        d.disableSpawnEffect = true;
        
        a.position = `spinPos${random(0, 4, 0)}`;
        a.dissolve = "disIn";
        a.dissolveArrow = "disIn";
    });
}

export function blur(time: number, duration: number = 0.5, properties: {
    radius: vec1anim,
    resolution?: vec1anim,
    hstep?: vec1anim,
    vstep?: vec1anim,
} = {
    radius: [
        [30, 0],
        [0, 1]
    ]
}) {
    if (!properties.hstep) properties.hstep = [.3];
    if (!properties.vstep) properties.vstep = [.3];
    if (!properties.resolution) properties.resolution = [500];

    const pp = new ApplyPostProcessing(time, {
        asset: assets.materials.blur.path,
        duration: duration,
        properties: []
    });

    Object.keys(properties).forEach((key) => {
        pp.data.properties.push({
            id: key,
            type: "Float",
            value: properties[key]
        });
    });

    pp.push();
}

export function kickWow(time: number, duration: number = 0.5, properties: {
    _Intensity?: vec1anim,
    _Color?: vec4anim,
} = {
    _Intensity: [
        [1, 0],
        [0, 1, ease.Out.Quad]
    ]
}) {
    if (properties._Intensity == null || typeof properties._Intensity === "undefined") properties._Intensity = [
        [1, 0],
        [0, 1, ease.Out.Quad]
    ];

    const pp = new ApplyPostProcessing(time, {
        asset: assets.materials.kickwow.path,
        duration: duration,
        properties: []
    });

    Object.keys(properties).forEach((key) => {
        pp.data.properties.push({
            id: key,
            type: key == "_Intensity" ? "Float" : "Color",
            value: properties[key]
        });
    });

    pp.push();
}

export function sideBlocks(start: number, end: number, moveInterval = 1) {
    new AnimateTrack(start-4, {
        track: "side",
        duration: 5,
        dissolve: [
            [0, 0],
            [0, 3/5],
            [1, 4/5, ease.Out.Cubic]
        ],
        scale: [
            [4, 4, 4, 0],
            [4, 4, 4, 3/5],
            [1, 1, 1, 4/5, ease.Out.Cubic]
        ]
    }).push();
    new AnimateTrack(start-4, {
        track: "sideReal",
        duration: 5,
        dissolve: [
            [2, 0],
            [2, 3/5],
            [1, 4/5, ease.Out.Cubic]
        ],
    }).push();

    new AnimateTrack(start, {
        track: "sideMerges",
        duration: moveInterval,
        easing: ease.Out.Quad,
        dissolve: [
            [0.9, 0],
            [0.1, 0.5],
            [0, 1]
        ],
        repeat: end - start - 1
    }).push();
    new AnimateTrack(start, {
        track: "side",
        duration: moveInterval,
        easing: ease.Out.Quad,
        offsetPosition: [
            [0, 0, -1, 0],
            [-4, 0, -1, 1]
        ],
        scale: [
            [2, 1, 1, 0],
            [1, 1, 1, 1]
        ],
        dissolve: [
            [0.9, 0],
            [0.1, 0.5],
            [0.9, 1]
        ],
        dissolveArrow: [0],
        repeat: end - start - 1
    }).push();
    new AnimateTrack(start, {
        track: "farLeft",
        duration: moveInterval,
        easing: ease.Out.Quad,
        dissolve: [
            [0.9, 0],
            [0, 1],
        ],
        repeat: end - start - 1
    }).push();
    new AnimateTrack(start, {
        track: "farRight",
        duration: moveInterval,
        easing: ease.Out.Quad,
        dissolve: [
            [0, 0],
            [0.9, 1],
        ],
        repeat: end - start - 1
    }).push();
    new AnimateTrack(start, {
        track: "sideReal",
        duration: moveInterval,
        easing: ease.Out.Quad,
        dissolve: [
            [.9, 0],
            [.75, 0.5],
            [.9, 1],
        ],
        repeat: end - start - 1
    }).push();
    filter(notes, start, end).forEach((n: Note) => {
        {
            // Real notes
            const d = n.customData;
            const a = n.animation;
    
            d.disableNoteLook = true;
            d.disableSpawnEffect = true;
            d.track = "sideReal";
            d.link = `l${n.time},${n.x}${n.y}`;;
    
            a.dissolve = [0.5];
        }
    
        for (let i = -1; i <= 2; i ++) {
            // Duplicated notes
            const dupe = n.duplicate();
            const d = dupe.customData;
    
            dupe.time += 0.05;

            d.track = "side";
            if (i == -1 || i == 2) d.track = ["side", `far${i == -1 ? "Left" : "Right"}`];
            if (i == 1) d.track = ["side", "sideMerges"];

            d.fake = true;
            d.interactable = false;
            d.position = [((dupe.x - 2) + 4 * i), dupe.y];

            dupe.animation = undefined;
    
            dupe.push();
        }
    });
}