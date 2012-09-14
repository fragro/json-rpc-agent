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
    that.appendRec = function(data){
    	for(var i in data.result.results){
    		var st = '<div class="rec" id="' + data.result.results[i].id +'"><a href="' + data.result.results[i].url +'" target="_blank">' + data.result.results[i].title + '</a></div>';
			console.log(st);
			console.log(that.div);
			$(that.div).append(st);
    	}
    }

    that._send_request = function(method, params, successCallback, errorCallback) {
    	var randomID=Math.floor(Math.random()*11100)
    	console.log(that);
         $.ajax({
            url: that._url, 
            data: JSON.stringify ({jsonrpc:'2.0', method:method, params:[params], id:randomID} ),  // id is needed !!
            type:"POST",
            dataType:"json",
            success:  function (data) { successCallback(data); },
            error: function (err)  { errorCallback(data); }
     	});
    }
    //test callback functions for debugging
	that._successCallback = function(data) {
		console.log(JSON.stringify(data));
	}
	that._errorCallback = function(err) {
		console.log(JSON.stringify(err));
	}


	return {
		//public functions
		subscribe: function() {
			_send_request('subscribe', [that._userID, that._user_profile], that._successCallback, that._errorCallback);
		},

		recommendation: function() {
			_send_request('recommendation', [that._userID], that._appendRec, that._errorCallback);
		},

		rate: function(indexkey, rating) {
			_send_request('rate', [that._userID, indexkey, rating], that._successCallback, that._errorCallback);
		},

	    init: function (serviceUrl, options) {
			//we need to support cross-domain requests since this is loaded on nutraspace server.
			//need to test extensively on IE
			jQuery.support.cors = true;
	        //this.url = 'http://localhost:8080/jsonrpc';
	        that._url = serviceUrl;
	        that._userID = options.userID;
	        that._user_profile = options.profile;
			that.div = options.div;
	        console.log(that);
	        //initialized now subscribe the user to the service and grab recommendations
	        subscribe.call(that);
	        recommendation.call(that);
	    },
	}
})();