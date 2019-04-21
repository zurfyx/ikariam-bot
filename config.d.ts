export const CONFIG: {
  username: string,
  password: string,
  tradeRoutes: {
    crontime: string,
    from: string,
    to: string,
    goods: {
      wood?: number,
      wine?: number,
      marble?: number,
      crystal?: number,
      sulphur?: number,
    },
    timezone: string,
  }[],
};
