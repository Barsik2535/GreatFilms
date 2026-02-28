using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TestAPI.Models
{
    public class RegisterModel
    {
        
        [Required]
        public string Email {  get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public string Username {  get; set; }
        public string Password { get; set; }
        [Compare("Password")]
        [JsonPropertyName("confirmPassword")]
        public string? PasswordConfirm { get; set; }

    }
}
