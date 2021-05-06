using System.Collections.Generic;
using System.Linq;
using System.Text;
using XHC.COM.Model;
using XHC.COM.Extend;
using MySql.Data.MySqlClient;
using System.Data;
using System.ComponentModel;
using System;

namespace XHC.COM.Help
{

    public enum Operation
    {
        [Description("Select {0} From {1} {2} {3}")]
        Select = 0,
        [Description("Insert Into {0} {1} Values {2}")]
        Insert = 1,
        [Description("Update {0} Set {1} {2}  ")]
        Update = 2,
        [Description("Delete {0} From {1} {2}")]
        Delete = 3,
        [Description("Truncate {0}")]
        Clear = 4
    }

    public class MySqlHelper
    {

        public MySqlHelper(string database = "defaultDatabase")
        {
            this.database = database;
        }

        /// <summary>
        /// 连接对象
        /// </summary>
        private MySqlConnection conn { get; set; }

        /// <summary>
        /// 获取当前数据库连接
        /// </summary>
        public string database { get; }

        /// <summary>
        /// 数据库连接键值对
        /// </summary>
        private Record connection { get; set; }

        /// <summary>
        /// 获取当前数据库连接串
        /// </summary>
        /// <returns></returns>
        public (bool b, string con) connetStr()
        {
            var du = new StringBuilder();
            connection = Configs.getManger(database).ToRecord();
            if (connection.Count == 0) return (false, "");
            du.Append($"Server={connection.GetString("server")};");
            du.Append($"userid={connection.GetString("username")};");
            du.Append($"password={connection.GetString("password")};");
            du.Append($"Database={connection.GetString("database")};");
            du.Append($"port={connection.GetString("port")};");
            du.Append(connection.GetString("connection"));
            return (true, du.ToString());
        }

        /// <summary>
        /// 获取mysql链接
        /// </summary>
        /// <returns></returns>
        private (int code, string msg) Connection()
        {
            //异常检测
            try
            {
                if (!conn.IsBlank() && conn.State == ConnectionState.Open)
                    return (200, "");
                var str = connetStr();
                if (!str.b) return (400, "获取数据库链接失败");
                conn = new MySqlConnection(str.con);
                conn.Open();
                return (200, "");
                //在这里写增删改查语句
            }
            catch (MySqlException e)
            {
                Close();
                return (400, e.Message);
            }
            finally { }
        }

        /// <summary>
        /// 关闭mysql连接
        /// </summary>
        /// <param name="conn"></param>
        private void Close()
        {
            if (conn == null) return;
            conn.Close();
        }

        #region 查询

        /// <summary>
        /// 查询全部数据
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="where">条件 包含分组 和排序  例子 条件开头为#是排序（#+ asc #- desc） 开头为##是分组 </param>
        /// <param name="columns">查询字段</param>
        /// <param name="having">分组后条件</param>
        /// <param name="tab">多表联查时 字段较多时 将各表字段用别名区分开  例子 键：demo.test(数据库.表)  值:tt（数据表别名）</param>
        /// <returns></returns>
        public List<Record> GetData(string tablename, Record where, string columns, Record having = null, List<Record> tab = null)
        {
            return GetData(tablename, where, columns.IsBlank() ? null : columns.Splits(",").ToList(), having, tab);
        }

        /// <summary>
        /// 分页查询数据
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="where">条件 包含分组 和排序  例子 条件开头为#是排序（#+ asc #- desc） 开头为##是分组 </param>
        /// <param name="columns">查询字段</param>
        /// <param name="having">分组后条件</param>
        /// <param name="tab">多表联查时 字段较多时 将各表字段用别名区分开  例子 键：demo.test(数据库.表)  值:tt（数据表别名）</param>
        /// <returns></returns>
        public PageRecord GetPageData(string tablename, Record where, int page, int limit, string columns, Record having = null, List<Record> tab = null)
        {
            return GetPageData(tablename, where, new PageRecord(page, limit), columns.IsBlank() ? null : columns.Splits(",").ToList(), having, tab);
        }

        /// <summary>
        /// 查询全部数据
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="where">条件 包含分组 和排序  例子 条件开头为#是排序（#+ asc #- desc） 开头为##是分组 </param>
        /// <param name="columns">查询字段</param>
        /// <param name="having">分组后条件</param>
        /// <param name="tab">多表联查时 字段较多时 将各表字段用别名区分开  例子 键：demo.test(数据库.表)  值:tt（数据表别名）</param>
        /// <returns></returns>
        public List<T> GetValues<T>(string tablename, Record where, string columns, Record having = null, List<Record> tab = null)
        {
            return GetValues<T>(tablename, where, columns.IsBlank() ? null : columns.Splits(",").ToList(), having, tab);
        }

