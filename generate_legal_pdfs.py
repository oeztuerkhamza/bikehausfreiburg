# -*- coding: utf-8 -*-
"""
Generate 3 legal PDF documents for Kleinanzeigen PRO Business Portal:
1. Widerrufsbelehrung mit Muster-Widerrufsformular
2. Allgemeine Geschäftsbedingungen (AGB)
3. Datenschutzerklärung
"""

from fpdf import FPDF
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Business Details
FIRMA = "Bike Haus Freiburg"
INHABER = "Cevdet Akarsu"
STRASSE = "Heckerstraße 27"
PLZ_ORT = "79114 Freiburg im Breisgau"
LAND = "Deutschland"
TELEFON = "+49 155 6630 0011"
EMAIL = "bikehausfreiburg@gmail.com"
WEBSITE = "https://bikehausfreiburg.com"
STEUERNUMMER = "06002/40667"
UST_ID = "DE437595861"


class LegalPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=25)

    def header(self):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, FIRMA, align="R")
        self.ln(4)
        self.set_draw_color(0, 128, 0)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)

    def footer(self):
        self.set_y(-20)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"{FIRMA} | {STRASSE}, {PLZ_ORT} | {EMAIL}", align="C")
        self.ln(4)
        self.cell(0, 10, f"Seite {self.page_no()}/{{nb}}", align="C")

    def section_title(self, title):
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(0, 100, 0)
        self.cell(0, 10, title)
        self.ln(8)

    def section_subtitle(self, title):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(40, 40, 40)
        self.cell(0, 8, title)
        self.ln(6)

    def body_text(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 5.5, text)
        self.ln(3)

    def doc_title(self, title):
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(0, 80, 0)
        self.cell(0, 15, title, align="C")
        self.ln(12)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(80, 80, 80)
        self.cell(0, 6, f"Stand: April 2026", align="C")
        self.ln(10)


