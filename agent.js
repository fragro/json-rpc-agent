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
	var that = this;


	//rendering functions using mustache.js
	function _render(template, data, render_to){
	    var template = $(template).html();
	    var html = Mustache.to_html(template, data);
	    $(render_to).html(html);
	}

	//rendering functions using mustache.js
	function _append(template, data, render_to){
	    var template = $(template).html();
	    var html = Mustache.to_html(template, data);
	    $(render_to).append(html);
	}

	function _alert(title, text){
		var data = {
			title: title,
			detail: text
		}
		console.log(data);
		_render('#alert', data, '#alert_box');
	}

	function _warning(title, text){
		var data = {
			title: title,
			detail: text
		}
		_render('#warning', data, '#alert_box');
	}

	//this function is called after we have successfully completed a transaction
	function _cleanup(){
		$('#alert_box').html('');
		$('#loading').hide();
	}

	function parseSearchData(results){
		console.log(results);
		var data = results.hits.hits;
		if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                	console.log(data[i]._source);
                    source = data[i].fields;
					_append('#pubmed', source, '#publications');
					stars('#star_pub_' + source.pmc, 'pubid' + source.pmc);
            	}

            //$('#res').removeClass('text-error').addClass('text-success').html(content);
        } else {
            //$('#res').removeClass('text-success').addClass('text-error').html('No results found.');
    	}
	}

    //private functions
    //successcallback for reccomendation
    function _appendRec(data, div){
    	if(data.result.results.length == 0){
    		//render waiting
    		_alert('Wait a moment...', 'Your results are being generated');
    		//set a timeout for the number of retries
    		if(window.retries < 5){
    			setTimeout(function() {},5000);
    			window.retries += 1;
    		}
    		else
{    			_warning('Uh Oh', 'It looks like the service is down');
    		}
    	}
    	else{
    		//reset retries
    		window.retries = 0;
			//log the number of recommendation requests that pass
			$('#recommendation' + window.requestCount).hide();
    		window.requestCount += 1;

	    	}
	    _cleanup();

    }

    function _send_request(options) {
    	var randomID=Math.floor(Math.random()*11100)
    	console.log(options.url);
		$('#loading').show();
         $.ajax({
            url: options.url, 
            dataType: 'jsonp',
            data: JSON.stringify ({jsonrpc:'2.0', method:options.method, params:[options.params], id:randomID} ),  // id is needed !!
            type:"POST",
            dataType:"json",
            success:  function (data) {console.log(data);  options.successcall(data, options.div); },
            error: function (err)  { options.errorcall(err); }
     	});
    }

    //test callback functions for debugging
	function _successCallback(data) {
	    _cleanup();
		console.log(JSON.stringify(data));
	}

	function _errorCallback(err) {
	    _cleanup();
		console.log(JSON.stringify(err));
	}


	function subscribe() {
		_send_request({
			div: this.div, 
			url: this._url,
			method: 'subscribe', 
			params: [this._userID, this._search], 
			successcall: _successCallback, 
			errorcall: _errorCallback
		});
	}

	function api() {
		$.getJSON('http://localhost:9200/mongoindex/base/_search?q=keywords:' + this._search, 
		  function(data) {
		  		parseSearchData(data);
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

	return {
		//public functions
		subscribe: subscribe,
		api: api,
		rate: rate,
	    init: function (serviceUrl, options) {
			//we need to support cross-domain requests since this is loaded on nutraspace server.
			//need to test extensively on IE
	        //this.url = 'http://localhost:8080/jsonrpc';
	        this._url = serviceUrl;
	        this._userID = options.userID;
	        this._search = options.search;
	        this._type = 'database';
			this.div = options.div;
	        console.log(this);
	        //initialized now subscribe the user to the service and grab recommendations
	        //subscribe.call(this);
	        api.call(this);
	    },
	}
})();