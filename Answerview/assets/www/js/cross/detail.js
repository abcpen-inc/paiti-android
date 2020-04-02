
document.addEventListener("pause", function() {
	// pauseAudio();
}, false);

var myPlugin = {
	getUserInfo: function() {
		cordova.exec(function(result) {
			$(document).trigger('userInfoReady', [result]);
		}, null, 'MyPlugin', 'getUserInfo', []);
	},
	getDetail: function() {
		cordova.exec(null, null, 'MyPlugin', 'getDetail', []);
	},
	showLoading: function() {
		/**
		 * @param [Object] result  结果
		 * @config [Enum] status 状态标识 0 正常
		 * @config [Object] question 问题
		 * @example
		 * {
		 *		status: 0,
		 *		question: {
		 *			 image_path: '缓存图片地址'
		 *		} 
		 *	}
		 */
		var Self = myPlugin;
		cordova.exec(function(result) {
			result.loading = true;
			$(document).trigger('statusChange', [result]);
			Self.showQuestion();
		}, null, 'MyPlugin', 'showLoading', []);
	},
	showQuestion: function() {
		/**
		 * @param [Object] result  结果
		 * @config [Enum] status 状态标识 1 正常 2 缓存 -1 没有题目 -2 无网络
		 * @config [Object] question 问题
		 * @config [Array] mechine_answers 答案
		 * @example
		 *	{
		 *		status: 1,
		 *		question: {
		 *			image_path: '缓存图片地址'
		 *		},
		 *		mechine_answers: [] // 题目信息 
		 *	 }
		 */
		var Self = myPlugin;
		cordova.exec(function(result) {
			result.loading = false;
			// tolerance of unexpected of index
			if(result.index === -1) {
				result.index = 0;
			}
			$(document).trigger('statusChange', [result]);
		}, null, 'MyPlugin', 'showQuestion', []);
	},
	log: function(log_obj, arg_name) {
		var log = '', arg_type, arg;
		arg_name = arg_name || '';
		if(typeof log_obj === 'undefined') {
			arg_type = 'undefined';
			log = 'the argument is not defined!';
		} else if(typeof log_obj === 'object') {
			if(log_obj.length === 0) {
				arg_type = 'dom or undefined';
				log = 'the argument length is 0, it is not exist dom?';
			} else if(log_obj.length === 1 && log_obj[0].tagName) {
				arg_type = 'dom';
				log = log_obj[0].outerHTML.toString();
			} else if(log_obj.length > 1 && log_obj[0].tagName) {
				arg_type = 'dom';
				log = 'the argument is DomNodes, and the first child is: ';
				log += log_obj[0].parent().html().toString();
			} else {
				arg_type = 'object';
				log = JSON.stringify(log_obj);
			}
		} else {
			arg_type = typeof log_obj;
			log = log_obj.toString();
			if(log.length === 0) {
				log = 'the argument is blank!';
			}
		}
		arg = '~~~' + arg_name +'[' + arg_type + ']: ';
		cordova.exec(null, null, 'MyPlugin', 'logJS', [arg, log]);
	},
	playAudio:function() {
		cordova.exec(null, null, 'MyPlugin', 'playAudio', []);
	},
	evaluateAudio:function(course_id) {
		cordova.exec(null, null, 'MyPlugin', 'evaluate', [course_id]);
	},
	resultTitle:function(page) {
		cordova.exec(null, null, 'MyPlugin', 'resultTitle', [page]);
	},
	cacheIndex:function(index){
		cordova.exec(null, null, 'MyPlugin', 'cacheIndex', [+index]);
	},
	reportError:function() {
		cordova.exec(null, null, 'MyPlugin', 'reportError', []);
	},
	showPhoto:function() {
		cordova.exec(null, null, 'MyPlugin', 'viewPic', []);
	},
	showDiscuss:function() {
		cordova.exec(null, null, 'MyPlugin', 'showDiscuss', []);
	},
	seekHelp:function() {
		cordova.exec(null, null, 'MyPlugin', 'helps', []);
	},
	requestAudio:function() {
		cordova.exec(null, null, 'MyPlugin', 'requestAudio', [Results.index]);
	},
	showTeacher:function(teacherId) {
		cordova.exec(null, null, 'MyPlugin', 'showTeacher', [teacherId]);
	},
	interactive:function(teacherId, courseId, courseType, questionId) {
		questionId = questionId || -1;
		cordova.exec(null, null, 'MyPlugin', 'interactive', [teacherId, courseId, courseType, questionId]);
	},
	payAudio:function(courseId, gold, teacherName) {
		cordova.exec(null, null, 'MyPlugin', 'payAudio', [courseId, 1, false, gold, teacherName]);
	},
	payBoard: function(courseId, gold, teacherName) {
		cordova.exec(null, null, 'MyPlugin', 'payBoard', [courseId, 2, false, gold, teacherName]);
	},
	playNoVideo: function(result) {
		cordova.exec(null, null, 'MyPlugin', 'playNoVideo', [result]);
	},
	requestCourseFail:function(xhr_status, data_status) {
		cordova.exec(null, null, 'MyPlugin', 'requestCourseFail', [xhr_status,data_status]);
	},
	requestTeachers: function(priorMedias, hasQuest, hasMedia) {
		cordova.exec(null, null, "MyPlugin", "requestTeachers", [priorMedias, hasQuest, hasMedia]);
	},
	payExercise: function() {
		cordova.exec(null, null, "MyPlugin", "payExercise", []);
	},
	postMedias: function(medias, curIndex) {
		cordova.exec(null, null, "MyPlugin", "postMedias", [medias, curIndex]);
	},
	cacheImg: function(img_data) {
		// return;
		// cordova.exec(null, null, "MyPlugin", "imgCache", [img_data]);
	},
	fullScreenBoard: function(data) {
		cordova.exec(null, null, "MyPlugin", "fullScreenBoard", [data.id, data.url, data.currentTime, data.paused]);
	}
};
