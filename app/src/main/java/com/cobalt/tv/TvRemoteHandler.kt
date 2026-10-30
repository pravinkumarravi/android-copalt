package com.cobalt.tv

import android.os.SystemClock
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.webkit.WebView

/**
 * TvRemoteHandler
 * Handles D-pad and media remote control commands for the TV application.
 */
class TvRemoteHandler(
    private val webView: WebView,
    private val virtualCursor: View
) {

    private var isCursorMode = false
    private var cursorX = 960f
    private var cursorY = 540f
    private val step = 45f

    fun onKeyEvent(keyCode: Int, event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN) {
            when (keyCode) {
                KeyEvent.KEYCODE_DPAD_CENTER,
                KeyEvent.KEYCODE_ENTER,
                KeyEvent.KEYCODE_NUMPAD_ENTER -> {
                    if (isCursorMode) {
                        performCursorClick()
                        return true
                    }
                    dispatchJsKey("Enter", 13)
                    return true
                }

                KeyEvent.KEYCODE_DPAD_LEFT -> {
                    if (isCursorMode) {
                        moveCursor(-step, 0f)
                        return true
                    }
                    dispatchJsKey("ArrowLeft", 37)
                    return true
                }

                KeyEvent.KEYCODE_DPAD_RIGHT -> {
                    if (isCursorMode) {
                        moveCursor(step, 0f)
                        return true
                    }
                    dispatchJsKey("ArrowRight", 39)
                    return true
                }

                KeyEvent.KEYCODE_DPAD_UP -> {
                    if (isCursorMode) {
                        moveCursor(0f, -step)
                        return true
                    }
                    dispatchJsKey("ArrowUp", 38)
                    return true
                }

                KeyEvent.KEYCODE_DPAD_DOWN -> {
                    if (isCursorMode) {
                        moveCursor(0f, step)
                        return true
                    }
                    dispatchJsKey("ArrowDown", 40)
                    return true
                }

                KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE,
                KeyEvent.KEYCODE_MEDIA_PLAY,
                KeyEvent.KEYCODE_MEDIA_PAUSE -> {
                    toggleVideoPlayPause()
                    return true
                }

                KeyEvent.KEYCODE_MEDIA_FAST_FORWARD -> {
                    seekVideo(10)
                    return true
                }

                KeyEvent.KEYCODE_MEDIA_REWIND -> {
                    seekVideo(-10)
                    return true
                }

                // TV Remote Back key
                KeyEvent.KEYCODE_BACK,
                KeyEvent.KEYCODE_ESCAPE -> {
                    dispatchJsKey("Escape", 27)
                    return true
                }

                // Press MENU or PROG_RED to toggle virtual cursor mode
                KeyEvent.KEYCODE_MENU,
                KeyEvent.KEYCODE_PROG_RED -> {
                    toggleCursorMode()
                    return true
                }
            }
        }
        return false
    }

    private fun moveCursor(dx: Float, dy: Float) {
        val width = webView.width.toFloat().coerceAtLeast(1920f)
        val height = webView.height.toFloat().coerceAtLeast(1080f)
        cursorX = (cursorX + dx).coerceIn(0f, width)
        cursorY = (cursorY + dy).coerceIn(0f, height)

        virtualCursor.x = cursorX - (virtualCursor.width / 2f)
        virtualCursor.y = cursorY - (virtualCursor.height / 2f)
    }

    private fun performCursorClick() {
        val downTime = SystemClock.uptimeMillis()
        val down = MotionEvent.obtain(downTime, downTime, MotionEvent.ACTION_DOWN, cursorX, cursorY, 0)
        val up = MotionEvent.obtain(downTime, downTime + 50, MotionEvent.ACTION_UP, cursorX, cursorY, 0)
        webView.dispatchTouchEvent(down)
        webView.dispatchTouchEvent(up)
        down.recycle()
        up.recycle()
    }

    private fun toggleCursorMode() {
        isCursorMode = !isCursorMode
        virtualCursor.visibility = if (isCursorMode) View.VISIBLE else View.GONE
        if (isCursorMode) {
            cursorX = webView.width / 2f
            cursorY = webView.height / 2f
            virtualCursor.x = cursorX
            virtualCursor.y = cursorY
        }
    }

    private fun dispatchJsKey(key: String, keyCode: Int) {
        val script = """
            (function() {
                var evt = new KeyboardEvent('keydown', {
                    key: '$key',
                    code: '$key',
                    keyCode: $keyCode,
                    which: $keyCode,
                    bubbles: true,
                    cancelable: true
                });
                window.dispatchEvent(evt);
            })();
        """.trimIndent()
        webView.evaluateJavascript(script, null)
    }

    private fun toggleVideoPlayPause() {
        val script = """
            (function() {
                var v = document.querySelector('video');
                if (v) {
                    if (v.paused) v.play(); else v.pause();
                }
            })();
        """.trimIndent()
        webView.evaluateJavascript(script, null)
    }

    private fun seekVideo(offsetSeconds: Int) {
        val script = """
            (function() {
                var v = document.querySelector('video');
                if (v) {
                    v.currentTime += $offsetSeconds;
                }
            })();
        """.trimIndent()
        webView.evaluateJavascript(script, null)
    }
}

