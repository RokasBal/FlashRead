using server.src;
using Microsoft.EntityFrameworkCore;
using server.src.Task1;
using server.src.Task2;
using Npgsql;
using server.UserNamespace;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Net.NetworkInformation;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using server.src.Settings;
using server.Services;
using server.Exceptions;
namespace server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
            // builder.Services.AddCors(options => {
            //     options.AddPolicy(
            //         name: MyAllowSpecificOrigins, 
            //         policy  => {
            //             policy.WithOrigins("http://localhost:8080")
            //                 .AllowAnyMethod()
            //                 .AllowAnyHeader()
            //                 .AllowCredentials();
            //             }
            //         );
            //     }
            // );

            try 
            {
                Console.WriteLine("Attempting database connection...");
                var connectionString = ConnectionStringBuilder.BuildConnectionString();
                Console.WriteLine($"Connection String: {connectionString}");

                // Existing database connection code
                Console.WriteLine("Database connection successful!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FATAL: Database Connection Failed");
                Console.WriteLine($"Error Details: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                throw;
            }
            
            builder.Services.AddAuthorization();
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET") ?? throw new InvalidOperationException("JWT_SECRET environment variable is not set!"))),
                        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                        ValidAudience = builder.Configuration["JwtSettings:Audience"],
                        ClockSkew = TimeSpan.Zero
                    };
                });

            builder.Services.AddSingleton<TokenProvider>();
            builder.Services.AddSingleton<DbContextFactory>();
            builder.Services.AddSingleton<SessionManager>();
            builder.Services.AddHostedService<SessionBackgroundService>();

            builder.Services.AddScoped<HistoryManager>();
            builder.Services.AddScoped<UserHandler>();
            builder.Services.AddScoped<Settings>();
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGenWithAuth();

            builder.Logging.ClearProviders();
            builder.Logging.AddConsole();
            builder.Logging.AddDebug();

            var app = builder.Build();

            app.UseStaticFiles();

            // Configure the HTTP request pipeline.
            // if (app.Environment.IsDevelopment()) {
            //     app.UseSwagger();
            //     app.UseSwaggerUI();
            // }

            // app.UseHttpsRedirection();
            // app.UseCors(MyAllowSpecificOrigins);
            
            app.UseHsts();

            app.UseMiddleware<ExceptionMiddleware>();
            
            app.MapControllers();

            // app.MapFallbackToFile("index.html");

            app.UseAuthentication();
            app.UseAuthorization();
            
            try 
            {
                app.Run();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Application startup failed: {ex}");
                throw;
            }
        }
    }
}