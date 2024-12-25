// @ts-check
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
    eslint.configs.recommended,
    ...typescriptEslint.configs.recommended,
    eslintConfigPrettier,
    {
        languageOptions: {
            globals: {
                require: "readonly",
                console: "readonly",
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_'
                }
            ],
            "@typescript-eslint/no-require-imports": "off",
            '@typescript-eslint/no-explicit-any': 'off'
        }
    },
);
