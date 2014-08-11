var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var util = require('util');
var async = require('async');
var im = require('imagemagick');

function ImageProcessor(){
	EventEmitter.call(this);	
}

util.inherits(ImageProcessor, EventEmitter);

ImageProcessor.prototype.image = function(inpath, outpath, size, done){
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
	], done)
}

ImageProcessor.prototype.folder = function(inputfolder, outputfolder, sizes, done){
	var self = this;

	if(!fs.existsSync(inputfolder)){
		throw new Error(inputfolder + ' does not exist');
	}

	var files = fs.readdirSync(inputfolder);

	async.forEach(files, function(file, nextfile){

		if(!file.match(/\.(png|jpg)$/i)){
			nextfile();
			return;
		}

		var inpath = inputfolder + '/' + file;

		async.forEach(sizes, function(size, nextsize){
			var outpath = outputfolder + '/' + file;

			if(size.name){
				outpath = outpath.replace(/\.(\w+)$/, function(match, ext){
					return '.' + size.name + '.' + ext;
				})
			}

			self.image(inpath, outpath, size, nextsize);

		}, nextfile)
		

	}, done)
}

module.exports = function(){
	return new ImageProcessor()
}