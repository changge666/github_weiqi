using Microsoft.AspNetCore.Mvc;
using XHC.COM.Model;
using XHC.COM.Service;

namespace XHC.ALL.Controllers
{
    public class LoginController : Controller
    {
        public ILoginService login { get; set; }

        /// <summary>
        /// 登录
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public ReResult to_Login(string data)
        {
            return login.to_Login(data);
        }

        /// <summary>
        /// 退出登录
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public ReResult get_LoginPic()
        {
            return login.get_LoginPic();
        }

        /// <summary>
        /// 验证登录
        /// </summary>
        /// <returns></returns>
        public ReResult Is_Login() {
            return login.Is_Login();
        }
    }
}