        /// <summary>
        /// 查询全部数据
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="where">条件 包含分组 和排序  例子 条件开头为#是排序（#+ asc #- desc） 开头为##是分组 </param>
        /// <param name="columns">查询字段</param>
        /// <param name="having">分组后条件</param>
        /// <param name="tab">多表联查时 字段较多时 将各表字段用别名区分开  例子 键：demo.test(数据库.表)  值:tt（数据表别名）</param>
        /// <returns></returns>
        private PageRecord GetPageData(string tablename, Record where, PageRecord pageRec, List<string> columns, Record having = null, List<Record> tab = null)
        {
            string column = "";
            if (!columns.IsBlank()) column = getcolumns(columns);
            else if (!tab.IsBlank()) column = getcolumns(tab);
            var con = Connection();
            column = column.IsBlank() ? "*" : column;
            try
            {
                if (con.code != 200) return pageRec;
                string cons = where?.getWhere ?? "";
                string havs = having?.getHaving ?? "";
                string sql1 = "select count(1) as num from (" + string.Format(EnumHelper.GetEnumDescription(Operation.Select), column, tablename, cons, havs) + $" limit {(pageRec.page - 1) * pageRec.limit},{pageRec.limit}";
                string sql = string.Format(EnumHelper.GetEnumDescription(Operation.Select), column, tablename, cons, havs) + ")xhc";
                var bvo = Query(sql1);
                if (!(bvo.IsBlank() || bvo[0].GetInt("num") == 0))
                {
                    pageRec.records = Query(sql);
                }
                return pageRec;
            }
            catch
            {
                return pageRec;
            }
            finally
            {
            }
        }

        /// <summary>
        /// 查询全部数据
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="where">条件 包含分组 和排序  例子 条件开头为#是排序（#+ asc #- desc） 开头为##是分组 </param>
        /// <param name="columns">查询字段</param>
        /// <param name="having">分组后条件</param>
        /// <param name="tab">多表联查时 字段较多时 将各表字段用别名区分开  例子 键：demo.test(数据库.表)  值:tt（数据表别名）</param>
        /// <returns></returns>
        private List<Record> GetData(string tablename, Record where, List<string> columns, Record having = null, List<Record> tab = null)
        {
            string column = "";
            List<Record> list = new List<Record>();
            if (!columns.IsBlank()) column = getcolumns(columns);
            else if (!tab.IsBlank()) column = getcolumns(tab);
            var con = Connection();
            column = column.IsBlank() ? "*" : column;
            try
            {
                if (con.code != 200) return list;
                string cons = where?.getWhere ?? "";
                string havs = having?.getHaving ?? "";
                string sql = string.Format(EnumHelper.GetEnumDescription(Operation.Select), column, tablename, cons, havs);
                return Query(sql);
            }
            catch
            {
                return list;
            }
            finally
            {
                Close();
            }
        }

        /// <summary>
        /// 查询全部数据
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="where">条件 包含分组 和排序  例子 条件开头为#是排序（#+ asc #- desc） 开头为##是分组 </param>
        /// <param name="columns">查询字段</param>
        /// <param name="having">分组后条件</param>
        /// <param name="tab">多表联查时 字段较多时 将各表字段用别名区分开  例子 键：demo.test(数据库.表)  值:tt（数据表别名）</param>
        /// <returns></returns>
        private List<T> GetValues<T>(string tablename, Record where, List<string> columns, Record having = null, List<Record> tab = null)
        {
            string column = "";
            if (!columns.IsBlank()) column = getcolumns(columns);
            else if (!tab.IsBlank()) column = getcolumns(tab);
            var list = new List<T>();
            var con = Connection();
            column = column.IsBlank() ? "*" : column;
            try
            {
                if (con.code != 200) return list;
                string cons = where?.getWhere ?? "";
                string havs = having?.getHaving ?? "";
                string sql = string.Format(EnumHelper.GetEnumDescription(Operation.Select), column, tablename, cons, havs);
                return QueryValues<T>(sql);
            }
            catch
            {
                return list;
            }
            finally
            {
                Close();
            }
        }

