// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import React from "react";

import "../css/radio.css";

export const CfgCtx = React.createContext({
    value: {},
    set: (k: string, v: any): void => { throw new Error("not implemented"); }
});

export class ConfigurableComponent extends React.Component {
    static contextType = CfgCtx;
    context!: React.ContextType<typeof CfgCtx>;

    getConfig(key: string) {
        return this.context.value[key];
    }

    setConfig(key: string, val: any) {
        this.context.set(key, val);
    }
}

export class Radio extends React.Component {
    props: {
        name: string;
        positions: {
            name: string;
            icon: string;
            color: string;
        }[];
        toggled: (pos: string) => void;
        value: string;
        iconSize?: number;
    }

    render() {
        return (
            <div className="radio">
                {this.props.positions.map(x => {
                    // @ts-expect-error
                    import(`../icons/${x.icon}.png`);
                    return <>
                        <input type="radio"
                            id={`${this.props.name}-${x.name}`}
                            value={x.name}
                            name={this.props.name}
                            onChange={(ev) => {
                                if(ev.target.checked)
                                    this.props.toggled(x.name);
                            }}
                            checked={this.props.value === x.name}></input>
                        <label htmlFor={`${this.props.name}-${x.name}`}
                            // @ts-expect-error
                            // "--active-color" is not a common property
                            style={{"--active-color": x.color}}>
                            <img src={`../icons/${x.icon}.png`}
                                width={this.props.iconSize ?? 16}
                                height={this.props.iconSize ?? 16} />
                        </label>
                    </>})}
            </div>
        );
    }
}