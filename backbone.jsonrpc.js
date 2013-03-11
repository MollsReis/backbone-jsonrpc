(function($, _, Backbone) {

    (function(oldFetch){

        // pass along method as option in fetch
        Backbone.Model.prototype.fetch = function(options) {
            return oldFetch.call(this, _.extend({}, options, { method: this.method, params: this.params }));
        };

        // parse json-rpc response
        Backbone.Model.prototype.parse = function(resp) {
            return resp.result;
        };

    }(Backbone.Model.prototype.fetch));

    // overwrite Backbone.ajax with JSON-RPC method
    Backbone.ajax = function(options) {

        // check for method
        if (_.isUndefined(options.method)) throw 'no method defined';

        // data for request
        var data = {
            jsonrpc : '2.0',
            id      : _.uniqueId(),
            method  : options.method
        };

        // add params if present
        if (!_.isUndefined(options.params)) data.params = options.params;

        // make request
        return $.ajax({
            type     : 'post',
            url      : options.url,
            success  : options.success,
            error    : options.error,
            dataType : 'json',
            data     : data
        });
    }
}($, _, Backbone));