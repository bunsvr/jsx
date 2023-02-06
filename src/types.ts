export interface Template {
    /**
     * Render the template
     * @param props 
     */
    use(props: {name: string, params?: RegExpExecArray, children?: React.ReactNode, Head?: (props: { params: Record<string, string> }) => JSX.Element}): JSX.Element;

    /**
     * Render root query selector
     */
    root?: string;
}