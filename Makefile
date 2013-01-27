test:
	@./node_modules/.bin/mocha -u tdd -R spec
watch:
	@./node_modules/.bin/mocha -u tdd -R spec --watch

.PHONY: test
