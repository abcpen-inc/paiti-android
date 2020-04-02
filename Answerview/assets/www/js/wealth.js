var Mall = {
    domain:"http://webapi.abcpen.cn",
    mall_list:"",
    all_goods:[],
    myitem_list:"",
    score_records:"",
    time_node:Date.parse(new Date()),
    prize_XHR:"",
    product_id:"",
    score_XHR:"",
    is_login:"",
    support_XHR:"",
    veri_time:60,
    good_list:document.getElementById("GoodList"),
    my_goods:document.getElementById("MyGoods"),
    mall_page:1,
    my_score:0,
    flag:false,
    flagR:false,
    account:"",
    salt_code:"",
    verify_arr:["","","",""],
};
function getMallList(page) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
            var obj = eval("("+xhr.responseText+")");
            if(obj.status === 0) {
                Mall.mall_list = obj;
                if(Mall.mall_list.result.length > 0) {
                    renderingMall(page);
                }
            } else if(obj.status !== 0) {
                alertAnalog(obj.msg,"closeAlert();",obj.msg);
            } else if(!((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304)) {
                alertAnalog("请求失败，请稍后重试","closeAlert();","");
            }
        }
    }
    xhr.open("post",Mall.domain+"/api/product/getProducts",false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("user_agent="+UserData.user_agent+"&token="+UserData.token+"&cookie="+UserData.cookie+"&page="+page);
}
function getMyItemList() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
            var obj = eval("("+xhr.responseText+")");
            if(obj.status === 0) {
                Mall.myitem_list = obj;
                renderingItemList();
            } else if(obj.status !== 0) {
                alertAnalog(obj.msg,"closeAlert();",obj.msg);
            } else if(!((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304)) {
                alertAnalog("请求失败，请稍后重试","closeAlert();","");
            }
        }
    }
    xhr.open("post",Mall.domain+"/api/exchange/getOrdersByUId",false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("user_agent="+UserData.user_agent+"&token="+UserData.token+"&cookie="+UserData.cookie);
}
function getMyScoreRecords(timenode) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
            var obj = eval("("+xhr.responseText+")");
            if(obj.status === 0) {
                Mall.score_records = obj;
                renderingMyScoreRecords();
            } else if(obj.status !== 0) {
                alertAnalog(obj.msg,"closeAlert();",obj.msg);
            } else if(!((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304)) {
                alertAnalog("请求失败，请稍后重试","closeAlert();","");
            }
        }
    }
    xhr.open("post",Mall.domain+"/api/userscore/getscorelist",false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("user_agent="+UserData.user_agent+"&token="+UserData.token+"&cookie="+UserData.cookie+"&time="+timenode);
}
function getItemDetail() {
    var xhr = new XMLHttpRequest();
    Mall.product_id = localStorage.prizeId;
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
            var obj = eval("("+xhr.responseText+")");
            if(obj.status === 0) {
                Mall.prize_XHR = obj;
                renderingDetail();
            } else if(obj.status !== 0) {
                alertAnalog(obj.msg,"closeAlert();",obj.msg);
            } else if(!((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304)) {
                alertAnalog("请求失败，请稍后重试","closeAlert();","");
            }
        }
    }
    xhr.open("post",Mall.domain+"/api/product/getProDtlById/"+Mall.product_id,false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("user_agent="+UserData.user_agent+"&token="+UserData.token+"&cookie="+UserData.cookie+"&product_id="+Mall.product_id);
}
function getMyScore() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
            var obj = eval("("+xhr.responseText+")");
            if(obj.status === 0) {
                Mall.score_XHR = obj;
                renderingMyScore();
            } else if(obj.status !== 0) {
                alertAnalog(obj.msg,"closeAlert();",obj.msg);
                if(obj.status === 403) {
                    Mall.is_login = false;
                    renderingMyScore();
                }
            } else if(!((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304)) {
                alertAnalog("请求失败，请稍后重试","closeAlert();","");
            }
        }
    }
    xhr.open("post",Mall.domain+"/api/user/get_score",false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("user_agent="+UserData.user_agent+"&token="+UserData.token+"&cookie="+UserData.cookie);
}
function getSupport() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
            var obj = eval("("+xhr.responseText+")");
            if(obj.status === 0) {
                Mall.support_XHR = obj;
                renderingSupport();
            } else if(obj.status !== 0) {
                alertAnalog(obj.msg,"closeAlert();",obj.msg);
            } else if(!((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304)) {
                alertAnalog("请求失败，请稍后重试","closeAlert();","");
            }
        }
    }
    xhr.open("post",Mall.domain+"/api/user/getDicScoreList",false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("user_agent="+UserData.user_agent+"&token="+UserData.token+"&cookie="+UserData.cookie+"&version=2.0");
}
function getOrderDetail() {
    var doc = document;
    var order;
    if(event.target.className === "mygood") {
        order = parseInt(event.target.title);
    } else {
        order = parseInt(event.target.parentNode.title);
    }
    doc.getElementById("order_prizename").innerText = Mall.myitem_list.result[order].product_name;
    doc.getElementById("order_needscore").innerText = Mall.myitem_list.result[order].need_score;
    doc.getElementById("order_tele").innerText = Mall.myitem_list.result[order].receiver_mobile;
    doc.getElementById("order_addr").innerText = Mall.myitem_list.result[order].receiver_addr;
    var op_time = new Date(Mall.myitem_list.result[order].create_at);
    var year = op_time.getFullYear();
    var month = op_time.getMonth()+1;
    if(month<10) {
        month = "0"+month;
    }
    var day = op_time.getDate();
    if(day<10) {
        day = "0"+day;
    }
    var hour = op_time.getHours();
    if(hour<10) {
        hour = "0"+hour;
    }
    var minutes = op_time.getMinutes();
    if(minutes<10) {
        minutes = "0"+minutes;
    }
    var second = op_time.getSeconds();
    if(second<10) {
        second = "0"+second;
    }
    var t = year+"-"+month+"-"+day+" "+hour+":"+minutes+":"+second;
    doc.getElementById("order_times").innerText = t;
    var arryStatus = ['开始审核，请等待','已发货，请保持手机通畅','已发货，请保持手机通畅','审核未通过'];
    var statu = Mall.myitem_list.result[order].status;
    if(statu <=3 && statu >=1 ) {
        doc.getElementById("order_status").innerText = arryStatus[statu-1];
    } else if(statu === 4) {
        if(Mall.myitem_list.result[order].reject_reason.length > 0) {
            doc.getElementById("order_status").innerText = arryStatus[3]+'：'+Mall.myitem_list.result[order].reject_reason;
        } else {
            doc.getElementById("order_status").innerText = arryStatus[3];
        }
    } else {
        doc.getElementById("order_status").innerText = '礼品状态有待确认';
    }
    doc.getElementById("OrderDetail").setAttribute("style","display:block;");
    var divBack = doc.createElement("div");
    divBack.id = "OrderBack";
    doc.getElementsByTagName("body")[0].appendChild(divBack);
}
function closeOrder() {
    document.getElementById("OrderDetail").setAttribute("style","display:none;");
    var divBack = document.getElementById("OrderBack");
    divBack.parentNode.removeChild(divBack);
}
function viewMall() {
    var doc = document;
    if(typeof sessionStorage.mallpages === "undefined") {
        getMallList(Mall.mall_page);
    } else {
        Mall.mall_page = parseInt(sessionStorage.mallpages);
        var MallResult = JSON.parse(sessionStorage.goods);
        for(var i=0;i<MallResult.length;i++) {
            var li = doc.createElement("li");
            li.innerHTML = '<div class="good"><div class="thumb-border"><div class="good-thumb"><span class="good-tag">New</span></div></div><div class="good-info"><span class="good-name"></span><span class="good-value"></span><span class="jifen">&nbsp积分</span><br class="cl"></div></div>';
            li.setAttribute("id",MallResult[i]._id);
            li.getElementsByClassName("good-thumb")[0].setAttribute("style","background-image:url("+MallResult[i].picture+")");
            li.getElementsByClassName("good-thumb")[0].setAttribute("title",MallResult[i]._id);
            li.getElementsByClassName("good-thumb")[0].setAttribute("onclick","getPrizeId();");
            li.getElementsByClassName("good-name")[0].innerHTML = MallResult[i].name; 
            li.getElementsByClassName("good-value")[0].innerHTML = MallResult[i].need_score;
            if(MallResult[i].isnew === true) {
                li.getElementsByClassName("good-tag")[0].setAttribute("title",MallResult[i]._id);
                li.getElementsByClassName("good-tag")[0].setAttribute("onclick","getPrizeId();");
            }
            Mall.good_list.appendChild(li);
        }
        window.scrollTo(0,parseInt(sessionStorage.Yset));
    }
}
function viewMyscore() {
    var doc = document;
    if(typeof sessionStorage.MyScore === "undefined") {
        getMyScore();
    } else if(sessionStorage.score_changed === "1") {
        getMyScore();
    } else {
        doc.getElementById("my_score").innerHTML = sessionStorage.MyScore;
        Mall.my_score = parseInt(sessionStorage.MyScore);
        sessionStorage.score_changed = "0";
    }
}
function renderingMall(page) {
    var doc = document;
    if(typeof sessionStorage.goods !== "undefined") {
        Mall.all_goods = JSON.parse(sessionStorage.goods);
    }
    for(var i=0;i<Mall.mall_list.result.length;i++) {
        var li = doc.createElement("li");
        li.innerHTML = '<div class="good"><div class="thumb-border"><div class="good-thumb"><span class="good-tag">New</span></div></div><div class="good-info"><span class="good-name"></span><span class="good-value"></span><span class="jifen">&nbsp积分</span><br class="cl"></div></div>';
        li.setAttribute("id",Mall.mall_list.result[i]._id);
        li.getElementsByClassName("good-thumb")[0].setAttribute("style","background-image:url("+Mall.mall_list.result[i].picture+")");
        li.getElementsByClassName("good-thumb")[0].setAttribute("title",Mall.mall_list.result[i]._id);
        li.getElementsByClassName("good-thumb")[0].setAttribute("onclick","getPrizeId();");
        li.getElementsByClassName("good-name")[0].innerHTML = Mall.mall_list.result[i].name;
        li.getElementsByClassName("good-value")[0].innerHTML = Mall.mall_list.result[i].need_score;
        if(Mall.mall_list.result[i].isnew === true) {
            li.getElementsByClassName("good-tag")[0].setAttribute("title",Mall.mall_list.result[i]._id);
            li.getElementsByClassName("good-tag")[0].setAttribute("onclick","getPrizeId();");
        }
        Mall.good_list.appendChild(li);
        Mall.all_goods.push(Mall.mall_list.result[i]);
    }
    Mall.mall_page = Mall.mall_page+1;
    sessionStorage.mallpages = Mall.mall_page;
    sessionStorage.goods = JSON.stringify(Mall.all_goods);
}
function renderingItemList() {
    var doc = document;
    if(Mall.myitem_list.result.length === 0 || typeof Mall.myitem_list.result === "undefined") {
        var img_path = "../images/mall/xueba.png";
        var title = "没有兑换过礼品";
        var remind = "去抢答赚积分，兑换礼品吧";
        remindBlank(img_path,title,remind);
    }
    for(var i=Mall.myitem_list.result.length-1;i>=0;i--) {
        var li = doc.createElement("li");
        li.className = "mygood";
        li.innerHTML = '<span class="mygood-thumb"></span><span class="mygood-name"></span><br><span class="creat-time"></span><br><span class="status"></span><br class="cl">';
        li.setAttribute("id",Mall.myitem_list.result[i]._id);
        li.setAttribute("title",i);
        li.setAttribute("onclick","getOrderDetail();");
        li.getElementsByClassName("mygood-thumb")[0].setAttribute("style","background-image:url("+Mall.myitem_list.result[i].picture+'v1'+")");
        li.getElementsByClassName("mygood-name")[0].innerHTML = Mall.myitem_list.result[i].product_name;
        var op_time = new Date(Mall.myitem_list.result[i].create_at);
        var year = op_time.getFullYear();
        var month = op_time.getMonth()+1;
        if(month<10) {
            month = "0"+month;
        }
        var day = op_time.getDate();
        if(day<10) {
            day = "0"+day;
        }
        var hour = op_time.getHours();
        if(hour<10) {
            hour = "0"+hour;
        }
        var minutes = op_time.getMinutes();
        if(minutes<10) {
            minutes = "0"+minutes;
        }
        var second = op_time.getSeconds();
        if(second<10) {
            second = "0"+second;
        }
        var t = year+"-"+month+"-"+day+" "+hour+":"+minutes+":"+second;
        li.getElementsByClassName("creat-time")[0].innerHTML = t;
        var status_str;
        if(Mall.myitem_list.result[i].status === 1) {
            status_str = '【'+'开始审核，请等待'+'】';
        } else if(Mall.myitem_list.result[i].status === 2) {
            status_str = '【'+'已发货，请保持手机通畅'+'】';
        } else if(Mall.myitem_list.result[i].status === 3) {
            status_str = '【'+'已发货，请保持手机通畅'+'】';
        } else if(Mall.myitem_list.result[i].status === 4) {
            if(Mall.myitem_list.result[i].reject_reason.length > 0) {
                status_str = '【'+'审核未通过'+'：'+Mall.myitem_list.result[i].reject_reason+'】';
            } else {
                status_str = '【'+'审核未通过'+'】';
            }
        } else {
            status_str = '【'+'礼品状态有待确认'+'】';
        }
        li.getElementsByClassName("status")[0].innerHTML = status_str;
        Mall.my_goods.appendChild(li);
    };
    var br = doc.createElement("br");
    br.className = "cl";
    Mall.my_goods.appendChild(br);
}
function renderingMyScoreRecords() {
    var doc = document;
    if(Mall.score_records.result.scores.length > 0) {
        for(var i=0;i<Mall.score_records.result.scores.length;i++) {
            var li = doc.createElement("li");
            li.className = "record";
            li.innerHTML = '<span class="title"></span><span class="time" id="time"></span><br><div class="detail-div"><span class="detail"></span><p class="change" title="plus"><span class="amount"></span>积分</p></div>';
            li.getElementsByClassName("title")[0].innerHTML = Mall.score_records.result.scores[i].title;
            var op_time = new Date(Mall.score_records.result.scores[i].operate_at);
            var year = op_time.getFullYear();
            var month = op_time.getMonth()+1;
            if(month<10) {
                month = "0"+month;
            }
            var day = op_time.getDate();
            if(day<10) {
                day = "0"+day;
            }
            var hour = op_time.getHours();
            if(hour<10) {
                hour = "0"+hour;
            }
            var minutes = op_time.getMinutes();
            if(minutes<10) {
                minutes = "0"+minutes;
            }
            var second = op_time.getSeconds();
            if(second<10) {
                second = "0"+second;
            }
            var t = year+"-"+month+"-"+day+" "+hour+":"+minutes+":"+second;
            li.getElementsByClassName("time")[0].innerHTML =  t;
            li.getElementsByClassName("detail")[0].innerHTML = Mall.score_records.result.scores[i].detail;
            li.getElementsByClassName("amount")[0].innerHTML = Mall.score_records.result.scores[i].change_num;
            if(Mall.score_records.result.scores[i].change_num.substring(0,1) === "+") {
                li.getElementsByClassName("change")[0].title = "plus";
            } else {
                li.getElementsByClassName("change")[0].title = "minus";
            }
            doc.getElementById("ScoreRecords").appendChild(li);
        }
        Mall.time_node = Mall.score_records.result.scores[Mall.score_records.result.scores.length-1].operate_time;
    } else if(Mall.score_records.result.scores.length === 0 && doc.getElementsByClassName("record").length === 0) {
        var img_path = "../images/mall/xueba.png";
        var title = "没有积分记录";
        var remind = "去别处转转，有积分再来看吧";
        remindBlank(img_path,title,remind);
    }
}
function renderingDetail() {
    var doc = document;
    var Detail = Mall.prize_XHR;
    doc.getElementById("GoodImg").setAttribute("src",Detail.result.picture);           
    doc.getElementById("GoodTitle").innerHTML = Detail.result.name;
    doc.getElementById("GoodValue").innerHTML = Detail.result.need_score;
    var gooddesStr = Detail.result.description.toString().replace(/style="[^>]*?"/g," ");
    doc.getElementById("GoodDes").innerHTML = gooddesStr;
    doc.getElementById("exchange").setAttribute("title",Detail.result._id);
    if(parseInt(Detail.result.need_score) <= parseInt(sessionStorage.MyScore)) {
        doc.getElementById("exchange").setAttribute("style","background-color:#0091ff;");
        doc.getElementById("exchange").innerHTML = "兑换礼品";
        doc.getElementById("exchange").setAttribute("onclick","exchange();");
    } else {
        doc.getElementById("exchange").setAttribute("style","background-color:#bcc3c8;");
        doc.getElementById("exchange").innerHTML = "积分不足";
    }

}
function renderingMyScore() {
    if(Mall.is_login === false) {
        Mall.my_score = 0;
    } else {
        Mall.my_score = parseInt(Mall.score_XHR.msg);
        sessionStorage.MyScore = Mall.my_score;
    }
    document.getElementById("my_score").innerHTML = Mall.my_score;
}
function getPrizeId() {
    localStorage.prizeId = event.target.title;
    window.location.href = "goodDetail.html";
}
function waitResend() {
    var doc = document;
    Mall.veri_time = Mall.veri_time-1;
    doc.getElementById("sendVeriCode").setAttribute("style","background-color:#d4d4d4;");
    doc.getElementById("sendVeriCode").innerText = Mall.veri_time+"秒后可重发";
    if(Mall.veri_time > 0) {
        setTimeout('waitResend();',1000);
    } else {
        doc.getElementById("sendVeriCode").innerText = "发送验证码";
        doc.getElementById("sendVeriCode").setAttribute("style","background-color:#ffca08;");
        Mall.veri_time = 60;
    }
}
function sendVerify() {
    if(Mall.veri_time !== 60) {
        return;
    } else {
        Mall.veri_time = 60;
        waitResend();
        var VeriTele = document.getElementById("UserTel").value;
        mallPlugin.sendVerifiCode(VeriTele);
    }
}
function exchange() {
    var doc = document;
    localStorage.prizeId = event.target.title;
    window.location.href = "exchange.html";
}

