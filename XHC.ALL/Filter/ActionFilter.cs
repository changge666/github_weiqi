using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Threading.Tasks;
using XHC.COM.Extend;
using XHC.COM.Model;

namespace XHC.ALL.Filter
{
    public class ActionFilter : IActionFilter
    {

        /// <summary>
        ///  action前执行校验
        /// </summary>
        /// <param name="filterContext"></param>
        void IActionFilter.OnActionExecuting(ActionExecutingContext filterContext)
        {
            var gcb = new ReResult();
            try
            {
                ControllerActionDescriptor actioninfo = (ControllerActionDescriptor)filterContext.ActionDescriptor;
                HttpRequest requestinfo = filterContext.HttpContext.Request;
                //logger.SetRequest(ArgumentMapping.GetRequestParams());
                //logger.Type = "Control";
                //logger.Url = requestinfo.GetDisplayUrl();
                //logger.Path = actioninfo.ControllerName + "/" + actioninfo.ActionName;
                //logger.Method = requestinfo.Method;
                //logger.RequestMark = requestinfo.Headers.ContainsKey("_ladder_client_mark_") ? requestinfo.Headers["_ladder_client_mark_"].ToString() : Core.GenUuid();
                //filterContext.HttpContext.Items["__requestmark__"] = logger.RequestMark;
                //filterContext.HttpContext.Items["___loggerforrequest____"] = logger;
                //Logs.Write(logger, LogOption.Request);

                //获取当前请求controller中方法的特性
                var permission = actioninfo.ControllerTypeInfo.GetCustomAttribute<LoginAttribute>();
                //验证当前请求action是否需要验证登录 是的话 验证是否登录 未登陆的话进入执行方法
                if (!permission.IsBlank())
                {
                    if (!permission.is_login)
                    {
                        //返回固定状态 登陆失效
                        filterContext.Result = new ValidErrorResult(new { code = "401", msg = "未登录或登陆超时" });
                        //状态码返回401，身份未验证
                        filterContext.HttpContext.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    }
                }
                else
                {
                    permission = actioninfo.MethodInfo.GetCustomAttribute<LoginAttribute>();
                    //验证当前请求action是否需要验证登录 是的话 验证是否登录 未登陆的话进入执行方法
                    if (!permission.IsBlank() && !permission.is_login)
                    {
                        //返回固定状态 登陆失效
                        filterContext.Result = new ValidErrorResult(new { code = "401", msg = "未登录或登陆超时" });
                        //状态码返回401，身份未验证
                        filterContext.HttpContext.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    }
                }
            }
            catch (Exception e)
            {
                // 记录日志
               // Logs.WriteLine("FilterError", $"{logger.RequestMark}----拦截异常", e.Message);
                gcb.Message = "系统未知异常，请联系管理员";
                // 返回结果
                filterContext.Result = new ValidErrorResult(new ReResult(500, e.Message).setData(e.StackTrace));
                filterContext.HttpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            }
        }

        /// <summary>
        ///  action后执行方法
        /// </summary>
        /// <param name="filterContext"></param>
        void IActionFilter.OnActionExecuted(ActionExecutedContext filterContext)
        {
            //var logger = (LogFoRequest)filterContext.HttpContext.Items["___loggerforrequest____"];
            //logger.SetEnd();
            //Logs.Write(logger, LogOption.Request);
        }

    }
}
