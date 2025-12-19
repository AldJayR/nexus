export const mockCookieStore = new Map<string, string>();

export const resetMockCookies = () => {
  mockCookieStore.clear();
};

export const setMockCookie = (key: string, value: string) => {
  mockCookieStore.set(key, value);
};

export const getMockCookie = (key: string) => mockCookieStore.get(key);
