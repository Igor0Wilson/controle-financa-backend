import { AppState, type AppStateStatus } from 'react-native';
import { useCallback, useEffect, useRef } from 'react';
import type WebView from 'react-native-webview';

/**
 * Monitors native app foreground/background transitions so minimizing the
 * installed app masks the financial UI immediately and requires re-authentication
 * when returning, while ignoring transient system modals (BiometricPrompt, Share sheet).
 */
export function useAppLockLifecycle(webViewRef: React.RefObject<WebView | null>) {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const wasBackgroundedRef = useRef(false);
  const isTransientPromptOpenRef = useRef(false);
  const suppressLockUntilRef = useRef(0);

  const beginTransientSystemPrompt = useCallback((windowMs = 15000) => {
    isTransientPromptOpenRef.current = true;
    suppressLockUntilRef.current = Date.now() + windowMs;
  }, []);

  const endTransientSystemPrompt = useCallback((cooldownMs = 1200) => {
    isTransientPromptOpenRef.current = false;
    suppressLockUntilRef.current = Date.now() + cooldownMs;
  }, []);

  useEffect(() => {
    const injectLifecycleEvent = (state: 'background' | 'resume_lock') => {
      webViewRef.current?.injectJavaScript(`
        (function() {
          try {
            window.dispatchEvent(new CustomEvent('PM_APP_LIFECYCLE', { detail: { state: '${state}' } }));
          } catch (e) {}
        })();
        true;
      `);
    };

    const subscription = AppState.addEventListener('change', (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      const suppressed =
        isTransientPromptOpenRef.current ||
        Date.now() < suppressLockUntilRef.current;

      if (nextState === 'background' && !suppressed) {
        wasBackgroundedRef.current = true;
        injectLifecycleEvent('background');
        return;
      }

      if (
        nextState === 'active' &&
        prevState !== 'active' &&
        wasBackgroundedRef.current &&
        !suppressed
      ) {
        wasBackgroundedRef.current = false;
        injectLifecycleEvent('resume_lock');
      } else if (nextState === 'active' && suppressed && !isTransientPromptOpenRef.current) {
        wasBackgroundedRef.current = false;
      }
    });

    return () => {
      subscription.remove();
    };
  }, [webViewRef]);

  return {
    beginTransientSystemPrompt,
    endTransientSystemPrompt,
  };
}
