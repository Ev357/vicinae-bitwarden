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

// src/logout-vault.tsx
var logout_vault_exports = {};
__export(logout_vault_exports, {
  default: () => logout_vault_default
});
module.exports = __toCommonJS(logout_vault_exports);
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

// src/logout-vault.tsx
async function logoutVaultCommand() {
  try {
    const hasConfirmed = await (0, import_api9.confirmAlert)({
      title: "Logout From Bitwarden Vault",
      message: "Are you sure you want to logout from your current vault account?",
      icon: import_api9.Icon.Logout,
      primaryAction: { title: "Confirm", style: import_api9.Alert.ActionStyle.Destructive }
    });
    if (!hasConfirmed) return;
    const toast = await (0, import_api9.showToast)(import_api9.Toast.Style.Animated, "Logging out...");
    const bitwarden = await new Bitwarden(toast).initialize();
    const { error } = await bitwarden.logout();
    if (error instanceof NotLoggedInError) {
      toast.style = import_api9.Toast.Style.Failure;
      toast.title = "No session found";
      toast.message = "You are not logged in";
      return;
    }
  } catch (error) {
    await (0, import_api9.showToast)(import_api9.Toast.Style.Failure, "Failed to logout from vault");
  }
  try {
    await SessionStorage.logoutClearSession();
    Cache.clear();
    await (0, import_api9.showToast)(import_api9.Toast.Style.Success, "Successfully logged out");
  } catch (error) {
    await (0, import_api9.showToast)(import_api9.Toast.Style.Failure, "Failed to logout from vault");
  }
}
var logout_vault_default = logoutVaultCommand;
/*! Bundled license information:

node-stream-zip/node_stream_zip.js:
  (**
   * @license node-stream-zip | (c) 2020 Antelle | https://github.com/antelle/node-stream-zip/blob/master/LICENSE
   * Portions copyright https://github.com/cthackers/adm-zip | https://raw.githubusercontent.com/cthackers/adm-zip/master/LICENSE
   *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL3dpbmRvd3MuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL21vZGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy93aGljaC93aGljaC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi91dGlsL3Jlc29sdmVDb21tYW5kLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9jcm9zcy1zcGF3bi9saWIvdXRpbC9lc2NhcGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctcmVnZXgvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctY29tbWFuZC9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL3V0aWwvcmVhZFNoZWJhbmcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi9wYXJzZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL2Vub2VudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NpZ25hbC1leGl0L3NpZ25hbHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NpZ25hbC1leGl0L2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9nZXQtc3RyZWFtL2J1ZmZlci1zdHJlYW0uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2dldC1zdHJlYW0vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL21lcmdlLXN0cmVhbS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvbm9kZS1zdHJlYW0temlwL25vZGVfc3RyZWFtX3ppcC5qcyIsICIuLi9zcmMvbG9nb3V0LXZhdWx0LnRzeCIsICIuLi9zcmMvYXBpL2JpdHdhcmRlbi50cyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3N0cmlwLWZpbmFsLW5ld2xpbmUvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL25wbS1ydW4tcGF0aC9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvbnBtLXJ1bi1wYXRoL25vZGVfbW9kdWxlcy9wYXRoLWtleS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvbWltaWMtZm4vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL29uZXRpbWUvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2h1bWFuLXNpZ25hbHMvYnVpbGQvc3JjL21haW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2h1bWFuLXNpZ25hbHMvYnVpbGQvc3JjL3JlYWx0aW1lLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9zaWduYWxzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9jb3JlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9leGVjYS9saWIvZXJyb3IuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9zdGRpby5qcyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvbGliL2tpbGwuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzLXN0cmVhbS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvbGliL3N0cmVhbS5qcyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvbGliL3Byb21pc2UuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9jb21tYW5kLmpzIiwgIi4uL3NyYy9jb25zdGFudHMvZ2VuZXJhbC50cyIsICIuLi9zcmMvdXRpbHMvcGFzc3dvcmRzLnRzIiwgIi4uL3NyYy91dGlscy9wcmVmZXJlbmNlcy50cyIsICIuLi9zcmMvY29uc3RhbnRzL3ByZWZlcmVuY2VzLnRzIiwgIi4uL3NyYy9jb25zdGFudHMvbGFiZWxzLnRzIiwgIi4uL3NyYy91dGlscy9lcnJvcnMudHMiLCAiLi4vc3JjL3V0aWxzL2ZzLnRzIiwgIi4uL3NyYy91dGlscy9uZXR3b3JrLnRzIiwgIi4uL3NyYy91dGlscy9kZXZlbG9wbWVudC50cyIsICIuLi9zcmMvdXRpbHMvY3J5cHRvLnRzIiwgIi4uL3NyYy9hcGkvYml0d2FyZGVuLmhlbHBlcnMudHMiLCAiLi4vc3JjL3V0aWxzL2NhY2hlLnRzIiwgIi4uL3NyYy91dGlscy9wbGF0Zm9ybS50cyIsICIuLi9zcmMvY29udGV4dC9zZXNzaW9uL3V0aWxzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJtb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG52YXIgZnMgPSByZXF1aXJlKCdmcycpXG5cbmZ1bmN0aW9uIGNoZWNrUGF0aEV4dCAocGF0aCwgb3B0aW9ucykge1xuICB2YXIgcGF0aGV4dCA9IG9wdGlvbnMucGF0aEV4dCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLnBhdGhFeHQgOiBwcm9jZXNzLmVudi5QQVRIRVhUXG5cbiAgaWYgKCFwYXRoZXh0KSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHBhdGhleHQgPSBwYXRoZXh0LnNwbGl0KCc7JylcbiAgaWYgKHBhdGhleHQuaW5kZXhPZignJykgIT09IC0xKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhleHQubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcCA9IHBhdGhleHRbaV0udG9Mb3dlckNhc2UoKVxuICAgIGlmIChwICYmIHBhdGguc3Vic3RyKC1wLmxlbmd0aCkudG9Mb3dlckNhc2UoKSA9PT0gcCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIGNoZWNrU3RhdCAoc3RhdCwgcGF0aCwgb3B0aW9ucykge1xuICBpZiAoIXN0YXQuaXNTeW1ib2xpY0xpbmsoKSAmJiAhc3RhdC5pc0ZpbGUoKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiBjaGVja1BhdGhFeHQocGF0aCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gaXNleGUgKHBhdGgsIG9wdGlvbnMsIGNiKSB7XG4gIGZzLnN0YXQocGF0aCwgZnVuY3Rpb24gKGVyLCBzdGF0KSB7XG4gICAgY2IoZXIsIGVyID8gZmFsc2UgOiBjaGVja1N0YXQoc3RhdCwgcGF0aCwgb3B0aW9ucykpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHN5bmMgKHBhdGgsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNoZWNrU3RhdChmcy5zdGF0U3luYyhwYXRoKSwgcGF0aCwgb3B0aW9ucylcbn1cbiIsICJtb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG52YXIgZnMgPSByZXF1aXJlKCdmcycpXG5cbmZ1bmN0aW9uIGlzZXhlIChwYXRoLCBvcHRpb25zLCBjYikge1xuICBmcy5zdGF0KHBhdGgsIGZ1bmN0aW9uIChlciwgc3RhdCkge1xuICAgIGNiKGVyLCBlciA/IGZhbHNlIDogY2hlY2tTdGF0KHN0YXQsIG9wdGlvbnMpKVxuICB9KVxufVxuXG5mdW5jdGlvbiBzeW5jIChwYXRoLCBvcHRpb25zKSB7XG4gIHJldHVybiBjaGVja1N0YXQoZnMuc3RhdFN5bmMocGF0aCksIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGNoZWNrU3RhdCAoc3RhdCwgb3B0aW9ucykge1xuICByZXR1cm4gc3RhdC5pc0ZpbGUoKSAmJiBjaGVja01vZGUoc3RhdCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gY2hlY2tNb2RlIChzdGF0LCBvcHRpb25zKSB7XG4gIHZhciBtb2QgPSBzdGF0Lm1vZGVcbiAgdmFyIHVpZCA9IHN0YXQudWlkXG4gIHZhciBnaWQgPSBzdGF0LmdpZFxuXG4gIHZhciBteVVpZCA9IG9wdGlvbnMudWlkICE9PSB1bmRlZmluZWQgP1xuICAgIG9wdGlvbnMudWlkIDogcHJvY2Vzcy5nZXR1aWQgJiYgcHJvY2Vzcy5nZXR1aWQoKVxuICB2YXIgbXlHaWQgPSBvcHRpb25zLmdpZCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLmdpZCA6IHByb2Nlc3MuZ2V0Z2lkICYmIHByb2Nlc3MuZ2V0Z2lkKClcblxuICB2YXIgdSA9IHBhcnNlSW50KCcxMDAnLCA4KVxuICB2YXIgZyA9IHBhcnNlSW50KCcwMTAnLCA4KVxuICB2YXIgbyA9IHBhcnNlSW50KCcwMDEnLCA4KVxuICB2YXIgdWcgPSB1IHwgZ1xuXG4gIHZhciByZXQgPSAobW9kICYgbykgfHxcbiAgICAobW9kICYgZykgJiYgZ2lkID09PSBteUdpZCB8fFxuICAgIChtb2QgJiB1KSAmJiB1aWQgPT09IG15VWlkIHx8XG4gICAgKG1vZCAmIHVnKSAmJiBteVVpZCA9PT0gMFxuXG4gIHJldHVybiByZXRcbn1cbiIsICJ2YXIgZnMgPSByZXF1aXJlKCdmcycpXG52YXIgY29yZVxuaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgfHwgZ2xvYmFsLlRFU1RJTkdfV0lORE9XUykge1xuICBjb3JlID0gcmVxdWlyZSgnLi93aW5kb3dzLmpzJylcbn0gZWxzZSB7XG4gIGNvcmUgPSByZXF1aXJlKCcuL21vZGUuanMnKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG5mdW5jdGlvbiBpc2V4ZSAocGF0aCwgb3B0aW9ucywgY2IpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IHt9XG4gIH1cblxuICBpZiAoIWNiKSB7XG4gICAgaWYgKHR5cGVvZiBQcm9taXNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYWxsYmFjayBub3QgcHJvdmlkZWQnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBpc2V4ZShwYXRoLCBvcHRpb25zIHx8IHt9LCBmdW5jdGlvbiAoZXIsIGlzKSB7XG4gICAgICAgIGlmIChlcikge1xuICAgICAgICAgIHJlamVjdChlcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKGlzKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBjb3JlKHBhdGgsIG9wdGlvbnMgfHwge30sIGZ1bmN0aW9uIChlciwgaXMpIHtcbiAgICAvLyBpZ25vcmUgRUFDQ0VTIGJlY2F1c2UgdGhhdCBqdXN0IG1lYW5zIHdlIGFyZW4ndCBhbGxvd2VkIHRvIHJ1biBpdFxuICAgIGlmIChlcikge1xuICAgICAgaWYgKGVyLmNvZGUgPT09ICdFQUNDRVMnIHx8IG9wdGlvbnMgJiYgb3B0aW9ucy5pZ25vcmVFcnJvcnMpIHtcbiAgICAgICAgZXIgPSBudWxsXG4gICAgICAgIGlzID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gICAgY2IoZXIsIGlzKVxuICB9KVxufVxuXG5mdW5jdGlvbiBzeW5jIChwYXRoLCBvcHRpb25zKSB7XG4gIC8vIG15IGtpbmdkb20gZm9yIGEgZmlsdGVyZWQgY2F0Y2hcbiAgdHJ5IHtcbiAgICByZXR1cm4gY29yZS5zeW5jKHBhdGgsIG9wdGlvbnMgfHwge30pXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5pZ25vcmVFcnJvcnMgfHwgZXIuY29kZSA9PT0gJ0VBQ0NFUycpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlclxuICAgIH1cbiAgfVxufVxuIiwgImNvbnN0IGlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgfHxcbiAgICBwcm9jZXNzLmVudi5PU1RZUEUgPT09ICdjeWd3aW4nIHx8XG4gICAgcHJvY2Vzcy5lbnYuT1NUWVBFID09PSAnbXN5cydcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuY29uc3QgQ09MT04gPSBpc1dpbmRvd3MgPyAnOycgOiAnOidcbmNvbnN0IGlzZXhlID0gcmVxdWlyZSgnaXNleGUnKVxuXG5jb25zdCBnZXROb3RGb3VuZEVycm9yID0gKGNtZCkgPT5cbiAgT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoYG5vdCBmb3VuZDogJHtjbWR9YCksIHsgY29kZTogJ0VOT0VOVCcgfSlcblxuY29uc3QgZ2V0UGF0aEluZm8gPSAoY21kLCBvcHQpID0+IHtcbiAgY29uc3QgY29sb24gPSBvcHQuY29sb24gfHwgQ09MT05cblxuICAvLyBJZiBpdCBoYXMgYSBzbGFzaCwgdGhlbiB3ZSBkb24ndCBib3RoZXIgc2VhcmNoaW5nIHRoZSBwYXRoZW52LlxuICAvLyBqdXN0IGNoZWNrIHRoZSBmaWxlIGl0c2VsZiwgYW5kIHRoYXQncyBpdC5cbiAgY29uc3QgcGF0aEVudiA9IGNtZC5tYXRjaCgvXFwvLykgfHwgaXNXaW5kb3dzICYmIGNtZC5tYXRjaCgvXFxcXC8pID8gWycnXVxuICAgIDogKFxuICAgICAgW1xuICAgICAgICAvLyB3aW5kb3dzIGFsd2F5cyBjaGVja3MgdGhlIGN3ZCBmaXJzdFxuICAgICAgICAuLi4oaXNXaW5kb3dzID8gW3Byb2Nlc3MuY3dkKCldIDogW10pLFxuICAgICAgICAuLi4ob3B0LnBhdGggfHwgcHJvY2Vzcy5lbnYuUEFUSCB8fFxuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiB2ZXJ5IHVudXN1YWwgKi8gJycpLnNwbGl0KGNvbG9uKSxcbiAgICAgIF1cbiAgICApXG4gIGNvbnN0IHBhdGhFeHRFeGUgPSBpc1dpbmRvd3NcbiAgICA/IG9wdC5wYXRoRXh0IHx8IHByb2Nlc3MuZW52LlBBVEhFWFQgfHwgJy5FWEU7LkNNRDsuQkFUOy5DT00nXG4gICAgOiAnJ1xuICBjb25zdCBwYXRoRXh0ID0gaXNXaW5kb3dzID8gcGF0aEV4dEV4ZS5zcGxpdChjb2xvbikgOiBbJyddXG5cbiAgaWYgKGlzV2luZG93cykge1xuICAgIGlmIChjbWQuaW5kZXhPZignLicpICE9PSAtMSAmJiBwYXRoRXh0WzBdICE9PSAnJylcbiAgICAgIHBhdGhFeHQudW5zaGlmdCgnJylcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGF0aEVudixcbiAgICBwYXRoRXh0LFxuICAgIHBhdGhFeHRFeGUsXG4gIH1cbn1cblxuY29uc3Qgd2hpY2ggPSAoY21kLCBvcHQsIGNiKSA9PiB7XG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBvcHRcbiAgICBvcHQgPSB7fVxuICB9XG4gIGlmICghb3B0KVxuICAgIG9wdCA9IHt9XG5cbiAgY29uc3QgeyBwYXRoRW52LCBwYXRoRXh0LCBwYXRoRXh0RXhlIH0gPSBnZXRQYXRoSW5mbyhjbWQsIG9wdClcbiAgY29uc3QgZm91bmQgPSBbXVxuXG4gIGNvbnN0IHN0ZXAgPSBpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoaSA9PT0gcGF0aEVudi5sZW5ndGgpXG4gICAgICByZXR1cm4gb3B0LmFsbCAmJiBmb3VuZC5sZW5ndGggPyByZXNvbHZlKGZvdW5kKVxuICAgICAgICA6IHJlamVjdChnZXROb3RGb3VuZEVycm9yKGNtZCkpXG5cbiAgICBjb25zdCBwcFJhdyA9IHBhdGhFbnZbaV1cbiAgICBjb25zdCBwYXRoUGFydCA9IC9eXCIuKlwiJC8udGVzdChwcFJhdykgPyBwcFJhdy5zbGljZSgxLCAtMSkgOiBwcFJhd1xuXG4gICAgY29uc3QgcENtZCA9IHBhdGguam9pbihwYXRoUGFydCwgY21kKVxuICAgIGNvbnN0IHAgPSAhcGF0aFBhcnQgJiYgL15cXC5bXFxcXFxcL10vLnRlc3QoY21kKSA/IGNtZC5zbGljZSgwLCAyKSArIHBDbWRcbiAgICAgIDogcENtZFxuXG4gICAgcmVzb2x2ZShzdWJTdGVwKHAsIGksIDApKVxuICB9KVxuXG4gIGNvbnN0IHN1YlN0ZXAgPSAocCwgaSwgaWkpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoaWkgPT09IHBhdGhFeHQubGVuZ3RoKVxuICAgICAgcmV0dXJuIHJlc29sdmUoc3RlcChpICsgMSkpXG4gICAgY29uc3QgZXh0ID0gcGF0aEV4dFtpaV1cbiAgICBpc2V4ZShwICsgZXh0LCB7IHBhdGhFeHQ6IHBhdGhFeHRFeGUgfSwgKGVyLCBpcykgPT4ge1xuICAgICAgaWYgKCFlciAmJiBpcykge1xuICAgICAgICBpZiAob3B0LmFsbClcbiAgICAgICAgICBmb3VuZC5wdXNoKHAgKyBleHQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShwICsgZXh0KVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoc3ViU3RlcChwLCBpLCBpaSArIDEpKVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIGNiID8gc3RlcCgwKS50aGVuKHJlcyA9PiBjYihudWxsLCByZXMpLCBjYikgOiBzdGVwKDApXG59XG5cbmNvbnN0IHdoaWNoU3luYyA9IChjbWQsIG9wdCkgPT4ge1xuICBvcHQgPSBvcHQgfHwge31cblxuICBjb25zdCB7IHBhdGhFbnYsIHBhdGhFeHQsIHBhdGhFeHRFeGUgfSA9IGdldFBhdGhJbmZvKGNtZCwgb3B0KVxuICBjb25zdCBmb3VuZCA9IFtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoRW52Lmxlbmd0aDsgaSArKykge1xuICAgIGNvbnN0IHBwUmF3ID0gcGF0aEVudltpXVxuICAgIGNvbnN0IHBhdGhQYXJ0ID0gL15cIi4qXCIkLy50ZXN0KHBwUmF3KSA/IHBwUmF3LnNsaWNlKDEsIC0xKSA6IHBwUmF3XG5cbiAgICBjb25zdCBwQ21kID0gcGF0aC5qb2luKHBhdGhQYXJ0LCBjbWQpXG4gICAgY29uc3QgcCA9ICFwYXRoUGFydCAmJiAvXlxcLltcXFxcXFwvXS8udGVzdChjbWQpID8gY21kLnNsaWNlKDAsIDIpICsgcENtZFxuICAgICAgOiBwQ21kXG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBhdGhFeHQubGVuZ3RoOyBqICsrKSB7XG4gICAgICBjb25zdCBjdXIgPSBwICsgcGF0aEV4dFtqXVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXMgPSBpc2V4ZS5zeW5jKGN1ciwgeyBwYXRoRXh0OiBwYXRoRXh0RXhlIH0pXG4gICAgICAgIGlmIChpcykge1xuICAgICAgICAgIGlmIChvcHQuYWxsKVxuICAgICAgICAgICAgZm91bmQucHVzaChjdXIpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGN1clxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge31cbiAgICB9XG4gIH1cblxuICBpZiAob3B0LmFsbCAmJiBmb3VuZC5sZW5ndGgpXG4gICAgcmV0dXJuIGZvdW5kXG5cbiAgaWYgKG9wdC5ub3Rocm93KVxuICAgIHJldHVybiBudWxsXG5cbiAgdGhyb3cgZ2V0Tm90Rm91bmRFcnJvcihjbWQpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2hpY2hcbndoaWNoLnN5bmMgPSB3aGljaFN5bmNcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHBhdGhLZXkgPSAob3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IGVudmlyb25tZW50ID0gb3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG5cdGNvbnN0IHBsYXRmb3JtID0gb3B0aW9ucy5wbGF0Zm9ybSB8fCBwcm9jZXNzLnBsYXRmb3JtO1xuXG5cdGlmIChwbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuXHRcdHJldHVybiAnUEFUSCc7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0LmtleXMoZW52aXJvbm1lbnQpLnJldmVyc2UoKS5maW5kKGtleSA9PiBrZXkudG9VcHBlckNhc2UoKSA9PT0gJ1BBVEgnKSB8fCAnUGF0aCc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGhLZXk7XG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBmb3IgdGhlIG5leHQgbWFqb3IgcmVsZWFzZVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IHBhdGhLZXk7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3Qgd2hpY2ggPSByZXF1aXJlKCd3aGljaCcpO1xuY29uc3QgZ2V0UGF0aEtleSA9IHJlcXVpcmUoJ3BhdGgta2V5Jyk7XG5cbmZ1bmN0aW9uIHJlc29sdmVDb21tYW5kQXR0ZW1wdChwYXJzZWQsIHdpdGhvdXRQYXRoRXh0KSB7XG4gICAgY29uc3QgZW52ID0gcGFyc2VkLm9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52O1xuICAgIGNvbnN0IGN3ZCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgY29uc3QgaGFzQ3VzdG9tQ3dkID0gcGFyc2VkLm9wdGlvbnMuY3dkICE9IG51bGw7XG4gICAgLy8gV29ya2VyIHRocmVhZHMgZG8gbm90IGhhdmUgcHJvY2Vzcy5jaGRpcigpXG4gICAgY29uc3Qgc2hvdWxkU3dpdGNoQ3dkID0gaGFzQ3VzdG9tQ3dkICYmIHByb2Nlc3MuY2hkaXIgIT09IHVuZGVmaW5lZCAmJiAhcHJvY2Vzcy5jaGRpci5kaXNhYmxlZDtcblxuICAgIC8vIElmIGEgY3VzdG9tIGBjd2RgIHdhcyBzcGVjaWZpZWQsIHdlIG5lZWQgdG8gY2hhbmdlIHRoZSBwcm9jZXNzIGN3ZFxuICAgIC8vIGJlY2F1c2UgYHdoaWNoYCB3aWxsIGRvIHN0YXQgY2FsbHMgYnV0IGRvZXMgbm90IHN1cHBvcnQgYSBjdXN0b20gY3dkXG4gICAgaWYgKHNob3VsZFN3aXRjaEN3ZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvY2Vzcy5jaGRpcihwYXJzZWQub3B0aW9ucy5jd2QpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIC8qIEVtcHR5ICovXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcmVzb2x2ZWQ7XG5cbiAgICB0cnkge1xuICAgICAgICByZXNvbHZlZCA9IHdoaWNoLnN5bmMocGFyc2VkLmNvbW1hbmQsIHtcbiAgICAgICAgICAgIHBhdGg6IGVudltnZXRQYXRoS2V5KHsgZW52IH0pXSxcbiAgICAgICAgICAgIHBhdGhFeHQ6IHdpdGhvdXRQYXRoRXh0ID8gcGF0aC5kZWxpbWl0ZXIgOiB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLyogRW1wdHkgKi9cbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoc2hvdWxkU3dpdGNoQ3dkKSB7XG4gICAgICAgICAgICBwcm9jZXNzLmNoZGlyKGN3ZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBzdWNjZXNzZnVsbHkgcmVzb2x2ZWQsIGVuc3VyZSB0aGF0IGFuIGFic29sdXRlIHBhdGggaXMgcmV0dXJuZWRcbiAgICAvLyBOb3RlIHRoYXQgd2hlbiBhIGN1c3RvbSBgY3dkYCB3YXMgdXNlZCwgd2UgbmVlZCB0byByZXNvbHZlIHRvIGFuIGFic29sdXRlIHBhdGggYmFzZWQgb24gaXRcbiAgICBpZiAocmVzb2x2ZWQpIHtcbiAgICAgICAgcmVzb2x2ZWQgPSBwYXRoLnJlc29sdmUoaGFzQ3VzdG9tQ3dkID8gcGFyc2VkLm9wdGlvbnMuY3dkIDogJycsIHJlc29sdmVkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzb2x2ZWQ7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVDb21tYW5kKHBhcnNlZCkge1xuICAgIHJldHVybiByZXNvbHZlQ29tbWFuZEF0dGVtcHQocGFyc2VkKSB8fCByZXNvbHZlQ29tbWFuZEF0dGVtcHQocGFyc2VkLCB0cnVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZXNvbHZlQ29tbWFuZDtcbiIsICIndXNlIHN0cmljdCc7XG5cbi8vIFNlZSBodHRwOi8vd3d3LnJvYnZhbmRlcndvdWRlLmNvbS9lc2NhcGVjaGFycy5waHBcbmNvbnN0IG1ldGFDaGFyc1JlZ0V4cCA9IC8oWygpXFxdWyUhXlwiYDw+Jnw7LCAqP10pL2c7XG5cbmZ1bmN0aW9uIGVzY2FwZUNvbW1hbmQoYXJnKSB7XG4gICAgLy8gRXNjYXBlIG1ldGEgY2hhcnNcbiAgICBhcmcgPSBhcmcucmVwbGFjZShtZXRhQ2hhcnNSZWdFeHAsICdeJDEnKTtcblxuICAgIHJldHVybiBhcmc7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUFyZ3VtZW50KGFyZywgZG91YmxlRXNjYXBlTWV0YUNoYXJzKSB7XG4gICAgLy8gQ29udmVydCB0byBzdHJpbmdcbiAgICBhcmcgPSBgJHthcmd9YDtcblxuICAgIC8vIEFsZ29yaXRobSBiZWxvdyBpcyBiYXNlZCBvbiBodHRwczovL3FudG0ub3JnL2NtZFxuICAgIC8vIEl0J3Mgc2xpZ2h0bHkgYWx0ZXJlZCB0byBkaXNhYmxlIEpTIGJhY2t0cmFja2luZyB0byBhdm9pZCBoYW5naW5nIG9uIHNwZWNpYWxseSBjcmFmdGVkIGlucHV0XG4gICAgLy8gUGxlYXNlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbW94eXN0dWRpby9ub2RlLWNyb3NzLXNwYXduL3B1bGwvMTYwIGZvciBtb3JlIGluZm9ybWF0aW9uXG5cbiAgICAvLyBTZXF1ZW5jZSBvZiBiYWNrc2xhc2hlcyBmb2xsb3dlZCBieSBhIGRvdWJsZSBxdW90ZTpcbiAgICAvLyBkb3VibGUgdXAgYWxsIHRoZSBiYWNrc2xhc2hlcyBhbmQgZXNjYXBlIHRoZSBkb3VibGUgcXVvdGVcbiAgICBhcmcgPSBhcmcucmVwbGFjZSgvKD89KFxcXFwrPyk/KVxcMVwiL2csICckMSQxXFxcXFwiJyk7XG5cbiAgICAvLyBTZXF1ZW5jZSBvZiBiYWNrc2xhc2hlcyBmb2xsb3dlZCBieSB0aGUgZW5kIG9mIHRoZSBzdHJpbmdcbiAgICAvLyAod2hpY2ggd2lsbCBiZWNvbWUgYSBkb3VibGUgcXVvdGUgbGF0ZXIpOlxuICAgIC8vIGRvdWJsZSB1cCBhbGwgdGhlIGJhY2tzbGFzaGVzXG4gICAgYXJnID0gYXJnLnJlcGxhY2UoLyg/PShcXFxcKz8pPylcXDEkLywgJyQxJDEnKTtcblxuICAgIC8vIEFsbCBvdGhlciBiYWNrc2xhc2hlcyBvY2N1ciBsaXRlcmFsbHlcblxuICAgIC8vIFF1b3RlIHRoZSB3aG9sZSB0aGluZzpcbiAgICBhcmcgPSBgXCIke2FyZ31cImA7XG5cbiAgICAvLyBFc2NhcGUgbWV0YSBjaGFyc1xuICAgIGFyZyA9IGFyZy5yZXBsYWNlKG1ldGFDaGFyc1JlZ0V4cCwgJ14kMScpO1xuXG4gICAgLy8gRG91YmxlIGVzY2FwZSBtZXRhIGNoYXJzIGlmIG5lY2Vzc2FyeVxuICAgIGlmIChkb3VibGVFc2NhcGVNZXRhQ2hhcnMpIHtcbiAgICAgICAgYXJnID0gYXJnLnJlcGxhY2UobWV0YUNoYXJzUmVnRXhwLCAnXiQxJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZztcbn1cblxubW9kdWxlLmV4cG9ydHMuY29tbWFuZCA9IGVzY2FwZUNvbW1hbmQ7XG5tb2R1bGUuZXhwb3J0cy5hcmd1bWVudCA9IGVzY2FwZUFyZ3VtZW50O1xuIiwgIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gL14jISguKikvO1xuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IHNoZWJhbmdSZWdleCA9IHJlcXVpcmUoJ3NoZWJhbmctcmVnZXgnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoc3RyaW5nID0gJycpID0+IHtcblx0Y29uc3QgbWF0Y2ggPSBzdHJpbmcubWF0Y2goc2hlYmFuZ1JlZ2V4KTtcblxuXHRpZiAoIW1hdGNoKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRjb25zdCBbcGF0aCwgYXJndW1lbnRdID0gbWF0Y2hbMF0ucmVwbGFjZSgvIyEgPy8sICcnKS5zcGxpdCgnICcpO1xuXHRjb25zdCBiaW5hcnkgPSBwYXRoLnNwbGl0KCcvJykucG9wKCk7XG5cblx0aWYgKGJpbmFyeSA9PT0gJ2VudicpIHtcblx0XHRyZXR1cm4gYXJndW1lbnQ7XG5cdH1cblxuXHRyZXR1cm4gYXJndW1lbnQgPyBgJHtiaW5hcnl9ICR7YXJndW1lbnR9YCA6IGJpbmFyeTtcbn07XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBzaGViYW5nQ29tbWFuZCA9IHJlcXVpcmUoJ3NoZWJhbmctY29tbWFuZCcpO1xuXG5mdW5jdGlvbiByZWFkU2hlYmFuZyhjb21tYW5kKSB7XG4gICAgLy8gUmVhZCB0aGUgZmlyc3QgMTUwIGJ5dGVzIGZyb20gdGhlIGZpbGVcbiAgICBjb25zdCBzaXplID0gMTUwO1xuICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhzaXplKTtcblxuICAgIGxldCBmZDtcblxuICAgIHRyeSB7XG4gICAgICAgIGZkID0gZnMub3BlblN5bmMoY29tbWFuZCwgJ3InKTtcbiAgICAgICAgZnMucmVhZFN5bmMoZmQsIGJ1ZmZlciwgMCwgc2l6ZSwgMCk7XG4gICAgICAgIGZzLmNsb3NlU3luYyhmZCk7XG4gICAgfSBjYXRjaCAoZSkgeyAvKiBFbXB0eSAqLyB9XG5cbiAgICAvLyBBdHRlbXB0IHRvIGV4dHJhY3Qgc2hlYmFuZyAobnVsbCBpcyByZXR1cm5lZCBpZiBub3QgYSBzaGViYW5nKVxuICAgIHJldHVybiBzaGViYW5nQ29tbWFuZChidWZmZXIudG9TdHJpbmcoKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVhZFNoZWJhbmc7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgcmVzb2x2ZUNvbW1hbmQgPSByZXF1aXJlKCcuL3V0aWwvcmVzb2x2ZUNvbW1hbmQnKTtcbmNvbnN0IGVzY2FwZSA9IHJlcXVpcmUoJy4vdXRpbC9lc2NhcGUnKTtcbmNvbnN0IHJlYWRTaGViYW5nID0gcmVxdWlyZSgnLi91dGlsL3JlYWRTaGViYW5nJyk7XG5cbmNvbnN0IGlzV2luID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJztcbmNvbnN0IGlzRXhlY3V0YWJsZVJlZ0V4cCA9IC9cXC4oPzpjb218ZXhlKSQvaTtcbmNvbnN0IGlzQ21kU2hpbVJlZ0V4cCA9IC9ub2RlX21vZHVsZXNbXFxcXC9dLmJpbltcXFxcL11bXlxcXFwvXStcXC5jbWQkL2k7XG5cbmZ1bmN0aW9uIGRldGVjdFNoZWJhbmcocGFyc2VkKSB7XG4gICAgcGFyc2VkLmZpbGUgPSByZXNvbHZlQ29tbWFuZChwYXJzZWQpO1xuXG4gICAgY29uc3Qgc2hlYmFuZyA9IHBhcnNlZC5maWxlICYmIHJlYWRTaGViYW5nKHBhcnNlZC5maWxlKTtcblxuICAgIGlmIChzaGViYW5nKSB7XG4gICAgICAgIHBhcnNlZC5hcmdzLnVuc2hpZnQocGFyc2VkLmZpbGUpO1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IHNoZWJhbmc7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmVDb21tYW5kKHBhcnNlZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlZC5maWxlO1xufVxuXG5mdW5jdGlvbiBwYXJzZU5vblNoZWxsKHBhcnNlZCkge1xuICAgIGlmICghaXNXaW4pIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICB9XG5cbiAgICAvLyBEZXRlY3QgJiBhZGQgc3VwcG9ydCBmb3Igc2hlYmFuZ3NcbiAgICBjb25zdCBjb21tYW5kRmlsZSA9IGRldGVjdFNoZWJhbmcocGFyc2VkKTtcblxuICAgIC8vIFdlIGRvbid0IG5lZWQgYSBzaGVsbCBpZiB0aGUgY29tbWFuZCBmaWxlbmFtZSBpcyBhbiBleGVjdXRhYmxlXG4gICAgY29uc3QgbmVlZHNTaGVsbCA9ICFpc0V4ZWN1dGFibGVSZWdFeHAudGVzdChjb21tYW5kRmlsZSk7XG5cbiAgICAvLyBJZiBhIHNoZWxsIGlzIHJlcXVpcmVkLCB1c2UgY21kLmV4ZSBhbmQgdGFrZSBjYXJlIG9mIGVzY2FwaW5nIGV2ZXJ5dGhpbmcgY29ycmVjdGx5XG4gICAgLy8gTm90ZSB0aGF0IGBmb3JjZVNoZWxsYCBpcyBhbiBoaWRkZW4gb3B0aW9uIHVzZWQgb25seSBpbiB0ZXN0c1xuICAgIGlmIChwYXJzZWQub3B0aW9ucy5mb3JjZVNoZWxsIHx8IG5lZWRzU2hlbGwpIHtcbiAgICAgICAgLy8gTmVlZCB0byBkb3VibGUgZXNjYXBlIG1ldGEgY2hhcnMgaWYgdGhlIGNvbW1hbmQgaXMgYSBjbWQtc2hpbSBsb2NhdGVkIGluIGBub2RlX21vZHVsZXMvLmJpbi9gXG4gICAgICAgIC8vIFRoZSBjbWQtc2hpbSBzaW1wbHkgY2FsbHMgZXhlY3V0ZSB0aGUgcGFja2FnZSBiaW4gZmlsZSB3aXRoIE5vZGVKUywgcHJveHlpbmcgYW55IGFyZ3VtZW50XG4gICAgICAgIC8vIEJlY2F1c2UgdGhlIGVzY2FwZSBvZiBtZXRhY2hhcnMgd2l0aCBeIGdldHMgaW50ZXJwcmV0ZWQgd2hlbiB0aGUgY21kLmV4ZSBpcyBmaXJzdCBjYWxsZWQsXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gZG91YmxlIGVzY2FwZSB0aGVtXG4gICAgICAgIGNvbnN0IG5lZWRzRG91YmxlRXNjYXBlTWV0YUNoYXJzID0gaXNDbWRTaGltUmVnRXhwLnRlc3QoY29tbWFuZEZpbGUpO1xuXG4gICAgICAgIC8vIE5vcm1hbGl6ZSBwb3NpeCBwYXRocyBpbnRvIE9TIGNvbXBhdGlibGUgcGF0aHMgKGUuZy46IGZvby9iYXIgLT4gZm9vXFxiYXIpXG4gICAgICAgIC8vIFRoaXMgaXMgbmVjZXNzYXJ5IG90aGVyd2lzZSBpdCB3aWxsIGFsd2F5cyBmYWlsIHdpdGggRU5PRU5UIGluIHRob3NlIGNhc2VzXG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gcGF0aC5ub3JtYWxpemUocGFyc2VkLmNvbW1hbmQpO1xuXG4gICAgICAgIC8vIEVzY2FwZSBjb21tYW5kICYgYXJndW1lbnRzXG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gZXNjYXBlLmNvbW1hbmQocGFyc2VkLmNvbW1hbmQpO1xuICAgICAgICBwYXJzZWQuYXJncyA9IHBhcnNlZC5hcmdzLm1hcCgoYXJnKSA9PiBlc2NhcGUuYXJndW1lbnQoYXJnLCBuZWVkc0RvdWJsZUVzY2FwZU1ldGFDaGFycykpO1xuXG4gICAgICAgIGNvbnN0IHNoZWxsQ29tbWFuZCA9IFtwYXJzZWQuY29tbWFuZF0uY29uY2F0KHBhcnNlZC5hcmdzKS5qb2luKCcgJyk7XG5cbiAgICAgICAgcGFyc2VkLmFyZ3MgPSBbJy9kJywgJy9zJywgJy9jJywgYFwiJHtzaGVsbENvbW1hbmR9XCJgXTtcbiAgICAgICAgcGFyc2VkLmNvbW1hbmQgPSBwcm9jZXNzLmVudi5jb21zcGVjIHx8ICdjbWQuZXhlJztcbiAgICAgICAgcGFyc2VkLm9wdGlvbnMud2luZG93c1ZlcmJhdGltQXJndW1lbnRzID0gdHJ1ZTsgLy8gVGVsbCBub2RlJ3Mgc3Bhd24gdGhhdCB0aGUgYXJndW1lbnRzIGFyZSBhbHJlYWR5IGVzY2FwZWRcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyc2VkO1xufVxuXG5mdW5jdGlvbiBwYXJzZShjb21tYW5kLCBhcmdzLCBvcHRpb25zKSB7XG4gICAgLy8gTm9ybWFsaXplIGFyZ3VtZW50cywgc2ltaWxhciB0byBub2RlanNcbiAgICBpZiAoYXJncyAmJiAhQXJyYXkuaXNBcnJheShhcmdzKSkge1xuICAgICAgICBvcHRpb25zID0gYXJncztcbiAgICAgICAgYXJncyA9IG51bGw7XG4gICAgfVxuXG4gICAgYXJncyA9IGFyZ3MgPyBhcmdzLnNsaWNlKDApIDogW107IC8vIENsb25lIGFycmF5IHRvIGF2b2lkIGNoYW5naW5nIHRoZSBvcmlnaW5hbFxuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTsgLy8gQ2xvbmUgb2JqZWN0IHRvIGF2b2lkIGNoYW5naW5nIHRoZSBvcmlnaW5hbFxuXG4gICAgLy8gQnVpbGQgb3VyIHBhcnNlZCBvYmplY3RcbiAgICBjb25zdCBwYXJzZWQgPSB7XG4gICAgICAgIGNvbW1hbmQsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIGZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgb3JpZ2luYWw6IHtcbiAgICAgICAgICAgIGNvbW1hbmQsXG4gICAgICAgICAgICBhcmdzLFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICAvLyBEZWxlZ2F0ZSBmdXJ0aGVyIHBhcnNpbmcgdG8gc2hlbGwgb3Igbm9uLXNoZWxsXG4gICAgcmV0dXJuIG9wdGlvbnMuc2hlbGwgPyBwYXJzZWQgOiBwYXJzZU5vblNoZWxsKHBhcnNlZCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBpc1dpbiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG5cbmZ1bmN0aW9uIG5vdEZvdW5kRXJyb3Iob3JpZ2luYWwsIHN5c2NhbGwpIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoYCR7c3lzY2FsbH0gJHtvcmlnaW5hbC5jb21tYW5kfSBFTk9FTlRgKSwge1xuICAgICAgICBjb2RlOiAnRU5PRU5UJyxcbiAgICAgICAgZXJybm86ICdFTk9FTlQnLFxuICAgICAgICBzeXNjYWxsOiBgJHtzeXNjYWxsfSAke29yaWdpbmFsLmNvbW1hbmR9YCxcbiAgICAgICAgcGF0aDogb3JpZ2luYWwuY29tbWFuZCxcbiAgICAgICAgc3Bhd25hcmdzOiBvcmlnaW5hbC5hcmdzLFxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBob29rQ2hpbGRQcm9jZXNzKGNwLCBwYXJzZWQpIHtcbiAgICBpZiAoIWlzV2luKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnaW5hbEVtaXQgPSBjcC5lbWl0O1xuXG4gICAgY3AuZW1pdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmcxKSB7XG4gICAgICAgIC8vIElmIGVtaXR0aW5nIFwiZXhpdFwiIGV2ZW50IGFuZCBleGl0IGNvZGUgaXMgMSwgd2UgbmVlZCB0byBjaGVjayBpZlxuICAgICAgICAvLyB0aGUgY29tbWFuZCBleGlzdHMgYW5kIGVtaXQgYW4gXCJlcnJvclwiIGluc3RlYWRcbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9JbmRpZ29Vbml0ZWQvbm9kZS1jcm9zcy1zcGF3bi9pc3N1ZXMvMTZcbiAgICAgICAgaWYgKG5hbWUgPT09ICdleGl0Jykge1xuICAgICAgICAgICAgY29uc3QgZXJyID0gdmVyaWZ5RU5PRU5UKGFyZzEsIHBhcnNlZCk7XG5cbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxFbWl0LmNhbGwoY3AsICdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3JpZ2luYWxFbWl0LmFwcGx5KGNwLCBhcmd1bWVudHMpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHByZWZlci1yZXN0LXBhcmFtc1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIHZlcmlmeUVOT0VOVChzdGF0dXMsIHBhcnNlZCkge1xuICAgIGlmIChpc1dpbiAmJiBzdGF0dXMgPT09IDEgJiYgIXBhcnNlZC5maWxlKSB7XG4gICAgICAgIHJldHVybiBub3RGb3VuZEVycm9yKHBhcnNlZC5vcmlnaW5hbCwgJ3NwYXduJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHZlcmlmeUVOT0VOVFN5bmMoc3RhdHVzLCBwYXJzZWQpIHtcbiAgICBpZiAoaXNXaW4gJiYgc3RhdHVzID09PSAxICYmICFwYXJzZWQuZmlsZSkge1xuICAgICAgICByZXR1cm4gbm90Rm91bmRFcnJvcihwYXJzZWQub3JpZ2luYWwsICdzcGF3blN5bmMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaG9va0NoaWxkUHJvY2VzcyxcbiAgICB2ZXJpZnlFTk9FTlQsXG4gICAgdmVyaWZ5RU5PRU5UU3luYyxcbiAgICBub3RGb3VuZEVycm9yLFxufTtcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGNwID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuY29uc3QgcGFyc2UgPSByZXF1aXJlKCcuL2xpYi9wYXJzZScpO1xuY29uc3QgZW5vZW50ID0gcmVxdWlyZSgnLi9saWIvZW5vZW50Jyk7XG5cbmZ1bmN0aW9uIHNwYXduKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBQYXJzZSB0aGUgYXJndW1lbnRzXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG5cbiAgICAvLyBTcGF3biB0aGUgY2hpbGQgcHJvY2Vzc1xuICAgIGNvbnN0IHNwYXduZWQgPSBjcC5zcGF3bihwYXJzZWQuY29tbWFuZCwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblxuICAgIC8vIEhvb2sgaW50byBjaGlsZCBwcm9jZXNzIFwiZXhpdFwiIGV2ZW50IHRvIGVtaXQgYW4gZXJyb3IgaWYgdGhlIGNvbW1hbmRcbiAgICAvLyBkb2VzIG5vdCBleGlzdHMsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgIGVub2VudC5ob29rQ2hpbGRQcm9jZXNzKHNwYXduZWQsIHBhcnNlZCk7XG5cbiAgICByZXR1cm4gc3Bhd25lZDtcbn1cblxuZnVuY3Rpb24gc3Bhd25TeW5jKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBQYXJzZSB0aGUgYXJndW1lbnRzXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG5cbiAgICAvLyBTcGF3biB0aGUgY2hpbGQgcHJvY2Vzc1xuICAgIGNvbnN0IHJlc3VsdCA9IGNwLnNwYXduU3luYyhwYXJzZWQuY29tbWFuZCwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblxuICAgIC8vIEFuYWx5emUgaWYgdGhlIGNvbW1hbmQgZG9lcyBub3QgZXhpc3QsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgIHJlc3VsdC5lcnJvciA9IHJlc3VsdC5lcnJvciB8fCBlbm9lbnQudmVyaWZ5RU5PRU5UU3luYyhyZXN1bHQuc3RhdHVzLCBwYXJzZWQpO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzcGF3bjtcbm1vZHVsZS5leHBvcnRzLnNwYXduID0gc3Bhd247XG5tb2R1bGUuZXhwb3J0cy5zeW5jID0gc3Bhd25TeW5jO1xuXG5tb2R1bGUuZXhwb3J0cy5fcGFyc2UgPSBwYXJzZTtcbm1vZHVsZS5leHBvcnRzLl9lbm9lbnQgPSBlbm9lbnQ7XG4iLCAiLy8gVGhpcyBpcyBub3QgdGhlIHNldCBvZiBhbGwgcG9zc2libGUgc2lnbmFscy5cbi8vXG4vLyBJdCBJUywgaG93ZXZlciwgdGhlIHNldCBvZiBhbGwgc2lnbmFscyB0aGF0IHRyaWdnZXJcbi8vIGFuIGV4aXQgb24gZWl0aGVyIExpbnV4IG9yIEJTRCBzeXN0ZW1zLiAgTGludXggaXMgYVxuLy8gc3VwZXJzZXQgb2YgdGhlIHNpZ25hbCBuYW1lcyBzdXBwb3J0ZWQgb24gQlNELCBhbmRcbi8vIHRoZSB1bmtub3duIHNpZ25hbHMganVzdCBmYWlsIHRvIHJlZ2lzdGVyLCBzbyB3ZSBjYW5cbi8vIGNhdGNoIHRoYXQgZWFzaWx5IGVub3VnaC5cbi8vXG4vLyBEb24ndCBib3RoZXIgd2l0aCBTSUdLSUxMLiAgSXQncyB1bmNhdGNoYWJsZSwgd2hpY2hcbi8vIG1lYW5zIHRoYXQgd2UgY2FuJ3QgZmlyZSBhbnkgY2FsbGJhY2tzIGFueXdheS5cbi8vXG4vLyBJZiBhIHVzZXIgZG9lcyBoYXBwZW4gdG8gcmVnaXN0ZXIgYSBoYW5kbGVyIG9uIGEgbm9uLVxuLy8gZmF0YWwgc2lnbmFsIGxpa2UgU0lHV0lOQ0ggb3Igc29tZXRoaW5nLCBhbmQgdGhlblxuLy8gZXhpdCwgaXQnbGwgZW5kIHVwIGZpcmluZyBgcHJvY2Vzcy5lbWl0KCdleGl0JylgLCBzb1xuLy8gdGhlIGhhbmRsZXIgd2lsbCBiZSBmaXJlZCBhbnl3YXkuXG4vL1xuLy8gU0lHQlVTLCBTSUdGUEUsIFNJR1NFR1YgYW5kIFNJR0lMTCwgd2hlbiBub3QgcmFpc2VkXG4vLyBhcnRpZmljaWFsbHksIGluaGVyZW50bHkgbGVhdmUgdGhlIHByb2Nlc3MgaW4gYVxuLy8gc3RhdGUgZnJvbSB3aGljaCBpdCBpcyBub3Qgc2FmZSB0byB0cnkgYW5kIGVudGVyIEpTXG4vLyBsaXN0ZW5lcnMuXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgJ1NJR0FCUlQnLFxuICAnU0lHQUxSTScsXG4gICdTSUdIVVAnLFxuICAnU0lHSU5UJyxcbiAgJ1NJR1RFUk0nXG5dXG5cbmlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSB7XG4gIG1vZHVsZS5leHBvcnRzLnB1c2goXG4gICAgJ1NJR1ZUQUxSTScsXG4gICAgJ1NJR1hDUFUnLFxuICAgICdTSUdYRlNaJyxcbiAgICAnU0lHVVNSMicsXG4gICAgJ1NJR1RSQVAnLFxuICAgICdTSUdTWVMnLFxuICAgICdTSUdRVUlUJyxcbiAgICAnU0lHSU9UJ1xuICAgIC8vIHNob3VsZCBkZXRlY3QgcHJvZmlsZXIgYW5kIGVuYWJsZS9kaXNhYmxlIGFjY29yZGluZ2x5LlxuICAgIC8vIHNlZSAjMjFcbiAgICAvLyAnU0lHUFJPRidcbiAgKVxufVxuXG5pZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2xpbnV4Jykge1xuICBtb2R1bGUuZXhwb3J0cy5wdXNoKFxuICAgICdTSUdJTycsXG4gICAgJ1NJR1BPTEwnLFxuICAgICdTSUdQV1InLFxuICAgICdTSUdTVEtGTFQnLFxuICAgICdTSUdVTlVTRUQnXG4gIClcbn1cbiIsICIvLyBOb3RlOiBzaW5jZSBueWMgdXNlcyB0aGlzIG1vZHVsZSB0byBvdXRwdXQgY292ZXJhZ2UsIGFueSBsaW5lc1xuLy8gdGhhdCBhcmUgaW4gdGhlIGRpcmVjdCBzeW5jIGZsb3cgb2YgbnljJ3Mgb3V0cHV0Q292ZXJhZ2UgYXJlXG4vLyBpZ25vcmVkLCBzaW5jZSB3ZSBjYW4gbmV2ZXIgZ2V0IGNvdmVyYWdlIGZvciB0aGVtLlxuLy8gZ3JhYiBhIHJlZmVyZW5jZSB0byBub2RlJ3MgcmVhbCBwcm9jZXNzIG9iamVjdCByaWdodCBhd2F5XG52YXIgcHJvY2VzcyA9IGdsb2JhbC5wcm9jZXNzXG5cbmNvbnN0IHByb2Nlc3NPayA9IGZ1bmN0aW9uIChwcm9jZXNzKSB7XG4gIHJldHVybiBwcm9jZXNzICYmXG4gICAgdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5lbWl0ID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3MucmVhbGx5RXhpdCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLmxpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLmtpbGwgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5waWQgPT09ICdudW1iZXInICYmXG4gICAgdHlwZW9mIHByb2Nlc3Mub24gPT09ICdmdW5jdGlvbidcbn1cblxuLy8gc29tZSBraW5kIG9mIG5vbi1ub2RlIGVudmlyb25tZW50LCBqdXN0IG5vLW9wXG4vKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbmlmICghcHJvY2Vzc09rKHByb2Nlc3MpKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7fVxuICB9XG59IGVsc2Uge1xuICB2YXIgYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0JylcbiAgdmFyIHNpZ25hbHMgPSByZXF1aXJlKCcuL3NpZ25hbHMuanMnKVxuICB2YXIgaXNXaW4gPSAvXndpbi9pLnRlc3QocHJvY2Vzcy5wbGF0Zm9ybSlcblxuICB2YXIgRUUgPSByZXF1aXJlKCdldmVudHMnKVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKHR5cGVvZiBFRSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIEVFID0gRUUuRXZlbnRFbWl0dGVyXG4gIH1cblxuICB2YXIgZW1pdHRlclxuICBpZiAocHJvY2Vzcy5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfXykge1xuICAgIGVtaXR0ZXIgPSBwcm9jZXNzLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fXG4gIH0gZWxzZSB7XG4gICAgZW1pdHRlciA9IHByb2Nlc3MuX19zaWduYWxfZXhpdF9lbWl0dGVyX18gPSBuZXcgRUUoKVxuICAgIGVtaXR0ZXIuY291bnQgPSAwXG4gICAgZW1pdHRlci5lbWl0dGVkID0ge31cbiAgfVxuXG4gIC8vIEJlY2F1c2UgdGhpcyBlbWl0dGVyIGlzIGEgZ2xvYmFsLCB3ZSBoYXZlIHRvIGNoZWNrIHRvIHNlZSBpZiBhXG4gIC8vIHByZXZpb3VzIHZlcnNpb24gb2YgdGhpcyBsaWJyYXJ5IGZhaWxlZCB0byBlbmFibGUgaW5maW5pdGUgbGlzdGVuZXJzLlxuICAvLyBJIGtub3cgd2hhdCB5b3UncmUgYWJvdXQgdG8gc2F5LiAgQnV0IGxpdGVyYWxseSBldmVyeXRoaW5nIGFib3V0XG4gIC8vIHNpZ25hbC1leGl0IGlzIGEgY29tcHJvbWlzZSB3aXRoIGV2aWwuICBHZXQgdXNlZCB0byBpdC5cbiAgaWYgKCFlbWl0dGVyLmluZmluaXRlKSB7XG4gICAgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoSW5maW5pdHkpXG4gICAgZW1pdHRlci5pbmZpbml0ZSA9IHRydWVcbiAgfVxuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNiLCBvcHRzKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge31cbiAgICB9XG4gICAgYXNzZXJ0LmVxdWFsKHR5cGVvZiBjYiwgJ2Z1bmN0aW9uJywgJ2EgY2FsbGJhY2sgbXVzdCBiZSBwcm92aWRlZCBmb3IgZXhpdCBoYW5kbGVyJylcblxuICAgIGlmIChsb2FkZWQgPT09IGZhbHNlKSB7XG4gICAgICBsb2FkKClcbiAgICB9XG5cbiAgICB2YXIgZXYgPSAnZXhpdCdcbiAgICBpZiAob3B0cyAmJiBvcHRzLmFsd2F5c0xhc3QpIHtcbiAgICAgIGV2ID0gJ2FmdGVyZXhpdCdcbiAgICB9XG5cbiAgICB2YXIgcmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihldiwgY2IpXG4gICAgICBpZiAoZW1pdHRlci5saXN0ZW5lcnMoJ2V4aXQnKS5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgICBlbWl0dGVyLmxpc3RlbmVycygnYWZ0ZXJleGl0JykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHVubG9hZCgpXG4gICAgICB9XG4gICAgfVxuICAgIGVtaXR0ZXIub24oZXYsIGNiKVxuXG4gICAgcmV0dXJuIHJlbW92ZVxuICB9XG5cbiAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uIHVubG9hZCAoKSB7XG4gICAgaWYgKCFsb2FkZWQgfHwgIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsb2FkZWQgPSBmYWxzZVxuXG4gICAgc2lnbmFscy5mb3JFYWNoKGZ1bmN0aW9uIChzaWcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIoc2lnLCBzaWdMaXN0ZW5lcnNbc2lnXSlcbiAgICAgIH0gY2F0Y2ggKGVyKSB7fVxuICAgIH0pXG4gICAgcHJvY2Vzcy5lbWl0ID0gb3JpZ2luYWxQcm9jZXNzRW1pdFxuICAgIHByb2Nlc3MucmVhbGx5RXhpdCA9IG9yaWdpbmFsUHJvY2Vzc1JlYWxseUV4aXRcbiAgICBlbWl0dGVyLmNvdW50IC09IDFcbiAgfVxuICBtb2R1bGUuZXhwb3J0cy51bmxvYWQgPSB1bmxvYWRcblxuICB2YXIgZW1pdCA9IGZ1bmN0aW9uIGVtaXQgKGV2ZW50LCBjb2RlLCBzaWduYWwpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoZW1pdHRlci5lbWl0dGVkW2V2ZW50XSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGVtaXR0ZXIuZW1pdHRlZFtldmVudF0gPSB0cnVlXG4gICAgZW1pdHRlci5lbWl0KGV2ZW50LCBjb2RlLCBzaWduYWwpXG4gIH1cblxuICAvLyB7IDxzaWduYWw+OiA8bGlzdGVuZXIgZm4+LCAuLi4gfVxuICB2YXIgc2lnTGlzdGVuZXJzID0ge31cbiAgc2lnbmFscy5mb3JFYWNoKGZ1bmN0aW9uIChzaWcpIHtcbiAgICBzaWdMaXN0ZW5lcnNbc2lnXSA9IGZ1bmN0aW9uIGxpc3RlbmVyICgpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKCFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIG90aGVyIGxpc3RlbmVycywgYW4gZXhpdCBpcyBjb21pbmchXG4gICAgICAvLyBTaW1wbGVzdCB3YXk6IHJlbW92ZSB1cyBhbmQgdGhlbiByZS1zZW5kIHRoZSBzaWduYWwuXG4gICAgICAvLyBXZSBrbm93IHRoYXQgdGhpcyB3aWxsIGtpbGwgdGhlIHByb2Nlc3MsIHNvIHdlIGNhblxuICAgICAgLy8gc2FmZWx5IGVtaXQgbm93LlxuICAgICAgdmFyIGxpc3RlbmVycyA9IHByb2Nlc3MubGlzdGVuZXJzKHNpZylcbiAgICAgIGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSBlbWl0dGVyLmNvdW50KSB7XG4gICAgICAgIHVubG9hZCgpXG4gICAgICAgIGVtaXQoJ2V4aXQnLCBudWxsLCBzaWcpXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGVtaXQoJ2FmdGVyZXhpdCcsIG51bGwsIHNpZylcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgaWYgKGlzV2luICYmIHNpZyA9PT0gJ1NJR0hVUCcpIHtcbiAgICAgICAgICAvLyBcIlNJR0hVUFwiIHRocm93cyBhbiBgRU5PU1lTYCBlcnJvciBvbiBXaW5kb3dzLFxuICAgICAgICAgIC8vIHNvIHVzZSBhIHN1cHBvcnRlZCBzaWduYWwgaW5zdGVhZFxuICAgICAgICAgIHNpZyA9ICdTSUdJTlQnXG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgcHJvY2Vzcy5raWxsKHByb2Nlc3MucGlkLCBzaWcpXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIG1vZHVsZS5leHBvcnRzLnNpZ25hbHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHNpZ25hbHNcbiAgfVxuXG4gIHZhciBsb2FkZWQgPSBmYWxzZVxuXG4gIHZhciBsb2FkID0gZnVuY3Rpb24gbG9hZCAoKSB7XG4gICAgaWYgKGxvYWRlZCB8fCAhcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxvYWRlZCA9IHRydWVcblxuICAgIC8vIFRoaXMgaXMgdGhlIG51bWJlciBvZiBvblNpZ25hbEV4aXQncyB0aGF0IGFyZSBpbiBwbGF5LlxuICAgIC8vIEl0J3MgaW1wb3J0YW50IHNvIHRoYXQgd2UgY2FuIGNvdW50IHRoZSBjb3JyZWN0IG51bWJlciBvZlxuICAgIC8vIGxpc3RlbmVycyBvbiBzaWduYWxzLCBhbmQgZG9uJ3Qgd2FpdCBmb3IgdGhlIG90aGVyIG9uZSB0b1xuICAgIC8vIGhhbmRsZSBpdCBpbnN0ZWFkIG9mIHVzLlxuICAgIGVtaXR0ZXIuY291bnQgKz0gMVxuXG4gICAgc2lnbmFscyA9IHNpZ25hbHMuZmlsdGVyKGZ1bmN0aW9uIChzaWcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHByb2Nlc3Mub24oc2lnLCBzaWdMaXN0ZW5lcnNbc2lnXSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBwcm9jZXNzLmVtaXQgPSBwcm9jZXNzRW1pdFxuICAgIHByb2Nlc3MucmVhbGx5RXhpdCA9IHByb2Nlc3NSZWFsbHlFeGl0XG4gIH1cbiAgbW9kdWxlLmV4cG9ydHMubG9hZCA9IGxvYWRcblxuICB2YXIgb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdCA9IHByb2Nlc3MucmVhbGx5RXhpdFxuICB2YXIgcHJvY2Vzc1JlYWxseUV4aXQgPSBmdW5jdGlvbiBwcm9jZXNzUmVhbGx5RXhpdCAoY29kZSkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHByb2Nlc3MuZXhpdENvZGUgPSBjb2RlIHx8IC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIDBcbiAgICBlbWl0KCdleGl0JywgcHJvY2Vzcy5leGl0Q29kZSwgbnVsbClcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGVtaXQoJ2FmdGVyZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0LmNhbGwocHJvY2VzcywgcHJvY2Vzcy5leGl0Q29kZSlcbiAgfVxuXG4gIHZhciBvcmlnaW5hbFByb2Nlc3NFbWl0ID0gcHJvY2Vzcy5lbWl0XG4gIHZhciBwcm9jZXNzRW1pdCA9IGZ1bmN0aW9uIHByb2Nlc3NFbWl0IChldiwgYXJnKSB7XG4gICAgaWYgKGV2ID09PSAnZXhpdCcgJiYgcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmIChhcmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwcm9jZXNzLmV4aXRDb2RlID0gYXJnXG4gICAgICB9XG4gICAgICB2YXIgcmV0ID0gb3JpZ2luYWxQcm9jZXNzRW1pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgZW1pdCgnZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgZW1pdCgnYWZ0ZXJleGl0JywgcHJvY2Vzcy5leGl0Q29kZSwgbnVsbClcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICByZXR1cm4gcmV0XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcmlnaW5hbFByb2Nlc3NFbWl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9XG4gIH1cbn1cbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCB7UGFzc1Rocm91Z2g6IFBhc3NUaHJvdWdoU3RyZWFtfSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG9wdGlvbnMgPT4ge1xuXHRvcHRpb25zID0gey4uLm9wdGlvbnN9O1xuXG5cdGNvbnN0IHthcnJheX0gPSBvcHRpb25zO1xuXHRsZXQge2VuY29kaW5nfSA9IG9wdGlvbnM7XG5cdGNvbnN0IGlzQnVmZmVyID0gZW5jb2RpbmcgPT09ICdidWZmZXInO1xuXHRsZXQgb2JqZWN0TW9kZSA9IGZhbHNlO1xuXG5cdGlmIChhcnJheSkge1xuXHRcdG9iamVjdE1vZGUgPSAhKGVuY29kaW5nIHx8IGlzQnVmZmVyKTtcblx0fSBlbHNlIHtcblx0XHRlbmNvZGluZyA9IGVuY29kaW5nIHx8ICd1dGY4Jztcblx0fVxuXG5cdGlmIChpc0J1ZmZlcikge1xuXHRcdGVuY29kaW5nID0gbnVsbDtcblx0fVxuXG5cdGNvbnN0IHN0cmVhbSA9IG5ldyBQYXNzVGhyb3VnaFN0cmVhbSh7b2JqZWN0TW9kZX0pO1xuXG5cdGlmIChlbmNvZGluZykge1xuXHRcdHN0cmVhbS5zZXRFbmNvZGluZyhlbmNvZGluZyk7XG5cdH1cblxuXHRsZXQgbGVuZ3RoID0gMDtcblx0Y29uc3QgY2h1bmtzID0gW107XG5cblx0c3RyZWFtLm9uKCdkYXRhJywgY2h1bmsgPT4ge1xuXHRcdGNodW5rcy5wdXNoKGNodW5rKTtcblxuXHRcdGlmIChvYmplY3RNb2RlKSB7XG5cdFx0XHRsZW5ndGggPSBjaHVua3MubGVuZ3RoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZW5ndGggKz0gY2h1bmsubGVuZ3RoO1xuXHRcdH1cblx0fSk7XG5cblx0c3RyZWFtLmdldEJ1ZmZlcmVkVmFsdWUgPSAoKSA9PiB7XG5cdFx0aWYgKGFycmF5KSB7XG5cdFx0XHRyZXR1cm4gY2h1bmtzO1xuXHRcdH1cblxuXHRcdHJldHVybiBpc0J1ZmZlciA/IEJ1ZmZlci5jb25jYXQoY2h1bmtzLCBsZW5ndGgpIDogY2h1bmtzLmpvaW4oJycpO1xuXHR9O1xuXG5cdHN0cmVhbS5nZXRCdWZmZXJlZExlbmd0aCA9ICgpID0+IGxlbmd0aDtcblxuXHRyZXR1cm4gc3RyZWFtO1xufTtcbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCB7Y29uc3RhbnRzOiBCdWZmZXJDb25zdGFudHN9ID0gcmVxdWlyZSgnYnVmZmVyJyk7XG5jb25zdCBzdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcbmNvbnN0IHtwcm9taXNpZnl9ID0gcmVxdWlyZSgndXRpbCcpO1xuY29uc3QgYnVmZmVyU3RyZWFtID0gcmVxdWlyZSgnLi9idWZmZXItc3RyZWFtJyk7XG5cbmNvbnN0IHN0cmVhbVBpcGVsaW5lUHJvbWlzaWZpZWQgPSBwcm9taXNpZnkoc3RyZWFtLnBpcGVsaW5lKTtcblxuY2xhc3MgTWF4QnVmZmVyRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCdtYXhCdWZmZXIgZXhjZWVkZWQnKTtcblx0XHR0aGlzLm5hbWUgPSAnTWF4QnVmZmVyRXJyb3InO1xuXHR9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFN0cmVhbShpbnB1dFN0cmVhbSwgb3B0aW9ucykge1xuXHRpZiAoIWlucHV0U3RyZWFtKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBhIHN0cmVhbScpO1xuXHR9XG5cblx0b3B0aW9ucyA9IHtcblx0XHRtYXhCdWZmZXI6IEluZmluaXR5LFxuXHRcdC4uLm9wdGlvbnNcblx0fTtcblxuXHRjb25zdCB7bWF4QnVmZmVyfSA9IG9wdGlvbnM7XG5cdGNvbnN0IHN0cmVhbSA9IGJ1ZmZlclN0cmVhbShvcHRpb25zKTtcblxuXHRhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0Y29uc3QgcmVqZWN0UHJvbWlzZSA9IGVycm9yID0+IHtcblx0XHRcdC8vIERvbid0IHJldHJpZXZlIGFuIG92ZXJzaXplZCBidWZmZXIuXG5cdFx0XHRpZiAoZXJyb3IgJiYgc3RyZWFtLmdldEJ1ZmZlcmVkTGVuZ3RoKCkgPD0gQnVmZmVyQ29uc3RhbnRzLk1BWF9MRU5HVEgpIHtcblx0XHRcdFx0ZXJyb3IuYnVmZmVyZWREYXRhID0gc3RyZWFtLmdldEJ1ZmZlcmVkVmFsdWUoKTtcblx0XHRcdH1cblxuXHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHR9O1xuXG5cdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF3YWl0IHN0cmVhbVBpcGVsaW5lUHJvbWlzaWZpZWQoaW5wdXRTdHJlYW0sIHN0cmVhbSk7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdHJlamVjdFByb21pc2UoZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pKCk7XG5cblx0XHRzdHJlYW0ub24oJ2RhdGEnLCAoKSA9PiB7XG5cdFx0XHRpZiAoc3RyZWFtLmdldEJ1ZmZlcmVkTGVuZ3RoKCkgPiBtYXhCdWZmZXIpIHtcblx0XHRcdFx0cmVqZWN0UHJvbWlzZShuZXcgTWF4QnVmZmVyRXJyb3IoKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiBzdHJlYW0uZ2V0QnVmZmVyZWRWYWx1ZSgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFN0cmVhbTtcbm1vZHVsZS5leHBvcnRzLmJ1ZmZlciA9IChzdHJlYW0sIG9wdGlvbnMpID0+IGdldFN0cmVhbShzdHJlYW0sIHsuLi5vcHRpb25zLCBlbmNvZGluZzogJ2J1ZmZlcid9KTtcbm1vZHVsZS5leHBvcnRzLmFycmF5ID0gKHN0cmVhbSwgb3B0aW9ucykgPT4gZ2V0U3RyZWFtKHN0cmVhbSwgey4uLm9wdGlvbnMsIGFycmF5OiB0cnVlfSk7XG5tb2R1bGUuZXhwb3J0cy5NYXhCdWZmZXJFcnJvciA9IE1heEJ1ZmZlckVycm9yO1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgeyBQYXNzVGhyb3VnaCB9ID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKC8qc3RyZWFtcy4uLiovKSB7XG4gIHZhciBzb3VyY2VzID0gW11cbiAgdmFyIG91dHB1dCAgPSBuZXcgUGFzc1Rocm91Z2goe29iamVjdE1vZGU6IHRydWV9KVxuXG4gIG91dHB1dC5zZXRNYXhMaXN0ZW5lcnMoMClcblxuICBvdXRwdXQuYWRkID0gYWRkXG4gIG91dHB1dC5pc0VtcHR5ID0gaXNFbXB0eVxuXG4gIG91dHB1dC5vbigndW5waXBlJywgcmVtb3ZlKVxuXG4gIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuZm9yRWFjaChhZGQpXG5cbiAgcmV0dXJuIG91dHB1dFxuXG4gIGZ1bmN0aW9uIGFkZCAoc291cmNlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgc291cmNlLmZvckVhY2goYWRkKVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICBzb3VyY2VzLnB1c2goc291cmNlKTtcbiAgICBzb3VyY2Uub25jZSgnZW5kJywgcmVtb3ZlLmJpbmQobnVsbCwgc291cmNlKSlcbiAgICBzb3VyY2Uub25jZSgnZXJyb3InLCBvdXRwdXQuZW1pdC5iaW5kKG91dHB1dCwgJ2Vycm9yJykpXG4gICAgc291cmNlLnBpcGUob3V0cHV0LCB7ZW5kOiBmYWxzZX0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRW1wdHkgKCkge1xuICAgIHJldHVybiBzb3VyY2VzLmxlbmd0aCA9PSAwO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlIChzb3VyY2UpIHtcbiAgICBzb3VyY2VzID0gc291cmNlcy5maWx0ZXIoZnVuY3Rpb24gKGl0KSB7IHJldHVybiBpdCAhPT0gc291cmNlIH0pXG4gICAgaWYgKCFzb3VyY2VzLmxlbmd0aCAmJiBvdXRwdXQucmVhZGFibGUpIHsgb3V0cHV0LmVuZCgpIH1cbiAgfVxufVxuIiwgIi8qKlxuICogQGxpY2Vuc2Ugbm9kZS1zdHJlYW0temlwIHwgKGMpIDIwMjAgQW50ZWxsZSB8IGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRlbGxlL25vZGUtc3RyZWFtLXppcC9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKiBQb3J0aW9ucyBjb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL2N0aGFja2Vycy9hZG0temlwIHwgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2N0aGFja2Vycy9hZG0temlwL21hc3Rlci9MSUNFTlNFXG4gKi9cblxubGV0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZXZlbnRzID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCB6bGliID0gcmVxdWlyZSgnemxpYicpO1xuY29uc3Qgc3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5cbmNvbnN0IGNvbnN0cyA9IHtcbiAgICAvKiBUaGUgbG9jYWwgZmlsZSBoZWFkZXIgKi9cbiAgICBMT0NIRFI6IDMwLCAvLyBMT0MgaGVhZGVyIHNpemVcbiAgICBMT0NTSUc6IDB4MDQwMzRiNTAsIC8vIFwiUEtcXDAwM1xcMDA0XCJcbiAgICBMT0NWRVI6IDQsIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcbiAgICBMT0NGTEc6IDYsIC8vIGdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZ1xuICAgIExPQ0hPVzogOCwgLy8gY29tcHJlc3Npb24gbWV0aG9kXG4gICAgTE9DVElNOiAxMCwgLy8gbW9kaWZpY2F0aW9uIHRpbWUgKDIgYnl0ZXMgdGltZSwgMiBieXRlcyBkYXRlKVxuICAgIExPQ0NSQzogMTQsIC8vIHVuY29tcHJlc3NlZCBmaWxlIGNyYy0zMiB2YWx1ZVxuICAgIExPQ1NJWjogMTgsIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgIExPQ0xFTjogMjIsIC8vIHVuY29tcHJlc3NlZCBzaXplXG4gICAgTE9DTkFNOiAyNiwgLy8gZmlsZW5hbWUgbGVuZ3RoXG4gICAgTE9DRVhUOiAyOCwgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG5cbiAgICAvKiBUaGUgRGF0YSBkZXNjcmlwdG9yICovXG4gICAgRVhUU0lHOiAweDA4MDc0YjUwLCAvLyBcIlBLXFwwMDdcXDAwOFwiXG4gICAgRVhUSERSOiAxNiwgLy8gRVhUIGhlYWRlciBzaXplXG4gICAgRVhUQ1JDOiA0LCAvLyB1bmNvbXByZXNzZWQgZmlsZSBjcmMtMzIgdmFsdWVcbiAgICBFWFRTSVo6IDgsIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgIEVYVExFTjogMTIsIC8vIHVuY29tcHJlc3NlZCBzaXplXG5cbiAgICAvKiBUaGUgY2VudHJhbCBkaXJlY3RvcnkgZmlsZSBoZWFkZXIgKi9cbiAgICBDRU5IRFI6IDQ2LCAvLyBDRU4gaGVhZGVyIHNpemVcbiAgICBDRU5TSUc6IDB4MDIwMTRiNTAsIC8vIFwiUEtcXDAwMVxcMDAyXCJcbiAgICBDRU5WRU06IDQsIC8vIHZlcnNpb24gbWFkZSBieVxuICAgIENFTlZFUjogNiwgLy8gdmVyc2lvbiBuZWVkZWQgdG8gZXh0cmFjdFxuICAgIENFTkZMRzogOCwgLy8gZW5jcnlwdCwgZGVjcnlwdCBmbGFnc1xuICAgIENFTkhPVzogMTAsIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICAgIENFTlRJTTogMTIsIC8vIG1vZGlmaWNhdGlvbiB0aW1lICgyIGJ5dGVzIHRpbWUsIDIgYnl0ZXMgZGF0ZSlcbiAgICBDRU5DUkM6IDE2LCAvLyB1bmNvbXByZXNzZWQgZmlsZSBjcmMtMzIgdmFsdWVcbiAgICBDRU5TSVo6IDIwLCAvLyBjb21wcmVzc2VkIHNpemVcbiAgICBDRU5MRU46IDI0LCAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuICAgIENFTk5BTTogMjgsIC8vIGZpbGVuYW1lIGxlbmd0aFxuICAgIENFTkVYVDogMzAsIC8vIGV4dHJhIGZpZWxkIGxlbmd0aFxuICAgIENFTkNPTTogMzIsIC8vIGZpbGUgY29tbWVudCBsZW5ndGhcbiAgICBDRU5EU0s6IDM0LCAvLyB2b2x1bWUgbnVtYmVyIHN0YXJ0XG4gICAgQ0VOQVRUOiAzNiwgLy8gaW50ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXG4gICAgQ0VOQVRYOiAzOCwgLy8gZXh0ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzIChob3N0IHN5c3RlbSBkZXBlbmRlbnQpXG4gICAgQ0VOT0ZGOiA0MiwgLy8gTE9DIGhlYWRlciBvZmZzZXRcblxuICAgIC8qIFRoZSBlbnRyaWVzIGluIHRoZSBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnkgKi9cbiAgICBFTkRIRFI6IDIyLCAvLyBFTkQgaGVhZGVyIHNpemVcbiAgICBFTkRTSUc6IDB4MDYwNTRiNTAsIC8vIFwiUEtcXDAwNVxcMDA2XCJcbiAgICBFTkRTSUdGSVJTVDogMHg1MCxcbiAgICBFTkRTVUI6IDgsIC8vIG51bWJlciBvZiBlbnRyaWVzIG9uIHRoaXMgZGlza1xuICAgIEVORFRPVDogMTAsIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzXG4gICAgRU5EU0laOiAxMiwgLy8gY2VudHJhbCBkaXJlY3Rvcnkgc2l6ZSBpbiBieXRlc1xuICAgIEVORE9GRjogMTYsIC8vIG9mZnNldCBvZiBmaXJzdCBDRU4gaGVhZGVyXG4gICAgRU5EQ09NOiAyMCwgLy8gemlwIGZpbGUgY29tbWVudCBsZW5ndGhcbiAgICBNQVhGSUxFQ09NTUVOVDogMHhmZmZmLFxuXG4gICAgLyogVGhlIGVudHJpZXMgaW4gdGhlIGVuZCBvZiBaSVA2NCBjZW50cmFsIGRpcmVjdG9yeSBsb2NhdG9yICovXG4gICAgRU5ETDY0SERSOiAyMCwgLy8gWklQNjQgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5IGxvY2F0b3IgaGVhZGVyIHNpemVcbiAgICBFTkRMNjRTSUc6IDB4MDcwNjRiNTAsIC8vIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBsb2NhdG9yIHNpZ25hdHVyZVxuICAgIEVOREw2NFNJR0ZJUlNUOiAweDUwLFxuICAgIEVOREw2NE9GUzogOCwgLy8gWklQNjQgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5IG9mZnNldFxuXG4gICAgLyogVGhlIGVudHJpZXMgaW4gdGhlIGVuZCBvZiBaSVA2NCBjZW50cmFsIGRpcmVjdG9yeSAqL1xuICAgIEVORDY0SERSOiA1NiwgLy8gWklQNjQgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5IGhlYWRlciBzaXplXG4gICAgRU5ENjRTSUc6IDB4MDYwNjRiNTAsIC8vIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBzaWduYXR1cmVcbiAgICBFTkQ2NFNJR0ZJUlNUOiAweDUwLFxuICAgIEVORDY0U1VCOiAyNCwgLy8gbnVtYmVyIG9mIGVudHJpZXMgb24gdGhpcyBkaXNrXG4gICAgRU5ENjRUT1Q6IDMyLCAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllc1xuICAgIEVORDY0U0laOiA0MCxcbiAgICBFTkQ2NE9GRjogNDgsXG5cbiAgICAvKiBDb21wcmVzc2lvbiBtZXRob2RzICovXG4gICAgU1RPUkVEOiAwLCAvLyBubyBjb21wcmVzc2lvblxuICAgIFNIUlVOSzogMSwgLy8gc2hydW5rXG4gICAgUkVEVUNFRDE6IDIsIC8vIHJlZHVjZWQgd2l0aCBjb21wcmVzc2lvbiBmYWN0b3IgMVxuICAgIFJFRFVDRUQyOiAzLCAvLyByZWR1Y2VkIHdpdGggY29tcHJlc3Npb24gZmFjdG9yIDJcbiAgICBSRURVQ0VEMzogNCwgLy8gcmVkdWNlZCB3aXRoIGNvbXByZXNzaW9uIGZhY3RvciAzXG4gICAgUkVEVUNFRDQ6IDUsIC8vIHJlZHVjZWQgd2l0aCBjb21wcmVzc2lvbiBmYWN0b3IgNFxuICAgIElNUExPREVEOiA2LCAvLyBpbXBsb2RlZFxuICAgIC8vIDcgcmVzZXJ2ZWRcbiAgICBERUZMQVRFRDogOCwgLy8gZGVmbGF0ZWRcbiAgICBFTkhBTkNFRF9ERUZMQVRFRDogOSwgLy8gZGVmbGF0ZTY0XG4gICAgUEtXQVJFOiAxMCwgLy8gUEtXYXJlIERDTCBpbXBsb2RlZFxuICAgIC8vIDExIHJlc2VydmVkXG4gICAgQlpJUDI6IDEyLCAvLyAgY29tcHJlc3NlZCB1c2luZyBCWklQMlxuICAgIC8vIDEzIHJlc2VydmVkXG4gICAgTFpNQTogMTQsIC8vIExaTUFcbiAgICAvLyAxNS0xNyByZXNlcnZlZFxuICAgIElCTV9URVJTRTogMTgsIC8vIGNvbXByZXNzZWQgdXNpbmcgSUJNIFRFUlNFXG4gICAgSUJNX0xaNzc6IDE5LCAvL0lCTSBMWjc3IHpcblxuICAgIC8qIEdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZyAqL1xuICAgIEZMR19FTkM6IDAsIC8vIGVuY3J5cHRlZCBmaWxlXG4gICAgRkxHX0NPTVAxOiAxLCAvLyBjb21wcmVzc2lvbiBvcHRpb25cbiAgICBGTEdfQ09NUDI6IDIsIC8vIGNvbXByZXNzaW9uIG9wdGlvblxuICAgIEZMR19ERVNDOiA0LCAvLyBkYXRhIGRlc2NyaXB0b3JcbiAgICBGTEdfRU5IOiA4LCAvLyBlbmhhbmNlZCBkZWZsYXRpb25cbiAgICBGTEdfU1RSOiAxNiwgLy8gc3Ryb25nIGVuY3J5cHRpb25cbiAgICBGTEdfTE5HOiAxMDI0LCAvLyBsYW5ndWFnZSBlbmNvZGluZ1xuICAgIEZMR19NU0s6IDQwOTYsIC8vIG1hc2sgaGVhZGVyIHZhbHVlc1xuICAgIEZMR19FTlRSWV9FTkM6IDEsXG5cbiAgICAvKiA0LjUgRXh0ZW5zaWJsZSBkYXRhIGZpZWxkcyAqL1xuICAgIEVGX0lEOiAwLFxuICAgIEVGX1NJWkU6IDIsXG5cbiAgICAvKiBIZWFkZXIgSURzICovXG4gICAgSURfWklQNjQ6IDB4MDAwMSxcbiAgICBJRF9BVklORk86IDB4MDAwNyxcbiAgICBJRF9QRlM6IDB4MDAwOCxcbiAgICBJRF9PUzI6IDB4MDAwOSxcbiAgICBJRF9OVEZTOiAweDAwMGEsXG4gICAgSURfT1BFTlZNUzogMHgwMDBjLFxuICAgIElEX1VOSVg6IDB4MDAwZCxcbiAgICBJRF9GT1JLOiAweDAwMGUsXG4gICAgSURfUEFUQ0g6IDB4MDAwZixcbiAgICBJRF9YNTA5X1BLQ1M3OiAweDAwMTQsXG4gICAgSURfWDUwOV9DRVJUSURfRjogMHgwMDE1LFxuICAgIElEX1g1MDlfQ0VSVElEX0M6IDB4MDAxNixcbiAgICBJRF9TVFJPTkdFTkM6IDB4MDAxNyxcbiAgICBJRF9SRUNPUkRfTUdUOiAweDAwMTgsXG4gICAgSURfWDUwOV9QS0NTN19STDogMHgwMDE5LFxuICAgIElEX0lCTTE6IDB4MDA2NSxcbiAgICBJRF9JQk0yOiAweDAwNjYsXG4gICAgSURfUE9TWklQOiAweDQ2OTAsXG5cbiAgICBFRl9aSVA2NF9PUl8zMjogMHhmZmZmZmZmZixcbiAgICBFRl9aSVA2NF9PUl8xNjogMHhmZmZmLFxufTtcblxuY29uc3QgU3RyZWFtWmlwID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIGxldCBmZCwgZmlsZVNpemUsIGNodW5rU2l6ZSwgb3AsIGNlbnRyYWxEaXJlY3RvcnksIGNsb3NlZDtcbiAgICBjb25zdCByZWFkeSA9IGZhbHNlLFxuICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgZW50cmllcyA9IGNvbmZpZy5zdG9yZUVudHJpZXMgIT09IGZhbHNlID8ge30gOiBudWxsLFxuICAgICAgICBmaWxlTmFtZSA9IGNvbmZpZy5maWxlLFxuICAgICAgICB0ZXh0RGVjb2RlciA9IGNvbmZpZy5uYW1lRW5jb2RpbmcgPyBuZXcgVGV4dERlY29kZXIoY29uZmlnLm5hbWVFbmNvZGluZykgOiBudWxsO1xuXG4gICAgb3BlbigpO1xuXG4gICAgZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5mZCkge1xuICAgICAgICAgICAgZmQgPSBjb25maWcuZmQ7XG4gICAgICAgICAgICByZWFkRmlsZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnMub3BlbihmaWxlTmFtZSwgJ3InLCAoZXJyLCBmKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZkID0gZjtcbiAgICAgICAgICAgICAgICByZWFkRmlsZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkRmlsZSgpIHtcbiAgICAgICAgZnMuZnN0YXQoZmQsIChlcnIsIHN0YXQpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlU2l6ZSA9IHN0YXQuc2l6ZTtcbiAgICAgICAgICAgIGNodW5rU2l6ZSA9IGNvbmZpZy5jaHVua1NpemUgfHwgTWF0aC5yb3VuZChmaWxlU2l6ZSAvIDEwMDApO1xuICAgICAgICAgICAgY2h1bmtTaXplID0gTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgTWF0aC5taW4oY2h1bmtTaXplLCBNYXRoLm1pbigxMjggKiAxMDI0LCBmaWxlU2l6ZSkpLFxuICAgICAgICAgICAgICAgIE1hdGgubWluKDEwMjQsIGZpbGVTaXplKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJlYWRDZW50cmFsRGlyZWN0b3J5KCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRVbnRpbEZvdW5kQ2FsbGJhY2soZXJyLCBieXRlc1JlYWQpIHtcbiAgICAgICAgaWYgKGVyciB8fCAhYnl0ZXNSZWFkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIGVyciB8fCBuZXcgRXJyb3IoJ0FyY2hpdmUgcmVhZCBlcnJvcicpKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcG9zID0gb3AubGFzdFBvcztcbiAgICAgICAgbGV0IGJ1ZmZlclBvc2l0aW9uID0gcG9zIC0gb3Aud2luLnBvc2l0aW9uO1xuICAgICAgICBjb25zdCBidWZmZXIgPSBvcC53aW4uYnVmZmVyO1xuICAgICAgICBjb25zdCBtaW5Qb3MgPSBvcC5taW5Qb3M7XG4gICAgICAgIHdoaWxlICgtLXBvcyA+PSBtaW5Qb3MgJiYgLS1idWZmZXJQb3NpdGlvbiA+PSAwKSB7XG4gICAgICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCAtIGJ1ZmZlclBvc2l0aW9uID49IDQgJiYgYnVmZmVyW2J1ZmZlclBvc2l0aW9uXSA9PT0gb3AuZmlyc3RCeXRlKSB7XG4gICAgICAgICAgICAgICAgLy8gcXVpY2sgY2hlY2sgZmlyc3Qgc2lnbmF0dXJlIGJ5dGVcbiAgICAgICAgICAgICAgICBpZiAoYnVmZmVyLnJlYWRVSW50MzJMRShidWZmZXJQb3NpdGlvbikgPT09IG9wLnNpZykge1xuICAgICAgICAgICAgICAgICAgICBvcC5sYXN0QnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgb3AubGFzdEJ5dGVzUmVhZCA9IGJ5dGVzUmVhZDtcbiAgICAgICAgICAgICAgICAgICAgb3AuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocG9zID09PSBtaW5Qb3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdCYWQgYXJjaGl2ZScpKTtcbiAgICAgICAgfVxuICAgICAgICBvcC5sYXN0UG9zID0gcG9zICsgMTtcbiAgICAgICAgb3AuY2h1bmtTaXplICo9IDI7XG4gICAgICAgIGlmIChwb3MgPD0gbWluUG9zKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignQmFkIGFyY2hpdmUnKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXhwYW5kTGVuZ3RoID0gTWF0aC5taW4ob3AuY2h1bmtTaXplLCBwb3MgLSBtaW5Qb3MpO1xuICAgICAgICBvcC53aW4uZXhwYW5kTGVmdChleHBhbmRMZW5ndGgsIHJlYWRVbnRpbEZvdW5kQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRDZW50cmFsRGlyZWN0b3J5KCkge1xuICAgICAgICBjb25zdCB0b3RhbFJlYWRMZW5ndGggPSBNYXRoLm1pbihjb25zdHMuRU5ESERSICsgY29uc3RzLk1BWEZJTEVDT01NRU5ULCBmaWxlU2l6ZSk7XG4gICAgICAgIG9wID0ge1xuICAgICAgICAgICAgd2luOiBuZXcgRmlsZVdpbmRvd0J1ZmZlcihmZCksXG4gICAgICAgICAgICB0b3RhbFJlYWRMZW5ndGgsXG4gICAgICAgICAgICBtaW5Qb3M6IGZpbGVTaXplIC0gdG90YWxSZWFkTGVuZ3RoLFxuICAgICAgICAgICAgbGFzdFBvczogZmlsZVNpemUsXG4gICAgICAgICAgICBjaHVua1NpemU6IE1hdGgubWluKDEwMjQsIGNodW5rU2l6ZSksXG4gICAgICAgICAgICBmaXJzdEJ5dGU6IGNvbnN0cy5FTkRTSUdGSVJTVCxcbiAgICAgICAgICAgIHNpZzogY29uc3RzLkVORFNJRyxcbiAgICAgICAgICAgIGNvbXBsZXRlOiByZWFkQ2VudHJhbERpcmVjdG9yeUNvbXBsZXRlLFxuICAgICAgICB9O1xuICAgICAgICBvcC53aW4ucmVhZChmaWxlU2l6ZSAtIG9wLmNodW5rU2l6ZSwgb3AuY2h1bmtTaXplLCByZWFkVW50aWxGb3VuZENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkQ2VudHJhbERpcmVjdG9yeUNvbXBsZXRlKCkge1xuICAgICAgICBjb25zdCBidWZmZXIgPSBvcC53aW4uYnVmZmVyO1xuICAgICAgICBjb25zdCBwb3MgPSBvcC5sYXN0QnVmZmVyUG9zaXRpb247XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5ID0gbmV3IENlbnRyYWxEaXJlY3RvcnlIZWFkZXIoKTtcbiAgICAgICAgICAgIGNlbnRyYWxEaXJlY3RvcnkucmVhZChidWZmZXIuc2xpY2UocG9zLCBwb3MgKyBjb25zdHMuRU5ESERSKSk7XG4gICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5LmhlYWRlck9mZnNldCA9IG9wLndpbi5wb3NpdGlvbiArIHBvcztcbiAgICAgICAgICAgIGlmIChjZW50cmFsRGlyZWN0b3J5LmNvbW1lbnRMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmNvbW1lbnQgPSBidWZmZXJcbiAgICAgICAgICAgICAgICAgICAgLnNsaWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zICsgY29uc3RzLkVOREhEUixcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyArIGNvbnN0cy5FTkRIRFIgKyBjZW50cmFsRGlyZWN0b3J5LmNvbW1lbnRMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jb21tZW50ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuZW50cmllc0NvdW50ID0gY2VudHJhbERpcmVjdG9yeS52b2x1bWVFbnRyaWVzO1xuICAgICAgICAgICAgdGhhdC5jZW50cmFsRGlyZWN0b3J5ID0gY2VudHJhbERpcmVjdG9yeTtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAoY2VudHJhbERpcmVjdG9yeS52b2x1bWVFbnRyaWVzID09PSBjb25zdHMuRUZfWklQNjRfT1JfMTYgJiZcbiAgICAgICAgICAgICAgICAgICAgY2VudHJhbERpcmVjdG9yeS50b3RhbEVudHJpZXMgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8xNikgfHxcbiAgICAgICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5LnNpemUgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMiB8fFxuICAgICAgICAgICAgICAgIGNlbnRyYWxEaXJlY3Rvcnkub2Zmc2V0ID09PSBjb25zdHMuRUZfWklQNjRfT1JfMzJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlMb2NhdG9yKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wID0ge307XG4gICAgICAgICAgICAgICAgcmVhZEVudHJpZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGF0LmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlMb2NhdG9yKCkge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBjb25zdHMuRU5ETDY0SERSO1xuICAgICAgICBpZiAob3AubGFzdEJ1ZmZlclBvc2l0aW9uID4gbGVuZ3RoKSB7XG4gICAgICAgICAgICBvcC5sYXN0QnVmZmVyUG9zaXRpb24gLT0gbGVuZ3RoO1xuICAgICAgICAgICAgcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUxvY2F0b3JDb21wbGV0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3AgPSB7XG4gICAgICAgICAgICAgICAgd2luOiBvcC53aW4sXG4gICAgICAgICAgICAgICAgdG90YWxSZWFkTGVuZ3RoOiBsZW5ndGgsXG4gICAgICAgICAgICAgICAgbWluUG9zOiBvcC53aW4ucG9zaXRpb24gLSBsZW5ndGgsXG4gICAgICAgICAgICAgICAgbGFzdFBvczogb3Aud2luLnBvc2l0aW9uLFxuICAgICAgICAgICAgICAgIGNodW5rU2l6ZTogb3AuY2h1bmtTaXplLFxuICAgICAgICAgICAgICAgIGZpcnN0Qnl0ZTogY29uc3RzLkVOREw2NFNJR0ZJUlNULFxuICAgICAgICAgICAgICAgIHNpZzogY29uc3RzLkVOREw2NFNJRyxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUxvY2F0b3JDb21wbGV0ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBvcC53aW4ucmVhZChvcC5sYXN0UG9zIC0gb3AuY2h1bmtTaXplLCBvcC5jaHVua1NpemUsIHJlYWRVbnRpbEZvdW5kQ2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUxvY2F0b3JDb21wbGV0ZSgpIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gb3Aud2luLmJ1ZmZlcjtcbiAgICAgICAgY29uc3QgbG9jSGVhZGVyID0gbmV3IENlbnRyYWxEaXJlY3RvcnlMb2M2NEhlYWRlcigpO1xuICAgICAgICBsb2NIZWFkZXIucmVhZChcbiAgICAgICAgICAgIGJ1ZmZlci5zbGljZShvcC5sYXN0QnVmZmVyUG9zaXRpb24sIG9wLmxhc3RCdWZmZXJQb3NpdGlvbiArIGNvbnN0cy5FTkRMNjRIRFIpXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHJlYWRMZW5ndGggPSBmaWxlU2l6ZSAtIGxvY0hlYWRlci5oZWFkZXJPZmZzZXQ7XG4gICAgICAgIG9wID0ge1xuICAgICAgICAgICAgd2luOiBvcC53aW4sXG4gICAgICAgICAgICB0b3RhbFJlYWRMZW5ndGg6IHJlYWRMZW5ndGgsXG4gICAgICAgICAgICBtaW5Qb3M6IGxvY0hlYWRlci5oZWFkZXJPZmZzZXQsXG4gICAgICAgICAgICBsYXN0UG9zOiBvcC5sYXN0UG9zLFxuICAgICAgICAgICAgY2h1bmtTaXplOiBvcC5jaHVua1NpemUsXG4gICAgICAgICAgICBmaXJzdEJ5dGU6IGNvbnN0cy5FTkQ2NFNJR0ZJUlNULFxuICAgICAgICAgICAgc2lnOiBjb25zdHMuRU5ENjRTSUcsXG4gICAgICAgICAgICBjb21wbGV0ZTogcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUNvbXBsZXRlLFxuICAgICAgICB9O1xuICAgICAgICBvcC53aW4ucmVhZChmaWxlU2l6ZSAtIG9wLmNodW5rU2l6ZSwgb3AuY2h1bmtTaXplLCByZWFkVW50aWxGb3VuZENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkWmlwNjRDZW50cmFsRGlyZWN0b3J5Q29tcGxldGUoKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IG9wLndpbi5idWZmZXI7XG4gICAgICAgIGNvbnN0IHppcDY0Y2QgPSBuZXcgQ2VudHJhbERpcmVjdG9yeVppcDY0SGVhZGVyKCk7XG4gICAgICAgIHppcDY0Y2QucmVhZChidWZmZXIuc2xpY2Uob3AubGFzdEJ1ZmZlclBvc2l0aW9uLCBvcC5sYXN0QnVmZmVyUG9zaXRpb24gKyBjb25zdHMuRU5ENjRIRFIpKTtcbiAgICAgICAgdGhhdC5jZW50cmFsRGlyZWN0b3J5LnZvbHVtZUVudHJpZXMgPSB6aXA2NGNkLnZvbHVtZUVudHJpZXM7XG4gICAgICAgIHRoYXQuY2VudHJhbERpcmVjdG9yeS50b3RhbEVudHJpZXMgPSB6aXA2NGNkLnRvdGFsRW50cmllcztcbiAgICAgICAgdGhhdC5jZW50cmFsRGlyZWN0b3J5LnNpemUgPSB6aXA2NGNkLnNpemU7XG4gICAgICAgIHRoYXQuY2VudHJhbERpcmVjdG9yeS5vZmZzZXQgPSB6aXA2NGNkLm9mZnNldDtcbiAgICAgICAgdGhhdC5lbnRyaWVzQ291bnQgPSB6aXA2NGNkLnZvbHVtZUVudHJpZXM7XG4gICAgICAgIG9wID0ge307XG4gICAgICAgIHJlYWRFbnRyaWVzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZEVudHJpZXMoKSB7XG4gICAgICAgIG9wID0ge1xuICAgICAgICAgICAgd2luOiBuZXcgRmlsZVdpbmRvd0J1ZmZlcihmZCksXG4gICAgICAgICAgICBwb3M6IGNlbnRyYWxEaXJlY3Rvcnkub2Zmc2V0LFxuICAgICAgICAgICAgY2h1bmtTaXplLFxuICAgICAgICAgICAgZW50cmllc0xlZnQ6IGNlbnRyYWxEaXJlY3Rvcnkudm9sdW1lRW50cmllcyxcbiAgICAgICAgfTtcbiAgICAgICAgb3Aud2luLnJlYWQob3AucG9zLCBNYXRoLm1pbihjaHVua1NpemUsIGZpbGVTaXplIC0gb3AucG9zKSwgcmVhZEVudHJpZXNDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZEVudHJpZXNDYWxsYmFjayhlcnIsIGJ5dGVzUmVhZCkge1xuICAgICAgICBpZiAoZXJyIHx8ICFieXRlc1JlYWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmVtaXQoJ2Vycm9yJywgZXJyIHx8IG5ldyBFcnJvcignRW50cmllcyByZWFkIGVycm9yJykpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBidWZmZXJQb3MgPSBvcC5wb3MgLSBvcC53aW4ucG9zaXRpb247XG4gICAgICAgIGxldCBlbnRyeSA9IG9wLmVudHJ5O1xuICAgICAgICBjb25zdCBidWZmZXIgPSBvcC53aW4uYnVmZmVyO1xuICAgICAgICBjb25zdCBidWZmZXJMZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgd2hpbGUgKG9wLmVudHJpZXNMZWZ0ID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghZW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cnkgPSBuZXcgWmlwRW50cnkoKTtcbiAgICAgICAgICAgICAgICAgICAgZW50cnkucmVhZEhlYWRlcihidWZmZXIsIGJ1ZmZlclBvcyk7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5LmhlYWRlck9mZnNldCA9IG9wLndpbi5wb3NpdGlvbiArIGJ1ZmZlclBvcztcbiAgICAgICAgICAgICAgICAgICAgb3AuZW50cnkgPSBlbnRyeTtcbiAgICAgICAgICAgICAgICAgICAgb3AucG9zICs9IGNvbnN0cy5DRU5IRFI7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlclBvcyArPSBjb25zdHMuQ0VOSERSO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBlbnRyeUhlYWRlclNpemUgPSBlbnRyeS5mbmFtZUxlbiArIGVudHJ5LmV4dHJhTGVuICsgZW50cnkuY29tTGVuO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFkdmFuY2VCeXRlcyA9IGVudHJ5SGVhZGVyU2l6ZSArIChvcC5lbnRyaWVzTGVmdCA+IDEgPyBjb25zdHMuQ0VOSERSIDogMCk7XG4gICAgICAgICAgICAgICAgaWYgKGJ1ZmZlckxlbmd0aCAtIGJ1ZmZlclBvcyA8IGFkdmFuY2VCeXRlcykge1xuICAgICAgICAgICAgICAgICAgICBvcC53aW4ubW92ZVJpZ2h0KGNodW5rU2l6ZSwgcmVhZEVudHJpZXNDYWxsYmFjaywgYnVmZmVyUG9zKTtcbiAgICAgICAgICAgICAgICAgICAgb3AubW92ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZW50cnkucmVhZChidWZmZXIsIGJ1ZmZlclBvcywgdGV4dERlY29kZXIpO1xuICAgICAgICAgICAgICAgIGlmICghY29uZmlnLnNraXBFbnRyeU5hbWVWYWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5LnZhbGlkYXRlTmFtZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZW50cmllcykge1xuICAgICAgICAgICAgICAgICAgICBlbnRyaWVzW2VudHJ5Lm5hbWVdID0gZW50cnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoYXQuZW1pdCgnZW50cnknLCBlbnRyeSk7XG4gICAgICAgICAgICAgICAgb3AuZW50cnkgPSBlbnRyeSA9IG51bGw7XG4gICAgICAgICAgICAgICAgb3AuZW50cmllc0xlZnQtLTtcbiAgICAgICAgICAgICAgICBvcC5wb3MgKz0gZW50cnlIZWFkZXJTaXplO1xuICAgICAgICAgICAgICAgIGJ1ZmZlclBvcyArPSBlbnRyeUhlYWRlclNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGF0LmVtaXQoJ3JlYWR5Jyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhhdC5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja0VudHJpZXNFeGlzdCgpIHtcbiAgICAgICAgaWYgKCFlbnRyaWVzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0b3JlRW50cmllcyBkaXNhYmxlZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdyZWFkeScsIHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlYWR5O1xuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5lbnRyeSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGNoZWNrRW50cmllc0V4aXN0KCk7XG4gICAgICAgIHJldHVybiBlbnRyaWVzW25hbWVdO1xuICAgIH07XG5cbiAgICB0aGlzLmVudHJpZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoZWNrRW50cmllc0V4aXN0KCk7XG4gICAgICAgIHJldHVybiBlbnRyaWVzO1xuICAgIH07XG5cbiAgICB0aGlzLnN0cmVhbSA9IGZ1bmN0aW9uIChlbnRyeSwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3BlbkVudHJ5KFxuICAgICAgICAgICAgZW50cnksXG4gICAgICAgICAgICAoZXJyLCBlbnRyeSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IGRhdGFPZmZzZXQoZW50cnkpO1xuICAgICAgICAgICAgICAgIGxldCBlbnRyeVN0cmVhbSA9IG5ldyBFbnRyeURhdGFSZWFkZXJTdHJlYW0oZmQsIG9mZnNldCwgZW50cnkuY29tcHJlc3NlZFNpemUpO1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5tZXRob2QgPT09IGNvbnN0cy5TVE9SRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZyB0byBkb1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkubWV0aG9kID09PSBjb25zdHMuREVGTEFURUQpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cnlTdHJlYW0gPSBlbnRyeVN0cmVhbS5waXBlKHpsaWIuY3JlYXRlSW5mbGF0ZVJhdygpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdVbmtub3duIGNvbXByZXNzaW9uIG1ldGhvZDogJyArIGVudHJ5Lm1ldGhvZCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2FuVmVyaWZ5Q3JjKGVudHJ5KSkge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeVN0cmVhbSA9IGVudHJ5U3RyZWFtLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRW50cnlWZXJpZnlTdHJlYW0oZW50cnlTdHJlYW0sIGVudHJ5LmNyYywgZW50cnkuc2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZW50cnlTdHJlYW0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHRoaXMuZW50cnlEYXRhU3luYyA9IGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICBsZXQgZXJyID0gbnVsbDtcbiAgICAgICAgdGhpcy5vcGVuRW50cnkoXG4gICAgICAgICAgICBlbnRyeSxcbiAgICAgICAgICAgIChlLCBlbikgPT4ge1xuICAgICAgICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgICAgICAgICAgZW50cnkgPSBlbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YSA9IEJ1ZmZlci5hbGxvYyhlbnRyeS5jb21wcmVzc2VkU2l6ZSk7XG4gICAgICAgIG5ldyBGc1JlYWQoZmQsIGRhdGEsIDAsIGVudHJ5LmNvbXByZXNzZWRTaXplLCBkYXRhT2Zmc2V0KGVudHJ5KSwgKGUpID0+IHtcbiAgICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgIH0pLnJlYWQodHJ1ZSk7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW50cnkubWV0aG9kID09PSBjb25zdHMuU1RPUkVEKSB7XG4gICAgICAgICAgICAvLyBub3RoaW5nIHRvIGRvXG4gICAgICAgIH0gZWxzZSBpZiAoZW50cnkubWV0aG9kID09PSBjb25zdHMuREVGTEFURUQgfHwgZW50cnkubWV0aG9kID09PSBjb25zdHMuRU5IQU5DRURfREVGTEFURUQpIHtcbiAgICAgICAgICAgIGRhdGEgPSB6bGliLmluZmxhdGVSYXdTeW5jKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGNvbXByZXNzaW9uIG1ldGhvZDogJyArIGVudHJ5Lm1ldGhvZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoICE9PSBlbnRyeS5zaXplKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2l6ZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYW5WZXJpZnlDcmMoZW50cnkpKSB7XG4gICAgICAgICAgICBjb25zdCB2ZXJpZnkgPSBuZXcgQ3JjVmVyaWZ5KGVudHJ5LmNyYywgZW50cnkuc2l6ZSk7XG4gICAgICAgICAgICB2ZXJpZnkuZGF0YShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9O1xuXG4gICAgdGhpcy5vcGVuRW50cnkgPSBmdW5jdGlvbiAoZW50cnksIGNhbGxiYWNrLCBzeW5jKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZW50cnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjaGVja0VudHJpZXNFeGlzdCgpO1xuICAgICAgICAgICAgZW50cnkgPSBlbnRyaWVzW2VudHJ5XTtcbiAgICAgICAgICAgIGlmICghZW50cnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdFbnRyeSBub3QgZm91bmQnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbnRyeS5pc0ZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ0VudHJ5IGlzIG5vdCBmaWxlJykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZmQpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ0FyY2hpdmUgY2xvc2VkJykpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhjb25zdHMuTE9DSERSKTtcbiAgICAgICAgbmV3IEZzUmVhZChmZCwgYnVmZmVyLCAwLCBidWZmZXIubGVuZ3RoLCBlbnRyeS5vZmZzZXQsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCByZWFkRXg7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGVudHJ5LnJlYWREYXRhSGVhZGVyKGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LmVuY3J5cHRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZWFkRXggPSBuZXcgRXJyb3IoJ0VudHJ5IGVuY3J5cHRlZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgcmVhZEV4ID0gZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjayhyZWFkRXgsIGVudHJ5KTtcbiAgICAgICAgfSkucmVhZChzeW5jKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZGF0YU9mZnNldChlbnRyeSkge1xuICAgICAgICByZXR1cm4gZW50cnkub2Zmc2V0ICsgY29uc3RzLkxPQ0hEUiArIGVudHJ5LmZuYW1lTGVuICsgZW50cnkuZXh0cmFMZW47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuVmVyaWZ5Q3JjKGVudHJ5KSB7XG4gICAgICAgIC8vIGlmIGJpdCAzICgweDA4KSBvZiB0aGUgZ2VuZXJhbC1wdXJwb3NlIGZsYWdzIGZpZWxkIGlzIHNldCwgdGhlbiB0aGUgQ1JDLTMyIGFuZCBmaWxlIHNpemVzIGFyZSBub3Qga25vd24gd2hlbiB0aGUgaGVhZGVyIGlzIHdyaXR0ZW5cbiAgICAgICAgcmV0dXJuIChlbnRyeS5mbGFncyAmIDB4OCkgIT09IDB4ODtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRyYWN0KGVudHJ5LCBvdXRQYXRoLCBjYWxsYmFjaykge1xuICAgICAgICB0aGF0LnN0cmVhbShlbnRyeSwgKGVyciwgc3RtKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGZzU3RtLCBlcnJUaHJvd247XG4gICAgICAgICAgICAgICAgc3RtLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyVGhyb3duID0gZXJyO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZnNTdG0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0bS51bnBpcGUoZnNTdG0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnNTdG0uY2xvc2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZzLm9wZW4ob3V0UGF0aCwgJ3cnLCAoZXJyLCBmZEZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyclRocm93bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnMuY2xvc2UoZmQsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnJUaHJvd24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZnNTdG0gPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShvdXRQYXRoLCB7IGZkOiBmZEZpbGUgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZzU3RtLm9uKCdmaW5pc2gnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmVtaXQoJ2V4dHJhY3QnLCBlbnRyeSwgb3V0UGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVyclRocm93bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdG0ucGlwZShmc1N0bSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZURpcmVjdG9yaWVzKGJhc2VEaXIsIGRpcnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghZGlycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkaXIgPSBkaXJzLnNoaWZ0KCk7XG4gICAgICAgIGRpciA9IHBhdGguam9pbihiYXNlRGlyLCBwYXRoLmpvaW4oLi4uZGlyKSk7XG4gICAgICAgIGZzLm1rZGlyKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVyciAmJiBlcnIuY29kZSAhPT0gJ0VFWElTVCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNyZWF0ZURpcmVjdG9yaWVzKGJhc2VEaXIsIGRpcnMsIGNhbGxiYWNrKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0cmFjdEZpbGVzKGJhc2VEaXIsIGJhc2VSZWxQYXRoLCBmaWxlcywgY2FsbGJhY2ssIGV4dHJhY3RlZENvdW50KSB7XG4gICAgICAgIGlmICghZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgZXh0cmFjdGVkQ291bnQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpbGUgPSBmaWxlcy5zaGlmdCgpO1xuICAgICAgICBjb25zdCB0YXJnZXRQYXRoID0gcGF0aC5qb2luKGJhc2VEaXIsIGZpbGUubmFtZS5yZXBsYWNlKGJhc2VSZWxQYXRoLCAnJykpO1xuICAgICAgICBleHRyYWN0KGZpbGUsIHRhcmdldFBhdGgsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCBleHRyYWN0ZWRDb3VudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBleHRyYWN0RmlsZXMoYmFzZURpciwgYmFzZVJlbFBhdGgsIGZpbGVzLCBjYWxsYmFjaywgZXh0cmFjdGVkQ291bnQgKyAxKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5leHRyYWN0ID0gZnVuY3Rpb24gKGVudHJ5LCBvdXRQYXRoLCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgZW50cnlOYW1lID0gZW50cnkgfHwgJyc7XG4gICAgICAgIGlmICh0eXBlb2YgZW50cnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBlbnRyeSA9IHRoaXMuZW50cnkoZW50cnkpO1xuICAgICAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgZW50cnlOYW1lID0gZW50cnkubmFtZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5TmFtZS5sZW5ndGggJiYgZW50cnlOYW1lW2VudHJ5TmFtZS5sZW5ndGggLSAxXSAhPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5TmFtZSArPSAnLyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghZW50cnkgfHwgZW50cnkuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzID0gW10sXG4gICAgICAgICAgICAgICAgZGlycyA9IFtdLFxuICAgICAgICAgICAgICAgIGFsbERpcnMgPSB7fTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZSBpbiBlbnRyaWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZW50cmllcywgZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgZS5sYXN0SW5kZXhPZihlbnRyeU5hbWUsIDApID09PSAwXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZWxQYXRoID0gZS5yZXBsYWNlKGVudHJ5TmFtZSwgJycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEVudHJ5ID0gZW50cmllc1tlXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkRW50cnkuaXNGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGNoaWxkRW50cnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVsUGF0aCA9IHBhdGguZGlybmFtZShyZWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVsUGF0aCAmJiAhYWxsRGlyc1tyZWxQYXRoXSAmJiByZWxQYXRoICE9PSAnLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbERpcnNbcmVsUGF0aF0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnRzID0gcmVsUGF0aC5zcGxpdCgnLycpLmZpbHRlcigoZikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlycy5wdXNoKHBhcnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHMgPSBwYXJ0cy5zbGljZSgwLCBwYXJ0cy5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0c1BhdGggPSBwYXJ0cy5qb2luKCcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbERpcnNbcGFydHNQYXRoXSB8fCBwYXJ0c1BhdGggPT09ICcuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsRGlyc1twYXJ0c1BhdGhdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJzLnB1c2gocGFydHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlycy5zb3J0KCh4LCB5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHgubGVuZ3RoIC0geS5sZW5ndGg7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChkaXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZURpcmVjdG9yaWVzKG91dFBhdGgsIGRpcnMsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3RGaWxlcyhvdXRQYXRoLCBlbnRyeU5hbWUsIGZpbGVzLCBjYWxsYmFjaywgMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXh0cmFjdEZpbGVzKG91dFBhdGgsIGVudHJ5TmFtZSwgZmlsZXMsIGNhbGxiYWNrLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZzLnN0YXQob3V0UGF0aCwgKGVyciwgc3RhdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ICYmIHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICBleHRyYWN0KGVudHJ5LCBwYXRoLmpvaW4ob3V0UGF0aCwgcGF0aC5iYXNlbmFtZShlbnRyeS5uYW1lKSksIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBleHRyYWN0KGVudHJ5LCBvdXRQYXRoLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5jbG9zZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICBpZiAoY2xvc2VkIHx8ICFmZCkge1xuICAgICAgICAgICAgY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbG9zZWQgPSB0cnVlO1xuICAgICAgICAgICAgZnMuY2xvc2UoZmQsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBmZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb3JpZ2luYWxFbWl0ID0gZXZlbnRzLkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdDtcbiAgICB0aGlzLmVtaXQgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpZiAoIWNsb3NlZCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsRW1pdC5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cblN0cmVhbVppcC5zZXRGcyA9IGZ1bmN0aW9uIChjdXN0b21Gcykge1xuICAgIGZzID0gY3VzdG9tRnM7XG59O1xuXG5TdHJlYW1aaXAuZGVidWdMb2cgPSAoLi4uYXJncykgPT4ge1xuICAgIGlmIChTdHJlYW1aaXAuZGVidWcpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5sb2coLi4uYXJncyk7XG4gICAgfVxufTtcblxudXRpbC5pbmhlcml0cyhTdHJlYW1aaXAsIGV2ZW50cy5FdmVudEVtaXR0ZXIpO1xuXG5jb25zdCBwcm9wWmlwID0gU3ltYm9sKCd6aXAnKTtcblxuU3RyZWFtWmlwLmFzeW5jID0gY2xhc3MgU3RyZWFtWmlwQXN5bmMgZXh0ZW5kcyBldmVudHMuRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBjb25zdCB6aXAgPSBuZXcgU3RyZWFtWmlwKGNvbmZpZyk7XG5cbiAgICAgICAgemlwLm9uKCdlbnRyeScsIChlbnRyeSkgPT4gdGhpcy5lbWl0KCdlbnRyeScsIGVudHJ5KSk7XG4gICAgICAgIHppcC5vbignZXh0cmFjdCcsIChlbnRyeSwgb3V0UGF0aCkgPT4gdGhpcy5lbWl0KCdleHRyYWN0JywgZW50cnksIG91dFBhdGgpKTtcblxuICAgICAgICB0aGlzW3Byb3BaaXBdID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemlwLm9uKCdyZWFkeScsICgpID0+IHtcbiAgICAgICAgICAgICAgICB6aXAucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHppcCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHppcC5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgZW50cmllc0NvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpc1twcm9wWmlwXS50aGVuKCh6aXApID0+IHppcC5lbnRyaWVzQ291bnQpO1xuICAgIH1cblxuICAgIGdldCBjb21tZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpc1twcm9wWmlwXS50aGVuKCh6aXApID0+IHppcC5jb21tZW50KTtcbiAgICB9XG5cbiAgICBhc3luYyBlbnRyeShuYW1lKSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiB6aXAuZW50cnkobmFtZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZW50cmllcygpIHtcbiAgICAgICAgY29uc3QgemlwID0gYXdhaXQgdGhpc1twcm9wWmlwXTtcbiAgICAgICAgcmV0dXJuIHppcC5lbnRyaWVzKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgc3RyZWFtKGVudHJ5KSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6aXAuc3RyZWFtKGVudHJ5LCAoZXJyLCBzdG0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZW50cnlEYXRhKGVudHJ5KSB7XG4gICAgICAgIGNvbnN0IHN0bSA9IGF3YWl0IHRoaXMuc3RyZWFtKGVudHJ5KTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBbXTtcbiAgICAgICAgICAgIHN0bS5vbignZGF0YScsIChjaHVuaykgPT4gZGF0YS5wdXNoKGNodW5rKSk7XG4gICAgICAgICAgICBzdG0ub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKEJ1ZmZlci5jb25jYXQoZGF0YSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdG0ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHN0bS5yZW1vdmVBbGxMaXN0ZW5lcnMoJ2VuZCcpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGV4dHJhY3QoZW50cnksIG91dFBhdGgpIHtcbiAgICAgICAgY29uc3QgemlwID0gYXdhaXQgdGhpc1twcm9wWmlwXTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHppcC5leHRyYWN0KGVudHJ5LCBvdXRQYXRoLCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgY2xvc2UoKSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6aXAuY2xvc2UoKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5jbGFzcyBDZW50cmFsRGlyZWN0b3J5SGVhZGVyIHtcbiAgICByZWFkKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoICE9PSBjb25zdHMuRU5ESERSIHx8IGRhdGEucmVhZFVJbnQzMkxFKDApICE9PSBjb25zdHMuRU5EU0lHKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY2VudHJhbCBkaXJlY3RvcnknKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBudW1iZXIgb2YgZW50cmllcyBvbiB0aGlzIHZvbHVtZVxuICAgICAgICB0aGlzLnZvbHVtZUVudHJpZXMgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuRU5EU1VCKTtcbiAgICAgICAgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXNcbiAgICAgICAgdGhpcy50b3RhbEVudHJpZXMgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuRU5EVE9UKTtcbiAgICAgICAgLy8gY2VudHJhbCBkaXJlY3Rvcnkgc2l6ZSBpbiBieXRlc1xuICAgICAgICB0aGlzLnNpemUgPSBkYXRhLnJlYWRVSW50MzJMRShjb25zdHMuRU5EU0laKTtcbiAgICAgICAgLy8gb2Zmc2V0IG9mIGZpcnN0IENFTiBoZWFkZXJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBkYXRhLnJlYWRVSW50MzJMRShjb25zdHMuRU5ET0ZGKTtcbiAgICAgICAgLy8gemlwIGZpbGUgY29tbWVudCBsZW5ndGhcbiAgICAgICAgdGhpcy5jb21tZW50TGVuZ3RoID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkVORENPTSk7XG4gICAgfVxufVxuXG5jbGFzcyBDZW50cmFsRGlyZWN0b3J5TG9jNjRIZWFkZXIge1xuICAgIHJlYWQoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5sZW5ndGggIT09IGNvbnN0cy5FTkRMNjRIRFIgfHwgZGF0YS5yZWFkVUludDMyTEUoMCkgIT09IGNvbnN0cy5FTkRMNjRTSUcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB6aXA2NCBjZW50cmFsIGRpcmVjdG9yeSBsb2NhdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gWklQNjQgRU9DRCBoZWFkZXIgb2Zmc2V0XG4gICAgICAgIHRoaXMuaGVhZGVyT2Zmc2V0ID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkRTVUIpO1xuICAgIH1cbn1cblxuY2xhc3MgQ2VudHJhbERpcmVjdG9yeVppcDY0SGVhZGVyIHtcbiAgICByZWFkKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoICE9PSBjb25zdHMuRU5ENjRIRFIgfHwgZGF0YS5yZWFkVUludDMyTEUoMCkgIT09IGNvbnN0cy5FTkQ2NFNJRykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNlbnRyYWwgZGlyZWN0b3J5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbnVtYmVyIG9mIGVudHJpZXMgb24gdGhpcyB2b2x1bWVcbiAgICAgICAgdGhpcy52b2x1bWVFbnRyaWVzID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkQ2NFNVQik7XG4gICAgICAgIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzXG4gICAgICAgIHRoaXMudG90YWxFbnRyaWVzID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkQ2NFRPVCk7XG4gICAgICAgIC8vIGNlbnRyYWwgZGlyZWN0b3J5IHNpemUgaW4gYnl0ZXNcbiAgICAgICAgdGhpcy5zaXplID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkQ2NFNJWik7XG4gICAgICAgIC8vIG9mZnNldCBvZiBmaXJzdCBDRU4gaGVhZGVyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkQ2NE9GRik7XG4gICAgfVxufVxuXG5jbGFzcyBaaXBFbnRyeSB7XG4gICAgcmVhZEhlYWRlcihkYXRhLCBvZmZzZXQpIHtcbiAgICAgICAgLy8gZGF0YSBzaG91bGQgYmUgNDYgYnl0ZXMgYW5kIHN0YXJ0IHdpdGggXCJQSyAwMSAwMlwiXG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCA8IG9mZnNldCArIGNvbnN0cy5DRU5IRFIgfHwgZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0KSAhPT0gY29uc3RzLkNFTlNJRykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGVudHJ5IGhlYWRlcicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHZlcnNpb24gbWFkZSBieVxuICAgICAgICB0aGlzLnZlck1hZGUgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOVkVNKTtcbiAgICAgICAgLy8gdmVyc2lvbiBuZWVkZWQgdG8gZXh0cmFjdFxuICAgICAgICB0aGlzLnZlcnNpb24gPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOVkVSKTtcbiAgICAgICAgLy8gZW5jcnlwdCwgZGVjcnlwdCBmbGFnc1xuICAgICAgICB0aGlzLmZsYWdzID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkZMRyk7XG4gICAgICAgIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICAgICAgICB0aGlzLm1ldGhvZCA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5IT1cpO1xuICAgICAgICAvLyBtb2RpZmljYXRpb24gdGltZSAoMiBieXRlcyB0aW1lLCAyIGJ5dGVzIGRhdGUpXG4gICAgICAgIGNvbnN0IHRpbWVieXRlcyA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5USU0pO1xuICAgICAgICBjb25zdCBkYXRlYnl0ZXMgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOVElNICsgMik7XG4gICAgICAgIHRoaXMudGltZSA9IHBhcnNlWmlwVGltZSh0aW1lYnl0ZXMsIGRhdGVieXRlcyk7XG5cbiAgICAgICAgLy8gdW5jb21wcmVzc2VkIGZpbGUgY3JjLTMyIHZhbHVlXG4gICAgICAgIHRoaXMuY3JjID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0ICsgY29uc3RzLkNFTkNSQyk7XG4gICAgICAgIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgICAgICB0aGlzLmNvbXByZXNzZWRTaXplID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0ICsgY29uc3RzLkNFTlNJWik7XG4gICAgICAgIC8vIHVuY29tcHJlc3NlZCBzaXplXG4gICAgICAgIHRoaXMuc2l6ZSA9IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCArIGNvbnN0cy5DRU5MRU4pO1xuICAgICAgICAvLyBmaWxlbmFtZSBsZW5ndGhcbiAgICAgICAgdGhpcy5mbmFtZUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5OQU0pO1xuICAgICAgICAvLyBleHRyYSBmaWVsZCBsZW5ndGhcbiAgICAgICAgdGhpcy5leHRyYUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5FWFQpO1xuICAgICAgICAvLyBmaWxlIGNvbW1lbnQgbGVuZ3RoXG4gICAgICAgIHRoaXMuY29tTGVuID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkNPTSk7XG4gICAgICAgIC8vIHZvbHVtZSBudW1iZXIgc3RhcnRcbiAgICAgICAgdGhpcy5kaXNrU3RhcnQgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VORFNLKTtcbiAgICAgICAgLy8gaW50ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXG4gICAgICAgIHRoaXMuaW5hdHRyID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkFUVCk7XG4gICAgICAgIC8vIGV4dGVybmFsIGZpbGUgYXR0cmlidXRlc1xuICAgICAgICB0aGlzLmF0dHIgPSBkYXRhLnJlYWRVSW50MzJMRShvZmZzZXQgKyBjb25zdHMuQ0VOQVRYKTtcbiAgICAgICAgLy8gTE9DIGhlYWRlciBvZmZzZXRcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBkYXRhLnJlYWRVSW50MzJMRShvZmZzZXQgKyBjb25zdHMuQ0VOT0ZGKTtcbiAgICB9XG5cbiAgICByZWFkRGF0YUhlYWRlcihkYXRhKSB7XG4gICAgICAgIC8vIDMwIGJ5dGVzIGFuZCBzaG91bGQgc3RhcnQgd2l0aCBcIlBLXFwwMDNcXDAwNFwiXG4gICAgICAgIGlmIChkYXRhLnJlYWRVSW50MzJMRSgwKSAhPT0gY29uc3RzLkxPQ1NJRykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGxvY2FsIGhlYWRlcicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ1ZFUik7XG4gICAgICAgIC8vIGdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZ1xuICAgICAgICB0aGlzLmZsYWdzID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ0ZMRyk7XG4gICAgICAgIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICAgICAgICB0aGlzLm1ldGhvZCA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NIT1cpO1xuICAgICAgICAvLyBtb2RpZmljYXRpb24gdGltZSAoMiBieXRlcyB0aW1lIDsgMiBieXRlcyBkYXRlKVxuICAgICAgICBjb25zdCB0aW1lYnl0ZXMgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuTE9DVElNKTtcbiAgICAgICAgY29uc3QgZGF0ZWJ5dGVzID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ1RJTSArIDIpO1xuICAgICAgICB0aGlzLnRpbWUgPSBwYXJzZVppcFRpbWUodGltZWJ5dGVzLCBkYXRlYnl0ZXMpO1xuXG4gICAgICAgIC8vIHVuY29tcHJlc3NlZCBmaWxlIGNyYy0zMiB2YWx1ZVxuICAgICAgICB0aGlzLmNyYyA9IGRhdGEucmVhZFVJbnQzMkxFKGNvbnN0cy5MT0NDUkMpIHx8IHRoaXMuY3JjO1xuICAgICAgICAvLyBjb21wcmVzc2VkIHNpemVcbiAgICAgICAgY29uc3QgY29tcHJlc3NlZFNpemUgPSBkYXRhLnJlYWRVSW50MzJMRShjb25zdHMuTE9DU0laKTtcbiAgICAgICAgaWYgKGNvbXByZXNzZWRTaXplICYmIGNvbXByZXNzZWRTaXplICE9PSBjb25zdHMuRUZfWklQNjRfT1JfMzIpIHtcbiAgICAgICAgICAgIHRoaXMuY29tcHJlc3NlZFNpemUgPSBjb21wcmVzc2VkU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuICAgICAgICBjb25zdCBzaXplID0gZGF0YS5yZWFkVUludDMyTEUoY29uc3RzLkxPQ0xFTik7XG4gICAgICAgIGlmIChzaXplICYmIHNpemUgIT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMikge1xuICAgICAgICAgICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBmaWxlbmFtZSBsZW5ndGhcbiAgICAgICAgdGhpcy5mbmFtZUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NOQU0pO1xuICAgICAgICAvLyBleHRyYSBmaWVsZCBsZW5ndGhcbiAgICAgICAgdGhpcy5leHRyYUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NFWFQpO1xuICAgIH1cblxuICAgIHJlYWQoZGF0YSwgb2Zmc2V0LCB0ZXh0RGVjb2Rlcikge1xuICAgICAgICBjb25zdCBuYW1lRGF0YSA9IGRhdGEuc2xpY2Uob2Zmc2V0LCAob2Zmc2V0ICs9IHRoaXMuZm5hbWVMZW4pKTtcbiAgICAgICAgdGhpcy5uYW1lID0gdGV4dERlY29kZXJcbiAgICAgICAgICAgID8gdGV4dERlY29kZXIuZGVjb2RlKG5ldyBVaW50OEFycmF5KG5hbWVEYXRhKSlcbiAgICAgICAgICAgIDogbmFtZURhdGEudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgY29uc3QgbGFzdENoYXIgPSBkYXRhW29mZnNldCAtIDFdO1xuICAgICAgICB0aGlzLmlzRGlyZWN0b3J5ID0gbGFzdENoYXIgPT09IDQ3IHx8IGxhc3RDaGFyID09PSA5MjtcblxuICAgICAgICBpZiAodGhpcy5leHRyYUxlbikge1xuICAgICAgICAgICAgdGhpcy5yZWFkRXh0cmEoZGF0YSwgb2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSB0aGlzLmV4dHJhTGVuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29tbWVudCA9IHRoaXMuY29tTGVuID8gZGF0YS5zbGljZShvZmZzZXQsIG9mZnNldCArIHRoaXMuY29tTGVuKS50b1N0cmluZygpIDogbnVsbDtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZU5hbWUoKSB7XG4gICAgICAgIGlmICgvXFxcXHxeXFx3Kzp8XlxcL3woXnxcXC8pXFwuXFwuKFxcL3wkKS8udGVzdCh0aGlzLm5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01hbGljaW91cyBlbnRyeTogJyArIHRoaXMubmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkRXh0cmEoZGF0YSwgb2Zmc2V0KSB7XG4gICAgICAgIGxldCBzaWduYXR1cmUsIHNpemU7XG4gICAgICAgIGNvbnN0IG1heFBvcyA9IG9mZnNldCArIHRoaXMuZXh0cmFMZW47XG4gICAgICAgIHdoaWxlIChvZmZzZXQgPCBtYXhQb3MpIHtcbiAgICAgICAgICAgIHNpZ25hdHVyZSA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gMjtcbiAgICAgICAgICAgIHNpemUgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICAgICAgICBpZiAoY29uc3RzLklEX1pJUDY0ID09PSBzaWduYXR1cmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlWmlwNjRFeHRyYShkYXRhLCBvZmZzZXQsIHNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ICs9IHNpemU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwYXJzZVppcDY0RXh0cmEoZGF0YSwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgICAgICAgaWYgKGxlbmd0aCA+PSA4ICYmIHRoaXMuc2l6ZSA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzMyKSB7XG4gICAgICAgICAgICB0aGlzLnNpemUgPSByZWFkVUludDY0TEUoZGF0YSwgb2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSA4O1xuICAgICAgICAgICAgbGVuZ3RoIC09IDg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA+PSA4ICYmIHRoaXMuY29tcHJlc3NlZFNpemUgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMikge1xuICAgICAgICAgICAgdGhpcy5jb21wcmVzc2VkU2l6ZSA9IHJlYWRVSW50NjRMRShkYXRhLCBvZmZzZXQpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDg7XG4gICAgICAgICAgICBsZW5ndGggLT0gODtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoID49IDggJiYgdGhpcy5vZmZzZXQgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMikge1xuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSByZWFkVUludDY0TEUoZGF0YSwgb2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSA4O1xuICAgICAgICAgICAgbGVuZ3RoIC09IDg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA+PSA0ICYmIHRoaXMuZGlza1N0YXJ0ID09PSBjb25zdHMuRUZfWklQNjRfT1JfMTYpIHtcbiAgICAgICAgICAgIHRoaXMuZGlza1N0YXJ0ID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0KTtcbiAgICAgICAgICAgIC8vIG9mZnNldCArPSA0OyBsZW5ndGggLT0gNDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBlbmNyeXB0ZWQoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5mbGFncyAmIGNvbnN0cy5GTEdfRU5UUllfRU5DKSA9PT0gY29uc3RzLkZMR19FTlRSWV9FTkM7XG4gICAgfVxuXG4gICAgZ2V0IGlzRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzRGlyZWN0b3J5O1xuICAgIH1cbn1cblxuY2xhc3MgRnNSZWFkIHtcbiAgICBjb25zdHJ1Y3RvcihmZCwgYnVmZmVyLCBvZmZzZXQsIGxlbmd0aCwgcG9zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuZmQgPSBmZDtcbiAgICAgICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuYnl0ZXNSZWFkID0gMDtcbiAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmVhZChzeW5jKSB7XG4gICAgICAgIFN0cmVhbVppcC5kZWJ1Z0xvZygncmVhZCcsIHRoaXMucG9zaXRpb24sIHRoaXMuYnl0ZXNSZWFkLCB0aGlzLmxlbmd0aCwgdGhpcy5vZmZzZXQpO1xuICAgICAgICB0aGlzLndhaXRpbmcgPSB0cnVlO1xuICAgICAgICBsZXQgZXJyO1xuICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgbGV0IGJ5dGVzUmVhZCA9IDA7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGJ5dGVzUmVhZCA9IGZzLnJlYWRTeW5jKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZkLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXQgKyB0aGlzLmJ5dGVzUmVhZCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZW5ndGggLSB0aGlzLmJ5dGVzUmVhZCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArIHRoaXMuYnl0ZXNSZWFkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBlcnIgPSBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yZWFkQ2FsbGJhY2soc3luYywgZXJyLCBlcnIgPyBieXRlc1JlYWQgOiBudWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZzLnJlYWQoXG4gICAgICAgICAgICAgICAgdGhpcy5mZCxcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcixcbiAgICAgICAgICAgICAgICB0aGlzLm9mZnNldCArIHRoaXMuYnl0ZXNSZWFkLFxuICAgICAgICAgICAgICAgIHRoaXMubGVuZ3RoIC0gdGhpcy5ieXRlc1JlYWQsXG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArIHRoaXMuYnl0ZXNSZWFkLFxuICAgICAgICAgICAgICAgIHRoaXMucmVhZENhbGxiYWNrLmJpbmQodGhpcywgc3luYylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkQ2FsbGJhY2soc3luYywgZXJyLCBieXRlc1JlYWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBieXRlc1JlYWQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aGlzLmJ5dGVzUmVhZCArPSBieXRlc1JlYWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVyciB8fCAhYnl0ZXNSZWFkIHx8IHRoaXMuYnl0ZXNSZWFkID09PSB0aGlzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhlcnIsIHRoaXMuYnl0ZXNSZWFkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVhZChzeW5jKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgRmlsZVdpbmRvd0J1ZmZlciB7XG4gICAgY29uc3RydWN0b3IoZmQpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmFsbG9jKDApO1xuICAgICAgICB0aGlzLmZkID0gZmQ7XG4gICAgICAgIHRoaXMuZnNPcCA9IG51bGw7XG4gICAgfVxuXG4gICAgY2hlY2tPcCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZnNPcCAmJiB0aGlzLmZzT3Aud2FpdGluZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPcGVyYXRpb24gaW4gcHJvZ3Jlc3MnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlYWQocG9zLCBsZW5ndGgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY2hlY2tPcCgpO1xuICAgICAgICBpZiAodGhpcy5idWZmZXIubGVuZ3RoIDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhsZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3M7XG4gICAgICAgIHRoaXMuZnNPcCA9IG5ldyBGc1JlYWQodGhpcy5mZCwgdGhpcy5idWZmZXIsIDAsIGxlbmd0aCwgdGhpcy5wb3NpdGlvbiwgY2FsbGJhY2spLnJlYWQoKTtcbiAgICB9XG5cbiAgICBleHBhbmRMZWZ0KGxlbmd0aCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jaGVja09wKCk7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmNvbmNhdChbQnVmZmVyLmFsbG9jKGxlbmd0aCksIHRoaXMuYnVmZmVyXSk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gLT0gbGVuZ3RoO1xuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbiA8IDApIHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZnNPcCA9IG5ldyBGc1JlYWQodGhpcy5mZCwgdGhpcy5idWZmZXIsIDAsIGxlbmd0aCwgdGhpcy5wb3NpdGlvbiwgY2FsbGJhY2spLnJlYWQoKTtcbiAgICB9XG5cbiAgICBleHBhbmRSaWdodChsZW5ndGgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY2hlY2tPcCgpO1xuICAgICAgICBjb25zdCBvZmZzZXQgPSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmNvbmNhdChbdGhpcy5idWZmZXIsIEJ1ZmZlci5hbGxvYyhsZW5ndGgpXSk7XG4gICAgICAgIHRoaXMuZnNPcCA9IG5ldyBGc1JlYWQoXG4gICAgICAgICAgICB0aGlzLmZkLFxuICAgICAgICAgICAgdGhpcy5idWZmZXIsXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBsZW5ndGgsXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICsgb2Zmc2V0LFxuICAgICAgICAgICAgY2FsbGJhY2tcbiAgICAgICAgKS5yZWFkKCk7XG4gICAgfVxuXG4gICAgbW92ZVJpZ2h0KGxlbmd0aCwgY2FsbGJhY2ssIHNoaWZ0KSB7XG4gICAgICAgIHRoaXMuY2hlY2tPcCgpO1xuICAgICAgICBpZiAoc2hpZnQpIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyLmNvcHkodGhpcy5idWZmZXIsIDAsIHNoaWZ0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNoaWZ0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IHNoaWZ0O1xuICAgICAgICB0aGlzLmZzT3AgPSBuZXcgRnNSZWFkKFxuICAgICAgICAgICAgdGhpcy5mZCxcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyLFxuICAgICAgICAgICAgdGhpcy5idWZmZXIubGVuZ3RoIC0gc2hpZnQsXG4gICAgICAgICAgICBzaGlmdCxcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKyB0aGlzLmJ1ZmZlci5sZW5ndGggLSBzaGlmdCxcbiAgICAgICAgICAgIGNhbGxiYWNrXG4gICAgICAgICkucmVhZCgpO1xuICAgIH1cbn1cblxuY2xhc3MgRW50cnlEYXRhUmVhZGVyU3RyZWFtIGV4dGVuZHMgc3RyZWFtLlJlYWRhYmxlIHtcbiAgICBjb25zdHJ1Y3RvcihmZCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5mZCA9IGZkO1xuICAgICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICAgICAgdGhpcy5yZWFkQ2FsbGJhY2sgPSB0aGlzLnJlYWRDYWxsYmFjay5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIF9yZWFkKG4pIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jKE1hdGgubWluKG4sIHRoaXMubGVuZ3RoIC0gdGhpcy5wb3MpKTtcbiAgICAgICAgaWYgKGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZzLnJlYWQodGhpcy5mZCwgYnVmZmVyLCAwLCBidWZmZXIubGVuZ3RoLCB0aGlzLm9mZnNldCArIHRoaXMucG9zLCB0aGlzLnJlYWRDYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnB1c2gobnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkQ2FsbGJhY2soZXJyLCBieXRlc1JlYWQsIGJ1ZmZlcikge1xuICAgICAgICB0aGlzLnBvcyArPSBieXRlc1JlYWQ7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgdGhpcy5wdXNoKG51bGwpO1xuICAgICAgICB9IGVsc2UgaWYgKCFieXRlc1JlYWQpIHtcbiAgICAgICAgICAgIHRoaXMucHVzaChudWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChieXRlc1JlYWQgIT09IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoMCwgYnl0ZXNSZWFkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucHVzaChidWZmZXIpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBFbnRyeVZlcmlmeVN0cmVhbSBleHRlbmRzIHN0cmVhbS5UcmFuc2Zvcm0ge1xuICAgIGNvbnN0cnVjdG9yKGJhc2VTdG0sIGNyYywgc2l6ZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnZlcmlmeSA9IG5ldyBDcmNWZXJpZnkoY3JjLCBzaXplKTtcbiAgICAgICAgYmFzZVN0bS5vbignZXJyb3InLCAoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfdHJhbnNmb3JtKGRhdGEsIGVuY29kaW5nLCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgZXJyO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy52ZXJpZnkuZGF0YShkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZXJyID0gZTtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayhlcnIsIGRhdGEpO1xuICAgIH1cbn1cblxuY2xhc3MgQ3JjVmVyaWZ5IHtcbiAgICBjb25zdHJ1Y3RvcihjcmMsIHNpemUpIHtcbiAgICAgICAgdGhpcy5jcmMgPSBjcmM7XG4gICAgICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBjcmM6IH4wLFxuICAgICAgICAgICAgc2l6ZTogMCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBkYXRhKGRhdGEpIHtcbiAgICAgICAgY29uc3QgY3JjVGFibGUgPSBDcmNWZXJpZnkuZ2V0Q3JjVGFibGUoKTtcbiAgICAgICAgbGV0IGNyYyA9IHRoaXMuc3RhdGUuY3JjO1xuICAgICAgICBsZXQgb2ZmID0gMDtcbiAgICAgICAgbGV0IGxlbiA9IGRhdGEubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoLS1sZW4gPj0gMCkge1xuICAgICAgICAgICAgY3JjID0gY3JjVGFibGVbKGNyYyBeIGRhdGFbb2ZmKytdKSAmIDB4ZmZdIF4gKGNyYyA+Pj4gOCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdGF0ZS5jcmMgPSBjcmM7XG4gICAgICAgIHRoaXMuc3RhdGUuc2l6ZSArPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2l6ZSA+PSB0aGlzLnNpemUpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICAgICAgICAgIGJ1Zi53cml0ZUludDMyTEUofnRoaXMuc3RhdGUuY3JjICYgMHhmZmZmZmZmZiwgMCk7XG4gICAgICAgICAgICBjcmMgPSBidWYucmVhZFVJbnQzMkxFKDApO1xuICAgICAgICAgICAgaWYgKGNyYyAhPT0gdGhpcy5jcmMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgQ1JDJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaXplICE9PSB0aGlzLnNpemUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2l6ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldENyY1RhYmxlKCkge1xuICAgICAgICBsZXQgY3JjVGFibGUgPSBDcmNWZXJpZnkuY3JjVGFibGU7XG4gICAgICAgIGlmICghY3JjVGFibGUpIHtcbiAgICAgICAgICAgIENyY1ZlcmlmeS5jcmNUYWJsZSA9IGNyY1RhYmxlID0gW107XG4gICAgICAgICAgICBjb25zdCBiID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgICAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCAyNTY7IG4rKykge1xuICAgICAgICAgICAgICAgIGxldCBjID0gbjtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gODsgLS1rID49IDA7ICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGMgJiAxKSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IDB4ZWRiODgzMjAgXiAoYyA+Pj4gMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gYyA+Pj4gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYyA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYi53cml0ZUludDMyTEUoYywgMCk7XG4gICAgICAgICAgICAgICAgICAgIGMgPSBiLnJlYWRVSW50MzJMRSgwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JjVGFibGVbbl0gPSBjO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcmNUYWJsZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlWmlwVGltZSh0aW1lYnl0ZXMsIGRhdGVieXRlcykge1xuICAgIGNvbnN0IHRpbWViaXRzID0gdG9CaXRzKHRpbWVieXRlcywgMTYpO1xuICAgIGNvbnN0IGRhdGViaXRzID0gdG9CaXRzKGRhdGVieXRlcywgMTYpO1xuXG4gICAgY29uc3QgbXQgPSB7XG4gICAgICAgIGg6IHBhcnNlSW50KHRpbWViaXRzLnNsaWNlKDAsIDUpLmpvaW4oJycpLCAyKSxcbiAgICAgICAgbTogcGFyc2VJbnQodGltZWJpdHMuc2xpY2UoNSwgMTEpLmpvaW4oJycpLCAyKSxcbiAgICAgICAgczogcGFyc2VJbnQodGltZWJpdHMuc2xpY2UoMTEsIDE2KS5qb2luKCcnKSwgMikgKiAyLFxuICAgICAgICBZOiBwYXJzZUludChkYXRlYml0cy5zbGljZSgwLCA3KS5qb2luKCcnKSwgMikgKyAxOTgwLFxuICAgICAgICBNOiBwYXJzZUludChkYXRlYml0cy5zbGljZSg3LCAxMSkuam9pbignJyksIDIpLFxuICAgICAgICBEOiBwYXJzZUludChkYXRlYml0cy5zbGljZSgxMSwgMTYpLmpvaW4oJycpLCAyKSxcbiAgICB9O1xuICAgIGNvbnN0IGR0X3N0ciA9IFttdC5ZLCBtdC5NLCBtdC5EXS5qb2luKCctJykgKyAnICcgKyBbbXQuaCwgbXQubSwgbXQuc10uam9pbignOicpICsgJyBHTVQrMCc7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGR0X3N0cikuZ2V0VGltZSgpO1xufVxuXG5mdW5jdGlvbiB0b0JpdHMoZGVjLCBzaXplKSB7XG4gICAgbGV0IGIgPSAoZGVjID4+PiAwKS50b1N0cmluZygyKTtcbiAgICB3aGlsZSAoYi5sZW5ndGggPCBzaXplKSB7XG4gICAgICAgIGIgPSAnMCcgKyBiO1xuICAgIH1cbiAgICByZXR1cm4gYi5zcGxpdCgnJyk7XG59XG5cbmZ1bmN0aW9uIHJlYWRVSW50NjRMRShidWZmZXIsIG9mZnNldCkge1xuICAgIHJldHVybiBidWZmZXIucmVhZFVJbnQzMkxFKG9mZnNldCArIDQpICogMHgwMDAwMDAwMTAwMDAwMDAwICsgYnVmZmVyLnJlYWRVSW50MzJMRShvZmZzZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0cmVhbVppcDtcbiIsICJpbXBvcnQgeyBBbGVydCwgSWNvbiwgY29uZmlybUFsZXJ0LCBzaG93VG9hc3QsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgQml0d2FyZGVuIH0gZnJvbSBcIn4vYXBpL2JpdHdhcmRlblwiO1xuaW1wb3J0IHsgU2Vzc2lvblN0b3JhZ2UgfSBmcm9tIFwifi9jb250ZXh0L3Nlc3Npb24vdXRpbHNcIjtcbmltcG9ydCB7IENhY2hlIH0gZnJvbSBcIn4vdXRpbHMvY2FjaGVcIjtcbmltcG9ydCB7IE5vdExvZ2dlZEluRXJyb3IgfSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcblxuYXN5bmMgZnVuY3Rpb24gbG9nb3V0VmF1bHRDb21tYW5kKCkge1xuICB0cnkge1xuICAgIGNvbnN0IGhhc0NvbmZpcm1lZCA9IGF3YWl0IGNvbmZpcm1BbGVydCh7XG4gICAgICB0aXRsZTogXCJMb2dvdXQgRnJvbSBCaXR3YXJkZW4gVmF1bHRcIixcbiAgICAgIG1lc3NhZ2U6IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGxvZ291dCBmcm9tIHlvdXIgY3VycmVudCB2YXVsdCBhY2NvdW50P1wiLFxuICAgICAgaWNvbjogSWNvbi5Mb2dvdXQsXG4gICAgICBwcmltYXJ5QWN0aW9uOiB7IHRpdGxlOiBcIkNvbmZpcm1cIiwgc3R5bGU6IEFsZXJ0LkFjdGlvblN0eWxlLkRlc3RydWN0aXZlIH0sXG4gICAgfSk7XG5cbiAgICBpZiAoIWhhc0NvbmZpcm1lZCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdG9hc3QgPSBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuQW5pbWF0ZWQsIFwiTG9nZ2luZyBvdXQuLi5cIik7XG4gICAgY29uc3QgYml0d2FyZGVuID0gYXdhaXQgbmV3IEJpdHdhcmRlbih0b2FzdCkuaW5pdGlhbGl6ZSgpO1xuICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IGJpdHdhcmRlbi5sb2dvdXQoKTtcblxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIE5vdExvZ2dlZEluRXJyb3IpIHtcbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuRmFpbHVyZTtcbiAgICAgIHRvYXN0LnRpdGxlID0gXCJObyBzZXNzaW9uIGZvdW5kXCI7XG4gICAgICB0b2FzdC5tZXNzYWdlID0gXCJZb3UgYXJlIG5vdCBsb2dnZWQgaW5cIjtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLkZhaWx1cmUsIFwiRmFpbGVkIHRvIGxvZ291dCBmcm9tIHZhdWx0XCIpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBTZXNzaW9uU3RvcmFnZS5sb2dvdXRDbGVhclNlc3Npb24oKTtcbiAgICBDYWNoZS5jbGVhcigpO1xuICAgIGF3YWl0IHNob3dUb2FzdChUb2FzdC5TdHlsZS5TdWNjZXNzLCBcIlN1Y2Nlc3NmdWxseSBsb2dnZWQgb3V0XCIpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGF3YWl0IHNob3dUb2FzdChUb2FzdC5TdHlsZS5GYWlsdXJlLCBcIkZhaWxlZCB0byBsb2dvdXQgZnJvbSB2YXVsdFwiKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBsb2dvdXRWYXVsdENvbW1hbmQ7XG4iLCAiaW1wb3J0IHsgZW52aXJvbm1lbnQsIGdldFByZWZlcmVuY2VWYWx1ZXMsIExvY2FsU3RvcmFnZSwgb3Blbiwgc2hvd1RvYXN0LCBUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IGV4ZWNhLCBFeGVjYUNoaWxkUHJvY2VzcywgRXhlY2FFcnJvciwgRXhlY2FSZXR1cm5WYWx1ZSB9IGZyb20gXCJleGVjYVwiO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgdW5saW5rU3luYywgd3JpdGVGaWxlU3luYywgYWNjZXNzU3luYywgY29uc3RhbnRzLCBjaG1vZFN5bmMgfSBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IExPQ0FMX1NUT1JBR0VfS0VZLCBERUZBVUxUX1NFUlZFUl9VUkwsIENBQ0hFX0tFWVMgfSBmcm9tIFwifi9jb25zdGFudHMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgVmF1bHRTdGF0ZSwgVmF1bHRTdGF0dXMgfSBmcm9tIFwifi90eXBlcy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMgfSBmcm9tIFwifi90eXBlcy9wYXNzd29yZHNcIjtcbmltcG9ydCB7IEZvbGRlciwgSXRlbSwgSXRlbVR5cGUsIExvZ2luIH0gZnJvbSBcIn4vdHlwZXMvdmF1bHRcIjtcbmltcG9ydCB7IGdldFBhc3N3b3JkR2VuZXJhdGluZ0FyZ3MgfSBmcm9tIFwifi91dGlscy9wYXNzd29yZHNcIjtcbmltcG9ydCB7IGdldFNlcnZlclVybFByZWZlcmVuY2UgfSBmcm9tIFwifi91dGlscy9wcmVmZXJlbmNlc1wiO1xuaW1wb3J0IHtcbiAgRW5zdXJlQ2xpQmluRXJyb3IsXG4gIEluc3RhbGxlZENMSU5vdEZvdW5kRXJyb3IsXG4gIE1hbnVhbGx5VGhyb3duRXJyb3IsXG4gIE5vdExvZ2dlZEluRXJyb3IsXG4gIFByZW1pdW1GZWF0dXJlRXJyb3IsXG4gIFNlbmRJbnZhbGlkUGFzc3dvcmRFcnJvcixcbiAgU2VuZE5lZWRzUGFzc3dvcmRFcnJvcixcbiAgdHJ5RXhlYyxcbiAgVmF1bHRJc0xvY2tlZEVycm9yLFxufSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcbmltcG9ydCB7IGpvaW4sIGRpcm5hbWUgfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY2htb2QsIHJlbmFtZSwgcm0gfSBmcm9tIFwiZnMvcHJvbWlzZXNcIjtcbmltcG9ydCB7IGRlY29tcHJlc3NGaWxlLCByZW1vdmVGaWxlc1RoYXRTdGFydFdpdGgsIHVubGlua0FsbFN5bmMsIHdhaXRGb3JGaWxlQXZhaWxhYmxlIH0gZnJvbSBcIn4vdXRpbHMvZnNcIjtcbmltcG9ydCB7IGRvd25sb2FkIH0gZnJvbSBcIn4vdXRpbHMvbmV0d29ya1wiO1xuaW1wb3J0IHsgY2FwdHVyZUV4Y2VwdGlvbiB9IGZyb20gXCJ+L3V0aWxzL2RldmVsb3BtZW50XCI7XG5pbXBvcnQgeyBSZWNlaXZlZFNlbmQsIFNlbmQsIFNlbmRDcmVhdGVQYXlsb2FkLCBTZW5kVHlwZSB9IGZyb20gXCJ+L3R5cGVzL3NlbmRcIjtcbmltcG9ydCB7IHByZXBhcmVTZW5kUGF5bG9hZCB9IGZyb20gXCJ+L2FwaS9iaXR3YXJkZW4uaGVscGVyc1wiO1xuaW1wb3J0IHsgQ2FjaGUgfSBmcm9tIFwifi91dGlscy9jYWNoZVwiO1xuaW1wb3J0IHsgcGxhdGZvcm0gfSBmcm9tIFwifi91dGlscy9wbGF0Zm9ybVwiO1xuXG50eXBlIEVudiA9IHtcbiAgQklUV0FSREVOQ0xJX0FQUERBVEFfRElSOiBzdHJpbmc7XG4gIEJXX0NMSUVOVFNFQ1JFVDogc3RyaW5nO1xuICBCV19DTElFTlRJRDogc3RyaW5nO1xuICBQQVRIOiBzdHJpbmc7XG4gIE5PREVfRVhUUkFfQ0FfQ0VSVFM/OiBzdHJpbmc7XG4gIEJXX1NFU1NJT04/OiBzdHJpbmc7XG59O1xuXG50eXBlIEFjdGlvbkxpc3RlbmVycyA9IHtcbiAgbG9naW4/OiAoKSA9PiBNYXliZVByb21pc2U8dm9pZD47XG4gIGxvZ291dD86IChyZWFzb24/OiBzdHJpbmcpID0+IE1heWJlUHJvbWlzZTx2b2lkPjtcbiAgbG9jaz86IChyZWFzb24/OiBzdHJpbmcpID0+IE1heWJlUHJvbWlzZTx2b2lkPjtcbiAgdW5sb2NrPzogKHBhc3N3b3JkOiBzdHJpbmcsIHNlc3Npb25Ub2tlbjogc3RyaW5nKSA9PiBNYXliZVByb21pc2U8dm9pZD47XG59O1xuXG50eXBlIEFjdGlvbkxpc3RlbmVyc01hcDxUIGV4dGVuZHMga2V5b2YgQWN0aW9uTGlzdGVuZXJzID0ga2V5b2YgQWN0aW9uTGlzdGVuZXJzPiA9IE1hcDxULCBTZXQ8QWN0aW9uTGlzdGVuZXJzW1RdPj47XG5cbnR5cGUgTWF5YmVFcnJvcjxUID0gdW5kZWZpbmVkPiA9IHsgcmVzdWx0OiBUOyBlcnJvcj86IHVuZGVmaW5lZCB9IHwgeyByZXN1bHQ/OiB1bmRlZmluZWQ7IGVycm9yOiBNYW51YWxseVRocm93bkVycm9yIH07XG5cbnR5cGUgRXhlY1Byb3BzID0ge1xuICAvKiogUmVzZXQgdGhlIHRpbWUgb2YgdGhlIGxhc3QgY29tbWFuZCB0aGF0IGFjY2Vzc2VkIGRhdGEgb3IgbW9kaWZpZWQgdGhlIHZhdWx0LCB1c2VkIHRvIGRldGVybWluZSBpZiB0aGUgdmF1bHQgdGltZWQgb3V0ICovXG4gIHJlc2V0VmF1bHRUaW1lb3V0OiBib29sZWFuO1xuICBhYm9ydENvbnRyb2xsZXI/OiBBYm9ydENvbnRyb2xsZXI7XG4gIGlucHV0Pzogc3RyaW5nO1xufTtcblxudHlwZSBMb2NrT3B0aW9ucyA9IHtcbiAgLyoqIFRoZSByZWFzb24gZm9yIGxvY2tpbmcgdGhlIHZhdWx0ICovXG4gIHJlYXNvbj86IHN0cmluZztcbiAgY2hlY2tWYXVsdFN0YXR1cz86IGJvb2xlYW47XG4gIC8qKiBUaGUgY2FsbGJhY2tzIGFyZSBjYWxsZWQgYmVmb3JlIHRoZSBvcGVyYXRpb24gaXMgZmluaXNoZWQgKG9wdGltaXN0aWMpICovXG4gIGltbWVkaWF0ZT86IGJvb2xlYW47XG59O1xuXG50eXBlIExvZ291dE9wdGlvbnMgPSB7XG4gIC8qKiBUaGUgcmVhc29uIGZvciBsb2NraW5nIHRoZSB2YXVsdCAqL1xuICByZWFzb24/OiBzdHJpbmc7XG4gIC8qKiBUaGUgY2FsbGJhY2tzIGFyZSBjYWxsZWQgYmVmb3JlIHRoZSBvcGVyYXRpb24gaXMgZmluaXNoZWQgKG9wdGltaXN0aWMpICovXG4gIGltbWVkaWF0ZT86IGJvb2xlYW47XG59O1xuXG50eXBlIFJlY2VpdmVTZW5kT3B0aW9ucyA9IHtcbiAgc2F2ZVBhdGg/OiBzdHJpbmc7XG4gIHBhc3N3b3JkPzogc3RyaW5nO1xufTtcblxudHlwZSBDcmVhdGVMb2dpbkl0ZW1PcHRpb25zID0ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHVzZXJuYW1lPzogc3RyaW5nO1xuICBwYXNzd29yZDogc3RyaW5nO1xuICBmb2xkZXJJZDogc3RyaW5nIHwgbnVsbDtcbiAgdXJpPzogc3RyaW5nO1xufTtcblxuY29uc3QgeyBzdXBwb3J0UGF0aCB9ID0gZW52aXJvbm1lbnQ7XG5cbmNvbnN0IFx1MDM5NCA9IFwiNFwiOyAvLyBjaGFuZ2luZyB0aGlzIGZvcmNlcyBhIG5ldyBiaW4gZG93bmxvYWQgZm9yIHBlb3BsZSB0aGF0IGhhZCBhIGZhaWxlZCBvbmVcbmNvbnN0IEJpbkRvd25sb2FkTG9nZ2VyID0gKCgpID0+IHtcbiAgLyogVGhlIGlkZWEgb2YgdGhpcyBsb2dnZXIgaXMgdG8gd3JpdGUgYSBsb2cgZmlsZSB3aGVuIHRoZSBiaW4gZG93bmxvYWQgZmFpbHMsIHNvIHRoYXQgd2UgY2FuIGxldCB0aGUgZXh0ZW5zaW9uIGNyYXNoLFxuICAgYnV0IGZhbGxiYWNrIHRvIHRoZSBsb2NhbCBjbGkgcGF0aCBpbiB0aGUgbmV4dCBsYXVuY2guIFRoaXMgYWxsb3dzIHRoZSBlcnJvciB0byBiZSByZXBvcnRlZCBpbiB0aGUgaXNzdWVzIGRhc2hib2FyZC4gSXQgdXNlcyBmaWxlcyB0byBrZWVwIGl0IHN5bmNocm9ub3VzLCBhcyBpdCdzIG5lZWRlZCBpbiB0aGUgY29uc3RydWN0b3IuXG4gICBBbHRob3VnaCwgdGhlIHBsYW4gaXMgdG8gZGlzY29udGludWUgdGhpcyBtZXRob2QsIGlmIHRoZXJlJ3MgYSBiZXR0ZXIgd2F5IG9mIGxvZ2dpbmcgZXJyb3JzIGluIHRoZSBpc3N1ZXMgZGFzaGJvYXJkXG4gICBvciB0aGVyZSBhcmUgbm8gY3Jhc2hlcyByZXBvcnRlZCB3aXRoIHRoZSBiaW4gZG93bmxvYWQgYWZ0ZXIgc29tZSB0aW1lLiAqL1xuICBjb25zdCBmaWxlUGF0aCA9IGpvaW4oc3VwcG9ydFBhdGgsIGBidy1iaW4tZG93bmxvYWQtZXJyb3ItJHtcdTAzOTR9LmxvZ2ApO1xuICByZXR1cm4ge1xuICAgIGxvZ0Vycm9yOiAoZXJyb3I6IGFueSkgPT4gdHJ5RXhlYygoKSA9PiB3cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBlcnJvcj8ubWVzc2FnZSA/PyBcIlVuZXhwZWN0ZWQgZXJyb3JcIikpLFxuICAgIGNsZWFyRXJyb3I6ICgpID0+IHRyeUV4ZWMoKCkgPT4gdW5saW5rU3luYyhmaWxlUGF0aCkpLFxuICAgIGhhc0Vycm9yOiAoKSA9PiB0cnlFeGVjKCgpID0+IGV4aXN0c1N5bmMoZmlsZVBhdGgpLCBmYWxzZSksXG4gIH07XG59KSgpO1xuXG5leHBvcnQgY29uc3QgY2xpSW5mbyA9IHtcbiAgdmVyc2lvbjogXCIyMDI1LjIuMFwiLFxuICBnZXQgc2hhMjU2KCkge1xuICAgIGlmIChwbGF0Zm9ybSA9PT0gXCJ3aW5kb3dzXCIpIHJldHVybiBcIjMzYTEzMTAxN2FjOWM5OWQ3MjFlNDMwYTg2ZTkyOTM4MzMxNGQzZjkxYzlmMmZiZjQxM2Q4NzI1NjU2NTRjMThcIjtcbiAgICByZXR1cm4gXCJmYWRlNTEwMTJhNDYwMTFjMDE2YTJlNWFlZTJmMmU1MzRjMWVkMDc4ZTQ5ZDExNzhhNjllMjg4OWQyODEyYTk2XCI7XG4gIH0sXG4gIGRvd25sb2FkUGFnZTogXCJodHRwczovL2dpdGh1Yi5jb20vYml0d2FyZGVuL2NsaWVudHMvcmVsZWFzZXNcIixcbiAgcGF0aDoge1xuICAgIGdldCBkb3dubG9hZGVkQmluKCkge1xuICAgICAgcmV0dXJuIGpvaW4oc3VwcG9ydFBhdGgsIGNsaUluZm8uYmluRmlsZW5hbWVWZXJzaW9uZWQpO1xuICAgIH0sXG4gICAgZ2V0IGluc3RhbGxlZEJpbigpIHtcbiAgICAgIC8vIFdlIGFzc3VtZSB0aGF0IGl0IHdhcyBpbnN0YWxsZWQgdXNpbmcgQ2hvY29sYXRleSwgaWYgbm90LCBpdCdzIGhhcmQgdG8gbWFrZSBhIGdvb2QgZ3Vlc3MuXG4gICAgICBpZiAocGxhdGZvcm0gPT09IFwid2luZG93c1wiKSByZXR1cm4gXCJDOlxcXFxQcm9ncmFtRGF0YVxcXFxjaG9jb2xhdGV5XFxcXGJpblxcXFxidy5leGVcIjtcbiAgICAgIHJldHVybiBwcm9jZXNzLmFyY2ggPT09IFwiYXJtNjRcIiA/IFwiL29wdC9ob21lYnJldy9iaW4vYndcIiA6IFwiL3Vzci9sb2NhbC9iaW4vYndcIjtcbiAgICB9LFxuICAgIGdldCBiaW4oKSB7XG4gICAgICByZXR1cm4gIUJpbkRvd25sb2FkTG9nZ2VyLmhhc0Vycm9yKCkgPyB0aGlzLmRvd25sb2FkZWRCaW4gOiB0aGlzLmluc3RhbGxlZEJpbjtcbiAgICB9LFxuICB9LFxuICBnZXQgYmluRmlsZW5hbWUoKSB7XG4gICAgcmV0dXJuIHBsYXRmb3JtID09PSBcIndpbmRvd3NcIiA/IFwiYncuZXhlXCIgOiBcImJ3XCI7XG4gIH0sXG4gIGdldCBiaW5GaWxlbmFtZVZlcnNpb25lZCgpIHtcbiAgICBjb25zdCBuYW1lID0gYGJ3LSR7dGhpcy52ZXJzaW9ufWA7XG4gICAgcmV0dXJuIHBsYXRmb3JtID09PSBcIndpbmRvd3NcIiA/IGAke25hbWV9LmV4ZWAgOiBgJHtuYW1lfWA7XG4gIH0sXG4gIGdldCBkb3dubG9hZFVybCgpIHtcbiAgICBsZXQgYXJjaFN1ZmZpeCA9IFwiXCI7XG4gICAgaWYgKHBsYXRmb3JtID09PSBcIm1hY29zXCIpIHtcbiAgICAgIGFyY2hTdWZmaXggPSBwcm9jZXNzLmFyY2ggPT09IFwiYXJtNjRcIiA/IFwiLWFybTY0XCIgOiBcIlwiO1xuICAgIH1cblxuICAgIHJldHVybiBgJHt0aGlzLmRvd25sb2FkUGFnZX0vZG93bmxvYWQvY2xpLXYke3RoaXMudmVyc2lvbn0vYnctJHtwbGF0Zm9ybX0ke2FyY2hTdWZmaXh9LSR7dGhpcy52ZXJzaW9ufS56aXBgO1xuICB9LFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNsYXNzIEJpdHdhcmRlbiB7XG4gIHByaXZhdGUgZW52OiBFbnY7XG4gIHByaXZhdGUgaW5pdFByb21pc2U6IFByb21pc2U8dm9pZD47XG4gIHByaXZhdGUgdGVtcFNlc3Npb25Ub2tlbj86IHN0cmluZztcbiAgcHJpdmF0ZSBhY3Rpb25MaXN0ZW5lcnM6IEFjdGlvbkxpc3RlbmVyc01hcCA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBwcmVmZXJlbmNlcyA9IGdldFByZWZlcmVuY2VWYWx1ZXM8UHJlZmVyZW5jZXM+KCk7XG4gIHByaXZhdGUgY2xpUGF0aDogc3RyaW5nO1xuICBwcml2YXRlIHRvYXN0SW5zdGFuY2U6IFRvYXN0IHwgdW5kZWZpbmVkO1xuICB3YXNDbGlVcGRhdGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IodG9hc3RJbnN0YW5jZT86IFRvYXN0KSB7XG4gICAgY29uc3QgeyBjbGlQYXRoOiBjbGlQYXRoUHJlZmVyZW5jZSwgY2xpZW50SWQsIGNsaWVudFNlY3JldCwgc2VydmVyQ2VydHNQYXRoIH0gPSB0aGlzLnByZWZlcmVuY2VzO1xuICAgIGNvbnN0IHNlcnZlclVybCA9IGdldFNlcnZlclVybFByZWZlcmVuY2UoKTtcblxuICAgIHRoaXMudG9hc3RJbnN0YW5jZSA9IHRvYXN0SW5zdGFuY2U7XG4gICAgdGhpcy5jbGlQYXRoID0gY2xpUGF0aFByZWZlcmVuY2UgfHwgY2xpSW5mby5wYXRoLmJpbjtcbiAgICB0aGlzLmVudiA9IHtcbiAgICAgIEJJVFdBUkRFTkNMSV9BUFBEQVRBX0RJUjogc3VwcG9ydFBhdGgsXG4gICAgICBCV19DTElFTlRTRUNSRVQ6IGNsaWVudFNlY3JldC50cmltKCksXG4gICAgICBCV19DTElFTlRJRDogY2xpZW50SWQudHJpbSgpLFxuICAgICAgUEFUSDogZGlybmFtZShwcm9jZXNzLmV4ZWNQYXRoKSxcbiAgICAgIC4uLihzZXJ2ZXJVcmwgJiYgc2VydmVyQ2VydHNQYXRoID8geyBOT0RFX0VYVFJBX0NBX0NFUlRTOiBzZXJ2ZXJDZXJ0c1BhdGggfSA6IHt9KSxcbiAgICB9O1xuXG4gICAgdGhpcy5pbml0UHJvbWlzZSA9IChhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBhd2FpdCB0aGlzLmVuc3VyZUNsaUJpbmFyeSgpO1xuICAgICAgdm9pZCB0aGlzLnJldHJpZXZlQW5kQ2FjaGVDbGlWZXJzaW9uKCk7XG4gICAgICBhd2FpdCB0aGlzLmNoZWNrU2VydmVyVXJsKHNlcnZlclVybCk7XG4gICAgfSkoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlQ2xpQmluYXJ5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmNoZWNrQ2xpQmluSXNSZWFkeSh0aGlzLmNsaVBhdGgpKSByZXR1cm47XG4gICAgaWYgKHRoaXMuY2xpUGF0aCA9PT0gdGhpcy5wcmVmZXJlbmNlcy5jbGlQYXRoIHx8IHRoaXMuY2xpUGF0aCA9PT0gY2xpSW5mby5wYXRoLmluc3RhbGxlZEJpbikge1xuICAgICAgdGhyb3cgbmV3IEluc3RhbGxlZENMSU5vdEZvdW5kRXJyb3IoYEJpdHdhcmRlbiBDTEkgbm90IGZvdW5kIGF0ICR7dGhpcy5jbGlQYXRofWApO1xuICAgIH1cbiAgICBpZiAoQmluRG93bmxvYWRMb2dnZXIuaGFzRXJyb3IoKSkgQmluRG93bmxvYWRMb2dnZXIuY2xlYXJFcnJvcigpO1xuXG4gICAgLy8gcmVtb3ZlIG9sZCBiaW5hcmllcyB0byBjaGVjayBpZiBpdCdzIGFuIHVwZGF0ZSBhbmQgYmVjYXVzZSB0aGV5IGFyZSAxMDBNQitcbiAgICBjb25zdCBoYWRPbGRCaW5hcmllcyA9IGF3YWl0IHJlbW92ZUZpbGVzVGhhdFN0YXJ0V2l0aChcImJ3LVwiLCBzdXBwb3J0UGF0aCk7XG4gICAgY29uc3QgdG9hc3QgPSBhd2FpdCB0aGlzLnNob3dUb2FzdCh7XG4gICAgICB0aXRsZTogYCR7aGFkT2xkQmluYXJpZXMgPyBcIlVwZGF0aW5nXCIgOiBcIkluaXRpYWxpemluZ1wifSBCaXR3YXJkZW4gQ0xJYCxcbiAgICAgIHN0eWxlOiBUb2FzdC5TdHlsZS5BbmltYXRlZCxcbiAgICAgIHByaW1hcnlBY3Rpb246IHsgdGl0bGU6IFwiT3BlbiBEb3dubG9hZCBQYWdlXCIsIG9uQWN0aW9uOiAoKSA9PiBvcGVuKGNsaUluZm8uZG93bmxvYWRQYWdlKSB9LFxuICAgIH0pO1xuICAgIGNvbnN0IHRtcEZpbGVOYW1lID0gXCJidy56aXBcIjtcbiAgICBjb25zdCB6aXBQYXRoID0gam9pbihzdXBwb3J0UGF0aCwgdG1wRmlsZU5hbWUpO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRvYXN0Lm1lc3NhZ2UgPSBcIkRvd25sb2FkaW5nLi4uXCI7XG4gICAgICAgIGF3YWl0IGRvd25sb2FkKGNsaUluZm8uZG93bmxvYWRVcmwsIHppcFBhdGgsIHtcbiAgICAgICAgICBvblByb2dyZXNzOiAocGVyY2VudCkgPT4gKHRvYXN0Lm1lc3NhZ2UgPSBgRG93bmxvYWRpbmcgJHtwZXJjZW50fSVgKSxcbiAgICAgICAgICBzaGEyNTY6IGNsaUluZm8uc2hhMjU2LFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGRvd25sb2FkRXJyb3IpIHtcbiAgICAgICAgdG9hc3QudGl0bGUgPSBcIkZhaWxlZCB0byBkb3dubG9hZCBCaXR3YXJkZW4gQ0xJXCI7XG4gICAgICAgIHRocm93IGRvd25sb2FkRXJyb3I7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHRvYXN0Lm1lc3NhZ2UgPSBcIkV4dHJhY3RpbmcuLi5cIjtcbiAgICAgICAgYXdhaXQgZGVjb21wcmVzc0ZpbGUoemlwUGF0aCwgc3VwcG9ydFBhdGgpO1xuICAgICAgICBjb25zdCBkZWNvbXByZXNzZWRCaW5QYXRoID0gam9pbihzdXBwb3J0UGF0aCwgY2xpSW5mby5iaW5GaWxlbmFtZSk7XG5cbiAgICAgICAgLy8gRm9yIHNvbWUgcmVhc29uIHRoaXMgcmVuYW1lIHN0YXJ0ZWQgdGhyb3dpbmcgYW4gZXJyb3IgYWZ0ZXIgc3VjY2VlZGluZywgc28gZm9yIG5vdyB3ZSdyZSBqdXN0XG4gICAgICAgIC8vIGNhdGNoaW5nIGl0IGFuZCBjaGVja2luZyBpZiB0aGUgZmlsZSBleGlzdHMgXHUwMEFGXFxfKFx1MzBDNClfL1x1MDBBRlxuICAgICAgICBhd2FpdCByZW5hbWUoZGVjb21wcmVzc2VkQmluUGF0aCwgdGhpcy5jbGlQYXRoKS5jYXRjaCgoKSA9PiBudWxsKTtcbiAgICAgICAgYXdhaXQgd2FpdEZvckZpbGVBdmFpbGFibGUodGhpcy5jbGlQYXRoKTtcblxuICAgICAgICBhd2FpdCBjaG1vZCh0aGlzLmNsaVBhdGgsIFwiNzU1XCIpO1xuICAgICAgICBhd2FpdCBybSh6aXBQYXRoLCB7IGZvcmNlOiB0cnVlIH0pO1xuXG4gICAgICAgIENhY2hlLnNldChDQUNIRV9LRVlTLkNMSV9WRVJTSU9OLCBjbGlJbmZvLnZlcnNpb24pO1xuICAgICAgICB0aGlzLndhc0NsaVVwZGF0ZWQgPSB0cnVlO1xuICAgICAgfSBjYXRjaCAoZXh0cmFjdEVycm9yKSB7XG4gICAgICAgIHRvYXN0LnRpdGxlID0gXCJGYWlsZWQgdG8gZXh0cmFjdCBCaXR3YXJkZW4gQ0xJXCI7XG4gICAgICAgIHRocm93IGV4dHJhY3RFcnJvcjtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRvYXN0LmhpZGUoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdG9hc3QubWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRW5zdXJlQ2xpQmluRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJQbGVhc2UgdHJ5IGFnYWluXCI7XG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLkZhaWx1cmU7XG5cbiAgICAgIHVubGlua0FsbFN5bmMoemlwUGF0aCwgdGhpcy5jbGlQYXRoKTtcblxuICAgICAgaWYgKCFlbnZpcm9ubWVudC5pc0RldmVsb3BtZW50KSBCaW5Eb3dubG9hZExvZ2dlci5sb2dFcnJvcihlcnJvcik7XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikgdGhyb3cgbmV3IEVuc3VyZUNsaUJpbkVycm9yKGVycm9yLm1lc3NhZ2UsIGVycm9yLnN0YWNrKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBhd2FpdCB0b2FzdC5yZXN0b3JlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZXRyaWV2ZUFuZENhY2hlQ2xpVmVyc2lvbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBlcnJvciwgcmVzdWx0IH0gPSBhd2FpdCB0aGlzLmdldFZlcnNpb24oKTtcbiAgICAgIGlmICghZXJyb3IpIENhY2hlLnNldChDQUNIRV9LRVlTLkNMSV9WRVJTSU9OLCByZXN1bHQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHJldHJpZXZlIGFuZCBjYWNoZSBjbGkgdmVyc2lvblwiLCBlcnJvciwgeyBjYXB0dXJlVG9SYXljYXN0OiB0cnVlIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2hlY2tDbGlCaW5Jc1JlYWR5KGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFleGlzdHNTeW5jKHRoaXMuY2xpUGF0aCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGFjY2Vzc1N5bmMoZmlsZVBhdGgsIGNvbnN0YW50cy5YX09LKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgY2htb2RTeW5jKGZpbGVQYXRoLCBcIjc1NVwiKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHNldFNlc3Npb25Ub2tlbih0b2tlbjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5lbnYgPSB7XG4gICAgICAuLi50aGlzLmVudixcbiAgICAgIEJXX1NFU1NJT046IHRva2VuLFxuICAgIH07XG4gIH1cblxuICBjbGVhclNlc3Npb25Ub2tlbigpOiB2b2lkIHtcbiAgICBkZWxldGUgdGhpcy5lbnYuQldfU0VTU0lPTjtcbiAgfVxuXG4gIHdpdGhTZXNzaW9uKHRva2VuOiBzdHJpbmcpOiB0aGlzIHtcbiAgICB0aGlzLnRlbXBTZXNzaW9uVG9rZW4gPSB0b2tlbjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgYXdhaXQgdGhpcy5pbml0UHJvbWlzZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFzeW5jIGNoZWNrU2VydmVyVXJsKHNlcnZlclVybDogc3RyaW5nIHwgdW5kZWZpbmVkKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gQ2hlY2sgdGhlIENMSSBoYXMgYmVlbiBjb25maWd1cmVkIHRvIHVzZSB0aGUgcHJlZmVyZW5jZSBVcmxcbiAgICBjb25zdCBzdG9yZWRTZXJ2ZXIgPSBhd2FpdCBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KExPQ0FMX1NUT1JBR0VfS0VZLlNFUlZFUl9VUkwpO1xuICAgIGlmICghc2VydmVyVXJsIHx8IHN0b3JlZFNlcnZlciA9PT0gc2VydmVyVXJsKSByZXR1cm47XG5cbiAgICAvLyBVcGRhdGUgdGhlIHNlcnZlciBVcmxcbiAgICBjb25zdCB0b2FzdCA9IGF3YWl0IHRoaXMuc2hvd1RvYXN0KHtcbiAgICAgIHN0eWxlOiBUb2FzdC5TdHlsZS5BbmltYXRlZCxcbiAgICAgIHRpdGxlOiBcIlN3aXRjaGluZyBzZXJ2ZXIuLi5cIixcbiAgICAgIG1lc3NhZ2U6IFwiQml0d2FyZGVuIHNlcnZlciBwcmVmZXJlbmNlIGNoYW5nZWRcIixcbiAgICB9KTtcbiAgICB0cnkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5sb2dvdXQoKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBJdCBkb2Vzbid0IG1hdHRlciBpZiB3ZSB3ZXJlbid0IGxvZ2dlZCBpbi5cbiAgICAgIH1cbiAgICAgIC8vIElmIFVSTCBpcyBlbXB0eSwgc2V0IGl0IHRvIHRoZSBkZWZhdWx0XG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoW1wiY29uZmlnXCIsIFwic2VydmVyXCIsIHNlcnZlclVybCB8fCBERUZBVUxUX1NFUlZFUl9VUkxdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICAgIGF3YWl0IExvY2FsU3RvcmFnZS5zZXRJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlNFUlZFUl9VUkwsIHNlcnZlclVybCk7XG5cbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuU3VjY2VzcztcbiAgICAgIHRvYXN0LnRpdGxlID0gXCJTdWNjZXNzXCI7XG4gICAgICB0b2FzdC5tZXNzYWdlID0gXCJCaXR3YXJkZW4gc2VydmVyIGNoYW5nZWRcIjtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5GYWlsdXJlO1xuICAgICAgdG9hc3QudGl0bGUgPSBcIkZhaWxlZCB0byBzd2l0Y2ggc2VydmVyXCI7XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0b2FzdC5tZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvYXN0Lm1lc3NhZ2UgPSBcIlVua25vd24gZXJyb3Igb2NjdXJyZWRcIjtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgdG9hc3QucmVzdG9yZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZXhlYyhhcmdzOiBzdHJpbmdbXSwgb3B0aW9uczogRXhlY1Byb3BzKTogUHJvbWlzZTxFeGVjYUNoaWxkUHJvY2Vzcz4ge1xuICAgIGNvbnN0IHsgYWJvcnRDb250cm9sbGVyLCBpbnB1dCA9IFwiXCIsIHJlc2V0VmF1bHRUaW1lb3V0IH0gPSBvcHRpb25zID8/IHt9O1xuXG4gICAgbGV0IGVudiA9IHRoaXMuZW52O1xuICAgIGlmICh0aGlzLnRlbXBTZXNzaW9uVG9rZW4pIHtcbiAgICAgIGVudiA9IHsgLi4uZW52LCBCV19TRVNTSU9OOiB0aGlzLnRlbXBTZXNzaW9uVG9rZW4gfTtcbiAgICAgIHRoaXMudGVtcFNlc3Npb25Ub2tlbiA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjYSh0aGlzLmNsaVBhdGgsIGFyZ3MsIHsgaW5wdXQsIGVudiwgc2lnbmFsOiBhYm9ydENvbnRyb2xsZXI/LnNpZ25hbCB9KTtcblxuICAgIGlmICh0aGlzLmlzUHJvbXB0V2FpdGluZ0Zvck1hc3RlclBhc3N3b3JkKHJlc3VsdCkpIHtcbiAgICAgIC8qIHNpbmNlIHdlIGhhdmUgdGhlIHNlc3Npb24gdG9rZW4gaW4gdGhlIGVudiwgdGhlIHBhc3N3b3JkIFxuICAgICAgc2hvdWxkIG5vdCBiZSByZXF1ZXN0ZWQsIHVubGVzcyB0aGUgdmF1bHQgaXMgbG9ja2VkICovXG4gICAgICBhd2FpdCB0aGlzLmxvY2soKTtcbiAgICAgIHRocm93IG5ldyBWYXVsdElzTG9ja2VkRXJyb3IoKTtcbiAgICB9XG5cbiAgICBpZiAocmVzZXRWYXVsdFRpbWVvdXQpIHtcbiAgICAgIGF3YWl0IExvY2FsU3RvcmFnZS5zZXRJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLkxBU1RfQUNUSVZJVFlfVElNRSwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgYXN5bmMgZ2V0VmVyc2lvbigpOiBQcm9taXNlPE1heWJlRXJyb3I8c3RyaW5nPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dDogcmVzdWx0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiLS12ZXJzaW9uXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZXQgY2xpIHZlcnNpb25cIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxvZ2luKCk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoW1wibG9naW5cIiwgXCItLWFwaWtleVwiXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUxhc3RWYXVsdFN0YXR1cyhcImxvZ2luXCIsIFwidW5sb2NrZWRcIik7XG4gICAgICBhd2FpdCB0aGlzLmNhbGxBY3Rpb25MaXN0ZW5lcnMoXCJsb2dpblwiKTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogdW5kZWZpbmVkIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGxvZ2luXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsb2dvdXQob3B0aW9ucz86IExvZ291dE9wdGlvbnMpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICBjb25zdCB7IHJlYXNvbiwgaW1tZWRpYXRlID0gZmFsc2UgfSA9IG9wdGlvbnMgPz8ge307XG4gICAgdHJ5IHtcbiAgICAgIGlmIChpbW1lZGlhdGUpIGF3YWl0IHRoaXMuaGFuZGxlUG9zdExvZ291dChyZWFzb24pO1xuXG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoW1wibG9nb3V0XCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUxhc3RWYXVsdFN0YXR1cyhcImxvZ291dFwiLCBcInVuYXV0aGVudGljYXRlZFwiKTtcbiAgICAgIGlmICghaW1tZWRpYXRlKSBhd2FpdCB0aGlzLmhhbmRsZVBvc3RMb2dvdXQocmVhc29uKTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogdW5kZWZpbmVkIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGxvZ291dFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbG9jayhvcHRpb25zPzogTG9ja09wdGlvbnMpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICBjb25zdCB7IHJlYXNvbiwgY2hlY2tWYXVsdFN0YXR1cyA9IGZhbHNlLCBpbW1lZGlhdGUgPSBmYWxzZSB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICB0cnkge1xuICAgICAgaWYgKGltbWVkaWF0ZSkgYXdhaXQgdGhpcy5jYWxsQWN0aW9uTGlzdGVuZXJzKFwibG9ja1wiLCByZWFzb24pO1xuICAgICAgaWYgKGNoZWNrVmF1bHRTdGF0dXMpIHtcbiAgICAgICAgY29uc3QgeyBlcnJvciwgcmVzdWx0IH0gPSBhd2FpdCB0aGlzLnN0YXR1cygpO1xuICAgICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJ1bmF1dGhlbnRpY2F0ZWRcIikgcmV0dXJuIHsgZXJyb3I6IG5ldyBOb3RMb2dnZWRJbkVycm9yKFwiTm90IGxvZ2dlZCBpblwiKSB9O1xuICAgICAgfVxuXG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoW1wibG9ja1wiXSwgeyByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJsb2NrXCIsIFwibG9ja2VkXCIpO1xuICAgICAgaWYgKCFpbW1lZGlhdGUpIGF3YWl0IHRoaXMuY2FsbEFjdGlvbkxpc3RlbmVycyhcImxvY2tcIiwgcmVhc29uKTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogdW5kZWZpbmVkIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGxvY2sgdmF1bHRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHVubG9jayhwYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPHN0cmluZz4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQ6IHNlc3Npb25Ub2tlbiB9ID0gYXdhaXQgdGhpcy5leGVjKFtcInVubG9ja1wiLCBwYXNzd29yZCwgXCItLXJhd1wiXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHRoaXMuc2V0U2Vzc2lvblRva2VuKHNlc3Npb25Ub2tlbik7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJ1bmxvY2tcIiwgXCJ1bmxvY2tlZFwiKTtcbiAgICAgIGF3YWl0IHRoaXMuY2FsbEFjdGlvbkxpc3RlbmVycyhcInVubG9ja1wiLCBwYXNzd29yZCwgc2Vzc2lvblRva2VuKTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogc2Vzc2lvblRva2VuIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHVubG9jayB2YXVsdFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgc3luYygpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcInN5bmNcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBzeW5jIHZhdWx0XCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRJdGVtKGlkOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I8SXRlbT4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJnZXRcIiwgXCJpdGVtXCIsIGlkXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxJdGVtPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGdldCBpdGVtXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsaXN0SXRlbXMoKTogUHJvbWlzZTxNYXliZUVycm9yPEl0ZW1bXT4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJsaXN0XCIsIFwiaXRlbXNcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICBjb25zdCBpdGVtcyA9IEpTT04ucGFyc2U8SXRlbVtdPihzdGRvdXQpO1xuICAgICAgLy8gRmlsdGVyIG91dCBpdGVtcyB3aXRob3V0IGEgbmFtZSBwcm9wZXJ0eSAodGhleSBhcmUgbm90IGRpc3BsYXllZCBpbiB0aGUgYml0d2FyZGVuIGFwcClcbiAgICAgIHJldHVybiB7IHJlc3VsdDogaXRlbXMuZmlsdGVyKChpdGVtOiBJdGVtKSA9PiAhIWl0ZW0ubmFtZSkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gbGlzdCBpdGVtc1wiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY3JlYXRlTG9naW5JdGVtKG9wdGlvbnM6IENyZWF0ZUxvZ2luSXRlbU9wdGlvbnMpOiBQcm9taXNlPE1heWJlRXJyb3I8SXRlbT4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBlcnJvcjogaXRlbVRlbXBsYXRlRXJyb3IsIHJlc3VsdDogaXRlbVRlbXBsYXRlIH0gPSBhd2FpdCB0aGlzLmdldFRlbXBsYXRlPEl0ZW0+KFwiaXRlbVwiKTtcbiAgICAgIGlmIChpdGVtVGVtcGxhdGVFcnJvcikgdGhyb3cgaXRlbVRlbXBsYXRlRXJyb3I7XG5cbiAgICAgIGNvbnN0IHsgZXJyb3I6IGxvZ2luVGVtcGxhdGVFcnJvciwgcmVzdWx0OiBsb2dpblRlbXBsYXRlIH0gPSBhd2FpdCB0aGlzLmdldFRlbXBsYXRlPExvZ2luPihcIml0ZW0ubG9naW5cIik7XG4gICAgICBpZiAobG9naW5UZW1wbGF0ZUVycm9yKSB0aHJvdyBsb2dpblRlbXBsYXRlRXJyb3I7XG5cbiAgICAgIGl0ZW1UZW1wbGF0ZS5uYW1lID0gb3B0aW9ucy5uYW1lO1xuICAgICAgaXRlbVRlbXBsYXRlLnR5cGUgPSBJdGVtVHlwZS5MT0dJTjtcbiAgICAgIGl0ZW1UZW1wbGF0ZS5mb2xkZXJJZCA9IG9wdGlvbnMuZm9sZGVySWQgfHwgbnVsbDtcbiAgICAgIGl0ZW1UZW1wbGF0ZS5sb2dpbiA9IGxvZ2luVGVtcGxhdGU7XG4gICAgICBpdGVtVGVtcGxhdGUubm90ZXMgPSBudWxsO1xuXG4gICAgICBsb2dpblRlbXBsYXRlLnVzZXJuYW1lID0gb3B0aW9ucy51c2VybmFtZSB8fCBudWxsO1xuICAgICAgbG9naW5UZW1wbGF0ZS5wYXNzd29yZCA9IG9wdGlvbnMucGFzc3dvcmQ7XG4gICAgICBsb2dpblRlbXBsYXRlLnRvdHAgPSBudWxsO1xuICAgICAgbG9naW5UZW1wbGF0ZS5maWRvMkNyZWRlbnRpYWxzID0gdW5kZWZpbmVkO1xuXG4gICAgICBpZiAob3B0aW9ucy51cmkpIHtcbiAgICAgICAgbG9naW5UZW1wbGF0ZS51cmlzID0gW3sgbWF0Y2g6IG51bGwsIHVyaTogb3B0aW9ucy51cmkgfV07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHsgcmVzdWx0OiBlbmNvZGVkSXRlbSwgZXJyb3I6IGVuY29kZUVycm9yIH0gPSBhd2FpdCB0aGlzLmVuY29kZShKU09OLnN0cmluZ2lmeShpdGVtVGVtcGxhdGUpKTtcbiAgICAgIGlmIChlbmNvZGVFcnJvcikgdGhyb3cgZW5jb2RlRXJyb3I7XG5cbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiY3JlYXRlXCIsIFwiaXRlbVwiLCBlbmNvZGVkSXRlbV0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8SXRlbT4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBjcmVhdGUgbG9naW4gaXRlbVwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbGlzdEZvbGRlcnMoKTogUHJvbWlzZTxNYXliZUVycm9yPEZvbGRlcltdPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImxpc3RcIiwgXCJmb2xkZXJzXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPEZvbGRlcltdPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGxpc3QgZm9sZGVyXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjcmVhdGVGb2xkZXIobmFtZTogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZXJyb3IsIHJlc3VsdDogZm9sZGVyIH0gPSBhd2FpdCB0aGlzLmdldFRlbXBsYXRlKFwiZm9sZGVyXCIpO1xuICAgICAgaWYgKGVycm9yKSB0aHJvdyBlcnJvcjtcblxuICAgICAgZm9sZGVyLm5hbWUgPSBuYW1lO1xuICAgICAgY29uc3QgeyByZXN1bHQ6IGVuY29kZWRGb2xkZXIsIGVycm9yOiBlbmNvZGVFcnJvciB9ID0gYXdhaXQgdGhpcy5lbmNvZGUoSlNPTi5zdHJpbmdpZnkoZm9sZGVyKSk7XG4gICAgICBpZiAoZW5jb2RlRXJyb3IpIHRocm93IGVuY29kZUVycm9yO1xuXG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoW1wiY3JlYXRlXCIsIFwiZm9sZGVyXCIsIGVuY29kZWRGb2xkZXJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gY3JlYXRlIGZvbGRlclwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0VG90cChpZDogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPHN0cmluZz4+IHtcbiAgICB0cnkge1xuICAgICAgLy8gdGhpcyBjb3VsZCByZXR1cm4gc29tZXRoaW5nIGxpa2UgXCJOb3QgZm91bmQuXCIgYnV0IGNoZWNrcyBmb3IgdG90cCBjb2RlIGFyZSBkb25lIGJlZm9yZSBjYWxsaW5nIHRoaXMgZnVuY3Rpb25cbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiZ2V0XCIsIFwidG90cFwiLCBpZF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHN0ZG91dCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZXQgVE9UUFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgc3RhdHVzKCk6IFByb21pc2U8TWF5YmVFcnJvcjxWYXVsdFN0YXRlPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcInN0YXR1c1wiXSwgeyByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8VmF1bHRTdGF0ZT4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZXQgc3RhdHVzXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjaGVja0xvY2tTdGF0dXMoKTogUHJvbWlzZTxWYXVsdFN0YXR1cz4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoW1widW5sb2NrXCIsIFwiLS1jaGVja1wiXSwgeyByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJjaGVja0xvY2tTdGF0dXNcIiwgXCJ1bmxvY2tlZFwiKTtcbiAgICAgIHJldHVybiBcInVubG9ja2VkXCI7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gY2hlY2sgbG9jayBzdGF0dXNcIiwgZXJyb3IpO1xuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gKGVycm9yIGFzIEV4ZWNhRXJyb3IpLnN0ZGVycjtcbiAgICAgIGlmIChlcnJvck1lc3NhZ2UgPT09IFwiVmF1bHQgaXMgbG9ja2VkLlwiKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZUxhc3RWYXVsdFN0YXR1cyhcImNoZWNrTG9ja1N0YXR1c1wiLCBcImxvY2tlZFwiKTtcbiAgICAgICAgcmV0dXJuIFwibG9ja2VkXCI7XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJjaGVja0xvY2tTdGF0dXNcIiwgXCJ1bmF1dGhlbnRpY2F0ZWRcIik7XG4gICAgICByZXR1cm4gXCJ1bmF1dGhlbnRpY2F0ZWRcIjtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRUZW1wbGF0ZTxUID0gYW55Pih0eXBlOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I8VD4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJnZXRcIiwgXCJ0ZW1wbGF0ZVwiLCB0eXBlXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxUPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGdldCB0ZW1wbGF0ZVwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZW5jb2RlKGlucHV0OiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I8c3RyaW5nPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImVuY29kZVwiXSwgeyBpbnB1dCwgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBzdGRvdXQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZW5jb2RlXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZW5lcmF0ZVBhc3N3b3JkKG9wdGlvbnM/OiBQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMsIGFib3J0Q29udHJvbGxlcj86IEFib3J0Q29udHJvbGxlcik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgYXJncyA9IG9wdGlvbnMgPyBnZXRQYXNzd29yZEdlbmVyYXRpbmdBcmdzKG9wdGlvbnMpIDogW107XG4gICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJnZW5lcmF0ZVwiLCAuLi5hcmdzXSwgeyBhYm9ydENvbnRyb2xsZXIsIHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICByZXR1cm4gc3Rkb3V0O1xuICB9XG5cbiAgYXN5bmMgbGlzdFNlbmRzKCk6IFByb21pc2U8TWF5YmVFcnJvcjxTZW5kW10+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcImxpc3RcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8U2VuZFtdPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGxpc3Qgc2VuZHNcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZVNlbmQodmFsdWVzOiBTZW5kQ3JlYXRlUGF5bG9hZCk6IFByb21pc2U8TWF5YmVFcnJvcjxTZW5kPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVycm9yOiB0ZW1wbGF0ZUVycm9yLCByZXN1bHQ6IHRlbXBsYXRlIH0gPSBhd2FpdCB0aGlzLmdldFRlbXBsYXRlKFxuICAgICAgICB2YWx1ZXMudHlwZSA9PT0gU2VuZFR5cGUuVGV4dCA/IFwic2VuZC50ZXh0XCIgOiBcInNlbmQuZmlsZVwiXG4gICAgICApO1xuICAgICAgaWYgKHRlbXBsYXRlRXJyb3IpIHRocm93IHRlbXBsYXRlRXJyb3I7XG5cbiAgICAgIGNvbnN0IHBheWxvYWQgPSBwcmVwYXJlU2VuZFBheWxvYWQodGVtcGxhdGUsIHZhbHVlcyk7XG4gICAgICBjb25zdCB7IHJlc3VsdDogZW5jb2RlZFBheWxvYWQsIGVycm9yOiBlbmNvZGVFcnJvciB9ID0gYXdhaXQgdGhpcy5lbmNvZGUoSlNPTi5zdHJpbmdpZnkocGF5bG9hZCkpO1xuICAgICAgaWYgKGVuY29kZUVycm9yKSB0aHJvdyBlbmNvZGVFcnJvcjtcblxuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJzZW5kXCIsIFwiY3JlYXRlXCIsIGVuY29kZWRQYXlsb2FkXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcblxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFNlbmQ+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gY3JlYXRlIHNlbmRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGVkaXRTZW5kKHZhbHVlczogU2VuZENyZWF0ZVBheWxvYWQpOiBQcm9taXNlPE1heWJlRXJyb3I8U2VuZD4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyByZXN1bHQ6IGVuY29kZWRQYXlsb2FkLCBlcnJvcjogZW5jb2RlRXJyb3IgfSA9IGF3YWl0IHRoaXMuZW5jb2RlKEpTT04uc3RyaW5naWZ5KHZhbHVlcykpO1xuICAgICAgaWYgKGVuY29kZUVycm9yKSB0aHJvdyBlbmNvZGVFcnJvcjtcblxuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJzZW5kXCIsIFwiZWRpdFwiLCBlbmNvZGVkUGF5bG9hZF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8U2VuZD4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBkZWxldGUgc2VuZFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZGVsZXRlU2VuZChpZDogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJzZW5kXCIsIFwiZGVsZXRlXCIsIGlkXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogdW5kZWZpbmVkIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGRlbGV0ZSBzZW5kXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyByZW1vdmVTZW5kUGFzc3dvcmQoaWQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcInJlbW92ZS1wYXNzd29yZFwiLCBpZF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byByZW1vdmUgc2VuZCBwYXNzd29yZFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVjZWl2ZVNlbmRJbmZvKHVybDogc3RyaW5nLCBvcHRpb25zPzogUmVjZWl2ZVNlbmRPcHRpb25zKTogUHJvbWlzZTxNYXliZUVycm9yPFJlY2VpdmVkU2VuZD4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQsIHN0ZGVyciB9ID0gYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJyZWNlaXZlXCIsIHVybCwgXCItLW9ialwiXSwge1xuICAgICAgICByZXNldFZhdWx0VGltZW91dDogdHJ1ZSxcbiAgICAgICAgaW5wdXQ6IG9wdGlvbnM/LnBhc3N3b3JkLFxuICAgICAgfSk7XG4gICAgICBpZiAoIXN0ZG91dCAmJiAvSW52YWxpZCBwYXNzd29yZC9pLnRlc3Qoc3RkZXJyKSkgcmV0dXJuIHsgZXJyb3I6IG5ldyBTZW5kSW52YWxpZFBhc3N3b3JkRXJyb3IoKSB9O1xuICAgICAgaWYgKCFzdGRvdXQgJiYgL1NlbmQgcGFzc3dvcmQvaS50ZXN0KHN0ZGVycikpIHJldHVybiB7IGVycm9yOiBuZXcgU2VuZE5lZWRzUGFzc3dvcmRFcnJvcigpIH07XG5cbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxSZWNlaXZlZFNlbmQ+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IChleGVjRXJyb3IgYXMgRXhlY2FFcnJvcikuc3RkZXJyO1xuICAgICAgaWYgKC9JbnZhbGlkIHBhc3N3b3JkL2dpLnRlc3QoZXJyb3JNZXNzYWdlKSkgcmV0dXJuIHsgZXJyb3I6IG5ldyBTZW5kSW52YWxpZFBhc3N3b3JkRXJyb3IoKSB9O1xuICAgICAgaWYgKC9TZW5kIHBhc3N3b3JkL2dpLnRlc3QoZXJyb3JNZXNzYWdlKSkgcmV0dXJuIHsgZXJyb3I6IG5ldyBTZW5kTmVlZHNQYXNzd29yZEVycm9yKCkgfTtcblxuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byByZWNlaXZlIHNlbmQgb2JqXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyByZWNlaXZlU2VuZCh1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlY2VpdmVTZW5kT3B0aW9ucyk6IFByb21pc2U8TWF5YmVFcnJvcjxzdHJpbmc+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc2F2ZVBhdGgsIHBhc3N3b3JkIH0gPSBvcHRpb25zID8/IHt9O1xuICAgICAgY29uc3QgYXJncyA9IFtcInNlbmRcIiwgXCJyZWNlaXZlXCIsIHVybF07XG4gICAgICBpZiAoc2F2ZVBhdGgpIGFyZ3MucHVzaChcIi0tb3V0cHV0XCIsIHNhdmVQYXRoKTtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoYXJncywgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSwgaW5wdXQ6IHBhc3N3b3JkIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBzdGRvdXQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gcmVjZWl2ZSBzZW5kXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICAvLyB1dGlscyBiZWxvd1xuXG4gIGFzeW5jIHNhdmVMYXN0VmF1bHRTdGF0dXMoY2FsbE5hbWU6IHN0cmluZywgc3RhdHVzOiBWYXVsdFN0YXR1cyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IExvY2FsU3RvcmFnZS5zZXRJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlZBVUxUX0xBU1RfU1RBVFVTLCBzdGF0dXMpO1xuICB9XG5cbiAgYXN5bmMgZ2V0TGFzdFNhdmVkVmF1bHRTdGF0dXMoKTogUHJvbWlzZTxWYXVsdFN0YXR1cyB8IHVuZGVmaW5lZD4ge1xuICAgIGNvbnN0IGxhc3RTYXZlZFN0YXR1cyA9IGF3YWl0IExvY2FsU3RvcmFnZS5nZXRJdGVtPFZhdWx0U3RhdHVzPihMT0NBTF9TVE9SQUdFX0tFWS5WQVVMVF9MQVNUX1NUQVRVUyk7XG4gICAgaWYgKCFsYXN0U2F2ZWRTdGF0dXMpIHtcbiAgICAgIGNvbnN0IHZhdWx0U3RhdHVzID0gYXdhaXQgdGhpcy5zdGF0dXMoKTtcbiAgICAgIHJldHVybiB2YXVsdFN0YXR1cy5yZXN1bHQ/LnN0YXR1cztcbiAgICB9XG4gICAgcmV0dXJuIGxhc3RTYXZlZFN0YXR1cztcbiAgfVxuXG4gIHByaXZhdGUgaXNQcm9tcHRXYWl0aW5nRm9yTWFzdGVyUGFzc3dvcmQocmVzdWx0OiBFeGVjYVJldHVyblZhbHVlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKHJlc3VsdC5zdGRlcnIgJiYgcmVzdWx0LnN0ZGVyci5pbmNsdWRlcyhcIk1hc3RlciBwYXNzd29yZFwiKSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGhhbmRsZVBvc3RMb2dvdXQocmVhc29uPzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5jbGVhclNlc3Npb25Ub2tlbigpO1xuICAgIGF3YWl0IHRoaXMuY2FsbEFjdGlvbkxpc3RlbmVycyhcImxvZ291dFwiLCByZWFzb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVDb21tb25FcnJvcnMoZXJyb3I6IGFueSk6IFByb21pc2U8eyBlcnJvcj86IE1hbnVhbGx5VGhyb3duRXJyb3IgfT4ge1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IChlcnJvciBhcyBFeGVjYUVycm9yKS5zdGRlcnI7XG4gICAgaWYgKCFlcnJvck1lc3NhZ2UpIHJldHVybiB7fTtcblxuICAgIGlmICgvbm90IGxvZ2dlZCBpbi9pLnRlc3QoZXJyb3JNZXNzYWdlKSkge1xuICAgICAgYXdhaXQgdGhpcy5oYW5kbGVQb3N0TG9nb3V0KCk7XG4gICAgICByZXR1cm4geyBlcnJvcjogbmV3IE5vdExvZ2dlZEluRXJyb3IoXCJOb3QgbG9nZ2VkIGluXCIpIH07XG4gICAgfVxuICAgIGlmICgvUHJlbWl1bSBzdGF0dXMvaS50ZXN0KGVycm9yTWVzc2FnZSkpIHtcbiAgICAgIHJldHVybiB7IGVycm9yOiBuZXcgUHJlbWl1bUZlYXR1cmVFcnJvcigpIH07XG4gICAgfVxuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIHNldEFjdGlvbkxpc3RlbmVyPEEgZXh0ZW5kcyBrZXlvZiBBY3Rpb25MaXN0ZW5lcnM+KGFjdGlvbjogQSwgbGlzdGVuZXI6IEFjdGlvbkxpc3RlbmVyc1tBXSk6IHRoaXMge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuYWN0aW9uTGlzdGVuZXJzLmdldChhY3Rpb24pO1xuICAgIGlmIChsaXN0ZW5lcnMgJiYgbGlzdGVuZXJzLnNpemUgPiAwKSB7XG4gICAgICBsaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hY3Rpb25MaXN0ZW5lcnMuc2V0KGFjdGlvbiwgbmV3IFNldChbbGlzdGVuZXJdKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVtb3ZlQWN0aW9uTGlzdGVuZXI8QSBleHRlbmRzIGtleW9mIEFjdGlvbkxpc3RlbmVycz4oYWN0aW9uOiBBLCBsaXN0ZW5lcjogQWN0aW9uTGlzdGVuZXJzW0FdKTogdGhpcyB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5hY3Rpb25MaXN0ZW5lcnMuZ2V0KGFjdGlvbik7XG4gICAgaWYgKGxpc3RlbmVycyAmJiBsaXN0ZW5lcnMuc2l6ZSA+IDApIHtcbiAgICAgIGxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2FsbEFjdGlvbkxpc3RlbmVyczxBIGV4dGVuZHMga2V5b2YgQWN0aW9uTGlzdGVuZXJzPihcbiAgICBhY3Rpb246IEEsXG4gICAgLi4uYXJnczogUGFyYW1ldGVyczxOb25OdWxsYWJsZTxBY3Rpb25MaXN0ZW5lcnNbQV0+PlxuICApIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmFjdGlvbkxpc3RlbmVycy5nZXQoYWN0aW9uKTtcbiAgICBpZiAobGlzdGVuZXJzICYmIGxpc3RlbmVycy5zaXplID4gMCkge1xuICAgICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCAobGlzdGVuZXIgYXMgYW55KT8uKC4uLmFyZ3MpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNhcHR1cmVFeGNlcHRpb24oYEVycm9yIGNhbGxpbmcgYml0d2FyZGVuIGFjdGlvbiBsaXN0ZW5lciBmb3IgJHthY3Rpb259YCwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzaG93VG9hc3QgPSBhc3luYyAodG9hc3RPcHRzOiBUb2FzdC5PcHRpb25zKTogUHJvbWlzZTxUb2FzdCAmIHsgcmVzdG9yZTogKCkgPT4gUHJvbWlzZTx2b2lkPiB9PiA9PiB7XG4gICAgaWYgKHRoaXMudG9hc3RJbnN0YW5jZSkge1xuICAgICAgY29uc3QgcHJldmlvdXNTdGF0ZVRvYXN0T3B0czogVG9hc3QuT3B0aW9ucyA9IHtcbiAgICAgICAgbWVzc2FnZTogdGhpcy50b2FzdEluc3RhbmNlLm1lc3NhZ2UsXG4gICAgICAgIHRpdGxlOiB0aGlzLnRvYXN0SW5zdGFuY2UudGl0bGUsXG4gICAgICAgIHByaW1hcnlBY3Rpb246IHRoaXMudG9hc3RJbnN0YW5jZS5wcmltYXJ5QWN0aW9uLFxuICAgICAgICBzZWNvbmRhcnlBY3Rpb246IHRoaXMudG9hc3RJbnN0YW5jZS5zZWNvbmRhcnlBY3Rpb24sXG4gICAgICB9O1xuXG4gICAgICBpZiAodG9hc3RPcHRzLnN0eWxlKSB0aGlzLnRvYXN0SW5zdGFuY2Uuc3R5bGUgPSB0b2FzdE9wdHMuc3R5bGU7XG4gICAgICB0aGlzLnRvYXN0SW5zdGFuY2UubWVzc2FnZSA9IHRvYXN0T3B0cy5tZXNzYWdlO1xuICAgICAgdGhpcy50b2FzdEluc3RhbmNlLnRpdGxlID0gdG9hc3RPcHRzLnRpdGxlO1xuICAgICAgdGhpcy50b2FzdEluc3RhbmNlLnByaW1hcnlBY3Rpb24gPSB0b2FzdE9wdHMucHJpbWFyeUFjdGlvbjtcbiAgICAgIHRoaXMudG9hc3RJbnN0YW5jZS5zZWNvbmRhcnlBY3Rpb24gPSB0b2FzdE9wdHMuc2Vjb25kYXJ5QWN0aW9uO1xuICAgICAgYXdhaXQgdGhpcy50b2FzdEluc3RhbmNlLnNob3coKTtcblxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24odGhpcy50b2FzdEluc3RhbmNlLCB7XG4gICAgICAgIHJlc3RvcmU6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLnNob3dUb2FzdChwcmV2aW91c1N0YXRlVG9hc3RPcHRzKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0b2FzdCA9IGF3YWl0IHNob3dUb2FzdCh0b2FzdE9wdHMpO1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24odG9hc3QsIHsgcmVzdG9yZTogKCkgPT4gdG9hc3QuaGlkZSgpIH0pO1xuICAgIH1cbiAgfTtcbn1cbiIsICJpbXBvcnQge0J1ZmZlcn0gZnJvbSAnbm9kZTpidWZmZXInO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCBjaGlsZFByb2Nlc3MgZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBwcm9jZXNzIGZyb20gJ25vZGU6cHJvY2Vzcyc7XG5pbXBvcnQgY3Jvc3NTcGF3biBmcm9tICdjcm9zcy1zcGF3bic7XG5pbXBvcnQgc3RyaXBGaW5hbE5ld2xpbmUgZnJvbSAnc3RyaXAtZmluYWwtbmV3bGluZSc7XG5pbXBvcnQge25wbVJ1blBhdGhFbnZ9IGZyb20gJ25wbS1ydW4tcGF0aCc7XG5pbXBvcnQgb25ldGltZSBmcm9tICdvbmV0aW1lJztcbmltcG9ydCB7bWFrZUVycm9yfSBmcm9tICcuL2xpYi9lcnJvci5qcyc7XG5pbXBvcnQge25vcm1hbGl6ZVN0ZGlvLCBub3JtYWxpemVTdGRpb05vZGV9IGZyb20gJy4vbGliL3N0ZGlvLmpzJztcbmltcG9ydCB7c3Bhd25lZEtpbGwsIHNwYXduZWRDYW5jZWwsIHNldHVwVGltZW91dCwgdmFsaWRhdGVUaW1lb3V0LCBzZXRFeGl0SGFuZGxlcn0gZnJvbSAnLi9saWIva2lsbC5qcyc7XG5pbXBvcnQge2hhbmRsZUlucHV0LCBnZXRTcGF3bmVkUmVzdWx0LCBtYWtlQWxsU3RyZWFtLCB2YWxpZGF0ZUlucHV0U3luY30gZnJvbSAnLi9saWIvc3RyZWFtLmpzJztcbmltcG9ydCB7bWVyZ2VQcm9taXNlLCBnZXRTcGF3bmVkUHJvbWlzZX0gZnJvbSAnLi9saWIvcHJvbWlzZS5qcyc7XG5pbXBvcnQge2pvaW5Db21tYW5kLCBwYXJzZUNvbW1hbmQsIGdldEVzY2FwZWRDb21tYW5kfSBmcm9tICcuL2xpYi9jb21tYW5kLmpzJztcblxuY29uc3QgREVGQVVMVF9NQVhfQlVGRkVSID0gMTAwMCAqIDEwMDAgKiAxMDA7XG5cbmNvbnN0IGdldEVudiA9ICh7ZW52OiBlbnZPcHRpb24sIGV4dGVuZEVudiwgcHJlZmVyTG9jYWwsIGxvY2FsRGlyLCBleGVjUGF0aH0pID0+IHtcblx0Y29uc3QgZW52ID0gZXh0ZW5kRW52ID8gey4uLnByb2Nlc3MuZW52LCAuLi5lbnZPcHRpb259IDogZW52T3B0aW9uO1xuXG5cdGlmIChwcmVmZXJMb2NhbCkge1xuXHRcdHJldHVybiBucG1SdW5QYXRoRW52KHtlbnYsIGN3ZDogbG9jYWxEaXIsIGV4ZWNQYXRofSk7XG5cdH1cblxuXHRyZXR1cm4gZW52O1xufTtcblxuY29uc3QgaGFuZGxlQXJndW1lbnRzID0gKGZpbGUsIGFyZ3MsIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRjb25zdCBwYXJzZWQgPSBjcm9zc1NwYXduLl9wYXJzZShmaWxlLCBhcmdzLCBvcHRpb25zKTtcblx0ZmlsZSA9IHBhcnNlZC5jb21tYW5kO1xuXHRhcmdzID0gcGFyc2VkLmFyZ3M7XG5cdG9wdGlvbnMgPSBwYXJzZWQub3B0aW9ucztcblxuXHRvcHRpb25zID0ge1xuXHRcdG1heEJ1ZmZlcjogREVGQVVMVF9NQVhfQlVGRkVSLFxuXHRcdGJ1ZmZlcjogdHJ1ZSxcblx0XHRzdHJpcEZpbmFsTmV3bGluZTogdHJ1ZSxcblx0XHRleHRlbmRFbnY6IHRydWUsXG5cdFx0cHJlZmVyTG9jYWw6IGZhbHNlLFxuXHRcdGxvY2FsRGlyOiBvcHRpb25zLmN3ZCB8fCBwcm9jZXNzLmN3ZCgpLFxuXHRcdGV4ZWNQYXRoOiBwcm9jZXNzLmV4ZWNQYXRoLFxuXHRcdGVuY29kaW5nOiAndXRmOCcsXG5cdFx0cmVqZWN0OiB0cnVlLFxuXHRcdGNsZWFudXA6IHRydWUsXG5cdFx0YWxsOiBmYWxzZSxcblx0XHR3aW5kb3dzSGlkZTogdHJ1ZSxcblx0XHQuLi5vcHRpb25zLFxuXHR9O1xuXG5cdG9wdGlvbnMuZW52ID0gZ2V0RW52KG9wdGlvbnMpO1xuXG5cdG9wdGlvbnMuc3RkaW8gPSBub3JtYWxpemVTdGRpbyhvcHRpb25zKTtcblxuXHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyAmJiBwYXRoLmJhc2VuYW1lKGZpbGUsICcuZXhlJykgPT09ICdjbWQnKSB7XG5cdFx0Ly8gIzExNlxuXHRcdGFyZ3MudW5zaGlmdCgnL3EnKTtcblx0fVxuXG5cdHJldHVybiB7ZmlsZSwgYXJncywgb3B0aW9ucywgcGFyc2VkfTtcbn07XG5cbmNvbnN0IGhhbmRsZU91dHB1dCA9IChvcHRpb25zLCB2YWx1ZSwgZXJyb3IpID0+IHtcblx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgJiYgIUJ1ZmZlci5pc0J1ZmZlcih2YWx1ZSkpIHtcblx0XHQvLyBXaGVuIGBleGVjYVN5bmMoKWAgZXJyb3JzLCB3ZSBub3JtYWxpemUgaXQgdG8gJycgdG8gbWltaWMgYGV4ZWNhKClgXG5cdFx0cmV0dXJuIGVycm9yID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiAnJztcblx0fVxuXG5cdGlmIChvcHRpb25zLnN0cmlwRmluYWxOZXdsaW5lKSB7XG5cdFx0cmV0dXJuIHN0cmlwRmluYWxOZXdsaW5lKHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjYShmaWxlLCBhcmdzLCBvcHRpb25zKSB7XG5cdGNvbnN0IHBhcnNlZCA9IGhhbmRsZUFyZ3VtZW50cyhmaWxlLCBhcmdzLCBvcHRpb25zKTtcblx0Y29uc3QgY29tbWFuZCA9IGpvaW5Db21tYW5kKGZpbGUsIGFyZ3MpO1xuXHRjb25zdCBlc2NhcGVkQ29tbWFuZCA9IGdldEVzY2FwZWRDb21tYW5kKGZpbGUsIGFyZ3MpO1xuXG5cdHZhbGlkYXRlVGltZW91dChwYXJzZWQub3B0aW9ucyk7XG5cblx0bGV0IHNwYXduZWQ7XG5cdHRyeSB7XG5cdFx0c3Bhd25lZCA9IGNoaWxkUHJvY2Vzcy5zcGF3bihwYXJzZWQuZmlsZSwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHQvLyBFbnN1cmUgdGhlIHJldHVybmVkIGVycm9yIGlzIGFsd2F5cyBib3RoIGEgcHJvbWlzZSBhbmQgYSBjaGlsZCBwcm9jZXNzXG5cdFx0Y29uc3QgZHVtbXlTcGF3bmVkID0gbmV3IGNoaWxkUHJvY2Vzcy5DaGlsZFByb2Nlc3MoKTtcblx0XHRjb25zdCBlcnJvclByb21pc2UgPSBQcm9taXNlLnJlamVjdChtYWtlRXJyb3Ioe1xuXHRcdFx0ZXJyb3IsXG5cdFx0XHRzdGRvdXQ6ICcnLFxuXHRcdFx0c3RkZXJyOiAnJyxcblx0XHRcdGFsbDogJycsXG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRwYXJzZWQsXG5cdFx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogZmFsc2UsXG5cdFx0fSkpO1xuXHRcdHJldHVybiBtZXJnZVByb21pc2UoZHVtbXlTcGF3bmVkLCBlcnJvclByb21pc2UpO1xuXHR9XG5cblx0Y29uc3Qgc3Bhd25lZFByb21pc2UgPSBnZXRTcGF3bmVkUHJvbWlzZShzcGF3bmVkKTtcblx0Y29uc3QgdGltZWRQcm9taXNlID0gc2V0dXBUaW1lb3V0KHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLCBzcGF3bmVkUHJvbWlzZSk7XG5cdGNvbnN0IHByb2Nlc3NEb25lID0gc2V0RXhpdEhhbmRsZXIoc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMsIHRpbWVkUHJvbWlzZSk7XG5cblx0Y29uc3QgY29udGV4dCA9IHtpc0NhbmNlbGVkOiBmYWxzZX07XG5cblx0c3Bhd25lZC5raWxsID0gc3Bhd25lZEtpbGwuYmluZChudWxsLCBzcGF3bmVkLmtpbGwuYmluZChzcGF3bmVkKSk7XG5cdHNwYXduZWQuY2FuY2VsID0gc3Bhd25lZENhbmNlbC5iaW5kKG51bGwsIHNwYXduZWQsIGNvbnRleHQpO1xuXG5cdGNvbnN0IGhhbmRsZVByb21pc2UgPSBhc3luYyAoKSA9PiB7XG5cdFx0Y29uc3QgW3tlcnJvciwgZXhpdENvZGUsIHNpZ25hbCwgdGltZWRPdXR9LCBzdGRvdXRSZXN1bHQsIHN0ZGVyclJlc3VsdCwgYWxsUmVzdWx0XSA9IGF3YWl0IGdldFNwYXduZWRSZXN1bHQoc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMsIHByb2Nlc3NEb25lKTtcblx0XHRjb25zdCBzdGRvdXQgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIHN0ZG91dFJlc3VsdCk7XG5cdFx0Y29uc3Qgc3RkZXJyID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCBzdGRlcnJSZXN1bHQpO1xuXHRcdGNvbnN0IGFsbCA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgYWxsUmVzdWx0KTtcblxuXHRcdGlmIChlcnJvciB8fCBleGl0Q29kZSAhPT0gMCB8fCBzaWduYWwgIT09IG51bGwpIHtcblx0XHRcdGNvbnN0IHJldHVybmVkRXJyb3IgPSBtYWtlRXJyb3Ioe1xuXHRcdFx0XHRlcnJvcixcblx0XHRcdFx0ZXhpdENvZGUsXG5cdFx0XHRcdHNpZ25hbCxcblx0XHRcdFx0c3Rkb3V0LFxuXHRcdFx0XHRzdGRlcnIsXG5cdFx0XHRcdGFsbCxcblx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRcdHBhcnNlZCxcblx0XHRcdFx0dGltZWRPdXQsXG5cdFx0XHRcdGlzQ2FuY2VsZWQ6IGNvbnRleHQuaXNDYW5jZWxlZCB8fCAocGFyc2VkLm9wdGlvbnMuc2lnbmFsID8gcGFyc2VkLm9wdGlvbnMuc2lnbmFsLmFib3J0ZWQgOiBmYWxzZSksXG5cdFx0XHRcdGtpbGxlZDogc3Bhd25lZC5raWxsZWQsXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKCFwYXJzZWQub3B0aW9ucy5yZWplY3QpIHtcblx0XHRcdFx0cmV0dXJuIHJldHVybmVkRXJyb3I7XG5cdFx0XHR9XG5cblx0XHRcdHRocm93IHJldHVybmVkRXJyb3I7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdGV4aXRDb2RlOiAwLFxuXHRcdFx0c3Rkb3V0LFxuXHRcdFx0c3RkZXJyLFxuXHRcdFx0YWxsLFxuXHRcdFx0ZmFpbGVkOiBmYWxzZSxcblx0XHRcdHRpbWVkT3V0OiBmYWxzZSxcblx0XHRcdGlzQ2FuY2VsZWQ6IGZhbHNlLFxuXHRcdFx0a2lsbGVkOiBmYWxzZSxcblx0XHR9O1xuXHR9O1xuXG5cdGNvbnN0IGhhbmRsZVByb21pc2VPbmNlID0gb25ldGltZShoYW5kbGVQcm9taXNlKTtcblxuXHRoYW5kbGVJbnB1dChzcGF3bmVkLCBwYXJzZWQub3B0aW9ucy5pbnB1dCk7XG5cblx0c3Bhd25lZC5hbGwgPSBtYWtlQWxsU3RyZWFtKHNwYXduZWQsIHBhcnNlZC5vcHRpb25zKTtcblxuXHRyZXR1cm4gbWVyZ2VQcm9taXNlKHNwYXduZWQsIGhhbmRsZVByb21pc2VPbmNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWNhU3luYyhmaWxlLCBhcmdzLCBvcHRpb25zKSB7XG5cdGNvbnN0IHBhcnNlZCA9IGhhbmRsZUFyZ3VtZW50cyhmaWxlLCBhcmdzLCBvcHRpb25zKTtcblx0Y29uc3QgY29tbWFuZCA9IGpvaW5Db21tYW5kKGZpbGUsIGFyZ3MpO1xuXHRjb25zdCBlc2NhcGVkQ29tbWFuZCA9IGdldEVzY2FwZWRDb21tYW5kKGZpbGUsIGFyZ3MpO1xuXG5cdHZhbGlkYXRlSW5wdXRTeW5jKHBhcnNlZC5vcHRpb25zKTtcblxuXHRsZXQgcmVzdWx0O1xuXHR0cnkge1xuXHRcdHJlc3VsdCA9IGNoaWxkUHJvY2Vzcy5zcGF3blN5bmMocGFyc2VkLmZpbGUsIHBhcnNlZC5hcmdzLCBwYXJzZWQub3B0aW9ucyk7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0dGhyb3cgbWFrZUVycm9yKHtcblx0XHRcdGVycm9yLFxuXHRcdFx0c3Rkb3V0OiAnJyxcblx0XHRcdHN0ZGVycjogJycsXG5cdFx0XHRhbGw6ICcnLFxuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0cGFyc2VkLFxuXHRcdFx0dGltZWRPdXQ6IGZhbHNlLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IGZhbHNlLFxuXHRcdH0pO1xuXHR9XG5cblx0Y29uc3Qgc3Rkb3V0ID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCByZXN1bHQuc3Rkb3V0LCByZXN1bHQuZXJyb3IpO1xuXHRjb25zdCBzdGRlcnIgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIHJlc3VsdC5zdGRlcnIsIHJlc3VsdC5lcnJvcik7XG5cblx0aWYgKHJlc3VsdC5lcnJvciB8fCByZXN1bHQuc3RhdHVzICE9PSAwIHx8IHJlc3VsdC5zaWduYWwgIT09IG51bGwpIHtcblx0XHRjb25zdCBlcnJvciA9IG1ha2VFcnJvcih7XG5cdFx0XHRzdGRvdXQsXG5cdFx0XHRzdGRlcnIsXG5cdFx0XHRlcnJvcjogcmVzdWx0LmVycm9yLFxuXHRcdFx0c2lnbmFsOiByZXN1bHQuc2lnbmFsLFxuXHRcdFx0ZXhpdENvZGU6IHJlc3VsdC5zdGF0dXMsXG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRwYXJzZWQsXG5cdFx0XHR0aW1lZE91dDogcmVzdWx0LmVycm9yICYmIHJlc3VsdC5lcnJvci5jb2RlID09PSAnRVRJTUVET1VUJyxcblx0XHRcdGlzQ2FuY2VsZWQ6IGZhbHNlLFxuXHRcdFx0a2lsbGVkOiByZXN1bHQuc2lnbmFsICE9PSBudWxsLFxuXHRcdH0pO1xuXG5cdFx0aWYgKCFwYXJzZWQub3B0aW9ucy5yZWplY3QpIHtcblx0XHRcdHJldHVybiBlcnJvcjtcblx0XHR9XG5cblx0XHR0aHJvdyBlcnJvcjtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Y29tbWFuZCxcblx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRleGl0Q29kZTogMCxcblx0XHRzdGRvdXQsXG5cdFx0c3RkZXJyLFxuXHRcdGZhaWxlZDogZmFsc2UsXG5cdFx0dGltZWRPdXQ6IGZhbHNlLFxuXHRcdGlzQ2FuY2VsZWQ6IGZhbHNlLFxuXHRcdGtpbGxlZDogZmFsc2UsXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjYUNvbW1hbmQoY29tbWFuZCwgb3B0aW9ucykge1xuXHRjb25zdCBbZmlsZSwgLi4uYXJnc10gPSBwYXJzZUNvbW1hbmQoY29tbWFuZCk7XG5cdHJldHVybiBleGVjYShmaWxlLCBhcmdzLCBvcHRpb25zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWNhQ29tbWFuZFN5bmMoY29tbWFuZCwgb3B0aW9ucykge1xuXHRjb25zdCBbZmlsZSwgLi4uYXJnc10gPSBwYXJzZUNvbW1hbmQoY29tbWFuZCk7XG5cdHJldHVybiBleGVjYVN5bmMoZmlsZSwgYXJncywgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjYU5vZGUoc2NyaXB0UGF0aCwgYXJncywgb3B0aW9ucyA9IHt9KSB7XG5cdGlmIChhcmdzICYmICFBcnJheS5pc0FycmF5KGFyZ3MpICYmIHR5cGVvZiBhcmdzID09PSAnb2JqZWN0Jykge1xuXHRcdG9wdGlvbnMgPSBhcmdzO1xuXHRcdGFyZ3MgPSBbXTtcblx0fVxuXG5cdGNvbnN0IHN0ZGlvID0gbm9ybWFsaXplU3RkaW9Ob2RlKG9wdGlvbnMpO1xuXHRjb25zdCBkZWZhdWx0RXhlY0FyZ3YgPSBwcm9jZXNzLmV4ZWNBcmd2LmZpbHRlcihhcmcgPT4gIWFyZy5zdGFydHNXaXRoKCctLWluc3BlY3QnKSk7XG5cblx0Y29uc3Qge1xuXHRcdG5vZGVQYXRoID0gcHJvY2Vzcy5leGVjUGF0aCxcblx0XHRub2RlT3B0aW9ucyA9IGRlZmF1bHRFeGVjQXJndixcblx0fSA9IG9wdGlvbnM7XG5cblx0cmV0dXJuIGV4ZWNhKFxuXHRcdG5vZGVQYXRoLFxuXHRcdFtcblx0XHRcdC4uLm5vZGVPcHRpb25zLFxuXHRcdFx0c2NyaXB0UGF0aCxcblx0XHRcdC4uLihBcnJheS5pc0FycmF5KGFyZ3MpID8gYXJncyA6IFtdKSxcblx0XHRdLFxuXHRcdHtcblx0XHRcdC4uLm9wdGlvbnMsXG5cdFx0XHRzdGRpbjogdW5kZWZpbmVkLFxuXHRcdFx0c3Rkb3V0OiB1bmRlZmluZWQsXG5cdFx0XHRzdGRlcnI6IHVuZGVmaW5lZCxcblx0XHRcdHN0ZGlvLFxuXHRcdFx0c2hlbGw6IGZhbHNlLFxuXHRcdH0sXG5cdCk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3RyaXBGaW5hbE5ld2xpbmUoaW5wdXQpIHtcblx0Y29uc3QgTEYgPSB0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnID8gJ1xcbicgOiAnXFxuJy5jaGFyQ29kZUF0KCk7XG5cdGNvbnN0IENSID0gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/ICdcXHInIDogJ1xccicuY2hhckNvZGVBdCgpO1xuXG5cdGlmIChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA9PT0gTEYpIHtcblx0XHRpbnB1dCA9IGlucHV0LnNsaWNlKDAsIC0xKTtcblx0fVxuXG5cdGlmIChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA9PT0gQ1IpIHtcblx0XHRpbnB1dCA9IGlucHV0LnNsaWNlKDAsIC0xKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cbiIsICJpbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB1cmwgZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHBhdGhLZXkgZnJvbSAncGF0aC1rZXknO1xuXG5leHBvcnQgZnVuY3Rpb24gbnBtUnVuUGF0aChvcHRpb25zID0ge30pIHtcblx0Y29uc3Qge1xuXHRcdGN3ZCA9IHByb2Nlc3MuY3dkKCksXG5cdFx0cGF0aDogcGF0aF8gPSBwcm9jZXNzLmVudltwYXRoS2V5KCldLFxuXHRcdGV4ZWNQYXRoID0gcHJvY2Vzcy5leGVjUGF0aCxcblx0fSA9IG9wdGlvbnM7XG5cblx0bGV0IHByZXZpb3VzO1xuXHRjb25zdCBjd2RTdHJpbmcgPSBjd2QgaW5zdGFuY2VvZiBVUkwgPyB1cmwuZmlsZVVSTFRvUGF0aChjd2QpIDogY3dkO1xuXHRsZXQgY3dkUGF0aCA9IHBhdGgucmVzb2x2ZShjd2RTdHJpbmcpO1xuXHRjb25zdCByZXN1bHQgPSBbXTtcblxuXHR3aGlsZSAocHJldmlvdXMgIT09IGN3ZFBhdGgpIHtcblx0XHRyZXN1bHQucHVzaChwYXRoLmpvaW4oY3dkUGF0aCwgJ25vZGVfbW9kdWxlcy8uYmluJykpO1xuXHRcdHByZXZpb3VzID0gY3dkUGF0aDtcblx0XHRjd2RQYXRoID0gcGF0aC5yZXNvbHZlKGN3ZFBhdGgsICcuLicpO1xuXHR9XG5cblx0Ly8gRW5zdXJlIHRoZSBydW5uaW5nIGBub2RlYCBiaW5hcnkgaXMgdXNlZC5cblx0cmVzdWx0LnB1c2gocGF0aC5yZXNvbHZlKGN3ZFN0cmluZywgZXhlY1BhdGgsICcuLicpKTtcblxuXHRyZXR1cm4gWy4uLnJlc3VsdCwgcGF0aF9dLmpvaW4ocGF0aC5kZWxpbWl0ZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbnBtUnVuUGF0aEVudih7ZW52ID0gcHJvY2Vzcy5lbnYsIC4uLm9wdGlvbnN9ID0ge30pIHtcblx0ZW52ID0gey4uLmVudn07XG5cblx0Y29uc3QgcGF0aCA9IHBhdGhLZXkoe2Vudn0pO1xuXHRvcHRpb25zLnBhdGggPSBlbnZbcGF0aF07XG5cdGVudltwYXRoXSA9IG5wbVJ1blBhdGgob3B0aW9ucyk7XG5cblx0cmV0dXJuIGVudjtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXRoS2V5KG9wdGlvbnMgPSB7fSkge1xuXHRjb25zdCB7XG5cdFx0ZW52ID0gcHJvY2Vzcy5lbnYsXG5cdFx0cGxhdGZvcm0gPSBwcm9jZXNzLnBsYXRmb3JtXG5cdH0gPSBvcHRpb25zO1xuXG5cdGlmIChwbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuXHRcdHJldHVybiAnUEFUSCc7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0LmtleXMoZW52KS5yZXZlcnNlKCkuZmluZChrZXkgPT4ga2V5LnRvVXBwZXJDYXNlKCkgPT09ICdQQVRIJykgfHwgJ1BhdGgnO1xufVxuIiwgImNvbnN0IGNvcHlQcm9wZXJ0eSA9ICh0bywgZnJvbSwgcHJvcGVydHksIGlnbm9yZU5vbkNvbmZpZ3VyYWJsZSkgPT4ge1xuXHQvLyBgRnVuY3Rpb24jbGVuZ3RoYCBzaG91bGQgcmVmbGVjdCB0aGUgcGFyYW1ldGVycyBvZiBgdG9gIG5vdCBgZnJvbWAgc2luY2Ugd2Uga2VlcCBpdHMgYm9keS5cblx0Ly8gYEZ1bmN0aW9uI3Byb3RvdHlwZWAgaXMgbm9uLXdyaXRhYmxlIGFuZCBub24tY29uZmlndXJhYmxlIHNvIGNhbiBuZXZlciBiZSBtb2RpZmllZC5cblx0aWYgKHByb3BlcnR5ID09PSAnbGVuZ3RoJyB8fCBwcm9wZXJ0eSA9PT0gJ3Byb3RvdHlwZScpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyBgRnVuY3Rpb24jYXJndW1lbnRzYCBhbmQgYEZ1bmN0aW9uI2NhbGxlcmAgc2hvdWxkIG5vdCBiZSBjb3BpZWQuIFRoZXkgd2VyZSByZXBvcnRlZCB0byBiZSBwcmVzZW50IGluIGBSZWZsZWN0Lm93bktleXNgIGZvciBzb21lIGRldmljZXMgaW4gUmVhY3QgTmF0aXZlICgjNDEpLCBzbyB3ZSBleHBsaWNpdGx5IGlnbm9yZSB0aGVtIGhlcmUuXG5cdGlmIChwcm9wZXJ0eSA9PT0gJ2FyZ3VtZW50cycgfHwgcHJvcGVydHkgPT09ICdjYWxsZXInKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgdG9EZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0bywgcHJvcGVydHkpO1xuXHRjb25zdCBmcm9tRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZnJvbSwgcHJvcGVydHkpO1xuXG5cdGlmICghY2FuQ29weVByb3BlcnR5KHRvRGVzY3JpcHRvciwgZnJvbURlc2NyaXB0b3IpICYmIGlnbm9yZU5vbkNvbmZpZ3VyYWJsZSkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0bywgcHJvcGVydHksIGZyb21EZXNjcmlwdG9yKTtcbn07XG5cbi8vIGBPYmplY3QuZGVmaW5lUHJvcGVydHkoKWAgdGhyb3dzIGlmIHRoZSBwcm9wZXJ0eSBleGlzdHMsIGlzIG5vdCBjb25maWd1cmFibGUgYW5kIGVpdGhlcjpcbi8vIC0gb25lIGl0cyBkZXNjcmlwdG9ycyBpcyBjaGFuZ2VkXG4vLyAtIGl0IGlzIG5vbi13cml0YWJsZSBhbmQgaXRzIHZhbHVlIGlzIGNoYW5nZWRcbmNvbnN0IGNhbkNvcHlQcm9wZXJ0eSA9IGZ1bmN0aW9uICh0b0Rlc2NyaXB0b3IsIGZyb21EZXNjcmlwdG9yKSB7XG5cdHJldHVybiB0b0Rlc2NyaXB0b3IgPT09IHVuZGVmaW5lZCB8fCB0b0Rlc2NyaXB0b3IuY29uZmlndXJhYmxlIHx8IChcblx0XHR0b0Rlc2NyaXB0b3Iud3JpdGFibGUgPT09IGZyb21EZXNjcmlwdG9yLndyaXRhYmxlICYmXG5cdFx0dG9EZXNjcmlwdG9yLmVudW1lcmFibGUgPT09IGZyb21EZXNjcmlwdG9yLmVudW1lcmFibGUgJiZcblx0XHR0b0Rlc2NyaXB0b3IuY29uZmlndXJhYmxlID09PSBmcm9tRGVzY3JpcHRvci5jb25maWd1cmFibGUgJiZcblx0XHQodG9EZXNjcmlwdG9yLndyaXRhYmxlIHx8IHRvRGVzY3JpcHRvci52YWx1ZSA9PT0gZnJvbURlc2NyaXB0b3IudmFsdWUpXG5cdCk7XG59O1xuXG5jb25zdCBjaGFuZ2VQcm90b3R5cGUgPSAodG8sIGZyb20pID0+IHtcblx0Y29uc3QgZnJvbVByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihmcm9tKTtcblx0aWYgKGZyb21Qcm90b3R5cGUgPT09IE9iamVjdC5nZXRQcm90b3R5cGVPZih0bykpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRPYmplY3Quc2V0UHJvdG90eXBlT2YodG8sIGZyb21Qcm90b3R5cGUpO1xufTtcblxuY29uc3Qgd3JhcHBlZFRvU3RyaW5nID0gKHdpdGhOYW1lLCBmcm9tQm9keSkgPT4gYC8qIFdyYXBwZWQgJHt3aXRoTmFtZX0qL1xcbiR7ZnJvbUJvZHl9YDtcblxuY29uc3QgdG9TdHJpbmdEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihGdW5jdGlvbi5wcm90b3R5cGUsICd0b1N0cmluZycpO1xuY29uc3QgdG9TdHJpbmdOYW1lID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcsICduYW1lJyk7XG5cbi8vIFdlIGNhbGwgYGZyb20udG9TdHJpbmcoKWAgZWFybHkgKG5vdCBsYXppbHkpIHRvIGVuc3VyZSBgZnJvbWAgY2FuIGJlIGdhcmJhZ2UgY29sbGVjdGVkLlxuLy8gV2UgdXNlIGBiaW5kKClgIGluc3RlYWQgb2YgYSBjbG9zdXJlIGZvciB0aGUgc2FtZSByZWFzb24uXG4vLyBDYWxsaW5nIGBmcm9tLnRvU3RyaW5nKClgIGVhcmx5IGFsc28gYWxsb3dzIGNhY2hpbmcgaXQgaW4gY2FzZSBgdG8udG9TdHJpbmcoKWAgaXMgY2FsbGVkIHNldmVyYWwgdGltZXMuXG5jb25zdCBjaGFuZ2VUb1N0cmluZyA9ICh0bywgZnJvbSwgbmFtZSkgPT4ge1xuXHRjb25zdCB3aXRoTmFtZSA9IG5hbWUgPT09ICcnID8gJycgOiBgd2l0aCAke25hbWUudHJpbSgpfSgpIGA7XG5cdGNvbnN0IG5ld1RvU3RyaW5nID0gd3JhcHBlZFRvU3RyaW5nLmJpbmQobnVsbCwgd2l0aE5hbWUsIGZyb20udG9TdHJpbmcoKSk7XG5cdC8vIEVuc3VyZSBgdG8udG9TdHJpbmcudG9TdHJpbmdgIGlzIG5vbi1lbnVtZXJhYmxlIGFuZCBoYXMgdGhlIHNhbWUgYHNhbWVgXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXdUb1N0cmluZywgJ25hbWUnLCB0b1N0cmluZ05hbWUpO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodG8sICd0b1N0cmluZycsIHsuLi50b1N0cmluZ0Rlc2NyaXB0b3IsIHZhbHVlOiBuZXdUb1N0cmluZ30pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWltaWNGdW5jdGlvbih0bywgZnJvbSwge2lnbm9yZU5vbkNvbmZpZ3VyYWJsZSA9IGZhbHNlfSA9IHt9KSB7XG5cdGNvbnN0IHtuYW1lfSA9IHRvO1xuXG5cdGZvciAoY29uc3QgcHJvcGVydHkgb2YgUmVmbGVjdC5vd25LZXlzKGZyb20pKSB7XG5cdFx0Y29weVByb3BlcnR5KHRvLCBmcm9tLCBwcm9wZXJ0eSwgaWdub3JlTm9uQ29uZmlndXJhYmxlKTtcblx0fVxuXG5cdGNoYW5nZVByb3RvdHlwZSh0bywgZnJvbSk7XG5cdGNoYW5nZVRvU3RyaW5nKHRvLCBmcm9tLCBuYW1lKTtcblxuXHRyZXR1cm4gdG87XG59XG4iLCAiaW1wb3J0IG1pbWljRnVuY3Rpb24gZnJvbSAnbWltaWMtZm4nO1xuXG5jb25zdCBjYWxsZWRGdW5jdGlvbnMgPSBuZXcgV2Vha01hcCgpO1xuXG5jb25zdCBvbmV0aW1lID0gKGZ1bmN0aW9uXywgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGlmICh0eXBlb2YgZnVuY3Rpb25fICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBmdW5jdGlvbicpO1xuXHR9XG5cblx0bGV0IHJldHVyblZhbHVlO1xuXHRsZXQgY2FsbENvdW50ID0gMDtcblx0Y29uc3QgZnVuY3Rpb25OYW1lID0gZnVuY3Rpb25fLmRpc3BsYXlOYW1lIHx8IGZ1bmN0aW9uXy5uYW1lIHx8ICc8YW5vbnltb3VzPic7XG5cblx0Y29uc3Qgb25ldGltZSA9IGZ1bmN0aW9uICguLi5hcmd1bWVudHNfKSB7XG5cdFx0Y2FsbGVkRnVuY3Rpb25zLnNldChvbmV0aW1lLCArK2NhbGxDb3VudCk7XG5cblx0XHRpZiAoY2FsbENvdW50ID09PSAxKSB7XG5cdFx0XHRyZXR1cm5WYWx1ZSA9IGZ1bmN0aW9uXy5hcHBseSh0aGlzLCBhcmd1bWVudHNfKTtcblx0XHRcdGZ1bmN0aW9uXyA9IG51bGw7XG5cdFx0fSBlbHNlIGlmIChvcHRpb25zLnRocm93ID09PSB0cnVlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEZ1bmN0aW9uIFxcYCR7ZnVuY3Rpb25OYW1lfVxcYCBjYW4gb25seSBiZSBjYWxsZWQgb25jZWApO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXR1cm5WYWx1ZTtcblx0fTtcblxuXHRtaW1pY0Z1bmN0aW9uKG9uZXRpbWUsIGZ1bmN0aW9uXyk7XG5cdGNhbGxlZEZ1bmN0aW9ucy5zZXQob25ldGltZSwgY2FsbENvdW50KTtcblxuXHRyZXR1cm4gb25ldGltZTtcbn07XG5cbm9uZXRpbWUuY2FsbENvdW50ID0gZnVuY3Rpb25fID0+IHtcblx0aWYgKCFjYWxsZWRGdW5jdGlvbnMuaGFzKGZ1bmN0aW9uXykpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYFRoZSBnaXZlbiBmdW5jdGlvbiBcXGAke2Z1bmN0aW9uXy5uYW1lfVxcYCBpcyBub3Qgd3JhcHBlZCBieSB0aGUgXFxgb25ldGltZVxcYCBwYWNrYWdlYCk7XG5cdH1cblxuXHRyZXR1cm4gY2FsbGVkRnVuY3Rpb25zLmdldChmdW5jdGlvbl8pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgb25ldGltZTtcbiIsICJpbXBvcnR7Y29uc3RhbnRzfWZyb21cIm5vZGU6b3NcIjtcblxuaW1wb3J0e1NJR1JUTUFYfWZyb21cIi4vcmVhbHRpbWUuanNcIjtcbmltcG9ydHtnZXRTaWduYWxzfWZyb21cIi4vc2lnbmFscy5qc1wiO1xuXG5cblxuY29uc3QgZ2V0U2lnbmFsc0J5TmFtZT1mdW5jdGlvbigpe1xuY29uc3Qgc2lnbmFscz1nZXRTaWduYWxzKCk7XG5yZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKHNpZ25hbHMubWFwKGdldFNpZ25hbEJ5TmFtZSkpO1xufTtcblxuY29uc3QgZ2V0U2lnbmFsQnlOYW1lPWZ1bmN0aW9uKHtcbm5hbWUsXG5udW1iZXIsXG5kZXNjcmlwdGlvbixcbnN1cHBvcnRlZCxcbmFjdGlvbixcbmZvcmNlZCxcbnN0YW5kYXJkfSlcbntcbnJldHVybltcbm5hbWUsXG57bmFtZSxudW1iZXIsZGVzY3JpcHRpb24sc3VwcG9ydGVkLGFjdGlvbixmb3JjZWQsc3RhbmRhcmR9XTtcblxufTtcblxuZXhwb3J0IGNvbnN0IHNpZ25hbHNCeU5hbWU9Z2V0U2lnbmFsc0J5TmFtZSgpO1xuXG5cblxuXG5jb25zdCBnZXRTaWduYWxzQnlOdW1iZXI9ZnVuY3Rpb24oKXtcbmNvbnN0IHNpZ25hbHM9Z2V0U2lnbmFscygpO1xuY29uc3QgbGVuZ3RoPVNJR1JUTUFYKzE7XG5jb25zdCBzaWduYWxzQT1BcnJheS5mcm9tKHtsZW5ndGh9LCh2YWx1ZSxudW1iZXIpPT5cbmdldFNpZ25hbEJ5TnVtYmVyKG51bWJlcixzaWduYWxzKSk7XG5cbnJldHVybiBPYmplY3QuYXNzaWduKHt9LC4uLnNpZ25hbHNBKTtcbn07XG5cbmNvbnN0IGdldFNpZ25hbEJ5TnVtYmVyPWZ1bmN0aW9uKG51bWJlcixzaWduYWxzKXtcbmNvbnN0IHNpZ25hbD1maW5kU2lnbmFsQnlOdW1iZXIobnVtYmVyLHNpZ25hbHMpO1xuXG5pZihzaWduYWw9PT11bmRlZmluZWQpe1xucmV0dXJue307XG59XG5cbmNvbnN0e25hbWUsZGVzY3JpcHRpb24sc3VwcG9ydGVkLGFjdGlvbixmb3JjZWQsc3RhbmRhcmR9PXNpZ25hbDtcbnJldHVybntcbltudW1iZXJdOntcbm5hbWUsXG5udW1iZXIsXG5kZXNjcmlwdGlvbixcbnN1cHBvcnRlZCxcbmFjdGlvbixcbmZvcmNlZCxcbnN0YW5kYXJkfX07XG5cblxufTtcblxuXG5cbmNvbnN0IGZpbmRTaWduYWxCeU51bWJlcj1mdW5jdGlvbihudW1iZXIsc2lnbmFscyl7XG5jb25zdCBzaWduYWw9c2lnbmFscy5maW5kKCh7bmFtZX0pPT5jb25zdGFudHMuc2lnbmFsc1tuYW1lXT09PW51bWJlcik7XG5cbmlmKHNpZ25hbCE9PXVuZGVmaW5lZCl7XG5yZXR1cm4gc2lnbmFsO1xufVxuXG5yZXR1cm4gc2lnbmFscy5maW5kKChzaWduYWxBKT0+c2lnbmFsQS5udW1iZXI9PT1udW1iZXIpO1xufTtcblxuZXhwb3J0IGNvbnN0IHNpZ25hbHNCeU51bWJlcj1nZXRTaWduYWxzQnlOdW1iZXIoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1haW4uanMubWFwIiwgIlxuZXhwb3J0IGNvbnN0IGdldFJlYWx0aW1lU2lnbmFscz1mdW5jdGlvbigpe1xuY29uc3QgbGVuZ3RoPVNJR1JUTUFYLVNJR1JUTUlOKzE7XG5yZXR1cm4gQXJyYXkuZnJvbSh7bGVuZ3RofSxnZXRSZWFsdGltZVNpZ25hbCk7XG59O1xuXG5jb25zdCBnZXRSZWFsdGltZVNpZ25hbD1mdW5jdGlvbih2YWx1ZSxpbmRleCl7XG5yZXR1cm57XG5uYW1lOmBTSUdSVCR7aW5kZXgrMX1gLFxubnVtYmVyOlNJR1JUTUlOK2luZGV4LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkFwcGxpY2F0aW9uLXNwZWNpZmljIHNpZ25hbCAocmVhbHRpbWUpXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9O1xuXG59O1xuXG5jb25zdCBTSUdSVE1JTj0zNDtcbmV4cG9ydCBjb25zdCBTSUdSVE1BWD02NDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlYWx0aW1lLmpzLm1hcCIsICJpbXBvcnR7Y29uc3RhbnRzfWZyb21cIm5vZGU6b3NcIjtcblxuaW1wb3J0e1NJR05BTFN9ZnJvbVwiLi9jb3JlLmpzXCI7XG5pbXBvcnR7Z2V0UmVhbHRpbWVTaWduYWxzfWZyb21cIi4vcmVhbHRpbWUuanNcIjtcblxuXG5cbmV4cG9ydCBjb25zdCBnZXRTaWduYWxzPWZ1bmN0aW9uKCl7XG5jb25zdCByZWFsdGltZVNpZ25hbHM9Z2V0UmVhbHRpbWVTaWduYWxzKCk7XG5jb25zdCBzaWduYWxzPVsuLi5TSUdOQUxTLC4uLnJlYWx0aW1lU2lnbmFsc10ubWFwKG5vcm1hbGl6ZVNpZ25hbCk7XG5yZXR1cm4gc2lnbmFscztcbn07XG5cblxuXG5cblxuXG5cbmNvbnN0IG5vcm1hbGl6ZVNpZ25hbD1mdW5jdGlvbih7XG5uYW1lLFxubnVtYmVyOmRlZmF1bHROdW1iZXIsXG5kZXNjcmlwdGlvbixcbmFjdGlvbixcbmZvcmNlZD1mYWxzZSxcbnN0YW5kYXJkfSlcbntcbmNvbnN0e1xuc2lnbmFsczp7W25hbWVdOmNvbnN0YW50U2lnbmFsfX09XG5jb25zdGFudHM7XG5jb25zdCBzdXBwb3J0ZWQ9Y29uc3RhbnRTaWduYWwhPT11bmRlZmluZWQ7XG5jb25zdCBudW1iZXI9c3VwcG9ydGVkP2NvbnN0YW50U2lnbmFsOmRlZmF1bHROdW1iZXI7XG5yZXR1cm57bmFtZSxudW1iZXIsZGVzY3JpcHRpb24sc3VwcG9ydGVkLGFjdGlvbixmb3JjZWQsc3RhbmRhcmR9O1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNpZ25hbHMuanMubWFwIiwgIlxuXG5leHBvcnQgY29uc3QgU0lHTkFMUz1bXG57XG5uYW1lOlwiU0lHSFVQXCIsXG5udW1iZXI6MSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUZXJtaW5hbCBjbG9zZWRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdJTlRcIixcbm51bWJlcjoyLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlVzZXIgaW50ZXJydXB0aW9uIHdpdGggQ1RSTC1DXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdRVUlUXCIsXG5udW1iZXI6MyxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiVXNlciBpbnRlcnJ1cHRpb24gd2l0aCBDVFJMLVxcXFxcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdJTExcIixcbm51bWJlcjo0LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJJbnZhbGlkIG1hY2hpbmUgaW5zdHJ1Y3Rpb25cIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR1RSQVBcIixcbm51bWJlcjo1LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJEZWJ1Z2dlciBicmVha3BvaW50XCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHQUJSVFwiLFxubnVtYmVyOjYsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkFib3J0ZWRcIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR0lPVFwiLFxubnVtYmVyOjYsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkFib3J0ZWRcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHQlVTXCIsXG5udW1iZXI6NyxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlxuXCJCdXMgZXJyb3IgZHVlIHRvIG1pc2FsaWduZWQsIG5vbi1leGlzdGluZyBhZGRyZXNzIG9yIHBhZ2luZyBlcnJvclwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdFTVRcIixcbm51bWJlcjo3LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkNvbW1hbmQgc2hvdWxkIGJlIGVtdWxhdGVkIGJ1dCBpcyBub3QgaW1wbGVtZW50ZWRcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdGUEVcIixcbm51bWJlcjo4LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJGbG9hdGluZyBwb2ludCBhcml0aG1ldGljIGVycm9yXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdLSUxMXCIsXG5udW1iZXI6OSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJGb3JjZWQgdGVybWluYXRpb25cIixcbnN0YW5kYXJkOlwicG9zaXhcIixcbmZvcmNlZDp0cnVlfSxcblxue1xubmFtZTpcIlNJR1VTUjFcIixcbm51bWJlcjoxMCxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJBcHBsaWNhdGlvbi1zcGVjaWZpYyBzaWduYWxcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdTRUdWXCIsXG5udW1iZXI6MTEsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIlNlZ21lbnRhdGlvbiBmYXVsdFwiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHVVNSMlwiLFxubnVtYmVyOjEyLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkFwcGxpY2F0aW9uLXNwZWNpZmljIHNpZ25hbFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR1BJUEVcIixcbm51bWJlcjoxMyxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJCcm9rZW4gcGlwZSBvciBzb2NrZXRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdBTFJNXCIsXG5udW1iZXI6MTQsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGltZW91dCBvciB0aW1lclwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR1RFUk1cIixcbm51bWJlcjoxNSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUZXJtaW5hdGlvblwiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHU1RLRkxUXCIsXG5udW1iZXI6MTYsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiU3RhY2sgaXMgZW1wdHkgb3Igb3ZlcmZsb3dlZFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR0NITERcIixcbm51bWJlcjoxNyxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJDaGlsZCBwcm9jZXNzIHRlcm1pbmF0ZWQsIHBhdXNlZCBvciB1bnBhdXNlZFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0NMRFwiLFxubnVtYmVyOjE3LFxuYWN0aW9uOlwiaWdub3JlXCIsXG5kZXNjcmlwdGlvbjpcIkNoaWxkIHByb2Nlc3MgdGVybWluYXRlZCwgcGF1c2VkIG9yIHVucGF1c2VkXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHQ09OVFwiLFxubnVtYmVyOjE4LFxuYWN0aW9uOlwidW5wYXVzZVwiLFxuZGVzY3JpcHRpb246XCJVbnBhdXNlZFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwiLFxuZm9yY2VkOnRydWV9LFxuXG57XG5uYW1lOlwiU0lHU1RPUFwiLFxubnVtYmVyOjE5LFxuYWN0aW9uOlwicGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiUGF1c2VkXCIsXG5zdGFuZGFyZDpcInBvc2l4XCIsXG5mb3JjZWQ6dHJ1ZX0sXG5cbntcbm5hbWU6XCJTSUdUU1RQXCIsXG5udW1iZXI6MjAsXG5hY3Rpb246XCJwYXVzZVwiLFxuZGVzY3JpcHRpb246XCJQYXVzZWQgdXNpbmcgQ1RSTC1aIG9yIFxcXCJzdXNwZW5kXFxcIlwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR1RUSU5cIixcbm51bWJlcjoyMSxcbmFjdGlvbjpcInBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIkJhY2tncm91bmQgcHJvY2VzcyBjYW5ub3QgcmVhZCB0ZXJtaW5hbCBpbnB1dFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0JSRUFLXCIsXG5udW1iZXI6MjEsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVXNlciBpbnRlcnJ1cHRpb24gd2l0aCBDVFJMLUJSRUFLXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHVFRPVVwiLFxubnVtYmVyOjIyLFxuYWN0aW9uOlwicGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiQmFja2dyb3VuZCBwcm9jZXNzIGNhbm5vdCB3cml0ZSB0byB0ZXJtaW5hbCBvdXRwdXRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdVUkdcIixcbm51bWJlcjoyMyxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJTb2NrZXQgcmVjZWl2ZWQgb3V0LW9mLWJhbmQgZGF0YVwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdYQ1BVXCIsXG5udW1iZXI6MjQsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIlByb2Nlc3MgdGltZWQgb3V0XCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1hGU1pcIixcbm51bWJlcjoyNSxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiRmlsZSB0b28gYmlnXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1ZUQUxSTVwiLFxubnVtYmVyOjI2LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlRpbWVvdXQgb3IgdGltZXJcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHUFJPRlwiLFxubnVtYmVyOjI3LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlRpbWVvdXQgb3IgdGltZXJcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHV0lOQ0hcIixcbm51bWJlcjoyOCxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJUZXJtaW5hbCB3aW5kb3cgc2l6ZSBjaGFuZ2VkXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR0lPXCIsXG5udW1iZXI6MjksXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiSS9PIGlzIGF2YWlsYWJsZVwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR1BPTExcIixcbm51bWJlcjoyOSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJXYXRjaGVkIGV2ZW50XCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHSU5GT1wiLFxubnVtYmVyOjI5LFxuYWN0aW9uOlwiaWdub3JlXCIsXG5kZXNjcmlwdGlvbjpcIlJlcXVlc3QgZm9yIHByb2Nlc3MgaW5mb3JtYXRpb25cIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdQV1JcIixcbm51bWJlcjozMCxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJEZXZpY2UgcnVubmluZyBvdXQgb2YgcG93ZXJcIixcbnN0YW5kYXJkOlwic3lzdGVtdlwifSxcblxue1xubmFtZTpcIlNJR1NZU1wiLFxubnVtYmVyOjMxLFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJJbnZhbGlkIHN5c3RlbSBjYWxsXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHVU5VU0VEXCIsXG5udW1iZXI6MzEsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiSW52YWxpZCBzeXN0ZW0gY2FsbFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifV07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb3JlLmpzLm1hcCIsICJpbXBvcnQge3NpZ25hbHNCeU5hbWV9IGZyb20gJ2h1bWFuLXNpZ25hbHMnO1xuXG5jb25zdCBnZXRFcnJvclByZWZpeCA9ICh7dGltZWRPdXQsIHRpbWVvdXQsIGVycm9yQ29kZSwgc2lnbmFsLCBzaWduYWxEZXNjcmlwdGlvbiwgZXhpdENvZGUsIGlzQ2FuY2VsZWR9KSA9PiB7XG5cdGlmICh0aW1lZE91dCkge1xuXHRcdHJldHVybiBgdGltZWQgb3V0IGFmdGVyICR7dGltZW91dH0gbWlsbGlzZWNvbmRzYDtcblx0fVxuXG5cdGlmIChpc0NhbmNlbGVkKSB7XG5cdFx0cmV0dXJuICd3YXMgY2FuY2VsZWQnO1xuXHR9XG5cblx0aWYgKGVycm9yQ29kZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGBmYWlsZWQgd2l0aCAke2Vycm9yQ29kZX1gO1xuXHR9XG5cblx0aWYgKHNpZ25hbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGB3YXMga2lsbGVkIHdpdGggJHtzaWduYWx9ICgke3NpZ25hbERlc2NyaXB0aW9ufSlgO1xuXHR9XG5cblx0aWYgKGV4aXRDb2RlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYGZhaWxlZCB3aXRoIGV4aXQgY29kZSAke2V4aXRDb2RlfWA7XG5cdH1cblxuXHRyZXR1cm4gJ2ZhaWxlZCc7XG59O1xuXG5leHBvcnQgY29uc3QgbWFrZUVycm9yID0gKHtcblx0c3Rkb3V0LFxuXHRzdGRlcnIsXG5cdGFsbCxcblx0ZXJyb3IsXG5cdHNpZ25hbCxcblx0ZXhpdENvZGUsXG5cdGNvbW1hbmQsXG5cdGVzY2FwZWRDb21tYW5kLFxuXHR0aW1lZE91dCxcblx0aXNDYW5jZWxlZCxcblx0a2lsbGVkLFxuXHRwYXJzZWQ6IHtvcHRpb25zOiB7dGltZW91dH19LFxufSkgPT4ge1xuXHQvLyBgc2lnbmFsYCBhbmQgYGV4aXRDb2RlYCBlbWl0dGVkIG9uIGBzcGF3bmVkLm9uKCdleGl0JylgIGV2ZW50IGNhbiBiZSBgbnVsbGAuXG5cdC8vIFdlIG5vcm1hbGl6ZSB0aGVtIHRvIGB1bmRlZmluZWRgXG5cdGV4aXRDb2RlID0gZXhpdENvZGUgPT09IG51bGwgPyB1bmRlZmluZWQgOiBleGl0Q29kZTtcblx0c2lnbmFsID0gc2lnbmFsID09PSBudWxsID8gdW5kZWZpbmVkIDogc2lnbmFsO1xuXHRjb25zdCBzaWduYWxEZXNjcmlwdGlvbiA9IHNpZ25hbCA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogc2lnbmFsc0J5TmFtZVtzaWduYWxdLmRlc2NyaXB0aW9uO1xuXG5cdGNvbnN0IGVycm9yQ29kZSA9IGVycm9yICYmIGVycm9yLmNvZGU7XG5cblx0Y29uc3QgcHJlZml4ID0gZ2V0RXJyb3JQcmVmaXgoe3RpbWVkT3V0LCB0aW1lb3V0LCBlcnJvckNvZGUsIHNpZ25hbCwgc2lnbmFsRGVzY3JpcHRpb24sIGV4aXRDb2RlLCBpc0NhbmNlbGVkfSk7XG5cdGNvbnN0IGV4ZWNhTWVzc2FnZSA9IGBDb21tYW5kICR7cHJlZml4fTogJHtjb21tYW5kfWA7XG5cdGNvbnN0IGlzRXJyb3IgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZXJyb3IpID09PSAnW29iamVjdCBFcnJvcl0nO1xuXHRjb25zdCBzaG9ydE1lc3NhZ2UgPSBpc0Vycm9yID8gYCR7ZXhlY2FNZXNzYWdlfVxcbiR7ZXJyb3IubWVzc2FnZX1gIDogZXhlY2FNZXNzYWdlO1xuXHRjb25zdCBtZXNzYWdlID0gW3Nob3J0TWVzc2FnZSwgc3RkZXJyLCBzdGRvdXRdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcblxuXHRpZiAoaXNFcnJvcikge1xuXHRcdGVycm9yLm9yaWdpbmFsTWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG5cdFx0ZXJyb3IubWVzc2FnZSA9IG1lc3NhZ2U7XG5cdH0gZWxzZSB7XG5cdFx0ZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG5cdH1cblxuXHRlcnJvci5zaG9ydE1lc3NhZ2UgPSBzaG9ydE1lc3NhZ2U7XG5cdGVycm9yLmNvbW1hbmQgPSBjb21tYW5kO1xuXHRlcnJvci5lc2NhcGVkQ29tbWFuZCA9IGVzY2FwZWRDb21tYW5kO1xuXHRlcnJvci5leGl0Q29kZSA9IGV4aXRDb2RlO1xuXHRlcnJvci5zaWduYWwgPSBzaWduYWw7XG5cdGVycm9yLnNpZ25hbERlc2NyaXB0aW9uID0gc2lnbmFsRGVzY3JpcHRpb247XG5cdGVycm9yLnN0ZG91dCA9IHN0ZG91dDtcblx0ZXJyb3Iuc3RkZXJyID0gc3RkZXJyO1xuXG5cdGlmIChhbGwgIT09IHVuZGVmaW5lZCkge1xuXHRcdGVycm9yLmFsbCA9IGFsbDtcblx0fVxuXG5cdGlmICgnYnVmZmVyZWREYXRhJyBpbiBlcnJvcikge1xuXHRcdGRlbGV0ZSBlcnJvci5idWZmZXJlZERhdGE7XG5cdH1cblxuXHRlcnJvci5mYWlsZWQgPSB0cnVlO1xuXHRlcnJvci50aW1lZE91dCA9IEJvb2xlYW4odGltZWRPdXQpO1xuXHRlcnJvci5pc0NhbmNlbGVkID0gaXNDYW5jZWxlZDtcblx0ZXJyb3Iua2lsbGVkID0ga2lsbGVkICYmICF0aW1lZE91dDtcblxuXHRyZXR1cm4gZXJyb3I7XG59O1xuIiwgImNvbnN0IGFsaWFzZXMgPSBbJ3N0ZGluJywgJ3N0ZG91dCcsICdzdGRlcnInXTtcblxuY29uc3QgaGFzQWxpYXMgPSBvcHRpb25zID0+IGFsaWFzZXMuc29tZShhbGlhcyA9PiBvcHRpb25zW2FsaWFzXSAhPT0gdW5kZWZpbmVkKTtcblxuZXhwb3J0IGNvbnN0IG5vcm1hbGl6ZVN0ZGlvID0gb3B0aW9ucyA9PiB7XG5cdGlmICghb3B0aW9ucykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHtzdGRpb30gPSBvcHRpb25zO1xuXG5cdGlmIChzdGRpbyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGFsaWFzZXMubWFwKGFsaWFzID0+IG9wdGlvbnNbYWxpYXNdKTtcblx0fVxuXG5cdGlmIChoYXNBbGlhcyhvcHRpb25zKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgSXQncyBub3QgcG9zc2libGUgdG8gcHJvdmlkZSBcXGBzdGRpb1xcYCBpbiBjb21iaW5hdGlvbiB3aXRoIG9uZSBvZiAke2FsaWFzZXMubWFwKGFsaWFzID0+IGBcXGAke2FsaWFzfVxcYGApLmpvaW4oJywgJyl9YCk7XG5cdH1cblxuXHRpZiAodHlwZW9mIHN0ZGlvID09PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiBzdGRpbztcblx0fVxuXG5cdGlmICghQXJyYXkuaXNBcnJheShzdGRpbykpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBzdGRpb1xcYCB0byBiZSBvZiB0eXBlIFxcYHN0cmluZ1xcYCBvciBcXGBBcnJheVxcYCwgZ290IFxcYCR7dHlwZW9mIHN0ZGlvfVxcYGApO1xuXHR9XG5cblx0Y29uc3QgbGVuZ3RoID0gTWF0aC5tYXgoc3RkaW8ubGVuZ3RoLCBhbGlhc2VzLmxlbmd0aCk7XG5cdHJldHVybiBBcnJheS5mcm9tKHtsZW5ndGh9LCAodmFsdWUsIGluZGV4KSA9PiBzdGRpb1tpbmRleF0pO1xufTtcblxuLy8gYGlwY2AgaXMgcHVzaGVkIHVubGVzcyBpdCBpcyBhbHJlYWR5IHByZXNlbnRcbmV4cG9ydCBjb25zdCBub3JtYWxpemVTdGRpb05vZGUgPSBvcHRpb25zID0+IHtcblx0Y29uc3Qgc3RkaW8gPSBub3JtYWxpemVTdGRpbyhvcHRpb25zKTtcblxuXHRpZiAoc3RkaW8gPT09ICdpcGMnKSB7XG5cdFx0cmV0dXJuICdpcGMnO1xuXHR9XG5cblx0aWYgKHN0ZGlvID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHN0ZGlvID09PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiBbc3RkaW8sIHN0ZGlvLCBzdGRpbywgJ2lwYyddO1xuXHR9XG5cblx0aWYgKHN0ZGlvLmluY2x1ZGVzKCdpcGMnKSkge1xuXHRcdHJldHVybiBzdGRpbztcblx0fVxuXG5cdHJldHVybiBbLi4uc3RkaW8sICdpcGMnXTtcbn07XG4iLCAiaW1wb3J0IG9zIGZyb20gJ25vZGU6b3MnO1xuaW1wb3J0IG9uRXhpdCBmcm9tICdzaWduYWwtZXhpdCc7XG5cbmNvbnN0IERFRkFVTFRfRk9SQ0VfS0lMTF9USU1FT1VUID0gMTAwMCAqIDU7XG5cbi8vIE1vbmtleS1wYXRjaGVzIGBjaGlsZFByb2Nlc3Mua2lsbCgpYCB0byBhZGQgYGZvcmNlS2lsbEFmdGVyVGltZW91dGAgYmVoYXZpb3JcbmV4cG9ydCBjb25zdCBzcGF3bmVkS2lsbCA9IChraWxsLCBzaWduYWwgPSAnU0lHVEVSTScsIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRjb25zdCBraWxsUmVzdWx0ID0ga2lsbChzaWduYWwpO1xuXHRzZXRLaWxsVGltZW91dChraWxsLCBzaWduYWwsIG9wdGlvbnMsIGtpbGxSZXN1bHQpO1xuXHRyZXR1cm4ga2lsbFJlc3VsdDtcbn07XG5cbmNvbnN0IHNldEtpbGxUaW1lb3V0ID0gKGtpbGwsIHNpZ25hbCwgb3B0aW9ucywga2lsbFJlc3VsdCkgPT4ge1xuXHRpZiAoIXNob3VsZEZvcmNlS2lsbChzaWduYWwsIG9wdGlvbnMsIGtpbGxSZXN1bHQpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgdGltZW91dCA9IGdldEZvcmNlS2lsbEFmdGVyVGltZW91dChvcHRpb25zKTtcblx0Y29uc3QgdCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdGtpbGwoJ1NJR0tJTEwnKTtcblx0fSwgdGltZW91dCk7XG5cblx0Ly8gR3VhcmRlZCBiZWNhdXNlIHRoZXJlJ3Mgbm8gYC51bnJlZigpYCB3aGVuIGBleGVjYWAgaXMgdXNlZCBpbiB0aGUgcmVuZGVyZXJcblx0Ly8gcHJvY2VzcyBpbiBFbGVjdHJvbi4gVGhpcyBjYW5ub3QgYmUgdGVzdGVkIHNpbmNlIHdlIGRvbid0IHJ1biB0ZXN0cyBpblxuXHQvLyBFbGVjdHJvbi5cblx0Ly8gaXN0YW5idWwgaWdub3JlIGVsc2Vcblx0aWYgKHQudW5yZWYpIHtcblx0XHR0LnVucmVmKCk7XG5cdH1cbn07XG5cbmNvbnN0IHNob3VsZEZvcmNlS2lsbCA9IChzaWduYWwsIHtmb3JjZUtpbGxBZnRlclRpbWVvdXR9LCBraWxsUmVzdWx0KSA9PiBpc1NpZ3Rlcm0oc2lnbmFsKSAmJiBmb3JjZUtpbGxBZnRlclRpbWVvdXQgIT09IGZhbHNlICYmIGtpbGxSZXN1bHQ7XG5cbmNvbnN0IGlzU2lndGVybSA9IHNpZ25hbCA9PiBzaWduYWwgPT09IG9zLmNvbnN0YW50cy5zaWduYWxzLlNJR1RFUk1cblx0XHR8fCAodHlwZW9mIHNpZ25hbCA9PT0gJ3N0cmluZycgJiYgc2lnbmFsLnRvVXBwZXJDYXNlKCkgPT09ICdTSUdURVJNJyk7XG5cbmNvbnN0IGdldEZvcmNlS2lsbEFmdGVyVGltZW91dCA9ICh7Zm9yY2VLaWxsQWZ0ZXJUaW1lb3V0ID0gdHJ1ZX0pID0+IHtcblx0aWYgKGZvcmNlS2lsbEFmdGVyVGltZW91dCA9PT0gdHJ1ZSkge1xuXHRcdHJldHVybiBERUZBVUxUX0ZPUkNFX0tJTExfVElNRU9VVDtcblx0fVxuXG5cdGlmICghTnVtYmVyLmlzRmluaXRlKGZvcmNlS2lsbEFmdGVyVGltZW91dCkgfHwgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0IDwgMCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIHRoZSBcXGBmb3JjZUtpbGxBZnRlclRpbWVvdXRcXGAgb3B0aW9uIHRvIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXIsIGdvdCBcXGAke2ZvcmNlS2lsbEFmdGVyVGltZW91dH1cXGAgKCR7dHlwZW9mIGZvcmNlS2lsbEFmdGVyVGltZW91dH0pYCk7XG5cdH1cblxuXHRyZXR1cm4gZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0O1xufTtcblxuLy8gYGNoaWxkUHJvY2Vzcy5jYW5jZWwoKWBcbmV4cG9ydCBjb25zdCBzcGF3bmVkQ2FuY2VsID0gKHNwYXduZWQsIGNvbnRleHQpID0+IHtcblx0Y29uc3Qga2lsbFJlc3VsdCA9IHNwYXduZWQua2lsbCgpO1xuXG5cdGlmIChraWxsUmVzdWx0KSB7XG5cdFx0Y29udGV4dC5pc0NhbmNlbGVkID0gdHJ1ZTtcblx0fVxufTtcblxuY29uc3QgdGltZW91dEtpbGwgPSAoc3Bhd25lZCwgc2lnbmFsLCByZWplY3QpID0+IHtcblx0c3Bhd25lZC5raWxsKHNpZ25hbCk7XG5cdHJlamVjdChPYmplY3QuYXNzaWduKG5ldyBFcnJvcignVGltZWQgb3V0JyksIHt0aW1lZE91dDogdHJ1ZSwgc2lnbmFsfSkpO1xufTtcblxuLy8gYHRpbWVvdXRgIG9wdGlvbiBoYW5kbGluZ1xuZXhwb3J0IGNvbnN0IHNldHVwVGltZW91dCA9IChzcGF3bmVkLCB7dGltZW91dCwga2lsbFNpZ25hbCA9ICdTSUdURVJNJ30sIHNwYXduZWRQcm9taXNlKSA9PiB7XG5cdGlmICh0aW1lb3V0ID09PSAwIHx8IHRpbWVvdXQgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBzcGF3bmVkUHJvbWlzZTtcblx0fVxuXG5cdGxldCB0aW1lb3V0SWQ7XG5cdGNvbnN0IHRpbWVvdXRQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0dGltZW91dEtpbGwoc3Bhd25lZCwga2lsbFNpZ25hbCwgcmVqZWN0KTtcblx0XHR9LCB0aW1lb3V0KTtcblx0fSk7XG5cblx0Y29uc3Qgc2FmZVNwYXduZWRQcm9taXNlID0gc3Bhd25lZFByb21pc2UuZmluYWxseSgoKSA9PiB7XG5cdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cdH0pO1xuXG5cdHJldHVybiBQcm9taXNlLnJhY2UoW3RpbWVvdXRQcm9taXNlLCBzYWZlU3Bhd25lZFByb21pc2VdKTtcbn07XG5cbmV4cG9ydCBjb25zdCB2YWxpZGF0ZVRpbWVvdXQgPSAoe3RpbWVvdXR9KSA9PiB7XG5cdGlmICh0aW1lb3V0ICE9PSB1bmRlZmluZWQgJiYgKCFOdW1iZXIuaXNGaW5pdGUodGltZW91dCkgfHwgdGltZW91dCA8IDApKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgdGhlIFxcYHRpbWVvdXRcXGAgb3B0aW9uIHRvIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXIsIGdvdCBcXGAke3RpbWVvdXR9XFxgICgke3R5cGVvZiB0aW1lb3V0fSlgKTtcblx0fVxufTtcblxuLy8gYGNsZWFudXBgIG9wdGlvbiBoYW5kbGluZ1xuZXhwb3J0IGNvbnN0IHNldEV4aXRIYW5kbGVyID0gYXN5bmMgKHNwYXduZWQsIHtjbGVhbnVwLCBkZXRhY2hlZH0sIHRpbWVkUHJvbWlzZSkgPT4ge1xuXHRpZiAoIWNsZWFudXAgfHwgZGV0YWNoZWQpIHtcblx0XHRyZXR1cm4gdGltZWRQcm9taXNlO1xuXHR9XG5cblx0Y29uc3QgcmVtb3ZlRXhpdEhhbmRsZXIgPSBvbkV4aXQoKCkgPT4ge1xuXHRcdHNwYXduZWQua2lsbCgpO1xuXHR9KTtcblxuXHRyZXR1cm4gdGltZWRQcm9taXNlLmZpbmFsbHkoKCkgPT4ge1xuXHRcdHJlbW92ZUV4aXRIYW5kbGVyKCk7XG5cdH0pO1xufTtcbiIsICJleHBvcnQgZnVuY3Rpb24gaXNTdHJlYW0oc3RyZWFtKSB7XG5cdHJldHVybiBzdHJlYW0gIT09IG51bGxcblx0XHQmJiB0eXBlb2Ygc3RyZWFtID09PSAnb2JqZWN0J1xuXHRcdCYmIHR5cGVvZiBzdHJlYW0ucGlwZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzV3JpdGFibGVTdHJlYW0oc3RyZWFtKSB7XG5cdHJldHVybiBpc1N0cmVhbShzdHJlYW0pXG5cdFx0JiYgc3RyZWFtLndyaXRhYmxlICE9PSBmYWxzZVxuXHRcdCYmIHR5cGVvZiBzdHJlYW0uX3dyaXRlID09PSAnZnVuY3Rpb24nXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5fd3JpdGFibGVTdGF0ZSA9PT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlYWRhYmxlU3RyZWFtKHN0cmVhbSkge1xuXHRyZXR1cm4gaXNTdHJlYW0oc3RyZWFtKVxuXHRcdCYmIHN0cmVhbS5yZWFkYWJsZSAhPT0gZmFsc2Vcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLl9yZWFkID09PSAnZnVuY3Rpb24nXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5fcmVhZGFibGVTdGF0ZSA9PT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0R1cGxleFN0cmVhbShzdHJlYW0pIHtcblx0cmV0dXJuIGlzV3JpdGFibGVTdHJlYW0oc3RyZWFtKVxuXHRcdCYmIGlzUmVhZGFibGVTdHJlYW0oc3RyZWFtKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVHJhbnNmb3JtU3RyZWFtKHN0cmVhbSkge1xuXHRyZXR1cm4gaXNEdXBsZXhTdHJlYW0oc3RyZWFtKVxuXHRcdCYmIHR5cGVvZiBzdHJlYW0uX3RyYW5zZm9ybSA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsICJpbXBvcnQge2lzU3RyZWFtfSBmcm9tICdpcy1zdHJlYW0nO1xuaW1wb3J0IGdldFN0cmVhbSBmcm9tICdnZXQtc3RyZWFtJztcbmltcG9ydCBtZXJnZVN0cmVhbSBmcm9tICdtZXJnZS1zdHJlYW0nO1xuXG4vLyBgaW5wdXRgIG9wdGlvblxuZXhwb3J0IGNvbnN0IGhhbmRsZUlucHV0ID0gKHNwYXduZWQsIGlucHV0KSA9PiB7XG5cdGlmIChpbnB1dCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKGlzU3RyZWFtKGlucHV0KSkge1xuXHRcdGlucHV0LnBpcGUoc3Bhd25lZC5zdGRpbik7XG5cdH0gZWxzZSB7XG5cdFx0c3Bhd25lZC5zdGRpbi5lbmQoaW5wdXQpO1xuXHR9XG59O1xuXG4vLyBgYWxsYCBpbnRlcmxlYXZlcyBgc3Rkb3V0YCBhbmQgYHN0ZGVycmBcbmV4cG9ydCBjb25zdCBtYWtlQWxsU3RyZWFtID0gKHNwYXduZWQsIHthbGx9KSA9PiB7XG5cdGlmICghYWxsIHx8ICghc3Bhd25lZC5zdGRvdXQgJiYgIXNwYXduZWQuc3RkZXJyKSkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IG1peGVkID0gbWVyZ2VTdHJlYW0oKTtcblxuXHRpZiAoc3Bhd25lZC5zdGRvdXQpIHtcblx0XHRtaXhlZC5hZGQoc3Bhd25lZC5zdGRvdXQpO1xuXHR9XG5cblx0aWYgKHNwYXduZWQuc3RkZXJyKSB7XG5cdFx0bWl4ZWQuYWRkKHNwYXduZWQuc3RkZXJyKTtcblx0fVxuXG5cdHJldHVybiBtaXhlZDtcbn07XG5cbi8vIE9uIGZhaWx1cmUsIGByZXN1bHQuc3Rkb3V0fHN0ZGVycnxhbGxgIHNob3VsZCBjb250YWluIHRoZSBjdXJyZW50bHkgYnVmZmVyZWQgc3RyZWFtXG5jb25zdCBnZXRCdWZmZXJlZERhdGEgPSBhc3luYyAoc3RyZWFtLCBzdHJlYW1Qcm9taXNlKSA9PiB7XG5cdC8vIFdoZW4gYGJ1ZmZlcmAgaXMgYGZhbHNlYCwgYHN0cmVhbVByb21pc2VgIGlzIGB1bmRlZmluZWRgIGFuZCB0aGVyZSBpcyBubyBidWZmZXJlZCBkYXRhIHRvIHJldHJpZXZlXG5cdGlmICghc3RyZWFtIHx8IHN0cmVhbVByb21pc2UgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHN0cmVhbS5kZXN0cm95KCk7XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gYXdhaXQgc3RyZWFtUHJvbWlzZTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRyZXR1cm4gZXJyb3IuYnVmZmVyZWREYXRhO1xuXHR9XG59O1xuXG5jb25zdCBnZXRTdHJlYW1Qcm9taXNlID0gKHN0cmVhbSwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcn0pID0+IHtcblx0aWYgKCFzdHJlYW0gfHwgIWJ1ZmZlcikge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmIChlbmNvZGluZykge1xuXHRcdHJldHVybiBnZXRTdHJlYW0oc3RyZWFtLCB7ZW5jb2RpbmcsIG1heEJ1ZmZlcn0pO1xuXHR9XG5cblx0cmV0dXJuIGdldFN0cmVhbS5idWZmZXIoc3RyZWFtLCB7bWF4QnVmZmVyfSk7XG59O1xuXG4vLyBSZXRyaWV2ZSByZXN1bHQgb2YgY2hpbGQgcHJvY2VzczogZXhpdCBjb2RlLCBzaWduYWwsIGVycm9yLCBzdHJlYW1zIChzdGRvdXQvc3RkZXJyL2FsbClcbmV4cG9ydCBjb25zdCBnZXRTcGF3bmVkUmVzdWx0ID0gYXN5bmMgKHtzdGRvdXQsIHN0ZGVyciwgYWxsfSwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcn0sIHByb2Nlc3NEb25lKSA9PiB7XG5cdGNvbnN0IHN0ZG91dFByb21pc2UgPSBnZXRTdHJlYW1Qcm9taXNlKHN0ZG91dCwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcn0pO1xuXHRjb25zdCBzdGRlcnJQcm9taXNlID0gZ2V0U3RyZWFtUHJvbWlzZShzdGRlcnIsIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9KTtcblx0Y29uc3QgYWxsUHJvbWlzZSA9IGdldFN0cmVhbVByb21pc2UoYWxsLCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyOiBtYXhCdWZmZXIgKiAyfSk7XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoW3Byb2Nlc3NEb25lLCBzdGRvdXRQcm9taXNlLCBzdGRlcnJQcm9taXNlLCBhbGxQcm9taXNlXSk7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKFtcblx0XHRcdHtlcnJvciwgc2lnbmFsOiBlcnJvci5zaWduYWwsIHRpbWVkT3V0OiBlcnJvci50aW1lZE91dH0sXG5cdFx0XHRnZXRCdWZmZXJlZERhdGEoc3Rkb3V0LCBzdGRvdXRQcm9taXNlKSxcblx0XHRcdGdldEJ1ZmZlcmVkRGF0YShzdGRlcnIsIHN0ZGVyclByb21pc2UpLFxuXHRcdFx0Z2V0QnVmZmVyZWREYXRhKGFsbCwgYWxsUHJvbWlzZSksXG5cdFx0XSk7XG5cdH1cbn07XG5cbmV4cG9ydCBjb25zdCB2YWxpZGF0ZUlucHV0U3luYyA9ICh7aW5wdXR9KSA9PiB7XG5cdGlmIChpc1N0cmVhbShpbnB1dCkpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgYGlucHV0YCBvcHRpb24gY2Fubm90IGJlIGEgc3RyZWFtIGluIHN5bmMgbW9kZScpO1xuXHR9XG59O1xuIiwgIi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSB1bmljb3JuL3ByZWZlci10b3AtbGV2ZWwtYXdhaXRcbmNvbnN0IG5hdGl2ZVByb21pc2VQcm90b3R5cGUgPSAoYXN5bmMgKCkgPT4ge30pKCkuY29uc3RydWN0b3IucHJvdG90eXBlO1xuXG5jb25zdCBkZXNjcmlwdG9ycyA9IFsndGhlbicsICdjYXRjaCcsICdmaW5hbGx5J10ubWFwKHByb3BlcnR5ID0+IFtcblx0cHJvcGVydHksXG5cdFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG5hdGl2ZVByb21pc2VQcm90b3R5cGUsIHByb3BlcnR5KSxcbl0pO1xuXG4vLyBUaGUgcmV0dXJuIHZhbHVlIGlzIGEgbWl4aW4gb2YgYGNoaWxkUHJvY2Vzc2AgYW5kIGBQcm9taXNlYFxuZXhwb3J0IGNvbnN0IG1lcmdlUHJvbWlzZSA9IChzcGF3bmVkLCBwcm9taXNlKSA9PiB7XG5cdGZvciAoY29uc3QgW3Byb3BlcnR5LCBkZXNjcmlwdG9yXSBvZiBkZXNjcmlwdG9ycykge1xuXHRcdC8vIFN0YXJ0aW5nIHRoZSBtYWluIGBwcm9taXNlYCBpcyBkZWZlcnJlZCB0byBhdm9pZCBjb25zdW1pbmcgc3RyZWFtc1xuXHRcdGNvbnN0IHZhbHVlID0gdHlwZW9mIHByb21pc2UgPT09ICdmdW5jdGlvbidcblx0XHRcdD8gKC4uLmFyZ3MpID0+IFJlZmxlY3QuYXBwbHkoZGVzY3JpcHRvci52YWx1ZSwgcHJvbWlzZSgpLCBhcmdzKVxuXHRcdFx0OiBkZXNjcmlwdG9yLnZhbHVlLmJpbmQocHJvbWlzZSk7XG5cblx0XHRSZWZsZWN0LmRlZmluZVByb3BlcnR5KHNwYXduZWQsIHByb3BlcnR5LCB7Li4uZGVzY3JpcHRvciwgdmFsdWV9KTtcblx0fVxuXG5cdHJldHVybiBzcGF3bmVkO1xufTtcblxuLy8gVXNlIHByb21pc2VzIGluc3RlYWQgb2YgYGNoaWxkX3Byb2Nlc3NgIGV2ZW50c1xuZXhwb3J0IGNvbnN0IGdldFNwYXduZWRQcm9taXNlID0gc3Bhd25lZCA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdHNwYXduZWQub24oJ2V4aXQnLCAoZXhpdENvZGUsIHNpZ25hbCkgPT4ge1xuXHRcdHJlc29sdmUoe2V4aXRDb2RlLCBzaWduYWx9KTtcblx0fSk7XG5cblx0c3Bhd25lZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG5cdFx0cmVqZWN0KGVycm9yKTtcblx0fSk7XG5cblx0aWYgKHNwYXduZWQuc3RkaW4pIHtcblx0XHRzcGF3bmVkLnN0ZGluLm9uKCdlcnJvcicsIGVycm9yID0+IHtcblx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0fSk7XG5cdH1cbn0pO1xuIiwgImNvbnN0IG5vcm1hbGl6ZUFyZ3MgPSAoZmlsZSwgYXJncyA9IFtdKSA9PiB7XG5cdGlmICghQXJyYXkuaXNBcnJheShhcmdzKSkge1xuXHRcdHJldHVybiBbZmlsZV07XG5cdH1cblxuXHRyZXR1cm4gW2ZpbGUsIC4uLmFyZ3NdO1xufTtcblxuY29uc3QgTk9fRVNDQVBFX1JFR0VYUCA9IC9eW1xcdy4tXSskLztcbmNvbnN0IERPVUJMRV9RVU9URVNfUkVHRVhQID0gL1wiL2c7XG5cbmNvbnN0IGVzY2FwZUFyZyA9IGFyZyA9PiB7XG5cdGlmICh0eXBlb2YgYXJnICE9PSAnc3RyaW5nJyB8fCBOT19FU0NBUEVfUkVHRVhQLnRlc3QoYXJnKSkge1xuXHRcdHJldHVybiBhcmc7XG5cdH1cblxuXHRyZXR1cm4gYFwiJHthcmcucmVwbGFjZShET1VCTEVfUVVPVEVTX1JFR0VYUCwgJ1xcXFxcIicpfVwiYDtcbn07XG5cbmV4cG9ydCBjb25zdCBqb2luQ29tbWFuZCA9IChmaWxlLCBhcmdzKSA9PiBub3JtYWxpemVBcmdzKGZpbGUsIGFyZ3MpLmpvaW4oJyAnKTtcblxuZXhwb3J0IGNvbnN0IGdldEVzY2FwZWRDb21tYW5kID0gKGZpbGUsIGFyZ3MpID0+IG5vcm1hbGl6ZUFyZ3MoZmlsZSwgYXJncykubWFwKGFyZyA9PiBlc2NhcGVBcmcoYXJnKSkuam9pbignICcpO1xuXG5jb25zdCBTUEFDRVNfUkVHRVhQID0gLyArL2c7XG5cbi8vIEhhbmRsZSBgZXhlY2FDb21tYW5kKClgXG5leHBvcnQgY29uc3QgcGFyc2VDb21tYW5kID0gY29tbWFuZCA9PiB7XG5cdGNvbnN0IHRva2VucyA9IFtdO1xuXHRmb3IgKGNvbnN0IHRva2VuIG9mIGNvbW1hbmQudHJpbSgpLnNwbGl0KFNQQUNFU19SRUdFWFApKSB7XG5cdFx0Ly8gQWxsb3cgc3BhY2VzIHRvIGJlIGVzY2FwZWQgYnkgYSBiYWNrc2xhc2ggaWYgbm90IG1lYW50IGFzIGEgZGVsaW1pdGVyXG5cdFx0Y29uc3QgcHJldmlvdXNUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG5cdFx0aWYgKHByZXZpb3VzVG9rZW4gJiYgcHJldmlvdXNUb2tlbi5lbmRzV2l0aCgnXFxcXCcpKSB7XG5cdFx0XHQvLyBNZXJnZSBwcmV2aW91cyB0b2tlbiB3aXRoIGN1cnJlbnQgb25lXG5cdFx0XHR0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdID0gYCR7cHJldmlvdXNUb2tlbi5zbGljZSgwLCAtMSl9ICR7dG9rZW59YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dG9rZW5zLnB1c2godG9rZW4pO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0b2tlbnM7XG59O1xuIiwgIi8qIFB1dCBjb25zdGFudHMgdGhhdCB5b3UgZmVlbCBsaWtlIHRoZXkgc3RpbGwgZG9uJ3QgZGVzZXJ2ZSBhIGZpbGUgb2YgdGhlaXIgb3duIGhlcmUgKi9cblxuaW1wb3J0IHsgSWNvbiwgS2V5Ym9hcmQgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBJdGVtVHlwZSB9IGZyb20gXCJ+L3R5cGVzL3ZhdWx0XCI7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFUlZFUl9VUkwgPSBcImh0dHBzOi8vYml0d2FyZGVuLmNvbVwiO1xuXG5leHBvcnQgY29uc3QgU0VOU0lUSVZFX1ZBTFVFX1BMQUNFSE9MREVSID0gXCJISURERU4tVkFMVUVcIjtcblxuZXhwb3J0IGNvbnN0IExPQ0FMX1NUT1JBR0VfS0VZID0ge1xuICBQQVNTV09SRF9PUFRJT05TOiBcImJ3LWdlbmVyYXRlLXBhc3N3b3JkLW9wdGlvbnNcIixcbiAgUEFTU1dPUkRfT05FX1RJTUVfV0FSTklORzogXCJidy1nZW5lcmF0ZS1wYXNzd29yZC13YXJuaW5nLWFjY2VwdGVkXCIsXG4gIFNFU1NJT05fVE9LRU46IFwic2Vzc2lvblRva2VuXCIsXG4gIFJFUFJPTVBUX0hBU0g6IFwic2Vzc2lvblJlcHJvbXB0SGFzaFwiLFxuICBTRVJWRVJfVVJMOiBcImNsaVNlcnZlclwiLFxuICBMQVNUX0FDVElWSVRZX1RJTUU6IFwibGFzdEFjdGl2aXR5VGltZVwiLFxuICBWQVVMVF9MT0NLX1JFQVNPTjogXCJ2YXVsdExvY2tSZWFzb25cIixcbiAgVkFVTFRfRkFWT1JJVEVfT1JERVI6IFwidmF1bHRGYXZvcml0ZU9yZGVyXCIsXG4gIFZBVUxUX0xBU1RfU1RBVFVTOiBcImxhc3RWYXVsdFN0YXR1c1wiLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IFZBVUxUX0xPQ0tfTUVTU0FHRVMgPSB7XG4gIFRJTUVPVVQ6IFwiVmF1bHQgdGltZWQgb3V0IGR1ZSB0byBpbmFjdGl2aXR5XCIsXG4gIE1BTlVBTDogXCJNYW51YWxseSBsb2NrZWQgYnkgdGhlIHVzZXJcIixcbiAgU1lTVEVNX0xPQ0s6IFwiU2NyZWVuIHdhcyBsb2NrZWRcIixcbiAgU1lTVEVNX1NMRUVQOiBcIlN5c3RlbSB3ZW50IHRvIHNsZWVwXCIsXG4gIENMSV9VUERBVEVEOiBcIkJpdHdhcmRlbiBoYXMgYmVlbiB1cGRhdGVkLiBQbGVhc2UgbG9naW4gYWdhaW4uXCIsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgU0hPUlRDVVRfS0VZX1NFUVVFTkNFOiBLZXlib2FyZC5LZXlFcXVpdmFsZW50W10gPSBbXG4gIFwiMVwiLFxuICBcIjJcIixcbiAgXCIzXCIsXG4gIFwiNFwiLFxuICBcIjVcIixcbiAgXCI2XCIsXG4gIFwiN1wiLFxuICBcIjhcIixcbiAgXCI5XCIsXG4gIFwiYlwiLFxuICBcImNcIixcbiAgXCJkXCIsXG4gIFwiZVwiLFxuICBcImZcIixcbiAgXCJnXCIsXG4gIFwiaFwiLFxuICBcImlcIixcbiAgXCJqXCIsXG4gIFwia1wiLFxuICBcImxcIixcbiAgXCJtXCIsXG4gIFwiblwiLFxuICBcIm9cIixcbiAgXCJwXCIsXG4gIFwicVwiLFxuICBcInJcIixcbiAgXCJzXCIsXG4gIFwidFwiLFxuICBcInVcIixcbiAgXCJ2XCIsXG4gIFwid1wiLFxuICBcInhcIixcbiAgXCJ5XCIsXG4gIFwielwiLFxuICBcIitcIixcbiAgXCItXCIsXG4gIFwiLlwiLFxuICBcIixcIixcbl07XG5cbmV4cG9ydCBjb25zdCBGT0xERVJfT1BUSU9OUyA9IHtcbiAgQUxMOiBcImFsbFwiLFxuICBOT19GT0xERVI6IFwibm8tZm9sZGVyXCIsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgQ0FDSEVfS0VZUyA9IHtcbiAgSVY6IFwiaXZcIixcbiAgVkFVTFQ6IFwidmF1bHRcIixcbiAgQ1VSUkVOVF9GT0xERVJfSUQ6IFwiY3VycmVudEZvbGRlcklkXCIsXG4gIFNFTkRfVFlQRV9GSUxURVI6IFwic2VuZFR5cGVGaWx0ZXJcIixcbiAgQ0xJX1ZFUlNJT046IFwiY2xpVmVyc2lvblwiLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IElURU1fVFlQRV9UT19JQ09OX01BUDogUmVjb3JkPEl0ZW1UeXBlLCBJY29uPiA9IHtcbiAgW0l0ZW1UeXBlLkxPR0lOXTogSWNvbi5HbG9iZSxcbiAgW0l0ZW1UeXBlLkNBUkRdOiBJY29uLkNyZWRpdENhcmQsXG4gIFtJdGVtVHlwZS5JREVOVElUWV06IEljb24uUGVyc29uLFxuICBbSXRlbVR5cGUuTk9URV06IEljb24uRG9jdW1lbnQsXG4gIFtJdGVtVHlwZS5TU0hfS0VZXTogSWNvbi5LZXksXG59O1xuIiwgImltcG9ydCB7IExvY2FsU3RvcmFnZSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IHBia2RmMiB9IGZyb20gXCJjcnlwdG9cIjtcbmltcG9ydCB7IExPQ0FMX1NUT1JBR0VfS0VZIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcbmltcG9ydCB7IERFRkFVTFRfUEFTU1dPUkRfT1BUSU9OUywgUkVQUk9NUFRfSEFTSF9TQUxUIH0gZnJvbSBcIn4vY29uc3RhbnRzL3Bhc3N3b3Jkc1wiO1xuaW1wb3J0IHsgUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zIH0gZnJvbSBcIn4vdHlwZXMvcGFzc3dvcmRzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXNzd29yZEdlbmVyYXRpbmdBcmdzKG9wdGlvbnM6IFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucyk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKG9wdGlvbnMpLmZsYXRNYXAoKFthcmcsIHZhbHVlXSkgPT4gKHZhbHVlID8gW2AtLSR7YXJnfWAsIHZhbHVlXSA6IFtdKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNoTWFzdGVyUGFzc3dvcmRGb3JSZXByb21wdGluZyhwYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBwYmtkZjIocGFzc3dvcmQsIFJFUFJPTVBUX0hBU0hfU0FMVCwgMTAwMDAwLCA2NCwgXCJzaGE1MTJcIiwgKGVycm9yLCBoYXNoZWQpID0+IHtcbiAgICAgIGlmIChlcnJvciAhPSBudWxsKSB7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVzb2x2ZShoYXNoZWQudG9TdHJpbmcoXCJoZXhcIikpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucygpIHtcbiAgY29uc3Qgc3RvcmVkT3B0aW9ucyA9IGF3YWl0IExvY2FsU3RvcmFnZS5nZXRJdGVtPHN0cmluZz4oTE9DQUxfU1RPUkFHRV9LRVkuUEFTU1dPUkRfT1BUSU9OUyk7XG4gIHJldHVybiB7XG4gICAgLi4uREVGQVVMVF9QQVNTV09SRF9PUFRJT05TLFxuICAgIC4uLihzdG9yZWRPcHRpb25zID8gSlNPTi5wYXJzZShzdG9yZWRPcHRpb25zKSA6IHt9KSxcbiAgfSBhcyBQYXNzd29yZEdlbmVyYXRvck9wdGlvbnM7XG59XG4iLCAiaW1wb3J0IHsgZW52aXJvbm1lbnQsIGdldFByZWZlcmVuY2VWYWx1ZXMgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBWQVVMVF9USU1FT1VUX01TX1RPX0xBQkVMIH0gZnJvbSBcIn4vY29uc3RhbnRzL2xhYmVsc1wiO1xuaW1wb3J0IHsgQ29tbWFuZE5hbWUgfSBmcm9tIFwifi90eXBlcy9nZW5lcmFsXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXJ2ZXJVcmxQcmVmZXJlbmNlKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHsgc2VydmVyVXJsIH0gPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpO1xuICByZXR1cm4gIXNlcnZlclVybCB8fCBzZXJ2ZXJVcmwgPT09IFwiYml0d2FyZGVuLmNvbVwiIHx8IHNlcnZlclVybCA9PT0gXCJodHRwczovL2JpdHdhcmRlbi5jb21cIiA/IHVuZGVmaW5lZCA6IHNlcnZlclVybDtcbn1cblxudHlwZSBQcmVmZXJlbmNlS2V5T2ZDb21tYW5kc1dpdGhUcmFuc2llbnRPcHRpb25zID1cbiAgfCBrZXlvZiBQcmVmZXJlbmNlcy5TZWFyY2hcbiAgfCBrZXlvZiBQcmVmZXJlbmNlcy5HZW5lcmF0ZVBhc3N3b3JkXG4gIHwga2V5b2YgUHJlZmVyZW5jZXMuR2VuZXJhdGVQYXNzd29yZFF1aWNrO1xuXG50eXBlIFRyYW5zaWVudE9wdGlvbnNWYWx1ZSA9XG4gIHwgUHJlZmVyZW5jZXMuU2VhcmNoW1widHJhbnNpZW50Q29weVNlYXJjaFwiXVxuICB8IFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmRbXCJ0cmFuc2llbnRDb3B5R2VuZXJhdGVQYXNzd29yZFwiXVxuICB8IFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmRRdWlja1tcInRyYW5zaWVudENvcHlHZW5lcmF0ZVBhc3N3b3JkUXVpY2tcIl07XG5cbmNvbnN0IENPTU1BTkRfTkFNRV9UT19QUkVGRVJFTkNFX0tFWV9NQVA6IFJlY29yZDxDb21tYW5kTmFtZSwgUHJlZmVyZW5jZUtleU9mQ29tbWFuZHNXaXRoVHJhbnNpZW50T3B0aW9ucz4gPSB7XG4gIHNlYXJjaDogXCJ0cmFuc2llbnRDb3B5U2VhcmNoXCIsXG4gIFwiZ2VuZXJhdGUtcGFzc3dvcmRcIjogXCJ0cmFuc2llbnRDb3B5R2VuZXJhdGVQYXNzd29yZFwiLFxuICBcImdlbmVyYXRlLXBhc3N3b3JkLXF1aWNrXCI6IFwidHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmRRdWlja1wiLFxufTtcblxudHlwZSBQcmVmZXJlbmNlcyA9IFByZWZlcmVuY2VzLlNlYXJjaCAmIFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmQgJiBQcmVmZXJlbmNlcy5HZW5lcmF0ZVBhc3N3b3JkUXVpY2s7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2llbnRDb3B5UHJlZmVyZW5jZSh0eXBlOiBcInBhc3N3b3JkXCIgfCBcIm90aGVyXCIpOiBib29sZWFuIHtcbiAgY29uc3QgcHJlZmVyZW5jZUtleSA9IENPTU1BTkRfTkFNRV9UT19QUkVGRVJFTkNFX0tFWV9NQVBbZW52aXJvbm1lbnQuY29tbWFuZE5hbWUgYXMgQ29tbWFuZE5hbWVdO1xuICBjb25zdCB0cmFuc2llbnRQcmVmZXJlbmNlID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcz4oKVtwcmVmZXJlbmNlS2V5XSBhcyBUcmFuc2llbnRPcHRpb25zVmFsdWU7XG4gIGlmICh0cmFuc2llbnRQcmVmZXJlbmNlID09PSBcIm5ldmVyXCIpIHJldHVybiBmYWxzZTtcbiAgaWYgKHRyYW5zaWVudFByZWZlcmVuY2UgPT09IFwiYWx3YXlzXCIpIHJldHVybiB0cnVlO1xuICBpZiAodHJhbnNpZW50UHJlZmVyZW5jZSA9PT0gXCJwYXNzd29yZHNcIikgcmV0dXJuIHR5cGUgPT09IFwicGFzc3dvcmRcIjtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMYWJlbEZvclRpbWVvdXRQcmVmZXJlbmNlKHRpbWVvdXQ6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBWQVVMVF9USU1FT1VUX01TX1RPX0xBQkVMW3RpbWVvdXQgYXMga2V5b2YgdHlwZW9mIFZBVUxUX1RJTUVPVVRfTVNfVE9fTEFCRUxdO1xufVxuIiwgImNvbnN0IFZBVUxUX1RJTUVPVVRfT1BUSU9OUyA9IHtcbiAgSU1NRURJQVRFTFk6IFwiMFwiLFxuICBPTkVfTUlOVVRFOiBcIjYwMDAwXCIsXG4gIEZJVkVfTUlOVVRFUzogXCIzMDAwMDBcIixcbiAgRklGVEVFTl9NSU5VVEVTOiBcIjkwMDAwMFwiLFxuICBUSElSVFlfTUlOVVRFUzogXCIxODAwMDAwXCIsXG4gIE9ORV9IT1VSOiBcIjM2MDAwMDBcIixcbiAgRk9VUl9IT1VSUzogXCIxNDQwMDAwMFwiLFxuICBFSUdIVF9IT1VSUzogXCIyODgwMDAwMFwiLFxuICBPTkVfREFZOiBcIjg2NDAwMDAwXCIsXG4gIE5FVkVSOiBcIi0xXCIsXG4gIFNZU1RFTV9MT0NLOiBcIi0yXCIsXG4gIFNZU1RFTV9TTEVFUDogXCItM1wiLFxufSBhcyBjb25zdCBzYXRpc2ZpZXMgUmVjb3JkPHN0cmluZywgUHJlZmVyZW5jZXNbXCJyZXByb21wdElnbm9yZUR1cmF0aW9uXCJdPjtcblxuZXhwb3J0IGNvbnN0IFZBVUxUX1RJTUVPVVQgPSBPYmplY3QuZW50cmllcyhWQVVMVF9USU1FT1VUX09QVElPTlMpLnJlZHVjZSgoYWNjLCBba2V5LCB2YWx1ZV0pID0+IHtcbiAgYWNjW2tleSBhcyBrZXlvZiB0eXBlb2YgVkFVTFRfVElNRU9VVF9PUFRJT05TXSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgcmV0dXJuIGFjYztcbn0sIHt9IGFzIFJlY29yZDxrZXlvZiB0eXBlb2YgVkFVTFRfVElNRU9VVF9PUFRJT05TLCBudW1iZXI+KTtcbiIsICJpbXBvcnQgeyBWQVVMVF9USU1FT1VUIH0gZnJvbSBcIn4vY29uc3RhbnRzL3ByZWZlcmVuY2VzXCI7XG5pbXBvcnQgeyBDYXJkLCBJZGVudGl0eSwgSXRlbVR5cGUgfSBmcm9tIFwifi90eXBlcy92YXVsdFwiO1xuXG5leHBvcnQgY29uc3QgVkFVTFRfVElNRU9VVF9NU19UT19MQUJFTDogUGFydGlhbDxSZWNvcmQ8a2V5b2YgdHlwZW9mIFZBVUxUX1RJTUVPVVQsIHN0cmluZz4+ID0ge1xuICBbVkFVTFRfVElNRU9VVC5JTU1FRElBVEVMWV06IFwiSW1tZWRpYXRlbHlcIixcbiAgW1ZBVUxUX1RJTUVPVVQuT05FX01JTlVURV06IFwiMSBNaW51dGVcIixcbiAgW1ZBVUxUX1RJTUVPVVQuRklWRV9NSU5VVEVTXTogXCI1IE1pbnV0ZXNcIixcbiAgW1ZBVUxUX1RJTUVPVVQuRklGVEVFTl9NSU5VVEVTXTogXCIxNSBNaW51dGVzXCIsXG4gIFtWQVVMVF9USU1FT1VULlRISVJUWV9NSU5VVEVTXTogXCIzMCBNaW51dGVzXCIsXG4gIFtWQVVMVF9USU1FT1VULk9ORV9IT1VSXTogXCIxIEhvdXJcIixcbiAgW1ZBVUxUX1RJTUVPVVQuRk9VUl9IT1VSU106IFwiNCBIb3Vyc1wiLFxuICBbVkFVTFRfVElNRU9VVC5FSUdIVF9IT1VSU106IFwiOCBIb3Vyc1wiLFxuICBbVkFVTFRfVElNRU9VVC5PTkVfREFZXTogXCIxIERheVwiLFxufTtcblxuZXhwb3J0IGNvbnN0IENBUkRfS0VZX0xBQkVMOiBSZWNvcmQ8a2V5b2YgQ2FyZCwgc3RyaW5nPiA9IHtcbiAgY2FyZGhvbGRlck5hbWU6IFwiQ2FyZGhvbGRlciBuYW1lXCIsXG4gIGJyYW5kOiBcIkJyYW5kXCIsXG4gIG51bWJlcjogXCJOdW1iZXJcIixcbiAgZXhwTW9udGg6IFwiRXhwaXJhdGlvbiBtb250aFwiLFxuICBleHBZZWFyOiBcIkV4cGlyYXRpb24geWVhclwiLFxuICBjb2RlOiBcIlNlY3VyaXR5IGNvZGUgKENWVilcIixcbn07XG5cbmV4cG9ydCBjb25zdCBJREVOVElUWV9LRVlfTEFCRUw6IFJlY29yZDxrZXlvZiBJZGVudGl0eSwgc3RyaW5nPiA9IHtcbiAgdGl0bGU6IFwiVGl0bGVcIixcbiAgZmlyc3ROYW1lOiBcIkZpcnN0IG5hbWVcIixcbiAgbWlkZGxlTmFtZTogXCJNaWRkbGUgbmFtZVwiLFxuICBsYXN0TmFtZTogXCJMYXN0IG5hbWVcIixcbiAgdXNlcm5hbWU6IFwiVXNlcm5hbWVcIixcbiAgY29tcGFueTogXCJDb21wYW55XCIsXG4gIHNzbjogXCJTb2NpYWwgU2VjdXJpdHkgbnVtYmVyXCIsXG4gIHBhc3Nwb3J0TnVtYmVyOiBcIlBhc3Nwb3J0IG51bWJlclwiLFxuICBsaWNlbnNlTnVtYmVyOiBcIkxpY2Vuc2UgbnVtYmVyXCIsXG4gIGVtYWlsOiBcIkVtYWlsXCIsXG4gIHBob25lOiBcIlBob25lXCIsXG4gIGFkZHJlc3MxOiBcIkFkZHJlc3MgMVwiLFxuICBhZGRyZXNzMjogXCJBZGRyZXNzIDJcIixcbiAgYWRkcmVzczM6IFwiQWRkcmVzcyAzXCIsXG4gIGNpdHk6IFwiQ2l0eSAvIFRvd25cIixcbiAgc3RhdGU6IFwiU3RhdGUgLyBQcm92aW5jZVwiLFxuICBwb3N0YWxDb2RlOiBcIlppcCAvIFBvc3RhbCBjb2RlXCIsXG4gIGNvdW50cnk6IFwiQ291bnRyeVwiLFxufTtcblxuZXhwb3J0IGNvbnN0IElURU1fVFlQRV9UT19MQUJFTDogUmVjb3JkPEl0ZW1UeXBlLCBzdHJpbmc+ID0ge1xuICBbSXRlbVR5cGUuTE9HSU5dOiBcIkxvZ2luXCIsXG4gIFtJdGVtVHlwZS5DQVJEXTogXCJDYXJkXCIsXG4gIFtJdGVtVHlwZS5JREVOVElUWV06IFwiSWRlbnRpdHlcIixcbiAgW0l0ZW1UeXBlLk5PVEVdOiBcIlNlY3VyZSBOb3RlXCIsXG4gIFtJdGVtVHlwZS5TU0hfS0VZXTogXCJTU0ggS2V5XCIsXG59O1xuIiwgImV4cG9ydCBjbGFzcyBNYW51YWxseVRocm93bkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5zdGFjayA9IHN0YWNrO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEaXNwbGF5YWJsZUVycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlLCBzdGFjayk7XG4gIH1cbn1cblxuLyogLS0gc3BlY2lmaWMgZXJyb3JzIGJlbG93IC0tICovXG5cbmV4cG9ydCBjbGFzcyBDTElOb3RGb3VuZEVycm9yIGV4dGVuZHMgRGlzcGxheWFibGVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiQml0d2FyZGVuIENMSSBub3QgZm91bmRcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiQ0xJTm90Rm91bmRFcnJvclwiO1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvciBleHRlbmRzIERpc3BsYXlhYmxlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIkJpdHdhcmRlbiBDTEkgbm90IGZvdW5kXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIkluc3RhbGxlZENMSU5vdEZvdW5kRXJyb3JcIjtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJGYWlsZWQgdG8gbG9hZCB2YXVsdCBpdGVtc1wiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJGYWlsZWRUb0xvYWRWYXVsdEl0ZW1zRXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVmF1bHRJc0xvY2tlZEVycm9yIGV4dGVuZHMgRGlzcGxheWFibGVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIlZhdWx0IGlzIGxvY2tlZFwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJWYXVsdElzTG9ja2VkRXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTm90TG9nZ2VkSW5FcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIk5vdCBsb2dnZWQgaW5cIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiTm90TG9nZ2VkSW5FcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFbnN1cmVDbGlCaW5FcnJvciBleHRlbmRzIERpc3BsYXlhYmxlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJGYWlsZWQgZG8gZG93bmxvYWQgQml0d2FyZGVuIENMSVwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJFbnN1cmVDbGlCaW5FcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcmVtaXVtRmVhdHVyZUVycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIlByZW1pdW0gc3RhdHVzIGlzIHJlcXVpcmVkIHRvIHVzZSB0aGlzIGZlYXR1cmVcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiUHJlbWl1bUZlYXR1cmVFcnJvclwiO1xuICB9XG59XG5leHBvcnQgY2xhc3MgU2VuZE5lZWRzUGFzc3dvcmRFcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJUaGlzIFNlbmQgaGFzIGEgaXMgcHJvdGVjdGVkIGJ5IGEgcGFzc3dvcmRcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiU2VuZE5lZWRzUGFzc3dvcmRFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZW5kSW52YWxpZFBhc3N3b3JkRXJyb3IgZXh0ZW5kcyBNYW51YWxseVRocm93bkVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiVGhlIHBhc3N3b3JkIHlvdSBlbnRlcmVkIGlzIGludmFsaWRcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiU2VuZEludmFsaWRQYXNzd29yZEVycm9yXCI7XG4gIH1cbn1cblxuLyogLS0gZXJyb3IgdXRpbHMgYmVsb3cgLS0gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHRyeUV4ZWM8VD4oZm46ICgpID0+IFQpOiBUIGV4dGVuZHMgdm9pZCA/IFQgOiBUIHwgdW5kZWZpbmVkO1xuZXhwb3J0IGZ1bmN0aW9uIHRyeUV4ZWM8VCwgRj4oZm46ICgpID0+IFQsIGZhbGxiYWNrVmFsdWU6IEYpOiBUIHwgRjtcbmV4cG9ydCBmdW5jdGlvbiB0cnlFeGVjPFQsIEY+KGZuOiAoKSA9PiBULCBmYWxsYmFja1ZhbHVlPzogRik6IFQgfCBGIHwgdW5kZWZpbmVkIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZm4oKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbGxiYWNrVmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERpc3BsYXlhYmxlRXJyb3JNZXNzYWdlKGVycm9yOiBhbnkpIHtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgRGlzcGxheWFibGVFcnJvcikgcmV0dXJuIGVycm9yLm1lc3NhZ2U7XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBjb25zdCBnZXRFcnJvclN0cmluZyA9IChlcnJvcjogYW55KTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgaWYgKCFlcnJvcikgcmV0dXJuIHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBlcnJvciA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIGVycm9yO1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgbmFtZSB9ID0gZXJyb3I7XG4gICAgaWYgKGVycm9yLnN0YWNrKSByZXR1cm4gZXJyb3Iuc3RhY2s7XG4gICAgcmV0dXJuIGAke25hbWV9OiAke21lc3NhZ2V9YDtcbiAgfVxuICByZXR1cm4gU3RyaW5nKGVycm9yKTtcbn07XG5cbmV4cG9ydCB0eXBlIFN1Y2Nlc3M8VD4gPSBbVCwgbnVsbF07XG5leHBvcnQgdHlwZSBGYWlsdXJlPEU+ID0gW251bGwsIEVdO1xuZXhwb3J0IHR5cGUgUmVzdWx0PFQsIEUgPSBFcnJvcj4gPSBTdWNjZXNzPFQ+IHwgRmFpbHVyZTxFPjtcblxuZXhwb3J0IGZ1bmN0aW9uIE9rPFQ+KGRhdGE6IFQpOiBTdWNjZXNzPFQ+IHtcbiAgcmV0dXJuIFtkYXRhLCBudWxsXTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBFcnI8RSA9IEVycm9yPihlcnJvcjogRSk6IEZhaWx1cmU8RT4ge1xuICByZXR1cm4gW251bGwsIGVycm9yXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyeUNhdGNoPFQsIEUgPSBFcnJvcj4oZm46ICgpID0+IFQpOiBSZXN1bHQ8VCwgRT47XG5leHBvcnQgZnVuY3Rpb24gdHJ5Q2F0Y2g8VCwgRSA9IEVycm9yPihwcm9taXNlOiBQcm9taXNlPFQ+KTogUHJvbWlzZTxSZXN1bHQ8VCwgRT4+O1xuLyoqXG4gKiBFeGVjdXRlcyBhIGZ1bmN0aW9uIG9yIGEgcHJvbWlzZSBzYWZlbHkgaW5zaWRlIGEgdHJ5L2NhdGNoIGFuZFxuICogcmV0dXJucyBhIGBSZXN1bHRgIChgW2RhdGEsIGVycm9yXWApLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ5Q2F0Y2g8VCwgRSA9IEVycm9yPihmbk9yUHJvbWlzZTogKCgpID0+IFQpIHwgUHJvbWlzZTxUPik6IE1heWJlUHJvbWlzZTxSZXN1bHQ8VCwgRT4+IHtcbiAgaWYgKHR5cGVvZiBmbk9yUHJvbWlzZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBPayhmbk9yUHJvbWlzZSgpKTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICByZXR1cm4gRXJyKGVycm9yKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZuT3JQcm9taXNlLnRoZW4oKGRhdGEpID0+IE9rKGRhdGEpKS5jYXRjaCgoZXJyb3IpID0+IEVycihlcnJvcikpO1xufVxuIiwgImltcG9ydCB7IGV4aXN0c1N5bmMsIG1rZGlyU3luYywgc3RhdFN5bmMsIHVubGlua1N5bmMgfSBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IHJlYWRkaXIsIHVubGluayB9IGZyb20gXCJmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgc3RyZWFtWmlwIGZyb20gXCJub2RlLXN0cmVhbS16aXBcIjtcbmltcG9ydCB7IHRyeUV4ZWMgfSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JGaWxlQXZhaWxhYmxlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgaWYgKCFleGlzdHNTeW5jKHBhdGgpKSByZXR1cm47XG4gICAgICBjb25zdCBzdGF0cyA9IHN0YXRTeW5jKHBhdGgpO1xuICAgICAgaWYgKHN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSwgMzAwKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICByZWplY3QobmV3IEVycm9yKGBGaWxlICR7cGF0aH0gbm90IGZvdW5kLmApKTtcbiAgICB9LCA1MDAwKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNvbXByZXNzRmlsZShmaWxlUGF0aDogc3RyaW5nLCB0YXJnZXRQYXRoOiBzdHJpbmcpIHtcbiAgY29uc3QgemlwID0gbmV3IHN0cmVhbVppcC5hc3luYyh7IGZpbGU6IGZpbGVQYXRoIH0pO1xuICBpZiAoIWV4aXN0c1N5bmModGFyZ2V0UGF0aCkpIG1rZGlyU3luYyh0YXJnZXRQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgYXdhaXQgemlwLmV4dHJhY3QobnVsbCwgdGFyZ2V0UGF0aCk7XG4gIGF3YWl0IHppcC5jbG9zZSgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlRmlsZXNUaGF0U3RhcnRXaXRoKHN0YXJ0aW5nV2l0aDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpIHtcbiAgbGV0IHJlbW92ZWRBdExlYXN0T25lID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCByZWFkZGlyKHBhdGgpO1xuICAgIGZvciBhd2FpdCAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgaWYgKCFmaWxlLnN0YXJ0c1dpdGgoc3RhcnRpbmdXaXRoKSkgY29udGludWU7XG4gICAgICBhd2FpdCB0cnlFeGVjKGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdW5saW5rKGpvaW4ocGF0aCwgZmlsZSkpO1xuICAgICAgICByZW1vdmVkQXRMZWFzdE9uZSA9IHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcmVtb3ZlZEF0TGVhc3RPbmU7XG59XG5leHBvcnQgZnVuY3Rpb24gdW5saW5rQWxsU3luYyguLi5wYXRoczogc3RyaW5nW10pIHtcbiAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgdHJ5RXhlYygoKSA9PiB1bmxpbmtTeW5jKHBhdGgpKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IGNyZWF0ZVdyaXRlU3RyZWFtLCB1bmxpbmsgfSBmcm9tIFwiZnNcIjtcbmltcG9ydCBodHRwIGZyb20gXCJodHRwXCI7XG5pbXBvcnQgaHR0cHMgZnJvbSBcImh0dHBzXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIH0gZnJvbSBcIn4vdXRpbHMvZGV2ZWxvcG1lbnRcIjtcbmltcG9ydCB7IGdldEZpbGVTaGEyNTYgfSBmcm9tIFwifi91dGlscy9jcnlwdG9cIjtcbmltcG9ydCB7IHdhaXRGb3JGaWxlQXZhaWxhYmxlIH0gZnJvbSBcIn4vdXRpbHMvZnNcIjtcblxudHlwZSBEb3dubG9hZE9wdGlvbnMgPSB7XG4gIG9uUHJvZ3Jlc3M/OiAocGVyY2VudDogbnVtYmVyKSA9PiB2b2lkO1xuICBzaGEyNTY/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZG93bmxvYWQodXJsOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgb3B0aW9ucz86IERvd25sb2FkT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IG9uUHJvZ3Jlc3MsIHNoYTI1NiB9ID0gb3B0aW9ucyA/PyB7fTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHVyaSA9IG5ldyBVUkwodXJsKTtcbiAgICBjb25zdCBwcm90b2NvbCA9IHVyaS5wcm90b2NvbCA9PT0gXCJodHRwczpcIiA/IGh0dHBzIDogaHR0cDtcblxuICAgIGxldCByZWRpcmVjdENvdW50ID0gMDtcbiAgICBjb25zdCByZXF1ZXN0ID0gcHJvdG9jb2wuZ2V0KHVyaS5ocmVmLCAocmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPj0gMzAwICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPCA0MDApIHtcbiAgICAgICAgcmVxdWVzdC5kZXN0cm95KCk7XG4gICAgICAgIHJlc3BvbnNlLmRlc3Ryb3koKTtcblxuICAgICAgICBjb25zdCByZWRpcmVjdFVybCA9IHJlc3BvbnNlLmhlYWRlcnMubG9jYXRpb247XG4gICAgICAgIGlmICghcmVkaXJlY3RVcmwpIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBSZWRpcmVjdCByZXNwb25zZSB3aXRob3V0IGxvY2F0aW9uIGhlYWRlcmApKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKytyZWRpcmVjdENvdW50ID49IDEwKSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlRvbyBtYW55IHJlZGlyZWN0c1wiKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZG93bmxvYWQocmVkaXJlY3RVcmwsIHBhdGgsIG9wdGlvbnMpLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFJlc3BvbnNlIHN0YXR1cyAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9OiAke3Jlc3BvbnNlLnN0YXR1c01lc3NhZ2V9YCkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpbGVTaXplID0gcGFyc2VJbnQocmVzcG9uc2UuaGVhZGVyc1tcImNvbnRlbnQtbGVuZ3RoXCJdIHx8IFwiMFwiLCAxMCk7XG4gICAgICBpZiAoZmlsZVNpemUgPT09IDApIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkludmFsaWQgZmlsZSBzaXplXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBmaWxlU3RyZWFtID0gY3JlYXRlV3JpdGVTdHJlYW0ocGF0aCwgeyBhdXRvQ2xvc2U6IHRydWUgfSk7XG4gICAgICBsZXQgZG93bmxvYWRlZEJ5dGVzID0gMDtcblxuICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHtcbiAgICAgICAgcmVxdWVzdC5kZXN0cm95KCk7XG4gICAgICAgIHJlc3BvbnNlLmRlc3Ryb3koKTtcbiAgICAgICAgZmlsZVN0cmVhbS5jbG9zZSgpO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgY2xlYW51cEFuZFJlamVjdCA9IChlcnJvcj86IEVycm9yKSA9PiB7XG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH07XG5cbiAgICAgIHJlc3BvbnNlLm9uKFwiZGF0YVwiLCAoY2h1bmspID0+IHtcbiAgICAgICAgZG93bmxvYWRlZEJ5dGVzICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcGVyY2VudCA9IE1hdGguZmxvb3IoKGRvd25sb2FkZWRCeXRlcyAvIGZpbGVTaXplKSAqIDEwMCk7XG4gICAgICAgIG9uUHJvZ3Jlc3M/LihwZXJjZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICBmaWxlU3RyZWFtLm9uKFwiZmluaXNoXCIsIGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCB3YWl0Rm9yRmlsZUF2YWlsYWJsZShwYXRoKTtcbiAgICAgICAgICBpZiAoc2hhMjU2KSBhd2FpdCB3YWl0Rm9ySGFzaFRvTWF0Y2gocGF0aCwgc2hhMjU2KTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBmaWxlU3RyZWFtLm9uKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XG4gICAgICAgIGNhcHR1cmVFeGNlcHRpb24oYEZpbGUgc3RyZWFtIGVycm9yIHdoaWxlIGRvd25sb2FkaW5nICR7dXJsfWAsIGVycm9yKTtcbiAgICAgICAgdW5saW5rKHBhdGgsICgpID0+IGNsZWFudXBBbmRSZWplY3QoZXJyb3IpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXNwb25zZS5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKGBSZXNwb25zZSBlcnJvciB3aGlsZSBkb3dubG9hZGluZyAke3VybH1gLCBlcnJvcik7XG4gICAgICAgIHVubGluayhwYXRoLCAoKSA9PiBjbGVhbnVwQW5kUmVqZWN0KGVycm9yKSk7XG4gICAgICB9KTtcblxuICAgICAgcmVxdWVzdC5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKGBSZXF1ZXN0IGVycm9yIHdoaWxlIGRvd25sb2FkaW5nICR7dXJsfWAsIGVycm9yKTtcbiAgICAgICAgdW5saW5rKHBhdGgsICgpID0+IGNsZWFudXBBbmRSZWplY3QoZXJyb3IpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXNwb25zZS5waXBlKGZpbGVTdHJlYW0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gd2FpdEZvckhhc2hUb01hdGNoKHBhdGg6IHN0cmluZywgc2hhMjU2OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBmaWxlU2hhID0gZ2V0RmlsZVNoYTI1NihwYXRoKTtcbiAgICBpZiAoIWZpbGVTaGEpIHJldHVybiByZWplY3QobmV3IEVycm9yKGBDb3VsZCBub3QgZ2VuZXJhdGUgaGFzaCBmb3IgZmlsZSAke3BhdGh9LmApKTtcbiAgICBpZiAoZmlsZVNoYSA9PT0gc2hhMjU2KSByZXR1cm4gcmVzb2x2ZSgpO1xuXG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAoZ2V0RmlsZVNoYTI1NihwYXRoKSA9PT0gc2hhMjU2KSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSwgMTAwMCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcihgSGFzaCBkaWQgbm90IG1hdGNoLCBleHBlY3RlZCAke3NoYTI1Ni5zdWJzdHJpbmcoMCwgNyl9LCBnb3QgJHtmaWxlU2hhLnN1YnN0cmluZygwLCA3KX0uYCkpO1xuICAgIH0sIDUwMDApO1xuICB9KTtcbn1cbiIsICJpbXBvcnQgeyBlbnZpcm9ubWVudCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IGdldEVycm9yU3RyaW5nIH0gZnJvbSBcIn4vdXRpbHMvZXJyb3JzXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIGFzIGNhcHR1cmVFeGNlcHRpb25SYXljYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuXG50eXBlIExvZyA9IHtcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBlcnJvcjogYW55O1xufTtcblxuY29uc3QgX2V4Y2VwdGlvbnMgPSB7XG4gIGxvZ3M6IG5ldyBNYXA8RGF0ZSwgTG9nPigpLFxuICBzZXQ6IChtZXNzYWdlOiBzdHJpbmcsIGVycm9yPzogYW55KTogdm9pZCA9PiB7XG4gICAgY2FwdHVyZWRFeGNlcHRpb25zLmxvZ3Muc2V0KG5ldyBEYXRlKCksIHsgbWVzc2FnZSwgZXJyb3IgfSk7XG4gIH0sXG4gIGNsZWFyOiAoKTogdm9pZCA9PiBjYXB0dXJlZEV4Y2VwdGlvbnMubG9ncy5jbGVhcigpLFxuICB0b1N0cmluZzogKCk6IHN0cmluZyA9PiB7XG4gICAgbGV0IHN0ciA9IFwiXCI7XG4gICAgY2FwdHVyZWRFeGNlcHRpb25zLmxvZ3MuZm9yRWFjaCgobG9nLCBkYXRlKSA9PiB7XG4gICAgICBpZiAoc3RyLmxlbmd0aCA+IDApIHN0ciArPSBcIlxcblxcblwiO1xuICAgICAgc3RyICs9IGBbJHtkYXRlLnRvSVNPU3RyaW5nKCl9XSAke2xvZy5tZXNzYWdlfWA7XG4gICAgICBpZiAobG9nLmVycm9yKSBzdHIgKz0gYDogJHtnZXRFcnJvclN0cmluZyhsb2cuZXJyb3IpfWA7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3RyO1xuICB9LFxufTtcblxuZXhwb3J0IGNvbnN0IGNhcHR1cmVkRXhjZXB0aW9ucyA9IE9iamVjdC5mcmVlemUoX2V4Y2VwdGlvbnMpO1xuXG50eXBlIENhcHR1cmVFeGNlcHRpb25PcHRpb25zID0ge1xuICBjYXB0dXJlVG9SYXljYXN0PzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCBjb25zdCBjYXB0dXJlRXhjZXB0aW9uID0gKFxuICBkZXNjcmlwdGlvbjogc3RyaW5nIHwgRmFsc3kgfCAoc3RyaW5nIHwgRmFsc3kpW10sXG4gIGVycm9yOiBhbnksXG4gIG9wdGlvbnM/OiBDYXB0dXJlRXhjZXB0aW9uT3B0aW9uc1xuKSA9PiB7XG4gIGNvbnN0IHsgY2FwdHVyZVRvUmF5Y2FzdCA9IGZhbHNlIH0gPSBvcHRpb25zID8/IHt9O1xuICBjb25zdCBkZXNjID0gQXJyYXkuaXNBcnJheShkZXNjcmlwdGlvbikgPyBkZXNjcmlwdGlvbi5maWx0ZXIoQm9vbGVhbikuam9pbihcIiBcIikgOiBkZXNjcmlwdGlvbiB8fCBcIkNhcHR1cmVkIGV4Y2VwdGlvblwiO1xuICBjYXB0dXJlZEV4Y2VwdGlvbnMuc2V0KGRlc2MsIGVycm9yKTtcbiAgaWYgKGVudmlyb25tZW50LmlzRGV2ZWxvcG1lbnQpIHtcbiAgICBjb25zb2xlLmVycm9yKGRlc2MsIGVycm9yKTtcbiAgfSBlbHNlIGlmIChjYXB0dXJlVG9SYXljYXN0KSB7XG4gICAgY2FwdHVyZUV4Y2VwdGlvblJheWNhc3QoZXJyb3IpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZGVidWdMb2cgPSAoLi4uYXJnczogYW55W10pID0+IHtcbiAgaWYgKCFlbnZpcm9ubWVudC5pc0RldmVsb3BtZW50KSByZXR1cm47XG4gIGNvbnNvbGUuZGVidWcoLi4uYXJncyk7XG59O1xuIiwgImltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gXCJjcnlwdG9cIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVTaGEyNTYoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICB0cnkge1xuICAgIHJldHVybiBjcmVhdGVIYXNoKFwic2hhMjU2XCIpLnVwZGF0ZShyZWFkRmlsZVN5bmMoZmlsZVBhdGgpKS5kaWdlc3QoXCJoZXhcIik7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBTZW5kQ3JlYXRlUGF5bG9hZCB9IGZyb20gXCJ+L3R5cGVzL3NlbmRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVTZW5kUGF5bG9hZCh0ZW1wbGF0ZTogU2VuZENyZWF0ZVBheWxvYWQsIHZhbHVlczogU2VuZENyZWF0ZVBheWxvYWQpOiBTZW5kQ3JlYXRlUGF5bG9hZCB7XG4gIHJldHVybiB7XG4gICAgLi4udGVtcGxhdGUsXG4gICAgLi4udmFsdWVzLFxuICAgIGZpbGU6IHZhbHVlcy5maWxlID8geyAuLi50ZW1wbGF0ZS5maWxlLCAuLi52YWx1ZXMuZmlsZSB9IDogdGVtcGxhdGUuZmlsZSxcbiAgICB0ZXh0OiB2YWx1ZXMudGV4dCA/IHsgLi4udGVtcGxhdGUudGV4dCwgLi4udmFsdWVzLnRleHQgfSA6IHRlbXBsYXRlLnRleHQsXG4gIH07XG59XG4iLCAiaW1wb3J0IHsgQ2FjaGUgYXMgUmF5Y2FzdENhY2hlIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuXG5leHBvcnQgY29uc3QgQ2FjaGUgPSBuZXcgUmF5Y2FzdENhY2hlKHsgbmFtZXNwYWNlOiBcImJ3LWNhY2hlXCIgfSk7XG4iLCAiZXhwb3J0IGNvbnN0IHBsYXRmb3JtID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJkYXJ3aW5cIiA/IFwibWFjb3NcIiA6IFwid2luZG93c1wiO1xuIiwgImltcG9ydCB7IExvY2FsU3RvcmFnZSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IExPQ0FMX1NUT1JBR0VfS0VZIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcbmltcG9ydCB7IGV4ZWMgYXMgY2FsbGJhY2tFeGVjLCBQcm9taXNlV2l0aENoaWxkIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uLCBkZWJ1Z0xvZyB9IGZyb20gXCJ+L3V0aWxzL2RldmVsb3BtZW50XCI7XG5cbmNvbnN0IGV4ZWMgPSBwcm9taXNpZnkoY2FsbGJhY2tFeGVjKTtcblxuZXhwb3J0IGNvbnN0IFNlc3Npb25TdG9yYWdlID0ge1xuICBnZXRTYXZlZFNlc3Npb246ICgpID0+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5TRVNTSU9OX1RPS0VOKSxcbiAgICAgIExvY2FsU3RvcmFnZS5nZXRJdGVtPHN0cmluZz4oTE9DQUxfU1RPUkFHRV9LRVkuUkVQUk9NUFRfSEFTSCksXG4gICAgICBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KExPQ0FMX1NUT1JBR0VfS0VZLkxBU1RfQUNUSVZJVFlfVElNRSksXG4gICAgICBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KExPQ0FMX1NUT1JBR0VfS0VZLlZBVUxUX0xBU1RfU1RBVFVTKSxcbiAgICBdKTtcbiAgfSxcbiAgY2xlYXJTZXNzaW9uOiBhc3luYyAoKSA9PiB7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuU0VTU0lPTl9UT0tFTiksXG4gICAgICBMb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShMT0NBTF9TVE9SQUdFX0tFWS5SRVBST01QVF9IQVNIKSxcbiAgICBdKTtcbiAgfSxcbiAgc2F2ZVNlc3Npb246IGFzeW5jICh0b2tlbjogc3RyaW5nLCBwYXNzd29yZEhhc2g6IHN0cmluZykgPT4ge1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIExvY2FsU3RvcmFnZS5zZXRJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlNFU1NJT05fVE9LRU4sIHRva2VuKSxcbiAgICAgIExvY2FsU3RvcmFnZS5zZXRJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlJFUFJPTVBUX0hBU0gsIHBhc3N3b3JkSGFzaCksXG4gICAgXSk7XG4gIH0sXG4gIGxvZ291dENsZWFyU2Vzc2lvbjogYXN5bmMgKCkgPT4ge1xuICAgIC8vIGNsZWFyIGV2ZXJ5dGhpbmcgcmVsYXRlZCB0byB0aGUgc2Vzc2lvblxuICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIExvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlNFU1NJT05fVE9LRU4pLFxuICAgICAgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuUkVQUk9NUFRfSEFTSCksXG4gICAgICBMb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShMT0NBTF9TVE9SQUdFX0tFWS5MQVNUX0FDVElWSVRZX1RJTUUpLFxuICAgIF0pO1xuICB9LFxufTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrU3lzdGVtTG9ja2VkU2luY2VMYXN0QWNjZXNzID0gKGxhc3RBY3Rpdml0eVRpbWU6IERhdGUpID0+IHtcbiAgcmV0dXJuIGNoZWNrU3lzdGVtTG9nVGltZUFmdGVyKGxhc3RBY3Rpdml0eVRpbWUsICh0aW1lOiBudW1iZXIpID0+IGdldExhc3RTeXNsb2codGltZSwgXCJoYW5kbGVVbmxvY2tSZXN1bHRcIikpO1xufTtcbmV4cG9ydCBjb25zdCBjaGVja1N5c3RlbVNsZXB0U2luY2VMYXN0QWNjZXNzID0gKGxhc3RBY3Rpdml0eVRpbWU6IERhdGUpID0+IHtcbiAgcmV0dXJuIGNoZWNrU3lzdGVtTG9nVGltZUFmdGVyKGxhc3RBY3Rpdml0eVRpbWUsICh0aW1lOiBudW1iZXIpID0+IGdldExhc3RTeXNsb2codGltZSwgXCJzbGVlcCAwXCIpKTtcbn07XG5cbmZ1bmN0aW9uIGdldExhc3RTeXNsb2coaG91cnM6IG51bWJlciwgZmlsdGVyOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGV4ZWMoXG4gICAgYGxvZyBzaG93IC0tc3R5bGUgc3lzbG9nIC0tcHJlZGljYXRlIFwicHJvY2VzcyA9PSAnbG9naW53aW5kb3cnXCIgLS1pbmZvIC0tbGFzdCAke2hvdXJzfWggfCBncmVwIFwiJHtmaWx0ZXJ9XCIgfCB0YWlsIC1uIDFgXG4gICk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja1N5c3RlbUxvZ1RpbWVBZnRlcihcbiAgdGltZTogRGF0ZSxcbiAgZ2V0TG9nRW50cnk6ICh0aW1lU3BhbkhvdXJzOiBudW1iZXIpID0+IFByb21pc2VXaXRoQ2hpbGQ8eyBzdGRvdXQ6IHN0cmluZzsgc3RkZXJyOiBzdHJpbmcgfT5cbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBsYXN0U2NyZWVuTG9ja1RpbWUgPSBhd2FpdCBnZXRTeXN0ZW1Mb2dUaW1lKGdldExvZ0VudHJ5KTtcbiAgaWYgKCFsYXN0U2NyZWVuTG9ja1RpbWUpIHJldHVybiB0cnVlOyAvLyBhc3N1bWUgdGhhdCBsb2cgd2FzIGZvdW5kIGZvciBpbXByb3ZlZCBzYWZldHlcbiAgcmV0dXJuIG5ldyBEYXRlKGxhc3RTY3JlZW5Mb2NrVGltZSkuZ2V0VGltZSgpID4gdGltZS5nZXRUaW1lKCk7XG59XG5cbmNvbnN0IGdldFN5c3RlbUxvZ1RpbWVfSU5DUkVNRU5UX0hPVVJTID0gMjtcbmNvbnN0IGdldFN5c3RlbUxvZ1RpbWVfTUFYX1JFVFJJRVMgPSA1O1xuLyoqXG4gKiBTdGFydHMgYnkgY2hlY2tpbmcgdGhlIGxhc3QgaG91ciBhbmQgaW5jcmVhc2VzIHRoZSB0aW1lIHNwYW4gYnkge0BsaW5rIGdldFN5c3RlbUxvZ1RpbWVfSU5DUkVNRU5UX0hPVVJTfSBob3VycyBvbiBlYWNoIHJldHJ5LlxuICogXHUyNkEwXHVGRTBGIENhbGxzIHRvIHRoZSBzeXN0ZW0gbG9nIGFyZSB2ZXJ5IHNsb3csIGFuZCBpZiB0aGUgc2NyZWVuIGhhc24ndCBiZWVuIGxvY2tlZCBmb3Igc29tZSBob3VycywgaXQgZ2V0cyBzbG93ZXIuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldFN5c3RlbUxvZ1RpbWUoXG4gIGdldExvZ0VudHJ5OiAodGltZVNwYW5Ib3VyczogbnVtYmVyKSA9PiBQcm9taXNlV2l0aENoaWxkPHsgc3Rkb3V0OiBzdHJpbmc7IHN0ZGVycjogc3RyaW5nIH0+LFxuICB0aW1lU3BhbkhvdXJzID0gMSxcbiAgcmV0cnlBdHRlbXB0ID0gMFxuKTogUHJvbWlzZTxEYXRlIHwgdW5kZWZpbmVkPiB7XG4gIHRyeSB7XG4gICAgaWYgKHJldHJ5QXR0ZW1wdCA+IGdldFN5c3RlbUxvZ1RpbWVfTUFYX1JFVFJJRVMpIHtcbiAgICAgIGRlYnVnTG9nKFwiTWF4IHJldHJ5IGF0dGVtcHRzIHJlYWNoZWQgdG8gZ2V0IGxhc3Qgc2NyZWVuIGxvY2sgdGltZVwiKTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IHsgc3Rkb3V0LCBzdGRlcnIgfSA9IGF3YWl0IGdldExvZ0VudHJ5KHRpbWVTcGFuSG91cnMpO1xuICAgIGNvbnN0IFtsb2dEYXRlLCBsb2dUaW1lXSA9IHN0ZG91dD8uc3BsaXQoXCIgXCIpID8/IFtdO1xuICAgIGlmIChzdGRlcnIgfHwgIWxvZ0RhdGUgfHwgIWxvZ1RpbWUpIHtcbiAgICAgIHJldHVybiBnZXRTeXN0ZW1Mb2dUaW1lKGdldExvZ0VudHJ5LCB0aW1lU3BhbkhvdXJzICsgZ2V0U3lzdGVtTG9nVGltZV9JTkNSRU1FTlRfSE9VUlMsIHJldHJ5QXR0ZW1wdCArIDEpO1xuICAgIH1cblxuICAgIGNvbnN0IGxvZ0Z1bGxEYXRlID0gbmV3IERhdGUoYCR7bG9nRGF0ZX1UJHtsb2dUaW1lfWApO1xuICAgIGlmICghbG9nRnVsbERhdGUgfHwgbG9nRnVsbERhdGUudG9TdHJpbmcoKSA9PT0gXCJJbnZhbGlkIERhdGVcIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgIHJldHVybiBsb2dGdWxsRGF0ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGdldCBsYXN0IHNjcmVlbiBsb2NrIHRpbWVcIiwgZXJyb3IpO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUEsa0NBQUFBLFVBQUFDLFNBQUE7QUFBQSxJQUFBQSxRQUFPLFVBQVU7QUFDakIsVUFBTSxPQUFPO0FBRWIsUUFBSSxLQUFLLFFBQVEsSUFBSTtBQUVyQixhQUFTLGFBQWNDLE9BQU0sU0FBUztBQUNwQyxVQUFJLFVBQVUsUUFBUSxZQUFZLFNBQ2hDLFFBQVEsVUFBVSxRQUFRLElBQUk7QUFFaEMsVUFBSSxDQUFDLFNBQVM7QUFDWixlQUFPO0FBQUEsTUFDVDtBQUVBLGdCQUFVLFFBQVEsTUFBTSxHQUFHO0FBQzNCLFVBQUksUUFBUSxRQUFRLEVBQUUsTUFBTSxJQUFJO0FBQzlCLGVBQU87QUFBQSxNQUNUO0FBQ0EsZUFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLFFBQVEsS0FBSztBQUN2QyxZQUFJLElBQUksUUFBUSxDQUFDLEVBQUUsWUFBWTtBQUMvQixZQUFJLEtBQUtBLE1BQUssT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLFlBQVksTUFBTSxHQUFHO0FBQ25ELGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUVBLGFBQVMsVUFBVyxNQUFNQSxPQUFNLFNBQVM7QUFDdkMsVUFBSSxDQUFDLEtBQUssZUFBZSxLQUFLLENBQUMsS0FBSyxPQUFPLEdBQUc7QUFDNUMsZUFBTztBQUFBLE1BQ1Q7QUFDQSxhQUFPLGFBQWFBLE9BQU0sT0FBTztBQUFBLElBQ25DO0FBRUEsYUFBUyxNQUFPQSxPQUFNLFNBQVMsSUFBSTtBQUNqQyxTQUFHLEtBQUtBLE9BQU0sU0FBVSxJQUFJLE1BQU07QUFDaEMsV0FBRyxJQUFJLEtBQUssUUFBUSxVQUFVLE1BQU1BLE9BQU0sT0FBTyxDQUFDO0FBQUEsTUFD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LFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUE7QUFBQSxNQUdSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUE7QUFBQSxNQUdSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUE7QUFBQSxNQUdSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixhQUFhO0FBQUEsTUFDYixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsZ0JBQWdCO0FBQUE7QUFBQSxNQUdoQixXQUFXO0FBQUE7QUFBQSxNQUNYLFdBQVc7QUFBQTtBQUFBLE1BQ1gsZ0JBQWdC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QUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQUs7QUFBQSxFQUVkO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFLO0FBQUEsRUFFZDtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQUs7QUFBQSxFQUVkO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFLO0FBQUEsRUFFZDtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFB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dUJBQVE7IiwKICAibmFtZXMiOiBbImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aEtleSIsICJlbnZpcm9ubWVudCIsICJwbGF0Zm9ybSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwcm9jZXNzIiwgInVubG9hZCIsICJlbWl0IiwgImxvYWQiLCAicHJvY2Vzc1JlYWxseUV4aXQiLCAicHJvY2Vzc0VtaXQiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicHJvbWlzaWZ5IiwgImdldFN0cmVhbSIsICJzdHJlYW0iLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJvcGVuIiwgImVyciIsICJlbnRyeSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X25vZGVfcGF0aCIsICJpbXBvcnRfbm9kZV9wcm9jZXNzIiwgInBsYXRmb3JtIiwgInByb2Nlc3MiLCAidXJsIiwgInBhdGgiLCAib25ldGltZSIsICJpbXBvcnRfbm9kZV9vcyIsICJpbXBvcnRfbm9kZV9vcyIsICJvcyIsICJvbkV4aXQiLCAibWVyZ2VTdHJlYW0iLCAiZ2V0U3RyZWFtIiwgInByb2Nlc3MiLCAiY3Jvc3NTcGF3biIsICJwYXRoIiwgImNoaWxkUHJvY2VzcyIsICJpbXBvcnRfZnMiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9wYXRoIiwgImltcG9ydF9wcm9taXNlcyIsICJwYXRoIiwgInN0cmVhbVppcCIsICJpbXBvcnRfZnMiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfYXBpIiwgImNhcHR1cmVFeGNlcHRpb25SYXljYXN0IiwgImltcG9ydF9mcyIsICJ1cmwiLCAicGF0aCIsICJodHRwcyIsICJodHRwIiwgImltcG9ydF9hcGkiLCAiUmF5Y2FzdENhY2hlIiwgInVybCIsICJpbXBvcnRfYXBpIiwgImNhbGxiYWNrRXhlYyJdCn0K
