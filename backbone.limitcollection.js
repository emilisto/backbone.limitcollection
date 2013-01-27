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


    var collProto = Backbone.Collection.prototype,
        add = collProto.add,
        remove = collProto.remove,
        sort = collProto.sort,
        reset = collProto.reset;

    // Raise an Error if one tries to modify the collection directly
    var modificationError = function() {
        throw Error("you can't modify this collection directly, it's just a proxy for the base collection");
    };

    var LimitCollection = Backbone.Collection.extend({

        constructor: function(options) {

            // Temporarily re-instate the #reset() method since the
            // Backbone.Collection constructor will call them.
            this.reset = function() {};
            collProto.constructor.call(this, [], options);
            delete this.reset;

            if(!_.isObject(options)) throw TypeError("options required");
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

            add.call(this, toAdd);
            remove.call(this, toRemove);

            if(this.comparator !== this.collection.comparator) {
                this.comparator = this.collection.comparator;
                sort.call(this);
            }

        },

        setLimit: function(limit) {
            this.limit = limit;
            this._onChange();
        }
    });

    // Make sure all methods that modify the colleciton generate errors when
    // called, since the LimitCollection should only be a read-only proxy to
    // the base collection.
    var lockedMethods = [
        'sync', 'add', 'remove', 'reset', 'update', 'push', 'pop', 'shift',
        'unshift', 'sort', 'fetch', 'create'
    ];
    _.extend(LimitCollection.prototype, _.object(_.map(lockedMethods, function(method) {
        return [ method, modificationError ];
    })));

    Backbone.LimitCollection = LimitCollection;
    if(typeof module !== 'undefined') {
        module.exports = LimitCollection;
    }

}).call(this);
