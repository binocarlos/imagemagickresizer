/*

	Story Time Island Page Model

	keeps track of a single page and the data needed for it's audio, text and elements
	
*/

var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var util = require('util');
var async = require('async');
var im = require('imagemagick');

module.exports = ImageProcessor;

function ImageProcessor(inputfolder, outputfolder, sizes){
	EventEmitter.call(this);

	if(!fs.existsSync(inputfolder)){
		throw new Error(inputfolder + ' does not exist');
	}

	this.sizes = sizes;
	this.inputfolder = inputfolder;
	this.outputfolder = outputfolder;
}

util.inherits(ImageProcessor, EventEmitter);

ImageProcessor.prototype.process = function(done){
	var self = this;

	var sizes = this.sizes;
	
	var files = fs.readdirSync(this.inputfolder);

	async.forEach(files, function(file, nextfile){
		if(!file.match(/\.(png|jpg)$/i)){
			nextfile();
			return;
		}

		var inpath = self.inputfolder + '/' + file;

		async.forEach(sizes, function(size, nextsize){
			var outpath = self.outputfolder + '/' + file;

			if(size.name){
				outpath = outpath.replace(/\.(\w+)$/, function(match, ext){
					return '.' + size.name + '.' + ext;
				})
			}

			async.series([
				function(nextstep){

					im.resize({
						srcPath:inpath,
						dstPath:outpath,
						quality:0.8,
						format:'png',
						height:size.height
					}, nextstep)
					
				},

				function(nextstep){

					im.crop({
						srcPath:outpath,
						dstPath:outpath,
						quality:0.8,
						format:'png',
						width:size.width,
						height:size.height
					}, nextstep)
					
				}
			], nextsize)
		}, nextfile)
		

	}, done)
}
