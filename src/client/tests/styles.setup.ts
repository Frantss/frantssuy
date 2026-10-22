import "@/client/styles/global.css";
import "@/client/styles/article.css";
import "@/client/styles/stylex.css";
import * as stylex from "@stylexjs/stylex";
import { documentTheme } from "@/client/styles/document-theme";

document.documentElement.classList.add(...stylex.attrs(documentTheme.root).class!.split(" "));
