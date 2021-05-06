using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using XHC.COM.Extend;

namespace XHC.COM.Model
{
    [Serializable]
    public class Record : Dictionary<string, object>
    {
        #region 外部获取条件

        //获取where条件
        public string getWhere => GetWhere("where");

        //获取where条件
        public string getHaving => GetWhere("having");

        //获取查询长度条件
        public string getCountWhere => GetWhere("where", 1);

        //获取HTTP请求参数
        public string getUrlParam => GetUrlParam();

        //获取update参数
        public string getUpdate => GetUpdate();

        //获取全部键
        public List<string> Keys_ => GetDic().Keys?.ToList() ?? new List<string>();

        //获取全部值
        public List<object> Values_ => GetDic().Values?.ToList() ?? new List<object>();

        //获取insert参数
        public (string key, string value) getInsert => GetInsert();

        #endregion 

        #region 构造函数

        public Record() { }

        /// <summary>
        /// 放入键值构造
        /// </summary>
        /// <param name="key"></param>
        /// <param name="value"></param>
        public Record(string key, object value)
        {
            this.Put(key, value);
        }

        /// <summary>
        /// 放入KeyValuePair构造
        /// </summary>
        /// <param name="kkk"></param>
        public Record(KeyValuePair<string, object> kkk)
        {
            if (!kkk.IsBlank()) this.Put(kkk.Key, kkk.Value);
        }

        /// <summary>
        /// 过滤条件
        /// </summary>
        /// <param name="data">条件字符串</param>
        /// <param name="time">条件字段（查询时使用）</param>
        /// <param name="type">类型 null为查询/删除  否则是新增/修改</param>
        /// <param name="head">对字段名进行操纵</param>
        /// <returns></returns>
        public Record(string data, List<string> time = null, string type = null, Record head = null)
        {
            if (data.IsBlank()) return;
            var obj = data.FromObject<object>();
            var ty = obj.GetType().Name;
            if (ty.Equals("JArray"))
            {
                GetRecord(data.FromObject<List<Record>>(), time, type, head);
            }
            else if (ty.Equals("JObject"))
            {
                GetRecord(data.FromObject<Record>(), time, type, head);
            }
        }

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="dic"></param>
        public Record(Dictionary<string, object> dic)
        {
            if (dic.IsBlank()) return;

            foreach (var x in dic.Keys)
            {
                Put(x, dic[x]);
            }
        }

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="dic"></param>
        public Record(Record rec)
        {
            if (rec.IsBlank()) return;

            foreach (var x in rec.Keys)
            {
                Put(x, rec[x]);
            }
        }

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="dic"></param>
        public Record(List<KeyValuePair<string, object>> rec)
        {
            if (rec.IsBlank()) return;

            foreach (var x in rec)
            {
                Put(x.Key, x.Value);
            }
        }

        #endregion

        #region 索引器

        /// <summary>
        /// 索引索引器
        /// </summary>
        /// <param name="index">索引值</param>
        /// <returns></returns>
        public KeyValuePair<string, object> this[int index]
        {
            get
            {
                var li = this.ToList();
                return li.Count > index ? li[index] : new KeyValuePair<string, object>();
            }
            set
            {
                if (index < 0) return;
                var li = this.ToList();
                if (li.Count > index)
                {
                    var tr = li.Remove(li[index]);
                    li.Insert(index, value);
                }
                else Put(value);
            }
        }

        #endregion

        #region 克隆

        public Record Clone()
        {
            return this.Clone<Record>();
        }

        #endregion

        #region   对Record进行筛选操作

