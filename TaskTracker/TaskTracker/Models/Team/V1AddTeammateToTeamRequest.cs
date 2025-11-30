using TaskTracker.Bll.Enum;

namespace TaskTracker.Models.Team;

public class V1AddTeammateToTeamRequest
{
    public int UserId { get; set; }

    public int TeamId { get; set; }

    public Role Role { get; set; }
}