window.onscroll = function() {
    var doc = document;
    if(doc.getElementById("mall")) {
        sessionStorage.Yset = window.pageYOffset;
        if((window.pageYOffset+window.innerHeight>=doc.documentElement.offsetHeight) && Mall.flag === false) {
            Mall.flag = true;
            setTimeout('getMallList(Mall.mall_page);Mall.flag = false;',50);
        }
    } else if(doc.getElementById("ScoreRecords")) {
        if((window.pageYOffset+window.innerHeight>=doc.documentElement.offsetHeight) && Mall.flagR === false) {
            Mall.flagR = true;
            setTimeout('getMyScoreRecords(Mall.time_node);Mall.flagR = false;',50);
        }
    } else {
        return;
    }
}
// 获取saltcode
function getSaltcode() {
    var doc = document;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
            var obj = eval("("+xhr.responseText+")");
            if(obj.status === 0) {
                Mall.salt_code = obj.result.salt_code;
            } else if(obj.status !== 0) {
                alertAnalog(obj.msg,"closeAlert();",obj.msg);
            } else if(!((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304)) {
                alertAnalog("请求失败，请稍后重试","closeAlert();","");
            }
        }
    }
    xhr.open("post",Mall.domain+"/api/user/getSaltcodeByMobile",false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    doc.getElementById("account_name").innerHTML = UserData.mobile;
    if(doc.getElementById("account_name").value !== "") {
        var mobile = doc.getElementById("account_name").innerHTML;
    }
    xhr.send("user_agent="+UserData.user_agent+"&token="+UserData.token+"&cookie="+UserData.cookie+"&mobile="+mobile+"&type=5"+"&version=2.2.0");
}

