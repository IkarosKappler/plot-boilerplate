/**
 * @classdesc A triangle class for triangulations.
 *
 * The class was written for a Delaunay trinagulation demo so it might
 * contain some strange and unexpected functions.
 *
 * @requires Vertex, Polygon
 *
 * Inspired by Delaunay at Travellermap
 *   http://www.travellermap.com/tmp/delaunay.htm
 *
 * Todo:
 *   + Add and use a proper Bounds class.
 *   + Add and use a proper Circle class.
 *   + Think about the importance of storing the circumcircle data in the Triangle.
 *
 * @author    Ikaros Kappler
 * @date_init 2012-10-17 (Wrote a first version of this in that year).
 * @date      2018-04-03 (Refactored the code into a new class).
 * @modified  2018-04-28 Added some documentation.
 * @modified  2019-09-11 Added the scaleToCentroid(Number) function (used by the walking triangle demo).
 * @modified  2019-09-12 Added beautiful JSDoc compliable comments.
 * @modified  2019-11-07 Added to toSVG(options) function to make Triangles renderable as SVG.
 * @modified  2019-12-09 Fixed the determinant() function. The calculation was just wrong.
 * @modified  2020-03-16 (Corona times) Added the 'fromArray' function.
 * @modified  2020-03-17 Added the Triangle.toPolygon() function.
 * @modified  2020-03-17 Added proper JSDoc comments.
 * @modified  2020-03-25 Ported this class from vanilla-JS to Typescript.
 * @version   2.2.2
 *
 * @file Triangle
 * @public
 **/
import { Polygon } from "./Polygon";
import { Vertex } from "./Vertex";
import { SVGSerializable } from "./interfaces";
export declare class Triangle implements SVGSerializable {
    /**
     * Required to generate proper CSS classes and other class related IDs.
     **/
    readonly className: string;
    /**
     * An epsilon for comparison.
     * This should be the same epsilon as in Vertex.
     *
     * @private
     **/
    static readonly EPSILON: number;
    /**
     * @member {Vertex}
     * @memberof VEllipse
     * @instance
     */
    a: Vertex;
    /**
     * @member {Vertex}
     * @memberof VEllipse
     * @instance
     */
    b: Vertex;
    /**
     * @member {Vertex}
     * @memberof VEllipse
     * @instance
     */
    c: Vertex;
    private center;
    private radius_squared;
    private radius;
    /**
     * Used in the bounds() function.
     *
     * @private
     **/
    /**
     * Used by the containsPoint() function.
     *
     * @private
     **/
    /**
     * The constructor.
     *
     * @constructor
     * @param {Vertex} a - The first vertex of the triangle.
     * @param {Vertex} b - The second vertex of the triangle.
     * @param {Vertex} c - The third vertex of the triangle.
     **/
    constructor(a: Vertex, b: Vertex, c: Vertex);
    /**
     * Create a new triangle from the given array of vertices.
     *
     * The array must have at least three vertices, otherwise an error will be raised.
     * This function will not create copies of the vertices.
     *
     * @method fromArray
     * @static
     * @param {Array<Vertex>} arr - The required array with at least three vertices.
     * @memberof Vertex
     * @return {Triangle}
     **/
    static fromArray(arr: Array<Vertex>): Triangle;
    /**
     * Get the centroid of this triangle.
     *
     * The centroid is the average midpoint for each side.
     *
     * @method getCentroid
     * @return {Vertex} The centroid
     * @instance
     * @memberof Triangle
     **/
    getCentroid(): Vertex;
    /**
     * Scale the triangle towards its centroid.
     *
     * @method scaleToCentroid
     * @param {number} - The scale factor to use. That can be any scalar.
     * @return {Triangle} this (for chaining)
     * @instance
     * @memberof Triangle
     */
    scaleToCentroid(factor: number): Triangle;
    /**
     * Get the circumcircle of this triangle.
     *
     * The circumcircle is that unique circle on which all three
     * vertices of this triangle are located on.
     *
     * Please note that for performance reasons any changes to vertices will not reflect in changes
     * of the circumcircle (center or radius). Please call the calcCirumcircle() function
     * after triangle vertex changes.
     *
     * @method getCircumcircle
     * @return {Object} - { center:Vertex, radius:float }
     * @instance
     * @memberof Triangle
     */
    getCircumcircle(): {
        center: Vertex;
        radius: number;
    };
    /**
     * Check if this triangle and the passed triangle share an
     * adjacent edge.
     *
     * For edge-checking Vertex.equals is used which uses an
     * an epsilon for comparison.
     *
     * @method isAdjacent
     * @param {Triangle} tri - The second triangle to check adjacency with.
     * @return {boolean} - True if this and the passed triangle have at least one common edge.
     * @instance
     * @memberof Triangle
     */
    isAdjacent(tri: Triangle): boolean;
    /**
     * Get that vertex of this triangle (a,b,c) that is not vert1 nor vert2 of
     * the passed two.
     *
     * @method getThirdVertex
     * @param {Vertex} vert1 - The first vertex.
     * @param {Vertex} vert2 - The second vertex.
     * @return {Vertex} - The third vertex of this triangle that makes up the whole triangle with vert1 and vert2.
     * @instance
     * @memberof Triangle
     */
    getThirdVertex(vert1: Vertex, vert2: Vertex): Vertex;
    /**
     * Re-compute the circumcircle of this triangle (if the vertices
     * have changed).
     *
     * The circumcenter and radius are stored in this.center and
     * this.radius. There is a third result: radius_squared (for internal computations).
     *
     * @method calcCircumcircle
     * @return void
     * @instance
     * @memberof Triangle
     */
    calcCircumcircle(): void;
    /**
     * Check if the passed vertex is inside this triangle's
     * circumcircle.
     *
     * @method inCircumcircle
     * @param {Vertex} v - The vertex to check.
     * @return {boolean}
     * @instance
     * @memberof Triangle
     */
    inCircumcircle(v: Vertex): boolean;
    /**
     * Get the rectangular bounds for this triangle.
     *
     * @method bounds
     * @return {Object} - { xMin:float, xMax:float, yMin:float, yMax:float, width:float, height:float }
     * @instance
     * @memberof Triangle
     */
    bounds(): {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
        width: number;
        height: number;
    };
    /**
     * Convert this triangle to a polygon instance.
     *
     * Plase note that this conversion does not perform a deep clone.
     *
     * @method toPolygon
     * @return {Polygon} A new polygon representing this triangle.
     * @instance
     * @memberof Triangle
     **/
    toPolygon(): Polygon;
    /**
     * Get the determinant of this triangle.
     *
     * @method determinant
     * @return {number} - The determinant (float).
     * @instance
     * @memberof Triangle
     */
    determinant(): number;
    /**
     * Checks if the passed vertex (p) is inside this triangle.
     *
     * Note: matrix determinants rock.
     *
     * @method containsPoint
     * @param {Vertex} p - The vertex to check.
     * @return {boolean}
     * @instance
     * @memberof Triangle
     */
    containsPoint(p: Vertex): boolean;
    /**
     * Converts this triangle into a human-readable string.
     *
     * @method toString
     * @return {string}
     * @instance
     * @memberof Triangle
     */
    toString(): string;
    /**
     * Create an SVG representation of this triangle.
     *
     * @method toSVGString
     * @param {object=} options - An optional set of options, like 'className'.
     * @return {string} The SVG string.
     * @instance
     * @memberof Triangle
     **/
    toSVGString(options: {
        className?: string;
    }): string;
    private static utils;
}