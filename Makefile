.PHONY: all deps clean cleandeps

PARITYTOOLS = "../../../eth-utils/parity"

all: deps

deps:
	npm install

clean: cleandeps

cleandeps:
	rm -rf node_modules
