/**
 * @classdesc An ellipse class based on two vertices [centerX,centerY] and [radiusX,radiusY].
 *
 * @requires Vertex
 * 
 * @author   Ikaros Kappler
 * @date     2018-11-28
 * @modified 2018-12-04 Added the toSVGString function.
 * @modified 2020-03-25 Ported this class from vanilla-JS to Typescript.
 * @version  1.0.1
 *
 * @file VEllipse
 * @fileoverview Ellipses with a center and an x- and a y-axis (stored as a vertex).
 **/

class VEllipse implements SVGSerializable {

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
	this.center = center;
	this.axis = axis;
    };



    /**
     * Create an SVG representation of this ellipse.
     *
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
