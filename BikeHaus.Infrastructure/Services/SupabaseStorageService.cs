using System.Net.Http.Headers;
using System.Text.Json;
using BikeHaus.Application.Interfaces;

namespace BikeHaus.Infrastructure.Services;

public class SupabaseStorageService : IFileStorageService
{
    private readonly HttpClient _httpClient;
    private readonly string _supabaseUrl;
    private readonly string _supabaseKey;
    private readonly string _bucketName;

    public SupabaseStorageService(string supabaseUrl, string supabaseKey, string bucketName = "documents")
    {
        _supabaseUrl = supabaseUrl.TrimEnd('/');
        _supabaseKey = supabaseKey;
        _bucketName = bucketName;

        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _supabaseKey);
        _httpClient.DefaultRequestHeaders.Add("apikey", _supabaseKey);
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folder)
    {
        var uniqueFileName = $"{Guid.NewGuid()}_{SanitizeFileName(fileName)}";
        var filePath = $"{folder}/{uniqueFileName}";

        // Reset stream position if possible
        if (fileStream.CanSeek)
            fileStream.Position = 0;

        // Read stream into byte array
        using var memoryStream = new MemoryStream();
        await fileStream.CopyToAsync(memoryStream);
        var fileBytes = memoryStream.ToArray();

        var url = $"{_supabaseUrl}/storage/v1/object/{_bucketName}/{filePath}";

        using var content = new ByteArrayContent(fileBytes);
        content.Headers.ContentType = new MediaTypeHeaderValue(GetContentType(fileName));

        var response = await _httpClient.PostAsync(url, content);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed to upload file to Supabase Storage: {error}");
        }

        return filePath;
    }

    public async Task<Stream> GetFileAsync(string filePath)
    {
        var url = $"{_supabaseUrl}/storage/v1/object/{_bucketName}/{filePath}";

        var response = await _httpClient.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            throw new FileNotFoundException($"File not found in Supabase Storage: {filePath}");
        }

        var bytes = await response.Content.ReadAsByteArrayAsync();
        return new MemoryStream(bytes);
    }

    public async Task DeleteFileAsync(string filePath)
    {
        var url = $"{_supabaseUrl}/storage/v1/object/{_bucketName}/{filePath}";

        var response = await _httpClient.DeleteAsync(url);

        // Don't throw if file doesn't exist
        if (!response.IsSuccessStatusCode && response.StatusCode != System.Net.HttpStatusCode.NotFound)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed to delete file from Supabase Storage: {error}");
        }
    }

    public bool FileExists(string filePath)
    {
        // Supabase doesn't have a direct "exists" check, so we try to get metadata
        try
        {
            var url = $"{_supabaseUrl}/storage/v1/object/info/{_bucketName}/{filePath}";
            var response = _httpClient.GetAsync(url).Result;
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    private static string SanitizeFileName(string fileName)
    {
        // Remove or replace invalid characters for URLs
        var invalidChars = Path.GetInvalidFileNameChars()
            .Concat(new[] { ' ', '#', '?', '&', '%' })
            .ToArray();

        foreach (var c in invalidChars)
        {
            fileName = fileName.Replace(c, '_');
        }

        return fileName;
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".pdf" => "application/pdf",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
    }
}
