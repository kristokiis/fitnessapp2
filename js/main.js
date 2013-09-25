
(function($){
 
$.fn.autoResize = function(options) {
 
// Just some abstracted details,
// to make plugin users happy:
var settings = $.extend({
onResize : function(){},
animate : true,
animateDuration : 150,
animateCallback : function(){},
extraSpace : 20,
limit: 1000
}, options);
 
// Only textarea's auto-resize:
this.filter('textarea').each(function(){
 
	// Get rid of scrollbars and disable WebKit resizing:
	var textarea = $(this).css({resize:'none','overflow-y':'hidden'}),
	 
	// Cache original height, for use later:
	origHeight = textarea.height(),
	 
	// Need clone of textarea, hidden off screen:
	clone = (function(){
	 
	// Properties which may effect space taken up by chracters:
	var props = ['height','width','lineHeight','textDecoration','letterSpacing'],
	propOb = {};
	 
	// Create object of styles to apply:
	$.each(props, function(i, prop){
	propOb[prop] = textarea.css(prop);
});
 
// Clone the actual textarea removing unique properties
// and insert before original textarea:
return textarea.clone().removeAttr('id').removeAttr('name').css({
position: 'absolute',
top: 0,
left: -9999
}).css(propOb).attr('tabIndex','-1').insertBefore(textarea);
 
})(),
lastScrollTop = null,
updateSize = function() {
 
// Prepare the clone:
clone.height(0).val($(this).val()).scrollTop(10000);
 
// Find the height of text:
var scrollTop = Math.max(clone.scrollTop(), origHeight) + settings.extraSpace,
toChange = $(this).add(clone);
 
// Don't do anything if scrollTip hasen't changed:
if (lastScrollTop === scrollTop) { return; }
lastScrollTop = scrollTop;
 
// Check for limit:
if ( scrollTop >= settings.limit ) {
$(this).css('overflow-y','');
return;
}
// Fire off callback:
settings.onResize.call(this);
 
// Either animate or directly apply height:
settings.animate && textarea.css('display') === 'block' ?
toChange.stop().animate({height:scrollTop}, settings.animateDuration, settings.animateCallback)
: toChange.height(scrollTop);
};
 
// Bind namespaced handlers to appropriate events:
textarea
.unbind('.dynSiz')
.bind('keyup.dynSiz', updateSize)
.bind('keydown.dynSiz', updateSize)
.bind('change.dynSiz', updateSize);
 
});
 
// Chain:
return this;
 
};
 
 
 
})(jQuery);

/* //////////////////////////////////////////// */

var LATEST = '';
var SUBLATEST = '';
var LEVEL = 0;
var newLATEST = '';
var aligner = '#frontpage';
var plus = 0;
var last = "";
var arr = new Array();
var offset = jQuery('.topbar').height();
var me = "";
var bbar = "";
var wind = jQuery(window).height();
var toBuy = new Array();
var eventEnd = (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) ? "click" : "click";
var iofsett = (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) ? 20 : 0;
var goingback = false;
var updating = false;
var anim = '1';
var tulemus = '';
var TOTALRESULT = 0;
var nolevel = false;




jQuery(window).resize(function ($) {

	offset = jQuery('.topbar').height();
	jQuery('.centered').css('top', offset + 'px');
	//jQuery('.page-wrap').css('height', Number(jQuery(aligner).height() + plus) +  'px');

	//console.log(jQuery(window).width() + 'px');
	
	////console.log( window.outerHeight, jQuery(window).height() );
});


function resizeby(_this, _plus) {

	me = jQuery(_this + ' .me').height();

	//wind = Number(wind) - Number(iofsett);
	var toscrollheight = Number(wind - (offset + me + bbar));
	////console.log(newheight , toscrollheight);
	
	//alert('ok');
	
	jQuery('.page-wrap').css('height', wind + 'px');
	//setTimeout(function () {
	
		if(_this == '#homepage')
			toscrollheight = toscrollheight - 46;
		
		
		jQuery('.toscroll').css('height', toscrollheight + 'px');

		if (LEVEL >= 2) {
			$('#topbar .backbtn').show();
			$('#menu').hide();
			if (!goingback && !nolevel)
				$('#topbar .backbtn').attr('data-deep' + LEVEL, LATEST);
				
		} else {
			setTimeout(function () {
				$('#topbar .backbtn').hide();
				$('#menu').show();
			}, 300);
		}

		nolevel = false;
		goingback = false;
	//}, 100);
	aligner = _this;
	plus = _plus;

	//alert( jQuery(window).height() );
}

