using System;
using System.Collections.Generic;
using System.Text;
using XHC.COM.Model;

namespace XHC.COM.Service
{
    public interface ILoginService
    {
        /// <summary>
        /// 登录
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public ReResult to_Login(string data);

        /// <summary>
        /// 获取图片验证码
        /// </summary>
        /// <returns></returns>
        public ReResult get_LoginPic();

        /// <summary>
        /// 获取验证图片
        /// </summary>
        /// <returns></returns>
        public ReResult Is_Login();
    }
}
