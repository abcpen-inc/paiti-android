/**
 * MX
 * 
 */

/**
 * 判断是否有字符
 * 
 * @param {String} String 字符
 * @return {Boolean} Boolean 返回布尔值
 *            @example
 *            'abc'.hasString('a');
 *            'abc'.hasString(['a','b']);
 */
String.prototype.hasString = function(o) {
	var i, n;
	if (typeof o == 'object') {
		for (i = 0, n = o.length; i < n; i++) {
			if (!this.hasString(o[i])) {
				return false;
			}
		}
		return true;
	}
	if (this.indexOf(o) != -1) {
		return true;
	}
};

var $ = Zepto || window.jQuery;
//继承已有MX
if (window.MX){
	(function(){
		var _MX = MX, i;
		window.MX_ = function(){
			for (i in _MX){
				if (!MX[i]){
					MX[i] = _MX[i];
				}
			}
		};
	}());
}
/**
 * MX全局对象
 * 
 * @namespace MX全局对象
 * @type {Object}
 */
MX = {
	/**
	 * 是否调试模式
	 * 
	 *            @example
	 *            if (MX.jsDebug){
	 *                
	 *            }
	 */
	jsDebug : document.location.search.hasString('jsDebug'),
	/**
	 * 执行<scrcript>块中的JS
	 * 
	 * @param {String} String 需要执行的字符串
	 *            @example
	 *            MX.evalScript('<script>var name = "xhlv";</script>');
	 */
	evalScript : function(s){
		var r = this.regExp.script;
		s = (s || '').match(new RegExp(r,'img'));
		if (s) {
			MX.each(s,function(e){
				eval(e.match(new RegExp(r,'im'))[1]);
			});
		}
	},
	log: function(str) {
		var console = $('#test');
		str = [].join.call(arguments, ' ');
		console.text(console.text() + '**********' + str);
	},
	regExp : {
		script : '<script[^>]*>([\\S\\s]*?)<\/script>'
	},
	/**
	 * 事件对象
	 * 
	 * @param {Object} Object 事件对象
	 * @return {Object} Object 事件对象
	 *            @example
	 *            el.onclick = function(e){
	 *                var E = MX.E(e);
	 *                E.clone; //是否是克隆的事件对象
	 *                E.type; //事件类型
	 *                E.target; //事件发生的Dom对象
	 *                E.relatedTarget; //事件发生的关联Dom对象
	 *                E.x; //事件发生的x坐标
	 *                E.y; //事件发生的y坐标
	 *                E.button; //鼠标按钮值
	 *                E.key; //键盘按钮值
	 *                E.shift; //是否按下shift
	 *                E.alt; //是否按下alt
	 *                E.ctrl; //是否按下ctrl
	 *                E.wheel; //鼠标滚轮滚动值
	 *                document.body.scrollTop -= 150 * E.wheel;
	 *                E.stop(); //阻止事件冒泡
	 *                E.prevent(); //阻止默认事件行为
	 *            }
	 */
	E : function(e) {
		if (e && e.clone) {
			return e;
		}
		e = window.event || e || {};
		var result = {
			clone : true,
			stop : function() {
				if (e && e.stopPropagation) {
					e.stopPropagation();
				} else {
					e.cancelBubble = true;
				}
			},
			prevent : function(){
				if (e && e.preventDefault) {
					e.preventDefault();
				} else {
					e.returnValue = false;
				}
			},
			target : e.target || e.srcElement,
			relatedTarget : e.relatedTarget || (e.fromElement && e.fromElement === e.srcElement ? e.toElement : e.fromElement),
			x : e.clientX || e.pageX,
			y : e.clientY || e.pageY,
			button : e.button,
			key : e.keyCode,
			shift : e.shiftKey,
			alt : e.altKey,
			ctrl : e.ctrlKey,
			type : e.type,
			wheel : e.wheelDelta/120 || -e.detail/3
		};
		if (e.touches && e.touches.length){
			var touches = e.touches[0];
			result.screenX = touches.screenX;
			result.screenY = touches.screenY;
		}
		MX.each(e, function(o, i){
			if (MX.isUndefined(result[i])){
				result[i] = o;
			}
		});
		return result;
	},
	/**
	 * 判断是否为对象
	 * 
	 * @param {Object} Object 对象
	 * @return {Boolean} Boolean 是否为对象
	 *            @example
	 *            MX.isObject(obj);
	 */
	isObject : function(o) {
		return typeof o == 'object';
	},
	/**
	 * 判断是否为Element对象
	 * 
	 * @param {Object} Object 对象
	 * @return {Boolean} Boolean 是否为Element对象
	 *            @example
	 *            MX.isElement(obj);
	 */
	isElement : function(o) {
		return o && o.nodeType == 1;
	},
	/**
	 * 判断是否为Undefined
	 * 
	 * @param {Object} Object 对象
	 * @return {Boolean} Boolean 是否为Undefined
	 *            @example
	 *            MX.isUndefined(obj);
	 */
	isUndefined : function(o) {
		return typeof o === 'undefined';
	},
	/**
	 * 判断是否为字符串
	 * 
	 * @param {Object} Object 对象
	 * @return {Boolean} Boolean 是否为字符串
	 *            @example
	 *            MX.isString(obj);
	 */
	isString : function(o) {
		return $.type(o) == 'string';
	},
	/**
	 * 判断点击时是否移动了触摸
	 * 
	 * @return {Boolean} Boolean 是否为移动了触摸
	 *            @example
	 *            // 需要事先在el或其父级绑定touchstart,touchmove来控制MX.isTouchMove
	 *            $(el).on('click',function(){
	 *                if (MX.isTouchMove){
	 *                    //触摸时移动了的逻辑
	 *                }
	 *            });
	 */
	isTouchMove : 0,
	/**
	 * 获取网络类型
	 * 
	 * @return {Number} Number 网络类型（0-无网络 1-Wifi 2-2G网络 3-3G网络 4-4G网络） 
	 *            @example
	 *                // 需要事先加载utils/getNetwork模块
	 *                if (MX.getNetwork == 1){
	 *                    
	 *                }
	 */
	getNetwork : 0,
	/**
	 * 获取Json对象
	 * 
	 * @param {String} String Json字符串
	 * @return {Object} Object Json对象
	 *            @example
	 *            data = MX.json(data); //主要用于Json容错
	 */
	json : function(data){
		var o = {};
		if (MX.isObject(data)) {
			o = data;
		} else if(data) {
			try {
				o = JSON.parse(data);
			} catch(ignore) {}
		}
		return o;
	},
	/**
	 * 本地存储
	 * 
	 * @param {String} name 字段名
	 * @return {String} String 存储值
	 *            @example
	 *            data = MI.storage('option_cache');
	 */
	storage : function(name, value){
		if (value == undefined){
			return localStorage[name] || '';
		}
		localStorage[name] = value;
	},
	/**
	 * cookie操作
	 * 
	 * @param {Object} option 配置
	 * @return {String} String cookie值
	 *            @example
	 *            var refresh = MX.cookie({
	 *                name : 'refresh'
	 *            });
	 *            
	 *            // 设置refresh为1
	 *            MX.cookie({
	 *                name : 'refresh',
	 *                value : 1
	 *            });
	 *            
	 *            // 设置refresh为1，存活7天
	 *            MX.cookie({
	 *                name : 'refresh',
	 *                value : 1,
	 *                date : 7
	 *            });
	 *            
	 *            // 设置设置refresh为1，存活7天，域名qq.com
	 *            MX.cookie({
	 *                name : 'refresh',
	 *                value : 1,
	 *                date : 7,
	 *                domain : 'qq.com'
	 *            });
	 */
	cookie : function(option) {
		var name, cookie, i, l, c, k, date;
		if (MX.isUndefined(option.value)) {
			name = option.name + '=';
			cookie = document.cookie.split(';');
			for (i = 0, l = cookie.length; i < l; i++) {
				c = cookie[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1, c.length);
				}
				if (c.indexOf(name) == 0) {
					return decodeURIComponent(c.substring(name.length, c.length));
				}
			}
			return '';
		}
		k = '';
		if (option.date) {
			date = Date.now();
			date.setTime(date.getTime() + option.date * 24 * 60 * 60 * 1000);
			k = '; expires=' + date.toGMTString();
		}
		document.cookie = option.name + '=' + option.value + k + '; path=/' + (option.domain ? ';domain=' + option.domain : '');
	},
	/**
	 * 遍历数组
	 * 
	 * @param {Array|Object} Array|Object 数组
	 * @param {Function} Function 函数
	 *            @example
	 *            MX.each([1,2,3],function(o,i){ //o为数组中的项，i为索引
	 *                if (o >= 2){
	 *                    return 1; //返回True可以break
	 *                }
	 *            });
	 */
	each : function(o,f) {
		var key, i, n;
		if (o){
			if(MX.isUndefined(o[0]) && !$.isArray(o)){
				for (key in o){
					if (f(o[key],key)){
						break;
					}
				}
			}
			else{
				for(i = 0,n = o.length;i < n;i++){
					if (f(o[i],i)){
						break;
					}
				}
			}
		}
	},
	/**
	 * 数字补零
	 * 
	 * @param {Number} Number 数字
	 * @return {Number} Number 补零位数
	 * @return {String} String 补零后的字符串
	 *            @example
	 *            MX.addZero(9,2); //返回 09
	 */
	addZero : function(num,n) {
		n = n || 2;
		return Array(Math.abs(('' + num).length - (n + 1))).join(0) + num;
	},
	/**
	 * 生成随机数
	 * 
	 * @param {Number} Number 最小值
	 * @param {Number} Number 最大值
	 * @return {Number} Number 随机数
	 *            @example
	 *            UI.random(); //默认0 - 9
	 *            UI.random(0,1000);
	 */
	random : function(a, b) {
		a = a || 0;
		if(MX.isUndefined(b)) {
			b = 9;
		}
		return Math.floor(Math.random() * (b - a + 1) + a);
	},
	/**
	 * 将方法绑定在对象上
	 * @param {Object} fn 目标方法
	 * @param {Object} scope 母体对象
	 *            @example
	 *            var e = MX.bind(objA, funB);
	 */
	bind : function(fn, scope) {
		return function() {
			return fn.apply(scope, Array.prototype.slice.call(arguments));
		};
	},
	clone : function clone(obj) {
		var newObj, key;

		if (obj === null || typeof obj !== 'object') {
			newObj = obj;
		} else {

			newObj = new obj.constructor();

			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					newObj[key] = clone(obj[key]);
				}
			}
		}

		return newObj;
	},
	/**
	 * 微信JSBridge
	 *            @example
	 *            MX.WeixinJSBridge(function(){
	 *                WeixinJSBridge.invoke('hideOptionMenu');
	 *            });
	 */
	WeixinJSBridge : function(callback){
		if (window.WeixinJSBridge && window.WeixinJSBridge.invoke){
			callback();
		} else {
			$(document).on('WeixinJSBridgeReady', callback);
		}
	},
	/**
	 * 获得当前url的参数
	 * 
	 * @param {String} href url地址（默认取location.href）
	 * @param {String} type 取值类型： "?"、 "#" （默认值为"?"）
	 * @return {Object} Object 参数对象
	 *            @example
	 *            var url = MX.parseUrl();
	 *            
	 *            var url = MX.parseUrl('http://t.qq.com/xhlv?setTheme=1');
	 *            
	 *            var hashValue = MX.parseUrl('','#');
	 *            
	 *            var hashValue = MX.parseUrl('http://t.qq.com/xhlv#setTheme=1','#');
	 *            
	 */
	parseUrl : function(href, type) {
		var url = href || document.location.href, v = {}, str, i, len, value;
		type = type || '?';
		if (!url.hasString(type)) {
			return v;
		}
		str = url.split(type)[1].split('&');
		for (i = 0, len = str.length;i < len; i++) {
			value = str[i].replace(/#.*$/g,'').split('=');
			if (!value[1]) {
				value[1] = '';
			}
			v[value[0]] = value[1];
		}
		return v;
	},
	/**
	 * CSS3动画
	 * @param {Object} option 配置（target,x,y,z,time）
	 * @return {Object} 返回动画CSS
	 *            @example
	 *            var cssObj = MX.transition({
	 *                time : 500
	 *            });
	 *            $(el).css(cssObj);
	 *            
	 *            MX.transition({
	 *                target : el,
	 *                time : 500
	 *            });
	 */
	transition : function(option){
		var cssObj = {};
		option = option || {};
		cssObj['-webkit-transition'] = cssObj.transition = (option.time || 0) + 'ms cubic-bezier(0.1, 0.57, 0.1, 1)';
		cssObj['-webkit-transform'] = cssObj.transform = 'translate(' + (option.x || 0) + 'px,' + (option.y || 0) + 'px)' +
			 'translateZ(' + (option.z || 0) + 'px)';
		cssObj.display = false;
		if (option.target){
			$(option.target).css(cssObj);
		}
		return cssObj;
	},
	/**
	 * 字符串相关方法
	 * 
	 * @type {Number}
	 *            @example
	 *            MX.string.length('中en'); //获取中英文总字符长度
	 *            MX.string.cut('我是xhlv',4,''); //按字符长度裁剪字符串
	 */
	string: {
		length : function(str){
			var arr = (str || '').match(/[^\x00-\x80]/g);
			return str.length + (arr ? arr.length : 0);
		},
		/**
		 * 按字符长度裁剪字符串
		 * 
		 * @param {String} String 原字符串
		 * @return {number}  number截取长度
		 * @return {string}  string 截取后填充字符
		 *            @example
		 *            MX.string.cut('我是xiaom565',4,'');    //返回  '我是'
		 *            MX.string.cut('daklfjsklafjas',7,''); //返回  'daklfjs' 
		 */
		cut : function(str, num, replace) {
			var arrNew = [],
				strNew = '',
				arr,
				length = MX.string.length(str);
			replace = MX.isUndefined(replace) ? '…': replace;
			if (length > num) {
				arr = str.split('');
				MX.each(arr,function(o){
					num -= MX.string.length(o);
					if (num >= 0) {
						arrNew.push(o);
					} else {
						return 1;
					}
				});
				strNew = arrNew.join('') + replace;
			}
			else {
				strNew = str;
			}
			return strNew;
		}
	}
};

