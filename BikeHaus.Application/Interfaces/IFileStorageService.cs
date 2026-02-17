namespace BikeHaus.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string folder);
    Task<Stream> GetFileAsync(string filePath);
    Task DeleteFileAsync(string filePath);
    bool FileExists(string filePath);
}
