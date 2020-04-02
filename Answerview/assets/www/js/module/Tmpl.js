define('module/Tmpl', ['lib/zepto'], function(require) {
	'use strict';
	var tmpl = {}, listAll;
	listAll = {
		init: [
			'<%',
			'var i,len,answers,answer,question,medias;',
			'answers=data.machine_answers||data.answers;',
			'question=data.question;',
			'medias=data.audios;',
			'%>'
		],
		topPic: [
			'<div id="PhotoFixed" class="photo-fixed">',
				'<%if(question){%>',
					'<div id="Photo" class="photo">',
						'<img src="<%=question.image_path%>" data-image-id="<%=question.image_id%>">',
					'</div>',
				'<%}else{%>',
					'<div id="Photo" title="fail" data-fail="1">',
						'<img src="images/photo-fail.png">',
					'</div>',
				'<%}%>',
			'</div>'
		],
		containerStart: [
			'<div id="iScroll">',
					'<div id="PhotoFrame" class="photo-frame"></div>',
					'<div id="content-container" class="content-container <%if(data.loading){%>solution-loading<%}%>">'
		],
		nav: [
			'<%len=answers.length;%>',
			'<div class="index-frame">',
			'<ul id="result-indexs" class="result-indexs">',
			'<%if(len>1){%>',
				'<%for(i=0;i<len;++i){%>',
					'<li data-index="<%=i%>" class="index<%if(i===data.index){%> index-current<%}%>"><div><%=i+1%></div></li>',
				'<%}%>',
			'<%}%>',
			'</ul>',
			'</div>'
		],
		solutionStart: [
			'<div class="solution-frame">',
				'<div id="Solution" class="solution">'
		],
		loading: [
			'<div id="no-solution" class="no-solution">',
				'<img class="waitting" id="waitting" src="images/loading.png" lazy-src="images/loading.png" alt="加载中…">',
				'<span id="WaitRemind" class="waitting-remind" style="display:none">网络不给力，请稍后重试</span>',
			'</div>'
		],
		contentStart: [
			'<%for(i=0;i<len;++i){',
				'answer=answers[i];',
			'%>',
			'<div class="content<%if(i===data.index || len === 1){%> result-current<%}%>">'
		],
		question: [
			'<div class="solve question-solve">',
				'<div class="section-title question-title">',
					'题目',
					'<span class="subject-frame-l">【</span>',
					'<span id="Subject" class="subject"><%=["未知","数学","语文","英语","政治","历史","地理","物理","化学","生物","众答"][answer.subject]%></span>',
					'<span class="subject-frame-r">】</span>',
				'</div>',
				'<div class="question-frame question-frame-fold">',
					'<div class="question detail question-item">',
						'<div class="question-body"><%=answer.body||answer.question_body_html||""%></div>',
					'</div>',
					'<div class="fold">',
						'<span>显示全部</span>',
					'</div>',
				'</div>',
			'</div>'
		],
		answerStart: [
			'<div class="solve answer-solve">',
				'<div class="section-title answer-title">解答</div>'
		],
		mediaStart: [
			'<ul class="courses" data-question-id="<%=answer.questionId%>">'
		],
		medias: [
			'<%var j,mediaLen=medias.length,media;%>',
			'<%if(!mediaLen){%>',
				'<div class="no-course">',
					'<span class="topic">此答案暂无讲解</span>',
				'</div>',
			'<%}else{%>',
				'<%for(j=0;j<mediaLen;++j){',
					'media=medias[j];',
				'%>',
				'<li class="course <%if(!media.is_pay){%>course-nopay<%if(media.limited_free || media.gold === 0){%> limited-free<%}%><%}%>" data-duration="<%=media.duration%>" data-type="<%=media.type%>" <%if(media.type===2){%>data-wbtype="<%=media.wb_type%>"<%}%> data-gold="<%=media.gold%>" data-url="<%=media.url%>" id="<%=media.id%>" data-teacher-id="<%=media.teacher.id||""%>" data-teacher-name="<%=media.teacher.name||""%>" data-comment="<%=media.hasCommentAudio%>" data-name="<%=media.name%>">',
					'<div class="course-status<%if(!media.is_pay){%> course-status-nopay<%if(media.limited_free || media.gold === 0){%> course-limited-free<%}%><%}else{%> course-status-start<%}%>"></div>',
					'<%if(media.teacher.name && (media.teacher.star >= 3 || media.teacher.isFollowed)){%>',
						'<div class="teacher teacher-excellent"><%=media.teacher.name.length>3?media.teacher.name.substr(0,2)+"…":media.teacher.name%>老师</div>',
					'<%}else{%>',
						'<div class="teacher">笔声名师</div>',
					'<%}%>',
					'<div class="types">',
						'<span class="type"><%=["", "音频", "白板"][media.type]%>讲解</span>',
						'<%if(!media.is_pay){%>',
							'<span class="course-new">new</span>',
						'<%}%>',
					'</div>',
					'<%if(media.teacher.name){%>',
						'<div class="interactive">互动</div>',
					'<%}%>',
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
			'</ul>',
			'<div class="request request-loading">请求名师讲解</div>'
		],
		answer: [
			'<div id="answer" class="answer detail question-item"><%=answer.answer||answer.question_answer||""%></div>'
		],
		analysis: [
			'<%',
				'var analysis = answer.analysis||answer.answer_analysis||"";',
				'if(analysis.toLowerCase() === "null") {',
					'analysis = "";',
				'}',
			'%>',
			'<div id="analysis" class="analysis detail question-item"><%=analysis%></div>'
		],
		answerEnd: [
			'</div>'
		],
		knowledge: [
			'<div class="solve theme-solve">',
				'<div class="section-title theme-title">知识点</div>',
				'<%',
					'var tags = answer.tags||answer.question_tag||"";',
					'if(tags.toLowerCase() === "null") {',
						'tags = "";',
					'}',
				'%>',
				'<div id="theme" class="theme detail question-item"><%=tags%></div>',
			'</div>'
		],
		contentEnd: [
			'</div>',
			'<%}%>'
		],
		solutionEnd: [
				'</div>',
			'</div>'
		],
		help: [
			'</div>',
			'<div id="SeekHelp" class="seekhelps">',
				'<div id="noanswer-remind" class="noanswer">',
					'<img src="images/noanswer.png">',
				'</div>',
				'<%if($.os.android){%>',
					'<span id="help-title" class="help-title">答案不满意</span>',
					'<span id="students-help" class="seek-help">求助学霸</span>',
				'<%}else{%>',
					'<div id="report-error" class="report-error">',
						'没有我拍的题目，<span>我要报错</span>',
					'</div>',
				'<%}%>',
			'</div>'
		],
		containerEnd: [
					'</div>',
			'</div>'
		]
	};
	tmpl.getTmpl = function(items, config) {
		var i, len, localTmpl = [];
		config = config || {};
		listAll = $.extend(listAll, config);
		switch(items) {
			case 'all':
				items = [
					'init',
					'topPic', 'containerStart',
					// content 
					'nav', 'solutionStart', 'contentStart', 'question', 'answerStart', 'mediaStart',
					'medias',
					'mediaEnd', 'answer', 'analysis', 'answerEnd', 'knowledge', 'contentEnd', 'solutionEnd',
					'help',
					'containerEnd'
				];
				break;
			case 'no-medias':
				items = [
					'init',
					'topPic', 'containerStart',
					// content 
					'nav', 'solutionStart', 'contentStart', 'question', 'answerStart', 'mediaStart', 'mediaEnd', 'answer', 'analysis', 'answerEnd', 'knowledge', 'contentEnd', 'solutionEnd',
					'help',
					'containerEnd'
				];
				break;
			case 'init':
				items = ['init', 'topPic', 'containerStart', 'loading', 'help', 'containerEnd'];
				break;
			case 'content': 
				items = ['init', 'nav', 'solutionStart', 'contentStart', 'question', 'answerStart', 'mediaStart', 'mediaEnd', 'answer', 'analysis', 'answerEnd', 'knowledge', 'contentEnd', 'solutionEnd', 'containerEnd'];
				break;
			case 'content-with-medias': 
				items = ['init', 'nav', 'solutionStart', 'contentStart', 'question', 'answerStart', 'mediaStart', 'medias', 'mediaEnd', 'answer', 'analysis', 'answerEnd', 'knowledge', 'contentEnd', 'solutionEnd', 'containerEnd'];
				break;
			default:
				break;
		}
		for(i = 0, len = items.length; i < len; ++i) {
			localTmpl = localTmpl.concat(listAll[items[i]]);
		}
		return localTmpl.join('');
	};
	tmpl.content = tmpl.getTmpl('content');
	tmpl.medias = listAll.medias.join('');
	return tmpl;
});