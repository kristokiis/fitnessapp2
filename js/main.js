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

	console.log(jQuery(window).width() + 'px');
	
	//console.log( window.outerHeight, jQuery(window).height() );
});


function resizeby(_this, _plus) {

	me = jQuery(_this + ' .me').height();

	//wind = Number(wind) - Number(iofsett);
	var toscrollheight = Number(wind - (offset + me + bbar));
	//console.log(newheight , toscrollheight);
	
	
	jQuery('.page-wrap').css('height', wind + 'px');
	//setTimeout(function () {
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
	

	//console.log( LATEST );
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
			break;
		case 'login':
			app.initLogin(where);
			break;
		case 'homepage':
			app.parseUser();
			break;
		case 'soodustused':
			app.getFitshop();
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
	
		LATEST = '#' + $('.open').attr('id');

		if (LATEST != '#'+where) {
			showLoading();
			
			$('#topbar .backbtn').attr('data-deep', LEVEL);
			
			$.get('templates/' + where + '.html',{ "_": $.now() }, function(data){
				$(data).insertAfter( LATEST )
				
				jQuery('.centered').css('top', offset + 'px');
				resizeby('#' + where, 105);
				
				//console.log(LATEST);
				
				$(LATEST).addClass('hide');
				
				setTimeout(function () {
					
				
					$('#' + where).addClass('open');
					
					//console.log(LEVEL);
					
					if ( LEVEL >= '1' ){
						$('.bottombar, .topbar').addClass('menuin');
					} else {
						$('.bottombar, .topbar').removeClass('menuin');
					}
					
					

					reposition();
					
					hideMenu();
					
					bindEvents();
					
					updating = false;
					
					afterTeleport(where, extra);
					
				}, 20);

			});
			
		// if category sorting..
		} else if (extra && extra.refresh) {
			console.log('REFRESH');
			showLoading();
			
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
		
	var diaryscroll = $('#diaryscroll').length;
	if(diaryscroll){
		var scroll = new iScroll('diaryscroll');
		scroll.enableStickyHeaders('h4');
	}


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
		
		//console.log(LEVEL);
		
		var extra = {};
		
		if ($(this).data('extra_id'))
			extra.extra_id = $(this).data('extra_id');
		
		teleportMe( where, extra );

	});

	$('.filter').unbind(eventEnd).bind(eventEnd, function (e) {
		e.preventDefault();
		
		//console.log('filter');

		if (!$(this).hasClass('active')) {
			$(this).addClass('active');
			$('#thefilter').addClass('showR');
			$('.topbar, .bottombar, ' + aligner).addClass('showmenuR');
			$('.toclose').show();
		} else {
			$(this).removeClass('active');
			$('#thefilter').removeClass('showR');
			$('.topbar, .bottombar, ' + aligner).removeClass('showmenuR');
			$('.toclose').hide();
			hideMenu();
		}
		
		
		
	});


$('#svgFront g').unbind(eventEnd).bind(eventEnd, function (e) {
	//console.log(this);
	var id = $(this).attr("data-group");
	var classes = $(this).attr("class");
	var name =  $(this).attr("data-name");
	
	var hasclass = classes.replace( "group" + id + " ", '');
	
	console.log( id, classes, hasclass );
	
	
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
		$('.filter').click();
		extra = {};
		extra.refresh = true;
		teleportMe('harjutused_subpage1', extra);
	}, 400);
	
})

$('#svgBack g').unbind(eventEnd).bind(eventEnd, function (e) {
	//console.log(this);
	var id = $(this).attr("data-group");
	var classes = $(this).attr("class");
	var name =  $(this).attr("data-name");
	
	var hasclass = classes.replace( "group" + id + " ", '');
	
	//console.log( id, classes, hasclass );
	
	
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
		$('.filter').click();
		extra = {};
		extra.refresh = true;
		teleportMe('harjutused_subpage1', extra);
	}, 400);
	
	
})

