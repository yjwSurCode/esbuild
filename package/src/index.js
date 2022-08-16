console.log("Hello World!");
import('./test').then(fn => {
    console.log(fn.default());
})