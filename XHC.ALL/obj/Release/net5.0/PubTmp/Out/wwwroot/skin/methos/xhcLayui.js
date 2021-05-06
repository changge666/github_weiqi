let xhcLayui = {};
xhcLayui.xhcArrs = [];
let getTrs = function () {
    let indexs = xhcLayui.xhcArrs.length;
    let trs = {};
    trs.config = {
        b: false,//多表头    开启/关闭
        b1: false,//表头查询     开启/关闭
        b2: false,//表头查询是单表    开启/关闭
        b3: false,//切换表头查询字段时是否自动查询    开启/关闭
        field: "name",
        select: "BtnSelect",
        check: { b: false, field: "" } //全选 展示数据dom
    };
    //formID
    trs.formID = "form";
    //遮罩下标
    trs.load = -1;
    //加载遮罩数
    trs.loadNum = 0;
    //开启加载遮罩
    trs.addLoad = function (msg = "") {
        let xhc = this;
        if (xhc.load == -1) {
            xhc.load = layui.layer.msg(msg ? msg : '操作请求中', {
                icon: 16,
                time: false,
                shade: 0.5
            });
        }
        xhc.loadNum += 1;
        return xhc.load;
    };
    //关闭加载遮罩
    trs.closeLoad = function () {
        let xhc = this;
        if (xhc.load > -1 && xhc.loadNum > 0) {
            xhc.loadNum -= 1;
            if (xhc.loadNum == 0) {
                layer.close(xhc.load);
                xhc.load = -1;
            }
        }
    };
    //当前xhc下标
    trs.index = indexs;
    //表头查询数据
    trs.tables = {};
    //获取渲染表格
    trs.renderTable = function (elem, id, style = null) {
        let xhc = this;
        let render = {
            elem: `#${elem}`
            , id: id
            , method: `post`
            , request: {
                pageName: 'page' //页码的参数名称，默认：page
                , limitName: 'limit' //每页数据量的参数名，默认：limit
            }
            , response: {
                statusName: 'code' //规定数据状态的字段名称，默认：code
                , statusCode: 200 //规定成功的状态码，默认：0
                , msgName: 'msg' //规定状态信息的字段名称，默认：msg
                , countName: 'count' //规定数据总数的字段名称，默认：count
                , dataName: 'data' //规定数据列表的字段名称，默认：data
            }
            , headers: { userHeader: window.localStorage.getItem("user") }
            , parseData: function (res) { //res 即为原始返回的数据
                if (res.code != "200") {
                    layer.alert("请求失败：" + (res.msg || `未知原因`));
                    return { code: 200, msg: ``, count: 0, data: [] };
                }
                res.code = res.code || 200;
                res.msg = res.msg || ``;
                res.count = res.count || 0;
                res.data = res.data || [];
                return res;
            }
            , limit: style && style.page ? (style.limit && !isNaN(style.limit) && style.limit * 1 > 0 ? style.limit : 10) : 100000000
            , page: style && style.page ? { //支持传入 laypage 组件的所有参数（某些参数除外，如：jump/elem） - 详见文档
                layout: ['prev', 'page', 'next', 'skip', 'count', 'limit'] //自定义分页布局
                , curr: 1 //设定初始在第 几 页
                , limit: style.limit && !isNaN(style.limit) && style.limit * 1 > 0 ? style.limit : 10
            } : false
            , cols: [
                style && style.arr ? style.arr : []
            ]
            , data: style && style.data ? style.page : []
        };
        render.done = function (res) {
            xhc.closeLoad();
            if (style && style.num) xhc.tableNum($("#" + elem).next(), typeof style.num == "string" ? style.num : "0");
            if (xhc.config.b1) xhc.tableHeadSelect(style && style.form ? style.form : "form", render, xhc.config.select);
            if (xhc.config.check.b) xhc.tableCheck("#" + elem, id, style && style.quan ? style.quan.func1 : null, style && style.quan ? style.quan.func2 : null);
            xhc.getWidth(render, res.data);
            if (style && style.quanxian) Ladder.form.checkLimit();
            if (style && style.done) {
                style.done(res);
            }
        }
        if (style) {
            if (style.height) render.height = style.height;
            if (style.width) render.height = style.width;
        }
        return render;
    };
    //表格查询
    trs.query = function () {
        $("#" + this.config.select).click();
    };
    //表格字段
    trs.tableColumns = {};
    //全选
    trs.arrCheck = { Checked: false, Check: [], UnCheck: [] };
    //取消选中
    trs.closeArr = function (id) {
        let arrs = this.arrCheck;
        arrs.Checked = false;
        arrs.Check = [];
        arrs.UnCheck = [];
        let y = $(`table thead th a[name="checks"]`, $(`#${id}`).next());
        y.attr("class", "layui-btn layui-btn-xs layui-btn-normal");
        y.html("全选");
    };
    //查询表单
    trs.tableForms = [];
    //表格路径
    trs.tableUrls = {};
    //需要翻译的
    trs.arrs = [];
    //获取需要表头查寻的tableid
    trs.getHeadKey = function (arr) {
        return Object.keys(arr);
    };
    //中文查询转译的数据
    trs.getTranslate = function (data, field, con = false) {
        let arrs = this.arrs;
        let att = [];
        let das = [];
        if (data && data.length > 0) {
            if (field) {
                att = arrs.find(x => `#${x.name}` == field) || {};
                if (!att) return data;
                else att = att.value;
            }
            else att = arrs;
            for (let ii in data) {
                let obx = {};
                let obj = data[ii];
                let name = obj.name;
                let value = obj.value.trim();
                if (!con && !(name[0] == '(' && name[name.length - 1] == ')')) name = name.substring(0, 1) + "." + name.substring(1);
                if (value.length > 0) {
                    let att1 = att.find(x => x.name == name);
                    if (att1 && att1.value.length > 0) {
                        let att2 = att1.value.filter(x => x.value.indexOf(value) > -1);
                        if (att2 && att2.length > 0) {
                            name = name.replace(":like%", ":in");
                            value = "";
                            for (let i in att2) {
                                value += "," + att2[i].name;
                            }
                            value = value.substring(1);
                        }
                    }
                }
                obx.name = name;
                obx.value = value;
                das.push(obx);
            }
            return das;
        }
        return data;
    };
    //表格加载无数据时设置表格宽度
    trs.getWidth = function (obj, data) {
        let b1 = false;
        if (data) {
            let b = typeof data;
            if (b == "number" && data == 0) { b1 = true; }
            else if (b == "object" && data.length == 0) { b1 = true; }
        } else b1 = true;
        if (b1) {
            let obs = $(obj.elem).next();
            let df = $('.layui-none', obs).width() - 20;
            let wid = $(".layui-table-header table", obs).width() - 30 + 'px';
            $('.layui-none', obs).width(wid);
            $('.layui-none', obs).html("<div align='left' style='width:" + df + "px;text-align:center'>无数据</div>");
            $('.layui-table-body', obs).height('432px');
        }
    };
    //开启表格全选
    trs.tableCheck = function (demo, ids, fun = null, fun1 = null) {
        let arrs = this.arrCheck;
        let hth = `<div style="text-align:center;"><button id="yescheck" class="layui-btn layui-btn-xs layui-btn-normal">当前页全选</button><button id="nocheck" class="layui-btn layui-btn-xs layui-btn-danger">当前页不选</button></div>`;
        let check = function () {
            if (fun && !fun()) return false;
            let ty = function (elem) {
                $("td input:checkbox", $(`${elem}`).next()).prop("checked", arrs.Checked);
                let btn = $("th a[name='checks']", $(`${elem}`).next());
                if (arrs.Checked) btn.text("不选");
                else btn.text("全选");
                btn.toggleClass("layui-btn-normal");
                btn.toggleClass("layui-btn-danger");
            }
            let tas = layui.table;
            let tabs = tas.cache[`${ids}`].length;//当前查询是否有数据
            if (!tabs) return;
            arrs.Check.splice(0, arrs.Check.length);
            arrs.UnCheck.splice(0, arrs.UnCheck.length);
            arrs.Checked = !arrs.Checked;
            ty(demo);
            if (fun1) fun1(ty);
            layui.form.render();
        };
        let indx;
        let check1 = function () {
            if (indx) layui.layer.close(indx);
            indx = layui.layer.tips(hth, $(this), { tips: [1, '#fff'], time: 3000, area: ['250px', '40px'] });
            let yescheck = $("#yescheck");
            let nocheck = $("#nocheck");
            yescheck.click(function () {
                if (fun && !fun()) return false;
                let f = $("td input:checkbox:not(:checked)", $(`${demo}`).next());
                if (f.length > 0) {
                    f.prop("checked", true);
                    layui.form.render();
                    f.each(function () {
                        let val = $(this).val();
                        if (arrs.Checked) {
                            let trr = arrs.UnCheck.indexOf(val);
                            if (trr > -1) arrs.UnCheck.splice(trr, 1);
                        } else {
                            let trr = arrs.Check.indexOf(val);
                            if (trr == -1) arrs.Check.push(val);
                        }
                    });
                    if (fun1) fun1();
                    console.log(arrs);
                }
                return false;
            });
            nocheck.click(function () {
                if (fun && !fun()) return false;
                let f = $("td input:checkbox:checked", $(`${demo}`).next());
                if (f.length > 0) {
                    f.prop("checked", false);
                    layui.form.render();
                    f.each(function () {
                        let val = $(this).val();
                        if (arrs.Checked) {
                            let trr = arrs.UnCheck.indexOf(val);
                            if (trr == -1) arrs.UnCheck.push(val);
                        } else {
                            let trr = arrs.Check.indexOf(val);
                            if (trr > -1) arrs.Check.splice(trr, 1);
                        }
                    });
                    if (fun1) fun1();
                    console.log(arrs);
                }
                return false;
            });
            return false;
        };
        $("th a[name='checks']", $(`${demo}`).next()).unbind();
        $("th a[name='checks']", $(`${demo}`).next()).click(check);
        $("th a[name='checks1']", $(`${demo}`).next()).unbind();
        $("th a[name='checks1']", $(`${demo}`).next()).click(check1);
    };
    //表单监听开启
    trs.formCheck = function (fun = null, fun1 = null) {
        let arrs = this.arrCheck;
        let form = layui.form;
        form.on('checkbox', function (obj) {
            let elem = obj.elem;
            let val = obj.elem.value;
            let chc = elem.checked;
            let tagName = $(elem).parent()[0].tagName.toLowerCase();
            if (fun && !fun(elem)) return false;
            if (arrs.Checked) {
                trr = arrs.UnCheck.indexOf(val);
                if (chc) {
                    if (trr > -1) arrs.UnCheck.splice(trr, 1);
                } else {
                    if (trr == -1) arrs.UnCheck.push(val);
                }
            } else {
                trr = arrs.Check.indexOf(val);
                if (chc) {
                    if (trr == -1) arrs.Check.push(val);
                } else {
                    if (trr > -1) arrs.Check.splice(trr, 1);
                }
            }
            if (fun1) fun1();
            layui.form.render();
        });
    };
    //表头查询
    trs.tableHeadSelect = function (form, obj, btn) {
        let xhc = this;
        xhc.thisColumns = obj.cols[0];
        let p = null;
        let config = xhc.config;
        if (!config.b) return;
        if (config.b1) {
            let ww = $(`#${form} input[name="data"]`).val();
            let data = JSON.parse(ww || "[]");
            if (data) {
                let txx = data.find(x => x.name == config.field);
                if (txx)
                    p = xhc.tables[txx.value];
                else
                    p = xhc.tables[config.field];
            }
        }
        else {
            p = xhc.tables[config.field];
        }
        let nes = $(obj.elem).next();
        //循环字段
        if (p) {
            for (let i in p) {
                let les = p[i];//判断该字段是否作为查询条件
                let s = les.name.split(":");
                let ths1 = $("th[data-field='" + s[0] + "']", nes);//获取当前字段的th
                //表头改为文本框
                let inp = $("<input class='layui-input layui-table-edit' name='" + les.name + "' title='" + $("span", ths1).html() + "' value='" + les.value + "'>");
                ths1.attr("data-edit", "text");//添加可修改属性
                $("div", ths1).html("");//清空表头
                ths1.append(inp);
                inp.blur(function () {
                    let tg = $(this);
                    let text = tg.val(); //文本框为空时改回表头
                    if (text == "" || text.trim() == "") {
                        ths1.removeAttr("data-edit");//删除修改属性
                        $("div", tg.parent()).html("<span>" + tg.attr("title") + "</span>");//改回表头文字
                        tg.remove();//删除文本框
                    }
                });
                inp.keydown(function (ec) {
                    if (ec.which == 13) {//判断如果按下的是回车键则执行下面的代码
                        let te = $(this);
                        let text = te.val();//文本框的值
                        if (text == "" || text.trim() == "") {
                            ths1.removeAttr("data-edit");//删除修改属性
                            $("div", te.parent()).html("<span>" + te.attr("title") + "</span>");//改回表头文字
                            te.remove();//删除文本框
                        }
                        $(`#${btn}`).click();//查询
                        return false;
                    }
                });
            }
        }

        //获取当前字段的th点击事件
        $("th", nes).dblclick(function () {
            let ths = $(this);
            let fi = ths.attr("data-field");
            if (!isNaN(fi)) {
                return;
            }
            let field = `${fi}:like%`;//字段名
            //表头为文本框时不执行
            if ($("input[name='" + field + "']").length > 0) {
                return;
            }
            let cas = $("span", ths).html();//获取表头中文名
            ths.attr("data-edit", "text");//添加可修改属性
            $("div", ths).html("");//清空表头
            let inp = $("<input class='layui-input layui-table-edit' name='" + field + "' title='" + cas + "'>");
            ths.append(inp);//表头添加文本框
            inp.focus();//文本框获取焦点
            inp.blur(function () {
                let tg = $(this);
                let text = tg.val(); //文本框为空时改回表头
                if (text == "" || text.trim() == "") {
                    ths.removeAttr("data-edit");//删除修改属性
                    $("div", ths).html("<span>" + tg.attr("title") + "</span>");//改回表头文字
                    tg.remove();//删除文本框
                }
            });
            inp.keydown(function (ec) {
                if (ec.which == 13) {//判断如果按下的是回车键则执行下面的代码
                    let te = $(this);
                    let text = te.val();//文本框的值
                    if (text == "" || text.trim() == "") {
                        ths1.removeAttr("data-edit");//删除修改属性
                        $("div", te.parent()).html("<span>" + te.attr("title") + "</span>");//改回表头文字
                        te.remove();//删除文本框
                    }
                    $(`#${btn}`).click();//查询
                    return false;
                }
            });
        });
    };
    //查询表单配置
    trs.tableFormConfig = function (data, formId) {//例子 [{row:1,cell:1,type:"checkbox",data:[],name:"",title:"",value:"",id:"",config:{title:"",value:"",b:false}}]
        let atty = {};
        if (!data || data.length == 0)
            return atty;
        let xhc = this;
        xhc.tableForms = data;
        let map = data.map(x => x.row).sort(function (n1, n2) {
            return n1 - n2;
        });
        $.unique(map.sort());
        let html = `<input type="hidden" name="data" />`;
        let bb = false;
        for (let i in map) {
            let arr1 = data.filter(x => x.row == map[i]).sort(function (n1, n2) {
                return n1.cell - n2.cell;
            });
            html += `<div class="layui-form-item" style="margin-left:20px">`;
            for (let i1 in arr1) {
                let tr = ``;
                let s = arr1[i1];
                let tri1 = s.class ? ` ${s.class}` : ``;
                let tri2 = s.class_t ? s.class_t.join(" ") : ``;
                if (s.type == "hidden") { html += `<input class="layui-hide" type="text" readonly name="${s.name}" value="${s.value}" />`; continue; }
                if (s.type != "button") {
                    if (!s.full || (s.full && s.full != 1))
                        html += `<div class="layui-inline ${tri1}">`;
                }
                let tri = s.data_type ? ` ${s.data_type.join(" ")}` : "";
                if (s.type == "tab") {
                    bb = true;
                    tr = `<div class="layui-form-item" style="margin-left:20px;display:none">`;
                    for (let u in s.data) {
                        let tt = s.data[u];
                        if (s.value) {
                            if (tt[s.config.value] == s.value) {
                                html += `<label class="layui-form-label radios" name="a${u}" style="width:200px;cursor:pointer;background-color: #00b7e1;">${tt[s.config.title]}</label>`;
                                tr += `<input type="radio" name="${s.name}" id="a${u}" value="${tt[s.config.value]}" checked />`;
                            }
                            else {
                                html += `<label class="layui-form-label radios" name="a${u}" style="width:200px;cursor:pointer;">${tt[s.config.title]}</label>`;
                                tr += `<input type="radio" name="${s.name}" id="a${u}" value="${tt[s.config.value]}" />`;
                            }
                        } else {
                            if (u == 0) {
                                html += `<label class="layui-form-label radios" name="a${u}" style="width:200px;cursor:pointer;background-color: #00b7e1;">${tt[s.config.title]}</label>`;
                                tr += `<input type="radio" name="${s.name}" id="a${u}" value="${tt[s.config.value]}" checked />`;
                            }
                            else {
                                html += `<label class="layui-form-label radios" name="a${u}" style="width:200px;cursor:pointer;">${tt[s.config.title]}</label>`;
                                tr += `<input type="radio" name="${s.name}" id="a${u}" value="${tt[s.config.value]}" />`;
                            }
                        }
                    }
                    tr += `</div>`;
                }
                else if (s.type == "button") {
                    if (s.float)
                        html += `<div class="layui-inline" style="margin-${s.float}:20px;float:${s.float}" align="${s.align}">`;
                    else if (s.align)
                        html += `<div align="${s.align}">`;
                    else
                        html += `<div class="layui-inline">`;
                    for (let r in s.data) {
                        let n = s.data[r];
                        html += `<button class="layui-btn${n.class}" id="${n.id}" ${tri}><i class="layui-icon" style="font-size: 18px; color: white;">${n.img}</i>${n.title}</button>`;
                    }
                    html += `</div>`;
                }
                else if (s.type == "xm_select") {
                    let st = 'style="width:200px;"';
                    if (arr1.length == 1) st = "";
                    if (s.title.length > 5) {
                        html += `<label class="layui-form-label" style="width:${(s.title.length - 5) * 15 + 110}px;">${s.title}</label><div class="layui-input-block" style="margin-left:${(s.title.length - 5) * 15 + 110}px;">`;
                    }
                    else html += `<label class="layui-form-label">${s.title}</label><div class="layui-input-block">`;
                    if (s.title.length > 5) {
                        html += `<label class="layui-form-label" style="width:${(s.title.length - 5) * 15 + 110}px;">${s.title}</label>`;
                    }
                    else html += `<label class="layui-form-label">${s.title}</label>`;
                    html += `<div class="${tri2}" id="${s.id}" ${tri} ${st}></div>`;
                    let top = {};
                    top.el = "#" + s.id;
                    if (s.config.b) {
                        top.filterable = s.config.b;//查询是否开启
                        top.filterMethod = function (val, item, index, prop) {
                            let x = ((item.name || "") + "").toLowerCase();
                            let y = ((val || "") + "").toLowerCase();
                            if (x.indexOf(y) > -1) {//名称中包含的大小写都搜索出来
                                return true;
                            }
                            return false;//其他的就不要了
                        }
                    }
                    top.name = s.name || "";
                    if (s.style) {
                        top.empty = s.style.title ? s.style.title : "请选择";
                        top.paging = s.style.page ? true : false;//分页
                        top.repeat = s.style.repeat ? true : false;//重复选
                        top.disabled = s.style.disabled ? true : false;//是否可选
                        if (s.style.max) {
                            top.max = s.style.max;//上限
                            top.maxMethod = function (seles, item) {
                                layer.alert("多选上限为" + top.max + "个，不可选择");
                            };//上限提示
                        }
                        if (s.style.theme) {
                            top.theme = s.style.theme;
                        } else {
                            top.theme = {
                                color: '#6739b6'
                            };
                        }
                        if (s.style.radio) {
                            top.radio = true;//单选
                            top.clickClose = true;//选完关闭
                            if (s.style.isfinall) {
                                top.model = {
                                    label: {
                                        type: 'block',
                                        block: {
                                            //最大显示数量, 0:不限制
                                            showCount: 0,
                                            //是否显示删除图标
                                            showIcon: false
                                        }
                                    }
                                };
                            }
                        }
                        else {
                            if (s.style.create) {
                                if (!s.config.b) top.filterable = true;
                                if (typeof s.style.create === "function") {
                                    top.create = s.style.create;
                                } else {
                                    top.create = function (val, arr) {
                                        //返回一个创建成功的对象, val是搜索的数据, arr是搜索后的当前页面数据
                                        return {
                                            name: val,
                                            value: val
                                        }
                                    }
                                }
                            }
                            top.toolbar = { show: true, list: ['ALL', 'CLEAR', 'REVERSE'] };//单选
                        }
                        if (s.style.on) top.on = s.style.on;//监听
                    }
                    top.data = (s.data || []).map(x => {
                        let value = x.value ? x.value : x[s.config.value];
                        let name = x.name ? x.name : x[s.config.title];
                        let selected = x.selected ? true : false;
                        if (s.value) {
                            if (typeof s.value == "string") {
                                if (value == s.value) selected = true;
                                else selected = false;
                            }
                            else {
                                if (s.value.inclues(value)) selected = true;
                                else selected = false;
                            }
                        }
                        return {
                            name , value , selected
                            , disabled: x.disabled ? true : false
                        };
                    });
                    html += "</div>";
                    atty[s.id] = { name: top, value: null };
                }
                else {
                    if (s.title.length > 5) {
                        html += `<label class="layui-form-label" style="width:${(s.title.length - 5) * 15 + 110}px;">${s.title}</label><div class="layui-input-block" style="margin-left:${(s.title.length - 5) * 15 + 110}px;">`;
                    }
                    else html += `<label class="layui-form-label">${s.title}</label><div class="layui-input-block">`;

                    if (s.type == "checkbox" || s.type == "radio") {
                        for (let t in s.data) {
                            let vd = s.data[t];
                            if (vd.value == s.value)
                                html += `<input class="layui-input ${tri2}" style="width:200px;" type="${s.type}" name="${s.name}" value="${vd[s.config.value]}" title="${vd[s.config.title]}" checked ${tri}/>`;
                            else
                                html += `<input class="layui-input ${tri2}" style="width:200px;" type="${s.type}" name="${s.name}" value="${vd[s.config.value]}" title="${vd[s.config.title]}" ${tri}/>`;
                        }
                    }
                    else if (s.type == "text") {
                        html += `<input class="layui-input ${tri2}" style="width:200px;" type="${s.type}" name="${s.name}" value="${s.value}" ${tri}/>`;
                    }
                    else if (s.type == "textarea") {
                        html += `<textarea class="layui-textarea ${tri2}" style="width:200px;" type="${s.type}" name="${s.name}" ${tri}>${s.value}</textarea>`;
                    }
                    else if (s.type == "time") {
                        html += `<input class="layui-input ${tri2}" style="width:200px;" type="text" id="${s.id}" name="${s.name}" readonly value="${s.value}" ${tri}/>`;
                    }
                    else if (s.type == "select") {
                        if (s.config.b)
                            html += `<select class="${tri2}" style="width:200px;" name="${s.name}" lay-search ${tri}>`;
                        else
                            html += `<select class="${tri2}" style="width:200px;" name="${s.name}" ${tri}>`;
                        for (let t1 in s.data) {
                            let vd1 = s.data[t1];
                            if (vd1.value == s.value)
                                html += `<option value="${vd1[s.config.value]}" selected="">${vd1[s.config.title]}</option>`;
                            else
                                html += `<option value="${vd1[s.config.value]}">${vd1[s.config.title]}</option>`;
                        }
                        html += `</select>`;
                    }

                    html += `</div>`;
                }
                if (s.type != "button") {
                    if (!s.full || (s.full && s.full != 1))
                        html += `</div>`;
                }
                html += tr;
            }
            html += `</div>`;
        }
        let form = $(`#${formId}`);
        if (form.length == 0) {
            form = $(`<form class="layui-form layui-form-pane" id="${formId}"></form>`);
            form.appendTo($("body"));
        }
        form.html(html);
        if (bb) {
            $("label.radios", form).click(function () {
                let chs = $(this);
                let name = chs.attr("name");
                $("label.radios", form).attr("style", "width:200px;cursor:pointer;");
                chs.attr("style", "width:200px;cursor:pointer;background-color: #00b7e1;");
                $("#" + name).prop("checked", true);
                if (xhc.config.b3) xhc.query();
                return false;
            });
        }
        if (Object.keys(atty).length > 0) {
            for (let i in atty) {
                atty[i].value = xmSelect.render(atty[i].name);
            }
        }
        return atty;
    };
    //表单弹窗配置
    trs.tableTanConfig = function (data, di, btn, ta = {}) {//例子 [{row:1,cell:1,type:"checkbox",data:[],name:"",title:"",value:"",id:"",config:{title:"",value:"",b:false}}]
        let atty = {};
        if (!data || data.length == 0) return atty;
        let div = $("#" + di);
        if (div.length == 0) {
            div = $(`<div style="display: none; padding: 10px; padding-right: 30px; height: 90%; width: 90%;" id="${di}"></div>`);
            div.appendTo($("body"));
        }
        let map = data.map(x => x.row).sort(function (n1, n2) {
            return n1 - n2;
        });
        $.unique(map.sort());
        let html = ``;
        let se = [];
        for (let i in map) {
            let arr1 = data.filter(x => x.row == map[i]).sort(function (n1, n2) {
                return n1.cell - n2.cell;
            });
            html += `<div class="layui-form-item" style="margin-left:20px">`;
            for (let i1 in arr1) {
                let s = arr1[i1];
                if (!s.s) se.push({ name: s.name, yan: s.yan, title: s.title, alert: s.alert });
                let cla = `"`;
                let tri = s.data_type ? ` ${s.data_type.join(" ")}` : "";
                let tri1 = s.class ? ` ${s.class}` : ``;
                let tri2 = s.class_t ? s.class_t.join(" ") : ``;
                if (arr1.length > 1) html += `<div class="layui-inline">`;
                if (s.onl) cla = ` layui-disabled" readonly`;
                if (s.type == "hidden") { html += `<input class="layui-hide" type="text" readonly name="${s.name}" value="${s.value}" />`; continue; }
                else if (s.type == "xm_select") {
                    let st = 'style="width:200px;"';
                    if (arr1.length == 1) st = "";
                    if (s.title.length > 5) {
                        html += `<label class="layui-form-label" style="width:${(s.title.length - 5) * 15 + 110}px;">${s.title}</label><div class="layui-input-block" style="margin-left:${(s.title.length - 5) * 15 + 110}px;">`;
                    }
                    else html += `<label class="layui-form-label">${s.title}</label><div class="layui-input-block">`;
                    if (s.title.length > 5) {
                        html += `<label class="layui-form-label" style="width:${(s.title.length - 5) * 15 + 110}px;">${s.title}</label>`;
                    }
                    else html += `<label class="layui-form-label">${s.title}</label>`;
                    html += `<div class="${tri2}" id="${s.id}" ${tri} ${st}></div>`;
                    let top = {};
                    top.el = "#" + s.id;
                    if (s.config.b) {
                        top.filterable = s.config.b;//查询是否开启
                        top.filterMethod = function (val, item, index, prop) {
                            let x = ((item.name || "") + "").toLowerCase();
                            let y = ((val || "") + "").toLowerCase();
                            if (x.indexOf(y) > -1) {//名称中包含的大小写都搜索出来
                                return true;
                            }
                            return false;//其他的就不要了
                        }
                    }
                    top.name = s.name || "";
                    if (s.style) {
                        top.empty = s.style.title ? s.style.title : "请选择";
                        top.paging = s.style.page ? true : false;//分页
                        top.repeat = s.style.repeat ? true : false;//重复选
                        top.disabled = s.style.disabled ? true : false;//是否可选
                        if (s.style.max) {
                            top.max = s.style.max;//上限
                            top.maxMethod = function (seles, item) {
                                layer.alert("多选上限为" + top.max + "个，不可选择");
                            };//上限提示
                        }
                        if (s.style.theme) {
                            top.theme = s.style.theme;
                        } else {
                            top.theme = {
                                color: '#6739b6'
                            };
                        }
                        if (s.style.radio) {
                            top.radio = true;//单选
                            top.clickClose = true;//选完关闭
                            if (s.style.isfinall) {
                                top.model = {
                                    label: {
                                        type: 'block',
                                        block: {
                                            //最大显示数量, 0:不限制
                                            showCount: 0,
                                            //是否显示删除图标
                                            showIcon: false
                                        }
                                    }
                                };
                            }
                        }
                        else {
                            if (s.style.create) {
                                if (!s.config.b) top.filterable = true;
                                if (typeof s.style.create === "function") {
                                    top.create = s.style.create;
                                } else {
                                    top.create = function (val, arr) {
                                        //返回一个创建成功的对象, val是搜索的数据, arr是搜索后的当前页面数据
                                        return {
                                            name: val,
                                            value: val
                                        }
                                    }
                                }
                            }
                            top.toolbar = { show: true, list: ['ALL', 'CLEAR', 'REVERSE'] };//单选
                        }
                        if (s.style.on) top.on = s.style.on;//监听
                    }
                    top.data = (s.data || []).map(x => {
                        let value = x.value ? x.value : x[s.config.value];
                        let name = x.name ? x.name : x[s.config.title];
                        let selected = x.selected ? true : false;
                        if (s.value) {
                            if (typeof s.value == "string") {
                                if (value == s.value) selected = true;
                                else selected = false;
                            }
                            else {
                                if (s.value.inclues(value)) selected = true;
                                else selected = false;
                            }
                        }
                        return {
                            name, value, selected
                            , disabled: x.disabled ? true : false
                        };
                    });
                    html += "</div>";
                    atty[s.id] = { name: top, value: null };
                }
                else {
                    if (s.title.length > 5) {
                        html += `<label class="layui-form-label" style="width:${(s.title.length - 5) * 15 + 110}px;">${s.title}</label><div class="layui-input-block" style="margin-left:${(s.title.length - 5) * 15 + 110}px;">`;
                    }
                    else html += `<label class="layui-form-label">${s.title}</label><div class="layui-input-block">`;
                    let tri = s.data_type ? ` ${s.data_type.join(" ")}` : "";
                    if (s.type == "checkbox" || s.type == "radio") {
                        for (let t in s.data) {
                            let vd = s.data[t];
                            if (vd.value == s.value)
                                html += `<input class="${cla} type="${s.type}" name="${s.name}" value="${vd[s.config.value]}" title="${vd[s.config.title]}" checked ${tri}/>`;
                            else
                                html += `<input class="${cla} type="${s.type}" name="${s.name}" value="${vd[s.config.value]}" title="${vd[s.config.title]}" ${tri}/>`;
                        }
                    }
                    else if (s.type == "text") {
                        html += `<input class="layui-input${cla} type="${s.type}" name="${s.name}" value="${s.value}" ${tri}/>`;
                    }
                    else if (s.type == "textarea") {
                        html += `<textarea class="layui-textarea${cla} name="${s.name}" ${tri}>${s.value}</textarea>`;
                    }
                    else if (s.type == "time") {
                        html += `<input class="layui-input${cla} type="text" id="${s.id}" name="${s.name}" readonly value="${s.value}" ${tri}/>`;
                    }
                    else if (s.type == "select") {
                        if (s.config.b)
                            html += `<select name="${s.name}" class="${cla} ${tri} lay-search>`;
                        else
                            html += `<select name="${s.name}" class="${cla} ${tri}>`;
                        for (let t1 in s.data) {
                            let vd1 = s.data[t1];
                            if (vd1.value == s.value)
                                html += `<option value="${vd1[s.config.value]}" selected="">${vd1[s.config.title]}</option>`;
                            else
                                html += `<option value="${vd1[s.config.value]}">${vd1[s.config.title]}</option>`;
                        }
                        html += `</select>`;
                    }
                    html += `</div>`;
                }
                if (arr1.length > 1) html += `</div>`;
            }
            html += `</div>`;
        }
        let form = $(`<form class="layui-form layui-form-pane"></form>`);
        form.html(html);
        div.html(``);
        form.appendTo(div);
        let funs = function () {
            let chs = $(this);
            let tx = function () {
                form[0].reset();
                if (ta.data) {
                    for (let i in ta.data) {
                        let y = ta.data[i];
                        $(`[name='${y.name}']`, form).val(y.value);
                    }
                }
                if (Object.keys(atty).length > 0) {
                    for (let i in atty) {
                        let ppf = atty[i].value.options.data.filter(x => x.selected) || [];
                        atty[i].value.setValue(ppf);
                    }
                }
                layui.form.render();
                let yuuu = {
                    type: 1
                    , title: ta.title ? ta.title : "查看"
                    , area: ta.area ? ta.area : ['60%', '80%']
                    , titleAlign: 'c'
                    , offset: 'auto'
                    , content: div
                    , btn: ta.btn ? ta.btn : ['关闭']
                    , btnAlign: 'c' //按钮居中
                    , success: function () {
                        if (ta.success) ta.success();
                    }
                    , end: function (index) {
                        div.hide();
                        layer.close(index);
                    }
                };
                if (ta.btn) {
                    for (let r in ta.btn) {
                        let rt = Number(r) + 1;
                        let er = `btn${rt}`;
                        if (rt == 1) er = 'yes';
                        yuuu[er] = function (indexx, a, see = se, ta1 = ta, err = er, div1 = div) {
                            if (ta1[err]) {
                                let ddis = $(`*[disabled]`, form);
                                ddis.removeAttr("disabled");
                                let sele = form.serializeArray();
                                let se1 = [];
                                if (see.length > 0) {
                                    for (let i in see) {
                                        let re = see[i];
                                        let bx = true;
                                        let re1 = sele.find(x => x.name == re.name);
                                        if (re1) {
                                            if (re.yan && typeof (re.yan) == "string" && re.yan == "none") se1.push(re1);
                                            else if (re.yan && typeof (re.yan) == "function" && re.yan(re1.value)) se1.push(re1);
                                            else if (!re.yan && re1.value.trim()) se1.push(re1);
                                            else bx = false;
                                        }
                                        if (bx) continue;
                                        if (re.alert) layer.msg(re.alert);
                                        else layer.msg(`${re.title}不可为空！`);
                                        return false;
                                    }
                                } else return false;
                                if (se1.length == 0) return false;
                                layer.confirm(`请您确认是否${ta1.title}？`, {
                                    title: "信息提示",
                                    yes: function (index) {
                                        layer.close(index);
                                        ta1[err](se1, indexx, err);
                                    },
                                    cancel: function (index) {
                                        layer.close(index);
                                    }
                                });
                                return false;
                            }
                            else {
                                layer.close(indexx);
                                div1.hide();
                            }
                        };
                    }
                }
                layui.layer.open(yuuu);
            };
            if (ta.edit) ta.edit(tx, ta, chs);
            else tx();
            return false;
        };
        let rt = btn.split(",");
        for (let oo in rt) {
            let uo = $(`${rt[oo]}`);
            if (uo.length > 0) {
                uo.unbind();
                uo.click(funs);
            } else {
                uo = $(`<input type="button" style="display:none;" id="${rt[oo].replace(/#/g, '')}">`);
                uo.appendTo(div);
                uo.click(funs);
            }
        }
        if (Object.keys(atty).length > 0) {
            for (let i in atty) {
                atty[i].value = xmSelect.render(atty[i].name);
            }
        }
        return atty;
    };
    //表格序号方法
    trs.tableNum = function (ta, isd) {
        let page = Number($(".layui-table-page .layui-laypage-curr", ta).children().eq(1).text());
        let limit = Number($(".layui-table-page .layui-laypage-limits select", ta).val());
        let lt = (page - 1) * limit + 1;
        $(`table td[data-field= '${isd}']`, ta).each((a, b) => {
            $(b).children().html(lt + a);
        });
    };
    //表格查询 (是否开启多表头 是否开启表头查询 表头字段) 表单id 表格id 按钮id table渲染id 额外加入的查询条件
    trs.tableSelect = function (str, str1, str2, str3, table, render = {}, data = {}) {
        let xhc = this;
        xhc.config.select = str2;
        $(`#${str2} `).click(function () {
            let test = {
                page: { curr: 1 }
            };
            let formdata = [];
            $(`#${str} input[name = 'data']`).val("");
            formdata = $(`#${str} `).serializeArray();
            let config = xhc.config;
            let url = "";
            if (config.b) {
                let t = formdata.find(x => x.name == config.field);
                if (t) {
                    let cols = xhc.tableColumns[t.value];
                    if (JSON.stringify(xhc.thisColumns) != JSON.stringify(cols)) {
                        test.cols = [cols];
                    } else if (cols.length == 0) {
                        test.cols = [[]];
                    } else {
                        if (config.b1) {
                            let table1 = $(`#${str1} `).parent().serializeArray();
                            table1 = xhc.getTranslate(table1, null, config.b2);
                            let table2 = $(`#${str1} `).parent().serializeArray();
                            xhc.tables[t.value] = table2;
                            formdata = formdata.concat(table1);
                        }
                    }
                    url = xhc.tableUrls[t.value];
                    if (url) {
                        test.url = url;
                    } else {
                        url = xhc.tableUrls[config.field];
                        if (url) {
                            test.url = url;
                        }
                    }
                }
            }
            else {
                if (config.b1) {
                    let table3 = $(`#${str1} `).parent().serializeArray();
                    table3 = xhc.getTranslate(table3, null, config.b2);
                    formdata = formdata.concat(table3);
                    let table4 = $(`#${str1} `).parent().serializeArray();
                    xhc.tables[config.field] = table4;
                }
                url = xhc.tableUrls[config.field];
                if (url) {
                    test.url = url;
                }
            }
            if (config.check.b) {
                let arrs = xhc.arrCheck;
                arrs.Checked = false;
                arrs.Check = [];
                arrs.UnCheck = [];
                if (config.check.field) $(`${config.check.field}`).html("");
            }
            let select = JSON.stringify(formdata);
            $(`#${str} input[name = 'data']`).val(select);
            let where = { data: select };
            if (data) {
                if (typeof data == "function") {
                    where = Object.assign(where, data());
                }
                else if (Object.prototype.toString.call(data) === "[object Array]") {
                    for (let i in data) {
                        where[data[i].name] = data[i].value;
                    }
                }
                else if (Object.prototype.toString.call(data) === '[object Object]') {
                    where = Object.assign(where, data);
                }
            }
            test.where = where;
            xhc.addLoad();
            if (test.cols) {
                if (test.url)
                    render.url = test.url;
                if (test.cols)
                    render.cols = test.cols;
                if (test.where)
                    render.where = test.where;
                if (render.data)
                    delete render.data;//删除属性
                if (render.cols[0].length == 0) {
                    layer.msg("未设置展示字段！");
                    delete table.url;
                }
                table.render(render);
            }
            else table.reload(`${str3}`, test);
            return false;
        });
    };
    //导出Excel
    trs.toExcel = function (tableId, formId, downForm, url, table, datas = null) {
        $("#toExcel").click(() => {
            let t = table.cache[`${tableId}`];
            if (t.length > 0) {
                let select = $(`#${formId} [name='data']`).val();
                let $form = $(`#${downForm}`);
                if ($form.length == 0)
                    $form = $(`<form action='${url}' method='post' style='display:none;'></form>`);
                else
                    $form.remove();
                $form.append(`<input name='data' type='hidden' value='${select}'>`);
                if (datas) {
                    let obj = datas(table, select ? JSON.parse(select) : []);
                    if (obj && typeof obj === "object") {
                        if (Array.isArray(obj)) {
                            for (let i in obj) {
                                $form.append(`<input name='${obj[i].name}' type='hidden' value='${obj[i].value}'>`);
                            }
                        } else {
                            let tt = Object.keys(obj);
                            for (let i in tt) {
                                $form.append(`<input name='${tt[i]}' type='hidden' value='${obj[tt[i]]}'>`);
                            }
                        }
                    }
                }
                $form.appendTo($('body'));
                $form.submit();
                $(`#${downForm}`).submit();
                return false;
            }
            layer.msg("无数据,下载失败!");
            return false;
        });
    };
    //导出Excel
    trs.toExcel1 = function (tableId, formId, url, table, title = "", datas = null, func = null, btn = "#toExcel") {
        let xhc = this;
        $(btn).click(function () {
            let t = table.cache[`${tableId}`];
            let data = {};
            if (t.length > 0) {
                let select = $(`#${formId} [name='data']`).val();
                data.data = select;
                if (datas) {
                    let obj = datas(table, select ? JSON.parse(select) : []);
                    if (obj && typeof obj === "object") {
                        if (Array.isArray(obj)) {
                            for (let i in obj) {
                                data[obj[i].name] = obj[i].value;
                            }
                        } else {
                            let tt = Object.keys(obj);
                            for (let i in tt) {
                                data[tt[i]] = obj[tt[i]];
                            }
                        }
                    }
                }
                if (func) {
                    let hh = func();
                    if (hh) data = Object.assign(data, hh);
                }
                xhc.addLoad();
                $.ajax({
                    url: url,
                    type: "POST",
                    data: data,
                    dataType: 'text',
                    success: function (res) {
                        let t = typeof res == "string" ? JSON.parse(res) : res;
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
                        xhc.closeLoad();
                    }, error: function (err) {
                        console.log(err);
                        layer.msg("文件下载失败！");
                        xhc.closeLoad();
                    }
                });
                return false;
            }
            layer.msg("无数据,下载失败!");
            return false;
        });
    };
    //导入数据
    trs.Import = function (url, file, type, layer, data = null, confirm = null, scy = null, btn = "#Import") {
        let xhc = this;
        let $form = $(`<input type="file" id="${file}" style="display:none;">`);
        $form.appendTo($('body'));
        $(btn).click(() => {
            document.getElementById(file).value = '';
            $(`#${file}`).click();
            return false;
        });
        $(`#${file}`).change(function (e) {
            if (!e || !e.target || !e.target.files || e.target.files.length == 0) {
                return false;
            }
            let file = e.target.files[0];
            let files = file.name.split(".");
            let filename = files[files.length - 1];
            if (type.indexOf(filename) < 0) {
                layer.msg(`文件格式不正确（只支持${type.join(",")}格式的文件）！`);
                return false;
            }
            let fus = function (uu, da) {
                xhc.addLoad();
                let fd = new FormData();
                fd.append('files', file);
                if (da) {
                    let ky = Object.keys(da);
                    for (let i in ky) {
                        fd.append(ky[i], da[ky[i]]);
                    }
                }
                $.ajax({
                    url: uu,
                    type: "POST",
                    data: fd,
                    processData: false,//jquery不去处理发送的数据
                    contentType: false,//jQuery不去设置content-type请求头
                    success: function (res) {
                        xhc.closeLoad();
                        if (res.code == 200) {
                            if (scy) {
                                layer.msg("文件上传完成！");
                                scy(da, res);
                            } else {
                                layer.msg(`文件异步上传中！`);
                            }
                        }
                        else layer.msg(`文件上传失败，失败原因：${res.msg}！`);
                    }, error: function () {
                        xhc.closeLoad();
                        layer.msg(`文件上传异常！`);
                    }
                });
            };
            if (confirm) {
                confirm(url, fus, data ? data() : null);
            } else {
                layer.confirm('请您确认是否上传此文件？', {
                    title: "信息提示",
                    yes: function (index) {
                        layer.close(index);
                        fus(url, data ? data() : null);
                    },
                    cancel: function (index) {
                        layer.close(index);
                    }
                });
                return false;
            }
        });
    };
    //导出Excel
    trs.Down = function (url, file, func = null) {
        $(`#${file}`).click(() => {
            let y = $("#downloadurl");
            if (y.length == 0) {
                y = $(`<a id='downloadurl' style="display:none;"><p>下载</p></a>`);
                y.appendTo("body");
            }
            if (func) func((u) => {
                y.attr("href", u);
                $('p', y).click();
            });
            else {
                y.attr("href", url);
                $('p', y).click();
            }
            return false;
        });
    };
    xhcLayui.xhcArrs.push({ index: indexs, data: trs });
    return trs;
};
xhcLayui.xhc = getTrs();
xhcLayui.xhcs = getTrs;