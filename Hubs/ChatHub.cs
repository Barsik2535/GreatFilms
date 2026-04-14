using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using TestAPI.Data;
using TestAPI.Models;

[Authorize]
public class ChatHub : Hub
{   private readonly AppDbContext _context;
    public ChatHub(AppDbContext context)
    {
        _context = context;
    }
    public async Task JoinTopic(string roomId)
    {   
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
    }
    public async Task SendPost(string roomId, string message, int? parentId = null) 
    {
       var user=Context.User;
       var userId=user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
       var userName = user.Identity?.Name ?? "Аноним";
        var post = new ForumPost
        {
            TopicId = roomId,
            UserId = userId,
            UserName = userName,
            Message = message,
            ParentId = parentId,
        };
        _context.ForumPost.Add(post);
        await _context.SaveChangesAsync();
        var postDto = new
        {
            post.Id,
            post.UserName,
            text = post.Message,       
            createdAt = post.CreateTime,
            post.ParentId,
            replies = new List<object>() 
        };
         await Clients.All.SendAsync("ReceivePost", postDto);
    }

}