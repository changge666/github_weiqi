using XHC.COM.Extend;
using XHC.COM.Help;
using XHC.COM.Model;
using XHC.COM.Service;

namespace XHC.COM.Business
{
    public class LoginDao : ILoginService
    {
        private ReResult re { get; set; }
        private string user = LoginCurrent.user;

        public LoginDao()
        {
            re = new ReResult();
        }

        /// <summary>
        /// 登录
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public ReResult to_Login(string data)
        {
            var rec = new Record(data);
            if (rec.GetString("user_name").IsBlank())
            {
                re.Code = 500;
                re.Message = "账号未输入";
            }
            else if (rec.GetString("user_pass").IsBlank())
            {
                re.Code = 500;
                re.Message = "密码未输入";
            }
            else if (rec.GetString("pic").IsBlank())
            {
                re.Code = 500;
                re.Message = "验证码未输入";
            }
            else if (rec.GetString("pic1").IsBlank())
            {
                re.Code = 500;
                re.Message = "验证码已过时，请刷新";
            }
            else if (!rec.GetString("pic").Equals(rec.GetString("pic1")))
            {
                re.Code = 500;
                re.Message = "验证码错误";
            }
            else if (rec.GetString("user_name").IsBlank() || rec.GetString("user_pass").IsBlank())
            {
                re.Code = 500;
                re.Message = "登陆信息不全";
            }
            else
            {
                rec["password"] = MD5Helper.GenerateMD5(rec.GetString("user_pass"));
                rec.Remove("pic");
                rec.Remove("pic1");
                var t = QueryAction.GetRecord("user_table", rec);
                if (t.IsBlank())
                {
                    re.Code = 500;
                    re.Message = "登陆信息错误";
                }
                else
                {
                    re.Message = LoginCurrent.Login(t).token;
                }
            }
            return re;
        }

        /// <summary>
        /// 获取验证图片
        /// </summary>
        /// <returns></returns>
        public ReResult get_LoginPic()
        {
            YZMHelper y = new YZMHelper(RandImg.Str);
            re.Code = 200;
            re.Message = y.base64;
            re.Remark = y.text;
            return re;
        }

        /// <summary>
        /// 获取验证图片
        /// </summary>
        /// <returns></returns>
        public ReResult Is_Login()
        {
            if (!LoginCurrent.is_login)
            {
                re.setCode(400, "未登录或登陆超时");
            }
            return re.setMessage(user);
        }
    }
}
