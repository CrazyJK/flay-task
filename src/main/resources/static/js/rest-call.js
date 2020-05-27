/**
 * 
 */
var contextPath = "/task";

var restCall = function(url, args, callback, failCallback) {
	var DEFAULTS = {
			method: "GET",
			data: {},
			mimeType: "application/json",
			contentType: "application/json",
			async: true,
			cache: false,
			title: "Call: " + url
	};	
	var settings = $.extend({}, DEFAULTS, args);
	if (settings.method != 'GET' && typeof settings.data === 'object') {
		settings.data = JSON.stringify(settings.data);
	}

	/*
	var timeout = setTimeout(function() {
		loading.on(settings.title);
	}, 300);
	*/

	$.ajax(contextPath + url, settings).done(function(data) {
		if (callback)
			callback(data);

//		clearTimeout(timeout);
//		loading.off();

	}).fail(function(jqXHR, textStatus, errorThrown) {
		console.log("restCall fail", url, '\n jqXHR=', jqXHR, '\n textStatus=', textStatus, '\n errorThrown=', errorThrown);
		if (failCallback) {
			failCallback();
//			clearTimeout(timeout);
//			loading.off();
		} else {
			var errMsg = "";
			if (jqXHR.getResponseHeader('error')) {
				errMsg = 'Message: ' + jqXHR.getResponseHeader('error.message') + "<br>" 
					   + 'Cause: '   + jqXHR.getResponseHeader('error.cause');
			} else if (jqXHR.responseJSON) {
				errMsg = 'Error: '     + jqXHR.responseJSON.error + '<br>'  
					   + 'Message: '   + jqXHR.responseJSON.message + '<br>'
					   + 'Status: '    + jqXHR.responseJSON.status + '<br>'
					   + 'Path: '      + jqXHR.responseJSON.path;
			} else {
				errMsg = 'Error:<br>' + textStatus + "<br>" + errorThrown;
			}
			var $errorBody = $("<div>", {'class': 'overlay-error-body'}).append(errMsg);
//			loading.on($errorBody);
		}
	}).always(function(data_jqXHR, textStatus, jqXHR_errorThrown) {
	});
};
