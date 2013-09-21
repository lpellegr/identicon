all: compile

compile:
	closure-compiler identicon.js > identicon-min.js

clean:
	rm -f identicon-min.js
	