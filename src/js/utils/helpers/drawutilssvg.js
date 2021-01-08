"use strict";
/**
 * UNFINISHED
 *
 * @author   Ikaros Kappler
 * @date     2021-01-03
 * @version  0.0.1
 **/
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawutilssvg = void 0;
var CircleSector_1 = require("../../CircleSector");
var CubicBezierCurve_1 = require("../../CubicBezierCurve");
var Vertex_1 = require("../../Vertex");
/**
 * @classdesc A helper class for basic SVG drawing operations. This class should
 * be compatible to the default 'draw' class.
 *
 * @requires CubicBzierCurvce
 * @requires Polygon
 * @requires SVGSerializable
 * @requires Vertex
 * @requires XYCoords
 */
var drawutilssvg = /** @class */ (function () {
    /**
     * The constructor.
     *
     * @constructor
     * @name drawutilssvg
     * @param {SVGElement} svgNode - The SVG node to use.
     * @param {boolean} fillShapes - Indicates if the constructed drawutils should fill all drawn shapes (if possible).
     **/
    function drawutilssvg(svgNode, offset, scale, canvasSize, viewport, fillShapes) {
        this.svgNode = svgNode;
        this.offset = new Vertex_1.Vertex(0, 0).set(offset);
        this.scale = new Vertex_1.Vertex(1, 1).set(scale);
        this.fillShapes = fillShapes;
        this.canvasSize = canvasSize;
        this.viewport = viewport;
        this.resize();
    }
    ;
    drawutilssvg.prototype.resize = function () {
        // this.svgNode.setAttribute('viewBox', `${this.viewport.min.x} ${this.viewport.min.y} ${this.viewport.width} ${this.viewport.height}`);
        // this.svgNode.setAttribute('viewBox', `0 0 ${this.viewport.width} ${this.viewport.height}`);
        this.svgNode.setAttribute('viewBox', "0 0 " + this.canvasSize.width + " " + this.canvasSize.height);
        this.svgNode.setAttribute('width', "" + this.canvasSize.width);
        this.svgNode.setAttribute('height', "" + this.canvasSize.height);
    };
    drawutilssvg.prototype.createNode = function (name) {
        var node = document.createElementNS("http://www.w3.org/2000/svg", name);
        this.svgNode.appendChild(node);
        return node;
    };
    ;
    /**
     * Called before each draw cycle.
     * This is required for compatibility with other draw classes in the library.
     **/
    drawutilssvg.prototype.beginDrawCycle = function () {
        // NOOP
    };
    ;
    drawutilssvg.prototype._x = function (x) { return this.offset.x + this.scale.x * x; };
    drawutilssvg.prototype._y = function (y) { return this.offset.y + this.scale.y * y; };
    /**
     * Draw the line between the given two points with the specified (CSS-) color.
     *
     * @method line
     * @param {Vertex} zA - The start point of the line.
     * @param {Vertex} zB - The end point of the line.
     * @param {string} color - Any valid CSS color string.
     * @param {number=1} lineWidth? - [optional] The line's width.
     * @return {void}
     * @instance
     * @memberof drawutils
     **/
    drawutilssvg.prototype.line = function (zA, zB, color, lineWidth) {
        var line = this.createNode('line');
        line.setAttribute('x1', "" + this._x(zA.x));
        line.setAttribute('y1', "" + this._y(zA.y));
        line.setAttribute('x2', "" + this._x(zB.x));
        line.setAttribute('y2', "" + this._y(zB.y));
        line.setAttribute('fill', this.fillShapes ? color : 'none');
        line.setAttribute('stroke', this.fillShapes ? 'none' : color);
        line.setAttribute('stroke-width', "" + (lineWidth || 1));
        return line;
    };
    ;
    /**
     * Draw a line and an arrow at the end (zB) of the given line with the specified (CSS-) color.
     *
     * @method arrow
     * @param {Vertex} zA - The start point of the arrow-line.
     * @param {Vertex} zB - The end point of the arrow-line.
     * @param {string} color - Any valid CSS color string.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutils
     **/
    drawutilssvg.prototype.arrow = function (zA, zB, color, lineWidth) {
        var pathNode = this.createNode('path');
        var headlen = 8; // length of head in pixels
        var vertices = Vertex_1.Vertex.utils.buildArrowHead(zA, zB, headlen, this.scale.x, this.scale.y);
        var d = [
            'M', this._x(zA.x), this._y(zA.y)
        ];
        for (var i = 0; i <= vertices.length; i++) {
            d.push('L');
            // Note: only use offset here (the vertices are already scaled)
            d.push(this.offset.x + vertices[i % vertices.length].x);
            d.push(this.offset.y + vertices[i % vertices.length].y);
        }
        pathNode.setAttribute('fill', this.fillShapes ? color : 'none');
        pathNode.setAttribute('stroke', this.fillShapes ? 'none' : color);
        pathNode.setAttribute('stroke-width', "" + (lineWidth || 1));
        pathNode.setAttribute('d', d.join(' '));
        return pathNode;
    };
    ;
    /**
     * Draw an image at the given position with the given size.<br>
     * <br>
     * Note: SVG images may have resizing issues at the moment.Draw a line and an arrow at the end (zB) of the given line with the specified (CSS-) color.
     *
     * @method image
     * @param {Image} image - The image object to draw.
     * @param {Vertex} position - The position to draw the the upper left corner at.
     * @param {Vertex} size - The x/y-size to draw the image with.
     * @return {void}
     * @instance
     * @memberof drawutils
     **/
    drawutilssvg.prototype.image = function (image, position, size) {
        // NOT YET IMPLEMENTED
    };
    ;
    // +---------------------------------------------------------------------------------
    // | This is the final helper function for drawing and filling stuff. It is not
    // | intended to be used from the outside.
    // |
    // | When in draw mode it draws the current shape.
    // | When in fill mode it fills the current shape.
    // |
    // | This function is usually only called internally.
    // |
    // | @param color A stroke/fill color to use.
    // +-------------------------------
    //_fillOrDraw( color:string ) {
    // NOT YET IMPLEMENTED
    //};
    /**
     * Draw the given (cubic) bézier curve.
     *
     * @method cubicBezier
     * @param {Vertex} startPoint - The start point of the cubic Bézier curve
     * @param {Vertex} endPoint   - The end point the cubic Bézier curve.
     * @param {Vertex} startControlPoint - The start control point the cubic Bézier curve.
     * @param {Vertex} endControlPoint   - The end control point the cubic Bézier curve.
     * @param {string} color - The CSS color to draw the curve with.
     * @param {number} lineWidth - (optional) The line width to use.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.cubicBezier = function (startPoint, endPoint, startControlPoint, endControlPoint, color, lineWidth) {
        if (startPoint instanceof CubicBezierCurve_1.CubicBezierCurve) {
            return this.cubicBezier(startPoint.startPoint, startPoint.endPoint, startPoint.startControlPoint, startPoint.endControlPoint, color, lineWidth);
        }
        var pathNode = this.createNode('path');
        // Draw curve
        var d = [
            'M', this._x(startPoint.x), this._y(startPoint.y),
            'C', this._x(startControlPoint.x), this._y(startControlPoint.y), this._x(endControlPoint.x), this._y(endControlPoint.y), this._x(endPoint.x), this._y(endPoint.y)
        ];
        pathNode.setAttribute('fill', this.fillShapes ? color : 'none');
        pathNode.setAttribute('stroke', this.fillShapes ? 'none' : color);
        pathNode.setAttribute('stroke-width', "" + (lineWidth || 1));
        pathNode.setAttribute('d', d.join(' '));
        return pathNode;
    };
    ;
    /**
     * Draw the given (cubic) Bézier path.
     *
     * The given path must be an array with n*3+1 vertices, where n is the number of
     * curves in the path:
     * <pre> [ point1, point1_startControl, point2_endControl, point2, point2_startControl, point3_endControl, point3, ... pointN_endControl, pointN ]</pre>
     *
     * @method cubicBezierPath
     * @param {Vertex[]} path - The cubic bezier path as described above.
     * @param {string} color - The CSS colot to draw the path with.
     * @param {number=1} lineWidth - (optional) The line width to use.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.cubicBezierPath = function (path, color, lineWidth) {
        var pathNode = this.createNode('path');
        if (!path || path.length == 0)
            return pathNode;
        // Draw curve
        var d = [
            'M', this._x(path[0].x), this._y(path[0].y)
        ];
        // Draw curve path
        var startPoint, endPoint, startControlPoint, endControlPoint;
        for (var i = 1; i < path.length; i += 3) {
            startControlPoint = path[i];
            endControlPoint = path[i + 1];
            endPoint = path[i + 2];
            d.push('C', this._x(startControlPoint.x), this._y(startControlPoint.y), this._x(endControlPoint.x), this._y(endControlPoint.y), this._x(endPoint.x), this._y(endPoint.y));
        }
        pathNode.setAttribute('fill', this.fillShapes ? color : 'none');
        pathNode.setAttribute('stroke', this.fillShapes ? 'none' : color);
        pathNode.setAttribute('stroke-width', "" + (lineWidth || 1));
        pathNode.setAttribute('d', d.join(' '));
        return pathNode;
    };
    ;
    /**
     * Draw the given handle and handle point (used to draw interactive Bézier curves).
     *
     * The colors for this are fixed and cannot be specified.
     *
     * @method handle
     * @param {Vertex} startPoint - The start of the handle.
     * @param {Vertex} endPoint - The end point of the handle.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.handle = function (startPoint, endPoint) {
        // NOT YET IMPLEMENTED
    };
    ;
    /**
     * Draw a handle line (with a light grey).
     *
     * @method handleLine
     * @param {Vertex} startPoint - The start point to draw the handle at.
     * @param {Vertex} endPoint - The end point to draw the handle at.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.handleLine = function (startPoint, endPoint) {
        // NOT YET IMPLEMENTED
    };
    ;
    /**
     * Draw a 1x1 dot with the specified (CSS-) color.
     *
     * @method dot
     * @param {Vertex} p - The position to draw the dot at.
     * @param {string} color - The CSS color to draw the dot with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.dot = function (p, color) {
        // NOT YET IMPLEMENTED
    };
    ;
    /**
     * Draw the given point with the specified (CSS-) color and radius 3.
     *
     * @method point
     * @param {Vertex} p - The position to draw the point at.
     * @param {string} color - The CSS color to draw the point with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.point = function (p, color) {
        // NOT YET IMPLEMENTED
    };
    ;
    /**
     * Draw a circle with the specified (CSS-) color and radius.<br>
     * <br>
     * Note that if the x- and y- scales are different the result will be an ellipse rather than a circle.
     *
     * @method circle
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {string} color - The CSS color to draw the circle with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.circle = function (center, radius, color, lineWidth) {
        var node = this.createNode('circle');
        node.setAttribute('cx', "" + this._x(center.x));
        node.setAttribute('cy', "" + this._y(center.y));
        node.setAttribute('r', "" + radius * this.scale.x); // y?
        node.setAttribute('fill', this.fillShapes ? color : 'none');
        node.setAttribute('stroke', this.fillShapes ? 'none' : color);
        node.setAttribute('stroke-width', "" + (lineWidth || 1));
        return node;
    };
    ;
    /**
     * Draw a circular arc (section of a circle) with the given CSS color.
     *
     * @method circleArc
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {number} startAngle - The angle to start at.
     * @param {number} endAngle - The angle to end at.
     * @param {string} color - The CSS color to draw the circle with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.circleArc = function (center, radius, startAngle, endAngle, color, lineWidth) {
        // NOT YET IMPLEMENTED
        var node = this.createNode('path');
        //const end : XYCoords = CircleSector.circleSectorUtils.polarToCartesian(x, y, radius, endAngle);
        //const start : XYCoords = CircleSector.circleSectorUtils.polarToCartesian(x, y, radius, startAngle);
        var arcData = CircleSector_1.CircleSector.circleSectorUtils.describeSVGArc(this._x(center.x), this._y(center.y), radius * this.scale.x, // y?
        startAngle, endAngle);
        // TODO: as SVGPathParams?
        /* const d : Array<number|string> = [
            'M', this._x(start.x), this._y(start.y),
            ...arcData
            ]; */
        node.setAttribute('d', arcData.join(' '));
        node.setAttribute('fill', this.fillShapes ? color : 'none');
        node.setAttribute('stroke', this.fillShapes ? 'none' : color);
        node.setAttribute('stroke-width', "" + (lineWidth || 1));
        return node;
    };
    ;
    /**
     * Draw an ellipse with the specified (CSS-) color and thw two radii.
     *
     * @method ellipse
     * @param {Vertex} center - The center of the ellipse.
     * @param {number} radiusX - The radius of the ellipse.
     * @param {number} radiusY - The radius of the ellipse.
     * @param {string} color - The CSS color to draw the ellipse with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.ellipse = function (center, radiusX, radiusY, color, lineWidth) {
        var node = this.createNode('ellipse');
        node.setAttribute('cx', "" + this._x(center.x));
        node.setAttribute('cy', "" + this._y(center.y));
        node.setAttribute('rx', "" + radiusX * this.scale.x);
        node.setAttribute('ry', "" + radiusY * this.scale.y);
        node.setAttribute('fill', this.fillShapes ? color : 'none');
        node.setAttribute('stroke', this.fillShapes ? 'none' : color);
        node.setAttribute('stroke-width', "" + (lineWidth || 1));
        return node;
    };
    ;
    /**
     * Draw square at the given center, size and with the specified (CSS-) color.<br>
     * <br>
     * Note that if the x-scale and the y-scale are different the result will be a rectangle rather than a square.
     *
     * @method square
     * @param {Vertex} center - The center of the square.
     * @param {Vertex} size - The size of the square.
     * @param {string} color - The CSS color to draw the square with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.square = function (center, size, color, lineWidth) {
        var node = this.createNode('rectangle');
        node.setAttribute('x', "" + this._x(center.x - size / 2.0));
        node.setAttribute('y', "" + this._y(center.y - size / 2.0));
        node.setAttribute('width', "" + size * this.scale.x);
        node.setAttribute('height', "" + size * this.scale.y);
        node.setAttribute('fill', this.fillShapes ? color : 'none');
        node.setAttribute('stroke', this.fillShapes ? 'none' : color);
        node.setAttribute('stroke-width', "" + (lineWidth || 1));
        return node;
    };
    ;
    /**
     * Draw a grid of horizontal and vertical lines with the given (CSS-) color.
     *
     * @method grid
     * @param {Vertex} center - The center of the grid.
     * @param {number} width - The total width of the grid (width/2 each to the left and to the right).
     * @param {number} height - The total height of the grid (height/2 each to the top and to the bottom).
     * @param {number} sizeX - The horizontal grid size.
     * @param {number} sizeY - The vertical grid size.
     * @param {string} color - The CSS color to draw the grid with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.grid = function (center, width, height, sizeX, sizeY, color) {
        console.log('grid');
        // NOT YET IMPLEMENTED
        /* this.ctx.beginPath();
        var yMin : number = -Math.ceil((height*0.5)/sizeY)*sizeY;
        var yMax : number = height/2;
        for( var x = -Math.ceil((width*0.5)/sizeX)*sizeX; x < width/2; x+=sizeX ) {
            this.ctx.moveTo( this.offset.x+(center.x+x)*this.scale.x, this.offset.y+(center.y+yMin)*this.scale.y );
            this.ctx.lineTo( this.offset.x+(center.x+x)*this.scale.x, this.offset.y+(center.y+yMax)*this.scale.y );
        }
    
        var xMin : number = -Math.ceil((width*0.5)/sizeX)*sizeX; // -Math.ceil((height*0.5)/sizeY)*sizeY;
        var xMax : number = width/2; // height/2;
        for( var y = -Math.ceil((height*0.5)/sizeY)*sizeY; y < height/2; y+=sizeY ) {
            this.ctx.moveTo( this.offset.x+(center.x+xMin)*this.scale.x-4, this.offset.y+(center.y+y)*this.scale.y );
            this.ctx.lineTo( this.offset.x+(center.x+xMax)*this.scale.x+4, this.offset.y+(center.y+y)*this.scale.y );
        }
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.0;
        this.ctx.stroke();
        this.ctx.closePath(); */
        var node = this.createNode('path');
        var d = [];
        var yMin = -Math.ceil((height * 0.5) / sizeY) * sizeY;
        var yMax = height / 2;
        for (var x = -Math.ceil((width * 0.5) / sizeX) * sizeX; x < width / 2; x += sizeX) {
            // this.ctx.moveTo( this.offset.x+(center.x+x)*this.scale.x, this.offset.y+(center.y+yMin)*this.scale.y );
            // this.ctx.lineTo( this.offset.x+(center.x+x)*this.scale.x, this.offset.y+(center.y+yMax)*this.scale.y );
            d.push('M', this._x(center.x + x), this._y(center.y + yMin));
            d.push('L', this._x(center.x + x), this._y(center.y + yMax));
        }
        var xMin = -Math.ceil((width * 0.5) / sizeX) * sizeX; // -Math.ceil((height*0.5)/sizeY)*sizeY;
        var xMax = width / 2; // height/2;
        for (var y = -Math.ceil((height * 0.5) / sizeY) * sizeY; y < height / 2; y += sizeY) {
            // this.ctx.moveTo( this.offset.x+(center.x+xMin)*this.scale.x-4, this.offset.y+(center.y+y)*this.scale.y );
            // this.ctx.lineTo( this.offset.x+(center.x+xMax)*this.scale.x+4, this.offset.y+(center.y+y)*this.scale.y );
            d.push('M', this._x(center.x + xMin), this._y(center.y + y));
            d.push('L', this._x(center.x + xMax), this._y(center.y + y));
        }
        console.log('d', d);
        node.setAttribute('d', d.join(' '));
        node.setAttribute('fill', this.fillShapes ? color : 'none');
        node.setAttribute('stroke', this.fillShapes ? 'none' : color);
        node.setAttribute('stroke-width', "" + 1);
        return node;
    };
    ;
    /**
     * Draw a raster of crosshairs in the given grid.<br>
     *
     * This works analogue to the grid() function
     *
     * @method raster
     * @param {Vertex} center - The center of the raster.
     * @param {number} width - The total width of the raster (width/2 each to the left and to the right).
     * @param {number} height - The total height of the raster (height/2 each to the top and to the bottom).
     * @param {number} sizeX - The horizontal raster size.
     * @param {number} sizeY - The vertical raster size.
     * @param {string} color - The CSS color to draw the raster with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.raster = function (center, width, height, sizeX, sizeY, color) {
        // NOT YET IMPLEMENTED
        console.log('raster');
        /* this.ctx.save();
        this.ctx.beginPath();
        var cx : number = 0, cy : number = 0;
        for( var x = -Math.ceil((width*0.5)/sizeX)*sizeX; x < width/2; x+=sizeX ) {
            cx++;
            for( var y = -Math.ceil((height*0.5)/sizeY)*sizeY; y < height/2; y+=sizeY ) {
            if( cx == 1 ) cy++;
            // Draw a crosshair
            this.ctx.moveTo( this.offset.x+(center.x+x)*this.scale.x-4, this.offset.y+(center.y+y)*this.scale.y );
            this.ctx.lineTo( this.offset.x+(center.x+x)*this.scale.x+4, this.offset.y+(center.y+y)*this.scale.y );
            this.ctx.moveTo( this.offset.x+(center.x+x)*this.scale.x, this.offset.y+(center.y+y)*this.scale.y-4 );
            this.ctx.lineTo( this.offset.x+(center.x+x)*this.scale.x, this.offset.y+(center.y+y)*this.scale.y+4 );
            }
        }
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.0;
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore(); */
        var node = this.createNode('path');
        var d = [];
        var cx = 0, cy = 0;
        for (var x = -Math.ceil((width * 0.5) / sizeX) * sizeX; x < width / 2; x += sizeX) {
            cx++;
            for (var y = -Math.ceil((height * 0.5) / sizeY) * sizeY; y < height / 2; y += sizeY) {
                if (cx == 1)
                    cy++;
                // Draw a crosshair
                // this.ctx.moveTo( this.offset.x+(center.x+x)*this.scale.x-4, this.offset.y+(center.y+y)*this.scale.y );
                // this.ctx.lineTo( this.offset.x+(center.x+x)*this.scale.x+4, this.offset.y+(center.y+y)*this.scale.y );
                // this.ctx.moveTo( this.offset.x+(center.x+x)*this.scale.x, this.offset.y+(center.y+y)*this.scale.y-4 );
                // this.ctx.lineTo( this.offset.x+(center.x+x)*this.scale.x, this.offset.y+(center.y+y)*this.scale.y+4 );
                d.push('M', this._x(center.x + x) - 4, this._y(center.y + y));
                d.push('L', this._x(center.x + x) + 4, this._y(center.y + y));
                d.push('M', this._x(center.x + x), this._y(center.y + y) - 4);
                d.push('L', this._x(center.x + x), this._y(center.y + y) + 4);
            }
        }
        console.log('d', d);
        node.setAttribute('d', d.join(' '));
        node.setAttribute('fill', this.fillShapes ? color : 'none');
        node.setAttribute('stroke', this.fillShapes ? 'none' : color);
        node.setAttribute('stroke-width', "" + 1);
        return node;
    };
    ;
    /**
     * Draw a diamond handle (square rotated by 45°) with the given CSS color.
     *
     * It is an inherent featur of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped diamonds.
     *
     * @method diamondHandle
     * @param {Vertex} center - The center of the diamond.
     * @param {Vertex} size - The x/y-size of the diamond.
     * @param {string} color - The CSS color to draw the diamond with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.diamondHandle = function (center, size, color) {
        // NOT YET IMPLEMENTED
    };
    ;
    /**
     * Draw a square handle with the given CSS color.<br>
     * <br>
     * It is an inherent featur of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped squares.
     *
     * @method squareHandle
     * @param {Vertex} center - The center of the square.
     * @param {Vertex} size - The x/y-size of the square.
     * @param {string} color - The CSS color to draw the square with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.squareHandle = function (center, size, color) {
        // NOT YET IMPLEMENTED
    };
    ;
    /**
     * Draw a circle handle with the given CSS color.<br>
     * <br>
     * It is an inherent featur of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped circles.
     *
     * @method circleHandle
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {string} color - The CSS color to draw the circle with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.circleHandle = function (center, size, color) {
        // NOT YET IMPLEMENTED
    };
    ;
    /**
     * Draw a crosshair with given radius and color at the given position.<br>
     * <br>
     * Note that the crosshair radius will not be affected by scaling.
     *
     * @method crosshair
     * @param {XYCoords} center - The center of the crosshair.
     * @param {number} radius - The radius of the crosshair.
     * @param {string} color - The CSS color to draw the crosshair with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.crosshair = function (center, radius, color) {
        // NOT YET IMPLEMENTED	
    };
    ;
    /**
     * Draw a polygon.
     *
     * @method polygon
     * @param {Polygon} polygon - The polygon to draw.
     * @param {string} color - The CSS color to draw the polygon with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.polygon = function (polygon, color, lineWidth) {
        // NOT YET IMPLEMENTED
        return this.polyline(polygon.vertices, polygon.isOpen, color, lineWidth);
    };
    ;
    /**
     * Draw a polygon line (alternative function to the polygon).
     *
     * @method polyline
     * @param {Vertex[]} vertices - The polygon vertices to draw.
     * @param {boolan}   isOpen   - If true the polyline will not be closed at its end.
     * @param {string}   color    - The CSS color to draw the polygon with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    drawutilssvg.prototype.polyline = function (vertices, isOpen, color, lineWidth) {
        // NOT YET IMPLEMENTED
        var pathNode = this.createNode('path');
        if (vertices.length == 0)
            return pathNode;
        // Draw curve
        var d = [
            'M', this._x(vertices[0].x), this._y(vertices[0].y)
        ];
        var n = vertices.length;
        for (var i = 1; i < n; i++) {
            d.push('L', this._x(vertices[i].x), this._y(vertices[i].y));
        }
        if (!isOpen)
            d.push('Z');
        pathNode.setAttribute('fill', this.fillShapes ? color : 'none');
        pathNode.setAttribute('stroke', this.fillShapes ? 'none' : color);
        pathNode.setAttribute('stroke-width', "" + (lineWidth || 1));
        pathNode.setAttribute('d', d.join(' '));
        return pathNode;
    };
    ;
    drawutilssvg.prototype.text = function (text, x, y, options) {
        // NOT YET IMPLEMENTED
    };
    ;
    /**
     * Draw a non-scaling text label at the given position.
     *
     * @method label
     * @param {string} text - The text to draw.
     * @param {number} x - The x-position to draw the text at.
     * @param {number} y - The y-position to draw the text at.
     * @param {number=} rotation - The (aoptional) rotation in radians.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    // +---------------------------------------------------------------------------------
    // | Draw a non-scaling text label at the given position.
    // +-------------------------------
    drawutilssvg.prototype.label = function (text, x, y, rotation) {
        // NOT YET IMPLEMENTED
    };
    ;
    /**
     * Due to gl compatibility there is a generic 'clear' function required
     * to avoid accessing the context object itself directly.
     *
     * This function just fills the whole canvas with a single color.
     *
     * @param {string} color - The color to clear with.
     **/
    drawutilssvg.prototype.clear = function (color) {
        // NOT YET IMPLEMENTED
    };
    ;
    return drawutilssvg;
}());
exports.drawutilssvg = drawutilssvg;
//# sourceMappingURL=drawutilssvg.js.map