        /// <summary>
        /// 查询单条数据
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="where">条件 包含分组 和排序  例子 条件开头为#是排序（#+ asc #- desc） 开头为##是分组 </param>
        /// <param name="columns">查询字段</param>
        /// <param name="having">分组后条件</param>
        /// <param name="tab">多表联查时 字段较多时 将各表字段用别名区分开  例子 键：demo.test(数据库.表)  值:tt（数据表别名）</param>
        /// <returns></returns>
        public Record GetRecord(string tablename, Record where, string columns, Record having = null, List<Record> tab = null)
        {
            return GetData(tablename, where, columns.IsBlank() ? null : columns.Splits(",").ToList(), having, tab).FirstOrDefault();
        }

        /// <summary>
        /// 查询单条数据
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="where">条件 包含分组 和排序  例子 条件开头为#是排序（#+ asc #- desc） 开头为##是分组 </param>
        /// <param name="columns">查询字段</param>
        /// <param name="having">分组后条件</param>
        /// <param name="tab">多表联查时 字段较多时 将各表字段用别名区分开  例子 键：demo.test(数据库.表)  值:tt（数据表别名）</param>
        /// <returns></returns>
        public T GetValue<T>(string tablename, Record where, string columns, Record having = null, List<Record> tab = null)
        {
            return GetValues<T>(tablename, where, columns.IsBlank() ? null : columns.Splits(",").ToList(), having, tab).FirstOrDefault();
        }

        /// <summary>
        /// 处理要查询的字段
        /// </summary>
        /// <param name="columns"></param>
        /// <returns></returns>
        private string getcolumns(List<string> strs)
        {
            if (strs.IsBlank()) return "*";
            var rec = new List<string>();
            strs.ForEach(x =>
            {
                var t = x.Trim();
                if (t.IsBlank()) return;
                if (t.Contains("@@"))
                {
                    var strs1 = t.Splits("@@").ToList();
                    if (strs1.Count == 1)
                    {
                        rec.Add(strs1[0]);
                    }
                    else if (strs1.Count > 1)
                    {
                        rec.Add($"{strs1[0]} as '{strs1[1]}'");
                    }
                    return;
                }
                rec.Add(t);
            });
            return rec.Join(",");
        }

        /// <summary>
        /// 处理要查询的字段(多表全字段分组获取)
        /// </summary>
        /// <param name="columns"></param>
        /// <returns></returns>
        /// <summary>
        private string getcolumns(List<Record> strs)
        {
            if (strs.IsBlank()) return "*";
            List<string> ss1 = new List<string>();
            List<string> ss2 = new List<string>();
            List<string> ss3 = new List<string>();
            string ss4 = "##";
            strs.ForEach(x =>
            {
                var name = x.GetString("name").ToLower();
                var value = x.GetString("value").ToLower();
                var bb = name.Splits(",");
                ss1.Add(bb[0]);
                ss2.Add(bb[1]);
                ss4 = ss4.Replace("##", $"if(lcase(TABLE_SCHEMA) = '{bb[0]}' and lcase(TABLE_NAME) = '{bb[1]}',concat('{value}.',lcase(COLUMN_NAME),'@@{value}',lcase(COLUMN_NAME)),##)");
            });
            ss4 = ss4.Replace("##", "");
            string sql = $"Select lcase(TABLE_SCHEMA) as 'table_schemas',lcase(TABLE_NAME) as 'table_names',{ss4} as 'table_columns' from information_schema.`COLUMNS` Where local(TABLE_SCHEMA) in ('{ss1.Join("','")}') and local(TABLE_NAME) in ('{ss2.Join("','")}') order by TABLE_SCHEMA,TABLE_NAME";
            var list = Query(sql);
            if (list.IsBlank()) return "*";
            return list.Select(x => x.GetString("table_columns")).ToList().Join(",");
        }

        /// <summary>
        /// 通过sql查询
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public List<Record> Query(string sql)
        {
            List<Record> list = new List<Record>();
            var con = Connection();
            try
            {
                if (con.code != 200) return list;
                MySqlCommand cmd = new MySqlCommand(sql, conn);
                //执行ExecuteReader()返回一个MySqlDataReader对象
                MySqlDataReader reader = cmd.ExecuteReader();
                List<string> st = new List<string>();
                var u = 0;
                while (reader.Read())//初始索引是-1，执行读取下一行数据，返回值是bool
                {
                    if (reader.HasRows)
                    {
                        if (u++ == 0)
                        {
                            for (var i = 0; i < reader.FieldCount; i++)
                            {
                                st.Add(reader.GetName(i).ToLower());
                            }
                        }
                        var r = new Record();
                        foreach (var x in st)
                        {
                            r.Add(x, reader[x]?.ToString() ?? "");
                        }
                        list.Add(r);
                    }
                }
                reader.Close();
                return list;
            }
            catch
            {
                return list;
            }
            finally
            {
                Close();
            }
        }

