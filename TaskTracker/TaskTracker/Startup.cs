using Supabase;
using TaskTracker.Bll.Services;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Dal.Repositories;
using TaskTracker.Dal.Repositories.Interfaces;
using TaskTracker.Infrastructure.AuthHelper;
using TaskTracker.Infrastructure.Middleware;
using TaskTracker.Infrastructure.Swagger;

namespace TaskTracker;

internal class Startup(IConfiguration configuration)
{
    public IConfiguration Configuration { get; } = configuration;

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();

        services.AddMvc();
        services.AddSwaggerDocumentation();

        services
            .AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder
                        .AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                );
            });

        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        services.AddJwt();
        services.AddAuthorization();

        AddDal(services);
        AddBllServices(services);

        services.AddEndpointsApiExplorer();

        services.AddHttpContextAccessor();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        app.UseCors("CorsPolicy");

        app.UseHttpsRedirection();

        app.UseRouting();

        app.UseMiddleware<GlobalExceptionMiddleware>();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });

        app.UseSwagger();
        app.UseSwaggerUI();
    }

    public void AddBllServices(IServiceCollection services)
    {
        services.AddScoped<ITeamService, TeamService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddScoped<IProjectService, ProjectService>();
    }

    public void AddDal(IServiceCollection services)
    {
        services.AddScoped<ITeamRepository, TeamRepository>();
        services.AddScoped<ITeammateRepository, TeammateRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAuthService, AuthService>();

        var options = new SupabaseOptions
        {
            AutoRefreshToken = true,
            AutoConnectRealtime = true
        };

        var url = Configuration["Supabase:SupabaseURL"]!;
        var api = Configuration["Supabase:SupabaseAPI"];

        services.AddSingleton(provider => new Supabase.Client(url, api, options));
    }
}