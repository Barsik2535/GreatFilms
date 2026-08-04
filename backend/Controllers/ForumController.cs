using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAPI.Data;
using TestAPI.Models;
using TestAPI.Services;

namespace TestAPI.Controllers
{
    [ApiController]
    [Route("api/forum")]
    public class ForumController:ControllerBase
    {
        private readonly AppDbContext _context;
      
        public ForumController(AppDbContext context,CachedPostService cachedPostService) 
        {
            _context=context;
           
        }
        [HttpGet("{topicId}")]
        public async Task<ActionResult<List<ForumPostDTO>>> GetTopicPosts(string topicId) 
        {
            var posts = await _context.ForumPost
                .Where(p => p.TopicId == topicId)
                .OrderBy(p => p.CreateTime)
                .Select(p => new ForumPostDTO
                {
                    Id = p.Id,
                    Text = p.Message,
                    userName = p.UserName,
                    CreatedAt = p.CreateTime,
                    ParentId = p.ParentId
                }).ToListAsync();
           
            return Ok(posts);
        }
        
        private ForumPostDTO MapToDto(ForumPost post,List<ForumPost> posts)
        {
            var dto = new ForumPostDTO
            {
                Id = post.Id,
                userName = post.UserName,
                Text = post.Message,
                CreatedAt = post.CreateTime,
                ParentId = post.ParentId,
                Replies = posts
              .Where(p => p.ParentId == post.Id)
              .OrderBy(p => p.CreateTime)
              .Select(p => MapToDto(p, posts))
              .ToList()
            };
          return dto;
        }
    }
}
