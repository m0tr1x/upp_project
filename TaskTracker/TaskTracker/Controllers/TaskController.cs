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
    [SwaggerOperation("Добавление задачи")]
    public async Task<int> V1AddTask([FromBody] V1AddTaskRequest request, CancellationToken token)
    {
        return await taskService.AddTask(new Bll.Models.Task
        {
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            DueDate = request.DueDate,
            EstimateHours = request.EstimateHours,
            ActualHours = request.ActualHours,
            ProjectId = request.ProjectId,
            AssigneeId = request.AssigneeId,
            ReporterId = request.ReporterId,
            CreatedAt = DateTimeOffset.Now
        }, token);
    }

    [HttpGet("add")]
    [SwaggerOperation("Получение задачи по id")]
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
            EstimateHours = task.EstimateHours,
            ActualHours = task.ActualHours,
            ProjectId = task.ProjectId,
            AssigneeId = task.AssigneeId,
            ReporterId = task.ReporterId,
            CreatedAt = DateTimeOffset.Now
        };
    }

    [HttpPut("update")]
    [SwaggerOperation("Обновление задачи")]
    public async Task<bool> V1UpdateTask([FromBody] request, CancellationToken token)
    {
        ///return await taskService.UpdateTask(request, token);
    }

    [HttpDelete("close")]
    [SwaggerOperation("Закрытие задачи по id")]
    public async Task<bool> V1CloseTask([FromQuery] int id, CancellationToken token)
    {
        return await taskService.CloseTask(id, token);
    }
}
