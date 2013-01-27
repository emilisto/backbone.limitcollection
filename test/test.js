var assert = require('chai').assert,
    Backbone = require('backbone'),
    _ = require('underscore'),
    LimitCollection = require('../index.js');

suite('Backbone.LimitCollection', function() {

    var LIMIT = 1000,
        TOTAL = 2000;

    var models = _.map(_.range(1, TOTAL), function(i) {
        return new Backbone.Model({
            id: "m" + i.toString(),
            num: i
        });
    });

    function debug(coll) {
        return coll.pluck('id').join(', ');
    }

    suite("Basics", function() {

        test('should require a base collection', function() {
        });

    });

    suite("Limiting behavior", function() {

        var baseColl, coll;

        setup(function() {
            baseColl = new Backbone.Collection(models),
            coll = new LimitCollection([], {
                collection: baseColl,
                limit: LIMIT,
                debounce: false
            });
        });

        test('should limit no. of models', function() {
            assert.equal(coll.length, coll.limit);

        });
        test('should contian the first `limit` models', function() {
            var union = _.union(baseColl.models.slice(0, coll.limit), coll.models);
            assert.equal(union.length, coll.length);
        });

        test('should limit', function() {
            var removeModel = models[0];
            baseColl.remove(removeModel);
            assert.isUndefined(coll.get(removeModel));
            assert.equal(coll.length, LIMIT);
        });

        test('should contain all models if base collection has N < limit no. of models', function() {
            baseColl.remove(models.slice(0, LIMIT));
            assert.equal(coll.length, baseColl.length);
        });

        test('should react to a changed limit', function() {
            coll.setLimit(3);
            assert.equal(coll.length, 3);
        });

        test('should work with a reset collection', function() {
            baseColl.reset();
            assert.equal(coll.length, 0);

            baseColl.reset(models);
            assert.equal(coll.limit, coll.length);

        });

        test('should respond to sort changes', function() {

            var originalModels = coll.models.slice();

            baseColl.comparator = function(model) { return -model.get('num'); };
            baseColl.sort();

            // NOTE: this is so we can do the _.union() test
            assert.ok(coll.limit >= baseColl.length / 2);

            var totalSet = _.union(originalModels, coll.models);
            assert.equal(totalSet.length, baseColl.length);

        });

    });

    suite("Involved behavior", function() {

        var SortedCollection = Backbone.Collection.extend({
            //comparator: function(model) {
                //return model.get('num');
            //}
        });

    });

});
