simple file writer
===================

A file writer that does it (hopefully) by the book :-)

Handles backpressure and buffering

###Install

```
npm install simple-file-writer
```

###usage

```
	var SimpleFileWriter = require('simple-file-writer');

	var writer = new SimpleFileWriter('./1.log');

	writer.write('yey!');

	writer.setupFile('./2.log');

	writer.write('yey!');	
```

###TODO:
tests!

