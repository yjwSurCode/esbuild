const path = require('path');
const { build } = require('esbuild');
const { replace } = require('..');

const buildExample = async(replacePluginOptions = {}) => {
    console.log(replacePluginOptions, 'replacePluginOptions')
    const { outputFiles } = await build({
        entryPoints: [path.resolve(__dirname, './test.js')],
        outfile: path.resolve(__dirname, './bundle.js'),
        write: false,
        bundle: true,
        plugins: [replace(replacePluginOptions)]
    });
    return outputFiles[0].text;
}

test('base-1', async() => {
    const code = await buildExample({
        '__version__': JSON.stringify('1.0.0'),
        '__author__': JSON.stringify('fnx')
    });
    console.log(code, 'code----')
    expect(code).toMatch(/fnx/);
    expect(code).toMatch(/1\.0\.0/);
});

// test('base-2', async() => {
//     const code = await buildExample({
//         '__author__': JSON.stringify('fnx')
//     });
//     expect(code).toMatch(/fnx/);
//     expect(code).toMatch(/__version__/);
//     expect(code).not.toMatch(/1\.0\.0/);
// });

// test('options.include', async() => {
//     const code = await buildExample({
//         '__version__': JSON.stringify('1.0.0'),
//         '__author__': JSON.stringify('fnx'),
//         include: /\.ts$/
//     });
//     expect(code).not.toMatch(/fnx/);
//     expect(code).not.toMatch(/1\.0\.0/);
//     expect(code).toMatch(/__author__/);
//     expect(code).toMatch(/__version__/);
// });

// test('options.values', async() => {
//     const code = await buildExample({
//         '__author__': JSON.stringify('fnx'),
//         values: {
//             '__version__': JSON.stringify('1.0.0'),
//         }
//     });
//     expect(code).not.toMatch(/fnx/);
//     expect(code).toMatch(/__author__/);
//     expect(code).toMatch(/1\.0\.0/);
// });