/*
 *
 */

/*
 * オブジェクト構造
 * {
 *   time: ,
 *   sportsType: ,
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
 *     hr:, 
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
  this.sportType = '';
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

  result = xml.evaluate('/p:pwx/p:workout/p:time/text()', xml, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, result);
  if(result) {
    var text = result.singleNodeValue;
    if(text) {
      obj.time = text.data;
      this.time = text.data;
    }
  }

  result = xml.evaluate('/p:pwx/p:workout/p:sportType/text()', xml, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, result);
  if(result) {
    var text = result.singleNodeValue;
    if(text) {
      obj.sportType = text.data;
      this.sportType = text.data;
    }
  }

  var num = function(name) {
    result = xml.evaluate('/p:pwx/p:workout/p:summarydata/p:' + name + '/text()', xml, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, result);
    if(result) {
      var text = result.singleNodeValue;
      if(text) { 
	summaryData[name] = text.data;
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
  this.summarydata = summaryData;

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
  this.sample = samples;

  result = null;
  return obj;
};

PWX.prototype.writeToJSON = function() {
  var json = "";
  return json;
};

/*
 * TCXファイル形式で出力する
 */
PWX.prototype.writeToTCX = function() {
  function joule2cal(j) {
    return j * 0.239005736;
  }

  /* yyyy-mm-ddThh:mm:ss
   * yyyy-mm-ddThh:mm:ssZ
   * yyyy-mm-ddThh:mm:ss[+-]hh:mm 
   * に対応する
   */
  function parseW3CDTF(time) {
    if(time) {
      if(!(time.length == 19 || time.length == 20 || time.length == 25))
	return;
    } else {
      return;
    }

    var date = new Date();
    date.setUTCFullYear(time.substr(0, 4));
    date.setUTCMonth(time.substr(5, 2) - 1);
    date.setUTCDate(time.substr(8, 2));
    date.setUTCHours(time.substr(11, 2));
    date.setUTCMinutes(time.substr(14, 2));
    date.setUTCSeconds(time.substr(17, 2));
    var tz;
    if(time.length == 19) {
      tz = 0;
    } else if(time.length == 25) {
      var tzsign = time.charAt(19);
      var tzhr   = time.substr(20, 2);
      var tzmin  = time.substr(23, 2);
      tz = (tzsign == '+' ? 1 : -1) * tzhr * 60 + tzmin;
    } else {
      tz = (new Date()).getTimeZoneOffset();
    }

    date.setTime(date.getTime() + tz * 60);
    return date;
  }

  function getDateString(date) {
    var time;
    time  = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay();
    time += 'T';
    time += date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return time;
  }

  var startTime = parseW3CDTF(this.time).getTime();
  function createTime(offset) {
    var date = new Date();
    date.setTime(startTime + offset);
  }

  var tcx = '<?xml version="1.0" encoding="utf-8"?><TrainingCenterDatabase xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd" xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"><Activities>';
  
  tcx += '<Lap StartTime="' + this.summarydata.beginning + '">';
  tcx += '<TotalTimeSeconds>' + this.summarydata.duration + '</TotalTimeSeconds>';
  tcx += '<DistanceMeters>' + this.summarydata.dist + '</DistanceMeters>';
  tcx += '<MaximumSpeed>' + this.summarydata.spd.max + '</MaximumSpeed>';
  tcx += '<Calories>' + this.summarydata.work + '</Calories>';
  tcx += '<AverageHeartRateBpm><Value>' + this.summarydata.hr.avg + '</Value></AverageHeartRateBpm>';
  tcx += '<MaximumHeartRateBpm><Value>' + this.summarydata.hr.max + '</Value></MaximumHeartRateBpm>';
  tcx += '<Intensity>Active</Intensity>';  // "Active" or "Resting"
  tcx += '<Cadence>';
  tcx += '<Low>' + this.summarydata.cad.min + '</Low>';
  tcx += '<High>' + this.summarydata.cad.max + '</High>';
  tcx += '</Cadence>';
  tcx += '<TriggerMethod>Manual</TriggerMethod>';  // "Manual", "Distance", "Location", "Time", "HeartRate"

  tcx += '<Track>';
  for(var i = 0; i < this.sample.length; ++i) {
    var sample = this.sample[i];
    tcx += '<Trackpoint>'; 
    tcx += '<Time>' +  createTime(sample.timeoffset) + '</Time>';
    tcx += '<Position>';
    tcx += '<LatitudeDegrees>' +  sample.lat + '</LatitudeDegrees>';
    tcx += '<LongitudeDegrees>' +  sample.lon + '</LongitudeDegrees>';
    tcx += '</Position>';
    tcx += '<AltitudeMeters>' + sample.alt + '</AltitudeMeters>';
    tcx += '<HeartRateBpm><Value>' + sample.hr + '</Value></HeartRateBpm>';
    tcx += '<Cadence>' + sample.cad + '</Cadence>';
    tcx += '</Trackpoint>'; 
  }
  tcx += '</Track>';
  tcx += '</Lap>';
  tcx += '</Activities></TrainingCenterDatabase>';
  return tcx;
}

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

