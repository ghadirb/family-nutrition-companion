package ir.ghadirb.familynutrition;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(HealthConnectPlugin.class);
    registerPlugin(VoiceRecorderPlugin.class);
    super.onCreate(savedInstanceState);
    // هیچ مجوزی در شروع برنامه درخواست نمی‌شود؛ هر مجوز در لحظهٔ استفاده گرفته می‌شود:
    // میکروفون توسط VoiceRecorder هنگام زدن دکمهٔ ضبط، دوربین هنگام انتخاب عکس،
    // اعلان هنگام «فعال‌سازی اعلان‌ها»، و Health Connect هنگام زدن «اتصال».
  }
}
