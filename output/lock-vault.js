"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/isexe/windows.js
var require_windows = __commonJS({
  "node_modules/isexe/windows.js"(exports2, module2) {
    module2.exports = isexe;
    isexe.sync = sync;
    var fs = require("fs");
    function checkPathExt(path3, options) {
      var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
      if (!pathext) {
        return true;
      }
      pathext = pathext.split(";");
      if (pathext.indexOf("") !== -1) {
        return true;
      }
      for (var i = 0; i < pathext.length; i++) {
        var p = pathext[i].toLowerCase();
        if (p && path3.substr(-p.length).toLowerCase() === p) {
          return true;
        }
      }
      return false;
    }
    function checkStat(stat, path3, options) {
      if (!stat.isSymbolicLink() && !stat.isFile()) {
        return false;
      }
      return checkPathExt(path3, options);
    }
    function isexe(path3, options, cb) {
      fs.stat(path3, function(er, stat) {
        cb(er, er ? false : checkStat(stat, path3, options));
      });
    }
    function sync(path3, options) {
      return checkStat(fs.statSync(path3), path3, options);
    }
  }
});

// node_modules/isexe/mode.js
var require_mode = __commonJS({
  "node_modules/isexe/mode.js"(exports2, module2) {
    module2.exports = isexe;
    isexe.sync = sync;
    var fs = require("fs");
    function isexe(path3, options, cb) {
      fs.stat(path3, function(er, stat) {
        cb(er, er ? false : checkStat(stat, options));
      });
    }
    function sync(path3, options) {
      return checkStat(fs.statSync(path3), options);
    }
    function checkStat(stat, options) {
      return stat.isFile() && checkMode(stat, options);
    }
    function checkMode(stat, options) {
      var mod = stat.mode;
      var uid = stat.uid;
      var gid = stat.gid;
      var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
      var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
      var u = parseInt("100", 8);
      var g = parseInt("010", 8);
      var o = parseInt("001", 8);
      var ug = u | g;
      var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
      return ret;
    }
  }
});

// node_modules/isexe/index.js
var require_isexe = __commonJS({
  "node_modules/isexe/index.js"(exports2, module2) {
    var fs = require("fs");
    var core;
    if (process.platform === "win32" || global.TESTING_WINDOWS) {
      core = require_windows();
    } else {
      core = require_mode();
    }
    module2.exports = isexe;
    isexe.sync = sync;
    function isexe(path3, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      if (!cb) {
        if (typeof Promise !== "function") {
          throw new TypeError("callback not provided");
        }
        return new Promise(function(resolve, reject) {
          isexe(path3, options || {}, function(er, is) {
            if (er) {
              reject(er);
            } else {
              resolve(is);
            }
          });
        });
      }
      core(path3, options || {}, function(er, is) {
        if (er) {
          if (er.code === "EACCES" || options && options.ignoreErrors) {
            er = null;
            is = false;
          }
        }
        cb(er, is);
      });
    }
    function sync(path3, options) {
      try {
        return core.sync(path3, options || {});
      } catch (er) {
        if (options && options.ignoreErrors || er.code === "EACCES") {
          return false;
        } else {
          throw er;
        }
      }
    }
  }
});

// node_modules/which/which.js
var require_which = __commonJS({
  "node_modules/which/which.js"(exports2, module2) {
    var isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
    var path3 = require("path");
    var COLON = isWindows ? ";" : ":";
    var isexe = require_isexe();
    var getNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: "ENOENT" });
    var getPathInfo = (cmd, opt) => {
      const colon = opt.colon || COLON;
      const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [
        // windows always checks the cwd first
        ...isWindows ? [process.cwd()] : [],
        ...(opt.path || process.env.PATH || /* istanbul ignore next: very unusual */
        "").split(colon)
      ];
      const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
      const pathExt = isWindows ? pathExtExe.split(colon) : [""];
      if (isWindows) {
        if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
          pathExt.unshift("");
      }
      return {
        pathEnv,
        pathExt,
        pathExtExe
      };
    };
    var which = (cmd, opt, cb) => {
      if (typeof opt === "function") {
        cb = opt;
        opt = {};
      }
      if (!opt)
        opt = {};
      const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
      const found = [];
      const step = (i) => new Promise((resolve, reject) => {
        if (i === pathEnv.length)
          return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
        const ppRaw = pathEnv[i];
        const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
        const pCmd = path3.join(pathPart, cmd);
        const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
        resolve(subStep(p, i, 0));
      });
      const subStep = (p, i, ii) => new Promise((resolve, reject) => {
        if (ii === pathExt.length)
          return resolve(step(i + 1));
        const ext = pathExt[ii];
        isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
          if (!er && is) {
            if (opt.all)
              found.push(p + ext);
            else
              return resolve(p + ext);
          }
          return resolve(subStep(p, i, ii + 1));
        });
      });
      return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
    };
    var whichSync = (cmd, opt) => {
      opt = opt || {};
      const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
      const found = [];
      for (let i = 0; i < pathEnv.length; i++) {
        const ppRaw = pathEnv[i];
        const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
        const pCmd = path3.join(pathPart, cmd);
        const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
        for (let j = 0; j < pathExt.length; j++) {
          const cur = p + pathExt[j];
          try {
            const is = isexe.sync(cur, { pathExt: pathExtExe });
            if (is) {
              if (opt.all)
                found.push(cur);
              else
                return cur;
            }
          } catch (ex) {
          }
        }
      }
      if (opt.all && found.length)
        return found;
      if (opt.nothrow)
        return null;
      throw getNotFoundError(cmd);
    };
    module2.exports = which;
    which.sync = whichSync;
  }
});

// node_modules/path-key/index.js
var require_path_key = __commonJS({
  "node_modules/path-key/index.js"(exports2, module2) {
    "use strict";
    var pathKey2 = (options = {}) => {
      const environment4 = options.env || process.env;
      const platform2 = options.platform || process.platform;
      if (platform2 !== "win32") {
        return "PATH";
      }
      return Object.keys(environment4).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
    };
    module2.exports = pathKey2;
    module2.exports.default = pathKey2;
  }
});

// node_modules/cross-spawn/lib/util/resolveCommand.js
var require_resolveCommand = __commonJS({
  "node_modules/cross-spawn/lib/util/resolveCommand.js"(exports2, module2) {
    "use strict";
    var path3 = require("path");
    var which = require_which();
    var getPathKey = require_path_key();
    function resolveCommandAttempt(parsed, withoutPathExt) {
      const env = parsed.options.env || process.env;
      const cwd = process.cwd();
      const hasCustomCwd = parsed.options.cwd != null;
      const shouldSwitchCwd = hasCustomCwd && process.chdir !== void 0 && !process.chdir.disabled;
      if (shouldSwitchCwd) {
        try {
          process.chdir(parsed.options.cwd);
        } catch (err) {
        }
      }
      let resolved;
      try {
        resolved = which.sync(parsed.command, {
          path: env[getPathKey({ env })],
          pathExt: withoutPathExt ? path3.delimiter : void 0
        });
      } catch (e) {
      } finally {
        if (shouldSwitchCwd) {
          process.chdir(cwd);
        }
      }
      if (resolved) {
        resolved = path3.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
      }
      return resolved;
    }
    function resolveCommand(parsed) {
      return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
    }
    module2.exports = resolveCommand;
  }
});

// node_modules/cross-spawn/lib/util/escape.js
var require_escape = __commonJS({
  "node_modules/cross-spawn/lib/util/escape.js"(exports2, module2) {
    "use strict";
    var metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
    function escapeCommand(arg) {
      arg = arg.replace(metaCharsRegExp, "^$1");
      return arg;
    }
    function escapeArgument(arg, doubleEscapeMetaChars) {
      arg = `${arg}`;
      arg = arg.replace(/(?=(\\+?)?)\1"/g, '$1$1\\"');
      arg = arg.replace(/(?=(\\+?)?)\1$/, "$1$1");
      arg = `"${arg}"`;
      arg = arg.replace(metaCharsRegExp, "^$1");
      if (doubleEscapeMetaChars) {
        arg = arg.replace(metaCharsRegExp, "^$1");
      }
      return arg;
    }
    module2.exports.command = escapeCommand;
    module2.exports.argument = escapeArgument;
  }
});

// node_modules/shebang-regex/index.js
var require_shebang_regex = __commonJS({
  "node_modules/shebang-regex/index.js"(exports2, module2) {
    "use strict";
    module2.exports = /^#!(.*)/;
  }
});

// node_modules/shebang-command/index.js
var require_shebang_command = __commonJS({
  "node_modules/shebang-command/index.js"(exports2, module2) {
    "use strict";
    var shebangRegex = require_shebang_regex();
    module2.exports = (string = "") => {
      const match = string.match(shebangRegex);
      if (!match) {
        return null;
      }
      const [path3, argument] = match[0].replace(/#! ?/, "").split(" ");
      const binary = path3.split("/").pop();
      if (binary === "env") {
        return argument;
      }
      return argument ? `${binary} ${argument}` : binary;
    };
  }
});

// node_modules/cross-spawn/lib/util/readShebang.js
var require_readShebang = __commonJS({
  "node_modules/cross-spawn/lib/util/readShebang.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var shebangCommand = require_shebang_command();
    function readShebang(command) {
      const size = 150;
      const buffer = Buffer.alloc(size);
      let fd;
      try {
        fd = fs.openSync(command, "r");
        fs.readSync(fd, buffer, 0, size, 0);
        fs.closeSync(fd);
      } catch (e) {
      }
      return shebangCommand(buffer.toString());
    }
    module2.exports = readShebang;
  }
});

// node_modules/cross-spawn/lib/parse.js
var require_parse = __commonJS({
  "node_modules/cross-spawn/lib/parse.js"(exports2, module2) {
    "use strict";
    var path3 = require("path");
    var resolveCommand = require_resolveCommand();
    var escape = require_escape();
    var readShebang = require_readShebang();
    var isWin = process.platform === "win32";
    var isExecutableRegExp = /\.(?:com|exe)$/i;
    var isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
    function detectShebang(parsed) {
      parsed.file = resolveCommand(parsed);
      const shebang = parsed.file && readShebang(parsed.file);
      if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;
        return resolveCommand(parsed);
      }
      return parsed.file;
    }
    function parseNonShell(parsed) {
      if (!isWin) {
        return parsed;
      }
      const commandFile = detectShebang(parsed);
      const needsShell = !isExecutableRegExp.test(commandFile);
      if (parsed.options.forceShell || needsShell) {
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
        parsed.command = path3.normalize(parsed.command);
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
        const shellCommand = [parsed.command].concat(parsed.args).join(" ");
        parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
        parsed.command = process.env.comspec || "cmd.exe";
        parsed.options.windowsVerbatimArguments = true;
      }
      return parsed;
    }
    function parse(command, args, options) {
      if (args && !Array.isArray(args)) {
        options = args;
        args = null;
      }
      args = args ? args.slice(0) : [];
      options = Object.assign({}, options);
      const parsed = {
        command,
        args,
        options,
        file: void 0,
        original: {
          command,
          args
        }
      };
      return options.shell ? parsed : parseNonShell(parsed);
    }
    module2.exports = parse;
  }
});

// node_modules/cross-spawn/lib/enoent.js
var require_enoent = __commonJS({
  "node_modules/cross-spawn/lib/enoent.js"(exports2, module2) {
    "use strict";
    var isWin = process.platform === "win32";
    function notFoundError(original, syscall) {
      return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: "ENOENT",
        errno: "ENOENT",
        syscall: `${syscall} ${original.command}`,
        path: original.command,
        spawnargs: original.args
      });
    }
    function hookChildProcess(cp, parsed) {
      if (!isWin) {
        return;
      }
      const originalEmit = cp.emit;
      cp.emit = function(name, arg1) {
        if (name === "exit") {
          const err = verifyENOENT(arg1, parsed);
          if (err) {
            return originalEmit.call(cp, "error", err);
          }
        }
        return originalEmit.apply(cp, arguments);
      };
    }
    function verifyENOENT(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawn");
      }
      return null;
    }
    function verifyENOENTSync(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawnSync");
      }
      return null;
    }
    module2.exports = {
      hookChildProcess,
      verifyENOENT,
      verifyENOENTSync,
      notFoundError
    };
  }
});

// node_modules/cross-spawn/index.js
var require_cross_spawn = __commonJS({
  "node_modules/cross-spawn/index.js"(exports2, module2) {
    "use strict";
    var cp = require("child_process");
    var parse = require_parse();
    var enoent = require_enoent();
    function spawn(command, args, options) {
      const parsed = parse(command, args, options);
      const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
      enoent.hookChildProcess(spawned, parsed);
      return spawned;
    }
    function spawnSync(command, args, options) {
      const parsed = parse(command, args, options);
      const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
      result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
      return result;
    }
    module2.exports = spawn;
    module2.exports.spawn = spawn;
    module2.exports.sync = spawnSync;
    module2.exports._parse = parse;
    module2.exports._enoent = enoent;
  }
});

// node_modules/signal-exit/signals.js
var require_signals = __commonJS({
  "node_modules/signal-exit/signals.js"(exports2, module2) {
    module2.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module2.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module2.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  }
});

// node_modules/signal-exit/index.js
var require_signal_exit = __commonJS({
  "node_modules/signal-exit/index.js"(exports2, module2) {
    var process4 = global.process;
    var processOk = function(process5) {
      return process5 && typeof process5 === "object" && typeof process5.removeListener === "function" && typeof process5.emit === "function" && typeof process5.reallyExit === "function" && typeof process5.listeners === "function" && typeof process5.kill === "function" && typeof process5.pid === "number" && typeof process5.on === "function";
    };
    if (!processOk(process4)) {
      module2.exports = function() {
        return function() {
        };
      };
    } else {
      assert = require("assert");
      signals = require_signals();
      isWin = /^win/i.test(process4.platform);
      EE = require("events");
      if (typeof EE !== "function") {
        EE = EE.EventEmitter;
      }
      if (process4.__signal_exit_emitter__) {
        emitter = process4.__signal_exit_emitter__;
      } else {
        emitter = process4.__signal_exit_emitter__ = new EE();
        emitter.count = 0;
        emitter.emitted = {};
      }
      if (!emitter.infinite) {
        emitter.setMaxListeners(Infinity);
        emitter.infinite = true;
      }
      module2.exports = function(cb, opts) {
        if (!processOk(global.process)) {
          return function() {
          };
        }
        assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
        if (loaded === false) {
          load();
        }
        var ev = "exit";
        if (opts && opts.alwaysLast) {
          ev = "afterexit";
        }
        var remove = function() {
          emitter.removeListener(ev, cb);
          if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
            unload();
          }
        };
        emitter.on(ev, cb);
        return remove;
      };
      unload = function unload2() {
        if (!loaded || !processOk(global.process)) {
          return;
        }
        loaded = false;
        signals.forEach(function(sig) {
          try {
            process4.removeListener(sig, sigListeners[sig]);
          } catch (er) {
          }
        });
        process4.emit = originalProcessEmit;
        process4.reallyExit = originalProcessReallyExit;
        emitter.count -= 1;
      };
      module2.exports.unload = unload;
      emit = function emit2(event, code, signal) {
        if (emitter.emitted[event]) {
          return;
        }
        emitter.emitted[event] = true;
        emitter.emit(event, code, signal);
      };
      sigListeners = {};
      signals.forEach(function(sig) {
        sigListeners[sig] = function listener() {
          if (!processOk(global.process)) {
            return;
          }
          var listeners = process4.listeners(sig);
          if (listeners.length === emitter.count) {
            unload();
            emit("exit", null, sig);
            emit("afterexit", null, sig);
            if (isWin && sig === "SIGHUP") {
              sig = "SIGINT";
            }
            process4.kill(process4.pid, sig);
          }
        };
      });
      module2.exports.signals = function() {
        return signals;
      };
      loaded = false;
      load = function load2() {
        if (loaded || !processOk(global.process)) {
          return;
        }
        loaded = true;
        emitter.count += 1;
        signals = signals.filter(function(sig) {
          try {
            process4.on(sig, sigListeners[sig]);
            return true;
          } catch (er) {
            return false;
          }
        });
        process4.emit = processEmit;
        process4.reallyExit = processReallyExit;
      };
      module2.exports.load = load;
      originalProcessReallyExit = process4.reallyExit;
      processReallyExit = function processReallyExit2(code) {
        if (!processOk(global.process)) {
          return;
        }
        process4.exitCode = code || /* istanbul ignore next */
        0;
        emit("exit", process4.exitCode, null);
        emit("afterexit", process4.exitCode, null);
        originalProcessReallyExit.call(process4, process4.exitCode);
      };
      originalProcessEmit = process4.emit;
      processEmit = function processEmit2(ev, arg) {
        if (ev === "exit" && processOk(global.process)) {
          if (arg !== void 0) {
            process4.exitCode = arg;
          }
          var ret = originalProcessEmit.apply(this, arguments);
          emit("exit", process4.exitCode, null);
          emit("afterexit", process4.exitCode, null);
          return ret;
        } else {
          return originalProcessEmit.apply(this, arguments);
        }
      };
    }
    var assert;
    var signals;
    var isWin;
    var EE;
    var emitter;
    var unload;
    var emit;
    var sigListeners;
    var loaded;
    var load;
    var originalProcessReallyExit;
    var processReallyExit;
    var originalProcessEmit;
    var processEmit;
  }
});

// node_modules/get-stream/buffer-stream.js
var require_buffer_stream = __commonJS({
  "node_modules/get-stream/buffer-stream.js"(exports2, module2) {
    "use strict";
    var { PassThrough: PassThroughStream } = require("stream");
    module2.exports = (options) => {
      options = { ...options };
      const { array } = options;
      let { encoding } = options;
      const isBuffer = encoding === "buffer";
      let objectMode = false;
      if (array) {
        objectMode = !(encoding || isBuffer);
      } else {
        encoding = encoding || "utf8";
      }
      if (isBuffer) {
        encoding = null;
      }
      const stream = new PassThroughStream({ objectMode });
      if (encoding) {
        stream.setEncoding(encoding);
      }
      let length = 0;
      const chunks = [];
      stream.on("data", (chunk) => {
        chunks.push(chunk);
        if (objectMode) {
          length = chunks.length;
        } else {
          length += chunk.length;
        }
      });
      stream.getBufferedValue = () => {
        if (array) {
          return chunks;
        }
        return isBuffer ? Buffer.concat(chunks, length) : chunks.join("");
      };
      stream.getBufferedLength = () => length;
      return stream;
    };
  }
});

// node_modules/get-stream/index.js
var require_get_stream = __commonJS({
  "node_modules/get-stream/index.js"(exports2, module2) {
    "use strict";
    var { constants: BufferConstants } = require("buffer");
    var stream = require("stream");
    var { promisify: promisify2 } = require("util");
    var bufferStream = require_buffer_stream();
    var streamPipelinePromisified = promisify2(stream.pipeline);
    var MaxBufferError = class extends Error {
      constructor() {
        super("maxBuffer exceeded");
        this.name = "MaxBufferError";
      }
    };
    async function getStream2(inputStream, options) {
      if (!inputStream) {
        throw new Error("Expected a stream");
      }
      options = {
        maxBuffer: Infinity,
        ...options
      };
      const { maxBuffer } = options;
      const stream2 = bufferStream(options);
      await new Promise((resolve, reject) => {
        const rejectPromise = (error) => {
          if (error && stream2.getBufferedLength() <= BufferConstants.MAX_LENGTH) {
            error.bufferedData = stream2.getBufferedValue();
          }
          reject(error);
        };
        (async () => {
          try {
            await streamPipelinePromisified(inputStream, stream2);
            resolve();
          } catch (error) {
            rejectPromise(error);
          }
        })();
        stream2.on("data", () => {
          if (stream2.getBufferedLength() > maxBuffer) {
            rejectPromise(new MaxBufferError());
          }
        });
      });
      return stream2.getBufferedValue();
    }
    module2.exports = getStream2;
    module2.exports.buffer = (stream2, options) => getStream2(stream2, { ...options, encoding: "buffer" });
    module2.exports.array = (stream2, options) => getStream2(stream2, { ...options, array: true });
    module2.exports.MaxBufferError = MaxBufferError;
  }
});

// node_modules/merge-stream/index.js
var require_merge_stream = __commonJS({
  "node_modules/merge-stream/index.js"(exports2, module2) {
    "use strict";
    var { PassThrough } = require("stream");
    module2.exports = function() {
      var sources = [];
      var output = new PassThrough({ objectMode: true });
      output.setMaxListeners(0);
      output.add = add;
      output.isEmpty = isEmpty;
      output.on("unpipe", remove);
      Array.prototype.slice.call(arguments).forEach(add);
      return output;
      function add(source) {
        if (Array.isArray(source)) {
          source.forEach(add);
          return this;
        }
        sources.push(source);
        source.once("end", remove.bind(null, source));
        source.once("error", output.emit.bind(output, "error"));
        source.pipe(output, { end: false });
        return this;
      }
      function isEmpty() {
        return sources.length == 0;
      }
      function remove(source) {
        sources = sources.filter(function(it) {
          return it !== source;
        });
        if (!sources.length && output.readable) {
          output.end();
        }
      }
    };
  }
});

// node_modules/node-stream-zip/node_stream_zip.js
var require_node_stream_zip = __commonJS({
  "node_modules/node-stream-zip/node_stream_zip.js"(exports2, module2) {
    var fs = require("fs");
    var util = require("util");
    var path3 = require("path");
    var events = require("events");
    var zlib = require("zlib");
    var stream = require("stream");
    var consts = {
      /* The local file header */
      LOCHDR: 30,
      // LOC header size
      LOCSIG: 67324752,
      // "PK\003\004"
      LOCVER: 4,
      // version needed to extract
      LOCFLG: 6,
      // general purpose bit flag
      LOCHOW: 8,
      // compression method
      LOCTIM: 10,
      // modification time (2 bytes time, 2 bytes date)
      LOCCRC: 14,
      // uncompressed file crc-32 value
      LOCSIZ: 18,
      // compressed size
      LOCLEN: 22,
      // uncompressed size
      LOCNAM: 26,
      // filename length
      LOCEXT: 28,
      // extra field length
      /* The Data descriptor */
      EXTSIG: 134695760,
      // "PK\007\008"
      EXTHDR: 16,
      // EXT header size
      EXTCRC: 4,
      // uncompressed file crc-32 value
      EXTSIZ: 8,
      // compressed size
      EXTLEN: 12,
      // uncompressed size
      /* The central directory file header */
      CENHDR: 46,
      // CEN header size
      CENSIG: 33639248,
      // "PK\001\002"
      CENVEM: 4,
      // version made by
      CENVER: 6,
      // version needed to extract
      CENFLG: 8,
      // encrypt, decrypt flags
      CENHOW: 10,
      // compression method
      CENTIM: 12,
      // modification time (2 bytes time, 2 bytes date)
      CENCRC: 16,
      // uncompressed file crc-32 value
      CENSIZ: 20,
      // compressed size
      CENLEN: 24,
      // uncompressed size
      CENNAM: 28,
      // filename length
      CENEXT: 30,
      // extra field length
      CENCOM: 32,
      // file comment length
      CENDSK: 34,
      // volume number start
      CENATT: 36,
      // internal file attributes
      CENATX: 38,
      // external file attributes (host system dependent)
      CENOFF: 42,
      // LOC header offset
      /* The entries in the end of central directory */
      ENDHDR: 22,
      // END header size
      ENDSIG: 101010256,
      // "PK\005\006"
      ENDSIGFIRST: 80,
      ENDSUB: 8,
      // number of entries on this disk
      ENDTOT: 10,
      // total number of entries
      ENDSIZ: 12,
      // central directory size in bytes
      ENDOFF: 16,
      // offset of first CEN header
      ENDCOM: 20,
      // zip file comment length
      MAXFILECOMMENT: 65535,
      /* The entries in the end of ZIP64 central directory locator */
      ENDL64HDR: 20,
      // ZIP64 end of central directory locator header size
      ENDL64SIG: 117853008,
      // ZIP64 end of central directory locator signature
      ENDL64SIGFIRST: 80,
      ENDL64OFS: 8,
      // ZIP64 end of central directory offset
      /* The entries in the end of ZIP64 central directory */
      END64HDR: 56,
      // ZIP64 end of central directory header size
      END64SIG: 101075792,
      // ZIP64 end of central directory signature
      END64SIGFIRST: 80,
      END64SUB: 24,
      // number of entries on this disk
      END64TOT: 32,
      // total number of entries
      END64SIZ: 40,
      END64OFF: 48,
      /* Compression methods */
      STORED: 0,
      // no compression
      SHRUNK: 1,
      // shrunk
      REDUCED1: 2,
      // reduced with compression factor 1
      REDUCED2: 3,
      // reduced with compression factor 2
      REDUCED3: 4,
      // reduced with compression factor 3
      REDUCED4: 5,
      // reduced with compression factor 4
      IMPLODED: 6,
      // imploded
      // 7 reserved
      DEFLATED: 8,
      // deflated
      ENHANCED_DEFLATED: 9,
      // deflate64
      PKWARE: 10,
      // PKWare DCL imploded
      // 11 reserved
      BZIP2: 12,
      //  compressed using BZIP2
      // 13 reserved
      LZMA: 14,
      // LZMA
      // 15-17 reserved
      IBM_TERSE: 18,
      // compressed using IBM TERSE
      IBM_LZ77: 19,
      //IBM LZ77 z
      /* General purpose bit flag */
      FLG_ENC: 0,
      // encrypted file
      FLG_COMP1: 1,
      // compression option
      FLG_COMP2: 2,
      // compression option
      FLG_DESC: 4,
      // data descriptor
      FLG_ENH: 8,
      // enhanced deflation
      FLG_STR: 16,
      // strong encryption
      FLG_LNG: 1024,
      // language encoding
      FLG_MSK: 4096,
      // mask header values
      FLG_ENTRY_ENC: 1,
      /* 4.5 Extensible data fields */
      EF_ID: 0,
      EF_SIZE: 2,
      /* Header IDs */
      ID_ZIP64: 1,
      ID_AVINFO: 7,
      ID_PFS: 8,
      ID_OS2: 9,
      ID_NTFS: 10,
      ID_OPENVMS: 12,
      ID_UNIX: 13,
      ID_FORK: 14,
      ID_PATCH: 15,
      ID_X509_PKCS7: 20,
      ID_X509_CERTID_F: 21,
      ID_X509_CERTID_C: 22,
      ID_STRONGENC: 23,
      ID_RECORD_MGT: 24,
      ID_X509_PKCS7_RL: 25,
      ID_IBM1: 101,
      ID_IBM2: 102,
      ID_POSZIP: 18064,
      EF_ZIP64_OR_32: 4294967295,
      EF_ZIP64_OR_16: 65535
    };
    var StreamZip = function(config) {
      let fd, fileSize, chunkSize, op, centralDirectory, closed;
      const ready = false, that = this, entries = config.storeEntries !== false ? {} : null, fileName = config.file, textDecoder = config.nameEncoding ? new TextDecoder(config.nameEncoding) : null;
      open2();
      function open2() {
        if (config.fd) {
          fd = config.fd;
          readFile();
        } else {
          fs.open(fileName, "r", (err, f) => {
            if (err) {
              return that.emit("error", err);
            }
            fd = f;
            readFile();
          });
        }
      }
      function readFile() {
        fs.fstat(fd, (err, stat) => {
          if (err) {
            return that.emit("error", err);
          }
          fileSize = stat.size;
          chunkSize = config.chunkSize || Math.round(fileSize / 1e3);
          chunkSize = Math.max(
            Math.min(chunkSize, Math.min(128 * 1024, fileSize)),
            Math.min(1024, fileSize)
          );
          readCentralDirectory();
        });
      }
      function readUntilFoundCallback(err, bytesRead) {
        if (err || !bytesRead) {
          return that.emit("error", err || new Error("Archive read error"));
        }
        let pos = op.lastPos;
        let bufferPosition = pos - op.win.position;
        const buffer = op.win.buffer;
        const minPos = op.minPos;
        while (--pos >= minPos && --bufferPosition >= 0) {
          if (buffer.length - bufferPosition >= 4 && buffer[bufferPosition] === op.firstByte) {
            if (buffer.readUInt32LE(bufferPosition) === op.sig) {
              op.lastBufferPosition = bufferPosition;
              op.lastBytesRead = bytesRead;
              op.complete();
              return;
            }
          }
        }
        if (pos === minPos) {
          return that.emit("error", new Error("Bad archive"));
        }
        op.lastPos = pos + 1;
        op.chunkSize *= 2;
        if (pos <= minPos) {
          return that.emit("error", new Error("Bad archive"));
        }
        const expandLength = Math.min(op.chunkSize, pos - minPos);
        op.win.expandLeft(expandLength, readUntilFoundCallback);
      }
      function readCentralDirectory() {
        const totalReadLength = Math.min(consts.ENDHDR + consts.MAXFILECOMMENT, fileSize);
        op = {
          win: new FileWindowBuffer(fd),
          totalReadLength,
          minPos: fileSize - totalReadLength,
          lastPos: fileSize,
          chunkSize: Math.min(1024, chunkSize),
          firstByte: consts.ENDSIGFIRST,
          sig: consts.ENDSIG,
          complete: readCentralDirectoryComplete
        };
        op.win.read(fileSize - op.chunkSize, op.chunkSize, readUntilFoundCallback);
      }
      function readCentralDirectoryComplete() {
        const buffer = op.win.buffer;
        const pos = op.lastBufferPosition;
        try {
          centralDirectory = new CentralDirectoryHeader();
          centralDirectory.read(buffer.slice(pos, pos + consts.ENDHDR));
          centralDirectory.headerOffset = op.win.position + pos;
          if (centralDirectory.commentLength) {
            that.comment = buffer.slice(
              pos + consts.ENDHDR,
              pos + consts.ENDHDR + centralDirectory.commentLength
            ).toString();
          } else {
            that.comment = null;
          }
          that.entriesCount = centralDirectory.volumeEntries;
          that.centralDirectory = centralDirectory;
          if (centralDirectory.volumeEntries === consts.EF_ZIP64_OR_16 && centralDirectory.totalEntries === consts.EF_ZIP64_OR_16 || centralDirectory.size === consts.EF_ZIP64_OR_32 || centralDirectory.offset === consts.EF_ZIP64_OR_32) {
            readZip64CentralDirectoryLocator();
          } else {
            op = {};
            readEntries();
          }
        } catch (err) {
          that.emit("error", err);
        }
      }
      function readZip64CentralDirectoryLocator() {
        const length = consts.ENDL64HDR;
        if (op.lastBufferPosition > length) {
          op.lastBufferPosition -= length;
          readZip64CentralDirectoryLocatorComplete();
        } else {
          op = {
            win: op.win,
            totalReadLength: length,
            minPos: op.win.position - length,
            lastPos: op.win.position,
            chunkSize: op.chunkSize,
            firstByte: consts.ENDL64SIGFIRST,
            sig: consts.ENDL64SIG,
            complete: readZip64CentralDirectoryLocatorComplete
          };
          op.win.read(op.lastPos - op.chunkSize, op.chunkSize, readUntilFoundCallback);
        }
      }
      function readZip64CentralDirectoryLocatorComplete() {
        const buffer = op.win.buffer;
        const locHeader = new CentralDirectoryLoc64Header();
        locHeader.read(
          buffer.slice(op.lastBufferPosition, op.lastBufferPosition + consts.ENDL64HDR)
        );
        const readLength = fileSize - locHeader.headerOffset;
        op = {
          win: op.win,
          totalReadLength: readLength,
          minPos: locHeader.headerOffset,
          lastPos: op.lastPos,
          chunkSize: op.chunkSize,
          firstByte: consts.END64SIGFIRST,
          sig: consts.END64SIG,
          complete: readZip64CentralDirectoryComplete
        };
        op.win.read(fileSize - op.chunkSize, op.chunkSize, readUntilFoundCallback);
      }
      function readZip64CentralDirectoryComplete() {
        const buffer = op.win.buffer;
        const zip64cd = new CentralDirectoryZip64Header();
        zip64cd.read(buffer.slice(op.lastBufferPosition, op.lastBufferPosition + consts.END64HDR));
        that.centralDirectory.volumeEntries = zip64cd.volumeEntries;
        that.centralDirectory.totalEntries = zip64cd.totalEntries;
        that.centralDirectory.size = zip64cd.size;
        that.centralDirectory.offset = zip64cd.offset;
        that.entriesCount = zip64cd.volumeEntries;
        op = {};
        readEntries();
      }
      function readEntries() {
        op = {
          win: new FileWindowBuffer(fd),
          pos: centralDirectory.offset,
          chunkSize,
          entriesLeft: centralDirectory.volumeEntries
        };
        op.win.read(op.pos, Math.min(chunkSize, fileSize - op.pos), readEntriesCallback);
      }
      function readEntriesCallback(err, bytesRead) {
        if (err || !bytesRead) {
          return that.emit("error", err || new Error("Entries read error"));
        }
        let bufferPos = op.pos - op.win.position;
        let entry = op.entry;
        const buffer = op.win.buffer;
        const bufferLength = buffer.length;
        try {
          while (op.entriesLeft > 0) {
            if (!entry) {
              entry = new ZipEntry();
              entry.readHeader(buffer, bufferPos);
              entry.headerOffset = op.win.position + bufferPos;
              op.entry = entry;
              op.pos += consts.CENHDR;
              bufferPos += consts.CENHDR;
            }
            const entryHeaderSize = entry.fnameLen + entry.extraLen + entry.comLen;
            const advanceBytes = entryHeaderSize + (op.entriesLeft > 1 ? consts.CENHDR : 0);
            if (bufferLength - bufferPos < advanceBytes) {
              op.win.moveRight(chunkSize, readEntriesCallback, bufferPos);
              op.move = true;
              return;
            }
            entry.read(buffer, bufferPos, textDecoder);
            if (!config.skipEntryNameValidation) {
              entry.validateName();
            }
            if (entries) {
              entries[entry.name] = entry;
            }
            that.emit("entry", entry);
            op.entry = entry = null;
            op.entriesLeft--;
            op.pos += entryHeaderSize;
            bufferPos += entryHeaderSize;
          }
          that.emit("ready");
        } catch (err2) {
          that.emit("error", err2);
        }
      }
      function checkEntriesExist() {
        if (!entries) {
          throw new Error("storeEntries disabled");
        }
      }
      Object.defineProperty(this, "ready", {
        get() {
          return ready;
        }
      });
      this.entry = function(name) {
        checkEntriesExist();
        return entries[name];
      };
      this.entries = function() {
        checkEntriesExist();
        return entries;
      };
      this.stream = function(entry, callback) {
        return this.openEntry(
          entry,
          (err, entry2) => {
            if (err) {
              return callback(err);
            }
            const offset = dataOffset(entry2);
            let entryStream = new EntryDataReaderStream(fd, offset, entry2.compressedSize);
            if (entry2.method === consts.STORED) {
            } else if (entry2.method === consts.DEFLATED) {
              entryStream = entryStream.pipe(zlib.createInflateRaw());
            } else {
              return callback(new Error("Unknown compression method: " + entry2.method));
            }
            if (canVerifyCrc(entry2)) {
              entryStream = entryStream.pipe(
                new EntryVerifyStream(entryStream, entry2.crc, entry2.size)
              );
            }
            callback(null, entryStream);
          },
          false
        );
      };
      this.entryDataSync = function(entry) {
        let err = null;
        this.openEntry(
          entry,
          (e, en) => {
            err = e;
            entry = en;
          },
          true
        );
        if (err) {
          throw err;
        }
        let data = Buffer.alloc(entry.compressedSize);
        new FsRead(fd, data, 0, entry.compressedSize, dataOffset(entry), (e) => {
          err = e;
        }).read(true);
        if (err) {
          throw err;
        }
        if (entry.method === consts.STORED) {
        } else if (entry.method === consts.DEFLATED || entry.method === consts.ENHANCED_DEFLATED) {
          data = zlib.inflateRawSync(data);
        } else {
          throw new Error("Unknown compression method: " + entry.method);
        }
        if (data.length !== entry.size) {
          throw new Error("Invalid size");
        }
        if (canVerifyCrc(entry)) {
          const verify = new CrcVerify(entry.crc, entry.size);
          verify.data(data);
        }
        return data;
      };
      this.openEntry = function(entry, callback, sync) {
        if (typeof entry === "string") {
          checkEntriesExist();
          entry = entries[entry];
          if (!entry) {
            return callback(new Error("Entry not found"));
          }
        }
        if (!entry.isFile) {
          return callback(new Error("Entry is not file"));
        }
        if (!fd) {
          return callback(new Error("Archive closed"));
        }
        const buffer = Buffer.alloc(consts.LOCHDR);
        new FsRead(fd, buffer, 0, buffer.length, entry.offset, (err) => {
          if (err) {
            return callback(err);
          }
          let readEx;
          try {
            entry.readDataHeader(buffer);
            if (entry.encrypted) {
              readEx = new Error("Entry encrypted");
            }
          } catch (ex) {
            readEx = ex;
          }
          callback(readEx, entry);
        }).read(sync);
      };
      function dataOffset(entry) {
        return entry.offset + consts.LOCHDR + entry.fnameLen + entry.extraLen;
      }
      function canVerifyCrc(entry) {
        return (entry.flags & 8) !== 8;
      }
      function extract(entry, outPath, callback) {
        that.stream(entry, (err, stm) => {
          if (err) {
            callback(err);
          } else {
            let fsStm, errThrown;
            stm.on("error", (err2) => {
              errThrown = err2;
              if (fsStm) {
                stm.unpipe(fsStm);
                fsStm.close(() => {
                  callback(err2);
                });
              }
            });
            fs.open(outPath, "w", (err2, fdFile) => {
              if (err2) {
                return callback(err2);
              }
              if (errThrown) {
                fs.close(fd, () => {
                  callback(errThrown);
                });
                return;
              }
              fsStm = fs.createWriteStream(outPath, { fd: fdFile });
              fsStm.on("finish", () => {
                that.emit("extract", entry, outPath);
                if (!errThrown) {
                  callback();
                }
              });
              stm.pipe(fsStm);
            });
          }
        });
      }
      function createDirectories(baseDir, dirs, callback) {
        if (!dirs.length) {
          return callback();
        }
        let dir = dirs.shift();
        dir = path3.join(baseDir, path3.join(...dir));
        fs.mkdir(dir, { recursive: true }, (err) => {
          if (err && err.code !== "EEXIST") {
            return callback(err);
          }
          createDirectories(baseDir, dirs, callback);
        });
      }
      function extractFiles(baseDir, baseRelPath, files, callback, extractedCount) {
        if (!files.length) {
          return callback(null, extractedCount);
        }
        const file = files.shift();
        const targetPath = path3.join(baseDir, file.name.replace(baseRelPath, ""));
        extract(file, targetPath, (err) => {
          if (err) {
            return callback(err, extractedCount);
          }
          extractFiles(baseDir, baseRelPath, files, callback, extractedCount + 1);
        });
      }
      this.extract = function(entry, outPath, callback) {
        let entryName = entry || "";
        if (typeof entry === "string") {
          entry = this.entry(entry);
          if (entry) {
            entryName = entry.name;
          } else {
            if (entryName.length && entryName[entryName.length - 1] !== "/") {
              entryName += "/";
            }
          }
        }
        if (!entry || entry.isDirectory) {
          const files = [], dirs = [], allDirs = {};
          for (const e in entries) {
            if (Object.prototype.hasOwnProperty.call(entries, e) && e.lastIndexOf(entryName, 0) === 0) {
              let relPath = e.replace(entryName, "");
              const childEntry = entries[e];
              if (childEntry.isFile) {
                files.push(childEntry);
                relPath = path3.dirname(relPath);
              }
              if (relPath && !allDirs[relPath] && relPath !== ".") {
                allDirs[relPath] = true;
                let parts = relPath.split("/").filter((f) => {
                  return f;
                });
                if (parts.length) {
                  dirs.push(parts);
                }
                while (parts.length > 1) {
                  parts = parts.slice(0, parts.length - 1);
                  const partsPath = parts.join("/");
                  if (allDirs[partsPath] || partsPath === ".") {
                    break;
                  }
                  allDirs[partsPath] = true;
                  dirs.push(parts);
                }
              }
            }
          }
          dirs.sort((x, y) => {
            return x.length - y.length;
          });
          if (dirs.length) {
            createDirectories(outPath, dirs, (err) => {
              if (err) {
                callback(err);
              } else {
                extractFiles(outPath, entryName, files, callback, 0);
              }
            });
          } else {
            extractFiles(outPath, entryName, files, callback, 0);
          }
        } else {
          fs.stat(outPath, (err, stat) => {
            if (stat && stat.isDirectory()) {
              extract(entry, path3.join(outPath, path3.basename(entry.name)), callback);
            } else {
              extract(entry, outPath, callback);
            }
          });
        }
      };
      this.close = function(callback) {
        if (closed || !fd) {
          closed = true;
          if (callback) {
            callback();
          }
        } else {
          closed = true;
          fs.close(fd, (err) => {
            fd = null;
            if (callback) {
              callback(err);
            }
          });
        }
      };
      const originalEmit = events.EventEmitter.prototype.emit;
      this.emit = function(...args) {
        if (!closed) {
          return originalEmit.call(this, ...args);
        }
      };
    };
    StreamZip.setFs = function(customFs) {
      fs = customFs;
    };
    StreamZip.debugLog = (...args) => {
      if (StreamZip.debug) {
        console.log(...args);
      }
    };
    util.inherits(StreamZip, events.EventEmitter);
    var propZip = Symbol("zip");
    StreamZip.async = class StreamZipAsync extends events.EventEmitter {
      constructor(config) {
        super();
        const zip = new StreamZip(config);
        zip.on("entry", (entry) => this.emit("entry", entry));
        zip.on("extract", (entry, outPath) => this.emit("extract", entry, outPath));
        this[propZip] = new Promise((resolve, reject) => {
          zip.on("ready", () => {
            zip.removeListener("error", reject);
            resolve(zip);
          });
          zip.on("error", reject);
        });
      }
      get entriesCount() {
        return this[propZip].then((zip) => zip.entriesCount);
      }
      get comment() {
        return this[propZip].then((zip) => zip.comment);
      }
      async entry(name) {
        const zip = await this[propZip];
        return zip.entry(name);
      }
      async entries() {
        const zip = await this[propZip];
        return zip.entries();
      }
      async stream(entry) {
        const zip = await this[propZip];
        return new Promise((resolve, reject) => {
          zip.stream(entry, (err, stm) => {
            if (err) {
              reject(err);
            } else {
              resolve(stm);
            }
          });
        });
      }
      async entryData(entry) {
        const stm = await this.stream(entry);
        return new Promise((resolve, reject) => {
          const data = [];
          stm.on("data", (chunk) => data.push(chunk));
          stm.on("end", () => {
            resolve(Buffer.concat(data));
          });
          stm.on("error", (err) => {
            stm.removeAllListeners("end");
            reject(err);
          });
        });
      }
      async extract(entry, outPath) {
        const zip = await this[propZip];
        return new Promise((resolve, reject) => {
          zip.extract(entry, outPath, (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      async close() {
        const zip = await this[propZip];
        return new Promise((resolve, reject) => {
          zip.close((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
    };
    var CentralDirectoryHeader = class {
      read(data) {
        if (data.length !== consts.ENDHDR || data.readUInt32LE(0) !== consts.ENDSIG) {
          throw new Error("Invalid central directory");
        }
        this.volumeEntries = data.readUInt16LE(consts.ENDSUB);
        this.totalEntries = data.readUInt16LE(consts.ENDTOT);
        this.size = data.readUInt32LE(consts.ENDSIZ);
        this.offset = data.readUInt32LE(consts.ENDOFF);
        this.commentLength = data.readUInt16LE(consts.ENDCOM);
      }
    };
    var CentralDirectoryLoc64Header = class {
      read(data) {
        if (data.length !== consts.ENDL64HDR || data.readUInt32LE(0) !== consts.ENDL64SIG) {
          throw new Error("Invalid zip64 central directory locator");
        }
        this.headerOffset = readUInt64LE(data, consts.ENDSUB);
      }
    };
    var CentralDirectoryZip64Header = class {
      read(data) {
        if (data.length !== consts.END64HDR || data.readUInt32LE(0) !== consts.END64SIG) {
          throw new Error("Invalid central directory");
        }
        this.volumeEntries = readUInt64LE(data, consts.END64SUB);
        this.totalEntries = readUInt64LE(data, consts.END64TOT);
        this.size = readUInt64LE(data, consts.END64SIZ);
        this.offset = readUInt64LE(data, consts.END64OFF);
      }
    };
    var ZipEntry = class {
      readHeader(data, offset) {
        if (data.length < offset + consts.CENHDR || data.readUInt32LE(offset) !== consts.CENSIG) {
          throw new Error("Invalid entry header");
        }
        this.verMade = data.readUInt16LE(offset + consts.CENVEM);
        this.version = data.readUInt16LE(offset + consts.CENVER);
        this.flags = data.readUInt16LE(offset + consts.CENFLG);
        this.method = data.readUInt16LE(offset + consts.CENHOW);
        const timebytes = data.readUInt16LE(offset + consts.CENTIM);
        const datebytes = data.readUInt16LE(offset + consts.CENTIM + 2);
        this.time = parseZipTime(timebytes, datebytes);
        this.crc = data.readUInt32LE(offset + consts.CENCRC);
        this.compressedSize = data.readUInt32LE(offset + consts.CENSIZ);
        this.size = data.readUInt32LE(offset + consts.CENLEN);
        this.fnameLen = data.readUInt16LE(offset + consts.CENNAM);
        this.extraLen = data.readUInt16LE(offset + consts.CENEXT);
        this.comLen = data.readUInt16LE(offset + consts.CENCOM);
        this.diskStart = data.readUInt16LE(offset + consts.CENDSK);
        this.inattr = data.readUInt16LE(offset + consts.CENATT);
        this.attr = data.readUInt32LE(offset + consts.CENATX);
        this.offset = data.readUInt32LE(offset + consts.CENOFF);
      }
      readDataHeader(data) {
        if (data.readUInt32LE(0) !== consts.LOCSIG) {
          throw new Error("Invalid local header");
        }
        this.version = data.readUInt16LE(consts.LOCVER);
        this.flags = data.readUInt16LE(consts.LOCFLG);
        this.method = data.readUInt16LE(consts.LOCHOW);
        const timebytes = data.readUInt16LE(consts.LOCTIM);
        const datebytes = data.readUInt16LE(consts.LOCTIM + 2);
        this.time = parseZipTime(timebytes, datebytes);
        this.crc = data.readUInt32LE(consts.LOCCRC) || this.crc;
        const compressedSize = data.readUInt32LE(consts.LOCSIZ);
        if (compressedSize && compressedSize !== consts.EF_ZIP64_OR_32) {
          this.compressedSize = compressedSize;
        }
        const size = data.readUInt32LE(consts.LOCLEN);
        if (size && size !== consts.EF_ZIP64_OR_32) {
          this.size = size;
        }
        this.fnameLen = data.readUInt16LE(consts.LOCNAM);
        this.extraLen = data.readUInt16LE(consts.LOCEXT);
      }
      read(data, offset, textDecoder) {
        const nameData = data.slice(offset, offset += this.fnameLen);
        this.name = textDecoder ? textDecoder.decode(new Uint8Array(nameData)) : nameData.toString("utf8");
        const lastChar = data[offset - 1];
        this.isDirectory = lastChar === 47 || lastChar === 92;
        if (this.extraLen) {
          this.readExtra(data, offset);
          offset += this.extraLen;
        }
        this.comment = this.comLen ? data.slice(offset, offset + this.comLen).toString() : null;
      }
      validateName() {
        if (/\\|^\w+:|^\/|(^|\/)\.\.(\/|$)/.test(this.name)) {
          throw new Error("Malicious entry: " + this.name);
        }
      }
      readExtra(data, offset) {
        let signature, size;
        const maxPos = offset + this.extraLen;
        while (offset < maxPos) {
          signature = data.readUInt16LE(offset);
          offset += 2;
          size = data.readUInt16LE(offset);
          offset += 2;
          if (consts.ID_ZIP64 === signature) {
            this.parseZip64Extra(data, offset, size);
          }
          offset += size;
        }
      }
      parseZip64Extra(data, offset, length) {
        if (length >= 8 && this.size === consts.EF_ZIP64_OR_32) {
          this.size = readUInt64LE(data, offset);
          offset += 8;
          length -= 8;
        }
        if (length >= 8 && this.compressedSize === consts.EF_ZIP64_OR_32) {
          this.compressedSize = readUInt64LE(data, offset);
          offset += 8;
          length -= 8;
        }
        if (length >= 8 && this.offset === consts.EF_ZIP64_OR_32) {
          this.offset = readUInt64LE(data, offset);
          offset += 8;
          length -= 8;
        }
        if (length >= 4 && this.diskStart === consts.EF_ZIP64_OR_16) {
          this.diskStart = data.readUInt32LE(offset);
        }
      }
      get encrypted() {
        return (this.flags & consts.FLG_ENTRY_ENC) === consts.FLG_ENTRY_ENC;
      }
      get isFile() {
        return !this.isDirectory;
      }
    };
    var FsRead = class {
      constructor(fd, buffer, offset, length, position, callback) {
        this.fd = fd;
        this.buffer = buffer;
        this.offset = offset;
        this.length = length;
        this.position = position;
        this.callback = callback;
        this.bytesRead = 0;
        this.waiting = false;
      }
      read(sync) {
        StreamZip.debugLog("read", this.position, this.bytesRead, this.length, this.offset);
        this.waiting = true;
        let err;
        if (sync) {
          let bytesRead = 0;
          try {
            bytesRead = fs.readSync(
              this.fd,
              this.buffer,
              this.offset + this.bytesRead,
              this.length - this.bytesRead,
              this.position + this.bytesRead
            );
          } catch (e) {
            err = e;
          }
          this.readCallback(sync, err, err ? bytesRead : null);
        } else {
          fs.read(
            this.fd,
            this.buffer,
            this.offset + this.bytesRead,
            this.length - this.bytesRead,
            this.position + this.bytesRead,
            this.readCallback.bind(this, sync)
          );
        }
      }
      readCallback(sync, err, bytesRead) {
        if (typeof bytesRead === "number") {
          this.bytesRead += bytesRead;
        }
        if (err || !bytesRead || this.bytesRead === this.length) {
          this.waiting = false;
          return this.callback(err, this.bytesRead);
        } else {
          this.read(sync);
        }
      }
    };
    var FileWindowBuffer = class {
      constructor(fd) {
        this.position = 0;
        this.buffer = Buffer.alloc(0);
        this.fd = fd;
        this.fsOp = null;
      }
      checkOp() {
        if (this.fsOp && this.fsOp.waiting) {
          throw new Error("Operation in progress");
        }
      }
      read(pos, length, callback) {
        this.checkOp();
        if (this.buffer.length < length) {
          this.buffer = Buffer.alloc(length);
        }
        this.position = pos;
        this.fsOp = new FsRead(this.fd, this.buffer, 0, length, this.position, callback).read();
      }
      expandLeft(length, callback) {
        this.checkOp();
        this.buffer = Buffer.concat([Buffer.alloc(length), this.buffer]);
        this.position -= length;
        if (this.position < 0) {
          this.position = 0;
        }
        this.fsOp = new FsRead(this.fd, this.buffer, 0, length, this.position, callback).read();
      }
      expandRight(length, callback) {
        this.checkOp();
        const offset = this.buffer.length;
        this.buffer = Buffer.concat([this.buffer, Buffer.alloc(length)]);
        this.fsOp = new FsRead(
          this.fd,
          this.buffer,
          offset,
          length,
          this.position + offset,
          callback
        ).read();
      }
      moveRight(length, callback, shift) {
        this.checkOp();
        if (shift) {
          this.buffer.copy(this.buffer, 0, shift);
        } else {
          shift = 0;
        }
        this.position += shift;
        this.fsOp = new FsRead(
          this.fd,
          this.buffer,
          this.buffer.length - shift,
          shift,
          this.position + this.buffer.length - shift,
          callback
        ).read();
      }
    };
    var EntryDataReaderStream = class extends stream.Readable {
      constructor(fd, offset, length) {
        super();
        this.fd = fd;
        this.offset = offset;
        this.length = length;
        this.pos = 0;
        this.readCallback = this.readCallback.bind(this);
      }
      _read(n) {
        const buffer = Buffer.alloc(Math.min(n, this.length - this.pos));
        if (buffer.length) {
          fs.read(this.fd, buffer, 0, buffer.length, this.offset + this.pos, this.readCallback);
        } else {
          this.push(null);
        }
      }
      readCallback(err, bytesRead, buffer) {
        this.pos += bytesRead;
        if (err) {
          this.emit("error", err);
          this.push(null);
        } else if (!bytesRead) {
          this.push(null);
        } else {
          if (bytesRead !== buffer.length) {
            buffer = buffer.slice(0, bytesRead);
          }
          this.push(buffer);
        }
      }
    };
    var EntryVerifyStream = class extends stream.Transform {
      constructor(baseStm, crc, size) {
        super();
        this.verify = new CrcVerify(crc, size);
        baseStm.on("error", (e) => {
          this.emit("error", e);
        });
      }
      _transform(data, encoding, callback) {
        let err;
        try {
          this.verify.data(data);
        } catch (e) {
          err = e;
        }
        callback(err, data);
      }
    };
    var CrcVerify = class _CrcVerify {
      constructor(crc, size) {
        this.crc = crc;
        this.size = size;
        this.state = {
          crc: ~0,
          size: 0
        };
      }
      data(data) {
        const crcTable = _CrcVerify.getCrcTable();
        let crc = this.state.crc;
        let off = 0;
        let len = data.length;
        while (--len >= 0) {
          crc = crcTable[(crc ^ data[off++]) & 255] ^ crc >>> 8;
        }
        this.state.crc = crc;
        this.state.size += data.length;
        if (this.state.size >= this.size) {
          const buf = Buffer.alloc(4);
          buf.writeInt32LE(~this.state.crc & 4294967295, 0);
          crc = buf.readUInt32LE(0);
          if (crc !== this.crc) {
            throw new Error("Invalid CRC");
          }
          if (this.state.size !== this.size) {
            throw new Error("Invalid size");
          }
        }
      }
      static getCrcTable() {
        let crcTable = _CrcVerify.crcTable;
        if (!crcTable) {
          _CrcVerify.crcTable = crcTable = [];
          const b = Buffer.alloc(4);
          for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 8; --k >= 0; ) {
              if ((c & 1) !== 0) {
                c = 3988292384 ^ c >>> 1;
              } else {
                c = c >>> 1;
              }
            }
            if (c < 0) {
              b.writeInt32LE(c, 0);
              c = b.readUInt32LE(0);
            }
            crcTable[n] = c;
          }
        }
        return crcTable;
      }
    };
    function parseZipTime(timebytes, datebytes) {
      const timebits = toBits(timebytes, 16);
      const datebits = toBits(datebytes, 16);
      const mt = {
        h: parseInt(timebits.slice(0, 5).join(""), 2),
        m: parseInt(timebits.slice(5, 11).join(""), 2),
        s: parseInt(timebits.slice(11, 16).join(""), 2) * 2,
        Y: parseInt(datebits.slice(0, 7).join(""), 2) + 1980,
        M: parseInt(datebits.slice(7, 11).join(""), 2),
        D: parseInt(datebits.slice(11, 16).join(""), 2)
      };
      const dt_str = [mt.Y, mt.M, mt.D].join("-") + " " + [mt.h, mt.m, mt.s].join(":") + " GMT+0";
      return new Date(dt_str).getTime();
    }
    function toBits(dec, size) {
      let b = (dec >>> 0).toString(2);
      while (b.length < size) {
        b = "0" + b;
      }
      return b.split("");
    }
    function readUInt64LE(buffer, offset) {
      return buffer.readUInt32LE(offset + 4) * 4294967296 + buffer.readUInt32LE(offset);
    }
    module2.exports = StreamZip;
  }
});

// src/lock-vault.tsx
var lock_vault_exports = {};
__export(lock_vault_exports, {
  default: () => lock_vault_default
});
module.exports = __toCommonJS(lock_vault_exports);
var import_api9 = require("@raycast/api");

// src/api/bitwarden.ts
var import_api7 = require("@raycast/api");

// node_modules/execa/index.js
var import_node_buffer = require("node:buffer");
var import_node_path2 = __toESM(require("node:path"), 1);
var import_node_child_process = __toESM(require("node:child_process"), 1);
var import_node_process2 = __toESM(require("node:process"), 1);
var import_cross_spawn = __toESM(require_cross_spawn(), 1);

// node_modules/strip-final-newline/index.js
function stripFinalNewline(input) {
  const LF = typeof input === "string" ? "\n" : "\n".charCodeAt();
  const CR = typeof input === "string" ? "\r" : "\r".charCodeAt();
  if (input[input.length - 1] === LF) {
    input = input.slice(0, -1);
  }
  if (input[input.length - 1] === CR) {
    input = input.slice(0, -1);
  }
  return input;
}

// node_modules/npm-run-path/index.js
var import_node_process = __toESM(require("node:process"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var import_node_url = __toESM(require("node:url"), 1);

// node_modules/npm-run-path/node_modules/path-key/index.js
function pathKey(options = {}) {
  const {
    env = process.env,
    platform: platform2 = process.platform
  } = options;
  if (platform2 !== "win32") {
    return "PATH";
  }
  return Object.keys(env).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
}

// node_modules/npm-run-path/index.js
function npmRunPath(options = {}) {
  const {
    cwd = import_node_process.default.cwd(),
    path: path_ = import_node_process.default.env[pathKey()],
    execPath = import_node_process.default.execPath
  } = options;
  let previous;
  const cwdString = cwd instanceof URL ? import_node_url.default.fileURLToPath(cwd) : cwd;
  let cwdPath = import_node_path.default.resolve(cwdString);
  const result = [];
  while (previous !== cwdPath) {
    result.push(import_node_path.default.join(cwdPath, "node_modules/.bin"));
    previous = cwdPath;
    cwdPath = import_node_path.default.resolve(cwdPath, "..");
  }
  result.push(import_node_path.default.resolve(cwdString, execPath, ".."));
  return [...result, path_].join(import_node_path.default.delimiter);
}
function npmRunPathEnv({ env = import_node_process.default.env, ...options } = {}) {
  env = { ...env };
  const path3 = pathKey({ env });
  options.path = env[path3];
  env[path3] = npmRunPath(options);
  return env;
}

// node_modules/mimic-fn/index.js
var copyProperty = (to, from, property, ignoreNonConfigurable) => {
  if (property === "length" || property === "prototype") {
    return;
  }
  if (property === "arguments" || property === "caller") {
    return;
  }
  const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
  const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);
  if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
    return;
  }
  Object.defineProperty(to, property, fromDescriptor);
};
var canCopyProperty = function(toDescriptor, fromDescriptor) {
  return toDescriptor === void 0 || toDescriptor.configurable || toDescriptor.writable === fromDescriptor.writable && toDescriptor.enumerable === fromDescriptor.enumerable && toDescriptor.configurable === fromDescriptor.configurable && (toDescriptor.writable || toDescriptor.value === fromDescriptor.value);
};
var changePrototype = (to, from) => {
  const fromPrototype = Object.getPrototypeOf(from);
  if (fromPrototype === Object.getPrototypeOf(to)) {
    return;
  }
  Object.setPrototypeOf(to, fromPrototype);
};
var wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/
${fromBody}`;
var toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, "toString");
var toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name");
var changeToString = (to, from, name) => {
  const withName = name === "" ? "" : `with ${name.trim()}() `;
  const newToString = wrappedToString.bind(null, withName, from.toString());
  Object.defineProperty(newToString, "name", toStringName);
  Object.defineProperty(to, "toString", { ...toStringDescriptor, value: newToString });
};
function mimicFunction(to, from, { ignoreNonConfigurable = false } = {}) {
  const { name } = to;
  for (const property of Reflect.ownKeys(from)) {
    copyProperty(to, from, property, ignoreNonConfigurable);
  }
  changePrototype(to, from);
  changeToString(to, from, name);
  return to;
}

// node_modules/onetime/index.js
var calledFunctions = /* @__PURE__ */ new WeakMap();
var onetime = (function_, options = {}) => {
  if (typeof function_ !== "function") {
    throw new TypeError("Expected a function");
  }
  let returnValue;
  let callCount = 0;
  const functionName = function_.displayName || function_.name || "<anonymous>";
  const onetime2 = function(...arguments_) {
    calledFunctions.set(onetime2, ++callCount);
    if (callCount === 1) {
      returnValue = function_.apply(this, arguments_);
      function_ = null;
    } else if (options.throw === true) {
      throw new Error(`Function \`${functionName}\` can only be called once`);
    }
    return returnValue;
  };
  mimicFunction(onetime2, function_);
  calledFunctions.set(onetime2, callCount);
  return onetime2;
};
onetime.callCount = (function_) => {
  if (!calledFunctions.has(function_)) {
    throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
  }
  return calledFunctions.get(function_);
};
var onetime_default = onetime;

// node_modules/human-signals/build/src/main.js
var import_node_os2 = require("node:os");

// node_modules/human-signals/build/src/realtime.js
var getRealtimeSignals = function() {
  const length = SIGRTMAX - SIGRTMIN + 1;
  return Array.from({ length }, getRealtimeSignal);
};
var getRealtimeSignal = function(value, index) {
  return {
    name: `SIGRT${index + 1}`,
    number: SIGRTMIN + index,
    action: "terminate",
    description: "Application-specific signal (realtime)",
    standard: "posix"
  };
};
var SIGRTMIN = 34;
var SIGRTMAX = 64;

// node_modules/human-signals/build/src/signals.js
var import_node_os = require("node:os");

// node_modules/human-signals/build/src/core.js
var SIGNALS = [
  {
    name: "SIGHUP",
    number: 1,
    action: "terminate",
    description: "Terminal closed",
    standard: "posix"
  },
  {
    name: "SIGINT",
    number: 2,
    action: "terminate",
    description: "User interruption with CTRL-C",
    standard: "ansi"
  },
  {
    name: "SIGQUIT",
    number: 3,
    action: "core",
    description: "User interruption with CTRL-\\",
    standard: "posix"
  },
  {
    name: "SIGILL",
    number: 4,
    action: "core",
    description: "Invalid machine instruction",
    standard: "ansi"
  },
  {
    name: "SIGTRAP",
    number: 5,
    action: "core",
    description: "Debugger breakpoint",
    standard: "posix"
  },
  {
    name: "SIGABRT",
    number: 6,
    action: "core",
    description: "Aborted",
    standard: "ansi"
  },
  {
    name: "SIGIOT",
    number: 6,
    action: "core",
    description: "Aborted",
    standard: "bsd"
  },
  {
    name: "SIGBUS",
    number: 7,
    action: "core",
    description: "Bus error due to misaligned, non-existing address or paging error",
    standard: "bsd"
  },
  {
    name: "SIGEMT",
    number: 7,
    action: "terminate",
    description: "Command should be emulated but is not implemented",
    standard: "other"
  },
  {
    name: "SIGFPE",
    number: 8,
    action: "core",
    description: "Floating point arithmetic error",
    standard: "ansi"
  },
  {
    name: "SIGKILL",
    number: 9,
    action: "terminate",
    description: "Forced termination",
    standard: "posix",
    forced: true
  },
  {
    name: "SIGUSR1",
    number: 10,
    action: "terminate",
    description: "Application-specific signal",
    standard: "posix"
  },
  {
    name: "SIGSEGV",
    number: 11,
    action: "core",
    description: "Segmentation fault",
    standard: "ansi"
  },
  {
    name: "SIGUSR2",
    number: 12,
    action: "terminate",
    description: "Application-specific signal",
    standard: "posix"
  },
  {
    name: "SIGPIPE",
    number: 13,
    action: "terminate",
    description: "Broken pipe or socket",
    standard: "posix"
  },
  {
    name: "SIGALRM",
    number: 14,
    action: "terminate",
    description: "Timeout or timer",
    standard: "posix"
  },
  {
    name: "SIGTERM",
    number: 15,
    action: "terminate",
    description: "Termination",
    standard: "ansi"
  },
  {
    name: "SIGSTKFLT",
    number: 16,
    action: "terminate",
    description: "Stack is empty or overflowed",
    standard: "other"
  },
  {
    name: "SIGCHLD",
    number: 17,
    action: "ignore",
    description: "Child process terminated, paused or unpaused",
    standard: "posix"
  },
  {
    name: "SIGCLD",
    number: 17,
    action: "ignore",
    description: "Child process terminated, paused or unpaused",
    standard: "other"
  },
  {
    name: "SIGCONT",
    number: 18,
    action: "unpause",
    description: "Unpaused",
    standard: "posix",
    forced: true
  },
  {
    name: "SIGSTOP",
    number: 19,
    action: "pause",
    description: "Paused",
    standard: "posix",
    forced: true
  },
  {
    name: "SIGTSTP",
    number: 20,
    action: "pause",
    description: 'Paused using CTRL-Z or "suspend"',
    standard: "posix"
  },
  {
    name: "SIGTTIN",
    number: 21,
    action: "pause",
    description: "Background process cannot read terminal input",
    standard: "posix"
  },
  {
    name: "SIGBREAK",
    number: 21,
    action: "terminate",
    description: "User interruption with CTRL-BREAK",
    standard: "other"
  },
  {
    name: "SIGTTOU",
    number: 22,
    action: "pause",
    description: "Background process cannot write to terminal output",
    standard: "posix"
  },
  {
    name: "SIGURG",
    number: 23,
    action: "ignore",
    description: "Socket received out-of-band data",
    standard: "bsd"
  },
  {
    name: "SIGXCPU",
    number: 24,
    action: "core",
    description: "Process timed out",
    standard: "bsd"
  },
  {
    name: "SIGXFSZ",
    number: 25,
    action: "core",
    description: "File too big",
    standard: "bsd"
  },
  {
    name: "SIGVTALRM",
    number: 26,
    action: "terminate",
    description: "Timeout or timer",
    standard: "bsd"
  },
  {
    name: "SIGPROF",
    number: 27,
    action: "terminate",
    description: "Timeout or timer",
    standard: "bsd"
  },
  {
    name: "SIGWINCH",
    number: 28,
    action: "ignore",
    description: "Terminal window size changed",
    standard: "bsd"
  },
  {
    name: "SIGIO",
    number: 29,
    action: "terminate",
    description: "I/O is available",
    standard: "other"
  },
  {
    name: "SIGPOLL",
    number: 29,
    action: "terminate",
    description: "Watched event",
    standard: "other"
  },
  {
    name: "SIGINFO",
    number: 29,
    action: "ignore",
    description: "Request for process information",
    standard: "other"
  },
  {
    name: "SIGPWR",
    number: 30,
    action: "terminate",
    description: "Device running out of power",
    standard: "systemv"
  },
  {
    name: "SIGSYS",
    number: 31,
    action: "core",
    description: "Invalid system call",
    standard: "other"
  },
  {
    name: "SIGUNUSED",
    number: 31,
    action: "terminate",
    description: "Invalid system call",
    standard: "other"
  }
];

// node_modules/human-signals/build/src/signals.js
var getSignals = function() {
  const realtimeSignals = getRealtimeSignals();
  const signals = [...SIGNALS, ...realtimeSignals].map(normalizeSignal);
  return signals;
};
var normalizeSignal = function({
  name,
  number: defaultNumber,
  description,
  action,
  forced = false,
  standard
}) {
  const {
    signals: { [name]: constantSignal }
  } = import_node_os.constants;
  const supported = constantSignal !== void 0;
  const number = supported ? constantSignal : defaultNumber;
  return { name, number, description, supported, action, forced, standard };
};

// node_modules/human-signals/build/src/main.js
var getSignalsByName = function() {
  const signals = getSignals();
  return Object.fromEntries(signals.map(getSignalByName));
};
var getSignalByName = function({
  name,
  number,
  description,
  supported,
  action,
  forced,
  standard
}) {
  return [
    name,
    { name, number, description, supported, action, forced, standard }
  ];
};
var signalsByName = getSignalsByName();
var getSignalsByNumber = function() {
  const signals = getSignals();
  const length = SIGRTMAX + 1;
  const signalsA = Array.from({ length }, (value, number) => getSignalByNumber(number, signals));
  return Object.assign({}, ...signalsA);
};
var getSignalByNumber = function(number, signals) {
  const signal = findSignalByNumber(number, signals);
  if (signal === void 0) {
    return {};
  }
  const { name, description, supported, action, forced, standard } = signal;
  return {
    [number]: {
      name,
      number,
      description,
      supported,
      action,
      forced,
      standard
    }
  };
};
var findSignalByNumber = function(number, signals) {
  const signal = signals.find(({ name }) => import_node_os2.constants.signals[name] === number);
  if (signal !== void 0) {
    return signal;
  }
  return signals.find((signalA) => signalA.number === number);
};
var signalsByNumber = getSignalsByNumber();

// node_modules/execa/lib/error.js
var getErrorPrefix = ({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled }) => {
  if (timedOut) {
    return `timed out after ${timeout} milliseconds`;
  }
  if (isCanceled) {
    return "was canceled";
  }
  if (errorCode !== void 0) {
    return `failed with ${errorCode}`;
  }
  if (signal !== void 0) {
    return `was killed with ${signal} (${signalDescription})`;
  }
  if (exitCode !== void 0) {
    return `failed with exit code ${exitCode}`;
  }
  return "failed";
};
var makeError = ({
  stdout,
  stderr,
  all,
  error,
  signal,
  exitCode,
  command,
  escapedCommand,
  timedOut,
  isCanceled,
  killed,
  parsed: { options: { timeout } }
}) => {
  exitCode = exitCode === null ? void 0 : exitCode;
  signal = signal === null ? void 0 : signal;
  const signalDescription = signal === void 0 ? void 0 : signalsByName[signal].description;
  const errorCode = error && error.code;
  const prefix = getErrorPrefix({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled });
  const execaMessage = `Command ${prefix}: ${command}`;
  const isError = Object.prototype.toString.call(error) === "[object Error]";
  const shortMessage = isError ? `${execaMessage}
${error.message}` : execaMessage;
  const message = [shortMessage, stderr, stdout].filter(Boolean).join("\n");
  if (isError) {
    error.originalMessage = error.message;
    error.message = message;
  } else {
    error = new Error(message);
  }
  error.shortMessage = shortMessage;
  error.command = command;
  error.escapedCommand = escapedCommand;
  error.exitCode = exitCode;
  error.signal = signal;
  error.signalDescription = signalDescription;
  error.stdout = stdout;
  error.stderr = stderr;
  if (all !== void 0) {
    error.all = all;
  }
  if ("bufferedData" in error) {
    delete error.bufferedData;
  }
  error.failed = true;
  error.timedOut = Boolean(timedOut);
  error.isCanceled = isCanceled;
  error.killed = killed && !timedOut;
  return error;
};

// node_modules/execa/lib/stdio.js
var aliases = ["stdin", "stdout", "stderr"];
var hasAlias = (options) => aliases.some((alias) => options[alias] !== void 0);
var normalizeStdio = (options) => {
  if (!options) {
    return;
  }
  const { stdio } = options;
  if (stdio === void 0) {
    return aliases.map((alias) => options[alias]);
  }
  if (hasAlias(options)) {
    throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${aliases.map((alias) => `\`${alias}\``).join(", ")}`);
  }
  if (typeof stdio === "string") {
    return stdio;
  }
  if (!Array.isArray(stdio)) {
    throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
  }
  const length = Math.max(stdio.length, aliases.length);
  return Array.from({ length }, (value, index) => stdio[index]);
};

// node_modules/execa/lib/kill.js
var import_node_os3 = __toESM(require("node:os"), 1);
var import_signal_exit = __toESM(require_signal_exit(), 1);
var DEFAULT_FORCE_KILL_TIMEOUT = 1e3 * 5;
var spawnedKill = (kill, signal = "SIGTERM", options = {}) => {
  const killResult = kill(signal);
  setKillTimeout(kill, signal, options, killResult);
  return killResult;
};
var setKillTimeout = (kill, signal, options, killResult) => {
  if (!shouldForceKill(signal, options, killResult)) {
    return;
  }
  const timeout = getForceKillAfterTimeout(options);
  const t = setTimeout(() => {
    kill("SIGKILL");
  }, timeout);
  if (t.unref) {
    t.unref();
  }
};
var shouldForceKill = (signal, { forceKillAfterTimeout }, killResult) => isSigterm(signal) && forceKillAfterTimeout !== false && killResult;
var isSigterm = (signal) => signal === import_node_os3.default.constants.signals.SIGTERM || typeof signal === "string" && signal.toUpperCase() === "SIGTERM";
var getForceKillAfterTimeout = ({ forceKillAfterTimeout = true }) => {
  if (forceKillAfterTimeout === true) {
    return DEFAULT_FORCE_KILL_TIMEOUT;
  }
  if (!Number.isFinite(forceKillAfterTimeout) || forceKillAfterTimeout < 0) {
    throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${forceKillAfterTimeout}\` (${typeof forceKillAfterTimeout})`);
  }
  return forceKillAfterTimeout;
};
var spawnedCancel = (spawned, context) => {
  const killResult = spawned.kill();
  if (killResult) {
    context.isCanceled = true;
  }
};
var timeoutKill = (spawned, signal, reject) => {
  spawned.kill(signal);
  reject(Object.assign(new Error("Timed out"), { timedOut: true, signal }));
};
var setupTimeout = (spawned, { timeout, killSignal = "SIGTERM" }, spawnedPromise) => {
  if (timeout === 0 || timeout === void 0) {
    return spawnedPromise;
  }
  let timeoutId;
  const timeoutPromise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      timeoutKill(spawned, killSignal, reject);
    }, timeout);
  });
  const safeSpawnedPromise = spawnedPromise.finally(() => {
    clearTimeout(timeoutId);
  });
  return Promise.race([timeoutPromise, safeSpawnedPromise]);
};
var validateTimeout = ({ timeout }) => {
  if (timeout !== void 0 && (!Number.isFinite(timeout) || timeout < 0)) {
    throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
  }
};
var setExitHandler = async (spawned, { cleanup, detached }, timedPromise) => {
  if (!cleanup || detached) {
    return timedPromise;
  }
  const removeExitHandler = (0, import_signal_exit.default)(() => {
    spawned.kill();
  });
  return timedPromise.finally(() => {
    removeExitHandler();
  });
};

// node_modules/is-stream/index.js
function isStream(stream) {
  return stream !== null && typeof stream === "object" && typeof stream.pipe === "function";
}

// node_modules/execa/lib/stream.js
var import_get_stream = __toESM(require_get_stream(), 1);
var import_merge_stream = __toESM(require_merge_stream(), 1);
var handleInput = (spawned, input) => {
  if (input === void 0) {
    return;
  }
  if (isStream(input)) {
    input.pipe(spawned.stdin);
  } else {
    spawned.stdin.end(input);
  }
};
var makeAllStream = (spawned, { all }) => {
  if (!all || !spawned.stdout && !spawned.stderr) {
    return;
  }
  const mixed = (0, import_merge_stream.default)();
  if (spawned.stdout) {
    mixed.add(spawned.stdout);
  }
  if (spawned.stderr) {
    mixed.add(spawned.stderr);
  }
  return mixed;
};
var getBufferedData = async (stream, streamPromise) => {
  if (!stream || streamPromise === void 0) {
    return;
  }
  stream.destroy();
  try {
    return await streamPromise;
  } catch (error) {
    return error.bufferedData;
  }
};
var getStreamPromise = (stream, { encoding, buffer, maxBuffer }) => {
  if (!stream || !buffer) {
    return;
  }
  if (encoding) {
    return (0, import_get_stream.default)(stream, { encoding, maxBuffer });
  }
  return import_get_stream.default.buffer(stream, { maxBuffer });
};
var getSpawnedResult = async ({ stdout, stderr, all }, { encoding, buffer, maxBuffer }, processDone) => {
  const stdoutPromise = getStreamPromise(stdout, { encoding, buffer, maxBuffer });
  const stderrPromise = getStreamPromise(stderr, { encoding, buffer, maxBuffer });
  const allPromise = getStreamPromise(all, { encoding, buffer, maxBuffer: maxBuffer * 2 });
  try {
    return await Promise.all([processDone, stdoutPromise, stderrPromise, allPromise]);
  } catch (error) {
    return Promise.all([
      { error, signal: error.signal, timedOut: error.timedOut },
      getBufferedData(stdout, stdoutPromise),
      getBufferedData(stderr, stderrPromise),
      getBufferedData(all, allPromise)
    ]);
  }
};

// node_modules/execa/lib/promise.js
var nativePromisePrototype = (async () => {
})().constructor.prototype;
var descriptors = ["then", "catch", "finally"].map((property) => [
  property,
  Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)
]);
var mergePromise = (spawned, promise) => {
  for (const [property, descriptor] of descriptors) {
    const value = typeof promise === "function" ? (...args) => Reflect.apply(descriptor.value, promise(), args) : descriptor.value.bind(promise);
    Reflect.defineProperty(spawned, property, { ...descriptor, value });
  }
  return spawned;
};
var getSpawnedPromise = (spawned) => new Promise((resolve, reject) => {
  spawned.on("exit", (exitCode, signal) => {
    resolve({ exitCode, signal });
  });
  spawned.on("error", (error) => {
    reject(error);
  });
  if (spawned.stdin) {
    spawned.stdin.on("error", (error) => {
      reject(error);
    });
  }
});

// node_modules/execa/lib/command.js
var normalizeArgs = (file, args = []) => {
  if (!Array.isArray(args)) {
    return [file];
  }
  return [file, ...args];
};
var NO_ESCAPE_REGEXP = /^[\w.-]+$/;
var DOUBLE_QUOTES_REGEXP = /"/g;
var escapeArg = (arg) => {
  if (typeof arg !== "string" || NO_ESCAPE_REGEXP.test(arg)) {
    return arg;
  }
  return `"${arg.replace(DOUBLE_QUOTES_REGEXP, '\\"')}"`;
};
var joinCommand = (file, args) => normalizeArgs(file, args).join(" ");
var getEscapedCommand = (file, args) => normalizeArgs(file, args).map((arg) => escapeArg(arg)).join(" ");

// node_modules/execa/index.js
var DEFAULT_MAX_BUFFER = 1e3 * 1e3 * 100;
var getEnv = ({ env: envOption, extendEnv, preferLocal, localDir, execPath }) => {
  const env = extendEnv ? { ...import_node_process2.default.env, ...envOption } : envOption;
  if (preferLocal) {
    return npmRunPathEnv({ env, cwd: localDir, execPath });
  }
  return env;
};
var handleArguments = (file, args, options = {}) => {
  const parsed = import_cross_spawn.default._parse(file, args, options);
  file = parsed.command;
  args = parsed.args;
  options = parsed.options;
  options = {
    maxBuffer: DEFAULT_MAX_BUFFER,
    buffer: true,
    stripFinalNewline: true,
    extendEnv: true,
    preferLocal: false,
    localDir: options.cwd || import_node_process2.default.cwd(),
    execPath: import_node_process2.default.execPath,
    encoding: "utf8",
    reject: true,
    cleanup: true,
    all: false,
    windowsHide: true,
    ...options
  };
  options.env = getEnv(options);
  options.stdio = normalizeStdio(options);
  if (import_node_process2.default.platform === "win32" && import_node_path2.default.basename(file, ".exe") === "cmd") {
    args.unshift("/q");
  }
  return { file, args, options, parsed };
};
var handleOutput = (options, value, error) => {
  if (typeof value !== "string" && !import_node_buffer.Buffer.isBuffer(value)) {
    return error === void 0 ? void 0 : "";
  }
  if (options.stripFinalNewline) {
    return stripFinalNewline(value);
  }
  return value;
};
function execa(file, args, options) {
  const parsed = handleArguments(file, args, options);
  const command = joinCommand(file, args);
  const escapedCommand = getEscapedCommand(file, args);
  validateTimeout(parsed.options);
  let spawned;
  try {
    spawned = import_node_child_process.default.spawn(parsed.file, parsed.args, parsed.options);
  } catch (error) {
    const dummySpawned = new import_node_child_process.default.ChildProcess();
    const errorPromise = Promise.reject(makeError({
      error,
      stdout: "",
      stderr: "",
      all: "",
      command,
      escapedCommand,
      parsed,
      timedOut: false,
      isCanceled: false,
      killed: false
    }));
    return mergePromise(dummySpawned, errorPromise);
  }
  const spawnedPromise = getSpawnedPromise(spawned);
  const timedPromise = setupTimeout(spawned, parsed.options, spawnedPromise);
  const processDone = setExitHandler(spawned, parsed.options, timedPromise);
  const context = { isCanceled: false };
  spawned.kill = spawnedKill.bind(null, spawned.kill.bind(spawned));
  spawned.cancel = spawnedCancel.bind(null, spawned, context);
  const handlePromise = async () => {
    const [{ error, exitCode, signal, timedOut }, stdoutResult, stderrResult, allResult] = await getSpawnedResult(spawned, parsed.options, processDone);
    const stdout = handleOutput(parsed.options, stdoutResult);
    const stderr = handleOutput(parsed.options, stderrResult);
    const all = handleOutput(parsed.options, allResult);
    if (error || exitCode !== 0 || signal !== null) {
      const returnedError = makeError({
        error,
        exitCode,
        signal,
        stdout,
        stderr,
        all,
        command,
        escapedCommand,
        parsed,
        timedOut,
        isCanceled: context.isCanceled || (parsed.options.signal ? parsed.options.signal.aborted : false),
        killed: spawned.killed
      });
      if (!parsed.options.reject) {
        return returnedError;
      }
      throw returnedError;
    }
    return {
      command,
      escapedCommand,
      exitCode: 0,
      stdout,
      stderr,
      all,
      failed: false,
      timedOut: false,
      isCanceled: false,
      killed: false
    };
  };
  const handlePromiseOnce = onetime_default(handlePromise);
  handleInput(spawned, parsed.options.input);
  spawned.all = makeAllStream(spawned, parsed.options);
  return mergePromise(spawned, handlePromiseOnce);
}

// src/api/bitwarden.ts
var import_fs5 = require("fs");

// src/constants/general.ts
var import_api = require("@raycast/api");
var DEFAULT_SERVER_URL = "https://bitwarden.com";
var LOCAL_STORAGE_KEY = {
  PASSWORD_OPTIONS: "bw-generate-password-options",
  PASSWORD_ONE_TIME_WARNING: "bw-generate-password-warning-accepted",
  SESSION_TOKEN: "sessionToken",
  REPROMPT_HASH: "sessionRepromptHash",
  SERVER_URL: "cliServer",
  LAST_ACTIVITY_TIME: "lastActivityTime",
  VAULT_LOCK_REASON: "vaultLockReason",
  VAULT_FAVORITE_ORDER: "vaultFavoriteOrder",
  VAULT_LAST_STATUS: "lastVaultStatus"
};
var VAULT_LOCK_MESSAGES = {
  TIMEOUT: "Vault timed out due to inactivity",
  MANUAL: "Manually locked by the user",
  SYSTEM_LOCK: "Screen was locked",
  SYSTEM_SLEEP: "System went to sleep",
  CLI_UPDATED: "Bitwarden has been updated. Please login again."
};
var CACHE_KEYS = {
  IV: "iv",
  VAULT: "vault",
  CURRENT_FOLDER_ID: "currentFolderId",
  SEND_TYPE_FILTER: "sendTypeFilter",
  CLI_VERSION: "cliVersion"
};
var ITEM_TYPE_TO_ICON_MAP = {
  [1 /* LOGIN */]: import_api.Icon.Globe,
  [3 /* CARD */]: import_api.Icon.CreditCard,
  [4 /* IDENTITY */]: import_api.Icon.Person,
  [2 /* NOTE */]: import_api.Icon.Document,
  [5 /* SSH_KEY */]: import_api.Icon.Key
};

// src/utils/passwords.ts
var import_api2 = require("@raycast/api");
function getPasswordGeneratingArgs(options) {
  return Object.entries(options).flatMap(([arg, value]) => value ? [`--${arg}`, value] : []);
}

// src/utils/preferences.ts
var import_api3 = require("@raycast/api");

// src/constants/preferences.ts
var VAULT_TIMEOUT_OPTIONS = {
  IMMEDIATELY: "0",
  ONE_MINUTE: "60000",
  FIVE_MINUTES: "300000",
  FIFTEEN_MINUTES: "900000",
  THIRTY_MINUTES: "1800000",
  ONE_HOUR: "3600000",
  FOUR_HOURS: "14400000",
  EIGHT_HOURS: "28800000",
  ONE_DAY: "86400000",
  NEVER: "-1",
  SYSTEM_LOCK: "-2",
  SYSTEM_SLEEP: "-3"
};
var VAULT_TIMEOUT = Object.entries(VAULT_TIMEOUT_OPTIONS).reduce((acc, [key, value]) => {
  acc[key] = parseInt(value);
  return acc;
}, {});

// src/constants/labels.ts
var VAULT_TIMEOUT_MS_TO_LABEL = {
  [VAULT_TIMEOUT.IMMEDIATELY]: "Immediately",
  [VAULT_TIMEOUT.ONE_MINUTE]: "1 Minute",
  [VAULT_TIMEOUT.FIVE_MINUTES]: "5 Minutes",
  [VAULT_TIMEOUT.FIFTEEN_MINUTES]: "15 Minutes",
  [VAULT_TIMEOUT.THIRTY_MINUTES]: "30 Minutes",
  [VAULT_TIMEOUT.ONE_HOUR]: "1 Hour",
  [VAULT_TIMEOUT.FOUR_HOURS]: "4 Hours",
  [VAULT_TIMEOUT.EIGHT_HOURS]: "8 Hours",
  [VAULT_TIMEOUT.ONE_DAY]: "1 Day"
};
var ITEM_TYPE_TO_LABEL = {
  [1 /* LOGIN */]: "Login",
  [3 /* CARD */]: "Card",
  [4 /* IDENTITY */]: "Identity",
  [2 /* NOTE */]: "Secure Note",
  [5 /* SSH_KEY */]: "SSH Key"
};

// src/utils/preferences.ts
function getServerUrlPreference() {
  const { serverUrl } = (0, import_api3.getPreferenceValues)();
  return !serverUrl || serverUrl === "bitwarden.com" || serverUrl === "https://bitwarden.com" ? void 0 : serverUrl;
}

// src/utils/errors.ts
var ManuallyThrownError = class extends Error {
  constructor(message, stack) {
    super(message);
    this.stack = stack;
  }
};
var DisplayableError = class extends ManuallyThrownError {
  constructor(message, stack) {
    super(message, stack);
  }
};
var InstalledCLINotFoundError = class extends DisplayableError {
  constructor(message, stack) {
    super(message ?? "Bitwarden CLI not found", stack);
    this.name = "InstalledCLINotFoundError";
    this.stack = stack;
  }
};
var VaultIsLockedError = class extends DisplayableError {
  constructor(message, stack) {
    super(message ?? "Vault is locked", stack);
    this.name = "VaultIsLockedError";
  }
};
var NotLoggedInError = class extends ManuallyThrownError {
  constructor(message, stack) {
    super(message ?? "Not logged in", stack);
    this.name = "NotLoggedInError";
  }
};
var EnsureCliBinError = class extends DisplayableError {
  constructor(message, stack) {
    super(message ?? "Failed do download Bitwarden CLI", stack);
    this.name = "EnsureCliBinError";
  }
};
var PremiumFeatureError = class extends ManuallyThrownError {
  constructor(message, stack) {
    super(message ?? "Premium status is required to use this feature", stack);
    this.name = "PremiumFeatureError";
  }
};
var SendNeedsPasswordError = class extends ManuallyThrownError {
  constructor(message, stack) {
    super(message ?? "This Send has a is protected by a password", stack);
    this.name = "SendNeedsPasswordError";
  }
};
var SendInvalidPasswordError = class extends ManuallyThrownError {
  constructor(message, stack) {
    super(message ?? "The password you entered is invalid", stack);
    this.name = "SendInvalidPasswordError";
  }
};
function tryExec(fn, fallbackValue) {
  try {
    return fn();
  } catch {
    return fallbackValue;
  }
}
var getErrorString = (error) => {
  if (!error) return void 0;
  if (typeof error === "string") return error;
  if (error instanceof Error) {
    const { message, name } = error;
    if (error.stack) return error.stack;
    return `${name}: ${message}`;
  }
  return String(error);
};

// src/api/bitwarden.ts
var import_path2 = require("path");
var import_promises2 = require("fs/promises");

// src/utils/fs.ts
var import_fs = require("fs");
var import_promises = require("fs/promises");
var import_path = require("path");
var import_node_stream_zip = __toESM(require_node_stream_zip());
function waitForFileAvailable(path3) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (!(0, import_fs.existsSync)(path3)) return;
      const stats = (0, import_fs.statSync)(path3);
      if (stats.isFile()) {
        clearInterval(interval);
        resolve();
      }
    }, 300);
    setTimeout(() => {
      clearInterval(interval);
      reject(new Error(`File ${path3} not found.`));
    }, 5e3);
  });
}
async function decompressFile(filePath, targetPath) {
  const zip = new import_node_stream_zip.default.async({ file: filePath });
  if (!(0, import_fs.existsSync)(targetPath)) (0, import_fs.mkdirSync)(targetPath, { recursive: true });
  await zip.extract(null, targetPath);
  await zip.close();
}
async function removeFilesThatStartWith(startingWith, path3) {
  let removedAtLeastOne = false;
  try {
    const files = await (0, import_promises.readdir)(path3);
    for await (const file of files) {
      if (!file.startsWith(startingWith)) continue;
      await tryExec(async () => {
        await (0, import_promises.unlink)((0, import_path.join)(path3, file));
        removedAtLeastOne = true;
      });
    }
  } catch {
    return false;
  }
  return removedAtLeastOne;
}
function unlinkAllSync(...paths) {
  for (const path3 of paths) {
    tryExec(() => (0, import_fs.unlinkSync)(path3));
  }
}

// src/utils/network.ts
var import_fs3 = require("fs");
var import_http = __toESM(require("http"));
var import_https = __toESM(require("https"));

// src/utils/development.ts
var import_api4 = require("@raycast/api");
var import_api5 = require("@raycast/api");
var _exceptions = {
  logs: /* @__PURE__ */ new Map(),
  set: (message, error) => {
    capturedExceptions.logs.set(/* @__PURE__ */ new Date(), { message, error });
  },
  clear: () => capturedExceptions.logs.clear(),
  toString: () => {
    let str = "";
    capturedExceptions.logs.forEach((log, date) => {
      if (str.length > 0) str += "\n\n";
      str += `[${date.toISOString()}] ${log.message}`;
      if (log.error) str += `: ${getErrorString(log.error)}`;
    });
    return str;
  }
};
var capturedExceptions = Object.freeze(_exceptions);
var captureException = (description, error, options) => {
  const { captureToRaycast = false } = options ?? {};
  const desc = Array.isArray(description) ? description.filter(Boolean).join(" ") : description || "Captured exception";
  capturedExceptions.set(desc, error);
  if (import_api4.environment.isDevelopment) {
    console.error(desc, error);
  } else if (captureToRaycast) {
    (0, import_api5.captureException)(error);
  }
};

// src/utils/crypto.ts
var import_fs2 = require("fs");
var import_crypto = require("crypto");
function getFileSha256(filePath) {
  try {
    return (0, import_crypto.createHash)("sha256").update((0, import_fs2.readFileSync)(filePath)).digest("hex");
  } catch (error) {
    return null;
  }
}

// src/utils/network.ts
function download(url2, path3, options) {
  const { onProgress, sha256 } = options ?? {};
  return new Promise((resolve, reject) => {
    const uri = new URL(url2);
    const protocol = uri.protocol === "https:" ? import_https.default : import_http.default;
    let redirectCount = 0;
    const request = protocol.get(uri.href, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400) {
        request.destroy();
        response.destroy();
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error(`Redirect response without location header`));
          return;
        }
        if (++redirectCount >= 10) {
          reject(new Error("Too many redirects"));
          return;
        }
        download(redirectUrl, path3, options).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Response status ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      const fileSize = parseInt(response.headers["content-length"] || "0", 10);
      if (fileSize === 0) {
        reject(new Error("Invalid file size"));
        return;
      }
      const fileStream = (0, import_fs3.createWriteStream)(path3, { autoClose: true });
      let downloadedBytes = 0;
      const cleanup = () => {
        request.destroy();
        response.destroy();
        fileStream.close();
      };
      const cleanupAndReject = (error) => {
        cleanup();
        reject(error);
      };
      response.on("data", (chunk) => {
        downloadedBytes += chunk.length;
        const percent = Math.floor(downloadedBytes / fileSize * 100);
        onProgress?.(percent);
      });
      fileStream.on("finish", async () => {
        try {
          await waitForFileAvailable(path3);
          if (sha256) await waitForHashToMatch(path3, sha256);
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          cleanup();
        }
      });
      fileStream.on("error", (error) => {
        captureException(`File stream error while downloading ${url2}`, error);
        (0, import_fs3.unlink)(path3, () => cleanupAndReject(error));
      });
      response.on("error", (error) => {
        captureException(`Response error while downloading ${url2}`, error);
        (0, import_fs3.unlink)(path3, () => cleanupAndReject(error));
      });
      request.on("error", (error) => {
        captureException(`Request error while downloading ${url2}`, error);
        (0, import_fs3.unlink)(path3, () => cleanupAndReject(error));
      });
      response.pipe(fileStream);
    });
  });
}
function waitForHashToMatch(path3, sha256) {
  return new Promise((resolve, reject) => {
    const fileSha = getFileSha256(path3);
    if (!fileSha) return reject(new Error(`Could not generate hash for file ${path3}.`));
    if (fileSha === sha256) return resolve();
    const interval = setInterval(() => {
      if (getFileSha256(path3) === sha256) {
        clearInterval(interval);
        resolve();
      }
    }, 1e3);
    setTimeout(() => {
      clearInterval(interval);
      reject(new Error(`Hash did not match, expected ${sha256.substring(0, 7)}, got ${fileSha.substring(0, 7)}.`));
    }, 5e3);
  });
}

// src/api/bitwarden.helpers.ts
function prepareSendPayload(template, values) {
  return {
    ...template,
    ...values,
    file: values.file ? { ...template.file, ...values.file } : template.file,
    text: values.text ? { ...template.text, ...values.text } : template.text
  };
}

// src/utils/cache.ts
var import_api6 = require("@raycast/api");
var Cache = new import_api6.Cache({ namespace: "bw-cache" });

// src/utils/platform.ts
var platform = process.platform === "darwin" ? "macos" : "windows";

// src/api/bitwarden.ts
var { supportPath } = import_api7.environment;
var \u0394 = "4";
var BinDownloadLogger = (() => {
  const filePath = (0, import_path2.join)(supportPath, `bw-bin-download-error-${\u0394}.log`);
  return {
    logError: (error) => tryExec(() => (0, import_fs5.writeFileSync)(filePath, error?.message ?? "Unexpected error")),
    clearError: () => tryExec(() => (0, import_fs5.unlinkSync)(filePath)),
    hasError: () => tryExec(() => (0, import_fs5.existsSync)(filePath), false)
  };
})();
var cliInfo = {
  version: "2025.2.0",
  get sha256() {
    if (platform === "windows") return "33a131017ac9c99d721e430a86e929383314d3f91c9f2fbf413d872565654c18";
    return "fade51012a46011c016a2e5aee2f2e534c1ed078e49d1178a69e2889d2812a96";
  },
  downloadPage: "https://github.com/bitwarden/clients/releases",
  path: {
    get downloadedBin() {
      return (0, import_path2.join)(supportPath, cliInfo.binFilenameVersioned);
    },
    get installedBin() {
      if (platform === "windows") return "C:\\ProgramData\\chocolatey\\bin\\bw.exe";
      return process.arch === "arm64" ? "/opt/homebrew/bin/bw" : "/usr/local/bin/bw";
    },
    get bin() {
      return !BinDownloadLogger.hasError() ? this.downloadedBin : this.installedBin;
    }
  },
  get binFilename() {
    return platform === "windows" ? "bw.exe" : "bw";
  },
  get binFilenameVersioned() {
    const name = `bw-${this.version}`;
    return platform === "windows" ? `${name}.exe` : `${name}`;
  },
  get downloadUrl() {
    let archSuffix = "";
    if (platform === "macos") {
      archSuffix = process.arch === "arm64" ? "-arm64" : "";
    }
    return `${this.downloadPage}/download/cli-v${this.version}/bw-${platform}${archSuffix}-${this.version}.zip`;
  }
};
var Bitwarden = class {
  constructor(toastInstance) {
    this.actionListeners = /* @__PURE__ */ new Map();
    this.preferences = (0, import_api7.getPreferenceValues)();
    this.wasCliUpdated = false;
    this.showToast = async (toastOpts) => {
      if (this.toastInstance) {
        const previousStateToastOpts = {
          message: this.toastInstance.message,
          title: this.toastInstance.title,
          primaryAction: this.toastInstance.primaryAction,
          secondaryAction: this.toastInstance.secondaryAction
        };
        if (toastOpts.style) this.toastInstance.style = toastOpts.style;
        this.toastInstance.message = toastOpts.message;
        this.toastInstance.title = toastOpts.title;
        this.toastInstance.primaryAction = toastOpts.primaryAction;
        this.toastInstance.secondaryAction = toastOpts.secondaryAction;
        await this.toastInstance.show();
        return Object.assign(this.toastInstance, {
          restore: async () => {
            await this.showToast(previousStateToastOpts);
          }
        });
      } else {
        const toast = await (0, import_api7.showToast)(toastOpts);
        return Object.assign(toast, { restore: () => toast.hide() });
      }
    };
    const { cliPath: cliPathPreference, clientId, clientSecret, serverCertsPath } = this.preferences;
    const serverUrl = getServerUrlPreference();
    this.toastInstance = toastInstance;
    this.cliPath = cliPathPreference || cliInfo.path.bin;
    this.env = {
      BITWARDENCLI_APPDATA_DIR: supportPath,
      BW_CLIENTSECRET: clientSecret.trim(),
      BW_CLIENTID: clientId.trim(),
      PATH: (0, import_path2.dirname)(process.execPath),
      ...serverUrl && serverCertsPath ? { NODE_EXTRA_CA_CERTS: serverCertsPath } : {}
    };
    this.initPromise = (async () => {
      await this.ensureCliBinary();
      void this.retrieveAndCacheCliVersion();
      await this.checkServerUrl(serverUrl);
    })();
  }
  async ensureCliBinary() {
    if (this.checkCliBinIsReady(this.cliPath)) return;
    if (this.cliPath === this.preferences.cliPath || this.cliPath === cliInfo.path.installedBin) {
      throw new InstalledCLINotFoundError(`Bitwarden CLI not found at ${this.cliPath}`);
    }
    if (BinDownloadLogger.hasError()) BinDownloadLogger.clearError();
    const hadOldBinaries = await removeFilesThatStartWith("bw-", supportPath);
    const toast = await this.showToast({
      title: `${hadOldBinaries ? "Updating" : "Initializing"} Bitwarden CLI`,
      style: import_api7.Toast.Style.Animated,
      primaryAction: { title: "Open Download Page", onAction: () => (0, import_api7.open)(cliInfo.downloadPage) }
    });
    const tmpFileName = "bw.zip";
    const zipPath = (0, import_path2.join)(supportPath, tmpFileName);
    try {
      try {
        toast.message = "Downloading...";
        await download(cliInfo.downloadUrl, zipPath, {
          onProgress: (percent) => toast.message = `Downloading ${percent}%`,
          sha256: cliInfo.sha256
        });
      } catch (downloadError) {
        toast.title = "Failed to download Bitwarden CLI";
        throw downloadError;
      }
      try {
        toast.message = "Extracting...";
        await decompressFile(zipPath, supportPath);
        const decompressedBinPath = (0, import_path2.join)(supportPath, cliInfo.binFilename);
        await (0, import_promises2.rename)(decompressedBinPath, this.cliPath).catch(() => null);
        await waitForFileAvailable(this.cliPath);
        await (0, import_promises2.chmod)(this.cliPath, "755");
        await (0, import_promises2.rm)(zipPath, { force: true });
        Cache.set(CACHE_KEYS.CLI_VERSION, cliInfo.version);
        this.wasCliUpdated = true;
      } catch (extractError) {
        toast.title = "Failed to extract Bitwarden CLI";
        throw extractError;
      }
      await toast.hide();
    } catch (error) {
      toast.message = error instanceof EnsureCliBinError ? error.message : "Please try again";
      toast.style = import_api7.Toast.Style.Failure;
      unlinkAllSync(zipPath, this.cliPath);
      if (!import_api7.environment.isDevelopment) BinDownloadLogger.logError(error);
      if (error instanceof Error) throw new EnsureCliBinError(error.message, error.stack);
      throw error;
    } finally {
      await toast.restore();
    }
  }
  async retrieveAndCacheCliVersion() {
    try {
      const { error, result } = await this.getVersion();
      if (!error) Cache.set(CACHE_KEYS.CLI_VERSION, result);
    } catch (error) {
      captureException("Failed to retrieve and cache cli version", error, { captureToRaycast: true });
    }
  }
  checkCliBinIsReady(filePath) {
    try {
      if (!(0, import_fs5.existsSync)(this.cliPath)) return false;
      (0, import_fs5.accessSync)(filePath, import_fs5.constants.X_OK);
      return true;
    } catch {
      (0, import_fs5.chmodSync)(filePath, "755");
      return true;
    }
  }
  setSessionToken(token) {
    this.env = {
      ...this.env,
      BW_SESSION: token
    };
  }
  clearSessionToken() {
    delete this.env.BW_SESSION;
  }
  withSession(token) {
    this.tempSessionToken = token;
    return this;
  }
  async initialize() {
    await this.initPromise;
    return this;
  }
  async checkServerUrl(serverUrl) {
    const storedServer = await import_api7.LocalStorage.getItem(LOCAL_STORAGE_KEY.SERVER_URL);
    if (!serverUrl || storedServer === serverUrl) return;
    const toast = await this.showToast({
      style: import_api7.Toast.Style.Animated,
      title: "Switching server...",
      message: "Bitwarden server preference changed"
    });
    try {
      try {
        await this.logout();
      } catch {
      }
      await this.exec(["config", "server", serverUrl || DEFAULT_SERVER_URL], { resetVaultTimeout: false });
      await import_api7.LocalStorage.setItem(LOCAL_STORAGE_KEY.SERVER_URL, serverUrl);
      toast.style = import_api7.Toast.Style.Success;
      toast.title = "Success";
      toast.message = "Bitwarden server changed";
    } catch (error) {
      toast.style = import_api7.Toast.Style.Failure;
      toast.title = "Failed to switch server";
      if (error instanceof Error) {
        toast.message = error.message;
      } else {
        toast.message = "Unknown error occurred";
      }
    } finally {
      await toast.restore();
    }
  }
  async exec(args, options) {
    const { abortController, input = "", resetVaultTimeout } = options ?? {};
    let env = this.env;
    if (this.tempSessionToken) {
      env = { ...env, BW_SESSION: this.tempSessionToken };
      this.tempSessionToken = void 0;
    }
    const result = await execa(this.cliPath, args, { input, env, signal: abortController?.signal });
    if (this.isPromptWaitingForMasterPassword(result)) {
      await this.lock();
      throw new VaultIsLockedError();
    }
    if (resetVaultTimeout) {
      await import_api7.LocalStorage.setItem(LOCAL_STORAGE_KEY.LAST_ACTIVITY_TIME, (/* @__PURE__ */ new Date()).toISOString());
    }
    return result;
  }
  async getVersion() {
    try {
      const { stdout: result } = await this.exec(["--version"], { resetVaultTimeout: false });
      return { result };
    } catch (execError) {
      captureException("Failed to get cli version", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async login() {
    try {
      await this.exec(["login", "--apikey"], { resetVaultTimeout: true });
      await this.saveLastVaultStatus("login", "unlocked");
      await this.callActionListeners("login");
      return { result: void 0 };
    } catch (execError) {
      captureException("Failed to login", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async logout(options) {
    const { reason, immediate = false } = options ?? {};
    try {
      if (immediate) await this.handlePostLogout(reason);
      await this.exec(["logout"], { resetVaultTimeout: false });
      await this.saveLastVaultStatus("logout", "unauthenticated");
      if (!immediate) await this.handlePostLogout(reason);
      return { result: void 0 };
    } catch (execError) {
      captureException("Failed to logout", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async lock(options) {
    const { reason, checkVaultStatus = false, immediate = false } = options ?? {};
    try {
      if (immediate) await this.callActionListeners("lock", reason);
      if (checkVaultStatus) {
        const { error, result } = await this.status();
        if (error) throw error;
        if (result.status === "unauthenticated") return { error: new NotLoggedInError("Not logged in") };
      }
      await this.exec(["lock"], { resetVaultTimeout: false });
      await this.saveLastVaultStatus("lock", "locked");
      if (!immediate) await this.callActionListeners("lock", reason);
      return { result: void 0 };
    } catch (execError) {
      captureException("Failed to lock vault", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async unlock(password) {
    try {
      const { stdout: sessionToken } = await this.exec(["unlock", password, "--raw"], { resetVaultTimeout: true });
      this.setSessionToken(sessionToken);
      await this.saveLastVaultStatus("unlock", "unlocked");
      await this.callActionListeners("unlock", password, sessionToken);
      return { result: sessionToken };
    } catch (execError) {
      captureException("Failed to unlock vault", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async sync() {
    try {
      await this.exec(["sync"], { resetVaultTimeout: true });
      return { result: void 0 };
    } catch (execError) {
      captureException("Failed to sync vault", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async getItem(id) {
    try {
      const { stdout } = await this.exec(["get", "item", id], { resetVaultTimeout: true });
      return { result: JSON.parse(stdout) };
    } catch (execError) {
      captureException("Failed to get item", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async listItems() {
    try {
      const { stdout } = await this.exec(["list", "items"], { resetVaultTimeout: true });
      const items = JSON.parse(stdout);
      return { result: items.filter((item) => !!item.name) };
    } catch (execError) {
      captureException("Failed to list items", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async createLoginItem(options) {
    try {
      const { error: itemTemplateError, result: itemTemplate } = await this.getTemplate("item");
      if (itemTemplateError) throw itemTemplateError;
      const { error: loginTemplateError, result: loginTemplate } = await this.getTemplate("item.login");
      if (loginTemplateError) throw loginTemplateError;
      itemTemplate.name = options.name;
      itemTemplate.type = 1 /* LOGIN */;
      itemTemplate.folderId = options.folderId || null;
      itemTemplate.login = loginTemplate;
      itemTemplate.notes = null;
      loginTemplate.username = options.username || null;
      loginTemplate.password = options.password;
      loginTemplate.totp = null;
      loginTemplate.fido2Credentials = void 0;
      if (options.uri) {
        loginTemplate.uris = [{ match: null, uri: options.uri }];
      }
      const { result: encodedItem, error: encodeError } = await this.encode(JSON.stringify(itemTemplate));
      if (encodeError) throw encodeError;
      const { stdout } = await this.exec(["create", "item", encodedItem], { resetVaultTimeout: true });
      return { result: JSON.parse(stdout) };
    } catch (execError) {
      captureException("Failed to create login item", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async listFolders() {
    try {
      const { stdout } = await this.exec(["list", "folders"], { resetVaultTimeout: true });
      return { result: JSON.parse(stdout) };
    } catch (execError) {
      captureException("Failed to list folder", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async createFolder(name) {
    try {
      const { error, result: folder } = await this.getTemplate("folder");
      if (error) throw error;
      folder.name = name;
      const { result: encodedFolder, error: encodeError } = await this.encode(JSON.stringify(folder));
      if (encodeError) throw encodeError;
      await this.exec(["create", "folder", encodedFolder], { resetVaultTimeout: true });
      return { result: void 0 };
    } catch (execError) {
      captureException("Failed to create folder", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async getTotp(id) {
    try {
      const { stdout } = await this.exec(["get", "totp", id], { resetVaultTimeout: true });
      return { result: stdout };
    } catch (execError) {
      captureException("Failed to get TOTP", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async status() {
    try {
      const { stdout } = await this.exec(["status"], { resetVaultTimeout: false });
      return { result: JSON.parse(stdout) };
    } catch (execError) {
      captureException("Failed to get status", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async checkLockStatus() {
    try {
      await this.exec(["unlock", "--check"], { resetVaultTimeout: false });
      await this.saveLastVaultStatus("checkLockStatus", "unlocked");
      return "unlocked";
    } catch (error) {
      captureException("Failed to check lock status", error);
      const errorMessage = error.stderr;
      if (errorMessage === "Vault is locked.") {
        await this.saveLastVaultStatus("checkLockStatus", "locked");
        return "locked";
      }
      await this.saveLastVaultStatus("checkLockStatus", "unauthenticated");
      return "unauthenticated";
    }
  }
  async getTemplate(type) {
    try {
      const { stdout } = await this.exec(["get", "template", type], { resetVaultTimeout: true });
      return { result: JSON.parse(stdout) };
    } catch (execError) {
      captureException("Failed to get template", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async encode(input) {
    try {
      const { stdout } = await this.exec(["encode"], { input, resetVaultTimeout: false });
      return { result: stdout };
    } catch (execError) {
      captureException("Failed to encode", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async generatePassword(options, abortController) {
    const args = options ? getPasswordGeneratingArgs(options) : [];
    const { stdout } = await this.exec(["generate", ...args], { abortController, resetVaultTimeout: false });
    return stdout;
  }
  async listSends() {
    try {
      const { stdout } = await this.exec(["send", "list"], { resetVaultTimeout: true });
      return { result: JSON.parse(stdout) };
    } catch (execError) {
      captureException("Failed to list sends", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async createSend(values) {
    try {
      const { error: templateError, result: template } = await this.getTemplate(
        values.type === 0 /* Text */ ? "send.text" : "send.file"
      );
      if (templateError) throw templateError;
      const payload = prepareSendPayload(template, values);
      const { result: encodedPayload, error: encodeError } = await this.encode(JSON.stringify(payload));
      if (encodeError) throw encodeError;
      const { stdout } = await this.exec(["send", "create", encodedPayload], { resetVaultTimeout: true });
      return { result: JSON.parse(stdout) };
    } catch (execError) {
      captureException("Failed to create send", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async editSend(values) {
    try {
      const { result: encodedPayload, error: encodeError } = await this.encode(JSON.stringify(values));
      if (encodeError) throw encodeError;
      const { stdout } = await this.exec(["send", "edit", encodedPayload], { resetVaultTimeout: true });
      return { result: JSON.parse(stdout) };
    } catch (execError) {
      captureException("Failed to delete send", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async deleteSend(id) {
    try {
      await this.exec(["send", "delete", id], { resetVaultTimeout: true });
      return { result: void 0 };
    } catch (execError) {
      captureException("Failed to delete send", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async removeSendPassword(id) {
    try {
      await this.exec(["send", "remove-password", id], { resetVaultTimeout: true });
      return { result: void 0 };
    } catch (execError) {
      captureException("Failed to remove send password", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async receiveSendInfo(url2, options) {
    try {
      const { stdout, stderr } = await this.exec(["send", "receive", url2, "--obj"], {
        resetVaultTimeout: true,
        input: options?.password
      });
      if (!stdout && /Invalid password/i.test(stderr)) return { error: new SendInvalidPasswordError() };
      if (!stdout && /Send password/i.test(stderr)) return { error: new SendNeedsPasswordError() };
      return { result: JSON.parse(stdout) };
    } catch (execError) {
      const errorMessage = execError.stderr;
      if (/Invalid password/gi.test(errorMessage)) return { error: new SendInvalidPasswordError() };
      if (/Send password/gi.test(errorMessage)) return { error: new SendNeedsPasswordError() };
      captureException("Failed to receive send obj", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  async receiveSend(url2, options) {
    try {
      const { savePath, password } = options ?? {};
      const args = ["send", "receive", url2];
      if (savePath) args.push("--output", savePath);
      const { stdout } = await this.exec(args, { resetVaultTimeout: true, input: password });
      return { result: stdout };
    } catch (execError) {
      captureException("Failed to receive send", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }
  // utils below
  async saveLastVaultStatus(callName, status) {
    await import_api7.LocalStorage.setItem(LOCAL_STORAGE_KEY.VAULT_LAST_STATUS, status);
  }
  async getLastSavedVaultStatus() {
    const lastSavedStatus = await import_api7.LocalStorage.getItem(LOCAL_STORAGE_KEY.VAULT_LAST_STATUS);
    if (!lastSavedStatus) {
      const vaultStatus = await this.status();
      return vaultStatus.result?.status;
    }
    return lastSavedStatus;
  }
  isPromptWaitingForMasterPassword(result) {
    return !!(result.stderr && result.stderr.includes("Master password"));
  }
  async handlePostLogout(reason) {
    this.clearSessionToken();
    await this.callActionListeners("logout", reason);
  }
  async handleCommonErrors(error) {
    const errorMessage = error.stderr;
    if (!errorMessage) return {};
    if (/not logged in/i.test(errorMessage)) {
      await this.handlePostLogout();
      return { error: new NotLoggedInError("Not logged in") };
    }
    if (/Premium status/i.test(errorMessage)) {
      return { error: new PremiumFeatureError() };
    }
    return {};
  }
  setActionListener(action, listener) {
    const listeners = this.actionListeners.get(action);
    if (listeners && listeners.size > 0) {
      listeners.add(listener);
    } else {
      this.actionListeners.set(action, /* @__PURE__ */ new Set([listener]));
    }
    return this;
  }
  removeActionListener(action, listener) {
    const listeners = this.actionListeners.get(action);
    if (listeners && listeners.size > 0) {
      listeners.delete(listener);
    }
    return this;
  }
  async callActionListeners(action, ...args) {
    const listeners = this.actionListeners.get(action);
    if (listeners && listeners.size > 0) {
      for (const listener of listeners) {
        try {
          await listener?.(...args);
        } catch (error) {
          captureException(`Error calling bitwarden action listener for ${action}`, error);
        }
      }
    }
  }
};

// src/context/session/utils.ts
var import_api8 = require("@raycast/api");
var import_child_process = require("child_process");
var import_util = require("util");
var exec = (0, import_util.promisify)(import_child_process.exec);
var SessionStorage = {
  getSavedSession: () => {
    return Promise.all([
      import_api8.LocalStorage.getItem(LOCAL_STORAGE_KEY.SESSION_TOKEN),
      import_api8.LocalStorage.getItem(LOCAL_STORAGE_KEY.REPROMPT_HASH),
      import_api8.LocalStorage.getItem(LOCAL_STORAGE_KEY.LAST_ACTIVITY_TIME),
      import_api8.LocalStorage.getItem(LOCAL_STORAGE_KEY.VAULT_LAST_STATUS)
    ]);
  },
  clearSession: async () => {
    await Promise.all([
      import_api8.LocalStorage.removeItem(LOCAL_STORAGE_KEY.SESSION_TOKEN),
      import_api8.LocalStorage.removeItem(LOCAL_STORAGE_KEY.REPROMPT_HASH)
    ]);
  },
  saveSession: async (token, passwordHash) => {
    await Promise.all([
      import_api8.LocalStorage.setItem(LOCAL_STORAGE_KEY.SESSION_TOKEN, token),
      import_api8.LocalStorage.setItem(LOCAL_STORAGE_KEY.REPROMPT_HASH, passwordHash)
    ]);
  },
  logoutClearSession: async () => {
    await Promise.all([
      import_api8.LocalStorage.removeItem(LOCAL_STORAGE_KEY.SESSION_TOKEN),
      import_api8.LocalStorage.removeItem(LOCAL_STORAGE_KEY.REPROMPT_HASH),
      import_api8.LocalStorage.removeItem(LOCAL_STORAGE_KEY.LAST_ACTIVITY_TIME)
    ]);
  }
};

// src/lock-vault.tsx
async function lockVaultCommand() {
  const toast = await (0, import_api9.showToast)(import_api9.Toast.Style.Animated, "Locking vault...", "Please wait");
  try {
    const [token] = await SessionStorage.getSavedSession();
    if (!token) {
      toast.style = import_api9.Toast.Style.Failure;
      toast.title = "No session found";
      toast.message = "Already locked or not logged in";
      return;
    }
    const bitwarden = await new Bitwarden(toast).initialize();
    await bitwarden.withSession(token).lock({ reason: VAULT_LOCK_MESSAGES.MANUAL });
  } catch (error) {
    await (0, import_api9.showToast)(import_api9.Toast.Style.Failure, "Failed to lock vault");
  }
  try {
    await SessionStorage.clearSession();
    toast.style = import_api9.Toast.Style.Success;
    toast.title = "Vault successfully locked";
    toast.message = void 0;
  } catch (error) {
    await (0, import_api9.showToast)(import_api9.Toast.Style.Failure, "Failed to lock vault");
  }
}
var lock_vault_default = lockVaultCommand;
/*! Bundled license information:

node-stream-zip/node_stream_zip.js:
  (**
   * @license node-stream-zip | (c) 2020 Antelle | https://github.com/antelle/node-stream-zip/blob/master/LICENSE
   * Portions copyright https://github.com/cthackers/adm-zip | https://raw.githubusercontent.com/cthackers/adm-zip/master/LICENSE
   *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL3dpbmRvd3MuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL21vZGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy93aGljaC93aGljaC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi91dGlsL3Jlc29sdmVDb21tYW5kLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9jcm9zcy1zcGF3bi9saWIvdXRpbC9lc2NhcGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctcmVnZXgvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctY29tbWFuZC9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL3V0aWwvcmVhZFNoZWJhbmcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi9wYXJzZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL2Vub2VudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NpZ25hbC1leGl0L3NpZ25hbHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NpZ25hbC1leGl0L2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9nZXQtc3RyZWFtL2J1ZmZlci1zdHJlYW0uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2dldC1zdHJlYW0vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL21lcmdlLXN0cmVhbS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvbm9kZS1zdHJlYW0temlwL25vZGVfc3RyZWFtX3ppcC5qcyIsICIuLi9zcmMvbG9jay12YXVsdC50c3giLCAiLi4vc3JjL2FwaS9iaXR3YXJkZW4udHMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9zdHJpcC1maW5hbC1uZXdsaW5lL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ucG0tcnVuLXBhdGgvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL25wbS1ydW4tcGF0aC9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL21pbWljLWZuL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9vbmV0aW1lL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9tYWluLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9yZWFsdGltZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvaHVtYW4tc2lnbmFscy9idWlsZC9zcmMvc2lnbmFscy5qcyIsICIuLi9ub2RlX21vZHVsZXMvaHVtYW4tc2lnbmFscy9idWlsZC9zcmMvY29yZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvbGliL2Vycm9yLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9leGVjYS9saWIvc3RkaW8uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9raWxsLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9pcy1zdHJlYW0vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9zdHJlYW0uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9wcm9taXNlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9leGVjYS9saWIvY29tbWFuZC5qcyIsICIuLi9zcmMvY29uc3RhbnRzL2dlbmVyYWwudHMiLCAiLi4vc3JjL3V0aWxzL3Bhc3N3b3Jkcy50cyIsICIuLi9zcmMvdXRpbHMvcHJlZmVyZW5jZXMudHMiLCAiLi4vc3JjL2NvbnN0YW50cy9wcmVmZXJlbmNlcy50cyIsICIuLi9zcmMvY29uc3RhbnRzL2xhYmVscy50cyIsICIuLi9zcmMvdXRpbHMvZXJyb3JzLnRzIiwgIi4uL3NyYy91dGlscy9mcy50cyIsICIuLi9zcmMvdXRpbHMvbmV0d29yay50cyIsICIuLi9zcmMvdXRpbHMvZGV2ZWxvcG1lbnQudHMiLCAiLi4vc3JjL3V0aWxzL2NyeXB0by50cyIsICIuLi9zcmMvYXBpL2JpdHdhcmRlbi5oZWxwZXJzLnRzIiwgIi4uL3NyYy91dGlscy9jYWNoZS50cyIsICIuLi9zcmMvdXRpbHMvcGxhdGZvcm0udHMiLCAiLi4vc3JjL2NvbnRleHQvc2Vzc2lvbi91dGlscy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsibW9kdWxlLmV4cG9ydHMgPSBpc2V4ZVxuaXNleGUuc3luYyA9IHN5bmNcblxudmFyIGZzID0gcmVxdWlyZSgnZnMnKVxuXG5mdW5jdGlvbiBjaGVja1BhdGhFeHQgKHBhdGgsIG9wdGlvbnMpIHtcbiAgdmFyIHBhdGhleHQgPSBvcHRpb25zLnBhdGhFeHQgIT09IHVuZGVmaW5lZCA/XG4gICAgb3B0aW9ucy5wYXRoRXh0IDogcHJvY2Vzcy5lbnYuUEFUSEVYVFxuXG4gIGlmICghcGF0aGV4dCkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBwYXRoZXh0ID0gcGF0aGV4dC5zcGxpdCgnOycpXG4gIGlmIChwYXRoZXh0LmluZGV4T2YoJycpICE9PSAtMSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoZXh0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHAgPSBwYXRoZXh0W2ldLnRvTG93ZXJDYXNlKClcbiAgICBpZiAocCAmJiBwYXRoLnN1YnN0cigtcC5sZW5ndGgpLnRvTG93ZXJDYXNlKCkgPT09IHApIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5mdW5jdGlvbiBjaGVja1N0YXQgKHN0YXQsIHBhdGgsIG9wdGlvbnMpIHtcbiAgaWYgKCFzdGF0LmlzU3ltYm9saWNMaW5rKCkgJiYgIXN0YXQuaXNGaWxlKCkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gY2hlY2tQYXRoRXh0KHBhdGgsIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGlzZXhlIChwYXRoLCBvcHRpb25zLCBjYikge1xuICBmcy5zdGF0KHBhdGgsIGZ1bmN0aW9uIChlciwgc3RhdCkge1xuICAgIGNiKGVyLCBlciA/IGZhbHNlIDogY2hlY2tTdGF0KHN0YXQsIHBhdGgsIG9wdGlvbnMpKVxuICB9KVxufVxuXG5mdW5jdGlvbiBzeW5jIChwYXRoLCBvcHRpb25zKSB7XG4gIHJldHVybiBjaGVja1N0YXQoZnMuc3RhdFN5bmMocGF0aCksIHBhdGgsIG9wdGlvbnMpXG59XG4iLCAibW9kdWxlLmV4cG9ydHMgPSBpc2V4ZVxuaXNleGUuc3luYyA9IHN5bmNcblxudmFyIGZzID0gcmVxdWlyZSgnZnMnKVxuXG5mdW5jdGlvbiBpc2V4ZSAocGF0aCwgb3B0aW9ucywgY2IpIHtcbiAgZnMuc3RhdChwYXRoLCBmdW5jdGlvbiAoZXIsIHN0YXQpIHtcbiAgICBjYihlciwgZXIgPyBmYWxzZSA6IGNoZWNrU3RhdChzdGF0LCBvcHRpb25zKSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gc3luYyAocGF0aCwgb3B0aW9ucykge1xuICByZXR1cm4gY2hlY2tTdGF0KGZzLnN0YXRTeW5jKHBhdGgpLCBvcHRpb25zKVxufVxuXG5mdW5jdGlvbiBjaGVja1N0YXQgKHN0YXQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHN0YXQuaXNGaWxlKCkgJiYgY2hlY2tNb2RlKHN0YXQsIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGNoZWNrTW9kZSAoc3RhdCwgb3B0aW9ucykge1xuICB2YXIgbW9kID0gc3RhdC5tb2RlXG4gIHZhciB1aWQgPSBzdGF0LnVpZFxuICB2YXIgZ2lkID0gc3RhdC5naWRcblxuICB2YXIgbXlVaWQgPSBvcHRpb25zLnVpZCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLnVpZCA6IHByb2Nlc3MuZ2V0dWlkICYmIHByb2Nlc3MuZ2V0dWlkKClcbiAgdmFyIG15R2lkID0gb3B0aW9ucy5naWQgIT09IHVuZGVmaW5lZCA/XG4gICAgb3B0aW9ucy5naWQgOiBwcm9jZXNzLmdldGdpZCAmJiBwcm9jZXNzLmdldGdpZCgpXG5cbiAgdmFyIHUgPSBwYXJzZUludCgnMTAwJywgOClcbiAgdmFyIGcgPSBwYXJzZUludCgnMDEwJywgOClcbiAgdmFyIG8gPSBwYXJzZUludCgnMDAxJywgOClcbiAgdmFyIHVnID0gdSB8IGdcblxuICB2YXIgcmV0ID0gKG1vZCAmIG8pIHx8XG4gICAgKG1vZCAmIGcpICYmIGdpZCA9PT0gbXlHaWQgfHxcbiAgICAobW9kICYgdSkgJiYgdWlkID09PSBteVVpZCB8fFxuICAgIChtb2QgJiB1ZykgJiYgbXlVaWQgPT09IDBcblxuICByZXR1cm4gcmV0XG59XG4iLCAidmFyIGZzID0gcmVxdWlyZSgnZnMnKVxudmFyIGNvcmVcbmlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInIHx8IGdsb2JhbC5URVNUSU5HX1dJTkRPV1MpIHtcbiAgY29yZSA9IHJlcXVpcmUoJy4vd2luZG93cy5qcycpXG59IGVsc2Uge1xuICBjb3JlID0gcmVxdWlyZSgnLi9tb2RlLmpzJylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc2V4ZVxuaXNleGUuc3luYyA9IHN5bmNcblxuZnVuY3Rpb24gaXNleGUgKHBhdGgsIG9wdGlvbnMsIGNiKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gb3B0aW9uc1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG5cbiAgaWYgKCFjYikge1xuICAgIGlmICh0eXBlb2YgUHJvbWlzZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FsbGJhY2sgbm90IHByb3ZpZGVkJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaXNleGUocGF0aCwgb3B0aW9ucyB8fCB7fSwgZnVuY3Rpb24gKGVyLCBpcykge1xuICAgICAgICBpZiAoZXIpIHtcbiAgICAgICAgICByZWplY3QoZXIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShpcylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgY29yZShwYXRoLCBvcHRpb25zIHx8IHt9LCBmdW5jdGlvbiAoZXIsIGlzKSB7XG4gICAgLy8gaWdub3JlIEVBQ0NFUyBiZWNhdXNlIHRoYXQganVzdCBtZWFucyB3ZSBhcmVuJ3QgYWxsb3dlZCB0byBydW4gaXRcbiAgICBpZiAoZXIpIHtcbiAgICAgIGlmIChlci5jb2RlID09PSAnRUFDQ0VTJyB8fCBvcHRpb25zICYmIG9wdGlvbnMuaWdub3JlRXJyb3JzKSB7XG4gICAgICAgIGVyID0gbnVsbFxuICAgICAgICBpcyA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIGNiKGVyLCBpcylcbiAgfSlcbn1cblxuZnVuY3Rpb24gc3luYyAocGF0aCwgb3B0aW9ucykge1xuICAvLyBteSBraW5nZG9tIGZvciBhIGZpbHRlcmVkIGNhdGNoXG4gIHRyeSB7XG4gICAgcmV0dXJuIGNvcmUuc3luYyhwYXRoLCBvcHRpb25zIHx8IHt9KVxuICB9IGNhdGNoIChlcikge1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuaWdub3JlRXJyb3JzIHx8IGVyLmNvZGUgPT09ICdFQUNDRVMnKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJcbiAgICB9XG4gIH1cbn1cbiIsICJjb25zdCBpc1dpbmRvd3MgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInIHx8XG4gICAgcHJvY2Vzcy5lbnYuT1NUWVBFID09PSAnY3lnd2luJyB8fFxuICAgIHByb2Nlc3MuZW52Lk9TVFlQRSA9PT0gJ21zeXMnXG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmNvbnN0IENPTE9OID0gaXNXaW5kb3dzID8gJzsnIDogJzonXG5jb25zdCBpc2V4ZSA9IHJlcXVpcmUoJ2lzZXhlJylcblxuY29uc3QgZ2V0Tm90Rm91bmRFcnJvciA9IChjbWQpID0+XG4gIE9iamVjdC5hc3NpZ24obmV3IEVycm9yKGBub3QgZm91bmQ6ICR7Y21kfWApLCB7IGNvZGU6ICdFTk9FTlQnIH0pXG5cbmNvbnN0IGdldFBhdGhJbmZvID0gKGNtZCwgb3B0KSA9PiB7XG4gIGNvbnN0IGNvbG9uID0gb3B0LmNvbG9uIHx8IENPTE9OXG5cbiAgLy8gSWYgaXQgaGFzIGEgc2xhc2gsIHRoZW4gd2UgZG9uJ3QgYm90aGVyIHNlYXJjaGluZyB0aGUgcGF0aGVudi5cbiAgLy8ganVzdCBjaGVjayB0aGUgZmlsZSBpdHNlbGYsIGFuZCB0aGF0J3MgaXQuXG4gIGNvbnN0IHBhdGhFbnYgPSBjbWQubWF0Y2goL1xcLy8pIHx8IGlzV2luZG93cyAmJiBjbWQubWF0Y2goL1xcXFwvKSA/IFsnJ11cbiAgICA6IChcbiAgICAgIFtcbiAgICAgICAgLy8gd2luZG93cyBhbHdheXMgY2hlY2tzIHRoZSBjd2QgZmlyc3RcbiAgICAgICAgLi4uKGlzV2luZG93cyA/IFtwcm9jZXNzLmN3ZCgpXSA6IFtdKSxcbiAgICAgICAgLi4uKG9wdC5wYXRoIHx8IHByb2Nlc3MuZW52LlBBVEggfHxcbiAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dDogdmVyeSB1bnVzdWFsICovICcnKS5zcGxpdChjb2xvbiksXG4gICAgICBdXG4gICAgKVxuICBjb25zdCBwYXRoRXh0RXhlID0gaXNXaW5kb3dzXG4gICAgPyBvcHQucGF0aEV4dCB8fCBwcm9jZXNzLmVudi5QQVRIRVhUIHx8ICcuRVhFOy5DTUQ7LkJBVDsuQ09NJ1xuICAgIDogJydcbiAgY29uc3QgcGF0aEV4dCA9IGlzV2luZG93cyA/IHBhdGhFeHRFeGUuc3BsaXQoY29sb24pIDogWycnXVxuXG4gIGlmIChpc1dpbmRvd3MpIHtcbiAgICBpZiAoY21kLmluZGV4T2YoJy4nKSAhPT0gLTEgJiYgcGF0aEV4dFswXSAhPT0gJycpXG4gICAgICBwYXRoRXh0LnVuc2hpZnQoJycpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBhdGhFbnYsXG4gICAgcGF0aEV4dCxcbiAgICBwYXRoRXh0RXhlLFxuICB9XG59XG5cbmNvbnN0IHdoaWNoID0gKGNtZCwgb3B0LCBjYikgPT4ge1xuICBpZiAodHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gb3B0XG4gICAgb3B0ID0ge31cbiAgfVxuICBpZiAoIW9wdClcbiAgICBvcHQgPSB7fVxuXG4gIGNvbnN0IHsgcGF0aEVudiwgcGF0aEV4dCwgcGF0aEV4dEV4ZSB9ID0gZ2V0UGF0aEluZm8oY21kLCBvcHQpXG4gIGNvbnN0IGZvdW5kID0gW11cblxuICBjb25zdCBzdGVwID0gaSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKGkgPT09IHBhdGhFbnYubGVuZ3RoKVxuICAgICAgcmV0dXJuIG9wdC5hbGwgJiYgZm91bmQubGVuZ3RoID8gcmVzb2x2ZShmb3VuZClcbiAgICAgICAgOiByZWplY3QoZ2V0Tm90Rm91bmRFcnJvcihjbWQpKVxuXG4gICAgY29uc3QgcHBSYXcgPSBwYXRoRW52W2ldXG4gICAgY29uc3QgcGF0aFBhcnQgPSAvXlwiLipcIiQvLnRlc3QocHBSYXcpID8gcHBSYXcuc2xpY2UoMSwgLTEpIDogcHBSYXdcblxuICAgIGNvbnN0IHBDbWQgPSBwYXRoLmpvaW4ocGF0aFBhcnQsIGNtZClcbiAgICBjb25zdCBwID0gIXBhdGhQYXJ0ICYmIC9eXFwuW1xcXFxcXC9dLy50ZXN0KGNtZCkgPyBjbWQuc2xpY2UoMCwgMikgKyBwQ21kXG4gICAgICA6IHBDbWRcblxuICAgIHJlc29sdmUoc3ViU3RlcChwLCBpLCAwKSlcbiAgfSlcblxuICBjb25zdCBzdWJTdGVwID0gKHAsIGksIGlpKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKGlpID09PSBwYXRoRXh0Lmxlbmd0aClcbiAgICAgIHJldHVybiByZXNvbHZlKHN0ZXAoaSArIDEpKVxuICAgIGNvbnN0IGV4dCA9IHBhdGhFeHRbaWldXG4gICAgaXNleGUocCArIGV4dCwgeyBwYXRoRXh0OiBwYXRoRXh0RXhlIH0sIChlciwgaXMpID0+IHtcbiAgICAgIGlmICghZXIgJiYgaXMpIHtcbiAgICAgICAgaWYgKG9wdC5hbGwpXG4gICAgICAgICAgZm91bmQucHVzaChwICsgZXh0KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUocCArIGV4dClcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlKHN1YlN0ZXAocCwgaSwgaWkgKyAxKSlcbiAgICB9KVxuICB9KVxuXG4gIHJldHVybiBjYiA/IHN0ZXAoMCkudGhlbihyZXMgPT4gY2IobnVsbCwgcmVzKSwgY2IpIDogc3RlcCgwKVxufVxuXG5jb25zdCB3aGljaFN5bmMgPSAoY21kLCBvcHQpID0+IHtcbiAgb3B0ID0gb3B0IHx8IHt9XG5cbiAgY29uc3QgeyBwYXRoRW52LCBwYXRoRXh0LCBwYXRoRXh0RXhlIH0gPSBnZXRQYXRoSW5mbyhjbWQsIG9wdClcbiAgY29uc3QgZm91bmQgPSBbXVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aEVudi5sZW5ndGg7IGkgKyspIHtcbiAgICBjb25zdCBwcFJhdyA9IHBhdGhFbnZbaV1cbiAgICBjb25zdCBwYXRoUGFydCA9IC9eXCIuKlwiJC8udGVzdChwcFJhdykgPyBwcFJhdy5zbGljZSgxLCAtMSkgOiBwcFJhd1xuXG4gICAgY29uc3QgcENtZCA9IHBhdGguam9pbihwYXRoUGFydCwgY21kKVxuICAgIGNvbnN0IHAgPSAhcGF0aFBhcnQgJiYgL15cXC5bXFxcXFxcL10vLnRlc3QoY21kKSA/IGNtZC5zbGljZSgwLCAyKSArIHBDbWRcbiAgICAgIDogcENtZFxuXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBwYXRoRXh0Lmxlbmd0aDsgaiArKykge1xuICAgICAgY29uc3QgY3VyID0gcCArIHBhdGhFeHRbal1cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGlzID0gaXNleGUuc3luYyhjdXIsIHsgcGF0aEV4dDogcGF0aEV4dEV4ZSB9KVxuICAgICAgICBpZiAoaXMpIHtcbiAgICAgICAgICBpZiAob3B0LmFsbClcbiAgICAgICAgICAgIGZvdW5kLnB1c2goY3VyKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBjdXJcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHt9XG4gICAgfVxuICB9XG5cbiAgaWYgKG9wdC5hbGwgJiYgZm91bmQubGVuZ3RoKVxuICAgIHJldHVybiBmb3VuZFxuXG4gIGlmIChvcHQubm90aHJvdylcbiAgICByZXR1cm4gbnVsbFxuXG4gIHRocm93IGdldE5vdEZvdW5kRXJyb3IoY21kKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdoaWNoXG53aGljaC5zeW5jID0gd2hpY2hTeW5jXG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoS2V5ID0gKG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRjb25zdCBlbnZpcm9ubWVudCA9IG9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52O1xuXHRjb25zdCBwbGF0Zm9ybSA9IG9wdGlvbnMucGxhdGZvcm0gfHwgcHJvY2Vzcy5wbGF0Zm9ybTtcblxuXHRpZiAocGxhdGZvcm0gIT09ICd3aW4zMicpIHtcblx0XHRyZXR1cm4gJ1BBVEgnO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKGVudmlyb25tZW50KS5yZXZlcnNlKCkuZmluZChrZXkgPT4ga2V5LnRvVXBwZXJDYXNlKCkgPT09ICdQQVRIJykgfHwgJ1BhdGgnO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXRoS2V5O1xuLy8gVE9ETzogUmVtb3ZlIHRoaXMgZm9yIHRoZSBuZXh0IG1ham9yIHJlbGVhc2Vcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBwYXRoS2V5O1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHdoaWNoID0gcmVxdWlyZSgnd2hpY2gnKTtcbmNvbnN0IGdldFBhdGhLZXkgPSByZXF1aXJlKCdwYXRoLWtleScpO1xuXG5mdW5jdGlvbiByZXNvbHZlQ29tbWFuZEF0dGVtcHQocGFyc2VkLCB3aXRob3V0UGF0aEV4dCkge1xuICAgIGNvbnN0IGVudiA9IHBhcnNlZC5vcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudjtcbiAgICBjb25zdCBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xuICAgIGNvbnN0IGhhc0N1c3RvbUN3ZCA9IHBhcnNlZC5vcHRpb25zLmN3ZCAhPSBudWxsO1xuICAgIC8vIFdvcmtlciB0aHJlYWRzIGRvIG5vdCBoYXZlIHByb2Nlc3MuY2hkaXIoKVxuICAgIGNvbnN0IHNob3VsZFN3aXRjaEN3ZCA9IGhhc0N1c3RvbUN3ZCAmJiBwcm9jZXNzLmNoZGlyICE9PSB1bmRlZmluZWQgJiYgIXByb2Nlc3MuY2hkaXIuZGlzYWJsZWQ7XG5cbiAgICAvLyBJZiBhIGN1c3RvbSBgY3dkYCB3YXMgc3BlY2lmaWVkLCB3ZSBuZWVkIHRvIGNoYW5nZSB0aGUgcHJvY2VzcyBjd2RcbiAgICAvLyBiZWNhdXNlIGB3aGljaGAgd2lsbCBkbyBzdGF0IGNhbGxzIGJ1dCBkb2VzIG5vdCBzdXBwb3J0IGEgY3VzdG9tIGN3ZFxuICAgIGlmIChzaG91bGRTd2l0Y2hDd2QpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb2Nlc3MuY2hkaXIocGFyc2VkLm9wdGlvbnMuY3dkKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAvKiBFbXB0eSAqL1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHJlc29sdmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZWQgPSB3aGljaC5zeW5jKHBhcnNlZC5jb21tYW5kLCB7XG4gICAgICAgICAgICBwYXRoOiBlbnZbZ2V0UGF0aEtleSh7IGVudiB9KV0sXG4gICAgICAgICAgICBwYXRoRXh0OiB3aXRob3V0UGF0aEV4dCA/IHBhdGguZGVsaW1pdGVyIDogdW5kZWZpbmVkLFxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8qIEVtcHR5ICovXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKHNob3VsZFN3aXRjaEN3ZCkge1xuICAgICAgICAgICAgcHJvY2Vzcy5jaGRpcihjd2QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2Ugc3VjY2Vzc2Z1bGx5IHJlc29sdmVkLCBlbnN1cmUgdGhhdCBhbiBhYnNvbHV0ZSBwYXRoIGlzIHJldHVybmVkXG4gICAgLy8gTm90ZSB0aGF0IHdoZW4gYSBjdXN0b20gYGN3ZGAgd2FzIHVzZWQsIHdlIG5lZWQgdG8gcmVzb2x2ZSB0byBhbiBhYnNvbHV0ZSBwYXRoIGJhc2VkIG9uIGl0XG4gICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICAgIHJlc29sdmVkID0gcGF0aC5yZXNvbHZlKGhhc0N1c3RvbUN3ZCA/IHBhcnNlZC5vcHRpb25zLmN3ZCA6ICcnLCByZXNvbHZlZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc29sdmVkO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlQ29tbWFuZChwYXJzZWQpIHtcbiAgICByZXR1cm4gcmVzb2x2ZUNvbW1hbmRBdHRlbXB0KHBhcnNlZCkgfHwgcmVzb2x2ZUNvbW1hbmRBdHRlbXB0KHBhcnNlZCwgdHJ1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzb2x2ZUNvbW1hbmQ7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG4vLyBTZWUgaHR0cDovL3d3dy5yb2J2YW5kZXJ3b3VkZS5jb20vZXNjYXBlY2hhcnMucGhwXG5jb25zdCBtZXRhQ2hhcnNSZWdFeHAgPSAvKFsoKVxcXVslIV5cImA8PiZ8OywgKj9dKS9nO1xuXG5mdW5jdGlvbiBlc2NhcGVDb21tYW5kKGFyZykge1xuICAgIC8vIEVzY2FwZSBtZXRhIGNoYXJzXG4gICAgYXJnID0gYXJnLnJlcGxhY2UobWV0YUNoYXJzUmVnRXhwLCAnXiQxJyk7XG5cbiAgICByZXR1cm4gYXJnO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVBcmd1bWVudChhcmcsIGRvdWJsZUVzY2FwZU1ldGFDaGFycykge1xuICAgIC8vIENvbnZlcnQgdG8gc3RyaW5nXG4gICAgYXJnID0gYCR7YXJnfWA7XG5cbiAgICAvLyBBbGdvcml0aG0gYmVsb3cgaXMgYmFzZWQgb24gaHR0cHM6Ly9xbnRtLm9yZy9jbWRcbiAgICAvLyBJdCdzIHNsaWdodGx5IGFsdGVyZWQgdG8gZGlzYWJsZSBKUyBiYWNrdHJhY2tpbmcgdG8gYXZvaWQgaGFuZ2luZyBvbiBzcGVjaWFsbHkgY3JhZnRlZCBpbnB1dFxuICAgIC8vIFBsZWFzZSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21veHlzdHVkaW8vbm9kZS1jcm9zcy1zcGF3bi9wdWxsLzE2MCBmb3IgbW9yZSBpbmZvcm1hdGlvblxuXG4gICAgLy8gU2VxdWVuY2Ugb2YgYmFja3NsYXNoZXMgZm9sbG93ZWQgYnkgYSBkb3VibGUgcXVvdGU6XG4gICAgLy8gZG91YmxlIHVwIGFsbCB0aGUgYmFja3NsYXNoZXMgYW5kIGVzY2FwZSB0aGUgZG91YmxlIHF1b3RlXG4gICAgYXJnID0gYXJnLnJlcGxhY2UoLyg/PShcXFxcKz8pPylcXDFcIi9nLCAnJDEkMVxcXFxcIicpO1xuXG4gICAgLy8gU2VxdWVuY2Ugb2YgYmFja3NsYXNoZXMgZm9sbG93ZWQgYnkgdGhlIGVuZCBvZiB0aGUgc3RyaW5nXG4gICAgLy8gKHdoaWNoIHdpbGwgYmVjb21lIGEgZG91YmxlIHF1b3RlIGxhdGVyKTpcbiAgICAvLyBkb3VibGUgdXAgYWxsIHRoZSBiYWNrc2xhc2hlc1xuICAgIGFyZyA9IGFyZy5yZXBsYWNlKC8oPz0oXFxcXCs/KT8pXFwxJC8sICckMSQxJyk7XG5cbiAgICAvLyBBbGwgb3RoZXIgYmFja3NsYXNoZXMgb2NjdXIgbGl0ZXJhbGx5XG5cbiAgICAvLyBRdW90ZSB0aGUgd2hvbGUgdGhpbmc6XG4gICAgYXJnID0gYFwiJHthcmd9XCJgO1xuXG4gICAgLy8gRXNjYXBlIG1ldGEgY2hhcnNcbiAgICBhcmcgPSBhcmcucmVwbGFjZShtZXRhQ2hhcnNSZWdFeHAsICdeJDEnKTtcblxuICAgIC8vIERvdWJsZSBlc2NhcGUgbWV0YSBjaGFycyBpZiBuZWNlc3NhcnlcbiAgICBpZiAoZG91YmxlRXNjYXBlTWV0YUNoYXJzKSB7XG4gICAgICAgIGFyZyA9IGFyZy5yZXBsYWNlKG1ldGFDaGFyc1JlZ0V4cCwgJ14kMScpO1xuICAgIH1cblxuICAgIHJldHVybiBhcmc7XG59XG5cbm1vZHVsZS5leHBvcnRzLmNvbW1hbmQgPSBlc2NhcGVDb21tYW5kO1xubW9kdWxlLmV4cG9ydHMuYXJndW1lbnQgPSBlc2NhcGVBcmd1bWVudDtcbiIsICIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IC9eIyEoLiopLztcbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCBzaGViYW5nUmVnZXggPSByZXF1aXJlKCdzaGViYW5nLXJlZ2V4Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKHN0cmluZyA9ICcnKSA9PiB7XG5cdGNvbnN0IG1hdGNoID0gc3RyaW5nLm1hdGNoKHNoZWJhbmdSZWdleCk7XG5cblx0aWYgKCFtYXRjaCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Y29uc3QgW3BhdGgsIGFyZ3VtZW50XSA9IG1hdGNoWzBdLnJlcGxhY2UoLyMhID8vLCAnJykuc3BsaXQoJyAnKTtcblx0Y29uc3QgYmluYXJ5ID0gcGF0aC5zcGxpdCgnLycpLnBvcCgpO1xuXG5cdGlmIChiaW5hcnkgPT09ICdlbnYnKSB7XG5cdFx0cmV0dXJuIGFyZ3VtZW50O1xuXHR9XG5cblx0cmV0dXJuIGFyZ3VtZW50ID8gYCR7YmluYXJ5fSAke2FyZ3VtZW50fWAgOiBiaW5hcnk7XG59O1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3Qgc2hlYmFuZ0NvbW1hbmQgPSByZXF1aXJlKCdzaGViYW5nLWNvbW1hbmQnKTtcblxuZnVuY3Rpb24gcmVhZFNoZWJhbmcoY29tbWFuZCkge1xuICAgIC8vIFJlYWQgdGhlIGZpcnN0IDE1MCBieXRlcyBmcm9tIHRoZSBmaWxlXG4gICAgY29uc3Qgc2l6ZSA9IDE1MDtcbiAgICBjb25zdCBidWZmZXIgPSBCdWZmZXIuYWxsb2Moc2l6ZSk7XG5cbiAgICBsZXQgZmQ7XG5cbiAgICB0cnkge1xuICAgICAgICBmZCA9IGZzLm9wZW5TeW5jKGNvbW1hbmQsICdyJyk7XG4gICAgICAgIGZzLnJlYWRTeW5jKGZkLCBidWZmZXIsIDAsIHNpemUsIDApO1xuICAgICAgICBmcy5jbG9zZVN5bmMoZmQpO1xuICAgIH0gY2F0Y2ggKGUpIHsgLyogRW1wdHkgKi8gfVxuXG4gICAgLy8gQXR0ZW1wdCB0byBleHRyYWN0IHNoZWJhbmcgKG51bGwgaXMgcmV0dXJuZWQgaWYgbm90IGEgc2hlYmFuZylcbiAgICByZXR1cm4gc2hlYmFuZ0NvbW1hbmQoYnVmZmVyLnRvU3RyaW5nKCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlYWRTaGViYW5nO1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHJlc29sdmVDb21tYW5kID0gcmVxdWlyZSgnLi91dGlsL3Jlc29sdmVDb21tYW5kJyk7XG5jb25zdCBlc2NhcGUgPSByZXF1aXJlKCcuL3V0aWwvZXNjYXBlJyk7XG5jb25zdCByZWFkU2hlYmFuZyA9IHJlcXVpcmUoJy4vdXRpbC9yZWFkU2hlYmFuZycpO1xuXG5jb25zdCBpc1dpbiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG5jb25zdCBpc0V4ZWN1dGFibGVSZWdFeHAgPSAvXFwuKD86Y29tfGV4ZSkkL2k7XG5jb25zdCBpc0NtZFNoaW1SZWdFeHAgPSAvbm9kZV9tb2R1bGVzW1xcXFwvXS5iaW5bXFxcXC9dW15cXFxcL10rXFwuY21kJC9pO1xuXG5mdW5jdGlvbiBkZXRlY3RTaGViYW5nKHBhcnNlZCkge1xuICAgIHBhcnNlZC5maWxlID0gcmVzb2x2ZUNvbW1hbmQocGFyc2VkKTtcblxuICAgIGNvbnN0IHNoZWJhbmcgPSBwYXJzZWQuZmlsZSAmJiByZWFkU2hlYmFuZyhwYXJzZWQuZmlsZSk7XG5cbiAgICBpZiAoc2hlYmFuZykge1xuICAgICAgICBwYXJzZWQuYXJncy51bnNoaWZ0KHBhcnNlZC5maWxlKTtcbiAgICAgICAgcGFyc2VkLmNvbW1hbmQgPSBzaGViYW5nO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlQ29tbWFuZChwYXJzZWQpO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJzZWQuZmlsZTtcbn1cblxuZnVuY3Rpb24gcGFyc2VOb25TaGVsbChwYXJzZWQpIHtcbiAgICBpZiAoIWlzV2luKSB7XG4gICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgfVxuXG4gICAgLy8gRGV0ZWN0ICYgYWRkIHN1cHBvcnQgZm9yIHNoZWJhbmdzXG4gICAgY29uc3QgY29tbWFuZEZpbGUgPSBkZXRlY3RTaGViYW5nKHBhcnNlZCk7XG5cbiAgICAvLyBXZSBkb24ndCBuZWVkIGEgc2hlbGwgaWYgdGhlIGNvbW1hbmQgZmlsZW5hbWUgaXMgYW4gZXhlY3V0YWJsZVxuICAgIGNvbnN0IG5lZWRzU2hlbGwgPSAhaXNFeGVjdXRhYmxlUmVnRXhwLnRlc3QoY29tbWFuZEZpbGUpO1xuXG4gICAgLy8gSWYgYSBzaGVsbCBpcyByZXF1aXJlZCwgdXNlIGNtZC5leGUgYW5kIHRha2UgY2FyZSBvZiBlc2NhcGluZyBldmVyeXRoaW5nIGNvcnJlY3RseVxuICAgIC8vIE5vdGUgdGhhdCBgZm9yY2VTaGVsbGAgaXMgYW4gaGlkZGVuIG9wdGlvbiB1c2VkIG9ubHkgaW4gdGVzdHNcbiAgICBpZiAocGFyc2VkLm9wdGlvbnMuZm9yY2VTaGVsbCB8fCBuZWVkc1NoZWxsKSB7XG4gICAgICAgIC8vIE5lZWQgdG8gZG91YmxlIGVzY2FwZSBtZXRhIGNoYXJzIGlmIHRoZSBjb21tYW5kIGlzIGEgY21kLXNoaW0gbG9jYXRlZCBpbiBgbm9kZV9tb2R1bGVzLy5iaW4vYFxuICAgICAgICAvLyBUaGUgY21kLXNoaW0gc2ltcGx5IGNhbGxzIGV4ZWN1dGUgdGhlIHBhY2thZ2UgYmluIGZpbGUgd2l0aCBOb2RlSlMsIHByb3h5aW5nIGFueSBhcmd1bWVudFxuICAgICAgICAvLyBCZWNhdXNlIHRoZSBlc2NhcGUgb2YgbWV0YWNoYXJzIHdpdGggXiBnZXRzIGludGVycHJldGVkIHdoZW4gdGhlIGNtZC5leGUgaXMgZmlyc3QgY2FsbGVkLFxuICAgICAgICAvLyB3ZSBuZWVkIHRvIGRvdWJsZSBlc2NhcGUgdGhlbVxuICAgICAgICBjb25zdCBuZWVkc0RvdWJsZUVzY2FwZU1ldGFDaGFycyA9IGlzQ21kU2hpbVJlZ0V4cC50ZXN0KGNvbW1hbmRGaWxlKTtcblxuICAgICAgICAvLyBOb3JtYWxpemUgcG9zaXggcGF0aHMgaW50byBPUyBjb21wYXRpYmxlIHBhdGhzIChlLmcuOiBmb28vYmFyIC0+IGZvb1xcYmFyKVxuICAgICAgICAvLyBUaGlzIGlzIG5lY2Vzc2FyeSBvdGhlcndpc2UgaXQgd2lsbCBhbHdheXMgZmFpbCB3aXRoIEVOT0VOVCBpbiB0aG9zZSBjYXNlc1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IHBhdGgubm9ybWFsaXplKHBhcnNlZC5jb21tYW5kKTtcblxuICAgICAgICAvLyBFc2NhcGUgY29tbWFuZCAmIGFyZ3VtZW50c1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IGVzY2FwZS5jb21tYW5kKHBhcnNlZC5jb21tYW5kKTtcbiAgICAgICAgcGFyc2VkLmFyZ3MgPSBwYXJzZWQuYXJncy5tYXAoKGFyZykgPT4gZXNjYXBlLmFyZ3VtZW50KGFyZywgbmVlZHNEb3VibGVFc2NhcGVNZXRhQ2hhcnMpKTtcblxuICAgICAgICBjb25zdCBzaGVsbENvbW1hbmQgPSBbcGFyc2VkLmNvbW1hbmRdLmNvbmNhdChwYXJzZWQuYXJncykuam9pbignICcpO1xuXG4gICAgICAgIHBhcnNlZC5hcmdzID0gWycvZCcsICcvcycsICcvYycsIGBcIiR7c2hlbGxDb21tYW5kfVwiYF07XG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gcHJvY2Vzcy5lbnYuY29tc3BlYyB8fCAnY21kLmV4ZSc7XG4gICAgICAgIHBhcnNlZC5vcHRpb25zLndpbmRvd3NWZXJiYXRpbUFyZ3VtZW50cyA9IHRydWU7IC8vIFRlbGwgbm9kZSdzIHNwYXduIHRoYXQgdGhlIGFyZ3VtZW50cyBhcmUgYWxyZWFkeSBlc2NhcGVkXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlZDtcbn1cblxuZnVuY3Rpb24gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucykge1xuICAgIC8vIE5vcm1hbGl6ZSBhcmd1bWVudHMsIHNpbWlsYXIgdG8gbm9kZWpzXG4gICAgaWYgKGFyZ3MgJiYgIUFycmF5LmlzQXJyYXkoYXJncykpIHtcbiAgICAgICAgb3B0aW9ucyA9IGFyZ3M7XG4gICAgICAgIGFyZ3MgPSBudWxsO1xuICAgIH1cblxuICAgIGFyZ3MgPSBhcmdzID8gYXJncy5zbGljZSgwKSA6IFtdOyAvLyBDbG9uZSBhcnJheSB0byBhdm9pZCBjaGFuZ2luZyB0aGUgb3JpZ2luYWxcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucyk7IC8vIENsb25lIG9iamVjdCB0byBhdm9pZCBjaGFuZ2luZyB0aGUgb3JpZ2luYWxcblxuICAgIC8vIEJ1aWxkIG91ciBwYXJzZWQgb2JqZWN0XG4gICAgY29uc3QgcGFyc2VkID0ge1xuICAgICAgICBjb21tYW5kLFxuICAgICAgICBhcmdzLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBmaWxlOiB1bmRlZmluZWQsXG4gICAgICAgIG9yaWdpbmFsOiB7XG4gICAgICAgICAgICBjb21tYW5kLFxuICAgICAgICAgICAgYXJncyxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gRGVsZWdhdGUgZnVydGhlciBwYXJzaW5nIHRvIHNoZWxsIG9yIG5vbi1zaGVsbFxuICAgIHJldHVybiBvcHRpb25zLnNoZWxsID8gcGFyc2VkIDogcGFyc2VOb25TaGVsbChwYXJzZWQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgaXNXaW4gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuXG5mdW5jdGlvbiBub3RGb3VuZEVycm9yKG9yaWdpbmFsLCBzeXNjYWxsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IEVycm9yKGAke3N5c2NhbGx9ICR7b3JpZ2luYWwuY29tbWFuZH0gRU5PRU5UYCksIHtcbiAgICAgICAgY29kZTogJ0VOT0VOVCcsXG4gICAgICAgIGVycm5vOiAnRU5PRU5UJyxcbiAgICAgICAgc3lzY2FsbDogYCR7c3lzY2FsbH0gJHtvcmlnaW5hbC5jb21tYW5kfWAsXG4gICAgICAgIHBhdGg6IG9yaWdpbmFsLmNvbW1hbmQsXG4gICAgICAgIHNwYXduYXJnczogb3JpZ2luYWwuYXJncyxcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gaG9va0NoaWxkUHJvY2VzcyhjcCwgcGFyc2VkKSB7XG4gICAgaWYgKCFpc1dpbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3JpZ2luYWxFbWl0ID0gY3AuZW1pdDtcblxuICAgIGNwLmVtaXQgPSBmdW5jdGlvbiAobmFtZSwgYXJnMSkge1xuICAgICAgICAvLyBJZiBlbWl0dGluZyBcImV4aXRcIiBldmVudCBhbmQgZXhpdCBjb2RlIGlzIDEsIHdlIG5lZWQgdG8gY2hlY2sgaWZcbiAgICAgICAgLy8gdGhlIGNvbW1hbmQgZXhpc3RzIGFuZCBlbWl0IGFuIFwiZXJyb3JcIiBpbnN0ZWFkXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vSW5kaWdvVW5pdGVkL25vZGUtY3Jvc3Mtc3Bhd24vaXNzdWVzLzE2XG4gICAgICAgIGlmIChuYW1lID09PSAnZXhpdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IHZlcmlmeUVOT0VOVChhcmcxLCBwYXJzZWQpO1xuXG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsRW1pdC5jYWxsKGNwLCAnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsRW1pdC5hcHBseShjcCwgYXJndW1lbnRzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwcmVmZXItcmVzdC1wYXJhbXNcbiAgICB9O1xufVxuXG5mdW5jdGlvbiB2ZXJpZnlFTk9FTlQoc3RhdHVzLCBwYXJzZWQpIHtcbiAgICBpZiAoaXNXaW4gJiYgc3RhdHVzID09PSAxICYmICFwYXJzZWQuZmlsZSkge1xuICAgICAgICByZXR1cm4gbm90Rm91bmRFcnJvcihwYXJzZWQub3JpZ2luYWwsICdzcGF3bicpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiB2ZXJpZnlFTk9FTlRTeW5jKHN0YXR1cywgcGFyc2VkKSB7XG4gICAgaWYgKGlzV2luICYmIHN0YXR1cyA9PT0gMSAmJiAhcGFyc2VkLmZpbGUpIHtcbiAgICAgICAgcmV0dXJuIG5vdEZvdW5kRXJyb3IocGFyc2VkLm9yaWdpbmFsLCAnc3Bhd25TeW5jJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGhvb2tDaGlsZFByb2Nlc3MsXG4gICAgdmVyaWZ5RU5PRU5ULFxuICAgIHZlcmlmeUVOT0VOVFN5bmMsXG4gICAgbm90Rm91bmRFcnJvcixcbn07XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBjcCA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcbmNvbnN0IHBhcnNlID0gcmVxdWlyZSgnLi9saWIvcGFyc2UnKTtcbmNvbnN0IGVub2VudCA9IHJlcXVpcmUoJy4vbGliL2Vub2VudCcpO1xuXG5mdW5jdGlvbiBzcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKSB7XG4gICAgLy8gUGFyc2UgdGhlIGFyZ3VtZW50c1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuXG4gICAgLy8gU3Bhd24gdGhlIGNoaWxkIHByb2Nlc3NcbiAgICBjb25zdCBzcGF3bmVkID0gY3Auc3Bhd24ocGFyc2VkLmNvbW1hbmQsIHBhcnNlZC5hcmdzLCBwYXJzZWQub3B0aW9ucyk7XG5cbiAgICAvLyBIb29rIGludG8gY2hpbGQgcHJvY2VzcyBcImV4aXRcIiBldmVudCB0byBlbWl0IGFuIGVycm9yIGlmIHRoZSBjb21tYW5kXG4gICAgLy8gZG9lcyBub3QgZXhpc3RzLCBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9JbmRpZ29Vbml0ZWQvbm9kZS1jcm9zcy1zcGF3bi9pc3N1ZXMvMTZcbiAgICBlbm9lbnQuaG9va0NoaWxkUHJvY2VzcyhzcGF3bmVkLCBwYXJzZWQpO1xuXG4gICAgcmV0dXJuIHNwYXduZWQ7XG59XG5cbmZ1bmN0aW9uIHNwYXduU3luYyhjb21tYW5kLCBhcmdzLCBvcHRpb25zKSB7XG4gICAgLy8gUGFyc2UgdGhlIGFyZ3VtZW50c1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuXG4gICAgLy8gU3Bhd24gdGhlIGNoaWxkIHByb2Nlc3NcbiAgICBjb25zdCByZXN1bHQgPSBjcC5zcGF3blN5bmMocGFyc2VkLmNvbW1hbmQsIHBhcnNlZC5hcmdzLCBwYXJzZWQub3B0aW9ucyk7XG5cbiAgICAvLyBBbmFseXplIGlmIHRoZSBjb21tYW5kIGRvZXMgbm90IGV4aXN0LCBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9JbmRpZ29Vbml0ZWQvbm9kZS1jcm9zcy1zcGF3bi9pc3N1ZXMvMTZcbiAgICByZXN1bHQuZXJyb3IgPSByZXN1bHQuZXJyb3IgfHwgZW5vZW50LnZlcmlmeUVOT0VOVFN5bmMocmVzdWx0LnN0YXR1cywgcGFyc2VkKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3Bhd247XG5tb2R1bGUuZXhwb3J0cy5zcGF3biA9IHNwYXduO1xubW9kdWxlLmV4cG9ydHMuc3luYyA9IHNwYXduU3luYztcblxubW9kdWxlLmV4cG9ydHMuX3BhcnNlID0gcGFyc2U7XG5tb2R1bGUuZXhwb3J0cy5fZW5vZW50ID0gZW5vZW50O1xuIiwgIi8vIFRoaXMgaXMgbm90IHRoZSBzZXQgb2YgYWxsIHBvc3NpYmxlIHNpZ25hbHMuXG4vL1xuLy8gSXQgSVMsIGhvd2V2ZXIsIHRoZSBzZXQgb2YgYWxsIHNpZ25hbHMgdGhhdCB0cmlnZ2VyXG4vLyBhbiBleGl0IG9uIGVpdGhlciBMaW51eCBvciBCU0Qgc3lzdGVtcy4gIExpbnV4IGlzIGFcbi8vIHN1cGVyc2V0IG9mIHRoZSBzaWduYWwgbmFtZXMgc3VwcG9ydGVkIG9uIEJTRCwgYW5kXG4vLyB0aGUgdW5rbm93biBzaWduYWxzIGp1c3QgZmFpbCB0byByZWdpc3Rlciwgc28gd2UgY2FuXG4vLyBjYXRjaCB0aGF0IGVhc2lseSBlbm91Z2guXG4vL1xuLy8gRG9uJ3QgYm90aGVyIHdpdGggU0lHS0lMTC4gIEl0J3MgdW5jYXRjaGFibGUsIHdoaWNoXG4vLyBtZWFucyB0aGF0IHdlIGNhbid0IGZpcmUgYW55IGNhbGxiYWNrcyBhbnl3YXkuXG4vL1xuLy8gSWYgYSB1c2VyIGRvZXMgaGFwcGVuIHRvIHJlZ2lzdGVyIGEgaGFuZGxlciBvbiBhIG5vbi1cbi8vIGZhdGFsIHNpZ25hbCBsaWtlIFNJR1dJTkNIIG9yIHNvbWV0aGluZywgYW5kIHRoZW5cbi8vIGV4aXQsIGl0J2xsIGVuZCB1cCBmaXJpbmcgYHByb2Nlc3MuZW1pdCgnZXhpdCcpYCwgc29cbi8vIHRoZSBoYW5kbGVyIHdpbGwgYmUgZmlyZWQgYW55d2F5LlxuLy9cbi8vIFNJR0JVUywgU0lHRlBFLCBTSUdTRUdWIGFuZCBTSUdJTEwsIHdoZW4gbm90IHJhaXNlZFxuLy8gYXJ0aWZpY2lhbGx5LCBpbmhlcmVudGx5IGxlYXZlIHRoZSBwcm9jZXNzIGluIGFcbi8vIHN0YXRlIGZyb20gd2hpY2ggaXQgaXMgbm90IHNhZmUgdG8gdHJ5IGFuZCBlbnRlciBKU1xuLy8gbGlzdGVuZXJzLlxubW9kdWxlLmV4cG9ydHMgPSBbXG4gICdTSUdBQlJUJyxcbiAgJ1NJR0FMUk0nLFxuICAnU0lHSFVQJyxcbiAgJ1NJR0lOVCcsXG4gICdTSUdURVJNJ1xuXVxuXG5pZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuICBtb2R1bGUuZXhwb3J0cy5wdXNoKFxuICAgICdTSUdWVEFMUk0nLFxuICAgICdTSUdYQ1BVJyxcbiAgICAnU0lHWEZTWicsXG4gICAgJ1NJR1VTUjInLFxuICAgICdTSUdUUkFQJyxcbiAgICAnU0lHU1lTJyxcbiAgICAnU0lHUVVJVCcsXG4gICAgJ1NJR0lPVCdcbiAgICAvLyBzaG91bGQgZGV0ZWN0IHByb2ZpbGVyIGFuZCBlbmFibGUvZGlzYWJsZSBhY2NvcmRpbmdseS5cbiAgICAvLyBzZWUgIzIxXG4gICAgLy8gJ1NJR1BST0YnXG4gIClcbn1cblxuaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdsaW51eCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMucHVzaChcbiAgICAnU0lHSU8nLFxuICAgICdTSUdQT0xMJyxcbiAgICAnU0lHUFdSJyxcbiAgICAnU0lHU1RLRkxUJyxcbiAgICAnU0lHVU5VU0VEJ1xuICApXG59XG4iLCAiLy8gTm90ZTogc2luY2UgbnljIHVzZXMgdGhpcyBtb2R1bGUgdG8gb3V0cHV0IGNvdmVyYWdlLCBhbnkgbGluZXNcbi8vIHRoYXQgYXJlIGluIHRoZSBkaXJlY3Qgc3luYyBmbG93IG9mIG55YydzIG91dHB1dENvdmVyYWdlIGFyZVxuLy8gaWdub3JlZCwgc2luY2Ugd2UgY2FuIG5ldmVyIGdldCBjb3ZlcmFnZSBmb3IgdGhlbS5cbi8vIGdyYWIgYSByZWZlcmVuY2UgdG8gbm9kZSdzIHJlYWwgcHJvY2VzcyBvYmplY3QgcmlnaHQgYXdheVxudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2Vzc1xuXG5jb25zdCBwcm9jZXNzT2sgPSBmdW5jdGlvbiAocHJvY2Vzcykge1xuICByZXR1cm4gcHJvY2VzcyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLnJlYWxseUV4aXQgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5saXN0ZW5lcnMgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5raWxsID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3MucGlkID09PSAnbnVtYmVyJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLm9uID09PSAnZnVuY3Rpb24nXG59XG5cbi8vIHNvbWUga2luZCBvZiBub24tbm9kZSBlbnZpcm9ubWVudCwganVzdCBuby1vcFxuLyogaXN0YW5idWwgaWdub3JlIGlmICovXG5pZiAoIXByb2Nlc3NPayhwcm9jZXNzKSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge31cbiAgfVxufSBlbHNlIHtcbiAgdmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpXG4gIHZhciBzaWduYWxzID0gcmVxdWlyZSgnLi9zaWduYWxzLmpzJylcbiAgdmFyIGlzV2luID0gL153aW4vaS50ZXN0KHByb2Nlc3MucGxhdGZvcm0pXG5cbiAgdmFyIEVFID0gcmVxdWlyZSgnZXZlbnRzJylcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICh0eXBlb2YgRUUgIT09ICdmdW5jdGlvbicpIHtcbiAgICBFRSA9IEVFLkV2ZW50RW1pdHRlclxuICB9XG5cbiAgdmFyIGVtaXR0ZXJcbiAgaWYgKHByb2Nlc3MuX19zaWduYWxfZXhpdF9lbWl0dGVyX18pIHtcbiAgICBlbWl0dGVyID0gcHJvY2Vzcy5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfX1xuICB9IGVsc2Uge1xuICAgIGVtaXR0ZXIgPSBwcm9jZXNzLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fID0gbmV3IEVFKClcbiAgICBlbWl0dGVyLmNvdW50ID0gMFxuICAgIGVtaXR0ZXIuZW1pdHRlZCA9IHt9XG4gIH1cblxuICAvLyBCZWNhdXNlIHRoaXMgZW1pdHRlciBpcyBhIGdsb2JhbCwgd2UgaGF2ZSB0byBjaGVjayB0byBzZWUgaWYgYVxuICAvLyBwcmV2aW91cyB2ZXJzaW9uIG9mIHRoaXMgbGlicmFyeSBmYWlsZWQgdG8gZW5hYmxlIGluZmluaXRlIGxpc3RlbmVycy5cbiAgLy8gSSBrbm93IHdoYXQgeW91J3JlIGFib3V0IHRvIHNheS4gIEJ1dCBsaXRlcmFsbHkgZXZlcnl0aGluZyBhYm91dFxuICAvLyBzaWduYWwtZXhpdCBpcyBhIGNvbXByb21pc2Ugd2l0aCBldmlsLiAgR2V0IHVzZWQgdG8gaXQuXG4gIGlmICghZW1pdHRlci5pbmZpbml0ZSkge1xuICAgIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKEluZmluaXR5KVxuICAgIGVtaXR0ZXIuaW5maW5pdGUgPSB0cnVlXG4gIH1cblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjYiwgb3B0cykge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHt9XG4gICAgfVxuICAgIGFzc2VydC5lcXVhbCh0eXBlb2YgY2IsICdmdW5jdGlvbicsICdhIGNhbGxiYWNrIG11c3QgYmUgcHJvdmlkZWQgZm9yIGV4aXQgaGFuZGxlcicpXG5cbiAgICBpZiAobG9hZGVkID09PSBmYWxzZSkge1xuICAgICAgbG9hZCgpXG4gICAgfVxuXG4gICAgdmFyIGV2ID0gJ2V4aXQnXG4gICAgaWYgKG9wdHMgJiYgb3B0cy5hbHdheXNMYXN0KSB7XG4gICAgICBldiA9ICdhZnRlcmV4aXQnXG4gICAgfVxuXG4gICAgdmFyIHJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoZXYsIGNiKVxuICAgICAgaWYgKGVtaXR0ZXIubGlzdGVuZXJzKCdleGl0JykubGVuZ3RoID09PSAwICYmXG4gICAgICAgICAgZW1pdHRlci5saXN0ZW5lcnMoJ2FmdGVyZXhpdCcpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB1bmxvYWQoKVxuICAgICAgfVxuICAgIH1cbiAgICBlbWl0dGVyLm9uKGV2LCBjYilcblxuICAgIHJldHVybiByZW1vdmVcbiAgfVxuXG4gIHZhciB1bmxvYWQgPSBmdW5jdGlvbiB1bmxvYWQgKCkge1xuICAgIGlmICghbG9hZGVkIHx8ICFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbG9hZGVkID0gZmFsc2VcblxuICAgIHNpZ25hbHMuZm9yRWFjaChmdW5jdGlvbiAoc2lnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBwcm9jZXNzLnJlbW92ZUxpc3RlbmVyKHNpZywgc2lnTGlzdGVuZXJzW3NpZ10pXG4gICAgICB9IGNhdGNoIChlcikge31cbiAgICB9KVxuICAgIHByb2Nlc3MuZW1pdCA9IG9yaWdpbmFsUHJvY2Vzc0VtaXRcbiAgICBwcm9jZXNzLnJlYWxseUV4aXQgPSBvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0XG4gICAgZW1pdHRlci5jb3VudCAtPSAxXG4gIH1cbiAgbW9kdWxlLmV4cG9ydHMudW5sb2FkID0gdW5sb2FkXG5cbiAgdmFyIGVtaXQgPSBmdW5jdGlvbiBlbWl0IChldmVudCwgY29kZSwgc2lnbmFsKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKGVtaXR0ZXIuZW1pdHRlZFtldmVudF0pIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBlbWl0dGVyLmVtaXR0ZWRbZXZlbnRdID0gdHJ1ZVxuICAgIGVtaXR0ZXIuZW1pdChldmVudCwgY29kZSwgc2lnbmFsKVxuICB9XG5cbiAgLy8geyA8c2lnbmFsPjogPGxpc3RlbmVyIGZuPiwgLi4uIH1cbiAgdmFyIHNpZ0xpc3RlbmVycyA9IHt9XG4gIHNpZ25hbHMuZm9yRWFjaChmdW5jdGlvbiAoc2lnKSB7XG4gICAgc2lnTGlzdGVuZXJzW3NpZ10gPSBmdW5jdGlvbiBsaXN0ZW5lciAoKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmICghcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBvdGhlciBsaXN0ZW5lcnMsIGFuIGV4aXQgaXMgY29taW5nIVxuICAgICAgLy8gU2ltcGxlc3Qgd2F5OiByZW1vdmUgdXMgYW5kIHRoZW4gcmUtc2VuZCB0aGUgc2lnbmFsLlxuICAgICAgLy8gV2Uga25vdyB0aGF0IHRoaXMgd2lsbCBraWxsIHRoZSBwcm9jZXNzLCBzbyB3ZSBjYW5cbiAgICAgIC8vIHNhZmVseSBlbWl0IG5vdy5cbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBwcm9jZXNzLmxpc3RlbmVycyhzaWcpXG4gICAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gZW1pdHRlci5jb3VudCkge1xuICAgICAgICB1bmxvYWQoKVxuICAgICAgICBlbWl0KCdleGl0JywgbnVsbCwgc2lnKVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBlbWl0KCdhZnRlcmV4aXQnLCBudWxsLCBzaWcpXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGlmIChpc1dpbiAmJiBzaWcgPT09ICdTSUdIVVAnKSB7XG4gICAgICAgICAgLy8gXCJTSUdIVVBcIiB0aHJvd3MgYW4gYEVOT1NZU2AgZXJyb3Igb24gV2luZG93cyxcbiAgICAgICAgICAvLyBzbyB1c2UgYSBzdXBwb3J0ZWQgc2lnbmFsIGluc3RlYWRcbiAgICAgICAgICBzaWcgPSAnU0lHSU5UJ1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHByb2Nlc3Mua2lsbChwcm9jZXNzLnBpZCwgc2lnKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICBtb2R1bGUuZXhwb3J0cy5zaWduYWxzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBzaWduYWxzXG4gIH1cblxuICB2YXIgbG9hZGVkID0gZmFsc2VcblxuICB2YXIgbG9hZCA9IGZ1bmN0aW9uIGxvYWQgKCkge1xuICAgIGlmIChsb2FkZWQgfHwgIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsb2FkZWQgPSB0cnVlXG5cbiAgICAvLyBUaGlzIGlzIHRoZSBudW1iZXIgb2Ygb25TaWduYWxFeGl0J3MgdGhhdCBhcmUgaW4gcGxheS5cbiAgICAvLyBJdCdzIGltcG9ydGFudCBzbyB0aGF0IHdlIGNhbiBjb3VudCB0aGUgY29ycmVjdCBudW1iZXIgb2ZcbiAgICAvLyBsaXN0ZW5lcnMgb24gc2lnbmFscywgYW5kIGRvbid0IHdhaXQgZm9yIHRoZSBvdGhlciBvbmUgdG9cbiAgICAvLyBoYW5kbGUgaXQgaW5zdGVhZCBvZiB1cy5cbiAgICBlbWl0dGVyLmNvdW50ICs9IDFcblxuICAgIHNpZ25hbHMgPSBzaWduYWxzLmZpbHRlcihmdW5jdGlvbiAoc2lnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBwcm9jZXNzLm9uKHNpZywgc2lnTGlzdGVuZXJzW3NpZ10pXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcHJvY2Vzcy5lbWl0ID0gcHJvY2Vzc0VtaXRcbiAgICBwcm9jZXNzLnJlYWxseUV4aXQgPSBwcm9jZXNzUmVhbGx5RXhpdFxuICB9XG4gIG1vZHVsZS5leHBvcnRzLmxvYWQgPSBsb2FkXG5cbiAgdmFyIG9yaWdpbmFsUHJvY2Vzc1JlYWxseUV4aXQgPSBwcm9jZXNzLnJlYWxseUV4aXRcbiAgdmFyIHByb2Nlc3NSZWFsbHlFeGl0ID0gZnVuY3Rpb24gcHJvY2Vzc1JlYWxseUV4aXQgKGNvZGUpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gY29kZSB8fCAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqLyAwXG4gICAgZW1pdCgnZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBlbWl0KCdhZnRlcmV4aXQnLCBwcm9jZXNzLmV4aXRDb2RlLCBudWxsKVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdC5jYWxsKHByb2Nlc3MsIHByb2Nlc3MuZXhpdENvZGUpXG4gIH1cblxuICB2YXIgb3JpZ2luYWxQcm9jZXNzRW1pdCA9IHByb2Nlc3MuZW1pdFxuICB2YXIgcHJvY2Vzc0VtaXQgPSBmdW5jdGlvbiBwcm9jZXNzRW1pdCAoZXYsIGFyZykge1xuICAgIGlmIChldiA9PT0gJ2V4aXQnICYmIHByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAoYXJnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IGFyZ1xuICAgICAgfVxuICAgICAgdmFyIHJldCA9IG9yaWdpbmFsUHJvY2Vzc0VtaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIGVtaXQoJ2V4aXQnLCBwcm9jZXNzLmV4aXRDb2RlLCBudWxsKVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIGVtaXQoJ2FmdGVyZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgcmV0dXJuIHJldFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3JpZ2luYWxQcm9jZXNzRW1pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgfVxuICB9XG59XG4iLCAiJ3VzZSBzdHJpY3QnO1xuY29uc3Qge1Bhc3NUaHJvdWdoOiBQYXNzVGhyb3VnaFN0cmVhbX0gPSByZXF1aXJlKCdzdHJlYW0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBvcHRpb25zID0+IHtcblx0b3B0aW9ucyA9IHsuLi5vcHRpb25zfTtcblxuXHRjb25zdCB7YXJyYXl9ID0gb3B0aW9ucztcblx0bGV0IHtlbmNvZGluZ30gPSBvcHRpb25zO1xuXHRjb25zdCBpc0J1ZmZlciA9IGVuY29kaW5nID09PSAnYnVmZmVyJztcblx0bGV0IG9iamVjdE1vZGUgPSBmYWxzZTtcblxuXHRpZiAoYXJyYXkpIHtcblx0XHRvYmplY3RNb2RlID0gIShlbmNvZGluZyB8fCBpc0J1ZmZlcik7XG5cdH0gZWxzZSB7XG5cdFx0ZW5jb2RpbmcgPSBlbmNvZGluZyB8fCAndXRmOCc7XG5cdH1cblxuXHRpZiAoaXNCdWZmZXIpIHtcblx0XHRlbmNvZGluZyA9IG51bGw7XG5cdH1cblxuXHRjb25zdCBzdHJlYW0gPSBuZXcgUGFzc1Rocm91Z2hTdHJlYW0oe29iamVjdE1vZGV9KTtcblxuXHRpZiAoZW5jb2RpbmcpIHtcblx0XHRzdHJlYW0uc2V0RW5jb2RpbmcoZW5jb2RpbmcpO1xuXHR9XG5cblx0bGV0IGxlbmd0aCA9IDA7XG5cdGNvbnN0IGNodW5rcyA9IFtdO1xuXG5cdHN0cmVhbS5vbignZGF0YScsIGNodW5rID0+IHtcblx0XHRjaHVua3MucHVzaChjaHVuayk7XG5cblx0XHRpZiAob2JqZWN0TW9kZSkge1xuXHRcdFx0bGVuZ3RoID0gY2h1bmtzLmxlbmd0aDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGVuZ3RoICs9IGNodW5rLmxlbmd0aDtcblx0XHR9XG5cdH0pO1xuXG5cdHN0cmVhbS5nZXRCdWZmZXJlZFZhbHVlID0gKCkgPT4ge1xuXHRcdGlmIChhcnJheSkge1xuXHRcdFx0cmV0dXJuIGNodW5rcztcblx0XHR9XG5cblx0XHRyZXR1cm4gaXNCdWZmZXIgPyBCdWZmZXIuY29uY2F0KGNodW5rcywgbGVuZ3RoKSA6IGNodW5rcy5qb2luKCcnKTtcblx0fTtcblxuXHRzdHJlYW0uZ2V0QnVmZmVyZWRMZW5ndGggPSAoKSA9PiBsZW5ndGg7XG5cblx0cmV0dXJuIHN0cmVhbTtcbn07XG4iLCAiJ3VzZSBzdHJpY3QnO1xuY29uc3Qge2NvbnN0YW50czogQnVmZmVyQ29uc3RhbnRzfSA9IHJlcXVpcmUoJ2J1ZmZlcicpO1xuY29uc3Qgc3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5jb25zdCB7cHJvbWlzaWZ5fSA9IHJlcXVpcmUoJ3V0aWwnKTtcbmNvbnN0IGJ1ZmZlclN0cmVhbSA9IHJlcXVpcmUoJy4vYnVmZmVyLXN0cmVhbScpO1xuXG5jb25zdCBzdHJlYW1QaXBlbGluZVByb21pc2lmaWVkID0gcHJvbWlzaWZ5KHN0cmVhbS5waXBlbGluZSk7XG5cbmNsYXNzIE1heEJ1ZmZlckVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcignbWF4QnVmZmVyIGV4Y2VlZGVkJyk7XG5cdFx0dGhpcy5uYW1lID0gJ01heEJ1ZmZlckVycm9yJztcblx0fVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRTdHJlYW0oaW5wdXRTdHJlYW0sIG9wdGlvbnMpIHtcblx0aWYgKCFpbnB1dFN0cmVhbSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgYSBzdHJlYW0nKTtcblx0fVxuXG5cdG9wdGlvbnMgPSB7XG5cdFx0bWF4QnVmZmVyOiBJbmZpbml0eSxcblx0XHQuLi5vcHRpb25zXG5cdH07XG5cblx0Y29uc3Qge21heEJ1ZmZlcn0gPSBvcHRpb25zO1xuXHRjb25zdCBzdHJlYW0gPSBidWZmZXJTdHJlYW0ob3B0aW9ucyk7XG5cblx0YXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdGNvbnN0IHJlamVjdFByb21pc2UgPSBlcnJvciA9PiB7XG5cdFx0XHQvLyBEb24ndCByZXRyaWV2ZSBhbiBvdmVyc2l6ZWQgYnVmZmVyLlxuXHRcdFx0aWYgKGVycm9yICYmIHN0cmVhbS5nZXRCdWZmZXJlZExlbmd0aCgpIDw9IEJ1ZmZlckNvbnN0YW50cy5NQVhfTEVOR1RIKSB7XG5cdFx0XHRcdGVycm9yLmJ1ZmZlcmVkRGF0YSA9IHN0cmVhbS5nZXRCdWZmZXJlZFZhbHVlKCk7XG5cdFx0XHR9XG5cblx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0fTtcblxuXHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCBzdHJlYW1QaXBlbGluZVByb21pc2lmaWVkKGlucHV0U3RyZWFtLCBzdHJlYW0pO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRyZWplY3RQcm9taXNlKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KSgpO1xuXG5cdFx0c3RyZWFtLm9uKCdkYXRhJywgKCkgPT4ge1xuXHRcdFx0aWYgKHN0cmVhbS5nZXRCdWZmZXJlZExlbmd0aCgpID4gbWF4QnVmZmVyKSB7XG5cdFx0XHRcdHJlamVjdFByb21pc2UobmV3IE1heEJ1ZmZlckVycm9yKCkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcblxuXHRyZXR1cm4gc3RyZWFtLmdldEJ1ZmZlcmVkVmFsdWUoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRTdHJlYW07XG5tb2R1bGUuZXhwb3J0cy5idWZmZXIgPSAoc3RyZWFtLCBvcHRpb25zKSA9PiBnZXRTdHJlYW0oc3RyZWFtLCB7Li4ub3B0aW9ucywgZW5jb2Rpbmc6ICdidWZmZXInfSk7XG5tb2R1bGUuZXhwb3J0cy5hcnJheSA9IChzdHJlYW0sIG9wdGlvbnMpID0+IGdldFN0cmVhbShzdHJlYW0sIHsuLi5vcHRpb25zLCBhcnJheTogdHJ1ZX0pO1xubW9kdWxlLmV4cG9ydHMuTWF4QnVmZmVyRXJyb3IgPSBNYXhCdWZmZXJFcnJvcjtcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHsgUGFzc1Rocm91Z2ggfSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgvKnN0cmVhbXMuLi4qLykge1xuICB2YXIgc291cmNlcyA9IFtdXG4gIHZhciBvdXRwdXQgID0gbmV3IFBhc3NUaHJvdWdoKHtvYmplY3RNb2RlOiB0cnVlfSlcblxuICBvdXRwdXQuc2V0TWF4TGlzdGVuZXJzKDApXG5cbiAgb3V0cHV0LmFkZCA9IGFkZFxuICBvdXRwdXQuaXNFbXB0eSA9IGlzRW1wdHlcblxuICBvdXRwdXQub24oJ3VucGlwZScsIHJlbW92ZSlcblxuICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmZvckVhY2goYWRkKVxuXG4gIHJldHVybiBvdXRwdXRcblxuICBmdW5jdGlvbiBhZGQgKHNvdXJjZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHNvdXJjZS5mb3JFYWNoKGFkZClcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgc291cmNlcy5wdXNoKHNvdXJjZSk7XG4gICAgc291cmNlLm9uY2UoJ2VuZCcsIHJlbW92ZS5iaW5kKG51bGwsIHNvdXJjZSkpXG4gICAgc291cmNlLm9uY2UoJ2Vycm9yJywgb3V0cHV0LmVtaXQuYmluZChvdXRwdXQsICdlcnJvcicpKVxuICAgIHNvdXJjZS5waXBlKG91dHB1dCwge2VuZDogZmFsc2V9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBmdW5jdGlvbiBpc0VtcHR5ICgpIHtcbiAgICByZXR1cm4gc291cmNlcy5sZW5ndGggPT0gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZSAoc291cmNlKSB7XG4gICAgc291cmNlcyA9IHNvdXJjZXMuZmlsdGVyKGZ1bmN0aW9uIChpdCkgeyByZXR1cm4gaXQgIT09IHNvdXJjZSB9KVxuICAgIGlmICghc291cmNlcy5sZW5ndGggJiYgb3V0cHV0LnJlYWRhYmxlKSB7IG91dHB1dC5lbmQoKSB9XG4gIH1cbn1cbiIsICIvKipcbiAqIEBsaWNlbnNlIG5vZGUtc3RyZWFtLXppcCB8IChjKSAyMDIwIEFudGVsbGUgfCBodHRwczovL2dpdGh1Yi5jb20vYW50ZWxsZS9ub2RlLXN0cmVhbS16aXAvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICogUG9ydGlvbnMgY29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9jdGhhY2tlcnMvYWRtLXppcCB8IGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9jdGhhY2tlcnMvYWRtLXppcC9tYXN0ZXIvTElDRU5TRVxuICovXG5cbmxldCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuY29uc3QgemxpYiA9IHJlcXVpcmUoJ3psaWInKTtcbmNvbnN0IHN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG5jb25zdCBjb25zdHMgPSB7XG4gICAgLyogVGhlIGxvY2FsIGZpbGUgaGVhZGVyICovXG4gICAgTE9DSERSOiAzMCwgLy8gTE9DIGhlYWRlciBzaXplXG4gICAgTE9DU0lHOiAweDA0MDM0YjUwLCAvLyBcIlBLXFwwMDNcXDAwNFwiXG4gICAgTE9DVkVSOiA0LCAvLyB2ZXJzaW9uIG5lZWRlZCB0byBleHRyYWN0XG4gICAgTE9DRkxHOiA2LCAvLyBnZW5lcmFsIHB1cnBvc2UgYml0IGZsYWdcbiAgICBMT0NIT1c6IDgsIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICAgIExPQ1RJTTogMTAsIC8vIG1vZGlmaWNhdGlvbiB0aW1lICgyIGJ5dGVzIHRpbWUsIDIgYnl0ZXMgZGF0ZSlcbiAgICBMT0NDUkM6IDE0LCAvLyB1bmNvbXByZXNzZWQgZmlsZSBjcmMtMzIgdmFsdWVcbiAgICBMT0NTSVo6IDE4LCAvLyBjb21wcmVzc2VkIHNpemVcbiAgICBMT0NMRU46IDIyLCAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuICAgIExPQ05BTTogMjYsIC8vIGZpbGVuYW1lIGxlbmd0aFxuICAgIExPQ0VYVDogMjgsIC8vIGV4dHJhIGZpZWxkIGxlbmd0aFxuXG4gICAgLyogVGhlIERhdGEgZGVzY3JpcHRvciAqL1xuICAgIEVYVFNJRzogMHgwODA3NGI1MCwgLy8gXCJQS1xcMDA3XFwwMDhcIlxuICAgIEVYVEhEUjogMTYsIC8vIEVYVCBoZWFkZXIgc2l6ZVxuICAgIEVYVENSQzogNCwgLy8gdW5jb21wcmVzc2VkIGZpbGUgY3JjLTMyIHZhbHVlXG4gICAgRVhUU0laOiA4LCAvLyBjb21wcmVzc2VkIHNpemVcbiAgICBFWFRMRU46IDEyLCAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuXG4gICAgLyogVGhlIGNlbnRyYWwgZGlyZWN0b3J5IGZpbGUgaGVhZGVyICovXG4gICAgQ0VOSERSOiA0NiwgLy8gQ0VOIGhlYWRlciBzaXplXG4gICAgQ0VOU0lHOiAweDAyMDE0YjUwLCAvLyBcIlBLXFwwMDFcXDAwMlwiXG4gICAgQ0VOVkVNOiA0LCAvLyB2ZXJzaW9uIG1hZGUgYnlcbiAgICBDRU5WRVI6IDYsIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcbiAgICBDRU5GTEc6IDgsIC8vIGVuY3J5cHQsIGRlY3J5cHQgZmxhZ3NcbiAgICBDRU5IT1c6IDEwLCAvLyBjb21wcmVzc2lvbiBtZXRob2RcbiAgICBDRU5USU06IDEyLCAvLyBtb2RpZmljYXRpb24gdGltZSAoMiBieXRlcyB0aW1lLCAyIGJ5dGVzIGRhdGUpXG4gICAgQ0VOQ1JDOiAxNiwgLy8gdW5jb21wcmVzc2VkIGZpbGUgY3JjLTMyIHZhbHVlXG4gICAgQ0VOU0laOiAyMCwgLy8gY29tcHJlc3NlZCBzaXplXG4gICAgQ0VOTEVOOiAyNCwgLy8gdW5jb21wcmVzc2VkIHNpemVcbiAgICBDRU5OQU06IDI4LCAvLyBmaWxlbmFtZSBsZW5ndGhcbiAgICBDRU5FWFQ6IDMwLCAvLyBleHRyYSBmaWVsZCBsZW5ndGhcbiAgICBDRU5DT006IDMyLCAvLyBmaWxlIGNvbW1lbnQgbGVuZ3RoXG4gICAgQ0VORFNLOiAzNCwgLy8gdm9sdW1lIG51bWJlciBzdGFydFxuICAgIENFTkFUVDogMzYsIC8vIGludGVybmFsIGZpbGUgYXR0cmlidXRlc1xuICAgIENFTkFUWDogMzgsIC8vIGV4dGVybmFsIGZpbGUgYXR0cmlidXRlcyAoaG9zdCBzeXN0ZW0gZGVwZW5kZW50KVxuICAgIENFTk9GRjogNDIsIC8vIExPQyBoZWFkZXIgb2Zmc2V0XG5cbiAgICAvKiBUaGUgZW50cmllcyBpbiB0aGUgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5ICovXG4gICAgRU5ESERSOiAyMiwgLy8gRU5EIGhlYWRlciBzaXplXG4gICAgRU5EU0lHOiAweDA2MDU0YjUwLCAvLyBcIlBLXFwwMDVcXDAwNlwiXG4gICAgRU5EU0lHRklSU1Q6IDB4NTAsXG4gICAgRU5EU1VCOiA4LCAvLyBudW1iZXIgb2YgZW50cmllcyBvbiB0aGlzIGRpc2tcbiAgICBFTkRUT1Q6IDEwLCAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllc1xuICAgIEVORFNJWjogMTIsIC8vIGNlbnRyYWwgZGlyZWN0b3J5IHNpemUgaW4gYnl0ZXNcbiAgICBFTkRPRkY6IDE2LCAvLyBvZmZzZXQgb2YgZmlyc3QgQ0VOIGhlYWRlclxuICAgIEVORENPTTogMjAsIC8vIHppcCBmaWxlIGNvbW1lbnQgbGVuZ3RoXG4gICAgTUFYRklMRUNPTU1FTlQ6IDB4ZmZmZixcblxuICAgIC8qIFRoZSBlbnRyaWVzIGluIHRoZSBlbmQgb2YgWklQNjQgY2VudHJhbCBkaXJlY3RvcnkgbG9jYXRvciAqL1xuICAgIEVOREw2NEhEUjogMjAsIC8vIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBsb2NhdG9yIGhlYWRlciBzaXplXG4gICAgRU5ETDY0U0lHOiAweDA3MDY0YjUwLCAvLyBaSVA2NCBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnkgbG9jYXRvciBzaWduYXR1cmVcbiAgICBFTkRMNjRTSUdGSVJTVDogMHg1MCxcbiAgICBFTkRMNjRPRlM6IDgsIC8vIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBvZmZzZXRcblxuICAgIC8qIFRoZSBlbnRyaWVzIGluIHRoZSBlbmQgb2YgWklQNjQgY2VudHJhbCBkaXJlY3RvcnkgKi9cbiAgICBFTkQ2NEhEUjogNTYsIC8vIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBoZWFkZXIgc2l6ZVxuICAgIEVORDY0U0lHOiAweDA2MDY0YjUwLCAvLyBaSVA2NCBlbmQgb2YgY2VudHJhbCBkaXJlY3Rvcnkgc2lnbmF0dXJlXG4gICAgRU5ENjRTSUdGSVJTVDogMHg1MCxcbiAgICBFTkQ2NFNVQjogMjQsIC8vIG51bWJlciBvZiBlbnRyaWVzIG9uIHRoaXMgZGlza1xuICAgIEVORDY0VE9UOiAzMiwgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXNcbiAgICBFTkQ2NFNJWjogNDAsXG4gICAgRU5ENjRPRkY6IDQ4LFxuXG4gICAgLyogQ29tcHJlc3Npb24gbWV0aG9kcyAqL1xuICAgIFNUT1JFRDogMCwgLy8gbm8gY29tcHJlc3Npb25cbiAgICBTSFJVTks6IDEsIC8vIHNocnVua1xuICAgIFJFRFVDRUQxOiAyLCAvLyByZWR1Y2VkIHdpdGggY29tcHJlc3Npb24gZmFjdG9yIDFcbiAgICBSRURVQ0VEMjogMywgLy8gcmVkdWNlZCB3aXRoIGNvbXByZXNzaW9uIGZhY3RvciAyXG4gICAgUkVEVUNFRDM6IDQsIC8vIHJlZHVjZWQgd2l0aCBjb21wcmVzc2lvbiBmYWN0b3IgM1xuICAgIFJFRFVDRUQ0OiA1LCAvLyByZWR1Y2VkIHdpdGggY29tcHJlc3Npb24gZmFjdG9yIDRcbiAgICBJTVBMT0RFRDogNiwgLy8gaW1wbG9kZWRcbiAgICAvLyA3IHJlc2VydmVkXG4gICAgREVGTEFURUQ6IDgsIC8vIGRlZmxhdGVkXG4gICAgRU5IQU5DRURfREVGTEFURUQ6IDksIC8vIGRlZmxhdGU2NFxuICAgIFBLV0FSRTogMTAsIC8vIFBLV2FyZSBEQ0wgaW1wbG9kZWRcbiAgICAvLyAxMSByZXNlcnZlZFxuICAgIEJaSVAyOiAxMiwgLy8gIGNvbXByZXNzZWQgdXNpbmcgQlpJUDJcbiAgICAvLyAxMyByZXNlcnZlZFxuICAgIExaTUE6IDE0LCAvLyBMWk1BXG4gICAgLy8gMTUtMTcgcmVzZXJ2ZWRcbiAgICBJQk1fVEVSU0U6IDE4LCAvLyBjb21wcmVzc2VkIHVzaW5nIElCTSBURVJTRVxuICAgIElCTV9MWjc3OiAxOSwgLy9JQk0gTFo3NyB6XG5cbiAgICAvKiBHZW5lcmFsIHB1cnBvc2UgYml0IGZsYWcgKi9cbiAgICBGTEdfRU5DOiAwLCAvLyBlbmNyeXB0ZWQgZmlsZVxuICAgIEZMR19DT01QMTogMSwgLy8gY29tcHJlc3Npb24gb3B0aW9uXG4gICAgRkxHX0NPTVAyOiAyLCAvLyBjb21wcmVzc2lvbiBvcHRpb25cbiAgICBGTEdfREVTQzogNCwgLy8gZGF0YSBkZXNjcmlwdG9yXG4gICAgRkxHX0VOSDogOCwgLy8gZW5oYW5jZWQgZGVmbGF0aW9uXG4gICAgRkxHX1NUUjogMTYsIC8vIHN0cm9uZyBlbmNyeXB0aW9uXG4gICAgRkxHX0xORzogMTAyNCwgLy8gbGFuZ3VhZ2UgZW5jb2RpbmdcbiAgICBGTEdfTVNLOiA0MDk2LCAvLyBtYXNrIGhlYWRlciB2YWx1ZXNcbiAgICBGTEdfRU5UUllfRU5DOiAxLFxuXG4gICAgLyogNC41IEV4dGVuc2libGUgZGF0YSBmaWVsZHMgKi9cbiAgICBFRl9JRDogMCxcbiAgICBFRl9TSVpFOiAyLFxuXG4gICAgLyogSGVhZGVyIElEcyAqL1xuICAgIElEX1pJUDY0OiAweDAwMDEsXG4gICAgSURfQVZJTkZPOiAweDAwMDcsXG4gICAgSURfUEZTOiAweDAwMDgsXG4gICAgSURfT1MyOiAweDAwMDksXG4gICAgSURfTlRGUzogMHgwMDBhLFxuICAgIElEX09QRU5WTVM6IDB4MDAwYyxcbiAgICBJRF9VTklYOiAweDAwMGQsXG4gICAgSURfRk9SSzogMHgwMDBlLFxuICAgIElEX1BBVENIOiAweDAwMGYsXG4gICAgSURfWDUwOV9QS0NTNzogMHgwMDE0LFxuICAgIElEX1g1MDlfQ0VSVElEX0Y6IDB4MDAxNSxcbiAgICBJRF9YNTA5X0NFUlRJRF9DOiAweDAwMTYsXG4gICAgSURfU1RST05HRU5DOiAweDAwMTcsXG4gICAgSURfUkVDT1JEX01HVDogMHgwMDE4LFxuICAgIElEX1g1MDlfUEtDUzdfUkw6IDB4MDAxOSxcbiAgICBJRF9JQk0xOiAweDAwNjUsXG4gICAgSURfSUJNMjogMHgwMDY2LFxuICAgIElEX1BPU1pJUDogMHg0NjkwLFxuXG4gICAgRUZfWklQNjRfT1JfMzI6IDB4ZmZmZmZmZmYsXG4gICAgRUZfWklQNjRfT1JfMTY6IDB4ZmZmZixcbn07XG5cbmNvbnN0IFN0cmVhbVppcCA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBsZXQgZmQsIGZpbGVTaXplLCBjaHVua1NpemUsIG9wLCBjZW50cmFsRGlyZWN0b3J5LCBjbG9zZWQ7XG4gICAgY29uc3QgcmVhZHkgPSBmYWxzZSxcbiAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgIGVudHJpZXMgPSBjb25maWcuc3RvcmVFbnRyaWVzICE9PSBmYWxzZSA/IHt9IDogbnVsbCxcbiAgICAgICAgZmlsZU5hbWUgPSBjb25maWcuZmlsZSxcbiAgICAgICAgdGV4dERlY29kZXIgPSBjb25maWcubmFtZUVuY29kaW5nID8gbmV3IFRleHREZWNvZGVyKGNvbmZpZy5uYW1lRW5jb2RpbmcpIDogbnVsbDtcblxuICAgIG9wZW4oKTtcblxuICAgIGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICAgIGlmIChjb25maWcuZmQpIHtcbiAgICAgICAgICAgIGZkID0gY29uZmlnLmZkO1xuICAgICAgICAgICAgcmVhZEZpbGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZzLm9wZW4oZmlsZU5hbWUsICdyJywgKGVyciwgZikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmZCA9IGY7XG4gICAgICAgICAgICAgICAgcmVhZEZpbGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZEZpbGUoKSB7XG4gICAgICAgIGZzLmZzdGF0KGZkLCAoZXJyLCBzdGF0KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZVNpemUgPSBzdGF0LnNpemU7XG4gICAgICAgICAgICBjaHVua1NpemUgPSBjb25maWcuY2h1bmtTaXplIHx8IE1hdGgucm91bmQoZmlsZVNpemUgLyAxMDAwKTtcbiAgICAgICAgICAgIGNodW5rU2l6ZSA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgIE1hdGgubWluKGNodW5rU2l6ZSwgTWF0aC5taW4oMTI4ICogMTAyNCwgZmlsZVNpemUpKSxcbiAgICAgICAgICAgICAgICBNYXRoLm1pbigxMDI0LCBmaWxlU2l6ZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZWFkQ2VudHJhbERpcmVjdG9yeSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkVW50aWxGb3VuZENhbGxiYWNrKGVyciwgYnl0ZXNSZWFkKSB7XG4gICAgICAgIGlmIChlcnIgfHwgIWJ5dGVzUmVhZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW1pdCgnZXJyb3InLCBlcnIgfHwgbmV3IEVycm9yKCdBcmNoaXZlIHJlYWQgZXJyb3InKSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHBvcyA9IG9wLmxhc3RQb3M7XG4gICAgICAgIGxldCBidWZmZXJQb3NpdGlvbiA9IHBvcyAtIG9wLndpbi5wb3NpdGlvbjtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gb3Aud2luLmJ1ZmZlcjtcbiAgICAgICAgY29uc3QgbWluUG9zID0gb3AubWluUG9zO1xuICAgICAgICB3aGlsZSAoLS1wb3MgPj0gbWluUG9zICYmIC0tYnVmZmVyUG9zaXRpb24gPj0gMCkge1xuICAgICAgICAgICAgaWYgKGJ1ZmZlci5sZW5ndGggLSBidWZmZXJQb3NpdGlvbiA+PSA0ICYmIGJ1ZmZlcltidWZmZXJQb3NpdGlvbl0gPT09IG9wLmZpcnN0Qnl0ZSkge1xuICAgICAgICAgICAgICAgIC8vIHF1aWNrIGNoZWNrIGZpcnN0IHNpZ25hdHVyZSBieXRlXG4gICAgICAgICAgICAgICAgaWYgKGJ1ZmZlci5yZWFkVUludDMyTEUoYnVmZmVyUG9zaXRpb24pID09PSBvcC5zaWcpIHtcbiAgICAgICAgICAgICAgICAgICAgb3AubGFzdEJ1ZmZlclBvc2l0aW9uID0gYnVmZmVyUG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgIG9wLmxhc3RCeXRlc1JlYWQgPSBieXRlc1JlYWQ7XG4gICAgICAgICAgICAgICAgICAgIG9wLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvcyA9PT0gbWluUG9zKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignQmFkIGFyY2hpdmUnKSk7XG4gICAgICAgIH1cbiAgICAgICAgb3AubGFzdFBvcyA9IHBvcyArIDE7XG4gICAgICAgIG9wLmNodW5rU2l6ZSAqPSAyO1xuICAgICAgICBpZiAocG9zIDw9IG1pblBvcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ0JhZCBhcmNoaXZlJykpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4cGFuZExlbmd0aCA9IE1hdGgubWluKG9wLmNodW5rU2l6ZSwgcG9zIC0gbWluUG9zKTtcbiAgICAgICAgb3Aud2luLmV4cGFuZExlZnQoZXhwYW5kTGVuZ3RoLCByZWFkVW50aWxGb3VuZENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkQ2VudHJhbERpcmVjdG9yeSgpIHtcbiAgICAgICAgY29uc3QgdG90YWxSZWFkTGVuZ3RoID0gTWF0aC5taW4oY29uc3RzLkVOREhEUiArIGNvbnN0cy5NQVhGSUxFQ09NTUVOVCwgZmlsZVNpemUpO1xuICAgICAgICBvcCA9IHtcbiAgICAgICAgICAgIHdpbjogbmV3IEZpbGVXaW5kb3dCdWZmZXIoZmQpLFxuICAgICAgICAgICAgdG90YWxSZWFkTGVuZ3RoLFxuICAgICAgICAgICAgbWluUG9zOiBmaWxlU2l6ZSAtIHRvdGFsUmVhZExlbmd0aCxcbiAgICAgICAgICAgIGxhc3RQb3M6IGZpbGVTaXplLFxuICAgICAgICAgICAgY2h1bmtTaXplOiBNYXRoLm1pbigxMDI0LCBjaHVua1NpemUpLFxuICAgICAgICAgICAgZmlyc3RCeXRlOiBjb25zdHMuRU5EU0lHRklSU1QsXG4gICAgICAgICAgICBzaWc6IGNvbnN0cy5FTkRTSUcsXG4gICAgICAgICAgICBjb21wbGV0ZTogcmVhZENlbnRyYWxEaXJlY3RvcnlDb21wbGV0ZSxcbiAgICAgICAgfTtcbiAgICAgICAgb3Aud2luLnJlYWQoZmlsZVNpemUgLSBvcC5jaHVua1NpemUsIG9wLmNodW5rU2l6ZSwgcmVhZFVudGlsRm91bmRDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZENlbnRyYWxEaXJlY3RvcnlDb21wbGV0ZSgpIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gb3Aud2luLmJ1ZmZlcjtcbiAgICAgICAgY29uc3QgcG9zID0gb3AubGFzdEJ1ZmZlclBvc2l0aW9uO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2VudHJhbERpcmVjdG9yeSA9IG5ldyBDZW50cmFsRGlyZWN0b3J5SGVhZGVyKCk7XG4gICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5LnJlYWQoYnVmZmVyLnNsaWNlKHBvcywgcG9zICsgY29uc3RzLkVOREhEUikpO1xuICAgICAgICAgICAgY2VudHJhbERpcmVjdG9yeS5oZWFkZXJPZmZzZXQgPSBvcC53aW4ucG9zaXRpb24gKyBwb3M7XG4gICAgICAgICAgICBpZiAoY2VudHJhbERpcmVjdG9yeS5jb21tZW50TGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jb21tZW50ID0gYnVmZmVyXG4gICAgICAgICAgICAgICAgICAgIC5zbGljZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyArIGNvbnN0cy5FTkRIRFIsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgKyBjb25zdHMuRU5ESERSICsgY2VudHJhbERpcmVjdG9yeS5jb21tZW50TGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoYXQuY29tbWVudCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGF0LmVudHJpZXNDb3VudCA9IGNlbnRyYWxEaXJlY3Rvcnkudm9sdW1lRW50cmllcztcbiAgICAgICAgICAgIHRoYXQuY2VudHJhbERpcmVjdG9yeSA9IGNlbnRyYWxEaXJlY3Rvcnk7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgKGNlbnRyYWxEaXJlY3Rvcnkudm9sdW1lRW50cmllcyA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzE2ICYmXG4gICAgICAgICAgICAgICAgICAgIGNlbnRyYWxEaXJlY3RvcnkudG90YWxFbnRyaWVzID09PSBjb25zdHMuRUZfWklQNjRfT1JfMTYpIHx8XG4gICAgICAgICAgICAgICAgY2VudHJhbERpcmVjdG9yeS5zaXplID09PSBjb25zdHMuRUZfWklQNjRfT1JfMzIgfHxcbiAgICAgICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5Lm9mZnNldCA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzMyXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZWFkWmlwNjRDZW50cmFsRGlyZWN0b3J5TG9jYXRvcigpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcCA9IHt9O1xuICAgICAgICAgICAgICAgIHJlYWRFbnRyaWVzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhhdC5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkWmlwNjRDZW50cmFsRGlyZWN0b3J5TG9jYXRvcigpIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gY29uc3RzLkVOREw2NEhEUjtcbiAgICAgICAgaWYgKG9wLmxhc3RCdWZmZXJQb3NpdGlvbiA+IGxlbmd0aCkge1xuICAgICAgICAgICAgb3AubGFzdEJ1ZmZlclBvc2l0aW9uIC09IGxlbmd0aDtcbiAgICAgICAgICAgIHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlMb2NhdG9yQ29tcGxldGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9wID0ge1xuICAgICAgICAgICAgICAgIHdpbjogb3Aud2luLFxuICAgICAgICAgICAgICAgIHRvdGFsUmVhZExlbmd0aDogbGVuZ3RoLFxuICAgICAgICAgICAgICAgIG1pblBvczogb3Aud2luLnBvc2l0aW9uIC0gbGVuZ3RoLFxuICAgICAgICAgICAgICAgIGxhc3RQb3M6IG9wLndpbi5wb3NpdGlvbixcbiAgICAgICAgICAgICAgICBjaHVua1NpemU6IG9wLmNodW5rU2l6ZSxcbiAgICAgICAgICAgICAgICBmaXJzdEJ5dGU6IGNvbnN0cy5FTkRMNjRTSUdGSVJTVCxcbiAgICAgICAgICAgICAgICBzaWc6IGNvbnN0cy5FTkRMNjRTSUcsXG4gICAgICAgICAgICAgICAgY29tcGxldGU6IHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlMb2NhdG9yQ29tcGxldGUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgb3Aud2luLnJlYWQob3AubGFzdFBvcyAtIG9wLmNodW5rU2l6ZSwgb3AuY2h1bmtTaXplLCByZWFkVW50aWxGb3VuZENhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlMb2NhdG9yQ29tcGxldGUoKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IG9wLndpbi5idWZmZXI7XG4gICAgICAgIGNvbnN0IGxvY0hlYWRlciA9IG5ldyBDZW50cmFsRGlyZWN0b3J5TG9jNjRIZWFkZXIoKTtcbiAgICAgICAgbG9jSGVhZGVyLnJlYWQoXG4gICAgICAgICAgICBidWZmZXIuc2xpY2Uob3AubGFzdEJ1ZmZlclBvc2l0aW9uLCBvcC5sYXN0QnVmZmVyUG9zaXRpb24gKyBjb25zdHMuRU5ETDY0SERSKVxuICAgICAgICApO1xuICAgICAgICBjb25zdCByZWFkTGVuZ3RoID0gZmlsZVNpemUgLSBsb2NIZWFkZXIuaGVhZGVyT2Zmc2V0O1xuICAgICAgICBvcCA9IHtcbiAgICAgICAgICAgIHdpbjogb3Aud2luLFxuICAgICAgICAgICAgdG90YWxSZWFkTGVuZ3RoOiByZWFkTGVuZ3RoLFxuICAgICAgICAgICAgbWluUG9zOiBsb2NIZWFkZXIuaGVhZGVyT2Zmc2V0LFxuICAgICAgICAgICAgbGFzdFBvczogb3AubGFzdFBvcyxcbiAgICAgICAgICAgIGNodW5rU2l6ZTogb3AuY2h1bmtTaXplLFxuICAgICAgICAgICAgZmlyc3RCeXRlOiBjb25zdHMuRU5ENjRTSUdGSVJTVCxcbiAgICAgICAgICAgIHNpZzogY29uc3RzLkVORDY0U0lHLFxuICAgICAgICAgICAgY29tcGxldGU6IHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlDb21wbGV0ZSxcbiAgICAgICAgfTtcbiAgICAgICAgb3Aud2luLnJlYWQoZmlsZVNpemUgLSBvcC5jaHVua1NpemUsIG9wLmNodW5rU2l6ZSwgcmVhZFVudGlsRm91bmRDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUNvbXBsZXRlKCkge1xuICAgICAgICBjb25zdCBidWZmZXIgPSBvcC53aW4uYnVmZmVyO1xuICAgICAgICBjb25zdCB6aXA2NGNkID0gbmV3IENlbnRyYWxEaXJlY3RvcnlaaXA2NEhlYWRlcigpO1xuICAgICAgICB6aXA2NGNkLnJlYWQoYnVmZmVyLnNsaWNlKG9wLmxhc3RCdWZmZXJQb3NpdGlvbiwgb3AubGFzdEJ1ZmZlclBvc2l0aW9uICsgY29uc3RzLkVORDY0SERSKSk7XG4gICAgICAgIHRoYXQuY2VudHJhbERpcmVjdG9yeS52b2x1bWVFbnRyaWVzID0gemlwNjRjZC52b2x1bWVFbnRyaWVzO1xuICAgICAgICB0aGF0LmNlbnRyYWxEaXJlY3RvcnkudG90YWxFbnRyaWVzID0gemlwNjRjZC50b3RhbEVudHJpZXM7XG4gICAgICAgIHRoYXQuY2VudHJhbERpcmVjdG9yeS5zaXplID0gemlwNjRjZC5zaXplO1xuICAgICAgICB0aGF0LmNlbnRyYWxEaXJlY3Rvcnkub2Zmc2V0ID0gemlwNjRjZC5vZmZzZXQ7XG4gICAgICAgIHRoYXQuZW50cmllc0NvdW50ID0gemlwNjRjZC52b2x1bWVFbnRyaWVzO1xuICAgICAgICBvcCA9IHt9O1xuICAgICAgICByZWFkRW50cmllcygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRFbnRyaWVzKCkge1xuICAgICAgICBvcCA9IHtcbiAgICAgICAgICAgIHdpbjogbmV3IEZpbGVXaW5kb3dCdWZmZXIoZmQpLFxuICAgICAgICAgICAgcG9zOiBjZW50cmFsRGlyZWN0b3J5Lm9mZnNldCxcbiAgICAgICAgICAgIGNodW5rU2l6ZSxcbiAgICAgICAgICAgIGVudHJpZXNMZWZ0OiBjZW50cmFsRGlyZWN0b3J5LnZvbHVtZUVudHJpZXMsXG4gICAgICAgIH07XG4gICAgICAgIG9wLndpbi5yZWFkKG9wLnBvcywgTWF0aC5taW4oY2h1bmtTaXplLCBmaWxlU2l6ZSAtIG9wLnBvcyksIHJlYWRFbnRyaWVzQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRFbnRyaWVzQ2FsbGJhY2soZXJyLCBieXRlc1JlYWQpIHtcbiAgICAgICAgaWYgKGVyciB8fCAhYnl0ZXNSZWFkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIGVyciB8fCBuZXcgRXJyb3IoJ0VudHJpZXMgcmVhZCBlcnJvcicpKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYnVmZmVyUG9zID0gb3AucG9zIC0gb3Aud2luLnBvc2l0aW9uO1xuICAgICAgICBsZXQgZW50cnkgPSBvcC5lbnRyeTtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gb3Aud2luLmJ1ZmZlcjtcbiAgICAgICAgY29uc3QgYnVmZmVyTGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHdoaWxlIChvcC5lbnRyaWVzTGVmdCA+IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5ID0gbmV3IFppcEVudHJ5KCk7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5LnJlYWRIZWFkZXIoYnVmZmVyLCBidWZmZXJQb3MpO1xuICAgICAgICAgICAgICAgICAgICBlbnRyeS5oZWFkZXJPZmZzZXQgPSBvcC53aW4ucG9zaXRpb24gKyBidWZmZXJQb3M7XG4gICAgICAgICAgICAgICAgICAgIG9wLmVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgICAgICAgICAgIG9wLnBvcyArPSBjb25zdHMuQ0VOSERSO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXJQb3MgKz0gY29uc3RzLkNFTkhEUjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgZW50cnlIZWFkZXJTaXplID0gZW50cnkuZm5hbWVMZW4gKyBlbnRyeS5leHRyYUxlbiArIGVudHJ5LmNvbUxlbjtcbiAgICAgICAgICAgICAgICBjb25zdCBhZHZhbmNlQnl0ZXMgPSBlbnRyeUhlYWRlclNpemUgKyAob3AuZW50cmllc0xlZnQgPiAxID8gY29uc3RzLkNFTkhEUiA6IDApO1xuICAgICAgICAgICAgICAgIGlmIChidWZmZXJMZW5ndGggLSBidWZmZXJQb3MgPCBhZHZhbmNlQnl0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgb3Aud2luLm1vdmVSaWdodChjaHVua1NpemUsIHJlYWRFbnRyaWVzQ2FsbGJhY2ssIGJ1ZmZlclBvcyk7XG4gICAgICAgICAgICAgICAgICAgIG9wLm1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVudHJ5LnJlYWQoYnVmZmVyLCBidWZmZXJQb3MsIHRleHREZWNvZGVyKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbmZpZy5za2lwRW50cnlOYW1lVmFsaWRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeS52YWxpZGF0ZU5hbWUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVudHJpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cmllc1tlbnRyeS5uYW1lXSA9IGVudHJ5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGF0LmVtaXQoJ2VudHJ5JywgZW50cnkpO1xuICAgICAgICAgICAgICAgIG9wLmVudHJ5ID0gZW50cnkgPSBudWxsO1xuICAgICAgICAgICAgICAgIG9wLmVudHJpZXNMZWZ0LS07XG4gICAgICAgICAgICAgICAgb3AucG9zICs9IGVudHJ5SGVhZGVyU2l6ZTtcbiAgICAgICAgICAgICAgICBidWZmZXJQb3MgKz0gZW50cnlIZWFkZXJTaXplO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5lbWl0KCdyZWFkeScpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoYXQuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hlY2tFbnRyaWVzRXhpc3QoKSB7XG4gICAgICAgIGlmICghZW50cmllcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzdG9yZUVudHJpZXMgZGlzYWJsZWQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncmVhZHknLCB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiByZWFkeTtcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRoaXMuZW50cnkgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICBjaGVja0VudHJpZXNFeGlzdCgpO1xuICAgICAgICByZXR1cm4gZW50cmllc1tuYW1lXTtcbiAgICB9O1xuXG4gICAgdGhpcy5lbnRyaWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGVja0VudHJpZXNFeGlzdCgpO1xuICAgICAgICByZXR1cm4gZW50cmllcztcbiAgICB9O1xuXG4gICAgdGhpcy5zdHJlYW0gPSBmdW5jdGlvbiAoZW50cnksIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wZW5FbnRyeShcbiAgICAgICAgICAgIGVudHJ5LFxuICAgICAgICAgICAgKGVyciwgZW50cnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBkYXRhT2Zmc2V0KGVudHJ5KTtcbiAgICAgICAgICAgICAgICBsZXQgZW50cnlTdHJlYW0gPSBuZXcgRW50cnlEYXRhUmVhZGVyU3RyZWFtKGZkLCBvZmZzZXQsIGVudHJ5LmNvbXByZXNzZWRTaXplKTtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkubWV0aG9kID09PSBjb25zdHMuU1RPUkVEKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmcgdG8gZG9cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5Lm1ldGhvZCA9PT0gY29uc3RzLkRFRkxBVEVEKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5U3RyZWFtID0gZW50cnlTdHJlYW0ucGlwZSh6bGliLmNyZWF0ZUluZmxhdGVSYXcoKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcignVW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Q6ICcgKyBlbnRyeS5tZXRob2QpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNhblZlcmlmeUNyYyhlbnRyeSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cnlTdHJlYW0gPSBlbnRyeVN0cmVhbS5waXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEVudHJ5VmVyaWZ5U3RyZWFtKGVudHJ5U3RyZWFtLCBlbnRyeS5jcmMsIGVudHJ5LnNpemUpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGVudHJ5U3RyZWFtKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuICAgIH07XG5cbiAgICB0aGlzLmVudHJ5RGF0YVN5bmMgPSBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgbGV0IGVyciA9IG51bGw7XG4gICAgICAgIHRoaXMub3BlbkVudHJ5KFxuICAgICAgICAgICAgZW50cnksXG4gICAgICAgICAgICAoZSwgZW4pID0+IHtcbiAgICAgICAgICAgICAgICBlcnIgPSBlO1xuICAgICAgICAgICAgICAgIGVudHJ5ID0gZW47XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRhdGEgPSBCdWZmZXIuYWxsb2MoZW50cnkuY29tcHJlc3NlZFNpemUpO1xuICAgICAgICBuZXcgRnNSZWFkKGZkLCBkYXRhLCAwLCBlbnRyeS5jb21wcmVzc2VkU2l6ZSwgZGF0YU9mZnNldChlbnRyeSksIChlKSA9PiB7XG4gICAgICAgICAgICBlcnIgPSBlO1xuICAgICAgICB9KS5yZWFkKHRydWUpO1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVudHJ5Lm1ldGhvZCA9PT0gY29uc3RzLlNUT1JFRCkge1xuICAgICAgICAgICAgLy8gbm90aGluZyB0byBkb1xuICAgICAgICB9IGVsc2UgaWYgKGVudHJ5Lm1ldGhvZCA9PT0gY29uc3RzLkRFRkxBVEVEIHx8IGVudHJ5Lm1ldGhvZCA9PT0gY29uc3RzLkVOSEFOQ0VEX0RFRkxBVEVEKSB7XG4gICAgICAgICAgICBkYXRhID0gemxpYi5pbmZsYXRlUmF3U3luYyhkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Q6ICcgKyBlbnRyeS5tZXRob2QpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCAhPT0gZW50cnkuc2l6ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHNpemUnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FuVmVyaWZ5Q3JjKGVudHJ5KSkge1xuICAgICAgICAgICAgY29uc3QgdmVyaWZ5ID0gbmV3IENyY1ZlcmlmeShlbnRyeS5jcmMsIGVudHJ5LnNpemUpO1xuICAgICAgICAgICAgdmVyaWZ5LmRhdGEoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfTtcblxuICAgIHRoaXMub3BlbkVudHJ5ID0gZnVuY3Rpb24gKGVudHJ5LCBjYWxsYmFjaywgc3luYykge1xuICAgICAgICBpZiAodHlwZW9mIGVudHJ5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY2hlY2tFbnRyaWVzRXhpc3QoKTtcbiAgICAgICAgICAgIGVudHJ5ID0gZW50cmllc1tlbnRyeV07XG4gICAgICAgICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcignRW50cnkgbm90IGZvdW5kJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghZW50cnkuaXNGaWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdFbnRyeSBpcyBub3QgZmlsZScpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZkKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdBcmNoaXZlIGNsb3NlZCcpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBidWZmZXIgPSBCdWZmZXIuYWxsb2MoY29uc3RzLkxPQ0hEUik7XG4gICAgICAgIG5ldyBGc1JlYWQoZmQsIGJ1ZmZlciwgMCwgYnVmZmVyLmxlbmd0aCwgZW50cnkub2Zmc2V0LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcmVhZEV4O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBlbnRyeS5yZWFkRGF0YUhlYWRlcihidWZmZXIpO1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5lbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVhZEV4ID0gbmV3IEVycm9yKCdFbnRyeSBlbmNyeXB0ZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIHJlYWRFeCA9IGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbGJhY2socmVhZEV4LCBlbnRyeSk7XG4gICAgICAgIH0pLnJlYWQoc3luYyk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGRhdGFPZmZzZXQoZW50cnkpIHtcbiAgICAgICAgcmV0dXJuIGVudHJ5Lm9mZnNldCArIGNvbnN0cy5MT0NIRFIgKyBlbnRyeS5mbmFtZUxlbiArIGVudHJ5LmV4dHJhTGVuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhblZlcmlmeUNyYyhlbnRyeSkge1xuICAgICAgICAvLyBpZiBiaXQgMyAoMHgwOCkgb2YgdGhlIGdlbmVyYWwtcHVycG9zZSBmbGFncyBmaWVsZCBpcyBzZXQsIHRoZW4gdGhlIENSQy0zMiBhbmQgZmlsZSBzaXplcyBhcmUgbm90IGtub3duIHdoZW4gdGhlIGhlYWRlciBpcyB3cml0dGVuXG4gICAgICAgIHJldHVybiAoZW50cnkuZmxhZ3MgJiAweDgpICE9PSAweDg7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0cmFjdChlbnRyeSwgb3V0UGF0aCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhhdC5zdHJlYW0oZW50cnksIChlcnIsIHN0bSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBmc1N0bSwgZXJyVGhyb3duO1xuICAgICAgICAgICAgICAgIHN0bS5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVyclRocm93biA9IGVycjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZzU3RtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG0udW5waXBlKGZzU3RtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzU3RtLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBmcy5vcGVuKG91dFBhdGgsICd3JywgKGVyciwgZmRGaWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJUaHJvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLmNsb3NlKGZkLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyVGhyb3duKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZzU3RtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0ob3V0UGF0aCwgeyBmZDogZmRGaWxlIH0pO1xuICAgICAgICAgICAgICAgICAgICBmc1N0bS5vbignZmluaXNoJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5lbWl0KCdleHRyYWN0JywgZW50cnksIG91dFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcnJUaHJvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RtLnBpcGUoZnNTdG0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVEaXJlY3RvcmllcyhiYXNlRGlyLCBkaXJzLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoIWRpcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGlyID0gZGlycy5zaGlmdCgpO1xuICAgICAgICBkaXIgPSBwYXRoLmpvaW4oYmFzZURpciwgcGF0aC5qb2luKC4uLmRpcikpO1xuICAgICAgICBmcy5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgIT09ICdFRVhJU1QnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjcmVhdGVEaXJlY3RvcmllcyhiYXNlRGlyLCBkaXJzLCBjYWxsYmFjayk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4dHJhY3RGaWxlcyhiYXNlRGlyLCBiYXNlUmVsUGF0aCwgZmlsZXMsIGNhbGxiYWNrLCBleHRyYWN0ZWRDb3VudCkge1xuICAgICAgICBpZiAoIWZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIGV4dHJhY3RlZENvdW50KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaWxlID0gZmlsZXMuc2hpZnQoKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IHBhdGguam9pbihiYXNlRGlyLCBmaWxlLm5hbWUucmVwbGFjZShiYXNlUmVsUGF0aCwgJycpKTtcbiAgICAgICAgZXh0cmFjdChmaWxlLCB0YXJnZXRQYXRoLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgZXh0cmFjdGVkQ291bnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXh0cmFjdEZpbGVzKGJhc2VEaXIsIGJhc2VSZWxQYXRoLCBmaWxlcywgY2FsbGJhY2ssIGV4dHJhY3RlZENvdW50ICsgMSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuZXh0cmFjdCA9IGZ1bmN0aW9uIChlbnRyeSwgb3V0UGF0aCwgY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGVudHJ5TmFtZSA9IGVudHJ5IHx8ICcnO1xuICAgICAgICBpZiAodHlwZW9mIGVudHJ5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZW50cnkgPSB0aGlzLmVudHJ5KGVudHJ5KTtcbiAgICAgICAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICAgICAgICAgIGVudHJ5TmFtZSA9IGVudHJ5Lm5hbWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeU5hbWUubGVuZ3RoICYmIGVudHJ5TmFtZVtlbnRyeU5hbWUubGVuZ3RoIC0gMV0gIT09ICcvJykge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeU5hbWUgKz0gJy8nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVudHJ5IHx8IGVudHJ5LmlzRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlcyA9IFtdLFxuICAgICAgICAgICAgICAgIGRpcnMgPSBbXSxcbiAgICAgICAgICAgICAgICBhbGxEaXJzID0ge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGUgaW4gZW50cmllcykge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGVudHJpZXMsIGUpICYmXG4gICAgICAgICAgICAgICAgICAgIGUubGFzdEluZGV4T2YoZW50cnlOYW1lLCAwKSA9PT0gMFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVsUGF0aCA9IGUucmVwbGFjZShlbnRyeU5hbWUsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRFbnRyeSA9IGVudHJpZXNbZV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZEVudHJ5LmlzRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMucHVzaChjaGlsZEVudHJ5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbFBhdGggPSBwYXRoLmRpcm5hbWUocmVsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbFBhdGggJiYgIWFsbERpcnNbcmVsUGF0aF0gJiYgcmVsUGF0aCAhPT0gJy4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxEaXJzW3JlbFBhdGhdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0cyA9IHJlbFBhdGguc3BsaXQoJy8nKS5maWx0ZXIoKGYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcnMucHVzaChwYXJ0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMCwgcGFydHMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydHNQYXRoID0gcGFydHMuam9pbignLycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbGxEaXJzW3BhcnRzUGF0aF0gfHwgcGFydHNQYXRoID09PSAnLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbERpcnNbcGFydHNQYXRoXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlycy5wdXNoKHBhcnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpcnMuc29ydCgoeCwgeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB4Lmxlbmd0aCAtIHkubGVuZ3RoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZGlycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVEaXJlY3RvcmllcyhvdXRQYXRoLCBkaXJzLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHRyYWN0RmlsZXMob3V0UGF0aCwgZW50cnlOYW1lLCBmaWxlcywgY2FsbGJhY2ssIDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGV4dHJhY3RGaWxlcyhvdXRQYXRoLCBlbnRyeU5hbWUsIGZpbGVzLCBjYWxsYmFjaywgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcy5zdGF0KG91dFBhdGgsIChlcnIsIHN0YXQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdCAmJiBzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdChlbnRyeSwgcGF0aC5qb2luKG91dFBhdGgsIHBhdGguYmFzZW5hbWUoZW50cnkubmFtZSkpLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdChlbnRyeSwgb3V0UGF0aCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuY2xvc2UgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGNsb3NlZCB8fCAhZmQpIHtcbiAgICAgICAgICAgIGNsb3NlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGZzLmNsb3NlKGZkLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgZmQgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9yaWdpbmFsRW1pdCA9IGV2ZW50cy5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQ7XG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFjbG9zZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbEVtaXQuY2FsbCh0aGlzLCAuLi5hcmdzKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5TdHJlYW1aaXAuc2V0RnMgPSBmdW5jdGlvbiAoY3VzdG9tRnMpIHtcbiAgICBmcyA9IGN1c3RvbUZzO1xufTtcblxuU3RyZWFtWmlwLmRlYnVnTG9nID0gKC4uLmFyZ3MpID0+IHtcbiAgICBpZiAoU3RyZWFtWmlwLmRlYnVnKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xuICAgIH1cbn07XG5cbnV0aWwuaW5oZXJpdHMoU3RyZWFtWmlwLCBldmVudHMuRXZlbnRFbWl0dGVyKTtcblxuY29uc3QgcHJvcFppcCA9IFN5bWJvbCgnemlwJyk7XG5cblN0cmVhbVppcC5hc3luYyA9IGNsYXNzIFN0cmVhbVppcEFzeW5jIGV4dGVuZHMgZXZlbnRzLkV2ZW50RW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgY29uc3QgemlwID0gbmV3IFN0cmVhbVppcChjb25maWcpO1xuXG4gICAgICAgIHppcC5vbignZW50cnknLCAoZW50cnkpID0+IHRoaXMuZW1pdCgnZW50cnknLCBlbnRyeSkpO1xuICAgICAgICB6aXAub24oJ2V4dHJhY3QnLCAoZW50cnksIG91dFBhdGgpID0+IHRoaXMuZW1pdCgnZXh0cmFjdCcsIGVudHJ5LCBvdXRQYXRoKSk7XG5cbiAgICAgICAgdGhpc1twcm9wWmlwXSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHppcC5vbigncmVhZHknLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgemlwLnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh6aXApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB6aXAub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IGVudHJpZXNDb3VudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbcHJvcFppcF0udGhlbigoemlwKSA9PiB6aXAuZW50cmllc0NvdW50KTtcbiAgICB9XG5cbiAgICBnZXQgY29tbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbcHJvcFppcF0udGhlbigoemlwKSA9PiB6aXAuY29tbWVudCk7XG4gICAgfVxuXG4gICAgYXN5bmMgZW50cnkobmFtZSkge1xuICAgICAgICBjb25zdCB6aXAgPSBhd2FpdCB0aGlzW3Byb3BaaXBdO1xuICAgICAgICByZXR1cm4gemlwLmVudHJ5KG5hbWUpO1xuICAgIH1cblxuICAgIGFzeW5jIGVudHJpZXMoKSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiB6aXAuZW50cmllcygpO1xuICAgIH1cblxuICAgIGFzeW5jIHN0cmVhbShlbnRyeSkge1xuICAgICAgICBjb25zdCB6aXAgPSBhd2FpdCB0aGlzW3Byb3BaaXBdO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemlwLnN0cmVhbShlbnRyeSwgKGVyciwgc3RtKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHN0bSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGVudHJ5RGF0YShlbnRyeSkge1xuICAgICAgICBjb25zdCBzdG0gPSBhd2FpdCB0aGlzLnN0cmVhbShlbnRyeSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gW107XG4gICAgICAgICAgICBzdG0ub24oJ2RhdGEnLCAoY2h1bmspID0+IGRhdGEucHVzaChjaHVuaykpO1xuICAgICAgICAgICAgc3RtLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShCdWZmZXIuY29uY2F0KGRhdGEpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RtLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBzdG0ucmVtb3ZlQWxsTGlzdGVuZXJzKCdlbmQnKTtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBleHRyYWN0KGVudHJ5LCBvdXRQYXRoKSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6aXAuZXh0cmFjdChlbnRyeSwgb3V0UGF0aCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGNsb3NlKCkge1xuICAgICAgICBjb25zdCB6aXAgPSBhd2FpdCB0aGlzW3Byb3BaaXBdO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemlwLmNsb3NlKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuY2xhc3MgQ2VudHJhbERpcmVjdG9yeUhlYWRlciB7XG4gICAgcmVhZChkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCAhPT0gY29uc3RzLkVOREhEUiB8fCBkYXRhLnJlYWRVSW50MzJMRSgwKSAhPT0gY29uc3RzLkVORFNJRykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNlbnRyYWwgZGlyZWN0b3J5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbnVtYmVyIG9mIGVudHJpZXMgb24gdGhpcyB2b2x1bWVcbiAgICAgICAgdGhpcy52b2x1bWVFbnRyaWVzID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkVORFNVQik7XG4gICAgICAgIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzXG4gICAgICAgIHRoaXMudG90YWxFbnRyaWVzID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkVORFRPVCk7XG4gICAgICAgIC8vIGNlbnRyYWwgZGlyZWN0b3J5IHNpemUgaW4gYnl0ZXNcbiAgICAgICAgdGhpcy5zaXplID0gZGF0YS5yZWFkVUludDMyTEUoY29uc3RzLkVORFNJWik7XG4gICAgICAgIC8vIG9mZnNldCBvZiBmaXJzdCBDRU4gaGVhZGVyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gZGF0YS5yZWFkVUludDMyTEUoY29uc3RzLkVORE9GRik7XG4gICAgICAgIC8vIHppcCBmaWxlIGNvbW1lbnQgbGVuZ3RoXG4gICAgICAgIHRoaXMuY29tbWVudExlbmd0aCA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5FTkRDT00pO1xuICAgIH1cbn1cblxuY2xhc3MgQ2VudHJhbERpcmVjdG9yeUxvYzY0SGVhZGVyIHtcbiAgICByZWFkKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoICE9PSBjb25zdHMuRU5ETDY0SERSIHx8IGRhdGEucmVhZFVJbnQzMkxFKDApICE9PSBjb25zdHMuRU5ETDY0U0lHKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgemlwNjQgY2VudHJhbCBkaXJlY3RvcnkgbG9jYXRvcicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFpJUDY0IEVPQ0QgaGVhZGVyIG9mZnNldFxuICAgICAgICB0aGlzLmhlYWRlck9mZnNldCA9IHJlYWRVSW50NjRMRShkYXRhLCBjb25zdHMuRU5EU1VCKTtcbiAgICB9XG59XG5cbmNsYXNzIENlbnRyYWxEaXJlY3RvcnlaaXA2NEhlYWRlciB7XG4gICAgcmVhZChkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCAhPT0gY29uc3RzLkVORDY0SERSIHx8IGRhdGEucmVhZFVJbnQzMkxFKDApICE9PSBjb25zdHMuRU5ENjRTSUcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjZW50cmFsIGRpcmVjdG9yeScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG51bWJlciBvZiBlbnRyaWVzIG9uIHRoaXMgdm9sdW1lXG4gICAgICAgIHRoaXMudm9sdW1lRW50cmllcyA9IHJlYWRVSW50NjRMRShkYXRhLCBjb25zdHMuRU5ENjRTVUIpO1xuICAgICAgICAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllc1xuICAgICAgICB0aGlzLnRvdGFsRW50cmllcyA9IHJlYWRVSW50NjRMRShkYXRhLCBjb25zdHMuRU5ENjRUT1QpO1xuICAgICAgICAvLyBjZW50cmFsIGRpcmVjdG9yeSBzaXplIGluIGJ5dGVzXG4gICAgICAgIHRoaXMuc2l6ZSA9IHJlYWRVSW50NjRMRShkYXRhLCBjb25zdHMuRU5ENjRTSVopO1xuICAgICAgICAvLyBvZmZzZXQgb2YgZmlyc3QgQ0VOIGhlYWRlclxuICAgICAgICB0aGlzLm9mZnNldCA9IHJlYWRVSW50NjRMRShkYXRhLCBjb25zdHMuRU5ENjRPRkYpO1xuICAgIH1cbn1cblxuY2xhc3MgWmlwRW50cnkge1xuICAgIHJlYWRIZWFkZXIoZGF0YSwgb2Zmc2V0KSB7XG4gICAgICAgIC8vIGRhdGEgc2hvdWxkIGJlIDQ2IGJ5dGVzIGFuZCBzdGFydCB3aXRoIFwiUEsgMDEgMDJcIlxuICAgICAgICBpZiAoZGF0YS5sZW5ndGggPCBvZmZzZXQgKyBjb25zdHMuQ0VOSERSIHx8IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCkgIT09IGNvbnN0cy5DRU5TSUcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBlbnRyeSBoZWFkZXInKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB2ZXJzaW9uIG1hZGUgYnlcbiAgICAgICAgdGhpcy52ZXJNYWRlID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTlZFTSk7XG4gICAgICAgIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTlZFUik7XG4gICAgICAgIC8vIGVuY3J5cHQsIGRlY3J5cHQgZmxhZ3NcbiAgICAgICAgdGhpcy5mbGFncyA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5GTEcpO1xuICAgICAgICAvLyBjb21wcmVzc2lvbiBtZXRob2RcbiAgICAgICAgdGhpcy5tZXRob2QgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOSE9XKTtcbiAgICAgICAgLy8gbW9kaWZpY2F0aW9uIHRpbWUgKDIgYnl0ZXMgdGltZSwgMiBieXRlcyBkYXRlKVxuICAgICAgICBjb25zdCB0aW1lYnl0ZXMgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOVElNKTtcbiAgICAgICAgY29uc3QgZGF0ZWJ5dGVzID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTlRJTSArIDIpO1xuICAgICAgICB0aGlzLnRpbWUgPSBwYXJzZVppcFRpbWUodGltZWJ5dGVzLCBkYXRlYnl0ZXMpO1xuXG4gICAgICAgIC8vIHVuY29tcHJlc3NlZCBmaWxlIGNyYy0zMiB2YWx1ZVxuICAgICAgICB0aGlzLmNyYyA9IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCArIGNvbnN0cy5DRU5DUkMpO1xuICAgICAgICAvLyBjb21wcmVzc2VkIHNpemVcbiAgICAgICAgdGhpcy5jb21wcmVzc2VkU2l6ZSA9IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCArIGNvbnN0cy5DRU5TSVopO1xuICAgICAgICAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuICAgICAgICB0aGlzLnNpemUgPSBkYXRhLnJlYWRVSW50MzJMRShvZmZzZXQgKyBjb25zdHMuQ0VOTEVOKTtcbiAgICAgICAgLy8gZmlsZW5hbWUgbGVuZ3RoXG4gICAgICAgIHRoaXMuZm5hbWVMZW4gPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOTkFNKTtcbiAgICAgICAgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG4gICAgICAgIHRoaXMuZXh0cmFMZW4gPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VORVhUKTtcbiAgICAgICAgLy8gZmlsZSBjb21tZW50IGxlbmd0aFxuICAgICAgICB0aGlzLmNvbUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5DT00pO1xuICAgICAgICAvLyB2b2x1bWUgbnVtYmVyIHN0YXJ0XG4gICAgICAgIHRoaXMuZGlza1N0YXJ0ID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkRTSyk7XG4gICAgICAgIC8vIGludGVybmFsIGZpbGUgYXR0cmlidXRlc1xuICAgICAgICB0aGlzLmluYXR0ciA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5BVFQpO1xuICAgICAgICAvLyBleHRlcm5hbCBmaWxlIGF0dHJpYnV0ZXNcbiAgICAgICAgdGhpcy5hdHRyID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0ICsgY29uc3RzLkNFTkFUWCk7XG4gICAgICAgIC8vIExPQyBoZWFkZXIgb2Zmc2V0XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0ICsgY29uc3RzLkNFTk9GRik7XG4gICAgfVxuXG4gICAgcmVhZERhdGFIZWFkZXIoZGF0YSkge1xuICAgICAgICAvLyAzMCBieXRlcyBhbmQgc2hvdWxkIHN0YXJ0IHdpdGggXCJQS1xcMDAzXFwwMDRcIlxuICAgICAgICBpZiAoZGF0YS5yZWFkVUludDMyTEUoMCkgIT09IGNvbnN0cy5MT0NTSUcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBsb2NhbCBoZWFkZXInKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB2ZXJzaW9uIG5lZWRlZCB0byBleHRyYWN0XG4gICAgICAgIHRoaXMudmVyc2lvbiA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NWRVIpO1xuICAgICAgICAvLyBnZW5lcmFsIHB1cnBvc2UgYml0IGZsYWdcbiAgICAgICAgdGhpcy5mbGFncyA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NGTEcpO1xuICAgICAgICAvLyBjb21wcmVzc2lvbiBtZXRob2RcbiAgICAgICAgdGhpcy5tZXRob2QgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuTE9DSE9XKTtcbiAgICAgICAgLy8gbW9kaWZpY2F0aW9uIHRpbWUgKDIgYnl0ZXMgdGltZSA7IDIgYnl0ZXMgZGF0ZSlcbiAgICAgICAgY29uc3QgdGltZWJ5dGVzID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ1RJTSk7XG4gICAgICAgIGNvbnN0IGRhdGVieXRlcyA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NUSU0gKyAyKTtcbiAgICAgICAgdGhpcy50aW1lID0gcGFyc2VaaXBUaW1lKHRpbWVieXRlcywgZGF0ZWJ5dGVzKTtcblxuICAgICAgICAvLyB1bmNvbXByZXNzZWQgZmlsZSBjcmMtMzIgdmFsdWVcbiAgICAgICAgdGhpcy5jcmMgPSBkYXRhLnJlYWRVSW50MzJMRShjb25zdHMuTE9DQ1JDKSB8fCB0aGlzLmNyYztcbiAgICAgICAgLy8gY29tcHJlc3NlZCBzaXplXG4gICAgICAgIGNvbnN0IGNvbXByZXNzZWRTaXplID0gZGF0YS5yZWFkVUludDMyTEUoY29uc3RzLkxPQ1NJWik7XG4gICAgICAgIGlmIChjb21wcmVzc2VkU2l6ZSAmJiBjb21wcmVzc2VkU2l6ZSAhPT0gY29uc3RzLkVGX1pJUDY0X09SXzMyKSB7XG4gICAgICAgICAgICB0aGlzLmNvbXByZXNzZWRTaXplID0gY29tcHJlc3NlZFNpemU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdW5jb21wcmVzc2VkIHNpemVcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGRhdGEucmVhZFVJbnQzMkxFKGNvbnN0cy5MT0NMRU4pO1xuICAgICAgICBpZiAoc2l6ZSAmJiBzaXplICE9PSBjb25zdHMuRUZfWklQNjRfT1JfMzIpIHtcbiAgICAgICAgICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZmlsZW5hbWUgbGVuZ3RoXG4gICAgICAgIHRoaXMuZm5hbWVMZW4gPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuTE9DTkFNKTtcbiAgICAgICAgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG4gICAgICAgIHRoaXMuZXh0cmFMZW4gPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuTE9DRVhUKTtcbiAgICB9XG5cbiAgICByZWFkKGRhdGEsIG9mZnNldCwgdGV4dERlY29kZXIpIHtcbiAgICAgICAgY29uc3QgbmFtZURhdGEgPSBkYXRhLnNsaWNlKG9mZnNldCwgKG9mZnNldCArPSB0aGlzLmZuYW1lTGVuKSk7XG4gICAgICAgIHRoaXMubmFtZSA9IHRleHREZWNvZGVyXG4gICAgICAgICAgICA/IHRleHREZWNvZGVyLmRlY29kZShuZXcgVWludDhBcnJheShuYW1lRGF0YSkpXG4gICAgICAgICAgICA6IG5hbWVEYXRhLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgIGNvbnN0IGxhc3RDaGFyID0gZGF0YVtvZmZzZXQgLSAxXTtcbiAgICAgICAgdGhpcy5pc0RpcmVjdG9yeSA9IGxhc3RDaGFyID09PSA0NyB8fCBsYXN0Q2hhciA9PT0gOTI7XG5cbiAgICAgICAgaWYgKHRoaXMuZXh0cmFMZW4pIHtcbiAgICAgICAgICAgIHRoaXMucmVhZEV4dHJhKGRhdGEsIG9mZnNldCk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gdGhpcy5leHRyYUxlbjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbW1lbnQgPSB0aGlzLmNvbUxlbiA/IGRhdGEuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyB0aGlzLmNvbUxlbikudG9TdHJpbmcoKSA6IG51bGw7XG4gICAgfVxuXG4gICAgdmFsaWRhdGVOYW1lKCkge1xuICAgICAgICBpZiAoL1xcXFx8Xlxcdys6fF5cXC98KF58XFwvKVxcLlxcLihcXC98JCkvLnRlc3QodGhpcy5uYW1lKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNYWxpY2lvdXMgZW50cnk6ICcgKyB0aGlzLm5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVhZEV4dHJhKGRhdGEsIG9mZnNldCkge1xuICAgICAgICBsZXQgc2lnbmF0dXJlLCBzaXplO1xuICAgICAgICBjb25zdCBtYXhQb3MgPSBvZmZzZXQgKyB0aGlzLmV4dHJhTGVuO1xuICAgICAgICB3aGlsZSAob2Zmc2V0IDwgbWF4UG9zKSB7XG4gICAgICAgICAgICBzaWduYXR1cmUgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICAgICAgICBzaXplID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSAyO1xuICAgICAgICAgICAgaWYgKGNvbnN0cy5JRF9aSVA2NCA9PT0gc2lnbmF0dXJlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZVppcDY0RXh0cmEoZGF0YSwgb2Zmc2V0LCBzaXplKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCArPSBzaXplO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGFyc2VaaXA2NEV4dHJhKGRhdGEsIG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgICAgIGlmIChsZW5ndGggPj0gOCAmJiB0aGlzLnNpemUgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMikge1xuICAgICAgICAgICAgdGhpcy5zaXplID0gcmVhZFVJbnQ2NExFKGRhdGEsIG9mZnNldCk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gODtcbiAgICAgICAgICAgIGxlbmd0aCAtPSA4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPj0gOCAmJiB0aGlzLmNvbXByZXNzZWRTaXplID09PSBjb25zdHMuRUZfWklQNjRfT1JfMzIpIHtcbiAgICAgICAgICAgIHRoaXMuY29tcHJlc3NlZFNpemUgPSByZWFkVUludDY0TEUoZGF0YSwgb2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSA4O1xuICAgICAgICAgICAgbGVuZ3RoIC09IDg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA+PSA4ICYmIHRoaXMub2Zmc2V0ID09PSBjb25zdHMuRUZfWklQNjRfT1JfMzIpIHtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ID0gcmVhZFVJbnQ2NExFKGRhdGEsIG9mZnNldCk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gODtcbiAgICAgICAgICAgIGxlbmd0aCAtPSA4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPj0gNCAmJiB0aGlzLmRpc2tTdGFydCA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzE2KSB7XG4gICAgICAgICAgICB0aGlzLmRpc2tTdGFydCA9IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCk7XG4gICAgICAgICAgICAvLyBvZmZzZXQgKz0gNDsgbGVuZ3RoIC09IDQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgZW5jcnlwdGVkKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuZmxhZ3MgJiBjb25zdHMuRkxHX0VOVFJZX0VOQykgPT09IGNvbnN0cy5GTEdfRU5UUllfRU5DO1xuICAgIH1cblxuICAgIGdldCBpc0ZpbGUoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5pc0RpcmVjdG9yeTtcbiAgICB9XG59XG5cbmNsYXNzIEZzUmVhZCB7XG4gICAgY29uc3RydWN0b3IoZmQsIGJ1ZmZlciwgb2Zmc2V0LCBsZW5ndGgsIHBvc2l0aW9uLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmZkID0gZmQ7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLmJ5dGVzUmVhZCA9IDA7XG4gICAgICAgIHRoaXMud2FpdGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJlYWQoc3luYykge1xuICAgICAgICBTdHJlYW1aaXAuZGVidWdMb2coJ3JlYWQnLCB0aGlzLnBvc2l0aW9uLCB0aGlzLmJ5dGVzUmVhZCwgdGhpcy5sZW5ndGgsIHRoaXMub2Zmc2V0KTtcbiAgICAgICAgdGhpcy53YWl0aW5nID0gdHJ1ZTtcbiAgICAgICAgbGV0IGVycjtcbiAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgIGxldCBieXRlc1JlYWQgPSAwO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBieXRlc1JlYWQgPSBmcy5yZWFkU3luYyhcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mZCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWZmZXIsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2Zmc2V0ICsgdGhpcy5ieXRlc1JlYWQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGVuZ3RoIC0gdGhpcy5ieXRlc1JlYWQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKyB0aGlzLmJ5dGVzUmVhZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgZXJyID0gZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucmVhZENhbGxiYWNrKHN5bmMsIGVyciwgZXJyID8gYnl0ZXNSZWFkIDogbnVsbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcy5yZWFkKFxuICAgICAgICAgICAgICAgIHRoaXMuZmQsXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXIsXG4gICAgICAgICAgICAgICAgdGhpcy5vZmZzZXQgKyB0aGlzLmJ5dGVzUmVhZCxcbiAgICAgICAgICAgICAgICB0aGlzLmxlbmd0aCAtIHRoaXMuYnl0ZXNSZWFkLFxuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKyB0aGlzLmJ5dGVzUmVhZCxcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWRDYWxsYmFjay5iaW5kKHRoaXMsIHN5bmMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVhZENhbGxiYWNrKHN5bmMsIGVyciwgYnl0ZXNSZWFkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYnl0ZXNSZWFkID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhpcy5ieXRlc1JlYWQgKz0gYnl0ZXNSZWFkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlcnIgfHwgIWJ5dGVzUmVhZCB8fCB0aGlzLmJ5dGVzUmVhZCA9PT0gdGhpcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMud2FpdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soZXJyLCB0aGlzLmJ5dGVzUmVhZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlYWQoc3luYyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIEZpbGVXaW5kb3dCdWZmZXIge1xuICAgIGNvbnN0cnVjdG9yKGZkKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygwKTtcbiAgICAgICAgdGhpcy5mZCA9IGZkO1xuICAgICAgICB0aGlzLmZzT3AgPSBudWxsO1xuICAgIH1cblxuICAgIGNoZWNrT3AoKSB7XG4gICAgICAgIGlmICh0aGlzLmZzT3AgJiYgdGhpcy5mc09wLndhaXRpbmcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT3BlcmF0aW9uIGluIHByb2dyZXNzJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkKHBvcywgbGVuZ3RoLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNoZWNrT3AoKTtcbiAgICAgICAgaWYgKHRoaXMuYnVmZmVyLmxlbmd0aCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5idWZmZXIgPSBCdWZmZXIuYWxsb2MobGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zO1xuICAgICAgICB0aGlzLmZzT3AgPSBuZXcgRnNSZWFkKHRoaXMuZmQsIHRoaXMuYnVmZmVyLCAwLCBsZW5ndGgsIHRoaXMucG9zaXRpb24sIGNhbGxiYWNrKS5yZWFkKCk7XG4gICAgfVxuXG4gICAgZXhwYW5kTGVmdChsZW5ndGgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY2hlY2tPcCgpO1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW0J1ZmZlci5hbGxvYyhsZW5ndGgpLCB0aGlzLmJ1ZmZlcl0pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uIC09IGxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb24gPCAwKSB7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZzT3AgPSBuZXcgRnNSZWFkKHRoaXMuZmQsIHRoaXMuYnVmZmVyLCAwLCBsZW5ndGgsIHRoaXMucG9zaXRpb24sIGNhbGxiYWNrKS5yZWFkKCk7XG4gICAgfVxuXG4gICAgZXhwYW5kUmlnaHQobGVuZ3RoLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNoZWNrT3AoKTtcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW3RoaXMuYnVmZmVyLCBCdWZmZXIuYWxsb2MobGVuZ3RoKV0pO1xuICAgICAgICB0aGlzLmZzT3AgPSBuZXcgRnNSZWFkKFxuICAgICAgICAgICAgdGhpcy5mZCxcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgbGVuZ3RoLFxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArIG9mZnNldCxcbiAgICAgICAgICAgIGNhbGxiYWNrXG4gICAgICAgICkucmVhZCgpO1xuICAgIH1cblxuICAgIG1vdmVSaWdodChsZW5ndGgsIGNhbGxiYWNrLCBzaGlmdCkge1xuICAgICAgICB0aGlzLmNoZWNrT3AoKTtcbiAgICAgICAgaWYgKHNoaWZ0KSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlci5jb3B5KHRoaXMuYnVmZmVyLCAwLCBzaGlmdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaGlmdCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBzaGlmdDtcbiAgICAgICAgdGhpcy5mc09wID0gbmV3IEZzUmVhZChcbiAgICAgICAgICAgIHRoaXMuZmQsXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlcixcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyLmxlbmd0aCAtIHNoaWZ0LFxuICAgICAgICAgICAgc2hpZnQsXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICsgdGhpcy5idWZmZXIubGVuZ3RoIC0gc2hpZnQsXG4gICAgICAgICAgICBjYWxsYmFja1xuICAgICAgICApLnJlYWQoKTtcbiAgICB9XG59XG5cbmNsYXNzIEVudHJ5RGF0YVJlYWRlclN0cmVhbSBleHRlbmRzIHN0cmVhbS5SZWFkYWJsZSB7XG4gICAgY29uc3RydWN0b3IoZmQsIG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZmQgPSBmZDtcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgICB0aGlzLnBvcyA9IDA7XG4gICAgICAgIHRoaXMucmVhZENhbGxiYWNrID0gdGhpcy5yZWFkQ2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBfcmVhZChuKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhNYXRoLm1pbihuLCB0aGlzLmxlbmd0aCAtIHRoaXMucG9zKSk7XG4gICAgICAgIGlmIChidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICBmcy5yZWFkKHRoaXMuZmQsIGJ1ZmZlciwgMCwgYnVmZmVyLmxlbmd0aCwgdGhpcy5vZmZzZXQgKyB0aGlzLnBvcywgdGhpcy5yZWFkQ2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wdXNoKG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVhZENhbGxiYWNrKGVyciwgYnl0ZXNSZWFkLCBidWZmZXIpIHtcbiAgICAgICAgdGhpcy5wb3MgKz0gYnl0ZXNSZWFkO1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgIHRoaXMucHVzaChudWxsKTtcbiAgICAgICAgfSBlbHNlIGlmICghYnl0ZXNSZWFkKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2gobnVsbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoYnl0ZXNSZWFkICE9PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyID0gYnVmZmVyLnNsaWNlKDAsIGJ5dGVzUmVhZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnB1c2goYnVmZmVyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgRW50cnlWZXJpZnlTdHJlYW0gZXh0ZW5kcyBzdHJlYW0uVHJhbnNmb3JtIHtcbiAgICBjb25zdHJ1Y3RvcihiYXNlU3RtLCBjcmMsIHNpemUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy52ZXJpZnkgPSBuZXcgQ3JjVmVyaWZ5KGNyYywgc2l6ZSk7XG4gICAgICAgIGJhc2VTdG0ub24oJ2Vycm9yJywgKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3RyYW5zZm9ybShkYXRhLCBlbmNvZGluZywgY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGVycjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMudmVyaWZ5LmRhdGEoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2soZXJyLCBkYXRhKTtcbiAgICB9XG59XG5cbmNsYXNzIENyY1ZlcmlmeSB7XG4gICAgY29uc3RydWN0b3IoY3JjLCBzaXplKSB7XG4gICAgICAgIHRoaXMuY3JjID0gY3JjO1xuICAgICAgICB0aGlzLnNpemUgPSBzaXplO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgY3JjOiB+MCxcbiAgICAgICAgICAgIHNpemU6IDAsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZGF0YShkYXRhKSB7XG4gICAgICAgIGNvbnN0IGNyY1RhYmxlID0gQ3JjVmVyaWZ5LmdldENyY1RhYmxlKCk7XG4gICAgICAgIGxldCBjcmMgPSB0aGlzLnN0YXRlLmNyYztcbiAgICAgICAgbGV0IG9mZiA9IDA7XG4gICAgICAgIGxldCBsZW4gPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKC0tbGVuID49IDApIHtcbiAgICAgICAgICAgIGNyYyA9IGNyY1RhYmxlWyhjcmMgXiBkYXRhW29mZisrXSkgJiAweGZmXSBeIChjcmMgPj4+IDgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhdGUuY3JjID0gY3JjO1xuICAgICAgICB0aGlzLnN0YXRlLnNpemUgKz0gZGF0YS5sZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNpemUgPj0gdGhpcy5zaXplKSB7XG4gICAgICAgICAgICBjb25zdCBidWYgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgICAgICAgICBidWYud3JpdGVJbnQzMkxFKH50aGlzLnN0YXRlLmNyYyAmIDB4ZmZmZmZmZmYsIDApO1xuICAgICAgICAgICAgY3JjID0gYnVmLnJlYWRVSW50MzJMRSgwKTtcbiAgICAgICAgICAgIGlmIChjcmMgIT09IHRoaXMuY3JjKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIENSQycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2l6ZSAhPT0gdGhpcy5zaXplKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHNpemUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRDcmNUYWJsZSgpIHtcbiAgICAgICAgbGV0IGNyY1RhYmxlID0gQ3JjVmVyaWZ5LmNyY1RhYmxlO1xuICAgICAgICBpZiAoIWNyY1RhYmxlKSB7XG4gICAgICAgICAgICBDcmNWZXJpZnkuY3JjVGFibGUgPSBjcmNUYWJsZSA9IFtdO1xuICAgICAgICAgICAgY29uc3QgYiA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICAgICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgMjU2OyBuKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgYyA9IG47XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgayA9IDg7IC0tayA+PSAwOyApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChjICYgMSkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgPSAweGVkYjg4MzIwIF4gKGMgPj4+IDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IGMgPj4+IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGMgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGIud3JpdGVJbnQzMkxFKGMsIDApO1xuICAgICAgICAgICAgICAgICAgICBjID0gYi5yZWFkVUludDMyTEUoMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNyY1RhYmxlW25dID0gYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JjVGFibGU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZVppcFRpbWUodGltZWJ5dGVzLCBkYXRlYnl0ZXMpIHtcbiAgICBjb25zdCB0aW1lYml0cyA9IHRvQml0cyh0aW1lYnl0ZXMsIDE2KTtcbiAgICBjb25zdCBkYXRlYml0cyA9IHRvQml0cyhkYXRlYnl0ZXMsIDE2KTtcblxuICAgIGNvbnN0IG10ID0ge1xuICAgICAgICBoOiBwYXJzZUludCh0aW1lYml0cy5zbGljZSgwLCA1KS5qb2luKCcnKSwgMiksXG4gICAgICAgIG06IHBhcnNlSW50KHRpbWViaXRzLnNsaWNlKDUsIDExKS5qb2luKCcnKSwgMiksXG4gICAgICAgIHM6IHBhcnNlSW50KHRpbWViaXRzLnNsaWNlKDExLCAxNikuam9pbignJyksIDIpICogMixcbiAgICAgICAgWTogcGFyc2VJbnQoZGF0ZWJpdHMuc2xpY2UoMCwgNykuam9pbignJyksIDIpICsgMTk4MCxcbiAgICAgICAgTTogcGFyc2VJbnQoZGF0ZWJpdHMuc2xpY2UoNywgMTEpLmpvaW4oJycpLCAyKSxcbiAgICAgICAgRDogcGFyc2VJbnQoZGF0ZWJpdHMuc2xpY2UoMTEsIDE2KS5qb2luKCcnKSwgMiksXG4gICAgfTtcbiAgICBjb25zdCBkdF9zdHIgPSBbbXQuWSwgbXQuTSwgbXQuRF0uam9pbignLScpICsgJyAnICsgW210LmgsIG10Lm0sIG10LnNdLmpvaW4oJzonKSArICcgR01UKzAnO1xuICAgIHJldHVybiBuZXcgRGF0ZShkdF9zdHIpLmdldFRpbWUoKTtcbn1cblxuZnVuY3Rpb24gdG9CaXRzKGRlYywgc2l6ZSkge1xuICAgIGxldCBiID0gKGRlYyA+Pj4gMCkudG9TdHJpbmcoMik7XG4gICAgd2hpbGUgKGIubGVuZ3RoIDwgc2l6ZSkge1xuICAgICAgICBiID0gJzAnICsgYjtcbiAgICB9XG4gICAgcmV0dXJuIGIuc3BsaXQoJycpO1xufVxuXG5mdW5jdGlvbiByZWFkVUludDY0TEUoYnVmZmVyLCBvZmZzZXQpIHtcbiAgICByZXR1cm4gYnVmZmVyLnJlYWRVSW50MzJMRShvZmZzZXQgKyA0KSAqIDB4MDAwMDAwMDEwMDAwMDAwMCArIGJ1ZmZlci5yZWFkVUludDMyTEUob2Zmc2V0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdHJlYW1aaXA7XG4iLCAiaW1wb3J0IHsgc2hvd1RvYXN0LCBUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IEJpdHdhcmRlbiB9IGZyb20gXCJ+L2FwaS9iaXR3YXJkZW5cIjtcbmltcG9ydCB7IFZBVUxUX0xPQ0tfTUVTU0FHRVMgfSBmcm9tIFwifi9jb25zdGFudHMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgU2Vzc2lvblN0b3JhZ2UgfSBmcm9tIFwifi9jb250ZXh0L3Nlc3Npb24vdXRpbHNcIjtcblxuYXN5bmMgZnVuY3Rpb24gbG9ja1ZhdWx0Q29tbWFuZCgpIHtcbiAgY29uc3QgdG9hc3QgPSBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuQW5pbWF0ZWQsIFwiTG9ja2luZyB2YXVsdC4uLlwiLCBcIlBsZWFzZSB3YWl0XCIpO1xuICB0cnkge1xuICAgIGNvbnN0IFt0b2tlbl0gPSBhd2FpdCBTZXNzaW9uU3RvcmFnZS5nZXRTYXZlZFNlc3Npb24oKTtcbiAgICBpZiAoIXRva2VuKSB7XG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLkZhaWx1cmU7XG4gICAgICB0b2FzdC50aXRsZSA9IFwiTm8gc2Vzc2lvbiBmb3VuZFwiO1xuICAgICAgdG9hc3QubWVzc2FnZSA9IFwiQWxyZWFkeSBsb2NrZWQgb3Igbm90IGxvZ2dlZCBpblwiO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJpdHdhcmRlbiA9IGF3YWl0IG5ldyBCaXR3YXJkZW4odG9hc3QpLmluaXRpYWxpemUoKTtcblxuICAgIGF3YWl0IGJpdHdhcmRlbi53aXRoU2Vzc2lvbih0b2tlbikubG9jayh7IHJlYXNvbjogVkFVTFRfTE9DS19NRVNTQUdFUy5NQU5VQUwgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLkZhaWx1cmUsIFwiRmFpbGVkIHRvIGxvY2sgdmF1bHRcIik7XG4gIH1cblxuICB0cnkge1xuICAgIGF3YWl0IFNlc3Npb25TdG9yYWdlLmNsZWFyU2Vzc2lvbigpO1xuXG4gICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5TdWNjZXNzO1xuICAgIHRvYXN0LnRpdGxlID0gXCJWYXVsdCBzdWNjZXNzZnVsbHkgbG9ja2VkXCI7XG4gICAgdG9hc3QubWVzc2FnZSA9IHVuZGVmaW5lZDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuRmFpbHVyZSwgXCJGYWlsZWQgdG8gbG9jayB2YXVsdFwiKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBsb2NrVmF1bHRDb21tYW5kO1xuIiwgImltcG9ydCB7IGVudmlyb25tZW50LCBnZXRQcmVmZXJlbmNlVmFsdWVzLCBMb2NhbFN0b3JhZ2UsIG9wZW4sIHNob3dUb2FzdCwgVG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBleGVjYSwgRXhlY2FDaGlsZFByb2Nlc3MsIEV4ZWNhRXJyb3IsIEV4ZWNhUmV0dXJuVmFsdWUgfSBmcm9tIFwiZXhlY2FcIjtcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHVubGlua1N5bmMsIHdyaXRlRmlsZVN5bmMsIGFjY2Vzc1N5bmMsIGNvbnN0YW50cywgY2htb2RTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBMT0NBTF9TVE9SQUdFX0tFWSwgREVGQVVMVF9TRVJWRVJfVVJMLCBDQUNIRV9LRVlTIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcbmltcG9ydCB7IFZhdWx0U3RhdGUsIFZhdWx0U3RhdHVzIH0gZnJvbSBcIn4vdHlwZXMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zIH0gZnJvbSBcIn4vdHlwZXMvcGFzc3dvcmRzXCI7XG5pbXBvcnQgeyBGb2xkZXIsIEl0ZW0sIEl0ZW1UeXBlLCBMb2dpbiB9IGZyb20gXCJ+L3R5cGVzL3ZhdWx0XCI7XG5pbXBvcnQgeyBnZXRQYXNzd29yZEdlbmVyYXRpbmdBcmdzIH0gZnJvbSBcIn4vdXRpbHMvcGFzc3dvcmRzXCI7XG5pbXBvcnQgeyBnZXRTZXJ2ZXJVcmxQcmVmZXJlbmNlIH0gZnJvbSBcIn4vdXRpbHMvcHJlZmVyZW5jZXNcIjtcbmltcG9ydCB7XG4gIEVuc3VyZUNsaUJpbkVycm9yLFxuICBJbnN0YWxsZWRDTElOb3RGb3VuZEVycm9yLFxuICBNYW51YWxseVRocm93bkVycm9yLFxuICBOb3RMb2dnZWRJbkVycm9yLFxuICBQcmVtaXVtRmVhdHVyZUVycm9yLFxuICBTZW5kSW52YWxpZFBhc3N3b3JkRXJyb3IsXG4gIFNlbmROZWVkc1Bhc3N3b3JkRXJyb3IsXG4gIHRyeUV4ZWMsXG4gIFZhdWx0SXNMb2NrZWRFcnJvcixcbn0gZnJvbSBcIn4vdXRpbHMvZXJyb3JzXCI7XG5pbXBvcnQgeyBqb2luLCBkaXJuYW1lIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNobW9kLCByZW5hbWUsIHJtIH0gZnJvbSBcImZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyBkZWNvbXByZXNzRmlsZSwgcmVtb3ZlRmlsZXNUaGF0U3RhcnRXaXRoLCB1bmxpbmtBbGxTeW5jLCB3YWl0Rm9yRmlsZUF2YWlsYWJsZSB9IGZyb20gXCJ+L3V0aWxzL2ZzXCI7XG5pbXBvcnQgeyBkb3dubG9hZCB9IGZyb20gXCJ+L3V0aWxzL25ldHdvcmtcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuaW1wb3J0IHsgUmVjZWl2ZWRTZW5kLCBTZW5kLCBTZW5kQ3JlYXRlUGF5bG9hZCwgU2VuZFR5cGUgfSBmcm9tIFwifi90eXBlcy9zZW5kXCI7XG5pbXBvcnQgeyBwcmVwYXJlU2VuZFBheWxvYWQgfSBmcm9tIFwifi9hcGkvYml0d2FyZGVuLmhlbHBlcnNcIjtcbmltcG9ydCB7IENhY2hlIH0gZnJvbSBcIn4vdXRpbHMvY2FjaGVcIjtcbmltcG9ydCB7IHBsYXRmb3JtIH0gZnJvbSBcIn4vdXRpbHMvcGxhdGZvcm1cIjtcblxudHlwZSBFbnYgPSB7XG4gIEJJVFdBUkRFTkNMSV9BUFBEQVRBX0RJUjogc3RyaW5nO1xuICBCV19DTElFTlRTRUNSRVQ6IHN0cmluZztcbiAgQldfQ0xJRU5USUQ6IHN0cmluZztcbiAgUEFUSDogc3RyaW5nO1xuICBOT0RFX0VYVFJBX0NBX0NFUlRTPzogc3RyaW5nO1xuICBCV19TRVNTSU9OPzogc3RyaW5nO1xufTtcblxudHlwZSBBY3Rpb25MaXN0ZW5lcnMgPSB7XG4gIGxvZ2luPzogKCkgPT4gTWF5YmVQcm9taXNlPHZvaWQ+O1xuICBsb2dvdXQ/OiAocmVhc29uPzogc3RyaW5nKSA9PiBNYXliZVByb21pc2U8dm9pZD47XG4gIGxvY2s/OiAocmVhc29uPzogc3RyaW5nKSA9PiBNYXliZVByb21pc2U8dm9pZD47XG4gIHVubG9jaz86IChwYXNzd29yZDogc3RyaW5nLCBzZXNzaW9uVG9rZW46IHN0cmluZykgPT4gTWF5YmVQcm9taXNlPHZvaWQ+O1xufTtcblxudHlwZSBBY3Rpb25MaXN0ZW5lcnNNYXA8VCBleHRlbmRzIGtleW9mIEFjdGlvbkxpc3RlbmVycyA9IGtleW9mIEFjdGlvbkxpc3RlbmVycz4gPSBNYXA8VCwgU2V0PEFjdGlvbkxpc3RlbmVyc1tUXT4+O1xuXG50eXBlIE1heWJlRXJyb3I8VCA9IHVuZGVmaW5lZD4gPSB7IHJlc3VsdDogVDsgZXJyb3I/OiB1bmRlZmluZWQgfSB8IHsgcmVzdWx0PzogdW5kZWZpbmVkOyBlcnJvcjogTWFudWFsbHlUaHJvd25FcnJvciB9O1xuXG50eXBlIEV4ZWNQcm9wcyA9IHtcbiAgLyoqIFJlc2V0IHRoZSB0aW1lIG9mIHRoZSBsYXN0IGNvbW1hbmQgdGhhdCBhY2Nlc3NlZCBkYXRhIG9yIG1vZGlmaWVkIHRoZSB2YXVsdCwgdXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIHZhdWx0IHRpbWVkIG91dCAqL1xuICByZXNldFZhdWx0VGltZW91dDogYm9vbGVhbjtcbiAgYWJvcnRDb250cm9sbGVyPzogQWJvcnRDb250cm9sbGVyO1xuICBpbnB1dD86IHN0cmluZztcbn07XG5cbnR5cGUgTG9ja09wdGlvbnMgPSB7XG4gIC8qKiBUaGUgcmVhc29uIGZvciBsb2NraW5nIHRoZSB2YXVsdCAqL1xuICByZWFzb24/OiBzdHJpbmc7XG4gIGNoZWNrVmF1bHRTdGF0dXM/OiBib29sZWFuO1xuICAvKiogVGhlIGNhbGxiYWNrcyBhcmUgY2FsbGVkIGJlZm9yZSB0aGUgb3BlcmF0aW9uIGlzIGZpbmlzaGVkIChvcHRpbWlzdGljKSAqL1xuICBpbW1lZGlhdGU/OiBib29sZWFuO1xufTtcblxudHlwZSBMb2dvdXRPcHRpb25zID0ge1xuICAvKiogVGhlIHJlYXNvbiBmb3IgbG9ja2luZyB0aGUgdmF1bHQgKi9cbiAgcmVhc29uPzogc3RyaW5nO1xuICAvKiogVGhlIGNhbGxiYWNrcyBhcmUgY2FsbGVkIGJlZm9yZSB0aGUgb3BlcmF0aW9uIGlzIGZpbmlzaGVkIChvcHRpbWlzdGljKSAqL1xuICBpbW1lZGlhdGU/OiBib29sZWFuO1xufTtcblxudHlwZSBSZWNlaXZlU2VuZE9wdGlvbnMgPSB7XG4gIHNhdmVQYXRoPzogc3RyaW5nO1xuICBwYXNzd29yZD86IHN0cmluZztcbn07XG5cbnR5cGUgQ3JlYXRlTG9naW5JdGVtT3B0aW9ucyA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICB1c2VybmFtZT86IHN0cmluZztcbiAgcGFzc3dvcmQ6IHN0cmluZztcbiAgZm9sZGVySWQ6IHN0cmluZyB8IG51bGw7XG4gIHVyaT86IHN0cmluZztcbn07XG5cbmNvbnN0IHsgc3VwcG9ydFBhdGggfSA9IGVudmlyb25tZW50O1xuXG5jb25zdCBcdTAzOTQgPSBcIjRcIjsgLy8gY2hhbmdpbmcgdGhpcyBmb3JjZXMgYSBuZXcgYmluIGRvd25sb2FkIGZvciBwZW9wbGUgdGhhdCBoYWQgYSBmYWlsZWQgb25lXG5jb25zdCBCaW5Eb3dubG9hZExvZ2dlciA9ICgoKSA9PiB7XG4gIC8qIFRoZSBpZGVhIG9mIHRoaXMgbG9nZ2VyIGlzIHRvIHdyaXRlIGEgbG9nIGZpbGUgd2hlbiB0aGUgYmluIGRvd25sb2FkIGZhaWxzLCBzbyB0aGF0IHdlIGNhbiBsZXQgdGhlIGV4dGVuc2lvbiBjcmFzaCxcbiAgIGJ1dCBmYWxsYmFjayB0byB0aGUgbG9jYWwgY2xpIHBhdGggaW4gdGhlIG5leHQgbGF1bmNoLiBUaGlzIGFsbG93cyB0aGUgZXJyb3IgdG8gYmUgcmVwb3J0ZWQgaW4gdGhlIGlzc3VlcyBkYXNoYm9hcmQuIEl0IHVzZXMgZmlsZXMgdG8ga2VlcCBpdCBzeW5jaHJvbm91cywgYXMgaXQncyBuZWVkZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICAgQWx0aG91Z2gsIHRoZSBwbGFuIGlzIHRvIGRpc2NvbnRpbnVlIHRoaXMgbWV0aG9kLCBpZiB0aGVyZSdzIGEgYmV0dGVyIHdheSBvZiBsb2dnaW5nIGVycm9ycyBpbiB0aGUgaXNzdWVzIGRhc2hib2FyZFxuICAgb3IgdGhlcmUgYXJlIG5vIGNyYXNoZXMgcmVwb3J0ZWQgd2l0aCB0aGUgYmluIGRvd25sb2FkIGFmdGVyIHNvbWUgdGltZS4gKi9cbiAgY29uc3QgZmlsZVBhdGggPSBqb2luKHN1cHBvcnRQYXRoLCBgYnctYmluLWRvd25sb2FkLWVycm9yLSR7XHUwMzk0fS5sb2dgKTtcbiAgcmV0dXJuIHtcbiAgICBsb2dFcnJvcjogKGVycm9yOiBhbnkpID0+IHRyeUV4ZWMoKCkgPT4gd3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgZXJyb3I/Lm1lc3NhZ2UgPz8gXCJVbmV4cGVjdGVkIGVycm9yXCIpKSxcbiAgICBjbGVhckVycm9yOiAoKSA9PiB0cnlFeGVjKCgpID0+IHVubGlua1N5bmMoZmlsZVBhdGgpKSxcbiAgICBoYXNFcnJvcjogKCkgPT4gdHJ5RXhlYygoKSA9PiBleGlzdHNTeW5jKGZpbGVQYXRoKSwgZmFsc2UpLFxuICB9O1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IGNsaUluZm8gPSB7XG4gIHZlcnNpb246IFwiMjAyNS4yLjBcIixcbiAgZ2V0IHNoYTI1NigpIHtcbiAgICBpZiAocGxhdGZvcm0gPT09IFwid2luZG93c1wiKSByZXR1cm4gXCIzM2ExMzEwMTdhYzljOTlkNzIxZTQzMGE4NmU5MjkzODMzMTRkM2Y5MWM5ZjJmYmY0MTNkODcyNTY1NjU0YzE4XCI7XG4gICAgcmV0dXJuIFwiZmFkZTUxMDEyYTQ2MDExYzAxNmEyZTVhZWUyZjJlNTM0YzFlZDA3OGU0OWQxMTc4YTY5ZTI4ODlkMjgxMmE5NlwiO1xuICB9LFxuICBkb3dubG9hZFBhZ2U6IFwiaHR0cHM6Ly9naXRodWIuY29tL2JpdHdhcmRlbi9jbGllbnRzL3JlbGVhc2VzXCIsXG4gIHBhdGg6IHtcbiAgICBnZXQgZG93bmxvYWRlZEJpbigpIHtcbiAgICAgIHJldHVybiBqb2luKHN1cHBvcnRQYXRoLCBjbGlJbmZvLmJpbkZpbGVuYW1lVmVyc2lvbmVkKTtcbiAgICB9LFxuICAgIGdldCBpbnN0YWxsZWRCaW4oKSB7XG4gICAgICAvLyBXZSBhc3N1bWUgdGhhdCBpdCB3YXMgaW5zdGFsbGVkIHVzaW5nIENob2NvbGF0ZXksIGlmIG5vdCwgaXQncyBoYXJkIHRvIG1ha2UgYSBnb29kIGd1ZXNzLlxuICAgICAgaWYgKHBsYXRmb3JtID09PSBcIndpbmRvd3NcIikgcmV0dXJuIFwiQzpcXFxcUHJvZ3JhbURhdGFcXFxcY2hvY29sYXRleVxcXFxiaW5cXFxcYncuZXhlXCI7XG4gICAgICByZXR1cm4gcHJvY2Vzcy5hcmNoID09PSBcImFybTY0XCIgPyBcIi9vcHQvaG9tZWJyZXcvYmluL2J3XCIgOiBcIi91c3IvbG9jYWwvYmluL2J3XCI7XG4gICAgfSxcbiAgICBnZXQgYmluKCkge1xuICAgICAgcmV0dXJuICFCaW5Eb3dubG9hZExvZ2dlci5oYXNFcnJvcigpID8gdGhpcy5kb3dubG9hZGVkQmluIDogdGhpcy5pbnN0YWxsZWRCaW47XG4gICAgfSxcbiAgfSxcbiAgZ2V0IGJpbkZpbGVuYW1lKCkge1xuICAgIHJldHVybiBwbGF0Zm9ybSA9PT0gXCJ3aW5kb3dzXCIgPyBcImJ3LmV4ZVwiIDogXCJid1wiO1xuICB9LFxuICBnZXQgYmluRmlsZW5hbWVWZXJzaW9uZWQoKSB7XG4gICAgY29uc3QgbmFtZSA9IGBidy0ke3RoaXMudmVyc2lvbn1gO1xuICAgIHJldHVybiBwbGF0Zm9ybSA9PT0gXCJ3aW5kb3dzXCIgPyBgJHtuYW1lfS5leGVgIDogYCR7bmFtZX1gO1xuICB9LFxuICBnZXQgZG93bmxvYWRVcmwoKSB7XG4gICAgbGV0IGFyY2hTdWZmaXggPSBcIlwiO1xuICAgIGlmIChwbGF0Zm9ybSA9PT0gXCJtYWNvc1wiKSB7XG4gICAgICBhcmNoU3VmZml4ID0gcHJvY2Vzcy5hcmNoID09PSBcImFybTY0XCIgPyBcIi1hcm02NFwiIDogXCJcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7dGhpcy5kb3dubG9hZFBhZ2V9L2Rvd25sb2FkL2NsaS12JHt0aGlzLnZlcnNpb259L2J3LSR7cGxhdGZvcm19JHthcmNoU3VmZml4fS0ke3RoaXMudmVyc2lvbn0uemlwYDtcbiAgfSxcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjbGFzcyBCaXR3YXJkZW4ge1xuICBwcml2YXRlIGVudjogRW52O1xuICBwcml2YXRlIGluaXRQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuICBwcml2YXRlIHRlbXBTZXNzaW9uVG9rZW4/OiBzdHJpbmc7XG4gIHByaXZhdGUgYWN0aW9uTGlzdGVuZXJzOiBBY3Rpb25MaXN0ZW5lcnNNYXAgPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgcHJlZmVyZW5jZXMgPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpO1xuICBwcml2YXRlIGNsaVBhdGg6IHN0cmluZztcbiAgcHJpdmF0ZSB0b2FzdEluc3RhbmNlOiBUb2FzdCB8IHVuZGVmaW5lZDtcbiAgd2FzQ2xpVXBkYXRlZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHRvYXN0SW5zdGFuY2U/OiBUb2FzdCkge1xuICAgIGNvbnN0IHsgY2xpUGF0aDogY2xpUGF0aFByZWZlcmVuY2UsIGNsaWVudElkLCBjbGllbnRTZWNyZXQsIHNlcnZlckNlcnRzUGF0aCB9ID0gdGhpcy5wcmVmZXJlbmNlcztcbiAgICBjb25zdCBzZXJ2ZXJVcmwgPSBnZXRTZXJ2ZXJVcmxQcmVmZXJlbmNlKCk7XG5cbiAgICB0aGlzLnRvYXN0SW5zdGFuY2UgPSB0b2FzdEluc3RhbmNlO1xuICAgIHRoaXMuY2xpUGF0aCA9IGNsaVBhdGhQcmVmZXJlbmNlIHx8IGNsaUluZm8ucGF0aC5iaW47XG4gICAgdGhpcy5lbnYgPSB7XG4gICAgICBCSVRXQVJERU5DTElfQVBQREFUQV9ESVI6IHN1cHBvcnRQYXRoLFxuICAgICAgQldfQ0xJRU5UU0VDUkVUOiBjbGllbnRTZWNyZXQudHJpbSgpLFxuICAgICAgQldfQ0xJRU5USUQ6IGNsaWVudElkLnRyaW0oKSxcbiAgICAgIFBBVEg6IGRpcm5hbWUocHJvY2Vzcy5leGVjUGF0aCksXG4gICAgICAuLi4oc2VydmVyVXJsICYmIHNlcnZlckNlcnRzUGF0aCA/IHsgTk9ERV9FWFRSQV9DQV9DRVJUUzogc2VydmVyQ2VydHNQYXRoIH0gOiB7fSksXG4gICAgfTtcblxuICAgIHRoaXMuaW5pdFByb21pc2UgPSAoYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgYXdhaXQgdGhpcy5lbnN1cmVDbGlCaW5hcnkoKTtcbiAgICAgIHZvaWQgdGhpcy5yZXRyaWV2ZUFuZENhY2hlQ2xpVmVyc2lvbigpO1xuICAgICAgYXdhaXQgdGhpcy5jaGVja1NlcnZlclVybChzZXJ2ZXJVcmwpO1xuICAgIH0pKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGVuc3VyZUNsaUJpbmFyeSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5jaGVja0NsaUJpbklzUmVhZHkodGhpcy5jbGlQYXRoKSkgcmV0dXJuO1xuICAgIGlmICh0aGlzLmNsaVBhdGggPT09IHRoaXMucHJlZmVyZW5jZXMuY2xpUGF0aCB8fCB0aGlzLmNsaVBhdGggPT09IGNsaUluZm8ucGF0aC5pbnN0YWxsZWRCaW4pIHtcbiAgICAgIHRocm93IG5ldyBJbnN0YWxsZWRDTElOb3RGb3VuZEVycm9yKGBCaXR3YXJkZW4gQ0xJIG5vdCBmb3VuZCBhdCAke3RoaXMuY2xpUGF0aH1gKTtcbiAgICB9XG4gICAgaWYgKEJpbkRvd25sb2FkTG9nZ2VyLmhhc0Vycm9yKCkpIEJpbkRvd25sb2FkTG9nZ2VyLmNsZWFyRXJyb3IoKTtcblxuICAgIC8vIHJlbW92ZSBvbGQgYmluYXJpZXMgdG8gY2hlY2sgaWYgaXQncyBhbiB1cGRhdGUgYW5kIGJlY2F1c2UgdGhleSBhcmUgMTAwTUIrXG4gICAgY29uc3QgaGFkT2xkQmluYXJpZXMgPSBhd2FpdCByZW1vdmVGaWxlc1RoYXRTdGFydFdpdGgoXCJidy1cIiwgc3VwcG9ydFBhdGgpO1xuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgdGhpcy5zaG93VG9hc3Qoe1xuICAgICAgdGl0bGU6IGAke2hhZE9sZEJpbmFyaWVzID8gXCJVcGRhdGluZ1wiIDogXCJJbml0aWFsaXppbmdcIn0gQml0d2FyZGVuIENMSWAsXG4gICAgICBzdHlsZTogVG9hc3QuU3R5bGUuQW5pbWF0ZWQsXG4gICAgICBwcmltYXJ5QWN0aW9uOiB7IHRpdGxlOiBcIk9wZW4gRG93bmxvYWQgUGFnZVwiLCBvbkFjdGlvbjogKCkgPT4gb3BlbihjbGlJbmZvLmRvd25sb2FkUGFnZSkgfSxcbiAgICB9KTtcbiAgICBjb25zdCB0bXBGaWxlTmFtZSA9IFwiYncuemlwXCI7XG4gICAgY29uc3QgemlwUGF0aCA9IGpvaW4oc3VwcG9ydFBhdGgsIHRtcEZpbGVOYW1lKTtcblxuICAgIHRyeSB7XG4gICAgICB0cnkge1xuICAgICAgICB0b2FzdC5tZXNzYWdlID0gXCJEb3dubG9hZGluZy4uLlwiO1xuICAgICAgICBhd2FpdCBkb3dubG9hZChjbGlJbmZvLmRvd25sb2FkVXJsLCB6aXBQYXRoLCB7XG4gICAgICAgICAgb25Qcm9ncmVzczogKHBlcmNlbnQpID0+ICh0b2FzdC5tZXNzYWdlID0gYERvd25sb2FkaW5nICR7cGVyY2VudH0lYCksXG4gICAgICAgICAgc2hhMjU2OiBjbGlJbmZvLnNoYTI1NixcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChkb3dubG9hZEVycm9yKSB7XG4gICAgICAgIHRvYXN0LnRpdGxlID0gXCJGYWlsZWQgdG8gZG93bmxvYWQgQml0d2FyZGVuIENMSVwiO1xuICAgICAgICB0aHJvdyBkb3dubG9hZEVycm9yO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICB0b2FzdC5tZXNzYWdlID0gXCJFeHRyYWN0aW5nLi4uXCI7XG4gICAgICAgIGF3YWl0IGRlY29tcHJlc3NGaWxlKHppcFBhdGgsIHN1cHBvcnRQYXRoKTtcbiAgICAgICAgY29uc3QgZGVjb21wcmVzc2VkQmluUGF0aCA9IGpvaW4oc3VwcG9ydFBhdGgsIGNsaUluZm8uYmluRmlsZW5hbWUpO1xuXG4gICAgICAgIC8vIEZvciBzb21lIHJlYXNvbiB0aGlzIHJlbmFtZSBzdGFydGVkIHRocm93aW5nIGFuIGVycm9yIGFmdGVyIHN1Y2NlZWRpbmcsIHNvIGZvciBub3cgd2UncmUganVzdFxuICAgICAgICAvLyBjYXRjaGluZyBpdCBhbmQgY2hlY2tpbmcgaWYgdGhlIGZpbGUgZXhpc3RzIFx1MDBBRlxcXyhcdTMwQzQpXy9cdTAwQUZcbiAgICAgICAgYXdhaXQgcmVuYW1lKGRlY29tcHJlc3NlZEJpblBhdGgsIHRoaXMuY2xpUGF0aCkuY2F0Y2goKCkgPT4gbnVsbCk7XG4gICAgICAgIGF3YWl0IHdhaXRGb3JGaWxlQXZhaWxhYmxlKHRoaXMuY2xpUGF0aCk7XG5cbiAgICAgICAgYXdhaXQgY2htb2QodGhpcy5jbGlQYXRoLCBcIjc1NVwiKTtcbiAgICAgICAgYXdhaXQgcm0oemlwUGF0aCwgeyBmb3JjZTogdHJ1ZSB9KTtcblxuICAgICAgICBDYWNoZS5zZXQoQ0FDSEVfS0VZUy5DTElfVkVSU0lPTiwgY2xpSW5mby52ZXJzaW9uKTtcbiAgICAgICAgdGhpcy53YXNDbGlVcGRhdGVkID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGV4dHJhY3RFcnJvcikge1xuICAgICAgICB0b2FzdC50aXRsZSA9IFwiRmFpbGVkIHRvIGV4dHJhY3QgQml0d2FyZGVuIENMSVwiO1xuICAgICAgICB0aHJvdyBleHRyYWN0RXJyb3I7XG4gICAgICB9XG4gICAgICBhd2FpdCB0b2FzdC5oaWRlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRvYXN0Lm1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVuc3VyZUNsaUJpbkVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiUGxlYXNlIHRyeSBhZ2FpblwiO1xuICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5GYWlsdXJlO1xuXG4gICAgICB1bmxpbmtBbGxTeW5jKHppcFBhdGgsIHRoaXMuY2xpUGF0aCk7XG5cbiAgICAgIGlmICghZW52aXJvbm1lbnQuaXNEZXZlbG9wbWVudCkgQmluRG93bmxvYWRMb2dnZXIubG9nRXJyb3IoZXJyb3IpO1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHRocm93IG5ldyBFbnN1cmVDbGlCaW5FcnJvcihlcnJvci5tZXNzYWdlLCBlcnJvci5zdGFjayk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgdG9hc3QucmVzdG9yZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmV0cmlldmVBbmRDYWNoZUNsaVZlcnNpb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZXJyb3IsIHJlc3VsdCB9ID0gYXdhaXQgdGhpcy5nZXRWZXJzaW9uKCk7XG4gICAgICBpZiAoIWVycm9yKSBDYWNoZS5zZXQoQ0FDSEVfS0VZUy5DTElfVkVSU0lPTiwgcmVzdWx0KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byByZXRyaWV2ZSBhbmQgY2FjaGUgY2xpIHZlcnNpb25cIiwgZXJyb3IsIHsgY2FwdHVyZVRvUmF5Y2FzdDogdHJ1ZSB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNoZWNrQ2xpQmluSXNSZWFkeShmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZXhpc3RzU3luYyh0aGlzLmNsaVBhdGgpKSByZXR1cm4gZmFsc2U7XG4gICAgICBhY2Nlc3NTeW5jKGZpbGVQYXRoLCBjb25zdGFudHMuWF9PSyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGNobW9kU3luYyhmaWxlUGF0aCwgXCI3NTVcIik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBzZXRTZXNzaW9uVG9rZW4odG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuZW52ID0ge1xuICAgICAgLi4udGhpcy5lbnYsXG4gICAgICBCV19TRVNTSU9OOiB0b2tlbixcbiAgICB9O1xuICB9XG5cbiAgY2xlYXJTZXNzaW9uVG9rZW4oKTogdm9pZCB7XG4gICAgZGVsZXRlIHRoaXMuZW52LkJXX1NFU1NJT047XG4gIH1cblxuICB3aXRoU2Vzc2lvbih0b2tlbjogc3RyaW5nKTogdGhpcyB7XG4gICAgdGhpcy50ZW1wU2Vzc2lvblRva2VuID0gdG9rZW47XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dGhpcz4ge1xuICAgIGF3YWl0IHRoaXMuaW5pdFByb21pc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBjaGVja1NlcnZlclVybChzZXJ2ZXJVcmw6IHN0cmluZyB8IHVuZGVmaW5lZCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIENoZWNrIHRoZSBDTEkgaGFzIGJlZW4gY29uZmlndXJlZCB0byB1c2UgdGhlIHByZWZlcmVuY2UgVXJsXG4gICAgY29uc3Qgc3RvcmVkU2VydmVyID0gYXdhaXQgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5TRVJWRVJfVVJMKTtcbiAgICBpZiAoIXNlcnZlclVybCB8fCBzdG9yZWRTZXJ2ZXIgPT09IHNlcnZlclVybCkgcmV0dXJuO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzZXJ2ZXIgVXJsXG4gICAgY29uc3QgdG9hc3QgPSBhd2FpdCB0aGlzLnNob3dUb2FzdCh7XG4gICAgICBzdHlsZTogVG9hc3QuU3R5bGUuQW5pbWF0ZWQsXG4gICAgICB0aXRsZTogXCJTd2l0Y2hpbmcgc2VydmVyLi4uXCIsXG4gICAgICBtZXNzYWdlOiBcIkJpdHdhcmRlbiBzZXJ2ZXIgcHJlZmVyZW5jZSBjaGFuZ2VkXCIsXG4gICAgfSk7XG4gICAgdHJ5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9nb3V0KCk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gSXQgZG9lc24ndCBtYXR0ZXIgaWYgd2Ugd2VyZW4ndCBsb2dnZWQgaW4uXG4gICAgICB9XG4gICAgICAvLyBJZiBVUkwgaXMgZW1wdHksIHNldCBpdCB0byB0aGUgZGVmYXVsdFxuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImNvbmZpZ1wiLCBcInNlcnZlclwiLCBzZXJ2ZXJVcmwgfHwgREVGQVVMVF9TRVJWRVJfVVJMXSwgeyByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICBhd2FpdCBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5TRVJWRVJfVVJMLCBzZXJ2ZXJVcmwpO1xuXG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLlN1Y2Nlc3M7XG4gICAgICB0b2FzdC50aXRsZSA9IFwiU3VjY2Vzc1wiO1xuICAgICAgdG9hc3QubWVzc2FnZSA9IFwiQml0d2FyZGVuIHNlcnZlciBjaGFuZ2VkXCI7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuRmFpbHVyZTtcbiAgICAgIHRvYXN0LnRpdGxlID0gXCJGYWlsZWQgdG8gc3dpdGNoIHNlcnZlclwiO1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdG9hc3QubWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2FzdC5tZXNzYWdlID0gXCJVbmtub3duIGVycm9yIG9jY3VycmVkXCI7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGF3YWl0IHRvYXN0LnJlc3RvcmUoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGV4ZWMoYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IEV4ZWNQcm9wcyk6IFByb21pc2U8RXhlY2FDaGlsZFByb2Nlc3M+IHtcbiAgICBjb25zdCB7IGFib3J0Q29udHJvbGxlciwgaW5wdXQgPSBcIlwiLCByZXNldFZhdWx0VGltZW91dCB9ID0gb3B0aW9ucyA/PyB7fTtcblxuICAgIGxldCBlbnYgPSB0aGlzLmVudjtcbiAgICBpZiAodGhpcy50ZW1wU2Vzc2lvblRva2VuKSB7XG4gICAgICBlbnYgPSB7IC4uLmVudiwgQldfU0VTU0lPTjogdGhpcy50ZW1wU2Vzc2lvblRva2VuIH07XG4gICAgICB0aGlzLnRlbXBTZXNzaW9uVG9rZW4gPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY2EodGhpcy5jbGlQYXRoLCBhcmdzLCB7IGlucHV0LCBlbnYsIHNpZ25hbDogYWJvcnRDb250cm9sbGVyPy5zaWduYWwgfSk7XG5cbiAgICBpZiAodGhpcy5pc1Byb21wdFdhaXRpbmdGb3JNYXN0ZXJQYXNzd29yZChyZXN1bHQpKSB7XG4gICAgICAvKiBzaW5jZSB3ZSBoYXZlIHRoZSBzZXNzaW9uIHRva2VuIGluIHRoZSBlbnYsIHRoZSBwYXNzd29yZCBcbiAgICAgIHNob3VsZCBub3QgYmUgcmVxdWVzdGVkLCB1bmxlc3MgdGhlIHZhdWx0IGlzIGxvY2tlZCAqL1xuICAgICAgYXdhaXQgdGhpcy5sb2NrKCk7XG4gICAgICB0aHJvdyBuZXcgVmF1bHRJc0xvY2tlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlc2V0VmF1bHRUaW1lb3V0KSB7XG4gICAgICBhd2FpdCBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5MQVNUX0FDVElWSVRZX1RJTUUsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGFzeW5jIGdldFZlcnNpb24oKTogUHJvbWlzZTxNYXliZUVycm9yPHN0cmluZz4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQ6IHJlc3VsdCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcIi0tdmVyc2lvblwiXSwgeyByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IGNsaSB2ZXJzaW9uXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsb2dpbigpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImxvZ2luXCIsIFwiLS1hcGlrZXlcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJsb2dpblwiLCBcInVubG9ja2VkXCIpO1xuICAgICAgYXdhaXQgdGhpcy5jYWxsQWN0aW9uTGlzdGVuZXJzKFwibG9naW5cIik7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsb2dpblwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbG9nb3V0KG9wdGlvbnM/OiBMb2dvdXRPcHRpb25zKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgY29uc3QgeyByZWFzb24sIGltbWVkaWF0ZSA9IGZhbHNlIH0gPSBvcHRpb25zID8/IHt9O1xuICAgIHRyeSB7XG4gICAgICBpZiAoaW1tZWRpYXRlKSBhd2FpdCB0aGlzLmhhbmRsZVBvc3RMb2dvdXQocmVhc29uKTtcblxuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImxvZ291dFwiXSwgeyByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJsb2dvdXRcIiwgXCJ1bmF1dGhlbnRpY2F0ZWRcIik7XG4gICAgICBpZiAoIWltbWVkaWF0ZSkgYXdhaXQgdGhpcy5oYW5kbGVQb3N0TG9nb3V0KHJlYXNvbik7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsb2dvdXRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxvY2sob3B0aW9ucz86IExvY2tPcHRpb25zKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgY29uc3QgeyByZWFzb24sIGNoZWNrVmF1bHRTdGF0dXMgPSBmYWxzZSwgaW1tZWRpYXRlID0gZmFsc2UgfSA9IG9wdGlvbnMgPz8ge307XG4gICAgdHJ5IHtcbiAgICAgIGlmIChpbW1lZGlhdGUpIGF3YWl0IHRoaXMuY2FsbEFjdGlvbkxpc3RlbmVycyhcImxvY2tcIiwgcmVhc29uKTtcbiAgICAgIGlmIChjaGVja1ZhdWx0U3RhdHVzKSB7XG4gICAgICAgIGNvbnN0IHsgZXJyb3IsIHJlc3VsdCB9ID0gYXdhaXQgdGhpcy5zdGF0dXMoKTtcbiAgICAgICAgaWYgKGVycm9yKSB0aHJvdyBlcnJvcjtcbiAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwidW5hdXRoZW50aWNhdGVkXCIpIHJldHVybiB7IGVycm9yOiBuZXcgTm90TG9nZ2VkSW5FcnJvcihcIk5vdCBsb2dnZWQgaW5cIikgfTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImxvY2tcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwibG9ja1wiLCBcImxvY2tlZFwiKTtcbiAgICAgIGlmICghaW1tZWRpYXRlKSBhd2FpdCB0aGlzLmNhbGxBY3Rpb25MaXN0ZW5lcnMoXCJsb2NrXCIsIHJlYXNvbik7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsb2NrIHZhdWx0XCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyB1bmxvY2socGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcjxzdHJpbmc+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0OiBzZXNzaW9uVG9rZW4gfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJ1bmxvY2tcIiwgcGFzc3dvcmQsIFwiLS1yYXdcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICB0aGlzLnNldFNlc3Npb25Ub2tlbihzZXNzaW9uVG9rZW4pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwidW5sb2NrXCIsIFwidW5sb2NrZWRcIik7XG4gICAgICBhd2FpdCB0aGlzLmNhbGxBY3Rpb25MaXN0ZW5lcnMoXCJ1bmxvY2tcIiwgcGFzc3dvcmQsIHNlc3Npb25Ub2tlbik7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHNlc3Npb25Ub2tlbiB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byB1bmxvY2sgdmF1bHRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN5bmMoKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJzeW5jXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gc3luYyB2YXVsdFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0SXRlbShpZDogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPEl0ZW0+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiZ2V0XCIsIFwiaXRlbVwiLCBpZF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8SXRlbT4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZXQgaXRlbVwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbGlzdEl0ZW1zKCk6IFByb21pc2U8TWF5YmVFcnJvcjxJdGVtW10+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wibGlzdFwiLCBcIml0ZW1zXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgY29uc3QgaXRlbXMgPSBKU09OLnBhcnNlPEl0ZW1bXT4oc3Rkb3V0KTtcbiAgICAgIC8vIEZpbHRlciBvdXQgaXRlbXMgd2l0aG91dCBhIG5hbWUgcHJvcGVydHkgKHRoZXkgYXJlIG5vdCBkaXNwbGF5ZWQgaW4gdGhlIGJpdHdhcmRlbiBhcHApXG4gICAgICByZXR1cm4geyByZXN1bHQ6IGl0ZW1zLmZpbHRlcigoaXRlbTogSXRlbSkgPT4gISFpdGVtLm5hbWUpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGxpc3QgaXRlbXNcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZUxvZ2luSXRlbShvcHRpb25zOiBDcmVhdGVMb2dpbkl0ZW1PcHRpb25zKTogUHJvbWlzZTxNYXliZUVycm9yPEl0ZW0+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZXJyb3I6IGl0ZW1UZW1wbGF0ZUVycm9yLCByZXN1bHQ6IGl0ZW1UZW1wbGF0ZSB9ID0gYXdhaXQgdGhpcy5nZXRUZW1wbGF0ZTxJdGVtPihcIml0ZW1cIik7XG4gICAgICBpZiAoaXRlbVRlbXBsYXRlRXJyb3IpIHRocm93IGl0ZW1UZW1wbGF0ZUVycm9yO1xuXG4gICAgICBjb25zdCB7IGVycm9yOiBsb2dpblRlbXBsYXRlRXJyb3IsIHJlc3VsdDogbG9naW5UZW1wbGF0ZSB9ID0gYXdhaXQgdGhpcy5nZXRUZW1wbGF0ZTxMb2dpbj4oXCJpdGVtLmxvZ2luXCIpO1xuICAgICAgaWYgKGxvZ2luVGVtcGxhdGVFcnJvcikgdGhyb3cgbG9naW5UZW1wbGF0ZUVycm9yO1xuXG4gICAgICBpdGVtVGVtcGxhdGUubmFtZSA9IG9wdGlvbnMubmFtZTtcbiAgICAgIGl0ZW1UZW1wbGF0ZS50eXBlID0gSXRlbVR5cGUuTE9HSU47XG4gICAgICBpdGVtVGVtcGxhdGUuZm9sZGVySWQgPSBvcHRpb25zLmZvbGRlcklkIHx8IG51bGw7XG4gICAgICBpdGVtVGVtcGxhdGUubG9naW4gPSBsb2dpblRlbXBsYXRlO1xuICAgICAgaXRlbVRlbXBsYXRlLm5vdGVzID0gbnVsbDtcblxuICAgICAgbG9naW5UZW1wbGF0ZS51c2VybmFtZSA9IG9wdGlvbnMudXNlcm5hbWUgfHwgbnVsbDtcbiAgICAgIGxvZ2luVGVtcGxhdGUucGFzc3dvcmQgPSBvcHRpb25zLnBhc3N3b3JkO1xuICAgICAgbG9naW5UZW1wbGF0ZS50b3RwID0gbnVsbDtcbiAgICAgIGxvZ2luVGVtcGxhdGUuZmlkbzJDcmVkZW50aWFscyA9IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKG9wdGlvbnMudXJpKSB7XG4gICAgICAgIGxvZ2luVGVtcGxhdGUudXJpcyA9IFt7IG1hdGNoOiBudWxsLCB1cmk6IG9wdGlvbnMudXJpIH1dO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7IHJlc3VsdDogZW5jb2RlZEl0ZW0sIGVycm9yOiBlbmNvZGVFcnJvciB9ID0gYXdhaXQgdGhpcy5lbmNvZGUoSlNPTi5zdHJpbmdpZnkoaXRlbVRlbXBsYXRlKSk7XG4gICAgICBpZiAoZW5jb2RlRXJyb3IpIHRocm93IGVuY29kZUVycm9yO1xuXG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImNyZWF0ZVwiLCBcIml0ZW1cIiwgZW5jb2RlZEl0ZW1dLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPEl0ZW0+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gY3JlYXRlIGxvZ2luIGl0ZW1cIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxpc3RGb2xkZXJzKCk6IFByb21pc2U8TWF5YmVFcnJvcjxGb2xkZXJbXT4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJsaXN0XCIsIFwiZm9sZGVyc1wiXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxGb2xkZXJbXT4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsaXN0IGZvbGRlclwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY3JlYXRlRm9sZGVyKG5hbWU6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVycm9yLCByZXN1bHQ6IGZvbGRlciB9ID0gYXdhaXQgdGhpcy5nZXRUZW1wbGF0ZShcImZvbGRlclwiKTtcbiAgICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG5cbiAgICAgIGZvbGRlci5uYW1lID0gbmFtZTtcbiAgICAgIGNvbnN0IHsgcmVzdWx0OiBlbmNvZGVkRm9sZGVyLCBlcnJvcjogZW5jb2RlRXJyb3IgfSA9IGF3YWl0IHRoaXMuZW5jb2RlKEpTT04uc3RyaW5naWZ5KGZvbGRlcikpO1xuICAgICAgaWYgKGVuY29kZUVycm9yKSB0aHJvdyBlbmNvZGVFcnJvcjtcblxuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImNyZWF0ZVwiLCBcImZvbGRlclwiLCBlbmNvZGVkRm9sZGVyXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogdW5kZWZpbmVkIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNyZWF0ZSBmb2xkZXJcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldFRvdHAoaWQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcjxzdHJpbmc+PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIHRoaXMgY291bGQgcmV0dXJuIHNvbWV0aGluZyBsaWtlIFwiTm90IGZvdW5kLlwiIGJ1dCBjaGVja3MgZm9yIHRvdHAgY29kZSBhcmUgZG9uZSBiZWZvcmUgY2FsbGluZyB0aGlzIGZ1bmN0aW9uXG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImdldFwiLCBcInRvdHBcIiwgaWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBzdGRvdXQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IFRPVFBcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN0YXR1cygpOiBQcm9taXNlPE1heWJlRXJyb3I8VmF1bHRTdGF0ZT4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJzdGF0dXNcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFZhdWx0U3RhdGU+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IHN0YXR1c1wiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY2hlY2tMb2NrU3RhdHVzKCk6IFByb21pc2U8VmF1bHRTdGF0dXM+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcInVubG9ja1wiLCBcIi0tY2hlY2tcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwiY2hlY2tMb2NrU3RhdHVzXCIsIFwidW5sb2NrZWRcIik7XG4gICAgICByZXR1cm4gXCJ1bmxvY2tlZFwiO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNoZWNrIGxvY2sgc3RhdHVzXCIsIGVycm9yKTtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IChlcnJvciBhcyBFeGVjYUVycm9yKS5zdGRlcnI7XG4gICAgICBpZiAoZXJyb3JNZXNzYWdlID09PSBcIlZhdWx0IGlzIGxvY2tlZC5cIikge1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJjaGVja0xvY2tTdGF0dXNcIiwgXCJsb2NrZWRcIik7XG4gICAgICAgIHJldHVybiBcImxvY2tlZFwiO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwiY2hlY2tMb2NrU3RhdHVzXCIsIFwidW5hdXRoZW50aWNhdGVkXCIpO1xuICAgICAgcmV0dXJuIFwidW5hdXRoZW50aWNhdGVkXCI7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0VGVtcGxhdGU8VCA9IGFueT4odHlwZTogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPFQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiZ2V0XCIsIFwidGVtcGxhdGVcIiwgdHlwZV0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8VD4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZXQgdGVtcGxhdGVcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGVuY29kZShpbnB1dDogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPHN0cmluZz4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJlbmNvZGVcIl0sIHsgaW5wdXQsIHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogc3Rkb3V0IH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGVuY29kZVwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2VuZXJhdGVQYXNzd29yZChvcHRpb25zPzogUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zLCBhYm9ydENvbnRyb2xsZXI/OiBBYm9ydENvbnRyb2xsZXIpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGFyZ3MgPSBvcHRpb25zID8gZ2V0UGFzc3dvcmRHZW5lcmF0aW5nQXJncyhvcHRpb25zKSA6IFtdO1xuICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiZ2VuZXJhdGVcIiwgLi4uYXJnc10sIHsgYWJvcnRDb250cm9sbGVyLCByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgcmV0dXJuIHN0ZG91dDtcbiAgfVxuXG4gIGFzeW5jIGxpc3RTZW5kcygpOiBQcm9taXNlPE1heWJlRXJyb3I8U2VuZFtdPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJsaXN0XCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFNlbmRbXT4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsaXN0IHNlbmRzXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjcmVhdGVTZW5kKHZhbHVlczogU2VuZENyZWF0ZVBheWxvYWQpOiBQcm9taXNlPE1heWJlRXJyb3I8U2VuZD4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBlcnJvcjogdGVtcGxhdGVFcnJvciwgcmVzdWx0OiB0ZW1wbGF0ZSB9ID0gYXdhaXQgdGhpcy5nZXRUZW1wbGF0ZShcbiAgICAgICAgdmFsdWVzLnR5cGUgPT09IFNlbmRUeXBlLlRleHQgPyBcInNlbmQudGV4dFwiIDogXCJzZW5kLmZpbGVcIlxuICAgICAgKTtcbiAgICAgIGlmICh0ZW1wbGF0ZUVycm9yKSB0aHJvdyB0ZW1wbGF0ZUVycm9yO1xuXG4gICAgICBjb25zdCBwYXlsb2FkID0gcHJlcGFyZVNlbmRQYXlsb2FkKHRlbXBsYXRlLCB2YWx1ZXMpO1xuICAgICAgY29uc3QgeyByZXN1bHQ6IGVuY29kZWRQYXlsb2FkLCBlcnJvcjogZW5jb2RlRXJyb3IgfSA9IGF3YWl0IHRoaXMuZW5jb2RlKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKTtcbiAgICAgIGlmIChlbmNvZGVFcnJvcikgdGhyb3cgZW5jb2RlRXJyb3I7XG5cbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcImNyZWF0ZVwiLCBlbmNvZGVkUGF5bG9hZF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG5cbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxTZW5kPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNyZWF0ZSBzZW5kXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBlZGl0U2VuZCh2YWx1ZXM6IFNlbmRDcmVhdGVQYXlsb2FkKTogUHJvbWlzZTxNYXliZUVycm9yPFNlbmQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgcmVzdWx0OiBlbmNvZGVkUGF5bG9hZCwgZXJyb3I6IGVuY29kZUVycm9yIH0gPSBhd2FpdCB0aGlzLmVuY29kZShKU09OLnN0cmluZ2lmeSh2YWx1ZXMpKTtcbiAgICAgIGlmIChlbmNvZGVFcnJvcikgdGhyb3cgZW5jb2RlRXJyb3I7XG5cbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcImVkaXRcIiwgZW5jb2RlZFBheWxvYWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFNlbmQ+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZGVsZXRlIHNlbmRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZVNlbmQoaWQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcImRlbGV0ZVwiLCBpZF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBkZWxldGUgc2VuZFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVtb3ZlU2VuZFBhc3N3b3JkKGlkOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJyZW1vdmUtcGFzc3dvcmRcIiwgaWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gcmVtb3ZlIHNlbmQgcGFzc3dvcmRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlY2VpdmVTZW5kSW5mbyh1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlY2VpdmVTZW5kT3B0aW9ucyk6IFByb21pc2U8TWF5YmVFcnJvcjxSZWNlaXZlZFNlbmQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0LCBzdGRlcnIgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJzZW5kXCIsIFwicmVjZWl2ZVwiLCB1cmwsIFwiLS1vYmpcIl0sIHtcbiAgICAgICAgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUsXG4gICAgICAgIGlucHV0OiBvcHRpb25zPy5wYXNzd29yZCxcbiAgICAgIH0pO1xuICAgICAgaWYgKCFzdGRvdXQgJiYgL0ludmFsaWQgcGFzc3dvcmQvaS50ZXN0KHN0ZGVycikpIHJldHVybiB7IGVycm9yOiBuZXcgU2VuZEludmFsaWRQYXNzd29yZEVycm9yKCkgfTtcbiAgICAgIGlmICghc3Rkb3V0ICYmIC9TZW5kIHBhc3N3b3JkL2kudGVzdChzdGRlcnIpKSByZXR1cm4geyBlcnJvcjogbmV3IFNlbmROZWVkc1Bhc3N3b3JkRXJyb3IoKSB9O1xuXG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8UmVjZWl2ZWRTZW5kPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAoZXhlY0Vycm9yIGFzIEV4ZWNhRXJyb3IpLnN0ZGVycjtcbiAgICAgIGlmICgvSW52YWxpZCBwYXNzd29yZC9naS50ZXN0KGVycm9yTWVzc2FnZSkpIHJldHVybiB7IGVycm9yOiBuZXcgU2VuZEludmFsaWRQYXNzd29yZEVycm9yKCkgfTtcbiAgICAgIGlmICgvU2VuZCBwYXNzd29yZC9naS50ZXN0KGVycm9yTWVzc2FnZSkpIHJldHVybiB7IGVycm9yOiBuZXcgU2VuZE5lZWRzUGFzc3dvcmRFcnJvcigpIH07XG5cbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gcmVjZWl2ZSBzZW5kIG9ialwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVjZWl2ZVNlbmQodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZWNlaXZlU2VuZE9wdGlvbnMpOiBQcm9taXNlPE1heWJlRXJyb3I8c3RyaW5nPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHNhdmVQYXRoLCBwYXNzd29yZCB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICAgIGNvbnN0IGFyZ3MgPSBbXCJzZW5kXCIsIFwicmVjZWl2ZVwiLCB1cmxdO1xuICAgICAgaWYgKHNhdmVQYXRoKSBhcmdzLnB1c2goXCItLW91dHB1dFwiLCBzYXZlUGF0aCk7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKGFyZ3MsIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUsIGlucHV0OiBwYXNzd29yZCB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogc3Rkb3V0IH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHJlY2VpdmUgc2VuZFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgLy8gdXRpbHMgYmVsb3dcblxuICBhc3luYyBzYXZlTGFzdFZhdWx0U3RhdHVzKGNhbGxOYW1lOiBzdHJpbmcsIHN0YXR1czogVmF1bHRTdGF0dXMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5WQVVMVF9MQVNUX1NUQVRVUywgc3RhdHVzKTtcbiAgfVxuXG4gIGFzeW5jIGdldExhc3RTYXZlZFZhdWx0U3RhdHVzKCk6IFByb21pc2U8VmF1bHRTdGF0dXMgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBsYXN0U2F2ZWRTdGF0dXMgPSBhd2FpdCBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxWYXVsdFN0YXR1cz4oTE9DQUxfU1RPUkFHRV9LRVkuVkFVTFRfTEFTVF9TVEFUVVMpO1xuICAgIGlmICghbGFzdFNhdmVkU3RhdHVzKSB7XG4gICAgICBjb25zdCB2YXVsdFN0YXR1cyA9IGF3YWl0IHRoaXMuc3RhdHVzKCk7XG4gICAgICByZXR1cm4gdmF1bHRTdGF0dXMucmVzdWx0Py5zdGF0dXM7XG4gICAgfVxuICAgIHJldHVybiBsYXN0U2F2ZWRTdGF0dXM7XG4gIH1cblxuICBwcml2YXRlIGlzUHJvbXB0V2FpdGluZ0Zvck1hc3RlclBhc3N3b3JkKHJlc3VsdDogRXhlY2FSZXR1cm5WYWx1ZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIShyZXN1bHQuc3RkZXJyICYmIHJlc3VsdC5zdGRlcnIuaW5jbHVkZXMoXCJNYXN0ZXIgcGFzc3dvcmRcIikpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVQb3N0TG9nb3V0KHJlYXNvbj86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuY2xlYXJTZXNzaW9uVG9rZW4oKTtcbiAgICBhd2FpdCB0aGlzLmNhbGxBY3Rpb25MaXN0ZW5lcnMoXCJsb2dvdXRcIiwgcmVhc29uKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlQ29tbW9uRXJyb3JzKGVycm9yOiBhbnkpOiBQcm9taXNlPHsgZXJyb3I/OiBNYW51YWxseVRocm93bkVycm9yIH0+IHtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAoZXJyb3IgYXMgRXhlY2FFcnJvcikuc3RkZXJyO1xuICAgIGlmICghZXJyb3JNZXNzYWdlKSByZXR1cm4ge307XG5cbiAgICBpZiAoL25vdCBsb2dnZWQgaW4vaS50ZXN0KGVycm9yTWVzc2FnZSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUG9zdExvZ291dCgpO1xuICAgICAgcmV0dXJuIHsgZXJyb3I6IG5ldyBOb3RMb2dnZWRJbkVycm9yKFwiTm90IGxvZ2dlZCBpblwiKSB9O1xuICAgIH1cbiAgICBpZiAoL1ByZW1pdW0gc3RhdHVzL2kudGVzdChlcnJvck1lc3NhZ2UpKSB7XG4gICAgICByZXR1cm4geyBlcnJvcjogbmV3IFByZW1pdW1GZWF0dXJlRXJyb3IoKSB9O1xuICAgIH1cbiAgICByZXR1cm4ge307XG4gIH1cblxuICBzZXRBY3Rpb25MaXN0ZW5lcjxBIGV4dGVuZHMga2V5b2YgQWN0aW9uTGlzdGVuZXJzPihhY3Rpb246IEEsIGxpc3RlbmVyOiBBY3Rpb25MaXN0ZW5lcnNbQV0pOiB0aGlzIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmFjdGlvbkxpc3RlbmVycy5nZXQoYWN0aW9uKTtcbiAgICBpZiAobGlzdGVuZXJzICYmIGxpc3RlbmVycy5zaXplID4gMCkge1xuICAgICAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWN0aW9uTGlzdGVuZXJzLnNldChhY3Rpb24sIG5ldyBTZXQoW2xpc3RlbmVyXSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbW92ZUFjdGlvbkxpc3RlbmVyPEEgZXh0ZW5kcyBrZXlvZiBBY3Rpb25MaXN0ZW5lcnM+KGFjdGlvbjogQSwgbGlzdGVuZXI6IEFjdGlvbkxpc3RlbmVyc1tBXSk6IHRoaXMge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuYWN0aW9uTGlzdGVuZXJzLmdldChhY3Rpb24pO1xuICAgIGlmIChsaXN0ZW5lcnMgJiYgbGlzdGVuZXJzLnNpemUgPiAwKSB7XG4gICAgICBsaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNhbGxBY3Rpb25MaXN0ZW5lcnM8QSBleHRlbmRzIGtleW9mIEFjdGlvbkxpc3RlbmVycz4oXG4gICAgYWN0aW9uOiBBLFxuICAgIC4uLmFyZ3M6IFBhcmFtZXRlcnM8Tm9uTnVsbGFibGU8QWN0aW9uTGlzdGVuZXJzW0FdPj5cbiAgKSB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5hY3Rpb25MaXN0ZW5lcnMuZ2V0KGFjdGlvbik7XG4gICAgaWYgKGxpc3RlbmVycyAmJiBsaXN0ZW5lcnMuc2l6ZSA+IDApIHtcbiAgICAgIGZvciAoY29uc3QgbGlzdGVuZXIgb2YgbGlzdGVuZXJzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgKGxpc3RlbmVyIGFzIGFueSk/LiguLi5hcmdzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKGBFcnJvciBjYWxsaW5nIGJpdHdhcmRlbiBhY3Rpb24gbGlzdGVuZXIgZm9yICR7YWN0aW9ufWAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2hvd1RvYXN0ID0gYXN5bmMgKHRvYXN0T3B0czogVG9hc3QuT3B0aW9ucyk6IFByb21pc2U8VG9hc3QgJiB7IHJlc3RvcmU6ICgpID0+IFByb21pc2U8dm9pZD4gfT4gPT4ge1xuICAgIGlmICh0aGlzLnRvYXN0SW5zdGFuY2UpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzU3RhdGVUb2FzdE9wdHM6IFRvYXN0Lk9wdGlvbnMgPSB7XG4gICAgICAgIG1lc3NhZ2U6IHRoaXMudG9hc3RJbnN0YW5jZS5tZXNzYWdlLFxuICAgICAgICB0aXRsZTogdGhpcy50b2FzdEluc3RhbmNlLnRpdGxlLFxuICAgICAgICBwcmltYXJ5QWN0aW9uOiB0aGlzLnRvYXN0SW5zdGFuY2UucHJpbWFyeUFjdGlvbixcbiAgICAgICAgc2Vjb25kYXJ5QWN0aW9uOiB0aGlzLnRvYXN0SW5zdGFuY2Uuc2Vjb25kYXJ5QWN0aW9uLFxuICAgICAgfTtcblxuICAgICAgaWYgKHRvYXN0T3B0cy5zdHlsZSkgdGhpcy50b2FzdEluc3RhbmNlLnN0eWxlID0gdG9hc3RPcHRzLnN0eWxlO1xuICAgICAgdGhpcy50b2FzdEluc3RhbmNlLm1lc3NhZ2UgPSB0b2FzdE9wdHMubWVzc2FnZTtcbiAgICAgIHRoaXMudG9hc3RJbnN0YW5jZS50aXRsZSA9IHRvYXN0T3B0cy50aXRsZTtcbiAgICAgIHRoaXMudG9hc3RJbnN0YW5jZS5wcmltYXJ5QWN0aW9uID0gdG9hc3RPcHRzLnByaW1hcnlBY3Rpb247XG4gICAgICB0aGlzLnRvYXN0SW5zdGFuY2Uuc2Vjb25kYXJ5QWN0aW9uID0gdG9hc3RPcHRzLnNlY29uZGFyeUFjdGlvbjtcbiAgICAgIGF3YWl0IHRoaXMudG9hc3RJbnN0YW5jZS5zaG93KCk7XG5cbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHRoaXMudG9hc3RJbnN0YW5jZSwge1xuICAgICAgICByZXN0b3JlOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5zaG93VG9hc3QocHJldmlvdXNTdGF0ZVRvYXN0T3B0cyk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdG9hc3QgPSBhd2FpdCBzaG93VG9hc3QodG9hc3RPcHRzKTtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHRvYXN0LCB7IHJlc3RvcmU6ICgpID0+IHRvYXN0LmhpZGUoKSB9KTtcbiAgICB9XG4gIH07XG59XG4iLCAiaW1wb3J0IHtCdWZmZXJ9IGZyb20gJ25vZGU6YnVmZmVyJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgY2hpbGRQcm9jZXNzIGZyb20gJ25vZGU6Y2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IGNyb3NzU3Bhd24gZnJvbSAnY3Jvc3Mtc3Bhd24nO1xuaW1wb3J0IHN0cmlwRmluYWxOZXdsaW5lIGZyb20gJ3N0cmlwLWZpbmFsLW5ld2xpbmUnO1xuaW1wb3J0IHtucG1SdW5QYXRoRW52fSBmcm9tICducG0tcnVuLXBhdGgnO1xuaW1wb3J0IG9uZXRpbWUgZnJvbSAnb25ldGltZSc7XG5pbXBvcnQge21ha2VFcnJvcn0gZnJvbSAnLi9saWIvZXJyb3IuanMnO1xuaW1wb3J0IHtub3JtYWxpemVTdGRpbywgbm9ybWFsaXplU3RkaW9Ob2RlfSBmcm9tICcuL2xpYi9zdGRpby5qcyc7XG5pbXBvcnQge3NwYXduZWRLaWxsLCBzcGF3bmVkQ2FuY2VsLCBzZXR1cFRpbWVvdXQsIHZhbGlkYXRlVGltZW91dCwgc2V0RXhpdEhhbmRsZXJ9IGZyb20gJy4vbGliL2tpbGwuanMnO1xuaW1wb3J0IHtoYW5kbGVJbnB1dCwgZ2V0U3Bhd25lZFJlc3VsdCwgbWFrZUFsbFN0cmVhbSwgdmFsaWRhdGVJbnB1dFN5bmN9IGZyb20gJy4vbGliL3N0cmVhbS5qcyc7XG5pbXBvcnQge21lcmdlUHJvbWlzZSwgZ2V0U3Bhd25lZFByb21pc2V9IGZyb20gJy4vbGliL3Byb21pc2UuanMnO1xuaW1wb3J0IHtqb2luQ29tbWFuZCwgcGFyc2VDb21tYW5kLCBnZXRFc2NhcGVkQ29tbWFuZH0gZnJvbSAnLi9saWIvY29tbWFuZC5qcyc7XG5cbmNvbnN0IERFRkFVTFRfTUFYX0JVRkZFUiA9IDEwMDAgKiAxMDAwICogMTAwO1xuXG5jb25zdCBnZXRFbnYgPSAoe2VudjogZW52T3B0aW9uLCBleHRlbmRFbnYsIHByZWZlckxvY2FsLCBsb2NhbERpciwgZXhlY1BhdGh9KSA9PiB7XG5cdGNvbnN0IGVudiA9IGV4dGVuZEVudiA/IHsuLi5wcm9jZXNzLmVudiwgLi4uZW52T3B0aW9ufSA6IGVudk9wdGlvbjtcblxuXHRpZiAocHJlZmVyTG9jYWwpIHtcblx0XHRyZXR1cm4gbnBtUnVuUGF0aEVudih7ZW52LCBjd2Q6IGxvY2FsRGlyLCBleGVjUGF0aH0pO1xuXHR9XG5cblx0cmV0dXJuIGVudjtcbn07XG5cbmNvbnN0IGhhbmRsZUFyZ3VtZW50cyA9IChmaWxlLCBhcmdzLCBvcHRpb25zID0ge30pID0+IHtcblx0Y29uc3QgcGFyc2VkID0gY3Jvc3NTcGF3bi5fcGFyc2UoZmlsZSwgYXJncywgb3B0aW9ucyk7XG5cdGZpbGUgPSBwYXJzZWQuY29tbWFuZDtcblx0YXJncyA9IHBhcnNlZC5hcmdzO1xuXHRvcHRpb25zID0gcGFyc2VkLm9wdGlvbnM7XG5cblx0b3B0aW9ucyA9IHtcblx0XHRtYXhCdWZmZXI6IERFRkFVTFRfTUFYX0JVRkZFUixcblx0XHRidWZmZXI6IHRydWUsXG5cdFx0c3RyaXBGaW5hbE5ld2xpbmU6IHRydWUsXG5cdFx0ZXh0ZW5kRW52OiB0cnVlLFxuXHRcdHByZWZlckxvY2FsOiBmYWxzZSxcblx0XHRsb2NhbERpcjogb3B0aW9ucy5jd2QgfHwgcHJvY2Vzcy5jd2QoKSxcblx0XHRleGVjUGF0aDogcHJvY2Vzcy5leGVjUGF0aCxcblx0XHRlbmNvZGluZzogJ3V0ZjgnLFxuXHRcdHJlamVjdDogdHJ1ZSxcblx0XHRjbGVhbnVwOiB0cnVlLFxuXHRcdGFsbDogZmFsc2UsXG5cdFx0d2luZG93c0hpZGU6IHRydWUsXG5cdFx0Li4ub3B0aW9ucyxcblx0fTtcblxuXHRvcHRpb25zLmVudiA9IGdldEVudihvcHRpb25zKTtcblxuXHRvcHRpb25zLnN0ZGlvID0gbm9ybWFsaXplU3RkaW8ob3B0aW9ucyk7XG5cblx0aWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgJiYgcGF0aC5iYXNlbmFtZShmaWxlLCAnLmV4ZScpID09PSAnY21kJykge1xuXHRcdC8vICMxMTZcblx0XHRhcmdzLnVuc2hpZnQoJy9xJyk7XG5cdH1cblxuXHRyZXR1cm4ge2ZpbGUsIGFyZ3MsIG9wdGlvbnMsIHBhcnNlZH07XG59O1xuXG5jb25zdCBoYW5kbGVPdXRwdXQgPSAob3B0aW9ucywgdmFsdWUsIGVycm9yKSA9PiB7XG5cdGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNCdWZmZXIodmFsdWUpKSB7XG5cdFx0Ly8gV2hlbiBgZXhlY2FTeW5jKClgIGVycm9ycywgd2Ugbm9ybWFsaXplIGl0IHRvICcnIHRvIG1pbWljIGBleGVjYSgpYFxuXHRcdHJldHVybiBlcnJvciA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogJyc7XG5cdH1cblxuXHRpZiAob3B0aW9ucy5zdHJpcEZpbmFsTmV3bGluZSkge1xuXHRcdHJldHVybiBzdHJpcEZpbmFsTmV3bGluZSh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2EoZmlsZSwgYXJncywgb3B0aW9ucykge1xuXHRjb25zdCBwYXJzZWQgPSBoYW5kbGVBcmd1bWVudHMoZmlsZSwgYXJncywgb3B0aW9ucyk7XG5cdGNvbnN0IGNvbW1hbmQgPSBqb2luQ29tbWFuZChmaWxlLCBhcmdzKTtcblx0Y29uc3QgZXNjYXBlZENvbW1hbmQgPSBnZXRFc2NhcGVkQ29tbWFuZChmaWxlLCBhcmdzKTtcblxuXHR2YWxpZGF0ZVRpbWVvdXQocGFyc2VkLm9wdGlvbnMpO1xuXG5cdGxldCBzcGF3bmVkO1xuXHR0cnkge1xuXHRcdHNwYXduZWQgPSBjaGlsZFByb2Nlc3Muc3Bhd24ocGFyc2VkLmZpbGUsIHBhcnNlZC5hcmdzLCBwYXJzZWQub3B0aW9ucyk7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0Ly8gRW5zdXJlIHRoZSByZXR1cm5lZCBlcnJvciBpcyBhbHdheXMgYm90aCBhIHByb21pc2UgYW5kIGEgY2hpbGQgcHJvY2Vzc1xuXHRcdGNvbnN0IGR1bW15U3Bhd25lZCA9IG5ldyBjaGlsZFByb2Nlc3MuQ2hpbGRQcm9jZXNzKCk7XG5cdFx0Y29uc3QgZXJyb3JQcm9taXNlID0gUHJvbWlzZS5yZWplY3QobWFrZUVycm9yKHtcblx0XHRcdGVycm9yLFxuXHRcdFx0c3Rkb3V0OiAnJyxcblx0XHRcdHN0ZGVycjogJycsXG5cdFx0XHRhbGw6ICcnLFxuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0cGFyc2VkLFxuXHRcdFx0dGltZWRPdXQ6IGZhbHNlLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IGZhbHNlLFxuXHRcdH0pKTtcblx0XHRyZXR1cm4gbWVyZ2VQcm9taXNlKGR1bW15U3Bhd25lZCwgZXJyb3JQcm9taXNlKTtcblx0fVxuXG5cdGNvbnN0IHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCk7XG5cdGNvbnN0IHRpbWVkUHJvbWlzZSA9IHNldHVwVGltZW91dChzcGF3bmVkLCBwYXJzZWQub3B0aW9ucywgc3Bhd25lZFByb21pc2UpO1xuXHRjb25zdCBwcm9jZXNzRG9uZSA9IHNldEV4aXRIYW5kbGVyKHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLCB0aW1lZFByb21pc2UpO1xuXG5cdGNvbnN0IGNvbnRleHQgPSB7aXNDYW5jZWxlZDogZmFsc2V9O1xuXG5cdHNwYXduZWQua2lsbCA9IHNwYXduZWRLaWxsLmJpbmQobnVsbCwgc3Bhd25lZC5raWxsLmJpbmQoc3Bhd25lZCkpO1xuXHRzcGF3bmVkLmNhbmNlbCA9IHNwYXduZWRDYW5jZWwuYmluZChudWxsLCBzcGF3bmVkLCBjb250ZXh0KTtcblxuXHRjb25zdCBoYW5kbGVQcm9taXNlID0gYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IFt7ZXJyb3IsIGV4aXRDb2RlLCBzaWduYWwsIHRpbWVkT3V0fSwgc3Rkb3V0UmVzdWx0LCBzdGRlcnJSZXN1bHQsIGFsbFJlc3VsdF0gPSBhd2FpdCBnZXRTcGF3bmVkUmVzdWx0KHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLCBwcm9jZXNzRG9uZSk7XG5cdFx0Y29uc3Qgc3Rkb3V0ID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCBzdGRvdXRSZXN1bHQpO1xuXHRcdGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgc3RkZXJyUmVzdWx0KTtcblx0XHRjb25zdCBhbGwgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIGFsbFJlc3VsdCk7XG5cblx0XHRpZiAoZXJyb3IgfHwgZXhpdENvZGUgIT09IDAgfHwgc2lnbmFsICE9PSBudWxsKSB7XG5cdFx0XHRjb25zdCByZXR1cm5lZEVycm9yID0gbWFrZUVycm9yKHtcblx0XHRcdFx0ZXJyb3IsXG5cdFx0XHRcdGV4aXRDb2RlLFxuXHRcdFx0XHRzaWduYWwsXG5cdFx0XHRcdHN0ZG91dCxcblx0XHRcdFx0c3RkZXJyLFxuXHRcdFx0XHRhbGwsXG5cdFx0XHRcdGNvbW1hbmQsXG5cdFx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0XHRwYXJzZWQsXG5cdFx0XHRcdHRpbWVkT3V0LFxuXHRcdFx0XHRpc0NhbmNlbGVkOiBjb250ZXh0LmlzQ2FuY2VsZWQgfHwgKHBhcnNlZC5vcHRpb25zLnNpZ25hbCA/IHBhcnNlZC5vcHRpb25zLnNpZ25hbC5hYm9ydGVkIDogZmFsc2UpLFxuXHRcdFx0XHRraWxsZWQ6IHNwYXduZWQua2lsbGVkLFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmICghcGFyc2VkLm9wdGlvbnMucmVqZWN0KSB7XG5cdFx0XHRcdHJldHVybiByZXR1cm5lZEVycm9yO1xuXHRcdFx0fVxuXG5cdFx0XHR0aHJvdyByZXR1cm5lZEVycm9yO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRleGl0Q29kZTogMCxcblx0XHRcdHN0ZG91dCxcblx0XHRcdHN0ZGVycixcblx0XHRcdGFsbCxcblx0XHRcdGZhaWxlZDogZmFsc2UsXG5cdFx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogZmFsc2UsXG5cdFx0fTtcblx0fTtcblxuXHRjb25zdCBoYW5kbGVQcm9taXNlT25jZSA9IG9uZXRpbWUoaGFuZGxlUHJvbWlzZSk7XG5cblx0aGFuZGxlSW5wdXQoc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMuaW5wdXQpO1xuXG5cdHNwYXduZWQuYWxsID0gbWFrZUFsbFN0cmVhbShzcGF3bmVkLCBwYXJzZWQub3B0aW9ucyk7XG5cblx0cmV0dXJuIG1lcmdlUHJvbWlzZShzcGF3bmVkLCBoYW5kbGVQcm9taXNlT25jZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjYVN5bmMoZmlsZSwgYXJncywgb3B0aW9ucykge1xuXHRjb25zdCBwYXJzZWQgPSBoYW5kbGVBcmd1bWVudHMoZmlsZSwgYXJncywgb3B0aW9ucyk7XG5cdGNvbnN0IGNvbW1hbmQgPSBqb2luQ29tbWFuZChmaWxlLCBhcmdzKTtcblx0Y29uc3QgZXNjYXBlZENvbW1hbmQgPSBnZXRFc2NhcGVkQ29tbWFuZChmaWxlLCBhcmdzKTtcblxuXHR2YWxpZGF0ZUlucHV0U3luYyhwYXJzZWQub3B0aW9ucyk7XG5cblx0bGV0IHJlc3VsdDtcblx0dHJ5IHtcblx0XHRyZXN1bHQgPSBjaGlsZFByb2Nlc3Muc3Bhd25TeW5jKHBhcnNlZC5maWxlLCBwYXJzZWQuYXJncywgcGFyc2VkLm9wdGlvbnMpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHRocm93IG1ha2VFcnJvcih7XG5cdFx0XHRlcnJvcixcblx0XHRcdHN0ZG91dDogJycsXG5cdFx0XHRzdGRlcnI6ICcnLFxuXHRcdFx0YWxsOiAnJyxcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdHBhcnNlZCxcblx0XHRcdHRpbWVkT3V0OiBmYWxzZSxcblx0XHRcdGlzQ2FuY2VsZWQ6IGZhbHNlLFxuXHRcdFx0a2lsbGVkOiBmYWxzZSxcblx0XHR9KTtcblx0fVxuXG5cdGNvbnN0IHN0ZG91dCA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgcmVzdWx0LnN0ZG91dCwgcmVzdWx0LmVycm9yKTtcblx0Y29uc3Qgc3RkZXJyID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCByZXN1bHQuc3RkZXJyLCByZXN1bHQuZXJyb3IpO1xuXG5cdGlmIChyZXN1bHQuZXJyb3IgfHwgcmVzdWx0LnN0YXR1cyAhPT0gMCB8fCByZXN1bHQuc2lnbmFsICE9PSBudWxsKSB7XG5cdFx0Y29uc3QgZXJyb3IgPSBtYWtlRXJyb3Ioe1xuXHRcdFx0c3Rkb3V0LFxuXHRcdFx0c3RkZXJyLFxuXHRcdFx0ZXJyb3I6IHJlc3VsdC5lcnJvcixcblx0XHRcdHNpZ25hbDogcmVzdWx0LnNpZ25hbCxcblx0XHRcdGV4aXRDb2RlOiByZXN1bHQuc3RhdHVzLFxuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0cGFyc2VkLFxuXHRcdFx0dGltZWRPdXQ6IHJlc3VsdC5lcnJvciAmJiByZXN1bHQuZXJyb3IuY29kZSA9PT0gJ0VUSU1FRE9VVCcsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogcmVzdWx0LnNpZ25hbCAhPT0gbnVsbCxcblx0XHR9KTtcblxuXHRcdGlmICghcGFyc2VkLm9wdGlvbnMucmVqZWN0KSB7XG5cdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0fVxuXG5cdFx0dGhyb3cgZXJyb3I7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGNvbW1hbmQsXG5cdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0ZXhpdENvZGU6IDAsXG5cdFx0c3Rkb3V0LFxuXHRcdHN0ZGVycixcblx0XHRmYWlsZWQ6IGZhbHNlLFxuXHRcdHRpbWVkT3V0OiBmYWxzZSxcblx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRraWxsZWQ6IGZhbHNlLFxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2FDb21tYW5kKGNvbW1hbmQsIG9wdGlvbnMpIHtcblx0Y29uc3QgW2ZpbGUsIC4uLmFyZ3NdID0gcGFyc2VDb21tYW5kKGNvbW1hbmQpO1xuXHRyZXR1cm4gZXhlY2EoZmlsZSwgYXJncywgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjYUNvbW1hbmRTeW5jKGNvbW1hbmQsIG9wdGlvbnMpIHtcblx0Y29uc3QgW2ZpbGUsIC4uLmFyZ3NdID0gcGFyc2VDb21tYW5kKGNvbW1hbmQpO1xuXHRyZXR1cm4gZXhlY2FTeW5jKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2FOb2RlKHNjcmlwdFBhdGgsIGFyZ3MsIG9wdGlvbnMgPSB7fSkge1xuXHRpZiAoYXJncyAmJiAhQXJyYXkuaXNBcnJheShhcmdzKSAmJiB0eXBlb2YgYXJncyA9PT0gJ29iamVjdCcpIHtcblx0XHRvcHRpb25zID0gYXJncztcblx0XHRhcmdzID0gW107XG5cdH1cblxuXHRjb25zdCBzdGRpbyA9IG5vcm1hbGl6ZVN0ZGlvTm9kZShvcHRpb25zKTtcblx0Y29uc3QgZGVmYXVsdEV4ZWNBcmd2ID0gcHJvY2Vzcy5leGVjQXJndi5maWx0ZXIoYXJnID0+ICFhcmcuc3RhcnRzV2l0aCgnLS1pbnNwZWN0JykpO1xuXG5cdGNvbnN0IHtcblx0XHRub2RlUGF0aCA9IHByb2Nlc3MuZXhlY1BhdGgsXG5cdFx0bm9kZU9wdGlvbnMgPSBkZWZhdWx0RXhlY0FyZ3YsXG5cdH0gPSBvcHRpb25zO1xuXG5cdHJldHVybiBleGVjYShcblx0XHRub2RlUGF0aCxcblx0XHRbXG5cdFx0XHQuLi5ub2RlT3B0aW9ucyxcblx0XHRcdHNjcmlwdFBhdGgsXG5cdFx0XHQuLi4oQXJyYXkuaXNBcnJheShhcmdzKSA/IGFyZ3MgOiBbXSksXG5cdFx0XSxcblx0XHR7XG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdFx0c3RkaW46IHVuZGVmaW5lZCxcblx0XHRcdHN0ZG91dDogdW5kZWZpbmVkLFxuXHRcdFx0c3RkZXJyOiB1bmRlZmluZWQsXG5cdFx0XHRzdGRpbyxcblx0XHRcdHNoZWxsOiBmYWxzZSxcblx0XHR9LFxuXHQpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN0cmlwRmluYWxOZXdsaW5lKGlucHV0KSB7XG5cdGNvbnN0IExGID0gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/ICdcXG4nIDogJ1xcbicuY2hhckNvZGVBdCgpO1xuXHRjb25zdCBDUiA9IHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgPyAnXFxyJyA6ICdcXHInLmNoYXJDb2RlQXQoKTtcblxuXHRpZiAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMV0gPT09IExGKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC5zbGljZSgwLCAtMSk7XG5cdH1cblxuXHRpZiAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMV0gPT09IENSKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC5zbGljZSgwLCAtMSk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59XG4iLCAiaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgdXJsIGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCBwYXRoS2V5IGZyb20gJ3BhdGgta2V5JztcblxuZXhwb3J0IGZ1bmN0aW9uIG5wbVJ1blBhdGgob3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IHtcblx0XHRjd2QgPSBwcm9jZXNzLmN3ZCgpLFxuXHRcdHBhdGg6IHBhdGhfID0gcHJvY2Vzcy5lbnZbcGF0aEtleSgpXSxcblx0XHRleGVjUGF0aCA9IHByb2Nlc3MuZXhlY1BhdGgsXG5cdH0gPSBvcHRpb25zO1xuXG5cdGxldCBwcmV2aW91cztcblx0Y29uc3QgY3dkU3RyaW5nID0gY3dkIGluc3RhbmNlb2YgVVJMID8gdXJsLmZpbGVVUkxUb1BhdGgoY3dkKSA6IGN3ZDtcblx0bGV0IGN3ZFBhdGggPSBwYXRoLnJlc29sdmUoY3dkU3RyaW5nKTtcblx0Y29uc3QgcmVzdWx0ID0gW107XG5cblx0d2hpbGUgKHByZXZpb3VzICE9PSBjd2RQYXRoKSB7XG5cdFx0cmVzdWx0LnB1c2gocGF0aC5qb2luKGN3ZFBhdGgsICdub2RlX21vZHVsZXMvLmJpbicpKTtcblx0XHRwcmV2aW91cyA9IGN3ZFBhdGg7XG5cdFx0Y3dkUGF0aCA9IHBhdGgucmVzb2x2ZShjd2RQYXRoLCAnLi4nKTtcblx0fVxuXG5cdC8vIEVuc3VyZSB0aGUgcnVubmluZyBgbm9kZWAgYmluYXJ5IGlzIHVzZWQuXG5cdHJlc3VsdC5wdXNoKHBhdGgucmVzb2x2ZShjd2RTdHJpbmcsIGV4ZWNQYXRoLCAnLi4nKSk7XG5cblx0cmV0dXJuIFsuLi5yZXN1bHQsIHBhdGhfXS5qb2luKHBhdGguZGVsaW1pdGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5wbVJ1blBhdGhFbnYoe2VudiA9IHByb2Nlc3MuZW52LCAuLi5vcHRpb25zfSA9IHt9KSB7XG5cdGVudiA9IHsuLi5lbnZ9O1xuXG5cdGNvbnN0IHBhdGggPSBwYXRoS2V5KHtlbnZ9KTtcblx0b3B0aW9ucy5wYXRoID0gZW52W3BhdGhdO1xuXHRlbnZbcGF0aF0gPSBucG1SdW5QYXRoKG9wdGlvbnMpO1xuXG5cdHJldHVybiBlbnY7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGF0aEtleShvcHRpb25zID0ge30pIHtcblx0Y29uc3Qge1xuXHRcdGVudiA9IHByb2Nlc3MuZW52LFxuXHRcdHBsYXRmb3JtID0gcHJvY2Vzcy5wbGF0Zm9ybVxuXHR9ID0gb3B0aW9ucztcblxuXHRpZiAocGxhdGZvcm0gIT09ICd3aW4zMicpIHtcblx0XHRyZXR1cm4gJ1BBVEgnO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKGVudikucmV2ZXJzZSgpLmZpbmQoa2V5ID0+IGtleS50b1VwcGVyQ2FzZSgpID09PSAnUEFUSCcpIHx8ICdQYXRoJztcbn1cbiIsICJjb25zdCBjb3B5UHJvcGVydHkgPSAodG8sIGZyb20sIHByb3BlcnR5LCBpZ25vcmVOb25Db25maWd1cmFibGUpID0+IHtcblx0Ly8gYEZ1bmN0aW9uI2xlbmd0aGAgc2hvdWxkIHJlZmxlY3QgdGhlIHBhcmFtZXRlcnMgb2YgYHRvYCBub3QgYGZyb21gIHNpbmNlIHdlIGtlZXAgaXRzIGJvZHkuXG5cdC8vIGBGdW5jdGlvbiNwcm90b3R5cGVgIGlzIG5vbi13cml0YWJsZSBhbmQgbm9uLWNvbmZpZ3VyYWJsZSBzbyBjYW4gbmV2ZXIgYmUgbW9kaWZpZWQuXG5cdGlmIChwcm9wZXJ0eSA9PT0gJ2xlbmd0aCcgfHwgcHJvcGVydHkgPT09ICdwcm90b3R5cGUnKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gYEZ1bmN0aW9uI2FyZ3VtZW50c2AgYW5kIGBGdW5jdGlvbiNjYWxsZXJgIHNob3VsZCBub3QgYmUgY29waWVkLiBUaGV5IHdlcmUgcmVwb3J0ZWQgdG8gYmUgcHJlc2VudCBpbiBgUmVmbGVjdC5vd25LZXlzYCBmb3Igc29tZSBkZXZpY2VzIGluIFJlYWN0IE5hdGl2ZSAoIzQxKSwgc28gd2UgZXhwbGljaXRseSBpZ25vcmUgdGhlbSBoZXJlLlxuXHRpZiAocHJvcGVydHkgPT09ICdhcmd1bWVudHMnIHx8IHByb3BlcnR5ID09PSAnY2FsbGVyJykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHRvRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodG8sIHByb3BlcnR5KTtcblx0Y29uc3QgZnJvbURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGZyb20sIHByb3BlcnR5KTtcblxuXHRpZiAoIWNhbkNvcHlQcm9wZXJ0eSh0b0Rlc2NyaXB0b3IsIGZyb21EZXNjcmlwdG9yKSAmJiBpZ25vcmVOb25Db25maWd1cmFibGUpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodG8sIHByb3BlcnR5LCBmcm9tRGVzY3JpcHRvcik7XG59O1xuXG4vLyBgT2JqZWN0LmRlZmluZVByb3BlcnR5KClgIHRocm93cyBpZiB0aGUgcHJvcGVydHkgZXhpc3RzLCBpcyBub3QgY29uZmlndXJhYmxlIGFuZCBlaXRoZXI6XG4vLyAtIG9uZSBpdHMgZGVzY3JpcHRvcnMgaXMgY2hhbmdlZFxuLy8gLSBpdCBpcyBub24td3JpdGFibGUgYW5kIGl0cyB2YWx1ZSBpcyBjaGFuZ2VkXG5jb25zdCBjYW5Db3B5UHJvcGVydHkgPSBmdW5jdGlvbiAodG9EZXNjcmlwdG9yLCBmcm9tRGVzY3JpcHRvcikge1xuXHRyZXR1cm4gdG9EZXNjcmlwdG9yID09PSB1bmRlZmluZWQgfHwgdG9EZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSB8fCAoXG5cdFx0dG9EZXNjcmlwdG9yLndyaXRhYmxlID09PSBmcm9tRGVzY3JpcHRvci53cml0YWJsZSAmJlxuXHRcdHRvRGVzY3JpcHRvci5lbnVtZXJhYmxlID09PSBmcm9tRGVzY3JpcHRvci5lbnVtZXJhYmxlICYmXG5cdFx0dG9EZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9PT0gZnJvbURlc2NyaXB0b3IuY29uZmlndXJhYmxlICYmXG5cdFx0KHRvRGVzY3JpcHRvci53cml0YWJsZSB8fCB0b0Rlc2NyaXB0b3IudmFsdWUgPT09IGZyb21EZXNjcmlwdG9yLnZhbHVlKVxuXHQpO1xufTtcblxuY29uc3QgY2hhbmdlUHJvdG90eXBlID0gKHRvLCBmcm9tKSA9PiB7XG5cdGNvbnN0IGZyb21Qcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZnJvbSk7XG5cdGlmIChmcm9tUHJvdG90eXBlID09PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodG8pKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0T2JqZWN0LnNldFByb3RvdHlwZU9mKHRvLCBmcm9tUHJvdG90eXBlKTtcbn07XG5cbmNvbnN0IHdyYXBwZWRUb1N0cmluZyA9ICh3aXRoTmFtZSwgZnJvbUJvZHkpID0+IGAvKiBXcmFwcGVkICR7d2l0aE5hbWV9Ki9cXG4ke2Zyb21Cb2R5fWA7XG5cbmNvbnN0IHRvU3RyaW5nRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRnVuY3Rpb24ucHJvdG90eXBlLCAndG9TdHJpbmcnKTtcbmNvbnN0IHRvU3RyaW5nTmFtZSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLCAnbmFtZScpO1xuXG4vLyBXZSBjYWxsIGBmcm9tLnRvU3RyaW5nKClgIGVhcmx5IChub3QgbGF6aWx5KSB0byBlbnN1cmUgYGZyb21gIGNhbiBiZSBnYXJiYWdlIGNvbGxlY3RlZC5cbi8vIFdlIHVzZSBgYmluZCgpYCBpbnN0ZWFkIG9mIGEgY2xvc3VyZSBmb3IgdGhlIHNhbWUgcmVhc29uLlxuLy8gQ2FsbGluZyBgZnJvbS50b1N0cmluZygpYCBlYXJseSBhbHNvIGFsbG93cyBjYWNoaW5nIGl0IGluIGNhc2UgYHRvLnRvU3RyaW5nKClgIGlzIGNhbGxlZCBzZXZlcmFsIHRpbWVzLlxuY29uc3QgY2hhbmdlVG9TdHJpbmcgPSAodG8sIGZyb20sIG5hbWUpID0+IHtcblx0Y29uc3Qgd2l0aE5hbWUgPSBuYW1lID09PSAnJyA/ICcnIDogYHdpdGggJHtuYW1lLnRyaW0oKX0oKSBgO1xuXHRjb25zdCBuZXdUb1N0cmluZyA9IHdyYXBwZWRUb1N0cmluZy5iaW5kKG51bGwsIHdpdGhOYW1lLCBmcm9tLnRvU3RyaW5nKCkpO1xuXHQvLyBFbnN1cmUgYHRvLnRvU3RyaW5nLnRvU3RyaW5nYCBpcyBub24tZW51bWVyYWJsZSBhbmQgaGFzIHRoZSBzYW1lIGBzYW1lYFxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3VG9TdHJpbmcsICduYW1lJywgdG9TdHJpbmdOYW1lKTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRvLCAndG9TdHJpbmcnLCB7Li4udG9TdHJpbmdEZXNjcmlwdG9yLCB2YWx1ZTogbmV3VG9TdHJpbmd9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1pbWljRnVuY3Rpb24odG8sIGZyb20sIHtpZ25vcmVOb25Db25maWd1cmFibGUgPSBmYWxzZX0gPSB7fSkge1xuXHRjb25zdCB7bmFtZX0gPSB0bztcblxuXHRmb3IgKGNvbnN0IHByb3BlcnR5IG9mIFJlZmxlY3Qub3duS2V5cyhmcm9tKSkge1xuXHRcdGNvcHlQcm9wZXJ0eSh0bywgZnJvbSwgcHJvcGVydHksIGlnbm9yZU5vbkNvbmZpZ3VyYWJsZSk7XG5cdH1cblxuXHRjaGFuZ2VQcm90b3R5cGUodG8sIGZyb20pO1xuXHRjaGFuZ2VUb1N0cmluZyh0bywgZnJvbSwgbmFtZSk7XG5cblx0cmV0dXJuIHRvO1xufVxuIiwgImltcG9ydCBtaW1pY0Z1bmN0aW9uIGZyb20gJ21pbWljLWZuJztcblxuY29uc3QgY2FsbGVkRnVuY3Rpb25zID0gbmV3IFdlYWtNYXAoKTtcblxuY29uc3Qgb25ldGltZSA9IChmdW5jdGlvbl8sIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRpZiAodHlwZW9mIGZ1bmN0aW9uXyAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgZnVuY3Rpb24nKTtcblx0fVxuXG5cdGxldCByZXR1cm5WYWx1ZTtcblx0bGV0IGNhbGxDb3VudCA9IDA7XG5cdGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uXy5kaXNwbGF5TmFtZSB8fCBmdW5jdGlvbl8ubmFtZSB8fCAnPGFub255bW91cz4nO1xuXG5cdGNvbnN0IG9uZXRpbWUgPSBmdW5jdGlvbiAoLi4uYXJndW1lbnRzXykge1xuXHRcdGNhbGxlZEZ1bmN0aW9ucy5zZXQob25ldGltZSwgKytjYWxsQ291bnQpO1xuXG5cdFx0aWYgKGNhbGxDb3VudCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuVmFsdWUgPSBmdW5jdGlvbl8uYXBwbHkodGhpcywgYXJndW1lbnRzXyk7XG5cdFx0XHRmdW5jdGlvbl8gPSBudWxsO1xuXHRcdH0gZWxzZSBpZiAob3B0aW9ucy50aHJvdyA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBGdW5jdGlvbiBcXGAke2Z1bmN0aW9uTmFtZX1cXGAgY2FuIG9ubHkgYmUgY2FsbGVkIG9uY2VgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XG5cdH07XG5cblx0bWltaWNGdW5jdGlvbihvbmV0aW1lLCBmdW5jdGlvbl8pO1xuXHRjYWxsZWRGdW5jdGlvbnMuc2V0KG9uZXRpbWUsIGNhbGxDb3VudCk7XG5cblx0cmV0dXJuIG9uZXRpbWU7XG59O1xuXG5vbmV0aW1lLmNhbGxDb3VudCA9IGZ1bmN0aW9uXyA9PiB7XG5cdGlmICghY2FsbGVkRnVuY3Rpb25zLmhhcyhmdW5jdGlvbl8pKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBUaGUgZ2l2ZW4gZnVuY3Rpb24gXFxgJHtmdW5jdGlvbl8ubmFtZX1cXGAgaXMgbm90IHdyYXBwZWQgYnkgdGhlIFxcYG9uZXRpbWVcXGAgcGFja2FnZWApO1xuXHR9XG5cblx0cmV0dXJuIGNhbGxlZEZ1bmN0aW9ucy5nZXQoZnVuY3Rpb25fKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG9uZXRpbWU7XG4iLCAiaW1wb3J0e2NvbnN0YW50c31mcm9tXCJub2RlOm9zXCI7XG5cbmltcG9ydHtTSUdSVE1BWH1mcm9tXCIuL3JlYWx0aW1lLmpzXCI7XG5pbXBvcnR7Z2V0U2lnbmFsc31mcm9tXCIuL3NpZ25hbHMuanNcIjtcblxuXG5cbmNvbnN0IGdldFNpZ25hbHNCeU5hbWU9ZnVuY3Rpb24oKXtcbmNvbnN0IHNpZ25hbHM9Z2V0U2lnbmFscygpO1xucmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhzaWduYWxzLm1hcChnZXRTaWduYWxCeU5hbWUpKTtcbn07XG5cbmNvbnN0IGdldFNpZ25hbEJ5TmFtZT1mdW5jdGlvbih7XG5uYW1lLFxubnVtYmVyLFxuZGVzY3JpcHRpb24sXG5zdXBwb3J0ZWQsXG5hY3Rpb24sXG5mb3JjZWQsXG5zdGFuZGFyZH0pXG57XG5yZXR1cm5bXG5uYW1lLFxue25hbWUsbnVtYmVyLGRlc2NyaXB0aW9uLHN1cHBvcnRlZCxhY3Rpb24sZm9yY2VkLHN0YW5kYXJkfV07XG5cbn07XG5cbmV4cG9ydCBjb25zdCBzaWduYWxzQnlOYW1lPWdldFNpZ25hbHNCeU5hbWUoKTtcblxuXG5cblxuY29uc3QgZ2V0U2lnbmFsc0J5TnVtYmVyPWZ1bmN0aW9uKCl7XG5jb25zdCBzaWduYWxzPWdldFNpZ25hbHMoKTtcbmNvbnN0IGxlbmd0aD1TSUdSVE1BWCsxO1xuY29uc3Qgc2lnbmFsc0E9QXJyYXkuZnJvbSh7bGVuZ3RofSwodmFsdWUsbnVtYmVyKT0+XG5nZXRTaWduYWxCeU51bWJlcihudW1iZXIsc2lnbmFscykpO1xuXG5yZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwuLi5zaWduYWxzQSk7XG59O1xuXG5jb25zdCBnZXRTaWduYWxCeU51bWJlcj1mdW5jdGlvbihudW1iZXIsc2lnbmFscyl7XG5jb25zdCBzaWduYWw9ZmluZFNpZ25hbEJ5TnVtYmVyKG51bWJlcixzaWduYWxzKTtcblxuaWYoc2lnbmFsPT09dW5kZWZpbmVkKXtcbnJldHVybnt9O1xufVxuXG5jb25zdHtuYW1lLGRlc2NyaXB0aW9uLHN1cHBvcnRlZCxhY3Rpb24sZm9yY2VkLHN0YW5kYXJkfT1zaWduYWw7XG5yZXR1cm57XG5bbnVtYmVyXTp7XG5uYW1lLFxubnVtYmVyLFxuZGVzY3JpcHRpb24sXG5zdXBwb3J0ZWQsXG5hY3Rpb24sXG5mb3JjZWQsXG5zdGFuZGFyZH19O1xuXG5cbn07XG5cblxuXG5jb25zdCBmaW5kU2lnbmFsQnlOdW1iZXI9ZnVuY3Rpb24obnVtYmVyLHNpZ25hbHMpe1xuY29uc3Qgc2lnbmFsPXNpZ25hbHMuZmluZCgoe25hbWV9KT0+Y29uc3RhbnRzLnNpZ25hbHNbbmFtZV09PT1udW1iZXIpO1xuXG5pZihzaWduYWwhPT11bmRlZmluZWQpe1xucmV0dXJuIHNpZ25hbDtcbn1cblxucmV0dXJuIHNpZ25hbHMuZmluZCgoc2lnbmFsQSk9PnNpZ25hbEEubnVtYmVyPT09bnVtYmVyKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzaWduYWxzQnlOdW1iZXI9Z2V0U2lnbmFsc0J5TnVtYmVyKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYWluLmpzLm1hcCIsICJcbmV4cG9ydCBjb25zdCBnZXRSZWFsdGltZVNpZ25hbHM9ZnVuY3Rpb24oKXtcbmNvbnN0IGxlbmd0aD1TSUdSVE1BWC1TSUdSVE1JTisxO1xucmV0dXJuIEFycmF5LmZyb20oe2xlbmd0aH0sZ2V0UmVhbHRpbWVTaWduYWwpO1xufTtcblxuY29uc3QgZ2V0UmVhbHRpbWVTaWduYWw9ZnVuY3Rpb24odmFsdWUsaW5kZXgpe1xucmV0dXJue1xubmFtZTpgU0lHUlQke2luZGV4KzF9YCxcbm51bWJlcjpTSUdSVE1JTitpbmRleCxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJBcHBsaWNhdGlvbi1zcGVjaWZpYyBzaWduYWwgKHJlYWx0aW1lKVwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifTtcblxufTtcblxuY29uc3QgU0lHUlRNSU49MzQ7XG5leHBvcnQgY29uc3QgU0lHUlRNQVg9NjQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZWFsdGltZS5qcy5tYXAiLCAiaW1wb3J0e2NvbnN0YW50c31mcm9tXCJub2RlOm9zXCI7XG5cbmltcG9ydHtTSUdOQUxTfWZyb21cIi4vY29yZS5qc1wiO1xuaW1wb3J0e2dldFJlYWx0aW1lU2lnbmFsc31mcm9tXCIuL3JlYWx0aW1lLmpzXCI7XG5cblxuXG5leHBvcnQgY29uc3QgZ2V0U2lnbmFscz1mdW5jdGlvbigpe1xuY29uc3QgcmVhbHRpbWVTaWduYWxzPWdldFJlYWx0aW1lU2lnbmFscygpO1xuY29uc3Qgc2lnbmFscz1bLi4uU0lHTkFMUywuLi5yZWFsdGltZVNpZ25hbHNdLm1hcChub3JtYWxpemVTaWduYWwpO1xucmV0dXJuIHNpZ25hbHM7XG59O1xuXG5cblxuXG5cblxuXG5jb25zdCBub3JtYWxpemVTaWduYWw9ZnVuY3Rpb24oe1xubmFtZSxcbm51bWJlcjpkZWZhdWx0TnVtYmVyLFxuZGVzY3JpcHRpb24sXG5hY3Rpb24sXG5mb3JjZWQ9ZmFsc2UsXG5zdGFuZGFyZH0pXG57XG5jb25zdHtcbnNpZ25hbHM6e1tuYW1lXTpjb25zdGFudFNpZ25hbH19PVxuY29uc3RhbnRzO1xuY29uc3Qgc3VwcG9ydGVkPWNvbnN0YW50U2lnbmFsIT09dW5kZWZpbmVkO1xuY29uc3QgbnVtYmVyPXN1cHBvcnRlZD9jb25zdGFudFNpZ25hbDpkZWZhdWx0TnVtYmVyO1xucmV0dXJue25hbWUsbnVtYmVyLGRlc2NyaXB0aW9uLHN1cHBvcnRlZCxhY3Rpb24sZm9yY2VkLHN0YW5kYXJkfTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zaWduYWxzLmpzLm1hcCIsICJcblxuZXhwb3J0IGNvbnN0IFNJR05BTFM9W1xue1xubmFtZTpcIlNJR0hVUFwiLFxubnVtYmVyOjEsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGVybWluYWwgY2xvc2VkXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHSU5UXCIsXG5udW1iZXI6MixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJVc2VyIGludGVycnVwdGlvbiB3aXRoIENUUkwtQ1wiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHUVVJVFwiLFxubnVtYmVyOjMsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIlVzZXIgaW50ZXJydXB0aW9uIHdpdGggQ1RSTC1cXFxcXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHSUxMXCIsXG5udW1iZXI6NCxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiSW52YWxpZCBtYWNoaW5lIGluc3RydWN0aW9uXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdUUkFQXCIsXG5udW1iZXI6NSxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiRGVidWdnZXIgYnJlYWtwb2ludFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0FCUlRcIixcbm51bWJlcjo2LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJBYm9ydGVkXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdJT1RcIixcbm51bWJlcjo2LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJBYm9ydGVkXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR0JVU1wiLFxubnVtYmVyOjcsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcblwiQnVzIGVycm9yIGR1ZSB0byBtaXNhbGlnbmVkLCBub24tZXhpc3RpbmcgYWRkcmVzcyBvciBwYWdpbmcgZXJyb3JcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHRU1UXCIsXG5udW1iZXI6NyxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJDb21tYW5kIHNob3VsZCBiZSBlbXVsYXRlZCBidXQgaXMgbm90IGltcGxlbWVudGVkXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHRlBFXCIsXG5udW1iZXI6OCxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiRmxvYXRpbmcgcG9pbnQgYXJpdGhtZXRpYyBlcnJvclwiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHS0lMTFwiLFxubnVtYmVyOjksXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiRm9yY2VkIHRlcm1pbmF0aW9uXCIsXG5zdGFuZGFyZDpcInBvc2l4XCIsXG5mb3JjZWQ6dHJ1ZX0sXG5cbntcbm5hbWU6XCJTSUdVU1IxXCIsXG5udW1iZXI6MTAsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQXBwbGljYXRpb24tc3BlY2lmaWMgc2lnbmFsXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHU0VHVlwiLFxubnVtYmVyOjExLFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJTZWdtZW50YXRpb24gZmF1bHRcIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR1VTUjJcIixcbm51bWJlcjoxMixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJBcHBsaWNhdGlvbi1zcGVjaWZpYyBzaWduYWxcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdQSVBFXCIsXG5udW1iZXI6MTMsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQnJva2VuIHBpcGUgb3Igc29ja2V0XCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHQUxSTVwiLFxubnVtYmVyOjE0LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlRpbWVvdXQgb3IgdGltZXJcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdURVJNXCIsXG5udW1iZXI6MTUsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGVybWluYXRpb25cIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR1NUS0ZMVFwiLFxubnVtYmVyOjE2LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlN0YWNrIGlzIGVtcHR5IG9yIG92ZXJmbG93ZWRcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdDSExEXCIsXG5udW1iZXI6MTcsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiQ2hpbGQgcHJvY2VzcyB0ZXJtaW5hdGVkLCBwYXVzZWQgb3IgdW5wYXVzZWRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdDTERcIixcbm51bWJlcjoxNyxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJDaGlsZCBwcm9jZXNzIHRlcm1pbmF0ZWQsIHBhdXNlZCBvciB1bnBhdXNlZFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR0NPTlRcIixcbm51bWJlcjoxOCxcbmFjdGlvbjpcInVucGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiVW5wYXVzZWRcIixcbnN0YW5kYXJkOlwicG9zaXhcIixcbmZvcmNlZDp0cnVlfSxcblxue1xubmFtZTpcIlNJR1NUT1BcIixcbm51bWJlcjoxOSxcbmFjdGlvbjpcInBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIlBhdXNlZFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwiLFxuZm9yY2VkOnRydWV9LFxuXG57XG5uYW1lOlwiU0lHVFNUUFwiLFxubnVtYmVyOjIwLFxuYWN0aW9uOlwicGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiUGF1c2VkIHVzaW5nIENUUkwtWiBvciBcXFwic3VzcGVuZFxcXCJcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdUVElOXCIsXG5udW1iZXI6MjEsXG5hY3Rpb246XCJwYXVzZVwiLFxuZGVzY3JpcHRpb246XCJCYWNrZ3JvdW5kIHByb2Nlc3MgY2Fubm90IHJlYWQgdGVybWluYWwgaW5wdXRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdCUkVBS1wiLFxubnVtYmVyOjIxLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlVzZXIgaW50ZXJydXB0aW9uIHdpdGggQ1RSTC1CUkVBS1wiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR1RUT1VcIixcbm51bWJlcjoyMixcbmFjdGlvbjpcInBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIkJhY2tncm91bmQgcHJvY2VzcyBjYW5ub3Qgd3JpdGUgdG8gdGVybWluYWwgb3V0cHV0XCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHVVJHXCIsXG5udW1iZXI6MjMsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiU29ja2V0IHJlY2VpdmVkIG91dC1vZi1iYW5kIGRhdGFcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHWENQVVwiLFxubnVtYmVyOjI0LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJQcm9jZXNzIHRpbWVkIG91dFwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdYRlNaXCIsXG5udW1iZXI6MjUsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkZpbGUgdG9vIGJpZ1wiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdWVEFMUk1cIixcbm51bWJlcjoyNixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUaW1lb3V0IG9yIHRpbWVyXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1BST0ZcIixcbm51bWJlcjoyNyxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUaW1lb3V0IG9yIHRpbWVyXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1dJTkNIXCIsXG5udW1iZXI6MjgsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiVGVybWluYWwgd2luZG93IHNpemUgY2hhbmdlZFwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdJT1wiLFxubnVtYmVyOjI5LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkkvTyBpcyBhdmFpbGFibGVcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdQT0xMXCIsXG5udW1iZXI6MjksXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiV2F0Y2hlZCBldmVudFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR0lORk9cIixcbm51bWJlcjoyOSxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJSZXF1ZXN0IGZvciBwcm9jZXNzIGluZm9ybWF0aW9uXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHUFdSXCIsXG5udW1iZXI6MzAsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiRGV2aWNlIHJ1bm5pbmcgb3V0IG9mIHBvd2VyXCIsXG5zdGFuZGFyZDpcInN5c3RlbXZcIn0sXG5cbntcbm5hbWU6XCJTSUdTWVNcIixcbm51bWJlcjozMSxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiSW52YWxpZCBzeXN0ZW0gY2FsbFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR1VOVVNFRFwiLFxubnVtYmVyOjMxLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkludmFsaWQgc3lzdGVtIGNhbGxcIixcbnN0YW5kYXJkOlwib3RoZXJcIn1dO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29yZS5qcy5tYXAiLCAiaW1wb3J0IHtzaWduYWxzQnlOYW1lfSBmcm9tICdodW1hbi1zaWduYWxzJztcblxuY29uc3QgZ2V0RXJyb3JQcmVmaXggPSAoe3RpbWVkT3V0LCB0aW1lb3V0LCBlcnJvckNvZGUsIHNpZ25hbCwgc2lnbmFsRGVzY3JpcHRpb24sIGV4aXRDb2RlLCBpc0NhbmNlbGVkfSkgPT4ge1xuXHRpZiAodGltZWRPdXQpIHtcblx0XHRyZXR1cm4gYHRpbWVkIG91dCBhZnRlciAke3RpbWVvdXR9IG1pbGxpc2Vjb25kc2A7XG5cdH1cblxuXHRpZiAoaXNDYW5jZWxlZCkge1xuXHRcdHJldHVybiAnd2FzIGNhbmNlbGVkJztcblx0fVxuXG5cdGlmIChlcnJvckNvZGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBgZmFpbGVkIHdpdGggJHtlcnJvckNvZGV9YDtcblx0fVxuXG5cdGlmIChzaWduYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBgd2FzIGtpbGxlZCB3aXRoICR7c2lnbmFsfSAoJHtzaWduYWxEZXNjcmlwdGlvbn0pYDtcblx0fVxuXG5cdGlmIChleGl0Q29kZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGBmYWlsZWQgd2l0aCBleGl0IGNvZGUgJHtleGl0Q29kZX1gO1xuXHR9XG5cblx0cmV0dXJuICdmYWlsZWQnO1xufTtcblxuZXhwb3J0IGNvbnN0IG1ha2VFcnJvciA9ICh7XG5cdHN0ZG91dCxcblx0c3RkZXJyLFxuXHRhbGwsXG5cdGVycm9yLFxuXHRzaWduYWwsXG5cdGV4aXRDb2RlLFxuXHRjb21tYW5kLFxuXHRlc2NhcGVkQ29tbWFuZCxcblx0dGltZWRPdXQsXG5cdGlzQ2FuY2VsZWQsXG5cdGtpbGxlZCxcblx0cGFyc2VkOiB7b3B0aW9uczoge3RpbWVvdXR9fSxcbn0pID0+IHtcblx0Ly8gYHNpZ25hbGAgYW5kIGBleGl0Q29kZWAgZW1pdHRlZCBvbiBgc3Bhd25lZC5vbignZXhpdCcpYCBldmVudCBjYW4gYmUgYG51bGxgLlxuXHQvLyBXZSBub3JtYWxpemUgdGhlbSB0byBgdW5kZWZpbmVkYFxuXHRleGl0Q29kZSA9IGV4aXRDb2RlID09PSBudWxsID8gdW5kZWZpbmVkIDogZXhpdENvZGU7XG5cdHNpZ25hbCA9IHNpZ25hbCA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IHNpZ25hbDtcblx0Y29uc3Qgc2lnbmFsRGVzY3JpcHRpb24gPSBzaWduYWwgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IHNpZ25hbHNCeU5hbWVbc2lnbmFsXS5kZXNjcmlwdGlvbjtcblxuXHRjb25zdCBlcnJvckNvZGUgPSBlcnJvciAmJiBlcnJvci5jb2RlO1xuXG5cdGNvbnN0IHByZWZpeCA9IGdldEVycm9yUHJlZml4KHt0aW1lZE91dCwgdGltZW91dCwgZXJyb3JDb2RlLCBzaWduYWwsIHNpZ25hbERlc2NyaXB0aW9uLCBleGl0Q29kZSwgaXNDYW5jZWxlZH0pO1xuXHRjb25zdCBleGVjYU1lc3NhZ2UgPSBgQ29tbWFuZCAke3ByZWZpeH06ICR7Y29tbWFuZH1gO1xuXHRjb25zdCBpc0Vycm9yID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGVycm9yKSA9PT0gJ1tvYmplY3QgRXJyb3JdJztcblx0Y29uc3Qgc2hvcnRNZXNzYWdlID0gaXNFcnJvciA/IGAke2V4ZWNhTWVzc2FnZX1cXG4ke2Vycm9yLm1lc3NhZ2V9YCA6IGV4ZWNhTWVzc2FnZTtcblx0Y29uc3QgbWVzc2FnZSA9IFtzaG9ydE1lc3NhZ2UsIHN0ZGVyciwgc3Rkb3V0XS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG5cblx0aWYgKGlzRXJyb3IpIHtcblx0XHRlcnJvci5vcmlnaW5hbE1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuXHRcdGVycm9yLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR9IGVsc2Uge1xuXHRcdGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuXHR9XG5cblx0ZXJyb3Iuc2hvcnRNZXNzYWdlID0gc2hvcnRNZXNzYWdlO1xuXHRlcnJvci5jb21tYW5kID0gY29tbWFuZDtcblx0ZXJyb3IuZXNjYXBlZENvbW1hbmQgPSBlc2NhcGVkQ29tbWFuZDtcblx0ZXJyb3IuZXhpdENvZGUgPSBleGl0Q29kZTtcblx0ZXJyb3Iuc2lnbmFsID0gc2lnbmFsO1xuXHRlcnJvci5zaWduYWxEZXNjcmlwdGlvbiA9IHNpZ25hbERlc2NyaXB0aW9uO1xuXHRlcnJvci5zdGRvdXQgPSBzdGRvdXQ7XG5cdGVycm9yLnN0ZGVyciA9IHN0ZGVycjtcblxuXHRpZiAoYWxsICE9PSB1bmRlZmluZWQpIHtcblx0XHRlcnJvci5hbGwgPSBhbGw7XG5cdH1cblxuXHRpZiAoJ2J1ZmZlcmVkRGF0YScgaW4gZXJyb3IpIHtcblx0XHRkZWxldGUgZXJyb3IuYnVmZmVyZWREYXRhO1xuXHR9XG5cblx0ZXJyb3IuZmFpbGVkID0gdHJ1ZTtcblx0ZXJyb3IudGltZWRPdXQgPSBCb29sZWFuKHRpbWVkT3V0KTtcblx0ZXJyb3IuaXNDYW5jZWxlZCA9IGlzQ2FuY2VsZWQ7XG5cdGVycm9yLmtpbGxlZCA9IGtpbGxlZCAmJiAhdGltZWRPdXQ7XG5cblx0cmV0dXJuIGVycm9yO1xufTtcbiIsICJjb25zdCBhbGlhc2VzID0gWydzdGRpbicsICdzdGRvdXQnLCAnc3RkZXJyJ107XG5cbmNvbnN0IGhhc0FsaWFzID0gb3B0aW9ucyA9PiBhbGlhc2VzLnNvbWUoYWxpYXMgPT4gb3B0aW9uc1thbGlhc10gIT09IHVuZGVmaW5lZCk7XG5cbmV4cG9ydCBjb25zdCBub3JtYWxpemVTdGRpbyA9IG9wdGlvbnMgPT4ge1xuXHRpZiAoIW9wdGlvbnMpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCB7c3RkaW99ID0gb3B0aW9ucztcblxuXHRpZiAoc3RkaW8gPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBhbGlhc2VzLm1hcChhbGlhcyA9PiBvcHRpb25zW2FsaWFzXSk7XG5cdH1cblxuXHRpZiAoaGFzQWxpYXMob3B0aW9ucykpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYEl0J3Mgbm90IHBvc3NpYmxlIHRvIHByb3ZpZGUgXFxgc3RkaW9cXGAgaW4gY29tYmluYXRpb24gd2l0aCBvbmUgb2YgJHthbGlhc2VzLm1hcChhbGlhcyA9PiBgXFxgJHthbGlhc31cXGBgKS5qb2luKCcsICcpfWApO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBzdGRpbyA9PT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gc3RkaW87XG5cdH1cblxuXHRpZiAoIUFycmF5LmlzQXJyYXkoc3RkaW8pKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgc3RkaW9cXGAgdG8gYmUgb2YgdHlwZSBcXGBzdHJpbmdcXGAgb3IgXFxgQXJyYXlcXGAsIGdvdCBcXGAke3R5cGVvZiBzdGRpb31cXGBgKTtcblx0fVxuXG5cdGNvbnN0IGxlbmd0aCA9IE1hdGgubWF4KHN0ZGlvLmxlbmd0aCwgYWxpYXNlcy5sZW5ndGgpO1xuXHRyZXR1cm4gQXJyYXkuZnJvbSh7bGVuZ3RofSwgKHZhbHVlLCBpbmRleCkgPT4gc3RkaW9baW5kZXhdKTtcbn07XG5cbi8vIGBpcGNgIGlzIHB1c2hlZCB1bmxlc3MgaXQgaXMgYWxyZWFkeSBwcmVzZW50XG5leHBvcnQgY29uc3Qgbm9ybWFsaXplU3RkaW9Ob2RlID0gb3B0aW9ucyA9PiB7XG5cdGNvbnN0IHN0ZGlvID0gbm9ybWFsaXplU3RkaW8ob3B0aW9ucyk7XG5cblx0aWYgKHN0ZGlvID09PSAnaXBjJykge1xuXHRcdHJldHVybiAnaXBjJztcblx0fVxuXG5cdGlmIChzdGRpbyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzdGRpbyA9PT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gW3N0ZGlvLCBzdGRpbywgc3RkaW8sICdpcGMnXTtcblx0fVxuXG5cdGlmIChzdGRpby5pbmNsdWRlcygnaXBjJykpIHtcblx0XHRyZXR1cm4gc3RkaW87XG5cdH1cblxuXHRyZXR1cm4gWy4uLnN0ZGlvLCAnaXBjJ107XG59O1xuIiwgImltcG9ydCBvcyBmcm9tICdub2RlOm9zJztcbmltcG9ydCBvbkV4aXQgZnJvbSAnc2lnbmFsLWV4aXQnO1xuXG5jb25zdCBERUZBVUxUX0ZPUkNFX0tJTExfVElNRU9VVCA9IDEwMDAgKiA1O1xuXG4vLyBNb25rZXktcGF0Y2hlcyBgY2hpbGRQcm9jZXNzLmtpbGwoKWAgdG8gYWRkIGBmb3JjZUtpbGxBZnRlclRpbWVvdXRgIGJlaGF2aW9yXG5leHBvcnQgY29uc3Qgc3Bhd25lZEtpbGwgPSAoa2lsbCwgc2lnbmFsID0gJ1NJR1RFUk0nLCBvcHRpb25zID0ge30pID0+IHtcblx0Y29uc3Qga2lsbFJlc3VsdCA9IGtpbGwoc2lnbmFsKTtcblx0c2V0S2lsbFRpbWVvdXQoa2lsbCwgc2lnbmFsLCBvcHRpb25zLCBraWxsUmVzdWx0KTtcblx0cmV0dXJuIGtpbGxSZXN1bHQ7XG59O1xuXG5jb25zdCBzZXRLaWxsVGltZW91dCA9IChraWxsLCBzaWduYWwsIG9wdGlvbnMsIGtpbGxSZXN1bHQpID0+IHtcblx0aWYgKCFzaG91bGRGb3JjZUtpbGwoc2lnbmFsLCBvcHRpb25zLCBraWxsUmVzdWx0KSkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHRpbWVvdXQgPSBnZXRGb3JjZUtpbGxBZnRlclRpbWVvdXQob3B0aW9ucyk7XG5cdGNvbnN0IHQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRraWxsKCdTSUdLSUxMJyk7XG5cdH0sIHRpbWVvdXQpO1xuXG5cdC8vIEd1YXJkZWQgYmVjYXVzZSB0aGVyZSdzIG5vIGAudW5yZWYoKWAgd2hlbiBgZXhlY2FgIGlzIHVzZWQgaW4gdGhlIHJlbmRlcmVyXG5cdC8vIHByb2Nlc3MgaW4gRWxlY3Ryb24uIFRoaXMgY2Fubm90IGJlIHRlc3RlZCBzaW5jZSB3ZSBkb24ndCBydW4gdGVzdHMgaW5cblx0Ly8gRWxlY3Ryb24uXG5cdC8vIGlzdGFuYnVsIGlnbm9yZSBlbHNlXG5cdGlmICh0LnVucmVmKSB7XG5cdFx0dC51bnJlZigpO1xuXHR9XG59O1xuXG5jb25zdCBzaG91bGRGb3JjZUtpbGwgPSAoc2lnbmFsLCB7Zm9yY2VLaWxsQWZ0ZXJUaW1lb3V0fSwga2lsbFJlc3VsdCkgPT4gaXNTaWd0ZXJtKHNpZ25hbCkgJiYgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0ICE9PSBmYWxzZSAmJiBraWxsUmVzdWx0O1xuXG5jb25zdCBpc1NpZ3Rlcm0gPSBzaWduYWwgPT4gc2lnbmFsID09PSBvcy5jb25zdGFudHMuc2lnbmFscy5TSUdURVJNXG5cdFx0fHwgKHR5cGVvZiBzaWduYWwgPT09ICdzdHJpbmcnICYmIHNpZ25hbC50b1VwcGVyQ2FzZSgpID09PSAnU0lHVEVSTScpO1xuXG5jb25zdCBnZXRGb3JjZUtpbGxBZnRlclRpbWVvdXQgPSAoe2ZvcmNlS2lsbEFmdGVyVGltZW91dCA9IHRydWV9KSA9PiB7XG5cdGlmIChmb3JjZUtpbGxBZnRlclRpbWVvdXQgPT09IHRydWUpIHtcblx0XHRyZXR1cm4gREVGQVVMVF9GT1JDRV9LSUxMX1RJTUVPVVQ7XG5cdH1cblxuXHRpZiAoIU51bWJlci5pc0Zpbml0ZShmb3JjZUtpbGxBZnRlclRpbWVvdXQpIHx8IGZvcmNlS2lsbEFmdGVyVGltZW91dCA8IDApIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCB0aGUgXFxgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0XFxgIG9wdGlvbiB0byBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3QgXFxgJHtmb3JjZUtpbGxBZnRlclRpbWVvdXR9XFxgICgke3R5cGVvZiBmb3JjZUtpbGxBZnRlclRpbWVvdXR9KWApO1xuXHR9XG5cblx0cmV0dXJuIGZvcmNlS2lsbEFmdGVyVGltZW91dDtcbn07XG5cbi8vIGBjaGlsZFByb2Nlc3MuY2FuY2VsKClgXG5leHBvcnQgY29uc3Qgc3Bhd25lZENhbmNlbCA9IChzcGF3bmVkLCBjb250ZXh0KSA9PiB7XG5cdGNvbnN0IGtpbGxSZXN1bHQgPSBzcGF3bmVkLmtpbGwoKTtcblxuXHRpZiAoa2lsbFJlc3VsdCkge1xuXHRcdGNvbnRleHQuaXNDYW5jZWxlZCA9IHRydWU7XG5cdH1cbn07XG5cbmNvbnN0IHRpbWVvdXRLaWxsID0gKHNwYXduZWQsIHNpZ25hbCwgcmVqZWN0KSA9PiB7XG5cdHNwYXduZWQua2lsbChzaWduYWwpO1xuXHRyZWplY3QoT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoJ1RpbWVkIG91dCcpLCB7dGltZWRPdXQ6IHRydWUsIHNpZ25hbH0pKTtcbn07XG5cbi8vIGB0aW1lb3V0YCBvcHRpb24gaGFuZGxpbmdcbmV4cG9ydCBjb25zdCBzZXR1cFRpbWVvdXQgPSAoc3Bhd25lZCwge3RpbWVvdXQsIGtpbGxTaWduYWwgPSAnU0lHVEVSTSd9LCBzcGF3bmVkUHJvbWlzZSkgPT4ge1xuXHRpZiAodGltZW91dCA9PT0gMCB8fCB0aW1lb3V0ID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gc3Bhd25lZFByb21pc2U7XG5cdH1cblxuXHRsZXQgdGltZW91dElkO1xuXHRjb25zdCB0aW1lb3V0UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHR0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHRpbWVvdXRLaWxsKHNwYXduZWQsIGtpbGxTaWduYWwsIHJlamVjdCk7XG5cdFx0fSwgdGltZW91dCk7XG5cdH0pO1xuXG5cdGNvbnN0IHNhZmVTcGF3bmVkUHJvbWlzZSA9IHNwYXduZWRQcm9taXNlLmZpbmFsbHkoKCkgPT4ge1xuXHRcdGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXHR9KTtcblxuXHRyZXR1cm4gUHJvbWlzZS5yYWNlKFt0aW1lb3V0UHJvbWlzZSwgc2FmZVNwYXduZWRQcm9taXNlXSk7XG59O1xuXG5leHBvcnQgY29uc3QgdmFsaWRhdGVUaW1lb3V0ID0gKHt0aW1lb3V0fSkgPT4ge1xuXHRpZiAodGltZW91dCAhPT0gdW5kZWZpbmVkICYmICghTnVtYmVyLmlzRmluaXRlKHRpbWVvdXQpIHx8IHRpbWVvdXQgPCAwKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIHRoZSBcXGB0aW1lb3V0XFxgIG9wdGlvbiB0byBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3QgXFxgJHt0aW1lb3V0fVxcYCAoJHt0eXBlb2YgdGltZW91dH0pYCk7XG5cdH1cbn07XG5cbi8vIGBjbGVhbnVwYCBvcHRpb24gaGFuZGxpbmdcbmV4cG9ydCBjb25zdCBzZXRFeGl0SGFuZGxlciA9IGFzeW5jIChzcGF3bmVkLCB7Y2xlYW51cCwgZGV0YWNoZWR9LCB0aW1lZFByb21pc2UpID0+IHtcblx0aWYgKCFjbGVhbnVwIHx8IGRldGFjaGVkKSB7XG5cdFx0cmV0dXJuIHRpbWVkUHJvbWlzZTtcblx0fVxuXG5cdGNvbnN0IHJlbW92ZUV4aXRIYW5kbGVyID0gb25FeGl0KCgpID0+IHtcblx0XHRzcGF3bmVkLmtpbGwoKTtcblx0fSk7XG5cblx0cmV0dXJuIHRpbWVkUHJvbWlzZS5maW5hbGx5KCgpID0+IHtcblx0XHRyZW1vdmVFeGl0SGFuZGxlcigpO1xuXHR9KTtcbn07XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGlzU3RyZWFtKHN0cmVhbSkge1xuXHRyZXR1cm4gc3RyZWFtICE9PSBudWxsXG5cdFx0JiYgdHlwZW9mIHN0cmVhbSA9PT0gJ29iamVjdCdcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLnBpcGUgPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1dyaXRhYmxlU3RyZWFtKHN0cmVhbSkge1xuXHRyZXR1cm4gaXNTdHJlYW0oc3RyZWFtKVxuXHRcdCYmIHN0cmVhbS53cml0YWJsZSAhPT0gZmFsc2Vcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLl93cml0ZSA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdCYmIHR5cGVvZiBzdHJlYW0uX3dyaXRhYmxlU3RhdGUgPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWFkYWJsZVN0cmVhbShzdHJlYW0pIHtcblx0cmV0dXJuIGlzU3RyZWFtKHN0cmVhbSlcblx0XHQmJiBzdHJlYW0ucmVhZGFibGUgIT09IGZhbHNlXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5fcmVhZCA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdCYmIHR5cGVvZiBzdHJlYW0uX3JlYWRhYmxlU3RhdGUgPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEdXBsZXhTdHJlYW0oc3RyZWFtKSB7XG5cdHJldHVybiBpc1dyaXRhYmxlU3RyZWFtKHN0cmVhbSlcblx0XHQmJiBpc1JlYWRhYmxlU3RyZWFtKHN0cmVhbSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1RyYW5zZm9ybVN0cmVhbShzdHJlYW0pIHtcblx0cmV0dXJuIGlzRHVwbGV4U3RyZWFtKHN0cmVhbSlcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLl90cmFuc2Zvcm0gPT09ICdmdW5jdGlvbic7XG59XG4iLCAiaW1wb3J0IHtpc1N0cmVhbX0gZnJvbSAnaXMtc3RyZWFtJztcbmltcG9ydCBnZXRTdHJlYW0gZnJvbSAnZ2V0LXN0cmVhbSc7XG5pbXBvcnQgbWVyZ2VTdHJlYW0gZnJvbSAnbWVyZ2Utc3RyZWFtJztcblxuLy8gYGlucHV0YCBvcHRpb25cbmV4cG9ydCBjb25zdCBoYW5kbGVJbnB1dCA9IChzcGF3bmVkLCBpbnB1dCkgPT4ge1xuXHRpZiAoaW5wdXQgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmIChpc1N0cmVhbShpbnB1dCkpIHtcblx0XHRpbnB1dC5waXBlKHNwYXduZWQuc3RkaW4pO1xuXHR9IGVsc2Uge1xuXHRcdHNwYXduZWQuc3RkaW4uZW5kKGlucHV0KTtcblx0fVxufTtcblxuLy8gYGFsbGAgaW50ZXJsZWF2ZXMgYHN0ZG91dGAgYW5kIGBzdGRlcnJgXG5leHBvcnQgY29uc3QgbWFrZUFsbFN0cmVhbSA9IChzcGF3bmVkLCB7YWxsfSkgPT4ge1xuXHRpZiAoIWFsbCB8fCAoIXNwYXduZWQuc3Rkb3V0ICYmICFzcGF3bmVkLnN0ZGVycikpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBtaXhlZCA9IG1lcmdlU3RyZWFtKCk7XG5cblx0aWYgKHNwYXduZWQuc3Rkb3V0KSB7XG5cdFx0bWl4ZWQuYWRkKHNwYXduZWQuc3Rkb3V0KTtcblx0fVxuXG5cdGlmIChzcGF3bmVkLnN0ZGVycikge1xuXHRcdG1peGVkLmFkZChzcGF3bmVkLnN0ZGVycik7XG5cdH1cblxuXHRyZXR1cm4gbWl4ZWQ7XG59O1xuXG4vLyBPbiBmYWlsdXJlLCBgcmVzdWx0LnN0ZG91dHxzdGRlcnJ8YWxsYCBzaG91bGQgY29udGFpbiB0aGUgY3VycmVudGx5IGJ1ZmZlcmVkIHN0cmVhbVxuY29uc3QgZ2V0QnVmZmVyZWREYXRhID0gYXN5bmMgKHN0cmVhbSwgc3RyZWFtUHJvbWlzZSkgPT4ge1xuXHQvLyBXaGVuIGBidWZmZXJgIGlzIGBmYWxzZWAsIGBzdHJlYW1Qcm9taXNlYCBpcyBgdW5kZWZpbmVkYCBhbmQgdGhlcmUgaXMgbm8gYnVmZmVyZWQgZGF0YSB0byByZXRyaWV2ZVxuXHRpZiAoIXN0cmVhbSB8fCBzdHJlYW1Qcm9taXNlID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRzdHJlYW0uZGVzdHJveSgpO1xuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIGF3YWl0IHN0cmVhbVByb21pc2U7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0cmV0dXJuIGVycm9yLmJ1ZmZlcmVkRGF0YTtcblx0fVxufTtcblxuY29uc3QgZ2V0U3RyZWFtUHJvbWlzZSA9IChzdHJlYW0sIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9KSA9PiB7XG5cdGlmICghc3RyZWFtIHx8ICFidWZmZXIpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAoZW5jb2RpbmcpIHtcblx0XHRyZXR1cm4gZ2V0U3RyZWFtKHN0cmVhbSwge2VuY29kaW5nLCBtYXhCdWZmZXJ9KTtcblx0fVxuXG5cdHJldHVybiBnZXRTdHJlYW0uYnVmZmVyKHN0cmVhbSwge21heEJ1ZmZlcn0pO1xufTtcblxuLy8gUmV0cmlldmUgcmVzdWx0IG9mIGNoaWxkIHByb2Nlc3M6IGV4aXQgY29kZSwgc2lnbmFsLCBlcnJvciwgc3RyZWFtcyAoc3Rkb3V0L3N0ZGVyci9hbGwpXG5leHBvcnQgY29uc3QgZ2V0U3Bhd25lZFJlc3VsdCA9IGFzeW5jICh7c3Rkb3V0LCBzdGRlcnIsIGFsbH0sIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9LCBwcm9jZXNzRG9uZSkgPT4ge1xuXHRjb25zdCBzdGRvdXRQcm9taXNlID0gZ2V0U3RyZWFtUHJvbWlzZShzdGRvdXQsIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9KTtcblx0Y29uc3Qgc3RkZXJyUHJvbWlzZSA9IGdldFN0cmVhbVByb21pc2Uoc3RkZXJyLCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyfSk7XG5cdGNvbnN0IGFsbFByb21pc2UgPSBnZXRTdHJlYW1Qcm9taXNlKGFsbCwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcjogbWF4QnVmZmVyICogMn0pO1xuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKFtwcm9jZXNzRG9uZSwgc3Rkb3V0UHJvbWlzZSwgc3RkZXJyUHJvbWlzZSwgYWxsUHJvbWlzZV0pO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHJldHVybiBQcm9taXNlLmFsbChbXG5cdFx0XHR7ZXJyb3IsIHNpZ25hbDogZXJyb3Iuc2lnbmFsLCB0aW1lZE91dDogZXJyb3IudGltZWRPdXR9LFxuXHRcdFx0Z2V0QnVmZmVyZWREYXRhKHN0ZG91dCwgc3Rkb3V0UHJvbWlzZSksXG5cdFx0XHRnZXRCdWZmZXJlZERhdGEoc3RkZXJyLCBzdGRlcnJQcm9taXNlKSxcblx0XHRcdGdldEJ1ZmZlcmVkRGF0YShhbGwsIGFsbFByb21pc2UpLFxuXHRcdF0pO1xuXHR9XG59O1xuXG5leHBvcnQgY29uc3QgdmFsaWRhdGVJbnB1dFN5bmMgPSAoe2lucHV0fSkgPT4ge1xuXHRpZiAoaXNTdHJlYW0oaW5wdXQpKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIGBpbnB1dGAgb3B0aW9uIGNhbm5vdCBiZSBhIHN0cmVhbSBpbiBzeW5jIG1vZGUnKTtcblx0fVxufTtcbiIsICIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgdW5pY29ybi9wcmVmZXItdG9wLWxldmVsLWF3YWl0XG5jb25zdCBuYXRpdmVQcm9taXNlUHJvdG90eXBlID0gKGFzeW5jICgpID0+IHt9KSgpLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcblxuY29uc3QgZGVzY3JpcHRvcnMgPSBbJ3RoZW4nLCAnY2F0Y2gnLCAnZmluYWxseSddLm1hcChwcm9wZXJ0eSA9PiBbXG5cdHByb3BlcnR5LFxuXHRSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihuYXRpdmVQcm9taXNlUHJvdG90eXBlLCBwcm9wZXJ0eSksXG5dKTtcblxuLy8gVGhlIHJldHVybiB2YWx1ZSBpcyBhIG1peGluIG9mIGBjaGlsZFByb2Nlc3NgIGFuZCBgUHJvbWlzZWBcbmV4cG9ydCBjb25zdCBtZXJnZVByb21pc2UgPSAoc3Bhd25lZCwgcHJvbWlzZSkgPT4ge1xuXHRmb3IgKGNvbnN0IFtwcm9wZXJ0eSwgZGVzY3JpcHRvcl0gb2YgZGVzY3JpcHRvcnMpIHtcblx0XHQvLyBTdGFydGluZyB0aGUgbWFpbiBgcHJvbWlzZWAgaXMgZGVmZXJyZWQgdG8gYXZvaWQgY29uc3VtaW5nIHN0cmVhbXNcblx0XHRjb25zdCB2YWx1ZSA9IHR5cGVvZiBwcm9taXNlID09PSAnZnVuY3Rpb24nXG5cdFx0XHQ/ICguLi5hcmdzKSA9PiBSZWZsZWN0LmFwcGx5KGRlc2NyaXB0b3IudmFsdWUsIHByb21pc2UoKSwgYXJncylcblx0XHRcdDogZGVzY3JpcHRvci52YWx1ZS5iaW5kKHByb21pc2UpO1xuXG5cdFx0UmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShzcGF3bmVkLCBwcm9wZXJ0eSwgey4uLmRlc2NyaXB0b3IsIHZhbHVlfSk7XG5cdH1cblxuXHRyZXR1cm4gc3Bhd25lZDtcbn07XG5cbi8vIFVzZSBwcm9taXNlcyBpbnN0ZWFkIG9mIGBjaGlsZF9wcm9jZXNzYCBldmVudHNcbmV4cG9ydCBjb25zdCBnZXRTcGF3bmVkUHJvbWlzZSA9IHNwYXduZWQgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRzcGF3bmVkLm9uKCdleGl0JywgKGV4aXRDb2RlLCBzaWduYWwpID0+IHtcblx0XHRyZXNvbHZlKHtleGl0Q29kZSwgc2lnbmFsfSk7XG5cdH0pO1xuXG5cdHNwYXduZWQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuXHRcdHJlamVjdChlcnJvcik7XG5cdH0pO1xuXG5cdGlmIChzcGF3bmVkLnN0ZGluKSB7XG5cdFx0c3Bhd25lZC5zdGRpbi5vbignZXJyb3InLCBlcnJvciA9PiB7XG5cdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdH0pO1xuXHR9XG59KTtcbiIsICJjb25zdCBub3JtYWxpemVBcmdzID0gKGZpbGUsIGFyZ3MgPSBbXSkgPT4ge1xuXHRpZiAoIUFycmF5LmlzQXJyYXkoYXJncykpIHtcblx0XHRyZXR1cm4gW2ZpbGVdO1xuXHR9XG5cblx0cmV0dXJuIFtmaWxlLCAuLi5hcmdzXTtcbn07XG5cbmNvbnN0IE5PX0VTQ0FQRV9SRUdFWFAgPSAvXltcXHcuLV0rJC87XG5jb25zdCBET1VCTEVfUVVPVEVTX1JFR0VYUCA9IC9cIi9nO1xuXG5jb25zdCBlc2NhcGVBcmcgPSBhcmcgPT4ge1xuXHRpZiAodHlwZW9mIGFyZyAhPT0gJ3N0cmluZycgfHwgTk9fRVNDQVBFX1JFR0VYUC50ZXN0KGFyZykpIHtcblx0XHRyZXR1cm4gYXJnO1xuXHR9XG5cblx0cmV0dXJuIGBcIiR7YXJnLnJlcGxhY2UoRE9VQkxFX1FVT1RFU19SRUdFWFAsICdcXFxcXCInKX1cImA7XG59O1xuXG5leHBvcnQgY29uc3Qgam9pbkNvbW1hbmQgPSAoZmlsZSwgYXJncykgPT4gbm9ybWFsaXplQXJncyhmaWxlLCBhcmdzKS5qb2luKCcgJyk7XG5cbmV4cG9ydCBjb25zdCBnZXRFc2NhcGVkQ29tbWFuZCA9IChmaWxlLCBhcmdzKSA9PiBub3JtYWxpemVBcmdzKGZpbGUsIGFyZ3MpLm1hcChhcmcgPT4gZXNjYXBlQXJnKGFyZykpLmpvaW4oJyAnKTtcblxuY29uc3QgU1BBQ0VTX1JFR0VYUCA9IC8gKy9nO1xuXG4vLyBIYW5kbGUgYGV4ZWNhQ29tbWFuZCgpYFxuZXhwb3J0IGNvbnN0IHBhcnNlQ29tbWFuZCA9IGNvbW1hbmQgPT4ge1xuXHRjb25zdCB0b2tlbnMgPSBbXTtcblx0Zm9yIChjb25zdCB0b2tlbiBvZiBjb21tYW5kLnRyaW0oKS5zcGxpdChTUEFDRVNfUkVHRVhQKSkge1xuXHRcdC8vIEFsbG93IHNwYWNlcyB0byBiZSBlc2NhcGVkIGJ5IGEgYmFja3NsYXNoIGlmIG5vdCBtZWFudCBhcyBhIGRlbGltaXRlclxuXHRcdGNvbnN0IHByZXZpb3VzVG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuXHRcdGlmIChwcmV2aW91c1Rva2VuICYmIHByZXZpb3VzVG9rZW4uZW5kc1dpdGgoJ1xcXFwnKSkge1xuXHRcdFx0Ly8gTWVyZ2UgcHJldmlvdXMgdG9rZW4gd2l0aCBjdXJyZW50IG9uZVxuXHRcdFx0dG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXSA9IGAke3ByZXZpb3VzVG9rZW4uc2xpY2UoMCwgLTEpfSAke3Rva2VufWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRva2Vucy5wdXNoKHRva2VuKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG9rZW5zO1xufTtcbiIsICIvKiBQdXQgY29uc3RhbnRzIHRoYXQgeW91IGZlZWwgbGlrZSB0aGV5IHN0aWxsIGRvbid0IGRlc2VydmUgYSBmaWxlIG9mIHRoZWlyIG93biBoZXJlICovXG5cbmltcG9ydCB7IEljb24sIEtleWJvYXJkIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgSXRlbVR5cGUgfSBmcm9tIFwifi90eXBlcy92YXVsdFwiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVJWRVJfVVJMID0gXCJodHRwczovL2JpdHdhcmRlbi5jb21cIjtcblxuZXhwb3J0IGNvbnN0IFNFTlNJVElWRV9WQUxVRV9QTEFDRUhPTERFUiA9IFwiSElEREVOLVZBTFVFXCI7XG5cbmV4cG9ydCBjb25zdCBMT0NBTF9TVE9SQUdFX0tFWSA9IHtcbiAgUEFTU1dPUkRfT1BUSU9OUzogXCJidy1nZW5lcmF0ZS1wYXNzd29yZC1vcHRpb25zXCIsXG4gIFBBU1NXT1JEX09ORV9USU1FX1dBUk5JTkc6IFwiYnctZ2VuZXJhdGUtcGFzc3dvcmQtd2FybmluZy1hY2NlcHRlZFwiLFxuICBTRVNTSU9OX1RPS0VOOiBcInNlc3Npb25Ub2tlblwiLFxuICBSRVBST01QVF9IQVNIOiBcInNlc3Npb25SZXByb21wdEhhc2hcIixcbiAgU0VSVkVSX1VSTDogXCJjbGlTZXJ2ZXJcIixcbiAgTEFTVF9BQ1RJVklUWV9USU1FOiBcImxhc3RBY3Rpdml0eVRpbWVcIixcbiAgVkFVTFRfTE9DS19SRUFTT046IFwidmF1bHRMb2NrUmVhc29uXCIsXG4gIFZBVUxUX0ZBVk9SSVRFX09SREVSOiBcInZhdWx0RmF2b3JpdGVPcmRlclwiLFxuICBWQVVMVF9MQVNUX1NUQVRVUzogXCJsYXN0VmF1bHRTdGF0dXNcIixcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBWQVVMVF9MT0NLX01FU1NBR0VTID0ge1xuICBUSU1FT1VUOiBcIlZhdWx0IHRpbWVkIG91dCBkdWUgdG8gaW5hY3Rpdml0eVwiLFxuICBNQU5VQUw6IFwiTWFudWFsbHkgbG9ja2VkIGJ5IHRoZSB1c2VyXCIsXG4gIFNZU1RFTV9MT0NLOiBcIlNjcmVlbiB3YXMgbG9ja2VkXCIsXG4gIFNZU1RFTV9TTEVFUDogXCJTeXN0ZW0gd2VudCB0byBzbGVlcFwiLFxuICBDTElfVVBEQVRFRDogXCJCaXR3YXJkZW4gaGFzIGJlZW4gdXBkYXRlZC4gUGxlYXNlIGxvZ2luIGFnYWluLlwiLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IFNIT1JUQ1VUX0tFWV9TRVFVRU5DRTogS2V5Ym9hcmQuS2V5RXF1aXZhbGVudFtdID0gW1xuICBcIjFcIixcbiAgXCIyXCIsXG4gIFwiM1wiLFxuICBcIjRcIixcbiAgXCI1XCIsXG4gIFwiNlwiLFxuICBcIjdcIixcbiAgXCI4XCIsXG4gIFwiOVwiLFxuICBcImJcIixcbiAgXCJjXCIsXG4gIFwiZFwiLFxuICBcImVcIixcbiAgXCJmXCIsXG4gIFwiZ1wiLFxuICBcImhcIixcbiAgXCJpXCIsXG4gIFwialwiLFxuICBcImtcIixcbiAgXCJsXCIsXG4gIFwibVwiLFxuICBcIm5cIixcbiAgXCJvXCIsXG4gIFwicFwiLFxuICBcInFcIixcbiAgXCJyXCIsXG4gIFwic1wiLFxuICBcInRcIixcbiAgXCJ1XCIsXG4gIFwidlwiLFxuICBcIndcIixcbiAgXCJ4XCIsXG4gIFwieVwiLFxuICBcInpcIixcbiAgXCIrXCIsXG4gIFwiLVwiLFxuICBcIi5cIixcbiAgXCIsXCIsXG5dO1xuXG5leHBvcnQgY29uc3QgRk9MREVSX09QVElPTlMgPSB7XG4gIEFMTDogXCJhbGxcIixcbiAgTk9fRk9MREVSOiBcIm5vLWZvbGRlclwiLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IENBQ0hFX0tFWVMgPSB7XG4gIElWOiBcIml2XCIsXG4gIFZBVUxUOiBcInZhdWx0XCIsXG4gIENVUlJFTlRfRk9MREVSX0lEOiBcImN1cnJlbnRGb2xkZXJJZFwiLFxuICBTRU5EX1RZUEVfRklMVEVSOiBcInNlbmRUeXBlRmlsdGVyXCIsXG4gIENMSV9WRVJTSU9OOiBcImNsaVZlcnNpb25cIixcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBJVEVNX1RZUEVfVE9fSUNPTl9NQVA6IFJlY29yZDxJdGVtVHlwZSwgSWNvbj4gPSB7XG4gIFtJdGVtVHlwZS5MT0dJTl06IEljb24uR2xvYmUsXG4gIFtJdGVtVHlwZS5DQVJEXTogSWNvbi5DcmVkaXRDYXJkLFxuICBbSXRlbVR5cGUuSURFTlRJVFldOiBJY29uLlBlcnNvbixcbiAgW0l0ZW1UeXBlLk5PVEVdOiBJY29uLkRvY3VtZW50LFxuICBbSXRlbVR5cGUuU1NIX0tFWV06IEljb24uS2V5LFxufTtcbiIsICJpbXBvcnQgeyBMb2NhbFN0b3JhZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBwYmtkZjIgfSBmcm9tIFwiY3J5cHRvXCI7XG5pbXBvcnQgeyBMT0NBTF9TVE9SQUdFX0tFWSB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBERUZBVUxUX1BBU1NXT1JEX09QVElPTlMsIFJFUFJPTVBUX0hBU0hfU0FMVCB9IGZyb20gXCJ+L2NvbnN0YW50cy9wYXNzd29yZHNcIjtcbmltcG9ydCB7IFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gXCJ+L3R5cGVzL3Bhc3N3b3Jkc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFzc3dvcmRHZW5lcmF0aW5nQXJncyhvcHRpb25zOiBQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBPYmplY3QuZW50cmllcyhvcHRpb25zKS5mbGF0TWFwKChbYXJnLCB2YWx1ZV0pID0+ICh2YWx1ZSA/IFtgLS0ke2FyZ31gLCB2YWx1ZV0gOiBbXSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzaE1hc3RlclBhc3N3b3JkRm9yUmVwcm9tcHRpbmcocGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgcGJrZGYyKHBhc3N3b3JkLCBSRVBST01QVF9IQVNIX1NBTFQsIDEwMDAwMCwgNjQsIFwic2hhNTEyXCIsIChlcnJvciwgaGFzaGVkKSA9PiB7XG4gICAgICBpZiAoZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmUoaGFzaGVkLnRvU3RyaW5nKFwiaGV4XCIpKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMoKSB7XG4gIGNvbnN0IHN0b3JlZE9wdGlvbnMgPSBhd2FpdCBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KExPQ0FMX1NUT1JBR0VfS0VZLlBBU1NXT1JEX09QVElPTlMpO1xuICByZXR1cm4ge1xuICAgIC4uLkRFRkFVTFRfUEFTU1dPUkRfT1BUSU9OUyxcbiAgICAuLi4oc3RvcmVkT3B0aW9ucyA/IEpTT04ucGFyc2Uoc3RvcmVkT3B0aW9ucykgOiB7fSksXG4gIH0gYXMgUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zO1xufVxuIiwgImltcG9ydCB7IGVudmlyb25tZW50LCBnZXRQcmVmZXJlbmNlVmFsdWVzIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgVkFVTFRfVElNRU9VVF9NU19UT19MQUJFTCB9IGZyb20gXCJ+L2NvbnN0YW50cy9sYWJlbHNcIjtcbmltcG9ydCB7IENvbW1hbmROYW1lIH0gZnJvbSBcIn4vdHlwZXMvZ2VuZXJhbFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VydmVyVXJsUHJlZmVyZW5jZSgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBjb25zdCB7IHNlcnZlclVybCB9ID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcz4oKTtcbiAgcmV0dXJuICFzZXJ2ZXJVcmwgfHwgc2VydmVyVXJsID09PSBcImJpdHdhcmRlbi5jb21cIiB8fCBzZXJ2ZXJVcmwgPT09IFwiaHR0cHM6Ly9iaXR3YXJkZW4uY29tXCIgPyB1bmRlZmluZWQgOiBzZXJ2ZXJVcmw7XG59XG5cbnR5cGUgUHJlZmVyZW5jZUtleU9mQ29tbWFuZHNXaXRoVHJhbnNpZW50T3B0aW9ucyA9XG4gIHwga2V5b2YgUHJlZmVyZW5jZXMuU2VhcmNoXG4gIHwga2V5b2YgUHJlZmVyZW5jZXMuR2VuZXJhdGVQYXNzd29yZFxuICB8IGtleW9mIFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmRRdWljaztcblxudHlwZSBUcmFuc2llbnRPcHRpb25zVmFsdWUgPVxuICB8IFByZWZlcmVuY2VzLlNlYXJjaFtcInRyYW5zaWVudENvcHlTZWFyY2hcIl1cbiAgfCBQcmVmZXJlbmNlcy5HZW5lcmF0ZVBhc3N3b3JkW1widHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmRcIl1cbiAgfCBQcmVmZXJlbmNlcy5HZW5lcmF0ZVBhc3N3b3JkUXVpY2tbXCJ0cmFuc2llbnRDb3B5R2VuZXJhdGVQYXNzd29yZFF1aWNrXCJdO1xuXG5jb25zdCBDT01NQU5EX05BTUVfVE9fUFJFRkVSRU5DRV9LRVlfTUFQOiBSZWNvcmQ8Q29tbWFuZE5hbWUsIFByZWZlcmVuY2VLZXlPZkNvbW1hbmRzV2l0aFRyYW5zaWVudE9wdGlvbnM+ID0ge1xuICBzZWFyY2g6IFwidHJhbnNpZW50Q29weVNlYXJjaFwiLFxuICBcImdlbmVyYXRlLXBhc3N3b3JkXCI6IFwidHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmRcIixcbiAgXCJnZW5lcmF0ZS1wYXNzd29yZC1xdWlja1wiOiBcInRyYW5zaWVudENvcHlHZW5lcmF0ZVBhc3N3b3JkUXVpY2tcIixcbn07XG5cbnR5cGUgUHJlZmVyZW5jZXMgPSBQcmVmZXJlbmNlcy5TZWFyY2ggJiBQcmVmZXJlbmNlcy5HZW5lcmF0ZVBhc3N3b3JkICYgUHJlZmVyZW5jZXMuR2VuZXJhdGVQYXNzd29yZFF1aWNrO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNpZW50Q29weVByZWZlcmVuY2UodHlwZTogXCJwYXNzd29yZFwiIHwgXCJvdGhlclwiKTogYm9vbGVhbiB7XG4gIGNvbnN0IHByZWZlcmVuY2VLZXkgPSBDT01NQU5EX05BTUVfVE9fUFJFRkVSRU5DRV9LRVlfTUFQW2Vudmlyb25tZW50LmNvbW1hbmROYW1lIGFzIENvbW1hbmROYW1lXTtcbiAgY29uc3QgdHJhbnNpZW50UHJlZmVyZW5jZSA9IGdldFByZWZlcmVuY2VWYWx1ZXM8UHJlZmVyZW5jZXM+KClbcHJlZmVyZW5jZUtleV0gYXMgVHJhbnNpZW50T3B0aW9uc1ZhbHVlO1xuICBpZiAodHJhbnNpZW50UHJlZmVyZW5jZSA9PT0gXCJuZXZlclwiKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0cmFuc2llbnRQcmVmZXJlbmNlID09PSBcImFsd2F5c1wiKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKHRyYW5zaWVudFByZWZlcmVuY2UgPT09IFwicGFzc3dvcmRzXCIpIHJldHVybiB0eXBlID09PSBcInBhc3N3b3JkXCI7XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGFiZWxGb3JUaW1lb3V0UHJlZmVyZW5jZSh0aW1lb3V0OiBzdHJpbmcgfCBudW1iZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gVkFVTFRfVElNRU9VVF9NU19UT19MQUJFTFt0aW1lb3V0IGFzIGtleW9mIHR5cGVvZiBWQVVMVF9USU1FT1VUX01TX1RPX0xBQkVMXTtcbn1cbiIsICJjb25zdCBWQVVMVF9USU1FT1VUX09QVElPTlMgPSB7XG4gIElNTUVESUFURUxZOiBcIjBcIixcbiAgT05FX01JTlVURTogXCI2MDAwMFwiLFxuICBGSVZFX01JTlVURVM6IFwiMzAwMDAwXCIsXG4gIEZJRlRFRU5fTUlOVVRFUzogXCI5MDAwMDBcIixcbiAgVEhJUlRZX01JTlVURVM6IFwiMTgwMDAwMFwiLFxuICBPTkVfSE9VUjogXCIzNjAwMDAwXCIsXG4gIEZPVVJfSE9VUlM6IFwiMTQ0MDAwMDBcIixcbiAgRUlHSFRfSE9VUlM6IFwiMjg4MDAwMDBcIixcbiAgT05FX0RBWTogXCI4NjQwMDAwMFwiLFxuICBORVZFUjogXCItMVwiLFxuICBTWVNURU1fTE9DSzogXCItMlwiLFxuICBTWVNURU1fU0xFRVA6IFwiLTNcIixcbn0gYXMgY29uc3Qgc2F0aXNmaWVzIFJlY29yZDxzdHJpbmcsIFByZWZlcmVuY2VzW1wicmVwcm9tcHRJZ25vcmVEdXJhdGlvblwiXT47XG5cbmV4cG9ydCBjb25zdCBWQVVMVF9USU1FT1VUID0gT2JqZWN0LmVudHJpZXMoVkFVTFRfVElNRU9VVF9PUFRJT05TKS5yZWR1Y2UoKGFjYywgW2tleSwgdmFsdWVdKSA9PiB7XG4gIGFjY1trZXkgYXMga2V5b2YgdHlwZW9mIFZBVUxUX1RJTUVPVVRfT1BUSU9OU10gPSBwYXJzZUludCh2YWx1ZSk7XG4gIHJldHVybiBhY2M7XG59LCB7fSBhcyBSZWNvcmQ8a2V5b2YgdHlwZW9mIFZBVUxUX1RJTUVPVVRfT1BUSU9OUywgbnVtYmVyPik7XG4iLCAiaW1wb3J0IHsgVkFVTFRfVElNRU9VVCB9IGZyb20gXCJ+L2NvbnN0YW50cy9wcmVmZXJlbmNlc1wiO1xuaW1wb3J0IHsgQ2FyZCwgSWRlbnRpdHksIEl0ZW1UeXBlIH0gZnJvbSBcIn4vdHlwZXMvdmF1bHRcIjtcblxuZXhwb3J0IGNvbnN0IFZBVUxUX1RJTUVPVVRfTVNfVE9fTEFCRUw6IFBhcnRpYWw8UmVjb3JkPGtleW9mIHR5cGVvZiBWQVVMVF9USU1FT1VULCBzdHJpbmc+PiA9IHtcbiAgW1ZBVUxUX1RJTUVPVVQuSU1NRURJQVRFTFldOiBcIkltbWVkaWF0ZWx5XCIsXG4gIFtWQVVMVF9USU1FT1VULk9ORV9NSU5VVEVdOiBcIjEgTWludXRlXCIsXG4gIFtWQVVMVF9USU1FT1VULkZJVkVfTUlOVVRFU106IFwiNSBNaW51dGVzXCIsXG4gIFtWQVVMVF9USU1FT1VULkZJRlRFRU5fTUlOVVRFU106IFwiMTUgTWludXRlc1wiLFxuICBbVkFVTFRfVElNRU9VVC5USElSVFlfTUlOVVRFU106IFwiMzAgTWludXRlc1wiLFxuICBbVkFVTFRfVElNRU9VVC5PTkVfSE9VUl06IFwiMSBIb3VyXCIsXG4gIFtWQVVMVF9USU1FT1VULkZPVVJfSE9VUlNdOiBcIjQgSG91cnNcIixcbiAgW1ZBVUxUX1RJTUVPVVQuRUlHSFRfSE9VUlNdOiBcIjggSG91cnNcIixcbiAgW1ZBVUxUX1RJTUVPVVQuT05FX0RBWV06IFwiMSBEYXlcIixcbn07XG5cbmV4cG9ydCBjb25zdCBDQVJEX0tFWV9MQUJFTDogUmVjb3JkPGtleW9mIENhcmQsIHN0cmluZz4gPSB7XG4gIGNhcmRob2xkZXJOYW1lOiBcIkNhcmRob2xkZXIgbmFtZVwiLFxuICBicmFuZDogXCJCcmFuZFwiLFxuICBudW1iZXI6IFwiTnVtYmVyXCIsXG4gIGV4cE1vbnRoOiBcIkV4cGlyYXRpb24gbW9udGhcIixcbiAgZXhwWWVhcjogXCJFeHBpcmF0aW9uIHllYXJcIixcbiAgY29kZTogXCJTZWN1cml0eSBjb2RlIChDVlYpXCIsXG59O1xuXG5leHBvcnQgY29uc3QgSURFTlRJVFlfS0VZX0xBQkVMOiBSZWNvcmQ8a2V5b2YgSWRlbnRpdHksIHN0cmluZz4gPSB7XG4gIHRpdGxlOiBcIlRpdGxlXCIsXG4gIGZpcnN0TmFtZTogXCJGaXJzdCBuYW1lXCIsXG4gIG1pZGRsZU5hbWU6IFwiTWlkZGxlIG5hbWVcIixcbiAgbGFzdE5hbWU6IFwiTGFzdCBuYW1lXCIsXG4gIHVzZXJuYW1lOiBcIlVzZXJuYW1lXCIsXG4gIGNvbXBhbnk6IFwiQ29tcGFueVwiLFxuICBzc246IFwiU29jaWFsIFNlY3VyaXR5IG51bWJlclwiLFxuICBwYXNzcG9ydE51bWJlcjogXCJQYXNzcG9ydCBudW1iZXJcIixcbiAgbGljZW5zZU51bWJlcjogXCJMaWNlbnNlIG51bWJlclwiLFxuICBlbWFpbDogXCJFbWFpbFwiLFxuICBwaG9uZTogXCJQaG9uZVwiLFxuICBhZGRyZXNzMTogXCJBZGRyZXNzIDFcIixcbiAgYWRkcmVzczI6IFwiQWRkcmVzcyAyXCIsXG4gIGFkZHJlc3MzOiBcIkFkZHJlc3MgM1wiLFxuICBjaXR5OiBcIkNpdHkgLyBUb3duXCIsXG4gIHN0YXRlOiBcIlN0YXRlIC8gUHJvdmluY2VcIixcbiAgcG9zdGFsQ29kZTogXCJaaXAgLyBQb3N0YWwgY29kZVwiLFxuICBjb3VudHJ5OiBcIkNvdW50cnlcIixcbn07XG5cbmV4cG9ydCBjb25zdCBJVEVNX1RZUEVfVE9fTEFCRUw6IFJlY29yZDxJdGVtVHlwZSwgc3RyaW5nPiA9IHtcbiAgW0l0ZW1UeXBlLkxPR0lOXTogXCJMb2dpblwiLFxuICBbSXRlbVR5cGUuQ0FSRF06IFwiQ2FyZFwiLFxuICBbSXRlbVR5cGUuSURFTlRJVFldOiBcIklkZW50aXR5XCIsXG4gIFtJdGVtVHlwZS5OT1RFXTogXCJTZWN1cmUgTm90ZVwiLFxuICBbSXRlbVR5cGUuU1NIX0tFWV06IFwiU1NIIEtleVwiLFxufTtcbiIsICJleHBvcnQgY2xhc3MgTWFudWFsbHlUaHJvd25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGlzcGxheWFibGVFcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgc3RhY2spO1xuICB9XG59XG5cbi8qIC0tIHNwZWNpZmljIGVycm9ycyBiZWxvdyAtLSAqL1xuXG5leHBvcnQgY2xhc3MgQ0xJTm90Rm91bmRFcnJvciBleHRlbmRzIERpc3BsYXlhYmxlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIkJpdHdhcmRlbiBDTEkgbm90IGZvdW5kXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIkNMSU5vdEZvdW5kRXJyb3JcIjtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEluc3RhbGxlZENMSU5vdEZvdW5kRXJyb3IgZXh0ZW5kcyBEaXNwbGF5YWJsZUVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJCaXR3YXJkZW4gQ0xJIG5vdCBmb3VuZFwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJJbnN0YWxsZWRDTElOb3RGb3VuZEVycm9yXCI7XG4gICAgdGhpcy5zdGFjayA9IHN0YWNrO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGYWlsZWRUb0xvYWRWYXVsdEl0ZW1zRXJyb3IgZXh0ZW5kcyBNYW51YWxseVRocm93bkVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiRmFpbGVkIHRvIGxvYWQgdmF1bHQgaXRlbXNcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiRmFpbGVkVG9Mb2FkVmF1bHRJdGVtc0Vycm9yXCI7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFZhdWx0SXNMb2NrZWRFcnJvciBleHRlbmRzIERpc3BsYXlhYmxlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJWYXVsdCBpcyBsb2NrZWRcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiVmF1bHRJc0xvY2tlZEVycm9yXCI7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE5vdExvZ2dlZEluRXJyb3IgZXh0ZW5kcyBNYW51YWxseVRocm93bkVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJOb3QgbG9nZ2VkIGluXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIk5vdExvZ2dlZEluRXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRW5zdXJlQ2xpQmluRXJyb3IgZXh0ZW5kcyBEaXNwbGF5YWJsZUVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiRmFpbGVkIGRvIGRvd25sb2FkIEJpdHdhcmRlbiBDTElcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiRW5zdXJlQ2xpQmluRXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJlbWl1bUZlYXR1cmVFcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJQcmVtaXVtIHN0YXR1cyBpcyByZXF1aXJlZCB0byB1c2UgdGhpcyBmZWF0dXJlXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIlByZW1pdW1GZWF0dXJlRXJyb3JcIjtcbiAgfVxufVxuZXhwb3J0IGNsYXNzIFNlbmROZWVkc1Bhc3N3b3JkRXJyb3IgZXh0ZW5kcyBNYW51YWxseVRocm93bkVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiVGhpcyBTZW5kIGhhcyBhIGlzIHByb3RlY3RlZCBieSBhIHBhc3N3b3JkXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNlbmROZWVkc1Bhc3N3b3JkRXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2VuZEludmFsaWRQYXNzd29yZEVycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIlRoZSBwYXNzd29yZCB5b3UgZW50ZXJlZCBpcyBpbnZhbGlkXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIlNlbmRJbnZhbGlkUGFzc3dvcmRFcnJvclwiO1xuICB9XG59XG5cbi8qIC0tIGVycm9yIHV0aWxzIGJlbG93IC0tICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cnlFeGVjPFQ+KGZuOiAoKSA9PiBUKTogVCBleHRlbmRzIHZvaWQgPyBUIDogVCB8IHVuZGVmaW5lZDtcbmV4cG9ydCBmdW5jdGlvbiB0cnlFeGVjPFQsIEY+KGZuOiAoKSA9PiBULCBmYWxsYmFja1ZhbHVlOiBGKTogVCB8IEY7XG5leHBvcnQgZnVuY3Rpb24gdHJ5RXhlYzxULCBGPihmbjogKCkgPT4gVCwgZmFsbGJhY2tWYWx1ZT86IEYpOiBUIHwgRiB8IHVuZGVmaW5lZCB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGZuKCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxsYmFja1ZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREaXNwbGF5YWJsZUVycm9yTWVzc2FnZShlcnJvcjogYW55KSB7XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIERpc3BsYXlhYmxlRXJyb3IpIHJldHVybiBlcnJvci5tZXNzYWdlO1xuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgY29uc3QgZ2V0RXJyb3JTdHJpbmcgPSAoZXJyb3I6IGFueSk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG4gIGlmICghZXJyb3IpIHJldHVybiB1bmRlZmluZWQ7XG4gIGlmICh0eXBlb2YgZXJyb3IgPT09IFwic3RyaW5nXCIpIHJldHVybiBlcnJvcjtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICBjb25zdCB7IG1lc3NhZ2UsIG5hbWUgfSA9IGVycm9yO1xuICAgIGlmIChlcnJvci5zdGFjaykgcmV0dXJuIGVycm9yLnN0YWNrO1xuICAgIHJldHVybiBgJHtuYW1lfTogJHttZXNzYWdlfWA7XG4gIH1cbiAgcmV0dXJuIFN0cmluZyhlcnJvcik7XG59O1xuXG5leHBvcnQgdHlwZSBTdWNjZXNzPFQ+ID0gW1QsIG51bGxdO1xuZXhwb3J0IHR5cGUgRmFpbHVyZTxFPiA9IFtudWxsLCBFXTtcbmV4cG9ydCB0eXBlIFJlc3VsdDxULCBFID0gRXJyb3I+ID0gU3VjY2VzczxUPiB8IEZhaWx1cmU8RT47XG5cbmV4cG9ydCBmdW5jdGlvbiBPazxUPihkYXRhOiBUKTogU3VjY2VzczxUPiB7XG4gIHJldHVybiBbZGF0YSwgbnVsbF07XG59XG5leHBvcnQgZnVuY3Rpb24gRXJyPEUgPSBFcnJvcj4oZXJyb3I6IEUpOiBGYWlsdXJlPEU+IHtcbiAgcmV0dXJuIFtudWxsLCBlcnJvcl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnlDYXRjaDxULCBFID0gRXJyb3I+KGZuOiAoKSA9PiBUKTogUmVzdWx0PFQsIEU+O1xuZXhwb3J0IGZ1bmN0aW9uIHRyeUNhdGNoPFQsIEUgPSBFcnJvcj4ocHJvbWlzZTogUHJvbWlzZTxUPik6IFByb21pc2U8UmVzdWx0PFQsIEU+Pjtcbi8qKlxuICogRXhlY3V0ZXMgYSBmdW5jdGlvbiBvciBhIHByb21pc2Ugc2FmZWx5IGluc2lkZSBhIHRyeS9jYXRjaCBhbmRcbiAqIHJldHVybnMgYSBgUmVzdWx0YCAoYFtkYXRhLCBlcnJvcl1gKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyeUNhdGNoPFQsIEUgPSBFcnJvcj4oZm5PclByb21pc2U6ICgoKSA9PiBUKSB8IFByb21pc2U8VD4pOiBNYXliZVByb21pc2U8UmVzdWx0PFQsIEU+PiB7XG4gIGlmICh0eXBlb2YgZm5PclByb21pc2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gT2soZm5PclByb21pc2UoKSk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgcmV0dXJuIEVycihlcnJvcik7XG4gICAgfVxuICB9XG4gIHJldHVybiBmbk9yUHJvbWlzZS50aGVuKChkYXRhKSA9PiBPayhkYXRhKSkuY2F0Y2goKGVycm9yKSA9PiBFcnIoZXJyb3IpKTtcbn1cbiIsICJpbXBvcnQgeyBleGlzdHNTeW5jLCBta2RpclN5bmMsIHN0YXRTeW5jLCB1bmxpbmtTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyByZWFkZGlyLCB1bmxpbmsgfSBmcm9tIFwiZnMvcHJvbWlzZXNcIjtcbmltcG9ydCB7IGpvaW4gfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHN0cmVhbVppcCBmcm9tIFwibm9kZS1zdHJlYW0temlwXCI7XG5pbXBvcnQgeyB0cnlFeGVjIH0gZnJvbSBcIn4vdXRpbHMvZXJyb3JzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yRmlsZUF2YWlsYWJsZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmICghZXhpc3RzU3luYyhwYXRoKSkgcmV0dXJuO1xuICAgICAgY29uc3Qgc3RhdHMgPSBzdGF0U3luYyhwYXRoKTtcbiAgICAgIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0sIDMwMCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcihgRmlsZSAke3BhdGh9IG5vdCBmb3VuZC5gKSk7XG4gICAgfSwgNTAwMCk7XG4gIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjb21wcmVzc0ZpbGUoZmlsZVBhdGg6IHN0cmluZywgdGFyZ2V0UGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IHppcCA9IG5ldyBzdHJlYW1aaXAuYXN5bmMoeyBmaWxlOiBmaWxlUGF0aCB9KTtcbiAgaWYgKCFleGlzdHNTeW5jKHRhcmdldFBhdGgpKSBta2RpclN5bmModGFyZ2V0UGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gIGF3YWl0IHppcC5leHRyYWN0KG51bGwsIHRhcmdldFBhdGgpO1xuICBhd2FpdCB6aXAuY2xvc2UoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZUZpbGVzVGhhdFN0YXJ0V2l0aChzdGFydGluZ1dpdGg6IHN0cmluZywgcGF0aDogc3RyaW5nKSB7XG4gIGxldCByZW1vdmVkQXRMZWFzdE9uZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgcmVhZGRpcihwYXRoKTtcbiAgICBmb3IgYXdhaXQgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgIGlmICghZmlsZS5zdGFydHNXaXRoKHN0YXJ0aW5nV2l0aCkpIGNvbnRpbnVlO1xuICAgICAgYXdhaXQgdHJ5RXhlYyhhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHVubGluayhqb2luKHBhdGgsIGZpbGUpKTtcbiAgICAgICAgcmVtb3ZlZEF0TGVhc3RPbmUgPSB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHJlbW92ZWRBdExlYXN0T25lO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHVubGlua0FsbFN5bmMoLi4ucGF0aHM6IHN0cmluZ1tdKSB7XG4gIGZvciAoY29uc3QgcGF0aCBvZiBwYXRocykge1xuICAgIHRyeUV4ZWMoKCkgPT4gdW5saW5rU3luYyhwYXRoKSk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBjcmVhdGVXcml0ZVN0cmVhbSwgdW5saW5rIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgaHR0cCBmcm9tIFwiaHR0cFwiO1xuaW1wb3J0IGh0dHBzIGZyb20gXCJodHRwc1wiO1xuaW1wb3J0IHsgY2FwdHVyZUV4Y2VwdGlvbiB9IGZyb20gXCJ+L3V0aWxzL2RldmVsb3BtZW50XCI7XG5pbXBvcnQgeyBnZXRGaWxlU2hhMjU2IH0gZnJvbSBcIn4vdXRpbHMvY3J5cHRvXCI7XG5pbXBvcnQgeyB3YWl0Rm9yRmlsZUF2YWlsYWJsZSB9IGZyb20gXCJ+L3V0aWxzL2ZzXCI7XG5cbnR5cGUgRG93bmxvYWRPcHRpb25zID0ge1xuICBvblByb2dyZXNzPzogKHBlcmNlbnQ6IG51bWJlcikgPT4gdm9pZDtcbiAgc2hhMjU2Pzogc3RyaW5nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRvd25sb2FkKHVybDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIG9wdGlvbnM/OiBEb3dubG9hZE9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgeyBvblByb2dyZXNzLCBzaGEyNTYgfSA9IG9wdGlvbnMgPz8ge307XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB1cmkgPSBuZXcgVVJMKHVybCk7XG4gICAgY29uc3QgcHJvdG9jb2wgPSB1cmkucHJvdG9jb2wgPT09IFwiaHR0cHM6XCIgPyBodHRwcyA6IGh0dHA7XG5cbiAgICBsZXQgcmVkaXJlY3RDb3VudCA9IDA7XG4gICAgY29uc3QgcmVxdWVzdCA9IHByb3RvY29sLmdldCh1cmkuaHJlZiwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSAmJiByZXNwb25zZS5zdGF0dXNDb2RlID49IDMwMCAmJiByZXNwb25zZS5zdGF0dXNDb2RlIDwgNDAwKSB7XG4gICAgICAgIHJlcXVlc3QuZGVzdHJveSgpO1xuICAgICAgICByZXNwb25zZS5kZXN0cm95KCk7XG5cbiAgICAgICAgY29uc3QgcmVkaXJlY3RVcmwgPSByZXNwb25zZS5oZWFkZXJzLmxvY2F0aW9uO1xuICAgICAgICBpZiAoIXJlZGlyZWN0VXJsKSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgUmVkaXJlY3QgcmVzcG9uc2Ugd2l0aG91dCBsb2NhdGlvbiBoZWFkZXJgKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCsrcmVkaXJlY3RDb3VudCA+PSAxMCkge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJUb28gbWFueSByZWRpcmVjdHNcIikpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvd25sb2FkKHJlZGlyZWN0VXJsLCBwYXRoLCBvcHRpb25zKS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgIT09IDIwMCkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBSZXNwb25zZSBzdGF0dXMgJHtyZXNwb25zZS5zdGF0dXNDb2RlfTogJHtyZXNwb25zZS5zdGF0dXNNZXNzYWdlfWApKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBmaWxlU2l6ZSA9IHBhcnNlSW50KHJlc3BvbnNlLmhlYWRlcnNbXCJjb250ZW50LWxlbmd0aFwiXSB8fCBcIjBcIiwgMTApO1xuICAgICAgaWYgKGZpbGVTaXplID09PSAwKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJJbnZhbGlkIGZpbGUgc2l6ZVwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsZVN0cmVhbSA9IGNyZWF0ZVdyaXRlU3RyZWFtKHBhdGgsIHsgYXV0b0Nsb3NlOiB0cnVlIH0pO1xuICAgICAgbGV0IGRvd25sb2FkZWRCeXRlcyA9IDA7XG5cbiAgICAgIGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7XG4gICAgICAgIHJlcXVlc3QuZGVzdHJveSgpO1xuICAgICAgICByZXNwb25zZS5kZXN0cm95KCk7XG4gICAgICAgIGZpbGVTdHJlYW0uY2xvc2UoKTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGNsZWFudXBBbmRSZWplY3QgPSAoZXJyb3I/OiBFcnJvcikgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9O1xuXG4gICAgICByZXNwb25zZS5vbihcImRhdGFcIiwgKGNodW5rKSA9PiB7XG4gICAgICAgIGRvd25sb2FkZWRCeXRlcyArPSBjaHVuay5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHBlcmNlbnQgPSBNYXRoLmZsb29yKChkb3dubG9hZGVkQnl0ZXMgLyBmaWxlU2l6ZSkgKiAxMDApO1xuICAgICAgICBvblByb2dyZXNzPy4ocGVyY2VudCk7XG4gICAgICB9KTtcblxuICAgICAgZmlsZVN0cmVhbS5vbihcImZpbmlzaFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgd2FpdEZvckZpbGVBdmFpbGFibGUocGF0aCk7XG4gICAgICAgICAgaWYgKHNoYTI1NikgYXdhaXQgd2FpdEZvckhhc2hUb01hdGNoKHBhdGgsIHNoYTI1Nik7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZmlsZVN0cmVhbS5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKGBGaWxlIHN0cmVhbSBlcnJvciB3aGlsZSBkb3dubG9hZGluZyAke3VybH1gLCBlcnJvcik7XG4gICAgICAgIHVubGluayhwYXRoLCAoKSA9PiBjbGVhbnVwQW5kUmVqZWN0KGVycm9yKSk7XG4gICAgICB9KTtcblxuICAgICAgcmVzcG9uc2Uub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcbiAgICAgICAgY2FwdHVyZUV4Y2VwdGlvbihgUmVzcG9uc2UgZXJyb3Igd2hpbGUgZG93bmxvYWRpbmcgJHt1cmx9YCwgZXJyb3IpO1xuICAgICAgICB1bmxpbmsocGF0aCwgKCkgPT4gY2xlYW51cEFuZFJlamVjdChlcnJvcikpO1xuICAgICAgfSk7XG5cbiAgICAgIHJlcXVlc3Qub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcbiAgICAgICAgY2FwdHVyZUV4Y2VwdGlvbihgUmVxdWVzdCBlcnJvciB3aGlsZSBkb3dubG9hZGluZyAke3VybH1gLCBlcnJvcik7XG4gICAgICAgIHVubGluayhwYXRoLCAoKSA9PiBjbGVhbnVwQW5kUmVqZWN0KGVycm9yKSk7XG4gICAgICB9KTtcblxuICAgICAgcmVzcG9uc2UucGlwZShmaWxlU3RyZWFtKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3JIYXNoVG9NYXRjaChwYXRoOiBzdHJpbmcsIHNoYTI1Njogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgZmlsZVNoYSA9IGdldEZpbGVTaGEyNTYocGF0aCk7XG4gICAgaWYgKCFmaWxlU2hhKSByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihgQ291bGQgbm90IGdlbmVyYXRlIGhhc2ggZm9yIGZpbGUgJHtwYXRofS5gKSk7XG4gICAgaWYgKGZpbGVTaGEgPT09IHNoYTI1NikgcmV0dXJuIHJlc29sdmUoKTtcblxuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgaWYgKGdldEZpbGVTaGEyNTYocGF0aCkgPT09IHNoYTI1Nikge1xuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0sIDEwMDApO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoYEhhc2ggZGlkIG5vdCBtYXRjaCwgZXhwZWN0ZWQgJHtzaGEyNTYuc3Vic3RyaW5nKDAsIDcpfSwgZ290ICR7ZmlsZVNoYS5zdWJzdHJpbmcoMCwgNyl9LmApKTtcbiAgICB9LCA1MDAwKTtcbiAgfSk7XG59XG4iLCAiaW1wb3J0IHsgZW52aXJvbm1lbnQgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBnZXRFcnJvclN0cmluZyB9IGZyb20gXCJ+L3V0aWxzL2Vycm9yc1wiO1xuaW1wb3J0IHsgY2FwdHVyZUV4Y2VwdGlvbiBhcyBjYXB0dXJlRXhjZXB0aW9uUmF5Y2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcblxudHlwZSBMb2cgPSB7XG4gIG1lc3NhZ2U6IHN0cmluZztcbiAgZXJyb3I6IGFueTtcbn07XG5cbmNvbnN0IF9leGNlcHRpb25zID0ge1xuICBsb2dzOiBuZXcgTWFwPERhdGUsIExvZz4oKSxcbiAgc2V0OiAobWVzc2FnZTogc3RyaW5nLCBlcnJvcj86IGFueSk6IHZvaWQgPT4ge1xuICAgIGNhcHR1cmVkRXhjZXB0aW9ucy5sb2dzLnNldChuZXcgRGF0ZSgpLCB7IG1lc3NhZ2UsIGVycm9yIH0pO1xuICB9LFxuICBjbGVhcjogKCk6IHZvaWQgPT4gY2FwdHVyZWRFeGNlcHRpb25zLmxvZ3MuY2xlYXIoKSxcbiAgdG9TdHJpbmc6ICgpOiBzdHJpbmcgPT4ge1xuICAgIGxldCBzdHIgPSBcIlwiO1xuICAgIGNhcHR1cmVkRXhjZXB0aW9ucy5sb2dzLmZvckVhY2goKGxvZywgZGF0ZSkgPT4ge1xuICAgICAgaWYgKHN0ci5sZW5ndGggPiAwKSBzdHIgKz0gXCJcXG5cXG5cIjtcbiAgICAgIHN0ciArPSBgWyR7ZGF0ZS50b0lTT1N0cmluZygpfV0gJHtsb2cubWVzc2FnZX1gO1xuICAgICAgaWYgKGxvZy5lcnJvcikgc3RyICs9IGA6ICR7Z2V0RXJyb3JTdHJpbmcobG9nLmVycm9yKX1gO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHN0cjtcbiAgfSxcbn07XG5cbmV4cG9ydCBjb25zdCBjYXB0dXJlZEV4Y2VwdGlvbnMgPSBPYmplY3QuZnJlZXplKF9leGNlcHRpb25zKTtcblxudHlwZSBDYXB0dXJlRXhjZXB0aW9uT3B0aW9ucyA9IHtcbiAgY2FwdHVyZVRvUmF5Y2FzdD86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgY29uc3QgY2FwdHVyZUV4Y2VwdGlvbiA9IChcbiAgZGVzY3JpcHRpb246IHN0cmluZyB8IEZhbHN5IHwgKHN0cmluZyB8IEZhbHN5KVtdLFxuICBlcnJvcjogYW55LFxuICBvcHRpb25zPzogQ2FwdHVyZUV4Y2VwdGlvbk9wdGlvbnNcbikgPT4ge1xuICBjb25zdCB7IGNhcHR1cmVUb1JheWNhc3QgPSBmYWxzZSB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgY29uc3QgZGVzYyA9IEFycmF5LmlzQXJyYXkoZGVzY3JpcHRpb24pID8gZGVzY3JpcHRpb24uZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCIgXCIpIDogZGVzY3JpcHRpb24gfHwgXCJDYXB0dXJlZCBleGNlcHRpb25cIjtcbiAgY2FwdHVyZWRFeGNlcHRpb25zLnNldChkZXNjLCBlcnJvcik7XG4gIGlmIChlbnZpcm9ubWVudC5pc0RldmVsb3BtZW50KSB7XG4gICAgY29uc29sZS5lcnJvcihkZXNjLCBlcnJvcik7XG4gIH0gZWxzZSBpZiAoY2FwdHVyZVRvUmF5Y2FzdCkge1xuICAgIGNhcHR1cmVFeGNlcHRpb25SYXljYXN0KGVycm9yKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGRlYnVnTG9nID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gIGlmICghZW52aXJvbm1lbnQuaXNEZXZlbG9wbWVudCkgcmV0dXJuO1xuICBjb25zb2xlLmRlYnVnKC4uLmFyZ3MpO1xufTtcbiIsICJpbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IGNyZWF0ZUhhc2ggfSBmcm9tIFwiY3J5cHRvXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlU2hhMjU2KGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gY3JlYXRlSGFzaChcInNoYTI1NlwiKS51cGRhdGUocmVhZEZpbGVTeW5jKGZpbGVQYXRoKSkuZGlnZXN0KFwiaGV4XCIpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgU2VuZENyZWF0ZVBheWxvYWQgfSBmcm9tIFwifi90eXBlcy9zZW5kXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVwYXJlU2VuZFBheWxvYWQodGVtcGxhdGU6IFNlbmRDcmVhdGVQYXlsb2FkLCB2YWx1ZXM6IFNlbmRDcmVhdGVQYXlsb2FkKTogU2VuZENyZWF0ZVBheWxvYWQge1xuICByZXR1cm4ge1xuICAgIC4uLnRlbXBsYXRlLFxuICAgIC4uLnZhbHVlcyxcbiAgICBmaWxlOiB2YWx1ZXMuZmlsZSA/IHsgLi4udGVtcGxhdGUuZmlsZSwgLi4udmFsdWVzLmZpbGUgfSA6IHRlbXBsYXRlLmZpbGUsXG4gICAgdGV4dDogdmFsdWVzLnRleHQgPyB7IC4uLnRlbXBsYXRlLnRleHQsIC4uLnZhbHVlcy50ZXh0IH0gOiB0ZW1wbGF0ZS50ZXh0LFxuICB9O1xufVxuIiwgImltcG9ydCB7IENhY2hlIGFzIFJheWNhc3RDYWNoZSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcblxuZXhwb3J0IGNvbnN0IENhY2hlID0gbmV3IFJheWNhc3RDYWNoZSh7IG5hbWVzcGFjZTogXCJidy1jYWNoZVwiIH0pO1xuIiwgImV4cG9ydCBjb25zdCBwbGF0Zm9ybSA9IHByb2Nlc3MucGxhdGZvcm0gPT09IFwiZGFyd2luXCIgPyBcIm1hY29zXCIgOiBcIndpbmRvd3NcIjtcbiIsICJpbXBvcnQgeyBMb2NhbFN0b3JhZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBMT0NBTF9TVE9SQUdFX0tFWSB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBleGVjIGFzIGNhbGxiYWNrRXhlYywgUHJvbWlzZVdpdGhDaGlsZCB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tIFwidXRpbFwiO1xuaW1wb3J0IHsgY2FwdHVyZUV4Y2VwdGlvbiwgZGVidWdMb2cgfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuXG5jb25zdCBleGVjID0gcHJvbWlzaWZ5KGNhbGxiYWNrRXhlYyk7XG5cbmV4cG9ydCBjb25zdCBTZXNzaW9uU3RvcmFnZSA9IHtcbiAgZ2V0U2F2ZWRTZXNzaW9uOiAoKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgIExvY2FsU3RvcmFnZS5nZXRJdGVtPHN0cmluZz4oTE9DQUxfU1RPUkFHRV9LRVkuU0VTU0lPTl9UT0tFTiksXG4gICAgICBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KExPQ0FMX1NUT1JBR0VfS0VZLlJFUFJPTVBUX0hBU0gpLFxuICAgICAgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5MQVNUX0FDVElWSVRZX1RJTUUpLFxuICAgICAgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5WQVVMVF9MQVNUX1NUQVRVUyksXG4gICAgXSk7XG4gIH0sXG4gIGNsZWFyU2Vzc2lvbjogYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIExvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlNFU1NJT05fVE9LRU4pLFxuICAgICAgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuUkVQUk9NUFRfSEFTSCksXG4gICAgXSk7XG4gIH0sXG4gIHNhdmVTZXNzaW9uOiBhc3luYyAodG9rZW46IHN0cmluZywgcGFzc3dvcmRIYXNoOiBzdHJpbmcpID0+IHtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5TRVNTSU9OX1RPS0VOLCB0b2tlbiksXG4gICAgICBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5SRVBST01QVF9IQVNILCBwYXNzd29yZEhhc2gpLFxuICAgIF0pO1xuICB9LFxuICBsb2dvdXRDbGVhclNlc3Npb246IGFzeW5jICgpID0+IHtcbiAgICAvLyBjbGVhciBldmVyeXRoaW5nIHJlbGF0ZWQgdG8gdGhlIHNlc3Npb25cbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICBMb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShMT0NBTF9TVE9SQUdFX0tFWS5TRVNTSU9OX1RPS0VOKSxcbiAgICAgIExvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlJFUFJPTVBUX0hBU0gpLFxuICAgICAgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuTEFTVF9BQ1RJVklUWV9USU1FKSxcbiAgICBdKTtcbiAgfSxcbn07XG5cbmV4cG9ydCBjb25zdCBjaGVja1N5c3RlbUxvY2tlZFNpbmNlTGFzdEFjY2VzcyA9IChsYXN0QWN0aXZpdHlUaW1lOiBEYXRlKSA9PiB7XG4gIHJldHVybiBjaGVja1N5c3RlbUxvZ1RpbWVBZnRlcihsYXN0QWN0aXZpdHlUaW1lLCAodGltZTogbnVtYmVyKSA9PiBnZXRMYXN0U3lzbG9nKHRpbWUsIFwiaGFuZGxlVW5sb2NrUmVzdWx0XCIpKTtcbn07XG5leHBvcnQgY29uc3QgY2hlY2tTeXN0ZW1TbGVwdFNpbmNlTGFzdEFjY2VzcyA9IChsYXN0QWN0aXZpdHlUaW1lOiBEYXRlKSA9PiB7XG4gIHJldHVybiBjaGVja1N5c3RlbUxvZ1RpbWVBZnRlcihsYXN0QWN0aXZpdHlUaW1lLCAodGltZTogbnVtYmVyKSA9PiBnZXRMYXN0U3lzbG9nKHRpbWUsIFwic2xlZXAgMFwiKSk7XG59O1xuXG5mdW5jdGlvbiBnZXRMYXN0U3lzbG9nKGhvdXJzOiBudW1iZXIsIGZpbHRlcjogc3RyaW5nKSB7XG4gIHJldHVybiBleGVjKFxuICAgIGBsb2cgc2hvdyAtLXN0eWxlIHN5c2xvZyAtLXByZWRpY2F0ZSBcInByb2Nlc3MgPT0gJ2xvZ2lud2luZG93J1wiIC0taW5mbyAtLWxhc3QgJHtob3Vyc31oIHwgZ3JlcCBcIiR7ZmlsdGVyfVwiIHwgdGFpbCAtbiAxYFxuICApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tTeXN0ZW1Mb2dUaW1lQWZ0ZXIoXG4gIHRpbWU6IERhdGUsXG4gIGdldExvZ0VudHJ5OiAodGltZVNwYW5Ib3VyczogbnVtYmVyKSA9PiBQcm9taXNlV2l0aENoaWxkPHsgc3Rkb3V0OiBzdHJpbmc7IHN0ZGVycjogc3RyaW5nIH0+XG4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgbGFzdFNjcmVlbkxvY2tUaW1lID0gYXdhaXQgZ2V0U3lzdGVtTG9nVGltZShnZXRMb2dFbnRyeSk7XG4gIGlmICghbGFzdFNjcmVlbkxvY2tUaW1lKSByZXR1cm4gdHJ1ZTsgLy8gYXNzdW1lIHRoYXQgbG9nIHdhcyBmb3VuZCBmb3IgaW1wcm92ZWQgc2FmZXR5XG4gIHJldHVybiBuZXcgRGF0ZShsYXN0U2NyZWVuTG9ja1RpbWUpLmdldFRpbWUoKSA+IHRpbWUuZ2V0VGltZSgpO1xufVxuXG5jb25zdCBnZXRTeXN0ZW1Mb2dUaW1lX0lOQ1JFTUVOVF9IT1VSUyA9IDI7XG5jb25zdCBnZXRTeXN0ZW1Mb2dUaW1lX01BWF9SRVRSSUVTID0gNTtcbi8qKlxuICogU3RhcnRzIGJ5IGNoZWNraW5nIHRoZSBsYXN0IGhvdXIgYW5kIGluY3JlYXNlcyB0aGUgdGltZSBzcGFuIGJ5IHtAbGluayBnZXRTeXN0ZW1Mb2dUaW1lX0lOQ1JFTUVOVF9IT1VSU30gaG91cnMgb24gZWFjaCByZXRyeS5cbiAqIFx1MjZBMFx1RkUwRiBDYWxscyB0byB0aGUgc3lzdGVtIGxvZyBhcmUgdmVyeSBzbG93LCBhbmQgaWYgdGhlIHNjcmVlbiBoYXNuJ3QgYmVlbiBsb2NrZWQgZm9yIHNvbWUgaG91cnMsIGl0IGdldHMgc2xvd2VyLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRTeXN0ZW1Mb2dUaW1lKFxuICBnZXRMb2dFbnRyeTogKHRpbWVTcGFuSG91cnM6IG51bWJlcikgPT4gUHJvbWlzZVdpdGhDaGlsZDx7IHN0ZG91dDogc3RyaW5nOyBzdGRlcnI6IHN0cmluZyB9PixcbiAgdGltZVNwYW5Ib3VycyA9IDEsXG4gIHJldHJ5QXR0ZW1wdCA9IDBcbik6IFByb21pc2U8RGF0ZSB8IHVuZGVmaW5lZD4ge1xuICB0cnkge1xuICAgIGlmIChyZXRyeUF0dGVtcHQgPiBnZXRTeXN0ZW1Mb2dUaW1lX01BWF9SRVRSSUVTKSB7XG4gICAgICBkZWJ1Z0xvZyhcIk1heCByZXRyeSBhdHRlbXB0cyByZWFjaGVkIHRvIGdldCBsYXN0IHNjcmVlbiBsb2NrIHRpbWVcIik7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCB7IHN0ZG91dCwgc3RkZXJyIH0gPSBhd2FpdCBnZXRMb2dFbnRyeSh0aW1lU3BhbkhvdXJzKTtcbiAgICBjb25zdCBbbG9nRGF0ZSwgbG9nVGltZV0gPSBzdGRvdXQ/LnNwbGl0KFwiIFwiKSA/PyBbXTtcbiAgICBpZiAoc3RkZXJyIHx8ICFsb2dEYXRlIHx8ICFsb2dUaW1lKSB7XG4gICAgICByZXR1cm4gZ2V0U3lzdGVtTG9nVGltZShnZXRMb2dFbnRyeSwgdGltZVNwYW5Ib3VycyArIGdldFN5c3RlbUxvZ1RpbWVfSU5DUkVNRU5UX0hPVVJTLCByZXRyeUF0dGVtcHQgKyAxKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dGdWxsRGF0ZSA9IG5ldyBEYXRlKGAke2xvZ0RhdGV9VCR7bG9nVGltZX1gKTtcbiAgICBpZiAoIWxvZ0Z1bGxEYXRlIHx8IGxvZ0Z1bGxEYXRlLnRvU3RyaW5nKCkgPT09IFwiSW52YWxpZCBEYXRlXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICByZXR1cm4gbG9nRnVsbERhdGU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZXQgbGFzdCBzY3JlZW4gbG9jayB0aW1lXCIsIGVycm9yKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBLGtDQUFBQSxVQUFBQyxTQUFBO0FBQUEsSUFBQUEsUUFBTyxVQUFVO0FBQ2pCLFVBQU0sT0FBTztBQUViLFFBQUksS0FBSyxRQUFRLElBQUk7QUFFckIsYUFBUyxhQUFjQyxPQUFNLFNBQVM7QUFDcEMsVUFBSSxVQUFVLFFBQVEsWUFB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O0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBO0FBQUEsTUFHUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBO0FBQUEsTUFHUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsYUFBYTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLGdCQUFnQjtBQUFBO0FBQUEsTUFHaEIsV0FBVztBQUFBO0FBQUEsTUFDWCxXQUFXO0FBQUE7QUFBQSxNQUNYLGdCQUFnQjtBQUFBLE1BQ2hCLFdBQVc7QUFBQTtBQUFBO0FBQUEsTUFHWCxVQUFVO0FBQUE7QUFBQSxNQUNWLFVBQVU7QUFBQTtBQUFBLE1BQ1YsZUFBZTtBQUFBLE1BQ2YsVUFBVTtBQUFBO0FBQUEsTUFDVixVQUFVO0FBQUE7QUFBQSxNQUNWLFVBQVU7QUFBQSxNQUNWLFVBQVU7QUFBQTtBQUFBLE1BR1YsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFVBQVU7QUFBQTtBQUFBLE1BQ1YsVUFBVTtBQUFBO0FBQUEsTUFDVixVQUFVO0FBQUE7QUFBQSxNQUNWLFVBQVU7QUFBQTtBQUFBLE1BQ1YsVUFB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QUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLElBQ1QsUUFBTztBQUFBLEVBQUk7QUFBQSxFQUVYO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBTztBQUFBLEVBRWhCO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBTTtBQUFBLEVBRWY7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFNO0FBQUEsRUFFZjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLElBQ1QsUUFBTztBQUFBLEVBQUk7QUFBQSxFQUVYO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsSUFDVCxRQUFPO0FBQUEsRUFBSTtBQUFBLEVBRVg7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFLO0FBQUEsRUFFZDtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQUs7QUFBQSxFQUVkO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFLO0FBQUEsRUFFZDtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQUs7QUFBQSxFQUVkO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFTO0FBQUEsRUFFbEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUM7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O0FBQUEsSUFDOUQsQ0FBQztBQUFBLEVBQ0g7QUFDRjs7O0FoQ2hDQSxlQUFlLG1CQUFtQjtBQUNoQyxRQUFNLFFBQVEsVUFBTSx1QkFBVSxrQkFBTSxNQUFNLFVBQVUsb0JBQW9CLGFBQWE7QUFDckYsTUFBSTtBQUNGLFVBQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxlQUFlLGdCQUFnQjtBQUNyRCxRQUFJLENBQUMsT0FBTztBQUNWLFlBQU0sUUFBUSxrQkFBTSxNQUFNO0FBQzFCLFlBQU0sUUFBUTtBQUNkLFlBQU0sVUFBVTtBQUNoQjtBQUFBLElBQ0Y7QUFFQSxVQUFNLFlBQVksTUFBTSxJQUFJLFVBQVUsS0FBSyxFQUFFLFdBQVc7QUFFeEQsVUFBTSxVQUFVLFlBQVksS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLG9CQUFvQixPQUFPLENBQUM7QUFBQSxFQUNoRixTQUFTLE9BQU87QUFDZCxjQUFNLHVCQUFVLGtCQUFNLE1BQU0sU0FBUyxzQkFBc0I7QUFBQSxFQUM3RDtBQUVBLE1BQUk7QUFDRixVQUFNLGVBQWUsYUFBYTtBQUVsQyxVQUFNLFFBQVEsa0JBQU0sTUFBTTtBQUMxQixVQUFNLFFBQVE7QUFDZCxVQUFNLFVBQVU7QUFBQSxFQUNsQixTQUFTLE9BQU87QUFDZCxjQUFNLHVCQUFVLGtCQUFNLE1BQU0sU0FBUyxzQkFBc0I7QUFBQSxFQUM3RDtBQUNGO0FBRUEsSUFBTyxxQkFBUTsiLAogICJuYW1lcyI6IFsiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoS2V5IiwgImVudmlyb25tZW50IiwgInBsYXRmb3JtIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInByb2Nlc3MiLCAidW5sb2FkIiwgImVtaXQiLCAibG9hZCIsICJwcm9jZXNzUmVhbGx5RXhpdCIsICJwcm9jZXNzRW1pdCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwcm9taXNpZnkiLCAiZ2V0U3RyZWFtIiwgInN0cmVhbSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgIm9wZW4iLCAiZXJyIiwgImVudHJ5IiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfbm9kZV9wYXRoIiwgImltcG9ydF9ub2RlX3Byb2Nlc3MiLCAicGxhdGZvcm0iLCAicHJvY2VzcyIsICJ1cmwiLCAicGF0aCIsICJvbmV0aW1lIiwgImltcG9ydF9ub2RlX29zIiwgImltcG9ydF9ub2RlX29zIiwgIm9zIiwgIm9uRXhpdCIsICJtZXJnZVN0cmVhbSIsICJnZXRTdHJlYW0iLCAicHJvY2VzcyIsICJjcm9zc1NwYXduIiwgInBhdGgiLCAiY2hpbGRQcm9jZXNzIiwgImltcG9ydF9mcyIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X3BhdGgiLCAiaW1wb3J0X3Byb21pc2VzIiwgInBhdGgiLCAic3RyZWFtWmlwIiwgImltcG9ydF9mcyIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9hcGkiLCAiY2FwdHVyZUV4Y2VwdGlvblJheWNhc3QiLCAiaW1wb3J0X2ZzIiwgInVybCIsICJwYXRoIiwgImh0dHBzIiwgImh0dHAiLCAiaW1wb3J0X2FwaSIsICJSYXljYXN0Q2FjaGUiLCAidXJsIiwgImltcG9ydF9hcGkiLCAiY2FsbGJhY2tFeGVjIl0KfQo=
