// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import React from "react";

export interface ConfigSpec {
    [tabName: string]: {
        title: string;
        icon: string;

        settings: {
            [settingName: string]: {
                title: string;
                type: "text" | "range" | "toggle" | "color" | "text_list";
                default: any;
                danger?: string;
            }
        }
    }
}

export const spec: ConfigSpec = {
    "window": {
        title: "Window",
        icon: "window",
        settings: {
            "blurIfUnfocused": {
                title: "Blur if unfocused",
                type: "toggle",
                default: false
            }
        }
    },
    "connection": {
        title: "Connection",
        icon: "connection",
        settings: {
            "realm": {
                title: "Main server",
                type: "text",
                default: "api.yamka.app",
                danger: "Only change if you know what you're doing"
            },
            "user": {
                title: "Secondary servers",
                type: "text_list",
                default: []
            }
        }
    }
};

export var config: { [name: string]: any } = {};
// default values
for(const tab in spec) {
    for(const set in spec[tab].settings) {
        const defaultVal = spec[tab].settings[set].default;
        if(defaultVal !== undefined)
            config[`${tab}.${set}`] = defaultVal;
    }
}
console.log("init'd config", config);

export function configSet(setting: string, value?: any) {
    config[setting] = value;
    console.log("updated setting", setting, value);
}

export const CfgContext = React.createContext({});