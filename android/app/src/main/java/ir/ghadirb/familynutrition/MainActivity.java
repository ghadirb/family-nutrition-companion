package ir.ghadirb.familynutrition;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
  private static final int RUNTIME_PERMISSIONS_REQUEST = 4121;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(HealthConnectPlugin.class);
    registerPlugin(VoiceRecorderPlugin.class);
    super.onCreate(savedInstanceState);
    requestMediaPermissionsIfNeeded();
    allowWebViewMediaPermissionRequests();
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

  // با وجود مجوز runtime، خودِ WebView به‌صورت پیش‌فرض درخواست‌های
  // getUserMedia (audio/video) را رد می‌کند مگر این‌که صریحاً در
  // onPermissionRequest تأیید شوند. اینجا فقط زمانی تأیید می‌کنیم که
  // مجوز اندرویدی متناظر واقعاً به کاربر داده شده باشد.
  private void allowWebViewMediaPermissionRequests() {
    getBridge().getWebView().setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
      @Override
      public void onPermissionRequest(PermissionRequest request) {
        java.util.List<String> grantable = new java.util.ArrayList<>();
        for (String resource : request.getResources()) {
          if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)
              && ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO)
                  == PackageManager.PERMISSION_GRANTED) {
            grantable.add(resource);
          } else if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)
              && ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA)
                  == PackageManager.PERMISSION_GRANTED) {
            grantable.add(resource);
          }
        }
        if (grantable.isEmpty()) {
          request.deny();
        } else {
          request.grant(grantable.toArray(new String[0]));
        }
      }
    });
  }
}
