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
		//lang = 'en';
		if (localStorage.getItem('fit_lang')) {
			lang = localStorage.getItem('fit_lang');
			app.translateApp();
		} else {
			navigator.notification.confirm('Vali keel / Choose language / Выбрать язык', function(button) {
				
				if (button == 1)
					lang = 'et';
				else if (button == 2)
					lang = 'en';
				else if (button == 3)
					lang = 'ru';
					
				localStorage.setItem('fit_lang', lang);
				app.translateApp();
					
			}, 'Teade', 'eesti, english, русский');
		}

		app.initLogin(false);
		app.translateApp();
		
	},
	
	translateApp: function() {
		console.log('go for it: ' + "js/translations/" + lang + ".js");
		$.getScript("js/translations/" + lang + ".js", function() {
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
			} else {
				navigator.notification.vibrate(500);
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
		
		user = data;
		
		console.log('LOG IN');
		LEVEL = 1;
		teleportMe('homepage');
	},
	
	parseUser: function() {
		if(user.fb_id) {
			
		
			$('.me').find('img').attr('src','https://graph.facebook.com/' + user.fb_id + '/picture');
			$('.me').find('h2').html(user.firstname + ' ' + user.lastname);
		} else {
			$('.me').find('img').attr('src','i/thumb.png');
			$('.me').find('h2').html('Päärn Brauer');
		}	
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