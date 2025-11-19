import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';

export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist/esm',
        format: 'esm',
        sourcemap: true
    },
    plugins: [
        json(),
        resolve(),
        commonjs(),
        typescript({
            useTsconfigDeclarationDir: true // Use the declaration output path from tsconfig
        })
    ],

    onwarn(warning, warn) {
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
    }
};
