import { render } from "react-dom";
import "../styles/index.css";

function App() {
    return <p>You are on page: {params.page}</p>;
}

// Render in body because why not :)
render(<App />, document.body);