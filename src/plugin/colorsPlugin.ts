import colors from "colors";
const forWebpackReloadingTypescript = "";

export function useColors(){
  colors.enable();
  colors.setTheme({
    silly: "rainbow",
    input: "grey",
    verbose: "cyan",
    prompt: "grey",
    info: "green",
    data: "grey",
    help: "cyan",
    warn: "yellow",
    debug: "blue",
    error: "red"
  });
}
