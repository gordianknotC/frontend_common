import dayjs from "dayjs";

import {is} from "~/appCommon/extendBase/impls/utils/typeInferernce";
import {NotImplementedError} from "~/appCommon/base/baseExceptions";
import {assert, assertMsg} from "~/appCommon/extendBase/impls/utils/assert";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {LazyHolder} from "~/appCommon/base/baseFacadeTypes";
import {getAppConfigs} from "~/appCommon/extendBase/appConfigs";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const forWebpackReloadingTypescript = "";
export enum EDatePreset{
  TODAY="1",
  LAST_WEEK="2",
  THIS_WEEK="3",
  LAST_MONTH="4",
  THIS_MONTH="5",
}



type TDatetimeUnit =
  "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "month"
  | "year"
  | "date"
  | "d"
  | "M"
  | "y"
  | "h"
  | "m"
  | "s"
  | "ms"
  | "week"
  | "w";


const getRangeDateOfDayjs = (target: dayjs.Dayjs, type: TDatetimeUnit): dayjs.Dayjs[] => {
  if (!dayjs.isDayjs(target)) {
    return [];
  }
  let from_date: dayjs.Dayjs;
  let to_date: dayjs.Dayjs;
  from_date = target.startOf(type);
  to_date = target.endOf(type);
  if (type == "week") {
    /** 由週一到週日 */
    const fromDayOfWeek = target.day();
    const isSunday      = fromDayOfWeek == 0;
    if (isSunday){
      /** 找上週 shift + 1 day*/
      from_date = target.subtract(1, "day").startOf(type).add(1, "day");
      to_date = target.subtract(1, "day").endOf(type).add(1, "day");
    }else{
      from_date = target.startOf(type).add(1, "day");
      to_date = target.endOf(type).add(1 , "day");
    }
  }

  return [from_date, to_date]
}

const _MS_PER_SECOND = 1000;
const _MS_PER_MINUTE = _MS_PER_SECOND * 60;
const _MS_PER_HOUR = _MS_PER_MINUTE * 60;
const _MS_PER_DAY = _MS_PER_HOUR * 24;
const _MS_PER_YEAR = _MS_PER_DAY * 365;

export class DateDiff {
  static get day(): number {
    return _MS_PER_DAY;
  }

  static get month(): number {
    return _MS_PER_DAY * 30;
  }

  static get year(): number {
    return _MS_PER_DAY * 30 * 12;
  }

  a: Date;
  b: Date;
  diff: number;

  constructor(a: Date, b: Date) {
    this.a = a;
    this.b = b;
    this.diff = a.getTime() - b.getTime();
  }

  get inYears(): number {
    return Math.floor(this.diff / _MS_PER_YEAR);
  }

  get inDays(): number {
    return Math.floor(this.diff / _MS_PER_DAY);
  }

  get inMinutes(): number {
    return Math.floor(this.diff / _MS_PER_MINUTE);
  }

  get inSeconds(): number {
    return Math.floor(this.diff / _MS_PER_SECOND)
  }
}

function tryParse(a: Date | string): Date {
  if (is.type(a, Date.name))
    return a as Date;
  return new Date(Date.parse(a as string));
}

export class ObjectExt {
  /**
   * 擴展 Object.assign 並多了更新功能 （option.updater)
   *
   * @param option.assignee - 同 Object.assign 第一個參數
   * @param option.assignor - 同 Object.assign 第二個參數
   * @param option.updater  - 更新 object
   * @param option.skipUndefined - 指定當更新 object 時是否跳過 undefined 者
   * */
  static assign<E extends object, U extends object>(option: {
    assignee: object, assignor: E, updater?: Partial<E> & U, skipUndefined?: boolean
  } = {
    assignee: {}, assignor: {} as E, updater: {} as Partial<E> & U, skipUndefined: false
  }): E {
    const {assignee, assignor, updater, skipUndefined} = option;
    const result: any = Object.assign(assignee, assignor);
    if (is.empty(updater)){
      return result;
    }else{
      Object.keys(updater!).forEach((element) => {
        const val = updater![element as keyof typeof updater];
        if (skipUndefined && is.undefined(val)){
        }else{
          result[element as keyof typeof result] = val;
        }
      })
      return result;
    }
  }

