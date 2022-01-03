// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import React, { Children } from "react";
import Twemoji from "react-twemoji";

import * as config from "./config";

import "../css/app.css";
import "../css/settings.css";
import "../icons/danger.png";
import "../icons/info.png";
import "../icons/add_row.png";
import "../icons/rm_row.png";
import { ConfigurableComponent, Radio, Tooltip } from "./util";
import { hasKey, langInfo, translate } from "./i18n";

class Bar extends ConfigurableComponent {
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

class Setting extends ConfigurableComponent {
    props: {
        name: string;
        spec: config.ConfigSpec[string]["items"][string];
        update: (value: any) => any;
    };
    state: {
        value: any
    };

    renderInput() {
        const spec = this.props.spec;
        const name = this.props.name;
        const value = this.state?.value ?? this.getConfig(name);

        if(spec.type === "text") {
            return (
                <input
                    value={value}
                    onChange={(e) => this.update(e.target.value)}
                    onBlur={(e) => this.update(e.target.value, true)}></input>
            );
        }

        if(spec.type === "text_list") {
            return (
                <>
                    {(value as string[]).map((x, i, a) => 
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <button className="add-item"
                                    style={{ marginTop: "5px" }}
                                    onClick={() => this.update(value.filter((_, idx) => idx !== i), true)
                                    }><img src="icons/rm_row.png"/></button>
                            <input
                                key={i}
                                value={x}
                                onChange={(e) => {
                                    const arr = a.slice();
                                    arr[i] = e.target.value;
                                    this.update(arr);
                                }}
                                onBlur={(e) => this.update(a, true)}></input>
                        </div>
                    )}
                    <button className="add-item"
                            onClick={() => this.update([...value, ""], true)
                            }><img src="icons/add_row.png"/></button>
                </>
            );
        }

        if(spec.type === "lang_list") {
            return (
                <ul className="lang-list">
                    {langInfo.map(lang =>
                        <LangSelector
                            key={lang.name}
                            title={lang.title}
                            emoji={lang.emoji}
                            selected={value === lang.name}
                            onSelected={() => this.update(lang.name, true)}/>)}
                </ul>
            );
        }

        if(spec.type === "toggle") {
            return (
                <Radio name={this.props.name}
                       positions={[
                           { name: "off", icon: "cross", color: "#ff2c38" },
                           { name: "on", icon: "checkmark", color: "#23cd51" }
                       ]}
                       value={value ? "on" : "off"}
                       toggled={(val: string) => this.update(val === "on", true)}/>
            )
        }
    }

    render() {
        const i18nKey = `settings.tab.${this.props.name}`;
        return (
            <li className={"setting" + (this.props.spec.danger ? " danger" : "")}>
                <span className="title">
                    {translate(i18nKey)}
                    {this.props.spec.danger ? <Tooltip text={translate(i18nKey + "_danger")}>
                        <img src="icons/danger.png"/>
                    </Tooltip> : null}
                    {hasKey(i18nKey + "_info") ? <Tooltip text={translate(i18nKey + "_info")}>
                        <img src="icons/info.png"/>
                    </Tooltip> : null}
                </span>
                {this.renderInput()}
            </li>
        );
    }

    update(value: any, final: boolean = false) {
        if(final)
            this.props.update(value);
        this.setState({ value });
    }
}

class LangSelector extends React.Component {
    props: {
        title: string;
        emoji: string;
        selected: boolean;
        onSelected: () => void;
    }

    render() {
        return (
            <li className={this.props.selected ? "selected" : ""} onClick={this.props.onSelected}>
                <span className="align-emoji">
                    <Twemoji options={{ className: "emoji" }} tag="twemoji">{this.props.emoji}</Twemoji>
                    <span>{this.props.title}</span>
                </span>
            </li>
        );
    }
}

class List extends ConfigurableComponent {
    props: {
        name: string;
        title: string;
        settings: config.ConfigSpec[string]["items"];
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

export default class Settings extends ConfigurableComponent {
    props: {
        spec: config.ConfigSpec;
        close: () => any;
        transition: number;
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
                        this.setState({ tab });
                }}/>
                <List
                    name={this.state.tab}
                    title={translate(`settings.tab.${this.state.tab}.title`)}
                    settings={tab.items}
                    update={(name, val) =>
                        this.setConfig(`${this.state.tab}.${name}`, val)}/>
            </div>
        );
    }

    close() {
        this.setState({ slidingIn: false });
        setTimeout(this.props.close, this.props.transition);
    }

    componentDidMount() {
        this.setState({ slidingIn: true });
    }
}