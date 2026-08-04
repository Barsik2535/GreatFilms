using Microsoft.Identity.Client;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.CompilerServices;

namespace TestAPI.Models
{
    public class ForumPost
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? TopicId { get; set; }
        public string? UserId {  get; set; }
        public string? UserName { get; set; }
        public DateTime CreateTime { get; set; } = DateTime.UtcNow;
        public int? ParentId {  get; set; }
        [ForeignKey("ParentId")]
        public ForumPost Parent { get; set; }
        public ICollection<ForumPost> Replies { get; set; }
    }
}
