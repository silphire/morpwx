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

var pwx = {
  summarydata: {}, 
  sample: [], 

  /*
   * xml: DOMParser.parseFromString(xmltext, 'text/html')　しておいて下さい
   */
  readFromXML: function(xml) {
    var obj = {};
    var summaryData = {};
    var result = null;

    var nsResolver = { lookupNamespaceURI : function(prefix) {
      console.log("prefix " + prefix);
      return "http://www.peaksware.com/PWX/1/0";
    }};

    var num = function(name) {
      result = xml.evaluate('/pwx/workout/summarydata/' + name, xml, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, result);
      var elem = result.singleNodeValue;
      if(elem) { 
	summaryData[name] = elem.textContent;
	console.log(">>> " + name + " " + summaryData[name]);
      }
    };
    var mma = function(name) {
      var prop = {};
      var found = false;

      result = xml.evaluate('/pwx/workout/summarydata/' + name, xml, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, result);
      var elem = result.singleNodeValue;
      if(elem) { 
	prop.max = elem.getAttributeNode('max').textContent;
	prop.min = elem.getAttributeNode('min').textContent;
	prop.avg = elem.getAttributeNode('avg').textContent;
	summaryData[name] = prop;
	console.log(">>> " + name + " max:" + prop.max + " min:" + prop.min + " avg:" + prop.avg);
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

    result = null;
    return obj;
  }, 

  checkCompat: function() {
    return window.DOMParser;
  }, 
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

