//Nutraspace Agent Ver 0.1
/*Nutraspace Agent Client interfaces with the server through the JSON-RPC protocol and uses jQueyr AJAX to help
* access that protocol. The agent subscribes users with userID and profile information, and the server
* generates recommendations on the fly as the user requests more. Optionally the user can interact with the
* agent, sending back ratings or other types of feedback which in turn drives a collaborative filtering process.
*/

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
    function _appendRec(data){
    	for(var i in data.result.results){
    		var st = '<div class="rec" id="' + data.result.results[i].id +'"><a href="' + data.result.results[i].url +'" target="_blank">' + data.result.results[i].title + '</a></div>';
			console.log(st);
			console.log(this.div);
			$(this.div).append(st);
    	}
    }

    function _send_request(url, method, params, successCallback, errorCallback) {
    	var randomID=Math.floor(Math.random()*11100)
    	console.log(url);
         $.ajax({
            url: url, 
            data: JSON.stringify ({jsonrpc:'2.0', method:method, params:[params], id:randomID} ),  // id is needed !!
            type:"POST",
            dataType:"json",
            success:  function (data) { successCallback(data); },
            error: function (err)  { errorCallback(data); }
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
		_send_request(this._url, 'subscribe', [this._userID, this._user_profile], _successCallback, _errorCallback);
	}

	function recommendation() {
		_send_request(this._url, 'recommendation', [this._userID], _appendRec, _errorCallback);
	}

	function rate(indexkey, rating) {
		_send_request(this._url, 'rate', [this._userID, indexkey, rating], _successCallback, _errorCallback);
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