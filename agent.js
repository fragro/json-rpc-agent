//Nutraspace Agent Ver 0.1
/*Nutraspace Agent Client interfaces with the server through the JSON-RPC protocol and uses jQueyr AJAX to help
* access that protocol. The agent subscribes users with userID and profile information, and the server
* generates recommendations on the fly as the user requests more. Optionally the user can interact with the
* agent, sending back ratings or other types of feedback which in turn drives a collaborative filtering process.
*/

window.urlCount = 0;
window.requestCount = 0;
window.curDiv = '';
window.retries = 0;


function stars(div, id){
	$(div).raty({
	  path: '',
	  starOn: 'https://raw.github.com/wbotelhos/raty/master/img/star-on.png',
	  starOff: 'https://raw.github.com/wbotelhos/raty/master/img/star-off.png',
	  click: function() {
	    agent.rate(id, $(div).raty('score'))
	  }
	});
}

//INTERFACE SCRIPT
function checkLessButton(){
	if($(window.curDiv).prev().length){
		$('#less').show();
	}
	else{
		$('#less').hide();
	}
}
$('#less').click( function() {
	//cur div is window.requestCount
	if($(window.curDiv).prev().length){
		$(window.curDiv).fadeOut(function(){
			$(window.curDiv).prev().fadeIn();
			window.curDiv = '#' + $(window.curDiv).prev().attr('id');
			checkLessButton();

		});
	}else{
		checkLessButton();
	}

	console.log($(window.curDiv).prev().length);

})
$('#more').click( function() {
	if(requestCount == 0){
		agent.recommendation();
		checkLessButton();
		console.log('no request');
	}
	else if($(window.curDiv).next().length == 0){
		console.log('empty next');
		$(window.curDiv).fadeOut( function() {
			agent.recommendation();
			$(window.curDiv).next().fadeIn();
			checkLessButton();
			window.curDiv = '#' + $(window.curDiv).next().attr('id');

		});
	}
	else{
		console.log('full next');
		$(window.curDiv).fadeOut( function() {
			$(window.curDiv).next().fadeIn();
			checkLessButton();
			window.curDiv = '#' + $(window.curDiv).next().attr('id');
		});
	}
})

var agent = (function() {
	var version = "0.1.0.1";
	var debug =  true;
	var div = '#recommendation';
	var _url;
	var _userID;
	var _user_profile;
	var that = this;

    //private functions
    //successcallback for reccomendation
    function _appendRec(data, div){
    	if(data.result.results.length == 0){
    		//render waiting
    		this._alert('Wait a moment...', 'Your results are being generated');
    		//set a timeout for the number of retries
    		if(window.retries < 5){
    			setTimeout(function() {agent.recommendation();},5000);
    			window.retries += 1;
    		}
    		else{
    			this._warning('Uh Oh', 'It looks like the service is down');
    		}
    	}
    	else{
    		//reset retries
    		window.retries = 0;
    		$('#loading').hide();
			//log the number of recommendation requests that pass
    		window.requestCount += 1;
    		$(div).append('<div id="recommendation' + window.requestCount + '"></div>')
    		window.curDiv = '#recommendation' + window.requestCount;
	    	for(var i in data.result.results){
		    	window.urlCount += 1;
	    		$('#wait').html('');
	    		var link = '<div class="rec" id="' + data.result.results[i].id +'"><a href="' + data.result.results[i].url +'" target="_blank">' + data.result.results[i].title + '</a></div>';
				var keyword = '<div class="keyword">Keyword: ' + data.result.results[i].keyword + '</div>'
				var rating = '<div class="star-rate" id="star' + window.urlCount  + '"></div>'
				var summary = '<div class="summary">' + data.result.results[i].summary + '<div>'+ rating + keyword + '</div></div>'
				$('#recommendation' + window.requestCount).append(link);
				$('#recommendation' + window.requestCount).append(summary);
				stars('#star' + window.urlCount, data.result.results[i].id);
	    	}
	    }
	    this._cleanup();
    }

    function _send_request(options) {
    	var randomID=Math.floor(Math.random()*11100)
    	console.log(options.url);
		$('#loading').width("33%");
         $.ajax({
            url: options.url, 
            data: JSON.stringify ({jsonrpc:'2.0', method:options.method, params:[options.params], id:randomID} ),  // id is needed !!
            type:"POST",
            dataType:"json",
            success:  function (data) {console.log(data);  options.successcall(data, options.div); },
            error: function (err)  { options.errorcall(err); }
     	});
    }

    //test callback functions for debugging
	function _successCallback(data) {
		$('#loading').width("66%");
		console.log(JSON.stringify(data));
	}

	function _errorCallback(err) {
		$('#loading').width("66%");
		console.log(JSON.stringify(err));
	}

	//this function is called after we have successfully completed a transaction
	function _cleanup(){
		$('#loading').width("0%");
		$('#alert_box').html('');
	}

	function subscribe() {
		_send_request({
			div: this.div, 
			url: this._url,
			method: 'subscribe', 
			params: [this._userID, this._user_profile], 
			successcall: _successCallback, 
			errorcall: _errorCallback
		});
	}

	function recommendation() {
		_send_request({	
			div: this.div, 
			url: this._url,
			method: 'recommendation', 
			params: [this._userID], 
			successcall: _appendRec, 
			errorcall: _errorCallback
		});
	}

	function rate(indexkey, rating) {
		_send_request({
			div: this.div, 
			url: this._url,
			method: 'rate', 
			params: [this._userID, indexkey, rating], 
			successcall: _successCallback, 
			errorcall: _errorCallback
		});
	}

	function _render(template, data, render_to){
	    var template = $(template).html();
	    var html = Mustache.to_html(template, data);
	    $(render_to).html(html);
	}

	function _alert(title, text){
		var data = {
			title: title,
			detail: text
		}
		this._render('#alert', data, '#alert_box');
	}

	function _warning(title, text){
		var data = {
			title: title,
			detail: text
		}
		this._render('#warning', data, '#alert_box');
	}

	return {
		//public functions
		subscribe: subscribe,
		recommendation: recommendation,
		rate: rate,
	    init: function (serviceUrl, options) {
			//we need to support cross-domain requests since this is loaded on nutraspace server.
			//need to test extensively on IE
	        //this.url = 'http://localhost:8080/jsonrpc';
	        this._url = serviceUrl;
	        this._userID = options.userID;
	        this._user_profile = options.profile;
			this.div = options.div;
	        console.log(this);
	        //initialized now subscribe the user to the service and grab recommendations
	        subscribe.call(this);
	        recommendation.call(this);
	    },
	}
})();