/**
 * JavaScript 兼容性 Polyfills
 * 为 Zalo Mini App Studio 提供现代 JavaScript 特性的兼容实现
 */

(function() {
  'use strict';
  
  console.log('加载 JavaScript 兼容性 polyfills...');
  
  // 1. Object.assign polyfill (ES6)
  if (!Object.assign) {
    Object.assign = function(target) {
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      
      var to = Object(target);
      
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        
        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };
  }
  
  // 2. Array.from polyfill (ES6)
  if (!Array.from) {
    Array.from = function(arrayLike, mapFn, thisArg) {
      var C = this;
      var items = Object(arrayLike);
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }
      
      var len = parseInt(items.length) || 0;
      var A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
      var k = 0;
      var kValue;
      
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof thisArg === 'undefined' ? mapFn(kValue, k) : mapFn.call(thisArg, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  }
  
  // 3. Array.includes polyfill (ES7)
  if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement, fromIndex) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }
      
      var o = Object(this);
      var len = parseInt(o.length) || 0;
      
      if (len === 0) {
        return false;
      }
      
      var n = parseInt(fromIndex) || 0;
      var k;
      
      if (n >= 0) {
        k = n;
      } else {
        k = len + n;
        if (k < 0) {
          k = 0;
        }
      }
      
      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }
      
      for (; k < len; k++) {
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
      }
      
      return false;
    };
  }
  
  // 4. String.includes polyfill (ES6)
  if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
      if (typeof start !== 'number') {
        start = 0;
      }
      
      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };
  }
  
  // 5. Promise polyfill (简化版本)
  if (!window.Promise) {
    window.Promise = function(executor) {
      var self = this;
      self.state = 'pending';
      self.value = undefined;
      self.handlers = [];
      
      function resolve(result) {
        if (self.state === 'pending') {
          self.state = 'fulfilled';
          self.value = result;
          self.handlers.forEach(handle);
          self.handlers = null;
        }
      }
      
      function reject(error) {
        if (self.state === 'pending') {
          self.state = 'rejected';
          self.value = error;
          self.handlers.forEach(handle);
          self.handlers = null;
        }
      }
      
      function handle(handler) {
        if (self.state === 'pending') {
          self.handlers.push(handler);
        } else {
          if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
            handler.onFulfilled(self.value);
          }
          if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
            handler.onRejected(self.value);
          }
        }
      }
      
      this.then = function(onFulfilled, onRejected) {
        return new Promise(function(resolve, reject) {
          handle({
            onFulfilled: function(result) {
              try {
                resolve(onFulfilled ? onFulfilled(result) : result);
              } catch (ex) {
                reject(ex);
              }
            },
            onRejected: function(error) {
              try {
                resolve(onRejected ? onRejected(error) : error);
              } catch (ex) {
                reject(ex);
              }
            }
          });
        });
      };
      
      this.catch = function(onRejected) {
        return this.then(null, onRejected);
      };
      
      executor(resolve, reject);
    };
    
    Promise.resolve = function(value) {
      return new Promise(function(resolve) {
        resolve(value);
      });
    };
    
    Promise.reject = function(reason) {
      return new Promise(function(resolve, reject) {
        reject(reason);
      });
    };
  }
  
  // 6. 修复可能的语法兼容性问题
  if (typeof window !== 'undefined') {
    // 确保 console 对象存在
    if (!window.console) {
      window.console = {
        log: function() {},
        warn: function() {},
        error: function() {},
        info: function() {},
        debug: function() {}
      };
    }
    
    // 修复可能的保留字问题
    var reservedWords = ['class', 'const', 'let', 'static', 'extends'];
    reservedWords.forEach(function(word) {
      if (window[word] && typeof window[word] === 'object') {
        window['_' + word] = window[word];
        console.warn('[兼容性修复] 保留字 "' + word + '" 已备份为 "_' + word + '"');
      }
    });
  }
  
  console.log('JavaScript 兼容性 polyfills 加载完成');
})();
