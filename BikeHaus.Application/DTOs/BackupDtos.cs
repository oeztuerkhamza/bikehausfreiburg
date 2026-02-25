namespace BikeHaus.Application.DTOs;

public class BackupInfoDto
{
    public string FileName { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TotalTables { get; set; }
    public int TotalUploadFiles { get; set; }
}

public class RestoreResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int TablesRestored { get; set; }
    public int FilesRestored { get; set; }
}
