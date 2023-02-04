export default {
    rootID: "root",
    use({name, params}) {
        // RegExpExecArray is an array with properties, which is why this will not work when parse the whole array in
        const parsed = params ? JSON.stringify(params?.groups) : "";

        return <html lang="en">
            <head>
                <link rel="stylesheet" href={name + ".css"} />
                <script dangerouslySetInnerHTML={{
                        __html: `const params = ${parsed}`
                    }}></script>
                <script defer src={name + ".js"}></script>
            </head>
            <body></body>
        </html>
    } 
}