# ============================================================
# 1. WIDERRUFSBELEHRUNG
# ============================================================
def create_widerrufsbelehrung():
    pdf = LegalPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.doc_title("Widerrufsbelehrung")

    pdf.section_title("Widerrufsrecht")
    pdf.body_text(
        "Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gruenden diesen Vertrag zu widerrufen. "
        "Die Widerrufsfrist betraegt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, "
        "der nicht der Befoerderer ist, die Waren in Besitz genommen haben bzw. hat."
    )
    pdf.body_text(
        "Um Ihr Widerrufsrecht auszuueben, muessen Sie uns"
    )
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(0, 5.5,
        f"{FIRMA}\n"
        f"Inhaber: {INHABER}\n"  
        f"{STRASSE}\n"
        f"{PLZ_ORT}\n"
        f"Telefon: {TELEFON}\n"
        f"E-Mail: {EMAIL}"
    )
    pdf.ln(3)
    pdf.body_text(
        "mittels einer eindeutigen Erklaerung (z. B. ein mit der Post versandter Brief oder eine E-Mail) "
        "ueber Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. "
        "Sie koennen dafuer das beigefuegte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist."
    )
    pdf.body_text(
        "Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung ueber die Ausuebung des "
        "Widerrufsrechts vor Ablauf der Widerrufsfrist absenden."
    )

    pdf.section_title("Folgen des Widerrufs")
    pdf.body_text(
        "Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, "
        "einschliesslich der Lieferkosten (mit Ausnahme der zusaetzlichen Kosten, die sich daraus ergeben, "
        "dass Sie eine andere Art der Lieferung als die von uns angebotene, guenstigste Standardlieferung "
        "gewaehlt haben), unverzueglich und spaetestens binnen vierzehn Tagen ab dem Tag zurueckzuzahlen, "
        "an dem die Mitteilung ueber Ihren Widerruf dieses Vertrags bei uns eingegangen ist."
    )
    pdf.body_text(
        "Fuer diese Rueckzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der urspruenglichen "
        "Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdruecklich etwas anderes vereinbart; "
        "in keinem Fall werden Ihnen wegen dieser Rueckzahlung Entgelte berechnet."
    )
    pdf.body_text(
        "Wir koennen die Rueckzahlung verweigern, bis wir die Waren wieder zurueckerhalten haben oder bis "
        "Sie den Nachweis erbracht haben, dass Sie die Waren zurueckgesandt haben, je nachdem, welches der "
        "fruehere Zeitpunkt ist."
    )
    pdf.body_text(
        "Sie haben die Waren unverzueglich und in jedem Fall spaetestens binnen vierzehn Tagen ab dem Tag, "
        "an dem Sie uns ueber den Widerruf dieses Vertrags unterrichten, an uns zurueckzusenden oder zu uebergeben. "
        "Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden."
    )
    pdf.body_text(
        "Sie tragen die unmittelbaren Kosten der Ruecksendung der Waren."
    )
    pdf.body_text(
        "Sie muessen fuer einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen "
        "zur Pruefung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang "
        "mit ihnen zurueckzufuehren ist."
    )

    # Ausnahmen
    pdf.section_title("Ausnahmen vom Widerrufsrecht")
    pdf.body_text(
        "Das Widerrufsrecht besteht nicht bei Vertraegen zur Lieferung von Waren, die nicht vorgefertigt sind "
        "und fuer deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher massgeblich "
        "ist oder die eindeutig auf die persoenlichen Beduerfnisse des Verbrauchers zugeschnitten sind."
    )

    # Muster-Widerrufsformular
    pdf.add_page()
    pdf.doc_title("Muster-Widerrufsformular")
    pdf.body_text(
        "(Wenn Sie den Vertrag widerrufen wollen, dann fuellen Sie bitte dieses Formular aus und senden Sie es zurueck.)"
    )
    pdf.ln(3)

    pdf.body_text(f"An:\n{FIRMA}\n{STRASSE}\n{PLZ_ORT}\nE-Mail: {EMAIL}")
    pdf.ln(3)

    pdf.body_text(
        "Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag "
        "ueber den Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*):"
    )
    pdf.ln(2)
    pdf.body_text("_____________________________________________")
    pdf.ln(1)

    pdf.body_text("Bestellt am (*) / erhalten am (*):")
    pdf.body_text("_____________________________________________")
    pdf.ln(1)

    pdf.body_text("Name des/der Verbraucher(s):")
    pdf.body_text("_____________________________________________")
    pdf.ln(1)

    pdf.body_text("Anschrift des/der Verbraucher(s):")
    pdf.body_text("_____________________________________________")
    pdf.ln(1)

    pdf.body_text("_____________________________________________")
    pdf.body_text("Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)")
    pdf.ln(1)

    pdf.body_text("_____________________________________________")
    pdf.body_text("Datum")
    pdf.ln(3)

    pdf.body_text("(*) Unzutreffendes streichen.")

    filepath = os.path.join(OUTPUT_DIR, "Widerrufsbelehrung.pdf")
    pdf.output(filepath)
    print(f"Created: {filepath}")


