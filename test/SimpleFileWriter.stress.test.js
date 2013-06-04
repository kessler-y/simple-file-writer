var SimpleFileWriter = require('../lib/SimpleFileWriter');
var assert = require('assert');
var testutil = require('./testutil');
var fs = require('fs');

// TEST PARAMS
var rows = 10000;
var rowSize = 1333;
var rowData = testutil.createRowData(rowSize);

describe('stress string test - ', function () {

	it('write lots of strings', function (done) {
		var logfile = require('node-uuid')();
		testutil.logs.push(logfile);

		var writer = new SimpleFileWriter(logfile);

		var writes = 0;

		function callback() {
			if (++writes === rows) {		
				fs.readFile(logfile, 'utf8', testutil.verifyDataIntegrity(rows, rowSize, done));		
			}
		}

		for (var x = 0; x < rows; x++) 
		 	writer.write(rowData, callback);		

		this.timeout(15000);
		
	});

	it('write lots of streams (pipes them)', function (done) {
		var logfile = require('node-uuid')();
		testutil.logs.push(logfile);
		var writer = new SimpleFileWriter(logfile);
		var writes = 0;

		function callback() {
			if (++writes === rows) {			
				fs.readFile(logfile, 'utf8', testutil.verifyDataIntegrity(rows, rowSize, done));					
			}
		}
		
		for (var x = 0; x < rows; x++) {
			var s = new testutil.TestStream(rowData);
			writer.write(s, callback);		
		}

		this.timeout(20000);		

	});
});
