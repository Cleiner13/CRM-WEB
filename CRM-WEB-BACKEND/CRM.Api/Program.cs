using System.Text;
using CRM.Api.Middleware;
using CRM.Application.Common.Interfaces;
using CRM.Infrastructure.Persistence.Connections;
using CRM.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using CRM.Application.Features.Auth.Interfaces;
using CRM.Application.Features.Auth.Services;
using CRM.Infrastructure.Persistence.Repositories.Auth;
using Microsoft.OpenApi.Models;
using CRM.Application.Features.Usuarios.Interfaces;
using CRM.Application.Features.Usuarios.Services;
using CRM.Infrastructure.Persistence.Repositories.Usuarios;
using CRM.Application.Features.Empleados.Interfaces;
using CRM.Application.Features.Empleados.Services;
using CRM.Infrastructure.Persistence.Repositories.Empleados;
using CRM.Application.Features.Modulos.Interfaces;
using CRM.Application.Features.Modulos.Services;
using CRM.Infrastructure.Persistence.Repositories.Modulos;
using CRM.Application.Features.Permisos.Interfaces;
using CRM.Application.Features.Permisos.Services;
using CRM.Infrastructure.Persistence.Repositories.Permisos;
using CRM.Application.Features.Roles.Interfaces;
using CRM.Application.Features.Roles.Services;
using CRM.Infrastructure.Persistence.Repositories.Roles;
using CRM.Application.Features.AreasRolesDefault.Interfaces;
using CRM.Application.Features.AreasRolesDefault.Services;
using CRM.Infrastructure.Persistence.Repositories.AreasRolesDefault;
using CRM.Application.Features.TablasMaestras.Interfaces;
using CRM.Application.Features.TablasMaestras.Services;
using CRM.Infrastructure.Persistence.Repositories.TablasMaestras;
using CRM.Application.Features.ItemsMaestros.Interfaces;
using CRM.Application.Features.ItemsMaestros.Services;
using CRM.Infrastructure.Persistence.Repositories.ItemsMaestros;
using CRM.Application.Features.RelacionesItemsMaestros.Interfaces;
using CRM.Application.Features.RelacionesItemsMaestros.Services;
using CRM.Infrastructure.Persistence.Repositories.RelacionesItemsMaestros;
using CRM.Application.Features.Auditoria.Interfaces;
using CRM.Application.Features.Auditoria.Services;
using CRM.Infrastructure.Persistence.Repositories.Auditoria;
using CRM.Application.Common.Models;
using CRM.Application.Features.Profile.Interfaces;
using CRM.Application.Features.Profile.Services;
using CRM.Infrastructure.Persistence.Repositories.Profile;
using CRM.Api.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CRM WEB BACKEND API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingresa el token JWT así: Bearer {tu access token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

builder.Services.AddScoped<IDbConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IUsuariosRepository, UsuariosRepository>();
builder.Services.AddScoped<IUsuariosService, UsuariosService>();

builder.Services.AddScoped<IEmpleadosRepository, EmpleadosRepository>();
builder.Services.AddScoped<IEmpleadosService, EmpleadosService>();

builder.Services.AddScoped<IModulosRepository, ModulosRepository>();
builder.Services.AddScoped<IModulosService, ModulosService>();

builder.Services.AddScoped<IPermisosRepository, PermisosRepository>();
builder.Services.AddScoped<IPermisosService, PermisosService>();

builder.Services.AddScoped<IRolesRepository, RolesRepository>();
builder.Services.AddScoped<IRolesService, RolesService>();

builder.Services.AddScoped<IAreasRolesDefaultRepository, AreasRolesDefaultRepository>();
builder.Services.AddScoped<IAreasRolesDefaultService, AreasRolesDefaultService>();

builder.Services.AddScoped<ITablasMaestrasRepository, TablasMaestrasRepository>();
builder.Services.AddScoped<ITablasMaestrasService, TablasMaestrasService>();

builder.Services.AddScoped<IItemsMaestrosRepository, ItemsMaestrosRepository>();
builder.Services.AddScoped<IItemsMaestrosService, ItemsMaestrosService>();

builder.Services.AddScoped<IRelacionesItemsMaestrosRepository, RelacionesItemsMaestrosRepository>();
builder.Services.AddScoped<IRelacionesItemsMaestrosService, RelacionesItemsMaestrosService>();

builder.Services.AddScoped<IAuditoriaRepository, AuditoriaRepository>();
builder.Services.AddScoped<IAuditoriaService, AuditoriaService>();

builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
builder.Services.AddScoped<IProfileService, ProfileService>();

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddTransient<IEmailService, EmailService>();

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key no está configurado.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrWhiteSpace(accessToken) && path.StartsWithSegments("/permissionHub"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();
builder.Services.AddSignalR();

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<PermissionHub>("/permissionHub");

app.Run();
