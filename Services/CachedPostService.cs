using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;
using TestAPI.Models;
using Microsoft.Extensions.Caching.Memory;
namespace TestAPI.Services
{
    public class CachedPostService
    {
        private readonly IDistributedCache _cache;
        private readonly ILogger<CachedPostService> _logger;
        public CachedPostService(IDistributedCache cache, ILogger<CachedPostService> logger)
        {
            _cache = cache;
            _logger = logger;
        }
        public async Task<List<ForumPost>> GetPostsAsync(string topicId, Func<Task<List<ForumPost>>> fetchFromDb) 
        {
            string key = $"topic:{topicId}:post";
            var cached = await _cache.GetStringAsync(key);

            if (cached is not null)
            {
                _logger.LogInformation("Cache HIT for topic {TopicId}", topicId);
                return JsonSerializer.Deserialize<List<ForumPost>>(cached)!;
            }

            _logger.LogInformation("Cache MISS for topic {TopicId}", topicId);
            var posts=await fetchFromDb();

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            };
            
            await _cache.SetStringAsync(key,JsonSerializer.Serialize(posts),options);
            return posts;
        }
        public async Task InvalidateTopicCache(string topicId) 
        {
            string key = $"topic:{topicId}:posts";
            await _cache.RemoveAsync(key);
            _logger.LogInformation("Cache invalidated for topic {TopicId}", topicId);
        }
    }
}
