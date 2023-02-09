import { Template } from "./types";

export function minifiedLoadScript(paramsString: string) {
    return (paramsString ? `window.params=${paramsString};` : "") 
        + `window.addEventListener("load",()=>{for(let e of document.getElementsByClassName("__styles"))e.media="all"})`;
}

export const template: Template = {
    root: "body",
    use({ name, params, children, Head }) {
        // RegExpExecArray is an array with properties, which is why this will not work when parse the whole array in
        const parsed = params ? JSON.stringify(params?.groups) : "";
        const styles = name + ".css";

        return <html lang="en">
            <head>
                <link rel="stylesheet" href={styles} media="print" className="__styles" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                {Head && <Head params={params?.groups} />}
                <script async dangerouslySetInnerHTML={{
                    __html: minifiedLoadScript(parsed)
                }}></script>
                <script async defer src={name + ".js"}></script>
            </head>
            <body>{children}</body>
        </html>
    }
}