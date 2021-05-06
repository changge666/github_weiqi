using System;
using System.Collections.Generic;
using System.Text;
using XHC.COM.Extend;
using XHC.COM.Model;

namespace XHC.COM.Help
{
    public class QueryAction
    {
        /// <summary>
        /// 获取mysql帮助类
        /// </summary>
        /// <returns></returns>
        private static MySqlHelper getMysql()
        {
            return new MySqlHelper(getContion());
        }

        /// <summary>
        /// 设置连接
        /// </summary>
        /// <param name="contion"></param>
        public void setContion(string contion)
        {
            var hh = Configs.Current.Request.Headers;
            if (hh.ContainsKey("databaseContion"))
            {
                if (!contion.IsBlank())
                {
                    hh["databaseContion"] = contion;
                }
            }
            else
            {
                if (!contion.IsBlank())
                {
                    hh["databaseContion"] = contion;
                }
            }
        }


        /// <summary>
        /// 获取默认连接
        /// </summary>
        /// <returns></returns>
        public static string getContion()
        {
            var hh = Configs.Current.Request.Headers.GetString("databaseContion");
            if (hh.IsBlank())
            {
                return "defaultDatabase";
            }
            return hh;
        }

        /// <summary>
        /// 查询全部数据
        /// </summary>
        /// <param name="tablename"></param>
        /// <param name="where"></param>
        /// <param name="columns"></param>
        /// <param name="having"></param>
        /// <param name="tab"></param>
        /// <returns></returns>
        public static List<Record> GetData(string tablename, Record where, string columns = null, Record having = null, List<Record> tab = null)
        {
            var con = getMysql();
            return con.GetData(tablename, where, columns, having, tab);
        }

        /// <summary>
        /// 查询全部数据
        /// </summary>
        /// <param name="tablename"></param>
        /// <param name="where"></param>
        /// <param name="columns"></param>
        /// <param name="having"></param>
        /// <param name="tab"></param>
        /// <returns></returns>
        public static PageRecord GetPageData(string tablename, Record where, int page, int limit, string columns = null, Record having = null, List<Record> tab = null)
        {
            var con = getMysql();
            return con.GetPageData(tablename, where, page, limit, columns, having, tab);
        }

        /// <summary>
        /// 查询全部数据
        /// </summary>
        /// <param name="tablename"></param>
        /// <param name="where"></param>
        /// <param name="columns"></param>
        /// <param name="having"></param>
        /// <param name="tab"></param>
        /// <returns></returns>
        public static Record GetRecord(string tablename, Record where, string columns = null, Record having = null, List<Record> tab = null)
        {
            var con = getMysql();
            return con.GetRecord(tablename, where, columns, having, tab);
        }

        /// <summary>
        /// 新增方法
        /// </summary>
        /// <param name="tablename"></param>
        /// <param name="rec"></param>
        /// <returns></returns>
        public static ReResult Insert(string tablename, Record rec)
        {
            var con = getMysql();
            return con.Insert(tablename, rec);
        }

        /// <summary>
        /// 修改方法
        /// </summary>
        /// <param name="tablename"></param>
        /// <param name="rec"></param>
        /// <returns></returns>
        public static ReResult Update(string tablename, Record rec, Record where)
        {
            var con = getMysql();
            return con.Update(tablename, rec, where);
        }

        /// <summary>
        /// 删除方法
        /// </summary>
        /// <param name="tablename"></param>
        /// <param name="rec"></param>
        /// <returns></returns>
        public static ReResult Delete(string tablename, Record where, Record rec = null)
        {
            var con = getMysql();
            return con.Delete(tablename, where, rec);
        }

        /// 删除方法
        /// </summary>
        /// <param name="tablename"></param>
        /// <param name="rec"></param>
        /// <returns></returns>
        public static ReResult Clear(string tablename)
        {
            var con = getMysql();
            return con.Delete(tablename);
        }

        /// <summary>
        /// 查询全部数据
        /// </summary>
        /// <param name="tablename"></param>
        /// <param name="where"></param>
        /// <param name="columns"></param>
        /// <param name="having"></param>
        /// <param name="tab"></param>
        /// <returns></returns>
        public static List<T> GetValues<T>(string tablename, Record where, string columns = null, Record having = null, List<Record> tab = null)
        {
            var con = getMysql();
            return con.GetValues<T>(tablename, where, columns, having, tab);
        }

        /// <summary>
        /// 查询全部数据
        /// </summary>
        /// <param name="tablename"></param>
        /// <param name="where"></param>
        /// <param name="columns"></param>
        /// <param name="having"></param>
        /// <param name="tab"></param>
        /// <returns></returns>
        public static T GetValue<T>(string tablename, Record where, string columns = null, Record having = null, List<Record> tab = null)
        {
            var con = getMysql();
            return con.GetValue<T>(tablename, where, columns, having, tab);
        }
    }
}
