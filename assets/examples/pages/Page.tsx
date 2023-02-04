import React from "react";
import { render } from "react-dom";

function App() {
    return <p style={{
        fontFamily: "monospace"
    }}>You are on page: {params[1]}</p>;
}

render(<App />, document.getElementById("root"));