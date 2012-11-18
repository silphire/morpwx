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
    var elem;
    var result = null;

    var num = function(name) {
      result = xml.evaluate('/pwx/workout/summarydata/' + name, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, result);
      console.log(result);
      console.log(result.resultType);
      if(result) { 
	var elem = result.singleNodeValue;
	summaryData[name] = elem;
	console.log(">>> " + elem);
      }
      else { console.log(name + " not found"); }
    };
    var mma = function(name) {
      var mma = {};
      var found = false;

      result = xml.evaluate('/pwx/workout/summarydata/' + name + '/@max', xml, null, XPathResult.STRING_TYPE, result);
      if(result) { mma['max'] = result.stringValue; found = true; }
      else { console.log(name + " max not found"); }

      result = xml.evaluate('/pwx/workout/summarydata/' + name + '/@min', xml, null, XPathResult.STRING_TYPE, result);
      if(result) { mma['min'] = result.stringValue; found = true; }
      else { console.log(name + " min not found"); }

      result = xml.evaluate('/pwx/workout/summarydata/' + name + '/@avg', xml, null, XPathResult.STRING_TYPE, result);
      if(result) { mma['avg'] = result.stringValue; found = true; }
      else { console.log(name + " avg not found"); }

      if(found) {
	summaryData[name] = mma;
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

