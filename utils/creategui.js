
var util = {
    /**
     * Creates a control GUI (a dat.gui instance) for this 
     * plot boilerplate instance.
     *
     * @method createGUI
     * @instance
     * @memberof PlotBoilerplate
     * @return {dat.gui.GUI} 
     **/
    createGUI : function(pb)  {
	var _self = pb;
	var gui = dat.gui.GUI();
	//var gui : GUI = new GUI();
	// var _self : PlotBoilerplate = this;
	gui.remember(this.config);
	var fold0 = gui.addFolder('Editor settings');
	var fold00 = fold0.addFolder('Canvas size');
	fold00.add(this.config, 'fullSize').onChange( function() { _self.resizeCanvas(); } ).title("Toggles the fullpage mode.").listen();
	fold00.add(this.config, 'fitToParent').onChange( function() { _self.resizeCanvas(); } ).title("Toggles the fit-to-parent mode to fit to parent container (overrides fullsize).").listen();
	fold00.add(this.config, 'defaultCanvasWidth').min(1).step(10).onChange( function() { _self.resizeCanvas(); } ).title("Specifies the fallback width.");
	fold00.add(this.config, 'defaultCanvasHeight').min(1).step(10).onChange( function() { _self.resizeCanvas(); } ).title("Specifies the fallback height.");
	fold00.add(this.config, 'canvasWidthFactor').min(0.1).step(0.1).max(10).onChange( function() { _self.resizeCanvas(); } ).title("Specifies a factor for the current width.").listen();
	fold00.add(this.config, 'canvasHeightFactor').min(0.1).step(0.1).max(10).onChange( function() { _self.resizeCanvas(); } ).title("Specifies a factor for the current height.").listen();
	fold00.add(this.config, 'cssScaleX').min(0.01).step(0.01).max(1.0).onChange( function() { if(_self.config.cssUniformScale) _self.config.cssScaleY = _self.config.cssScaleX; _self.updateCSSscale(); } ).title("Specifies the visual x scale (CSS).").listen();
	fold00.add(this.config, 'cssScaleY').min(0.01).step(0.01).max(1.0).onChange( function() { if(_self.config.cssUniformScale) _self.config.cssScaleX = _self.config.cssScaleY; _self.updateCSSscale(); } ).title("Specifies the visual y scale (CSS).").listen();
	fold00.add(this.config, 'cssUniformScale').onChange( function() { if(_self.config.cssUniformScale) _self.config.cssScaleY = _self.config.cssScaleX; _self.updateCSSscale(); } ).title("CSS uniform scale (x-scale equlsa y-scale).");
	fold00.add(this.config, 'setToRetina').name('Set to highres fullsize').title('Set canvas to high-res retina resoultion (x2).');
	
	var fold01 = fold0.addFolder('Draw settings');
	fold01.add(this.config, 'drawBezierHandlePoints').onChange( function() { _self.redraw(); } ).title("Draw Bézier handle points.");
	fold01.add(this.config, 'drawBezierHandleLines').onChange( function() { _self.redraw(); } ).title("Draw Bézier handle lines.");
	fold01.add(this.config, 'drawHandlePoints').onChange( function() { _self.redraw(); } ).title("Draw handle points (overrides all other settings).");
	fold01.add(this.config, 'drawHandleLines').onChange( function() { _self.redraw(); } ).title("Draw handle lines in general (overrides all other settings).");
	fold01.add(this.drawConfig, 'drawVertices').onChange( function() { _self.redraw(); } ).title("Draw vertices in general.");
	
	const fold0100 = fold01.addFolder('Colors and Lines');
	const _addDrawConfigElement = ( fold, basePath:any, conf:any ) : void => {
	    for( var i in conf ) {
		if( typeof conf[i] == 'object' ) {
		    if( conf[i].hasOwnProperty('color') )
			fold.addColor(conf[i], 'color').onChange( function() { _self.redraw(); } ).name(basePath+i+'.color').title(basePath+i+'.color').listen();
		    if( conf[i].hasOwnProperty('lineWidth') )
			fold.add(conf[i], 'lineWidth').min(1).max(10).step(1).onChange( function() { _self.redraw(); } ).name(basePath+i+'.lineWidth').title(basePath+i+'.lineWidth').listen();
		    for( var e in conf[i] ) {
			if( conf[i].hasOwnProperty(e) && typeof conf[i][e] == 'object' ) { // console.log(e);
			    _addDrawConfigElement( fold, (basePath!=''?basePath+'.':'')+i+'.'+e, conf[i] );
			}
		    }
		}
	    }
	};
	_addDrawConfigElement(fold0100, '', this.drawConfig);
	
	
	
	fold0.add(this.config, 'scaleX').title("Scale x.").min(0.01).max(10.0).step(0.01).onChange( function() { _self.draw.scale.x = _self.fill.scale.x = _self.config.scaleX; _self.redraw(); } ).listen();
	fold0.add(this.config, 'scaleY').title("Scale y.").min(0.01).max(10.0).step(0.01).onChange( function() { _self.draw.scale.y = _self.fill.scale.y = _self.config.scaleY; _self.redraw(); } ).listen();
	fold0.add(this.config, 'offsetX').title("Offset x.").step(10.0).onChange( function() { _self.draw.offset.x = _self.fill.offset.x = _self.config.offsetX; _self.redraw(); } ).listen();
	fold0.add(this.config, 'offsetY').title("Offset y.").step(10.0).onChange( function() { _self.draw.offset.y = _self.fill.offset.y = _self.config.offsetY; _self.redraw(); } ).listen();
	fold0.add(this.config, 'rasterGrid').title("Draw a fine raster instead a full grid.").onChange( function() { _self.redraw(); } ).listen();
	fold0.add(this.config, 'redrawOnResize').title("Automatically redraw the data if window or canvas is resized.").listen();
	fold0.addColor(this.config, 'backgroundColor').onChange( function() { _self.redraw(); } ).title("Choose a background color.");
	// fold0.add(this.config, 'loadImage').name('Load Image').title("Load a background image.");

	if( this.config.enableSVGExport ) {
	    var fold1 = gui.addFolder('Export');
	    fold1.add(this.config, 'saveFile').name('Save a file').title("Save as SVG.");
	}
	
	return gui;
    };
}; // END util
