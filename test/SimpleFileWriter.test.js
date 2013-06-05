var SimpleFileWriter = require('../lib/SimpleFileWriter');
var assert = require('assert');
var Readable = require('stream').Readable;
var $u = require('util');
var fs = require('fs');

var testutil = require('./testutil');
var uuid = require('node-uuid');
var ROWS = 100;
var ROW_SIZE = 2511;


describe('basic tests - write stuff to disk - ', function () {
	it('strings with specified encoding', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

		assert.ok(writer instanceof SimpleFileWriter);
		
	 	writer.write(new Buffer('boo').toString('base64'), 'base64');		

		this.timeout(2000);
		setTimeout(function () {
			fs.readFile(logfile, 'base64', function(err, data) {
				if (err) {
					assert.fail(err);					
				}

				assert.strictEqual(new Buffer('boo').toString('base64'), data)
				done();
			});	
		}, 1000)
	});

	it('strings with a callback', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);
		var callbackCalled = false;

	 	writer.write('boo', function() {
	 		callbackCalled = true;
	 	});		

		this.timeout(2000);
		setTimeout(function () {
			fs.readFile(logfile, function(err, data) {
				if (err) {
					assert.fail(err);					
				}

				assert.deepEqual(new Buffer('boo'), data)
				assert.strictEqual(true, callbackCalled, 'callback not fired');
				done();
			});	
		}, 1000)
	});


	it('strings with a callback and encoding specified', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);
		var callbackCalled = false;

	 	writer.write(new Buffer('boo').toString('base64'), 'base64', function() {
	 		callbackCalled = true;
	 	});		

		this.timeout(2000);
		setTimeout(function () {
			fs.readFile(logfile, 'base64', function(err, data) {
				if (err) {
					assert.fail(err);					
				}

				assert.strictEqual(new Buffer('boo').toString('base64'), data)
				assert.strictEqual(true, callbackCalled, 'callback not fired');
				done();
			});	
		}, 1000)
	});

	it('buffers', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

	 	writer.write(new Buffer('boo'));		

		this.timeout(2000);
		setTimeout(function () {
			fs.readFile(logfile, function(err, data) {
				if (err) {
					assert.fail(err);					
				}

				assert.deepEqual(new Buffer('boo'), data)
				done();
			});	
		}, 1000)
	});

	it('buffers with callback', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);
		
		var callbackCalled = false;
	 	writer.write(new Buffer('boo'), function() {
	 		callbackCalled = true;
	 	});		

		this.timeout(2000);
		setTimeout(function () {
			fs.readFile(logfile, function(err, data) {
				if (err) {
					assert.fail(err);					
				}

				assert.deepEqual(new Buffer('boo'), data)
				assert.strictEqual(true, callbackCalled, 'callback not fired');
				done();
			});	
		}, 1000)
	});


	it('streams', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

	 	writer.write(new testutil.TestStream(testutil.createRowData(20)));		

		this.timeout(2000);
		setTimeout(function () {
			fs.readFile(logfile, 'utf8', testutil.verifyDataIntegrity(1, 20, done));	
		}, 1000)
	});

	it('streams with callback', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

		var callbackFired = false;
	 	writer.write(new testutil.TestStream(testutil.createRowData(20)), function () {
	 		callbackFired = true;
	 	});		

		this.timeout(2000);
		setTimeout(function () {
			assert.strictEqual(true, callbackFired);
			fs.readFile(logfile, 'utf8', testutil.verifyDataIntegrity(1, 20, done));	
		}, 1000)
	});


	it('mix', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

	 	writer.write(new Buffer('boo\n'));		
	 	writer.write(new testutil.TestStream('A' + testutil.createRowData(20)));
	 	writer.write(new testutil.TestStream('B' + testutil.createRowData(20)));
	 	writer.write('C' + testutil.createRowData(100));

		this.timeout(5000);
		setTimeout(function () {
			assert.strictEqual(0, writer._buffer.length);
			fs.readFile(logfile, 'utf8', function (err, data) {
				if (err)
					return assert.fail(err);

				var parsed = data.split('\n');

				assert.strictEqual(5, parsed.length);
				assert.strictEqual('', parsed[4]); // the empty row
				assert.strictEqual('boo', parsed[0]);
				assert.strictEqual('A', parsed[1][0]);
				assert.strictEqual('B', parsed[2][0]);
				assert.strictEqual('C', parsed[3][0]);

				done();
			});	
		}, 1000)
	});
});