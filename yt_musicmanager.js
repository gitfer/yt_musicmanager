var fs = require('fs');
var YouTube = require('./node_modules/youtube-node/lib/youtube');
var config = require('./config');

var videosCount;

var youTube = new YouTube();
youTube.setKey(config.key);

var download = function (videoString, filename) {
	var exec = require('child_process').exec;
	filename = filename + '.flv';
	var retryCount = 0;
	var excuteDownload = function () {
		var cmd = 'ytdl ' + videoString + ' > ./music/' + filename;
		
		retryCount += 1;

		try {
		    // Query the entry
		    stats = fs.lstatSync('./music/' + filename);

		    // Is it a directory?
		    if (stats.isFile() && stats['size'] > 0) {
		        console.log('File exist ', filename);
		    }else{
		    	console.log('Downloading...', cmd);
				exec(cmd, function(error, stdout, stderr) {
					console.log(stderr);
					if(stderr && retryCount < 4){
						console.log('======== Error downloading...retrying ========');
						excuteDownload();
					}
				});   	
		    }
		}
		catch (e) {
			if(e.code === 'ENOENT'){
				exec(cmd, function(error, stdout, stderr) {
					console.log(stderr);
					if(stderr && retryCount < 4){
						console.log('======== Error downloading...retrying ========');
						excuteDownload();
					}
				});
			}
		}
	};
	excuteDownload();
}

var getVideos = function (pageToken) {
	YouTube.params = {};
	youTube.addParam('pageToken', pageToken);

	youTube.getPlayListsItemsById('PL12fIV3PYQytwjeB30mFY-KqCTJmdYe93', function(error, result) {
	  if (error) {
	    console.log(error);
	  }
	  else {
	    //console.log(JSON.stringify(result, null, 2));
	    if(!videosCount){
	    	videosCount = parseInt(result.pageInfo.totalResults);
	    	console.log('Videos found: ', videosCount);
	    	videosCount -= 5;
	    }
	    
	    var pageToken = result.nextPageToken;
		var videos = result.items;

		for(var i=0; i<videos.length; i++){
			var video = videos[i];
			var title = video.snippet.title;
			var videoId = video.snippet.resourceId.videoId;
			var videoString = 'https://www.youtube.com/watch?v=' + videoId;

			download(videoString, title.replace(/\ /g, '_').replace(/&/g, '_').replace(/\(/g, '')
				.replace(/\)/g, '')
				.replace(/\'/g, '')
				.replace(/\"/g, '')
				);
		}
		if(pageToken && videosCount > 0){
			getVideos(pageToken);
		}else{
			process.exit();
		}

	  }
	});
	
};

getVideos();