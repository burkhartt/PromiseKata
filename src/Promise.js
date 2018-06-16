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
                this._handleError(err);
            }
        }

        return this;
    }

    _nextThen() {
        if (!this._thenCallbacks.length) {
            return;
        }

        return () => {
            const resultFromLastPromise = this._results.shift();
            const nextThen = this._thenCallbacks.shift();

            const result = nextThen(resultFromLastPromise);

            if (result instanceof P) {
                result
                    .then((r) => this._handleResult(r))
                    .catch((err) => this._handleError(err));
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
                this._handleError(err);
            }
        }
    }

    _handleError(err) {
        this._errors.push(err);
        const nc = this._nextCatch();
        if (nc) {
            nc();
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