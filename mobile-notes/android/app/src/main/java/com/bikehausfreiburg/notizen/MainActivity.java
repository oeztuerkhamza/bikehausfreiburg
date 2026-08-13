package com.bikehausfreiburg.notizen;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Muss VOR super.onCreate() stehen — danach ist die Brücke schon gebaut
        // und das Plugin taucht in JS nicht auf.
        registerPlugin(KalenderPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
