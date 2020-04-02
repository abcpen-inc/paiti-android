/**
 * @author jansesun(sunjian@xuexibao.cn)
 * @description 时间处理函数组
 * @include ./mx.js
 */
define('lib/mx.xxb', [], function() {
	'use strict';
	MX.xxb = {
		/**
		 * 将时间转化为字符串
		 * @param	{Number} time 时长(s)
		 * @example
		 * 		var timeStr = MX.xxb.toLocalTime(145.6); // 02:25
		 */
		toLocalTime: function(time) {
			var hour, minute, second, str = '';
			time = ~~time;
			hour = MX.addZero(~~(time / 3600));
			minute = MX.addZero(~~((time % 3600) / 60));
			second = MX.addZero(time % 60);
			if(hour !== '00') {
				str += hour + ':';
			}
			str += minute + ':' + second;
			return str;
		},
		toLocalDate: function(time) {
			var date, year, month, day, str = '';
			date = new Date(time);
			year = date.getFullYear();
			month = date.getMonth() + 1;
			day = date.getDate();
			if((new Date()).getFullYear > year) {
				str = year + '年' + month + '月' + day + '日';
			} else {
				str = month + '月' + day + '日';
			}
			return str;
		},
		throttle: function(func, wait, options) {
			/* options的默认值
			 *	表示首次调用返回值方法时，会马上调用func；否则仅会记录当前时刻，当第二次调用的时间间隔超过wait时，才调用func。
			 *	options.leading = true;
			 * 表示当调用方法时，未到达wait指定的时间间隔，则启动计时器延迟调用func函数，若后续在既未达到wait指定的时间间隔和func函数又未被调用的情况下调用返回值方法，则被调用请求将被丢弃。
			 *	options.trailing = true; 
			 * 注意：当options.trailing = false时，效果与上面的简单实现效果相同
			 */
			var context, args, result, timeout = null, previous = 0, later;
			options = options || {};
			later = function() {
				previous = options.leading === false ? 0 : Date.now();
				timeout = null;
				result = func.apply(context, args);
				if(!timeout) {
					context = args = null;
				}
			};
			return function() {
				var now = Date.now(), remaining;
				if (!previous && options.leading === false) {
					previous = now;
				}
				remaining = wait - (now - previous);
				context = this;
				args = arguments;
				if(remaining <= 0 || remaining > wait) {
					if(timeout) {
						clearTimeout(timeout);
						timeout = null;
					}
					previous = now;
					result = func.apply(context, args);
					if(!timeout) {
						context = args = null;
					}
				} else if(!timeout && options.trailing !== false) {
					timeout = setTimeout(later, remaining);
				}
				return result;
			};
		},
		toShutCount: function(number) {
			return Math.floor(number / 99999999) >= 1 ? ('1亿+') : (Math.floor(number / 10000) >= 1 ? Math.floor(number / 10000) + '万' : number);
		}
	};
});