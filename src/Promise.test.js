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
            it('Should call the Then function with the result', (done) => {
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
        });

        describe('When the promise is unsuccessful', () => {
            it('Should call the Catch function with the error', (done) => {
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

    describe('Non-dynamic Promise chain', () => {
        let thenFn1;
        let thenFn2;
        let thenFn3;
        let fnCalls;

        beforeEach(() => {
            thenFn1 = jest.fn();
            thenFn2 = jest.fn();
            thenFn3 = jest.fn();
            fnCalls = [];
        });

        describe('When all of the Thens are successful', () => {
            it('Should call each Then function in order', () => {
                new P((resolve, reject) => resolve())
                    .then(() => {
                        fnCalls.push(thenFn1);
                        thenFn1();
                    })
                    .then(() => {
                        fnCalls.push(thenFn2);
                        thenFn2();
                    })
                    .then(() => {
                        fnCalls.push(thenFn3);
                        thenFn3();
                    })
                    .catch(catchFn);

                expect(thenFn1).toBeCalled();
                expect(thenFn2).toBeCalled();
                expect(thenFn3).toBeCalled();
                expect(catchFn).not.toBeCalled();
                expect(fnCalls).toEqual([thenFn1, thenFn2, thenFn3]);
            });
        });

        describe('When one of the Thens throws an Error', () => {
            it('Should call the Then functions before the error and the Catch function', () => {
                new P((resolve, reject) => resolve())
                    .then(() => {
                        fnCalls.push(thenFn1);
                        thenFn1();
                    })
                    .then(() => {
                        fnCalls.push(thenFn2);
                        thenFn2();
                        throw new Error(errorResult);
                    })
                    .then(() => {
                        fnCalls.push(thenFn3);
                        thenFn3();
                    })
                    .catch(() => {
                        fnCalls.push(catchFn);
                        catchFn();
                    });

                expect(thenFn1).toBeCalled();
                expect(thenFn2).toBeCalled();
                expect(thenFn3).not.toBeCalled();
                expect(catchFn).toBeCalled();
            });
        });

        describe('When a Then function has a new Promise to handle', () => {
            describe('When it is successful', () => {
                it('Should call the Then function after the new promise has resolved', (done) => {
                    new P((resolve, reject) => resolve())
                        .then(() => new P((resolve, reject) => {
                            setTimeout(() => {
                                fnCalls.push(thenFn1);
                                thenFn1();
                                resolve(successResult);
                            }, 1);
                        }))
                        .then((result) => {
                            fnCalls.push(thenFn2);
                            thenFn2(result);
                        })
                        .then(() => {
                            try {
                                expect(thenFn1).toBeCalled();
                                expect(thenFn2).toBeCalledWith(successResult);
                                expect(fnCalls).toEqual([thenFn1, thenFn2]);
                                done();
                            } catch (ex) {
                                done(ex);
                            }
                        });
                });
            });

            describe('When it it unsuccessful', () => {
                it('Should call the Catch function after the new promise has errored', (done) => {
                    new P((resolve, reject) => resolve())
                        .then(() => new P((resolve, reject) => {
                            setTimeout(() => {
                                fnCalls.push(thenFn1);
                                thenFn1();
                                reject(errorResult);
                            }, 1);
                        }))
                        .then(() => {
                            fnCalls.push(thenFn2);
                            thenFn2();
                        })
                        .catch((err) => {
                            try {
                                expect(err).toEqual(errorResult);
                                expect(thenFn1).toBeCalled();
                                done();
                            } catch (ex) {
                                done(ex);
                            }
                        });
                });
            });
        });
    });
});