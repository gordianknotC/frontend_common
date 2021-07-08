
export abstract class IBaseAppConfig<User>{
  abstract API_DOMAIN: string;
  abstract APP_IDENT: string;
  abstract isInProduction: boolean;
  abstract isInDevelopment: boolean;
  abstract DATE_TEMPLATE_FOR_QUERY: string;
  abstract DATE_TEMPLATE_FOR_UILABEL: string;
  abstract EXPOSE_GLOBALS: boolean;
  abstract DEFAULT_MODELS: {
    AUTH_EXPIRATION_IN_DAYS: number;
    USER: User,
    LANGUAGE: string,
    THEME: string,
  } & any;

  abstract isInTestMode: boolean;
  abstract isInDevelopMode: boolean;
  abstract isInProductionMode: boolean;
}

