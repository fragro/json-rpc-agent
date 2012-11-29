//The offset indicates how far into the Bing API result set we are processing.
//We need this variable to be global so we can maintain the state of the offset between Bing API calls.
var _offset;				           			

$(document).ready(function(){
	//Hook up an onclick eventhandler to the Search button.
	$("#Search").click(StartSearching);
});				

function StartSearching() {	
	//Clear the previous results from the Results table.
	ClearResults();
	
	//Reset the offset.
	ResetOffset();

	//Get the value from the Query textbox.
	query = $("#Query").val();

	//Start receiving the first results and hookup endless scrolling.
	ReceiveAndShowResults(query);
	HookUpEndlessScroll(query);
}		
			
function ClearResults(){
	//Remove the content of the Results table.
	$("#Results").find("*").remove();
}

function ResetOffset(){				
	//Reset the offset.
	_offset = 0;
}

function ReceiveAndShowResults(query) {			
	//Build a new API uri.
    var bingUri = BuildBingApiUri(query, _offset);		
	
	$.getJSON(bingUri, function(data, textStatus){
		console.log(data);
	    OnResultsReceived(data, textStatus);
	});
       
}

function OnError(XMLHttpRequest, textStatus, errorThrown) {
	//Show an error when the API call fails.
    $("#Results").append("<tr><td>Something went wrong..</td></tr>");	
	$("#Results").append("<tr><td>" + textStatus + "</td></tr>");	
	$("#Results").append("<tr><td>" + errorThrown + "</td></tr>");

}

function OnResultsReceived(data, textStatus) {				
	//If there are no results show a message.
	if (data.SearchResponse.Image.Results == null || data.SearchResponse.Image.Results == undefined){
		$("#Results").append("<tr><td>No Results..</td></tr>");	
		return;
	}					
	
	//Loop over the results and build the Results table.
    $.each(data.SearchResponse.Image.Results, function (i, item) {										
		switch (true){
			case i == 0:
				$("#Results").append("<tr>");										
				$("#Results").append("<td><img src='" + item.Thumbnail.Url + "'/></td>");
				break;
			case i == data.SearchResponse.Image.Results.length:
				$("#Results").append("<td><img src='" + item.Thumbnail.Url + "'/></td>");
				$("#Results").append("</tr>");		
				break;
			case ((i + 1) % 5) == 0:
				$("#Results").append("<td><img src='" + item.Thumbnail.Url + "'/></td>");
				$("#Results").append("</tr><tr>");		
				break;
			default:
				$("#Results").append("<td><img src='" + item.Thumbnail.Url + "'/></td>");	
				break;
		}								
    });              
}

function BuildBingApiUri(query, offset) {
	//Build an uri for the Bing API call.								
    var bingApiUrl = "http://api.search.live.net/json.aspx";
    var bingApiAppId = "sgz6vsfD/wTcqmlFGEJFtDVgLCS4gyWFrm6HSklLGJU=";
	var bingApiImageCount = "10";				
	
    var s = bingApiUrl +
				"?AppId=" + bingApiAppId +
				"&Sources=image" +
				"&Query=" + query +
				"&Image.Count=" + bingApiImageCount +
				"&Image.Offset=" + offset;
					
    return s;                
}