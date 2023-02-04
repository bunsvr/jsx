import { PageRouter } from "../..";

new PageRouter()
    // Set development mode
    .set("dev", false)
    // Set root folder
    .set("root", import.meta.dir)
    // Set pages folder
    .set("src", "pages")
    // Serve App.tsx when request to /
    .static("/", "App.tsx")
    // Serve Page.tsx when request match /:page
    .dynamic("/:page", "Page.tsx")
    // Build and serve
    .serve();