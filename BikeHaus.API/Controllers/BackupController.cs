using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BackupController : ControllerBase
{
    private readonly IBackupService _backupService;
    private readonly ILogger<BackupController> _logger;

    public BackupController(IBackupService backupService, ILogger<BackupController> logger)
    {
        _backupService = backupService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a full backup (database + uploads) and returns it as a zip file download.
    /// </summary>
    [HttpGet("download")]
    public async Task<IActionResult> DownloadBackup()
    {
        try
        {
            _logger.LogInformation("Creating backup...");
            var (zipData, fileName) = await _backupService.CreateBackupAsync();
            _logger.LogInformation("Backup created successfully: {FileName} ({Size} bytes)", fileName, zipData.Length);

            return File(zipData, "application/zip", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating backup");
            return StatusCode(500, new { message = "Backup creation failed: " + ex.Message });
        }
    }

    /// <summary>
    /// Restores the system from a backup zip file upload.
    /// </summary>
    [HttpPost("restore")]
    [RequestSizeLimit(500_000_000)] // 500MB max
    public async Task<IActionResult> RestoreBackup(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        if (!file.FileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Only .zip files are accepted" });
        }

        try
        {
            _logger.LogInformation("Restoring backup from: {FileName} ({Size} bytes)", file.FileName, file.Length);

            using var stream = file.OpenReadStream();
            await _backupService.RestoreBackupAsync(stream);

            _logger.LogInformation("Backup restored successfully");
            return Ok(new { message = "Backup restored successfully. Please restart the application." });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid backup file");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring backup");
            return StatusCode(500, new { message = "Restore failed: " + ex.Message });
        }
    }
}
