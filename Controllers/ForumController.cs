using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAPI.Data;
using TestAPI.Models;

namespace TestAPI.Controllers
{
    [ApiController]
    [Route("api/forum")]
    public class ForumController:ControllerBase
    {
        private readonly AppDbContext _context;
        public ForumController(AppDbContext context) 
        {
            _context=context;
        }
        [HttpGet("{topicId}")]
        public async Task<ActionResult<List<ForumPostDTO>>> GetTopicPosts(string topicId) 
        {
            var posts = await _context.ForumPost
                .Where(p => p.TopicId == topicId)
                .Include(p => p.Replies)
                .OrderBy(p => p.CreateTime)
                .ToListAsync();
            var rootPosts=posts.Where(p=>p.ParentId == null).Select(p=>MapToDto(p,posts)).ToList();//строим дерево 
  
            return Ok(rootPosts);
        }
        
        private ForumPostDTO MapToDto(ForumPost post,List<ForumPost> posts)
        {
            var dto = new ForumPostDTO
            {
                Id = post.Id,
                UserName = post.UserName,
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
