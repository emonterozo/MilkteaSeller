import AsyncStorage from '@react-native-async-storage/async-storage';
import {round} from 'lodash';
import {ASYNC_STORAGE_KEY_USER} from './constant';

export const storeUser = async (data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEY_USER, jsonValue);
  } catch (error) {
    return error;
  }
};

export const getUser = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_USER);
    return jsonValue !== null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    return error;
  }
};

export const removeUser = async () => {
  try {
    return await AsyncStorage.removeItem(ASYNC_STORAGE_KEY_USER);
  } catch (error) {
    return error;
  }
};

export const calculateRating = (ratings: number[]) => {
  const a = ratings[0]; // 1
  const b = ratings[1]; // 2
  const c = ratings[2]; // 3
  const d = ratings[3]; // 4
  const e = ratings[4]; // 5

  const scoreTotal = a * 1 + b * 2 + c * 3 + d * 4 + e * 5;
  const responseTotal = a + b + c + d + e;
  return {
    response: responseTotal,
    ratings: round(scoreTotal / responseTotal),
  };
};

export const isValidURL = (str: string) => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(str);
};

export const formatAmount = (n: number) => {
  const ranges = [
    {divider: 1e18, suffix: 'E'},
    {divider: 1e15, suffix: 'P'},
    {divider: 1e12, suffix: 'T'},
    {divider: 1e9, suffix: 'G'},
    {divider: 1e6, suffix: 'M'},
    {divider: 1e3, suffix: 'k'},
  ];
  for (let i = 0; i < ranges.length; i++) {
    if (n >= ranges[i].divider) {
      return (n / ranges[i].divider).toString() + ranges[i].suffix;
    }
  }
  return n.toString();
};