function reposition() {
	setTimeout(function () {
		if (LATEST != aligner) {
			jQuery(LATEST).removeClass('open').removeClass('hide').remove();
		}
		
		$('#loading').removeClass('loading');
		setTimeout(function () {
			$('#loading').css('display','none');
		}, 200);
		
		var c = jQuery('.open').attr('id');
		
		jQuery('.menu').removeClass( 'selected' );
		
		jQuery('.menu').each(function(){
			if(jQuery( this ).attr('data-page') == c){
				jQuery( this ).addClass( 'selected' );
			}
		});
		
	}, 400);
}

function hideMenu() {
	if (jQuery('#menu').hasClass('active')) {
		jQuery('#menu').removeClass('active');
		jQuery('#themenu').removeClass('show');
		jQuery('.topbar, .bottombar, ' + aligner).removeClass('showmenu');
		$('.toclose').hide();
	}
	
	if (jQuery('.filter').hasClass('active')) {
		jQuery('.filter').removeClass('active');
		jQuery('#thefilter').removeClass('show');
		jQuery('.topbar, .bottombar, ' + aligner).removeClass('showmenu');
		$('.toclose').hide();
	}
	

	////console.log( LATEST );
}

$(window).load(function () {
	setTimeout(function () {

		offset = jQuery('#topbar').height();
		bbar = jQuery('#bottombar').height();
		offset = jQuery('.topbar').height();

		resizeby('#frontpage', 105);
		$('body').addClass('fadeIn');

		LATEST = '#' + $('.open').attr('id');

	}, 800);	
});

function afterTeleport(where, extra) {
	
	switch (where) {
		case 'frontpage':
			app.initLogin(where);
			//alert('ok');
			$('#topbar').css('top', '0px');
			break;
		case 'login':
			app.initLogin(where);
			break;
		case 'homepage':
			app.initHome();
			break;
		case 'lisandid':
			if(!packs.offers.length)
				$('.treenerpakkumisedbtn').hide();
			break;
		case 'soodustused':
			app.getFitshop(false);
			break;
		case 'treenerpakkumised':
			app.getFitshop(true);
			break;
		case 'harjutused':
			app.loadExercisePage();
			break;
		case 'harjutused_subpage1':
			app.loadExercises();
			break;
		case 'video':
			app.parseExercise(extra);
			break;
		case 'kavade_ostmine':
			app.initPackageBuying(1);
			break;
		case 'vali_kava':
			app.initPackageBuying(2);
			break;
		case 'minuandmed':
			app.parseUserDetails();
			break;
		case 'ostetud':
			packs.getMain();
			break;
		case 'diary':
			packs.getDiary();
			break;
		case 'diary_detail':
			packs.getDiaryDetail(extra);
			break;
		
		case 'uustreening':
			trainings.getTrainingsMain();
			break;
		case 'treening_naidiskavad':
			trainings.getTrainings(extra);
			break;
		case 'treening_naidiskava':
			trainings.getTraining(extra);
			break;
		case 'treening_naidiskavad_1paev':
			trainings.getTrainingsDetail(extra);
		case 'treening_naidiskavad_1paev_nXn':
			trainings.getTrainingsExercise(extra);
			break;
		case 'toitumiskavad':
			nutritions.getNutritionsMain();
			break;
		case 'naidiskavad':
			nutritions.getNutritions(extra);
			break;
		case 'toitumisplaan1':
			nutritions.getNutrition(extra);
			break;
		case 'menuu1_hommikusook1':
			nutritions.getNutritionDetail(extra);
			break;
			
		
		case 'profile':
			app.loadProfile();
			break;
		case 'alusta_laadimist':
			app.initVideosDownload();
			break;
		case 'seaded':
			app.initSettings();
			break;
			
		case 'fitnesstest':
			app.initTestQuestions();
			break;
		case 'tavatest':
			app.initTest();
			break;
		
		case 'teated':
			app.getNotifications();
			break;
		case 'teated_detail':
			app.getNotificationDetail(extra);
			break;
		/*
		* huge stuff gathering here..
		*/
		
	}
	app.replaceWords();
}

function hideallexcept(_this, caller) {

	if ($(caller).data('level')) {
		LEVEL = $(caller).data('level');
		$('#topbar .backbtn').attr('data-deep', LEVEL);
	}

	LATEST = '#' + $('.open').attr('id');
	//alert(LATEST);
	if (LATEST != _this) {
		$(LATEST).addClass('hide');
	}

	$('#menu').removeClass('active');
	$('#themenu').removeClass('show');
	$('.topbar, .bottombar, ' + aligner).removeClass('showmenu');

}

