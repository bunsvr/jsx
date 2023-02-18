/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="esnext" />

declare interface Window {
    /**
     * Parsed parameter
     */
    readonly params: Record<string, string>;
}