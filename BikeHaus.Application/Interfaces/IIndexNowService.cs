namespace BikeHaus.Application.Interfaces;

public interface IIndexNowService
{
    Task SubmitUrlAsync(string url);
    Task SubmitUrlsAsync(IEnumerable<string> urls);
}
