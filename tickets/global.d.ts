declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(): string[];
    }
  }
}

export {};
