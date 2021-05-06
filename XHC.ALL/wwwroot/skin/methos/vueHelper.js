//ajax请求
var htps = {
    post: (url, data, sho, func) => {
        sho.show = true;
        var head = { 'Content-Type': 'application/x-www-form-urlencoded' };
        Vue.http.post(url, data, { headers: head, emulateJSON: true }).then(result => {
            sho.show = false;
            func(result.body);
        });
    }
    , postFile: (url1, data1, sho1, func1) => {
        setTimeout((url = url1, data = data1, sho = sho1, func = func1) => {
            sho.show = true;
            var head = { 'Content-Type': 'multipart/form-data' };
            Vue.http.post(url, data, { headers: head, emulateJSON: true }).then(result => {
                sho.show = false;
                func(result.body);
            });
        }, 100);
    },
    get: (url, sho, func) => {
        sho.show = true;
        var head = { 'Content-Type': 'application/x-www-form-urlencoded' };
        Vue.http.get(url, { headers: head, emulateJSON: true }).then(result => {
            sho.show = false;
            func(result.body);
        });
    }
};

//分页组件
var page = {
    props: []
    , data() {
        return {
            page: 1,
            limit: 10,
            count: 0,
            total: 0,
            limits: [10, 20, 30, 40, 50, 100],
            pas: 0
        };
    }
    , template: `
        <ul v-if="count>0" class= "pagination pagination-sm" align='center'>
            <li><a href="#" :class="{'disabled':dis(page,1)}" @click.prevent="toPageInfo(1)">首页</a></li>
            <li><a href="#" :class="{'disabled':dis(page,1)}" @click.prevent="toPageInfo(page-1)">上一页</a></li>
            <li v-for="(x,i) in pas" :key="x" v-if="x>pas-7" :class="{'active':dis(x,page)}">
                <a @click.prevent="toPageInfo(x)" href="#">{{x}}</a>
            </li>
            <li><a v-if="total>pas" @click.prevent href="#">···</a></li>
            <li><a href="#" :class="{'disabled':dis(page,total)}" @click.prevent="toPageInfo(page+1)">下一页</a></li>
            <li><a href="#" :class="{'disabled':dis(page,total)}" @click.prevent="toPageInfo(-1)">尾页</a></li>
            <li><a href="#" @click.prevent>总条数：{{count}}</a></li>
            <li><a href="#" @click.prevent>总页数：{{total}}</a></li>
            <li><a href="#" @click.prevent>条数：<select v-model="limit"><option :value="y" v-for="(y,i) in limits"  :key="y">{{y}}条</option></select></a></li>
        </ul>
        <ul v-else class= "pagination pagination-sm" align='center'>            
            <li><a href="#" class="disabled" @click.prevent>首页</a></li>
            <li><a href="#" class="disabled" @click.prevent>上一页</a></li>
            <li class="active"><a @click.prevent href="#">1</a></li>
            <li><a v-if="total>pas" @click.prevent href="#">···</a></li>
            <li><a href="#" class="disabled" @click.prevent>下一页</a></li>
            <li><a href="#" class="disabled" @click.prevent>尾页</a></li>
            <li><a href="#" @click.prevent>总条数：{{count}}</a></li>
            <li><a href="#" @click.prevent>总页数：{{total}}</a></li>
            <li><a href="#" @click.prevent>条数：<select v-model="limit"><option :value="y" v-for="(y,i) in limits"  :key="y">{{y}}条</option></select></a></li>
        </ul>`
    , methods: {
        pageInfo(page, total) {
            if (total > 8) {
                if (this.pas)
                    if (page > 7 && page < total) return page + 1;
                    else if (page > 7 && page === total) return page;
                    else return 8;
            } else return page;
        },
        dis(page, total) {
            if (page === total) {
                return true;
            } else return false;
        },
        toPageInfo(pa) {
            //if (pa === 0 || (pa < 0 && this.page === this.total) || pa === this.page) {
            //    return;
            //}
            this.Flush(pa);
        },
        Flush(pa) {
            this.$emit("tohref", pa, this.limit);
        }
    },
    watch: {
        limit() {
            this.Flush(this.page, this.limit);
        }, total() {
            if (this.page === 1 && this.total >= 7) {
                this.pas = 7;
            } else if (this.page === 1 && this.total < 7) {
                this.pas = this.total;
            } else {
                if (this.pas > this.total) {
                    this.pas = this.total;
                } else if ((this.pas - this.page) < (this.total - this.page)) {
                    if (this.total - this.page >= 3) {
                        this.pas = this.page + 3;
                    } else {
                        this.pas = this.total;
                    }
                }
            }
        }, page() {
            var pa = this.page;
            var tot = this.total;
            var tr = pa;
            if (pa > 4) {
                tr = pa + 3;
                if (tr > tot) tr = tot;
            } else if (tot >= 7) {
                tr = 7;
            } else {
                tr = tot;
            }
            this.pas = tr;
        }
    }
};
Vue.component('page', page);

