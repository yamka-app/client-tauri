// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

export function setTheme(name: string, custom = false) {
    if(custom) {
        // document.getElementById("custom-theme").setAttribute("href", `file://${name}`);
        throw new Error("custom themes are not yet implemented");
        return;
    }

    document.getElementById("custom-theme").setAttribute("href", "");
    // @ts-expect-error
    import(`../css/themes/${name}.css`);
}