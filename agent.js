
//Nutraspace Agent Ver 0.1
/*Nutraspace Agent Client interfaces with the server through the JSON-RPC protocol and uses jQueyr AJAX to help
* access that protocol. The agent subscribes users with userID and profile information, and the server
* generates recommendations on the fly as the user requests more. Optionally the user can interact with the
* agent, sending back ratings or other types of feedback which in turn drives a collaborative filtering process.
*/
window.hits = {};
window.urlCount = 0;
window.requestCount = 0;
window.curDiv = '';
window.retries = 0;


function register(is_doctor){
	$("#user_check").fadeOut("fast");
}

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

function activate(id){
	  // cache container
	$('#filterholder' + id).toggleClass('hidden');

	var $container = $('#container' + id);
		// initialize isotope
		$container.isotope({ filter: '*' });

		// filter items when filter link is clicked
	$('.filters' + id + ' a').click(function(){
	  var selector = $(this).attr('data-filter');
	  $container.isotope({ filter: selector });
	  return false;
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
});



function agent(serviceUrl, options){
    _url = serviceUrl;
    this._userID = options.userID;
    this._type = 'database';
	this.div = options.div;
	this.querySize = options.querySize;
	this.version = "0.1.0.1";
	this.debug =  true;
	this.div = '#recommendation';
	this.url = options.url;
	this.userID;
	sessionStorage.setItem("searching", "false");
	this.that = this;
	this.evalhits = [['asset', '#href_Asset']];


	//rendering functions using mustache.js
	this._render = _render;
	function _render(template, data, render_to){
	    var template = Handlebars.compile($(template).html());
	    var html = template(data);
	    $(render_to).html(html);
	}

	//rendering functions using mustache.js
	this._append = _append;
	function _append(template, data, render_to){
	    var template = Handlebars.compile($(template).html());
	    var html = template(data);
	    $(render_to).append(html);
	}

	this._alert = _alert;
	function _alert(title, text){
		var data = {
			title: title,
			detail: text
		}
		console.log(data);
		_render('#alert', data, '#alert_box');
	}

	this._warning = _warning;
	function _warning(title, text){
		var data = {
			title: title,
			detail: text
		}
		_render('#warning', data, '#alert_box');
	}

	//this function is called after we have successfully completed a transaction
	this._cleanup = _cleanup;
	function _cleanup(){
		_loading(false);
	}

	this._loading = _loading;
	function _loading(on){
		if(on){
			$('#search-icon').removeClass('icon-search').addClass('icon-spin icon-spinner');;
  			sessionStorage.setItem("searching", "true");	
		}
		else{
			$('#alert_box').html('');
			$('#search-icon').removeClass('icon-spin icon-spinner').addClass('icon-search');;
  			sessionStorage.setItem("searching", "false");	

		}

	}

    //private functions
    //successcallback for reccomendation
	this._appendRec = _appendRec;
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
			{    			
				_warning('Uh Oh', 'It looks like the service is down');
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
	this._send_request = _send_request;
    function _send_request(options) {
    	var randomID=Math.floor(Math.random()*11100)
    	console.log(options.url);
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
	function _append_images(data, div) {
	    _cleanup();
	    var r = data.result.results.d.results;
		for(var i in r){
			console.log(r[i]);
    	    var template = Handlebars.compile($('#image').html());
	    	var html = template(r[i]);
		    $(div).append(html);
		}
	}

    //test callback functions for debugging
	function _successCallback(data) {
	    _cleanup();
		console.log(JSON.stringify(data));
	}

    //test callback functions for debugging
	function _registrationCallback(data) {
	    if(data.exists){
	    	a._render('#registration_template', {}, '#registration');	
	    }
	}

	function _errorCallback(err) {
	    _cleanup();
		console.log(JSON.stringify(err));
	}

	function _process(source){
		for(var i in source.more_info){
			for(var key in source.more_info[i]){
				if(source[key] == undefined){
					source[key] = source.more_info[i][key];
				}
			}
		}
		return source;
	}

	/* User function, for subscribing new users */
	this.subscribe = subscribe;
	function subscribe(is_doc) {
		_send_request({
			div: this.div, 
			url: this._url,
			method: 'subscribe', 
			params: [this._userID, is_doc], 
			successcall: _successCallback, 
			errorcall: _errorCallback
		});
	}

	/* User function, identifies if the user exists or not. */
	this.user_exists = user_exists;
	function user_exists() {
		_send_request({
			div: this.div, 
			url: this._url,
			method: 'userexists', 
			params: [this._userID], 
			successcall: _registrationCallback, 
			errorcall: _errorCallback
		});
	}

	/* Helper function if we want to grab images from our Python Bing backend. */
	this.grab_images = grab_images;
	function grab_images(query) {
		_send_request({
			div: "#image_results", 
			url: _url,
			method: 'image', 
			params: [query], 
			successcall: _append_images, 
			errorcall: _errorCallback
		});
	}

	/* search function called by the agent in the HTML5 widget

		This function first renders the main template, then calls the api for general information, ontology,
		drug/rx index info, and the published research database
	*/
	this.search = search;
	function search(query){
		//reset and setup tabbing
		if(sessionStorage.getItem("searching") == "false"){
			_loading(true);
			var template =  Handlebars.compile($('#Basic').html());
		    var html = template({});
		    $('#content').html(html);
		  	$('#myTab a').click(function (e) {
				  e.preventDefault();
				  $(this).tab('show');
			});		
			//setup complete. search!
			api({'index': 'genindex', 'type': 'gendoc', 'query': query}, 'description', {'size' : this.querySize});

			//api({'index': 'aisle7index', 'type': 'asset', 'query': query}, 'description', {'size' : 10});
			api({'index': 'nutraindex', 'type': 'node', 'query': query}, 'title', {'size' : 1});
			api({'index': 'pubmedindex', 'type': 'pubmed', 'query': query}, 'description');
			//api({'index': 'nutraindex', 'type': 'medline', 'query': query}, 'description', {'size' : 10});
			api({'index': 'drugindex', 'type': 'rx', 'query': query}, 'description', {}, true);
			
		}
		//grab_images(query);
		//get bing image results
		//if assets didn't return general inforemation, use the medline.
		//If that is unavailable inform the user
	}

 	/* Main API function

		This function accesses parses a number of options, then queries a search engine.
		The reults are parsed by the success function which dumps resulting data
		into the DOM through the this.success()

		options:
			index
			type
			query

  	 */
	this.api = api;
	function api(options, field, kwargs, final_api) {
		//not required
		//we need to integrate kwargs into the options dict
		if(kwargs == undefined){kwargs={}};
		if (kwargs['from'] == undefined){
			kwargs['from'] = 0;
		}
		if (kwargs['size'] == undefined){
			kwargs['size'] = 10;
		}
		var url = 'http://70.189.71.82:9200/' + options['index'] + '/' + options['type'] + '/_search'
		//url = url + '?q=' + field + ':' + options['query'] + '&size=' + kwargs['size'] + '&from=' + kwargs['from']
		console.log(url);
		var data = JSON.stringify({
            query: {
                multi_match: {
		            "query" : options['query'],
		            "fields" : ["title^5", "description"]
                }
            }
        }); 
		$.ajax({
				dataType: "json",
	            type: 'POST',
				//contentType: 'application/json; charset=UTF-8',
				crossDomain: true,
				dataType: 'json',
				url: url,
				data: data,
				success: function(data){
						success(data);
						if(final_api == true){
							_loading(false);
							$('[data-spy="affix"]').each(function () {
							  $(this).affix('refresh')
							});
						}
				},
	          error: function(jqXHR, textStatus, errorThrown) {
	                var jso = jQuery.parseJSON(jqXHR.responseText);
	                alert( '(' + jqXHR.status + ') ' + errorThrown + ' --<br />' + jso.error);
	            }
		});
  	}

	/* Upon success of the API we dump the corresponding data into the DOM
		with handlebars.js template rendering helpers above.
	*/
	this.success = success;
	function success(results) {
  		//appends the search data
		console.log(results);
		var data = results.hits.hits;
		if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
            	console.log(data[i]);
                var source = _process(data[i]._source);
            	source['active'] = (i == 0);
            	if(source._cls == 'RX'){
					if(source['semantic']['use'] != null){
						source['use'] = source['semantic']['use'];
					}
            	}
            	if(i != 0 && source._cls == 'Node' || i != 0 && source._cls == 'Asset'){
					_append('#tab_' + source._cls, source, '#sink_tab_' + source._cls);
            	}
            	else{
					_append('#' + source._cls, source, '#sink_' + source._cls);
        		}
            	if(source._cls == "GenDoc"){
            		for(var key in source.site_keys){
            			_append('#key_GenDoc', source.site_keys[key], '#sink_key_' + source._id);
            		}
					_append('#tab_' + source._cls, source, '#sink_tab_' + source._cls);
            	}
            	if(source._cls == 'RX' || source._cls == 'PubMed'){
					$('#' + source._id + 'modal').css({
				       'width': function () { 
				           return ($(document).width() * .9) + 'px';  
				       },
				       'margin-left': function () { 
				           return -($(this).width() / 2);				       }
					});
					$('#' + source._id + 'modal').closest('.modal-body').css({
						'max-height': function () { 
			           		return ($(document).height() * .85) + 'px';  
				       }
					});
				}
				if(source._cls == 'RX'){
					$('#' + source.med_id + '0').find('.Section').each(function(i,e){
						if($(this).children('h1').text() != ''){
							_append('#tab_rx', {'med_id': $(this).attr('id'), 'title': $(this).children('h1').text()}, '#sink_tab_' + source.med_id);
						}
					});
				}
				stars('#star_' + source._id, source._id);
        	}
			$('#sink_tab_' + source._cls + ' a#related_search').click( function(){
				search($(this).html());
			});	

            //$('#res').removeClass('text-error').addClass('text-success').html(content);
        } else {
            //$('#res').removeClass('text-success').addClass('text-error').html('No results found.');
    	}			//should convert each type into a priority queue and move them up appropriately
  		if(options['type'] == 'asset' && data.hits.hits == 0){
  			$('#sink_MedLine').appendTo('#sink_Asset');
  			$('#sink_MedLine').removeClass('tab-pane');
  			$('#href_MedLine').remove();
		}
	}

  	/* sends a user rating to the Python RPC server */
	this.rate = rate;
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
}