function addHover(__this){
	var _this = __this;	
	$(_this).addClass('active');
	setTimeout(function () {
		$(_this).removeClass('active')
	}, 1000);
}

function goBack(_this, caller) {

	//LEVEL = $(caller).data('level');
	LEVEL = $('#topbar .backbtn').attr('data-deep');

	var LATESTBackup = LATEST;
	LATEST = aligner;

	//$(aligner).addClass('hide');

	/* setTimeout(function () {
		$(LATEST).removeClass('open').removeClass('hide').remove();
	}, 300); */
	hideMenu()
	aligner = LATESTBackup;

}

function teleportMe( where, extra ){
	//if(updating){
	
	//console.log(where + ' - ' + extra);
	
		LATEST = '#' + $('.open').attr('id');

		if (LATEST != '#' + where) {
			showLoading();
			
			$('#topbar .backbtn').attr('data-deep', LEVEL);
			//console.log('cmon..');
			$.get('templates/' + where + '.html',{ "_": $.now() }, function(data){
				$(data).insertAfter( LATEST )
				
				jQuery('.centered').css('top', offset + 'px');
				resizeby('#' + where, 105);
				
				////console.log(LATEST);
				
				$(LATEST).addClass('hide');
				
				setTimeout(function () {
					
				
					$('#' + where).addClass('open');
					
					////console.log(LEVEL);
					
					if ( LEVEL >= '1' ){
						setTimeout(function() {
							$('.bottombar, .topbar').addClass('menuin');
						}, 1000);
						
					} else {
						$('.bottombar, .topbar').removeClass('menuin');
					}
					
					

					reposition();
					
					hideMenu();
					
					bindEvents();
					
					updating = false;
						
					if(trainings.doingExercise) {
						console.log($('.toscroll').find('.kestus').length);
						console.log($('.toscroll').find('.kestus').html());
						if(!$('.toscroll').find('.kestus').length) {
							$('.toscroll').prepend('<section class="kestus"><span>Kogu treeningu kestus: <strong class="dayTimer">00:00</strong></span></section>');
							
						}
						setTimeout(function() {
							$('.kestus').slideDown();
						}, 1000);
					}
					afterTeleport(where, extra);
					
				}, 20);

			});
			
		// if category sorting..
		} else if ((extra && extra.refresh) || where == 'menuu1_hommikusook1' || where == 'treening_naidiskavad_1paev_nXn') {
			//console.log('REFRESH');
			showLoading();
			//console.log(extra);
			afterTeleport(where, extra);
			
			setTimeout(function () {
				reposition();
						
				hideMenu();
				
				bindEvents();
				
				updating = false;
			}, 100);
			
		} else {
			hideMenu();
		}
		
	//}  /* updating */
}

function showLoading(){
	$('#loading').css('display','block');
	setTimeout(function () {
		$('#loading').addClass('loading');
	}, 10);
}

