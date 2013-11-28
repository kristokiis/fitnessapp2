var lang = 'et';
var translations = [];
var data = {};  //data object for querying data from server, should be emptied all the time.
var user = {};  //object for holding user data / gets from local DB or remote DB
var items = []; //array for holding module items for inside navigation, without regetting them from server. should be emtied all the time
var db = {};
var downloadedVideos = [];

var categories = [];

var sPath = '';

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

var club_id = 21;
var trainer = {};

var app = {
	
	apiUrl: 'http://www.fitnessmobile.ee/api/server.php',
	serverUrl: 'http://www.fitnessmobile.ee/admin/',
	curFunction: 'do not know..',
	exerciseCat: 0,
	muscleGroup: false,
	packageType: 'training',
	packageTrainer: 0,
	packageTemplate: 0,
	packageMeeting: '',
	
	init: function() {
		
		con = checkConnection();
		
		//console.log('checking connection');
		
		setTimeout(function() {
			//console.log('starting fb init');
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
			localStorage.setItem('fit_lang', lang);
			app.translateApp();
			$('.langselector').find('a').removeClass('active');
			$(this).addClass('active');
		});
		if(localStorage.getItem('sPath')) {
			sPath = localStorage.getItem('sPath');
			//console.log(sPath);
		}
		
		//console.log('going to initlogin');
		
		app.initLogin(false);

		//localStorage.removeItem('fitNotFirstTime');
	},
	
	/*
	* if first time, get from
	*/
	
	syncData: function() {
		
		if($('.open').length > 1) {
			console.log('app is broken :(');
			$('.open:first').remove();
		}
		
		//first time always online
		if (!localStorage.getItem('fitNotFirstTime')) {
			showLoading();
			setTimeout(function() {
				$('#loading').hide();
			}, 3000);
		
			//empty all the databases
			localStorage.removeItem('fitCats');
			
			localStorage.removeItem('sPath');
			
			localStorage.removeItem('fitNotificationsCount');
			
			localStorage.removeItem('fitTrainingsCount');
			localStorage.removeItem('fitTrainings');
			localStorage.removeItem('fitNutritionsCount');
			localStorage.removeItem('fitNutritions');
			
			localStorage.removeItem('fitExercises');
			
			localStorage.removeItem('fitCurDay');
			
			localStorage.removeItem('fitTest');
		
			//create tables, approx 2,5MB size database, 5MB maximum
			db.transaction(function(tx) {
				//20 rows max, 250kb
				tx.executeSql('DROP TABLE IF EXISTS TRAININGS');
				tx.executeSql('CREATE TABLE IF NOT EXISTS TRAININGS (id unique, type, name, description, exercises, day_names, has_offers)');
				//20 rows max, 250kb
				tx.executeSql('DROP TABLE IF EXISTS NUTRITIONS');
				tx.executeSql('CREATE TABLE IF NOT EXISTS NUTRITIONS (id unique, type, name, description, meals, has_offers)');
				//250 rows max, 300kb
				tx.executeSql('DROP TABLE IF EXISTS EXERCISES');
				tx.executeSql('CREATE TABLE IF NOT EXISTS EXERCISES (id unique, type, name, name_en, name_ru, data, video, description, description_en, description_ru, category, muscle, muscle2, muscle3)');
				//50 rows max, 20kb
				tx.executeSql('DROP TABLE IF EXISTS NOTIFICATIONS');
				tx.executeSql('CREATE TABLE IF NOT EXISTS NOTIFICATIONS (id unique, is_read, heading, message, `from`, send)');
				//700 rows max, 224kb
				tx.executeSql('DROP TABLE IF EXISTS TEST');
				tx.executeSql('CREATE TABLE IF NOT EXISTS TEST (id unique, exercise, sex, min_age, max_age, min_score, max_score, grade)');
				//300 rows max 1mb
				tx.executeSql('DROP TABLE IF EXISTS DIARY');
				tx.executeSql('CREATE TABLE IF NOT EXISTS DIARY (id INTEGER PRIMARY KEY AUTOINCREMENT, day, month, year, package, training_day, length, plan_name, day_name, day_data, type, synced INTEGER)');
			}, function(error) {
				console.error('Error on line 134:');
				//console.log(error);
			}, function() {
				//console.log('Tables created');
			});
			
			$.get(app.apiUrl + '?action=getTestResults', data, function(result) {
				db.transaction(function(tx) {
					$.each(result, function(i, item) {
					
					
						var statement = 'INSERT INTO TEST (id, exercise, sex, min_age, max_age, min_score, max_score, grade) VALUES ("' + (i+1) + '", "' + item.exercise + '", "' + item.sex + '", "' + item.min_age + '", "' + item.max_age + '", "' + item.min_score + '", "' + item.max_score + '", "' + item.grade + '")';
						////console.log(statement);
						//return false;
				   		tx.executeSql(statement);
			   		
					
				   	});
				}, errorCB, function() {
					//console.log('Inserted all rows');
				});
			}, 'jsonp');	
			
			localStorage.setItem('fitNotFirstTime', true);	
			
		}
		//requires us to be online
		var con = checkConnection();
		if (con != 'No') {
		
			//CATS
			data = {};
			data.club_id = club_id;
			$.get(app.apiUrl + '?action=getCategories', data, function(result) {
				localStorage.setObject('fitCats', result);
				cats = [];
				$.each(result, function(i, cat) {
					cats.push(cat.category);
				});
				if (firstLoad) {
					app.downloadPics('categories', cats);
					firstLoad = false;
				}
			}, 'jsonp');
			
			/*
			* EXERCISES
			*/
			var ex_notIDs = localStorage.getObject('fitExercises');
			if(!ex_notIDs)
				ex_notIDs = [];
			data = {};	
			data.ids = ex_notIDs;
			data.user = user.id;
			data.club_id = club_id;
			console.log(data);
			$.get(app.apiUrl + '?action=getExercises', data, function(result) {
				db.transaction(function(tx) {
					var pics = [];
					$.each(result, function(i, item) {
						
						var statement = 'INSERT INTO EXERCISES (id, type, name, name_en, name_ru, data, video, description, description_en, description_ru, category, muscle, muscle2, muscle3) VALUES (' + parseInt(item.id) + ', "' + item.heading + '", "' + item.name + '", "' + item.name_en + '", "' + item.name_ru + '", "0", "0", "' + item.description + '", "' + item.description_en + '", "' + item.description_ru + '", "' + item.category + '", "' + item.muscle_group + '", "' + item.muscle_group2 + '", "' + item.muscle_group3 + '")';
						console.log(statement);
							//return false;
					   	tx.executeSql(statement);
					
						ex_notIDs.push(item.id);
						pics.push(item.id);
						
					});
					
					app.downloadPics('exercises', pics);
					
					ex_notIDs = ex_notIDs.filter(function (e, i, ex_notIDs) {
					    return ex_notIDs.lastIndexOf(e) === i;
					});
					
					localStorage.setObject('fitExercises', ex_notIDs);
					
				}, errorCB, function() {
					//console.log('Inserted all rows');
				});
			}, 'jsonp');
			
			/*
			* NOTIFICATIONS
			*/
			
			var notificationsCount = parseInt(localStorage.getItem('fitNotificationsCount'));
			if(!notificationsCount)
				var notificationsCount = 0;
			data = {};	
			data.ids = {};
			data.user = user.id;
			data.club = club_id;
			$.get(app.apiUrl + '?action=getNotifications', data, function(result) {
				db.transaction(function(tx) {
					$.each(result, function(i, item) {
						
						var statement = 'INSERT INTO NOTIFICATIONS (id, is_read, heading, message, `from`, send) VALUES (' + parseInt(item.id) + ', 0, "' + item.heading + '", "' + item.message + '", "' + item.from + '", "' + item.send + '")';
						////console.log(statement);
							//return false;
					   	tx.executeSql(statement);
					   	
					   	//alert('Said teate');
						notificationsCount = notificationsCount + 1;
					});
					
					localStorage.setItem('fitNotificationsCount', notificationsCount);
					setTimeout(function() {
						var count = localStorage.getItem('fitNotificationsCount');
						if($('#homepage').length && count != '0')
							$('#homepage').find('#notificationsCount').html('(' + localStorage.getItem('fitNotificationsCount') + ')').parent().parent().parent().show();
					}, 600);
				}, errorCB, function() {
					//console.log('Inserted all rows');
				});
			}, 'jsonp');
			
			/*
			* TRAININGS
			*/
			var trainingsCount = parseInt(localStorage.getItem('fitTrainingsCount'));
			if(!trainingsCount)
				var trainingsCount = 0;
			var tr_notIDs = localStorage.getObject('fitTrainings');
			if(!tr_notIDs)
				tr_notIDs = [];
			data = {};
			data.user_id = user.id;
			data.club_id = club_id;
			data.ids = tr_notIDs;
			$.get(app.apiUrl + '?action=getTrainings', data, function(result) {
				db.transaction(function(tx) {
			   		$.each(result, function(i, item) {
			   		
			   			//console.log(item);
			   		
			   			var sql = "INSERT INTO TRAININGS (id, type, name, description, exercises, day_names, has_offers) VALUES ("+item.id+", '" + (item.order_id && item.order_id != '0' && item.order_id != 0 ? 'order' : 'sample') + "', '"+item.name+"', '"+item.description+"', '" + JSON.stringify(item.exercises) + "', '" + JSON.stringify(item.day_names) + "', '" + item.has_offers + "')";
			   			//console.log(sql);
				   		tx.executeSql(sql);
				   		
				   		tr_notIDs.push(item.id);
				   		trainingsCount = trainingsCount + 1;
			   		});
			   	
		   		
			   		setTimeout(function() {
				   		packs.initTrainings();
			   		}, 500);
			   		
			   		tr_notIDs = tr_notIDs.filter(function (e, i, tr_notIDs) {
					    return tr_notIDs.lastIndexOf(e) === i;
					});
					
					localStorage.setObject('fitTrainings', tr_notIDs);
					localStorage.setItem('fitTrainingsCount', trainingsCount);
					
				}, errorCB, function() {
				
				});
			
			}, 'jsonp');
			//NUTRITIONS
			var nutritionsCount = parseInt(localStorage.getItem('fitNutritionsCount'));
			if(!nutritionsCount)
				var nutritionsCount = 0;
			var nu_notIDs = localStorage.getObject('fitNutritions');
			if(!nu_notIDs)
				nu_notIDs = [];
			data = {};
			data.user_id = user.id;
			data.club_id = club_id;
			data.ids = nu_notIDs;
			$.get(app.apiUrl + '?action=getNutritions', data, function(result) {
				db.transaction(function(tx) {
			   		$.each(result, function(i, item) {
			   		
			   			if (item.order_id && item.order_id != '0' && item.order_id != 0) {
			   				type = 'order';
						} else {
							type = 'sample';
						}
				   		
				   		tx.executeSql("INSERT INTO NUTRITIONS (id, type, name, description, meals, has_offers) VALUES (" + item.id + ", '" + (item.order_id && item.order_id != '0' && item.order_id != 0 ? 'order' : 'sample') + "', '" + item.name + "', '" + item.description + "', '" + JSON.stringify(item.meals) + "', '" + item.has_offers + "')");
				   		
				   		nu_notIDs.push(item.id);
						nutritionsCount = nutritionsCount + 1;
				   		
			   		});
			   		setTimeout(function() {
				   		packs.initNutritions();
			   		}, 500);
			   		
			   		nu_notIDs = nu_notIDs.filter(function (e, i, nu_notIDs) {
					    return nu_notIDs.lastIndexOf(e) === i;
					});
					
					localStorage.setObject('fitNutritions', nu_notIDs);
					localStorage.setItem('fitNutritionsCount', nutritionsCount);
			   	}, errorCB, function() {
				   			
				});
			
			}, 'jsonp');
			/*
			*UPDATE USER
			*/
			data = {};
			user.lang = lang;
			data.user = user;
			//data.test = localStorage.setObject('fitTest');
			
			$.get(app.apiUrl + '?action=updateUser', user, function(result) {
				user.lastSynced = new Date();
				localStorage.setObject('fitUser', user);
			},'jsonp');
			
			db.transaction(function(tx) {
				query = 'SELECT * FROM DIARY WHERE synced = 0 OR synced = "" ORDER BY day DESC';
				//console.log(query);
				tx.executeSql(query, [], function(tx, results) {
					var len = results.rows.length, i;
					if (len) {
						for (i = 0; i < len; i++) {
							var day = results.rows.item(i);
							day.user_id = user.id;
							var statement = 'UPDATE DIARY SET synced = 1 WHERE id = ' + day.id;
						   	tx.executeSql(statement);
							
							$.get(app.apiUrl + '?action=updateDiary', day, function(result) {},'jsonp');
							
						}
					}
					
				}, function(tx, results) {
					console.error('Error in selecting test result');
					//console.log(tx);
					//console.log(results);
				});
			}, function(error) {
				console.error('Error in selecting test result');
				//console.log(error);
			});
		}
		setTimeout(function() {
			app.syncData();
		}, 60000);
		
	},
	
	getNotifications: function(){
		
		template = $('.notifications-template');
		
		db.transaction(function(tx) {
			query = 'SELECT * FROM NOTIFICATIONS ORDER BY send DESC';
			//console.log(query);
			tx.executeSql(query, [], function(tx, results) {
				var len = results.rows.length, i;
				if (len) {
					for (i = 0; i < len; i++) {
						notification = results.rows.item(i);
						var shortText = jQuery.trim(notification.message).substring(0, 30).split(" ").slice(0, -1).join(" ") + '...';
						template.find('.item').attr('data-id', notification.id);
						template.find('h6').html(notification.heading);
						template.find('h4').html(notification.send);
						template.find('h3').html(shortText);
						if (notification.is_read && notification.is_read == '1') {
							template.find('.unread-bullet').hide();
							template.find('.place-holder').show();
						} else {
							template.find('.unread-bullet').show();
							template.find('.place-holder').hide();
						}
						$('#teated').find('.training-content').append(template.html());
					}
					$('#teated').find('.teleport').click(function(e) {
						e.preventDefault();
						LEVEL = 3;
						teleportMe('teated_detail', parseInt($(this).data('id')));
					});
					$('#teated').find('.remove-overlay').click(function(e) {
						e.preventDefault();
						e.stopPropagation();
						element = $(this).parent();
						var id = parseInt(element.data('id'));
						
						db.transaction(function(tx) {
						
							query = 'SELECT is_read FROM NOTIFICATIONS WHERE id = ' + id;
							//console.log(query);
							tx.executeSql(query, [], function(tx, results) {
								notification = results.rows.item(0);
								if(!notification.is_read) {
									var total = parseInt(localStorage.getItem('fitNotificationsCount'));
									total = total - 1;
									localStorage.setItem('fitNotificationsCount', total);
								}
							}, function(tx, results) {
								console.error('Error in selecting test result');
								//console.log(tx);
								//console.log(results);
							});
							
							var statement = 'DELETE FROM NOTIFICATIONS WHERE id = ' + id;
							////console.log(statement);
						   	tx.executeSql(statement);
						   	
						   
						   	element.remove();
					   	});
						
					});
					
				} else {
					$('#teated').find('.training-content').html('<section class="month"><h4>'+translations[lang]['no_notifications']+'</h4></section>');
				}
			}, function(tx, results) {
				console.error('Error in selecting test result');
				//console.log(tx);
				//console.log(results);
			});
		}, function(error) {
			console.error('Error in selecting test result');
			//console.log(error);
		});
		
		
	},
	getNotificationDetail: function(id) {
		
		db.transaction(function(tx) {
		
			query = 'SELECT * FROM NOTIFICATIONS WHERE id = ' + parseInt(id);
			//console.log(query);
			tx.executeSql(query, [], function(tx, results) {
			
				notification = results.rows.item(0);
				var template = $('#teated_detail').find('.toscroll');
				template.find('.item').attr('data-id', notification.id);
				template.find('h6').html(notification.heading);
				template.find('h4').html(notification.send);
				template.find('h3').html(notification.message);
				
				//console.log('what');
				
				if (!notification.is_read || notification.is_read == '0') {
					var count = parseInt(localStorage.getItem('fitNotificationsCount'));
					count = count-1;
					if(count < 1)
						count = 0;	
					localStorage.setItem('fitNotificationsCount', count);
					var statement = 'UPDATE NOTIFICATIONS SET is_read = "1" WHERE id = ' + id;
					////console.log(statement);
				   	tx.executeSql(statement);
				}
				
				
				
			}, function(tx, results) {
				console.error('Error in selecting test result');
				//console.log(tx);
				//console.log(results);
			});
		}, function(error) {
			console.error('Error in selecting test result');
			//console.log(error);
		});	
		
	},
	
	getTrainer: function(trainer) {
		data = {};
		data.trainer_id = trainer;
		$.get(app.apiUrl + '?action=getTrainer', data, function(result) {
		   	trainer = result;
		}, 'jsonp'); 
	},
	
	translateApp: function() {
		$.getScript("js/translations/" + lang + ".js", function() {
			app.replaceWords();
			$('#frontpage').find('.w50').show();
			
			//console.log('going to replace words');
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
		
			addHover(this);
		
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
			addHover(this);
			e.preventDefault();
			////console.log('submit');
			
			////console.log($('#login').find('#clientNr'));
			
			error = false;
			if ($('#login').find('#clientNr').val() == '') {
				$('#login').find('#clientNr').addClass('error');
				error = true;
				////console.log('nr');
			} else {
				$('#login').find('#clientNr').removeClass('error');
			}
				
			if ($('#login').find('#clientPass').val() == '') {
				$('#login').find('#clientPass').addClass('error');
				error = true;
				////console.log('pass');
			} else {
				$('#login').find('#clientPass').removeClass('error');
			}
			
			if (!error) {
				data.client_nr = $('#clientNr').val();
				data.client_pass = $('#clientPass').val();
				data.fb_id = false;
				
				app.doLogin(data);
			}/* else {
				navigator.notification.vibrate(200);
			}*/
			
		});
		
	},
	
	authFacebook: function() {
		app.curFunction = 'AUTHFB';
		FB.login(
			function(response) {
				////console.log(response);
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
				////console.log(response);
				data.fb_id = response.id;
				data.firstname = response.first_name;
				data.lastname = response.last_name;
				data.sex = response.gender;
				data.birthday = response.birthday;
				data.mail = response.email;
				data.club_id = club_id;
				app.doLogin(data);
			}
		});
		
	},
	
	doLogin: function(data) {
		
		//user = data;
		data.club_id = club_id;
		
		var con = checkConnection();
		if (con == 'No') {
			user = localStorage.getObject('fitUser');
			if (user.club_nr != data.client_nr) {
				$('#clientNr').addClass('error');
		   		$('#clientPass').addClass('error');
		   		//navigator.notification.vibrate(200);
			} else {
				//console.log('LOG IN');
				LEVEL = 1;
				teleportMe('homepage', {});
				app.initLogged();
			}
		} else {
			$.get(app.apiUrl + '?action=userLogin', data, function(result) {
		   		if (result.login == false) {
			   		$('#clientNr').addClass('error');
			   		$('#clientPass').addClass('error');
			   		//navigator.notification.vibrate(200);
		   		} else {
		   			if (result.user_new)
		   				user = data;
		   			else
			   			user = result;
			   		
			   		localStorage.setObject('fitUser', user);
			   		
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
		data = {};
		data.club_id = club_id;
		data.user_id = user.id;
		$.get(app.apiUrl + '?action=getUserDiary', data, function(result) {
			
			db.transaction(function(tx) {
				
				tx.executeSql('DROP TABLE IF EXISTS DIARY');
				tx.executeSql('CREATE TABLE IF NOT EXISTS DIARY (id INTEGER PRIMARY KEY AUTOINCREMENT, day, month, year, package, training_day, length, plan_name, day_name, day_data, type, synced INTEGER)');
			
				$.each(result, function(i, item) {
				
					var statement = "INSERT INTO DIARY (day, month, year, package, training_day, length, plan_name, day_name, day_data, type, synced) VALUES ('" + item.day + "', '" + item.month + "', '" + item.year + "'," + item.package + ", " + item.training_day + ", '" + item.length + "', '" + item.plan_name + "', '" + item.day_name + "', '" + item.day_data + "', '" + item.type + "', 1)";
					//console.log(statement);
					tx.executeSql(statement);
				
			   	});
			}, errorCB, function() {
				//console.log('Inserted all rows');
			});
		}, 'jsonp');
	},
	
	initHome: function() {
		$('body').scrollTop(0);
		if (localStorage.getObject('fitTest')) {
			$('#homepage').find('.fitnesstest').hide();
		}
		if (parseInt(localStorage.getItem('fitNotificationsCount')) > 0) {
			$('#homepage').find('#notificationsCount').html('(' + localStorage.getItem('fitNotificationsCount') + ')');
			$('#homepage').find('.notification').show();
		} else {
			$('#homepage').find('.notification').hide();
		}
		console.log(packs.hasSpecialOffers);
		
		if (curDay = localStorage.getObject('fitCurDay')) {
			if(!trainings.currentDay) {
				db.transaction(function(tx) {
					query = 'SELECT * FROM TRAININGS WHERE id = ' + curDay.plan_id;
					//console.log(query);
					tx.executeSql(query, [], function(tx, results) {
						
						var len = results.rows.length, i;
						for (i = 0; i < len; i++) {
						
							item = results.rows.item(0);
							var exercises = JSON.parse(item.exercises);
							var day_names = JSON.parse(item.day_names);
							var plan = {};
						
							plan.id = item.id;
							plan.name = item.name;
							plan.description = item.description;
							
							plan.exercises = exercises;
							plan.day_names = day_names;
							
							trainings.currentTraining = plan;
							trainings.currentDay = curDay.day;
							
							$('#homepage').find('.continue-existing').show();
							$('#homepage').find('.start-new').hide();
							
						}
					}, function(tx, results) {
						console.error('Error in selecting test result');
					});
					
					
				}, function(error) {
					console.error('Error in selecting test result');
					//console.log(error);
				});
			} else {
				$('#homepage').find('.continue-existing').show();
				$('#homepage').find('.start-new').hide();
			}
			
		} else {
			$('#homepage').find('.continue-existing').hide();
			$('#homepage').find('.start-new').show();
		}
		
		if (user.fb_id) {
			$('.me').find('img').attr('src','https://graph.facebook.com/' + user.fb_id + '/picture?width=91&height=89');
			$('.me').find('h2').html(user.firstname + ' ' + user.lastname);
		} else {
			/*
			* get Local user pic...
			*/
			$('.me').find('img').attr('src','i/thumb.png');
			$('.me').find('h2').html(user.firstname + ' ' + user.lastname);
		}
		
		$('.me').unbind('click');
		$('.me').bind('click', function(e) {
			LEVEL = 1;
			teleportMe('profile');
		});
		
		if(firstLoad) {
			
			timing = 1500;
		} else {
			timing = 100;
		}
			
		
		setTimeout(function() {
			db.transaction(function(tx) {
				query = 'SELECT SUM(length) as total_length, COUNT(*) as total, plan_name FROM DIARY ORDER BY day DESC';
				//console.log(query);
				tx.executeSql(query, [], function(tx, results) {
					diary = results.rows.item(0);
					//console.log(diary);
					$('.treeningud_number').html(diary.total);
					if(diary.total_length)
						$('.treeningud_time').html(secToHour(diary.total_length));
					else
						$('.treeningud_time').html('00:00:00');
					$('.last_update').html(diary.plan_name);
				}, function(tx, results) {
					console.error('Error in selecting test result');
					//console.log(tx);
					//console.log(results);
				});
			}, function(error) {
				console.error('Error in selecting test result');
				//console.log(error);
			});
			
			topH = Number($('#topbar').height());
			bottomH = Number($('#bottombar').height());
			meH = Number($('.me:last').height());
			curH = windowH - topH - bottomH - meH;
			$('.toscroll').height(curH);
			
			console.log(packs.hasSpecialOffers);
			if(packs.hasSpecialOffers) {
				$('#homepage').find('.pakkumised').show();
			} else {
				$('#homepage').find('.pakkumised').hide();
			}
			
		}, timing);
		
			
	},

	
	loadProfile: function() {
		$('#profile').find('h3:first').html('PROFIIL: ' + user.firstname + ' ' + user.lastname);	
	},
	//approx 1hour todo
	initSettings: function() {
		
		/*
		LANGUAGE SELECT
		INSERT CLUB NUMBER
		*/
		
		$('#seaded').find('.club-nr').click(function() {
			
			template = $('#selectiveoverlay').find('.club-template');
			$('#selectiveoverlay').find('.selection-content').html(template.html());
			
			$('.save-button').show();
			$('#selectiveoverlay').find('.club-nr').val(user.club_nr)
			$('#selectiveoverlay').find('.save-button').unbind('click');
			$('#selectiveoverlay').find('.save-button').click(function(e) {
				addHover(this);
				user.club_nr = $('#selectiveoverlay').find('.club-nr').val();
				//user.club_pass = $('#selectiveoverlay').find('.club-pass').val();
				$('#selectiveoverlay').removeClass('scale');
				setTimeout(function () {
					$('#selectiveoverlay').removeClass('scaleIn');
				}, 100);
			});
			$('#selectiveoverlay').addClass('scale');
			setTimeout(function () {
				$('#selectiveoverlay').addClass('scaleIn');
			}, 100);
		});
		
		$('#seaded').find('.show-diary').click(function() {
			if(user.diary == 'public')
				$('#diaryStatus').html('Avalik');
			else
				$('#diaryStatus').html('Privaatne');
			$('#yesnooverlay').find('.nobg_item').click(function(e) {
				addHover(this);
				if($(this).hasClass('yes-answer'))
					user.diary = 'public';
				else
					user.diary = 'private';
				$('#yesnooverlay').removeClass('scale');
				setTimeout(function () {
					$('#yesnooverlay').removeClass('scaleIn');
				}, 100);
			});
			$('#yesnooverlay').addClass('scale');
			setTimeout(function () {
				$('#yesnooverlay').addClass('scaleIn');
			}, 100);
		});
		
		$('#seaded').find('.lang-select').click(function() {
			
			template = $('#selectiveoverlay').find('.lang-template');
			$('#selectiveoverlay').find('.selection-content').html(template.html());
			
			$('.save-button').hide();
			
			$('#selectiveoverlay').find('.selection-content').find('.nobg_item').unbind('click');
			$('#selectiveoverlay').find('.selection-content').find('.nobg_item').click(function(e) {
				
				lang = $(this).data('lang');
				app.translateApp();
				localStorage.setItem('fit_lang', lang);
				$('#selectiveoverlay').removeClass('scale');
				setTimeout(function () {
					$('#selectiveoverlay').removeClass('scaleIn');
				}, 100);
					
			});
			$('#selectiveoverlay').addClass('scale');
			setTimeout(function () {
				$('#selectiveoverlay').addClass('scaleIn');
			}, 100);
		});
		
	},
	
	parseUserDetails: function() {
		//console.log(user);
		if(user.firstname)
			$('#firstname').val(user.firstname).parent().parent().addClass('icon_ok');
		else
			$('#firstname').parent().parent().removeClass('icon_ok');
		if(user.lastname)
			$('#lastname').val(user.lastname).parent().parent().addClass('icon_ok');
		else
			$('#lastname').parent().parent().removeClass('icon_ok');
			
		if(user.mail)
			$('#mail').val(user.mail).parent().parent().addClass('icon_ok');
		else
			$('#mail').parent().parent().removeClass('icon_ok');
			
		if(user.phone)
			$('#phone').val(user.phone).parent().parent().addClass('icon_ok');
		else
			$('#phone').parent().parent().removeClass('icon_ok');
		
		if(user.sex)
			$('#sex').val(user.sex).parent().addClass('icon_ok');
		else
			$('#sex').parent().removeClass('icon_ok');
		
		if(user.birthday)
			$('#birthday').val(user.birthday).parent().parent().addClass('icon_ok');
		else
			$('#birthday').parent().parent().removeClass('icon_ok');
			
		if(user.weight)
			$('#weight').val(user.weight).parent().parent().addClass('icon_ok');
		else
			$('#weight').parent().parent().removeClass('icon_ok');
			
		if(user.length)
			$('#length').val(user.length).parent().parent().addClass('icon_ok');
		else
			$('#length').parent().parent().removeClass('icon_ok');
		
		if(user.training_activity)
			$('#training_activity').val(user.training_activity).parent().addClass('icon_ok');
		else
			$('#training_activity').parent().removeClass('icon_ok');
		
		if(user.training_target)
			$('#training_target').val(user.training_target).parent().addClass('icon_ok');
		else
			$('#training_target').parent().removeClass('icon_ok');
			
		if(user.per_week)
			$('#per_week').val(user.per_week).parent().addClass('icon_ok');
		else
			$('#per_week').parent().removeClass('icon_ok');
			
		if(user.currently_training)
			$('#currently_training').val(user.currently_training).parent().addClass('icon_ok');
		else
			$('#currently_training').parent().removeClass('icon_ok');
			
		if(user.health_condition)
			$('#health_condition').val(user.health_condition).parent().parent().addClass('icon_ok');
		else
			$('#health_condition').parent().parent().removeClass('icon_ok');
		
		$('#saveUserData').click(function() {
			addHover(this);
			user.firstname = $('#firstname').val();
			user.lastname = $('#lastname').val();
			user.mail = $('#mail').val();
			user.phone = $('#phone').val();
			user.sex = $('#sex').val();
			user.age = calcAge($('#birthday').val());
			user.birthday = $('#birthday').val();
			user.weight = $('#weight').val();
			user.length = $('#length').val();
			user.training_activity = $('#training_activity').val();
			user.training_target = $('#training_target').val();
			user.per_week = $('#per_week').val();
			user.currently_training = $('#currently_training').val();
			user.health_condition = $('#health_condition').val();
			user.modified = new Date().getTime();
			localStorage.setObject('fitUser', user);
			
			$('#yesnooverlay').addClass('scale');
			setTimeout(function () {
				$('#yesnooverlay').addClass('scaleIn');
			}, 100);
			$('#yesnooverlay').find('.yesno').unbind('click');
			$('#yesnooverlay').find('.yesno').click(function() {
				addHover(this);
				$('#yesnooverlay').removeClass('scaleIn').removeClass('scale');
			});
			
		});
	},
	
	loadExercisePage: function() {
			
		result = localStorage.getObject('fitCats');
		app.parseCategories(result);
	},
	
	parseCategories: function(result) {
	
		//console.log(app.muscleGroup);
		
		content = $('.module-content');
		content.html('');
		template = $('.module-template');
		template.hide();
		
		if ($('.muscleslist').length > 1) {
			console.log('got one that doesnt belong here..');
			$('.muscleslist:last').parent().remove();
		}
		
		if (app.muscleGroup) {
			setTimeout(function() {
				$('#harjutused').find('h3:first').html(translations[lang]['exercises'] + ' | ' + muscle_groups[app.muscleGroup] + '&nbsp;&nbsp;');
				$('.lihasname').html(muscle_groups[app.muscleGroup]);
				$('#thefilter g').each(function(i, item) {
					if (parseInt($(item).data('muscle')) == parseInt(app.muscleGroup)) {
						if ($(item).attr('class').indexOf("pathOver") === -1) {
							$(item).click();
							$('#harjutused').find('h3:first').html(translations[lang]['exercises'] + ' | ' + muscle_groups[app.muscleGroup] + '&nbsp;&nbsp;');
						}
					}
						
				});
			}, 600);
			
		}
		
		//console.log(result);
   		$.each(result, function(i, item) {
   		
   			//console.log(item);
   			categories[item.cat_id] = item.name;
   			if (lang == 'et')
	   			template.find('h3').html(item.name);
	   		else
	   			template.find('h3').html(item['name_' + lang]);
   			
   			//console.log(app.muscleGroup + '_total');
   			
   			if (app.muscleGroup) {
   				if(item[app.muscleGroup + '_total'])
   					template.find('.bubble').html(item[app.muscleGroup + '_total']);
   				else
   					template.find('.bubble').html('0');
   			} else {
   				template.find('.bubble').html(item.total);
   			}	
   			template.find('img').attr('src', sPath + 'categories/' + item.cat_id + '.jpg');
   			template.find('.harjutus_item').attr('data-cat', item.cat_id);
	   		content.append(template.html());
   		});
   		
   		//app.muscleGroup = 0;
   		
   		$('.harjutus_item').click(function(e) {
		   app.exerciseCat = $(this).data('cat');
		   //console.log(app.exerciseCat);
		   
		   LEVEL = 2;
		   teleportMe('harjutused_subpage1');
		   
	   });
	},
	
	//offline huinja
	
	loadExercises: function() {
		
		data = {};
		data.club_id = club_id;
		var where = '';
		
		if (app.exerciseCat) {
			data.category = app.exerciseCat;
			$('#harjutused_subpage1').find('h3:first').html(categories[app.exerciseCat]).css('font-size', '15px');
			where = ' WHERE category = "' + app.exerciseCat + '"';
		} 
		if (app.muscleGroup) {
			data.muscle_group = app.muscleGroup;
			setTimeout(function() {
				if (app.exerciseCat) {
					$('#harjutused_subpage1').find('h3:first').html(categories[app.exerciseCat] + ' | ' + muscle_groups[app.muscleGroup] + '&nbsp;&nbsp;').css('font-size', '13px');
				} else {
					$('#harjutused_subpage1').find('h3:first').html(muscle_groups[app.muscleGroup] + '&nbsp;&nbsp;').css('font-size', '15px');
				}
				console.log('like what..');
				$('.lihasname').html(muscle_groups[app.muscleGroup]);
			}, 600);
			where = where + ' AND (muscle = "' + app.muscleGroup + '" OR muscle2 = "' + app.muscleGroup + '" OR muscle3 = "' + app.muscleGroup + '")';
		}
		
		items = [];
		
		template = $('.content-template');
		container = $('.content-content');
		container.html('');
		
		db.transaction(function(tx) {
			query = 'SELECT * FROM EXERCISES ' + where + ' ORDER BY id DESC';
			//console.log(query);
			tx.executeSql(query, [], function(tx, results) {
				
				var len = results.rows.length, i;
				for (i = 0; i < len; i++) {
				
					exercise = results.rows.item(i);
					
			   		if (lang == 'et')
			   			template.find('h3').html(exercise.name);
			   		else
			   			template.find('h3').html(exercise['name_' + lang]);
			   		
			   		template.find('img:last').attr('src', sPath + 'exercises/' + exercise.id + '.jpg');
			   		template.find('.harjutus_item').attr('data-id', exercise.id);
			   		
			   		container.append(template.html());
			   		
				}
				$('.harjutus_item').unbind(eventEnd).bind(eventEnd, function (e) {
		   			var id = $(this).data('id');
					LEVEL = 3;
					teleportMe('video', id);
				});
				
			}, function(tx, results) {
				console.error('Error in selecting test result');
				//console.log(tx);
				//console.log(results);
			});
		}, function(error) {
			console.error('Error in selecting test result');
			//console.log(error);
		});

	},

	parseExercise: function(id) {
		//console.log('HERE:');
		var exercise = {};
		db.transaction(function(tx) {
		
			query = 'SELECT * FROM EXERCISES WHERE id = ' + parseInt(id);
			//console.log(query);
			tx.executeSql(query, [], function(tx, results) {
				//console.log(results);
				exercise = results.rows.item(0);
				if (lang == 'et') {
			   		$('#video').find('h3:first').html(exercise.name);
			   		$('#video').find('.text_wrap').html(exercise.description);
			   	} else {
			   		$('#video').find('h3:first').html(exercise['name_' + lang]);
			   		$('#video').find('.text_wrap').html(exercise['name_' + description]);
			   	}
				if (exercise.video && exercise.video != "0") 
					videoLink = sPath + 'videos/' + exercise.id + '.mp4';
				else
					videoLink = app.serverUrl + 'videos/' + exercise.id + '.mp4';
				
				//console.log(sPath);
				
					$('#video').find('.video-container').html('<video id="video" height="41%" width="100%" controls="" preload="" autoplay="" onclick="this.play();" onload="this.play();"><source src="' + videoLink + '"></video>');
				
			}, function(tx, results) {
				console.error('Error in selecting test result');
				//console.log(tx);
				//console.log(results);
			});
		}, function(error) {
			console.error('Error in selecting test result');
			//console.log(error);
		});		
		
	},
	
	initVideosDownload: function() {
		
		template = $('.item-template');
		content1 = $('.items-container1');
		content2 = $('.items-container2');
		downloadedVideos = [];
		db.transaction(function(tx) {
			query = 'SELECT id FROM EXERCISES WHERE video = "1"';
			//console.log(query);
			tx.executeSql(query, [], function(tx, results) {
				var len = results.rows.length, i;
				for (i = 0; i < len; i++) {
					item = results.rows.item(i);
					downloadedVideos.push(parseInt(item.id));
				}
				
				db.transaction(function(tx) {
					query = 'SELECT * FROM TRAININGS ORDER BY id DESC';
					//console.log(query);
					tx.executeSql(query, [], function(tx, results) {
						
						var len = results.rows.length, i;
						for (i = 0; i < len; i++) {
							item = results.rows.item(i);
							var exercises = JSON.parse(item.exercises);
							var dlExercises = 0;
							var exExercises = 0;
							$.each(exercises, function(i, day) {
								$.each(day, function(j, exercise) {
									dlExercises = dlExercises+1;
									if((downloadedVideos.indexOf(parseInt(exercise.id)) > -1)) {
										exExercises = exExercises+1;
									}
								});
							});
							
							template.find('.downloadtitle').html(item.name);
				   			template.find('.downloadcircle').find('span').html(exExercises + '/' + dlExercises);
				   			template.find('img').attr('src', sPath + 'categories/2.jpg');
				   			template.find('.nobg_item').attr('data-id', item.id).attr('data-type', 'package');
				   			if(exExercises == dlExercises)
				   				template.find('.nobg_item').html('<img src="i/icon_ok.png" alt="">').removeClass('arrow');
				   			else if(exExercises == 0 || exExercises == '0') 
				   				template.find('.nobg_item').html('<h4>'+translations[lang]['start_download']+'</h4>').addClass('arrow');
				   			else
				   				template.find('.nobg_item').html('<h4>'+translations[lang]['continue_download']+'</h4>').addClass('arrow');
					   		content1.append(template.html());
							
						}
					}, function(tx, results) {
						console.error('Error in selecting test result');
						//console.log(tx);
						//console.log(results);
					});
				}, function(error) {
					console.error('Error in selecting test result');
					//console.log(error);
				});
		   		
		   		setTimeout(function() {
			   		$('.items-container1, .items-container2').find('.nobg_item').click(function(e) {
			   			if ($(this).find('h4').length) {
			   				app.downloadExerciseVideos($(this).data('type'), $(this).data('id'));
			   				$(this).html('<img src="i/icon_pause.png" alt="">').removeClass('arrow');
			   			} else {
				   			
			   			}
			   		});
		   		}, 800);
				
			}, function(tx, results) {
				console.error('Error in selecting test result');
				//console.log(tx);
				//console.log(results);
			});
		}, function(error) {
			console.error('Error in selecting test result');
			//console.log(error);
		});
		cats = localStorage.getObject('fitCats');
   		$.each(cats, function(i, item) {
   		
   			db.transaction(function(tx) {
				query = 'SELECT COUNT(id) AS total FROM EXERCISES WHERE video="1" AND category = "' + item.cat_id + '"';
				//console.log(query);
				tx.executeSql(query, [], function(tx, results) {
					result = results.rows.item(0);
					template.find('.downloadtitle').html(item.name);
		   			template.find('.downloadcircle').find('span').html(result.total + '/' + item.total);
		   			template.find('img').attr('src', sPath + 'categories/' + item.cat_id + '.jpg');
		   			template.find('.nobg_item').attr('data-id', item.cat_id).attr('data-type', 'category');
		   			if(result.total == item.total)
		   				template.find('.nobg_item').html('<img src="i/icon_ok.png" alt="">').removeClass('arrow');
		   			else if(result.total == 0 || result.total == '0') 
		   				template.find('.nobg_item').html('<h4>'+translations[lang]['start_download']+'</h4>').addClass('arrow');
		   			else
		   				template.find('.nobg_item').html('<h4>'+translations[lang]['continue_download']+'</h4>').addClass('arrow');
			   		content2.append(template.html());
					
				}, function(tx, results) {
					console.error('Error in selecting test result');
					//console.log(tx);
					//console.log(results);
				});
			}, function(error) {
				console.error('Error in selecting test result');
				//console.log(error);
			});
   			
   		});	
   		
   		$('.remove-all').click(function() {
	   		
	   		db.transaction(function(tx) {
				query = 'SELECT id FROM EXERCISES WHERE video="1"';
				//console.log(query);
				tx.executeSql(query, [], function(tx, results) {
					var len = results.rows.length, i;
					
						window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
				       		fileSystem.root.getFile("dummy.html", {create: true, exclusive: false}, 
				       			function gotFileEntry(fileEntry) {
					       			sPath = fileEntry.fullPath.replace("dummy.html","");
					       			
					       			for (i = 0; i < len; i++) {
										item = results.rows.item(i);
										fileSystem.root.getFile(sPath + 'videos/' + item.id + '.mp4', {create: false, exclusive: false}, 									
										function(fileEntry){
											//console.log(fileEntry);
											fileEntry.remove(function(s) {console.log('success');}, function(e) {console.log(e);});
										}, function(error) {
											console.log(error);
										});
										
									}
									
									$('.toscroll').find('.downloadgroup').find('.nobg_item').each(function(j, element) {
									   $(this).html('<h4>'+translations[lang]['start_download']+'</h4>').addClass('arrow');
									   stats_span = $(element).parent().parent().find('.downloadcircle').find('span');
									   var numbers = stats_span.html().split('/');
									   nr1 = parseInt(numbers[0]);
									   stats_span.html('0/'+numbers[1]);
									   template.find('.nobg_item').html('<h4>'+translations[lang]['start_download']+'</h4>').addClass('arrow');
								   	});
								   	db.transaction(function(tx) {
						        		var statement = 'UPDATE EXERCISES SET video = "0"';
						        		tx.executeSql(statement);
						        	});
					       			
					       		}
					       	);
				        });
					
						
					
				}, function(tx, results) {
					console.error('Error in selecting test result');
					//console.log(tx);
					//console.log(results);
				});
			}, function(error) {
				console.error('Error in selecting test result');
				//console.log(error);
			});
	   		
   		});
   		
	},
	//approx 2-3h to finish this shit
	downloadExerciseVideos: function(type, id) {
		//console.log(type+' - ' + id);
		//localStore object with video id-s
		//downloadedVideos = localStorage.getObject('fitExerciseVideos');
		//if(!downloadedVideos)
		//	downloadedVideos = [];
		var _exercises = [];
		if(type == 'package') {
			db.transaction(function(tx) {
				query = 'SELECT * FROM TRAININGS WHERE id = ' + id + '';
				//console.log(query);
				tx.executeSql(query, [], function(tx, results) {
					item = results.rows.item(0);
					var exercises = JSON.parse(item.exercises);
					$.each(exercises, function(i, day) {
						$.each(day, function(j, exercise) {
							//if not downloaded
							_exercises.push(exercise.id);
							
						});
					});
					app.downloadExerciseVideo(_exercises, 'package', id);
				}, function(tx, results) {
					console.error('Error in selecting test result');
					//console.log(tx);
					//console.log(results);
				});
			}, function(error) {
				console.error('Error in selecting test result');
				//console.log(error);
			});
		} else {
			
			db.transaction(function(tx) {
				query = 'SELECT id FROM EXERCISES WHERE category = "' + id + '"';
				//console.log(query);
				tx.executeSql(query, [], function(tx, results) {
					var len = results.rows.length, i;
					for (i = 0; i < len; i++) {
						exercise = results.rows.item(i);
						_exercises.push(exercise.id);
					}
					app.downloadExerciseVideo(_exercises, 'category', id);
				}, function(tx, results) {
					console.error('Error in selecting test result');
					//console.log(tx);
					//console.log(results);
				});
			}, function(error) {
				console.error('Error in selecting test result');
				//console.log(error);
			});
			
		}
			
	},
	downloadExerciseVideo: function(exercises, type, id) {
	
		if(deviceMode) {
		
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
		        fileSystem.root.getFile(
		        "dummy.html", {create: true, exclusive: false}, 
		        function gotFileEntry(fileEntry) {
		            sPath = fileEntry.fullPath.replace("dummy.html","");
		            var fileTransfer = new FileTransfer();
		            fileEntry.remove();
		            $.each(exercises, function(i, exercise) {
		            	var uri = encodeURI(app.serverUrl + 'videos/' + exercise + '.mp4');
			            fileTransfer.download(
			                uri,
			                sPath + 'videos/' + exercise + '.mp4',
			                function(theFile) {
			                    console.log("download complete: " + theFile.toURL());
			                    db.transaction(function(tx) {
						        	var statement = 'UPDATE EXERCISES SET video = "1" WHERE id = ' + exercise;
								   	tx.executeSql(statement);
								   	//downloadedVideos.push(exercise.id);
									$('.toscroll').find('.downloadgroup').find('.nobg_item').each(function(j, element) {
														   	
									   if($(element).data('id') == id && $(element).data('type') == type) {
										   
										   stats_span = $(element).parent().parent().find('.downloadcircle').find('span');
										   var numbers = stats_span.html().split('/');
										   nr1 = parseInt(numbers[0]);
										   stats_span.html((nr1+1)+'/'+numbers[1]);
										   
										   if((nr1+1) == parseInt(numbers[1])) {
											   $(element).html('<img src="i/icon_ok.png" alt="">');
										   }
									   }	
								   	});
								}, function(error) {
									console.error('Error in selecting test result');
									//console.log(error);
								});
			                },
			                function(error) {
			                    //console.log("download error source " + error.source);
			                    //console.log("download error target " + error.target);
			                    //console.log("upload error code: " + error.code);
			                }
			            );
			        });
		        }, function(e) {
				    //console.log(e);
			    });
		    }, function(e) {
			    //console.log(e);
		    });
		} else {
			$.each(exercises, function(i, exercise) {
		            	
                console.log("download fake complete: " + exercise);
                db.transaction(function(tx) {
		        	var statement = 'UPDATE EXERCISES SET video = "1" WHERE id = ' + exercise;
				   	tx.executeSql(statement);
				   	//downloadedVideos.push(exercise.id);
					$('.toscroll').find('.downloadgroup').find('.nobg_item').each(function(j, element) {
										   	
					   if($(element).data('id') == id && $(element).data('type') == type) {
						   
						   stats_span = $(element).parent().parent().find('.downloadcircle').find('span');
						   var numbers = stats_span.html().split('/');
						   nr1 = parseInt(numbers[0]);
						   stats_span.html((nr1+1)+'/'+numbers[1]);
						   
						   if((nr1+1) == parseInt(numbers[1])) {
							   $(element).html('<img src="i/icon_ok.png" alt="">');
						   }
					   }	
				   	});
				}, function(error) {
					console.error('Error in selecting test result');
					//console.log(error);
				});
			});
		}
	},
	//approx 2-3h to finish this shit
	downloadPics: function(module, pics) {
		//console.log(module);
		//console.log(pics);
		
		//download sources: categories, exercises
		//no checkmarks all those lil filthy pics must be on the phone!!!
		
		if(deviceMode) {
			extension = 'jpg';
			
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
		        fileSystem.root.getFile(
		        "dummy.html", {create: true, exclusive: false}, 
		        function gotFileEntry(fileEntry) {
		            sPath = fileEntry.fullPath.replace("dummy.html","");
		            var fileTransfer = new FileTransfer();
		            fileEntry.remove();
		            $.each(pics, function(i, pic) {
			            var uri = encodeURI(app.serverUrl + 'pics/' + module + '/' + pic + '.jpg');
			            fileTransfer.download(
			                uri,
			                sPath + module + '/' + pic + '.jpg',
			                function(theFile) {
			                    console.log("download complete: " + theFile.toURL());
			                    //showLink(theFile.toURL());
			                },
			                function(error) {
			                    console.log("download error source " + error.source);
			                    console.log("download error target " + error.target);
			                    console.log("upload error code: " + error.code);
			                }
			            );
		            });
		        }, function(e) {
				    //console.log(e);
			    });
		    }, function(e) {
			    //console.log(e);
		    });
			
			localStorage.setItem('sPath', sPath);
		} else {
			//console.log('have to be on device :(');
		}
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
			$.get(app.apiUrl + '?action=getTemplates', data, function(result) {
			//$.get(app.apiUrl + '?action=getTrainers', data, function(result) {
		   		$.each(result, function(i, item) {
		   		
		   			items[item.id] = item;
			   		new_name = shorten(item.name, 40);
			   		template1.find('.name').html(new_name);
			   		template1.find('.price').html(item.price + ' €');
			   		template1.find('img:last').attr('src', app.serverUrl + 'pics/templates/' + item.id + '.jpg');
			   		template1.find('.selectbtn').attr('data-id', item.id);
			   		
			   		container1.append(template1.html());
			   		
		   		});
		   		
		   		$('.selectbtn').unbind(eventEnd).bind(eventEnd, function (e) {
					addHover(this);
		   			var id = $(this).data('id');
		   			////console.log('id');
		   			app.packageTemplate = id;
					LEVEL = 2;
					teleportMe('vali_kava');
				});
			}, 'jsonp');
			
		} else if(step == 2) {
			
			template2 = $('.content-template-vali-kava');
			container2 = $('.content-content-vali-kava');
			container2.html('');
			
			var template = items[app.packageTemplate];
			//console.log(items);
			//console.log(app.packageTemplate);
			//console.log(template);
			
			items = [];
			
			data.template_id = app.packageTemplate;
			//console.log(template);
			//console.log(data);
			$('.treener').find('img').attr('src', app.serverUrl + 'pics/templates/' + template.id + '.jpg');
			$('.treener').find('h2').html(template.name);
			
			$('#templateIntro').unbind(eventEnd).bind(eventEnd, function (e) {
			   	e.preventDefault();
		   		$('#voucher').hide();
		   		$('#overlay').find('.buybtn').hide();
		   		
				
				addHover( this );
				//console.log('whaaaat');
				$('#overlay').find('img:first').attr('src', app.serverUrl + 'pics/templates/' + template.id + '.jpg');
				$('#overlay').find('h1').html(template.name).css('font-size', '13px');
				$('#overlay').find('h2').html(template.price + '€');
				$('#overlay').find('h4').html('');
				$('#overlay').find('p').html(template.description);
				/*
				template2.find('.name').html(item.name);
			   		template2.find('.price').html(item.price + ' €');
			   		template2.find('img:last').attr('src', app.serverUrl + 'pics/trainers/' + item.id + '.jpg');
			   		template2.find('.selectbtn').attr('data-id', item.id);
				*/
				
				
				$('#overlay').addClass('scale');
				setTimeout(function () {
					$('#overlay').addClass('scaleIn');
				}, 100);
			});
			
			var here = $('#buyoverlay .checkout');
			
			here.html('');
			var html = '';
			var totalprice = 0;
			
			html += '<div class="inbasket"><div class="naming">'+ template.name +'</div><div class="pricing">'+ template.price +' €</div><div class="clear"></div></div>';
			
			html += '<div class="intotal"><div class="naming">'+translations[lang]['sum']+':</div><div class="pricing">'+ template.price +'  €</div><div class="clear"></div></div>';
			
			here.append(html);
			
			$.get(app.apiUrl + '?action=getTrainers', data, function(result) {
			//$.get(app.apiUrl + '?action=getTemplates', data, function(result) {
				
				var trainer_id = 0;
				
		   		$.each(result, function(i, item) {
		   			
		   			items[item.id] = item;
			   		
			   		template2.find('h4').html(item.realname);
			   		template2.find('h5').html(item.category);
			   		template2.find('img:last').attr('src', app.serverUrl + 'pics/trainers/' + item.id + '.jpg');
			   		template2.find('.selectbtn1').attr('data-id', item.id);
			   		template2.find('a').attr('data-id', item.id);
			   		
			   		container2.append(template2.html());
			   		
		   		});
		   		
		   		$('.choosebtn').parent().unbind(eventEnd).bind(eventEnd, function (e) {
			   		
			   		$('#voucher').hide();
			   		$('#overlay').find('.buybtn').show();	
			   		
		   			trainer_id = $(this).data('id');
		   			
					addHover(this);
					
					$('#overlay').find('img:first').attr('src', app.serverUrl + 'pics/trainers/' + trainer_id + '.jpg');
					$('#overlay').find('h1').html(items[trainer_id].realname);
					$('#overlay').find('h2').html(items[trainer_id].category);
					$('#overlay').find('h4').html('');
					$('#overlay').find('p').html(items[trainer_id].description);
					
					$('#overlay').addClass('scale');
					setTimeout(function () {
						$('#overlay').addClass('scaleIn');
					}, 100);
					
					$('.buybtn').addClass('slideIn');
					
				});
			
				$('.buybtn').unbind(eventEnd).bind(eventEnd, function (e) {
					//e.preventDefault();
					addHover(this);
					app.parseUserDetails();
					$('#minuandmed').addClass('scale');
					setTimeout(function () {
						$('#minuandmed').addClass('scaleIn').css('height', wind + 'px');
					}, 500);
					
					$('#overlay').removeClass('scale');
					setTimeout(function () {
						$('#overlay').removeClass('scaleIn');
					}, 100);
			
				});
				$('.orderbtn').unbind(eventEnd).bind(eventEnd, function (e) {
					error = false;
					if (!$('#firstname').val()) {
						error = true;
						$('#firstname').parent().parent().removeClass('icon_ok').addClass('icon_edit2');
					} else {
						$('#firstname').parent().parent().removeClass('icon_edit2').addClass('icon_ok');
					}
					if (!$('#lastname').val()) {
						error = true;
						$('#lastname').parent().parent().removeClass('icon_ok').addClass('icon_edit2');
					} else {
						$('#lastname').parent().parent().removeClass('icon_edit2').addClass('icon_ok');
					}
					if (!$('#mail').val()) {
						error = true;
						$('#mail').parent().parent().removeClass('icon_ok').addClass('icon_edit2');
					} else {
						$('#mail').parent().parent().removeClass('icon_edit2').addClass('icon_ok');
					}
					if (!$('#phone').val()) {
						error = true;
						$('#phone').parent().parent().removeClass('icon_ok').addClass('icon_edit2');
					} else {
						$('#phone').parent().parent().removeClass('icon_edit2').addClass('icon_ok');
					}
					if (!$('#sex').val()) {
						error = true;
						$('#sex').parent().parent().removeClass('icon_ok').addClass('icon_edit2');
					} else {
						$('#sex').parent().parent().removeClass('icon_edit2').addClass('icon_ok');
					}
					if (!$('#birthday').val()) {
						error = true;
						$('#birthday').parent().parent().removeClass('icon_ok').addClass('icon_edit2');
					} else {
						$('#birthday').parent().parent().removeClass('icon_edit2').addClass('icon_ok');
					}
					if (!$('#weight').val()) {
						error = true;
						$('#weight').parent().parent().removeClass('icon_ok').addClass('icon_edit2');
					} else {
						$('#weight').parent().parent().removeClass('icon_edit2').addClass('icon_ok');
					}
					if (!$('#length').val()) {
						error = true;
						$('#length').parent().parent().removeClass('icon_ok').addClass('icon_edit2');
					} else {
						$('#length').parent().parent().removeClass('icon_edit2').addClass('icon_ok');
					}
					if (!$('#training_activity').val()) {
						error = true;
						$('#training_activity').parent().removeClass('icon_ok').addClass('icon_edit2');
					} else {
						$('#training_activity').parent().removeClass('icon_edit2').addClass('icon_ok');
					}
					if (!$('#training_target').val()) {
						error = true;
						$('#training_target').parent().removeClass('icon_ok').addClass('icon_edit2');
					} else {
						$('#training_target').parent().removeClass('icon_edit2').addClass('icon_ok');
					}
					if (!$('#per_week').val()) {
						error = true;
						$('#per_week').parent().removeClass('icon_ok').addClass('icon_edit2');
					} else {
						$('#per_week').parent().removeClass('icon_edit2').addClass('icon_ok');
					}
					if(error) {
						$('input:first').focus();
						return false;
					}
					/*if(!user.club_nr) {
						$('#askClubNr').find('.save-button').unbind('click');
						$('#askClubNr').find('.save-button, .cancel-button').click(function(e) {
							addHover(this);
							if($('#askClubNr').find('.club-nr').val() && $(this).hasClass('save-button')) {
								user.club_nr = $('#askClubNr').find('.club-nr').val();
								$('#askClubNr').removeClass('scale');
								setTimeout(function () {
									$('#askClubNr').removeClass('scaleIn');
								}, 100);
							} else if(!$('#askClubNr').find('.club-nr').val() && $(this).hasClass('save-button')) {
								$('#askClubNr').find('.club-nr').addClass('error');
							} else {
								$('#askClubNr').removeClass('scale');
								setTimeout(function () {
									$('#askClubNr').removeClass('scaleIn');
								}, 100);
							}
							
							
						});
						$('#askClubNr').addClass('scale');
						setTimeout(function () {
							$('#askClubNr').addClass('scaleIn');
						}, 100);
					} */
					if (parseInt(template.personal_trainings) > 0) {
						$('#askMeeting').find('.date').unbind('click');
						$('#askMeeting').find('.date').click(function(e) {
							addHover(this);
							app.packageMeeting = $(this).data('date');
							$('#askMeeting').removeClass('scale');
							setTimeout(function () {
								$('#askMeeting').removeClass('scaleIn');
							}, 100);
						});
						$('#askMeeting').addClass('scale');
						setTimeout(function () {
							$('#askMeeting').addClass('scaleIn');
						}, 100);
					} else {
						app.packageMeeting = '';
					}
					addHover(this);
					user.firstname = $('#firstname').val();
					user.lastname = $('#lastname').val();
					user.mail = $('#mail').val();
					user.phone = $('#phone').val();
					user.sex = $('#sex').val();
					user.birthday = $('#birthday').val();
					user.age = calcAge($('#birthday').val());
					user.weight = $('#weight').val();
					user.length = $('#length').val();
					user.training_activity = $('#training_activity').val();
					user.training_target = $('#training_target').val();
					user.per_week = $('#per_week').val();
					user.currently_training = $('#currently_training').val();
					user.health_condition = $('#health_condition').val();
					user.modified = new Date().getTime();
					
					
					
					localStorage.setObject('fitUser', user);
					
					$('#minuandmed').removeClass('scale');
					setTimeout(function () {
						$('#minuandmed').removeClass('scaleIn');
					}, 100);
					
					$('#buyoverlay').find('.checkoutcontent').hide();
					$('#buyoverlay').find('.checkout-form').show();
					$('#buyoverlay').find('.checkout').show();
					$('#buyoverlay').find('.backbtn').show();
					
					$('#buyoverlay').addClass('prepare').addClass('scale');
					setTimeout(function () {
						$('#buyoverlay').addClass('scaleIn');
						//$('.alternatiivbtn').html('').click();
						$('.alternatiivbtn').addClass('active');
						$('.popup').removeClass('pophide');
						$('.popup').addClass('popshow');
					}, 500);
					$('.bank-link').unbind('click');
					$('.bank-link').click(function(e) {
						e.preventDefault();
						addHover(this);
						app.createOrder($(this).data('bank'), trainer_id);
					});
					
		   		});
			}, 'jsonp');
			
		}	
		
	},
	
	createOrder: function(type, trainer) {
	
		data = {};
		
		data.type = type;
		data.user = user.id;
		data.item = app.packageTemplate;
		data.trainer = trainer;
		data.lang = lang;
		data.club_id = club_id;
		data.first_meeting = app.packageMeeting;
		
		$.get(app.apiUrl + '?action=createOrder', data, function(result) {
			
			var order_id = result.id;
			
			if (type != 'bill') {
			
				iabRef = window.open('http://fitnessmobile.ee/payment.php?order=' + order_id + '&bank=' + type, '_blank', 'location=yes');
				iabRef.addEventListener('loadstart', function() {
					//console.log('started');
					//if()
				});
				iabRef.addEventListener('loadstop', function(event) {
				
					//console.log(event.url);
					if(event.url == 'http://fitnessmobile.ee/payment.php?order=' + order_id + '&bank=' + type + '&success=1') {
						iabRef.close();
						
						$('#buyoverlay').find('.checkoutcontent').hide();
						$('#buyoverlay').find('.checkout').hide();
						$('#buyoverlay').find('.checkout-banklink-success').show();
						$('#buyoverlay').find('.backbtn').hide();
					}
					
					if(event.url == 'http://fitnessmobile.ee/payment.php?order=' + order_id + '&bank=' + type + '&error=1') {
						iabRef.close();
						
						$('#buyoverlay').find('.checkoutcontent').hide();
						$('#buyoverlay').find('.checkout').hide();
						$('#buyoverlay').find('.checkout-banklink-error').show();
						$('#buyoverlay').find('.backbtn').hide();
						$('#buyoverlay').find('.ok-error').unbind('click');
						$('#buyoverlay').find('.ok-error').click(function(e) {
							$('#buyoverlay').find('.checkoutcontent').hide();
							$('#buyoverlay').find('.checkout-form').show();
							$('#buyoverlay').find('.checkout').show();
							$('#buyoverlay').find('.backbtn').show();
						});
					}
				
					//console.log('stoped');
				});
				iabRef.addEventListener('exit', function() {
					//console.log('closed');
				});
			
			} else {
				$('#buyoverlay').find('.checkoutcontent').hide();
				$('#buyoverlay').find('.checkout').hide();
				$('#buyoverlay').find('.checkout-bill').show();
				$('#buyoverlay').find('.backbtn').hide();
			}
		
		}, 'jsonp');
		
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
		data.trainer = isTrainer;
		
		$.get(app.apiUrl + '?action=getFitshop', data, function(result) {
		
			if (result.trainer) {
				$('.treener').find('img').attr('src', app.serverUrl + 'pics/trainers/' + result.trainer.id + '.jpg');
				$('.treener').find('h2').html(result.trainer.realname);
			}
		
	   		$.each(result.items, function(i, item) {
	   			if(item.name) {
		   			items[item.id] = item;
			   		
			   		template.find('h4:first').html(item.name);
			   		template.find('h5:last').html(item.price + ' €');
			   		template.find('img:last').attr('src', app.serverUrl + 'pics/fitshop/' + item.id + '.jpg');
			   		template.find('.box33').attr('data-id', item.id);
			   		
			   		container.append(template.html());
		   		}
	   		});
	   		//console.log(result);
	   		
	   		$('.detailsbtn').unbind(eventEnd).bind(eventEnd, function (e) {
	   		
	   			var id = $(this).data('id');
	   			//console.log(items[id]);
				//e.preventDefault();
				addHover( this );
				$('#voucher').show();
				$('#overlay').find('img:first').attr('src', app.serverUrl + 'pics/fitshop/' + id + '.jpg');
				new_name = shorten(items[id].name, 40);
				$('#overlay').find('h1').html(new_name);
				$('#overlay').find('h2').html(items[id].price + ' €');
				if(items[id].sale && items[id].sale != '0')
					$('#overlay').find('#voucher').find('span').html(items[id].sale + '%');
				else
					$('#overlay').find('#voucher').hide();	
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
		
		if(user.birthday) {
			dates = user.birthday.split('-');
		} else {
			dates = [1980, '06', '15'];
		}
		
		for(i=1;i<32;i++) {
			if(i < 10) day = '0' + i; else day = i;
			$('#daySelect').append('<option value="' + day + '"' + (dates[2] == i ? ' selected="selected"' : '') + '>' + i + '</option>')
		}
		for(i=1;i<13;i++) {
			if(i < 10) month = '0' + i; else month = i;
			$('#monthSelect').append('<option value="' + month + '"' + (dates[1] == i ? ' selected="selected"' : '') + '>' + i + '</option>')
		}
		for(i=1930;i<2000;i++) {
			$('#yearSelect').append('<option value="' + i + '"' + (dates[0] == i ? ' selected="selected"' : '') + '>' + i + '</option>')
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
		var testResults = {};
		
		var TOTALRESULT = 0;
		
		testResults = localStorage.getObject('fitTest');

		if(!testResults)
			var testResults = {};
			
		totalResults = [];
		
		$('.nobg_item.tiny').click(function(e) {
			$('.nobg_item.tiny').addClass('grey');
			$(this).removeClass('grey');
			selectedExercise = $(this).data('type');
		});
		
		$('.save-results').click(function(e) {
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
			if(!$(this).hasClass('grey')) {
				localStorage.setObject('fitTest', testResults);
				
				db.transaction(function(tx) {
		
					var d = new Date();
					var curr_date = d.getDate();
					if(curr_date < 10)
						curr_date = '0' + curr_date;
				    var curr_month = d.getMonth() + 1; //Months are zero based
				    if(curr_month < 10)
						curr_month = '0' + curr_month;
				    var curr_year = d.getFullYear();
					// get from diary where day is today, plan day is right one and so on
					query = 'SELECT * FROM DIARY WHERE day = "' + curr_year + '-' + curr_month + '-' + curr_date +'" AND type = "test"';
					//console.log(query);
					tx.executeSql(query, [], function(tx, results) {
						
						var len = results.rows.length, i;
						if (!len) {
							// then its first time and generate day data..curDay
							db.transaction(function(tx) {
								var statement = "INSERT INTO DIARY (day, month, year, package, training_day, length, plan_name, day_name, day_data, type, synced) VALUES ('" + curr_year + "-" + curr_month + "-" + curr_date + "', '" + curr_month + "', '" + curr_year + "',0, 0, 0, 'Fitness test', '" + TOTALRESULT + "/100', '" + JSON.stringify(testResults) + "', 'test', 0)";
								//console.log(statement);
							   	tx.executeSql(statement);
						   	}, function(error) {
								console.error('Error in inserting item to diary');
								//console.log(error);
							});
						} else {
							
							db.transaction(function(tx) {
								var statement = "UPDATE DIARY SET day_data = '" + JSON.stringify(testResults) + "', synced = 0 WHERE day = '" + curr_year + "-" + curr_month + "-" + curr_date + "' AND type = 'test'";
								////console.log(statement);
							   	tx.executeSql(statement);
						   	}, function(error) {
								console.error('Error in selecting test result');
								//console.log(error);
							});
						}
						LEVEL = 1;
						teleportMe('homepage');
				
					}, function(tx, results) {
						console.error('Error in selecting test result');
						//console.log(tx);
						//console.log(results);
					});
				}, function(error) {
					console.error('Error in selecting test result');
					//console.log(error);
				});
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
				var originalR = r;
				var repeater = 1;
				if(n == '5' || n == 5) {
					var repeater = 1;
					if (selectedExercise == 'bicycle') {
						repeater = 2.5;
					} else if (selectedExercise == 'boat') {
						repeater = 1.2;
					}
					testResults['extra'] = selectedExercise;
					//r = repeater*r
				}
				//console.log(repeater);
				
				if(r && r < 10000 && r > -100){
					
					var grade = 1;
					
					showLoading();
					
					db.transaction(function(tx) {
						if (exercise == 'flexing') 
							query = 'SELECT grade, min_score, max_score FROM TEST WHERE exercise = "' + exercise + '" AND sex = "' + user.sex + '"';
						else
							query = 'SELECT grade, min_score, max_score FROM TEST WHERE exercise = "' + exercise + '" AND sex = "' + user.sex + '" AND min_age <= "' + user.age + '" AND max_age >= "' + user.age + '"';
							
						tx.executeSql(query, [], function(tx, results) {
							var len = results.rows.length, i;
							for (i = 0; i < len; i++) {
							
								item = results.rows.item(i);
								
								if(exercise == 'flexing') {
									//$('.carusel-texts').addClass('small-font');
									extra = 'cm';
									separator = '..';
								} else if (exercise == 'aero') {
									$('.carusel-texts').addClass('small-font');
									extra = '';
									separator = '-';
								} else {
									$('.carusel-texts').removeClass('small-font');
									extra = '';
									separator = '-';
								}
								var min_score = parseInt(repeater * parseInt(item.min_score));
								var max_score = parseInt(repeater * parseInt(item.max_score));
								//console.log(min_score + ' ja ' + max_score);
								
								if (min_score == '0' && max_score == '0') {
									$('.grade-' + item.grade).html('0');
								} else if(min_score == '0' || min_score <= '-1000') {
									$('.grade-' + item.grade).html('<' + max_score);
								} else if(max_score >= '10000' || max_score == '0') {
									$('.grade-' + item.grade).html('>' + min_score);
								} else {
									$('.grade-' + item.grade).html(min_score + separator + max_score);
								}
								
								if (min_score <= r && max_score >= r) {
									if (min_score == '0' && max_score == '0') {
										$('.result-text').html('0'+extra);
									} else if(min_score == '0' || min_score == '-1000') {
										$('.result-text').html('<' + max_score+extra);
									} else if(max_score == '10000' || max_score == '0') {
										$('.result-text').html('>' + min_score+extra);
									} else {
										$('.result-text').html(min_score + separator + max_score+extra);
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
							
							if(!testResults[n])
								testResults[n] = [];
							
							testResults[n] = {
								points: r,
								score: score
							};
							
							totalResults[n] = score;
							
							if (grade == 7) {
								anim = '7';
								tulemus = translations[lang]['result_7'];
							} else if(grade == 6) {
								anim = '6';
								tulemus = translations[lang]['result_6'];
							} else if(grade == 5) {
								anim = '5';
								tulemus = translations[lang]['result_5'];
							} else if(grade == 4) {
								anim = '4';
								tulemus = translations[lang]['result_4'];
							} else if(grade == 3) {
								anim = '3';
								tulemus = translations[lang]['result_3'];
							} else if(grade == 2) {
								anim = '2';
								tulemus = translations[lang]['result_2'];
							} else if(grade == 1) {
								anim = '1';
								tulemus = translations[lang]['result_1'];
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
								$('body').scrollTop(top);
							}
							
							addHover( this );
							
						}, function(tx, results) {
							console.error('Error in selecting test result');
						});
					}, function(error) {
						console.error('Error in selecting test result');
					});
					
					$('.overlay .jargminetest').unbind(eventEnd).bind(eventEnd, function(e) {
						e.preventDefault();
						
						var next = $(this).attr('data-test');
						var top = 0;
						for(i=0;i<next;i++) {
							top = top + Number($('#test' + (i+1) ).height()) + 7;	
						}
						
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
						TOTALRESULT = 0;
						$.each(totalResults, function(i, result) {
							if(result) {
								TOTALRESULT = TOTALRESULT + parseInt(result);
							}
						});
						
						$('#caruselTOTALoverlay .finalresults h1').text(TOTALRESULT + ' p');
										
						$('#caruselTOTALoverlay').addClass('scale');
						setTimeout(function () {
							$('#caruselTOTALoverlay').addClass('scaleIn');
						}, 100);
						
						addHover( this );
					});
					/*
					$('.overlay .sulge').unbind(eventEnd).bind(eventEnd, function(e) {
						
					});
					*/
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
    if(value && value != 'undefined')
    	return value && JSON.parse(value);
    else
    	return false;
}

function isOdd(num) { return num % 2;}

function deliverError(msg, url, line) {
	console.log(msg);
	console.log(url);
	console.log(line);
	if (window.device.platform != 'Generic') {
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
	   
	   	$.get(app.apiUrl + '?action=reportAnError', error_data, function(result) {}, 'jsonp');
	}
	console.log('ERROR: ' +msg + ' ja ' + url + ' ja ' + line);
}

/*window.onerror = function (msg, url, line) {
	deliverError(msg, url, line);
}*/

function errorCB(e, a, b) {
	deliverError('Error in DB: ' + e, 'app.js', 800);
	//alert('Error in DB: ' + e);
	console.error(e);
	console.error(a);
	console.error(b);
}

function checkConnection() {
	if(navigator.network) {
		var networkState = navigator.connection.type;
	
	    var states = {};
	    states[Connection.UNKNOWN]  = 'Unknown';
	    states[Connection.ETHERNET] = 'Ethernet';
	    states[Connection.WIFI]     = 'WiFi';
	    states[Connection.CELL_2G]  = '2G';
	    states[Connection.CELL_3G]  = '3G';
	    states[Connection.CELL_4G]  = '4G';
	    states[Connection.NONE]     = 'No';
    } else {
	    if(navigator.onLine) {
		    return 'WiFi';
	    } else {
		    return 'No';
	    }
    }
    //console.log(states[networkState]);
    
    return states[networkState];
}
function calcAge(dateString) {
  var birthday = +new Date(dateString);
  return ~~((Date.now() - birthday) / (31557600000));
}
function shorten(text, maxLength) {
    var ret = text;
    if (ret.length > maxLength) {
        ret = ret.substr(0,maxLength-3) + "...";
    }
    return ret;
}