        /// <summary>
        /// 通过sql查询
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public List<T> QueryValues<T>(string sql)
        {
            var list = new List<T>();
            var con = Connection();
            try
            {
                if (con.code != 200) return list;
                MySqlCommand cmd = new MySqlCommand(sql, conn);
                //执行ExecuteReader()返回一个MySqlDataReader对象
                MySqlDataReader reader = cmd.ExecuteReader();
                var st = "";
                var u = 0;
                while (reader.Read())//初始索引是-1，执行读取下一行数据，返回值是bool
                {
                    if (reader.HasRows)
                    {
                        if (u++ == 0)
                        {
                            st = reader.GetName(0).ToLower();
                        }
                        list.Add(reader[st].ObjectTo<T>());
                    }
                }
                reader.Close();
                return list;
            }
            catch
            {
                return list;
            }
            finally
            {
                Close();
            }
        }

        /// <summary>
        /// 通过sql查询
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public T QueryValue<T>(string sql)
        {
            return QueryValues<T>(sql).FirstOrDefault();
        }

        #endregion

        #region 新增

        /// <summary>
        /// 新增方法
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="rec">参数</param>
        /// <returns></returns>
        public ReResult Insert(string tablename, Record rec)
        {
            var re = new ReResult();
            if (rec.IsBlank()) return re.setCode(400, "未添加有效数据");
            return SaveBeans(new List<Curd>() { new Curd(tablename, rec, Operation.Insert) }, false, re);
        }

        /// <summary>
        /// 新增方法
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="rec">参数</param>
        /// <returns></returns>
        public ReResult Inserts(string tablename, List<Record> rec, bool transaction = false)
        {
            var re = new ReResult();
            if (rec.IsBlank()) return re.setCode(400, "未添加有效数据");
            var list = rec.Select(x => new Curd(tablename, x, Operation.Insert)).ToList();
            return SaveBeans(list, transaction, re);
        }

        #endregion

        #region 修改

        /// <summary>
        /// 修改方法
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="rec">参数</param>
        /// <param name="cox">条件</param>
        /// <returns></returns>
        public ReResult Update(string tablename, Record rec, Record cox)
        {
            var re = new ReResult();
            if (rec.IsBlank()) return re.setCode(400, "未添加有效数据");
            return SaveBeans(new List<Curd>() { new Curd(tablename, rec, Operation.Update, cox) }, false, re);
        }

        #endregion

        #region 删除

        /// <summary>
        /// 删除方法
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="cox">条件</param>
        /// <returns></returns>
        public ReResult Delete(string tablename, Record cox, Record rec)
        {
            var re = new ReResult();
            if (cox.IsBlank()) return re.setCode(400, "未添加有效数据");
            return SaveBeans(new List<Curd>() { new Curd(tablename, cox, Operation.Delete, rec) }, false, re);
        }

        #endregion

        #region 清表

        /// <summary>
        /// 删除方法
        /// </summary>
        /// <param name="tablename">表名</param>
        /// <param name="cox">条件</param>
        /// <returns></returns>
        public ReResult Delete(string tablename)
        {
            var re = new ReResult();
            if (tablename.IsBlank()) return re.setCode(400, "未添加有效数据");
            return SaveBeans(new List<Curd>() { new Curd(tablename, new Record(), Operation.Clear) }, false, re);
        }

        #endregion

        #region 保存