# ============================================================
# 2. ALLGEMEINE GESCHAEFTSBEDINGUNGEN (AGB)
# ============================================================
def create_agb():
    pdf = LegalPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.doc_title("Allgemeine Geschaeftsbedingungen (AGB)")

    # §1
    pdf.section_title("SS 1 Geltungsbereich")
    pdf.body_text(
        "1.1 Diese Allgemeinen Geschaeftsbedingungen (nachfolgend \"AGB\") gelten fuer alle Vertraege, "
        "die zwischen"
    )
    pdf.set_font("Helvetica", "B", 10)
    pdf.multi_cell(0, 5.5,
        f"{FIRMA}\n"
        f"Inhaber: {INHABER}\n"
        f"{STRASSE}\n"
        f"{PLZ_ORT}\n"
        f"Telefon: {TELEFON}\n"
        f"E-Mail: {EMAIL}\n"
        f"USt-IdNr.: {UST_ID}"
    )
    pdf.ln(3)
    pdf.body_text(
        "(nachfolgend \"Verkaeufer\") und dem Kunden (nachfolgend \"Kaeufer\") ueber die Plattform "
        "kleinanzeigen.de oder im Ladengeschaeft geschlossen werden."
    )
    pdf.body_text(
        "1.2 Es gilt die zum Zeitpunkt der Bestellung gueltige Fassung der AGB."
    )
    pdf.body_text(
        "1.3 Abweichende Bedingungen des Kaeufers werden nicht anerkannt, es sei denn, der Verkaeufer "
        "stimmt ihrer Geltung ausdruecklich schriftlich zu."
    )

    # §2
    pdf.section_title("SS 2 Vertragsschluss")
    pdf.body_text(
        "2.1 Die Darstellung der Produkte in den Anzeigen stellt kein rechtlich bindendes Angebot, "
        "sondern eine Aufforderung zur Abgabe eines Angebots dar."
    )
    pdf.body_text(
        "2.2 Der Kaeufer gibt durch seine Kaufanfrage bzw. Bestellung ein verbindliches Angebot ab. "
        "Der Vertrag kommt zustande, wenn der Verkaeufer das Angebot durch eine Auftragsbestaetigung "
        "oder Lieferung der Ware annimmt."
    )
    pdf.body_text(
        "2.3 Der Vertragstext wird vom Verkaeufer nicht gespeichert und ist nach Vertragsschluss nicht "
        "mehr zugaenglich. Der Kaeufer sollte die Bestelldaten fuer seine Unterlagen sichern."
    )

    # §3
    pdf.section_title("SS 3 Preise und Zahlungsbedingungen")
    pdf.body_text(
        "3.1 Alle angegebenen Preise sind Endpreise und enthalten die gesetzliche Mehrwertsteuer "
        "gemaess SS 19 UStG (Kleinunternehmerregelung) oder den jeweils gueltigen Steuersatz."
    )
    pdf.body_text(
        "3.2 Die Zahlung erfolgt wahlweise per Barzahlung bei Abholung, Ueberweisung oder nach "
        "individueller Vereinbarung."
    )
    pdf.body_text(
        "3.3 Bei Versand traegt der Kaeufer die Versandkosten, sofern nichts anderes vereinbart wurde. "
        "Die Hoehe der Versandkosten wird vor Vertragsschluss mitgeteilt."
    )

    # §4
    pdf.section_title("SS 4 Lieferung und Abholung")
    pdf.body_text(
        "4.1 Die Ware kann nach Vereinbarung im Ladengeschaeft abgeholt oder per Versand geliefert werden."
    )
    pdf.body_text(
        "4.2 Der Verkaeufer bemuecht sich, die angegebenen Lieferzeiten einzuhalten. Lieferverzuege "
        "aufgrund hoeherer Gewalt oder unvorhersehbarer Ereignisse gehen nicht zu Lasten des Verkaeufers."
    )
    pdf.body_text(
        "4.3 Mit der Uebergabe der Ware an das Transportunternehmen geht die Gefahr des zufaelligen "
        "Untergangs und der zufaelligen Verschlechterung auf den Kaeufer ueber. "
        "Bei Verbrauchern geht die Gefahr erst mit Uebergabe der Ware an den Kaeufer ueber."
    )

    # §5
    pdf.section_title("SS 5 Eigentumsvorbehalt")
    pdf.body_text(
        "Die gelieferte Ware bleibt bis zur vollstaendigen Bezahlung des Kaufpreises Eigentum des Verkaeufers."
    )

    # §6
    pdf.section_title("SS 6 Gewaehrleistung und Haftung")
    pdf.body_text(
        "6.1 Es gelten die gesetzlichen Gewaehrleistungsrechte."
    )
    pdf.body_text(
        "6.2 Bei gebrauchten Waren ist die Gewaehrleistungsfrist auf ein Jahr ab Lieferung beschraenkt, "
        "sofern der Kaeufer Verbraucher ist. Gegenueber Unternehmern wird die Gewaehrleistung fuer "
        "gebrauchte Waren ausgeschlossen."
    )
    pdf.body_text(
        "6.3 Der Kaeufer wird gebeten, die Ware bei Lieferung umgehend auf Transportschaeden zu "
        "pruefen und etwaige Maengel dem Verkaeufer unverzueglich mitzuteilen."
    )
    pdf.body_text(
        "6.4 Der Verkaeufer haftet unbeschraenkt fuer Vorsatz und grobe Fahrlaessigkeit. "
        "Bei leichter Fahrlaessigkeit haftet der Verkaeufer nur bei Verletzung wesentlicher "
        "Vertragspflichten und begrenzt auf den vorhersehbaren, vertragstypischen Schaden."
    )

    # §7
    pdf.section_title("SS 7 Widerrufsrecht")
    pdf.body_text(
        "Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Die Einzelheiten ergeben sich aus "
        "der Widerrufsbelehrung, die Bestandteil dieser AGB ist."
    )

    # §8
    pdf.section_title("SS 8 Beschreibung der Waren")
    pdf.body_text(
        "8.1 Unsere Angebote umfassen neue und gebrauchte Fahrraeder, Zubehoer und Ersatzteile."
    )
    pdf.body_text(
        "8.2 Die Beschreibungen unserer Produkte erfolgen nach bestem Wissen und Gewissen. "
        "Abbildungen sind Beispielbilder und koennen vom tatsaechlichen Produkt abweichen."
    )
    pdf.body_text(
        "8.3 Bei gebrauchten Fahrraed sind altersbedingte Gebrauchsspuren moeglich. "
        "Der Zustand wird in der jeweiligen Anzeige nach bestem Wissen beschrieben."
    )

    # §9
    pdf.section_title("SS 9 Streitbeilegung")
    pdf.body_text(
        "9.1 Die Europaeische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: "
        "https://ec.europa.eu/consumers/odr/. Unsere E-Mail-Adresse finden Sie oben in den AGB."
    )
    pdf.body_text(
        "9.2 Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer "
        "Verbraucherschlichtungsstelle teilzunehmen."
    )

    # §10
    pdf.section_title("SS 10 Schlussbestimmungen")
    pdf.body_text(
        "10.1 Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des "
        "UN-Kaufrechts (CISG)."
    )
    pdf.body_text(
        "10.2 Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die "
        "Wirksamkeit der uebrigen Bestimmungen davon unberuehrt."
    )
    pdf.body_text(
        "10.3 Gerichtsstand fuer alle Streitigkeiten ist, soweit gesetzlich zulaessig, "
        "Freiburg im Breisgau."
    )

    filepath = os.path.join(OUTPUT_DIR, "Allgemeine_Geschaeftsbedingungen.pdf")
    pdf.output(filepath)
    print(f"Created: {filepath}")


