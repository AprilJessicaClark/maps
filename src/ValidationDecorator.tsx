import * as _ from 'lodash'

const validateMetadataKey = Symbol("validate");
const placeHolderMetadataKey = Symbol("placeHolder");
const optionsMetadataKey = Symbol("options");
const skipLinesKey = Symbol("skipLines");
const extraSpaceKey = Symbol("extraSpace")

export function skipLines(toSkip: number) {
    return Reflect.metadata(skipLinesKey, toSkip);
}

export function getSkippedLines<T>(target: T, propertyKey: keyof T) : number{
    return  Reflect.getMetadata(skipLinesKey, target, propertyKey.toString()) ?? 0;
}

export const extraSpace = Reflect.metadata(extraSpaceKey, true);


export function hasExtraSpace<T>(target: T, propertyKey: keyof T) : boolean{
    return  Reflect.getMetadata(extraSpaceKey, target, propertyKey.toString()) ?? false;
}


export function validate(validate : (val: string) => string) {
    return Reflect.metadata(validateMetadataKey, validate);
}

export function getValidation<T>(target: T, propertyKey: keyof T) : ((str: string) => string){
    return  Reflect.getMetadata(validateMetadataKey, target, propertyKey.toString()) ?? ((str: string) => str);
}

export function options(optionNames : string[]){
    return Reflect.metadata(optionsMetadataKey, optionNames);
}

export function getOptions<T>(target: T, propertyKey: keyof T) : string[] | undefined{
    return  Reflect.getMetadata(optionsMetadataKey, target, propertyKey.toString());
}

export function placeHolder(placeHolderText : string){
    return Reflect.metadata(placeHolderMetadataKey, placeHolderText);
}

export function getPlaceHolder<T>(target: T, propertyKey: keyof T) : string {
    return Reflect.getMetadata(placeHolderMetadataKey, target, propertyKey.toString()) ?? _.startCase(propertyKey.toString());
}