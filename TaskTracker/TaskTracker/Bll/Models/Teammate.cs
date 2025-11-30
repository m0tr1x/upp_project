using TaskTracker.Bll.Enum;

namespace TaskTracker.Bll.Models;

public class Teammate
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int TeamId { get; set; }

    public Role Role { get; set; }

    public DateTimeOffset JoinedAt { get; set; }
}