        /// <summary>
        /// 保存
        /// </summary>
        /// <param name="rec">操作值</param>
        /// <param name="transaction">是否启用事务</param>
        /// <param name="rex">返回值</param>
        /// <returns></returns>
        public ReResult SaveBeans(List<Curd> rec, bool transaction = false, ReResult rex = null)
        {
            rex = rex ?? new ReResult();
            var list = new List<Record>();
            var con = Connection();
            if (con.code != 200) return rex.setCode(con.code, con.msg);
            MySqlTransaction trans = null;
            if (transaction) trans = conn.BeginTransaction();
            try
            {
                var sqls = new List<string>();
                rec.ForEach(x =>
                {
                    if (x.op == Operation.Insert && !x.list.IsBlank())
                    {
                        sqls.AddRange(x.getSqlList());
                    }
                    else
                    {
                        var ss = x.getSql();
                        if (!ss.IsBlank()) sqls.Add(ss);
                    }
                });

                foreach (var sql in sqls)
                {
                    if (sql.IsBlank())
                    {
                        if (transaction && trans != null) trans.Rollback();
                        list.Add(new Record("success", "false").Put("message", "sql语句错误"));
                        return rex.setCode(400, "sql语句错误").setData(list);
                    }
                    MySqlCommand cmd = new MySqlCommand(sql, conn);
                    //执行ExecuteReader()返回一个MySqlDataReader对象
                    var i = cmd.ExecuteNonQuery();
                    if (i > 0)
                    {
                        list.Add(new Record("Success", "true").Put("Message", "").Put("Sql", sql));
                        continue;
                    }
                    if (transaction && trans != null) trans.Rollback();
                    list.Add(new Record("Success", "false").Put("Message", "保存操作失败").Put("Sql", sql));
                    return rex.setCode(400, "操作失败").setData(list);
                }
                if (transaction && trans != null) trans.Commit();
                return rex.setData(list);
            }
            catch (Exception ex)
            {
                if (transaction && trans != null) trans.Rollback();
                return rex.setCode(500, ex.Message).setData(list);
            }
            finally
            {
                Close();
            }
        }

        #endregion
    }

    public class Curd
    {
        //操作
        public Operation op { get; }
        //表
        public string database { get; }
        //增加或修改的值
        public Record rec { get; }
        //条件
        public Record contion { get; }
        //增加专用 多条新增
        public List<Record> list { get; }

        /// <summary>
        /// 1添加 2修改 3删除
        /// </summary>
        /// <param name="database">数据库名</param>
        /// <param name="rec">操作</param>
        /// <param name="op">类型</param>
        /// <param name="contion">条件</param>
        public Curd(string database, Record rec, Operation op, Record contion = null)
        {
            this.op = op;
            switch (op)
            {
                case Operation.Select:
                    throw new Exception("不可用于查询！");
                case Operation.Delete:
                    if (contion.IsBlank()) throw new Exception("删除条件不可为空！");
                    break;
            }
            this.database = database;
            this.rec = rec;
            this.contion = contion;
        }

        /// <summary>
        /// 添加
        /// </summary>
        /// <param name="database">数据库名</param>
        /// <param name="rec">增加专用 多条新增</param>
        public Curd(string database, List<Record> list)
        {
            this.database = database;
            this.list = list;
            this.op = Operation.Insert;
        }

        /// <summary>
        /// 获取操作语句
        /// </summary>
        /// <returns></returns>
        public string getSql()
        {
            string cons = contion?.getWhere ?? "";
            switch (op)
            {
                case Operation.Insert:
                    if (database.IsBlank() || rec.IsBlank()) return "";
                    var gg = rec.getInsert;
                    return string.Format(EnumHelper.GetEnumDescription(op), database, gg.key, gg.value, cons);
                case Operation.Update:
                    if (database.IsBlank() || rec.IsBlank() || contion.IsBlank()) return "";
                    return string.Format(EnumHelper.GetEnumDescription(op), database, rec.getUpdate, cons);
                case Operation.Delete:
                    if (database.IsBlank() || contion.IsBlank()) return "";
                    return string.Format(EnumHelper.GetEnumDescription(op), rec.IsBlank() ? "" : rec.Keys.ToList().Join(","), database, cons);
                case Operation.Clear:
                    if (database.IsBlank()) return "";
                    return string.Format(EnumHelper.GetEnumDescription(op), database);
            }
            return "";
        }

        /// <summary>
        /// 获取多条新增聚合操作语句
        /// </summary>
        /// <returns></returns>
        public List<string> getSqlList()
        {
            var t = new List<string>();
            switch (op)
            {
                case Operation.Insert:
                    if (database.IsBlank() || list.IsBlank()) return t;
                    var pp = list.GroupBy(x => x.Keys).ToList();
                    pp.ForEach(x =>
                    {
                        var tt = x.ToList();
                        var strs = tt.Select(x1 => x1.getInsert.value).ToList();
                        t.Add(string.Format(EnumHelper.GetEnumDescription(op), database, tt[0].getInsert.key, strs.Join(",")));
                    });
                    break;
            }
            return t;
        }

        public ReResult SaveBean(bool b = true)
        {
            switch (op)
            {
                case Operation.Insert:
                    return QueryAction.Insert(database, rec);
                case Operation.Update:
                    return QueryAction.Update(database, rec, contion);
                case Operation.Delete:
                    return QueryAction.Delete(database, rec, contion);
                case Operation.Clear:
                    return QueryAction.Clear(database);
            }
            return new ReResult(400, "未知操作");
        }
    }
}
