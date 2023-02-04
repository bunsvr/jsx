import { render } from "react-dom";
import "../styles/index.css";

function App() {
    return <p>You are on page: {params[1]}</p>;
}

render(<App />, document.getElementById("root"));