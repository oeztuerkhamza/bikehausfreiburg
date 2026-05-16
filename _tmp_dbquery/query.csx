#r "nuget: Microsoft.Data.Sqlite, 8.0.0"
using var conn = new Microsoft.Data.Sqlite.SqliteConnection("Data Source=d:\\projects\\bikehausfreiburg\\BikeHaus.API\\BikeHausFreiburg.db");
conn.Open();
var cmd = conn.CreateCommand();
cmd.CommandText = "SELECT FilePath FROM NeueFahrradImages LIMIT 5";
var reader = cmd.ExecuteReader();
while (reader.Read()) Console.WriteLine(reader.GetString(0));
