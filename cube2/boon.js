
if (typeof Module === 'undefined') Module = {};
Module.arguments = ['-nofullscreen', '-nosound'];
Module.screenIsReadOnly = true;
(function() {
  var start = 0;
  var mean = 0;
  var reportTime = Date.now();
  Module.preMainLoop = function() {
    start = Date.now();
  };
  Module.postMainLoop = function() {
    var now = Date.now();
    var time = now - start;
    if (mean == 0) {
      mean = time;
    } else {
      mean = 0.1*time + 0.9*mean;
    }
    if (now > reportTime + 2000) {
      var fps = 1000/mean;
      console.log('js fps: ' + Math.round(fps));
      reportTime = now;
    }
  };
})//();
// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module.exports = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function() { throw 'no read() available (jsc?)' };
  }
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (ENVIRONMENT_IS_WEB) {
    Module['print'] = function(x) {
      console.log(x);
    };
    Module['printErr'] = function(x) {
      console.log(x);
    };
    this['Module'] = Module;
  } else if (ENVIRONMENT_IS_WORKER) {
    // We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          alignSize = type.alignSize || QUANTUM_SIZE;
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;
      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }
      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= (+(1)) ? (tempDouble > (+(0)) ? ((Math.min((+(Math.floor((tempDouble)/(+(4294967296))))), (+(4294967295))))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+(4294967296)))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 134217728;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addOnPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 630616;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
var _stdout;
var _stderr;
var _stdout = _stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,152,183,0,0,0,0,1,0,152,183,0,0,0,0,0,0,104,72,255,255,0,0,255,255,104,72,255,255,64,153,1,0,16,140,1,0,0,0,1,0,152,183,0,0,0,0,0,0,104,72,255,255,0,0,255,255,104,72,255,255,0,0,0,0,152,183,0,0,3,0,0,0,0,0,0,0,87,73,77,73,78,85,83,0,5,0,0,0,4,0,0,0,3,0,0,0,2,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,11,0,0,0,10,0,0,0,13,0,0,0,17,0,0,0,1,0,0,0,20,0,0,0,19,0,0,0,18,0,0,0,21,0,0,0,30,0,0,0,0,0,0,0,51,0,0,0,50,0,0,0,49,0,0,0,52,0,0,0,55,0,0,0,3,0,0,0,59,0,0,0,58,0,0,0,57,0,0,0,60,0,0,0,63,0,0,0,2,0,0,0,76,0,0,0,75,0,0,0,74,0,0,0,77,0,0,0,79,0,0,0,2,0,0,0,83,0,0,0,82,0,0,0,81,0,0,0,84,0,0,0,88,0,0,0,5,0,0,0,70,0,0,0,69,0,0,0,67,0,0,0,71,0,0,0,0,0,0,0,1,0,0,0,34,0,0,0,33,0,0,0,32,0,0,0,35,0,0,0,47,0,0,0,6,0,0,0,9,0,0,0,4,0,0,0,3,0,0,0,2,0,0,0,8,0,0,0,5,0,0,0,7,0,0,0,1,0,0,0,0,0,0,0,6,0,0,0,9,0,0,0,4,0,0,0,3,0,0,0,2,0,0,0,8,0,0,0,5,0,0,0,7,0,0,0,1,0,0,0,0,0,0,0,176,94,1,0,8,0,0,0,0,0,0,0,203,0,33,0,64,94,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,93,1,0,8,0,0,0,0,0,0,0,203,0,41,0,40,67,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,66,2,0,0,8,0,0,0,0,0,0,203,0,65,0,176,65,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,65,2,0,0,8,0,0,0,0,0,0,203,0,73,0,224,63,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,63,2,0,0,8,0,0,0,0,0,0,203,0,81,0,64,63,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,62,2,0,0,8,0,0,0,0,0,0,203,0,89,0,112,62,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,62,2,0,0,8,0,0,0,0,0,0,203,0,97,0,64,61,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,59,2,0,0,8,0,0,0,0,0,0,203,0,105,0,72,59,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,58,2,0,0,8,0,0,0,0,0,0,203,0,113,0,152,57,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,57,2,0,0,8,0,0,0,0,0,0,203,0,121,0,208,56,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,56,2,0,0,8,0,0,0,0,0,0,203,0,129,0,8,56,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,55,2,0,8,0,0,0,0,0,0,0,203,0,145,0,16,55,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,45,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,1,0,0,0,0,0,0,240,171,1,0,144,171,1,0,32,171,1,0,240,170,1,0,216,170,1,0,0,0,0,0,87,73,86,67,84,77,83,0,1,0,0,0,0,0,0,0,14,0,0,0,248,146,1,0,210,0,0,0,16,0,0,0,248,146,1,0,211,0,0,0,17,0,0,0,248,146,1,0,212,0,0,0,0,0,0,0,83,101,112,32,32,57,32,50,48,49,51,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,66,0,0,0,0,0,0,0,87,73,77,83,84,84,0,0,87,73,84,73,77,69,0,0,1,0,0,0,0,0,0,0,0,128,255,255,205,76,255,255,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,128,255,255,51,179,0,0,0,128,255,255,51,179,0,0,0,128,255,255,205,76,255,255,87,73,83,85,67,75,83,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,40,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,42,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,4,0,0,0,16,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,5,0,0,0,44,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1,0,0,0,40,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1,0,0,0,42,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,6,0,0,0,36,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,5,0,0,0,44,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,128,0,0,7,0,0,0,12,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,40,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,42,0,0,0,19,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,7,0,0,0,50,0,0,0,23,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,5,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,5,0,0,0,0,0,0,0,25,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,5,0,0,0,0,0,0,0,27,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,5,0,0,0,0,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,29,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,7,0,0,0,44,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,128,0,0,4,0,0,0,12,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,1,128,0,0,3,0,0,0,8,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,1,0,0,0,40,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,1,0,0,0,42,0,0,0,33,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,7,0,0,0,28,0,0,0,37,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,1,0,0,0,7,0,0,0,0,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,2,0,0,0,7,0,0,0,34,0,0,0,39,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,3,0,0,0,7,0,0,0,22,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,4,0,0,0,7,0,0,0,0,0,0,0,41,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,6,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,43,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,7,0,0,0,6,0,0,0,20,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,5,0,0,0,44,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,1,0,0,0,7,0,0,0,0,0,0,0,46,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,33,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,8,128,0,0,5,0,0,0,12,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,9,128,0,0,4,0,0,0,8,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,1,0,0,0,40,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,1,0,0,0,42,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,51,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,4,0,0,0,26,0,0,0,53,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,1,0,0,0,4,0,0,0,26,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,1,0,0,0,0,0,0,0,44,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,128,0,0,5,0,0,0,12,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,1,128,0,0,5,0,0,0,8,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,1,0,0,0,40,0,0,0,57,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,1,0,0,0,42,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,59,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,1,0,0,0,8,0,0,0,18,0,0,0,61,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,1,0,0,0,12,0,0,0,2,0,0,0,62,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,1,0,0,0,0,0,0,0,44,0,0,0,57,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,128,0,0,3,0,0,0,12,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,65,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,2,128,0,0,4,0,0,0,8,0,0,0,66,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,3,128,0,0,4,0,0,0,8,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,2,0,0,0,4,0,0,0,40,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,4,0,0,0,40,0,0,0,67,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,2,0,0,0,1,0,0,0,42,0,0,0,69,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,2,0,0,0,1,0,0,0,14,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,4,0,0,0,30,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,1,0,0,0,4,0,0,0,30,0,0,0,73,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,1,0,0,0,0,0,0,0,44,0,0,0,67,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,1,0,0,0,40,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,1,0,0,0,42,0,0,0,75,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,76,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,3,0,0,0,46,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,1,0,0,0,20,0,0,0,44,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,0,128,0,0,4,0,0,0,12,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,1,128,0,0,4,0,0,0,12,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,1,0,0,0,40,0,0,0,81,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,1,0,0,0,42,0,0,0,82,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,20,0,0,0,24,0,0,0,85,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,1,0,0,0,10,0,0,0,18,0,0,0,86,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,1,0,0,0,10,0,0,0,38,0,0,0,87,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,1,0,0,0,20,0,0,0,44,0,0,0,81,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,128,0,0,11,0,0,0,12,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,1,128,0,0,6,0,0,0,8,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,91,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,1,0,0,0,8,0,0,0,0,0,0,0,92,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,94,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,95,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,96,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,98,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,97,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,3,128,0,0,6,0,0,0,0,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,4,128,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,103,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,102,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,105,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,3,128,0,0,6,0,0,0,0,0,0,0,106,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,4,128,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,107,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,111,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,2,128,0,0,4,0,0,0,0,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,3,128,0,0,4,0,0,0,0,0,0,0,113,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,4,128,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,0,128,0,0,1,0,0,0,0,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,23,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,23,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,115,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,0,128,0,0,8,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,1,128,0,0,8,0,0,0,0,0,0,0,119,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,2,128,0,0,8,0,0,0,148,1,0,0,120,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,3,128,0,0,8,0,0,0,0,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,4,128,0,0,8,0,0,0,0,0,0,0,122,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,5,128,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,0,128,0,0,8,0,0,0,0,0,0,0,124,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,1,128,0,0,8,0,0,0,0,0,0,0,125,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,2,128,0,0,8,0,0,0,0,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,3,128,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,1,128,0,0,8,0,0,0,238,1,0,0,128,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,129,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,3,128,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,131,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,132,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,133,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,134,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,135,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,3,128,0,0,6,0,0,0,0,0,0,0,136,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,4,128,0,0,6,0,0,0,0,0,0,0,137,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,5,128,0,0,6,0,0,0,0,0,0,0,138,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,6,128,0,0,6,0,0,0,0,0,0,0,139,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,7,128,0,0,6,0,0,0,0,0,0,0,140,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,8,128,0,0,6,0,0,0,0,0,0,0,141,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,9,128,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,27,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,143,0,0,0,0,0,0,0,0,0,0,0,27,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,144,0,0,0,0,0,0,0,0,0,0,0,27,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,145,0,0,0,0,0,0,0,0,0,0,0,27,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,146,0,0,0,0,0,0,0,0,0,0,0,27,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,147,0,0,0,0,0,0,0,0,0,0,0,27,0,0,0,3,128,0,0,6,0,0,0,0,0,0,0,148,0,0,0,0,0,0,0,0,0,0,0,27,0,0,0,4,128,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,151,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,153,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,150,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,4,0,0,0,12,0,0,0,0,0,0,0,149,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,5,128,0,0,6,0,0,0,0,0,0,0,154,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,6,0,0,0,4,0,0,0,0,0,0,0,157,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,6,0,0,0,4,0,0,0,32,2,0,0,149,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,7,0,0,0,10,0,0,0,0,0,0,0,159,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,8,0,0,0,10,0,0,0,16,2,0,0,160,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,9,0,0,0,10,0,0,0,34,2,0,0,161,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,10,0,0,0,10,0,0,0,0,0,0,0,162,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,11,0,0,0,10,0,0,0,0,0,0,0,163,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,12,0,0,0,10,0,0,0,0,0,0,0,164,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,13,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,14,0,0,0,5,0,0,0,0,0,0,0,166,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,15,0,0,0,5,0,0,0,80,1,0,0,167,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,16,0,0,0,5,0,0,0,34,2,0,0,168,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,17,0,0,0,5,0,0,0,0,0,0,0,169,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,18,0,0,0,5,0,0,0,0,0,0,0,170,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,19,0,0,0,5,0,0,0,0,0,0,0,171,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,20,0,0,0,5,0,0,0,0,0,0,0,172,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,21,0,0,0,5,0,0,0,0,0,0,0,173,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,22,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,175,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,174,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,0,0,0,0,4,0,0,0,154,0,0,0,177,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,0,0,0,0,4,0,0,0,154,0,0,0,178,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,1,0,0,0,4,0,0,0,154,0,0,0,179,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,1,0,0,0,4,0,0,0,154,0,0,0,180,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,2,0,0,0,4,0,0,0,154,0,0,0,181,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,2,0,0,0,4,0,0,0,154,0,0,0,182,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,3,0,0,0,4,0,0,0,154,0,0,0,183,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,3,0,0,0,4,0,0,0,154,0,0,0,176,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,4,0,0,0,10,0,0,0,56,0,0,0,185,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,5,0,0,0,8,0,0,0,106,0,0,0,186,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,4,0,0,0,8,0,0,0,0,0,0,0,176,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,6,0,0,0,3,0,0,0,0,0,0,0,188,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,6,0,0,0,3,0,0,0,32,2,0,0,176,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,7,0,0,0,5,0,0,0,0,0,0,0,190,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,8,0,0,0,5,0,0,0,66,0,0,0,191,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,9,0,0,0,5,0,0,0,34,2,0,0,192,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,10,0,0,0,5,0,0,0,0,0,0,0,193,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,11,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,12,0,0,0,5,0,0,0,0,0,0,0,195,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,13,0,0,0,5,0,0,0,80,1,0,0,196,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,14,0,0,0,5,0,0,0,34,2,0,0,197,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,15,0,0,0,5,0,0,0,0,0,0,0,198,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,16,0,0,0,5,0,0,0,0,0,0,0,199,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,17,0,0,0,5,0,0,0,0,0,0,0,200,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,18,0,0,0,5,0,0,0,0,0,0,0,201,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,19,0,0,0,5,0,0,0,0,0,0,0,202,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,20,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,10,0,0,0,5,0,0,0,0,0,0,0,204,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,9,0,0,0,5,0,0,0,0,0,0,0,205,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,8,0,0,0,5,0,0,0,0,0,0,0,206,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,7,0,0,0,5,0,0,0,0,0,0,0,176,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,208,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,207,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,210,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,211,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,212,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,213,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,214,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,215,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,216,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,209,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,4,0,0,0,10,0,0,0,56,0,0,0,218,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,5,128,0,0,10,0,0,0,144,1,0,0,219,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,4,0,0,0,10,0,0,0,0,0,0,0,209,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,6,0,0,0,3,0,0,0,0,0,0,0,221,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,6,0,0,0,3,0,0,0,32,2,0,0,209,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,7,0,0,0,5,0,0,0,0,0,0,0,223,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,8,0,0,0,5,0,0,0,66,0,0,0,224,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,9,0,0,0,5,0,0,0,34,2,0,0,225,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,10,0,0,0,5,0,0,0,0,0,0,0,226,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,11,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,12,0,0,0,5,0,0,0,0,0,0,0,228,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,13,0,0,0,5,0,0,0,80,1,0,0,229,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,14,0,0,0,5,0,0,0,34,2,0,0,230,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,15,0,0,0,5,0,0,0,0,0,0,0,231,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,16,0,0,0,5,0,0,0,0,0,0,0,232,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,17,0,0,0,5,0,0,0,0,0,0,0,233,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,18,0,0,0,5,0,0,0,0,0,0,0,234,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,19,0,0,0,5,0,0,0,0,0,0,0,235,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,20,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,11,0,0,0,5,0,0,0,0,0,0,0,237,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,10,0,0,0,5,0,0,0,0,0,0,0,238,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,9,0,0,0,5,0,0,0,0,0,0,0,239,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,8,0,0,0,5,0,0,0,0,0,0,0,240,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,7,0,0,0,5,0,0,0,0,0,0,0,209,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,242,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,241,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,0,0,0,0,2,0,0,0,76,2,0,0,244,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,0,0,0,0,2,0,0,0,76,2,0,0,245,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,1,0,0,0,2,0,0,0,76,2,0,0,246,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,1,0,0,0,2,0,0,0,76,2,0,0,247,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,2,0,0,0,2,0,0,0,76,2,0,0,248,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,2,0,0,0,2,0,0,0,76,2,0,0,249,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,3,0,0,0,2,0,0,0,76,2,0,0,250,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,3,0,0,0,2,0,0,0,76,2,0,0,251,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,4,0,0,0,2,0,0,0,76,2,0,0,252,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,4,0,0,0,2,0,0,0,76,2,0,0,253,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,5,0,0,0,2,0,0,0,76,2,0,0,254,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,5,0,0,0,2,0,0,0,76,2,0,0,243,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,6,128,0,0,0,0,0,0,2,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,6,128,0,0,10,0,0,0,56,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,7,128,0,0,8,0,0,0,178,1,0,0,2,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,8,128,0,0,8,0,0,0,56,0,0,0,3,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,9,128,0,0,8,0,0,0,56,0,0,0,4,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,10,128,0,0,8,0,0,0,56,0,0,0,5,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,11,128,0,0,8,0,0,0,56,0,0,0,6,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,12,128,0,0,8,0,0,0,56,0,0,0,7,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,13,128,0,0,8,0,0,0,56,0,0,0,8,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,14,128,0,0,8,0,0,0,90,1,0,0,9,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,15,128,0,0,20,0,0,0,0,0,0,0,243,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,26,128,0,0,10,0,0,0,0,0,0,0,11,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,27,128,0,0,10,0,0,0,0,0,0,0,12,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,28,128,0,0,10,0,0,0,0,0,0,0,243,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,16,0,0,0,5,0,0,0,0,0,0,0,14,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,16,0,0,0,5,0,0,0,32,2,0,0,243,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,16,0,0,0,7,0,0,0,0,0,0,0,16,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,17,0,0,0,7,0,0,0,66,0,0,0,17,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,18,0,0,0,7,0,0,0,34,2,0,0,18,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,19,0,0,0,7,0,0,0,0,0,0,0,19,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,20,0,0,0,7,0,0,0,0,0,0,0,20,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,21,0,0,0,7,0,0,0,0,0,0,0,21,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,22,0,0,0,7,0,0,0,0,0,0,0,22,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,23,0,0,0,5,0,0,0,0,0,0,0,23,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,24,0,0,0,5,0,0,0,0,0,0,0,24,1,0,0,0,0,0,0,0,0,0,0,31,0,0,0,25,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,128,0,0,2,0,0,0,78,2,0,0,26,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,1,128,0,0,2,0,0,0,94,0,0,0,27,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,128,0,0,2,0,0,0,94,0,0,0,28,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,1,128,0,0,2,0,0,0,94,0,0,0,29,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,2,128,0,0,2,0,0,0,128,0,0,0,30,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,1,128,0,0,2,0,0,0,94,0,0,0,31,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,2,128,0,0,2,0,0,0,94,0,0,0,32,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,1,128,0,0,2,0,0,0,94,0,0,0,33,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,2,128,0,0,2,0,0,0,94,0,0,0,34,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,3,128,0,0,2,0,0,0,94,0,0,0,35,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,2,128,0,0,2,0,0,0,94,0,0,0,36,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,3,128,0,0,2,0,0,0,94,0,0,0,37,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,2,128,0,0,2,0,0,0,94,0,0,0,38,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,3,128,0,0,2,0,0,0,94,0,0,0,39,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,4,128,0,0,2,0,0,0,94,0,0,0,40,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,3,128,0,0,2,0,0,0,94,0,0,0,41,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,4,128,0,0,2,0,0,0,94,0,0,0,42,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,3,128,0,0,2,0,0,0,94,0,0,0,43,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,4,128,0,0,2,0,0,0,128,0,0,0,44,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,5,128,0,0,2,0,0,0,94,0,0,0,45,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,4,128,0,0,2,0,0,0,94,0,0,0,46,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,5,128,0,0,2,0,0,0,94,0,0,0,47,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,4,128,0,0,2,0,0,0,94,0,0,0,48,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,5,128,0,0,2,0,0,0,94,0,0,0,49,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,6,128,0,0,2,0,0,0,94,0,0,0,50,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,7,128,0,0,2,0,0,0,94,0,0,0,51,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,6,128,0,0,2,0,0,0,94,0,0,0,52,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,7,128,0,0,2,0,0,0,94,0,0,0,53,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,6,128,0,0,2,0,0,0,94,0,0,0,54,1,0,0,0,0,0,0,0,0,0,0,32,0,0,0,7,128,0,0,2,0,0,0,94,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,56,1,0,0,0,0,0,0,0,0,0,0,17,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,57,1,0,0,0,0,0,0,0,0,0,0,17,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,58,1,0,0,0,0,0,0,0,0,0,0,17,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,59,1,0,0,0,0,0,0,0,0,0,0,17,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33,0,0,0,0,128,0,0,2,0,0,0,62,2,0,0,61,1,0,0,0,0,0,0,0,0,0,0,33,0,0,0,1,128,0,0,2,0,0,0,62,2,0,0,60,1,0,0,0,0,0,0,0,0,0,0,34,0,0,0,0,128,0,0,8,0,0,0,0,0,0,0,63,1,0,0,0,0,0,0,0,0,0,0,34,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,64,1,0,0,0,0,0,0,0,0,0,0,34,0,0,0,2,128,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,66,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,65,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,2,0,0,0,154,0,0,0,68,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,2,0,0,0,154,0,0,0,69,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,1,0,0,0,2,0,0,0,154,0,0,0,70,1,0,0,0,0,0,0,0,0,0,0].concat([35,0,0,0,1,0,0,0,2,0,0,0,154,0,0,0,71,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,2,0,0,0,2,0,0,0,154,0,0,0,72,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,2,0,0,0,2,0,0,0,154,0,0,0,73,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,3,0,0,0,2,0,0,0,154,0,0,0,74,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,3,0,0,0,2,0,0,0,154,0,0,0,75,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,4,0,0,0,2,0,0,0,154,0,0,0,76,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,4,0,0,0,2,0,0,0,154,0,0,0,77,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,5,0,0,0,2,0,0,0,154,0,0,0,78,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,5,0,0,0,2,0,0,0,154,0,0,0,67,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,6,0,0,0,0,0,0,0,56,0,0,0,80,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,6,0,0,0,6,0,0,0,78,0,0,0,81,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,7,0,0,0,6,0,0,0,56,0,0,0,82,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,8,0,0,0,6,0,0,0,98,0,0,0,67,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,9,128,0,0,0,0,0,0,56,0,0,0,84,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,9,128,0,0,10,0,0,0,56,0,0,0,85,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,10,0,0,0,10,0,0,0,24,0,0,0,86,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,10,0,0,0,10,0,0,0,56,0,0,0,67,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,11,0,0,0,5,0,0,0,0,0,0,0,88,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,11,0,0,0,5,0,0,0,32,2,0,0,67,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,11,0,0,0,7,0,0,0,0,0,0,0,90,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,12,0,0,0,7,0,0,0,0,0,0,0,91,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,13,0,0,0,7,0,0,0,66,0,0,0,92,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,14,0,0,0,7,0,0,0,34,2,0,0,93,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,15,0,0,0,7,0,0,0,0,0,0,0,94,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,16,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35,0,0,0,16,0,0,0,5,0,0,0,0,0,0,0,96,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,15,0,0,0,5,0,0,0,0,0,0,0,97,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,14,0,0,0,5,0,0,0,0,0,0,0,98,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,13,0,0,0,5,0,0,0,0,0,0,0,99,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,12,0,0,0,5,0,0,0,0,0,0,0,100,1,0,0,0,0,0,0,0,0,0,0,35,0,0,0,11,0,0,0,5,0,0,0,0,0,0,0,67,1,0,0,0,0,0,0,0,0,0,0,36,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,102,1,0,0,0,0,0,0,0,0,0,0,36,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,101,1,0,0,0,0,0,0,0,0,0,0,22,0,0,0,1,128,0,0,8,0,0,0,0,0,0,0,104,1,0,0,0,0,0,0,0,0,0,0,22,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,105,1,0,0,0,0,0,0,0,0,0,0,22,0,0,0,3,128,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,15,0,0,0,224,1,0,0,107,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,1,0,0,0,15,0,0,0,224,1,0,0,106,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,4,0,0,0,154,0,0,0,109,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,4,0,0,0,154,0,0,0,110,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,1,0,0,0,4,0,0,0,154,0,0,0,111,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,1,0,0,0,4,0,0,0,154,0,0,0,112,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,2,0,0,0,4,0,0,0,154,0,0,0,113,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,2,0,0,0,4,0,0,0,154,0,0,0,114,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,3,0,0,0,4,0,0,0,154,0,0,0,115,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,3,0,0,0,4,0,0,0,154,0,0,0,116,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,4,0,0,0,4,0,0,0,154,0,0,0,117,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,4,0,0,0,4,0,0,0,154,0,0,0,118,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,5,0,0,0,4,0,0,0,154,0,0,0,119,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,5,0,0,0,4,0,0,0,154,0,0,0,108,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,6,0,0,0,20,0,0,0,126,0,0,0,121,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,7,128,0,0,10,0,0,0,210,0,0,0,122,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,8,0,0,0,5,0,0,0,56,0,0,0,123,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,6,0,0,0,5,0,0,0,56,0,0,0,124,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,7,128,0,0,10,0,0,0,214,0,0,0,125,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,8,0,0,0,5,0,0,0,56,0,0,0,126,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,6,0,0,0,5,0,0,0,56,0,0,0,127,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,7,128,0,0,10,0,0,0,212,0,0,0,128,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,8,0,0,0,5,0,0,0,56,0,0,0,129,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,6,0,0,0,5,0,0,0,56,0,0,0,108,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,9,0,0,0,3,0,0,0,0,0,0,0,131,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,9,0,0,0,3,0,0,0,32,2,0,0,108,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,10,0,0,0,6,0,0,0,0,0,0,0,133,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,11,0,0,0,6,0,0,0,66,0,0,0,134,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,12,0,0,0,6,0,0,0,34,2,0,0,135,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,13,0,0,0,6,0,0,0,0,0,0,0,136,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,14,0,0,0,6,0,0,0,0,0,0,0,137,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,15,0,0,0,6,0,0,0,0,0,0,0,138,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,16,0,0,0,6,0,0,0,0,0,0,0,139,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,17,0,0,0,6,0,0,0,0,0,0,0,140,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,18,0,0,0,6,0,0,0,0,0,0,0,141,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,19,0,0,0,255,255,255,255,52,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,17,0,0,0,5,0,0,0,0,0,0,0,143,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,16,0,0,0,5,0,0,0,0,0,0,0,144,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,15,0,0,0,5,0,0,0,0,0,0,0,145,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,14,0,0,0,5,0,0,0,0,0,0,0,146,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,13,0,0,0,5,0,0,0,0,0,0,0,147,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,12,0,0,0,5,0,0,0,0,0,0,0,148,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,11,0,0,0,5,0,0,0,0,0,0,0,149,1,0,0,0,0,0,0,0,0,0,0,37,0,0,0,10,0,0,0,5,0,0,0,0,0,0,0,108,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,151,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,150,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,153,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,154,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,155,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,156,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,157,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,158,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,159,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,152,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,4,0,0,0,10,0,0,0,56,0,0,0,161,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,5,128,0,0,4,0,0,0,152,1,0,0,162,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,4,128,0,0,4,0,0,0,152,1,0,0,163,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,5,0,0,0,1,0,0,0,202,0,0,0,161,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,6,0,0,0,3,0,0,0,0,0,0,0,165,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,6,0,0,0,3,0,0,0,32,2,0,0,152,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,7,0,0,0,5,0,0,0,0,0,0,0,167,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,8,0,0,0,5,0,0,0,66,0,0,0,168,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,9,0,0,0,5,0,0,0,34,2,0,0,169,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,10,0,0,0,5,0,0,0,0,0,0,0,170,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,11,0,0,0,5,0,0,0,0,0,0,0,171,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,12,0,0,0,5,0,0,0,0,0,0,0,172,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,13,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,38,0,0,0,14,0,0,0,5,0,0,0,0,0,0,0,174,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,15,0,0,0,5,0,0,0,80,1,0,0,175,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,16,0,0,0,5,0,0,0,34,2,0,0,176,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,17,0,0,0,5,0,0,0,0,0,0,0,177,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,18,0,0,0,5,0,0,0,0,0,0,0,178,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,19,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,38,0,0,0,13,0,0,0,5,0,0,0,0,0,0,0,180,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,12,0,0,0,5,0,0,0,0,0,0,0,181,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,11,0,0,0,5,0,0,0,0,0,0,0,182,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,10,0,0,0,5,0,0,0,0,0,0,0,183,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,9,0,0,0,5,0,0,0,0,0,0,0,184,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,8,0,0,0,5,0,0,0,0,0,0,0,185,1,0,0,0,0,0,0,0,0,0,0,38,0,0,0,7,0,0,0,5,0,0,0,0,0,0,0,152,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,187,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,186,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,189,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,190,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,191,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,192,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,193,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,194,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,195,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,188,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,56,0,0,0,197,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,8,0,0,0,56,0,0,0,198,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,122,0,0,0,188,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,2,0,0,0,0,0,0,0,200,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,2,0,0,0,32,2,0,0,188,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,202,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,8,0,0,0,66,0,0,0,203,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,6,0,0,0,0,0,0,0,204,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,6,0,0,0,34,2,0,0,205,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,5,0,0,0,0,0,0,0,207,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,5,0,0,0,80,1,0,0,208,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,5,0,0,0,0,0,0,0,209,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,5,0,0,0,34,2,0,0,210,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,5,0,0,0,0,0,0,0,211,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,5,0,0,0,0,0,0,0,212,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,5,0,0,0,0,0,0,0,213,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,0,0,0,0,0,0,0,215,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,8,0,0,0,0,0,0,0,216,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,6,0,0,0,0,0,0,0,217,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,6,0,0,0,0,0,0,0,218,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,6,0,0,0,0,0,0,0,188,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,220,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,219,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,0,0,0,0,2,0,0,0,154,0,0,0,222,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,0,0,0,0,2,0,0,0,154,0,0,0,223,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,1,0,0,0,2,0,0,0,154,0,0,0,224,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,1,0,0,0,2,0,0,0,154,0,0,0,225,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,2,0,0,0,2,0,0,0,154,0,0,0,226,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,2,0,0,0,2,0,0,0,154,0,0,0,227,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,3,0,0,0,2,0,0,0,154,0,0,0,228,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,3,0,0,0,2,0,0,0,154,0,0,0,221,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,4,0,0,0,8,0,0,0,56,0,0,0,230,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,5,0,0,0,8,0,0,0,56,0,0,0,231,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,6,0,0,0,8,0,0,0,6,2,0,0,221,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,7,0,0,0,2,0,0,0,0,0,0,0,233,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,7,0,0,0,2,0,0,0,32,2,0,0,221,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,235,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,9,0,0,0,8,0,0,0,66,0,0,0,236,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,10,0,0,0,4,0,0,0,0,0,0,0,237,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,11,0,0,0,4,0,0,0,34,2,0,0,238,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,12,0,0,0,4,0,0,0,0,0,0,0,239,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,13,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39,0,0,0,13,0,0,0,5,0,0,0,0,0,0,0,241,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,12,0,0,0,5,0,0,0,0,0,0,0,242,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,11,0,0,0,5,0,0,0,0,0,0,0,243,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,10,0,0,0,5,0,0,0,0,0,0,0,244,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,9,0,0,0,5,0,0,0,0,0,0,0,245,1,0,0,0,0,0,0,0,0,0,0,39,0,0,0,8,0,0,0,5,0,0,0,0,0,0,0,221,1,0,0,0,0,0,0,0,0,0,0,40,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,246,1,0,0,0,0,0,0,0,0,0,0,40,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,247,1,0,0,0,0,0,0,0,0,0,0,40,0,0,0,1,0,0,0,5,0,0,0,56,0,0,0,249,1,0,0,0,0,0,0,0,0,0,0,40,0,0,0,2,0,0,0,5,0,0,0,56,0,0,0,250,1,0,0,0,0,0,0,0,0,0,0,40,0,0,0,3,128,0,0,5,0,0,0,130,1,0,0,247,1,0,0,0,0,0,0,0,0,0,0,40,0,0,0,4,0,0,0,3,0,0,0,0,0,0,0,252,1,0,0,0,0,0,0,0,0,0,0,40,0,0,0,4,0,0,0,3,0,0,0,32,2,0,0,253,1,0,0,0,0,0,0,0,0,0,0,40,0,0,0,5,0,0,0,6,0,0,0,0,0,0,0,247,1,0,0,0,0,0,0,0,0,0,0,40,0,0,0,6,0,0,0,8,0,0,0,0,0,0,0,255,1,0,0,0,0,0,0,0,0,0,0,40,0,0,0,7,0,0,0,8,0,0,0,66,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,40,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,1,2,0,0,0,0,0,0,0,0,0,0,40,0,0,0,9,0,0,0,8,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,40,0,0,0,10,0,0,0,8,0,0,0,34,2,0,0,3,2,0,0,0,0,0,0,0,0,0,0,40,0,0,0,11,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,0,0,0,11,0,0,0,8,0,0,0,0,0,0,0,5,2,0,0,0,0,0,0,0,0,0,0,40,0,0,0,10,0,0,0,8,0,0,0,0,0,0,0,6,2,0,0,0,0,0,0,0,0,0,0,40,0,0,0,9,0,0,0,8,0,0,0,0,0,0,0,7,2,0,0,0,0,0,0,0,0,0,0,40,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,8,2,0,0,0,0,0,0,0,0,0,0,40,0,0,0,7,0,0,0,8,0,0,0,0,0,0,0,9,2,0,0,0,0,0,0,0,0,0,0,40,0,0,0,6,0,0,0,8,0,0,0,0,0,0,0,247,1,0,0,0,0,0,0,0,0,0,0,41,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,11,2,0,0,0,0,0,0,0,0,0,0,41,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,10,2,0,0,0,0,0,0,0,0,0,0,41,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,13,2,0,0,0,0,0,0,0,0,0,0,41,0,0,0,3,128,0,0,6,0,0,0,0,0,0,0,14,2,0,0,0,0,0,0,0,0,0,0,41,0,0,0,4,128,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,42,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,16,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,15,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,18,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,19,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,20,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,21,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,22,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,23,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,24,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,17,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,4,0,0,0,8,0,0,0,56,0,0,0,26,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,5,0,0,0,8,0,0,0,56,0,0,0,27,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,6,0,0,0,8,0,0,0,42,1,0,0,17,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,7,0,0,0,2,0,0,0,0,0,0,0,29,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,7,0,0,0,2,0,0,0,32,2,0,0,17,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,31,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,9,0,0,0,8,0,0,0,66,0,0,0,32,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,10,0,0,0,8,0,0,0,0,0,0,0,33,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,11,0,0,0,8,0,0,0,34,2,0,0,34,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,12,0,0,0,8,0,0,0,0,0,0,0,35,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,13,0,0,0,8,0,0,0,0,0,0,0,36,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,14,0,0,0,255,255,255,255,52,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,42,0,0,0,14,0,0,0,8,0,0,0,0,0,0,0,38,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,13,0,0,0,8,0,0,0,0,0,0,0,39,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,12,0,0,0,8,0,0,0,0,0,0,0,40,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,11,0,0,0,8,0,0,0,0,0,0,0,41,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,10,0,0,0,8,0,0,0,0,0,0,0,42,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,9,0,0,0,8,0,0,0,0,0,0,0,43,2,0,0,0,0,0,0,0,0,0,0,42,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,17,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,45,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,44,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,47,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,48,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,49,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,50,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,51,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,52,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,53,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,46,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,4,0,0,0,8,0,0,0,56,0,0,0,55,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,5,0,0,0,8,0,0,0,56,0,0,0,56,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,6,0,0,0,8,0,0,0,42,1,0,0,46,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,7,0,0,0,2,0,0,0,0,0,0,0,58,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,7,0,0,0,2,0,0,0,32,2,0,0,46,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,60,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,9,0,0,0,8,0,0,0,66,0,0,0,61,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,10,0,0,0,8,0,0,0,0,0,0,0,62,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,11,0,0,0,8,0,0,0,34,2,0,0,63,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,12,0,0,0,8,0,0,0,0,0,0,0,64,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,13,0,0,0,8,0,0,0,0,0,0,0,65,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,14,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43,0,0,0,14,0,0,0,8,0,0,0,0,0,0,0,67,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,13,0,0,0,8,0,0,0,0,0,0,0,68,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,12,0,0,0,8,0,0,0,0,0,0,0,69,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,11,0,0,0,8,0,0,0,0,0,0,0,70,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,10,0,0,0,8,0,0,0,0,0,0,0,71,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,9,0,0,0,8,0,0,0,0,0,0,0,72,2,0,0,0,0,0,0,0,0,0,0,43,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,46,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,0,128,0,0,10,0,0,0,224,1,0,0,74,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,1,128,0,0,10,0,0,0,224,1,0,0,73,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,0,128,0,0,6,0,0,0,154,0,0,0,76,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,1,128,0,0,6,0,0,0,154,0,0,0,75,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,2,128,0,0,10,0,0,0,56,0,0,0,78,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,3,128,0,0,4,0,0,0,194,0,0,0,79,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,2,128,0,0,4,0,0,0,0,0,0,0,80,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,3,128,0,0,4,0,0,0,0,0,0,0,79,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,4,128,0,0,3,0,0,0,0,0,0,0,82,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,4,128,0,0,3,0,0,0,32,2,0,0,75,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,5,128,0,0,6,0,0,0,0,0,0,0,84,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,6,128,0,0,6,0,0,0,66,0,0,0,85,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,7,128,0,0,6,0,0,0,0,0,0,0,86,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,8,128,0,0,6,0,0,0,34,2,0,0,87,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,9,0,0,0,6,0,0,0,0,0,0,0,88,2,0,0,0,0,0,0,0,0,0,0,44,0,0,0,10,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,45,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,90,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,89,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,0,0,0,0,3,0,0,0,30,2,0,0,92,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,93,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,94,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,95,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,2,0,0,0,3,0,0,0,30,2,0,0,96,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,97,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,98,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,99,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,4,0,0,0,3,0,0,0,30,2,0,0,100,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,4,0,0,0,3,0,0,0,154,0,0,0,101,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,5,0,0,0,3,0,0,0,154,0,0,0,102,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,5,0,0,0,3,0,0,0,154,0,0,0,91,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,0,128,0,0,20,0,0,0,56,0,0,0,104,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,6,128,0,0,4,0,0,0,144,1,0,0,105,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,7,128,0,0,4,0,0,0,144,1,0,0,106,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,7,128,0,0,1,0,0,0,190,0,0,0,104,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,8,0,0,0,3,0,0,0,0,0,0,0,108,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,8,0,0,0,3,0,0,0,32,2,0,0,91,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,9,0,0,0,20,0,0,0,66,0,0,0,110,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,10,0,0,0,10,0,0,0,34,2,0,0,111,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,11,0,0,0,10,0,0,0,0,0,0,0,112,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,12,0,0,0,10,0,0,0,0,0,0,0,113,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,13,0,0,0,10,0,0,0,0,0,0,0,114,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,14,0,0,0,10,0,0,0,0,0,0,0,115,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,15,0,0,0,10,0,0,0,0,0,0,0,116,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,16,0,0,0,10,0,0,0,0,0,0,0,117,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,17,0,0,0,10,0,0,0,0,0,0,0,118,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,18,0,0,0,30,0,0,0,0,0,0,0,119,2,0,0,0,0,0,0,0,0,0,0,45,0,0,0,18,0,0,0,255,255,255,255,52,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,46,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,121,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,120,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,0,0,0,0,20,0,0,0,0,0,0,0,123,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,0,0,0,0,3,0,0,0,0,2,0,0,124,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,125,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,126,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,127,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,128,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,129,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,3,0,0,0,3,0,0,0,0,2,0,0,130,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,131,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,4,0,0,0,3,0,0,0,154,0,0,0,132,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,4,0,0,0,3,0,0,0,154,0,0,0,133,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,5,0,0,0,3,0,0,0,154,0,0,0,134,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,5,0,0,0,3,0,0,0,154,0,0,0,123,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,0,128,0,0,20,0,0,0,56,0,0,0,136,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,6,128,0,0,4,0,0,0,184,1,0,0,137,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,7,128,0,0,4,0,0,0,0,0,0,0,138,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,7,128,0,0,1,0,0,0,190,0,0,0,136,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,8,0,0,0,3,0,0,0,0,0,0,0,140,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,8,0,0,0,3,0,0,0,32,2,0,0,123,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,9,0,0,0,20,0,0,0,66,0,0,0,142,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,10,0,0,0,7,0,0,0,34,2,0,0,143,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,11,0,0,0,7,0,0,0,0,0,0,0,144,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,12,0,0,0,7,0,0,0,0,0,0,0,145,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,13,0,0,0,7,0,0,0,0,0,0,0,146,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,14,0,0,0,7,0,0,0,0,0,0,0,147,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,15,0,0,0,255,255,255,255,52,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,46,0,0,0,15,0,0,0,5,0,0,0,0,0,0,0,149,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,14,0,0,0,5,0,0,0,0,0,0,0,150,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,13,0,0,0,5,0,0,0,0,0,0,0,151,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,12,0,0,0,5,0,0,0,0,0,0,0,152,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,11,0,0,0,5,0,0,0,0,0,0,0,153,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,10,0,0,0,5,0,0,0,0,0,0,0,154,2,0,0,0,0,0,0,0,0,0,0,46,0,0,0,9,0,0,0,5,0,0,0,0,0,0,0,123,2,0,0,0,0,0,0,0,0,0,0,47,0,0,0,0,128,0,0,5,0,0,0,0,0,0,0,156,2,0,0,0,0,0,0,0,0,0,0,47,0,0,0,1,128,0,0,5,0,0,0,0,0,0,0,155,2,0,0,0,0,0,0,0,0,0,0,48,0,0,0,0,128,0,0,5,0,0,0,0,0,0,0,158,2,0,0,0,0,0,0,0,0,0,0,48,0,0,0,1,128,0,0,5,0,0,0,0,0,0,0,159,2,0,0,0,0,0,0,0,0,0,0,48,0,0,0,2,128,0,0,5,0,0,0,0,0,0,0,160,2,0,0,0,0,0,0,0,0,0,0,48,0,0,0,3,128,0,0,5,0,0,0,0,0,0,0,161,2,0,0,0,0,0,0,0,0,0,0,48,0,0,0,4,128,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,49,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,163,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,162,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,0,0,0,0,3,0,0,0,210,1,0,0,165,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,166,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,167,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,168,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,169,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,170,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,3,0,0,0,3,0,0,0,30,2,0,0,171,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,164,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,4,0,0,0,6,0,0,0,56,0,0,0,173,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,5,0,0,0,12,0,0,0,168,0,0,0,174,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,4,0,0,0,12,0,0,0,56,0,0,0,175,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,5,0,0,0,12,0,0,0,168,0,0,0,176,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,4,0,0,0,12,0,0,0,56,0,0,0,177,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,5,0,0,0,12,0,0,0,168,0,0,0,164,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,6,0,0,0,10,0,0,0,32,2,0,0,164,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,7,0,0,0,10,0,0,0,0,0,0,0,180,2,0,0])
.concat([0,0,0,0,0,0,0,0,49,0,0,0,8,0,0,0,10,0,0,0,66,0,0,0,181,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,9,0,0,0,10,0,0,0,0,0,0,0,182,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,10,0,0,0,10,0,0,0,0,0,0,0,183,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,11,0,0,0,10,0,0,0,0,0,0,0,184,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,12,0,0,0,10,0,0,0,34,2,0,0,185,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,13,0,0,0,10,0,0,0,0,0,0,0,186,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,14,0,0,0,10,0,0,0,0,0,0,0,187,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,15,0,0,0,30,0,0,0,0,0,0,0,188,2,0,0,0,0,0,0,0,0,0,0,49,0,0,0,15,0,0,0,255,255,255,255,52,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,189,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,191,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,192,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,193,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,195,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,190,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,3,0,0,0,5,0,0,0,56,0,0,0,197,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,4,0,0,0,5,0,0,0,56,0,0,0,198,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,5,128,0,0,5,0,0,0,56,0,0,0,199,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,5,128,0,0,0,0,0,0,18,1,0,0,190,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,201,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,6,0,0,0,6,0,0,0,32,2,0,0,190,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,7,128,0,0,8,0,0,0,0,0,0,0,203,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,8,128,0,0,8,0,0,0,66,0,0,0,204,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,9,128,0,0,8,0,0,0,0,0,0,0,205,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,10,128,0,0,8,0,0,0,0,0,0,0,206,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,11,128,0,0,8,0,0,0,68,0,0,0,207,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,12,128,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,12,0,0,0,8,0,0,0,0,0,0,0,209,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,11,0,0,0,8,0,0,0,0,0,0,0,210,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,10,0,0,0,8,0,0,0,0,0,0,0,211,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,9,0,0,0,8,0,0,0,0,0,0,0,212,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,213,2,0,0,0,0,0,0,0,0,0,0,50,0,0,0,7,0,0,0,8,0,0,0,0,0,0,0,190,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,215,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,214,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,217,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,0,0,0,0,3,0,0,0,154,0,0,0,218,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,219,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,1,0,0,0,3,0,0,0,154,0,0,0,220,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,221,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,2,0,0,0,3,0,0,0,154,0,0,0,222,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,223,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,3,0,0,0,3,0,0,0,154,0,0,0,216,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,4,0,0,0,10,0,0,0,56,0,0,0,225,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,5,0,0,0,10,0,0,0,56,0,0,0,226,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,6,128,0,0,4,0,0,0,152,1,0,0,227,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,5,0,0,0,6,0,0,0,56,0,0,0,228,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,6,128,0,0,4,0,0,0,152,1,0,0,229,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,5,0,0,0,1,0,0,0,202,0,0,0,225,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,7,0,0,0,3,0,0,0,0,0,0,0,231,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,7,0,0,0,3,0,0,0,32,2,0,0,216,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,8,0,0,0,5,0,0,0,0,0,0,0,233,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,9,0,0,0,5,0,0,0,66,0,0,0,234,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,10,0,0,0,5,0,0,0,34,2,0,0,235,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,11,0,0,0,5,0,0,0,0,0,0,0,236,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,12,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,0,0,13,0,0,0,5,0,0,0,0,0,0,0,238,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,14,0,0,0,5,0,0,0,80,1,0,0,239,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,15,0,0,0,5,0,0,0,34,2,0,0,240,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,16,0,0,0,5,0,0,0,0,0,0,0,241,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,17,0,0,0,5,0,0,0,0,0,0,0,242,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,18,0,0,0,5,0,0,0,0,0,0,0,243,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,19,0,0,0,5,0,0,0,0,0,0,0,244,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,20,0,0,0,5,0,0,0,0,0,0,0,245,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,21,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,0,0,12,0,0,0,5,0,0,0,0,0,0,0,247,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,11,0,0,0,5,0,0,0,0,0,0,0,248,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,10,0,0,0,5,0,0,0,0,0,0,0,249,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,9,0,0,0,5,0,0,0,0,0,0,0,250,2,0,0,0,0,0,0,0,0,0,0,51,0,0,0,8,0,0,0,5,0,0,0,0,0,0,0,216,2,0,0,0,0,0,0,0,0,0,0,52,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,251,2,0,0,0,0,0,0,0,0,0,0,52,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,253,2,0,0,0,0,0,0,0,0,0,0,52,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,52,0,0,0,2,0,0,0,6,0,0,0,66,0,0,0,255,2,0,0,0,0,0,0,0,0,0,0,52,0,0,0,3,0,0,0,6,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,52,0,0,0,4,0,0,0,6,0,0,0,0,0,0,0,1,3,0,0,0,0,0,0,0,0,0,0,52,0,0,0,5,0,0,0,6,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,52,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,52,0,0,0,7,0,0,0,6,0,0,0,0,0,0,0,4,3,0,0,0,0,0,0,0,0,0,0,52,0,0,0,8,0,0,0,6,0,0,0,0,0,0,0,5,3,0,0,0,0,0,0,0,0,0,0,52,0,0,0,9,0,0,0,6,0,0,0,0,0,0,0,6,3,0,0,0,0,0,0,0,0,0,0,52,0,0,0,10,0,0,0,6,0,0,0,26,0,0,0,7,3,0,0,0,0,0,0,0,0,0,0,52,0,0,0,11,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,52,0,0,0,12,0,0,0,4,0,0,0,0,0,0,0,9,3,0,0,0,0,0,0,0,0,0,0,52,0,0,0,12,0,0,0,8,0,0,0,32,2,0,0,251,2,0,0,0,0,0,0,0,0,0,0,53,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,53,0,0,0,1,0,0,0,36,0,0,0,66,1,0,0,10,3,0,0,0,0,0,0,0,0,0,0,53,0,0,0,0,0,0,0,100,0,0,0,196,0,0,0,13,3,0,0,0,0,0,0,0,0,0,0,53,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,14,3,0,0,0,0,0,0,0,0,0,0,53,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,15,3,0,0,0,0,0,0,0,0,0,0,53,0,0,0,0,0,0,0,255,255,255,255,162,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,16,3,0,0,0,0,0,0,0,0,0,0,51,0,0,0,0,0,0,0,181,0,0,0,64,1,0,0,18,3,0,0,0,0,0,0,0,0,0,0,51,0,0,0,0,0,0,0,150,0,0,0,14,1,0,0,18,3,0,0,0,0,0,0,0,0,0,0,54,0,0,0,0,128,0,0,3,0,0,0,216,1,0,0,20,3,0,0,0,0,0,0,0,0,0,0,54,0,0,0,1,128,0,0,3,0,0,0,136,0,0,0,21,3,0,0,0,0,0,0,0,0,0,0,54,0,0,0,2,128,0,0,3,0,0,0,136,0,0,0,22,3,0,0,0,0,0,0,0,0,0,0,54,0,0,0,3,128,0,0,3,0,0,0,136,0,0,0,19,3,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,128,0,0,4,0,0,0,94,0,0,0,24,3,0,0,0,0,0,0,0,0,0,0,32,0,0,0,1,128,0,0,4,0,0,0,94,0,0,0,25,3,0,0,0,0,0,0,0,0,0,0,32,0,0,0,2,128,0,0,4,0,0,0,94,0,0,0,26,3,0,0,0,0,0,0,0,0,0,0,32,0,0,0,3,128,0,0,4,0,0,0,94,0,0,0,27,3,0,0,0,0,0,0,0,0,0,0,32,0,0,0,4,128,0,0,4,0,0,0,94,0,0,0,28,3,0,0,0,0,0,0,0,0,0,0,32,0,0,0,5,128,0,0,4,0,0,0,94,0,0,0,29,3,0,0,0,0,0,0,0,0,0,0,32,0,0,0,6,128,0,0,4,0,0,0,94,0,0,0,30,3,0,0,0,0,0,0,0,0,0,0,32,0,0,0,7,128,0,0,4,0,0,0,94,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,1,128,0,0,10,0,0,0,0,0,0,0,32,3,0,0,0,0,0,0,0,0,0,0,22,0,0,0,2,128,0,0,10,0,0,0,0,0,0,0,33,3,0,0,0,0,0,0,0,0,0,0,22,0,0,0,3,128,0,0,10,0,0,0,60,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,55,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,35,3,0,0,0,0,0,0,0,0,0,0,55,0,0,0,1,128,0,0,7,0,0,0,0,0,0,0,34,3,0,0,0,0,0,0,0,0,0,0,56,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,37,3,0,0,0,0,0,0,0,0,0,0,56,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,36,3,0,0,0,0,0,0,0,0,0,0,57,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,39,3,0,0,0,0,0,0,0,0,0,0,57,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,38,3,0,0,0,0,0,0,0,0,0,0,58,0,0,0,0,128,0,0,5,0,0,0,0,0,0,0,41,3,0,0,0,0,0,0,0,0,0,0,58,0,0,0,1,128,0,0,5,0,0,0,66,0,0,0,42,3,0,0,0,0,0,0,0,0,0,0,58,0,0,0,2,128,0,0,5,0,0,0,0,0,0,0,43,3,0,0,0,0,0,0,0,0,0,0,58,0,0,0,3,128,0,0,10,0,0,0,238,1,0,0,44,3,0,0,0,0,0,0,0,0,0,0,58,0,0,0,4,128,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,59,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,46,3,0,0,0,0,0,0,0,0,0,0,59,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,47,3,0,0,0,0,0,0,0,0,0,0,59,0,0,0,2,128,0,0,4,0,0,0,0,0,0,0,45,3,0,0,0,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,49,3,0,0,0,0,0,0,0,0,0,0,60,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,50,3,0,0,0,0,0,0,0,0,0,0,60,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,51,3,0,0,0,0,0,0,0,0,0,0,60,0,0,0,3,0,0,0,6,0,0,0,0,0,0,0,52,3,0,0,0,0,0,0,0,0,0,0,60,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,53,3,0,0,0,0,0,0,0,0,0,0,60,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,48,3,0,0,0,0,0,0,0,0,0,0,61,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,55,3,0,0,0,0,0,0,0,0,0,0,61,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,56,3,0,0,0,0,0,0,0,0,0,0,61,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,57,3,0,0,0,0,0,0,0,0,0,0,61,0,0,0,3,0,0,0,6,0,0,0,0,0,0,0,58,3,0,0,0,0,0,0,0,0,0,0,61,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,59,3,0,0,0,0,0,0,0,0,0,0,61,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,54,3,0,0,0,0,0,0,0,0,0,0,62,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,61,3,0,0,0,0,0,0,0,0,0,0,62,0,0,0,1,128,0,0,10,0,0,0,0,0,0,0,60,3,0,0,0,0,0,0,0,0,0,0,63,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,63,3,0,0,0,0,0,0,0,0,0,0,63,0,0,0,1,128,0,0,10,0,0,0,0,0,0,0,62,3,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,65,3,0,0,0,0,0,0,0,0,0,0,64,0,0,0,1,128,0,0,10,0,0,0,0,0,0,0,64,3,0,0,0,0,0,0,0,0,0,0,65,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,67,3,0,0,0,0,0,0,0,0,0,0,65,0,0,0,1,128,0,0,10,0,0,0,0,0,0,0,66,3,0,0,0,0,0,0,0,0,0,0,66,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,69,3,0,0,0,0,0,0,0,0,0,0,66,0,0,0,1,128,0,0,10,0,0,0,0,0,0,0,68,3,0,0,0,0,0,0,0,0,0,0,67,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,71,3,0,0,0,0,0,0,0,0,0,0,67,0,0,0,1,128,0,0,10,0,0,0,0,0,0,0,70,3,0,0,0,0,0,0,0,0,0,0,68,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,69,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,75,3,0,0,0,0,0,0,0,0,0,0,70,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,76,3,0,0,0,0,0,0,0,0,0,0,70,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,77,3,0,0,0,0,0,0,0,0,0,0,70,0,0,0,3,128,0,0,6,0,0,0,0,0,0,0,78,3,0,0,0,0,0,0,0,0,0,0,70,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,79,3,0,0,0,0,0,0,0,0,0,0,70,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,74,3,0,0,0,0,0,0,0,0,0,0,71,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,81,3,0,0,0,0,0,0,0,0,0,0,71,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,82,3,0,0,0,0,0,0,0,0,0,0,71,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,83,3,0,0,0,0,0,0,0,0,0,0,71,0,0,0,3,128,0,0,6,0,0,0,0,0,0,0,80,3,0,0,0,0,0,0,0,0,0,0,72,0,0,0,0,128,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,73,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,86,3,0,0,0,0,0,0,0,0,0,0,73,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,87,3,0,0,0,0,0,0,0,0,0,0,73,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,88,3,0,0,0,0,0,0,0,0,0,0,73,0,0,0,3,128,0,0,6,0,0,0,0,0,0,0,85,3,0,0,0,0,0,0,0,0,0,0,74,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,90,3,0,0,0,0,0,0,0,0,0,0,74,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,91,3,0,0,0,0,0,0,0,0,0,0,74,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,92,3,0,0,0,0,0,0,0,0,0,0,74,0,0,0,3,128,0,0,6,0,0,0,0,0,0,0,89,3,0,0,0,0,0,0,0,0,0,0,75,0,0,0,0,128,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,76,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,95,3,0,0,0,0,0,0,0,0,0,0,76,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,96,3,0,0,0,0,0,0,0,0,0,0,76,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,97,3,0,0,0,0,0,0,0,0,0,0,76,0,0,0,3,128,0,0,6,0,0,0,0,0,0,0,98,3,0,0,0,0,0,0,0,0,0,0,76,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,99,3,0,0,0,0,0,0,0,0,0,0,76,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,94,3,0,0,0,0,0,0,0,0,0,0,77,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,101,3,0,0,0,0,0,0,0,0,0,0,77,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,100,3,0,0,0,0,0,0,0,0,0,0,78,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,81,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,82,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,85,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,86,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,87,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,89,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,90,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,91,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,92,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,93,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,94,0,0,0,0,128,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,95,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,121,3,0,0,0,0,0,0,0,0,0,0,96,0,0,0,1,0,0,0,15,0,0,0,0,0,0,0,122,3,0,0,0,0,0,0,0,0,0,0,96,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,123,3,0,0,0,0,0,0,0,0,0,0,96,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,120,3,0,0,0,0,0,0,0,0,0,0,28,0,0,0,13,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,18,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,97,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,98,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,99,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,130,3,0,0,0,0,0,0,0,0,0,0,100,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,129,3,0,0,0,0,0,0,0,0,0,0,101,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,133,3,0,0,0,0,0,0,0,0,0,0,102,0,0,0,1,0,0,0,8,0,0,0,0,0,0,0,132,3,0,0,0,0,0,0,0,0,0,0,103,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,105,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,106,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,107,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,109,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,110,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,111,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,0,0,0,0,128,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,113,0,0,0,0,128,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,114,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,115,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,116,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,117,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,118,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,150,3,0,0,0,0,0,0,0,0,0,0,118,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,151,3,0,0,0,0,0,0,0,0,0,0,118,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,152,3,0,0,0,0,0,0,0,0,0,0,118,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,149,3,0,0,0,0,0,0,0,0,0,0,119,0,0,0,0,128,0,0,6,0,0,0,0,0,0,0,154,3,0,0,0,0,0,0,0,0,0,0,119,0,0,0,1,128,0,0,6,0,0,0,0,0,0,0,155,3,0,0,0,0,0,0,0,0,0,0,119,0,0,0,2,128,0,0,6,0,0,0,0,0,0,0,153,3,0,0,0,0,0,0,0,0,0,0,120,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,157,3,0,0,0,0,0,0,0,0,0,0,120,0,0,0,1,0,0,0,14,0,0,0,0,0,0,0,156,3,0,0,0,0,0,0,0,0,0,0,121,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,159,3,0,0,0,0,0,0,0,0,0,0,121,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,160,3,0,0,0,0,0,0,0,0,0,0,121,0,0,0,2,128,0,0,4,0,0,0,0,0,0,0,161,3,0,0,0,0,0,0,0,0,0,0,121,0,0,0,3,128,0,0,4,0,0,0,0,0,0,0,158,3,0,0,0,0,0,0,0,0,0,0,122,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,163,3,0,0,0,0,0,0,0,0,0,0,122,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,164,3,0,0,0,0,0,0,0,0,0,0,122,0,0,0,2,128,0,0,4,0,0,0,0,0,0,0,165,3,0,0,0,0,0,0,0,0,0,0,122,0,0,0,3,128,0,0,4,0,0,0,0,0,0,0,162,3,0,0,0,0,0,0,0,0,0,0,123,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,167,3,0,0,0,0,0,0,0,0,0,0,123,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,168,3,0,0,0,0,0,0,0,0,0,0,123,0,0,0,2,128,0,0,4,0,0,0,0,0,0,0,169,3,0,0,0,0,0,0,0,0,0,0,123,0,0,0,3,128,0,0,4,0,0,0,0,0,0,0,166,3,0,0,0,0,0,0,0,0,0,0,124,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,171,3,0,0,0,0,0,0,0,0,0,0,124,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,172,3,0,0,0,0,0,0,0,0,0,0,124,0,0,0,2,128,0,0,4,0,0,0,0,0,0,0,173,3,0,0,0,0,0,0,0,0,0,0,124,0,0,0,3,128,0,0,4,0,0,0,0,0,0,0,170,3,0,0,0,0,0,0,0,0,0,0,125,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,175,3,0,0,0,0,0,0,0,0,0,0,125,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,176,3,0,0,0,0,0,0,0,0,0,0,125,0,0,0,2,128,0,0,4,0,0,0,0,0,0,0,177,3,0,0,0,0,0,0,0,0,0,0,125,0,0,0,3,128,0,0,4,0,0,0,0,0,0,0,174,3,0,0,0,0,0,0,0,0,0,0,126,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,179,3,0,0,0,0,0,0,0,0,0,0,126,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,180,3,0,0,0,0,0,0,0,0,0,0,126,0,0,0,2,128,0,0,4,0,0,0,0,0,0,0,181,3,0,0,0,0,0,0,0,0,0,0,126,0,0,0,3,128,0,0,4,0,0,0,0,0,0,0,178,3,0,0,0,0,0,0,0,0,0,0,127,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,129,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,130,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,133,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,134,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,135,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,192,3,0,0,0,0,0,0,0,0,0,0,136,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,193,3,0,0,0,0,0,0,0,0,0,0,136,0,0,0,2,128,0,0,4,0,0,0,0,0,0,0,194,3,0,0,0,0,0,0,0,0,0,0,136,0,0,0,3,128,0,0,4,0,0,0,0,0,0,0,191,3,0,0,0,0,0,0,0,0,0,0,137,0,0,0,0,128,0,0,4,0,0,0,0,0,0,0,196,3,0,0,0,0,0,0,0,0,0,0,137,0,0,0,1,128,0,0,4,0,0,0,0,0,0,0,197,3,0,0,0,0,0,0,0,0,0,0,137,0,0,0,2,128,0,0,4,0,0,0,0,0,0,0,198,3,0,0,0,0,0,0,0,0,0,0,137,0,0,0,3,128,0,0,4,0,0,0,0,0,0,0,195,3,0,0,0,0,0,0,0,0,0,0,138,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,199,3,0,0,0,0,0,0,0,0,0,0,22,0,0,0,0,128,0,0,232,3,0,0,62,1,0,0,200,3,0,0,0,0,0,0,0,0,0,0,22,0,0,0,1,128,0,0,4,0,0,0,66,0,0,0,202,3,0,0,0,0,0,0,0,0,0,0,22,0,0,0,2,128,0,0,6,0,0,0,214,1,0,0,203,3,0,0,0,0,0,0,0,0,0,0,22,0,0,0,3,128,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,139,0,0,0,0,0,0,0,10,0,0,0,224,1,0,0,205,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,1,0,0,0,10,0,0,0,224,1,0,0,204,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,0,0,0,0,2,0,0,0,154,0,0,0,207,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,0,0,0,0,2,0,0,0,154,0,0,0,208,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,1,0,0,0,2,0,0,0,154,0,0,0,209,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,1,0,0,0,2,0,0,0,154,0,0,0,210,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,2,0,0,0,2,0,0,0,154,0,0,0,211,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,2,0,0,0,2,0,0,0,154,0,0,0,212,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,3,0,0,0,2,0,0,0,154,0,0,0,213,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,3,0,0,0,2,0,0,0,154,0,0,0,206,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,4,0,0,0,8,0,0,0,56,0,0,0,215,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,5,0,0,0,8,0,0,0,56,0,0,0,216,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,6,0,0,0,8,0,0,0,6,2,0,0,206,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,7,0,0,0,2,0,0,0,0,0,0,0,218,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,7,0,0,0,2,0,0,0,32,2,0,0,206,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,220,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,9,0,0,0,8,0,0,0,66,0,0,0,221,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,10,0,0,0,4,0,0,0,0,0,0,0,222,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,11,0,0,0,4,0,0,0,34,2,0,0,223,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,12,0,0,0,4,0,0,0,0,0,0,0,224,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,13,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,139,0,0,0,13,0,0,0,5,0,0,0,0,0,0,0,226,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,12,0,0,0,5,0,0,0,0,0,0,0,227,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,11,0,0,0,5,0,0,0,0,0,0,0,228,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,10,0,0,0,5,0,0,0,0,0,0,0,229,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,9,0,0,0,5,0,0,0,0,0,0,0,230,3,0,0,0,0,0,0,0,0,0,0,139,0,0,0,8,0,0,0,5,0,0,0,0,0,0,0,206,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255])
.concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,1,128,0,0,8,0,0,0,46,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,80,53,2,0,4,32,0,0,0,0,0,0,203,0,39,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,52,2,0,8,0,0,0,0,0,0,0,203,0,47,0,160,51,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,51,2,0,8,0,0,0,0,0,0,0,203,0,55,0,248,50,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,50,2,0,8,0,0,0,0,0,0,0,203,0,63,0,224,49,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,49,2,0,4,32,0,0,0,0,0,0,203,0,79,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,49,2,0,8,0,0,0,0,0,0,0,203,0,87,0,152,48,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,47,2,0,0,16,0,0,0,0,0,0,203,0,95,0,40,47,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,45,2,0,0,16,0,0,0,0,0,0,203,0,103,0,96,45,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,44,2,0,0,16,0,0,0,0,0,0,203,0,111,0,88,44,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,43,2,0,0,16,0,0,0,0,0,0,203,0,119,0,104,43,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,42,2,0,0,16,0,0,0,0,0,0,203,0,127,0,144,42,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,41,2,0,0,16,0,0,0,0,0,0,203,0,135,0,160,41,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,40,2,0,0,16,0,0,0,0,0,0,203,0,143,0,104,40,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,40,2,0,0,16,0,0,0,0,0,0,203,0,151,0,232,39,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,45,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,122,0,0,0,0,0,0,128,135,9,0,0,0,0,0,128,135,9,0,0,0,0,0,128,135,9,0,0,0,0,0,128,135,9,0,0,0,0,0,128,135,9,0,0,0,0,0,83,84,70,83,84,48,49,0,72,49,2,0,200,58,2,0,248,14,2,0,32,205,1,0,176,175,1,0,128,156,1,0,96,143,1,0,216,128,1,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,224,13,2,0,216,53,2,0,208,11,2,0,24,202,1,0,184,173,1,0,120,155,1,0,152,142,1,0,176,127,1,0,248,111,1,0,120,98,1,0,192,65,2,0,88,59,2,0,96,53,2,0,0,48,2,0,16,42,2,0,80,38,2,0,248,33,2,0,80,30,2,0,128,26,2,0,112,23,2,0,128,19,2,0,144,15,2,0,160,11,2,0,200,7,2,0,16,3,2,0,208,255,1,0,40,240,1,0,232,225,1,0,32,217,1,0,144,213,1,0,40,210,1,0,160,205,1,0,216,201,1,0,152,197,1,0,232,192,1,0,48,190,1,0,136,187,1,0,32,185,1,0,224,182,1,0,88,180,1,0,16,178,1,0,8,176,1,0,152,173,1,0,152,171,1,0,64,168,1,0,136,166,1,0,80,164,1,0,104,162,1,0,48,161,1,0,208,159,1,0,56,158,1,0,168,156,1,0,80,155,1,0,168,153,1,0,104,151,1,0,224,149,1,0,144,148,1,0,136,147,1,0,120,146,1,0,160,145,1,0,184,144,1,0,136,143,1,0,120,142,1,0,120,140,1,0,96,138,1,0,104,137,1,0,200,135,1,0,72,134,1,0,176,132,1,0,160,131,1,0,112,130,1,0,8,129,1,0,144,127,1,0,72,126,1,0,88,124,1,0,64,123,1,0,80,122,1,0,208,120,1,0,176,118,1,0,248,116,1,0,144,115,1,0,152,113,1,0,192,111,1,0,112,110,1,0,144,107,1,0,32,106,1,0,200,104,1,0,192,103,1,0,240,102,1,0,8,102,1,0,16,101,1,0,160,99,1,0,88,98,1,0,128,97,1,0,56,96,1,0,144,95,1,0,40,95,1,0,168,94,1,0,56,94,1,0,232,93,1,0,32,67,2,0,112,66,2,0,168,65,2,0,248,64,2,0,216,63,2,0,128,63,2,0,56,63,2,0,200,62,2,0,104,62,2,0,0,62,2,0,56,61,2,0,232,59,2,0,64,59,2,0,88,58,2,0,144,57,2,0,24,57,2,0,200,56,2,0,112,56,2,0,0,56,2,0,144,55,2,0,8,55,2,0,80,54,2,0,72,53,2,0,168,52,2,0,152,51,2,0,72,51,2,0,240,50,2,0,88,50,2,0,216,49,2,0,112,49,2,0,248,48,2,0,144,48,2,0,232,47,2,0,0,47,2,0,208,45,2,0,88,45,2,0,208,44,2,0,80,44,2,0,200,43,2,0,96,43,2,0,0,0,0,0,0,0,0,0,240,125,1,0,0,0,0,0,87,73,83,67,82,84,50,0,100,0,0,0,0,0,0,0,17,43,0,0,0,0,0,0,1,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,77,95,83,75,85,76,76,49,0,77,95,83,75,85,76,76,50,0,0,0,0,0,0,0,24,0,0,0,40,0,0,0,112,218,0,0,128,3,0,0,80,124,0,0,152,93,1,0,72,247,0,0,208,202,0,0,184,87,1,0,96,233,0,0,120,76,1,0,0,0,0,0,87,73,79,83,84,83,0,0,0,0,0,0,28,0,0,0,32,0,0,0,4,0,0,0,144,45,2,0,0,0,0,0,51,51,0,0,0,0,0,0,0,0,2,0,0,0,0,0,216,208,1,0,0,0,0,0,232,24,2,0,0,0,0,0,40,25,2,0,0,0,0,0,88,25,2,0,0,0,0,0,152,25,2,0,0,0,0,0,208,25,2,0,0,0,0,0,56,26,2,0,0,0,0,0,112,16,2,0,0,0,0,0,40,17,2,0,0,0,0,0,136,17,2,0,0,0,0,0,136,26,2,0,0,0,0,0,200,17,2,0,0,0,0,0,8,18,2,0,0,0,0,0,80,18,2,0,0,0,0,0,128,18,2,0,0,0,0,0,184,18,2,0,0,0,0,0,56,19,2,0,0,0,0,0,136,19,2,0,0,0,0,0,144,20,2,0,0,0,0,0,200,20,2,0,0,0,0,0,64,21,2,0,0,0,0,0,72,27,2,0,0,0,0,0,136,21,2,0,0,0,0,0,192,21,2,0,0,0,0,0,240,21,2,0,0,0,0,0,112,22,2,0,0,0,0,0,176,22,2,0,0,0,0,0,16,23,2,0,0,0,0,0,120,23,2,0,0,0,0,0,0,24,2,0,0,0,0,0,56,24,2,0,0,0,0,0,176,24,2,0,0,0,0,0,136,27,2,0,0,0,0,0,240,218,1,0,0,0,0,0,120,220,1,0,0,0,0,0,96,221,1,0,0,0,0,0,8,223,1,0,0,0,0,0,136,224,1,0,0,0,0,0,0,226,1,0,0,0,0,0,120,54,2,0,0,0,0,0,192,2,2,0,0,0,0,0,104,1,2,0,0,0,0,0,32,1,2,0,0,0,0,0,24,3,2,0,0,0,0,0,224,1,2,0,0,0,0,0,160,1,2,0,0,0,0,0,80,2,2,0,0,0,0,0,24,2,2,0,0,0,0,0,8,255,1,0,0,0,0,0,208,254,1,0,0,0,0,0,136,255,1,0,0,0,0,0,216,255,1,0,0,0,0,0,128,0,2,0,0,0,0,0,184,0,2,0,0,0,0,0,8,144,1,0,0,0,0,0,208,66,2,0,0,0,0,0,40,159,1,0,0,0,0,0,152,129,1,0,0,0,0,0,88,157,1,0,0,0,0,0,24,114,1,0,0,0,0,0,64,179,1,0,0,0,0,0,24,212,1,0,0,0,0,0,128,36,2,0,0,0,0,0,208,36,2,0,0,0,0,0,8,37,2,0,0,0,0,0,232,37,2,0,0,0,0,0,96,38,2,0,0,0,0,0,8,39,2,0,0,0,0,0,240,27,2,0,0,0,0,0,56,28,2,0,0,0,0,0,144,28,2,0,0,0,0,0,64,39,2,0,0,0,0,0,216,28,2,0,0,0,0,0,48,29,2,0,0,0,0,0,112,29,2,0,0,0,0,0,0,30,2,0,0,0,0,0,96,30,2,0,0,0,0,0,0,31,2,0,0,0,0,0,72,31,2,0,0,0,0,0,152,31,2,0,0,0,0,0,224,31,2,0,0,0,0,0,40,32,2,0,0,0,0,0,144,39,2,0,0,0,0,0,104,32,2,0,0,0,0,0,240,32,2,0,0,0,0,0,48,33,2,0,0,0,0,0,160,33,2,0,0,0,0,0,8,34,2,0,0,0,0,0,248,34,2,0,0,0,0,0,56,35,2,0,0,0,0,0,176,35,2,0,0,0,0,0,232,35,2,0,0,0,0,0,56,36,2,0,0,0,0,0,200,39,2,0,0,0,0,0,224,124,1,0,0,0,0,0,136,137,1,0,0,0,0,0,16,133,1,0,0,0,0,0,224,129,1,0,0,0,0,0,184,126,1,0,0,0,0,0,120,138,1,0,0,0,0,0,152,134,1,0,0,0,0,0,216,130,1,0,0,0,0,0,8,128,1,0,0,0,0,0,160,140,1,0,0,0,0,0,160,136,1,0,0,0,0,0,16,132,1,0,0,0,0,0,184,123,1,0,0,0,0,0,128,121,1,0,0,0,0,0,176,122,1,0,0,0,0,0,88,228,1,0,0,0,0,0,232,228,1,0,0,0,0,0,224,229,1,0,0,0,0,0,216,231,1,0,0,0,0,0,72,233,1,0,0,0,0,0,120,234,1,0,0,0,0,0,72,60,2,0,0,0,0,0,32,100,1,0,0,0,0,0,224,38,2,0,0,0,0,0,184,42,2,0,0,0,0,0,192,48,2,0,0,0,0,0,80,10,2,0,0,0,0,0,136,10,2,0,0,0,0,0,200,10,2,0,0,0,0,0,80,11,2,0,0,0,0,0,168,11,2,0,0,0,0,0,136,8,2,0,0,0,0,0,48,9,2,0,0,0,0,0,184,9,2,0,0,0,0,0,224,8,2,0,0,0,0,0,152,117,1,0,0,0,0,0,24,10,2,0,0,0,0,0,104,57,2,0,0,0,0,0,184,57,2,0,0,0,0,0,176,58,2,0,0,0,0,0,128,59,2,0,0,0,0,0,144,60,2,0,0,0,0,0,128,61,2,0,0,0,0,0,64,62,2,0,0,0,0,0,160,62,2,0,0,0,0,0,16,63,2,0,0,0,0,0,96,63,2,0,0,0,0,0,176,63,2,0,0,0,0,0,24,64,2,0,0,0,0,0,80,65,2,0,0,0,0,0,248,65,2,0,0,0,0,0,248,66,2,0,0,0,0,0,72,67,2,0,0,0,0,0,16,94,1,0,0,0,0,0,128,94,1,0,0,0,0,0,240,94,1,0,0,0,0,0,104,95,1,0,0,0,0,0,168,95,1,0,0,0,0,0,120,96,1,0,0,0,0,0,216,97,1,0,0,0,0,0,208,98,1,0,0,0,0,0,120,100,1,0,0,0,0,0,120,101,1,0,0,0,0,0,112,102,1,0,0,0,0,0,80,103,1,0,0,0,0,0,40,104,1,0,0,0,0,0,88,105,1,0,0,0,0,0,184,106,1,0,0,0,0,0,40,108,1,0,0,0,0,0,168,110,1,0,0,0,0,0,128,112,1,0,0,0,0,0,104,114,1,0,0,0,0,0,48,116,1,0,0,0,0,0,224,12,2,0,0,0,0,0,32,13,2,0,0,0,0,0,96,13,2,0,0,0,0,0,152,13,2,0,0,0,0,0,232,13,2,0,0,0,0,0,32,14,2,0,0,0,0,0,96,14,2,0,0,0,0,0,240,14,2,0,0,0,0,0,160,15,2,0,0,0,0,0,160,12,2,0,0,0,0,0,192,51,2,0,0,0,0,0,0,53,2,0,0,0,0,0,120,53,2,0,0,0,0,0,216,54,2,0,0,0,0,0,56,55,2,0,0,0,0,0,216,55,2,0,0,0,0,0,0,40,2,0,0,0,0,0,64,40,2,0,0,0,0,0,136,40,2,0,0,0,0,0,72,56,2,0,0,0,0,0,200,40,2,0,0,0,0,0,184,41,2,0,0,0,0,0,32,42,2,0,0,0,0,0,200,42,2,0,0,0,0,0,16,43,2,0,0,0,0,0,152,43,2,0,0,0,0,0,0,44,2,0,0,0,0,0,168,44,2,0,0,0,0,0,40,45,2,0,0,0,0,0,120,45,2,0,0,0,0,0,160,56,2,0,0,0,0,0,248,45,2,0,0,0,0,0,64,47,2,0,0,0,0,0,16,48,2,0,0,0,0,0,208,48,2,0,0,0,0,0,24,49,2,0,0,0,0,0,152,49,2,0,0,0,0,0,32,50,2,0,0,0,0,0,200,50,2,0,0,0,0,0,24,51,2,0,0,0,0,0,104,51,2,0,0,0,0,0,240,56,2,0,0,0,0,0,16,183,1,0,0,0,0,0,120,190,1,0,0,0,0,0,168,166,1,0,0,0,0,0,224,197,1,0,0,0,0,0,200,171,1,0,0,0,0,0,152,210,1,0,0,0,0,0,160,142,1,0,0,0,0,0,200,143,1,0,0,0,0,0,248,153,1,0,0,0,0,0,152,151,1,0,0,0,0,0,248,159,1,0,0,0,0,0,96,158,1,0,0,0,0,0,176,180,1,0,0,0,0,0,240,187,1,0,0,0,0,0,216,144,1,0,0,0,0,0,120,164,1,0,0,0,0,0,0,228,1,0,0,0,0,0,48,207,1,0,0,0,0,0,56,202,1,0,0,0,0,0,104,168,1,0,0,0,0,0,184,145,1,0,0,0,0,0,64,178,1,0,0,0,0,0,200,173,1,0,0,0,0,0,160,217,1,0,0,0,0,0,88,161,1,0,0,0,0,0,144,162,1,0,0,0,0,0,152,146,1,0,0,0,0,0,168,147,1,0,0,0,0,0,136,155,1,0,0,0,0,0,8,157,1,0,0,0,0,0,88,185,1,0,0,0,0,0,32,193,1,0,0,0,0,0,184,148,1,0,0,0,0,0,64,176,1,0,0,0,0,0,24,150,1,0,0,0,0,0,216,241,1,0,0,0,0,0,40,214,1,0,0,0,0,0,112,119,1,0,0,0,0,0,160,3,2,0,0,0,0,0,88,8,2,0,0,0,0,0,112,12,2,0,0,0,0,0,48,16,2,0,0,0,0,0,104,20,2,0,0,0,0,0,192,34,2,0,0,0,0,0,88,0,2,0,0,0,0,0,192,246,1,0,0,0,0,0,240,248,1,0,0,0,0,0,0,251,1,0,0,0,0,0,240,252,1,0,0,0,0,0,16,96,1,0,0,0,0,0,16,22,2,0,0,0,0,0,232,30,2,0,0,0,0,0,232,23,2,0,0,0,0,0,40,27,2,0,0,0,0,0,184,218,1,0,0,0,0,0,152,213,1,0,0,0,0,0,136,218,1,0,0,0,0,0,80,215,1,0,0,0,0,0,160,215,1,0,0,0,0,0,184,214,1,0,0,0,0,0,216,216,1,0,0,0,0,0,248,217,1,0,0,0,0,0,216,212,1,0,0,0,0,0,72,216,1,0,0,0,0,0,32,218,1,0,0,0,0,0,40,217,1,0,0,0,0,0,40,213,1,0,0,0,0,0,128,216,1,0,0,0,0,0,24,216,1,0,0,0,0,0,104,214,1,0,0,0,0,0,208,215,1,0,0,0,0,0,88,236,1,0,0,0,0,0,232,236,1,0,0,0,0,0,248,237,1,0,0,0,0,0,48,240,1,0,0,0,0,0,24,242,1,0,0,0,0,0,192,244,1,0,0,0,0,0,248,4,2,0,0,0,0,0,160,4,2,0,0,0,0,0,40,4,2,0,0,0,0,0,240,3,2,0,0,0,0,0,136,5,2,0,0,0,0,0,240,5,2,0,0,0,0,0,176,6,2,0,0,0,0,0,56,6,2,0,0,0,0,0,208,7,2,0,0,0,0,0,40,7,2,0,0,0,0,0,201,7,0,0,0,0,0,0,0,8,109,220,222,241,149,107,75,248,254,140,16,66,74,21,211,47,80,242,154,27,205,128,161,89,77,36,95,110,85,48,212,140,211,249,22,79,200,50,28,188,52,140,202,120,68,145,62,70,184,190,91,197,152,224,149,104,25,178,252,182,202,182,141,197,4,81,181,242,145,42,39,227,156,198,225,193,219,93,122,175,249,0,175,143,70,239,46,246,163,53,163,109,168,135,2,235,25,92,20,145,138,77,69,166,78,176,173,212,166,113,94,161,41,50,239,49,111,164,70,60,2,37,171,75,136,156,11,56,42,146,138,229,73,146,77,61,98,196,135,106,63,197,195,86,96,203,113,101,170,247,181,113,80,250,108,7,255,237,129,226,79,107,112,166,103,241,24,223,239,120,198,58,60,82,128,3,184,66,143,224,145,224,81,206,163,45,63,90,168,114,59,33,159,95,28,139,123,98,125,196,15,70,194,253,54,14,109,226,71,17,161,93,186,87,244,138,20,52,123,251,26,36,17,46,52,231,232,76,31,221,84,37,216,165,212,106,197,242,98,43,39,175,254,145,190,84,118,222,187,136,120,163,236,249,40,174,1,0,144,173,1,0,80,173,1,0,56,173,1,0,255,255,255,255,0,0,0,0,10,0,0,0,10,0,0,0,30,0,0,0,10,0,0,0,100,0,0,0,20,0,0,0,100,0,0,0,0,0,0,0,80,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,80,0,0,0,93,0,0,0,95,0,0,0,31,0,0,0,56,0,0,0,72,0,0,0,78,0,0,0,52,0,0,0,57,0,0,0,26,0,0,0,27,0,0,0,31,0,0,0,35,0,0,0,36,0,0,0,38,0,0,0,52,0,0,0,1,0,0,0,0,0,0,0,47,46,112,114,98,111,111,109,0,0,0,0,0,0,0,0,3,0,0,0,2,0,0,0,4,0,0,0,6,0,0,0,224,61,2,0,112,55,2,0,88,49,2,0,64,43,2,0,0,0,255,255,0,0,0,0,146,36,1,0,0,0,0,0,146,36,1,0,0,0,0,0,73,146,0,0,36,73,0,0,146,36,1,0,0,0,0,0,73,146,0,0,220,182,255,255,0,0,255,255,0,0,0,0,220,182,254,255,36,73,0,0,0,0,255,255,0,0,0,0,220,182,254,255,220,182,255,255,36,73,255,255,0,0,0,0,0,0,255,255,36,73,0,0,36,73,255,255,0,0,0,0,0,0,255,255,220,182,255,255,80,70,85,66,50,0,0,0,80,70,85,66,49,0,0,0,87,73,80,67,78,84,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,75,0,0,0,120,0,0,0,90,0,0,0,165,0,0,0,180,0,0,0,180,0,0,0,30,0,0,0,165,0,0,0,0,0,0,0,90,0,0,0,90,0,0,0,90,0,0,0,120,0,0,0,90,0,0,0,104,1,0,0,240,0,0,0,30,0,0,0,170,0,0,0,0,0,0,0,90,0,0,0,45,0,0,0,90,0,0,0,150,0,0,0,90,0,0,0,90,0,0,0,165,0,0,0,30,0,0,0,135,0,0,0,87,73,80,65,82,0,0,0,1,0,0,0,0,0,0,0,77,95,77,83,71,79,70,70,0,77,95,77,83,71,79,78,0,0,0,0,0,0,0,0,20,236,6,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,149,0,0,0,100,0,0,0,150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,156,0,0,0,255,0,0,0,25,0,0,0,0,0,0,0,154,0,0,0,158,0,0,0,165,0,0,0,57,0,0,0,0,0,0,0,0,0,16,0,0,0,56,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,12,0,2,0,0,0,0,0,0,0,0,0,0,0,0,188,11,0,0,174,0,0,0,20,0,0,0,176,0,0,0,36,0,0,0,8,0,0,0,1,0,0,0,187,0,0,0,200,0,0,0,27,0,0,0,0,0,0,0,184,0,0,0,189,0,0,0,194,0,0,0,59,0,0,0,8,0,0,0,0,0,20,0,0,0,56,0,100,0,0,0,0,0,0,0,75,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,203,0,0,0,0,0,0,0,9,0,0,0,207,0,0,0,30,0,0,0,209,0,0,0,37,0,0,0,8,0,0,0,0,0,0,0,220,0,0,0,170,0,0,0,27,0,0,0,0,0,0,0,217,0,0,0,222,0,0,0,227,0,0,0,60,0,0,0,8,0,0,0,0,0,20,0,0,0,56,0,100,0,0,0,0,0,0,0,75,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,236,0,0,0,0,0,0,0,64,0,0,0,241,0,0,0,188,2,0,0,243,0,0,0,48,0,0,0,8,0,0,0,0,0,0,0,13,1,0,0,10,0,0,0,28,0,0,0,0,0,0,0,255,0,0,0,15,1,0,0,0,0,0,0,71,0,0,0,15,0,0,0,0,0,20,0,0,0,56,0,244,1,0,0,0,0,0,0,80,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,25,1,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,2,0,64,0,0,0,0,0,0,0,0,0,0,0,0,66,0,0,0,65,1,0,0,44,1,0,0,67,1,0,0,106,0,0,0,8,0,0,0,0,0,0,0,87,1,0,0,100,0,0,0,27,0,0,0,79,1,0,0,83,1,0,0,89,1,0,0,0,0,0,0,74,0,0,0,10,0,0,0,0,0,20,0,0,0,56,0,244,1,0,0,0,0,0,0,105,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,95,1,0,0,0,0,0,0,255,255,255,255,60,1,0,0,232,3,0,0,0,0,0,0,107,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,62,1,0,0,0,0,0,0,82,0,0,0,0,0,10,0,0,0,11,0,0,0,8,0,100,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,16,6,1,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,55,1,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,2,0,64,0,0,0,0,0,0,0,0,0,0,0,0,67,0,0,0,106,1,0,0,88,2,0,0,108,1,0,0,49,0,0,0,8,0,0,0,0,0,0,0,130,1,0,0,80,0,0,0,29,0,0,0,0,0,0,0,120,1,0,0,132,1,0,0,0,0,0,0,100,0,0,0,8,0,0,0,0,0,48,0,0,0,64,0,232,3,0,0,0,0,0,0,75,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,142,1,0,0,0,0,0,0,255,255,255,255,101,1,0,0,232,3,0,0,0,0,0,0,16,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,103,1,0,0,0,0,0,0,17,0,0,0,0,0,20,0,0,0,6,0,0,0,8,0,100,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,16,6,1,64,0,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,150,1,0,0,70,0,0,0,152,1,0,0,37,0,0,0,8,0,0,0,0,0,0,0,164,1,0,0,170,0,0,0,27,0,0,0,0,0,0,0,160,1,0,0,166,1,0,0,173,1,0,0,60,0,0,0,8,0,0,0,0,0,20,0,0,0,56,0,100,0,0,0,0,0,0,0,75,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,179,1,0,0,0,0,0,0,185,11,0,0,186,1,0,0,60,0,0,0,188,1,0,0,39,0,0,0,8,0,0,0,0,0,0,0,199,1,0,0,200,0,0,0,27,0,0,0,196,1,0,0,196,1,0,0,201,1,0,0,206,1,0,0,62,0,0,0,8,0,0,0,0,0,20,0,0,0,56,0,100,0,0,0,0,0,0,0,76,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,214,1,0,0,0,0,0,0,186,11,0,0,219,1,0,0,150,0,0,0,221,1,0,0,41,0,0,0,8,0,0,0,52,0,0,0,232,1,0,0,180,0,0,0,26,0,0,0,229,1,0,0,0,0,0,0,234,1,0,0,0,0,0,0,64,0,0,0,10,0,0,0,0,0,30,0,0,0,56,0,144,1,0,0,0,0,0,0,77,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,240,1,0,0,0,0,0,0,58,0,0,0,219,1,0,0,150,0,0,0,221,1,0,0,41,0,0,0,8,0,0,0,52,0,0,0,232,1,0,0,180,0,0,0,26,0,0,0,229,1,0,0,0,0,0,0,234,1,0,0,0,0,0,0,64,0,0,0,10,0,0,0,0,0,30,0,0,0,56,0,144,1,0,0,0,0,0,0,77,0,0,0,0,0,0,0,6,0,68,0,0,0,0,0,240,1,0,0,0,0,0,0,189,11,0,0,246,1,0,0,144,1,0,0,247,1,0,0,42,0,0,0,8,0,0,0,0,0,0,0,251,1,0,0,128,0,0,0,26,0,0,0,0,0,0,0,248,1,0,0,254,1,0,0,0,0,0,0,65,0,0,0,8,0,0,0,0,0,31,0,0,0,56,0,144,1,0,0,0,0,0,0,77,0,0,0,0,0,0,0,6,66,64,0,0,0,0,0,4,2,0,0,0,0,0,0,187,11,0,0,15,2,0,0,232,3,0,0,17,2,0,0,43,0,0,0,8,0,0,0,0,0,0,0,28,2,0,0,50,0,0,0,26,0,0,0,25,2,0,0,25,2,0,0,30,2,0,0,0,0,0,0,67,0,0,0,8,0,0,0,0,0,24,0,0,0,64,0,232,3,0,0,0,0,0,0,77,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,37,2,0,0,0,0,0,0,255,255,255,255,10,2,0,0,232,3,0,0,0,0,0,0,16,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,2,0,0,0,0,0,0,17,0,0,0,0,0,15,0,0,0,6,0,0,0,8,0,100,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,16,6,1,64,0,0,0,0,0,0,0,0,0,0,0,0,69,0,0,0,44,2,0,0,244,1,0,0,46,2,0,0,47,0,0,0,8,0,0,0,0,0,0,0,57,2,0,0,50,0,0,0,26,0,0,0,54,2,0,0,54,2,0,0,59,2,0,0,0,0,0,0,72,0,0,0,8,0,0,0,0,0,24,0,0,0,64,0,232,3,0,0,0,0,0,0,77,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,66,2,0,0,0,0,0,0,190,11,0,0,73,2,0,0,100,0,0,0,75,2,0,0,0,0,0,0,8,0,0,0,51,0,0,0,81,2,0,0,0,1,0,0,26,0,0,0,0,0,0,0,77,2,0,0,83,2,0,0,0,0,0,0,17,0,0,0,8,0,0,0,0,0,16,0,0,0,56,0,50,0,0,0,3,0,0,0,77,0,0,0,0,0,0,0,6,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,89,2,0,0,184,11,0,0,91,2,0,0,45,0,0,0,8,0,0,0,2,0,0,0,107,2,0,0,40,0,0,0,26,0,0,0,0,0,0,0,103,2,0,0,109,2,0,0,0,0,0,0,69,0,0,0,12,0,0,0,0,0,128,0,0,0,100,0,232,3,0,0,0,0,0,0,77,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,68,0,0,0,120,2,0,0,244,1,0,0,122,2,0,0,46,0,0,0,8,0,0,0,0,0,0,0,139,2,0,0,128,0,0,0,26,0,0,0,0,0,0,0,135,2,0,0,141,2,0,0,0,0,0,0,70,0,0,0,12,0,0,0,0,0,64,0,0,0,64,0,88,2,0,0,0,0,0,0,78,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,148,2,0,0,0,0,0,0,16,0,0,0,162,2,0,0,160,15,0,0,164,2,0,0,44,0,0,0,8,0,0,0,0,0,0,0,178,2,0,0,20,0,0,0,26,0,0,0,0,0,0,0,172,2,0,0,179,2,0,0,0,0,0,0,68,0,0,0,16,0,0,0,0,0,40,0,0,0,110,0,232,3,0,0,0,0,0,0,77,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,71,0,0,0,189,2,0,0,144,1,0,0,190,2,0,0,50,0,0,0,8,0,0,0,0,0,0,0,200,2,0,0,128,0,0,0,30,0,0,0,0,0,0,0,196,2,0,0,202,2,0,0,0,0,0,0,73,0,0,0,8,0,0,0,0,0,31,0,0,0,56,0,144,1,0,0,0,0,0,0,77,0,0,0,0,0,0,0,6,66,64,0,0,0,0,0,208,2,0,0,0,0,0,0,84,0,0,0,214,2,0,0,50,0,0,0,216,2,0,0,101,0,0,0,8,0,0,0,0,0,0,0,230,2,0,0,170,0,0,0,27,0,0,0,0,0,0,0,224,2,0,0,232,2,0,0,237,2,0,0,102,0,0,0,8,0,0,0,0,0,20,0,0,0,56,0,100,0,0,0,0,0,0,0,75,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,246,2,0,0,0,0,0,0,72,0,0,0,251,2,0,0,100,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,8,3,0,0,0,1,0,0,103,0,0,0,0,0,0,0,0,0,0,0,252,2,0,0,0,0,0,0,104,0,0,0,0,0,0,0,0,0,16,0,0,0,72,0,128,150,152,0,0,0,0,0,0,0,0,0,0,0,0,0,6,3,64,0,0,0,0,0,0,0,0,0,0,0,0,0,88,0,0,0,10,3,0,0,250,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,11,3,0,0,255,0,0,0,97,0,0,0,0,0,0,0,0,0,0,0,12,3,0,0,0,0,0,0,98,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,128,150,152,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,89,0,0,0,16,3,0,0,232,3,0,0,17,3,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,32,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,87,0,0,0,0,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,32,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,19,3,0,0,232,3,0,0,0,0,0,0,94,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,0,10,0,0,0,6,0,0,0,32,0,100,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,16,22,1,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,23,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,2,0,64,0,0,0,0,0,0,0,0,0,0,0,0,243,7,0,0,38,3,0,0,20,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,3,0,0,0,0,0,0,82,0,0,0,0,0,0,0,0,0,10,0,0,0,42,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,97,0,0,0,232,3,0,0,0,0,0,0,16,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,99,0,0,0,0,0,0,0,17,0,0,0,0,0,10,0,0,0,6,0,0,0,8,0,100,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,16,6,1,64,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,102,0,0,0,232,3,0,0,0,0,0,0,16,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,17,0,0,0,0,0,10,0,0,0,6,0,0,0,8,0,100,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,16,6,1,64,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,114,0,0,0,232,3,0,0,0,0,0,0,14,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,127,0,0,0,0,0,0,0,82,0,0,0,0,0,20,0,0,0,11,0,0,0,8,0,100,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,16,6,1,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,107,0,0,0,232,3,0,0,0,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,109,0,0,0,0,0,0,0,17,0,0,0,0,0,25,0,0,0,13,0,0,0,8,0,100,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,16,6,1,64,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,115,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,117,0,0,0,0,0,0,0,15,0,0,0,0,0,25,0,0,0,13,0,0,0,8,0,100,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,16,6,1,64,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,155,2,0,0,232,3,0,0,0,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,157,2,0,0,0,0,0,0,17,0,0,0,0,0,25,0,0,0,13,0,0,0,8,0,100,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,16,6,1,64,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,93,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,2,0,64,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,90,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,130,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,2,0,64,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,142,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,2,0,64,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,123,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,226,7,0,0,34,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,227,7,0,0,36,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,222,7,0,0,48,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,223,7,0,0,54,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,60,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,62,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,64,3,0,0,232,3,0,0,0,0,0,0])
.concat([0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,39,0,0,0,70,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,38,0,0,0,68,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,40,0,0,0,66,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,219,7,0,0,72,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,220,7,0,0,73,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,221,7,0,0,74,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,128,64,0,0,0,0,0,0,0,0,0,0,0,0,230,7,0,0,80,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,128,64,0,0,0,0,0,0,0,0,0,0,0,0,231,7,0,0,84,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,232,7,0,0,85,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,128,64,0,0,0,0,0,0,0,0,0,0,0,0,233,7,0,0,93,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,234,7,0,0,94,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,253,7,0,0,100,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,89,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,128,64,0,0,0,0,0,0,0,0,0,0,0,0,215,7,0,0,102,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,103,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,218,7,0,0,104,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,7,0,0,105,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,7,0,0,106,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,107,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,7,0,0,108,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,8,0,0,109,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,110,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,214,7,0,0,111,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,210,7,0,0,112,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,213,7,0,0,113,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,211,7,0,0,114,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,212,7,0,0,115,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,209,7,0,0,116,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,82,0,0,0,117,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,85,0,0,0,191,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,86,0,0,0,195,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,236,7,0,0,118,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,139,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,140,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,141,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33,0,0,0,142,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,145,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,156,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,41,0,0,0,149,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,42,0,0,0,153,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43,0,0,0,146,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,44,0,0,0,158,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,45,0,0,0,162,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,46,0,0,0,166,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,55,0,0,0,170,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,174,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,57,0,0,0,178,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,47,0,0,0,138,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,0,0,0,148,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,143,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35,0,0,0,144,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,49,0,0,0,120,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,68,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,134,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,84,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,0,0,0,135,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,84,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,52,0,0,0,136,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,68,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,53,0,0,0,137,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,52,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,59,0,0,0,134,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,84,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,136,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,68,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,61,0,0,0,135,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,52,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,62,0,0,0,137,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,52,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,63,0,0,0,120,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,68,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,3,2,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,164,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,193,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,239,1,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,0,0,0,88,2,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,205,1,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,226,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,173,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,173,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,126,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,127,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,27,0,0,0,128,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,129,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,131,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,132,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,54,0,0,0,147,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,45,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,73,0,0,0,182,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,88,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,183,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,88,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,75,0,0,0,184,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,64,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,76,0,0,0,185,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,64,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,77,0,0,0,186,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,64,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,187,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,64,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,188,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,189,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,81,0,0,0,190,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,16,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,137,19,0,0,199,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,138,19,0,0,199,3,0,0,232,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,3,0,0,204,3,0,0,244,1,0,0,206,3,0,0,109,0,0,0,8,0,0,0,110,0,0,0,217,3,0,0,180,0,0,0,113,0,0,0,214,3,0,0,0,0,0,0,219,3,0,0,0,0,0,0,112,0,0,0,10,0,0,0,0,0,12,0,0,0,28,0,100,0,0,0,0,0,0,0,111,0,0,0,0,0,0,0,6,0,64,0,0,0,0,0,225,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,197,1,0,16,0,0,0,0,0,0,0,230,0,39,0,128,196,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,195,1,0,16,0,0,0,0,0,0,0,230,0,55,0,80,195,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,194,1,0,16,0,0,0,0,0,0,0,230,0,71,0,80,194,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,193,1,0,0,16,0,0,0,0,0,0,230,0,95,0,136,193,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,193,1,0,8,0,0,0,0,0,0,0,230,0,111,0,216,192,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,45,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,201,0,0,0,0,0,0,200,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,200,0,0,0,50,0,0,0,44,1,0,0,50,0,0,0,200,0,0,0,0,0,0,0,200,0,0,0,0,0,0,0,160,128,0,0,72,128,0,0,240,127,0,0,208,127,0,0,200,127,0,0,192,127,0,0,184,127,0,0,176,127,0,0,168,127,0,0,152,128,0,0,144,128,0,0,136,128,0,0,128,128,0,0,120,128,0,0,112,128,0,0,104,128,0,0,96,128,0,0,88,128,0,0,80,128,0,0,64,128,0,0,56,128,0,0,48,128,0,0,40,128,0,0,32,128,0,0,24,128,0,0,16,128,0,0,8,128,0,0,0,128,0,0,248,127,0,0,232,127,0,0,224,127,0,0,216,127,0,0,136,130,0,0,48,130,0,0,216,129,0,0,184,129,0,0,176,129,0,0,168,129,0,0,160,129,0,0,152,129,0,0,144,129,0,0,128,130,0,0,120,130,0,0,112,130,0,0,104,130,0,0,96,130,0,0,88,130,0,0,80,130,0,0,72,130,0,0,64,130,0,0,56,130,0,0,40,130,0,0,32,130,0,0,24,130,0,0,16,130,0,0,8,130,0,0,0,130,0,0,248,129,0,0,240,129,0,0,232,129,0,0,224,129,0,0,208,129,0,0,200,129,0,0,192,129,0,0,32,134,0,0,200,133,0,0,112,133,0,0,80,133,0,0,72,133,0,0,64,133,0,0,56,133,0,0,48,133,0,0,40,133,0,0,24,134,0,0,16,134,0,0,8,134,0,0,0,134,0,0,248,133,0,0,240,133,0,0,232,133,0,0,224,133,0,0,216,133,0,0,208,133,0,0,192,133,0,0,184,133,0,0,176,133,0,0,168,133,0,0,160,133,0,0,152,133,0,0,144,133,0,0,136,133,0,0,128,133,0,0,120,133,0,0,104,133,0,0,96,133,0,0,88,133,0,0,208,132,0,0,200,132,0,0,192,132,0,0,184,132,0,0,176,132,0,0,168,132,0,0,160,132,0,0,152,132,0,0,144,132,0,0,136,132,0,0,128,132,0,0,120,132,0,0,112,132,0,0,104,132,0,0,96,132,0,0,88,132,0,0,80,132,0,0,72,132,0,0,64,132,0,0,56,132,0,0,48,132,0,0,40,132,0,0,32,132,0,0,24,132,0,0,16,132,0,0,8,132,0,0,0,132,0,0,248,131,0,0,240,131,0,0,232,131,0,0,224,131,0,0,216,131,0,0,208,131,0,0,200,131,0,0,192,131,0,0,184,131,0,0,72,9,1,0,72,9,1,0,72,9,1,0,72,9,1,0,72,9,1,0,72,9,1,0,72,9,1,0,72,9,1,0,72,9,1,0,0,0,0,0,112,0,0,0,88,0,0,0,64,0,0,0,32,0,0,0,0,1,2,4,5,7,8,9,10,11,12,13,14,15,16,0,185,0,0,0,164,0,0,0,148,0,0,0,143,0,0,0,69,0,0,0,122,0,0,0,209,0,0,0,102,0,0,0,116,0,0,0,89,0,0,0,166,0,0,0,55,0,0,0,71,0,0,0,56,0,0,0,135,0,0,0,29,0,0,0,71,0,0,0,24,0,0,0,254,0,0,0,25,0,0,0,97,0,0,0,50,0,0,0,188,0,0,0,64,0,0,0,128,0,0,0,78,0,0,0,214,0,0,0,92,0,0,0,133,0,0,0,130,0,0,0,208,0,0,0,136,0,0,0,148,0,0,0,140,0,0,0,235,0,0,0,158,0,0,0,156,0,0,0,168,0,0,0,48,0,0,0,154,0,0,0,174,0,0,0,95,0,0,0,9,1,0,0,75,0,0,0,130,0,0,0,48,0,0,0,23,1,0,0,23,0,0,0,198,0,0,0,48,0,0,0,140,0,0,0,25,0,0,0,25,1,0,0,136,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,87,73,79,83,84,75,0,0,87,73,75,73,76,82,83,0,72,161,1,0,4,32,0,0,0,0,0,0,160,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,121,1,0,0,4,0,0,2,0,0,0,160,0,39,0,144,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,118,1,0,0,4,0,0,2,0,0,0,160,0,47,0,72,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,117,1,0,0,4,0,0,2,0,0,0,160,0,55,0,64,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,115,1,0,0,4,0,0,2,0,0,0,160,0,63,0,80,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,113,1,0,0,4,0,0,2,0,0,0,160,0,71,0,152,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,111,1,0,0,4,0,0,2,0,0,0,160,0,79,0,120,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,110,1,0,0,4,0,0,2,0,0,0,160,0,87,0,96,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,107,1,0,0,4,0,0,2,0,0,0,160,0,95,0,112,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,106,1,0,0,4,0,0,2,0,0,0,160,0,103,0,160,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,104,1,0,0,4,0,0,2,0,0,0,160,0,111,0,136,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,103,1,0,0,4,0,0,2,0,0,0,160,0,119,0,128,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,103,1,0,4,32,0,0,0,0,0,0,160,0,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,102,1,0,0,4,0,0,1,0,0,0,160,0,135,0,240,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,101,1,0,0,4,0,0,1,0,0,0,160,0,143,0,120,183,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,99,1,0,0,4,0,0,1,0,0,0,160,0,151,0,124,183,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,98,1,0,0,4,0,0,1,0,0,0,160,0,159,0,128,183,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,97,1,0,0,4,0,0,1,0,0,0,160,0,167,0,132,183,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,180,1,0,0,4,0,0,1,0,0,0,160,0,175,0,248,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,96,1,0,0,4,0,0,1,0,0,0,160,0,183,0,216,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,138,1,0,0,33,0,0,0,0,0,0,57,0,191,0,176,209,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,137,1,0,4,32,0,0,0,0,0,0,160,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,135,1,0,0,4,0,0,1,0,0,0,160,0,39,0,112,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,134,1,0,0,4,0,0,1,0,0,0,160,0,47,0,104,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,132,1,0,0,4,0,0,1,0,0,0,160,0,55,0,96,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,131,1,0,0,4,0,0,1,0,0,0,160,0,63,0,88,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,130,1,0,0,4,0,0,1,0,0,0,160,0,71,0,80,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,129,1,0,0,4,0,0,1,0,0,0,160,0,79,0,72,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,127,1,0,0,4,0,0,1,0,0,0,160,0,87,0,64,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,126,1,0,0,4,0,0,1,0,0,0,160,0,95,0,56,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,124,1,0,0,4,0,0,1,0,0,0,160,0,103,0,48,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,123,1,0,0,4,0,0,1,0,0,0,160,0,111,0,40,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,122,1,0,0,4,0,0,1,0,0,0,160,0,119,0,208,242,6,0,8,236,6,0,80,243,6,0,0,0,0,0,0,0,0,0,112,138,1,0,0,33,0,0,0,0,0,0,57,0,191,0,208,211,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,173,1,0,0,34,0,0,0,0,0,0,54,1,191,0,152,206,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,171,1,0,4,32,0,0,0,0,0,0,160,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,168,1,0,0,96,0,0,1,0,0,0,0,0,0,0,136,218,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,166,1,0,0,96,0,0,1,0,0,0,0,0,0,0,144,218,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,164,1,0,0,4,0,0,1,0,0,0,160,0,39,0,184,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,162,1,0,0,4,0,0,1,0,0,0,160,0,47,0,248,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,161,1,0,0,4,0,0,1,0,0,0,160,0,55,0,168,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,159,1,0,0,4,0,0,1,0,0,0,160,0,63,0,176,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,158,1,0,0,4,0,0,1,0,0,0,160,0,71,0,192,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,156,1,0,0,4,0,0,1,0,0,0,160,0,79,0,0,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,155,1,0,0,4,0,0,1,0,0,0,160,0,87,0,200,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,153,1,0,0,4,0,0,1,0,0,0,160,0,95,0,160,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,151,1,0,0,4,0,0,1,0,0,0,160,0,103,0,32,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,150,1,0,0,4,0,0,1,0,0,0,160,0,111,0,24,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,148,1,0,0,4,0,0,1,0,0,0,160,0,119,0,192,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,147,1,0,4,32,0,0,0,0,0,0,160,0,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,146,1,0,0,4,0,0,1,0,0,0,160,0,135,0,200,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,145,1,0,0,4,0,0,1,0,0,0,160,0,143,0,176,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,144,1,0,0,4,0,0,1,0,0,0,160,0,151,0,232,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,143,1,0,0,4,0,0,1,0,0,0,160,0,159,0,240,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,142,1,0,0,4,0,0,1,0,0,0,160,0,167,0,224,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,140,1,0,0,4,0,0,1,0,0,0,160,0,175,0,224,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,138,1,0,0,33,0,0,0,0,0,0,57,0,191,0,48,215,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,173,1,0,0,34,0,0,0,0,0,0,54,1,191,0,176,209,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,11,2,0,4,32,0,0,0,0,0,0,160,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,7,2,0,0,4,0,0,1,0,0,0,160,0,39,0,128,241,6,0,0,236,6,0,0,0,0,0,0,0,0,0,0,0,0,0,40,3,2,0,0,4,0,0,1,0,0,0,160,0,47,0,232,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,255,1,0,0,4,0,0,1,0,0,0,160,0,55,0,184,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,241,1,0,0,4,0,0,1,0,0,0,160,0,63,0,208,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,227,1,0,0,4,0,0,1,0,0,0,160,0,71,0,168,241,6,0,0,0,0,0,72,243,6,0,0,0,0,0,0,0,0,0,48,217,1,0,0,4,0,0,1,0,0,0,160,0,79,0,144,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,213,1,0,0,4,0,0,1,0,0,0,160,0,87,0,136,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,210,1,0,0,4,0,0,1,0,0,0,160,0,95,0,152,241,6,0,248,235,6,0,64,243,6,0,0,0,0,0,0,0,0,0,240,205,1,0,0,4,0,0,1,0,0,0,160,0,103,0,0,243,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,202,1,0,0,4,0,0,1,0,0,0,160,0,111,0,216,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,197,1,0,0,4,0,0,1,0,0,0,160,0,119,0,120,241,6,0,0,236,6,0,56,243,6,0,0,0,0,0,0,0,0,0,0,193,1,0,4,32,0,0,0,0,0,0,160,0,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,190,1,0,0,4,0,0,3,0,0,0,160,0,135,0,48,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,187,1,0,0,4,0,0,3,0,0,0,160,0,143,0,8,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,185,1,0,0,4,0,0,3,0,0,0,160,0,151,0,24,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,182,1,0,0,4,0,0,3,0,0,0,160,0,159,0,16,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,180,1,0,0,4,0,0,3,0,0,0,160,0,167,0,56,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,178,1,0,0,4,0,0,3,0,0,0,160,0,175,0,40,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,176,1,0,0,4,0,0,3,0,0,0,160,0,183,0,32,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,45,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,173,1,0,0,34,0,0,0,0,0,0,54,1,191,0,208,211,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,215,0,0,208,211,0,0,176,209,0,0,152,206,0,0,0,0,0,0,0,0,0,0,187,0,0,0,0,0,0,0,27,0,0,0,0,0,0,0,92,243,6,0,0,0,0,0,87,73,79,83,84,73,0,0,100,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,200,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,200,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,184,171,1,0,4,32,0,0,0,0,0,0,27,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,168,1,0,0,36,0,0,0,0,0,0,27,1,10,0,136,218,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,166,1,0,0,36,0,0,0,0,0,0,27,1,18,0,144,218,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,164,1,0,0,36,0,0,0,0,0,0,27,1,26,0,184,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,162,1,0,0,36,0,0,0,0,0,0,27,1,34,0,248,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,161,1,0,0,36,0,0,0,0,0,0,27,1,42,0,168,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,180,1,0,0,36,0,0,0,0,0,0,27,1,50,0,176,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,158,1,0,0,36,0,0,0,0,0,0,27,1,58,0,192,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,156,1,0,0,36,0,0,0,0,0,0,27,1,66,0,0,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,155,1,0,0,36,0,0,0,0,0,0,27,1,74,0,200,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,153,1,0,0,36,0,0,0,0,0,0,27,1,82,0,160,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,151,1,0,0,36,0,0,0,0,0,0,27,1,90,0,32,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,150,1,0,0,36,0,0,0,0,0,0,27,1,98,0,24,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,148,1,0,0,36,0,0,0,0,0,0,27,1,106,0,192,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,161,1,0,4,32,0,0,0,0,0,0,27,1,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,180,1,0,0,36,0,0,0,0,0,0,27,1,126,0,144,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,118,1,0,0,36,0,0,0,0,0,0,27,1,134,0,72,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,117,1,0,0,36,0,0,0,0,0,0,27,1,142,0,64,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,107,1,0,0,36,0,0,0,0,0,0,27,1,150,0,112,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,106,1,0,0,36,0,0,0,0,0,0,27,1,158,0,160,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,104,1,0,0,36,0,0,0,0,0,0,27,1,166,0,136,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,103,1,0,0,36,0,0,0,0,0,0,27,1,174,0,128,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,137,1,0,4,32,0,0,0,0,0,0,87,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,135,1,0,0,36,0,0,0,0,0,0,87,0,10,0,112,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,134,1,0,0,36,0,0,0,0,0,0,87,0,18,0,104,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,132,1,0,0,36,0,0,0,0,0,0,87,0,26,0,96,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,131,1,0,0,36,0,0,0,0,0,0,87,0,34,0,88,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,130,1,0,0,36,0,0,0,0,0,0,87,0,42,0,80,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,129,1,0,0,36,0,0,0,0,0,0,87,0,50,0,72,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,179,1,0,0,36,0,0,0,0,0,0,87,0,58,0,64,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,126,1,0,0,36,0,0,0,0,0,0,87,0,66,0,56,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,124,1,0,0,36,0,0,0,0,0,0,87,0,74,0,48,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,123,1,0,0,36,0,0,0,0,0,0,87,0,82,0,40,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,122,1,0,0,36,0,0,0,0,0,0,87,0,90,0,208,242,6,0,8,236,6,0,80,243,6,0,0,0,0,0,0,0,0,0,192,11,2,0,4,32,0,0,0,0,0,0,87,0,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,7,2,0,0,36,0,0,0,0,0,0,87,0,110,0,128,241,6,0,0,236,6,0,0,0,0,0,0,0,0,0,0,0,0,0,40,3,2,0,0,36,0,0,0,0,0,0,87,0,118,0,232,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,255,1,0,0,36,0,0,0,0,0,0,87,0,126,0,184,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,241,1,0,0,36,0,0,0,0,0,0,87,0,134,0,208,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,227,1,0,0,36,0,0,0,0,0,0,87,0,142,0,168,241,6,0,0,0,0,0,72,243,6,0,0,0,0,0,0,0,0,0,48,217,1,0,0,36,0,0,0,0,0,0,87,0,150,0,144,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,213,1,0,0,36,0,0,0,0,0,0,87,0,158,0,136,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,210,1,0,0,36,0,0,0,0,0,0,87,0,166,0,152,241,6,0,248,235,6,0,64,243,6,0,0,0,0,0,0,0,0,0,240,205,1,0,0,36,0,0,0,0,0,0,87,0,174,0,0,243,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,202,1,0,0,36,0,0,0,0,0,0,87,0,182,0,216,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,197,1,0,0,36,0,0,0,0,0,0,87,0,190,0,120,241,6,0,0,236,6,0,56,243,6,0,0,0,0,0,0,0,0,0,160,147,1,0,4,32,0,0,0,0,0,0,172,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,146,1,0,0,36,0,0,0,0,0,0,172,0,10,0,200,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,145,1,0,0,36,0,0,0,0,0,0,172,0,18,0,176,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,144,1,0,0,36,0,0,0,0,0,0,172,0,26,0,232,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,142,1,0,0,36,0,0,0,0,0,0,172,0,34,0,224,242,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,143,1,0,0,36,0,0,0,0,0,0,172,0,42,0,240,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,140,1,0,0,36,0,0,0,0,0,0,172,0,50,0,224,241,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,4,0,0,0,0,0,0,64,0,0,0,0,112,135,9,0,16,173,1,0,248,172,1,0,176,172,1,0,112,172,1,0,16,172,1,0,0,0,0,0,0,0,0,0,192,231,1,0,4,32,0,0,0,0,0,0,250,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,229,1,0,0,0,128,0,0,0,0,0,250,0,44,0,216,228,1,0,0,0,0,0,0,0,0,0,0,0,0,0,232,137,0,0,32,228,1,0,0,0,128,0,0,0,0,0,250,0,52,0,216,225,1,0,0,0,0,0,0,0,0,0,0,0,0,0,232,137,0,0,112,224,1,0,0,0,128,0,0,0,0,0,250,0,60,0,248,222,1,0,0,0,0,0,0,0,0,0,0,0,0,0,232,137,0,0,72,221,1,0,0,0,128,0,0,0,0,0,250,0,68,0,104,220,1,0,0,0,0,0,0,0,0,0,0,0,0,0,232,137,0,0,216,218,1,0,0,0,128,0,0,0,0,0,250,0,76,0,168,218,1,0,0,0,0,0,0,0,0,0,0,0,0,0,232,137,0,0,112,218,1,0,0,0,128,0,0,0,0,0,250,0,92,0,16,218,1,0,0,0,0,0,0,0,0,0,0,0,0,0,144,247,0,0,192,217,1,0,0,0,128,0,0,0,0,0,250,0,100,0,16,217,1,0,0,0,0,0,0,0,0,0,0,0,0,0,144,247,0,0,192,216,1,0,8,0,0,0,0,0,0,0,250,0,108,0,112,216,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,138,1,0,0,33,0,0,0,0,0,0,57,0,191,0,72,229,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,2,2,0,4,32,0,0,0,0,0,0,250,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,2,2,0,8,0,0,0,0,0,0,0,250,0,44,0,8,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,1,2,0,8,0,0,0,0,0,0,0,250,0,52,0,144,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,1,2,0,4,32,0,0,0,0,0,0,250,0,76,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,1,2,0,0,0,8,0,0,0,0,0,76,0,88,0,168,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,0,2,0,0,0,8,0,0,0,0,0,76,0,96,0,192,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,255,1,0,0,0,8,0,0,0,0,0,76,0,104,0,248,254,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,254,1,0,0,0,8,0,0,0,0,0,76,0,112,0,224,252,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,250,1,0,4,32,0,0,0,0,0,0,250,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,248,1,0,0,16,2,0,0,0,0,0,250,0,140,0,168,246,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,244,1,0,0,16,2,0,0,0,0,0,250,0,148,0,240,241,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,240,1,0,8,0,0,0,0,0,0,0,250,0,156,0,224,237,1,0,0,0,0,0,0,0,0,0,90,0,0,0,0,0,0,0,200,236,1,0,0,16,0,0,0,0,0,0,250,0,164,0,64,236,1,0,0,0,0,0,0,0,0,0,90,0,0,0,0,0,0,0,96,234,1,0,0,0,128,0,0,0,0,0,250,0,172,0,56,233,1,0,0,0,0,0,0,0,0,0,0,0,0,0,152,227,0,0,112,138,1,0,0,33,0,0,0,0,0,0,57,0,191,0,176,231,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,173,1,0,0,34,0,0,0,0,0,0,54,1,191,0,184,227,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,10,2,0,4,32,0,0,0,0,0,0,250,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,9,2,0,8,0,0,0,0,0,0,0,250,0,44,0,32,9,2,0,0,0,0,0,0,0,0,0,20,0,0,0,0,0,0,0,192,8,2,0,0,16,0,0,0,0,0,0,250,0,52,0,72,8,2,0,0,0,0,0,0,0,0,0,20,0,0,0,0,0,0,0,176,7,2,0,8,0,2,0,0,0,0,0,250,0,60,0,24,7,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,6,2,0,0,0,130,0,0,0,0,0,250,0,68,0,40,6,2,0,0,0,0,0,0,0,0,0,0,0,0,0,136,3,0,0,176,5,2,0,8,0,0,0,0,0,0,0,250,0,76,0,24,5,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,4,2,0,4,32,0,0,0,0,0,0,250,0,144,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,4,2,0,0,16,2,0,0,0,0,0,250,0,156,0,24,4,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,3,2,0,8,0,0,0,0,0,0,0,250,0,164,0,0,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,45,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,173,1,0,0,34,0,0,0,0,0,0,54,1,191,0,72,229,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,231,0,0,72,229,0,0,184,227,0,0,0,0,0,0,4,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,48,126,7,0,0,0,0,0,87,73,70,82,71,83,0,0,25,0,0,0,50,0,0,0,1,0,0,0,0,0,0,0,87,73,70,0,0,0,0,0,176,254,7,0,0,0,0,0,176,254,7,0,0,0,0,0,176,254,7,0,0,0,0,0,176,254,7,0,0,0,0,0,176,254,7,0,0,0,0,0,176,254,7,0,0,0,0,0,176,254,7,0,0,0,0,0,176,254,7,0,0,0,0,0,176,254,7,0,0,0,0,0,176,254,7,0,0,0,0,0,176,254,7,0,0,0,0,0,176,254,7,0,0,0,0,0,176,254,7,0,0,0,0,0,0,224,48,208,176,80,128,96,192,32,240,16,112,144,64,160,83,84,80,66,48,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,104,0,0,0,168,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,40,0,0,0,136,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,160,0,0,0,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,104,0,0,0,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,120,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,3,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,11,0,0,0,1,0,0,0,128,0,0,0,136,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,11,0,0,0,1,0,0,0,128,0,0,0,136,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,11,0,0,0,1,0,0,0,128,0,0,0,136,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,11,0,0,0,1,0,0,0,128,0,0,0,136,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,11,0,0,0,1,0,0,0,128,0,0,0,136,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,11,0,0,0,1,0,0,0,128,0,0,0,136,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,11,0,0,0,1,0,0,0,128,0,0,0,136,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,11,0,0,0,3,0,0,0,192,0,0,0,144,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,11,0,0,0,1,0,0,0,128,0,0,0,136,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,224,0,0,0,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,184,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,112,0,0,0,136,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,72,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,88,0,0,0,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,64,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,192,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,136,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,80,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,3,0,0,0,64,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,87,73,69,78,84,69,82,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,34,40,41,42,43,60,95,62,63,41,33,64,35,36,37,94,38,42,40,58,58,60,43,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,33,93,34,95,39,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,40,18,2,0,8,0,0,0,0,0,0,0,250,0,31,0,240,17,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,17,2,0,8,0,0,0,0,0,0,0,250,0,39,0,112,17,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,17,2,0,8,0,0,0,0,0,0,0,250,0,47,0,32,16,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,15,2,0,8,0,0,0,0,0,0,0,250,0,55,0,232,14,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,14,2,0,8,0,0,0,0,0,0,0,250,0,63,0,8,14,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,13,2,0,8,0,0,0,0,0,0,0,250,0,71,0,128,13,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,13,2,0,8,0,0,0,0,0,0,0,250,0,79,0,16,13,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,12,2,0,0,16,1,0,0,0,0,0,250,0,87,0,96,12,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,11,2,0,0,16,0,0,0,0,0,0,250,0,95,0,48,11,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,10,2,0,8,0,0,0,0,0,0,0,250,0,103,0,120,10,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,45,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,245,0,0,0,0,0,0,16,199,1,0,96,47,2,0,56,7,2,0,40,197,1,0,56,171,1,0,88,153,1,0,40,140,1,0,8,126,1,0,32,110,1,0,24,97,1,0,168,64,2,0,0,58,2,0,56,52,2,0,168,46,2,0,64,41,2,0,96,37,2,0,152,174,1,0,72,174,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,226,1,0,0,170,0,0,0,74,0,0,0,0,0,0,0,96,0,0,0,100,1,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,88,1,0,0,146,1,0,0,0,0,0,0,122,1,0,0,120,1,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,92,1,0,0,208,1,0,0,162,1,0,0,0,0,0,0,240,0,0,0,144,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,2,0,0,108,1,0,0,176,0,0,0,0,0,0,0,54,2,0,0,94,1,0,0,142,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,174,0,0,0,160,0,0,0,116,1,0,0,228,1,0,0,92,0,0,0,180,1,0,0,230,1,0,0,18,2,0,0,138,0,0,0,38,0,0,0,118,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,1,0,0,70,0,0,0,188,0,0,0,186,0,0,0,184,0,0,0,0,1,0,0,36,1,0,0,28,0,0,0,80,0,0,0,182,1,0,0,96,1,0,0,16,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,188,1,0,0,168,1,0,0,192,1,0,0,178,0,0,0,118,1,0,0,70,2,0,0,58,1,0,0,18,0,0,0,198,1,0,0,140,0,0,0,186,1,0,0,242,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,1,0,0,104,1,0,0,126,1,0,0,158,1,0,0,212,1,0,0,30,0,0,0,8,1,0,0,56,2,0,0,244,0,0,0,4,1,0,0,4,0,0,0,206,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,252,0,0,0,72,2,0,0,222,0,0,0,132,0,0,0,22,1,0,0,110,0,0,0,44,1,0,0,74,2,0,0,52,0,0,0,234,1,0,0,6,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,1,0,0,40,0,0,0,206,0,0,0,202,1,0,0,236,0,0,0,82,1,0,0,166,1,0,0,36,0,0,0,160,1,0,0,236,1,0,0,72,0,0,0,180,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,242,1,0,0,82,0,0,0,72,1,0,0,254,1,0,0,252,1,0,0,194,1,0,0,170,1,0,0,176,1,0,0,164,1,0,0,100,0,0,0,88,0,0,0,48,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,238,0,0,0,44,0,0,0,76,1,0,0,44,2,0,0,156,0,0,0,222,1,0,0,224,0,0,0,246,0,0,0,54,0,0,0,68,1,0,0,124,0,0,0,230,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,108,0,0,0,74,1,0,0,24,1,0,0,70,1,0,0,250,0,0,0,10,1,0,0,86,2,0,0,246,1,0,0,228,0,0,0,134,0,0,0,20,1,0,0,136,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,46,1,0,0,156,1,0,0,46,2,0,0,26,1,0,0,90,0,0,0,158,0,0,0,14,0,0,0,150,0,0,0,28,2,0,0,106,1,0,0,116,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,0,0,0,80,2,0,0,124,1,0,0,4,2,0,0,82,2,0,0,204,0,0,0,68,2,0,0,198,0,0,0,216,0,0,0,50,0,0,0,48,1,0,0,50,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,234,0,0,0,40,1,0,0,86,1,0,0,112,0,0,0,138,1,0,0,60,0,0,0,200,1,0,0,102,1,0,0,58,0,0,0,42,0,0,0,84,0,0,0,8,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,58,2,0,0,200,55,2,0,58,2,0,0,200,55,2,0,60,2,0,0,200,55,2,0,58,2,0,0,200,55,2,0,40,2,0,0,48,55,2,0,40,2,0,0,48,55,2,0,40,2,0,0,48,55,2,0,40,2,0,0,48,55,2,0,172,1,0,0,0,0,0,0,172,1,0,0,0,0,0,0,172,1,0,0,0,0,0,0,172,1,0,0,0,0,0,0,40,2,0,0,104,54,2,0,40,2,0,0,104,54,2,0,40,2,0,0,104,54,2,0,40,2,0,0,104,54,2,0,172,1,0,0,112,53,2,0,172,1,0,0,112,53,2,0,172,1,0,0,240,52,2,0,58,2,0,0,200,55,2,0,40,2,0,0,184,51,2,0,40,2,0,0,184,51,2,0,40,2,0,0,184,51,2,0,40,2,0,0,184,51,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,172,1,0,0,240,52,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,2,0,0,96,51,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,6,0,0,0,0,0,0,0,88,114,1,0,8,114,1,0,160,113,1,0,80,113,1,0,56,113,1,0,32,113,1,0,176,135,0,0,160,196,1,0,184,135,0,0,224,195,1,0,136,129,0,0,144,195,1,0,128,129,0,0,56,195,1,0,96,129,0,0,104,194,1,0,112,129,0,0,16,194,1,0,80,129,0,0,152,193,1,0,64,131,0,0,112,193,1,0,88,129,0,0,240,192,1,0,56,131,0,0,168,192,1,0,216,128,0,0,88,192,1,0,88,131,0,0,56,192,1,0,80,131,0,0,216,191,1,0,72,131,0,0,184,191,1,0,128,135,0,0,112,191,1,0,192,135,0,0,80,191,1,0,208,135,0,0,240,190,1,0,200,135,0,0,200,190,1,0,120,135,0,0,56,190,1,0,112,135,0,0,248,189,1,0,104,135,0,0,168,189,1,0,96,135,0,0,104,189,1,0,88,135,0,0,56,189,1,0,136,135,0,0,16,189,1,0,64,135,0,0,224,188,1,0,168,134,0,0,192,188,1,0,224,134,0,0,96,188,1,0,72,135,0,0,56,188,1,0,80,134,0,0,144,187,1,0,176,134,0,0,72,187,1,0,184,134,0,0,248,186,1,0,64,134,0,0,208,186,1,0,32,135,0,0,168,186,1,0,48,134,0,0,128,186,1,0,144,134,0,0,48,186,1,0,24,135,0,0,16,186,1,0,40,134,0,0,208,185,1,0,136,134,0,0,160,185,1,0,208,134,0,0,40,185,1,0,48,135,0,0,232,184,1,0,216,134,0,0,160,184,1,0,72,134,0,0,128,184,1,0,192,134,0,0,96,184,1,0,56,134,0,0,40,184,1,0,160,134,0,0,8,184,1,0,240,134,0,0,216,183,1,0,232,134,0,0,128,183,1,0,120,134,0,0,96,183,1,0,128,134,0,0,232,182,1,0,16,135,0,0,184,182,1,0,8,135,0,0,104,182,1,0,104,134,0,0,72,182,1,0,112,134,0,0,40,182,1,0,56,135,0,0,224,181,1,0,40,135,0,0,184,181,1,0,0,135,0,0,120,181,1,0,248,134,0,0,72,181,1,0,200,134,0,0,24,181,1,0,152,134,0,0,96,180,1,0,96,134,0,0,16,180,1,0,88,134,0,0,232,179,1,0,216,130,0,0,160,179,1,0,184,130,0,0,136,179,1,0,152,130,0,0,96,179,1,0,224,130,0,0,48,179,1,0,192,130,0,0,24,179,1,0,160,130,0,0,168,178,1,0,232,130,0,0,120,178,1,0,200,130,0,0,24,178,1,0,168,130,0,0,208,177,1,0,208,130,0,0,152,177,1,0,176,130,0,0,112,177,1,0,144,130,0,0,72,177,1,0,240,130,0,0,24,177,1,0,0,131,0,0,248,176,1,0,248,130,0,0,192,176,1,0,80,135,0,0,136,176,1,0,168,131,0,0,112,176,1,0,208,132,0,0,32,176,1,0,200,132,0,0,160,175,1,0,192,132,0,0,128,175,1,0,184,132,0,0,88,175,1,0,176,132,0,0,56,175,1,0,168,132,0,0,248,174,1,0,160,132,0,0,232,174,1,0,152,132,0,0,160,174,1,0,144,132,0,0,80,174,1,0,136,132,0,0,56,174,1,0,128,132,0,0,160,173,1,0,120,132,0,0,112,173,1,0,112,132,0,0,64,173,1,0,104,132,0,0,40,173,1,0,96,132,0,0,24,173,1,0,88,132,0,0,0,173,1,0,80,132,0,0,224,172,1,0,72,132,0,0,120,172,1,0,64,132,0,0,24,172,1,0,56,132,0,0,0,172,1,0,48,132,0,0,160,171,1,0,40,132,0,0,40,171,1,0,32,132,0,0,0,171,1,0,24,132,0,0,224,170,1,0,16,132,0,0,184,170,1,0,8,132,0,0,96,170,1,0,0,132,0,0,200,169,1,0,248,131,0,0,128,169,1,0,240,131,0,0,240,168,1,0,232,131,0,0,200,168,1,0,224,131,0,0,72,168,1,0,216,131,0,0,0,168,1,0,208,131,0,0,192,167,1,0,200,131,0,0,168,167,1,0,192,131,0,0,144,167,1,0,184,131,0,0,120,167,1,0,32,134,0,0,96,167,1,0,200,133,0,0,80,167,1,0,112,133,0,0,0,167,1,0,80,133,0,0,240,166,1,0,72,133,0,0,144,166,1,0,64,133,0,0,104,166,1,0,56,133,0,0,56,166,1,0,48,133,0,0,16,166,1,0,40,133,0,0,232,165,1,0,24,134,0,0,192,165,1,0,16,134,0,0,136,165,1,0,8,134,0,0,88,165,1,0,0,134,0,0,8,165,1,0,248,133,0,0,208,164,1,0,240,133,0,0,88,164,1,0,232,133,0,0,16,164,1,0,224,133,0,0,224,163,1,0,216,133,0,0,168,163,1,0,208,133,0,0,128,163,1,0,192,133,0,0,112,163,1,0,184,133,0,0,96,163,1,0,176,133,0,0,40,163,1,0,168,133,0,0,208,162,1,0,160,133,0,0,192,162,1,0,152,133,0,0,112,162,1,0,144,133,0,0,72,162,1,0,136,133,0,0,56,162,1,0,128,133,0,0,40,162,1,0,120,133,0,0,24,162,1,0,104,133,0,0,8,162,1,0,96,133,0,0,248,161,1,0,88,133,0,0,232,161,1,0,136,130,0,0,160,161,1,0,48,130,0,0,144,161,1,0,216,129,0,0,56,161,1,0,184,129,0,0,16,161,1,0,176,129,0,0,0,161,1,0,168,129,0,0,240,160,1,0,160,129,0,0,224,160,1,0,152,129,0,0,208,160,1,0,144,129,0,0,192,160,1,0,128,130,0,0,176,160,1,0,120,130,0,0,56,160,1,0,112,130,0,0,40,160,1,0,104,130,0,0,216,159,1,0,96,130,0,0,168,159,1,0,88,130,0,0,152,159,1,0,80,130,0,0,136,159,1,0,72,130,0,0,120,159,1,0,64,130,0,0,104,159,1,0,56,130,0,0,88,159,1,0,40,130,0,0,24,159,1,0,32,130,0,0,176,158,1,0,24,130,0,0,160,158,1,0,16,130,0,0,64,158,1,0,8,130,0,0,24,158,1,0,0,130,0,0,8,158,1,0,248,129,0,0,248,157,1,0,240,129,0,0,232,157,1,0,232,129,0,0,216,157,1,0,224,129,0,0,200,157,1,0,208,129,0,0,184,157,1,0,200,129,0,0,144,157,1,0,192,129,0,0,72,157,1,0,160,128,0,0,224,156,1,0,72,128,0,0,112,156,1,0,240,127,0,0,96,156,1,0,208,127,0,0,72,156,1,0,200,127,0,0,56,156,1,0,192,127,0,0,32,156,1,0,184,127,0,0,16,156,1,0,176,127,0,0,0,156,1,0,168,127,0,0,208,155,1,0,152,128,0,0,192,155,1,0,144,128,0,0,88,155,1,0,136,128,0,0,48,155,1,0,128,128,0,0,8,155,1,0,120,128,0,0,248,154,1,0,112,128,0,0,232,154,1,0,104,128,0,0,216,154,1,0,96,128,0,0,192,154,1,0,88,128,0,0,120,154,1,0,80,128,0,0,64,154,1,0,64,128,0,0,48,154,1,0,56,128,0,0,176,153,1,0,48,128,0,0,72,153,1,0,40,128,0,0,40,153,1,0,32,128,0,0,16,153,1,0,24,128,0,0,224,152,1,0,16,128,0,0,208,152,1,0,8,128,0,0,128,152,1,0,0,128,0,0,80,152,1,0,248,127,0,0,232,151,1,0,232,127,0,0,216,151,1,0,224,127,0,0,112,151,1,0,216,127,0,0,72,151,1,0,24,133,0,0,48,151,1,0,16,133,0,0,24,151,1,0,8,133,0,0,0,151,1,0,0,133,0,0,232,150,1,0,248,132,0,0,208,150,1,0,240,132,0,0,184,150,1,0,232,132,0,0,112,150,1,0,224,132,0,0,88,150,1,0,216,132,0,0,232,149,1,0,32,133,0,0,184,149,1,0,128,131,0,0,160,149,1,0,120,131,0,0,136,149,1,0,112,131,0,0,112,149,1,0,104,131,0,0,88,149,1,0,96,131,0,0,64,149,1,0,176,131,0,0,40,149,1,0,152,131,0,0,16,149,1,0,144,131,0,0,0,149,1,0,160,131,0,0,152,148,1,0,136,131,0,0,112,148,1,0,208,136,0,0,96,148,1,0,216,136,0,0,80,148,1,0,192,136,0,0,64,148,1,0,200,136,0,0,48,148,1,0,184,136,0,0,24,148,1,0,176,136,0,0,0,148,1,0,248,128,0,0,232,147,1,0,224,128,0,0,216,147,1,0,16,129,0,0,144,147,1,0,24,129,0,0,104,147,1,0,0,129,0,0,88,147,1,0,8,129,0,0,72,147,1,0,232,128,0,0,56,147,1,0,240,128,0,0,40,147,1,0,72,129,0,0,24,147,1,0,64,129,0,0,8,147,1,0,56,129,0,0,232,146,1,0,48,129,0,0,216,146,1,0,32,129,0,0,128,146,1,0,40,129,0,0,88,146,1,0,168,135,0,0,80,146,1,0,160,135,0,0,72,146,1,0,152,135,0,0,64,146,1,0,144,135,0,0,56,146,1,0,136,136,0,0,48,146,1,0,128,136,0,0,40,146,1,0,120,136,0,0,248,145,1,0,112,136,0,0,240,145,1,0,104,136,0,0,168,145,1,0,96,136,0,0,136,145,1,0,48,131,0,0,112,145,1,0,40,131,0,0,104,145,1,0,32,131,0,0,96,145,1,0,24,131,0,0,88,145,1,0,16,131,0,0,80,145,1,0,8,131,0,0,72,145,1,0,208,128,0,0,40,145,1,0,200,128,0,0,32,145,1,0,192,128,0,0,192,144,1,0,184,128,0,0,160,144,1,0,176,128,0,0,152,144,1,0,168,128,0,0,144,144,1,0,216,135,0,0,128,144,1,0,232,135,0,0,112,144,1,0,40,136,0,0,96,144,1,0,16,136,0,0,88,144,1,0,48,136,0,0,64,144,1,0,8,136,0,0,0,144,1,0,64,136,0,0,176,143,1,0,32,136,0,0,112,143,1,0,72,136,0,0,80,143,1,0,88,136,0,0,56,143,1,0,248,135,0,0,48,143,1,0,240,135,0,0,24,143,1,0,0,136,0,0,8,143,1,0,80,136,0,0,0,143,1,0,224,135,0,0,232,142,1,0,56,136,0,0,216,142,1,0,24,136,0,0,128,142,1,0,168,88,1,0,88,142,1,0,160,88,1,0,56,142,1,0,152,88,1,0,40,142,1,0,144,88,1,0,24,142,1,0,216,88,1,0,8,142,1,0,208,88,1,0,232,141,1,0,192,88,1,0,48,141,1,0,184,88,1,0,24,141,1,0,200,88,1,0,8,141,1,0,176,88,1,0,128,140,1,0,224,88,1,0,24,140,1,0,120,124,0,0,248,139,1,0,112,124,0,0,224,139,1,0,104,124,0,0,192,139,1,0,96,124,0,0,176,139,1,0,88,124,0,0,80,139,1,0,160,127,0,0,40,139,1,0,104,108,1,0,16,108,1,0,0,108,1,0,152,107,1,0,112,107,1,0,96,107,1,0,80,107,1,0,0,0,0,0,112,111,1,0,96,111,1,0,88,111,1,0,80,111,1,0,56,111,1,0,32,111,1,0,16,111,1,0,0,111,1,0,120,110,1,0,0,0,0,0,128,0,0,0,0,0,0,0,50,1,0,0,0,0,0,0,168,208,1,0,0,0,0,0,104,101,1,0,24,101,1,0,240,100,1,0,216,100,1,0,200,100,1,0,184,100,1,0,168,100,1,0,152,100,1,0,136,100,1,0,104,100,1,0,8,100,1,0,168,99,1,0,72,99,1,0,48,99,1,0,24,99,1,0,16,99,1,0,248,98,1,0,240,98,1,0,232,98,1,0,192,98,1,0,176,98,1,0,96,98,1,0,64,98,1,0,32,98,1,0,128,104,1,0,0,0,0,0,1,0,0,0,0,0,0,0,120,104,1,0,0,0,0,0,2,0,0,0,0,0,0,0,104,104,1,0,0,0,0,0,4,0,0,0,0,0,0,0,88,104,1,0,0,0,0,0,8,0,0,0,0,0,0,0,72,104,1,0,0,0,0,0,16,0,0,0,0,0,0,0,64,104,1,0,0,0,0,0,32,0,0,0,0,0,0,0,32,104,1,0,0,0,0,0,64,0,0,0,0,0,0,0,16,104,1,0,0,0,0,0,128,0,0,0,0,0,0,0,200,103,1,0,0,0,0,0,0,1,0,0,0,0,0,0,160,103,1,0,0,0,0,0,0,2,0,0,0,0,0,0,152,103,1,0,0,0,0,0,0,4,0,0,0,0,0,0,144,103,1,0,0,0,0,0,0,8,0,0,0,0,0,0,136,103,1,0,0,0,0,0,0,16,0,0,0,0,0,0,128,103,1,0,0,0,0,0,0,32,0,0,0,0,0,0,120,103,1,0,0,0,0,0,0,64,0,0,0,0,0,0,104,103,1,0,0,0,0,0,0,128,0,0,0,0,0,0,72,103,1,0,0,0,0,0,0,0,1,0,0,0,0,0,64,103,1,0,0,0,0,0,0,0,2,0,0,0,0,0,248,102,1,0,0,0,0,0,0,0,4,0,0,0,0,0,216,102,1,0,0,0,0,0,0,0,8,0,0,0,0,0,208,102,1,0,0,0,0,0,0,0,16,0,0,0,0,0,200,102,1,0,0,0,0,0,0,0,32,0,0,0,0,0,184,102,1,0,0,0,0,0,0,0,64,0,0,0,0,0,168,102,1,0,0,0,0,0,0,0,128,0,0,0,0,0,152,102,1,0,0,0,0,0,0,0,0,1,0,0,0,0,136,102,1,0,0,0,0,0,0,0,0,2,0,0,0,0,96,102,1,0,0,0,0,0,0,0,0,4,0,0,0,0,80,102,1,0,0,0,0,0,0,0,0,4,0,0,0,0,16,102,1,0,0,0,0,0,0,0,0,8,0,0,0,0,240,101,1,0,0,0,0,0,0,0,0,8,0,0,0,0,208,101,1,0,0,0,0,0,0,0,0,16,0,0,0,0,200,101,1,0,0,0,0,0,0,0,0,32,0,0,0,0,192,101,1,0,0,0,0,0,0,0,0,64,0,0,0,0,176,101,1,0,0,0,0,0,0,0,0,64,0,0,0,0,168,101,1,0,0,0,0,0,0,0,0,0,1,0,0,0,160,101,1,0,0,0,0,0,0,0,0,0,2,0,0,0,112,101,1,0,0,0,0,0,0,0,0,0,4,0,0,0,208,117,1,0,192,117,1,0,176,117,1,0,136,117,1,0,112,117,1,0,0,117,1,0,216,116,1,0,176,116,1,0,152,116,1,0,136,116,1,0,120,116,1,0,96,116,1,0,80,116,1,0,24,116,1,0,8,116,1,0,152,115,1,0,216,138,1,0,2,0,0,0,208,138,1,0,20,0,0,0,104,138,1,0,8,0,0,0,72,138,1,0,10,0,0,0,64,138,1,0,36,0,0,0,56,138,1,0,14,0,0,0,48,138,1,0,26,0,0,0,40,138,1,0,18,0,0,0,32,138,1,0,16,0,0,0,24,138,1,0,34,0,0,0,232,137,1,0,38,0,0,0,224,137,1,0,22,0,0,0,112,137,1,0,12,0,0,0,72,137,1,0,6,0,0,0,56,137,1,0,4,0,0,0,40,137,1,0,32,0,0,0,32,137,1,0,28,0,0,0,128,135,9,0,30,0,0,0,10,0,0,0,56,133,1,0,40,0,0,0,0,133,1,0,42,0,0,0,248,132,1,0,14,0,0,0,184,132,1,0,16,0,0,0,152,132,1,0,44,0,0,0,136,132,1,0,36,0,0,0,120,132,1,0,12,0,0,0,104,132,1,0,50,0,0,0,88,132,1,0,8,0,0,0,72,132,1,0,28,0,0,0,56,132,1,0,34,0,0,0,0,132,1,0,22,0,0,0,240,131,1,0,6,0,0,0,168,131,1,0,20,0,0,0,128,131,1,0,26,0,0,0,88,131,1,0,18,0,0,0,72,131,1,0,2,0,0,0,56,131,1,0,30,0,0,0,48,131,1,0,46,0,0,0,32,131,1,0,24,0,0,0,16,131,1,0,38,0,0,0,200,130,1,0,148,1,0,0,184,130,1,0,238,1,0,0,120,130,1,0,32,2,0,0,88,130,1,0,16,2,0,0,72,130,1,0,34,2,0,0,64,130,1,0,80,1,0,0,48,130,1,0,224,1,0,0,40,130,1,0,154,0,0,0,32,130,1,0,56,0,0,0,16,130,1,0,106,0,0,0,208,129,1,0,66,0,0,0,136,129,1,0,144,1,0,0,56,129,1,0,76,2,0,0,232,128,1,0,2,1,0,0,200,128,1,0,178,1,0,0,176,128,1,0,90,1,0,0,160,128,1,0,78,2,0,0,72,128,1,0,94,0,0,0,64,128,1,0,128,0,0,0,48,128,1,0,62,2,0,0,248,127,1,0,78,0,0,0,232,127,1,0,98,0,0,0,152,127,1,0,24,0,0,0,112,127,1,0,126,0,0,0,80,127,1,0,210,0,0,0,64,127,1,0,214,0,0,0,48,127,1,0,212,0,0,0,32,127,1,0,52,1,0,0,8,127,1,0,152,1,0,0,224,126,1,0,202,0,0,0,168,126,1,0,122,0,0,0,152,126,1,0,6,2,0,0,80,126,1,0,130,1,0,0,248,125,1,0,42,1,0,0,216,125,1,0,194,0,0,0,200,125,1,0,30,2,0,0,136,125,1,0,190,0,0,0,120,125,1,0,0,2,0,0,80,125,1,0,184,1,0,0,48,125,1,0,210,1,0,0,216,124,1,0,168,0,0,0,200,124,1,0,18,1,0,0,96,124,1,0,68,0,0,0,56,124,1,0,26,0,0,0,40,124,1,0,66,1,0,0,24,124,1,0,196,0,0,0,8,124,1,0,162,0,0,0,248,123,1,0,64,1,0,0,232,123,1,0,14,1,0,0,216,123,1,0,216,1,0,0,168,123,1,0,136,0,0,0,152,123,1,0,60,1,0,0,72,123,1,0,214,1,0,0,32,123,1,0,46,0,0,0,16,123,1,0,62,1,0,0,8,123,1,0,50,2,0,0,0,123,1,0,112,1,0,0,248,122,1,0,104,0,0,0,240,122,1,0,120,0,0,0,224,122,1,0,42,2,0,0,160,122,1,0,64,2,0,0,144,122,1,0,78,1,0,0,88,122,1,0,0,0,0,0,64,122,1,0,152,112,1,0,112,112,1,0,64,11,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,201,1,0,144,210,8,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,17,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,173,1,0,40,138,0,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,155,1,0,248,116,9,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,235,50,164,248,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,142,1,0,120,158,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,127,1,0,136,210,8,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,111,1,0,232,146,8,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,98,1,0,112,138,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,65,2,0,216,183,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,24,59,2,0,64,255,0,0,0,0,0,0,6,0,0,0,0,0,0,0,1,0,0,0,16,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,56,53,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,47,2,0,0,0,0,0,152,187,2,0,0,0,0,0,144,135,9,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,38,2,0,0,0,0,0,156,187,2,0,0,0,0,0,144,135,9,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,33,2,0,0,0,0,0,32,189,8,0,0,0,0,0,144,135,9,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,30,2,0,0,0,0,0,36,189,8,0,0,0,0,0,144,135,9,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,26,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,23,2,0,8,210,8,0,0,0,0,0,3,0,0,0,0,0,0,0,1,0,0,0,5,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,19,2,0,24,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,120,187,2,0,0,0,0,0,80,15,2,0,24,147,8,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,96,11,2,0,64,210,8,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,232,198,6,0,0,0,0,0,136,7,2,0,80,210,8,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,5,0,0,0,64,236,6,0,0,0,0,0,216,2,2,0,200,68,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,5,0,0,0,0,140,0,0,0,0,0,0,160,255,1,0,88,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,5,0,0,0,80,236,6,0,0,0,0,0,232,239,1,0,96,210,8,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,5,0,0,0,88,236,6,0,0,0,0,0,192,225,1,0,104,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,5,0,0,0,96,236,6,0,0,0,0,0,232,216,1,0,208,68,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,5,0,0,0,8,140,0,0,0,0,0,0,64,213,1,0,112,210,8,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,5,0,0,0,176,116,7,0,0,0,0,0,224,209,1,0,24,211,8,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,200,93,1,0,0,0,0,0,88,205,1,0,48,210,8,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,232,3,0,0,0,0,0,0,136,201,1,0,120,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,2,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,104,197,1,0,216,68,1,0,0,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,231,3,0,0,2,0,0,0,5,0,0,0,16,254,0,0,0,0,0,0,184,192,1,0,128,210,8,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,5,0,0,0,40,151,8,0,0,0,0,0,8,190,1,0,104,67,6,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,88,187,1,0,96,67,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,248,184,1,0,88,67,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,192,182,1,0,96,108,6,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,180,1,0,184,133,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,177,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,175,1,0,212,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,140,212,8,0,0,0,0,0,128,173,1,0,220,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,148,212,8,0,0,0,0,0,128,171,1,0,216,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,144,212,8,0,0,0,0,0,16,168,1,0,152,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,80,212,8,0,0,0,0,0,112,166,1,0,156,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,84,212,8,0,0,0,0,0,32,164,1,0,188,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,116,212,8,0,0,0,0,0,88,162,1,0,208,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,136,212,8,0,0,0,0,0,32,161,1,0,204,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,132,212,8,0,0,0,0,0,192,159,1,0,200,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,128,212,8,0,0,0,0,0,40,158,1,0,160,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,88,212,8,0,0,0,0,0,152,156,1,0,164,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,92,212,8,0,0,0,0,0,64,155,1,0,168,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0])
.concat([2,0,0,0,9,0,0,0,96,212,8,0,0,0,0,0,152,153,1,0,172,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,100,212,8,0,0,0,0,0,88,151,1,0,176,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,104,212,8,0,0,0,0,0,208,149,1,0,184,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,112,212,8,0,0,0,0,0,128,148,1,0,196,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,124,212,8,0,0,0,0,0,120,147,1,0,192,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,120,212,8,0,0,0,0,0,104,146,1,0,180,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,108,212,8,0,0,0,0,0,144,145,1,0,224,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,152,212,8,0,0,0,0,0,168,144,1,0,228,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,156,212,8,0,0,0,0,0,120,143,1,0,236,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,164,212,8,0,0,0,0,0,104,142,1,0,240,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,168,212,8,0,0,0,0,0,104,140,1,0,244,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,172,212,8,0,0,0,0,0,80,138,1,0,248,210,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,176,212,8,0,0,0,0,0,88,137,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,135,1,0,16,127,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,7,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,134,1,0,216,139,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,9,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,132,1,0,32,199,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,131,1,0,8,127,0,0,0,0,0,0,34,86,0,0,0,0,0,0,17,43,0,0,128,187,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,130,1,0,24,127,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,128,1,0,32,127,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,127,1,0,168,235,6,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,126,1,0,72,210,8,0,0,0,0,0,8,0,0,0,0,0,0,0,1,0,0,0,32,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,124,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,123,1,0,0,0,0,0,32,210,8,0,0,0,0,0,72,122,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,120,1,0,136,183,8,0,0,0,0,0,128,2,0,0,0,0,0,0,64,1,0,0,0,8,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,118,1,0,144,183,8,0,0,0,0,0,224,1,0,0,0,0,0,0,200,0,0,0,0,6,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,116,1,0,40,32,6,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,115,1,0,248,3,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,113,1,0,56,210,8,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,111,1,0,0,4,0,0,0,0,0,0,66,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,110,1,0,168,190,6,0,0,0,0,0,10,0,0,0,0,0,0,0,3,0,0,0,11,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,107,1,0,32,32,6,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,106,1,0,224,235,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,184,104,1,0,176,247,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,3,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,103,1,0,180,247,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,3,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,102,1,0,184,247,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,3,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,101,1,0,188,247,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,101,1,0,192,247,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,3,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,99,1,0,204,247,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,235,50,164,248,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,98,1,0,196,247,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,97,1,0,200,247,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,96,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,95,1,0,16,32,6,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,95,1,0,56,236,6,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,94,1,0,48,236,6,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,94,1,0,8,236,6,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,216,93,1,0,248,235,6,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,16,67,2,0,0,236,6,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,96,66,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,65,2,0,208,241,6,0,0,0,0,0,174,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,232,64,2,0,184,242,6,0,0,0,0,0,172,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,208,63,2,0,128,241,6,0,0,0,0,0,173,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,112,63,2,0,232,242,6,0,0,0,0,0,175,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,40,63,2,0,16,242,6,0,0,0,0,0,174,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,184,62,2,0,24,242,6,0,0,0,0,0,172,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,88,62,2,0,8,242,6,0,0,0,0,0,173,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,240,61,2,0,48,242,6,0,0,0,0,0,175,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,32,61,2,0,56,242,6,0,0,0,0,0,127,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,216,59,2,0,32,242,6,0,0,0,0,0,27,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,48,59,2,0,40,242,6,0,0,0,0,0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,72,58,2,0,144,241,6,0,0,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,128,57,2,0,136,241,6,0,0,0,0,0,46,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,8,57,2,0,208,242,6,0,0,0,0,0,157,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,192,56,2,0,120,241,6,0,0,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,96,56,2,0,152,241,6,0,0,0,0,0,184,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,240,55,2,0,168,241,6,0,0,0,0,0,182,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,128,55,2,0,200,241,6,0,0,0,0,0,188,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,248,54,2,0,176,242,6,0,0,0,0,0,189,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,64,54,2,0,176,241,6,0,0,0,0,0,190,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,64,53,2,0,192,242,6,0,0,0,0,0,191,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,152,52,2,0,232,241,6,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,136,51,2,0,224,242,6,0,0,0,0,0,193,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,56,51,2,0,0,242,6,0,0,0,0,0,194,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,224,50,2,0,240,241,6,0,0,0,0,0,195,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,72,50,2,0,224,241,6,0,0,0,0,0,196,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,200,49,2,0,200,242,6,0,0,0,0,0,215,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,104,49,2,0,160,241,6,0,0,0,0,0,216,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,232,48,2,0,248,241,6,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,128,48,2,0,0,243,6,0,0,0,0,0,186,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,216,47,2,0,240,242,6,0,0,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,240,46,2,0,248,242,6,0,0,0,0,0,127,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,192,45,2,0,216,242,6,0,0,0,0,0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,80,45,2,0,168,242,6,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,192,44,2,0,96,242,6,0,0,0,0,0,174,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,64,44,2,0,120,242,6,0,0,0,0,0,172,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,184,43,2,0,80,242,6,0,0,0,0,0,173,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,80,43,2,0,152,242,6,0,0,0,0,0,175,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,232,42,2,0,72,242,6,0,0,0,0,0,61,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,128,42,2,0,64,242,6,0,0,0,0,0,45,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,232,41,2,0,136,242,6,0,0,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,136,41,2,0,144,242,6,0,0,0,0,0,102,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,160,40,2,0,112,242,6,0,0,0,0,0,109,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,88,40,2,0,160,242,6,0,0,0,0,0,99,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,24,40,2,0,128,242,6,0,0,0,0,0,103,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,216,39,2,0,88,242,6,0,0,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,168,39,2,0,104,242,6,0,0,0,0,0,111,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,104,39,2,0,216,241,6,0,0,0,0,0,47,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,24,39,2,0,32,241,6,0,0,0,0,0,61,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,168,38,2,0,24,241,6,0,0,0,0,0,45,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,48,38,2,0,120,183,8,0,0,0,0,0,103,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,184,37,2,0,124,183,8,0,0,0,0,0,105,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,224,36,2,0,128,183,8,0,0,0,0,0,98,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,152,36,2,0,132,183,8,0,0,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,80,36,2,0,40,241,6,0,0,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,36,2,0,112,241,6,0,0,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,192,35,2,0,104,241,6,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,112,35,2,0,96,241,6,0,0,0,0,0,51,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,16,35,2,0,88,241,6,0,0,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,144,34,2,0,80,241,6,0,0,0,0,0,53,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,216,33,2,0,72,241,6,0,0,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,112,33,2,0,64,241,6,0,0,0,0,0,55,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,8,33,2,0,56,241,6,0,0,0,0,0,56,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,200,32,2,0,48,241,6,0,0,0,0,0,57,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,72,32,2,0,192,241,6,0,0,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,248,31,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,31,2,0,24,32,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,31,2,0,40,243,6,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,31,2,0,32,243,6,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,30,2,0,24,243,6,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,30,2,0,48,243,6,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,29,2,0,80,243,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,72,29,2,0,64,243,6,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,248,28,2,0,72,243,6,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,176,28,2,0,56,243,6,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,80,28,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,28,2,0,0,0,0,0,192,87,1,0,0,0,0,0,184,27,2,0,235,50,164,248,235,50,164,248,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,96,27,2,0,0,0,0,0,196,87,1,0,0,0,0,0,0,27,2,0,235,50,164,248,235,50,164,248,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,96,26,2,0,0,0,0,0,200,87,1,0,0,0,0,0,16,26,2,0,235,50,164,248,235,50,164,248,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,176,25,2,0,0,0,0,0,204,87,1,0,0,0,0,0,104,25,2,0,235,50,164,248,235,50,164,248,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,56,25,2,0,0,0,0,0,208,87,1,0,0,0,0,0,0,25,2,0,235,50,164,248,235,50,164,248,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,200,24,2,0,0,0,0,0,212,87,1,0,0,0,0,0,128,24,2,0,235,50,164,248,235,50,164,248,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,24,24,2,0,0,0,0,0,216,87,1,0,0,0,0,0,192,23,2,0,235,50,164,248,235,50,164,248,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,80,23,2,0,0,0,0,0,220,87,1,0,0,0,0,0,224,22,2,0,235,50,164,248,235,50,164,248,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,144,22,2,0,0,0,0,0,224,87,1,0,0,0,0,0,64,22,2,0,235,50,164,248,235,50,164,248,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,208,21,2,0,0,0,0,0,228,87,1,0,0,0,0,0,168,21,2,0,235,50,164,248,235,50,164,248,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,96,21,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,21,2,0,8,239,6,0,0,0,0,0,247,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,168,20,2,0,184,238,6,0,0,0,0,0,104,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,56,20,2,0,96,238,6,0,0,0,0,0,23,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,96,19,2,0,208,238,6,0,0,0,0,0,55,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,24,19,2,0,240,238,6,0,0,0,0,0,215,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,152,18,2,0,232,238,6,0,0,0,0,0,208,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,104,18,2,0,144,238,6,0,0,0,0,0,175,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,24,18,2,0,248,238,6,0,0,0,0,0,204,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,224,17,2,0,80,238,6,0,0,0,0,0,231,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,160,17,2,0,152,238,6,0,0,0,0,0,175,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,96,17,2,0,0,239,6,0,0,0,0,0,204,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,17,2,0,88,238,6,0,0,0,0,0,231,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,16,16,2,0,112,238,6,0,0,0,0,0,119,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,104,15,2,0,136,238,6,0,0,0,0,0,252,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,168,14,2,0,216,238,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,48,14,2,0,104,238,6,0,0,0,0,0,104,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,248,13,2,0,200,238,6,0,0,0,0,0,88,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,184,13,2,0,120,238,6,0,0,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,112,13,2,0,168,238,6,0,0,0,0,0,231,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,56,13,2,0,176,238,6,0,0,0,0,0,208,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,13,2,0,128,238,6,0,0,0,0,0,208,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,168,12,2,0,160,238,6,0,0,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,80,12,2,0,224,238,6,0,0,0,0,0,177,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,112,11,2,0,192,238,6,0,0,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,8,11,2,0,16,239,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,160,10,2,0,24,239,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,104,10,2,0,192,133,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,10,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,9,2,0,200,90,7,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,104,9,2,0,192,90,7,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,16,9,2,0,208,90,7,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,176,8,2,0,224,90,7,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,56,8,2,0,216,90,7,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,160,7,2,0,64,91,7,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,16,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,248,6,2,0,152,91,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,136,6,2,0,144,92,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,6,2,0,192,116,7,0,0,0,0,0,25,0,0,0,0,0,0,0,0,0,0,0,200,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,160,5,2,0,184,116,7,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,200,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,8,5,2,0,200,116,7,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,200,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,192,4,2,0,0,135,9,0,0,0,0,0,25,0,0,0,0,0,0,0,0,0,0,0,200,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,104,4,2,0,248,134,9,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,200,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,8,4,2,0,8,135,9,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,200,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,144,3,2,0,32,135,9,0,0,0,0,0,25,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,240,2,2,0,24,135,9,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,120,2,2,0,160,93,7,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,2,2,0,152,92,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,1,2,0,56,91,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,184,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,1,2,0,56,1,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,56,1,2,0,60,1,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,8,1,2,0,64,1,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,152,0,2,0,68,1,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,72,0,2,0,72,1,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,176,255,1,0,76,1,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,48,255,1,0,80,1,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,232,254,1,0,84,1,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,176,254,1,0,88,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,216,252,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,50,164,248,235,50,164,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,250,1,0,0,0,0,0,156,137,9,0,0,0,0,0,184,248,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,246,1,0,0,0,0,0,160,137,9,0,0,0,0,0,136,244,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,241,1,0,0,0,0,0,164,137,9,0,0,0,0,0,0,240,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,237,1,0,0,0,0,0,168,137,9,0,0,0,0,0,184,236,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,236,1,0,0,0,0,0,172,137,9,0,0,0,0,0,80,234,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,233,1,0,0,0,0,0,176,137,9,0,0,0,0,0,176,231,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,229,1,0,0,0,0,0,180,137,9,0,0,0,0,0,200,228,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,227,1,0,0,0,0,0,184,137,9,0,0,0,0,0,200,225,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,224,1,0,0,0,0,0,188,137,9,0,0,0,0,0,232,222,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,221,1,0,0,0,0,0,192,137,9,0,0,0,0,0,88,220,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,218,1,0,0,0,0,0,196,137,9,0,0,0,0,0,152,218,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,218,1,0,0,0,0,0,200,137,9,0,0,0,0,0,0,218,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,217,1,0,0,0,0,0,204,137,9,0,0,0,0,0,0,217,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,216,1,0,0,0,0,0,208,137,9,0,0,0,0,0,200,228,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,216,1,0,0,0,0,0,212,137,9,0,0,0,0,0,40,216,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,215,1,0,0,0,0,0,216,137,9,0,0,0,0,0,176,215,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,215,1,0,0,0,0,0,220,137,9,0,0,0,0,0,224,214,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,214,1,0,0,0,0,0,224,137,9,0,0,0,0,0,24,214,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,213,1,0,0,0,0,0,228,137,9,0,0,0,0,0,24,214,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,213,1,0,0,0,0,0,232,137,9,0,0,0,0,0,160,212,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,212,1,0,0,0,0,0,236,137,9,0,0,0,0,0,40,212,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,211,1,0,0,0,0,0,240,137,9,0,0,0,0,0,200,225,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,211,1,0,0,0,0,0,244,137,9,0,0,0,0,0,200,228,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,211,1,0,0,0,0,0,248,137,9,0,0,0,0,0,176,231,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,210,1,0,0,0,0,0,252,137,9,0,0,0,0,0,176,215,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,210,1,0,0,0,0,0,0,138,9,0,0,0,0,0,240,209,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,209,1,0,0,0,0,0,4,138,9,0,0,0,0,0,232,222,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,209,1,0,0,0,0,0,8,138,9,0,0,0,0,0,0,218,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,209,1,0,0,0,0,0,12,138,9,0,0,0,0,0,224,208,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,208,1,0,0,0,0,0,16,138,9,0,0,0,0,0,128,208,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,208,1,0,0,0,0,0,20,138,9,0,0,0,0,0,232,207,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,207,1,0,0,0,0,0,24,138,9,0,0,0,0,0,224,208,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,205,1,0,0,0,0,0,28,138,9,0,0,0,0,0,248,204,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,204,1,0,0,0,0,0,32,138,9,0,0,0,0,0,88,204,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,204,1,0,0,0,0,0,36,138,9,0,0,0,0,0,176,203,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,203,1,0,0,0,0,0,40,138,9,0,0,0,0,0,56,203,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,202,1,0,0,0,0,0,44,138,9,0,0,0,0,0,136,202,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,201,1,0,0,0,0,0,48,138,9,0,0,0,0,0,40,201,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,200,1,0,0,0,0,0,52,138,9,0,0,0,0,0,88,200,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,199,1,0,0,0,0,0,56,138,9,0,0,0,0,0])
.concat([192,199,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,199,1,0,0,0,0,0,60,138,9,0,0,0,0,0,176,198,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,198,1,0,0,0,0,0,64,138,9,0,0,0,0,0,40,198,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,197,1,0,0,0,0,0,68,138,9,0,0,0,0,0,88,204,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,196,1,0,0,0,0,0,72,138,9,0,0,0,0,0,40,201,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,196,1,0,0,0,0,0,76,138,9,0,0,0,0,0,136,202,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,195,1,0,0,0,0,0,80,138,9,0,0,0,0,0,192,199,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,195,1,0,0,0,0,0,84,138,9,0,0,0,0,0,248,204,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,194,1,0,0,0,0,0,88,138,9,0,0,0,0,0,40,198,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,194,1,0,0,0,0,0,92,138,9,0,0,0,0,0,88,204,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,193,1,0,0,0,0,0,96,138,9,0,0,0,0,0,120,193,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,193,1,0,0,0,0,0,100,138,9,0,0,0,0,0,88,200,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,192,1,0,0,0,0,0,104,138,9,0,0,0,0,0,144,192,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,192,1,0,0,0,0,0,108,138,9,0,0,0,0,0,176,203,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,192,1,0,0,0,0,0,112,138,9,0,0,0,0,0,192,199,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,191,1,0,0,0,0,0,116,138,9,0,0,0,0,0,152,191,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,191,1,0,0,0,0,0,120,138,9,0,0,0,0,0,40,201,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,191,1,0,0,0,0,0,124,138,9,0,0,0,0,0,216,190,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,190,1,0,0,0,0,0,128,138,9,0,0,0,0,0,144,192,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,190,1,0,0,0,0,0,132,138,9,0,0,0,0,0,120,193,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,189,1,0,0,0,0,0,136,138,9,0,0,0,0,0,144,189,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,189,1,0,0,0,0,0,140,138,9,0,0,0,0,0,88,200,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,189,1,0,0,0,0,0,144,138,9,0,0,0,0,0,240,188,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,188,1,0,0,0,0,0,148,138,9,0,0,0,0,0,160,188,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,188,1,0,0,0,0,0,152,138,9,0,0,0,0,0,16,188,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,187,1,0,0,0,0,0,156,138,9,0,0,0,0,0,40,187,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,186,1,0,0,0,0,0,160,138,9,0,0,0,0,0,184,186,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,186,1,0,0,0,0,0,164,138,9,0,0,0,0,0,104,186,1,0,235,50,164,248,235,50,164,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,0,0,255,255,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,0,0,0,0,0,0,1,0,144,179,1,0,0,32,48,0,0,0,0,0,20,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,179,1,0,0,32,48,0,0,0,0,0,50,0,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,179,1,0,0,32,48,0,0,0,0,0,50,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,179,1,0,0,32,48,0,0,0,0,0,50,0,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,179,1,0,0,32,48,0,0,0,0,0,50,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,178,1,0,0,32,48,0,0,0,0,0,20,0,86,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,178,1,0,0,32,48,0,0,0,0,0,50,0,95,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,177,1,0,0,32,48,0,0,0,0,0,50,0,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,177,1,0,0,32,48,0,0,0,0,0,50,0,113,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,177,1,0,0,32,48,0,0,0,0,0,50,0,122,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,177,1,0,0,32,48,0,0,0,0,0,50,0,131,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,177,1,0,0,32,48,0,0,0,0,0,50,0,140,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,177,1,0,0,32,48,0,0,0,0,0,50,0,149,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,176,1,0,0,32,48,0,0,0,0,0,50,0,158,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,126,1,0,232,212,8,0,40,111,1,0,236,212,8,0,240,97,1,0,240,212,8,0,104,65,2,0,244,212,8,0,216,58,2,0,248,212,8,0,32,53,2,0,252,212,8,0,88,47,2,0,0,213,8,0,216,41,2,0,4,213,8,0,0,38,2,0,8,213,8,0,184,33,2,0,12,213,8,0,24,30,2,0,16,213,8,0,0,0,0,0,0,0,0,0,30,0,0,0,90,0,0,0,120,0,0,0,120,0,0,0,90,0,0,0,150,0,0,0,120,0,0,0,120,0,0,0,14,1,0,0,90,0,0,0,210,0,0,0,150,0,0,0,150,0,0,0,150,0,0,0,210,0,0,0,150,0,0,0,164,1,0,0,150,0,0,0,210,0,0,0,150,0,0,0,240,0,0,0,150,0,0,0,180,0,0,0,150,0,0,0,150,0,0,0,44,1,0,0,74,1,0,0,164,1,0,0,44,1,0,0,180,0,0,0,120,0,0,0,30,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,248,199,1,0,8,0,0,0,0,0,0,0,28,1,32,0,208,199,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,199,1,0,8,0,0,0,0,0,0,0,28,1,44,0,192,198,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,198,1,0,8,0,0,0,0,0,0,0,28,1,56,0,56,198,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,138,1,0,0,33,0,0,0,0,0,0,57,0,163,0,200,72,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,208,1,0,8,0,0,0,0,0,0,0,28,1,32,0,200,208,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,208,1,0,8,0,0,0,0,0,0,0,28,1,44,0,104,208,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,207,1,0,8,0,0,0,0,0,0,0,28,1,56,0,96,207,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,205,1,0,8,0,0,0,0,0,0,0,28,1,68,0,8,205,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,204,1,0,8,0,0,0,0,0,0,0,28,1,80,0,104,204,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,204,1,0,8,0,0,0,0,0,0,0,28,1,92,0,192,203,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,203,1,0,8,0,0,0,0,0,0,0,28,1,104,0,72,203,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,202,1,0,8,0,0,0,0,0,0,0,28,1,116,0,152,202,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,201,1,0,8,0,0,0,0,0,0,0,28,1,128,0,56,201,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,200,1,0,8,0,0,0,0,0,0,0,28,1,140,0,104,200,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,138,1,0,0,33,0,0,0,0,0,0,57,0,163,0,160,74,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,173,1,0,0,34,0,0,0,0,0,0,54,1,163,0,16,72,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,215,1,0,8,0,0,0,0,0,0,0,28,1,32,0,192,215,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,215,1,0,8,0,0,0,0,0,0,0,28,1,44,0,240,214,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,214,1,0,8,0,0,0,0,0,0,0,28,1,56,0,72,214,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,213,1,0,8,0,0,0,0,0,0,0,28,1,68,0,24,213,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,212,1,0,8,0,0,0,0,0,0,0,28,1,80,0,128,212,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,212,1,0,8,0,0,0,0,0,0,0,28,1,92,0,0,212,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,211,1,0,8,0,0,0,0,0,0,0,28,1,104,0,152,211,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,210,1,0,8,0,0,0,0,0,0,0,28,1,116,0,176,210,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,210,1,0,8,0,0,0,0,0,0,0,28,1,128,0,200,209,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,209,1,0,8,0,0,0,0,0,0,0,28,1,140,0,48,209,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,45,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,173,1,0,0,34,0,0,0,0,0,0,54,1,163,0,200,72,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,74,1,0,200,72,1,0,16,72,1,0,0,0,0,0,56,145,1,0,0,131,1,0,64,116,1,0,144,101,1,0,96,67,2,0,152,61,2,0,88,55,2,0,40,48,2,0,40,43,2,0,80,39,2,0,80,35,2,0,96,31,2,0,160,27,2,0,88,24,2,0,232,20,2,0,64,17,2,0,232,12,2,0,240,8,2,0,87,73,67,79,76,79,78,0,10,0,0,0,4,0,0,0,20,0,0,0,1,0,0,0,3,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,0,0,0,0,146,36,1,0,0,0,0,0,146,36,1,0,0,0,0,0,73,146,0,0,36,73,0,0,146,36,1,0,0,0,0,0,73,146,0,0,220,182,255,255,0,0,255,255,0,0,0,0,220,182,254,255,36,73,0,0,0,0,255,255,0,0,0,0,220,182,254,255,220,182,255,255,36,73,255,255,0,0,0,0,0,0,255,255,36,73,0,0,36,73,255,255,0,0,0,0,0,0,255,255,220,182,255,255,252,177,255,255,36,73,0,0,252,177,255,255,220,182,255,255,252,177,255,255,220,182,255,255,106,141,255,255,220,182,255,255,106,141,255,255,220,182,255,255,106,141,255,255,110,219,255,255,191,226,255,255,36,73,0,0,191,226,255,255,220,182,255,255,191,226,255,255,36,73,0,0,81,7,0,0,36,73,0,0,227,43,0,0,36,73,0,0,227,43,0,0,220,182,255,255,227,43,0,0,36,73,0,0,117,80,0,0,36,73,0,0,24,61,2,0,56,60,2,0,0,0,0,0,28,1,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,16,2,0,128,207,1,0,7,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,176,1,0,56,157,1,0,7,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,143,1,0,120,129,1,0,7,0,0,0,162,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,114,1,0,0,100,1,0,7,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,66,2,0,40,60,2,0,7,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,54,2,0,176,48,2,0,7,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,42,2,0,208,38,2,0,7,0,0,0,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,34,2,0,208,38,2,0,7,0,0,0,186,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,30,2,0,208,38,2,0,7,0,0,0,226,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,27,2,0,248,23,2,0,7,0,0,0,226,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,20,2,0,80,16,2,0,7,0,0,0,226,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,12,2,0,120,8,2,0,7,0,0,0,226,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,3,2,0,112,0,2,0,1,0,0,0,226,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,242,1,0,64,228,1,0,1,0,0,0,226,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,217,1,0,88,214,1,0,1,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,210,1,0,112,207,1,0,15,0,0,0,240,1,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,202,1,0,72,198,1,0,1,0,0,0,82,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,193,1,0,184,190,1,0,0,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,188,1,0,0,0,0,0,7,0,0,0,144,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,185,1,0,0,0,0,0,7,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,183,1,0,8,181,1,0,1,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,178,1,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,176,1,0,0,0,0,0,7,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,174,1,0,0,0,0,0,7,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,171,1,0,0,0,0,0,7,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,168,1,0,0,0,0,0,7,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,166,1,0,0,0,0,0,7,0,0,0,56,1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,164,1,0,0,0,0,0,7,0,0,0,56,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,162,1,0,0,0,0,0,7,0,0,0,56,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,161,1,0,0,0,0,0,7,0,0,0,56,1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,160,1,0,0,0,0,0,7,0,0,0,56,1,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,158,1,0,0,0,0,0,7,0,0,0,56,1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,157,1,0,0,0,0,0,7,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,155,1,0,0,0,0,0,7,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,155,1,0,0,0,0,0,7,0,0,0,114,1,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,154,1,0,0,0,0,0,7,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,154,1,0,0,0,0,0,7,0,0,0,220,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,151,1,0,0,0,0,0,0,0,0,0,150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,150,1,0,0,0,0,0,7,0,0,0,184,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,148,1,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,147,1,0,0,0,0,0,0,0,0,0,150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,146,1,0,0,0,0,0,7,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,146,1,0,0,0,0,0,7,0,0,0,220,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,145,1,0,0,0,0,0,7,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,145,1,0,0,0,0,0,7,0,0,0,142,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,143,1,0,0,0,0,0,7,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,192,1,0,64,0,0,0,0,0,0,0,20,0,47,0,40,192,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,191,1,0,64,0,0,0,0,0,0,0,20,0,55,0,168,191,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,191,1,0,64,0,0,0,0,0,0,0,20,0,63,0,64,191,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,190,1,0,64,0,0,0,0,0,0,0,20,0,71,0,168,190,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,190,1,0,64,0,0,0,0,0,0,0,20,0,79,0,232,189,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,189,1,0,64,0,0,0,0,0,0,0,20,0,87,0,88,189,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,189,1,0,64,0,0,0,0,0,0,0,20,0,95,0,0,189,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,188,1,0,64,0,0,0,0,0,0,0,20,0,103,0,176,188,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,188,1,0,64,0,0,0,0,0,0,0,20,0,111,0,32,188,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,187,1,0,64,0,0,0,0,0,0,0,20,0,119,0,56,187,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,45,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,86,1,0,0,0,0,0,24,98,1,0,40,23,2,0,56,213,1,0,32,180,1,0,184,159,1,0,120,145,1,0,104,131,1,0,200,116,1,0,216,101,1,0,208,93,1,0,216,135,0,0,1,0,0,0,232,135,0,0,2,0,0,0,40,136,0,0,10,0,0,0,16,136,0,0,11,0,0,0,48,136,0,0,12,0,0,0,8,136,0,0,18,0,0,0,64,136,0,0,14,0,0,0,32,136,0,0,17,0,0,0,72,136,0,0,15,0,0,0,88,136,0,0,20,0,0,0,248,135,0,0,22,0,0,0,240,135,0,0,5,0,0,0,0,136,0,0,8,0,0,0,80,136,0,0,3,0,0,0,224,135,0,0,19,0,0,0,56,136,0,0,21,0,0,0,24,136,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,84,70,68,69,65,68,48,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,232,211,1,0,0,0,0,0,16,212,1,0,0,0,0,0,104,212,1,0,0,0,0,0,144,212,1,0,0,0,0,0,144,209,1,0,0,0,0,0,48,210,1,0,0,0,0,0,200,210,1,0,0,0,0,0,216,209,1,0,0,0,0,0,16,211,1,0,0,0,0,0,168,211,1,0,0,0,0,0,64,209,1,0,0,0,0,0,40,0,0,0,0,0,0,0,24,27,2,0,32,0,0,0,0,0,0,0,250,0,31,0,112,26,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,26,2,0,32,0,0,0,0,0,0,0,250,0,39,0,192,25,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,25,2,0,32,0,0,0,0,0,0,0,250,0,47,0,72,25,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,25,2,0,32,0,0,0,0,0,0,0,250,0,55,0,216,24,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,24,2,0,32,0,0,0,0,0,0,0,250,0,63,0,40,24,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,23,2,0,32,0,0,0,0,0,0,0,250,0,71,0,96,23,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,22,2,0,32,0,0,0,0,0,0,0,250,0,79,0,160,22,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,22,2,0,32,0,0,0,0,0,0,0,250,0,87,0,224,21,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,21,2,0,32,0,0,0,0,0,0,0,250,0,95,0,120,21,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,21,2,0,32,0,0,0,0,0,0,0,250,0,103,0,184,20,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,20,2,0,32,0,0,0,0,0,0,0,250,0,111,0,112,19,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,19,2,0,32,0,0,0,0,0,0,0,250,0,127,0,168,18,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,138,1,0,0,33,0,0,0,0,0,0,57,0,191,0,232,90,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,39,2,0,32,0,0,0,0,0,0,0,250,0,31,0,40,39,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,38,2,0,32,0,0,0,0,0,0,0,250,0,39,0,64,38,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,37,2,0,32,0,0,0,0,0,0,0,250,0,47,0,240,36,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,36,2,0,32,0,0,0,0,0,0,0,250,0,55,0,104,36,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,36,2,0,32,0,0,0,0,0,0,0,250,0,63,0,208,35,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,35,2,0,32,0,0,0,0,0,0,0,250,0,71,0,32,35,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,34,2,0,32,0,0,0,0,0,0,0,250,0,79,0,232,33,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,33,2,0,32,0,0,0,0,0,0,0,250,0,87,0,24,33,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,32,2,0,32,0,0,0,0,0,0,0,250,0,95,0,88,32,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,32,2,0,32,0,0,0,0,0,0,0,250,0,103,0,200,31,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,31,2,0,32,0,0,0,0,0,0,0,250,0,111,0,48,31,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,30,2,0,32,0,0,0,0,0,0,0,250,0,119,0,64,30,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,29,2,0,16,0,0,0,0,0,0,0,250,0,135,0,88,29,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,29,2,0,16,0,0,0,0,0,0,0,250,0,143,0,192,28,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,28,2,0,8,0,0,0,0,0,0,0,250,0,151,0,24,28,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,27,2,0,8,0,0,0,0,0,0,0,250,0,159,0,112,27,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,45,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,173,1,0,0,34,0,0,0,0,0,0,54,1,191,0,240,88,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,90,1,0,240,88,1,0,0,0,0,0,0,0,0,0,0,241,0,0,88,237,0,0,232,234,0,0,0,0,0,0,128,2,0,0,0,5,0,0,64,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,89,101,115,0,0,0,0,0,109,111,117,115,101,98,95,115,116,114,97,102,101,0,0,0,80,79,76,52,0,0,0,0,69,78,65,66,76,69,32,66,79,66,66,73,78,71,0,0,105,116,101,109,117,112,0,0,114,98,0,0,0,0,0,0,69,51,77,50,58,32,83,108,111,117,103,104,32,111,102,32,68,101,115,112,97,105,114,0,109,111,117,115,101,98,95,102,105,114,101,0,0,0,0,0,80,79,76,53,0,0,0,0,119,101,97,112,111,110,95,114,101,99,111,105,108,0,0,0,115,108,111,112,0,0,0,0,73,100,101,110,116,105,102,121,86,101,114,115,105,111,110,58,32,73,87,65,68,32,110,111,116,32,102,111,117,110,100,10,0,0,0,0,0,0,0,0,69,51,77,49,58,32,72,101,108,108,32,75,101,101,112,0,109,111,117,115,101,95,115,101,110,115,105,116,105,118,105,116,121,95,118,101,114,116,0,0,80,79,76,50,0,0,0,0,69,78,65,66,76,69,32,82,69,67,79,73,76,0,0,0,112,101,112,97,105,110,0,0,85,110,107,110,111,119,110,32,71,97,109,101,32,86,101,114,115,105,111,110,44,32,109,97,121,32,110,111,116,32,119,111,114,107,10,0,0,0,0,0,69,50,77,57,58,32,70,111,114,116,114,101,115,115,32,111,102,32,77,121,115,116,101,114,121,0,0,0,0,0,0,0,109,111,117,115,101,95,115,101,110,115,105,116,105,118,105,116,121,95,104,111,114,105,122,0,71,79,82,49,0,0,0,0,77,95,75,69,89,66,78,68,0,0,0,0,0,0,0,0,109,110,112,97,105,110,0,0,73,87,65,68,32,102,111,117,110,100,58,32,37,115,10,0,75,101,121,115,32,65,100,100,101,100,0,0,0,0,0,0,69,50,77,56,58,32,84,111,119,101,114,32,111,102,32,66,97,98,101,108,0,0,0,0,117,115,101,95,109,111,117,115,101,0,0,0,0,0,0,0,83,77,84,50,0,0,0,0,70,76,79,79,82,52,95,54,0,0,0,0,0,0,0,0,69,50,77,55,58,32,83,112,97,119,110,105,110,103,32,86,97,116,115,0,0,0,0,0,118,105,112,97,105,110,0,0,69,114,114,111,114,58,32,45,115,97,118,101,32,112,97,116,104,32,100,111,101,115,32,110,111,116,32,101,120,105,115,116,44,32,117,115,105,110,103,32,37,115,10,0,0,0,0,0,86,101,114,121,32,72,97,112,112,121,32,65,109,109,111,32,65,100,100,101,100,0,0,0,68,101,118,101,108,111,112,109,101,110,116,32,109,111,100,101,32,79,78,46,10,0,0,0,77,111,117,115,101,32,115,101,116,116,105,110,103,115,0,0,67,79,76,85,0,0,0,0,69,78,84,69,82,0,0,0,112,111,112,97,105,110,0,0,45,115,97,118,101,0,0,0,80,111,115,105,116,105,111,110,32,40,37,100,44,37,100,44,37,100,41,9,65,110,103,108,101,32,37,45,46,48,102,0,69,50,77,54,58,32,72,97,108,108,115,32,111,102,32,116,104,101,32,68,97,109,110,101,100,0,0,0,0,0,0,0,47,117,115,114,47,108,111,99,97,108,47,115,104,97,114,101,47,103,97,109,101,115,47,100,111,111,109,0,0,0,0,0,49,53,0,0,0,0,0,0,37,99,0,0,0,0,0,0,99,111,117,110,116,115,73,110,67,111,108,117,109,110,91,116,120,93,46,112,111,115,116,115,95,117,115,101,100,32,60,61,32,99,111,117,110,116,115,73,110,67,111,108,117,109,110,91,116,120,93,46,112,111,115,116,115,0,0,0,0,0,0,0,98,114,100,114,95,116,114,0,87,73,77,65,80,37,100,0,100,111,110,39,116,32,103,111,32,110,111,119,44,32,116,104,101,114,101,39,115,32,97,32,10,100,105,109,101,110,115,105,111,110,97,108,32,115,104,97,109,98,108,101,114,32,119,97,105,116,105,110,103,10,97,116,32,116,104,101,32,100,111,115,32,112,114,111,109,112,116,33,0,0,0,0,0,0,0,0,66,95,83,84,65,82,84,0,112,97,116,99,104,95,101,100,103,101,115,0,0,0,0,0,83,71,78,50,0,0,0,0,70,108,97,116,115,32,0,0,80,76,65,89,69,82,32,52,0,0,0,0,0,0,0,0,100,109,112,97,105,110,0,0,68,79,79,77,83,65,86,69,68,73,82,0,0,0,0,0,78,101,119,32,99,111,109,112,97,116,105,98,105,108,105,116,121,32,108,101,118,101,108,58,10,37,115,0,0,0,0,0,69,50,77,53,58,32,67,111,109,109,97,110,100,32,67,101,110,116,101,114,0,0,0,0,67,82,71,82,65,89,0,0,99,111,114,114,101,99,116,101,100,46,0,0,0,0,0,0,83,84,70,84,82,37,100,48,0,0,0,0,0,0,0,0,78,111,0,0,0,0,0,0,82,101,115,112,97,119,110,32,102,114,97,109,101,0,0,0,108,101,118,101,108,95,112,114,101,99,97,99,104,101,0,0,66,105,116,115,50,0,0,0,115,112,114,105,116,101,95,101,100,103,101,115,0,0,0,0,83,72,79,84,0,0,0,0,66,105,116,115,0,0,0,0,80,76,65,89,69,82,32,51,0,0,0,0,0,0,0,0,77,73,83,71,0,0,0,0,112,108,112,97,105,110,0,0,45,98,101,120,111,117,116,0,86,97,114,105,97,98,108,101,32,70,114,105,99,116,105,111,110,32,100,105,115,97,98,108,101,100,0,0,0,0,0,0,65,99,116,105,111,110,32,115,111,117,110,100,0,0,0,0,77,105,115,115,105,108,101,32,100,97,109,97,103,101,0,0,69,50,77,52,58,32,68,101,105,109,111,115,32,76,97,98,0,0,0,0,0,0,0,0,77,97,115,115,0,0,0,0,72,101,105,103,104,116,0,0,87,105,100,116,104,0,0,0,77,95,76,83,76,69,70,84,0,0,0,0,0,0,0,0,83,112,101,101,100,0,0,0,68,101,97,116,104,32,115,111,117,110,100,0,0,0,0,0,101,50,109,49,0,0,0,0,69,120,112,108,111,100,105,110,103,32,102,114,97,109,101,0,46,119,97,100,0,0,0,0,68,101,97,116,104,32,102,114,97,109,101,0,0,0,0,0,80,95,71,114,111,117,112,76,105,110,101,115,58,32,83,117,98,115,101,99,116,111,114,32,97,32,112,97,114,116,32,111,102,32,110,111,32,115,101,99,116,111,114,33,10,0,0,0,102,105,108,116,101,114,95,116,104,114,101,115,104,111,108,100,0,0,0,0,0,0,0,0,80,76,65,83,0,0,0,0,70,97,114,32,97,116,116,97,99,107,32,102,114,97,109,101,0,0,0,0,0,0,0,0,80,76,65,89,69,82,32,50,0,0,0,0,0,0,0,0,115,119,116,99,104,120,0,0,45,100,101,104,111,117,116,0,86,97,114,105,97,98,108,101,32,70,114,105,99,116,105,111,110,32,101,110,97,98,108,101,100,0,0,0,0,0,0,0,65,109,109,111,0,0,0,0,67,108,111,115,101,32,97,116,116,97,99,107,32,102,114,97,109,101,0,0,0,0,0,0,121,111,117,32,99,97,110,39,116,32,115,116,97,114,116,32,97,32,110,101,119,32,103,97,109,101,10,119,104,105,108,101,32,105,110,32,97,32,110,101,116,119,111,114,107,32,103,97,109,101,46,10,10,112,114,101,115,115,32,97,32,107,101,121,46,0,0,0,0,0,0,0,80,97,105,110,32,115,111,117,110,100,0,0,0,0,0,0,69,50,77,51,58,32,82,101,102,105,110,101,114,121,0,0,80,97,105,110,32,99,104,97,110,99,101,0,0,0,0,0,73,110,106,117,114,121,32,102,114,97,109,101,0,0,0,0,65,116,116,97,99,107,32,115,111,117,110,100,0,0,0,0,82,101,97,99,116,105,111,110,32,116,105,109,101,0,0,0,65,108,101,114,116,32,115,111,117,110,100,0,0,0,0,0,70,105,114,115,116,32,109,111,118,105,110,103,32,102,114,97,109,101,0,0,0,0,0,0,72,105,116,32,112,111,105,110,116,115,0,0,0,0,0,0,102,105,108,116,101,114,95,112,97,116,99,104,0,0,0,0,76,65,85,78,0,0,0,0,73,110,105,116,105,97,108,32,102,114,97,109,101,0,0,0,80,76,65,89,69,82,32,49,0,0,0,0,0,0,0,0,115,119,116,99,104,110,0,0,45,99,104,101,99,107,115,117,109,0,0,0,0,0,0,0,80,117,115,104,101,114,115,32,100,105,115,97,98,108,101,100,0,0,0,0,0,0,0,0,73,68,32,35,0,0,0,0,70,82,73,69,78,68,0,0,69,50,77,50,58,32,67,111,110,116,97,105,110,109,101,110,116,32,65,114,101,97,0,0,117,108,116,105,109,97,116,101,32,100,111,111,109,0,0,0,66,79,85,78,67,69,83,0,84,79,85,67,72,89,0,0,84,82,65,78,83,76,85,67,69,78,84,0,0,0,0,0,85,78,85,83,69,68,52,0,85,78,85,83,69,68,51,0,85,78,85,83,69,68,50,0,73,39,108,108,32,116,97,107,101,32,99,97,114,101,32,111,102,32,105,116,46,0,0,0,85,78,85,83,69,68,49,0,102,105,108,116,101,114,95,122,0,0,0,0,0,0,0,0,67,83,65,87,0,0,0,0,84,82,65,78,83,76,65,84,73,79,78,50,0,0,0,0,66,69,71,73,78,32,67,72,65,84,0,0,0,0,0,0,115,116,110,109,111,118,0,0,45,114,101,99,111,114,100,0,80,117,115,104,101,114,115,32,101,110,97,98,108,101,100,0,84,82,65,78,83,76,65,84,73,79,78,49,0,0,0,0,84,82,65,78,83,76,65,84,73,79,78,0,0,0,0,0,69,50,77,49,58,32,68,101,105,109,111,115,32,65,110,111,109,97,108,121,0,0,0,0,78,79,84,68,77,65,84,67,72,0,0,0,0,0,0,0,83,75,85,76,76,70,76,89,0,0,0,0,0,0,0,0,67,79,85,78,84,73,84,69,77,0,0,0,0,0,0,0,67,79,85,78,84,75,73,76,76,0,0,0,0,0,0,0,73,78,70,76,79,65,84,0,67,79,82,80,83,69,0,0,78,79,66,76,79,79,68,0,102,105,108,116,101,114,95,115,112,114,105,116,101,0,0,0,77,71,85,78,0,0,0,0,83,72,65,68,79,87,0,0,67,72,65,84,84,73,78,71,0,0,0,0,0,0,0,0,100,111,114,99,108,115,0,0,45,108,111,97,100,103,97,109,101,0,0,0,0,0,0,0,84,114,97,110,115,108,117,99,101,110,99,121,32,100,105,115,97,98,108,101,100,0,0,0,68,82,79,80,80,69,68,0,77,73,83,83,73,76,69,0,69,49,77,57,58,32,77,105,108,105,116,97,114,121,32,66,97,115,101,0,0,0,0,0,84,69,76,69,80,79,82,84,0,0,0,0,0,0,0,0,70,76,79,65,84,0,0,0,83,76,73,68,69,0,0,0,78,79,67,76,73,80,0,0,80,73,67,75,85,80,0,0,68,82,79,80,79,70,70,0,78,79,71,82,65,86,73,84,89,0,0,0,0,0,0,0,102,105,108,116,101,114,95,102,108,111,111,114,0,0,0,0,66,70,85,71,0,0,0,0,83,80,65,87,78,67,69,73,76,73,78,71,0,0,0,0,71,82,73,68,0,0,0,0,100,111,114,111,112,110,0,0,45,114,101,99,111,114,100,102,114,111,109,0,0,0,0,0,84,114,97,110,115,108,117,99,101,110,99,121,32,101,110,97])
.concat([98,108,101,100,0,0,0,0,74,85,83,84,65,84,84,65,67,75,69,68,0,0,0,0,74,85,83,84,72,73,84,0,69,49,77,56,58,32,80,104,111,98,111,115,32,65,110,111,109,97,108,121,0,0,0,0,65,77,66,85,83,72,0,0,78,79,66,76,79,67,75,77,65,80,0,0,0,0,0,0,78,79,83,69,67,84,79,82,0,0,0,0,0,0,0,0,83,72,79,79,84,65,66,76,69,0,0,0,0,0,0,0,83,79,76,73,68,0,0,0,83,80,69,67,73,65,76,0,65,115,115,105,103,110,101,100,32,48,120,37,48,56,108,120,37,48,56,108,120,32,116,111,32,37,115,40,37,100,41,32,97,116,32,105,110,100,101,120,32,37,100,10,0,0,0,0,102,105,108,116,101,114,95,119,97,108,108,0,0,0,0,0,66,80,65,75,0,0,0,0,66,105,116,115,32,61,32,48,120,37,48,56,108,88,37,48,56,108,88,10,0,0,0,0,70,85,76,76,47,90,79,79,77,0,0,0,0,0,0,0,112,115,116,111,112,0,0,0,45,97,117,116,111,115,104,111,116,0,0,0,0,0,0,0,115,0,0,0,0,0,0,0,67,111,117,108,100,32,110,111,116,32,102,105,110,100,32,98,105,116,32,109,110,101,109,111,110,105,99,32,37,115,10,0,79,82,101,100,32,118,97,108,117,101,32,48,120,37,48,56,108,88,37,48,56,108,88,32,37,115,10,0,0,0,0,0,69,49,77,55,58,32,67,111,109,112,117,116,101,114,32,83,116,97,116,105,111,110,0,0,44,43,124,32,9,12,13,0,98,105,116,115,0,0,0,0,99,111,117,110,116,61,37,100,44,32,84,104,105,110,103,32,37,100,10,0,0,0,0,0,84,104,105,110,103,32,108,105,110,101,58,32,39,37,115,39,10,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,102,114,97,109,101,32,115,116,114,105,110,103,32,105,110,100,101,120,32,102,111,114,32,39,37,115,39,10,0,0,0,0,32,45,32,109,105,115,99,50,32,61,32,37,108,108,100,10,0,0,0,0,0,0,0,0,32,45,32,109,105,115,99,49,32,61,32,37,108,108,100,10,0,0,0,0,0,0,0,0,117,110,99,97,112,112,101,100,95,102,114,97,109,101,114,97,116,101,0,0,0,0,0,0,83,66,79,88,0,0,0,0,32,45,32,99,111,100,101,112,44,32,115,104,111,117,108,100,32,110,111,116,32,98,101,32,115,101,116,32,105,110,32,70,114,97,109,101,32,115,101,99,116,105,111,110,33,10,0,0,67,76,69,65,82,32,77,65,82,75,83,0,0,0,0,0,112,115,116,97,114,116,0,0,83,84,95,73,110,105,116,58,32,73,110,105,116,32,115,116,97,116,117,115,32,98,97,114,46,10,0,0,0,0,0,0,32,45,32,110,101,120,116,115,116,97,116,101,32,61,32,37,108,108,100,10,0,0,0,0,32,45,32,116,105,99,115,32,61,32,37,108,108,100,10,0,69,49,77,54,58,32,67,101,110,116,114,97,108,32,80,114,111,99,101,115,115,105,110,103,0,0,0,0,0,0,0,0,32,45,32,102,114,97,109,101,32,61,32,37,108,108,100,10,0,0,0,0,0,0,0,0,32,45,32,115,112,114,105,116,101,32,61,32,37,108,108,100,10,0,0,0,0,0,0,0,66,97,100,32,102,114,97,109,101,32,110,117,109,98,101,114,32,37,100,32,111,102,32,37,100,10,0,0,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,70,114,97,109,101,32,97,116,32,105,110,100,101,120,32,37,100,58,32,37,115,10,0,0,0,0,0,0,0,85,110,107,110,111,119,110,32,50,0,0,0,0,0,0,0,85,110,107,110,111,119,110,32,49,0,0,0,0,0,0,0,67,111,100,101,112,32,70,114,97,109,101,0,0,0,0,0,117,115,101,103,97,109,109,97,0,0,0,0,0,0,0,0,83,72,69,76,0,0,0,0,78,101,120,116,32,102,114,97,109,101,0,0,0,0,0,0,77,65,82,75,32,80,76,65,67,69,0,0,0,0,0,0,102,105,114,120,112,108,0,0,72,85,95,73,110,105,116,58,32,83,101,116,116,105,110,103,32,117,112,32,104,101,97,100,115,32,117,112,32,100,105,115,112,108,97,121,46,10,0,0,37,100,32,77,111,110,115,116,101,114,37,115,32,75,105,108,108,101,100,0,0,0,0,0,68,117,114,97,116,105,111,110,0,0,0,0,0,0,0,0,83,112,114,105,116,101,32,115,117,98,110,117,109,98,101,114,0,0,0,0,0,0,0,0,69,49,77,53,58,32,80,104,111,98,111,115,32,76,97,98,0,0,0,0,0,0,0,0,68,79,79,77,87,65,68,68,73,82,0,0,0,0,0,0,108,101,102,116,118,111,108,32,111,117,116,32,111,102,32,98,111,117,110,100,115,0,0,0,83,112,114,105,116,101,32,110,117,109,98,101,114,0,0,0,50,46,53,46,48,0,0,0,27,91,37,100,109,0,0,0,73,110,118,97,108,105,100,32,102,114,97,109,101,32,112,111,105,110,116,101,114,32,105,110,100,101,120,32,102,111,114,32,39,37,115,39,32,97,116,32,37,108,108,100,10,0,0,0,40,40,40,98,121,116,101,42,41,99,111,109,112,111,115,105,116,101,95,112,97,116,99,104,45,62,112,111,115,116,115,32,43,32,110,117,109,80,111,115,116,115,84,111,116,97,108,42,115,105,122,101,111,102,40,114,112,111,115,116,95,116,41,41,32,45,32,40,98,121,116,101,42,41,99,111,109,112,111,115,105,116,101,95,112,97,116,99,104,45,62,100,97,116,97,41,32,61,61,32,100,97,116,97,83,105,122,101,0,0,0,0,66,69,88,32,91,67,79,68,69,80,84,82,93,32,45,62,32,70,82,65,77,69,32,37,100,32,61,32,37,115,10,0,32,45,32,97,112,112,108,105,101,100,32,102,114,111,109,32,99,111,100,101,112,116,114,91,37,108,108,100,93,32,116,111,32,115,116,97,116,101,115,91,37,100,93,10,0,0,0,0,70,114,97,109,101,32,114,97,116,101,32,37,100,32,102,112,115,10,83,101,103,115,32,37,100,44,32,86,105,115,112,108,97,110,101,115,32,37,100,44,32,83,112,114,105,116,101,115,32,37,100,0,0,0,0,0,66,97,100,32,112,111,105,110,116,101,114,32,110,117,109,98,101,114,32,37,108,108,100,32,111,102,32,37,100,10,0,0,80,114,111,99,101,115,115,105,110,103,32,80,111,105,110,116,101,114,32,97,116,32,105,110,100,101,120,32,37,100,58,32,37,115,10,0,0,0,0,0,98,114,100,114,95,116,108,0,73,78,84,69,82,80,73,67,0,0,0,0,0,0,0,0,37,42,115,32,37,42,105,32,40,37,115,32,37,105,41,0,121,111,117,32,119,97,110,116,32,116,111,32,113,117,105,116,63,10,116,104,101,110,44,32,116,104,111,117,32,104,97,115,116,32,108,111,115,116,32,97,110,32,101,105,103,104,116,104,33,0,0,0,0,0,0,0,67,95,69,78,68,0,0,0,115,99,114,101,101,110,98,108,111,99,107,115,0,0,0,0,67,69,76,80,0,0,0,0,78,101,103,46,32,79,110,101,32,50,0,0,0,0,0,0,84,101,120,116,117,114,101,115,32,0,0,0,0,0,0,0,83,72,73,70,84,32,82,73,71,72,84,0,0,0,0,0,69,49,77,52,58,32,67,111,109,109,97,110,100,32,67,111,110,116,114,111,108,0,0,0,102,105,114,115,104,116,0,0,83,95,73,110,105,116,58,32,83,101,116,116,105,110,103,32,117,112,32,115,111,117,110,100,46,10,0,0,0,0,0,0,72,79,77,32,68,101,116,101,99,116,105,111,110,32,79,102,102,0,0,0,0,0,0,0,78,101,103,46,32,79,110,101,32,49,0,0,0,0,0,0,90,101,114,111,32,52,0,0,37,115,0,0,0,0,0,0,90,101,114,111,32,51,0,0,67,82,84,65,78,0,0,0,111,107,46,0,0,0,0,0,90,101,114,111,32,50,0,0,83,84,70,83,84,37,100,37,100,0,0,0,0,0,0,0,90,101,114,111,32,49,0,0,86,97,108,117,101,0,0,0,90,101,114,111,47,79,110,101,0,0,0,0,0,0,0,0,79,102,102,115,101,116,0,0,101,110,100,111,111,109,95,109,111,100,101,0,0,0,0,0,73,110,118,97,108,105,100,32,115,111,117,110,100,32,115,116,114,105,110,103,32,105,110,100,101,120,32,102,111,114,32,39,37,115,39,10,0,0,0,0,116,114,97,110,95,102,105,108,116,101,114,95,112,99,116,0,67,69,76,76,0,0,0,0,66,97,100,32,115,111,117,110,100,32,110,117,109,98,101,114,32,37,100,32,111,102,32,37,100,10,0,0,0,0,0,0,83,72,73,70,84,32,76,69,70,84,0,0,0,0,0,0,67,72,71,70,0,0,0,0,114,120,112,108,111,100,0,0,73,95,73,110,105,116,58,32,83,101,116,116,105,110,103,32,117,112,32,109,97,99,104,105,110,101,32,115,116,97,116,101,46,10,0,0,0,0,0,0,72,79,77,32,68,101,116,101,99,116,105,111,110,32,79,110,0,0,0,0,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,83,111,117,110,100,115,32,97,116,32,105,110,100,101,120,32,37,100,58,32,37,115,10,0,0,0,0,0,0,80,101,114,32,97,109,109,111,0,0,0,0,0,0,0,0,69,49,77,51,58,32,84,111,120,105,110,32,82,101,102,105,110,101,114,121,0,0,0,0,77,97,120,32,97,109,109,111,0,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,97,109,109,111,32,115,116,114,105,110,103,32,105,110,100,101,120,32,102,111,114,32,39,37,115,39,10,0,0,0,0,0,66,97,100,32,97,109,109,111,32,110,117,109,98,101,114,32,37,100,32,111,102,32,37,100,10,0,0,0,0,0,0,0,77,95,76,79,65,68,71,0,80,114,111,99,101,115,115,105,110,103,32,65,109,109,111,32,97,116,32,105,110,100,101,120,32,37,100,58,32,37,115,10,0,0,0,0,0,0,0,0,70,105,114,105,110,103,32,102,114,97,109,101,0,0,0,0,101,49,109,57,0,0,0,0,83,104,111,111,116,105,110,103,32,102,114,97,109,101,0,0,77,95,80,65,85,83,69,0,66,111,98,98,105,110,103,32,102,114,97,109,101,0,0,0,80,95,76,111,97,100,84,104,105,110,103,115,58,32,110,111,32,116,104,105,110,103,115,32,105,110,32,108,101,118,101,108,0,0,0,0,0,0,0,0,116,114,97,110,115,108,117,99,101,110,99,121,0,0,0,0,66,82,79,75,0,0,0,0,83,101,108,101,99,116,32,102,114,97,109,101,0,0,0,0,83,72,73,70,84,32,68,79,87,78,0,0,0,0,0,0,114,108,97,117,110,99,0,0,10,80,95,73,110,105,116,58,32,73,110,105,116,32,80,108,97,121,108,111,111,112,32,115,116,97,116,101,46,10,0,0,70,97,115,116,32,77,111,110,115,116,101,114,115,32,79,102,102,0,0,0,0,0,0,0,105,100,102,97,0,0,0,0,68,101,115,101,108,101,99,116,32,102,114,97,109,101,0,0,100,111,32,121,111,117,32,119,97,110,116,32,116,111,32,113,117,105,99,107,108,111,97,100,32,116,104,101,32,103,97,109,101,32,110,97,109,101,100,10,10,39,37,115,39,63,10,10,112,114,101,115,115,32,121,32,111,114,32,110,46,0,0,0,65,109,109,111,32,116,121,112,101,0,0,0,0,0,0,0,69,49,77,50,58,32,78,117,99,108,101,97,114,32,80,108,97,110,116,0,0,0,0,0,73,110,118,97,108,105,100,32,119,101,97,112,111,110,32,115,116,114,105,110,103,32,105,110,100,101,120,32,102,111,114,32,39,37,115,39,10,0,0,0,66,97,100,32,119,101,97,112,111,110,32,110,117,109,98,101,114,32,37,100,32,111,102,32,37,100,10,0,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,87,101,97,112,111,110,32,97,116,32,105,110,100,101,120,32,37,100,58,32,37,115,10,0,0,0,0,0,0,73,103,110,111,114,105,110,103,32,83,112,114,105,116,101,32,111,102,102,115,101,116,32,99,104,97,110,103,101,32,97,116,32,105,110,100,101,120,32,37,100,58,32,37,115,10,0,0,45,32,37,115,10,0,0,0,65,115,115,105,103,110,101,100,32,110,101,119,32,99,104,101,97,116,32,39,37,115,39,32,116,111,32,99,104,101,97,116,32,39,37,115,39,97,116,32,105,110,100,101,120,32,37,100,10,0,0,0,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,67,104,101,97,116,58,32,37,115,10,0,0,0,117,115,101,95,100,111,117,98,108,101,98,117,102,102,101,114,0,0,0,0,0,0,0,0,82,79,67,75,0,0,0,0,77,111,110,115,116,101,114,115,32,73,110,102,105,103,104,116,0,0,0,0,0,0,0,0,83,72,73,70,84,32,85,80,0,0,0,0,0,0,0,0,115,97,119,104,105,116,0,0,82,95,73,110,105,116,58,32,73,110,105,116,32,68,79,79,77,32,114,101,102,114,101,115,104,32,100,97,101,109,111,110,32,45,32,0,0,0,0,0,70,97,115,116,32,77,111,110,115,116,101,114,115,32,79,110,0,0,0,0,0,0,0,0,66,70,71,32,67,101,108,108,115,47,83,104,111,116,0,0,73,68,75,70,65,32,65,114,109,111,114,32,67,108,97,115,115,0,0,0,0,0,0,0,69,49,77,49,58,32,72,97,110,103,97,114,0,0,0,0,100,111,111,109,47,100,111,111,109,50,32,118,49,46,57,0,73,68,75,70,65,32,65,114,109,111,114,0,0,0,0,0,73,68,70,65,32,65,114,109,111,114,32,67,108,97,115,115,0,0,0,0,0,0,0,0,73,68,70,65,32,65,114,109,111,114,0,0,0,0,0,0,71,111,100,32,77,111,100,101,32,72,101,97,108,116,104,0,77,101,103,97,115,112,104,101,114,101,32,72,101,97,108,116,104,0,0,0,0,0,0,0,83,111,117,108,115,112,104,101,114,101,32,72,101,97,108,116,104,0,0,0,0,0,0,0,67,111,109,101,32,104,101,114,101,33,0,0,0,0,0,0,77,97,120,32,83,111,117,108,115,112,104,101,114,101,0,0,117,115,101,95,102,117,108,108,115,99,114,101,101,110,0,0,65,77,77,79,0,0,0,0,66,108,117,101,32,65,114,109,111,114,32,67,108,97,115,115,0,0,0,0,0,0,0,0,90,79,79,77,32,79,85,84,0,0,0,0,0,0,0,0,115,97,119,102,117,108,0,0,77,95,73,110,105,116,58,32,73,110,105,116,32,109,105,115,99,101,108,108,97,110,101,111,117,115,32,105,110,102,111,46,10,0,0,0,0,0,0,0,82,101,100,44,32,89,101,108,108,111,119,44,32,66,108,117,101,0,0,0,0,0,0,0,71,114,101,101,110,32,65,114,109,111,114,32,67,108,97,115,115,0,0,0,0,0,0,0,77,97,120,32,65,114,109,111,114,0,0,0,0,0,0,0,91,77,101,115,115,97,103,101,32,117,110,115,101,110,116,93,0,0,0,0,0,0,0,0,77,97,120,32,72,101,97,108,116,104,0,0,0,0,0,0,73,110,105,116,105,97,108,32,66,117,108,108,101,116,115,0,73,110,105,116,105,97,108,32,72,101,97,108,116,104,0,0,73,110,118,97,108,105,100,32,109,105,115,99,32,105,116,101,109,32,115,116,114,105,110,103,32,105,110,100,101,120,32,102,111,114,32,39,37,115,39,10,0,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,118,97,108,117,101,32,102,111,114,32,39,77,111,110,115,116,101,114,115,32,73,110,102,105,103,104,116,39,58,32,37,105,0,0,0,0,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,77,105,115,99,32,105,116,101,109,32,39,37,115,39,10,0,0,0,0,0,0,67,104,101,99,107,105,110,103,32,116,101,120,116,32,97,114,101,97,32,116,104,114,111,117,103,104,32,115,116,114,105,110,103,115,32,102,111,114,32,39,37,46,49,50,115,37,115,39,32,102,114,111,109,61,37,100,32,116,111,61,37,100,10,0,115,99,114,101,101,110,95,104,101,105,103,104,116,0,0,0,67,76,73,80,0,0,0,0,67,104,97,110,103,105,110,103,32,110,97,109,101,32,111,102,32,109,117,115,105,99,32,102,114,111,109,32,37,115,32,116,111,32,37,42,115,10,0,0,90,79,79,77,32,73,78,0,115,97,119,105,100,108,0,0,68,69,72,65,67,75,69,68,0,0,0,0,0,0,0,0,67,97,114,100,44,32,83,107,117,108,108,0,0,0,0,0,67,104,97,110,103,105,110,103,32,110,97,109,101,32,111,102,32,115,102,120,32,102,114,111,109,32,37,115,32,116,111,32,37,42,115,10,0,0,0,0,87,97,114,110,105,110,103,58,32,77,105,115,109,97,116,99,104,101,100,32,108,101,110,103,116,104,115,32,102,114,111,109,61,37,100,44,32,116,111,61,37,100,44,32,117,115,101,100,32,37,100,10,0,0,0,0,103,97,109,101,32,115,97,118,101,100,46,0,0,0,0,0,67,104,97,110,103,105,110,103,32,110,97,109,101,32,111,102,32,115,112,114,105,116,101,32,97,116,32,105,110,100,101,120,32,37,100,32,102,114,111,109,32,37,115,32,116,111,32,37,42,115,10,0,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,84,101,120,116,32,40,107,101,121,61,37,115,44,32,102,114,111,109,61,37,100,44,32,116,111,61,37,100,41,10,0,0,0,0,0,0,0,37,115,32,37,105,32,37,105,0,0,0,0,0,0,0,0,83,107,105,112,112,101,100,32,116,101,120,116,32,98,108,111,99,107,32,98,101,99,97,117,115,101,32,111,102,32,110,111,116,101,120,116,32,100,105,114,101,99,116,105,118,101,10,0,73,110,118,97,108,105,100,32,115,116,114,105,110,103,32,107,101,121,32,39,37,115,39,44,32,115,117,98,115,116,105,116,117,116,105,111,110,32,115,107,105,112,112,101,100,46,10,0,42,32,105,110,99,114,101,97,115,101,100,32,98,117,102,102,101,114,32,102,114,111,109,32,116,111,32,37,100,32,102,111,114,32,98,117,102,102,101,114,32,115,105,122,101,32,37,100,10,0,0,0,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,101,120,116,101,110,100,101,100,32,115,116,114,105,110,103,32,115,117,98,115,116,105,116,117,116,105,111,110,10,0,0,0,0,0,0,0,0,115,99,114,101,101,110,95,119,105,100,116,104,0,0,0,0,80,86,73,83,0,0,0,0,67,104,97,110,103,101,100,32,112,97,114,32,116,105,109,101,32,102,111,114,32,69,37,100,77,37,100,32,102,114,111,109,32,37,100,32,116,111,32,37,100,10,0,0,0,0,0,0,70,79,76,76,79,87,0,0,115,97,119,117,112,0,0,0,45,110,111,100,101,104,0,0,75,101,121,32,82,101,109,111,118,101,100,0,0,0,0,0,73,110,118,97,108,105,100,32,69,120,77,120,32,118,97,108,117,101,115,32,69,37,100,77,37,100,10,0,0,0,0,0,67,104,97,110,103,101,100,32,112,97,114,32,116,105,109,101,32,102,111,114,32,77,65,80,37,48,50,100,32,102,114,111,109,32,37,100,32,116,111,32,37,100,10,0,0,0,0,0,89,111,117,32,110,101,101,100,32,97,108,108,32,115,105,120,32,107,101,121,115,32,116,111,32,111,112,101,110,32,116,104,105,115,32,100,111,111,114,0,73,110,118,97,108,105,100,32,77,65,80,110,110,32,118,97,108,117,101,32,77,65,80,37,100,10,0,0,0,0,0,0,73,110,118,97,108,105,100,32,112,97,114,32,116,105,109,101,32,115,101,116,116,105,110,103,32,115,116,114,105,110,103,58,32,37,115,10,0,0,0,0,112,97,114,32,37,105,32,37,105,0,0,0,0,0,0,0,112,97,114,32,37,105,32,37,105,32,37,105,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,80,97,114,32,118,97,108,117,101,32,97,116,32,105,110,100,101,120,32,37,100,58,32,37,115,10,0,0,0,37,115,32,37,105,0,0,0,65,95,78,85,76,76,0,0,56,0,0,0,0,0,0,0,80,77,65,80,0,0,0,0,65,95,76,105,110,101,69,102,102,101,99,116,0,0,0,0,70,73,82,69,0,0,0,0,98,102,103,0,0,0,0,0,10,0,0,0,0,0,0,0,75,101,121,32,65,100,100,101,100,0,0,0,0,0,0,0,65,95,82,97,110,100,111,109,74,117,109,112,0,0,0,0,65,95,80,108,97,121,83,111,117,110,100,0,0,0,0,0,89,111,117,32,110,101,101,100,32,97,108,108,32,116,104,114,101,101,32,107,101,121,115,32,116,111,32,111,112,101,110,32,116,104,105,115,32,100,111,111,114,0,0,0,0,0,0,0,65,95,83,99,114,97,116,99,104,0,0,0,0,0,0,0,65,95,70,97,99,101,0,0,65,95,84,117,114,110,0,0,65,95,83,112,97,119,110,0,65,95,68,105,101,0,0,0,65,95,77,117,115,104,114,111,111,109,0,0,0,0,0,0,65,95,68,101,116,111,110,97,116,101,0,0,0,0,0,0,118,105,100,101,111,109,111,100,101,0,0,0,0,0,0,0,83,85,73,84,0,0,0,0,65,95,66,114,97,105,110,69,120,112,108,111,100,101,0,0,66,69,83,84,0,0,0,0,112,108,97,115,109,97,0,0,87,95,73,110,105,116,58,32,73,110,105,116,32,87,65,68,102,105,108,101,115,46,10,0,87,101,97,112,111,110,32,110,117,109,98,101,114,32,49,45,56,0,0,0,0,0,0,0,65,95,83,112,97,119,110,70,108,121,0,0,0,0,0,0,65,95,83,112,97,119,110,83,111,117,110,100,0,0,0,0,65,110,121,32,107,101,121,32,119,105,108,108,32,111,112,101,110,32,116,104,105,115,32,100,111,111,114,0,0,0,0,0,65,95,66,114,97,105,110,83,112,105,116,0,0,0,0,0,65,95,66,114,97,105,110,65,119,97,107,101,0,0,0,0,65,95,66,114,97,105,110,68,105,101,0,0,0,0,0,0,65,95,66,114,97,105,110,83,99,114,101,97,109,0,0,0,65,95,66,114,97,105,110,80,97,105,110,0,0,0,0,0,65,95,75,101,101,110,68,105,101,0,0,0,0,0,0,0,65,95,80,97,105,110,68,105,101,0,0,0,0,0,0,0,86,105,100,101,111,32,115,101,116,116,105,110,103,115,0,0,77,69,71,65,0,0,0,0,65,95,80,97,105,110,65,116,116,97,99,107,0,0,0,0,83,83,71,0,0,0,0,0,100,98,108,111,97,100,0,0,68,95,73,110,105,116,78,101,116,71,97,109,101,58,32,67,104,101,99,107,105,110,103,32,102,111,114,32,110,101,116,119,111,114,107,32,103,97,109,101,46,10,0,0,0,0,0,0,87,101,97,112,111,110,32,110,117,109,98,101,114,32,49,45,57,0,0,0,0,0,0,0,65,95,67,121,98,101,114,65,116,116,97,99,107,0,0,0,65,95,72,111,111,102,0,0,89,111,117,32,110,101,101,100,32,97,32,121,101,108,108,111,119,32,115,107,117,108,108,32,116,111,32,111,112,101,110,32,116,104,105,115,32,100,111,111,114,0,0,0,0,0,0,0,72,79,77,69,0,0,0,0,114,105,103,104,116,118,111,108,32,111,117,116,32,111,102,32,98,111,117,110,100,115,0,0,65,95,66,115,112,105,65,116,116,97,99,107,0,0,0,0,32,0,0,0,0,0,0,0,27,91,37,99,109,0,0,0,65,95,66,97,98,121,77,101,116,97,108,0,0,0,0,0,114,95,112,97,116,99,104,46,99,0,0,0,0,0,0,0,37,100,0,0,0,0,0,0,65,95,83,112,105,100,82,101,102,105,114,101,0,0,0,0,65,95,77,101,116,97,108,0,70,114,97,109,101,32,114,97,116,101,32,37,100,32,102,112,115,10,87,97,108,108,115,32,37,100,44,32,70,108,97,116,115,32,37,100,44,32,83,112,114,105,116,101,115,32,37,100,0,0,0,0,0,0,0,0,65,95,83,107,117,108,108,65,116,116,97,99,107,0,0,0,65,95,66,114,117,105,115,65,116,116,97,99,107,0,0,0,98,114,100,114,95,114,0,0,87,73,83,80,76,65,84,0,65,95,72,101,97,100,65,116,116,97,99,107,0,0,0,0,103,111,32,97,104,101,97,100,32,97,110,100,32,108,101,97,118,101,46,32,115,101,101,32,105,102,32,105,32,99,97,114,101,46,0,0,0,0,0,0,67,95,83,84,65,82,84,0,115,110,100,95,99,104,97,110,110,101,108,115,0,0,0,0,80,73,78,83,0,0,0,0,65,95,83,97,114,103,65,116,116,97,99,107,0,0,0,0,119,98,0,0,0,0,0,0,67,72,65,73,78,83,65,87,0,0,0,0,0,0,0,0,100,98,99,108,115,0,0,0,45,102,102,109,97,112,0,0,87,101,97,112,111,110,32,82,101,109,111,118,101,100,0,0,65,95,84,114,111,111,112,65,116,116,97,99,107,0,0,0,65,95,67,80,111,115,82,101,102,105,114,101,0,0,0,0,89,111,117,32,110,101,101,100,32,97,32,114,101,100,32,115,107,117,108,108,32,116,111,32,111,112,101,110,32,116,104,105,115,32,100,111,111,114,0,0,65,95,67,80,111,115,65,116,116,97,99,107,0,0,0,0,67,82,66,82,73,67,75,0,69,110,100,105,97,110,110,101,115,115,46,46,46,0,0,0,65,95,66,111,115,115,68,101,97,116,104,0,0,0,0,0,83,84,70,66,48,0,0,0,65,95,70,97,116,65,116,116,97,99,107,51,0,0,0,0,65,95,70,97,116,65,116,116,97,99,107,50,0,0,0,0,65,95,70,97,116,65,116,116,97,99,107,49,0,0,0,0,65,95,70,97,116,82,97,105,115,101,0,0,0,0,0,0,100,101,109,111,95,105,110,115,117,114,97,110,99,101,0,0,65,95,83,107,101,108,77,105,115,115,105,108,101,0,0,0,109,117,115,95,112,97,117,115,101,95,111,112,116,0,0,0,80,83,84,82,0,0,0,0,65,95,83,107,101,108,70,105,115,116,0,0,0,0,0,0,66,70,71,0,0,0,0,0,67,72,71,71,0,0,0,0,100,98,111,112,110,0,0,0,80,108,97,121,105,110,103,32,100,101,109,111,32,37,115,10,0,0,0,0,0,0,0,0,87,101,97,112,111,110,32,65,100,100,101,100,0,0,0,0,65,95,83,107,101,108,87,104,111,111,115,104,0,0,0,0,65,95,84,114,97,99,101,114,0,0,0,0,0,0,0,0,89,111,117,32,110,101,101,100,32,97,32,98,108,117,101,32,115,107,117,108,108,32,116,111,32,111,112,101,110,32,116,104,105,115,32,100,111,111,114,0,65,95,70,105,114,101,67,114,97,99,107,108,101,0,0,0,65,95,70,105,114,101,0,0,65,95,83,116,97,114,116,70,105,114,101,0,0,0,0,0,121,111,117,32,99,97,110,39,116,32,115,116,97,114,116,32,97,32,110,101,119,32,103,97,109,101,10,119,104,105,108,101,32,114,101,99,111,114,100,105,110,103,32,97,32,100,101,109,111,33,10,10,112,114,101,115,115,32,97,32,107,101,121,46,0,0,0,0,0,0,0,0,65,95,86,105,108,101,65,116,116,97,99,107,0,0,0,0,65,95,86,105,108,101,84,97,114,103,101,116,0,0,0,0,101,49,109,56,0,0,0,0,65,95,86,105,108,101,83,116,97,114,116,0,0,0,0,0,102,114,101,101,100,111,111,109,46,119,97,100,0,0,0,0,65,95,86,105,108,101,67,104,97,115,101,0,0,0,0,0,109,117,115,105,99,95,118,111,108,117,109,101,0,0,0,0,80,73,78,86,0,0,0,0,80,95,83,101,116,117,112,76,101,118,101,108,58,32,109,105,115,115,105,110,103,32,112,108,97,121,101,114,32,37,100,32,115,116,97,114,116,10,0,0,65,95,83,80,111,115,65,116,116,97,99,107,0,0,0,0,80,76,65,83,77,65,0,0,100,115,104,116,103,110,0,0,46,108,109,112,0,0,0,0,65,109,109,111,32,49,45,52,44,32,66,97,99,107,112,97,99,107,0,0,0,0,0,0,65,109,109,111,32,38,32,75,101,121,115,0,0,0,0,0,65,95,83,99,114,101,97,109,0,0,0,0,0,0,0,0,113,117,105,99,107,115,97,118,101,32,111,118,101,114,32,121,111,117,114,32,103,97,109,101,32,110,97,109,101,100,10,10,39,37,115,39,63,10,10,112,114,101,115,115,32,121,32,111,114,32,110,46,0,0,0,0,65,95,80,111,115,65,116,116,97,99,107,0,0,0,0,0,89,111,117,32,110,101,101,100,32,97,32,121,101,108,108,111,119,32,99,97,114,100,32,116,111,32,111,112,101,110,32,116,104,105,115,32,100,111,111,114,0,0,0,0,0,0,0,0,65,95,70,97,99,101,84,97,114,103,101,116,0,0,0,0,65,95,67,104,97,115,101,0,65,95,76,111,111,107,0,0,65,95,88,83,99,114,101,97,109,0,0,0,0,0,0,0,65,95,70,97,108,108,0,0,65,95,80,108,97,121,101,114,83,99,114,101,97,109,0,0,65,95,80,97,105,110,0,0,115,102,120,95,118,111,108,117,109,101,0,0,0,0,0,0,83,79,85,76,0,0,0,0,65,95,69,120,112,108,111,100,101,0,0,0,0,0,0,0,82,79,67,75,69,84,0,0,115,103,99,111,99,107,0,0,45,116,105,109,101,100,101,109,111,0,0,0,0,0,0,0,65,109,109,111,32,82,101,109,111,118,101,100,0,0,0,0,65,95,66,70,71,83,112,114,97,121,0,0,0,0,0,0,65,95,70,105,114,101,66,70,71,0,0,0,0,0,0,0,89,111,117,32,110,101,101,100,32,97,32,114,101,100,32,99,97,114,100,32,116,111,32,111,112,101,110,32,116,104,105,115,32,100,111,111,114,0,0,0,100,111,111,109,32,118,49,46,54,54,54,0,0,0,0,0,65,95,66,70,71,115,111,117,110,100,0,0,0,0,0,0,65,95,70,105,114,101,80,108,97,115,109,97,0,0,0,0,65,95,83,97,119,0,0,0,65,95,70,105,114,101,77,105,115,115,105,108,101,0,0,0,65,95,71,117,110,70,108,97,115,104,0,0,0,0,0,0,65,95,70,105,114,101,67,71,117,110,0,0,0,0,0,0,78,101,120,116,32,116,105,109,101,44,32,115,99,117,109,98,97,103,46,46,46,0,0,0,65,95,67,108,111,115,101,83,104,111,116,103,117,110,50,0,115,97,109,112,108,101,114,97,116,101,0,0,0,0,0,0,77,69,68,73,0,0,0,0,65,95,76,111,97,100,83,104,111,116,103,117,110,50,0,0,67,72,65,73,78,71,85,78,0,0,0,0,0,0,0,0,115,104,111,116,103,110,0,0,45,102,97,115,116,100,101,109,111,0,0,0,0,0,0,0,65,109,109,111,32,65,100,100,101,100,0,0,0,0,0,0,65,95,79,112,101,110,83,104,111,116,103,117,110,50,0,0,65,95,67,104,101,99,107,82,101,108,111,97,100,0,0,0,89,111,117,32,110,101,101,100,32,97,32,98,108,117,101,32,99,97,114,100,32,116,111,32,111,112,101,110,32,116,104,105,115,32,100,111,111,114,0,0,65,95,70,105,114,101,83,104,111,116,103,117,110,50,0,0,65,95,76,105,103,104,116,50,0,0,0,0,0,0,0,0,65,95,70,105,114,101,83,104,111,116,103,117,110,0,0,0,65,95,76,105,103,104,116,49,0,0,0,0,0,0,0,0,65,95,70,105,114,101,80,105,115,116,111,108,0,0,0,0,65,95,82,101,70,105,114,101,0,0,0,0,0,0,0,0,65,95,80,117,110,99,104,0,112,105,116,99,104,101,100,95,115,111,117,110,100,115,0,0,83,84,73,77,0,0,0,0,65,95,82,97,105,115,101,0,83,72,79,84,71,85,78,0,112,105,115,116,111,108,0,0,45,112,108,97,121,100,101,109,111,0,0,0,0,0,0,0,66,97,99,107,112,97,99,107,32,82,101,109,111,118,101,100,0,0,0,0,0,0,0,0,65,95,76,111,119,101,114,0,65,95,87,101,97,112,111,110,82,101,97,100,121,0,0,0,89,111,117,32,110,101,101,100,32,97,32,121,101,108,108,111,119,32,107,101,121,32,116,111,32,111,112,101,110,32,116,104,105,115,32,100,111,111,114,0,65,95,76,105,103,104,116,48,0,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,102,114,97,109,101,32,112,111,105,110,116,101,114,32,109,110,101,109,111,110,105,99,32,39,37,115,39,32,97,116,32,37,100,10,0,0,0,0,0,0,32,45,32,97,112,112,108,105,101,100,32,37,115,32,102,114,111,109,32,99,111,100,101,112,116,114,91,37,100,93,32,116,111,32,115,116,97,116,101,115,91,37,100,93,10,0,0,0,65,95,0,0,0,0,0,0,66,97,100,32,112,111,105,110,116,101,114,32,110,117,109,98,101,114,32,37,100,32,111,102,32,37,100,10,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,112,111,105,110,116,101,114,32,97,116,32,105,110,100,101,120,32,37,100,58,32,37,115,10,0,0,0,0,0,73,110,118,97,108,105,100,32,66,69,88,32,99,111,100,101,112,111,105,110,116,101,114,32,108,105,110,101,32,45,32,109,117,115,116,32,115,116,97,114,116,32,119,105,116,104,32,39,70,82,65,77,69,39,58,32,39,37,115,39,10,0,0,0,109,117,115,105,99,95,99,97,114,100,0,0,0,0,0,0,89,83,75,85,0,0,0,0,70,82,65,77,69,0,0,0,80,73,83,84,79,76,0,0,110,111,110,101,0,0,0,0,45,102,105,108,101,0,0,0,66,97,99,107,112,97,99,107,32,65,100,100,101,100,0,0,37,115,32,37,105,32,61,32,37,115,0,0,0,0,0,0,116,121,112,101,0,0,0,0,89,111,117,32,110,101,101,100,32,97,32,114,101,100,32,107,101,121,32,116,111,32,111,112,101,110,32,116,104,105,115,32,100,111,111,114,0,0,0,0,118,97,108,117,101,32,105,115,32,37,105,0,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,72,101,108,112,101,114,32,84,104,105,110,103,32,105,116,101,109,32,39,37,115,39,10,0,0,0,0,0,0,83,117,98,115,116,105,116,117,116,105,110,103,32,39,37,115,39,32,102,111,114,32,115,112,114,105,116,101,32,39,37,115,39,10,0,0,0,0,0,0,66,97,100,32,108,101,110,103,116,104,32,102,111,114,32,115,112,114,105,116,101,32,110,97,109,101,32,39,37,115,39,10,0,0,0,0,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,115,112,114,105,116,101,32,110,97,109,101,32,115,117,98,115,116,105,116,117,116,105,111,110,10,0,0,0,0,83,117,98,115,116,105,116,117,116,105,110,103,32,39,37,115,39,32,102,111,114,32,115,111,117,110,100,32,39,37,115,39,10,0,0,0,0,0,0,0,66,97,100,32,108,101,110,103,116,104,32,102,111,114,32,115,111,117,110,100,32,110,97,109,101,32,39,37,115,39,10,0,115,111,117,110,100,95,99,97,114,100,0,0,0,0,0,0,82,83,75,85,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,115,111,117,110,100,32,110,97,109,101,32,115,117,98,115,116,105,116,117,116,105,111,110,10,0,0,0,0,0,70,73,83,84,0,0,0,0,100,109,50,105,110,116,0,0,68,95,68,111,111,109,77,97,105,110,83,101,116,117,112,58,32,67,97,110,110,111,116,32,102,105,110,100,32,46,100,101,104,32,111,114,32,46,98,101,120,32,102,105,108,101,32,110,97,109,101,100,32,37,115,0,83,109,97,114,116,32,77,111,110,115,116,101,114,115,32,68,105,115,97,98,108,101,100,0,83,117,98,115,116,105,116,117,116,105,110,103,32,39,37,115,39,32,102,111,114,32,109,117,115,105,99,32,39,37,115,39,10,0,0,0,0,0,0,0,66,97,100,32,108,101,110,103,116,104,32,102,111,114,32,109,117,115,105,99,32,110,97,109,101,32,39,37,115,39,10,0,89,111,117,32,110,101,101,100,32,97,32,98,108,117,101,32,107,101,121,32,116,111,32,111,112,101,110,32,116,104,105,115,32,100,111,111,114,0,0,0,66,97,100,32,100,97,116,97,32,112,97,105,114,32,105,110,32,39,37,115,39,10,0,0,80,114,111,99,101,115,115,105,110,103,32,109,117,115,105,99,32,110,97,109,101,32,115,117,98,115,116,105,116,117,116,105,111,110,10,0,0,0,0,0,85,110,109,97,116,99,104,101,100,32,66,108,111,99,107,58,32,39,37,115,39,10,0,0,91,77,85,83,73,67,93,0,91,83,79,85,78,68,83,93,0,0,0,0,0,0,0,0,91,83,80,82,73,84,69,83,93,0,0,0,0,0,0,0,91,72,69,76,80,69,82,93,0,0,0,0,0,0,0,0,83,111,117,110,100,32,115,101,116,116,105,110,103,115,0,0,66,83,75,85,0,0,0,0,91,67,79,68,69,80,84,82,93,0,0,0,0,0,0,0,87,69,65,80,79,78,83,0,89,111,117,32,110,101,101,100,32,97,32,121,101,108,108,111,119,32,107,101,121,32,116,111,32,97,99,116,105,118,97,116,101,32,116,104,105,115,32,111,98,106,101,99,116,0,0,0,100,109,50,116,116,108,0,0,46,100,101,104,0,0,0,0,83,109,97,114,116,32,77,111,110,115,116,101,114,115,32,69,110,97,98,108,101,100,0,0,91,80,65,82,83,93,0,0,91,83,84,82,73,78,71,83,93,0,0,0,0,0,0,0,87,97,114,110,105,110,103,58,32,83,116,97,116,101,32,67,121,99,108,101,32,68,101,116,101,99,116,101,100,0,0,0,84,101,120,116,0,0,0,0,77,105,115,99,0,0,0,0,67,104,101,97,116,0,0,0,83,112,114,105,116,101,0,0,87,101,97,112,111,110,0,0,65,109,109,111,0,0,0,0,83,111,117,110,100,0,0,0,99,111,109,112,95,109,97,115,107,101,100,97,110,105,109,0,89,75,69,89,0,0,0,0,80,111,105,110,116,101,114,0,60,45,32,80,82,69,86,0,89,111,117,32,110,101,101,100,32,97,32,114,101,100,32,107,101,121,32,116,111,32,97,99,116,105,118,97,116,101,32,116,104,105,115,32,111,98,106,101,99,116,0,0,0,0,0,0,114,101,97,100,95,109,0,0,45,100,101,104,0,0,0,0,80,105,116,99,104,32,69,102,102,101,99,116,115,32,68,105,115,97,98,108,101,100,0,0,70,114,97,109,101,0,0,0,84,104,105,110,103,0,0,0,83,75,89,52,0,0,0,0,73,95,70,105,108,101,108,101,110,103,116,104,58,32,37,115,0,0,0,0,0,0,0,0,73,95,73,110,105,116,83,111,117,110,100,58,32,115,111,117,110,100,32,109,111,100,117,108,101,32,114,101,97,100,121,10,0,0,0,0,0,0,0,0,83,65,86,69,71,65,77,69,78,65,77,69,0,0,0,0,112,114,98,111,111,109,0,0,27,91,51,57,109,27,91,52,57,109,10,0,0,0,0,0,83,84,65,82,84,85,80,53,0,0,0,0,0,0,0,0,82,95,85,110,108,111,99,107,84,101,120,116,117,114,101,67,111,109,112,111,115,105,116,101,80,97,116,99,104,78,117,109,58,32,69,120,99,101,115,115,32,117,110,108,111,99,107,115,32,111,110,32,37,56,115,32,40,37,100,45,37,100,41,10,0,0,0,0,0,0,0,0,37,54,100,44,32,0,0,0,83,84,65,82,84,85,80,52,0,0,0,0,0,0,0,0,83,84,65,82,84,85,80,51,0,0,0,0,0,0,0,0,82,95,73,110,105,116,80,97,116,99,104,101,115,32,0,0,83,84,65,82,84,85,80,50,0,0,0,0,0,0,0,0,69,78,68,37,105,0,0,0,83,84,65,82,84,85,80,49,0,0,0,0,0,0,0,0,98,114,100,114,95,108,0,0,87,73,85,82,72,49,0,0,66,71,67,65,83,84,67,65,76,76,0,0,0,0,0,0,121,97,32,107,110,111,119,44,32,110,101,120,116,32,116,105,109,101,32,121,111,117,32,99,111,109,101,32,105,110,32,104,101,114,101,10,105,39,109,32,103,111,110,110,97,32,116,111,97,115,116,32,121,97,46,0,70,95,69,78,68,0,0,0,99,111,109,112,95,115,111,117,108,0,0,0,0,0,0,0,82,75,69,89,0,0,0,0,66,71,70,76,65,84,51,49,0,0,0,0,0,0,0,0,46,0,0,0,0,0,0,0,81,85,73,84,0,0,0,0,89,111,117,32,110,101,101,100,32,97,32,98,108,117,101,32,107,101,121,32,116,111,32,97,99,116,105,118,97,116,101,32,116,104,105,115,32,111,98,106,101,99,116,0,0,0,0,0,117,108,116,105,109,97,0,0,70,97,105,108,101,100,32,116,111,32,97,117,116,111,108,111,97,100,32,37,115,10,0,0,80,105,116,99,104,32,69,102,102,101,99,116,115,32,69,110,97,98,108,101,100,0,0,0,66,71,70,76,65,84,49,53,0,0,0,0,0,0,0,0,66,71,70,76,65,84,51,48,0,0,0,0,0,0,0,0,83,75,89,50,0,0,0,0,66,71,70,76,65,84,50,48,0,0,0,0,0,0,0,0,86,95,68,114,97,119,77,101,109,80,97,116,99,104,56,58,32,80,97,116,99,104,32,40,37,100,44,37,100,41,45,40,37,100,44,37,100,41,32,101,120,99,101,101,100,115,32,76,70,66,32,105,110,32,118,101,114,116,105,99,97,108,32,100,105,114,101,99,116,105,111,110,32,40,104,111,114,105,122,111,110,116,97,108,32,105,115,32,99,108,105,112,112,101,100,41,10,66,97,100,32,86,95,68,114,97,119,77,101,109,80,97,116,99,104,56,32,40,102,108,97,103,115,61,37,117,41,0,82,95,76,111,97,100,84,114,105,103,84,97,98,108,101,115,58,32,73,110,118,97,108,105,100,32,84,65,78,84,79,65,78,71,0,0,0,0,0,0,66,71,70,76,65,84,49,49,0,0,0,0,0,0,0,0,83,84,71,78,85,77,37,100,0,0,0,0,0,0,0,0,66,71,70,76,65,84,48,54,0,0,0,0,0,0,0,0,66,71,70,76,65,84,69,52,0,0,0,0,0,0,0,0,66,71,70,76,65,84,69,51,0,0,0,0,0,0,0,0,66,71,70,76,65,84,69,50,0,0,0,0,0,0,0,0,102,108,97,115,104,105,110,103,95,104,111,109,0,0,0,0,66,71,70,76,65,84,69,49,0,0,0,0,0,0,0,0,99,111,109,112,95,54,54,54,0,0,0,0,0,0,0,0,66,75,69,89,0,0,0,0,67,67,95,72,69,82,79,0,69,78,68,32,71,65,77,69,0,0,0,0,0,0,0,0,83,72,84,50,0,0,0,0,89,111,117,32,103,111,116,32,116,104,101,32,115,117,112,101,114,32,115,104,111,116,103,117,110,33,0,0,0,0,0,0,101,118,105,108,0,0,0,0,46,98,101,120,0,0,0,0,45,100,101,104,0,0,0,0,67,67,95,67,89,66,69,82,0,0,0,0,0,0,0,0,67,67,95,83,80,73,68,69,82,0,0,0,0,0,0,0,83,75,89,49,0,0,0,0,67,67,95,65,82,67,72,0,67,67,95,77,65,78,67,85,0,0,0,0,0,0,0,0,67,67,95,82,69,86,69,78,0,0,0,0,0,0,0,0,77,95,83,75,73,76,76,0,67,67,95,80,65,73,78,0,67,67,95,65,82,65,67,72,0,0,0,0,0,0,0,0,101,49,109,55,0,0,0,0,67,67,95,66,65,82,79,78,0,0,0,0,0,0,0,0,100,111,111,109,117,46,119,97,100,0,0,0,0,0,0,0,67,67,95,72,69,76,76,0,99,111,109,112,95,115,111,117,110,100,0,0,0,0,0,0,66,79,78,50,0,0,0,0,45,102,111,114,99,101,95,114,101,109,111,118,101,95,115,108,105,109,101,95,116,114,97,105,108,115,0,0,0,0,0,0,67,67,95,67,65,67,79,0,81,85,73,67,75,76,79,65,68,0,0,0,0,0,0,0,89,111,117,32,103,111,116,32,116,104,101,32,115,104,111,116,103,117,110,33,0,0,0,0,111,112,101,110,105,110,0,0,45,110,111,108,111,97,100,0,116,110,116,112,117,115,104,0,105,100,107,102,97,0,0,0,67,67,95,76,79,83,84,0])
.concat([121,111,117,32,99,97,110,39,116,32,115,97,118,101,32,105,102,32,121,111,117,32,97,114,101,110,39,116,32,112,108,97,121,105,110,103,33,10,10,112,114,101,115,115,32,97,32,107,101,121,46,0,0,0,0,0,67,67,95,68,69,77,79,78,0,0,0,0,0,0,0,0,83,75,89,51,0,0,0,0,67,67,95,73,77,80,0,0,67,67,95,72,69,65,86,89,0,0,0,0,0,0,0,0,67,67,95,83,72,79,84,71,85,78,0,0,0,0,0,0,67,67,95,90,79,77,66,73,69,0,0,0,0,0,0,0,84,54,84,69,88,84,0,0,84,53,84,69,88,84,0,0,84,52,84,69,88,84,0,0,99,111,109,112,95,109,111,118,101,98,108,111,99,107,0,0,66,79,78,49,0,0,0,0,84,51,84,69,88,84,0,0,81,85,73,67,75,83,65,86,69,0,0,0,0,0,0,0,89,111,117,32,103,111,116,32,116,104,101,32,112,108,97,115,109,97,32,103,117,110,33,0,115,104,97,119,110,51,0,0,86,95,73,110,105,116,58,32,97,108,108,111,99,97,116,101,32,115,99,114,101,101,110,115,46,10,0,0,0,0,0,0,116,110,116,105,99,101,0,0,84,50,84,69,88,84,0,0,84,49,84,69,88,84,0,0,70,95,83,75,89,49,0,0,100,111,111,109,32,118,49,46,50,0,0,0,0,0,0,0,80,54,84,69,88,84,0,0,80,53,84,69,88,84,0,0,80,52,84,69,88,84,0,0,80,51,84,69,88,84,0,0,80,50,84,69,88,84,0,0,80,49,84,69,88,84,0,0,89,111,117,32,115,117,99,107,33,0,0,0,0,0,0,0,67,54,84,69,88,84,0,0,99,111,109,112,95,122,101,114,111,116,97,103,115,0,0,0,70,67,65,78,0,0,0,0,67,53,84,69,88,84,0,0,76,79,65,68,0,0,0,0,89,111,117,32,103,111,116,32,116,104,101,32,114,111,99,107,101,116,32,108,97,117,110,99,104,101,114,33,0,0,0,0,116,101,110,115,101,0,0,0,37,100,120,37,100,0,0,0,116,110,116,102,97,115,116,0,67,52,84,69,88,84,0,0,67,51,84,69,88,84,0,0,71,95,67,104,101,99,107,83,112,111,116,58,32,117,110,101,120,112,101,99,116,101,100,32,97,110,103,108,101,32,37,100,10,0,0,0,0,0,0,0,67,50,84,69,88,84,0,0,67,49,84,69,88,84,0,0,69,52,84,69,88,84,0,0,69,51,84,69,88,84,0,0,69,50,84,69,88,84,0,0,69,49,84,69,88,84,0,0,83,84,83,84,82,95,67,79,77,80,79,70,70,0,0,0,99,111,109,112,95,109,111,100,101,108,0,0,0,0,0,0,66,69,88,80,0,0,0,0,83,84,83,84,82,95,67,79,77,80,79,78,0,0,0,0,83,65,86,69,0,0,0,0,65,32,99,104,97,105,110,115,97,119,33,32,32,70,105,110,100,32,115,111,109,101,32,109,101,97,116,33,0,0,0,0,114,111,109,101,114,50,0,0,45,103,101,111,109,101,116,114,121,0,0,0,0,0,0,0,116,110,116,97,109,111,0,0,83,84,83,84,82,95,67,76,69,86,0,0,0,0,0,0,83,84,83,84,82,95,67,72,79,80,80,69,82,83,0,0,80,114,66,111,111,109,32,37,100,0,0,0,0,0,0,0,83,84,83,84,82,95,66,69,72,79,76,68,88,0,0,0,83,84,83,84,82,95,66,69,72,79,76,68,0,0,0,0,83,84,83,84,82,95,78,67,79,70,70,0,0,0,0,0,83,84,83,84,82,95,78,67,79,78,0,0,0,0,0,0,83,84,83,84,82,95,70,65,65,68,68,69,68,0,0,0,83,84,83,84,82,95,75,70,65,65,68,68,69,68,0,0,83,84,83,84,82,95,68,81,68,79,70,70,0,0,0,0,99,111,109,112,95,102,108,111,111,114,115,0,0,0,0,0,66,65,82,49,0,0,0,0,83,84,83,84,82,95,68,81,68,79,78,0,0,0,0,0,71,65,77,69,0,0,0,0,89,111,117,32,103,111,116,32,116,104,101,32,99,104,97,105,110,103,117,110,33,0,0,0,109,101,115,115,103,50,0,0,45,103,101,111,109,0,0,0,116,110,116,114,97,110,0,0,83,84,83,84,82,95,78,79,77,85,83,0,0,0,0,0,83,84,83,84,82,95,77,85,83,0,0,0,0,0,0,0,69,37,100,77,37,100,0,0,65,77,83,84,82,95,77,65,82,75,83,67,76,69,65,82,69,68,0,0,0,0,0,0,65,77,83,84,82,95,77,65,82,75,69,68,83,80,79,84,0,0,0,0,0,0,0,0,65,77,83,84,82,95,71,82,73,68,79,70,70,0,0,0,65,77,83,84,82,95,71,82,73,68,79,78,0,0,0,0,65,77,83,84,82,95,70,79,76,76,79,87,79,70,70,0,65,77,83,84,82,95,70,79,76,76,79,87,79,78,0,0,72,85,83,84,82,95,80,76,82,82,69,68,0,0,0,0,99,111,109,112,95,115,107,121,109,97,112,0,0,0,0,0,65,82,77,50,0,0,0,0,72,85,83,84,82,95,80,76,82,66,82,79,87,78,0,0,83,67,82,69,69,78,83,72,79,84,0,0,0,0,0,0,89,111,117,32,103,111,116,32,116,104,101,32,66,70,71,57,48,48,48,33,32,32,79,104,44,32,121,101,115,46,0,0,97,100,114,105,97,110,0,0,45,110,111,119,105,110,100,111,119,0,0,0,0,0,0,0,116,110,116,112,105,116,99,104,0,0,0,0,0,0,0,0,72,85,83,84,82,95,80,76,82,73,78,68,73,71,79,0,72,85,83,84,82,95,80,76,82,71,82,69,69,78,0,0,109,97,112,37,48,50,100,0,72,85,83,84,82,95,77,69,83,83,65,71,69,83,69,78,84,0,0,0,0,0,0,0,72,85,83,84,82,95,84,65,76,75,84,79,83,69,76,70,53,0,0,0,0,0,0,0,72,85,83,84,82,95,84,65,76,75,84,79,83,69,76,70,52,0,0,0,0,0,0,0,72,85,83,84,82,95,84,65,76,75,84,79,83,69,76,70,51,0,0,0,0,0,0,0,72,85,83,84,82,95,84,65,76,75,84,79,83,69,76,70,50,0,0,0,0,0,0,0,72,85,83,84,82,95,84,65,76,75,84,79,83,69,76,70,49,0,0,0,0,0,0,0,72,85,83,84,82,95,67,72,65,84,77,65,67,82,79,48,0,0,0,0,0,0,0,0,99,111,109,112,95,103,111,100,0,0,0,0,0,0,0,0,65,82,77,49,0,0,0,0,72,85,83,84,82,95,67,72,65,84,77,65,67,82,79,57,0,0,0,0,0,0,0,0,83,77,65,76,76,69,82,32,86,73,69,87,0,0,0,0,116,104,101,100,97,51,0,0,80,105,99,107,101,100,32,117,112,32,97,32,98,97,99,107,112,97,99,107,32,102,117,108,108,32,111,102,32,97,109,109,111,33,0,0,0,0,0,0,45,119,105,110,100,111,119,0,116,110,116,115,109,97,114,116,0,0,0,0,0,0,0,0,72,85,83,84,82,95,67,72,65,84,77,65,67,82,79,56,0,0,0,0,0,0,0,0,72,85,83,84,82,95,67,72,65,84,77,65,67,82,79,55,0,0,0,0,0,0,0,0,71,97,109,101,32,115,97,118,101,32,102,97,105,108,101,100,33,0,0,0,0,0,0,0,91,77,101,115,115,97,103,101,32,117,110,115,101,110,116,93,0,0,0,0,0,0,0,0,72,85,83,84,82,95,67,72,65,84,77,65,67,82,79,54,0,0,0,0,0,0,0,0,72,85,83,84,82,95,67,72,65,84,77,65,67,82,79,53,0,0,0,0,0,0,0,0,72,85,83,84,82,95,67,72,65,84,77,65,67,82,79,52,0,0,0,0,0,0,0,0,72,85,83,84,82,95,67,72,65,84,77,65,67,82,79,51,0,0,0,0,0,0,0,0,72,85,83,84,82,95,67,72,65,84,77,65,67,82,79,50,0,0,0,0,0,0,0,0,72,85,83,84,82,95,67,72,65,84,77,65,67,82,79,49,0,0,0,0,0,0,0,0,84,72,85,83,84,82,95,51,50,0,0,0,0,0,0,0,99,111,109,112,95,100,111,111,114,108,105,103,104,116,0,0,66,79,83,70,0,0,0,0,84,72,85,83,84,82,95,51,49,0,0,0,0,0,0,0,76,65,82,71,69,82,32,86,73,69,87,0,0,0,0,0,97,109,112,105,101,0,0,0,80,105,99,107,101,100,32,117,112,32,97,32,98,111,120,32,111,102,32,115,104,111,116,103,117,110,32,115,104,101,108,108,115,46,0,0,0,0,0,0,45,110,111,102,117,108,108,115,99,114,101,101,110,0,0,0,116,110,116,116,114,97,110,0,84,72,85,83,84,82,95,51,48,0,0,0,0,0,0,0,84,72,85,83,84,82,95,50,57,0,0,0,0,0,0,0,37,115,0,0,0,0,0,0,89,111,117,39,118,101,32,108,111,115,116,32,105,116,46,46,46,0,0,0,0,0,0,0,69,79,70,0,0,0,0,0,32,99,111,110,102,105,103,117,114,101,100,32,97,117,100,105,111,32,100,101,118,105,99,101,32,119,105,116,104,32,37,100,32,115,97,109,112,108,101,115,47,115,108,105,99,101,10,0,84,72,85,83,84,82,95,50,56,0,0,0,0,0,0,0,73,95,73,110,105,116,71,114,97,112,104,105,99,115,58,32,37,100,120,37,100,10,0,0,27,41,75,14,0,0,0,0,84,72,85,83,84,82,95,50,55,0,0,0,0,0,0,0,82,95,67,97,99,104,101,84,101,120,116,117,114,101,67,111,109,112,111,115,105,116,101,80,97,116,99,104,78,117,109,58,32,72,105,103,104,32,108,111,99,107,32,111,110,32,37,56,115,32,40,37,100,41,10,0,10,0,0,0,0,0,0,0,84,72,85,83,84,82,95,50,54,0,0,0,0,0,0,0,84,72,85,83,84,82,95,50,53,0,0,0,0,0,0,0,82,95,73,110,105,116,84,114,97,110,115,108,97,116,105,111,110,115,84,97,98,108,101,115,32,0,0,0,0,0,0,0,84,72,85,83,84,82,95,50,52,0,0,0,0,0,0,0,69,78,68,48,0,0,0,0,84,72,85,83,84,82,95,50,51,0,0,0,0,0,0,0,98,114,100,114,95,98,0,0,87,73,85,82,72,48,0,0,84,72,85,83,84,82,95,50,50,0,0,0,0,0,0,0,100,111,110,39,116,32,108,101,97,118,101,32,121,101,116,32,45,45,32,116,104,101,114,101,39,115,32,97,10,100,101,109,111,110,32,97,114,111,117,110,100,32,116,104,97,116,32,99,111,114,110,101,114,33,0,0,70,95,83,84,65,82,84,0,99,111,109,112,95,98,108,97,122,105,110,103,0,0,0,0,66,66,82,78,0,0,0,0,84,72,85,83,84,82,95,50,49,0,0,0,0,0,0,0,84,114,97,110,109,97,112,32,98,117,105,108,100,32,91,32,32,32,32,32,32,32,32,93,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,83,80,89,0,0,0,0,0,100,100,116,98,108,51,0,0,80,105,99,107,101,100,32,117,112,32,52,32,115,104,111,116,103,117,110,32,115,104,101,108,108,115,46,0,0,0,0,0,45,102,117,108,108,115,99,114,101,101,110,0,0,0,0,0,116,110,116,97,109,109,111,0,84,72,85,83,84,82,95,50,48,0,0,0,0,0,0,0,84,72,85,83,84,82,95,49,57,0,0,0,0,0,0,0,103,95,103,97,109,101,46,99,0,0,0,0,0,0,0,0,89,111,117,32,115,116,97,114,116,32,116,111,32,114,97,118,101,0,0,0,0,0,0,0,84,72,85,83,84,82,95,49,56,0,0,0,0,0,0,0,86,95,73,110,105,116,77,111,100,101,58,32,117,115,105,110,103,32,51,50,32,98,105,116,32,118,105,100,101,111,32,109,111,100,101,10,0,0,0,0,84,65,78,84,79,65,78,71,0,0,0,0,0,0,0,0,84,72,85,83,84,82,95,49,55,0,0,0,0,0,0,0,83,84,65,82,77,83,0,0,84,72,85,83,84,82,95,49,54,0,0,0,0,0,0,0,84,72,85,83,84,82,95,49,53,0,0,0,0,0,0,0,84,72,85,83,84,82,95,49,52,0,0,0,0,0,0,0,84,72,85,83,84,82,95,49,51,0,0,0,0,0,0,0,109,97,120,95,112,108,97,121,101,114,95,99,111,114,112,115,101,0,0,0,0,0,0,0,84,72,85,83,84,82,95,49,50,0,0,0,0,0,0,0,99,111,109,112,95,115,107,117,108,108,0,0,0,0,0,0,75,69,69,78,0,0,0,0,84,72,85,83,84,82,95,49,49,0,0,0,0,0,0,0,71,65,77,77,65,32,70,73,88,0,0,0,0,0,0,0,83,72,84,70,0,0,0,0,99,111,117,110,116,50,0,0,80,105,99,107,101,100,32,117,112,32,97,110,32,101,110,101,114,103,121,32,99,101,108,108,32,112,97,99,107,46,0,0,45,104,101,105,103,104,116,0,45,102,114,97,103,115,0,0,116,110,116,119,101,97,112,0,84,72,85,83,84,82,95,49,48,0,0,0,0,0,0,0,84,72,85,83,84,82,95,57,0,0,0,0,0,0,0,0,45,100,111,103,115,0,0,0,89,111,117,32,115,99,97,114,101,32,121,111,117,114,115,101,108,102,0,0,0,0,0,0,84,72,85,83,84,82,95,56,0,0,0,0,0,0,0,0,84,72,85,83,84,82,95,55,0,0,0,0,0,0,0,0,84,72,85,83,84,82,95,54,0,0,0,0,0,0,0,0,77,95,78,69,87,71,0,0,84,72,85,83,84,82,95,53,0,0,0,0,0,0,0,0,84,72,85,83,84,82,95,52,0,0,0,0,0,0,0,0,101,49,109,54,0,0,0,0,84,72,85,83,84,82,95,51,0,0,0,0,0,0,0,0,84,72,85,83,84,82,95,50,0,0,0,0,0,0,0,0,100,111,111,109,49,46,119,97,100,0,0,0,0,0,0,0,100,95,37,115,0,0,0,0,99,111,109,112,95,112,97,105,110,0,0,0,0,0,0,0,83,83,87,86,0,0,0,0,80,95,83,101,116,117,112,76,101,118,101,108,58,32,37,115,58,32,72,101,120,101,110,32,102,111,114,109,97,116,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,84,72,85,83,84,82,95,49,0,0,0,0,0,0,0,0,77,69,83,83,65,71,69,83,0,0,0,0,0,0,0,0,109,101,115,115,97,103,0,0,80,105,99,107,101,100,32,117,112,32,97,110,32,101,110,101,114,103,121,32,99,101,108,108,46,0,0,0,0,0,0,0,45,119,105,100,116,104,0,0,116,110,116,107,97,0,0,0,71,111,100,32,109,111,100,101,0,0,0,0,0,0,0,0,80,72,85,83,84,82,95,51,50,0,0,0,0,0,0,0,121,111,117,32,104,97,118,101,110,39,116,32,112,105,99,107,101,100,32,97,32,113,117,105,99,107,115,97,118,101,32,115,108,111,116,32,121,101,116,33,10,10,112,114,101,115,115,32,97,32,107,101,121,46,0,0,80,72,85,83,84,82,95,51,49,0,0,0,0,0,0,0,45,100,111,103,0,0,0,0,87,104,111,39,115,32,116,104,101,114,101,63,0,0,0,0,80,72,85,83,84,82,95,51,48,0,0,0,0,0,0,0,80,72,85,83,84,82,95,50,57,0,0,0,0,0,0,0,80,72,85,83,84,82,95,50,56,0,0,0,0,0,0,0,80,72,85,83,84,82,95,50,55,0,0,0,0,0,0,0,80,72,85,83,84,82,95,50,54,0,0,0,0,0,0,0,80,72,85,83,84,82,95,50,53,0,0,0,0,0,0,0,80,72,85,83,84,82,95,50,52,0,0,0,0,0,0,0,99,111,109,112,95,118,105,108,101,0,0,0,0,0,0,0,80,65,73,78,0,0,0,0,80,72,85,83,84,82,95,50,51,0,0,0,0,0,0,0,72,85,68,0,0,0,0,0,115,104,97,119,110,50,0,0,80,105,99,107,101,100,32,117,112,32,97,32,98,111,120,32,111,102,32,114,111,99,107,101,116,115,46,0,0,0,0,0,45,118,105,101,119,97,110,103,108,101,0,0,0,0,0,0,116,110,116,107,101,121,98,115,0,0,0,0,0,0,0,0,80,72,85,83,84,82,95,50,50,0,0,0,0,0,0,0,80,72,85,83,84,82,95,50,49,0,0,0,0,0,0,0,71,95,82,101,97,100,68,101,109,111,72,101,97,100,101,114,58,32,119,114,111,110,103,32,100,101,109,111,32,104,101,97,100,101,114,10,0,0,0,0,70,73,78,73,83,72,69,68,58,32,69,37,100,77,37,100,10,0,0,0,0,0,0,0,89,111,117,32,109,117,109,98,108,101,32,116,111,32,121,111,117,114,115,101,108,102,0,0,80,72,85,83,84,82,95,50,48,0,0,0,0,0,0,0,97,114,101,32,121,111,117,32,115,117,114,101,32,121,111,117,32,119,97,110,116,32,116,111,10,113,117,105,116,32,116,104,105,115,32,103,114,101,97,116,32,103,97,109,101,63,0,0,80,72,85,83,84,82,95,49,57,0,0,0,0,0,0,0,80,72,85,83,84,82,95,49,56,0,0,0,0,0,0,0,80,72,85,83,84,82,95,49,55,0,0,0,0,0,0,0,80,72,85,83,84,82,95,49,54,0,0,0,0,0,0,0,80,72,85,83,84,82,95,49,53,0,0,0,0,0,0,0,80,72,85,83,84,82,95,49,52,0,0,0,0,0,0,0,72,101,108,112,33,0,0,0,99,111,109,112,95,112,117,114,115,117,105,116,0,0,0,0,67,89,66,82,0,0,0,0,80,72,85,83,84,82,95,49,51,0,0,0,0,0,0,0,86,79,76,85,77,69,0,0,114,111,109,101,114,111,0,0,80,105,99,107,101,100,32,117,112,32,97,32,114,111,99,107,101,116,46,0,0,0,0,0,45,110,111,98,108,105,116,0,116,110,116,107,101,121,121,115,0,0,0,0,0,0,0,0,80,72,85,83,84,82,95,49,50,0,0,0,0,0,0,0,80,72,85,83,84,82,95,49,49,0,0,0,0,0,0,0,71,95,68,111,80,108,97,121,68,101,109,111,58,32,112,108,97,121,105,110,103,32,100,101,109,111,32,119,105,116,104,32,37,115,32,99,111,109,112,97,116,105,98,105,108,105,116,121,10,0,0,0,0,0,0,0,83,84,83,32,27,54,75,32,27,51,37,100,32,27,54,77,32,27,51,37,100,32,27,55,73,32,27,51,37,100,47,37,100,32,27,53,83,32,27,51,37,100,47,37,100,0,0,0,80,72,85,83,84,82,95,49,48,0,0,0,0,0,0,0,80,72,85,83,84,82,95,57,0,0,0,0,0,0,0,0,80,72,85,83,84,82,95,56,0,0,0,0,0,0,0,0,80,72,85,83,84,82,95,55,0,0,0,0,0,0,0,0,80,72,85,83,84,82,95,54,0,0,0,0,0,0,0,0,80,72,85,83,84,82,95,53,0,0,0,0,0,0,0,0,80,72,85,83,84,82,95,52,0,0,0,0,0,0,0,0,99,111,109,112,95,100,111,111,114,115,116,117,99,107,0,0,65,80,66,88,0,0,0,0,80,72,85,83,84,82,95,51,0,0,0,0,0,0,0,0,65,85,84,79,77,65,80,0,115,116,108,107,115,51,0,0,80,105,99,107,101,100,32,117,112,32,97,32,98,111,120,32,111,102,32,98,117,108,108,101,116,115,46,0,0,0,0,0,45,110,111,100,114,97,119,0,116,110,116,107,101,121,114,115,0,0,0,0,0,0,0,0,80,72,85,83,84,82,95,50,0,0,0,0,0,0,0,0,80,72,85,83,84,82,95,49,0,0,0,0,0,0,0,0,71,95,82,101,97,100,68,101,109,111,72,101,97,100,101,114,58,32,85,110,107,110,111,119,110,32,100,101,109,111,32,102,111,114,109,97,116,32,37,100,46,0,0,0,0,0,0,0,37,53,100,0,0,0,0,0,72,85,83,84,82,95,51,50,0,0,0,0,0,0,0,0,72,85,83,84,82,95,51,49,0,0,0,0,0,0,0,0,72,85,83,84,82,95,51,48,0,0,0,0,0,0,0,0,72,85,83,84,82,95,50,57,0,0,0,0,0,0,0,0,72,85,83,84,82,95,50,56,0,0,0,0,0,0,0,0,72,85,83,84,82,95,50,55,0,0,0,0,0,0,0,0,72,85,83,84,82,95,50,54,0,0,0,0,0,0,0,0,99,111,109,112,95,115,116,97,121,108,105,102,116,0,0,0,65,80,76,83,0,0,0,0,72,85,83,84,82,95,50,53,0,0,0,0,0,0,0,0,80,65,85,83,69,0,0,0,100,101,97,100,50,0,0,0,80,105,99,107,101,100,32,117,112,32,97,32,99,108,105,112,46,0,0,0,0,0,0,0,45,110,111,115,102,120,0,0,116,110,116,107,101,121,98,99,0,0,0,0,0,0,0,0,72,85,83,84,82,95,50,52,0,0,0,0,0,0,0,0,72,85,83,84,82,95,50,51,0,0,0,0,0,0,0,0,84,105,109,101,100,32,37,117,32,103,97,109,101,116,105,99,115,32,105,110,32,37,117,32,114,101,97,108,116,105,99,115,32,61,32,37,45,46,49,102,32,102,114,97,109,101,115,32,112,101,114,32,115,101,99,111,110,100,0,0,0,0,0,0,37,51,100,0,0,0,0,0,72,85,83,84,82,95,50,50,0,0,0,0,0,0,0,0,85,110,107,110,111,119,110,32,84,104,105,110,103,32,116,121,112,101,32,37,105,32,97,116,32,40,37,105,44,32,37,105,41,0,0,0,0,0,0,0,72,85,83,84,82,95,50,49,0,0,0,0,0,0,0,0,72,85,83,84,82,95,50,48,0,0,0,0,0,0,0,0,72,85,83,84,82,95,49,57,0,0,0,0,0,0,0,0,80,114,101,115,115,32,69,110,116,101,114,32,116,111,32,67,104,97,110,103,101,0,0,0,72,85,83,84,82,95,49,56,0,0,0,0,0,0,0,0,80,114,101,115,115,32,69,78,84,69,82,32,107,101,121,32,116,111,32,114,101,115,101,116,32,116,111,32,100,101,102,97,117,108,116,115,0,0,0,0,72,85,83,84,82,95,49,55,0,0,0,0,0,0,0,0,85,110,114,101,99,111,103,110,105,115,101,100,32,109,101,110,117,32,105,116,101,109,32,116,121,112,101,32,37,100,0,0,72,85,83,84,82,95,49,54,0,0,0,0,0,0,0,0,99,111,109,112,95,102,97,108,108,111,102,102,0,0,0,0,80,114,101,115,115,32,108,101,102,116,32,111,114,32,114,105,103,104,116,32,116,111,32,99,104,111,111,115,101,0,0,0,66,83,80,73,0,0,0,0,72,85,83,84,82,95,49,53,0,0,0,0,0,0,0,0,83,69,84,85,80,0,0,0,114,117,110,110,105,50,0,0,77,101,103,97,83,112,104,101,114,101,33,0,0,0,0,0,45,110,111,109,117,115,105,99,0,0,0,0,0,0,0,0,84,121,112,101,47,101,100,105,116,32,102,105,108,101,110,97,109,101,32,97,110,100,32,80,114,101,115,115,32,69,78,84,69,82,0,0,0,0,0,0,116,110,116,107,101,121,121,99,0,0,0,0,0,0,0,0,72,85,83,84,82,95,49,52,0,0,0,0,0,0,0,0,84,121,112,101,47,101,100,105,116,32,99,104,97,116,32,115,116,114,105,110,103,32,97,110,100,32,80,114,101,115,115,32,69,78,84,69,82,0,0,0,72,85,83,84,82,95,49,51,0,0,0,0,0,0,0,0,71,95,67,104,101,99,107,68,101,109,111,83,116,97,116,117,115,58,32,68,101,109,111,32,114,101,99,111,114,100,101,100,0,0,0,0,0,0,0,0,37,100,47,37,100,0,0,0,69,110,116,101,114,32,118,97,108,117,101,0,0,0,0,0,72,85,83,84,82,95,49,50,0,0,0,0,0,0,0,0,83,101,108,101,99,116,32,99,111,108,111,114,32,97,110,100,32,112,114,101,115,115,32,101,110,116,101,114,0,0,0,0,72,85,83,84,82,95,49,49,0,0,0,0,0,0,0,0,69,110,116,101,114,32,118,97,108,117,101,46,32,80,114,101,115,115,32,69,78,84,69,82,32,119,104,101,110,32,102,105,110,105,115,104,101,100,46,0,72,85,83,84,82,95,49,48,0,0,0,0,0,0,0,0,69,110,116,101,114,32,119,101,97,112,111,110,32,110,117,109,98,101,114,0,0,0,0,0,72,85,83,84,82,95,57,0,80,114,101,115,115,32,69,78,84,69,82,32,107,101,121,32,116,111,32,116,111,103,103,108,101,0,0,0,0,0,0,0,72,85,83,84,82,95,56,0,80,114,101,115,115,32,107,101,121,32,102,111,114,32,116,104,105,115,32,97,99,116,105,111,110,0,0,0,0,0,0,0,72,85,83,84,82,95,55,0,80,114,101,115,115,32,107,101,121,32,111,114,32,98,117,116,116,111,110,32,102,111,114,32,116,104,105,115,32,97,99,116,105,111,110,0,0,0,0,0,72,85,83,84,82,95,54,0,99,111,109,112,95,100,114,111,112,111,102,102,0,0,0,0,10,0,0,0,0,0,0,0,83,80,73,68,0,0,0,0,72,85,83,84,82,95,53,0,77,69,78,85,0,0,0,0,100,100,116,98,108,50,0,0,76,105,103,104,116,32,65,109,112,108,105,102,105,99,97,116,105,111,110,32,86,105,115,111,114,0,0,0,0,0,0,0,45,110,111,115,111,117,110,100,0,0,0,0,0,0,0,0,37,115,0,0,0,0,0,0,116,110,116,107,101,121,114,99,0,0,0,0,0,0,0,0,72,85,83,84,82,95,52,0,77,95,80,65,76,78,79,0,72,85,83,84,82,95,51,0,71,95,66,101,103,105,110,82,101,99,111,114,100,105,110,103,58,32,69,114,114,111,114,32,119,114,105,116,105,110,103,32,100,101,109,111,32,104,101,97,100,101,114,0,0,0,0,0,127,127,127,127,127,127,127,32,78,47,65,0,0,0,0,0,47,77,66,37,100,0,0,0,72,85,83,84,82,95,50,0,47,74,83,66,37,100,0,0,72,85,83,84,82,95,49,0,47,68,66,76,45,67,76,75,32,77,66,37,100,0,0,0,72,85,83,84,82,95,69,52,77,57,0,0,0,0,0,0,37,100,0,0,0,0,0,0,72,85,83,84,82,95,69,52,77,56,0,0,0,0,0,0,78,79,0,0,0,0,0,0,72,85,83,84,82,95,69,52,77,55,0,0,0,0,0,0,89,69,83,0,0,0,0,0,72,85,83,84,82,95,69,52,77,54,0,0,0,0,0,0,87,97,114,110,105,110,103,58,32,67,104,97,110,103,101,115,32,97,114,101,32,112,101,110,100,105,110,103,32,117,110,116,105,108,32,110,101,120,116,32,103,97,109,101,0,0,0,0,72,85,83,84,82,95,69,52,77,53,0,0,0,0,0,0,99,111,109,112,95,116,101,108,101,102,114,97,103,0,0,0,86,105,100,101,111,32,109,111,100,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,0,0,0,0,83,75,85,76,0,0,0,0,72,85,83,84,82,95,69,52,77,52,0,0,0,0,0,0,72,69,76,80,0,0,0,0,100,111,111,109,50,0,0,0,67,111,109,112,117,116,101,114,32,65,114,101,97,32,77,97,112,0,0,0,0,0,0,0,45,119,97,114,116,0,0,0,87,97,114,110,105,110,103,58,32,80,114,111,103,114,97,109,32,109,117,115,116,32,98,101,32,114,101,115,116,97,114,116,101,100,32,116,111,32,115,101,101,32,99,104,97,110,103,101,115,0,0,0,0,0,0,0,116,110,116,107,101,121,98,0,72,85,83,84,82,95,69,52,77,51,0,0,0,0,0,0,86,97,108,117,101,32,111,117,116,32,111,102,32,82,97,110,103,101,0,0,0,0,0,0,72,85,83,84,82,95,69,52,77,50,0,0,0,0,0,0,45,108,111,110,103,116,105,99,115,0,0,0,0,0,0,0,83,84,83,32,0,0,0,0,73,95,82,101,97,100,58,32,114,101,97,100,32,102,97,105,108,101,100,58,32,37,115,0,82,101,115,101,116,32,116,111,32,100,101,102,97,117,108,116,115,63,32,40,89,32,111,114,32,78,41,0,0,0,0,0,99,111,117,108,100,110,39,116,32,111,112,101,110,32,97,117,100,105,111,32,119,105,116,104,32,100,101,115,105,114,101,100,32,102,111,114,109,97,116,10,0,0,0,0,0,0,0,0,72,85,83,84,82,95,69,52,77,49,0,0,0,0,0,0,73,95,83,101,116,82,101,115,58,32,85,115,105,110,103,32,114,101,115,111,108,117,116,105,111,110,32,37,100,120,37,100,10,0,0,0,0,0,0,0,77,95,86,66,79,88,0,0,69,78,68,79,79,77,0,0,72,85,83,84,82,95,69,51,77,57,0,0,0,0,0,0,87,95,85,110,108,111,99,107,76,117,109,112,78,117,109,58,32,69,120,99,101,115,115,32,117,110,108,111,99,107,115,32,111,110,32,37,56,115,10,0,77,95,80,65,76,83,69,76,0,0,0,0,0,0,0,0,82,95,67,97,99,104,101,84,101,120,116,117,114,101,67,111,109,112,111,115,105,116,101,80,97,116,99,104,78,117,109,58,32,67,111,109,112,111,115,105,116,101,32,112,97,116,99,104,101,115,32,110,111,116,32,105,110,105,116,105,97,108,105,122,101,100,0,0,0,0,0,0,37,120,0,0,0,0,0,0,72,85,83,84,82,95,69,51,77,56,0,0,0,0,0,0,77,95,67,79,76,79,82,83,0,0,0,0,0,0,0,0,90,95,67,104,97,110,103,101,84,97,103,58,32,97,110,32,111,119,110,101,114,32,105,115,32,114,101,113,117,105,114,101,100,32,102,111,114,32,112,117,114,103,97,98,108,101,32,98,108,111,99,107,115,10,0,0,72,85,83,84,82,95,69,51,77,55,0,0,0,0,0,0,82,95,73,110,105,116,83,107,121,77,97,112,32,0,0,0,79,112,101,110,71,76,0,0,72,85,83,84,82,95,69,51,77,54,0,0,0,0,0,0,51,50,98,105,116,0,0,0,69,78,68,80,73,67,0,0,72,85,83,84,82,95,69,51,77,53,0,0,0,0,0,0,98,114,100,114,95,116,0,0,87,73,78,85,77,37,100,0,49,54,98,105,116,0,0,0,72,85,83,84,82,95,69,51,77,52,0,0,0,0,0,0,121,111,117,39,114,101,32,116,114,121,105,110,103,32,116,111,32,115,97,121,32,121,111,117,32,108,105,107,101,32,100,111,115,10,98,101,116,116,101,114,32,116,104,97,110,32,109,101,44,32,114,105,103,104,116,63,0,0,0,0,0,0,0,0,83,95,69,78,68,0,0,0,99,111,109,112,95,115,116,97,105,114,115,0,0,0,0,0,49,53,98,105,116,0,0,0,66,79,83,50,0,0,0,0,72,85,83,84,82,95,69,51,77,51,0,0,0,0,0,0,114,98,0,0,0,0,0,0,83,67,82,69,69,78,0,0,116,104,101,100,97,50,0,0,82,97,100,105,97,116,105,111,110,32,83,104,105,101,108,100,105,110,103,32,83,117,105,116,0,0,0,0,0,0,0,0,45,119,97,114,112,0,0,0,56,98,105,116,0,0,0,0,116,110,116,107,101,121,121,0,72,85,83,84,82,95,69,51,77,50,0,0,0,0,0,0,78,77,0,0,0,0,0,0,72,85,83,84,82,95,69,51,77,49,0,0,0,0,0,0,71,95,66,101,103,105,110,82,101,99,111,114,100,105,110,103,58,32,66,111,111,109,32,99,111,109,112,97,116,105,98,105,108,105,116,121,32,108,101,118,101,108,32,117,110,114,101,99,111,103,110,105,115,101,100,63,0,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,85,86,0,0,0,0,0,0,72,85,83,84,82,95,69,50,77,57,0,0,0,0,0,0,86,95,73,110,105,116,77,111,100,101,58,32,117,115,105,110,103,32,49,54,32,98,105,116,32,118,105,100,101,111,32,109,111,100,101,10,0,0,0,0,72,77,80,0,0,0,0,0,82,95,76,111,97,100,84,114,105,103,84,97,98,108,101,115,58,32,73,110,118,97,108,105,100,32,84,65,78,71,84,65,66,76,0,0,0,0,0,0,72,85,83,84,82,95,69,50,77,56,0,0,0,0,0,0,83,84,66,65,82,0,0,0,72,78,84,82,0,0,0,0,72,85,83,84,82,95,69,50,77,55,0,0,0,0,0,0,73,84,89,84,68,0,0,0,72,85,83,84,82,95,69,50,77,54,0,0,0,0,0,0,72,85,83,84,82,95,69,50,77,53,0,0,0,0,0,0,114,111,117,110,100,101,100,0,72,85,83,84,82,95,69,50,77,52,0,0,0,0,0,0,108,105,110,101,97,114,0,0,114,101,97,108,116,105,99,95,99,108,111,99,107,95,114,97,116,101,0,0,0,0,0,0,72,85,83,84,82,95,69,50,77,51,0,0,0,0,0,0,99,111,109,112,95,105,110,102,99,104,101,97,116,0,0,0,112,111,105,110,116,0,0,0,66,79,83,83,0,0,0,0,72,85,83,84,82,95,69,50,77,50,0,0,0,0,0,0,78,69,88,84,32,45,62,0,80,73,83,70,0,0,0,0,115,116,108,107,115,50,0,0,80,97,114,116,105,97,108,32,73,110,118,105,115,105,98,105,108,105,116,121,0,0,0,0,65,117,115,116,105,110,32,86,105,114,116,117,97,108,32,71,97,109,105,110,103,58,32,76,101,118,101,108,115,32,119,105,108,108,32,101,110,100,32,97,102,116,101,114,32,50,48,32,109,105,110,117,116,101,115,10,0,0,0,0,0,0,0,0,45,116,105,109,101,114,0,0,110,111,110,101,0,0,0,0,116,110,116,107,101,121,114,0,72,85,83,84,82,95,69,50,77,49,0,0,0,0,0,0,115,108,111,112,101,100,0,0,72,85,83,84,82,95,69,49,77,57,0,0,0,0,0,0,71,95,87,114,105,116,101,79,112,116,105,111,110,115,58,32,71,65,77,69,95,79,80,84,73,79,78,95,83,73,90,69,32,105,115,32,116,111,111,32,115,109,97,108,108,0,0,0,70,82,71,32,0,0,0,0,106,97,103,103,101,100,0,0,72,85,83,84,82,95,69,49,77,56,0,0,0,0,0,0,77,95,73,110,105,116,68,101,102,97,117,108,116,115,58,32,67,111,117,108,100,110,39,116,32,102,105,110,100,32,99,111,110,102,105,103,32,118,97,114,105,97,98,108,101,32,37,115,0,0,0,0,0,0,0,0,72,85,83,84,82,95,69,49,77,55,0,0,0,0,0,0,72,85,83,84,82,95,69,49,77,54,0,0,0,0,0,0,77,95,69,112,105,115,111,100,101,58,32,52,116,104,32,101,112,105,115,111,100,101,32,114,101,113,117,105,114,101,115,32,85,108,116,105,109,97,116,101,68,79,79,77,10,0,0,0,72,85,83,84,82,95,69,49,77,53,0,0,0,0,0,0,77,95,84,72,69,82,77,79,0,0,0,0,0,0,0,0,72,85,83,84,82,95,69,49,77,52,0,0,0,0,0,0,101,49,109,53,0,0,0,0,77,95,84,72,69,82,77,82,0,0,0,0,0,0,0,0,72,85,83,84,82,95,69,49,77,51,0,0,0,0,0,0,77,95,84,72,69,82,77,77,0,0,0,0,0,0,0,0,72,85,83,84,82,95,69,49,77,50,0,0,0,0,0,0,100,111,111,109,46,119,97,100,0,0,0,0,0,0,0,0,83,95,67,104,97,110,103,101,77,117,115,105,99,58,32,66,97,100,32,109,117,115,105,99,32,110,117,109,98,101,114,32,37,100,0,0,0,0,0,0,99,111,109,112,95,122,111,109,98,105,101,0,0,0,0,0,77,95,84,72,69,82,77,76,0,0,0,0,0,0,0,0,66,65,76,55,0,0,0,0,66,69,72,65,86,73,79,82,0,0,0,0,0,0,0,0,72,85,83,84,82,95,69,49,77,49,0,0,0,0,0,0,69,88,73,84,0,0,0,0,100,101,97,100,0,0,0,0,66,101,114,115,101,114,107,33,0,0,0,0,0,0,0,0,45,97,118,103,0,0,0,0,80,82,66,79,79,77,0,0,116,110,116,107,101,121,0,0,105,100,100,113,100,0,0,0,72,85,83,84,82,95,77,83,71,85,0,0,0,0,0,0,77,70,76,82,56,95,52,0,71,71,83,65,86,69,68,0,71,95,82,101,99,111,114,100,68,101,109,111,58,32,102,97,105,108,101,100,32,116,111,32,111,112,101,110,32,37,115,0,75,69,89,32,0,0,0,0,67,69,73,76,53,95,49,0,80,68,95,65,76,76,54,0,97,108,108,32,111,116,104,101,114,115,32,119,104,111,32,104,101,108,112,101,100,32,40,115,101,101,32,65,85,84,72,79,82,83,32,102,105,108,101,41,0,0,0,0,0,0,0,0,80,68,95,65,76,76,51,0,74,101,115,115,32,72,97,97,115,32,102,111,114,32,108,83,68,76,68,111,111,109,0,0,80,68,95,65,78,89,0,0,77,105,99,104,97,101,108,32,39,75,111,100,97,107,39,32,82,121,115,115,101,110,32,102,111,114,32,68,79,79,77,71,76,0,0,0,0,0,0,0,80,68,95,89,69,76,76,79,87,83,0,0,0,0,0,0,82,97,110,100,121,32,72,101,105,116,32,102,111,114,32,90,68,79,79,77,0,0,0,0,80,68,95,82,69,68,83,0,84,104,101,32,68,79,83,68,111,111,109,45,84,101,97,109,32,102,111,114,32,68,79,83,68,79,79,77,0,0,0,0,80,68,95,66,76,85,69,83,0,0,0,0,0,0,0,0,71,65,77,77,65,84,66,76,0,0,0,0,0,0,0,0,76,101,101,32,75,105,108,108,111,117,103,104,32,102,111,114,32,77,66,70,0,0,0,0,80,68,95,89,69,76,76,79,87,67,0,0,0,0,0,0,67,111,109,112,97,116,105,98,105,108,105,116,121,32,115,101,116,116,105,110,103,115,0,0,84,101,97,109,84,78,84,32,102,111,114,32,66,79,79,77,0,0,0,0,0,0,0,0,72,69,65,68,0,0,0,0,80,68,95,82,69,68,67,0,83,69,76,69,67,84,32,73,84,69,77,0,0,0,0,0,105,110,95,99,105,116,0,0,115,0,0,0,0,0,0,0,73,110,118,117,108,110,101,114,97,98,105,108,105,116,121,33,0,0,0,0,0,0,0,0,105,100,32,83,111,102,116,119,97,114,101,32,102,111,114,32,68,79,79,77,0,0,0,0,116,110,116,104,111,109,0,0,80,68,95,66,76,85,69,67,0,0,0,0,0,0,0,0,119,98,0,0,0,0,0,0,65,100,100,105,116,105,111,110,97,108,32,67,114,101,100,105,116,32,84,111,0,0,0,0,80,68,95,89,69,76,76,79,87,75,0,0,0,0,0,0,71,95,82,101,99,111,114,100,68,101,109,111,58,32,78,111,32,115,97,118,101,32,105,110,32,100,101,109,111,44,32,99,97,110,39,116,32,99,111,110,116,105,110,117,101,0,0,0,70,73,78,73,83,72,69,68,58,32,77,65,80,37,48,50,100,10,0,0,0,0,0,0,87,69,65,32,0,0,0,0,65,110,100,114,101,121,32,66,117,100,107,111,0,0,0,0,80,68,95,82,69,68,75,0,78,101,105,108,32,83,116,101,118,101,110,115,0,0,0,0,80,68,95,66,76,85,69,75,0,0,0,0,0,0,0,0,112,114,101,115,115,32,121,32,111,114,32,110,46,0,0,0,67,111,108,105,110,32,80,104,105,112,112,115,0,0,0,0,80,68,95,89,69,76,76,79,87,79,0,0,0,0,0,0,70,108,111,114,105,97,110,32,39,80,114,111,102,102,39,32,83,99,104,117,108,122,101,0,80,68,95,82,69,68,79,0,80,114,111,103,114,97,109,109,101,114,115,0,0,0,0,0,80,68,95,66,76,85,69,79,0,0,0,0,0,0,0,0,37,115,32,118,37,115,32,40,104,116,116,112,58,47,47,112,114,98,111,111,109,46,115,111,117,114,99,101,102,111,114,103,101,46,110,101,116,47,41,0,66,70,71,32,57,48,48,48,0,0,0,0,0,0,0,0,71,79,84,83,72,79,84,71,85,78,50,0,0,0,0,0,80,76,65,89,80,65,76,0,70,79,76,76,79,87,32,77,79,68,69,0,0,0,0,0,71,79,84,83,72,79,84,71,85,78,0,0,0,0,0,0,73,39,109,32,110,111,116,32,108,111,111,107,105,110,103,32,116,111,111,32,103,111,111,100,33,0,0,0,0,0,0,0,97,117,116,111,114,117,110,0,83,79,85,78,68,32,86,79,76,85,77,69,0,0,0,0,83,65,82,71,0,0,0,0,71,79,84,80,76,65,83,77,65,0,0,0,0,0,0,0,66,65,67,75,83,80,65,67,69,0,0,0,0,0,0,0,100,100,116,98,108,117,0,0,76,101,118,101,108,115,32,119,105,108,108,32,101,110,100,32,97,102,116,101,114,32,37,100,32,109,105,110,117,116,101,37,115,46,10,0,0,0,0,0,80,105,99,107,101,100,32,117,112,32,97,32,114,101,100,32,115,107,117,108,108,32,107,101,121,46,0,0,0,0,0,0,77,95,83,99,114,101,101,110,83,104,111,116,58,32,67,111,117,108,100,110,39,116,32,99,114,101,97,116,101,32,115,99,114,101,101,110,115,104,111,116,0,0,0,0,0,0,0,0,74,85,78,75,0,0,0,0,77,97,112,32,99,104,101,97,116,0,0,0,0,0,0,0,71,79,84,76,65,85,78,67,72,69,82,0,0,0,0,0,100,115,37,115,0,0,0,0,37,115,47,100,111,111,109,37,48,50,100,46,98,109,112,0,80,65,85,83,0,0,0,0,71,79,84,67,72,65,73,78,83,65,87,0,0,0,0,0,114,43,0,0,0,0,0,0,65,82,77,32,0,0,0,0,46,0,0,0,0,0,0,0,70,49,50,0,0,0,0,0,71,79,84,67,72,65,73,78,71,85,78,0,0,0,0,0,77,95,83,99,114,101,101,110,83,104,111,116,58,32,69,114,114,111,114,32,119,114,105,116,105,110,103,32,115,99,114,101,101,110,115,104,111,116,10,0,70,49,49,0,0,0,0,0,71,79,84,66,70,71,57,48,48,48,0,0,0,0,0,0,112,114,98,111,111,109,46,119,97,100,0,0,0,0,0,0,70,49,48,0,0,0,0,0,71,79,84,66,65,67,75,80,65,67,75,0,0,0,0,0,77,95,76,111,97,100,68,101,102,97,117,108,116,115,58,32,84,121,112,101,32,109,105,115,109,97,116,99,104,32,114,101,97,100,105,110,103,32,37,115,10,0,0,0,0,0,0,0,68,69,76,0,0,0,0,0,71,79,84,83,72,69,76,76,66,79,88,0,0,0,0,0,37,105,0,0,0,0,0,0,73,78,83,84,0,0,0,0,71,79,84,83,72,69,76,76,83,0,0,0,0,0,0,0,37,120,0,0,0,0,0,0,80,71,68,78,0,0,0,0,71,79,84,67,69,76,76,66,79,88,0,0,0,0,0,0,45,110,111,109,111,117,115,101,0,0,0,0,0,0,0,0,73,95,70,105,110,105,115,104,85,112,100,97,116,101,58,32,37,115,10,0,0,0,0,0,37,55,57,115,32,37,91,94,10,93,10,0,0,0,0,0,69,78,68,0,0,0,0,0,71,79,84,67,69,76,76,0,115,104,111,119,95,109,101,115,115,97,103,101,115,0,0,0,114,0,0,0,0,0,0,0,80,71,85,80,0,0,0,0,67,80,79,83,0,0,0,0,71,79,84,82,79,67,75,66,79,88,0,0,0,0,0,0,82,73,71,72,84,0,0,0,115,104,97,119,110,0,0,0,45,116,105,109,101,114,0,0,80,105,99,107,101,100,32,117,112,32,97,32,121,101,108,108,111,119,32,115,107,117,108,108,32,107,101,121,46,0,0,0,32,100,101,102,97,117,108,116,32,102,105,108,101,58,32,37,115,10,0,0,0,0,0,0,72,79,77,69,0,0,0,0,105,100,100,116,0,0,0,0,10,0,0,0,0,0,0,0,71,79,84,82,79,67,75,69,84,0,0,0,0,0,0,0,112,114,0,0,0,0,0,0,83,67,82,76,0,0,0,0,71,79,84,67,76,73,80,66,79,88,0,0,0,0,0,0,119,98,0,0,0,0,0,0,72,69,76,32,0,0,0,0,87,95,73,110,105,116,58,32,67,111,117,108,100,110,39,116,32,97,108,108,111,99,97,116,101,32,108,117,109,112,99,97,99,104,101,0,0,0,0,0,47,0,0,0,0,0,0,0,67,65,80,83,0,0,0,0,71,79,84,67,76,73,80,0,45,115,111,108,111,45,110,101,116,0,0,0,0,0,0,0,37,115,37,115,37,115,98,111,111,109,46,99,102,103,0,0,65,76,84,0,0,0,0,0])
.concat([71,79,84,77,83,80,72,69,82,69,0,0,0,0,0,0,45,99,111,110,102,105,103,0,83,72,70,84,0,0,0,0,71,79,84,86,73,83,79,82,0,0,0,0,0,0,0,0,77,95,76,111,111,107,117,112,68,101,102,97,117,108,116,58,32,37,115,32,110,111,116,32,102,111,117,110,100,0,0,0,68,65,82,82,0,0,0,0,71,79,84,77,65,80,0,0,37,45,50,53,115,32,34,37,115,34,10,0,0,0,0,0,82,65,82,82,0,0,0,0,71,79,84,83,85,73,84,0,37,45,50,53,115,32,37,53,105,10,0,0,0,0,0,0,85,65,82,82,0,0,0,0,71,79,84,73,78,86,73,83,0,0,0,0,0,0,0,0,32,32,32,32,83,68,76,95,71,76,95,68,69,80,84,72,95,83,73,90,69,58,32,37,105,10,0,0,0,0,0,0,37,45,50,53,115,32,48,120,37,120,10,0,0,0,0,0,76,65,82,82,0,0,0,0,71,79,84,66,69,82,83,69,82,75,0,0,0,0,0,0,115,116,115,95,116,114,97,100,105,116,105,111,110,97,108,95,107,101,121,115,0,0,0,0,10,35,32,37,115,10,0,0,67,84,82,76,0,0,0,0,70,65,84,84,0,0,0,0,71,79,84,73,78,86,85,76,0,0,0,0,0,0,0,0,76,69,70,84,0,0,0,0,116,104,101,95,100,97,0,0,45,101,112,105,115,111,100,101,0,0,0,0,0,0,0,0,80,105,99,107,101,100,32,117,112,32,97,32,98,108,117,101,32,115,107,117,108,108,32,107,101,121,46,0,0,0,0,0,35,32,118,97,114,105,97,98,108,101,32,32,32,118,97,108,117,101,10,0,0,0,0,0,66,65,67,75,0,0,0,0,116,110,116,101,109,0,0,0,71,79,84,82,69,68,83,75,85,76,76,0,0,0,0,0,35,32,70,111,114,109,97,116,58,10,0,0,0,0,0,0,83,80,65,67,0,0,0,0,45,0,0,0,0,0,0,0,71,79,84,89,69,76,87,83,75,85,76,0,0,0,0,0,46,108,109,112,0,0,0,0,65,77,77,32,0,0,0,0,35,32,68,111,111,109,32,99,111,110,102,105,103,32,102,105,108,101,10,0,0,0,0,0,69,83,67,0,0,0,0,0,71,79,84,66,76,85,69,83,75,85,76,0,0,0,0,0,119,0,0,0,0,0,0,0,69,78,84,82,0,0,0,0,71,79,84,82,69,68,67,65,82,68,0,0,0,0,0,0,73,110,118,97,108,105,100,32,118,97,108,117,101,32,37,105,32,102,111,114,32,104,101,108,112,101,114,44,32,105,103,110,111,114,101,100,46,0,0,0,100,109,50,105,110,116,46,109,112,51,0,0,0,0,0,0,84,65,66,0,0,0,0,0,71,79,84,89,69,76,87,67,65,82,68,0,0,0,0,0,109,117,115,95,100,109,50,105,110,116,0,0,0,0,0,0,80,65,68,0,0,0,0,0,71,79,84,66,76,85,69,67,65,82,68,0,0,0,0,0,100,109,50,116,116,108,46,109,112,51,0,0,0,0,0,0,80,65,68,69,0,0,0,0,71,79,84,83,85,80,69,82,0,0,0,0,0,0,0,0,109,117,115,95,100,109,50,116,116,108,0,0,0,0,0,0,77,95,67,72,65,84,0,0,71,79,84,77,69,68,73,75,73,84,0,0,0,0,0,0,32,32,32,32,83,68,76,95,71,76,95,66,85,70,70,69,82,95,83,73,90,69,58,32,37,105,10,0,0,0,0,0,114,101,97,100,95,109,46,109,112,51,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,48,0,0,0,0,0,0,71,79,84,77,69,68,73,78,69,69,68,0,0,0,0,0,115,116,115,95,112,99,116,95,97,108,119,97,121,115,95,103,114,97,121,0,0,0,0,0,109,117,115,95,114,101,97,100,95,109,0,0,0,0,0,0,48,0,0,0,0,0,0,0,77,65,78,70,0,0,0,0,71,79,84,83,84,73,77,0,80,82,69,86,32,73,84,69,77,0,0,0,0,0,0,0,100,111,111,109,0,0,0,0,90,95,77,97,108,108,111,99,58,32,65,110,32,111,119,110,101,114,32,105,115,32,114,101,113,117,105,114,101,100,32,102,111,114,32,112,117,114,103,97,98,108,101,32,98,108,111,99,107,115,0,0,0,0,0,0,45,115,107,105,108,108,0,0,80,105,99,107,101,100,32,117,112,32,97,32,114,101,100,32,107,101,121,99,97,114,100,46,0,0,0,0,0,0,0,0,117,108,116,105,109,97,46,109,112,51,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,57,0,0,0,0,0,0,116,110,116,99,111,109,112,0,71,79,84,65,82,77,66,79,78,85,83,0,0,0,0,0,109,117,115,95,117,108,116,105,109,97,0,0,0,0,0,0,57,0,0,0,0,0,0,0,71,79,84,72,84,72,66,79,78,85,83,0,0,0,0,0,71,95,87,114,105,116,101,68,101,109,111,84,105,99,99,109,100,58,32,101,114,114,111,114,32,119,114,105,116,105,110,103,32,100,101,109,111,0,0,0,90,58,32,37,45,53,100,0,101,118,105,108,46,109,112,51,0,0,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,56,0,0,0,0,0,0,71,79,84,77,69,71,65,0,109,117,115,95,101,118,105,108,0,0,0,0,0,0,0,0,56,0,0,0,0,0,0,0,71,79,84,65,82,77,79,82,0,0,0,0,0,0,0,0,111,112,101,110,105,110,46,109,112,51,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,55,0,0,0,0,0,0,69,77,80,84,89,83,84,82,73,78,71,0,0,0,0,0,109,117,115,95,111,112,101,110,105,110,0,0,0,0,0,0,55,0,0,0,0,0,0,0,71,65,77,77,65,76,86,76,52,0,0,0,0,0,0,0,109,117,115,95,115,104,97,119,110,51,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,54,0,0,0,0,0,0,71,65,77,77,65,76,86,76,51,0,0,0,0,0,0,0,10,82,95,76,111,97,100,84,114,105,103,84,97,98,108,101,115,58,32,0,0,0,0,0,116,101,110,115,101,46,109,112,51,0,0,0,0,0,0,0,54,0,0,0,0,0,0,0,71,65,77,77,65,76,86,76,50,0,0,0,0,0,0,0,32,32,32,32,83,68,76,95,71,76,95,68,79,85,66,76,69,66,85,70,70,69,82,58,32,37,105,10,0,0,0,0,109,117,115,95,116,101,110,115,101,0,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,53,0,0,0,0,0,0,71,65,77,77,65,76,86,76,49,0,0,0,0,0,0,0,115,116,115,95,97,108,119,97,121,115,95,114,101,100,0,0,109,117,115,95,114,111,109,101,114,50,0,0,0,0,0,0,53,0,0,0,0,0,0,0,83,75,69,76,0,0,0,0,71,65,77,77,65,76,86,76,48,0,0,0,0,0,0,0,78,69,88,84,32,73,84,69,77,0,0,0,0,0,0,0,98,101,116,119,101,101,0,0,116,117,114,98,111,32,115,99,97,108,101,58,32,37,105,37,37,10,0,0,0,0,0,0,80,105,99,107,101,100,32,117,112,32,97,32,121,101,108,108,111,119,32,107,101,121,99,97,114,100,46,0,0,0,0,0,109,117,115,95,109,101,115,115,103,50,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,52,0,0,0,0,0,0,70,114,97,109,101,32,114,97,116,101,0,0,0,0,0,0,68,69,84,65,73,76,76,79,0,0,0,0,0,0,0,0,97,100,114,105,97,110,46,109,112,51,0,0,0,0,0,0,52,0,0,0,0,0,0,0,68,69,84,65,73,76,72,73,0,0,0,0,0,0,0,0,71,95,82,101,97,100,68,101,109,111,84,105,99,99,109,100,58,32,109,105,115,115,105,110,103,32,68,69,77,79,77,65,82,75,69,82,10,0,0,0,89,58,32,37,45,53,100,0,109,117,115,95,97,100,114,105,97,110,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,51,0,0,0,0,0,0,68,79,83,89,0,0,0,0,109,117,115,95,116,104,101,100,97,51,0,0,0,0,0,0,51,0,0,0,0,0,0,0,69,78,68,71,65,77,69,0,80,84,82,95,83,108,105,100,101,84,114,97,118,101,114,115,101,58,32,110,111,116,32,97,32,108,105,110,101,63,0,0,97,109,112,105,101,46,109,112,51,0,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,50,0,0,0,0,0,0,78,69,84,69,78,68,0,0,109,117,115,95,97,109,112,105,101,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,77,83,71,79,78,0,0,0,90,95,66,77,97,108,108,111,99,58,32,109,101,109,99,104,114,32,114,101,116,117,114,110,101,100,32,112,111,105,110,116,101,114,32,111,117,116,115,105,100,101,32,111,102,32,97,114,114,97,121,0,0,0,0,0,109,117,115,95,100,100,116,98,108,51,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,49,0,0,0,0,0,0,77,83,71,79,70,70,0,0,109,117,115,95,99,111,117,110,116,50,0,0,0,0,0,0,49,0,0,0,0,0,0,0,83,87,83,84,82,73,78,71,0,0,0,0,0,0,0,0,32,32,32,32,83,68,76,95,71,76,95,65,67,67,85,77,95,65,76,80,72,65,95,83,73,90,69,58,32,37,105,10,0,0,0,0,0,0,0,0,109,101,115,115,97,103,46,109,112,51,0,0,0,0,0,0,77,95,77,69,83,83,0,0,78,73,71,72,84,77,65,82,69,0,0,0,0,0,0,0,100,111,103,95,106,117,109,112,105,110,103,0,0,0,0,0,109,117,115,95,109,101,115,115,97,103,0,0,0,0,0,0,104,117,100,95,108,105,115,116,95,98,103,111,110,0,0,0,70,66,88,80,0,0,0,0,82,69,83,84,65,82,84,76,69,86,69,76,0,0,0,0,77,69,78,85,83,0,0,0,70,95,83,75,89,49,0,0,99,111,117,110,116,100,0,0,45,116,117,114,98,111,0,0,80,105,99,107,101,100,32,117,112,32,97,32,98,108,117,101,32,107,101,121,99,97,114,100,46,0,0,0,0,0,0,0,109,117,115,95,115,104,97,119,110,50,0,0,0,0,0,0,77,101,115,115,97,103,101,32,66,97,99,107,103,114,111,117,110,100,0,0,0,0,0,0,105,100,114,97,116,101,0,0,78,69,87,71,65,77,69,0,114,111,109,101,114,111,46,109,112,51,0,0,0,0,0,0,104,117,100,95,109,115,103,95,108,105,110,101,115,0,0,0,83,65,86,69,68,69,65,68,0,0,0,0,0,0,0,0,45,99,111,109,112,108,101,118,101,108,0,0,0,0,0,0,88,58,32,37,45,53,100,0,115,105,103,110,97,108,32,37,100,0,0,0,0,0,0,0,109,117,115,95,114,111,109,101,114,111,0,0,0,0,0,0,78,117,109,98,101,114,32,111,102,32,82,101,118,105,101,119,32,77,101,115,115,97,103,101,32,76,105,110,101,115,0,0,73,95,73,110,105,116,83,111,117,110,100,58,32,0,0,0,81,83,65,86,69,83,80,79,84,0,0,0,0,0,0,0,67,111,117,108,100,32,110,111,116,32,105,110,105,116,105,97,108,105,122,101,32,83,68,76,32,91,37,115,93,0,0,0,109,117,115,95,115,116,108,107,115,51,0,0,0,0,0,0,104,117,100,99,111,108,111,114,95,108,105,115,116,0,0,0,69,78,68,66,79,79,77,0,81,85,73,84,77,83,71,0,87,95,67,97,99,104,101,76,117,109,112,78,117,109,58,32,72,105,103,104,32,108,111,99,107,32,111,110,32,37,56,115,32,40,37,100,41,10,0,0,109,117,115,95,100,101,97,100,50,0,0,0,0,0,0,0,77,101,115,115,97,103,101,32,82,101,118,105,101,119,32,67,111,108,111,114,0,0,0,0,82,95,85,110,108,111,99,107,80,97,116,99,104,78,117,109,58,32,69,120,99,101,115,115,32,117,110,108,111,99,107,115,32,111,110,32,37,56,115,32,40,37,100,45,37,100,41,10,0,0,0,0,0,0,0,0,102,105,110,97,108,58,32,0,82,95,71,101,116,68,114,97,119,67,111,108,117,109,110,70,117,110,99,58,32,117,110,100,101,102,105,110,101,100,32,102,117,110,99,116,105,111,110,32,40,37,100,44,32,37,100,44,32,37,100,41,0,0,0,0,80,82,69,83,83,89,78,0,109,117,115,95,114,117,110,110,105,50,0,0,0,0,0,0,104,117,100,99,111,108,111,114,95,99,104,97,116,0,0,0,90,95,67,104,97,110,103,101,84,97,103,58,32,102,114,101,101,100,32,97,32,112,111,105,110,116,101,114,32,119,105,116,104,111,117,116,32,90,79,78,69,73,68,0,0,0,0,0,80,82,69,83,83,75,69,89,0,0,0,0,0,0,0,0,82,95,73,110,105,116,76,105,103,104,116,84,97,98,108,101,115,32,0,0,0,0,0,0,109,117,115,95,100,100,116,98,108,50,0,0,0,0,0,0,67,104,97,116,32,77,101,115,115,97,103,101,32,67,111,108,111,114,0,0,0,0,0,0,68,95,67,68,82,79,77,0,67,87,73,76,86,37,50,46,50,100,0,0,0,0,0,0,83,112,101,99,104,105,116,79,118,101,114,114,117,110,58,32,87,97,114,110,105,110,103,58,32,117,110,97,98,108,101,32,116,111,32,101,109,117,108,97,116,101,32,97,110,32,111,118,101,114,114,117,110,32,119,104,101,114,101,32,110,117,109,115,112,101,99,104,105,116,61,37,105,10,0,0,0,0,0,0,109,117,115,95,100,111,111,109,50,0,0,0,0,0,0,0,80,95,83,112,101,99,105,97,108,84,104,105,110,103,58,32,85,110,107,110,111,119,110,32,103,101,116,116,97,98,108,101,32,116,104,105,110,103,0,0,104,117,100,99,111,108,111,114,95,109,101,115,103,0,0,0,86,73,67,84,79,82,89,50,0,0,0,0,0,0,0,0,68,95,68,69,86,83,84,82,0,0,0,0,0,0,0,0,32,32,32,32,83,68,76,95,71,76,95,65,67,67,85,77,95,66,76,85,69,95,83,73,90,69,58,32,37,105,10,0,70,76,79,79,82,55,95,50,0,0,0,0,0,0,0,0,87,73,65,37,100,37,46,50,100,37,46,50,100,0,0,0,109,117,115,95,116,104,101,100,97,50,0,0,0,0,0,0,77,101,115,115,97,103,101,32,67,111,108,111,114,32,68,117,114,105,110,103,32,80,108,97,121,0,0,0,0,0,0,0,32,37,108,100,0,0,0,0,105,32,119,111,117,108,100,110,39,116,32,108,101,97,118,101,32,105,102,32,105,32,119,101,114,101,32,121,111,117,46,10,100,111,115,32,105,115,32,109,117,99,104,32,119,111,114,115,101,46,0,0,0,0,0,0,83,95,83,84,65,82,84,0,102,114,105,101,110,100,95,100,105,115,116,97,110,99,101,0,109,117,115,95,115,116,108,107,115,50,0,0,0,0,0,0,77,95,67,79,77,80,65,84,0,0,0,0,0,0,0,0,70,65,84,66,0,0,0,0,32,48,37,108,111,0,0,0,47,116,114,97,110,109,97,112,46,100,97,116,0,0,0,0,85,83,69,0,0,0,0,0,115,116,97,108,107,115,0,0,68,101,118,101,108,111,112,109,101,110,116,32,109,111,100,101,32,79,78,46,10,0,0,0,83,117,112,101,114,99,104,97,114,103,101,33,0,0,0,0,80,95,67,104,101,99,107,70,111,114,90,68,111,111,109,78,111,100,101,115,58,32,90,68,111,111,109,32,71,76,32,110,111,100,101,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,121,101,116,0,0,100,101,97,100,46,109,112,51,0,0,0,0,0,0,0,0,99,111,109,112,95,109,97,115,107,101,100,97,110,105,109,0,80,108,97,121,101,114,32,80,111,115,105,116,105,111,110,0,32,48,88,37,108,120,0,0,109,117,115,95,100,101,97,100,0,0,0,0,0,0,0,0,50,83,32,109,105,100,100,108,101,32,116,101,120,116,117,114,101,115,32,100,111,32,110,111,116,32,97,110,105,109,97,116,101,0,0,0,0,0,0,0,32,48,120,37,108,120,0,0,37,115,47,37,115,37,100,46,100,115,103,0,0,0,0,0,105,110,95,99,105,116,46,109,112,51,0,0,0,0,0,0,99,111,109,112,95,115,111,117,108,0,0,0,0,0,0,0,67,111,117,108,100,32,110,111,116,32,102,105,110,100,32,39,37,46,49,50,115,39,10,0,86,95,73,110,105,116,77,111,100,101,58,32,117,115,105,110,103,32,49,53,32,98,105,116,32,118,105,100,101,111,32,109,111,100,101,10,0,0,0,0,97,114,101,32,121,111,117,32,115,117,114,101,32,121,111,117,32,119,97,110,116,32,116,111,10,113,117,105,116,32,116,104,105,115,32,103,114,101,97,116,32,103,97,109,101,63,0,0,109,117,115,95,105,110,95,99,105,116,0,0,0,0,0,0,76,111,115,116,32,115,111,117,108,115,32,100,111,110,39,116,32,98,111,117,110,99,101,32,111,102,102,32,102,108,97,116,32,115,117,114,102,97,99,101,115,0,0,0,0,0,0,0,84,65,78,71,84,65,66,76,0,0,0,0,0,0,0,0,42,66,69,88,32,70,79,82,77,65,84,58,10,37,115,32,61,32,37,115,10,42,69,78,68,32,66,69,88,10,0,0,83,84,75,69,89,83,37,100,0,0,0,0,0,0,0,0,100,100,116,98,108,117,46,109,112,51,0,0,0,0,0,0,99,111,109,112,95,54,54,54,0,0,0,0,0,0,0,0,46,46,46,0,0,0,0,0,109,117,115,95,100,100,116,98,108,117,0,0,0,0,0,0,65,108,108,32,98,111,115,115,32,116,121,112,101,115,32,99,97,110,32,116,114,105,103,103,101,114,32,116,97,103,32,54,54,54,32,97,116,32,69,120,77,56,0,0,0,0,0,0,65,115,115,105,103,110,101,100,32,39,37,46,49,50,115,37,115,39,32,116,111,39,37,46,49,50,115,37,115,39,32,97,116,32,107,101,121,32,37,115,10,0,0,0,0,0,0,0,115,104,97,119,110,46,109,112,51,0,0,0,0,0,0,0,99,111,109,112,95,122,101,114,111,116,97,103,115,0,0,0,65,115,115,105,103,110,101,100,32,107,101,121,32,37,115,32,61,62,32,39,37,115,39,10,0,0,0,0,0,0,0,0,109,117,115,95,115,104,97,119,110,0,0,0,0,0,0,0,76,105,110,101,100,101,102,32,101,102,102,101,99,116,115,32,119,111,114,107,32,119,105,116,104,32,115,101,99,116,111,114,32,116,97,103,32,61,32,48,0,0,0,0,0,0,0,0,80,114,111,99,101,115,115,105,110,103,32,102,117,110,99,116,105,111,110,32,91,37,100,93,32,102,111,114,32,37,115,10,0,0,0,0,0,0,0,0,32,32,32,32,83,68,76,95,71,76,95,65,67,67,85,77,95,71,82,69,69,78,95,83,73,90,69,58,32,37,105,10,0,0,0,0,0,0,0,0,116,104,101,95,100,97,46,109,112,51,0,0,0,0,0,0,99,111,109,112,95,109,111,100,101,108,0,0,0,0,0,0,100,101,102,97,117,108,116,95,99,111,109,112,97,116,105,98,105,108,105,116,121,95,108,101,118,101,108,0,0,0,0,0,46,46,46,99,111,110,116,105,110,117,105,110,103,32,119,105,116,104,32,37,115,10,0,0,46,0,0,0,0,0,0,0,112,108,97,121,101,114,95,104,101,108,112,101,114,115,0,0,109,117,115,95,116,104,101,95,100,97,0,0,0,0,0,0,85,115,101,32,101,120,97,99,116,108,121,32,68,111,111,109,39,115,32,108,105,110,101,100,101,102,32,116,114,105,103,103,101,114,32,109,111,100,101,108,0,0,0,0,0,0,0,0,70,73,82,69,0,0,0,0,66,114,97,110,99,104,105,110,103,32,116,111,32,105,110,99,108,117,100,101,32,102,105,108,101,32,37,115,46,46,46,10,0,0,0,0,0,0,0,0,49,56,48,32,84,85,82,78,0,0,0,0,0,0,0,0,80,73,83,71,0,0,0,0,114,117,110,110,105,110,0,0,37,115,0,0,0,0,0,0,45,97,118,103,0,0,0,0,80,105,99,107,101,100,32,117,112,32,97,32,109,101,100,105,107,105,116,46,0,0,0,0,80,95,67,104,101,99,107,70,111,114,90,68,111,111,109,78,111,100,101,115,58,32,90,68,111,111,109,32,110,111,100,101,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,121,101,116,0,0,0,0,0,100,111,111,109,46,109,112,51,0,0,0,0,0,0,0,0,99,111,109,112,95,109,111,118,101,98,108,111,99,107,0,0,105,100,109,121,112,111,115,0,78,79,84,69,88,84,0,0,109,117,115,95,100,111,111,109,0,0,0,0,0,0,0,0,85,115,101,32,101,120,97,99,116,108,121,32,68,111,111,109,39,115,32,109,111,118,101,109,101,110,116,32,99,108,105,112,112,105,110,103,32,99,111,100,101,0,0,0,0,0,0,0,78,111,32,102,105,108,101,115,32,109,97,121,32,98,101,32,105,110,99,108,117,100,101,100,32,102,114,111,109,32,119,97,100,115,58,32,37,115,10,0,100,101,109,111,115,97,118,0,83,84,75,69,89,83,37,100,0,0,0,0,0,0,0,0,98,101,116,119,101,101,46,109,112,51,0,0,0,0,0,0,99,111,109,112,95,102,108,111,111,114,115,0,0,0,0,0,73,78,67,76,85,68,69,0,109,117,115,95,98,101,116,119,101,101,0,0,0,0,0,0,85,115,101,32,101,120,97,99,116,108,121,32,68,111,111,109,39,115,32,102,108,111,111,114,32,109,111,116,105,111,110,32,98,101,104,97,118,105,111,114,0,0,0,0,0,0,0,0,76,105,110,101,61,39,37,115,39,10,0,0,0,0,0,0,99,111,117,110,116,100,46,109,112,51,0,0,0,0,0,0,99,111,109,112,95,115,116,97,105,114,115,0,0,0,0,0,10,76,111,97,100,105,110,103,32,68,69,72,32,102,105,108,101,32,37,115,10,10,0,0,67,79,76,79,82,77,65,80,0,0,0,0,0,0,0,0,77,95,69,80,73,83,79,68,0,0,0,0,0,0,0,0,109,117,115,95,99,111,117,110,116,100,0,0,0,0,0,0,85,115,101,32,101,120,97,99,116,108,121,32,68,111,111,109,39,115,32,115,116,97,105,114,98,117,105,108,100,105,110,103,32,109,101,116,104,111,100,0,76,111,97,100,105,110,103,32,68,69,72,32,102,105,108,101,32,37,115,10,0,0,0,0,115,116,97,108,107,115,46,109,112,51,0,0,0,0,0,0,99,111,109,112,95,115,107,121,109,97,112,0,0,0,0,0,40,87,65,68,41,0,0,0,101,49,109,52,0,0,0,0,109,117,115,95,115,116,97,108,107,115,0,0,0,0,0,0,83,107,121,32,105,115,32,117,110,97,102,102,101,99,116,101,100,32,98,121,32,105,110,118,117,108,110,101,114,97,98,105,108,105,116,121,0,0,0,0,45,100,101,104,32,102,105,108,101,32,37,115,32,110,111,116,32,102,111,117,110,100,10,0,32,32,32,32,83,68,76,95,71,76,95,65,67,67,85,77,95,82,69,68,95,83,73,90,69,58,32,37,105,10,0,0,114,117,110,110,105,110,46,109,112,51,0,0,0,0,0,0,99,111,109,112,95,122,111,109,98,105,101,0,0,0,0,0,114,116,0,0,0,0,0,0,116,110,116,46,119,97,100,0,83,95,83,101,116,83,102,120,86,111,108,117,109,101,58,32,65,116,116,101,109,112,116,32,116,111,32,115,101,116,32,115,102,120,32,118,111,108,117,109,101,32,97,116,32,37,100,0,118,97,114,105,97,98,108,101,95,102,114,105,99,116,105,111,110,0,0,0,0,0,0,0,109,117,115,95,114,117,110,110,105,110,0,0,0,0,0,0,90,111,109,98,105,101,32,112,108,97,121,101,114,115,32,99,97,110,32,101,120,105,116,32,108,101,118,101,108,115,0,0,86,73,76,69,0,0,0,0,71,76,95,69,37,105,77,37,105,0,0,0,0,0,0,0,67,111,117,108,100,32,110,111,116,32,111,112,101,110,32,45,100,101,104,111,117,116,32,102,105,108,101,32,37,115,10,46,46,46,32,117,115,105,110,103,32,115,116,100,111,117,116,46,10,0,0,0,0,0,0,0,65,85,84,79,82,85,78,0,105,110,116,114,111,97,0,0,80,114,66,111,111,109,32,40,98,117,105,108,116,32,37,115,41,44,32,112,108,97,121,105,110,103,58,32,37,115,10,80,114,66,111,111,109,32,105,115,32,114,101,108,101,97,115,101,100,32,117,110,100,101,114,32,116,104,101,32,71,78,85,32,71,101,110,101,114,97,108,32,80,117,98,108,105,99,32,108,105,99,101,110,115,101,32,118,50,46,48,46,10,89,111,117,32,97,114,101,32,119,101,108,99,111,109,101,32,116,111,32,114,101,100,105,115,116,114,105,98,117,116,101,32,105,116,32,117,110,100,101,114,32,99,101,114,116,97,105,110,32,99,111,110,100,105,116,105,111,110,115,46,10,73,116,32,99,111,109,101,115,32,119,105,116,104,32,65,66,83,79,76,85,84,69,76,89,32,78,79,32,87,65,82,82,65,78,84,89,46,32,83,101,101,32,116,104,101,32,102,105,108,101,32,67,79,80,89,73,78,71,32,102,111,114,32,100,101,116,97,105,108,115,46,10,0,0,0,0,0,0,80,95,71,101,116,78,111,100,101,115,86,101,114,115,105,111,110,58,32,90,68,111,111,109,32,110,111,100,101,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,121,101,116,0,0,0,0,0,0,0,0,109,117,115,95,105,110,116,114,111,97,0,0,0,0,0,0,80,105,99,107,101,100,32,117,112,32,97,32,109,101,100,105,107,105,116,32,116,104,97,116,32,121,111,117,32,82,69,65,76,76,89,32,110,101,101,100,33,0,0,0,0,0,0,0,99,111,109,112,95,105,110,102,99,104,101,97,116,0,0,0,76,101,118,101,108,32,87,97,114,112,0,0,0,0,0,0,67,104,97,105,110,115,97,119,0,0,0,0,0,0,0,0,97,116,0,0,0,0,0,0,82,95,73,110,115,116,97,108,108,83,112,114,105,116,101,76,117,109,112,58,32,66,97,100,32,102,114,97,109,101,32,99,104,97,114,97,99,116,101,114,115,32,105,110,32,108,117,109,112,32,37,105,0,0,0,0,67,111,114,114,117,112,116,32,115,97,118,101,103,97,109,101,0,0,0,0,0,0,0,0,118,105,99,116,111,114,46,109,112,51,0,0,0,0,0,0,80,111,119,101,114,117,112,32,99,104,101,97,116,115,32,97,114,101,32,110,111,116,32,105,110,102,105,110,105,116,101,32,100,117,114,97,116,105,111,110,0,0,0,0,0,0,0,0,119,116,0,0,0,0,0,0,71,95,68,111,76,111,97,100,71,97,109,101,58,32,66,97,100,32,115,97,118,101,103,97,109,101,0,0,0,0,0,0,76,67,82,0,0,0,0,0,109,117,115,95,118,105,99,116,111,114,0,0,0,0,0,0,99,111,109,112,95,103,111,100,0,0,0,0,0,0,0,0,45,0,0,0,0,0,0,0,98,117,110,110,121,46,109,112,51,0,0,0,0,0,0,0,71,111,100,32,109,111,100,101,32,105,115,110,39,116,32,97,98,115,111,108,117,116,101,0,78,69,87,76,69,86,69,76,0,0,0,0,0,0,0,0,109,117,115,95,98,117,110,110,121,0,0,0,0,0,0,0,99,111,109,112,95,100,111,111,114,108,105,103,104,116,0,0,112,114,98,109,115,97,118,0,105,110,116,114,111,46,109,112,51,0,0,0,0,0,0,0,84,97,103,103,101,100,32,100,111,111,114,115,32,100,111,110,39,116,32,116,114,105,103,103,101,114,32,115,112,101,99,105,97,108,32,108,105,103,104,116,105,110,103,0,0,0,0,0,109,117,115,95,105,110,116,114,111,0,0,0,0,0,0,0,99,111,109,112,95,98,108,97,122,105,110,103,0,0,0,0,66,79,83,83,66,65,67,75,0,0,0,0,0,0,0,0,109,117,115,95,105,110,116,101,114,0,0,0,0,0,0,0,66,108,97,122,105,110,103,32,100,111,111,114,115,32,109,97,107,101,32,100,111,117,98,108,101,32,99,108,111,115,105,110,103,32,115,111,117,110,100,115,0,0,0,0,0,0,0,0,82,82,79,67,75,49,57,0,32,32,32,32,83,68,76,95,71,76,95,83,84,69,78,67,73,76,95,83,73,90,69,58,32,37,105,10,0,0,0,0,109,117,115,95,101,51,109,57,0,0,0,0,0,0,0,0,99,111,109,112,95,115,107,117,108,108,0,0,0,0,0,0,82,82,79,67,75,49,51,0,97,108,108,111,119,95,112,117,115,104,101,114,115,0,0,0,101,51,109,56,46,109,112,51,0,0,0,0,0,0,0,0,76,111,115,116,32,115,111,117,108,115,32,103,101,116,32,115,116,117,99,107,32,98,101,104,105,110,100,32,119,97,108,108,115,0,0,0,0,0,0,0,83,80,79,83,0,0,0,0,82,82,79,67,75,49,55,0,83,84,82,65,70,69,0,0,118,105,99,116,111,114,0,0,80,117,98,108,105,99,32,68,79,79,77,0,0,0,0,0,80,95,71,101,116,78,111,100,101,115,86,101,114,115,105,111,110,58,32,117,115,105,110,103,32,110,111,114,109,97,108,32,66,83,80,32,110,111,100,101,115,10,0,0,0,0,0,0,109,117,115,95,101,51,109,56,0,0,0,0,0,0,0,0,80,105,99,107,101,100,32,117,112,32,97,32,115,116,105,109,112,97,99,107,46,0,0,0,99,111,109,112,95,112,97,105,110,0,0,0,0,0,0,0,105,100,99,108,101,118,0,0,82,82,79,67,75,48,55,0,109,117,115,95,101,51,109,55,0,0,0,0,0,0,0,0,80,97,105,110,32,69,108,101,109,101,110,116,97,108,115,32,108,105,109,105,116,101,100,32,116,111,32,50,49,32,108,111,115,116,32,115,111,117,108,115,0,0,0,0,0,0,0,0,82,82,79,67,75,49,52,0,71,95,68,111,76,111,97,100,71,97,109,101,58,32,73,110,99,111,109,112,97,116,105,98,108,101,32,115,97,118,101,103,97,109,101,10,0,0,0,0,71,95,68,101,97,116,104,77,97,116,99,104,83,112,97,119,110,80,108,97,121,101,114,58,32,79,110,108,121,32,37,105,32,100,101,97,116,104,109,97,116,99,104,32,115,112,111,116,115,44,32,37,100,32,114,101,113,117,105,114,101,100,0,0,85,67,76,0,0,0,0,0,109,117,115,95,101,51,109,54,0,0,0,0,0,0,0,0,99,111,109,112,95,118,105,108,101,0,0,0,0,0,0,0,83,76,73,77,69,49,54,0,109,117,115,95,101,51,109,53,0,0,0,0,0,0,0,0,65,114,99,104,45,86,105,108,101,32,114,101,115,117,114,114,101,99,116,115,32,105,110,118,105,110,99,105,98,108,101,32,103,104,111,115,116,115,0,0,77,70,76,82,56,95,51,0,109,117,115,95,101,51,109,52,0,0,0,0,0,0,0,0,99,111,109,112,95,112,117,114,115,117,105,116,0,0,0,0,77,70,76,82,56,95,52,0,112,114,101,115,115,32,97,32,107,101,121,46,0,0,0,0,101,51,109,51,46,109,112,51,0,0,0,0,0,0,0,0,77,111,110,115,116,101,114,115,32,100,111,110,39,116,32,103,105,118,101,32,117,112,32,112,117,114,115,117,105,116,32,111,102,32,116,97,114,103,101,116,115,0,0,0,0,0,0,0,83,70,76,82,54,95,49,0,109,117,115,95,101,51,109,51,0,0,0,0,0,0,0,0,99,111,109,112,95,100,111,111,114,115,116,117,99,107,0,0,70,76,79,79,82,52,95,56,0,0,0,0,0,0,0,0,101,51,109,50,46,109,112,51,0,0,0,0,0,0,0,0,77,111,110,115,116,101,114,115,32,103,101,116,32,115,116,117,99,107,32,111,110,32,100,111,111,114,116,114,97,99,107,115,0,0,0,0,0,0,0,0,79,85,82,32,72,69,82,79,0,0,0,0,0,0,0,0,32,32,32,32,83,68,76,95,71,76,95,66,76,85,69,95,83,73,90,69,58,32,37,105,10,0,0,0,0,0,0,0,109,117,115,95,101,51,109,50,0,0,0,0,0,0,0,0,99,111,109,112,95,115,116,97,121,108,105,102,116,0,0,0,84,72,69,32,67,89,66,69,82,68,69,77,79,78,0,0,73,39,109,32,79,75,46,0,104,101,108,112,95,102,114,105,101,110,100,115,0,0,0,0,109,117,115,95,101,51,109,49,0,0,0,0,0,0,0,0,77,111,110,115,116,101,114,115,32,114,97,110,100,111,109,108,121,32,119,97,108,107,32,111,102,102,32,111,102,32,109,111,118,105,110,103,32,108,105,102,116,115,0,0,0,0,0,0,80,79,83,83,0,0,0,0,84,72,69,32,83,80,73,68,69,82,32,77,65,83,84,69,82,77,73,78,68,0,0,0,83,84,82,65,70,69,32,82,73,71,72,84,0,0,0,0,98,117,110,110,121,0,0,0,68,79,79,77,32,50,58,32,72,101,108,108,32,111,110,32,69,97,114,116,104,0,0,0,80,95,71,101,116,78,111,100,101,115,86,101,114,115,105,111,110,58,32,118,101,114,115,105,111,110,32,53,32,110,111,100,101,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,10,0,0,0,0,0,0,0,101,51,109,49,46,109,112,51,0,0,0,0,0,0,0,0,80,105,99,107,101,100,32,117,112,32,97,110,32,97,114,109,111,114,32,98,111,110,117,115,46,0,0,0,0,0,0,0,99,111,109,112,95,102,97,108,108,111,102,102,0,0,0,0,66,69,72,79,76,68,32,109,101,110,117,0,0,0,0,0,65,82,67,72,45,86,73,76,69,0,0,0,0,0,0,0,109,117,115,95,101,50,109,57,0,0,0,0,0,0,0,0,79,98,106,101,99,116,115,32,100,111,110,39,116,32,102,97,108,108,32,117,110,100,101,114,32,116,104,101,105,114,32,111,119,110,32,119,101,105,103,104,116,0,0,0,0,0,0,0,77,65,78,67,85,66,85,83,0,0,0,0,0,0,0,0,10,65,114,101,32,121,111,117,32,115,117,114,101,63,0,0,66,79,88,37,99,37,99,0,101,50,109,56,46,109,112,51,0,0,0,0,0,0,0,0,99,111,109,112,95,100,114,111,112,111,102,102,0,0,0,0,69,86,95,86,101,114,116,105,99,97,108,68,111,111,114,58,32,117,110,107,110,111,119,110,32,116,104,105,110,107,101,114,46,102,117,110,99,116,105,111,110,32,105,110,32,116,104,105,110,107,101,114,32,99,111,114,114,117,112,116,105,111,110,32,101,109,117,108,97,116,105,111,110,0,0,0,0,0,0,0,82,69,86,69,78,65,78,84,0,0,0,0,0,0,0,0,109,117,115,95,101,50,109,56,0,0,0,0,0,0,0,0,83,111,109,101,32,111,98,106,101,99,116,115,32,110,101,118,101,114,32,104,97,110,103,32,111,118,101,114,32,116,97,108,108,32,108,101,100,103,101,115,0,0,0,0,0,0,0,0,80,65,73,78,32,69,76,69,77,69,78,84,65,76,0,0,101,50,109,55,46,109,112,51,0,0,0,0,0,0,0,0,99,111,109,112,95,116,101,108,101,102,114,97,103,0,0,0,65,82,65,67,72,78,79,84,82,79,78,0,0,0,0,0,109,117,115,95,101,50,109,55,0,0,0,0,0,0,0,0,65,110,121,32,109,111,110,115,116,101,114,32,99,97,110,32,116,101,108,101,102,114,97,103,32,111,110,32,77,65,80,51,48,0,0,0,0,0,0,0,66,65,82,79,78,32,79,70,32,72,69,76,76,0,0,0,101,50,109,54,46,109,112,51,0,0,0,0,0,0,0,0,77,95,71,69,78,69,82,76,0,0,0,0,0,0,0,0,72,69,76,76,32,75,78,73,71,72,84,0,0,0,0,0,80,76,65,89,80,65,76,0,109,117,115,95,101,50,109,54,0,0,0,0,0,0,0,0,102,108,97,115,104,105,110,103,95,104,111,109,0,0,0,0,67,65,67,79,68,69,77,79,78,0,0,0,0,0,0,0,32,32,32,32,83,68,76,95,71,76,95,71,82,69,69,78,95,83,73,90,69,58,32,37,105,10,0,0,0,0,0,0,109,117,115,95,101,50,109,53,0,0,0,0,0,0,0,0,70,108,97,115,104,105,110,103,32,72,79,77,32,105,110,100,105,99,97,116,111,114,0,0,76,79,83,84,32,83,79,85,76,0,0,0,0,0,0,0,109,111,110,115,116,101,114,95,102,114,105,99,116,105,111,110,0,0,0,0,0,0,0,0,101,50,109,52,46,109,112,51,0,0,0,0,0,0,0,0,112,97,116,99,104,95,101,100,103,101,115,0,0,0,0,0,80,76,65,89,0,0,0,0,68,69,77,79,78,0,0,0,83,84,82,65,70,69,32,76,69,70,84,0,0,0,0,0,105,110,116,114,111,0,0,0,68,79,79,77,32,50,58,32,84,78,84,32,45,32,69,118,105,108,117,116,105,111,110,0,80,95,71,101,116,78,111,100,101,115,86,101,114,115,105,111,110,58,32,102,111,117,110,100,32,118,101,114,115,105,111,110,32,53,32,110,111,100,101,115,10,0,0,0,0,0,0,0,109,117,115,95,101,50,109,52,0,0,0,0,0,0,0,0,80,105,99,107,101,100,32,117,112,32,97,32,104,101,97,108,116,104,32,98,111,110,117,115,46,0,0,0,0,0,0,0,68,114,97,119,105,110,103,32,111,102,32,112,97,116,99,104,32,101,100,103,101,115,0,0,105,100,98,101,104,111,108,100,0,0,0,0,0,0,0,0,83,73,78,69,84,65,66,76,0,0,0,0,0,0,0,0,73,77,80,0,0,0,0,0,101,50,109,51,46,109,112,51,0,0,0,0,0,0,0,0,115,112,114,105,116,101,95,101,100,103,101,115,0,0,0,0,72,69,65,86,89,32,87,69,65,80,79,78,32,68,85,68,69,0,0,0,0,0,0,0,87,97,100,115,32,101,120,112,101,99,116,101,100,58,10,10,0,0,0,0,0,0,0,0,83,84,66,82,37,46,51,100,0,0,0,0,0,0,0,0,109,117,115,95,101,50,109,51,0,0,0,0,0,0,0,0,68,114,97,119,105,110,103,32,111,102,32,115,112,114,105,116,101,32,101,100,103,101,115,0,83,72,79,84,71,85,78,32,71,85,89,0,0,0,0,0,101,50,109,50,46,109,112,51,0,0,0,0,0,0,0,0,102,105,108,116,101,114,95,122,0,0,0,0,0,0,0,0,90,79,77,66,73,69,77,65,78,0,0,0,0,0,0,0,109,117,115,95,101,50,109,50,0,0,0,0,0,0,0,0,70,105,108,116,101,114,32,102,111,114,32,108,105,103,104,116,105,110,103,0,0,0,0,0,84,105,109,101,32,102,111,114,32,97,32,118,97,99,97,116,105,111,110,46,32,89,111,117,39,118,101,32,98,117,114,115,116,32,116,104,101,10,98,111,119,101,108,115,32,111,102,32,104,101,108,108,32,97,110,100,32,98,121,32,103,111,108,108,121,32,121,111,117,39,114,101,32,114,101,97,100,121,10,102,111,114,32,97,32,98,114,101,97,107,46,32,89,111,117,32,109,117,116,116,101,114,32,116,111,32,121,111,117,114,115,101,108,102,44,10,77,97,121,98,101,32,115,111,109,101,111,110,101,32,101,108,115,101,32,99,97,110,32,107,105,99,107,32,72,101,108,108,39,115,32,97,115,115,10,110,101,120,116,32,116,105,109,101,32,97,114,111,117,110,100,46,32,65,104,101,97,100,32,108,105,101,115,32,97,32,113,117,105,101,116,32,116,111,119,110,44,10,119,105,116,104,32,112,101,97,99,101,102,117,108,32,102,108,111,119,105,110,103,32,119,97,116,101,114,44,32,113,117,97,105,110,116,10,98,117,105,108,100,105,110,103,115,44,32,97,110,100,32,112,114,101,115,117,109,97,98,108,121,32,110,111,32,72,101,108,108,115,112,97,119,110,46,10,10,65,115,32,121,111,117,32,115,116,101,112,32,111,102,102,32,116,104,101,32,116,114,97,110,115,112,111,114,116,44,32,121,111,117,32,104,101,97,114,10,116,104,101,32,115,116,111,109,112,32,111,102,32,97,32,99,121,98,101,114,100,101,109,111,110,39,115,32,105,114,111,110,32,115,104,111,101,46,0,0,0,0,0,0,0,101,50,109,49,46,109,112,51,0,0,0,0,0,0,0,0,102,105,108,116,101,114,95,112,97,116,99,104,0,0,0,0,87,104,97,116,32,110,111,119,63,32,76,111,111,107,115,32,116,111,116,97,108,108,121,32,100,105,102,102,101,114,101,110,116,46,32,75,105,110,100,10,111,102,32,108,105,107,101,32,75,105,110,103,32,84,117,116,39,115,32,99,111,110,100,111,46,32,87,101,108,108,44,10,119,104,97,116,101,118,101,114,39,115,32,104,101,114,101,32,99,97,110,39,116,32,98,101,32,97,110,121,32,119,111,114,115,101,10,116,104,97,110,32,117,115,117,97,108,46,32,67,97,110,32,105,116,63,32,32,79,114,32,109,97,121,98,101,32,105,116,39,115,32,98,101,115,116,10,116,111,32,108,101,116,32,115,108,101,101,112,105,110,103,32,103,111,100,115,32,108,105,101,46,46,0,0,0,83,84,84,78,85,77,37,100,0,0,0,0,0,0,0,0,109,117,115,95,101,50,109,49,0,0,0,0,0,0,0,0,70,105,108,116,101,114,32,102,111,114,32,112,97,116,99,104,101,115,0,0,0,0,0,0,83,117,100,100,101,110,108,121,44,32,97,108,108,32,105,115,32,115,105,108,101,110,116,44,32,102,114,111,109,32,111,110,101,32,104,111,114,105,122,111,110,10,116,111,32,116,104,101,32,111,116,104,101,114,46,32,84,104,101,32,97,103,111,110,105,122,105,110,103,32,101,99,104,111,32,111,102,32,72,101,108,108,10,102,97,100,101,115,32,97,119,97,121,44,32,116,104,101,32,110,105,103,104,116,109,97,114,101,32,115,107,121,32,116,117,114,110,115,32,116,111,10,98,108,117,101,44,32,116,104,101,32,104,101,97,112,115,32,111,102,32,109,111,110,115,116,101,114,32,99,111,114,112,115,101,115,32,115,116,97,114,116,32,10,116,111,32,101,118,97,112,111,114,97,116,101,32,97,108,111,110,103,32,119,105,116,104,32,116,104,101,32,101,118,105,108,32,115,116,101,110,99,104,32,10,116,104,97,116,32,102,105,108,108,101,100,32,116,104,101,32,97,105,114,46,32,74,101,101,122,101,44,32,109,97,121,98,101,32,121,111,117,39,118,101,10,100,111,110,101,32,105,116,46,32,72,97,118,101,32,121,111,117,32,114,101,97,108,108,121,32,119,111,110,63,10,10,83,111,109,101,116,104,105,110,103,32,114,117,109,98,108,101,115,32,105,110,32,116,104,101,32,100,105,115,116,97,110,99,101,46,10,65,32,98,108,117,101,32,108,105,103,104,116,32,98,101,103,105,110,115,32,116,111,32,103,108,111,119,32,105,110,115,105,100,101,32,116,104,101,10,114,117,105,110,101,100,32,115,107,117,108,108,32,111,102,32,116,104,101,32,100,101,109,111,110,45,115,112,105,116,116,101,114,46,0,0,0,0,0,0,0,101,49,109,57,46,109,112,51,0,0,0,0,0,0,0,0,102,105,108,116,101,114,95,115,112,114,105,116,101,0,0,0,84,104,101,32,118,105,115,116,97,32,111,112,101,110,105,110,103,32,97,104,101,97,100,32,108,111,111,107,115,32,114,101,97,108,32,100,97,109,110,10,102,97,109,105,108,105,97,114,46,32,83,109,101,108,108,115,32,102,97,109,105,108,105,97,114,44,32,116,111,111,32,45,45,32,108,105,107,101,10,102,114,105,101,100,32,101,120,99,114,101,109,101,110,116,46,32,89,111,117,32,100,105,100,110,39,116,32,108,105,107,101,32,116,104,105,115,10,112,108,97,99,101,32,98,101,102,111,114,101,44,32,97,110,100,32,121,111,117,32,115,117,114,101,32,97,115,32,104,101,108,108,32,97,105,110,39,116,10,112,108,97,110,110,105,110,103,32,116,111,32,108,105,107,101,32,105,116,32,110,111,119,46,32,84,104,101,32,109,111,114,101,32,121,111,117,10,98,114,111,111,100,32,111,110,32,105,116,44,32,116,104,101,32,109,97,100,100,101,114,32,121,111,117,32,103,101,116,46,10,72,101,102,116,105,110,103,32,121,111,117,114,32,103,117,110,44,32,97,110,32,101,118,105,108,32,103])
.concat([114,105,110,32,116,114,105,99,107,108,101,115,10,111,110,116,111,32,121,111,117,114,32,102,97,99,101,46,32,84,105,109,101,32,116,111,32,116,97,107,101,32,115,111,109,101,32,110,97,109,101,115,46,0,0,0,32,32,32,32,83,68,76,95,71,76,95,82,69,68,95,83,73,90,69,58,32,37,105,10,0,0,0,0,0,0,0,0,109,117,115,95,101,49,109,57,0,0,0,0,0,0,0,0,70,105,108,116,101,114,32,102,111,114,32,115,112,114,105,116,101,115,0,0,0,0,0,0,89,111,117,32,104,101,97,114,32,116,104,101,32,103,114,105,110,100,105,110,103,32,111,102,32,104,101,97,118,121,32,109,97,99,104,105,110,101,114,121,10,97,104,101,97,100,46,32,32,89,111,117,32,115,117,114,101,32,104,111,112,101,32,116,104,101,121,39,114,101,32,110,111,116,32,115,116,97,109,112,105,110,103,10,111,117,116,32,110,101,119,32,104,101,108,108,115,112,97,119,110,44,32,98,117,116,32,121,111,117,39,114,101,32,114,101,97,100,121,32,116,111,10,114,101,97,109,32,111,117,116,32,97,32,119,104,111,108,101,32,104,101,114,100,32,105,102,32,121,111,117,32,104,97,118,101,32,116,111,46,10,84,104,101,121,32,109,105,103,104,116,32,98,101,32,112,108,97,110,110,105,110,103,32,97,32,98,108,111,111,100,32,102,101,97,115,116,44,32,98,117,116,10,121,111,117,32,102,101,101,108,32,97,98,111,117,116,32,97,115,32,109,101,97,110,32,97,115,32,116,119,111,32,116,104,111,117,115,97,110,100,10,109,97,110,105,97,99,115,32,112,97,99,107,101,100,32,105,110,116,111,32,111,110,101,32,109,97,100,32,107,105,108,108,101,114,46,10,10,89,111,117,32,100,111,110,39,116,32,112,108,97,110,32,116,111,32,103,111,32,100,111,119,110,32,101,97,115,121,46,0,0,109,111,110,107,101,121,115,0,101,49,109,56,46,109,112,51,0,0,0,0,0,0,0,0,102,105,108,116,101,114,95,102,108,111,111,114,0,0,0,0,73,70,79,71,0,0,0,0,83,87,73,84,67,72,69,83,0,0,0,0,0,0,0,0,89,111,117,39,118,101,32,102,111,117,103,104,116,32,121,111,117,114,32,119,97,121,32,111,117,116,32,111,102,32,116,104,101,32,105,110,102,101,115,116,101,100,10,101,120,112,101,114,105,109,101,110,116,97,108,32,108,97,98,115,46,32,32,32,73,116,32,115,101,101,109,115,32,116,104,97,116,32,85,65,67,32,104,97,115,10,111,110,99,101,32,97,103,97,105,110,32,103,117,108,112,101,100,32,105,116,32,100,111,119,110,46,32,32,87,105,116,104,32,116,104,101,105,114,10,104,105,103,104,32,116,117,114,110,111,118,101,114,44,32,105,116,32,109,117,115,116,32,98,101,32,104,97,114,100,32,102,111,114,32,112,111,111,114,10,111,108,100,32,85,65,67,32,116,111,32,98,117,121,32,99,111,114,112,111,114,97,116,101,32,104,101,97,108,116,104,32,105,110,115,117,114,97,110,99,101,10,110,111,119,97,100,97,121,115,46,46,10,10,65,104,101,97,100,32,108,105,101,115,32,116,104,101,32,109,105,108,105,116,97,114,121,32,99,111,109,112,108,101,120,44,32,110,111,119,10,115,119,97,114,109,105,110,103,32,119,105,116,104,32,100,105,115,101,97,115,101,100,32,104,111,114,114,111,114,115,32,104,111,116,32,116,111,32,103,101,116,10,116,104,101,105,114,32,116,101,101,116,104,32,105,110,116,111,32,121,111,117,46,32,87,105,116,104,32,108,117,99,107,44,32,116,104,101,10,99,111,109,112,108,101,120,32,115,116,105,108,108,32,104,97,115,32,115,111,109,101,32,119,97,114,108,105,107,101,32,111,114,100,110,97,110,99,101,10,108,97,121,105,110,103,32,97,114,111,117,110,100,46,0,0,0,82,85,78,0,0,0,0,0,105,110,116,101,114,0,0,0,68,79,79,77,32,50,58,32,80,108,117,116,111,110,105,97,32,69,120,112,101,114,105,109,101,110,116,0,0,0,0,0,80,95,71,101,116,78,111,100,101,115,86,101,114,115,105,111,110,58,32,118,101,114,115,105,111,110,32,52,32,110,111,100,101,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,10,0,0,0,0,0,0,0,109,117,115,95,101,49,109,56,0,0,0,0,0,0,0,0,80,105,99,107,101,100,32,117,112,32,116,104,101,32,77,101,103,97,65,114,109,111,114,33,0,0,0,0,0,0,0,0,70,105,108,116,101,114,32,102,111,114,32,102,108,111,111,114,115,47,99,101,105,108,105,110,103,115,0,0,0,0,0,0,76,105,116,101,45,65,109,112,32,71,111,103,103,108,101,115,0,0,0,0,0,0,0,0,66,101,116,99,104,97,32,119,111,110,100,101,114,101,100,32,106,117,115,116,32,119,104,97,116,32,87,65,83,32,116,104,101,32,104,97,114,100,101,115,116,10,108,101,118,101,108,32,119,101,32,104,97,100,32,114,101,97,100,121,32,102,111,114,32,121,97,63,32,32,78,111,119,32,121,111,117,32,107,110,111,119,46,10,78,111,32,111,110,101,32,103,101,116,115,32,111,117,116,32,97,108,105,118,101,46,0,0,0,0,0,0,101,49,109,55,46,109,112,51,0,0,0,0,0,0,0,0,102,105,108,116,101,114,95,119,97,108,108,0,0,0,0,0,89,111,117,39,118,101,32,102,111,117,110,100,32,116,104,101,32,115,101,99,111,110,100,45,104,97,114,100,101,115,116,32,108,101,118,101,108,32,119,101,10,103,111,116,46,32,72,111,112,101,32,121,111,117,32,104,97,118,101,32,97,32,115,97,118,101,100,32,103,97,109,101,32,97,32,108,101,118,101,108,32,111,114,10,116,119,111,32,112,114,101,118,105,111,117,115,46,32,32,73,102,32,110,111,116,44,32,98,101,32,112,114,101,112,97,114,101,100,32,116,111,32,100,105,101,10,97,112,108,101,110,116,121,46,32,70,111,114,32,109,97,115,116,101,114,32,109,97,114,105,110,101,115,32,111,110,108,121,46,0,73,110,99,111,109,112,97,116,105,98,108,101,32,83,97,118,101,103,97,109,101,33,33,33,10,0,0,0,0,0,0,0,83,84,67,70,78,48,57,51,0,0,0,0,0,0,0,0,109,117,115,95,101,49,109,55,0,0,0,0,0,0,0,0,70,105,108,116,101,114,32,102,111,114,32,119,97,108,108,115,0,0,0,0,0,0,0,0,84,104,101,32,71,97,116,101,107,101,101,112,101,114,39,115,32,101,118,105,108,32,102,97,99,101,32,105,115,32,115,112,108,97,116,116,101,114,101,100,10,97,108,108,32,111,118,101,114,32,116,104,101,32,112,108,97,99,101,46,32,32,65,115,32,105,116,115,32,116,97,116,116,101,114,101,100,32,99,111,114,112,115,101,10,99,111,108,108,97,112,115,101,115,44,32,97,110,32,105,110,118,101,114,116,101,100,32,71,97,116,101,32,102,111,114,109,115,32,97,110,100,10,115,117,99,107,115,32,100,111,119,110,32,116,104,101,32,115,104,97,114,100,115,32,111,102,32,116,104,101,32,108,97,115,116,10,112,114,111,116,111,116,121,112,101,32,65,99,99,101,108,101,114,97,116,111,114,44,32,110,111,116,32,116,111,32,109,101,110,116,105,111,110,32,116,104,101,10,102,101,119,32,114,101,109,97,105,110,105,110,103,32,100,101,109,111,110,115,46,32,32,89,111,117,39,114,101,32,100,111,110,101,46,32,72,101,108,108,10,104,97,115,32,103,111,110,101,32,98,97,99,107,32,116,111,32,112,111,117,110,100,105,110,103,32,98,97,100,32,100,101,97,100,32,102,111,108,107,115,32,10,105,110,115,116,101,97,100,32,111,102,32,103,111,111,100,32,108,105,118,101,32,111,110,101,115,46,32,32,82,101,109,101,109,98,101,114,32,116,111,10,116,101,108,108,32,121,111,117,114,32,103,114,97,110,100,107,105,100,115,32,116,111,32,112,117,116,32,97,32,114,111,99,107,101,116,10,108,97,117,110,99,104,101,114,32,105,110,32,121,111,117,114,32,99,111,102,102,105,110,46,32,73,102,32,121,111,117,32,103,111,32,116,111,32,72,101,108,108,10,119,104,101,110,32,121,111,117,32,100,105,101,44,32,121,111,117,39,108,108,32,110,101,101,100,32,105,116,32,102,111,114,32,115,111,109,101,10,102,105,110,97,108,32,99,108,101,97,110,105,110,103,45,117,112,32,46,46,46,0,0,0,0,101,49,109,54,46,109,112,51,0,0,0,0,0,0,0,0,82,101,110,100,101,114,101,114,32,115,101,116,116,105,110,103,115,0,0,0,0,0,0,0,89,111,117,39,118,101,32,98,97,115,104,101,100,32,97,110,100,32,98,97,116,116,101,114,101,100,32,121,111,117,114,32,119,97,121,32,105,110,116,111,10,116,104,101,32,104,101,97,114,116,32,111,102,32,116,104,101,32,100,101,118,105,108,45,104,105,118,101,46,32,32,84,105,109,101,32,102,111,114,32,97,10,83,101,97,114,99,104,45,97,110,100,45,68,101,115,116,114,111,121,32,109,105,115,115,105,111,110,44,32,97,105,109,101,100,32,97,116,32,116,104,101,10,71,97,116,101,107,101,101,112,101,114,44,32,119,104,111,115,101,32,102,111,117,108,32,111,102,102,115,112,114,105,110,103,32,105,115,10,99,97,115,99,97,100,105,110,103,32,116,111,32,69,97,114,116,104,46,32,32,89,101,97,104,44,32,104,101,39,115,32,98,97,100,46,32,66,117,116,10,121,111,117,32,107,110,111,119,32,119,104,111,39,115,32,119,111,114,115,101,33,10,10,71,114,105,110,110,105,110,103,32,101,118,105,108,108,121,44,32,121,111,117,32,99,104,101,99,107,32,121,111,117,114,32,103,101,97,114,44,32,97,110,100,10,103,101,116,32,114,101,97,100,121,32,116,111,32,103,105,118,101,32,116,104,101,32,98,97,115,116,97,114,100,32,97,32,108,105,116,116,108,101,32,72,101,108,108,10,111,102,32,121,111,117,114,32,111,119,110,32,109,97,107,105,110,103,33,0,0,0,0,0,0,0,0,109,117,115,95,101,49,109,54,0,0,0,0,0,0,0,0,100,101,102,97,117,108,116,95,115,107,105,108,108,0,0,0,69,118,101,110,32,116,104,101,32,100,101,97,100,108,121,32,65,114,99,104,45,86,105,108,101,32,108,97,98,121,114,105,110,116,104,32,99,111,117,108,100,10,110,111,116,32,115,116,111,112,32,121,111,117,44,32,97,110,100,32,121,111,117,39,118,101,32,103,111,116,116,101,110,32,116,111,32,116,104,101,10,112,114,111,116,111,116,121,112,101,32,65,99,99,101,108,101,114,97,116,111,114,32,119,104,105,99,104,32,105,115,32,115,111,111,110,10,101,102,102,105,99,105,101,110,116,108,121,32,97,110,100,32,112,101,114,109,97,110,101,110,116,108,121,32,100,101,97,99,116,105,118,97,116,101,100,46,10,10,89,111,117,39,114,101,32,103,111,111,100,32,97,116,32,116,104,97,116,32,107,105,110,100,32,111,102,32,116,104,105,110,103,46,0,0,0,0,0,0,0,80,95,83,112,97,119,110,77,97,112,84,104,105,110,103,58,32,99,111,114,114,101,99,116,105,110,103,32,98,97,100,32,102,108,97,103,115,32,40,37,117,41,32,40,116,104,105,110,103,32,116,121,112,101,32,37,100,41,10,0,0,0,0,0,101,49,109,53,46,109,112,51,0,0,0,0,0,0,0,0,68,101,102,97,117,108,116,32,115,107,105,108,108,32,108,101,118,101,108,0,0,0,0,0,89,111,117,32,103,108,111,97,116,32,111,118,101,114,32,116,104,101,32,115,116,101,97,109,105,110,103,32,99,97,114,99,97,115,115,32,111,102,32,116,104,101,10,71,117,97,114,100,105,97,110,46,32,32,87,105,116,104,32,105,116,115,32,100,101,97,116,104,44,32,121,111,117,39,118,101,32,119,114,101,115,116,101,100,10,116,104,101,32,65,99,99,101,108,101,114,97,116,111,114,32,102,114,111,109,32,116,104,101,32,115,116,105,110,107,105,110,103,32,99,108,97,119,115,10,111,102,32,72,101,108,108,46,32,32,89,111,117,32,114,101,108,97,120,32,97,110,100,32,103,108,97,110,99,101,32,97,114,111,117,110,100,32,116,104,101,10,114,111,111,109,46,32,32,68,97,109,110,33,32,32,84,104,101,114,101,32,119,97,115,32,115,117,112,112,111,115,101,100,32,116,111,32,98,101,32,97,116,10,108,101,97,115,116,32,111,110,101,32,119,111,114,107,105,110,103,32,112,114,111,116,111,116,121,112,101,44,32,98,117,116,32,121,111,117,32,99,97,110,39,116,10,115,101,101,32,105,116,46,32,84,104,101,32,100,101,109,111,110,115,32,109,117,115,116,32,104,97,118,101,32,116,97,107,101,110,32,105,116,46,10,10,89,111,117,32,109,117,115,116,32,102,105,110,100,32,116,104,101,32,112,114,111,116,111,116,121,112,101,44,32,111,114,32,97,108,108,32,121,111,117,114,10,115,116,114,117,103,103,108,101,115,32,119,105,108,108,32,104,97,118,101,32,98,101,101,110,32,119,97,115,116,101,100,46,32,75,101,101,112,10,109,111,118,105,110,103,44,32,107,101,101,112,32,102,105,103,104,116,105,110,103,44,32,107,101,101,112,32,107,105,108,108,105,110,103,46,10,79,104,32,121,101,115,44,32,107,101,101,112,32,108,105,118,105,110,103,44,32,116,111,111,46,0,0,0,0,0,0,0,109,117,115,95,101,49,109,53,0,0,0,0,0,0,0,0,100,101,109,111,95,115,109,111,111,116,104,116,117,114,110,115,102,97,99,116,111,114,0,0,67,79,78,71,82,65,84,85,76,65,84,73,79,78,83,44,32,89,79,85,39,86,69,32,70,79,85,78,68,32,84,72,69,10,83,85,80,69,82,32,83,69,67,82,69,84,32,76,69,86,69,76,33,32,32,89,79,85,39,68,32,66,69,84,84,69,82,10,66,76,65,90,69,32,84,72,82,79,85,71,72,32,84,72,73,83,32,79,78,69,33,10,0,0,0,0,101,49,109,52,46,109,112,51,0,0,0,0,0,0,0,0,83,109,111,111,116,104,32,68,101,109,111,32,80,108,97,121,98,97,99,107,32,70,97,99,116,111,114,0,0,0,0,0,67,79,78,71,82,65,84,85,76,65,84,73,79,78,83,44,32,89,79,85,39,86,69,32,70,79,85,78,68,32,84,72,69,32,83,69,67,82,69,84,10,76,69,86,69,76,33,32,76,79,79,75,83,32,76,73,75,69,32,73,84,39,83,32,66,69,69,78,32,66,85,73,76,84,32,66,89,10,72,85,77,65,78,83,44,32,82,65,84,72,69,82,32,84,72,65,78,32,68,69,77,79,78,83,46,32,89,79,85,32,87,79,78,68,69,82,10,87,72,79,32,84,72,69,32,73,78,77,65,84,69,83,32,79,70,32,84,72,73,83,32,67,79,82,78,69,82,32,79,70,32,72,69,76,76,10,87,73,76,76,32,66,69,46,0,0,0,0,83,68,76,32,79,112,101,110,71,76,32,80,105,120,101,108,70,111,114,109,97,116,58,10,0,0,0,0,0,0,0,0,109,117,115,95,101,49,109,52,0,0,0,0,0,0,0,0,82,95,73,110,105,116,84,101,120,116,117,114,101,115,58,32,37,100,32,101,114,114,111,114,115,0,0,0,0,0,0,0,100,101,109,111,95,115,109,111,111,116,104,116,117,114,110,115,0,0,0,0,0,0,0,0,84,72,69,32,72,79,82,82,69,78,68,79,85,83,32,86,73,83,65,71,69,32,79,70,32,84,72,69,32,66,73,71,71,69,83,84,10,68,69,77,79,78,32,89,79,85,39,86,69,32,69,86,69,82,32,83,69,69,78,32,67,82,85,77,66,76,69,83,32,66,69,70,79,82,69,10,89,79,85,44,32,65,70,84,69,82,32,89,79,85,32,80,85,77,80,32,89,79,85,82,32,82,79,67,75,69,84,83,32,73,78,84,79,10,72,73,83,32,69,88,80,79,83,69,68,32,66,82,65,73,78,46,32,84,72,69,32,77,79,78,83,84,69,82,32,83,72,82,73,86,69,76,83,10,85,80,32,65,78,68,32,68,73,69,83,44,32,73,84,83,32,84,72,82,65,83,72,73,78,71,32,76,73,77,66,83,10,68,69,86,65,83,84,65,84,73,78,71,32,85,78,84,79,76,68,32,77,73,76,69,83,32,79,70,32,72,69,76,76,39,83,10,83,85,82,70,65,67,69,46,10,10,89,79,85,39,86,69,32,68,79,78,69,32,73,84,46,32,84,72,69,32,73,78,86,65,83,73,79,78,32,73,83,32,79,86,69,82,46,10,69,65,82,84,72,32,73,83,32,83,65,86,69,68,46,32,72,69,76,76,32,73,83,32,65,32,87,82,69,67,75,46,32,89,79,85,10,87,79,78,68,69,82,32,87,72,69,82,69,32,66,65,68,32,70,79,76,75,83,32,87,73,76,76,32,71,79,32,87,72,69,78,32,84,72,69,89,10,68,73,69,44,32,78,79,87,46,32,87,73,80,73,78,71,32,84,72,69,32,83,87,69,65,84,32,70,82,79,77,32,89,79,85,82,10,70,79,82,69,72,69,65,68,32,89,79,85,32,66,69,71,73,78,32,84,72,69,32,76,79,78,71,32,84,82,69,75,32,66,65,67,75,10,72,79,77,69,46,32,82,69,66,85,73,76,68,73,78,71,32,69,65,82,84,72,32,79,85,71,72,84,32,84,79,32,66,69,32,65,10,76,79,84,32,77,79,82,69,32,70,85,78,32,84,72,65,78,32,82,85,73,78,73,78,71,32,73,84,32,87,65,83,46,10,0,0,109,111,110,115,116,101,114,95,97,118,111,105,100,95,104,97,122,97,114,100,115,0,0,0,101,49,109,51,46,109,112,51,0,0,0,0,0,0,0,0,83,109,111,111,116,104,32,68,101,109,111,32,80,108,97,121,98,97,99,107,0,0,0,0,84,70,79,71,0,0,0,0,89,79,85,32,65,82,69,32,65,84,32,84,72,69,32,67,79,82,82,85,80,84,32,72,69,65,82,84,32,79,70,32,84,72,69,32,67,73,84,89,44,10,83,85,82,82,79,85,78,68,69,68,32,66,89,32,84,72,69,32,67,79,82,80,83,69,83,32,79,70,32,89,79,85,82,32,69,78,69,77,73,69,83,46,10,89,79,85,32,83,69,69,32,78,79,32,87,65,89,32,84,79,32,68,69,83,84,82,79,89,32,84,72,69,32,67,82,69,65,84,85,82,69,83,39,10,69,78,84,82,89,87,65,89,32,79,78,32,84,72,73,83,32,83,73,68,69,44,32,83,79,32,89,79,85,32,67,76,69,78,67,72,32,89,79,85,82,10,84,69,69,84,72,32,65,78,68,32,80,76,85,78,71,69,32,84,72,82,79,85,71,72,32,73,84,46,10,10,84,72,69,82,69,32,77,85,83,84,32,66,69,32,65,32,87,65,89,32,84,79,32,67,76,79,83,69,32,73,84,32,79,78,32,84,72,69,10,79,84,72,69,82,32,83,73,68,69,46,32,87,72,65,84,32,68,79,32,89,79,85,32,67,65,82,69,32,73,70,32,89,79,85,39,86,69,10,71,79,84,32,84,79,32,71,79,32,84,72,82,79,85,71,72,32,72,69,76,76,32,84,79,32,71,69,84,32,84,79,32,73,84,63,0,0,0,0,0,0,0,0,84,85,82,78,32,82,73,71,72,84,0,0,0,0,0,0,101,51,109,57,0,0,0,0,68,79,79,77,32,82,101,103,105,115,116,101,114,101,100,0,80,95,71,101,116,78,111,100,101,115,86,101,114,115,105,111,110,58,32,102,111,117,110,100,32,118,101,114,115,105,111,110,32,52,32,110,111,100,101,115,10,0,0,0,0,0,0,0,109,117,115,95,101,49,109,51,0,0,0,0,0,0,0,0,80,105,99,107,101,100,32,117,112,32,116,104,101,32,97,114,109,111,114,46,0,0,0,0,114,101,97,108,116,105,99,95,99,108,111,99,107,95,114,97,116,101,0,0,0,0,0,0,105,100,98,101,104,111,108,100,108,0,0,0,0,0,0,0,89,79,85,32,72,65,86,69,32,87,79,78,33,32,89,79,85,82,32,86,73,67,84,79,82,89,32,72,65,83,32,69,78,65,66,76,69,68,10,72,85,77,65,78,75,73,78,68,32,84,79,32,69,86,65,67,85,65,84,69,32,69,65,82,84,72,32,65,78,68,32,69,83,67,65,80,69,10,84,72,69,32,78,73,71,72,84,77,65,82,69,46,32,32,78,79,87,32,89,79,85,32,65,82,69,32,84,72,69,32,79,78,76,89,10,72,85,77,65,78,32,76,69,70,84,32,79,78,32,84,72,69,32,70,65,67,69,32,79,70,32,84,72,69,32,80,76,65,78,69,84,46,10,67,65,78,78,73,66,65,76,32,77,85,84,65,84,73,79,78,83,44,32,67,65,82,78,73,86,79,82,79,85,83,32,65,76,73,69,78,83,44,10,65,78,68,32,69,86,73,76,32,83,80,73,82,73,84,83,32,65,82,69,32,89,79,85,82,32,79,78,76,89,32,78,69,73,71,72,66,79,82,83,46,10,89,79,85,32,83,73,84,32,66,65,67,75,32,65,78,68,32,87,65,73,84,32,70,79,82,32,68,69,65,84,72,44,32,67,79,78,84,69,78,84,10,84,72,65,84,32,89,79,85,32,72,65,86,69,32,83,65,86,69,68,32,89,79,85,82,32,83,80,69,67,73,69,83,46,10,10,66,85,84,32,84,72,69,78,44,32,69,65,82,84,72,32,67,79,78,84,82,79,76,32,66,69,65,77,83,32,68,79,87,78,32,65,10,77,69,83,83,65,71,69,32,70,82,79,77,32,83,80,65,67,69,58,32,34,83,69,78,83,79,82,83,32,72,65,86,69,32,76,79,67,65,84,69,68,10,84,72,69,32,83,79,85,82,67,69,32,79,70,32,84,72,69,32,65,76,73,69,78,32,73,78,86,65,83,73,79,78,46,32,73,70,32,89,79,85,10,71,79,32,84,72,69,82,69,44,32,89,79,85,32,77,65,89,32,66,69,32,65,66,76,69,32,84,79,32,66,76,79,67,75,32,84,72,69,73,82,10,69,78,84,82,89,46,32,32,84,72,69,32,65,76,73,69,78,32,66,65,83,69,32,73,83,32,73,78,32,84,72,69,32,72,69,65,82,84,32,79,70,10,89,79,85,82,32,79,87,78,32,72,79,77,69,32,67,73,84,89,44,32,78,79,84,32,70,65,82,32,70,82,79,77,32,84,72,69,10,83,84,65,82,80,79,82,84,46,34,32,83,76,79,87,76,89,32,65,78,68,32,80,65,73,78,70,85,76,76,89,32,89,79,85,32,71,69,84,10,85,80,32,65,78,68,32,82,69,84,85,82,78,32,84,79,32,84,72,69,32,70,82,65,89,46,0,0,0,0,0,0,0,101,49,109,50,46,109,112,51,0,0,0,0,0,0,0,0,71,97,109,101,32,115,112,101,101,100,44,32,112,101,114,99,101,110,116,97,103,101,32,111,102,32,110,111,114,109,97,108,0,0,0,0,0,0,0,0,89,79,85,32,72,65,86,69,32,69,78,84,69,82,69,68,32,68,69,69,80,76,89,32,73,78,84,79,32,84,72,69,32,73,78,70,69,83,84,69,68,10,83,84,65,82,80,79,82,84,46,32,66,85,84,32,83,79,77,69,84,72,73,78,71,32,73,83,32,87,82,79,78,71,46,32,84,72,69,10,77,79,78,83,84,69,82,83,32,72,65,86,69,32,66,82,79,85,71,72,84,32,84,72,69,73,82,32,79,87,78,32,82,69,65,76,73,84,89,10,87,73,84,72,32,84,72,69,77,44,32,65,78,68,32,84,72,69,32,83,84,65,82,80,79,82,84,39,83,32,84,69,67,72,78,79,76,79,71,89,10,73,83,32,66,69,73,78,71,32,83,85,66,86,69,82,84,69,68,32,66,89,32,84,72,69,73,82,32,80,82,69,83,69,78,67,69,46,10,10,65,72,69,65,68,44,32,89,79,85,32,83,69,69,32,65,78,32,79,85,84,80,79,83,84,32,79,70,32,72,69,76,76,44,32,65,10,70,79,82,84,73,70,73,69,68,32,90,79,78,69,46,32,73,70,32,89,79,85,32,67,65,78,32,71,69,84,32,80,65,83,84,32,73,84,44,10,89,79,85,32,67,65,78,32,80,69,78,69,84,82,65,84,69,32,73,78,84,79,32,84,72,69,32,72,65,85,78,84,69,68,32,72,69,65,82,84,10,79,70,32,84,72,69,32,83,84,65,82,66,65,83,69,32,65,78,68,32,70,73,78,68,32,84,72,69,32,67,79,78,84,82,79,76,76,73,78,71,10,83,87,73,84,67,72,32,87,72,73,67,72,32,72,79,76,68,83,32,69,65,82,84,72,39,83,32,80,79,80,85,76,65,84,73,79,78,10,72,79,83,84,65,71,69,46,0,0,0,85,110,114,101,99,111,103,110,105,115,101,100,32,115,97,118,101,103,97,109,101,32,118,101,114,115,105,111,110,33,10,65,114,101,32,121,111,117,32,115,117,114,101,63,32,40,121,47,110,41,32,0,0,0,0,0,68,73,71,57,51,0,0,0,109,117,115,95,101,49,109,50,0,0,0,0,0,0,0,0,109,97,120,95,112,108,97,121,101,114,95,99,111,114,112,115,101,0,0,0,0,0,0,0,116,104,101,32,115,112,105,100,101,114,32,109,97,115,116,101,114,109,105,110,100,32,109,117,115,116,32,104,97,118,101,32,115,101,110,116,32,102,111,114,116,104,10,105,116,115,32,108,101,103,105,111,110,115,32,111,102,32,104,101,108,108,115,112,97,119,110,32,98,101,102,111,114,101,32,121,111,117,114,10,102,105,110,97,108,32,99,111,110,102,114,111,110,116,97,116,105,111,110,32,119,105,116,104,32,116,104,97,116,32,116,101,114,114,105,98,108,101,10,98,101,97,115,116,32,102,114,111,109,32,104,101,108,108,46,32,32,98,117,116,32,121,111,117,32,115,116,101,112,112,101,100,32,102,111,114,119,97,114,100,10,97,110,100,32,98,114,111,117,103,104,116,32,102,111,114,116,104,32,101,116,101,114,110,97,108,32,100,97,109,110,97,116,105,111,110,32,97,110,100,10,115,117,102,102,101,114,105,110,103,32,117,112,111,110,32,116,104,101,32,104,111,114,100,101,32,97,115,32,97,32,116,114,117,101,32,104,101,114,111,10,119,111,117,108,100,32,105,110,32,116,104,101,32,102,97,99,101,32,111,102,32,115,111,109,101,116,104,105,110,103,32,115,111,32,101,118,105,108,46,10,10,98,101,115,105,100,101,115,44,32,115,111,109,101,111,110,101,32,119,97,115,32,103,111,110,110,97,32,112,97,121,32,102,111,114,32,119,104,97,116,10,104,97,112,112,101,110,101,100,32,116,111,32,100,97,105,115,121,44,32,121,111,117,114,32,112,101,116,32,114,97,98,98,105,116,46,10,10,98,117,116,32,110,111,119,44,32,121,111,117,32,115,101,101,32,115,112,114,101,97,100,32,98,101,102,111,114,101,32,121,111,117,32,109,111,114,101,10,112,111,116,101,110,116,105,97,108,32,112,97,105,110,32,97,110,100,32,103,105,98,98,105,116,117,100,101,32,97,115,32,97,32,110,97,116,105,111,110,10,111,102,32,100,101,109,111,110,115,32,114,117,110,32,97,109,111,107,32,97,109,111,110,103,32,111,117,114,32,99,105,116,105,101,115,46,10,10,110,101,120,116,32,115,116,111,112,44,32,104,101,108,108,32,111,110,32,101,97,114,116,104,33,0,101,49,109,49,46,109,112,51,0,0,0,0,0,0,0,0,77,97,120,105,109,117,109,32,110,117,109,98,101,114,32,111,102,32,112,108,97,121,101,114,32,99,111,114,112,115,101,115,0,0,0,0,0,0,0,0,84,104,101,32,108,111,97,116,104,115,111,109,101,32,115,112,105,100,101,114,100,101,109,111,110,32,116,104,97,116,10,109,97,115,116,101,114,109,105,110,100,101,100,32,116,104,101,32,105,110,118,97,115,105,111,110,32,111,102,32,116,104,101,32,109,111,111,110,10,98,97,115,101,115,32,97,110,100,32,99,97,117,115,101,100,32,115,111,32,109,117,99,104,32,100,101,97,116,104,32,104,97,115,32,104,97,100,10,105,116,115,32,97,115,115,32,107,105,99,107,101,100,32,102,111,114,32,97,108,108,32,116,105,109,101,46,10,10,65,32,104,105,100,100,101,110,32,100,111,111,114,119,97,121,32,111,112,101,110,115,32,97,110,100,32,121,111,117,32,101,110,116,101,114,46,10,89,111,117,39,118,101,32,112,114,111,118,101,110,32,116,111,111,32,116,111,117,103,104,32,102,111,114,32,72,101,108,108,32,116,111,10,99,111,110,116,97,105,110,44,32,97,110,100,32,110,111,119,32,72,101,108,108,32,97,116,32,108,97,115,116,32,112,108,97,121,115,10,102,97,105,114,32,45,45,32,102,111,114,32,121,111,117,32,101,109,101,114,103,101,32,102,114,111,109,32,116,104,101,32,100,111,111,114,10,116,111,32,115,101,101,32,116,104,101,32,103,114,101,101,110,32,102,105,101,108,100,115,32,111,102,32,69,97,114,116,104,33,10,72,111,109,101,32,97,116,32,108,97,115,116,46,10,10,89,111,117,32,119,111,110,100,101,114,32,119,104,97,116,39,115,32,98,101,101,110,32,104,97,112,112,101,110,105,110,103,32,111,110,10,69,97,114,116,104,32,119,104,105,108,101,32,121,111,117,32,119,101,114,101,32,98,97,116,116,108,105,110,103,32,101,118,105,108,10,117,110,108,101,97,115,104,101,100,46,32,73,116,39,115,32,103,111,111,100,32,116,104,97,116,32,110,111,32,72,101,108,108,45,10,115,112,97,119,110,32,99,111,117,108,100,32,104,97,118,101,32,99,111,109,101,32,116,104,114,111,117,103,104,32,116,104,97,116,10,100,111,111,114,32,119,105,116,104,32,121,111,117,32,46,46,46,0,0,0,0,109,117,115,95,101,49,109,49,0,0,0,0,0,0,0,0,77,105,115,99,101,108,108,97,110,101,111,117,115,0,0,0,89,111,117,39,118,101,32,100,111,110,101,32,105,116,33,32,84,104,101,32,104,105,100,101,111,117,115,32,99,121,98,101,114,45,10,100,101,109,111,110,32,108,111,114,100,32,116,104,97,116,32,114,117,108,101,100,32,116,104,101,32,108,111,115,116,32,68,101,105,109,111,115,10,109,111,111,110,32,98,97,115,101,32,104,97,115,32,98,101,101,110,32,115,108,97,105,110,32,97,110,100,32,121,111,117,10,97,114,101,32,116,114,105,117,109,112,104,97,110,116,33,32,66,117,116,32,46,46,46,32,119,104,101,114,101,32,97,114,101,10,121,111,117,63,32,89,111,117,32,99,108,97,109,98,101,114,32,116,111,32,116,104,101,32,101,100,103,101,32,111,102,32,116,104,101,10,109,111,111,110,32,97,110,100,32,108,111,111,107,32,100,111,119,110,32,116,111,32,115,101,101,32,116,104,101,32,97,119,102,117,108,10,116,114,117,116,104,46,10,10,68,101,105,109,111,115,32,102,108,111,97,116,115,32,97,98,111,118,101,32,72,101,108,108,32,105,116,115,101,108,102,33,10,89,111,117,39,118,101,32,110,101,118,101,114,32,104,101,97,114,100,32,111,102,32,97,110,121,111,110,101,32,101,115,99,97,112,105,110,103,10,102,114,111,109,32,72,101,108,108,44,32,98,117,116,32,121,111,117,39,108,108,32,109,97,107,101,32,116,104,101,32,98,97,115,116,97,114,100,115,10,115,111,114,114,121,32,116,104,101,121,32,101,118,101,114,32,104,101,97,114,100,32,111,102,32,121,111,117,33,32,81,117,105,99,107,108,121,44,10,121,111,117,32,114,97,112,112,101,108,32,100,111,119,110,32,116,111,32,32,116,104,101,32,115,117,114,102,97,99,101,32,111,102,10,72,101,108,108,46,10,10,78,111,119,44,32,105,116,39,115,32,111,110,32,116,111,32,116,104,101,32,102,105,110,97,108,32,99,104,97,112,116,101,114,32,111,102,10,68,79,79,77,33,32,45,45,32,73,110,102,101,114,110,111,46,0,0,0,0,0,0,77,117,115,105,99,0,0,0,100,101,104,102,105,108,101,95,50,0,0,0,0,0,0,0,79,110,99,101,32,121,111,117,32,98,101,97,116,32,116,104,101,32,98,105,103,32,98,97,100,97,115,115,101,115,32,97,110,100,10,99,108,101,97,110,32,111,117,116,32,116,104,101,32,109,111,111,110,32,98,97,115,101,32,121,111,117,39,114,101,32,115,117,112,112,111,115,101,100,10,116,111,32,119,105,110,44,32,97,114,101,110,39,116,32,121,111,117,63,32,65,114,101,110,39,116,32,121,111,117,63,32,87,104,101,114,101,39,115,10,121,111,117,114,32,102,97,116,32,114,101,119,97,114,100,32,97,110,100,32,116,105,99,107,101,116,32,104,111,109,101,63,32,87,104,97,116,10,116,104,101,32,104,101,108,108,32,105,115,32,116,104,105,115,63,32,73,116,39,115,32,110,111,116,32,115,117,112,112,111,115,101,100,32,116,111,10,101,110,100,32,116,104,105,115,32,119,97,121,33,10,10,73,116,32,115,116,105,110,107,115,32,108,105,107,101,32,114,111,116,116,101,110,32,109,101,97,116,44,32,98,117,116,32,108,111,111,107,115,10,108,105,107,101,32,116,104,101,32,108,111,115,116,32,68,101,105,109,111,115,32,98,97,115,101,46,32,32,76,111,111,107,115,32,108,105,107,101,10,121,111,117,39,114,101,32,115,116,117,99,107,32,111,110,32,84,104,101,32,83,104,111,114,101,115,32,111,102,32,72,101,108,108,46,10,84,104,101,32,111,110,108,121,32,119,97,121,32,111,117,116,32,105,115,32,116,104,114,111,117,103,104,46,10,10,84,111,32,99,111,110,116,105,110,117,101,32,116,104,101,32,68,79,79,77,32,101,120,112,101,114,105,101,110,99,101,44,32,112,108,97,121,10,84,104,101,32,83,104,111,114,101,115,32,111,102,32,72,101,108,108,32,97,110,100,32,105,116,115,32,97,109,97,122,105,110,103,10,115,101,113,117,101,108,44,32,73,110,102,101,114,110,111,33,10,0,0,0,0,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,57,0,68,69,72,47,66,69,88,32,35,50,0,0,0,0,0,0,67,111,109,112,97,116,105,98,105,108,105,116,121,32,77,111,100,101,32,79,102,102,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,56,0,100,101,104,102,105,108,101,95,49,0,0,0,0,0,0,0,67,111,109,112,97,116,105,98,105,108,105,116,121,32,77,111,100,101,32,79,110,0,0,0,108,111,99,107,45,97,110,100,45,99,111,112,121,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,55,0,10,82,95,73,110,105,116,84,101,120,116,117,114,101,115,58,32,77,105,115,115,105,110,103,32,112,97,116,99,104,32,37,100,32,105,110,32,116,101,120,116,117,114,101,32,37,46,56,115,0,0,0,0,0,0,0,68,69,72,47,66,69,88,32,35,32,49,0,0,0,0,0,67,104,97,110,103,105,110,103,32,76,101,118,101,108,46,46,46,0,0,0,0,0,0,0,109,111,110,115,116,101,114,95,98,97,99,107,105,110,103,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,54,0,119,97,100,102,105,108,101,95,50,0,0,0,0,0,0,0,66,70,69,50,0,0,0,0,46,46,46,32,100,111,101,115,110,39,116,32,115,117,99,107,32,45,32,71,77,0,0,0,84,85,82,78,32,76,69,70,84,0,0,0,0,0,0,0,101,51,109,56,0,0,0,0,68,79,79,77,32,83,104,97,114,101,119,97,114,101,0,0,80,95,71,101,116,78,111,100,101,115,86,101,114,115,105,111,110,58,32,102,111,117,110,100,32,118,101,114,115,105,111,110,32,50,32,110,111,100,101,115,10,0,0,0,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,53,0,101,109,112,116,121,32,115,108,111,116,0,0,0,0,0,0,87,65,68,32,35,50,0,0,65,117,116,111,45,109,97,112,0,0,0,0,0,0,0,0,80,111,119,101,114,45,117,112,32,84,111,103,103,108,101,100,0,0,0,0,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,52,0,119,97,100,102,105,108,101,95,49,0,0,0,0,0,0,0,105,110,86,117,108,110,44,32,83,116,114,44,32,73,110,118,105,115,111,44,32,82,97,100,44,32,65,108,108,109,97,112,44,32,111,114,32,76,105,116,101,45,97,109,112,0,0,0,40,85,110,107,110,111,119,110,32,69,114,114,111,114,41,0,83,84,67,70,78,48,57,49,0,0,0,0,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,51,0,87,65,68,32,35,32,49,0,78,111,32,67,108,105,112,112,105,110,103,32,77,111,100,101,32,79,70,70,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,50,0,70,105,108,101,115,32,80,114,101,108,111,97,100,101,100,32,97,116,32,71,97,109,101,32,83,116,97,114,116,117,112,0,78,111,32,67,108,105,112,112,105,110,103,32,77,111,100,101,32,79,78,0,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,49,0,117,115,101,95,106,111,121,115,116,105,99,107,0,0,0,0,65,109,109,111,32,40,110,111,32,107,101,121,115,41,32,65,100,100,101,100,0,0,0,0,87,101,97,112,111,110,32,112,114,101,102,101,114,101,110,99,101,115,0,0,0,0,0,0,69,110,97,98,108,101,32,74,111,121,115,116,105,99,107,0,86,101,114,121,32,72,97,112,112,121,32,65,109,109,111,32,65,100,100,101,100,0,0,0,104,117,100,95,110,111,115,101,99,114,101,116,115,0,0,0,117,115,101,95,109,111,117,115,101,0,0,0,0,0,0,0,68,101,103,114,101,101,108,101,115,115,110,101,115,115,32,77,111,100,101,32,79,102,102,0,104,117,100,95,100,105,115,112,108,97,121,101,100,0,0,0,69,110,97,98,108,101,32,77,111,117,115,101,0,0,0,0,68,101,103,114,101,101,108,101,115,115,110,101,115,115,32,77,111,100,101,32,79,110,0,0,111,119,110,32,98,117,102,102,101,114,0,0,0,0,0,0,104,117,100,95,97,99,116,105,118,101,0,0,0,0,0,0,82,95,73,110,105,116,84,101,120,116,117,114,101,115,58,32,66,97,100,32,116,101,120,116,117,114,101,32,100,105,114,101,99,116,111,114,121,0,0,0,73,110,112,117,116,32,68,101,118,105,99,101,115,0,0,0,73,77,80,79,83,83,73,66,76,69,32,83,69,76,69,67,84,73,79,78,0,0,0,0,109,111,110,115,116,101,114,95,105,110,102,105,103,104,116,105,110,103,0,0,0,0,0,0,97,109,109,111,95,121,101,108,108,111,119,0,0,0,0,0,112,105,116,99,104,101,100,95,115,111,117,110,100,115,0,0,66,70,69,49,0,0,0,0,77,117,115,105,99,32,67,104,97,110,103,101,0,0,0,0,66,65,67,75,87,65,82,68,0,0,0,0,0,0,0,0,101,51,109,55,0,0,0,0,84,104,101,32,85,108,116,105,109,97,116,101,32,68,79,79,77,0,0,0,0,0,0,0,80,95,71,101,116,78,111,100,101,115,86,101,114,115,105,111,110,58,32,118,101,114,115,105,111,110,32,51,32,110,111,100,101,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,10,0,0,0,0,0,0,0,97,109,109,111,95,114,101,100,0,0,0,0,0,0,0,0,71,97,109,109,97,32,99,111,114,114,101,99,116,105,111,110,32,108,101,118,101,108,32,52,0,0,0,0,0,0,0,0,69,110,97,98,108,101,32,118,49,46,49,32,80,105,116,99,104,32,69,102,102,101,99,116,115,0,0,0,0,0,0,0,105,100,98,101,104,111,108,100,97,0,0,0,0,0,0,0,79,118,101,114,108,97,121,32,77,111,100,101,32,79,70,70,0,0,0,0,0,0,0,0,97,114,109,111,114,95,103,114,101,101,110,0,0,0,0,0,115,110,100,95,99,104,97,110,110,101,108,115,0,0,0,0,79,118,101,114,108,97,121,32,77,111,100,101,32,79,78,0,67,111,117,108,100,110,39,116,32,114,101,97,100,32,102,105,108,101,32,37,115,58,32,37,115,0,0,0,0,0,0,0,68,73,71,57,49,0,0,0,50,46,53,46,48,0,0,0,97,114,109,111,114,95,121,101,108,108,111,119,0,0,0,0,78,117,109,98,101,114,32,111,102,32,83,111,117,110,100,32,67,104,97,110,110,101,108,115,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,82,111,116,97,116,101,32,77,111,100,101,32,79,70,70,0,45,110,111,115,111,117,110,100,0,0,0,0,0,0,0,0,97,114,109,111,114,95,114,101,100,0,0,0,0,0,0,0,83,111,117,110,100,32,38,32,77,117,115,105,99,0,0,0,73,95,83,105,103,110,97,108,72,97,110,100,108,101,114,58,32,37,115,0,0,0,0,0,82,111,116,97,116,101,32,77,111,100,101,32,79,78,0,0,104,101,97,108,116,104,95,103,114,101,101,110,0,0,0,0,117,110,99,97,112,112,101,100,95,102,114,97,109,101,114,97,116,101,0,0,0,0,0,0,82,95,67,97,99,104,101,80,97,116,99,104,78,117,109,58,32,72,105,103,104,32,108,111,99,107,32,111,110,32,37,56,115,32,40,37,100,41,10,0,99,97,110,110,111,116,32,111,112,101,110,32,37,115,32,102,111,114,32,119,114,105,116,105,110,103,32,99,104,101,99,107,115,117,109,58,10,37,115,10,0,0,0,0,0,0,0,0,65,108,108,32,77,97,114,107,115,32,67,108,101,97,114,101,100,0,0,0,0,0,0,0,104,101,97,108,116,104,95,121,101,108,108,111,119,0,0,0,85,110,99,97,112,112,101,100,32,70,114,97,109,101,114,97,116,101,0,0,0,0,0,0,90,95,70,114,101,101,58,32,102,114,101,101,100,32,97,32,112,111,105,110,116,101,114,32,119,105,116,104,111,117,116,32,90,79,78,69,73,68,0,0,77,97,114,107,101,100,32,83,112,111,116,0,0,0,0,0,10,82,95,73,110,105,116,58,32,82,95,73,110,105,116,80,108,97,110,101,115,32,0,0,104,101,97,108,116,104,95,114,101,100,0,0,0,0,0,0,118,105,100,101,111,109,111,100,101,0,0,0,0,0,0,0,71,114,105,100,32,79,70,70,0,0,0,0,0,0,0,0,80,95,77,97,112,83,116,97,114,116,58,32,116,109,116,104,105,110,103,32,115,101,116,33,0,0,0,0,0,0,0,0,90,95,66,70,114,101,101,58,32,70,114,101,101,32,110,111,116,32,105,110,32,122,111,110,101,32,37,115,0,0,0,0,104,117,100,95,100,105,115,116,114,105,98,117,116,101,100,0,86,105,100,101,111,32,109,111,100,101,0,0,0,0,0,0,72,69,76,80,50,0,0,0,71,114,105,100,32,79,78,0,83,68,76,32,98,117,102,102,101,114,0,0,0,0,0,0,71,82,78,82,79,67,75,0,67,111,117,108,100,32,110,111,116,32,112,108,97,99,101,32,112,97,116,99,104,32,111,110,32,108,101,118,101,108,32,37,100,0,0,0,0,0,0,0,104,117,100,95,108,105,115,116,95,98,103,111,110,0,0,0,84,69,88,84,85,82,69,50,0,0,0,0,0,0,0,0,117,115,101,95,102,117,108,108,115,99,114,101,101,110,0,0,70,111,108,108,111,119,32,77,111,100,101,32,79,70,70,0,108,101,116,39,115,32,98,101,97,116,32,105,116,32,45,45,32,116,104,105,115,32,105,115,32,116,117,114,110,105,110,103,10,105,110,116,111,32,97,32,98,108,111,111,100,98,97,116,104,33,0,0,0,0,0,0,87,95,73,110,105,116,58,32,78,111,32,102,105,108,101,115,32,102,111,117,110,100,0,0,109,111,110,115,116,101,114,115,95,114,101,109,101,109,98,101,114,0,0,0,0,0,0,0,104,117,100,95,109,115,103,95,108,105,110,101,115,0,0,0,70,117,108,108,115,99,114,101,101,110,32,86,105,100,101,111,32,109,111,100,101,0,0,0,66,70,83,49,0,0,0,0,70,111,108,108,111,119,32,77,111,100,101,32,79,78,0,0,80,76,65,89,80,65,76,0,70,79,82,87,65,82,68,0,101,51,109,54,0,0,0,0,45,100,101,97,116,104,109,97,116,99,104,0,0,0,0,0])
.concat([80,95,71,101,116,78,111,100,101,115,86,101,114,115,105,111,110,58,32,102,111,117,110,100,32,118,101,114,115,105,111,110,32,51,32,110,111,100,101,115,10,0,0,0,0,0,0,0,104,117,100,99,111,108,111,114,95,108,105,115,116,0,0,0,116,114,97,110,95,102,105,108,116,101,114,95,112,99,116,0,71,97,109,109,97,32,99,111,114,114,101,99,116,105,111,110,32,108,101,118,101,108,32,51,0,0,0,0,0,0,0,0,82,97,100,105,97,116,105,111,110,32,83,117,105,116,0,0,80,108,97,121,101,114,32,52,58,32,0,0,0,0,0,0,119,98,0,0,0,0,0,0,83,84,84,77,73,78,85,83,0,0,0,0,0,0,0,0,104,117,100,99,111,108,111,114,95,99,104,97,116,0,0,0,84,114,97,110,115,108,117,99,101,110,99,121,32,102,105,108,116,101,114,32,112,101,114,99,101,110,116,97,103,101,0,0,80,108,97,121,101,114,32,51,58,32,0,0,0,0,0,0,67,117,114,114,101,110,116,32,80,114,66,111,111,109,0,0,83,84,67,70,78,48,53,56,0,0,0,0,0,0,0,0,104,117,100,99,111,108,111,114,95,109,101,115,103,0,0,0,116,114,97,110,115,108,117,99,101,110,99,121,0,0,0,0,80,108,97,121,101,114,32,50,58,32,0,0,0,0,0,0,86,95,73,110,105,116,77,111,100,101,58,32,117,115,105,110,103,32,56,32,98,105,116,32,118,105,100,101,111,32,109,111,100,101,10,0,0,0,0,0,104,117,100,99,111,108,111,114,95,120,121,99,111,0,0,0,69,110,97,98,108,101,32,84,114,97,110,115,108,117,99,101,110,99,121,0,0,0,0,0,82,95,76,111,97,100,84,114,105,103,84,97,98,108,101,115,58,32,73,110,118,97,108,105,100,32,83,73,78,69,84,65,66,76,0,0,0,0,0,0,80,108,97,121,101,114,32,49,58,32,0,0,0,0,0,0,83,84,84,80,82,67,78,84,0,0,0,0,0,0,0,0,104,117,100,99,111,108,111,114,95,116,105,116,108,0,0,0,80,95,83,116,97,114,116,66,117,116,116,111,110,58,32,110,111,32,98,117,116,116,111,110,32,115,108,111,116,115,32,108,101,102,116,33,0,0,0,0,86,105,100,101,111,0,0,0,91,77,101,115,115,97,103,101,32,83,101,110,116,93,0,0,72,101,97,100,115,45,117,112,32,100,105,115,112,108,97,121,32,115,101,116,116,105,110,103,115,0,0,0,0,0,0,0,77,95,69,78,69,77,0,0,89,111,117,39,118,101,32,108,111,115,116,32,105,116,46,46,46,0,0,0,0,0,0,0,97,117,116,111,109,97,112,109,111,100,101,0,0,0,0,0,100,111,103,95,106,117,109,112,105,110,103,0,0,0,0,0,89,111,117,32,115,116,97,114,116,32,116,111,32,114,97,118,101,0,0,0,0,0,0,0,109,97,112,95,112,111,105,110,116,95,99,111,111,114,100,0,65,108,108,111,119,32,100,111,103,115,32,116,111,32,106,117,109,112,32,100,111,119,110,0,89,111,117,32,115,99,97,114,101,32,121,111,117,114,115,101,108,102,0,0,0,0,0,0,73,95,85,112,100,97,116,101,86,105,100,101,111,77,111,100,101,58,32,48,120,37,120,44,32,37,115,44,32,37,115,10,0,0,0,0,0,0,0,0,109,97,112,95,115,101,99,114,101,116,95,97,102,116,101,114,0,0,0,0,0,0,0,0,84,69,88,84,85,82,69,49,0,0,0,0,0,0,0,0,102,114,105,101,110,100,95,100,105,115,116,97,110,99,101,0,77,105,115,99,32,115,101,116,116,105,110,103,115,0,0,0,87,104,111,39,115,32,116,104,101,114,101,63,0,0,0,0,112,108,97,121,101,114,95,98,111,98,98,105,110,103,0,0,109,97,112,99,111,108,111,114,95,102,114,110,100,0,0,0,68,105,115,116,97,110,99,101,32,70,114,105,101,110,100,115,32,83,116,97,121,32,65,119,97,121,0,0,0,0,0,0,77,73,83,76,0,0,0,0,89,111,117,32,109,117,109,98,108,101,32,116,111,32,121,111,117,114,115,101,108,102,0,0,77,79,86,69,77,69,78,84,0,0,0,0,0,0,0,0,80,85,78,71,0,0,0,0,101,51,109,53,0,0,0,0,45,97,108,116,100,101,97,116,104,0,0,0,0,0,0,0,116,101,120,116,117,114,101,50,0,0,0,0,0,0,0,0,80,95,76,111,97,100,76,105,110,101,68,101,102,115,58,32,108,105,110,101,100,101,102,32,37,100,32,104,97,115,32,116,119,111,45,115,105,100,101,100,32,102,108,97,103,32,115,101,116,44,32,98,117,116,32,110,111,32,115,101,99,111,110,100,32,115,105,100,101,100,101,102,10,0,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,101,110,101,109,121,0,0,112,108,97,121,101,114,95,104,101,108,112,101,114,115,0,0,71,97,109,109,97,32,99,111,114,114,101,99,116,105,111,110,32,108,101,118,101,108,32,50,0,0,0,0,0,0,0,0,105,100,98,101,104,111,108,100,114,0,0,0,0,0,0,0,78,111,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,109,101,0,0,0,0,0,78,117,109,98,101,114,32,79,102,32,83,105,110,103,108,101,45,80,108,97,121,101,114,32,72,101,108,112,101,114,32,68,111,103,115,0,0,0,0,0,89,101,115,0,0,0,0,0,80,114,66,111,111,109,32,50,46,52,46,48,0,0,0,0,68,73,71,53,56,0,0,0,109,97,112,99,111,108,111,114,95,115,110,103,108,0,0,0,104,101,108,112,95,102,114,105,101,110,100,115,0,0,0,0,73,39,108,108,32,116,97,107,101,32,99,97,114,101,32,111,102,32,105,116,46,0,0,0,109,97,112,99,111,108,111,114,95,104,97,105,114,0,0,0,82,101,115,99,117,101,32,68,121,105,110,103,32,70,114,105,101,110,100,115,0,0,0,0,67,111,109,101,32,104,101,114,101,33,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,105,116,101,109,0,0,0,109,111,110,115,116,101,114,95,102,114,105,99,116,105,111,110,0,0,0,0,0,0,0,0,78,101,120,116,32,116,105,109,101,44,32,115,99,117,109,98,97,103,46,46,46,0,0,0,67,82,69,68,73,84,0,0,109,97,112,99,111,108,111,114,95,115,112,114,116,0,0,0,65,102,102,101,99,116,101,100,32,98,121,32,70,114,105,99,116,105,111,110,0,0,0,0,84,82,79,79,0,0,0,0,89,111,117,32,115,117,99,107,33,0,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,102,108,97,116,0,0,0,109,111,110,115,116,101,114,95,97,118,111,105,100,95,104,97,122,97,114,100,115,0,0,0,72,101,108,112,33,0,0,0,101,49,109,51,0,0,0,0,109,97,112,99,111,108,111,114,95,117,110,115,110,0,0,0,73,110,116,101,108,108,105,103,101,110,116,108,121,32,65,118,111,105,100,32,72,97,122,97,114,100,115,0,0,0,0,0,73,39,109,32,110,111,116,32,108,111,111,107,105,110,103,32,116,111,111,32,103,111,111,100,33,0,0,0,0,0,0,0,67,111,117,108,100,110,39,116,32,115,101,116,32,37,100,120,37,100,32,118,105,100,101,111,32,109,111,100,101,32,91,37,115,93,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,101,120,105,116,0,0,0,10,87,97,114,110,105,110,103,58,32,112,97,116,99,104,32,37,46,56,115,44,32,105,110,100,101,120,32,37,100,32,100,111,101,115,32,110,111,116,32,101,120,105,115,116,0,0,0,109,111,110,107,101,121,115,0,73,39,109,32,79,75,46,0,112,108,117,116,111,110,105,97,46,119,97,100,0,0,0,0,65,78,73,77,65,84,69,68,0,0,0,0,0,0,0,0,83,95,83,101,116,77,117,115,105,99,86,111,108,117,109,101,58,32,65,116,116,101,109,112,116,32,116,111,32,115,101,116,32,109,117,115,105,99,32,118,111,108,117,109,101,32,97,116,32,37,100,0,0,0,0,0,100,111,111,109,95,119,101,97,112,111,110,95,116,111,103,103,108,101,115,0,0,0,0,0,109,97,112,99,111,108,111,114,95,115,101,99,114,0,0,0,67,108,105,109,98,32,83,116,101,101,112,32,83,116,97,105,114,115,0,0,0,0,0,0,80,76,83,69,0,0,0,0,69,37,100,77,37,100,0,0,73,39,109,32,114,101,97,100,121,32,116,111,32,107,105,99,107,32,98,117,116,116,33,0,77,95,83,69,84,85,80,0,101,51,109,52,0,0,0,0,45,100,101,118,112,97,114,109,0,0,0,0,0,0,0,0,80,95,76,111,97,100,76,105,110,101,68,101,102,115,58,32,108,105,110,101,100,101,102,32,37,100,32,109,105,115,115,105,110,103,32,102,105,114,115,116,32,115,105,100,101,100,101,102,10,0,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,116,101,108,101,0,0,0,109,111,110,115,116,101,114,95,98,97,99,107,105,110,103,0,71,97,109,109,97,32,99,111,114,114,101,99,116,105,111,110,32,108,101,118,101,108,32,49,0,0,0,0,0,0,0,0,73,110,118,105,115,105,98,105,108,105,116,121,0,0,0,0,105,100,99,104,111,112,112,101,114,115,0,0,0,0,0,0,108,101,118,101,108,32,51,50,58,32,99,97,114,105,98,98,101,97,110,0,0,0,0,0,82,95,73,110,105,116,83,112,114,105,116,101,115,58,32,83,112,114,105,116,101,32,37,46,56,115,32,102,114,97,109,101,32,37,99,32,105,115,32,109,105,115,115,105,110,103,32,114,111,116,97,116,105,111,110,115,0,0,0,0,0,0,0,0,80,95,85,110,97,114,99,104,105,118,101,83,112,101,99,105,97,108,115,58,32,85,110,107,110,111,119,110,32,116,99,108,97,115,115,32,37,105,32,105,110,32,115,97,118,101,103,97,109,101,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,121,100,111,114,0,0,0,77,111,110,115,116,101,114,32,66,97,99,107,105,110,103,32,79,117,116,0,0,0,0,0,108,101,118,101,108,32,51,49,58,32,112,104,97,114,97,111,104,0,0,0,0,0,0,0,80,114,66,111,111,109,32,118,50,46,51,46,120,0,0,0,83,84,67,70,78,48,52,55,0,0,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,98,100,111,114,0,0,0,109,111,110,115,116,101,114,115,95,114,101,109,101,109,98,101,114,0,0,0,0,0,0,0,108,101,118,101,108,32,51,48,58,32,108,97,115,116,32,99,97,108,108,0,0,0,0,0,109,97,112,99,111,108,111,114,95,114,100,111,114,0,0,0,82,101,109,101,109,98,101,114,32,80,114,101,118,105,111,117,115,32,69,110,101,109,121,0,108,101,118,101,108,32,50,57,58,32,114,105,118,101,114,32,115,116,121,120,0,0,0,0,109,97,112,99,111,108,111,114,95,121,107,101,121,0,0,0,109,111,110,115,116,101,114,95,105,110,102,105,103,104,116,105,110,103,0,0,0,0,0,0,108,101,118,101,108,32,50,56,58,32,104,101,99,107,0,0,109,97,112,99,111,108,111,114,95,98,107,101,121,0,0,0,77,111,110,115,116,101,114,32,73,110,102,105,103,104,116,105,110,103,32,87,104,101,110,32,80,114,111,118,111,107,101,100,0,0,0,0,0,0,0,0,108,101,118,101,108,32,50,55,58,32,109,111,117,110,116,32,112,97,105,110,0,0,0,0,109,97,112,99,111,108,111,114,95,114,107,101,121,0,0,0,77,95,65,85,84,79,0,0,108,101,118,101,108,32,50,54,58,32,98,97,108,108,105,115,116,121,120,0,0,0,0,0,109,97,112,99,111,108,111,114,95,99,108,115,100,0,0,0,109,97,112,99,111,108,111,114,95,102,114,110,100,0,0,0,108,101,118,101,108,32,50,53,58,32,98,97,114,111,110,39,115,32,100,101,110,0,0,0,45,118,105,100,109,111,100,101,0,0,0,0,0,0,0,0,87,95,65,100,100,70,105,108,101,58,32,87,97,100,32,102,105,108,101,32,37,115,32,100,111,101,115,110,39,116,32,104,97,118,101,32,73,87,65,68,32,111,114,32,80,87,65,68,32,105,100,0,0,0,0,0,109,97,112,99,111,108,111,114,95,99,99,104,103,0,0,0,80,78,65,77,69,83,0,0,102,114,105,101,110,100,115,0,108,101,118,101,108,32,50,52,58,32,113,117,97,114,114,121,0,0,0,0,0,0,0,0,119,101,97,112,111,110,95,114,101,99,111,105,108,0,0,0,109,97,112,99,111,108,111,114,95,102,99,104,103,0,0,0,109,97,112,99,111,108,111,114,95,109,101,0,0,0,0,0,80,76,83,83,0,0,0,0,108,101,118,101,108,32,50,51,58,32,108,117,110,97,114,32,109,105,110,105,110,103,32,112,114,111,106,101,99,116,0,0,121,111,117,32,99,97,110,39,116,32,113,117,105,99,107,108,111,97,100,10,119,104,105,108,101,32,114,101,99,111,114,100,105,110,103,32,97,32,100,101,109,111,33,10,10,112,114,101,115,115,32,97,32,107,101,121,46,0,0,0,0,0,0,0,101,51,109,51,0,0,0,0,45,102,97,115,116,0,0,0,80,95,76,111,97,100,76,105,110,101,68,101,102,115,58,32,108,105,110,101,100,101,102,32,37,100,32,104,97,115,32,111,117,116,45,111,102,45,114,97,110,103,101,32,115,105,100,101,100,101,102,32,110,117,109,98,101,114,10,0,0,0,0,0,109,97,112,99,111,108,111,114,95,119,97,108,108,0,0,0,121,111,117,114,32,99,111,108,111,117,114,32,105,110,32,109,117,108,116,105,112,108,97,121,101,114,0,0,0,0,0,0,71,97,109,109,97,32,99,111,114,114,101,99,116,105,111,110,32,79,70,70,0,0,0,0,105,100,98,101,104,111,108,100,105,0,0,0,0,0,0,0,108,101,118,101,108,32,50,50,58,32,104,97,98,105,116,97,116,0,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,103,114,105,100,0,0,0,109,97,112,99,111,108,111,114,95,115,110,103,108,0,0,0,108,101,118,101,108,32,50,49,58,32,97,100,109,105,110,105,115,116,114,97,116,105,111,110,32,99,101,110,116,101,114,0,80,114,66,111,111,109,32,118,50,46,49,46,50,45,118,50,46,50,46,54,0,0,0,0,78,69,84,32,71,65,77,69,0,0,0,0,0,0,0,0,68,73,71,52,55,0,0,0,109,97,112,99,111,108,111,114,95,98,97,99,107,0,0,0,115,105,110,103,108,101,32,112,108,97,121,101,114,32,97,114,114,111,119,0,0,0,0,0,108,101,118,101,108,32,50,48,58,32,99,101,110,116,114,97,108,32,112,114,111,99,101,115,115,105,110,103,0,0,0,0,65,117,116,111,109,97,112,32,115,101,116,116,105,110,103,115,0,0,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,104,97,105,114,0,0,0,108,101,118,101,108,32,49,57,58,32,115,104,105,112,112,105,110,103,47,114,101,115,112,97,119,110,105,110,103,0,0,0,89,101,115,0,0,0,0,0,99,114,111,115,115,104,97,105,114,0,0,0,0,0,0,0,108,101,118,101,108,32,49,56,58,32,109,105,108,108,0,0,99,104,97,116,109,97,99,114,111,57,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,105,116,101,109,0,0,0,108,101,118,101,108,32,49,55,58,32,112,114,111,99,101,115,115,105,110,103,32,97,114,101,97,0,0,0,0,0,0,0,67,68,45,82,79,77,32,86,101,114,115,105,111,110,58,32,100,101,102,97,117,108,116,46,99,102,103,32,102,114,111,109,32,99,58,92,100,111,111,109,100,97,116,97,10,0,0,0,73,39,108,108,32,116,97,107,101,32,99,97,114,101,32,111,102,32,105,116,46,0,0,0,99,111,117,110,116,97,98,108,101,32,105,116,101,109,32,115,112,114,105,116,101,0,0,0,108,101,118,101,108,32,49,54,58,32,100,101,101,112,101,115,116,32,114,101,97,99,104,101,115,0,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,56,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,101,110,101,109,121,0,0,108,101,118,101,108,32,49,53,58,32,100,101,97,100,32,122,111,110,101,0,0,0,0,0,110,111,102,117,108,108,115,99,114,101,101,110,0,0,0,0,80,87,65,68,0,0,0,0,67,111,109,101,32,104,101,114,101,33,0,0,0,0,0,0,70,95,69,78,68,0,0,0,99,111,117,110,116,97,98,108,101,32,101,110,101,109,121,32,115,112,114,105,116,101,0,0,108,101,118,101,108,32,49,52,58,32,115,116,101,101,108,32,119,111,114,107,115,0,0,0,73,39,109,32,114,101,97,100,121,32,116,111,32,107,105,99,107,32,98,117,116,116,33,0,100,101,102,97,117,108,116,95,115,107,105,108,108,0,0,0,99,104,97,116,109,97,99,114,111,55,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,115,112,114,116,0,0,0,66,65,76,50,0,0,0,0,108,101,118,101,108,32,49,51,58,32,110,117,107,97,103,101,32,112,114,111,99,101,115,115,105,110,103,0,0,0,0,0,77,95,77,83,69,78,83,0,101,51,109,50,0,0,0,0,45,114,101,115,112,97,119,110,0,0,0,0,0,0,0,0,84,82,65,78,77,65,80,0,78,101,120,116,32,116,105,109,101,44,32,115,99,117,109,98,97,103,46,46,46,0,0,0,103,101,110,101,114,97,108,32,115,112,114,105,116,101,0,0,76,111,119,32,100,101,116,97,105,108,0,0,0,0,0,0,66,101,114,115,101,114,107,0,108,101,118,101,108,32,49,50,58,32,99,114,97,116,101,114,0,0,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,54,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,102,108,97,116,0,0,0,108,101,118,101,108,32,49,49,58,32,115,116,111,114,97,103,101,32,102,97,99,105,108,105,116,121,0,0,0,0,0,0,80,114,66,111,111,109,32,118,50,46,49,46,48,45,50,46,49,46,49,0,0,0,0,0,83,84,67,70,78,48,52,53,0,0,0,0,0,0,0,0,89,111,117,32,115,117,99,107,33,0,0,0,0,0,0,0,108,105,110,101,32,119,47,110,111,32,102,108,111,111,114,47,99,101,105,108,105,110,103,32,99,104,97,110,103,101,115,0,108,101,118,101,108,32,49,48,58,32,114,101,100,101,109,112,116,105,111,110,0,0,0,0,99,104,97,116,109,97,99,114,111,53,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,117,110,115,110,0,0,0,108,101,118,101,108,32,57,58,32,115,116,114,111,110,103,104,111,108,100,0,0,0,0,0,72,101,108,112,33,0,0,0,99,111,109,112,117,116,101,114,32,109,97,112,32,117,110,115,101,101,110,32,108,105,110,101,0,0,0,0,0,0,0,0,108,101,118,101,108,32,56,58,32,109,101,116,97,108,0,0,99,104,97,116,109,97,99,114,111,52,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,101,120,105,116,0,0,0,108,101,118,101,108,32,55,58,32,112,114,105,115,111,110,0,73,39,109,32,110,111,116,32,108,111,111,107,105,110,103,32,116,111,111,32,103,111,111,100,33,0,0,0,0,0,0,0,101,120,105,116,32,108,105,110,101,0,0,0,0,0,0,0,108,101,118,101,108,32,54,58,32,111,112,101,110,32,115,101,97,115,111,110,0,0,0,0,99,104,97,116,109,97,99,114,111,51,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,115,101,99,114,0,0,0,108,101,118,101,108,32,53,58,32,104,97,110,103,101,114,0,37,115,10,0,0,0,0,0,45,97,102,102,105,110,105,116,121,0,0,0,0,0,0,0,102,117,108,108,115,99,114,101,101,110,0,0,0,0,0,0,73,87,65,68,0,0,0,0,73,39,109,32,79,75,46,0,70,95,83,84,65,82,84,0,115,101,99,114,101,116,32,115,101,99,116,111,114,32,98,111,117,110,100,97,114,121,0,0,108,101,118,101,108,32,52,58,32,119,111,114,109,104,111,108,101,0,0,0,0,0,0,0,71,97,109,101,32,115,101,116,116,105,110,103,115,0,0,0,99,104,97,116,109,97,99,114,111,50,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,116,101,108,101,0,0,0,66,65,76,49,0,0,0,0,108,101,118,101,108,32,51,58,32,112,111,119,101,114,32,99,111,110,116,114,111,108,0,0,77,95,83,86,79,76,0,0,101,51,109,49,0,0,0,0,45,110,111,109,111,110,115,116,101,114,115,0,0,0,0,0,80,95,76,111,97,100,83,105,100,101,68,101,102,115,50,58,32,115,105,100,101,100,101,102,32,37,105,32,104,97,115,32,111,117,116,45,111,102,45,114,97,110,103,101,32,115,101,99,116,111,114,32,110,117,109,32,37,117,10,0,0,0,0,0,73,39,109,32,114,101,97,100,121,32,116,111,32,107,105,99,107,32,98,117,116,116,33,0,116,101,108,101,112,111,114,116,101,114,32,108,105,110,101,0,72,105,103,104,32,100,101,116,97,105,108,0,0,0,0,0,105,100,98,101,104,111,108,100,115,0,0,0,0,0,0,0,108,101,118,101,108,32,50,58,32,104,117,109,97,110,32,98,98,113,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,49,0,0,0,0,0,0,109,97,112,95,112,111,105,110,116,95,99,111,111,114,100,0,100,103,112,97,105,110,0,0,108,101,118,101,108,32,49,58,32,115,121,115,116,101,109,32,99,111,110,116,114,111,108,0,80,114,66,111,111,109,32,50,46,48,51,98,101,116,97,0,68,73,71,52,53,0,0,0,78,111,0,0,0,0,0,0,83,104,111,119,32,99,111,111,114,100,105,110,97,116,101,115,32,111,102,32,97,117,116,111,109,97,112,32,112,111,105,110,116,101,114,0,0,0,0,0,100,103,100,116,104,0,0,0,108,101,118,101,108,32,51,50,58,32,103,111,32,50,32,105,116,0,0,0,0,0,0,0,99,104,97,116,109,97,99,114,111,48,0,0,0,0,0,0,109,97,112,95,115,101,99,114,101,116,95,97,102,116,101,114,0,0,0,0,0,0,0,0,100,103,97,99,116,0,0,0,108,101,118,101,108,32,51,49,58,32,99,121,98,101,114,100,101,110,0,0,0,0,0,0,67,104,97,116,32,109,97,99,114,111,115,0,0,0,0,0,83,104,111,119,32,83,101,99,114,101,116,115,32,111,110,108,121,32,97,102,116,101,114,32,101,110,116,101,114,105,110,103,0,0,0,0,0,0,0,0,100,103,97,116,107,0,0,0,108,101,118,101,108,32,51,48,58,32,116,104,101,32,103,97,116,101,119,97,121,32,111,102,32,104,101,108,108,0,0,0,106,111,121,98,95,117,115,101,0,0,0,0,0,0,0,0,104,117,100,99,111,108,111,114,95,120,121,99,111,0,0,0,100,103,115,105,116,0,0,0,108,101,118,101,108,32,50,57,58,32,111,100,121,115,115,101,121,32,111,102,32,110,111,105,115,101,115,0,0,0,0,0,106,111,121,98,95,115,112,101,101,100,0,0,0,0,0,0,65,85,84,79,77,65,80,32,67,79,79,82,68,73,78,65,84,69,83,32,67,79,76,79,82,0,0,0,0,0,0,0,114,97,100,105,111,0,0,0,108,101,118,101,108,32,50,56,58,32,116,104,101,32,115,101,119,101,114,115,0,0,0,0,106,111,121,98,95,115,116,114,97,102,101,0,0,0,0,0,104,117,100,99,111,108,111,114,95,116,105,116,108,0,0,0,115,107,101,97,116,107,0,0,108,101,118,101,108,32,50,55,58,32,97,110,116,105,45,99,104,114,105,115,116,0,0,0,32,102,111,117,110,100,32,37,115,10,0,0,0,0,0,0,73,95,85,112,100,97,116,101,86,105,100,101,111,77,111,100,101,58,32,37,100,120,37,100,32,40,37,115,41,10,0,0,46,119,97,100,0,0,0,0,106,111,121,98,95,102,105,114,101,0,0,0,0,0,0,0,83,95,69,78,68,0,0,0,65,85,84,79,77,65,80,32,76,69,86,69,76,32,84,73,84,76,69,32,67,79,76,79,82,0,0,0,0,0,0,0,115,107,101,115,105,116,0,0,108,101,118,101,108,32,50,54,58,32,98,117,110,107,101,114,0,0,0,0,0,0,0,0,67,82,66,76,85,69,50,0,100,101,104,102,105,108,101,95,50,0,0,0,0,0,0,0,106,111,121,95,100,111,119,110,0,0,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,121,100,111,114,0,0,0,80,85,70,70,0,0,0,0,115,107,101,97,99,116,0,0,108,101,118,101,108,32,50,53,58,32,116,104,101,32,116,101,109,112,108,101,32,111,102,32,100,97,114,107,110,101,115,115,0,0,0,0,0,0,0,0,37,115,10,10,37,115,0,0,101,50,109,57,0,0,0,0,45,102,111,114,99,101,111,108,100,98,115,112,0,0,0,0,45,98,108,111,99,107,109,97,112,0,0,0,0,0,0,0,106,111,121,95,117,112,0,0,121,101,108,108,111,119,32,100,111,111,114,0,0,0,0,0,107,101,101,110,100,116,0,0,105,100,98,101,104,111,108,100,118,0,0,0,0,0,0,0,40,112,114,101,115,115,32,121,32,116,111,32,113,117,105,116,41,0,0,0,0,0,0,0,108,101,118,101,108,32,50,52,58,32,116,104,101,32,102,105,110,97,108,32,102,114,111,110,116,105,101,114,0,0,0,0,106,111,121,95,114,105,103,104,116,0,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,98,100,111,114,0,0,0,107,101,101,110,112,110,0,0,108,101,118,101,108,32,50,51,58,32,116,111,109,98,115,116,111,110,101,0,0,0,0,0,77,66,70,0,0,0,0,0,68,73,71,37,99,0,0,0,106,111,121,95,108,101,102,116,0,0,0,0,0,0,0,0,98,108,117,101,32,100,111,111,114,0,0,0,0,0,0,0,115,115,100,116,104,0,0,0,108,101,118,101,108,32,50,50,58,32,105,109,112,111,115,115,105,98,108,101,32,109,105,115,115,105,111,110,0,0,0,0,117,115,101,95,106,111,121,115,116,105,99,107,0,0,0,0,109,97,112,99,111,108,111,114,95,114,100,111,114,0,0,0,115,115,115,105,116,0,0,0,108,101,118,101,108,32,50,49,58,32,115,108,97,121,101,114,0,0,0,0,0,0,0,0,74,111,121,115,116,105,99,107,32,115,101,116,116,105,110,103,115,0,0,0,0,0,0,0,114,101,100,32,100,111,111,114,0,0,0,0,0,0,0,0,109,97,110,100,116,104,0,0,108,101,118,101,108,32,50,48,58,32,116,104,101,32,100,101,97,116,104,32,100,111,109,97,105,110,0,0,0,0,0,0,107,101,121,95,115,99,114,101,101,110,115,104,111,116,0,0,109,97,112,99,111,108,111,114,95,121,107,101,121,0,0,0,108,101,118,101,108,32,49,57,58,32,110,109,101,0,0,0,109,97,110,97,116,107,0,0,80,95,83,112,97,119,110,80,108,97,121,101,114,58,32,97,116,116,101,109,112,116,32,116,111,32,115,112,97,119,110,32,112,108,97,121,101,114,32,97,116,32,117,110,97,118,97,105,108,97,98,108,101,32,115,116,97,114,116,32,112,111,105,110,116,0,0,0,0,0,0,0,107,101,121,95,119,101,97,112,111,110,57,0,0,0,0,0,121,101,108,108,111,119,32,107,101,121,0,0,0,0,0,0,98,111,115,100,116,104,0,0,108,101,118,101,108,32,49,56,58,32,110,101,117,114,111,115,112,104,101,114,101,0,0,0,107,101,121,95,119,101,97,112,111,110,56,0,0,0,0,0,109,97,112,99,111,108,111,114,95,98,107,101,121,0,0,0,98,111,115,112,110,0,0,0,108,101,118,101,108,32,49,55,58,32,99,111,109,112,111,117,110,100,0,0,0,0,0,0,47,0,0,0,0,0,0,0,79,112,101,110,71,76,0,0,77,95,68,79,79,77,0,0,32,97,100,100,105,110,103,32,37,115,10,0,0,0,0,0,107,101,121,95,119,101,97,112,111,110,55,0,0,0,0,0,83,95,83,84,65,82,84,0,98,108,117,101,32,107,101,121,0,0,0,0,0,0,0,0,98,111,115,115,105,116,0,0,108,101,118,101,108,32,49,54,58,32,116,104,101,32,111,109,101,110,0,0,0,0,0,0,67,82,89,69,76,76,79,87,0,0,0,0,0,0,0,0,100,101,104,102,105,108,101,95,49,0,0,0,0,0,0,0,107,101,121,95,119,101,97,112,111,110,54,0,0,0,0,0,109,97,112,99,111,108,111,114,95,114,107,101,121,0,0,0,66,76,85,68,0,0,0,0,98,111,115,99,117,98,0,0,108,101,118,101,108,32,49,53,58,32,116,104,101,32,116,119,105,108,105,103,104,116,0,0,77,95,79,80,84,84,84,76,0,0,0,0,0,0,0,0,101,50,109,56,0,0,0,0,77,95,76,111,97,100,68,101,102,97,117,108,116,115,58,32,76,111,97,100,32,115,121,115,116,101,109,32,100,101,102,97,117,108,116,115,46,10,0,0,80,95,76,111,97,100,83,117,98,115,101,99,116,111,114,115,58,32,110,111,32,115,117,98,115,101,99,116,111,114,115,32,105,110,32,108,101,118,101,108,0,0,0,0,0,0,0,0,107,101,121,95,119,101,97,112,111,110,53,0,0,0,0,0,114,101,100,32,107,101,121,0,98,111,115,112,105,116,0,0,105,100,98,101,104,111,108,100,109,0,0,0,0,0,0,0,97,114,101,32,121,111,117,32,115,117,114,101,32,121,111,117,32,119,97,110,116,32,116,111,32,101,110,100,32,116,104,101,32,103,97,109,101,63,10,10,112,114,101,115,115,32,121,32,111,114,32,110,46,0,0,0,108,101,118,101,108,32,49,52,58,32,103,101,110,101,115,105,115,0,0,0,0,0,0,0,107,101,121,95,119,101,97,112,111,110,52,0,0,0,0,0,109,97,112,99,111,108,111,114,95,99,108,115,100,0,0,0,103,101,116,112,111,119,0,0,108,101,118,101,108,32,49,51,58,32,116,104,101,32,99,114,121,112,116,0,0,0,0,0,108,120,100,111,111,109,32,118,49,46,51,46,50,43,0,0,83,84,67,70,78,37,46,51,100,0,0,0,0,0,0,0,107,101,121,95,119,101,97,112,111,110,51,0,0,0,0,0,108,105,110,101,32,97,116,32,115,101,99,116,111,114,32,119,105,116,104,32,102,108,111,111,114,32,61,32,99,101,105,108,105,110,103,0,0,0,0,0,102,108,97,109,115,116,0,0,108,101,118,101,108,32,49,50,58,32,115,112,101,101,100,0,107,101,121,95,119,101,97,112,111,110,50,0,0,0,0,0,109,97,112,99,111,108,111,114,95,99,99,104,103,0,0,0,102,108,97,109,101,0,0,0,108,101,118,101,108,32,49,49,58,32,104,117,110,116,101,100,0,0,0,0,0,0,0,0,107,101,121,95,119,101,97,112,111,110,49,0,0,0,0,0,108,105,110,101,32,97,116,32,99,101,105,108,105,110,103,32,104,101,105,103,104,116,32,99,104,97,110,103,101,0,0,0,105,116,109,98,107,0,0,0,108,101,118,101,108,32,49,48,58,32,111,110,115,108,97,117,103,104,116,0,0,0,0,0,107,101,121,95,119,101,97,112,111,110,116,111,103,103,108,101,0,0,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,102,99,104,103,0,0,0,98,100,99,108,115,0,0,0,108,101,118,101,108,32,57,58,32,97,98,97,116,116,111,105,114,101,0,0,0,0,0,0,107,101,121,95,99,104,97,116,112,108,97,121,101,114,52,0,108,105,110,101,32,97,116,32,102,108,111,111,114,32,104,101,105,103,104,116,32,99,104,97,110,103,101,0,0,0,0,0,98,100,111,112,110,0,0,0,108,101,118,101,108,32,56,58,32,114,101,97,108,109,0,0,107,101,121,95,99,104,97,116,112,108,97,121,101,114,51,0,109,97,112,99,111,108,111,114,95,119,97,108,108,0,0,0,116,105,110,107,0,0,0,0,108,101,118,101,108,32,55,58,32,99,97,117,103,104,116,121,97,114,100,0,0,0,0,0,103,108,0,0,0,0,0,0,73,95,71,101,116,84,105,109,101,95,69,114,114,111,114,58,32,71,101,116,84,105,109,101,40,41,32,117,115,101,100,32,98,101,102,111,114,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,0,0,0,84,72,73,83,32,73,83,32,78,79,32,77,69,83,83,65,71,69,33,10,80,97,103,101,32,105,110,116,101,110,116,105,111,110,97,108,108,121,32,108,101,102,116,32,98,108,97,110,107,46,0,0,0,0,0,0,87,95,65,100,100,70,105,108,101,58,32,99,111,117,108,100,110,39,116,32,111,112,101,110,32,37,115,0,0,0,0,0,107,101,121,95,99,104,97,116,112,108,97,121,101,114,50,0,67,95,69,78,68,0,0,0,110,111,114,109,97,108,32,49,115,32,119,97,108,108,0,0,99,104,103,117,110,0,0,0,108,101,118,101,108,32,54,58,32,98,97,114,111,110,39,115,32,108,97,105,114,0,0,0,67,82,79,82,65,78,71,69,0,0,0,0,0,0,0,0,83,84,70,68,69,65,68,48,0,0,0,0,0,0,0,0,119,97,100,102,105,108,101,95,50,0,0,0,0,0,0,0,107,101,121,95,99,104,97,116,112,108,97,121,101,114,49,0,109,97,112,99,111,108,111,114,95,103,114,105,100,0,0,0,66,70,71,70,0,0,0,0,109,101,116,97,108,0,0,0,108,101,118,101,108,32,53,58,32,103,104,111,115,116,32,116,111,119,110,0,0,0,0,0,95,0,0,0,0,0,0,0,101,50,109,55,0,0,0,0,80,95,76,111,97,100,78,111,100,101,115,58,32,110,111,32,110,111,100,101,115,32,105,110,32,108,101,118,101,108,0,0,107,101,121,95,122,111,111,109,111,117,116,0,0,0,0,0,103,114,105,100,32,108,105,110,101,115,0,0,0,0,0,0,104,111,111,102,0,0,0,0,73,110,118,105,110,99,105,98,105,108,105,116,121,0,0,0,121,111,117,32,99,97,110,39,116,32,101,110,100,32,97,32,110,101,116,103,97,109,101,33,10,10,112,114,101,115,115,32,97,32,107,101,121,46,0,0,108,101,118,101,108,32,52,58,32,99,97,103,101,100,0,0,107,101,121,95,122,111,111,109,105,110,0,0,0,0,0,0,109,97,112,99,111,108,111,114,95,98,97,99,107,0,0,0,112,117,110,99,104,0,0,0,108,101,118,101,108,32,51,58,32,97,122,116,101,99,0,0,98,111,111,109,32,118,50,46,48,50,0,0,0,0,0,0,68,73,71,37,46,49,100,0,107,101,121,95,114,101,118,101,114,115,101,0,0,0,0,0,98,97,99,107,103,114,111,117,110,100,0,0,0,0,0,0,98,97,114,101,120,112,0,0,108,101,118,101,108,32,50,58,32,119,101,108,108,32,111,102,32,115,111,117,108,115,0,0,107,101,121,95,109,97,112,95,111,118,101,114,108,97,121,0,77,95,83,84,65,84,0,0,110,111,119,97,121,0,0,0,108,101,118,101,108,32,49,58,32,99,111,110,103,111,0,0,107,101,121,95,109,97,112,95,114,111,116,97,116,101,0,0,97,109,109,111,95,121,101,108,108,111,119,0,0,0,0,0,118,105,108,97,99,116,0,0,108,101,118,101,108,32,51,50,58,32,103,114,111,115,115,101,0,0,0,0,0,0,0,0,107,101,121,95,109,97,112,95,103,114,105,100,0,0,0,0,65,77,77,79,32,79,75,47,71,79,79,68,0,0,0,0,98,115,112,119,108,107,0,0,108,101,118,101,108,32,51,49,58,32,119,111,108,102,101,110,115,116,101,105,110,0,0,0,107,101,121,95,109,97,112,95,99,108,101,97,114,0,0,0,97,109,109,111,95,114,101,100,0,0,0,0,0,0,0,0,98,115,112,97,99,116,0,0,101,49,109,49,0,0,0,0,108,101,118,101,108,32,51,48,58,32,105,99,111,110,32,111,102,32,115,105,110,0,0,0,107,101,121,95,109,97,112,95,109,97,114,107,0,0,0,0,65,77,77,79,32,76,79,87,47,79,75,0,0,0,0,0,100,109,97,99,116,0,0,0,108,101,118,101,108,32,50,57,58,32,116,104,101,32,108,105,118,105,110,103,32,101,110,100,0,0,0,0,0,0,0,0,37,115,37,115,37,115,37,115,37,115,0,0,0,0,0,0,51,50,98,105,116,0,0,0,37,115,10,0,0,0,0,0,82,95,70,108,117,115,104,87,104,111,108,101,67,111,108,117,109,110,115,32,99,97,108,108,101,100,32,119,105,116,104,111,117,116,32,98,101,105,110,103,32,105,110,105,116,105,97,108,105,122,101,100,46,10,0,0,121,111,117,39,114,101,32,108,117,99,107,121,32,105,32,100,111,110,39,116,32,115,109,97,99,107,10,121,111,117,32,102,111,114,32,116,104,105,110,107,105,110,103,32,97,98,111,117,116,32,108,101,97,118,105,110,103,46,0,0,0,0,0,0,46,103,119,97,0,0,0,0,107,101,121,95,109,97,112,95,102,111,108,108,111,119,0,0,67,95,83,84,65,82,84,0,97,114,109,111,114,95,103,114,101,101,110,0,0,0,0,0,98,103,97,99,116,0,0,0,108,101,118,101,108,32,50,56,58,32,116,104,101,32,115,112,105,114,105,116,32,119,111,114,108,100,0,0,0,0,0,0,67,82,66,76,85,69,0,0,83,84,70,71,79,68,48,0,107,101,121,95,109,97,112,95,103,111,98,105,103,0,0,0,65,82,77,79,82,32,71,79,79,68,47,69,88,84,82,65,0,0,0,0,0,0,0,0,66,70,71,71,0,0,0,0,112,111,115,97,99,116,0,0,108,101,118,101,108,32,50,55,58,32,109,111,110,115,116,101,114,32,99,111,110,100,111,0,77,95,83,65,86,69,71,0,101,50,109,54,0,0,0,0,80,95,76,111,97,100,78,111,100,101,115,58,32,116,114,105,118,105,97,108,32,109,97,112,32,40,110,111,32,110,111,100,101,115,44,32,111,110,101,32,115,117,98,115,101,99,116,111,114,41,10,0,0,0,0,0,107,101,121,95,109,97,112,95,122,111,111,109,111,117,116,0,97,114,109,111,114,95,121,101,108,108,111,119,0,0,0,0,115,107,101,100,116,104,0,0,105,100,98,101,104,111,108,100,104,0,0,0,0,0,0,0,77,101,115,115,97,103,101,115,32,79,78,0,0,0,0,0,108,101,118,101,108,32,50,54,58,32,116,104,101,32,97,98,97,110,100,111,110,101,100,32,109,105,110,101,115,0,0,0,107,101,121,95,109,97,112,95,122,111,111,109,105,110,0,0,65,82,77,79,82,32,79,75,47,71,79,79,68,0,0,0,112,101,100,116,104,0,0,0,108,101,118,101,108,32,50,53,58,32,98,108,111,111,100,102,97,108,108,115,0,0,0,0,98,111,111,109,32,118,50,46,48,49,0,0,0,0,0,0,112,114,98,111,111,109,0,0,80,108,97,121,101,114,32,52,58,32,0,0,0,0,0,0,107,101,121,95,109,97,112,95,100,111,119,110,0,0,0,0,68,79,71,83,0,0,0,0,97,114,109,111,114,95,114,101,100,0,0,0,0,0,0,0,107,110,116,100,116,104,0,0,73,95,83,104,117,116,100,111,119,110,83,111,117,110,100,58,32,0,0,0,0,0,0,0,108,101,118,101,108,32,50,52,58,32,116,104,101,32,99,104,97,115,109,0,0,0,0,0,45,110,111,100,114,97,119,0,107,101,121,95,109,97,112,95,117,112,0,0,0,0,0,0,84,78,84,49,0,0,0,0,65,82,77,79,82,32,76,79,87,47,79,75,0,0,0,0,118,105,108,100,116,104,0,0,69,120,105,116,105,110,103,32,111,110,32,115,105,103,110,97,108,58,32,0,0,0,0,0,108,101,118,101,108,32,50,51,58,32,98,97,114,114,101,108,115,32,111,39,32,102,117,110,0,0,0,0,0,0,0,0,87,95,73,110,105,116,67,97,99,104,101,58,32,102,97,105,108,101,100,32,116,111,32,109,109,97,112,0,0,0,0,0,107,101,121,95,109,97,112,95,108,101,102,116,0,0,0,0,84,76,80,50,0,0,0,0,104,101,97,108,116,104,95,103,114,101,101,110,0,0,0,0,98,115,112,100,116,104,0,0,82,95,67,97,99,104,101,80,97,116,99,104,78,117,109,58,32,80,97,116,99,104,101,115,32,110,111,116,32,105,110,105,116,105,97,108,105,122,101,100,0,0,0,0,0,0,0,0,119,98,0,0,0,0,0,0,108,101,118,101,108,32,50,50,58,32,116,104,101,32,99,97,116,97,99,111,109,98,115,0,107,101,121,95,109,97,112,95,114,105,103,104,116,0,0,0,84,76,77,80,0,0,0,0,72,69,65,76,84,72,32,71,79,79,68,47,69,88,84,82,65,0,0,0,0,0,0,0,115,112,105,100,116,104,0,0,90,95,77,97,108,108,111,99,58,32,70,97,105,108,117,114,101,32,116,114,121,105,110,103,32,116,111,32,97,108,108,111,99,97,116,101,32,37,108,117,32,98,121,116,101,115,0,0,108,101,118,101,108,32,50,49,58,32,110,105,114,118,97,110,97,0,0,0,0,0,0,0,10,82,95,73,110,105,116,68,97,116,97,58,32,0,0,0,107,101,121,95,109,97,112,0,66,82,83,49,0,0,0,0,104,101,97,108,116,104,95,121,101,108,108,111,119,0,0,0,99,121,98,100,116,104,0,0,108,101,118,101,108,32,50,48,58,32,103,111,116,99,104,97,33,0,0,0,0,0,0,0,83,101,99,78,111,100,101,115,0,0,0,0,0,0,0,0,90,95,66,70,114,101,101,58,32,82,101,102,114,101,101,32,105,110,32,122,111,110,101,32,37,115,0,0,0,0,0,0,107,101,121,95,101,110,116,101,114,0,0,0,0,0,0,0,80,79,66,50,0,0,0,0,72,69,65,76,84,72,32,79,75,47,71,79,79,68,0,0,67,82,69,68,73,84,0,0,98,114,115,100,116,104,0,0,108,101,118,101,108,32,49,57,58,32,116,104,101,32,99,105,116,97,100,101,108,0,0,0,47,117,115,114,47,115,104,97,114,101,47,100,111,111,109,0,51,50,0,0,0,0,0,0,27,91,48,109,0,0,0,0,82,95,71,101,116,68,114,97,119,83,112,97,110,70,117,110,99,58,32,117,110,100,101,102,105,110,101,100,32,102,117,110,99,116,105,111,110,32,40,37,100,44,32,37,100,41,0,0,87,73,76,86,37,100,37,100,0,0,0,0,0,0,0,0,82,95,70,108,117,115,104,72,84,67,111,108,117,109,110,115,32,99,97,108,108,101,100,32,119,105,116,104,111,117,116,32,98,101,105,110,103,32,105,110,105,116,105,97,108,105,122,101,100,46,10,0,0,0,0,0,106,117,115,116,32,108,101,97,118,101,46,32,119,104,101,110,32,121,111,117,32,99,111,109,101,10,98,97,99,107,44,32,105,39,108,108,32,98,101,32,119,97,105,116,105,110,103,32,119,105,116,104,32,97,32,98,97,116,46,0,0,0,0,0,46,108,109,112,0,0,0,0,107,101,121,95,98,97,99,107,115,112,97,99,101,0,0,0,80,79,66,49,0,0,0,0,98,97,100,32,116,101,120,116,117,114,101,32,39,37,115,39,32,105,110,32,115,105,100,101,100,101,102,32,37,100,10,0,104,101,97,108,116,104,95,114,101,100,0,0,0,0,0,0,115,107,108,100,116,104,0,0,108,101,118,101,108,32,49,56,58,32,116,104,101,32,99,111,117,114,116,121,97,114,100,0,67,82,82,69,68,0,0,0,112,108,101,97,115,101,32,100,111,110,39,116,32,108,101,97,118,101,44,32,116,104,101,114,101,39,115,32,109,111,114,101,10,100,101,109,111,110,115,32,116,111,32,116,111,97,115,116,33,0,0,0,0,0,0,0,83,84,70,75,73,76,76,37,100,0,0,0,0,0,0,0,119,97,100,102,105,108,101,95,49,0,0,0,0,0,0,0,87,95,71,101,116,78,117,109,70,111,114,78,97,109,101,58,32,37,46,56,115,32,110,111,116,32,102,111,117,110,100,0,107,101,121,95,99,104,97,116,0,0,0,0,0,0,0,0,72,68,66,54,0,0,0,0,72,69,65,76,84,72,32,76,79,87,47,79,75,0,0,0,80,76,83,70,0,0,0,0])
.concat([99,97,99,100,116,104,0,0,108,101,118,101,108,32,49,55,58,32,116,101,110,101,109,101,110,116,115,0,0,0,0,0,34,98,111,111,109,32,99,111,109,112,97,116,105,98,105,108,105,116,121,34,0,0,0,0,84,82,65,78,77,65,80,0,114,98,0,0,0,0,0,0,101,50,109,53,0,0,0,0,80,95,76,111,97,100,71,76,83,101,103,115,58,32,110,111,32,103,108,115,101,103,115,32,105,110,32,108,101,118,101,108,0,0,0,0,0,0,0,0,107,101,121,95,97,117,116,111,114,117,110,0,0,0,0,0,72,68,66,53,0,0,0,0,104,117,100,95,110,111,115,101,99,114,101,116,115,0,0,0,115,103,116,100,116,104,0,0,78,111,32,67,108,105,112,112,105,110,103,32,50,0,0,0,77,101,115,115,97,103,101,115,32,79,70,70,0,0,0,0,108,101,118,101,108,32,49,54,58,32,115,117,98,117,114,98,115,0,0,0,0,0,0,0,107,101,121,95,112,97,117,115,101,0,0,0,0,0,0,0,72,68,66,52,0,0,0,0,72,73,68,69,32,83,69,67,82,69,84,83,0,0,0,0,98,103,100,116,104,50,0,0,108,101,118,101,108,32,49,53,58,32,105,110,100,117,115,116,114,105,97,108,32,122,111,110,101,0,0,0,0,0,0,0,37,115,32,105,115,32,116,117,114,98,111,33,0,0,0,0,100,111,111,109,50,102,46,119,97,100,0,0,0,0,0,0,80,108,97,121,101,114,32,51,58,32,0,0,0,0,0,0,107,101,121,95,115,112,121,0,72,68,66,51,0,0,0,0,72,69,65,68,83,45,85,80,32,68,73,83,80,76,65,89,0,0,0,0,0,0,0,0,98,103,100,116,104,49,0,0,108,101,118,101,108,32,49,52,58,32,116,104,101,32,105,110,109,111,115,116,32,100,101,110,115,0,0,0,0,0,0,0,71,65,77,77,65,84,66,76,0,0,0,0,0,0,0,0,107,101,121,95,103,97,109,109,97,0,0,0,0,0,0,0,72,68,66,50,0,0,0,0,115,116,115,95,116,114,97,100,105,116,105,111,110,97,108,95,107,101,121,115,0,0,0,0,112,111,100,116,104,51,0,0,70,97,105,108,101,100,32,116,111,32,108,111,99,97,116,101,32,116,114,105,103,32,116,97,98,108,101,115,0,0,0,0,108,101,118,101,108,32,49,51,58,32,100,111,119,110,116,111,119,110,0,0,0,0,0,0,83,84,89,83,78,85,77,37,100,0,0,0,0,0,0,0,107,101,121,95,113,117,105,116,0,0,0,0,0,0,0,0,72,68,66,49,0,0,0,0,80,95,73,110,105,116,83,119,105,116,99,104,76,105,115,116,58,32,117,110,107,110,111,119,110,32,116,101,120,116,117,114,101,32,37,115,10,0,0,0,83,73,78,71,76,69,32,75,69,89,32,68,73,83,80,76,65,89,0,0,0,0,0,0,112,111,100,116,104,50,0,0,83,95,73,110,105,116,58,32,100,101,102,97,117,108,116,32,115,102,120,32,118,111,108,117,109,101,32,37,100,10,0,0,108,101,118,101,108,32,49,50,58,32,116,104,101,32,102,97,99,116,111,114,121,0,0,0,107,101,121,95,113,117,105,99,107,108,111,97,100,0,0,0,83,77,82,84,0,0,0,0,115,116,115,95,112,99,116,95,97,108,119,97,121,115,95,103,114,97,121,0,0,0,0,0,112,111,100,116,104,49,0,0,108,101,118,101,108,32,49,49,58,32,39,111,39,32,111,102,32,100,101,115,116,114,117,99,116,105,111,110,33,0,0,0,107,101,121,95,109,101,115,115,97,103,101,115,0,0,0,0,83,77,71,84,0,0,0,0,71,82,65,89,32,37,0,0,112,100,105,101,104,105,0,0,100,101,109,111,52,0,0,0,108,101,118,101,108,32,49,48,58,32,114,101,102,117,101,108,105,110,103,32,98,97,115,101,0,0,0,0,0,0,0,0,107,101,121,95,101,110,100,103,97,109,101,0,0,0,0,0,83,77,66,84,0,0,0,0,115,116,115,95,97,108,119,97,121,115,95,114,101,100,0,0,112,108,100,101,116,104,0,0,100,101,109,111,51,0,0,0,108,101,118,101,108,32,57,58,32,116,104,101,32,112,105,116,0,0,0,0,0,0,0,0,47,117,115,114,47,108,111,99,97,108,47,115,104,97,114,101,47,100,111,111,109,0,0,0,49,54,98,105,116,0,0,0,13,0,0,0,0,0,0,0,82,95,70,108,117,115,104,81,117,97,100,67,111,108,117,109,110,32,99,97,108,108,101,100,32,119,105,116,104,111,117,116,32,98,101,105,110,103,32,105,110,105,116,105,97,108,105,122,101,100,46,10,0,0,0,0,108,111,111,107,44,32,98,117,100,46,32,121,111,117,32,108,101,97,118,101,32,110,111,119,10,97,110,100,32,121,111,117,32,102,111,114,102,101,105,116,32,121,111,117,114,32,98,111,100,121,32,99,111,117,110,116,33,0,0,0,0,0,0,0,87,95,76,117,109,112,76,101,110,103,116,104,58,32,37,105,32,62,61,32,110,117,109,108,117,109,112,115,0,0,0,0,107,101,121,95,113,117,105,99,107,115,97,118,101,0,0,0,84,82,69,68,0,0,0,0,82,95,84,101,120,116,117,114,101,78,117,109,70,111,114,78,97,109,101,58,32,37,46,56,115,32,110,111,116,32,102,111,117,110,100,0,0,0,0,0,85,83,69,32,82,69,68,32,78,85,77,66,69,82,83,0,115,107,101,115,119,103,0,0,67,82,69,68,73,84,0,0,114,98,0,0,0,0,0,0,108,101,118,101,108,32,56,58,32,116,114,105,99,107,115,32,97,110,100,32,116,114,97,112,115,0,0,0,0,0,0,0,67,82,71,79,76,68,0,0,83,84,70,69,86,76,37,100,0,0,0,0,0,0,0,0,70,105,108,101,115,0,0,0,107,101,121,95,104,117,100,0,84,71,82,78,0,0,0,0,83,84,65,84,85,83,32,66,65,82,0,0,0,0,0,0,80,76,83,71,0,0,0,0,99,108,97,119,0,0,0,0,72,69,76,80,50,0,0,0,108,101,118,101,108,32,55,58,32,100,101,97,100,32,115,105,109,112,108,101,0,0,0,0,121,111,117,32,99,97,110,39,116,32,108,111,97,100,32,97,32,103,97,109,101,10,119,104,105,108,101,32,114,101,99,111,114,100,105,110,103,32,97,110,32,111,108,100,32,100,101,109,111,33,10,10,112,114,101,115,115,32,97,32,107,101,121,46,0,0,0,0,0,0,0,0,83,72,84,71,0,0,0,0,101,50,109,52,0,0,0,0,80,95,73,110,105,116,80,105,99,65,110,105,109,115,58,32,98,97,100,32,99,121,99,108,101,32,102,114,111,109,32,37,115,32,116,111,32,37,115,0,80,95,76,111,97,100,83,101,103,115,58,32,102,114,111,110,116,32,111,102,32,115,101,103,32,37,105,32,104,97,115,32,110,111,32,115,105,100,101,100,101,102,10,0,0,0,0,0,107,101,121,95,115,111,117,110,100,118,111,108,117,109,101,0,84,66,76,85,0,0,0,0,77,95,87,69,65,80,0,0,118,105,108,97,116,107,0,0,100,101,109,111,50,0,0,0,105,100,99,108,105,112,0,0,116,104,105,115,32,105,115,32,116,104,101,32,115,104,97,114,101,119,97,114,101,32,118,101,114,115,105,111,110,32,111,102,32,100,111,111,109,46,10,10,121,111,117,32,110,101,101,100,32,116,111,32,111,114,100,101,114,32,116,104,101,32,101,110,116,105,114,101,32,116,114,105,108,111,103,121,46,10,10,112,114,101,115,115,32,97,32,107,101,121,46,0,0,0,0,0,108,101,118,101,108,32,54,58,32,116,104,101,32,99,114,117,115,104,101,114,0,0,0,0,109,97,112,37,48,50,100,0,107,101,121,95,108,111,97,100,103,97,109,101,0,0,0,0,67,79,76,53,0,0,0,0,100,111,111,109,95,119,101,97,112,111,110,95,116,111,103,103,108,101,115,0,0,0,0,0,115,107,101,112,99,104,0,0,100,101,109,111,49,0,0,0,108,101,118,101,108,32,53,58,32,116,104,101,32,119,97,115,116,101,32,116,117,110,110,101,108,115,0,0,0,0,0,0,116,97,115,100,111,111,109,32,99,111,109,112,97,116,105,98,105,108,105,116,121,0,0,0,80,108,97,121,101,114,32,50,58,32,0,0,0,0,0,0,107,101,121,95,115,97,118,101,103,97,109,101,0,0,0,0,70,83,75,85,0,0,0,0,69,110,97,98,108,101,32,70,105,115,116,47,67,104,97,105,110,115,97,119,10,38,32,83,71,47,83,83,71,32,116,111,103,103,108,101,0,0,0,0,115,103,116,97,116,107,0,0,84,73,84,76,69,80,73,67,0,0,0,0,0,0,0,0,108,101,118,101,108,32,52,58,32,116,104,101,32,102,111,99,117,115,0,0,0,0,0,0,107,101,121,95,115,112,101,101,100,0,0,0,0,0,0,0,67,69,89,69,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,57,0,115,107,108,97,116,107,0,0,109,97,115,107,32,102,111,114,32,115,116,100,101,114,114,32,99,111,110,115,111,108,101,32,111,117,116,112,117,116,58,32,0,0,0,0,0,0,0,0,108,101,118,101,108,32,51,58,32,116,104,101,32,103,97,110,116,108,101,116,0,0,0,0,107,101,121,95,115,116,114,97,102,101,0,0,0,0,0,0,69,76,69,67,0,0,0,0,57,116,104,32,67,72,79,73,67,69,32,87,69,65,80,79,78,0,0,0,0,0,0,0,112,101,115,105,116,0,0,0,45,99,101,114,114,0,0,0,108,101,118,101,108,32,50,58,32,117,110,100,101,114,104,97,108,108,115,0,0,0,0,0,72,69,76,80,50,0,0,0,107,101,121,95,117,115,101,0,84,82,69,50,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,56,0,109,97,110,115,105,116,0,0,37,99,0,0,0,0,0,0,108,101,118,101,108,32,49,58,32,101,110,116,114,121,119,97,121,0,0,0,0,0,0,0,107,101,121,95,102,105,114,101,0,0,0,0,0,0,0,0,84,82,69,49,0,0,0,0,56,116,104,32,67,72,79,73,67,69,32,87,69,65,80,79,78,0,0,0,0,0,0,0,118,105,108,115,105,116,0,0,109,97,115,107,32,102,111,114,32,115,116,100,111,117,116,32,99,111,110,115,111,108,101,32,111,117,116,112,117,116,58,32,0,0,0,0,0,0,0,0,69,52,77,57,58,32,70,101,97,114,0,0,0,0,0,0,101,49,109,50,0,0,0,0,107,101,121,95,115,116,114,97,102,101,114,105,103,104,116,0,67,79,76,54,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,55,0,107,110,116,115,105,116,0,0,45,99,111,117,116,0,0,0,69,52,77,56,58,32,85,110,116,111,32,84,104,101,32,67,114,117,101,108,0,0,0,0,47,117,115,114,47,115,104,97,114,101,47,103,97,109,101,115,47,100,111,111,109,0,0,0,49,54,0,0,0,0,0,0,8,0,0,0,0,0,0,0,98,114,100,114,95,98,114,0,105,102,32,105,32,119,101,114,101,32,121,111,117,114,32,98,111,115,115,44,32,105,39,100,32,10,32,100,101,97,116,104,109,97,116,99,104,32,121,97,32,105,110,32,97,32,109,105,110,117,116,101,33,0,0,0,87,95,73,110,105,116,67,97,99,104,101,10,0,0,0,0,107,101,121,95,115,116,114,97,102,101,108,101,102,116,0,0,67,66,82,65,0,0,0,0,82,95,70,108,97,116,78,117,109,70,111,114,78,97,109,101,58,32,37,46,56,115,32,110,111,116,32,102,111,117,110,100,0,0,0,0,0,0,0,0,55,116,104,32,67,72,79,73,67,69,32,87,69,65,80,79,78,0,0,0,0,0,0,0,98,115,112,115,105,116,0,0,73,67,87,69,70,68,65,0,69,52,77,55,58,32,65,110,100,32,72,101,108,108,32,70,111,108,108,111,119,101,100,0,100,111,111,109,50,46,119,97,100,0,0,0,0,0,0,0,67,82,66,82,79,87,78,0,83,84,70,79,85,67,72,37,100,0,0,0,0,0,0,0,83,95,83,116,97,114,116,83,111,117,110,100,65,116,86,111,108,117,109,101,58,32,66,97,100,32,115,102,120,32,35,58,32,37,100,0,0,0,0,0,100,101,109,111,95,115,109,111,111,116,104,116,117,114,110,115,102,97,99,116,111,114,0,0,107,101,121,95,109,101,110,117,95,101,110,116,101,114,0,0,67,65,78,68,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,54,0,83,65,87,71,0,0,0,0,115,112,105,115,105,116,0,0,37,115,10,0,0,0,0,0,103,108,95,109,97,112,37,48,50,100,0,0,0,0,0,0,69,52,77,54,58,32,65,103,97,105,110,115,116,32,84,104,101,101,32,87,105,99,107,101,100,108,121,0,0,0,0,0,77,95,76,83,82,71,72,84,0,0,0,0,0,0,0,0,101,50,109,51,0,0,0,0,80,95,76,111,97,100,83,101,103,115,58,32,110,111,32,115,101,103,115,32,105,110,32,108,101,118,101,108,0,0,0,0,107,101,121,95,109,101,110,117,95,101,115,99,97,112,101,0,67,79,76,52,0,0,0,0,54,116,104,32,67,72,79,73,67,69,32,87,69,65,80,79,78,0,0,0,0,0,0,0,99,121,98,115,105,116,0,0,37,100,32,99,111,109,109,97,110,100,45,108,105,110,101,32,97,114,103,115,58,10,0,0,78,111,32,67,108,105,112,112,105,110,103,32,49,0,0,0,67,104,97,110,103,101,32,109,117,115,105,99,0,0,0,0,97,114,101,32,121,111,117,32,115,117,114,101,63,32,116,104,105,115,32,115,107,105,108,108,32,108,101,118,101,108,10,105,115,110,39,116,32,101,118,101,110,32,114,101,109,111,116,101,108,121,32,102,97,105,114,46,10,10,112,114,101,115,115,32,121,32,111,114,32,110,46,0,69,52,77,53,58,32,84,104,101,121,32,87,105,108,108,32,82,101,112,101,110,116,0,0,82,95,73,110,105,116,83,112,114,105,116,101,115,58,32,78,111,32,112,97,116,99,104,101,115,32,102,111,117,110,100,32,102,111,114,32,37,46,56,115,32,102,114,97,109,101,32,37,99,0,0,0,0,0,0,0,80,95,85,110,65,114,99,104,105,118,101,84,104,105,110,107,101,114,115,58,32,85,110,107,110,111,119,110,32,116,99,108,97,115,115,32,37,105,32,105,110,32,115,97,118,101,103,97,109,101,0,0,0,0,0,0,105,100,109,117,115,0,0,0,107,101,121,95,109,101,110,117,95,98,97,99,107,115,112,97,99,101,0,0,0,0,0,0,67,79,76,51,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,53,0,98,114,115,115,105,116,0,0,82,117,110,97,119,97,121,32,113,117,111,116,101,100,32,115,116,114,105,110,103,32,105,110,32,114,101,115,112,111,110,115,101,32,102,105,108,101,0,0,69,52,77,52,58,32,85,110,114,117,108,121,32,69,118,105,108,0,0,0,0,0,0,0,100,111,115,100,111,111,109,32,99,111,109,112,97,116,105,98,105,108,105,116,121,0,0,0,82,95,80,114,111,106,101,99,116,83,112,114,105,116,101,58,32,77,105,115,115,105,110,103,32,115,112,114,105,116,101,102,114,97,109,101,115,32,37,105,32,58,32,37,105,0,0,0,80,108,97,121,101,114,32,49,58,32,0,0,0,0,0,0,107,101,121,95,109,101,110,117,95,100,111,119,110,0,0,0,67,79,76,50,0,0,0,0,53,116,104,32,67,72,79,73,67,69,32,87,69,65,80,79,78,0,0,0,0,0,0,0,99,97,99,115,105,116,0,0,10,82,101,115,112,111,110,115,101,32,102,105,108,101,32,101,109,112,116,121,33,10,0,0,69,52,77,51,58,32,83,101,118,101,114,32,84,104,101,32,87,105,99,107,101,100,0,0,107,101,121,95,109,101,110,117,95,117,112,0,0,0,0,0,67,79,76,49,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,52,0,115,103,116,115,105,116,0,0,70,111,117,110,100,32,114,101,115,112,111,110,115,101,32,102,105,108,101,32,37,115,10,0,69,52,77,50,58,32,80,101,114,102,101,99,116,32,72,97,116,114,101,100,0,0,0,0,107,101,121,95,109,101,110,117,95,108,101,102,116,0,0,0,83,77,73,84,0,0,0,0,52,116,104,32,67,72,79,73,67,69,32,87,69,65,80,79,78,0,0,0,0,0,0,0,98,103,115,105,116,50,0,0,78,111,32,115,117,99,104,32,114,101,115,112,111,110,115,101,32,102,105,108,101,58,32,37,115,0,0,0,0,0,0,0,69,52,77,49,58,32,72,101,108,108,32,66,101,110,101,97,116,104,0,0,0,0,0,0,107,101,121,95,109,101,110,117,95,114,105,103,104,116,0,0,71,79,82,53,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,51,0,98,103,115,105,116,49,0,0,46,114,115,112,0,0,0,0,69,51,77,57,58,32,87,97,114,114,101,110,115,0,0,0,107,101,121,95,100,111,119,110,0,0,0,0,0,0,0,0,71,79,82,52,0,0,0,0,51,114,100,32,67,72,79,73,67,69,32,87,69,65,80,79,78,0,0,0,0,0,0,0,112,111,115,105,116,51,0,0,45,105,119,97,100,0,0,0,69,51,77,56,58,32,68,105,115,0,0,0,0,0,0,0,112,95,115,97,118,101,103,46,99,0,0,0,0,0,0,0,107,101,121,95,117,112,0,0,71,79,82,51,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,50,0,112,111,115,105,116,50,0,0,67,104,101,99,107,73,87,65,68,58,32,73,87,65,68,32,37,115,32,110,111,116,32,114,101,97,100,97,98,108,101,0,69,51,77,55,58,32,76,105,109,98,111,0,0,0,0,0,100,111,111,109,0,0,0,0,49,53,98,105,116,0,0,0,35,0,0,0,0,0,0,0,40,40,40,98,121,116,101,42,41,112,97,116,99,104,45,62,112,111,115,116,115,32,43,32,110,117,109,80,111,115,116,115,84,111,116,97,108,42,115,105,122,101,111,102,40,114,112,111,115,116,95,116,41,41,32,45,32,40,98,121,116,101,42,41,112,97,116,99,104,45,62,100,97,116,97,41,32,61,61,32,100,97,116,97,83,105,122,101,0,0,0,0,0,0,0,0,98,114,100,114,95,98,108,0,103,101,116,32,111,117,116,116,97,32,104,101,114,101,32,97,110,100,32,103,111,32,98,97,99,107,10,116,111,32,121,111,117,114,32,98,111,114,105,110,103,32,112,114,111,103,114,97,109,115,46,0,0,0,0,0,66,95,69,78,68,0,0,0,107,101,121,95,108,101,102,116,0,0,0,0,0,0,0,0,71,79,82,50,0,0,0,0,83,112,114,105,116,101,115,32,0,0,0,0,0,0,0,0,50,110,100,32,67,72,79,73,67,69,32,87,69,65,80,79,78,0,0,0,0,0,0,0,112,111,115,105,116,49,0,0,67,104,101,99,107,73,87,65,68,58,32,67,97,110,39,116,32,111,112,101,110,32,73,87,65,68,32,37,115,0,0,0,69,51,77,54,58,32,77,116,46,32,69,114,101,98,117,115,0,0,0,0,0,0,0,0,67,82,71,82,69,69,78,0,83,84,70,84,76,37,100,48,0,0,0,0,0,0,0,0,100,101,109,111,95,115,109,111,111,116,104,116,117,114,110,115,0,0,0,0,0,0,0,0,107,101,121,95,114,105,103,104,116,0,0,0,0,0,0,0,80,79,76,54,0,0,0,0,119,101,97,112,111,110,95,99,104,111,105,99,101,95,49,0,77,73,83,70,0,0,0,0,116,101,108,101,112,116,0,0,67,104,101,99,107,73,87,65,68,58,32,73,87,65,68,32,116,97,103,32,37,115,32,110,111,116,32,112,114,101,115,101,110,116,0,0,0,0,0,0,69,51,77,53,58,32,85,110,104,111,108,121,32,67,97,116,104,101,100,114,97,108,0,0,77,95,76,83,67,78,84,82,0,0,0,0,0,0,0,0,101,50,109,50,0,0,0,0,80,95,76,111,97,100,82,101,106,101,99,116,58,32,82,69,74,69,67,84,32,116,111,111,32,115,104,111,114,116,32,40,37,117,60,37,117,41,32,45,32,112,97,100,100,101,100,10,0,0,0,0,0,0,0,0,75,101,121,32,98,105,110,100,105,110,103,115,0,0,0,0,80,79,76,49,0,0,0,0,49,83,84,32,67,72,79,73,67,69,32,87,69,65,80,79,78,0,0,0,0,0,0,0,111,111,102,0,0,0,0,0,67,104,101,99,107,73,87,65,68,58,32,102,97,105,108,101,100,32,116,111,32,114,101,97,100,32,100,105,114,101,99,116,111,114,121,32,37,115,0,0,105,100,115,112,105,115,112,111,112,100,0,0,0,0,0,0,114,101,115,116,97,114,116,32,116,104,101,32,108,101,118,101,108,63,10,10,112,114,101,115,115,32,121,32,111,114,32,110,46,0,0,0,0,0,0,0,69,51,77,52,58,32,72,111,117,115,101,32,111,102,32,80,97,105,110,0,0,0,0,0,109,111,117,115,101,98,95,102,111,114,119,97,114,100,0,0,80,79,76,51,0,0,0,0,112,108,97,121,101,114,95,98,111,98,98,105,110,103,0,0,119,112,110,117,112,0,0,0,73,87,65,68,0,0,0,0,69,51,77,51,58,32,80,97,110,100,101,109,111,110,105,117,109,0,0,0,0,0,0,0,102,105,110,97,108,32,100,111,111,109,0,0,0,0,0,0,71,95,84,105,99,107,101,114,58,32,67,111,110,115,105,115,116,101,110,99,121,32,102,97,105,108,117,114,101,32,40,37,105,32,115,104,111,117,108,100,32,98,101,32,37,105,41,0,37,115,32,37,100,0,0,0,99,114,101,97,116,101,84,101,120,116,117,114,101,67,111,109,112,111,115,105,116,101,80,97,116,99,104,0,0,0,0,0,99,114,101,97,116,101,80,97,116,99,104,0,0,0,0,0,1,0,0,0,80,69,2,0,208,95,2,0,182,0,0,0,34,0,5,0,0,0,0,0,255,255,255,255,0,0,0,0,8,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,52,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,1,0,0,0,80,69,2,0,208,95,2,0,176,0,0,0,34,0,5,0,0,0,0,0,2,0,77,95,83,70,88,86,79,76,0,0,52,2,0,0,115,0,0,0,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,77,95,77,85,83,86,79,76,0,0,190,1,0,0,109,0,0,0,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,48,92,2,0,72,68,2,0,72,0,0,0,80,0,64,0,0,0,0,0,1,0,77,95,67,79,77,80,65,84,0,0,16,0,0,0,112,0,0,0,1,0,77,95,75,69,89,66,78,68,0,0,140,1,0,0,107,0,0,0,1,0,77,95,87,69,65,80,0,0,0,0,36,2,0,0,119,0,0,0,1,0,77,95,83,84,65,84,0,0,0,0,34,0,0,0,115,0,0,0,1,0,77,95,65,85,84,79,0,0,0,0,48,0,0,0,97,0,0,0,1,0,77,95,69,78,69,77,0,0,0,0,12,2,0,0,101,0,0,0,1,0,77,95,77,69,83,83,0,0,0,0,218,0,0,0,109,0,0,0,1,0,77,95,67,72,65,84,0,0,0,0,10,0,0,0,99,0,0,0,8,0,0,0,48,92,2,0,176,68,2,0,10,0,0,0,59,0,37,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,62,0,0,0,49,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,62,0,0,0,50,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,62,0,0,0,51,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,62,0,0,0,52,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,62,0,0,0,53,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,62,0,0,0,54,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,62,0,0,0,55,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,62,0,0,0,56,0,0,0,8,0,0,0,216,93,2,0,104,69,2,0,174,0,0,0,80,0,34,0,0,0,0,0,96,134,1,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,200,132,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,200,131,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,144,130,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,80,129,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,184,127,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,120,126,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,120,124,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,96,123,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,112,122,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,16,121,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,232,118,1,0,0,0,0,0,118,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,40,117,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,192,115,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,192,113,1,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,112,1,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,192,110,1,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,184,107,1,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,104,106,1,0,0,0,0,0,100,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,248,104,1,0,0,0,0,0,100,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,224,103,1,0,0,0,0,0,100,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,16,103,1,0,0,0,0,0,100,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,48,102,1,0,0,0,0,0,119,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,56,101,1,0,0,0,0,0,78,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,208,99,1,0,0,0,0,0,78,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,128,98,1,0,0,0,0,0,96,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,160,97,1,0,0,0,0,0,96,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,72,96,1,0,0,0,0,0,96,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,192,95,1,0,0,0,0,0,96,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,64,95,1,0,0,0,0,0,96,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,192,94,1,0,0,0,0,0,96,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,80,94,1,0,0,0,0,0,78,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,94,1,0,1,0,0,0,78,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,56,67,2,0,1,0,0,0,78,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,144,66,2,0,0,0,0,0,96,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,200,65,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,40,65,2,0,1,0,0,0,98,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,240,63,2,0,1,0,0,0,98,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,160,63,2,0,1,0,0,0,98,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,80,63,2,0,1,0,0,0,98,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,232,62,2,0,1,0,0,0,98,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,128,62,2,0,1,0,0,0,98,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,32,62,2,0,1,0,0,0,98,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,80,61,2,0,1,0,0,0,94,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,8,60,2,0,1,0,0,0,92,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,96,59,2,0,1,0,0,0,90,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,160,58,2,0,1,0,0,0,90,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,168,57,2,0,1,0,0,0,90,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,56,57,2,0,1,0,0,0,90,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,224,56,2,0,1,0,0,0,90,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,144,56,2,0,1,0,0,0,90,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,24,56,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,192,55,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,40,55,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,96,54,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,104,53,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,232,52,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,176,51,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,88,51,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,16,51,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,160,50,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,248,49,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,144,49,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,16,49,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,168,48,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,8,48,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,56,47,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,240,45,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,112,45,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,240,44,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,104,44,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,224,43,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,120,43,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,8,43,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,160,42,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,24,42,2,0,1,0,0,0,120,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,176,41,2,0,1,0,0,0,120,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,192,40,2,0,1,0,0,0,120,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,120,40,2,0,1,0,0,0,100,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,56,40,2,0,1,0,0,0,100,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,248,39,2,0,1,0,0,0,100,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,192,39,2,0,0,0,0,0,78,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,136,39,2,0,0,0,0,0,60,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,56,39,2,0,0,0,0,0,64,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,200,38,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,88,38,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,224,37,2,0,0,0,0,0,64,0,0,0,68,70,2,0,150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,2,0,0,0,0,0,60,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,200,36,2,0,0,0,0,0,100,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,120,36,2,0,0,0,0,0,100,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,48,36,2,0,0,0,0,0,100,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,224,35,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,168,35,2,0,0,0,0,0,32,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,48,35,2,0,0,0,0,0,60,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,168,34,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,34,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,152,33,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,40,33,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,232,32,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,120,32,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,32,32,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,216,31,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,144,31,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,64,31,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,208,30,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,88,30,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,248,29,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,104,29,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,40,29,2,0,0,0,0,0,60,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,208,28,2,0,0,0,0,0,98,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,136,28,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,48,28,2,0,0,0,0,0,120,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,232,27,2,0,0,0,0,0,70,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,128,27,2,0,0,0,0,0,96,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,40,2,0,0,0,0,0,0,0,0,0,0,0,0,0,120,57,2,0,0,0,0,0,0,0,0,0,0,0,0,0,40,14,2,0,0,0,0,0,0,0,0,0,0,0,0,0,128,204,1,0,0,0,0,0,0,0,0,0,0,0,0,0,104,175,1,0,0,0,0,0,0,0,0,0,0,0,0,0,88,156,1,0,0,0,0,0,0,0,0,0,0,0,0,0,72,143,1,0,0,0,0,0,0,0,0,0,0,0,0,0,192,128,1,0,0,0,0,0,0,0,0,0,0,0,0,0,48,113,1,0,0,0,0,0,0,0,0,0,0,0,0,0,40,99,1,0,0,0,0,0,0,0,0,0,0,0,0,0,32,66,2,0,0,0,0,0,0,0,0,0,0,0,0,0,176,59,2,0,0,0,0,0,0,0,0,0,0,0,0,0,224,53,2,0,0,0,0,0,0,0,0,0,0,0,0,0,80,48,2,0,0,0,0,0,0,0,0,0,0,0,0,0,64,42,2,0,0,0,0,0,0,0,0,0,0,0,0,0,128,38,2,0,0,0,0,0,0,0,0,0,0,0,0,0,48,34,2,0,0,0,0,0,0,0,0,0,0,0,0,0,144,30,2,0,0,0,0,0,0,0,0,0,0,0,0,0,168,26,2,0,0,0,0,0,0,0,0,0,0,0,0,0,160,23,2,0,0,0,0,0,0,0,0,0,0,0,0,0,232,19,2,0,0,0,0,0,0,0,0,0,0,0,0,0,192,15,2,0,0,0,0,0,0,0,0,0,0,0,0,0,216,11,2,0,0,0,0,0,0,0,0,0,0,0,0,0,240,7,2,0,0,0,0,0,0,0,0,0,0,0,0,0,56,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,128,241,1,0,0,0,0,0,0,0,0,0,0,0,0,0,144,227,1,0,0,0,0,0,0,0,0,0,0,0,0,0,64,217,1,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([192,213,1,0,0,0,0,0,0,0,0,0,0,0,0,0,64,210,1,0,0,0,0,0,0,0,0,0,0,0,0,0,248,205,1,0,0,0,0,0,0,0,0,0,0,0,0,0,32,202,1,0,0,0,0,0,0,0,0,0,0,0,0,0,192,197,1,0,0,0,0,0,0,0,0,0,0,0,0,0,16,193,1,0,0,0,0,0,0,0,0,0,0,0,0,0,88,190,1,0,0,0,0,0,0,0,0,0,0,0,0,0,168,187,1,0,0,0,0,0,0,0,0,0,0,0,0,0,64,185,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,183,1,0,0,0,0,0,0,0,0,0,0,0,0,0,128,180,1,0,0,0,0,0,0,0,0,0,0,0,0,0,48,178,1,0,0,0,0,0,0,0,0,0,0,0,0,0,56,176,1,0,0,0,0,0,0,0,0,0,0,0,0,0,192,173,1,0,0,0,0,0,0,0,0,0,0,0,0,0,192,171,1,0,0,0,0,0,0,0,0,0,0,0,0,0,96,168,1,0,0,0,0,0,0,0,0,0,0,0,0,0,160,166,1,0,0,0,0,0,0,0,0,0,0,0,0,0,112,164,1,0,0,0,0,0,0,0,0,0,0,0,0,0,136,162,1,0,0,0,0,0,0,0,0,0,0,0,0,0,80,161,1,0,0,0,0,0,0,0,0,0,0,0,0,0,240,159,1,0,0,0,0,0,0,0,0,0,0,0,0,0,88,158,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,157,1,0,0,0,0,0,0,0,0,0,0,0,0,0,128,155,1,0,0,0,0,0,0,0,0,0,0,0,0,0,240,153,1,0,0,0,0,0,0,0,0,0,0,0,0,0,144,151,1,0,0,0,0,0,0,0,0,0,0,0,0,0,16,150,1,0,0,0,0,0,0,0,0,0,0,0,0,0,216,148,1,0,0,0,0,0,0,0,0,0,0,0,0,0,192,147,1,0,0,0,0,0,0,0,0,0,0,0,0,0,184,146,1,0,0,0,0,0,0,0,0,0,0,0,0,0,216,145,1,0,0,0,0,0,0,0,0,0,0,0,0,0,240,144,1,0,0,0,0,0,0,0,0,0,0,0,0,0,224,143,1,0,0,0,0,0,0,0,0,0,0,0,0,0,192,142,1,0,0,0,0,0,0,0,0,0,0,0,0,0,208,140,1,0,0,0,0,0,0,0,0,0,0,0,0,0,168,138,1,0,0,0,0,0,0,0,0,0,0,0,0,0,184,137,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,1,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,20,0,0,0,21,0,0,0,5,0,0,0,16,0,0,0,13,0,0,0,15,0,0,0,14,0,0,0,9,0,0,0,0,0,0,0,202,7,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,64,1,0,0,0,0,0,0,64,1,0,0,0,0,0,0,200,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,77,95,66,85,84,84,49,0,77,95,66,85,84,84,50,0,1,0,0,0,0,0,0,0,0,0,0,0,10,2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,164,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,32,91,2,0,216,90,2,0,132,0,0,0,74,1,175,0,0,0,0,0,1,0,0,0,216,93,2,0,240,90,2,0,134,0,0,0,74,1,175,0,0,0,0,0,255,255,255,255,255,255,255,255,78,0,0,0,0,0,0,0,96,0,0,0,0,0,0,0,180,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,17,74,29,0,26,4,0,0,1,0,0,0,52,8,0,0,52,8,0,0,1,0,0,0,104,16,0,0,84,1,0,0,0,0,0,0,1,0,77,95,71,69,78,69,82,76,0,0,174,1,0,0,103,0,0,0,1,0,77,95,83,69,84,85,80,0,0,0,86,0,0,0,115,0,0,0,1,0,77,95,69,78,68,71,65,77,0,0,148,0,0,0,101,0,0,0,1,0,77,95,77,69,83,83,71,0,0,0,20,2,0,0,109,0,0,0,2,0,77,95,83,67,82,78,83,90,0,0,208,0,0,0,115,0,0,0,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,77,95,77,83,69,78,83,0,0,0,26,2,0,0,109,0,0,0,1,0,77,95,83,86,79,76,0,0,0,0,98,1,0,0,115,0,0,0,8,0,0,0,216,93,2,0,144,91,2,0,102,0,0,0,60,0,37,0,0,0,0,0,1,0,77,95,74,75,73,76,76,0,0,0,84,2,0,0,105,0,0,0,1,0,77,95,82,79,85,71,72,0,0,0,84,2,0,0,104,0,0,0,1,0,77,95,72,85,82,84,0,0,0,0,84,2,0,0,104,0,0,0,1,0,77,95,85,76,84,82,65,0,0,0,84,2,0,0,117,0,0,0,1,0,77,95,78,77,65,82,69,0,0,0,84,2,0,0,110,0,0,0,0,0,0,0,5,0,0,0,72,97,2,0,72,92,2,0,140,0,0,0,48,0,63,0,2,0,0,0,15,0,0,0,0,0,0,0,10,0,0,0,9,0,0,0,6,0,0,0,0,0,0,0,2,0,77,95,72,79,82,83,69,78,0,0,64,0,0,0,104,0,0,0,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,77,95,86,69,82,83,69,78,0,0,200,0,0,0,118,0,0,0,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,48,92,2,0,224,92,2,0,190,0,0,0,60,0,64,0,0,0,0,0,1,0,0,0,80,69,2,0,208,95,2,0,118,0,0,0,34,0,5,0,0,0,0,0,1,0,77,95,78,71,65,77,69,0,0,0,166,0,0,0,110,0,0,0,1,0,77,95,79,80,84,73,79,78,0,0,152,0,0,0,111,0,0,0,1,0,77,95,76,79,65,68,71,0,0,0,32,0,0,0,108,0,0,0,1,0,77,95,83,65,86,69,71,0,0,0,172,0,0,0,115,0,0,0,1,0,77,95,82,68,84,72,73,83,0,0,32,1,0,0,114,0,0,0,1,0,77,95,81,85,73,84,71,0,0,0,2,0,0,0,113,0,0,0,6,0,0,0,0,0,0,0,96,93,2,0,136,0,0,0,97,0,64,0,0,0,0,0,72,69,76,80,110,110,0,0,72,69,76,80,110,110,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,0,0,0,49,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,0,0,0,50,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,0,0,0,51,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,0,0,0,52,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,0,0,0,53,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,0,0,0,54,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,0,0,0,55,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,0,0,0,56,0,0,0,8,0,0,0,216,93,2,0,8,94,2,0,106,0,0,0,80,0,34,0,0,0,0,0,1,0,0,0,80,69,2,0,208,95,2,0,68,0,0,0,34,0,5,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,108,1,0,0,0,0,0,152,96,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,64,2,0,16,125,1,0,0,0,0,0,0,0,0,0,0,0,0,0,16,125,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,152,96,1,0,0,0,0,0,0,0,0,0,0,0,0,0,208,57,2,0,0,0,0,0,0,0,0,0,0,0,0,0,216,51,2,0,0,0,0,0,0,0,0,0,0,0,0,0,16,46,2,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,150,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,176,95,2,0,152,95,2,0,46,0,0,0,74,1,175,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,142,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,48,92,2,0,208,95,2,0,124,0,0,0,34,0,5,0,0,0,0,0,11,0,0,0,11,0,0,0,11,0,0,0,11,0,0,0,8,0,0,0,11,0,0,0,8,0,0,0,11,0,0,0,8,0,0,0,11,0,0,0,8,0,0,0,11,0,0,0,8,0,0,0,11,0,0,0,8,0,0,0,11,0,0,0,8,0,0,0,11,0,0,0,11,0,0,0,11,0,0,0,7,0,0,0,11,0,0,0,8,0,0,0,11,0,0,0,11,0,0,0,11,0,0,0,9,0,0,0,11,0,0,0,11,0,0,0,11,0,0,0,10,0,0,0,11,0,0,0,7,0,0,0,11,0,0,0,11,0,0,0,11,0,0,0,8,0,0,0,11,0,0,0,10,0,0,0,13,0,0,0,13,0,0,0,13,0,0,0,7,0,0,0,14,0,0,0,3,0,0,0,15,0,0,0,15,0,0,0,15,0,0,0,1,0,0,0,15,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,244,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,32,91,2,0,200,96,2,0,76,0,0,0,74,1,181,0,0,0,0,0,1,0,77,95,69,80,73,49,0,0,0,0,192,0,0,0,107,0,0,0,1,0,77,95,69,80,73,50,0,0,0,0,192,0,0,0,116,0,0,0,1,0,77,95,69,80,73,51,0,0,0,0,192,0,0,0,105,0,0,0,1,0,77,95,69,80,73,52,0,0,0,0,192,0,0,0,116,0,0,0,4,0,0,0,216,93,2,0,248,96,2,0,114,0,0,0,48,0,63,0,0,0,0,0,1,0,0,0,80,69,2,0,208,95,2,0,8,0,0,0,34,0,5,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,80,69,2,0,208,95,2,0,2,0,0,0,34,0,5,0,0,0,0,0,1,0,0,0,80,69,2,0,208,95,2,0,6,0,0,0,34,0,5,0,0,0,0,0,1,0,0,0,80,69,2,0,208,95,2,0,88,0,0,0,34,0,5,0,0,0,0,0,1,0,0,0,0,101,109,97,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,120,109,97,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  Module["_memcmp"] = _memcmp;
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  Module["_strcpy"] = _strcpy;
  Module["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }
  Module["_strcat"] = _strcat;
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,EDOTDOT:76,EBADMSG:77,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
      // Apply sign.
      ret *= multiplier;
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
      if (bits == 64) {
        return ((asm["setTempRet0"]((tempDouble=ret,(+(Math.abs(tempDouble))) >= (+(1)) ? (tempDouble > (+(0)) ? ((Math.min((+(Math.floor((tempDouble)/(+(4294967296))))), (+(4294967295))))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+(4294967296)))))))>>>0) : 0)),ret>>>0)|0);
      }
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can   access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"Connection reset by network",127:"Socket is already connected",128:"Socket is not connected",129:"Too many references",131:"Too many users",132:"Quota exceeded",133:"Stale file handle",134:"Not supported",135:"No medium (in tape drive)",138:"Illegal byte sequence",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};
  var VFS=undefined;
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path, ext) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var f = PATH.splitPath(path)[2];
        if (ext && f.substr(-1 * ext.length) === ext) {
          f = f.substr(0, f.length - ext.length);
        }
        return f;
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.filter(function(p, index) {
          if (typeof p !== 'string') {
            throw new TypeError('Arguments to path.join must be strings');
          }
          return p;
        }).join('/'));
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },mount:function (mount) {
        return MEMFS.create_node(null, '/', 0040000 | 0777, 0);
      },create_node:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek
          };
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap
          };
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink
          };
          node.stream_ops = {};
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = FS.chrdev_stream_ops;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.create_node(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.create_node(parent, newname, 0777 | 0120000, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && buffer.buffer === HEAP8.buffer && offset === 0) {
              node.contents = buffer; // this is a subarray of the heap, and we can own it
              node.contentMode = MEMFS.CONTENT_OWNING;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 0x02) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        },handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + new Error().stack;
        return ___setErrNo(e.errno);
      },cwd:function () {
        return FS.currentPath;
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.currentPath, path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            return path ? PATH.join(node.mount.mountpoint, path) : node.mount.mountpoint;
          }
          path = path ? PATH.join(node.name, path) : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          if (node.parent.id === parent.id && node.name === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        var node = {
          id: FS.nextInode++,
          name: name,
          mode: mode,
          node_ops: {},
          stream_ops: {},
          rdev: rdev,
          parent: null,
          mount: null
        };
        if (!parent) {
          parent = node;  // root node sets parent to itself
        }
        node.parent = parent;
        node.mount = parent.mount;
        // compatibility
        var readMode = 292 | 73;
        var writeMode = 146;
        // NOTE we must use Object.defineProperties instead of individual calls to
        // Object.defineProperty in order to make closure compiler happy
        Object.defineProperties(node, {
          read: {
            get: function() { return (node.mode & readMode) === readMode; },
            set: function(val) { val ? node.mode |= readMode : node.mode &= ~readMode; }
          },
          write: {
            get: function() { return (node.mode & writeMode) === writeMode; },
            set: function(val) { val ? node.mode |= writeMode : node.mode &= ~writeMode; }
          },
          isFolder: {
            get: function() { return FS.isDir(node.mode); },
          },
          isDevice: {
            get: function() { return FS.isChrdev(node.mode); },
          },
        });
        FS.hashAddNode(node);
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 0170000) === 0100000;
      },isDir:function (mode) {
        return (mode & 0170000) === 0040000;
      },isLink:function (mode) {
        return (mode & 0170000) === 0120000;
      },isChrdev:function (mode) {
        return (mode & 0170000) === 0020000;
      },isBlkdev:function (mode) {
        return (mode & 0170000) === 0060000;
      },isFIFO:function (mode) {
        return (mode & 0170000) === 0010000;
      },isSocket:function (mode) {
        return (mode & 0140000) === 0140000;
      },flagModes:{"r":0,"rs":8192,"r+":2,"w":1537,"wx":3585,"xw":3585,"w+":1538,"wx+":3586,"xw+":3586,"a":521,"ax":2569,"xa":2569,"a+":522,"ax+":2570,"xa+":2570},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 3;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 1024)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.currentPath) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 3) !== 0 ||  // opening for write
              (flags & 1024)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        // compatibility
        Object.defineProperties(stream, {
          object: {
            get: function() { return stream.node; },
            set: function(val) { stream.node = val; }
          },
          isRead: {
            get: function() { return (stream.flags & 3) !== 1; }
          },
          isWrite: {
            get: function() { return (stream.flags & 3) !== 0; }
          },
          isAppend: {
            get: function() { return (stream.flags & 8); }
          }
        });
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },mount:function (type, opts, mountpoint) {
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
        }
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 0100000;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 0001000;
        mode |= 0040000;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 0020000;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        path = PATH.normalize(path);
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 512)) {
          mode = (mode & 4095) | 0100000;
        } else {
          mode = 0;
        }
        var node;
        try {
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 0200000)
          });
          node = lookup.node;
          path = lookup.path;
        } catch (e) {
          // ignore
        }
        // perhaps we need to create the node
        if ((flags & 512)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 2048)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~1024;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 1024)) {
          FS.truncate(node, 0);
        }
        // register the stream with the filesystem
        var stream = FS.createStream({
          path: path,
          node: node,
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 8) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.errnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },staticInit:function () {
        FS.nameTable = new Array(4096);
        FS.root = FS.createNode(null, '/', 0040000 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(path, mode | 146);
          var stream = FS.open(path, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(path, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 0040000 | 0777, 0);
      },nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 0140000, 0);
        node.sock = sock;
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {} : ['binary'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
          var handleMessage = function(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (0 /* XXX missing C define POLLRDNORM */ | 1) : 0;
          }
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (0 /* XXX missing C define POLLRDNORM */ | 1);
          }
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 2;
          }
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 1:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function _access(path, amode) {
      // int access(const char *path, int amode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/access.html
      path = Pointer_stringify(path);
      if (amode & ~0000007) {
        // need a valid mode
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      }
      var node;
      try {
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
      var perms = '';
      if (amode & 4) perms += 'r';
      if (amode & 2) perms += 'w';
      if (amode & 1) perms += 'x';
      if (perms /* otherwise, they've just passed F_OK */ && FS.nodePermissions(node, perms)) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      }
      return 0;
    }
  var ___dirent_struct_layout={__size__:1040,d_ino:0,d_name:4,d_off:1028,d_reclen:1032,d_type:1036};function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = FS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 1024;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 8;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStream(stream);
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop()
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(stream, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        return FS.llseek(stream, offset, whence);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      }
      stream = FS.getStream(stream);
      stream.eof = false;
      return 0;
    }
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module.print('exit(' + status + ') called');
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }
  var _llvm_va_start=undefined;
  function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }
  function _llvm_va_end() {}
  function _toupper(chr) {
      if (chr >= 97 && chr <= 122) {
        return chr - 97 + 65;
      } else {
        return chr;
      }
    }
  function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }
  function _isatty(fildes) {
      // int isatty(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/isatty.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      // HACK - implement tcgetattr
      if (!stream.tty) {
        ___setErrNo(ERRNO_CODES.ENOTTY);
        return 0;
      }
      return 1;
    }
  function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
  Module["_tolower"] = _tolower; 
  Module["_strncasecmp"] = _strncasecmp;
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        FS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      var stream = FS.getStream(fildes);
      if (stream) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  Module["_strcasecmp"] = _strcasecmp;
  function __isFloat(text) {
      return !!(/^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?$/.exec(text));
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
        __scanString.whiteSpace[' '] = 1;
        __scanString.whiteSpace['\t'] = 1;
        __scanString.whiteSpace['\n'] = 1;
        __scanString.whiteSpace['\v'] = 1;
        __scanString.whiteSpace['\f'] = 1;
        __scanString.whiteSpace['\r'] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC)
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            var last = 0;
            next = get();
            while (next > 0) {
              buffer.push(String.fromCharCode(next));
              if (__isFloat(buffer.join(''))) {
                last = buffer.length;
              }
              next = get();
            }
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math.abs(tempDouble))) >= (+(1)) ? (tempDouble > (+(0)) ? ((Math.min((+(Math.floor((tempDouble)/(+(4294967296))))), (+(4294967295))))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+(4294967296)))))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16)
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text)
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j]
              }
              break;
          }
          fields++;
        } else if (format[formatIndex] in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      var get = function() { return HEAP8[(((s)+(index++))|0)]; };
      var unget = function() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  Module["_strncpy"] = _strncpy;
  function _feof(stream) {
      // int feof(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/feof.html
      stream = FS.getStream(stream);
      return Number(stream && stream.eof);
    }
  function _strlwr(pstr){
      var i = 0;
      while(1) {
        var x = HEAP8[(((pstr)+(i))|0)];
        if (x == 0) break;
        HEAP8[(((pstr)+(i))|0)]=_tolower(x);
        i++;
      }
    }
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }
  var ___strtok_state=0;
  function _strtok_r(s, delim, lasts) {
      var skip_leading_delim = 1;
      var spanp;
      var c, sc;
      var tok;
      if (s == 0 && (s = getValue(lasts, 'i8*')) == 0) {
        return 0;
      }
      cont: while (1) {
        c = getValue(s++, 'i8');
        for (spanp = delim; (sc = getValue(spanp++, 'i8')) != 0;) {
          if (c == sc) {
            if (skip_leading_delim) {
              continue cont;
            } else {
              setValue(lasts, s, 'i8*');
              setValue(s - 1, 0, 'i8');
              return s - 1;
            }
          }
        }
        break;
      }
      if (c == 0) {
        setValue(lasts, 0, 'i8*');
        return 0;
      }
      tok = s - 1;
      for (;;) {
        c = getValue(s++, 'i8');
        spanp = delim;
        do {
          if ((sc = getValue(spanp++, 'i8')) == c) {
            if (c == 0) {
              s = 0;
            } else {
              setValue(s - 1, 0, 'i8');
            }
            setValue(lasts, s, 'i8*');
            return tok;
          }
        } while (sc != 0);
      }
      abort('strtok_r error!');
    }function _strtok(s, delim) {
      return _strtok_r(s, delim, ___strtok_state);
    }
  function _fgets(s, n, stream) {
      // char *fgets(char *restrict s, int n, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgets.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) return 0;
      if (streamObj.error || streamObj.eof) return 0;
      var byte_;
      for (var i = 0; i < n - 1 && byte_ != 10; i++) {
        byte_ = _fgetc(stream);
        if (byte_ == -1) {
          if (streamObj.error || (streamObj.eof && i == 0)) return 0;
          else if (streamObj.eof) break;
        }
        HEAP8[(((s)+(i))|0)]=byte_
      }
      HEAP8[(((s)+(i))|0)]=0
      return s;
    }
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  var _sqrt=Math.sqrt;
  function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop) {
      Module['noExitRuntime'] = true;
      Browser.mainLoop.runner = function() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = Browser.mainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers;
            var next = remaining%1 == 0 ? remaining-1 : Math.floor(remaining);
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next;
            } else {
              // not counted, but move the progress along a tiny bit
              next = next + 0.5; // do not steal all the next one's progress
              Browser.mainLoop.remainingBlockers = (8*remaining + next)/9;
            }
          }
          console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + ' ms'); //, left: ' + Browser.mainLoop.remainingBlockers);
          Browser.mainLoop.updateStatus();
          setTimeout(Browser.mainLoop.runner, 0);
          return;
        }
        if (Browser.mainLoop.shouldPause) {
          // catch pauses from non-main loop sources
          Browser.mainLoop.paused = true;
          Browser.mainLoop.shouldPause = false;
          return;
        }
        if (Module['preMainLoop']) {
          Module['preMainLoop']();
        }
        try {
          Runtime.dynCall('v', func);
        } catch (e) {
          if (e instanceof ExitStatus) {
            return;
          } else {
            throw e;
          }
        }
        if (Module['postMainLoop']) {
          Module['postMainLoop']();
        }
        if (Browser.mainLoop.shouldPause) {
          // catch pauses from the main loop itself
          Browser.mainLoop.paused = true;
          Browser.mainLoop.shouldPause = false;
          return;
        }
        Browser.mainLoop.scheduler();
      }
      if (fps && fps > 0) {
        Browser.mainLoop.scheduler = function() {
          setTimeout(Browser.mainLoop.runner, 1000/fps); // doing this each time means that on exception, we stop
        }
      } else {
        Browser.mainLoop.scheduler = function() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner);
        }
      }
      Browser.mainLoop.scheduler();
      if (simulateInfiniteLoop) {
        throw 'SimulateInfiniteLoop';
      }
    }
  function _setvbuf(stream, buf, type, size) {
      // int setvbuf(FILE *restrict stream, char *restrict buf, int type, size_t size);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/setvbuf.html
      // TODO: Implement custom buffering.
      return 0;
    }function _setbuf(stream, buf) {
      // void setbuf(FILE *restrict stream, char *restrict buf);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/setbuf.html
      if (buf) _setvbuf(stream, buf, 0, 8192);  // _IOFBF, BUFSIZ.
      else _setvbuf(stream, buf, 2, 8192);  // _IONBF, BUFSIZ.
    }
  var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP32[((envPtr)>>2)]=poolPtr
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
      }
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        for (var j = 0; j < line.length; j++) {
          HEAP8[(((poolPtr)+(j))|0)]=line.charCodeAt(j);
        }
        HEAP8[(((poolPtr)+(j))|0)]=0;
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }
  var ___stat_struct_layout={__size__:68,st_dev:0,st_ino:4,st_mode:8,st_nlink:12,st_uid:16,st_gid:20,st_rdev:24,st_size:28,st_atime:32,st_spare1:36,st_mtime:40,st_spare2:44,st_ctime:48,st_spare3:52,st_blksize:56,st_blocks:60,st_spare4:64};function _stat(path, buf, dontResolveLastLink) {
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/stat.html
      // int stat(const char *path, struct stat *buf);
      // NOTE: dontResolveLastLink is a shortcut for lstat(). It should never be
      //       used in client code.
      path = typeof path !== 'string' ? Pointer_stringify(path) : path;
      try {
        var stat = dontResolveLastLink ? FS.lstat(path) : FS.stat(path);
        HEAP32[(((buf)+(___stat_struct_layout.st_dev))>>2)]=stat.dev;
        HEAP32[(((buf)+(___stat_struct_layout.st_ino))>>2)]=stat.ino
        HEAP32[(((buf)+(___stat_struct_layout.st_mode))>>2)]=stat.mode
        HEAP32[(((buf)+(___stat_struct_layout.st_nlink))>>2)]=stat.nlink
        HEAP32[(((buf)+(___stat_struct_layout.st_uid))>>2)]=stat.uid
        HEAP32[(((buf)+(___stat_struct_layout.st_gid))>>2)]=stat.gid
        HEAP32[(((buf)+(___stat_struct_layout.st_rdev))>>2)]=stat.rdev
        HEAP32[(((buf)+(___stat_struct_layout.st_size))>>2)]=stat.size
        HEAP32[(((buf)+(___stat_struct_layout.st_atime))>>2)]=Math.floor(stat.atime.getTime() / 1000)
        HEAP32[(((buf)+(___stat_struct_layout.st_mtime))>>2)]=Math.floor(stat.mtime.getTime() / 1000)
        HEAP32[(((buf)+(___stat_struct_layout.st_ctime))>>2)]=Math.floor(stat.ctime.getTime() / 1000)
        HEAP32[(((buf)+(___stat_struct_layout.st_blksize))>>2)]=4096
        HEAP32[(((buf)+(___stat_struct_layout.st_blocks))>>2)]=stat.blocks
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _unlink(path) {
      // int unlink(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/unlink.html
      path = Pointer_stringify(path);
      try {
        FS.unlink(path);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _rmdir(path) {
      // int rmdir(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rmdir.html
      path = Pointer_stringify(path);
      try {
        FS.rmdir(path);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _remove(path) {
      // int remove(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/remove.html
      var ret = _unlink(path);
      if (ret == -1) ret = _rmdir(path);
      return ret;
    }
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      stream = FS.getStream(stream);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (FS.isChrdev(stream.node.mode)) {
        ___setErrNo(ERRNO_CODES.ESPIPE);
        return -1;
      } else {
        return stream.position;
      }
    }
  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      stream = FS.getStream(stream);
      if (!stream) {
        return -1;
      }
      if (c === -1) {
        // do nothing for EOF character
        return c;
      }
      c = unSign(c & 0xFF);
      stream.ungotten.push(c);
      stream.eof = false;
      return c;
    }function _fscanf(stream, format, varargs) {
      // int fscanf(FILE *restrict stream, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) {
        return -1;
      }
      var buffer = [];
      var get = function() {
        var c = _fgetc(stream);
        buffer.push(c);
        return c;
      };
      var unget = function() {
        _ungetc(buffer.pop(), stream);
      };
      return __scanString(format, get, unget, varargs);
    }
  function _isalnum(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  function _memchr(ptr, chr, num) {
      chr = unSign(chr);
      for (var i = 0; i < num; i++) {
        if (HEAP8[(ptr)] == chr) return ptr;
        ptr++;
      }
      return 0;
    }
  var _atan2=Math.atan2;
  function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          for (var i = 0; i < msg.length; i++) {
            HEAP8[(((strerrbuf)+(i))|0)]=msg.charCodeAt(i)
          }
          HEAP8[(((strerrbuf)+(i))|0)]=0
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  function _mmap(start, num, prot, flags, stream, offset) {
      /* FIXME: Since mmap is normally implemented at the kernel level,
       * this implementation simply uses malloc underneath the call to
       * mmap.
       */
      var MAP_PRIVATE = 2;
      var ptr;
      var allocated = false;
      if (!_mmap.mappings) _mmap.mappings = {};
      if (stream == -1) {
        ptr = _malloc(num);
        if (!ptr) return -1;
        _memset(ptr, 0, num);
        allocated = true;
      } else {
        var info = FS.getStream(stream);
        if (!info) return -1;
        try {
          var res = FS.mmap(info, HEAPU8, start, num, offset, prot, flags);
          ptr = res.ptr;
          allocated = res.allocated;
        } catch (e) {
          FS.handleFSError(e);
          return -1;
        }
      }
      _mmap.mappings[ptr] = { malloc: ptr, num: num, allocated: allocated };
      return ptr;
    }
  function _signal(sig, func) {
      // TODO
      return 0;
    }
  function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
          }
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};var SDL={defaults:{width:320,height:200,copyOnLock:true},version:null,surfaces:{},canvasPool:[],events:[],fonts:[null],audios:[null],rwops:[null],music:{audio:null,volume:1},mixerFrequency:22050,mixerFormat:32784,mixerNumChannels:2,mixerChunkSize:1024,channelMinimumNumber:0,GL:false,keyboardState:null,keyboardMap:{},canRequestFullscreen:false,isRequestingFullscreen:false,textInput:false,startTime:null,buttonState:0,modState:0,DOMButtons:[0,0,0],DOMEventToSDLEvent:{},keyCodes:{16:1249,17:1248,18:1250,33:1099,34:1102,37:1104,38:1106,39:1103,40:1105,46:127,96:1112,97:1113,98:1114,99:1115,100:1116,101:1117,102:1118,103:1119,104:1120,105:1121,112:1082,113:1083,114:1084,115:1085,116:1086,117:1087,118:1088,119:1089,120:1090,121:1091,122:1092,123:1093,173:45,188:44,190:46,191:47,192:96},scanCodes:{9:43,13:40,27:41,32:44,44:54,46:55,47:56,48:39,49:30,50:31,51:32,52:33,53:34,54:35,55:36,56:37,57:38,92:49,97:4,98:5,99:6,100:7,101:8,102:9,103:10,104:11,105:12,106:13,107:14,108:15,109:16,110:17,111:18,112:19,113:20,114:21,115:22,116:23,117:24,118:25,119:26,120:27,121:28,122:29,305:224,308:226},structs:{Rect:{__size__:16,x:0,y:4,w:8,h:12},PixelFormat:{__size__:36,format:0,palette:4,BitsPerPixel:8,BytesPerPixel:9,padding1:10,padding2:11,Rmask:12,Gmask:16,Bmask:20,Amask:24,Rloss:28,Gloss:29,Bloss:30,Aloss:31,Rshift:32,Gshift:33,Bshift:34,Ashift:35},KeyboardEvent:{__size__:16,type:0,windowID:4,state:8,repeat:9,padding2:10,padding3:11,keysym:12},keysym:{__size__:16,scancode:0,sym:4,mod:8,unicode:12},TextInputEvent:{__size__:264,type:0,windowID:4,text:8},MouseMotionEvent:{__size__:28,type:0,windowID:4,state:8,padding1:9,padding2:10,padding3:11,x:12,y:16,xrel:20,yrel:24},MouseButtonEvent:{__size__:20,type:0,windowID:4,button:8,state:9,padding1:10,padding2:11,x:12,y:16},ResizeEvent:{__size__:12,type:0,w:4,h:8},AudioSpec:{__size__:24,freq:0,format:4,channels:6,silence:7,samples:8,size:12,callback:16,userdata:20},version:{__size__:3,major:0,minor:1,patch:2}},loadRect:function (rect) {
        return {
          x: HEAP32[((rect + SDL.structs.Rect.x)>>2)],
          y: HEAP32[((rect + SDL.structs.Rect.y)>>2)],
          w: HEAP32[((rect + SDL.structs.Rect.w)>>2)],
          h: HEAP32[((rect + SDL.structs.Rect.h)>>2)]
        };
      },loadColorToCSSRGB:function (color) {
        var rgba = HEAP32[((color)>>2)];
        return 'rgb(' + (rgba&255) + ',' + ((rgba >> 8)&255) + ',' + ((rgba >> 16)&255) + ')';
      },loadColorToCSSRGBA:function (color) {
        var rgba = HEAP32[((color)>>2)];
        return 'rgba(' + (rgba&255) + ',' + ((rgba >> 8)&255) + ',' + ((rgba >> 16)&255) + ',' + (((rgba >> 24)&255)/255) + ')';
      },translateColorToCSSRGBA:function (rgba) {
        return 'rgba(' + (rgba&0xff) + ',' + (rgba>>8 & 0xff) + ',' + (rgba>>16 & 0xff) + ',' + (rgba>>>24)/0xff + ')';
      },translateRGBAToCSSRGBA:function (r, g, b, a) {
        return 'rgba(' + (r&0xff) + ',' + (g&0xff) + ',' + (b&0xff) + ',' + (a&0xff)/255 + ')';
      },translateRGBAToColor:function (r, g, b, a) {
        return r | g << 8 | b << 16 | a << 24;
      },makeSurface:function (width, height, flags, usePageCanvas, source, rmask, gmask, bmask, amask) {
        flags = flags || 0;
        var surf = _malloc(15*Runtime.QUANTUM_SIZE);  // SDL_Surface has 15 fields of quantum size
        var buffer = _malloc(width*height*4); // TODO: only allocate when locked the first time
        var pixelFormat = _malloc(18*Runtime.QUANTUM_SIZE);
        flags |= 1; // SDL_HWSURFACE - this tells SDL_MUSTLOCK that this needs to be locked
        //surface with SDL_HWPALETTE flag is 8bpp surface (1 byte)
        var is_SDL_HWPALETTE = flags & 0x00200000;  
        var bpp = is_SDL_HWPALETTE ? 1 : 4;
        HEAP32[((surf+Runtime.QUANTUM_SIZE*0)>>2)]=flags         // SDL_Surface.flags
        HEAP32[((surf+Runtime.QUANTUM_SIZE*1)>>2)]=pixelFormat // SDL_Surface.format TODO
        HEAP32[((surf+Runtime.QUANTUM_SIZE*2)>>2)]=width         // SDL_Surface.w
        HEAP32[((surf+Runtime.QUANTUM_SIZE*3)>>2)]=height        // SDL_Surface.h
        HEAP32[((surf+Runtime.QUANTUM_SIZE*4)>>2)]=width * bpp       // SDL_Surface.pitch, assuming RGBA or indexed for now,
                                                                                 // since that is what ImageData gives us in browsers
        HEAP32[((surf+Runtime.QUANTUM_SIZE*5)>>2)]=buffer      // SDL_Surface.pixels
        HEAP32[((surf+Runtime.QUANTUM_SIZE*6)>>2)]=0      // SDL_Surface.offset
        HEAP32[((surf+Runtime.QUANTUM_SIZE*14)>>2)]=1
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.format)>>2)]=-2042224636 // SDL_PIXELFORMAT_RGBA8888
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.palette)>>2)]=0 // TODO
        HEAP8[((pixelFormat + SDL.structs.PixelFormat.BitsPerPixel)|0)]=bpp * 8
        HEAP8[((pixelFormat + SDL.structs.PixelFormat.BytesPerPixel)|0)]=bpp
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.Rmask)>>2)]=rmask || 0x000000ff
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.Gmask)>>2)]=gmask || 0x0000ff00
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.Bmask)>>2)]=bmask || 0x00ff0000
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.Amask)>>2)]=amask || 0xff000000
        // Decide if we want to use WebGL or not
        var useWebGL = (flags & 0x04000000) != 0; // SDL_OPENGL
        SDL.GL = SDL.GL || useWebGL;
        var canvas;
        if (!usePageCanvas) {
          if (SDL.canvasPool.length > 0) {
            canvas = SDL.canvasPool.pop();
          } else {
            canvas = document.createElement('canvas');
          }
          canvas.width = width;
          canvas.height = height;
        } else {
          canvas = Module['canvas'];
        }
        var ctx = Browser.createContext(canvas, useWebGL, usePageCanvas);
        SDL.surfaces[surf] = {
          width: width,
          height: height,
          canvas: canvas,
          ctx: ctx,
          surf: surf,
          buffer: buffer,
          pixelFormat: pixelFormat,
          alpha: 255,
          flags: flags,
          locked: 0,
          usePageCanvas: usePageCanvas,
          source: source,
          isFlagSet: function(flag) {
            return flags & flag;
          }
        };
        return surf;
      },copyIndexedColorData:function (surfData, rX, rY, rW, rH) {
        // HWPALETTE works with palette
        // setted by SDL_SetColors
        if (!surfData.colors) {
          return;
        }
        var fullWidth  = Module['canvas'].width;
        var fullHeight = Module['canvas'].height;
        var startX  = rX || 0;
        var startY  = rY || 0;
        var endX    = (rW || (fullWidth - startX)) + startX;
        var endY    = (rH || (fullHeight - startY)) + startY;
        var buffer  = surfData.buffer;
        var data    = surfData.image.data;
        var colors  = surfData.colors;
        for (var y = startY; y < endY; ++y) {
          var indexBase = y * fullWidth;
          var colorBase = indexBase * 4;
          for (var x = startX; x < endX; ++x) {
            // HWPALETTE have only 256 colors (not rgba)
            var index = HEAPU8[((buffer + indexBase + x)|0)] * 3;
            var colorOffset = colorBase + x * 4;
            data[colorOffset   ] = colors[index   ];
            data[colorOffset +1] = colors[index +1];
            data[colorOffset +2] = colors[index +2];
            //unused: data[colorOffset +3] = color[index +3];
          }
        }
      },freeSurface:function (surf) {
        var refcountPointer = surf + Runtime.QUANTUM_SIZE * 14;
        var refcount = HEAP32[((refcountPointer)>>2)];
        if (refcount > 1) {
          HEAP32[((refcountPointer)>>2)]=refcount - 1;
          return;
        }
        var info = SDL.surfaces[surf];
        if (!info.usePageCanvas && info.canvas) SDL.canvasPool.push(info.canvas);
        _free(info.buffer);
        _free(info.pixelFormat);
        _free(surf);
        SDL.surfaces[surf] = null;
      },touchX:0,touchY:0,savedKeydown:null,receiveEvent:function (event) {
        switch(event.type) {
          case 'touchstart':
            event.preventDefault();
            var touch = event.touches[0];
            touchX = touch.pageX;
            touchY = touch.pageY;
            var event = {
              type: 'mousedown',
              button: 0,
              pageX: touchX,
              pageY: touchY
            };
            SDL.DOMButtons[0] = 1;
            SDL.events.push(event);
            break;
          case 'touchmove':
            event.preventDefault();
            var touch = event.touches[0];
            touchX = touch.pageX;
            touchY = touch.pageY;
            event = {
              type: 'mousemove',
              button: 0,
              pageX: touchX,
              pageY: touchY
            };
            SDL.events.push(event);
            break;
          case 'touchend':
            event.preventDefault();
            event = {
              type: 'mouseup',
              button: 0,
              pageX: touchX,
              pageY: touchY
            };
            SDL.DOMButtons[0] = 0;
            SDL.events.push(event);
            break;
          case 'mousemove':
            if (Browser.pointerLock) {
              // workaround for firefox bug 750111
              if ('mozMovementX' in event) {
                event['movementX'] = event['mozMovementX'];
                event['movementY'] = event['mozMovementY'];
              }
              // workaround for Firefox bug 782777
              if (event['movementX'] == 0 && event['movementY'] == 0) {
                // ignore a mousemove event if it doesn't contain any movement info
                // (without pointer lock, we infer movement from pageX/pageY, so this check is unnecessary)
                event.preventDefault();
                return;
              }
            }
            // fall through
          case 'keydown': case 'keyup': case 'keypress': case 'mousedown': case 'mouseup': case 'DOMMouseScroll': case 'mousewheel':
            if (event.type == 'DOMMouseScroll' || event.type == 'mousewheel') {
              var button = (event.type == 'DOMMouseScroll' ? event.detail : -event.wheelDelta) > 0 ? 4 : 3;
              var event2 = {
                type: 'mousedown',
                button: button,
                pageX: event.pageX,
                pageY: event.pageY
              };
              SDL.events.push(event2);
              event = {
                type: 'mouseup',
                button: button,
                pageX: event.pageX,
                pageY: event.pageY
              };
            } else if (event.type == 'mousedown') {
              SDL.DOMButtons[event.button] = 1;
            } else if (event.type == 'mouseup') {
              // ignore extra ups, can happen if we leave the canvas while pressing down, then return,
              // since we add a mouseup in that case
              if (!SDL.DOMButtons[event.button]) {
                event.preventDefault();
                return;
              }
              SDL.DOMButtons[event.button] = 0;
            }
            // We can only request fullscreen as the result of user input.
            // Due to this limitation, we toggle a boolean on keydown which
            // SDL_WM_ToggleFullScreen will check and subsequently set another
            // flag indicating for us to request fullscreen on the following
            // keyup. This isn't perfect, but it enables SDL_WM_ToggleFullScreen
            // to work as the result of a keypress (which is an extremely
            // common use case).
            if (event.type === 'keydown') {
              SDL.canRequestFullscreen = true;
            } else if (event.type === 'keyup') {
              if (SDL.isRequestingFullscreen) {
                Module['requestFullScreen'](true, true);
                SDL.isRequestingFullscreen = false;
              }
              SDL.canRequestFullscreen = false;
            }
            // SDL expects a unicode character to be passed to its keydown events.
            // Unfortunately, the browser APIs only provide a charCode property on
            // keypress events, so we must backfill in keydown events with their
            // subsequent keypress event's charCode.
            if (event.type === 'keypress' && SDL.savedKeydown) {
              // charCode is read-only
              SDL.savedKeydown.keypressCharCode = event.charCode;
              SDL.savedKeydown = null;
            } else if (event.type === 'keydown') {
              SDL.savedKeydown = event;
            }
            // If we preventDefault on keydown events, the subsequent keypress events
            // won't fire. However, it's fine (and in some cases necessary) to
            // preventDefault for keys that don't generate a character.
            if (event.type !== 'keydown' || (event.keyCode === 8 /* backspace */ || event.keyCode === 9 /* tab */)) {
              event.preventDefault();
            }
            // Don't push keypress events unless SDL_StartTextInput has been called.
            if (event.type !== 'keypress' || SDL.textInput) {
              SDL.events.push(event);
            }
            break;
          case 'mouseout':
            // Un-press all pressed mouse buttons, because we might miss the release outside of the canvas
            for (var i = 0; i < 3; i++) {
              if (SDL.DOMButtons[i]) {
                SDL.events.push({
                  type: 'mouseup',
                  button: i,
                  pageX: event.pageX,
                  pageY: event.pageY
                });
                SDL.DOMButtons[i] = 0;
              }
            }
            event.preventDefault();
            break;
          case 'blur':
          case 'visibilitychange': {
            // Un-press all pressed keys: TODO
            for (var code in SDL.keyboardMap) {
              SDL.events.push({
                type: 'keyup',
                keyCode: SDL.keyboardMap[code]
              });
            }
            event.preventDefault();
            break;
          }
          case 'unload':
            if (Browser.mainLoop.runner) {
              SDL.events.push(event);
              // Force-run a main event loop, since otherwise this event will never be caught!
              Browser.mainLoop.runner();
            }
            return;
          case 'resize':
            SDL.events.push(event);
            // manually triggered resize event doesn't have a preventDefault member
            if (event.preventDefault) {
              event.preventDefault();
            }
            break;
        }
        if (SDL.events.length >= 10000) {
          Module.printErr('SDL event queue full, dropping events');
          SDL.events = SDL.events.slice(0, 10000);
        }
        return;
      },handleEvent:function (event) {
        if (event.handled) return;
        event.handled = true;
        switch (event.type) {
          case 'keydown': case 'keyup': {
            var down = event.type === 'keydown';
            var code = event.keyCode;
            if (code >= 65 && code <= 90) {
              code += 32; // make lowercase for SDL
            } else {
              code = SDL.keyCodes[event.keyCode] || event.keyCode;
            }
            HEAP8[(((SDL.keyboardState)+(code))|0)]=down;
            // TODO: lmeta, rmeta, numlock, capslock, KMOD_MODE, KMOD_RESERVED
            SDL.modState = (HEAP8[(((SDL.keyboardState)+(1248))|0)] ? 0x0040 | 0x0080 : 0) | // KMOD_LCTRL & KMOD_RCTRL
              (HEAP8[(((SDL.keyboardState)+(1249))|0)] ? 0x0001 | 0x0002 : 0) | // KMOD_LSHIFT & KMOD_RSHIFT
              (HEAP8[(((SDL.keyboardState)+(1250))|0)] ? 0x0100 | 0x0200 : 0); // KMOD_LALT & KMOD_RALT
            if (down) {
              SDL.keyboardMap[code] = event.keyCode; // save the DOM input, which we can use to unpress it during blur
            } else {
              delete SDL.keyboardMap[code];
            }
            break;
          }
          case 'mousedown': case 'mouseup':
            if (event.type == 'mousedown') {
              // SDL_BUTTON(x) is defined as (1 << ((x)-1)).  SDL buttons are 1-3,
              // and DOM buttons are 0-2, so this means that the below formula is
              // correct.
              SDL.buttonState |= 1 << event.button;
            } else if (event.type == 'mouseup') {
              SDL.buttonState &= ~(1 << event.button);
            }
            // fall through
          case 'mousemove': {
            Browser.calculateMouseEvent(event);
            break;
          }
        }
      },makeCEvent:function (event, ptr) {
        if (typeof event === 'number') {
          // This is a pointer to a native C event that was SDL_PushEvent'ed
          _memcpy(ptr, event, SDL.structs.KeyboardEvent.__size__); // XXX
          return;
        }
        SDL.handleEvent(event);
        switch (event.type) {
          case 'keydown': case 'keyup': {
            var down = event.type === 'keydown';
            //Module.print('Received key event: ' + event.keyCode);
            var key = event.keyCode;
            if (key >= 65 && key <= 90) {
              key += 32; // make lowercase for SDL
            } else {
              key = SDL.keyCodes[event.keyCode] || event.keyCode;
            }
            var scan;
            if (key >= 1024) {
              scan = key - 1024;
            } else {
              scan = SDL.scanCodes[key] || key;
            }
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type]
            HEAP8[(((ptr)+(SDL.structs.KeyboardEvent.state))|0)]=down ? 1 : 0
            HEAP8[(((ptr)+(SDL.structs.KeyboardEvent.repeat))|0)]=0 // TODO
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.scancode))>>2)]=scan
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.sym))>>2)]=key
            HEAP16[(((ptr)+(SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.mod))>>1)]=SDL.modState
            // some non-character keys (e.g. backspace and tab) won't have keypressCharCode set, fill in with the keyCode.
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.unicode))>>2)]=event.keypressCharCode || key
            break;
          }
          case 'keypress': {
            HEAP32[(((ptr)+(SDL.structs.TextInputEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type]
            // Not filling in windowID for now
            var cStr = intArrayFromString(String.fromCharCode(event.charCode));
            for (var i = 0; i < cStr.length; ++i) {
              HEAP8[(((ptr)+(SDL.structs.TextInputEvent.text + i))|0)]=cStr[i];
            }
            break;
          }
          case 'mousedown': case 'mouseup': case 'mousemove': {
            if (event.type != 'mousemove') {
              var down = event.type === 'mousedown';
              HEAP32[(((ptr)+(SDL.structs.MouseButtonEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type];
              HEAP8[(((ptr)+(SDL.structs.MouseButtonEvent.button))|0)]=event.button+1; // DOM buttons are 0-2, SDL 1-3
              HEAP8[(((ptr)+(SDL.structs.MouseButtonEvent.state))|0)]=down ? 1 : 0;
              HEAP32[(((ptr)+(SDL.structs.MouseButtonEvent.x))>>2)]=Browser.mouseX;
              HEAP32[(((ptr)+(SDL.structs.MouseButtonEvent.y))>>2)]=Browser.mouseY;
            } else {
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type];
              HEAP8[(((ptr)+(SDL.structs.MouseMotionEvent.state))|0)]=SDL.buttonState;
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.x))>>2)]=Browser.mouseX;
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.y))>>2)]=Browser.mouseY;
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.xrel))>>2)]=Browser.mouseMovementX;
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.yrel))>>2)]=Browser.mouseMovementY;
            }
            break;
          }
          case 'unload': {
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type];
            break;
          }
          case 'resize': {
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type];
            HEAP32[(((ptr)+(SDL.structs.ResizeEvent.w))>>2)]=event.w;
            HEAP32[(((ptr)+(SDL.structs.ResizeEvent.h))>>2)]=event.h;
            break;
          }
          default: throw 'Unhandled SDL event: ' + event.type;
        }
      },estimateTextWidth:function (fontData, text) {
        var h = fontData.size;
        var fontString = h + 'px ' + fontData.name;
        var tempCtx = SDL.ttfContext;
        tempCtx.save();
        tempCtx.font = fontString;
        var ret = tempCtx.measureText(text).width | 0;
        tempCtx.restore();
        return ret;
      },allocateChannels:function (num) { // called from Mix_AllocateChannels and init
        if (SDL.numChannels && SDL.numChannels >= num) return;
        SDL.numChannels = num;
        SDL.channels = [];
        for (var i = 0; i < num; i++) {
          SDL.channels[i] = {
            audio: null,
            volume: 1.0
          };
        }
      },setGetVolume:function (info, volume) {
        if (!info) return 0;
        var ret = info.volume * 128; // MIX_MAX_VOLUME
        if (volume != -1) {
          info.volume = volume / 128;
          if (info.audio) info.audio.volume = info.volume;
        }
        return ret;
      },debugSurface:function (surfData) {
        console.log('dumping surface ' + [surfData.surf, surfData.source, surfData.width, surfData.height]);
        var image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
        var data = image.data;
        var num = Math.min(surfData.width, surfData.height);
        for (var i = 0; i < num; i++) {
          console.log('   diagonal ' + i + ':' + [data[i*surfData.width*4 + i*4 + 0], data[i*surfData.width*4 + i*4 + 1], data[i*surfData.width*4 + i*4 + 2], data[i*surfData.width*4 + i*4 + 3]]);
        }
      }};function _SDL_WM_GrabInput() {}
  function _SDL_PollEvent(ptr) {
      if (SDL.events.length === 0) return 0;
      if (ptr) {
        SDL.makeCEvent(SDL.events.shift(), ptr);
      }
      return 1;
    }
  function _SDL_LockSurface(surf) {
      var surfData = SDL.surfaces[surf];
      surfData.locked++;
      if (surfData.locked > 1) return 0;
      // Mark in C/C++-accessible SDL structure
      // SDL_Surface has the following fields: Uint32 flags, SDL_PixelFormat *format; int w, h; Uint16 pitch; void *pixels; ...
      // So we have fields all of the same size, and 5 of them before us.
      // TODO: Use macros like in library.js
      HEAP32[(((surf)+(5*Runtime.QUANTUM_SIZE))>>2)]=surfData.buffer;
      if (surf == SDL.screen && Module.screenIsReadOnly && surfData.image) return 0;
      surfData.image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
      if (surf == SDL.screen) {
        var data = surfData.image.data;
        var num = data.length;
        for (var i = 0; i < num/4; i++) {
          data[i*4+3] = 255; // opacity, as canvases blend alpha
        }
      }
      if (SDL.defaults.copyOnLock) {
        // Copy pixel data to somewhere accessible to 'C/C++'
        if (surfData.isFlagSet(0x00200000 /* SDL_HWPALETTE */)) {
          // If this is neaded then
          // we should compact the data from 32bpp to 8bpp index.
          // I think best way to implement this is use
          // additional colorMap hash (color->index).
          // Something like this:
          //
          // var size = surfData.width * surfData.height;
          // var data = '';
          // for (var i = 0; i<size; i++) {
          //   var color = SDL.translateRGBAToColor(
          //     surfData.image.data[i*4   ], 
          //     surfData.image.data[i*4 +1], 
          //     surfData.image.data[i*4 +2], 
          //     255);
          //   var index = surfData.colorMap[color];
          //   HEAP8[(((surfData.buffer)+(i))|0)]=index;
          // }
          throw 'CopyOnLock is not supported for SDL_LockSurface with SDL_HWPALETTE flag set' + new Error().stack;
        } else {
        HEAPU8.set(surfData.image.data, surfData.buffer);
        }
      }
      return 0;
    }
  function _SDL_GetError() {
      if (!SDL.errorMessage) {
        SDL.errorMessage = allocate(intArrayFromString("unknown SDL-emscripten error"), 'i8', ALLOC_NORMAL);
      }
      return SDL.errorMessage;
    }
  function _SDL_UnlockSurface(surf) {
      assert(!SDL.GL); // in GL mode we do not keep around 2D canvases and contexts
      var surfData = SDL.surfaces[surf];
      surfData.locked--;
      if (surfData.locked > 0) return;
      // Copy pixel data to image
      if (surfData.isFlagSet(0x00200000 /* SDL_HWPALETTE */)) {
        SDL.copyIndexedColorData(surfData);
      } else if (!surfData.colors) {
        var data = surfData.image.data;
        var buffer = surfData.buffer;
        assert(buffer % 4 == 0, 'Invalid buffer offset: ' + buffer);
        var src = buffer >> 2;
        var dst = 0;
        var isScreen = surf == SDL.screen;
        var data32 = new Uint32Array(data.buffer);
        var num = data32.length;
        while (dst < num) {
          // HEAP32[src++] is an optimization. Instead, we could do HEAP32[(((buffer)+(dst))>>2)];
          data32[dst++] = HEAP32[src++] | (isScreen ? 0xff000000 : 0);
        }
      } else {
        var width = Module['canvas'].width;
        var height = Module['canvas'].height;
        var s = surfData.buffer;
        var data = surfData.image.data;
        var colors = surfData.colors;
        for (var y = 0; y < height; y++) {
          var base = y*width*4;
          for (var x = 0; x < width; x++) {
            // See comment above about signs
            var val = HEAPU8[((s++)|0)] * 3;
            var start = base + x*4;
            data[start]   = colors[val];
            data[start+1] = colors[val+1];
            data[start+2] = colors[val+2];
          }
          s += width*3;
        }
      }
      // Copy to canvas
      surfData.ctx.putImageData(surfData.image, 0, 0);
      // Note that we save the image, so future writes are fast. But, memory is not yet released
    }
  function _SDL_Flip(surf) {
      // We actually do this in Unlock, since the screen surface has as its canvas
      // backing the page canvas element
    }
  function _SDL_Init(what) {
      SDL.startTime = Date.now();
      // capture all key events. we just keep down and up, but also capture press to prevent default actions
      if (!Module['doNotCaptureKeyboard']) {
        document.addEventListener("keydown", SDL.receiveEvent);
        document.addEventListener("keyup", SDL.receiveEvent);
        document.addEventListener("keypress", SDL.receiveEvent);
        document.addEventListener("blur", SDL.receiveEvent);
        document.addEventListener("visibilitychange", SDL.receiveEvent);
      }
      window.addEventListener("unload", SDL.receiveEvent);
      SDL.keyboardState = _malloc(0x10000); // Our SDL needs 512, but 64K is safe for older SDLs
      _memset(SDL.keyboardState, 0, 0x10000);
      // Initialize this structure carefully for closure
      SDL.DOMEventToSDLEvent['keydown'] = 0x300 /* SDL_KEYDOWN */;
      SDL.DOMEventToSDLEvent['keyup'] = 0x301 /* SDL_KEYUP */;
      SDL.DOMEventToSDLEvent['keypress'] = 0x303 /* SDL_TEXTINPUT */;
      SDL.DOMEventToSDLEvent['mousedown'] = 0x401 /* SDL_MOUSEBUTTONDOWN */;
      SDL.DOMEventToSDLEvent['mouseup'] = 0x402 /* SDL_MOUSEBUTTONUP */;
      SDL.DOMEventToSDLEvent['mousemove'] = 0x400 /* SDL_MOUSEMOTION */;
      SDL.DOMEventToSDLEvent['unload'] = 0x100 /* SDL_QUIT */;
      SDL.DOMEventToSDLEvent['resize'] = 0x7001 /* SDL_VIDEORESIZE/SDL_EVENT_COMPAT2 */;
      return 0; // success
    }
  function _SDL_WM_SetCaption(title, icon) {
      title = title && Pointer_stringify(title);
      icon = icon && Pointer_stringify(icon);
    }
  function _SDL_GL_SetAttribute(attr, value) {
      console.log('TODO: SDL_GL_SetAttribute');
    }
  function _SDL_SetVideoMode(width, height, depth, flags) {
      ['mousedown', 'mouseup', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mouseout'].forEach(function(event) {
        Module['canvas'].addEventListener(event, SDL.receiveEvent, true);
      });
      Browser.setCanvasSize(width, height, true);
      // Free the old surface first.
      if (SDL.screen) {
        SDL.freeSurface(SDL.screen);
        SDL.screen = null;
      }
      SDL.screen = SDL.makeSurface(width, height, flags, true, 'screen');
      if (!SDL.addedResizeListener) {
        SDL.addedResizeListener = true;
        Browser.resizeListeners.push(function(w, h) {
          SDL.receiveEvent({
            type: 'resize',
            w: w,
            h: h
          });
        });
      }
      return SDL.screen;
    }
  function _SDL_ShowCursor(toggle) {
      switch (toggle) {
        case 0: // SDL_DISABLE
          if (Browser.isFullScreen) { // only try to lock the pointer when in full screen mode
            Module['canvas'].requestPointerLock();
            return 0;
          } else { // else return SDL_ENABLE to indicate the failure
            return 1;
          }
          break;
        case 1: // SDL_ENABLE
          Module['canvas'].exitPointerLock();
          return 1;
          break;
        case -1: // SDL_QUERY
          return !Browser.pointerLock;
          break;
        default:
          console.log( "SDL_ShowCursor called with unknown toggle parameter value: " + toggle + "." );
          break;
      }
    }
  function _SDL_GL_GetAttribute() {
  Module['printErr']('missing function: SDL_GL_GetAttribute'); abort(-1);
  }
  function _SDL_WarpMouse(x, y) {
      return; // TODO: implement this in a non-buggy way. Need to keep relative mouse movements correct after calling this
      var rect = Module["canvas"].getBoundingClientRect();
      SDL.events.push({
        type: 'mousemove',
        pageX: x + (window.scrollX + rect.left),
        pageY: y + (window.scrollY + rect.top)
      });
    }
  function _SDL_ListModes(format, flags) {
      return -1; // -1 == all modes are ok. TODO
    }
  function _SDL_Quit() {
      for (var i = 0; i < SDL.numChannels; ++i) {
        if (SDL.channels[i].audio) {
          SDL.channels[i].audio.pause();
        }
      }
      if (SDL.music.audio) {
        SDL.music.audio.pause();
      }
      Module.print('SDL_Quit called (and ignored)');
    }
  function _SDL_SetColors(surf, colors, firstColor, nColors) {
      var surfData = SDL.surfaces[surf];
      // we should create colors array
      // only once cause client code
      // often wants to change portion 
      // of palette not all palette.
      if (!surfData.colors) {
        surfData.colors = new Uint8Array(256 * 3); //256 RGB colors
      } 
      for (var i = firstColor; i < firstColor + nColors; i++) {
        var index = i *3;
        surfData.colors[index] = HEAPU8[(((colors)+(i*4))|0)];
        surfData.colors[index +1] = HEAPU8[(((colors)+(i*4 +1))|0)];
        surfData.colors[index +2] = HEAPU8[(((colors)+(i*4 +2))|0)];
      }
      return 1;
    }function _SDL_SetPalette(surf, flags, colors, firstColor, nColors) {
      return _SDL_SetColors(surf, colors, firstColor, nColors);
    }
  function _SDL_GetVideoSurface() {
      return SDL.screen;
    }
  function _SDL_GetMouseState(x, y) {
      if (x) HEAP32[((x)>>2)]=Browser.mouseX;
      if (y) HEAP32[((y)>>2)]=Browser.mouseY;
      return SDL.buttonState;
    }
  function _SDL_LockAudio() {}
  function _SDL_UnlockAudio() {}
  var _llvm_pow_f64=Math.pow;
  function _SDL_PauseAudio(pauseOn) {
      if (SDL.audio.paused !== pauseOn) {
        SDL.audio.timer = pauseOn ? SDL.audio.timer && clearInterval(SDL.audio.timer) : Browser.safeSetInterval(SDL.audio.caller, 1/35);
      }
      SDL.audio.paused = pauseOn;
    }function _SDL_CloseAudio() {
      if (SDL.audio) {
        _SDL_PauseAudio(1);
        _free(SDL.audio.buffer);
        SDL.audio = null;
      }
    }
  function _SDL_OpenAudio(desired, obtained) {
      SDL.allocateChannels(32);
      SDL.audio = {
        freq: HEAPU32[(((desired)+(SDL.structs.AudioSpec.freq))>>2)],
        format: HEAPU16[(((desired)+(SDL.structs.AudioSpec.format))>>1)],
        channels: HEAPU8[(((desired)+(SDL.structs.AudioSpec.channels))|0)],
        samples: HEAPU16[(((desired)+(SDL.structs.AudioSpec.samples))>>1)],
        callback: HEAPU32[(((desired)+(SDL.structs.AudioSpec.callback))>>2)],
        userdata: HEAPU32[(((desired)+(SDL.structs.AudioSpec.userdata))>>2)],
        paused: true,
        timer: null
      };
      if (obtained) {
        HEAP32[(((obtained)+(SDL.structs.AudioSpec.freq))>>2)]=SDL.audio.freq; // no good way for us to know if the browser can really handle this
        HEAP16[(((obtained)+(SDL.structs.AudioSpec.format))>>1)]=33040; // float, signed, 16-bit
        HEAP8[(((obtained)+(SDL.structs.AudioSpec.channels))|0)]=SDL.audio.channels;
        HEAP8[(((obtained)+(SDL.structs.AudioSpec.silence))|0)]=HEAPU8[(((desired)+(SDL.structs.AudioSpec.silence))|0)]; // unclear if browsers can provide this
        HEAP16[(((obtained)+(SDL.structs.AudioSpec.samples))>>1)]=SDL.audio.samples;
        HEAP32[(((obtained)+(SDL.structs.AudioSpec.callback))>>2)]=SDL.audio.callback;
        HEAP32[(((obtained)+(SDL.structs.AudioSpec.userdata))>>2)]=SDL.audio.userdata;
      }
      var totalSamples = SDL.audio.samples*SDL.audio.channels;
      SDL.audio.bufferSize = totalSamples*2; // hardcoded 16-bit audio
      SDL.audio.buffer = _malloc(SDL.audio.bufferSize);
      SDL.audio.caller = function() {
        Runtime.dynCall('viii', SDL.audio.callback, [SDL.audio.userdata, SDL.audio.buffer, SDL.audio.bufferSize]);
        SDL.audio.pushAudio(SDL.audio.buffer, SDL.audio.bufferSize);
      };
      // Mozilla Audio API. TODO: Other audio APIs
      try {
        SDL.audio.mozOutput = new Audio();
        SDL.audio.mozOutput['mozSetup'](SDL.audio.channels, SDL.audio.freq); // use string attributes on mozOutput for closure compiler
        SDL.audio.mozBuffer = new Float32Array(totalSamples);
        SDL.audio.pushAudio = function(ptr, size) {
          var mozBuffer = SDL.audio.mozBuffer;
          for (var i = 0; i < totalSamples; i++) {
            mozBuffer[i] = (HEAP16[(((ptr)+(i*2))>>1)]) / 0x8000; // hardcoded 16-bit audio, signed (TODO: reSign if not ta2?)
          }
          SDL.audio.mozOutput['mozWriteAudio'](mozBuffer);
        }
      } catch(e) {
        SDL.audio = null;
      }
      if (!SDL.audio) return -1;
      return 0;
    }
  function _SDL_GetTicks() {
      return Math.floor(Date.now() - SDL.startTime);
    }
  function _SDL_Delay(delay) {
      abort('SDL_Delay called! Potential infinite loop, quitting.');
    }
  function _fstat(fildes, buf) {
      // int fstat(int fildes, struct stat *buf);
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/fstat.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      return _stat(stream.path, buf);
    }
  function _mknod(path, mode, dev) {
      // int mknod(const char *path, mode_t mode, dev_t dev);
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/mknod.html
      path = Pointer_stringify(path);
      // we don't want this in the JS API as the JS API
      // uses mknod to create all nodes.
      switch (mode & 0170000) {
        case 0100000:
        case 0020000:
        case 0060000:
        case 0010000:
        case 0140000:
          break;
        default:
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
      }
      try {
        FS.mknod(path, mode, dev);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _mkdir(path, mode) {
      // int mkdir(const char *path, mode_t mode);
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/mkdir.html
      path = Pointer_stringify(path);
      try {
        FS.mkdir(path, mode, 0);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _SDL_SaveBMP_RW() { throw 'SDL_SaveBMP_RW: TODO' }
  function _SDL_RWFromFile(_name, mode) {
      var id = SDL.rwops.length; // TODO: recycle ids when they are null
      var name = Pointer_stringify(_name)
      SDL.rwops.push({ filename: name, mimetype: Browser.getMimetype(name) });
      return id;
    }
  function _abort() {
      Module['abort']();
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
___strtok_state = Runtime.staticAlloc(4);
___buildEnvironment(ENV);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);
var Math_min = Math.min;
function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stdout|0;var p=env._stderr|0;var q=+env.NaN;var r=+env.Infinity;var s=0;var t=0;var u=0;var v=0;var w=0,x=0,y=0,z=0,A=0.0,B=0,C=0,D=0,E=0.0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=global.Math.floor;var Q=global.Math.abs;var R=global.Math.sqrt;var S=global.Math.pow;var T=global.Math.cos;var U=global.Math.sin;var V=global.Math.tan;var W=global.Math.acos;var X=global.Math.asin;var Y=global.Math.atan;var Z=global.Math.atan2;var _=global.Math.exp;var $=global.Math.log;var aa=global.Math.ceil;var ab=global.Math.imul;var ac=env.abort;var ad=env.assert;var ae=env.asmPrintInt;var af=env.asmPrintFloat;var ag=env.min;var ah=env.invoke_i;var ai=env.invoke_vi;var aj=env.invoke_vii;var ak=env.invoke_ii;var al=env.invoke_viii;var am=env.invoke_v;var an=env.invoke_viiiiiiiii;var ao=env.invoke_viiiiii;var ap=env.invoke_iii;var aq=env.invoke_viiii;var ar=env._lseek;var as=env.__scanString;var at=env._fclose;var au=env.__isFloat;var av=env._fflush;var aw=env._SDL_GetMouseState;var ax=env._strtol;var ay=env._fputc;var az=env._strtok;var aA=env._fwrite;var aB=env._send;var aC=env._fputs;var aD=env._SDL_WarpMouse;var aE=env._isspace;var aF=env._strlwr;var aG=env._SDL_UnlockAudio;var aH=env._read;var aI=env._SDL_UnlockSurface;var aJ=env._sbrk;var aK=env._fsync;var aL=env._signal;var aM=env._SDL_PauseAudio;var aN=env._remove;var aO=env._strcmp;var aP=env._memchr;var aQ=env._strncmp;var aR=env._snprintf;var aS=env._SDL_RWFromFile;var aT=env._fgetc;var aU=env._SDL_SetPalette;var aV=env._atexit;var aW=env._mknod;var aX=env._isalnum;var aY=env._SDL_LockAudio;var aZ=env._fgets;var a_=env._close;var a$=env._strchr;var a0=env._SDL_LockSurface;var a1=env.___setErrNo;var a2=env._access;var a3=env._ftell;var a4=env._exit;var a5=env._sprintf;var a6=env._SDL_ShowCursor;var a7=env._SDL_WM_GrabInput;var a8=env._recv;var a9=env._SDL_SetColors;var ba=env._puts;var bb=env._SDL_Init;var bc=env._mmap;var bd=env.__exit;var be=env._llvm_va_end;var bf=env._SDL_GL_GetAttribute;var bg=env._toupper;var bh=env._printf;var bi=env._pread;var bj=env._SDL_SetVideoMode;var bk=env._fopen;var bl=env._open;var bm=env._SDL_GL_SetAttribute;var bn=env._SDL_PollEvent;var bo=env._SDL_GetTicks;var bp=env._SDL_Flip;var bq=env._mkdir;var br=env._rmdir;var bs=env._SDL_GetError;var bt=env._isatty;var bu=env.__formatString;var bv=env._getenv;var bw=env._atoi;var bx=env._SDL_GetVideoSurface;var by=env._SDL_WM_SetCaption;var bz=env._llvm_pow_f64;var bA=env._SDL_SaveBMP_RW;var bB=env._fscanf;var bC=env.___errno_location;var bD=env._strerror;var bE=env._SDL_CloseAudio;var bF=env._fstat;var bG=env._SDL_Quit;var bH=env.__parseInt;var bI=env._ungetc;var bJ=env._SDL_OpenAudio;var bK=env._vsnprintf;var bL=env._sscanf;var bM=env._sysconf;var bN=env._fread;var bO=env._strtok_r;var bP=env._abort;var bQ=env._fprintf;var bR=env._isdigit;var bS=env.___buildEnvironment;var bT=env._feof;var bU=env.__reallyNegative;var bV=env._fseek;var bW=env._sqrt;var bX=env._write;var bY=env._stat;var bZ=env._SDL_ListModes;var b_=env._emscripten_set_main_loop;var b$=env._SDL_Delay;var b0=env._setbuf;var b1=env._unlink;var b2=env.___assert_func;var b3=env._pwrite;var b4=env._strerror_r;var b5=env._atan2;var b6=env._time;var b7=env._setvbuf;
// EMSCRIPTEN_START_FUNCS
function hs(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;a=0;b=0;d=0;e=0;f=2147483647;g=2147483647;h=-2147483648;i=-2147483648;j=0;while(1){if((j|0)>=(c[111108]|0)){break}k=c[(c[100350]|0)+(j<<3)>>2]|0;l=k;if((k|0)<(f|0)){f=l}else{if((l|0)>(h|0)){h=l}}k=c[(c[100350]|0)+(j<<3)+4>>2]|0;l=k;if((k|0)<(g|0)){g=l}else{if((l|0)>(i|0)){i=l}}j=j+1|0}f=f>>16;h=h>>16;g=g>>16;i=i>>16;l=f|0;f=g|0;g=h-l+128>>7;h=i-f+128>>7;i=ab(g,h)|0;a=up(i,4,1,0)|0;b=up(i,4,1,0)|0;d=ug(i<<2,1,0)|0;j=0;while(1){if((j|0)>=(i|0)){break}c[a+(j<<2)>>2]=ug(8,1,0)|0;c[c[a+(j<<2)>>2]>>2]=-1;c[(c[a+(j<<2)>>2]|0)+4>>2]=0;k=b+(j<<2)|0;c[k>>2]=(c[k>>2]|0)+1;j=j+1|0}j=0;while(1){if((j|0)>=(c[111132]|0)){break}k=c[c[(c[113656]|0)+(j*124|0)+4>>2]>>2]>>16;m=c[(c[(c[113656]|0)+(j*124|0)+4>>2]|0)+4>>2]>>16;n=c[c[(c[113656]|0)+(j*124|0)+8>>2]>>2]>>16;o=c[(c[(c[113656]|0)+(j*124|0)+8>>2]|0)+4>>2]>>16;p=n-k|0;q=o-m|0;r=((p|0)!=0^1)&1;s=((q|0)!=0^1)&1;t=(p^q|0)>0|0;u=(p^q|0)<0|0;if((k|0)>(n|0)){v=n}else{v=k}w=v;if((k|0)>(n|0)){x=k}else{x=n}y=x;if((m|0)>(o|0)){z=o}else{z=m}A=z;if((m|0)>(o|0)){B=m}else{B=o}C=B;wS(d|0,0,i<<2|0);D=k-l>>7;E=m-f>>7;hu(a,b,d,(ab(E,g)|0)+D|0,j);D=n-l>>7;E=o-f>>7;hu(a,b,d,(ab(E,g)|0)+D|0,j);if((r|0)==0){F=0;while(1){if((F|0)>=(g|0)){break}D=l+(F<<7)|0;E=((ab(q,D-k|0)|0)/(p|0)|0)+m|0;o=E-f>>7;n=E-f&127;L7736:do{if((o|0)<0){G=5972}else{if((o|0)>(h-1|0)){G=5972;break}do{if((D|0)>=(w|0)){if((D|0)>(y|0)){break}hu(a,b,d,(ab(g,o)|0)+F|0,j);if((n|0)==0){if((u|0)!=0){do{if((o|0)>0){if((A|0)>=(E|0)){break}hu(a,b,d,(ab(g,o-1|0)|0)+F|0,j)}}while(0);do{if((F|0)>0){if((w|0)>=(D|0)){break}hu(a,b,d,(ab(g,o)|0)+F-1|0,j)}}while(0)}else{if((t|0)!=0){do{if((o|0)>0){if((F|0)<=0){break}if((w|0)>=(D|0)){break}hu(a,b,d,(ab(g,o-1|0)|0)+F-1|0,j)}}while(0)}else{if((s|0)!=0){do{if((F|0)>0){if((w|0)>=(D|0)){break}hu(a,b,d,(ab(g,o)|0)+F-1|0,j)}}while(0)}}}}else{do{if((F|0)>0){if((w|0)>=(D|0)){break}hu(a,b,d,(ab(g,o)|0)+F-1|0,j)}}while(0)}break L7736}}while(0)}}while(0);if((G|0)==5972){G=0}F=F+1|0}}if((s|0)==0){F=0;while(1){if((F|0)>=(h|0)){break}y=f+(F<<7)|0;o=((ab(p,y-m|0)|0)/(q|0)|0)+k|0;D=o-l>>7;E=o-l&127;L7789:do{if((D|0)<0){G=6011}else{if((D|0)>(g-1|0)){G=6011;break}do{if((y|0)>=(A|0)){if((y|0)>(C|0)){break}hu(a,b,d,(ab(g,F)|0)+D|0,j);if((E|0)==0){if((u|0)!=0){do{if((F|0)>0){if((A|0)>=(y|0)){break}hu(a,b,d,(ab(g,F-1|0)|0)+D|0,j)}}while(0);do{if((D|0)>0){if((w|0)>=(o|0)){break}hu(a,b,d,(ab(g,F)|0)+D-1|0,j)}}while(0)}else{if((r|0)!=0){do{if((F|0)>0){if((A|0)>=(y|0)){break}hu(a,b,d,(ab(g,F-1|0)|0)+D|0,j)}}while(0)}else{if((t|0)!=0){do{if((D|0)>0){if((F|0)<=0){break}if((A|0)>=(y|0)){break}hu(a,b,d,(ab(g,F-1|0)|0)+D-1|0,j)}}while(0)}}}}else{do{if((F|0)>0){if((A|0)>=(y|0)){break}hu(a,b,d,(ab(g,F-1|0)|0)+D|0,j)}}while(0)}break L7789}}while(0)}}while(0);if((G|0)==6011){G=0}F=F+1|0}}j=j+1|0}wS(d|0,0,i<<2|0);j=0;e=0;while(1){if((j|0)>=(i|0)){break}hu(a,b,d,j,0);e=e+(c[b+(j<<2)>>2]|0)|0;j=j+1|0}c[154954]=ug(i+4+e<<2,4,0)|0;e=l<<16;c[154950]=e;c[c[154954]>>2]=e;e=f<<16;c[154948]=e;c[(c[154954]|0)+4>>2]=e;e=g;c[154946]=e;c[(c[154954]|0)+8>>2]=e;e=h;c[154952]=e;c[(c[154954]|0)+12>>2]=e;j=0;while(1){if((j|0)>=(i|0)){break}e=c[a+(j<<2)>>2]|0;if((j|0)!=0){H=c[(c[154954]|0)+(j+4-1<<2)>>2]|0}else{H=i+4|0}if((j|0)!=0){I=c[b+(j-1<<2)>>2]|0}else{I=0}h=H+I|0;c[(c[154954]|0)+(j+4<<2)>>2]=h;g=h;while(1){if((e|0)==0){break}h=c[e+4>>2]|0;f=g;g=f+1|0;c[(c[154954]|0)+(f<<2)>>2]=c[e>>2];ul(e);e=h}j=j+1|0}ul(a);ul(b);ul(d);return}function ht(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0;c=a;a=b;b=c;d=b>>31;e=a;f=e>>31;if(((b^d)-d|0)>>>14>>>0>=((e^f)-f|0)>>>0){g=(c^a)>>31^2147483647;return g|0}else{f=c;c=f;e=a;a=w7(c<<16|0>>>16,((f|0)<0?-1:0)<<16|c>>>16,e,(e|0)<0?-1:0)|0;g=a;return g|0}return 0}function hu(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0;g=a;a=d;d=e;if((c[a+(d<<2)>>2]|0)!=0){return}else{e=ug(8,1,0)|0;c[e>>2]=f;c[e+4>>2]=c[g+(d<<2)>>2];c[g+(d<<2)>>2]=e;e=b+(d<<2)|0;c[e>>2]=(c[e>>2]|0)+1;c[a+(d<<2)>>2]=1;return}}function hv(a,b){a=a|0;b=b|0;var d=0,e=0;b=i;d=a;a=vF(d+7|0)|0;if((c[a>>2]|0)==1146048090){eJ(117328,(e=i,i=i+1|0,i=i+7>>3<<3,c[e>>2]=0,e)|0);i=e}a=vF(d+6|0)|0;if((c[a>>2]|0)!=1313621850){i=b;return 0}eJ(116208,(e=i,i=i+1|0,i=i+7>>3<<3,c[e>>2]=0,e)|0);i=e;i=b;return 0}function hw(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;f=b;b=d;c[111156]=c[144530];do{if((c[8132]|0)!=0){if((c[111208]|0)!=0){break}d=f;eI(2,144040,(g=i,i=i+8|0,c[g>>2]=d,g)|0)|0;i=g;we();hx(f);c[144786]=up(c[111156]|0,16,1,0)|0;g=1;while(1){if((g|0)>=114){break}d=149052+(g*36|0)|0;x=-1;a[d]=x&255;x=x>>8;a[d+1|0]=x&255;x=x>>8;a[d+2|0]=x&255;x=x>>8;a[d+3|0]=x&255;d=149056+(g*36|0)|0;x=-1;a[d]=x&255;x=x>>8;a[d+1|0]=x&255;x=x>>8;a[d+2|0]=x&255;x=x>>8;a[d+3|0]=x&255;g=g+1|0}}}while(0);if((c[8950]|0)==0){i=e;return}if((c[111210]|0)!=0){i=e;return}hy(b);c[113384]=0;i=e;return}function hx(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;do{if((c[8132]|0)!=0){if((c[111208]|0)!=0){break}if((d|0)<0){e=6103}else{if((d|0)>127){e=6103}}if((e|0)==6103){eJ(118056,(a=i,i=i+8|0,c[a>>2]=d,a)|0);i=a}c[8134]=d;i=b;return}}while(0);i=b;return}function hy(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;do{if((c[8950]|0)!=0){if((c[111210]|0)!=0){break}if((d|0)<0){e=6113}else{if((d|0)>15){e=6113}}if((e|0)==6113){eJ(134936,(a=i,i=i+8|0,c[a>>2]=d,a)|0);i=a}ww(d);c[8136]=d;i=b;return}}while(0);i=b;return}function hz(){var a=0;if((c[8132]|0)==0){return}if((c[111208]|0)!=0){return}a=0;while(1){if((a|0)>=(c[111156]|0)){break}if((c[(c[144786]|0)+(a<<4)>>2]|0)!=0){hA(a)}a=a+1|0}return}function hA(a){a=a|0;var b=0,d=0,e=0;b=a;a=(c[144786]|0)+(b<<4)|0;do{if((c[8132]|0)!=0){if((c[111208]|0)!=0){break}if((c[a>>2]|0)==0){return}if((v9(c[a+8>>2]|0)|0)!=0){wi(c[a+8>>2]|0)}d=0;while(1){if((d|0)>=(c[111156]|0)){break}if((b|0)!=(d|0)){if((c[a>>2]|0)==(c[(c[144786]|0)+(d<<4)>>2]|0)){e=6141;break}}d=d+1|0}d=(c[a>>2]|0)+28|0;c[d>>2]=(c[d>>2]|0)-1;c[a>>2]=0;return}}while(0);return}function hB(){var a=0;hz();do{if((c[8950]|0)!=0){if((c[111210]|0)!=0){break}c[113384]=0;if((c[120494]|0)!=-1){a=c[120494]|0}else{if((c[14940]|0)==2){a=(c[122186]|0)+33-1|0}else{if((c[122700]|0)<4){a=(((c[122700]|0)-1|0)*9|0)+1+(c[122186]|0)-1|0}else{a=c[154216+((c[122186]|0)-1<<2)>>2]|0}}}hC(a,1);return}}while(0);return}function hC(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+16|0;e=d|0;f=a;a=b;do{if((c[8950]|0)!=0){if((c[111210]|0)!=0){break}if((f|0)<=0){g=6170}else{if((f|0)>=68){g=6170}}if((g|0)==6170){eJ(110528,(h=i,i=i+8|0,c[h>>2]=f,h)|0);i=h}b=153128+(f<<4)|0;if((c[113382]|0)==(b|0)){i=d;return}hO();if((c[b+4>>2]|0)==0){j=e|0;k=c[b>>2]|0;a5(j|0,105616,(h=i,i=i+8|0,c[h>>2]=k,h)|0)|0;i=h;c[b+4>>2]=os(e|0)|0}k=1;if((c[(c[113626]|0)+((c[b+4>>2]|0)*40|0)+36>>2]|0)==0){j=wL(c[625048+(f<<2)>>2]|0,624488)|0;if((j|0)!=0){k=wv(j,b)|0;ul(j)}}if((k|0)!=0){c[b+8>>2]=vF(c[b+4>>2]|0)|0;k=c[b+8>>2]|0;c[b+12>>2]=wu(k,ow(c[b+4>>2]|0)|0)|0}wp(c[b+12>>2]|0,a);c[113382]=b;i=d;return}}while(0);i=d;return}function hD(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;i=i+24|0;f=e|0;g=e+8|0;h=e+16|0;j=b;c[f>>2]=d;d=a;do{if((c[8132]|0)!=0){if((c[111208]|0)!=0){break}do{if((j&32768|0)!=0){k=1}else{if((j|0)==34){k=1;break}if((c[144658]|0)>>>0>=13){l=(j|0)==81}else{l=0}k=l}}while(0);a=k&1;j=j&-32769;if((j|0)<1){m=6196}else{if((j|0)>114){m=6196}}if((m|0)==6196){eJ(146160,(b=i,i=i+8|0,c[b>>2]=j,b)|0);i=b}b=149024+(j*36|0)|0;if((c[b+12>>2]|0)!=0){c[h>>2]=c[b+16>>2];n=c[b+8>>2]|0;c[f>>2]=(c[f>>2]|0)+(c[b+20>>2]|0);if((c[f>>2]|0)<1){i=e;return}if((c[f>>2]|0)>(c[8134]|0)){c[f>>2]=c[8134]}}else{c[h>>2]=128;n=64}do{if((d|0)!=0){if((d|0)==(c[442960+((c[142806]|0)*288|0)>>2]|0)){m=6206;break}if((hE(c[442960+((c[142806]|0)*288|0)>>2]|0,d,f,g,h)|0)==0){i=e;return}do{if((c[d+24>>2]|0)==(c[(c[442960+((c[142806]|0)*288|0)>>2]|0)+24>>2]|0)){if((c[d+28>>2]|0)!=(c[(c[442960+((c[142806]|0)*288|0)>>2]|0)+28>>2]|0)){break}c[g>>2]=128}}while(0)}else{m=6206}}while(0);if((m|0)==6206){c[g>>2]=128;c[f>>2]=c[f>>2]<<3}do{if((j|0)>=10){if((j|0)>13){m=6217;break}o=8-((lm(48)|0)&15)|0;c[h>>2]=(c[h>>2]|0)+o}else{m=6217}}while(0);if((m|0)==6217){do{if((j|0)!=32){if((j|0)==87){break}o=16-((lm(48)|0)&31)|0;c[h>>2]=(c[h>>2]|0)+o}}while(0)}if((c[h>>2]|0)<0){c[h>>2]=0}if((c[h>>2]|0)>255){c[h>>2]=255}o=0;L8066:while(1){if((o|0)>=(c[111156]|0)){break}do{if((c[(c[144786]|0)+(o<<4)>>2]|0)!=0){if((c[(c[144786]|0)+(o<<4)+4>>2]|0)!=(d|0)){break}if((c[144681]|0)!=0){m=6231;break L8066}if((c[(c[144786]|0)+(o<<4)+12>>2]|0)==(a|0)){m=6231;break L8066}}}while(0);o=o+1|0}if((m|0)==6231){hA(o)}o=hF(d,b,a)|0;if((o|0)<0){i=e;return}do{if((c[b+32>>2]|0)<0){p=wf(b)|0;c[b+32>>2]=p;if((p|0)>=0){break}i=e;return}}while(0);a=b+28|0;p=c[a>>2]|0;c[a>>2]=p+1;if((p|0)<0){c[b+28>>2]=1}p=wg(j,o,c[f>>2]|0,c[g>>2]|0,c[h>>2]|0,n)|0;if((p|0)==-1){i=e;return}c[(c[144786]|0)+(o<<4)+8>>2]=p;i=e;return}}while(0);i=e;return}function hE(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;f=a;a=b;b=d;d=e;do{if((c[8132]|0)!=0){if((c[111208]|0)!=0){break}if((f|0)==0){g=0;h=g;return h|0}e=(c[f+24>>2]|0)-(c[a+24>>2]|0)|0;i=e>>31;j=(e^i)-i|0;i=(c[f+28>>2]|0)-(c[a+28>>2]|0)|0;e=i>>31;k=(i^e)-e|0;if((j|0)<(k|0)){l=j}else{l=k}e=j+k-(l>>1)|0;if((e|0)==0){c[d>>2]=128;c[b>>2]=c[8134];g=(c[b>>2]|0)>0|0;h=g;return h|0}if((e|0)>78643200){g=0;h=g;return h|0}k=t_(c[f+24>>2]|0,c[f+28>>2]|0,c[a+24>>2]|0,c[a+28>>2]|0)|0;if(k>>>0<=(c[f+44>>2]|0)>>>0){k=k-1|0}k=k-(c[f+44>>2]|0)|0;k=k>>>19;c[d>>2]=128-((hL(6291456,c[515760+(k<<2)>>2]|0)|0)>>16);if((e|0)<10485760){c[b>>2]=c[8134]<<3}else{c[b>>2]=((ab(c[8134]|0,78643200-e>>16)|0)<<3|0)/1040|0}g=(c[b>>2]|0)>0|0;h=g;return h|0}}while(0);g=0;h=g;return h|0}function hF(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=a;a=b;b=d;do{if((c[8132]|0)!=0){if((c[111208]|0)!=0){break}d=0;L8130:while(1){if((d|0)<(c[111156]|0)){f=(c[(c[144786]|0)+(d<<4)>>2]|0)!=0}else{f=0}if(!f){break}do{if((e|0)!=0){if((c[(c[144786]|0)+(d<<4)+4>>2]|0)!=(e|0)){break}if((c[(c[144786]|0)+(d<<4)+12>>2]|0)==(b|0)){g=6285;break L8130}}}while(0);d=d+1|0}if((g|0)==6285){hA(d)}do{if((d|0)==(c[111156]|0)){d=0;while(1){if((d|0)>=(c[111156]|0)){break}if((c[(c[(c[144786]|0)+(d<<4)>>2]|0)+8>>2]|0)>=(c[a+8>>2]|0)){g=6292;break}d=d+1|0}if((d|0)==(c[111156]|0)){h=-1;i=h;return i|0}else{hA(d);break}}}while(0);j=(c[144786]|0)+(d<<4)|0;c[j>>2]=a;c[j+4>>2]=e;c[j+12>>2]=b;h=d;i=h;return i|0}}while(0);h=-1;i=h;return i|0}function hG(a,b){a=a|0;b=b|0;hD(a,b,c[8134]|0);return}function hH(a){a=a|0;var b=0,d=0;b=a;do{if((c[8132]|0)!=0){if((c[111208]|0)!=0){break}a=0;while(1){if((a|0)>=(c[111156]|0)){d=6318;break}if((c[(c[144786]|0)+(a<<4)>>2]|0)!=0){if((c[(c[144786]|0)+(a<<4)+4>>2]|0)==(b|0)){break}}a=a+1|0}if((d|0)==6318){return}hA(a);return}}while(0);return}function hI(){do{if((c[8950]|0)!=0){if((c[111210]|0)!=0){break}if((c[113382]|0)==0){return}if((c[113384]|0)!=0){return}wq(c[(c[113382]|0)+12>>2]|0);c[113384]=1;return}}while(0);return}function hJ(){do{if((c[8950]|0)!=0){if((c[111210]|0)!=0){break}if((c[113382]|0)==0){return}if((c[113384]|0)==0){return}wr(c[(c[113382]|0)+12>>2]|0);c[113384]=0;return}}while(0);return}function hK(){c[156112]=1;return}function hL(a,b){a=a|0;b=b|0;var c=0;c=a;a=b;b=w9(c,(c|0)<0?-1:0,a,(a|0)<0?-1:0)|0;a=F;a>>16|((a|0)<0?-1:0)<<16;return b>>>16|a<<16|0}function hM(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;b=i;i=i+24|0;d=b|0;e=b+8|0;f=b+16|0;g=a;a=g;do{if((c[8132]|0)!=0){if((c[111208]|0)!=0){break}h=0;while(1){if((h|0)>=(c[111156]|0)){break}j=(c[144786]|0)+(h<<4)|0;k=c[j>>2]|0;l=k;do{if((k|0)!=0){if((v9(c[j+8>>2]|0)|0)!=0){c[d>>2]=c[8134];c[e>>2]=128;c[f>>2]=128;if((c[l+12>>2]|0)!=0){c[e>>2]=c[l+16>>2];c[d>>2]=(c[d>>2]|0)+(c[l+20>>2]|0);if((c[d>>2]|0)<1){hA(h);break}if((c[d>>2]|0)>(c[8134]|0)){c[d>>2]=c[8134]}}do{if((c[j+4>>2]|0)!=0){if((g|0)==(c[j+4>>2]|0)){break}if((hE(a,c[j+4>>2]|0,d,f,e)|0)!=0){wc(c[j+8>>2]|0,c[d>>2]|0,c[f>>2]|0,c[e>>2]|0)}else{hA(h)}}}while(0)}else{hA(h)}m=6366}else{m=6366}}while(0);if((m|0)==6366){m=0}h=h+1|0}i=b;return}}while(0);i=b;return}function hN(a){a=a|0;var b=0;b=a;do{if((c[8950]|0)!=0){if((c[111210]|0)!=0){break}hC(b,0);return}}while(0);return}function hO(){do{if((c[8950]|0)!=0){if((c[111210]|0)!=0){break}if((c[113382]|0)==0){return}if((c[113384]|0)!=0){wr(c[(c[113382]|0)+12>>2]|0)}ws(c[(c[113382]|0)+12>>2]|0);wt(c[(c[113382]|0)+12>>2]|0);if((c[(c[113382]|0)+4>>2]|0)>=0){vI(c[(c[113382]|0)+4>>2]|0)}c[(c[113382]|0)+8>>2]=0;c[113382]=0;return}}while(0);return}function hP(a){a=a|0;var b=0,d=0;b=a;if((c[122178]|0)<3){return}do{if((jF(b)|0)!=0){d=1}else{if((c[122180]|0)==0){if((fv(b)|0)!=0){d=1;break}if((k5(b)|0)!=0){d=1;break}if((cI(b)|0)!=0){d=1;break}}d=(c8(b)|0)!=0}}while(0);return}function hQ(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;a=0;b=0;if((c[111216]|0)!=0){return}if((wy()|0)==0){return}d=(c[122180]|0)!=(c[20]|0);e=d&1;do{if(d){if((lQ()|0)==4){break}ua()|0}}while(0);if((c[122180]|0)!=0){d=c[39006]|0;if((d|0)==(-1|0)|(d|0)==0){l_(0)}d=c[122180]|0;if((d|0)==3){hR()}else if((d|0)==1){pn()}else if((d|0)==2){sY()}}else{if((c[122178]|0)!=(c[154980]|0)){ft();if((c[108380]|0)!=0){t$();c[39006]=-1}if((c[156016]&1|0)!=0){if((c[156016]&2|0)!=0){f=6425}else{g=0}}else{f=6425}if((f|0)==6425){g=(c[120490]|0)!=0^1}a=g&1;if((a|0)!=0){h=(c[96246]|0)!=(c[38574]|0)|0}else{if((c[120490]|0)!=0){i=0}else{i=(c[156016]&1|0)!=0}h=i&1}b=h;if((c[39006]|0)!=0){pA();j=b}else{if((b|0)!=0){if((c[157604]|0)!=0){k=(c[157608]|0)!=0}else{k=1}l=k}else{l=0}j=l&1;do{if((c[113474]|0)!=0){if((b|0)==0){m=0;break}if((a|0)==0){m=0;break}m=(c[96238]|0)!=(c[38570]|0)}else{m=0}}while(0);c[157608]=m&1}if((j|0)!=0){f=6444}else{if((lQ()|0)==4){f=6444}}if((f|0)==6444){pE()}if((a|0)!=0){t4(442960+((c[142806]|0)*288|0)|0)}if((c[156016]&1|0)!=0){cQ()}if((c[96246]|0)!=(c[38574]|0)){n=1}else{if((c[156016]&1|0)!=0){o=(c[156016]&2|0)!=0^1}else{o=0}n=o}k8(n&1,j);if((lQ()|0)!=4){pE()}fq()}}c[157606]=c[120490];c[157604]=b;b=c[122180]|0;c[20]=b;c[39006]=b;if((c[111054]|0)!=0){b=c[37122]|0;j=(320-(u1(os(94536)|0)|0)|0)/2|0;n=os(94536)|0;cf[b&15](j,4,0,n,6,4)}jO();vB();do{if((e|0)!=0){if((lQ()|0)==4){f=6461;break}ub()|0;hS()}else{f=6461}}while(0);if((f|0)==6461){vZ()}wz();if((c[111054]|0)==0){return}wA(1e3);return}function hR(){var a=0,b=0;if((c[111060]|0)!=0){a=c[37122]|0;b=os(c[111060]|0)|0;cf[a&15](0,0,0,b,6,4);return}else{iA();return}}function hS(){var a=0,b=0,d=0,e=0;a=(b8[c[38842]&15]()|0)-1|0;do{do{b=b8[c[38842]&15]()|0;d=b-a|0;}while((d|0)!=0^1);a=b;e=uc(d)|0;vU();jO();vZ();}while((e|0)!=0^1);return}function hT(){var a=0;c[156254]=0;vS();if((c[140232]|0)==(c[122186]|0)){c[140232]=0}if((c[105232]|0)!=0){vX();c4(444936+((c[144632]|0)*96|0)+(((c[113608]|0)%12|0)<<3)|0);if((c[156112]|0)!=0){hV()}jG();c9();b9[c[38626]&1023](c[122178]|0);c[122178]=(c[122178]|0)+1;c[113608]=(c[113608]|0)+1}else{vC()}if((c[442960+((c[142806]|0)*288|0)>>2]|0)!=0){hM(c[442960+((c[142806]|0)*288|0)>>2]|0)}do{if((lQ()|0)==4){if((c[113400]|0)==0){a=6498;break}if((c[156254]|0)==0){a=6498}}else{if((c[113400]|0)==0){a=6498;break}if((c[156254]|0)==0){a=6498;break}if((c[122180]|0)!=(c[20]|0)){a=6498}}}while(0);if((a|0)==6498){hQ()}if((c[156022]|0)==0){return}a=(c[156024]|0)-1|0;c[156024]=a;if((a|0)!=0){return}c[156024]=c[156020];kV(c[156022]|0);return}function hU(){var a=0;a=(c[111058]|0)-1|0;c[111058]=a;if((a|0)>=0){return}hK();return}function hV(){var a=0,b=0;c[442964+((c[144632]|0)*288|0)>>2]=0;c[111054]=0;c[100354]=0;c[156112]=0;c[122702]=0;c[111058]=385;c[122180]=3;do{if((c[111230]|0)!=0){if((c[142830]|0)!=0){a=6514;break}c[142826]=0}else{a=6514}}while(0);if((a|0)==6514){a=c[14940]|0;b=(c[142826]|0)+1|0;c[142826]=b;if((c[65048+(b<<5)+(a<<3)>>2]|0)==0){c[142826]=0}}b9[c[65048+(c[142826]<<5)+(c[14940]<<3)>>2]&1023](c[65048+(c[142826]<<5)+(c[14940]<<3)+4>>2]|0);return}function hW(){c[122702]=0;c[142826]=-1;hK();return}function hX(b,d){b=b|0;d=d|0;var e=0,f=0;e=b;b=d;d=0;c[44772]=uo(c[44772]|0,((c[111106]|0)+1|0)*12|0,1,0)|0;f=oo(wT(ug((wU(e|0)|0)+5|0,1,0)|0,e|0)|0,90944)|0;c[(c[44772]|0)+((c[111106]|0)*12|0)>>2]=f;c[(c[44772]|0)+((c[111106]|0)*12|0)+4>>2]=b;c[111106]=(c[111106]|0)+1;d=oo(wT(ug((wU(e|0)|0)+5|0,1,0)|0,e|0)|0,90944)|0;if((wU(d|0)|0)>>>0<=4){return}if((wY(d+((wU(d|0)|0)-4)|0,90944)|0)==0){e=d+((wU(d|0)|0)-4)|0;a[e+1|0]=103;a[e+2|0]=119;a[e+3|0]=97;c[44772]=uo(c[44772]|0,((c[111106]|0)+1|0)*12|0,1,0)|0;c[(c[44772]|0)+((c[111106]|0)*12|0)>>2]=d;c[(c[44772]|0)+((c[111106]|0)*12|0)+4>>2]=b;c[111106]=(c[111106]|0)+1}return}function hY(){hZ();h_();return}function hZ(){var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;b=i;i=i+8224|0;d=b|0;e=b+8|0;f=b+16|0;g=b+4120|0;h$();b0(c[o>>2]|0,0);do{h=0;j=0;while(1){if((j|0)>=(c[113380]|0)){break}if((a[c[(c[113378]|0)+(j<<2)>>2]|0]|0)==64){h=1}j=j+1|0}h0();}while((h|0)==1);eI(1,139832,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;kU();if((fw(138904)|0)!=0){c[122770]=1}h1();h2();k=fw(137904)|0;c[144738]=k;c[111212]=k;k=fw(137128)|0;c[144736]=k;c[110692]=k;k=fw(136176)|0;c[144742]=k;c[140236]=k;c[142812]=fw(135112)|0;if((fw(134112)|0)!=0){c[144588]=2}else{if((fw(133112)|0)!=0){c[144588]=1}}k=c[14940]|0;if((k|0)==1){l=127368}else if((k|0)==3){l=131904}else if((k|0)==2){m=c[122184]|0;if((m|0)==2){l=121160}else if((m|0)==3){l=123800}else{l=120264}}else if((k|0)==0){l=131080}else{l=119368}eI(64,118272,(j=i,i=i+16|0,c[j>>2]=984,c[j+8>>2]=l,j)|0)|0;i=j;if((c[142812]|0)!=0){eI(2,117288,(j=i,i=i+8|0,c[j>>2]=116168,j)|0)|0;i=j}l=fw(114968)|0;k=l;if((l|0)!=0){l=200;if((k|0)<((c[113380]|0)-1|0)){l=bw(c[(c[113378]|0)+(k+1<<2)>>2]|0)|0}if((l|0)<10){l=10}if((l|0)>400){l=400}m=l;eI(2,114272,(j=i,i=i+8|0,c[j>>2]=m,j)|0)|0;i=j;c[14996]=(ab(c[14996]|0,l)|0)/100|0;c[14997]=(ab(c[14997]|0,l)|0)/100|0;c[8144]=(ab(c[8144]|0,l)|0)/100|0;c[8145]=(ab(c[8145]|0,l)|0)/100|0}c[113434]=0;c[102888]=-1;c[102892]=1;c[102890]=1;c[156012]=0;l=fw(113640)|0;k=l;do{if((l|0)!=0){if((k|0)>=((c[113380]|0)-1|0)){break}c[102888]=(a[c[(c[113378]|0)+(k+1<<2)>>2]|0]|0)-49;c[156012]=1}}while(0);l=fw(112968)|0;k=l;do{if((l|0)!=0){if((k|0)>=((c[113380]|0)-1|0)){break}c[102892]=(a[c[(c[113378]|0)+(k+1<<2)>>2]|0]|0)-48;c[102890]=1;c[156012]=1}}while(0);l=fw(112392)|0;k=l;do{if((l|0)!=0){if((k|0)>=((c[113380]|0)-1|0)){break}if((c[144588]|0)==0){break}m=bw(c[(c[113378]|0)+(k+1<<2)>>2]|0)|0;n=m;p=(m|0)>1?111160:624536;eI(2,111752,(j=i,i=i+16|0,c[j>>2]=n,c[j+8>>2]=p,j)|0)|0;i=j}}while(0);l=fw(110672)|0;k=l;do{if((l|0)!=0){if((k|0)>=((c[113380]|0)-1|0)){break}if((c[144588]|0)==0){break}eI(2,110048,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j}}while(0);l=fw(109544)|0;k=l;if((l|0)!=0){q=6579}else{l=fw(108672)|0;k=l;if((l|0)!=0){q=6579}}if((q|0)==6579){c[102890]=0;c[156012]=1;if((c[14940]|0)==2){if((k|0)<((c[113380]|0)-1|0)){c[102890]=bw(c[(c[113378]|0)+(k+1<<2)>>2]|0)|0}}else{if((k|0)<((c[113380]|0)-2|0)){l=k+1|0;k=l;c[102892]=bw(c[(c[113378]|0)+(l<<2)>>2]|0)|0;c[102890]=bw(c[(c[113378]|0)+(k+1<<2)>>2]|0)|0}}}l=fw(108232)|0;if((l|0)!=0){r=1}else{r=(fw(107656)|0)!=0}c[111210]=r&1;if((l|0)!=0){s=1}else{s=(fw(107176)|0)!=0}c[111208]=s&1;c[111216]=fw(106872)|0;c[111222]=fw(106512)|0;k=fw(106112)|0;if((k|0)!=0){c[100346]=bw(c[(c[113378]|0)+(k+1<<2)>>2]|0)|0;if((c[100346]|0)<0){t=0}else{if((c[100346]|0)>7){u=7}else{u=c[100346]|0}t=u}c[100346]=t;c[100346]=ab(8-(c[100346]|0)|0,536870912)|0}dG();t=fw(105768)|0;k=t;if((t|0)!=0){if((c[(c[113378]|0)+(k+1<<2)>>2]|0)!=0){c[142818]=bw(c[(c[113378]|0)+(k+1<<2)>>2]|0)|0}}t=fw(105384)|0;k=t;if((t|0)!=0){if((c[(c[113378]|0)+(k+1<<2)>>2]|0)!=0){c[142820]=bw(c[(c[113378]|0)+(k+1<<2)>>2]|0)|0}}t=fw(104984)|0;k=t;if((t|0)!=0){c[100362]=1}t=fw(104384)|0;k=t;if((t|0)!=0){c[100362]=0}c[142822]=c[100362];t=fw(104e3)|0;k=t;if((t|0)!=0){c[142822]=0}t=fw(103648)|0;k=t;if((t|0)!=0){c[142822]=1}t=fw(103368)|0;k=t;if((t|0)==0){k=fw(103104)|0}do{if((k|0)!=0){if((k+1|0)>=(c[113380]|0)){q=6620;break}t=bL(c[(c[113378]|0)+(k+1<<2)>>2]|0,102880,(j=i,i=i+16|0,c[j>>2]=d,c[j+8>>2]=e,j)|0)|0;i=j;if((t|0)!=2){q=6620}}else{q=6620}}while(0);if((q|0)==6620){c[d>>2]=c[142818];c[e>>2]=c[142820]}v1(c[d>>2]|0,c[e>>2]|0);eI(1,102648,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;lJ();if((fw(102376)|0)==0){e=0;while(1){if((e|0)>=6){break}if((e|0)<3){v=c[179096+(e<<2)>>2]|0}else{v=c[572704+(e-3<<2)>>2]|0}d=v;do{if((d|0)!=0){if((a[d]|0)==0){q=6629;break}t=wL(d,(e|0)<3?90944:102088)|0;if((t|0)!=0){if((e|0)>=3){eU(t,h3()|0,0)}else{hX(t,2)}c[113434]=1;ul(t)}else{t=d;eI(4,101592,(j=i,i=i+8|0,c[j>>2]=t,j)|0)|0;i=j}}else{q=6629}}while(0);if((q|0)==6629){q=0}e=e+1|0}}eT();k=fw(101040)|0;if((k|0)!=0){while(1){e=k+1|0;k=e;if((e|0)!=(c[113380]|0)){w=(a[c[(c[113378]|0)+(k<<2)>>2]|0]|0)!=45}else{w=0}if(!w){break}oo(wT(f|0,c[(c[113378]|0)+(k<<2)>>2]|0)|0,102088)|0;if((a2(f|0,0)|0)!=0){e=wT(f|0,c[(c[113378]|0)+(k<<2)>>2]|0)|0;oo(e,100800)|0;if((a2(f|0,0)|0)!=0){eJ(100360,(j=i,i=i+8|0,c[j>>2]=c[(c[113378]|0)+(k<<2)>>2],j)|0);i=j}}eU(f|0,h3()|0,0)}}f=fw(99944)|0;k=f;if((f|0)!=0){c[113434]=1;while(1){f=k+1|0;k=f;if((f|0)!=(c[113380]|0)){x=(a[c[(c[113378]|0)+(k<<2)>>2]|0]|0)!=45}else{x=0}if(!x){break}hX(c[(c[113378]|0)+(k<<2)>>2]|0,3)}}x=fw(99536)|0;k=x;if((x|0)!=0){if((k|0)>=((c[113380]|0)-1|0)){q=6659}}else{q=6659}if((q|0)==6659){x=fw(99280)|0;k=x;do{if((x|0)!=0){if((k|0)>=((c[113380]|0)-1|0)){q=6662;break}c[140238]=1}else{q=6662}}while(0);if((q|0)==6662){k=fw(98968)|0}}do{if((k|0)!=0){if((k|0)>=((c[113380]|0)-1|0)){break}x=g|0;f=c[(c[113378]|0)+(k+1<<2)>>2]|0;wT(x|0,f|0)|0;f=g|0;oo(f,98648)|0;hX(g|0,4);f=g|0;eI(2,98240,(j=i,i=i+8|0,c[j>>2]=f,j)|0)|0;i=j;f=fw(97920)|0;k=f;do{if((f|0)!=0){if((k|0)>=((c[113380]|0)-1|0)){break}c[140232]=bw(c[(c[113378]|0)+(k+1<<2)>>2]|0)|0}}while(0)}}while(0);c[122172]=c[144526];eI(1,97408,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;vA();eI(1,97128,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;ot();eI(1,96888,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;if((fw(96536)|0)==0){g=oq(95984,0)|0;k=g;if((g|0)!=-1){eU(0,h3()|0,k)}}lP();if((a[c[7966]|0]|0)!=0){g=c[7966]|0;eI(1,117288,(j=i,i=i+8|0,c[j>>2]=g,j)|0)|0;i=j}if((a[c[7964]|0]|0)!=0){g=c[7964]|0;eI(1,117288,(j=i,i=i+8|0,c[j>>2]=g,j)|0)|0;i=j}if((a[c[7962]|0]|0)!=0){g=c[7962]|0;eI(1,117288,(j=i,i=i+8|0,c[j>>2]=g,j)|0)|0;i=j}if((a[c[7960]|0]|0)!=0){g=c[7960]|0;eI(1,117288,(j=i,i=i+8|0,c[j>>2]=g,j)|0)|0;i=j}if((a[c[7958]|0]|0)!=0){g=c[7958]|0;eI(1,117288,(j=i,i=i+8|0,c[j>>2]=g,j)|0)|0;i=j}eI(1,95536,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;jQ();eI(1,95176,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;t1();eI(1,94664,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;ho();eI(1,94216,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;vK();eI(1,93896,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;hw(c[8134]|0,c[8136]|0);eI(1,93120,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;fm();if((fw(106872)|0)!=0){if((fw(108232)|0)==0){q=6686}}else{q=6686}if((q|0)==6686){v4()}eI(1,92784,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j;lg();c[120494]=-1;j=fw(92416)|0;k=j;do{if((j|0)!=0){if((k|0)>=((c[113380]|0)-2|0)){break}g=bw(c[(c[113378]|0)+(k+1<<2)>>2]|0)|0;c[156020]=g;c[156024]=g;if((g|0)!=0){c[156022]=c[(c[113378]|0)+(k+2<<2)>>2]}}}while(0);j=fw(92136)|0;g=j;do{if((j|0)!=0){f=g+2|0;k=f;if((f|0)>=(c[113380]|0)){q=6695;break}dJ(c[(c[113378]|0)+(k<<2)>>2]|0)}else{q=6695}}while(0);if((q|0)==6695){g=fw(91928)|0;j=fw(91704)|0;k=j;do{if((j|0)!=0){f=k+1|0;k=f;if((f|0)>=(c[113380]|0)){break}c[156012]=1;dJ(c[(c[113378]|0)+(k<<2)>>2]|0)}}while(0)}j=fw(91456)|0;k=j;do{if((j|0)!=0){f=k+1|0;k=f;if((f|0)>=(c[113380]|0)){break}uY(c[(c[113378]|0)+(k<<2)>>2]|0)}}while(0);j=fw(99280)|0;k=j;do{if((j|0)!=0){f=k+1|0;k=f;if((f|0)>=(c[113380]|0)){q=6705;break}c[140238]=1;c[100418]=1;dM(c[(c[113378]|0)+(k<<2)>>2]|0);c[105234]=1}else{q=6705}}while(0);if((q|0)==6705){j=fw(98968)|0;k=j;do{if((j|0)!=0){f=k+1|0;k=f;if((f|0)>=(c[113380]|0)){q=6708;break}c[105232]=1;c[100418]=1;dM(c[(c[113378]|0)+(k<<2)>>2]|0);c[105234]=1}else{q=6708}}while(0);if((q|0)==6708){j=fw(99536)|0;k=j;do{if((j|0)!=0){f=k+1|0;k=f;if((f|0)>=(c[113380]|0)){break}dM(c[(c[113378]|0)+(k<<2)>>2]|0);c[105234]=1}}while(0)}}do{if((g|0)!=0){k=g+1|0;g=k;if((k|0)>=(c[113380]|0)){break}g=bw(c[(c[113378]|0)+(g<<2)>>2]|0)|0;dv(g,1);i=b;return}}while(0);if((c[105234]|0)==0){do{if((c[156012]|0)!=0){q=6719}else{if((c[111230]|0)!=0){q=6719;break}hW()}}while(0);if((q|0)==6719){dC(c[102888]|0,c[102892]|0,c[102890]|0);if((c[142828]|0)!=0){dD()}}}i=b;return}function h_(){b_(58,0,1);return}function h$(){var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0;b=i;d=146088;e=fw(145840)|0;f=e;if((e|0)!=0){eI(32,145728,(g=i,i=i+1|0,i=i+7>>3<<3,c[g>>2]=0,g)|0)|0;i=g;e=f+1|0;f=e;do{if((e|0)!=(c[113380]|0)){if((a[c[(c[113378]|0)+(f<<2)>>2]|0]|0)==45){break}h=0;c[20992]=0;while(1){if(h>>>0>=(wU(c[(c[113378]|0)+(f<<2)>>2]|0)|0)>>>0){break}j=a$(d|0,bg(a[(c[(c[113378]|0)+(f<<2)>>2]|0)+h|0]|0)|0)|0;k=j;if((j|0)!=0){c[20992]=c[20992]|1<<k-d;j=bg(a[(c[(c[113378]|0)+(f<<2)>>2]|0)+h|0]|0)|0;eI(32,145640,(g=i,i=i+8|0,c[g>>2]=j,g)|0)|0;i=g}h=h+1|0}}}while(0);eI(32,96888,(g=i,i=i+1|0,i=i+7>>3<<3,c[g>>2]=0,g)|0)|0;i=g}e=fw(145560)|0;f=e;if((e|0)==0){i=b;return}eI(32,145440,(g=i,i=i+1|0,i=i+7>>3<<3,c[g>>2]=0,g)|0)|0;i=g;e=f+1|0;f=e;do{if((e|0)!=(c[113380]|0)){if((a[c[(c[113378]|0)+(f<<2)>>2]|0]|0)==45){break}h=0;c[20994]=0;while(1){if(h>>>0>=(wU(c[(c[113378]|0)+(f<<2)>>2]|0)|0)>>>0){break}j=a$(d|0,bg(a[(c[(c[113378]|0)+(f<<2)>>2]|0)+h|0]|0)|0)|0;k=j;if((j|0)!=0){c[20994]=c[20994]|1<<k-d;j=bg(a[(c[(c[113378]|0)+(f<<2)>>2]|0)+h|0]|0)|0;eI(32,145640,(g=i,i=i+8|0,c[g>>2]=j,g)|0)|0;i=g}h=h+1|0}}}while(0);eI(32,96888,(g=i,i=i+1|0,i=i+7>>3<<3,c[g>>2]=0,g)|0)|0;i=g;i=b;return}function h0(){var b=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;b=i;i=i+4112|0;e=b|0;f=b+8|0;g=1;while(1){if((g|0)>=(c[113380]|0)){h=6800;break}if((a[c[(c[113378]|0)+(g<<2)>>2]|0]|0)==64){break}g=g+1|0}if((h|0)==6800){i=b;return}c[e>>2]=0;j=ug(c[113380]<<2,1,0)|0;wT(f|0,(c[(c[113378]|0)+(g<<2)>>2]|0)+1|0)|0;oo(f|0,147288)|0;k=kR(f|0,e)|0;if((k|0)<0){l=wT(f|0,wJ()|0)|0;m=(c[(c[113378]|0)+(g<<2)>>2]|0)+1|0;wV(l|0,m|0)|0;m=f|0;oo(m,147288)|0;k=kR(f|0,e)|0}if((k|0)<0){eJ(147184,(n=i,i=i+8|0,c[n>>2]=f,n)|0);i=n}eI(2,147080,(n=i,i=i+8|0,c[n>>2]=f,n)|0)|0;i=n;if((k|0)<=0){eI(8,146984,(n=i,i=i+1|0,i=i+7>>3<<3,c[n>>2]=0,n)|0)|0;i=n;o=up(4,100,1,0)|0;c[o>>2]=c[c[113378]>>2];f=1;p=1;while(1){if((f|0)>=(c[113380]|0)){break}if((g|0)!=(f|0)){m=p;p=m+1|0;c[o+(m<<2)>>2]=c[(c[113378]|0)+(f<<2)>>2]}f=f+1|0}c[113380]=p;c[113378]=o;i=b;return}f=j;m=(c[113378]|0)+(g+1<<2)|0;l=(c[113380]|0)-g-1|0;p=l;g=l<<2;wQ(f|0,m|0,g)|0;g=c[c[113378]>>2]|0;o=up(4,100,1,0)|0;c[o>>2]=g;g=c[e>>2]|0;m=0;m=m+1|0;do{while(1){if((k|0)>0){q=(aE(d[g]|0)|0)!=0}else{q=0}if(!q){break}g=g+1|0;k=k-1|0}if((k|0)>0){f=ug(k+1|0,1,0)|0;l=f;r=0;while(1){if((k|0)<=0){break}if((r|0)==0){if((aE(d[g]|0)|0)!=0){h=6780;break}}if((d[g]|0)==34){g=g+1|0;k=k-1|0;r=r^1}else{s=g;g=s+1|0;t=l;l=t+1|0;a[t]=a[s]|0;k=k-1|0}}if((h|0)==6780){h=0}if((r|0)!=0){eJ(146776,(n=i,i=i+1|0,i=i+7>>3<<3,c[n>>2]=0,n)|0);i=n}a[l]=0;s=m;m=s+1|0;c[o+(s<<2)>>2]=uo(f,(wU(f|0)|0)+1|0,1,0)|0}}while((k|0)>0);ul(c[e>>2]|0);e=o+(m<<2)|0;k=j;h=p<<2;wQ(e|0,k|0,h)|0;ul(j);c[113380]=m+p;c[113378]=o;eI(2,146448,(n=i,i=i+8|0,c[n>>2]=c[113380],n)|0)|0;i=n;p=1;while(1){if((p|0)>=(c[113380]|0)){break}eI(2,146280,(n=i,i=i+8|0,c[n>>2]=c[(c[113378]|0)+(p<<2)>>2],n)|0)|0;i=n;p=p+1|0}i=b;return}function h1(){var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=i;i=i+1600|0;d=b|0;e=b+400|0;f=b+800|0;g=b+1200|0;h=0;j=0;k=0;l=0;while(1){if((l|0)>=100){break}c[g+(l<<2)>>2]=0;l=l+1|0}l=1;while(1){if((l|0)>=(c[113380]|0)){break}if((a[c[(c[113378]|0)+(l<<2)>>2]|0]|0)==45){m=6808;break}m=wU(c[(c[113378]|0)+(l<<2)>>2]|0)|0;if((wY((c[(c[113378]|0)+(l<<2)>>2]|0)+(m-4)|0,90944)|0)==0){n=h;h=n+1|0;c[d+(n<<2)>>2]=uq(c[(c[113378]|0)+(l<<2)>>2]|0,1,0)|0}if((wY((c[(c[113378]|0)+(l<<2)>>2]|0)+(m-4)|0,98648)|0)==0){n=j;j=n+1|0;c[e+(n<<2)>>2]=uq(c[(c[113378]|0)+(l<<2)>>2]|0,1,0)|0}if((wY((c[(c[113378]|0)+(l<<2)>>2]|0)+(m-4)|0,100800)|0)==0){n=k;k=n+1|0;c[f+(n<<2)>>2]=uq(c[(c[113378]|0)+(l<<2)>>2]|0,1,0)|0}if((wY((c[(c[113378]|0)+(l<<2)>>2]|0)+(m-4)|0,102088)|0)==0){n=k;k=n+1|0;c[f+(n<<2)>>2]=uq(c[(c[113378]|0)+(l<<2)>>2]|0,1,0)|0}if((a[(c[(c[113378]|0)+(l<<2)>>2]|0)+(m-4)|0]|0)!=46){m=h;h=m+1|0;c[d+(m<<2)>>2]=uq(c[(c[113378]|0)+(l<<2)>>2]|0,1,0)|0}c[g+(l<<2)>>2]=1;l=l+1|0}if((h+j+k|0)==0){i=b;return}m=fw(99944)|0;n=m;if((m|0)!=0){c[g+(n<<2)>>2]=1;while(1){m=n+1|0;n=m;if((m|0)!=(c[113380]|0)){o=(a[c[(c[113378]|0)+(n<<2)>>2]|0]|0)!=45}else{o=0}if(!o){break}m=h;h=m+1|0;c[d+(m<<2)>>2]=uq(c[(c[113378]|0)+(n<<2)>>2]|0,1,0)|0;c[g+(n<<2)>>2]=1}}o=fw(101040)|0;n=o;if((o|0)!=0){c[g+(n<<2)>>2]=1;while(1){o=n+1|0;n=o;if((o|0)!=(c[113380]|0)){p=(a[c[(c[113378]|0)+(n<<2)>>2]|0]|0)!=45}else{p=0}if(!p){break}o=k;k=o+1|0;c[f+(o<<2)>>2]=uq(c[(c[113378]|0)+(n<<2)>>2]|0,1,0)|0;c[g+(n<<2)>>2]=1}}p=fw(99536)|0;n=p;if((p|0)!=0){c[g+(n<<2)>>2]=1;while(1){p=n+1|0;n=p;if((p|0)!=(c[113380]|0)){q=(a[c[(c[113378]|0)+(n<<2)>>2]|0]|0)!=45}else{q=0}if(!q){break}p=j;j=p+1|0;c[e+(p<<2)>>2]=uq(c[(c[113378]|0)+(n<<2)>>2]|0,1,0)|0;c[g+(n<<2)>>2]=1}}n=up(4,100,1,0)|0;c[n>>2]=c[c[113378]>>2];q=1;if((h|0)>0){p=q;q=p+1|0;c[n+(p<<2)>>2]=uq(99944,1,0)|0;l=0;while(1){if((l|0)>=(h|0)){break}p=l;l=p+1|0;o=q;q=o+1|0;c[n+(o<<2)>>2]=c[d+(p<<2)>>2]}}if((k|0)>0){d=q;q=d+1|0;c[n+(d<<2)>>2]=uq(101040,1,0)|0;l=0;while(1){if((l|0)>=(k|0)){break}d=l;l=d+1|0;h=q;q=h+1|0;c[n+(h<<2)>>2]=c[f+(d<<2)>>2]}}if((j|0)>0){f=q;q=f+1|0;c[n+(f<<2)>>2]=uq(99536,1,0)|0;l=0;while(1){if((l|0)>=(j|0)){break}f=l;l=f+1|0;k=q;q=k+1|0;c[n+(k<<2)>>2]=c[e+(f<<2)>>2]}}l=1;while(1){if((l|0)>=(c[113380]|0)){break}if((c[g+(l<<2)>>2]|0)==0){e=q;q=e+1|0;c[n+(e<<2)>>2]=c[(c[113378]|0)+(l<<2)>>2]}l=l+1|0}c[113378]=n;c[113380]=q;i=b;return}function h2(){var b=0,d=0,e=0,f=0,g=0,h=0,j=0;b=i;i=i+72|0;d=b|0;e=bv(90536)|0;if((e|0)!=0){if((wU(e|0)|0)>>>0>4084){e=0}}if((e|0)==0){f=wJ()|0}else{f=e}wT(619928,f|0)|0;f=fw(90192)|0;e=f;do{if((f|0)!=0){if((e|0)>=((c[113380]|0)-1|0)){break}do{if((bY(c[(c[113378]|0)+(e+1<<2)>>2]|0,d|0)|0)!=0){g=6881}else{if((c[d+8>>2]&61440|0)!=16384){g=6881;break}h=c[(c[113378]|0)+(e+1<<2)>>2]|0;wT(619928,h|0)|0;h4(619928)}}while(0);if((g|0)==6881){eI(8,90056,(j=i,i=i+8|0,c[j>>2]=619928,j)|0)|0;i=j}}}while(0);d=h5()|0;do{if((d|0)!=0){if((a[d]|0)==0){break}f=d;eI(2,89928,(j=i,i=i+8|0,c[j>>2]=f,j)|0)|0;i=j;h7(d,59760,488672);f=c[14940]|0;if((f|0)==3|(f|0)==1|(f|0)==0){c[122184]=0}else if((f|0)==2){e=wU(d|0)|0;c[122184]=1;do{if((e|0)>=10){if((wX(d+e-10|0,143688,10)|0)!=0){g=6890;break}c[113680]=1}else{g=6890}}while(0);if((g|0)==6890){do{if((e|0)>=7){if((wX(d+e-7|0,118048,7)|0)!=0){g=6893;break}c[122184]=2}else{g=6893}}while(0);if((g|0)==6893){do{if((e|0)>=12){if((wX(d+e-12|0,134904,12)|0)!=0){break}c[122184]=3}}while(0)}}}else{c[122184]=4}if((c[14940]|0)==4){eI(4,89800,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0)|0;i=j}hX(d,0);ul(d);i=b;return}}while(0);eJ(89688,(j=i,i=i+1|0,i=i+7>>3<<3,c[j>>2]=0,j)|0);i=j;i=b;return}function h3(){var a=0,b=0,d=0;a=fw(91096)|0;if((a|0)==0){a=fw(90760)|0}do{if((a|0)!=0){b=a+1|0;a=b;if((b|0)>=(c[113380]|0)){break}d=c[(c[113378]|0)+(a<<2)>>2]|0;return d|0}}while(0);d=0;return d|0}function h4(b){b=b|0;var c=0,d=0,e=0;c=b;do{if((c|0)!=0){b=wU(c|0)|0;d=b;if((b|0)==0){break}b=d-1|0;d=b;if((a[c+b|0]|0)==47){e=6921}else{if((a[c+d|0]|0)==92){e=6921}}if((e|0)==6921){a[c+d|0]=0}while(1){b=d;d=b-1|0;if((b|0)==0){break}if((a[c+d|0]|0)==92){a[c+d|0]=47}}return}}while(0);return}function h5(){var a=0,b=0,d=0,e=0,f=0;a=0;b=fw(147368)|0;do{if((b|0)!=0){d=b+1|0;b=d;if((d|0)>=(c[113380]|0)){break}a=wL(c[(c[113378]|0)+(b<<2)>>2]|0,90944)|0;e=a;return e|0}}while(0);b=0;while(1){if((a|0)!=0){f=0}else{f=(b|0)<8}if(!f){break}a=wL(c[31880+(b<<2)>>2]|0,90944)|0;b=b+1|0}e=a;return e|0}function h6(a){a=a|0;c[111060]=a;return}function h7(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;f=i;i=i+16|0;g=f|0;h=b;b=d;d=e;if((a2(h|0,4)|0)!=0){eJ(147448,(j=i,i=i+8|0,c[j>>2]=h,j)|0);i=j;i=f;return}e=0;k=0;l=0;m=0;n=0;o=bk(h|0,89608)|0;p=o;if((o|0)!=0){do{if((bN(g|0,12,1,p|0)|0)==1){if((aQ(g|0,148288,4)|0)!=0){q=6982;break}c[g+4>>2]=c[g+4>>2];c[g+8>>2]=c[g+8>>2];o=c[g+4>>2]|0;r=ug(o<<4,1,0)|0;do{if((bV(p|0,c[g+8>>2]|0,0)|0)!=0){q=6951}else{if((bN(r|0,16,o|0,p|0)|0)!=(o|0)){q=6951;break}if((at(p|0)|0)!=0){q=6951}}}while(0);if((q|0)==6951){eJ(148120,(j=i,i=i+8|0,c[j>>2]=h,j)|0);i=j}while(1){s=o;o=s-1|0;if((s|0)==0){break}do{if((a[r+(o<<4)+8|0]|0)==69){if((a[r+(o<<4)+10|0]|0)!=77){q=6969;break}if((a[r+(o<<4)+12|0]|0)!=0){q=6969;break}if((a[r+(o<<4)+9|0]|0)==52){e=e+1|0}else{if((a[r+(o<<4)+9|0]|0)==51){k=k+1|0}else{if((a[r+(o<<4)+9|0]|0)==50){k=k+1|0}else{if((a[r+(o<<4)+9|0]|0)==49){l=l+1|0}}}}}else{q=6969}}while(0);if((q|0)==6969){q=0;do{if((a[r+(o<<4)+8|0]|0)==77){if((a[r+(o<<4)+9|0]|0)!=65){break}if((a[r+(o<<4)+10|0]|0)!=80){break}if((a[r+(o<<4)+13|0]|0)!=0){break}m=m+1|0;if((a[r+(o<<4)+11|0]|0)==51){if((a[r+(o<<4)+12|0]|0)==49){q=6976}else{if((a[r+(o<<4)+12|0]|0)==50){q=6976}}if((q|0)==6976){q=0;n=n+1|0}}}}while(0)}}ul(r)}else{q=6982}}while(0);if((q|0)==6982){eJ(147920,(j=i,i=i+8|0,c[j>>2]=h,j)|0);i=j}}else{eJ(147760,(j=i,i=i+8|0,c[j>>2]=h,j)|0);i=j}c[b>>2]=4;c[d>>2]=0;if((m|0)>=30){c[b>>2]=2;c[d>>2]=(n|0)>=2}else{if((e|0)>=9){c[b>>2]=3}else{if((k|0)>=18){c[b>>2]=1}else{if((l|0)>=9){c[b>>2]=0}}}}i=f;return}function h8(a){a=a|0;hN(29);c[111058]=170;h6(a);return}function h9(a){a=a|0;hN(66);h6(a);return}function ia(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=a;a=b;b=c[c[e+64>>2]>>2]|0;f=c[c[a+64>>2]>>2]|0;g=ab((b-(c[108410]|0)|0)/196|0,c[111126]|0)|0;h=g+((f-(c[108410]|0)|0)/196|0)|0;if(((d[(c[110706]|0)+(h>>3)|0]|0)&1<<(h&7)|0)!=0){i=0;j=i;return j|0}do{if((c[b+128>>2]|0)!=-1){if(((c[e+32>>2]|0)+(c[e+84>>2]|0)|0)<=(c[(c[108410]|0)+((c[b+128>>2]|0)*196|0)+12>>2]|0)){if((c[a+32>>2]|0)>=(c[(c[108410]|0)+((c[b+128>>2]|0)*196|0)+12>>2]|0)){break}}if((c[e+32>>2]|0)<(c[(c[108410]|0)+((c[b+128>>2]|0)*196|0)+16>>2]|0)){k=7010;break}if(((c[a+32>>2]|0)+(c[e+84>>2]|0)|0)>(c[(c[108410]|0)+((c[b+128>>2]|0)*196|0)+16>>2]|0)){k=7010}}else{k=7010}}while(0);L9104:do{if((k|0)==7010){do{if((c[f+128>>2]|0)!=-1){if(((c[a+32>>2]|0)+(c[a+84>>2]|0)|0)<=(c[(c[108410]|0)+((c[f+128>>2]|0)*196|0)+12>>2]|0)){if((c[e+32>>2]|0)>=(c[(c[108410]|0)+((c[f+128>>2]|0)*196|0)+12>>2]|0)){break L9104}}if((c[a+32>>2]|0)<(c[(c[108410]|0)+((c[f+128>>2]|0)*196|0)+16>>2]|0)){break}if(((c[e+32>>2]|0)+(c[a+84>>2]|0)|0)<=(c[(c[108410]|0)+((c[f+128>>2]|0)*196|0)+16>>2]|0)){break L9104}}}while(0);do{if((c[e+64>>2]|0)==(c[a+64>>2]|0)){if((c[144658]|0)>>>0<11){break}i=1;j=i;return j|0}}while(0);c[252]=(c[252]|0)+1;b=c[a+32>>2]|0;h=(c[e+32>>2]|0)+(c[e+84>>2]|0)-(c[e+84>>2]>>2)|0;c[113634]=h;g=b-h|0;c[113642]=g;c[113641]=g+(c[a+84>>2]|0);g=c[a+24>>2]|0;c[113635]=g;h=c[e+24>>2]|0;c[113637]=h;c[113639]=g-h;h=c[a+28>>2]|0;c[113636]=h;g=c[e+28>>2]|0;c[113638]=g;c[113640]=h-g;if((c[e+24>>2]|0)>(c[a+24>>2]|0)){c[113646]=c[e+24>>2];c[113645]=c[a+24>>2]}else{c[113646]=c[a+24>>2];c[113645]=c[e+24>>2]}if((c[e+28>>2]|0)>(c[a+28>>2]|0)){c[113643]=c[e+28>>2];c[113644]=c[a+28>>2]}else{c[113643]=c[a+28>>2];c[113644]=c[e+28>>2]}if((c[144658]|0)==10){if((c[113634]|0)<(c[a+32>>2]|0)){c[113647]=(c[a+32>>2]|0)+(c[a+84>>2]|0);c[113648]=c[113634]}else{if((c[113634]|0)>((c[a+32>>2]|0)+(c[a+84>>2]|0)|0)){c[113647]=c[113634];c[113648]=c[a+32>>2]}else{c[113647]=(c[a+32>>2]|0)+(c[a+84>>2]|0);c[113648]=c[a+32>>2]}}}else{c[113647]=2147483647;c[113648]=-2147483648}i=ib((c[111128]|0)-1|0)|0;j=i;return j|0}}while(0);i=0;j=i;return j|0}function ib(a){a=a|0;var b=0,d=0,e=0;b=a;if((c[144658]|0)==10){d=ic(b)|0;e=d;return e|0}else{d=ih(b)|0;e=d;return e|0}return 0}function ic(a){a=a|0;var b=0,d=0,f=0,g=0,h=0,i=0;b=a;while(1){if(!((b&32768|0)!=0^1)){break}a=(c[111220]|0)+(b*52|0)|0;d=tV(c[113637]|0,c[113638]|0,a)|0;if((d|0)==(tV(c[113635]|0,c[113636]|0,a)|0)){b=e[a+48+(d<<1)>>1]|0}else{if((ic(e[a+48+(d<<1)>>1]|0)|0)==0){f=7051;break}b=e[a+48+((d^1)<<1)>>1]|0}}if((f|0)==7051){g=0;h=g;return h|0}if((b|0)==-1){i=0}else{i=b&-32769}g=ii(i)|0;h=g;return h|0}function id(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0;c=a;a=b;b=c;d=b>>31;e=a;f=e>>31;if(((b^d)-d|0)>>>14>>>0>=((e^f)-f|0)>>>0){g=(c^a)>>31^2147483647;return g|0}else{f=c;c=f;e=a;a=w7(c<<16|0>>>16,((f|0)<0?-1:0)<<16|c>>>16,e,(e|0)<0?-1:0)|0;g=a;return g|0}return 0}function ie(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=a;a=b;b=d;if((c[b+8>>2]|0)==0){if((e|0)==(c[b>>2]|0)){f=2}else{if((e|0)<=(c[b>>2]|0)){g=(c[b+12>>2]|0)>0|0}else{g=(c[b+12>>2]|0)<0|0}f=g}h=f;return h|0}if((c[b+12>>2]|0)!=0){f=ab(a-(c[b+4>>2]|0)>>16,c[b+8>>2]>>16)|0;g=ab(e-(c[b>>2]|0)>>16,c[b+12>>2]>>16)|0;if((f|0)<(g|0)){i=0}else{i=(f|0)==(g|0)?2:1}j=i}else{if((c[144658]|0)>>>0<15){k=e}else{k=a}if((k|0)==(c[b+4>>2]|0)){l=2}else{if((a|0)<=(c[b+4>>2]|0)){m=(c[b+8>>2]|0)<0|0}else{m=(c[b+8>>2]|0)>0|0}l=m}j=l}h=j;return h|0}function ig(a){a=a|0;c[144622]=a;b[228664]=b[(c[144622]|0)+20>>1]|0;return}function ih(a){a=a|0;var b=0,d=0,f=0,g=0,h=0,i=0;b=a;while(1){if(!((b&32768|0)!=0^1)){break}a=(c[111220]|0)+(b*52|0)|0;d=(ie(c[113637]|0,c[113638]|0,a)|0)&1;if((d|0)==(ie(c[113635]|0,c[113636]|0,a)|0)){b=e[a+48+(d<<1)>>1]|0}else{if((ih(e[a+48+(d<<1)>>1]|0)|0)==0){f=7101;break}b=e[a+48+((d^1)<<1)>>1]|0}}if((f|0)==7101){g=0;h=g;return h|0}if((b|0)==-1){i=0}else{i=b&-32769}g=ii(i)|0;h=g;return h|0}function ii(a){a=a|0;var d=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;d=i;i=i+16|0;f=d|0;g=a;a=(c[108408]|0)+((e[(c[102612]|0)+(g<<3)+6>>1]|0)*44|0)|0;h=0;j=0;k=0;l=0;m=e[(c[102612]|0)+(g<<3)+4>>1]|0;L9227:while(1){g=m-1|0;m=g;if((g|0)<0){n=7164;break}g=c[a+20>>2]|0;L9230:do{if((g|0)!=0){if((c[g+60>>2]|0)==(c[252]|0)){break}c[g+60>>2]=c[252];L9235:do{if((c[144658]|0)>>>0>=7){do{if((c[g+40>>2]|0)<=(c[113646]|0)){if((c[g+44>>2]|0)<(c[113645]|0)){break}if((c[g+36>>2]|0)>(c[113643]|0)){break}if((c[g+32>>2]|0)<(c[113644]|0)){break}break L9235}}while(0);break L9230}}while(0);if((b[g+20>>1]&4|0)!=0){o=c[a+36>>2]|0;k=o;p=c[a+40>>2]|0;l=p;do{if((c[o+12>>2]|0)==(c[p+12>>2]|0)){if((c[k+16>>2]|0)!=(c[l+16>>2]|0)){break}break L9230}}while(0);if((c[k+16>>2]|0)<(c[l+16>>2]|0)){q=c[k+16>>2]|0}else{q=c[l+16>>2]|0}h=q;if((c[k+12>>2]|0)>(c[l+12>>2]|0)){r=c[k+12>>2]|0}else{r=c[l+12>>2]|0}j=r;do{if((h|0)>=(c[113647]|0)){if((j|0)>(c[113648]|0)){break}break L9230}}while(0)}p=c[g+4>>2]|0;o=c[g+8>>2]|0;s=ie(c[p>>2]|0,c[p+4>>2]|0,454548)|0;if((s|0)==(ie(c[o>>2]|0,c[o+4>>2]|0,454548)|0)){break}s=c[o>>2]|0;t=c[p>>2]|0;c[f>>2]=t;c[f+8>>2]=s-t;t=c[o+4>>2]|0;o=c[p+4>>2]|0;c[f+4>>2]=o;c[f+12>>2]=t-o;o=ie(c[113637]|0,c[113638]|0,f)|0;if((o|0)==(ie(c[113635]|0,c[113636]|0,f)|0)){break}if((b[g+20>>1]&4|0)==0){n=7147;break L9227}if((j|0)>=(h|0)){n=7147;break L9227}if((h|0)<(c[113648]|0)){n=7147;break L9227}if((j|0)>(c[113647]|0)){n=7147;break L9227}do{if((c[144658]|0)==16){n=7150}else{if((c[144658]|0)==17){n=7150;break}u=ux(454548,f)|0}}while(0);if((n|0)==7150){n=0;u=ut(454548,f)|0}o=u;if((c[k+12>>2]|0)!=(c[l+12>>2]|0)){t=id(j-(c[113634]|0)|0,o)|0;if((t|0)>(c[113642]|0)){c[113642]=t}}if((c[k+16>>2]|0)!=(c[l+16>>2]|0)){t=id(h-(c[113634]|0)|0,o)|0;if((t|0)<(c[113641]|0)){c[113641]=t}}if((c[113641]|0)<=(c[113642]|0)){n=7161;break L9227}}}while(0);a=a+44|0}if((n|0)==7147){v=0;w=v;i=d;return w|0}else if((n|0)==7161){v=0;w=v;i=d;return w|0}else if((n|0)==7164){v=1;w=v;i=d;return w|0}return 0}function ij(a){a=a|0;do{if((c[111230]|0)!=0){if((c[142830]|0)!=0){break}if((c[144658]|0)>>>0<10){iy(c[8400]|0,0,0)}else{iy(c[8278]|0,182,1)}return}}while(0);if((c[142828]|0)!=0){iy(98392,0,0);return}if((c[14940]|0)==2){ig(154800);return}else{ig(155976);return}}function ik(a){a=a|0;ig(154672);return}function il(a){a=a|0;do{if((c[142828]|0)!=0){if((c[144658]|0)>>>0>=13){break}iy(144784,0,0);return}}while(0);ig(155304);iM();return}function im(a){a=a|0;do{if((c[100354]|0)==0){if((c[142830]|0)!=0){if((c[111230]|0)==0){break}}iy(c[8276]|0,0,0);return}}while(0);if((c[122180]|0)!=0){return}else{ig(149e3);iM();return}}function io(a){a=a|0;ig(154400);return}function ip(a){a=a|0;var b=0,e=0,f=0;a=i;if((c[113680]|0)!=0){b=c[8688]|0;e=d[63312]|d[63313|0]<<8|d[63314|0]<<16|d[63315|0]<<24|0;a5(629984,138888,(f=i,i=i+16|0,c[f>>2]=b,c[f+8>>2]=e,f)|0)|0;i=f;iy(629984,76,1);i=a;return}else{e=63312+((((c[122178]|0)>>>0)%(((c[38706]|0)-1|0)>>>0)|0)+1<<2)|0;b=d[e]|d[e+1|0]<<8|d[e+2|0]<<16|d[e+3|0]<<24|0;e=c[8688]|0;a5(629984,138888,(f=i,i=i+16|0,c[f>>2]=b,c[f+8>>2]=e,f)|0)|0;i=f;iy(629984,76,1);i=a;return}}function iq(){var a=0,b=0;a=c[37122]|0;b=os(139608)|0;cf[a&15](94,2,0,b,6,4);return}function ir(a){a=a|0;ig(154376);return}function is(a){a=a|0;ig(155096);return}function it(a){a=a|0;ig(155096);return}function iu(){var a=0,b=0;c[120490]=1;if((c[14940]|0)==0){a=c[37122]|0;b=os(145592)|0;cf[a&15](0,0,0,b,6,4);return}else{iA();return}}function iv(){var a=0,b=0;c[120490]=1;if((c[14940]|0)==0){iA();return}else{a=c[37122]|0;b=os(134576)|0;cf[a&15](0,0,0,b,6,4);return}}function iw(){c[120490]=1;ca[c[37126]&63](90008,0);jv(56032);return}function ix(){c[113474]=0;c[110720]=0;c[144522]=0;return}function iy(a,b,d){a=a|0;b=b|0;d=d|0;c[113472]=c[113474];c[113464]=1;c[113466]=a;c[113468]=b;c[113470]=d;c[113474]=1;return}function iz(a){a=a|0;var b=0;b=a;b=0;c[105240]=1-(c[105240]|0);if((c[105240]|0)!=0){c[443184+((c[144632]|0)*288|0)>>2]=c[8404];c[113460]=1;return}else{c[443184+((c[144632]|0)*288|0)>>2]=c[8406];c[113460]=1;return}}function iA(){var a=0,b=0;c[120490]=1;ca[c[37126]&63]((c[14940]|0)==0?110776:110720,0);a=c[37122]|0;b=os(110680)|0;cf[a&15](115,9,0,b,5,6);jv(83200);return}function iB(a){a=a|0;var b=0,d=0;b=i;d=a;do{if((c[14940]|0)==0){if((d|0)==0){break}iy(c[8246]|0,0,0);ig(154400);i=b;return}}while(0);do{if((c[14940]|0)==1){if((d|0)<=2){break}eI(4,110344,(a=i,i=i+1|0,i=i+7>>3<<3,c[a>>2]=0,a)|0)|0;i=a;d=0}}while(0);c[140472]=d;ig(154800);i=b;return}function iC(){var a=0,b=0;a=c[37122]|0;b=os(117752)|0;cf[a&15](54,38,0,b,6,4);return}function iD(a){a=a|0;var b=0;b=a;if((b|0)==4){iy(c[8398]|0,460,1);return}else{dA(b,(c[140472]|0)+1|0,1);ix();return}}function iE(){var a=0,b=0;a=c[37122]|0;b=os(105520)|0;cf[a&15](96,14,0,b,6,4);b=c[37122]|0;a=os(102184)|0;cf[b&15](54,38,0,a,6,4);return}function iF(a){a=a|0;if((a|0)!=121){return}else{dA(4,(c[140472]|0)+1|0,1);ix();return}}function iG(a){a=a|0;dv(a,0);ix();return}function iH(){var a=0,d=0;a=c[37122]|0;d=os(94448)|0;cf[a&15](72,8,0,d,6,4);d=0;while(1){if((d|0)>=8){break}iI(b[77660]|0,(b[77661]|0)+(d<<4)|0);iJ(b[77660]|0,(b[77661]|0)+(d<<4)|0,442064+(d*24|0)|0);d=d+1|0}return}function iI(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=a;a=b;b=c[37122]|0;e=os(90880)|0;cf[b&15](d-8|0,a+7|0,0,e,6,4);e=0;while(1){if((e|0)>=24){break}b=c[37122]|0;f=os(147984)|0;cf[b&15](d,a+7|0,0,f,6,4);d=d+8|0;e=e+1|0}e=c[37122]|0;f=os(146336)|0;cf[e&15](d,a+7|0,0,f,6,4);return}function iJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b;b=e;e=f;g=d;L9413:while(1){d=b;b=d+1|0;h=a[d]|0;if((h|0)==0){i=7274;break}if((h|0)==10){e=f;g=g+12|0;continue}h=(bg(h|0)|0)-33|0;do{if((h|0)>=0){if((h|0)>=95){break}d=c[486720+(h*20|0)>>2]|0;if((e+d|0)>(c[38570]|0)){i=7281;break L9413}cf[c[37122]&15](e,g,0,c[486736+(h*20|0)>>2]|0,6,4);e=e+d|0;continue L9413}}while(0);e=e+4|0}if((i|0)==7281){return}else if((i|0)==7274){return}}function iK(a){a=a|0;iy(uq(a,1,0)|0,550,1);return}function iL(a){a=a|0;if((a|0)==121){dq()}ul(c[113466]|0);ix();return}function iM(){var a=0,d=0,e=0,f=0,g=0,h=0;a=i;i=i+4104|0;d=a|0;e=0;while(1){if((e|0)>=8){break}dw(d|0,4097,e,0);f=bk(d|0,143432)|0;if((f|0)!=0){g=442064+(e*24|0)|0;h=f;bN(g|0,24,1,h|0)|0;h=f;at(h|0)|0;b[155144+(e*20|0)>>1]=1}else{h=442064+(e*24|0)|0;f=c[8674]|0;wT(h|0,f|0)|0;b[155144+(e*20|0)>>1]=0}e=e+1|0}i=a;return}function iN(b){b=b|0;var d=0;d=b;c[110590]=1;c[110592]=d;wT(442376,442064+(d*24|0)|0)|0;if((aO(442064+(d*24|0)|0,c[8674]|0)|0)==0){a[442064+(d*24|0)|0]=0}c[110600]=wU(442064+(d*24|0)|0)|0;return}function iO(){var a=0,d=0;a=c[37122]|0;d=os(141880)|0;cf[a&15](72,8,0,d,6,4);d=0;while(1){if((d|0)>=8){break}iI(b[77660]|0,(b[77661]|0)+(d<<4)|0);iJ(b[77660]|0,(b[77661]|0)+(d<<4)|0,442064+(d*24|0)|0);d=d+1|0}if((c[110590]|0)==0){return}d=iP(442064+((c[110592]|0)*24|0)|0)|0;iJ((b[77660]|0)+d|0,(b[77661]|0)+(c[110592]<<4)|0,140920);return}function iP(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=b;b=0;e=0;while(1){if(e>>>0>=(wU(d|0)|0)>>>0){break}f=(bg(a[d+e|0]|0)|0)-33|0;g=f;do{if((f|0)<0){h=7313}else{if((g|0)>=95){h=7313;break}i=c[486720+(g*20|0)>>2]|0}}while(0);if((h|0)==7313){h=0;i=4}b=b+i|0;e=e+1|0}return b|0}function iQ(a){a=a|0;var b=0;ig(155624);c[108378]=1;c[108374]=8;c[108394]=1;c[108372]=0;c[144522]=0;c[108376]=0;c[113388]=0;c[144614]=c[14936];c[108390]=0;do{a=c[108390]|0;c[108390]=a+1;}while((c[(c[144614]|0)+(a*36|0)+4>>2]&8192|0)!=0);a=(c[108390]|0)-1|0;c[108390]=a;b=(c[144614]|0)+(a*36|0)+4|0;c[b>>2]=c[b>>2]|1;return}function iR(a){a=a|0;ig(148816);return}function iS(a){a=a|0;if((c[111230]|0)!=0){iy(c[8402]|0,0,0);return}else{iy(c[8672]|0,310,1);return}}function iT(a){a=a|0;var b=0,d=0;b=a;if((b|0)==0){if((c[110508]|0)>0){c[110506]=(c[110506]|0)-1;c[110508]=(c[110508]|0)-1;c[120614]=0}d=c[110506]|0;tY(d);return}else if((b|0)==1){if((c[110508]|0)<8){c[110506]=(c[110506]|0)+1;c[110508]=(c[110508]|0)+1}else{c[120614]=((c[120614]|0)!=0^1)&1}d=c[110506]|0;tY(d);return}else{d=c[110506]|0;tY(d);return}}function iU(a){a=a|0;ig(154928);return}function iV(a){a=a|0;ig(148632);return}function iW(){var a=0,d=0,e=0,f=0;a=c[37122]|0;d=os(139808)|0;cf[a&15](108,15,0,d,6,4);d=c[37122]|0;a=(b[77344]|0)+120|0;e=(b[77345]|0)+48|0;f=os(35808+((c[105240]|0)*9|0)|0)|0;cf[d&15](a,e,0,f,6,4);iX(b[77344]|0,(b[77345]|0)+80|0,9,c[110508]|0);return}function iX(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=a;a=b;b=d;d=e;if((b|0)>200){g=200}else{g=b}b=g;if((b|0)>23){h=200/(b|0)|0}else{h=8}g=h;h=f;e=c[37122]|0;i=os(110584)|0;cf[e&15](h,a,0,i,6,4);h=h+8|0;i=0;while(1){if((i|0)>=(b|0)){break}e=c[37122]|0;j=os(110480)|0;cf[e&15](h,a,0,j,6,4);h=h+g|0;i=i+1|0}h=h+(8-g)|0;i=c[37122]|0;b=os(110448)|0;cf[i&15](h,a,0,b,6,4);b=c[37122]|0;h=f+8+(ab(d,g)|0)|0;g=os(110408)|0;cf[b&15](h,a,0,g,6,4);return}function iY(a){a=a|0;if((a|0)!=121){return}if((c[142828]|0)!=0){a4(0)}b[(c[144622]|0)+20>>1]=b[228664]|0;ix();c5();return}function iZ(a){a=a|0;var b=0;if((a|0)!=121){return}do{if((c[111230]|0)!=0){if((c[142830]|0)!=0){break}a4(0)}}while(0);if((c[111208]|0)!=0){a4(0)}if((c[8132]|0)==0){a4(0)}if((c[14940]|0)==2){hG(0,c[35376+((c[122178]>>2&7)<<2)>>2]|0)}else{hG(0,c[35408+((c[122178]>>2&7)<<2)>>2]|0)}a=30;while(1){if((a|0)<=0){break}wA(1e5);if((wa()|0)==0){b=7375;break}a=a-1|0}a4(0)}function i_(a){a=a|0;return}function i$(a,b){a=a|0;b=b|0;var d=0;d=b;b=a;if((b|0)==0){if((c[d>>2]|0)!=0){a=d;c[a>>2]=(c[a>>2]|0)-1}return}else if((b|0)==1){if((c[d>>2]|0)<99){b=d;c[b>>2]=(c[b>>2]|0)+1}return}else{return}}function i0(){if((c[113474]|0)!=0){return}else{b[77410]=(c[144514]|0)-1&65535;c[144522]=0;c[113474]=1;c[144622]=155096;b[228664]=b[(c[144622]|0)+20>>1]|0;c[110720]=0;return}}function i1(a){a=a|0;var b=0;b=a;if((b|0)==0){if((c[8134]|0)!=0){c[8134]=(c[8134]|0)-1}}else if((b|0)==1){if((c[8134]|0)<15){c[8134]=(c[8134]|0)+1}}hx(c[8134]|0);return}function i2(a){a=a|0;var b=0;b=a;if((b|0)==0){if((c[8136]|0)!=0){c[8136]=(c[8136]|0)-1}}else if((b|0)==1){if((c[8136]|0)<15){c[8136]=(c[8136]|0)+1}}hy(c[8136]|0);return}function i3(){var a=0,d=0;a=c[37122]|0;d=os(137888)|0;cf[a&15](60,38,0,d,6,4);iX(b[74324]|0,(b[74325]|0)+16|0,16,c[8134]|0);iX(b[74324]|0,(b[74325]|0)+48|0,16,c[8136]|0);return}function i4(a){a=a|0;i$(a,453688);return}function i5(a){a=a|0;i$(a,453680);return}function i6(){var a=0,d=0,e=0,f=0;a=c[37122]|0;d=os(137112)|0;cf[a&15](60,38,0,d,6,4);if((c[113422]|0)>99){e=99}else{e=c[113422]|0}iX(b[77472]|0,(b[77473]|0)+16|0,100,e);if((c[113420]|0)>99){f=99}else{f=c[113420]|0}iX(b[77472]|0,(b[77473]|0)+48|0,100,f);return}function i7(){var a=0,b=0,d=0;a=i;do{if((c[100354]|0)==0){if((c[142830]|0)!=0){if((c[111230]|0)==0){break}}hG(0,34);i=a;return}}while(0);if((c[122180]|0)!=0){i=a;return}if((c[110708]|0)<0){i0();iM();ig(149e3);c[110708]=-2;i=a;return}else{b=c[8282]|0;d=442064+((c[110708]|0)*24|0)|0;a5(401904,b|0,(b=i,i=i+8|0,c[b>>2]=d,b)|0)|0;i=b;iy(401904,384,1);i=a;return}}function i8(a){a=a|0;if((a|0)!=121){return}jJ(c[110708]|0);hG(0,24);return}function i9(){var a=0,b=0,d=0;a=i;if((c[142828]|0)!=0){iy(136104,0,0);i=a;return}if((c[110708]|0)<0){iy(c[8284]|0,0,0);i=a;return}else{b=c[8286]|0;d=442064+((c[110708]|0)*24|0)|0;a5(401904,b|0,(b=i,i=i+8|0,c[b>>2]=d,b)|0)|0;i=b;iy(401904,102,1);i=a;return}}function ja(a){a=a|0;if((a|0)!=121){return}iG(c[110708]|0);hG(0,24);return}function jb(a){a=a|0;var d=0;if((a|0)!=121){return}if((c[142828]|0)!=0){d=7464}else{if((c[105234]|0)!=0){d=7464}}if((d|0)==7464){dL()|0}b[(c[144622]|0)+20>>1]=b[228664]|0;ix();hW();return}function jc(a){a=a|0;var b=0;ig(156032);c[108378]=1;c[108374]=9;c[108394]=1;c[108372]=0;c[144522]=0;c[108376]=0;c[113388]=0;c[144614]=c[21278];c[108390]=0;do{a=c[108390]|0;c[108390]=a+1;}while((c[(c[144614]|0)+(a*36|0)+4>>2]&8192|0)!=0);a=(c[108390]|0)-1|0;c[108390]=a;b=(c[144614]|0)+(a*36|0)+4|0;c[b>>2]=c[b>>2]|1;return}function jd(a){a=a|0;var b=0;ig(155328);c[108378]=1;c[108374]=1;c[108392]=1;c[108372]=0;c[144522]=0;c[108376]=0;c[113388]=0;c[144614]=c[13980];c[108390]=0;do{a=c[108390]|0;c[108390]=a+1;}while((c[(c[144614]|0)+(a*36|0)+4>>2]&8192|0)!=0);a=(c[108390]|0)-1|0;c[108390]=a;b=(c[144614]|0)+(a*36|0)+4|0;c[b>>2]=c[b>>2]|1;return}function je(a){a=a|0;var b=0;ig(148440);c[108378]=1;c[108374]=2;c[108384]=1;c[108372]=0;c[144522]=0;c[108376]=0;c[113388]=0;c[144614]=c[224];c[108390]=0;do{a=c[108390]|0;c[108390]=a+1;}while((c[(c[144614]|0)+(a*36|0)+4>>2]&8192|0)!=0);a=(c[108390]|0)-1|0;c[108390]=a;b=(c[144614]|0)+(a*36|0)+4|0;c[b>>2]=c[b>>2]|1;return}function jf(a){a=a|0;var b=0;ig(148528);c[108378]=1;c[108374]=3;c[108386]=1;c[108372]=0;c[144522]=0;c[108376]=0;c[113388]=0;c[144614]=c[7956];c[108390]=0;do{a=c[108390]|0;c[108390]=a+1;}while((c[(c[144614]|0)+(a*36|0)+4>>2]&8192|0)!=0);a=(c[108390]|0)-1|0;c[108390]=a;b=(c[144614]|0)+(a*36|0)+4|0;c[b>>2]=c[b>>2]|1;return}function jg(a){a=a|0;var b=0;ig(156080);c[108378]=1;c[108374]=4;c[108402]=1;c[108372]=0;c[144712]=0;c[144522]=0;c[108376]=0;c[108390]=0;c[113388]=0;c[144614]=c[22374];do{a=c[108390]|0;c[108390]=a+1;}while((c[(c[144614]|0)+(a*36|0)+4>>2]&8192|0)!=0);a=(c[108390]|0)-1|0;c[108390]=a;b=(c[144614]|0)+(a*36|0)+4|0;c[b>>2]=c[b>>2]|1;return}function jh(a){a=a|0;var b=0;ig(156e3);c[108378]=1;c[108374]=5;c[108396]=1;c[108372]=0;c[144522]=0;c[108376]=0;c[113388]=0;c[144614]=c[15826];c[108390]=0;do{a=c[108390]|0;c[108390]=a+1;}while((c[(c[144614]|0)+(a*36|0)+4>>2]&8192|0)!=0);a=(c[108390]|0)-1|0;c[108390]=a;b=(c[144614]|0)+(a*36|0)+4|0;c[b>>2]=c[b>>2]|1;return}function ji(a){a=a|0;var b=0;ig(154952);c[108378]=1;c[108374]=6;c[108388]=1;c[108372]=0;c[144522]=0;c[108376]=0;c[113388]=0;c[144614]=c[12980];c[108390]=0;do{a=c[108390]|0;c[108390]=a+1;}while((c[(c[144614]|0)+(a*36|0)+4>>2]&8192|0)!=0);a=(c[108390]|0)-1|0;c[108390]=a;b=(c[144614]|0)+(a*36|0)+4|0;c[b>>2]=c[b>>2]|1;return}function jj(a){a=a|0;var b=0;ig(156056);c[108378]=1;c[108374]=7;c[108400]=1;c[108372]=0;c[144522]=0;c[108376]=0;c[113388]=0;c[144614]=c[21998];c[108390]=0;do{a=c[108390]|0;c[108390]=a+1;}while((c[(c[144614]|0)+(a*36|0)+4>>2]&8192|0)!=0);a=(c[108390]|0)-1|0;c[108390]=a;b=(c[144614]|0)+(a*36|0)+4|0;c[b>>2]=c[b>>2]|1;return}function jk(){var a=0,b=0;a=c[37122]|0;b=os(135096)|0;cf[a&15](124,15,0,b,6,4);return}function jl(){var a=0,b=0;c[120490]=1;ca[c[37126]&63](90008,0);a=c[37122]|0;b=os(89904)|0;cf[a&15](84,2,0,b,6,4);ju();jv(c[144614]|0);if((c[144522]|0)==0){return}jw();return}function jm(){var a=0,b=0;c[120490]=1;ca[c[37126]&63](90008,0);a=c[37122]|0;b=os(144984)|0;cf[a&15](109,2,0,b,6,4);ju();jv(c[144614]|0);if((c[144522]|0)==0){return}jw();return}function jn(){var a=0,b=0;c[120490]=1;ca[c[37126]&63](90008,0);a=c[37122]|0;b=os(141240)|0;cf[a&15](59,2,0,b,6,4);ju();jv(c[144614]|0);if((c[144522]|0)==0){return}jw();return}function jo(){var a=0,b=0;c[120490]=1;ca[c[37126]&63](90008,0);a=c[37122]|0;b=os(135800)|0;cf[a&15](109,2,0,b,6,4);ju();jv(c[144614]|0);if((c[144712]|0)!=0){jx();return}if((c[144522]|0)!=0){jw()}return}function jp(){var a=0,b=0;c[120490]=1;ca[c[37126]&63](90008,0);a=c[37122]|0;b=os(133704)|0;cf[a&15](114,2,0,b,6,4);ju();jv(c[144614]|0);if((c[144522]|0)==0){return}jw();return}function jq(){var a=0,b=0;c[120490]=1;ca[c[37126]&63](90008,0);a=c[37122]|0;b=os(114848)|0;cf[a&15](103,2,0,b,6,4);ju();jv(c[144614]|0);if((c[144522]|0)==0){return}jw();return}function jr(){var a=0,b=0;c[120490]=1;ca[c[37126]&63](90008,0);a=c[37122]|0;b=os(113392)|0;cf[a&15](83,2,0,b,6,4);ju();jv(c[144614]|0);if((c[144522]|0)==0){return}jw();return}function js(){var a=0,b=0;c[120490]=1;ca[c[37126]&63](90008,0);a=c[37122]|0;b=os(120888)|0;cf[a&15](114,2,0,b,6,4);ju();jv(c[144614]|0);if((c[144522]|0)==0){return}jw();return}function jt(){var a=0,b=0;c[120490]=1;ca[c[37126]&63](90008,0);a=c[37122]|0;b=os(116104)|0;cf[a&15](52,2,0,b,6,4);ju();jv(c[144614]|0);if((c[144522]|0)==0){return}jw();return}function ju(){var a=0,b=0,d=0,e=0;a=i;b=c[(c[144614]|0)+((c[108390]|0)*36|0)+4>>2]|0;if((c[108372]|0)==0){if((b&128|0)!=0){jX(160,20,8,107448)}else{jX(160,20,8,107408)}i=a;return}d=b&8920312;if((d|0)==2048){jX(160,20,2,107984)}else if((d|0)==64){jX(160,20,2,107744)}else if((d|0)==524288){jX(160,20,2,107672)}else if((d|0)==8388608){jX(160,20,2,107568)}else if((d|0)==1024){do{if((c[(c[144614]|0)+((c[108390]|0)*36|0)+20>>2]|0)!=0){e=7554}else{if((c[(c[144614]|0)+((c[108390]|0)*36|0)+24>>2]|0)!=0){e=7554;break}jX(160,20,2,108056)}}while(0);if((e|0)==7554){jX(160,20,2,108096)}}else if((d|0)!=128)if((d|0)==32){jX(160,20,2,107880)}else if((d|0)==4096){jX(160,20,2,107928)}else if((d|0)==8){jX(160,20,2,108016)}else if((d|0)==16){jX(160,20,2,107848)}else{eI(4,107504,(d=i,i=i+8|0,c[d>>2]=b,d)|0)|0;i=d}i=a;return}function jv(a){a=a|0;var b=0;b=a;if((c[110720]|0)>0){if((c[44770]&262144|0)!=0){wT(453904,108760)|0;jS(100,176,6)}else{if((c[44770]&131072|0)!=0){wT(453904,108680)|0;jS(3,176,6)}else{if((c[44770]&4194304|0)!=0){wT(453904,108576)|0;jS(80,176,6)}else{wT(453904,108496)|0;jS(18,184,6)}}}}while(1){if(!((c[b+4>>2]&32768|0)!=0^1)){break}if((c[b+4>>2]&11018236|0)!=0){jU(b)}if((c[b+4>>2]&8920184|0)!=0){jV(b)}b=b+36|0}return}function jw(){var a=0,d=0;a=c[37122]|0;d=os(108984)|0;cf[a&15](66,88,0,d,6,4);if((b[89528]|0)==0){return}wT(453904,108848)|0;jS(74,96,6);return}function jx(){var a=0,b=0,d=0,e=0;a=c[37122]|0;b=os(109168)|0;cf[a&15](91,31,0,b,6,4);b=c[37122]|0;a=(c[144716]<<3)+96-1|0;d=(c[144714]<<3)+36-1|0;e=os(109056)|0;cf[b&15](a,d,0,e,6,4);return}function jy(){c[122172]=c[144526];if((c[122172]|0)==0){return}oa(0);return}function jz(){if((c[142838]|0)!=0){c[14783]=c[14783]&-8195;eb(0);return}else{c[14783]=c[14783]|8194;eb(0);return}}function jA(a){a=a|0;var b=0;b=a;b=0;b=(c[140468]|0)+1|0;c[140468]=b;if((b|0)<=(c[140470]|0)){return}c[140468]=1;ig(155096);return}function jB(){var b=0,d=0,e=0,f=0;b=i;i=i+16|0;d=b|0;e=d;wQ(e|0,155128,10)|0;c[120490]=1;a[d+4|0]=((c[140468]|0)/10|0)+48&255;a[d+5|0]=((c[140468]|0)%10|0)+48&255;e=c[37122]|0;f=os(d|0)|0;cf[e&15](0,0,0,f,6,4);i=b;return}function jC(){var b=0,d=0,e=0,f=0;b=i;i=i+8|0;d=b|0;e=d;a[e]=a[155120]|0;a[e+1|0]=a[155121|0]|0;a[e+2|0]=a[155122|0]|0;a[e+3|0]=a[155123|0]|0;a[e+4|0]=a[155124|0]|0;a[e+5|0]=a[155125|0]|0;a[e+6|0]=a[155126|0]|0;c[140470]=0;e=1;while(1){if((e|0)>=100){f=7629;break}a[d+4|0]=((e|0)/10|0)+48&255;a[d+5|0]=((e|0)%10|0)+48&255;if((oq(d|0,0)|0)==-1){break}c[140470]=(c[140470]|0)+1;e=e+1|0}if((f|0)==7629){i=b;return}if((c[140470]|0)!=0){if((c[14940]|0)==2){c[38969]=154400;c[38591]=506}else{c[38969]=154376;c[38585]=506}}i=b;return}function jD(a){a=a|0;var b=0;b=a;b=0;c[140468]=1;ig(155872);return}function jE(b,c){b=b|0;c=c|0;var d=0,e=0,f=0,g=0;d=b;b=c;do{if((d|0)>=33){if((d|0)>126){break}if((d|0)==61){d=43}else{if((d|0)==44){d=60}else{if((d|0)==46){d=62}}}c=b;b=c+1|0;a[453904+c|0]=d&255;a[453904+b|0]=0;e=b;return e|0}}while(0);do{if(256<=(d|0)){if((d|0)>=512){f=7649;break}if((d|0)==269){g=113352}else{c=453904+b|0;wT(c|0,113312)|0;b=b+4|0;a[453904+(b-1)|0]=d&255;a[453904+b|0]=0}}else{f=7649}}while(0);if((f|0)==7649){do{if(187<=(d|0)){if((d|0)>=196){f=7652;break}c=b;b=c+1|0;a[453904+c|0]=70;c=b;b=c+1|0;a[453904+c|0]=d+49-187&255;a[453904+b|0]=0}else{f=7652}}while(0);if((f|0)==7652){switch(d|0){case 174:{g=112760;break};case 184:{g=112640;break};case 32:{g=113088;break};case 215:{g=112048;break};case 216:{g=111984;break};case 209:{g=112224;break};case 210:{g=112192;break};case 198:{g=112504;break};case 173:{g=112792;break};case 201:{g=112344;break};case 207:{g=112304;break};case 13:{g=113192;break};case 9:{g=113272;break};case 157:{g=112920;break};case 182:{g=112672;break};case 127:{g=113040;break};case 255:{g=111936;break};case 27:{g=113160;break};case 172:{g=112864;break};case 175:{g=112728;break};case 199:{g=112456;break};case 186:{g=112592;break};case 200:{g=112160;break};case 196:{g=112088;break};default:{g=111872}}if((g|0)!=0){d=453904+b|0;f=g;wT(d|0,f|0)|0;b=b+(wU(g|0)|0)|0}}}e=b;return e|0}function jF(d){d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=d;d=-1;do{if((c[e>>2]|0)==3){f=c[157494]|0;if((f|0)>=(b8[c[38842]&15]()|0)){g=7710;break}if((c[e+12>>2]|0)==-1){d=c[113794]|0;c[157494]=(b8[c[38842]&15]()|0)+5}else{if((c[e+12>>2]|0)==1){d=c[113804]|0;c[157494]=(b8[c[38842]&15]()|0)+5}}if((c[e+8>>2]|0)==-1){d=c[113798]|0;c[157494]=(b8[c[38842]&15]()|0)+2}else{if((c[e+8>>2]|0)==1){d=c[113796]|0;c[157494]=(b8[c[38842]&15]()|0)+2}}if((c[e+4>>2]&1|0)!=0){d=c[113802]|0;c[157494]=(b8[c[38842]&15]()|0)+5}if((c[e+4>>2]&2|0)!=0){d=c[113806]|0;c[157494]=(b8[c[38842]&15]()|0)+5}do{if((c[108378]|0)!=0){if((c[108392]|0)==0){break}if((c[e+4>>2]&4|0)!=0){d=0;c[157494]=(b8[c[38842]&15]()|0)+5}if((c[e+4>>2]&8|0)!=0){d=0;c[157494]=(b8[c[38842]&15]()|0)+5}}}while(0)}else{g=7710}}while(0);if((g|0)==7710){if((c[e>>2]|0)==0){d=c[e+4>>2]|0;if((d|0)==182){c[108370]=1}}else{if((c[e>>2]|0)==1){if((c[e+4>>2]|0)==182){c[108370]=0}}}}if((d|0)==-1){h=0;i=h;return i|0}if((c[110590]|0)!=0){if((d|0)==(c[113806]|0)){if((c[110600]|0)>0){c[110600]=(c[110600]|0)-1;a[442064+((c[110592]|0)*24|0)+(c[110600]|0)|0]=0}}else{if((d|0)==(c[113800]|0)){c[110590]=0;f=442064+((c[110592]|0)*24|0)|0;wT(f|0,442376)|0}else{if((d|0)==(c[113802]|0)){c[110590]=0;if((a[442064+((c[110592]|0)*24|0)|0]|0)!=0){jJ(c[110592]|0)}}else{d=bg(d|0)|0;do{if((d|0)>=32){if((d|0)>127){break}if((c[110600]|0)>=23){break}if((iP(442064+((c[110592]|0)*24|0)|0)|0)>=176){break}f=c[110600]|0;c[110600]=f+1;a[442064+((c[110592]|0)*24|0)+f|0]=d&255;a[442064+((c[110592]|0)*24|0)+(c[110600]|0)|0]=0}}while(0)}}}h=1;i=h;return i|0}if((c[113464]|0)!=0){do{if((c[113470]|0)==1){if((d|0)==32){break}if((d|0)==110){break}if((d|0)==121){break}if((d|0)==(c[13988]|0)){break}h=0;i=h;return i|0}}while(0);c[113474]=c[113472];c[113464]=0;if((c[113468]|0)!=0){b9[c[113468]&1023](d)}c[113474]=0;hG(0,24);h=1;i=h;return i|0}if((d|0)==(c[113776]|0)){kW()}do{if((c[113474]|0)==0){if((d|0)==(c[113856]|0)){c[156014]=((c[156014]|0)!=0^1)&1;h=1;i=h;return i|0}if((d|0)==(c[13986]|0)){i0();c[144622]=155568;b[228664]=0;hG(0,23);h=1;i=h;return i|0}if((d|0)==(c[113778]|0)){i0();hG(0,23);im(0);h=1;i=h;return i|0}if((d|0)==(c[113836]|0)){i0();hG(0,23);il(0);h=1;i=h;return i|0}if((d|0)==(c[113772]|0)){i0();c[144622]=148632;b[228664]=0;hG(0,23);h=1;i=h;return i|0}if((d|0)==(c[113786]|0)){hG(0,23);i7();h=1;i=h;return i|0}if((d|0)==(c[113848]|0)){hG(0,23);iS(0);h=1;i=h;return i|0}if((d|0)==(c[113792]|0)){iz(0);hG(0,23);h=1;i=h;return i|0}if((d|0)==(c[113788]|0)){hG(0,23);i9();h=1;i=h;return i|0}if((d|0)==(c[113784]|0)){hG(0,23);ip(0);h=1;i=h;return i|0}if((d|0)==(c[113842]|0)){c[100360]=(c[100360]|0)+1;if((c[100360]|0)>4){c[100360]=0}if((c[100360]|0)==0){j=c[8670]|0}else{if((c[100360]|0)==1){k=c[8668]|0}else{if((c[100360]|0)==2){l=c[8666]|0}else{if((c[100360]|0)==3){m=c[8664]|0}else{m=c[8662]|0}l=m}k=l}j=k}c[443184+((c[144632]|0)*288|0)>>2]=j;l_(0);h=1;i=h;return i|0}if((d|0)==(c[113734]|0)){do{if((c[156016]&1|0)==0){if((c[144780]|0)!=0){break}iT(0);hG(0,22);h=1;i=h;return i|0}}while(0);h=0;i=h;return i|0}if((d|0)==(c[113736]|0)){do{if((c[156016]&1|0)==0){if((c[144780]|0)!=0){break}iT(1);hG(0,22);h=1;i=h;return i|0}}while(0);h=0;i=h;return i|0}if((d|0)!=(c[113840]|0)){if((d|0)!=(c[113774]|0)){break}i0();hG(0,23);ig(148816);h=1;i=h;return i|0}do{if((c[156016]&1|0)==0){if((c[144780]|0)!=0){break}if((c[110508]|0)<8){while(1){if((c[110508]|0)<8){n=1}else{n=(c[120614]|0)!=0^1}if(!n){break}iT(1)}}else{c[120614]=1;c[120680]=((c[120680]|0)+1|0)%3|0;if((c[120680]|0)==0){c[120612]=((c[120612]|0)!=0^1)&1;fo()}}h=1;i=h;return i|0}}while(0);h=0;i=h;return i|0}}while(0);if((c[113474]|0)==0){if((d|0)==(c[13988]|0)){i0();hG(0,23);h=1;i=h;return i|0}else{h=0;i=h;return i|0}}L10118:do{if((c[108378]|0)!=0){n=(c[144614]|0)+((c[108390]|0)*36|0)|0;j=0;if((c[144522]|0)!=0){if((bg(d|0)|0)==89){jK();c[144522]=0;jL(n)}else{if((bg(d|0)|0)==78){c[144522]=0;jL(n)}}h=1;i=h;return i|0}do{if((c[108372]|0)!=0){if((d|0)==(c[113800]|0)){jL(n);c[108376]=0;h=1;i=h;return i|0}if((c[n+4>>2]&8|0)!=0){if((d|0)==(c[113802]|0)){c[c[(c[n+16>>2]|0)+4>>2]>>2]=((c[c[(c[n+16>>2]|0)+4>>2]>>2]|0)!=0^1)&1;if((c[n+4>>2]&196608|0)!=0){c[44770]=c[n+4>>2]&196608;c[110720]=2}else{jM(c[n+16>>2]|0)}if((c[n+28>>2]|0)!=0){cd[c[n+28>>2]&255]()}}jL(n);h=1;i=h;return i|0}if((c[n+4>>2]&16|0)!=0){L10153:do{if((d|0)!=(c[113802]|0)){d=d-48|0;do{if((d|0)>=0){if((d|0)>9){break}c[c[(c[n+16>>2]|0)+4>>2]>>2]=d;break L10153}}while(0);h=1;i=h;return i|0}}while(0);if((c[n+28>>2]|0)!=0){cd[c[n+28>>2]&255]()}jL(n);h=1;i=h;return i|0}if((c[n+4>>2]&4096|0)!=0){do{if((c[108376]|0)!=0){if((d|0)!=(c[113802]|0)){do{if((d|0)==(c[113806]|0)){if((c[122174]|0)==0){break}c[122174]=(c[122174]|0)-1;h=1;i=h;return i|0}}while(0);if((c[122174]|0)>=5){h=1;i=h;return i|0}do{if((bR(d|0)|0)==0){if((d|0)==45){break}h=1;i=h;return i|0}}while(0);k=c[122174]|0;c[122174]=k+1;a[488704+k|0]=d&255;break}if((c[122174]|0)!=0){a[488704+(c[122174]|0)|0]=0;k=bw(488704)|0;if((c[(c[n+16>>2]|0)+20>>2]|0)!=-123456789){if((k|0)<(c[(c[n+16>>2]|0)+20>>2]|0)){g=7860}else{g=7858}}else{g=7858}do{if((g|0)==7858){if((c[(c[n+16>>2]|0)+24>>2]|0)!=-123456789){if((k|0)>(c[(c[n+16>>2]|0)+24>>2]|0)){g=7860;break}}c[c[(c[n+16>>2]|0)+4>>2]>>2]=k;if((c[n+4>>2]&196608|0)!=0){c[44770]=c[n+4>>2]&196608;c[110720]=2}else{jM(c[n+16>>2]|0)}if((c[n+28>>2]|0)!=0){cd[c[n+28>>2]&255]()}}}while(0);if((g|0)==7860){c[44770]=262144;c[110720]=2}}jL(n);c[108376]=0;h=1;i=h;return i|0}}while(0);h=1;i=h;return i|0}if((c[n+4>>2]&8388608|0)==0){break}if((d|0)==(c[113798]|0)){if((c[(c[n+16>>2]|0)+28>>2]|0)==2){k=c[c[(c[n+16>>2]|0)+4>>2]>>2]|0;k=k-1|0;do{if((c[(c[n+16>>2]|0)+20>>2]|0)!=-123456789){if((k|0)>=(c[(c[n+16>>2]|0)+20>>2]|0)){break}k=c[(c[n+16>>2]|0)+20>>2]|0}}while(0);do{if((c[(c[n+16>>2]|0)+24>>2]|0)!=-123456789){if((k|0)<=(c[(c[n+16>>2]|0)+24>>2]|0)){break}k=c[(c[n+16>>2]|0)+24>>2]|0}}while(0);if((c[c[(c[n+16>>2]|0)+4>>2]>>2]|0)!=(k|0)){hG(0,19)}c[c[(c[n+16>>2]|0)+4>>2]>>2]=k}if((c[(c[n+16>>2]|0)+28>>2]|0)==1){l=jN(c[c[(c[n+16>>2]|0)+8>>2]>>2]|0,c[n+32>>2]|0)|0;m=l-1|0;if((m|0)<0){m=0}if((l|0)!=(m|0)){hG(0,19)}c[c[(c[n+16>>2]|0)+8>>2]>>2]=c[(c[n+32>>2]|0)+(m<<2)>>2]}}if((d|0)==(c[113796]|0)){if((c[(c[n+16>>2]|0)+28>>2]|0)==2){m=c[c[(c[n+16>>2]|0)+4>>2]>>2]|0;m=m+1|0;do{if((c[(c[n+16>>2]|0)+20>>2]|0)!=-123456789){if((m|0)>=(c[(c[n+16>>2]|0)+20>>2]|0)){break}m=c[(c[n+16>>2]|0)+20>>2]|0}}while(0);do{if((c[(c[n+16>>2]|0)+24>>2]|0)!=-123456789){if((m|0)<=(c[(c[n+16>>2]|0)+24>>2]|0)){break}m=c[(c[n+16>>2]|0)+24>>2]|0}}while(0);if((c[c[(c[n+16>>2]|0)+4>>2]>>2]|0)!=(m|0)){hG(0,19)}c[c[(c[n+16>>2]|0)+4>>2]>>2]=m}if((c[(c[n+16>>2]|0)+28>>2]|0)==1){k=jN(c[c[(c[n+16>>2]|0)+8>>2]>>2]|0,c[n+32>>2]|0)|0;l=k+1|0;if((c[(c[n+32>>2]|0)+(l<<2)>>2]|0)==0){l=k}if((k|0)!=(l|0)){hG(0,19)}c[c[(c[n+16>>2]|0)+8>>2]>>2]=c[(c[n+32>>2]|0)+(l<<2)>>2]}}if((d|0)==(c[113802]|0)){if((c[n+4>>2]&196608|0)!=0){c[44770]=c[n+4>>2]&196608;c[110720]=2}else{jM(c[n+16>>2]|0)}if((c[n+28>>2]|0)!=0){cd[c[n+28>>2]&255]()}jL(n)}h=1;i=h;return i|0}}while(0);do{if((c[108392]|0)!=0){if((c[108372]|0)==0){break}if((c[e>>2]|0)==3){l=1;if((c[n+24>>2]|0)==0){h=1;i=h;return i|0}k=c[c[n+24>>2]>>2]|0;f=c[n+8>>2]|0;if((c[e+4>>2]&1|0)!=0){d=0}else{if((c[e+4>>2]&2|0)!=0){d=1}else{do{if((c[e+4>>2]&4|0)!=0){d=2}else{if((c[e+4>>2]&8|0)!=0){d=3;break}else{h=1;i=h;return i|0}}}while(0)}}o=0;while(1){if((c[55920+(o<<2)>>2]|0)!=0){p=(l|0)!=0}else{p=0}if(!p){break}j=c[55920+(o<<2)>>2]|0;L10312:while(1){if(!((c[j+4>>2]&32768|0)!=0^1)){break}do{if((c[j+8>>2]|0)==(f|0)){if((n|0)==(j|0)){break}do{if((c[j+4>>2]&1024|0)!=0){if((c[j+24>>2]|0)==0){break}if((c[c[j+24>>2]>>2]|0)==(d|0)){g=7953;break L10312}}}while(0)}}while(0);j=j+36|0}if((g|0)==7953){g=0;c[c[j+24>>2]>>2]=k;l=0}o=o+1|0}c[c[n+24>>2]>>2]=d}else{do{if((c[e>>2]|0)==2){l=1;if((c[n+20>>2]|0)==0){h=1;i=h;return i|0}k=c[c[n+20>>2]>>2]|0;f=c[n+8>>2]|0;if((c[e+4>>2]&1|0)!=0){d=0}else{do{if((c[e+4>>2]&2|0)!=0){d=1}else{if((c[e+4>>2]&4|0)!=0){d=2;break}else{h=1;i=h;return i|0}}}while(0)}m=0;while(1){if((c[55920+(m<<2)>>2]|0)!=0){q=(l|0)!=0}else{q=0}if(!q){break}j=c[55920+(m<<2)>>2]|0;L10356:while(1){if(!((c[j+4>>2]&32768|0)!=0^1)){break}do{if((c[j+8>>2]|0)==(f|0)){if((n|0)==(j|0)){break}do{if((c[j+4>>2]&1024|0)!=0){if((c[j+20>>2]|0)==0){break}if((c[c[j+20>>2]>>2]|0)==(d|0)){g=7984;break L10356}}}while(0)}}while(0);j=j+36|0}if((g|0)==7984){g=0;c[c[j+20>>2]>>2]=k;l=0}m=m+1|0}c[c[n+20>>2]>>2]=d}else{m=1;l=c[c[n+16>>2]>>2]|0;k=c[n+8>>2]|0;f=0;while(1){if((c[55920+(f<<2)>>2]|0)!=0){r=(m|0)!=0}else{r=0}if(!r){g=8010;break}j=c[55920+(f<<2)>>2]|0;L10381:while(1){if(!((c[j+4>>2]&32768|0)!=0^1)){break}do{if((c[j+4>>2]&17408|0)!=0){if((c[j+8>>2]|0)!=(k|0)){break}if((n|0)==(j|0)){break}if((c[c[j+16>>2]>>2]|0)==(d|0)){g=8002;break L10381}}}while(0);j=j+36|0}if((g|0)==8002){g=0;if((c[j+4>>2]&16384|0)!=0){break}c[c[j+16>>2]>>2]=l;m=0}f=f+1|0}if((g|0)==8010){c[c[n+16>>2]>>2]=d;break}h=1;i=h;return i|0}}while(0)}jL(n);h=1;i=h;return i|0}}while(0);do{if((c[108384]|0)!=0){if((c[108372]|0)==0){break}L10409:do{if((d|0)!=(c[113802]|0)){d=d-48|0;do{if((d|0)>=1){if((d|0)>9){break}o=0;L10414:while(1){f=c[896+(o<<2)>>2]|0;j=f;if((f|0)==0){g=8032;break}while(1){if(!((c[j+4>>2]&32768|0)!=0^1)){break}do{if((c[j+4>>2]&2048|0)!=0){if((c[c[(c[j+16>>2]|0)+4>>2]>>2]|0)!=(d|0)){break}if((n|0)!=(j|0)){g=8027;break L10414}}}while(0);j=j+36|0}o=o+1|0}if((g|0)==8027){c[c[(c[j+16>>2]|0)+4>>2]>>2]=c[c[(c[n+16>>2]|0)+4>>2]>>2]}c[c[(c[n+16>>2]|0)+4>>2]>>2]=d;break L10409}}while(0);h=1;i=h;return i|0}}while(0);jL(n);h=1;i=h;return i|0}}while(0);if((c[108402]|0)!=0){do{if((c[108372]|0)!=0){if((d|0)==(c[113804]|0)){f=(c[144714]|0)+1|0;c[144714]=f;if((f|0)==16){c[144714]=0}hG(0,32);h=1;i=h;return i|0}if((d|0)==(c[113794]|0)){f=(c[144714]|0)-1|0;c[144714]=f;if((f|0)<0){c[144714]=15}hG(0,32);h=1;i=h;return i|0}if((d|0)==(c[113798]|0)){f=(c[144716]|0)-1|0;c[144716]=f;if((f|0)<0){c[144716]=15}hG(0,32);h=1;i=h;return i|0}if((d|0)==(c[113796]|0)){f=(c[144716]|0)+1|0;c[144716]=f;if((f|0)==16){c[144716]=0}hG(0,32);h=1;i=h;return i|0}else{if((d|0)!=(c[113802]|0)){break}c[c[(c[n+16>>2]|0)+4>>2]>>2]=(c[144716]|0)+(c[144714]<<4);jL(n);c[144712]=0;h=1;i=h;return i|0}}}while(0)}do{if((c[108372]|0)!=0){if((c[108396]|c[108394]|c[108400]|c[108388]|c[108386]|c[108398]|0)==0){break}if((c[n+4>>2]&524352|0)==0){jL(n);h=1;i=h;return i|0}if((d|0)==(c[113806]|0)){if((a[(c[144778]|0)+(c[144782]|0)|0]|0)==0){if((c[144782]|0)>0){f=(c[144782]|0)-1|0;c[144782]=f;a[(c[144778]|0)+f|0]=0}}else{f=(c[144778]|0)+(c[144782]|0)|0;m=(c[144778]|0)+((c[144782]|0)+1)|0;wT(f|0,m|0)|0}}else{if((d|0)==(c[113798]|0)){if((c[144782]|0)>0){c[144782]=(c[144782]|0)-1}}else{if((d|0)==(c[113796]|0)){if((a[(c[144778]|0)+(c[144782]|0)|0]|0)!=0){c[144782]=(c[144782]|0)+1}}else{do{if((d|0)==(c[113802]|0)){g=8078}else{if((d|0)==(c[113800]|0)){g=8078;break}do{if((d|0)>=32){if((d|0)>126){break}if(((c[144782]|0)+1|0)<128){if((c[108370]|0)!=0){d=a[(c[108368]|0)+d|0]|0}if((a[(c[144778]|0)+(c[144782]|0)|0]|0)==0){m=c[144782]|0;c[144782]=m+1;a[(c[144778]|0)+m|0]=d&255;a[(c[144778]|0)+(c[144782]|0)|0]=0}else{m=c[144782]|0;c[144782]=m+1;a[(c[144778]|0)+m|0]=d&255}}}}while(0)}}while(0);if((g|0)==8078){c[c[(c[n+16>>2]|0)+8>>2]>>2]=c[144778];jL(n)}}}}h=1;i=h;return i|0}}while(0);if((d|0)==(c[113804]|0)){m=n+4|0;c[m>>2]=c[m>>2]&-2;do{if((c[n+4>>2]&32768|0)!=0){c[108390]=0;n=c[144614]|0}else{c[108390]=(c[108390]|0)+1;n=n+36|0}}while((c[n+4>>2]&8192|0)!=0);jL(n);h=1;i=h;return i|0}if((d|0)==(c[113794]|0)){m=n+4|0;c[m>>2]=c[m>>2]&-2;do{if((c[108390]|0)==0){do{c[108390]=(c[108390]|0)+1;}while((c[(c[144614]|0)+((c[108390]|0)*36|0)+4>>2]&32768|0)!=0^1)}c[108390]=(c[108390]|0)-1;}while((c[(c[144614]|0)+((c[108390]|0)*36|0)+4>>2]&8192|0)!=0);jL((c[144614]|0)+((c[108390]|0)*36|0)|0);h=1;i=h;return i|0}if((d|0)==(c[113802]|0)){m=c[n+4>>2]|0;if((m&4096|0)!=0){c[108376]=1;c[110720]=0;c[122174]=0}else{if((m&32|0)!=0){f=c[c[(c[n+16>>2]|0)+4>>2]>>2]|0;if((f|0)<0){g=8119}else{if((f|0)>255){g=8119}}if((g|0)==8119){f=0}c[144716]=c[c[(c[n+16>>2]|0)+4>>2]>>2]&15;c[144714]=c[c[(c[n+16>>2]|0)+4>>2]>>2]>>4;c[144712]=1}else{if((m&524352|0)!=0){c[144778]=ug(128,1,0)|0;f=c[144778]|0;l=c[c[(c[n+16>>2]|0)+8>>2]>>2]|0;wZ(f|0,l|0,128)|0;a[(c[144778]|0)+127|0]=0;ul(c[c[(c[n+16>>2]|0)+8>>2]>>2]|0);c[c[(c[n+16>>2]|0)+8>>2]>>2]=c[144778];c[144782]=0}else{if((m&128|0)!=0){c[144522]=1}}}}m=n+4|0;c[m>>2]=c[m>>2]|2;c[108372]=1;hG(0,32);h=1;i=h;return i|0}do{if((d|0)!=(c[113800]|0)){if((d|0)==(c[113806]|0)){break}do{if((d|0)==(c[113798]|0)){j=n;while(1){j=j+36|0;if((c[j+4>>2]&256|0)!=0){break}if(!((c[j+4>>2]&32768|0)!=0^1)){g=8146;break}}if((g|0)==8146){break}m=n+4|0;c[m>>2]=c[m>>2]&-2;c[113388]=(c[113388]|0)-1;c[144614]=c[j+16>>2];c[108390]=0;c[110720]=0;do{m=c[108390]|0;c[108390]=m+1;}while((c[(c[144614]|0)+(m*36|0)+4>>2]&8192|0)!=0);m=(c[108390]|0)-1|0;c[108390]=m;l=(c[144614]|0)+(m*36|0)+4|0;c[l>>2]=c[l>>2]|1;hG(0,19);h=1;i=h;return i|0}}while(0);do{if((d|0)==(c[113796]|0)){j=n;while(1){j=j+36|0;if((c[j+4>>2]&512|0)!=0){break}if(!((c[j+4>>2]&32768|0)!=0^1)){g=8156;break}}if((g|0)==8156){break}l=n+4|0;c[l>>2]=c[l>>2]&-2;c[113388]=(c[113388]|0)+1;c[144614]=c[j+16>>2];c[108390]=0;c[110720]=0;do{l=c[108390]|0;c[108390]=l+1;}while((c[(c[144614]|0)+(l*36|0)+4>>2]&8192|0)!=0);l=(c[108390]|0)-1|0;c[108390]=l;m=(c[144614]|0)+(l*36|0)+4|0;c[m>>2]=c[m>>2]|1;hG(0,19);h=1;i=h;return i|0}}while(0);break L10118}}while(0);if((d|0)==(c[113800]|0)){ix()}else{if((c[(c[144622]|0)+4>>2]|0)!=0){c[144622]=c[(c[144622]|0)+4>>2];b[228664]=b[(c[144622]|0)+20>>1]|0;hG(0,23)}}j=n+4|0;c[j>>2]=c[j>>2]&-4;c[108378]=0;c[108392]=0;c[108384]=0;c[108386]=0;c[108402]=0;c[108396]=0;c[108388]=0;c[108400]=0;c[144712]=0;c[144522]=0;c[108394]=0;c[108398]=0;fp();hG(0,24);h=1;i=h;return i|0}}while(0);if((d|0)==(c[113804]|0)){do{if(((b[228664]|0)+1|0)>((b[c[144622]>>1]|0)-1|0)){b[228664]=0}else{b[228664]=(b[228664]|0)+1&65535}hG(0,19);}while((b[(c[(c[144622]|0)+8>>2]|0)+((b[228664]|0)*20|0)>>1]|0)==-1);h=1;i=h;return i|0}if((d|0)==(c[113794]|0)){do{if((b[228664]|0)!=0){b[228664]=(b[228664]|0)-1&65535}else{b[228664]=(b[c[144622]>>1]|0)-1&65535}hG(0,19);}while((b[(c[(c[144622]|0)+8>>2]|0)+((b[228664]|0)*20|0)>>1]|0)==-1);h=1;i=h;return i|0}if((d|0)==(c[113798]|0)){do{if((c[(c[(c[144622]|0)+8>>2]|0)+((b[228664]|0)*20|0)+12>>2]|0)!=0){if((b[(c[(c[144622]|0)+8>>2]|0)+((b[228664]|0)*20|0)>>1]|0)!=2){break}hG(0,22);b9[c[(c[(c[144622]|0)+8>>2]|0)+((b[228664]<<16>>16)*20|0)+12>>2]&1023](0)}}while(0);h=1;i=h;return i|0}if((d|0)==(c[113796]|0)){do{if((c[(c[(c[144622]|0)+8>>2]|0)+((b[228664]|0)*20|0)+12>>2]|0)!=0){if((b[(c[(c[144622]|0)+8>>2]|0)+((b[228664]|0)*20|0)>>1]|0)!=2){break}hG(0,22);b9[c[(c[(c[144622]|0)+8>>2]|0)+((b[228664]<<16>>16)*20|0)+12>>2]&1023](1)}}while(0);h=1;i=h;return i|0}if((d|0)==(c[113802]|0)){do{if((c[(c[(c[144622]|0)+8>>2]|0)+((b[228664]|0)*20|0)+12>>2]|0)!=0){if((b[(c[(c[144622]|0)+8>>2]|0)+((b[228664]|0)*20|0)>>1]|0)==0){break}b[(c[144622]|0)+20>>1]=b[228664]|0;if((b[(c[(c[144622]|0)+8>>2]|0)+((b[228664]|0)*20|0)>>1]|0)==2){b9[c[(c[(c[144622]|0)+8>>2]|0)+((b[228664]<<16>>16)*20|0)+12>>2]&1023](1);hG(0,22)}else{b9[c[(c[(c[144622]|0)+8>>2]|0)+((b[228664]<<16>>16)*20|0)+12>>2]&1023](b[228664]|0);hG(0,1)}}}while(0);h=1;i=h;return i|0}if((d|0)==(c[113800]|0)){b[(c[144622]|0)+20>>1]=b[228664]|0;ix();hG(0,24);h=1;i=h;return i|0}if((d|0)==(c[113806]|0)){b[(c[144622]|0)+20>>1]=b[228664]|0;if((c[(c[144622]|0)+4>>2]|0)!=0){if((c[144622]|0)==155872){r=(c[140468]|0)-1|0;c[140468]=r;if((r|0)==0){c[144622]=c[(c[144622]|0)+4>>2];c[140468]=1}}else{c[144622]=c[(c[144622]|0)+4>>2]}b[228664]=b[(c[144622]|0)+20>>1]|0;hG(0,23)}h=1;i=h;return i|0}o=(b[228664]|0)+1|0;while(1){if((o|0)>=(b[c[144622]>>1]|0)){break}if((a[(c[(c[144622]|0)+8>>2]|0)+(o*20|0)+16|0]|0)==(d|0)){g=8206;break}o=o+1|0}if((g|0)==8206){b[228664]=o&65535;hG(0,19);h=1;i=h;return i|0}o=0;while(1){if((o|0)>(b[228664]|0)){break}if((a[(c[(c[144622]|0)+8>>2]|0)+(o*20|0)+16|0]|0)==(d|0)){g=8212;break}o=o+1|0}if((g|0)==8212){b[228664]=o&65535;hG(0,19);h=1;i=h;return i|0}h=0;i=h;return i|0}function jG(){var a=0;a=(b[210460]|0)-1&65535;b[210460]=a;if((a<<16>>16|0)>0){return}b[89528]=(b[89528]^1)&65535;b[210460]=8;return}function jH(){var a=0;do{if((c[142830]|0)!=0){a=1}else{if((c[142828]|0)!=0){a=1;break}a=(c[111230]|0)!=0}}while(0);return(a^1)&1|0}function jI(b){b=b|0;var d=0,e=0,f=0;d=b;b=c[121681]|0;e=b;f=b;b=0;while(1){if((a[d+b|0]|0)==0){break}if((a[d+b|0]|0)==10){e=e+f|0}b=b+1|0}return e|0}function jJ(a){a=a|0;var b=0;b=a;dE(b,442064+(b*24|0)|0);ix();if((c[110708]|0)!=-2){return}c[110708]=b;return}function jK(){var a=0,b=0,d=0,e=0,f=0,g=0;a=0;b=0;while(1){if((b|0)>=(c[111138]|0)){break}d=69504+(b*44|0)|0;if((c[d+32>>2]|0)==(c[108374]|0)){e=c[32584+((c[108374]|0)-1<<2)>>2]|0;L10742:while(1){if((c[e>>2]|0)==0){f=8327;break}g=c[e>>2]|0;while(1){if(!((c[g+4>>2]&32768|0)!=0^1)){break}if((c[g+4>>2]&8919160|0)!=0){if((c[g+16>>2]|0)==(d|0)){f=8317;break L10742}}else{if((c[g+16>>2]|0)==(c[d+4>>2]|0)){f=8317;break L10742}if((c[g+20>>2]|0)==(c[d+4>>2]|0)){f=8317;break L10742}if((c[g+24>>2]|0)==(c[d+4>>2]|0)){f=8317;break L10742}}g=g+36|0}e=e+4|0}if((f|0)==8327){f=0}else if((f|0)==8317){f=0;if((c[d+28>>2]|0)==1){ul(c[c[d+8>>2]>>2]|0);e=uq(c[d+16>>2]|0,1,0)|0;c[c[d+8>>2]>>2]=e}else{c[c[d+4>>2]>>2]=c[d+12>>2]}if((c[g+28>>2]|0)!=0){cd[c[g+28>>2]&255]()}}}b=b+1|0}if((a|0)==0){return}c[44770]=a;c[110720]=2;return}function jL(a){a=a|0;var b=0;b=a;a=b+4|0;c[a>>2]=c[a>>2]&-3;a=b+4|0;c[a>>2]=c[a>>2]|1;hG(0,32);c[108372]=0;c[144712]=0;if((c[110720]|0)==0){return}c[110720]=(c[110720]|0)-1;return}function jM(a){a=a|0;var b=0;b=a;if((c[b+36>>2]|0)==0){return}if((jH()|0)!=0){c[c[b+36>>2]>>2]=c[c[b+4>>2]>>2]}else{if((c[c[b+36>>2]>>2]|0)!=(c[c[b+4>>2]>>2]|0)){c[44770]=65536;c[110720]=2}}return}function jN(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=a;a=b;b=0;while(1){if((c[a>>2]|0)==0){e=8356;break}if((aO(d|0,c[a>>2]|0)|0)==0){e=8354;break}b=b+1|0;a=a+4|0}if((e|0)==8356){f=0;g=f;return g|0}else if((e|0)==8354){f=b;g=f;return g|0}return 0}function jO(){var d=0,e=0,f=0,g=0,h=0,i=0,j=0;c[120490]=0;if((c[113464]|0)!=0){d=uq(c[113466]|0,1,0)|0;e=d;f=100-((jI(c[113466]|0)|0)/2|0)|0;while(1){if((a[e]|0)==0){break}g=e;while(1){h=a[e]|0;i=h;if((h<<24>>24|0)!=0){j=(a[e]|0)!=10}else{j=0}if(!j){break}e=e+1|0}a[e]=0;iJ(160-((iP(g)|0)/2|0)|0,f,g);f=f+(c[121681]|0)|0;h=i;a[e]=h;if(h<<24>>24!=0){e=e+1|0}}ul(d);return}else{if((c[113474]|0)!=0){if((c[(c[144622]|0)+12>>2]|0)!=0){cd[c[(c[144622]|0)+12>>2]&255]()}d=b[(c[144622]|0)+16>>1]|0;e=b[(c[144622]|0)+18>>1]|0;i=b[c[144622]>>1]|0;f=0;while(1){if((f|0)>=(i|0)){break}if((a[(c[(c[144622]|0)+8>>2]|0)+(f*20|0)+2|0]|0)!=0){j=c[37122]|0;h=os((c[(c[144622]|0)+8>>2]|0)+(f*20|0)+2|0)|0;cf[j&15](d,e,0,h,6,4)}e=e+16|0;f=f+1|0}f=c[37122]|0;e=(b[(c[144622]|0)+18>>1]|0)-5+(b[228664]<<4)|0;i=os(32552+((b[89528]|0)*9|0)|0)|0;cf[f&15](d-32|0,e,0,i,6,4)}return}}function jP(){var a=0;a=56032;while(1){if(!((c[a+4>>2]&32768|0)!=0^1)){break}do{if((aQ(c[a>>2]|0,98632,6)|0)==0){if((c[14940]|0)!=0){break}c[a+4>>2]=8192}}while(0);do{if((aQ(c[a>>2]|0,98216,3)|0)==0){if((c[14940]|0)!=0){break}c[a+4>>2]=8192}}while(0);do{if((aQ(c[a>>2]|0,97392,3)|0)==0){if((c[14940]|0)==2){break}c[a+4>>2]=8192}}while(0);a=a+36|0}return}function jQ(){var a=0,d=0;jR();c[144622]=155096;c[113474]=0;b[228664]=b[(c[144622]|0)+20>>1]|0;b[89528]=0;b[210460]=10;c[110508]=(c[110506]|0)-3;c[113464]=0;c[113466]=0;c[113472]=c[113474];c[110708]=-1;a=c[14940]|0;if((a|0)==2){c[38764]=c[38769];c[155060>>2]=c[155080>>2];c[155064>>2]=c[155084>>2];c[155068>>2]=c[155088>>2];c[155072>>2]=c[155092>>2];b[77548]=(b[77548]|0)-1&65535;b[77557]=(b[77557]|0)+8&65535;c[38701]=155096;c[38603]=134;b[77208]=330;b[77209]=165;c[38591]=522;jP();jC();jz();return}else if((a|0)==3){d=8404}else if((a|0)==1){b[77197]=15;d=8402}else if((a|0)==0){d=8402}else{d=8404}if((d|0)==8402){b[77988]=(b[77988]|0)-1&65535;jP();jC();jz();return}else if((d|0)==8404){jP();jC();jz();return}}function jR(){var a=0,b=0,d=0,e=0,f=0,g=0;a=i;b=0;while(1){if((b|0)>=9){break}d=c[32584+(b<<2)>>2]|0;while(1){if((c[d>>2]|0)==0){break}e=c[d>>2]|0;while(1){if(!((c[e+4>>2]&32768|0)!=0^1)){break}if((c[e+4>>2]&8919160|0)!=0){f=kT(c[e+16>>2]|0)|0;if((f|0)!=0){g=f;c[e+16>>2]=g;c[g+40>>2]=e}else{eJ(110256,(g=i,i=i+8|0,c[g>>2]=c[e+16>>2],g)|0);i=g}}e=e+36|0}d=d+4|0}b=b+1|0}i=a;return}function jS(a,b,c){a=a|0;b=b|0;c=c|0;jT(a,b,c,453904);return}function jT(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;g=b;b=d;d=e;e=f;L10889:while(1){if((a[e]|0)==0){h=8437;break}f=e;e=f+1|0;i=a[f]|0;i=(bg(i|0)|0)-33|0;do{if((i|0)>=0){if((i|0)>95){break}f=c[486720+(i*20|0)>>2]|0;if((g+f|0)>320){break L10889}cf[c[37122]&15](g,b,0,c[486736+(i*20|0)>>2]|0,d,6);g=g+(f-1)|0;continue L10889}}while(0);g=g+4|0}if((h|0)==8437){return}return}function jU(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;d=a;a=b[d+12>>1]|0;e=b[d+14>>1]|0;f=c[d+4>>2]|0;if((f&128|0)!=0){g=c[37122]|0;if((f&3|0)!=0){h=b[89528]|0}else{h=0}i=os(154312+(h<<3)|0)|0;cf[g&15](a,e,0,i,6,4);return}i=0;if((f&2|0)!=0){j=2}else{if((f&1|0)!=0){k=8}else{k=(f&772|0)!=0?5:6}j=k}k=j;j=uq(c[d>>2]|0,1,0)|0;d=j;g=j;while(1){j=az(g|0,108160)|0;g=j;if((j|0)==0){break}wT(453904,g|0)|0;if((f&1048576|0)==0){i=(jW(453904)|0)+4|0}jS(a-i|0,e,k);e=e+8|0;g=0}ul(d);return}function jV(d){d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;i=i+8|0;f=e|0;g=d;d=b[g+12>>1]|0;h=b[g+14>>1]|0;j=c[g+4>>2]|0;if((j&2|0)!=0){k=2}else{k=(j&1|0)!=0?8:3}l=k;if((j&8|0)!=0){k=(c[c[(c[g+16>>2]|0)+4>>2]>>2]|0)!=0?108472:108448;wT(453904,k|0)|0;jS(d,h,l);i=e;return}if((j&4096|0)!=0){do{if((j&3|0)!=0){if((c[108376]|0)==0){m=8469;break}a[488704+(c[122174]|0)|0]=0;wT(453904,488704)|0}else{m=8469}}while(0);if((m|0)==8469){k=c[c[(c[g+16>>2]|0)+4>>2]>>2]|0;a5(453904,108424,(n=i,i=i+8|0,c[n>>2]=k,n)|0)|0;i=n}jS(d,h,l);i=e;return}if((j&1024|0)!=0){k=c[g+16>>2]|0;if((k|0)!=0){o=c[k>>2]|0;jE(o,0)|0;if((k|0)==455032){if((c[g+20>>2]|0)!=0){o=(wU(453904)|0)+453904|0;p=(c[c[g+20>>2]>>2]|0)+1|0;a5(o|0,108392,(n=i,i=i+8|0,c[n>>2]=p,n)|0)|0;i=n}if((c[g+24>>2]|0)!=0){p=(wU(453904)|0)+453904|0;o=(c[c[g+24>>2]>>2]|0)+1|0;a5(p|0,108376,(n=i,i=i+8|0,c[n>>2]=o,n)|0)|0;i=n}}else{do{if((k|0)==455040){m=8483}else{if((k|0)==455080){m=8483;break}if((k|0)==455376){m=8483;break}if((k|0)==455064){m=8483}}}while(0);if((m|0)==8483){if((c[g+20>>2]|0)!=0){m=(wU(453904)|0)+453904|0;k=(c[c[g+20>>2]>>2]|0)+1|0;a5(m|0,108360,(n=i,i=i+8|0,c[n>>2]=k,n)|0)|0;i=n}if((c[g+24>>2]|0)!=0){k=(wU(453904)|0)+453904|0;m=(c[c[g+24>>2]>>2]|0)+1|0;a5(k|0,108376,(n=i,i=i+8|0,c[n>>2]=m,n)|0)|0;i=n}}}jS(d,h,l)}i=e;return}if((j&2064|0)!=0){m=c[c[(c[g+16>>2]|0)+4>>2]>>2]|0;a5(453904,108424,(n=i,i=i+8|0,c[n>>2]=m,n)|0)|0;i=n;if((j&16|0)!=0){q=c[c[(c[g+16>>2]|0)+4>>2]>>2]|0}else{q=l}jS(d,h,q);i=e;return}if((j&32|0)!=0){q=c[c[(c[g+16>>2]|0)+4>>2]>>2]|0;m=c[37120]|0;k=(ab(d,c[38570]|0)|0)/320|0;o=(ab(h-1|0,c[38574]|0)|0)/200|0;cf[m&15](0,k,o,(c[38570]<<3|0)/320|0,(c[38574]<<3|0)/200|0,0);o=c[37120]|0;k=(ab(d+1|0,c[38570]|0)|0)/320|0;m=(ab(h,c[38574]|0)|0)/200|0;cf[o&15](0,k,m,((c[38570]|0)*6|0|0)/320|0,((c[38574]|0)*6|0|0)/200|0,q&255);if((q|0)==0){q=c[37122]|0;m=os(108280)|0;cf[q&15](d+1|0,h,0,m,6,4)}i=e;return}if((j&524352|0)==0){if((j&8388608|0)==0){i=e;return}if((c[(c[g+16>>2]|0)+28>>2]|0)==2){if((c[g+32>>2]|0)==0){j=c[c[(c[g+16>>2]|0)+4>>2]>>2]|0;a5(453904,108424,(n=i,i=i+8|0,c[n>>2]=j,n)|0)|0;i=n}else{j=c[(c[g+32>>2]|0)+(c[c[(c[g+16>>2]|0)+4>>2]>>2]<<2)>>2]|0;wT(453904,j|0)|0}}if((c[(c[g+16>>2]|0)+28>>2]|0)==1){j=c[c[(c[g+16>>2]|0)+8>>2]>>2]|0;a5(453904,108248,(n=i,i=i+8|0,c[n>>2]=j,n)|0)|0;i=n}jS(d,h,l);i=e;return}n=c[c[(c[g+16>>2]|0)+8>>2]>>2]|0;do{if((c[108372]|0)!=0){if((c[g+4>>2]&3|0)==0){break}while(1){if((jW(n)|0)<272){break}j=wU(n|0)|0;m=j-1|0;j=m;a[n+m|0]=0;if((c[144782]|0)>(j|0)){c[144782]=(c[144782]|0)-1}}a[f|0]=a[n+(c[144782]|0)|0]|0;a[f+1|0]=0;j=jW(f|0)|0;if((j|0)==1){j=7}a[n+(c[144782]|0)|0]=0;m=jW(n)|0;a[n+(c[144782]|0)|0]=a[f|0]|0;q=c[37120]|0;k=(ab(d+m-1|0,c[38570]|0)|0)/320|0;m=(ab(h,c[38574]|0)|0)/200|0;o=(ab(j,c[38570]|0)|0)/320|0;cf[q&15](0,k,m,o,((c[38574]|0)*9|0|0)/200|0,4)}}while(0);wT(453904,n|0)|0;jS(d,h,l);i=e;return}function jW(b){b=b|0;var d=0,e=0,f=0;d=b;b=0;L11024:while(1){if((a[d]|0)==0){break}e=d;d=e+1|0;f=a[e]|0;f=(bg(f|0)|0)-33|0;do{if((f|0)>=0){if((f|0)>95){break}b=b+(c[486720+(f*20|0)>>2]|0)|0;b=b-1|0;continue L11024}}while(0);b=b+4|0}b=b+1|0;return b|0}function jX(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=d;jT(a-((jW(e)|0)/2|0)|0,b,c,e);return}function jY(a,b,d){a=a|0;b=b|0;d=d|0;return(c[105236]|0)+((e[(c[(c[(c[108410]|0)+(a*196|0)+152>>2]|0)+(b<<2)>>2]|0)+26+(d<<1)>>1]|0)*24|0)|0}function jZ(a,b,d){a=a|0;b=b|0;d=d|0;return c[(c[105236]|0)+((e[(c[(c[(c[108410]|0)+(a*196|0)+152>>2]|0)+(b<<2)>>2]|0)+26+(d<<1)>>1]|0)*24|0)+16>>2]|0}function j_(a,d){a=a|0;d=d|0;var f=0,g=0;f=a;a=d;if((c[144667]|0)!=0){g=b[(c[(c[(c[108410]|0)+(f*196|0)+152>>2]|0)+(a<<2)>>2]|0)+20>>1]&4;return g|0}else{g=(e[(c[(c[(c[108410]|0)+(f*196|0)+152>>2]|0)+(a<<2)>>2]|0)+28>>1]|0|0)!=65535|0;return g|0}return 0}function j$(a,d){a=a|0;d=d|0;var e=0,f=0,g=0;e=a;a=d;do{if((c[144667]|0)!=0){if((b[e+20>>1]&4|0)!=0){break}f=0;g=f;return g|0}}while(0);if((c[e+52>>2]|0)!=(a|0)){f=c[e+52>>2]|0;g=f;return g|0}do{if((c[144667]|0)==0){if((c[e+56>>2]|0)!=(a|0)){break}f=0;g=f;return g|0}}while(0);f=c[e+56>>2]|0;g=f;return g|0}function j0(){var b=0,e=0,f=0,g=0,h=0,j=0,k=0;b=i;e=os(134920)|0;f=vF(e)|0;c[113678]=c[156100];g=0;while(1){if((a[f+(g*23|0)|0]|0)==-1){break}if((c[113678]|0)>>>0>=((c[156100]|0)+((c[113526]|0)*20|0)|0)>>>0){if((c[113526]|0)!=0){h=c[113526]<<1}else{h=32}j=h;c[156100]=uo(c[156100]|0,j*20|0,1,0)|0;c[113678]=(c[156100]|0)+((c[113526]|0)*20|0);c[113526]=j}do{if((a[f+(g*23|0)|0]|0)!=0){if((oh(f+(g*23|0)+10|0)|0)==-1){break}else{j=oi(f+(g*23|0)+1|0)|0;c[(c[113678]|0)+4>>2]=j;j=oi(f+(g*23|0)+10|0)|0;c[(c[113678]|0)+8>>2]=j;k=8575;break}}else{if((oq(f+(g*23|0)+10|0,2)|0)==-1){break}else{j=og(f+(g*23|0)+1|0)|0;c[(c[113678]|0)+4>>2]=j;j=og(f+(g*23|0)+10|0)|0;c[(c[113678]|0)+8>>2]=j;k=8575;break}}}while(0);if((k|0)==8575){k=0;c[c[113678]>>2]=a[f+(g*23|0)|0]|0;c[(c[113678]|0)+12>>2]=(c[(c[113678]|0)+4>>2]|0)-(c[(c[113678]|0)+8>>2]|0)+1;if((c[(c[113678]|0)+12>>2]|0)<2){eJ(144872,(j=i,i=i+16|0,c[j>>2]=f+(g*23|0)+10,c[j+8>>2]=f+(g*23|0)+1,j)|0);i=j}j=f+(g*23|0)+19|0;c[(c[113678]|0)+16>>2]=d[j]|d[j+1|0]<<8|d[j+2|0]<<16|d[j+3|0]<<24;c[113678]=(c[113678]|0)+20}g=g+1|0}vI(e);i=b;return}function j1(a){a=a|0;var b=0,d=0,e=0;b=a;a=c[b+12>>2]|0;d=0;while(1){if((d|0)>=(c[b+148>>2]|0)){break}e=j$(c[(c[b+152>>2]|0)+(d<<2)>>2]|0,b)|0;if((e|0)!=0){if((c[e+12>>2]|0)<(a|0)){a=c[e+12>>2]|0}}d=d+1|0}return a|0}function j2(a){a=a|0;var b=0,d=0,e=0;b=a;a=-32768e3;if((c[144667]|0)==0){a=-2097152e3}d=0;while(1){if((d|0)>=(c[b+148>>2]|0)){break}e=j$(c[(c[b+152>>2]|0)+(d<<2)>>2]|0,b)|0;if((e|0)!=0){if((c[e+12>>2]|0)>(a|0)){a=c[e+12>>2]|0}}d=d+1|0}return a|0}function j3(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;d=a;a=b;b=0;while(1){if((b|0)>=(c[d+148>>2]|0)){e=8614;break}f=j$(c[(c[d+152>>2]|0)+(b<<2)>>2]|0,d)|0;g=f;if((f|0)!=0){if((c[g+12>>2]|0)>(a|0)){break}}b=b+1|0}if((e|0)==8614){if((c[144658]|0)>>>0<1){h=0}else{h=a}i=h;j=i;return j|0}h=c[g+12>>2]|0;while(1){e=b+1|0;b=e;if((e|0)>=(c[d+148>>2]|0)){break}e=j$(c[(c[d+152>>2]|0)+(b<<2)>>2]|0,d)|0;g=e;do{if((e|0)!=0){if((c[g+12>>2]|0)>=(h|0)){break}if((c[g+12>>2]|0)<=(a|0)){break}h=c[g+12>>2]|0}}while(0)}i=h;j=i;return j|0}function j4(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a;a=b;b=0;while(1){if((b|0)>=(c[d+148>>2]|0)){e=8635;break}f=j$(c[(c[d+152>>2]|0)+(b<<2)>>2]|0,d)|0;g=f;if((f|0)!=0){if((c[g+12>>2]|0)<(a|0)){break}}b=b+1|0}if((e|0)==8635){h=a;i=h;return i|0}e=c[g+12>>2]|0;while(1){f=b+1|0;b=f;if((f|0)>=(c[d+148>>2]|0)){break}f=j$(c[(c[d+152>>2]|0)+(b<<2)>>2]|0,d)|0;g=f;do{if((f|0)!=0){if((c[g+12>>2]|0)<=(e|0)){break}if((c[g+12>>2]|0)>=(a|0)){break}e=c[g+12>>2]|0}}while(0)}h=e;i=h;return i|0}function j5(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a;a=b;b=0;while(1){if((b|0)>=(c[d+148>>2]|0)){e=8653;break}f=j$(c[(c[d+152>>2]|0)+(b<<2)>>2]|0,d)|0;g=f;if((f|0)!=0){if((c[g+16>>2]|0)<(a|0)){break}}b=b+1|0}if((e|0)==8653){h=a;i=h;return i|0}e=c[g+16>>2]|0;while(1){f=b+1|0;b=f;if((f|0)>=(c[d+148>>2]|0)){break}f=j$(c[(c[d+152>>2]|0)+(b<<2)>>2]|0,d)|0;g=f;do{if((f|0)!=0){if((c[g+16>>2]|0)<=(e|0)){break}if((c[g+16>>2]|0)>=(a|0)){break}e=c[g+16>>2]|0}}while(0)}h=e;i=h;return i|0}function j6(a,d){a=a|0;d=d|0;var e=0,f=0,g=0;e=a;a=d;if((a|0)>=0){f=c[(c[108410]|0)+(a*196|0)+20>>2]|0}else{f=c[(c[108410]|0)+((((b[e+24>>1]|0)>>>0)%((c[111126]|0)>>>0)|0)*196|0)+24>>2]|0}a=f;while(1){if((a|0)>=0){g=(b[(c[108410]|0)+(a*196|0)+194>>1]|0)!=(b[e+24>>1]|0)}else{g=0}if(!g){break}a=c[(c[108410]|0)+(a*196|0)+20>>2]|0}return a|0}function j7(a,d){a=a|0;d=d|0;var e=0,f=0,g=0;e=a;a=d;if((a|0)>=0){f=c[(c[113656]|0)+(a*124|0)+76>>2]|0}else{f=c[(c[113656]|0)+((((b[e+24>>1]|0)>>>0)%((c[111132]|0)>>>0)|0)*124|0)+72>>2]|0}a=f;while(1){if((a|0)>=0){g=(b[(c[113656]|0)+(a*124|0)+24>>1]|0)!=(b[e+24>>1]|0)}else{g=0}if(!g){break}a=c[(c[113656]|0)+(a*124|0)+76>>2]|0}return a|0}function j8(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a;a=b;b=0;while(1){if((b|0)>=(c[d+148>>2]|0)){e=8689;break}f=j$(c[(c[d+152>>2]|0)+(b<<2)>>2]|0,d)|0;g=f;if((f|0)!=0){if((c[g+16>>2]|0)>(a|0)){break}}b=b+1|0}if((e|0)==8689){h=a;i=h;return i|0}e=c[g+16>>2]|0;while(1){f=b+1|0;b=f;if((f|0)>=(c[d+148>>2]|0)){break}f=j$(c[(c[d+152>>2]|0)+(b<<2)>>2]|0,d)|0;g=f;do{if((f|0)!=0){if((c[g+16>>2]|0)>=(e|0)){break}if((c[g+16>>2]|0)<=(a|0)){break}e=c[g+16>>2]|0}}while(0)}h=e;i=h;return i|0}function j9(a){a=a|0;var b=0,d=0,e=0;b=a;a=2147483647;if((c[144667]|0)==0){a=2097152e3}d=0;while(1){if((d|0)>=(c[b+148>>2]|0)){break}e=j$(c[(c[b+152>>2]|0)+(d<<2)>>2]|0,b)|0;if((e|0)!=0){if((c[e+16>>2]|0)<(a|0)){a=c[e+16>>2]|0}}d=d+1|0}return a|0}function ka(a){a=a|0;var b=0,d=0,e=0;b=a;a=0;if((c[144667]|0)==0){a=-2097152e3}d=0;while(1){if((d|0)>=(c[b+148>>2]|0)){break}e=j$(c[(c[b+152>>2]|0)+(d<<2)>>2]|0,b)|0;if((e|0)!=0){if((c[e+16>>2]|0)>(a|0)){a=c[e+16>>2]|0}}d=d+1|0}return a|0}function kb(a){a=a|0;var d=0,e=0,f=0,g=0;d=a;a=2147483647;e=(c[108410]|0)+(d*196|0)|0;if((c[144667]|0)==0){a=2097152e3}f=0;while(1){if((f|0)>=(c[e+148>>2]|0)){break}if((j_(d,f)|0)!=0){g=jY(d,f,0)|0;if((b[g+10>>1]|0)>0){if((c[(c[100460]|0)+(b[g+10>>1]<<2)>>2]|0)<(a|0)){a=c[(c[100460]|0)+(b[g+10>>1]<<2)>>2]|0}}g=jY(d,f,1)|0;if((b[g+10>>1]|0)>0){if((c[(c[100460]|0)+(b[g+10>>1]<<2)>>2]|0)<(a|0)){a=c[(c[100460]|0)+(b[g+10>>1]<<2)>>2]|0}}}f=f+1|0}return a|0}function kc(a){a=a|0;var d=0,e=0,f=0,g=0;d=a;a=2147483647;e=(c[108410]|0)+(d*196|0)|0;if((c[144667]|0)==0){a=2097152e3}f=0;while(1){if((f|0)>=(c[e+148>>2]|0)){break}if((j_(d,f)|0)!=0){g=jY(d,f,0)|0;if((b[g+8>>1]|0)>0){if((c[(c[100460]|0)+(b[g+8>>1]<<2)>>2]|0)<(a|0)){a=c[(c[100460]|0)+(b[g+8>>1]<<2)>>2]|0}}g=jY(d,f,1)|0;if((b[g+8>>1]|0)>0){if((c[(c[100460]|0)+(b[g+8>>1]<<2)>>2]|0)<(a|0)){a=c[(c[100460]|0)+(b[g+8>>1]<<2)>>2]|0}}}f=f+1|0}return a|0}function kd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;d=a;a=b;b=0;b=(c[108410]|0)+(a*196|0)|0;e=c[b+148>>2]|0;f=0;while(1){g=f;do{if((c[144658]|0)>>>0<7){if((c[b+148>>2]|0)>=(e|0)){h=8753;break}i=c[b+148>>2]|0}else{h=8753}}while(0);if((h|0)==8753){h=0;i=e}if((g|0)>=(i|0)){h=8764;break}if((j_(a,f)|0)!=0){j=c[(jY(a,f,0)|0)+16>>2]|0;if(((j-(c[108410]|0)|0)/196|0|0)==(a|0)){b=jZ(a,f,1)|0}else{b=jZ(a,f,0)|0}if((c[b+12>>2]|0)==(d|0)){h=8760;break}}f=f+1|0}if((h|0)==8764){k=0;l=k;return l|0}else if((h|0)==8760){k=b;l=k;return l|0}return 0}function ke(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;d=a;a=b;b=0;b=(c[108410]|0)+(a*196|0)|0;e=c[b+148>>2]|0;f=0;while(1){g=f;do{if((c[144658]|0)>>>0<7){if((c[b+148>>2]|0)>=(e|0)){h=8772;break}i=c[b+148>>2]|0}else{h=8772}}while(0);if((h|0)==8772){h=0;i=e}if((g|0)>=(i|0)){h=8783;break}if((j_(a,f)|0)!=0){j=c[(jY(a,f,0)|0)+16>>2]|0;if(((j-(c[108410]|0)|0)/196|0|0)==(a|0)){b=jZ(a,f,1)|0}else{b=jZ(a,f,0)|0}if((c[b+16>>2]|0)==(d|0)){h=8779;break}}f=f+1|0}if((h|0)==8783){k=0;l=k;return l|0}else if((h|0)==8779){k=b;l=k;return l|0}return 0}function kf(a,d){a=a|0;d=d|0;var e=0,f=0;e=a;a=d;d=0;while(1){if((d|0)>=(c[e+148>>2]|0)){break}f=j$(c[(c[e+152>>2]|0)+(d<<2)>>2]|0,e)|0;if((f|0)!=0){if((b[f+188>>1]|0)<(a|0)){a=b[f+188>>1]|0}}d=d+1|0}return a|0}function kg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=a;a=b;if((c[144658]|0)>>>0<7){do{if((c[a+104>>2]|0)!=0){e=1}else{if((c[a+108>>2]|0)!=0){e=1;break}e=(c[a+112>>2]|0)!=0}}while(0);f=e&1;g=f;return g|0}e=d;if((e|0)==0){f=(c[a+104>>2]|0)!=0|0;g=f;return g|0}else if((e|0)==1){f=(c[a+108>>2]|0)!=0|0;g=f;return g|0}else if((e|0)==2){f=(c[a+112>>2]|0)!=0|0;g=f;return g|0}else{f=1;g=f;return g|0}return 0}function kh(a){a=a|0;var d=0,e=0,f=0;d=a;do{if((c[144678]|0)==0){if((b[d+24>>1]|0)!=0){break}switch(b[d+22>>1]|0){case 1:case 26:case 27:case 28:case 31:case 32:case 33:case 34:case 117:case 118:case 139:case 170:case 79:case 35:case 138:case 171:case 81:case 13:case 192:case 169:case 80:case 12:case 194:case 173:case 157:case 104:case 193:case 172:case 156:case 17:case 195:case 174:case 97:case 39:case 126:case 125:case 210:case 209:case 208:case 207:case 11:case 52:case 197:case 51:case 124:case 198:case 48:case 85:{e=1;f=e;return f|0};default:{}}e=0;f=e;return f|0}}while(0);e=1;f=e;return f|0}function ki(a){a=a|0;var c=0,d=0,e=0;c=a;if((b[c+190>>1]|0)==9){d=1;e=d&1;return e|0}d=(b[c+190>>1]&128|0)!=0;e=d&1;return e|0}function kj(a){a=a|0;var c=0,d=0,e=0;c=a;if((b[c+192>>1]|0)==9){d=1;e=d&1;return e|0}d=(b[c+192>>1]&128|0)!=0;e=d&1;return e|0}function kk(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;e=a;a=d;d=(b[e+22>>1]&512)>>9;switch((b[e+22>>1]&448)>>6|0){case 0:{do{if((c[a+84>>2]|0)==0){if((c[a+96>>2]|0)!=0){break}if((c[a+76>>2]|0)!=0){break}if((c[a+88>>2]|0)!=0){break}if((c[a+80>>2]|0)!=0){break}if((c[a+92>>2]|0)!=0){break}c[a+224>>2]=c[8380];hG(c[a>>2]|0,34);f=0;g=f;return g|0}}while(0);break};case 1:{do{if((c[a+84>>2]|0)==0){if((d|0)!=0){if((c[a+96>>2]|0)!=0){break}}if((d|0)!=0){h=c[8368]|0}else{h=c[8370]|0}c[a+224>>2]=h;hG(c[a>>2]|0,34);f=0;g=f;return g|0}}while(0);break};case 3:{do{if((c[a+80>>2]|0)==0){if((d|0)!=0){if((c[a+92>>2]|0)!=0){break}}if((d|0)!=0){i=c[8360]|0}else{i=c[8362]|0}c[a+224>>2]=i;hG(c[a>>2]|0,34);f=0;g=f;return g|0}}while(0);break};case 7:{L11445:do{if((d|0)==0){do{if((c[a+84>>2]|0)!=0){if((c[a+96>>2]|0)==0){break}if((c[a+76>>2]|0)==0){break}if((c[a+88>>2]|0)==0){break}if((c[a+80>>2]|0)==0){break}if((c[a+92>>2]|0)!=0){break L11445}}}while(0);c[a+224>>2]=c[8382];hG(c[a>>2]|0,34);f=0;g=f;return g|0}}while(0);L11456:do{if((d|0)!=0){if((c[a+84>>2]|0)!=0){j=8902}else{if((c[a+96>>2]|0)!=0){j=8902}}do{if((j|0)==8902){if((c[a+76>>2]|0)==0){if((c[a+88>>2]|0)==0){break}}if((c[a+80>>2]|0)!=0){break L11456}if((c[a+92>>2]|0)!=0){break L11456}}}while(0);c[a+224>>2]=c[8384];hG(c[a>>2]|0,34);f=0;g=f;return g|0}}while(0);break};case 6:{do{if((c[a+92>>2]|0)==0){if((d|0)!=0){if((c[a+80>>2]|0)!=0){break}}if((d|0)!=0){k=c[8360]|0}else{k=c[8356]|0}c[a+224>>2]=k;hG(c[a>>2]|0,34);f=0;g=f;return g|0}}while(0);break};case 2:{do{if((c[a+76>>2]|0)==0){if((d|0)!=0){if((c[a+88>>2]|0)!=0){break}}if((d|0)!=0){l=c[8376]|0}else{l=c[8378]|0}c[a+224>>2]=l;hG(c[a>>2]|0,34);f=0;g=f;return g|0}}while(0);break};case 4:{do{if((c[a+96>>2]|0)==0){if((d|0)!=0){if((c[a+84>>2]|0)!=0){break}}if((d|0)!=0){m=c[8368]|0}else{m=c[8364]|0}c[a+224>>2]=m;hG(c[a>>2]|0,34);f=0;g=f;return g|0}}while(0);break};case 5:{do{if((c[a+88>>2]|0)==0){if((d|0)!=0){if((c[a+76>>2]|0)!=0){break}}if((d|0)!=0){n=c[8376]|0}else{n=c[8372]|0}c[a+224>>2]=n;hG(c[a>>2]|0,34);f=0;g=f;return g|0}}while(0);break};default:{}}f=1;g=f;return g|0}function kl(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=a;a=d;d=e;L11520:do{if((c[d+156>>2]|0)==0){switch(c[d+104>>2]|0){case 33:case 34:case 35:case 31:case 32:case 16:{return};default:{break L11520}}}}while(0);do{if((c[144658]|0)>>>0>=7){e=0;if((b[f+22>>1]|0)>>>0<32768){do{if((b[f+22>>1]|0)>>>0>=24576){L11618:do{if((c[d+156>>2]|0)==0){do{if((b[f+22>>1]&3072|0)==0){if((b[f+22>>1]&32|0)==0){break}break L11618}}while(0);return}}while(0);if((b[f+24>>1]|0)!=0){e=34;break}return}else{do{if((b[f+22>>1]|0)>>>0>=16384){L11537:do{if((c[d+156>>2]|0)==0){do{if((b[f+22>>1]&3072|0)==0){if((b[f+22>>1]&32|0)==0){break}break L11537}}while(0);return}}while(0);if((b[f+24>>1]|0)!=0){e=6;break}return}else{do{if((b[f+22>>1]|0)>>>0>=15360){do{if((c[d+156>>2]|0)==0){if((b[f+22>>1]&128|0)==0){return}if((b[f+20>>1]&32|0)==0){break}return}}while(0);if((b[f+24>>1]|0)!=0){e=4;break}return}else{do{if((b[f+22>>1]|0)>>>0>=14336){if((c[d+156>>2]|0)==0){return}do{if((b[f+22>>1]&7|0)!=0){if((b[f+22>>1]&7|0)==1){break}return}}while(0);if((kk(f,c[d+156>>2]|0)|0)!=0){e=44;break}else{return}}else{do{if((b[f+22>>1]|0)>>>0>=13312){do{if((c[d+156>>2]|0)==0){if((b[f+22>>1]&32|0)!=0){break}return}}while(0);if((b[f+24>>1]|0)!=0){e=36;break}return}else{do{if((b[f+22>>1]|0)>>>0>=12288){do{if((c[d+156>>2]|0)==0){if((b[f+22>>1]&32|0)!=0){break}return}}while(0);if((b[f+24>>1]|0)!=0){e=38;break}return}}while(0)}}while(0)}}while(0)}}while(0)}}while(0)}}while(0)}if((e|0)==0){break}g=(b[f+22>>1]&7)>>0;if((g|0)==1){h=e;i=f;cb[h&63](i)|0;return}else if((g|0)==0){if((cb[e&63](f)|0)!=0){b[f+22>>1]=0}return}else{return}}}while(0);do{if((c[d+156>>2]|0)==0){g=0;switch(b[f+22>>1]|0){case 39:case 97:case 125:case 126:case 4:case 10:case 88:case 208:case 207:case 243:case 244:case 262:case 263:case 264:case 265:case 266:case 267:case 268:case 269:{g=1;break};default:{}}if((g|0)!=0){break}return}}while(0);if((kh(f)|0)==0){return}switch(b[f+22>>1]|0){case 25:{if((lM(f,5)|0)!=0){j=9059}else{if((c[144658]|0)>>>0<7){j=9059}}if((j|0)==9059){b[f+22>>1]=0}return};case 16:{if((mn(f,1)|0)!=0){j=9043}else{if((c[144658]|0)>>>0<7){j=9043}}if((j|0)==9043){b[f+22>>1]=0}return};case 108:{if((mn(f,5)|0)!=0){j=9134}else{if((c[144658]|0)>>>0<7){j=9134}}if((j|0)==9134){b[f+22>>1]=0}return};case 109:{if((mn(f,6)|0)!=0){j=9138}else{if((c[144658]|0)>>>0<7){j=9138}}if((j|0)==9138){b[f+22>>1]=0}return};case 39:{if((k0(f,a,d)|0)!=0){j=9083}else{if((c[144658]|0)>>>0<7){j=9083}}if((j|0)==9083){b[f+22>>1]=0}return};case 8:{if((n2(f,0)|0)!=0){j=9027}else{if((c[144658]|0)>>>0<7){j=9027}}if((j|0)==9027){b[f+22>>1]=0}return};case 36:{if((n$(f,2)|0)!=0){j=9071}else{if((c[144658]|0)>>>0<7){j=9071}}if((j|0)==9071){b[f+22>>1]=0}return};case 54:{if((eM(f)|0)!=0){j=9106}else{if((c[144658]|0)>>>0<7){j=9106}}if((j|0)==9106){b[f+22>>1]=0}return};case 3:{if((mn(f,2)|0)!=0){j=9011}else{if((c[144658]|0)>>>0<7){j=9011}}if((j|0)==9011){b[f+22>>1]=0}return};case 120:{eP(f,4,0)|0;return};case 126:{if((c[d+156>>2]|0)==0){g=f;i=a;h=d;k0(g,i,h)|0}return};case 128:{n$(f,4)|0;return};case 129:{n$(f,14)|0;return};case 38:{if((n$(f,1)|0)!=0){j=9079}else{if((c[144658]|0)>>>0<7){j=9079}}if((j|0)==9079){b[f+22>>1]=0}return};case 44:{if((lM(f,4)|0)!=0){j=9093}else{if((c[144658]|0)>>>0<7){j=9093}}if((j|0)==9093){b[f+22>>1]=0}return};case 10:{if((eP(f,1,0)|0)!=0){j=9031}else{if((c[144658]|0)>>>0<7){j=9031}}if((j|0)==9031){b[f+22>>1]=0}return};case 19:{if((n$(f,0)|0)!=0){j=9051}else{if((c[144658]|0)>>>0<7){j=9051}}if((j|0)==9051){b[f+22>>1]=0}return};case 104:{if((s8(f)|0)!=0){j=9130}else{if((c[144658]|0)>>>0<7){j=9130}}if((j|0)==9130){b[f+22>>1]=0}return};case 5:{if((n$(f,3)|0)!=0){j=9019}else{if((c[144658]|0)>>>0<7){j=9019}}if((j|0)==9019){b[f+22>>1]=0}return};case 72:{lM(f,4)|0;return};case 73:{lM(f,5)|0;return};case 74:{lI(f)|0;return};case 75:{mn(f,2)|0;return};case 76:{mn(f,1)|0;return};case 77:{lM(f,6)|0;return};case 79:{s9(f,35)|0;return};case 80:{s9(f,0)|0;return};case 81:{s9(f,255)|0;return};case 82:{n$(f,1)|0;return};case 94:{n$(f,13)|0;return};case 95:{eP(f,3,0)|0;return};case 96:{n$(f,8)|0;return};case 97:{k0(f,a,d)|0;return};case 98:{n$(f,2)|0;return};case 105:{mn(f,5)|0;return};case 106:{mn(f,6)|0;return};case 107:{mn(f,7)|0;return};case 22:{if((eP(f,3,0)|0)!=0){j=9055}else{if((c[144658]|0)>>>0<7){j=9055}}if((j|0)==9055){b[f+22>>1]=0}return};case 17:{if((s7(f)|0)!=0){j=9047}else{if((c[144658]|0)>>>0<7){j=9047}}if((j|0)==9047){b[f+22>>1]=0}return};case 119:{if((n$(f,4)|0)!=0){j=9146}else{if((c[144658]|0)>>>0<7){j=9146}}if((j|0)==9146){b[f+22>>1]=0}return};case 121:{if((eP(f,4,0)|0)!=0){j=9150}else{if((c[144658]|0)>>>0<7){j=9150}}if((j|0)==9150){b[f+22>>1]=0}return};case 141:{if((lM(f,7)|0)!=0){j=9168}else{if((c[144658]|0)>>>0<7){j=9168}}if((j|0)==9168){b[f+22>>1]=0}return};case 40:{if((c[144658]|0)>>>0<7){h=f;lM(h,1)|0;h=f;n$(h,1)|0;b[f+22>>1]=0}else{if((lM(f,1)|0)!=0){b[f+22>>1]=0}}return};case 6:{if((lM(f,6)|0)!=0){j=9023}else{if((c[144658]|0)>>>0<7){j=9023}}if((j|0)==9023){b[f+22>>1]=0}return};case 37:{if((n$(f,9)|0)!=0){j=9075}else{if((c[144658]|0)>>>0<7){j=9075}}if((j|0)==9075){b[f+22>>1]=0}return};case 2:{if((mn(f,3)|0)!=0){j=9007}else{if((c[144658]|0)>>>0<7){j=9007}}if((j|0)==9007){b[f+22>>1]=0}return};case 56:{if((n$(f,13)|0)!=0){j=9110}else{if((c[144658]|0)>>>0<7){j=9110}}if((j|0)==9110){b[f+22>>1]=0}return};case 83:{n$(f,0)|0;return};case 84:{n$(f,9)|0;return};case 86:{mn(f,3)|0;return};case 87:{eP(f,0,0)|0;return};case 88:{eP(f,1,0)|0;return};case 89:{eM(f)|0;return};case 90:{mn(f,0)|0;return};case 91:{n$(f,3)|0;return};case 92:{n$(f,10)|0;return};case 93:{n$(f,12)|0;return};case 52:{do{if((c[d+156>>2]|0)!=0){if((c[(c[d+156>>2]|0)+40>>2]|0)>0){j=9098;break}if((c[144675]|0)!=0){j=9098}}else{j=9098}}while(0);if((j|0)==9098){dp()}return};case 35:{if((s9(f,35)|0)!=0){j=9067}else{if((c[144658]|0)>>>0<7){j=9067}}if((j|0)==9067){b[f+22>>1]=0}return};case 125:{do{if((c[d+156>>2]|0)==0){if((k0(f,a,d)|0)==0){if((c[144658]|0)>>>0>=7){break}}b[f+22>>1]=0}}while(0);return};case 100:{if((n2(f,1)|0)!=0){j=9126}else{if((c[144658]|0)>>>0<7){j=9126}}if((j|0)==9126){b[f+22>>1]=0}return};case 13:{if((s9(f,255)|0)!=0){j=9039}else{if((c[144658]|0)>>>0<7){j=9039}}if((j|0)==9039){b[f+22>>1]=0}return};case 4:{if((mn(f,0)|0)!=0){j=9015}else{if((c[144658]|0)>>>0<7){j=9015}}if((j|0)==9015){b[f+22>>1]=0}return};case 57:{if((lI(f)|0)!=0){j=9114}else{if((c[144658]|0)>>>0<7){j=9114}}if((j|0)==9114){b[f+22>>1]=0}return};case 58:{if((n$(f,10)|0)!=0){j=9118}else{if((c[144658]|0)>>>0<7){j=9118}}if((j|0)==9118){b[f+22>>1]=0}return};case 124:{do{if((c[d+156>>2]|0)!=0){if((c[(c[d+156>>2]|0)+40>>2]|0)>0){j=9155;break}if((c[144675]|0)!=0){j=9155}}else{j=9155}}while(0);if((j|0)==9155){dr()}return};case 53:{if((eP(f,0,0)|0)!=0){j=9102}else{if((c[144658]|0)>>>0<7){j=9102}}if((j|0)==9102){b[f+22>>1]=0}return};case 59:{if((n$(f,12)|0)!=0){j=9122}else{if((c[144658]|0)>>>0<7){j=9122}}if((j|0)==9122){b[f+22>>1]=0}return};case 30:{if((n$(f,8)|0)!=0){j=9063}else{if((c[144658]|0)>>>0<7){j=9063}}if((j|0)==9063){b[f+22>>1]=0}return};case 110:{if((mn(f,7)|0)!=0){j=9142}else{if((c[144658]|0)>>>0<7){j=9142}}if((j|0)==9142){b[f+22>>1]=0}return};case 130:{if((n$(f,14)|0)!=0){j=9164}else{if((c[144658]|0)>>>0<7){j=9164}}if((j|0)==9164){b[f+22>>1]=0}return};case 12:{if((s9(f,0)|0)!=0){j=9035}else{if((c[144658]|0)>>>0<7){j=9035}}if((j|0)==9035){b[f+22>>1]=0}return};default:{if((c[144658]|0)>>>0>=7){switch(b[f+22>>1]|0){case 232:{n5(f,1)|0;break};case 236:{n5(f,2)|0;break};case 244:{k4(f,a,d,0)|0;break};case 263:{k4(f,a,d,1)|0;break};case 265:{if((c[d+156>>2]|0)==0){j=f;h=a;i=d;k4(j,h,i,1)|0}break};case 267:{if((c[d+156>>2]|0)==0){i=f;h=a;j=d;k4(i,h,j,0)|0}break};case 157:{s8(f)|0;break};case 201:{lM(f,2)|0;break};case 202:{lM(f,3)|0;break};case 208:{k2(f,a,d)|0;break};case 212:{eP(f,7,0)|0;break};case 154:{n0(f,0)|0;break};case 240:{n0(f,1)|0;break};case 220:{n$(f,5)|0;break};case 228:{n5(f,0)|0;break};case 269:{if((c[d+156>>2]|0)==0){j=f;h=a;i=d;k2(j,h,i)|0}break};case 153:{if((n0(f,0)|0)!=0){b[f+22>>1]=0}break};case 239:{if((n0(f,1)|0)!=0){b[f+22>>1]=0}break};case 219:{if((n$(f,5)|0)!=0){b[f+22>>1]=0}break};case 200:{if((lM(f,3)|0)!=0){b[f+22>>1]=0}break};case 207:{if((k2(f,a,d)|0)!=0){b[f+22>>1]=0}break};case 264:{do{if((c[d+156>>2]|0)==0){if((k4(f,a,d,1)|0)==0){break}b[f+22>>1]=0}}while(0);break};case 142:{if((n$(f,16)|0)!=0){b[f+22>>1]=0}break};case 143:{if((eP(f,2,24)|0)!=0){b[f+22>>1]=0}break};case 148:{eP(f,2,24)|0;break};case 149:{eP(f,2,32)|0;break};case 150:{lM(f,7)|0;break};case 151:{lM(f,1)|0;n$(f,1)|0;break};case 152:{lM(f,0)|0;break};case 256:{n2(f,0)|0;break};case 257:{n2(f,1)|0;break};case 155:{n4(f)|0;break};case 156:{s7(f)|0;break};case 227:{if((n5(f,0)|0)!=0){b[f+22>>1]=0}break};case 231:{if((n5(f,1)|0)!=0){b[f+22>>1]=0}break};case 266:{do{if((c[d+156>>2]|0)==0){if((k4(f,a,d,0)|0)==0){break}b[f+22>>1]=0}}while(0);break};case 268:{do{if((c[d+156>>2]|0)==0){if((k2(f,a,d)|0)==0){break}b[f+22>>1]=0}}while(0);break};case 147:{n$(f,16)|0;break};case 146:{if((n4(f)|0)!=0){b[f+22>>1]=0}break};case 199:{if((lM(f,2)|0)!=0){b[f+22>>1]=0}break};case 144:{if((eP(f,2,32)|0)!=0){b[f+22>>1]=0}break};case 145:{if((lM(f,0)|0)!=0){b[f+22>>1]=0}break};case 235:{if((n5(f,2)|0)!=0){b[f+22>>1]=0}break};case 243:{if((k4(f,a,d,0)|0)!=0){b[f+22>>1]=0}break};case 262:{if((k4(f,a,d,1)|0)!=0){b[f+22>>1]=0}break};default:{}}}return}}}function km(a,d){a=a|0;d=d|0;var e=0,f=0,g=0;e=a;a=d;do{if((c[144658]|0)>>>0>=7){d=0;if((b[a+22>>1]|0)>>>0<32768){do{if((b[a+22>>1]|0)>>>0>=24576){L12141:do{if((c[e+156>>2]|0)==0){do{if((b[a+22>>1]&3072|0)==0){if((b[a+22>>1]&32|0)==0){break}break L12141}}while(0);return}}while(0);if((b[a+24>>1]|0)!=0){d=34;break}return}else{do{if((b[a+22>>1]|0)>>>0>=16384){L12238:do{if((c[e+156>>2]|0)==0){do{if((b[a+22>>1]&3072|0)==0){if((b[a+22>>1]&32|0)==0){break}break L12238}}while(0);return}}while(0);if((b[a+24>>1]|0)!=0){d=6;break}return}else{do{if((b[a+22>>1]|0)>>>0>=15360){do{if((c[e+156>>2]|0)==0){if((b[a+22>>1]&128|0)==0){return}if((b[a+20>>1]&32|0)==0){break}return}}while(0);if((b[a+24>>1]|0)!=0){d=4;break}return}else{do{if((b[a+22>>1]|0)>>>0>=14336){if((c[e+156>>2]|0)==0){return}do{if((b[a+22>>1]&7|0)!=4){if((b[a+22>>1]&7|0)==5){break}return}}while(0);if((kk(a,c[e+156>>2]|0)|0)==0){return}if((b[a+24>>1]|0)!=0){d=44;break}return}else{if((b[a+22>>1]|0)>>>0>=13312){do{if((c[e+156>>2]|0)==0){if((b[a+22>>1]&32|0)!=0){break}return}}while(0);d=36}else{do{if((b[a+22>>1]|0)>>>0>=12288){do{if((c[e+156>>2]|0)==0){if((b[a+22>>1]&32|0)!=0){break}return}}while(0);if((b[a+24>>1]|0)!=0){d=38;break}return}else{do{if((b[a+22>>1]|0)>>>0>=12160){do{if((c[e+156>>2]|0)==0){if((b[a+22>>1]&32|0)!=0){break}return}}while(0);if((b[a+24>>1]|0)!=0){d=52;break}return}}while(0)}}while(0)}}}while(0)}}while(0)}}while(0)}}while(0)}if((d|0)==0){break}f=(b[a+22>>1]&7)>>0;if((f|0)==5){if((cb[d&63](a)|0)!=0){kY(a,1)}return}else if((f|0)==4){if((cb[d&63](a)|0)!=0){kY(a,0)}return}else{return}}}while(0);do{if((c[e+156>>2]|0)==0){f=0;if((b[a+22>>1]|0)==46){f=1}if((f|0)!=0){break}return}}while(0);if((kh(a)|0)==0){return}f=b[a+22>>1]|0;if((f|0)==24){if((n$(a,3)|0)!=0){g=9487}else{if((c[144658]|0)>>>0<7){g=9487}}if((g|0)==9487){kY(a,0)}return}else if((f|0)==47){if((eP(a,3,0)|0)!=0){g=9492}else{if((c[144658]|0)>>>0<7){g=9492}}if((g|0)==9492){kY(a,0)}return}else if((f|0)==46){mn(a,3)|0;kY(a,1);return}else{if((c[144658]|0)>>>0>=7){f=b[a+22>>1]|0;L12303:do{if((f|0)==197){do{if((c[e+156>>2]|0)!=0){if((c[(c[e+156>>2]|0)+40>>2]|0)>0){break}if((c[144675]|0)!=0){break}break L12303}}while(0);kY(a,0);dp()}else if((f|0)==198){do{if((c[e+156>>2]|0)!=0){if((c[(c[e+156>>2]|0)+40>>2]|0)>0){break}if((c[144675]|0)!=0){break}break L12303}}while(0);kY(a,0);dr()}}while(0)}return}}function kn(a){a=a|0;var d=0,e=0,f=0;d=a;a=c[c[(c[d>>2]|0)+64>>2]>>2]|0;if((c[(c[d>>2]|0)+32>>2]|0)!=(c[a+12>>2]|0)){return}if((b[a+190>>1]|0)>=32){e=(b[a+190>>1]&96)>>5;if((e|0)==2){if((c[d+64>>2]|0)==0){if((c[113660]&31|0)==0){oO(c[d>>2]|0,0,0,10)}}}else if((e|0)==3){if((c[d+64>>2]|0)!=0){if((lm(25)|0)<5){f=9578}}else{f=9578}if((f|0)==9578){if((c[113660]&31|0)==0){oO(c[d>>2]|0,0,0,20)}}}else if((e|0)!=0)if((e|0)==1){if((c[d+64>>2]|0)==0){if((c[113660]&31|0)==0){oO(c[d>>2]|0,0,0,5)}}}if((b[a+190>>1]&128|0)!=0){e=d+220|0;c[e>>2]=(c[e>>2]|0)+1;e=a+190|0;b[e>>1]=b[e>>1]&-129&65535;if((b[a+190>>1]|0)<32){b[a+190>>1]=0}}return}switch(b[a+190>>1]|0){case 7:{if((c[d+64>>2]|0)==0){if((c[113660]&31|0)==0){oO(c[d>>2]|0,0,0,5)}}break};case 9:{e=d+220|0;c[e>>2]=(c[e>>2]|0)+1;b[a+190>>1]=0;break};case 5:{if((c[d+64>>2]|0)==0){if((c[113660]&31|0)==0){oO(c[d>>2]|0,0,0,10)}}break};case 11:{if((c[144668]|0)!=0){a=d+204|0;c[a>>2]=c[a>>2]&-3}if((c[113660]&31|0)==0){oO(c[d>>2]|0,0,0,20)}if((c[d+40>>2]|0)<=10){dp()}break};case 16:case 4:{if((c[d+64>>2]|0)!=0){if((lm(25)|0)<5){f=9550}}else{f=9550}if((f|0)==9550){if((c[113660]&31|0)==0){oO(c[d>>2]|0,0,0,20)}}break};default:{}}return}function ko(){var a=0,d=0;a=c[111126]|0;while(1){d=a-1|0;a=d;if((d|0)<0){break}c[(c[108410]|0)+(a*196|0)+24>>2]=-1}a=c[111126]|0;while(1){d=a-1|0;a=d;if((d|0)<0){break}d=((b[(c[108410]|0)+(a*196|0)+194>>1]|0)>>>0)%((c[111126]|0)>>>0)|0;c[(c[108410]|0)+(a*196|0)+20>>2]=c[(c[108410]|0)+(d*196|0)+24>>2];c[(c[108410]|0)+(d*196|0)+24>>2]=a}a=c[111132]|0;while(1){d=a-1|0;a=d;if((d|0)<0){break}c[(c[113656]|0)+(a*124|0)+72>>2]=-1}a=c[111132]|0;while(1){d=a-1|0;a=d;if((d|0)<0){break}d=((b[(c[113656]|0)+(a*124|0)+24>>1]|0)>>>0)%((c[111132]|0)>>>0)|0;c[(c[113656]|0)+(a*124|0)+76>>2]=c[(c[113656]|0)+(d*124|0)+72>>2];c[(c[113656]|0)+(d*124|0)+72>>2]=a}return}function kp(){var a=0,d=0,f=0,g=0,h=0,i=0,j=0;if((c[113662]|0)==1){c[113664]=(c[113664]|0)-1;if((c[113664]|0)==0){dp()}}if((c[113668]|0)==1){a=0;d=0;while(1){if((d|0)>=4){break}if((c[444120+(d<<2)>>2]|0)!=0){f=0;g=0;while(1){if((g|0)>=4){break}if((c[444120+(g<<2)>>2]|0)!=0){if((g|0)!=(d|0)){h=c[443064+(d*288|0)+(g<<2)>>2]|0}else{h=-(c[443064+(d*288|0)+(g<<2)>>2]|0)|0}f=f+h|0}g=g+1|0}if((f|0)>=(c[113666]|0)){a=1}if((a|0)==1){i=9625;break}}d=d+1|0}if((a|0)==1){dp()}}a=c[156100]|0;while(1){if(a>>>0>=(c[113678]|0)>>>0){break}j=c[a+8>>2]|0;while(1){if((j|0)>=((c[a+8>>2]|0)+(c[a+12>>2]|0)|0)){break}d=(c[a+8>>2]|0)+((((c[113660]|0)/(c[a+16>>2]|0)|0)+j|0)%(c[a+12>>2]|0)|0)|0;if((c[a>>2]|0)!=0){c[(c[100456]|0)+(j<<2)>>2]=d}else{c[(c[124828]|0)+(j<<2)>>2]=d}j=j+1|0}a=a+20|0}j=0;while(1){if((j|0)>=16){break}if((c[619348+(j*20|0)>>2]|0)!=0){a=619348+(j*20|0)|0;c[a>>2]=(c[a>>2]|0)-1;if((c[619348+(j*20|0)>>2]|0)==0){a=c[619340+(j*20|0)>>2]|0;if((a|0)==0){b[(c[105236]|0)+((e[(c[619336+(j*20|0)>>2]|0)+26>>1]|0)*24|0)+8>>1]=c[619344+(j*20|0)>>2]&65535}else if((a|0)==1){b[(c[105236]|0)+((e[(c[619336+(j*20|0)>>2]|0)+26>>1]|0)*24|0)+12>>1]=c[619344+(j*20|0)>>2]&65535}else if((a|0)==2){b[(c[105236]|0)+((e[(c[619336+(j*20|0)>>2]|0)+26>>1]|0)*24|0)+10>>1]=c[619344+(j*20|0)>>2]&65535}a=c[619352+(j*20|0)>>2]|0;if((c[144681]|0)!=0){i=9652}else{if((c[144658]|0)>>>0<17){i=9652}}if((i|0)==9652){i=0;a=619352+(j*20|0)|0}hG(a,23);wS(619336+(j*20|0)|0,0,20)}}j=j+1|0}return}function kq(){var a=0,d=0,f=0,g=0,h=0;a=1;if((oq(134128,0)|0)>=0){a=2}c[113662]=0;a=fw(117296)|0;do{if((a|0)!=0){if((c[144588]|0)==0){break}c[113662]=1;c[113664]=42e3}}while(0);a=fw(110112)|0;do{if((a|0)!=0){if((c[144588]|0)==0){break}d=((bw(c[(c[113378]|0)+(a+1<<2)>>2]|0)|0)*60|0)*35|0;c[113662]=1;c[113664]=d}}while(0);c[113668]=0;a=fw(105392)|0;do{if((a|0)!=0){if((c[144588]|0)==0){break}d=bw(c[(c[113378]|0)+(a+1<<2)>>2]|0)|0;if((d|0)<=0){d=10}c[113668]=1;c[113666]=d}}while(0);d=c[108410]|0;a=0;while(1){if((a|0)>=(c[111126]|0)){break}if((b[d+190>>1]|0)!=0){if((b[d+190>>1]&128|0)!=0){c[100374]=(c[100374]|0)+1}switch(b[d+190>>1]&31|0){case 9:{if((b[d+190>>1]|0)<32){c[100374]=(c[100374]|0)+1}break};case 3:{s5(d,35,0);break};case 12:{s5(d,35,1);break};case 2:{s5(d,15,0);break};case 13:{s5(d,15,1);break};case 1:{s4(d);break};case 14:{mq(d,a);break};case 8:{s6(d);break};case 4:{s5(d,15,0);f=d+190|0;b[f>>1]=(b[f>>1]|96)&65535;break};case 10:{mp(d);break};case 17:{s3(d);break};default:{}}}a=a+1|0;d=d+196|0}lO();eR();a=0;while(1){if((a|0)>=16){break}wS(619336+(a*20|0)|0,0,20);a=a+1|0}ko();ks();kt();ku();a=0;while(1){if((a|0)>=(c[111132]|0)){break}switch(b[(c[113656]|0)+(a*124|0)+22>>1]|0){case 271:case 272:{g=-1;while(1){d=j6((c[113656]|0)+(a*124|0)|0,g)|0;g=d;if((d|0)<0){break}c[(c[108410]|0)+(g*196|0)+156>>2]=a|-2147483648}break};case 261:{h=((c[(c[105236]|0)+((e[(c[113656]|0)+(a*124|0)+26>>1]|0)*24|0)+16>>2]|0)-(c[108410]|0)|0)/196|0;g=-1;while(1){d=j6((c[113656]|0)+(a*124|0)|0,g)|0;g=d;if((d|0)<0){break}c[(c[108410]|0)+(g*196|0)+180>>2]=h}break};case 213:{h=((c[(c[105236]|0)+((e[(c[113656]|0)+(a*124|0)+26>>1]|0)*24|0)+16>>2]|0)-(c[108410]|0)|0)/196|0;g=-1;while(1){d=j6((c[113656]|0)+(a*124|0)|0,g)|0;g=d;if((d|0)<0){break}c[(c[108410]|0)+(g*196|0)+176>>2]=h}break};case 242:{h=((c[(c[105236]|0)+((e[(c[113656]|0)+(a*124|0)+26>>1]|0)*24|0)+16>>2]|0)-(c[108410]|0)|0)/196|0;g=-1;while(1){d=j6((c[113656]|0)+(a*124|0)|0,g)|0;g=d;if((d|0)<0){break}c[(c[108410]|0)+(g*196|0)+128>>2]=h}break};default:{}}a=a+1|0}return}function kr(a,b){a=a|0;b=b|0;var c=0;c=a;a=b;b=w9(c,(c|0)<0?-1:0,a,(a|0)<0?-1:0)|0;a=F;a>>16|((a|0)<0?-1:0)<<16;return b>>>16|a<<16|0}function ks(){var a=0,d=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;a=c[113656]|0;d=0;while(1){if((d|0)>=(c[111132]|0)){break}f=c[a+12>>2]>>5;g=c[a+16>>2]>>5;h=-1;i=0;j=b[a+22>>1]|0;do{if((j|0)>=245){if((j|0)>249){k=9725;break}j=j+5|0;h=((c[(c[105236]|0)+((e[a+26>>1]|0)*24|0)+16>>2]|0)-(c[108410]|0)|0)/196|0}else{k=9725}}while(0);if((k|0)==9725){k=0;do{if((j|0)>=214){if((j|0)>218){break}i=1;j=j+36|0;h=((c[(c[105236]|0)+((e[a+26>>1]|0)*24|0)+16>>2]|0)-(c[108410]|0)|0)/196|0}}while(0)}L12584:do{switch(j|0){case 48:{kC(0,65536,0,-1,e[(c[113656]|0)+(d*124|0)+26>>1]|0,i);break};case 252:{k=9740;break};case 254:{l=-1;while(1){m=j7(a,l)|0;l=m;if((m|0)<0){break}if((l|0)!=(d|0)){kH(f,g,(c[113656]|0)+(l*124|0)|0,h,i)}}break};case 85:{kC(0,-65536,0,-1,e[(c[113656]|0)+(d*124|0)+26>>1]|0,i);break};case 250:{l=-1;while(1){m=j6(a,l)|0;l=m;if((m|0)<0){break}kC(2,-f|0,g,h,l,i)}break};case 255:{l=e[(c[113656]|0)+(d*124|0)+26>>1]|0;kC(0,-(c[(c[105236]|0)+(l*24|0)>>2]|0)|0,c[(c[105236]|0)+(l*24|0)+4>>2]|0,-1,l,i);break};case 251:case 253:{l=-1;while(1){m=j6(a,l)|0;l=m;if((m|0)<0){break}kC(1,-f|0,g,h,l,i)}if((j|0)!=253){break L12584}else{k=9740;break L12584}break};default:{}}}while(0);if((k|0)==9740){k=0;f=kr(f,6144)|0;g=kr(g,6144)|0;l=-1;while(1){j=j6(a,l)|0;l=j;if((j|0)<0){break}kC(3,f,g,h,l,i)}}d=d+1|0;a=a+124|0}return}function kt(){var a=0,d=0,e=0,f=0,g=0,h=0;a=c[113656]|0;d=0;while(1){if((d|0)>=(c[111126]|0)){break}c[(c[108410]|0)+(d*196|0)+96>>2]=59392;c[(c[108410]|0)+(d*196|0)+100>>2]=2048;d=d+1|0}d=0;while(1){if((d|0)>=(c[111132]|0)){break}if((b[a+22>>1]|0)==223){e=((((ui(c[a+12>>2]|0,c[a+16>>2]|0)|0)>>16)*7864|0|0)/128|0)+53248|0;if((e|0)>59392){f=((65682-e|0)*112|0|0)/344|0}else{f=((e-56116|0)*10|0|0)/128|0}if((c[144658]|0)>>>0>=11){if((e|0)>65536){e=65536}if((e|0)<0){e=0}if((f|0)<32){f=32}}g=-1;while(1){h=j6(a,g)|0;g=h;if((h|0)<0){break}do{if((c[144658]|0)>>>0>=7){if((c[144658]|0)>>>0>=11){break}kB(e,f,g)}}while(0);c[(c[108410]|0)+(g*196|0)+96>>2]=e;c[(c[108410]|0)+(g*196|0)+100>>2]=f}}d=d+1|0;a=a+124|0}return}function ku(){var a=0,d=0,e=0,f=0,g=0;a=c[113656]|0;d=0;while(1){if((d|0)>=(c[111132]|0)){break}e=b[a+22>>1]|0;if((e|0)==225){f=-1;while(1){g=j6(a,f)|0;f=g;if((g|0)<0){break}kA(3,c[a+12>>2]|0,c[a+16>>2]|0,0,f)}}else if((e|0)==226){f=-1;while(1){g=j6(a,f)|0;f=g;if((g|0)<0){break}g=kx(f)|0;if((g|0)!=0){kA(0,c[a+12>>2]|0,c[a+16>>2]|0,g,f)}}}else if((e|0)==224){f=-1;while(1){g=j6(a,f)|0;f=g;if((g|0)<0){break}kA(2,c[a+12>>2]|0,c[a+16>>2]|0,0,f)}}d=d+1|0;a=a+124|0}return}function kv(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=a;a=c[b+24>>2]|0;d=c[b+28>>2]|0;if((c[b+36>>2]|0)!=-1){e=(c[(c[108410]|0)+((c[b+36>>2]|0)*196|0)+12>>2]|0)+(c[(c[108410]|0)+((c[b+36>>2]|0)*196|0)+16>>2]|0)|0;f=e-(c[b+40>>2]|0)|0;c[b+40>>2]=e;a=kr(a,f)|0;d=kr(d,f)|0}if((c[b+52>>2]|0)!=0){f=a+(c[b+44>>2]|0)|0;a=f;c[b+44>>2]=f;f=d+(c[b+48>>2]|0)|0;d=f;c[b+48>>2]=f}if((a|d|0)==0){return}switch(c[b+56>>2]|0){case 4:{return};case 3:{g=(c[108410]|0)+((c[b+32>>2]|0)*196|0)|0;f=c[g+12>>2]|0;do{if((c[g+128>>2]|0)!=-1){if((c[(c[108410]|0)+((c[g+128>>2]|0)*196|0)+12>>2]|0)<=(f|0)){h=9817;break}i=c[(c[108410]|0)+((c[g+128>>2]|0)*196|0)+12>>2]|0}else{h=9817}}while(0);if((h|0)==9817){i=-2147483648}e=i;i=c[g+144>>2]|0;while(1){if((i|0)==0){break}j=c[i+4>>2]|0;k=j;l=j+120|0;do{if(!((c[l>>2]&4096|0)!=0|(c[l+4>>2]&0|0)!=0)){j=k+120|0;if((c[j>>2]&512|0)!=0|(c[j+4>>2]&0|0)!=0){h=9823}else{if((c[k+32>>2]|0)>(f|0)){h=9823}}if((h|0)==9823){h=0;if((c[k+32>>2]|0)>=(e|0)){break}}j=k+88|0;c[j>>2]=(c[j>>2]|0)+a;j=k+92|0;c[j>>2]=(c[j>>2]|0)+d}}while(0);i=c[i+20>>2]|0}return};case 0:{i=(c[105236]|0)+((c[b+32>>2]|0)*24|0)|0;e=i|0;c[e>>2]=(c[e>>2]|0)+a;e=i+4|0;c[e>>2]=(c[e>>2]|0)+d;return};case 1:{g=(c[108410]|0)+((c[b+32>>2]|0)*196|0)|0;e=g+160|0;c[e>>2]=(c[e>>2]|0)+a;e=g+164|0;c[e>>2]=(c[e>>2]|0)+d;return};case 2:{g=(c[108410]|0)+((c[b+32>>2]|0)*196|0)|0;b=g+168|0;c[b>>2]=(c[b>>2]|0)+a;a=g+172|0;c[a>>2]=(c[a>>2]|0)+d;return};default:{return}}}function kw(a){a=a|0;var d=0,e=0,f=0,g=0,h=0;d=a;do{if((c[144658]|0)>>>0>7){if((c[250]|0)==0){break}a=(c[108410]|0)+((c[d+32>>2]|0)*196|0)|0;if((b[a+190>>1]&256|0)==0){return}e=c[a+144>>2]|0;while(1){if((e|0)==0){break}f=c[e+4>>2]|0;do{if((c[f+156>>2]|0)!=0){g=f+120|0;if((c[g>>2]&4608|0)!=0|(c[g+4>>2]&0|0)!=0){break}if((c[f+32>>2]|0)>(c[a+12>>2]|0)){break}if((c[f+180>>2]|0)==59392){h=9849}else{if((c[d+24>>2]|0)<(c[f+180>>2]|0)){h=9849}}if((h|0)==9849){h=0;c[f+180>>2]=c[d+24>>2];c[f+184>>2]=c[d+28>>2]}}}while(0);e=c[e+20>>2]|0}return}}while(0);return}function kx(a){a=a|0;var b=0,d=0,e=0,f=0;b=c[(c[108410]|0)+(a*196|0)+92>>2]|0;while(1){if((b|0)==0){d=9862;break}a=c[b+104>>2]|0;if((a|0)==137|(a|0)==138){d=9859;break}b=c[b+36>>2]|0}if((d|0)==9859){e=b;f=e;return f|0}else if((d|0)==9862){e=0;f=e;return f|0}return 0}function ky(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=a;a=0;if((c[22386]|0)==0){return}e=(c[108410]|0)+((c[d+56>>2]|0)*196|0)|0;if((b[e+190>>1]&512|0)==0){return}if((c[d+24>>2]|0)==0){c[100406]=d;f=c[d+44>>2]|0;c[100414]=(c[d+52>>2]|0)+f;c[100415]=(c[d+52>>2]|0)-f;c[100417]=(c[d+48>>2]|0)+f;c[100416]=(c[d+48>>2]|0)-f;f=(c[100417]|0)-(c[154950]|0)+2097152>>23;g=(c[100415]|0)-(c[154948]|0)-2097152>>23;h=(c[100414]|0)-(c[154948]|0)+2097152>>23;i=(c[100416]|0)-(c[154950]|0)-2097152>>23;while(1){if((i|0)>(f|0)){break}j=g;while(1){if((j|0)>(h|0)){break}uA(i,j,30)|0;j=j+1|0}i=i+1|0}return}if((c[e+128>>2]|0)!=-1){a=c[(c[108410]|0)+((c[e+128>>2]|0)*196|0)+12>>2]|0}i=c[e+144>>2]|0;while(1){if((i|0)==0){break}h=c[i+4>>2]|0;do{if((c[h+156>>2]|0)!=0){g=h+120|0;if((c[g>>2]&4608|0)!=0|(c[g+4>>2]&0|0)!=0){k=9886;break}if((c[d+24>>2]|0)==2){if((c[e+128>>2]|0)==-1){if((c[h+32>>2]|0)>(c[h+68>>2]|0)){l=c[d+32>>2]|0;m=c[d+36>>2]|0}else{l=c[d+32>>2]>>1;m=c[d+36>>2]>>1}}else{if((c[h+32>>2]|0)>(a|0)){l=c[d+32>>2]|0;m=c[d+36>>2]|0}else{if((c[(c[h+156>>2]|0)+16>>2]|0)<(a|0)){m=0;l=0}else{l=c[d+32>>2]>>1;m=c[d+36>>2]>>1}}}}else{if((c[e+128>>2]|0)==-1){if((c[h+32>>2]|0)>(c[e+12>>2]|0)){m=0;l=0}else{l=c[d+32>>2]|0;m=c[d+36>>2]|0}}else{if((c[h+32>>2]|0)>(a|0)){m=0;l=0}else{l=c[d+32>>2]|0;m=c[d+36>>2]|0}}}g=h+88|0;c[g>>2]=(c[g>>2]|0)+(l<<9);g=h+92|0;c[g>>2]=(c[g>>2]|0)+(m<<9)}else{k=9886}}while(0);if((k|0)==9886){k=0}i=c[i+20>>2]|0}return}function kz(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;b=a;do{if((c[144658]|0)>>>0>=11){if((c[b+132>>2]|0)>0){if((c[(c[b+108>>2]|0)+12>>2]|0)==0){d=9923}}else{d=9923}do{if((d|0)==9923){a=b+120|0;if((c[a>>2]&4|0)!=0|(c[a+4>>2]&0|0)!=0){break}return 1}}while(0);a=b+120|0;if(!((c[a>>2]&4096|0)!=0|(c[a+4>>2]&0|0)!=0)){break}return 1}else{if((c[b+156>>2]|0)==0){return 1}a=b+120|0;if(!((c[a>>2]&4608|0)!=0|(c[a+4>>2]&0|0)!=0)){break}return 1}}while(0);d=c[(c[100406]|0)+48>>2]|0;a=c[(c[100406]|0)+52>>2]|0;e=c[(c[100406]|0)+40>>2]|0;f=e-((ui((c[b+24>>2]|0)-d|0,(c[b+28>>2]|0)-a|0)|0)>>16>>1)<<8;do{if((f|0)>0){if((c[144658]|0)>>>0<11){break}e=(c[b+24>>2]|0)-d>>16;g=(c[b+28>>2]|0)-a>>16;h=c[(c[100406]|0)+40>>2]|0;i=h;j=ab(e,e)|0;e=j+(ab(g,g)|0)+1|0;g=xa(i<<23|0>>>9,((h|0)<0?-1:0)<<23|i>>>9,e,(e|0)<0?-1:0)|0;f=g}}while(0);do{if((f|0)>0){if((ia(b,c[(c[100406]|0)+28>>2]|0)|0)==0){break}g=t_(c[b+24>>2]|0,c[b+28>>2]|0,d,a)|0;if((c[(c[(c[100406]|0)+28>>2]|0)+104>>2]|0)==137){g=g-2147483648|0}g=g>>>19;e=kr(f,c[(c[15024]|0)+(g<<2)>>2]|0)|0;i=b+88|0;c[i>>2]=(c[i>>2]|0)+e;e=kr(f,c[515760+(g<<2)>>2]|0)|0;g=b+92|0;c[g>>2]=(c[g>>2]|0)+e}}while(0);return 1}function kA(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;g=e;e=f;f=ug(60,5,0)|0;c[f+8>>2]=452;c[f+28>>2]=g;c[f+24>>2]=a;c[f+32>>2]=b>>16;c[f+36>>2]=d>>16;c[f+40>>2]=ui(c[f+32>>2]|0,c[f+36>>2]|0)|0;if((g|0)==0){h=e;i=f;j=i+56|0;c[j>>2]=h;k=f;l=k|0;lu(l);return}c[f+44>>2]=c[f+40>>2]<<17;c[f+48>>2]=c[(c[f+28>>2]|0)+24>>2];c[f+52>>2]=c[(c[f+28>>2]|0)+28>>2];h=e;i=f;j=i+56|0;c[j>>2]=h;k=f;l=k|0;lu(l);return}function kB(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=ug(36,5,0)|0;c[e+8>>2]=476;c[e+24>>2]=a;c[e+28>>2]=b;c[e+32>>2]=d;lu(e|0);return}function kC(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0;h=e;e=f;f=ug(60,5,0)|0;c[f+8>>2]=474;c[f+56>>2]=a;c[f+24>>2]=b;c[f+28>>2]=d;c[f+52>>2]=g;c[f+48>>2]=0;c[f+44>>2]=0;g=h;c[f+36>>2]=g;if((g|0)==-1){i=e;j=f;k=j+32|0;c[k>>2]=i;l=f;m=l|0;lu(m);return}c[f+40>>2]=(c[(c[108410]|0)+(h*196|0)+12>>2]|0)+(c[(c[108410]|0)+(h*196|0)+16>>2]|0);i=e;j=f;k=j+32|0;c[k>>2]=i;l=f;m=l|0;lu(m);return}function kD(){return}function kE(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0;c=a;a=b;b=c;d=b>>31;e=a;f=e>>31;if(((b^d)-d|0)>>>14>>>0>=((e^f)-f|0)>>>0){g=(c^a)>>31^2147483647;return g|0}else{f=c;c=f;e=a;a=w7(c<<16|0>>>16,((f|0)<0?-1:0)<<16|c>>>16,e,(e|0)<0?-1:0)|0;g=a;return g|0}return 0}function kF(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;i=a;c[i>>2]=b;c[i+4>>2]=d;c[i+12>>2]=0;c[i+8>>2]=h;c[i+16>>2]=f;c[i+20>>2]=g;c[i+24>>2]=e;return}function kG(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;h=a;c[h>>2]=b;c[h+4>>2]=d;c[h+8>>2]=-1;c[h+12>>2]=f;c[h+16>>2]=g;c[h+20>>2]=e;return}function kH(a,d,e,f,g){a=a|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;h=a;a=d;d=e;e=f;f=g;g=c[d+12>>2]|0;i=g>>31;j=(g^i)-i|0;i=c[d+16>>2]|0;g=i>>31;k=(i^g)-g|0;if((k|0)>(j|0)){l=j;j=k;k=l}l=kE(j,c[515760+(((c[402008+((kE(k,j)|0)>>5<<2)>>2]|0)+1073741824|0)>>>19<<2)>>2]|0)|0;if((c[144658]|0)>>>0>=10){g=a;i=c[d+16>>2]|0;m=w0(0,0,i,(i|0)<0?-1:0)|0;i=w9(g,(g|0)<0?-1:0,m,F)|0;m=F;g=h;n=c[d+12>>2]|0;o=w9(g,(g|0)<0?-1:0,n,(n|0)<0?-1:0)|0;n=w0(i,m,o,F)|0;o=l;m=w7(n,F,o,(o|0)<0?-1:0)|0;j=m;m=a;o=c[d+12>>2]|0;n=w9(m,(m|0)<0?-1:0,o,(o|0)<0?-1:0)|0;o=F;m=h;i=c[d+16>>2]|0;g=w9(m,(m|0)<0?-1:0,i,(i|0)<0?-1:0)|0;i=w0(n,o,g,F)|0;g=l;o=w7(i,F,g,(g|0)<0?-1:0)|0;k=o;p=j;q=k;r=e;s=d;t=s+26|0;u=t|0;v=b[u>>1]|0;w=v&65535;x=f;kC(0,p,q,r,w,x);return}else{o=kr(a,c[d+16>>2]|0)|0;j=-(kE(o+(kr(h,c[d+12>>2]|0)|0)|0,l)|0)|0;o=kr(h,c[d+16>>2]|0)|0;k=-(kE(o-(kr(a,c[d+12>>2]|0)|0)|0,l)|0)|0;p=j;q=k;r=e;s=d;t=s+26|0;u=t|0;v=b[u>>1]|0;w=v&65535;x=f;kC(0,p,q,r,w,x);return}}function kI(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=a;if((c[c[e+20>>2]>>2]|0)==0){return}kJ(e,b,d);return}function kJ(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=a;a=b;b=c[e+8>>2]|0;f=c[c[e+16>>2]>>2]|0;g=c[c[e+24>>2]>>2]|0;h=c[(c[e+24>>2]|0)+4>>2]|0;i=c[e>>2]|0;do{if((c[e+12>>2]|0)==(f|0)){if((d|0)!=0){break}return}}while(0);d=f;c[e+12>>2]=d;j=(d|0)<0;d=j&1;if(j){do{if((b|0)==2){if((f|0)>=-9){k=9980;break}f=-9}else{k=9980}}while(0);if((k|0)==9980){do{if((b|0)==3){if((f|0)>=-99){break}f=-99}}while(0)}f=-f|0}k=c[e>>2]|0;i=k-(ab(b,g)|0)|0;k=c[37128]|0;j=(c[e+4>>2]|0)-168|0;l=ab(g,b)|0;ce[k&7](i,j,4,l,h,i,c[e+4>>2]|0,0,4);if((f|0)==1994){return}i=c[e>>2]|0;if((f|0)==0){if((a|0)!=6){m=(c[102618]|0)!=0^1}else{m=0}cf[c[37122]&15](i-g|0,c[e+4>>2]|0,0,c[(c[e+24>>2]|0)+16>>2]|0,a,(m?2:0)|4)}while(1){if((f|0)!=0){m=b;b=m-1|0;n=(m|0)!=0}else{n=0}if(!n){break}i=i-g|0;if((a|0)!=6){o=(c[102618]|0)!=0^1}else{o=0}cf[c[37122]&15](i,c[e+4>>2]|0,0,c[(c[e+24>>2]|0)+(((f|0)%10|0)*20|0)+16>>2]|0,a,(o?2:0)|4);f=(f|0)/10|0}if((d|0)==0){return}d=c[37122]|0;f=c[e+4>>2]|0;e=os(133280)|0;if((a|0)!=6){p=(c[102618]|0)!=0^1}else{p=0}cf[d&15](i-g|0,f,0,e,a,(p?2:0)|4);return}function kK(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;i=a;kF(i|0,b,d,e,f,g,3);c[i+32>>2]=h;return}function kL(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=a;a=b;b=d;if((c[c[e+20>>2]>>2]|0)==0){f=e;g=f|0;h=a;i=b;kI(g,h,i);return}do{if((b|0)==0){if((c[e+12>>2]|0)!=(c[c[e+16>>2]>>2]|0)){break}f=e;g=f|0;h=a;i=b;kI(g,h,i);return}}while(0);if((c[102616]|0)!=0){j=2}else{j=a}cf[c[37122]&15](c[e>>2]|0,c[e+4>>2]|0,0,c[(c[e+32>>2]|0)+16>>2]|0,j,((c[102618]|0)!=0?0:2)|4);f=e;g=f|0;h=a;i=b;kI(g,h,i);return}function kM(){return}function kN(){return}function kO(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;h=a;c[h>>2]=b;c[h+4>>2]=d;c[h+8>>2]=0;c[h+12>>2]=f;c[h+16>>2]=g;c[h+20>>2]=e;return}function kP(a,b){a=a|0;b=b|0;var d=0;d=a;if((c[c[d+16>>2]>>2]|0)==0){return}do{if((c[d+8>>2]|0)==(c[c[d+12>>2]>>2]|0)){if((b|0)!=0){break}return}}while(0);if((c[d+8>>2]|0)!=-1){b=(c[d>>2]|0)-(c[(c[d+20>>2]|0)+((c[d+8>>2]|0)*20|0)+8>>2]|0)|0;a=(c[d+4>>2]|0)-(c[(c[d+20>>2]|0)+((c[d+8>>2]|0)*20|0)+12>>2]|0)|0;ce[c[37128]&7](b,a-168|0,4,c[(c[d+20>>2]|0)+((c[d+8>>2]|0)*20|0)>>2]|0,c[(c[d+20>>2]|0)+((c[d+8>>2]|0)*20|0)+4>>2]|0,b,a,0,4)}if((c[c[d+12>>2]>>2]|0)!=-1){cf[c[37122]&15](c[d>>2]|0,c[d+4>>2]|0,0,c[(c[d+20>>2]|0)+((c[c[d+12>>2]>>2]|0)*20|0)+16>>2]|0,6,4)}c[d+8>>2]=c[c[d+12>>2]>>2];return}function kQ(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=a;a=d;c[(bC()|0)>>2]=0;d=bk(e|0,133272)|0;f=d;if((d|0)==0){g=0;h=g;return h|0}kM();a=(aA(b|0,1,a|0,f|0)|0)==(a|0)|0;at(f|0)|0;kN();if((a|0)==0){f=e;aN(f|0)|0}g=a;h=g;return h|0}function kR(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=b;b=bk(a|0,144632)|0;a=b;do{if((b|0)!=0){kM();e=a;bV(e|0,0,2)|0;e=a3(a|0)|0;f=a;bV(f|0,0,0)|0;c[d>>2]=ug(e,1,0)|0;if((bN(c[d>>2]|0,1,e|0,a|0)|0)!=(e|0)){f=a;at(f|0)|0;break}f=a;at(f|0)|0;kN();g=e;h=g;return h|0}}while(0);g=-1;h=g;return h|0}function kS(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0;a=i;b=bk(c[144516]|0,113184)|0;if((b|0)==0){i=a;return}bQ(b|0,113136,(d=i,i=i+1|0,i=i+7>>3<<3,c[d>>2]=0,d)|0)|0;i=d;bQ(b|0,113072,(d=i,i=i+1|0,i=i+7>>3<<3,c[d>>2]=0,d)|0)|0;i=d;bQ(b|0,113016,(d=i,i=i+1|0,i=i+7>>3<<3,c[d>>2]=0,d)|0)|0;i=d;e=0;while(1){if((e|0)>=(c[111138]|0)){break}if((c[69532+(e*44|0)>>2]|0)==0){f=b;g=c[69504+(e*44|0)>>2]|0;bQ(f|0,112912,(d=i,i=i+8|0,c[d>>2]=g,d)|0)|0;i=d}else{if((c[69532+(e*44|0)>>2]|0)==1){g=b;f=c[69504+(e*44|0)>>2]|0;h=c[c[69512+(e*44|0)>>2]>>2]|0;bQ(g|0,112744,(d=i,i=i+16|0,c[d>>2]=f,c[d+8>>2]=h,d)|0)|0;i=d}else{if((c[69532+(e*44|0)>>2]|0)==3){h=b;f=c[69504+(e*44|0)>>2]|0;g=c[c[69508+(e*44|0)>>2]>>2]|0;bQ(h|0,112848,(d=i,i=i+16|0,c[d>>2]=f,c[d+8>>2]=g,d)|0)|0;i=d}else{g=b;f=c[69504+(e*44|0)>>2]|0;h=c[c[69508+(e*44|0)>>2]>>2]|0;bQ(g|0,112776,(d=i,i=i+16|0,c[d>>2]=f,c[d+8>>2]=h,d)|0)|0;i=d}}}e=e+1|0}at(b|0)|0;i=a;return}function kT(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=i;d=a;a=0;while(1){if((a|0)>=(c[111138]|0)){e=58;break}if((c[69532+(a*44|0)>>2]|0)!=0){if((aO(d|0,c[69504+(a*44|0)>>2]|0)|0)==0){e=55;break}}a=a+1|0}if((e|0)==58){eJ(112696,(f=i,i=i+8|0,c[f>>2]=d,f)|0);i=f;g=0;h=g;i=b;return h|0}else if((e|0)==55){g=69504+(a*44|0)|0;h=g;i=b;return h|0}return 0}function kU(){var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;b=i;i=i+192|0;d=b|0;e=b+80|0;f=b+184|0;g=0;c[111138]=310;h=0;while(1){if((h|0)>=(c[111138]|0)){break}if((c[69512+(h*44|0)>>2]|0)!=0){j=uq(c[69520+(h*44|0)>>2]|0,1,0)|0;c[c[69512+(h*44|0)>>2]>>2]=j}if((c[69508+(h*44|0)>>2]|0)!=0){c[c[69508+(h*44|0)>>2]>>2]=c[69516+(h*44|0)>>2]}h=h+1|0}h=fw(112664)|0;do{if((h|0)!=0){if((h|0)>=((c[113380]|0)-1|0)){k=73;break}c[144516]=c[(c[113378]|0)+(h+1<<2)>>2]}else{k=73}}while(0);if((k|0)==73){j=wJ()|0;c[144516]=ug(4097,1,0)|0;l=c[144516]|0;m=j;n=(wK(j)|0)!=0?624528:112584;aR(l|0,4096,112624,(o=i,i=i+24|0,c[o>>2]=m,c[o+8>>2]=n,c[o+16>>2]=112496,o)|0)|0;i=o}eI(2,112432,(o=i,i=i+8|0,c[o>>2]=c[144516],o)|0)|0;i=o;n=bk(c[144516]|0,112336)|0;if((n|0)==0){c[44776]=112072;i=b;return}while(1){if(!((bT(n|0)|0)!=0^1)){break}m=0;l=bB(n|0,112288,(o=i,i=i+16|0,c[o>>2]=d,c[o+8>>2]=e,o)|0)|0;i=o;if((l|0)==2){if((aX(a[d|0]|0)|0)==0){continue}if((a[e|0]|0)==34){m=1;l=wU(e|0)|0;g=ug(l,1,0)|0;a[e+(l-1)|0]=0;l=g;j=e+1|0;wT(l|0,j|0)|0}else{do{if((a[e|0]|0)==48){if((a[e+1|0]|0)!=120){k=85;break}j=e+2|0;bL(j|0,112216,(o=i,i=i+8|0,c[o>>2]=f,o)|0)|0;i=o}else{k=85}}while(0);if((k|0)==85){k=0;j=e|0;bL(j|0,112184,(o=i,i=i+8|0,c[o>>2]=f,o)|0)|0;i=o}}h=0;L111:while(1){if((h|0)>=(c[111138]|0)){break}do{if((c[69532+(h*44|0)>>2]|0)!=0){if((aO(d|0,c[69504+(h*44|0)>>2]|0)|0)!=0){k=102;break}if((m|0)==((c[69532+(h*44|0)>>2]|0)==1|0)){k=93;break L111}j=c[69504+(h*44|0)>>2]|0;eI(4,112112,(o=i,i=i+8|0,c[o>>2]=j,o)|0)|0;i=o}else{k=102}}while(0);if((k|0)==102){k=0}h=h+1|0}if((k|0)==93){k=0;if((m|0)!=0){ul(c[c[69512+(h*44|0)>>2]>>2]|0);c[c[69512+(h*44|0)>>2]>>2]=g}else{if((c[69524+(h*44|0)>>2]|0)==-123456789){k=96}else{if((c[69524+(h*44|0)>>2]|0)<=(c[f>>2]|0)){k=96}}do{if((k|0)==96){k=0;if((c[69528+(h*44|0)>>2]|0)!=-123456789){if((c[69528+(h*44|0)>>2]|0)<(c[f>>2]|0)){break}}c[c[69508+(h*44|0)>>2]>>2]=c[f>>2]}}while(0)}}}}at(n|0)|0;c[44776]=112072;i=b;return}function kV(a){a=a|0;var b=0;b=i;if((wN(a)|0)==0){i=b;return}dl(112008,(a=i,i=i+1|0,i=i+7>>3<<3,c[a>>2]=0,a)|0);i=a;i=b;return}function kW(){var a=0,b=0,d=0,e=0,f=0,g=0;a=i;i=i+4104|0;b=a|0;do{if((a2(111976,2)|0)==0){d=c[157492]|0;do{e=c[157492]|0;c[157492]=e+1;a5(b|0,111920,(f=i,i=i+16|0,c[f>>2]=111976,c[f+8>>2]=e,f)|0)|0;i=f;do{if((a2(b|0,0)|0)!=0){g=0}else{if((c[157492]|0)==(d|0)){g=0;break}g=(c[157492]|0)<1e4}}while(0)}while(g);if((a2(b|0,0)|0)==0){break}hG(0,(c[14940]|0)==2?108:87);kV(b|0);i=a;return}}while(0);dl(111824,(f=i,i=i+1|0,i=i+7>>3<<3,c[f>>2]=0,f)|0);i=f;i=a;return}function kX(){var a=0,b=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;a=i;b=0;do{if((c[14940]|0)==1){e=131}else{if((c[14940]|0)==3){e=131;break}f=(c[14940]|0)==2?3:1}}while(0);if((e|0)==131){f=2}e=f;f=os(123376)|0;g=vF(f)|0;h=0;while(1){if((b+1|0)>=(c[113536]|0)){j=c[102610]|0;if((c[113536]|0)!=0){k=c[113536]<<1}else{k=8}c[113536]=k;c[102610]=uo(j,k<<2,1,0)|0}j=g+(h*20|0)+18|0;if(((w=d[j]|d[j+1|0]<<8,w<<16>>16)<<16>>16|0)<=(e|0)){j=g+(h*20|0)+18|0;if((w=d[j]|d[j+1|0]<<8,w<<16>>16)<<16>>16==0){break}j=oh(g+(h*20|0)|0)|0;if((j|0)==-1){l=g+(h*20|0)|0;eI(4,143968,(m=i,i=i+8|0,c[m>>2]=l,m)|0)|0;i=m}l=oh(g+(h*20|0)+9|0)|0;if((l|0)==-1){n=g+(h*20|0)+9|0;eI(4,143968,(m=i,i=i+8|0,c[m>>2]=n,m)|0)|0;i=m}do{if((j|0)!=-1){if((l|0)==-1){break}n=b;b=n+1|0;c[(c[102610]|0)+(n<<2)>>2]=j;n=b;b=n+1|0;c[(c[102610]|0)+(n<<2)>>2]=l}}while(0)}h=h+1|0}c[111112]=(b|0)/2|0;c[(c[102610]|0)+(b<<2)>>2]=-1;vI(f);i=a;return}function kY(a,d){a=a|0;d=d|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=a;a=d;d=(c[105236]|0)+((e[f+26>>1]|0)*24|0)+8|0;g=(c[105236]|0)+((e[f+26>>1]|0)*24|0)+12|0;h=(c[105236]|0)+((e[f+26>>1]|0)*24|0)+10|0;i=23;j=f+88|0;do{if((c[144681]|0)!=0){k=155}else{if((c[144658]|0)>>>0<17){k=155;break}}}while(0);if((k|0)==155){j=c[154838]|0}if((a|0)==0){b[f+22>>1]=0}l=0;m=0;n=0;while(1){if((n|0)>=(c[111112]<<1|0)){break}if((c[(c[102610]|0)+(n<<2)>>2]|0)==(b[d>>1]|0)){k=162;break}if((c[(c[102610]|0)+(n<<2)>>2]|0)==(b[g>>1]|0)){k=164;break}if((c[(c[102610]|0)+(n<<2)>>2]|0)==(b[h>>1]|0)){k=166;break}n=n+1|0}if((k|0)==162){l=d;m=0}else if((k|0)==164){l=g;m=1}else if((k|0)==166){l=h;m=2}if((l|0)==0){return}b[l>>1]=c[(c[102610]|0)+((n^1)<<2)>>2]&65535;hG(j,i);if((a|0)==0){return}kZ(f,m,c[(c[102610]|0)+(n<<2)>>2]|0,35);return}function kZ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;g=a;a=b;b=d;d=e;e=0;while(1){if((e|0)>=16){break}if((c[619348+(e*20|0)>>2]|0)!=0){if((c[619336+(e*20|0)>>2]|0)==(g|0)){h=183;break}}e=e+1|0}if((h|0)==183){i=f;return}e=0;while(1){if((e|0)>=16){h=192;break}if((c[619348+(e*20|0)>>2]|0)==0){h=189;break}e=e+1|0}if((h|0)==189){c[619336+(e*20|0)>>2]=g;c[619340+(e*20|0)>>2]=a;c[619344+(e*20|0)>>2]=b;c[619348+(e*20|0)>>2]=d;c[619352+(e*20|0)>>2]=g+88;i=f;return}else if((h|0)==192){eJ(133608,(h=i,i=i+1|0,i=i+7>>3<<3,c[h>>2]=0,h)|0);i=h;i=f;return}}function k_(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;f=a;a=d;d=e;if((c[142830]|0)!=0){if((c[142824]|0)!=201){g=200}}else{if((c[144658]|0)!=8){g=200}}do{if((g|0)==200){if((d|0)==0){break}h=0;i=h;return i|0}}while(0);do{if((c[144658]|0)>>>0>=7){e=0;if((b[a+22>>1]|0)>>>0<32768){if((b[a+22>>1]|0)>>>0>=24576){L266:do{if((c[f+156>>2]|0)==0){do{if((b[a+22>>1]&3072|0)==0){if((b[a+22>>1]&32|0)==0){break}break L266}}while(0);h=0;i=h;return i|0}}while(0);do{if((b[a+24>>1]|0)==0){if((b[a+22>>1]&6|0)==6){break}h=0;i=h;return i|0}}while(0);e=34}else{if((b[a+22>>1]|0)>>>0>=16384){L367:do{if((c[f+156>>2]|0)==0){do{if((b[a+22>>1]&3072|0)==0){if((b[a+22>>1]&32|0)==0){break}break L367}}while(0);h=0;i=h;return i|0}}while(0);do{if((b[a+24>>1]|0)==0){if((b[a+22>>1]&6|0)==6){break}h=0;i=h;return i|0}}while(0);e=6}else{if((b[a+22>>1]|0)>>>0>=15360){do{if((c[f+156>>2]|0)==0){if((b[a+22>>1]&128|0)==0){h=0;i=h;return i|0}if((b[a+20>>1]&32|0)==0){break}h=0;i=h;return i|0}}while(0);do{if((b[a+24>>1]|0)==0){if((b[a+22>>1]&6|0)==6){break}h=0;i=h;return i|0}}while(0);e=4}else{if((b[a+22>>1]|0)>>>0>=14336){if((c[f+156>>2]|0)==0){h=0;i=h;return i|0}if((kk(a,c[f+156>>2]|0)|0)==0){h=0;i=h;return i|0}do{if((b[a+24>>1]|0)==0){if((b[a+22>>1]&6|0)==6){break}h=0;i=h;return i|0}}while(0);e=44}else{if((b[a+22>>1]|0)>>>0>=13312){do{if((c[f+156>>2]|0)==0){if((b[a+22>>1]&32|0)!=0){break}h=0;i=h;return i|0}}while(0);do{if((b[a+24>>1]|0)==0){if((b[a+22>>1]&6|0)==6){break}h=0;i=h;return i|0}}while(0);e=36}else{if((b[a+22>>1]|0)>>>0>=12288){do{if((c[f+156>>2]|0)==0){if((b[a+22>>1]&32|0)!=0){break}h=0;i=h;return i|0}}while(0);do{if((b[a+24>>1]|0)==0){if((b[a+22>>1]&6|0)==6){break}h=0;i=h;return i|0}}while(0);e=38}else{if((b[a+22>>1]|0)>>>0>=12160){do{if((c[f+156>>2]|0)==0){if((b[a+22>>1]&32|0)!=0){break}h=0;i=h;return i|0}}while(0);do{if((b[a+24>>1]|0)==0){if((b[a+22>>1]&6|0)==6){break}h=0;i=h;return i|0}}while(0);e=52}}}}}}}}if((e|0)==0){break}j=(b[a+22>>1]&7)>>0;if((j|0)==6){if((d|0)==0){if((cb[e&63](a)|0)!=0){b[a+22>>1]=0}}h=1;i=h;return i|0}else if((j|0)==7){if((d|0)==0){k=e;l=a;cb[k&63](l)|0}h=1;i=h;return i|0}else if((j|0)==2){if((cb[e&63](a)|0)!=0){kY(a,0)}h=1;i=h;return i|0}else if((j|0)==3){if((cb[e&63](a)|0)!=0){kY(a,1)}h=1;i=h;return i|0}else{h=0;i=h;return i|0}}}while(0);L413:do{if((c[f+156>>2]|0)==0){if((b[a+20>>1]&32|0)!=0){h=0;i=h;return i|0}switch(b[a+22>>1]|0){case 1:case 32:case 33:case 34:case 195:case 174:case 210:case 209:{break L413;break};default:{h=0;i=h;return i|0}}}}while(0);if((kh(a)|0)==0){h=0;i=h;return i|0}switch(b[a+22>>1]|0){case 1:case 26:case 27:case 28:case 31:case 32:case 33:case 34:case 117:case 118:{mo(a,f)|0;break};case 7:{if((n2(a,0)|0)!=0){kY(a,0)}break};case 9:{if((n4(a)|0)!=0){kY(a,0)}break};case 11:{do{if((c[f+156>>2]|0)!=0){if((c[(c[f+156>>2]|0)+40>>2]|0)>0){break}if((c[144675]|0)!=0){break}hG(f,81);h=0;i=h;return i|0}}while(0);kY(a,0);dp();break};case 14:{if((eP(a,2,32)|0)!=0){kY(a,0)}break};case 15:{if((eP(a,2,24)|0)!=0){kY(a,0)}break};case 18:{if((n$(a,4)|0)!=0){kY(a,0)}break};case 20:{if((eP(a,3,0)|0)!=0){kY(a,0)}break};case 21:{if((eP(a,1,0)|0)!=0){kY(a,0)}break};case 23:{if((n$(a,1)|0)!=0){kY(a,0)}break};case 29:{if((mn(a,0)|0)!=0){kY(a,0)}break};case 41:{if((lM(a,0)|0)!=0){kY(a,0)}break};case 71:{if((n$(a,2)|0)!=0){kY(a,0)}break};case 49:{if((lM(a,5)|0)!=0){kY(a,0)}break};case 50:{if((mn(a,2)|0)!=0){kY(a,0)}break};case 51:{do{if((c[f+156>>2]|0)!=0){if((c[(c[f+156>>2]|0)+40>>2]|0)>0){break}if((c[144675]|0)!=0){break}hG(f,81);h=0;i=h;return i|0}}while(0);kY(a,0);dr();break};case 55:{if((n$(a,13)|0)!=0){kY(a,0)}break};case 101:{if((n$(a,3)|0)!=0){kY(a,0)}break};case 102:{if((n$(a,0)|0)!=0){kY(a,0)}break};case 103:{if((mn(a,3)|0)!=0){kY(a,0)}break};case 111:{if((mn(a,5)|0)!=0){kY(a,0)}break};case 112:{if((mn(a,6)|0)!=0){kY(a,0)}break};case 113:{if((mn(a,7)|0)!=0){kY(a,0)}break};case 122:{if((eP(a,4,0)|0)!=0){kY(a,0)}break};case 127:{if((n2(a,1)|0)!=0){kY(a,0)}break};case 131:{if((n$(a,14)|0)!=0){kY(a,0)}break};case 133:case 135:case 137:{if((mm(a,6,f)|0)!=0){kY(a,0)}break};case 140:{if((n$(a,16)|0)!=0){kY(a,0)}break};case 42:{if((mn(a,2)|0)!=0){kY(a,1)}break};case 43:{if((lM(a,0)|0)!=0){kY(a,1)}break};case 45:{if((n$(a,0)|0)!=0){kY(a,1)}break};case 60:{if((n$(a,1)|0)!=0){kY(a,1)}break};case 61:{if((mn(a,3)|0)!=0){kY(a,1)}break};case 62:{if((eP(a,1,1)|0)!=0){kY(a,1)}break};case 63:{if((mn(a,0)|0)!=0){kY(a,1)}break};case 64:{if((n$(a,3)|0)!=0){kY(a,1)}break};case 66:{if((eP(a,2,24)|0)!=0){kY(a,1)}break};case 67:{if((eP(a,2,32)|0)!=0){kY(a,1)}break};case 65:{if((n$(a,13)|0)!=0){kY(a,1)}break};case 68:{if((eP(a,3,0)|0)!=0){kY(a,1)}break};case 69:{if((n$(a,4)|0)!=0){kY(a,1)}break};case 70:{if((n$(a,2)|0)!=0){kY(a,1)}break};case 114:{if((mn(a,5)|0)!=0){kY(a,1)}break};case 115:{if((mn(a,6)|0)!=0){kY(a,1)}break};case 116:{if((mn(a,7)|0)!=0){kY(a,1)}break};case 123:{if((eP(a,4,0)|0)!=0){kY(a,1)}break};case 132:{if((n$(a,14)|0)!=0){kY(a,1)}break};case 99:case 134:case 136:{if((mm(a,6,f)|0)!=0){kY(a,1)}break};case 138:{s9(a,255)|0;kY(a,1);break};case 139:{s9(a,35)|0;kY(a,1);break};default:{if((c[144658]|0)>>>0>=7){switch(b[a+22>>1]|0){case 158:{if((n$(a,8)|0)!=0){kY(a,0)}break};case 159:{if((n$(a,9)|0)!=0){kY(a,0)}break};case 160:{if((n$(a,12)|0)!=0){kY(a,0)}break};case 161:{if((n$(a,10)|0)!=0){kY(a,0)}break};case 162:{if((eP(a,0,0)|0)!=0){kY(a,0)}break};case 163:{eM(a)|0;kY(a,0);break};case 164:{if((lM(a,6)|0)!=0){kY(a,0)}break};case 165:{if((lM(a,7)|0)!=0){kY(a,0)}break};case 166:{if((lM(a,1)|0)!=0){g=420}else{if((n$(a,1)|0)!=0){g=420}}if((g|0)==420){kY(a,0)}break};case 167:{if((lM(a,4)|0)!=0){kY(a,0)}break};case 168:{if((lI(a)|0)!=0){kY(a,0)}break};case 169:{s9(a,0)|0;kY(a,0);break};case 170:{s9(a,35)|0;kY(a,0);break};case 171:{s9(a,255)|0;kY(a,0);break};case 172:{s7(a)|0;kY(a,0);break};case 173:{s8(a)|0;kY(a,0);break};case 174:{if((k0(a,d,f)|0)!=0){kY(a,0)}break};case 175:{if((mn(a,1)|0)!=0){kY(a,0)}break};case 189:{if((n0(a,0)|0)!=0){kY(a,0)}break};case 203:{if((lM(a,2)|0)!=0){kY(a,0)}break};case 204:{if((lM(a,3)|0)!=0){kY(a,0)}break};case 209:{if((k2(a,d,f)|0)!=0){kY(a,0)}break};case 241:{if((n0(a,1)|0)!=0){kY(a,0)}break};case 221:{if((n$(a,5)|0)!=0){kY(a,0)}break};case 229:{if((n5(a,0)|0)!=0){kY(a,0)}break};case 233:{if((n5(a,1)|0)!=0){kY(a,0)}break};case 237:{if((n5(a,2)|0)!=0){kY(a,0)}break};case 78:{if((n0(a,1)|0)!=0){kY(a,1)}break};case 176:{if((n$(a,8)|0)!=0){kY(a,1)}break};case 177:{if((n$(a,9)|0)!=0){kY(a,1)}break};case 178:{if((n$(a,16)|0)!=0){kY(a,1)}break};case 179:{if((n$(a,12)|0)!=0){kY(a,1)}break};case 180:{if((n$(a,10)|0)!=0){kY(a,1)}break};case 181:{eP(a,0,0)|0;kY(a,1);break};case 182:{eM(a)|0;kY(a,1);break};case 183:{if((lM(a,6)|0)!=0){kY(a,1)}break};case 184:{if((lM(a,5)|0)!=0){kY(a,1)}break};case 185:{if((lM(a,7)|0)!=0){kY(a,1)}break};case 186:{if((lM(a,1)|0)!=0){g=497}else{if((n$(a,1)|0)!=0){g=497}}if((g|0)==497){kY(a,1)}break};case 187:{if((lM(a,4)|0)!=0){kY(a,1)}break};case 188:{if((lI(a)|0)!=0){kY(a,1)}break};case 190:{if((n0(a,0)|0)!=0){kY(a,1)}break};case 191:{if((n4(a)|0)!=0){kY(a,1)}break};case 192:{s9(a,0)|0;kY(a,1);break};case 193:{s7(a)|0;kY(a,1);break};case 194:{s8(a)|0;kY(a,1);break};case 195:{if((k0(a,d,f)|0)!=0){kY(a,1)}break};case 196:{if((mn(a,1)|0)!=0){kY(a,1)}break};case 205:{if((lM(a,2)|0)!=0){kY(a,1)}break};case 206:{if((lM(a,3)|0)!=0){kY(a,1)}break};case 210:{if((k2(a,d,f)|0)!=0){kY(a,1)}break};case 211:{if((eP(a,7,0)|0)!=0){kY(a,1)}break};case 222:{if((n$(a,5)|0)!=0){kY(a,1)}break};case 230:{if((n5(a,0)|0)!=0){kY(a,1)}break};case 234:{if((n5(a,1)|0)!=0){kY(a,1)}break};case 238:{if((n5(a,2)|0)!=0){kY(a,1)}break};case 258:{if((n2(a,0)|0)!=0){kY(a,1)}break};case 259:{if((n2(a,1)|0)!=0){kY(a,1)}break};default:{}}}}}h=1;i=h;return i|0}function k$(a,b){a=a|0;b=b|0;var c=0;c=a;a=b;b=w9(c,(c|0)<0?-1:0,a,(a|0)<0?-1:0)|0;a=F;a>>16|((a|0)<0?-1:0)<<16;return b>>>16|a<<16|0}function k0(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;f=a;a=e;do{if((d|0)==0){e=a+120|0;if((c[e>>2]&65536|0)!=0|(c[e+4>>2]&0|0)!=0){break}e=k1(f)|0;g=e;if((e|0)==0){h=0;i=h;return i|0}e=c[a+24>>2]|0;j=c[a+28>>2]|0;k=c[a+32>>2]|0;l=c[a+156>>2]|0;do{if((l|0)!=0){if((c[l>>2]|0)==(a|0)){break}l=0}}while(0);if((ti(a,c[g+24>>2]|0,c[g+28>>2]|0,0)|0)==0){h=0;i=h;return i|0}if((c[144658]|0)!=4){c[a+32>>2]=c[a+68>>2]}if((l|0)!=0){c[l+16>>2]=(c[a+32>>2]|0)+(c[l+20>>2]|0)}hG(dZ(e,j,k,39)|0,35);hG(dZ((c[g+24>>2]|0)+((c[(c[15022]|0)+((c[g+44>>2]|0)>>>19<<2)>>2]|0)*20|0)|0,(c[g+28>>2]|0)+((c[515760+((c[g+44>>2]|0)>>>19<<2)>>2]|0)*20|0)|0,c[a+32>>2]|0,39)|0,35);if((c[a+156>>2]|0)!=0){b[a+148>>1]=18}c[a+44>>2]=c[g+44>>2];c[a+96>>2]=0;c[a+92>>2]=0;c[a+88>>2]=0;if((l|0)!=0){c[l+36>>2]=0;c[l+32>>2]=0}do{if((l|0)!=0){if((c[l>>2]|0)!=(a|0)){break}ec(l)}}while(0);h=1;i=h;return i|0}}while(0);h=0;i=h;return i|0}function k1(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;b=a;a=-1;L875:while(1){d=j6(b,a)|0;a=d;if((d|0)<0){e=683;break}d=0;while(1){f=lq(d,1)|0;d=f;if((f|0)==0){break}if((c[d+8>>2]|0)==390){g=d;if((c[g+104>>2]|0)==41){if((((c[c[g+64>>2]>>2]|0)-(c[108410]|0)|0)/196|0|0)==(a|0)){e=679;break L875}}}}}if((e|0)==679){h=g;i=h;return i|0}else if((e|0)==683){h=0;i=h;return i|0}return 0}function k2(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;e=a;a=d;do{if((b|0)==0){d=a+120|0;if((c[d>>2]&65536|0)!=0|(c[d+4>>2]&0|0)!=0){break}d=k1(e)|0;f=d;if((d|0)==0){g=0;h=g;return h|0}d=(c[a+32>>2]|0)-(c[a+68>>2]|0)|0;i=t_(0,0,c[e+12>>2]|0,c[e+16>>2]|0)|0;j=i-(c[f+44>>2]|0)+1073741824|0;i=c[515760+(j>>>19<<2)>>2]|0;k=c[(c[15022]|0)+(j>>>19<<2)>>2]|0;l=c[a+88>>2]|0;m=c[a+92>>2]|0;n=c[a+156>>2]|0;if((ti(a,c[f+24>>2]|0,c[f+28>>2]|0,0)|0)==0){g=0;h=g;return h|0}f=a+44|0;c[f>>2]=(c[f>>2]|0)+j;c[a+32>>2]=d+(c[a+68>>2]|0);d=k$(l,k)|0;c[a+88>>2]=d-(k$(m,i)|0);d=k$(m,k)|0;c[a+92>>2]=d+(k$(l,i)|0);do{if((n|0)!=0){if((c[n>>2]|0)!=(a|0)){break}i=c[n+24>>2]|0;c[n+24>>2]=0;lC(n);c[n+24>>2]=i}}while(0);do{if((n|0)!=0){if((c[n>>2]|0)!=(a|0)){break}ec(n)}}while(0);g=1;h=g;return h|0}}while(0);g=0;h=g;return h|0}function k3(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0;c=a;a=b;b=c;d=b>>31;e=a;f=e>>31;if(((b^d)-d|0)>>>14>>>0>=((e^f)-f|0)>>>0){g=(c^a)>>31^2147483647;return g|0}else{f=c;c=f;e=a;a=w7(c<<16|0>>>16,((f|0)<0?-1:0)<<16|c>>>16,e,(e|0)<0?-1:0)|0;g=a;return g|0}return 0}function k4(a,b,d,f){a=a|0;b=b|0;d=d|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;g=a;a=d;d=f;do{if((b|0)==0){f=a+120|0;if((c[f>>2]&65536|0)!=0|(c[f+4>>2]&0|0)!=0){break}f=-1;while(1){h=j7(g,f)|0;f=h;if((h|0)<0){i=753;break}h=(c[113656]|0)+(f*124|0)|0;j=h;if((h|0)!=(g|0)){if((c[j+56>>2]|0)!=0){break}}}if((i|0)==753){k=0;l=k;return l|0}f=c[g+12>>2]|0;h=f>>31;m=c[g+16>>2]|0;n=m>>31;if(((f^h)-h|0)>((m^n)-n|0)){o=k3((c[a+24>>2]|0)-(c[c[g+4>>2]>>2]|0)|0,c[g+12>>2]|0)|0}else{o=k3((c[a+28>>2]|0)-(c[(c[g+4>>2]|0)+4>>2]|0)|0,c[g+16>>2]|0)|0}n=o;if((d|0)!=0){n=65536-n|0;p=0}else{p=-2147483648}m=p+(t_(0,0,c[j+12>>2]|0,c[j+16>>2]|0)|0)|0;h=m-(t_(0,0,c[g+12>>2]|0,c[g+16>>2]|0)|0)|0;m=c[c[j+8>>2]>>2]|0;f=m-(k$(n,c[j+12>>2]|0)|0)|0;m=c[(c[j+8>>2]|0)+4>>2]|0;q=m-(k$(n,c[j+16>>2]|0)|0)|0;n=c[515760+(h>>>19<<2)>>2]|0;m=c[(c[15022]|0)+(h>>>19<<2)>>2]|0;r=10;do{if((c[a+156>>2]|0)!=0){if((c[c[a+156>>2]>>2]|0)!=(a|0)){i=728;break}s=c[a+156>>2]|0}else{i=728}}while(0);if((i|0)==728){s=0}t=s;u=(c[(c[j+52>>2]|0)+12>>2]|0)<(c[(c[j+56>>2]|0)+12>>2]|0)|0;v=(c[a+32>>2]|0)-(c[a+68>>2]|0)|0;if((d|0)!=0){w=1}else{if((t|0)!=0){x=(u|0)!=0}else{x=0}w=x}y=w&1;while(1){if((ur(f,q,j)|0)!=(y|0)){z=r-1|0;r=z;A=(z|0)>=0}else{A=0}if(!A){break}z=c[j+12>>2]|0;B=z>>31;C=c[j+16>>2]|0;D=C>>31;if(((z^B)-B|0)>((C^D)-D|0)){q=q-(((c[j+12>>2]|0)<0|0)!=(y|0)?-1:1)|0}else{f=f+(((c[j+16>>2]|0)<0|0)!=(y|0)?-1:1)|0}}if((ti(a,f,q,0)|0)==0){k=0;l=k;return l|0}do{if((t|0)!=0){if((c[t>>2]|0)!=(a|0)){break}ec(t)}}while(0);c[a+32>>2]=v+(c[(c[(c[105236]|0)+((e[j+26+(u<<1)>>1]|0)*24|0)+16>>2]|0)+12>>2]|0);y=a+44|0;c[y>>2]=(c[y>>2]|0)+h;f=c[a+88>>2]|0;q=c[a+92>>2]|0;y=k$(f,m)|0;c[a+88>>2]=y-(k$(q,n)|0);y=k$(q,m)|0;c[a+92>>2]=y+(k$(f,n)|0);if((t|0)!=0){y=c[t+24>>2]|0;c[t+24>>2]=0;lC(t);c[t+24>>2]=y}do{if((t|0)!=0){if((c[t>>2]|0)!=(a|0)){break}ec(t)}}while(0);k=1;l=k;return l|0}}while(0);k=0;l=k;return l|0}function k5(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;do{if((c[b>>2]|0)==1){if((c[b+4>>2]&-65536|0)!=1634533376){d=765;break}a=c[b+4>>2]|0;if((a|0)==1634559232){c[102908]=0;c[102914]=1}else if((a|0)==1634564096){c[102908]=1}}else{d=765}}while(0);do{if((d|0)==765){if((c[b>>2]|0)!=0){break}e=gD(c[b+4>>2]|0)|0;f=e;return f|0}}while(0);e=0;f=e;return f|0}function k6(){c[102922]=(c[102922]|0)+1;c[102898]=lm(48)|0;k7();c[7980]=c[(c[110722]|0)+40>>2];return}function k7(){var a=0,b=0,d=0,e=0,f=0,g=0;if((c[96+((c[(c[110722]|0)+120>>2]|0)*24|0)>>2]|0)==5){c[53956]=154256}else{c[53956]=(c[110722]|0)+164+(c[96+((c[(c[110722]|0)+120>>2]|0)*24|0)>>2]<<2)}c[53959]=c[(c[110722]|0)+120>>2];a=0;while(1){if((a|0)>=3){break}if((c[(c[110722]|0)+76+(a<<2)>>2]|0)!=0){b=a}else{b=-1}c[454920+(a<<2)>>2]=b;if((c[(c[110722]|0)+76+(a+3<<2)>>2]|0)!=0){do{if((c[454920+(a<<2)>>2]|0)==-1){d=784}else{if((c[102614]|0)!=0){d=784;break}e=a+6|0}}while(0);if((d|0)==784){d=0;e=a+3|0}c[454920+(a<<2)>>2]=e}a=a+1|0}ls();c[102904]=((c[144588]|0)!=0^1)&1;if((c[102896]|0)!=0){f=(c[144588]|0)!=0^1}else{f=0}c[102928]=f&1;if((c[144588]|0)!=0){g=(c[102896]|0)!=0}else{g=0}c[102910]=g&1;c[102912]=0;a=0;while(1){if((a|0)>=4){break}if((a|0)!=(c[142806]|0)){c[102912]=(c[102912]|0)+(c[(c[110722]|0)+104+(a<<2)>>2]|0)}else{c[102912]=(c[102912]|0)-(c[(c[110722]|0)+104+(a<<2)>>2]|0)}a=a+1|0}a=(c[102906]|0)-1|0;c[102906]=a;if((a|0)!=0){return}c[102926]=c[102902];return}function k8(a,b){a=a|0;b=b|0;var d=0,e=0;if((c[102914]|0)!=0){d=1}else{d=(b|0)!=0}c[102914]=d&1;k9();if((a|0)==0){return}do{if((c[102914]|0)!=0){e=810}else{if((lQ()|0)==4){e=810;break}lb()}}while(0);if((e|0)==810){la()}return}function k9(){var a=0,b=0,d=0,e=0;a=c[(c[110722]|0)+228>>2]|0;if((c[(c[110722]|0)+56>>2]|0)!=0){b=12-(c[(c[110722]|0)+56>>2]>>6)|0;if((b|0)>(a|0)){a=b}}if((a|0)!=0){d=a+7>>3;if((d|0)>=8){d=7}if((c[113474]|0)!=0){d=d>>1}d=d+1|0}else{if((c[(c[110722]|0)+232>>2]|0)!=0){d=(c[(c[110722]|0)+232>>2]|0)+7>>3;if((d|0)>=4){d=3}d=d+9|0}else{do{if((c[(c[110722]|0)+64>>2]|0)>128){e=832}else{if((c[(c[110722]|0)+64>>2]&8|0)!=0){e=832;break}d=0}}while(0);if((e|0)==832){d=13}}}if((d|0)==(c[102900]|0)){return}a=d;c[102900]=a;l_(a);do{if((lQ()|0)==1){e=840}else{if((lQ()|0)==2){e=840;break}if((lQ()|0)==3){e=840}}}while(0);if((e|0)==840){c[102914]=1}return}function la(){c[102914]=0;lk();lj(1);return}function lb(){lj(0);return}function lc(){if((c[7978]|0)==0){ld()}le();lf();c[7978]=0;return}function ld(){if((c[7978]|0)!=0){return}else{l_(0);c[7978]=1;return}}function le(){var a=0;c[102914]=1;c[110722]=442960+((c[142806]|0)*288|0);c[102922]=0;c[102924]=0;c[102908]=1;c[102896]=1;c[102926]=0;c[102902]=0;c[102920]=0;c[102916]=0;c[102900]=-1;c[7980]=-1;a=0;while(1){if((a|0)>=9){break}c[444344+(a<<2)>>2]=c[(c[110722]|0)+128+(a<<2)>>2];a=a+1|0}a=0;while(1){if((a|0)>=3){break}c[454920+(a<<2)>>2]=-1;a=a+1|0}kD();return}function lf(){var a=0;kF(215808,44,171,410232,(c[110722]|0)+164+(c[96+((c[(c[110722]|0)+120>>2]|0)*24|0)>>2]<<2)|0,411584,3);c[53959]=c[(c[110722]|0)+120>>2];kK(236488,90,171,410232,(c[110722]|0)+40|0,411584,410208);kO(248840,104,168,624112,411616,411584);a=0;while(1){if((a|0)>=6){break}kG(248872+(a*28|0)|0,(((a|0)%3|0)*12|0)+111|0,(((a|0)/3|0)*10|0)+172|0,624136+(a*40|0)|0,(c[110722]|0)+128+(a+1<<2)|0,411712);a=a+1|0}kF(240608,138,171,410232,411648,411640,2);kG(240640,143,168,560960,411664,411584);kK(249040,221,171,410232,(c[110722]|0)+44|0,411584,410208);kG(228208,239,171,454736,454920,411584);kG(228236,239,181,454736,454924,411584);kG(228264,239,191,454736,454928,411584);kF(251120,288,173,420968,(c[110722]|0)+164|0,411584,3);kF(251152,288,179,420968,(c[110722]|0)+168|0,411584,3);kF(251184,288,191,420968,(c[110722]|0)+172|0,411584,3);kF(251216,288,185,420968,(c[110722]|0)+176|0,411584,3);kF(226040,314,173,420968,(c[110722]|0)+180|0,411584,3);kF(226072,314,179,420968,(c[110722]|0)+184|0,411584,3);kF(226104,314,191,420968,(c[110722]|0)+188|0,411584,3);kF(226136,314,185,420968,(c[110722]|0)+192|0,411584,3);return}function lg(){c[234]=0;lh();return}function lh(){li(1);return}function li(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;a=i;i=i+16|0;b=a|0;d=0;while(1){if((d|0)>=10){break}a5(b|0,122152,(e=i,i=i+8|0,c[e>>2]=d,e)|0)|0;i=e;om(410232+(d*20|0)|0,b|0);a5(b|0,143928,(e=i,i=i+8|0,c[e>>2]=d,e)|0)|0;i=e;om(420968+(d*20|0)|0,b|0);d=d+1|0}om(410208,133576);d=0;while(1){if((d|0)>=9){break}a5(b|0,116656,(e=i,i=i+8|0,c[e>>2]=d,e)|0)|0;i=e;om(454736+(d*20|0)|0,b|0);d=d+1|0}om(411504,109808);om(624112,105168);d=0;while(1){if((d|0)>=6){break}a5(b|0,101880,(e=i,i=i+8|0,c[e>>2]=d+2,e)|0)|0;i=e;om(624136+(d*40|0)|0,b|0);f=624156+(d*40|0)|0;g=420968+((d+2|0)*20|0)|0;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];c[f+8>>2]=c[g+8>>2];c[f+12>>2]=c[g+12>>2];c[f+16>>2]=c[g+16>>2];d=d+1|0}om(561800,98072);g=0;d=0;while(1){if((d|0)>=5){break}f=0;while(1){if((f|0)>=3){break}a5(b|0,94016,(e=i,i=i+16|0,c[e>>2]=d,c[e+8>>2]=f,e)|0)|0;i=e;h=g;g=h+1|0;om(560960+(h*20|0)|0,b|0);f=f+1|0}a5(b|0,90632,(e=i,i=i+8|0,c[e>>2]=d,e)|0)|0;i=e;f=g;g=f+1|0;om(560960+(f*20|0)|0,b|0);a5(b|0,147824,(e=i,i=i+8|0,c[e>>2]=d,e)|0)|0;i=e;f=g;g=f+1|0;om(560960+(f*20|0)|0,b|0);a5(b|0,146144,(e=i,i=i+8|0,c[e>>2]=d,e)|0)|0;i=e;f=g;g=f+1|0;om(560960+(f*20|0)|0,b|0);a5(b|0,144680,(e=i,i=i+8|0,c[e>>2]=d,e)|0)|0;i=e;f=g;g=f+1|0;om(560960+(f*20|0)|0,b|0);a5(b|0,143256,(e=i,i=i+8|0,c[e>>2]=d,e)|0)|0;i=e;f=g;g=f+1|0;om(560960+(f*20|0)|0,b|0);d=d+1|0}d=g;g=d+1|0;om(560960+(d*20|0)|0,141792);d=g;g=d+1|0;om(560960+(d*20|0)|0,140816);i=a;return}function lj(a){a=a|0;var b=0,d=0,e=0;b=a;if((c[102896]|0)!=0){d=(c[144588]|0)!=0^1}else{d=0}c[102928]=d&1;if((c[144588]|0)!=0){e=(c[102896]|0)!=0}else{e=0}c[102910]=e&1;e=(c[c[53956]>>2]|0)*100|0;if((e|0)<(ab(c[156104]|0,c[(c[110722]|0)+180+(c[96+((c[53959]|0)*24|0)>>2]<<2)>>2]|0)|0)){kI(215808,6,b)}else{e=(c[c[53956]>>2]|0)*100|0;if((e|0)<(ab(c[156102]|0,c[(c[110722]|0)+180+(c[96+((c[53959]|0)*24|0)>>2]<<2)>>2]|0)|0)){kI(215808,5,b)}else{kI(215808,3,b)}}e=0;while(1){if((e|0)>=4){break}kI(251120+(e<<5)|0,6,b);kI(226040+(e<<5)|0,6,b);e=e+1|0}if((c[c[59126]>>2]|0)<(c[122160]|0)){kL(236488,6,b)}else{if((c[c[59126]>>2]|0)<(c[122158]|0)){kL(236488,5,b)}else{if((c[c[59126]>>2]|0)<=(c[122162]|0)){kL(236488,3,b)}else{kL(236488,10,b)}}}if((c[c[62264]>>2]|0)<(c[156096]|0)){kL(249040,6,b)}else{if((c[c[62264]>>2]|0)<(c[156094]|0)){kL(249040,5,b)}else{if((c[c[62264]>>2]|0)<=(c[156098]|0)){kL(249040,3,b)}else{kL(249040,10,b)}}}e=0;while(1){if((e|0)>=6){break}kP(248872+(e*28|0)|0,b);e=e+1|0}kP(240640,b);e=0;while(1){if((e|0)>=3){break}kP(228208+(e*28|0)|0,b);e=e+1|0}kI(240608,6,b);return}function lk(){var a=0,b=0;a=0;if((c[102896]|0)==0){return}if((lQ()|0)==4){a=168}cf[c[37122]&15](0,a,4,c[102880]|0,6,4);if((c[102928]|0)!=0){cf[c[37122]&15](104,a,4,c[156032]|0,6,4)}if((c[111230]|0)!=0){if((c[142806]|0)!=0){b=(c[142806]|0)+11|0}else{b=6}cf[c[37122]&15](143,a,4,c[140454]|0,b,(c[142806]|0)!=0?6:4)}ce[c[37128]&7](0,a,4,c[38570]|0,(c[38574]<<5|0)/200|0,0,(c[38574]|0)-((c[38574]<<5|0)/200|0)|0,0,0);return}function ll(){var a=0,b=0,d=0;if((c[(c[110722]|0)+40>>2]|0)>100){a=100}else{a=c[(c[110722]|0)+40>>2]|0}b=a;if((b|0)==(c[38568]|0)){d=c[156332]|0;return d|0}c[156332]=(((100-b|0)*5|0|0)/101|0)<<3;c[38568]=b;d=c[156332]|0;return d|0}function lm(a){a=a|0;var b=0,e=0,f=0,g=0;b=a;if((b|0)==48){a=(c[110691]|0)+1&255;c[110691]=a;e=a}else{a=(c[110690]|0)+1&255;c[110690]=a;e=a}a=e;do{if((b|0)!=48){if((c[142842]|0)!=0){break}b=49}}while(0);e=c[442512+(b<<2)>>2]|0;c[442512+(b<<2)>>2]=(ab(e,1664525)|0)+221297+(b<<1);if((c[144658]|0)>>>0<7){f=d[35048+a|0]|0;g=f;return g|0}e=e>>>20;if((c[142842]|0)!=0){e=e+(((c[122178]|0)-(c[154980]|0)|0)*7|0)|0}f=e&255;g=f;return g|0}function ln(){var a=0,b=0,d=0;a=(c[8760]<<1)+1|0;b=0;while(1){if((b|0)>=62){break}d=a*69069|0;a=d;c[442512+(b<<2)>>2]=d;b=b+1|0}c[110690]=0;c[110691]=0;return}function lo(){var a=0,b=0;a=0;while(1){if((a|0)>=4){break}b=401704+(a*24|0)|0;c[401716+(a*24|0)>>2]=b;c[401720+(a*24|0)>>2]=b;a=a+1|0}c[100451]=401800;c[100450]=401800;return}function lp(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;if((c[b+8>>2]|0)==232){d=0}else{do{if((c[b+8>>2]|0)==390){if((c[b+132>>2]|0)<=0){e=987;break}a=b+120|0;if(!((c[a>>2]&4194304|0)!=0|(c[a+4>>2]&0|0)!=0)){if((c[b+104>>2]|0)!=18){e=987;break}}a=b+120|0;f=(c[a>>2]&0|0)!=0|(c[a+4>>2]&4|0)!=0?2:3}else{e=987}}while(0);if((e|0)==987){f=1}d=f}f=c[b+12>>2]|0;e=f;if((f|0)!=0){f=c[b+16>>2]|0;c[e+16>>2]=f;c[f+12>>2]=e}e=401704+(d*24|0)|0;c[(c[e+16>>2]|0)+12>>2]=b;c[b+12>>2]=e;c[b+16>>2]=c[e+16>>2];c[e+16>>2]=b;return}function lq(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=a;a=b;b=401704+(a*24|0)|0;if((d|0)==0){d=b}if((a|0)==4){e=c[d+4>>2]|0}else{e=c[d+12>>2]|0}d=e;if((d|0)==(b|0)){f=0;return f|0}else{f=d;return f|0}return 0}function lr(a,b){a=a|0;b=b|0;var d=0;d=a;a=b;if((c[d>>2]|0)!=0){b=(c[d>>2]|0)+20|0;c[b>>2]=(c[b>>2]|0)-1}b=a;c[d>>2]=b;if((b|0)==0){return}b=a+20|0;c[b>>2]=(c[b>>2]|0)+1;return}function ls(){var a=0,b=0,d=0,e=0,f=0,g=0;if((c[156330]|0)<10){if((c[(c[110722]|0)+40>>2]|0)==0){c[156330]=9;c[102916]=41;c[102918]=1}}if((c[156330]|0)<9){if((c[(c[110722]|0)+232>>2]|0)!=0){a=0;b=0;while(1){if((b|0)>=9){break}if((c[444344+(b<<2)>>2]|0)!=(c[(c[110722]|0)+128+(b<<2)>>2]|0)){a=1;c[444344+(b<<2)>>2]=c[(c[110722]|0)+128+(b<<2)>>2]}b=b+1|0}if((a|0)!=0){c[156330]=8;c[102918]=70;c[102916]=(ll()|0)+6}}}if((c[156330]|0)<8){do{if((c[(c[110722]|0)+228>>2]|0)!=0){if((c[(c[110722]|0)+236>>2]|0)==0){break}if((c[(c[110722]|0)+236>>2]|0)==(c[c[110722]>>2]|0)){break}c[156330]=7;if(((c[7980]|0)-(c[(c[110722]|0)+40>>2]|0)|0)>20){c[102918]=35;c[102916]=(ll()|0)+5}else{a=t_(c[(c[c[110722]>>2]|0)+24>>2]|0,c[(c[c[110722]>>2]|0)+28>>2]|0,c[(c[(c[110722]|0)+236>>2]|0)+24>>2]|0,c[(c[(c[110722]|0)+236>>2]|0)+28>>2]|0)|0;if(a>>>0>(c[(c[c[110722]>>2]|0)+44>>2]|0)>>>0){d=a-(c[(c[c[110722]>>2]|0)+44>>2]|0)|0;b=d>>>0>2147483648|0}else{d=(c[(c[c[110722]>>2]|0)+44>>2]|0)-a|0;b=d>>>0<=2147483648|0}c[102918]=35;c[102916]=ll()|0;if(d>>>0<536870912){c[102916]=(c[102916]|0)+7}else{if((b|0)!=0){c[102916]=(c[102916]|0)+3}else{c[102916]=(c[102916]|0)+4}}}}}while(0)}if((c[156330]|0)<7){if((c[(c[110722]|0)+228>>2]|0)!=0){if(((c[7980]|0)-(c[(c[110722]|0)+40>>2]|0)|0)>20){c[156330]=7;c[102918]=35;c[102916]=(ll()|0)+5}else{c[156330]=6;c[102918]=35;c[102916]=(ll()|0)+7}}}if((c[156330]|0)<6){if((c[(c[110722]|0)+196>>2]|0)!=0){if((c[38566]|0)==-1){c[38566]=70}else{b=(c[38566]|0)-1|0;c[38566]=b;if((b|0)==0){c[156330]=5;c[102916]=(ll()|0)+7;c[102918]=1;c[38566]=1}}}else{c[38566]=-1}}if((c[156330]|0)<5){if((c[(c[110722]|0)+204>>2]&2|0)!=0){e=1064}else{if((c[(c[110722]|0)+52>>2]|0)!=0){e=1064}}if((e|0)==1064){c[156330]=4;c[102916]=40;c[102918]=1}}if((c[102918]|0)!=0){f=c[102918]|0;g=f-1|0;c[102918]=g;return}e=ll()|0;c[102916]=e+((c[102898]|0)%3|0);c[102918]=17;c[156330]=0;f=c[102918]|0;g=f-1|0;c[102918]=g;return}function lt(a){a=a|0;var b=0,d=0;b=a;if((c[b+20>>2]|0)!=0){return}a=c[b+4>>2]|0;d=c[b>>2]|0;c[144610]=d;c[a>>2]=d;c[d+4>>2]=a;a=c[b+12>>2]|0;d=c[b+16>>2]|0;c[a+16>>2]=d;c[d+12>>2]=a;ul(b);return}function lu(a){a=a|0;var b=0;b=a;c[(c[100450]|0)+4>>2]=b;c[b+4>>2]=401800;c[b>>2]=c[100450];c[100450]=b;c[b+20>>2]=0;c[b+16>>2]=0;c[b+12>>2]=0;lp(b);c[111226]=1;return}function lv(a){a=a|0;var b=0;b=a;vy(b);c[b+8>>2]=232;lp(b);return}function lw(){var a=0;L1395:do{if((c[111054]|0)==0){do{if((c[113474]|0)!=0){if((c[142830]|0)!=0){break}if((c[111230]|0)!=0){break}if((c[442976+((c[144632]|0)*288|0)>>2]|0)!=1){break L1395}}}while(0);vl();tT();if((c[122180]|0)==0){a=0;while(1){if((a|0)>=4){break}if((c[444120+(a<<2)>>2]|0)!=0){lG(442960+(a*288|0)|0)}a=a+1|0}}lz();kp();d_();tQ();c[113660]=(c[113660]|0)+1;return}}while(0);return}function lx(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=b;if(c>>>0<512){d=2048;e=d;return e|0}b=(a<<3>>>0)/(c>>>8>>>0)|0;if(b>>>0<=2048){f=b}else{f=2048}d=f;e=d;return e|0}function ly(a,b){a=a|0;b=b|0;var c=0;c=a;a=b;b=w9(c,(c|0)<0?-1:0,a,(a|0)<0?-1:0)|0;a=F;a>>16|((a|0)<0?-1:0)<<16;return b>>>16|a<<16|0}function lz(){c[144610]=c[100451];while(1){if((c[144610]|0)==401800){break}if((c[111226]|0)!=0){vu(c[144610]|0)}if((c[(c[144610]|0)+8>>2]|0)!=0){b9[c[(c[144610]|0)+8>>2]&1023](c[144610]|0)}c[144610]=c[(c[144610]|0)+4>>2]}c[111226]=0;return}function lA(){var a=0,b=0,d=0;a=i;b=oq(121320,4)|0;if((b|0)==-1){eJ(143872,(d=i,i=i+1|0,i=i+7>>3<<3,c[d>>2]=0,d)|0);i=d}if((ow(b)|0)!=40960){eJ(133520,(d=i,i=i+1|0,i=i+7>>3<<3,c[d>>2]=0,d)|0);i=d}ox(b,515760);b=oq(116608,4)|0;if((b|0)==-1){eJ(143872,(d=i,i=i+1|0,i=i+7>>3<<3,c[d>>2]=0,d)|0);i=d}if((ow(b)|0)!=16384){eJ(109752,(d=i,i=i+1|0,i=i+7>>3<<3,c[d>>2]=0,d)|0);i=d}ox(b,499376);b=oq(105136,4)|0;if((b|0)==-1){eJ(143872,(d=i,i=i+1|0,i=i+7>>3<<3,c[d>>2]=0,d)|0);i=d}if((ow(b)|0)!=8196){eJ(101824,(d=i,i=i+1|0,i=i+7>>3<<3,c[d>>2]=0,d)|0);i=d}ox(b,402008);eI(1,98040,(d=i,i=i+1|0,i=i+7>>3<<3,c[d>>2]=0,d)|0)|0;i=d;do{if(10<(c[128941]|0)){if((c[128941]|0)>=100){break}eI(1,94e3,(d=i,i=i+1|0,i=i+7>>3<<3,c[d>>2]=0,d)|0)|0;i=d;i=a;return}}while(0);b=0;while(1){if(b>>>0>=10240){break}c[515760+(b<<2)>>2]=(c[515760+(b<<2)>>2]&255)<<24|(c[515760+(b<<2)>>2]&65280)<<8|(c[515760+(b<<2)>>2]&16711680)>>>8|(c[515760+(b<<2)>>2]&-16777216)>>>24;b=b+1|0}b=0;while(1){if(b>>>0>=4096){break}c[499376+(b<<2)>>2]=(c[499376+(b<<2)>>2]&255)<<24|(c[499376+(b<<2)>>2]&65280)<<8|(c[499376+(b<<2)>>2]&16711680)>>>8|(c[499376+(b<<2)>>2]&-16777216)>>>24;b=b+1|0}b=0;while(1){if(b>>>0>=2049){break}c[402008+(b<<2)>>2]=(c[402008+(b<<2)>>2]&255)<<24|(c[402008+(b<<2)>>2]&65280)<<8|(c[402008+(b<<2)>>2]&16711680)>>>8|(c[402008+(b<<2)>>2]&-16777216)>>>24;b=b+1|0}eI(1,90616,(d=i,i=i+1|0,i=i+7>>3<<3,c[d>>2]=0,d)|0)|0;i=d;i=a;return}function lB(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=a;a=b;b=d;a=a>>>19;d=ly(b,c[(c[15020]|0)+(a<<2)>>2]|0)|0;f=(c[e>>2]|0)+88|0;c[f>>2]=(c[f>>2]|0)+d;d=ly(b,c[515760+(a<<2)>>2]|0)|0;a=(c[e>>2]|0)+92|0;c[a>>2]=(c[a>>2]|0)+d;return}function lC(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;if((c[144658]|0)>>>0>=11){if((c[111034]|0)!=0){a=ly(c[b+32>>2]|0,c[b+32>>2]|0)|0;d=a+(ly(c[b+36>>2]|0,c[b+36>>2]|0)|0)>>2}else{d=0}e=d}else{d=ly(c[(c[b>>2]|0)+88>>2]|0,c[(c[b>>2]|0)+88>>2]|0)|0;e=d+(ly(c[(c[b>>2]|0)+92>>2]|0,c[(c[b>>2]|0)+92>>2]|0)|0)>>2}c[b+28>>2]=e;do{if((c[144658]|0)>>>0>=9){if((c[144658]|0)>>>0>10){f=1159;break}if((c[(c[b>>2]|0)+180>>2]|0)<=59392){f=1159;break}if((c[b+28>>2]|0)>262144){c[b+28>>2]=262144}}else{f=1159}}while(0);if((f|0)==1159){if((c[b+28>>2]|0)>1048576){c[b+28>>2]=1048576}}do{if((c[111084]|0)!=0){if((c[b+204>>2]&4|0)!=0){break}f=ly((c[b+28>>2]|0)/2|0,c[515760+((((c[113660]|0)*409|0)&8191)<<2)>>2]|0)|0;if((c[b+4>>2]|0)==0){e=b+20|0;c[e>>2]=(c[e>>2]|0)+(c[b+24>>2]|0);if((c[b+20>>2]|0)>2686976){c[b+20>>2]=2686976;c[b+24>>2]=0}if((c[b+20>>2]|0)<1343488){c[b+20>>2]=1343488;if((c[b+24>>2]|0)<=0){c[b+24>>2]=1}}if((c[b+24>>2]|0)!=0){e=b+24|0;c[e>>2]=(c[e>>2]|0)+16384;if((c[b+24>>2]|0)==0){c[b+24>>2]=1}}}c[b+16>>2]=(c[(c[b>>2]|0)+32>>2]|0)+(c[b+20>>2]|0)+f;if((c[b+16>>2]|0)<=((c[(c[b>>2]|0)+72>>2]|0)-262144|0)){return}c[b+16>>2]=(c[(c[b>>2]|0)+72>>2]|0)-262144;return}}while(0);c[b+16>>2]=(c[(c[b>>2]|0)+32>>2]|0)+2686976;if((c[b+16>>2]|0)>((c[(c[b>>2]|0)+72>>2]|0)-262144|0)){c[b+16>>2]=(c[(c[b>>2]|0)+72>>2]|0)-262144}return}function lD(d){d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;i=i+8|0;f=e|0;g=d;d=g+8|0;h=c[g>>2]|0;j=h+44|0;c[j>>2]=(c[j>>2]|0)+(b[d+2>>1]<<16);c[111084]=(c[h+32>>2]|0)<=(c[h+68>>2]|0);do{if((c[142838]|0)!=0){if((g|0)!=(442960+((c[142806]|0)*288|0)|0)){break}d9(b[d+2>>1]<<16)}}while(0);if((c[144658]|0)>>>0<7){k=1190}else{if((c[144658]|0)>>>0>=11){k=1190}}do{if((k|0)==1190){if((a[d|0]|a[d+1|0]|0)!=0){break}i=e;return}}while(0);if((c[111084]|0)!=0){k=1193}else{j=h+120|0;if((c[j>>2]&0|0)!=0|(c[j+4>>2]&2|0)!=0){k=1193}}if((k|0)==1193){k=th(h,f)|0;if((c[f>>2]|0)<59392){l=k}else{l=2048}f=l;if((a[d|0]|0)!=0){l=c[h+44>>2]|0;lE(g,l,ab(a[d|0]|0,f)|0);l=c[h+44>>2]|0;lB(g,l,ab(a[d|0]|0,k)|0)}if((a[d+1|0]|0)!=0){l=(c[h+44>>2]|0)-1073741824|0;lE(g,l,ab(a[d+1|0]|0,f)|0);f=(c[h+44>>2]|0)-1073741824|0;lB(g,f,ab(a[d+1|0]|0,k)|0)}}if((c[h+116>>2]|0)==5292){k=h;dR(k,150)|0}i=e;return}function lE(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=a;a=b;b=d;if((c[144658]|0)>>>0>=11){d=a>>>19;a=d;f=ly(b,c[(c[15020]|0)+(d<<2)>>2]|0)|0;d=e+32|0;c[d>>2]=(c[d>>2]|0)+f;f=ly(b,c[515760+(a<<2)>>2]|0)|0;a=e+36|0;c[a>>2]=(c[a>>2]|0)+f;return}else{return}}function lF(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=b;f3(d);if((c[d+20>>2]|0)>393216){b=d+20|0;c[b>>2]=(c[b>>2]|0)-65536}if((c[d+20>>2]|0)<393216){c[d+20>>2]=393216}c[d+24>>2]=0;c[111084]=(c[(c[d>>2]|0)+32>>2]|0)<=(c[(c[d>>2]|0)+68>>2]|0);lC(d);do{if((c[d+236>>2]|0)!=0){if((c[d+236>>2]|0)==(c[d>>2]|0)){e=1229;break}b=t_(c[(c[d>>2]|0)+24>>2]|0,c[(c[d>>2]|0)+28>>2]|0,c[(c[d+236>>2]|0)+24>>2]|0,c[(c[d+236>>2]|0)+28>>2]|0)|0;f=b-(c[(c[d>>2]|0)+44>>2]|0)|0;do{if(f>>>0<59652323){e=1221}else{if(f>>>0>4235314973){e=1221;break}if(f>>>0<2147483648){g=(c[d>>2]|0)+44|0;c[g>>2]=(c[g>>2]|0)+59652323}else{g=(c[d>>2]|0)+44|0;c[g>>2]=(c[g>>2]|0)-59652323}}}while(0);if((e|0)==1221){c[(c[d>>2]|0)+44>>2]=b;if((c[d+228>>2]|0)!=0){f=d+228|0;c[f>>2]=(c[f>>2]|0)-1}}}else{e=1229}}while(0);if((e|0)==1229){if((c[d+228>>2]|0)!=0){e=d+228|0;c[e>>2]=(c[e>>2]|0)-1}}if((a[d+15|0]&2|0)==0){h=d;eb(h);return}c[d+4>>2]=2;h=d;eb(h);return}function lG(d){d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=d;do{if((c[113400]|0)!=0){if(!1){break}if((442960+((c[142806]|0)*288|0)|0)!=(e|0)){break}c[111066]=c[(c[e>>2]|0)+24>>2];c[111067]=c[(c[e>>2]|0)+28>>2];c[111068]=c[e+16>>2];d=d7(c[(c[e>>2]|0)+44>>2]|0)|0;c[111069]=d+(c[100346]|0)}}while(0);if((c[e+204>>2]&1|0)!=0){d=(c[e>>2]|0)+120|0;f=c[d+4>>2]|0;c[d>>2]=c[d>>2]|4096;c[d+4>>2]=f}else{f=(c[e>>2]|0)+120|0;d=c[f+4>>2]|0;c[f>>2]=c[f>>2]&-4097;c[f+4>>2]=d}d=e+8|0;f=(c[e>>2]|0)+120|0;if((c[f>>2]&128|0)!=0|(c[f+4>>2]&0|0)!=0){b[d+2>>1]=0;a[d|0]=100;a[d+1|0]=0;f=(c[e>>2]|0)+120|0;g=c[f+4>>2]|0;c[f>>2]=c[f>>2]&-129;c[f+4>>2]=g}if((c[e+4>>2]|0)==1){lF(e);return}if((b[(c[e>>2]|0)+148>>1]|0)!=0){g=(c[e>>2]|0)+148|0;b[g>>1]=(b[g>>1]|0)-1&65535}else{lD(e)}lC(e);if((b[(c[c[(c[e>>2]|0)+64>>2]>>2]|0)+190>>1]|0)!=0){kn(e)}if((a[d+7|0]&4|0)!=0){g=(a[d+7|0]&120)>>3;if((c[144658]|0)>>>0<7){do{if((g|0)==0){if((c[e+156>>2]|0)==0){break}if((c[e+120>>2]|0)==7){if((c[e+56>>2]|0)!=0){break}}g=7}}while(0);do{if((c[14940]|0)==2){if((g|0)!=2){break}if((c[e+160>>2]|0)==0){break}if((c[e+120>>2]|0)==8){break}g=8}}while(0)}do{if((c[e+128+(g<<2)>>2]|0)!=0){if((g|0)==(c[e+120>>2]|0)){break}if((g|0)!=5){if((g|0)!=6){h=1271}else{h=1270}}else{h=1270}if((h|0)==1270){if((c[14940]|0)!=0){h=1271}}if((h|0)==1271){c[e+124>>2]=g}}}while(0)}if((a[d+7|0]&2|0)!=0){if((c[e+200>>2]|0)==0){tE(e);c[e+200>>2]=1}}else{c[e+200>>2]=0}f3(e);if((c[e+56>>2]|0)!=0){d=e+56|0;c[d>>2]=(c[d>>2]|0)+1}if((c[e+52>>2]|0)>0){d=e+52|0;c[d>>2]=(c[d>>2]|0)-1}if((c[e+60>>2]|0)>0){d=e+60|0;g=(c[d>>2]|0)-1|0;c[d>>2]=g;if((g|0)==0){g=(c[e>>2]|0)+120|0;d=c[g+4>>2]|0;c[g>>2]=c[g>>2]&-262145;c[g+4>>2]=d}}if((c[e+72>>2]|0)>0){d=e+72|0;c[d>>2]=(c[d>>2]|0)-1}if((c[e+64>>2]|0)>0){d=e+64|0;c[d>>2]=(c[d>>2]|0)-1}if((c[e+228>>2]|0)!=0){d=e+228|0;c[d>>2]=(c[d>>2]|0)-1}if((c[e+232>>2]|0)!=0){d=e+232|0;c[d>>2]=(c[d>>2]|0)-1}do{if((c[e+52>>2]|0)>128){h=1297}else{if((c[e+52>>2]&8|0)!=0){h=1297;break}if((c[e+72>>2]|0)>128){i=1}else{i=(c[e+72>>2]&8|0)!=0}j=i&1}}while(0);if((h|0)==1297){j=32}c[e+244>>2]=j;return}function lH(a){a=a|0;var d=0,e=0,f=0;d=a;a=0;e=c[156116]|0;while(1){if((e|0)==0){break}f=c[e>>2]|0;do{if((c[f+68>>2]|0)==(b[d+24>>1]|0)){if((c[f+64>>2]|0)!=0){break}c[f+64>>2]=c[f+72>>2];c[f+8>>2]=388;a=1}}while(0);e=c[e+4>>2]|0}return a|0}function lI(a){a=a|0;var d=0,e=0,f=0;d=a;a=0;e=c[156116]|0;while(1){if((e|0)==0){break}f=c[e>>2]|0;do{if((c[f+64>>2]|0)!=0){if((c[f+68>>2]|0)!=(b[d+24>>1]|0)){break}c[f+72>>2]=c[f+64>>2];c[f+64>>2]=0;c[f+8>>2]=0;a=1}}while(0);e=c[e+4>>2]|0}return a|0}function lJ(){var a=0;a=0;while(1){if((a|0)>=6){break}c[433664+(a*28|0)>>2]=0;c[433668+(a*28|0)>>2]=0;c[433672+(a*28|0)>>2]=0;c[433676+(a*28|0)>>2]=0;c[433680+(a*28|0)>>2]=0;c[433684+(a*28|0)>>2]=0;c[433688+(a*28|0)>>2]=0;a=a+1|0}return}function lK(a){a=a|0;var d=0,e=0,f=0,g=0;d=a;a=c[d+64>>2]|0;if((a|0)==1){e=nY(c[d+28>>2]|0,c[d+40>>2]|0,c[d+36>>2]|0,0,1,c[d+64>>2]|0)|0;if((c[113660]&7|0)==0){f=c[d+24>>2]|0;if(!((f|0)==7|(f|0)==13)){hG((c[d+28>>2]|0)+52|0,22)}}if((e|0)==2){switch(c[d+24>>2]|0){case 1:case 8:{lL(d);break};case 11:case 10:{b[(c[d+28>>2]|0)+190>>1]=c[d+52>>2]&65535;b[(c[d+28>>2]|0)+192>>1]=c[d+56>>2]&65535;g=1337;break};case 9:{g=1337;break};case 7:{hG((c[d+28>>2]|0)+52|0,19);g=1339;break};case 13:case 12:case 6:case 5:{g=1339;break};default:{}}if((g|0)==1337){b[(c[d+28>>2]|0)+186>>1]=b[d+60>>1]|0;lL(d)}else if((g|0)==1339){c[d+64>>2]=-1}}return}else if((a|0)==0){return}else if((a|0)==(-1|0)){e=nY(c[d+28>>2]|0,c[d+40>>2]|0,c[d+32>>2]|0,c[d+48>>2]|0,1,c[d+64>>2]|0)|0;if((c[113660]&7|0)==0){a=c[d+24>>2]|0;if(!((a|0)==7|(a|0)==13)){hG((c[d+28>>2]|0)+52|0,22)}}if((e|0)==2){switch(c[d+24>>2]|0){case 13:case 12:{if((c[d+44>>2]|0)<196608){c[d+40>>2]=c[d+44>>2]}c[d+64>>2]=1;break};case 7:{hG((c[d+28>>2]|0)+52|0,19);g=1354;break};case 5:{g=1354;break};case 6:{g=1355;break};case 11:case 10:{b[(c[d+28>>2]|0)+190>>1]=c[d+52>>2]&65535;b[(c[d+28>>2]|0)+192>>1]=c[d+56>>2]&65535;g=1357;break};case 9:{g=1357;break};case 4:case 0:case 2:case 3:case 8:{lL(d);break};default:{}}if((g|0)==1354){c[d+40>>2]=65536;g=1355}else if((g|0)==1357){b[(c[d+28>>2]|0)+186>>1]=b[d+60>>1]|0;lL(d)}if((g|0)==1355){c[d+64>>2]=1}}else{if((e|0)==1){switch(c[d+24>>2]|0){case 12:case 13:{if((c[d+44>>2]|0)<196608){c[d+40>>2]=8192}break};case 7:case 5:case 4:{c[d+40>>2]=8192;break};default:{}}}}return}else{return}}function lL(a){a=a|0;var b=0,d=0,e=0;b=a;a=c[b+76>>2]|0;c[(c[b+28>>2]|0)+108>>2]=0;lv(b|0);b=c[a+4>>2]|0;c[c[a+8>>2]>>2]=b;if((b|0)==0){d=a;e=d;ul(e);return}c[(c[a+4>>2]|0)+8>>2]=c[a+8>>2];d=a;e=d;ul(e);return}function lM(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=a;a=d;d=-1;f=0;g=a;if((g|0)==6|(g|0)==7|(g|0)==5){f=lH(e)|0}while(1){g=j6(e,d)|0;d=g;if((g|0)<0){break}g=(c[108410]|0)+(d*196|0)|0;if((kg(1,g)|0)!=0){continue}f=1;h=ug(80,5,0)|0;wS(h|0,0,80);lu(h|0);c[g+108>>2]=h;c[h+8>>2]=388;c[h+28>>2]=g;c[h+48>>2]=0;switch(a|0){case 6:{c[h+48>>2]=1;c[h+36>>2]=c[g+16>>2];c[h+32>>2]=(c[g+12>>2]|0)+524288;c[h+64>>2]=-1;c[h+40>>2]=131072;break};case 7:case 5:{c[h+48>>2]=1;c[h+36>>2]=c[g+16>>2];i=1391;break};case 4:case 0:{i=1391;break};case 1:{c[h+36>>2]=ka(g)|0;c[h+64>>2]=1;c[h+40>>2]=65536;break};case 2:{c[h+32>>2]=j9(g)|0;c[h+64>>2]=-1;c[h+40>>2]=65536;break};case 3:{c[h+32>>2]=j2(g)|0;c[h+64>>2]=-1;c[h+40>>2]=65536;break};default:{}}if((i|0)==1391){i=0;c[h+32>>2]=c[g+12>>2];if((a|0)!=0){j=h+32|0;c[j>>2]=(c[j>>2]|0)+524288}c[h+64>>2]=-1;c[h+40>>2]=65536}c[h+68>>2]=b[g+194>>1]|0;c[h+24>>2]=a;lN(h)}return f|0}function lN(a){a=a|0;var b=0;b=a;a=ug(12,1,0)|0;c[a>>2]=b;c[b+76>>2]=a;b=c[156116]|0;c[a+4>>2]=b;if((b|0)!=0){c[(c[a+4>>2]|0)+8>>2]=a+4}c[a+8>>2]=624464;c[156116]=a;return}function lO(){var a=0;while(1){if((c[156116]|0)==0){break}a=c[(c[156116]|0)+4>>2]|0;ul(c[156116]|0);c[156116]=a}return}function lP(){var a=0,b=0;a=83744;while(1){if((c[a>>2]|0)==0){break}b=vF(os(c[a>>2]|0)|0)|0;c[c[a+4>>2]>>2]=b;a=a+8|0}return}function lQ(){return c[144612]|0}function lR(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return}function lS(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return}function lT(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return}function lU(a,b){a=a|0;b=b|0;return}function lV(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return}function lW(a,b){a=a|0;b=b|0;return}function lX(e){e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0,v=0.0,w=0,x=0,y=0,z=0,A=0;f=e;if((lQ()|0)==4){g=0}else{g=c[144620]|0}e=g;g=os(120920)|0;h=oq(143800,4)|0;i=vF(g)|0;j=vF(h)|0;if((lQ()|0)==4){k=0}else{k=c[100360]<<8}l=j+k|0;k=(ow(g)|0)/768|0;if((c[37116]|0)!=(c[100360]|0)){if((c[156408]|0)!=0){ul(c[156408]|0)}if((c[156406]|0)!=0){ul(c[156406]|0)}if((c[156404]|0)!=0){ul(c[156404]|0)}c[156408]=0;c[156406]=0;c[156404]=0;c[37116]=c[100360]}if((f|0)==3){if((c[156404]|0)==0){c[156404]=ug(k<<8<<2<<6,1,0)|0;m=0;while(1){if((m|0)>=(k|0)){break}n=0;while(1){if((n|0)>=256){break}o=a[l+(d[i+(((m<<8)+n|0)*3|0)|0]|0)|0]|0;p=a[l+(d[i+((((m<<8)+n|0)*3|0)+1)|0]|0)|0]|0;q=a[l+(d[i+((((m<<8)+n|0)*3|0)+2)|0]|0)|0]|0;r=+(o&255|0)>220.0?0.0:.5;s=+(p&255|0)>220.0?0.0:.5;t=+(q&255|0)>220.0?0.0:.5;u=0;while(1){if((u|0)>=64){break}v=+(u|0)/63.0;w=~~(+(o&255|0)*v+r);x=~~(+(p&255|0)*v+s);y=~~(+(q&255|0)*v+t);c[(c[156404]|0)+(((m<<8)+n<<6)+u<<2)>>2]=w<<16|x<<8|y;u=u+1|0}n=n+1|0}m=m+1|0}}c[156256]=(c[156404]|0)+(e<<8<<6<<2);z=g;vI(z);A=h;vI(A);return}if((f|0)==2){if((c[156406]|0)==0){c[156406]=ug(k<<8<<1<<6,1,0)|0;m=0;while(1){if((m|0)>=(k|0)){break}n=0;while(1){if((n|0)>=256){break}o=a[l+(d[i+(((m<<8)+n|0)*3|0)|0]|0)|0]|0;p=a[l+(d[i+((((m<<8)+n|0)*3|0)+1)|0]|0)|0]|0;q=a[l+(d[i+((((m<<8)+n|0)*3|0)+2)|0]|0)|0]|0;r=+(o&255|0)>220.0?0.0:.5;s=+(p&255|0)>220.0?0.0:.5;t=+(q&255|0)>220.0?0.0:.5;u=0;while(1){if((u|0)>=64){break}v=+(u|0)/63.0;w=~~(+((o&255)>>3|0)*v+r);x=~~(+((p&255)>>2|0)*v+s);y=~~(+((q&255)>>3|0)*v+t);b[(c[156406]|0)+(((m<<8)+n<<6)+u<<1)>>1]=(w<<11|x<<5|y)&65535;u=u+1|0}n=n+1|0}m=m+1|0}}c[156258]=(c[156406]|0)+(e<<8<<6<<1)}else{if((f|0)==1){if((c[156408]|0)==0){c[156408]=ug(k<<8<<1<<6,1,0)|0;m=0;while(1){if((m|0)>=(k|0)){break}n=0;while(1){if((n|0)>=256){break}o=a[l+(d[i+(((m<<8)+n|0)*3|0)|0]|0)|0]|0;p=a[l+(d[i+((((m<<8)+n|0)*3|0)+1)|0]|0)|0]|0;q=a[l+(d[i+((((m<<8)+n|0)*3|0)+2)|0]|0)|0]|0;r=+(o&255|0)>220.0?0.0:.5;s=+(p&255|0)>220.0?0.0:.5;t=+(q&255|0)>220.0?0.0:.5;u=0;while(1){if((u|0)>=64){break}v=+(u|0)/63.0;w=~~(+((o&255)>>3|0)*v+r);x=~~(+((p&255)>>3|0)*v+s);y=~~(+((q&255)>>3|0)*v+t);b[(c[156408]|0)+(((m<<8)+n<<6)+u<<1)>>1]=(w<<10|x<<5|y)&65535;u=u+1|0}n=n+1|0}m=m+1|0}}c[156260]=(c[156408]|0)+(e<<8<<6<<1)}}z=g;vI(z);A=h;vI(A);return}function lY(){if((lQ()|0)!=1){lZ(1)}if((lQ()|0)!=2){lZ(2)}if((lQ()|0)==3){return}lZ(3);return}function lZ(a){a=a|0;var b=0;b=a;if((b|0)==1){if((c[156408]|0)!=0){ul(c[156408]|0)}c[156408]=0;c[156260]=0}if((b|0)==2){if((c[156406]|0)!=0){ul(c[156406]|0)}c[156406]=0;c[156258]=0}if((b|0)!=3){return}if((c[156404]|0)!=0){ul(c[156404]|0)}c[156404]=0;c[156256]=0;return}function l_(a){a=a|0;var b=0,d=0;b=a;c[144620]=b;if((lQ()|0)==4){return}vV(b);do{if((lQ()|0)==1){d=1515}else{if((lQ()|0)==2){d=1515;break}if((lQ()|0)==3){d=1515}}}while(0);if((d|0)==1515){if((oq(120920,0)|0)>=0){lX(lQ()|0)}}return}function l$(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;g=b;b=d+(ab(c[433680+(g*28|0)>>2]|0,e)|0)|0;a[(c[433664+(g*28|0)>>2]|0)+b|0]=f;return}function l0(a,d,e,f,g,h){a=a|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;i=a;a=f;f=g;g=(c[433664+(i*28|0)>>2]|0)+(d<<1)|0;d=g+((ab(e,c[433684+(i*28|0)>>2]|0)|0)<<1)|0;e=b[(c[156260]|0)+(((h&255)<<6)+63<<1)>>1]|0;while(1){h=f;f=h-1|0;if((h|0)==0){break}h=0;while(1){if((h|0)>=(a|0)){break}b[d+(h<<1)>>1]=e;h=h+1|0}d=d+(c[433684+(i*28|0)>>2]<<1)|0}return}function l1(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0;g=a;a=b[(c[156260]|0)+(((f&255)<<6)+63<<1)>>1]|0;f=d+(ab(c[433684+(g*28|0)>>2]|0,e)|0)|0;b[(c[433664+(g*28|0)>>2]|0)+(f<<1)>>1]=a;return}function l2(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;if((d|0)==4){d=0}a=d;if((a|0)==3){eI(1,105096,(e=i,i=i+1|0,i=i+7>>3<<3,c[e>>2]=0,e)|0)|0;i=e;c[37128]=4;c[37120]=14;c[37122]=12;c[37126]=48;c[37118]=10;c[37124]=32;c[144612]=3;vw();i=b;return}else if((a|0)==0){eI(1,133440,(e=i,i=i+1|0,i=i+7>>3<<3,c[e>>2]=0,e)|0)|0;i=e;c[37128]=4;c[37120]=6;c[37122]=12;c[37126]=48;c[37118]=4;c[37124]=32;c[144612]=0;vw();i=b;return}else if((a|0)==2){eI(1,109704,(e=i,i=i+1|0,i=i+7>>3<<3,c[e>>2]=0,e)|0)|0;i=e;c[37128]=4;c[37120]=4;c[37122]=12;c[37126]=48;c[37118]=6;c[37124]=32;c[144612]=2;vw();i=b;return}else if((a|0)==1){eI(1,116456,(e=i,i=i+1|0,i=i+7>>3<<3,c[e>>2]=0,e)|0)|0;i=e;c[37128]=4;c[37120]=2;c[37122]=12;c[37126]=48;c[37118]=2;c[37124]=32;c[144612]=1;vw();i=b;return}else{vw();i=b;return}}function l3(a,b,d,e,f,g,h,i,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0;k=a;a=b;b=d;d=e;e=f;f=g;g=h;h=i;if((j&4|0)!=0){k=(ab(k,c[38570]|0)|0)/320|0;a=(ab(a,c[38574]|0)|0)/200|0;d=(ab(d,c[38570]|0)|0)/320|0;e=(ab(e,c[38574]|0)|0)/200|0;f=(ab(f,c[38570]|0)|0)/320|0;g=(ab(g,c[38574]|0)|0)/200|0}j=c[433664+(b*28|0)>>2]|0;i=j+(ab(c[433680+(b*28|0)>>2]|0,a)|0)|0;a=i+(ab(k,me()|0)|0)|0;k=c[433664+(h*28|0)>>2]|0;i=k+(ab(c[433680+(h*28|0)>>2]|0,g)|0)|0;g=i+(ab(f,me()|0)|0)|0;while(1){if((e|0)<=0){break}f=g;i=a;k=ab(d,me()|0)|0;wQ(f|0,i|0,k)|0;a=a+(c[433680+(b*28|0)>>2]|0)|0;g=g+(c[433680+(h*28|0)>>2]|0)|0;e=e-1|0}return}function l4(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;h=a;a=e;e=f;f=g;g=(c[433664+(h*28|0)>>2]|0)+b|0;b=g+(ab(d,c[433680+(h*28|0)>>2]|0)|0)|0;while(1){d=e;e=d-1|0;if((d|0)==0){break}wS(b|0,f&255|0,a|0);b=b+(c[433680+(h*28|0)>>2]|0)|0}return}function l5(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0;g=d;mj(a,b,c,u2(g)|0,e,f);u3(g);return}function l6(a,e){a=a|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=e;e=c[124840]|0;g=e+(og(a)|0)|0;a=g;e=vF(g)|0;g=64;h=64;if((lQ()|0)==0){i=c[433664+(f*28|0)>>2]|0;while(1){j=g;g=j-1|0;if((j|0)==0){break}j=i;k=e;l=h;wQ(j|0,k|0,l)|0;e=e+h|0;i=i+(c[433680+(f*28|0)>>2]|0)|0}}else{if((lQ()|0)==1){i=c[433664+(f*28|0)>>2]|0;while(1){l=g;g=l-1|0;if((l|0)==0){break}l=0;while(1){if((l|0)>=(h|0)){break}b[i+(l<<1)>>1]=b[(c[156260]|0)+(((d[e+l|0]|0)<<6)+63<<1)>>1]|0;l=l+1|0}e=e+h|0;i=i+(c[433684+(f*28|0)>>2]<<1)|0}}else{if((lQ()|0)==2){i=c[433664+(f*28|0)>>2]|0;while(1){l=g;g=l-1|0;if((l|0)==0){break}l=0;while(1){if((l|0)>=(h|0)){break}b[i+(l<<1)>>1]=b[(c[156258]|0)+(((d[e+l|0]|0)<<6)+63<<1)>>1]|0;l=l+1|0}e=e+h|0;i=i+(c[433684+(f*28|0)>>2]<<1)|0}}else{if((lQ()|0)==3){i=c[433664+(f*28|0)>>2]|0;while(1){l=g;g=l-1|0;if((l|0)==0){break}l=0;while(1){if((l|0)>=(h|0)){break}c[i+(l<<2)>>2]=c[(c[156256]|0)+(((d[e+l|0]|0)<<6)+63<<2)>>2];l=l+1|0}e=e+h|0;i=i+(c[433688+(f*28|0)>>2]<<2)|0}}}}}i=0;while(1){if((i|0)>=(c[38574]|0)){break}h=(i|0)!=0?0:64;while(1){if((h|0)>=(c[38570]|0)){break}if(((c[38570]|0)-h|0)<64){m=(c[38570]|0)-h|0}else{m=64}if(((c[38574]|0)-i|0)<64){n=(c[38574]|0)-i|0}else{n=64}ce[c[37128]&7](0,0,f,m,n,h,i,f,0);h=h+64|0}i=i+64|0}vI(a);return}function l7(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;d=a;a=b;b=(c[d+8>>2]|0)-(c[d>>2]|0)|0;if((b|0)<0){e=-b|0}else{e=b}f=e<<1;e=(b|0)<0?-1:1;b=(c[d+12>>2]|0)-(c[d+4>>2]|0)|0;if((b|0)<0){g=-b|0}else{g=b}h=g<<1;g=(b|0)<0?-1:1;b=c[d>>2]|0;i=c[d+4>>2]|0;if((f|0)>(h|0)){j=h-((f|0)/2|0)|0;while(1){ch[c[37118]&15](0,b,i,a&255);if((b|0)==(c[d+8>>2]|0)){break}if((j|0)>=0){i=i+g|0;j=j-f|0}b=b+e|0;j=j+h|0}return}else{j=f-((h|0)/2|0)|0;while(1){ch[c[37118]&15](0,b,i,a&255);if((i|0)==(c[d+12>>2]|0)){break}if((j|0)>=0){b=b+e|0;j=j-h|0}i=i+g|0;j=j+f|0}return}}function l8(a){a=a|0;var b=0,c=0;b=a;if((b|0)==1){c=2}else if((b|0)==0){c=1}else if((b|0)==2){c=2}else if((b|0)==3){c=4}else{c=0}return c|0}function l9(){var a=0,b=0;a=c[144612]|0;if((a|0)==0){b=8}else if((a|0)==1){b=15}else if((a|0)==2){b=16}else if((a|0)==3){b=32}else{b=0}return b|0}function ma(a,d,e,f,g,h){a=a|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;i=a;a=f;f=g;g=(c[433664+(i*28|0)>>2]|0)+(d<<1)|0;d=g+((ab(e,c[433684+(i*28|0)>>2]|0)|0)<<1)|0;e=b[(c[156258]|0)+(((h&255)<<6)+63<<1)>>1]|0;while(1){h=f;f=h-1|0;if((h|0)==0){break}h=0;while(1){if((h|0)>=(a|0)){break}b[d+(h<<1)>>1]=e;h=h+1|0}d=d+(c[433684+(i*28|0)>>2]<<1)|0}return}function mb(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0;g=a;a=b[(c[156258]|0)+(((f&255)<<6)+63<<1)>>1]|0;f=d+(ab(c[433684+(g*28|0)>>2]|0,e)|0)|0;b[(c[433664+(g*28|0)>>2]|0)+(f<<1)>>1]=a;return}function mc(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;h=a;a=e;e=f;f=(c[433664+(h*28|0)>>2]|0)+(b<<2)|0;b=f+((ab(d,c[433688+(h*28|0)>>2]|0)|0)<<2)|0;d=c[(c[156256]|0)+(((g&255)<<6)+63<<2)>>2]|0;while(1){g=e;e=g-1|0;if((g|0)==0){break}g=0;while(1){if((g|0)>=(a|0)){break}c[b+(g<<2)>>2]=d;g=g+1|0}b=b+(c[433688+(h*28|0)>>2]<<2)|0}return}function md(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=a;a=c[(c[156256]|0)+(((e&255)<<6)+63<<2)>>2]|0;e=b+(ab(c[433688+(f*28|0)>>2]|0,d)|0)|0;c[(c[433664+(f*28|0)>>2]|0)+(e<<2)>>2]=a;return}function me(){return l8(c[144612]|0)|0}function mf(a){a=a|0;var b=0;b=a;if((c[b+4>>2]|0)!=0){return}if((ab(c[b+16>>2]|0,c[b+12>>2]|0)|0)>0){c[b>>2]=ug(ab(c[b+16>>2]|0,c[b+12>>2]|0)|0,1,0)|0}return}function mg(){var a=0;a=0;while(1){if((a|0)>=6){break}mf(433664+(a*28|0)|0);a=a+1|0}return}function mh(a){a=a|0;var b=0;b=a;if((c[b+4>>2]|0)!=0){return}ul(c[b>>2]|0);c[b>>2]=0;return}function mi(){var a=0;a=0;while(1){if((a|0)>=6){break}mh(433664+(a*28|0)|0);a=a+1|0}return}function mj(b,e,f,g,h,j){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;k=i;i=i+128|0;l=k|0;m=k+72|0;n=b;b=e;e=f;f=g;g=h;h=j;if((g|0)<11){o=c[578792+(g<<2)>>2]|0}else{o=(c[100366]|0)+(g-11-1<<8)|0}b=b-(c[f+20>>2]|0)|0;n=n-(c[f+16>>2]|0)|0;if((h&4|0)!=0){do{if((c[38570]|0)==320){if((c[38574]|0)!=200){break}h=h&-5}}while(0)}if((o|0)==0){h=h&-3}do{if((lQ()|0)==0){if((h&4|0)!=0){break}g=c[433664+(e*28|0)>>2]|0;j=g+(ab(b,c[433680+(e*28|0)>>2]|0)|0)|0;g=j+(ab(n,me()|0)|0)|0;j=c[f>>2]|0;do{if((b|0)>=0){if((h&4|0)!=0){p=200}else{p=c[38574]|0}if((b+(c[f+4>>2]|0)|0)>(p|0)){break}j=j-1|0;q=0;while(1){if(q>>>0>j>>>0){break}if((h&1|0)!=0){r=j-q|0}else{r=q}s=vi(f,r)|0;if((n|0)>=0){if((n|0)>=(c[38570]|0)){t=1710;break}u=0;while(1){if((u|0)>=(c[s>>2]|0)){break}v=(c[s+4>>2]|0)+(u*12|0)|0;w=(c[s+8>>2]|0)+(c[v>>2]|0)|0;x=g+(ab(c[v>>2]|0,c[433680+(e*28|0)>>2]|0)|0)|0;y=c[v+4>>2]|0;if((h&2|0)!=0){v=y-4|0;y=v;if((v|0)>=0){do{v=a[w|0]|0;z=a[w+1|0]|0;v=a[o+(v&255)|0]|0;z=a[o+(z&255)|0]|0;a[x|0]=v;a[x+(c[433680+(e*28|0)>>2]|0)|0]=z;x=x+(c[433680+(e*28|0)>>2]<<1)|0;v=a[w+2|0]|0;z=a[w+3|0]|0;v=a[o+(v&255)|0]|0;z=a[o+(z&255)|0]|0;w=w+4|0;a[x|0]=v;a[x+(c[433680+(e*28|0)>>2]|0)|0]=z;x=x+(c[433680+(e*28|0)>>2]<<1)|0;z=y-4|0;y=z;}while((z|0)>=0)}z=y+4|0;y=z;if((z|0)!=0){do{z=w;w=z+1|0;a[x]=a[o+(d[z]|0)|0]|0;x=x+(c[433680+(e*28|0)>>2]|0)|0;z=y-1|0;y=z;}while((z|0)!=0)}}else{z=y-4|0;y=z;if((z|0)>=0){do{z=a[w|0]|0;v=a[w+1|0]|0;a[x|0]=z;a[x+(c[433680+(e*28|0)>>2]|0)|0]=v;x=x+(c[433680+(e*28|0)>>2]<<1)|0;z=a[w+2|0]|0;v=a[w+3|0]|0;w=w+4|0;a[x|0]=z;a[x+(c[433680+(e*28|0)>>2]|0)|0]=v;x=x+(c[433680+(e*28|0)>>2]<<1)|0;v=y-4|0;y=v;}while((v|0)>=0)}v=y+4|0;y=v;if((v|0)!=0){do{v=w;w=v+1|0;a[x]=a[v]|0;x=x+(c[433680+(e*28|0)>>2]|0)|0;v=y-1|0;y=v;}while((v|0)!=0)}}u=u+1|0}}g=g+1|0;q=q+1|0;n=n+1|0}i=k;return}}while(0);g=n;j=b;q=n+(c[f>>2]|0)|0;u=b+(c[f+4>>2]|0)|0;s=h;eI(4,101696,(y=i,i=i+40|0,c[y>>2]=g,c[y+8>>2]=j,c[y+16>>2]=q,c[y+24>>2]=u,c[y+32>>2]=s,y)|0)|0;i=y;i=k;return}}while(0);r=(c[f>>2]<<16)-1|0;p=(c[38570]<<16|0)/320|0;y=20971520/(c[38570]|0)|0;s=(c[38574]<<16|0)/200|0;u=13107200/(c[38574]|0)|0;q=m;wQ(q|0,63384,56)|0;pm(l);c[15846]=c[433664+(e*28|0)>>2];c[15847]=c[433664+(e*28|0)>>2];c[15848]=c[433664+(e*28|0)>>2];c[15849]=c[433680+(e*28|0)>>2];c[15850]=c[433684+(e*28|0)>>2];c[15851]=c[433688+(e*28|0)>>2];if((h&4|0)==0){p=65536;y=65536;s=65536;u=65536}if((h&2|0)!=0){A=pv(2,c[15856]|0,0)|0;c[l+52>>2]=o}else{A=pv(0,c[15856]|0,0)|0}o=(ab(n,p)|0)>>16;e=(ab(b,s)|0)>>16;q=(ab(n+(c[f>>2]|0)|0,p)|0)>>16;p=(ab(b+(c[f+4>>2]|0)|0,s)|0)>>16;c[l+24>>2]=c[f+4>>2];c[l+16>>2]=u;if((c[f>>2]|0)>(c[f+4>>2]|0)){B=c[f>>2]|0}else{B=c[f+4>>2]|0}c[l+60>>2]=(B|0)>8;c[l+64>>2]=c[15858];if((c[15856]|0)==2){if((a[f+12|0]|0)!=0){C=-32768}else{C=(c[f>>2]<<16)-32768|0}}else{C=0}c[l>>2]=o;while(1){if((c[l>>2]|0)>=(q|0)){break}if((h&1|0)!=0){D=r-C>>16}else{D=C>>16}o=D;B=vi(f,o)|0;u=vi(f,o-1|0)|0;n=vi(f,o+1|0)|0;if((c[l>>2]|0)>=0){if((c[l>>2]|0)>=(c[38570]|0)){t=1763;break}if((h&1|0)!=0){E=(c[f>>2]<<16)-C|0}else{E=C}c[l+28>>2]=(E|0)%(c[f>>2]<<16|0)|0;o=0;while(1){if((o|0)>=(c[B>>2]|0)){break}j=(c[B+4>>2]|0)+(o*12|0)|0;g=0;c[l+4>>2]=(ab(b+(c[j>>2]|0)|0,s)|0)>>16;c[l+8>>2]=(ab(b+(c[j>>2]|0)+(c[j+4>>2]|0)|0,s)|0)-32768>>16;c[l+56>>2]=c[j+8>>2];L2288:do{if((c[l+8>>2]|0)<0){t=1771}else{if((c[l+8>>2]|0)<(e|0)){t=1771;break}do{if((c[l+4>>2]|0)<(c[38574]|0)){if((c[l+4>>2]|0)>=(p|0)){break}if((c[l+8>>2]|0)>=(p|0)){c[l+8>>2]=p-1;x=l+56|0;c[x>>2]=c[x>>2]&-13}if((c[l+8>>2]|0)>=(c[38574]|0)){c[l+8>>2]=(c[38574]|0)-1;x=l+56|0;c[x>>2]=c[x>>2]&-13}if((c[l+4>>2]|0)<0){g=-(c[l+4>>2]|0)|0;c[l+4>>2]=0;x=l+56|0;c[x>>2]=c[x>>2]&-4}if((c[l+4>>2]|0)<(e|0)){g=e-(c[l+4>>2]|0)|0;c[l+4>>2]=e;x=l+56|0;c[x>>2]=c[x>>2]&-4}c[l+32>>2]=(c[B+8>>2]|0)+(c[j>>2]|0)+g;if((u|0)!=0){F=(c[u+8>>2]|0)+(c[j>>2]|0)+g|0}else{F=c[l+32>>2]|0}c[l+36>>2]=F;if((n|0)!=0){G=(c[n+8>>2]|0)+(c[j>>2]|0)+g|0}else{G=c[l+32>>2]|0}c[l+40>>2]=G;c[l+20>>2]=-(ab((c[l+4>>2]|0)-(c[145078]|0)|0,c[l+16>>2]|0)|0);b9[A&1023](l);break L2288}}while(0)}}while(0);if((t|0)==1771){t=0}o=o+1|0}}o=l|0;c[o>>2]=(c[o>>2]|0)+1;C=C+y|0}pq();y=m;wQ(63384,y|0,56)|0;i=k;return}function mk(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0;c=a;a=b;b=c;d=b>>31;e=a;f=e>>31;if(((b^d)-d|0)>>>14>>>0>=((e^f)-f|0)>>>0){g=(c^a)>>31^2147483647;return g|0}else{f=c;c=f;e=a;a=w7(c<<16|0>>>16,((f|0)<0?-1:0)<<16|c>>>16,e,(e|0)<0?-1:0)|0;g=a;return g|0}return 0}function ml(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=a;a=c[b+40>>2]|0;if((a|0)==0){d=b+48|0;e=(c[d>>2]|0)-1|0;c[d>>2]=e;if((e|0)==0){switch(c[b+24>>2]|0){case 0:case 8:{c[b+40>>2]=-1;hG((c[b+28>>2]|0)+52|0,21);break};case 15:{c[b+40>>2]=1;hG((c[b+28>>2]|0)+52|0,88);break};case 5:case 9:{c[b+40>>2]=-1;hG((c[b+28>>2]|0)+52|0,89);break};case 1:case 14:{c[b+40>>2]=1;hG((c[b+28>>2]|0)+52|0,20);break};default:{}}}return}else if((a|0)==2){e=b+48|0;d=(c[e>>2]|0)-1|0;c[e>>2]=d;if((d|0)==0){if((c[b+24>>2]|0)==4){c[b+40>>2]=1;c[b+24>>2]=0;hG((c[b+28>>2]|0)+52|0,20)}}return}else if((a|0)==(-1|0)){f=nY(c[b+28>>2]|0,c[b+36>>2]|0,c[(c[b+28>>2]|0)+12>>2]|0,0,1,c[b+40>>2]|0)|0;do{if((c[b+56>>2]|0)!=0){if(((c[b+32>>2]|0)-(c[(c[b+28>>2]|0)+12>>2]|0)|0)==0){break}if((c[144658]|0)>>>0<11){break}d=c[b+52>>2]|0;e=mk((c[(c[b+28>>2]|0)+16>>2]|0)-(c[(c[b+28>>2]|0)+12>>2]|0)|0,(c[b+32>>2]|0)-(c[(c[b+28>>2]|0)+12>>2]|0)|0)|0;td(d,e)|0}}while(0);if((f|0)==2){switch(c[b+24>>2]|0){case 5:case 7:case 9:case 13:{c[(c[b+28>>2]|0)+108>>2]=0;lv(b|0);if((c[144665]|0)!=0){hG((c[b+28>>2]|0)+52|0,89)}break};case 0:case 2:case 8:case 12:{c[(c[b+28>>2]|0)+108>>2]=0;lv(b|0);break};case 1:{c[b+40>>2]=0;c[b+48>>2]=1050;break};case 14:case 15:{c[b+40>>2]=0;c[b+48>>2]=c[b+44>>2];break};default:{}}do{if((c[b+56>>2]|0)!=0){if(((c[b+32>>2]|0)-(c[(c[b+28>>2]|0)+12>>2]|0)|0)==0){break}if((c[144658]|0)>>>0>=11){break}e=c[b+52>>2]|0;td(e,0)|0}}while(0)}else{if((f|0)==1){L2379:do{switch(c[b+24>>2]|0){case 12:case 13:case 7:case 2:{break};case 5:case 9:{c[b+40>>2]=1;if((c[144665]|0)!=0){g=1844;break L2379}else{hG((c[b+28>>2]|0)+52|0,88);break L2379}break};default:{g=1844}}}while(0);if((g|0)==1844){c[b+40>>2]=1;hG((c[b+28>>2]|0)+52|0,20)}}}return}else if((a|0)==1){f=nY(c[b+28>>2]|0,c[b+36>>2]|0,c[b+32>>2]|0,0,1,c[b+40>>2]|0)|0;do{if((c[b+56>>2]|0)!=0){if(((c[b+32>>2]|0)-(c[(c[b+28>>2]|0)+12>>2]|0)|0)==0){break}if((c[144658]|0)>>>0<11){break}a=c[b+52>>2]|0;g=mk((c[(c[b+28>>2]|0)+16>>2]|0)-(c[(c[b+28>>2]|0)+12>>2]|0)|0,(c[b+32>>2]|0)-(c[(c[b+28>>2]|0)+12>>2]|0)|0)|0;td(a,g)|0}}while(0);if((f|0)==2){switch(c[b+24>>2]|0){case 5:case 0:case 8:case 9:{c[b+40>>2]=0;c[b+48>>2]=c[b+44>>2];break};case 1:case 6:case 3:case 11:case 10:case 14:case 15:{c[(c[b+28>>2]|0)+108>>2]=0;lv(b|0);break};default:{}}do{if((c[b+56>>2]|0)!=0){if(((c[b+32>>2]|0)-(c[(c[b+28>>2]|0)+12>>2]|0)|0)==0){break}if((c[144658]|0)>>>0>=11){break}f=c[b+52>>2]|0;td(f,65536)|0}}while(0)}return}else{return}}function mm(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=a;a=d;d=c[e+156>>2]|0;if((d|0)==0){g=0;h=g;return h|0}switch(b[f+22>>1]|0){case 99:case 133:{do{if((c[d+76>>2]|0)==0){if((c[d+88>>2]|0)!=0){break}c[d+224>>2]=c[8374];hG(c[d>>2]|0,34);g=0;h=g;return h|0}}while(0);break};case 134:case 135:{do{if((c[d+84>>2]|0)==0){if((c[d+96>>2]|0)!=0){break}c[d+224>>2]=c[8366];hG(c[d>>2]|0,34);g=0;h=g;return h|0}}while(0);break};case 136:case 137:{do{if((c[d+80>>2]|0)==0){if((c[d+92>>2]|0)!=0){break}c[d+224>>2]=c[8358];hG(c[d>>2]|0,34);g=0;h=g;return h|0}}while(0);break};default:{}}g=mn(f,a)|0;h=g;return h|0}function mn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=a;a=b;b=-1;e=0;while(1){f=j6(d,b)|0;b=f;if((f|0)<0){break}f=(c[108410]|0)+(b*196|0)|0;if((kg(1,f)|0)!=0){continue}e=1;g=ug(60,5,0)|0;wS(g|0,0,60);lu(g|0);c[f+108>>2]=g;c[g+8>>2]=578;c[g+28>>2]=f;c[g+24>>2]=a;c[g+44>>2]=150;c[g+36>>2]=131072;c[g+52>>2]=d;c[g+56>>2]=0;switch(a|0){case 2:{c[g+32>>2]=j9(f)|0;h=g+32|0;c[h>>2]=(c[h>>2]|0)-262144;c[g+40>>2]=-1;hG((c[g+28>>2]|0)+52|0,21);break};case 1:{c[g+32>>2]=c[f+16>>2];c[g+40>>2]=-1;hG((c[g+28>>2]|0)+52|0,21);break};case 5:case 6:{c[g+40>>2]=1;c[g+32>>2]=j9(f)|0;h=g+32|0;c[h>>2]=(c[h>>2]|0)-262144;c[g+36>>2]=524288;if((c[g+32>>2]|0)!=(c[f+16>>2]|0)){hG((c[g+28>>2]|0)+52|0,88)}break};case 0:case 3:{c[g+40>>2]=1;c[g+32>>2]=j9(f)|0;h=g+32|0;c[h>>2]=(c[h>>2]|0)-262144;if((c[g+32>>2]|0)!=(c[f+16>>2]|0)){hG((c[g+28>>2]|0)+52|0,20)}break};case 7:{c[g+32>>2]=j9(f)|0;f=g+32|0;c[f>>2]=(c[f>>2]|0)-262144;c[g+40>>2]=-1;c[g+36>>2]=524288;hG((c[g+28>>2]|0)+52|0,89);break};default:{}}}return e|0}function mo(a,d){a=a|0;d=d|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=a;a=c[d+156>>2]|0;switch(b[g+22>>1]|0){case 26:case 32:{if((a|0)==0){h=0;j=h;i=f;return j|0}do{if((c[a+76>>2]|0)==0){if((c[a+88>>2]|0)!=0){break}c[a+224>>2]=c[8376];hG(c[a>>2]|0,34);h=0;j=h;i=f;return j|0}}while(0);break};case 27:case 34:{if((a|0)==0){h=0;j=h;i=f;return j|0}do{if((c[a+80>>2]|0)==0){if((c[a+92>>2]|0)!=0){break}c[a+224>>2]=c[8360];hG(c[a>>2]|0,34);h=0;j=h;i=f;return j|0}}while(0);break};case 28:case 33:{if((a|0)==0){h=0;j=h;i=f;return j|0}do{if((c[a+84>>2]|0)==0){if((c[a+96>>2]|0)!=0){break}c[a+224>>2]=c[8368];hG(c[a>>2]|0,34);h=0;j=h;i=f;return j|0}}while(0);break};default:{}}if((e[g+28>>1]|0)==65535){hG(c[a>>2]|0,34);h=0;j=h;i=f;return j|0}d=c[(c[105236]|0)+((e[g+28>>1]|0)*24|0)+16>>2]|0;k=c[d+108>>2]|0;if((c[144658]|0)>>>0<7){if((k|0)==0){k=c[d+104>>2]|0}if((k|0)==0){k=c[d+112>>2]|0}}L2507:do{if((k|0)!=0){do{if((c[144658]|0)!=15){if((b[g+22>>1]|0)==1){break}if((b[g+22>>1]|0)==117){break}if((b[g+22>>1]|0)==26){break}if((b[g+22>>1]|0)==27){break}if((b[g+22>>1]|0)!=28){break L2507}}}while(0);if((c[144658]|0)>>>0<15){l=1945}else{if((c[k+8>>2]|0)==578){l=1945}}do{if((l|0)==1945){m=0;do{if((c[k+8>>2]|0)==578){if((c[k+40>>2]|0)!=-1){l=1948;break}m=1}else{l=1948}}while(0);if((l|0)==1948){if((a|0)!=0){m=-1}}if((m|0)==0){break}if((c[k+8>>2]|0)==578){c[k+40>>2]=m}else{if((c[k+8>>2]|0)==366){c[k+40>>2]=m}else{eI(32,120576,(n=i,i=i+1|0,i=i+7>>3<<3,c[n>>2]=0,n)|0)|0;i=n}}h=1;j=h;i=f;return j|0}}while(0);h=0;j=h;i=f;return j|0}}while(0);a=b[g+22>>1]|0;if((a|0)==117|(a|0)==118){hG(d+52|0,88)}else{hG(d+52|0,20)}k=ug(60,5,0)|0;wS(k|0,0,60);lu(k|0);c[d+108>>2]=k;c[k+8>>2]=578;c[k+28>>2]=d;c[k+40>>2]=1;c[k+36>>2]=131072;c[k+44>>2]=150;c[k+52>>2]=g;if((c[144666]|0)!=0){o=0}else{o=b[g+24>>1]|0}c[k+56>>2]=o;switch(b[g+22>>1]|0){case 1:case 26:case 27:case 28:{c[k+24>>2]=0;break};case 31:case 32:case 33:case 34:{c[k+24>>2]=3;b[g+22>>1]=0;break};case 117:{c[k+24>>2]=5;c[k+36>>2]=524288;break};case 118:{c[k+24>>2]=6;b[g+22>>1]=0;c[k+36>>2]=524288;break};default:{c[k+56>>2]=0}}c[k+32>>2]=j9(d)|0;d=k+32|0;c[d>>2]=(c[d>>2]|0)-262144;h=1;j=h;i=f;return j|0}function mp(a){a=a|0;var d=0;d=a;a=ug(60,5,0)|0;wS(a|0,0,60);lu(a|0);c[d+108>>2]=a;b[d+190>>1]=0;c[a+8>>2]=578;c[a+28>>2]=d;c[a+40>>2]=0;c[a+24>>2]=0;c[a+36>>2]=131072;c[a+48>>2]=1050;c[a+52>>2]=0;c[a+56>>2]=0;return}function mq(a,d){a=a|0;d=d|0;d=a;a=ug(60,5,0)|0;wS(a|0,0,60);lu(a|0);c[d+108>>2]=a;b[d+190>>1]=0;c[a+8>>2]=578;c[a+28>>2]=d;c[a+40>>2]=2;c[a+24>>2]=4;c[a+36>>2]=131072;c[a+32>>2]=j9(d)|0;d=a+32|0;c[d>>2]=(c[d>>2]|0)-262144;c[a+44>>2]=150;c[a+48>>2]=10500;c[a+52>>2]=0;c[a+56>>2]=0;return}function mr(a,b){a=a|0;b=b|0;c[252]=(c[252]|0)+1;ms(c[c[b+64>>2]>>2]|0,0,a);return}function ms(a,d,f){a=a|0;d=d|0;f=f|0;var g=0,h=0,i=0;g=a;a=d;d=f;do{if((c[g+88>>2]|0)==(c[252]|0)){if((c[g+28>>2]|0)>(a+1|0)){break}return}}while(0);c[g+88>>2]=c[252];c[g+28>>2]=a+1;lr(g+32|0,d);f=0;while(1){if((f|0)>=(c[g+148>>2]|0)){break}h=c[(c[g+152>>2]|0)+(f<<2)>>2]|0;do{if((b[h+20>>1]&4|0)!=0){uu(h);if((c[111074]|0)<=0){break}i=c[(c[105236]|0)+((e[h+26+(((c[(c[105236]|0)+((e[h+26>>1]|0)*24|0)+16>>2]|0)==(g|0))<<1)>>1]|0)*24|0)+16>>2]|0;if((b[h+20>>1]&64|0)!=0){if((a|0)==0){ms(i,1,d)}}else{ms(i,a,d)}}}while(0);f=f+1|0}return}function mt(a){a=a|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+128|0;f=e|0;g=a;nb(g);a=d[401804]|d[401805|0]<<8|d[401806|0]<<16|d[401807|0]<<24|0;L2588:while(1){if((a|0)==401800){h=2017;break}if((c[a+8>>2]|0)==390){j=a;do{if((j|0)!=(g|0)){if((c[j+104>>2]|0)!=(c[g+104>>2]|0)){break}if((c[j+132>>2]|0)>0){h=2013;break L2588}}}while(0)}a=c[a+4>>2]|0}if((h|0)==2013){i=e;return}else if((h|0)==2017){b[f+24>>1]=666;mn(f,3)|0;i=e;return}}function mu(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a;a=c[(c[c[d+64>>2]>>2]|0)+32>>2]|0;b[d+150>>1]=0;b[d+152>>1]=0;e=d+120|0;if((c[e>>2]&0|0)!=0|(c[e+4>>2]&4|0)!=0){if((mv(d,0)|0)==0){f=2023}}else{f=2023}L2607:do{if((f|0)==2023){e=c[(c[c[d+64>>2]>>2]|0)+32>>2]|0;a=e;do{if((e|0)!=0){g=a+120|0;if(!((c[g>>2]&4|0)!=0|(c[g+4>>2]&0|0)!=0)){break}lr(d+144|0,a);g=d+120|0;if((c[g>>2]&32|0)!=0|(c[g+4>>2]&0|0)!=0){h=(ia(d,a)|0)!=0}else{h=1}if(h){break L2607}}}while(0);e=d+120|0;if(!((c[e>>2]&0|0)!=0|(c[e+4>>2]&4|0)!=0)){if((mv(d,0)|0)!=0){break}}return}}while(0);if((c[(c[d+108>>2]|0)+16>>2]|0)!=0){switch(c[(c[d+108>>2]|0)+16>>2]|0){case 39:case 40:{i=((lm(31)|0)%2|0)+39|0;break};case 36:case 37:case 38:{i=((lm(31)|0)%3|0)+36|0;break};default:{i=c[(c[d+108>>2]|0)+16>>2]|0}}do{if((c[d+104>>2]|0)==19){f=2038}else{if((c[d+104>>2]|0)==21){f=2038;break}hG(d,i)}}while(0);if((f|0)==2038){hG(0,i)}}dR(d,c[(c[d+108>>2]|0)+12>>2]|0)|0;return}function mv(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=a;a=b;b=d+120|0;if((c[b>>2]&0|0)!=0|(c[b+4>>2]&4|0)!=0){if((nP(d,a)|0)!=0){e=1}else{e=(mA(d,a)|0)!=0}f=e&1;return f|0}else{if((mA(d,a)|0)!=0){g=1}else{g=(nP(d,a)|0)!=0}f=g&1;return f|0}return 0}function mw(a){a=a|0;var d=0,e=0,f=0,g=0;d=a;if((b[d+148>>1]|0)!=0){a=d+148|0;b[a>>1]=(b[a>>1]|0)-1&65535}if((b[d+150>>1]|0)!=0){do{if((c[d+144>>2]|0)!=0){if((c[(c[d+144>>2]|0)+132>>2]|0)<=0){e=2060;break}a=d+150|0;b[a>>1]=(b[a>>1]|0)-1&65535}else{e=2060}}while(0);if((e|0)==2060){b[d+150>>1]=0}}if((b[d+140>>1]|0)!=0){mD(d)}else{if((b[d+136>>1]|0)<8){a=d+44|0;f=c[a>>2]&-536870912;c[a>>2]=f;a=f-(b[d+136>>1]<<29)|0;if((a|0)>0){f=d+44|0;c[f>>2]=(c[f>>2]|0)-536870912}else{if((a|0)<0){a=d+44|0;c[a>>2]=(c[a>>2]|0)+536870912}}}}do{if((c[d+144>>2]|0)!=0){a=(c[d+144>>2]|0)+120|0;if(!((c[a>>2]&4|0)!=0|(c[a+4>>2]&0|0)!=0)){break}a=d+120|0;if((c[a>>2]&128|0)!=0|(c[a+4>>2]&0|0)!=0){a=d+120|0;f=c[a+4>>2]|0;c[a>>2]=c[a>>2]&-129;c[a+4>>2]=f;do{if((c[122182]|0)!=4){if((c[140236]|0)!=0){break}mx(d)}}while(0);return}do{if((c[(c[d+108>>2]|0)+40>>2]|0)!=0){if((my(d)|0)==0){break}if((c[(c[d+108>>2]|0)+24>>2]|0)!=0){hG(d,c[(c[d+108>>2]|0)+24>>2]|0)}f=d;a=c[(c[d+108>>2]|0)+40>>2]|0;dR(f,a)|0;if((c[(c[d+108>>2]|0)+44>>2]|0)==0){a=d+120|0;f=c[a+4>>2]|0;c[a>>2]=c[a>>2]|64;c[a+4>>2]=f}return}}while(0);if((c[(c[d+108>>2]|0)+44>>2]|0)!=0){do{if((c[122182]|0)<4){if((c[140236]|0)!=0){e=2094;break}if((b[d+138>>1]|0)==0){e=2094}}else{e=2094}}while(0);do{if((e|0)==2094){if((mz(d)|0)==0){break}f=d;a=c[(c[d+108>>2]|0)+44>>2]|0;dR(f,a)|0;a=d+120|0;f=c[a+4>>2]|0;c[a>>2]=c[a>>2]|128;c[a+4>>2]=f;return}}while(0)}if((b[d+150>>1]|0)==0){if((c[144658]|0)>>>0>=11){do{if((c[122156]|0)!=0){if((mB(d)|0)==0){break}return}}while(0);if((b[d+152>>1]|0)!=0){f=d+152|0;b[f>>1]=(b[f>>1]|0)-1&65535}else{b[d+152>>1]=100;do{if((c[d+144>>2]|0)!=0){if((c[(c[d+144>>2]|0)+132>>2]|0)<=0){e=2118;break}if((c[144672]|0)!=0){if((c[111230]|0)==0){break}}f=(c[d+144>>2]|0)+120|0;a=d+120|0;if(!(((c[f>>2]^c[a>>2])&0|0)!=0|((c[f+4>>2]^c[a+4>>2])&4|0)!=0)){a=d+120|0;if((c[a>>2]&0|0)!=0|(c[a+4>>2]&4|0)!=0){e=2118;break}if((c[8960]|0)==0){e=2118;break}}if((ia(d,c[d+144>>2]|0)|0)==0){e=2118}}else{e=2118}}while(0);do{if((e|0)==2118){if((mv(d,1)|0)==0){break}return}}while(0);do{if((c[(c[d+108>>2]|0)+44>>2]|0)==0){a=d+120|0;if(!((c[a>>2]&0|0)!=0|(c[a+4>>2]&4|0)!=0)){break}a=d+120|0;do{if((c[a>>2]&64|0)!=0|(c[a+4>>2]&0|0)!=0){f=d+120|0;g=c[f+4>>2]|0;c[f>>2]=c[f>>2]&-65;c[f+4>>2]=g}else{if((mA(d,1)|0)==0){break}return}}while(0)}}while(0)}}else{do{if((c[111230]|0)!=0){if((ia(d,c[d+144>>2]|0)|0)!=0){break}if((mA(d,1)|0)==0){break}return}}while(0)}}if((b[d+140>>1]|0)!=0){a=d+140|0;b[a>>1]=(b[a>>1]|0)-1&65535}a=d+138|0;g=(b[a>>1]|0)-1&65535;b[a>>1]=g;if((g<<16>>16|0)<0){e=2136}else{if((mC(d)|0)==0){e=2136}}if((e|0)==2136){mx(d)}if((c[(c[d+108>>2]|0)+80>>2]|0)==0){return}if((lm(31)|0)>=3){return}hG(d,c[(c[d+108>>2]|0)+80>>2]|0);return}}while(0);if((mv(d,1)|0)==0){e=d;g=c[(c[d+108>>2]|0)+4>>2]|0;dR(e,g)|0}return}function mx(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;d=a;a=c[d+144>>2]|0;e=(c[a+24>>2]|0)-(c[d+24>>2]|0)|0;f=(c[a+28>>2]|0)-(c[d+28>>2]|0)|0;b[d+140>>1]=0;if((c[144658]|0)>>>0>=11){do{if(((c[d+68>>2]|0)-(c[d+76>>2]|0)|0)>1572864){if((c[d+32>>2]|0)>(c[d+68>>2]|0)){break}g=d+120|0;if((c[g>>2]&17408|0)!=0|(c[g+4>>2]&0|0)!=0){break}if((c[144661]|0)!=0){break}if((nK(d)|0)==0){break}nM(d,c[140480]|0,c[140478]|0);b[d+138>>1]=1;return}}while(0);g=ui(e,f)|0;h=d+120|0;i=a+120|0;do{if((c[h>>2]&c[i>>2]&0|0)!=0|(c[h+4>>2]&c[i+4>>2]&4|0)!=0){if((c[16260]<<16|0)<=(g|0)){j=2164;break}if((nG(a)|0)!=0){j=2164;break}if((nv(d)|0)!=0){j=2164;break}e=-e|0;f=-f|0}else{j=2164}}while(0);if((j|0)==2164){do{if((c[a+132>>2]|0)>0){i=d+120|0;h=a+120|0;if(!(((c[i>>2]^c[h>>2])&0|0)!=0|((c[i+4>>2]^c[h+4>>2])&4|0)!=0)){break}L2801:do{if((c[113428]|0)!=0){if((c[(c[d+108>>2]|0)+44>>2]|0)==0){break}if((c[d+104>>2]|0)==18){break}if((c[(c[a+108>>2]|0)+44>>2]|0)!=0){j=2171}else{if((g|0)>=8388608){j=2171}}do{if((j|0)==2171){if((c[a+156>>2]|0)==0){break L2801}if((g|0)>=12582912){break L2801}if((c[(c[a+156>>2]|0)+120>>2]|0)==0){break}if((c[(c[a+156>>2]|0)+120>>2]|0)!=7){break L2801}}}while(0);b[d+140>>1]=(lm(55)|0)&15;e=-e|0;f=-f|0}}while(0)}}while(0)}}nM(d,e,f);if((b[d+140>>1]|0)==0){return}b[d+138>>1]=b[d+140>>1]|0;return}function my(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=a;a=c[b+144>>2]|0;if((a|0)==0){d=0;e=d&1;return e|0}f=b+120|0;g=a+120|0;if((c[f>>2]&c[g>>2]&0|0)!=0|(c[f+4>>2]&c[g+4>>2]&4|0)!=0){d=0;e=d&1;return e|0}g=ui((c[a+24>>2]|0)-(c[b+24>>2]|0)|0,(c[a+28>>2]|0)-(c[b+28>>2]|0)|0)|0;if((g|0)>=((c[(c[a+108>>2]|0)+64>>2]|0)+2883584|0)){d=0;e=d&1;return e|0}d=(ia(b,c[b+144>>2]|0)|0)!=0;e=d&1;return e|0}function mz(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;d=a;if((ia(d,c[d+144>>2]|0)|0)==0){e=0;f=e;return f|0}a=d+120|0;if((c[a>>2]&64|0)!=0|(c[a+4>>2]&0|0)!=0){a=d+120|0;g=c[a+4>>2]|0;c[a>>2]=c[a>>2]&-65;c[a+4>>2]=g;g=d+120|0;if((c[g>>2]&0|0)!=0|(c[g+4>>2]&4|0)!=0){if((c[(c[d+144>>2]|0)+132>>2]|0)>0){g=(c[d+144>>2]|0)+120|0;if((c[g>>2]&0|0)!=0|(c[g+4>>2]&4|0)!=0){if((c[(c[d+144>>2]|0)+156>>2]|0)!=0){if((c[8960]|0)!=0){h=1}else{h=(lm(61)|0)>128}i=h&1}else{h=(c[d+144>>2]|0)+120|0;if((c[h>>2]&64|0)!=0|(c[h+4>>2]&0|0)!=0){j=0}else{j=(lm(61)|0)>128}i=j&1}k=(i|0)!=0}else{k=1}l=k}else{l=0}m=l}else{m=1}e=m&1;f=e;return f|0}m=d+120|0;l=(c[d+144>>2]|0)+120|0;if((c[m>>2]&c[l>>2]&0|0)!=0|(c[m+4>>2]&c[l+4>>2]&4|0)!=0){e=0;f=e;return f|0}if((b[d+148>>1]|0)!=0){e=0;f=e;return f|0}l=(ui((c[d+24>>2]|0)-(c[(c[d+144>>2]|0)+24>>2]|0)|0,(c[d+28>>2]|0)-(c[(c[d+144>>2]|0)+28>>2]|0)|0)|0)-4194304|0;if((c[(c[d+108>>2]|0)+40>>2]|0)==0){l=l-8388608|0}l=l>>16;do{if((c[d+104>>2]|0)==3){if((l|0)<=896){break}e=0;f=e;return f|0}}while(0);do{if((c[d+104>>2]|0)==5){if((l|0)>=196){l=l>>1;break}e=0;f=e;return f|0}}while(0);do{if((c[d+104>>2]|0)==21){n=2229}else{if((c[d+104>>2]|0)==19){n=2229;break}if((c[d+104>>2]|0)==18){n=2229}}}while(0);if((n|0)==2229){l=l>>1}if((l|0)>200){l=200}do{if((c[d+104>>2]|0)==21){if((l|0)<=160){break}l=160}}while(0);if((lm(27)|0)<(l|0)){e=0;f=e;return f|0}if((mI(d)|0)!=0){e=0;f=e;return f|0}else{e=1;f=e;return f|0}return 0}function mA(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;a=d;d=e+120|0;if((c[d>>2]&0|0)!=0|(c[d+4>>2]&4|0)!=0){d=0;L2911:while(1){if((d|0)>1){f=2266;break}g=0;while(1){if((g|0)>=4){break}do{if((c[444120+(g<<2)>>2]|0)!=0){if((c[442964+(g*288|0)>>2]|0)!=0){break}if((d|0)!=0){break L2911}if((nJ(e,c[442960+(g*288|0)>>2]|0,a)|0)!=0){break L2911}}}while(0);g=g+1|0}d=d+1|0}if((f|0)==2266){h=0;i=h;return i|0}lr(e+144|0,c[442960+(g*288|0)>>2]|0);if((c[(c[e+108>>2]|0)+44>>2]|0)!=0){d=e;j=c[(c[e+108>>2]|0)+12>>2]|0;dR(d,j)|0;j=e+120|0;d=c[j+4>>2]|0;c[j>>2]=c[j>>2]&-65;c[j+4>>2]=d}h=1;i=h;return i|0}d=(b[e+160>>1]|0)-1&3;g=0;do{if((c[144658]|0)>>>0>=11){k=0}else{if((c[144658]|0)>>>0<7){k=0;break}k=(c[113424]|0)!=0}}while(0);j=k?4:2;L2938:while(1){do{if((c[444120+(b[e+160>>1]<<2)>>2]|0)!=0){k=g;g=k+1|0;if((k|0)==(j|0)){break L2938}if((b[e+160>>1]|0)==(d|0)){break L2938}l=442960+((b[e+160>>1]|0)*288|0)|0;if((c[l+40>>2]|0)<=0){break}if((nJ(e,c[l>>2]|0,a)|0)!=0){f=2287;break L2938}}}while(0);b[e+160>>1]=(b[e+160>>1]|0)+1&3}if((f|0)==2287){lr(e+144|0,c[l>>2]|0);if((c[144672]|0)==0){b[e+150>>1]=60}h=1;i=h;return i|0}do{if((c[144658]|0)>>>0<11){if((c[144658]|0)>>>0<7){break}if((c[113424]|0)==0){break}do{if((c[e+176>>2]|0)!=0){if((c[(c[e+176>>2]|0)+132>>2]|0)<=0){break}c[e+144>>2]=c[e+176>>2];c[e+176>>2]=0;h=1;i=h;return i|0}}while(0)}}while(0);h=0;i=h;return i|0}function mB(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a;if(((c[d+132>>2]|0)*3|0|0)<(c[(c[d+108>>2]|0)+8>>2]|0)){e=0;f=e;return f|0}c[144618]=d;c[144616]=1;a=d+120|0;g=401704+(((c[a>>2]&0|0)!=0|(c[a+4>>2]&4|0)!=0?2:3)*24|0)|0;a=c[g+12>>2]|0;L2973:while(1){if((a|0)==(g|0)){break}if((c[a+132>>2]<<1|0)>=(c[(c[a+108>>2]|0)+8>>2]|0)){if((lm(58)|0)<180){h=2303;break}}else{i=a+120|0;do{if((c[i>>2]&64|0)!=0|(c[i+4>>2]&0|0)!=0){if((c[a+144>>2]|0)==0){break}if((c[a+144>>2]|0)==(c[d+144>>2]|0)){break}if((nI(c[a+144>>2]|0)|0)==0){h=2309;break L2973}}}while(0)}a=c[a+12>>2]|0}if((h|0)!=2303)if((h|0)==2309){b[d+150>>1]=100;e=1;f=e;return f|0}e=0;f=e;return f|0}function mC(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;d=a;a=c[d+144>>2]|0;e=0;do{if((c[144674]|0)!=0){f=0}else{if((a|0)==0){f=0;break}if((c[a+132>>2]|0)<=0){f=0;break}if((b[(c[c[a+64>>2]>>2]|0)+194>>1]|0)!=(b[(c[c[d+64>>2]>>2]|0)+194>>1]|0)){f=0;break}f=(nG(d)|0)!=0}}while(0);g=f&1;if((c[113430]|0)!=0){h=(nv(d)|0)!=0}else{h=0}f=h&1;do{if((c[d+104>>2]|0)==139){i=2328}else{if((c[d+104>>2]|0)!=((c[38884]|0)-1|0)){break}h=d+120|0;if((c[h>>2]&0|0)!=0|(c[h+4>>2]&4|0)!=0){i=2328}}}while(0);do{if((i|0)==2328){if((a|0)==0){break}if((c[140746]|0)==0){break}h=a+120|0;j=d+120|0;if(((c[h>>2]^c[j>>2])&0|0)!=0|((c[h+4>>2]^c[j+4>>2])&4|0)!=0){break}if((ui((c[d+24>>2]|0)-(c[a+24>>2]|0)|0,(c[d+28>>2]|0)-(c[a+28>>2]|0)|0)|0)>=9437184){break}if((lm(59)|0)>=235){break}e=2}}while(0);if((nH(d,e)|0)==0){k=0;l=k;return l|0}do{if((g|0)!=0){if((lm(57)|0)>=230){i=2339;break}if((nG(d)|0)!=0){i=2339}else{i=2344}}else{i=2339}}while(0);do{if((i|0)==2339){if((c[113430]|0)==0){break}if((f|0)!=0){break}g=nv(d)|0;f=g;if((g|0)==0){break}if((f|0)<0){i=2344;break}if((lm(56)|0)<200){i=2344}}}while(0);if((i|0)==2344){b[d+136>>1]=8}k=1;l=k;return l|0}function mD(a){a=a|0;var b=0,d=0;b=a;if((c[b+144>>2]|0)==0){return}a=b+120|0;d=c[a+4>>2]|0;c[a>>2]=c[a>>2]&-33;c[a+4>>2]=d;c[b+44>>2]=t_(c[b+24>>2]|0,c[b+28>>2]|0,c[(c[b+144>>2]|0)+24>>2]|0,c[(c[b+144>>2]|0)+28>>2]|0)|0;d=(c[b+144>>2]|0)+120|0;if(!((c[d>>2]&262144|0)!=0|(c[d+4>>2]&0|0)!=0)){return}d=lm(32)|0;a=d-(lm(32)|0)<<21;d=b+44|0;c[d>>2]=(c[d>>2]|0)+a;return}function mE(a){a=a|0;var b=0,d=0,e=0;b=a;if((c[b+144>>2]|0)!=0){mD(b);a=c[b+44>>2]|0;d=tA(b,a,134217728,0,0)|0;hG(b,1);e=lm(33)|0;a=a+(e-(lm(33)|0)<<20)|0;tB(b,a,134217728,d,(((lm(33)|0)%5|0)+1|0)*3|0);return}else{return}}function mF(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=a;if((c[b+144>>2]|0)==0){return}hG(b,2);mD(b);a=c[b+44>>2]|0;d=tA(b,a,134217728,0,0)|0;e=0;while(1){if((e|0)>=3){break}f=lm(34)|0;g=a+(f-(lm(34)|0)<<20)|0;tB(b,g,134217728,d,(((lm(34)|0)%5|0)+1|0)*3|0);e=e+1|0}return}function mG(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;if((c[b+144>>2]|0)!=0){hG(b,2);mD(b);a=c[b+44>>2]|0;d=tA(b,a,134217728,0,0)|0;e=lm(35)|0;f=a+(e-(lm(35)|0)<<20)|0;tB(b,f,134217728,d,(((lm(35)|0)%5|0)+1|0)*3|0);return}else{return}}function mH(a){a=a|0;var b=0,d=0;b=a;mD(b);L3063:do{if((mI(b)|0)==0){if((lm(45)|0)<40){do{if((c[b+144>>2]|0)!=0){a=b+120|0;d=(c[b+144>>2]|0)+120|0;if(!((c[a>>2]&c[d>>2]&0|0)!=0|(c[a+4>>2]&c[d+4>>2]&4|0)!=0)){break}break L3063}}while(0);return}else{do{if((c[b+144>>2]|0)!=0){if((c[(c[b+144>>2]|0)+132>>2]|0)<=0){break}if((ia(b,c[b+144>>2]|0)|0)==0){break}return}}while(0);break}}}while(0);dR(b,c[(c[b+108>>2]|0)+12>>2]|0)|0;return}function mI(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;a=b+120|0;if(!((c[a>>2]&0|0)!=0|(c[a+4>>2]&4|0)!=0)){d=0;e=d&1;return e|0}if((c[b+144>>2]|0)==0){d=0;e=d&1;return e|0}a=t_(c[b+24>>2]|0,c[b+28>>2]|0,c[(c[b+144>>2]|0)+24>>2]|0,c[(c[b+144>>2]|0)+28>>2]|0)|0;tA(b,a,ui((c[b+24>>2]|0)-(c[(c[b+144>>2]|0)+24>>2]|0)|0,(c[b+28>>2]|0)-(c[(c[b+144>>2]|0)+28>>2]|0)|0)|0,0,0)|0;if((c[113654]|0)==0){d=0;e=d&1;return e|0}if((c[113654]|0)==(c[b+144>>2]|0)){d=0;e=d&1;return e|0}a=(c[113654]|0)+120|0;f=b+120|0;d=(((c[a>>2]^c[f>>2])&0|0)!=0|((c[a+4>>2]^c[f+4>>2])&4|0)!=0)^1;e=d&1;return e|0}function mJ(a){a=a|0;var b=0,d=0;b=a;mD(b);if((mI(b)|0)==0){if((lm(36)|0)<10){return}do{if((c[b+144>>2]|0)!=0){if((c[(c[b+144>>2]|0)+132>>2]|0)<=0){break}a=b+120|0;d=(c[b+144>>2]|0)+120|0;if((c[a>>2]&c[d>>2]&0|0)!=0|(c[a+4>>2]&c[d+4>>2]&4|0)!=0){break}if((ia(b,c[b+144>>2]|0)|0)==0){break}return}}while(0)}dR(b,c[(c[b+108>>2]|0)+12>>2]|0)|0;return}function mK(a){a=a|0;var b=0,d=0;b=a;if((c[b+144>>2]|0)!=0){mD(b);a=b;d=c[b+144>>2]|0;d6(a,d,36)|0;return}else{return}}function mL(a){a=a|0;var b=0,d=0;b=a;if((c[b+144>>2]|0)==0){return}mD(b);if((my(b)|0)!=0){hG(b,55);a=(((lm(37)|0)%8|0)+1|0)*3|0;oO(c[b+144>>2]|0,b,b,a);return}else{a=b;d=c[b+144>>2]|0;d6(a,d,31)|0;return}}function mM(a){a=a|0;var b=0;b=a;if((c[b+144>>2]|0)==0){return}mD(b);if((my(b)|0)==0){return}a=((lm(38)|0)%10|0)+1<<2;oO(c[b+144>>2]|0,b,b,a);return}function mN(a,b){a=a|0;b=b|0;var c=0;c=a;a=b;b=w9(c,(c|0)<0?-1:0,a,(a|0)<0?-1:0)|0;a=F;a>>16|((a|0)<0?-1:0)<<16;return b>>>16|a<<16|0}function mO(a){a=a|0;var b=0,d=0;b=a;if((c[b+144>>2]|0)==0){return}mD(b);if((my(b)|0)!=0){a=(((lm(39)|0)%6|0)+1|0)*10|0;oO(c[b+144>>2]|0,b,b,a);return}else{a=b;d=c[b+144>>2]|0;d6(a,d,32)|0;return}}function mP(a){a=a|0;var b=0,d=0;b=a;if((c[b+144>>2]|0)!=0){mD(b);a=b;d=c[b+144>>2]|0;d6(a,d,33)|0;return}else{return}}function mQ(a){a=a|0;var b=0,d=0;b=a;if((c[b+144>>2]|0)==0){return}if((my(b)|0)!=0){hG(b,55);a=(((lm(40)|0)%8|0)+1|0)*10|0;oO(c[b+144>>2]|0,b,b,a);return}else{a=b;d=c[b+144>>2]|0;d6(a,d,16)|0;return}}function mR(a){a=a|0;var b=0,d=0;b=a;if((c[b+144>>2]|0)!=0){mD(b);a=b+32|0;c[a>>2]=(c[a>>2]|0)+1048576;a=d6(b,c[b+144>>2]|0,6)|0;d=b+32|0;c[d>>2]=(c[d>>2]|0)-1048576;d=a+24|0;c[d>>2]=(c[d>>2]|0)+(c[a+88>>2]|0);d=a+28|0;c[d>>2]=(c[d>>2]|0)+(c[a+92>>2]|0);lr(a+172|0,c[b+144>>2]|0);return}else{return}}function mS(a){a=a|0;var b=0,d=0,e=0;b=a;if(((c[122178]|0)-(c[154980]|0)&3|0)!=0){return}d3(c[b+24>>2]|0,c[b+28>>2]|0,c[b+32>>2]|0);a=dZ((c[b+24>>2]|0)-(c[b+88>>2]|0)|0,(c[b+28>>2]|0)-(c[b+92>>2]|0)|0,c[b+32>>2]|0,7)|0;c[a+96>>2]=65536;d=(lm(41)|0)&3;e=a+112|0;c[e>>2]=(c[e>>2]|0)-d;if((c[a+112>>2]|0)<1){c[a+112>>2]=1}a=c[b+172>>2]|0;do{if((a|0)!=0){if((c[a+132>>2]|0)<=0){break}d=t_(c[b+24>>2]|0,c[b+28>>2]|0,c[a+24>>2]|0,c[a+28>>2]|0)|0;if((d|0)!=(c[b+44>>2]|0)){if((d-(c[b+44>>2]|0)|0)>>>0>2147483648){e=b+44|0;c[e>>2]=(c[e>>2]|0)-(c[37130]|0);if((d-(c[b+44>>2]|0)|0)>>>0<2147483648){c[b+44>>2]=d}}else{e=b+44|0;c[e>>2]=(c[e>>2]|0)+(c[37130]|0);if((d-(c[b+44>>2]|0)|0)>>>0>2147483648){c[b+44>>2]=d}}}d=(c[b+44>>2]|0)>>>19;c[b+88>>2]=mN(c[(c[b+108>>2]|0)+60>>2]|0,c[(c[15018]|0)+(d<<2)>>2]|0)|0;c[b+92>>2]=mN(c[(c[b+108>>2]|0)+60>>2]|0,c[515760+(d<<2)>>2]|0)|0;d=ui((c[a+24>>2]|0)-(c[b+24>>2]|0)|0,(c[a+28>>2]|0)-(c[b+28>>2]|0)|0)|0;d=(d|0)/(c[(c[b+108>>2]|0)+60>>2]|0)|0;if((d|0)<1){d=1}if((((c[a+32>>2]|0)+2621440-(c[b+32>>2]|0)|0)/(d|0)|0|0)<(c[b+96>>2]|0)){d=b+96|0;c[d>>2]=(c[d>>2]|0)-8192;return}else{d=b+96|0;c[d>>2]=(c[d>>2]|0)+8192;return}}}while(0);return}function mT(a){a=a|0;var b=0;b=a;if((c[b+144>>2]|0)!=0){mD(b);hG(b,56);return}else{return}}function mU(a){a=a|0;var b=0;b=a;if((c[b+144>>2]|0)==0){return}mD(b);if((my(b)|0)==0){return}a=(((lm(42)|0)%10|0)+1|0)*6|0;hG(b,53);oO(c[b+144>>2]|0,b,b,a);return}function mV(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a;do{if((b[d+136>>1]|0)!=8){a=c[d+24>>2]|0;c[96224]=a+(ab(c[(c[d+108>>2]|0)+60>>2]|0,c[48+(b[d+136>>1]<<2)>>2]|0)|0);a=c[d+28>>2]|0;c[96222]=a+(ab(c[(c[d+108>>2]|0)+60>>2]|0,c[8+(b[d+136>>1]<<2)>>2]|0)|0);a=(c[96224]|0)-(c[154950]|0)-4194304>>23;e=(c[96224]|0)-(c[154950]|0)+4194304>>23;f=(c[96222]|0)-(c[154948]|0)-4194304>>23;g=(c[96222]|0)-(c[154948]|0)+4194304>>23;c[96226]=d;h=a;L3221:while(1){if((h|0)>(e|0)){i=2531;break}a=f;while(1){if((a|0)>(g|0)){break}if((uA(h,a,20)|0)==0){break L3221}a=a+1|0}h=h+1|0}if((i|0)==2531){break}h=c[d+144>>2]|0;c[d+144>>2]=c[144630];mD(d);c[d+144>>2]=h;dR(d,266)|0;hG(c[144630]|0,31);h=c[(c[144630]|0)+108>>2]|0;dR(c[144630]|0,c[h+96>>2]|0)|0;if((c[144662]|0)!=0){g=(c[144630]|0)+84|0;c[g>>2]=c[g>>2]<<2}else{c[(c[144630]|0)+84>>2]=c[h+68>>2];c[(c[144630]|0)+80>>2]=c[h+64>>2]}g=h+88|0;f=d+120|0;e=c[g+4>>2]&-5|c[f+4>>2]&4;a=(c[144630]|0)+120|0;c[a>>2]=c[g>>2]|0|c[f>>2]&0;c[a+4>>2]=e;e=(c[144630]|0)+120|0;if(!(((c[e>>2]^4194304)&4194304|0)!=0|((c[e+4>>2]^0)&4|0)!=0)){c[100376]=(c[100376]|0)+1}c[(c[144630]|0)+132>>2]=c[h+8>>2];lr((c[144630]|0)+144|0,0);if((c[144658]|0)>>>0>=11){lr((c[144630]|0)+176|0,0);h=(c[144630]|0)+120|0;e=c[h+4>>2]|0;c[h>>2]=c[h>>2]&-65;c[h+4>>2]=e}lp(c[144630]|0);return}}while(0);mw(d);return}function mW(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=a;a=b+120|0;if(!((c[a>>2]&1048576|0)!=0|(c[a+4>>2]&0|0)!=0)){d=1;e=d;return e|0}if((c[b+112>>2]|0)!=-1){d=1;e=d;return e|0}if((c[(c[b+108>>2]|0)+96>>2]|0)==0){d=1;e=d;return e|0}a=(c[(c[b+108>>2]|0)+64>>2]|0)+(c[9058]|0)|0;f=(c[b+24>>2]|0)-(c[96224]|0)|0;g=f>>31;do{if(((f^g)-g|0)<=(a|0)){h=(c[b+28>>2]|0)-(c[96222]|0)|0;i=h>>31;if(((h^i)-i|0)>(a|0)){break}c[144630]=b;c[(c[144630]|0)+92>>2]=0;c[(c[144630]|0)+88>>2]=0;if((c[144662]|0)!=0){i=(c[144630]|0)+84|0;c[i>>2]=c[i>>2]<<2;j=tl(c[144630]|0,c[(c[144630]|0)+24>>2]|0,c[(c[144630]|0)+28>>2]|0)|0;i=(c[144630]|0)+84|0;c[i>>2]=c[i>>2]>>2}else{i=c[(c[144630]|0)+84>>2]|0;h=c[(c[144630]|0)+80>>2]|0;c[(c[144630]|0)+84>>2]=c[(c[(c[144630]|0)+108>>2]|0)+68>>2];c[(c[144630]|0)+80>>2]=c[(c[(c[144630]|0)+108>>2]|0)+64>>2];k=(c[144630]|0)+120|0;l=c[k+4>>2]|0;c[k>>2]=c[k>>2]|2;c[k+4>>2]=l;j=tl(c[144630]|0,c[(c[144630]|0)+24>>2]|0,c[(c[144630]|0)+28>>2]|0)|0;c[(c[144630]|0)+84>>2]=i;c[(c[144630]|0)+80>>2]=h;h=(c[144630]|0)+120|0;i=c[h+4>>2]|0;c[h>>2]=c[h>>2]&-3;c[h+4>>2]=i}if((j|0)!=0){d=0;e=d;return e|0}else{d=1;e=d;return e|0}}}while(0);d=1;e=d;return e|0}function mX(a){a=a|0;hG(a,54);return}function mY(a){a=a|0;var b=0;b=a;hG(b,92);m_(b);return}function mZ(a){a=a|0;var b=0;b=a;hG(b,91);m_(b);return}function m_(a){a=a|0;var b=0,d=0,e=0;b=a;a=c[b+172>>2]|0;if((a|0)==0){return}if((ia(c[b+144>>2]|0,a)|0)!=0){d=(c[a+44>>2]|0)>>>19;uv(b);e=c[a+24>>2]|0;c[b+24>>2]=e+(mN(1572864,c[(c[15018]|0)+(d<<2)>>2]|0)|0);e=c[a+28>>2]|0;c[b+28>>2]=e+(mN(1572864,c[515760+(d<<2)>>2]|0)|0);c[b+32>>2]=c[a+32>>2];uy(b);return}else{return}}function m$(a){a=a|0;var b=0,d=0;b=a;if((c[b+144>>2]|0)==0){return}mD(b);if((c[144658]|0)>>>0<10){d=c[(c[b+144>>2]|0)+24>>2]|0}else{d=c[(c[b+144>>2]|0)+28>>2]|0}a=dZ(c[(c[b+144>>2]|0)+24>>2]|0,d,c[(c[b+144>>2]|0)+32>>2]|0,4)|0;lr(b+172|0,a);lr(a+144|0,b);lr(a+172|0,c[b+144>>2]|0);m_(a);return}function m0(a){a=a|0;var b=0,d=0,e=0;b=a;if((c[b+144>>2]|0)==0){return}mD(b);if((ia(b,c[b+144>>2]|0)|0)==0){return}hG(b,82);oO(c[b+144>>2]|0,b,b,20);c[(c[b+144>>2]|0)+96>>2]=65536e3/(c[(c[(c[b+144>>2]|0)+108>>2]|0)+72>>2]|0)|0;a=(c[b+44>>2]|0)>>>19;d=c[b+172>>2]|0;if((d|0)!=0){e=c[(c[b+144>>2]|0)+24>>2]|0;c[d+24>>2]=e-(mN(1572864,c[(c[15018]|0)+(a<<2)>>2]|0)|0);e=c[(c[b+144>>2]|0)+28>>2]|0;c[d+28>>2]=e-(mN(1572864,c[515760+(a<<2)>>2]|0)|0);tG(d,b,70);return}else{return}}function m1(a){a=a|0;var b=0;b=a;mD(b);hG(b,99);return}function m2(a){a=a|0;var b=0,d=0;b=a;if((c[b+144>>2]|0)!=0){mD(b);a=b+44|0;c[a>>2]=(c[a>>2]|0)+134217728;a=b;d=c[b+144>>2]|0;d6(a,d,9)|0;d=d6(b,c[b+144>>2]|0,9)|0;b=d+44|0;c[b>>2]=(c[b>>2]|0)+134217728;b=(c[d+44>>2]|0)>>>19;c[d+88>>2]=mN(c[(c[d+108>>2]|0)+60>>2]|0,c[(c[15018]|0)+(b<<2)>>2]|0)|0;c[d+92>>2]=mN(c[(c[d+108>>2]|0)+60>>2]|0,c[515760+(b<<2)>>2]|0)|0;return}else{return}}function m3(a){a=a|0;var b=0,d=0;b=a;if((c[b+144>>2]|0)!=0){mD(b);a=b+44|0;c[a>>2]=(c[a>>2]|0)-134217728;a=b;d=c[b+144>>2]|0;d6(a,d,9)|0;d=d6(b,c[b+144>>2]|0,9)|0;b=d+44|0;c[b>>2]=(c[b>>2]|0)-268435456;b=(c[d+44>>2]|0)>>>19;c[d+88>>2]=mN(c[(c[d+108>>2]|0)+60>>2]|0,c[(c[15018]|0)+(b<<2)>>2]|0)|0;c[d+92>>2]=mN(c[(c[d+108>>2]|0)+60>>2]|0,c[515760+(b<<2)>>2]|0)|0;return}else{return}}function m4(a){a=a|0;var b=0,d=0;b=a;if((c[b+144>>2]|0)!=0){mD(b);a=d6(b,c[b+144>>2]|0,9)|0;d=a+44|0;c[d>>2]=(c[d>>2]|0)-67108864;d=(c[a+44>>2]|0)>>>19;c[a+88>>2]=mN(c[(c[a+108>>2]|0)+60>>2]|0,c[(c[15018]|0)+(d<<2)>>2]|0)|0;c[a+92>>2]=mN(c[(c[a+108>>2]|0)+60>>2]|0,c[515760+(d<<2)>>2]|0)|0;a=d6(b,c[b+144>>2]|0,9)|0;b=a+44|0;c[b>>2]=(c[b>>2]|0)+67108864;d=(c[a+44>>2]|0)>>>19;c[a+88>>2]=mN(c[(c[a+108>>2]|0)+60>>2]|0,c[(c[15018]|0)+(d<<2)>>2]|0)|0;c[a+92>>2]=mN(c[(c[a+108>>2]|0)+60>>2]|0,c[515760+(d<<2)>>2]|0)|0;return}else{return}}function m5(a){a=a|0;var b=0,d=0,e=0;b=a;if((c[b+144>>2]|0)==0){return}a=c[b+144>>2]|0;d=b+120|0;e=c[d+4>>2]|0;c[d>>2]=c[d>>2]|16777216;c[d+4>>2]=e;hG(b,c[(c[b+108>>2]|0)+24>>2]|0);mD(b);e=(c[b+44>>2]|0)>>>19;c[b+88>>2]=mN(1310720,c[(c[15018]|0)+(e<<2)>>2]|0)|0;c[b+92>>2]=mN(1310720,c[515760+(e<<2)>>2]|0)|0;e=ui((c[a+24>>2]|0)-(c[b+24>>2]|0)|0,(c[a+28>>2]|0)-(c[b+28>>2]|0)|0)|0;e=(e|0)/1310720|0;if((e|0)<1){e=1}c[b+96>>2]=((c[a+32>>2]|0)+(c[a+84>>2]>>1)-(c[b+32>>2]|0)|0)/(e|0)|0;return}function m6(a){a=a|0;var b=0;b=a;if((c[b+144>>2]|0)!=0){mD(b);m7(b,c[b+44>>2]|0);return}else{return}}function m7(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a;a=b;do{if((c[144663]|0)!=0){b=0;e=0;while(1){f=lq(e,4)|0;e=f;if((f|0)==0){break}do{if((c[e+8>>2]|0)==390){if((c[e+104>>2]|0)!=18){break}b=b+1|0}}while(0)}if((b|0)<=20){break}return}}while(0);e=a>>>19;a=((((c[(c[d+108>>2]|0)+64>>2]|0)+(c[9448]|0)|0)*3|0|0)/2|0)+262144|0;f=c[d+24>>2]|0;g=f+(mN(a,c[(c[15018]|0)+(e<<2)>>2]|0)|0)|0;f=c[d+28>>2]|0;h=f+(mN(a,c[515760+(e<<2)>>2]|0)|0)|0;e=(c[d+32>>2]|0)+524288|0;L3361:do{if((c[144664]|0)!=0){i=dZ(g,h,e,18)|0}else{if((tj(d,g,h)|0)!=0){return}i=dZ(g,h,e,18)|0;do{if((c[i+32>>2]|0)<=((c[(c[c[i+64>>2]>>2]|0)+16>>2]|0)-(c[i+84>>2]|0)|0)){if((c[i+32>>2]|0)<(c[(c[c[i+64>>2]>>2]|0)+12>>2]|0)){break}break L3361}}while(0);oO(i,d,d,1e4);return}}while(0);e=i+120|0;h=d+120|0;g=c[e+4>>2]&-5|c[h+4>>2]&4;b=i+120|0;c[b>>2]=c[e>>2]|0|c[h>>2]&0;c[b+4>>2]=g;lp(i|0);if((tp(i,c[i+24>>2]|0,c[i+28>>2]|0,0)|0)!=0){lr(i+144|0,c[d+144>>2]|0);m5(i);return}else{oO(i,d,d,1e4);return}}function m8(a){a=a|0;var b=0;b=a;nb(b);m7(b,(c[b+44>>2]|0)+1073741824|0);m7(b,(c[b+44>>2]|0)-2147483648|0);m7(b,(c[b+44>>2]|0)-1073741824|0);return}function m9(a){a=a|0;var b=0,d=0;b=a;switch(c[(c[b+108>>2]|0)+56>>2]|0){case 62:case 63:{d=((lm(43)|0)%2|0)+62|0;break};case 0:{return};case 59:case 60:case 61:{d=((lm(43)|0)%3|0)+59|0;break};default:{d=c[(c[b+108>>2]|0)+56>>2]|0}}do{if((c[b+104>>2]|0)!=19){if((c[b+104>>2]|0)==21){break}hG(b,d);return}}while(0);hG(0,d);return}function na(a){a=a|0;hG(a,31);return}function nb(a){a=a|0;var b=0;b=a+120|0;a=c[b+4>>2]|0;c[b>>2]=c[b>>2]&-3;c[b+4>>2]=a;return}function nc(a){a=a|0;var b=0;b=a;if((c[(c[b+108>>2]|0)+36>>2]|0)==0){return}hG(b,c[(c[b+108>>2]|0)+36>>2]|0);return}function nd(a){a=a|0;var b=0;b=a;tG(b,c[b+144>>2]|0,128);return}function ne(a){a=a|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+128|0;f=e|0;g=a;if((c[14940]|0)==2){if((c[122186]|0)!=7){i=e;return}do{if((c[g+104>>2]|0)!=8){if((c[g+104>>2]|0)==20){break}i=e;return}}while(0)}else{do{if((c[144682]|0)!=0){if((c[122700]|0)>=4){h=2688;break}if((c[122186]|0)!=8){i=e;return}do{if((c[g+104>>2]|0)==15){if((c[122700]|0)==1){break}i=e;return}}while(0)}else{h=2688}}while(0);if((h|0)==2688){a=c[122700]|0;do{if((a|0)==3){if((c[122186]|0)!=8){i=e;return}if((c[g+104>>2]|0)==19){break}i=e;return}else if((a|0)==4){j=c[122186]|0;do{if((j|0)==8){if((c[g+104>>2]|0)==19){break}i=e;return}else if((j|0)==6){if((c[g+104>>2]|0)==21){break}i=e;return}else{i=e;return}}while(0)}else if((a|0)==1){if((c[122186]|0)!=8){i=e;return}if((c[g+104>>2]|0)==15){break}i=e;return}else if((a|0)==2){if((c[122186]|0)!=8){i=e;return}if((c[g+104>>2]|0)==21){break}i=e;return}else{if((c[122186]|0)==8){break}i=e;return}}while(0)}}a=0;while(1){if((a|0)>=4){break}if((c[444120+(a<<2)>>2]|0)!=0){if((c[443e3+(a*288|0)>>2]|0)>0){h=2722;break}}a=a+1|0}if((a|0)==4){i=e;return}a=d[401804]|d[401805|0]<<8|d[401806|0]<<16|d[401807|0]<<24|0;L3494:while(1){if((a|0)==401800){break}if((c[a+8>>2]|0)==390){j=a;do{if((j|0)!=(g|0)){if((c[j+104>>2]|0)!=(c[g+104>>2]|0)){break}if((c[j+132>>2]|0)>0){h=2733;break L3494}}}while(0)}a=c[a+4>>2]|0}if((h|0)==2733){i=e;return}if((c[14940]|0)==2){do{if((c[122186]|0)==7){if((c[g+104>>2]|0)==8){b[f+24>>1]=666;n$(f,1)|0;i=e;return}if((c[g+104>>2]|0)!=20){break}b[f+24>>1]=667;n$(f,8)|0;i=e;return}}while(0)}else{g=c[122700]|0;if((g|0)==1){b[f+24>>1]=666;n$(f,1)|0;i=e;return}else if((g|0)==4){h=2747}do{if((h|0)==2747){g=c[122186]|0;if((g|0)==6){b[f+24>>1]=666;mn(f,6)|0;i=e;return}else if((g|0)==8){b[f+24>>1]=666;n$(f,1)|0;i=e;return}else{break}}}while(0)}dp();i=e;return}function nf(a){a=a|0;var b=0;b=a;hG(b,84);mw(b);return}function ng(a){a=a|0;var b=0;b=a;hG(b,85);mw(b);return}function nh(a){a=a|0;var b=0;b=a;hG(b,79);mw(b);return}function ni(a,b){a=a|0;b=b|0;hG(c[a>>2]|0,5);return}function nj(a,b){a=a|0;b=b|0;hG(c[a>>2]|0,7);return}function nk(a,b){a=a|0;b=b|0;var d=0;d=a;hG(c[d>>2]|0,6);fF(d,b);return}function nl(){var a=0,b=0,e=0,f=0;c[111144]=0;c[154923]=0;c[154922]=0;a=d[401804]|d[401805|0]<<8|d[401806|0]<<16|d[401807|0]<<24|0;while(1){if((a|0)==401800){break}if((c[a+8>>2]|0)==390){b=a;if((c[b+104>>2]|0)==27){if((c[111144]|0)>=(c[111142]|0)){e=c[154920]|0;if((c[111142]|0)!=0){f=c[111142]<<1}else{f=32}c[111142]=f;c[154920]=uo(e,f<<2,1,0)|0}e=c[111144]|0;c[111144]=e+1;c[(c[154920]|0)+(e<<2)>>2]=b}}a=c[a+4>>2]|0}return}function nm(a){a=a|0;hG(0,96);return}function nn(a){a=a|0;hG(0,97);return}function no(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;a=(c[b+24>>2]|0)-12845056|0;while(1){if((a|0)>=((c[b+24>>2]|0)+20971520|0)){break}d=(c[b+28>>2]|0)-20971520|0;e=dZ(a,d,((lm(44)|0)<<1<<16)+128|0,33)|0;c[e+96>>2]=(lm(44)|0)<<9;dR(e,799)|0;d=(lm(44)|0)&7;f=e+112|0;c[f>>2]=(c[f>>2]|0)-d;if((c[e+112>>2]|0)<1){c[e+112>>2]=1}a=a+524288|0}hG(0,98);return}function np(a){a=a|0;var b=0,d=0,e=0;b=a;a=lm(46)|0;d=c[b+24>>2]|0;e=d+(a-(lm(46)|0)<<11)|0;a=c[b+28>>2]|0;b=dZ(e,a,((lm(46)|0)<<1<<16)+128|0,33)|0;c[b+96>>2]=(lm(46)|0)<<9;dR(b,799)|0;a=(lm(46)|0)&7;e=b+112|0;c[e>>2]=(c[e>>2]|0)-a;if((c[b+112>>2]|0)>=1){return}c[b+112>>2]=1;return}function nq(a){a=a|0;dp();return}function nr(a){a=a|0;var d=0,e=0,f=0,g=0;d=a;if((c[111144]|0)==0){return}c[154922]=c[154922]^1;do{if((c[122182]|0)<=1){if((c[154922]|0)!=0){break}return}}while(0);a=c[154923]|0;c[154923]=a+1;e=c[(c[154920]|0)+(a<<2)>>2]|0;c[154923]=(c[154923]|0)%(c[111144]|0)|0;a=d6(d,e,28)|0;lr(a+144|0,e);b[a+148>>1]=((((c[e+28>>2]|0)-(c[d+28>>2]|0)|0)/(c[a+92>>2]|0)|0|0)/(c[(c[a+116>>2]|0)+8>>2]|0)|0)&65535;e=a+120|0;f=d+120|0;d=c[e+4>>2]&-5|c[f+4>>2]&4;g=a+120|0;c[g>>2]=c[e>>2]|0|c[f>>2]&0;c[g+4>>2]=d;lp(a|0);hG(0,94);return}function ns(a){a=a|0;var b=0;b=a;hG(b,95);nw(b);return}function nt(a){a=a|0;var b=0,d=0;b=a;a=c[(c[b+116>>2]|0)+20>>2]|0;(a|0)<0?-1:0;d=xa(0,a,360,0)|0;a=b+44|0;c[a>>2]=(c[a>>2]|0)+d;return}function nu(a){a=a|0;var b=0,d=0;b=a;a=c[(c[b+116>>2]|0)+20>>2]|0;(a|0)<0?-1:0;d=xa(0,a,360,0)|0;c[b+44>>2]=d;return}function nv(a){a=a|0;var b=0,d=0,e=0;b=0;d=c[a+188>>2]|0;while(1){if((d|0)==0){break}a=c[(c[d>>2]|0)+108>>2]|0;e=a;do{if((a|0)!=0){if((c[e+8>>2]|0)!=388){break}b=b|c[e+64>>2]}}while(0);d=c[d+12>>2]|0}return b|0}function nw(a){a=a|0;var d=0,e=0,f=0,g=0,h=0;d=a;a=d+148|0;e=(b[a>>1]|0)-1&65535;b[a>>1]=e;if(e<<16>>16!=0){return}e=c[d+144>>2]|0;hG(dZ(c[e+24>>2]|0,c[e+28>>2]|0,c[e+32>>2]|0,29)|0,35);a=lm(47)|0;if((a|0)<50){f=11}else{if((a|0)<90){f=12}else{if((a|0)<120){f=13}else{if((a|0)<130){f=22}else{if((a|0)<160){f=14}else{if((a|0)<162){f=3}else{if((a|0)<172){f=5}else{if((a|0)<192){f=20}else{if((a|0)<222){f=8}else{if((a|0)<246){f=17}else{f=15}}}}}}}}}}a=dZ(c[e+24>>2]|0,c[e+28>>2]|0,c[e+32>>2]|0,f)|0;f=a+120|0;e=d+120|0;g=c[f+4>>2]&-5|c[e+4>>2]&4;h=a+120|0;c[h>>2]=c[f>>2]|0|c[e>>2]&0;c[h+4>>2]=g;lp(a|0);if((mv(a,1)|0)!=0){g=a;h=c[(c[a+108>>2]|0)+12>>2]|0;dR(g,h)|0}ti(a,c[a+24>>2]|0,c[a+28>>2]|0,1)|0;dS(d);return}function nx(a){a=a|0;var b=0;b=a;a=57;do{if((c[14940]|0)!=0){if((c[b+132>>2]|0)>=-50){break}a=58}}while(0);hG(b,a);return}function ny(a){a=a|0;var b=0;b=a;oO(b,0,0,c[b+132>>2]|0);return}function nz(a){a=a|0;var b=0;b=a;tG(b,c[b+144>>2]|0,c[(c[b+108>>2]|0)+76>>2]|0);return}function nA(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0;b=i;i=i+208|0;d=b|0;e=a;a=c[(c[e+108>>2]|0)+76>>2]|0;nd(e);f=-a|0;while(1){if((f|0)>(a|0)){break}g=-a|0;while(1){if((g|0)>(a|0)){break}h=d;j=e;wQ(h|0,j|0,208)|0;j=d+24|0;c[j>>2]=(c[j>>2]|0)+(f<<16);j=d+28|0;c[j>>2]=(c[j>>2]|0)+(g<<16);j=(ui(f,g)|0)<<18;h=d+32|0;c[h>>2]=(c[h>>2]|0)+j;j=d6(e,d,9)|0;h=j+88|0;c[h>>2]=c[h>>2]>>1;h=j+92|0;c[h>>2]=c[h>>2]>>1;h=j+96|0;c[h>>2]=c[h>>2]>>1;h=j+120|0;j=c[h+4>>2]|0;c[h>>2]=c[h>>2]&-513;c[h+4>>2]=j;g=g+8|0}f=f+8|0}i=b;return}function nB(a){a=a|0;var b=0;b=a;if((c[(c[b+116>>2]|0)+20>>2]|0)==0){return}dZ(c[b+24>>2]|0,c[b+28>>2]|0,(c[(c[b+116>>2]|0)+24>>2]<<16)+(c[b+32>>2]|0)|0,(c[(c[b+116>>2]|0)+20>>2]|0)-1|0)|0;return}function nC(a){a=a|0;var b=0;b=a;do{if((c[b+144>>2]|0)!=0){mD(b);if((my(b)|0)==0){break}if((c[(c[b+116>>2]|0)+24>>2]|0)!=0){hG(b,c[(c[b+116>>2]|0)+24>>2]|0)}oO(c[b+144>>2]|0,b,b,c[(c[b+116>>2]|0)+20>>2]|0);return}}while(0);return}function nD(a){a=a|0;var b=0,d=0;b=a;if((c[(c[b+116>>2]|0)+24>>2]|0)!=0){d=0}else{d=b}hG(d,c[(c[b+116>>2]|0)+20>>2]|0);return}function nE(a){a=a|0;var b=0;b=a;a=lm(60)|0;if((a|0)>=(c[(c[b+116>>2]|0)+24>>2]|0)){return}dR(b,c[(c[b+116>>2]|0)+20>>2]|0)|0;return}function nF(a){a=a|0;var d=0,e=0,f=0;d=i;i=i+288|0;e=d|0;f=a;a=c[113656]|0;wQ(630448,a|0,124)|0;a=c[f+156>>2]|0;c[f+156>>2]=e;c[e+40>>2]=100;b[315235]=c[(c[f+116>>2]|0)+20>>2]&65535;if((b[315235]|0)==0){i=d;return}b[315236]=c[(c[f+116>>2]|0)+24>>2]&65535;if((k_(f,630448,0)|0)==0){kl(630448,0,f)}c[(c[f+116>>2]|0)+20>>2]=b[315235]|0;c[f+156>>2]=a;i=d;return}function nG(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+128|0;e=d|0;f=c[c[a+64>>2]>>2]|0;do{if((c[f+104>>2]|0)!=0){if((c[(c[f+104>>2]|0)+8>>2]|0)!=366){break}g=1;h=g;i=d;return h|0}}while(0);a=b[f+194>>1]|0;b[e+24>>1]=a;do{if(a<<16>>16!=0){f=-1;L3713:while(1){j=j7(e,f)|0;f=j;if((j|0)<0){k=2926;break}switch(b[(c[113656]|0)+(f*124|0)+22>>1]|0){case 10:case 14:case 15:case 20:case 21:case 22:case 47:case 53:case 62:case 66:case 67:case 68:case 87:case 88:case 95:case 120:case 121:case 122:case 123:case 143:case 162:case 163:case 181:case 182:case 144:case 148:case 149:case 211:case 227:case 228:case 231:case 232:case 235:case 236:{break L3713;break};default:{}}}if((k|0)==2926){break}g=1;h=g;i=d;return h|0}}while(0);g=0;h=g;i=d;return h|0}function nH(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=i;i=i+8|0;f=e|0;g=a;a=d;d=2048;c[f>>2]=59392;if((b[g+136>>1]|0)==8){h=0;j=h;i=e;return j|0}if((c[8962]|0)!=0){d=th(g,f)|0}k=c[(c[g+108>>2]|0)+60>>2]|0;do{if((c[f>>2]|0)<59392){l=(ab(2048-((2048-d|0)/2|0)|0,k)|0)/2048|0;k=l;if((l|0)!=0){break}k=1}}while(0);l=c[g+24>>2]|0;m=l;n=ab(k,c[48+(b[g+136>>1]<<2)>>2]|0)|0;o=n;p=c[g+28>>2]|0;q=p;r=ab(k,c[8+(b[g+136>>1]<<2)>>2]|0)|0;k=r;s=tp(g,l+n|0,p+r|0,a)|0;do{if((s|0)!=0){if((c[f>>2]|0)<=59392){break}c[g+24>>2]=m;c[g+28>>2]=q;d=d<<3;a=mN(o,d)|0;r=g+88|0;c[r>>2]=(c[r>>2]|0)+a;a=mN(k,d)|0;r=g+92|0;c[r>>2]=(c[r>>2]|0)+a}}while(0);if((s|0)!=0){s=g+120|0;d=c[s+4>>2]|0;c[s>>2]=c[s>>2]&-2097153;c[s+4>>2]=d;d=g+120|0;do{if(!((c[d>>2]&16384|0)!=0|(c[d+4>>2]&0|0)!=0)){if((c[140234]|0)!=0){if((c[144658]|0)>>>0>=11){break}}c[g+32>>2]=c[g+68>>2]}}while(0);h=1;j=h;i=e;return j|0}d=g+120|0;do{if((c[d>>2]&16384|0)!=0|(c[d+4>>2]&0|0)!=0){if((c[124826]|0)==0){break}if((c[g+32>>2]|0)<(c[100408]|0)){s=g+32|0;c[s>>2]=(c[s>>2]|0)+262144}else{s=g+32|0;c[s>>2]=(c[s>>2]|0)-262144}s=g+120|0;k=c[s+4>>2]|0;c[s>>2]=c[s>>2]|2097152;c[s+4>>2]=k;h=1;j=h;i=e;return j|0}}while(0);if((c[111120]|0)==0){h=0;j=h;i=e;return j|0}b[g+136>>1]=8;d=0;while(1){k=c[111120]|0;c[111120]=k-1;if((k|0)==0){break}if((k_(g,c[(c[103144]|0)+(c[111120]<<2)>>2]|0,0)|0)!=0){d=d|((c[(c[103144]|0)+(c[111120]<<2)>>2]|0)==(c[154960]|0)?1:2)}}do{if((d|0)!=0){if((c[144673]|0)!=0){break}if((c[144658]|0)>>>0>=11){h=(lm(50)|0)>=230^d&1;j=h;i=e;return j|0}else{h=(lm(28)|0)&3;j=h;i=e;return j|0}}}while(0);h=d;j=h;i=e;return j|0}function nI(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;b=a;a=c[144618]|0;d=b+120|0;e=a+120|0;do{if(((c[d>>2]^c[e>>2])&0|0)!=0|((c[d+4>>2]^c[e+4>>2])&4|0)!=0){if((c[b+132>>2]|0)<=0){break}f=b+120|0;if(!((c[f>>2]&4194304|0)!=0|(c[f+4>>2]&0|0)!=0)){if((c[b+104>>2]|0)!=18){break}}f=c[b+144>>2]|0;do{if((f|0)!=0){if((c[f+144>>2]|0)!=(b|0)){break}if((lm(54)|0)<=100){break}g=f+120|0;h=b+120|0;if(!(((c[g>>2]^c[h>>2])&0|0)!=0|((c[g+4>>2]^c[h+4>>2])&4|0)!=0)){break}if((c[f+132>>2]<<1|0)<(c[(c[f+108>>2]|0)+8>>2]|0)){break}i=1;j=i;return j|0}}while(0);if((nJ(a,b,c[144616]|0)|0)!=0){lr(a+176|0,c[a+144>>2]|0);lr(a+144|0,b);f=b+120|0;h=401704+(((c[f>>2]&0|0)!=0|(c[f+4>>2]&4|0)!=0?2:3)*24|0)|0;f=c[b+16>>2]|0;g=c[b+12>>2]|0;c[(c[b+16>>2]|0)+12>>2]=g;c[g+16>>2]=f;f=c[h+16>>2]|0;c[b+16>>2]=f;c[f+12>>2]=b;f=h;c[b+12>>2]=f;c[f+16>>2]=b;i=0;j=i;return j|0}else{i=1;j=i;return j|0}}}while(0);i=1;j=i;return j|0}function nJ(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=a;a=b;if((d|0)==0){d=t_(c[e+24>>2]|0,c[e+28>>2]|0,c[a+24>>2]|0,c[a+28>>2]|0)|0;b=d-(c[e+44>>2]|0)|0;do{if(b>>>0>1073741824){if(b>>>0>=3221225472){break}if((ui((c[a+24>>2]|0)-(c[e+24>>2]|0)|0,(c[a+28>>2]|0)-(c[e+28>>2]|0)|0)|0)<=4194304){break}f=0;g=f;return g|0}}while(0)}f=ia(e,a)|0;g=f;return g|0}function nK(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=a;a=(c[b+28>>2]|0)+(c[b+80>>2]|0)|0;c[100414]=a;d=a-(c[154948]|0)>>23;a=(c[b+28>>2]|0)-(c[b+80>>2]|0)|0;c[100415]=a;e=a-(c[154948]|0)>>23;a=(c[b+24>>2]|0)+(c[b+80>>2]|0)|0;c[100417]=a;f=a-(c[154950]|0)>>23;a=(c[b+24>>2]|0)-(c[b+80>>2]|0)|0;c[100416]=a;g=a-(c[154950]|0)>>23;c[122772]=c[b+32>>2];c[140478]=0;c[140480]=0;c[252]=(c[252]|0)+1;b=g;while(1){if((b|0)>(f|0)){break}g=e;while(1){if((g|0)>(d|0)){break}uz(b,g,50)|0;g=g+1|0}b=b+1|0}return c[140480]|c[140478]|0}function nL(){c[140476]=c[140482];return}function nM(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;e=a;a=c;c=d;d=b[e+136>>1]|0;f=d;if((f|0)!=8){f=f^4}if((a|0)>655360){g=0}else{g=(a|0)<-655360?4:8}h=g;if((c|0)<-655360){i=6}else{i=(c|0)>655360?2:8}g=i;do{if((h|0)!=8){if((g|0)==8){break}if((c|0)<0){j=(a|0)>0?7:5}else{j=(a|0)>0?1:3}i=j&65535;b[e+136>>1]=i;if((f|0)==(i<<16>>16|0)){break}if((nN(e)|0)==0){break}return}}while(0);if((lm(29)|0)>200){k=3033}else{j=c;c=j>>31;i=a;a=i>>31;if(((j^c)-c|0)>((i^a)-a|0)){k=3033}}if((k|0)==3033){l=h;h=g;g=l}if((h|0)==(f|0)){h=8;m=8}else{m=h}do{if((m|0)!=8){b[e+136>>1]=h&65535;if((nN(e)|0)==0){break}return}}while(0);if((g|0)==(f|0)){g=8;n=8}else{n=g}do{if((n|0)!=8){b[e+136>>1]=g&65535;if((nN(e)|0)==0){break}return}}while(0);do{if((d|0)!=8){b[e+136>>1]=d&65535;if((nN(e)|0)==0){break}return}}while(0);do{if(((lm(30)|0)&1|0)!=0){l=0;while(1){if(l>>>0>7){k=3057;break}if((l|0)!=(f|0)){b[e+136>>1]=l&65535;if((nN(e)|0)!=0){break}}l=l+1|0}if((k|0)==3057){break}return}else{l=7;while(1){if((l|0)==-1){k=3065;break}if((l|0)!=(f|0)){b[e+136>>1]=l&65535;if((nN(e)|0)!=0){break}}l=l-1|0}if((k|0)==3065){break}return}}while(0);k=f&65535;b[e+136>>1]=k;if((k<<16>>16|0)==8){return}if((nN(e)|0)!=0){return}b[e+136>>1]=8;return}function nN(a){a=a|0;var c=0,d=0,e=0;c=a;if((mC(c)|0)!=0){b[c+138>>1]=(lm(28)|0)&15;d=1;e=d;return e|0}else{d=0;e=d;return e|0}return 0}function nO(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=a;do{if((c[b+56>>2]|0)!=0){if((c[100417]|0)<=(c[b+40>>2]|0)){break}if((c[100416]|0)>=(c[b+44>>2]|0)){break}if((c[100414]|0)<=(c[b+36>>2]|0)){break}if((c[100415]|0)>=(c[b+32>>2]|0)){break}if((us(401656,b)|0)!=-1){break}a=c[(c[b+52>>2]|0)+12>>2]|0;d=c[(c[b+56>>2]|0)+12>>2]|0;do{if((d|0)==(c[122772]|0)){if((a|0)>=((c[122772]|0)-1572864|0)){e=3094;break}f=t_(0,0,c[b+12>>2]|0,c[b+16>>2]|0)|0}else{e=3094}}while(0);L3926:do{if((e|0)==3094){do{if((a|0)==(c[122772]|0)){if((d|0)>=((c[122772]|0)-1572864|0)){break}f=t_(c[b+12>>2]|0,c[b+16>>2]|0,0,0)|0;break L3926}}while(0);g=1;h=g;return h|0}}while(0);c[140480]=(c[140480]|0)-(c[515760+(f>>>19<<2)>>2]<<5);c[140478]=(c[140478]|0)+(c[(c[15018]|0)+(f>>>19<<2)>>2]<<5)}}while(0);g=1;h=g;return h|0}function nP(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;d=a;a=b;if((c[144658]|0)>>>0<7){e=0;f=e;return f|0}do{if((c[d+176>>2]|0)!=0){if((c[(c[d+176>>2]|0)+132>>2]|0)<=0){break}if((c[113424]|0)==0){break}b=(c[d+176>>2]|0)+120|0;g=d+120|0;if((c[b>>2]&c[g>>2]&0|0)!=0|(c[b+4>>2]&c[g+4>>2]&4|0)!=0){break}lr(d+144|0,c[d+176>>2]|0);lr(d+176|0,0);e=1;f=e;return f|0}}while(0);if((c[144658]|0)>>>0<11){e=0;f=e;return f|0}g=d+120|0;b=401704+(((c[g>>2]&0|0)!=0|(c[g+4>>2]&4|0)!=0?3:2)*24|0)|0;do{if((c[b+12>>2]|0)!=(b|0)){g=(c[d+24>>2]|0)-(c[154950]|0)>>23;h=(c[d+28>>2]|0)-(c[154948]|0)>>23;c[144618]=d;c[144616]=a;if((uA(g,h,24)|0)==0){e=1;f=e;return f|0}i=1;L3959:while(1){if((i|0)>=5){j=3132;break}k=1-i|0;do{if((uA(g+k|0,h-i|0,24)|0)==0){j=3121;break L3959}if((uA(g+k|0,h+i|0,24)|0)==0){j=3121;break L3959}l=k+1|0;k=l;}while((l|0)<(i|0));do{if((uA(g-i|0,h+k|0,24)|0)==0){j=3127;break L3959}if((uA(g+i|0,h+k|0,24)|0)==0){j=3127;break L3959}l=k-1|0;k=l;}while((l+i|0)>=0);i=i+1|0}if((j|0)==3127){e=1;f=e;return f|0}else if((j|0)==3132){i=((lm(52)|0)&31)+15|0;h=c[b+12>>2]|0;while(1){if((h|0)==(b|0)){break}g=i-1|0;i=g;if((g|0)<0){j=3135;break}if((nI(h)|0)==0){j=3137;break}h=c[h+12>>2]|0}if((j|0)==3137){e=1;f=e;return f|0}else if((j|0)==3135){i=c[b+12>>2]|0;g=c[b+16>>2]|0;c[(c[b+12>>2]|0)+16>>2]=g;c[g+12>>2]=i;i=c[h+16>>2]|0;c[b+16>>2]=i;c[i+12>>2]=b;i=b;c[h+16>>2]=i;c[i+12>>2]=h}break}else if((j|0)==3121){e=1;f=e;return f|0}}}while(0);e=0;f=e;return f|0}function nQ(){wS(418744,0,c[38570]|0);return}function nR(a,d,e,f,g){a=a|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;h=a;a=d;d=e;e=f;f=g;if((d|0)!=0){if((c[h+176>>2]|0)==-1){i=b[h+188>>1]|0}else{i=b[(c[108410]|0)+((c[h+176>>2]|0)*196|0)+188>>1]|0}c[d>>2]=i}if((e|0)!=0){if((c[h+180>>2]|0)==-1){j=b[h+188>>1]|0}else{j=b[(c[108410]|0)+((c[h+180>>2]|0)*196|0)+188>>1]|0}c[e>>2]=j}if((c[h+128>>2]|0)==-1){k=h;return k|0}j=(c[108410]|0)+((c[h+128>>2]|0)*196|0)|0;i=c[(c[c[(c[c[96242]>>2]|0)+64>>2]>>2]|0)+128>>2]|0;if((i|0)!=-1){l=(c[96228]|0)<=(c[(c[108410]|0)+(i*196|0)+12>>2]|0)}else{l=0}g=l&1;l=a;m=h;wQ(l|0,m|0,196)|0;c[a+12>>2]=c[j+12>>2];c[a+16>>2]=c[j+16>>2];do{if((g|0)!=0){c[a+12>>2]=c[h+12>>2];c[a+16>>2]=(c[j+12>>2]|0)-1;if(!((f|0)!=0^1)){n=3184;break}b[a+184>>1]=b[j+184>>1]|0;c[a+160>>2]=c[j+160>>2];c[a+164>>2]=c[j+164>>2];if((g|0)!=0){if((b[j+186>>1]|0)==(c[105228]|0)){c[a+12>>2]=(c[a+16>>2]|0)+1;b[a+186>>1]=b[a+184>>1]|0;c[a+168>>2]=c[a+160>>2];c[a+172>>2]=c[a+164>>2]}else{b[a+186>>1]=b[j+186>>1]|0;c[a+168>>2]=c[j+168>>2];c[a+172>>2]=c[j+172>>2]}}b[a+188>>1]=b[j+188>>1]|0;if((d|0)!=0){if((c[j+176>>2]|0)==-1){o=b[j+188>>1]|0}else{o=b[(c[108410]|0)+((c[j+176>>2]|0)*196|0)+188>>1]|0}c[d>>2]=o}if((e|0)!=0){if((c[j+180>>2]|0)==-1){p=b[j+188>>1]|0}else{p=b[(c[108410]|0)+((c[j+180>>2]|0)*196|0)+188>>1]|0}c[e>>2]=p}}else{n=3184}}while(0);if((n|0)==3184){do{if((i|0)!=-1){if((c[96228]|0)<(c[(c[108410]|0)+(i*196|0)+16>>2]|0)){break}if((c[h+16>>2]|0)<=(c[j+16>>2]|0)){break}c[a+16>>2]=c[j+16>>2];c[a+12>>2]=(c[j+16>>2]|0)+1;n=b[j+186>>1]|0;b[a+186>>1]=n;b[a+184>>1]=n;n=c[j+168>>2]|0;c[a+168>>2]=n;c[a+160>>2]=n;n=c[j+172>>2]|0;c[a+172>>2]=n;c[a+164>>2]=n;if((b[j+184>>1]|0)!=(c[105228]|0)){c[a+16>>2]=c[h+16>>2];b[a+184>>1]=b[j+184>>1]|0;c[a+160>>2]=c[j+160>>2];c[a+164>>2]=c[j+164>>2]}b[a+188>>1]=b[j+188>>1]|0;if((d|0)!=0){if((c[j+176>>2]|0)==-1){q=b[j+188>>1]|0}else{q=b[(c[108410]|0)+((c[j+176>>2]|0)*196|0)+188>>1]|0}c[d>>2]=q}if((e|0)!=0){if((c[j+180>>2]|0)==-1){r=b[j+188>>1]|0}else{r=b[(c[108410]|0)+((c[j+180>>2]|0)*196|0)+188>>1]|0}c[e>>2]=r}}}while(0)}h=a;k=h;return k|0}function nS(a){a=a|0;var b=0,d=0,f=0,g=0;b=a;while(1){if(!((b&32768|0)!=0^1)){break}a=(c[111220]|0)+(b*52|0)|0;d=tV(c[96232]|0,c[96230]|0,a)|0;nS(e[a+48+(d<<1)>>1]|0);if((nT(a+16+((d^1)<<4)|0)|0)==0){f=3208;break}b=e[a+48+((d^1)<<1)>>1]|0}if((f|0)==3208){return}if((b|0)==-1){g=0}else{g=b&-32769}nU(g);return}function nT(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=a;if((c[96232]|0)<=(c[b+8>>2]|0)){d=0}else{d=(c[96232]|0)<(c[b+12>>2]|0)?1:2}if((c[96230]|0)>=(c[b>>2]|0)){e=0}else{e=(c[96230]|0)>(c[b+4>>2]|0)?4:8}a=d+e|0;if((a|0)==5){f=1;g=f;return g|0}e=85224+(a<<4)|0;a=tX(c[b+(c[e>>2]<<2)>>2]|0,c[b+(c[e+4>>2]<<2)>>2]|0)|0;d=a-(c[100348]|0)|0;a=tX(c[b+(c[e+8>>2]<<2)>>2]|0,c[b+(c[e+12>>2]<<2)>>2]|0)|0;e=a-(c[100348]|0)|0;if((d|0)<(e|0)){do{if(d>>>0>=2147483648){if(d>>>0>=3221225472){h=3229;break}d=2147483647}else{h=3229}}while(0);if((h|0)==3229){e=-2147483648}}if((e|0)>=(c[144740]|0)){f=0;g=f;return g|0}if((d|0)<=(-(c[144740]|0)|0)){f=0;g=f;return g|0}if((d|0)>=(c[144740]|0)){d=c[144740]|0}if((e|0)<=(-(c[144740]|0)|0)){e=-(c[144740]|0)|0}d=(d+1073741824|0)>>>19;e=(e+1073741824|0)>>>19;h=c[385e3+(d<<2)>>2]|0;d=c[385e3+(e<<2)>>2]|0;if((h|0)==(d|0)){f=0;g=f;return g|0}if((aP(418744+h|0,0,d-h|0)|0)!=0){f=1;g=f;return g|0}else{f=0;g=f;return g|0}return 0}function nU(a){a=a|0;var d=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;d=i;i=i+216|0;f=d+200|0;g=d+208|0;h=(c[102612]|0)+(a<<3)|0;c[122762]=c[h>>2];a=e[h+4>>1]|0;j=(c[108408]|0)+((e[h+6>>1]|0)*44|0)|0;c[122762]=nR(c[122762]|0,d|0,f,g,0)|0;do{if((c[(c[122762]|0)+12>>2]|0)<(c[96228]|0)){k=3254}else{if((c[(c[122762]|0)+128>>2]|0)!=-1){if((b[(c[108410]|0)+((c[(c[122762]|0)+128>>2]|0)*196|0)+186>>1]|0)==(c[105228]|0)){k=3254;break}}l=0}}while(0);if((k|0)==3254){m=c[(c[122762]|0)+12>>2]|0;do{if((b[(c[122762]|0)+184>>1]|0)==(c[105228]|0)){if((c[(c[122762]|0)+156>>2]&-2147483648|0)==0){k=3257;break}n=c[(c[122762]|0)+156>>2]|0}else{k=3257}}while(0);if((k|0)==3257){n=b[(c[122762]|0)+184>>1]|0}l=uM(m,n,c[f>>2]|0,c[(c[122762]|0)+160>>2]|0,c[(c[122762]|0)+164>>2]|0)|0}c[122774]=l;do{if((c[(c[122762]|0)+16>>2]|0)>(c[96228]|0)){k=3264}else{if((b[(c[122762]|0)+186>>1]|0)==(c[105228]|0)){k=3264;break}if((c[(c[122762]|0)+128>>2]|0)!=-1){if((b[(c[108410]|0)+((c[(c[122762]|0)+128>>2]|0)*196|0)+184>>1]|0)==(c[105228]|0)){k=3264;break}}o=0}}while(0);if((k|0)==3264){l=c[(c[122762]|0)+16>>2]|0;do{if((b[(c[122762]|0)+186>>1]|0)==(c[105228]|0)){if((c[(c[122762]|0)+156>>2]&-2147483648|0)==0){k=3267;break}p=c[(c[122762]|0)+156>>2]|0}else{k=3267}}while(0);if((k|0)==3267){p=b[(c[122762]|0)+186>>1]|0}o=uM(l,p,c[g>>2]|0,c[(c[122762]|0)+168>>2]|0,c[(c[122762]|0)+172>>2]|0)|0}c[145084]=o;go(h,((c[f>>2]|0)+(c[g>>2]|0)|0)/2|0);while(1){g=a;a=g-1|0;if((g|0)==0){break}if((c[j+32>>2]|0)==0){nV(j)}j=j+44|0;c[144624]=0}i=d;return}function nV(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;c[144624]=b;a=tX(c[c[b>>2]>>2]|0,c[(c[b>>2]|0)+4>>2]|0)|0;d=tX(c[c[b+4>>2]>>2]|0,c[(c[b+4>>2]|0)+4>>2]|0)|0;e=a-d|0;if(e>>>0>=2147483648){return}c[110626]=a;a=a-(c[100348]|0)|0;d=d-(c[100348]|0)|0;f=a+(c[144740]|0)|0;do{if(f>>>0>c[144740]<<1>>>0){f=f-(c[144740]<<1)|0;if(f>>>0<e>>>0){a=c[144740]|0;break}return}}while(0);f=(c[144740]|0)-d|0;do{if(f>>>0>c[144740]<<1>>>0){f=f-(c[144740]<<1)|0;if(f>>>0<e>>>0){d=-(c[144740]|0)|0;break}return}}while(0);a=(a+1073741824|0)>>>19;d=(d+1073741824|0)>>>19;e=c[385e3+(a<<2)>>2]|0;a=c[385e3+(d<<2)>>2]|0;if((e|0)>=(a|0)){return}c[156010]=c[b+40>>2];if((c[156010]|0)!=0){c[156010]=nR(c[156010]|0,625408,0,0,1)|0}b=c[(c[144624]|0)+20>>2]|0;c[113658]=b;if((c[b+80>>2]|0)!=(c[122178]|0)){nW()}if((c[(c[113658]|0)+84>>2]&8|0)!=0){return}else{nX(e,a,c[(c[113658]|0)+84>>2]&16);return}}function nW(){var a=0,d=0,e=0;c[(c[113658]|0)+80>>2]=c[122178];L4198:do{if((b[(c[113658]|0)+20>>1]&4|0)!=0){if((c[(c[156010]|0)+16>>2]|0)<=(c[(c[122762]|0)+12>>2]|0)){a=3312;break}if((c[(c[156010]|0)+12>>2]|0)>=(c[(c[122762]|0)+16>>2]|0)){a=3312;break}do{if((c[(c[156010]|0)+16>>2]|0)<=(c[(c[156010]|0)+12>>2]|0)){if((c[(c[156010]|0)+16>>2]|0)<(c[(c[122762]|0)+16>>2]|0)){if((b[(c[(c[144624]|0)+16>>2]|0)+8>>1]|0)==0){break}}if((c[(c[156010]|0)+12>>2]|0)>(c[(c[122762]|0)+12>>2]|0)){if((b[(c[(c[144624]|0)+16>>2]|0)+10>>1]|0)==0){break}}if((b[(c[156010]|0)+186>>1]|0)!=(c[105228]|0)){a=3312;break L4198}if((b[(c[122762]|0)+186>>1]|0)!=(c[105228]|0)){a=3312;break L4198}}}while(0);do{if((c[(c[156010]|0)+16>>2]|0)==(c[(c[122762]|0)+16>>2]|0)){if((c[(c[156010]|0)+12>>2]|0)!=(c[(c[122762]|0)+12>>2]|0)){break}if((b[(c[(c[144624]|0)+16>>2]|0)+12>>1]|0)!=0){break}if((wR((c[156010]|0)+160|0,(c[122762]|0)+160|0,30)|0)!=0){break}c[(c[113658]|0)+84>>2]=8;break L4198}}while(0);c[(c[113658]|0)+84>>2]=0;return}else{a=3312}}while(0);if((a|0)==3312){c[(c[113658]|0)+84>>2]=16}if((c[(c[(c[144624]|0)+16>>2]|0)+4>>2]|0)!=0){return}if((b[(c[113658]|0)+20>>1]&4|0)==0){a=(c[(c[122762]|0)+16>>2]|0)-(c[(c[122762]|0)+12>>2]|0)|0;do{if((a|0)>0){if((c[(c[100460]|0)+(c[(c[100456]|0)+(b[(c[(c[144624]|0)+16>>2]|0)+12>>1]<<2)>>2]<<2)>>2]|0)<=(a|0)){break}d=(c[113658]|0)+84|0;c[d>>2]=c[d>>2]|2}}while(0);return}a=(c[(c[122762]|0)+16>>2]|0)-(c[(c[156010]|0)+16>>2]|0)|0;d=a;do{if((a|0)>0){if((c[(c[100460]|0)+(c[(c[100456]|0)+(b[(c[(c[144624]|0)+16>>2]|0)+8>>1]<<2)>>2]<<2)>>2]|0)<=(d|0)){break}e=(c[113658]|0)+84|0;c[e>>2]=c[e>>2]|1}}while(0);a=(c[(c[122762]|0)+12>>2]|0)-(c[(c[156010]|0)+12>>2]|0)|0;d=a;do{if((a|0)>0){if((c[(c[100460]|0)+(c[(c[100456]|0)+(b[(c[(c[144624]|0)+16>>2]|0)+10>>1]<<2)>>2]<<2)>>2]|0)<=(d|0)){break}e=(c[113658]|0)+84|0;c[e>>2]=c[e>>2]|4}}while(0);return}function nX(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;e=b;b=c;c=d;while(1){if((e|0)>=(b|0)){f=3353;break}if((a[418744+e|0]|0)!=0){d=aP(418744+e|0,0,b-e|0)|0;g=d;if((d|0)==0){break}e=g-418744|0}else{d=aP(418744+e|0,1,b-e|0)|0;g=d;if((d|0)!=0){h=g-418744|0}else{h=b}ee(e,h-1|0);if((c|0)!=0){wS(418744+e|0,1,h-e|0)}e=h}}if((f|0)==3353){return}return}function nY(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;h=a;a=b;b=d;d=e;e=g;g=f;if((g|0)==0){f=e;do{if((f|0)==(-1|0)){if(((c[h+12>>2]|0)-a|0)<(b|0)){i=c[h+12>>2]|0;c[h+12>>2]=b;j=tJ(h,d)|0;if((j|0)==1){c[h+12>>2]=i;k=h;l=d;tJ(k,l)|0}m=2;n=m;return n|0}i=c[h+12>>2]|0;l=h+12|0;c[l>>2]=(c[l>>2]|0)-a;j=tJ(h,d)|0;do{if((j|0)==1){if((c[144670]|0)==0){break}c[h+12>>2]=i;l=h;k=d;tI(l,k)|0;m=1;n=m;return n|0}}while(0)}else if((f|0)==1){do{if((c[144670]|0)!=0){o=3368}else{if((b|0)<(c[h+16>>2]|0)){o=3368;break}p=c[h+16>>2]|0}}while(0);if((o|0)==3368){p=b}q=p;if(((c[h+12>>2]|0)+a|0)>(q|0)){i=c[h+12>>2]|0;c[h+12>>2]=q;j=tJ(h,d)|0;if((j|0)==1){c[h+12>>2]=i;k=h;l=d;tJ(k,l)|0}m=2;n=m;return n|0}i=c[h+12>>2]|0;l=h+12|0;c[l>>2]=(c[l>>2]|0)+a;j=tJ(h,d)|0;if((j|0)!=1){break}do{if((c[144670]|0)!=0){if((d|0)!=1){break}m=1;n=m;return n|0}}while(0);c[h+12>>2]=i;tJ(h,d)|0;m=1;n=m;return n|0}}while(0)}else if((g|0)==1){g=e;do{if((g|0)==(-1|0)){do{if((c[144670]|0)!=0){o=3386}else{if((b|0)>(c[h+12>>2]|0)){o=3386;break}r=c[h+12>>2]|0}}while(0);if((o|0)==3386){r=b}q=r;if(((c[h+16>>2]|0)-a|0)<(q|0)){i=c[h+16>>2]|0;c[h+16>>2]=q;j=tJ(h,d)|0;if((j|0)==1){c[h+16>>2]=i;e=h;p=d;tJ(e,p)|0}m=2;n=m;return n|0}i=c[h+16>>2]|0;p=h+16|0;c[p>>2]=(c[p>>2]|0)-a;j=tJ(h,d)|0;if((j|0)!=1){break}if((d|0)==1){m=1;n=m;return n|0}else{c[h+16>>2]=i;p=h;e=d;tJ(p,e)|0;m=1;n=m;return n|0}}else if((g|0)==1){if(((c[h+16>>2]|0)+a|0)<=(b|0)){i=c[h+16>>2]|0;e=h+16|0;c[e>>2]=(c[e>>2]|0)+a;j=tJ(h,d)|0;break}i=c[h+16>>2]|0;c[h+16>>2]=b;j=tJ(h,d)|0;if((j|0)==1){c[h+16>>2]=i;e=h;p=d;tJ(e,p)|0}m=2;n=m;return n|0}}while(0)}m=0;n=m;return n|0}function nZ(a){a=a|0;var d=0,e=0,f=0,g=0;d=a;a=nY(c[d+32>>2]|0,c[d+56>>2]|0,c[d+52>>2]|0,c[d+28>>2]|0,0,c[d+36>>2]|0)|0;if((c[113660]&7|0)==0){hG((c[d+32>>2]|0)+52|0,22)}if((a|0)!=2){return}if((c[d+36>>2]|0)==1){a=c[d+24>>2]|0;if((a|0)==18){e=3424}else if((a|0)==15){b[(c[d+32>>2]|0)+190>>1]=c[d+40>>2]&65535;b[(c[d+32>>2]|0)+184>>1]=b[d+48>>1]|0}else if((a|0)==20|(a|0)==19){b[(c[d+32>>2]|0)+190>>1]=c[d+40>>2]&65535;b[(c[d+32>>2]|0)+192>>1]=c[d+44>>2]&65535;e=3424}if((e|0)==3424){b[(c[d+32>>2]|0)+184>>1]=b[d+48>>1]|0}}else{if((c[d+36>>2]|0)==-1){a=c[d+24>>2]|0;if((a|0)==20|(a|0)==19){b[(c[d+32>>2]|0)+190>>1]=c[d+40>>2]&65535;b[(c[d+32>>2]|0)+192>>1]=c[d+44>>2]&65535;e=3431}else if((a|0)==18){e=3431}else if((a|0)==9){b[(c[d+32>>2]|0)+190>>1]=c[d+40>>2]&65535;b[(c[d+32>>2]|0)+192>>1]=c[d+44>>2]&65535;b[(c[d+32>>2]|0)+184>>1]=b[d+48>>1]|0}if((e|0)==3431){b[(c[d+32>>2]|0)+184>>1]=b[d+48>>1]|0}}}c[(c[d+32>>2]|0)+104>>2]=0;lv(d|0);if((c[(c[d+32>>2]|0)+116>>2]|0)==-2){e=c[d+32>>2]|0;c[e+116>>2]=-1;while(1){if((c[e+120>>2]|0)!=-1){f=(c[(c[108410]|0)+((c[e+120>>2]|0)*196|0)+116>>2]|0)!=-2}else{f=0}if(!f){break}e=(c[108410]|0)+((c[e+120>>2]|0)*196|0)|0}if((c[e+120>>2]|0)==-1){e=c[d+32>>2]|0;while(1){if((c[e+124>>2]|0)!=-1){g=(c[(c[108410]|0)+((c[e+124>>2]|0)*196|0)+116>>2]|0)!=-2}else{g=0}if(!g){break}e=(c[108410]|0)+((c[e+124>>2]|0)*196|0)|0}if((c[e+124>>2]|0)==-1){while(1){if((c[e+120>>2]|0)==-1){break}c[e+116>>2]=0;e=(c[108410]|0)+((c[e+120>>2]|0)*196|0)|0}c[e+116>>2]=0}}}hG((c[d+32>>2]|0)+52|0,19);return}function n_(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=a;if((c[b+32>>2]|0)<0){d=nY(c[b+28>>2]|0,c[b+44>>2]|0,c[b+40>>2]|0,0,1,c[b+32>>2]|0)|0;if((d|0)==0){e=3461}else{if((d|0)==2){e=3461}}if((e|0)==3461){a=c[b+28>>2]|0;f=c[b+44>>2]|0;g=c[b+36>>2]|0;h=c[b+32>>2]|0;nY(a,f,g,0,0,h)|0}}else{d=nY(c[b+28>>2]|0,c[b+44>>2]|0,c[b+36>>2]|0,0,0,c[b+32>>2]|0)|0;if((d|0)==0){e=3465}else{if((d|0)==2){e=3465}}if((e|0)==3465){e=c[b+28>>2]|0;h=c[b+44>>2]|0;g=c[b+40>>2]|0;f=c[b+32>>2]|0;nY(e,h,g,0,1,f)|0}}if((c[113660]&7|0)==0){hG((c[b+28>>2]|0)+52|0,22)}if((d|0)!=2){return}c[(c[b+28>>2]|0)+104>>2]=0;c[(c[b+28>>2]|0)+108>>2]=0;lv(b|0);hG((c[b+28>>2]|0)+52|0,19);return}
function wO(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[156136]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=624584+(h<<2)|0;j=624584+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[156136]=e&~(1<<g)}else{if(l>>>0<(c[156140]|0)>>>0){bP();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{bP();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[156138]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=624584+(p<<2)|0;m=624584+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[156136]=e&~(1<<r)}else{if(l>>>0<(c[156140]|0)>>>0){bP();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{bP();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[156138]|0;if((l|0)!=0){q=c[156141]|0;d=l>>>3;l=d<<1;f=624584+(l<<2)|0;k=c[156136]|0;h=1<<d;do{if((k&h|0)==0){c[156136]=k|h;s=f;t=624584+(l+2<<2)|0}else{d=624584+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[156140]|0)>>>0){s=g;t=d;break}bP();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[156138]=m;c[156141]=e;n=i;return n|0}l=c[156137]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[624848+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[156140]|0;if(r>>>0<i>>>0){bP();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){bP();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){bP();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){bP();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){bP();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{bP();return 0}}}while(0);L6005:do{if((e|0)!=0){f=d+28|0;i=624848+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[156137]=c[156137]&~(1<<c[f>>2]);break L6005}else{if(e>>>0<(c[156140]|0)>>>0){bP();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L6005}}}while(0);if(v>>>0<(c[156140]|0)>>>0){bP();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[156140]|0)>>>0){bP();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[156140]|0)>>>0){bP();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[156138]|0;if((f|0)!=0){e=c[156141]|0;i=f>>>3;f=i<<1;q=624584+(f<<2)|0;k=c[156136]|0;g=1<<i;do{if((k&g|0)==0){c[156136]=k|g;y=q;z=624584+(f+2<<2)|0}else{i=624584+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[156140]|0)>>>0){y=l;z=i;break}bP();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[156138]=p;c[156141]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[156137]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[624848+(A<<2)>>2]|0;L6053:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L6053}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[624848+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[156138]|0)-g|0)>>>0){o=g;break}q=K;m=c[156140]|0;if(q>>>0<m>>>0){bP();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){bP();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){bP();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){bP();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){bP();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{bP();return 0}}}while(0);L6103:do{if((e|0)!=0){i=K+28|0;m=624848+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[156137]=c[156137]&~(1<<c[i>>2]);break L6103}else{if(e>>>0<(c[156140]|0)>>>0){bP();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L6103}}}while(0);if(L>>>0<(c[156140]|0)>>>0){bP();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[156140]|0)>>>0){bP();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[156140]|0)>>>0){bP();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=624584+(e<<2)|0;r=c[156136]|0;j=1<<i;do{if((r&j|0)==0){c[156136]=r|j;O=m;P=624584+(e+2<<2)|0}else{i=624584+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[156140]|0)>>>0){O=d;P=i;break}bP();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=624848+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[156137]|0;l=1<<Q;if((m&l|0)==0){c[156137]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=4804;break}else{l=l<<1;m=j}}if((T|0)==4804){if(S>>>0<(c[156140]|0)>>>0){bP();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[156140]|0;if(m>>>0<i>>>0){bP();return 0}if(j>>>0<i>>>0){bP();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[156138]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[156141]|0;if(S>>>0>15){R=J;c[156141]=R+o;c[156138]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[156138]=0;c[156141]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[156139]|0;if(o>>>0<J>>>0){S=J-o|0;c[156139]=S;J=c[156142]|0;K=J;c[156142]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[113394]|0)==0){J=bM(8)|0;if((J-1&J|0)==0){c[113396]=J;c[113395]=J;c[113397]=-1;c[113398]=-1;c[113399]=0;c[156247]=0;c[113394]=(b6(0)|0)&-16^1431655768;break}else{bP();return 0}}}while(0);J=o+48|0;S=c[113396]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[156246]|0;do{if((O|0)!=0){P=c[156244]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L6195:do{if((c[156247]&4|0)==0){O=c[156142]|0;L6197:do{if((O|0)==0){T=4834}else{L=O;P=624992;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=4834;break L6197}else{P=M}}if((P|0)==0){T=4834;break}L=R-(c[156139]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=aJ(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=4843}}while(0);do{if((T|0)==4834){O=aJ(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[113395]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[156244]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[156246]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=aJ($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=4843}}while(0);L6217:do{if((T|0)==4843){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=4854;break L6195}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[113396]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((aJ(O|0)|0)==-1){aJ(m|0)|0;W=Y;break L6217}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=4854;break L6195}}}while(0);c[156247]=c[156247]|4;ad=W;T=4851}else{ad=0;T=4851}}while(0);do{if((T|0)==4851){if(S>>>0>=2147483647){break}W=aJ(S|0)|0;Z=aJ(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=4854}}}while(0);do{if((T|0)==4854){ad=(c[156244]|0)+aa|0;c[156244]=ad;if(ad>>>0>(c[156245]|0)>>>0){c[156245]=ad}ad=c[156142]|0;L6237:do{if((ad|0)==0){S=c[156140]|0;if((S|0)==0|ab>>>0<S>>>0){c[156140]=ab}c[156248]=ab;c[156249]=aa;c[156251]=0;c[156145]=c[113394];c[156144]=-1;S=0;do{Y=S<<1;ac=624584+(Y<<2)|0;c[624584+(Y+3<<2)>>2]=ac;c[624584+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[156142]=ab+ae;c[156139]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[156143]=c[113398]}else{S=624992;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=4866;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==4866){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[156142]|0;Y=(c[156139]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[156142]=Z+ai;c[156139]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[156143]=c[113398];break L6237}}while(0);if(ab>>>0<(c[156140]|0)>>>0){c[156140]=ab}S=ab+aa|0;Y=624992;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=4876;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==4876){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[156142]|0)){J=(c[156139]|0)+K|0;c[156139]=J;c[156142]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[156141]|0)){J=(c[156138]|0)+K|0;c[156138]=J;c[156141]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L6282:do{if(X>>>0<256){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=624584+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[156140]|0)>>>0){bP();return 0}if((c[U+12>>2]|0)==(Z|0)){break}bP();return 0}}while(0);if((Q|0)==(U|0)){c[156136]=c[156136]&~(1<<V);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[156140]|0)>>>0){bP();return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}bP();return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[156140]|0)>>>0){bP();return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[156140]|0)>>>0){bP();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){bP();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{bP();return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=624848+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[156137]=c[156137]&~(1<<c[P>>2]);break L6282}else{if(m>>>0<(c[156140]|0)>>>0){bP();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L6282}}}while(0);if(an>>>0<(c[156140]|0)>>>0){bP();return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[156140]|0)>>>0){bP();return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[156140]|0)>>>0){bP();return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=ar|1;c[ab+(ar+W)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=624584+(V<<2)|0;P=c[156136]|0;m=1<<J;do{if((P&m|0)==0){c[156136]=P|m;as=X;at=624584+(V+2<<2)|0}else{J=624584+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[156140]|0)>>>0){as=U;at=J;break}bP();return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8)>>2]=as;c[ab+(W+12)>>2]=X;break}V=ac;m=ar>>>8;do{if((m|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=624848+(au<<2)|0;c[ab+(W+28)>>2]=au;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[156137]|0;Q=1<<au;if((X&Q|0)==0){c[156137]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;m=c[aw>>2]|0;if((m|0)==0){T=4949;break}else{Q=Q<<1;X=m}}if((T|0)==4949){if(aw>>>0<(c[156140]|0)>>>0){bP();return 0}else{c[aw>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[156140]|0;if(X>>>0<$>>>0){bP();return 0}if(m>>>0<$>>>0){bP();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=624992;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+(ay-47+aA)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=aa-40-aB|0;c[156142]=ab+aB;c[156139]=_;c[ab+(aB+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[156143]=c[113398];c[ac+4>>2]=27;c[W>>2]=c[156248];c[W+4>>2]=c[624996>>2];c[W+8>>2]=c[625e3>>2];c[W+12>>2]=c[625004>>2];c[156248]=ab;c[156249]=aa;c[156251]=0;c[156250]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<az>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<az>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=624584+(K<<2)|0;S=c[156136]|0;m=1<<W;do{if((S&m|0)==0){c[156136]=S|m;aC=Z;aD=624584+(K+2<<2)|0}else{W=624584+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[156140]|0)>>>0){aC=Q;aD=W;break}bP();return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aE=0}else{if(_>>>0>16777215){aE=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aE=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=624848+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[156137]|0;Q=1<<aE;if((Z&Q|0)==0){c[156137]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=_<<aF;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aG=Z+16+(Q>>>31<<2)|0;m=c[aG>>2]|0;if((m|0)==0){T=4984;break}else{Q=Q<<1;Z=m}}if((T|0)==4984){if(aG>>>0<(c[156140]|0)>>>0){bP();return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[156140]|0;if(Z>>>0<m>>>0){bP();return 0}if(_>>>0<m>>>0){bP();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[156139]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[156139]=_;ad=c[156142]|0;Q=ad;c[156142]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(bC()|0)>>2]=12;n=0;return n|0}function wP(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[156140]|0;if(b>>>0<e>>>0){bP()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){bP()}h=f&-8;i=a+(h-8)|0;j=i;L6454:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){bP()}if((n|0)==(c[156141]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[156138]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=624584+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){bP()}if((c[k+12>>2]|0)==(n|0)){break}bP()}}while(0);if((s|0)==(k|0)){c[156136]=c[156136]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){bP()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}bP()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){bP()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){bP()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){bP()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{bP()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=624848+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[156137]=c[156137]&~(1<<c[v>>2]);q=n;r=o;break L6454}else{if(p>>>0<(c[156140]|0)>>>0){bP()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L6454}}}while(0);if(A>>>0<(c[156140]|0)>>>0){bP()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[156140]|0)>>>0){bP()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[156140]|0)>>>0){bP()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){bP()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){bP()}do{if((e&2|0)==0){if((j|0)==(c[156142]|0)){B=(c[156139]|0)+r|0;c[156139]=B;c[156142]=q;c[q+4>>2]=B|1;if((q|0)!=(c[156141]|0)){return}c[156141]=0;c[156138]=0;return}if((j|0)==(c[156141]|0)){B=(c[156138]|0)+r|0;c[156138]=B;c[156141]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L6556:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=624584+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[156140]|0)>>>0){bP()}if((c[u+12>>2]|0)==(j|0)){break}bP()}}while(0);if((g|0)==(u|0)){c[156136]=c[156136]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[156140]|0)>>>0){bP()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}bP()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[156140]|0)>>>0){bP()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[156140]|0)>>>0){bP()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){bP()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{bP()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=624848+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[156137]=c[156137]&~(1<<c[t>>2]);break L6556}else{if(f>>>0<(c[156140]|0)>>>0){bP()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L6556}}}while(0);if(E>>>0<(c[156140]|0)>>>0){bP()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[156140]|0)>>>0){bP()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[156140]|0)>>>0){bP()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[156141]|0)){H=B;break}c[156138]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=624584+(d<<2)|0;A=c[156136]|0;E=1<<r;do{if((A&E|0)==0){c[156136]=A|E;I=e;J=624584+(d+2<<2)|0}else{r=624584+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[156140]|0)>>>0){I=h;J=r;break}bP()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=624848+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[156137]|0;d=1<<K;do{if((r&d|0)==0){c[156137]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=5161;break}else{A=A<<1;J=E}}if((N|0)==5161){if(M>>>0<(c[156140]|0)>>>0){bP()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[156140]|0;if(J>>>0<E>>>0){bP()}if(B>>>0<E>>>0){bP()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[156144]|0)-1|0;c[156144]=q;if((q|0)==0){O=625e3}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[156144]=-1;return}function wQ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function wR(a,b,c){a=a|0;b=b|0;c=c|0;var e=0,f=0,g=0;while((e|0)<(c|0)){f=d[a+e|0]|0;g=d[b+e|0]|0;if((f|0)!=(g|0))return((f|0)>(g|0)?1:-1)|0;e=e+1|0}return 0}function wS(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function wT(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function wU(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function wV(b,c){b=b|0;c=c|0;var d=0,e=0;d=b+(wU(b)|0)|0;do{a[d+e|0]=a[c+e|0];e=e+1|0}while(a[c+(e-1)|0]|0);return b|0}function wW(a){a=a|0;if((a|0)<65)return a|0;if((a|0)>90)return a|0;return a-65+97|0}function wX(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;while(e>>>0<d>>>0){f=wW(a[b+e|0]|0)|0;g=wW(a[c+e|0]|0)|0;if((f|0)==(g|0)&(f|0)==0)return 0;if((f|0)==0)return-1;if((g|0)==0)return 1;if((f|0)==(g|0)){e=e+1|0;continue}else{return(f>>>0>g>>>0?1:-1)|0}}return 0}function wY(a,b){a=a|0;b=b|0;return wX(a,b,-1)|0}function wZ(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;while((e|0)<(d|0)){a[b+e|0]=f?0:a[c+e|0]|0;f=f?1:(a[c+e|0]|0)==0;e=e+1|0}return b|0}function w_(b,c,d){b=b|0;c=c|0;d=d|0;if((c|0)<(b|0)&(b|0)<(c+d|0)){c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}}else{wQ(b,c,d)|0}}function w$(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(F=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function w0(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(F=e,a-c>>>0|0)|0}function w1(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){F=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}F=a<<c-32;return 0}function w2(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){F=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}F=0;return b>>>c-32|0}function w3(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){F=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}F=(b|0)<0?-1:0;return b>>c-32|0}function w4(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function w5(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function w6(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=ab(d,c)|0;f=a>>>16;a=(e>>>16)+(ab(d,f)|0)|0;d=b>>>16;b=ab(d,c)|0;return(F=(a>>>16)+(ab(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function w7(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=w0(e^a,f^b,e,f)|0;b=F;a=g^e;e=h^f;f=w0((xc(i,b,w0(g^c,h^d,g,h)|0,F,0)|0)^a,F^e,a,e)|0;return(F=F,f)|0}function w8(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=w0(h^a,j^b,h,j)|0;b=F;a=w0(k^d,l^e,k,l)|0;xc(m,b,a,F,g)|0;a=w0(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=F;i=f;return(F=j,a)|0}function w9(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=w6(e,a)|0;f=F;return(F=(ab(b,a)|0)+(ab(d,e)|0)+f|f&0,c|0|0)|0}function xa(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=xc(a,b,c,d,0)|0;return(F=F,e)|0}function xb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;xc(a,b,d,e,g)|0;i=f;return(F=c[g+4>>2]|0,c[g>>2]|0)|0}function xc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(F=n,o)|0}else{if(!m){n=0;o=0;return(F=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(F=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(F=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(F=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((w5(l|0)|0)>>>0);return(F=n,o)|0}p=(w4(l|0)|0)-(w4(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(F=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(F=n,o)|0}else{if(!m){r=(w4(l|0)|0)-(w4(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(F=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(F=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(w4(j|0)|0)+33-(w4(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(F=n,o)|0}else{p=w5(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(F=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;G=0;H=0}else{g=d|0|0;d=k|e&0;e=w$(g,d,-1,-1)|0;k=F;i=w;w=v;v=u;u=t;t=s;s=0;while(1){I=w>>>31|i<<1;J=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;w0(e,k,j,a)|0;b=F;h=b>>31|((b|0)<0?-1:0)<<1;K=h&1;L=w0(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=F;b=t-1|0;if((b|0)==0){break}else{i=I;w=J;v=M;u=L;t=b;s=K}}B=I;C=J;D=M;E=L;G=0;H=K}K=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(K|0)>>>31|(B|C)<<1|(C<<1|K>>>31)&0|G;o=(K<<1|0>>>31)&-2|H;return(F=n,o)|0}function xd(a){a=a|0;return b8[a&15]()|0}function xe(a,b){a=a|0;b=b|0;b9[a&1023](b|0)}function xf(a,b,c){a=a|0;b=b|0;c=c|0;ca[a&63](b|0,c|0)}function xg(a,b){a=a|0;b=b|0;return cb[a&63](b|0)|0}function xh(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;cc[a&63](b|0,c|0,d|0)}function xi(a){a=a|0;cd[a&255]()}function xj(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;ce[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function xk(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;cf[a&15](b|0,c|0,d|0,e|0,f|0,g|0)}function xl(a,b,c){a=a|0;b=b|0;c=c|0;return cg[a&1](b|0,c|0)|0}function xm(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ch[a&15](b|0,c|0,d|0,e|0)}function xn(){ac(0);return 0}function xo(a){a=a|0;ac(1)}function xp(a,b){a=a|0;b=b|0;ac(2)}function xq(a){a=a|0;ac(3);return 0}function xr(a,b,c){a=a|0;b=b|0;c=c|0;ac(4)}function xs(){ac(5)}function xt(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ac(6)}function xu(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ac(7)}function xv(a,b){a=a|0;b=b|0;ac(8);return 0}function xw(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ac(9)}
// EMSCRIPTEN_END_FUNCS
var b8=[xn,xn,vJ,xn,vL,xn,vD,xn,wJ,xn,wB,xn,xn,xn,xn,xn];var b9=[xo,xo,ip,xo,qJ,xo,qa,xo,pH,xo,jj,xo,pV,xo,rN,xo,jc,xo,qu,xo,rS,xo,pJ,xo,mR,xo,mt,xo,qi,xo,qE,xo,il,xo,jf,xo,q2,xo,p8,xo,qY,xo,sc,xo,rk,xo,nA,xo,jg,xo,r0,xo,qU,xo,rr,xo,mD,xo,sb,xo,r8,xo,iN,xo,i4,xo,m9,xo,m8,xo,qc,xo,q5,xo,pG,xo,iZ,xo,mT,xo,qj,xo,q8,xo,sd,xo,iR,xo,rh,xo,rL,xo,p3,xo,m_,xo,pC,xo,mU,xo,rg,xo,ja,xo,nu,xo,mE,xo,rv,xo,qR,xo,r6,xo,pO,xo,rR,xo,p9,xo,nC,xo,mL,xo,rt,xo,m1,xo,mZ,xo,vP,xo,qP,xo,rE,xo,nw,xo,p7,xo,qw,xo,i_,xo,pU,xo,s2,xo,iS,xo,rO,xo,ik,xo,mw,xo,rn,xo,rM,xo,p0,xo,nq,xo,ir,xo,ij,xo,mP,xo,pF,xo,im,xo,p$,xo,pY,xo,qq,xo,q6,xo,iY,xo,qf,xo,qe,xo,qd,xo,mJ,xo,iB,xo,m5,xo,no,xo,r_,xo,i5,xo,mH,xo,rY,xo,qZ,xo,iT,xo,m2,xo,m4,xo,m3,xo,r$,xo,ji,xo,gG,xo,qO,xo,rp,xo,gZ,xo,rD,xo,ru,xo,lt,xo,r3,xo,q$,xo,rj,xo,pQ,xo,qy,xo,qH,xo,rq,xo,rT,xo,rz,xo,qM,xo,iG,xo,qg,xo,mX,xo,qI,xo,qW,xo,qF,xo,rA,xo,s_,xo,nr,xo,qm,xo,m6,xo,rF,xo,qQ,xo,rx,xo,rK,xo,g4,xo,s1,xo,io,xo,qX,xo,qh,xo,u_,xo,r4,xo,mQ,xo,qS,xo,rH,xo,r1,xo,r2,xo,ne,xo,jb,xo,gJ,xo,qt,xo,np,xo,ny,xo,nm,xo,nn,xo,rs,xo,ry,xo,q9,xo,rw,xo,rl,xo,nF,xo,na,xo,q0,xo,uW,xo,r5,xo,pK,xo,m0,xo,pP,xo,pZ,xo,ql,xo,iV,xo,pI,xo,sa,xo,qA,xo,rQ,xo,pW,xo,eN,xo,nt,xo,gS,xo,p1,xo,qr,xo,pN,xo,pL,xo,rV,xo,qB,xo,i8,xo,mO,xo,lK,xo,dU,xo,rG,xo,r7,xo,jd,xo,p_,xo,mF,xo,pM,xo,f0,xo,it,xo,mG,xo,n_,xo,rI,xo,qC,xo,q3,xo,pS,xo,rf,xo,q1,xo,qo,xo,rd,xo,h6,xo,iQ,xo,re,xo,m$,xo,p4,xo,qk,xo,mK,xo,qx,xo,qn,xo,i2,xo,qp,xo,rc,xo,ky,xo,qv,xo,r9,xo,q_,xo,iF,xo,qK,xo,pR,xo,nf,xo,qD,xo,nz,xo,ns,xo,kv,xo,kw,xo,ro,xo,mu,xo,pB,xo,p2,xo,p5,xo,qz,xo,qV,xo,q4,xo,nd,xo,gY,xo,q7,xo,jA,xo,rC,xo,qb,xo,jD,xo,rb,xo,ra,xo,nh,xo,qL,xo,rW,xo,mM,xo,si,xo,is,xo,jh,xo,nZ,xo,nx,xo,p6,xo,iz,xo,s$,xo,pT,xo,iU,xo,rP,xo,ng,xo,nc,xo,nb,xo,je,xo,iL,xo,dM,xo,nD,xo,rm,xo,rJ,xo,ri,xo,nB,xo,i1,xo,pX,xo,qG,xo,h8,xo,h9,xo,mS,xo,nE,xo,ml,xo,rZ,xo,qs,xo,qN,xo,qT,xo,mV,xo,mY,xo,rU,xo,rX,xo,iD,xo,rB,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo,xo];var ca=[xp,xp,fO,xp,lW,xp,nj,xp,fY,xp,fW,xp,fX,xp,fJ,xp,fM,xp,fK,xp,nk,xp,ni,xp,f1,xp,f$,xp,fV,xp,fN,xp,l7,xp,fG,xp,fR,xp,fP,xp,fD,xp,fH,xp,fF,xp,fQ,xp,l6,xp,fU,xp,lU,xp,xp,xp,xp,xp,xp,xp,xp,xp,xp,xp];var cb=[xq,xq,tv,xq,oG,xq,oA,xq,tm,xq,ty,xq,uB,xq,tP,xq,tn,xq,tk,xq,mW,xq,tH,xq,nI,xq,tg,xq,tC,xq,kz,xq,tz,xq,oz,xq,oB,xq,oC,xq,tF,xq,tD,xq,oF,xq,uG,xq,ts,xq,nO,xq,oD,xq,xq,xq,xq,xq,xq,xq,xq,xq,xq,xq];var cc=[xr,xr,e0,xr,fe,xr,fd,xr,e2,xr,e3,xr,fc,xr,e5,xr,e8,xr,e7,xr,e1,xr,fb,xr,wx,xr,e6,xr,fg,xr,fh,xr,ff,xr,e9,xr,e4,xr,fa,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr];var cd=[xs,xs,jt,xs,gy,xs,jr,xs,jp,xs,jk,xs,sA,xs,sr,xs,se,xs,gI,xs,jy,xs,sn,xs,gT,xs,t5,xs,gR,xs,gP,xs,gU,xs,g3,xs,sk,xs,sH,xs,vO,xs,gK,xs,sg,xs,iw,xs,sE,xs,sv,xs,sI,xs,gL,xs,vT,xs,hT,xs,gF,xs,sG,xs,g$,xs,sB,xs,jl,xs,gN,xs,i3,xs,sJ,xs,jB,xs,ps,xs,sh,xs,gX,xs,sf,xs,v0,xs,jo,xs,jz,xs,sl,xs,ss,xs,pu,xs,sm,xs,uZ,xs,iW,xs,g1,xs,iH,xs,gM,xs,so,xs,sx,xs,iC,xs,gQ,xs,jq,xs,sw,xs,sF,xs,js,xs,gE,xs,su,xs,sD,xs,iv,xs,iu,xs,iq,xs,wk,xs,iE,xs,gO,xs,gW,xs,sM,xs,sj,xs,gV,xs,gH,xs,sO,xs,sC,xs,st,xs,g2,xs,g_,xs,sy,xs,sp,xs,sN,xs,sq,xs,sz,xs,iO,xs,jn,xs,sL,xs,pt,xs,jm,xs,gz,xs,g0,xs,sK,xs,i6,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs,xs];var ce=[xt,xt,lR,xt,l3,xt,xt,xt];var cf=[xu,xu,l0,xu,ma,xu,l4,xu,lT,xu,lS,xu,l5,xu,mc,xu];var cg=[xv,xv];var ch=[xw,xw,l1,xw,l$,xw,mb,xw,lV,xw,md,xw,xw,xw,xw,xw];return{_memcmp:wR,_strncasecmp:wX,_strcat:wV,_free:wP,_main:vM,_strncpy:wZ,_memmove:w_,_tolower:wW,_memset:wS,_malloc:wO,_memcpy:wQ,_strcasecmp:wY,_strlen:wU,_strcpy:wT,runPostSets:cy,stackAlloc:ci,stackSave:cj,stackRestore:ck,setThrew:cl,setTempRet0:co,setTempRet1:cp,setTempRet2:cq,setTempRet3:cr,setTempRet4:cs,setTempRet5:ct,setTempRet6:cu,setTempRet7:cv,setTempRet8:cw,setTempRet9:cx,dynCall_i:xd,dynCall_vi:xe,dynCall_vii:xf,dynCall_ii:xg,dynCall_viii:xh,dynCall_v:xi,dynCall_viiiiiiiii:xj,dynCall_viiiiii:xk,dynCall_iii:xl,dynCall_viiii:xm}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_i": invoke_i, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_lseek": _lseek, "__scanString": __scanString, "_fclose": _fclose, "__isFloat": __isFloat, "_fflush": _fflush, "_SDL_GetMouseState": _SDL_GetMouseState, "_strtol": _strtol, "_fputc": _fputc, "_strtok": _strtok, "_fwrite": _fwrite, "_send": _send, "_fputs": _fputs, "_SDL_WarpMouse": _SDL_WarpMouse, "_isspace": _isspace, "_strlwr": _strlwr, "_SDL_UnlockAudio": _SDL_UnlockAudio, "_read": _read, "_SDL_UnlockSurface": _SDL_UnlockSurface, "_sbrk": _sbrk, "_fsync": _fsync, "_signal": _signal, "_SDL_PauseAudio": _SDL_PauseAudio, "_remove": _remove, "_strcmp": _strcmp, "_memchr": _memchr, "_strncmp": _strncmp, "_snprintf": _snprintf, "_SDL_RWFromFile": _SDL_RWFromFile, "_fgetc": _fgetc, "_SDL_SetPalette": _SDL_SetPalette, "_atexit": _atexit, "_mknod": _mknod, "_isalnum": _isalnum, "_SDL_LockAudio": _SDL_LockAudio, "_fgets": _fgets, "_close": _close, "_strchr": _strchr, "_SDL_LockSurface": _SDL_LockSurface, "___setErrNo": ___setErrNo, "_access": _access, "_ftell": _ftell, "_exit": _exit, "_sprintf": _sprintf, "_SDL_ShowCursor": _SDL_ShowCursor, "_SDL_WM_GrabInput": _SDL_WM_GrabInput, "_recv": _recv, "_SDL_SetColors": _SDL_SetColors, "_puts": _puts, "_SDL_Init": _SDL_Init, "_mmap": _mmap, "__exit": __exit, "_llvm_va_end": _llvm_va_end, "_SDL_GL_GetAttribute": _SDL_GL_GetAttribute, "_toupper": _toupper, "_printf": _printf, "_pread": _pread, "_SDL_SetVideoMode": _SDL_SetVideoMode, "_fopen": _fopen, "_open": _open, "_SDL_GL_SetAttribute": _SDL_GL_SetAttribute, "_SDL_PollEvent": _SDL_PollEvent, "_SDL_GetTicks": _SDL_GetTicks, "_SDL_Flip": _SDL_Flip, "_mkdir": _mkdir, "_rmdir": _rmdir, "_SDL_GetError": _SDL_GetError, "_isatty": _isatty, "__formatString": __formatString, "_getenv": _getenv, "_atoi": _atoi, "_SDL_GetVideoSurface": _SDL_GetVideoSurface, "_SDL_WM_SetCaption": _SDL_WM_SetCaption, "_llvm_pow_f64": _llvm_pow_f64, "_SDL_SaveBMP_RW": _SDL_SaveBMP_RW, "_fscanf": _fscanf, "___errno_location": ___errno_location, "_strerror": _strerror, "_SDL_CloseAudio": _SDL_CloseAudio, "_fstat": _fstat, "_SDL_Quit": _SDL_Quit, "__parseInt": __parseInt, "_ungetc": _ungetc, "_SDL_OpenAudio": _SDL_OpenAudio, "_vsnprintf": _vsnprintf, "_sscanf": _sscanf, "_sysconf": _sysconf, "_fread": _fread, "_strtok_r": _strtok_r, "_abort": _abort, "_fprintf": _fprintf, "_isdigit": _isdigit, "___buildEnvironment": ___buildEnvironment, "_feof": _feof, "__reallyNegative": __reallyNegative, "_fseek": _fseek, "_sqrt": _sqrt, "_write": _write, "_stat": _stat, "_SDL_ListModes": _SDL_ListModes, "_emscripten_set_main_loop": _emscripten_set_main_loop, "_SDL_Delay": _SDL_Delay, "_setbuf": _setbuf, "_unlink": _unlink, "___assert_func": ___assert_func, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_atan2": _atan2, "_time": _time, "_setvbuf": _setvbuf, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdout": _stdout, "_stderr": _stderr }, buffer);
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
var _strncasecmp = Module["_strncasecmp"] = asm["_strncasecmp"];
var _strcat = Module["_strcat"] = asm["_strcat"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _strncpy = Module["_strncpy"] = asm["_strncpy"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _tolower = Module["_tolower"] = asm["_tolower"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _strcasecmp = Module["_strcasecmp"] = asm["_strcasecmp"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// TODO: strip out parts of this we do not need
//======= begin closure i64 code =======
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */
var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };
  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.
    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };
  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};
  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }
    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };
  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };
  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };
  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }
    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));
    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };
  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.
  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;
  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);
  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);
  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);
  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);
  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);
  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };
  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };
  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (this.isZero()) {
      return '0';
    }
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }
    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));
    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };
  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };
  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };
  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };
  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };
  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };
  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };
  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };
  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }
    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }
    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };
  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };
  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };
  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }
    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }
    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }
    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);
      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }
      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }
      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };
  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };
  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };
  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };
  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };
  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };
  //======= begin jsbn =======
  var navigator = { appName: 'Modern Browser' }; // polyfill a little
  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/
  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */
  // Basic JavaScript BN library - subset useful for RSA encryption.
  // Bits per digit
  var dbits;
  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);
  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }
  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }
  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.
  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }
  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);
  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;
  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }
  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }
  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }
  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }
  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }
  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }
  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }
  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }
  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }
  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }
  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }
  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }
  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }
  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }
  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }
  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }
  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }
  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }
  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }
  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }
  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;
  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }
  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }
  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }
  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }
  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }
  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;
  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }
  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }
  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }
  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;
  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;
  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);
  // jsbn2 stuff
  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }
  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }
  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }
  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }
  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }
  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }
  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;
  //======= end jsbn =======
  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();
//======= end closure i64 code =======
function EventListener() {
  this.listeners = {};
  this.addEventListener = function(event, func) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(func);
  };
  this.fireEvent = function(event) {
    event.preventDefault = function(){};
    if (event.type in this.listeners) {
      this.listeners[event.type].forEach(function(listener) {
        listener(event);
      });
    }
  };
};
var window = this;
var windowExtra = new EventListener();
for (var x in windowExtra) window[x] = windowExtra[x];
window.close = function() {
  postMessage({ target: 'window', method: 'close' });
};
var document = new EventListener();
document.createElement = function(what) {
  switch(what) {
    case 'canvas': {
      var canvas = new EventListener();
      canvas.ensureData = function() {
        if (!canvas.data || canvas.data.width !== canvas.width || canvas.data.height !== canvas.height) {
          canvas.data = {
            width: canvas.width,
            height: canvas.height,
            data: new Uint8Array(canvas.width*canvas.height*4)
          };
          postMessage({ target: 'canvas', op: 'resize', width: canvas.width, height: canvas.height });
        }
      };
      canvas.getContext = function(type) {
        assert(type == '2d');
        return {
          getImageData: function(x, y, w, h) {
            assert(x == 0 && y == 0 && w == canvas.width && h == canvas.height);
            canvas.ensureData();
            return {
              width: canvas.data.width,
              height: canvas.data.height,
              data: new Uint8Array(canvas.data.data) // TODO: can we avoid this copy?
            };
          },
          putImageData: function(image, x, y) {
            canvas.ensureData();
            assert(x == 0 && y == 0 && image.width == canvas.width && image.height == canvas.height);
            canvas.data.data.set(image.data); // TODO: can we avoid this copy?
            postMessage({ target: 'canvas', op: 'render', image: canvas.data });
          }
        };
      };
      canvas.boundingClientRect = {};
      canvas.getBoundingClientRect = function() {
        return {
          width: canvas.boundingClientRect.width,
          height: canvas.boundingClientRect.height,
          top: canvas.boundingClientRect.top,
          left: canvas.boundingClientRect.left,
          bottom: canvas.boundingClientRect.bottom,
          right: canvas.boundingClientRect.right
        };
      };
      return canvas;
    }
    default: throw 'document.createElement ' + what;
  }
};
var console = {
  log: function(x) {
    Module.printErr(x);
  }
};
Module.canvas = document.createElement('canvas');
Module.setStatus = function(){};
Module.print = function(x) {
  postMessage({ target: 'stdout', content: x });
};
Module.printErr = function(x) {
  postMessage({ target: 'stderr', content: x });
};
// buffer messages until the program starts to run
var messageBuffer = null;
function messageResender() {
  if (calledMain) {
    assert(messageBuffer && messageBuffer.length > 0);
    messageBuffer.forEach(function(message) {
      onmessage(message);
    });
    messageBuffer = null;
  } else {
    setTimeout(messageResender, 100);
  }
}
onmessage = function(message) {
  if (!calledMain) {
    if (!messageBuffer) {
      messageBuffer = [];
      setTimeout(messageResender, 100);
    }
    messageBuffer.push(message);
  }
  switch (message.data.target) {
    case 'document': {
      document.fireEvent(message.data.event);
      break;
    }
    case 'window': {
      window.fireEvent(message.data.event);
      break;
    }
    case 'canvas': {
      if (message.data.event) {
        Module.canvas.fireEvent(message.data.event);
      } else if (message.data.boundingClientRect) {
        Module.canvas.boundingClientRect = message.data.boundingClientRect;
      } else throw 'ey?';
      break;
    }
    default: throw 'wha? ' + message.data.target;
  }
};
// === Auto-generated postamble setup entry stuff ===
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  try {
    var ret = Module['_main'](argc, argv, 0);
    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      throw e;
    }
  } finally {
    calledMain = true;
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (preloadStartTime === null) preloadStartTime = Date.now();
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  // exit the runtime
  exitRuntime();
  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371
  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }
  ABORT = true;
  EXITSTATUS = 1;
  throw 'abort() at ' + (new Error().stack);
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
(function() {
function assert(check, msg) {
  if (!check) throw msg + new Error().stack;
}
    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);
        if (this.crunched) {
          var ddsHeader = byteArray.subarray(0, 128);
          var that = this;
          requestDecrunch(this.name, byteArray.subarray(128), function(ddsData) {
            byteArray = new Uint8Array(ddsHeader.length + ddsData.length);
            byteArray.set(ddsHeader, 0);
            byteArray.set(ddsData, 128);
            that.finish(byteArray);
          });
        } else {
          this.finish(byteArray);
        }
      },
      finish: function(byteArray) {
        var that = this;
        Module['FS_createPreloadedFile'](this.name, null, byteArray, true, true, function() {
          Module['removeRunDependency']('fp ' + that.name);
        }, function() {
          if (that.audio) {
            Module['removeRunDependency']('fp ' + that.name); // workaround for chromium bug 124926 (still no audio with this, but at least we don't hang)
          } else {
            Runtime.warn('Preloading file ' + that.name + ' failed');
          }
        }, false, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        this.requests[this.name] = null;
      },
    };
      new DataRequest(0, 281020, 0, 0).open('GET', '/prboom.wad');
    new DataRequest(281020, 17940848, 0, 0).open('GET', '/doom.wad');
    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;
    var PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    var PACKAGE_NAME = 'boon.data';
    var REMOTE_PACKAGE_NAME = 'boon.data';
    var PACKAGE_UUID = '50235d38-fe0d-4f99-a272-495cb24e4a5f';
    function fetchRemotePackage(packageName, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        if (event.loaded && event.total) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: event.total
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though.
      var ptr = Module['_malloc'](byteArray.length);
      Module['HEAPU8'].set(byteArray, ptr);
      DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
          DataRequest.prototype.requests["/prboom.wad"].onload();
          DataRequest.prototype.requests["/doom.wad"].onload();
          Module['removeRunDependency']('datafile_boon.data');
    };
    Module['addRunDependency']('datafile_boon.data');
    function handleError(error) {
      console.error('package error:', error);
    };
    if (!Module.preloadResults)
      Module.preloadResults = {};
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      fetchRemotePackage(REMOTE_PACKAGE_NAME, processPackageData, handleError);
})();
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}