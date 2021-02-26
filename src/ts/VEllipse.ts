/**
 * @author   Ikaros Kappler
 * @date     2018-11-28
 * @modified 2018-12-04 Added the toSVGString function.
 * @modified 2020-03-25 Ported this class from vanilla-JS to Typescript.
 * @modified 2021-01-20 Added UID.
 * @modified 2021-02-14 Added functions `radiusH` and `radiusV`.
 * @modified 2021-02-26 Added helper function `decribeSVGArc(...)`.
 * @version  1.2.0
 *
 * @file VEllipse
 * @fileoverview Ellipses with a center and an x- and a y-axis (stored as a vertex).
 **/


import { Vertex } from "./Vertex";
import { UIDGenerator } from "./UIDGenerator";
import { SVGSerializable, UID, XYCoords } from "./interfaces";


/**
 * @classdesc An ellipse class based on two vertices [centerX,centerY] and [radiusX,radiusY].
 *
 * @requires SVGSerializable
 * @requires UID
 * @requires UIDGenerator
 * @requires Vertex
 */
export class VEllipse implements SVGSerializable {


    /**
     * Required to generate proper CSS classes and other class related IDs.
     **/
    readonly className : string = "VEllipse";


    /**
     * The UID of this drawable object.
     *
     * @member {UID}
     * @memberof VEllipse
     * @instance
     * @readonly 
     */
    readonly uid : UID;
    
    
    /** 
     * @member {Vertex} 
     * @memberof VEllipse
     * @instance
     */
    center:Vertex;

    /** 
     * @member {Vertex} 
     * @memberof VEllipse
     * @instance
     */
    axis:Vertex;
    
    
    /**
     * The constructor.
     *
     * @constructor
     * @param {Vertex} center The ellipses center.
     * @param {Vertex} axis The x- and y-axis.
     * @name VEllipse
     **/
    constructor( center:Vertex, axis:Vertex ) {
	this.uid = UIDGenerator.next();
	this.center = center;
	this.axis = axis;
    };

    /**
     * Get the non-negative horizonal radius of this ellipse.
     *
     * @method radiusH
     * @instance
     * @memberof VEllipse
     * @return {number} The horizontal radius of this ellipse.
     */
    radiusH() : number {
	return Math.abs(this.axis.x - this.center.x);
    };

    /**
     * Get the non-negative vertical radius of this ellipse.
     *
     * @method radiusV
     * @instance
     * @memberof VEllipse
     * @return {number} The vertical radius of this ellipse.
     */
    radiusV() : number {
	return Math.abs(this.axis.y - this.center.y);
    };

    
    vertAt( angle:number ) : Vertex {
	// Tanks to Narasinham for the vertex-on-ellipse equations
	// https://math.stackexchange.com/questions/22064/calculating-a-point-that-lies-on-an-ellipse-given-an-angle
	const a : number = this.radiusH();
	const b : number = this.radiusV();
	return new Vertex( VEllipse.utils.polarToCartesian( this.center.x, this.center.y, a, b, angle ) );
    };
    

    /**
     * Create an SVG representation of this ellipse.
     *
     * @deprecated DEPRECATION Please use the drawutilssvg library and an XMLSerializer instead.
     * @param {object} options { className?:string }
     * @return string The SVG string
     */
    toSVGString( options:{className?:string } ) {
	options = options || {};
	var buffer : Array<string> = [];
	buffer.push( '<ellipse' );
	if( options.className )
	    buffer.push( ' class="' + options.className + '"' );
	buffer.push( ' cx="' + this.center.x + '"' );
	buffer.push( ' cy="' + this.center.y + '"' );
	buffer.push( ' rx="' + this.axis.x + '"' );
	buffer.push( ' ry="' + this.axis.y + '"' );
	buffer.push( ' />' );
	return buffer.join('');
    };

    /**
     * A static collection of ellipse-related helper functions.
     * @static
     */
    static utils = {

	/**
	 * Calculate a particular point on the outline of the given ellipse (center plus two radii plus angle).
	 *
	 * @name polarToCartesian
	 * @param {number} centerX - The x coordinate of the elliptic center.
	 * @param {number} centerY - The y coordinate of the elliptic center.
	 * @param {number} radiusH - The horizontal radius of the ellipse.
	 * @param {number} radiusV - The vertical radius of the ellipse.
	 * @param {number} angle - The angle (in radians) to get the desired outline point for.
	 * @reutn {XYCoords} The outlont point in absolute x-y-coordinates.
	 */
	polarToCartesian : ( centerX:number, centerY:number,
			     radiusH:number, radiusV:number,
			     angle:number ) : XYCoords => {
	    // Tanks to Narasinham for the vertex-on-ellipse equations
	    // https://math.stackexchange.com/questions/22064/calculating-a-point-that-lies-on-an-ellipse-given-an-angle
	    var s = Math.sin( Math.PI/2 - angle );
	    var c = Math.cos( Math.PI/2 - angle );
	    return { x : centerX + radiusH*radiusV*s / Math.sqrt( Math.pow(radiusH*c,2) + Math.pow(radiusV*s,2) ),
		     y : centerY + radiusH*radiusV*c / Math.sqrt( Math.pow(radiusH*c,2) + Math.pow(radiusV*s,2) )
		   };
	}
    }; // END utils
};
