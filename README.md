# Promise Kata

This library is a practice implementation of a Promise library in JavaScript.

### Promise Chaining
```
    new P((resolve, reject) => {
    
    }).then((result) => {
    
    }).catch((err) => {
    
    });
```

```
    new P((resolve, reject) => {
        return new Promise((resolve, reject) => resolve());
    }).then((result) => {
    
    });
```

### TODO
* Add support for "finally"
* Allow for `.then()` after `.catch()`
* Parallel promises