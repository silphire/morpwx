/*
 * morpwx front.js --- frontend interface
 */

function onDrop(event) {
  alert("drop!");
  event.preventDefault();
}

function onDragOver(event) {
  event.preventDefault();
}

function init(elem) {
  if(!window.File) {
    return false;
  }

  if(!elem) {
    alert("element not found");
    return false;
  }

  elem.ondrop = onDrop;
  elem.ondragover = onDragOver;

  return true;
}

window.onload = function() {
  var x = init(document.getElementById('converter'))
  if(!x) { alert("cannot use"); }
}