function bindEvents() {
	
	////console.log('binding..');
	
	//$('textarea').autoResize();
	
	////console.log('binding this shit..');
	
	

	////console.log('binding this shit still..');

	$('.teleport').unbind(eventEnd).bind(eventEnd, function (e) {
		e.preventDefault();
		
		addHover( this );
		
		//updating = true;
				
		//$('.menu').removeClass('active');
		
		var where = $(this).attr('data-page');
		
		var LEV = $(this).attr('data-level');
		if( LEV != 'none' ) {
			LEVEL = LEV;
		}else{
			nolevel = true;
		}
		
		////console.log(LEVEL);
		
		var extra = {};
		
		if ($(this).data('extra_id'))
			extra.extra_id = $(this).data('extra_id');
		
		
		$('#buyoverlay').remove();
		$('#minuandmed').remove();
			
		
		if (where == 'tavatest') {
			if(user.sex && user.age)
				teleportMe( 'fitnesstest', extra );
		} else if (where == 'lisandid') {
			if(!app.specialOffers)
				teleportMe( 'soodustused', extra );
		} else {
			teleportMe( where, extra );
		}
		

	});
	
	////console.log('binding this shit over..');

	$('.filter').unbind(eventEnd).bind(eventEnd, function (e) {
		e.preventDefault();
		
		////console.log('filter');

		if (!$(this).hasClass('active')) {
			$(this).addClass('active');
			$('#thefilter').addClass('showR');
			$('.topbar, .bottombar, ' + aligner).addClass('showmenuR');
			//$('.toclose').show();
		} else {
			$(this).removeClass('active');
			$('#thefilter').removeClass('showR');
			$('.topbar, .bottombar, ' + aligner).removeClass('showmenuR');
			//$('.toclose').hide();
			extra = {};
			extra.refresh = true;
			teleportMe($('.open').attr('id'), extra);
			hideMenu();
		}
		
		
		
	});


$('#svgFront g').unbind(eventEnd).bind(eventEnd, function (e) {
	////console.log(this);
	var id = $(this).attr("data-group");
	var classes = $(this).attr("class");
	var name =  $(this).attr("data-name");
	
	var hasclass = classes.replace( "group" + id + " ", '');
	
	//console.log( id, classes, hasclass );
	
	
	if( hasclass != "pathOver" ){
		$('#svgFront g').each(function(){
			var clas = $(this).attr("class");
			$(this).attr("class", clas.replace(' pathOver',''));
		});
		
		$('#svgFront .group' + id).attr("class", "group" + id + " pathOver");
		
		$('.lihasname, #harjutused .me h3').text( name );
	}else{
		$('#svgFront .group' + id).attr("class", "group" + id);
		
		$('.lihasname').text( 'Vali lihasgrupp' );
		$('#harjutused .me h3').text('HARJUTUSED');
	}
	
	app.muscleGroup = $(this).data("muscle");
	if (LEVEL != 2)
		app.exerciseCat = 0;
	LEVEL = 2;
	setTimeout(function() {
		
	}, 400);
	
})

$('#svgBack g').unbind(eventEnd).bind(eventEnd, function (e) {
	////console.log(this);
	var id = $(this).attr("data-group");
	var classes = $(this).attr("class");
	var name =  $(this).attr("data-name");
	
	var hasclass = classes.replace( "group" + id + " ", '');
	
	////console.log( id, classes, hasclass );
	
	
	if( hasclass != "pathOver" ){
		$('#svgBack g').each(function(){
			var clas = $(this).attr("class");
			$(this).attr("class", clas.replace(' pathOver',''));
		});
		
		$('#svgBack .group' + id).attr("class", "group" + id + " pathOver");
		
		$('.lihasname, #harjutused .me h3').text( name );
	}else{
		$('#svgBack .group' + id).attr("class", "group" + id);
		
		$('.lihasname').text( 'Vali lihasgrupp' );
		$('#harjutused .me h3').text('HARJUTUSED');
	}
	
	app.muscleGroup = $(this).data("muscle");
	if (LEVEL != 2)
		app.exerciseCat = 0;
	LEVEL = 2;
	setTimeout(function() {
		/*$('.filter').click();
		*/
	}, 400);
	
	
})

$('.resetfilter').unbind(eventEnd).bind(eventEnd, function (e) {
		$('#svgFront g').each(function(){
			var clas = $(this).attr("class");
			$(this).attr("class", clas.replace(' pathOver',''));
		});
		
		app.muscleGroup = false;
		
		//console.log('ok');
		
		$('#svgBack g').each(function(){
			var clas = $(this).attr("class");
			$(this).attr("class", clas.replace(' pathOver',''));
		});

		$('.lihasname').text( 'Vali lihasgrupp' );
		$('#harjutused .me h3').text('HARJUTUSED');
		
		addHover( this );
		
});


$('.manFlip').unbind(eventEnd).bind(eventEnd, function (e) {
		//manfront
		//manback
		
		if( $('.manback').hasClass('manhide') ){
			$('.manfront, #frontOver').addClass('manhide');
			
			$('#svgFront g').each(function(){
				var clas = $(this).attr("class");
				$(this).attr("class", clas.replace(' pathOver',''));
			});
			
			setTimeout( function(){
				$('.manback, #backOver').removeClass('manhide');
			}, 5);
			
		}else{
			$('.manback, #backOver').addClass('manhide');
			
			$('#svgBack g').each(function(){
				var clas = $(this).attr("class");
				$(this).attr("class", clas.replace(' pathOver',''));
			});
			
			setTimeout( function(){
				$('.manfront, #frontOver').removeClass('manhide');
			}, 5);
		}

		$('.lihasname').text( 'Vali lihasgrupp' );
});



	$('.selectbtn1 img').unbind(eventEnd).bind(eventEnd, function (e) {
		//e.preventDefault();
		
		
		if (!$(this).parent().parent().hasClass('selected')) {
			$('.selectbtn1').removeClass('selected');
		
			$(this).parent().parent().addClass('selected');
			
		} else {
			$(this).parent().parent().removeClass('selected');
			
		}
	
	});
	
	$('.detailsbtn').unbind(eventEnd).bind(eventEnd, function (e) {
		//e.preventDefault();
		addHover( this );
		
		$('#overlay').addClass('scale');
		setTimeout(function () {
			$('#overlay').addClass('scaleIn');
		}, 100);
	});
	
	$('.selectivebtn').unbind(eventEnd).bind(eventEnd, function (e) {
		//e.preventDefault();
		
		$('#selectiveoverlay').addClass('scale');
		setTimeout(function () {
			$('#selectiveoverlay').addClass('scaleIn');
		}, 100);
	});
	
	/*$('.theicon').unbind(eventEnd).bind(eventEnd, function (e) {
		//e.preventDefault();
		
		$('#yesnooverlay').addClass('scale');
		setTimeout(function () {
			$('#yesnooverlay').addClass('scaleIn');
		}, 100);
	});*/
	
	$('.bagbtn').unbind(eventEnd).bind(eventEnd, function (e) {
		//e.preventDefault();
		
		var where = $(this).attr('data-bag');
		
		$('#ajaxoverlay').addClass('scale');
		setTimeout(function () {
			$.get('templates/' + where + '.html',{ "_": $.now() }, function(data){

				$('#ajaxoverlay .mybag').html(data);
				$('#ajaxoverlay').addClass('scaleIn');
				bindEvents();
			});

			
		}, 100);
	});
	
	
	$('.overlay .backbtn').unbind(eventEnd).bind(eventEnd, function (e) {
		e.preventDefault();
		
		////console.log('a');

		$(this).parent().addClass('scaleOut');
		//$(this).parent().removeClass('scaleIn');
		
		$('.buybtn').removeClass('scaleIn');
		$('.voucher').hide();
		
		var _this = $(this);
		var id = _this.parent().attr('id');

		setTimeout(function () {
			//_this.parent().removeClass('scale').removeClass('prepare');
			_this.parent().removeClass('scaleIn').removeClass('scaleOut');
			//_this.parent().removeClass('scaleOut');
			setTimeout(function () {
				_this.parent().removeClass('scale');
			}, 50);
			if(id == 'caruseloverlay'){
				$('.result-text').hide();
				$('.tulemus, .results').removeClass('anim_in');
				$('.carusel .normal').removeClass('anim_' + anim + '0');
				$('.carusel-texts').removeClass('anim_' + anim + '0');
			}
			
			if(id == 'ajaxoverlay'){
				$('#ajaxoverlay .mybag').html('');
			}
			
		}, 350);
	});
	
	$('.overlay .closebtn, .overlay .closingbtn').unbind(eventEnd).bind(eventEnd, function (e) {
		e.preventDefault();
		
		addHover( this );

		$(this).parent().parent().addClass('scaleOut');
		//$(this).parent().removeClass('scaleIn');

		var _this = $(this);

		setTimeout(function () {
			//_this.parent().removeClass('scale').removeClass('prepare');
			_this.parent().parent().removeClass('scaleIn').removeClass('scaleOut');
			//_this.parent().removeClass('scaleOut');
			setTimeout(function () {
				_this.parent().parent().removeClass('scale');
			}, 50);
			
		}, 350);
	});
	
	
	
	$('.soovitusedbtn, .alternatiivbtn').unbind(eventEnd).bind(eventEnd, function (e) {
	
		if( !$(this).hasClass('active') ){
			$(this).addClass('active') 
			$('.popup').removeClass('pophide');
			setTimeout(function(){
				$('.popup').addClass('popshow');
			}, 100);
		}else{
			$(this).removeClass('active') 
			$('.popup').removeClass('popshow');
			setTimeout(function(){
				$('.popup').addClass('pophide');
			}, 300);
		}
	
	});
	
	
	
	
	$('.touchhover').on('touchstart', function(e){
		e.preventDefault();
		$(this).addClass('hover');
	});

	$('.touchhover').on('touchend', function(e){
		e.preventDefault();
		$(this).removeClass('hover');
	});
} /* bindEvents */

