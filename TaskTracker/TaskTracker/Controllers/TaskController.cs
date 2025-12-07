using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Models.Task;

namespace TaskTracker.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/task")]
public class TaskController([FromServices] ITaskService taskService) : ControllerBase
{
    [HttpPost("add")]
    [SwaggerOperation("Creates a new task")]
    public async Task<int> V1AddTask([FromBody] V1AddTaskRequest request, CancellationToken token)
    {
        return await taskService.AddTask(new Bll.Models.Task
        {
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            DueDate = request.DueDate,
            ProjectId = request.ProjectId,
            AssigneeId = request.AssigneeId,
            ReporterId = request.ReporterId,
            CreatedAt = DateTimeOffset.Now
        }, token);
    }

    [HttpGet("get")]
    [SwaggerOperation("Gets a task by ID")]
    public async Task<V1GetTaskResponse> V1GetTask([FromQuery] int id, CancellationToken token)
    {
        var task = await taskService.GetTask(id, token);

        return new V1GetTaskResponse
        {
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate,
            ProjectId = task.ProjectId,
            AssigneeId = task.AssigneeId,
            ReporterId = task.ReporterId,
            CreatedAt = DateTimeOffset.Now
        };
    }

    [HttpGet("get/teammate")]
    [SwaggerOperation("Gets all tasks assigned to a team member")]
    public async Task<V1GetTeammateTasksResponse> V1GetTeammateTasks([FromQuery] int teammateId, CancellationToken token)
    {
        var tasks = await taskService.GetTeammateTasks(teammateId, token);

        return new V1GetTeammateTasksResponse
        {
            TeammateTasks = tasks.Select(task => new TeammateTask
            {
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                Priority = task.Priority,
                DueDate = task.DueDate,
                ProjectId = task.ProjectId,
                AssigneeId = task.AssigneeId,
                ReporterId = task.ReporterId,
                CreatedAt = DateTimeOffset.Now
            }).ToArray()
        };
    }

    [HttpPut("update")]
    [SwaggerOperation("Updates a task")]
    public async Task<int> V1UpdateTask([FromBody] V1UpdateTaskRequest request, CancellationToken token)
    {
        return await taskService.UpdateTask(request, token);
    }

    [HttpPut("assign")]
    [SwaggerOperation("Assigns a task to a user")]
    public async Task<bool> V1AssignTask([FromQuery] int taskId, [FromQuery] int userId, CancellationToken token)
    {
        return await taskService.AssignOnTeammate(taskId, userId, token);
    }

    [HttpDelete("close")]
    [SwaggerOperation("Closes a task by ID")]
    public async Task<bool> V1CloseTask([FromQuery] int id, CancellationToken token)
    {
        return await taskService.CloseTask(id, token);
    }
}