# ============================================================
# 3. DATENSCHUTZERKLAERUNG
# ============================================================
def create_datenschutz():
    pdf = LegalPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.doc_title("Datenschutzerklaerung")

    # §1
    pdf.section_title("1. Verantwortlicher")
    pdf.body_text(
        "Verantwortlich fuer die Datenverarbeitung im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:"
    )
    pdf.set_font("Helvetica", "B", 10)
    pdf.multi_cell(0, 5.5,
        f"{FIRMA}\n"
        f"Inhaber: {INHABER}\n"
        f"{STRASSE}\n"
        f"{PLZ_ORT}\n"
        f"Telefon: {TELEFON}\n"
        f"E-Mail: {EMAIL}\n"
        f"Website: {WEBSITE}"
    )
    pdf.ln(5)

    # §2
    pdf.section_title("2. Welche Daten wir erheben")
    pdf.body_text(
        "Bei der Kontaktaufnahme ueber Kleinanzeigen oder per E-Mail/Telefon erheben wir folgende Daten:"
    )
    pdf.body_text(
        "- Name und Vorname\n"
        "- E-Mail-Adresse\n"
        "- Telefonnummer (sofern angegeben)\n"
        "- Lieferadresse (bei Versand)\n"
        "- Nachrichteninhalt\n"
        "- Zahlungsinformationen (bei Kauf)"
    )

    # §3
    pdf.section_title("3. Zweck der Datenverarbeitung")
    pdf.body_text(
        "Wir verarbeiten Ihre personenbezogenen Daten zu folgenden Zwecken:"
    )
    pdf.body_text(
        "- Abwicklung von Kaufvertraegen und Lieferungen (Art. 6 Abs. 1 lit. b DSGVO)\n"
        "- Beantwortung von Anfragen und Kommunikation (Art. 6 Abs. 1 lit. b DSGVO)\n"
        "- Erfuellung gesetzlicher Aufbewahrungspflichten (Art. 6 Abs. 1 lit. c DSGVO)\n"
        "- Gewaehrleistungsabwicklung (Art. 6 Abs. 1 lit. b DSGVO)"
    )

    # §4
    pdf.section_title("4. Weitergabe von Daten an Dritte")
    pdf.body_text(
        "Eine Weitergabe Ihrer Daten an Dritte erfolgt nur, soweit dies fuer die Vertragsabwicklung "
        "erforderlich ist (z. B. Weitergabe der Lieferadresse an das Versandunternehmen) "
        "oder wir gesetzlich dazu verpflichtet sind."
    )
    pdf.body_text(
        "Eine darueber hinausgehende Weitergabe an Dritte findet nicht statt, insbesondere nicht zu "
        "Werbezwecken."
    )

    # §5
    pdf.section_title("5. Speicherdauer")
    pdf.body_text(
        "Wir speichern Ihre personenbezogenen Daten nur so lange, wie es fuer die Erfuellung des "
        "jeweiligen Zwecks erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorschreiben. "
        "Gesetzliche Aufbewahrungsfristen betragen in der Regel 6 bis 10 Jahre "
        "(gemaess HGB und AO)."
    )
    pdf.body_text(
        "Nach Ablauf der jeweiligen Fristen werden die Daten routinemaessig geloescht."
    )

    # §6
    pdf.section_title("6. Ihre Rechte")
    pdf.body_text(
        "Sie haben gegenueber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:"
    )
    pdf.body_text(
        "- Recht auf Auskunft (Art. 15 DSGVO)\n"
        "- Recht auf Berichtigung (Art. 16 DSGVO)\n"
        "- Recht auf Loeschung (Art. 17 DSGVO)\n"
        "- Recht auf Einschraenkung der Verarbeitung (Art. 18 DSGVO)\n"
        "- Recht auf Datenuebertragbarkeit (Art. 20 DSGVO)\n"
        "- Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)"
    )
    pdf.body_text(
        "Zur Ausuebung Ihrer Rechte koennen Sie uns jederzeit unter den oben genannten "
        "Kontaktdaten erreichen."
    )

    # §7
    pdf.section_title("7. Beschwerderecht bei einer Aufsichtsbehoerde")
    pdf.body_text(
        "Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehoerde ueber die Verarbeitung "
        "Ihrer personenbezogenen Daten zu beschweren. Die fuer uns zustaendige Aufsichtsbehoerde ist:"
    )
    pdf.body_text(
        "Der Landesbeauftragte fuer den Datenschutz und die Informationsfreiheit Baden-Wuerttemberg\n"
        "Lautenschlagerstrasse 20\n"
        "70173 Stuttgart\n"
        "https://www.baden-wuerttemberg.datenschutz.de"
    )

    # §8
    pdf.section_title("8. Datensicherheit")
    pdf.body_text(
        "Wir bedienen uns geeigneter technischer und organisatorischer Sicherheitsmassnahmen, um Ihre "
        "Daten gegen zufaellige oder vorsaetzliche Manipulationen, teilweisen oder vollstaendigen "
        "Verlust, Zerstoerung oder gegen den unbefugten Zugriff Dritter zu schuetzen."
    )

    # §9
    pdf.section_title("9. Nutzung der Plattform Kleinanzeigen")
    pdf.body_text(
        "Bei der Nutzung der Plattform kleinanzeigen.de gelten zusaetzlich die Datenschutzbestimmungen "
        "von Kleinanzeigen. Diese finden Sie unter: https://www.kleinanzeigen.de/datenschutzerklaerung"
    )

    # §10
    pdf.section_title("10. Aenderung dieser Datenschutzerklaerung")
    pdf.body_text(
        "Wir behalten uns vor, diese Datenschutzerklaerung anzupassen, damit sie stets den aktuellen "
        "rechtlichen Anforderungen entspricht oder um Aenderungen unserer Leistungen umzusetzen. "
        "Fuer Ihren erneuten Besuch gilt dann die neue Datenschutzerklaerung."
    )

    pdf.ln(5)
    pdf.body_text(f"Stand: April 2026")

    filepath = os.path.join(OUTPUT_DIR, "Datenschutzerklaerung.pdf")
    pdf.output(filepath)
    print(f"Created: {filepath}")


if __name__ == "__main__":
    create_widerrufsbelehrung()
    create_agb()
    create_datenschutz()
    print("\nAll 3 PDFs created successfully!")
