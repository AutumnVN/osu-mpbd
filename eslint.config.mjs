import eslint from '@eslint/js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { rules } from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.stylistic,
    {
        ignores: ['node_modules', 'dist']
    },
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
            'unused-imports': {
                meta: {
                    name: 'eslint-plugin-simple-import-sort',
                    version: '3.2.0',
                },
                rules
            }
        },
        rules: {
            quotes: ['error', 'single', { avoidEscape: true }],
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'unused-imports/no-unused-imports': 'error'
        }
    }
);
