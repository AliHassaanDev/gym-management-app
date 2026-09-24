import { Platform } from 'react-native';

export const getDB = (): any => {
  if (Platform.OS === 'web') {
    const { getDB: getWebDB } = require('./database.web');
    return getWebDB();
  }
  const { getDB: getNativeDB } = require('./database.native');
  return getNativeDB();
};

export const initDB = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    const { initDB: initWebDB } = require('./database.web');
    return initWebDB();
  }
  const { initDB: initNativeDB } = require('./database.native');
  return initNativeDB();
};
