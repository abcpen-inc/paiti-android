
// 客户端交互行为与Native数据交互
var UserData = new Object();
function getAuthData(data) {
    UserData.user_agent = data.user_agent;
    UserData.token = escape(data.token);
    UserData.cookie = escape(data.cookie);
    UserData.mobile = escape(data.mobile);
}
var setTitle = function() {
    cordova.exec(null, null, 'MyPlugin', 'setTitle', [document.title]);
};
var beginInvite = function() {
    cordova.exec(null, null, 'MyPlugin', 'beginInvite', []);
};
document.addEventListener('deviceready', function() {
    var doc = document;
    setTitle();
    var cb = function(user_data) {
        getAuthData(user_data);
    }
    cordova.exec(cb, null, 'MyPlugin', 'getUserData', []);
    if(doc.getElementById("mall")) {
        viewMall();
        viewMyscore();
    } else if(doc.getElementById("MyGoodsPage")) {
        getMyItemList();
    } else if(doc.getElementById("DetailPage")) {
        getItemDetail();
    } else if(doc.getElementById("SupportPage")) {
        getSupport();
    } else if(doc.getElementById("ExchangePage")) {
        getSaltcode();
        if(typeof localStorage.receiver_name !== "undefined" && localStorage.user_mobile === UserData.mobile) {
            doc.getElementById("UserName").setAttribute("value",localStorage.receiver_name);
            doc.getElementById("UserTel").setAttribute("value",localStorage.receiver_mobile);
            doc.getElementById("UserAddr").value = localStorage.receiver_addr;
            doc.getElementById("UserName").setAttribute("placeholder","");
            doc.getElementById("UserTel").setAttribute("placeholder","");
            doc.getElementById("UserAddr").setAttribute("placeholder","");
        }
    } else if(doc.getElementById("ScoreRecords")) {
        getMyScoreRecords(Mall.time_node);
    }
}, false);
function renderingSupport() {
    var doc = document;
    for(var i=0;i<Mall.support_XHR.msg.length;i++) {
        var li = doc.createElement("li");
        li.className = "get-path";
        li.id = "path"+(i+1);
        li.innerHTML = '<span class="path-title"></span><span class="path-intro"></span>';
        li.getElementsByClassName("path-title")[0].innerText = Mall.support_XHR.msg[i].name;
        var desc = Mall.support_XHR.msg[i].desc;
        var pattern = /([0-9]+[\-]+[0-9]+|[0-9]+)/;
        var score_num = "<span class='score_num'>"+pattern.exec(desc)[0]+"</span>";
        var desc = desc.replace(/([0-9]+[\-]+[0-9]+|[0-9]+)/, score_num);
        li.getElementsByClassName("path-intro")[0].innerHTML = desc;
        if(Mall.support_XHR.msg[i].name === "邀请好友") {
            li.getElementsByClassName("path-title")[0].setAttribute("onclick","beginInvite();");
            li.getElementsByClassName("path-title")[0].setAttribute("title","enter");
        }
        doc.getElementById("GetXuebi").appendChild(li);
    }
    var br = doc.createElement("br");
    br.className = "cl";
    doc.getElementById("GetXuebi").appendChild(br);
}
var mallPlugin = {
    sendVerifiCode:function(tel) {
        cordova.exec(null, null, 'MyPlugify', [tel]);
    },
}