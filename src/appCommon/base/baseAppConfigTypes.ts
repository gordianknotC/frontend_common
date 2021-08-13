
export abstract class IBaseAppConfig<User>{
  abstract PROJECT_NAME: string;
  abstract API_DOMAIN: string;
  abstract APP_IDENT: string;
  abstract DATE_TEMPLATE_FOR_QUERY: string;
  abstract DATE_TEMPLATE_FOR_UILABEL: string;
  abstract AUTH_EXPIRATION_IN_MINUTES: number;
  abstract EXPOSE_GLOBALS: boolean;
  abstract DEFAULT_MODELS: {
    AUTH_EXPIRATION_IN_DAYS: number;
    USER: User,
    COUNTRY_CODE: string,
    LANGUAGE: string,
    THEME: string,
    COUNTER: {
      SPAN: number,
      SPAN_RETRIES: number,
      PERIOD: number,
      PERIOD_RETRIES: number,
    }
  } & any;

  abstract SIMULATIONS: {
    TEST_AUTH_EXPIRED: boolean
  };
  abstract isInLocalDevMode: boolean;
  abstract isInSimulationMode: boolean;
  abstract isInDevelopMode: boolean;
  abstract isInProductionMode: boolean;
}

