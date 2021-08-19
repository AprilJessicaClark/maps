import * as _ from 'lodash';
import React from 'react';
import { Dropdown, FormControl, InputGroup } from 'react-bootstrap';
import { getOptions, getPlaceHolder, getSkippedLines, getValidation, hasExtraSpace } from './ValidationDecorator';

const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>
type FocusListener<T,P extends keyof T> = ((newVal : T[P], ref : ObjectForm<T>) => void);
type FormProps<T> = { defaultValues: T, onLoseFocus? : {[P in keyof T]?: FocusListener<T,P>} };

export class ObjectForm<T> extends React.Component<FormProps<T>, T>{

    createBind<keyType extends keyof T>(toBind: (keyType)) {
        let validator = getValidation(this.props.defaultValues, toBind);
        return ((e: { target: any }) => {
            let str = e.target.value;
            if (typeof this.state[toBind] == 'number') {
                str = str.replace(/[^0-9]+/g, '');
                str = str.replace(/^0+(?=\d)/, '')
                let val = Number(str);
                this.setState(Object.fromEntries([[toBind, val]]))
                e.target.value = validator ? validator(str) : str;
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



    exportAsPdf(){
        
    }

    renderItem<P extends keyof T>( placeHolder: string | undefined, key: P, extraSpace: boolean,  onLoseFocus : FocusListener<T,P>, options? : string[]){
        let onChange = this.createBind(key);


        if (typeof this.state[key] == "function") {
            let a = this.state[key] as unknown as ((o: T) => any);
            return <InputGroup>
                <InputGroup.Text className="w-25" >
                    {placeHolder}
                </InputGroup.Text>
                <FormControl
                    as= {extraSpace ? "textarea" : undefined}
                    disabled={true}
                    value={a(this.state)}
                    placeholder={placeHolder}
                    onBlur={() => onLoseFocus(this.state[key], this)}
                    onChange={onChange}>
                </FormControl>
            </InputGroup>
        }
        else if (options?.length) {
            return <InputGroup key={placeHolder}>
                <InputGroup.Text  className="w-25" >
                    {placeHolder}
                </InputGroup.Text>
                <Dropdown
                    onBlur={() => onLoseFocus(this.state[key], this)}
                >
                    <Dropdown.Toggle className="w-75">
                        {(this.state[key] as unknown as string)?.length ? this.state[key] : "Select"}
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
        else if(typeof this.state[key] == "string" || typeof this.state[key] == "number"){
            return <InputGroup >
                <InputGroup.Text className="w-25">
                    {placeHolder}
                </InputGroup.Text>
                <FormControl
                    as= {extraSpace ? "textarea" : undefined}
                    placeholder={placeHolder}
                    onChange={onChange}
                    onBlur={() => onLoseFocus(this.state[key], this)}>
                </FormControl>
            </InputGroup>

        }
    }

    render() {
        return <div className="mb-3">
            {getKeys(this.props.defaultValues || {}).map((key : (keyof T)) => {
                let options = getOptions(this.props.defaultValues, key);
                let placeHolder = getPlaceHolder(this.props.defaultValues, key);
                let extraSpace = hasExtraSpace(this.props.defaultValues, key);
                let onLoseFocus : FocusListener<T, typeof key> = () => {};
                if(this.props.onLoseFocus){
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
                    {this.renderItem(placeHolder,key,extraSpace, onLoseFocus, options)}
                </div>
            }

            )}
        </div>
    }
}