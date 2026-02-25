using System.IO.Compression;
using BikeHaus.Application.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Services;

public class BackupService : IBackupService
{
    private readonly BikeHausDbContext _dbContext;
    private readonly string _uploadsPath;
    private readonly string _dbPath;

    public BackupService(BikeHausDbContext dbContext, string uploadsPath, string dbPath)
    {
        _dbContext = dbContext;
        _uploadsPath = uploadsPath;
        _dbPath = dbPath;
    }

    public async Task<(byte[] ZipData, string FileName)> CreateBackupAsync()
    {
        var timestamp = DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss");
        var fileName = $"BikeHaus_Backup_{timestamp}.zip";

        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            // 1. Backup the SQLite database using online backup API
            await BackupDatabaseToArchive(archive);

            // 2. Backup all upload files
            await BackupUploadsToArchive(archive);
        }

        memoryStream.Position = 0;
        return (memoryStream.ToArray(), fileName);
    }

    public async Task RestoreBackupAsync(Stream zipStream)
    {
        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);

        // Validate the backup contains a database file
        var dbEntry = archive.GetEntry("database/BikeHausFreiburg.db");
        if (dbEntry == null)
        {
            throw new InvalidOperationException("Invalid backup file: database not found in archive.");
        }

        // Close the current database connection before restoring
        await _dbContext.Database.CloseConnectionAsync();

        // 1. Restore the database
        await RestoreDatabaseFromArchive(archive);

        // 2. Restore uploads
        await RestoreUploadsFromArchive(archive);

        // Re-open connection and ensure migrations are up to date
        await _dbContext.Database.OpenConnectionAsync();
    }

    private async Task BackupDatabaseToArchive(ZipArchive archive)
    {
        // Use SQLite online backup API to create a consistent backup
        var tempDbPath = Path.GetTempFileName();

        try
        {
            // Ensure all changes are flushed
            await _dbContext.Database.ExecuteSqlRawAsync("PRAGMA wal_checkpoint(FULL);");

            // Create a backup using SQLite backup API
            using (var sourceConnection = new SqliteConnection($"Data Source={_dbPath}"))
            using (var destinationConnection = new SqliteConnection($"Data Source={tempDbPath}"))
            {
                await sourceConnection.OpenAsync();
                await destinationConnection.OpenAsync();

                sourceConnection.BackupDatabase(destinationConnection);

                await destinationConnection.CloseAsync();
                await sourceConnection.CloseAsync();
            }

            // Add the backup database to the archive
            var entry = archive.CreateEntry("database/BikeHausFreiburg.db", CompressionLevel.Optimal);
            using var entryStream = entry.Open();
            using var fileStream = File.OpenRead(tempDbPath);
            await fileStream.CopyToAsync(entryStream);
        }
        finally
        {
            if (File.Exists(tempDbPath))
                File.Delete(tempDbPath);
        }
    }

    private async Task BackupUploadsToArchive(ZipArchive archive)
    {
        if (!Directory.Exists(_uploadsPath))
            return;

        var uploadsDir = new DirectoryInfo(_uploadsPath);
        var allFiles = uploadsDir.GetFiles("*", SearchOption.AllDirectories);

        foreach (var file in allFiles)
        {
            var relativePath = Path.GetRelativePath(_uploadsPath, file.FullName);
            var entryPath = $"uploads/{relativePath.Replace('\\', '/')}";

            var entry = archive.CreateEntry(entryPath, CompressionLevel.Optimal);
            using var entryStream = entry.Open();
            using var fileStream = file.OpenRead();
            await fileStream.CopyToAsync(entryStream);
        }
    }

    private async Task RestoreDatabaseFromArchive(ZipArchive archive)
    {
        var dbEntry = archive.GetEntry("database/BikeHausFreiburg.db")!;

        // Write to a temp file first, then replace
        var tempDbPath = _dbPath + ".restore_temp";

        try
        {
            using (var entryStream = dbEntry.Open())
            using (var fileStream = new FileStream(tempDbPath, FileMode.Create))
            {
                await entryStream.CopyToAsync(fileStream);
            }

            // Delete WAL and SHM files if they exist
            var walPath = _dbPath + "-wal";
            var shmPath = _dbPath + "-shm";

            if (File.Exists(walPath)) File.Delete(walPath);
            if (File.Exists(shmPath)) File.Delete(shmPath);

            // Replace the current database
            File.Copy(tempDbPath, _dbPath, overwrite: true);
        }
        finally
        {
            if (File.Exists(tempDbPath))
                File.Delete(tempDbPath);
        }
    }

    private async Task RestoreUploadsFromArchive(ZipArchive archive)
    {
        var uploadEntries = archive.Entries
            .Where(e => e.FullName.StartsWith("uploads/") && !string.IsNullOrEmpty(e.Name))
            .ToList();

        if (!uploadEntries.Any())
            return;

        // Clear existing uploads
        if (Directory.Exists(_uploadsPath))
        {
            Directory.Delete(_uploadsPath, recursive: true);
        }
        Directory.CreateDirectory(_uploadsPath);

        foreach (var entry in uploadEntries)
        {
            var relativePath = entry.FullName.Substring("uploads/".Length);
            var fullPath = Path.Combine(_uploadsPath, relativePath.Replace('/', Path.DirectorySeparatorChar));

            var directory = Path.GetDirectoryName(fullPath);
            if (directory != null && !Directory.Exists(directory))
                Directory.CreateDirectory(directory);

            using var entryStream = entry.Open();
            using var fileStream = new FileStream(fullPath, FileMode.Create);
            await entryStream.CopyToAsync(fileStream);
        }
    }
}
