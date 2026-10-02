import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-config-next의 기본 제외 설정을 덮어씁니다.
  globalIgnores([
    // eslint-config-next의 기본 제외 대상입니다.
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["components/ui/**/*.{ts,tsx}", "hooks/use-mobile.ts"],
    rules: {
      // 이 파일들은 shadcn@4.17.0에서 가져온 소스입니다.
      // 원본 구조를 유지하고 사이트 코드에는 더 엄격한 규칙을 적용합니다.
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