        private void GetRecord(List<Record> dic, List<string> time = null, string type = null, Record head = null)
        {
            time = time ?? new List<string>();
            Record rec = new Record();
            if (dic == null || dic.Count == 0)//条件字符串是否为空
            {
                return;
            }
            //反序列化 去掉value为null或空字符串的数据
            dic = dic.FindAll(x => !x.GetString("name").IsBlank()) ?? new List<Record>();
            dic = type == null ? dic.FindAll(x => !x.GetString("value").IsBlank()) ?? new List<Record>() : dic;
            //反序列化
            object b = null;
            string[] strs1 = new string[] { "," };
            dic.ForEach(x =>
            {
                var name = x.GetString("name").Trim();//字段名
                if (!head.IsBlank())
                {
                    var t = head.GetString("name");
                    var t1 = head.GetString("value");
                    if (t.Equals("rep"))
                    {
                        var t2 = t1.FromObject<Dictionary<string, string>>();
                        var t3 = t2.Keys;
                        if (t3.Contains(name)) name = t2[name];
                    }
                    else if (t.Equals("sub"))
                    {
                        var t2 = t1.Split_None(strs1);
                        if (t2.Count == 2) name = name.Substring(int.Parse(t2[0]), int.Parse(t2[1]));
                        else name = name.Substring(int.Parse(t2[0]));
                    }
                    else if (t.Equals("consub"))
                    {
                        var t2 = t1.Split_None(strs1);
                        var t3 = name.Substring(0, int.Parse(t2[1]));
                        if (t3.Equals(t2[0]))
                        {
                            if (t2.Count == 3) name = name.Substring(int.Parse(t2[1]), int.Parse(t2[2]));
                            else name = name.Substring(int.Parse(t2[1]));
                        }
                    }
                    else if (t.Equals("conrep"))
                    {
                        var t2 = t1.Split_None(strs1);
                        var t3 = name.Substring(0, int.Parse(t2[1]));
                        if (t3.Equals(t2[0]))
                        {
                            if (t2.Count == 4) name = t2[3] + name.Substring(int.Parse(t2[1]), int.Parse(t2[2]));
                            else name = t2[2] + name.Substring(int.Parse(t2[1]));
                        }
                    }
                    else if (t.Equals("add+"))
                    {
                        name = t1 + name;
                    }
                    else if (t.Equals("add-"))
                    {
                        name += t1;
                    }
                }
                var value = x.GetString("value");//value值
                if (name.Equals("data"))
                {
                    return;
                }
                if (type != null && value.IsBlank())
                {
                    value = null;
                }
                else
                {
                    value = value.Trim();
                }
                if (time.Count > 0 && type == null)//查询  
                {
                    string field = time.Find(x1 => x1.Split_None(":")[0] == name);
                    if (!string.IsNullOrEmpty(field))
                    {
                        var strs = field.Split_None(":");
                        if (strs.Count > 1)
                        {
                            var bo1 = this.TryGetValue(name + $":{strs[1]}", out b);
                            if (!bo1)
                            {
                                this.Put(name + $":{strs[1]}", value);//放入条件
                            }
                        }
                        else
                        {
                            var x2 = value.Split_None(" - ");
                            var bo1 = this.TryGetValue($"{name}:>=", out b);
                            if (!bo1)
                            {
                                this.Put($"{name}:>=", x2[0] + " 00:00:00");//放入条件
                            }
                            bo1 = this.TryGetValue($"{name}:<", out b);
                            if (!bo1)
                            {
                                this.Put($"{name}:<", x2.Count == 1 ? DateTime.Parse(x2[0]).AddDays(1).ToJson("yyyy-MM-dd 00:00:00") : DateTime.Parse(x2[1]).AddDays(1).ToJson("yyyy-MM-dd 00:00:00"));
                            }
                        }
                        return;
                    }
                }
                var bo = this.TryGetValue(name, out b);
                if (!bo)
                {
                    this.Put(name, value);//放入条件
                }
            });
        }

