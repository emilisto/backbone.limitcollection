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
            var args = Array.prototype.slice.call(this, arguments);
            Backbone.Collection.prototype.constructor.apply(this, args);

            options = _.defaults(options, {
                // Debounces reaction to events - i.e. improves performance
                // since many consecutive events within a short timeframe, will
                // be handled shortly after the last event was fired, instead
                // of once for every single event. However, note that
                // debouncing events means you have to treat the colleciton as
                // asynchronous - i.e. things you do to the base collection
                // will not have effect immediately.
                debounce: true,

                limit: 10
            });

            _.extend(this, options);

            this.collection = options.collection;
            if(!options.collection) throw "must supply a base collection";

            var onChange = options.debounce ? _.debounce(this._onChange, 0) : this._onChange;
            this.listenTo(this.collection, 'add remove sort reset', onChange);

            this._onChange();
        },

        // Heart of the collection. This is currently a very simple and
        // straight-forward approach: just recalculate the sets of models that
        // should be added or removed respectively whenever anything happens.
        //
        // One could definately make this more efficient by running this on
        // `sort` and `reset` events only. When adding or remove single models,
        // one could instead decide whether it belongs or not based on the
        // current occupancy of the collection. This would give better
        // performance for adding and removing of a few models at a time, in a
        // big collection.  This way we could also avoid debounce()'ing
        // adding/removal of single models.
        //
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
