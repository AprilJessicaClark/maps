import { View, Text } from '@react-pdf/renderer';
import * as _ from 'lodash';
import React from 'react';
import { Dropdown, FormControl, InputGroup } from 'react-bootstrap';
import { styleSheet } from './App';
import { getOptions, getPlaceHolder, getSkippedLines, getValidation, hasExtraSpace } from './ValidationDecorator';

const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>
export type FocusListener<T extends object, P extends keyof T> = ((newVal: T[P], ref: ObjectForm<T>) => void);
type FormProps<T extends object> = { defaultValues: T, onLoseFocus?: { [P in keyof T]?: FocusListener<T, P> }, justLabels?: boolean }

export class ObjectForm<T extends object> extends React.Component<FormProps<T>, T>{

    createBind<keyType extends keyof T>(toBind: (keyType)) {
        let validator = getValidation(this.props.defaultValues, toBind);
        return ((e: { target: any }) => {
            let str = e.target.value;
            if (typeof this.state[toBind] == 'number') {
                str = str.replace(/[^0-9]+/g, '');
                str = str.replace(/^0+(?=\d)/, '')
                str = validator ? validator(str) : str;
                let val = Number(str.replace(/[^0-9]+/g, ''));
                this.setState(Object.fromEntries([[toBind, val]]))
                e.target.value = str;
            }
            else if (typeof this.state[toBind] == 'string') {
                str = validator ? validator(str) : str;
                e.target.value = str;
                this.setState(Object.fromEntries([[toBind, str]]))
            }
        }).bind(this);
    }



    constructor(props: FormProps<T>) {
        super(props);
        this.state = this.props.defaultValues;
        this.createBind = this.createBind.bind(this);
    }

    componentDidUpdate(prevProps: any) {
    }





    exportAsPdf() {
        const a = this.props.defaultValues!;
        return getKeys<T & object>(a).filter(p => {
                let typeOfProp = typeof this.props.defaultValues[p];
                 return (typeOfProp == "function" || typeOfProp == "number" || typeOfProp == "string")
            }
            ).map(p => {
            let currenVal = `${(typeof (this.props.defaultValues[p]) == "function" ? (this.props.defaultValues[p] as unknown as Function)(this.state) : ((this.state[p]) ?? ""))}`;



            return <View style={styleSheet.row}>
                <Text>{currenVal}</Text>
            </View>
        })
    }


    exportPdfLabels(){
        const a = this.props.defaultValues!;
        return getKeys<T & object>(a).filter(p => {
            let typeOfProp = typeof this.props.defaultValues[p];
             return (typeOfProp == "function" || typeOfProp == "number" || typeOfProp == "string")
        })
        
        
        .map(p => {
            let placeHolder = getPlaceHolder(this.props.defaultValues, p);
            return <View style={styleSheet.row}>
            <Text>{placeHolder}</Text>
            </View>

        })
    }

    renderItem<P extends keyof T>(placeHolder: string | undefined, key: P, extraSpace: boolean, onLoseFocus: FocusListener<T, P>, options?: string[]) {
        let onChange = this.createBind(key);
        let typeOfProp = typeof this.state[key];
        if (this.props.justLabels && (typeOfProp == "function" || typeOfProp == "number" || typeOfProp == "string")) {
            return <InputGroup className={extraSpace ? "formGridBigBox" : "formGridBox"}>
                <InputGroup.Text className="w-100">
                    {placeHolder}
                </InputGroup.Text>
            </InputGroup>
        }
        else if (typeOfProp == "function") {
            let a = this.state[key] as unknown as ((o: T) => any);
            return <InputGroup className="formGridBox">
                <FormControl
                    as={extraSpace ? "textarea" : undefined}
                    disabled={true}
                    value={a(this.state)}
                    placeholder={placeHolder}
                    onBlur={() => onLoseFocus(this.state[key], this)}
                    onChange={onChange}>
                </FormControl>
            </InputGroup>
        }
        else if (options?.length) {
            return <InputGroup key={placeHolder} className="formGridBox">
                <Dropdown
                    onBlur={() => onLoseFocus(this.state[key], this)}
                >
                    <Dropdown.Toggle variant="light" className="w-100">
                        {(this.state[key] as unknown as string)?.length ? this.state[key] : placeHolder}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                        {options.map(o =>
                            <Dropdown.Item key={o} value onSelect={e => {
                                this.setState(Object.fromEntries([[key, o]]))
                            }}>
                                {o}
                            </Dropdown.Item>)}
                    </Dropdown.Menu>
                </Dropdown>
            </InputGroup>
        }
        else if (typeOfProp == "string" || typeOfProp == "number") {
            return <InputGroup className={extraSpace ? "formGridBigBox" : "formGridBox"}>
                <FormControl
                    as={extraSpace ? "textarea" : undefined}
                    placeholder={placeHolder}
                    onChange={onChange}
                    onBlur={() => onLoseFocus(this.state[key], this)}>
                </FormControl>
            </InputGroup>

        }

    }

    render() {
        return <div className="mb-3">
            {getKeys(this.props.defaultValues || {}).map((key: (keyof T), i) => {
                let options = getOptions(this.props.defaultValues, key);
                let placeHolder = getPlaceHolder(this.props.defaultValues, key);
                let extraSpace = hasExtraSpace(this.props.defaultValues, key);
                let onLoseFocus: FocusListener<T, typeof key> = () => { };
                if (this.props.onLoseFocus) {
                    onLoseFocus = this.props.onLoseFocus[key] ?? onLoseFocus;
                }
                let skipped = _.times(getSkippedLines(this.props.defaultValues, key), i =>
                    <InputGroup key={i} className="mb-3">
                        <InputGroup.Text className="w-100">
                            <p></p>
                        </InputGroup.Text>
                    </InputGroup>);
                return <div key={key.toString()}>
                    {skipped}
                    {this.renderItem(placeHolder, key, extraSpace, onLoseFocus, options)}
                </div>
            }

            )}
        </div>
    }
}