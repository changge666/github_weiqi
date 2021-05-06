﻿var methos = {
    setBindImgUpload:
        function (uploadid, fileid, imgid, type = ['img', 'png', 'jpeg', 'jpg', 'gif']) {
            $(`#${uploadid}`).click(function () {
                $(`#${fileid}`).click();
                return false;
            });
            $(`#${fileid}`).change(function (e) {
                if (!e || !e.target || !e.target.files || e.target.files.length == 0) {
                    $(`#${imgid}`).attr("src", "");
                    return false;
                }
                let file = e.target.files[0];
                let files = file.name.split(".");
                let filename = files[files.length - 1];
                if (type.indexOf(filename) < 0) {
                    layer.msg(`文件格式不正确（只支持${type.join(",")}格式的文件）！`);
                    $(`#${imgid}`).attr("src", "");
                    return false;
                }
                if (window.FileReader) {
                    var fr = new FileReader();
                    fr.onloadend = function (e) {
                        $(`#${imgid}`).attr("src", e.target.result);
                    };
                    fr.readAsDataURL(file);
                }
                return false;
            });
        },
    setItem:
        function (name, value) {
            window.localStorage.setItem(name, value);
        },
    getItem:
        function (name) {
            return window.localStorage.getItem(name);
        },
    removeItem:
        function (name) {
            window.localStorage.removeItem(name);
        },
    httpStateType:
        //0 : TYPE_NAVIGATE (用户通过常规导航方式访问页面，比如点一个链接，或者一般的get方式)
        //1 : TYPE_RELOAD(用户通过刷新，包括JS调用刷新接口等方式访问页面)
        //2 : TYPE_BACK_FORWARD(用户通过后退按钮访问本页面)
        function () {
            return window.performance.navigation.type;
        },
    pushState://history放置参数及页面地址改变
        function () {
            if (me_param) {
                let hsta = window.history.state;
                if (!hsta) {
                    let dlc = window.location.search;
                    let dlc1 = window.location.pathname;
                    if (dlc && dlc.length > 1) {
                        //if (yp == 2) {
                        //    window.history.go(-1);//相当于window.history.back();
                        //}
                        dlc = dlc.substring(1).split("&");
                        for (let i in dlc) {
                            let i1 = dlc[i].indexOf("=");
                            if (i1 > -1) {
                                let pname = dlc[i].substring(0, i1);
                                let pvalue = dlc[i].length > pname.length + 1 ? decodeURIComponent(dlc[i].substring(i1 + 1)) : ``;
                                me_param[pname] = pvalue;
                            }
                        }
                        window.history.replaceState(me_param, "", dlc1);//window.history.pushState(me_param, "", dlc1);与前面方法用法相同只是不会创建历史记录点 前面那个会创建历史记录点
                    }
                } else {
                    me_param = hsta;
                }
            }
        },
    getParentUrl://获取父级页面url
        function () {
            var url = null;
            if (parent !== window) {
                try {
                    url = parent.location.href;
                } catch (e) {
                    url = document.referrer;
                }
            }
            return url;
        },
    attachEvent://跨域监听事件
        function (func) {
            if (window.addEventListener) {  // all browsers except IE before version 9
                window.addEventListener("message", function (e) {
                    let mm = e.data;
                    if (func && typeof func === "function") func(mm);
                }, false);
            }
            else {
                if (window.attachEvent) {   // IE before version 9
                    window.attachEvent("onmessage", function (e) {
                        let mm = e.data;
                        if (func && typeof func === "function") func(mm);
                    });
                }
            }
        },
    postMessage://跨域发送信息
        function (obj, msg, type = "*") {
            if (obj && msg) obj.postMessage(msg, type);
        },
    Alert://确认后执行的alert事件
        function (str, func) {
            layer.alert(str, {
                yes: function (ind) {
                    layer.close(ind);
                    if (func) func();
                }
                , cancel: function (ind) {
                    layer.close(ind);
                    if (func) func();
                }
            });
        },
    toMessage://信息弹窗
        function (str, str1) {
            layer.open({
                type: 1
                , id: 'msgs'
                , title: str
                , area: ['40%', '30%']
                , titleAlign: 'c'
                , offset: 'auto'
                , content: '<div style="padding: 20px 100px;">' + str1 + '</div>'
                , btn: ['确认']
                , btnAlign: 'c' //按钮居中
                , yes: function (index) {
                    layer.close(index);
                }
            });
        },
    Msg://确认后执行的alert事件
        function (str, time, func) {
            layer.msg(str);
            if (time && !isNaN(time)) {
                setTimeout(func ? func : function () { }, time);
            }
        },
    Login_In://登陆超时退出
        function (res) {
            if (res && res.code && res.code == 401) {
                methos.Msg("登陆超时或已退出登录，请重新登录！", 2000, function () { window.top.location.href = "/" });
                return true;
            }
            return false;
        },
    openPostWindow://post请求打开新窗口
        function (url, data, name) {
            var tempForm = document.createElement("form");
            tempForm.id = "tempForm1";
            tempForm.method = "post";
            tempForm.action = url;
            tempForm.target = name;    // _blank - URL加载到一个新的窗口
            if (Object.prototype.toString.call(data) === "[object Array]") {
                for (let i in data) {
                    let hideInput = document.createElement("input");
                    hideInput.type = "hidden";
                    hideInput.name = data[i].name;
                    hideInput.value = data[i].value;
                    tempForm.appendChild(hideInput);
                }
            }
            else if (Object.prototype.toString.call(data) === '[object Object]') {
                for (let i in data) {
                    let hideInput = document.createElement("input");
                    hideInput.type = "hidden";
                    hideInput.name = i;
                    hideInput.value = data[i];
                    tempForm.appendChild(hideInput);
                }
            }
            if (document.all) {    // 兼容不同浏览器
                tempForm.attachEvent("onsubmit", function () { });        //IE
            } else {
                tempForm.addEventListener("submit", function () { }, false);    //firefox
            }
            document.body.appendChild(tempForm);
            if (document.all) {    // 兼容不同浏览器
                tempForm.fireEvent("onsubmit");
            } else {
                tempForm.dispatchEvent(new Event("submit"));
            }
            tempForm.submit();
            document.body.removeChild(tempForm);
        },
    HTMLEncode://html编码
        function (html) {
            var temp = document.createElement("div");
            if (temp.textContent !== null)
                temp.textContent = html;
            else
                temp.innerText = html;
            var output = temp.innerHTML;
            temp = null;
            return output;
        },
    HTMLDecode://html解码
        function (text) {
            var temp = document.createElement("div");
            temp.innerHTML = text;
            var output = temp.innerText || temp.textContent;
            temp = null;
            return output;
        },
    FormData://获取参数json串
        function (obj) {
            return JSON.stringify(obj.serialize());
        },
    GetParams://html get跳转页面获取参数
        function (name) {
            if (me_param) {
                let kky = Object.keys(me_param) || [];
                if (kky.includes(name)) return me_param[name] || ``;
            } else {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = window.location.search.substr(1).match(reg);
                if (r !== null) return decodeURIComponent(r[2]);
            }
            return ``;
        },
    ToObject://方法，数组，对象 转为 对象
        function (data, num = 0) {
            if (num > 2) return {};
            let where = {};
            if (data) {
                if (typeof data == "function") {
                    where = methos.ToObject(data(), num++);
                }
                else if (Object.prototype.toString.call(data) === "[object Array]") {
                    for (let i in data) {
                        where[data[i].name] = data[i].value;
                    }
                }
                else if (Object.prototype.toString.call(data) === '[object Object]') {
                    where = data;
                }
                else if (Object.prototype.toString.call(data) === '[object FormData]') {
                    where = data;
                }
            }
            return where;
        },
    edit://请求
        function (url, data = {}, fun = null, dataType = "json", async = true, type = "post", errorfunc = null, headers = null, xhc = null) {
            let ind;
            if (!xhc && xhcLayui) {
                xhc = xhcLayui.xhc;
                xhc.addLoad();
            } else if (xhc) xhc.addLoad();
            else {
                ind = layer.msg('操作请求中', {
                    icon: 16
                    , time: false
                    , shade: 0.5
                });
            }
            if (!async) async = false;
            else async = true;
            if (!dataType) dataType = "json";
            if (!type) type = "post";
            $.ajax({
                url: url,
                type: type,
                data: data,
                headers: headers || {},
                dataType: dataType,
                async: async,
                success: function (res) {
                    if (xhc) xhc.closeLoad();
                    else layer.close(ind);
                    if (res.code && res.code == 401) layer.alert(res.msg);
                    else fun(res);
                },
                error: function (res) {
                    console.log(res);
                    if (xhc) xhc.closeLoad();
                    else layer.close(ind);
                    if (errorfunc) errorfunc(res);
                    else layer.msg("连接超时。。。");
                }
            });
        },
    editFile://提交文件请求
        function (url, data, fun, dataType = "json", async = true, type = "post", errorfunc = null, headers = null, xhc = null) {
            let ind;
            if (!xhc && xhcLayui) {
                xhc = xhcLayui.xhc;
                xhc.addLoad();
            } else if (xhc) xhc.addLoad();
            else {
                ind = layer.msg('操作请求中', {
                    icon: 16,
                    time: false,
                    shade: 0.5
                });
            }
            $.ajax({
                url: url,
                type: type || "post",
                data: data,
                headers: headers || {},
                async: async,
                dataType: dataType || "json",
                processData: false,//jquery不去处理发送的数据
                contentType: false,
                success: function (res) {
                    if (xhc) xhc.closeLoad();
                    else layer.close(ind);
                    if (res.code && res.code == 401) layer.alert(res.msg)
                    else fun(res);
                }, error: function (res) {
                    console.log(res);
                    if (xhc) xhc.closeLoad();
                    else layer.close(ind);
                    if (errorfunc) errorfunc(res);
                    else layer.msg("连接超时。。。");
                }
            });
        },
    tableFlush: //表格刷新
        function (btn, btn1 = null, table = null, btn3 = null) {
            if (btn) {
                let t = $(".layui-laypage-btn", $(`#${btn}`).next());
                if (t.length > 0) {
                    t.click();
                    return;
                }
            }
            if (btn1) {
                let t = $(`#${btn1}`);
                if (t.length > 0) {
                    t.click();
                    return;
                }
            }
            if (btn3 && table) {
                table.reload(btn3);
            }
        },
    ReportParams://html  跳转页面传参
        function (url) {
            url = encodeURI(url);   //对URL的地址进行encodeURI编码，实际上只有中文的部分被修改编码
            window.location.href = url;
        },
    DownLoadUrl://通过后台url下载文件
        function (url, data) {
            var $form = $("#disform");
            if ($form.length === 0) $form = $("<form action='" + url + "' style='display:none;'  method='post' id='disform'></form>");
            else $form.attr("action", url);
            $form.html("");
            if (data && data.length > 0) {
                for (var i in data) {
                    $form.append("<input name='" + data[i].name + "' value='" + data[i].value + "'>");
                }
            }
            $form.appendTo($('body'));
            $form.submit();
        },
    DownLoadUrlAjax://通过后台url下载文件
        function (url, data, title = "", xhc = null) {
            let ind;
            if (!xhc && xhcLayui) {
                xhc = xhcLayui.xhc;
                xhc.addLoad();
            } else if (xhc) xhc.addLoad();
            else {
                ind = layer.msg('操作请求中', {
                    icon: 16,
                    time: false,
                    shade: 0.5
                });
            }
            let where = methos.ToObject(data);
            $.ajax({
                url: url,
                type: "POST",
                data: where,
                dataType: 'text',
                async: true,
                success: function (res) {
                    var t = JSON.parse(res);
                    if (t.code == 200) {
                        let y = $("#downloadurl");
                        if (y.length == 0) {
                            y = $(`<a id='downloadurl' style="display:none;"><p>下载</p></a>`);
                            y.appendTo("body");
                        }
                        let tu = "";//下载文件名
                        if (title) {
                            let tui = t.msg.split(".");//获取文件后缀
                            tu = title + "." + tui[tui.length - 1];
                        } else {
                            if (t.title) {
                                tu = t.title;
                                if (tu.indexOf(".") < 0) {
                                    let tui = t.msg.split(".");//获取文件后缀
                                    tu += "." + tui[tui.length - 1];
                                }
                            }
                            else {
                                let tui = t.msg.split("/");//获取文件名
                                tu = tui[tui.length - 1];
                            }
                        }
                        y.attr("download", tu);
                        y.attr("href", t.msg);
                        $('p', y).click();
                    } else {
                        console.log(t.msg);
                        layer.msg(`文件下载失败，失败原因：${t.msg}！`);
                    }
                    if (xhc) xhc.closeLoad();
                    else layer.close(ind);
                }, error: function (err) {
                    console.log(err);
                    if (xhc) xhc.closeLoad();
                    else layer.close(ind);
                    layer.msg("文件下载失败！");
                }
            });
        },
    SectionToChinese://数字转中文
        function (section) {
            var str = "";
            if (isNaN(section)) {
                return section;
            }
            if (section < 0) {
                str = "负";
                section = -section;
            }
            var float = parseFloat(section);
            section = parseInt(section);
            if (float > section) {
                return float;
            }
            var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
            var chnUnitSection = ["", "万", "亿", "万亿", "亿亿"];
            var chnUnitChar = ["", "十", "百", "千"];
            var strIns = '', chnStr = '';
            var unitPos = 0;
            var zero = true;
            while (section > 0) {
                var v = section % 10;
                if (v === 0) {
                    if (!zero) {
                        zero = true;
                        chnStr = chnNumChar[v] + chnStr;
                    }
                } else {
                    zero = false;
                    strIns = chnNumChar[v];
                    strIns += chnUnitChar[unitPos];
                    chnStr = strIns + chnStr;
                }
                unitPos++;
                section = Math.floor(section / 10);
            }
            return str + chnStr;
        },
    UseCheck://添加多选框
        function (arrs = {}, id = "", b = true) {
            if (b) {
                return `<a name="checks" class="layui-btn layui-btn-xs layui-btn-normal">全选</a><a name="checks1" class="layui-btn layui-btn-xs layui-btn-primary">其它</a>`;
            }
            else {
                if (arrs.Checked) {
                    b = arrs.UnCheck.indexOf(`${id}`) > -1;
                    if (!b) return `<input type="checkbox" lay-skin="primary" value="${id}" checked>`;
                } else {
                    b = arrs.Check.indexOf(`${id}`) > -1;
                    if (b) return `<input type="checkbox" lay-skin="primary" value="${id}" checked>`;
                }
                return `<input type="checkbox" lay-skin="primary" value="${id}">`;
            }
        },
    Tree://obj树形图对象  list数据tree型分组 data。fid父ID  id主键 name展示的字段 check是否选中 show是否可点击 isFil是否影响父级
        function (obj, data, fid, id, name, check, show, isfil) {
            //获取树形图及结构数组
            function xtrees(arr, fid, id, name, check, show) {
                var tree = "";
                var num = 10;
                tree = treeview(arr, fid, id, name, check, show, num, tree);
                return tree;
            }
            //list数据tree型分组 arr。fid父ID  id主键 name展示的字段 check是否选中 show是否可点击 num标记数 tree树形结构字符串
            function treeview(arr, fid, id, name, check, show, num, tree) {
                var trees = [];
                var tre = arr.filter((item) => item[fid] === 0);
                tre = tre === null || tre === undefined ? [] : tre;
                for (var i in tre) {
                    var p = { value: tre[i][id], title: tre[i][name], data: [], check: tre[i][check] };
                    trees.push(p);
                    var tres = arr.filter((item) => item[fid] === tre[i][id]);
                    tres = tres === null || tres === undefined ? [] : tres;
                    tree += '<div';
                    tree += tres.length > 0 ? ' class="layui-xtree-item" ' : '';
                    tree += ' style = "margin: 5px 0px 0px 10px;" > ';
                    tree += '<i class="layui-icon layui-xtree-icon';
                    tree += tres.length > 0 ? '' : '-null';
                    tree += '" style="position: relative; top: 3px; margin: 0px 0px 0px 0px; font-size: 18px; color: rgb(47, 64, 86); cursor: pointer;">';
                    tree += tres.length > 0 ? '&#xe625;' : '&#xe621; ';
                    tree += '</i > ';
                    tree += '<input type="checkbox" class="layui-xtree-checkbox"';
                    tree += tre[i][check] === "true" ? ' checked ' : '';
                    tree += 'value="' + tre[i][id] + '" title="（1级部门）' + tre[i][name] + '" style="display:none" lay-skin="primary" >';
                    tree += '<div class="layui-unselect layui-form-checkbox';
                    tree += tre[i][check] === "true" ? ' layui-form-checked' : '';
                    tree += tre[i][show] === "true" ? '' : ' layui-checkbox-disbaled layui-disabled';
                    tree += '" lay-skin="primary"><span>（1级部门）' + tre[i][name] + '</span > <i class="layui-icon">&#xe605;</i ></div >';
                    if (tres.length > 0) {
                        tree = treeviews(arr, trees[i], id, fid, tres, name, check, show, 1, tree);
                    }
                    tree += '</div>';
                }
                arr = trees;
                return tree;
            }
            //list数据tree型分组 arr。fid父ID  id主键 name展示的字段 check是否选中 show是否可点击 num标记数 tree树形结构字符串
            function treeviews(arr, arr1, id, fid, tre, name, check, show, num, tree) {
                num++;
                for (var i in tre) {
                    var p = { value: tre[i][id], title: tre[i][name], data: [], check: tre[i][check] };
                    arr1.data.push(p);
                    var tres = arr.filter((item) => item[fid] === tre[i][id]);
                    tres = tres === null || tres === undefined ? [] : tres;
                    tree += '<div';
                    tree += tres.length > 0 ? ' class="layui-xtree-item" ' : '';
                    tree += ' style = "margin: 5px 0px 0px 32px;" > ';
                    tree += '<i class="layui-icon layui-xtree-icon';
                    tree += tres.length > 0 ? '' : '-null';
                    tree += '" style="position: relative; top: 3px; margin: 0px 0px 0px 0px; font-size: 18px; color: rgb(47, 64, 86); cursor: pointer;">';
                    tree += tres.length > 0 ? '&#xe625;' : '&#xe621; ';
                    tree += '</i > ';
                    tree += '<input type="checkbox" class="layui-xtree-checkbox"';
                    tree += tre[i][check] === "true" ? ' checked ' : '';
                    tree += 'value="' + tre[i][id] + '" title="（' + num + '级部门）' + tre[i][name] + '" style="display:none" lay-skin="primary" >';
                    tree += '<div class="layui-unselect layui-form-checkbox';
                    tree += tre[i][check] === "true" ? ' layui-form-checked' : '';
                    tree += tre[i][show] === "true" ? '' : ' layui-checkbox-disbaled layui-disabled';
                    tree += '" lay-skin="primary"><span>（' + num + '级部门）' + tre[i][name] + '</span > <i class="layui-icon">&#xe605;</i ></div >';
                    if (tres.length > 0) {
                        tree = treeviews(arr, arr1.data[i], id, fid, tres, name, check, show, num, tree)
                    }
                    tree += '</div>';
                }
                return tree;
            }
            //向上选中事件
            function checkedsup(obj) {
                var parent = obj.parent();
                var children = parent.parent().children().index(parent);
                if (children >= 3) {
                    var check = parent.parent().children().eq(1);
                    if (!check.prop("checked")) {
                        check.prop("checked", true);
                        parent.parent().children().eq(2).addClass("layui-form-checked");
                        checkedsup(check);
                    }
                }
            }
            //向下选中事件
            function checkedsdown(obj) {
                var children = obj.parent().children().length;
                if (children >= 4) {
                    var next = obj.next().nextAll();
                    var check = $("input:checkbox", next);
                    check.prop("checked", true);
                    check.each(function () {
                        $(this).next().addClass("layui-form-checked");
                    });
                }
            }
            //取消向上事件
            function ncheckedsup(obj) {
                var parent = obj.parent();
                var children = parent.parent().children().index(parent);
                if (children >= 3) {
                    var check = parent.parent().children().eq(1);
                    if (check.prop("checked")) {
                        var b = true;
                        parent.parent().children().eq(2).nextAll().each(function () {
                            if ($(this).children().eq(1).prop("checked")) {
                                b = false;
                            }
                        });
                        if (b) {
                            check.prop("checked", false);
                            parent.parent().children().eq(2).removeClass("layui-form-checked");
                            ncheckedsup(check);
                        }
                    }
                }
            }
            //取消向下事件
            function ncheckedsdown(obj) {
                var children = obj.parent().children().length;
                if (children >= 4) {
                    var next = obj.next().nextAll();
                    var check = $("input:checkbox:checked", next);
                    check.prop("checked", false);
                    check.each(function () {
                        $(this).next().removeClass("layui-form-checked");
                    });
                }
            }
            var html = xtrees(data, fid, id, name, check, show);
            obj.html(html);
            $("input:checkbox").prop("checked");
            $("i", obj).click(function () {
                var classs = $(this).parent().attr("class");
                if (classs && classs !== "layui-xtree-item") {
                    var dis = classs.indexOf("layui-checkbox-disbaled") > -1 ? true : false;
                    if (dis) {
                        return;
                    }
                    var check = classs.indexOf("layui-form-checked") > -1 ? true : false;
                    var parent = $(this).parent();
                    var checked = parent.parent().children().eq(1);
                    if (check) {
                        checked.prop("checked", false);
                        parent.removeClass("layui-form-checked");
                        if (isfil) {
                            ncheckedsup($(this).parent().prev());
                            ncheckedsdown($(this).parent().prev());
                        }
                    } else {
                        checked.prop("checked", true);
                        parent.addClass("layui-form-checked");
                        if (isfil) {
                            checkedsup($(this).parent().prev());
                            checkedsdown($(this).parent().prev());
                        }
                    }
                } else if (classs === "layui-xtree-item") {
                    var hide = $(this).next().next().next().is(":hidden");
                    if (!hide) {
                        $(this).next().next().nextAll().hide();
                        htmls = "&#xe623;";
                    } else {
                        $(this).next().next().nextAll().show();
                        htmls = "&#xe625;";
                    }
                    $(this).html(htmls);
                }
            });
            $("span", obj).click(function () {
                $(this).next().click();
            });
        },
    Tree1://obj树形图对象  list数据tree型分组 data。fid父ID  id主键 name展示的字段 check是否选中 show是否可点击 isFil是否影响父级
        function (obj, data, fid, id, name, check, show, isfil = false) {
            //获取树形图及结构数组
            function xtrees(arr, fid, id, name, check, show) {
                let tree = treeview(arr, fid, id, name, check, show);
                return tree;
            }
            //list数据tree型分组 arr。fid父ID  id主键 name展示的字段 check是否选中 show是否可点击 num标记数 tree树形结构字符串
            function treeview(arr, fid, id, name, check, show) {
                let tree = [];
                var trees = [];
                var tre = arr.filter((item) => item[fid] === '###');
                arr = arr.filter((item) => item[fid] !== '###');
                tre = tre === null || tre === undefined ? [] : tre;
                for (var i in tre) {
                    var p = { value: tre[i][id], title: tre[i][name], data: [], check: tre[i][check], fil: false };
                    trees.push(p);
                    var tres = arr.filter((item) => item[fid] * 1 === 0);
                    tres = tres === null || tres === undefined ? [] : tres;
                    tree.push('<div');
                    tree.push(tres.length > 0 ? ' class="layui-xtree-item" ' : '');
                    tree.push(' style = "margin: 5px 0px 0px 10px;" > ');
                    tree.push('<i class="layui-icon layui-xtree-icon');
                    tree.push(tres.length > 0 ? '' : '-null');
                    tree.push('" style="position: relative; top: 3px; margin: 0px 0px 0px 0px; font-size: 18px; color: rgb(47, 64, 86); cursor: pointer;">');
                    tree.push(tres.length > 0 ? '&#xe625;' : '&#xe621; ');
                    tree.push('</i > ');
                    tree.push('<div class="layui-inline">');
                    tree.push('<span>（客户简称）' + tre[i][name] + '</span ><i></i></div >');
                    if (tres.length > 0) {
                        treeviews(arr, trees[i], id, fid, tres, name, check, show, 0, tree);
                    }
                    tree.push('</div>');
                }
                return tree.join(``);
            }
            //list数据tree型分组 arr。fid父ID  id主键 name展示的字段 check是否选中 show是否可点击 num标记数 tree树形结构字符串
            function treeviews(arr, arr1, id, fid, tre, name, check, show, num, tree) {
                num++;
                for (var i in tre) {
                    var p = { value: tre[i][id], title: tre[i][name], data: [], check: tre[i][check], fil: true };
                    arr1.data.push(p);
                    var tres = arr.filter((item) => item[fid] === tre[i][id]);
                    tres = !tres ? [] : tres;
                    tree.push('<div');
                    tree.push(tres.length > 0 ? ' class="layui-xtree-item" ' : '');
                    tree.push(' style = "margin: 5px 0px 0px 32px;" > ');
                    tree.push('<i class="layui-icon layui-xtree-icon');
                    tree.push(tres.length > 0 ? '' : '-null');
                    tree.push('" style="position: relative; top: 3px; margin: 0px 0px 0px 0px; font-size: 18px; color: rgb(47, 64, 86); cursor: pointer;">');
                    tree.push(tres.length > 0 ? '&#xe625;' : '&#xe621; ');
                    tree.push('</i > ');
                    tree.push('<input type="checkbox" class="layui-xtree-checkbox"');
                    tree.push(tre[i][check] === "true" ? ' checked ' : '');
                    tree.push('value="' + tre[i][id] + '" title="（' + methos.SectionToChinese(num) + '级部门）' + tre[i][name] + '" style="display:none" lay-skin="primary" >');
                    tree.push('<div class="layui-unselect layui-form-checkbox');
                    tree.push(tre[i][check] === "true" ? ' layui-form-checked' : '');
                    tree.push(tre[i][show] === "true" ? '' : ' layui-checkbox-disbaled layui-disabled');
                    tree.push('" lay-skin="primary"><span>（' + methos.SectionToChinese(num) + '级部门）' + tre[i][name] + '</span > <i class="layui-icon" style="margin-left:8px;">&#xe605;</i ><button class="layui-btn layui-btn-xs layui-btn-warm" name="log">日志</button></div >');
                    if (tres.length > 0) {
                        treeviews(arr, arr1.data[i], id, fid, tres, name, check, show, num, tree);
                    }
                    tree.push('</div>');
                }
                return tree;
            }
            var html = xtrees(data, fid, id, name, check, show);
            obj.html(html);
            $("input:checkbox").prop("checked");
            $("i", obj).click(function () {
                var classs = $(this).parent().attr("class");
                if (classs && classs !== "layui-xtree-item") {
                    var dis = classs.indexOf("layui-checkbox-disbaled") > -1 ? true : false;
                    if (dis) {
                        return;
                    }
                    var check = classs.indexOf("layui-form-checked") > -1 ? true : false;
                    var parent = $(this).parent();
                    var checked = parent.parent().children().eq(1);
                    if (check) {
                        checked.prop("checked", false);
                        parent.removeClass("layui-form-checked");
                        if (isfil) {
                            ncheckedsup($(this).parent().prev());
                            ncheckedsdown($(this).parent().prev());
                        }
                    } else {
                        checked.prop("checked", true);
                        parent.addClass("layui-form-checked");
                        if (isfil) {
                            checkedsup($(this).parent().prev());
                            checkedsdown($(this).parent().prev());
                        }
                    }
                } else if (classs === "layui-xtree-item") {
                    let y = $(this).next();
                    let clc = y[0].tagName.toLowerCase();
                    if (clc === "input") y = y.next();
                    var hide = y.next().is(":hidden");
                    if (!hide) {
                        y.nextAll().hide();
                        htmls = "&#xe623;";
                    } else {
                        y.nextAll().show();
                        htmls = "&#xe625;";
                    }
                    $(this).html(htmls);
                }
            });
            $("span", obj).click(function () {
                $(this).next().click();
            });
        },
    Clone:
        function (obj) {
            let newObj = Array.isArray(obj) ? [] : {};
            if (obj && typeof obj === "object") {
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        newObj[key] = (obj && typeof obj[key] === 'object') ? methos.Clone(obj[key]) : obj[key];
                    }
                }
            }
            return newObj;
        },
    CityArr:
        function () {
            return {
                '海门': [121.15, 31.89],
                '鄂尔多斯': [109.781327, 39.608266],
                '招远': [120.38, 37.35],
                '舟山': [122.207216, 29.985295],
                '齐齐哈尔': [123.97, 47.33],
                '盐城': [120.13, 33.38],
                '赤峰': [118.87, 42.28],
                '青岛': [120.33, 36.07],
                '乳山': [121.52, 36.89],
                '金昌': [102.188043, 38.520089],
                '泉州': [118.58, 24.93],
                '莱西': [120.53, 36.86],
                '日照': [119.46, 35.42],
                '胶南': [119.97, 35.88],
                '南通': [121.05, 32.08],
                '拉萨': [91.11, 29.97],
                '云浮': [112.02, 22.93],
                '梅州': [116.1, 24.55],
                '文登': [122.05, 37.2],
                '上海': [121.48, 31.22],
                '攀枝花': [101.718637, 26.582347],
                '威海': [122.1, 37.5],
                '承德': [117.93, 40.97],
                '厦门': [118.1, 24.46],
                '汕尾': [115.375279, 22.786211],
                '潮州': [116.63, 23.68],
                '丹东': [124.37, 40.13],
                '太仓': [121.1, 31.45],
                '曲靖': [103.79, 25.51],
                '烟台': [121.39, 37.52],
                '福州': [119.3, 26.08],
                '瓦房店': [121.979603, 39.627114],
                '即墨': [120.45, 36.38],
                '抚顺': [123.97, 41.97],
                '玉溪': [102.52, 24.35],
                '张家口': [114.87, 40.82],
                '阳泉': [113.57, 37.85],
                '莱州': [119.942327, 37.177017],
                '湖州': [120.1, 30.86],
                '汕头': [116.69, 23.39],
                '昆山': [120.95, 31.39],
                '宁波': [121.56, 29.86],
                '湛江': [110.359377, 21.270708],
                '揭阳': [116.35, 23.55],
                '荣成': [122.41, 37.16],
                '连云港': [119.16, 34.59],
                '葫芦岛': [120.836932, 40.711052],
                '常熟': [120.74, 31.64],
                '东莞': [113.75, 23.04],
                '河源': [114.68, 23.73],
                '淮安': [119.15, 33.5],
                '泰州': [119.9, 32.49],
                '南宁': [108.33, 22.84],
                '营口': [122.18, 40.65],
                '惠州': [114.4, 23.09],
                '江阴': [120.26, 31.91],
                '蓬莱': [120.75, 37.8],
                '韶关': [113.62, 24.84],
                '嘉峪关': [98.289152, 39.77313],
                '广州': [113.23, 23.16],
                '延安': [109.47, 36.6],
                '太原': [112.53, 37.87],
                '清远': [113.01, 23.7],
                '中山': [113.38, 22.52],
                '昆明': [102.73, 25.04],
                '寿光': [118.73, 36.86],
                '盘锦': [122.070714, 41.119997],
                '长治': [113.08, 36.18],
                '深圳': [114.07, 22.62],
                '珠海': [113.52, 22.3],
                '宿迁': [118.3, 33.96],
                '咸阳': [108.72, 34.36],
                '铜川': [109.11, 35.09],
                '平度': [119.97, 36.77],
                '佛山': [113.11, 23.05],
                '海口': [110.35, 20.02],
                '江门': [113.06, 22.61],
                '章丘': [117.53, 36.72],
                '肇庆': [112.44, 23.05],
                '大连': [121.62, 38.92],
                '临汾': [111.5, 36.08],
                '吴江': [120.63, 31.16],
                '石嘴山': [106.39, 39.04],
                '沈阳': [123.38, 41.8],
                '苏州': [120.62, 31.32],
                '茂名': [110.88, 21.68],
                '嘉兴': [120.76, 30.77],
                '长春': [125.35, 43.88],
                '胶州': [120.03336, 36.264622],
                '银川': [106.27, 38.47],
                '张家港': [120.555821, 31.875428],
                '三门峡': [111.19, 34.76],
                '锦州': [121.15, 41.13],
                '南昌': [115.89, 28.68],
                '柳州': [109.4, 24.33],
                '三亚': [109.511909, 18.252847],
                '自贡': [104.778442, 29.33903],
                '吉林': [126.57, 43.87],
                '阳江': [111.95, 21.85],
                '泸州': [105.39, 28.91],
                '西宁': [101.74, 36.56],
                '宜宾': [104.56, 29.77],
                '呼和浩特': [111.65, 40.82],
                '成都': [104.06, 30.67],
                '大同': [113.3, 40.12],
                '镇江': [119.44, 32.2],
                '桂林': [110.28, 25.29],
                '张家界': [110.479191, 29.117096],
                '宜兴': [119.82, 31.36],
                '北海': [109.12, 21.49],
                '西安': [108.95, 34.27],
                '金坛': [119.56, 31.74],
                '东营': [118.49, 37.46],
                '牡丹江': [129.58, 44.6],
                '遵义': [106.9, 27.7],
                '绍兴': [120.58, 30.01],
                '扬州': [119.42, 32.39],
                '常州': [119.95, 31.79],
                '潍坊': [119.1, 36.62],
                '重庆': [106.54, 29.59],
                '台州': [121.420757, 28.656386],
                '南京': [118.78, 32.04],
                '滨州': [118.03, 37.36],
                '贵阳': [106.71, 26.57],
                '无锡': [120.29, 31.59],
                '本溪': [123.73, 41.3],
                '克拉玛依': [84.77, 45.59],
                '渭南': [109.5, 34.52],
                '马鞍山': [118.48, 31.56],
                '宝鸡': [107.15, 34.38],
                '焦作': [113.21, 35.24],
                '句容': [119.16, 31.95],
                '北京': [116.46, 39.92],
                '徐州': [117.2, 34.26],
                '衡水': [115.72, 37.72],
                '包头': [110, 40.58],
                '绵阳': [104.73, 31.48],
                '乌鲁木齐': [87.68, 43.77],
                '枣庄': [117.57, 34.86],
                '杭州': [120.19, 30.26],
                '淄博': [118.05, 36.78],
                '鞍山': [122.85, 41.12],
                '溧阳': [119.48, 31.43],
                '库尔勒': [86.06, 41.68],
                '安阳': [114.35, 36.1],
                '开封': [114.35, 34.79],
                '济南': [117, 36.65],
                '德阳': [104.37, 31.13],
                '温州': [120.65, 28.01],
                '九江': [115.97, 29.71],
                '邯郸': [114.47, 36.6],
                '临安': [119.72, 30.23],
                '兰州': [103.73, 36.03],
                '沧州': [116.83, 38.33],
                '临沂': [118.35, 35.05],
                '南充': [106.110698, 30.837793],
                '天津': [117.2, 39.13],
                '富阳': [119.95, 30.07],
                '泰安': [117.13, 36.18],
                '诸暨': [120.23, 29.71],
                '郑州': [113.65, 34.76],
                '哈尔滨': [126.63, 45.75],
                '聊城': [115.97, 36.45],
                '芜湖': [118.38, 31.33],
                '唐山': [118.02, 39.63],
                '平顶山': [113.29, 33.75],
                '邢台': [114.48, 37.05],
                '德州': [116.29, 37.45],
                '济宁': [116.59, 35.38],
                '荆州': [112.239741, 30.335165],
                '宜昌': [111.3, 30.7],
                '义乌': [120.06, 29.32],
                '丽水': [119.92, 28.45],
                '洛阳': [112.44, 34.7],
                '秦皇岛': [119.57, 39.95],
                '株洲': [113.16, 27.83],
                '石家庄': [114.48, 38.03],
                '莱芜': [117.67, 36.19],
                '常德': [111.69, 29.05],
                '保定': [115.48, 38.85],
                '湘潭': [112.91, 27.87],
                '金华': [119.64, 29.12],
                '岳阳': [113.09, 29.37],
                '长沙': [113, 28.21],
                '衢州': [118.88, 28.97],
                '廊坊': [116.7, 39.53],
                '菏泽': [115.480656, 35.23375],
                '合肥': [117.27, 31.86],
                '武汉': [114.31, 30.52],
                '大庆': [125.03, 46.58],
                '襄阳': [112.1411133, 32.04539871],
                '十堰': [110.7827988, 32.65213013]
            };
        },
    CityInternalArr:
        function () {
            return Object.assign(methos.CityArr(), {
                '阿富汗': [67.709953, 33.93911]
                , '安哥拉': [17.873887, -11.202692]
                , '阿尔巴尼亚': [20.168331, 41.153332]
                , '阿联酋': [53.847818, 23.424076]
                , '阿根廷': [-63.61667199999999, -38.416097]
                , '亚美尼亚': [45.038189, 40.069099]
                , '法属南半球和南极领地': [69.348557, -49.280366]
                , '澳大利亚': [133.775136, -25.274398]
                , '奥地利': [14.550072, 47.516231]
                , '阿塞拜疆': [47.576927, 40.143105]
                , '布隆迪': [29.918886, -3.373056]
                , '比利时': [4.469936, 50.503887]
                , '贝宁': [2.315834, 9.30769]
                , '布基纳法索': [-1.561593, 12.238333]
                , '孟加拉国': [90.356331, 23.684994]
                , '保加利亚': [25.48583, 42.733883]
                , '巴哈马': [-77.39627999999999, 25.03428]
                , '波斯尼亚和黑塞哥维那': [17.679076, 43.915886]
                , '白俄罗斯': [27.953389, 53.709807]
                , '伯利兹': [-88.49765, 17.189877]
                , '百慕大': [-64.7505, 32.3078]
                , '玻利维亚': [-63.58865299999999, -16.290154]
                , '巴西': [-51.92528, -14.235004]
                , '文莱': [114.727669, 4.535277]
                , '不丹': [90.433601, 27.514162]
                , '博茨瓦纳': [24.684866, -22.328474]
                , '中非共和国': [20.939444, 6.611110999999999]
                , '加拿大': [-106.346771, 56.130366]
                , '瑞士': [8.227511999999999, 46.818188]
                , '智利': [-71.542969, -35.675147]
                , '中国': [104.195397, 35.86166]
                , '象牙海岸': [-5.547079999999999, 7.539988999999999]
                , '喀麦隆': [12.354722, 7.369721999999999]
                , '刚果民主共和国': [21.758664, -4.038333]
                , '刚果共和国': [15.827659, -0.228021]
                , '哥伦比亚': [-74.297333, 4.570868]
                , '哥斯达黎加': [-83.753428, 9.748916999999999]
                , '古巴': [-77.781167, 21.521757]
                , '北塞浦路斯': [33.429859, 35.126413]
                , '塞浦路斯': [33.429859, 35.126413]
                , '捷克共和国': [15.472962, 49.81749199999999]
                , '德国': [10.451526, 51.165691]
                , '吉布提': [42.590275, 11.825138]
                , '丹麦': [9.501785, 56.26392]
                , '多明尼加共和国': [-70.162651, 18.735693]
                , '阿尔及利亚': [1.659626, 28.033886]
                , '厄瓜多尔': [-78.18340599999999, -1.831239]
                , '埃及': [30.802498, 26.820553]
                , '厄立特里亚': [39.782334, 15.179384]
                , '西班牙': [-3.74922, 40.46366700000001]
                , '爱沙尼亚': [25.013607, 58.595272]
                , '埃塞俄比亚': [40.489673, 9.145000000000001]
                , '芬兰': [25.748151, 61.92410999999999]
                , '斐': [178.065032, -17.713371]
                , '福克兰群岛': [-59.523613, -51.796253]
                , '法国': [2.213749, 46.227638]
                , '加蓬': [11.609444, -0.803689]
                , '英国': [-3.435973, 55.378051]
                , '格鲁吉亚': [-82.9000751, 32.1656221]
                , '加纳': [-1.023194, 7.946527]
                , '几内亚': [-9.696645, 9.945587]
                , '冈比亚': [-15.310139, 13.443182]
                , '几内亚比绍': [-15.180413, 11.803749]
                , '赤道几内亚': [10.267895, 1.650801], '希腊': [21.824312, 39.074208], '格陵兰': [-42.604303, 71.706936], '危地马拉': [-90.23075899999999, 15.783471], '法属圭亚那': [-53.125782, 3.933889], '圭亚那': [-58.93018, 4.860416], '洪都拉斯': [-86.241905, 15.199999], '克罗地亚': [15.2, 45.1], '海地': [-72.285215, 18.971187], '匈牙利': [19.503304, 47.162494], '印尼': [113.921327, -0.789275], '印度': [78.96288, 20.593684], '爱尔兰': [-8.24389, 53.41291], '伊朗': [53.688046, 32.427908], '伊拉克': [43.679291, 33.223191], '冰岛': [-19.020835, 64.963051], '以色列': [34.851612, 31.046051], '意大利': [12.56738, 41.87194], '牙买加': [-77.297508, 18.109581], '约旦': [36.238414, 30.585164], '日本': [138.252924, 36.204824], '哈萨克斯坦': [66.923684, 48.019573], '肯尼亚': [37.906193, -0.023559], '吉尔吉斯斯坦': [74.766098, 41.20438], '柬埔寨': [104.990963, 12.565679], '韩国': [127.766922, 35.907757], '科索沃': [20.902977, 42.6026359], '科威特': [47.481766, 29.31166], '老挝': [102.495496, 19.85627], '黎巴嫩': [35.862285, 33.854721], '利比里亚': [-9.429499000000002, 6.428055], '利比亚': [17.228331, 26.3351], '斯里兰卡': [80.77179699999999, 7.873053999999999], '莱索托': [28.233608, -29.609988], '立陶宛': [23.881275, 55.169438], '卢森堡': [6.129582999999999, 49.815273], '拉脱维亚': [24.603189, 56.879635], '摩洛哥': [-7.092619999999999, 31.791702], '摩尔多瓦': [28.369885, 47.411631], '马达加斯加': [46.869107, -18.766947], '墨西哥': [-102.552784, 23.634501], '马其顿': [21.745275, 41.608635], '马里': [-3.996166, 17.570692], '缅甸': [95.956223, 21.913965], '黑山': [19.37439, 42.708678], '蒙古': [103.846656, 46.862496], '莫桑比克': [35.529562, -18.665695], '毛里塔尼亚': [-10.940835, 21.00789], '马拉维': [34.301525, -13.254308], '马来西亚': [101.975766, 4.210484], '纳米比亚': [18.49041, -22.95764], '新喀里多尼亚': [165.618042, -20.904305], '尼日尔': [8.081666, 17.607789], '尼日利亚': [8.675277, 9.081999], '尼加拉瓜': [-85.207229, 12.865416], '荷兰': [5.291265999999999, 52.132633], '挪威': [8.468945999999999, 60.47202399999999], '尼泊尔': [84.12400799999999, 28.394857], '新西兰': [174.885971, -40.900557], '阿曼': [55.923255, 21.512583], '巴基斯坦': [69.34511599999999, 30.375321], '巴拿马': [-80.782127, 8.537981], '秘鲁': [-75.015152, -9.189967], '菲律宾': [121.774017, 12.879721], '巴布亚新几内亚': [143.95555, -6.314992999999999], '波兰': [19.145136, 51.919438], '波多黎各': [-66.590149, 18.220833], '北朝鲜': [127.510093, 40.339852], '葡萄牙': [-8.224454, 39.39987199999999], '巴拉圭': [-58.443832, -23.442503], '卡塔尔': [51.183884, 25.354826], '罗马尼亚': [24.96676, 45.943161], '俄罗斯': [105.318756, 61.52401], '卢旺达': [29.873888, -1.940278], '西撒哈拉': [-12.885834, 24.215527], '沙特阿拉伯': [45.079162, 23.885942], '苏丹': [30.217636, 12.862807], '南苏丹': [31.3069788, 6.876991899999999], '塞内加尔': [-14.452362, 14.497401], '所罗门群岛': [160.156194, -9.64571], '塞拉利昂': [-11.779889, 8.460555], '萨尔瓦多': [-88.89653, 13.794185], '索马里兰': [46.8252838, 9.411743399999999], '索马里': [46.199616, 5.152149], '塞尔维亚共和国': [21.005859, 44.016521], '苏里南': [-56.027783, 3.919305], '斯洛伐克': [19.699024, 48.669026], '斯洛文尼亚': [14.995463, 46.151241], '瑞典': [18.643501, 60.12816100000001], '斯威士兰': [31.465866, -26.522503], '叙利亚': [38.996815, 34.80207499999999], '乍得': [18.732207, 15.454166], '多哥': [0.824782, 8.619543], '泰国': [100.992541, 15.870032], '塔吉克斯坦': [71.276093, 38.861034], '土库曼斯坦': [59.556278, 38.969719], '东帝汶': [125.727539, -8.874217], '特里尼达和多巴哥': [-61.222503, 10.691803], '突尼斯': [9.537499, 33.886917], '土耳其': [35.243322, 38.963745], '坦桑尼亚联合共和国': [34.888822, -6.369028], '乌干达': [32.290275, 1.373333], '乌克兰': [31.16558, 48.379433], '乌拉圭': [-55.765835, -32.522779], '美国': [-95.712891, 37.09024], '乌兹别克斯坦': [64.585262, 41.377491], '委内瑞拉': [-66.58973, 6.42375], '越南': [108.277199, 14.058324], '瓦努阿图': [166.959158, -15.376706], '西岸': [35.3027226, 31.9465703], '也门': [48.516388, 15.552727], '南非': [22.937506, -30.559482], '赞比亚': [27.849332, -13.133897], '津巴布韦': [29.154857, -19.015438]
            });
        }
};