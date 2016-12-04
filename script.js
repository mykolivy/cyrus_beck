var NUMBER_OF_COORDS_PER_DOT = 2;
var DOT_RADIUS = 8;
var LINE_WIDTH = 3;

var canvas;
var gc;
var img = new Image();
var	ptrn;
var mainButton;

//All the lines that will be clipped
//Is an array of dots
var lines = new Array();
//The pollygon that defines clipping area
//Is an array of dots
var clippingPoly;

var scene = {
	lines: lines,
	innerLines: new Array(),
	invisibleLines: new Array(),
	polygons: new Array(),
	otherLines: new Array(),
	draw: function()
	{
		gc.fillStyle = ptrn;
		gc.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
		gc.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

		gc.strokeStyle = "#FF0000";
		if(this.otherLines) this.otherLines.forEach(drawLine);

		gc.strokeStyle = "#96281B";
		this.lines.forEach(drawLine);

		gc.strokeStyle = "#00FF00";
		if(this.innerLines) this.innerLines.forEach(drawLine);

		gc.strokeStyle = "#0000FF";
		if(this.invisibleLines) this.invisibleLines.forEach(drawLine);

		gc.strokeStyle = "#674172";
		if(clippingPoly) drawPoly(clippingPoly);

		window.requestAnimationFrame(draw);
	}
};

function draw()
{
	scene.draw();
}

window.onload = function()
{
	window.addEventListener("resize", resize);
	init();
	scene.draw();
}
function resize()
{
	canvas.style.width = document.body.offsetWidth + "px";
	canvas.style.height = document.body.offsetHeight + "px";
}
function init()
{
	logDiv = document.getElementById("logDiv");
	
	canvas = document.getElementById('mainCanvas');
	canvas.width = document.body.offsetWidth;
	canvas.height = document.body.offsetHeight;
	gc = canvas.getContext("2d");
	gc.lineWidth = LINE_WIDTH;

	img.src = "background.png";
	img.opacity = "0.2";
	ptrn = gc.createPattern(img, 'repeat');

	mainButton = document.getElementById('mainButton');

	input();
}
function drawLine(line)
{
	gc.beginPath();
	gc.moveTo(line[0],line[1]);
	gc.lineTo(line[2],line[3]);
	gc.stroke();
}
function drawPoly(poly)
{
	gc.beginPath();
	gc.moveTo(poly[0],poly[1]);
	for(var i = 2; i < poly.length-1; i+=2)
	{
		gc.lineTo(poly[i], poly[i+1]);
	}
	gc.lineTo(poly[0],poly[1]);
	gc.stroke();
}

var CURRENT_INPUT_FUNC = lineInput;
function input()
{
	CURRENT_INPUT_FUNC();
}

function polygonInput()
{
	clippingPoly = new Array();
	canvas.onclick = function(event)
	{
		clippingPoly = [event.clientX, event.clientY];

		canvas.onclick = function(event)
		{
			if(Math.abs(event.clientX - clippingPoly[0]) <= DOT_RADIUS &&
			   Math.abs(event.clientY - clippingPoly[1]) <= DOT_RADIUS)
			{
				canvas.onclick = null;
				mainButton.onclick = clip(lines, clippingPoly);
				mainButton.value = 'Clip';
			}
			else
			{
				clippingPoly = clippingPoly.concat([event.clientX, event.clientY]);
			}
		}
	}
}

var line;
function lineInput()
{
	line = new Array();
	canvas.onclick = function(event)
	{
		line = [event.clientX, event.clientY];
		canvas.onclick = function(event)
		{
			line = line.concat([event.clientX, event.clientY]);
			canvas.onclick = null;
			onLineInputEnd(line);
		}
	}
}

function onLineInputEnd(line)
{
	lines[lines.length] = line;
	CURRENT_INPUT_FUNC();
}

function addNormalsToScene(normals, poly)
{
	var middlePoints = getMiddlePointsOfPoly(poly);
	for(var i = 0; i < middlePoints.length; i++)
    {
        scene.otherLines[scene.otherLines.length] = [middlePoints[i][0],middlePoints[i][1],middlePoints[i][0] + normals[i][0] * 10,middlePoints[i][1] + normals[i][1] * 10];
    }
}

function invertClipping()
{
	var temp = scene.innerLines;
	scene.innerLines = scene.invisibleLines;
	scene.invisibleLines = temp;
}