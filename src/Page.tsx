import defaultTemplate from "./template";

import esbuild from "esbuild";

import Bun from "bun";

import { Router } from "@stricjs/router";
import { stream } from "@stricjs/utils";
import { App } from "@stricjs/core";

import ReactDOM from "react-dom/server";

import Path from "path/posix";

import fs from "fs";
import { promisify } from "util";
import { Template } from "./types";

const rm = promisify(fs.rm);
const mkdir = promisify(fs.mkdir);

async function build(files: string[], outdir: string, dev: boolean, other: esbuild.BuildOptions) {
    return esbuild.build({
        bundle: true,
        minify: true,
        platform: "browser",
        jsx: "automatic",
        external: ["esbuild"],
        jsxDev: dev,
        entryPoints: files,
        legalComments: "none",
        outdir,
        ...other
    });
}

export class PageRouter<T = any> {
    readonly src: string;
    readonly out: string;
    readonly dev: boolean;
    readonly root: string;

    private entries: string[]

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

        this.entries = [];

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
    static(path: string, source: string) {
        const Element = this.template.use;
        const str = ReactDOM.renderToString(
            <Element name={"/" + source.split(".")[0]} />
        );

        this.router.static(path, () => new Response(str, {
            headers: { "content-type": "text/html" }
        }));

        this.entries.push(Path.join(this.root, this.src, source));

        return this;
    }

    /**
     * Route a dynamic page
     * @param path The pathname 
     * @param source Relative path in src
     */
    dynamic(path: string | RegExp, source: string) {
        const Element = this.template.use;

        this.router.dynamic(path, req => 
            new Response(
                ReactDOM.renderToString(
                    <Element 
                        params={req.params}
                        name={"/" + source.split(".")[0]}
                    />
                ), { headers: { "content-type": "text/html" } }
            )
        );

        this.entries.push(Path.join(this.root, this.src, source));

        return this;
    }

    /**
     * Build all files in src and add all routes to app
     */
    async load() {
        const outDir = Path.join(this.root, this.out);

        if (fs.existsSync(outDir))
            await rm(outDir, { recursive: true });
        await mkdir(outDir);

        this.app
            .use(stream(outDir))
            .use(this.router.fetch());

        this.app.development = this.dev;

        return build(this.entries, outDir, this.dev, this.build);
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