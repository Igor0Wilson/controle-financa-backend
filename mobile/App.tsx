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
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { hmacSha256Hex } from './src/hmacSha256';

const WEBAPP_URL =
  process.env.EXPO_PUBLIC_WEBAPP_URL?.trim() ||
  'https://painel-monet-front.vercel.app';

const MOBILE_USER_AGENT =
  Platform.OS === 'ios'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';

interface BridgeMessage {
  type?: string;
  requestId?: string;
  credentialId?: string;
  challenge?: string;
  enrollmentSecretHex?: string;
  promptTitle?: string;
  filename?: string;
  content?: string;
  title?: string;
  body?: string;
}

const BIOMETRIC_CRED_ID_PATTERN = /^[a-zA-Z0-9_-]{8,128}$/;

function buildSecureStoreKey(credentialId: string): string {
  return `pm_bio_${credentialId}`;
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

  const sendBiometricBridgeResponse = useCallback(
    (payload: Record<string, unknown>) => {
      if (!webViewRef.current) return;
      const serialized = JSON.stringify(payload);
      webViewRef.current.injectJavaScript(`
        (function() {
          window.dispatchEvent(new CustomEvent('PM_NATIVE_BIOMETRIC_RESPONSE', { detail: ${serialized} }));
        })();
        true;
      `);
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
      } else if (parsed.type === 'BIOMETRIC_CHECK_CAPABILITY') {
        try {
          const [hasHardware, isEnrolled, authTypes] = await Promise.all([
            LocalAuthentication.hasHardwareAsync(),
            LocalAuthentication.isEnrolledAsync(),
            LocalAuthentication.supportedAuthenticationTypesAsync(),
          ]);
          const hasFingerprint = authTypes.includes(
            LocalAuthentication.AuthenticationType.FINGERPRINT,
          );
          const hasFacial = authTypes.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
          );
          sendBiometricBridgeResponse({
            requestId: parsed.requestId,
            success: true,
            available: Boolean(hasHardware && isEnrolled),
            hasFingerprint,
            hasFacial,
            platform: Platform.OS === 'ios' ? 'mobile_ios' : 'mobile_android',
          });
        } catch (err) {
          sendBiometricBridgeResponse({
            requestId: parsed.requestId,
            success: false,
            error: err instanceof Error ? err.message : 'capability_error',
          });
        }
      } else if (parsed.type === 'BIOMETRIC_ENROLL_AND_SIGN') {
        const credId = String(parsed.credentialId || '');
        const challenge = String(parsed.challenge || '');
        const secretHex = String(parsed.enrollmentSecretHex || '');
        if (
          !BIOMETRIC_CRED_ID_PATTERN.test(credId) ||
          !challenge ||
          !/^[a-f0-9]{64}$/i.test(secretHex)
        ) {
          sendBiometricBridgeResponse({
            requestId: parsed.requestId,
            success: false,
            error: 'invalid_enrollment_payload',
          });
          return;
        }
        const authResult = await LocalAuthentication.authenticateAsync({
          promptMessage:
            parsed.promptTitle || 'Ativar autenticação por digital ou facial',
          cancelLabel: 'Cancelar',
          disableDeviceFallback: false,
        });
        if (!authResult.success) {
          sendBiometricBridgeResponse({
            requestId: parsed.requestId,
            success: false,
            error: authResult.error || 'cancelled',
          });
          return;
        }
        await SecureStore.setItemAsync(buildSecureStoreKey(credId), secretHex);
        const signature = hmacSha256Hex(
          secretHex,
          `pm-bio-v1:${challenge}:${credId}`,
        );
        sendBiometricBridgeResponse({
          requestId: parsed.requestId,
          success: true,
          signature,
        });
      } else if (parsed.type === 'BIOMETRIC_AUTHENTICATE') {
        const credId = String(parsed.credentialId || '');
        const challenge = String(parsed.challenge || '');
        if (!BIOMETRIC_CRED_ID_PATTERN.test(credId) || !challenge) {
          sendBiometricBridgeResponse({
            requestId: parsed.requestId,
            success: false,
            error: 'invalid_auth_payload',
          });
          return;
        }
        const authResult = await LocalAuthentication.authenticateAsync({
          promptMessage:
            parsed.promptTitle || 'Confirme sua digital ou reconhecimento facial',
          cancelLabel: 'Cancelar',
          disableDeviceFallback: false,
        });
        if (!authResult.success) {
          sendBiometricBridgeResponse({
            requestId: parsed.requestId,
            success: false,
            error: authResult.error || 'cancelled',
          });
          return;
        }
        const secretHex = await SecureStore.getItemAsync(
          buildSecureStoreKey(credId),
        );
        if (!secretHex || !/^[a-f0-9]{64}$/i.test(secretHex)) {
          sendBiometricBridgeResponse({
            requestId: parsed.requestId,
            success: false,
            error: 'biometric_key_not_found',
          });
          return;
        }
        const signature = hmacSha256Hex(
          secretHex,
          `pm-bio-v1:${challenge}:${credId}`,
        );
        sendBiometricBridgeResponse({
          requestId: parsed.requestId,
          success: true,
          signature,
        });
      } else if (parsed.type === 'BIOMETRIC_REMOVE_SECRET') {
        const credId = String(parsed.credentialId || '');
        if (BIOMETRIC_CRED_ID_PATTERN.test(credId)) {
          await SecureStore.deleteItemAsync(buildSecureStoreKey(credId)).catch(
            () => undefined,
          );
        }
        sendBiometricBridgeResponse({
          requestId: parsed.requestId,
          success: true,
        });
      } else if (
        parsed.type === 'FAMILY_INVITE_NOTIFICATION' ||
        parsed.type === 'EXPENSE_DUE_NOTIFICATION'
      ) {
        try {
          Vibration.vibrate([0, 250, 120, 250]);
        } catch {
          // Ignore vibration error
        }
        Alert.alert(
          parsed.title ||
          (parsed.type === 'EXPENSE_DUE_NOTIFICATION'
            ? 'Lembrete de vencimento — Painel Monet'
            : 'Convite para Painel Família — Finanças'),
          parsed.body ||
          (parsed.type === 'EXPENSE_DUE_NOTIFICATION'
            ? 'Você possui uma conta próxima do vencimento.'
            : 'Você recebeu um convite para unificar o painel financeiro.'),
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
  }, [sendBiometricBridgeResponse]);

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
