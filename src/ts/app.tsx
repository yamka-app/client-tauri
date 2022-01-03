// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import React from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { getCurrent } from "@tauri-apps/api/window";
import Twemoji from "react-twemoji";

import { setTheme } from "./theme";
import Settings from "./settings";
import * as config from "./config";
import { CfgCtx } from "./util";
import { translate } from "./i18n";

import "../css/app.css";
import "../css/status-bar.css";
import "../icons/settings.png";
import "../icons/minimize.png";
import "../icons/maximize.png";
import "../icons/close.png";

setTheme("dark");

const win = getCurrent();

export class StatusBarButton extends React.Component<
        { image: string, click?: () => any },
        {}> {

    render() {
        return <button onClick={this.props.click}>
            <img src={this.props.image}></img>
        </button>;
    }
}

export class StatusBar extends React.Component<
        { openSettings?: () => any },
        {}> {

    render() {
        return <div id="status-bar" data-tauri-drag-region>
            <StatusBarButton image="icons/settings.png" click={this.props.openSettings}/>
            <span>Yamka (alpha)</span>
            <div className="filler"></div>
            <StatusBarButton image="icons/minimize.png" click={() => win.minimize()}/>
            <StatusBarButton image="icons/maximize.png" click={() =>
                win.isMaximized().then((m) => m ? win.unmaximize() : win.maximize())}/>
            <StatusBarButton image="icons/close.png" click={() => win.close()}/>
        </div>;
    }
}

interface AppState {
    settingsOpen: boolean,
    config: {
        value: any,
        set: (key: string, val: any) => Promise<void>
    }
}
export class App extends React.Component<{}, AppState> {
    state = {
        settingsOpen: false,
        config: {
            value: config.config,
            set: async (key: string, val: any) => {
                await config.set(key, val);
                this.setState({
                    config: {
                        ...this.state.config,
                        value: config.config
                    }
                });
            }
        }
    };

    render() {
        return <CfgCtx.Provider value={this.state.config}>
            <StatusBar openSettings={() => this.setState({...this.state, settingsOpen: true})}/>
            {this.state.settingsOpen ? <Settings
                transition={200}
                spec={config.spec}
                close={() => this.setState({...this.state, settingsOpen: false})}/>
                : null}
            <h1>Not much here</h1>
        </CfgCtx.Provider>;
    }

    componentDidMount() {
        // load config
        config.load().then(() => {
            this.setState({
                config: {
                    ...this.state.config,
                    value: config.config
                }
            });
        });
    }
}