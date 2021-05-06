using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using XHC.COM.Extend;
using XHC.COM.Model;

namespace XHC.COM.WebScoket
{
    /// <summary>
    ///SenderID发送者ID
    ///ReceiverID 接受者ID
    ///RoomID   
    ///MessageType 消息类型  
    ///Content 消息内容
    /// </summary>
    public class MsgTemplate
    {
        /// <summary>
        /// 发送者ID
        /// </summary>
        public string SenderID { get; set; }

        /// <summary>
        /// 发送者账号
        /// </summary>
        public string SenderName { get; set; }

        /// <summary>
        /// 接受者ID
        /// </summary>
        public string ReceiverID { get; set; }

        /// <summary>
        /// 接受者账号
        /// </summary>
        public string ReceiverName { get; set; }

        /// <summary>
        /// 房间ID
        /// </summary>
        public string RoomID { get; set; }

        /// <summary>
        /// 状态 0未开始 1匹配中 2开始游戏 
        /// </summary>
        public int Status { get; set; } = 0;

        /// <summary>
        /// 文字类型
        /// </summary>
        public string MessageType { get; set; } = "text";

        /// <summary>
        /// 文字
        /// </summary>
        public string Content { get; set; }

        /// <summary>
        /// 棋子 0无 1黑 2白
        /// </summary>
        public int QiZi { get; set; }

        /// <summary>
        /// 落子
        /// </summary>
        public List<string> LuoZi { get; set; } = new List<string>();

        /// <summary>
        /// 结果 0无 1赢 2输
        /// </summary>
        public int Result { get; set; } = 0;
    }

    public class WebScoketCa
    {
        public WebSocket webscoket { get; set; }

        /// <summary>
        /// 发送者ID
        /// </summary>
        public string SenderID { get; set; }

        /// <summary>
        /// 发送者账号
        /// </summary>
        public string SenderName { get; set; }

        /// <summary>
        /// 状态 0未开始 1匹配中 2开始游戏 
        /// </summary>
        public int Status { get; set; } = 0;

        /// <summary>
        /// 房间ID
        /// </summary>
        public string RoomId { get; set; }
    }

    /// <summary>
    /// 添加中间件ChatWebSocketMiddleware
    /// </summary>
    public class ChatWebSocketMiddleware
    {
        //连接池
        private static Dictionary<string, WebScoketCa> _sockets = new Dictionary<string, WebScoketCa>();
        private readonly RequestDelegate _next;
        private static readonly object locker_x = new object();

        public ChatWebSocketMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        /// <summary>
        /// 中间件自动调用方法
        /// </summary>
        /// <param name="context"></param>
        /// <returns></returns>
        public async Task Invoke(HttpContext context)
        {
            ///如果请求不为webscoket
            if (!context.WebSockets.IsWebSocketRequest)
            {
                await _next.Invoke(context);
                return;
            }

            CancellationToken ct = context.RequestAborted;//检测客户端何时断开连接的属性,我们可以通过IsCancellationRequested以了解客户端是否中止连接
            var currentSocket = await context.WebSockets.AcceptWebSocketAsync();//接收webscoket请求
            string socketId = context.Request.Query["SenderID"].ToString();
            string socketName = context.Request.Query["SenderName"].ToString();
            if (!_sockets.ContainsKey(socketId))
            {
                var cc = new WebScoketCa();
                cc.webscoket = currentSocket;
                cc.SenderID = socketId;
                cc.SenderName = socketName;
                _sockets.TryAdd(socketId, cc);
            }

            while (true)
            {
                if (ct.IsCancellationRequested)
                {
                    break;
                }

                string response = await ReceiveStringAsync(currentSocket, ct);
                var msg = JsonConvert.DeserializeObject<MsgTemplate>(response);

                //清理失效链接
                var g = _sockets.Where(x => x.Value.webscoket.State != WebSocketState.Open)?.ToList();
                if (!g.IsBlank())
                {
                    g.ForEach(x =>
                    {
                        _sockets.Remove(x.Key);
                    });
                }

                if (string.IsNullOrEmpty(response))
                {
                    if (currentSocket.State != WebSocketState.Open)
                    {
                        break;
                    }
                    continue;
                }
                switch (msg.Status)
                {
                    case 0:
                        _sockets[msg.SenderID].Status = 0;
                        _sockets[msg.SenderID].RoomId = "";
                        break;
                    case 1:
                        _sockets[msg.SenderID].Status = 1;
                        pipei(msg.SenderID, ct);
                        break;
                    case 3:
                        var v2 = _sockets.Values?.ToList().FindAll(x => x.RoomId == msg.RoomID && x.SenderID != msg.SenderID && x.webscoket.State == WebSocketState.Open) ?? new List<WebScoketCa>();
                        v2.ForEach(async x =>
                        {
                            await SendStringAsync(x.webscoket, JsonConvert.SerializeObject(msg), ct);
                        });
                        break;
                    case 4:
                        var v4 = _sockets.Values?.ToList().Find(x => x.Status == 3 && x.RoomId == msg.RoomID && x.SenderID == msg.SenderID && x.webscoket.State == WebSocketState.Open);
                        var v3 = _sockets.Values?.ToList().FindAll(x => x.RoomId == msg.RoomID && x.SenderID != msg.SenderID && x.webscoket.State == WebSocketState.Open) ?? new List<WebScoketCa>();
                        if (!v4.IsBlank())
                        {
                            if (v3.IsBlank())
                            {
                                v4.RoomId = "";
                                v4.Status = 0;
                                msg.Content = "1";
                            }
                            await SendStringAsync(v4.webscoket, JsonConvert.SerializeObject(msg), ct);
                        }
                        break;
                }
            }

            await currentSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", ct);
            currentSocket.Dispose();
        }

