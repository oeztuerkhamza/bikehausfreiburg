using BikeHaus.Application.Interfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace BikeHaus.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private static readonly HashSet<string> _imageExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff" };
    private const int MaxImageWidth = 1280;
    private const int JpegQuality = 72;

    public FileStorageService(string basePath)
    {
        _basePath = basePath;
        Directory.CreateDirectory(_basePath);
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folder)
    {
        var folderPath = Path.Combine(_basePath, folder);
        Directory.CreateDirectory(folderPath);

        var ext = Path.GetExtension(fileName);
        if (_imageExtensions.Contains(ext))
        {
            // Save compressed image as JPEG
            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(fileName)}.jpg";
            var filePath = Path.Combine(folderPath, uniqueFileName);

            using var image = await Image.LoadAsync(fileStream);
            if (image.Width > MaxImageWidth)
                image.Mutate(x => x.Resize(MaxImageWidth, 0)); // keep aspect ratio

            await image.SaveAsJpegAsync(filePath, new JpegEncoder { Quality = JpegQuality });
            return Path.Combine(folder, uniqueFileName);
        }
        else
        {
            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = Path.Combine(folderPath, uniqueFileName);
            using var outputStream = new FileStream(filePath, FileMode.Create);
            await fileStream.CopyToAsync(outputStream);
            return Path.Combine(folder, uniqueFileName);
        }
    }

    public Task<Stream> GetFileAsync(string filePath)
    {
        var fullPath = Path.Combine(_basePath, filePath);
        if (!File.Exists(fullPath))
            throw new FileNotFoundException($"File not found: {filePath}");

        Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        return Task.FromResult(stream);
    }

    public Task DeleteFileAsync(string filePath)
    {
        var fullPath = Path.Combine(_basePath, filePath);
        if (File.Exists(fullPath))
            File.Delete(fullPath);
        return Task.CompletedTask;
    }

    public bool FileExists(string filePath)
    {
        var fullPath = Path.Combine(_basePath, filePath);
        return File.Exists(fullPath);
    }
}
