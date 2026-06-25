using System;

namespace CMS.Domain.Entities
{
    public class User
    {
        public Guid UserId { get; set; } = Guid.NewGuid();
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; } // Doctor, Receptionist
    }
}
