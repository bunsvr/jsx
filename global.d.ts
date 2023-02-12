/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="esnext" />
/// <reference types="bun-types" />

/**
 * Parsed parameter
 */
declare interface Window {
    readonly params: Record<string, string>;
}