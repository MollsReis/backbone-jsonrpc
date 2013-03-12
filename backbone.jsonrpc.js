(function($, _, Backbone) {

    (function(oldFetch){

        // pass along method as option in fetch
        Backbone.Model.prototype.fetch = function(options) {

            // check for method
            if (_.isUndefined(this.method)) throw 'no method defined';

            // add namespace to method if applicable
            var method = _.isUndefined(this.namespace) ? this.method : this.namespace + '.' + this.method;

            // data for request
            var data = { jsonrpc: '2.0', id: _.uniqueId(), method: method };

            // add params if present
            if (!_.isUndefined(this.params)) data.params = this.params;

            // call old fetch method with new options
            return oldFetch.call(this, _.extend({}, options, { type: 'post', data: data }));
        };

        // parse json-rpc response
        Backbone.Model.prototype.parse = function(resp) {
            return resp.result;
        };

    }(Backbone.Model.prototype.fetch));

    // overwrite Backbone.ajax with JSON-RPC method
    Backbone.ajax = function(options) {

        // make request
        return $.ajax(options);
    }
}($, _, Backbone));