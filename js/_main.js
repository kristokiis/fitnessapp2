var LATEST = '';
var SUBLATEST = '';
var LEVEL = 0;
var aligner = '#frontpage';
var plus = 0;
var last = "";
var arr = new Array();
var offset = jQuery('.topbar').height();
var me = "";
var bbar = "";
var wind = jQuery(window).height();
var toBuy = new Array();
var eventEnd = (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) ? "touchend" : "click";
var goingback = false;

jQuery(window).resize(function ($) {

	offset = jQuery('.topbar').height();
	jQuery('.centered').css('top', offset + 'px');
	//jQuery('.page-wrap').css('height', Number(jQuery(aligner).height() + plus) +  'px');

	console.log(jQuery(window).width() + 'px');
});

function resizeby(_this, _plus) {

	me = jQuery(_this + ' .me').height();

	var toscrollheight = Number(wind - (offset + me + bbar));
	//console.log(newheight , toscrollheight);

	jQuery('.centered').css('top', offset + 'px');
	jQuery('.page-wrap').css('height', wind + 'px');
	setTimeout(function () {
		jQuery('.toscroll').css('height', toscrollheight + 'px');

		if (LEVEL >= 2) {
			$('#topbar .backbtn').show();
			$('#menu').hide();
			if (!goingback)
				$('#topbar .backbtn').attr('data-deep' + LEVEL, LATEST);

		} else {
			$('#topbar .backbtn').hide();
			$('#menu').show();
		}

		goingback = false;
	}, 400);
	aligner = _this;
	plus = _plus;

}

function reposition() {
	setTimeout(function () {
		//jQuery('.loading').hide();
		//for(var i=1; i < arr.length; i++){
		//jQuery('#'+arr[i]).removeClass('open').removeClass('hide');
		//}
		if (LATEST != aligner) {
			jQuery(LATEST).removeClass('open').removeClass('hide');
		}
		hideMenu();
	}, 500);
}

