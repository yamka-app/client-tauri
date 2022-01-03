// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import React, { MouseEventHandler, ReactElement, Ref } from "react";

import "../css/radio.css";
import "../css/tooltip.css";

export const CfgCtx = React.createContext({
    value: {},
    set: (k: string, v: any): void => { throw new Error("not implemented"); }
});

// A React.Component that has convenient interfaces to the global config
export class ConfigurableComponent<P = {}, S = {}, SS = any> extends React.Component<P, S, SS> {
    static contextType = CfgCtx;
    context!: React.ContextType<typeof CfgCtx>;

    getConfig(key: string) {
        return this.context.value[key];
    }

    setConfig(key: string, val: any) {
        this.context.set(key, val);
    }
}

// Stylish radio switch
export class Radio extends React.Component<
        { name: string,
          positions: {
              name: string;
              icon: string;
              color: string;
          }[],
          toggled: (pos: string) => void,
          value: string,
          iconSize?: number },
        {}> {

    render() {
        return <div className="radio">
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
        </div>;
    }
}

// Tooltip container
export class Tooltip extends React.Component<
        {text: string},
        {bubble: ReactElement, bubbleRef: React.RefObject<TooltipBubble>}> {

    constructor(props: {text: string}) {
        super(props);
        this.setState({});
    }

    render() {
        // 1. create a TooltipBubble when the mouse hovers over the element
        // 2. adjust its position whenever it moves
        // 3. destroy the TooltipBubble when the mouse leaves the element
        return <span className="tooltip-wrapper"
                    onMouseEnter={() => this.enter()}
                    onMouseLeave={() => this.leave()}
                    // @ts-expect-error
                    // i don't...
                    onMouseMove={(e) => this.move(e)}>
            {this.props.children}
            {this.state?.bubble ?? <></>}
        </span>;
    }

    enter() {
        const ref: Ref<TooltipBubble> = React.createRef();
        const bubble = <TooltipBubble text={this.props.text} ref={ref}/>;
        this.setState({ bubble, bubbleRef: ref });
    }

    leave() {
        const bubble = this.state.bubbleRef.current;
        if(bubble) {
            setTimeout(() => this.setState({ bubble: null }), 100);
            bubble.decay();
        }
    }

    move(event: MouseEvent) {
        const bubble = this.state.bubbleRef.current;
        if(bubble)
            bubble.setPos(event.clientX, event.clientY);
    }
}

// Tooltip bubble
export class TooltipBubble extends React.Component<{text: string}, {x: number, y: number}> {
    ref: React.RefObject<HTMLDivElement>;

    constructor(props: {text: string}) {
        super(props);
        this.ref = React.createRef();
    }

    render() {
        return <div className="tooltip-bubble" ref={this.ref}>
            {this.props.text}
        </div>;
    }

    setPos(x: number, y: number) {
        const ref = this.ref.current;
        ref.style.opacity = "1";

        // flip the bubble around if it won't fit inside the viewport
        const bw = ref.clientWidth;
        const bh = ref.clientHeight;
        const ww = window.innerWidth;
        const wh = window.innerHeight;

        const xright  = (x + bw) > ww;
        const ybottom = (y + bh) > wh;

        if (xright) ref.style.right  = `${ww - x}px`;
               else ref.style.left   = `${x}px`;
        if(ybottom) ref.style.bottom = `${wh - y}px`;
               else ref.style.top    = `${y}px`;

        this.setState({ x, y });
    }

    decay() {
        this.ref.current.style.opacity = "0";
    }
}