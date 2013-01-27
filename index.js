(function() {

    var global = this,
        _ = global._,
        Backbone = global.Backbone;

    if (typeof require !== 'undefined') {
        _ = require('underscore');
        Backbone = require('backbone');
    } else {
        _ = global._;
        Backbone = global._;
    }

    if(!_) throw TypeError("underscore is required");
    if(!Backbone) throw TypeError("Backbone is required");


    var LimitCollection = Backbone.Collection.extend({

        constructor: function(models, options) {
            Backbone.Collection.prototype.constructor.apply(this, arguments);

            options = _.defaults(options, {

                // Debounces reaction to events - i.e. improves performance
                // since many consecutive events within a short timeframe, will
                // be handled shortly after the last event was fired, instead
                // of once for every single event.
                debounce: true,
                limit: 10
            });

            _.extend(this, options);

            this.collection = options.collection;
            if(!options.collection) throw "must supply a base collection";

            var onChange = options.debounce ? _.debounce(this._onChange, 50) : this._onChange;
            this.listenTo(this.collection, 'add remove sort reset', onChange);

            this._onChange();
        },

        _onChange: function() {
            var belonging = this.collection.models.slice(0, this.limit),
                existing = this.models,
                toAdd = _.difference(belonging, existing),
                toRemove = _.difference(existing, belonging);

            this.add(toAdd);
            this.remove(toRemove);

            if(this.comparator !== this.collection.comparator) {
                this.comparator = this.collection.comparator;
                this.sort();
            }
        },

        setLimit: function(limit) {
            this.limit = limit;
            this._onChange();
        }
    });


    Backbone.LimitCollection = LimitCollection;
    if(typeof module !== 'undefined') {
        module.exports = LimitCollection;
    }

}).call(this);

