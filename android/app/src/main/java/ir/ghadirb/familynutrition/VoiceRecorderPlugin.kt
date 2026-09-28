package ir.ghadirb.familynutrition

import android.Manifest
import android.media.MediaRecorder
import android.os.Build
import android.util.Base64
import com.getcapacitor.JSObject
import com.getcapacitor.PermissionState
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import java.io.File

/**
 * ضبط صدا به‌صورت کاملاً native با MediaRecorder اندروید، بدون تکیه بر
 * getUserMedia داخل WebView. روی برخی WebViewهای قدیمی/سفارشی (مثل گوشی‌های
 * ارزان‌قیمت با سیستم‌عامل قدیمی)، getUserMedia حتی با مجوز کامل هم درخواست
 * دسترسی را رد می‌کند؛ این پلاگین آن لایه را کاملاً دور می‌زند.
 */
@CapacitorPlugin(
    name = "VoiceRecorder",
    permissions = [Permission(strings = [Manifest.permission.RECORD_AUDIO], alias = "microphone")],
)
class VoiceRecorderPlugin : Plugin() {
    private var recorder: MediaRecorder? = null
    private var outputFile: File? = null

    @PluginMethod
    fun hasPermission(call: PluginCall) {
        val ret = JSObject()
        ret.put("granted", getPermissionState("microphone") == PermissionState.GRANTED)
        call.resolve(ret)
    }

    @PluginMethod
    fun requestPermission(call: PluginCall) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) {
            val ret = JSObject()
            ret.put("granted", true)
            call.resolve(ret)
            return
        }
        requestPermissionForAlias("microphone", call, "permissionCallback")
    }

    @PermissionCallback
    private fun permissionCallback(call: PluginCall) {
        val ret = JSObject()
        ret.put("granted", getPermissionState("microphone") == PermissionState.GRANTED)
        call.resolve(ret)
    }

    @PluginMethod
    fun startRecording(call: PluginCall) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            call.reject("دسترسی میکروفون داده نشده است.")
            return
        }
        if (recorder != null) {
            call.reject("ضبط صدا از قبل در حال انجام است.")
            return
        }
        try {
            val file = File(context.cacheDir, "voice_${System.currentTimeMillis()}.m4a")
            val mr = if (Build.VERSION.SDK_INT >= 31) MediaRecorder(context) else @Suppress("DEPRECATION") MediaRecorder()
            mr.setAudioSource(MediaRecorder.AudioSource.VOICE_RECOGNITION)
            mr.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            mr.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            mr.setAudioChannels(1)
            mr.setAudioEncodingBitRate(64000)
            mr.setAudioSamplingRate(16000)
            mr.setOutputFile(file.absolutePath)
            mr.prepare()
            mr.start()
            recorder = mr
            outputFile = file
            call.resolve()
        } catch (e: Exception) {
            recorder = null
            outputFile = null
            call.reject("شروع ضبط ناموفق بود: ${e.message}")
        }
    }

    @PluginMethod
    fun stopRecording(call: PluginCall) {
        val mr = recorder
        val file = outputFile
        recorder = null
        outputFile = null
        if (mr == null || file == null) {
            call.reject("ضبطی در حال انجام نبود.")
            return
        }
        try {
            mr.stop()
            mr.release()
            val bytes = file.readBytes()
            file.delete()
            val ret = JSObject()
            ret.put("base64", Base64.encodeToString(bytes, Base64.NO_WRAP))
            ret.put("mimeType", "audio/mp4")
            ret.put("fileName", "voice.m4a")
            call.resolve(ret)
        } catch (e: Exception) {
            try { mr.release() } catch (_: Exception) {}
            file.delete()
            call.reject("پایان ضبط ناموفق بود: ${e.message}")
        }
    }

    @PluginMethod
    fun cancelRecording(call: PluginCall) {
        val mr = recorder
        val file = outputFile
        recorder = null
        outputFile = null
        try {
            mr?.stop()
        } catch (_: Exception) {
        }
        try { mr?.release() } catch (_: Exception) {}
        file?.delete()
        call.resolve()
    }
}
