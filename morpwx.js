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
 *   segment: [], // TODO not implemented
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
      this.time = text.data;
    }
  }

  result = xml.evaluate('/p:pwx/p:workout/p:sportType/text()', xml, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, result);
  if(result) {
    var text = result.singleNodeValue;
    if(text) {
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
  };

  num('beginning');
  num('duration');
  num('durationstopped');
  num('work');
  mma('hr');
  mma('spd');
  mma('cad');
  num('dist');
  mma('alt');
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
  this.sample = samples;

  result = null;
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
    return +j * 0.239005736;
  }

  function mps2kph(n) {
    return +n * 3.6;
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
    date.setUTCMonth(+time.substr(5, 2) - 1);
    date.setUTCDate(time.substr(8, 2));
    date.setUTCHours(time.substr(11, 2));
    date.setUTCMinutes(time.substr(14, 2));
    date.setUTCSeconds(time.substr(17, 2));
    var tz;
    if(time.length == 20) {
      tz = 0;
    } else if(time.length == 25) {
      var tzsign = time.charAt(19);
      var tzhr   = +time.substr(20, 2);
      var tzmin  = +time.substr(23, 2);
      tz = (tzsign == '+' ? 1 : -1) * tzhr * 60 + tzmin;
    } else {
      // 時差が指定されていない時はローカルの時差を利用する。
      tz = (new Date()).getTimezoneOffset();
    }

    date.setTime(date.getTime() + +tz * 60000);
    return date;
  }

  function getDateString(date) {
    var time;
    time  = ("0000" + date.getUTCFullYear()).slice(-4)
      + "-" + ("00" + (+date.getUTCMonth() + 1)).slice(-2)
      + "-" + ("00" + date.getUTCDate()).slice(-2);
    time += 'T';
    time += ("00" + date.getUTCHours()).slice(-2) 
      + ":" + ("00" + date.getUTCMinutes()).slice(-2)
      + ":" + ("00" + date.getUTCSeconds()).slice(-2);
    return time;
  }

  var startTime = parseW3CDTF(this.time).getTime();
  function createTime(offset) {
    var date = new Date();
    date.setTime((+startTime) + (+offset) * 1000);
    return getDateString(date);
  }

  function convSportType(sportType) {
    if(sportType == "Run")
      return "Running";
    else if(sportType == "Bike") 
      return "Biking";
    else
      return "Other";
  }

  var tcx = '<?xml version="1.0" encoding="utf-8"?><TrainingCenterDatabase xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd" xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"><Activities>';
  if(this.sportType)
    tcx += '<Activity Sport="' + convSportType(this.sportType) + '">';

  var sd = this.summarydata;
  
  tcx += '<Id>' + this.time + '</Id>';
  tcx += '<Lap StartTime="' + createTime(0) + '">';
  if(sd.duration)
    tcx += '<TotalTimeSeconds>' + sd.duration + '</TotalTimeSeconds>';
  if(sd.dist)
    tcx += '<DistanceMeters>' + sd.dist + '</DistanceMeters>';
  if(sd.spd)
    tcx += '<MaximumSpeed>' + mps2kph(sd.spd.max) + '</MaximumSpeed>';
  if(sd.work)
    tcx += '<Calories>' + sd.work + '</Calories>';
  if(false && sd.hr) {	// RunKeeper cannot recognize heartrate parameters.
    tcx += '<AverageHeartRateBpm><Value>' + sd.hr.avg + '</Value></AverageHeartRateBpm>';
    tcx += '<MaximumHeartRateBpm><Value>' + sd.hr.max + '</Value></MaximumHeartRateBpm>';
  }
  tcx += '<Intensity>Active</Intensity>';  // "Active" or "Resting"
  if(sd.cad) {
    tcx += '<Cadence>';
    tcx += '<Low>' + sd.cad.min + '</Low>';
    tcx += '<High>' + sd.cad.max + '</High>';
    tcx += '</Cadence>';
  }
  tcx += '<TriggerMethod>Manual</TriggerMethod>';  // "Manual", "Distance", "Location", "Time", "HeartRate"

  tcx += '<Track>';
  for(var i = 0; i < this.sample.length; ++i) {
    var sample = this.sample[i];
    tcx += '<Trackpoint>'; 
    if(sample.timeoffset)
      tcx += '<Time>' +  createTime(sample.timeoffset) + '</Time>';
    if(sample.lat && sample.lon) {
      tcx += '<Position>';
      tcx += '<LatitudeDegrees>' +  sample.lat + '</LatitudeDegrees>';
      tcx += '<LongitudeDegrees>' +  sample.lon + '</LongitudeDegrees>';
      tcx += '</Position>';
    }
    if(sample.alt)
      tcx += '<AltitudeMeters>' + sample.alt + '</AltitudeMeters>';
    if(sample.hr)
      tcx += '<HeartRateBpm><Value>' + sample.hr + '</Value></HeartRateBpm>';
    if(sample.cad)
      tcx += '<Cadence>' + sample.cad + '</Cadence>';
    tcx += '</Trackpoint>'; 
  }
  tcx += '</Track>';
  tcx += '</Lap>';
  tcx += '</Activity>';
  tcx += '</Activities></TrainingCenterDatabase>';
  return tcx;
};

PWX.prototype.writeToHRM = function() {
  var hrm = '';

  return hrm;
};

