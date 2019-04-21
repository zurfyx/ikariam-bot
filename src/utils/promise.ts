async function sequentially<T>(promiseWrappers: (() => Promise<T>)[]): Promise<T[]> {
  const resolved = [] as unknown as T[];
  for (const wrapper of promiseWrappers) {
    resolved.push(await wrapper());
  }
  return resolved;
}

export { sequentially };