// 兑换礼品
function submitExchange() {
    var doc = document;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
            var obj = eval("("+xhr.responseText+")");
            if(obj.status === 0) {
               if(obj.msg === "订单生成") {
                    buildOrder();
                } else {
                    alertAnalog(obj.msg,'window.location.href="myGoods.html";',"订单生成");
                }
            } else if(obj.status !== 0) {
                alertAnalog(obj.msg,"closeAlert();",obj.msg);
            } else if(!((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304)) {
                alertAnalog("请求失败，请稍后重试","closeAlert();","");
            }
        }
    }
    var password_hash = hex_md5(document.getElementById("password").value + "liveaa_clubliveaa_club" + Mall.salt_code);
    var receiver_info = "&receiver_name="+doc.getElementById("UserName").value+"&receiver_mobile="+doc.getElementById("UserTel").value+"&receiver_addr="+doc.getElementById("UserAddr").value;
    var userinfos = "user_agent="+UserData.user_agent+"&token="+UserData.token+"&cookie="+UserData.cookie+"&product_id="+localStorage.prizeId+receiver_info+"&password="+password_hash;
    xhr.open("post",Mall.domain+"/api/exchange/createOrder_v2_2",false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(userinfos);
}

// 订单生成
function buildOrder() {
    var doc = document;
    localStorage.receiver_name = doc.getElementById("UserName").value;
    localStorage.receiver_mobile = doc.getElementById("UserTel").value;
    localStorage.receiver_addr = doc.getElementById("UserAddr").value;
    localStorage.user_mobile = doc.getElementById("account_name").innerText;
    doc.getElementById("exchange_form").setAttribute("style","display:none;");
    doc.getElementById("build_order").setAttribute("style","display:block;");
    sessionStorage.score_changed = "1";
}

