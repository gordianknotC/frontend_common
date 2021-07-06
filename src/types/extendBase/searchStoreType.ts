

export interface DebouncedFunc<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
}


export type TSearchStoreState = {
  search: string;
}

export type TSearchPayload = {
  keyword?: string
}
