using TaskTracker.Bll.Enum;

namespace TaskTracker.Models.Project;

public class V1UpdateProjectRequest
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public string? Description { get; set; }

    public CommonStatus? Status { get; set; }

    public int? TeamId { get; set; }
}