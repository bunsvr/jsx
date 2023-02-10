import { PageRouter } from "../..";

const headers = {
    "cache-control": "max-age=604800"
};

const router = await new PageRouter()
    // Set development mode
    .set("dev", false)
    // Set root folder
    .set("root", import.meta.dir)
    // Set pages folder
    .set("src", "pages")
    // Serve App.tsx when request to / with SSR enabled
    .static("/", "App.tsx", true)
    // Serve Page.tsx when request match /:page
    .dynamic("/:page", "Page.tsx")
    // Build
    .load({ headers });

// Serve
router.serve();