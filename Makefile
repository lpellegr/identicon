all: compile

compile:
	closure-compiler --js identicon.js --js_output_file identicon-compiled.js \
	    --compilation_level SIMPLE_OPTIMIZATIONS

clean:
	rm -f identicon-compiled.js
	