import {Scenery} from "./scenery.js";
import {Sprites} from "../../sprite/sprites.js";
import {LayerSpawner} from "./layer/layerSpawner.js";
import {Catalogue} from "./catalogue/catalogue.js";

export class SceneryCountry extends Scenery {
    constructor(width, height, length) {
        super(
            width,
            height,
            length,
            Sprites.BIOME_COUNTRY_9_1,
            [
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_8_1,
                    140,
                    679,
                    .1,
                    5000,
                    30000),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_8_2,
                    377,
                    702,
                    .1,
                    5000,
                    30000),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_8_3,
                    486,
                    716,
                    .1,
                    5000,
                    30000),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_7_1,
                    1920,
                    640,
                    .2,
                    1920 / .2),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_6_1,
                    1338,
                    686,
                    .26,
                    2000,
                    10000),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_6_2,
                    937,
                    662,
                    .26,
                    2000,
                    10000),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_5_1,
                    191,
                    473,
                    .36,
                    2000,
                    10000),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_5_2,
                    259,
                    495,
                    .36,
                    2000,
                    10000),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_5_3,
                    110,
                    601,
                    .36,
                    2000,
                    10000),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_5_4,
                    208,
                    464,
                    .36,
                    2000,
                    10000),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_4_1,
                    93,
                    670,
                    .65,
                    400),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_3_1,
                    1920,
                    230,
                    1),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_2_1,
                    660,
                    163,
                    -.2,
                    360),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_1_1,
                    483,
                    139,
                    -.7,
                    500,
                    3000),
                new LayerSpawner(
                    Sprites.BIOME_COUNTRY_1_2,
                    288,
                    181,
                    -.7,
                    500,
                    3000),
            ],
            new Catalogue(
                [

                ],
                [

                ]
            ));
    }
}