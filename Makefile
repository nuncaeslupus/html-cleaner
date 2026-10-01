.PHONY: build test clean

build:
	node build.js

test:
	node --test test.js

clean:
	rm -rf dist
