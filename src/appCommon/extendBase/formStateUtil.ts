import {VForm} from "~/appCommon/types/vformTypes";
import TFormKey = VForm.TFormKey;

import {computed} from "~/appCommon/base/vueTypes";


export type TFormFieldOption = Omit<VForm.TFormField<any, any>, 'name' | 'value'> & {name?: string, value?: any};


export function FormField(option: TFormFieldOption): TFormFieldOption{
  option.name ??= option.dataKey as string;
  option.value ??= undefined;
  option.fieldType ??= "text";
  return option;
}

export function HiddenField(option: {dataKey: string, value?: any}): TFormFieldOption{
  return FormField({
    dataKey: option.dataKey as any,
    name: option.dataKey as string,
    value: option.value ?? undefined,
    label: computed(()=>""),
    rule: "optional",
    placeholder: computed(()=>""),
    hidden: true
  });
}


export function createFormState<T, E>(option: Record<string, TFormFieldOption>){
  return option;
}



