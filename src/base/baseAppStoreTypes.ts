import {UnwrapRef} from "vue";

export type TAppStoreState<L, T, Extra> ={
  language: L,
  theme: T,
  formErrors: {[K: string]: string};
} & Extra

export abstract class IBaseAppStore<L, T, Extra> {
  abstract state: UnwrapRef<TAppStoreState<L, T, Extra>>;
  abstract setLanguage(language: L): void;
  abstract setTheme(theme: T): void;
  abstract clearTabs(): void;
  abstract setFormError(error: string): void;
}

export abstract class IBaseLanguageService<L> {
  abstract language: L;
  abstract readonly defaultLanguage: L;
  abstract readonly languageLabel: string;
  abstract txt: object
}
