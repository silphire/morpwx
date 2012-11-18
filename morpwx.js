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
    var node;
    if(xml.nodeName !== 'pwx') 
      return false;
    node = xml.getElementsByTagName('workout');
    if(node && node.length > 0) {
      node = xml.getElementsByTagName('summarydata');
      if(node && node.length > 0) {
	node = node[0];
      } else {
	return false;
      }
    } else {
      return false;
    }

    return obj;
  }, 

  checkCompat: function() {
    return window.DOMParser;
  }, 
};

