define('page/interactive', ['lib/zepto', 'lib/fastclick', 'module/Tmpl'], function(require) {
	'use strict';
	var page, tmpl, $, FastClick;
	$ = require('lib/zepto');
	FastClick = require('lib/fastclick');
	tmpl = require('module/Tmpl');
	page = {
		tmpl: tmpl.getTmpl('init'),
		tmplFragment: {
			nav: [
				'<%len=answers.length;%>'
			],
			mediaEnd: ['</ul>']
		},
		init: function() {
			var Self = page;
			Self.initNodes();
			Self.addEvent();
			FastClick.attach(document.body);
		},
		initNodes: function() {
			var Self = page;
			Self.topImgContainer = $('#Photo');
			Self.topImg = Self.topImgContainer.find('img');
			Self.imgCover = $('#PhotoFrame');
			Self.container = $('#content-container');
			Self.solution = $('#Solution');
			Self.noSolution = $('#no-solution');
			Self.wait = Self.noSolution.find('.waitting');
			Self.waitRemind = Self.noSolution.find('.waitting-remind');
			Self.topImg.on('load', function(e) {
				Self.topImgLoad();
				Self.imgCache($(this));
			}).on('error', function(e) {
				Self.topImgContainer.html('<img src="images/photo-fail.png">');
				Self.topImg = Self.topImgContainer.find('img');
				Self.topImg.on('load', function(e) {
					Self.topImgLoad();
				});
			});
			Self.questionContainers = Self.solution.find('.content');
			if(Self.topImg[0].complete) {
				Self.topImg.trigger('load');
			}
		},
		topImgLoad: function() {
			var Self = this,
				photoHeight,
				frameHeight;
			Self.topImg.css('display', 'block').css('margin-top', 0);
			photoHeight = Self.topImg.offset().height;
			frameHeight = Self.topImgContainer.offset().height;
			Self.imgCover.css('height', frameHeight + 10);
			if(photoHeight !== frameHeight) {
				Self.topImg.css('margin-top', (frameHeight - photoHeight)/2);
			}
		},
		addEvent: function() {
			var Self = page;
			$(document).on('deviceready', function() {
				myPlugin.showLoading();
			}).on('statusChange', function(e, result) {
				var status = result.status,
					answerLen;
				if(result.loading) {
					Self.topImg.attr('src', result.question.image_path);
				} else {
					answerLen = (result.machine_answers || []).length;
					if(answerLen && (status === 2 || status === 1)) {
						if(window.myPlugin) {
							myPlugin.resultTitle(1);
						}
						result.machine_answers = result.machine_answers.splice(result.index, 1);
						//缓存
						if(Self.container) {
							Self.topImg.data('image-id', result.question.image_id).attr('src', result.question.image_path);
							Self.solution.removeClass('loading');
							Self.container.html(MX.txTpl(tmpl.getTmpl('content', Self.tmplFragment), {data: result}));
							Self.solution = $('#Solution');
							Self.questionContainers = Self.solution.find('.content');
						} else {
							$(document.body).prepend(MX.txTpl(tmpl.getTmpl('no-medias', Self.tmplFragment), {data: result}));
							Self.initNodes();
						}
						Self.question = Self.solution.find('.question-frame');
						if(!Self.question.data('highness')) {
							if(Self.question.find('.detail').offset().height >= Self.question.find('.question-body').offset().height) {
								Self.question.data('highness', 'short');
								Self.question.find('.fold').hide();
								Self.question.removeClass('question-frame-fold');
							} else {
								Self.question.data('highness', 'high');
							}
						}
					} else {
						if(window.myPlugin) {
							myPlugin.resultTitle(0);
						}
						$(document.body).addClass('err');
						$('#help-title').text('没有找到答案');
						if(status === -1) {
							if(!Self.solution) {
								$(document.body).prepend(MX.txTpl(Self.tmpl, {data: result}));
								Self.initNodes();
							} else {
								Self.topImg.data('image-id', result.question.image_id).attr('src', result.question.image_path);
							}
							Self.solution.empty();
						} else if(status === -2) {
							Self.wait.hide();
							Self.waitRemind.show();
						}
					}
				}
			});
			MX.delegate({
				'tap': Self.events
			}, $(document.body), Self);
		},
		events: {
			'.photo-frame': function(e, el, Self) {
				//enlarge photo
				myPlugin.showPhoto();
			},
			'.report-error': function(e, el, Self) {
				// 报错
				myPlugin.reportError();
			},
			'.seek-help': function(e, el, Self) {
				// 求助学霸
				myPlugin.seekHelp();
			},
			'.question-frame-fold .fold': function(e, el, Self) {
				//展开
				el = $(el);
				el.closest('.question-frame').removeClass('question-frame-fold');
				el.find('span').text('收起题目');
				MX.proxyEvent.stop();
			},
			'.fold': function(e, el, Self) {
				// 收起
				el = $(el);
				el.closest('.question-frame').addClass('question-frame-fold');
				el.find('span').text('显示全部');
			}
		},
		imgCache: function(img) {
			var image, imgSrc, width, height, canvas, ctx;
			if($.os.android) {
				return;
			}
			imgSrc = img.attr('src');
			if(imgSrc.substr(0,4) !== 'http') {
				return;
			}
			image = $('#data-img');
			image.attr('src', imgSrc);
			width = image[0].width;
			height = image[0].height;
			canvas = $('#data-canvas').attr({
				width: width,
				height: height
			})[0];
			ctx = canvas.getContext('2d');
			ctx.drawImage(image[0], 0, 0, width, height);
			if(window.myPlugin) {
				myPlugin.cacheImg(canvas.toDataURL('image/jpg').replace(/^data:image\/(?:png|jpg);base64,/, ''));
			}
		}
	};
	return {
		init: page.init
	};
});