        private void GetRecord(Record dic, List<string> time = null, string type = null, Record head = null)
        {
            time = time ?? new List<string>();
            Record rec = new Record();
            if (dic == null || dic.Count == 0)//条件字符串是否为空
            {
                return;
            }
            var keys = dic.Keys.ToList();
            keys = keys.FindAll(x => !x.IsBlank()) ?? new List<string>();//过滤掉name为空的数据
            object b = null;
            string[] strs1 = new string[] { "," };
            keys.ForEach(x =>
            {
                var name = x.Trim();
                if (!head.IsBlank())
                {
                    var t = head.GetString("name");
                    var t1 = head.GetString("value");
                    if (t.Equals("rep"))
                    {
                        var t2 = t1.FromObject<Dictionary<string, string>>();
                        var t3 = t2.Keys;
                        if (t3.Contains(name)) name = t2[name];
                    }
                    else if (t.Equals("sub"))
                    {
                        var t2 = t1.Split_None(strs1);
                        if (t2.Count == 2) name = name.Substring(int.Parse(t2[0]), int.Parse(t2[1]));
                        else name = name.Substring(int.Parse(t2[0]));
                    }
                    else if (t.Equals("consub"))
                    {
                        var t2 = t1.Split_None(strs1);
                        var t3 = name.Substring(0, int.Parse(t2[1]));
                        if (t3.Equals(t2[0]))
                        {
                            if (t2.Count == 3) name = name.Substring(int.Parse(t2[1]), int.Parse(t2[2]));
                            else name = name.Substring(int.Parse(t2[1]));
                        }
                    }
                    else if (t.Equals("conrep"))
                    {
                        var t2 = t1.Split_None(strs1);
                        var t3 = name.Substring(0, int.Parse(t2[1]));
                        if (t3.Equals(t2[0]))
                        {
                            if (t2.Count == 4) name = t2[3] + name.Substring(int.Parse(t2[1]), int.Parse(t2[2]));
                            else name = t2[2] + name.Substring(int.Parse(t2[1]));
                        }
                    }
                    else if (t.Equals("add+"))
                    {
                        name = t1 + name;
                    }
                    else if (t.Equals("add-"))
                    {
                        name += t1;
                    }
                }
                var value = dic.GetString(x);
                if (name.Equals("data"))
                {
                    return;
                }
                if (type != null && value.IsBlank())
                {
                    value = null;
                }
                else if (type == null && value.IsBlank())
                {
                    return;
                }
                else
                {
                    value = value.Trim();
                }
                if (time.Count > 0 && type == null)//查询  
                {
                    string field = time.Find(x1 => x1.Split_None(":")[0] == name);
                    if (!string.IsNullOrEmpty(field))
                    {
                        var strs = field.Split_None(":");
                        if (strs.Count > 1)
                        {
                            var bo1 = this.TryGetValue(name + $":{strs[1]}", out b);
                            if (!bo1)
                            {
                                this.Put(name + $":{strs[1]}", value);//放入条件
                            }
                        }
                        else
                        {
                            var x2 = value.Split_None(" - ");
                            var bo1 = this.TryGetValue($"{name}:>=", out b);
                            if (!bo1)
                            {
                                this.Put($"{name}:>=", x2[0] + " 00:00:00");//放入条件
                            }
                            bo1 = this.TryGetValue($"{name}:<", out b);
                            if (!bo1)
                            {
                                this.Put($"{name}:<", x2.Count == 1 ? DateTime.Parse(x2[0]).AddDays(1).ToJson("yyyy-MM-dd 00:00:00") : DateTime.Parse(x2[1]).AddDays(1).ToJson("yyyy-MM-dd 00:00:00"));//放入条件
                            }
                        }
                        return;
                    }
                }
                var bo = this.TryGetValue(name, out b);
                if (!bo)
                {
                    this.Put(name, value);//放入条件
                }
            });
        }

        public void GetRecord(List<string> time = null, string type = null, Record head = null)
        {
            var er = new Record(this);
            this.Clear();
            GetRecord(er, time, type, head);
        }

        #endregion

        #region 添加/更改参数

        /// <summary>
        /// 放入键值具体方法
        /// </summary>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        public Record Put(string key, object value)
        {
            if (this.Keys.Contains(key)) this[key] = value;
            else this.Add(key, value);
            return this;
        }

        /// <summary>
        /// 放入键值
        /// </summary>
        /// <param name="rec"></param>
        /// <returns></returns>
        public Record Put(Record rec)
        {
            if (rec.IsBlank()) return this;
            foreach (var x in rec.Keys)
            {
                Put(x, rec[x]);
            }
            return this;
        }

        /// <summary>
        /// 放入KeyValuePair
        /// </summary>
        /// <param name="kkk"></param>
        public Record Put(KeyValuePair<string, object> kkk)
        {
            if (!kkk.IsBlank()) this.Put(kkk.Key, kkk.Value);
            return this;
        }

