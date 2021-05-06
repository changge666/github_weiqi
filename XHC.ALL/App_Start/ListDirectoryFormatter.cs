using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using XHC.COM.Heleper;

namespace XHC.ALL.App_Start
{
    /// <summary>
    /// 自定义浏览目录结构
    /// </summary>
    public class ListDirectoryFormatter : IDirectoryFormatter
    {
        public async Task GenerateContentAsync(HttpContext context, IEnumerable<IFileInfo> contents)
        {
            context.Response.ContentType = "text/html;charset=utf-8";
            await context.Response.WriteAsync("<html><head><title>Index</title>");
            await context.Response.WriteAsync("<style> div.ff {  width: 600px;  } div { height: 30px; display:flex; align-items: center; } div.aa { flex:5; } div.bb { flex:2.5; } div.cc { flex:2.5; }</style>");
            await context.Response.WriteAsync("<body><div class='ff'>");
            await context.Response.WriteAsync($"<div class='aa'>文件名</div>");
            await context.Response.WriteAsync($"<div class='bb'>文件大小</div>");
            await context.Response.WriteAsync($"<div class='cc'>时间</div>");
            await context.Response.WriteAsync($"</div>");
            IOHelper ge = new IOHelper();
            var con = contents?.OrderByDescending(x => x.LastModified).ToList() ?? new List<IFileInfo>();
            foreach (var file in con)
            {
                string href = $"{context.Request.Path.Value.TrimEnd('/')}/{file.Name}";
                await context.Response.WriteAsync($"<div class='ff'>");
                await context.Response.WriteAsync($"<div class='aa'><a href='{href}'>{file.Name}</a></div>");
                await context.Response.WriteAsync($"<div class='bb'>{ge.CountSize(file.Length)}</div>");
                await context.Response.WriteAsync($"<div class='cc'>{file.LastModified.LocalDateTime}</div>");
                await context.Response.WriteAsync($"</div>");
            }
            await context.Response.WriteAsync("</body></html>");
        }

    }
}
