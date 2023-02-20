// deno-lint-ignore-file no-explicit-any
import { PointDefinition } from "./src/animation.ts";
import { ease, Spline } from "./src/consts.ts";
import { AnimateTrack } from "./src/events.ts";
import { random } from "./src/general.ts";
import { notes, pointDefinitions } from "./src/mapHandler.ts";
import { Animation, CustomData, filter, Wall } from "./src/objects.ts";

export function stars(start: number, end: number, duration: number, amount: number) {
    new AnimateTrack(start - 4)
    .track("stars")
    .duration(5)
    .dis([
        [0, 0],
        [0, 4/5],
        [1, 1, ease.Out.Quad]
    ])
    .push();
    new AnimateTrack(end)
    .track("stars")
    .duration(1)
    .dis([
        [1, 0],
        [0, 0, ease.Out.Quad]
    ])
    .push();

    if (!pointDefinitions.includes("wallDis"))
    new PointDefinition()
    .name("wallDis")
    .points([
        [0, 0],
        [1, 0.125, ease.InOut.Quad],
        [1, 0.875],
        [0, 1, ease.InOut.Quad],
    ])
    .push();

    const c1 = [random(0.5, 5), random(1, 10)];
    const c2 = [c1[0]/random(1.5, 4), c1[1]/random(3, 10)]
    const c3 = [random(0.5, 5), random(1, 10)];
    const c4 = [c3[0]/random(1.5, 4), c3[1]/random(3, 10)]

    if (!pointDefinitions.includes("starTwinkle"))
    new PointDefinition()
    .name("starTwinkle")
    .points([
        [c1[0], c1[0], c1[0], c1[1], 0],
        [c2[0], c2[0], c2[0], c2[1], 0.25],
        [c3[0], c3[0], c3[0], c3[1], 0.5],
        [c4[0], c4[0], c4[0], c4[1], 0.75],
        [c1[0], c1[0], c1[0], c1[1], 1],
    ])
    .push();

    
    if (!pointDefinitions.includes("ra0")) {
        for (let i = 0; i <= 360; i++) {
            const ra = [random(20, -90), i, (i - 180) / 2]
            new PointDefinition()
            .name(`ra${i}`)
            .points([
                [0, 0, 0, 0],
                [ra[0]/2, ra[1]/2, ra[2]/2, 0.5],
                [ra[0], ra[1], ra[2], 1]
            ])
            .push();
        }
    }
    for (let i = start - 4; i <= end; i += 1/amount) {
        const s = random(0.1, 1);
        new Wall(i)
        .duration(duration)
        .track("stars")
        .rot([random(20, -90), random(-180, 180), random(-90, 90)])
        .color([c1[0], c1[0], c1[0], c1[1]])
        .scale([s, s, s])
        .fake(true)
        .interactable(false)
        .colorAnim("starTwinkle")
        .disAnim("wallDis")
        .rotAnim(`ra${random(0,360,0)}`)
        .defPosAnim([0, random(2, 4), random(80, 120) * s])
        .push();
    }
}

export function randPath(start: number, end: number, offset: number) {
    if (!pointDefinitions.includes("pRot0")) {
        for (let i = 0; i <= 5; i++)
        new PointDefinition()
        .name(`pPos${i}`)
        .points([
            [0, i, 0, 0],
            [0, 0, 0, 0.45, ease.Out.Circ]
        ])
        .push();

        for (let i = 0; i <= 9; i++) 
        new PointDefinition()
        .name(`pRot${i}`)
        .points([
            [random(-20, 5), random(-20, 5), random(4, 40), 0],
            [0, 0, 0, 0.45, ease.Out.Circ]
        ])
        .push();

        for (let i = 10; i <= 19; i++) 
        new PointDefinition()
        .name(`pRot${i}`)
        .points([
            [random(-5, 20), random(-5, 20), random(-40, -4), 0],
            [0, 0, 0, 0.45, ease.Out.Circ]
        ])
        .push();

        for (let i = -5, j = 0; i <= 5; i++, j++)
        new PointDefinition()
        .name(`pLRot${j}`)
        .points([
            [random(i * 10, i * 10 + random(5, 10)), random(i * 10, i * 10 + random(5, 10)), random(-170, 170), 0],
            [0, 0, 0, 0.35, ease.Out.Cubic]
        ])

        new PointDefinition()
        .name("disIn")
        .points([
            [0, 0],
            [1, 0.4, ease.Out.Cubic]
        ])
        .push();
    }
    
    const f = filter(notes, start, end)
    f.forEach((x: any) => {
        new CustomData([x])
        .offset(offset)
        new Animation([x])
        .dis("disIn")
        .pos(`pPos${random(0,5,0)}`)
        .localRot(`pLRot${random(0,8,0)}`)
        .rot(`pRot${random(0,19,0)}`)
    })
}

export function arrowExplosion(start: number, amount: number) {
    if (!pointDefinitions.includes("expDis")) {
        new PointDefinition()
        .name("expDis")
        .points([
            [0, 0],
            [0.9, 0.45, ease.Step],
            [0, 0.99, ease.Out.Expo],
            [0, 1]
        ])
        .push();

        new PointDefinition()
        .name("expDisArr")
        .points([
            [0, 0],
            [1, 0.5, ease.Step],
            [0, 1]
        ])
        .push();
    }
    const f = filter(notes, start, start);
    f.forEach((x: any) => {
        for (let i = 1; i <= amount; i++) {
            const d = JSON.parse(JSON.stringify(x));
            const pos = [d._lineIndex - 2, d._lineLayer];

            new CustomData([d])
            .fake(true)
            .interactable(false)
            new Animation([d])
            .dis("expDis")
            .disArr("expDisArr")
            .defPos([
                [pos[0], pos[1], 0, 0.5],
                [random(-3, 3), random(-3, 3), random(3, 5), 0.75, Spline],
                [random(-3, 3), random(-3, 3), random(3, 5), 1, Spline],
            ])
            notes.push(d);
        }
    })
}

export function arrowTrail(start: number, offset: number, amount: number, duration: number) {
    const f = filter(notes, start, start);
    f.forEach((x: any) => {
        let weight;
        switch (x._lineIndex) {
            case 0:
                weight = 1;
                break;
            case 1:
                weight = 1;
                break;
            case 2:
                weight = -1;
                break;
            case 3:
                weight = -1;
                break;
            default:
                weight = 0;
                break;
        }
        const randDir = [random(-20, 5), random(15, 30) * weight, random(-20, 20)];
        for (let i = 0; i <= duration; i += duration/amount) {
            const d = JSON.parse(JSON.stringify(x));
            //const pos = [d._lineIndex - 2, d._lineLayer];
            d._time += i;

            new CustomData([d])
            .fake(true)
            .interactable(false)
            .offset(offset);

            new Animation([d])
            .dis([0])
            .disArr([
                [0, 0],
                [1, 0.5, ease.Step],
                [1, 0.75],
                [0, 1, ease.In.Expo]
            ])
            .defPos([
                [0, 0, 0, 0.5],
                [0, 0, 100, 1]
            ])
            .rot([
                [0, 0, 0, 0.5],
                [randDir[0] / 2 * random(0, 1, 2), randDir[1] / 2 * random(0, 1, 2), randDir[2] / 2 * random(0, 1, 2), 0.75, Spline],
                [randDir[0], randDir[1], randDir[2], 1, ease.Out.Sine, Spline]
            ]);
            notes.push(d);
        }
    })
}