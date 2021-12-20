// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import React, { Children } from "react";

import * as config from "./config";

import "../css/app.css";
import "../css/settings.css";
import "../icons/danger.png";
import "../icons/add_row.png";
import "../icons/rm_row.png";

class Bar extends React.Component {
    props: {
        tabs: { [name: string]: string };
        onClick: (tab: string) => any;
        current: string;
    };

    render() {
        for(const [_, icon] of Object.entries(this.props.tabs)) {
            // @ts-expect-error
            import(`../icons/setting-tabs/${icon}.png`);
        }

        return (
            <div className="settings-bar">
                {Object.entries(this.props.tabs).map(([k, v]) =>
                    <button onClick={() => this.props.onClick(k)}
                            className={this.props.current === k ? "open" : ""}>
                        <img src={`../icons/${v}.png`}></img>
                    </button>
                )}
            </div>
        );
    }
}

class Setting extends React.Component {
    props: {
        name: string;
        spec: config.ConfigSpec[string]["settings"][string];
        update: (value: any) => any;
    };
    state: {
        value: any;
    };

    static contextType = config.CfgContext;
    renderInput() {
        const spec = this.props.spec;
        const name = this.props.name;
        const ctx = this.context;

        if(spec.type === "text") {
            return (
                <input
                    value={ctx[name]}
                    onChange={(e) => this.update(e.target.value)}></input>
            );
        }

        if(spec.type === "text_list") {
            return (
                <>
                    {(ctx[name] as string[]).map((x, i, a) => 
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <button className="add-item"
                                    style={{ marginTop: "5px" }}
                                    onClick={() => this.update(ctx[name].filter((_, idx) => idx !== i))
                                    }><img src="icons/rm_row.png"/></button>
                            <input
                                key={i}
                                value={x}
                                onChange={(e) => {
                                    const arr = a.slice();
                                    arr[i] = e.target.value;
                                    this.update(arr);
                                }}></input>
                        </div>
                    )}
                    <button className="add-item"
                            onClick={() => this.update([...ctx[name], ""])
                            }><img src="icons/add_row.png"/></button>
                </>
            );
        }
    }

    render() {
        return (
            <li className={"setting" + (this.props.spec.danger ? " danger" : "")}>
                <span className="title">
                    {this.props.spec.title}
                    {this.props.spec.danger ? <abbr title={this.props.spec.danger}>
                        <img src="icons/danger.png"/>
                    </abbr> : null}
                </span>
                {this.renderInput()}
            </li>
        );
    }

    update(value: any) {
        this.props.update(value);
        this.setState({ value });
    }
}

class List extends React.Component {
    props: {
        name: string;
        title: string;
        settings: config.ConfigSpec[string]["settings"];
        update: (name: string, value: any) => any;
    };

    render() {
        return (
            <ul className="settings-list">
                <li className="settings-list-title">{this.props.title}</li>
                {Object.entries(this.props.settings).map(([k, v]) =>
                    <Setting
                        name={`${this.props.name}.${k}`}
                        key={k}
                        spec={v}
                        update={(val) => this.props.update(k, val)}/>)}
            </ul>
        );
    }
}

export default class Settings extends React.Component {
    props: {
        spec: config.ConfigSpec;
        close: () => any;
        transition: number;
        update: (name: string, value: any) => any
    };
    state: {
        slidingIn: boolean;
        tab: string;
    };

    constructor(props) {
        super(props);
        // open the first tab
        this.state = {
            slidingIn: true,
            tab: Object.entries(props.spec)[0][0]
        }
    }

    render() {
        const tabs = {
            back: "back",
            ...Object.fromEntries(Object.entries(this.props.spec).map(([k, v]) => [k, v.icon]))
        };
        const tab = this.props.spec[this.state.tab];

        const inOut = this.state.slidingIn ? "in" : "out";
        const outIn = this.state.slidingIn ? "out" : "in";
        return (
            <div className="settings" style={{
                animation: `${this.props.transition}ms ease-${outIn} slide-${inOut}`
            }}>
                <Bar tabs={tabs} current={this.state.tab} onClick={(tab) => {
                    if(tab === "back")
                        this.close();
                    else
                        this.setState({ ...this.state, tab });
                }}/>
                <List
                    name={this.state.tab}
                    title={tab.title}
                    settings={tab.settings}
                    update={(name, val) =>
                        this.props.update(`${this.state.tab}.${name}`, val)}/>
            </div>
        );
    }

    close() {
        this.setState({ ...this.state, slidingIn: false });
        setTimeout(this.props.close, this.props.transition);
    }

    componentDidMount() {
        this.setState({ ...this.state, slidingIn: true });
    }
}