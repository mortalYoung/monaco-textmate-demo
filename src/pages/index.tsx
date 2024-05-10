import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect, useRef } from "react";
import TextMate from "@/utils/module";

export default function HomePage() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      // const data = await loadVSCodeOnigurumWASM();
      // await loadWASM(data);
      // await loadWASM("/wasm/onigasm.wasm");
      // const registry = new Registry({
      //   getGrammarDefinition: async (scopeName) => {
      //     return {
      //       format: "json",
      //       content: await (
      //         await fetch(`/grammars/MagicPython.tmLanguage.json`)
      //       ).text(),
      //     };
      //   },
      // });

      const textmate = new TextMate();
      await textmate.register(monaco);

      const editor = monaco.editor.create(ref.current!, {
        language: "python",
        theme: "vs-dark",
        value: getSampleCodeForLanguage("python"),
      });

      textmate.injectCSS();

      // await wireTmGrammars(monaco, registry, grammars, editor);
    })();
    // return () => {
    //   if (monacoEditor) {
    //     monacoEditor.dispose();
    //   }
    // };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}

function getSampleCodeForLanguage(language: string): string {
  if (language === "python") {
    return `\
#89
import foo

async def bar(): string:
  f = await foo()
  f_string = f"Hooray {f}! format strings are not supported in current Monarch grammar"
  return foo_string
`;
  }

  throw Error(`unsupported language: ${language}`);
}
