using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using TestAPI.Data;
using TestAPI.Models;
using TestAPI.Services;

[Authorize]
public class ChatHub : Hub
{   private readonly AppDbContext _context;
    private readonly CachedPostService _cachedPostService;
    public ChatHub(AppDbContext context, CachedPostService cachedPostService)
    {
        _context = context;
        _cachedPostService = cachedPostService;
    }
    public async Task JoinTopic(string roomId)
    {
        string cleanRoomId = roomId.Trim();
        await Groups.AddToGroupAsync(Context.ConnectionId, cleanRoomId);
    }
    public async Task SendPost(string roomId, string message, int? parentId = null)
    {
       string cleanRoomId = roomId.Trim();
       var user=Context.User;
       var userId=user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
       var userName = user.Identity?.Name ?? "Аноним";
        Console.WriteLine($"Пришел ответ на пост ID: {parentId}");
        var post = new ForumPost
        {
            TopicId = cleanRoomId,
            UserId = userId,
            UserName = userName,
            Message = message,
            ParentId = parentId,
            CreateTime = DateTime.UtcNow
        };
        
        _context.ForumPost.Add(post);
        await _context.SaveChangesAsync();

        await _cachedPostService.InvalidateTopicCache(cleanRoomId);

        var postDto = new
        {
            id=post.Id,
            userName=post.UserName,
            text = post.Message,       
            createdAt = post.CreateTime,
            parentId=post.ParentId,
            replies = new List<object>() 
        };
         await Clients.Group(cleanRoomId).SendAsync("ReceivePost", postDto);
    }
}