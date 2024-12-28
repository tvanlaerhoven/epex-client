import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/bundle.cjs.js',
            format: 'umd',
            name: 'Epex',
            sourcemap: true
        },
        {
            file: 'dist/bundle.esm.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: [
        resolve(),
        commonjs(),
        typescript({
            useTsconfigDeclarationDir: true // Use the declaration output path from tsconfig
        })
    ]
};
