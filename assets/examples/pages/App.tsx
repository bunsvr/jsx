import { render } from "react-dom";
import "../styles/index.css";

function App() {
    return <p>Hello world</p>;
}

// Render in body because why not :)
render(<App />, document.body);