        /// <summary>
        /// 异步发送字符串函数应用
        /// </summary>
        /// <param name="socket"></param>
        /// <param name="data"></param>
        /// <param name="ct"></param>
        /// <returns></returns>
        private static Task SendStringAsync(WebSocket socket, string data, CancellationToken ct = default(CancellationToken))
        {
            var buffer = Encoding.UTF8.GetBytes(data);
            var segment = new ArraySegment<byte>(buffer);
            return socket.SendAsync(segment, WebSocketMessageType.Text, true, ct);
        }

        private static async Task<string> ReceiveStringAsync(WebSocket socket, CancellationToken ct = default(CancellationToken))
        {
            var buffer = new ArraySegment<byte>(new byte[8192]);
            using (var ms = new MemoryStream())
            {
                WebSocketReceiveResult result;
                do
                {
                    ct.ThrowIfCancellationRequested();

                    result = await socket.ReceiveAsync(buffer, ct);
                    ms.Write(buffer.Array, buffer.Offset, result.Count);
                }
                while (!result.EndOfMessage);

                ms.Seek(0, SeekOrigin.Begin);
                if (result.MessageType != WebSocketMessageType.Text)
                {
                    return null;
                }

                using (var reader = new StreamReader(ms, Encoding.UTF8))
                {
                    return await reader.ReadToEndAsync();
                }
            }
        }

        /// <summary>
        /// 匹配
        /// </summary>
        /// <param name="uu"></param>
        /// <param name="ct"></param>
        public static void pipei(string uu, CancellationToken ct)
        {
            Task.Run(() =>
            {
                var i = 0;
                while (i++ < 20)
                {
                    lock (locker_x)
                    {
                        var t = _sockets.Values?.ToList().Find(x => x.Status == 1 && x.SenderID == uu && x.webscoket.State == WebSocketState.Open);
                        if (t.IsBlank())
                        {
                            return;
                        }
                        var gg = _sockets.Values?.ToList().Find(x => x.Status == 1 && x.SenderID != uu && x.SenderName != t.SenderName && x.webscoket.State == WebSocketState.Open);
                        if (!gg.IsBlank())
                        {
                            var roomID = Guid.NewGuid().ToString();
                            gg.Status = 3;
                            t.Status = 3;
                            gg.RoomId = roomID;
                            t.RoomId = roomID;

                            var mm = new MsgTemplate();
                            mm.SenderID = t.SenderID;
                            mm.SenderName = t.SenderName;
                            mm.ReceiverID = gg.SenderID;
                            mm.ReceiverName = gg.SenderName;
                            mm.RoomID = roomID;
                            mm.QiZi = 1;
                            mm.Status = 2;

                            var mm1 = new MsgTemplate();
                            mm1.SenderID = gg.SenderID;
                            mm1.SenderName = gg.SenderName;
                            mm1.ReceiverID = t.SenderID;
                            mm1.ReceiverName = t.SenderName;
                            mm1.RoomID = roomID;
                            mm1.QiZi = 2;
                            mm1.Status = 2;

                            SendStringAsync(t.webscoket, JsonConvert.SerializeObject(mm), ct);
                            SendStringAsync(gg.webscoket, JsonConvert.SerializeObject(mm1), ct);
                        }
                    }
                    Thread.Sleep(1000);
                }
                var gytx = _sockets.Values?.ToList().Find(x => x.Status == 1 && x.SenderID == uu && x.webscoket.State == WebSocketState.Open);
                if (!gytx.IsBlank())
                {
                    var mmt = new MsgTemplate();
                    mmt.SenderID = gytx.SenderID;
                    mmt.SenderName = gytx.SenderName;
                    mmt.Status = -1;

                    gytx.Status = 0;
                    SendStringAsync(gytx.webscoket, JsonConvert.SerializeObject(mmt), ct);
                }
            });
        }
    }

}
