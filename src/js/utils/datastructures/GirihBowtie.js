"use strict";
/**
 * @classdesc The bow tie tile from the Girih set.
 *
 * @requires Bounds
 * @requires GirihTile
 * @requires Polygon
 * @requires TileType
 * @requires Vertex
 *
 * @author Ikaros Kappler
 * @modified 2013-11-28
 * @modified 2014-04-05 Ikaros Kappler (member array outerTilePolygons added).
 * @modified 2015-03-19 Ikaros Kappler (added toSVG()).
 * @modified 2020-10-31 Refactored to work with PlotBoilerplate.
 * @modified 2020-11-13 Ported from vanilla JS to TypeScript.
 * @version 2.0.1-alpha
 * @file GirihBowtie
 * @public
 **/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Bounds_1 = require("../../Bounds");
var GirihTile_1 = require("./GirihTile");
var Polygon_1 = require("../../Polygon");
var Vertex_1 = require("../../Vertex");
var GirihBowtie = /** @class */ (function (_super) {
    __extends(GirihBowtie, _super);
    /**
     * @constructor
     * @extends GirihTile
     * @name GirihBowtie
     * @param {Vertex} position
     * @param {number} size
     */
    function GirihBowtie(position, size) {
        var _this = _super.call(this, position, size, GirihTile_1.TileType.TYPE_BOW_TIE) || this;
        // Overwrite the default symmetries:
        //    the bow-tie tile has a 180° symmetry (5/10 * 360°)
        _this.uniqueSymmetries = 5;
        // Init the actual decahedron shape with the passed size
        var pointA = new Vertex_1.Vertex(0, 0);
        var pointB = pointA;
        var startPoint = pointA;
        var oppositePoint = null;
        _this.addVertex(pointB);
        // TODO: notate in radians
        var angles = [0.0,
            72.0,
            72.0,
            216.0,
            72.0
        ];
        var theta = 0.0;
        for (var i = 0; i < angles.length; i++) {
            theta += (180.0 - angles[i]);
            pointA = pointB; // center of rotation
            pointB = pointB.clone();
            pointB.x -= size;
            pointB.rotate(theta * (Math.PI / 180.0), pointA);
            _this.addVertex(pointB);
            if (i == 2)
                oppositePoint = pointB;
        }
        // Move to center and position 
        var bounds = Bounds_1.Bounds.computeFromVertices(_this.vertices);
        var move = new Vertex_1.Vertex((oppositePoint.x - startPoint.x) / 2.0, // bounds.getWidth()/2.0,
        (oppositePoint.y - startPoint.y) / 2.0 // -size/2.0
        );
        for (var i = 0; i < _this.vertices.length; i++) {
            _this.vertices[i].add(position).sub(move);
        }
        _this.imageProperties = {
            source: { x: 288 / 500.0,
                y: 7 / 460.0,
                width: 206 / 500.0,
                height: 150 / 460.0
                //angle:  0.0   // IKRS.Girih.MINIMAL_ANGLE
            },
            destination: { xOffset: 0.0,
                yOffset: 0.0
            }
        };
        _this._buildInnerPolygons(size);
        _this._buildOuterPolygons(size); // Only call AFTER the inner polygons were created!
        return _this;
    }
    ;
    /**
     * @abstract Subclasses must override this.
     */
    GirihBowtie.prototype.clone = function () {
        return new GirihBowtie(this.position.clone(), this.size).rotate(this.rotation);
    };
    ;
    GirihBowtie.prototype._buildInnerPolygons = function (edgeLength) {
        var indices = [1, 4];
        for (var i = 0; i < indices.length; i++) {
            var index = indices[i];
            var middlePoint = this.getVertexAt(index).clone().scale(0.5, this.getVertexAt(index + 1));
            var leftPoint = this.getVertexAt(index - 1).clone().scale(0.5, this.getVertexAt(index));
            var rightPoint = this.getVertexAt(index + 1).clone().scale(0.5, this.getVertexAt(index + 2));
            var innerPoint = middlePoint.clone().scale(0.38, this.position); // multiplyScalar( 0.38 );
            var innerTile = new Polygon_1.Polygon([]);
            innerTile.addVertex(middlePoint);
            innerTile.addVertex(rightPoint);
            innerTile.addVertex(innerPoint);
            innerTile.addVertex(leftPoint);
            this.innerTilePolygons.push(innerTile);
        }
    };
    ;
    GirihBowtie.prototype._buildOuterPolygons = function (edgeLength) {
        // Add the outer four 'edges'
        var indices = [0, 3];
        for (var i = 0; i < indices.length; i++) {
            var index = indices[i];
            // The first/third triangle
            var outerTileA = new Polygon_1.Polygon();
            outerTileA.addVertex(this.innerTilePolygons[i].getVertexAt(0).clone());
            outerTileA.addVertex(this.getVertexAt(index + 2).clone());
            outerTileA.addVertex(this.innerTilePolygons[i].getVertexAt(1).clone());
            this.outerTilePolygons.push(outerTileA);
            // The second/fourth triangle
            var outerTileB = new Polygon_1.Polygon();
            outerTileB.addVertex(this.innerTilePolygons[i].getVertexAt(0).clone());
            outerTileB.addVertex(this.getVertexAt(index + 1).clone());
            outerTileB.addVertex(this.innerTilePolygons[i].getVertexAt(3).clone());
            this.outerTilePolygons.push(outerTileB);
        }
        // Add the center polygon
        var centerTile = new Polygon_1.Polygon();
        centerTile.addVertex(this.getVertexAt(0).clone());
        centerTile.addVertex(this.innerTilePolygons[0].getVertexAt(3).clone());
        centerTile.addVertex(this.innerTilePolygons[0].getVertexAt(2).clone());
        centerTile.addVertex(this.innerTilePolygons[0].getVertexAt(1).clone());
        centerTile.addVertex(this.getVertexAt(3).clone());
        centerTile.addVertex(this.innerTilePolygons[1].getVertexAt(3).clone());
        centerTile.addVertex(this.innerTilePolygons[1].getVertexAt(2).clone());
        centerTile.addVertex(this.innerTilePolygons[1].getVertexAt(1).clone());
        this.outerTilePolygons.push(centerTile);
    };
    ;
    return GirihBowtie;
}(GirihTile_1.GirihTile));
exports.GirihBowtie = GirihBowtie;
//# sourceMappingURL=GirihBowtie.js.map