import { template as defaultTemplate } from "./template";

import esbuild from "esbuild";

import Bun from "bun";

import { Router } from "@stricjs/router";
import { stream } from "@stricjs/utils";
import { App } from "@stricjs/core";

import ReactDOM from "react-dom/server";

import Path from "path/posix";

import fs, { existsSync } from "fs";
import { promisify } from "util";
import { Template } from "./types";
import { hashContent } from "./hash";

type RouteList = {
    ssr?: boolean;
    path: string | RegExp;
    source: string;
    type: "static" | "dynamic";
    id: string,
}[];

const rm = promisify(fs.rm);
const mkdir = promisify(fs.mkdir);
const appendFile = promisify(fs.appendFile);

async function build(files: RouteList, outdir: string, dev: boolean, root: string, other: esbuild.BuildOptions) {
    const tmps = files.map(v => Path.join(outdir, Path.basename(v.source).split(".")[0] + `.${v.id}.tsx`));

    let index = 0;
    for (const tmp of tmps) {
        const file = files[index];
        const isSSR = !!file.ssr;
        const selector = `document.querySelector(\`${root}\`)`;

        await appendFile(tmp, `
            import App from "${file.source}";
            import { ${
                isSSR ? "hydrateRoot" : "createRoot"
            } } from "react-dom/client";
            ${isSSR 
                ? `hydrateRoot(${selector}, <App />)` 
                : `createRoot(${selector}).render(<App />)`}
        `);

        ++index;
    };

    await esbuild.build({
        bundle: true,
        minify: true,
        platform: "browser",
        jsx: "automatic",
        external: ["esbuild"],
        jsxDev: dev,
        entryPoints: tmps,
        legalComments: "none",
        outdir,
        ...other
    });

    await Promise.all(tmps.map(f => rm(f)));
};

export class PageRouter<T = any> {
    readonly src: string;
    readonly out: string;
    readonly dev: boolean;
    readonly root: string;

    private routesData: RouteList;

    private readonly app: App<T>;
    readonly router: Router<T>;
    readonly template: Template;

    /**
     * Create a page with a template 
     */
    constructor(private readonly build: esbuild.BuildOptions = {}) {
        this.root = Path.resolve();
        this.src = "src";
        this.out = "out";
        this.dev = Bun.env.NODE_ENV !== "production";

        this.template = defaultTemplate;

        this.routesData = [];

        this.app = new App();
        this.router = new Router<T>();
    }

    set(field: "src" | "out" | "root", value: string): this;
    set(field: "dev", value: boolean): this;
    set(field: "router", value: Router<T>): this;
    set(field: "template", value: Template): this;
    /**
     * Set private fields 
     * @param field 
     * @param value 
     */
    set(field: string, value: any) {
        this[field] = value;

        return this;
    }

    /**
     * Route a static page
     * @param path The pathname 
     * @param source Relative path in src
     */
    static(path: string, source: string, ssr?: boolean) {
        const filePath = Path.join(this.root, this.src, source);

        this.routesData.push({
            type: "static",
            path, source: filePath, ssr,
            id: hashContent(filePath),
        });

        return this;
    }

    /**
     * Route a dynamic page
     * @param path The pathname 
     * @param source Relative path in src
     */
    dynamic(path: string | RegExp, source: string, ssr?: boolean) {
        const filePath = Path.join(this.root, this.src, source);

        this.routesData.push({
            type: "dynamic",
            path, source: filePath, ssr,
            id: hashContent(filePath),
        });

        return this;
    }

    /**
     * Build all files in src and add all routes to app
     */
    async load(streamOpts?: BlobPropertyBag & ResponseInit) {
        const outDir = Path.join(this.root, this.out);
        if (fs.existsSync(outDir))
            await rm(outDir, { recursive: true });
        await mkdir(outDir);

        // Build
        await build(
            this.routesData, outDir, this.dev,
            this.template.root || "body", this.build
        );

        // Setup router
        for (const route of this.routesData) {
            // For SSR support
            const Element = this.template.use;
            const mod = await import(route.source) as {
                default: () => React.ReactElement,
                Head: () => React.ReactElement,
            };

            const withoutExt = route.source.split(".")[0],
                srcDir = Path.join(this.root, this.src),
                fileId = `.${route.id}.`,
                fileName = withoutExt.replace(srcDir, "") + fileId;
            const args: any = {
                style: "", 
                script: fileName + "js",
                Head: mod.Head
            }

            // Add style if needed
            {
                const cssPath = withoutExt.replace(srcDir, outDir) + fileId + "css";

                if (existsSync(cssPath))
                    args.style = fileName + "css";
            }

            // Check for every type of route
            if (route.type === "static") {
                const str = ReactDOM.renderToString(
                    <Element {...args}>
                        {route.ssr && <mod.default />}
                    </Element>
                );
    
                this.router.static(route.path as string, () => new Response(str, {
                    headers: { "content-type": "text/html" }
                }));
            } else 
                this.router.dynamic(route.path, req =>
                    new Response(
                        ReactDOM.renderToString(
                            <Element
                                params={req.params}
                                {...args}
                            >{route.ssr && <mod.default />}</Element>
                        ), { headers: { "content-type": "text/html" } }
                    )
                );
        }

        // Setup app
        this.app
            .use(stream(outDir, streamOpts))
            .use(this.router.fetch());

        this.app.development = this.dev;

        return this;
    }

    /**
     * Serve the app
     */
    async serve() {
        await this.load();
        return Bun.serve(this.app);
    }

    /**
     * Return the fetch handler
     */
    fetch() {
        return this.app.fetch.bind(this.app);
    }
}