package ir.ghadirb.familynutrition

import android.content.Context
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.WebView
import android.webkit.WebViewClient
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * چاپ/ذخیرهٔ PDF واقعی روی اندروید. `window.print()` داخل WebView کاری نمی‌کند؛
 * این پلاگین HTML گزارش را در یک WebView پنهان بارگذاری و با PrintManager سیستم
 * چاپ می‌کند تا پنجرهٔ چاپ اندروید (با گزینهٔ «ذخیره به‌صورت PDF») باز شود.
 */
@CapacitorPlugin(name = "PrintHtml")
class PrintHtmlPlugin : Plugin() {
    // WebView تا پایان ساخت سند چاپ باید زنده بماند
    private var printView: WebView? = null

    @PluginMethod
    fun print(call: PluginCall) {
        val html = call.getString("html")
        val title = call.getString("title") ?: "گزارش تندرسا"
        if (html.isNullOrEmpty()) {
            call.reject("empty_html")
            return
        }
        activity.runOnUiThread {
            try {
                val wv = WebView(context)
                wv.settings.javaScriptEnabled = false
                var started = false
                wv.webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView, url: String?) {
                        if (started) return
                        started = true
                        try {
                            val pm = activity.getSystemService(Context.PRINT_SERVICE) as PrintManager
                            val attrs = PrintAttributes.Builder()
                                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                .build()
                            pm.print(title, view.createPrintDocumentAdapter(title), attrs)
                            call.resolve()
                        } catch (e: Exception) {
                            call.reject("print_failed", e.message)
                        }
                    }
                }
                printView = wv
                wv.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
            } catch (e: Exception) {
                call.reject("print_failed", e.message)
            }
        }
    }

    override fun handleOnDestroy() {
        printView = null
        super.handleOnDestroy()
    }
}
