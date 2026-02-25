namespace BikeHaus.Application.Interfaces;

public interface IBackupService
{
    /// <summary>
    /// Creates a zip backup containing the SQLite database and all upload files.
    /// Returns the zip file as a byte array along with the suggested file name.
    /// </summary>
    Task<(byte[] ZipData, string FileName)> CreateBackupAsync();

    /// <summary>
    /// Restores the system from a zip backup file.
    /// Replaces the database and upload files with those from the backup.
    /// </summary>
    Task RestoreBackupAsync(Stream zipStream);
}
