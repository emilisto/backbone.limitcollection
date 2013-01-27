var assert = require('chai').assert,
    Backbone = require('backbone'),
    _ = require('underscore'),
    LimitCollection = require('../backbone.limitcollection');

suite('Backbone.LimitCollection', function() {

    var LIMIT = 200,
        TOTAL = 400;

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
                debounce: true
            });
        });

        test('should limit no. of models', function() {
            assert.equal(coll.length, coll.limit);
        });
        test('should contian the first `limit` models', function(done) {
            var union = _.union(baseColl.models.slice(0, coll.limit), coll.models);

            setTimeout(function() {
                assert.equal(union.length, coll.length);
                done();
            });
        });

        test('should limit', function(done) {
            var removeModel = models[0];
            baseColl.remove(removeModel);

            setTimeout(function() {
                assert.isUndefined(coll.get(removeModel));
                assert.equal(coll.length, LIMIT);
                done();
            });
        });

        test('should contain all models if base collection has N < limit no. of models', function(done) {
            baseColl.remove(models.slice(0, LIMIT));

            setTimeout(function() {
                assert.equal(coll.length, baseColl.length);
                done();
            });
        });

        test('should react to a changed limit', function(done) {
            coll.setLimit(3);

            setTimeout(function() {
                assert.equal(coll.length, 3);
                done();
            });
        });

        test('should work with an empty collection', function(done) {
            baseColl.reset();

            setTimeout(function() {
                assert.equal(coll.length, 0);
                done();
            });
        });

        test('should work with an empty collection', function(done) {
            baseColl.reset(models);

            setTimeout(function() {
                assert.equal(coll.limit, coll.length);
                done();
            });
        });

        test('should respond to sort changes', function(done) {

            var originalModels = coll.models.slice();

            baseColl.comparator = function(model) { return -model.get('num'); };
            baseColl.sort();

            setTimeout(function() {
                // NOTE: this is so we can do the _.union() test
                assert.ok(coll.limit >= baseColl.length / 2);

                var totalSet = _.union(originalModels, coll.models);
                assert.equal(totalSet.length, baseColl.length);
                done();
            });
        });

    });

});
