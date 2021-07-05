import {UnwrapRef} from "vue";

export type TAppReactState<L, T, Extra> ={
  language: L,
  theme: T,
  formErrors: {[K: string]: string};
} & Extra

export abstract class IBaseAppReact<L, T, Extra> {
  abstract state: UnwrapRef<TAppReactState<L, T, Extra>>;
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
