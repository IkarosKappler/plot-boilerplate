/**
 * A script for testing the Greiner-Hormann polygon intersection algorithm with PlotBoilerplate.
 *
 * @requires PlotBoilerplate
 * @requires MouseHandler
 * @requires gup
 * @requires dat.gui
 * @requires greiner-hormann
 *
 * @author   Ikaros Kappler
 * @date     2020-11-29
 * @version  1.0.0
 **/

(function(_context) {
    "use strict";


    window.initializePB = function() {
	if( window.pbInitialized )
	    return;
	window.pbInitialized = true;

	// Fetch the GET params
	let GUP = gup();
	let Orange = Color.makeRGB( 255, 128, 0 );

	// All config params are optional.
	var pb = new PlotBoilerplate(
	    PlotBoilerplate.utils.safeMergeByKeys(
		{ canvas                : document.getElementById('my-canvas'),
		  fullSize              : true,
		  fitToParent           : true,
		  scaleX                : 1.0,
		  scaleY                : 1.0,
		  rasterGrid            : true,
		  drawGrid              : true,
		  drawOrigin            : false,
		  rasterAdjustFactor    : 2.0,
		  redrawOnResize        : true,
		  defaultCanvasWidth    : 1024,
		  defaultCanvasHeight   : 768,
		  canvasWidthFactor     : 1.0,
		  canvasHeightFactor    : 1.0,
		  cssScaleX             : 1.0,
		  cssScaleY             : 1.0,
		  cssUniformScale       : true,
		  autoAdjustOffset      : true,
		  offsetAdjustXPercent  : 50,
		  offsetAdjustYPercent  : 50,
		  backgroundColor       : '#ffffff',
		  enableMouse           : true,
		  enableKeys            : true,
		  enableTouch           : true,

		  enableSVGExport       : false
		}, GUP
	    )
	);

	var mousePosition = { x : Number.MAX_VALUE, y : Number.MAX_VALUE }; // XYCoords
	var verticesA = [];
	var verticesB = [];

	
	// +---------------------------------------------------------------------------------
	// | Pick a color from the WebColors array.
	// +-------------------------------
	var randomWebColor = function(index) {
	    return WebColors[ index % WebColors.length ].cssRGB();
	};

	
	// +---------------------------------------------------------------------------------
	// | Create a random vertex inside the canvas viewport.
	// +-------------------------------
	var randomVertex = function() {
	    return new Vertex( Math.random()*pb.canvasSize.width*0.5 - pb.canvasSize.width/2*0.5,
			       Math.random()*pb.canvasSize.height*0.5 - pb.canvasSize.height/2*0.5
			     );
	};

	// +---------------------------------------------------------------------------------
	// | Initialize 
	// +-------------------------------
	for( var i = 0; i < 7; i++ ) {
	    var vertA = randomVertex();
	    var vertB = randomVertex();
	    verticesA.push( vertA );
	    verticesB.push( vertB );
	    pb.add( vertA );
	    pb.add( vertB );
	}
	
	// +---------------------------------------------------------------------------------
	// | This is the actual render function.
	// +-------------------------------
	var drawAll = function() {
	    var polygonA = new Polygon( config.useConvexHullA ? getConvexHull(verticesA) : verticesA, false ); // Polygons are not open
	    var polygonB = new Polygon( config.useConvexHullB ? getConvexHull(verticesB) : verticesB, false );

	    var intersect = polygonsIntersect( polygonA, polygonB );

	    pb.draw.polygon( polygonA,
			     Teal.cssRGB(), // 'rgba(128,128,128,0.5)',
			     1.0 ); // Polygon is not open
	    pb.draw.polygon( polygonB,
			     Orange.cssRGB(), // 'rgba(128,128,128,0.5)',
			     1.0 ); // Polygon is not open

	    var intersect = polygonsIntersect( polygonA, polygonB );

	    var mouseInA = mousePosition != null && polygonA.containsVert(mousePosition);
	    var mouseInB = mousePosition != null && polygonB.containsVert(mousePosition);

	    pb.fill.label( 'polygonA.contains(mouse)=' + mouseInA, 3, 10, 0, 'black' );
	    pb.fill.label( 'polygonB.contains(mouse)=' + mouseInB, 3, 20, 0, 'black' );
	    pb.fill.label( 'polygonsIntersect=' + intersect, 3, 30, 0, 'black' );

	    // Array<Vertex>
	    var intersectionPoints = drawGreinerHormannIntersection( polygonA.vertices, polygonB.vertices );

	    drawTriangulation( intersectionPoints, polygonA, polygonB );
	};

	var drawGreinerHormannIntersection = function( source, clip ) {
	    // Array<Vertex> | Array<Array<Vertex>>
	    // TODO: the algorithm should be more clear here. Just return an array of Polygons.
	    //       If there is only one intersection polygon, there should be a returned
	    //       array with length 1. (or 0 if there is none; currently the result is null then).
	    var intersection = greinerHormann.intersection(source, clip);
	    var union        = greinerHormann.union(source, clip);
	    var diff         = greinerHormann.diff(source, clip);

	    // console.log( intersection );

	    // Collect all intersection points (may contain duplicates)
	    var intersectionPoints = [];

	    if( intersection ) {
		if( typeof intersection[0][0] === 'number' ) { // single linear ring
		    intersection = [intersection];
		    /* pb.fill.polyline( intersection,
				      'rgba(0,192,192,0.5)',
				      false,
				      2.0 ); // Polygon is not open */
		}
		
		//console.log( intersection );
		for( var i = 0, len = intersection.length; i < len; i++ ){
		    pb.fill.polyline( intersection[i],
				      false,
				     'rgba(0,192,192,0.25)',
				      2.0 ); // Polygon is not open
		    
		    for( var j = 0; j < intersection[i].length; j++ ) {
			intersectionPoints.push( intersection[i][j] ); // Add vertex
		    }    
		}
	    }
	    return intersectionPoints;
	};

	var drawTriangulation = function( intersectionPoints, polygonA, polygonB ) {
	    var delaunay = new Delaunay( intersectionPoints, {} );
	    // Array<Triangle>
	    var triangles = delaunay.triangulate();

	    for( var i in triangles ) {
		var tri = triangles[i];
		// Check if triangle belongs to the polygon or is outside
		if( !polygonA.containsVert( tri.getCentroid() ) )
		    continue;
		if( !polygonB.containsVert( tri.getCentroid() ) )
		    continue;

		// Cool, triangle is part of the intersection.
		pb.draw.polyline( [tri.a, tri.b, tri.c], false, 'rgb(0,128,255)', 1 );
		// pb.draw.crosshair( tri.a, 8, 'green' );
		// pb.draw.crosshair( tri.b, 8, 'green' );
		// pb.draw.crosshair( tri.c, 8, 'green' );
		drawFancyCrosshair( pb, tri.a, false, false );
		drawFancyCrosshair( pb, tri.b, false, false );
		drawFancyCrosshair( pb, tri.c, false, false );
	    }
	};



	// +---------------------------------------------------------------------------------
	// | Add a mouse listener to track the mouse position.
	// +-------------------------------
	new MouseHandler(pb.canvas,'girih-demo')
	    .move( function(e) {
		var relPos = pb.transformMousePosition( e.params.pos.x, e.params.pos.y );
		var cx = document.getElementById('cx');
		var cy = document.getElementById('cy');
		if( cx ) cx.innerHTML = relPos.x.toFixed(2);
		if( cy ) cy.innerHTML = relPos.y.toFixed(2);

		// handleMouseMove( relPos );
		// mousePosition = relPos;
		// pb.redraw();
	    } )
	    .click( function(e) {
		var relPos = pb.transformMousePosition( e.params.pos.x, e.params.pos.y );
		mousePosition = relPos;
		pb.redraw();
		
	    } );

	// +---------------------------------------------------------------------------------
	// | A global config that's attached to the dat.gui control interface.
	// +-------------------------------
	var config = PlotBoilerplate.utils.safeMergeByKeys( {
	    useConvexHullA : true,
	    useConvexHullB : true
	}, GUP );


	// +---------------------------------------------------------------------------------
	// | Initialize dat.gui
	// +-------------------------------
        {
	    var gui = pb.createGUI();
	    gui.add(config, 'useConvexHullA').listen().onChange( function() { pb.redraw(); } ).name("useConvexHullA").title("Use the convex hull of polygon A?");
	    gui.add(config, 'useConvexHullB').listen().onChange( function() { pb.redraw(); } ).name("useConvexHullB").title("Use the convex hull of polygon B?");
	    
	}

	pb.config.preDraw = drawAll;
	pb.redraw();
    }

    if( !window.pbPreventAutoLoad )
	window.addEventListener('load', window.initializePB );
    
    
})(window); 