/**
 * 代理事件
 * 
 * @param {Object} el 目标DOM（或jQuery等对象，例：jQuery(el)、Zepto(el)、Hammer(el)）
 * @param {String} eventName 事件名
 * @param {Function} event 事件触发函数
 * @param {Array} rule 选择器规则（中间最多只能省略10个节点），例：['.atWen .txt','.subTab1 .left a','.areaInfo a','.atWen,.txt','#hotTopic li a','*|pane=']
 * @param {Number} depth 匹配深度（默认只匹配5级dom结构）
 *            @example
 *            var Self = {}; //某个对象实例
 *            
 *            //批量代理
 *            var events = {
 *                '.remove_side_app' : function(e,Self){
 *                    
 *                },
 *                '.refresh_side_app' : function(e,Self){
 *                    //this为匹配到的dom元素
 *                    var el = this;
 *                    
 *                    //e为事件对象
 *                    e.prevent(); //一般用于阻止<a href="#"></a>跳回顶部
 *                    
 *                    //阻止代理冒泡（即同一代理中后添加的事件不执行，如后面的'.refresh_side_app,.next'，以MX.proxyEvent的selector顺序为准）
 *                    MX.proxyEvent.stop();
 *                },
 *                '.refresh_side_app,.next' : function(e,Self){
 *                    
 *                }
 *            };
 *            MX.proxyEvent(el, 'click', function(o) {
 *                return function(e) {
 *                    console.log(this,o);
 *                    var T = this;
 *                    events[o] && events[o].call(T,e,Self);
 *                }
 *            }, ['.remove_side_app','.refresh_side_app','.refresh_side_app,.next']);
 *            
 *            
 *            //单个代理
 *            MX.proxyEvent(el, 'click', function(o) {
 *                return function(e) {
 *                    //e为事件对象，o为匹配的selector，this为匹配到的dom元素
 *                    console.log(this,o);
 *                    
 *                    //do something
 *                    
 *                    e.prevent();
 *                }
 *            }, ['.remove_side_app']);
 *            
 *            //设置匹配深度到10（click事件加到10性能问题不大，mouseover建议使用默认的5，否则会有性能问题）
 *            MX.proxyEvent(el, 'click', function(o) {
 *                return function(e) {
 *                    //do something
 *                }
 *            }, ['.remove_side_app'], 10);
 *            
 *            //第三方选择器绑定
 *            MX.proxyEvent(Zepto(el), 'tap', function(o) {
 *                return function(e) {
 *                    console.log(this,o);
 *                    var T = this;
 *                    events[o] && events[o].call(T,e,Self);
 *                }
 *            }, ['.remove_side_app','.refresh_side_app','.refresh_side_app,.next']);
 *            
 */
