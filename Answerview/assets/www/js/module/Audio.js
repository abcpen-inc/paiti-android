/**
 * @author jansesun(sunjian@xuexibao.cn)
 * @description 音频播放器
 * @include '../lib/mx.xxb'
 */
define('module/Audio', ['lib/mx.xxb'], function(require) {
	'use strict';
	var AudioPlayer, instance;
	require('lib/mx.xxb');
	/**
	 * @constructor   音频播放器
	 */
	AudioPlayer = function() {
		var Self = this;
		if(instance) {
			return instance;
		}
		Self.init();
		$(document).on('mediaPause', function(e) {
			Self.reset();
		});
		instance = Self;
	};
	AudioPlayer.prototype = {
		/**
		 * 初始化入口
		 */
		isIphone: $.os.iphone || $.os.ipod,
		init: function() {
			var Self = this,
				types = ['mp3', 'amr', 'wav', 'ogg'];
			// 创建Audio元素
			Self.audio = new window.Audio();
			// 测试媒体类型支持
			if(!Self.type) {
				MX.each(types, function(type) {
					if(Self.audio.canPlayType('audio/' + type)) {
						Self.type = type;
						return 1;
					}
				});
			}
			if(Self.isIphone) {
				Self._source = $('<source>').attr('type', 'audio/' + Self.type).appendTo(Self.audio);
			}
			// 绑定事件
			Self.addEvent();
		},
		/**
		 * 播放
		 * @param  {Element} el 播放按钮
		 */
		play: function(el, config) {
			var Self = this,
				audioSrc,
				_body = $(el).closest('.course');
			Self.player = _body.find('.audio-frame');
			config = config || {};
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
					_time: _body.find('.remain'),
					_progressLoad: _body.find('.load-rate'),
					_progress: _body.find('.rate'),
					_status: _body.find('.course-status'),
					_btn: _body.find('.play'),
					_handle: _body.find('.handle')
				};
				// 修改音频源文件地址
				Self.init();
				Self.addDragEvent();
				audioSrc = Self.cur._body.data('url');
				if(Self.isIphone) {
					Self._source.attr('src', audioSrc);
				} else {
					// android 部分机型无法用source加载音频
					Self.audio.src = audioSrc;
				}
			}
			if(config.preload) {
				Self.audio.load();
			} else {
				Self.totalWidth = Self.totalWidth || Self.cur._progressLoad.offset().width;
				// 延迟播放
				if($.os.android) {
					setTimeout(function() {
						Self.audio.play();
					}, 500);
				} else {
					Self.audio.play();
				}
			}
		},
		/**
		 * 暂停
		 */
		pause: function() {
			var Self = this;
			Self.audio.pause();
		},
		/**
		 * 重置
		 */
		reset: function() {
			var Self = this;
			// 暂停正在播放的音频
			if(Self.cur) {
				if(Self.cur._status.hasClass('course-status-nopay')) {
					return;
				}
				Self.audio.pause();
				// 还原进度条
				Self.cur._progress.css('width', 0);
				// 回复停止态
				Self.cur._btn.removeClass('play-pause');
				Self.cur._status.removeClass('course-status-play course-status-pause').addClass('course-status-start');
				// 还原时间
				Self.cur._time.text('00:00');
				Self.cur = null;
			}
		},
		/**
		 * 绑定事件
		 */
		addEvent: function() {
			var Self = this;
			$(Self.audio).on({
				'loadstart': function(e) {
					Self.cur._btn.addClass('play-load');
					Self.cur._status.removeClass('course-status-start').addClass('course-status-pause');
				},
				'playing': function(e) {
					Self.cur._btn.removeClass('play-load').addClass('play-pause');
					Self.cur._status.removeClass('course-status-pause').addClass('course-status-play');
				},
				'pause': function(e) {
					if(Self.cur) {
						Self.cur._btn.removeClass('play-pause');
						Self.cur._status.removeClass('course-status-play course-status-start').addClass('course-status-pause');
					}
				},
				'ended': function(e) {
					if(Self.cur._body.find('.evaluate').length > 0) {
						myPlugin.evaluateAudio(Self.cur._body.attr('id'));
					}
					Self.reset();
				},
				'timeupdate': function(e) {
					var time = this.currentTime, cur, duration, curSrc, $this = $(this);
					cur = Self.cur;
					curSrc = Self.isIphone ? $this.find('source').attr('src') : $(this).attr('src');
					// 防止切换音频时不正常的触发的timeupdate
					if(cur && curSrc === cur._body.data('url')) {
						duration = cur._body.data('duration');
						cur._time.text(MX.xxb.toLocalTime(time));
						// 兼容低端机型读不到duration的问题，后台返回的时间有可能不准
						cur._progress.css('width', Math.min(time * 100 / duration, 100) + '%');
					}
				}
			});
			MX.delegate({
				'tap': Self.events
			}, Self.player, Self);
		},
		events: {
			'.play-pause': function(e, el, Self) {
				Self.pause();
				MX.proxyEvent.stop();
			},
			'.play': function(e, el, Self) {
				Self.play($(this));
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
			player = cur._body.find('.audio');
			line = player.find('.audio-timeline');
			startX = progress.offset().left - 10 + 3;
			// 防止重复绑定
			if(!handle.data('drag')) {
				handle.data('drag', 1);
				line.on('touchstart', function(e) {
					isPlaying = !Self.audio.paused;
					flag = true;
					Self.audio.pause();
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
						flag = false;
						width = progress.offset().width;
						Self.audio.currentTime = (width / Self.totalWidth) * cur._body.data('duration');
						if(isPlaying && width < Self.totalWidth) {
							Self.audio.play();
						}
					}
				});
				line.on('click', function(e) {
					isPlaying = !Self.audio.paused;
					flag = true;
					Self.audio.pause();
					width = Math.max(e.clientX - startX, 0);
					flag = false;
					progress.css('width', width);
					cur._time.text(MX.xxb.toLocalTime((width / Self.totalWidth) * cur._body.data('duration')));
					Self.audio.currentTime = (width / Self.totalWidth) * cur._body.data('duration');
					if(isPlaying && width < Self.totalWidth) {
						Self.audio.play();
					}
				});
			}
		}
	};
	return {
		play: function(el, config) {
			(new AudioPlayer()).play(el, config);
		},
		pause: function() {
			(new AudioPlayer()).pause();
		}
	};
});
