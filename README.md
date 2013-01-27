# Backbone.LimitCollection

A proxy collection that always contains the first N models in a base
collection by listening and reacting to adding, removal and sorting of
models in the base collection. Very handy for imposing a limit when
rendering a collection without adding any complexity to the view.

Here's how it works in practice:

```javascript
var coll = new Backbone.Collection();
var limitColl = new Backbone.LimitCollection({
    limit: 20,
    debounce: false
});

coll.add(arrayOfOneHundredModels);

coll.length === 20; // true

coll.reset(coll.models.slice(0, 5));
coll.length === 5 // true
```

A very practical feature is that you can change the limit on the fly:

```javascript
coll.reset(arrayOfOneHundredModels);
coll.setLimit(50);
coll.length == 50; // true
```

The collection is read-only, so calling any methods like `add` or
`remove` on it will generate errors.

## Performance
Make note of the `debounce` option included in the above example. It's
default value is `true`, which is recommended. This means that if you
add or remove a large number of models from the parent collection, the
`LimitCollection` will wait until you've added or removed the last model
before updating. This greatly enhances performance, but also means you
can't expect the no. of models in the collection to have changed on the
next line-of-code. Rather it will be updated on the next event-loop
tick. (remember that Javascript is asynchronous but not concurrent.)

However, in a realworld situation you'd want to use it more like this:

```javascript
var coll = new Backbone.Collection();
var limitColl = new Backbone.LimitCollection({ limit: 20 });

coll.on('add', function(model) {
    view.renderNewModel(add);
});

coll.add(arrayOfOneHundredModels);
```

So in practice you don't have to worry about it.

# Compatibility
It's both browser and node.js compatible.

# Hacking
If you want to hack on `LimitCollection`, make sure to run the tests:

```bash
$ npm install # Make sure you got the dependencies installed
$ make test
```

# Copyright and the sorts
Authored by Emil Stenqvist <emsten@gmail.com> and released under the
[MIT license](http://mit-license.org).
