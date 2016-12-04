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

class Window 
{
	//contents - array of lines
	//polygon - array of dots representing a polygon
	constructor(contents, polygon) 
	{
		this.contents = contents ? contents : new Array();
		this.polygon = polygon ? polygon : new Array();
		this.normals = new Array();
	}

	getBorderLines()
	{
		var lines = new Array();
		var poly = this.polygon;
		for(var i = 0; i < poly.length; i+=2)
		{
			lines[lines.length] = [poly[i], poly[i+1], poly[(i+2)%poly.length], poly[(i+3)%poly.length]];
		}
		return lines;
	}
}

var scene = {
	lines: lines,
	windows: new Array(),
	visibleLines: new Array(),
	draw: function()
	{
		gc.fillStyle = ptrn;
		gc.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
		gc.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

		gc.strokeStyle = "#674172";
		if(this.visibleLines) this.visibleLines.forEach(drawLine);

		gc.strokeStyle = "#674172";
		if(newContents) newContents.forEach(drawLine);

		if(this.windows) this.windows.forEach((w) => {
			if(w.contents) w.contents.forEach(drawLine);
			if(w.polygon) drawPoly(w.polygon);
		});

		if(newPolygon) drawLines(newPolygon);

		gc.strokeStyle = "#00FF00";
		if(this.visibleLines) this.visibleLines.forEach(drawLine);
		
		//if(newContents) newContents.forEach();
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

	windowInput();
}
function drawLine(line)
{
	gc.beginPath();
	gc.moveTo(line[0],line[1]);
	gc.lineTo(line[2],line[3]);
	gc.stroke();
}
function drawLines(poly)
{
	gc.beginPath();
	gc.moveTo(poly[0],poly[1]);
	for(var i = 2; i < poly.length-1; i+=2)
	{
		gc.lineTo(poly[i], poly[i+1]);
	}
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

var newPolygon;
function polygonInput()
{
	newPolygon = new Array();
	canvas.onclick = function(event)
	{
		newPolygon = [event.clientX, event.clientY];

		canvas.onclick = function(event)
		{
			if(Math.abs(event.clientX - newPolygon[0]) <= DOT_RADIUS &&
			   Math.abs(event.clientY - newPolygon[1]) <= DOT_RADIUS)
			{
				canvas.onclick = null;
				newWindow.polygon = newPolygon;
				lineInput();
			}
			else
			{
				newPolygon = newPolygon.concat([event.clientX, event.clientY]);
			}
		}
	}
}

var newContents = new Array();
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
			newContents[newContents.length] = line;
			newWindow.contents[newWindow.contents.length] = line;
			lineInput();
		}
	}
}

var newWindow = new Window();
function windowInput()
{
	if(newWindow) endWindowInput();
	newWindow = new Window();
	newContents = new Array();
	canvas.onclick = null;
	polygonInput();
}

function endWindowInput()
{
	if(newWindow && newWindow.polygon.length != 0) scene.windows[scene.windows.length] = newWindow;
}

function invertClipping()
{
	var temp = scene.innerLines;
	scene.innerLines = scene.invisibleLines;
	scene.invisibleLines = temp;
}

function clipAll()
{
	endWindowInput();
	canvas.onclick = null;
	for(var i = 0; i < scene.windows.length; i++)
	{
		scene.visibleLines = clip(scene.visibleLines,scene.windows[i], true);
		scene.visibleLines = scene.visibleLines.concat(clip(scene.windows[i].contents, scene.windows[i], false));
		scene.visibleLines = scene.visibleLines.concat(scene.windows[i].getBorderLines());
	}
}