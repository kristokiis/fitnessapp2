var packages = {
	packages: {},
	nextExercise: 0, 
	samplePackages: [],
	orderPackages: [], 
	currentPackage: {},
	
	getTrainingsMain: function() {
		$('.main-contents').html('');
		
		if (currentPackage) {
			$('.main-contents').append('<section class="item jatkakava teleport" data-page="treening_jatka" data-level="2"><div class="item_wrap"><h3>Jätka treeningkava</h3></div></section>');
		}	
		
		if (samplePackages.length) {
			$('.main-contents').append('<section class="item noicon teleport" data-page="treening_naidiskavad" data-level="2"><div class="item_wrap"><h3>Näidiskavad</h3></div></section>');
		}
		
		if (orderPackages.length) {
			$('.main-contents').append('<section class="item noicon teleport" data-page="personaalsed_treeningkavad" data-level="2"><div class="item_wrap"><h3>Personaalsed kavad</h3></div></section>');
		}
		
		$('#uustreening').find('.teleport').click(function(e) {
			e.preventDefault();
			if ($(this).data('page') == 'kavade_ostmine') {
				app.buyType = 'training';
				LEVEL = 1;
				teleportMe('kavade_ostmine');
			} else {
				LEVEL = 2;
				teleportMe('naidiskavad', $(this).data('type'));
			}
			
		});
		
	},
	
	getPackages: function(type) {
	
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
	getPackage: function(id) {
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
	
	getPackageDetail: function(meal_type) {
		
		if (nutritions.currentNutrition.meals[meal_type].length > 1) {
			
			$('.touchslider-next').show();
			$('.touchslider-prev').show();
			
			$('.touchslider-next').click(function(e) {
				e.preventDefault();
				teleportMe('menuu1_hommikusook1', $(this).data('id'));
			});
			$('.touchslider-prev').click(function(e) {
				e.preventDefault();
				teleportMe('menuu1_hommikusook1', $(this).data('id'));
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
		
	},
	
};

var nutritions = {
	nutritions: {},
	nextMeal: 0, 
	sampleNutritions: [],
	orderNutritions: [], 
	
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
		
		$('#toitumisplaan1').find('h3').html('TOITUMISPLAAN:<br>' + currentNutrition.name);
		
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
		
		if (nutritions.currentNutrition.meals[meal_type].length > 1) {
			
			$('.touchslider-next').show();
			$('.touchslider-prev').show();
			
			$('.touchslider-next').click(function(e) {
				e.preventDefault();
				nutritions.nextMeal = nutritions.nextMeal+1;
				teleportMe('menuu1_hommikusook1', $(this).data('id'));
			});
			$('.touchslider-prev').click(function(e) {
				e.preventDefault();
				nutritions.nextMeal = nutritions.nextMeal-1;
				teleportMe('menuu1_hommikusook1', $(this).data('id'));
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
		
		if (nutritions.currentNutrition.meals[meal_type].length > 1) {
			
			$('.touchslider-next').show();
			$('.touchslider-prev').show();
			
			$('.touchslider-next').click(function(e) {
				e.preventDefault();
				teleportMe('menuu1_hommikusook1', $(this).data('id'));
			});
			$('.touchslider-prev').click(function(e) {
				e.preventDefault();
				teleportMe('menuu1_hommikusook1', $(this).data('id'));
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
		
	},
	
};

var nutritions = {
	nutritions: {},
	nextMeal: 0, 
	sampleNutritions: [],
	orderNutritions: [], 
	
	getNutritionsMain: function() {
		$('.main-contents').html('');	
		
		console.log(nutritions.orderNutritions);
		
		if (nutritions.sampleNutritions.length) {
			$('.main-contents').append('<section class="item noicon treenerpakkumisedbtn teleport" data-page="naidiskavad" data-level="2" data-type="sample"><div class="item_wrap"><h3>Näidiskavad</h3></div></section>');
		}
		
		if (nutritions.orderNutritions.length) {
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
		
		if (nutritions.currentNutrition.meals[meal_type].length > 1) {
			
			$('.touchslider-next').show();
			$('.touchslider-prev').show();
			
			$('.touchslider-next').click(function(e) {
				e.preventDefault();
				nutritions.nextMeal = nutritions.nextMeal+1;
				teleportMe('menuu1_hommikusook1', $(this).data('id'));
			});
			$('.touchslider-prev').click(function(e) {
				e.preventDefault();
				nutritions.nextMeal = nutritions.nextMeal-1;
				teleportMe('menuu1_hommikusook1', $(this).data('id'));
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
		
	},
	
};