//遮罩
var zhao = {
    data() {
        return {
            show: false
        };
    }
    , template: `<div class="modal-backdrop fade in" v-show="show"></div>`
};
Vue.component('zhao', zhao);

//弹出框
var confirm = {
    data() {
        return {
            show: false
            , title: `提示`
            , body: ``
            , btn: []
        };
    }
    , template: ` <div><div class="modal-dialog" style="z-index:20000;position: fixed;top: 0; right: 0;bottom: 0;left: 0;" v-show="show">
                                                                           <div class="modal-content">
                                                                                <div class="modal-header">
                                                                                    <button type="button" class="close" @click.prevent="close">&times;</button>
                                                                                    <h4 class="modal-title" v-html="title"></h4>
                                                                                </div>
                                                                                <div class="modal-body" v-html="body"></div>
                                                                                <div class="modal-footer">
                                                                                    <button v-for="(x,i) in btn" :key="i"  type="button" :class="x.class" @click.prevent="btnMethod(i)" v-html="x.title"></button>
                                                                                </div>
                                                                            </div>
                                                                     </div>
                                                      <div class="modal-backdrop fade in" v-show="show"></div>
                             </div>`
    , methods: {
        btnMethod(i) {
            var t = this.btn[i].click;
            if (t) {
                if (this[t]) this[t]();
                else this.$emit(t);
            }
        }
        , close() {
            this.show = false;
        }
    }
};
Vue.component('confirm', confirm);

//提示框
var alert = {
    data() {
        return {
            show: false
            , title: `提示`
            , body: ``
            , btn: [{ title: `关闭`, class: [`btn`, `btn-default`], click: `close` }]
        };
    }
    , template: ` <div><div class="modal-dialog" style="z-index:40000;position: fixed;top: 0; right: 0;bottom: 0;left: 0;" v-show="show">
                                                                           <div class="modal-content">
                                                                                <div class="modal-header">
                                                                                    <button type="button" class="close" @click.prevent="close">&times;</button>
                                                                                    <h4 class="modal-title" v-html="title"></h4>
                                                                                </div>
                                                                                <div class="modal-body" v-html="body"></div>
                                                                                <div class="modal-footer">
                                                                                    <button type="button" class="btn btn-default" @click.prevent="close" v-html="'关闭'"></button>
                                                                                </div>
                                                                            </div>
                                                                     </div>
                                                              <div class="modal-backdrop fade in" style="z-index:30000" v-show="show"></div>
                                                                    
                             </div>`
    , methods: {
        close() {
            this.title = `提示`;
            this.show = false;
        }
    }
};
Vue.component('alert', alert);

//加载中
var zhe = {
    data() {
        return {
            show: false
        };
    }
    , template: `<div><div class="modal-dialog">
                                                                            <div style="width: 200px;height:20px; z-index: 40000; position: fixed; text-align: center; left: 50%; top: 50%;margin-left:-100px;margin-top:-10px" v-show="show">
                                                                                <div class="progress progress-striped active" style="margin-bottom: 0;">
                                                                                    <div class="progress-bar" style="width: 100%;"></div>
                                                                                </div>
                                                                                <h5 style="color:blue"><strong>正在加载。。。</strong></h5>
                                                                            </div>
                                                                        </div>
                                                                           <div class="modal-backdrop fade in" v-show="show"></div>
                                  </div>`
};
Vue.component('zhe', zhe);

