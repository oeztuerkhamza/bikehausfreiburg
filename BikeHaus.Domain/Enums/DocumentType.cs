namespace BikeHaus.Domain.Enums;

public enum DocumentType
{
    Screenshot,
    PDF,
    Image,
    Kaufbeleg,       // Purchase Receipt
    Verkaufsbeleg,   // Sales Receipt
    Rueckgabebeleg,  // Return Receipt
    Rechnung         // Invoice for new bikes
}
