package ir.ghadirb.familynutrition

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import ir.myket.billingclient.IabHelper
import ir.myket.billingclient.util.Purchase

/**
 * پل بین رابط وب و کتابخانهٔ پرداخت درون‌برنامه‌ای مایکت.
 * مایکت اشتراک ندارد؛ محصولات «مصرف‌شدنی» هستند (premium_1m / 3m / 12m) و
 * پس از تأیید سرور (Cloudflare Worker) با consume آزاد می‌شوند تا دوباره قابل خرید باشند.
 */
@CapacitorPlugin(name = "MyketBilling")
class MyketBillingPlugin : Plugin() {
    private var helper: IabHelper? = null
    private var ready = false
    private val owned = HashMap<String, Purchase>()

    private fun purchaseToJs(p: Purchase): JSObject {
        val o = JSObject()
        o.put("sku", p.sku)
        o.put("orderId", p.orderId)
        o.put("token", p.token)
        o.put("purchaseTime", p.purchaseTime)
        o.put("developerPayload", p.developerPayload)
        o.put("originalJson", p.originalJson)
        o.put("signature", p.signature)
        return o
    }

    /** اتصال به سرویس مایکت (در صورت نیاز)، سپس اجرای [block] روی ترد UI. */
    private fun withHelper(call: PluginCall, block: (IabHelper) -> Unit) {
        if (BuildConfig.IAB_PUBLIC_KEY.isEmpty()) {
            call.reject("not_configured")
            return
        }
        activity.runOnUiThread {
            try {
                val h = helper ?: IabHelper(context, BuildConfig.IAB_PUBLIC_KEY).also { helper = it }
                if (ready) {
                    block(h)
                } else {
                    h.startSetup { result ->
                        if (result.isSuccess) {
                            ready = true
                            block(h)
                        } else {
                            call.reject("unavailable", result.message)
                        }
                    }
                }
            } catch (e: Exception) {
                call.reject("error", e.message)
            }
        }
    }

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        val ret = JSObject()
        ret.put("configured", BuildConfig.IAB_PUBLIC_KEY.isNotEmpty())
        ret.put("myketInstalled", try {
            context.packageManager.getPackageInfo("ir.mservices.market", 0); true
        } catch (e: Exception) { false })
        call.resolve(ret)
    }

    /** لیست محصولات (قیمت از پنل مایکت) + خریدهای مصرف‌نشده. باید در شروع برنامه صدا زده شود. */
    @PluginMethod
    fun queryInventory(call: PluginCall) {
        val skus = ArrayList<String>()
        call.getArray("skus")?.let { arr ->
            for (i in 0 until arr.length()) skus.add(arr.getString(i))
        }
        withHelper(call) { h ->
            h.queryInventoryAsync(true, skus) { result, inv ->
                if (result.isFailure || inv == null) {
                    call.reject("query_failed", result.message)
                    return@queryInventoryAsync
                }
                val products = JSArray()
                for (sku in skus) {
                    val d = inv.getSkuDetails(sku) ?: continue
                    val o = JSObject()
                    o.put("sku", d.sku)
                    o.put("title", d.title)
                    o.put("description", d.description)
                    o.put("price", d.price)
                    products.put(o)
                }
                val pending = JSArray()
                owned.clear()
                for (p in inv.allPurchases) {
                    owned[p.token] = p
                    pending.put(purchaseToJs(p))
                }
                val ret = JSObject()
                ret.put("products", products)
                ret.put("pending", pending)
                call.resolve(ret)
            }
        }
    }

    @PluginMethod
    fun purchase(call: PluginCall) {
        val sku = call.getString("sku")
        val payload = call.getString("payload") ?: ""
        if (sku.isNullOrEmpty()) {
            call.reject("bad_request")
            return
        }
        withHelper(call) { h ->
            h.launchPurchaseFlow(activity, sku, { result, purchase ->
                if (result.isFailure || purchase == null) {
                    call.reject("purchase_failed", result.message)
                } else {
                    owned[purchase.token] = purchase
                    call.resolve(purchaseToJs(purchase))
                }
            }, payload)
        }
    }

    /** مصرف خرید پس از اینکه سرور آن را تأیید و رسید صادر کرد. */
    @PluginMethod
    fun consume(call: PluginCall) {
        val token = call.getString("token")
        val p = if (token == null) null else owned[token]
        if (p == null) {
            call.reject("unknown_purchase")
            return
        }
        withHelper(call) { h ->
            h.consumeAsync(p) { purchase, result ->
                if (result.isSuccess) {
                    owned.remove(purchase.token)
                    call.resolve()
                } else {
                    call.reject("consume_failed", result.message)
                }
            }
        }
    }

    override fun handleOnDestroy() {
        helper?.dispose()
        helper = null
        ready = false
        super.handleOnDestroy()
    }
}
