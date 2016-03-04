var axios = require('../../index');

describe('requests', function () {
  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    jasmine.Ajax.uninstall();
  });

  it('should treat single string arg as url', function (done) {
    axios('/foo');

    setTimeout(function () {
      var request = jasmine.Ajax.requests.mostRecent();

      expect(request.url).toBe('/foo');
      expect(request.method).toBe('GET');
      done();
    }, 0);
  });

  it('should allow string arg as url, and config arg', function (done) {
    axios.post('/foo');

    setTimeout(function () {
      var request = jasmine.Ajax.requests.mostRecent();

      expect(request.url).toBe('/foo');
      expect(request.method).toBe('POST');
      done();
    }, 0);
  });

  it('should make an http request', function (done) {
    axios('/foo');

    setTimeout(function () {
      var request = jasmine.Ajax.requests.mostRecent();

      expect(request.url).toBe('/foo');
      done();
    }, 0);
  });

  it('should reject on network errors', function (done) {
    // disable jasmine.Ajax since we're hitting a non-existant server anyway
    jasmine.Ajax.uninstall();

    var resolveSpy = jasmine.createSpy('resolve');
    var rejectSpy = jasmine.createSpy('reject');

    var finish = function () {
      expect(resolveSpy).not.toHaveBeenCalled();
      expect(rejectSpy).toHaveBeenCalled();

      done();
    };

    axios('http://thisisnotaserver')
      .then(resolveSpy, rejectSpy)
      .then(finish, finish);
  });

  it('should make cross domian http request', function (done) {
    var response;

    axios.post('www.someurl.com/foo').then(function(res){
      response = res;
    });

    setTimeout(function () {
      var request = jasmine.Ajax.requests.mostRecent();
      request.respondWith({
        status: 200,
        statusText: 'OK',
        responseText: '{"foo": "bar"}',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setTimeout(function () {
        expect(response.data.foo).toEqual('bar');
        expect(response.status).toEqual(200);
        expect(response.statusText).toEqual('OK');
        expect(response.headers['content-type']).toEqual('application/json');
        done();
      }, 0);

    }, 0);

  });


  it('should supply correct response', function (done) {
    var response;

    axios.post('/foo').then(function (res) {
      response = res;
    });

    setTimeout(function () {
      var request = jasmine.Ajax.requests.mostRecent();

      request.respondWith({
        status: 200,
        statusText: 'OK',
        responseText: '{"foo": "bar"}',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setTimeout(function () {
        expect(response.data.foo).toEqual('bar');
        expect(response.status).toEqual(200);
        expect(response.statusText).toEqual('OK');
        expect(response.headers['content-type']).toEqual('application/json');
        done();
      }, 0);
    }, 0);
  });

  // https://github.com/mzabriskie/axios/issues/201
  it('should fix IE no content error', function (done) {
    var response;

    axios('/foo').then(function (res) {
      response = res
    });

    setTimeout(function () {
      var request = jasmine.Ajax.requests.mostRecent();

      request.respondWith({
        status: 1223,
        statusText: 'Unknown'
      });

      setTimeout(function () {
        expect(response.status).toEqual(204);
        expect(response.statusText).toEqual('No Content');
        done();
      }, 0);
    }, 0);
  });

  it('should allow overriding Content-Type header case-insensitive', function (done) {
    var response;
    var contentType = 'application/vnd.myapp.type+json';

    axios.post('/foo', { prop: 'value' }, {
      headers: {
        'content-type': contentType
      }
    }).then(function (res) {
      response = res;
    });

    setTimeout(function () {
      var request = jasmine.Ajax.requests.mostRecent();
      
      expect(request.requestHeaders['Content-Type']).toEqual(contentType);
      done();
    });
  });

  it('should support binary data as array buffer', function (done) {
    var input = new Int8Array(2);
    input[0] = 1;
    input[1] = 2;

    axios.post('/foo', input.buffer);

    setTimeout(function () {
      var request = jasmine.Ajax.requests.mostRecent();

      var output = new Int8Array(request.params.buffer);
      expect(output.length).toEqual(2);
      expect(output[0]).toEqual(1);
      expect(output[1]).toEqual(2);
      done();
    }, 0);
  });

  it('should support binary data as array buffer view', function (done) {
    var input = new Int8Array(2);
    input[0] = 1;
    input[1] = 2;

    axios.post('/foo', input);

    setTimeout(function () {
      var request = jasmine.Ajax.requests.mostRecent();

      var output = new Int8Array(request.params.buffer);
      expect(output.length).toEqual(2);
      expect(output[0]).toEqual(1);
      expect(output[1]).toEqual(2);
      done();
    }, 0);
  });

  it('should support array buffer response', function (done) {
    var response;

    function str2ab(str) {
      var buff = new ArrayBuffer(str.length * 2);
      var view = new Uint16Array(buff);
      for ( var i=0, l=str.length; i<l; i++) {
        view[i] = str.charCodeAt(i);
      }
      return buff;
    }

    axios('/foo', {
      responseType: 'arraybuffer'
    }).then(function (data) {
      response = data;
    });

    setTimeout(function () {
      var request = jasmine.Ajax.requests.mostRecent();

      request.respondWith({
        status: 200,
        response: str2ab('Hello world')
      });

      setTimeout(function () {
        expect(response.data.byteLength).toBe(22);
        done();
      }, 0);
    }, 0);
  });

});
