const P = require('./Promise');

function doStuff() {
    const promise = new P((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 1);
    });

    return promise;
}

function doThings() {

}

doStuff()
    .then(() => {
        console.log('done');
        return 3;
    })
    .then((result) =>  {
        return new P((resolve, reject) => {
            setTimeout(() => {
                console.log('woot' + result);
                resolve();
            }, 1000);
        });
    })
    .then((result) => {
        console.log('new result is', result);
        return 4;
    })
    .then((result) => {
        console.log('what up?', result);
        throw new Error('oops');
    })
    .catch((ex) => {
        console.error('in here');
    });