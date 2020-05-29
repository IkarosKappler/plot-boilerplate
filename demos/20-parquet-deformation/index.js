/**
 * A script for drawing pattern gradients.
 *
 * @requires PlotBoilerplate, MouseHandler, gup, dat.gui
 *
 * 
 * @author   Ikaros Kappler
 * @date     2019-05-25
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
	
	// All config params are optional.
	var pb = new PlotBoilerplate(
	    PlotBoilerplate.utils.safeMergeByKeys(
		{ canvas                : document.getElementById('my-canvas'),					    
		  fullSize              : true,
		  fitToParent           : true,
		  scaleX                : 1.0,
		  scaleY                : 1.0,
		  rasterGrid            : true,
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

	var DEG_TO_RAD = Math.PI/180.0;
	
	// var circleRadiusPct = 0.025;
	var drawAll = function() {
	    // Bounds: { ..., width, height }
	    var viewport = pb.viewport();
	    var circleRadius = viewport.width * (config.cellRadiusPct/100.0);
	    var circleDiameter = circleRadius*2.0;
	    // var outerHexagonDiameter = Math.sqrt( 5.0 * circleRadius * circleRadius / 4.0 ) * 1.035; // Scale up a bit :)
	    var outerHexagonDiameter = Math.sqrt( 4.0 * circleRadius * circleRadius / 3.0 );
	    var startXY = pb.transformMousePosition( circleRadius, circleRadius );
	    var endXY = pb.transformMousePosition( viewport.width-circleRadius, viewport.height-circleRadius );

	    var viewWidth = endXY.x - startXY.x;
	    var viewHeight = endXY.y - startXY.y;
	    var circleOffset = { x : circleDiameter,
				 y : Math.sqrt( 3*circleRadius*circleRadius )
			       };
	    var yOdd = false;
	    for( var y = startXY.y; y < endXY.y; y+=circleOffset.y ) {
		var yPct = 0.5-y/viewHeight;
		for( var x = startXY.x+(yOdd ? 0 : circleOffset.x/2.0); x < endXY.x; x+=circleOffset.x ) {
		    var xPct = 0.5-x/viewWidth;
		    var circle = new Circle( new Vertex(x,y), circleRadius );
		    // pb.draw.circle( circle.center, circle.radius, 'rgba(192,192,192,0.5)' );
		    // Make Bézier path (array of points)
		    var bPathPoints = circle2bezier( circle, 12, config.xOffset, config.yOffset, xPct, yPct, DEG_TO_RAD*config.startAngle );
		    // Make a hexagon that outscribes the circle
		    var outerNGonPoints = makeNGon( circle.center, outerHexagonDiameter, 6, Math.PI/6.0 );
		    pb.fill.polyline( outerNGonPoints, false, 'rgba(128,128,128,0.5)', 1 );
		    pb.fill.cubicBezierPath( bPathPoints, 'rgb(0,128,192)', 2 );
		}
		yOdd = !yOdd;
	    }
	};
	

	var circle2bezier = function( circle, pointCount, xOffset, yOffset, xPct, yPct, startAngle ) {
	    // Approximate circle with n Bézier curves:
	    // https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves
	    //   (4/3)*tan(pi/(2n))
	    var bPathPoints = [];
	    var lastTangent = null;
	    for( var i = 0; i <= pointCount; i++ ) {
		var tangent = circle.tangentAt( startAngle + i*Math.PI*2/pointCount );
		tangent.setLength( 4.0/3.0 * Math.tan( Math.PI/(2*pointCount) )* circle.radius );
		// pb.draw.line( tangent.a, tangent.b, 'rgb(0,192,192)' );
		// pb.draw.circleHandle( tangent.a, 5, 'rgb(0,192,192)' );

		if( i%2 ) {
		    //tangent.a.scale( 1-xPct*yPct, circle.center );
		    //tangent.b.scale( 1+xPct*yPct, circle.center );
		    tangent.a.scale( xOffset-xPct*yPct, circle.center );
		    tangent.b.scale( yOffset+xPct*yPct, circle.center );
		};

		if( !lastTangent ) {
		    // lastTangent.inv();
		    // curvePoints.push( [ lastTangent.a, tangent.a, lastTangent.b, tangent.b  ] );
		    bPathPoints.push( tangent.a );
		} else {
		    bPathPoints.push( lastTangent.b );
		    var tmp = tangent.clone().inv();
		    bPathPoints.push( tmp.b );
		    bPathPoints.push( tmp.a );
		}
		
		lastTangent = tangent;
	    }

	    // console.log( curvePoints );
	    //var path = BezierPath.fromArray( curvePoints );
	    return bPathPoints;
	};

	var makeNGon = function( center, radius, pointCount, startAngle ) {
	    var points = [];
	    var p;
	    var angleStep = Math.PI*2 / pointCount;
	    for( var i = 0; i < pointCount; i++ ) {
		p = center.clone().addX( radius );
		p.rotate( startAngle + i*angleStep, center );
		points.push( p );
	    }
	    return points;
	};


	// +---------------------------------------------------------------------------------
	// | Add a mouse listener to track the mouse position.
	// +-------------------------------
	new MouseHandler(pb.canvas,'convexhull-demo')
	    .move( function(e) {
		var relPos = pb.transformMousePosition( e.params.pos.x, e.params.pos.y );
		var cx = document.getElementById('cx');
		var cy = document.getElementById('cy');
		if( cx ) cx.innerHTML = relPos.x.toFixed(2);
		if( cy ) cy.innerHTML = relPos.y.toFixed(2);
	    } )
	    .up( function(e) {
		//if( e.params.wasDragged )
		//    return;
		//var vert = new Vertex( pb.transformMousePosition( e.params.pos.x, e.params.pos.y ) );
	    } );  


	// +---------------------------------------------------------------------------------
	// | A global config that's attached to the dat.gui control interface.
	// +-------------------------------
	var config = PlotBoilerplate.utils.safeMergeByKeys( {
	    pointCount            : 6,
	    startAngle            : 45.0, // Math.PI/2.0,
	    cellRadiusPct         : 2.5,   // %
	    xOffset               : 1.0,
	    yOffset               : 1.0
	    // animate               : false,
	}, GUP );
	

	// +---------------------------------------------------------------------------------
	// | Call when the number of desired points changed in config.pointCount.
	// +-------------------------------
	var updatePointList = function() {
	    //pointList.updatePointCount(config.pointCount,false); // No full cover
	    //animator = new LinearVertexAnimator( pointList.pointList, pb.viewport(), function() { pb.redraw(); } );
	};


	// +---------------------------------------------------------------------------------
	// | Some animation stuff.
	// +-------------------------------
	var animator = null;
	function renderAnimation() {
	    if( config.animate )
		window.requestAnimationFrame( renderAnimation );
	    else // Animation stopped
		; 
	};
	
	function toggleAnimation() {
	    if( config.animate ) {
		if( animator )
		    animator.start();
		renderAnimation();
	    } else {
		if( animator )
		    animator.stop();
		pb.redraw();
	    }
	};

	// +---------------------------------------------------------------------------------
	// | Initialize dat.gui
	// +-------------------------------
        {
	    var gui = pb.createGUI();
	    gui.add(config, 'startAngle').min(0).max(360).step(1.0).onChange( function() { pb.redraw(); } ).name("Start angle").title("The circle patterns' start angle.");
	    gui.add(config, 'cellRadiusPct').min(0.5).max(10).step(0.1).onChange( function() { pb.redraw(); } ).name("Cell size %").title("The cell radis");
	    gui.add(config, 'xOffset').min(-2.0).max(2.0).step(0.01).onChange( function() { pb.redraw(); } ).name("X offset").title("The x-axis offset.");
	    gui.add(config, 'yOffset').min(-2.0).max(2.0).step(0.01).onChange( function() { pb.redraw(); } ).name("Y offset").title("The y-axis offset.")
	}

	toggleAnimation();
	//updatePointList();

	pb.config.postDraw = drawAll;
	pb.redraw();

    }

    if( !window.pbPreventAutoLoad )
	window.addEventListener('load', window.initializePB );
    
    
})(window); 


