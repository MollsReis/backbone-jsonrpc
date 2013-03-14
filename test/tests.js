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
        var data = $.parseJSON(req.requestBody)
        , responseBody = JSON.stringify({
            jsonrpc : '2.0',
            id      : 1,
            result  : { bar: 'baz' }
        });

        equal(data.method, 'foo');

        req.respond(200, { "Content-Type": "text/json", "Content-Length": responseBody.length }, responseBody);
    });
});

asyncTest('make good request (single param)', 3, function() {
    var Model = Backbone.Model.extend({ url: this.fakeUrl, method: 'double', params: 5 })
        , myModel = new Model();

    myModel.fetch({ success: function() { equal(myModel.get('value'), 10); start(); } });

    this.server.respondWith('post', this.fakeUrl, function(req) {
        var data = $.parseJSON(req.requestBody)
            , responseBody = JSON.stringify({
                jsonrpc : '2.0',
                id      : 1,
                result  : { value: 10 }
            });

        equal(data.method, 'double');
        deepEqual(data.params, [5]);

        req.respond(200, { "Content-Type": "text/json", "Content-Length": responseBody.length }, responseBody);
    });
});

asyncTest('make good request (with unnamed params)', 3, function() {
    var Model = Backbone.Model.extend({ url: this.fakeUrl, method: 'sum', params: [5,6] })
    , myModel = new Model();

    myModel.fetch({ success: function() { equal(myModel.get('mysum'), 11); start(); } });

    this.server.respondWith('post', this.fakeUrl, function(req) {
        var data = $.parseJSON(req.requestBody)
        , responseBody = JSON.stringify({
            jsonrpc : '2.0',
            id      : 1,
            result  : { mysum: 11 }
        });

        equal(data.method, 'sum');
        deepEqual(data.params, [5, 6]);

        req.respond(200, { "Content-Type": "text/json", "Content-Length": responseBody.length }, responseBody);
    });
});

asyncTest('make good request (params is a function)', 3, function() {
    var Model = Backbone.Model.extend({ url: this.fakeUrl, method: 'info', params: function () { return [ this.get('uid') ]; } })
    , myModel = new Model({ uid: 170 });

    myModel.fetch({ success: function() { equal(myModel.get('name'), 'Farnsworth'); start(); } });

    this.server.respondWith('post', this.fakeUrl, function(req) {
        var data = $.parseJSON(req.requestBody)
            , responseBody = JSON.stringify({
                jsonrpc : '2.0',
                id      : 1,
                result  : { name: 'Farnsworth' }
            });

        equal(data.method, 'info');
        deepEqual(data.params, [170]);

        req.respond(200, { "Content-Type": "text/json", "Content-Length": responseBody.length }, responseBody);
    });
});

asyncTest('make good request (with named params)', 4, function() {
    var Model = Backbone.Model.extend({ url: this.fakeUrl, method: 'diff', params: { second: 5, first: 10 } })
        , myModel = new Model();

    myModel.fetch({ success: function() { equal(myModel.get('mydiff'), 5); start(); } });

    this.server.respondWith('post', this.fakeUrl, function(req) {
        var data = $.parseJSON(req.requestBody)
            , responseBody = JSON.stringify({
                jsonrpc : '2.0',
                id      : 1,
                result  : { mydiff: 5 }
            });

        equal(data.method, 'diff');
        equal(data.params.first, 10);
        equal(data.params.second, 5);

        req.respond(200, { "Content-Type": "text/json", "Content-Length": responseBody.length }, responseBody);
    });
});

asyncTest('use a namespace', 2, function() {
    var Model = Backbone.Model.extend({ url: this.fakeUrl, method: 'foo', namespace: 'ns' })
    , myModel = new Model();

    myModel.fetch({ success: function() { ok(true); start(); } });

    this.server.respondWith('post', this.fakeUrl, function(req) {
        var data = $.parseJSON(req.requestBody)
            , responseBody = JSON.stringify({
                jsonrpc : '2.0',
                id      : 1,
                result  : { bar: 'baz' }
            });

        equal(data.method, 'ns.foo');

        req.respond(200, { "Content-Type": "text/json", "Content-Length": responseBody.length }, responseBody);
    });
});

asyncTest('use a collection', 6, function() {
    var Model = Backbone.Model.extend()
    , Collection = Backbone.Collection.extend({ url: this.fakeUrl, namespace: 'coll', method: 'list', model: Model })
    , myColl = new Collection();

    myColl.fetch({ success: function() {
        equal(myColl.models.length, 2);
        equal(myColl.models[0].get('_id'), 1);
        equal(myColl.models[0].get('name'), 'Fry');
        equal(myColl.models[1].get('_id'), 2);
        equal(myColl.models[1].get('name'), 'Bender');
        start();
    }});

    this.server.respondWith('post', this.fakeUrl, function(req) {
        var data = $.parseJSON(req.requestBody)
        , responseBody = JSON.stringify({
            jsonrpc : '2.0',
            id      : 1,
            result  : [ { _id: 1, name: 'Fry' }, { _id: 2, name: 'Bender' } ]
        });

        equal(data.method, 'coll.list');

        req.respond(200, { "Content-Type": "text/json", "Content-Length": responseBody.length }, responseBody);
    });
});



test('make a bad request (missing method)', 1, function() {
    var Model = Backbone.Model.extend({ url: this.fakeUrl });
    raises(function() { (new Model()).fetch() });
});