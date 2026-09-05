import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig, globalIgnores } from 'eslint/config';

const compat = new FlatCompat({ baseDirectory: process.cwd() });

export default defineConfig([
  globalIgnores(['.next/**', 'node_modules/**', 'coverage/**', 'next-env.d.ts']),
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
]);
