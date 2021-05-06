using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using XHC.ALL.Models;
using XHC.COM.Model;

namespace XHC.ALL.Controllers
{
    public class HomeController : Controller
    {

        /// <summary>
        /// 获取当前缓存配置
        /// </summary>
        /// <returns></returns>
        public string GetConfig()
        {
            return new Record("Config", Configs.Config).Put("wwwrootpath", Configs.wwwrootpath).ToString();
        }

        /// <summary>
        /// 清除缓存配置
        /// </summary>
        /// <returns></returns>
        public JsonResult ClearConfig()
        {
            Configs.Config.Clear();
            return Json(new { code = 200, msg = "清理完成" });
        }
    }
}
