using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace CRM.Api.Hubs;

[Authorize]
public class PermissionHub : Hub
{
    private const string UserGroupPrefix = "user-";

    private string? GetCurrentUserGroup()
    {
        var userId = Context.User?.FindFirst("UsuarioId")?.Value;
        return string.IsNullOrWhiteSpace(userId) ? null : UserGroupPrefix + userId;
    }

    public override async Task OnConnectedAsync()
    {
        var groupName = GetCurrentUserGroup();
        if (groupName is not null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var groupName = GetCurrentUserGroup();
        if (groupName is not null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        await base.OnDisconnectedAsync(exception);
    }
}
