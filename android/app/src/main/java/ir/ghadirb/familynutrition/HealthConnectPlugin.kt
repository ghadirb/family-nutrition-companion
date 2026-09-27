package ir.ghadirb.familynutrition

import androidx.activity.result.ActivityResultLauncher
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.temporal.ChronoUnit

/**
 * پلی‌مورفیزم واقعی برای «قابلیت آینده: اتصال به Health Connect» (مورد ۵۷ در سند
 * محصول). این پلاگین فقط با اقدام صریح کاربر (دکمهٔ «اتصال» در HealthConnectCard)
 * درخواست مجوز می‌دهد و فقط داده می‌خواند؛ هیچ داده‌ای در Health Connect نوشته
 * نمی‌شود.
 */
@CapacitorPlugin(name = "HealthConnect")
class HealthConnectPlugin : Plugin() {

    private val scope = CoroutineScope(Dispatchers.Main)

    private val readPermissions = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(WeightRecord::class),
        HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class),
    )

    private var permissionLauncher: ActivityResultLauncher<Set<String>>? = null
    private var pendingCall: PluginCall? = null

    override fun load() {
        super.load()
        val contract = PermissionController.createRequestPermissionResultContract()
        permissionLauncher = activity.registerForActivityResult(contract) { granted ->
            val call = pendingCall
            pendingCall = null
            val result = JSObject()
            result.put("granted", granted.containsAll(readPermissions))
            call?.resolve(result)
        }
    }

    private fun sdkStatus(): Int = HealthConnectClient.getSdkStatus(context)

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        val status = sdkStatus()
        val result = JSObject()
        result.put("available", status == HealthConnectClient.SDK_AVAILABLE)
        result.put("status", status)
        call.resolve(result)
    }

    @PluginMethod
    fun hasPermissions(call: PluginCall) {
        if (sdkStatus() != HealthConnectClient.SDK_AVAILABLE) {
            call.resolve(JSObject().put("granted", false))
            return
        }
        scope.launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)
                val granted = client.permissionController.getGrantedPermissions()
                call.resolve(JSObject().put("granted", granted.containsAll(readPermissions)))
            } catch (e: Exception) {
                call.reject("خطا در بررسی مجوزهای Health Connect: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun requestPermissions(call: PluginCall) {
        if (sdkStatus() != HealthConnectClient.SDK_AVAILABLE) {
            call.reject("Health Connect روی این دستگاه در دسترس نیست")
            return
        }
        val launcher = permissionLauncher
        if (launcher == null) {
            call.reject("راه‌انداز درخواست مجوز آماده نیست")
            return
        }
        pendingCall = call
        launcher.launch(readPermissions)
    }

    @PluginMethod
    fun readSummary(call: PluginCall) {
        if (sdkStatus() != HealthConnectClient.SDK_AVAILABLE) {
            call.reject("Health Connect در دسترس نیست")
            return
        }
        val days = (call.getInt("days") ?: 1).coerceAtLeast(1)
        scope.launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)
                val granted = client.permissionController.getGrantedPermissions()
                if (!granted.containsAll(readPermissions)) {
                    call.reject("مجوز Health Connect داده نشده است")
                    return@launch
                }
                val end = Instant.now()
                val start = end.minus(days.toLong(), ChronoUnit.DAYS)
                val range = TimeRangeFilter.between(start, end)

                val stepsAgg = client.aggregate(
                    AggregateRequest(setOf(StepsRecord.COUNT_TOTAL), range),
                )
                val caloriesAgg = client.aggregate(
                    AggregateRequest(setOf(TotalCaloriesBurnedRecord.ENERGY_TOTAL), range),
                )
                val weightRecords = client.readRecords(
                    ReadRecordsRequest(WeightRecord::class, range),
                ).records

                val result = JSObject()
                result.put("steps", stepsAgg[StepsRecord.COUNT_TOTAL] ?: 0L)
                val kcal = caloriesAgg[TotalCaloriesBurnedRecord.ENERGY_TOTAL]?.inKilocalories ?: 0.0
                result.put("caloriesBurned", kcal)
                val latest = weightRecords.maxByOrNull { it.time }
                if (latest != null) {
                    result.put("latestWeightKg", latest.weight.inKilograms)
                } else {
                    result.put("latestWeightKg", JSObject.NULL)
                }
                call.resolve(result)
            } catch (e: Exception) {
                call.reject("خطا در خواندن اطلاعات Health Connect: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun openHealthConnectSettings(call: PluginCall) {
        try {
            val intent = android.content.Intent()
            intent.action = "androidx.health.ACTION_HEALTH_CONNECT_SETTINGS"
            context.startActivity(intent)
            call.resolve()
        } catch (e: Exception) {
            call.reject("امکان باز کردن تنظیمات Health Connect نبود: ${e.message}")
        }
    }
}
