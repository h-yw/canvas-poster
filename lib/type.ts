
export interface PosterConfig {
    width: number;
    height: number;
    type: string;
}
export interface TextConfig {
    type: string;
    text: string;
    font: string | undefined;
    color: string | undefined;
    x: number;
    y: number;
    textAlign: CanvasTextAlign | undefined;
    lineHeight: number | undefined;
    totalLine: number | undefined;
    maxWidth: number | undefined;
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
}
