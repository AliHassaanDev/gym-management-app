import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '../services/AuthService';
import { Colors } from '../constants/theme';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = AuthService.isAuthenticated();
      if (isAuth) {
        router.replace('/(tabs)');
      } else {
        router.replace('/welcome');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D12',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
