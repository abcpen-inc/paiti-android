/**
 * @author lishunping(lishunping@xuexibao.cn)
 * @description 视频播放器
 * @include '../lib/mx.xxb'
 * @todo 控制条可以消失
 */
define('module/Video', ['lib/mx.xxb'], function(require) {
	'use strict';
	var VideoPlayer, instance;
	require('lib/mx.xxb');
	/**
	 * @constructor 视频播放器
	 */
	VideoPlayer = function() {
		var Self = this;
		if(instance) {
			return instance;
		}
		$(document).on('mediaPause', function(e) {
			Self.reset();
		});
		Self.init();
		instance = Self;
	};
	VideoPlayer.prototype = {
		/**
		 * 初始化入口
		 */
		init: function() {
			var Self = this;
			Self.addEvent();
		},
		/**
		 * 播放
		 * @param  {Element} el 播放按钮
		 */
		play: function(el) {
			var Self = this,
				videoSrc,
				_body = $(el).closest('.course');
			Self.container = _body.find('.video-frame');
			Self.video = _body.find('video')[0];
			// 重置cur对象
			if(Self.cur) {
				if(Self.cur._body[0] !== _body[0]) {
					Self.reset();
				}
			}
			// 设置关联dom
			if(!Self.cur) {
				Self.cur = {
					_body: _body,
					_container: _body.find('.video-frame'),
					_close: _body.find('.close-btn'),
					_player: _body.find('.video-player'),
					_time: _body.find('.play-rate'),
					_progressLoad: _body.find('.load-rate'),
					_progress: _body.find('.rate'),
					_status: _body.find('.course-status'),
					_btn: _body.find('.play'),
					_handle: _body.find('.handle')
				};
				Self.init();
				Self.cur._container.offset();
				videoSrc = Self.cur._body.data('url');
				Self.cur._body.find('source').attr('src', videoSrc);
				Self.cur._close.addClass('close-btn-loading');
			}
			if(Self.video.readyState === 0) {
				Self.video.load();
			}
			Self.video.play();
		},
		/**
		 * 暂停
		 */
		pause: function(el) {
			var Self = this,
				_body = $(el).closest('.course');
			Self.video = _body.find('video')[0];
			Self.video.pause();
		},
		/**
		 * 重置
		 */
		reset: function(el) {
			var Self = this;
			if(Self.cur) {
				Self.video.pause();
				Self.cur._container.removeClass('control');
				Self.cur._progress.css('width', 0);
				Self.cur._btn.removeClass('play-pause');
				Self.cur._status.removeClass('course-status-play course-status-pause').addClass('course-status-start');
				Self.cur._time.text('00:00');
				Self.cur = null;
			}
			Self.hasPlay = false;
		},
		close: function(el) {
			$(document).trigger('mediaPause');
		},
		showControl: function(el) {
			var Self = this,
				container = Self.container;
			if(Self.hideControlWait) {
				clearTimeout(Self.hideControlWait);
			}
			if($(el).attr('tagName').toLowerCase() === 'video') {
				container.toggleClass('control');
				Self.hideControl();
			} else {
				container.addClass('control');
				if(!$(el).hasClass('video-timeline')) {
					Self.hideControl();
				}
			}
		},
		hideControl: function() {
			var Self = this,
				hide = function() {
					Self.container.removeClass('control');
					Self.hideControlWait = null;
				};
			Self.hideControlWait = setTimeout(hide, 2800);
		},
		playPoint: function(id, currentTime, paused) {
			var Self = this,
				container = $('#' + id);
			paused = paused || false;
			Self.video = container.find('video')[0];
			container.addClass('course-active');
			Self.video.currentTime = currentTime;
			if(paused === false) {
				Self.play(Self.video);
			}
		},
		changeStatus: function() {
			var Self = this;
			Self.cur._status.removeClass('course-status-pause').removeClass('course-status-start').addClass('course-status-play');
			Self.showControl(Self.cur._player);
			Self.cur._close.removeClass('close-btn-loading');
			Self.totalWidth = Self.totalWidth || Self.cur._progressLoad.offset().width;
			Self.addDragEvent();
			Self.container.find('.video-poster').hide();
			Self.container.find('.video-loading').hide();
		},
		/**
		 * 绑定事件
		 */
		addEvent: function() {
			var Self = this;
			$(document).on('webkitfullscreenchange fullscreenchange', function(){
				Self.showControl(Self.cur._player);
			});
			$(Self.video).on({
				'loadstart': function(e) {
					Self.cur._btn.addClass('play-load');
					Self.cur._status.removeClass('course-status-start').addClass('course-status-pause');
				},
				'playing': function(e) {
					Self.cur._btn.removeClass('play-load').addClass('play-pause');
				},
				'pause': function(e) {
					if(Self.cur) {
						Self.cur._btn.removeClass('play-pause');
						Self.cur._status.removeClass('course-status-play course-status-start').addClass('course-status-pause');
					}
				},
				'ended': function(e) {
					if(!Self.cur._body.data('comment')) {
						myPlugin.evaluateAudio(Self.cur._body.attr('id'));
						Self.cur._body.data('comment', true);
					}
					Self.reset();
				},
				'timeupdate': function(e) {
					var time = this.currentTime, cur, duration, curSrc, $this = $(this);
					if(!Self.hasPlay && time > 0) {
						Self.changeStatus();
						Self.hasPlay = true;
					}
					cur = Self.cur;
					curSrc = $this.find('source').attr('src');
					if(cur && curSrc === cur._body.data('url')) {
						duration = cur._body.data('duration');
						cur._time.text(MX.xxb.toLocalTime(time));
						cur._progress.css('width', Math.min(time * 100 / duration, 100) + '%');
					}
				}
			});
			MX.delegate({
				'tap': Self.events
			}, $(document.body), Self);
		},
		events: {
			'.play-pause': function(e, el, Self) {
				//暂停视频
				Self.pause(el);
				MX.proxyEvent.stop();
			},
			'.play': function(e, el, Self) {
				//播放视频
				$(this).addClass('play-load');
				Self.play(el);
			},
			'.close-btn': function(e, el, Self) {
				//关闭视频
				Self.close(el);
			},
			'.fullscreen': function(e, el, Self) {
				//全屏视频
				var item = $(this).closest('.course'),
					video = $(item).find('video')[0],
					paused = video.paused;
				Self.pause(el);
				myPlugin.fullScreenBoard({
					id: item.attr('id'),
					url: item.data('url'),
					currentTime: video.currentTime,
					paused: paused
				});
			},
			'video': function(e, el, Self) {
				//全屏视频
				e.preventDefault();
				seajs.use('module/Video', function(video) {
					video.showControl(el);
				});
			}
		},
		/**
		 * 绑定拖拽事件
		 */
		addDragEvent: function() {
			var Self = this, cur, handle, progress, line, player, x = 0, width, isPlaying, flag = false, startX;
			cur = Self.cur;
			handle = cur._handle;
			progress = cur._progress;
			player = cur._body.find('.video-player');
			line = player.find('.video-timeline');
			startX = progress.offset().left - 10 + 3;
			if(!handle.data('drag')) {
				handle.data('drag', 1);
				line.on('touchstart', function(e) {
					Self.showControl($(this));
					isPlaying = !Self.video.paused;
					flag = true;
					Self.video.pause();
					width = progress.offset().width;
					x = e.touches[0].clientX;
				});
				player.on('touchmove', function(e) {
					e.preventDefault();
					if(flag) {
						var curX = e.touches[0].clientX, curWidth;
						// 计算宽度
						curWidth = Math.min(Math.max(0, width + curX - x), Self.totalWidth);
						// 更新进度
						progress.css('width', curWidth);
						// 更新时间
						cur._time.text(MX.xxb.toLocalTime((curWidth / Self.totalWidth) * cur._body.data('duration')));
					}
				});
				player.on('touchend', function(e) {
					if(flag) {
						Self.showControl($(this));
						flag = false;
						width = progress.offset().width;
						Self.video.currentTime = (width / Self.totalWidth) * cur._body.data('duration');
						if(isPlaying && width < Self.totalWidth) {
							Self.video.play();
						}
					}
				});
				line.on('click', function(e) {
					Self.showControl($(this));
					isPlaying = !Self.video.paused;
					flag = true;
					Self.video.pause();
					width = Math.max(e.clientX - startX, 0);
					flag = false;
					progress.css('width', width);
					cur._time.text(MX.xxb.toLocalTime((width / Self.totalWidth) * cur._body.data('duration')));
					Self.video.currentTime = (width / Self.totalWidth) * cur._body.data('duration');
					if(isPlaying && width < Self.totalWidth) {
						Self.video.play();
					}
				});
			}
		}
	};
	return {
		play: function(el, config) {
			(new VideoPlayer()).play(el, config);
		},
		pause: function(el) {
			(new VideoPlayer()).pause(el);
		},
		close: function(el, config) {
			(new VideoPlayer()).close(el);
		},
		fullScreen: function() {
			(new VideoPlayer()).fullScreen();
		},
		showControl: function(el) {
			(new VideoPlayer()).showControl(el);
		},
		playPoint: function(el, currentTime, paused) {
			(new VideoPlayer()).playPoint(el, currentTime, paused);
		}
	};
});