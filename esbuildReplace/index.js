const path = require('path');
console.log('path', path.resolve(__dirname, './dist', 'index.js'))
const { build } = require('esbuild');

const createBuild = () => {
    const formats = {
        cjs: 'index.js',
        esm: 'index.mjs'
    };
    Object.keys(formats).forEach((key) => {
        const fileName = formats[key];
        build({
            entryPoints: [path.resolve(__dirname, './src/index.js')], // 入口文件 //path C:\material\Rollup+Esbuild\esbuildDebug\src\index.js
            outfile: path.resolve(__dirname, './dist', fileName), //path C:\material\Rollup+Esbuild\esbuildDebug\dist\index.js path C:\material\Rollup+Esbuild\esbuildDebug\dist\index.mjs
            external: ['fs'], //它可用于从您的包中修剪不必要的代码，以便您知道永远不会执行的代码路径
            bundle: true, //  是否捆绑在一起
            minify: true, //成的代码将被缩小
            platform: 'node', //你绑定的代码打算在node中运行
            format: key, //这将设置生成的 JavaScript 文件的输出格式。目前，可以配置三个可能的值：iife，cjs，和esm。如果未指定输出格式，esbuild 会在启用捆绑（如下所述）的情况下为您选择一种输出格式，或者如果禁用捆绑则不进行任何格式转换。
            target: 'es2020', //默认目标是esnext，这意味着默认情况下，esbuild将假设所有最新的JavaScript和CSS特性都支持。
        }).then(() => {
            console.info(`— ${fileName} was built`);
        }).catch((e) => {
            console.info(`🚨 ${fileName} build error:`);
            console.error(e);
        });
    })
};

createBuild();