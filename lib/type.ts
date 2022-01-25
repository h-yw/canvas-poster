import { type } from "os";

export interface PosterConfig {
    width: number;
    height: number;
    type: string;
    ratio:number;
    openEvent?: boolean;
    onClick?: (e: MouseEvent) => void;
}
export interface TextConfig {
    type: string;
    text: string;
    font?: string;
    color?: string;
    x: number;
    y: number;
    textAlign?: CanvasTextAlign;
    lineHeight?: number;
    totalLine?: number;
    maxWidth?: number;
    events?:[string, Function][];
}
export interface ImageConfig {
    type: string;
    image: CanvasImageSource | string;
    x: number;
    y: number;
    width: number;
    height: number;
    dx: number | undefined;
    dy: number | undefined;
    dWidth: number | undefined;
    dHeight: number | undefined;
    borderRadius: number | undefined;
    events?:[string, Function][];
}

export type SourceType = 'image' | 'text';
export type DrawProps= {
    type: SourceType;
    source: CanvasImageSource | string;
    x: number;
    y: number;
    width: number;
    height: number;
    dx?: number;
    dy?: number;
    dWidth?: number;
    dHeight?: number;
    maxWidth?: number;
    borderRadius?: number;
    font?: string;
    color?: string;
    totalLine?: number;
    lineHeight?: number;
    textAlign?: CanvasTextAlign;
    events?:[string, Function][];
}