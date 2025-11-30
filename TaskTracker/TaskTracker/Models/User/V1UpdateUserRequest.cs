namespace TaskTracker.Models.User;

public class V1UpdateUserRequest
{
    public int Id { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }
}
