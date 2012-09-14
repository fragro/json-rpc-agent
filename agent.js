//Nutraspace Agent Ver 0.1
/*Nutraspace Agent Client interfaces with the server through the JSON-RPC protocol and uses jQueyr AJAX to help
* access that protocol. The agent subscribes users with userID and profile information, and the server
* generates recommendations on the fly as the user requests more. Optionally the user can interact with the
* agent, sending back ratings or other types of feedback which in turn drives a collaborative filtering process.
*/

function stars(div){
	$(div).raty({
	  path: '',
	  starOn: 'https://raw.github.com/wbotelhos/raty/master/img/star-on.png',
	  starOff: 'https://raw.github.com/wbotelhos/raty/master/img/star-off.png',
	  click: function() {
	    alert($(div).raty('score'));
	  }
	});
}

var agent = (function() {
	var version = "0.1.0.1";
	var requestCount = 0;
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
    		var link = "<h2 id='wait'>Recommendations are being generated. In a moment click 'More Recommendations'</h2>"
			$(div).append(link);
    	}
    	else{
	    	for(var i in data.result.results){
	    		$('#wait').remove();
	    		var link = '<div class="rec" id="' + data.result.results[i].id +'"><a href="' + data.result.results[i].url +'" target="_blank">' + data.result.results[i].title + '</a></div>';
				var keyword =  '<div class="keyword">Keyword: ' + data.result.results[i].keyword + '</div>'
				var rating =  '<div id="star' + requestCount  + '"></div>'
				alert(rating);
				var summary = '<div class="summary">' + data.result.results[i].summary + '<br>' + rating + '<br>' + keyword + '</div>'
				$(div).append(link);
				$(div).append(summary);
				stars('star' + requestCount);
	    	}
	    }
    }

    function _send_request(options) {
    	var randomID=Math.floor(Math.random()*11100)
    	this.requestCount += 1;
    	console.log(options.url);
    	$('#loading').show();
         $.ajax({
            url: options.url, 
            data: JSON.stringify ({jsonrpc:'2.0', method:options.method, params:[options.params], id:randomID} ),  // id is needed !!
            type:"POST",
            dataType:"json",
            success:  function (data) {console.log(data); $('#loading').hide(); options.successcall(data, options.div); },
            error: function (err)  { $('#loading').hide(); options.errorcall(data); }
     	});
    }

    //test callback functions for debugging
	function _successCallback(data) {
		console.log(JSON.stringify(data));
	}

	function _errorCallback(err) {
		console.log(JSON.stringify(err));
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
			successcall: _appendRec, 
			errorcall: _errorCallback
		});
	}


	return {
		//public functions
		subscribe: subscribe,
		recommendation: recommendation,
		rate: rate,
	    init: function (serviceUrl, options) {
			//we need to support cross-domain requests since this is loaded on nutraspace server.
			//need to test extensively on IE
			jQuery.support.cors = true;
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