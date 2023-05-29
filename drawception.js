var x = drawApp.context;
var c = drawingCanvas;

var o = "source-over";

function update() {
  c.onmousedown = setCompositeOperation;
  c.onmousemove = setCompositeOperation;
}
function normal() {
  o = "source-over";
  update();
}
function behind() {
  o = "destination-over";
  update();
}
function setCompositeOperation() {
  if (x.globalCompositeOperation != "destination-out") {
    x.globalCompositeOperation = o;
  }
}