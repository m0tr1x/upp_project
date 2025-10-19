namespace TaskTracker.Bll.Models;

public class TeamMember
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int TeamId { get; set; }

    public int RoleId { get; set; }

    public DateTime JoinedAt { get; set; }
}
