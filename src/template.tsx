export default {
    rootID: "root",
    use({script, params}) {
        const parsed = JSON.stringify(params);

        return <html lang="en">
            <body>
                <div id="root"></div>
                <script 
                    id="params" 
                    async
                    dangerouslySetInnerHTML={{
                        __html: `const params = ${parsed}`
                    }}></script>
                <script defer src={script}></script>
            </body>
        </html>
    } 
}