var assert = require('assert');
var libxmljs = require('libxmljs');

describe('root <pwx> element', function() {
  it("recognized <pwx> with namespace", function() {
    var ns = { p: "http://www.peaksware.com/PWX/1/0" };
    var xml = '<pwx xmlns="http://www.peaksware.com/PWX/1/0" />';
    var doc = libxmljs.parseXml(xml);
    var elem = doc.get('/p:pwx', ns);
    assert.equal('pwx', elem.name());
  });
});
