/*
 * morpwx front.js --- frontend interface
 */

function onDrop(event) {
  var files = event.dataTransfer.files;
  var elem = event.target || event.srcElement;
  if(!elem) { alert("cannot get elem"); }

  var x = "";
  for(var i = 0; i < files.length; ++i) {
    var reader = new FileReader();
    reader.onload = function(event) {
      var text = reader.result;
      var domParser = new DOMParser();
      var xml = domParser.parseFromString(text, 'application/xml');
      var pwx = new PWX();
      var pwxJson = pwx.readFromXML(xml);
      for(var j = 0; j < pwxJson.sample.length; ++j) {
	x += pwxJson.sample[j].timeoffset + "\n";
      }
      elem.value = x;
    }
    reader.readAsText(files[i], 'utf-8');
  }

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

