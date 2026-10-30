package com.cobalt.tv

import android.annotation.SuppressLint
import android.content.Context
import android.view.View
import android.webkit.CookieManager
import android.webkit.WebSettings
import android.webkit.WebView

/**
 * CobaltChromiumConfigurator
 * Prepares the underlying Chromium engine with Cobalt runtime characteristics:
 * - Smart TV / Cobalt Leanback User-Agent
 * - Hardware acceleration & low-latency TV rendering
 * - Non-interactive media autoplay
 * - Full IndexedDB and DOM storage support
 */
object CobaltChromiumConfigurator {

    @SuppressLint("SetJavaScriptEnabled")
    fun applyCobaltSettings(webView: WebView, context: Context) {
        val settings = webView.settings

        // 1. JavaScript & DOM storage
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true

        // 2. Hardware acceleration
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        settings.loadsImagesAutomatically = true

        // 3. Media playback (autoplay without touch gesture)
        settings.mediaPlaybackRequiresUserGesture = false

        // 4. Viewport optimization for 10-foot TV experience
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        // 5. Caching and cookies
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        // 6. Cobalt Smart TV User-Agent
        settings.userAgentString = context.getString(R.string.cobalt_user_agent)

        // 7. Remote Focus setup
        webView.isFocusable = true
        webView.isFocusableInTouchMode = true
        webView.requestFocus()
    }
}

