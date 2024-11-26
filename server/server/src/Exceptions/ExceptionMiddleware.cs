using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using server.src;
using server.Services;
namespace server.Exceptions
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly DbContextFactory _dbContextFactory;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, DbContextFactory dbContext)
        {
            _next = next;
            _logger = logger;
            _dbContextFactory = dbContext;
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

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
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
            using (var dbContext = _dbContextFactory.GetDbContext()) {
                dbContext.Logs.Add(new DbLogs {
                    Id = Guid.NewGuid().ToString(),
                    LogMessage = exception.Message,
                    LogTime = DateTime.UtcNow
                });
                await dbContext.SaveChangesAsync();
            }
            await context.Response.WriteAsync(result);
        }
    }
}