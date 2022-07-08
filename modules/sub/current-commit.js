import { execSync } from "child_process";

export default function() {
    return execSync('git rev-parse --short HEAD').toString().trim()
}