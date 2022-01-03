// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import React from "react";

export interface Lang {
    [key: string]: string | Lang;
}

export var lang: Lang;
export var langInfo: {name: string, title: string, authors: string, emoji: string}[] = [];
export const fallback = "en_us";

// load lang info
function filterKeys(obj: any, allowed: string[]) {
    return Object.fromEntries(
        Object.entries(obj).filter(
            ([k, _]) => allowed.includes(k)));
}
export function listLangs() {
    // @ts-expect-error
    const files: string[] = require.context("../lang", true, /\.json$/).keys();
    // strip "./" and ".json"
    const names = files.map(x => x.slice(2).split(".")[0]);
    
    for(const name of names) {
        readLang(name).then(x => langInfo.push(
            {
                ...(filterKeys(x, ["title", "authors", "emoji"]) as {title: string, authors: string, emoji: string}),
                name
            }));
    }
}
listLangs();

export async function readLang(name: string): Promise<Lang> {
    try {
        // @ts-expect-error
        return await import(`../lang/${name}.json`);
    } catch(err) {
        console.error("unknown language", name);
        return {};
    }
}

// fills in the keys for non-existent entries in `primary`
function merge(primary: Lang, secondary: Lang): [Lang, string[]] {
    const result = {};
    var merges = [];
    for(const [k, secVal] of Object.entries(secondary)) {
        // if the key is not in `primary`, grab it from `secondary`
        if(!(k in primary)) {
            result[k] = secVal;
            merges.push(k);
            continue;
        }
        // else, recurse
        const primVal = primary[k];
        if(typeof secVal === "string") {
            result[k] = primVal;
        } else {
            const [downstream, downstreamMerges] = merge(primVal as Lang, secondary[k] as Lang);
            result[k] = downstream;
            merges = [...merges, ...downstreamMerges];
        }
    }
    return [result, merges];
}

export async function setLang(name: string): Promise<void> {
    const [result, merges] = merge(await readLang(name), await readLang(fallback));
    if(merges.length !== 0)
        console.warn(`i18n: ${merges.length} keys missing from ${name}: ${merges.join(",")}`);
    lang = result;
    console.log("set language", name);
}

export function translate(key: string, transformBreaks=false) {
    var result = getPath(lang, key);
    if(!transformBreaks)
        return result;
    // convert line breaks
    const br = React.createElement("br");
    return (result.split("\n") as any[])
        .reduce((a, x) => [...a, x, br], [])
        .slice(0, -1);
}
export function hasKey(key: string) {
    return translate(key) !== "";
}

function getPath(obj: Lang, path: string): string {
    var [head, ...tail] = path.split(".");
    if(!(head in obj))
        return "";
    const val = obj[head];
    if(tail.length === 0)
        return val as string;
    return getPath(val as Lang, tail.join("."));
}