const fs = require('fs');
const MagicString = require('magic-string');


//替换内容可以是函数或原始值，但统一封装成函数，方便处理
const toFunction = (functionOrValue) => {
    if (typeof functionOrValue === 'function') return functionOrValue;
    return () => functionOrValue;
}

const longest = (a, b) => b.length - a.length;


//将配置中的替换选项和替换内容提取出来
const mapToFunctions = (options) => {
    const values = options.values ? Object.assign({}, options.values) : Object.assign({}, options);
    delete values.include;
    return Object.keys(values).reduce((fns, key) => {
        const functions = Object.assign({}, fns);
        functions[key] = toFunction(values[key]);
        return functions;
    }, {});
}


//生成esbuild的filter，其实就是一个正则表达式
const generateFilter = (options) => {
    console.log('generateFilter-options', options)
    let filter = /.*/;
    if (options.include) {
        if (Object.prototype.toString.call(options.include) !== '[object RegExp]') {
            console.warn(`Options.include must be a RegExp object, but gets an '${typeof options.include}' type.`);
        } else {
            filter = options.include
        }
    }
    return filter;
}

//核心函数，匹配代码中的字符串，用配置中的替换内容去替换
const replaceCode = (code, id, pattern, functionValues) => {
    const magicString = new MagicString(code); //magic-string库  rollup源码中使用的
    while ((match = pattern.exec(code))) {
        const start = match.index;
        const end = start + match[0].length;
        const replacement = String(functionValues[match[1]](id));
        magicString.overwrite(start, end, replacement);
    }
    return magicString.toString();
}

exports.replace = (options = {}) => {
    console.log('a-options', options)
    const filter = generateFilter(options); //根据include选项生成filter配置
    const functionValues = mapToFunctions(options); //得到要replace的key和value对象，注意对象是函数
    const empty = Object.keys(functionValues).length === 0;
    const keys = Object.keys(functionValues).sort(longest).map(escape);
    const pattern = new RegExp(`\\b(${keys.join('|')})\\b`, 'g'); // 将所有key构建成一个正则表达式，用于匹配源代码
    return { //返回一个插件
        name: 'replace',
        setup(build) {
            // 文件解析时触发
            // 将插件作用域限定于env文件，并为其标识命名空间"env-ns"
            // build.onResolve({ filter: /^env$/ }, args => ({
            //     path: args.path,
            //     namespace: 'env-ns',
            // }))

            // build.onStart({ filter }, () => {
            //     console.log('build started')
            // })
            build.onStart(() => {
                console.log('build started')
            })
            build.onResolve({ filter }, () => {
                    console.log('build started')
                })
                // 

            // 加载文件时触发
            build.onLoad({ filter: /\.js$/ }, async(args) => { //{ filter: /\.txt$/ },
                const source = await fs.promises.readFile(args.path, "utf8");
                const contents = empty ? source : replaceCode(source, args.path, pattern, functionValues)
                return { contents, loader: args.path.match(/tsx?$/) ? 'ts' : 'js' };
            });
        }
    };
}
module.exports = exports;