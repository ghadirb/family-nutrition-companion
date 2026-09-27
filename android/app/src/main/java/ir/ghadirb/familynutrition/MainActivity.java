package ir.ghadirb.familynutrition;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private static final int RUNTIME_PERMISSIONS_REQUEST = 4121;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(HealthConnectPlugin.class);
    super.onCreate(savedInstanceState);
    requestMediaPermissionsIfNeeded();
  }

  // ثبت صوتی («AvalAI Transcribe») و ثبت عکس غذا از getUserMedia/دوربین داخل
  // WebView استفاده می‌کنند. WebView فقط زمانی درخواست دسترسی به میکروفون/دوربین
  // را تأیید می‌کند که خودِ اپلیکیشن از قبل مجوز runtime را داشته باشد؛ برای
  // همین این مجوزها را همان ابتدای اجرا (و نه فقط در Manifest) درخواست می‌کنیم.
  private void requestMediaPermissionsIfNeeded() {
    String[] needed = { Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA };
    java.util.List<String> toRequest = new java.util.ArrayList<>();
    for (String permission : needed) {
      if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
        toRequest.add(permission);
      }
    }
    if (!toRequest.isEmpty()) {
      ActivityCompat.requestPermissions(this, toRequest.toArray(new String[0]), RUNTIME_PERMISSIONS_REQUEST);
    }
  }
}
