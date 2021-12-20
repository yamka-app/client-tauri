// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import React from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { getCurrent } from "@tauri-apps/api/window";
import { setTheme } from "./theme";

import "../css/app.css";
import "../css/status-bar.css";
import "../icons/settings.png";
import "../icons/minimize.png";
import "../icons/maximize.png";
import "../icons/close.png";

setTheme("light");

const win = getCurrent();

export class StatusBarButton extends React.Component {
    props: { image: string, click?: () => any };

    render() {
        return (
            <button onClick={this.props.click}>
                <img src={this.props.image}></img>
            </button>
        );
    }
}

export class StatusBar extends React.Component {
    render() {
        return (
            <div id="status-bar">
                <StatusBarButton image="icons/settings.png"/>
                <span>Yamka (alpha)</span>
                <div className="filler"></div>
                <StatusBarButton image="icons/minimize.png" click={() => win.minimize()}/>
                <StatusBarButton image="icons/maximize.png" click={() =>
                    win.isMaximized().then((m) => m ? win.unmaximize() : win.maximize())}/>
                <StatusBarButton image="icons/close.png" click={() => win.close()}/>
            </div>
        );
    }
}

export class App extends React.Component {
    render() {
        return (
            <>
                <StatusBar/>
                <h1>Not much here</h1>
            </>
        );
    }
}