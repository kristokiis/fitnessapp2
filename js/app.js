var lang = 'et';
var translations = [];
var data = {};  //data object for querying data from server, should be emptied all the time.
var user = {};  //object for holding user data / gets from local DB or remote DB
var items = []; //array for holding module items for inside navigation, without regetting them from server. should be emtied all the time

var db = {};

var categories = [];
var trainings = {};

var muscle_groups = [];
muscle_groups[1] = 'Trapets';
muscle_groups[2] = 'Rind';
muscle_groups[3] = 'Kõht';
muscle_groups[4] = 'Esireis';
muscle_groups[5] = 'Säär';
muscle_groups[6] = 'Õlg';
muscle_groups[7] = 'Biitseps';
muscle_groups[8] = 'Ranne';
muscle_groups[9] = 'Ülaselg';
muscle_groups[10] = 'Alaselg';
muscle_groups[11] = 'Tuhar';
muscle_groups[12] = 'Tagareis';
muscle_groups[13] = 'Triitseps';

firstLoad = true;
totalSteps = 10;

var club_id = 2;

var app = {
	
	apiUrl: 'http://projects.efley.ee/fitnessapp/api/server.php',
	serverUrl: 'http://projects.efley.ee/fitnessapp/admin/',
	curFunction: 'do not know..',
	exerciseCat: 0,
	mucleGroup: false,
	packageType: 'training',
	packageTrainer: 0,
	
	loadingSteps: function(step) {
		
	},
	
	init: function() {
		
		/*if (networkState == Connection.NONE){
		  alert('Interneti ühendus puudub,');
		  return false;
		};*/
		
		/*db = window.openDatabase("fitness", "1.0", "Fitness DB", 1000000);
		*/
		/*setTimeout(function() {
			try {
				FB.init({ appId: "161092774064906", nativeInterface: CDV.FB, useCachedDialogs: false });
			} catch (e) {
				deliverError(e, 'app.js', '216');
			}
			
		}, 1500);*/
		//lang = 'en';
		/*if (localStorage.getItem('fit_lang')) {
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
		}*/

		app.initLogin(false);
		app.translateApp();
		//app.initTrainingPacks();
		
		//navigator.splashscreen.hide();
		
	},
	
	/*
	* if first time, get from
	*/
	
	initTrainingPacks: function() {
		if (localStorage.getItem('notFirstTime')) {
			
			/*
			* get packets from db
			*/
			
			db.transaction(function(tx) {
				tx.executeSql('SELECT * FROM DEMO', [], function() {
					
				}, errorCB);
			}, errorCB, function() {
				console.log('Success');
			});
			
			data = {};
			data.firstTime = false;
			$.get(app.apiUrl + '?action=getTrainings', data, function(result) {
				
				db.transaction(function(tx) {
					tx.executeSql('INSERT INTO TRAININGS (id, type, name, data) VALUES (1, "training", "Test kava1", "andmed")');
					tx.executeSql('INSERT INTO TRAININGS (id, type, name, data) VALUES (2, "training", "Test kava2", "andmed")');
				}, errorCB, function() {
					console.log('Success');
				});
				
			});
			
			
		} else {
			
			db.transaction(function(tx) {
				tx.executeSql('DROP TABLE IF EXISTS TRAININGS');
				tx.executeSql('CREATE TABLE IF NOT EXISTS TRAININGS (id unique, type, name, data)');
			}, errorCB, function() {
				console.log('Success');
			});
			
			data = {};
			data.firstTime = true;
			$.get(app.apiUrl + '?action=getTrainings', data, function(result) {
		   		
		   		db.transaction(function(tx) {
			   		tx.executeSql('INSERT INTO TRAININGS (id, type, name, data) VALUES (1, "training", "Test kava1", "andmed")');
					tx.executeSql('INSERT INTO TRAININGS (id, type, name, data) VALUES (2, "training", "Test kava2", "andmed")');
		   		});
		   		
				localStorage.setItem('notFirstTime', true);
			
			}, 'jsonp');
			
		}
	},
	
	parseTrainingPacks: function(tx, results) {
		console.log("Returned rows = " + results.rows.length);
	    // this will be true since it was a select statement and so rowsAffected was 0
	    if (!results.rowsAffected) {
	        console.log('No rows affected!');
	        return false;
	    }
	    // for an insert statement, this property will return the ID of the last inserted row
	    console.log("Last inserted row ID = " + results.insertId);
	},
	
	translateApp: function() {
		$.getScript("js/translations/" + lang + ".js", function() {
			app.replaceWords();
		});	
	},
	replaceWords: function() {
		$('.translate').each(function(i, item) {
			if ($(this).hasClass('placeholder')) {
				$(this).attr('placeholder', translations[lang][$(this).data('keyword')]);
			} else if ($(this).hasClass('value')) {
				$(this).val(translations[lang][$(this).data('keyword')]);
			} else {
				$(this).html(translations[lang][$(this).data('keyword')]);
			}
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
		
		$('.loginformbtn').unbind(eventEnd).bind(eventEnd, function (e) {
		
			hideKeyBoard();
		
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
				data.fb_id = false;
				
				app.doLogin(data);
			} else {
				navigator.notification.vibrate(200);
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
		
		//user = data;
		data.club_id = club_id;
		
		$.get(app.apiUrl + '?action=userLogin', data, function(result) {
	   		if (result.login == false) {
		   		$('#clientNr').addClass('error');
		   		$('#clientPass').addClass('error');
		   		navigator.notification.vibrate(200);
	   		} else {
	   			if (result.user_new)
	   				user = data;
	   			else
		   			user = result;
		   		
		   		console.log('LOG IN');
				LEVEL = 1;
				teleportMe('homepage', {});
	   		}
	   		
	   		
	   	}, 'jsonp');
		
		
	},
	
	parseUser: function() {
		if (user.fb_id) {
			$('.me').find('img').attr('src','https://graph.facebook.com/' + user.fb_id + '/picture');
			$('.me').find('h2').html(user.firstname + ' ' + user.lastname);
		} else {
			/*
			* get Local user pic...
			*/
			$('.me').find('img').attr('src','i/thumb.png');
			$('.me').find('h2').html('Päärn Brauer');
		}
		
		localStorage.setObject('fitUser', user);
			
	},
	
	loadExercisePage: function() {
		
		data = {};
		data.club_id = club_id;
		
		if (!navigator.onLine) {
			result = localStorage.getObject('fitCats');
		} else {
			$.get(app.apiUrl + '?action=getCategories', data, function(result) {
				localStorage.setObject('fitCats', result);
				app.parseCategories(result);
		   }, 'jsonp');
		}
	},
	
	parseCategories: function(result) {
		content = $('.module-content');
		template = $('.module-template');
		template.hide();
		
   		$.each(result, function(i, item) {
   			categories[item.cat_id] = item.name;
   			template.find('h3').html(item.name);
   			template.find('.bubble').html(item.total);
   			template.find('img').attr('src', app.serverUrl + 'pics/categories/' + item.cat_id + '.jpg');
   			template.find('.harjutus_item').attr('data-cat', item.cat_id);
	   		content.append(template.html());
   		});
   		
   		$('.harjutus_item').click(function(e) {
		   app.exerciseCat = $(this).data('cat');
		   console.log(app.exerciseCat);
		   
		   LEVEL = 2;
		   teleportMe('harjutused_subpage1');
		   
	   });
	},
	
	loadExercises: function() {
		
		data = {};
		data.club_id = club_id;
		
		if (app.exerciseCat) {
			data.category = app.exerciseCat;
			$('#harjutused_subpage1').find('h3:first').html(categories[app.exerciseCat]).css('font-size', '15px');
		} 
		if (app.muscleGroup) {
			data.muscle_group = app.muscleGroup;
			
			if (app.exerciseCat) {
				$('#harjutused_subpage1').find('h3:first').html(categories[app.exerciseCat] + ' | ' + muscle_groups[app.muscleGroup]).css('font-size', '13px');
			} else {
				$('#harjutused_subpage1').find('h3:first').html(muscle_groups[app.muscleGroup]).css('font-size', '15px');
			}
		}
		
		items = [];
		
		template = $('.content-template');
		container = $('.content-content');
		container.html('');
		
		$.get(app.apiUrl + '?action=getExercises', data, function(result) {
	   		$.each(result, function(i, item) {
	   		
	   			items[item.id] = item;
		   		
		   		template.find('h3').html(item.name);
		   		template.find('img:last').attr('src', app.serverUrl + 'pics/exercises/' + item.id + '.jpg');
		   		template.find('.harjutus_item').attr('data-id', item.id);
		   		
		   		container.append(template.html());
		   		
	   		});
	   		
	   		$('.harjutus_item').unbind(eventEnd).bind(eventEnd, function (e) {
	   		
	   			var id = $(this).data('id');
	   		
				LEVEL = 3;
				teleportMe('video', id);
			});
	   		
	   	}, 'jsonp');

	},
	
	
	parseExercise: function(extra) {
		console.log('HERE:');
		console.log(items[extra]);
		
		$('#video').find('h3:first').html(items[extra].name);
		$('#video').find('.text_wrap').html(items[extra].description);
		//$('#video').find('source').attr('src', app.serverUrl + 'videos/' + items[extra].id + '.mp4').attr('poster', app.serverUrl + 'videos/' + items[extra].id + '.png');
		$('#video').find('.video-container').html('<video id="video" height="41%" width="100%" controls="" preload="" autoplay="" poster="' + app.serverUrl + 'videos/' + items[extra].id + '.png" onclick="this.play();" onload="this.play();"><source src="' + app.serverUrl + 'videos/' + items[extra].id + '.mp4" poster="' + app.serverUrl + 'videos/' + items[extra].id + '.png"></video>');
		
		
	},
	
	initPackageBuying: function(step) {
		
		data = {};
		data.club_id = club_id;
		
		if (step == 1) {
		
			template1 = $('.content-template');
			container1 = $('.content-content');
			container1.html('');
		
			items = [];
		
			$('.kavabtn').click(function(e) {
				e.preventDefault();
				$('.kavabtn').removeClass('selected');
				$(this).addClass('selected');
				app.packageType = $(this).data('type');
			});
			
			$.get(app.apiUrl + '?action=getTrainers', data, function(result) {
		   		$.each(result, function(i, item) {
		   		
		   			items[item.id] = item;
			   		
			   		template1.find('h4').html(item.realname);
			   		template1.find('h5').html(item.category);
			   		template1.find('img:last').attr('src', app.serverUrl + 'pics/trainers/' + item.id + '.jpg');
			   		template1.find('.selectbtn1').attr('data-id', item.id);
			   		template1.find('a').attr('data-id', item.id);
			   		
			   		container1.append(template1.html());
			   		
		   		});
		   		
		   		$('.selectbtn1').unbind(eventEnd).bind(eventEnd, function (e) {
		   		
		   			var id = $(this).data('id');
		   			//console.log('id');
		   			app.packageTrainer = id;
					LEVEL = 2;
					teleportMe('vali_kava');
				});
			}, 'jsonp');
			
		} else if(step == 2) {
			
			template2 = $('.content-template-vali-kava');
			container2 = $('.content-content-vali-kava');
			container2.html('');
			
			var trainer = items[app.packageTrainer];
			console.log(items);
			console.log(app.packageTrainer);
			console.log(trainer);
			
			items = [];
			
			data.trainer_id = app.packageTrainer;
			data.type = app.packageType;
			
			$('.treener').find('img').attr('src', app.serverUrl + 'pics/trainers/' + trainer.id + '.jpg');
			$('.treener').find('h2').html(trainer.realname);
			
			$('.detailsbtn:first').unbind(eventEnd).bind(eventEnd, function (e) {
			   		
		   		$('.voucher').hide();
		   		
	   			var id = $(this).parent().data('id');
	   		
				//e.preventDefault();
				addHover( this );
				
				$('#overlay').find('img:first').attr('src', app.serverUrl + 'pics/trainers/' + trainer.id + '.jpg');
				$('#overlay').find('h1').html(trainer.realname);
				$('#overlay').find('h2').html(trainer.category);
				$('#overlay').find('h4').html('');
				$('#overlay').find('p').html(trainer.description);
				
				$('#overlay').addClass('scale');
				setTimeout(function () {
					$('#overlay').addClass('scaleIn');
				}, 100);
			});
			
			$.get(app.apiUrl + '?action=getTemplates', data, function(result) {
			
		   		$.each(result, function(i, item) {
		   			
		   			items[item.id] = item;
			   		
			   		template2.find('.name').html(item.name);
			   		template2.find('.price').html(item.price + ' €');
			   		template2.find('img:last').attr('src', app.serverUrl + 'pics/templates/' + item.id + '.jpg');
			   		template2.find('.selectbtn').attr('data-id', item.id);
			   		
			   		container2.append(template2.html());
			   		
		   		});
		   		
		   		$('.detailsbtn:not(:first)').unbind(eventEnd).bind(eventEnd, function (e) {
			   		
			   		$('.voucher').hide();	
			   		
		   			var id = $(this).parent().data('id');
		   			toBuy = [];
		   			toBuy.push(id);
		   			
		   			console.log(items);
		   			console.log(id);
		   			console.log(template2.html());
		   			
					addHover(this);
					
					$('#overlay').find('img:first').attr('src', app.serverUrl + 'pics/templates/' + id + '.jpg');
					$('#overlay').find('h1').html(items[id].name);
					$('#overlay').find('h2').html(items[id].price + ' €');
					$('#overlay').find('h4').html('');
					$('#overlay').find('p').html(items[id].description);
					
					$('#overlay').addClass('scale');
					setTimeout(function () {
						$('#overlay').addClass('scaleIn');
					}, 100);
					
					$('.buybtn').addClass('slideIn');
					
				});
			
				$('.buybtn').unbind(eventEnd).bind(eventEnd, function (e) {
					//e.preventDefault();
					
					$('#minuandmed').addClass('scale');
					setTimeout(function () {
						$('#minuandmed').addClass('scaleIn');
					}, 500);
					
					$('#overlay').removeClass('scale');
					setTimeout(function () {
						$('#overlay').removeClass('scaleIn');
					}, 100);
			
				});
				
				$('.orderbtn').unbind(eventEnd).bind(eventEnd, function (e) {
					
					$('#minuandmed').removeClass('scale');
					setTimeout(function () {
						$('#minuandmed').removeClass('scaleIn');
					}, 100);
					
					$('#buyoverlay').addClass('prepare').addClass('scale');
					setTimeout(function () {
						$('#buyoverlay').addClass('scaleIn');
						$('.alternatiivbtn').html('').click();
					}, 500);
			
					var here = $('#buyoverlay .checkout');
			
					here.html('');
					
					var html = '';
					
					var totalprice = 0;
					
					for (var i = 0; i < toBuy.length; i++) {
			
						var id = toBuy[i];
			
						var name = $('.box33[data-id=' + id + ']').children('h4.name').text();
						var price = $('.box33[data-id=' + id + ']').children('h4.price').text();
						
			
						html += '<div class="inbasket"><div class="naming">'+ name +'</div><div class="pricing">'+ price +'</div><div class="erase"></div><div class="clear"></div></div>';
			
						price = price.replace(' €', '');
						totalprice = Number(totalprice) + Number(price);
						//console.log( Number(totalprice), Number(price));
			
					}
					
					totalprice = totalprice.toFixed(2);
					
					html += '<div class="intotal"><div class="naming">Summa:</div><div class="pricing">'+ totalprice +'  €</div><div class="clear"></div></div>';
					
					here.append(html);
		   		});
			}, 'jsonp');
			
		}	
		
	},
	
	getFitshop: function() {
	
		items = [];
	
		template = $('.content-template');
		container = $('.content-content');
		container.html('');
		
		data = {};
		data.club_id = club_id;
		
		$.get(app.apiUrl + '?action=getFitshop', data, function(result) {
	   		$.each(result, function(i, item) {
	   		
	   			items[item.id] = item;
		   		
		   		template.find('h4:first').html(item.name);
		   		template.find('h4:last').html(item.price + ' €');
		   		template.find('img:last').attr('src', app.serverUrl + 'pics/fitshop/' + item.id + '.jpg');
		   		template.find('.box33').attr('data-id', item.id);
		   		
		   		container.append(template.html());
		   		
	   		});
	   		console.log(result);
	   		
	   		$('.detailsbtn').unbind(eventEnd).bind(eventEnd, function (e) {
	   		
	   			var id = $(this).data('id');
	   		
				//e.preventDefault();
				addHover( this );
				$('.voucher').show();
				$('#overlay').find('img:first').attr('src', app.serverUrl + 'pics/trainers/' + id + '.jpg');
				$('#overlay').find('h1').html(items[id].name);
				$('#overlay').find('h2').html(items[id].price + ' €');
				$('#overlay').find('h4').html('');
				$('#overlay').find('p').html(items[id].description);
				
				$('#overlay').addClass('scale');
				setTimeout(function () {
					$('#overlay').addClass('scaleIn');
				}, 100);
			});
	   		
	   	}, 'jsonp');
		
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

function storeFile(type, module, id) {
	var fileTransfer = new FileTransfer();
	if(type == 'videos')
		extension = 'mp4';
	else
		extension = 'jpg';
	
	var uri = encodeURI(app.serverUrl + type + '/' + module + '/' + id + '.' + extension);
	
	fileTransfer.download(
	    uri,
	    filePath,
	    function(entry) {
	        console.log("download complete: " + entry.fullPath);
	        //$('img.')
	    },
	    function(error) {
	        console.log("download error source " + error.source);
	        console.log("download error target " + error.target);
	        console.log("upload error code" + error.code);
	    },
	    false,
	    {
	        headers: {
	            "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
	        }
	    }
	);
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
	   
	   	$.get(app.apiUrl + '?action=reportAnError', error_data, function(result) {
	   		//if(result.success)
	   			//console.log('Error reported');
	   	}, 'jsonp');
	}
}

window.onerror = function (msg, url, line) {
	deliverError(msg, url, line);
}

function errorCB(e) {
	alert('Error in DB: ' + e);
	console.error(e);
}