  /** 同 Object.assign, 但可指定 assign 什麼 key, 是否 skipUndefined */
  static assignByKeys<E extends object>(option: {
    assignee: object, assignor: E, keys: Partial<keyof E>[], skipUndefined?: boolean
  } = {
    assignee: {}, assignor: {} as E, keys: [] as Partial<keyof E>[], skipUndefined: false
  }): Partial<E> {
    const {assignee, assignor, keys, skipUndefined} = option;
    let result: Partial<E> = {};
    Object.keys(assignor).forEach((element) => {
      const val = assignor[element as keyof E];
      if (skipUndefined && is.undefined(val)) {
        // pass
      }else{
        if (option.keys.contains(element as keyof E)){
          result[element as keyof E] = val;
        }
      }
    });
    return result;
  }

  static omitUndefined<T extends object>(obj: T): Partial<T>{
    if (is.not.initialized(obj) || is.empty(obj)){
      return obj;
    }
    let result:T = {} as T;
    Object.keys(obj).forEach((element) => {
      const val = obj[element as keyof T];
      if (is.undefined(val)){
        delete result[element as keyof T];
      }
    });
    return result;
  }
}


export class DateExtension {
  _pseudoEventTime?: Date;
  _appInitialTime?: Date;

  constructor(
    public labelFormatter: string,
    public queryFormatter: string,
    public guessTimezone: boolean
  ){
    if (guessTimezone){
      dayjs.tz.setDefault(this.timezone);
    }
  }

  get now(): Date {
    return new Date(Date.now());
  }

  get envNow(): Date {
    assert(is.initialized(this._pseudoEventTime), assertMsg.appEnvNotInitialized);
    assert(is.initialized(this._appInitialTime), assertMsg.appEnvNotInitialized);
    throw new NotImplementedError();
  }

  setAppInitialTime(date: Date) {
    this._appInitialTime = date;
  }

  setPseudoEventTime(date: Date) {
    this._pseudoEventTime = date;
  }

  clearPseudoEventTime() {
    this._pseudoEventTime = undefined;
  }

  fromQueryString(dateString: string): Date {
    if (this.guessTimezone){
      return dayjs.tz(dateString, this.queryFormatter, this.timezone).toDate();
    }else{
      return new Date(Date.parse(dateString));
    }
  }

  toDateStringForLabel(date: Date) {
    if (this.guessTimezone){
      return dayjs.tz(date).format(this.labelFormatter);
    }else{
      return dayjs(date).format(this.labelFormatter);
    }
  }

  toDateStringForQuery(date: Date): string {
    if (this.guessTimezone){
      return dayjs.tz(date).format(this.queryFormatter);
    }else{
      return dayjs(date).format(this.queryFormatter);
    }
  }

  isWithin(o: Date | string, rangeFrom: Date | string, rangeTo: Date | string): boolean {
    o = tryParse(o);
    rangeFrom = tryParse(rangeFrom);
    rangeTo = tryParse(rangeTo);
    const d1 = this.difference(o, rangeFrom).diff;
    const d2 = this.difference(o, rangeTo).diff;
    return (d1 > 0) && (d2 < 0);
  }

  difference(date1: Date, date2: Date): DateDiff {
    return new DateDiff(date1, date2);
  }

  subtract(date: Date, diff: number): Date {
    let time = date.getTime() - diff;
    return new Date(time);
  }

  toQueryString(date: Date): string {
    if (this.guessTimezone){
      return dayjs.tz(date).format(this.queryFormatter);
    }else{
      return dayjs(date).format(this.queryFormatter);
    }
  }

  toLabelString(date: Date): string {
    if (this.guessTimezone){
      return dayjs.tz(date).format(this.labelFormatter);
    }else{
      return dayjs(date).format(this.labelFormatter);
    }
  }


  get timezone(){
    return dayjs.tz.guess();
  }

