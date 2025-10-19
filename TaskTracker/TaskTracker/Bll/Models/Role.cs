namespace TaskTracker.Bll.Models;

public class Role
{
    public int Id { get; set; }

    public RoleName Name { get; set; }

    public string? Description { get; set; }
}

public enum RoleName
{
    Admin,
    Member,
    Viewer
}
