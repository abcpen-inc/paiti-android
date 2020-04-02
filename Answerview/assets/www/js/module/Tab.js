/*
 * @include "../mx.js"
 */
define('module/Tab', ['lib/zepto'], function(require, exports) {
	'use strict';
	var $ = require('lib/zepto'), Tab;
	Tab = function(target, option){
		var Self = this,
			curX;
		Self._body = MX.isString(target) ? $('#' + target): $(target);
		if(Self._body[0]) {
			// Option
			Self = $.extend(Self, option);
			
			Self._cont = MX.isString(option._cont) ? $('#' + option._cont) : $(option._cont);
			Self._cur = Self._body.find('.' + Self.active);
			Self._tabs = Self._body.find('li');
			Self._lists = Self._cont.children();
			Self.num = Self._lists.length;
			Self._lists.each(function(i, o) {
				$(o).data('index', i);
			});
			Self.index = Self._cur.data('index');
			// 点击事件
			MX.delegate({
				'tap' : {
					'li' : function(e){
						var index = $(this).data('index');
						Self.show(index);
					}
				}
			}, Self._body);
		}
	};
	Tab.prototype = {
		_cur : null, // 当前页卡
		_tabs : null, // 页卡
		_lists : null, // 列表
		num : 0, // 页卡数量
		index : 0, // 当前页卡索引
		active: 'active', //激活class
		show: function(index) { // 显示
			var Self = this,
				cur = Self.index;
			if(index < 0) {
				index = 0;
			} else if(index > Self.num - 1) {
				index = Self.num - 1;
			}
			Self._cur.removeClass(Self.active);
			Self._cur = Self._tabs.eq(index);
			Self._cur.addClass(Self.active);
			Self.index = index;
			// Callback
			if (Self.call){
				Self.call(index, cur);
			}
			// 事件
			$(document.body).trigger('Tab:show', [index, cur]);
		}
	};
	return Tab;
});