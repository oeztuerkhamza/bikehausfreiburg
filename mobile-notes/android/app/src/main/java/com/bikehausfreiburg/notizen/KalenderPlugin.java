package com.bikehausfreiburg.notizen;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.provider.CalendarContract;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Öffnet die Kalender-App des Telefons mit vorausgefülltem Termin.
 *
 * Bewusst per Intent statt über die Google-Calendar-API: so braucht die App
 * kein OAuth, keine Google-Cloud-Einrichtung und keinen Zugriff auf das Konto —
 * der Termin landet in dem Kalender, der auf dem Telefon eingerichtet ist.
 * Gespeichert wird erst, wenn der Benutzer in der Kalender-App bestätigt.
 */
@CapacitorPlugin(name = "Kalender")
public class KalenderPlugin extends Plugin {

    @PluginMethod
    public void addEvent(PluginCall call) {
        String title = call.getString("title", "");
        String description = call.getString("description", "");
        // Millisekunden kommen als Text: die Brücke kennt kein Long, und als
        // Double verlöre ein Zeitstempel Genauigkeit.
        long begin = parseMillis(call.getString("begin"));
        long end = parseMillis(call.getString("end"));

        Intent intent = new Intent(Intent.ACTION_INSERT)
                .setData(CalendarContract.Events.CONTENT_URI)
                .putExtra(CalendarContract.Events.TITLE, title)
                .putExtra(CalendarContract.Events.DESCRIPTION, description)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        if (begin > 0) intent.putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, begin);
        if (end > begin) intent.putExtra(CalendarContract.EXTRA_EVENT_END_TIME, end);

        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException e) {
            call.reject("Auf diesem Telefon ist keine Kalender-App installiert.");
        }
    }

    private long parseMillis(String value) {
        if (value == null || value.isEmpty()) return 0L;
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}
