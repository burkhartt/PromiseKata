let results = [];
let errors = [];

let thenCallbacks = [];
let errorCallbacks = [];

class P {
    constructor(callback) {
        const resolve = (param) => {
            results.push(param);
            const nt = this._nextThen();
            if (nt) {
                nt();
            }
        };

        const reject = (param) => {
            errors.push(param);
            const nc = this._nextCatch();
            if (nc) {
                nc();
            }
        };

        callback(resolve, reject);
    }

    get isResolved() {
        return !thenCallbacks.length && !errorCallbacks.length;
    }

    then(callback) {
        thenCallbacks.push(callback);

        if (results.length) {
            this._nextThen()();
        }

        return this;
    }

    _nextThen() {
        if (!thenCallbacks.length) {
            return;
        }

        return () => {
            const nextResult = results.shift();
            const nextThen = thenCallbacks.shift();

            const result = nextThen(nextResult);
            results.push(result);

            const r = this._nextThen();
            if (r) {
                try {
                    r();
                } catch (err) {
                    errors.push(err);
                    this._nextCatch()();
                }
            }
        };
    }

    catch(callback) {
        errorCallbacks.push(callback);

        if (errors.length) {
            this._nextCatch()();
        }

        return this;
    }

    _nextCatch() {
        if (!errorCallbacks.length) {
            return;
        }

        return () => {
            const nextError = errors.shift();
            const nextCatch = errorCallbacks.shift();

            nextCatch(nextError);
            const r = this._nextCatch();
            if (r) {
                r();
            }
        };
    }
}

module.exports = P;