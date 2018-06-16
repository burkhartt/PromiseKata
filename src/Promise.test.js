const P = require('./Promise');

describe('Testing Promise', () => {
    let thenFn;
    let catchFn;
    const successResult = 'succeeded';
    const errorResult = 'errored';

    beforeEach(() => {
        thenFn = jest.fn();
        catchFn = jest.fn();
    });

    describe('When wrapping a synchronous function in a Promise', () => {
        describe('When the promise is successful', () => {
            beforeEach(() => {
                new P((resolve, reject) => resolve(successResult))
                    .then(thenFn)
                    .catch(catchFn);
            });

            it('Should call the Then function with the result of the synchronous function', () => {
                expect(thenFn).toBeCalledWith(successResult);
            });

            it('Should not call the Catch function', () => {
                expect(catchFn).not.toBeCalled();
            });
        });

        describe('When the promise is unsuccessful', () => {
            beforeEach(() => {
                new P((resolve, reject) => reject(errorResult))
                    .then(thenFn)
                    .catch(catchFn);
            });

            it('Should not call the Then function', () => {
                expect(thenFn).not.toBeCalledWith();
            });

            it('Should call the Catch function with the error that occurred in the synchronous function', () => {
                expect(catchFn).toBeCalledWith(errorResult);
            });
        });
    });

    describe('When wrapping an asynchronous function in a Promise', () => {
        describe('When the promise is successful', () => {
            it('Should call the Then function with the result fo the synchronous function', (done) => {
                new P((resolve, reject) => setTimeout(() => {
                    resolve(successResult);
                }, 1))
                    .then((result) => {
                        expect(result).toEqual(successResult);
                        done();
                    })
                    .catch(() => {
                        throw new Error('Error should not have been thrown');
                    });
            });

            it('Should not call the Catch function', () => {
                new P((resolve, reject) => setTimeout(() => {
                    reject(errorResult);
                }, 1))
                    .then((result) => {
                        throw new Error('The promise was not successful, so we should not be here');
                    })
                    .catch((error) => {
                        expect(error).toEqual(errorResult);
                        done();
                    });
            });
        });
    });
});