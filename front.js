/*
 * morpwx front.js --- frontend interface
 */

function onDrop(event) {
  var files = event.dataTransfer.files;
  var elem = event.target || event.srcElement;
  if(!elem) { alert("cannot get elem"); }

  var x = "";
  for(var i = 0; i < files.length; ++i) {
    x += files[i].name + " " + files[i].type + " " + files[i].size + "\n";
  }
  elem.value = x;

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

