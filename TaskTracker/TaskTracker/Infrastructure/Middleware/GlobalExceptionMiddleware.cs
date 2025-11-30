using Serilog;
using System.Net;
using TaskTracker.Bll.Exceptions;

namespace TaskTracker.Infrastructure.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await next(httpContext);
        }
        catch (Exception ex)
        {
            Log.Logger.Error(ex.Message);

            await HandleExceptionAsync(httpContext, ex);
        }
    }

    public async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        context.Response.StatusCode = exception switch
        {
            NotFound => (int)HttpStatusCode.NotFound,
            _ => (int)HttpStatusCode.InternalServerError,
        };

        await context.Response.WriteAsync(exception.Message);
    }
}