        /// <summary>
        /// 更改键
        /// </summary>
        /// <param name="oldkey">原键</param>
        /// <param name="newkey">新键</param>
        public void ReName(string oldkey, string newkey)
        {
            if (oldkey.IsBlank() || newkey.IsBlank()) return;
            var ty = GetPair(oldkey);
            if (ty.IsBlank()) return;
            var index = GetIndex(ty);
            this[index] = new KeyValuePair<string, object>(newkey, ty.Value);
        }

        #endregion

        #region 按类型获取参数

        /// <summary>
        /// 按照下标键获取键值对
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public KeyValuePair<string, object> Get(int index)
        {
            if (this.IsBlank()) return new KeyValuePair<string, object>();
            var tr = this.ToList();
            if (tr.Count > index) return this[index];
            return new KeyValuePair<string, object>();
        }

        /// <summary>
        /// 按照下标键获取键值对
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public int Get(KeyValuePair<string, object> kkk)
        {
            if (this.IsBlank() || kkk.IsBlank()) return -1;
            var tr = this.ToList();
            return tr.IndexOf(kkk);
        }

        /// <summary>
        /// 按照键获取下标
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public int GetIndex(string key)
        {
            if (this.IsBlank() || key.IsBlank()) return -1;
            var t = this.ToList();
            var t1 = t.Find(x => x.Key == key);
            if (t1.IsBlank()) return -1;
            return t.IndexOf(t1);
        }

        /// <summary>
        /// 按照键获取下标
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public KeyValuePair<string, object> GetPair(string key)
        {
            if (this.IsBlank() || key.IsBlank()) return new KeyValuePair<string, object>();
            var t = this.ToList();
            var t1 = t.Find(x => x.Key == key);
            if (t1.IsBlank()) return new KeyValuePair<string, object>();
            return t1;
        }

        /// <summary>
        /// 按照键值对获取下标
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public int GetIndex(KeyValuePair<string, object> kkk)
        {
            if (this.IsBlank() || kkk.IsBlank()) return -1;
            var t = this.ToList();
            return t.IndexOf(kkk);
        }

        /// <summary>
        /// 按照键获取值
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public string GetString(string key)
        {
            if (this.IsBlank() || key.IsBlank()) return "";
            return this.TryGetValue(key, out object ss) ? ss.ToJson() : "";
        }

        /// <summary>
        /// 按照键获取值
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public object GetObject(string key)
        {
            if (this.IsBlank() || key.IsBlank()) return "";
            return this.TryGetValue(key, out object ss) ? ss : "";
        }

        /// <summary>
        /// Record 转为 Dictionary
        /// </summary>
        /// <returns></returns>
        public Dictionary<string, object> GetDic()
        {
            return this.ObjectTo<Dictionary<string, object>>();
        }

        /// <summary>
        /// 按照键获取值
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public int? GetInt(string key)
        {
            return Get<int>(key);
        }

        /// <summary>
        /// 按照键获取值
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public T Get<T>(string key)
        {
            var tr = GetString(key);
            return tr.FromObject<T>();
        }

        /// <summary>
        /// 过滤键
        /// </summary>
        /// <param name="reg">正则对象</param>
        public Record Filter(Regex reg)
        {
            if (reg == null) return this;
            var record = new Record();
            this.ForEach(x =>
            {
                if (!reg.IsMatch(x.Key)) record.Put(x.Key, x.Value);
            });
            return record;
        }

        #endregion

        #region 获取sql操作字符串

        /// <summary>
        /// where条件
        /// </summary>
        /// <returns></returns>
        private string GetWhere(string con, int count = 0)
        {
            string msg = "";
            if (this.IsBlank()) return msg;
            List<string> li = new List<string>();
            List<string> li1 = new List<string>();
            List<string> li2 = new List<string>();
            if (this.Count > 0)
            {
                foreach (var val in this.ToList())
                {
                    GetOr(val, li, li1, li2);
                }
            }
            if (li.Count > 0) msg += $" {con} ({string.Join(" and ", li)}) ";
            if (!con.Equals("having")) return msg;
            if (li1.Count > 0) msg += $" {string.Join(" ", li1)} ";
            if (count > 0) return msg;
            if (li2.Count > 0) msg += $" {string.Join(" ", li2)} ";
            return msg;
        }

