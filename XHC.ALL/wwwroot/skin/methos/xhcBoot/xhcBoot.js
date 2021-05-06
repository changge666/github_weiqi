let mm;
if (window.addEventListener) {  // all browsers except IE before version 9
    window.addEventListener("message", (e) => {
        mm = e.data;
    }, false);
}
else {
    if (window.attachEvent) {   // IE before version 9
        window.attachEvent("onmessage", (e) => {
            mm = e.data;
        });
    }
}

//javascript地址
let jsList = {
    jquery: "../../skin/script/jquery-2.1.1.js"
    , layui: "../../skin/layui/layui.js"
    , layui_all: "../../skin/layui/layui.all.js"
    , xm_select: "../../skin/layui/xm-select.js"
    , excel: "../../skin/layui/excel.js"
    , xhcLayui: "../../skin/methos/xhcLayui.js"
    , methos: "../../skin/methos/methos.js"
    , laydate: "../../skin/layui/lay/modules/laydate.js"
    , echarts_all: "../../skin/methos/echarts/echarts-all.js"
    , echarts_min: "../../skin/methos/echarts/min.js"
    , echarts_china: "../../skin/methos/echarts/china.js"
    , echarts_world: "../../skin/methos/echarts/world.js"
    , echarts_map: "../../skin/methos/echarts/bmap.min.js"
    , getEcharts: "../../skin/getEcharts/getEcharts.js"
    , html2canvas: "../../skin/methos/html2canvas.min.js"
    , html2canvas_min: "../../skin/methos/html2canvas.min.js"
    , vue: "../../skin/methos/vue-2.4.0.js"
    , vue_resource: "../../skin/methos/vue-resource-1.3.4.js"
    , vuehelper: "../../skin/methos/vueHelper.js"
};
//css样式地址
let cssList = {
    layui: "../../skin/layui/css/layui.css"
};
//获取路径参数
let me_param;
//计数参数
var nex = 0;
//保存计数参数
var nexArr = [];
//文件是否加载完成
let loadstate = false;
//计数达到指定数值后执行指定方法
function setNex(num, fun) {
    let ss = setInterval(function () {
        if (nex == num) {
            clearInterval(ss);
            fun();
        }

    }, 100);
}
/*
 * 开始加载javascript和css
 * @Param：da@   需要加载的js和css
 * @Param：fun@   加载完js和css后需要执行的方法
 * @Param：hist@   利用history隐藏路径参数
 */
function xhcLoad(da, fun, hist = false, event = false) {
    da = da || [];
    if (da.length > 0) {
        var script = document.getElementsByTagName("script")[0].getAttribute("src");
        let len = script.split("../");
        let yyyyy = "";
        if (len.length - 1 > 2) {
            for (let u = 0; u < len.length - 3; u++) {
                yyyyy += "../";
            }
        }
        let arr = [];//css集合
        let arr1 = [];//js集合
        for (let i = 0; i < da.length; i++) {
            if (da[i] == "layui") {
                arr.push(yyyyy + cssList.layui);
                arr1.push(yyyyy + jsList.jquery);
                arr1.push(yyyyy + jsList.layui);
                arr1.push(yyyyy + jsList.layui_all);
                arr1.push(yyyyy + jsList.xm_select);
                arr1.push(yyyyy + jsList.excel); 
                arr1.push(yyyyy + jsList.laydate);
                arr1.push(yyyyy + jsList.xhcLayui);
                arr1.push(yyyyy + jsList.methos);
            }
            else if (da[i] == "vue") {
                arr1.push(yyyyy + jsList.vue);
                arr1.push(yyyyy + jsList.vue_resource);
                arr1.push(yyyyy + jsList.vuehelper);
            }
            else if (da[i] == "echarts") {
                arr1.push(yyyyy + jsList.echarts_all);
                arr1.push(yyyyy + jsList.echarts_min);
                arr1.push(yyyyy + jsList.getEcharts); 
            }
            else if (da[i] == "echarts_china") {
                arr1.push(yyyyy + jsList.echarts_map);
                arr1.push(yyyyy + jsList.echarts_china);
            }
            else if (da[i] == "echarts_world") {
                arr1.push(yyyyy + jsList.echarts_map);
                arr1.push(yyyyy + jsList.echarts_world);
            }
            else if (da[i] == "html2canvas") {
                arr1.push(yyyyy + jsList.html2canvas_min);
                arr1.push(yyyyy + jsList.html2canvas);
            }
            else {
                if (da[i] in cssList) {
                    arr.push(yyyyy + cssList[da[i]]);
                }
                if (da[i] in jsList) {
                    arr1.push(yyyyy + jsList[da[i]]);
                }
            }
        }
        loadLinkAsync(arr);
        loadScript(arr1);
    }
    let tt = setInterval(function () {
        if (loadstate) {
            clearInterval(tt);
            if (hist && (da.includes("layui") || da.includes("methos"))) {
                me_param = {};
                methos.pushState();
            }
            if (event && (da.includes("layui"))) {
                //在Ajax请求发送之前绑定一个要执行的函数，这是一个 Ajax Event.
                if (window.localStorage) {
                    $.ajaxSetup({
                        headers: { "xhc_token": window.localStorage.getItem("xhc_token") }
                    });
                }
            }
            if (fun) {
                if (da.includes("require")) {
                    //删除多余css文件方法
                    let removejscssfile = function (filename, filetype) {
                        var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none";
                        var targetattr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none";
                        var allsuspects = document.getElementsByTagName(targetelement);
                        for (var i = allsuspects.length; i >= 0; i--) {
                            if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) != null && allsuspects[i].getAttribute(targetattr).indexOf(filename) != -1)
                                allsuspects[i].parentNode.removeChild(allsuspects[i]);
                        }
                    }
                    require(["ladder"], function () {
                        removejscssfile("ladder.css", "css");
                        fun(mm || {});
                    });
                }
                else {
                    fun(mm || {});
                }
                if (da.includes("echarts") && parent && !isNaN(parent.nex) && parseInt(parent.nex) >= 0) {
                    parent.nex++;
                }
            }
        }
    }, 100);

}
//同步加载javascript
function loadScript(jslist) {
    if (jslist && jslist.length > 0) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = jslist[0];
        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == "load" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    jslist.splice(0, 1);
                    if (jslist.length > 0) loadScript(jslist);
                    else loadstate = true;
                }
            };
        } else {
            script.onload = function () {
                jslist.splice(0, 1);
                if (jslist.length > 0) loadScript(jslist);
                else loadstate = true;
            };
        }
        document.getElementsByTagName("head")[0].appendChild(script);
    }
}
//异步加载javascript
function loadScriptAsync(jslist) {
    if (jslist && jslist.length > 0) {
        let doc = document;
        for (let t in jslist) {
            var script = doc.createElement("script");
            script.type = "text/javascript";
            script.src = jslist[t];
            doc.getElementsByTagName("head")[0].appendChild(script);
        }
        jslist.splice(0, jslist.length);
    }
}
//异步加载css
function loadLinkAsync(csslist) {
    if (csslist && csslist.length > 0) {
        let doc = document;
        for (let t in csslist) {
            var link = doc.createElement("link");
            link.rel = "stylesheet";
            link.href = csslist[t];
            doc.getElementsByTagName("head")[0].appendChild(link);
        }
    }
}