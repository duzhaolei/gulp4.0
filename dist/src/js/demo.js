function getCookie(cookie_name) {
    var allcookies = document.cookie;
    //索引长度，开始索引的位置
    var cookie_pos = allcookies.indexOf(cookie_name);

    // 如果找到了索引，就代表cookie存在,否则不存在
    if (cookie_pos != -1) {
        // 把cookie_pos放在值的开始，只要给值加1即可
        //计算取cookie值得开始索引，加的1为“=”
        cookie_pos = cookie_pos + cookie_name.length + 1;
        //计算取cookie值得结束索引
        var cookie_end = allcookies.indexOf(";", cookie_pos);

        if (cookie_end == -1) {
            cookie_end = allcookies.length;

        }
        //得到想要的cookie的值
        var value = unescape(allcookies.substring(cookie_pos, cookie_end));
    }
    return value;
}
function iframeUrlChange(e,url){
    let classNameStr = e.target.closest('li').className;
    if (classNameStr.indexOf('appActive') == -1){
        if ($('.appActive')[0]) $('.appActive').removeClass('appActive');
        if (e.target.parentElement.id == 'appList'){
            $(e.target).addClass("appActive");
            $('#downloadUrl').attr("src",url);
        }else {
            $(e.target.closest('li')).addClass("appActive");
            $('#downloadUrl').attr("src",url);
        }
    }
}

// console.log($('#header'))
let token = getCookie('access_token');
function getApplist() {
    $.ajax({
        type: "post",
        url:"/api-portal/appInfo/pageList",
        contentType: "application/json;charset=utf-8",
        data :JSON.stringify({status: '1'}),
        dataType: "json",
        async:true,
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Authorization", `bearer ${token}`);
        },
        success: function (res) {
            // alert(data);
            let arr = res.data
            arr.forEach((item,index)=>{
                let li = `<li onclick="iframeUrlChange(event,'${item.versionAdd}')">
                        <div>
                            <img src="${item.logo}" alt="">
                        </div>
                        <div>
                            <span>${item.appName}</span>
                            <span>最新版本：${item.version}</span>
                        </div>
                      </li>`
                $('#appList').append(li)
                // document.onload = function () {
                //     console.log($('#appList').child());
                // }
            })
            $('#appList').children()[0].classList.add("appActive");
            $('#downloadUrl').attr("src",arr[0].versionAdd);
            // console.log($('#appList').children());
        },error:function(error){
            // console.log(error);
        }
    });
}

console.log(location)
if (token != undefined){
    getApplist()
}else {
    var local = location.hostname
    var loginUrl = null
    if (local.indexOf('uat') != -1 || local.indexOf('dev') != -1 || local.indexOf('test') != -1){
        loginUrl = `https://sso-test.yango.com.cn:4431/LoginLight.aspx?RetutnUrl=${location.href}`
    }else {
        loginUrl = `https://sso.yango.com.cn/LoginLight.aspx?RetutnUrl=${location.href}`
    }
    window.open(loginUrl,'_self')
}
