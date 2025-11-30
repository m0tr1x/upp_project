using TaskTracker.Bll.Enum;

namespace TaskTracker.Models.User;

public class V1UpdateTeammateRequest
{
    public int Id { get; set; }

    public Role? Role { get; set; }
}
