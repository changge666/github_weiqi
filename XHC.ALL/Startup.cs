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
        /// ʹ�ô˷�����������ӷ���
        /// 
        ///�����м��˳��
        ///1.�쳣/������
        ///2.HTTP �ϸ��䰲ȫЭ��
        ///3.HTTPS �ض���
        ///4.��̬�ļ�������
        ///5.Cookie ����ʵʩ
        ///6.�����֤
        ///7.�Ự
        ///8.MVC
        /// </summary>
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = context => false;//ɾ���ԷǱ�Ҫcookie��ͬ���� ��Ϊfalse
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });
            services.AddMvc(options =>
            {
                options.Filters.Add<ActionFilter>(); // ��ӳ�����������
            }).AddControllersAsServices();
            services.AddSession(options =>
            {
                options.Cookie.Name = ".Finance.Session";
                options.IdleTimeout = TimeSpan.FromMinutes(20);//����session�Ĺ���ʱ��
                options.Cookie.HttpOnly = true;//���������������ͨ��js��ø�cookie��ֵ
            });
            services.AddRouting();

            // Ϊ��.net core �����»�ȡrequest.current
            StaticHttpContextExtensions.AddHttpContextAccessor(services);
            services.AddDirectoryBrowser();
            // If using Kestrel:
            services.Configure<KestrelServerOptions>(options =>
            {
                options.AllowSynchronousIO = true;
            });
            //�����ļ���С����
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
            var provider = new FileExtensionContentTypeProvider();//�ṩ�ļ���չ����MIME����֮���ӳ�䡣
            provider.Mappings.Add(".log", "text/plain;charset=utf-8");//���ĩβΪ.log���ļ�ӳ��

            //������̬�ļ���
            //var uu = Path.Combine(Directory.GetCurrentDirectory(), "Log");//���ز��� F:\ConsoleProject\NewFinance\Tmc.All\Tmc.Finance.Service\Log
            var uu = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Log");//���ز��� F:\ConsoleProject\NewFinance\Tmc.All\Tmc.Finance.Service\bin\Debug\netcoreapp3.1\Log

            if (!Directory.Exists(uu)) Directory.CreateDirectory(uu);//ϵͳ��logĿ¼
            app.UseHttpsRedirection();//����HTTPS�ض����м��, �����Ϳ��԰����е�HTTP����ת��ΪHTTPS.
            app.UseAuthentication();//��Ȩ�м��
            app.UseStaticHttpContext();//��Ȩ�м��
            app.UseSession();//ʹ��session
            app.UseWebSockets();
            app.UseMiddleware<ChatWebSocketMiddleware>();

            #region �����Ŀ¼����

            app.UseStaticFiles();//Ĭ�ϼ���wwwroot�µľ�̬�ļ�

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(uu),//���ڶ�λ��Դ���ļ�ϵͳ
                RequestPath = "/Log",//��������ҳ������ĵ�ַ
                ContentTypeProvider = provider //���ڽ��ļ�ӳ�䵽��������
            });
            app.UseDirectoryBrowser(new DirectoryBrowserOptions
            {
                FileProvider = new PhysicalFileProvider(uu),//���ڶ�λ��Դ���ļ�λ��
                RequestPath = "/Log",//��������ҳ������ĵ�ַ
                Formatter = new ListDirectoryFormatter()//��д�������Ŀ¼����
            });

            #endregion

            app.UseExceptionHandler(builder => builder.Run(async context => await ErrorEvent(context)));
            app.UseRouting();//ʹ��·�� �����ã����ñ���
            //����·��
            app.UseEndpoints(endpoints =>
            {
                //Լ��·�ɣ���Ҫ�� ConfigureServices ��������ǰע�� mvc ����
                endpoints.MapControllerRoute(
                    name: "default"
                    , pattern: "{controller}/{action}/{id?}"
                //, defaults: new { controller = "ReportForm", action = "FinancialData" }//mvc������ʼҳ
                );
                //����·��
                //endpoints.MapControllers();

                //����·��
                //endpoints.MapAreaControllerRoute(
                //    name: "area",
                //    areaName: "area",
                //    pattern: "{area:exists}/{controller}/{action}/{id?}"
                //);
            });

            //html������ʼҳ
            FileServerOptions fileServerOptions = new FileServerOptions();
            fileServerOptions.DefaultFilesOptions.DefaultFileNames.Clear();
            fileServerOptions.DefaultFilesOptions.DefaultFileNames.Add(item: "/html/Home/login.html");
            app.UseFileServer(fileServerOptions);//�ںϾ�̬�ļ���Ŀ¼�ṹ
        }

        /// <summary>
        ///  ȫ���쳣��ȡ����
        /// </summary>
        /// <param name="context">��ǰ������Ϣ</param>
        /// <returns></returns>
        public Task ErrorEvent(HttpContext context)
        {
            var feature = context.Features.Get<IExceptionHandlerFeature>();
            var error = feature?.Error;
            //Logs.Write(error?.Message + Environment.NewLine + error?.StackTrace, "Global\\Error");
            return context.Response.WriteAsync(new ReResult(444, "ϵͳδ֪�쳣������ϵ����Ա").ToString(), Encoding.GetEncoding("GBK"));
        }

    }
}
