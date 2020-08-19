/**
 * @classdesc A HobbyCurve/HobbyPath calculation class: compute a set of optimal
 *            cubic Bézier curves from a sequence of vertices.
 *
 * This Hobby curve (path) implementation was strongly inspired by
 * the one by Prof. Dr. Edmund Weitz:
 *  // Copyright (c) 2018-2019, Dr. Edmund Weitz.  All rights reserved.
 *  // The code in this file is written mainly for demonstration purposes
 *  // and to illustrate the videos mentioned on the HTML page.  It would
 *  // be fairly easy to make it shorter and more efficient, but I
 *  // refrained from doing this on purpose.
 * Here's the website:
 *  http://weitz.de/hobby/
 *
 * @date     2020-04-07
 * @author   Transformed to a JS-class by Ikaros Kappler
 * @modified 2020-08-19 Ported from vanilla JS to TypeScript.
 * @version 1.0.1
 *
 * @file HobbyPath
 * @public
 **/
import { CubicBezierCurve } from "../../CubicBezierCurve";
import { Vertex } from "../../Vertex";
export declare class HobbyPath {
    /**
     * @member {Array<Vertex>} vertices
     * @memberof VoronoiCell
     * @type {Array<Triangle>}
     * @instance
     **/
    private vertices;
    /**
     * @constructor
     * @name HobbyPath
     * @param {Array<Vertex>=} vertices? - An optional array of vertices to initialize the path with.
     **/
    constructor(vertices?: Array<Vertex>);
    /**
     * Add a new point to the end of the vertex sequence.
     *
     * @name addPoint
     * @memberof HobbyPath
     * @instance
     * @param {Vertex} p - The vertex (point) to add.
     **/
    addPoint(p: Vertex): void;
    /**
     * Computes the control point coordinates for a Hobby curve through
     * the points given.
     *
     * @name hobbyControls
     * @memberof HobbyPath
     * @instance
     * @param {boolean}  circular - If true, then the path will be closed.
     * @param {number=0} omega    - The 'curl' or the path.
     * @return {IControlPoints} An object with two members: startControlPoints and endControlPoints (Array<Vertex>).
     **/
    private hobbyControls;
    generateCurve(circular?: boolean, omega?: number): Array<CubicBezierCurve>;
    static utils: {
        rotate: (vert: Vertex, sin: number, cos: number) => Vertex;
        rotateAngle: (vert: Vertex, alpha: number) => Vertex;
        normalize: (vec: Vertex) => Vertex;
        rho: (a: number, b: number) => number;
        thomas: (a: number[], b: number[], c: number[], d: number[]) => number[];
        sherman: (a: number[], b: number[], c: number[], d: number[], s: number, t: number) => number[];
    };
}
