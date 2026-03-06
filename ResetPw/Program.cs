using Microsoft.Data.Sqlite;

var dbPath = Path.Combine("..", "BikeHaus.API", "BikeHausFreiburg.db");
var connStr = $"Data Source={dbPath}";
var hash = BCrypt.Net.BCrypt.HashPassword("admin");

using var conn = new SqliteConnection(connStr);
conn.Open();
using var cmd = conn.CreateCommand();
cmd.CommandText = "UPDATE Users SET PasswordHash = @hash WHERE Username = 'admin'";
cmd.Parameters.AddWithValue("@hash", hash);
var rows = cmd.ExecuteNonQuery();
Console.WriteLine($"Updated {rows} row(s). Password reset to 'admin'.");