        private void GetOr(KeyValuePair<string, object> kkk, List<string> li, List<string> li1, List<string> li2, int st = 0)
        {
            switch (kkk.Value)
            {
                case Record rec:
                    var lix = new List<string>();
                    foreach (var y in rec.ToList())
                    {
                        GetOr(y, lix, li1, li2, st++);
                    }
                    if (lix.Count > 0)
                    {
                        if (kkk.Key.StartsWith("#and"))
                            li.Add($" ({string.Join(" and ", lix)}) ");
                        else
                            li.Add($" ({string.Join(" or ", lix)}) ");
                    }
                    break;
                default:
                    if (kkk.Key.Contains(":"))
                    {
                        var t = kkk.Key.Split_None(":");
                        if (t[1].Trim().Equals("*")) li.Add($" {kkk.Value.ToJson().Trim()} ");
                        else if (t[1].Trim().Equals("in")) li.Add($" {t[0].Trim()} in ('{kkk.Value.ToJson().Trim().Replace(",", "','")}') ");
                        else if (t[1].Trim().Equals("like")) li.Add($" {t[0].Trim()} like '%{kkk.Value.ToJson().Trim()}%' ");
                        else if (t[1].Trim().Equals("like%")) li.Add($" {t[0].Trim()} like '{kkk.Value.ToJson().Trim()}%' ");
                        else if (t[1].Trim().Equals("%like")) li.Add($" {t[0].Trim()} like '%{kkk.Value.ToJson().Trim()}' ");
                        else if (t[0].Trim().Contains("*")) li.Add($" {t[0].Substring(1).Trim()} {t[1].Trim()} {kkk.Value.ToJson().Trim()} ");
                        else li.Add($" {t[0].Trim()} {t[1].Trim()} '{kkk.Value.ToJson().Trim()}' ");
                    }
                    else if (kkk.Key.Equals("#-") && li2.Count == 0 && st == 0)
                    {
                        li2.Add($" order by {kkk.Value.ToJson().Trim()} desc ");
                    }
                    else if (kkk.Key.Equals("#+") && li2.Count == 0 && st == 0)
                    {
                        li2.Add($" order by {kkk.Value.ToJson().Trim()} asc ");
                    }
                    else if (kkk.Key.StartsWith("##") && li1.Count == 0 && st == 0)
                    {
                        li1.Add($" group by {kkk.Value.ToJson().Trim()} ");
                    }
                    else if (kkk.Key.StartsWith("**"))
                    {
                        li.Add($" {kkk.Value.ToJson().Trim()} ");
                    }
                    else if (kkk.Key.StartsWith("*"))
                    {
                        li2.Add($" {kkk.Key.Substring(1)} = {kkk.Value.ToJson().Trim()} ");
                    }
                    else li.Add($" {kkk.Key.Trim()} = '{kkk.Value.ToJson().Trim()}' ");
                    break;
            }
        }

        /// <summary>
        /// 修改条件
        /// </summary>
        /// <returns></returns>
        private string GetUpdate()
        {
            if (this.IsBlank()) return "";
            List<string> li = new List<string>();
            foreach (var x in this.ToList())
            {
                if (x.Value == null) li.Add($"{x.Key.Trim()} is null");
                else li.Add($"{x.Key.Trim()} = '{x.Value.ToJson().Trim()}'");
            }
            return li.Join(",");
        }

        /// <summary>
        /// 新增条件
        /// </summary>
        /// <returns></returns>
        private (string key, string value) GetInsert()
        {
            if (this.IsBlank()) return ("", "");
            var li = new List<string>();
            var li1 = new List<string>();
            foreach (var x in this.ToList())
            {
                li.Add(x.Key.Trim());
                if (x.Value == null) li1.Add("null");
                else li1.Add($"'{x.Value.ToJson().Trim()}'");
            }
            return (li.Join(","), li1.Join(","));
        }

        /// <summary>
        /// 获取url地址参数
        /// </summary>
        /// <returns></returns>
        private string GetUrlParam()
        {
            if (this.IsBlank()) return "";
            List<string> li = new List<string>();
            foreach (var x in this.ToList())
            {
                li.Add($"{x.Key.Trim()}={x.Value.ToJson().Trim()}");
            }
            return $"?{string.Join("&", li)}";
        }

        #endregion

    }
}