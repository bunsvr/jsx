export interface Template {
    use(props: {name: string, params?: RegExpExecArray}): JSX.Element;
}