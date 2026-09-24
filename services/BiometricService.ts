import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export const BiometricService = {
  isAvailable: async (): Promise<boolean> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  },

  authenticate: async (reason: string = 'Scan fingerprint to mark attendance'): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (e) {
      return false;
    }
  },

  getSupportedTypes: async (): Promise<string[]> => {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types.map(t => {
      if (t === LocalAuthentication.AuthenticationType.FINGERPRINT) return 'Fingerprint';
      if (t === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) return 'Face ID';
      return 'Biometric';
    });
  },
};
