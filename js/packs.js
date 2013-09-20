//finish this file on friday
var packs = {
	
	getMain: function() {
		$('.training-count').html(trainings.orderPackages.length);
		$('.nutrition-count').html(nutritions.orderNutritions.length);
	},
	
	/*
	* Get diary !!!
	* 4-5h
	*/
	
	getDiary: function() {
	
		template = $('.diary-template');
		content = $('.diary-content');
		content.html(template.html());
		
		/*
		* each months
		* each days
		*/
		
		var diaryscroll = $('#diaryscroll').length;
		if(diaryscroll){
			var scroll = new iScroll('diaryscroll');
			scroll.enableStickyHeaders('h4');
		}
		
		$('.treening').click(function(e) {
			LEVEL = 2;
			teleportMe('diary_detail', 2);
		});
		
		
		db.transaction(function(tx) {
			query = 'SELECT * FROM DIARY ORDER BY send DESC';
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
	getDiaryDetail: function(id) {
		
		template = $('.diary-template');
		content = $('.diary-content');
		
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
	
}

var trainings = {
	doingExercise: false,
	trainings: {},
	nextExercise: 0, 
	samplePackages: [],
	orderPackages: [], 
	currentTraining: {},
	currentDay: 0,
	
	getTrainingsMain: function() {
		$('.main-contents').html('');
		
		if (trainings.currentPackage) {
			$('.main-contents').append('<section class="item jatkakava teleport" data-page="treening_jatka" data-level="2"><div class="item_wrap"><h3>Jätka treeningkava</h3></div></section>');
		}	
		
		if (trainings.samplePackages.length) {
			$('.main-contents').append('<section class="item noicon teleport" data-page="treening_naidiskavad" data-level="2"  data-type="sample"><div class="item_wrap"><h3>Näidiskavad</h3></div></section>');
		}
		
		if (trainings.orderPackages.length) {
			$('.main-contents').append('<section class="item noicon soodustusedbtn teleport" data-page="treening_naidiskavad" data-level="2" data-type="order"><div class="item_wrap"><h3>Personaalsed kavad</h3></div></section>');
		} else {
			$('.main-contents').append('<section class="item noicon soodustusedbtn teleport" data-page="personaalsed_treeningkavad" data-level="2"><div class="item_wrap"><h3>Personaalsed kavad</h3></div></section>');
		}
		
		$('#uustreening').find('.teleport').click(function(e) {
			e.preventDefault();
			if ($(this).data('page') == 'kavade_ostmine') {
				app.buyType = 'training';
				LEVEL = 1;
				teleportMe('kavade_ostmine');
			} else if ($(this).data('page') == 'treening_jatka') {
				LEVEL = 2;
				//rethink this thing..
				teleportMe('personaalsed_treeningkavad');
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
	
		console.log(type);
		
		if (type == 'order')
			var _trainings = trainings.orderPackages;
		else
			var _trainings = trainings.samplePackages;
			
		console.log(_trainings);
		
		$.each(_trainings, function(i, training) {
				
			$('#treening_naidiskavad').find('.toscroll').append('<section class="item noicon treenerpakkumisedbtn teleport" data-page="treening_naidiskava" data-level="3" data-id="' + training.id + '"><div class="item_wrap"><h3>' + training.name + '</h3></div><div class="remove-overlay"><span class="remove-icon"></span></div></section>');
				
		});
		
		trainings.trainings = _trainings;
		
		$('#treening_naidiskavad').find('.item_wrap').on('swipe', function(e, Dx, Dy){
			if (Dx == -1) {
				$(this).parent().addClass('remove-item');
			} else if(Dx == 1) {
				$(this).parent().removeClass('remove-item');
			}
	   });
		
		$('#treening_naidiskavad').find('.teleport').click(function(e) {
			e.preventDefault();
			//currenttraining = $(this).data('id');
			LEVEL = 3;
			teleportMe('treening_naidiskava', $(this).data('id'));
			
		});
		
		$('#treening_naidiskavad').find('.remove-overlay').click(function(e) {
			e.preventDefault();
			e.stopPropagation();
			$(this).parent().slideUp('fast', function() {
				var id = parseInt($(this).data('id'));
				
				db.transaction(function(tx) {
					var statement = 'DELETE FROM TRAININGS WHERE id = ' + id;
					console.log(statement);
				   	tx.executeSql(statement);
				   	$(this).remove();
			   	});
			});
			
		});
		
	},
	getTraining: function(id) {
		$.each(trainings.trainings, function(i, training) {
			if(training.id == id) {
				trainings.currentTraining = training;
				console.log('Found training:');
				console.log(training);
				
			}
		});
		
		$('#treening_naidiskava').find('h3:first').html('TREENINGPLAAN:<br>' + trainings.currentTraining.name);
		
		$.each(trainings.currentTraining.exercises, function(type, meal) {
			$('#treening_naidiskava').find('.training-content').append('<section class="item noicon teleport" data-page="treening_naidiskavad_1paev" data-level="3" data-day="' + type + '"><div class="item_wrap"><h6>' + type + '. päev</h6><h3>Jalad, kõht</h3></div></section>');
			
		});
		$('#treening_naidiskava').find('.teleport').click(function(e) {
			e.preventDefault();
			LEVEL = 4;
			teleportMe('treening_naidiskavad_1paev', $(this).data('day'));
			
		});
		
		$('.to-download').click(function(e) {
			e.preventDefault();
			LEVEL = 4;
			teleportMe('alusta_laadimist', id);
		});
			
	},
	
	getTrainingsDetail: function(day) {
		if (day >= 0)
			trainings.currentDay = day;
		
		var exercises = trainings.currentTraining.exercises[trainings.currentDay];
		
		$.each(trainings.currentTraining.exercises[trainings.currentDay], function(i, exercise) {
		
			if(1 == 1) {
				if(exercise.type == 'weight')
					var status = exercise.series_count + 'x' + exercise.series[0].times;
				else
					var status = exercise.time + 'min';
			} else if(1 == 2) {
				var status = '<img src="i/icon_halfok.png" alt=""/>';
			} else {
				var status = '<img src="i/icon_ok.png" alt=""/>';
			}
		
			$('#treening_naidiskavad_1paev').find('.exercises-content').append('<section class="whiteitem gym noicon teleport" data-page="treening_naidiskavad_1paev_Xmin" data-level="4" data-exercise="' + i + '"><div class="item_wrap"><h3><span>' + exercise.name + '</span></h3><div class="info"><span>'+status+'</span></div><div class="clear"></div></div></section>');
			
		});
		$('#treening_naidiskavad_1paev').find('.teleport').click(function(e) {
			e.preventDefault();
			LEVEL = 5;
			teleportMe('treening_naidiskavad_1paev_nXn', $(this).data('exercise'));
			
		});
		
	},
	
	getTrainingsExercise: function(element) {
		//temporary
		trainings.currentExercise = trainings.currentTraining.exercises[trainings.currentDay][element];
		
		//permanent
		//localStorage.setObject('currentTrainingExercise', trainings.currentExercise);
		
		console.log(trainings.currentExercise);
		$('#treening_naidiskavad_1paev_nXn').find('.text_wrap').html(trainings.currentExercise.comment);
		$('#treening_naidiskavad_1paev_nXn').find('h2').html(trainings.currentExercise.name);
		if (trainings.currentExercise.type == 'weight') {
			$('#treening_naidiskavad_1paev_nXn').find('h1').html(trainings.currentExercise.series_count + 'x' + trainings.currentExercise.series[0].times);
			
			$('.weights-exercise').show();
			$('.timer-exercise').hide();
			
			$.each(trainings.currentExercise.series, function(i, serie) {
				
				$('.seria-template').find('.times').find('span').html(serie.times);
				$('.seria-template').find('.weight').find('span').html(serie.weights);
				$('.seria-template').find('.seeria').data('index', i);
				
			});
			
			
		} else {
			$('#treening_naidiskavad_1paev_nXn').find('h1').html(trainings.currentExercise.time + 'min');
			
			$('.weights-exercise').hide();
			$('.timer-exercise').show();
		}
		
		$('.theicon').click(function() {
			if ($(this).hasClass('unchecked')) {
				trainings.doingExercise = true;
				$('.kestus').show();
				$(this).removeClass('unchecked').addClass('checked').find('img').attr('src', 'i/checked.png');
				
				if($(this) == $('.theicon:last')) {
					
					$('.theicon').unbind(eventEnd).bind(eventEnd, function (e) {
					//e.preventDefault();
					
						$('#yesnooverlay').addClass('scale');
						setTimeout(function () {
							$('#yesnooverlay').addClass('scaleIn');
							
							
							$('.yes-anser').click(function(e) {
								e.preventDefault();
								
								localStorage.setObject('currentTrainingExercise', trainings.currentExercise);
								$('#yesnooverlay').find('.closingbtn').click();
							});
							
						}, 100);
					
					});
					
				}
				
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
			var min = 15;
			var current = par.children('span').text();
			
			if(current >= min){
				par.children('span').text( Number(current) - Number(1) );
			}
		});
		
	
		$('.timeractions').unbind(eventEnd).bind(eventEnd, function (e) {
			if( !$(this).hasClass('started') ){
			$(this).addClass('started');
				$(this).addClass('started');
	
				$('.timeractions h3').text('PAUSE');
	
			}else{
				$(this).removeClass('started');
	
				$('.timeractions h3').text('START');
			}
		});
		
		$('.altertimer .timer').unbind(eventEnd).bind(eventEnd, function (e) {
			$('#timeroverlay').addClass('scale');
			setTimeout(function () {
				$('#timeroverlay').addClass('scaleIn');
				
			}, 100);
			
		});
		
		
	},
	//approx 5-6h to finish this shit
	doTraining: function() {
		
		
	},
	
};

var nutritions = {
	nutritions: {},
	nextMeal: 0, 
	sampleNutritions: [],
	orderNutritions: [], 
	currentNutrition: {},
	
	getNutritionsMain: function() {
		$('.main-contents').html('');	
		
		console.log(this.orderNutritions);
		
		if (this.sampleNutritions.length) {
			$('.main-contents').append('<section class="item noicon treenerpakkumisedbtn teleport" data-page="naidiskavad" data-level="2" data-type="sample"><div class="item_wrap"><h3>Näidiskavad</h3></div></section>');
		}
		
		if (this.orderNutritions.length) {
			$('.main-contents').append('<section class="item noicon soodustusedbtn teleport" data-page="naidiskavad" data-level="2" data-type="order"><div class="item_wrap"><h3>Personaalsed kavad</h3></div></section>');
		} else {
			$('.main-contents').append('<section class="item noicon soodustusedbtn teleport" data-page="personaalsed_toitumiskavad" data-level="2"><div class="item_wrap"><h3>Personaalsed kavad</h3></div></section>');
			
		}
		
		$('#toitumiskavad').find('.teleport').click(function(e) {
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
	
		console.log(type);
		
		if (type == 'order')
			var _nutritions = this.orderNutritions;
		else
			var _nutritions = this.sampleNutritions;
			
		console.log(_nutritions);
		
		$.each(_nutritions, function(i, nutrition) {
				
			$('#naidiskavad').find('.toscroll').append('<section class="item noicon treenerpakkumisedbtn teleport" data-page="toitumisplaan1" data-level="3" data-id="' + nutrition.id + '"><div class="item_wrap"><h3>' + nutrition.name + '</h3></div></section>');
				
		});
		
		nutritions.nutritions = _nutritions;
		
		$('#naidiskavad').find('.teleport').click(function(e) {
			e.preventDefault();
			//currentNutrition = $(this).data('id');
			LEVEL = 3;
			teleportMe('toitumisplaan1', $(this).data('id'));
			
		});
		
	},
	getNutrition: function(id) {
		$.each(nutritions.nutritions, function(i, nutrition) {
			if(nutrition.id == id) {
				nutritions.currentNutrition = nutrition;
				console.log('Found nutrition:');
				console.log(nutrition);
				
			}
		});
		
		$('#toitumisplaan1').find('h3').html('TOITUMISPLAAN:<br>' + nutritions.currentNutrition.name);
		
		$.each(nutritions.currentNutrition.meals, function(type, meal) {
			
			$('#toitumisplaan1').find('.toscroll').append('<section class="whiteitem noicon teleport" data-page="menuu1_hommikusook1" data-level="4" data-type="' + type + '"><div class="item_wrap"><h3>' + type + '</h3></div></section>');
			
		});
		$('#toitumisplaan1').find('.teleport').click(function(e) {
			e.preventDefault();
			LEVEL = 4;
			teleportMe('menuu1_hommikusook1', $(this).data('type'));
			
		});
			
	},
	
	getNutritionDetail: function(meal_type) {
		
		console.log(meal_type);
		
		console.log(nutritions.currentNutrition.meals[meal_type].length);
		
		if (nutritions.currentNutrition.meals[meal_type].length > 1) {
			
			$('.touchslider-next').show();
			$('.touchslider-prev').show();
			
			$('.touchslider-next').click(function(e) {
				e.preventDefault();
				LEVEL = null;
				nutritions.nextMeal = nutritions.nextMeal+1;
				if(nutritions.nextMeal > (nutritions.currentNutrition.meals[meal_type].length-1))
					nutritions.nextMeal = 0;
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
			
			if (nutritions.nextMeal) 
				var meal = nutritions.currentNutrition.meals[meal_type][nutritions.nextMeal];
			else
				var meal = nutritions.currentNutrition.meals[meal_type][0];
			
		} else {
			
			$('.touchslider-next').hide();
			$('.touchslider-prev').hide();
			var meal = nutritions.currentNutrition.meals[meal_type][0];
		}
		
		$('#menuu1_hommikusook1').find('h3').html(meal.meal_type);
		$('#menuu1_hommikusook1').find('h4').html(meal.meal_name);
		$('#menuu1_hommikusook1').find('.meal-content').html(meal.meal_content);
		$('#menuu1_hommikusook1').find('.nutrition-image').attr('src', 'i/nutrions/' + meal_type + '.jpg');
		
	},
	
};