function hideMenu() {
	if (jQuery('#menu').hasClass('active')) {
		jQuery('#menu').removeClass('active');
		jQuery('#themenu').removeClass('show');
		jQuery('.topbar, .bottombar, ' + aligner).removeClass('showmenu');
	}
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

(function ($) {
	$(document).ready(function () {

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

		function goBack(_this, caller) {

			//LEVEL = $(caller).data('level');
			LEVEL = $('#topbar .backbtn').attr('data-deep');

			var LATESTBackup = LATEST;
			LATEST = aligner;

			$(aligner).addClass('hide');

			setTimeout(function () {
				$(LATEST).removeClass('open').removeClass('hide');
			}, 300);
			hideMenu()
			aligner = LATESTBackup;

		}

		$('#topbar .backbtn').on(eventEnd, function (e) {
			e.preventDefault();

			goingback = true;

			var d = $('#topbar .backbtn').attr('data-deep');

			if (d) {

				console.log(d);
				var newLATEST = $('#topbar .backbtn').attr('data-deep' + d);

				$('.menu').removeClass('active');
				$(newLATEST).addClass('open');

				$('#topbar .backbtn').attr('data-deep' + d, '');
				d = Number(d) - Number(1);
				$('#topbar .backbtn').attr('data-deep', d);

				goBack(LATEST, this);

				$('.bottombar, .topbar').addClass('menuin');
				resizeby(newLATEST, 105);

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

			} else {
				$(this).removeClass('active');
				$('#themenu').removeClass('show');
				$('.topbar, .bottombar, ' + aligner).removeClass('showmenu');
			}
		});

		$('body').touchwipe({
			wipeLeft : function () {
				$('#menu').removeClass('active');
				$('#themenu').removeClass('show');
				$('.topbar, .bottombar, ' + aligner).removeClass('showmenu');
			},
			wipeRight : function () {
				$('#menu').addClass('active');
				$('#themenu').addClass('show');
				$('.topbar, .bottombar, ' + aligner).addClass('showmenu');
			},
			//wipeUp: function() { alert("up"); },
			//wipeDown: function() { alert("down"); },
			min_move_x : 15,
			min_move_y : 15,
			preventDefaultEvents : false
		});

		$('.logo').on(eventEnd, function (e) {
			e.preventDefault();
			$('.menu').removeClass('active');
			$(this).addClass('active');

			hideallexcept('#frontpage', this);
			$('#frontpage').addClass('open');

			$('.bottombar, .topbar').removeClass('menuin');

			//$('.loading').show();

			resizeby('#frontpage', 105);

			reposition();

		});

		$('.fb, .homebtn').on(eventEnd, function (e) {
			e.preventDefault();
			$('.menu').removeClass('active');
			$(this).addClass('active');

			hideallexcept('#index', this);
			$('#index').addClass('open');

			$('.bottombar, .topbar').addClass('menuin');

			//$('.loading').show();

			resizeby('#index', 105);

			reposition();

		});

		$('.acc').on(eventEnd, function (e) {
			e.preventDefault();
			$('.menu').removeClass('active');
			$(this).addClass('active');

			hideallexcept('#login', this);
			$('#login').addClass('open');

			//$('.loading').show();

			resizeby('#login', 105);

			reposition();

		});

		$('.diarybtn').on(eventEnd, function (e) {
			e.preventDefault();
			$('.menu').removeClass('active');
			$(this).addClass('active');

			hideallexcept('#diary', this);
			$('#diary').addClass('open');

			//$('.loading').show();

			resizeby('#diary', 105);

			reposition();
		});

		$('.pakkumisedbtn').on(eventEnd, function (e) {
			e.preventDefault();
			$('.menu').removeClass('active');
			$(this).addClass('active');

			hideallexcept('#pakkumised', this);
			$('#pakkumised').addClass('open');

			//$('.loading').show();

			resizeby('#pakkumised', 105);

			reposition();
		});

		$('.soodustusedbtn').on(eventEnd, function (e) {
			e.preventDefault();
			$('.menu').removeClass('active');
			$(this).addClass('active');

			hideallexcept('#soodustused', this);
			$('#soodustused').addClass('open');

			//$('.loading').show();

			resizeby('#soodustused', 105);

			reposition();
		});

		$('.lisandidbtn').on(eventEnd, function (e) {
			e.preventDefault();
			$('.menu').removeClass('active');
			$(this).addClass('active');

			hideallexcept('#lisandid', this);
			$('#lisandid').addClass('open');

			//$('.loading').show();

			resizeby('#lisandid', 105);

			reposition();
		});

		$('.treenerpakkumisedbtn').on(eventEnd, function (e) {
			e.preventDefault();
			$('.menu').removeClass('active');
			$(this).addClass('active');

			hideallexcept('#treenerpakkumised', this);
			$('#treenerpakkumised').addClass('open');

			//$('.loading').show();

			resizeby('#treenerpakkumised', 105);

			reposition();
		});

		$('.testbtn').on(eventEnd, function (e) {
			e.preventDefault();
			$('.menu').removeClass('active');
			$(this).addClass('active');

			hideallexcept('#test', this);
			$('#test').addClass('open');

			//$('.loading').show();

			resizeby('#test', 105);

			reposition();
		});

		$('.alustatreeningutbtn').on(eventEnd, function (e) {
			e.preventDefault();
			$('.menu').removeClass('active');
			$(this).addClass('active');

			hideallexcept('#alustatreeningut', this);
			$('#alustatreeningut').addClass('open');

			//$('.loading').show();

			resizeby('#alustatreeningut', 105);

			reposition();
		});

		$('.tavatestbtn').on(eventEnd, function (e) {
			e.preventDefault();
			$('.menu').removeClass('active');
			$(this).addClass('active');

			hideallexcept('#tavatest', this);
			$('#tavatest').addClass('open');

			//$('.loading').show();

			resizeby('#tavatest', 105);

			reposition();
		});

		$('.meesbtn, .nainebtn').on(eventEnd, function (e) {
			e.preventDefault();
			$('.menu').removeClass('active');
			$(this).addClass('active');

			hideallexcept('#fitnesstest', this);
			$('#fitnesstest').addClass('open');

			//$('.loading').show();

			resizeby('#fitnesstest', 105);

			reposition();
		});

		$('.selectbtn img').on(eventEnd, function (e) {
			//e.preventDefault();
			var id = $(this).parent().parent().data('id');
			if (!$(this).parent().parent().hasClass('selected')) {
				$(this).parent().parent().addClass('selected');
				toBuy.push(id);
			} else {
				$(this).parent().parent().removeClass('selected');
				while (toBuy.indexOf(id) !== -1) {
					toBuy.splice(toBuy.indexOf(id), 1);
				}
			}
			if (toBuy.length >= 1) {
				$('.buybtn').addClass('slideIn');
			} else {
				$('.buybtn').removeClass('slideIn');
			}
			//console.log(toBuy.length);
		});

		$('.buybtn').on(eventEnd, function (e) {
			//e.preventDefault();

			$('#buyoverlay').addClass('prepare').addClass('scale');
			setTimeout(function () {
				$('#buyoverlay').addClass('scaleIn');
			}, 500);

			var here = $('#buyoverlay .checkout');

			here.html('');

			for (var i = 0; i < toBuy.length; i++) {

				var id = toBuy[i];

				var name = $('#treenerpakkumised .box33[data-id=' + id + ']').children('h4.name').text();
				var price = $('#treenerpakkumised .box33[data-id=' + id + ']').children('h4.price').text();

				var html = '<div class="inbasket"></div>';

				here.append(name + ' ');

			}

		});

		$('.detailsbtn').on(eventEnd, function (e) {
			//e.preventDefault();

			$('#overlay').addClass('scale');
			setTimeout(function () {
				$('#overlay').addClass('scaleIn');
			}, 100);
		});

		$('.overlay .backbtn').on(eventEnd, function (e) {
			e.preventDefault();

			$('#overlay').addClass('scaleOut');
			//$(this).parent().removeClass('scaleIn');

			var _this = $(this);

			setTimeout(function () {
				//_this.parent().removeClass('scale').removeClass('prepare');
				_this.parent('#overlay').removeClass('scaleIn');
				_this.parent().removeClass('scaleOut');
				_this.parent().removeClass('scale');
			}, 300);
		});

		/* MAKE HOVER */
		/* FOR STATIC ELEMENTS ONLY, NOT WORKING ON SCROLLABLE!! */

		$('.touchhover').on('touchstart', function (e) {
			e.preventDefault();
			$(this).addClass('hover');
		}).on(eventEnd, function (e) {
			//e.preventDefault();
			$(this).removeClass('hover');
		});

	});
})(window.jQuery);