// 自动切换焦点
function tabForward() {
    var doc = document;
    var target = event.target;
    if(target.id === "UserName") {
        if(target.value.length === 8) {
            target.blur();
            doc.getElementById("UserTel").focus();
        }
    } else if(target.id === "UserTel") {
        if(target.value.length === 11) {
            target.blur();
            doc.getElementById("UserAddr").focus();
        }
    } else if(target.id === "UserAddr") {
    } else if(target.id === "UserVeri") {
        if(target.value.length === 6) {
            event.preventDefault();
            target.blur();
        }                 
    }
}
// 过滤输入
function  ShieldChars() {
    var target = event.target;
    if(target.id === "UserName") {
        if(event.keyCode === 32) {
            event.preventDefault();
        }
    } else if(target.id === "UserTel") {
        if(!/\d/.test(String.fromCharCode(event.keyCode))) {
            event.preventDefault();
        }
    } else if(target.id === "UserVeri") {
        if(!/\d/.test(String.fromCharCode(event.keyCode))) {
            event.preventDefault();
        }                  
    }
}
// 输入验证
function inputVerify() {
    var doc = document;
    var target = event.target;
    if(target.id === "UserName") {
        var re = /[\u4e00-\u9fa5]+/;
        if(target.value.length > 0 ) {
            Mall.verify_arr[1] = "";
        } else if(target.value.length === 0) {
            Mall.verify_arr[1] = "姓名不能为空";
        }
        if(!re.test(doc.getElementById("UserName").value)) {
            Mall.verify_arr[1] = "请输入中文姓名";
        } else {
            Mall.verify_arr[1] = "";
        }
    } else if(target.id === "UserTel") {
        var re = /^(13[0-9]|14[57]|15[012356789]|17[0678]|18[0-9])/;
        if(target.value.length === 0) {
            Mall.verify_arr[2] = "手机号不能为空";
        } else if(target.value.length === 1) {
            if(doc.getElementById("UserTel").value[0].toString() != "1") {
                Mall.verify_arr[2] = "手机号不合法";
            } else {
                Mall.verify_arr[2] = "";
            }
        } else if(target.value.length === 2) {
            if( !(/^1[34578]/.test(doc.getElementById("UserTel").value))) {
                Mall.verify_arr[2] = "手机号不合法";
            } else {
                Mall.verify_arr[2] = "";
            }
        } else if(target.value.length === 3 && !re.test(doc.getElementById("UserTel").value)) {
            Mall.verify_arr[2] = "手机号不合法";
        }             
    } else if(target.id === "UserAddr") {
        if(target.value.length > 0) {
            Mall.verify_arr[3] = "";
        } else if(target.value.length === 0) {
            Mall.verify_arr[3] = "收货地址不能为空";
        }              
    } else if(target.id === "password") {
        if(target.value.length > 16) {
            Mall.verify_arr[0] = "密码为6到16位有效字符";
        } else if(target.value.length === 0) {
            Mall.verify_arr[0] = "密码不能为空";
        } else if(target.value.length >= 6 && target.value.length <= 16) {
            Mall.verify_arr[0] = "";
        }
    }
    showInputErr();
}
// 分别验证
function legalPassword() {
    var doc = document;
    if(doc.getElementById("password").value.length === 0) {
        Mall.verify_arr[0] = "密码不能为空";
    } else if(doc.getElementById("password").value.length < 6 || doc.getElementById("password").value.length > 16) {
        Mall.verify_arr[0] = "密码为6到16位有效字符";
    } else {
        Mall.verify_arr[0] = "";
    }
    showInputErr();
}
function legalName() {
    var doc = document;
    var re = /[\u4e00-\u9fa5]+/;
    if(doc.getElementById("UserName").value === "") {
        Mall.verify_arr[1] = "姓名不能为空";
    } else if(!re.test(doc.getElementById("UserName").value)) {
        Mall.verify_arr[1] = "请输入中文姓名";
    } else if(!(doc.getElementById("UserName").value.length >= 1 && doc.getElementById("UserName").value.length<=8)) {
        doc.getElementById("input_verify").innerHTML = "请输入1~8位汉字";
        Mall.verify_arr[1] = "请输入1~8位汉字";
    } else {
        Mall.verify_arr[1] = "";
    }
    showInputErr();
}
function legalTel() {
    var doc = document;
    var re = /^(13[0-9]|14[57]|15[012356789]|17[0678]|18[0-9])[0-9]+/;
    if(doc.getElementById("UserTel").value.length === 0) {
        Mall.verify_arr[2] = "手机号不能为空";
    } else if(doc.getElementById("UserTel").value.length > 3 && doc.getElementById("UserTel").value.length <= 11 && !re.test(doc.getElementById("UserTel").value)) {
        Mall.verify_arr[2] = "手机号不合法";
    } else if(doc.getElementById("UserTel").value.length != 11) {
        Mall.verify_arr[2] = "手机号为11位有效数字";
    } else if(doc.getElementById("UserTel").value.length === 11) {
        Mall.verify_arr[2] = "";
    }
    showInputErr();
}
function legalAddr() {
    var doc = document;
    if(doc.getElementById("UserAddr").value === "") {
        Mall.verify_arr[3] = "收货地址不能为空";
    } else {
        Mall.verify_arr[3] = "";
    }
    showInputErr();
}
// 输入验证显示
function showInputErr() {
    var doc = document;
    var target = event.target;
    var vari_index;
    if(target.id === "password") {
        vari_index = 0;
    } else if(target.id === "UserName") {
        vari_index = 1;
    } else if(target.id === "UserTel") {
        vari_index = 2;
    } else if(target.id === "UserAddr") {
        vari_index = 3;
    }
    if(Mall.verify_arr[vari_index] !== "") {
        doc.getElementById("input_verify").innerHTML = Mall.verify_arr[vari_index];
        target.setAttribute("title","remind");
        doc.getElementById("input_verify").setAttribute("style","display:inline-block;");
    } else if(Mall.verify_arr[vari_index] === "") {
        target.setAttribute("title","");
        for(var i=0;i<4;i++) {
            if(Mall.verify_arr[i] !== "") {
                doc.getElementById("input_verify").innerHTML = Mall.verify_arr[i];
                doc.getElementById("input_verify").setAttribute("style","display:inline-block;");
            }
        }
    }
    var verify_str = "";
    for(var i=0;i<4;i++) {
        if(Mall.verify_arr[i] !== "") {
            verify_str = verify_str + Mall.verify_arr[i];
        }
    }
    if(verify_str.length > 0) {
        doc.getElementById("submitPrize").setAttribute("title","");
        doc.getElementById("submitPrize").setAttribute("onclick","");
    } else if(verify_str.length === 0) {
        if(doc.getElementById("password").value.length === 0 || doc.getElementById("UserName").value.length === 0 || doc.getElementById("UserTel").value.length === 0 || doc.getElementById("UserAddr").value.length === 0) {
            doc.getElementById("submitPrize").setAttribute("title","");
            doc.getElementById("submitPrize").setAttribute("onclick","");        
        } else {
            doc.getElementById("input_verify").setAttribute("style","display:none;");
            if(doc.getElementById("UserTel").value.length === 11) {
                doc.getElementById("submitPrize").setAttribute("title","submit");
                doc.getElementById("submitPrize").setAttribute("onclick","submitExchange();");                
            }
        }
    }
}
// alert-toast
function alertAnalog(str,fun,veri) {
    var doc = document;
    if(doc.getElementById("alertDiv")) {
        return;
    } else {
        var divOut = doc.createElement("div");
        divOut.id = "alertBack";
        var divIn = doc.createElement("div");
        divIn.id = "alertDiv";
        divIn.innerHTML = '<div id="alertContent"></div><div id="alert_yes">确定</div>';
        doc.getElementsByTagName("body")[0].appendChild(divOut);
        doc.getElementsByTagName("body")[0].appendChild(divIn);
        doc.getElementById("alertContent").innerHTML = str;
        if(str === veri) {
            doc.getElementById("alert_yes").setAttribute("onclick",fun);
        } else {
            doc.getElementById("alert_yes").setAttribute("onclick","closeAlert();");
        }
        doc.getElementById("alertBack").setAttribute("style","display:block;");
        doc.getElementById("alertDiv").setAttribute("style","display:block;");
    }
}
// confirm-toast
function confirmAnalog(str,fun,ret) {
    var doc = document;
    if(doc.getElementById("alertDiv")) {
        return;
    } else {
        var divOut = doc.createElement("div");
        divOut.id = "alertBack";
        var divIn = doc.createElement("div");
        divIn.id = "alertDiv";
        divIn.innerHTML = '<div id="alertContent"></div><div class="confirm-div"><div id="confirm_no">取消</div><div id="confirm_yes">确定</div></div>';
        doc.getElementsByTagName("body")[0].appendChild(divOut);
        doc.getElementsByTagName("body")[0].appendChild(divIn);
        doc.getElementById("alertContent").innerHTML = str;
        doc.getElementById("confirm_yes").setAttribute("onclick",fun);
        doc.getElementById("confirm_no").setAttribute("onclick",ret);
        doc.getElementById("alertBack").setAttribute("style","display:block;");
        doc.getElementById("alertDiv").setAttribute("style","display:block;");        
    }
}
function closeAlert() {
    var doc = document;
    var divout = doc.getElementById("alertBack");
    var divin = doc.getElementById("alertDiv");
    divout.parentNode.removeChild(divout);
    divin.parentNode.removeChild(divin);
}
// 显示空白提示
function remindBlank(img_path,title,remind) {
    var doc = document;
    doc.getElementById("blank").innerHTML = '<img id="blank_img"><span id="blank_title"></span><span id="blank_remind"></span>';
    doc.getElementById("blank_img").setAttribute("src",img_path);
    doc.getElementById("blank_title").innerHTML = title;
    doc.getElementById("blank_remind").innerHTML = remind;
    doc.getElementById("blank").setAttribute("style","display:block;");
}