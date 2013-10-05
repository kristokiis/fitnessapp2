var currentTime = false;
var pausedTime = {};
var mainTimer = {};
var timer = {};
var pauseTimer = false;
//finish this file on friday
var packs = {
	hasSpecialOffers: false,
	
	getMain: function() {
		$('.training-count').html(trainings.orderPackages.length);
		$('.nutrition-count').html(nutritions.orderNutritions.length);
		$('#ostetud').find('.bought-trainings').click(function() {
			if (trainings.orderPackages.length > 0) {
				LEVEL = 3;
				teleportMe('personaalsed_treeningkavad');
			} else {
				LEVEL = 3;
				teleportMe('treening_naidiskavad', 'order');
			}
		});
		$('#ostetud').find('.bought-nutritions').click(function() {
			if (nutritions.orderNutritions.length > 0) {
				LEVEL = 3;
				teleportMe('personaalsed_toitumiskavad');
			} else {
				LEVEL = 3;
				teleportMe('naidiskavad', 'order');
			}
		});
	},
	
	getDiary: function() {
	
		template = $('.diary-template');
		content = $('.diary-content');
		
		db.transaction(function(tx) {
			query = 'SELECT * FROM DIARY ORDER BY day DESC, id DESC';
			//console.log(query);
			tx.executeSql(query, [], function(tx, results) {
				timesCounter = 0;
				month = false;
				var len = results.rows.length, i;
				content.html('');
				testResults = localStorage.getObject('fitTest');
				
				if (len && len > 0) {
				
					for (i = 0; i < len; i++) {
						day = results.rows.item(i);
						
						if (!month) {
							month = parseInt(day.month);
							timesCounter = 1;
						} 
						
						if(month != parseInt(day.month)) {
							
							template.find('.followMeBar').html(translations[lang]['month_' + parseInt(month)] + ' ' + day.year + ' (' + (timesCounter-1) + ' treening korda)');
							//console.log('wut');
							//console.log(template.html());
							content.append(template.html());
							month = parseInt(day.month);
							template.find('.trainings-content').html('');
							timesCounter = 1;
						} else {
							timesCounter = timesCounter + 1;
						}
						
						if(day.type == 'exercise') {
							template.find('.trainings-content').append('<div class="treening" data-id="' + day.id + '"><div class="arrow"><div>'+translations[lang]['date']+': <span class="date">' + day.day + '</span></div><div>'+translations[lang]['pack']+': <span class="kava">' + day.plan_name + '</span></div><div>'+translations[lang]['trainingday']+': <span class="paev">' + day.day_name + '</span></div><div>'+translations[lang]['training_length']+': <span class="length">' + secToHour(day.length) + '</span></div></div></div>');
						} else {
							template.find('.trainings-content').append('<div class="treening" data-id="' + day.id + '"><div class="arrow"><div>'+translations[lang]['date']+': <span class="date">' + day.day + '</span></div><div>'+translations[lang]['pack']+': <span class="kava">'+translations[lang]['fitness_test']+'</span></div><div>'+translations[lang]['score']+': <span class="paev">' + day.day_name + '</span></div></div></div>');
						}
						
						
						if((i+1) == len) {
							template.find('.followMeBar').html(translations[lang]['month_' + parseInt(month)] + ' ' + day.year + ' (' + timesCounter + ' treening korda)');
							//console.log('wut');
							//console.log(template.html());
							content.append(template.html());
							template.find('.trainings-content').html('');
							timesCounter = 1;
						}
						
					}
					
						
					//content.html(template.html());
					setTimeout(function() {
					
						var diaryscroll = jQuery('#diaryscroll').length;
						if(diaryscroll){
							setTimeout(function(){
								$('#diaryscroll .diary-content').append('<section class="pseudomonth" style="height: ' + bbar + 'px"></section>');
								var scroll = new iScroll('diaryscroll');
								scroll.enableStickyHeaders('h4');
							}, 0);
						}
						/*
						var diaryscroll = $('#diaryscroll').length;
						if(diaryscroll){
							var scroll = new iScroll('diaryscroll');
							scroll.enableStickyHeaders('h4');
						}
						*/
						
						$('.treening').unbind('click');
						$('.treening').click(function(e) {
							//console.log('click');
							e.preventDefault();
							LEVEL = 2;
							teleportMe('diary_detail', $(this).data('id'));
						});
						
					}, 1500);
					
					
				
				} else {
					$('.diary-content').html('<section class="month"><h4>'+translations[lang]['no_trainings']+'</h4></section>');
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
	getDiaryDetail: function(id) {
		
		template = $('.diary-template');
		content = $('.diary-content');
		
		setTimeout(function() {
			//console.log($('#diary_detail'));
			if($('#diary_detail').length > 1)
				$('.open:last').remove();
		}, 500);
		
		db.transaction(function(tx) {
		
			query = 'SELECT * FROM DIARY WHERE id = ' + parseInt(id);
			//console.log(query);
			tx.executeSql(query, [], function(tx, results) {
			
				day = results.rows.item(0);
				
				var day_data = JSON.parse(day.day_data);
				//console.log(day_data);
				if(day.type == 'test') {
					$('#diary_detail').find('.date').html(day.day);
					$('#diary_detail').find('.kava').html('Fitness test');
					$('#diary_detail').find('.paev').parent().html(translations[lang]['score'] + ': <span class="paev">' + day.day_name + '</span>');
					$('#diary_detail').find('.length').parent().hide();
					$('.exercise-template').find('.info-content').html('');
					$.each(day_data, function(test, scores) {
						if(parseInt(test)) {
							if(test == 4) {
								ext = 'cm';
								test = translations[lang]['test_' + test];
							} else if(test == 5) {
								ext = 'm';
								test = translations[lang]['test_' + test] + '(' + translations[lang][day_data.extra] + ')';
							} else {
								ext = 'tk';
								test = translations[lang]['test_' + test];
							}
							
							$('.exercise-template').find('.info-content').append('<p>' + test + ': ' + scores.score + 'p (' + scores.points + ext + ')</p>');
						}
					});
					$('.exercises-content').append($('.exercise-template').html());
				} else {
				
					$('#diary_detail').find('.date').html(day.day);
					$('#diary_detail').find('.kava').html(day.plan_name);
					$('#diary_detail').find('.paev').parent().html(translations[lang]['trainingday'] + ': <span class="paev">' + day.day_name + '</span>');
					$('#diary_detail').find('.paev').html(day.day_name);
					$('#diary_detail').find('.length').html(secToHour(day.length)).parent().show();
				
					$.each(day_data.exercises, function(i, exercise) {
						if (exercise) {
							$('.exercise-template').find('h3').html(exercise.name);
							if(exercise.type == 'time') {
								$('.exercise-template').find('.info-content').html('<p>'+translations[lang]['_length']+': ' + exercise.time + '</p>');
							} else {
								$('.exercise-template').find('.info-content').html('');
								$.each(exercise.series, function(j, serie) {
									if(serie.status == 'done')
										$('.exercise-template').find('.info-content').append('<p>'+translations[lang]['serie']+' ' + (j+1) + ': ' + serie.repeats + 'x' + serie.weights + '</p>');
								});
								
								
							}
							
							$('.exercises-content').append($('.exercise-template').html());
						}
						
					});
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
	
	initTrainings: function() {
		db.transaction(function(tx) {
			query = 'SELECT * FROM TRAININGS ORDER BY id DESC';
			//console.log(query);
			tx.executeSql(query, [], function(tx, results) {
				
				var len = results.rows.length, i;
				for (i = 0; i < len; i++) {
					item = results.rows.item(i);
					if (item.type == 'order') {
						trainings.orderPackages = true;
					} else {
						trainings.samplePackages = true;
					}
					if (item.has_offers && item.has_offers != '0')
						packs.hasSpecialOffers = true;
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
		
		if(curDay = localStorage.getObject('fitCurDay')) {
			
			curTime = new Date().getTime();
			if(curDay.started)
				lastTime = new Date(curDay.started).getTime();
			else
				lastTime = new Date().getTime();
			difference = (curTime - lastTime)/10;
			startBigTimer(difference);
			$('.kestus').show();
			trainings.doingExercise = true;
		}
		
	},
	initNutritions: function() {
		nutritions.orderNutritions = [];
		nutritions.sampleNutritions = [];
		db.transaction(function(tx) {
			query = 'SELECT * FROM NUTRITIONS ORDER BY id DESC';
			//console.log(query);
			tx.executeSql(query, [], function(tx, results) {
				
				var len = results.rows.length, i;
				for (i = 0; i < len; i++) {
				
					item = results.rows.item(i);
					var meals = JSON.parse(item.meals);
					var plan = {};
					
					plan.id = item.id;
					plan.name = item.name;
					plan.description = item.description;
					plan.meals = {};
					plan.meals = meals;
					//console.log(plan);
					if (plan.type == 'order') {
						nutritions.orderNutritions.push(plan);
					} else {
						nutritions.sampleNutritions.push(plan);
					}
					
					if (plan.has_offers && plan.has_offers != '0')
						packs.hasSpecialOffers = true;
					
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
	
}

var trainings = {
	doingExercise: false,
	nextExercise: 0, 
	samplePackages: false,
	orderPackages: false, 
	currentTraining: {},
	currentDay: 0,
	isItDone: false,
	currentType: 'sample',
	
	getTrainingsMain: function() {
		$('.main-contents').html('');
		
		if (trainings.doingExercise) {
			$('.main-contents').append('<section class="item jatkakava" data-page="treening_jatka" data-level="2"><div class="item_wrap"><h3>'+translations[lang]['continue_training']+'</h3></div></section>');
		}	
		
		if (trainings.samplePackages) {
			$('.main-contents').append('<section class="item noicon" data-page="treening_naidiskavad" data-level="2"  data-type="sample"><div class="item_wrap"><h3>'+translations[lang]['sample_plans']+'</h3></div></section>');
		}

		if (trainings.orderPackages) {
			$('.main-contents').append('<section class="item noicon soodustusedbtn" data-page="treening_naidiskavad" data-level="2" data-type="order"><div class="item_wrap"><h3>'+translations[lang]['order_plans']+'</h3></div></section>');
		} else {
			$('.main-contents').append('<section class="item noicon soodustusedbtn" data-page="personaalsed_treeningkavad" data-level="2"><div class="item_wrap"><h3>'+translations[lang]['order_plans']+'</h3></div></section>');
		}
		
		$('#uustreening').find('.item').click(function(e) {
			e.preventDefault();
			if ($(this).data('page') == 'kavade_ostmine') {
				app.buyType = 'training';
				LEVEL = 1;
				teleportMe('kavade_ostmine');
			} else if ($(this).data('page') == 'treening_jatka') {
				LEVEL = 2;
				curDay = localStorage.getObject('fitCurDay');
				teleportMe('treening_naidiskavad_1paev', curDay.day);
			} else if ($(this).data('page') == 'personaalsed_treeningkavad') {
				LEVEL = 2;
				teleportMe('personaalsed_treeningkavad');
			} else {
				LEVEL = 2;
				teleportMe('treening_naidiskavad', $(this).data('type'));
			}
			
		});
		
	},
	
	getTrainings: function(type) {
		if(!type)
			type = trainings.currentType;
		else
			trainings.currentType = type;
		
		//console.log(type);
		
		$('#treening_naidiskavad').find('h3:first').html(translations[lang][type + '_packages']);
		
		db.transaction(function(tx) {
			query = 'SELECT * FROM TRAININGS WHERE type = "' + type + '"';
			tx.executeSql(query, [], function(tx, results) {
				
				var len = results.rows.length, i;
				for (i = 0; i < len; i++) {
					training = item = results.rows.item(i);
					$('#treening_naidiskavad').find('.training-content').append('<section class="item noicon treenerpakkumisedbtn" data-page="treening_naidiskava" data-level="3" data-id="' + training.id + '"><div class="item_wrap avoid-clicks"><h3 class="avoid-clicks">' + training.name + '</h3></div><div class="remove-overlay"><span class="remove-icon"></span></div></section>');
					//console.log(training);
				}
		
				$('#treening_naidiskavad').find('.training-content').find('.item').click(function(e) {
					e.preventDefault();
					//currenttraining = $(this).data('id');
					LEVEL = 3;
					teleportMe('treening_naidiskava', $(this).data('id'));
					
				});
				
				$('#treening_naidiskavad').find('.remove-overlay').click(function(e) {
					e.preventDefault();
					e.stopPropagation();
					element = $(this).parent();
					var id = parseInt(element.data('id'));
					
					db.transaction(function(tx) {
						var statement = 'DELETE FROM TRAININGS WHERE id = ' + id;
						//console.log(statement);
					   	tx.executeSql(statement);
					   	element.remove();
				   	});
					
				});
				
			}, function(tx, results) {
				console.error('Error in selecting test result');
				//console.log(tx);
				//console.log(result);
			});
			
		}, function(error) {
			console.error('Error in selecting test result');
			//console.log(error);
		});		
		
		
		
	},
	getTraining: function(id) {
		if(!parseInt(id) && trainings.currentTraining.id)
			id = parseInt(trainings.currentTraining.id);
		
		db.transaction(function(tx) {
			query = 'SELECT * FROM TRAININGS WHERE id = ' + id;
			//console.log(query);
			tx.executeSql(query, [], function(tx, results) {
				
				item = results.rows.item(0);
				var exercises = JSON.parse(item.exercises);
				var day_names = JSON.parse(item.day_names);
				var plan = {};
				//console.log(exercises);
				plan.id = item.id;
				plan.name = item.name;
				plan.description = item.description;
				
				plan.exercises = exercises;
				plan.day_names = day_names;
				
				trainings.currentTraining = plan;
				trainings.currentDay = curDay.day;
				
				$('#treening_naidiskava').find('h3:first').html('<img src="i/icon_list.png" alt=""/>' /*+ translations[lang]['training_plan']*/ + '' + trainings.currentTraining.name);
	
				$.each(trainings.currentTraining.exercises, function(day, exercises) {
				
					$.each(trainings.currentTraining.day_names[day], function(j, muscle) {
						if(j == 0)
							muscle_groups_str = muscle_groups[muscle];
						else
							muscle_groups_str = muscle_groups_str + ', ' + muscle_groups[muscle]; 
					});
				
					$('#treening_naidiskava').find('.training-content').append('<section class="item noicon day-item" data-page="treening_naidiskavad_1paev" data-level="3" data-day="' + day + '"><div class="item_wrap"><h6>' + day + '. '+translations[lang]['day']+'</h6><h3>' + muscle_groups_str + '</h3></div></section>');
					
				});
				
				//$('#treening_naidiskava').find('.description-content').html(trainings.currentTraining.description);
				
				$('#treening_naidiskava').find('.day-item').click(function(e) {
					e.preventDefault();
					LEVEL = 4;
					teleportMe('treening_naidiskavad_1paev', $(this).data('day'));
					
				});
				
				$('.to-download').click(function(e) {
					e.preventDefault();
					LEVEL = 4;
					teleportMe('alusta_laadimist', id);
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
	getTrainingDescription: function() {
	
		$('#treening_naidiskava_markused').find('h3:first').html(trainings.currentTraining.name);
		$('#treening_naidiskava_markused').find('h3:last').html(trainings.currentTraining.description);
		
	},
	
	getTrainingsDetail: function(day) {
		if (day > 0)
			trainings.currentDay = day;
		else
			day = trainings.currentDay;
		
		$.each(trainings.currentTraining.day_names[day], function(j, muscle) {
			if(j == 0)
				muscle_groups_str = muscle_groups[muscle];
			else
				muscle_groups_str = muscle_groups_str + ', ' + muscle_groups[muscle]; 
		});
		
		header = day + '. '+translations[lang]['DAY']+' ' + muscle_groups_str;	
		$('#treening_naidiskavad_1paev').find('h3:first').html('<img src="i/icon_list.png" alt=""/>' + header);
		if(day) {
		
			var exercises = trainings.currentTraining.exercises[trainings.currentDay];
			
			var curDay = localStorage.getObject('fitCurDay');
			var exCounter = 0;
			$.each(trainings.currentTraining.exercises[trainings.currentDay], function(i, exercise) {
			
				if(!curDay || !curDay.exercises[i]) {
					if(exercise.type == 'weight' && exercise.series_count)
						var status = exercise.series_count + ' ' + translations[lang]['series'];
					else
						var status = exercise.time + 'min';
				} else {
					//if (exercise.type == 'weight' && exercise.series_count) {
						
						if (curDay.exercises[i].status == 'done') {
							exCounter = exCounter+1;
							var status = '<img src="i/icon_ok.png" alt=""/>';
						} else {
							var status = '<img src="i/icon_halfok.png" alt=""/>';
						}
						
					//} else {
						
					//}
				}
			
				$('#treening_naidiskavad_1paev').find('.exercises-content').append('<section class="whiteitem gym noicon" data-page="treening_naidiskavad_1paev_Xmin" data-level="4" data-exercise="' + i + '"><div class="item_wrap"><h3><span>' + exercise.name + '</span></h3><div class="info"><span>'+status+'</span></div><div class="clear"></div></div></section>');
				
			});
			if (exCounter == Object.keys(trainings.currentTraining.exercises[trainings.currentDay]).length) {
				trainings.isItDone = true;
			} else {
				trainings.isItDone = false;
			}
			$('#treening_naidiskavad_1paev').find('.whiteitem').click(function(e) {
				e.preventDefault();
				LEVEL = 5;
				teleportMe('treening_naidiskavad_1paev_nXn', $(this).data('exercise'));
				
			});
		}
		
		if (trainings.doingExercise) 
			$('.end-day').show();
		else
			$('.end-day').hide();
			
		$('.end-day').click(function(e) {
			//update diary and set day length and delete all current day data, also from localStorage
			
			trainings.endTraining();
			
		});
		
		//console.log(trainings.currentTraining);
		
	},
	
	getTrainingsExercise: function(element) {
		
		$('#treening_naidiskavad_1paev').find('h3:first').html('<img src="i/icon_list.png" alt=""/>' + trainings.currentTraining.name);
		
		//element = parseInt(element);
		if(!element)
			element = trainings.currentExercise.id;
		//temp
		trainings.currentExercise = trainings.currentTraining.exercises[trainings.currentDay][element];
		j = 0;
		iteration = false;
		next = false;
		
		//console.log(trainings.currentTraining.exercises[trainings.currentDay][element]);
		
		$('.videopreview').attr('data-id', trainings.currentExercise.exercise_id);
		$('.videopreview').find('img:last').attr('src', app.serverUrl + 'pics/exercises/' + trainings.currentExercise.exercise_id + '.jpg');
		
		var curDay = localStorage.getObject('fitCurDay');
		//console.log(curDay);
		$.each(trainings.currentTraining.exercises[trainings.currentDay], function(i, item) {
			j++;
			if (i == element) 
				iteration = j;
			
			if (iteration && j == (iteration + 1))
				next = i;
		});
		//console.log(trainings.isItDone);
		if (trainings.isItDone) {
			$('.end-training').show();
			$('.to-back').hide();
			$('.next-exercise').hide();
		} else {
			if (iteration == j) {
				$('.to-back').show();
				$('.end-training').hide();
				$('.next-exercise').hide();
			} else {
				$('.to-back').hide();
				$('.end-training').hide();
				$('.next-exercise').show();
			}
		}
		$('.to-back').unbind('click');
		$('.to-back').click(function(e) {
			LEVEL = 4;
			teleportMe('treening_naidiskavad_1paev');
			//$('.backbtn').click();
		});
		$('.next-exercise').unbind('click');
		$('.next-exercise').click(function(e) {
			addHover(this);
			$('.toscroll').scrollTop(0);
			e.preventDefault();
			LEVEL = null;
			teleportMe('treening_naidiskavad_1paev_nXn', next);
		});
		$('.end-training').unbind('click');
		$('.end-training').click(function(e) {
			trainings.endTraining();

		});
		//permanent
		//localStorage.setObject('currentTrainingExercise', trainings.currentExercise);
		
		//console.log(trainings.currentExercise);
		
		if(trainings.currentExercise && trainings.currentExercise.comment) {
			$('#treening_naidiskavad_1paev_nXn').find('.text_wrap').html(trainings.currentExercise.comment);
			$('.soovitusedbtn').show();
		} else {
			$('.soovitusedbtn').hide();
		}
		$('#treening_naidiskavad_1paev_nXn').find('h2').html(trainings.currentExercise.name);
		
		$('.serias-content').html('');
		
		if (trainings.currentExercise.type == 'weight') {
			$('#treening_naidiskavad_1paev_nXn').find('h1').html(trainings.currentExercise.series_count + 'x' + trainings.currentExercise.series[0].repeats);
			
			$('.weights-exercise').show();
			$('.timer-exercise').hide();
			
			$.each(trainings.currentExercise.series, function(i, serie) {
				
				if(curDay && curDay.exercises[element] && curDay.exercises[element].series[i]  && curDay.exercises[element].series[i].status  && curDay.exercises[element].series[i].status == 'done') {
					$('.seria-template').find('.theicon').removeClass('unchecked').addClass('checked').find('img').attr('src', 'i/checked.png');
				} else {
					$('.seria-template').find('.theicon').removeClass('checked').addClass('unchecked').find('img').attr('src', 'i/unchecked.png');
				}
				$('.seria-template').find('.seeriatitle').html(translations[lang]['serie'] + ' ' + (i+1) + ':');
				$('.seria-template').find('.times').find('span').html(serie.repeats);
				$('.seria-template').find('.weight').find('span').html(serie.weights);
				$('.seria-template').find('.seeria').attr('data-index', i);
				$('.serias-content').append($('.seria-template').html());
			});
						
		} else {
		
			if(curDay && curDay.exercises[element] && curDay.exercises[element].status == 'done') {
				//console.log('here');
				$('#timerStuff').html('00:00:00');
				currentTime = unFormatTime('00:00:00');
				$('.timer-exercise .nobg_item').hide();
			} else if (curDay && curDay.exercises[element] && curDay.exercises[element].status == 'doing') {
				//console.log('here');
				//started = new Date(curDay.exercises[element].started).getTime();
				//$('#timerStuff').html(started);
				//currentTime = unFormatTime(started);
				$('.timer-exercise .nobg_item').show();
				$('.timer-exercise .nobg_item').addClass('started').find('h3').text('PAUS');
			} else {
				//console.log('here');
				$('#timerStuff').html(trainings.currentExercise.time + ':00:00');
				currentTime = unFormatTime(trainings.currentExercise.time + ':00:00');
				$('.timer-exercise .nobg_item').show();
				//$('.timer-exercise .nobg_item').addClass('started').find('h3').text('PAUS');
			}
			if (pauseTimer) {
				console.log('fo real ??');
				$('.timer-exercise .nobg_item').removeClass('started').find('h3').text('START');
				$('#timerStuff').html(formatTime(currentTime));
			}
		
			$('#treening_naidiskavad_1paev_nXn').find('h1').html(trainings.currentExercise.time + 'min');
			
			
			$('.weights-exercise').hide();
			$('.timer-exercise').show();
		}
		
		
		$('.videopreview').unbind(eventEnd).bind(eventEnd, function (e) {
   			var id = $(this).data('id');
			LEVEL = 6;
			teleportMe('video', id);
		});
		
		$('.theicon').unbind('click');
		$('.theicon').click(function() {
			if ($(this).hasClass('unchecked')) {
				trainings.doingExercise = true;
				data = {};
				data.type = 'serie';
				data.repeats = parseInt($(this).parent().find('.times span').html());
				data.weight = parseInt($(this).parent().find('.weight span').html());
				data.serie = parseInt($(this).parent().data('index'));
				trainings.doTraining(data);
				$(this).removeClass('unchecked').addClass('checked').find('img').attr('src', 'i/checked.png');
			} else {
				$(this).removeClass('checked').addClass('unchecked').find('img').attr('src', 'i/unchecked.png');
			}
		});
		
		
		
		$('.times .plus').unbind(eventEnd).bind(eventEnd, function (e) {
			var par = $(this).parent();
			var max = 20;
			var current = par.children('span').text();	
			if(current <= max){
				par.children('span').text( Number(current) + Number(1) );
			}
		});
		
		$('.times .minus').unbind(eventEnd).bind(eventEnd, function (e) {
			var par = $(this).parent();
			var min = 2;
			var current = par.children('span').text();		
			if(current >= min){
				par.children('span').text( Number(current) - Number(1) );
			}
		});
		
		
		$('.weight .plus').unbind(eventEnd).bind(eventEnd, function (e) {
		
			var par = $(this).parent();
			var max = 295;
			var current = par.children('span').text();
			
			if(current <= max){
				par.children('span').text( Number(current) + Number(1) );
			}
		
			//console.log( par.children('span').text() );
		});
		
		$('.weight .minus').unbind(eventEnd).bind(eventEnd, function (e) {
		
			var par = $(this).parent();
			var min = 1;
			var current = par.children('span').text();
			
			if(current >= min){
				par.children('span').text( Number(current) - Number(1) );
			}
		});
		
		$('.lefttimericon .plus').unbind(eventEnd).bind(eventEnd, function (e) {
			var par = $(this).parent();
			var max = 7200000;
			var current = unFormatTime(par.children('span').text());
			if(current <= max){
				new_value = Number(current) + Number(60000);
				new_value = formatTime(new_value);
				currentTime = unFormatTime(new_value);
				par.children('span').text( new_value );
			}
		});
		
		$('.lefttimericon .minus').unbind(eventEnd).bind(eventEnd, function (e) {
			var par = $(this).parent();
			//var min = 300000;
			var min = 120000;
			var current = unFormatTime(par.children('span').text());
			if(current >= min){
				new_value = Number(current) - Number(60000);
				new_value = formatTime(new_value);
				currentTime = unFormatTime(new_value);
				par.children('span').text( new_value );
			}
		});
		
		$('.timer-exercise .nobg_item').unbind(eventEnd).bind(eventEnd, function (e) {
			addHover(this);
			if( !$(this).hasClass('started') ){
				$(this).addClass('started');
				$(this).find('h3').text('PAUS');
				
				data = {};
				data.type = 'time';
				if(pauseTimer && curDay && curDay.exercises && curDay.exercises[element])
					data.status = 'resume';
				else
					data.status = 'start';
				pauseTimer = false;
				
				data.length = unFormatTime($('#timerStuff').html());
				trainings.doTraining(data);
				//console.log(trainings.currentTraining);
				timer.play();
				pauseTimer = false;
				
			}else{
				//console.log(trainings.currentTraining);
				$(this).removeClass('started');
				$(this).find('h3').text('START');
				data = {};
				data.type = 'time';
				data.status = 'pause';
				trainings.doTraining(data);
				//timer.pause();
				pauseTimer = true;
			}
		});
		
		var $countdown;
	    var $form;
	    var incrementTime = 70;
	    //var currentTime = 1200000; // 5 minutes (in milliseconds)
	    $countdown = $('#timerStuff');
        // Setup the timer
        var timer = $.timer(function updateTimer() {
	        // Output timer position
	        var timeString = formatTime(currentTime);
	        $('#timerStuff').html(timeString);
	        if(pauseTimer) {
	        	//console.log('paused');
	        	timer.pause();
	        }
	        // If timer is complete, trigger alert
	        if (currentTime == 0) {
	            timer.stop();
	            
	            data = {};
				data.type = 'time';
				data.status = 'end';
				data.length = unFormatTime($('#timerStuff').html());
				trainings.doTraining(data);
				$('.timer-exercise .nobg_item').hide();
	            
		        // Stop and reset timer
		        //timer.stop().once();
	            return;
	        }
	
	        // Increment timer position
	        currentTime -= incrementTime;
	        if (currentTime < 0) currentTime = 0;
	
	    }, incrementTime, false);
	    //console.log(curDay);
		if(!curDay || !curDay.exercises || !curDay.exercises[element] || curDay.exercises[element].status != 'doing') {
			pauseTimer = true;
			timer.stop();
			//console.log('no curday :(');
		}
	},
	//approx 5-6h to finish this shit
	doTraining: function(data) {
	
		newDay = true;
		
		var curDay = localStorage.getObject('fitCurDay');
		$('.kestus').show();
		offset = jQuery('.topbar').height();
		jQuery('.centered').css('top', offset + 'px');
		var toscrollheight = Number(wind - (offset + me + bbar));
		jQuery('.toscroll').css('height', toscrollheight + 'px');
		
		$('.kestus').click(function() {
			
			
			
		});
		//console.log(trainings.currentTraining);
		exCounter = 0;
		var updateExercises = [];
		$.each(trainings.currentTraining.exercises[trainings.currentDay], function(i, exercise) {
			var newEx = exercise;
			if(!newEx.paused)
				newEx.paused = '';
			if(!newEx.ignorep)
				newEx.ignorep = false;
			
			if(curDay && curDay.exercises[i]) {
				if(curDay.exercises[i].status == 'done') {
					exCounter = exCounter+1;
				} else if(curDay.exercises[i].status == 'doing' && curDay.exercises[i].type == 'time' && trainings.currentExercise.id != exercise.id) {
					pauseTimer = true;
					newEx.paused = new Date();
					curDay.exercises[i] = newEx;
					//console.log('pause IT');
					//console.log(newEx);
				}
			}
		
			if(trainings.currentExercise.id == exercise.id) {
				if (data.type == 'time' && data.status == 'start') {
					//console.log('start!');
					newEx.status = 'doing';
					newEx.started = new Date();
					newEx.time = parseInt(data.length)/60000;
					//console.log(newEx);
				} else if (data.type == 'time' && data.status == 'pause') {
					//console.log('add pause!!');
					newEx.paused = new Date();
					newEx.ignorep = false;
					//console.log(exercise);
				} else if (data.type == 'time' && data.status == 'resume') {
					//console.log(exercise);
					var startedTime = new Date(newEx.started).getTime();
					var pausedTime = new Date(newEx.paused).getTime();
					//console.log(startedTime);
					//console.log(pausedTime);
					var difference = (parseInt(pausedTime) - parseInt(startedTime))/1000;
					newEx.paused = false;
					//console.log(difference);
					var t = new Date();
					t.setSeconds(t.getSeconds() + difference);
					newEx.started = t;
					//console.log('updated time!!');
					newEx.ignorep = true;
					newEx.iresumed = true;
					newEx.paused = false;
					newEx.paused = '';
					newEx.status = 'doing';
					//console.log(exercise);
					
				} else if (data.type == 'time' && data.status == 'end') {
					newEx.status = 'done';
					//console.log(newEx);
					//exercise.time = parseInt(data.length)/6000;
				} else {
				
					if (curDay && curDay.exercises[i] && curDay.exercises[i].done_series) { 
						newEx.done_series = curDay.exercises[i].done_series + 1;
					} else {
						newEx.done_series = 1;
						
					}
					if (exercise.series.length == exercise.done_series)
						newEx.status = 'done';
					$.each(exercise.series, function(j, serie) {
						if(j == data.serie) {
							serie.repeats = data.repeats;
							serie.weight = data.weight;
							serie.status = 'done';
							newEx.series[j] = serie;
						}/* else {
							serie.status = false;
							exercise.series[j] = serie;
						}*/
						
					});
					
				}
				if (curDay) {
					curDay.exercises[i] = newEx;
					newDay = false;
				} else {
					startBigTimer(0);
					curDay = {};
					curDay.started = new Date();
					curDay.plan_id = trainings.currentTraining.id;
					curDay.day = trainings.currentDay;
					curDay.exercises = {};
					curDay.exercises[i] = newEx;
					newDay = true;
				}
				curDay.last_activity = new Date();
				if(newEx.status == 'done' && (exCounter+1) == Object.keys(trainings.currentTraining.exercises[trainings.currentDay]).length) {
					$('.end-training').show();
					$('.to-back').hide();
					$('.next-exercise').hide();
				}
				
			}
			
		});
		//console.log(trainings.currentTraining);
		
		
		/*db.transaction(function(tx) {
			var statement = "UPDATE TRAININGS SET exercises = '" + JSON.stringify(updateExercises) + "' WHERE id = " + trainings.currentTraining.id + "";
			//console.log(statement);
		   	tx.executeSql(statement);
		}, function(error) {
			console.error('Error in selecting test result');
			//console.log(error);
		});*/
		trainings.doingExercise = true;
		localStorage.setObject('fitCurDay', curDay);
		
		/*
		* day contains exercises, exercises contain series
		* update training package
		*/
		
		$('.kestus').show();
		
		//console.log(curDay);
		
		db.transaction(function(tx) {
		
			var d = new Date();
			var curr_date = d.getDate();
			if(curr_date < 10)
				curr_date = '0' + curr_date;
		    var curr_month = d.getMonth() + 1; //Months are zero based
		    if(curr_month < 10)
				curr_month = '0' + curr_month;
		    var curr_year = d.getFullYear();
		    
		    $.each(trainings.currentTraining.day_names[trainings.currentDay], function(j, muscle) {
				if(j == 0)
					muscle_groups_str = muscle_groups[muscle];
				else
					muscle_groups_str = muscle_groups_str + ', ' + muscle_groups[muscle]; 
			});
			
			var day_name = trainings.currentDay + '. PÄEV ' + muscle_groups_str;
		
			// get from diary where day is today, plan day is right one and so on
			query = 'SELECT * FROM DIARY WHERE day = "' + curr_year + '-' + curr_month + '-' + curr_date +'" AND package = ' + trainings.currentTraining.id + ' AND training_day = ' + trainings.currentDay;
			//console.log(query);
			tx.executeSql(query, [], function(tx, results) {
				
				var len = results.rows.length, i;
				if (!len) {
					// then its first time and generate day data..curDay
					db.transaction(function(tx) {
						var statement = "INSERT INTO DIARY (day, month, year, package, training_day, length, plan_name, day_name, day_data, type, synced) VALUES ('" + curr_year + "-" + curr_month + "-" + curr_date + "', '" + curr_month + "', '" + curr_year + "'," + trainings.currentTraining.id + ", " + trainings.currentDay + ", 0, '" + trainings.currentTraining.name + "', '" + day_name + "', '" + JSON.stringify(curDay) + "', 'exercise', 0)";
						//console.log(statement);
					   	tx.executeSql(statement);
				   	}, function(error) {
						console.error('Error in inserting item to diary');
						//console.log(error);
					});
				} else {
					
					db.transaction(function(tx) {
						var statement = "UPDATE DIARY SET day_data = '" + JSON.stringify(curDay) + "' WHERE day = '" + curr_year + "-" + curr_month + "-" + curr_date + "' AND package = " + trainings.currentTraining.id + " AND training_day = " + trainings.currentDay;
						//console.log(statement);
					   	tx.executeSql(statement);
				   	}, function(error) {
						console.error('Error in selecting test result');
						//console.log(error);
					});
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
		//console.log(trainings.currentTraining);
	},
	
	endTraining: function() {
		
		currentTime = 0;
		
		curDay = localStorage.getObject('fitCurDay', curDay);
		if(curDay && curDay.exercises) {
			curTime = new Date();
			if(curDay.started)
				lastTime = new Date(curDay.started).getTime();
			else
				lastTime = new Date().getTime();
			difference = (curTime.getTime() - lastTime)/1000;
			$('.kestus').hide();
			
			var curr_date = curTime.getDate();
			if(curr_date < 10)
				curr_date = '0' + curr_date;
		    var curr_month = curTime.getMonth() + 1; //Months are zero based
		    if(curr_month < 10)
				curr_month = '0' + curr_month;
		    var curr_year = curTime.getFullYear();
		    var exercises = {};
		    //check if any timers are running and update their time to smaller amount
		    $.each(curDay.exercises, function(i, exercise) {
		    
			   if (exercise.status == 'doing' && exercise.started) {
				   var startedTime = new Date(exercise.started).getTime();
				   //console.log(exercise);
				   if(exercise.paused) {
					   var pausedTime = new Date(exercise.paused).getTime();
					   difference2 = (Number(pausedTime) - Number(startedTime))/1000;
				   } else {
					   difference2 = (curTime.getTime() - startedTime)/1000;
				   }
				   //console.log(difference2);
				   exercise.time = secToHour(difference2);
			   } else if(exercise.status == 'done') {
				   exercise.time = exercise.time + ':00:00';
			   }
			   curDay.exercises[i] = exercise;
		    });
		    //console.log('ENDED');
			//console.log(curDay);
			setTimeout(function() {
				db.transaction(function(tx) {
					var statement = "UPDATE DIARY SET day_data = '" + JSON.stringify(curDay) + "', length = '" + difference + "' WHERE day = '" + curr_year + "-" + curr_month + "-" + curr_date + "' AND package = " + trainings.currentTraining.id + " AND training_day = " + trainings.currentDay;
					//console.log(statement);
				   	tx.executeSql(statement);
				   	localStorage.removeItem('fitCurDay');
				   	trainings.doingExercise = false;
				   	
				   	LEVEL = 1;
					teleportMe('homepage', {});
					if(mainTimer)
						clearTimeout(mainTimer);
						
					$('.kestus').hide();
				   	
				   	
			   	}, function(error) {
					console.error('Error in selecting test result');
					//console.log(error);
				});
			}, 600);
		
		} else {
			currentTime = 0;
			LEVEL = 1;
			teleportMe('homepage', {});
			if(mainTimer)
				clearTimeout(mainTimer);
				
			$('.kestus').hide();
			
			trainings.doingExercise = false;
			
		}
		
	},
	//15min
	checkActivity: function() {
		if(curDay.last_activity) {
			
			
			
		}
		//last_activity > 30min, show dialog where you can end day or renew activity, stop timers
		
	}
	
};

var nutritions = {
	nutritions: {},
	nextMeal: 0, 
	sampleNutritions: [],
	orderNutritions: [], 
	currentNutrition: {},
	currentType: 'sample',
	
	getNutritionsMain: function() {
		$('.main-contents').html('');	
		
		//console.log(this.orderNutritions);
		
		if (this.sampleNutritions.length) {
			$('.main-contents').append('<section class="item noicon treenerpakkumisedbtn" data-page="naidiskavad" data-level="2" data-type="sample"><div class="item_wrap"><h3>'+translations[lang]['sample_plans']+'</h3></div></section>');
		}
		
		if (this.orderNutritions.length) {
			$('.main-contents').append('<section class="item noicon soodustusedbtn" data-page="naidiskavad" data-level="2" data-type="order"><div class="item_wrap"><h3>'+translations[lang]['order_plans']+'</h3></div></section>');
		} else {
			$('.main-contents').append('<section class="item noicon soodustusedbtn" data-page="personaalsed_toitumiskavad" data-level="2"><div class="item_wrap"><h3>'+translations[lang]['order_plans']+'</h3></div></section>');
			
		}
		
		$('#toitumiskavad').find('.item').click(function(e) {
			e.preventDefault();
			if ($(this).data('page') == 'kavade_ostmine') {
				app.buyType = 'nutrition';
				LEVEL = 1;
				teleportMe('kavade_ostmine');
			} else if ($(this).data('page') == 'personaalsed_toitumiskavad') {
				LEVEL = 2;
				teleportMe('personaalsed_toitumiskavad');
			} else {
				LEVEL = 2;
				teleportMe('naidiskavad', $(this).data('type'));
			}
			
		});
		
		//bindEvents();
		
	},
	getNutritions: function(type) {
		
		if(!type)
			type = nutritions.currentType;
		else
			nutritions.currentType = type;
		
		//console.log(type);
		//console.log(_nutritions);
		$('#naidiskavad').find('h3:first').html(translations[lang][type + '_packages']);
		
		db.transaction(function(tx) {
			query = 'SELECT * FROM NUTRITIONS WHERE type = "' + type + '"';
			tx.executeSql(query, [], function(tx, results) {
				
				var len = results.rows.length, i;
				for (i = 0; i < len; i++) {
					nutrition = item = results.rows.item(i);
					$('#naidiskavad').find('.toscroll').append('<section class="item noicon treenerpakkumisedbtn" data-page="toitumisplaan1" data-level="3" data-id="' + nutrition.id + '"><div class="item_wrap avoid-clicks"><h3 class="avoid-clicks">' + nutrition.name + '</h3></div><div class="remove-overlay"><span class="remove-icon"></span></div></section>');
				}
		
		
				$('#naidiskavad').find('.item').click(function(e) {
					e.preventDefault();
					addHover(this);
					//currentNutrition = $(this).data('id');
					LEVEL = 3;
					teleportMe('toitumisplaan1', $(this).data('id'));
					
				});
				
				$('#naidiskavad').find('.remove-overlay').click(function(e) {
					e.preventDefault();
					e.stopPropagation();
					element = $(this).parent();
					var id = parseInt(element.data('id'));
					
					db.transaction(function(tx) {
						var statement = 'DELETE FROM NUTRITIONS WHERE id = ' + id;
						//console.log(statement);
					   	tx.executeSql(statement);
					   	element.remove();
				   	});
					
				});
			}, function(tx, results) {
				console.error('Error in selecting test result');
				//console.log(tx);
				//console.log(result);
			});
			
		}, function(error) {
			console.error('Error in selecting test result');
			//console.log(error);
		});	
		
	},
	getNutrition: function(id) {
		
		if(!id)
			id = nutritions.currentNutrition.id;
		
		db.transaction(function(tx) {
			query = 'SELECT * FROM NUTRITIONS WHERE id = ' + id;
			//console.log(query);
			tx.executeSql(query, [], function(tx, results) {
				
				item = results.rows.item(0);
				var meals = JSON.parse(item.meals);
				var nutrition = {};
			
				nutrition.id = item.id;
				nutrition.name = item.name;
				nutrition.description = item.description;
				
				nutrition.meals = meals;
				
				nutritions.currentNutrition = nutrition;
	
		
				$('#toitumisplaan1').find('h3').html('<img src="i/icon_toit.png" alt=""/>'/* + translations[lang]['nutrition_plan']*/ + '' + nutritions.currentNutrition.name);
				
				$.each(nutritions.currentNutrition.meals, function(type, meal) {
					
					$('#toitumisplaan1').find('.toscroll').append('<section class="whiteitem noicon" data-page="menuu1_hommikusook1" data-level="4" data-type="' + type + '"><div class="item_wrap"><h3>' + translations[lang][type] + '</h3></div></section>');
					
				});
				$('#toitumisplaan1').find('.whiteitem').click(function(e) {
					e.preventDefault();
					LEVEL = 4;
					teleportMe('menuu1_hommikusook1', $(this).data('type'));
					
				});
			}, function(tx, results) {
				console.error('Error in selecting test result');
				//console.log(tx);
				//console.log(result);
			});
			
		}, function(error) {
			console.error('Error in selecting test result');
			//console.log(error);
		});	
			
	},
	
	getNutritionDetail: function(meal_type) {
		
		//console.log(meal_type);
		
		//console.log(nutritions.currentNutrition.meals[meal_type].length);
		
		if (nutritions.currentNutrition.meals[meal_type].length > 1) {
			
			$('.touchslider-next').show();
			$('.touchslider-prev').show();
			$('.touchslider-next, .touchslider-prev').unbind('click');
			$('.touchslider-next').click(function(e) {
				e.preventDefault();
				LEVEL = null;
				nutritions.nextMeal = nutritions.nextMeal+1;
				//console.log(nutritions.nextMeal);
				if(nutritions.nextMeal > (nutritions.currentNutrition.meals[meal_type].length-1))
					nutritions.nextMeal = 0;
					
				//console.log(nutritions.nextMeal);
				teleportMe('menuu1_hommikusook1', meal_type);
			});
			$('.touchslider-prev').click(function(e) {
				e.preventDefault();
				LEVEL = null;
				nutritions.nextMeal = nutritions.nextMeal-1;
				if(nutritions.nextMeal < 0)
					nutritions.nextMeal = (nutritions.currentNutrition.meals[meal_type].length-1);
				teleportMe('menuu1_hommikusook1', meal_type);
			});
			
			//console.log(nutritions.nextMeal);
			//console.log(nutritions.currentNutrition.meals[meal_type]);
			
			
			if (nutritions.nextMeal) 
				var meal = nutritions.currentNutrition.meals[meal_type][nutritions.nextMeal];
			else
				var meal = nutritions.currentNutrition.meals[meal_type][0];
			
		} else {
			
			$('.touchslider-next').hide();
			$('.touchslider-prev').hide();
			var meal = nutritions.currentNutrition.meals[meal_type][0];
		}
		
		$('#menuu1_hommikusook1').find('h3').html(translations[lang][meal.meal_type]);
		$('#menuu1_hommikusook1').find('h4').html(meal.meal_name);
		$('#menuu1_hommikusook1').find('.meal-content').html(meal.meal_content);
		$('#menuu1_hommikusook1').find('.nutrition-image').attr('src', 'i/nutrions/' + meal_type + '.jpg');
		
	},
	
};
// Common functions
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {str = '0' + str;}
    return str;
}
function formatTime(time) {
    time = time / 10;
    var min = parseInt(time / 6000),
        sec = parseInt(time / 100) - (min * 60),
        hundredths = pad(time - (sec * 100) - (min * 6000), 2);
    return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2) + ":" + hundredths;
}
function unFormatTime(str) {
	//console.log(str);
	if(str) {
		arr = str.split(":");
		minutes = parseInt(arr[0]);
		
		seconds = 60*minutes;
		seconds = seconds + parseInt(arr[1]);
		milliseconds = seconds + arr[2];
		total = parseInt(milliseconds) * 10;
		
	} else {
		total = 0;
	}
	return total;
}
function secToHour(time) {
	time = parseInt(time);
	var hours = Math.floor(time / 3600);
	time = time - hours * 3600;
	
	var min = parseInt(time / 60),
        sec = parseInt(time) - (min * 60);
    
    return (hours > 0 ? pad(hours, 2) : "00") + ":" + (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2);
}
function startBigTimer(time) {
	if(trainings.doingExercise) {
		if(mainTimer)
			clearTimeout(mainTimer);
		
		time = time + 100;
		
		var hours = Math.floor(time / 360000);
		time = time - hours * 360000;
		
		var min = parseInt(time / 6000),
	        sec = parseInt(time / 100) - (min * 60);
	    
	    $('.dayTimer').html((hours > 0 ? pad(hours, 2) : "00") + ":" + (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2));
		
		mainTimer = setTimeout(function() {
			startBigTimer(time)
		}, 1000);
	}
	
}