module('Backbone.jsonRPC', {
    setup: function() {
        this.server = sinon.fakeServer.create();
        this.server.autoRespond = true;
        this.fakeUrl = '/server';
    },

    tearDown: function() {
        this.server.restore();
    }
});

test('init', 1, function() {
    ok(true);
});

asyncTest('make good request (no params)', 2, function() {
    var Model = Backbone.Model.extend({ url: this.fakeUrl, method: 'foo' })
    , myModel = new Model();

    myModel.fetch({ success: function() { equal(myModel.get('bar'), 'baz'); start(); } });

    this.server.respondWith('post', this.fakeUrl, function(req) {
        var data = qs.parse(req.requestBody)
        , responseBody = JSON.stringify({
            jsonrpc : '2.0',
            id      : 1,
            result  : { bar: 'baz' }
        });

        equal(data.method, 'foo');

        req.respond(200, { "Content-Type": "text/json", "Content-Length": responseBody.length }, responseBody);
    });
});

asyncTest('make good request (with params)', 3, function() {
    var Model = Backbone.Model.extend({ url: this.fakeUrl, method: 'sum', params: [5,6] })
    , myModel = new Model();

    myModel.fetch({ success: function() { equal(myModel.get('mysum'), 11); start(); } });

    this.server.respondWith('post', this.fakeUrl, function(req) {
        var data = qs.parse(req.requestBody)
        , responseBody = JSON.stringify({
            jsonrpc : '2.0',
            id      : 1,
            result  : { mysum: 11 }
        });

        equal(data.method, 'sum');
        deepEqual(data.params, ["5", "6"]);

        req.respond(200, { "Content-Type": "text/json", "Content-Length": responseBody.length }, responseBody);
    });
});

asyncTest('use a namespace', 2, function() {
    var Model = Backbone.Model.extend({ url: this.fakeUrl, method: 'foo', namespace: 'ns' })
    , myModel = new Model();

    myModel.fetch({ success: function() { ok(true); start(); } });

    this.server.respondWith('post', this.fakeUrl, function(req) {
        var data = qs.parse(req.requestBody)
            , responseBody = JSON.stringify({
                jsonrpc : '2.0',
                id      : 1,
                result  : { bar: 'baz' }
            });

        equal(data.method, 'ns.foo');

        req.respond(200, { "Content-Type": "text/json", "Content-Length": responseBody.length }, responseBody);
    });
});

test('make a bad request (missing method)', 1, function() {
    var Model = Backbone.Model.extend({ url: this.fakeUrl });
    raises(function() { (new Model()).fetch() });
});