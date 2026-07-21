using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

/// <summary>
/// Interne Bereitstellung der Android-App (APK).
///
/// Bewusst ein JWT-geschützter Endpunkt statt eines Downloads über /uploads:
/// /uploads wird als statisches Verzeichnis öffentlich ausgeliefert, die App-Datei
/// soll aber ausschließlich für angemeldete Admins über die Einstellungsseite
/// erreichbar sein.
///
/// Die APK-Datei liegt im persistenten Volume (<c>/app/data/apk</c>) und wird per
/// SCP auf den Server gelegt — sie ist bewusst nicht Teil des Git-Repos.
/// </summary>
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AppReleaseController(IConfiguration config, IWebHostEnvironment env) : ControllerBase
{
    private string ApkDirectory =>
        config["AppRelease:Path"]
        ?? (env.IsDevelopment()
            ? Path.Combine(env.ContentRootPath, "apk")
            : "/app/data/apk");

    /// <summary>Neueste APK im Verzeichnis (nach Änderungsdatum).</summary>
    private FileInfo? LatestApk()
    {
        var dir = new DirectoryInfo(ApkDirectory);
        if (!dir.Exists) return null;

        return dir.GetFiles("*.apk")
                  .OrderByDescending(f => f.LastWriteTimeUtc)
                  .FirstOrDefault();
    }

    /// <summary>Metadaten für die Einstellungsseite (ohne die Datei zu laden).</summary>
    [HttpGet("info")]
    public ActionResult<object> Info()
    {
        var apk = LatestApk();
        if (apk is null)
            return Ok(new { available = false });

        return Ok(new
        {
            available = true,
            fileName = apk.Name,
            sizeBytes = apk.Length,
            updatedAt = apk.LastWriteTimeUtc,
        });
    }

    [HttpGet("download")]
    public IActionResult Download()
    {
        var apk = LatestApk();
        if (apk is null)
            return NotFound(new { message = "Keine APK auf dem Server hinterlegt." });

        var stream = new FileStream(apk.FullName, FileMode.Open, FileAccess.Read, FileShare.Read);
        return File(stream, "application/vnd.android.package-archive", apk.Name);
    }
}
