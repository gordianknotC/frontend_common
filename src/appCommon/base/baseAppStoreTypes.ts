import {UnwrapRef} from "vue";
import {EIOStage} from "~/appCommon/base/baseTableTypes";

export type TAppStoreState<L, T, Extra> ={
  language: L,
  theme: T,
} & Extra

export abstract class IBaseAppStore<L, T, Extra> {
  abstract state: UnwrapRef<TAppStoreState<L, T, Extra>>;
  abstract setLanguage(language: L): void;
  abstract setTheme(theme: T): void;
  abstract setAvatar(avatar: string): void;
  abstract updateAvatar(stage: EIOStage): Promise<void>;
  abstract notifySuccess(message: string): void;
  abstract notifyError(message: any): void;
  abstract notifyInfo(message: string): void;
  abstract notifyDownloading(message: string): void;
  abstract notifyDownloaded(message: string): void;
}

export abstract class IBaseLanguageService<L> {
  abstract language: L;
  abstract readonly defaultLanguage: L;
  abstract readonly languageLabel: string;
  abstract txt: object
}
