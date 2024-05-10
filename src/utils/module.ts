import type { languages } from "monaco-editor";
import {
  createOnigScanner,
  createOnigString,
  loadWASM,
} from "vscode-oniguruma";
import { SimpleLanguageInfoProvider, TextMateGrammar } from "./providers";
import { rehydrateRegexps } from "./configuration";
import VsCodeDarkTheme from "./vs-dark-plus-theme";
import { registerLanguages } from "./register";

export default class TextMate {
  languages: languages.ILanguageExtensionPoint[] = [
    {
      id: "python",
      extensions: [
        ".py",
        ".rpy",
        ".pyw",
        ".cpy",
        ".gyp",
        ".gypi",
        ".pyi",
        ".ipy",
        ".bzl",
        ".cconf",
        ".cinc",
        ".mcconf",
        ".sky",
        ".td",
        ".tw",
      ],
      aliases: ["Python", "py"],
      filenames: ["Snakefile", "BUILD", "BUCK", "TARGETS"],
      firstLine: "^#!\\s*/?.*\\bpython[0-9.-]*\\b",
    },
  ];
  grammars: { [scopeName: string]: any } = {
    "source.python": {
      language: "python",
      path: "MagicPython.tmLanguage.json",
    },
  };
  provider?: SimpleLanguageInfoProvider;
  constructor() {}

  // Taken from https://github.com/microsoft/vscode/blob/829230a5a83768a3494ebbc61144e7cde9105c73/src/vs/workbench/services/textMate/browser/textMateService.ts#L33-L40
  private async loadVSCodeOnigurumWASM(): Promise<Response | ArrayBuffer> {
    const response = await fetch("/wasm/onig.wasm");
    const contentType = response.headers.get("content-type");
    if (contentType === "application/wasm") {
      return response;
    }

    // Using the response directly only works if the server sets the MIME type 'application/wasm'.
    // Otherwise, a TypeError is thrown when using the streaming compiler.
    // We therefore use the non-streaming compiler :(.
    return await response.arrayBuffer();
  }

  private fetchGrammar = async (
    scopeName: string
  ): Promise<TextMateGrammar> => {
    const { path } = this.grammars[scopeName];
    const uri = `/grammars/${path}`;
    const response = await fetch(uri);
    const grammar = await response.text();
    const type = path.endsWith(".json") ? "json" : "plist";
    return { type, grammar };
  };

  private fetchConfiguration = async (
    language: string
  ): Promise<languages.LanguageConfiguration> => {
    const uri = `/configurations/${language}.json`;
    const response = await fetch(uri);
    const rawConfiguration = await response.text();
    return rehydrateRegexps(rawConfiguration);
  };

  async register(monaco: any) {
    const data = await this.loadVSCodeOnigurumWASM();
    await loadWASM(data);
    const onigLib = Promise.resolve({
      createOnigScanner,
      createOnigString,
    });
    this.provider = new SimpleLanguageInfoProvider({
      grammars: this.grammars,
      fetchGrammar: this.fetchGrammar,
      configurations: this.languages.map((language) => language.id),
      fetchConfiguration: this.fetchConfiguration,
      theme: VsCodeDarkTheme,
      onigLib,
      monaco,
    });
    registerLanguages(
      this.languages,
      (language: string) => this.provider!.fetchLanguageInfo(language),
      monaco
    );
  }

  injectCSS() {
    this.provider?.injectCSS();
  }
}
