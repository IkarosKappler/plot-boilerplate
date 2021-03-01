/**
 * @author   Ikaros Kappler
 * @date     2019-02-03
 * @modified 2021-03-01 Added `wrapMax` function.
 * @version  1.1.0
 **/
import { Line } from "./Line";
import { Vertex } from "./Vertex";
/**
 * A collection of usefull geometry utilities.
 *
 * @global
 **/
export declare const geomutils: {
    /**
     * Compute the n-section of the angle – described as a triangle (A,B,C) – in point A.
     *
     * @param {Vertex} pA - The first triangle point.
     * @param {Vertex} pB - The second triangle point.
     * @param {Vertex} pC - The third triangle point.
     * @param {number} n - The number of desired angle sections (example: 2 means the angle will be divided into two sections,
     *                      means an returned array with length 1, the middle line).
     *
     * @return {Line[]} An array of n-1 lines secting the given angle in point A into n equal sized angle sections. The lines' first vertex is A.
     */
    nsectAngle(pA: Vertex, pB: Vertex, pC: Vertex, n: number): Array<Line>;
    wrapMax(x: number, max: number): number;
};
