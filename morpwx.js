/*
 *
 */

/*
 * オブジェクト構造
 * {
 *   summarydata: {
 *     beginning: , 
 *     duration: ,
 *     durationstopped: , 
 *     work: , 
 *     hr: { max:, min:, avg: }, 
 *     spd: { max:, min:, avg: }, 
 *     dist: , 
 *     alt: { max:, min:, avg: }, 
 *   }, 
 *   sample: [{
 *     timeoffset:, 
 *     spd:, 
 *     cad:, 
 *     dist:, 
 *     lat:, 
 *     lon:, 
 *     alt:, 
 *   }],
 * }
 */

function PWX() {
  this.time = '';
  this.summarydata = {}; 
  this.sample = []; 

  return this;
}

/*
 * xml: DOMParser.parseFromString(xmltext, 'text/html')　しておいて下さい
 */
PWX.prototype.readFromXML = function(xml) {
  var obj = {};
  var summaryData = {};
  var samples = [];
  var result = null;

  var nsResolver = { lookupNamespaceURI : function(prefix) {
    if(prefix == "p")
      return "http://www.peaksware.com/PWX/1/0";
    else
      return "";
  }};

  result = xml.evaluate('/p:pwx/p:workout/p:text' + name, xml, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, result);
  obj.time = '';

  var num = function(name) {
    result = xml.evaluate('/p:pwx/p:workout/p:summarydata/p:' + name, xml, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, result);
    var elem = result.singleNodeValue;
    if(elem) { 
      var text = elem.textContent;
      if(text) {
	summaryData[name] = text;
      }
    }
  };

  var mma = function(name) {
    var prop = {};
    var found = false;

    result = xml.evaluate('/p:pwx/p:workout/p:summarydata/p:' + name, xml, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, result);
    var elem = result.singleNodeValue;
    if(elem) { 
      prop.max = elem.getAttributeNode('max').textContent;
      prop.min = elem.getAttributeNode('min').textContent;
      prop.avg = elem.getAttributeNode('avg').textContent;
      summaryData[name] = prop;
    }
  }

  num('beginning');
  num('duration');
  num('durationstopped');
  num('work');
  mma('hr');
  mma('spd');
  mma('cad');
  num('dist');
  mma('alt');
  obj.summarydata = summaryData;

  result = xml.evaluate('/p:pwx/p:workout/p:sample', xml, nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, result);
  var sampleElem = result.iterateNext();
  while(sampleElem) {
    var sampleObj = {};
    var children = sampleElem.childNodes;
    for(var i = 0; i < children.length; ++i) {
      if(children[i].nodeType == Node.ELEMENT_NODE) {
	var name = children[i].nodeName;
	var text = children[i].textContent;
	if(name && text) {
	  sampleObj[name] = text;
	}
      }
    }

    samples.push(sampleObj);

    sampleElem = result.iterateNext();
  }
  obj.sample = samples;

  result = null;
  return obj;
};

PWX.prototype.writeToJSON = function() {
  var json = "";
  return json;
};

PWX.prototype.checkCompat = function() {
  return window.DOMParser;
};

/* debug code */
function debugmorpwx() {
  console.log("launch morpwx debug");
  var domParser = new DOMParser();
  var elem = document.getElementById('xmlarea');
  var xml = domParser.parseFromString(elem.value, 'text/xml');
  var obj = pwx.readFromXML(xml);
  console.log("result as follows");
  console.log(obj.summarydata.duration);
  console.log(obj.summarydata.work);
  return false;
};

