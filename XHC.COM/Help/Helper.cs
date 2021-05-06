using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using XHC.COM.Extend;
using XHC.COM.Model;

namespace XHC.COM.Help
{
    public class Helper
    {

        //服务器wwwroot地址
        public string webrootpath => Configs.wwwrootpath;
        //网络根地址
        public string webpath => Configs.Current.Request.Scheme.ToString() + "://" + Configs.Current.Request.Host.ToString();
        //锁
        private static readonly object locker = new object();

        
    }
}
