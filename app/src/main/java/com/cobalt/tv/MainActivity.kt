package com.cobalt.tv

import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.SslErrorHandler
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.net.http.SslError
import androidx.webkit.WebViewAssetLoader
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import com.cobalt.tv.databinding.ActivityMainBinding

/**
 * MainActivity
 * Living-room fullscreen Cobalt TV experience.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var remoteHandler: TvRemoteHandler
    private lateinit var assetLoader: WebViewAssetLoader
    private var customVideoView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        applyFullscreen()

        remoteHandler = TvRemoteHandler(binding.cobaltWebView, binding.virtualCursor)

        assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        setupWebView()
        setupBackHandler()

        val initialUrl = intent?.dataString ?: getString(R.string.default_url)
        binding.cobaltWebView.loadUrl(initialUrl)
    }

    private fun applyFullscreen() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.insetsController?.let { controller ->
                controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
                controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            )
        }
    }

    private fun setupWebView() {
        val webView = binding.cobaltWebView
        CobaltChromiumConfigurator.applyCobaltSettings(webView, this)

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                request?.url?.let { uri ->
                    val uriString = uri.toString()
                    // 1. Intercept local app assets
                    val assetResponse = assetLoader.shouldInterceptRequest(uri)
                    if (assetResponse != null) return assetResponse

                    // 2. Intercept external media / video streams to proxy them with permissive CORS headers
                    // This bypasses Chromium's Opaque Response Blocking (ERR_BLOCKED_BY_ORB) on Android TV
                    if (uriString.endsWith(".mp4") || uriString.contains("gtv-videos-bucket")) {
                        try {
                            val url = java.net.URL(uriString)
                            val conn = url.openConnection() as java.net.HttpURLConnection
                            conn.connectTimeout = 10000
                            conn.readTimeout = 15000
                            conn.requestMethod = request.method ?: "GET"

                            // Forward range requests for smooth seeking and playback
                            request.requestHeaders?.forEach { (k, v) ->
                                conn.setRequestProperty(k, v)
                            }

                            val responseHeaders = mutableMapOf(
                                "Access-Control-Allow-Origin" to "*",
                                "Access-Control-Allow-Methods" to "GET, OPTIONS, HEAD",
                                "Access-Control-Allow-Headers" to "*",
                                "Accept-Ranges" to "bytes"
                            )

                            conn.headerFields?.forEach { (k, v) ->
                                if (k != null && v != null && v.isNotEmpty()) {
                                    responseHeaders[k] = v[0]
                                }
                            }

                            val mimeType = conn.contentType ?: "video/mp4"
                            val encoding = conn.contentEncoding ?: "UTF-8"
                            val statusCode = conn.responseCode
                            val message = conn.responseMessage ?: "OK"

                            return WebResourceResponse(
                                mimeType,
                                encoding,
                                statusCode,
                                message,
                                responseHeaders,
                                conn.inputStream
                            )
                        } catch (e: Exception) {
                            Log.e("CobaltTV", "Failed to proxy media URL: $uriString", e)
                        }
                    }
                }
                return super.shouldInterceptRequest(view, request)
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                Log.d("CobaltTV", "Page started: $url")
                binding.loadingIndicator.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                Log.d("CobaltTV", "Page finished: $url")
                binding.loadingIndicator.visibility = View.GONE
            }

            override fun onReceivedSslError(
                view: WebView?,
                handler: SslErrorHandler?,
                error: SslError?
            ) {
                // In emulator environments, certificate date mismatches (e.g. net_error -202)
                // block the page from rendering. Proceeding allows the page to load smoothly.
                Log.w("CobaltTV", "SSL Error bypassed for emulator: ${error?.primaryError}")
                handler?.proceed()
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                Log.e("CobaltTV", "Web error: ${error?.errorCode} - ${error?.description} for ${request?.url}")
                if (request?.isForMainFrame == true) {
                    binding.loadingIndicator.visibility = View.GONE
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    return false
                }
                return try {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    true
                } catch (e: Exception) {
                    true
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                Log.d("CobaltJS", "${consoleMessage?.message()} [line: ${consoleMessage?.lineNumber()}]")
                return true
            }

            override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
                if (customVideoView != null) {
                    callback?.onCustomViewHidden()
                    return
                }
                customVideoView = view
                customViewCallback = callback
                binding.cobaltWebView.visibility = View.GONE
                binding.rootContainer.addView(
                    customVideoView,
                    FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                )
            }

            override fun onHideCustomView() {
                customVideoView?.let {
                    binding.rootContainer.removeView(it)
                    customVideoView = null
                    customViewCallback?.onCustomViewHidden()
                    binding.cobaltWebView.visibility = View.VISIBLE
                }
            }
        }
    }

    private fun setupBackHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (customVideoView != null) {
                    binding.cobaltWebView.webChromeClient?.onHideCustomView()
                } else if (binding.cobaltWebView.canGoBack()) {
                    binding.cobaltWebView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (remoteHandler.onKeyEvent(event.keyCode, event)) {
            return true
        }
        return super.dispatchKeyEvent(event)
    }

    override fun onResume() {
        super.onResume()
        binding.cobaltWebView.onResume()
    }

    override fun onPause() {
        super.onPause()
        binding.cobaltWebView.onPause()
    }

    override fun onDestroy() {
        binding.cobaltWebView.destroy()
        super.onDestroy()
    }
}

