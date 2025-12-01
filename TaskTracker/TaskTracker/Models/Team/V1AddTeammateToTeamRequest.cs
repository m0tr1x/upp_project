using TaskTracker.Bll.Enum;

namespace TaskTracker.Models.Team;

public class V1AddTeammateToTeamRequest
{
    public string Email { get; set; }

    public int TeamId { get; set; }

    public Role Role { get; set; }
}