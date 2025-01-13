declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(): Promise<string[]>;
    }
  }
}

export {};
