using System;
using XHC.COM.Model;

namespace XHC.COM.Extend
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = false)]
    public class LoginAttribute : Attribute
    {
        public bool is_login => LoginCurrent.is_login;
    }
}
