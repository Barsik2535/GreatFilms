using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

[Authorize]
public class ChatHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var username = Context.User?.Identity?.Name ?? "Аноним";
        await Clients.All.SendAsync("ReceiveMessage", "Система", $"{username} присоединился к чату");
        await base.OnConnectedAsync();
    }

    public async Task SendMessage(string message)
    {
        var username = Context.User?.Identity?.Name ?? "Аноним";
        await Clients.All.SendAsync("ReceiveMessage", username, message);
    }
}