MX.proxyEvent = (function(){
	/**
	 * 事件绑定
	 * 
	 * @param {Object} el 目标DOM
	 * @param {String} eventName 事件名
	 * @return {Array} events 事件
	 * @return {Number} domNum DOM判断个数
	 *            @example
	 *            proxyEvent(el, 'click', [[function(e) {
	 *                console.log(this.id);
	 *                e.stop();
	 *            }, function(e) {
	 *                return MX.hasClass(e, 'remove_side_app');
	 *            }]]);
	 */
	var getData = function(target, el, domNum) { //目标DOM、范围、深度
		var domNumber = 1,
			targets = [],
			paths = [],
			className;
		if (MX.isElement(target)) { //兼容IE6、IE7中disabled的input，mousedown事件获取target异常，点击文字返回的是object，但没有任何属性...点击边框没问题...
			while(target){
				domNumber++;
				targets.push(target);
				className = target.className;
				className = (MX.isString(className) ? className : '').split(' ').join('.');
				paths.push(target.nodeName.toLowerCase() + (target.id ? '#' + target.id : '') + (className ? '.' + className : ''));
				if ((domNum && domNumber >= domNum) || target === el) {
					target = null;
					MX.proxyEventStop = 0;
				} else {
					target = target.parentNode;
				}
			}
		}
		return [paths, targets];
	},
	getElement = function(el) { //获取真实DOM
		return MX.isElement(el) ? el : el[0] || el.element;
	},
	proxyEvent = function(el,eventName,events,domNum) {
		var event = function(e) {
			var E = MX.E(e),
				target = E.target,
				proxyEventCache = {}, //Cache用于去重
				data = getData(target, getElement(el), domNum);
			$.map(data[1], function(o,index) {
				var i, num, result;
				for (i = 0, num = events.length; i < num; i++){
					result = events[i][1](o,data[0],data[1],index,proxyEventCache);
					if (result){
						events[i][0].call(MX.isElement(result) ? result : o,E);
					}
				}
			});
		};
		if (MX.isElement(el)){
			$(el).on(eventName,event);
		}
		else {
			el.on(eventName,event);
		}
	},
	check = function(e, o, paths, targets, pathIndex, proxyEventCache, depth) { //检查DOM（目标对象,选择器,路径,目标,路径索引）
		var isBtn, //是否验证通过的按钮
			target, //点击目标DOM
			rule,
			cssRule,
			relRule = [];
		o = $.trim(o).replace(/\s+/g,' ').replace(/\s*,\s*/g,',');
		rule = o.split('|');
		if (rule.length == 2){
			relRule = rule[1].split('&');
		}
		cssRule = rule[0].split(',');
		if (!MX.proxyEventStop && !proxyEventCache[o]){
			MX.each(cssRule, function(s) { //验证样式名
				var el, elIndex, css, cssIndex, i;
				if (s == '*'){
					isBtn = 1;
				}
				else if (s){
					isBtn = 0;
					elIndex = pathIndex;
					css = s.split(' ');
					cssIndex = css.length - 1;
					//支持 '.subTab1 .left a' 和  '.subTab1 a'
					for (i = cssIndex + depth; i >= 0; i--){ //循环paths的方式
						el = paths[elIndex];
						if (checkCss(el,css[cssIndex])){
							if (!target){
								target = targets[elIndex];
							}
							cssIndex--;
						}
						//console.log('count:', count, i, cssIndex,css[cssIndex]);//, el
						if (cssIndex < 0 || !el){
							break;
						}
						elIndex++;
					}
					//验证通过
					if (cssIndex < 0){
						isBtn = 1;
					}
				}
				if (isBtn){ //只要一个验证通过就break掉MX.each
					return 1;
				}
			});
			$.map(relRule,function(s){ //验证属性
				var rel = s.split('=');
				if (!((rel[1] && $(e).attr(rel[0]) == rel[1]) || (rel[1] == '' && $(e).attr(rel[0])))){
					isBtn = 0;
				}
			});
		}
		if (isBtn && target){
			//把e修正为匹配到的target
			if (target){
				isBtn = target;
			}
			//匹配到过的selector不再匹配
			proxyEventCache[o] = 1;
		//console.log(depth,isBtn,e,o,'xxxxxxx',+new Date() - time,MX.proxyEventCache);
		}
		return isBtn;
	},
	checkCss = function(e, css) { //验证样式名
		var className = css.match(/[\.#]?[\w|\-]+/g),
			result = 1;
		if (e){
			$.map(className,function(o){
				var type = o.slice(0,1),
					value;
				if (type == '.'){ //样式名
					value = e.match(/\.[^\.#]+/g);
					if (!(value && $.inArray(o, value) > -1)){
						result = 0;
					}
				}
				else if (type == '#'){ //ID
					value = e.match(/#\w+/g);
					if (!(value && value[0] == o)){
						result = 0;
					}
				}
				else { //标签名
					value = e.match(/\w+/g);
					if (!(value && value[0] == o)){
						result = 0;
					}
				}
			});
			return result;
		}
	};
	
	/**
	 * 选择器验证
	 * 
	 * @param {Object} el 目标DOM
	 * @param {Array} rule 选择器规则（中间最多只能省略10个节点），例：['.atWen .txt','.subTab1 .left a','.areaInfo a','.atWen,.txt','#hotTopic li a','*|pane=']
	 * @param {Number} depth 匹配深度（默认只匹配5级dom结构）
	 * @return {Boolean} result 是否验证通过
	 *            @example
	 *                MX.isSelector(el, '.atWen .txt');
	 */
	MX.isSelector = function(target, selector, depth){
		var data = getData(target, null, depth),
			proxyEventCache = {},
			result;
		depth = depth || 5;
		MX.each(data[1],function(o,index){
			result = check(o,selector,data[0],data[1],index,proxyEventCache,depth);
			if (result){
				return true;
			}
		});
		return result;
	};

	//全局代理Hash
	var hash = 'p_h',
		hashIndex,
		proxyEventsHash = {},
		proxyEventsHashIndex = +new Date(),
		proxyEventsHashStart = proxyEventsHashIndex;
	
	return function(el,eventName,event,selector,depth){
		var elExist = getElement(el), //获取真实DOM
			proxy, //代理
			proxyEvents; //代理事件
		if (el){
			hashIndex = $(elExist).attr(hash);
			if (!hashIndex || hashIndex < proxyEventsHashStart){ //设置hash
				$(elExist).attr(hash,proxyEventsHashIndex);
				proxyEventsHash[proxyEventsHashIndex] = {};
				proxyEventsHashIndex++;
			}
			proxy = proxyEventsHash[$(elExist).attr(hash)];
			if (!proxy[eventName]){
				proxy[eventName] = [];
				proxyEvent(el, eventName, proxy[eventName], depth || 10);
			}
			proxyEvents = proxy[eventName];
			MX.each(selector,function(o){
				if (o){
					proxyEvents.push([
						event(o),
						function(e,paths,targets,pathIndex,proxyEventCache){
							return check(e,o,paths,targets,pathIndex,proxyEventCache,depth || 5);
						}
					]);
				}
			});
		}
	};
}());
MX.txTpl = (function(){
	var cache = {};
	return function(str, data, startSelector, endSelector, isCache){
		var fn,
			d = data,
			valueArr = [],
			i, list, len,
			propArr, formatTpl,
			p,
			fnName, fnStr;
		isCache = isCache !== undefined ? isCache : true;
		if(isCache && cache[str]) {
			for (i = 0, list = cache[str].propList, len = list.length; i < len; i++) {
				valueArr.push(d[list[i]]);
			}	
			fn = cache[str].parsefn;
		} else {
			propArr = [];
			formatTpl = (function(str, startSelector, endSelector) {
				var tpl;
				if(!startSelector){
					startSelector = '<%';
				}
				if(!endSelector) {
					endSelector = '%>';
				}
				tpl = !/[^\w\d_:\.\-]/g.test(str) ? document.getElementById(str).innerHTML : str;
				return tpl
					.replace(/\\/g, "\\\\")
					.replace(/[\r\t\n]/g, " ")
					.split(startSelector).join("\t")
					.replace(new RegExp("((^|" + endSelector+")[^\t]*)'", "g"), "$1\r")
					.replace(new RegExp("\t=(.*?)" + endSelector, "g"), "';\n s+=$1;\n s+='")
					.split("\t").join("';\n")
					.split(endSelector).join("\n s+='")
					.split("\r").join("\\'");	
			}(str, startSelector, endSelector));	
			for (p in d) {
				if(d.hasOwnProperty(p)) {
					propArr.push(p);
					valueArr.push(d[p]);
				}
			}	
			fn = new Function(propArr, " var s='';\n s+='" + formatTpl + "';\n return s");
			if(isCache) {
				cache[str] = {
					parsefn: fn, 
					propList: propArr
				};
			}
		}
			
		try {
			return fn.apply(null,valueArr);
		} catch(e) {
			function globalEval(strScript) {
				var head = document.getElementsByTagName("head")[0],
					script = document.createElement("script"),
					ua = navigator.userAgent.toLowerCase(); 
				if(ua.hasString('gecko') && !ua.hasString('khtml')) { 
					window.eval(fnStr);
					return;
				}				
				script.innerHTML = strScript; 
				head.appendChild(script); 
				head.removeChild(script);
			}	
			
			fnName = 'txTpl' + Date.now();
			fnStr = 'var ' + fnName + '=' + fn.toString();
			globalEval(fnStr);
			window[fnName].apply(null, valueArr);		
		}			
	};
}());
/**
 * 代理事件封装
 * @param {Object}map 事件map
 * @param {DOMElement}wrap 外层容器，默认为document.body,可以使用第三方选择器，如jQuery('wrap')
 * @param {*}data 其他数据，会传递到事件处理函数的参数中
 *
 * @example
 *		MX.delegate({
 *			'tap,click' : {
 *				'__self__':function(e, that, data){//__self__是保留字符串，给该字符串定义处理函数之后表示，当事件触发时，如果target上没有定义其他操作，就执行wrap自身上定义的操作
 *				},
 *				'.msg a' : function(e, that, data){
 *					//e-事件对象；that-触发事件的target；data-{id:12345678}
 *				}
 *			}
 *		}, Zepto('wrap'), {id:12345678})
 */
MX.delegate = function(map, wrap, data){
	if(!wrap || ($.isArray(wrap) && wrap.length === 0)){
		wrap = document.body;
	}

	data = data || {};
	
	function _getSelects(obj){
		var selects = [];
		$.map(obj, function(handle, select){
			selects.push(select);
		});
		return selects;
	}

	//查找选择器数组中是否有__self,并返回
	function _findSelf(selects){
		var res;
		MX.each(selects, function(select){
			if(select.hasString('__self__')){
				res = select;
				return true;
			}
		});
		return res;
	}

	//判断此结点是否有事件处理方法
	function _hasHandler(el, selects){
		var res = false;
		MX.each(selects, function(select){
			if($(el).closest(select)){
				res = true;
				return true;
			}
		});
		return res;
	}

	$.map(map, function(handlers, evts) {
		var selects = _getSelects(handlers);
		evts = evts.split(',');//支持事件数组，','分隔
		$.map(evts, function(evt) {
			var __self__;
			if ($.os.android && evt == 'tap'){
				evt = 'click';
			}
			//查找是否有__self__
			__self__ = _findSelf(selects);
			if(__self__){
				var _wrap = wrap[0] || wrap;//处理jQuery返回的DOM
				$(_wrap).on(evt, function(e){
					var T = wrap;
					e = MX.E(e);
					//判断target是否已经定义了事件
					if(!_hasHandler(e.target, selects) && handlers[__self__]) {
						handlers[__self__].call(T, e, T, data);
					}
				});
			}

			//处理不支持冒泡的事件
			if($.inArray(evt.toLowerCase(), MX.delegate.noBubble) > -1) {
				$.map(selects, function(select) {
					var _wrap = wrap[0] || wrap;//处理jQuery返回的DOM
					var target = $(select, $(_wrap))[0];
					$(target).on(evt, function(e){
						var T = target;//IE8中，this指向了window
						if(handlers[select]){
							handlers[select].call(T, e, T, data);
						}
					});
				});
			}
			else{
				MX.proxyEvent(wrap, evt, function(select){
					return function(e){
						var T = this;
						if(handlers[select]){
							handlers[select].call(T, e, T, data);
						}
					};
				}, selects);
			}
		});
	});
};
//不支持冒泡的事件数组
MX.delegate.noBubble = ['focus', 'blur', 'change', 'keyup', 'keydown', 'input'];
/**
 * 阻止代理事件冒泡
 * 
 *            @example
 *            MX.proxyEvent.stop();
 */
MX.proxyEvent.stop = function(){
	MX.proxyEventStop = 1;
};

//继承已有MX
if (window.MX_) {
	MX_();
}
