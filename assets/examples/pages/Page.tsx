import "../styles/index.css";

export default function App() {
    return <p>You are on page: {params.page}</p>;
}

export function Head(props: { params: Record<string, string> }) {
    return <title>{props.params.page}</title>;
}