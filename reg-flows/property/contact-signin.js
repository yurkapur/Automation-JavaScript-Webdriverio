const test = require('tape');
const webdriverio = require('webdriverio');
const queryString = require('query-string');
var webdriverOptions = require('../../includes/webdriverOptions.js');
var envOptions = require('../../includes/envOptions.js');
var client = webdriverio.remote(webdriverOptions);

var testURL = envOptions.targetServer+'/?showMobileOptimized=true';
var target = '#btnContact';

client
  .init()
  .url(testURL)
  .setValue('#inputZipCode', 'Oakland, CA')
  .click('#submitBtn')
  .click('#homephoto0')
  .execute(function(done) {
    window.gaData = [];
    ga('set', 'sendHitTask', function(model) {
      window.gaData.push(model.get('hitPayload'));
      localStorage['gaData'] = window.gaData.toString();
    });
    return "GA listener setup"
  })
  .then(function(ret) {
    console.log(ret.value)
    console.log('URL is '+testURL);
    console.log('clicking on '+target);
  })
  .click(target)
  .waitForExist('#usr')
  .pause(300)
  .setValue('#usr', 'ahans@ziprealty.com')
  .setValue('#pwd', 'password')
  .click('input[value="Sign In"]')
  .waitForExist('#btnContactSubmit')
  .click('#btnContactSubmit')
  .waitForExist('a[data-panel-action="close"]')
  .click('a[data-panel-action="close"]')
  .execute(function() {
    return localStorage['gaData'];
  })
  .then(function(ret) {
    var payloadArr = ret.value.split(',');
    for(var i = 0;i<payloadArr.length;i++) {
      var gaPayload = queryString.parse(payloadArr[i]);
      console.log('event category: '+gaPayload.ec);
      console.log('event action: '+gaPayload.ea);
      console.log('event label: '+gaPayload.el);
    }
    test('GA payload property contact sign in', function (t) {
      t.plan(9);
      var gaPayload = queryString.parse(payloadArr[0]);
      t.equal(gaPayload.ec,'Contact');
      t.equal(gaPayload.ea,'invoke');
      t.equal(gaPayload.el,'Contact|hd-bottom-nav');
      var gaPayload = queryString.parse(payloadArr[1]);
      t.equal(gaPayload.ec,'sign_in');
      t.equal(gaPayload.ea,'complete');
      t.equal(gaPayload.el,'Contact|hd-bottom-nav');
      var gaPayload = queryString.parse(payloadArr[2]);
      t.equal(gaPayload.ec,'contact');
      t.equal(gaPayload.ea,'complete');
      t.equal(gaPayload.el,'contact|hd-bottom-nav');
    });
  })
  .pause(1000)
  .end();