$('.resetfilter').unbind(eventEnd).bind(eventEnd, function (e) {
		$('#svgFront g').each(function(){
			var clas = $(this).attr("class");
			$(this).attr("class", clas.replace(' pathOver',''));
		});
		
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
	
	$('.theicon').unbind(eventEnd).bind(eventEnd, function (e) {
		//e.preventDefault();
		
		$('#yesnooverlay').addClass('scale');
		setTimeout(function () {
			$('#yesnooverlay').addClass('scaleIn');
		}, 100);
	});
	
	$('.bagbtn').unbind(eventEnd).bind(eventEnd, function (e) {
		//e.preventDefault();
		
		var where = $(this).attr('data-bag');
		
		$('#ajaxoverlay').addClass('scale');
		setTimeout(function () {
			$.get(where + '.html',{ "_": $.now() }, function(data){

				$('#ajaxoverlay .mybag').html(data);
				$('#ajaxoverlay').addClass('scaleIn');
				bindEvents();
			});

			
		}, 100);
	});
	
	$('.overlay .backbtn').unbind(eventEnd).bind(eventEnd, function (e) {
		e.preventDefault();

		$(this).parent().addClass('scaleOut');
		//$(this).parent().removeClass('scaleIn');

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
				$('.tulemus, .results').removeClass('anim_in');
				$('.carusel .normal').removeClass('anim_' + anim + '0');
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
	
	$('.answer input').unbind('focus').bind('focus', function (e) {
		$('.tulemusbtn').unbind(eventEnd);
	});

	$('.answer input').unbind('blur').bind('blur', function (e) {
		$('.tulemusbtn').unbind(eventEnd).bind(eventEnd, function (e) {
		//e.preventDefault();
		
			var n = $(this).attr('data-result');
			var r = $('#tulemusinput' + n).val();
			r = Number(r);
				//console.log(n, r);
				if(r && r < 101){
			
		
					$('#caruseloverlay').addClass('scale');
					setTimeout(function () {
							$('#caruseloverlay').addClass('scaleIn');
					}, 100);
					
					var newresult = Number(TOTALRESULT) + Number(r);
					
					TOTALRESULT = newresult.toFixed(0);
					
					if(r > 70) {
						anim = '7';
						tulemus = 'Suurepärane';
					}
					if(r < 70) {
						anim = '6';
						tulemus = 'hea';
					}
					if(r < 60) {
						anim = '5';
						tulemus = 'ülekeskmine';
					}
					if(r < 50){
						 anim = '4';
						 tulemus = 'Keskmine';
					}
					if(r < 40) {
						anim = '3';
						tulemus = 'alla keskmise';
					}
					if(r < 30) {
						anim = '2';
						tulemus = 'nõrk';
					}
					if(r < 10) {
						anim = '1'; 
						tulemus = 'Väga nõrk';
					}
					
					//console.log(n, r, anim);
					
					setTimeout(function(){
						$('.carusel .normal').addClass('anim_' + anim + '0');
						$('.carusel .greentriangle').attr('src', 'i/tulemus' + anim + '.png');
						$('.result span').text( tulemus );
					}, 500);

					setTimeout(function(){
						$('.tulemus, .results').addClass('anim_in');
					}, 5000);
					
					
					if(n == '5'){
						setTimeout(function(){
							
							$('#caruselTOTALoverlay .finalresults h3').text(TOTALRESULT + ' p');
						
							$('#caruselTOTALoverlay').addClass('scale');
							setTimeout(function () {
									$('#caruselTOTALoverlay').addClass('scaleIn');
							}, 100);
						}, 7000);
					}
					
					addHover( this );
			
			}

	});
	});
	
	
	
	$('.times .plus').unbind(eventEnd).bind(eventEnd, function (e) {
		var par = $(this).parent();
		var max = 7;
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
			par.children('span').text( Number(current) + Number(5) );
		}
	
		//console.log( par.children('span').text() );
	});
	
	$('.weight .minus').unbind(eventEnd).bind(eventEnd, function (e) {
	
		var par = $(this).parent();
		var min = 15;
		var current = par.children('span').text();
		
		if(current >= min){
			par.children('span').text( Number(current) - Number(5) );
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

(function ($) {
	$(document).ready(function () {

		$('#topbar .backbtn').bind(eventEnd, function (e) {
			e.preventDefault();
			
			addHover(this);
			
			showLoading();

			goingback = true;

			var d = $('#topbar .backbtn').attr('data-deep');

			if (d) {

				//console.log(d);
				newLATEST = $('#topbar .backbtn').attr('data-deep' + d);
				
				
					
				$('.menu').removeClass('active');
				
				//$(newLATEST).addClass('open');

				$('#topbar .backbtn').attr('data-deep' + d, '');
				d = Number(d) - Number(1);
				$('#topbar .backbtn').attr('data-deep', d);

				goBack(LATEST, this);
				
				newLATESTnohash = newLATEST.replace('#','');
				
				//console.log('newLATEST > ' + newLATEST);
				
				teleportMe( newLATESTnohash, {} );

				//$('.bottombar, .topbar').addClass('menuin');
				//resizeby(newLATEST, 105);

				//console.log(d, newLATEST, LEVEL);

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
		

		$('body').touchwipe({
			wipeLeft : function () {
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
			},
			wipeRight : function () {
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
			},
			//wipeUp: function() { alert("up"); },
			//wipeDown: function() { alert("down"); },
			min_move_x : 24,
			min_move_y : 24,
			preventDefaultEvents : false
		});
		
		bindEvents();

	});
	
	function playVideo(_this){
		_this.play();
		_this.webkitEnterFullscreen();
	}
	
})(window.jQuery);

