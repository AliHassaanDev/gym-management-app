import { webDBInstance } from './webDatabase';

export const getDB = () => {
  return webDBInstance as any;
};

export const initDB = async (): Promise<void> => {
  // Web database uses in-memory / web storage
};