  get today(): dayjs.Dayjs{
    if (this.guessTimezone){
      return dayjs.tz(this.now);
    }else{
      return dayjs();
    }
  }

  get TODAY(): string {
    return this.today.format(this.labelFormatter);
  }

  get yesterday(): dayjs.Dayjs{
    if (this.guessTimezone){
      return dayjs.tz(this.now).subtract(1, "day");
    }else{
      return dayjs().subtract(1, "day");
    }
  }
  get last7Day(): dayjs.Dayjs{
    if (this.guessTimezone){
      return dayjs.tz(this.now).subtract(7, "day");
    }else{
      return dayjs().subtract(7, "day");
    }
  }
  get last30Day(): dayjs.Dayjs{
    if (this.guessTimezone){
      return dayjs.tz(this.now).subtract(30, "day");
    }else{
      return dayjs().subtract(30, "day");
    }
  }


  get YESTERDAY(): string {
    return this.yesterday.format(this.labelFormatter);
  }

  pthisWeek(shift: number): dayjs.Dayjs[] {
    if (this.guessTimezone){
      return getRangeDateOfDayjs(dayjs.tz(this.now).add(shift, "day"), "week");
    }else{
      return getRangeDateOfDayjs(dayjs().add(shift, "day"), "week");
    }
  }

  get thisWeek(): dayjs.Dayjs[] {
    if (this.guessTimezone){
      return getRangeDateOfDayjs(dayjs.tz(this.now), "week");
    }else{
      return getRangeDateOfDayjs(dayjs(), "week");
    }
  }

  get THIS_WEEK(): string[] {
    return this.thisWeek.map((_)=>_.format(this.labelFormatter));
  }

  pTHIS_WEEK(shift: number = 0): string[] {
    return this.pthisWeek(shift).map((_)=>_.format(this.labelFormatter));
  }

  get lastWeek(): dayjs.Dayjs[] {
    if (this.guessTimezone){
      return getRangeDateOfDayjs(dayjs.tz(this.now).subtract(1, "week"), "week");
    }else{
      return getRangeDateOfDayjs(dayjs().subtract(1, "week"), "week");
    }
  }

  get LAST_WEEK(): string[] {
    return this.lastWeek.map((_)=>_.format(this.labelFormatter));
  }

  get thisMonth(): dayjs.Dayjs[] {
    if (this.guessTimezone){
      return getRangeDateOfDayjs(dayjs.tz(this.now), "month");
    }else{
      return getRangeDateOfDayjs(dayjs(), "month");
    }
  }

  get THIS_MONTH(): string[] {
    return this.thisMonth.map((_)=>_.format(this.labelFormatter));
  }

  get lastMonth(): dayjs.Dayjs[] {
    if (this.guessTimezone){
      return getRangeDateOfDayjs(dayjs.tz(this.now).subtract(1, "month"), "month");
    }else{
      return getRangeDateOfDayjs(dayjs().subtract(1, "month"), "month");
    }
  }

  get LAST_MONTH(): string[] {
    return this.lastMonth.map((_)=>_.format(this.labelFormatter));
  }

  yearsAgo(year: number): dayjs.Dayjs[]{
    if (this.guessTimezone){
      return getRangeDateOfDayjs(dayjs.tz(this.now).subtract(year, "year"), "year");
    }else{
      return getRangeDateOfDayjs(dayjs().subtract(year, "year"), "year");
    }
  }

  YEARS_AGO(year: number): string[] {
    return this.yearsAgo(year).map((_)=>_.format(this.labelFormatter));
  }

  asMultiLineDate(dateString: string){
    if (is.undefined(dateString)) {
      return dateString
    }
    const segments = dateString!.split(" ");
    return `${segments.first}\n${segments.slice(1).join(" ")}`;
  }
}

export const DateExt = LazyHolder<DateExtension>(()=>new DateExtension(
  getAppConfigs()!.DATE_TEMPLATE_FOR_QUERY,
  getAppConfigs()!.DATE_TEMPLATE_FOR_QUERY,
  true,
));
