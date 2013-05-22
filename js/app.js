var lang = 'et';
var translations = [];
var data = {};
var user = {};

var app = {
	
	serverUrl: 'http://projects.efley.ee/fitnessapp/api/server.php',
	
	init: function() {
		
		setTimeout(function() {
			try {
				FB.init({ appId: "161092774064906", nativeInterface: CDV.FB, useCachedDialogs: false });
			} catch (e) {
				deliverError(e, 'app.js', '216');
			}
			
		}, 1500);
	
		if (localStorage.getItem('lang')) {
			lang = localStorage.getItem('lang');
			$('.' + lang + '-flag').addClass('active');
		}
		
		$('.flag').unbind('click');
		$('.flag').click(function(e) {
			e.preventDefault();
			$('.flag').removeClass('active');
			$(this).addClass('active');
			lang = $(this).attr('rel');
			localStorage.setItem('lang', lang);
			app.translateApp();
		});
		
		app.translateApp();
		
		app.initLogin(false);
		
		
	},
	
	translateApp: function() {
	
		$.getScript("js/translations/" + lang + ".js", function(data, textStatus, jqxhr) {
			$('.translate').each(function(i, item) {
				if ($(this).hasClass('placeholder')) {
					$(this).attr('placeholder', translations[lang][$(this).data('keyword')]);
				} else if ($(this).hasClass('value')) {
					$(this).val(translations[lang][$(this).data('keyword')]);
				} else {
					$(this).html(translations[lang][$(this).data('keyword')]);
				}
			});
		});
	
			
	},
	
	initLogin: function(cameFrom) {
		
		console.log('inited ' + cameFrom);
		
		$('.fb').unbind('click');
		$('.fb').click(function(e) {
			e.preventDefault();
			FB.getLoginStatus(function(response) {
				app.curFunction = 'FBLOGINSTATUS';
				if (response.status == 'connected') {
					app.getFacebookMe();
				} else {
					app.authFacebook();
				}
			});
		});
		
		$('.loginformbtn').unbind('click');
		$('.loginformbtn').click(function(e) {
			e.preventDefault();
			console.log('submit');
			error = false;
			if ($('#clientNr').val() == '') {
				$('#clientNr').addClass('error');
				error = true;
			} else {
				$('#clientNr').removeClass('error');
			}
				
			if ($('#clientPass').val() == '') {
				$('#clientPass').addClass('error');
				error = true;
			} else {
				$('#clientPass').removeClass('error');
			}
			
			if (!error) {
				data.client_nr = $('#clientNr').val();
				data.client_pass = $('#clientPass').val();
				
				app.doLogin(data);
			}
			
		});
		
	},
	
	authFacebook: function() {
		app.curFunction = 'AUTHFB';
		FB.login(
			function(response) {
				//console.log(response);
				data = response;
				if (response.session) {
					app.getFacebookMe();
				} else {
					app.getFacebookMe();
				}
			},
			{ scope: "email,user_birthday" }
		);
			
	},
	
	getFacebookMe: function() {
		app.curFunction = 'facebookMe';
		
		FB.api('/me', { },  function(response) {
			if (response.error) {
				//alert(JSON.stringify(response.error));
				app.authFacebook();
			} else {
				//console.log(response);
				data.fb_id = response.id;
				data.firstname = response.first_name;
				data.lastname = response.last_name;
				data.sex = response.gender;
				data.birthday = response.birthday;
				data.mail = response.email;
				app.doLogin(data);
			}
		});
		
	},
	
	doLogin: function(data) {
		
		console.log('LOG IN');
		
		teleportMe('homepage');
	},
	
	/*
	*
	*/
	
	
}

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

function isOdd(num) { return num % 2;}

function deliverError(msg, url, line) {
	if (window.device && window.device.platform && window.device.platform != 'Generic') {
   		error_data = {};
	   	error_data.function = app.curFunction;
	   	error_data.error = msg;
	   	error_data.file = url;
	   	error_data.line = line;
	   
	   	error_data.device_name = window.device.name;
	   	error_data.device_platform = window.device.platform;
	   	error_data.device_version = window.device.version;
	   
	   	error_data.data = {};
	   	error_data.data.data = data;
	   	error_data.data.user = user;
	   
	   	$.get(app.serverUrl + '?action=reportAnError', error_data, function(result) {
	   		//if(result.success)
	   			//console.log('Error reported');
	   	}, 'jsonp');
	}
}

window.onerror = function (msg, url, line) {
	deliverError(msg, url, line);
}

app.init();
