define('page/detail', ['lib/zepto', 'lib/fastclick', 'module/Tmpl', 'module/Tab'], function(require) {
	'use strict';
	var page,
		$ = require('lib/zepto'),
		FastClick = require('lib/fastclick'),
		tmpl = require('module/Tmpl'),
		Tab = require('module/Tab');
	page = {
		tmpl: tmpl.getTmpl('init'),
		init: function() {
			var Self = page;
			Self.initNodes();
			Self.addEvent();
			FastClick.attach(document.body);
		},
		priorMedias: [],
		hasMedia: [],
		hasQuest: [],
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
			Self.help_title = $('#help-title');
			Self.question = Self.solution.find('.question-frame');
			Self.topImg.on('load', function(e) {
				Self.topImgLoad();
				Self.imgCache($(this));
			}).on('error', function(e) {
				var img = $(this), imgUrl = img.attr('src');
				if(imgUrl === Self.photoUrl) {
					Self.topImgContainer.html('<img src="images/photo-fail.png">');
					Self.topImg = Self.topImgContainer.find('img');
					Self.topImg.on('load', function(e) {
						Self.topImgLoad();
					});
				} else if(Self.photoUrl && imgUrl !== Self.photoUrl) {
					img.attr('src', Self.photoUrl);
				} else {
					return;
				}
			});
			Self.questionContainers = Self.solution.find('.content');
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
		initMedias: function(config) {
			var Self = page, mediaContainer, questionContainer, medias, requestBtn, preQuest = !!config ? config.preQuest : false;
			$(document).trigger('mediaPause');
			if(window.navigator.onLine && Self.userInfo) {
				questionContainer = Self.questionContainers.eq(Self.curIndex);
				mediaContainer = questionContainer.find('.courses');
				if(!preQuest) {
					requestBtn = questionContainer.find('.request-loading');
					mediaContainer.html('');
				}
				if(mediaContainer.data('question-id')) {
					if(mediaContainer.find('.media-loading').length === 0 && !preQuest) {
						mediaContainer.append('<li class="media-loading"><img src="images/request.png"></li>');
					}
					$.ajax({
						url: 'http://webapi.abcpen.cn/api/question/mediasV2',
						type: 'POST',
						data: {
							user_agent: Self.userInfo.userAgent,
							token: Self.userInfo.token,
							cookie: Self.userInfo.cookie,
							question_id: mediaContainer.data('question-id')
						},
						dataType: 'json',
						success: function(data, status, xhr) {
							if(data.status === 0) {
								if(Self.userInfo.isMember) {
									medias = $.map(data.result.audios, function(item,index){
										if(!item.is_pay) { 
											item.limited_free = true;
										}
										return item;
									});
								} else {
									medias = data.result.audios;
								}
								mediaContainer.html(MX.txTpl(tmpl.medias, {
									medias: medias
								}));
								if(!preQuest) {
									requestBtn.removeClass('request-loading');
								}
								myPlugin.postMedias(medias.map(function(item, index, array) {
									return {
										id: item.id,
										type: item.type,
										teacherName: item.teacher.name
									};
								}), Self.curIndex);
								Self.priorMedias[Self.curIndex] = medias.map(function(item, index, array) {
									return item.id;
								}) || [];
								Self.hasQuest[Self.curIndex] = !!data.result.hasQuest;
								Self.hasMedia[Self.curIndex] = !!(medias || []).length;
								questionContainer.data('media', 1);
								if(preQuest) {
									myPlugin.requestTeachers(Self.priorMedias[Self.curIndex], Self.hasQuest[Self.curIndex], Self.hasMedia[Self.curIndex]);
								}
							} else {
								if(preQuest) {
									myPlugin.requestTeachers(Self.priorMedias[Self.curIndex], Self.hasQuest[Self.curIndex], Self.hasMedia[Self.curIndex]);
								} else {
									myPlugin.requestCourseFail(xhr.status, data.status);
								}
							}
						},
						error: function(xhr) {
							if(preQuest) {
								myPlugin.requestTeachers(Self.priorMedias[Self.curIndex], Self.hasQuest[Self.curIndex], Self.hasMedia[Self.curIndex]);
							} else {
								myPlugin.requestCourseFail(xhr.status);
							}
						}
					});
				}
			}
		},
		requestBoard: function(boardId) {
			var Self = page, result;
			if(window.navigator.onLine) {
				$.ajax({
					url: 'http://webapi.abcpen.cn/teacher/api/learnTalk/queryWbDownloadUrlsForStudent',
					type: 'POST',
					data: {
						user_agent: Self.userInfo.userAgent,
						token: Self.userInfo.token,
						cookie: Self.userInfo.cookie,
						wbId: boardId
					},
					dataType: 'json',
					success: function(data, status, xhr) {
						result = data.result;
						if(data.status === 0) {
							myPlugin.playNoVideo(result);
						}
					}
				});
			}
		},
		addEvent: function() {
			var Self = page;
			$(document).on('deviceready', function() {
				myPlugin.showLoading();
				myPlugin.getUserInfo();
			}).on('statusChange', function(e, result) {
				var status = result.status,
					tab,
					answerLen;
 				if(result.loading) {
					if(result.question.image_path) {
						Self.topImg.attr('src', result.question.image_path);
					}
				} else {
					Self.photoUrl = result.question.image_url;
					answerLen = (result.machine_answers || []).length;
					if(answerLen && (status === 2 || status === 1)) {
						if(window.myPlugin) {
							myPlugin.resultTitle(1);
						}
						result.index = result.index || 0;
						if(Self.container) {
							Self.topImg.data('image-id', result.question.image_id).attr('src', result.question.image_path);
							Self.container.html(MX.txTpl(tmpl.content, {data: result}));
							Self.solution = $('#Solution');
							Self.question = Self.solution.find('.question-frame');
							Self.questionContainers = Self.solution.find('.content');
						} else {
							$(document.body).prepend(MX.txTpl(tmpl.getTmpl('no-medias'), {data: result}));
							Self.initNodes();
						}
						Self.curIndex = result.index || 0;
						if(window.myPlugin) {
							$(document).trigger('loadQuestion');
							myPlugin.cacheIndex(Self.curIndex);
						}
						tab = new Tab('result-indexs', {
							_cont: 'Solution',
							active: 'index-current',
							call: function(index, cur) {
								this._lists.eq(cur).hide();
								this._lists.eq(index).show();
								Self.curIndex = index;
								myPlugin.cacheIndex(index);
								if(!Self.questionContainers.eq(Self.curIndex).data('media')) {
									$(document).trigger('loadQuestion');
									Self.initMedias();
								} else {
									$(document).trigger('mediaPause');
								}
							}
						});
						if(!Self.questionContainers.eq(Self.curIndex).data('media')) {
							Self.initMedias();
						}
					} else {
						if(window.myPlugin) {
							myPlugin.resultTitle(0);
						}
						$(document.body).addClass('err');
						Self.help_title.text('没有找到答案');
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
			}).on('userInfoReady', function(e, result) {
				Self.userInfo = {
					userAgent: result.user_agent,
					token: result.token,
					cookie: result.cookie,
					isMember: result.isMember || false
				};
				if(Self.questionContainers && Self.questionContainers[0] && !Self.questionContainers.eq(Self.curIndex).data('media')) {
					Self.initMedias();
				}
			}).on('updateMedia', function(e, result) {
				Self.initMedias();
			}).on('audioPaid', function(e, result) {
				var el = $('#' + result.id);
				el = el.removeClass('course-nopay')
					.find('.course-status').removeClass('course-status-nopay').addClass('course-status-start').removeClass('course-limited-free');
				Self.playAudio(el);
			}).on('boardPaid', function(e, result) {
				var boardId = result.id,
					el = $('#' + boardId),
					fileType = el.data('wbtype');
				el.removeClass('course-nopay')
					.find('.course-status').removeClass('course-status-nopay').addClass('course-status-start').removeClass('course-limited-free');
				if(fileType === 1) {
					Self.requestBoard(boardId);
				} else if(fileType === 2) {
					Self.playVideo(boardId);
				}
			}).on('mediaPause', function(e, result) {
				if(!result || result.toClose) {
					Self.solution.find('.course-active').removeClass('course-active');
				}
			}).on('evaluateSuccess', function(e, result) {
				var el = $('#' + result.id);
				el.find('.evaluate').remove();
			}).on('requestTeacherSuccess', function(e) {
				Self.hasQuest[Self.curIndex] = true;
			}).on('helpSuccess', function(e) {
				Self.help_title.text('看看学霸怎么说…');
				$("#students-help").text('查看我的求助').addClass('seek-help-success');
			}).on('pause', function(e) {
				$(this).trigger('mediaPause', [{
					toClose: false
				}]);
			}).on('loadQuestion', function(e) {
				var el = Self.question.eq(Self.curIndex),
					foldHeight = Self.foldHeight || el.find('.detail').offset().height;
				if(!el.data('highness')) {
					if(foldHeight >= el.find('.question-body').offset().height) {
						el.data('highness', 'short');
						el.find('.fold').hide();
						el.removeClass('question-frame-fold');
					} else {
						el.data('highness', 'high');
						Self.foldHeight = foldHeight;
					}
				}
			}).on('playPoint', function(e, result) {
				seajs.use('module/Video', function(video) {
					video.playPoint(result.boardId, result.currentTime, result.paused);
				});
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
			'.course-status-nopay': function(e, el, Self) {
				//invoke payment
				var item = $(el).closest('.course'), type;
				type = item.data('type');
				$(document).trigger('mediaPause');
				if(type === 1) {
					Self.playAudio(item, {
						preload: 1
					});
					myPlugin.payAudio(item.attr('id'), item.data('gold'), item.data('teacher-name'));
				} else if(type === 2) {
					myPlugin.payBoard(item.attr('id'), item.data('gold'), item.data('teacher-name'));
				}
				MX.proxyEvent.stop();
			},
			'.course-status-start': function(e, el, Self) {
				var type, item, id, fileType;
				$(document).trigger('mediaPause');
				el = $(el);
				item = el.closest('.course');
				type = item.data('type');
				id = item.attr('id');
				if(type === 1) {
					Self.playAudio(el);
				} else if(type === 2) {
					fileType = item.data('wbtype');
					if(fileType === 1) {
						Self.requestBoard(id);
					} else if(fileType === 2) {
						Self.playVideo(id);
					}
				}
			},
			'.teacher-excellent': function(e, el, Self) {
				var item = $(el).closest('.course');
				myPlugin.showTeacher(item.data('teacher-id'));
			},
			'.evaluate': function(e, el, Self) {
				var item = $(el).closest('.course');
				myPlugin.evaluateAudio(item.attr('id'));
			},
			'.interactive': function(e, el, Self) {
				var item = $(el).closest('.course');
				myPlugin.interactive(item.data('teacher-id'), item.attr('id'), item.data('type'));
			},
			'.request': function(e, el, Self) {
				Self.initMedias({
					preQuest: true
				});
			},
			'.report-error': function(e, el, Self) {
				// 报错
				myPlugin.reportError();
			},
			'.seek-help-success': function(e, el, Self) {
				myPlugin.showDiscuss();
				MX.proxyEvent.stop();
			},
			'.seek-help': function(e, el, Self) {
				// 求助学霸
				$(document).trigger('mediaPause');
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
		},
		playAudio: function(el, config) {
			var item, container, audioContainer;
			config = config || {};
			el = $(el);
			item = el.closest('.course');
			container = el.closest('.courses');
			audioContainer = item.find('.audio-frame');
			container.find('li.course-active').removeClass('course-active');
			if(audioContainer.is(':empty')) {
				audioContainer.html([
					'<div class="audio">',
						'<div class="play"></div>',
						'<ul class="audio-ul">',
							'<li class="placeholder"></li>',
							'<li class="audio-timeline">',
								'<div class="control">',
									'<div class="progress">',
										'<div class="load-rate">',
											'<div class="rate">',
												'<span class="handle"></span>',
											'</div>',
										'</div>',
									'</div>',
								'</div>',
							'</li>',
							'<li class="audio-current">',
								'<span class="remain">00:00</span>',
							'</li>',
						'</ul>',
					'</div>'
				].join(''));
			}
			if(!config.preload) {
				item.addClass('course-active');
			}
			seajs.use('module/Audio', function(audio) {
				audio.play(el, {
					preload: config.preload
				});
			});
		},
		playVideo: function(id) {
			var Self = this, el, item, container, videoContainer, width;
			el = $('#' + id);
			item = el.closest('.course');
			container = el.closest('.courses');
			videoContainer = item.find('.video-frame');
			container.find('li.course-active').removeClass('course-active');
			width = Self.solution.width() - 30;
			videoContainer.css('width', width + 'px');
			if(videoContainer.is(':empty')) {
				videoContainer.html([
					'<div class="close-btn"></div>',
					'<img class="video-loading" src="images/video-buffer.png">',
					'<img class="video-poster" src="images/video-poster.png">',
					'<video webkit-playsinline>',
						'<source src="" type="video/mp4">',
					'</video>',
					'<div class="video-player">',
						'<div class="video-control-bg"></div>',
						'<div class="video-control">',
							'<span class="play"></span>',
							'<span class="play-rate">00:00</span>',
							'<span class="fullscreen"></span>',
							'<div class="video-timeline">',
								'<div class="progress">',
									'<div class="load-rate">',
										'<div class="rate">',
											'<span class="handle"></span>',
										'</div>',
									'</div>',
								'</div>',
							'</div>',
						'</div>',
					'</div>'
				].join(''));
			}
			item.addClass('course-active');
			seajs.use('module/Video', function(video) {
				video.play(el);
			});
		}
	};
	return {
		init: page.init
	};
});