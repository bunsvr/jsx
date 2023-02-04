import React from "react";
import { render } from "react-dom";

function App() {
    return <p style={{
        fontFamily: "monospace"
    }}>Hello world</p>;
}

render(<App />, document.getElementById("root"));