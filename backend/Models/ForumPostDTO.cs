using System.Text.Json.Serialization;

namespace TestAPI.Models
{
    public class ForumPostDTO
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string? TopicId { get; set; }
        public string? UserId { get; set; }
        [JsonPropertyName("userName")]
        public string? userName { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? ParentId { get; set; }
        public ForumPost? Parent { get; set; }
        public ICollection<ForumPostDTO> Replies { get; set; }
    }
}
