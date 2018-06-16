class P {
    constructor(callback) {
        this._results = [];
        this._errors = [];

        this._thenCallbacks = [];
        this._errorCallbacks = [];

        const resolve = (param) => {
            this._results.push(param);
            const nt = this._nextThen();
            if (nt) {
                nt();
            }
        };

        const reject = (param) => {
            this._errors.push(param);
            const nc = this._nextCatch();
            if (nc) {
                nc();
            }
        };

        callback(resolve, reject);
    }

    then(callback) {
        this._thenCallbacks.push(callback);

        if (this._results.length) {
            try {
                this._nextThen()();
            } catch (err) {
                this._errors.push(err);
                const nc = this._nextCatch();
                if (nc) {
                    nc();
                }
            }
        }

        return this;
    }

    _nextThen() {
        if (!this._thenCallbacks.length) {
            return;
        }

        return () => {
            const nextResult = this._results.shift();
            const nextThen = this._thenCallbacks.shift();

            const result = nextThen(nextResult);

            if (result instanceof P) {
                result.then(() => {
                    this._handleResult(result);
                });
            } else {
                this._handleResult(result);
            }
        };
    }

    _handleResult(result) {
        this._results.push(result);

        const r = this._nextThen();
        if (r) {
            try {
                r();
            } catch (err) {
                this._errors.push(err);
                this._nextCatch()();
            }
        }
    }

    catch(callback) {
        this._errorCallbacks.push(callback);

        if (this._errors.length) {
            this._nextCatch()();
        }

        return this;
    }

    _nextCatch() {
        if (!this._errorCallbacks.length) {
            return;
        }

        return () => {
            const nextError = this._errors.shift();
            const nextCatch = this._errorCallbacks.shift();

            nextCatch(nextError);
            const r = this._nextCatch();
            if (r) {
                r();
            }
        };
    }
}

module.exports = P;