//finish this file on weekends!!
var lang = 'et';
var translations = [];
var data = {};  //data object for querying data from server, should be emptied all the time.
var user = {};  //object for holding user data / gets from local DB or remote DB
var items = []; //array for holding module items for inside navigation, without regetting them from server. should be emtied all the time
var db = {};

var categories = [];

var muscle_groups = [];
muscle_groups[1] = 'Trapets';
muscle_groups[2] = 'Rind';
muscle_groups[3] = 'Kõht';
muscle_groups[4] = 'Esireis';
muscle_groups[5] = 'Säär';
muscle_groups[6] = 'Õlg';
muscle_groups[7] = 'Biitseps';
muscle_groups[8] = 'Ranne';
muscle_groups[9] = 'Tuhar';
muscle_groups[10] = 'Alaselg';
muscle_groups[11] = 'Tuhar';
muscle_groups[12] = 'Tagareis'
muscle_groups[13] = 'Triitseps';

firstLoad = true;
totalSteps = 10;

var club_id = 2;
var trainer = {};



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
		
		$('#frontpage').find('.w50').show();
		
		con = checkConnection();
		
		console.log('checking connection');
		
		setTimeout(function() {
			console.log('starting fb init');
			try {
				FB.init({ appId: "161092774064906", nativeInterface: CDV.FB, useCachedDialogs: false });
			} catch (e) {
				deliverError(e, 'app.js', '216');
			}
			
		}, 1500);
		//lang = 'en';
		//localStorage.removeItem('fit_lang');
		if (localStorage.getItem('fit_lang')) {
			lang = localStorage.getItem('fit_lang');
			app.translateApp();
			$('.langselector').find('a').removeClass('active');
			$('.langselector').find('a[data-lang="'+lang+'"]').addClass('active');
		} else {
			lang = 'et';
			app.translateApp();
					
		}
		$('.langselector').find('a').click(function(e) {
			e.preventDefault();
			lang = $(this).data('lang');
			localStorage.setItem('fit_lang', 'et');
			app.translateApp();
			$('.langselector').find('a').removeClass('active');
			$(this).addClass('active');
		});
		
		console.log('going to initlogin');
		
		app.initLogin(false);
		
		console.log('going to translate');
		
		
		setTimeout(function() {
			app.syncData();
		}, 300000);
		
	},
	
	/*
	* if first time, get from
	*/
	
	syncData: function() {
		
		showLoading();
		
		setTimeout(function() {
			$('#loading').hide();
		}, 5000);
		
		localStorage.removeItem('notFirstTime');
	
		if (!localStorage.getItem('notFirstTime')) {
		
			//empty all the databases
			localStorage.removeItem('fitNotificationsCount')
			localStorage.removeItem('fitNotifications')
		
			//create tables, approx 2,5MB size database, 5MB maximum
			db.transaction(function(tx) {
				//20 rows max, 250kb
				tx.executeSql('DROP TABLE IF EXISTS TRAININGS');
				tx.executeSql('CREATE TABLE IF NOT EXISTS TRAININGS (id unique, type, name, description, data)');
				//20 rows max, 250kb
				tx.executeSql('DROP TABLE IF EXISTS NUTRITIONS');
				tx.executeSql('CREATE TABLE IF NOT EXISTS NUTRITIONS (id unique, type, name, description, data)');
				//250 rows max, 300kb
				tx.executeSql('DROP TABLE IF EXISTS EXERCISES');
				tx.executeSql('CREATE TABLE IF NOT EXISTS EXERCISES (id unique, type, name, name_en, name_ru, data, video, description, description_en, description_ru, category, muscle)');
				//50 rows max, 20kb
				tx.executeSql('DROP TABLE IF EXISTS NOTIFICATIONS');
				tx.executeSql('CREATE TABLE IF NOT EXISTS NOTIFICATIONS (id unique, is_read, heading, message, `from`, send)');
				//700 rows max, 224kb
				tx.executeSql('DROP TABLE IF EXISTS TEST');
				tx.executeSql('CREATE TABLE IF NOT EXISTS TEST (id unique, exercise, sex, min_age, max_age, min_score, max_score, grade)');
				//300 rows max 1mb
				tx.executeSql('DROP TABLE IF EXISTS DIARY');
				tx.executeSql('CREATE TABLE IF NOT EXISTS DIARY (id unique, day, month, year, package, training_day, length, day_data)');
			}, function(error) {
				console.error('Error on line 134:');
				console.log(error);
			}, function() {
				console.log('Tables created');
			});
			
			$.get(app.apiUrl + '?action=getTestResults', data, function(result) {
				db.transaction(function(tx) {
					$.each(result, function(i, item) {
					
					
						var statement = 'INSERT INTO TEST (id, exercise, sex, min_age, max_age, min_score, max_score, grade) VALUES ("' + (i+1) + '", "' + item.exercise + '", "' + item.sex + '", "' + item.min_age + '", "' + item.max_age + '", "' + item.min_score + '", "' + item.max_score + '", "' + item.grade + '")';
						//console.log(statement);
						//return false;
				   		tx.executeSql(statement);
			   		
					
				   	});
				}, errorCB, function() {
					console.log('Inserted all rows');
				});
			}, 'jsonp');
			
			data = {};
			data.club_id = club_id;
			
			$.get(app.apiUrl + '?action=getCategories', data, function(result) {
				localStorage.setObject('fitCats', result);
				
				/*
				* pic download
				*/
				
			}, 'jsonp');
			
			localStorage.setItem('notFirstTime', true);
		}
	
		var notificationsCount = parseInt(localStorage.getItem('fitNotificationsCount'));
		if(!notificationsCount)
			var notificationsCount = 0;
		var notIDs = localStorage.getObject('fitNotifications');
		if (!notIDs)
			var notIDs = [];
			
		data.ids = notIDs;
		data.user = user.id;
		data.club = club_id;
		$.get(app.apiUrl + '?action=getNotifications', data, function(result) {
			db.transaction(function(tx) {
				$.each(result, function(i, item) {
					
					var statement = 'INSERT INTO NOTIFICATIONS (id, is_read, heading, message, `from`, send) VALUES (' + parseInt(item.id) + ', 0, "' + item.heading + '", "' + item.message + '", "' + item.from + '", "' + item.send + '")';
					console.log(statement);
						//return false;
				   	tx.executeSql(statement);
				
					notIDs.push(item.id);
					notificationsCount = notificationsCount + 1;
				});
				
				notIDs = notIDs.filter(function (e, i, notIDs) {
				    return notIDs.lastIndexOf(e) === i;
				});
				
				localStorage.setObject('fitNotifications', notIDs);
				localStorage.setItem('fitNotificationsCount', notificationsCount);
				if($('#homepage').length)
					$('#homepage').find('#notificationsCount').html('(' + localStorage.getItem('fitNotificationsCount') + ')');
			}, errorCB, function() {
				console.log('Inserted all rows');
			});
		}, 'jsonp');
		
		var trainingsCount = parseInt(localStorage.getItem('fitTrainingsCount'));
		if(!trainingsCount)
			var trainingsCount = 0;
		var notIDs = localStorage.getObject('fitTrainings');
		if (!notIDs)
			var notIDs = [];
		
		data = {};
		data.user_id = user.id;
		data.club_id = club_id;
		data.ids = notIDs;
		$.get(app.apiUrl + '?action=getTrainings', data, function(result) {
			
	   		$.each(result, function(i, item) {
	   			
	   			if (item.order_id && item.order_id != '0' && item.order_id != 0) {
	   				console.log('order');
					trainings.orderPackages.push(item);
				} else {
					console.log('sample');
					trainings.samplePackages.push(item);
				}
		   		db.transaction(function(tx) {
		   			var sql = "INSERT INTO TRAININGS (id, type, name, description, data) VALUES ("+item.id+", 'training', '"+item.name+"', '"+item.description+"', '"+JSON.stringify(item.exercises)+"')";
		   			console.log(sql);
			   		tx.executeSql(sql);
		   		}, errorCB, function() {
		   		
		   			notIDs.push(item.id);
					trainingsCount = trainingsCount + 1;
		   		
					console.log('Success3');
				});
	   		});
	   		
	   		notIDs = notIDs.filter(function (e, i, notIDs) {
			    return notIDs.lastIndexOf(e) === i;
			});
			
			localStorage.setObject('fitTrainings', notIDs);
			localStorage.setItem('fitTrainingsCount', trainingsCount);
		
		}, 'jsonp');
		
		var nutritionsCount = parseInt(localStorage.getItem('fitNutritionsCount'));
		if(!nutritionsCount)
			var nutritionsCount = 0;
		var notIDs = localStorage.getObject('fitNutritions');
		if (!notIDs)
			var notIDs = [];
		data.ids = notIDs;
		$.get(app.apiUrl + '?action=getNutritions', data, function(result) {
			//console.log(result);
	   		$.each(result, function(i, item) {
	   		
	   			if (item.order_id && item.order_id != '0' && item.order_id != 0) {
					nutritions.orderNutritions.push(item);
				} else {
					nutritions.sampleNutritions.push(item);
				}
		   		db.transaction(function(tx) {
			   		tx.executeSql("INSERT INTO NUTRITIONS (id, type, name, description, data) VALUES ("+item.id+", 'training', '"+item.name+"', '"+item.description+"', '"+JSON.stringify(item.meals)+"')");
		   		}, errorCB, function() {
		   			notIDs.push(item.id);
					nutritionsCount = nutritionsCount + 1;
		   		
					console.log('Success4');
				});
	   		});
	   		
	   		notIDs = notIDs.filter(function (e, i, notIDs) {
			    return notIDs.lastIndexOf(e) === i;
			});
			
			localStorage.setObject('fitNutritions', notIDs);
			localStorage.setItem('fitNutritionsCount', nutritionsCount);
		
		}, 'jsonp');
	
		/*
		* if online, check new templates, send test results
		* userData
		*/
		
		//app.initPackages();
		
		//stuff to be synced outside the app:
		/*
		* firsttime sync:
		* TEST - OK
		* CATEGORIES - OK
		*/
		
		/*
		* rare sync:
		* EXERCISES - 
		* NOTIFICATIONS - OK
		* TRAINING PLANS - 30%
		* NUTRITION PLANS - 30%
		*/
		
		
		//stuff to be synced outside the app, often
		/*
		* user profile
		* user test
		* user diary
		*/
		
	},
	
	getNotifications: function(){
	
		db.transaction(function(tx) {
			query = 'SELECT * FROM NOTIFICATIONS ORDER BY send DESC';
			console.log(query);
			tx.executeSql(query, [], function(tx, results) {
				
				var len = results.rows.length, i;
				for (i = 0; i < len; i++) {
				
					notification = results.rows.item(i);
					var shortText = notification.message;
					$('#teated').find('.training-content').append('<section class="item noicon teleport" data-page="treening_naidiskavad_1paev" data-level="3" data-id="' + notification.id + '"><div class="item_wrap"><h6>' + notification.heading + '</h6><h3>' + shortText + '</h3></div></section>');
				}
				
				$('#teated').find('.teleport').click(function(e) {
					e.preventDefault();
					LEVEL = 3;
					teleportMe('teated_sisu', $(this).data('id'));
					
				});
				
			}, function(tx, results) {
				console.error('Error in selecting test result');
				console.log(tx);
				console.log(results);
			});
		}, function(error) {
			console.error('Error in selecting test result');
			console.log(error);
		});
		
		
	},
	getNotificationDetail: function(id) {
		
		db.transaction(function(tx) {
		
			query = 'SELECT * FROM NOTIFICATIONS WHERE id = ' + parseInt(id);
			console.log(query);
			tx.executeSql(query, [], function(tx, results) {
			
				notification = results.rows.item(0);
				var shortText = notification.message;
				$('#teated').find('.training-content').append('<section class="item noicon teleport" data-page="treening_naidiskavad_1paev" data-level="3" data-id="' + notification.id + '"><div class="item_wrap"><h6>' + notification.heading + '</h6><h3>' + shortText + '</h3></div></section>');
				
				if (!notification.is_read || notification.is_read == '0') {
					var count = parseInt(localStorage.getItem('fitNotificationsCount'));
					count = count-1;
					if(count < 1)
						count = 0;	
					localStorage.setItem('fitNotificationsCount', count)
				}
				
				var statement = 'UPDATE NOTIFICATIONS SET is_read = "1" WHERE id = "' + id + '"';
				console.log(statement);
					//return false;
			   	tx.executeSql(statement);
				
			}, function(tx, results) {
				console.error('Error in selecting test result');
				console.log(tx);
				console.log(results);
			});
		}, function(error) {
			console.error('Error in selecting test result');
			console.log(error);
		});	
		
	},
	
	getTrainingsFromDB: function() {
		
		
			
	},
	
	getNutritionsFromDB: function() {
		
		
			
	},
	
	getTrainer: function(trainer) {
		data = {};
		data.trainer_id = trainer;
		$.get(app.apiUrl + '?action=getTrainer', data, function(result) {
		   	trainer = result;
		}, 'jsonp'); 
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
			console.log('going to replace words');
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
		
		$('.fb').unbind('click');
		$('.fb').click(function(e) {
			e.preventDefault();
			var con = checkConnection();
		
			if (con == 'No') {
				navigator.notification.alert('Peate olema sisselogitud', {}, 'Teade', 'Ok');
				return false;
			} else {
				FB.getLoginStatus(function(response) {
					app.curFunction = 'FBLOGINSTATUS';
					if (response.status == 'connected') {
						app.getFacebookMe();
					} else {
						app.authFacebook();
					}
				});

			}
		});
		
		$('.loginformbtn').unbind(eventEnd).bind(eventEnd, function (e) {
		
			hideKeyBoard();
		
			e.preventDefault();
			console.log('submit');
			
			console.log($('#login').find('#clientNr'));
			
			error = false;
			if ($('#login').find('#clientNr').val() == '') {
				$('#login').find('#clientNr').addClass('error');
				error = true;
				console.log('nr');
			} else {
				$('#login').find('#clientNr').removeClass('error');
			}
				
			if ($('#login').find('#clientPass').val() == '') {
				$('#login').find('#clientPass').addClass('error');
				error = true;
				console.log('pass');
			} else {
				$('#login').find('#clientPass').removeClass('error');
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
		
		var con = checkConnection();
		console.log(con);
		if (con == 'No') {
			user = localStorage.getObject('fitUser');
			console.log(user);
			console.log(data);
			if (user.club_nr != data.client_nr) {
				$('#clientNr').addClass('error');
		   		$('#clientPass').addClass('error');
		   		navigator.notification.vibrate(200);
			} else {
				console.log('LOG IN');
				LEVEL = 1;
				teleportMe('homepage', {});
				app.initLogged();
			}
		} else {
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
					app.initLogged();
		   		}
		   		
		   		
		   	}, 'jsonp');
		}
		
	},
	
	initLogged: function() {
		db = window.openDatabase("fitness", "1.0", "Fitness DB", 5000000);
		app.syncData();
	},
	
	initHome: function() {
	
		if (localStorage.getObject('fitTest')) {
			$('#homepage').find('.fitnesstest').hide();
		}
		if (localStorage.getItem('fitNotificationsCount')) {
			$('#homepage').find('#notificationsCount').html('(' + localStorage.getItem('fitNotificationsCount') + ')');
		}
	
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
		
		$('.me').unbind('click');
		$('.me').bind('click', function(e) {
			LEVEL = 1;
			teleportMe('profile');
		});
		
		
		localStorage.setObject('fitUser', user);
			
	},

	
	loadProfile: function() {
		$('#profile').find('h3:first').html('PROFIIL: ' + user.firstname + ' ' + user.lastname);	
	},
	//approx 1hour todo
	initSettings: function() {
		$('.log-out').click(function(e) {
			//logout and to home
		});
	},
	
	parseUserDetails: function() {
		console.log(user);
		$('#firstname').val(user.firstname);
		$('#lastname').val(user.lastname);
		$('#mail').val(user.mail);
		$('#phone').val(user.phone);
		$('#sex').val(user.sex);
		$('#age').val(user.age);
		$('#weight').val(user.weight);
		$('#length').val(user.length);
		$('#training_activity').val(user.training_activity).autoResize();
		$('#training_target').val(user.training_target).autoResize();
		$('#per_week').val(user.per_week).autoResize();
		$('#currently_training').val(user.currently_training).autoResize();
		$('#health_condition').val(user.health_condition).autoResize();
		
		$('textarea').autoResize();
		
		$('#nobg_special_button').click(function() {
			user.firstname = $('#firstname').val();
			user.lastname = $('#lastname').val();
			user.mail = $('#mail').val();
			user.phone = $('#phone').val();
			user.sex = $('#sex').val();
			user.age = $('#age').val();
			user.weight = $('#weight').val();
			user.length = $('#length').val();
			user.training_activity = $('#training_activity').val();
			user.training_target = $('#training_target').val();
			user.per_week = $('#per_week').val();
			user.currently_training = $('#currently_training').val();
			user.health_condition = $('#health_condition').val();
			user.modified = new Date().getTime();
		});
	},
	
	loadExercisePage: function() {
			
		result = localStorage.getObject('fitCats');
		app.parseCategories(result);
	},
	
	parseCategories: function(result) {
	
		console.log(app.muscleGroup);
		
		content = $('.module-content');
		content.html('');
		template = $('.module-template');
		template.hide();
		
   		$.each(result, function(i, item) {
   		
   			console.log(item);
   			categories[item.cat_id] = item.name;
   			template.find('h3').html(item.name);
   			
   			console.log(app.muscleGroup + '_total');
   			
   			if (app.muscleGroup) {
   				if(item[app.muscleGroup + '_total'])
   					template.find('.bubble').html(item[app.muscleGroup + '_total']);
   				else
   					template.find('.bubble').html('0');
   			} else {
   				template.find('.bubble').html(item.total);
   			}	
   			template.find('img').attr('src', app.serverUrl + 'pics/categories/' + item.cat_id + '.jpg');
   			template.find('.harjutus_item').attr('data-cat', item.cat_id);
	   		content.append(template.html());
   		});
   		
   		//app.muscleGroup = 0;
   		
   		$('.harjutus_item').click(function(e) {
		   app.exerciseCat = $(this).data('cat');
		   console.log(app.exerciseCat);
		   
		   LEVEL = 2;
		   teleportMe('harjutused_subpage1');
		   
	   });
	},
	
	//offline huinja
	
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
		
		if (!navigator.onLine) {
			result = localStorage.getObject('fitExercises');
			app.parseExercises(result);
		} else {
			$.get(app.apiUrl + '?action=getExercises', data, function(result) {
				localStorage.setObject('fitExercises', result);
				app.parseExercises(result);
		   }, 'jsonp');
		}

	},
	
	parseExercises: function(result) {
		
		$.each(result, function(i, item) {
	   		
   			items[item.id] = item;
	   		
	   		if (lang == 'et')
	   			template.find('h3').html(item.name);
	   		else
	   			template.find('h3').html(item['name_' + lang]);
	   		
	   		template.find('img:last').attr('src', app.serverUrl + 'pics/exercises/' + item.id + '.jpg');
	   		template.find('.harjutus_item').attr('data-id', item.id);
	   		
	   		container.append(template.html());
	   		
   		});
   		
   		$('.harjutus_item').unbind(eventEnd).bind(eventEnd, function (e) {
   		
   			var id = $(this).data('id');
   		
			LEVEL = 3;
			teleportMe('video', id);
		});
			
	},

	parseExercise: function(extra) {
		console.log('HERE:');
		console.log(items[extra]);
		
		$('#video').find('h3:first').html(items[extra].name);
		$('#video').find('.text_wrap').html(items[extra].description);
		//$('#video').find('source').attr('src', app.serverUrl + 'videos/' + items[extra].id + '.mp4').attr('poster', app.serverUrl + 'videos/' + items[extra].id + '.png');
		$('#video').find('.video-container').html('<video id="video" height="41%" width="100%" controls="" preload="" autoplay="" poster="' + app.serverUrl + 'videos/' + items[extra].id + '.png" onclick="this.play();" onload="this.play();"><source src="' + app.serverUrl + 'videos/' + items[extra].id + '.mp4" poster="' + app.serverUrl + 'videos/' + items[extra].id + '.png"></video>');
		
		
	},
	
	initVideosDownload: function() {
		
		result = localStorage.getObject('fitCats');
		
		template = $('.item-template');
		content1 = $('.items-container1');
		content2 = $('.items-container2');
		
   		$.each(trainings.samplePackages, function(i, item) {
   			template.find('.downloadtitle').html(item.name);
   			template.find('.downloadcircle').find('span').html('0/' + item.exercises_count);
   			template.find('img').attr('src', app.serverUrl + 'pics/categories/2.jpg');
   			template.find('h4').attr('data-cat', item.id).attr('data-type', 'package');
	   		content1.append(template.html());
   		});
   		
   		$.each(trainings.orderPackages, function(i, item) {
   			template.find('.downloadtitle').html(item.name);
   			template.find('.downloadcircle').find('span').html('0/' + item.exercises_count);
   			template.find('img').attr('src', app.serverUrl + 'pics/categories/2.jpg');
   			template.find('h4').attr('data-cat', item.id).attr('data-type', 'package');
	   		content1.append(template.html());
   		});
   		
   		$.each(result, function(i, item) {
   			template.find('.downloadtitle').html(item.name);
   			template.find('.downloadcircle').find('span').html('0/' + item.total);
   			template.find('img').attr('src', app.serverUrl + 'pics/categories/' + item.cat_id + '.jpg');
   			template.find('h4').attr('data-cat', item.cat_id).attr('data-type', 'category');
	   		content2.append(template.html());
   		});
   		
   		$('.items-container1, .items-container2').find('h4').click(function(e) {
   			
   			//statuses
   			
	   		$(this).html('Laen..');
   		});
		
		/*
		* each packages & each categories
		*/
				
	},
	//approx 2-3h to finish this shit
	downloadExerciseVideos: function(type) {
		
		//download sources: categories, training plans
		//get category, get training plan
		//foreach exercises check if this exercise has video already, 
		//if not then download add to category or training plan count
			
	},
	//approx 2-3h to finish this shit
	downloadPics: function() {
		
		//download sources: categories, exercises
		//foreach categories download pic, if download add checkmark to cats
		//foreach all the exercises download pic and add checkmark downloaded
		//finish this shit...
			
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
		   		
		   		$('.detailsbtn:not(:first)').parent().unbind(eventEnd).bind(eventEnd, function (e) {
			   		
			   		$('.voucher').hide();	
			   		
		   			var id = $(this).data('id');
		   			toBuy = [];
		   			toBuy.push(id);
		   			
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
					app.parseUserDetails();
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
					
					$('.bank-link').click(function(e) {
						e.preventDefault();
						app.createOrder($(this).data('bank'), toBuy[0]);
					});
					
		   		});
			}, 'jsonp');
			
		}	
		
	},
	
	createOrder: function(type, buyed) {
		
		console.log(type);
		console.log(buyed);
		console.log(user);
		
		data = {};
		
		data.type = type;
		data.user = user.id;
		data.item = buyed;
		
		$.get(app.apiUrl + '?action=createOrder', data, function(result) {
			
			var order_id = result.id;
			
			if (type != 'bill') {
			
				iabRef = window.open('http://projects.efley.ee/fitnessapp/admin/payment.php?order=' + order_id + '&bank=' + type, '_blank', 'location=yes');
				iabRef.addEventListener('loadstart', function() {
					console.log('started');
				});
				iabRef.addEventListener('loadstop', function() {
					console.log('stoped');
				});
				iabRef.addEventListener('exit', function() {
					console.log('closed');
				});
			
			}
		
		});
		
		/*
		* save order TO DB and open bank link stuff in browser and listen the url... / 2H
		*/	
		
	},
	
	getFitshop: function(isTrainer) {
	
		items = [];
	
		template = $('.content-template');
		container = $('.content-content');
		container.html('');
		
		data = {};
		data.club_id = club_id;
		data.user_id = user.id;
		
		if (isTrainer) {
			data.trainer_id = trainer.id;
		}
		
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
	initTest: function() {
		
		for(i=1;i<32;i++) {
			if(i < 10) day = '0' + i; else day = i;
			$('#daySelect').append('<option value="' + day + '">' + i + '</option>')
		}
		for(i=1;i<13;i++) {
			if(i < 10) month = '0' + i; else month = i;
			$('#monthSelect').append('<option value="' + month + '">' + i + '</option>')
		}
		for(i=1930;i<2000;i++) {
			$('#yearSelect').append('<option value="' + i + '">' + i + '</option>')
		}
	
		$('.datepicker').click(function(e) {
			
			$('#birthdaySelect').addClass('scale');
			setTimeout(function () {
				$('#birthdaySelect').addClass('scaleIn');
				
				$('.save-stuff').click(function(e) {
					//e.preventDefault();
					
					user.birthday = $('#yearSelect').val() + '-' + $('#monthSelect').val() + '-' + $('#daySelect').val();
					user.age = calcAge(user.birthday);
					
					$('#birthdaySelect').find('.closebtn').click();
				});
				
			}, 100);
			
		});
		
		$('.meesbtn, .nainebtn').click(function(e) {
			e.preventDefault();
			if (user.age) {
				
				user.sex = $(this).data('sex');
				LEVEL = 2;
				
				console.log('You are: ' + user.sex + ' and ' + user.age);
				
				teleportMe('fitnesstest');
				
			} else {
				$('.datepicker').css('color', 'red');
			}
		});
		/*
		* retrieve sex + age
		*/
			
	},
	initTestQuestions: function() {
	
		var selectedExercise = 'running';
		//var testResults = {};
		testResults = localStorage.getObject('fitTest');
		if(testResults && testResults.length) {
			$.each(testResults, function(item, score) {
				$('#tulemusinput' + item).val(score);
			});
		}
		if(!testResults)
			var testResults = {};
		
		$('.nobg_item.tiny').click(function(e) {
			$('.nobg_item.tiny').addClass('grey');
			$(this).removeClass('grey');
			lastExercise = $(this).data('type');
		});
		
		$('.save-results').click(function(e) {
			if(!$(this).hasClass('grey')) {
				localStorage.setObject('fitTest', testResults);
			}
		})
		
		$('.answer input').unbind('focus').bind('focus', function (e) {
			$('.tulemusbtn').unbind(eventEnd);
		});
	
		$('.answer input').unbind('blur').bind('blur', function (e) {
			$('.tulemusbtn').unbind(eventEnd).bind(eventEnd, function (e) {
			//e.preventDefault();
				
				var exercise = $(this).data('exercise');
				
				var n = $(this).attr('data-result');
				
				testResults[n] = r;
				
				var r = $('#tulemusinput' + n).val();
				r = Number(r);
				
				if(n == '5' || n == 5) {
					if (selectedExercise == 'running') {
						r = r;
					} else if (selectedExercise == 'bicycle') {
						r = r*2.5;
					} else if (selectedExercise == 'boat') {
						r = r*1.2;
					}
				}
				
				console.log(n, r);
				if(r && r < 1000){
					
					testResults[n] = r;
					
					var grade = 1;
					
					showLoading();
					
					db.transaction(function(tx) {
						query = 'SELECT grade, min_score, max_score FROM TEST WHERE exercise = "' + exercise + '" AND sex = "' + user.sex + '" AND min_age <= "' + user.age + '" AND max_age >= "' + user.age + '"';
						console.log(query);
						tx.executeSql(query, [], function(tx, results) {
							
							var len = results.rows.length, i;
							for (i = 0; i < len; i++) {
							
								item = results.rows.item(i);
								console.log(item);
							
								if (item.min_score == '0' && item.max_score == '0') {
									$('.grade-' + item.grade).html('0');
								} else if(item.min_score == '0') {
									$('.grade-' + item.grade).html('<' + item.max_score);
								} else if(item.max_score == '1000' || item.max_score == '0') {
									$('.grade-' + item.grade).html('>' + item.min_score);
								} else {
									$('.grade-' + item.grade).html(item.min_score + '-' + item.max_score);
								}
								
								if (item.min_score <= r && item.max_score >= r) {
									console.log(item);
									if (item.min_score == '0' && item.max_score == '0') {
										$('.result-text').html('0');
									} else if(item.min_score == '0') {
										$('.result-text').html('<' + item.max_score);
									} else if(item.max_score == '1000' || item.max_score == '0') {
										$('.result-text').html('>' + item.min_score);
									} else {
										$('.result-text').html(item.min_score + '-' + item.max_score);
									}
									
									grade = item.grade;
									
								}
								
							}
							
							$('#loading').hide();
							$('#caruseloverlay').addClass('scale');
							setTimeout(function () {
									$('#caruseloverlay').addClass('scaleIn');
							}, 100);
							
							
							var grades = {
								1: 0,
								2: 1,
								3: 3,
								4: 6,
								5: 10,
								6: 15,
								7: 20
							}
							
							var score = grades[grade];
							
							var newresult = Number(TOTALRESULT) + Number(score);
							
							TOTALRESULT = newresult.toFixed(0);
							
							if (grade == 7) {
								anim = '7';
								tulemus = 'Suurepärane';
							} else if(grade == 6) {
								anim = '6';
								tulemus = 'Hea';
							} else if(grade == 5) {
								anim = '5';
								tulemus = 'Üle keskmise';
							} else if(grade == 4) {
								anim = '4';
								tulemus = 'Keskmine';
							} else if(grade == 3) {
								anim = '3';
								tulemus = 'Alla keskmise';
							} else if(grade == 2) {
								anim = '2';
								tulemus = 'Nõrk';
							} else if(grade == 1) {
								anim = '1';
								tulemus = 'Väga nõrk';
							}
							
							setTimeout(function(){
								$('.carusel-texts').addClass('anim_' + anim + '0');
								$('.carusel .normal').addClass('anim_' + anim + '0');
								$('.carusel .greentriangle').attr('src', 'i/test/tulemus.png');
								$('.result span').text( tulemus );
							}, 500);
		
							$('.jargminetest').attr('data-test', n);
							
							setTimeout(function(){
								$('.tulemus, .results').addClass('anim_in');
								$('.result-text').fadeIn();
								
								if(n < 5){
									$('.jargminetest').addClass('anim_in');
								}
								
								if(n == 5){
									$('.kogutulemus').addClass('anim_in');
									$('.save-results').removeClass('grey');
								}
							}, 3000);
							
							if (n == '1') {
								var top = $('.test2').position().top;
								console.log(top);
								$('body').scrollTop(top);
							}
							
							addHover( this );
							
						}, function(tx, results) {
							console.error('Error in selecting test result');
							console.log(tx);
							console.log(results);
						});
					}, function(error) {
						console.error('Error in selecting test result');
						console.log(error);
					});
					/*$.get(app.apiUrl + '?action=getTestResults', data, function(result) {
						
					
					}, 'jsonp');*/
					
					$('.overlay .jargminetest').unbind(eventEnd).bind(eventEnd, function(e) {
						e.preventDefault();
						
						var next = $(this).attr('data-test');
						var h = $('#test' + next ).height();
						var top = Number(h) * next;
						
						$('.toscroll').animate( {scrollTop: top + 'px'}, 300);
						
						$('#caruseloverlay').addClass('scaleOut');
						var _this = $('#caruseloverlay');
						setTimeout(function () {
							_this.removeClass('scaleIn').removeClass('scaleOut');
							
							setTimeout(function () {
								_this.removeClass('scale');
							}, 50);
							$('#caruseloverlay .tulemus, #caruseloverlay .results, #caruseloverlay .jargminetest').removeClass('anim_in');
							$('.result-text').hide();
							$('.carusel-texts').removeClass('anim_' + anim + '0');
							$('#caruseloverlay .carusel .normal').removeClass('anim_' + anim + '0');
							
						}, 350);
						
						addHover( this );
					});
					
					$('.overlay .kogutulemus').unbind(eventEnd).bind(eventEnd, function(e) {
						e.preventDefault();
						
						$('#caruselTOTALoverlay .finalresults h3').text(TOTALRESULT + ' p');
										
						$('#caruselTOTALoverlay').addClass('scale');
						setTimeout(function () {
							$('#caruselTOTALoverlay').addClass('scaleIn');
						}, 100);
						
						addHover( this );
					});
					
					$('.overlay .sulge').unbind(eventEnd).bind(eventEnd, function(e) {
						e.preventDefault();
						
						$('#caruseloverlay, #caruselTOTALoverlay').addClass('scaleOut');
				
						setTimeout(function () {
							$('#caruseloverlay, #caruselTOTALoverlay').removeClass('scaleIn').removeClass('scaleOut');
							
							setTimeout(function () {
								$('#caruseloverlay, #caruselTOTALoverlay').removeClass('scale');
							}, 50);
							$('#caruseloverlay .tulemus, #caruseloverlay .results, #caruseloverlay .jargminetest, #caruseloverlay .kogutulemus').removeClass('anim_in');
							$('.result-text').hide();
							$('#caruseloverlay .carusel .normal').removeClass('anim_' + anim + '0');
							$('.carusel-texts').removeClass('anim_' + anim + '0');
							
						}, 350);
						
						addHover( this );
					});
				
				}
	
			});
		});
		
	}
	
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
	deliverError('Error in DB: ' + e, 'app.js', 800);
	//alert('Error in DB: ' + e);
	console.error(e);
}

function checkConnection() {
	return '3G';
	var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown';
    states[Connection.ETHERNET] = 'Ethernet';
    states[Connection.WIFI]     = 'WiFi';
    states[Connection.CELL_2G]  = '2G';
    states[Connection.CELL_3G]  = '3G';
    states[Connection.CELL_4G]  = '4G';
    states[Connection.NONE]     = 'No';
    
    console.log(states[networkState]);
    
    return states[networkState];
}
function calcAge(dateString) {
  var birthday = +new Date(dateString);
  return ~~((Date.now() - birthday) / (31557600000));
}