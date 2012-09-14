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
		this._send_request('recommendation', [this._userID], this._appendRec, this._errorCallback);
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
    	for(var i in data.results){
    		this._UI.append(i.id, i.links.fields.url, i.links.fields.title);
    	}
    },

    _send_request: function (method, params, successCallback, errorCallback) {
    	var randomID=Math.floor(Math.random()*1110)
         $.ajax({
            url: this._url, 
            data: JSON.stringify ({jsonrpc:'2.0', method:method, params:[params], id:randomID} ),  // id is needed !!
            type:"POST",
            dataType:"json",
            success:  function (data) { successCallback(data); },
            error: function (err)  { errorCallback(data); }

     	});

    },

	_successCallback: function(data) {
		console.log(JSON.stringify(data));
	},

	_errorCallback: function(err) {
		console.log(JSON.stringify(err));
	},

}

//controls the agent's UI via jQuery
var agentUI = {

	init: function(options){
		this._div = options.div;
	},

	append: function(indexkey, url, summary){
		this._div.append('<div class="rec" id="' + indexkey +'"><a href="' + url +'" target="_blank">' + summary + '</a></div>')
	},

}