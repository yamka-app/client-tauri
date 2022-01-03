// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

export async function setTheme(name: string) {
    // @ts-expect-error
    const module = await import(`../themes/${name}.css`);
    const style = module.default;
    document.getElementById("theme").innerHTML = style;
    console.log("loaded theme", name);
}