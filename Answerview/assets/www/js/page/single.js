define('page/single', ['lib/zepto', 'lib/fastclick', 'module/Tmpl'], function(require) {
	'use strict';
	var page, tmpl, $, FastClick;
	$ = require('lib/zepto');
	FastClick = require('lib/fastclick');
	tmpl = require('module/Tmpl');
	page = {
		tmplFragment: {
			init: [
				'<%',
				'var i,len,answers,answer,medias;',
				'answers=data.answers || [];',
				'medias=data.audios || [];',
				'%>'
			],
			topPic: [],
			containerStart: [
				'<div id="iScroll">',
					'<div id="content-container">'
			],
			nav: [
				'<%len=answers.length;%>',
			],
			mediaStart: [
				'<ul class="courses<%if(data.isPay){%> paid<%}else{%> no-paid<%if(data.isMember){%> limited-free<%}%><%}%>" data-question-id="<%=answer.question_id%>">'
			],
			medias: [
				'<%var j,mediaLen=medias.length,media,teacherName;%>',
				'<%if(!mediaLen){%>',
					'<div class="no-course">',
						'<span class="topic">此答案暂无讲解</span>',
					'</div>',
				'<%}else{%>',
					'<%for(j=0;j<mediaLen;++j){',
						'media=medias[j];',
						'teacherName=data.teacher[0].nickname||data.teacher[0].name||"笔声";',
					'%>',
					'<li class="course" data-duration="<%=media.duration%>" data-type="<%=media.type%>" <%if(media.type===2){%>data-wbtype="<%=media.wb_type%>"<%}%> data-gold="<%=media.gold%>" data-url="<%=media.url%>"" id="<%=media.id%>" data-id="<%=media.id%>" data-teacher-id="<%=media.teacher_id%>" data-exercise-id="<%=data.exerciseId%>" data-comment="<%=media.hasCommentAudio%>" data-name="<%=media.name%>">',
						'<div class="course-status course-status-start"></div>',
						'<div class="teacher teacher-excellent"><%=teacherName.length>3?teacherName.substr(0,2)+"…":teacherName%>老师</div>',
						'<div class="types">',
							'<span class="type"><%=["", "音频", "白板"][media.type]%>讲解</span>',
						'</div>',
						'<div class="interactive">互动</div>',
						'<%if(!media.hasCommentAudio){%>',
							'<div class="evaluate">评价</div>',
						'<%}%>',
						'<br class="clear">',
						'<%if(media.type===1){%>',
							'<div class="audio-frame"></div>',
							'<%} else if(media.type===2 && media.wb_type===2) {%>',
							'<div class="video-frame"></div>',
						'<%}%>',
					'</li>',
					'<%}%>',
				'<%}%>'
			],
			mediaEnd: [
				'</ul>'
			],
			help: [
			]
		},
		init: function() {
			var Self = page;
			Self.initNodes();
			Self.addEvent();
			FastClick.attach(document.body);
		},
		initNodes: function() {
			var Self = page;
			Self.solution = $('#Solution');
			Self.noSolution = $('#no-solution');
			Self.wait = Self.noSolution.find('.waitting');
			Self.waitRemind = Self.noSolution.find('.waitting-remind');
			Self.container = $('#content-container');
		},
		requestBoard: function(boardId) {
			var Self = page, result, el;
				el = $('#' + boardId);
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
							myPlugin.playNoVideo(result, el.data('hasCommentAudio'));
						}
					},
					error: function(xhr) {
						// myPlugin.requestCourseFail(xhr.status);
					}
				});
			} else {
				// myPlugin.isOffline(config);
			}
		},
		addEvent: function() {
			var Self = page;
			$(document).on('deviceready', function() {
				myPlugin.showLoading();
				myPlugin.getUserInfo();
			}).on('statusChange', function(e, result) {
				var status = result.status;
				if(!result.loading) {
					if(status === 2 || status === 1) {
						if(window.myPlugin) {
							myPlugin.resultTitle(1);
						}
						// 从客户端返回一个数组但是这里只取一个
						result.index = result.index || 0;
						result.answers = result.answers.length ? [result.answers[result.index]] : [];
						if(Self.container) {
							Self.container.html(MX.txTpl(tmpl.getTmpl('content-with-medias', Self.tmplFragment), {data: result}));
							Self.solution = $('#Solution');
							Self.questionContainers = Self.solution.find('.content');
						} else {
							$(document.body).prepend(MX.txTpl(tmpl.getTmpl('all', Self.tmplFragment), {data: result}));
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
			}).on('userInfoReady', function(e, result) {
				Self.userInfo = {
					userAgent: result.user_agent,
					token: result.token,
					cookie: result.cookie,
					isMember: result.isMember || false
				};
			}).on('exercisePaid', function(e, result) {
				if(Self.solution) {
					Self.solution.find('.courses').removeClass('no-paid').addClass('paid');
				}
			}).on('mediaPause', function(e, result) {
				if(!result || result.toClose) {
					Self.solution.find('.course-active').removeClass('course-active');
				}
			}).on('evaluateSuccess', function(e, result) {
				// 评价成功
				var el = $('#' + result.id);
				el.find('.evaluate').remove();
			}).on('pause', function(e) {
				$(this).trigger('mediaPause', [{
					toClose: false
				}]);
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
			'.paid .course-status-start': function(e, el, Self) {
				var type, item, id, fileType;
				el = $(el);
				item = el.closest('.course');
				type = item.data('type');
				id = item.attr('id');
				fileType = item.data('wbtype');
				$(document).trigger('mediaPause');
				if(type == 1) {
					Self.playAudio(el);
				} else if(type == 2) {
					if(fileType === 1) {
						Self.requestBoard(id);
					} else if(fileType === 2) {
						Self.playVideo(id);
					}
				}
			},
			'.paid .teacher-excellent': function(e, el, Self) {
				var item = $(el).closest('.course');
				myPlugin.showTeacher(item.data('teacher-id'));
			},
			'.paid .evaluate': function(e, el, Self) {
				var item = $(el).closest('.course');
				myPlugin.evaluateAudio(item.data('id'));
			},
			'.paid .interactive': function(e, el, Self) {
				//TODO：pass teacherID
				var item = $(this).closest('.course'),
					items = $(this).closest('.courses');
				myPlugin.interactive(item.data('teacher-id'), item.data('id'), item.data('type'), items.data('question-id'));
			},
			'.report-error': function(e, el, Self) {
				// 报错
				myPlugin.reportError();
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
			},
			'ul.no-paid': function(e, el, Self) {
				myPlugin.payExercise();
			}
		},
		imgCache: function(img) {
			var image = $('#data-img'), width, height, canvas, ctx;
			image.attr('src', img.attr('src'));
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
		playAudio: function(el) {
			var item, container, audioContainer;
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
			item.addClass('course-active');
			seajs.use('module/Audio', function(audio) {
				audio.play(el);
			});
		},
		playVideo: function(id) {
			var Self = this, el, item, container, videoContainer, width;
			el = $('#' + id);
			item = el.closest('.course');
			container = el.closest('.courses');
			videoContainer = item.find('.video-frame');
			container.find('li.course-active').removeClass('course-active');
			width = Self.solution.width()-30;
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
