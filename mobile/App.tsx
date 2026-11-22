import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

const WEBAPP_URL =
  process.env.EXPO_PUBLIC_WEBAPP_URL?.trim() ||
  'https://painel-monet-front.vercel.app';

const MOBILE_USER_AGENT =
  Platform.OS === 'ios'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';

interface BridgeMessage {
  type?: string;
  filename?: string;
  content?: string;
  title?: string;
  body?: string;
}

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const hasLoadedOnceRef = useRef(false);
  const canGoBackRef = useRef(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const dismissLoader = useCallback(() => {
    hasLoadedOnceRef.current = true;
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      dismissLoader();
    }, 3500);
    return () => clearTimeout(safetyTimer);
  }, [dismissLoader]);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (webViewRef.current && !hasError) {
        webViewRef.current.injectJavaScript(`
          (function() {
            if (typeof window.__PM_HANDLE_BACK__ === 'function') {
              var handled = window.__PM_HANDLE_BACK__();
              if (!handled && window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NATIVE_BACK_FALLBACK' }));
              }
            } else if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NATIVE_BACK_FALLBACK' }));
            }
          })();
          true;
        `);
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, [hasError]);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      canGoBackRef.current = navState.canGoBack;
      if (!navState.loading) {
        dismissLoader();
      }
    },
    [dismissLoader],
  );

  const handleShouldStartLoadWithRequest = useCallback(
    (request: { url: string }) => {
      const { url } = request;
      if (
        url.startsWith('whatsapp://') ||
        url.startsWith('https://wa.me/') ||
        url.startsWith('https://api.whatsapp.com/') ||
        url.startsWith('tel:') ||
        url.startsWith('mailto:')
      ) {
        Linking.openURL(url).catch(() => undefined);
        return false;
      }
      return true;
    },
    [],
  );

  const handleWebViewMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      const parsed = JSON.parse(event.nativeEvent.data) as BridgeMessage;
      if (parsed.type === 'DOWNLOAD_BACKUP' && parsed.content) {
        await Share.share({
          title: parsed.filename || 'financas-backup.json',
          message: parsed.content,
        });
      } else if (parsed.type === 'FAMILY_INVITE_NOTIFICATION') {
        try {
          Vibration.vibrate([0, 250, 120, 250]);
        } catch {
          // Ignore vibration error
        }
        Alert.alert(
          parsed.title || 'Convite para Painel Família — Finanças',
          parsed.body || 'Você recebeu um convite para unificar o painel financeiro.',
        );
      } else if (parsed.type === 'NATIVE_BACK_FALLBACK') {
        if (canGoBackRef.current && webViewRef.current) {
          webViewRef.current.goBack();
        } else {
          Alert.alert('Sair do aplicativo', 'Deseja fechar o Finanças?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: () => BackHandler.exitApp() },
          ]);
        }
      }
    } catch {
      return;
    }
  }, []);

  const handleRetry = useCallback(() => {
    hasLoadedOnceRef.current = false;
    setHasError(false);
    setInitialLoading(true);
    webViewRef.current?.reload();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {hasError ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorBadge}>
            <Text style={styles.errorBadgeText}>$</Text>
          </View>
          <Text style={styles.errorTitle}>Sem conexão com o Finanças</Text>
          <Text style={styles.errorSubtitle}>
            Verifique sua conexão com a internet e toque abaixo para reconectar ao seu painel.
          </Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.webViewWrapper}>
          <WebView
            ref={webViewRef}
            source={{ uri: WEBAPP_URL }}
            userAgent={MOBILE_USER_AGENT}
            injectedJavaScriptBeforeContentLoaded="window.__PM_RUNNING_IN_APP__ = true; true;"
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            javaScriptCanOpenWindowsAutomatically
            setSupportMultipleWindows={false}
            pullToRefreshEnabled
            allowsBackForwardNavigationGestures
            mixedContentMode="never"
            allowFileAccess={false}
            allowUniversalAccessFromFileURLs={false}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            onMessage={handleWebViewMessage}
            onLoadProgress={({ nativeEvent }) => {
              if (nativeEvent.progress >= 0.55) {
                dismissLoader();
              }
            }}
            onLoadEnd={dismissLoader}
            onHttpError={() => {
              dismissLoader();
            }}
            onError={({ nativeEvent }) => {
              dismissLoader();
              if (nativeEvent.url === WEBAPP_URL || !hasLoadedOnceRef.current) {
                setHasError(true);
              }
            }}
          />

          {initialLoading && (
            <View style={styles.loadingOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Carregando Finanças...</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  webViewWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorBadgeText: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '800',
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
});
