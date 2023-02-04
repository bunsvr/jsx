export default {
    rootID: "root",
    use({name, params}) {
        const parsed = JSON.stringify(params);

        return <html lang="en">
            <head>
                <link rel="stylesheet" href={name + ".css"} />
            </head>
            <body>
                <div id="root"></div>
                <script 
                    id="params" 
                    async
                    dangerouslySetInnerHTML={{
                        __html: `const params = ${parsed}`
                    }}></script>
                <script defer src={name + ".js"}></script>
            </body>
        </html>
    } 
}