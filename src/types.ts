export interface Template {
    readonly rootID: string;
    use(props: {name: string, params?: RegExpExecArray}): JSX.Element;
}