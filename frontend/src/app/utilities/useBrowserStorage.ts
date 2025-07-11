import * as React from 'react';

export type SetBrowserStorageHook<T> = (value: T) => boolean;

const getStorage = (isSessionStorage: boolean): Storage =>
  isSessionStorage ? sessionStorage : localStorage;

const getValue = (key: string, parseJSON: boolean, isSessionStorage = false): unknown => {
  try {
    const value = getStorage(isSessionStorage).getItem(key);
    if (value === null) {
      return value;
    }

    if (parseJSON) {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return value;
  } catch {
    return null;
  }
};

const setJSONValue = (storageKey: string, value: unknown, isSessionStorage = false): boolean => {
  try {
    const storageValue = JSON.stringify(value);
    getStorage(isSessionStorage).setItem(storageKey, storageValue);
    return true;
  } catch {
    return false;
  }
};

const setStringValue = (storageKey: string, value: string, isSessionStorage = false): void => {
  try {
    getStorage(isSessionStorage).setItem(storageKey, value);
  } catch {
    // Fail silently for storage issues
  }
};

export const useBrowserStorage = <T>(
  storageKey: string,
  defaultValue: T,
  jsonify = true,
  isSessionStorage = false,
): [T, SetBrowserStorageHook<T>] => {
  const [value, setValue] = React.useState<T>(() => {
    const storedValue = getValue(storageKey, jsonify, isSessionStorage);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return storedValue !== null ? (storedValue as T) : defaultValue;
  });

  const setStorageValue = React.useCallback<SetBrowserStorageHook<T>>(
    (newValue) => {
      if (jsonify) {
        const success = setJSONValue(storageKey, newValue, isSessionStorage);
        if (success) {
          setValue(newValue);
        }
        return success;
      }
      if (typeof newValue === 'string') {
        setStringValue(storageKey, newValue, isSessionStorage);
        setValue(newValue);
        return true;
      }
      return false;
    },
    [isSessionStorage, jsonify, storageKey],
  );

  return [value, setStorageValue];
};
