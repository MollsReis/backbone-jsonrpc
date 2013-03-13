(function($, _, Backbone) {

    // new fetch function
    var newFetch = function(oldFetch, options) {

        // check for method
        if (_.isUndefined(this.method)) throw 'no method defined';

        // add namespace to method if applicable
        var method = _.isUndefined(this.namespace) ? this.method : this.namespace + '.' + this.method;

        // data for request
        var data = { jsonrpc: '2.0', id: _.uniqueId(), method: method };

        // add params if present
        if (!_.isUndefined(this.params)) {
            if (_.isFunction(this.params)) data.params = this.params();
            else if (_.isArray(this.params) || _.isObject(this.params)) data.params = this.params;
            else data.params = [ this.params ];
        }

        // turn data into a JSON string
        data = JSON.stringify(data);

        // call old fetch method with new options
        return oldFetch.call(this, _.extend({}, options, { type: 'post', data: data }));
    };

    // pass along method as option in Backbone.Model.fetch
    Backbone.Model.prototype.fetch = _.partial(newFetch, Backbone.Model.prototype.fetch);

    // ...and Backbone.Collection.fetch
    Backbone.Collection.prototype.fetch = _.partial(newFetch, Backbone.Collection.prototype.fetch);

    // parse json-rpc response for Backbone.Models and Backbone.Collections
    Backbone.Model.prototype.parse = Backbone.Collection.prototype.parse = function(resp) {
        if (_.has(resp, 'result')) return resp.result;
        return resp;
    };

    // overwrite Backbone.ajax with JSON-RPC method
    Backbone.ajax = function(options) { return $.ajax(options); }

}($, _, Backbone));