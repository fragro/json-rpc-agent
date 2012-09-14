//Nutraspace Agent Ver 0.1
/*Nutraspace Agent Client interfaces with the server through the JSON-RPC protocol and uses jQueyr AJAX to help
* access that protocol. The agent subscribes users with userID and profile information, and the server
* generates recommendations on the fly as the user requests more. Optionally the user can interact with the
* agent, sending back ratings or other types of feedback which in turn drives a collaborative filtering process.
*/
var agent = {
	version:"0.1.0.1",	
	requestCount: 0,
	debug: true,

	//public functions
	subscribe: function() {
		this._send_request('subscribe', [this._userID, this._user_profile], this._successCallback, this._errorCallback);
	},

	recommendation: function() {
		this._send_request('recommendation', [this._userID], this._successCallback, this._errorCallback);
	},

	rate: function(indexkey, rating) {
		this._send_request('rate', [this._userID, indexkey, rating], this._successCallback, this._errorCallback);
	},

    init: function (serviceUrl, options) {
		//we need to support cross-domain requests since this is loaded on nutraspace server.
		//need to test extensively on IE
		jQuery.support.cors = true;
        //this.url = 'http://localhost:8080/jsonrpc';
        this._url = serviceUrl;
        this._userID = options.userID;
        this._user_profile = options.profile;
        this.subscribe();
        this._UI = agentUI.init( {
        	div: options.div,
        });
        this.recommendation();
    },

    //private functions

    //successcallback for reccomendation
    _appendRec: function(data){
    	this._UI.append(data.result);
    },

    _send_request: function (method, params, successCallback, errorCallback) {
    	var randomID=Math.floor(Math.random()*1110)
         $.ajax({
            url: 'http://localhost:8080/jsonrpc', 
            data: JSON.stringify ({jsonrpc:'2.0', method:'subscribe', params:[['user', 'dude']], id:1} ),  // id is needed !!
            type:"POST",
            dataType:"json",
            success:  function (data) { alert("The result is : " + JSON.stringify(data));},
            error: function (err)  { alert("Error"); alert(JSON.stringify(err));}

     	});

    },

	_successCallback: function(data) {
		alert(JSON.stringify(data));
	},

	_errorCallback: function(err) {
		alert(JSON.stringify(err));
	},

}

//controls the agent's UI via jQuery
var agentUI = {

	init: function(options){
		this._div = options.div;
	},

	append: function(url_info){
		this._div.append('<div class="rec" id="' + urlinfo.indexkey +'"><a href="' + url_info.url +'" target="_blank">' + url_info.summary + '</a></div>')
	},

}