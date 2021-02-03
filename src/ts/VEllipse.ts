/**
 * @author   Ikaros Kappler
 * @date     2018-11-28
 * @modified 2018-12-04 Added the toSVGString function.
 * @modified 2020-03-25 Ported this class from vanilla-JS to Typescript.
 * @modified 2021-01-20 Added UID.
 * @version  1.1.0
 *
 * @file VEllipse
 * @fileoverview Ellipses with a center and an x- and a y-axis (stored as a vertex).
 **/


import { Vertex } from "./Vertex";
import { UIDGenerator } from "./UIDGenerator";
import { XYCoords, SVGSerializable, UID } from "./interfaces";


/**
 * @classdesc An ellipse class based on two vertices [centerX,centerY] and [radiusX,radiusY].
 *
 * @requires SVGSerializable
 * @requires UID
 * @requires UIDGenerator
 * @requires Vertex
 * @requires XYCoords
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
}
