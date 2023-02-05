export interface Template {
    /**
     * Render the template
     * @param props 
     */
    use(props: {name: string, params?: RegExpExecArray}): JSX.Element;

    /**
     * Render root. For future SSR support
     */
    root?: string;
}