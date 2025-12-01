namespace TaskTracker.Models.Team
{
    public class V1GetUsersForTeamResponse
    {
        public int TeammateId { get; set; }
        public int UserId { get; set; }
        public string Email { get; set; } = null!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
}
