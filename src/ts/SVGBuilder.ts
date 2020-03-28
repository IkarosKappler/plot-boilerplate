/**
 * A default SVG builder.
 *
 * Todos:
 *  + use a Drawable interface
 *  + use a SVGSerializable interface
 *
 * @require Vertex
 *
 * @author   Ikaros Kappler
 * @date     2018-12-04
 * @modified 2019-11-07 Added the 'Triangle' style class.
 * @modified 2019-11-13 Added the <?xml ...?> tag.
 * @modified 2020-03-25 Ported this class from vanilla-JS to Typescript.
 * @version  1.0.3
 **/

// This is a hotfix for the problem, that the constructor's "name" attribute is not
// visible in ES6:
//   >> The 'name' property is part of ES6 that's why you don't see it in lib.d.ts.
//   >> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
// ... does this collide with anything?
interface Function {
    name: string;
}


class SVGBuilder {

    constructor() {};


    /**
     *  Builds the SVG code from the given list of drawables.
     *
     * @param {object[]} drawables - The drawable elements (should implement Drawable) to be converted (each must have a toSVGString-function).
     * @param {object}   options  - { canvasSize, zoom, offset }
     * @return {string}
     **/
    build( drawables:Array<{toSVGString:(options:{className?:string})=>string}>,
	   options:{canvasSize:{width:number,height:number},zoom:Vertex,offset:Vertex}
	 ) {
	// options = options || {};
	var nl : string = '\n';
	var indent : string = '  ';
	var buffer : Array<string> = [];
	
	buffer.push( '<?xml version="1.0" encoding="UTF-8"?>' + nl );
	buffer.push( '<svg width="'+options.canvasSize.width+'" height="'+options.canvasSize.height+'"' );
	buffer.push( ' viewBox="' );
	buffer.push( '0' );
	buffer.push( ' ' );
	buffer.push( '0' );
	buffer.push( ' ' );
	buffer.push( options.canvasSize.width.toString() );
	buffer.push( ' ' );
	buffer.push( options.canvasSize.height.toString() );
	buffer.push( '"' );
	
	buffer.push( ' xmlns="http://www.w3.org/2000/svg">' + nl );

	buffer.push( indent + '<defs>' + nl );
	buffer.push( indent + '<style>' + nl);

	buffer.push( indent + indent + ' .Vertex { fill : blue; stroke : none; } ' + nl );
	buffer.push( indent + indent + ' .Triangle { fill : none; stroke : turquoise; stroke-width : 1px; } ' + nl );
	buffer.push( indent + indent + ' .Polygon { fill : none; stroke : green; stroke-width : 2px; } ' + nl );
	buffer.push( indent + indent + ' .BezierPath { fill : none; stroke : blue; stroke-width : 2px; } ' + nl );
	buffer.push( indent + indent + ' .VEllipse { fill : none; stroke : black; stroke-width : 1px; } ' + nl );
	buffer.push( indent + indent + ' .Line { fill : none; stroke : purple; stroke-width : 1px; } ' + nl );
	buffer.push( indent + '</style>' + nl );
	buffer.push( indent + '</defs>' + nl );

	buffer.push( indent + '<g class="main-g"' );
	if( options.zoom || options.offset ) {
	    buffer.push( ' transform="' );
	    if( options.zoom )
		buffer.push( 'scale(' + options.zoom.x + ',' + options.zoom.y + ')' );
	    if( options.offset )
		buffer.push( ' translate(' + options.offset.x + ',' + options.offset.y + ')' );
	    buffer.push( '"' ); 
	}
	buffer.push( '>' + nl );
	
	for( var i in drawables ) {
	    var d = drawables[i];
	    if( typeof d.toSVGString == 'function' ) {
		buffer.push( indent + indent );
		buffer.push( d.toSVGString( { 'className' : d.constructor.name } ) );
		buffer.push( nl );
	    } else {
		console.warn( 'Unrecognized drawable type has no toSVGString()-function. Ignoring: ' + d.constructor.name );
	    }
	}
	buffer.push( indent + '</g>' + nl );
	buffer.push( '</svg>' + nl );
	return buffer.join('');
    };
}