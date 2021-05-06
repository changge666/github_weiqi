using Autofac;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using XHC.ALL.App_Start;
using XHC.ALL.Filter;
using XHC.COM.Model;
using XHC.COM.WebScoket;

namespace XHC.ALL
{
    public class Startup
    {

        public Startup(IConfiguration configuration, IWebHostEnvironment hostingEnvironment)
        {
            Configuration = configuration;
            Configs.wwwrootpath = hostingEnvironment.WebRootPath;
        }

        public IConfiguration Configuration { get; }

        /// <summary>
        /// 使用此方法向容器添加服务
        /// 
        ///常见中间件顺序
        ///1.异常/错误处理
        ///2.HTTP 严格传输安全协议
        ///3.HTTPS 重定向
        ///4.静态文件服务器
        ///5.Cookie 策略实施
        ///6.身份验证
        ///7.会话
        ///8.MVC
        /// </summary>
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = context => false;//删除对非必要cookie的同意检查 设为false
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });
            services.AddMvc(options =>
            {
                options.Filters.Add<ActionFilter>(); // 添加出动作过滤器
            }).AddControllersAsServices();
            services.AddSession(options =>
            {
                options.Cookie.Name = ".Finance.Session";
                options.IdleTimeout = TimeSpan.FromMinutes(20);//设置session的过期时间
                options.Cookie.HttpOnly = true;//设置在浏览器不能通过js获得该cookie的值
            });
            services.AddRouting();

            // 为在.net core 环境下获取request.current
            StaticHttpContextExtensions.AddHttpContextAccessor(services);
            services.AddDirectoryBrowser();
            // If using Kestrel:
            services.Configure<KestrelServerOptions>(options =>
            {
                options.AllowSynchronousIO = true;
            });
            //配置文件大小限制
            services.Configure<FormOptions>(options =>
            {
                options.ValueLengthLimit = int.MaxValue;
                options.MultipartBodyLengthLimit = int.MaxValue;// 60000000; 
                options.MultipartHeadersLengthLimit = int.MaxValue;
            });
        }

        public void ConfigureContainer(ContainerBuilder builder)
        {
            builder.RegisterModule<DefaultModule>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            var provider = new FileExtensionContentTypeProvider();//提供文件扩展名和MIME类型之间的映射。
            provider.Mappings.Add(".log", "text/plain;charset=utf-8");//添加末尾为.log的文件映射

            //创建静态文件夹
            //var uu = Path.Combine(Directory.GetCurrentDirectory(), "Log");//本地测试 F:\ConsoleProject\NewFinance\Tmc.All\Tmc.Finance.Service\Log
            var uu = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Log");//本地测试 F:\ConsoleProject\NewFinance\Tmc.All\Tmc.Finance.Service\bin\Debug\netcoreapp3.1\Log

            if (!Directory.Exists(uu)) Directory.CreateDirectory(uu);//系统级log目录
            app.UseHttpsRedirection();//调用HTTPS重定向中间件, 这样就可以把所有的HTTP请求转换为HTTPS.
            app.UseAuthentication();//授权中间件
            app.UseStaticHttpContext();//授权中间件
            app.UseSession();//使用session
            app.UseWebSockets();
            app.UseMiddleware<ChatWebSocketMiddleware>();

            #region 可浏览目录设置

            app.UseStaticFiles();//默认加载wwwroot下的静态文件

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(uu),//用于定位资源的文件系统
                RequestPath = "/Log",//用于在网页上请求的地址
                ContentTypeProvider = provider //用于将文件映射到内容类型
            });
            app.UseDirectoryBrowser(new DirectoryBrowserOptions
            {
                FileProvider = new PhysicalFileProvider(uu),//用于定位资源的文件位置
                RequestPath = "/Log",//用于在网页上请求的地址
                Formatter = new ListDirectoryFormatter()//重写加载浏览目录方法
            });

            #endregion

            app.UseExceptionHandler(builder => builder.Run(async context => await ErrorEvent(context)));
            app.UseRouting();//使用路由 必须用，不用报错
            //设置路由
            app.UseEndpoints(endpoints =>
            {
                //约定路由，需要在 ConfigureServices 方法中提前注入 mvc 服务。
                endpoints.MapControllerRoute(
                    name: "default"
                    , pattern: "{controller}/{action}/{id?}"
                //, defaults: new { controller = "ReportForm", action = "FinancialData" }//mvc设置起始页
                );
                //特性路由
                //endpoints.MapControllers();

                //区域路由
                //endpoints.MapAreaControllerRoute(
                //    name: "area",
                //    areaName: "area",
                //    pattern: "{area:exists}/{controller}/{action}/{id?}"
                //);
            });

            //html设置起始页
            FileServerOptions fileServerOptions = new FileServerOptions();
            fileServerOptions.DefaultFilesOptions.DefaultFileNames.Clear();
            fileServerOptions.DefaultFilesOptions.DefaultFileNames.Add(item: "/html/Home/login.html");
            app.UseFileServer(fileServerOptions);//融合静态文件、目录结构
        }

        /// <summary>
        ///  全局异常调取方法
        /// </summary>
        /// <param name="context">当前请求信息</param>
        /// <returns></returns>
        public Task ErrorEvent(HttpContext context)
        {
            var feature = context.Features.Get<IExceptionHandlerFeature>();
            var error = feature?.Error;
            //Logs.Write(error?.Message + Environment.NewLine + error?.StackTrace, "Global\\Error");
            return context.Response.WriteAsync(new ReResult(444, "系统未知异常，请联系管理员").ToString(), Encoding.GetEncoding("GBK"));
        }

    }
}
