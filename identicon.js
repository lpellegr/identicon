/*
 * Each patch is a polygon created from a list of vertices on a 5 by 5 grid.
 * Vertices are numbered from 0 to 24, starting from top-left corner of the
 * grid, moving left to right and top to bottom.
 */
Identicon.PATCHES = [
    [0, 4, 24, 20],
    [0, 4, 20],
    [2, 24, 20],
    [0, 2, 20, 22],
    [2, 14, 22, 10],
    [0, 14, 24, 22],
    [2, 24, 22, 13, 11, 22, 20],
    [0, 14, 22],
    [6, 8, 18, 16],
    [4, 20, 10, 12, 2],
    [0, 2, 12, 10],
    [10, 14, 22],
    [20, 12, 24],
    [10, 2, 12],
    [0, 2, 10]
];

Identicon.PATCH_GRIDS = 5;
Identicon.PATCH_TYPE_CENTER = [0, 4, 8, 15];
Identicon.DEFAULT_BACKGROUND_COLOR = "white";

Identicon.fromId = function(elementId, backgroundColor) {
    return Identicon.fromDOMElement(document.getElementById(elementId), backgroundColor);
}

Identicon.fromDOMElement = function(element, backgroundColor) {
    if (!backgroundColor) {
        backgroundColor = Identicon.DEFAULT_BACKGROUND_COLOR;
    }

    return new Identicon(element, backgroundColor);
}

/**
 * An identicon.
 * @constructor
 */
function Identicon(element, backgroundColor) {
    var element = element;
    var backgroundColor = backgroundColor;
    var code = element.getAttribute("data-value")
        .hashCode();
    var size = element.clientWidth;

    this.draw = function() {
        var middlePatchNumber = Identicon.PATCH_TYPE_CENTER[code & 3];
        var middleInvert = ((code >> 2) & 1) != 0;
        var cornerType = (code >> 3) & 15;
        var cornerInvert = ((code >> 7) & 1) != 0;
        var cornerTurn = (code >> 8) & 3;
        var sideType = (code >> 10) & 15;
        var sideInvert = ((code >> 14) & 1) != 0;
        var sideTurn = (code >> 15) & 3;
        var blue = (code >> 16) & 31;
        var green = (code >> 21) & 31;
        var red = (code >> 27) & 31;
        var color = "rgb(" + (red << 3) + "," + (green << 3) + "," + (blue << 3) + ")";

        var paper = Raphael(element, size, size);
        var paperBackground = paper.rect(0, 0, paper.width, paper.height);
        paperBackground.attr({
            "fill": backgroundColor,
            "stroke": "none"
        });

        var patchSize = size / 3;
        var patchSize2 = patchSize * 2;

        // middle patch
        drawPatch(paper, middlePatchNumber, patchSize, patchSize, patchSize, backgroundColor, color, 0, middleInvert);

        // side patches (N,E,S,O)
        drawPatch(paper, sideType, patchSize, patchSize, 0, backgroundColor, color, sideTurn++, sideInvert);
        drawPatch(paper, sideType, patchSize, patchSize2, patchSize, backgroundColor, color, sideTurn++, sideInvert);
        drawPatch(paper, sideType, patchSize, patchSize, patchSize2, backgroundColor, color, sideTurn++, sideInvert);
        drawPatch(paper, sideType, patchSize, 0, patchSize, backgroundColor, color, sideTurn++, sideInvert);

        // corner patches
        drawPatch(paper, cornerType, patchSize, 0, 0, backgroundColor, color, cornerTurn++, cornerInvert);
        drawPatch(paper, cornerType, patchSize, patchSize2, 0, backgroundColor, color, cornerTurn++, cornerInvert);
        drawPatch(paper, cornerType, patchSize, patchSize2, patchSize2, backgroundColor, color, cornerTurn++, cornerInvert);
        drawPatch(paper, cornerType, patchSize, 0, patchSize2, backgroundColor, color, cornerTurn++, cornerInvert);
    };

    function createPath(patch, x, y, scale, offset) {
        var mx = (patch[0] % Identicon.PATCH_GRIDS * scale - offset);
        mx += x + offset;

        var my = Math.floor(patch[0] / Identicon.PATCH_GRIDS) * scale - offset;
        my += y + offset;

        var result = "M" + mx + "," + my;

        for (var i = 1; i < patch.length; i++) {
            var v = patch[i];
            var vx = v % Identicon.PATCH_GRIDS * scale - offset;
            vx += x + offset;
            var vy = Math.floor(v / Identicon.PATCH_GRIDS) * scale - offset;
            vy += y + offset;

            result += "L" + vx + "," + vy;
        }

        result += "Z";
        return result;
    }

    function drawPatch(paper, patch, size, x, y, backgroundColor, foregroundColor, turn, invert) {
        patch %= Identicon.PATCHES.length;
        turn %= 4;

        if (patch == 15) {
            invert = !invert;
        }

        if (invert) {
            rectangle = paper.rect(x, y, size, size);
            rectangle.attr({
                "fill": foregroundColor,
                "stroke": "none"
            });
        }

        var offset = size / 2;
        var scale = size / 4;

        var path = createPath(Identicon.PATCHES[patch], x, y, scale, offset);

        var shape = paper.path(path);
        shape.rotate(turn * 90);
        shape.attr({
            "stroke": "none",
            "stroke-width": "1",
            "fill": invert ? backgroundColor : foregroundColor
        });
    };
}

String.prototype.hashCode = function() {
    var hash = 0;

    if (this.length == 0) {
        return hash;
    }

    for (i = 0; i < this.length; i++) {
        character = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash;
    }

    return hash;
}