function hideKeyBoard() {
	
	var field = document.createElement('input');
	field.setAttribute('type', 'text');
	field.setAttribute('style', 'position:absolute;top:0;');
	document.body.appendChild(field);
	
	setTimeout(function() {
	    field.focus();
	    setTimeout(function() {
	        field.setAttribute('style', 'display:none;');
	    }, 50);
	}, 50);
	
}

(function ($) {
	$(document).ready(function () {

		$('#topbar .backbtn').bind(eventEnd, function (e) {
			e.preventDefault();
			
			addHover(this);
			
			showLoading();

			goingback = true;

			var d = $('#topbar .backbtn').attr('data-deep');

			if (d) {

				////console.log(d);
				newLATEST = $('#topbar .backbtn').attr('data-deep' + d);
				
				
					
				$('.menu').removeClass('active');
				
				//$(newLATEST).addClass('open');

				$('#topbar .backbtn').attr('data-deep' + d, '');
				d = Number(d) - Number(1);
				$('#topbar .backbtn').attr('data-deep', d);

				goBack(LATEST, this);
				
				newLATESTnohash = newLATEST.replace('#','');
				
				////console.log('newLATEST > ' + newLATEST);
				
				teleportMe( newLATESTnohash, {} );

				//$('.bottombar, .topbar').addClass('menuin');
				//resizeby(newLATEST, 105);

				////console.log(d, newLATEST, LEVEL);

				//LEVEL = d ;

			} else {

				$('.menu').removeClass('active');
				$(LATEST).addClass('open');
				goBack(LATEST, this);

				$('.bottombar, .topbar').addClass('menuin');
				resizeby(LATEST, 105);
				//reposition();
			}
		});

		$('#menu').on(eventEnd, function (e) {
			e.preventDefault();

			if (!$(this).hasClass('active')) {
				$(this).addClass('active');
				$('#themenu').addClass('show');
				$('.topbar, .bottombar, ' + aligner).addClass('showmenu');
				$('.toclose').show();

			} else {
				$(this).removeClass('active');
				$('#themenu').removeClass('show');
				$('.topbar, .bottombar, ' + aligner).removeClass('showmenu');
				$('.toclose').hide();
				
				
					if (jQuery('.filter').hasClass('active')) {
						jQuery('.filter').removeClass('active');
						jQuery('#thefilter').removeClass('showR');
						jQuery('.topbar, .bottombar, ' + aligner).removeClass('showmenuR');
					}
			}
			
		});
		$('.toclose').on(eventEnd, function (e) {
			e.preventDefault();

			if ($('#menu').hasClass('active')) {
				$('#menu').removeClass('active');
				$('#themenu').removeClass('show');
				$('.topbar, .bottombar, ' + aligner).removeClass('showmenu');
				$('.toclose').hide();
			}
				
			if (jQuery('.filter').hasClass('active')) {
				jQuery('.filter').removeClass('active');
				jQuery('#thefilter').removeClass('showR');
				jQuery('.topbar, .bottombar, ' + aligner).removeClass('showmenuR');
				$('.toclose').hide();
			}
			
			
		});
		

		$('body').on('swipe', function(e, Dx, Dy) {
		
			//console.log($(e.currentTarget));
			
			if(($('#teated') && $('#teated').html()) || ($('#treening_naidiskavad') && $('#treening_naidiskavad').html()))
				return true;
				
			if(Dx == -1) {
				if(LEVEL >= 1){
					var diaryscroll = $('.filter').length;
		
					
					if ( diaryscroll && !jQuery('.filter').hasClass('active') &&  !$('#menu').hasClass('active') ) {
						jQuery('.filter').addClass('active');
						jQuery('#thefilter').addClass('showR');
						jQuery('.topbar, .bottombar, ' + aligner).addClass('showmenuR');
						$('.toclose').show();
					}else{
						$('#menu').removeClass('active');
						$('#themenu').removeClass('show');
						$('.topbar, .bottombar, ' + aligner).removeClass('showmenu');
						$('.toclose').hide();
					}
				}
			} else if(Dx == 1) {
				if(LEVEL >= 1){
					
					
					if ( jQuery('.filter').hasClass('active') ) {
						jQuery('.filter').removeClass('active');
						jQuery('#thefilter').removeClass('showR');
						jQuery('.topbar, .bottombar, ' + aligner).removeClass('showmenuR');
						$('.toclose').hide();
					}else{
						$('#menu').addClass('active');
						$('#themenu').addClass('show');
						$('.topbar, .bottombar, ' + aligner).addClass('showmenu');
						$('.toclose').show();
					}
				}
			}
		});
		
		bindEvents();

	});
	
	function playVideo(_this){
		_this.play();
		_this.webkitEnterFullscreen();
	}
	
})(window.jQuery);

