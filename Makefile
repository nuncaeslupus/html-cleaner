.PHONY: build test clean

node_modules: package.json
	npm install
	touch node_modules

build:
	node build.js

test: node_modules
	node --test test.js

clean:
	rm -rf dist
