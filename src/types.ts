export interface Template {
    readonly rootID: string;
    use(props: {script: string, params?: RegExpExecArray}): JSX.Element;
}