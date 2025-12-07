using TaskTracker.Bll.Enum;
using TaskTracker.Bll.Exceptions;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;
using TaskTracker.Models.Task;
using Task = TaskTracker.Bll.Models.Task;

namespace TaskTracker.Bll.Services;

public class TaskService(ITaskRepository taskRepository) : ITaskService
{
    public async Task<int> AddTask(Task task, CancellationToken token)
    {
        return await taskRepository.AddTaskAsync(new DbTask
        {
            Title = task.Title,
            Description = task.Description,
            Status = (int)task.Status,
            Priority = (int)task.Priority,
            DueDate = task.DueDate,
            ProjectId = task.ProjectId,
            AssigneeId = task.AssigneeId,
            ReporterId = task.ReporterId,
            CreatedAt = task.CreatedAt
        }, token);
    }

    public async Task<bool> AssignOnTeammate(int taskId, int userId, CancellationToken token)
    {
        return await taskRepository.AssignOnTeammateAsync(taskId, userId, token);
    }

    public async Task<bool> CloseTask(int taskId, CancellationToken token)
    {
        return await taskRepository.CloseTaskAsync(taskId, token);
    }

    public async Task<Task> GetTask(int taskId, CancellationToken token)
    {
        var task = await taskRepository.GetTaskAsync(taskId, token)
            ?? throw new NotFoundException();

        return new Task
        {
            Title = task.Title,
            Description = task.Description,
            Status = (CommonStatus)task.Status,
            Priority = (TaskPriority)task.Priority,
            DueDate = task.DueDate,
            ProjectId = task.ProjectId,
            AssigneeId = task.AssigneeId,
            ReporterId = task.ReporterId,
            CreatedAt = task.CreatedAt
        };
    }

    public async Task<Task[]> GetTeammateTasks(int teammateId, CancellationToken token)
    {
        var tasks = await taskRepository.GetTeammateTasksAsync(teammateId, token);

        return tasks.Select(task => new Task
        {
            Title = task.Title,
            Description = task.Description,
            Status = (CommonStatus)task.Status,
            Priority = (TaskPriority)task.Priority,
            DueDate = task.DueDate,
            ProjectId = task.ProjectId,
            AssigneeId = task.AssigneeId,
            ReporterId = task.ReporterId,
            CreatedAt = task.CreatedAt
        }).ToArray();
    }

    public async Task<int> UpdateTask(V1UpdateTaskRequest task, CancellationToken token)
    {
        var dbTask = await taskRepository.GetTaskAsync(task.Id, token)
            ?? throw new NotFoundException();

        if (task.Title != null)
            dbTask.Title = task.Title;

        if (task.Description != null)
            dbTask.Description = task.Description;

        if (task.Status != null)
            dbTask.Status = (int)task.Status;

        if (task.Priority != null)
            dbTask.Priority = (int)task.Priority;

        if (task.DueDate != null)
            dbTask.DueDate = task.DueDate;

        if (task.ProjectId != null)
            dbTask.ProjectId = (int)task.ProjectId;

        return await taskRepository.UpdateTaskAsync(dbTask, token);
    }
}
