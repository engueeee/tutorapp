import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get("zone");

    if (!zone) {
      return NextResponse.json(
        { error: "Zone parameter is required" },
        { status: 400 }
      );
    }

    const zoneUrls: { [key: string]: string } = {
      "zone-a":
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/Zone-A.ics",
      "zone-b":
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/Zone-B.ics",
      "zone-c":
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/Zone-C.ics",
      corse:
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/Corse.ics",
      guadeloupe:
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/Guadeloupe.ics",
      guyane:
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/Guyane.ics",
      martinique:
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/Martinique.ics",
      mayotte:
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/Mayotte.ics",
      "nouvelle-caledonie":
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/NouvelleCaledonie.ics",
      polynesie:
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/Polynesie.ics",
      reunion:
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/Reunion.ics",
      "saint-pierre-et-miquelon":
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/SaintPierreEtMiquelon.ics",
      "wallis-et-futuna":
        "https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/WallisEtFutuna.ics",
    };

    const url = zoneUrls[zone];
    if (!url) {
      return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch calendar data" },
        { status: response.status }
      );
    }

    const text = await response.text();

    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/calendar",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error fetching French school calendar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
