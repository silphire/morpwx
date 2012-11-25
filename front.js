/*
 * morpwx front.js --- frontend interface
 */

var tcxFiles = [];

function onDrop(event) {
  var files = event.dataTransfer.files;
  var elem = event.target || event.srcElement;
  if(!elem) { alert("cannot get elem"); }

  for(var i = 0; i < files.length; ++i) {
    var fileName = files[i].name.replace(/\.pwx/, '.tcx');
    var reader = new FileReader();
    reader.onload = function(event) {
      var text = reader.result;
      var domParser = new DOMParser();
      var xml = domParser.parseFromString(text, 'application/xml');
      var pwx = new PWX();
      pwx.readFromXML(xml);
      var tcx = pwx.writeToTCX();

      var blob = new Blob([tcx]);
      var blobURL = (window.URL || window.webkitURL).createObjectURL(blob);

      var filelist = document.getElementById('filelist');
      var nChildElems = 0;
      for(var i = 0; i < filelist.childNodes.length; ++i) {
	if(filelist.childNodes[i] == Node.ELEMENT_NODE) 
	  nChildElements += 1;
      }
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + pwx.time + '</td>'
	+ '<td>' + pwx.summarydata.duration + '</td>'
	+ '<td>' + pwx.sportType + '</td>'
	+ '<td>' + pwx.summarydata.dist + '</td>'
	+ '<td><a href="' + blobURL + '" download="' + fileName + '">保存</a></td>';
      filelist.appendChild(tr);
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

