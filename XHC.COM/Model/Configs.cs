using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using XHC.COM.Extend;

namespace XHC.COM.Model
{
    /// <summary>
    /// 静态数据
    /// </summary>
    public static class Configs
    {
        /// <summary>
        /// 获取Json配置文件数据
        /// </summary>
        public static Record Config { get; set; } = new Record();

        /// <summary>
        /// 程序物理路径 指向wwwroot前端文件夹
        /// </summary>
        public static string wwwrootpath { get; set; }

        /// <summary>
        /// 网络根地址
        /// </summary>
        public static string webpath => Current.Request.Scheme.ToString() + "://" + Current.Request.Host.ToString();

        /// <summary>
        /// 锁
        /// </summary>
        private static readonly object locker = new object();

        /// <summary>
        /// Session
        /// </summary>
        public static HttpContext Current => _accessor.HttpContext;

        /// <summary>
        /// 
        /// </summary>
        private static IHttpContextAccessor _accessor;

        internal static void Configure(IHttpContextAccessor accessor)
        {
            _accessor = accessor;
        }

        #region 获取json存储数据

        /// <summary>
        /// 获取json存储数据
        /// </summary>
        /// <param name="name"></param>
        /// <param name="filename"></param>
        /// <param name="genpath"></param>
        /// <returns></returns>
        public static string getManger(string name, string filename = "config", string genpath = "App_Data")
        {
            var value = "";
            try
            {
                if (name.IsBlank()) return value;
                genpath = genpath.Replace("/", "\\");
                filename = filename.Replace("/", "").Replace("\\", "");
                genpath = genpath.StartsWith("\\") ? genpath.Substring(1) : genpath;
                genpath = genpath.EndsWith("\\") ? genpath.Substring(0, genpath.Length - 1) : genpath;
                var path = Path.GetDirectoryName(Configs.wwwrootpath) + $"\\{genpath}\\{filename}.json";
                var ff = Configs.Config;
                if (!ff.IsBlank() && ff.ContainsKey(path) && !ff.GetString(path).IsBlank()) value = getMangerPri(name, ff.Get<Record>(path));
                else
                {
                    lock (locker)
                    {
                        if (!ff.IsBlank() && ff.ContainsKey(path) && !ff.GetString(path).IsBlank()) value = getMangerPri(name, ff.Get<Record>(path));
                        else
                        {
                            var strs = name.Split(":")?.ToList().FindAll(x => !x.IsBlank())?.ToList() ?? new List<string>();
                            if (strs.Count == 0) return value;
                            var rr = path.FileFromObject<Record>() ?? new Record();
                            if (ff.ContainsKey(path)) Configs.Config[path] = rr;
                            else Configs.Config.Put(path, rr);
                            if (!rr.IsBlank()) value = getMangerPri(name, rr);
                        }
                    }
                }
                return value;
            }
            catch 
            {
                return value;
            }
            finally { }
        }

        /// <summary>
        /// 循环获取展示字段
        /// </summary>
        /// <param name="name"></param>
        /// <param name="rx"></param>
        /// <returns></returns>
        private static string getMangerPri(string name, Record rx)
        {
            string value = "";
            if (!rx.IsBlank())
            {
                var rr = rx.Clone();
                if (!rr.IsBlank())
                {
                    var strs = (name ?? "").Split(":").ToList();
                    for (var i = 0; i < strs.Count; i++)
                    {
                        var r1 = rr.GetString(strs[i]);
                        if (i == strs.Count - 1) value = r1;
                        else rr = r1.ToRecord();
                    }
                }
            }
            return value;
        }

        #endregion
    }

    /// <summary>
    /// 向Configs中注入HttpContext
    /// </summary>
    public static class StaticHttpContextExtensions
    {
        public static void AddHttpContextAccessor(this IServiceCollection services)
        {
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        }

        public static IApplicationBuilder UseStaticHttpContext(this IApplicationBuilder app)
        {
            var httpContextAccessor = app.ApplicationServices.GetRequiredService<IHttpContextAccessor>();
            Configs.Configure(httpContextAccessor);
            return app;
        }
    }
}
