import { createHash } from "crypto";
import { readFileSync } from "fs";

export function hashContent(path: string) {
    const content = readFileSync(path);

    return createHash("sha256").update(content).digest("hex");
}