//表单
var modal = {
    data() {
        return {
            show: false
            , title: `提示`
            , body: []
            , from: {}
            , btn: []
        };
    }
    , template: `<div>
        <div class="modal-dialog" style="z-index:20000;position: fixed;top: 0; right: 0;bottom: 0;left: 0;" v-show="show">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" @click.prevent="close">&times;</button>
                    <h4 class="modal-title" v-html="title"></h4>
                </div>
                <div class="modal-body">
                    <div v-for="(item,i) in body" :key="item.field" :class="{ 'form-group':true, 'has-erro': item.err }">
            <label for="name" v-html="item.html"></label>
            <input v-if="item.type=='text'" type="text" :class="item.class" v-model="form[item.field]" :placeholder=item.pla>
            <select v-else-if="item.select=='text'" type="text" :class="item.class" v-model="form[item.field]">
                <option v-for="(item1,i1) in item.data" :key="i1" :value="item1.value" v-html="item1.html"></option>
            </select>
            <div v-else-if="item.type=='radio'&&item.align=='1'" :class="item.type">
                <label>
                    <input type="radio" :name="item.field" :value="item.value" v-model="form[item.field]" :class="item.class"> {{item.html}}
                </label>
            </div>
            <div v-else-if="item.type=='checkbox'&&item.align=='1'" :class="item.type">
                <label>
                    <input type="checkbox" :name="item.field" :value="item.value" v-model="form[item.field]" :class="item.class"> {{item.html}}
                </label>
            </div>
            <div v-else-if="item.type=='radio'&&item.align=='2'" v-cloak>
                <label class="radio-inline" v-for="(item1,i1) in item" :key="i1">
                    <input type="radio" :name="item.field" :value="item1.value" v-model="form[item.field]" :class="item1.class"> {{item1.html}}
                </label>
            </div>
            <div v-else-if="item.type=='checkbox'&&item.align=='2'" v-cloak>
                <label class="checkbox-inline" v-for="(item1,i1) in item.data" :key="i1">
                    <input type="checkbox" :name="item.field" :value="item1.value" v-model="form[item.field]" :class="item1.class"> {{item1.html}}
                </label>
            </div>
            <p class="help-block" style="color:red;" v-show="item.err" v-html="item.con"></p>
        </div>
                </div>
                <div class="modal-footer">
                    <button v-for="(x,i) in btn" :key="i" type="button" :class="x.class" @click.prevent="btnMethod(i)" v-html="x.title"></button>
                </div>
            </div>
        </div>
<div class="modal-backdrop fade in" v-show="show"></div>
    </div>`
    , methods: {
        btnMethod(i) {
            var t = this.btn[i].click;
            if (t) {
                if (this[t]) this[t]();
                else this.$emit(t);
            }
        }
        , close() {
            this.show = false;
        }
        , changge() {
            this.form = {};
            for (var o in this.body) {
                var t = this.body[o];
                if (t.form !== undefined) this.form[t.field] = t.form;
                t.err = false;
                t.con = '';
            }
        }
    }
    , watch: {
        show() {
            if (this.show) this.changge();
        }
        , body() {
            this.changge();
        }
    }
};
Vue.component('modal', modal);

//弹出框表格
var modelTable = {
    data() {
        return {
            show: false
            , title: `提示`
            , url: ``
            , search: {}
            , field: []
            , showfield: []
            , list: []
            , btn: [
                { title: `关闭`, class: [`btn`, `btn-default`], click: `close` }
            ]
        };
    }
    , template: `<div>
        <div class="modal-dialog" style="z-index:20000;position: fixed;top: 0; right: 0;bottom: 0;left: 0;" v-show="show">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" @click.prevent="close">&times;</button>
                    <h4 class="modal-title" v-html="title"></h4>
                </div>
                <div class="modal-body">
                    <table class="table table-bordered table-hover text-nowrap" style="width:97%;" align="center">
                        <tr>
                            <th style="text-align:center;">序号</th>
                            <th v-for="(item,i) in field" :name="item.field" :key="item.field" v-html="item.title" style="text-align:center;"></th>
                            <th v-if="showfield&&showfield.length>0" style="text-align:center;">操作</th>
                        </tr>
                        <tr v-for="(item,i) in list" :key="i" style="text-align:center;">
                            <td v-html="num(i+1)">序号</td>
                            <td v-for="(item1,i1) in field" :key="item1.field" v-html="item[item1.field]"></td>
                            <td v-if="showfield&&showfield.length>0">
                                <a v-for="(item2,i2) in showfield" @click.prevent="btnMethodField(item2.func(item2))" v-html="item2.text" :class="item2.class(item2)"></a>
                            </td>
                        </tr>
                        <tr v-if="list.length == 0" align="center">
                            <td @colspan="field.length+2">无数据</td>
                        </tr>
                    </table>
                    <page ref="pages" @tohref="searchs"></page>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" @click.prevent="close" v-html="'关闭'"></button>
                </div>
            </div>
        </div>
        <zhe ref="zhes"></zhe>
    </div>`
    , methods: {
        btnMethod(i) {
            var t = this.btn[i].click;
            if (t) {
                if (this[t]) this[t]();
                else this.$emit(t);
            }
        }
        , close() {
            this.show = false;
        }
        , searchs(page, limit) {
            this.fu(page, limit);
        }
        , flush() {
            this.fu(1, this.$refs.pages.limit);
        }
        , fu(page, limit) {
            this.json = JSON.stringify(this.search);
            htps.post(this.url, { data: this.json, page: page ? page : this.$refs.pages.page, limit: limit ? limit : this.$refs.pages.limit }, this.$refs.zhes, (res) => {
                this.$refs.pages.count = res.count;
                this.$refs.pages.page = res.page;
                this.$refs.pages.total = res.total;
                this.list = res.data;
            });
        }
    }
    , watch: {
        show() {
            if (this.$refs.zhaos.show) this.changge();
            this.$refs.zhaos.show = this.show;
        }
    }
    , mounted() {
    }
};
Vue.component('modelTable', modelTable);
