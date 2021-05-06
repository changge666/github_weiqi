using System.Linq;
using System.Reflection;
using Autofac;
using Microsoft.AspNetCore.Mvc;

namespace XHC.ALL.App_Start
{
    public class DefaultModule : Autofac.Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            //var basePath = Microsoft.DotNet.PlatformAbstractions.ApplicationEnvironment.ApplicationBasePath;
            //var ServicesDllFile = Path.Combine(basePath, "Tmc.Common.dll");//获取注入项目绝对路径
            var assemblysServices = Assembly.Load("XHC.COM");//直接采用加载文件的方法
            builder.RegisterAssemblyTypes(assemblysServices)//注册程序集中的所有类型
                .Where(t => t.FullName.StartsWith("XHC.COM.Business"))
                //.AsSelf()//指定来自已扫描程序集的类型将其自己的具体类型作为服务提供。
                .AsImplementedInterfaces()//指定将类型注册为提供其所有实现的接口。
                .PropertiesAutowired()//配置组件，以便在容器中注册其类型的任何属性都将连接到相应服务的实例。
                .InstancePerLifetimeScope();//即为每一个依赖或调用创建一个单一的共享的实例

            var controllerBase = typeof(ControllerBase);
            builder.RegisterAssemblyTypes(typeof(Program).Assembly)//注册程序集中的所有类型
                 .Where(type => controllerBase.IsAssignableFrom(type))
                  .PropertiesAutowired();//配置组件，以便在容器中注册其类型的任何属性都将连接到相应服务的实例。

        }
    }
}
