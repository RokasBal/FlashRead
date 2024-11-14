using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using server.src;
namespace server.Exceptions
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly FlashDbContext _context;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, FlashDbContext _context)
        {
            _next = next;
            _logger = logger;
            _context = _context;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception has occurred.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            HttpStatusCode statusCode;

            switch (exception)
            {
                case NotFoundException _:
                    statusCode = HttpStatusCode.NotFound;
                    break;
                case UnauthorizedException _:
                    statusCode = HttpStatusCode.Unauthorized;
                    break;
                default:
                    statusCode = HttpStatusCode.InternalServerError;
                    break;
            }

            context.Response.StatusCode = (int)statusCode;
            var result = JsonConvert.SerializeObject(new { error = exception.Message });
            _context.Logs.Add(new DbLogs { 
                Id = Guid.NewGuid().ToString(),
                LogMessage = exception.Message,
                LogTime = DateTime.UtcNow
                }
            );
            _context.SaveChanges();
            return context.Response.WriteAsync(result);
        }
    }
}