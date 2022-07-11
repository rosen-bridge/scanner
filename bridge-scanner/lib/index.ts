import { commitmentMain } from "./scanner/scanner";

export { commitmentMain } from "./scanner/scanner";

const temp = commitmentMain().then(res=>res.update());

