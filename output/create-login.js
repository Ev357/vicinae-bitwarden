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
      const environment7 = options.env || process.env;
      const platform2 = options.platform || process.platform;
      if (platform2 !== "win32") {
        return "PATH";
      }
      return Object.keys(environment7).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
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
    var { promisify: promisify3 } = require("util");
    var bufferStream = require_buffer_stream();
    var streamPipelinePromisified = promisify3(stream.pipeline);
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

// src/create-login.tsx
var create_login_exports = {};
__export(create_login_exports, {
  default: () => create_login_default
});
module.exports = __toCommonJS(create_login_exports);
var import_api29 = require("@raycast/api");

// node_modules/@raycast/utils/dist/module.js
var import_react = __toESM(require("react"));
var import_api = require("@raycast/api");

// node_modules/dequal/lite/index.mjs
var has = Object.prototype.hasOwnProperty;
function dequal(foo, bar) {
  var ctor, len;
  if (foo === bar) return true;
  if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
    if (ctor === Date) return foo.getTime() === bar.getTime();
    if (ctor === RegExp) return foo.toString() === bar.toString();
    if (ctor === Array) {
      if ((len = foo.length) === bar.length) {
        while (len-- && dequal(foo[len], bar[len])) ;
      }
      return len === -1;
    }
    if (!ctor || typeof foo === "object") {
      len = 0;
      for (ctor in foo) {
        if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
        if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
      }
      return Object.keys(bar).length === len;
    }
  }
  return foo !== foo && bar !== bar;
}

// node_modules/@raycast/utils/dist/module.js
var import_node_fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));
var import_jsx_runtime = require("react/jsx-runtime");
function $a57ed8effbd797c7$export$722debc0e56fea39(value) {
  const ref = (0, import_react.useRef)(value);
  const signalRef = (0, import_react.useRef)(0);
  if (!(0, dequal)(value, ref.current)) {
    ref.current = value;
    signalRef.current += 1;
  }
  return (0, import_react.useMemo)(() => ref.current, [
    signalRef.current
  ]);
}
function $bfcf6ee368b3bd9f$export$d4b699e2c1148419(value) {
  const ref = (0, import_react.useRef)(value);
  ref.current = value;
  return ref;
}
function $c718fd03aba6111c$export$80e5033e369189f3(error, options) {
  const message = error instanceof Error ? error.message : String(error);
  return (0, import_api.showToast)({
    style: (0, import_api.Toast).Style.Failure,
    title: options?.title ?? "Something went wrong",
    message: options?.message ?? message,
    primaryAction: options?.primaryAction ?? $c718fd03aba6111c$var$handleErrorToastAction(error),
    secondaryAction: options?.primaryAction ? $c718fd03aba6111c$var$handleErrorToastAction(error) : void 0
  });
}
var $c718fd03aba6111c$var$handleErrorToastAction = (error) => {
  let privateExtension = true;
  let title = "[Extension Name]...";
  let extensionURL = "";
  try {
    const packageJSON = JSON.parse((0, import_node_fs.readFileSync)((0, import_node_path.join)((0, import_api.environment).assetsPath, "..", "package.json"), "utf8"));
    title = `[${packageJSON.title}]...`;
    extensionURL = `https://raycast.com/${packageJSON.owner || packageJSON.author}/${packageJSON.name}`;
    if (!packageJSON.owner || packageJSON.access === "public") privateExtension = false;
  } catch (err) {
  }
  const fallback = (0, import_api.environment).isDevelopment || privateExtension;
  const stack = error instanceof Error ? error?.stack || error?.message || "" : String(error);
  return {
    title: fallback ? "Copy Logs" : "Report Error",
    onAction(toast) {
      toast.hide();
      if (fallback) (0, import_api.Clipboard).copy(stack);
      else (0, import_api.open)(`https://github.com/raycast/extensions/issues/new?&labels=extension%2Cbug&template=extension_bug_report.yml&title=${encodeURIComponent(title)}&extension-url=${encodeURI(extensionURL)}&description=${encodeURIComponent(`#### Error:
\`\`\`
${stack}
\`\`\`
`)}`);
    }
  };
};
function $cefc05764ce5eacd$export$dd6b79aaabe7bc37(fn, args, options) {
  const lastCallId = (0, import_react.useRef)(0);
  const [state, set] = (0, import_react.useState)({
    isLoading: true
  });
  const fnRef = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(fn);
  const latestAbortable = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(options?.abortable);
  const latestArgs = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(args || []);
  const latestOnError = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(options?.onError);
  const latestOnData = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(options?.onData);
  const latestOnWillExecute = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(options?.onWillExecute);
  const latestFailureToast = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(options?.failureToastOptions);
  const latestValue = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(state.data);
  const latestCallback = (0, import_react.useRef)(null);
  const paginationArgsRef = (0, import_react.useRef)({
    page: 0
  });
  const usePaginationRef = (0, import_react.useRef)(false);
  const hasMoreRef = (0, import_react.useRef)(true);
  const pageSizeRef = (0, import_react.useRef)(50);
  const abort = (0, import_react.useCallback)(() => {
    if (latestAbortable.current) {
      latestAbortable.current.current?.abort();
      latestAbortable.current.current = new AbortController();
    }
    return ++lastCallId.current;
  }, [
    latestAbortable
  ]);
  const callback = (0, import_react.useCallback)((...args2) => {
    const callId = abort();
    latestOnWillExecute.current?.(args2);
    set((prevState) => ({
      ...prevState,
      isLoading: true
    }));
    const promiseOrPaginatedPromise = $cefc05764ce5eacd$var$bindPromiseIfNeeded(fnRef.current)(...args2);
    function handleError(error) {
      if (error.name == "AbortError") return error;
      if (callId === lastCallId.current) {
        if (latestOnError.current) latestOnError.current(error);
        else if ((0, import_api.environment).launchType !== (0, import_api.LaunchType).Background) (0, $c718fd03aba6111c$export$80e5033e369189f3)(error, {
          title: "Failed to fetch latest data",
          primaryAction: {
            title: "Retry",
            onAction(toast) {
              toast.hide();
              latestCallback.current?.(...latestArgs.current || []);
            }
          },
          ...latestFailureToast.current
        });
        set({
          error,
          isLoading: false
        });
      }
      return error;
    }
    if (typeof promiseOrPaginatedPromise === "function") {
      usePaginationRef.current = true;
      return promiseOrPaginatedPromise(paginationArgsRef.current).then(
        // @ts-expect-error too complicated for TS
        ({ data, hasMore, cursor }) => {
          if (callId === lastCallId.current) {
            if (paginationArgsRef.current) {
              paginationArgsRef.current.cursor = cursor;
              paginationArgsRef.current.lastItem = data?.[data.length - 1];
            }
            if (latestOnData.current) latestOnData.current(data, paginationArgsRef.current);
            if (hasMore) pageSizeRef.current = data.length;
            hasMoreRef.current = hasMore;
            set((previousData) => {
              if (paginationArgsRef.current.page === 0) return {
                data,
                isLoading: false
              };
              return {
                data: (previousData.data || [])?.concat(data),
                isLoading: false
              };
            });
          }
          return data;
        },
        (error) => {
          hasMoreRef.current = false;
          return handleError(error);
        }
      );
    }
    usePaginationRef.current = false;
    return promiseOrPaginatedPromise.then((data) => {
      if (callId === lastCallId.current) {
        if (latestOnData.current) latestOnData.current(data);
        set({
          data,
          isLoading: false
        });
      }
      return data;
    }, handleError);
  }, [
    latestOnData,
    latestOnError,
    latestArgs,
    fnRef,
    set,
    latestCallback,
    latestOnWillExecute,
    paginationArgsRef,
    latestFailureToast,
    abort
  ]);
  latestCallback.current = callback;
  const revalidate = (0, import_react.useCallback)(() => {
    paginationArgsRef.current = {
      page: 0
    };
    const args2 = latestArgs.current || [];
    return callback(...args2);
  }, [
    callback,
    latestArgs
  ]);
  const mutate = (0, import_react.useCallback)(async (asyncUpdate, options2) => {
    let dataBeforeOptimisticUpdate;
    try {
      if (options2?.optimisticUpdate) {
        abort();
        if (typeof options2?.rollbackOnError !== "function" && options2?.rollbackOnError !== false)
          dataBeforeOptimisticUpdate = structuredClone(latestValue.current?.value);
        const update = options2.optimisticUpdate;
        set((prevState) => ({
          ...prevState,
          data: update(prevState.data)
        }));
      }
      return await asyncUpdate;
    } catch (err) {
      if (typeof options2?.rollbackOnError === "function") {
        const update = options2.rollbackOnError;
        set((prevState) => ({
          ...prevState,
          data: update(prevState.data)
        }));
      } else if (options2?.optimisticUpdate && options2?.rollbackOnError !== false) set((prevState) => ({
        ...prevState,
        data: dataBeforeOptimisticUpdate
      }));
      throw err;
    } finally {
      if (options2?.shouldRevalidateAfter !== false) {
        if ((0, import_api.environment).launchType === (0, import_api.LaunchType).Background || (0, import_api.environment).commandMode === "menu-bar")
          await revalidate();
        else revalidate();
      }
    }
  }, [
    revalidate,
    latestValue,
    set,
    abort
  ]);
  const onLoadMore = (0, import_react.useCallback)(() => {
    paginationArgsRef.current.page += 1;
    const args2 = latestArgs.current || [];
    callback(...args2);
  }, [
    paginationArgsRef,
    latestArgs,
    callback
  ]);
  (0, import_react.useEffect)(() => {
    paginationArgsRef.current = {
      page: 0
    };
    if (options?.execute !== false) callback(...args || []);
    else
      abort();
  }, [
    (0, $a57ed8effbd797c7$export$722debc0e56fea39)([
      args,
      options?.execute,
      callback
    ]),
    latestAbortable,
    paginationArgsRef
  ]);
  (0, import_react.useEffect)(() => {
    return () => {
      abort();
    };
  }, [
    abort
  ]);
  const isLoading = options?.execute !== false ? state.isLoading : false;
  const stateWithLoadingFixed = {
    ...state,
    isLoading
  };
  const pagination = usePaginationRef.current ? {
    pageSize: pageSizeRef.current,
    hasMore: hasMoreRef.current,
    onLoadMore
  } : void 0;
  return {
    ...stateWithLoadingFixed,
    revalidate,
    mutate,
    pagination
  };
}
function $cefc05764ce5eacd$var$bindPromiseIfNeeded(fn) {
  if (fn === Promise.all)
    return fn.bind(Promise);
  if (fn === Promise.race)
    return fn.bind(Promise);
  if (fn === Promise.resolve)
    return fn.bind(Promise);
  if (fn === Promise.reject)
    return fn.bind(Promise);
  return fn;
}
function $e2e1ea6dd3b7d2e1$export$b644b65666fe0c18(key, _value) {
  const value = this[key];
  if (value instanceof Date) return `__raycast_cached_date__${value.toISOString()}`;
  if (Buffer.isBuffer(value)) return `__raycast_cached_buffer__${value.toString("base64")}`;
  return _value;
}
function $e2e1ea6dd3b7d2e1$export$63698c10df99509c(_key, value) {
  if (typeof value === "string" && value.startsWith("__raycast_cached_date__")) return new Date(value.replace("__raycast_cached_date__", ""));
  if (typeof value === "string" && value.startsWith("__raycast_cached_buffer__")) return Buffer.from(value.replace("__raycast_cached_buffer__", ""), "base64");
  return value;
}
var $c40d7eded38ca69c$var$rootCache = /* @__PURE__ */ Symbol("cache without namespace");
var $c40d7eded38ca69c$var$cacheMap = /* @__PURE__ */ new Map();
function $c40d7eded38ca69c$export$14afb9e4c16377d3(key, initialState2, config) {
  const cacheKey = config?.cacheNamespace || $c40d7eded38ca69c$var$rootCache;
  const cache = $c40d7eded38ca69c$var$cacheMap.get(cacheKey) || $c40d7eded38ca69c$var$cacheMap.set(cacheKey, new (0, import_api.Cache)({
    namespace: config?.cacheNamespace
  })).get(cacheKey);
  if (!cache) throw new Error("Missing cache");
  const keyRef = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(key);
  const initialValueRef = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(initialState2);
  const cachedState = (0, import_react.useSyncExternalStore)(cache.subscribe, () => {
    try {
      return cache.get(keyRef.current);
    } catch (error) {
      console.error("Could not get Cache data:", error);
      return void 0;
    }
  });
  const state = (0, import_react.useMemo)(() => {
    if (typeof cachedState !== "undefined") {
      if (cachedState === "undefined") return void 0;
      try {
        return JSON.parse(cachedState, (0, $e2e1ea6dd3b7d2e1$export$63698c10df99509c));
      } catch (err) {
        console.warn("The cached data is corrupted", err);
        return initialValueRef.current;
      }
    } else return initialValueRef.current;
  }, [
    cachedState,
    initialValueRef
  ]);
  const stateRef = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(state);
  const setStateAndCache = (0, import_react.useCallback)((updater) => {
    const newValue = typeof updater === "function" ? updater(stateRef.current) : updater;
    if (typeof newValue === "undefined") cache.set(keyRef.current, "undefined");
    else {
      const stringifiedValue = JSON.stringify(newValue, (0, $e2e1ea6dd3b7d2e1$export$b644b65666fe0c18));
      cache.set(keyRef.current, stringifiedValue);
    }
    return newValue;
  }, [
    cache,
    keyRef,
    stateRef
  ]);
  return [
    state,
    setStateAndCache
  ];
}
var $79498421851e7e84$export$cd58ffd7e3880e66 = /* @__PURE__ */ (function(FormValidation) {
  FormValidation["Required"] = "required";
  return FormValidation;
})({});
function $79498421851e7e84$var$validationError(validation, value) {
  if (validation) {
    if (typeof validation === "function") return validation(value);
    else if (validation === "required") {
      let valueIsValid = typeof value !== "undefined" && value !== null;
      if (valueIsValid) switch (typeof value) {
        case "string":
          valueIsValid = value.length > 0;
          break;
        case "object":
          if (Array.isArray(value)) valueIsValid = value.length > 0;
          else if (value instanceof Date) valueIsValid = value.getTime() > 0;
          break;
        default:
          break;
      }
      if (!valueIsValid) return "The item is required";
    }
  }
}
function $79498421851e7e84$export$87c0cf8eb5a167e0(props) {
  const { onSubmit: _onSubmit, validation, initialValues = {} } = props;
  const [values, setValues] = (0, import_react.useState)(initialValues);
  const [errors, setErrors] = (0, import_react.useState)({});
  const refs = (0, import_react.useRef)({});
  const latestValidation = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(validation || {});
  const latestOnSubmit = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(_onSubmit);
  const focus = (0, import_react.useCallback)((id) => {
    refs.current[id]?.focus();
  }, [
    refs
  ]);
  const handleSubmit = (0, import_react.useCallback)(async (values2) => {
    let validationErrors = false;
    for (const [id, validation2] of Object.entries(latestValidation.current)) {
      const error = $79498421851e7e84$var$validationError(validation2, values2[id]);
      if (error) {
        if (!validationErrors) {
          validationErrors = {};
          focus(id);
        }
        validationErrors[id] = error;
      }
    }
    if (validationErrors) {
      setErrors(validationErrors);
      return false;
    }
    const result = await latestOnSubmit.current(values2);
    return typeof result === "boolean" ? result : true;
  }, [
    latestValidation,
    latestOnSubmit,
    focus
  ]);
  const setValidationError = (0, import_react.useCallback)((id, error) => {
    setErrors((errors2) => ({
      ...errors2,
      [id]: error
    }));
  }, [
    setErrors
  ]);
  const setValue = (0, import_react.useCallback)(function(id, value) {
    setValues((values2) => ({
      ...values2,
      [id]: typeof value === "function" ? value(values2[id]) : value
    }));
  }, [
    setValues
  ]);
  const itemProps = (0, import_react.useMemo)(() => {
    return new Proxy(
      // @ts-expect-error the whole point of a proxy...
      {},
      {
        get(target, id) {
          const validation2 = latestValidation.current[id];
          const value = values[id];
          return {
            onChange(value2) {
              if (errors[id]) {
                const error = $79498421851e7e84$var$validationError(validation2, value2);
                if (!error) setValidationError(id, void 0);
              }
              setValue(id, value2);
            },
            onBlur(event) {
              const error = $79498421851e7e84$var$validationError(validation2, event.target.value);
              if (error) setValidationError(id, error);
            },
            error: errors[id],
            id,
            // we shouldn't return `undefined` otherwise it will be an uncontrolled component
            value: typeof value === "undefined" ? null : value,
            ref: (instance) => {
              refs.current[id] = instance;
            }
          };
        }
      }
    );
  }, [
    errors,
    latestValidation,
    setValidationError,
    values,
    refs,
    setValue
  ]);
  const reset = (0, import_react.useCallback)((values2) => {
    setErrors({});
    Object.entries(refs.current).forEach(([id, ref]) => {
      if (!values2?.[id]) ref?.reset();
    });
    if (values2)
      setValues(values2);
  }, [
    setValues,
    setErrors,
    refs
  ]);
  return {
    handleSubmit,
    setValidationError,
    setValue,
    values,
    itemProps,
    focus,
    reset
  };
}

// src/create-login.tsx
var import_react14 = require("react");

// src/components/actions/ActionWithReprompt.tsx
var import_api20 = require("@raycast/api");

// src/components/searchVault/context/vaultItem.tsx
var import_react2 = require("react");
var VaultItemContext = (0, import_react2.createContext)(null);

// src/utils/hooks/useReprompt.tsx
var import_api19 = require("@raycast/api");

// src/components/RepromptForm.tsx
var import_api2 = require("@raycast/api");
var import_jsx_runtime2 = require("react/jsx-runtime");

// src/context/session/session.tsx
var import_api18 = require("@raycast/api");
var import_react8 = require("react");

// src/components/UnlockForm.tsx
var import_api15 = require("@raycast/api");
var import_react6 = require("react");

// src/constants/general.ts
var import_api3 = require("@raycast/api");
var DEFAULT_SERVER_URL = "https://bitwarden.com";
var SENSITIVE_VALUE_PLACEHOLDER = "HIDDEN-VALUE";
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
var FOLDER_OPTIONS = {
  ALL: "all",
  NO_FOLDER: "no-folder"
};
var CACHE_KEYS = {
  IV: "iv",
  VAULT: "vault",
  CURRENT_FOLDER_ID: "currentFolderId",
  SEND_TYPE_FILTER: "sendTypeFilter",
  CLI_VERSION: "cliVersion"
};
var ITEM_TYPE_TO_ICON_MAP = {
  [1 /* LOGIN */]: import_api3.Icon.Globe,
  [3 /* CARD */]: import_api3.Icon.CreditCard,
  [4 /* IDENTITY */]: import_api3.Icon.Person,
  [2 /* NOTE */]: import_api3.Icon.Document,
  [5 /* SSH_KEY */]: import_api3.Icon.Key
};

// src/context/bitwarden.tsx
var import_react4 = require("react");

// src/api/bitwarden.ts
var import_api9 = require("@raycast/api");

// node_modules/execa/index.js
var import_node_buffer = require("node:buffer");
var import_node_path3 = __toESM(require("node:path"), 1);
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
var import_node_path2 = __toESM(require("node:path"), 1);
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
  let cwdPath = import_node_path2.default.resolve(cwdString);
  const result = [];
  while (previous !== cwdPath) {
    result.push(import_node_path2.default.join(cwdPath, "node_modules/.bin"));
    previous = cwdPath;
    cwdPath = import_node_path2.default.resolve(cwdPath, "..");
  }
  result.push(import_node_path2.default.resolve(cwdString, execPath, ".."));
  return [...result, path_].join(import_node_path2.default.delimiter);
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
  if (import_node_process2.default.platform === "win32" && import_node_path3.default.basename(file, ".exe") === "cmd") {
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

// src/utils/passwords.ts
var import_api4 = require("@raycast/api");
var import_crypto = require("crypto");

// src/constants/passwords.ts
var REPROMPT_HASH_SALT = "foobarbazzybaz";
var DEFAULT_PASSWORD_OPTIONS = {
  lowercase: true,
  uppercase: true,
  number: false,
  special: false,
  passphrase: false,
  length: "14",
  words: "3",
  separator: "-",
  capitalize: false,
  includeNumber: false,
  minNumber: "1",
  minSpecial: "1"
};

// src/utils/passwords.ts
function getPasswordGeneratingArgs(options) {
  return Object.entries(options).flatMap(([arg, value]) => value ? [`--${arg}`, value] : []);
}
function hashMasterPasswordForReprompting(password) {
  return new Promise((resolve, reject) => {
    (0, import_crypto.pbkdf2)(password, REPROMPT_HASH_SALT, 1e5, 64, "sha512", (error, hashed) => {
      if (error != null) {
        reject(error);
        return;
      }
      resolve(hashed.toString("hex"));
    });
  });
}
async function getPasswordGeneratorOptions() {
  const storedOptions = await import_api4.LocalStorage.getItem(LOCAL_STORAGE_KEY.PASSWORD_OPTIONS);
  return {
    ...DEFAULT_PASSWORD_OPTIONS,
    ...storedOptions ? JSON.parse(storedOptions) : {}
  };
}

// src/utils/preferences.ts
var import_api5 = require("@raycast/api");

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
  const { serverUrl } = (0, import_api5.getPreferenceValues)();
  return !serverUrl || serverUrl === "bitwarden.com" || serverUrl === "https://bitwarden.com" ? void 0 : serverUrl;
}
function getLabelForTimeoutPreference(timeout) {
  return VAULT_TIMEOUT_MS_TO_LABEL[timeout];
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
var FailedToLoadVaultItemsError = class extends ManuallyThrownError {
  constructor(message, stack) {
    super(message ?? "Failed to load vault items", stack);
    this.name = "FailedToLoadVaultItemsError";
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
function getDisplayableErrorMessage(error) {
  if (error instanceof DisplayableError) return error.message;
  return void 0;
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
var import_api6 = require("@raycast/api");
var import_api7 = require("@raycast/api");
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
  if (import_api6.environment.isDevelopment) {
    console.error(desc, error);
  } else if (captureToRaycast) {
    (0, import_api7.captureException)(error);
  }
};
var debugLog = (...args) => {
  if (!import_api6.environment.isDevelopment) return;
  console.debug(...args);
};

// src/utils/crypto.ts
var import_fs2 = require("fs");
var import_crypto2 = require("crypto");
function getFileSha256(filePath) {
  try {
    return (0, import_crypto2.createHash)("sha256").update((0, import_fs2.readFileSync)(filePath)).digest("hex");
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
var import_api8 = require("@raycast/api");
var Cache = new import_api8.Cache({ namespace: "bw-cache" });

// src/utils/platform.ts
var platform = process.platform === "darwin" ? "macos" : "windows";

// src/api/bitwarden.ts
var { supportPath } = import_api9.environment;
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
    this.preferences = (0, import_api9.getPreferenceValues)();
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
        const toast = await (0, import_api9.showToast)(toastOpts);
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
      style: import_api9.Toast.Style.Animated,
      primaryAction: { title: "Open Download Page", onAction: () => (0, import_api9.open)(cliInfo.downloadPage) }
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
      toast.style = import_api9.Toast.Style.Failure;
      unlinkAllSync(zipPath, this.cliPath);
      if (!import_api9.environment.isDevelopment) BinDownloadLogger.logError(error);
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
    const storedServer = await import_api9.LocalStorage.getItem(LOCAL_STORAGE_KEY.SERVER_URL);
    if (!serverUrl || storedServer === serverUrl) return;
    const toast = await this.showToast({
      style: import_api9.Toast.Style.Animated,
      title: "Switching server...",
      message: "Bitwarden server preference changed"
    });
    try {
      try {
        await this.logout();
      } catch {
      }
      await this.exec(["config", "server", serverUrl || DEFAULT_SERVER_URL], { resetVaultTimeout: false });
      await import_api9.LocalStorage.setItem(LOCAL_STORAGE_KEY.SERVER_URL, serverUrl);
      toast.style = import_api9.Toast.Style.Success;
      toast.title = "Success";
      toast.message = "Bitwarden server changed";
    } catch (error) {
      toast.style = import_api9.Toast.Style.Failure;
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
      await import_api9.LocalStorage.setItem(LOCAL_STORAGE_KEY.LAST_ACTIVITY_TIME, (/* @__PURE__ */ new Date()).toISOString());
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
    await import_api9.LocalStorage.setItem(LOCAL_STORAGE_KEY.VAULT_LAST_STATUS, status);
  }
  async getLastSavedVaultStatus() {
    const lastSavedStatus = await import_api9.LocalStorage.getItem(LOCAL_STORAGE_KEY.VAULT_LAST_STATUS);
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

// src/components/LoadingFallback.tsx
var import_api10 = require("@raycast/api");
var import_jsx_runtime3 = require("react/jsx-runtime");
var LoadingFallback = () => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_api10.Form, { isLoading: true });

// src/components/TroubleshootingGuide.tsx
var import_api12 = require("@raycast/api");

// src/components/actions/BugReportOpenAction.tsx
var import_api11 = require("@raycast/api");
var import_jsx_runtime4 = require("react/jsx-runtime");
var BUG_REPORT_URL = "https://github.com/raycast/extensions/issues/new?assignees=&labels=extension%2Cbug&template=extension_bug_report.yml&title=%5BBitwarden%5D+...";
function BugReportOpenAction() {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_api11.Action.OpenInBrowser, { title: "Open Bug Report", url: BUG_REPORT_URL });
}
var BugReportOpenAction_default = BugReportOpenAction;

// src/components/TroubleshootingGuide.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var LINE_BREAK = "\n\n";
var CLI_INSTALLATION_HELP_URL = "https://bitwarden.com/help/cli/#download-and-install";
var getCodeBlock = (content) => `\`\`\`
${content}
\`\`\``;
var TroubleshootingGuide = ({ error }) => {
  const errorString = getErrorString(error);
  const localCliPath = (0, import_api12.getPreferenceValues)().cliPath;
  const isCliDownloadError = error instanceof EnsureCliBinError;
  const needsToInstallCli = localCliPath || error instanceof InstalledCLINotFoundError;
  const messages = [];
  if (needsToInstallCli && !isCliDownloadError) {
    messages.push("# \u26A0\uFE0F Bitwarden CLI not found");
  } else {
    messages.push("# \u{1F4A5} Whoops! Something went wrong");
  }
  if (isCliDownloadError) {
    messages.push(
      `We couldn't download the [Bitwarden CLI](${CLI_INSTALLATION_HELP_URL}), you can always install it on your machine.`
    );
  } else if (needsToInstallCli) {
    const cliPathString = localCliPath ? ` (${localCliPath})` : "";
    messages.push(
      `We couldn't find the [Bitwarden CLI](${CLI_INSTALLATION_HELP_URL}) installed on your machine${cliPathString}.`
    );
  } else {
    messages.push(`The \`${import_api12.environment.commandName}\` command crashed when we were not expecting it to.`);
  }
  messages.push(
    "> Please read the `Setup` section in the [extension's description](https://www.raycast.com/jomifepe/bitwarden) to ensure that everything is properly configured."
  );
  messages.push(
    `**Try restarting the command. If the issue persists, consider [reporting a bug on GitHub](${BUG_REPORT_URL}) to help us fix it.**`
  );
  if (errorString) {
    const isArchError = /incompatible architecture/gi.test(errorString);
    messages.push(
      ">## Technical details \u{1F913}",
      isArchError && `\u26A0\uFE0F We suspect that your Bitwarden CLI was installed using a version of NodeJS that's incompatible with your system architecture (e.g. x64 NodeJS on a M1/Apple Silicon Mac). Please make sure your have the correct versions of your software installed (e.g., ${platform === "macos" ? "Homebrew, " : ""}NodeJS, and Bitwarden CLI).`,
      getCodeBlock(errorString)
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    import_api12.Detail,
    {
      markdown: messages.filter(Boolean).join(LINE_BREAK),
      actions: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_api12.ActionPanel, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_api12.ActionPanel.Section, { title: "Bug Report", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(BugReportOpenAction_default, {}),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(BugReportCollectDataAction_default, {})
        ] }),
        needsToInstallCli && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_api12.Action.OpenInBrowser, { title: "Open Installation Guide", url: CLI_INSTALLATION_HELP_URL })
      ] })
    }
  );
};
var TroubleshootingGuide_default = TroubleshootingGuide;

// src/utils/hooks/useOnceEffect.ts
var import_react3 = require("react");
function useOnceEffect(effect, condition) {
  const hasRun = (0, import_react3.useRef)(false);
  (0, import_react3.useEffect)(() => {
    if (hasRun.current) return;
    if (condition !== void 0 && !condition) return;
    hasRun.current = true;
    void effect();
  }, [condition]);
}
var useOnceEffect_default = useOnceEffect;

// src/context/bitwarden.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
var BitwardenContext = (0, import_react4.createContext)(null);
var BitwardenProvider = ({ children, loadingFallback = /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(LoadingFallback, {}) }) => {
  const [bitwarden, setBitwarden] = (0, import_react4.useState)();
  const [error, setError] = (0, import_react4.useState)();
  useOnceEffect_default(() => {
    void new Bitwarden().initialize().then(setBitwarden).catch(handleBwInitError);
  });
  function handleBwInitError(error2) {
    if (error2 instanceof InstalledCLINotFoundError) {
      setError(error2);
    } else {
      throw error2;
    }
  }
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(TroubleshootingGuide_default, { error });
  if (!bitwarden) return loadingFallback;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(BitwardenContext.Provider, { value: bitwarden, children });
};
var useBitwarden = () => {
  const context = (0, import_react4.useContext)(BitwardenContext);
  if (context == null) {
    throw new Error("useBitwarden must be used within a BitwardenProvider");
  }
  return context;
};

// src/utils/objects.ts
function isObject(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

// src/utils/debug.ts
function treatError(error, options) {
  try {
    const execaError = error;
    let errorString;
    if (execaError?.stderr) {
      errorString = execaError.stderr;
    } else if (error instanceof Error) {
      errorString = `${error.name}: ${error.message}`;
    } else if (isObject(error)) {
      errorString = JSON.stringify(error);
    } else {
      errorString = `${error}`;
    }
    if (!errorString) return "";
    if (!options?.omitSensitiveValue) return errorString;
    return omitSensitiveValueFromString(errorString, options.omitSensitiveValue);
  } catch {
    return "";
  }
}
function omitSensitiveValueFromString(value, sensitiveValue) {
  return value.replace(new RegExp(sensitiveValue, "i"), "[REDACTED]");
}

// src/utils/hooks/useVaultMessages.ts
var import_api13 = require("@raycast/api");
var import_react5 = require("react");
function useVaultMessages() {
  const bitwarden = useBitwarden();
  const [vaultState, setVaultState] = (0, import_react5.useState)(null);
  (0, import_react5.useEffect)(() => {
    void bitwarden.status().then(({ error, result }) => {
      if (!error) setVaultState(result);
    }).catch(() => {
    });
  }, []);
  const shouldShowServer = !!getServerUrlPreference();
  let userMessage = "...";
  let serverMessage = "...";
  if (vaultState) {
    const { status, userEmail, serverUrl } = vaultState;
    userMessage = status == "unauthenticated" ? "\u274C Logged out" : `\u{1F512} Locked (${userEmail})`;
    if (serverUrl) {
      serverMessage = serverUrl || "";
    } else if (!serverUrl && shouldShowServer || serverUrl && !shouldShowServer) {
      void (0, import_api13.confirmAlert)({
        icon: import_api13.Icon.ExclamationMark,
        title: "Restart Required",
        message: "Bitwarden server URL preference has been changed since the extension was opened.",
        primaryAction: {
          title: "Close Extension"
        },
        dismissAction: {
          title: "Close Raycast",
          // Only here to provide the necessary second option
          style: import_api13.Alert.ActionStyle.Cancel
        }
      }).then((closeExtension) => {
        if (closeExtension) {
          void (0, import_api13.popToRoot)();
        } else {
          void (0, import_api13.closeMainWindow)();
        }
      });
    }
  }
  return { userMessage, serverMessage, shouldShowServer };
}
var useVaultMessages_default = useVaultMessages;

// src/utils/localstorage.ts
var import_api14 = require("@raycast/api");
function useLocalStorageItem(key, defaultValue) {
  const { data: value, revalidate, isLoading } = $cefc05764ce5eacd$export$dd6b79aaabe7bc37(() => import_api14.LocalStorage.getItem(key));
  const set = async (value2) => {
    await import_api14.LocalStorage.setItem(key, value2);
    await revalidate();
  };
  const remove = async () => {
    await import_api14.LocalStorage.removeItem(key);
    await revalidate();
  };
  return [value ?? defaultValue, { isLoading, set, remove }];
}

// src/components/UnlockForm.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var UnlockForm = ({ pendingAction = Promise.resolve() }) => {
  const bitwarden = useBitwarden();
  const { userMessage, serverMessage, shouldShowServer } = useVaultMessages_default();
  const [isLoading, setLoading] = (0, import_react6.useState)(false);
  const [unlockError, setUnlockError] = (0, import_react6.useState)(void 0);
  const [showPassword, setShowPassword] = (0, import_react6.useState)(false);
  const [password, setPassword] = (0, import_react6.useState)("");
  const [lockReason, { remove: clearLockReason }] = useLocalStorageItem(LOCAL_STORAGE_KEY.VAULT_LOCK_REASON);
  async function onSubmit() {
    if (password.length === 0) return;
    const toast = await (0, import_api15.showToast)(import_api15.Toast.Style.Animated, "Unlocking Vault...", "Please wait");
    try {
      setLoading(true);
      setUnlockError(void 0);
      await pendingAction;
      const { error, result: vaultState } = await bitwarden.status();
      if (error) throw error;
      if (vaultState.status === "unauthenticated") {
        try {
          const { error: error2 } = await bitwarden.login();
          if (error2) throw error2;
        } catch (error2) {
          const {
            displayableError = `Please check your ${shouldShowServer ? "Server URL, " : ""}API Key and Secret.`,
            treatedError
          } = getUsefulError(error2, password);
          await (0, import_api15.showToast)(import_api15.Toast.Style.Failure, "Failed to log in", displayableError);
          setUnlockError(treatedError);
          captureException("Failed to log in", error2);
          return;
        }
      }
      await bitwarden.unlock(password);
      await clearLockReason();
      await toast.hide();
    } catch (error) {
      const { displayableError = "Please check your credentials", treatedError } = getUsefulError(error, password);
      await (0, import_api15.showToast)(import_api15.Toast.Style.Failure, "Failed to unlock vault", displayableError);
      setUnlockError(treatedError);
      captureException("Failed to unlock vault", error);
    } finally {
      setLoading(false);
    }
  }
  const copyUnlockError = async () => {
    if (!unlockError) return;
    await import_api15.Clipboard.copy(unlockError);
    await (0, import_api15.showToast)(import_api15.Toast.Style.Success, "Error copied to clipboard");
  };
  let PasswordField = import_api15.Form.PasswordField;
  let passwordFieldId = "password";
  if (showPassword) {
    PasswordField = import_api15.Form.TextField;
    passwordFieldId = "plainPassword";
  }
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    import_api15.Form,
    {
      actions: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_api15.ActionPanel, { children: [
        !isLoading && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_api15.Action.SubmitForm, { icon: import_api15.Icon.LockUnlocked, title: "Unlock", onSubmit }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            import_api15.Action,
            {
              icon: showPassword ? import_api15.Icon.EyeDisabled : import_api15.Icon.Eye,
              title: showPassword ? "Hide Password" : "Show Password",
              onAction: () => setShowPassword((prev) => !prev),
              shortcut: { macOS: { key: "e", modifiers: ["opt"] }, windows: { key: "e", modifiers: ["alt"] } }
            }
          )
        ] }),
        !!unlockError && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          import_api15.Action,
          {
            onAction: copyUnlockError,
            title: "Copy Last Error",
            icon: import_api15.Icon.Bug,
            style: import_api15.Action.Style.Destructive
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(DebuggingBugReportingActionSection, {})
      ] }),
      children: [
        shouldShowServer && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_api15.Form.Description, { title: "Server URL", text: serverMessage }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_api15.Form.Description, { title: "Vault Status", text: userMessage }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          PasswordField,
          {
            id: passwordFieldId,
            title: "Master Password",
            value: password,
            onChange: setPassword,
            ref: (field) => field?.focus()
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          import_api15.Form.Description,
          {
            title: "",
            text: `Press ${platform === "macos" ? "\u2325" : "Alt"}+E to ${showPassword ? "hide" : "show"} password`
          }
        ),
        !!lockReason && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_api15.Form.Description, { title: "\u2139\uFE0F", text: lockReason }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(TimeoutInfoDescription, {})
        ] })
      ]
    }
  );
};
function TimeoutInfoDescription() {
  const vaultTimeoutMs = (0, import_api15.getPreferenceValues)().repromptIgnoreDuration;
  const timeoutLabel = getLabelForTimeoutPreference(vaultTimeoutMs);
  if (!timeoutLabel) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    import_api15.Form.Description,
    {
      title: "",
      text: `Timeout is set to ${timeoutLabel}, this can be configured in the extension settings`
    }
  );
}
function getUsefulError(error, password) {
  const treatedError = treatError(error, { omitSensitiveValue: password });
  let displayableError;
  if (/Invalid master password/i.test(treatedError)) {
    displayableError = "Invalid master password";
  } else if (/Invalid API Key/i.test(treatedError)) {
    displayableError = "Invalid Client ID or Secret";
  }
  return { displayableError, treatedError };
}
var UnlockForm_default = UnlockForm;

// src/components/searchVault/VaultLoadingFallback.tsx
var import_api16 = require("@raycast/api");
var import_jsx_runtime8 = require("react/jsx-runtime");
var VaultLoadingFallback = () => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_api16.List, { searchBarPlaceholder: "Search vault", isLoading: true });

// src/context/session/reducer.ts
var import_react7 = require("react");
var initialState = {
  token: void 0,
  passwordHash: void 0,
  isLoading: true,
  isLocked: false,
  isAuthenticated: false
};
var useSessionReducer = () => {
  return (0, import_react7.useReducer)((state, action) => {
    switch (action.type) {
      case "loadState": {
        const { type: _, ...actionPayload } = action;
        return { ...state, ...actionPayload };
      }
      case "lock": {
        return {
          ...state,
          token: void 0,
          passwordHash: void 0,
          isLoading: false,
          isLocked: true
        };
      }
      case "unlock": {
        return {
          ...state,
          token: action.token,
          passwordHash: action.passwordHash,
          isLocked: false,
          isAuthenticated: true
        };
      }
      case "logout": {
        return {
          ...state,
          token: void 0,
          passwordHash: void 0,
          isLocked: true,
          isAuthenticated: false,
          isLoading: false
        };
      }
      case "vaultTimeout": {
        return {
          ...state,
          isLocked: true
        };
      }
      case "finishLoadingSavedState": {
        if (!state.token || !state.passwordHash) {
          throw new Error("Missing required fields: token, passwordHash");
        }
        const hasToken = !!state.token;
        return {
          ...state,
          isLoading: false,
          isLocked: !hasToken,
          isAuthenticated: hasToken
        };
      }
      case "failLoadingSavedState": {
        return {
          ...state,
          isLoading: false,
          isLocked: true
        };
      }
      default: {
        return state;
      }
    }
  }, initialState);
};

// src/context/session/utils.ts
var import_api17 = require("@raycast/api");
var import_child_process = require("child_process");
var import_util = require("util");
var exec = (0, import_util.promisify)(import_child_process.exec);
var SessionStorage = {
  getSavedSession: () => {
    return Promise.all([
      import_api17.LocalStorage.getItem(LOCAL_STORAGE_KEY.SESSION_TOKEN),
      import_api17.LocalStorage.getItem(LOCAL_STORAGE_KEY.REPROMPT_HASH),
      import_api17.LocalStorage.getItem(LOCAL_STORAGE_KEY.LAST_ACTIVITY_TIME),
      import_api17.LocalStorage.getItem(LOCAL_STORAGE_KEY.VAULT_LAST_STATUS)
    ]);
  },
  clearSession: async () => {
    await Promise.all([
      import_api17.LocalStorage.removeItem(LOCAL_STORAGE_KEY.SESSION_TOKEN),
      import_api17.LocalStorage.removeItem(LOCAL_STORAGE_KEY.REPROMPT_HASH)
    ]);
  },
  saveSession: async (token, passwordHash) => {
    await Promise.all([
      import_api17.LocalStorage.setItem(LOCAL_STORAGE_KEY.SESSION_TOKEN, token),
      import_api17.LocalStorage.setItem(LOCAL_STORAGE_KEY.REPROMPT_HASH, passwordHash)
    ]);
  },
  logoutClearSession: async () => {
    await Promise.all([
      import_api17.LocalStorage.removeItem(LOCAL_STORAGE_KEY.SESSION_TOKEN),
      import_api17.LocalStorage.removeItem(LOCAL_STORAGE_KEY.REPROMPT_HASH),
      import_api17.LocalStorage.removeItem(LOCAL_STORAGE_KEY.LAST_ACTIVITY_TIME)
    ]);
  }
};
var checkSystemLockedSinceLastAccess = (lastActivityTime) => {
  return checkSystemLogTimeAfter(lastActivityTime, (time) => getLastSyslog(time, "handleUnlockResult"));
};
var checkSystemSleptSinceLastAccess = (lastActivityTime) => {
  return checkSystemLogTimeAfter(lastActivityTime, (time) => getLastSyslog(time, "sleep 0"));
};
function getLastSyslog(hours, filter) {
  return exec(
    `log show --style syslog --predicate "process == 'loginwindow'" --info --last ${hours}h | grep "${filter}" | tail -n 1`
  );
}
async function checkSystemLogTimeAfter(time, getLogEntry) {
  const lastScreenLockTime = await getSystemLogTime(getLogEntry);
  if (!lastScreenLockTime) return true;
  return new Date(lastScreenLockTime).getTime() > time.getTime();
}
var getSystemLogTime_INCREMENT_HOURS = 2;
var getSystemLogTime_MAX_RETRIES = 5;
async function getSystemLogTime(getLogEntry, timeSpanHours = 1, retryAttempt = 0) {
  try {
    if (retryAttempt > getSystemLogTime_MAX_RETRIES) {
      debugLog("Max retry attempts reached to get last screen lock time");
      return void 0;
    }
    const { stdout, stderr } = await getLogEntry(timeSpanHours);
    const [logDate, logTime] = stdout?.split(" ") ?? [];
    if (stderr || !logDate || !logTime) {
      return getSystemLogTime(getLogEntry, timeSpanHours + getSystemLogTime_INCREMENT_HOURS, retryAttempt + 1);
    }
    const logFullDate = /* @__PURE__ */ new Date(`${logDate}T${logTime}`);
    if (!logFullDate || logFullDate.toString() === "Invalid Date") return void 0;
    return logFullDate;
  } catch (error) {
    captureException("Failed to get last screen lock time", error);
    return void 0;
  }
}

// src/context/session/session.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
var SessionContext = (0, import_react8.createContext)(null);
function SessionProvider(props) {
  const { children, loadingFallback = /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(VaultLoadingFallback, {}), unlock } = props;
  const bitwarden = useBitwarden();
  const [state, dispatch] = useSessionReducer();
  const pendingActionRef = (0, import_react8.useRef)(Promise.resolve());
  useOnceEffect_default(bootstrapSession, bitwarden);
  async function bootstrapSession() {
    try {
      bitwarden.setActionListener("lock", handleLock).setActionListener("unlock", handleUnlock).setActionListener("logout", handleLogout);
      const [token, passwordHash, lastActivityTimeString, lastVaultStatus] = await SessionStorage.getSavedSession();
      if (!token || !passwordHash) throw new LockVaultError();
      dispatch({ type: "loadState", token, passwordHash });
      bitwarden.setSessionToken(token);
      if (bitwarden.wasCliUpdated) throw new LogoutVaultError(VAULT_LOCK_MESSAGES.CLI_UPDATED);
      if (lastVaultStatus === "locked") throw new LockVaultError();
      if (lastVaultStatus === "unauthenticated") throw new LogoutVaultError();
      if (lastActivityTimeString) {
        const lastActivityTime = new Date(lastActivityTimeString);
        const vaultTimeoutMs = +(0, import_api18.getPreferenceValues)().repromptIgnoreDuration;
        if (platform === "macos" && vaultTimeoutMs === VAULT_TIMEOUT.SYSTEM_LOCK) {
          if (await checkSystemLockedSinceLastAccess(lastActivityTime)) {
            throw new LockVaultError(VAULT_LOCK_MESSAGES.SYSTEM_LOCK);
          }
        } else if (platform === "macos" && vaultTimeoutMs === VAULT_TIMEOUT.SYSTEM_SLEEP) {
          if (await checkSystemSleptSinceLastAccess(lastActivityTime)) {
            throw new LockVaultError(VAULT_LOCK_MESSAGES.SYSTEM_SLEEP);
          }
        } else if (vaultTimeoutMs !== VAULT_TIMEOUT.NEVER) {
          const timeElapseSinceLastActivity = Date.now() - lastActivityTime.getTime();
          if (vaultTimeoutMs === VAULT_TIMEOUT.IMMEDIATELY || timeElapseSinceLastActivity >= vaultTimeoutMs) {
            throw new LockVaultError(VAULT_LOCK_MESSAGES.TIMEOUT);
          }
        }
      }
      dispatch({ type: "finishLoadingSavedState" });
    } catch (error) {
      if (error instanceof LockVaultError) {
        pendingActionRef.current = bitwarden.lock({ reason: error.message, immediate: true, checkVaultStatus: true });
      } else if (error instanceof LogoutVaultError) {
        pendingActionRef.current = bitwarden.logout({ reason: error.message, immediate: true });
      } else {
        pendingActionRef.current = bitwarden.lock({ immediate: true });
        dispatch({ type: "failLoadingSavedState" });
        captureException("Failed to bootstrap session state", error);
      }
    }
  }
  async function handleUnlock(password, token) {
    const passwordHash = await hashMasterPasswordForReprompting(password);
    await SessionStorage.saveSession(token, passwordHash);
    await import_api18.LocalStorage.removeItem(LOCAL_STORAGE_KEY.VAULT_LOCK_REASON);
    dispatch({ type: "unlock", token, passwordHash });
  }
  async function handleLock(reason) {
    await SessionStorage.clearSession();
    if (reason) await import_api18.LocalStorage.setItem(LOCAL_STORAGE_KEY.VAULT_LOCK_REASON, reason);
    dispatch({ type: "lock" });
  }
  async function handleLogout(reason) {
    await SessionStorage.clearSession();
    Cache.clear();
    if (reason) await import_api18.LocalStorage.setItem(LOCAL_STORAGE_KEY.VAULT_LOCK_REASON, reason);
    dispatch({ type: "logout" });
  }
  async function confirmMasterPassword(password) {
    const enteredPasswordHash = await hashMasterPasswordForReprompting(password);
    return enteredPasswordHash === state.passwordHash;
  }
  const contextValue = (0, import_react8.useMemo)(
    () => ({
      token: state.token,
      isLoading: state.isLoading,
      isAuthenticated: state.isAuthenticated,
      isLocked: state.isLocked,
      active: !state.isLoading && state.isAuthenticated && !state.isLocked,
      confirmMasterPassword
    }),
    [state, confirmMasterPassword]
  );
  if (state.isLoading) return loadingFallback;
  const showUnlockForm = state.isLocked || !state.isAuthenticated;
  const _children = state.token ? children : null;
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SessionContext.Provider, { value: contextValue, children: showUnlockForm && unlock ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(UnlockForm_default, { pendingAction: pendingActionRef.current }) : _children });
}
function useSession() {
  const session = (0, import_react8.useContext)(SessionContext);
  if (session == null) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return session;
}
var LockVaultError = class extends Error {
  constructor(lockReason) {
    super(lockReason);
  }
};
var LogoutVaultError = class extends Error {
  constructor(lockReason) {
    super(lockReason);
  }
};

// src/utils/hooks/useReprompt.tsx
var import_jsx_runtime10 = require("react/jsx-runtime");

// src/components/actions/ActionWithReprompt.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");

// src/components/actions/BugReportCollectDataAction.tsx
var import_api21 = require("@raycast/api");
var import_child_process2 = require("child_process");
var import_util2 = require("util");
var import_fs7 = require("fs");
var import_path3 = require("path");
var import_jsx_runtime12 = require("react/jsx-runtime");
var exec2 = (0, import_util2.promisify)(import_child_process2.exec);
var { supportPath: supportPath2 } = import_api21.environment;
var getSafePreferences = () => {
  const {
    clientId,
    clientSecret,
    fetchFavicons,
    generatePasswordQuickAction,
    repromptIgnoreDuration,
    serverCertsPath,
    serverUrl,
    shouldCacheVaultItems,
    transientCopyGeneratePassword,
    transientCopyGeneratePasswordQuick,
    transientCopySearch,
    windowActionOnCopy
  } = (0, import_api21.getPreferenceValues)();
  return {
    has_clientId: !!clientId,
    has_clientSecret: !!clientSecret,
    fetchFavicons,
    generatePasswordQuickAction,
    repromptIgnoreDuration,
    has_serverCertsPath: !!serverCertsPath,
    has_serverUrl: !!serverUrl,
    shouldCacheVaultItems,
    transientCopyGeneratePassword,
    transientCopyGeneratePasswordQuick,
    transientCopySearch,
    windowActionOnCopy
  };
};
var NA = "N/A";
var tryExec2 = async (command, trimLineBreaks = true) => {
  try {
    let cmd = command;
    if (platform === "windows") {
      cmd = `powershell -Command "${command}"`;
    } else {
      cmd = `PATH="$PATH:${(0, import_path3.dirname)(process.execPath)}" ${command}`;
    }
    const { stdout } = await exec2(cmd, { env: { BITWARDENCLI_APPDATA_DIR: supportPath2 } });
    const response = stdout.trim();
    if (trimLineBreaks) return response.replace(/\n|\r/g, "");
    return response;
  } catch (error) {
    captureException(`Failed to execute command: ${command}`, error);
    return NA;
  }
};
var getBwBinInfo = () => {
  try {
    const cliPathPref = (0, import_api21.getPreferenceValues)().cliPath;
    if (cliPathPref) {
      return { type: "custom", path: cliPathPref };
    }
    if (cliInfo.path.bin === cliInfo.path.downloadedBin) {
      return { type: "downloaded", path: cliInfo.path.downloadedBin };
    }
    return { type: "installed", path: cliInfo.path.installedBin };
  } catch (error) {
    return { type: NA, path: NA };
  }
};
var getHomebrewInfo = async () => {
  try {
    let path3 = "/opt/homebrew/bin/brew";
    if (!(0, import_fs7.existsSync)(path3)) path3 = "/usr/local/bin/brew";
    if (!(0, import_fs7.existsSync)(path3)) return { arch: NA, version: NA };
    const config = await tryExec2(`${path3} config`, false);
    if (config === NA) return { arch: NA, version: NA };
    const archValue = /HOMEBREW_PREFIX: (.+)/.exec(config)?.[1] || NA;
    const version = /HOMEBREW_VERSION: (.+)/.exec(config)?.[1] || NA;
    const arch = archValue !== NA ? archValue.includes("/opt/homebrew") ? "arm64" : "x86_64" : NA;
    return { arch, version };
  } catch (error) {
    return { arch: NA, version: NA };
  }
};
function BugReportCollectDataAction() {
  const collectData = async () => {
    const toast = await (0, import_api21.showToast)(import_api21.Toast.Style.Animated, "Collecting data...");
    try {
      const preferences = getSafePreferences();
      const bwInfo = getBwBinInfo();
      const [systemArch, osVersion, osBuildVersion, bwVersion] = await Promise.all([
        ...platform === "macos" ? [tryExec2("uname -m"), tryExec2("sw_vers -productVersion"), tryExec2("sw_vers -buildVersion")] : [
          tryExec2("(Get-CimInstance Win32_OperatingSystem).OSArchitecture"),
          tryExec2("(Get-CimInstance Win32_OperatingSystem).Caption"),
          tryExec2("(Get-CimInstance Win32_OperatingSystem).Version")
        ],
        tryExec2(`${bwInfo.path} --version`)
      ]);
      const data = {
        raycast: {
          version: import_api21.environment.raycastVersion
        },
        system: {
          arch: systemArch,
          version: osVersion,
          buildVersion: osBuildVersion
        },
        node: {
          arch: process.arch,
          version: process.version
        },
        cli: {
          type: bwInfo.type,
          version: bwVersion
        },
        preferences
      };
      if (platform === "macos") {
        const brewInfo = await getHomebrewInfo();
        data.homebrew = {
          arch: brewInfo.arch,
          version: brewInfo.version
        };
      }
      await import_api21.Clipboard.copy(JSON.stringify(data, null, 2));
      toast.style = import_api21.Toast.Style.Success;
      toast.title = "Data copied to clipboard";
    } catch (error) {
      toast.style = import_api21.Toast.Style.Failure;
      toast.title = "Failed to collect bug report data";
      captureException("Failed to collect bug report data", error);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_api21.Action, { title: "Collect Bug Report Data", icon: import_api21.Icon.Bug, onAction: collectData });
}
var BugReportCollectDataAction_default = BugReportCollectDataAction;

// src/components/actions/CopyRuntimeErrorLog.tsx
var import_api22 = require("@raycast/api");
var import_jsx_runtime13 = require("react/jsx-runtime");
function CopyRuntimeErrorLog() {
  const copyErrors = async () => {
    const errorString = capturedExceptions.toString();
    if (errorString.length === 0) {
      return (0, import_api22.showToast)(import_api22.Toast.Style.Success, "No errors to copy");
    }
    await import_api22.Clipboard.copy(errorString);
    await (0, import_api22.showToast)(import_api22.Toast.Style.Success, "Errors copied to clipboard");
    await (0, import_api22.confirmAlert)({
      title: "Be careful with this information",
      message: "Please be mindful of where you share this error log, as it may contain sensitive information. Always analyze it before sharing.",
      primaryAction: { title: "Got it", style: import_api22.Alert.ActionStyle.Default }
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_api22.Action, { onAction: copyErrors, title: "Copy Last Errors", icon: import_api22.Icon.CopyClipboard, style: import_api22.Action.Style.Regular });
}
var CopyRuntimeErrorLog_default = CopyRuntimeErrorLog;

// src/components/actions/DebuggingBugReportingActionSection.tsx
var import_api23 = require("@raycast/api");

// src/utils/hooks/useCliVersion.ts
var import_react9 = require("react");
var getCliVersion = () => {
  const version = Cache.get(CACHE_KEYS.CLI_VERSION);
  if (version) return parseFloat(version);
  return -1;
};
var useCliVersion = () => {
  const [version, setVersion] = (0, import_react9.useState)(getCliVersion);
  useOnceEffect_default(() => {
    Cache.subscribe((key, value) => {
      if (value && key === CACHE_KEYS.CLI_VERSION) {
        setVersion(parseFloat(value) || -1);
      }
    });
  });
  return version;
};

// src/components/actions/DebuggingBugReportingActionSection.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
function DebuggingBugReportingActionSection() {
  const cliVersion = useCliVersion();
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_api23.ActionPanel.Section, { title: `Debugging & Bug Reporting (CLI v${cliVersion})`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(CopyRuntimeErrorLog_default, {}),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(BugReportOpenAction_default, {}),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(BugReportCollectDataAction_default, {})
  ] });
}

// src/components/actions/VaultActionsSection.tsx
var import_api27 = require("@raycast/api");

// src/context/vault.tsx
var import_api26 = require("@raycast/api");
var import_react12 = require("react");

// src/components/searchVault/context/vaultListeners.tsx
var import_react10 = require("react");
var import_jsx_runtime15 = require("react/jsx-runtime");
var VaultListenersContext = (0, import_react10.createContext)(null);
var VaultListenersProvider = ({ children }) => {
  const listeners = (0, import_react10.useRef)(/* @__PURE__ */ new Map());
  const publishItems = (itemsOrError) => {
    if (itemsOrError instanceof FailedToLoadVaultItemsError) {
      listeners.current.forEach((listener) => listener(itemsOrError));
    } else {
      listeners.current.forEach((listener, itemId) => {
        const item = itemsOrError.find((item2) => item2.id === itemId);
        if (item) listener(item);
      });
    }
  };
  const subscribeItem = (itemId, listener) => {
    listeners.current.set(itemId, listener);
    return () => {
      listeners.current.delete(itemId);
    };
  };
  const memoizedValue = (0, import_react10.useMemo)(() => ({ listeners, publishItems, subscribeItem }), []);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(VaultListenersContext.Provider, { value: memoizedValue, children });
};
var useVaultItemPublisher = () => {
  const context = (0, import_react10.useContext)(VaultListenersContext);
  if (context == null) throw new Error("useVaultItemPublisher must be used within a VaultListenersProvider");
  return context.publishItems;
};
var vaultListeners_default = VaultListenersProvider;

// src/components/searchVault/utils/useVaultCaching.ts
var import_api25 = require("@raycast/api");

// src/components/searchVault/utils/caching.ts
function prepareItemsForCache(items) {
  return items.map((item) => ({
    object: item.object,
    id: item.id,
    organizationId: item.organizationId,
    folderId: item.folderId,
    type: item.type,
    name: item.name,
    revisionDate: item.revisionDate,
    creationDate: item.creationDate,
    deletedDate: item.deletedDate,
    favorite: item.favorite,
    reprompt: item.reprompt,
    collectionIds: item.collectionIds,
    secureNote: item.secureNote ? { type: item.secureNote.type } : void 0,
    // sensitive data below
    fields: cleanFields(item.fields),
    login: cleanLogin(item.login),
    identity: cleanIdentity(item.identity),
    card: cleanCard(item.card),
    passwordHistory: cleanPasswordHistory(item.passwordHistory),
    notes: hideIfDefined(item.notes),
    sshKey: cleanSshKey(item.sshKey)
  }));
}
function prepareFoldersForCache(folders) {
  return folders.map((folder) => ({ object: folder.object, id: folder.id, name: folder.name }));
}
function cleanFields(fields) {
  return fields?.map((field) => ({
    name: field.name,
    // necessary for display
    value: hideIfDefined(field.value),
    type: field.type,
    linkedId: field.linkedId
  }));
}
function cleanLogin(login) {
  if (!login) return void 0;
  return {
    username: login.username,
    // necessary for display
    uris: login.uris,
    password: hideIfDefined(login.password),
    passwordRevisionDate: hideIfDefined(login.passwordRevisionDate),
    totp: hideIfDefined(login.totp)
  };
}
function cleanIdentity(identity) {
  if (!identity) return void 0;
  return {
    title: hideIfDefined(identity.title),
    firstName: hideIfDefined(identity.firstName),
    middleName: hideIfDefined(identity.middleName),
    lastName: hideIfDefined(identity.lastName),
    address1: hideIfDefined(identity.address1),
    address2: hideIfDefined(identity.address2),
    address3: hideIfDefined(identity.address3),
    city: hideIfDefined(identity.city),
    state: hideIfDefined(identity.state),
    postalCode: hideIfDefined(identity.postalCode),
    country: hideIfDefined(identity.country),
    company: hideIfDefined(identity.company),
    email: hideIfDefined(identity.email),
    phone: hideIfDefined(identity.phone),
    ssn: hideIfDefined(identity.ssn),
    username: hideIfDefined(identity.username),
    passportNumber: hideIfDefined(identity.passportNumber),
    licenseNumber: hideIfDefined(identity.licenseNumber)
  };
}
function cleanCard(card) {
  if (!card) return void 0;
  return {
    brand: card.brand,
    cardholderName: hideIfDefined(card.cardholderName),
    number: hideIfDefined(card.number),
    expMonth: hideIfDefined(card.expMonth),
    expYear: hideIfDefined(card.expYear),
    code: hideIfDefined(card.code)
  };
}
function cleanPasswordHistory(passwordHistoryItems) {
  return passwordHistoryItems?.map((passwordHistory) => ({
    password: hideIfDefined(passwordHistory.password),
    lastUsedDate: hideIfDefined(passwordHistory.lastUsedDate)
  }));
}
function cleanSshKey(sshKey) {
  if (!sshKey) return void 0;
  return {
    publicKey: sshKey.publicKey,
    keyFingerprint: sshKey.keyFingerprint,
    privateKey: hideIfDefined(sshKey.privateKey)
  };
}
function hideIfDefined(value) {
  if (!value) return value;
  return SENSITIVE_VALUE_PLACEHOLDER;
}

// src/utils/hooks/useContentEncryptor.ts
var import_api24 = require("@raycast/api");
var import_crypto4 = require("crypto");
var import_react11 = require("react");
var ALGORITHM = "aes-256-cbc";
function useContentEncryptor() {
  const { clientSecret } = (0, import_api24.getPreferenceValues)();
  const cipherKeyBuffer = (0, import_react11.useMemo)(() => get32BitSecretKeyBuffer(clientSecret.trim()), [clientSecret]);
  const encrypt = (data) => {
    const ivBuffer = (0, import_crypto4.randomBytes)(16);
    const cipher = (0, import_crypto4.createCipheriv)(ALGORITHM, cipherKeyBuffer, ivBuffer);
    const encryptedContentBuffer = Buffer.concat([cipher.update(data), cipher.final()]);
    return { iv: ivBuffer.toString("hex"), content: encryptedContentBuffer.toString("hex") };
  };
  const decrypt = (content, iv) => {
    const decipher = (0, import_crypto4.createDecipheriv)(ALGORITHM, cipherKeyBuffer, Buffer.from(iv, "hex"));
    const decryptedContentBuffer = Buffer.concat([decipher.update(Buffer.from(content, "hex")), decipher.final()]);
    return decryptedContentBuffer.toString();
  };
  return { encrypt, decrypt };
}
function get32BitSecretKeyBuffer(key) {
  return Buffer.from((0, import_crypto4.createHash)("sha256").update(key).digest("base64").slice(0, 32));
}

// src/components/searchVault/utils/useVaultCaching.ts
function useVaultCaching() {
  const { encrypt, decrypt } = useContentEncryptor();
  const isCachingEnable = (0, import_api25.getPreferenceValues)().shouldCacheVaultItems;
  useOnceEffect_default(() => {
    if (!Cache.isEmpty) Cache.clear();
  }, !isCachingEnable);
  const getCachedVault = () => {
    try {
      if (!isCachingEnable) throw new VaultCachingNoEnabledError();
      const cachedIv = Cache.get(CACHE_KEYS.IV);
      const cachedEncryptedVault = Cache.get(CACHE_KEYS.VAULT);
      if (!cachedIv || !cachedEncryptedVault) throw new VaultCachingNoEnabledError();
      const decryptedVault = decrypt(cachedEncryptedVault, cachedIv);
      return JSON.parse(decryptedVault);
    } catch (error) {
      if (!(error instanceof VaultCachingNoEnabledError)) {
        captureException("Failed to decrypt cached vault", error);
      }
      return { items: [], folders: [] };
    }
  };
  const cacheVault = (items, folders) => {
    try {
      if (!isCachingEnable) throw new VaultCachingNoEnabledError();
      const vaultToEncrypt = JSON.stringify({
        items: prepareItemsForCache(items),
        folders: prepareFoldersForCache(folders)
      });
      const encryptedVault = encrypt(vaultToEncrypt);
      Cache.set(CACHE_KEYS.VAULT, encryptedVault.content);
      Cache.set(CACHE_KEYS.IV, encryptedVault.iv);
    } catch (error) {
      if (!(error instanceof VaultCachingNoEnabledError)) {
        captureException("Failed to cache vault", error);
      }
    }
  };
  return { getCachedVault, cacheVault };
}
var VaultCachingNoEnabledError = class extends Error {
};
var useVaultCaching_default = useVaultCaching;

// src/context/vault.tsx
var import_jsx_runtime16 = require("react/jsx-runtime");
var VaultContext = (0, import_react12.createContext)(null);
function getInitialState() {
  return { items: [], folders: [], isLoading: true };
}
var { syncOnLaunch } = (0, import_api26.getPreferenceValues)();
function VaultProvider(props) {
  const { children } = props;
  const session = useSession();
  const bitwarden = useBitwarden();
  const publishItems = useVaultItemPublisher();
  const { getCachedVault, cacheVault } = useVaultCaching_default();
  const [currentFolderId, setCurrentFolderId] = $c40d7eded38ca69c$export$14afb9e4c16377d3(CACHE_KEYS.CURRENT_FOLDER_ID, null);
  const [state, setState] = (0, import_react12.useReducer)(
    (previous, next) => ({ ...previous, ...next }),
    { ...getInitialState(), ...getCachedVault() }
  );
  useOnceEffect_default(() => {
    if (syncOnLaunch) {
      void syncItems({ isInitial: true });
    } else {
      void loadItems();
    }
  }, session.active && session.token);
  async function loadItems() {
    try {
      setState({ isLoading: true });
      let items = [];
      let folders = [];
      try {
        const [itemsResult, foldersResult] = await Promise.all([bitwarden.listItems(), bitwarden.listFolders()]);
        if (itemsResult.error) throw itemsResult.error;
        if (foldersResult.error) throw foldersResult.error;
        items = itemsResult.result;
        folders = foldersResult.result;
        items.sort(favoriteItemsFirstSorter);
      } catch (error) {
        publishItems(new FailedToLoadVaultItemsError());
        throw error;
      }
      setState({ items, folders });
      publishItems(items);
      cacheVault(items, folders);
    } catch (error) {
      await (0, import_api26.showToast)(import_api26.Toast.Style.Failure, "Failed to load vault items", getDisplayableErrorMessage(error));
      captureException("Failed to load vault items", error);
    } finally {
      setState({ isLoading: false });
    }
  }
  async function syncItems(props2) {
    const { isInitial = false } = props2 ?? {};
    const toast = await (0, import_api26.showToast)({
      title: "Syncing Vault...",
      message: isInitial ? "Background Task" : void 0,
      style: import_api26.Toast.Style.Animated
    });
    try {
      await bitwarden.sync();
      await loadItems();
      await toast.hide();
    } catch (error) {
      await bitwarden.logout();
      toast.style = import_api26.Toast.Style.Failure;
      toast.title = "Failed to sync vault";
      toast.message = getDisplayableErrorMessage(error);
    }
  }
  function setCurrentFolder(folderOrId) {
    setCurrentFolderId(typeof folderOrId === "string" ? folderOrId : folderOrId?.id);
  }
  function updateState(next) {
    const newState = typeof next === "function" ? next(state) : next;
    setState(newState);
    cacheVault(newState.items, newState.folders);
  }
  const memoizedValue = (0, import_react12.useMemo)(
    () => ({
      ...state,
      items: filterItemsByFolderId(state.items, currentFolderId),
      isEmpty: state.items.length == 0,
      isLoading: state.isLoading || session.isLoading,
      currentFolderId,
      syncItems,
      loadItems,
      setCurrentFolder,
      updateState
    }),
    [state, session.isLoading, currentFolderId, syncItems, loadItems, setCurrentFolder, updateState]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(VaultContext.Provider, { value: memoizedValue, children });
}
function filterItemsByFolderId(items, folderId) {
  if (!folderId || folderId === FOLDER_OPTIONS.ALL) return items;
  if (folderId === FOLDER_OPTIONS.NO_FOLDER) return items.filter((item) => item.folderId === null);
  return items.filter((item) => item.folderId === folderId);
}
function favoriteItemsFirstSorter(a, b) {
  if (a.favorite && b.favorite) return 0;
  return a.favorite ? -1 : 1;
}
var useVaultContext = () => {
  const context = (0, import_react12.useContext)(VaultContext);
  if (context == null) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
};

// src/components/actions/VaultActionsSection.tsx
var import_jsx_runtime17 = require("react/jsx-runtime");

// src/components/RootErrorBoundary.tsx
var import_api28 = require("@raycast/api");
var import_react13 = require("react");
var import_jsx_runtime18 = require("react/jsx-runtime");
var RootErrorBoundary = class extends import_react13.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  async componentDidCatch(error, errorInfo) {
    if (error instanceof ManuallyThrownError) {
      this.setState((state) => ({ ...state, hasError: true, error: error.message }));
      await (0, import_api28.showToast)(import_api28.Toast.Style.Failure, error.message);
    } else {
      if (import_api28.environment.isDevelopment) {
        this.setState((state) => ({ ...state, hasError: true, error: error.message }));
      }
      console.error("Error:", error, errorInfo);
    }
  }
  render() {
    try {
      if (this.state.hasError) return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(TroubleshootingGuide_default, { error: this.state.error });
      return this.props.children;
    } catch {
      return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(TroubleshootingGuide_default, {});
    }
  }
};

// src/create-login.tsx
var import_jsx_runtime19 = require("react/jsx-runtime");
var CreateLoginCommand = () => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(RootErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(BitwardenProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(SessionProvider, { unlock: true, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(vaultListeners_default, { children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(VaultProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(CreateLoginComponent, {}) }) }) }) }) });
function CreateLoginComponent() {
  const bitwarden = useBitwarden();
  const { folders } = useVaultContext();
  const [isSubmitting, setIsSubmitting] = (0, import_react14.useState)(false);
  async function onSubmit(values) {
    const toast = await (0, import_api29.showToast)({ title: "Creating Login...", style: import_api29.Toast.Style.Animated });
    setIsSubmitting(true);
    try {
      const { name, username, visiblePassword, hiddenPassword, folderId, uri } = values;
      const password = showPassword ? visiblePassword : hiddenPassword;
      const effectiveFolderId = folderId === FOLDER_OPTIONS.NO_FOLDER ? null : folderId;
      const { error } = await bitwarden.createLoginItem({
        name,
        username: username || void 0,
        password,
        folderId: effectiveFolderId,
        uri: uri || void 0
      });
      if (error) throw error;
      toast.style = import_api29.Toast.Style.Success;
      toast.title = "Login created";
      toast.message = name;
      reset();
      await (0, import_api29.showHUD)(`Login created: ${name}`, { clearRootSearch: true, popToRootType: import_api29.PopToRootType.Immediate });
    } catch (error) {
      toast.style = import_api29.Toast.Style.Failure;
      toast.title = "Failed to create login";
      toast.message = void 0;
    } finally {
      setIsSubmitting(false);
    }
  }
  const [showPassword, setShowPassword] = (0, import_react14.useState)(false);
  const { itemProps, handleSubmit, focus, reset } = $79498421851e7e84$export$87c0cf8eb5a167e0({
    onSubmit,
    initialValues: {
      name: "",
      username: "",
      visiblePassword: "",
      hiddenPassword: "",
      folderId: FOLDER_OPTIONS.NO_FOLDER,
      uri: ""
    },
    validation: {
      name: $79498421851e7e84$export$cd58ffd7e3880e66.Required,
      visiblePassword: showPassword ? $79498421851e7e84$export$cd58ffd7e3880e66.Required : void 0,
      hiddenPassword: showPassword ? void 0 : $79498421851e7e84$export$cd58ffd7e3880e66.Required
    }
  });
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => {
      const next = !prev;
      setTimeout(() => next ? focus("visiblePassword") : focus("hiddenPassword"), 0);
      return next;
    });
  };
  (0, import_react14.useEffect)(() => {
    focus("name");
  }, []);
  const generatePassword = async () => {
    if (isSubmitting) return;
    const toast = await (0, import_api29.showToast)({ title: "Generating password...", style: import_api29.Toast.Style.Animated });
    try {
      const options = await getPasswordGeneratorOptions();
      const generatedPassword = await bitwarden.generatePassword(options);
      itemProps.visiblePassword.onChange?.(generatedPassword);
      itemProps.hiddenPassword.onChange?.(generatedPassword);
      await import_api29.Clipboard.copy(generatedPassword);
      toast.title = "Password generated and copied";
      toast.style = import_api29.Toast.Style.Success;
    } catch (error) {
      toast.title = "Failed to generate password";
      toast.style = import_api29.Toast.Style.Failure;
    }
  };
  const passwordFieldProps = {
    title: "Password",
    placeholder: "Enter password",
    onChange: (value) => {
      itemProps.visiblePassword.onChange?.(value);
      itemProps.hiddenPassword.onChange?.(value);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
    import_api29.Form,
    {
      isLoading: isSubmitting,
      actions: /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_api29.ActionPanel, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Action.SubmitForm, { title: "Create Login", onSubmit: handleSubmit, icon: import_api29.Icon.NewDocument }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          import_api29.Action,
          {
            icon: showPassword ? import_api29.Icon.EyeDisabled : import_api29.Icon.Eye,
            title: showPassword ? "Hide Password" : "Show Password",
            onAction: togglePasswordVisibility,
            shortcut: { macOS: { key: "e", modifiers: ["opt"] }, windows: { key: "e", modifiers: ["alt"] } }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          import_api29.Action,
          {
            icon: import_api29.Icon.Key,
            title: "Generate Password",
            onAction: generatePassword,
            shortcut: { macOS: { key: "g", modifiers: ["opt"] }, windows: { key: "g", modifiers: ["alt"] } }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(DebuggingBugReportingActionSection, {})
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form.TextField, { ...itemProps.name, title: "Name", placeholder: "GitHub, Gmail", storeValue: false }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form.Dropdown, { ...itemProps.folderId, title: "Folder", placeholder: "Select folder", storeValue: false, children: folders.map((folder) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          import_api29.Form.Dropdown.Item,
          {
            value: folder.id ?? FOLDER_OPTIONS.NO_FOLDER,
            title: folder.name,
            icon: import_api29.Icon.Folder
          },
          folder.id
        )) }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form.TextField, { ...itemProps.username, title: "Username", placeholder: "john.doe@mail.com", storeValue: false }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form.TextField, { ...itemProps.uri, title: "Website URI", placeholder: "example.com", storeValue: false }),
        showPassword ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form.TextField, { ...itemProps.visiblePassword, ...passwordFieldProps }) : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form.PasswordField, { ...itemProps.hiddenPassword, ...passwordFieldProps }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          import_api29.Form.Description,
          {
            title: "",
            text: `Press ${platform === "macos" ? "\u2325" : "Alt"}+E to ${showPassword ? "hide" : "show"} password
Press ${platform === "macos" ? "\u2325" : "Alt"}+G to generate password`
          }
        )
      ]
    }
  );
}
var create_login_default = CreateLoginCommand;
/*! Bundled license information:

node-stream-zip/node_stream_zip.js:
  (**
   * @license node-stream-zip | (c) 2020 Antelle | https://github.com/antelle/node-stream-zip/blob/master/LICENSE
   * Portions copyright https://github.com/cthackers/adm-zip | https://raw.githubusercontent.com/cthackers/adm-zip/master/LICENSE
   *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL3dpbmRvd3MuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL21vZGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy93aGljaC93aGljaC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi91dGlsL3Jlc29sdmVDb21tYW5kLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9jcm9zcy1zcGF3bi9saWIvdXRpbC9lc2NhcGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctcmVnZXgvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctY29tbWFuZC9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL3V0aWwvcmVhZFNoZWJhbmcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi9wYXJzZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL2Vub2VudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NpZ25hbC1leGl0L3NpZ25hbHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NpZ25hbC1leGl0L2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9nZXQtc3RyZWFtL2J1ZmZlci1zdHJlYW0uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2dldC1zdHJlYW0vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL21lcmdlLXN0cmVhbS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvbm9kZS1zdHJlYW0temlwL25vZGVfc3RyZWFtX3ppcC5qcyIsICIuLi9zcmMvY3JlYXRlLWxvZ2luLnRzeCIsICIuLi9ub2RlX21vZHVsZXMvZGVxdWFsL2xpdGUvaW5kZXgubWpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9pbmRleC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlUHJvbWlzZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlRGVlcE1lbW8udHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUxhdGVzdC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvc2hvd0ZhaWx1cmVUb2FzdC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlQ2FjaGVkU3RhdGUudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2hlbHBlcnMudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3ZlbmRvcnMvdHlwZS1oYXNoZXIudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUNhY2hlZFByb21pc2UudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUZldGNoLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9mZXRjaC11dGlscy50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlRXhlYy50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvZXhlYy11dGlscy50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdmVuZG9ycy9zaWduYWwtZXhpdC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlU3RyZWFtSlNPTi50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdmVuZG9ycy9zdHJlYW0tY2hhaW4udHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3ZlbmRvcnMvc3RyZWFtLWpzb24udHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZVNRTC50c3giLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3NxbC11dGlscy50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlRm9ybS50c3giLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUFJLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy91c2VGcmVjZW5jeVNvcnRpbmcudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUxvY2FsU3RvcmFnZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvaWNvbi9pbmRleC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvaWNvbi9hdmF0YXIudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2ljb24vY29sb3IudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2ljb24vZmF2aWNvbi50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvaWNvbi9wcm9ncmVzcy50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvb2F1dGgvaW5kZXgudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL29hdXRoL09BdXRoU2VydmljZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvb2F1dGgvcHJvdmlkZXJzLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9vYXV0aC93aXRoQWNjZXNzVG9rZW4udHN4IiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9jcmVhdGVEZWVwbGluay50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvZXhlY3V0ZVNRTC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvcnVuLWFwcGxlc2NyaXB0LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9ydW4tcG93ZXJzaGVsbC1zY3JpcHQudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2NhY2hlLnRzIiwgIi4uL3NyYy9jb21wb25lbnRzL2FjdGlvbnMvQWN0aW9uV2l0aFJlcHJvbXB0LnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9zZWFyY2hWYXVsdC9jb250ZXh0L3ZhdWx0SXRlbS50c3giLCAiLi4vc3JjL3V0aWxzL2hvb2tzL3VzZVJlcHJvbXB0LnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9SZXByb21wdEZvcm0udHN4IiwgIi4uL3NyYy9jb250ZXh0L3Nlc3Npb24vc2Vzc2lvbi50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvVW5sb2NrRm9ybS50c3giLCAiLi4vc3JjL2NvbnN0YW50cy9nZW5lcmFsLnRzIiwgIi4uL3NyYy9jb250ZXh0L2JpdHdhcmRlbi50c3giLCAiLi4vc3JjL2FwaS9iaXR3YXJkZW4udHMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9zdHJpcC1maW5hbC1uZXdsaW5lL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ucG0tcnVuLXBhdGgvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL25wbS1ydW4tcGF0aC9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL21pbWljLWZuL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9vbmV0aW1lL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9tYWluLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9yZWFsdGltZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvaHVtYW4tc2lnbmFscy9idWlsZC9zcmMvc2lnbmFscy5qcyIsICIuLi9ub2RlX21vZHVsZXMvaHVtYW4tc2lnbmFscy9idWlsZC9zcmMvY29yZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvbGliL2Vycm9yLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9leGVjYS9saWIvc3RkaW8uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9raWxsLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9pcy1zdHJlYW0vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9zdHJlYW0uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9wcm9taXNlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9leGVjYS9saWIvY29tbWFuZC5qcyIsICIuLi9zcmMvdXRpbHMvcGFzc3dvcmRzLnRzIiwgIi4uL3NyYy9jb25zdGFudHMvcGFzc3dvcmRzLnRzIiwgIi4uL3NyYy91dGlscy9wcmVmZXJlbmNlcy50cyIsICIuLi9zcmMvY29uc3RhbnRzL3ByZWZlcmVuY2VzLnRzIiwgIi4uL3NyYy9jb25zdGFudHMvbGFiZWxzLnRzIiwgIi4uL3NyYy91dGlscy9lcnJvcnMudHMiLCAiLi4vc3JjL3V0aWxzL2ZzLnRzIiwgIi4uL3NyYy91dGlscy9uZXR3b3JrLnRzIiwgIi4uL3NyYy91dGlscy9kZXZlbG9wbWVudC50cyIsICIuLi9zcmMvdXRpbHMvY3J5cHRvLnRzIiwgIi4uL3NyYy9hcGkvYml0d2FyZGVuLmhlbHBlcnMudHMiLCAiLi4vc3JjL3V0aWxzL2NhY2hlLnRzIiwgIi4uL3NyYy91dGlscy9wbGF0Zm9ybS50cyIsICIuLi9zcmMvY29tcG9uZW50cy9Mb2FkaW5nRmFsbGJhY2sudHN4IiwgIi4uL3NyYy9jb21wb25lbnRzL1Ryb3VibGVzaG9vdGluZ0d1aWRlLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9hY3Rpb25zL0J1Z1JlcG9ydE9wZW5BY3Rpb24udHN4IiwgIi4uL3NyYy91dGlscy9ob29rcy91c2VPbmNlRWZmZWN0LnRzIiwgIi4uL3NyYy91dGlscy9vYmplY3RzLnRzIiwgIi4uL3NyYy91dGlscy9kZWJ1Zy50cyIsICIuLi9zcmMvdXRpbHMvaG9va3MvdXNlVmF1bHRNZXNzYWdlcy50cyIsICIuLi9zcmMvdXRpbHMvbG9jYWxzdG9yYWdlLnRzIiwgIi4uL3NyYy9jb21wb25lbnRzL3NlYXJjaFZhdWx0L1ZhdWx0TG9hZGluZ0ZhbGxiYWNrLnRzeCIsICIuLi9zcmMvY29udGV4dC9zZXNzaW9uL3JlZHVjZXIudHMiLCAiLi4vc3JjL2NvbnRleHQvc2Vzc2lvbi91dGlscy50cyIsICIuLi9zcmMvY29tcG9uZW50cy9hY3Rpb25zL0J1Z1JlcG9ydENvbGxlY3REYXRhQWN0aW9uLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9hY3Rpb25zL0NvcHlSdW50aW1lRXJyb3JMb2cudHN4IiwgIi4uL3NyYy9jb21wb25lbnRzL2FjdGlvbnMvRGVidWdnaW5nQnVnUmVwb3J0aW5nQWN0aW9uU2VjdGlvbi50c3giLCAiLi4vc3JjL3V0aWxzL2hvb2tzL3VzZUNsaVZlcnNpb24udHMiLCAiLi4vc3JjL2NvbXBvbmVudHMvYWN0aW9ucy9WYXVsdEFjdGlvbnNTZWN0aW9uLnRzeCIsICIuLi9zcmMvY29udGV4dC92YXVsdC50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvc2VhcmNoVmF1bHQvY29udGV4dC92YXVsdExpc3RlbmVycy50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvc2VhcmNoVmF1bHQvdXRpbHMvdXNlVmF1bHRDYWNoaW5nLnRzIiwgIi4uL3NyYy9jb21wb25lbnRzL3NlYXJjaFZhdWx0L3V0aWxzL2NhY2hpbmcudHMiLCAiLi4vc3JjL3V0aWxzL2hvb2tzL3VzZUNvbnRlbnRFbmNyeXB0b3IudHMiLCAiLi4vc3JjL2NvbXBvbmVudHMvUm9vdEVycm9yQm91bmRhcnkudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJtb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG52YXIgZnMgPSByZXF1aXJlKCdmcycpXG5cbmZ1bmN0aW9uIGNoZWNrUGF0aEV4dCAocGF0aCwgb3B0aW9ucykge1xuICB2YXIgcGF0aGV4dCA9IG9wdGlvbnMucGF0aEV4dCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLnBhdGhFeHQgOiBwcm9jZXNzLmVudi5QQVRIRVhUXG5cbiAgaWYgKCFwYXRoZXh0KSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHBhdGhleHQgPSBwYXRoZXh0LnNwbGl0KCc7JylcbiAgaWYgKHBhdGhleHQuaW5kZXhPZignJykgIT09IC0xKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhleHQubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcCA9IHBhdGhleHRbaV0udG9Mb3dlckNhc2UoKVxuICAgIGlmIChwICYmIHBhdGguc3Vic3RyKC1wLmxlbmd0aCkudG9Mb3dlckNhc2UoKSA9PT0gcCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIGNoZWNrU3RhdCAoc3RhdCwgcGF0aCwgb3B0aW9ucykge1xuICBpZiAoIXN0YXQuaXNTeW1ib2xpY0xpbmsoKSAmJiAhc3RhdC5pc0ZpbGUoKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiBjaGVja1BhdGhFeHQocGF0aCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gaXNleGUgKHBhdGgsIG9wdGlvbnMsIGNiKSB7XG4gIGZzLnN0YXQocGF0aCwgZnVuY3Rpb24gKGVyLCBzdGF0KSB7XG4gICAgY2IoZXIsIGVyID8gZmFsc2UgOiBjaGVja1N0YXQoc3RhdCwgcGF0aCwgb3B0aW9ucykpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHN5bmMgKHBhdGgsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNoZWNrU3RhdChmcy5zdGF0U3luYyhwYXRoKSwgcGF0aCwgb3B0aW9ucylcbn1cbiIsICJtb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG52YXIgZnMgPSByZXF1aXJlKCdmcycpXG5cbmZ1bmN0aW9uIGlzZXhlIChwYXRoLCBvcHRpb25zLCBjYikge1xuICBmcy5zdGF0KHBhdGgsIGZ1bmN0aW9uIChlciwgc3RhdCkge1xuICAgIGNiKGVyLCBlciA/IGZhbHNlIDogY2hlY2tTdGF0KHN0YXQsIG9wdGlvbnMpKVxuICB9KVxufVxuXG5mdW5jdGlvbiBzeW5jIChwYXRoLCBvcHRpb25zKSB7XG4gIHJldHVybiBjaGVja1N0YXQoZnMuc3RhdFN5bmMocGF0aCksIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGNoZWNrU3RhdCAoc3RhdCwgb3B0aW9ucykge1xuICByZXR1cm4gc3RhdC5pc0ZpbGUoKSAmJiBjaGVja01vZGUoc3RhdCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gY2hlY2tNb2RlIChzdGF0LCBvcHRpb25zKSB7XG4gIHZhciBtb2QgPSBzdGF0Lm1vZGVcbiAgdmFyIHVpZCA9IHN0YXQudWlkXG4gIHZhciBnaWQgPSBzdGF0LmdpZFxuXG4gIHZhciBteVVpZCA9IG9wdGlvbnMudWlkICE9PSB1bmRlZmluZWQgP1xuICAgIG9wdGlvbnMudWlkIDogcHJvY2Vzcy5nZXR1aWQgJiYgcHJvY2Vzcy5nZXR1aWQoKVxuICB2YXIgbXlHaWQgPSBvcHRpb25zLmdpZCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLmdpZCA6IHByb2Nlc3MuZ2V0Z2lkICYmIHByb2Nlc3MuZ2V0Z2lkKClcblxuICB2YXIgdSA9IHBhcnNlSW50KCcxMDAnLCA4KVxuICB2YXIgZyA9IHBhcnNlSW50KCcwMTAnLCA4KVxuICB2YXIgbyA9IHBhcnNlSW50KCcwMDEnLCA4KVxuICB2YXIgdWcgPSB1IHwgZ1xuXG4gIHZhciByZXQgPSAobW9kICYgbykgfHxcbiAgICAobW9kICYgZykgJiYgZ2lkID09PSBteUdpZCB8fFxuICAgIChtb2QgJiB1KSAmJiB1aWQgPT09IG15VWlkIHx8XG4gICAgKG1vZCAmIHVnKSAmJiBteVVpZCA9PT0gMFxuXG4gIHJldHVybiByZXRcbn1cbiIsICJ2YXIgZnMgPSByZXF1aXJlKCdmcycpXG52YXIgY29yZVxuaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgfHwgZ2xvYmFsLlRFU1RJTkdfV0lORE9XUykge1xuICBjb3JlID0gcmVxdWlyZSgnLi93aW5kb3dzLmpzJylcbn0gZWxzZSB7XG4gIGNvcmUgPSByZXF1aXJlKCcuL21vZGUuanMnKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG5mdW5jdGlvbiBpc2V4ZSAocGF0aCwgb3B0aW9ucywgY2IpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IHt9XG4gIH1cblxuICBpZiAoIWNiKSB7XG4gICAgaWYgKHR5cGVvZiBQcm9taXNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYWxsYmFjayBub3QgcHJvdmlkZWQnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBpc2V4ZShwYXRoLCBvcHRpb25zIHx8IHt9LCBmdW5jdGlvbiAoZXIsIGlzKSB7XG4gICAgICAgIGlmIChlcikge1xuICAgICAgICAgIHJlamVjdChlcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKGlzKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBjb3JlKHBhdGgsIG9wdGlvbnMgfHwge30sIGZ1bmN0aW9uIChlciwgaXMpIHtcbiAgICAvLyBpZ25vcmUgRUFDQ0VTIGJlY2F1c2UgdGhhdCBqdXN0IG1lYW5zIHdlIGFyZW4ndCBhbGxvd2VkIHRvIHJ1biBpdFxuICAgIGlmIChlcikge1xuICAgICAgaWYgKGVyLmNvZGUgPT09ICdFQUNDRVMnIHx8IG9wdGlvbnMgJiYgb3B0aW9ucy5pZ25vcmVFcnJvcnMpIHtcbiAgICAgICAgZXIgPSBudWxsXG4gICAgICAgIGlzID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gICAgY2IoZXIsIGlzKVxuICB9KVxufVxuXG5mdW5jdGlvbiBzeW5jIChwYXRoLCBvcHRpb25zKSB7XG4gIC8vIG15IGtpbmdkb20gZm9yIGEgZmlsdGVyZWQgY2F0Y2hcbiAgdHJ5IHtcbiAgICByZXR1cm4gY29yZS5zeW5jKHBhdGgsIG9wdGlvbnMgfHwge30pXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5pZ25vcmVFcnJvcnMgfHwgZXIuY29kZSA9PT0gJ0VBQ0NFUycpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlclxuICAgIH1cbiAgfVxufVxuIiwgImNvbnN0IGlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgfHxcbiAgICBwcm9jZXNzLmVudi5PU1RZUEUgPT09ICdjeWd3aW4nIHx8XG4gICAgcHJvY2Vzcy5lbnYuT1NUWVBFID09PSAnbXN5cydcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuY29uc3QgQ09MT04gPSBpc1dpbmRvd3MgPyAnOycgOiAnOidcbmNvbnN0IGlzZXhlID0gcmVxdWlyZSgnaXNleGUnKVxuXG5jb25zdCBnZXROb3RGb3VuZEVycm9yID0gKGNtZCkgPT5cbiAgT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoYG5vdCBmb3VuZDogJHtjbWR9YCksIHsgY29kZTogJ0VOT0VOVCcgfSlcblxuY29uc3QgZ2V0UGF0aEluZm8gPSAoY21kLCBvcHQpID0+IHtcbiAgY29uc3QgY29sb24gPSBvcHQuY29sb24gfHwgQ09MT05cblxuICAvLyBJZiBpdCBoYXMgYSBzbGFzaCwgdGhlbiB3ZSBkb24ndCBib3RoZXIgc2VhcmNoaW5nIHRoZSBwYXRoZW52LlxuICAvLyBqdXN0IGNoZWNrIHRoZSBmaWxlIGl0c2VsZiwgYW5kIHRoYXQncyBpdC5cbiAgY29uc3QgcGF0aEVudiA9IGNtZC5tYXRjaCgvXFwvLykgfHwgaXNXaW5kb3dzICYmIGNtZC5tYXRjaCgvXFxcXC8pID8gWycnXVxuICAgIDogKFxuICAgICAgW1xuICAgICAgICAvLyB3aW5kb3dzIGFsd2F5cyBjaGVja3MgdGhlIGN3ZCBmaXJzdFxuICAgICAgICAuLi4oaXNXaW5kb3dzID8gW3Byb2Nlc3MuY3dkKCldIDogW10pLFxuICAgICAgICAuLi4ob3B0LnBhdGggfHwgcHJvY2Vzcy5lbnYuUEFUSCB8fFxuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiB2ZXJ5IHVudXN1YWwgKi8gJycpLnNwbGl0KGNvbG9uKSxcbiAgICAgIF1cbiAgICApXG4gIGNvbnN0IHBhdGhFeHRFeGUgPSBpc1dpbmRvd3NcbiAgICA/IG9wdC5wYXRoRXh0IHx8IHByb2Nlc3MuZW52LlBBVEhFWFQgfHwgJy5FWEU7LkNNRDsuQkFUOy5DT00nXG4gICAgOiAnJ1xuICBjb25zdCBwYXRoRXh0ID0gaXNXaW5kb3dzID8gcGF0aEV4dEV4ZS5zcGxpdChjb2xvbikgOiBbJyddXG5cbiAgaWYgKGlzV2luZG93cykge1xuICAgIGlmIChjbWQuaW5kZXhPZignLicpICE9PSAtMSAmJiBwYXRoRXh0WzBdICE9PSAnJylcbiAgICAgIHBhdGhFeHQudW5zaGlmdCgnJylcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGF0aEVudixcbiAgICBwYXRoRXh0LFxuICAgIHBhdGhFeHRFeGUsXG4gIH1cbn1cblxuY29uc3Qgd2hpY2ggPSAoY21kLCBvcHQsIGNiKSA9PiB7XG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBvcHRcbiAgICBvcHQgPSB7fVxuICB9XG4gIGlmICghb3B0KVxuICAgIG9wdCA9IHt9XG5cbiAgY29uc3QgeyBwYXRoRW52LCBwYXRoRXh0LCBwYXRoRXh0RXhlIH0gPSBnZXRQYXRoSW5mbyhjbWQsIG9wdClcbiAgY29uc3QgZm91bmQgPSBbXVxuXG4gIGNvbnN0IHN0ZXAgPSBpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoaSA9PT0gcGF0aEVudi5sZW5ndGgpXG4gICAgICByZXR1cm4gb3B0LmFsbCAmJiBmb3VuZC5sZW5ndGggPyByZXNvbHZlKGZvdW5kKVxuICAgICAgICA6IHJlamVjdChnZXROb3RGb3VuZEVycm9yKGNtZCkpXG5cbiAgICBjb25zdCBwcFJhdyA9IHBhdGhFbnZbaV1cbiAgICBjb25zdCBwYXRoUGFydCA9IC9eXCIuKlwiJC8udGVzdChwcFJhdykgPyBwcFJhdy5zbGljZSgxLCAtMSkgOiBwcFJhd1xuXG4gICAgY29uc3QgcENtZCA9IHBhdGguam9pbihwYXRoUGFydCwgY21kKVxuICAgIGNvbnN0IHAgPSAhcGF0aFBhcnQgJiYgL15cXC5bXFxcXFxcL10vLnRlc3QoY21kKSA/IGNtZC5zbGljZSgwLCAyKSArIHBDbWRcbiAgICAgIDogcENtZFxuXG4gICAgcmVzb2x2ZShzdWJTdGVwKHAsIGksIDApKVxuICB9KVxuXG4gIGNvbnN0IHN1YlN0ZXAgPSAocCwgaSwgaWkpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoaWkgPT09IHBhdGhFeHQubGVuZ3RoKVxuICAgICAgcmV0dXJuIHJlc29sdmUoc3RlcChpICsgMSkpXG4gICAgY29uc3QgZXh0ID0gcGF0aEV4dFtpaV1cbiAgICBpc2V4ZShwICsgZXh0LCB7IHBhdGhFeHQ6IHBhdGhFeHRFeGUgfSwgKGVyLCBpcykgPT4ge1xuICAgICAgaWYgKCFlciAmJiBpcykge1xuICAgICAgICBpZiAob3B0LmFsbClcbiAgICAgICAgICBmb3VuZC5wdXNoKHAgKyBleHQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShwICsgZXh0KVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoc3ViU3RlcChwLCBpLCBpaSArIDEpKVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIGNiID8gc3RlcCgwKS50aGVuKHJlcyA9PiBjYihudWxsLCByZXMpLCBjYikgOiBzdGVwKDApXG59XG5cbmNvbnN0IHdoaWNoU3luYyA9IChjbWQsIG9wdCkgPT4ge1xuICBvcHQgPSBvcHQgfHwge31cblxuICBjb25zdCB7IHBhdGhFbnYsIHBhdGhFeHQsIHBhdGhFeHRFeGUgfSA9IGdldFBhdGhJbmZvKGNtZCwgb3B0KVxuICBjb25zdCBmb3VuZCA9IFtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoRW52Lmxlbmd0aDsgaSArKykge1xuICAgIGNvbnN0IHBwUmF3ID0gcGF0aEVudltpXVxuICAgIGNvbnN0IHBhdGhQYXJ0ID0gL15cIi4qXCIkLy50ZXN0KHBwUmF3KSA/IHBwUmF3LnNsaWNlKDEsIC0xKSA6IHBwUmF3XG5cbiAgICBjb25zdCBwQ21kID0gcGF0aC5qb2luKHBhdGhQYXJ0LCBjbWQpXG4gICAgY29uc3QgcCA9ICFwYXRoUGFydCAmJiAvXlxcLltcXFxcXFwvXS8udGVzdChjbWQpID8gY21kLnNsaWNlKDAsIDIpICsgcENtZFxuICAgICAgOiBwQ21kXG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBhdGhFeHQubGVuZ3RoOyBqICsrKSB7XG4gICAgICBjb25zdCBjdXIgPSBwICsgcGF0aEV4dFtqXVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXMgPSBpc2V4ZS5zeW5jKGN1ciwgeyBwYXRoRXh0OiBwYXRoRXh0RXhlIH0pXG4gICAgICAgIGlmIChpcykge1xuICAgICAgICAgIGlmIChvcHQuYWxsKVxuICAgICAgICAgICAgZm91bmQucHVzaChjdXIpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGN1clxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge31cbiAgICB9XG4gIH1cblxuICBpZiAob3B0LmFsbCAmJiBmb3VuZC5sZW5ndGgpXG4gICAgcmV0dXJuIGZvdW5kXG5cbiAgaWYgKG9wdC5ub3Rocm93KVxuICAgIHJldHVybiBudWxsXG5cbiAgdGhyb3cgZ2V0Tm90Rm91bmRFcnJvcihjbWQpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2hpY2hcbndoaWNoLnN5bmMgPSB3aGljaFN5bmNcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHBhdGhLZXkgPSAob3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IGVudmlyb25tZW50ID0gb3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG5cdGNvbnN0IHBsYXRmb3JtID0gb3B0aW9ucy5wbGF0Zm9ybSB8fCBwcm9jZXNzLnBsYXRmb3JtO1xuXG5cdGlmIChwbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuXHRcdHJldHVybiAnUEFUSCc7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0LmtleXMoZW52aXJvbm1lbnQpLnJldmVyc2UoKS5maW5kKGtleSA9PiBrZXkudG9VcHBlckNhc2UoKSA9PT0gJ1BBVEgnKSB8fCAnUGF0aCc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGhLZXk7XG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBmb3IgdGhlIG5leHQgbWFqb3IgcmVsZWFzZVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IHBhdGhLZXk7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3Qgd2hpY2ggPSByZXF1aXJlKCd3aGljaCcpO1xuY29uc3QgZ2V0UGF0aEtleSA9IHJlcXVpcmUoJ3BhdGgta2V5Jyk7XG5cbmZ1bmN0aW9uIHJlc29sdmVDb21tYW5kQXR0ZW1wdChwYXJzZWQsIHdpdGhvdXRQYXRoRXh0KSB7XG4gICAgY29uc3QgZW52ID0gcGFyc2VkLm9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52O1xuICAgIGNvbnN0IGN3ZCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgY29uc3QgaGFzQ3VzdG9tQ3dkID0gcGFyc2VkLm9wdGlvbnMuY3dkICE9IG51bGw7XG4gICAgLy8gV29ya2VyIHRocmVhZHMgZG8gbm90IGhhdmUgcHJvY2Vzcy5jaGRpcigpXG4gICAgY29uc3Qgc2hvdWxkU3dpdGNoQ3dkID0gaGFzQ3VzdG9tQ3dkICYmIHByb2Nlc3MuY2hkaXIgIT09IHVuZGVmaW5lZCAmJiAhcHJvY2Vzcy5jaGRpci5kaXNhYmxlZDtcblxuICAgIC8vIElmIGEgY3VzdG9tIGBjd2RgIHdhcyBzcGVjaWZpZWQsIHdlIG5lZWQgdG8gY2hhbmdlIHRoZSBwcm9jZXNzIGN3ZFxuICAgIC8vIGJlY2F1c2UgYHdoaWNoYCB3aWxsIGRvIHN0YXQgY2FsbHMgYnV0IGRvZXMgbm90IHN1cHBvcnQgYSBjdXN0b20gY3dkXG4gICAgaWYgKHNob3VsZFN3aXRjaEN3ZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvY2Vzcy5jaGRpcihwYXJzZWQub3B0aW9ucy5jd2QpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIC8qIEVtcHR5ICovXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcmVzb2x2ZWQ7XG5cbiAgICB0cnkge1xuICAgICAgICByZXNvbHZlZCA9IHdoaWNoLnN5bmMocGFyc2VkLmNvbW1hbmQsIHtcbiAgICAgICAgICAgIHBhdGg6IGVudltnZXRQYXRoS2V5KHsgZW52IH0pXSxcbiAgICAgICAgICAgIHBhdGhFeHQ6IHdpdGhvdXRQYXRoRXh0ID8gcGF0aC5kZWxpbWl0ZXIgOiB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLyogRW1wdHkgKi9cbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoc2hvdWxkU3dpdGNoQ3dkKSB7XG4gICAgICAgICAgICBwcm9jZXNzLmNoZGlyKGN3ZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBzdWNjZXNzZnVsbHkgcmVzb2x2ZWQsIGVuc3VyZSB0aGF0IGFuIGFic29sdXRlIHBhdGggaXMgcmV0dXJuZWRcbiAgICAvLyBOb3RlIHRoYXQgd2hlbiBhIGN1c3RvbSBgY3dkYCB3YXMgdXNlZCwgd2UgbmVlZCB0byByZXNvbHZlIHRvIGFuIGFic29sdXRlIHBhdGggYmFzZWQgb24gaXRcbiAgICBpZiAocmVzb2x2ZWQpIHtcbiAgICAgICAgcmVzb2x2ZWQgPSBwYXRoLnJlc29sdmUoaGFzQ3VzdG9tQ3dkID8gcGFyc2VkLm9wdGlvbnMuY3dkIDogJycsIHJlc29sdmVkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzb2x2ZWQ7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVDb21tYW5kKHBhcnNlZCkge1xuICAgIHJldHVybiByZXNvbHZlQ29tbWFuZEF0dGVtcHQocGFyc2VkKSB8fCByZXNvbHZlQ29tbWFuZEF0dGVtcHQocGFyc2VkLCB0cnVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZXNvbHZlQ29tbWFuZDtcbiIsICIndXNlIHN0cmljdCc7XG5cbi8vIFNlZSBodHRwOi8vd3d3LnJvYnZhbmRlcndvdWRlLmNvbS9lc2NhcGVjaGFycy5waHBcbmNvbnN0IG1ldGFDaGFyc1JlZ0V4cCA9IC8oWygpXFxdWyUhXlwiYDw+Jnw7LCAqP10pL2c7XG5cbmZ1bmN0aW9uIGVzY2FwZUNvbW1hbmQoYXJnKSB7XG4gICAgLy8gRXNjYXBlIG1ldGEgY2hhcnNcbiAgICBhcmcgPSBhcmcucmVwbGFjZShtZXRhQ2hhcnNSZWdFeHAsICdeJDEnKTtcblxuICAgIHJldHVybiBhcmc7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUFyZ3VtZW50KGFyZywgZG91YmxlRXNjYXBlTWV0YUNoYXJzKSB7XG4gICAgLy8gQ29udmVydCB0byBzdHJpbmdcbiAgICBhcmcgPSBgJHthcmd9YDtcblxuICAgIC8vIEFsZ29yaXRobSBiZWxvdyBpcyBiYXNlZCBvbiBodHRwczovL3FudG0ub3JnL2NtZFxuICAgIC8vIEl0J3Mgc2xpZ2h0bHkgYWx0ZXJlZCB0byBkaXNhYmxlIEpTIGJhY2t0cmFja2luZyB0byBhdm9pZCBoYW5naW5nIG9uIHNwZWNpYWxseSBjcmFmdGVkIGlucHV0XG4gICAgLy8gUGxlYXNlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbW94eXN0dWRpby9ub2RlLWNyb3NzLXNwYXduL3B1bGwvMTYwIGZvciBtb3JlIGluZm9ybWF0aW9uXG5cbiAgICAvLyBTZXF1ZW5jZSBvZiBiYWNrc2xhc2hlcyBmb2xsb3dlZCBieSBhIGRvdWJsZSBxdW90ZTpcbiAgICAvLyBkb3VibGUgdXAgYWxsIHRoZSBiYWNrc2xhc2hlcyBhbmQgZXNjYXBlIHRoZSBkb3VibGUgcXVvdGVcbiAgICBhcmcgPSBhcmcucmVwbGFjZSgvKD89KFxcXFwrPyk/KVxcMVwiL2csICckMSQxXFxcXFwiJyk7XG5cbiAgICAvLyBTZXF1ZW5jZSBvZiBiYWNrc2xhc2hlcyBmb2xsb3dlZCBieSB0aGUgZW5kIG9mIHRoZSBzdHJpbmdcbiAgICAvLyAod2hpY2ggd2lsbCBiZWNvbWUgYSBkb3VibGUgcXVvdGUgbGF0ZXIpOlxuICAgIC8vIGRvdWJsZSB1cCBhbGwgdGhlIGJhY2tzbGFzaGVzXG4gICAgYXJnID0gYXJnLnJlcGxhY2UoLyg/PShcXFxcKz8pPylcXDEkLywgJyQxJDEnKTtcblxuICAgIC8vIEFsbCBvdGhlciBiYWNrc2xhc2hlcyBvY2N1ciBsaXRlcmFsbHlcblxuICAgIC8vIFF1b3RlIHRoZSB3aG9sZSB0aGluZzpcbiAgICBhcmcgPSBgXCIke2FyZ31cImA7XG5cbiAgICAvLyBFc2NhcGUgbWV0YSBjaGFyc1xuICAgIGFyZyA9IGFyZy5yZXBsYWNlKG1ldGFDaGFyc1JlZ0V4cCwgJ14kMScpO1xuXG4gICAgLy8gRG91YmxlIGVzY2FwZSBtZXRhIGNoYXJzIGlmIG5lY2Vzc2FyeVxuICAgIGlmIChkb3VibGVFc2NhcGVNZXRhQ2hhcnMpIHtcbiAgICAgICAgYXJnID0gYXJnLnJlcGxhY2UobWV0YUNoYXJzUmVnRXhwLCAnXiQxJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZztcbn1cblxubW9kdWxlLmV4cG9ydHMuY29tbWFuZCA9IGVzY2FwZUNvbW1hbmQ7XG5tb2R1bGUuZXhwb3J0cy5hcmd1bWVudCA9IGVzY2FwZUFyZ3VtZW50O1xuIiwgIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gL14jISguKikvO1xuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IHNoZWJhbmdSZWdleCA9IHJlcXVpcmUoJ3NoZWJhbmctcmVnZXgnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoc3RyaW5nID0gJycpID0+IHtcblx0Y29uc3QgbWF0Y2ggPSBzdHJpbmcubWF0Y2goc2hlYmFuZ1JlZ2V4KTtcblxuXHRpZiAoIW1hdGNoKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRjb25zdCBbcGF0aCwgYXJndW1lbnRdID0gbWF0Y2hbMF0ucmVwbGFjZSgvIyEgPy8sICcnKS5zcGxpdCgnICcpO1xuXHRjb25zdCBiaW5hcnkgPSBwYXRoLnNwbGl0KCcvJykucG9wKCk7XG5cblx0aWYgKGJpbmFyeSA9PT0gJ2VudicpIHtcblx0XHRyZXR1cm4gYXJndW1lbnQ7XG5cdH1cblxuXHRyZXR1cm4gYXJndW1lbnQgPyBgJHtiaW5hcnl9ICR7YXJndW1lbnR9YCA6IGJpbmFyeTtcbn07XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBzaGViYW5nQ29tbWFuZCA9IHJlcXVpcmUoJ3NoZWJhbmctY29tbWFuZCcpO1xuXG5mdW5jdGlvbiByZWFkU2hlYmFuZyhjb21tYW5kKSB7XG4gICAgLy8gUmVhZCB0aGUgZmlyc3QgMTUwIGJ5dGVzIGZyb20gdGhlIGZpbGVcbiAgICBjb25zdCBzaXplID0gMTUwO1xuICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhzaXplKTtcblxuICAgIGxldCBmZDtcblxuICAgIHRyeSB7XG4gICAgICAgIGZkID0gZnMub3BlblN5bmMoY29tbWFuZCwgJ3InKTtcbiAgICAgICAgZnMucmVhZFN5bmMoZmQsIGJ1ZmZlciwgMCwgc2l6ZSwgMCk7XG4gICAgICAgIGZzLmNsb3NlU3luYyhmZCk7XG4gICAgfSBjYXRjaCAoZSkgeyAvKiBFbXB0eSAqLyB9XG5cbiAgICAvLyBBdHRlbXB0IHRvIGV4dHJhY3Qgc2hlYmFuZyAobnVsbCBpcyByZXR1cm5lZCBpZiBub3QgYSBzaGViYW5nKVxuICAgIHJldHVybiBzaGViYW5nQ29tbWFuZChidWZmZXIudG9TdHJpbmcoKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVhZFNoZWJhbmc7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgcmVzb2x2ZUNvbW1hbmQgPSByZXF1aXJlKCcuL3V0aWwvcmVzb2x2ZUNvbW1hbmQnKTtcbmNvbnN0IGVzY2FwZSA9IHJlcXVpcmUoJy4vdXRpbC9lc2NhcGUnKTtcbmNvbnN0IHJlYWRTaGViYW5nID0gcmVxdWlyZSgnLi91dGlsL3JlYWRTaGViYW5nJyk7XG5cbmNvbnN0IGlzV2luID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJztcbmNvbnN0IGlzRXhlY3V0YWJsZVJlZ0V4cCA9IC9cXC4oPzpjb218ZXhlKSQvaTtcbmNvbnN0IGlzQ21kU2hpbVJlZ0V4cCA9IC9ub2RlX21vZHVsZXNbXFxcXC9dLmJpbltcXFxcL11bXlxcXFwvXStcXC5jbWQkL2k7XG5cbmZ1bmN0aW9uIGRldGVjdFNoZWJhbmcocGFyc2VkKSB7XG4gICAgcGFyc2VkLmZpbGUgPSByZXNvbHZlQ29tbWFuZChwYXJzZWQpO1xuXG4gICAgY29uc3Qgc2hlYmFuZyA9IHBhcnNlZC5maWxlICYmIHJlYWRTaGViYW5nKHBhcnNlZC5maWxlKTtcblxuICAgIGlmIChzaGViYW5nKSB7XG4gICAgICAgIHBhcnNlZC5hcmdzLnVuc2hpZnQocGFyc2VkLmZpbGUpO1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IHNoZWJhbmc7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmVDb21tYW5kKHBhcnNlZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlZC5maWxlO1xufVxuXG5mdW5jdGlvbiBwYXJzZU5vblNoZWxsKHBhcnNlZCkge1xuICAgIGlmICghaXNXaW4pIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICB9XG5cbiAgICAvLyBEZXRlY3QgJiBhZGQgc3VwcG9ydCBmb3Igc2hlYmFuZ3NcbiAgICBjb25zdCBjb21tYW5kRmlsZSA9IGRldGVjdFNoZWJhbmcocGFyc2VkKTtcblxuICAgIC8vIFdlIGRvbid0IG5lZWQgYSBzaGVsbCBpZiB0aGUgY29tbWFuZCBmaWxlbmFtZSBpcyBhbiBleGVjdXRhYmxlXG4gICAgY29uc3QgbmVlZHNTaGVsbCA9ICFpc0V4ZWN1dGFibGVSZWdFeHAudGVzdChjb21tYW5kRmlsZSk7XG5cbiAgICAvLyBJZiBhIHNoZWxsIGlzIHJlcXVpcmVkLCB1c2UgY21kLmV4ZSBhbmQgdGFrZSBjYXJlIG9mIGVzY2FwaW5nIGV2ZXJ5dGhpbmcgY29ycmVjdGx5XG4gICAgLy8gTm90ZSB0aGF0IGBmb3JjZVNoZWxsYCBpcyBhbiBoaWRkZW4gb3B0aW9uIHVzZWQgb25seSBpbiB0ZXN0c1xuICAgIGlmIChwYXJzZWQub3B0aW9ucy5mb3JjZVNoZWxsIHx8IG5lZWRzU2hlbGwpIHtcbiAgICAgICAgLy8gTmVlZCB0byBkb3VibGUgZXNjYXBlIG1ldGEgY2hhcnMgaWYgdGhlIGNvbW1hbmQgaXMgYSBjbWQtc2hpbSBsb2NhdGVkIGluIGBub2RlX21vZHVsZXMvLmJpbi9gXG4gICAgICAgIC8vIFRoZSBjbWQtc2hpbSBzaW1wbHkgY2FsbHMgZXhlY3V0ZSB0aGUgcGFja2FnZSBiaW4gZmlsZSB3aXRoIE5vZGVKUywgcHJveHlpbmcgYW55IGFyZ3VtZW50XG4gICAgICAgIC8vIEJlY2F1c2UgdGhlIGVzY2FwZSBvZiBtZXRhY2hhcnMgd2l0aCBeIGdldHMgaW50ZXJwcmV0ZWQgd2hlbiB0aGUgY21kLmV4ZSBpcyBmaXJzdCBjYWxsZWQsXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gZG91YmxlIGVzY2FwZSB0aGVtXG4gICAgICAgIGNvbnN0IG5lZWRzRG91YmxlRXNjYXBlTWV0YUNoYXJzID0gaXNDbWRTaGltUmVnRXhwLnRlc3QoY29tbWFuZEZpbGUpO1xuXG4gICAgICAgIC8vIE5vcm1hbGl6ZSBwb3NpeCBwYXRocyBpbnRvIE9TIGNvbXBhdGlibGUgcGF0aHMgKGUuZy46IGZvby9iYXIgLT4gZm9vXFxiYXIpXG4gICAgICAgIC8vIFRoaXMgaXMgbmVjZXNzYXJ5IG90aGVyd2lzZSBpdCB3aWxsIGFsd2F5cyBmYWlsIHdpdGggRU5PRU5UIGluIHRob3NlIGNhc2VzXG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gcGF0aC5ub3JtYWxpemUocGFyc2VkLmNvbW1hbmQpO1xuXG4gICAgICAgIC8vIEVzY2FwZSBjb21tYW5kICYgYXJndW1lbnRzXG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gZXNjYXBlLmNvbW1hbmQocGFyc2VkLmNvbW1hbmQpO1xuICAgICAgICBwYXJzZWQuYXJncyA9IHBhcnNlZC5hcmdzLm1hcCgoYXJnKSA9PiBlc2NhcGUuYXJndW1lbnQoYXJnLCBuZWVkc0RvdWJsZUVzY2FwZU1ldGFDaGFycykpO1xuXG4gICAgICAgIGNvbnN0IHNoZWxsQ29tbWFuZCA9IFtwYXJzZWQuY29tbWFuZF0uY29uY2F0KHBhcnNlZC5hcmdzKS5qb2luKCcgJyk7XG5cbiAgICAgICAgcGFyc2VkLmFyZ3MgPSBbJy9kJywgJy9zJywgJy9jJywgYFwiJHtzaGVsbENvbW1hbmR9XCJgXTtcbiAgICAgICAgcGFyc2VkLmNvbW1hbmQgPSBwcm9jZXNzLmVudi5jb21zcGVjIHx8ICdjbWQuZXhlJztcbiAgICAgICAgcGFyc2VkLm9wdGlvbnMud2luZG93c1ZlcmJhdGltQXJndW1lbnRzID0gdHJ1ZTsgLy8gVGVsbCBub2RlJ3Mgc3Bhd24gdGhhdCB0aGUgYXJndW1lbnRzIGFyZSBhbHJlYWR5IGVzY2FwZWRcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyc2VkO1xufVxuXG5mdW5jdGlvbiBwYXJzZShjb21tYW5kLCBhcmdzLCBvcHRpb25zKSB7XG4gICAgLy8gTm9ybWFsaXplIGFyZ3VtZW50cywgc2ltaWxhciB0byBub2RlanNcbiAgICBpZiAoYXJncyAmJiAhQXJyYXkuaXNBcnJheShhcmdzKSkge1xuICAgICAgICBvcHRpb25zID0gYXJncztcbiAgICAgICAgYXJncyA9IG51bGw7XG4gICAgfVxuXG4gICAgYXJncyA9IGFyZ3MgPyBhcmdzLnNsaWNlKDApIDogW107IC8vIENsb25lIGFycmF5IHRvIGF2b2lkIGNoYW5naW5nIHRoZSBvcmlnaW5hbFxuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTsgLy8gQ2xvbmUgb2JqZWN0IHRvIGF2b2lkIGNoYW5naW5nIHRoZSBvcmlnaW5hbFxuXG4gICAgLy8gQnVpbGQgb3VyIHBhcnNlZCBvYmplY3RcbiAgICBjb25zdCBwYXJzZWQgPSB7XG4gICAgICAgIGNvbW1hbmQsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIGZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgb3JpZ2luYWw6IHtcbiAgICAgICAgICAgIGNvbW1hbmQsXG4gICAgICAgICAgICBhcmdzLFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICAvLyBEZWxlZ2F0ZSBmdXJ0aGVyIHBhcnNpbmcgdG8gc2hlbGwgb3Igbm9uLXNoZWxsXG4gICAgcmV0dXJuIG9wdGlvbnMuc2hlbGwgPyBwYXJzZWQgOiBwYXJzZU5vblNoZWxsKHBhcnNlZCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBpc1dpbiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG5cbmZ1bmN0aW9uIG5vdEZvdW5kRXJyb3Iob3JpZ2luYWwsIHN5c2NhbGwpIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoYCR7c3lzY2FsbH0gJHtvcmlnaW5hbC5jb21tYW5kfSBFTk9FTlRgKSwge1xuICAgICAgICBjb2RlOiAnRU5PRU5UJyxcbiAgICAgICAgZXJybm86ICdFTk9FTlQnLFxuICAgICAgICBzeXNjYWxsOiBgJHtzeXNjYWxsfSAke29yaWdpbmFsLmNvbW1hbmR9YCxcbiAgICAgICAgcGF0aDogb3JpZ2luYWwuY29tbWFuZCxcbiAgICAgICAgc3Bhd25hcmdzOiBvcmlnaW5hbC5hcmdzLFxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBob29rQ2hpbGRQcm9jZXNzKGNwLCBwYXJzZWQpIHtcbiAgICBpZiAoIWlzV2luKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnaW5hbEVtaXQgPSBjcC5lbWl0O1xuXG4gICAgY3AuZW1pdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmcxKSB7XG4gICAgICAgIC8vIElmIGVtaXR0aW5nIFwiZXhpdFwiIGV2ZW50IGFuZCBleGl0IGNvZGUgaXMgMSwgd2UgbmVlZCB0byBjaGVjayBpZlxuICAgICAgICAvLyB0aGUgY29tbWFuZCBleGlzdHMgYW5kIGVtaXQgYW4gXCJlcnJvclwiIGluc3RlYWRcbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9JbmRpZ29Vbml0ZWQvbm9kZS1jcm9zcy1zcGF3bi9pc3N1ZXMvMTZcbiAgICAgICAgaWYgKG5hbWUgPT09ICdleGl0Jykge1xuICAgICAgICAgICAgY29uc3QgZXJyID0gdmVyaWZ5RU5PRU5UKGFyZzEsIHBhcnNlZCk7XG5cbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxFbWl0LmNhbGwoY3AsICdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3JpZ2luYWxFbWl0LmFwcGx5KGNwLCBhcmd1bWVudHMpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHByZWZlci1yZXN0LXBhcmFtc1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIHZlcmlmeUVOT0VOVChzdGF0dXMsIHBhcnNlZCkge1xuICAgIGlmIChpc1dpbiAmJiBzdGF0dXMgPT09IDEgJiYgIXBhcnNlZC5maWxlKSB7XG4gICAgICAgIHJldHVybiBub3RGb3VuZEVycm9yKHBhcnNlZC5vcmlnaW5hbCwgJ3NwYXduJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHZlcmlmeUVOT0VOVFN5bmMoc3RhdHVzLCBwYXJzZWQpIHtcbiAgICBpZiAoaXNXaW4gJiYgc3RhdHVzID09PSAxICYmICFwYXJzZWQuZmlsZSkge1xuICAgICAgICByZXR1cm4gbm90Rm91bmRFcnJvcihwYXJzZWQub3JpZ2luYWwsICdzcGF3blN5bmMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaG9va0NoaWxkUHJvY2VzcyxcbiAgICB2ZXJpZnlFTk9FTlQsXG4gICAgdmVyaWZ5RU5PRU5UU3luYyxcbiAgICBub3RGb3VuZEVycm9yLFxufTtcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGNwID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuY29uc3QgcGFyc2UgPSByZXF1aXJlKCcuL2xpYi9wYXJzZScpO1xuY29uc3QgZW5vZW50ID0gcmVxdWlyZSgnLi9saWIvZW5vZW50Jyk7XG5cbmZ1bmN0aW9uIHNwYXduKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBQYXJzZSB0aGUgYXJndW1lbnRzXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG5cbiAgICAvLyBTcGF3biB0aGUgY2hpbGQgcHJvY2Vzc1xuICAgIGNvbnN0IHNwYXduZWQgPSBjcC5zcGF3bihwYXJzZWQuY29tbWFuZCwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblxuICAgIC8vIEhvb2sgaW50byBjaGlsZCBwcm9jZXNzIFwiZXhpdFwiIGV2ZW50IHRvIGVtaXQgYW4gZXJyb3IgaWYgdGhlIGNvbW1hbmRcbiAgICAvLyBkb2VzIG5vdCBleGlzdHMsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgIGVub2VudC5ob29rQ2hpbGRQcm9jZXNzKHNwYXduZWQsIHBhcnNlZCk7XG5cbiAgICByZXR1cm4gc3Bhd25lZDtcbn1cblxuZnVuY3Rpb24gc3Bhd25TeW5jKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBQYXJzZSB0aGUgYXJndW1lbnRzXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG5cbiAgICAvLyBTcGF3biB0aGUgY2hpbGQgcHJvY2Vzc1xuICAgIGNvbnN0IHJlc3VsdCA9IGNwLnNwYXduU3luYyhwYXJzZWQuY29tbWFuZCwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblxuICAgIC8vIEFuYWx5emUgaWYgdGhlIGNvbW1hbmQgZG9lcyBub3QgZXhpc3QsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgIHJlc3VsdC5lcnJvciA9IHJlc3VsdC5lcnJvciB8fCBlbm9lbnQudmVyaWZ5RU5PRU5UU3luYyhyZXN1bHQuc3RhdHVzLCBwYXJzZWQpO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzcGF3bjtcbm1vZHVsZS5leHBvcnRzLnNwYXduID0gc3Bhd247XG5tb2R1bGUuZXhwb3J0cy5zeW5jID0gc3Bhd25TeW5jO1xuXG5tb2R1bGUuZXhwb3J0cy5fcGFyc2UgPSBwYXJzZTtcbm1vZHVsZS5leHBvcnRzLl9lbm9lbnQgPSBlbm9lbnQ7XG4iLCAiLy8gVGhpcyBpcyBub3QgdGhlIHNldCBvZiBhbGwgcG9zc2libGUgc2lnbmFscy5cbi8vXG4vLyBJdCBJUywgaG93ZXZlciwgdGhlIHNldCBvZiBhbGwgc2lnbmFscyB0aGF0IHRyaWdnZXJcbi8vIGFuIGV4aXQgb24gZWl0aGVyIExpbnV4IG9yIEJTRCBzeXN0ZW1zLiAgTGludXggaXMgYVxuLy8gc3VwZXJzZXQgb2YgdGhlIHNpZ25hbCBuYW1lcyBzdXBwb3J0ZWQgb24gQlNELCBhbmRcbi8vIHRoZSB1bmtub3duIHNpZ25hbHMganVzdCBmYWlsIHRvIHJlZ2lzdGVyLCBzbyB3ZSBjYW5cbi8vIGNhdGNoIHRoYXQgZWFzaWx5IGVub3VnaC5cbi8vXG4vLyBEb24ndCBib3RoZXIgd2l0aCBTSUdLSUxMLiAgSXQncyB1bmNhdGNoYWJsZSwgd2hpY2hcbi8vIG1lYW5zIHRoYXQgd2UgY2FuJ3QgZmlyZSBhbnkgY2FsbGJhY2tzIGFueXdheS5cbi8vXG4vLyBJZiBhIHVzZXIgZG9lcyBoYXBwZW4gdG8gcmVnaXN0ZXIgYSBoYW5kbGVyIG9uIGEgbm9uLVxuLy8gZmF0YWwgc2lnbmFsIGxpa2UgU0lHV0lOQ0ggb3Igc29tZXRoaW5nLCBhbmQgdGhlblxuLy8gZXhpdCwgaXQnbGwgZW5kIHVwIGZpcmluZyBgcHJvY2Vzcy5lbWl0KCdleGl0JylgLCBzb1xuLy8gdGhlIGhhbmRsZXIgd2lsbCBiZSBmaXJlZCBhbnl3YXkuXG4vL1xuLy8gU0lHQlVTLCBTSUdGUEUsIFNJR1NFR1YgYW5kIFNJR0lMTCwgd2hlbiBub3QgcmFpc2VkXG4vLyBhcnRpZmljaWFsbHksIGluaGVyZW50bHkgbGVhdmUgdGhlIHByb2Nlc3MgaW4gYVxuLy8gc3RhdGUgZnJvbSB3aGljaCBpdCBpcyBub3Qgc2FmZSB0byB0cnkgYW5kIGVudGVyIEpTXG4vLyBsaXN0ZW5lcnMuXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgJ1NJR0FCUlQnLFxuICAnU0lHQUxSTScsXG4gICdTSUdIVVAnLFxuICAnU0lHSU5UJyxcbiAgJ1NJR1RFUk0nXG5dXG5cbmlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSB7XG4gIG1vZHVsZS5leHBvcnRzLnB1c2goXG4gICAgJ1NJR1ZUQUxSTScsXG4gICAgJ1NJR1hDUFUnLFxuICAgICdTSUdYRlNaJyxcbiAgICAnU0lHVVNSMicsXG4gICAgJ1NJR1RSQVAnLFxuICAgICdTSUdTWVMnLFxuICAgICdTSUdRVUlUJyxcbiAgICAnU0lHSU9UJ1xuICAgIC8vIHNob3VsZCBkZXRlY3QgcHJvZmlsZXIgYW5kIGVuYWJsZS9kaXNhYmxlIGFjY29yZGluZ2x5LlxuICAgIC8vIHNlZSAjMjFcbiAgICAvLyAnU0lHUFJPRidcbiAgKVxufVxuXG5pZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2xpbnV4Jykge1xuICBtb2R1bGUuZXhwb3J0cy5wdXNoKFxuICAgICdTSUdJTycsXG4gICAgJ1NJR1BPTEwnLFxuICAgICdTSUdQV1InLFxuICAgICdTSUdTVEtGTFQnLFxuICAgICdTSUdVTlVTRUQnXG4gIClcbn1cbiIsICIvLyBOb3RlOiBzaW5jZSBueWMgdXNlcyB0aGlzIG1vZHVsZSB0byBvdXRwdXQgY292ZXJhZ2UsIGFueSBsaW5lc1xuLy8gdGhhdCBhcmUgaW4gdGhlIGRpcmVjdCBzeW5jIGZsb3cgb2YgbnljJ3Mgb3V0cHV0Q292ZXJhZ2UgYXJlXG4vLyBpZ25vcmVkLCBzaW5jZSB3ZSBjYW4gbmV2ZXIgZ2V0IGNvdmVyYWdlIGZvciB0aGVtLlxuLy8gZ3JhYiBhIHJlZmVyZW5jZSB0byBub2RlJ3MgcmVhbCBwcm9jZXNzIG9iamVjdCByaWdodCBhd2F5XG52YXIgcHJvY2VzcyA9IGdsb2JhbC5wcm9jZXNzXG5cbmNvbnN0IHByb2Nlc3NPayA9IGZ1bmN0aW9uIChwcm9jZXNzKSB7XG4gIHJldHVybiBwcm9jZXNzICYmXG4gICAgdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5lbWl0ID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3MucmVhbGx5RXhpdCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLmxpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLmtpbGwgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5waWQgPT09ICdudW1iZXInICYmXG4gICAgdHlwZW9mIHByb2Nlc3Mub24gPT09ICdmdW5jdGlvbidcbn1cblxuLy8gc29tZSBraW5kIG9mIG5vbi1ub2RlIGVudmlyb25tZW50LCBqdXN0IG5vLW9wXG4vKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbmlmICghcHJvY2Vzc09rKHByb2Nlc3MpKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7fVxuICB9XG59IGVsc2Uge1xuICB2YXIgYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0JylcbiAgdmFyIHNpZ25hbHMgPSByZXF1aXJlKCcuL3NpZ25hbHMuanMnKVxuICB2YXIgaXNXaW4gPSAvXndpbi9pLnRlc3QocHJvY2Vzcy5wbGF0Zm9ybSlcblxuICB2YXIgRUUgPSByZXF1aXJlKCdldmVudHMnKVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKHR5cGVvZiBFRSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIEVFID0gRUUuRXZlbnRFbWl0dGVyXG4gIH1cblxuICB2YXIgZW1pdHRlclxuICBpZiAocHJvY2Vzcy5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfXykge1xuICAgIGVtaXR0ZXIgPSBwcm9jZXNzLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fXG4gIH0gZWxzZSB7XG4gICAgZW1pdHRlciA9IHByb2Nlc3MuX19zaWduYWxfZXhpdF9lbWl0dGVyX18gPSBuZXcgRUUoKVxuICAgIGVtaXR0ZXIuY291bnQgPSAwXG4gICAgZW1pdHRlci5lbWl0dGVkID0ge31cbiAgfVxuXG4gIC8vIEJlY2F1c2UgdGhpcyBlbWl0dGVyIGlzIGEgZ2xvYmFsLCB3ZSBoYXZlIHRvIGNoZWNrIHRvIHNlZSBpZiBhXG4gIC8vIHByZXZpb3VzIHZlcnNpb24gb2YgdGhpcyBsaWJyYXJ5IGZhaWxlZCB0byBlbmFibGUgaW5maW5pdGUgbGlzdGVuZXJzLlxuICAvLyBJIGtub3cgd2hhdCB5b3UncmUgYWJvdXQgdG8gc2F5LiAgQnV0IGxpdGVyYWxseSBldmVyeXRoaW5nIGFib3V0XG4gIC8vIHNpZ25hbC1leGl0IGlzIGEgY29tcHJvbWlzZSB3aXRoIGV2aWwuICBHZXQgdXNlZCB0byBpdC5cbiAgaWYgKCFlbWl0dGVyLmluZmluaXRlKSB7XG4gICAgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoSW5maW5pdHkpXG4gICAgZW1pdHRlci5pbmZpbml0ZSA9IHRydWVcbiAgfVxuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNiLCBvcHRzKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge31cbiAgICB9XG4gICAgYXNzZXJ0LmVxdWFsKHR5cGVvZiBjYiwgJ2Z1bmN0aW9uJywgJ2EgY2FsbGJhY2sgbXVzdCBiZSBwcm92aWRlZCBmb3IgZXhpdCBoYW5kbGVyJylcblxuICAgIGlmIChsb2FkZWQgPT09IGZhbHNlKSB7XG4gICAgICBsb2FkKClcbiAgICB9XG5cbiAgICB2YXIgZXYgPSAnZXhpdCdcbiAgICBpZiAob3B0cyAmJiBvcHRzLmFsd2F5c0xhc3QpIHtcbiAgICAgIGV2ID0gJ2FmdGVyZXhpdCdcbiAgICB9XG5cbiAgICB2YXIgcmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihldiwgY2IpXG4gICAgICBpZiAoZW1pdHRlci5saXN0ZW5lcnMoJ2V4aXQnKS5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgICBlbWl0dGVyLmxpc3RlbmVycygnYWZ0ZXJleGl0JykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHVubG9hZCgpXG4gICAgICB9XG4gICAgfVxuICAgIGVtaXR0ZXIub24oZXYsIGNiKVxuXG4gICAgcmV0dXJuIHJlbW92ZVxuICB9XG5cbiAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uIHVubG9hZCAoKSB7XG4gICAgaWYgKCFsb2FkZWQgfHwgIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsb2FkZWQgPSBmYWxzZVxuXG4gICAgc2lnbmFscy5mb3JFYWNoKGZ1bmN0aW9uIChzaWcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIoc2lnLCBzaWdMaXN0ZW5lcnNbc2lnXSlcbiAgICAgIH0gY2F0Y2ggKGVyKSB7fVxuICAgIH0pXG4gICAgcHJvY2Vzcy5lbWl0ID0gb3JpZ2luYWxQcm9jZXNzRW1pdFxuICAgIHByb2Nlc3MucmVhbGx5RXhpdCA9IG9yaWdpbmFsUHJvY2Vzc1JlYWxseUV4aXRcbiAgICBlbWl0dGVyLmNvdW50IC09IDFcbiAgfVxuICBtb2R1bGUuZXhwb3J0cy51bmxvYWQgPSB1bmxvYWRcblxuICB2YXIgZW1pdCA9IGZ1bmN0aW9uIGVtaXQgKGV2ZW50LCBjb2RlLCBzaWduYWwpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoZW1pdHRlci5lbWl0dGVkW2V2ZW50XSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGVtaXR0ZXIuZW1pdHRlZFtldmVudF0gPSB0cnVlXG4gICAgZW1pdHRlci5lbWl0KGV2ZW50LCBjb2RlLCBzaWduYWwpXG4gIH1cblxuICAvLyB7IDxzaWduYWw+OiA8bGlzdGVuZXIgZm4+LCAuLi4gfVxuICB2YXIgc2lnTGlzdGVuZXJzID0ge31cbiAgc2lnbmFscy5mb3JFYWNoKGZ1bmN0aW9uIChzaWcpIHtcbiAgICBzaWdMaXN0ZW5lcnNbc2lnXSA9IGZ1bmN0aW9uIGxpc3RlbmVyICgpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKCFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIG90aGVyIGxpc3RlbmVycywgYW4gZXhpdCBpcyBjb21pbmchXG4gICAgICAvLyBTaW1wbGVzdCB3YXk6IHJlbW92ZSB1cyBhbmQgdGhlbiByZS1zZW5kIHRoZSBzaWduYWwuXG4gICAgICAvLyBXZSBrbm93IHRoYXQgdGhpcyB3aWxsIGtpbGwgdGhlIHByb2Nlc3MsIHNvIHdlIGNhblxuICAgICAgLy8gc2FmZWx5IGVtaXQgbm93LlxuICAgICAgdmFyIGxpc3RlbmVycyA9IHByb2Nlc3MubGlzdGVuZXJzKHNpZylcbiAgICAgIGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSBlbWl0dGVyLmNvdW50KSB7XG4gICAgICAgIHVubG9hZCgpXG4gICAgICAgIGVtaXQoJ2V4aXQnLCBudWxsLCBzaWcpXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGVtaXQoJ2FmdGVyZXhpdCcsIG51bGwsIHNpZylcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgaWYgKGlzV2luICYmIHNpZyA9PT0gJ1NJR0hVUCcpIHtcbiAgICAgICAgICAvLyBcIlNJR0hVUFwiIHRocm93cyBhbiBgRU5PU1lTYCBlcnJvciBvbiBXaW5kb3dzLFxuICAgICAgICAgIC8vIHNvIHVzZSBhIHN1cHBvcnRlZCBzaWduYWwgaW5zdGVhZFxuICAgICAgICAgIHNpZyA9ICdTSUdJTlQnXG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgcHJvY2Vzcy5raWxsKHByb2Nlc3MucGlkLCBzaWcpXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIG1vZHVsZS5leHBvcnRzLnNpZ25hbHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHNpZ25hbHNcbiAgfVxuXG4gIHZhciBsb2FkZWQgPSBmYWxzZVxuXG4gIHZhciBsb2FkID0gZnVuY3Rpb24gbG9hZCAoKSB7XG4gICAgaWYgKGxvYWRlZCB8fCAhcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxvYWRlZCA9IHRydWVcblxuICAgIC8vIFRoaXMgaXMgdGhlIG51bWJlciBvZiBvblNpZ25hbEV4aXQncyB0aGF0IGFyZSBpbiBwbGF5LlxuICAgIC8vIEl0J3MgaW1wb3J0YW50IHNvIHRoYXQgd2UgY2FuIGNvdW50IHRoZSBjb3JyZWN0IG51bWJlciBvZlxuICAgIC8vIGxpc3RlbmVycyBvbiBzaWduYWxzLCBhbmQgZG9uJ3Qgd2FpdCBmb3IgdGhlIG90aGVyIG9uZSB0b1xuICAgIC8vIGhhbmRsZSBpdCBpbnN0ZWFkIG9mIHVzLlxuICAgIGVtaXR0ZXIuY291bnQgKz0gMVxuXG4gICAgc2lnbmFscyA9IHNpZ25hbHMuZmlsdGVyKGZ1bmN0aW9uIChzaWcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHByb2Nlc3Mub24oc2lnLCBzaWdMaXN0ZW5lcnNbc2lnXSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBwcm9jZXNzLmVtaXQgPSBwcm9jZXNzRW1pdFxuICAgIHByb2Nlc3MucmVhbGx5RXhpdCA9IHByb2Nlc3NSZWFsbHlFeGl0XG4gIH1cbiAgbW9kdWxlLmV4cG9ydHMubG9hZCA9IGxvYWRcblxuICB2YXIgb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdCA9IHByb2Nlc3MucmVhbGx5RXhpdFxuICB2YXIgcHJvY2Vzc1JlYWxseUV4aXQgPSBmdW5jdGlvbiBwcm9jZXNzUmVhbGx5RXhpdCAoY29kZSkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHByb2Nlc3MuZXhpdENvZGUgPSBjb2RlIHx8IC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIDBcbiAgICBlbWl0KCdleGl0JywgcHJvY2Vzcy5leGl0Q29kZSwgbnVsbClcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGVtaXQoJ2FmdGVyZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0LmNhbGwocHJvY2VzcywgcHJvY2Vzcy5leGl0Q29kZSlcbiAgfVxuXG4gIHZhciBvcmlnaW5hbFByb2Nlc3NFbWl0ID0gcHJvY2Vzcy5lbWl0XG4gIHZhciBwcm9jZXNzRW1pdCA9IGZ1bmN0aW9uIHByb2Nlc3NFbWl0IChldiwgYXJnKSB7XG4gICAgaWYgKGV2ID09PSAnZXhpdCcgJiYgcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmIChhcmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwcm9jZXNzLmV4aXRDb2RlID0gYXJnXG4gICAgICB9XG4gICAgICB2YXIgcmV0ID0gb3JpZ2luYWxQcm9jZXNzRW1pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgZW1pdCgnZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgZW1pdCgnYWZ0ZXJleGl0JywgcHJvY2Vzcy5leGl0Q29kZSwgbnVsbClcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICByZXR1cm4gcmV0XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcmlnaW5hbFByb2Nlc3NFbWl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9XG4gIH1cbn1cbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCB7UGFzc1Rocm91Z2g6IFBhc3NUaHJvdWdoU3RyZWFtfSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG9wdGlvbnMgPT4ge1xuXHRvcHRpb25zID0gey4uLm9wdGlvbnN9O1xuXG5cdGNvbnN0IHthcnJheX0gPSBvcHRpb25zO1xuXHRsZXQge2VuY29kaW5nfSA9IG9wdGlvbnM7XG5cdGNvbnN0IGlzQnVmZmVyID0gZW5jb2RpbmcgPT09ICdidWZmZXInO1xuXHRsZXQgb2JqZWN0TW9kZSA9IGZhbHNlO1xuXG5cdGlmIChhcnJheSkge1xuXHRcdG9iamVjdE1vZGUgPSAhKGVuY29kaW5nIHx8IGlzQnVmZmVyKTtcblx0fSBlbHNlIHtcblx0XHRlbmNvZGluZyA9IGVuY29kaW5nIHx8ICd1dGY4Jztcblx0fVxuXG5cdGlmIChpc0J1ZmZlcikge1xuXHRcdGVuY29kaW5nID0gbnVsbDtcblx0fVxuXG5cdGNvbnN0IHN0cmVhbSA9IG5ldyBQYXNzVGhyb3VnaFN0cmVhbSh7b2JqZWN0TW9kZX0pO1xuXG5cdGlmIChlbmNvZGluZykge1xuXHRcdHN0cmVhbS5zZXRFbmNvZGluZyhlbmNvZGluZyk7XG5cdH1cblxuXHRsZXQgbGVuZ3RoID0gMDtcblx0Y29uc3QgY2h1bmtzID0gW107XG5cblx0c3RyZWFtLm9uKCdkYXRhJywgY2h1bmsgPT4ge1xuXHRcdGNodW5rcy5wdXNoKGNodW5rKTtcblxuXHRcdGlmIChvYmplY3RNb2RlKSB7XG5cdFx0XHRsZW5ndGggPSBjaHVua3MubGVuZ3RoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZW5ndGggKz0gY2h1bmsubGVuZ3RoO1xuXHRcdH1cblx0fSk7XG5cblx0c3RyZWFtLmdldEJ1ZmZlcmVkVmFsdWUgPSAoKSA9PiB7XG5cdFx0aWYgKGFycmF5KSB7XG5cdFx0XHRyZXR1cm4gY2h1bmtzO1xuXHRcdH1cblxuXHRcdHJldHVybiBpc0J1ZmZlciA/IEJ1ZmZlci5jb25jYXQoY2h1bmtzLCBsZW5ndGgpIDogY2h1bmtzLmpvaW4oJycpO1xuXHR9O1xuXG5cdHN0cmVhbS5nZXRCdWZmZXJlZExlbmd0aCA9ICgpID0+IGxlbmd0aDtcblxuXHRyZXR1cm4gc3RyZWFtO1xufTtcbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCB7Y29uc3RhbnRzOiBCdWZmZXJDb25zdGFudHN9ID0gcmVxdWlyZSgnYnVmZmVyJyk7XG5jb25zdCBzdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcbmNvbnN0IHtwcm9taXNpZnl9ID0gcmVxdWlyZSgndXRpbCcpO1xuY29uc3QgYnVmZmVyU3RyZWFtID0gcmVxdWlyZSgnLi9idWZmZXItc3RyZWFtJyk7XG5cbmNvbnN0IHN0cmVhbVBpcGVsaW5lUHJvbWlzaWZpZWQgPSBwcm9taXNpZnkoc3RyZWFtLnBpcGVsaW5lKTtcblxuY2xhc3MgTWF4QnVmZmVyRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCdtYXhCdWZmZXIgZXhjZWVkZWQnKTtcblx0XHR0aGlzLm5hbWUgPSAnTWF4QnVmZmVyRXJyb3InO1xuXHR9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFN0cmVhbShpbnB1dFN0cmVhbSwgb3B0aW9ucykge1xuXHRpZiAoIWlucHV0U3RyZWFtKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBhIHN0cmVhbScpO1xuXHR9XG5cblx0b3B0aW9ucyA9IHtcblx0XHRtYXhCdWZmZXI6IEluZmluaXR5LFxuXHRcdC4uLm9wdGlvbnNcblx0fTtcblxuXHRjb25zdCB7bWF4QnVmZmVyfSA9IG9wdGlvbnM7XG5cdGNvbnN0IHN0cmVhbSA9IGJ1ZmZlclN0cmVhbShvcHRpb25zKTtcblxuXHRhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0Y29uc3QgcmVqZWN0UHJvbWlzZSA9IGVycm9yID0+IHtcblx0XHRcdC8vIERvbid0IHJldHJpZXZlIGFuIG92ZXJzaXplZCBidWZmZXIuXG5cdFx0XHRpZiAoZXJyb3IgJiYgc3RyZWFtLmdldEJ1ZmZlcmVkTGVuZ3RoKCkgPD0gQnVmZmVyQ29uc3RhbnRzLk1BWF9MRU5HVEgpIHtcblx0XHRcdFx0ZXJyb3IuYnVmZmVyZWREYXRhID0gc3RyZWFtLmdldEJ1ZmZlcmVkVmFsdWUoKTtcblx0XHRcdH1cblxuXHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHR9O1xuXG5cdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF3YWl0IHN0cmVhbVBpcGVsaW5lUHJvbWlzaWZpZWQoaW5wdXRTdHJlYW0sIHN0cmVhbSk7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdHJlamVjdFByb21pc2UoZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pKCk7XG5cblx0XHRzdHJlYW0ub24oJ2RhdGEnLCAoKSA9PiB7XG5cdFx0XHRpZiAoc3RyZWFtLmdldEJ1ZmZlcmVkTGVuZ3RoKCkgPiBtYXhCdWZmZXIpIHtcblx0XHRcdFx0cmVqZWN0UHJvbWlzZShuZXcgTWF4QnVmZmVyRXJyb3IoKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiBzdHJlYW0uZ2V0QnVmZmVyZWRWYWx1ZSgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFN0cmVhbTtcbm1vZHVsZS5leHBvcnRzLmJ1ZmZlciA9IChzdHJlYW0sIG9wdGlvbnMpID0+IGdldFN0cmVhbShzdHJlYW0sIHsuLi5vcHRpb25zLCBlbmNvZGluZzogJ2J1ZmZlcid9KTtcbm1vZHVsZS5leHBvcnRzLmFycmF5ID0gKHN0cmVhbSwgb3B0aW9ucykgPT4gZ2V0U3RyZWFtKHN0cmVhbSwgey4uLm9wdGlvbnMsIGFycmF5OiB0cnVlfSk7XG5tb2R1bGUuZXhwb3J0cy5NYXhCdWZmZXJFcnJvciA9IE1heEJ1ZmZlckVycm9yO1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgeyBQYXNzVGhyb3VnaCB9ID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKC8qc3RyZWFtcy4uLiovKSB7XG4gIHZhciBzb3VyY2VzID0gW11cbiAgdmFyIG91dHB1dCAgPSBuZXcgUGFzc1Rocm91Z2goe29iamVjdE1vZGU6IHRydWV9KVxuXG4gIG91dHB1dC5zZXRNYXhMaXN0ZW5lcnMoMClcblxuICBvdXRwdXQuYWRkID0gYWRkXG4gIG91dHB1dC5pc0VtcHR5ID0gaXNFbXB0eVxuXG4gIG91dHB1dC5vbigndW5waXBlJywgcmVtb3ZlKVxuXG4gIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuZm9yRWFjaChhZGQpXG5cbiAgcmV0dXJuIG91dHB1dFxuXG4gIGZ1bmN0aW9uIGFkZCAoc291cmNlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgc291cmNlLmZvckVhY2goYWRkKVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICBzb3VyY2VzLnB1c2goc291cmNlKTtcbiAgICBzb3VyY2Uub25jZSgnZW5kJywgcmVtb3ZlLmJpbmQobnVsbCwgc291cmNlKSlcbiAgICBzb3VyY2Uub25jZSgnZXJyb3InLCBvdXRwdXQuZW1pdC5iaW5kKG91dHB1dCwgJ2Vycm9yJykpXG4gICAgc291cmNlLnBpcGUob3V0cHV0LCB7ZW5kOiBmYWxzZX0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRW1wdHkgKCkge1xuICAgIHJldHVybiBzb3VyY2VzLmxlbmd0aCA9PSAwO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlIChzb3VyY2UpIHtcbiAgICBzb3VyY2VzID0gc291cmNlcy5maWx0ZXIoZnVuY3Rpb24gKGl0KSB7IHJldHVybiBpdCAhPT0gc291cmNlIH0pXG4gICAgaWYgKCFzb3VyY2VzLmxlbmd0aCAmJiBvdXRwdXQucmVhZGFibGUpIHsgb3V0cHV0LmVuZCgpIH1cbiAgfVxufVxuIiwgIi8qKlxuICogQGxpY2Vuc2Ugbm9kZS1zdHJlYW0temlwIHwgKGMpIDIwMjAgQW50ZWxsZSB8IGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRlbGxlL25vZGUtc3RyZWFtLXppcC9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKiBQb3J0aW9ucyBjb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL2N0aGFja2Vycy9hZG0temlwIHwgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2N0aGFja2Vycy9hZG0temlwL21hc3Rlci9MSUNFTlNFXG4gKi9cblxubGV0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZXZlbnRzID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCB6bGliID0gcmVxdWlyZSgnemxpYicpO1xuY29uc3Qgc3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5cbmNvbnN0IGNvbnN0cyA9IHtcbiAgICAvKiBUaGUgbG9jYWwgZmlsZSBoZWFkZXIgKi9cbiAgICBMT0NIRFI6IDMwLCAvLyBMT0MgaGVhZGVyIHNpemVcbiAgICBMT0NTSUc6IDB4MDQwMzRiNTAsIC8vIFwiUEtcXDAwM1xcMDA0XCJcbiAgICBMT0NWRVI6IDQsIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcbiAgICBMT0NGTEc6IDYsIC8vIGdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZ1xuICAgIExPQ0hPVzogOCwgLy8gY29tcHJlc3Npb24gbWV0aG9kXG4gICAgTE9DVElNOiAxMCwgLy8gbW9kaWZpY2F0aW9uIHRpbWUgKDIgYnl0ZXMgdGltZSwgMiBieXRlcyBkYXRlKVxuICAgIExPQ0NSQzogMTQsIC8vIHVuY29tcHJlc3NlZCBmaWxlIGNyYy0zMiB2YWx1ZVxuICAgIExPQ1NJWjogMTgsIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgIExPQ0xFTjogMjIsIC8vIHVuY29tcHJlc3NlZCBzaXplXG4gICAgTE9DTkFNOiAyNiwgLy8gZmlsZW5hbWUgbGVuZ3RoXG4gICAgTE9DRVhUOiAyOCwgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG5cbiAgICAvKiBUaGUgRGF0YSBkZXNjcmlwdG9yICovXG4gICAgRVhUU0lHOiAweDA4MDc0YjUwLCAvLyBcIlBLXFwwMDdcXDAwOFwiXG4gICAgRVhUSERSOiAxNiwgLy8gRVhUIGhlYWRlciBzaXplXG4gICAgRVhUQ1JDOiA0LCAvLyB1bmNvbXByZXNzZWQgZmlsZSBjcmMtMzIgdmFsdWVcbiAgICBFWFRTSVo6IDgsIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgIEVYVExFTjogMTIsIC8vIHVuY29tcHJlc3NlZCBzaXplXG5cbiAgICAvKiBUaGUgY2VudHJhbCBkaXJlY3RvcnkgZmlsZSBoZWFkZXIgKi9cbiAgICBDRU5IRFI6IDQ2LCAvLyBDRU4gaGVhZGVyIHNpemVcbiAgICBDRU5TSUc6IDB4MDIwMTRiNTAsIC8vIFwiUEtcXDAwMVxcMDAyXCJcbiAgICBDRU5WRU06IDQsIC8vIHZlcnNpb24gbWFkZSBieVxuICAgIENFTlZFUjogNiwgLy8gdmVyc2lvbiBuZWVkZWQgdG8gZXh0cmFjdFxuICAgIENFTkZMRzogOCwgLy8gZW5jcnlwdCwgZGVjcnlwdCBmbGFnc1xuICAgIENFTkhPVzogMTAsIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICAgIENFTlRJTTogMTIsIC8vIG1vZGlmaWNhdGlvbiB0aW1lICgyIGJ5dGVzIHRpbWUsIDIgYnl0ZXMgZGF0ZSlcbiAgICBDRU5DUkM6IDE2LCAvLyB1bmNvbXByZXNzZWQgZmlsZSBjcmMtMzIgdmFsdWVcbiAgICBDRU5TSVo6IDIwLCAvLyBjb21wcmVzc2VkIHNpemVcbiAgICBDRU5MRU46IDI0LCAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuICAgIENFTk5BTTogMjgsIC8vIGZpbGVuYW1lIGxlbmd0aFxuICAgIENFTkVYVDogMzAsIC8vIGV4dHJhIGZpZWxkIGxlbmd0aFxuICAgIENFTkNPTTogMzIsIC8vIGZpbGUgY29tbWVudCBsZW5ndGhcbiAgICBDRU5EU0s6IDM0LCAvLyB2b2x1bWUgbnVtYmVyIHN0YXJ0XG4gICAgQ0VOQVRUOiAzNiwgLy8gaW50ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXG4gICAgQ0VOQVRYOiAzOCwgLy8gZXh0ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzIChob3N0IHN5c3RlbSBkZXBlbmRlbnQpXG4gICAgQ0VOT0ZGOiA0MiwgLy8gTE9DIGhlYWRlciBvZmZzZXRcblxuICAgIC8qIFRoZSBlbnRyaWVzIGluIHRoZSBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnkgKi9cbiAgICBFTkRIRFI6IDIyLCAvLyBFTkQgaGVhZGVyIHNpemVcbiAgICBFTkRTSUc6IDB4MDYwNTRiNTAsIC8vIFwiUEtcXDAwNVxcMDA2XCJcbiAgICBFTkRTSUdGSVJTVDogMHg1MCxcbiAgICBFTkRTVUI6IDgsIC8vIG51bWJlciBvZiBlbnRyaWVzIG9uIHRoaXMgZGlza1xuICAgIEVORFRPVDogMTAsIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzXG4gICAgRU5EU0laOiAxMiwgLy8gY2VudHJhbCBkaXJlY3Rvcnkgc2l6ZSBpbiBieXRlc1xuICAgIEVORE9GRjogMTYsIC8vIG9mZnNldCBvZiBmaXJzdCBDRU4gaGVhZGVyXG4gICAgRU5EQ09NOiAyMCwgLy8gemlwIGZpbGUgY29tbWVudCBsZW5ndGhcbiAgICBNQVhGSUxFQ09NTUVOVDogMHhmZmZmLFxuXG4gICAgLyogVGhlIGVudHJpZXMgaW4gdGhlIGVuZCBvZiBaSVA2NCBjZW50cmFsIGRpcmVjdG9yeSBsb2NhdG9yICovXG4gICAgRU5ETDY0SERSOiAyMCwgLy8gWklQNjQgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5IGxvY2F0b3IgaGVhZGVyIHNpemVcbiAgICBFTkRMNjRTSUc6IDB4MDcwNjRiNTAsIC8vIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBsb2NhdG9yIHNpZ25hdHVyZVxuICAgIEVOREw2NFNJR0ZJUlNUOiAweDUwLFxuICAgIEVOREw2NE9GUzogOCwgLy8gWklQNjQgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5IG9mZnNldFxuXG4gICAgLyogVGhlIGVudHJpZXMgaW4gdGhlIGVuZCBvZiBaSVA2NCBjZW50cmFsIGRpcmVjdG9yeSAqL1xuICAgIEVORDY0SERSOiA1NiwgLy8gWklQNjQgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5IGhlYWRlciBzaXplXG4gICAgRU5ENjRTSUc6IDB4MDYwNjRiNTAsIC8vIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBzaWduYXR1cmVcbiAgICBFTkQ2NFNJR0ZJUlNUOiAweDUwLFxuICAgIEVORDY0U1VCOiAyNCwgLy8gbnVtYmVyIG9mIGVudHJpZXMgb24gdGhpcyBkaXNrXG4gICAgRU5ENjRUT1Q6IDMyLCAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllc1xuICAgIEVORDY0U0laOiA0MCxcbiAgICBFTkQ2NE9GRjogNDgsXG5cbiAgICAvKiBDb21wcmVzc2lvbiBtZXRob2RzICovXG4gICAgU1RPUkVEOiAwLCAvLyBubyBjb21wcmVzc2lvblxuICAgIFNIUlVOSzogMSwgLy8gc2hydW5rXG4gICAgUkVEVUNFRDE6IDIsIC8vIHJlZHVjZWQgd2l0aCBjb21wcmVzc2lvbiBmYWN0b3IgMVxuICAgIFJFRFVDRUQyOiAzLCAvLyByZWR1Y2VkIHdpdGggY29tcHJlc3Npb24gZmFjdG9yIDJcbiAgICBSRURVQ0VEMzogNCwgLy8gcmVkdWNlZCB3aXRoIGNvbXByZXNzaW9uIGZhY3RvciAzXG4gICAgUkVEVUNFRDQ6IDUsIC8vIHJlZHVjZWQgd2l0aCBjb21wcmVzc2lvbiBmYWN0b3IgNFxuICAgIElNUExPREVEOiA2LCAvLyBpbXBsb2RlZFxuICAgIC8vIDcgcmVzZXJ2ZWRcbiAgICBERUZMQVRFRDogOCwgLy8gZGVmbGF0ZWRcbiAgICBFTkhBTkNFRF9ERUZMQVRFRDogOSwgLy8gZGVmbGF0ZTY0XG4gICAgUEtXQVJFOiAxMCwgLy8gUEtXYXJlIERDTCBpbXBsb2RlZFxuICAgIC8vIDExIHJlc2VydmVkXG4gICAgQlpJUDI6IDEyLCAvLyAgY29tcHJlc3NlZCB1c2luZyBCWklQMlxuICAgIC8vIDEzIHJlc2VydmVkXG4gICAgTFpNQTogMTQsIC8vIExaTUFcbiAgICAvLyAxNS0xNyByZXNlcnZlZFxuICAgIElCTV9URVJTRTogMTgsIC8vIGNvbXByZXNzZWQgdXNpbmcgSUJNIFRFUlNFXG4gICAgSUJNX0xaNzc6IDE5LCAvL0lCTSBMWjc3IHpcblxuICAgIC8qIEdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZyAqL1xuICAgIEZMR19FTkM6IDAsIC8vIGVuY3J5cHRlZCBmaWxlXG4gICAgRkxHX0NPTVAxOiAxLCAvLyBjb21wcmVzc2lvbiBvcHRpb25cbiAgICBGTEdfQ09NUDI6IDIsIC8vIGNvbXByZXNzaW9uIG9wdGlvblxuICAgIEZMR19ERVNDOiA0LCAvLyBkYXRhIGRlc2NyaXB0b3JcbiAgICBGTEdfRU5IOiA4LCAvLyBlbmhhbmNlZCBkZWZsYXRpb25cbiAgICBGTEdfU1RSOiAxNiwgLy8gc3Ryb25nIGVuY3J5cHRpb25cbiAgICBGTEdfTE5HOiAxMDI0LCAvLyBsYW5ndWFnZSBlbmNvZGluZ1xuICAgIEZMR19NU0s6IDQwOTYsIC8vIG1hc2sgaGVhZGVyIHZhbHVlc1xuICAgIEZMR19FTlRSWV9FTkM6IDEsXG5cbiAgICAvKiA0LjUgRXh0ZW5zaWJsZSBkYXRhIGZpZWxkcyAqL1xuICAgIEVGX0lEOiAwLFxuICAgIEVGX1NJWkU6IDIsXG5cbiAgICAvKiBIZWFkZXIgSURzICovXG4gICAgSURfWklQNjQ6IDB4MDAwMSxcbiAgICBJRF9BVklORk86IDB4MDAwNyxcbiAgICBJRF9QRlM6IDB4MDAwOCxcbiAgICBJRF9PUzI6IDB4MDAwOSxcbiAgICBJRF9OVEZTOiAweDAwMGEsXG4gICAgSURfT1BFTlZNUzogMHgwMDBjLFxuICAgIElEX1VOSVg6IDB4MDAwZCxcbiAgICBJRF9GT1JLOiAweDAwMGUsXG4gICAgSURfUEFUQ0g6IDB4MDAwZixcbiAgICBJRF9YNTA5X1BLQ1M3OiAweDAwMTQsXG4gICAgSURfWDUwOV9DRVJUSURfRjogMHgwMDE1LFxuICAgIElEX1g1MDlfQ0VSVElEX0M6IDB4MDAxNixcbiAgICBJRF9TVFJPTkdFTkM6IDB4MDAxNyxcbiAgICBJRF9SRUNPUkRfTUdUOiAweDAwMTgsXG4gICAgSURfWDUwOV9QS0NTN19STDogMHgwMDE5LFxuICAgIElEX0lCTTE6IDB4MDA2NSxcbiAgICBJRF9JQk0yOiAweDAwNjYsXG4gICAgSURfUE9TWklQOiAweDQ2OTAsXG5cbiAgICBFRl9aSVA2NF9PUl8zMjogMHhmZmZmZmZmZixcbiAgICBFRl9aSVA2NF9PUl8xNjogMHhmZmZmLFxufTtcblxuY29uc3QgU3RyZWFtWmlwID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIGxldCBmZCwgZmlsZVNpemUsIGNodW5rU2l6ZSwgb3AsIGNlbnRyYWxEaXJlY3RvcnksIGNsb3NlZDtcbiAgICBjb25zdCByZWFkeSA9IGZhbHNlLFxuICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgZW50cmllcyA9IGNvbmZpZy5zdG9yZUVudHJpZXMgIT09IGZhbHNlID8ge30gOiBudWxsLFxuICAgICAgICBmaWxlTmFtZSA9IGNvbmZpZy5maWxlLFxuICAgICAgICB0ZXh0RGVjb2RlciA9IGNvbmZpZy5uYW1lRW5jb2RpbmcgPyBuZXcgVGV4dERlY29kZXIoY29uZmlnLm5hbWVFbmNvZGluZykgOiBudWxsO1xuXG4gICAgb3BlbigpO1xuXG4gICAgZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5mZCkge1xuICAgICAgICAgICAgZmQgPSBjb25maWcuZmQ7XG4gICAgICAgICAgICByZWFkRmlsZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnMub3BlbihmaWxlTmFtZSwgJ3InLCAoZXJyLCBmKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZkID0gZjtcbiAgICAgICAgICAgICAgICByZWFkRmlsZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkRmlsZSgpIHtcbiAgICAgICAgZnMuZnN0YXQoZmQsIChlcnIsIHN0YXQpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlU2l6ZSA9IHN0YXQuc2l6ZTtcbiAgICAgICAgICAgIGNodW5rU2l6ZSA9IGNvbmZpZy5jaHVua1NpemUgfHwgTWF0aC5yb3VuZChmaWxlU2l6ZSAvIDEwMDApO1xuICAgICAgICAgICAgY2h1bmtTaXplID0gTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgTWF0aC5taW4oY2h1bmtTaXplLCBNYXRoLm1pbigxMjggKiAxMDI0LCBmaWxlU2l6ZSkpLFxuICAgICAgICAgICAgICAgIE1hdGgubWluKDEwMjQsIGZpbGVTaXplKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJlYWRDZW50cmFsRGlyZWN0b3J5KCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRVbnRpbEZvdW5kQ2FsbGJhY2soZXJyLCBieXRlc1JlYWQpIHtcbiAgICAgICAgaWYgKGVyciB8fCAhYnl0ZXNSZWFkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIGVyciB8fCBuZXcgRXJyb3IoJ0FyY2hpdmUgcmVhZCBlcnJvcicpKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcG9zID0gb3AubGFzdFBvcztcbiAgICAgICAgbGV0IGJ1ZmZlclBvc2l0aW9uID0gcG9zIC0gb3Aud2luLnBvc2l0aW9uO1xuICAgICAgICBjb25zdCBidWZmZXIgPSBvcC53aW4uYnVmZmVyO1xuICAgICAgICBjb25zdCBtaW5Qb3MgPSBvcC5taW5Qb3M7XG4gICAgICAgIHdoaWxlICgtLXBvcyA+PSBtaW5Qb3MgJiYgLS1idWZmZXJQb3NpdGlvbiA+PSAwKSB7XG4gICAgICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCAtIGJ1ZmZlclBvc2l0aW9uID49IDQgJiYgYnVmZmVyW2J1ZmZlclBvc2l0aW9uXSA9PT0gb3AuZmlyc3RCeXRlKSB7XG4gICAgICAgICAgICAgICAgLy8gcXVpY2sgY2hlY2sgZmlyc3Qgc2lnbmF0dXJlIGJ5dGVcbiAgICAgICAgICAgICAgICBpZiAoYnVmZmVyLnJlYWRVSW50MzJMRShidWZmZXJQb3NpdGlvbikgPT09IG9wLnNpZykge1xuICAgICAgICAgICAgICAgICAgICBvcC5sYXN0QnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgb3AubGFzdEJ5dGVzUmVhZCA9IGJ5dGVzUmVhZDtcbiAgICAgICAgICAgICAgICAgICAgb3AuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocG9zID09PSBtaW5Qb3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdCYWQgYXJjaGl2ZScpKTtcbiAgICAgICAgfVxuICAgICAgICBvcC5sYXN0UG9zID0gcG9zICsgMTtcbiAgICAgICAgb3AuY2h1bmtTaXplICo9IDI7XG4gICAgICAgIGlmIChwb3MgPD0gbWluUG9zKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignQmFkIGFyY2hpdmUnKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXhwYW5kTGVuZ3RoID0gTWF0aC5taW4ob3AuY2h1bmtTaXplLCBwb3MgLSBtaW5Qb3MpO1xuICAgICAgICBvcC53aW4uZXhwYW5kTGVmdChleHBhbmRMZW5ndGgsIHJlYWRVbnRpbEZvdW5kQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRDZW50cmFsRGlyZWN0b3J5KCkge1xuICAgICAgICBjb25zdCB0b3RhbFJlYWRMZW5ndGggPSBNYXRoLm1pbihjb25zdHMuRU5ESERSICsgY29uc3RzLk1BWEZJTEVDT01NRU5ULCBmaWxlU2l6ZSk7XG4gICAgICAgIG9wID0ge1xuICAgICAgICAgICAgd2luOiBuZXcgRmlsZVdpbmRvd0J1ZmZlcihmZCksXG4gICAgICAgICAgICB0b3RhbFJlYWRMZW5ndGgsXG4gICAgICAgICAgICBtaW5Qb3M6IGZpbGVTaXplIC0gdG90YWxSZWFkTGVuZ3RoLFxuICAgICAgICAgICAgbGFzdFBvczogZmlsZVNpemUsXG4gICAgICAgICAgICBjaHVua1NpemU6IE1hdGgubWluKDEwMjQsIGNodW5rU2l6ZSksXG4gICAgICAgICAgICBmaXJzdEJ5dGU6IGNvbnN0cy5FTkRTSUdGSVJTVCxcbiAgICAgICAgICAgIHNpZzogY29uc3RzLkVORFNJRyxcbiAgICAgICAgICAgIGNvbXBsZXRlOiByZWFkQ2VudHJhbERpcmVjdG9yeUNvbXBsZXRlLFxuICAgICAgICB9O1xuICAgICAgICBvcC53aW4ucmVhZChmaWxlU2l6ZSAtIG9wLmNodW5rU2l6ZSwgb3AuY2h1bmtTaXplLCByZWFkVW50aWxGb3VuZENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkQ2VudHJhbERpcmVjdG9yeUNvbXBsZXRlKCkge1xuICAgICAgICBjb25zdCBidWZmZXIgPSBvcC53aW4uYnVmZmVyO1xuICAgICAgICBjb25zdCBwb3MgPSBvcC5sYXN0QnVmZmVyUG9zaXRpb247XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5ID0gbmV3IENlbnRyYWxEaXJlY3RvcnlIZWFkZXIoKTtcbiAgICAgICAgICAgIGNlbnRyYWxEaXJlY3RvcnkucmVhZChidWZmZXIuc2xpY2UocG9zLCBwb3MgKyBjb25zdHMuRU5ESERSKSk7XG4gICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5LmhlYWRlck9mZnNldCA9IG9wLndpbi5wb3NpdGlvbiArIHBvcztcbiAgICAgICAgICAgIGlmIChjZW50cmFsRGlyZWN0b3J5LmNvbW1lbnRMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmNvbW1lbnQgPSBidWZmZXJcbiAgICAgICAgICAgICAgICAgICAgLnNsaWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zICsgY29uc3RzLkVOREhEUixcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyArIGNvbnN0cy5FTkRIRFIgKyBjZW50cmFsRGlyZWN0b3J5LmNvbW1lbnRMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jb21tZW50ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuZW50cmllc0NvdW50ID0gY2VudHJhbERpcmVjdG9yeS52b2x1bWVFbnRyaWVzO1xuICAgICAgICAgICAgdGhhdC5jZW50cmFsRGlyZWN0b3J5ID0gY2VudHJhbERpcmVjdG9yeTtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAoY2VudHJhbERpcmVjdG9yeS52b2x1bWVFbnRyaWVzID09PSBjb25zdHMuRUZfWklQNjRfT1JfMTYgJiZcbiAgICAgICAgICAgICAgICAgICAgY2VudHJhbERpcmVjdG9yeS50b3RhbEVudHJpZXMgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8xNikgfHxcbiAgICAgICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5LnNpemUgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMiB8fFxuICAgICAgICAgICAgICAgIGNlbnRyYWxEaXJlY3Rvcnkub2Zmc2V0ID09PSBjb25zdHMuRUZfWklQNjRfT1JfMzJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlMb2NhdG9yKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wID0ge307XG4gICAgICAgICAgICAgICAgcmVhZEVudHJpZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGF0LmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlMb2NhdG9yKCkge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBjb25zdHMuRU5ETDY0SERSO1xuICAgICAgICBpZiAob3AubGFzdEJ1ZmZlclBvc2l0aW9uID4gbGVuZ3RoKSB7XG4gICAgICAgICAgICBvcC5sYXN0QnVmZmVyUG9zaXRpb24gLT0gbGVuZ3RoO1xuICAgICAgICAgICAgcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUxvY2F0b3JDb21wbGV0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3AgPSB7XG4gICAgICAgICAgICAgICAgd2luOiBvcC53aW4sXG4gICAgICAgICAgICAgICAgdG90YWxSZWFkTGVuZ3RoOiBsZW5ndGgsXG4gICAgICAgICAgICAgICAgbWluUG9zOiBvcC53aW4ucG9zaXRpb24gLSBsZW5ndGgsXG4gICAgICAgICAgICAgICAgbGFzdFBvczogb3Aud2luLnBvc2l0aW9uLFxuICAgICAgICAgICAgICAgIGNodW5rU2l6ZTogb3AuY2h1bmtTaXplLFxuICAgICAgICAgICAgICAgIGZpcnN0Qnl0ZTogY29uc3RzLkVOREw2NFNJR0ZJUlNULFxuICAgICAgICAgICAgICAgIHNpZzogY29uc3RzLkVOREw2NFNJRyxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUxvY2F0b3JDb21wbGV0ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBvcC53aW4ucmVhZChvcC5sYXN0UG9zIC0gb3AuY2h1bmtTaXplLCBvcC5jaHVua1NpemUsIHJlYWRVbnRpbEZvdW5kQ2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUxvY2F0b3JDb21wbGV0ZSgpIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gb3Aud2luLmJ1ZmZlcjtcbiAgICAgICAgY29uc3QgbG9jSGVhZGVyID0gbmV3IENlbnRyYWxEaXJlY3RvcnlMb2M2NEhlYWRlcigpO1xuICAgICAgICBsb2NIZWFkZXIucmVhZChcbiAgICAgICAgICAgIGJ1ZmZlci5zbGljZShvcC5sYXN0QnVmZmVyUG9zaXRpb24sIG9wLmxhc3RCdWZmZXJQb3NpdGlvbiArIGNvbnN0cy5FTkRMNjRIRFIpXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHJlYWRMZW5ndGggPSBmaWxlU2l6ZSAtIGxvY0hlYWRlci5oZWFkZXJPZmZzZXQ7XG4gICAgICAgIG9wID0ge1xuICAgICAgICAgICAgd2luOiBvcC53aW4sXG4gICAgICAgICAgICB0b3RhbFJlYWRMZW5ndGg6IHJlYWRMZW5ndGgsXG4gICAgICAgICAgICBtaW5Qb3M6IGxvY0hlYWRlci5oZWFkZXJPZmZzZXQsXG4gICAgICAgICAgICBsYXN0UG9zOiBvcC5sYXN0UG9zLFxuICAgICAgICAgICAgY2h1bmtTaXplOiBvcC5jaHVua1NpemUsXG4gICAgICAgICAgICBmaXJzdEJ5dGU6IGNvbnN0cy5FTkQ2NFNJR0ZJUlNULFxuICAgICAgICAgICAgc2lnOiBjb25zdHMuRU5ENjRTSUcsXG4gICAgICAgICAgICBjb21wbGV0ZTogcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUNvbXBsZXRlLFxuICAgICAgICB9O1xuICAgICAgICBvcC53aW4ucmVhZChmaWxlU2l6ZSAtIG9wLmNodW5rU2l6ZSwgb3AuY2h1bmtTaXplLCByZWFkVW50aWxGb3VuZENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkWmlwNjRDZW50cmFsRGlyZWN0b3J5Q29tcGxldGUoKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IG9wLndpbi5idWZmZXI7XG4gICAgICAgIGNvbnN0IHppcDY0Y2QgPSBuZXcgQ2VudHJhbERpcmVjdG9yeVppcDY0SGVhZGVyKCk7XG4gICAgICAgIHppcDY0Y2QucmVhZChidWZmZXIuc2xpY2Uob3AubGFzdEJ1ZmZlclBvc2l0aW9uLCBvcC5sYXN0QnVmZmVyUG9zaXRpb24gKyBjb25zdHMuRU5ENjRIRFIpKTtcbiAgICAgICAgdGhhdC5jZW50cmFsRGlyZWN0b3J5LnZvbHVtZUVudHJpZXMgPSB6aXA2NGNkLnZvbHVtZUVudHJpZXM7XG4gICAgICAgIHRoYXQuY2VudHJhbERpcmVjdG9yeS50b3RhbEVudHJpZXMgPSB6aXA2NGNkLnRvdGFsRW50cmllcztcbiAgICAgICAgdGhhdC5jZW50cmFsRGlyZWN0b3J5LnNpemUgPSB6aXA2NGNkLnNpemU7XG4gICAgICAgIHRoYXQuY2VudHJhbERpcmVjdG9yeS5vZmZzZXQgPSB6aXA2NGNkLm9mZnNldDtcbiAgICAgICAgdGhhdC5lbnRyaWVzQ291bnQgPSB6aXA2NGNkLnZvbHVtZUVudHJpZXM7XG4gICAgICAgIG9wID0ge307XG4gICAgICAgIHJlYWRFbnRyaWVzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZEVudHJpZXMoKSB7XG4gICAgICAgIG9wID0ge1xuICAgICAgICAgICAgd2luOiBuZXcgRmlsZVdpbmRvd0J1ZmZlcihmZCksXG4gICAgICAgICAgICBwb3M6IGNlbnRyYWxEaXJlY3Rvcnkub2Zmc2V0LFxuICAgICAgICAgICAgY2h1bmtTaXplLFxuICAgICAgICAgICAgZW50cmllc0xlZnQ6IGNlbnRyYWxEaXJlY3Rvcnkudm9sdW1lRW50cmllcyxcbiAgICAgICAgfTtcbiAgICAgICAgb3Aud2luLnJlYWQob3AucG9zLCBNYXRoLm1pbihjaHVua1NpemUsIGZpbGVTaXplIC0gb3AucG9zKSwgcmVhZEVudHJpZXNDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZEVudHJpZXNDYWxsYmFjayhlcnIsIGJ5dGVzUmVhZCkge1xuICAgICAgICBpZiAoZXJyIHx8ICFieXRlc1JlYWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmVtaXQoJ2Vycm9yJywgZXJyIHx8IG5ldyBFcnJvcignRW50cmllcyByZWFkIGVycm9yJykpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBidWZmZXJQb3MgPSBvcC5wb3MgLSBvcC53aW4ucG9zaXRpb247XG4gICAgICAgIGxldCBlbnRyeSA9IG9wLmVudHJ5O1xuICAgICAgICBjb25zdCBidWZmZXIgPSBvcC53aW4uYnVmZmVyO1xuICAgICAgICBjb25zdCBidWZmZXJMZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgd2hpbGUgKG9wLmVudHJpZXNMZWZ0ID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghZW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cnkgPSBuZXcgWmlwRW50cnkoKTtcbiAgICAgICAgICAgICAgICAgICAgZW50cnkucmVhZEhlYWRlcihidWZmZXIsIGJ1ZmZlclBvcyk7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5LmhlYWRlck9mZnNldCA9IG9wLndpbi5wb3NpdGlvbiArIGJ1ZmZlclBvcztcbiAgICAgICAgICAgICAgICAgICAgb3AuZW50cnkgPSBlbnRyeTtcbiAgICAgICAgICAgICAgICAgICAgb3AucG9zICs9IGNvbnN0cy5DRU5IRFI7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlclBvcyArPSBjb25zdHMuQ0VOSERSO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBlbnRyeUhlYWRlclNpemUgPSBlbnRyeS5mbmFtZUxlbiArIGVudHJ5LmV4dHJhTGVuICsgZW50cnkuY29tTGVuO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFkdmFuY2VCeXRlcyA9IGVudHJ5SGVhZGVyU2l6ZSArIChvcC5lbnRyaWVzTGVmdCA+IDEgPyBjb25zdHMuQ0VOSERSIDogMCk7XG4gICAgICAgICAgICAgICAgaWYgKGJ1ZmZlckxlbmd0aCAtIGJ1ZmZlclBvcyA8IGFkdmFuY2VCeXRlcykge1xuICAgICAgICAgICAgICAgICAgICBvcC53aW4ubW92ZVJpZ2h0KGNodW5rU2l6ZSwgcmVhZEVudHJpZXNDYWxsYmFjaywgYnVmZmVyUG9zKTtcbiAgICAgICAgICAgICAgICAgICAgb3AubW92ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZW50cnkucmVhZChidWZmZXIsIGJ1ZmZlclBvcywgdGV4dERlY29kZXIpO1xuICAgICAgICAgICAgICAgIGlmICghY29uZmlnLnNraXBFbnRyeU5hbWVWYWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5LnZhbGlkYXRlTmFtZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZW50cmllcykge1xuICAgICAgICAgICAgICAgICAgICBlbnRyaWVzW2VudHJ5Lm5hbWVdID0gZW50cnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoYXQuZW1pdCgnZW50cnknLCBlbnRyeSk7XG4gICAgICAgICAgICAgICAgb3AuZW50cnkgPSBlbnRyeSA9IG51bGw7XG4gICAgICAgICAgICAgICAgb3AuZW50cmllc0xlZnQtLTtcbiAgICAgICAgICAgICAgICBvcC5wb3MgKz0gZW50cnlIZWFkZXJTaXplO1xuICAgICAgICAgICAgICAgIGJ1ZmZlclBvcyArPSBlbnRyeUhlYWRlclNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGF0LmVtaXQoJ3JlYWR5Jyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhhdC5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja0VudHJpZXNFeGlzdCgpIHtcbiAgICAgICAgaWYgKCFlbnRyaWVzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0b3JlRW50cmllcyBkaXNhYmxlZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdyZWFkeScsIHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlYWR5O1xuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5lbnRyeSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGNoZWNrRW50cmllc0V4aXN0KCk7XG4gICAgICAgIHJldHVybiBlbnRyaWVzW25hbWVdO1xuICAgIH07XG5cbiAgICB0aGlzLmVudHJpZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoZWNrRW50cmllc0V4aXN0KCk7XG4gICAgICAgIHJldHVybiBlbnRyaWVzO1xuICAgIH07XG5cbiAgICB0aGlzLnN0cmVhbSA9IGZ1bmN0aW9uIChlbnRyeSwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3BlbkVudHJ5KFxuICAgICAgICAgICAgZW50cnksXG4gICAgICAgICAgICAoZXJyLCBlbnRyeSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IGRhdGFPZmZzZXQoZW50cnkpO1xuICAgICAgICAgICAgICAgIGxldCBlbnRyeVN0cmVhbSA9IG5ldyBFbnRyeURhdGFSZWFkZXJTdHJlYW0oZmQsIG9mZnNldCwgZW50cnkuY29tcHJlc3NlZFNpemUpO1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5tZXRob2QgPT09IGNvbnN0cy5TVE9SRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZyB0byBkb1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkubWV0aG9kID09PSBjb25zdHMuREVGTEFURUQpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cnlTdHJlYW0gPSBlbnRyeVN0cmVhbS5waXBlKHpsaWIuY3JlYXRlSW5mbGF0ZVJhdygpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdVbmtub3duIGNvbXByZXNzaW9uIG1ldGhvZDogJyArIGVudHJ5Lm1ldGhvZCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2FuVmVyaWZ5Q3JjKGVudHJ5KSkge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeVN0cmVhbSA9IGVudHJ5U3RyZWFtLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRW50cnlWZXJpZnlTdHJlYW0oZW50cnlTdHJlYW0sIGVudHJ5LmNyYywgZW50cnkuc2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZW50cnlTdHJlYW0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHRoaXMuZW50cnlEYXRhU3luYyA9IGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICBsZXQgZXJyID0gbnVsbDtcbiAgICAgICAgdGhpcy5vcGVuRW50cnkoXG4gICAgICAgICAgICBlbnRyeSxcbiAgICAgICAgICAgIChlLCBlbikgPT4ge1xuICAgICAgICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgICAgICAgICAgZW50cnkgPSBlbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YSA9IEJ1ZmZlci5hbGxvYyhlbnRyeS5jb21wcmVzc2VkU2l6ZSk7XG4gICAgICAgIG5ldyBGc1JlYWQoZmQsIGRhdGEsIDAsIGVudHJ5LmNvbXByZXNzZWRTaXplLCBkYXRhT2Zmc2V0KGVudHJ5KSwgKGUpID0+IHtcbiAgICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgIH0pLnJlYWQodHJ1ZSk7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW50cnkubWV0aG9kID09PSBjb25zdHMuU1RPUkVEKSB7XG4gICAgICAgICAgICAvLyBub3RoaW5nIHRvIGRvXG4gICAgICAgIH0gZWxzZSBpZiAoZW50cnkubWV0aG9kID09PSBjb25zdHMuREVGTEFURUQgfHwgZW50cnkubWV0aG9kID09PSBjb25zdHMuRU5IQU5DRURfREVGTEFURUQpIHtcbiAgICAgICAgICAgIGRhdGEgPSB6bGliLmluZmxhdGVSYXdTeW5jKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGNvbXByZXNzaW9uIG1ldGhvZDogJyArIGVudHJ5Lm1ldGhvZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoICE9PSBlbnRyeS5zaXplKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2l6ZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYW5WZXJpZnlDcmMoZW50cnkpKSB7XG4gICAgICAgICAgICBjb25zdCB2ZXJpZnkgPSBuZXcgQ3JjVmVyaWZ5KGVudHJ5LmNyYywgZW50cnkuc2l6ZSk7XG4gICAgICAgICAgICB2ZXJpZnkuZGF0YShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9O1xuXG4gICAgdGhpcy5vcGVuRW50cnkgPSBmdW5jdGlvbiAoZW50cnksIGNhbGxiYWNrLCBzeW5jKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZW50cnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjaGVja0VudHJpZXNFeGlzdCgpO1xuICAgICAgICAgICAgZW50cnkgPSBlbnRyaWVzW2VudHJ5XTtcbiAgICAgICAgICAgIGlmICghZW50cnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdFbnRyeSBub3QgZm91bmQnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbnRyeS5pc0ZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ0VudHJ5IGlzIG5vdCBmaWxlJykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZmQpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ0FyY2hpdmUgY2xvc2VkJykpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhjb25zdHMuTE9DSERSKTtcbiAgICAgICAgbmV3IEZzUmVhZChmZCwgYnVmZmVyLCAwLCBidWZmZXIubGVuZ3RoLCBlbnRyeS5vZmZzZXQsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCByZWFkRXg7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGVudHJ5LnJlYWREYXRhSGVhZGVyKGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LmVuY3J5cHRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZWFkRXggPSBuZXcgRXJyb3IoJ0VudHJ5IGVuY3J5cHRlZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgcmVhZEV4ID0gZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjayhyZWFkRXgsIGVudHJ5KTtcbiAgICAgICAgfSkucmVhZChzeW5jKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZGF0YU9mZnNldChlbnRyeSkge1xuICAgICAgICByZXR1cm4gZW50cnkub2Zmc2V0ICsgY29uc3RzLkxPQ0hEUiArIGVudHJ5LmZuYW1lTGVuICsgZW50cnkuZXh0cmFMZW47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuVmVyaWZ5Q3JjKGVudHJ5KSB7XG4gICAgICAgIC8vIGlmIGJpdCAzICgweDA4KSBvZiB0aGUgZ2VuZXJhbC1wdXJwb3NlIGZsYWdzIGZpZWxkIGlzIHNldCwgdGhlbiB0aGUgQ1JDLTMyIGFuZCBmaWxlIHNpemVzIGFyZSBub3Qga25vd24gd2hlbiB0aGUgaGVhZGVyIGlzIHdyaXR0ZW5cbiAgICAgICAgcmV0dXJuIChlbnRyeS5mbGFncyAmIDB4OCkgIT09IDB4ODtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRyYWN0KGVudHJ5LCBvdXRQYXRoLCBjYWxsYmFjaykge1xuICAgICAgICB0aGF0LnN0cmVhbShlbnRyeSwgKGVyciwgc3RtKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGZzU3RtLCBlcnJUaHJvd247XG4gICAgICAgICAgICAgICAgc3RtLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyVGhyb3duID0gZXJyO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZnNTdG0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0bS51bnBpcGUoZnNTdG0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnNTdG0uY2xvc2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZzLm9wZW4ob3V0UGF0aCwgJ3cnLCAoZXJyLCBmZEZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyclRocm93bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnMuY2xvc2UoZmQsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnJUaHJvd24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZnNTdG0gPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShvdXRQYXRoLCB7IGZkOiBmZEZpbGUgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZzU3RtLm9uKCdmaW5pc2gnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmVtaXQoJ2V4dHJhY3QnLCBlbnRyeSwgb3V0UGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVyclRocm93bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdG0ucGlwZShmc1N0bSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZURpcmVjdG9yaWVzKGJhc2VEaXIsIGRpcnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghZGlycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkaXIgPSBkaXJzLnNoaWZ0KCk7XG4gICAgICAgIGRpciA9IHBhdGguam9pbihiYXNlRGlyLCBwYXRoLmpvaW4oLi4uZGlyKSk7XG4gICAgICAgIGZzLm1rZGlyKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVyciAmJiBlcnIuY29kZSAhPT0gJ0VFWElTVCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNyZWF0ZURpcmVjdG9yaWVzKGJhc2VEaXIsIGRpcnMsIGNhbGxiYWNrKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0cmFjdEZpbGVzKGJhc2VEaXIsIGJhc2VSZWxQYXRoLCBmaWxlcywgY2FsbGJhY2ssIGV4dHJhY3RlZENvdW50KSB7XG4gICAgICAgIGlmICghZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgZXh0cmFjdGVkQ291bnQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpbGUgPSBmaWxlcy5zaGlmdCgpO1xuICAgICAgICBjb25zdCB0YXJnZXRQYXRoID0gcGF0aC5qb2luKGJhc2VEaXIsIGZpbGUubmFtZS5yZXBsYWNlKGJhc2VSZWxQYXRoLCAnJykpO1xuICAgICAgICBleHRyYWN0KGZpbGUsIHRhcmdldFBhdGgsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCBleHRyYWN0ZWRDb3VudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBleHRyYWN0RmlsZXMoYmFzZURpciwgYmFzZVJlbFBhdGgsIGZpbGVzLCBjYWxsYmFjaywgZXh0cmFjdGVkQ291bnQgKyAxKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5leHRyYWN0ID0gZnVuY3Rpb24gKGVudHJ5LCBvdXRQYXRoLCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgZW50cnlOYW1lID0gZW50cnkgfHwgJyc7XG4gICAgICAgIGlmICh0eXBlb2YgZW50cnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBlbnRyeSA9IHRoaXMuZW50cnkoZW50cnkpO1xuICAgICAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgZW50cnlOYW1lID0gZW50cnkubmFtZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5TmFtZS5sZW5ndGggJiYgZW50cnlOYW1lW2VudHJ5TmFtZS5sZW5ndGggLSAxXSAhPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5TmFtZSArPSAnLyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghZW50cnkgfHwgZW50cnkuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzID0gW10sXG4gICAgICAgICAgICAgICAgZGlycyA9IFtdLFxuICAgICAgICAgICAgICAgIGFsbERpcnMgPSB7fTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZSBpbiBlbnRyaWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZW50cmllcywgZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgZS5sYXN0SW5kZXhPZihlbnRyeU5hbWUsIDApID09PSAwXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZWxQYXRoID0gZS5yZXBsYWNlKGVudHJ5TmFtZSwgJycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEVudHJ5ID0gZW50cmllc1tlXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkRW50cnkuaXNGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGNoaWxkRW50cnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVsUGF0aCA9IHBhdGguZGlybmFtZShyZWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVsUGF0aCAmJiAhYWxsRGlyc1tyZWxQYXRoXSAmJiByZWxQYXRoICE9PSAnLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbERpcnNbcmVsUGF0aF0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnRzID0gcmVsUGF0aC5zcGxpdCgnLycpLmZpbHRlcigoZikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlycy5wdXNoKHBhcnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHMgPSBwYXJ0cy5zbGljZSgwLCBwYXJ0cy5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0c1BhdGggPSBwYXJ0cy5qb2luKCcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbERpcnNbcGFydHNQYXRoXSB8fCBwYXJ0c1BhdGggPT09ICcuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsRGlyc1twYXJ0c1BhdGhdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJzLnB1c2gocGFydHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlycy5zb3J0KCh4LCB5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHgubGVuZ3RoIC0geS5sZW5ndGg7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChkaXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZURpcmVjdG9yaWVzKG91dFBhdGgsIGRpcnMsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3RGaWxlcyhvdXRQYXRoLCBlbnRyeU5hbWUsIGZpbGVzLCBjYWxsYmFjaywgMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXh0cmFjdEZpbGVzKG91dFBhdGgsIGVudHJ5TmFtZSwgZmlsZXMsIGNhbGxiYWNrLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZzLnN0YXQob3V0UGF0aCwgKGVyciwgc3RhdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ICYmIHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICBleHRyYWN0KGVudHJ5LCBwYXRoLmpvaW4ob3V0UGF0aCwgcGF0aC5iYXNlbmFtZShlbnRyeS5uYW1lKSksIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBleHRyYWN0KGVudHJ5LCBvdXRQYXRoLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5jbG9zZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICBpZiAoY2xvc2VkIHx8ICFmZCkge1xuICAgICAgICAgICAgY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbG9zZWQgPSB0cnVlO1xuICAgICAgICAgICAgZnMuY2xvc2UoZmQsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBmZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb3JpZ2luYWxFbWl0ID0gZXZlbnRzLkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdDtcbiAgICB0aGlzLmVtaXQgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpZiAoIWNsb3NlZCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsRW1pdC5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cblN0cmVhbVppcC5zZXRGcyA9IGZ1bmN0aW9uIChjdXN0b21Gcykge1xuICAgIGZzID0gY3VzdG9tRnM7XG59O1xuXG5TdHJlYW1aaXAuZGVidWdMb2cgPSAoLi4uYXJncykgPT4ge1xuICAgIGlmIChTdHJlYW1aaXAuZGVidWcpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5sb2coLi4uYXJncyk7XG4gICAgfVxufTtcblxudXRpbC5pbmhlcml0cyhTdHJlYW1aaXAsIGV2ZW50cy5FdmVudEVtaXR0ZXIpO1xuXG5jb25zdCBwcm9wWmlwID0gU3ltYm9sKCd6aXAnKTtcblxuU3RyZWFtWmlwLmFzeW5jID0gY2xhc3MgU3RyZWFtWmlwQXN5bmMgZXh0ZW5kcyBldmVudHMuRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBjb25zdCB6aXAgPSBuZXcgU3RyZWFtWmlwKGNvbmZpZyk7XG5cbiAgICAgICAgemlwLm9uKCdlbnRyeScsIChlbnRyeSkgPT4gdGhpcy5lbWl0KCdlbnRyeScsIGVudHJ5KSk7XG4gICAgICAgIHppcC5vbignZXh0cmFjdCcsIChlbnRyeSwgb3V0UGF0aCkgPT4gdGhpcy5lbWl0KCdleHRyYWN0JywgZW50cnksIG91dFBhdGgpKTtcblxuICAgICAgICB0aGlzW3Byb3BaaXBdID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemlwLm9uKCdyZWFkeScsICgpID0+IHtcbiAgICAgICAgICAgICAgICB6aXAucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHppcCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHppcC5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgZW50cmllc0NvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpc1twcm9wWmlwXS50aGVuKCh6aXApID0+IHppcC5lbnRyaWVzQ291bnQpO1xuICAgIH1cblxuICAgIGdldCBjb21tZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpc1twcm9wWmlwXS50aGVuKCh6aXApID0+IHppcC5jb21tZW50KTtcbiAgICB9XG5cbiAgICBhc3luYyBlbnRyeShuYW1lKSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiB6aXAuZW50cnkobmFtZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZW50cmllcygpIHtcbiAgICAgICAgY29uc3QgemlwID0gYXdhaXQgdGhpc1twcm9wWmlwXTtcbiAgICAgICAgcmV0dXJuIHppcC5lbnRyaWVzKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgc3RyZWFtKGVudHJ5KSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6aXAuc3RyZWFtKGVudHJ5LCAoZXJyLCBzdG0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZW50cnlEYXRhKGVudHJ5KSB7XG4gICAgICAgIGNvbnN0IHN0bSA9IGF3YWl0IHRoaXMuc3RyZWFtKGVudHJ5KTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBbXTtcbiAgICAgICAgICAgIHN0bS5vbignZGF0YScsIChjaHVuaykgPT4gZGF0YS5wdXNoKGNodW5rKSk7XG4gICAgICAgICAgICBzdG0ub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKEJ1ZmZlci5jb25jYXQoZGF0YSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdG0ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHN0bS5yZW1vdmVBbGxMaXN0ZW5lcnMoJ2VuZCcpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGV4dHJhY3QoZW50cnksIG91dFBhdGgpIHtcbiAgICAgICAgY29uc3QgemlwID0gYXdhaXQgdGhpc1twcm9wWmlwXTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHppcC5leHRyYWN0KGVudHJ5LCBvdXRQYXRoLCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgY2xvc2UoKSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6aXAuY2xvc2UoKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5jbGFzcyBDZW50cmFsRGlyZWN0b3J5SGVhZGVyIHtcbiAgICByZWFkKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoICE9PSBjb25zdHMuRU5ESERSIHx8IGRhdGEucmVhZFVJbnQzMkxFKDApICE9PSBjb25zdHMuRU5EU0lHKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY2VudHJhbCBkaXJlY3RvcnknKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBudW1iZXIgb2YgZW50cmllcyBvbiB0aGlzIHZvbHVtZVxuICAgICAgICB0aGlzLnZvbHVtZUVudHJpZXMgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuRU5EU1VCKTtcbiAgICAgICAgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXNcbiAgICAgICAgdGhpcy50b3RhbEVudHJpZXMgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuRU5EVE9UKTtcbiAgICAgICAgLy8gY2VudHJhbCBkaXJlY3Rvcnkgc2l6ZSBpbiBieXRlc1xuICAgICAgICB0aGlzLnNpemUgPSBkYXRhLnJlYWRVSW50MzJMRShjb25zdHMuRU5EU0laKTtcbiAgICAgICAgLy8gb2Zmc2V0IG9mIGZpcnN0IENFTiBoZWFkZXJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBkYXRhLnJlYWRVSW50MzJMRShjb25zdHMuRU5ET0ZGKTtcbiAgICAgICAgLy8gemlwIGZpbGUgY29tbWVudCBsZW5ndGhcbiAgICAgICAgdGhpcy5jb21tZW50TGVuZ3RoID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkVORENPTSk7XG4gICAgfVxufVxuXG5jbGFzcyBDZW50cmFsRGlyZWN0b3J5TG9jNjRIZWFkZXIge1xuICAgIHJlYWQoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5sZW5ndGggIT09IGNvbnN0cy5FTkRMNjRIRFIgfHwgZGF0YS5yZWFkVUludDMyTEUoMCkgIT09IGNvbnN0cy5FTkRMNjRTSUcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB6aXA2NCBjZW50cmFsIGRpcmVjdG9yeSBsb2NhdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gWklQNjQgRU9DRCBoZWFkZXIgb2Zmc2V0XG4gICAgICAgIHRoaXMuaGVhZGVyT2Zmc2V0ID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkRTVUIpO1xuICAgIH1cbn1cblxuY2xhc3MgQ2VudHJhbERpcmVjdG9yeVppcDY0SGVhZGVyIHtcbiAgICByZWFkKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoICE9PSBjb25zdHMuRU5ENjRIRFIgfHwgZGF0YS5yZWFkVUludDMyTEUoMCkgIT09IGNvbnN0cy5FTkQ2NFNJRykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNlbnRyYWwgZGlyZWN0b3J5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbnVtYmVyIG9mIGVudHJpZXMgb24gdGhpcyB2b2x1bWVcbiAgICAgICAgdGhpcy52b2x1bWVFbnRyaWVzID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkQ2NFNVQik7XG4gICAgICAgIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzXG4gICAgICAgIHRoaXMudG90YWxFbnRyaWVzID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkQ2NFRPVCk7XG4gICAgICAgIC8vIGNlbnRyYWwgZGlyZWN0b3J5IHNpemUgaW4gYnl0ZXNcbiAgICAgICAgdGhpcy5zaXplID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkQ2NFNJWik7XG4gICAgICAgIC8vIG9mZnNldCBvZiBmaXJzdCBDRU4gaGVhZGVyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkQ2NE9GRik7XG4gICAgfVxufVxuXG5jbGFzcyBaaXBFbnRyeSB7XG4gICAgcmVhZEhlYWRlcihkYXRhLCBvZmZzZXQpIHtcbiAgICAgICAgLy8gZGF0YSBzaG91bGQgYmUgNDYgYnl0ZXMgYW5kIHN0YXJ0IHdpdGggXCJQSyAwMSAwMlwiXG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCA8IG9mZnNldCArIGNvbnN0cy5DRU5IRFIgfHwgZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0KSAhPT0gY29uc3RzLkNFTlNJRykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGVudHJ5IGhlYWRlcicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHZlcnNpb24gbWFkZSBieVxuICAgICAgICB0aGlzLnZlck1hZGUgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOVkVNKTtcbiAgICAgICAgLy8gdmVyc2lvbiBuZWVkZWQgdG8gZXh0cmFjdFxuICAgICAgICB0aGlzLnZlcnNpb24gPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOVkVSKTtcbiAgICAgICAgLy8gZW5jcnlwdCwgZGVjcnlwdCBmbGFnc1xuICAgICAgICB0aGlzLmZsYWdzID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkZMRyk7XG4gICAgICAgIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICAgICAgICB0aGlzLm1ldGhvZCA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5IT1cpO1xuICAgICAgICAvLyBtb2RpZmljYXRpb24gdGltZSAoMiBieXRlcyB0aW1lLCAyIGJ5dGVzIGRhdGUpXG4gICAgICAgIGNvbnN0IHRpbWVieXRlcyA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5USU0pO1xuICAgICAgICBjb25zdCBkYXRlYnl0ZXMgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOVElNICsgMik7XG4gICAgICAgIHRoaXMudGltZSA9IHBhcnNlWmlwVGltZSh0aW1lYnl0ZXMsIGRhdGVieXRlcyk7XG5cbiAgICAgICAgLy8gdW5jb21wcmVzc2VkIGZpbGUgY3JjLTMyIHZhbHVlXG4gICAgICAgIHRoaXMuY3JjID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0ICsgY29uc3RzLkNFTkNSQyk7XG4gICAgICAgIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgICAgICB0aGlzLmNvbXByZXNzZWRTaXplID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0ICsgY29uc3RzLkNFTlNJWik7XG4gICAgICAgIC8vIHVuY29tcHJlc3NlZCBzaXplXG4gICAgICAgIHRoaXMuc2l6ZSA9IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCArIGNvbnN0cy5DRU5MRU4pO1xuICAgICAgICAvLyBmaWxlbmFtZSBsZW5ndGhcbiAgICAgICAgdGhpcy5mbmFtZUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5OQU0pO1xuICAgICAgICAvLyBleHRyYSBmaWVsZCBsZW5ndGhcbiAgICAgICAgdGhpcy5leHRyYUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5FWFQpO1xuICAgICAgICAvLyBmaWxlIGNvbW1lbnQgbGVuZ3RoXG4gICAgICAgIHRoaXMuY29tTGVuID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkNPTSk7XG4gICAgICAgIC8vIHZvbHVtZSBudW1iZXIgc3RhcnRcbiAgICAgICAgdGhpcy5kaXNrU3RhcnQgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VORFNLKTtcbiAgICAgICAgLy8gaW50ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXG4gICAgICAgIHRoaXMuaW5hdHRyID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkFUVCk7XG4gICAgICAgIC8vIGV4dGVybmFsIGZpbGUgYXR0cmlidXRlc1xuICAgICAgICB0aGlzLmF0dHIgPSBkYXRhLnJlYWRVSW50MzJMRShvZmZzZXQgKyBjb25zdHMuQ0VOQVRYKTtcbiAgICAgICAgLy8gTE9DIGhlYWRlciBvZmZzZXRcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBkYXRhLnJlYWRVSW50MzJMRShvZmZzZXQgKyBjb25zdHMuQ0VOT0ZGKTtcbiAgICB9XG5cbiAgICByZWFkRGF0YUhlYWRlcihkYXRhKSB7XG4gICAgICAgIC8vIDMwIGJ5dGVzIGFuZCBzaG91bGQgc3RhcnQgd2l0aCBcIlBLXFwwMDNcXDAwNFwiXG4gICAgICAgIGlmIChkYXRhLnJlYWRVSW50MzJMRSgwKSAhPT0gY29uc3RzLkxPQ1NJRykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGxvY2FsIGhlYWRlcicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ1ZFUik7XG4gICAgICAgIC8vIGdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZ1xuICAgICAgICB0aGlzLmZsYWdzID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ0ZMRyk7XG4gICAgICAgIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICAgICAgICB0aGlzLm1ldGhvZCA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NIT1cpO1xuICAgICAgICAvLyBtb2RpZmljYXRpb24gdGltZSAoMiBieXRlcyB0aW1lIDsgMiBieXRlcyBkYXRlKVxuICAgICAgICBjb25zdCB0aW1lYnl0ZXMgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuTE9DVElNKTtcbiAgICAgICAgY29uc3QgZGF0ZWJ5dGVzID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ1RJTSArIDIpO1xuICAgICAgICB0aGlzLnRpbWUgPSBwYXJzZVppcFRpbWUodGltZWJ5dGVzLCBkYXRlYnl0ZXMpO1xuXG4gICAgICAgIC8vIHVuY29tcHJlc3NlZCBmaWxlIGNyYy0zMiB2YWx1ZVxuICAgICAgICB0aGlzLmNyYyA9IGRhdGEucmVhZFVJbnQzMkxFKGNvbnN0cy5MT0NDUkMpIHx8IHRoaXMuY3JjO1xuICAgICAgICAvLyBjb21wcmVzc2VkIHNpemVcbiAgICAgICAgY29uc3QgY29tcHJlc3NlZFNpemUgPSBkYXRhLnJlYWRVSW50MzJMRShjb25zdHMuTE9DU0laKTtcbiAgICAgICAgaWYgKGNvbXByZXNzZWRTaXplICYmIGNvbXByZXNzZWRTaXplICE9PSBjb25zdHMuRUZfWklQNjRfT1JfMzIpIHtcbiAgICAgICAgICAgIHRoaXMuY29tcHJlc3NlZFNpemUgPSBjb21wcmVzc2VkU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuICAgICAgICBjb25zdCBzaXplID0gZGF0YS5yZWFkVUludDMyTEUoY29uc3RzLkxPQ0xFTik7XG4gICAgICAgIGlmIChzaXplICYmIHNpemUgIT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMikge1xuICAgICAgICAgICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBmaWxlbmFtZSBsZW5ndGhcbiAgICAgICAgdGhpcy5mbmFtZUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NOQU0pO1xuICAgICAgICAvLyBleHRyYSBmaWVsZCBsZW5ndGhcbiAgICAgICAgdGhpcy5leHRyYUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NFWFQpO1xuICAgIH1cblxuICAgIHJlYWQoZGF0YSwgb2Zmc2V0LCB0ZXh0RGVjb2Rlcikge1xuICAgICAgICBjb25zdCBuYW1lRGF0YSA9IGRhdGEuc2xpY2Uob2Zmc2V0LCAob2Zmc2V0ICs9IHRoaXMuZm5hbWVMZW4pKTtcbiAgICAgICAgdGhpcy5uYW1lID0gdGV4dERlY29kZXJcbiAgICAgICAgICAgID8gdGV4dERlY29kZXIuZGVjb2RlKG5ldyBVaW50OEFycmF5KG5hbWVEYXRhKSlcbiAgICAgICAgICAgIDogbmFtZURhdGEudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgY29uc3QgbGFzdENoYXIgPSBkYXRhW29mZnNldCAtIDFdO1xuICAgICAgICB0aGlzLmlzRGlyZWN0b3J5ID0gbGFzdENoYXIgPT09IDQ3IHx8IGxhc3RDaGFyID09PSA5MjtcblxuICAgICAgICBpZiAodGhpcy5leHRyYUxlbikge1xuICAgICAgICAgICAgdGhpcy5yZWFkRXh0cmEoZGF0YSwgb2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSB0aGlzLmV4dHJhTGVuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29tbWVudCA9IHRoaXMuY29tTGVuID8gZGF0YS5zbGljZShvZmZzZXQsIG9mZnNldCArIHRoaXMuY29tTGVuKS50b1N0cmluZygpIDogbnVsbDtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZU5hbWUoKSB7XG4gICAgICAgIGlmICgvXFxcXHxeXFx3Kzp8XlxcL3woXnxcXC8pXFwuXFwuKFxcL3wkKS8udGVzdCh0aGlzLm5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01hbGljaW91cyBlbnRyeTogJyArIHRoaXMubmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkRXh0cmEoZGF0YSwgb2Zmc2V0KSB7XG4gICAgICAgIGxldCBzaWduYXR1cmUsIHNpemU7XG4gICAgICAgIGNvbnN0IG1heFBvcyA9IG9mZnNldCArIHRoaXMuZXh0cmFMZW47XG4gICAgICAgIHdoaWxlIChvZmZzZXQgPCBtYXhQb3MpIHtcbiAgICAgICAgICAgIHNpZ25hdHVyZSA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gMjtcbiAgICAgICAgICAgIHNpemUgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICAgICAgICBpZiAoY29uc3RzLklEX1pJUDY0ID09PSBzaWduYXR1cmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlWmlwNjRFeHRyYShkYXRhLCBvZmZzZXQsIHNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ICs9IHNpemU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwYXJzZVppcDY0RXh0cmEoZGF0YSwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgICAgICAgaWYgKGxlbmd0aCA+PSA4ICYmIHRoaXMuc2l6ZSA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzMyKSB7XG4gICAgICAgICAgICB0aGlzLnNpemUgPSByZWFkVUludDY0TEUoZGF0YSwgb2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSA4O1xuICAgICAgICAgICAgbGVuZ3RoIC09IDg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA+PSA4ICYmIHRoaXMuY29tcHJlc3NlZFNpemUgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMikge1xuICAgICAgICAgICAgdGhpcy5jb21wcmVzc2VkU2l6ZSA9IHJlYWRVSW50NjRMRShkYXRhLCBvZmZzZXQpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDg7XG4gICAgICAgICAgICBsZW5ndGggLT0gODtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoID49IDggJiYgdGhpcy5vZmZzZXQgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMikge1xuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSByZWFkVUludDY0TEUoZGF0YSwgb2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSA4O1xuICAgICAgICAgICAgbGVuZ3RoIC09IDg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA+PSA0ICYmIHRoaXMuZGlza1N0YXJ0ID09PSBjb25zdHMuRUZfWklQNjRfT1JfMTYpIHtcbiAgICAgICAgICAgIHRoaXMuZGlza1N0YXJ0ID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0KTtcbiAgICAgICAgICAgIC8vIG9mZnNldCArPSA0OyBsZW5ndGggLT0gNDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBlbmNyeXB0ZWQoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5mbGFncyAmIGNvbnN0cy5GTEdfRU5UUllfRU5DKSA9PT0gY29uc3RzLkZMR19FTlRSWV9FTkM7XG4gICAgfVxuXG4gICAgZ2V0IGlzRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzRGlyZWN0b3J5O1xuICAgIH1cbn1cblxuY2xhc3MgRnNSZWFkIHtcbiAgICBjb25zdHJ1Y3RvcihmZCwgYnVmZmVyLCBvZmZzZXQsIGxlbmd0aCwgcG9zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuZmQgPSBmZDtcbiAgICAgICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuYnl0ZXNSZWFkID0gMDtcbiAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmVhZChzeW5jKSB7XG4gICAgICAgIFN0cmVhbVppcC5kZWJ1Z0xvZygncmVhZCcsIHRoaXMucG9zaXRpb24sIHRoaXMuYnl0ZXNSZWFkLCB0aGlzLmxlbmd0aCwgdGhpcy5vZmZzZXQpO1xuICAgICAgICB0aGlzLndhaXRpbmcgPSB0cnVlO1xuICAgICAgICBsZXQgZXJyO1xuICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgbGV0IGJ5dGVzUmVhZCA9IDA7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGJ5dGVzUmVhZCA9IGZzLnJlYWRTeW5jKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZkLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXQgKyB0aGlzLmJ5dGVzUmVhZCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZW5ndGggLSB0aGlzLmJ5dGVzUmVhZCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArIHRoaXMuYnl0ZXNSZWFkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBlcnIgPSBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yZWFkQ2FsbGJhY2soc3luYywgZXJyLCBlcnIgPyBieXRlc1JlYWQgOiBudWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZzLnJlYWQoXG4gICAgICAgICAgICAgICAgdGhpcy5mZCxcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcixcbiAgICAgICAgICAgICAgICB0aGlzLm9mZnNldCArIHRoaXMuYnl0ZXNSZWFkLFxuICAgICAgICAgICAgICAgIHRoaXMubGVuZ3RoIC0gdGhpcy5ieXRlc1JlYWQsXG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArIHRoaXMuYnl0ZXNSZWFkLFxuICAgICAgICAgICAgICAgIHRoaXMucmVhZENhbGxiYWNrLmJpbmQodGhpcywgc3luYylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkQ2FsbGJhY2soc3luYywgZXJyLCBieXRlc1JlYWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBieXRlc1JlYWQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aGlzLmJ5dGVzUmVhZCArPSBieXRlc1JlYWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVyciB8fCAhYnl0ZXNSZWFkIHx8IHRoaXMuYnl0ZXNSZWFkID09PSB0aGlzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhlcnIsIHRoaXMuYnl0ZXNSZWFkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVhZChzeW5jKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgRmlsZVdpbmRvd0J1ZmZlciB7XG4gICAgY29uc3RydWN0b3IoZmQpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmFsbG9jKDApO1xuICAgICAgICB0aGlzLmZkID0gZmQ7XG4gICAgICAgIHRoaXMuZnNPcCA9IG51bGw7XG4gICAgfVxuXG4gICAgY2hlY2tPcCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZnNPcCAmJiB0aGlzLmZzT3Aud2FpdGluZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPcGVyYXRpb24gaW4gcHJvZ3Jlc3MnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlYWQocG9zLCBsZW5ndGgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY2hlY2tPcCgpO1xuICAgICAgICBpZiAodGhpcy5idWZmZXIubGVuZ3RoIDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhsZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3M7XG4gICAgICAgIHRoaXMuZnNPcCA9IG5ldyBGc1JlYWQodGhpcy5mZCwgdGhpcy5idWZmZXIsIDAsIGxlbmd0aCwgdGhpcy5wb3NpdGlvbiwgY2FsbGJhY2spLnJlYWQoKTtcbiAgICB9XG5cbiAgICBleHBhbmRMZWZ0KGxlbmd0aCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jaGVja09wKCk7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmNvbmNhdChbQnVmZmVyLmFsbG9jKGxlbmd0aCksIHRoaXMuYnVmZmVyXSk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gLT0gbGVuZ3RoO1xuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbiA8IDApIHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZnNPcCA9IG5ldyBGc1JlYWQodGhpcy5mZCwgdGhpcy5idWZmZXIsIDAsIGxlbmd0aCwgdGhpcy5wb3NpdGlvbiwgY2FsbGJhY2spLnJlYWQoKTtcbiAgICB9XG5cbiAgICBleHBhbmRSaWdodChsZW5ndGgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY2hlY2tPcCgpO1xuICAgICAgICBjb25zdCBvZmZzZXQgPSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmNvbmNhdChbdGhpcy5idWZmZXIsIEJ1ZmZlci5hbGxvYyhsZW5ndGgpXSk7XG4gICAgICAgIHRoaXMuZnNPcCA9IG5ldyBGc1JlYWQoXG4gICAgICAgICAgICB0aGlzLmZkLFxuICAgICAgICAgICAgdGhpcy5idWZmZXIsXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBsZW5ndGgsXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICsgb2Zmc2V0LFxuICAgICAgICAgICAgY2FsbGJhY2tcbiAgICAgICAgKS5yZWFkKCk7XG4gICAgfVxuXG4gICAgbW92ZVJpZ2h0KGxlbmd0aCwgY2FsbGJhY2ssIHNoaWZ0KSB7XG4gICAgICAgIHRoaXMuY2hlY2tPcCgpO1xuICAgICAgICBpZiAoc2hpZnQpIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyLmNvcHkodGhpcy5idWZmZXIsIDAsIHNoaWZ0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNoaWZ0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IHNoaWZ0O1xuICAgICAgICB0aGlzLmZzT3AgPSBuZXcgRnNSZWFkKFxuICAgICAgICAgICAgdGhpcy5mZCxcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyLFxuICAgICAgICAgICAgdGhpcy5idWZmZXIubGVuZ3RoIC0gc2hpZnQsXG4gICAgICAgICAgICBzaGlmdCxcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKyB0aGlzLmJ1ZmZlci5sZW5ndGggLSBzaGlmdCxcbiAgICAgICAgICAgIGNhbGxiYWNrXG4gICAgICAgICkucmVhZCgpO1xuICAgIH1cbn1cblxuY2xhc3MgRW50cnlEYXRhUmVhZGVyU3RyZWFtIGV4dGVuZHMgc3RyZWFtLlJlYWRhYmxlIHtcbiAgICBjb25zdHJ1Y3RvcihmZCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5mZCA9IGZkO1xuICAgICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICAgICAgdGhpcy5yZWFkQ2FsbGJhY2sgPSB0aGlzLnJlYWRDYWxsYmFjay5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIF9yZWFkKG4pIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jKE1hdGgubWluKG4sIHRoaXMubGVuZ3RoIC0gdGhpcy5wb3MpKTtcbiAgICAgICAgaWYgKGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZzLnJlYWQodGhpcy5mZCwgYnVmZmVyLCAwLCBidWZmZXIubGVuZ3RoLCB0aGlzLm9mZnNldCArIHRoaXMucG9zLCB0aGlzLnJlYWRDYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnB1c2gobnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkQ2FsbGJhY2soZXJyLCBieXRlc1JlYWQsIGJ1ZmZlcikge1xuICAgICAgICB0aGlzLnBvcyArPSBieXRlc1JlYWQ7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgdGhpcy5wdXNoKG51bGwpO1xuICAgICAgICB9IGVsc2UgaWYgKCFieXRlc1JlYWQpIHtcbiAgICAgICAgICAgIHRoaXMucHVzaChudWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChieXRlc1JlYWQgIT09IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoMCwgYnl0ZXNSZWFkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucHVzaChidWZmZXIpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBFbnRyeVZlcmlmeVN0cmVhbSBleHRlbmRzIHN0cmVhbS5UcmFuc2Zvcm0ge1xuICAgIGNvbnN0cnVjdG9yKGJhc2VTdG0sIGNyYywgc2l6ZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnZlcmlmeSA9IG5ldyBDcmNWZXJpZnkoY3JjLCBzaXplKTtcbiAgICAgICAgYmFzZVN0bS5vbignZXJyb3InLCAoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfdHJhbnNmb3JtKGRhdGEsIGVuY29kaW5nLCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgZXJyO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy52ZXJpZnkuZGF0YShkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZXJyID0gZTtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayhlcnIsIGRhdGEpO1xuICAgIH1cbn1cblxuY2xhc3MgQ3JjVmVyaWZ5IHtcbiAgICBjb25zdHJ1Y3RvcihjcmMsIHNpemUpIHtcbiAgICAgICAgdGhpcy5jcmMgPSBjcmM7XG4gICAgICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBjcmM6IH4wLFxuICAgICAgICAgICAgc2l6ZTogMCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBkYXRhKGRhdGEpIHtcbiAgICAgICAgY29uc3QgY3JjVGFibGUgPSBDcmNWZXJpZnkuZ2V0Q3JjVGFibGUoKTtcbiAgICAgICAgbGV0IGNyYyA9IHRoaXMuc3RhdGUuY3JjO1xuICAgICAgICBsZXQgb2ZmID0gMDtcbiAgICAgICAgbGV0IGxlbiA9IGRhdGEubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoLS1sZW4gPj0gMCkge1xuICAgICAgICAgICAgY3JjID0gY3JjVGFibGVbKGNyYyBeIGRhdGFbb2ZmKytdKSAmIDB4ZmZdIF4gKGNyYyA+Pj4gOCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdGF0ZS5jcmMgPSBjcmM7XG4gICAgICAgIHRoaXMuc3RhdGUuc2l6ZSArPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2l6ZSA+PSB0aGlzLnNpemUpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICAgICAgICAgIGJ1Zi53cml0ZUludDMyTEUofnRoaXMuc3RhdGUuY3JjICYgMHhmZmZmZmZmZiwgMCk7XG4gICAgICAgICAgICBjcmMgPSBidWYucmVhZFVJbnQzMkxFKDApO1xuICAgICAgICAgICAgaWYgKGNyYyAhPT0gdGhpcy5jcmMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgQ1JDJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaXplICE9PSB0aGlzLnNpemUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2l6ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldENyY1RhYmxlKCkge1xuICAgICAgICBsZXQgY3JjVGFibGUgPSBDcmNWZXJpZnkuY3JjVGFibGU7XG4gICAgICAgIGlmICghY3JjVGFibGUpIHtcbiAgICAgICAgICAgIENyY1ZlcmlmeS5jcmNUYWJsZSA9IGNyY1RhYmxlID0gW107XG4gICAgICAgICAgICBjb25zdCBiID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgICAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCAyNTY7IG4rKykge1xuICAgICAgICAgICAgICAgIGxldCBjID0gbjtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gODsgLS1rID49IDA7ICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGMgJiAxKSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IDB4ZWRiODgzMjAgXiAoYyA+Pj4gMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gYyA+Pj4gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYyA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYi53cml0ZUludDMyTEUoYywgMCk7XG4gICAgICAgICAgICAgICAgICAgIGMgPSBiLnJlYWRVSW50MzJMRSgwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JjVGFibGVbbl0gPSBjO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcmNUYWJsZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlWmlwVGltZSh0aW1lYnl0ZXMsIGRhdGVieXRlcykge1xuICAgIGNvbnN0IHRpbWViaXRzID0gdG9CaXRzKHRpbWVieXRlcywgMTYpO1xuICAgIGNvbnN0IGRhdGViaXRzID0gdG9CaXRzKGRhdGVieXRlcywgMTYpO1xuXG4gICAgY29uc3QgbXQgPSB7XG4gICAgICAgIGg6IHBhcnNlSW50KHRpbWViaXRzLnNsaWNlKDAsIDUpLmpvaW4oJycpLCAyKSxcbiAgICAgICAgbTogcGFyc2VJbnQodGltZWJpdHMuc2xpY2UoNSwgMTEpLmpvaW4oJycpLCAyKSxcbiAgICAgICAgczogcGFyc2VJbnQodGltZWJpdHMuc2xpY2UoMTEsIDE2KS5qb2luKCcnKSwgMikgKiAyLFxuICAgICAgICBZOiBwYXJzZUludChkYXRlYml0cy5zbGljZSgwLCA3KS5qb2luKCcnKSwgMikgKyAxOTgwLFxuICAgICAgICBNOiBwYXJzZUludChkYXRlYml0cy5zbGljZSg3LCAxMSkuam9pbignJyksIDIpLFxuICAgICAgICBEOiBwYXJzZUludChkYXRlYml0cy5zbGljZSgxMSwgMTYpLmpvaW4oJycpLCAyKSxcbiAgICB9O1xuICAgIGNvbnN0IGR0X3N0ciA9IFttdC5ZLCBtdC5NLCBtdC5EXS5qb2luKCctJykgKyAnICcgKyBbbXQuaCwgbXQubSwgbXQuc10uam9pbignOicpICsgJyBHTVQrMCc7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGR0X3N0cikuZ2V0VGltZSgpO1xufVxuXG5mdW5jdGlvbiB0b0JpdHMoZGVjLCBzaXplKSB7XG4gICAgbGV0IGIgPSAoZGVjID4+PiAwKS50b1N0cmluZygyKTtcbiAgICB3aGlsZSAoYi5sZW5ndGggPCBzaXplKSB7XG4gICAgICAgIGIgPSAnMCcgKyBiO1xuICAgIH1cbiAgICByZXR1cm4gYi5zcGxpdCgnJyk7XG59XG5cbmZ1bmN0aW9uIHJlYWRVSW50NjRMRShidWZmZXIsIG9mZnNldCkge1xuICAgIHJldHVybiBidWZmZXIucmVhZFVJbnQzMkxFKG9mZnNldCArIDQpICogMHgwMDAwMDAwMTAwMDAwMDAwICsgYnVmZmVyLnJlYWRVSW50MzJMRShvZmZzZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0cmVhbVppcDtcbiIsICJpbXBvcnQgeyBBY3Rpb24sIEFjdGlvblBhbmVsLCBDbGlwYm9hcmQsIEZvcm0sIEljb24sIFBvcFRvUm9vdFR5cGUsIHNob3dIVUQsIHNob3dUb2FzdCwgVG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBGb3JtVmFsaWRhdGlvbiwgdXNlRm9ybSB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgRGVidWdnaW5nQnVnUmVwb3J0aW5nQWN0aW9uU2VjdGlvbiB9IGZyb20gXCJ+L2NvbXBvbmVudHMvYWN0aW9uc1wiO1xuaW1wb3J0IFJvb3RFcnJvckJvdW5kYXJ5IGZyb20gXCJ+L2NvbXBvbmVudHMvUm9vdEVycm9yQm91bmRhcnlcIjtcbmltcG9ydCBWYXVsdExpc3RlbmVyc1Byb3ZpZGVyIGZyb20gXCJ+L2NvbXBvbmVudHMvc2VhcmNoVmF1bHQvY29udGV4dC92YXVsdExpc3RlbmVyc1wiO1xuaW1wb3J0IHsgRk9MREVSX09QVElPTlMgfSBmcm9tIFwifi9jb25zdGFudHMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgQml0d2FyZGVuUHJvdmlkZXIsIHVzZUJpdHdhcmRlbiB9IGZyb20gXCJ+L2NvbnRleHQvYml0d2FyZGVuXCI7XG5pbXBvcnQgeyBTZXNzaW9uUHJvdmlkZXIgfSBmcm9tIFwifi9jb250ZXh0L3Nlc3Npb25cIjtcbmltcG9ydCB7IHVzZVZhdWx0Q29udGV4dCwgVmF1bHRQcm92aWRlciB9IGZyb20gXCJ+L2NvbnRleHQvdmF1bHRcIjtcbmltcG9ydCB7IGdldFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gXCIuL3V0aWxzL3Bhc3N3b3Jkc1wiO1xuaW1wb3J0IHsgcGxhdGZvcm0gfSBmcm9tIFwifi91dGlscy9wbGF0Zm9ybVwiO1xuXG50eXBlIENyZWF0ZUxvZ2luRm9ybVZhbHVlcyA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICB1c2VybmFtZTogc3RyaW5nO1xuICB2aXNpYmxlUGFzc3dvcmQ6IHN0cmluZztcbiAgaGlkZGVuUGFzc3dvcmQ6IHN0cmluZztcbiAgZm9sZGVySWQ6IHN0cmluZztcbiAgdXJpOiBzdHJpbmc7XG59O1xuXG5jb25zdCBDcmVhdGVMb2dpbkNvbW1hbmQgPSAoKSA9PiAoXG4gIDxSb290RXJyb3JCb3VuZGFyeT5cbiAgICA8Qml0d2FyZGVuUHJvdmlkZXI+XG4gICAgICA8U2Vzc2lvblByb3ZpZGVyIHVubG9jaz5cbiAgICAgICAgPFZhdWx0TGlzdGVuZXJzUHJvdmlkZXI+XG4gICAgICAgICAgPFZhdWx0UHJvdmlkZXI+XG4gICAgICAgICAgICA8Q3JlYXRlTG9naW5Db21wb25lbnQgLz5cbiAgICAgICAgICA8L1ZhdWx0UHJvdmlkZXI+XG4gICAgICAgIDwvVmF1bHRMaXN0ZW5lcnNQcm92aWRlcj5cbiAgICAgIDwvU2Vzc2lvblByb3ZpZGVyPlxuICAgIDwvQml0d2FyZGVuUHJvdmlkZXI+XG4gIDwvUm9vdEVycm9yQm91bmRhcnk+XG4pO1xuXG5mdW5jdGlvbiBDcmVhdGVMb2dpbkNvbXBvbmVudCgpIHtcbiAgY29uc3QgYml0d2FyZGVuID0gdXNlQml0d2FyZGVuKCk7XG4gIGNvbnN0IHsgZm9sZGVycyB9ID0gdXNlVmF1bHRDb250ZXh0KCk7XG4gIGNvbnN0IFtpc1N1Ym1pdHRpbmcsIHNldElzU3VibWl0dGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgYXN5bmMgZnVuY3Rpb24gb25TdWJtaXQodmFsdWVzOiBDcmVhdGVMb2dpbkZvcm1WYWx1ZXMpIHtcbiAgICBjb25zdCB0b2FzdCA9IGF3YWl0IHNob3dUb2FzdCh7IHRpdGxlOiBcIkNyZWF0aW5nIExvZ2luLi4uXCIsIHN0eWxlOiBUb2FzdC5TdHlsZS5BbmltYXRlZCB9KTtcbiAgICBzZXRJc1N1Ym1pdHRpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgbmFtZSwgdXNlcm5hbWUsIHZpc2libGVQYXNzd29yZCwgaGlkZGVuUGFzc3dvcmQsIGZvbGRlcklkLCB1cmkgfSA9IHZhbHVlcztcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gc2hvd1Bhc3N3b3JkID8gdmlzaWJsZVBhc3N3b3JkIDogaGlkZGVuUGFzc3dvcmQ7XG4gICAgICBjb25zdCBlZmZlY3RpdmVGb2xkZXJJZCA9IGZvbGRlcklkID09PSBGT0xERVJfT1BUSU9OUy5OT19GT0xERVIgPyBudWxsIDogZm9sZGVySWQ7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBiaXR3YXJkZW4uY3JlYXRlTG9naW5JdGVtKHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgcGFzc3dvcmQsXG4gICAgICAgIGZvbGRlcklkOiBlZmZlY3RpdmVGb2xkZXJJZCxcbiAgICAgICAgdXJpOiB1cmkgfHwgdW5kZWZpbmVkLFxuICAgICAgfSk7XG4gICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuXG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLlN1Y2Nlc3M7XG4gICAgICB0b2FzdC50aXRsZSA9IFwiTG9naW4gY3JlYXRlZFwiO1xuICAgICAgdG9hc3QubWVzc2FnZSA9IG5hbWU7XG4gICAgICByZXNldCgpO1xuICAgICAgYXdhaXQgc2hvd0hVRChgTG9naW4gY3JlYXRlZDogJHtuYW1lfWAsIHsgY2xlYXJSb290U2VhcmNoOiB0cnVlLCBwb3BUb1Jvb3RUeXBlOiBQb3BUb1Jvb3RUeXBlLkltbWVkaWF0ZSB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5GYWlsdXJlO1xuICAgICAgdG9hc3QudGl0bGUgPSBcIkZhaWxlZCB0byBjcmVhdGUgbG9naW5cIjtcbiAgICAgIHRvYXN0Lm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldElzU3VibWl0dGluZyhmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgW3Nob3dQYXNzd29yZCwgc2V0U2hvd1Bhc3N3b3JkXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICBjb25zdCB7IGl0ZW1Qcm9wcywgaGFuZGxlU3VibWl0LCBmb2N1cywgcmVzZXQgfSA9IHVzZUZvcm08Q3JlYXRlTG9naW5Gb3JtVmFsdWVzPih7XG4gICAgb25TdWJtaXQsXG4gICAgaW5pdGlhbFZhbHVlczoge1xuICAgICAgbmFtZTogXCJcIixcbiAgICAgIHVzZXJuYW1lOiBcIlwiLFxuICAgICAgdmlzaWJsZVBhc3N3b3JkOiBcIlwiLFxuICAgICAgaGlkZGVuUGFzc3dvcmQ6IFwiXCIsXG4gICAgICBmb2xkZXJJZDogRk9MREVSX09QVElPTlMuTk9fRk9MREVSLFxuICAgICAgdXJpOiBcIlwiLFxuICAgIH0sXG4gICAgdmFsaWRhdGlvbjoge1xuICAgICAgbmFtZTogRm9ybVZhbGlkYXRpb24uUmVxdWlyZWQsXG4gICAgICB2aXNpYmxlUGFzc3dvcmQ6IHNob3dQYXNzd29yZCA/IEZvcm1WYWxpZGF0aW9uLlJlcXVpcmVkIDogdW5kZWZpbmVkLFxuICAgICAgaGlkZGVuUGFzc3dvcmQ6IHNob3dQYXNzd29yZCA/IHVuZGVmaW5lZCA6IEZvcm1WYWxpZGF0aW9uLlJlcXVpcmVkLFxuICAgIH0sXG4gIH0pO1xuXG4gIGNvbnN0IHRvZ2dsZVBhc3N3b3JkVmlzaWJpbGl0eSA9ICgpID0+IHtcbiAgICBzZXRTaG93UGFzc3dvcmQoKHByZXYpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSAhcHJldjtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gKG5leHQgPyBmb2N1cyhcInZpc2libGVQYXNzd29yZFwiKSA6IGZvY3VzKFwiaGlkZGVuUGFzc3dvcmRcIikpLCAwKTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH0pO1xuICB9O1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgZm9jdXMoXCJuYW1lXCIpO1xuICB9LCBbXSk7XG5cbiAgY29uc3QgZ2VuZXJhdGVQYXNzd29yZCA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoaXNTdWJtaXR0aW5nKSByZXR1cm47XG5cbiAgICBjb25zdCB0b2FzdCA9IGF3YWl0IHNob3dUb2FzdCh7IHRpdGxlOiBcIkdlbmVyYXRpbmcgcGFzc3dvcmQuLi5cIiwgc3R5bGU6IFRvYXN0LlN0eWxlLkFuaW1hdGVkIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBhd2FpdCBnZXRQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMoKTtcbiAgICAgIGNvbnN0IGdlbmVyYXRlZFBhc3N3b3JkID0gYXdhaXQgYml0d2FyZGVuLmdlbmVyYXRlUGFzc3dvcmQob3B0aW9ucyk7XG4gICAgICBpdGVtUHJvcHMudmlzaWJsZVBhc3N3b3JkLm9uQ2hhbmdlPy4oZ2VuZXJhdGVkUGFzc3dvcmQpO1xuICAgICAgaXRlbVByb3BzLmhpZGRlblBhc3N3b3JkLm9uQ2hhbmdlPy4oZ2VuZXJhdGVkUGFzc3dvcmQpO1xuICAgICAgYXdhaXQgQ2xpcGJvYXJkLmNvcHkoZ2VuZXJhdGVkUGFzc3dvcmQpO1xuICAgICAgdG9hc3QudGl0bGUgPSBcIlBhc3N3b3JkIGdlbmVyYXRlZCBhbmQgY29waWVkXCI7XG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLlN1Y2Nlc3M7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRvYXN0LnRpdGxlID0gXCJGYWlsZWQgdG8gZ2VuZXJhdGUgcGFzc3dvcmRcIjtcbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuRmFpbHVyZTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgcGFzc3dvcmRGaWVsZFByb3BzOiBQYXJ0aWFsPEZvcm0uVGV4dEZpZWxkLlByb3BzPiA9IHtcbiAgICB0aXRsZTogXCJQYXNzd29yZFwiLFxuICAgIHBsYWNlaG9sZGVyOiBcIkVudGVyIHBhc3N3b3JkXCIsXG4gICAgb25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICBpdGVtUHJvcHMudmlzaWJsZVBhc3N3b3JkLm9uQ2hhbmdlPy4odmFsdWUpO1xuICAgICAgaXRlbVByb3BzLmhpZGRlblBhc3N3b3JkLm9uQ2hhbmdlPy4odmFsdWUpO1xuICAgIH0sXG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8Rm9ybVxuICAgICAgaXNMb2FkaW5nPXtpc1N1Ym1pdHRpbmd9XG4gICAgICBhY3Rpb25zPXtcbiAgICAgICAgPEFjdGlvblBhbmVsPlxuICAgICAgICAgIDxBY3Rpb24uU3VibWl0Rm9ybSB0aXRsZT1cIkNyZWF0ZSBMb2dpblwiIG9uU3VibWl0PXtoYW5kbGVTdWJtaXR9IGljb249e0ljb24uTmV3RG9jdW1lbnR9IC8+XG4gICAgICAgICAgPEFjdGlvblxuICAgICAgICAgICAgaWNvbj17c2hvd1Bhc3N3b3JkID8gSWNvbi5FeWVEaXNhYmxlZCA6IEljb24uRXllfVxuICAgICAgICAgICAgdGl0bGU9e3Nob3dQYXNzd29yZCA/IFwiSGlkZSBQYXNzd29yZFwiIDogXCJTaG93IFBhc3N3b3JkXCJ9XG4gICAgICAgICAgICBvbkFjdGlvbj17dG9nZ2xlUGFzc3dvcmRWaXNpYmlsaXR5fVxuICAgICAgICAgICAgc2hvcnRjdXQ9e3sgbWFjT1M6IHsga2V5OiBcImVcIiwgbW9kaWZpZXJzOiBbXCJvcHRcIl0gfSwgd2luZG93czogeyBrZXk6IFwiZVwiLCBtb2RpZmllcnM6IFtcImFsdFwiXSB9IH19XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8QWN0aW9uXG4gICAgICAgICAgICBpY29uPXtJY29uLktleX1cbiAgICAgICAgICAgIHRpdGxlPVwiR2VuZXJhdGUgUGFzc3dvcmRcIlxuICAgICAgICAgICAgb25BY3Rpb249e2dlbmVyYXRlUGFzc3dvcmR9XG4gICAgICAgICAgICBzaG9ydGN1dD17eyBtYWNPUzogeyBrZXk6IFwiZ1wiLCBtb2RpZmllcnM6IFtcIm9wdFwiXSB9LCB3aW5kb3dzOiB7IGtleTogXCJnXCIsIG1vZGlmaWVyczogW1wiYWx0XCJdIH0gfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxEZWJ1Z2dpbmdCdWdSZXBvcnRpbmdBY3Rpb25TZWN0aW9uIC8+XG4gICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gICAgICB9XG4gICAgPlxuICAgICAgPEZvcm0uVGV4dEZpZWxkIHsuLi5pdGVtUHJvcHMubmFtZX0gdGl0bGU9XCJOYW1lXCIgcGxhY2Vob2xkZXI9XCJHaXRIdWIsIEdtYWlsXCIgc3RvcmVWYWx1ZT17ZmFsc2V9IC8+XG4gICAgICA8Rm9ybS5Ecm9wZG93biB7Li4uaXRlbVByb3BzLmZvbGRlcklkfSB0aXRsZT1cIkZvbGRlclwiIHBsYWNlaG9sZGVyPVwiU2VsZWN0IGZvbGRlclwiIHN0b3JlVmFsdWU9e2ZhbHNlfT5cbiAgICAgICAge2ZvbGRlcnMubWFwKChmb2xkZXIpID0+IChcbiAgICAgICAgICA8Rm9ybS5Ecm9wZG93bi5JdGVtXG4gICAgICAgICAgICBrZXk9e2ZvbGRlci5pZH1cbiAgICAgICAgICAgIHZhbHVlPXtmb2xkZXIuaWQgPz8gRk9MREVSX09QVElPTlMuTk9fRk9MREVSfVxuICAgICAgICAgICAgdGl0bGU9e2ZvbGRlci5uYW1lfVxuICAgICAgICAgICAgaWNvbj17SWNvbi5Gb2xkZXJ9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L0Zvcm0uRHJvcGRvd24+XG4gICAgICA8Rm9ybS5UZXh0RmllbGQgey4uLml0ZW1Qcm9wcy51c2VybmFtZX0gdGl0bGU9XCJVc2VybmFtZVwiIHBsYWNlaG9sZGVyPVwiam9obi5kb2VAbWFpbC5jb21cIiBzdG9yZVZhbHVlPXtmYWxzZX0gLz5cbiAgICAgIDxGb3JtLlRleHRGaWVsZCB7Li4uaXRlbVByb3BzLnVyaX0gdGl0bGU9XCJXZWJzaXRlIFVSSVwiIHBsYWNlaG9sZGVyPVwiZXhhbXBsZS5jb21cIiBzdG9yZVZhbHVlPXtmYWxzZX0gLz5cbiAgICAgIHtzaG93UGFzc3dvcmQgPyAoXG4gICAgICAgIDxGb3JtLlRleHRGaWVsZCB7Li4uaXRlbVByb3BzLnZpc2libGVQYXNzd29yZH0gey4uLnBhc3N3b3JkRmllbGRQcm9wc30gLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxGb3JtLlBhc3N3b3JkRmllbGQgey4uLml0ZW1Qcm9wcy5oaWRkZW5QYXNzd29yZH0gey4uLnBhc3N3b3JkRmllbGRQcm9wc30gLz5cbiAgICAgICl9XG4gICAgICA8Rm9ybS5EZXNjcmlwdGlvblxuICAgICAgICB0aXRsZT1cIlwiXG4gICAgICAgIHRleHQ9e2BQcmVzcyAke3BsYXRmb3JtID09PSBcIm1hY29zXCIgPyBcIlx1MjMyNVwiIDogXCJBbHRcIn0rRSB0byAke3Nob3dQYXNzd29yZCA/IFwiaGlkZVwiIDogXCJzaG93XCJ9IHBhc3N3b3JkXFxuUHJlc3MgJHtcbiAgICAgICAgICBwbGF0Zm9ybSA9PT0gXCJtYWNvc1wiID8gXCJcdTIzMjVcIiA6IFwiQWx0XCJcbiAgICAgICAgfStHIHRvIGdlbmVyYXRlIHBhc3N3b3JkYH1cbiAgICAgIC8+XG4gICAgPC9Gb3JtPlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBDcmVhdGVMb2dpbkNvbW1hbmQ7XG4iLCAidmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXF1YWwoZm9vLCBiYXIpIHtcblx0dmFyIGN0b3IsIGxlbjtcblx0aWYgKGZvbyA9PT0gYmFyKSByZXR1cm4gdHJ1ZTtcblxuXHRpZiAoZm9vICYmIGJhciAmJiAoY3Rvcj1mb28uY29uc3RydWN0b3IpID09PSBiYXIuY29uc3RydWN0b3IpIHtcblx0XHRpZiAoY3RvciA9PT0gRGF0ZSkgcmV0dXJuIGZvby5nZXRUaW1lKCkgPT09IGJhci5nZXRUaW1lKCk7XG5cdFx0aWYgKGN0b3IgPT09IFJlZ0V4cCkgcmV0dXJuIGZvby50b1N0cmluZygpID09PSBiYXIudG9TdHJpbmcoKTtcblxuXHRcdGlmIChjdG9yID09PSBBcnJheSkge1xuXHRcdFx0aWYgKChsZW49Zm9vLmxlbmd0aCkgPT09IGJhci5sZW5ndGgpIHtcblx0XHRcdFx0d2hpbGUgKGxlbi0tICYmIGRlcXVhbChmb29bbGVuXSwgYmFyW2xlbl0pKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBsZW4gPT09IC0xO1xuXHRcdH1cblxuXHRcdGlmICghY3RvciB8fCB0eXBlb2YgZm9vID09PSAnb2JqZWN0Jykge1xuXHRcdFx0bGVuID0gMDtcblx0XHRcdGZvciAoY3RvciBpbiBmb28pIHtcblx0XHRcdFx0aWYgKGhhcy5jYWxsKGZvbywgY3RvcikgJiYgKytsZW4gJiYgIWhhcy5jYWxsKGJhciwgY3RvcikpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0aWYgKCEoY3RvciBpbiBiYXIpIHx8ICFkZXF1YWwoZm9vW2N0b3JdLCBiYXJbY3Rvcl0pKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmtleXMoYmFyKS5sZW5ndGggPT09IGxlbjtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZm9vICE9PSBmb28gJiYgYmFyICE9PSBiYXI7XG59XG4iLCAiLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJub2RlXCIgLz5cblxuZXhwb3J0IHsgdXNlUHJvbWlzZSB9IGZyb20gXCIuL3VzZVByb21pc2VcIjtcbmV4cG9ydCB7IHVzZUNhY2hlZFN0YXRlIH0gZnJvbSBcIi4vdXNlQ2FjaGVkU3RhdGVcIjtcbmV4cG9ydCB7IHVzZUNhY2hlZFByb21pc2UgfSBmcm9tIFwiLi91c2VDYWNoZWRQcm9taXNlXCI7XG5leHBvcnQgeyB1c2VGZXRjaCB9IGZyb20gXCIuL3VzZUZldGNoXCI7XG5leHBvcnQgeyB1c2VFeGVjIH0gZnJvbSBcIi4vdXNlRXhlY1wiO1xuZXhwb3J0IHsgdXNlU3RyZWFtSlNPTiB9IGZyb20gXCIuL3VzZVN0cmVhbUpTT05cIjtcbmV4cG9ydCB7IHVzZVNRTCB9IGZyb20gXCIuL3VzZVNRTFwiO1xuZXhwb3J0IHsgdXNlRm9ybSwgRm9ybVZhbGlkYXRpb24gfSBmcm9tIFwiLi91c2VGb3JtXCI7XG5leHBvcnQgeyB1c2VBSSB9IGZyb20gXCIuL3VzZUFJXCI7XG5leHBvcnQgeyB1c2VGcmVjZW5jeVNvcnRpbmcgfSBmcm9tIFwiLi91c2VGcmVjZW5jeVNvcnRpbmdcIjtcbmV4cG9ydCB7IHVzZUxvY2FsU3RvcmFnZSB9IGZyb20gXCIuL3VzZUxvY2FsU3RvcmFnZVwiO1xuXG5leHBvcnQgeyBnZXRBdmF0YXJJY29uLCBnZXRGYXZpY29uLCBnZXRQcm9ncmVzc0ljb24gfSBmcm9tIFwiLi9pY29uXCI7XG5cbmV4cG9ydCB7IE9BdXRoU2VydmljZSwgd2l0aEFjY2Vzc1Rva2VuLCBnZXRBY2Nlc3NUb2tlbiB9IGZyb20gXCIuL29hdXRoXCI7XG5cbmV4cG9ydCB7IGNyZWF0ZURlZXBsaW5rLCBjcmVhdGVFeHRlbnNpb25EZWVwbGluaywgY3JlYXRlU2NyaXB0Q29tbWFuZERlZXBsaW5rLCBEZWVwbGlua1R5cGUgfSBmcm9tIFwiLi9jcmVhdGVEZWVwbGlua1wiO1xuZXhwb3J0IHsgZXhlY3V0ZVNRTCB9IGZyb20gXCIuL2V4ZWN1dGVTUUxcIjtcbmV4cG9ydCB7IHJ1bkFwcGxlU2NyaXB0IH0gZnJvbSBcIi4vcnVuLWFwcGxlc2NyaXB0XCI7XG5leHBvcnQgeyBydW5Qb3dlclNoZWxsU2NyaXB0IH0gZnJvbSBcIi4vcnVuLXBvd2Vyc2hlbGwtc2NyaXB0XCI7XG5leHBvcnQgeyBzaG93RmFpbHVyZVRvYXN0IH0gZnJvbSBcIi4vc2hvd0ZhaWx1cmVUb2FzdFwiO1xuZXhwb3J0IHsgd2l0aENhY2hlIH0gZnJvbSBcIi4vY2FjaGVcIjtcblxuZXhwb3J0IHR5cGUgeyBQcm9taXNlT3B0aW9ucyB9IGZyb20gXCIuL3VzZVByb21pc2VcIjtcbmV4cG9ydCB0eXBlIHsgQ2FjaGVkUHJvbWlzZU9wdGlvbnMgfSBmcm9tIFwiLi91c2VDYWNoZWRQcm9taXNlXCI7XG5leHBvcnQgdHlwZSB7XG4gIE9BdXRoU2VydmljZU9wdGlvbnMsXG4gIE9uQXV0aG9yaXplUGFyYW1zLFxuICBXaXRoQWNjZXNzVG9rZW5Db21wb25lbnRPckZuLFxuICBQcm92aWRlcldpdGhEZWZhdWx0Q2xpZW50T3B0aW9ucyxcbiAgUHJvdmlkZXJPcHRpb25zLFxufSBmcm9tIFwiLi9vYXV0aFwiO1xuZXhwb3J0IHR5cGUgeyBBc3luY1N0YXRlLCBNdXRhdGVQcm9taXNlIH0gZnJvbSBcIi4vdHlwZXNcIjtcbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrLCBSZWZPYmplY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGVudmlyb25tZW50LCBMYXVuY2hUeXBlLCBUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IHVzZURlZXBNZW1vIH0gZnJvbSBcIi4vdXNlRGVlcE1lbW9cIjtcbmltcG9ydCB7XG4gIEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZSxcbiAgTXV0YXRlUHJvbWlzZSxcbiAgVXNlUHJvbWlzZVJldHVyblR5cGUsXG4gIEFzeW5jU3RhdGUsXG4gIEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZSxcbiAgVW53cmFwUmV0dXJuLFxuICBQYWdpbmF0aW9uT3B0aW9ucyxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IHVzZUxhdGVzdCB9IGZyb20gXCIuL3VzZUxhdGVzdFwiO1xuaW1wb3J0IHsgc2hvd0ZhaWx1cmVUb2FzdCB9IGZyb20gXCIuL3Nob3dGYWlsdXJlVG9hc3RcIjtcblxuZXhwb3J0IHR5cGUgUHJvbWlzZU9wdGlvbnM8VCBleHRlbmRzIEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZSB8IEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZT4gPSB7XG4gIC8qKlxuICAgKiBBIHJlZmVyZW5jZSB0byBhbiBgQWJvcnRDb250cm9sbGVyYCB0byBjYW5jZWwgYSBwcmV2aW91cyBjYWxsIHdoZW4gdHJpZ2dlcmluZyBhIG5ldyBvbmVcbiAgICovXG4gIGFib3J0YWJsZT86IFJlZk9iamVjdDxBYm9ydENvbnRyb2xsZXIgfCBudWxsIHwgdW5kZWZpbmVkPjtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gYWN0dWFsbHkgZXhlY3V0ZSB0aGUgZnVuY3Rpb24gb3Igbm90LlxuICAgKiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2FzZXMgd2hlcmUgb25lIG9mIHRoZSBmdW5jdGlvbidzIGFyZ3VtZW50cyBkZXBlbmRzIG9uIHNvbWV0aGluZyB0aGF0XG4gICAqIG1pZ2h0IG5vdCBiZSBhdmFpbGFibGUgcmlnaHQgYXdheSAoZm9yIGV4YW1wbGUsIGRlcGVuZHMgb24gc29tZSB1c2VyIGlucHV0cykuIEJlY2F1c2UgUmVhY3QgcmVxdWlyZXNcbiAgICogZXZlcnkgaG9va3MgdG8gYmUgZGVmaW5lZCBvbiB0aGUgcmVuZGVyLCB0aGlzIGZsYWcgZW5hYmxlcyB5b3UgdG8gZGVmaW5lIHRoZSBob29rIHJpZ2h0IGF3YXkgYnV0XG4gICAqIHdhaXQgdXRpbCB5b3UgaGF2ZSBhbGwgdGhlIGFyZ3VtZW50cyByZWFkeSB0byBleGVjdXRlIHRoZSBmdW5jdGlvbi5cbiAgICovXG4gIGV4ZWN1dGU/OiBib29sZWFuO1xuICAvKipcbiAgICogT3B0aW9ucyBmb3IgdGhlIGdlbmVyaWMgZmFpbHVyZSB0b2FzdC5cbiAgICogSXQgYWxsb3dzIHlvdSB0byBjdXN0b21pemUgdGhlIHRpdGxlLCBtZXNzYWdlLCBhbmQgcHJpbWFyeSBhY3Rpb24gb2YgdGhlIGZhaWx1cmUgdG9hc3QuXG4gICAqL1xuICBmYWlsdXJlVG9hc3RPcHRpb25zPzogUGFydGlhbDxQaWNrPFRvYXN0Lk9wdGlvbnMsIFwidGl0bGVcIiB8IFwicHJpbWFyeUFjdGlvblwiIHwgXCJtZXNzYWdlXCI+PjtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGFuIGV4ZWN1dGlvbiBmYWlscy4gQnkgZGVmYXVsdCBpdCB3aWxsIGxvZyB0aGUgZXJyb3IgYW5kIHNob3dcbiAgICogYSBnZW5lcmljIGZhaWx1cmUgdG9hc3QuXG4gICAqL1xuICBvbkVycm9yPzogKGVycm9yOiBFcnJvcikgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhbiBleGVjdXRpb24gc3VjY2VlZHMuXG4gICAqL1xuICBvbkRhdGE/OiAoZGF0YTogVW53cmFwUmV0dXJuPFQ+LCBwYWdpbmF0aW9uPzogUGFnaW5hdGlvbk9wdGlvbnM8VW53cmFwUmV0dXJuPFQ+PikgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhbiBleGVjdXRpb24gd2lsbCBzdGFydFxuICAgKi9cbiAgb25XaWxsRXhlY3V0ZT86IChwYXJhbWV0ZXJzOiBQYXJhbWV0ZXJzPFQ+KSA9PiB2b2lkO1xufTtcblxuLyoqXG4gKiBXcmFwcyBhbiBhc3luY2hyb25vdXMgZnVuY3Rpb24gb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBQcm9taXNlIGluIGFub3RoZXIgZnVuY3Rpb24sIGFuZCByZXR1cm5zIHRoZSB7QGxpbmsgQXN5bmNTdGF0ZX0gY29ycmVzcG9uZGluZyB0byB0aGUgZXhlY3V0aW9uIG9mIHRoZSBmdW5jdGlvbi5cbiAqXG4gKiBAcmVtYXJrIFRoaXMgb3ZlcmxvYWQgc2hvdWxkIGJlIHVzZWQgd2hlbiB3b3JraW5nIHdpdGggcGFnaW5hdGVkIGRhdGEgc291cmNlcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyBzZXRUaW1lb3V0IH0gZnJvbSBcIm5vZGU6dGltZXJzL3Byb21pc2VzXCI7XG4gKiBpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuICogaW1wb3J0IHsgTGlzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZVByb21pc2UgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKCkge1xuICogICBjb25zdCBbc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAqXG4gKiAgIGNvbnN0IHsgaXNMb2FkaW5nLCBkYXRhLCBwYWdpbmF0aW9uIH0gPSB1c2VQcm9taXNlKFxuICogICAgIChzZWFyY2hUZXh0OiBzdHJpbmcpID0+IGFzeW5jIChvcHRpb25zOiB7IHBhZ2U6IG51bWJlciB9KSA9PiB7XG4gKiAgICAgICBhd2FpdCBzZXRUaW1lb3V0KDIwMCk7XG4gKiAgICAgICBjb25zdCBuZXdEYXRhID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogMjUgfSwgKF92LCBpbmRleCkgPT4gKHtcbiAqICAgICAgICAgaW5kZXgsXG4gKiAgICAgICAgIHBhZ2U6IG9wdGlvbnMucGFnZSxcbiAqICAgICAgICAgdGV4dDogc2VhcmNoVGV4dCxcbiAqICAgICAgIH0pKTtcbiAqICAgICAgIHJldHVybiB7IGRhdGE6IG5ld0RhdGEsIGhhc01vcmU6IG9wdGlvbnMucGFnZSA8IDEwIH07XG4gKiAgICAgfSxcbiAqICAgICBbc2VhcmNoVGV4dF1cbiAqICAgKTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9IG9uU2VhcmNoVGV4dENoYW5nZT17c2V0U2VhcmNoVGV4dH0gcGFnaW5hdGlvbj17cGFnaW5hdGlvbn0+XG4gKiAgICAgICB7ZGF0YT8ubWFwKChpdGVtKSA9PiAoXG4gKiAgICAgICAgIDxMaXN0Lkl0ZW1cbiAqICAgICAgICAgICBrZXk9e2Ake2l0ZW0ucGFnZX0gJHtpdGVtLmluZGV4fSAke2l0ZW0udGV4dH1gfVxuICogICAgICAgICAgIHRpdGxlPXtgUGFnZSAke2l0ZW0ucGFnZX0gSXRlbSAke2l0ZW0uaW5kZXh9YH1cbiAqICAgICAgICAgICBzdWJ0aXRsZT17aXRlbS50ZXh0fVxuICogICAgICAgICAvPlxuICogICAgICAgKSl9XG4gKiAgICAgPC9MaXN0PlxuICogICApO1xuICogfTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlUHJvbWlzZTxUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlPFtdPj4oXG4gIGZuOiBULFxuKTogVXNlUHJvbWlzZVJldHVyblR5cGU8VW53cmFwUmV0dXJuPFQ+PjtcbmV4cG9ydCBmdW5jdGlvbiB1c2VQcm9taXNlPFQgZXh0ZW5kcyBGdW5jdGlvblJldHVybmluZ1BhZ2luYXRlZFByb21pc2U+KFxuICBmbjogVCxcbiAgYXJnczogUGFyYW1ldGVyczxUPixcbiAgb3B0aW9ucz86IFByb21pc2VPcHRpb25zPFQ+LFxuKTogVXNlUHJvbWlzZVJldHVyblR5cGU8VW53cmFwUmV0dXJuPFQ+PjtcblxuLyoqXG4gKiBXcmFwcyBhbiBhc3luY2hyb25vdXMgZnVuY3Rpb24gb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBQcm9taXNlIGFuZCByZXR1cm5zIHRoZSB7QGxpbmsgQXN5bmNTdGF0ZX0gY29ycmVzcG9uZGluZyB0byB0aGUgZXhlY3V0aW9uIG9mIHRoZSBmdW5jdGlvbi5cbiAqXG4gKiBAcmVtYXJrIFRoZSBmdW5jdGlvbiBpcyBhc3N1bWVkIHRvIGJlIGNvbnN0YW50IChlZy4gY2hhbmdpbmcgaXQgd29uJ3QgdHJpZ2dlciBhIHJldmFsaWRhdGlvbikuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgdXNlUHJvbWlzZSB9IGZyb20gJ0ByYXljYXN0L3V0aWxzJztcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKCkge1xuICogICBjb25zdCBhYm9ydGFibGUgPSB1c2VSZWY8QWJvcnRDb250cm9sbGVyPigpO1xuICogICBjb25zdCB7IGlzTG9hZGluZywgZGF0YSwgcmV2YWxpZGF0ZSB9ID0gdXNlUHJvbWlzZShhc3luYyAodXJsOiBzdHJpbmcpID0+IHtcbiAqICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgeyBzaWduYWw6IGFib3J0YWJsZS5jdXJyZW50Py5zaWduYWwgfSk7XG4gKiAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICogICAgIHJldHVybiByZXN1bHRcbiAqICAgfSxcbiAqICAgWydodHRwczovL2FwaS5leGFtcGxlJ10sXG4gKiAgIHtcbiAqICAgICBhYm9ydGFibGVcbiAqICAgfSk7XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxEZXRhaWxcbiAqICAgICAgIGlzTG9hZGluZz17aXNMb2FkaW5nfVxuICogICAgICAgbWFya2Rvd249e2RhdGF9XG4gKiAgICAgICBhY3Rpb25zPXtcbiAqICAgICAgICAgPEFjdGlvblBhbmVsPlxuICogICAgICAgICAgIDxBY3Rpb24gdGl0bGU9XCJSZWxvYWRcIiBvbkFjdGlvbj17KCkgPT4gcmV2YWxpZGF0ZSgpfSAvPlxuICogICAgICAgICA8L0FjdGlvblBhbmVsPlxuICogICAgICAgfVxuICogICAgIC8+XG4gKiAgICk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VQcm9taXNlPFQgZXh0ZW5kcyBGdW5jdGlvblJldHVybmluZ1Byb21pc2U8W10+PihmbjogVCk6IFVzZVByb21pc2VSZXR1cm5UeXBlPFVud3JhcFJldHVybjxUPj47XG5leHBvcnQgZnVuY3Rpb24gdXNlUHJvbWlzZTxUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlPihcbiAgZm46IFQsXG4gIGFyZ3M6IFBhcmFtZXRlcnM8VD4sXG4gIG9wdGlvbnM/OiBQcm9taXNlT3B0aW9uczxUPixcbik6IFVzZVByb21pc2VSZXR1cm5UeXBlPFVud3JhcFJldHVybjxUPj47XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VQcm9taXNlPFQgZXh0ZW5kcyBGdW5jdGlvblJldHVybmluZ1Byb21pc2UgfCBGdW5jdGlvblJldHVybmluZ1BhZ2luYXRlZFByb21pc2U+KFxuICBmbjogVCxcbiAgYXJncz86IFBhcmFtZXRlcnM8VD4sXG4gIG9wdGlvbnM/OiBQcm9taXNlT3B0aW9uczxUPixcbik6IFVzZVByb21pc2VSZXR1cm5UeXBlPGFueT4ge1xuICBjb25zdCBsYXN0Q2FsbElkID0gdXNlUmVmKDApO1xuICBjb25zdCBbc3RhdGUsIHNldF0gPSB1c2VTdGF0ZTxBc3luY1N0YXRlPFVud3JhcFJldHVybjxUPj4+KHsgaXNMb2FkaW5nOiB0cnVlIH0pO1xuXG4gIGNvbnN0IGZuUmVmID0gdXNlTGF0ZXN0KGZuKTtcbiAgY29uc3QgbGF0ZXN0QWJvcnRhYmxlID0gdXNlTGF0ZXN0KG9wdGlvbnM/LmFib3J0YWJsZSk7XG4gIGNvbnN0IGxhdGVzdEFyZ3MgPSB1c2VMYXRlc3QoYXJncyB8fCBbXSk7XG4gIGNvbnN0IGxhdGVzdE9uRXJyb3IgPSB1c2VMYXRlc3Qob3B0aW9ucz8ub25FcnJvcik7XG4gIGNvbnN0IGxhdGVzdE9uRGF0YSA9IHVzZUxhdGVzdChvcHRpb25zPy5vbkRhdGEpO1xuICBjb25zdCBsYXRlc3RPbldpbGxFeGVjdXRlID0gdXNlTGF0ZXN0KG9wdGlvbnM/Lm9uV2lsbEV4ZWN1dGUpO1xuICBjb25zdCBsYXRlc3RGYWlsdXJlVG9hc3QgPSB1c2VMYXRlc3Qob3B0aW9ucz8uZmFpbHVyZVRvYXN0T3B0aW9ucyk7XG4gIGNvbnN0IGxhdGVzdFZhbHVlID0gdXNlTGF0ZXN0KHN0YXRlLmRhdGEpO1xuICBjb25zdCBsYXRlc3RDYWxsYmFjayA9IHVzZVJlZjwoLi4uYXJnczogUGFyYW1ldGVyczxUPikgPT4gUHJvbWlzZTxVbndyYXBSZXR1cm48VD4+PihudWxsKTtcblxuICBjb25zdCBwYWdpbmF0aW9uQXJnc1JlZiA9IHVzZVJlZjxQYWdpbmF0aW9uT3B0aW9ucz4oeyBwYWdlOiAwIH0pO1xuICBjb25zdCB1c2VQYWdpbmF0aW9uUmVmID0gdXNlUmVmKGZhbHNlKTtcbiAgY29uc3QgaGFzTW9yZVJlZiA9IHVzZVJlZih0cnVlKTtcbiAgY29uc3QgcGFnZVNpemVSZWYgPSB1c2VSZWYoNTApO1xuXG4gIGNvbnN0IGFib3J0ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChsYXRlc3RBYm9ydGFibGUuY3VycmVudCkge1xuICAgICAgbGF0ZXN0QWJvcnRhYmxlLmN1cnJlbnQuY3VycmVudD8uYWJvcnQoKTtcbiAgICAgIGxhdGVzdEFib3J0YWJsZS5jdXJyZW50LmN1cnJlbnQgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgfVxuICAgIHJldHVybiArK2xhc3RDYWxsSWQuY3VycmVudDtcbiAgfSwgW2xhdGVzdEFib3J0YWJsZV0pO1xuXG4gIGNvbnN0IGNhbGxiYWNrID0gdXNlQ2FsbGJhY2soXG4gICAgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8VD4pOiBQcm9taXNlPFVud3JhcFJldHVybjxUPj4gPT4ge1xuICAgICAgY29uc3QgY2FsbElkID0gYWJvcnQoKTtcblxuICAgICAgbGF0ZXN0T25XaWxsRXhlY3V0ZS5jdXJyZW50Py4oYXJncyk7XG5cbiAgICAgIHNldCgocHJldlN0YXRlKSA9PiAoeyAuLi5wcmV2U3RhdGUsIGlzTG9hZGluZzogdHJ1ZSB9KSk7XG5cbiAgICAgIGNvbnN0IHByb21pc2VPclBhZ2luYXRlZFByb21pc2UgPSBiaW5kUHJvbWlzZUlmTmVlZGVkKGZuUmVmLmN1cnJlbnQpKC4uLmFyZ3MpO1xuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogYW55KSB7XG4gICAgICAgIGlmIChlcnJvci5uYW1lID09IFwiQWJvcnRFcnJvclwiKSB7XG4gICAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxJZCA9PT0gbGFzdENhbGxJZC5jdXJyZW50KSB7XG4gICAgICAgICAgLy8gaGFuZGxlIGVycm9yc1xuICAgICAgICAgIGlmIChsYXRlc3RPbkVycm9yLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGxhdGVzdE9uRXJyb3IuY3VycmVudChlcnJvcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChlbnZpcm9ubWVudC5sYXVuY2hUeXBlICE9PSBMYXVuY2hUeXBlLkJhY2tncm91bmQpIHtcbiAgICAgICAgICAgICAgc2hvd0ZhaWx1cmVUb2FzdChlcnJvciwge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBcIkZhaWxlZCB0byBmZXRjaCBsYXRlc3QgZGF0YVwiLFxuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb246IHtcbiAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIlJldHJ5XCIsXG4gICAgICAgICAgICAgICAgICBvbkFjdGlvbih0b2FzdCkge1xuICAgICAgICAgICAgICAgICAgICB0b2FzdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGxhdGVzdENhbGxiYWNrLmN1cnJlbnQ/LiguLi4oKGxhdGVzdEFyZ3MuY3VycmVudCB8fCBbXSkgYXMgUGFyYW1ldGVyczxUPikpO1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC4uLmxhdGVzdEZhaWx1cmVUb2FzdC5jdXJyZW50LFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgc2V0KHsgZXJyb3IsIGlzTG9hZGluZzogZmFsc2UgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgcHJvbWlzZU9yUGFnaW5hdGVkUHJvbWlzZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHVzZVBhZ2luYXRpb25SZWYuY3VycmVudCA9IHRydWU7XG4gICAgICAgIHJldHVybiBwcm9taXNlT3JQYWdpbmF0ZWRQcm9taXNlKHBhZ2luYXRpb25BcmdzUmVmLmN1cnJlbnQpLnRoZW4oXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0b28gY29tcGxpY2F0ZWQgZm9yIFRTXG4gICAgICAgICAgKHsgZGF0YSwgaGFzTW9yZSwgY3Vyc29yIH06IHsgZGF0YTogVW53cmFwUmV0dXJuPFQ+OyBoYXNNb3JlOiBib29sZWFuOyBjdXJzb3I/OiBhbnkgfSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNhbGxJZCA9PT0gbGFzdENhbGxJZC5jdXJyZW50KSB7XG4gICAgICAgICAgICAgIGlmIChwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudC5jdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudC5sYXN0SXRlbSA9IGRhdGE/LltkYXRhLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKGxhdGVzdE9uRGF0YS5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgbGF0ZXN0T25EYXRhLmN1cnJlbnQoZGF0YSwgcGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoaGFzTW9yZSkge1xuICAgICAgICAgICAgICAgIHBhZ2VTaXplUmVmLmN1cnJlbnQgPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBoYXNNb3JlUmVmLmN1cnJlbnQgPSBoYXNNb3JlO1xuXG4gICAgICAgICAgICAgIHNldCgocHJldmlvdXNEYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBhZ2luYXRpb25BcmdzUmVmLmN1cnJlbnQucGFnZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZGF0YSwgaXNMb2FkaW5nOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHdlIGtub3cgaXQncyBhbiBhcnJheSBoZXJlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgZGF0YTogKHByZXZpb3VzRGF0YS5kYXRhIHx8IFtdKT8uY29uY2F0KGRhdGEpLCBpc0xvYWRpbmc6IGZhbHNlIH07XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIChlcnJvcjogdW5rbm93bikgPT4ge1xuICAgICAgICAgICAgaGFzTW9yZVJlZi5jdXJyZW50ID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgICAgIH0sXG4gICAgICAgICkgYXMgUHJvbWlzZTxVbndyYXBSZXR1cm48VD4+O1xuICAgICAgfVxuXG4gICAgICB1c2VQYWdpbmF0aW9uUmVmLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgIHJldHVybiBwcm9taXNlT3JQYWdpbmF0ZWRQcm9taXNlLnRoZW4oKGRhdGE6IFVud3JhcFJldHVybjxUPikgPT4ge1xuICAgICAgICBpZiAoY2FsbElkID09PSBsYXN0Q2FsbElkLmN1cnJlbnQpIHtcbiAgICAgICAgICBpZiAobGF0ZXN0T25EYXRhLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGxhdGVzdE9uRGF0YS5jdXJyZW50KGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZXQoeyBkYXRhLCBpc0xvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9LCBoYW5kbGVFcnJvcikgYXMgUHJvbWlzZTxVbndyYXBSZXR1cm48VD4+O1xuICAgIH0sXG4gICAgW1xuICAgICAgbGF0ZXN0T25EYXRhLFxuICAgICAgbGF0ZXN0T25FcnJvcixcbiAgICAgIGxhdGVzdEFyZ3MsXG4gICAgICBmblJlZixcbiAgICAgIHNldCxcbiAgICAgIGxhdGVzdENhbGxiYWNrLFxuICAgICAgbGF0ZXN0T25XaWxsRXhlY3V0ZSxcbiAgICAgIHBhZ2luYXRpb25BcmdzUmVmLFxuICAgICAgbGF0ZXN0RmFpbHVyZVRvYXN0LFxuICAgICAgYWJvcnQsXG4gICAgXSxcbiAgKTtcblxuICBsYXRlc3RDYWxsYmFjay5jdXJyZW50ID0gY2FsbGJhY2s7XG5cbiAgY29uc3QgcmV2YWxpZGF0ZSA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAvLyByZXNldCB0aGUgcGFnaW5hdGlvblxuICAgIHBhZ2luYXRpb25BcmdzUmVmLmN1cnJlbnQgPSB7IHBhZ2U6IDAgfTtcblxuICAgIGNvbnN0IGFyZ3MgPSAobGF0ZXN0QXJncy5jdXJyZW50IHx8IFtdKSBhcyBQYXJhbWV0ZXJzPFQ+O1xuICAgIHJldHVybiBjYWxsYmFjayguLi5hcmdzKTtcbiAgfSwgW2NhbGxiYWNrLCBsYXRlc3RBcmdzXSk7XG5cbiAgY29uc3QgbXV0YXRlID0gdXNlQ2FsbGJhY2s8TXV0YXRlUHJvbWlzZTxBd2FpdGVkPFJldHVyblR5cGU8VD4+LCB1bmRlZmluZWQ+PihcbiAgICBhc3luYyAoYXN5bmNVcGRhdGUsIG9wdGlvbnMpID0+IHtcbiAgICAgIGxldCBkYXRhQmVmb3JlT3B0aW1pc3RpY1VwZGF0ZTogQXdhaXRlZDxSZXR1cm5UeXBlPFQ+PiB8IHVuZGVmaW5lZDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChvcHRpb25zPy5vcHRpbWlzdGljVXBkYXRlKSB7XG4gICAgICAgICAgLy8gY2FuY2VsIHRoZSBpbi1mbGlnaHQgcmVxdWVzdCB0byBtYWtlIHN1cmUgaXQgd29uJ3Qgb3ZlcndyaXRlIHRoZSBvcHRpbWlzdGljIHVwZGF0ZVxuICAgICAgICAgIGFib3J0KCk7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnM/LnJvbGxiYWNrT25FcnJvciAhPT0gXCJmdW5jdGlvblwiICYmIG9wdGlvbnM/LnJvbGxiYWNrT25FcnJvciAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIGRhdGEgYmVmb3JlIHRoZSBvcHRpbWlzdGljIHVwZGF0ZSxcbiAgICAgICAgICAgIC8vIGJ1dCBvbmx5IGlmIHdlIG5lZWQgaXQgKGVnLiBvbmx5IHdoZW4gd2Ugd2FudCB0byBhdXRvbWF0aWNhbGx5IHJvbGxiYWNrIGFmdGVyKVxuICAgICAgICAgICAgZGF0YUJlZm9yZU9wdGltaXN0aWNVcGRhdGUgPSBzdHJ1Y3R1cmVkQ2xvbmUobGF0ZXN0VmFsdWUuY3VycmVudD8udmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB1cGRhdGUgPSBvcHRpb25zLm9wdGltaXN0aWNVcGRhdGU7XG4gICAgICAgICAgc2V0KChwcmV2U3RhdGUpID0+ICh7IC4uLnByZXZTdGF0ZSwgZGF0YTogdXBkYXRlKHByZXZTdGF0ZS5kYXRhKSB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF3YWl0IGFzeW5jVXBkYXRlO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBjb25zdCB1cGRhdGUgPSBvcHRpb25zLnJvbGxiYWNrT25FcnJvcjtcbiAgICAgICAgICBzZXQoKHByZXZTdGF0ZSkgPT4gKHsgLi4ucHJldlN0YXRlLCBkYXRhOiB1cGRhdGUocHJldlN0YXRlLmRhdGEpIH0pKTtcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zPy5vcHRpbWlzdGljVXBkYXRlICYmIG9wdGlvbnM/LnJvbGxiYWNrT25FcnJvciAhPT0gZmFsc2UpIHtcbiAgICAgICAgICBzZXQoKHByZXZTdGF0ZSkgPT4gKHsgLi4ucHJldlN0YXRlLCBkYXRhOiBkYXRhQmVmb3JlT3B0aW1pc3RpY1VwZGF0ZSB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKG9wdGlvbnM/LnNob3VsZFJldmFsaWRhdGVBZnRlciAhPT0gZmFsc2UpIHtcbiAgICAgICAgICBpZiAoZW52aXJvbm1lbnQubGF1bmNoVHlwZSA9PT0gTGF1bmNoVHlwZS5CYWNrZ3JvdW5kIHx8IGVudmlyb25tZW50LmNvbW1hbmRNb2RlID09PSBcIm1lbnUtYmFyXCIpIHtcbiAgICAgICAgICAgIC8vIHdoZW4gaW4gdGhlIGJhY2tncm91bmQgb3IgaW4gYSBtZW51IGJhciwgd2UgYXJlIGdvaW5nIHRvIGF3YWl0IHRoZSByZXZhbGlkYXRpb25cbiAgICAgICAgICAgIC8vIHRvIG1ha2Ugc3VyZSB3ZSBnZXQgdGhlIHJpZ2h0IGRhdGEgYXQgdGhlIGVuZCBvZiB0aGUgbXV0YXRpb25cbiAgICAgICAgICAgIGF3YWl0IHJldmFsaWRhdGUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV2YWxpZGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgW3JldmFsaWRhdGUsIGxhdGVzdFZhbHVlLCBzZXQsIGFib3J0XSxcbiAgKTtcblxuICBjb25zdCBvbkxvYWRNb3JlID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHBhZ2luYXRpb25BcmdzUmVmLmN1cnJlbnQucGFnZSArPSAxO1xuICAgIGNvbnN0IGFyZ3MgPSAobGF0ZXN0QXJncy5jdXJyZW50IHx8IFtdKSBhcyBQYXJhbWV0ZXJzPFQ+O1xuICAgIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICB9LCBbcGFnaW5hdGlvbkFyZ3NSZWYsIGxhdGVzdEFyZ3MsIGNhbGxiYWNrXSk7XG5cbiAgLy8gcmV2YWxpZGF0ZSB3aGVuIHRoZSBhcmdzIGNoYW5nZVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIHJlc2V0IHRoZSBwYWdpbmF0aW9uXG4gICAgcGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudCA9IHsgcGFnZTogMCB9O1xuXG4gICAgaWYgKG9wdGlvbnM/LmV4ZWN1dGUgIT09IGZhbHNlKSB7XG4gICAgICBjYWxsYmFjayguLi4oKGFyZ3MgfHwgW10pIGFzIFBhcmFtZXRlcnM8VD4pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY2FuY2VsIHRoZSBwcmV2aW91cyByZXF1ZXN0IGlmIHdlIGRvbid0IHdhbnQgdG8gZXhlY3V0ZSBhbnltb3JlXG4gICAgICBhYm9ydCgpO1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFt1c2VEZWVwTWVtbyhbYXJncywgb3B0aW9ucz8uZXhlY3V0ZSwgY2FsbGJhY2tdKSwgbGF0ZXN0QWJvcnRhYmxlLCBwYWdpbmF0aW9uQXJnc1JlZl0pO1xuXG4gIC8vIGFib3J0IHJlcXVlc3Qgd2hlbiB1bm1vdW50aW5nXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGFib3J0KCk7XG4gICAgfTtcbiAgfSwgW2Fib3J0XSk7XG5cbiAgLy8gd2Ugb25seSB3YW50IHRvIHNob3cgdGhlIGxvYWRpbmcgaW5kaWNhdG9yIGlmIHRoZSBwcm9taXNlIGlzIGV4ZWN1dGluZ1xuICBjb25zdCBpc0xvYWRpbmcgPSBvcHRpb25zPy5leGVjdXRlICE9PSBmYWxzZSA/IHN0YXRlLmlzTG9hZGluZyA6IGZhbHNlO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgbG9hZGluZyBpcyBoYXMgc29tZSBmaXhlZCB2YWx1ZSBpbiB0aGUgZW51bSB3aGljaFxuICBjb25zdCBzdGF0ZVdpdGhMb2FkaW5nRml4ZWQ6IEFzeW5jU3RhdGU8QXdhaXRlZDxSZXR1cm5UeXBlPFQ+Pj4gPSB7IC4uLnN0YXRlLCBpc0xvYWRpbmcgfTtcblxuICBjb25zdCBwYWdpbmF0aW9uID0gdXNlUGFnaW5hdGlvblJlZi5jdXJyZW50XG4gICAgPyB7XG4gICAgICAgIHBhZ2VTaXplOiBwYWdlU2l6ZVJlZi5jdXJyZW50LFxuICAgICAgICBoYXNNb3JlOiBoYXNNb3JlUmVmLmN1cnJlbnQsXG4gICAgICAgIG9uTG9hZE1vcmUsXG4gICAgICB9XG4gICAgOiB1bmRlZmluZWQ7XG5cbiAgcmV0dXJuIHsgLi4uc3RhdGVXaXRoTG9hZGluZ0ZpeGVkLCByZXZhbGlkYXRlLCBtdXRhdGUsIHBhZ2luYXRpb24gfTtcbn1cblxuLyoqIEJpbmQgdGhlIGZuIGlmIGl0J3MgYSBQcm9taXNlIG1ldGhvZCAqL1xuZnVuY3Rpb24gYmluZFByb21pc2VJZk5lZWRlZDxUPihmbjogVCk6IFQge1xuICBpZiAoZm4gPT09IChQcm9taXNlLmFsbCBhcyBhbnkpKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0aGlzIGlzIGZpbmVcbiAgICByZXR1cm4gZm4uYmluZChQcm9taXNlKTtcbiAgfVxuICBpZiAoZm4gPT09IChQcm9taXNlLnJhY2UgYXMgYW55KSkge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdGhpcyBpcyBmaW5lXG4gICAgcmV0dXJuIGZuLmJpbmQoUHJvbWlzZSk7XG4gIH1cbiAgaWYgKGZuID09PSAoUHJvbWlzZS5yZXNvbHZlIGFzIGFueSkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoaXMgaXMgZmluZVxuICAgIHJldHVybiBmbi5iaW5kKFByb21pc2UgYXMgYW55KTtcbiAgfVxuICBpZiAoZm4gPT09IChQcm9taXNlLnJlamVjdCBhcyBhbnkpKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0aGlzIGlzIGZpbmVcbiAgICByZXR1cm4gZm4uYmluZChQcm9taXNlKTtcbiAgfVxuICByZXR1cm4gZm47XG59XG4iLCAiaW1wb3J0IHsgdXNlUmVmLCB1c2VNZW1vIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBkZXF1YWwgfSBmcm9tIFwiZGVxdWFsL2xpdGVcIjtcblxuLyoqXG4gKiBAcGFyYW0gdmFsdWUgdGhlIHZhbHVlIHRvIGJlIG1lbW9pemVkICh1c3VhbGx5IGEgZGVwZW5kZW5jeSBsaXN0KVxuICogQHJldHVybnMgYSBtZW1vaXplZCB2ZXJzaW9uIG9mIHRoZSB2YWx1ZSBhcyBsb25nIGFzIGl0IHJlbWFpbnMgZGVlcGx5IGVxdWFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VEZWVwTWVtbzxUPih2YWx1ZTogVCkge1xuICBjb25zdCByZWYgPSB1c2VSZWY8VD4odmFsdWUpO1xuICBjb25zdCBzaWduYWxSZWYgPSB1c2VSZWY8bnVtYmVyPigwKTtcblxuICBpZiAoIWRlcXVhbCh2YWx1ZSwgcmVmLmN1cnJlbnQpKSB7XG4gICAgcmVmLmN1cnJlbnQgPSB2YWx1ZTtcbiAgICBzaWduYWxSZWYuY3VycmVudCArPSAxO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICByZXR1cm4gdXNlTWVtbygoKSA9PiByZWYuY3VycmVudCwgW3NpZ25hbFJlZi5jdXJyZW50XSk7XG59XG4iLCAiaW1wb3J0IHsgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbGF0ZXN0IHN0YXRlLlxuICpcbiAqIFRoaXMgaXMgbW9zdGx5IHVzZWZ1bCB0byBnZXQgYWNjZXNzIHRvIHRoZSBsYXRlc3QgdmFsdWUgb2Ygc29tZSBwcm9wcyBvciBzdGF0ZSBpbnNpZGUgYW4gYXN5bmNocm9ub3VzIGNhbGxiYWNrLCBpbnN0ZWFkIG9mIHRoYXQgdmFsdWUgYXQgdGhlIHRpbWUgdGhlIGNhbGxiYWNrIHdhcyBjcmVhdGVkIGZyb20uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VMYXRlc3Q8VD4odmFsdWU6IFQpOiB7IHJlYWRvbmx5IGN1cnJlbnQ6IFQgfSB7XG4gIGNvbnN0IHJlZiA9IHVzZVJlZih2YWx1ZSk7XG4gIHJlZi5jdXJyZW50ID0gdmFsdWU7XG4gIHJldHVybiByZWY7XG59XG4iLCAiaW1wb3J0ICogYXMgZnMgZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHsgQ2xpcGJvYXJkLCBlbnZpcm9ubWVudCwgb3BlbiwgVG9hc3QsIHNob3dUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcblxuLyoqXG4gKiBTaG93cyBhIGZhaWx1cmUgVG9hc3QgZm9yIGEgZ2l2ZW4gRXJyb3IuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IHNob3dIVUQgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG4gKiBpbXBvcnQgeyBydW5BcHBsZVNjcmlwdCwgc2hvd0ZhaWx1cmVUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAqICAgdHJ5IHtcbiAqICAgICBjb25zdCByZXMgPSBhd2FpdCBydW5BcHBsZVNjcmlwdChcbiAqICAgICAgIGBcbiAqICAgICAgIG9uIHJ1biBhcmd2XG4gKiAgICAgICAgIHJldHVybiBcImhlbGxvLCBcIiAmIGl0ZW0gMSBvZiBhcmd2ICYgXCIuXCJcbiAqICAgICAgIGVuZCBydW5cbiAqICAgICAgIGAsXG4gKiAgICAgICBbXCJ3b3JsZFwiXVxuICogICAgICk7XG4gKiAgICAgYXdhaXQgc2hvd0hVRChyZXMpO1xuICogICB9IGNhdGNoIChlcnJvcikge1xuICogICAgIHNob3dGYWlsdXJlVG9hc3QoZXJyb3IsIHsgdGl0bGU6IFwiQ291bGQgbm90IHJ1biBBcHBsZVNjcmlwdFwiIH0pO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dGYWlsdXJlVG9hc3QoXG4gIGVycm9yOiB1bmtub3duLFxuICBvcHRpb25zPzogUGFydGlhbDxQaWNrPFRvYXN0Lk9wdGlvbnMsIFwidGl0bGVcIiB8IFwicHJpbWFyeUFjdGlvblwiIHwgXCJtZXNzYWdlXCI+Pixcbikge1xuICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICByZXR1cm4gc2hvd1RvYXN0KHtcbiAgICBzdHlsZTogVG9hc3QuU3R5bGUuRmFpbHVyZSxcbiAgICB0aXRsZTogb3B0aW9ucz8udGl0bGUgPz8gXCJTb21ldGhpbmcgd2VudCB3cm9uZ1wiLFxuICAgIG1lc3NhZ2U6IG9wdGlvbnM/Lm1lc3NhZ2UgPz8gbWVzc2FnZSxcbiAgICBwcmltYXJ5QWN0aW9uOiBvcHRpb25zPy5wcmltYXJ5QWN0aW9uID8/IGhhbmRsZUVycm9yVG9hc3RBY3Rpb24oZXJyb3IpLFxuICAgIHNlY29uZGFyeUFjdGlvbjogb3B0aW9ucz8ucHJpbWFyeUFjdGlvbiA/IGhhbmRsZUVycm9yVG9hc3RBY3Rpb24oZXJyb3IpIDogdW5kZWZpbmVkLFxuICB9KTtcbn1cblxuY29uc3QgaGFuZGxlRXJyb3JUb2FzdEFjdGlvbiA9IChlcnJvcjogdW5rbm93bik6IFRvYXN0LkFjdGlvbk9wdGlvbnMgPT4ge1xuICBsZXQgcHJpdmF0ZUV4dGVuc2lvbiA9IHRydWU7XG4gIGxldCB0aXRsZSA9IFwiW0V4dGVuc2lvbiBOYW1lXS4uLlwiO1xuICBsZXQgZXh0ZW5zaW9uVVJMID0gXCJcIjtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYWNrYWdlSlNPTiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihlbnZpcm9ubWVudC5hc3NldHNQYXRoLCBcIi4uXCIsIFwicGFja2FnZS5qc29uXCIpLCBcInV0ZjhcIikpO1xuICAgIHRpdGxlID0gYFske3BhY2thZ2VKU09OLnRpdGxlfV0uLi5gO1xuICAgIGV4dGVuc2lvblVSTCA9IGBodHRwczovL3JheWNhc3QuY29tLyR7cGFja2FnZUpTT04ub3duZXIgfHwgcGFja2FnZUpTT04uYXV0aG9yfS8ke3BhY2thZ2VKU09OLm5hbWV9YDtcbiAgICBpZiAoIXBhY2thZ2VKU09OLm93bmVyIHx8IHBhY2thZ2VKU09OLmFjY2VzcyA9PT0gXCJwdWJsaWNcIikge1xuICAgICAgcHJpdmF0ZUV4dGVuc2lvbiA9IGZhbHNlO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gbm8tb3BcbiAgfVxuXG4gIC8vIGlmIGl0J3MgYSBwcml2YXRlIGV4dGVuc2lvbiwgd2UgY2FuJ3QgY29uc3RydWN0IHRoZSBVUkwgdG8gcmVwb3J0IHRoZSBlcnJvclxuICAvLyBzbyB3ZSBmYWxsYmFjayB0byBjb3B5aW5nIHRoZSBlcnJvciB0byB0aGUgY2xpcGJvYXJkXG4gIGNvbnN0IGZhbGxiYWNrID0gZW52aXJvbm1lbnQuaXNEZXZlbG9wbWVudCB8fCBwcml2YXRlRXh0ZW5zaW9uO1xuXG4gIGNvbnN0IHN0YWNrID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yPy5zdGFjayB8fCBlcnJvcj8ubWVzc2FnZSB8fCBcIlwiIDogU3RyaW5nKGVycm9yKTtcblxuICByZXR1cm4ge1xuICAgIHRpdGxlOiBmYWxsYmFjayA/IFwiQ29weSBMb2dzXCIgOiBcIlJlcG9ydCBFcnJvclwiLFxuICAgIG9uQWN0aW9uKHRvYXN0KSB7XG4gICAgICB0b2FzdC5oaWRlKCk7XG4gICAgICBpZiAoZmFsbGJhY2spIHtcbiAgICAgICAgQ2xpcGJvYXJkLmNvcHkoc3RhY2spO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3BlbihcbiAgICAgICAgICBgaHR0cHM6Ly9naXRodWIuY29tL3JheWNhc3QvZXh0ZW5zaW9ucy9pc3N1ZXMvbmV3PyZsYWJlbHM9ZXh0ZW5zaW9uJTJDYnVnJnRlbXBsYXRlPWV4dGVuc2lvbl9idWdfcmVwb3J0LnltbCZ0aXRsZT0ke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICl9JmV4dGVuc2lvbi11cmw9JHtlbmNvZGVVUkkoZXh0ZW5zaW9uVVJMKX0mZGVzY3JpcHRpb249JHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgICBgIyMjIyBFcnJvcjpcblxcYFxcYFxcYFxuJHtzdGFja31cblxcYFxcYFxcYFxuYCxcbiAgICAgICAgICApfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn07XG4iLCAiaW1wb3J0IHsgdXNlQ2FsbGJhY2ssIERpc3BhdGNoLCBTZXRTdGF0ZUFjdGlvbiwgdXNlU3luY0V4dGVybmFsU3RvcmUsIHVzZU1lbW8gfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IENhY2hlIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgdXNlTGF0ZXN0IH0gZnJvbSBcIi4vdXNlTGF0ZXN0XCI7XG5pbXBvcnQgeyByZXBsYWNlciwgcmV2aXZlciB9IGZyb20gXCIuL2hlbHBlcnNcIjtcblxuY29uc3Qgcm9vdENhY2hlID0gLyogI19fUFVSRV9fICovIFN5bWJvbChcImNhY2hlIHdpdGhvdXQgbmFtZXNwYWNlXCIpO1xuY29uc3QgY2FjaGVNYXAgPSAvKiAjX19QVVJFX18gKi8gbmV3IE1hcDxzdHJpbmcgfCBzeW1ib2wsIENhY2hlPigpO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdGF0ZWZ1bCB2YWx1ZSwgYW5kIGEgZnVuY3Rpb24gdG8gdXBkYXRlIGl0LiBUaGUgdmFsdWUgd2lsbCBiZSBrZXB0IGJldHdlZW4gY29tbWFuZCBydW5zLlxuICpcbiAqIEByZW1hcmsgVGhlIHZhbHVlIG5lZWRzIHRvIGJlIEpTT04gc2VyaWFsaXphYmxlLlxuICpcbiAqIEBwYXJhbSBrZXkgLSBUaGUgdW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIHN0YXRlLiBUaGlzIGNhbiBiZSB1c2VkIHRvIHNoYXJlIHRoZSBzdGF0ZSBhY3Jvc3MgY29tcG9uZW50cyBhbmQvb3IgY29tbWFuZHMuXG4gKiBAcGFyYW0gaW5pdGlhbFN0YXRlIC0gVGhlIGluaXRpYWwgdmFsdWUgb2YgdGhlIHN0YXRlIGlmIHRoZXJlIGFyZW4ndCBhbnkgaW4gdGhlIENhY2hlIHlldC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUNhY2hlZFN0YXRlPFQ+KFxuICBrZXk6IHN0cmluZyxcbiAgaW5pdGlhbFN0YXRlOiBULFxuICBjb25maWc/OiB7IGNhY2hlTmFtZXNwYWNlPzogc3RyaW5nIH0sXG4pOiBbVCwgRGlzcGF0Y2g8U2V0U3RhdGVBY3Rpb248VD4+XTtcbmV4cG9ydCBmdW5jdGlvbiB1c2VDYWNoZWRTdGF0ZTxUID0gdW5kZWZpbmVkPihrZXk6IHN0cmluZyk6IFtUIHwgdW5kZWZpbmVkLCBEaXNwYXRjaDxTZXRTdGF0ZUFjdGlvbjxUIHwgdW5kZWZpbmVkPj5dO1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUNhY2hlZFN0YXRlPFQ+KFxuICBrZXk6IHN0cmluZyxcbiAgaW5pdGlhbFN0YXRlPzogVCxcbiAgY29uZmlnPzogeyBjYWNoZU5hbWVzcGFjZT86IHN0cmluZyB9LFxuKTogW1QsIERpc3BhdGNoPFNldFN0YXRlQWN0aW9uPFQ+Pl0ge1xuICBjb25zdCBjYWNoZUtleSA9IGNvbmZpZz8uY2FjaGVOYW1lc3BhY2UgfHwgcm9vdENhY2hlO1xuICBjb25zdCBjYWNoZSA9XG4gICAgY2FjaGVNYXAuZ2V0KGNhY2hlS2V5KSB8fCBjYWNoZU1hcC5zZXQoY2FjaGVLZXksIG5ldyBDYWNoZSh7IG5hbWVzcGFjZTogY29uZmlnPy5jYWNoZU5hbWVzcGFjZSB9KSkuZ2V0KGNhY2hlS2V5KTtcblxuICBpZiAoIWNhY2hlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBjYWNoZVwiKTtcbiAgfVxuXG4gIGNvbnN0IGtleVJlZiA9IHVzZUxhdGVzdChrZXkpO1xuICBjb25zdCBpbml0aWFsVmFsdWVSZWYgPSB1c2VMYXRlc3QoaW5pdGlhbFN0YXRlKTtcblxuICBjb25zdCBjYWNoZWRTdGF0ZSA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKGNhY2hlLnN1YnNjcmliZSwgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gY2FjaGUuZ2V0KGtleVJlZi5jdXJyZW50KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCBnZXQgQ2FjaGUgZGF0YTpcIiwgZXJyb3IpO1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IHN0YXRlID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBjYWNoZWRTdGF0ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKGNhY2hlZFN0YXRlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShjYWNoZWRTdGF0ZSwgcmV2aXZlcik7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gdGhlIGRhdGEgZ290IGNvcnJ1cHRlZCBzb21laG93XG4gICAgICAgIGNvbnNvbGUud2FybihcIlRoZSBjYWNoZWQgZGF0YSBpcyBjb3JydXB0ZWRcIiwgZXJyKTtcbiAgICAgICAgcmV0dXJuIGluaXRpYWxWYWx1ZVJlZi5jdXJyZW50O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaW5pdGlhbFZhbHVlUmVmLmN1cnJlbnQ7XG4gICAgfVxuICB9LCBbY2FjaGVkU3RhdGUsIGluaXRpYWxWYWx1ZVJlZl0pO1xuXG4gIGNvbnN0IHN0YXRlUmVmID0gdXNlTGF0ZXN0KHN0YXRlKTtcblxuICBjb25zdCBzZXRTdGF0ZUFuZENhY2hlID0gdXNlQ2FsbGJhY2soXG4gICAgKHVwZGF0ZXI6IFNldFN0YXRlQWN0aW9uPFQ+KSA9PiB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRTIHN0cnVnZ2xlcyB0byBpbmZlciB0aGUgdHlwZXMgYXMgVCBjb3VsZCBwb3RlbnRpYWxseSBiZSBhIGZ1bmN0aW9uXG4gICAgICBjb25zdCBuZXdWYWx1ZSA9IHR5cGVvZiB1cGRhdGVyID09PSBcImZ1bmN0aW9uXCIgPyB1cGRhdGVyKHN0YXRlUmVmLmN1cnJlbnQpIDogdXBkYXRlcjtcbiAgICAgIGlmICh0eXBlb2YgbmV3VmFsdWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgY2FjaGUuc2V0KGtleVJlZi5jdXJyZW50LCBcInVuZGVmaW5lZFwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHN0cmluZ2lmaWVkVmFsdWUgPSBKU09OLnN0cmluZ2lmeShuZXdWYWx1ZSwgcmVwbGFjZXIpO1xuICAgICAgICBjYWNoZS5zZXQoa2V5UmVmLmN1cnJlbnQsIHN0cmluZ2lmaWVkVmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld1ZhbHVlO1xuICAgIH0sXG4gICAgW2NhY2hlLCBrZXlSZWYsIHN0YXRlUmVmXSxcbiAgKTtcblxuICByZXR1cm4gW3N0YXRlLCBzZXRTdGF0ZUFuZENhY2hlXTtcbn1cbiIsICJpbXBvcnQgY3J5cHRvIGZyb20gXCJub2RlOmNyeXB0b1wiO1xuaW1wb3J0IHsgdHlwZUhhc2hlciB9IGZyb20gXCIuL3ZlbmRvcnMvdHlwZS1oYXNoZXJcIjtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbmV4cG9ydCBmdW5jdGlvbiByZXBsYWNlcih0aGlzOiBhbnksIGtleTogc3RyaW5nLCBfdmFsdWU6IHVua25vd24pIHtcbiAgY29uc3QgdmFsdWUgPSB0aGlzW2tleV07XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICByZXR1cm4gYF9fcmF5Y2FzdF9jYWNoZWRfZGF0ZV9fJHt2YWx1ZS50b0lTT1N0cmluZygpfWA7XG4gIH1cbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWx1ZSkpIHtcbiAgICByZXR1cm4gYF9fcmF5Y2FzdF9jYWNoZWRfYnVmZmVyX18ke3ZhbHVlLnRvU3RyaW5nKFwiYmFzZTY0XCIpfWA7XG4gIH1cbiAgcmV0dXJuIF92YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldml2ZXIoX2tleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmIHZhbHVlLnN0YXJ0c1dpdGgoXCJfX3JheWNhc3RfY2FjaGVkX2RhdGVfX1wiKSkge1xuICAgIHJldHVybiBuZXcgRGF0ZSh2YWx1ZS5yZXBsYWNlKFwiX19yYXljYXN0X2NhY2hlZF9kYXRlX19cIiwgXCJcIikpO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgJiYgdmFsdWUuc3RhcnRzV2l0aChcIl9fcmF5Y2FzdF9jYWNoZWRfYnVmZmVyX19cIikpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWUucmVwbGFjZShcIl9fcmF5Y2FzdF9jYWNoZWRfYnVmZmVyX19cIiwgXCJcIiksIFwiYmFzZTY0XCIpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc2gob2JqZWN0OiBhbnkpIHtcbiAgY29uc3QgaGFzaGluZ1N0cmVhbSA9IGNyeXB0by5jcmVhdGVIYXNoKFwic2hhMVwiKTtcbiAgY29uc3QgaGFzaGVyID0gdHlwZUhhc2hlcihoYXNoaW5nU3RyZWFtKTtcbiAgaGFzaGVyLmRpc3BhdGNoKG9iamVjdCk7XG5cbiAgcmV0dXJuIGhhc2hpbmdTdHJlYW0uZGlnZXN0KFwiaGV4XCIpO1xufVxuIiwgIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudCAqL1xuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXMgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbmltcG9ydCBjcnlwdG8gZnJvbSBcIm5vZGU6Y3J5cHRvXCI7XG5cbi8qKiBDaGVjayBpZiB0aGUgZ2l2ZW4gZnVuY3Rpb24gaXMgYSBuYXRpdmUgZnVuY3Rpb24gKi9cbmZ1bmN0aW9uIGlzTmF0aXZlRnVuY3Rpb24oZjogYW55KSB7XG4gIGlmICh0eXBlb2YgZiAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IGV4cCA9IC9eZnVuY3Rpb25cXHMrXFx3KlxccypcXChcXHMqXFwpXFxzKntcXHMrXFxbbmF0aXZlIGNvZGVcXF1cXHMrfSQvaTtcbiAgcmV0dXJuIGV4cC5leGVjKEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGYpKSAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaGFzaFJlcGxhY2VyKHZhbHVlOiBhbnkpOiBzdHJpbmcge1xuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXMpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0eXBlSGFzaGVyKFxuICB3cml0ZVRvOlxuICAgIHwgY3J5cHRvLkhhc2hcbiAgICB8IHtcbiAgICAgICAgYnVmOiBzdHJpbmc7XG4gICAgICAgIHdyaXRlOiAoYjogYW55KSA9PiB2b2lkO1xuICAgICAgICBlbmQ6IChiOiBhbnkpID0+IHZvaWQ7XG4gICAgICAgIHJlYWQ6ICgpID0+IHN0cmluZztcbiAgICAgIH0sXG4gIGNvbnRleHQ6IGFueVtdID0gW10sXG4pIHtcbiAgZnVuY3Rpb24gd3JpdGUoc3RyOiBzdHJpbmcpIHtcbiAgICBpZiAoXCJ1cGRhdGVcIiBpbiB3cml0ZVRvKSB7XG4gICAgICByZXR1cm4gd3JpdGVUby51cGRhdGUoc3RyLCBcInV0ZjhcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB3cml0ZVRvLndyaXRlKHN0cik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBkaXNwYXRjaDogZnVuY3Rpb24gKHZhbHVlOiBhbnkpIHtcbiAgICAgIHZhbHVlID0gaGFzaFJlcGxhY2VyKHZhbHVlKTtcblxuICAgICAgY29uc3QgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzW1wiX251bGxcIl0oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpc1tcIl9cIiArIHR5cGVdKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIF9vYmplY3Q6IGZ1bmN0aW9uIChvYmplY3Q6IGFueSkge1xuICAgICAgY29uc3QgcGF0dGVybiA9IC9cXFtvYmplY3QgKC4qKVxcXS9pO1xuICAgICAgY29uc3Qgb2JqU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCk7XG4gICAgICBsZXQgb2JqVHlwZSA9IHBhdHRlcm4uZXhlYyhvYmpTdHJpbmcpPy5bMV0gPz8gXCJ1bmtub3duOltcIiArIG9ialN0cmluZyArIFwiXVwiO1xuICAgICAgb2JqVHlwZSA9IG9ialR5cGUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgbGV0IG9iamVjdE51bWJlciA9IG51bGwgYXMgYW55O1xuXG4gICAgICBpZiAoKG9iamVjdE51bWJlciA9IGNvbnRleHQuaW5kZXhPZihvYmplY3QpKSA+PSAwKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2goXCJbQ0lSQ1VMQVI6XCIgKyBvYmplY3ROdW1iZXIgKyBcIl1cIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRleHQucHVzaChvYmplY3QpO1xuICAgICAgfVxuXG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKG9iamVjdCkpIHtcbiAgICAgICAgd3JpdGUoXCJidWZmZXI6XCIpO1xuICAgICAgICByZXR1cm4gd3JpdGUob2JqZWN0LnRvU3RyaW5nKFwidXRmOFwiKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvYmpUeXBlICE9PSBcIm9iamVjdFwiICYmIG9ialR5cGUgIT09IFwiZnVuY3Rpb25cIiAmJiBvYmpUeXBlICE9PSBcImFzeW5jZnVuY3Rpb25cIikge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmICh0aGlzW1wiX1wiICsgb2JqVHlwZV0pIHtcbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgdGhpc1tcIl9cIiArIG9ialR5cGVdKG9iamVjdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIG9iamVjdCB0eXBlIFwiJyArIG9ialR5cGUgKyAnXCInKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpO1xuICAgICAgICBrZXlzID0ga2V5cy5zb3J0KCk7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0byBpbmNvcnBvcmF0ZSBzcGVjaWFsIHByb3BlcnRpZXMsIHNvXG4gICAgICAgIC8vIFR5cGVzIHdpdGggZGlmZmVyZW50IHByb3RvdHlwZXMgd2lsbCBwcm9kdWNlXG4gICAgICAgIC8vIGEgZGlmZmVyZW50IGhhc2ggYW5kIG9iamVjdHMgZGVyaXZlZCBmcm9tXG4gICAgICAgIC8vIGRpZmZlcmVudCBmdW5jdGlvbnMgKGBuZXcgRm9vYCwgYG5ldyBCYXJgKSB3aWxsXG4gICAgICAgIC8vIHByb2R1Y2UgZGlmZmVyZW50IGhhc2hlcy5cbiAgICAgICAgLy8gV2UgbmV2ZXIgZG8gdGhpcyBmb3IgbmF0aXZlIGZ1bmN0aW9ucyBzaW5jZSBzb21lXG4gICAgICAgIC8vIHNlZW0gdG8gYnJlYWsgYmVjYXVzZSBvZiB0aGF0LlxuICAgICAgICBpZiAoIWlzTmF0aXZlRnVuY3Rpb24ob2JqZWN0KSkge1xuICAgICAgICAgIGtleXMuc3BsaWNlKDAsIDAsIFwicHJvdG90eXBlXCIsIFwiX19wcm90b19fXCIsIFwiY29uc3RydWN0b3JcIik7XG4gICAgICAgIH1cblxuICAgICAgICB3cml0ZShcIm9iamVjdDpcIiArIGtleXMubGVuZ3RoICsgXCI6XCIpO1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgcmV0dXJuIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgc2VsZi5kaXNwYXRjaChrZXkpO1xuICAgICAgICAgIHdyaXRlKFwiOlwiKTtcbiAgICAgICAgICBzZWxmLmRpc3BhdGNoKG9iamVjdFtrZXldKTtcbiAgICAgICAgICB3cml0ZShcIixcIik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgX2FycmF5OiBmdW5jdGlvbiAoYXJyOiBhbnlbXSwgdW5vcmRlcmVkOiBib29sZWFuKSB7XG4gICAgICB1bm9yZGVyZWQgPSB0eXBlb2YgdW5vcmRlcmVkICE9PSBcInVuZGVmaW5lZFwiID8gdW5vcmRlcmVkIDogZmFsc2U7IC8vIGRlZmF1bHQgdG8gb3B0aW9ucy51bm9yZGVyZWRBcnJheXNcblxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICB3cml0ZShcImFycmF5OlwiICsgYXJyLmxlbmd0aCArIFwiOlwiKTtcbiAgICAgIGlmICghdW5vcmRlcmVkIHx8IGFyci5sZW5ndGggPD0gMSkge1xuICAgICAgICBhcnIuZm9yRWFjaChmdW5jdGlvbiAoZW50cnk6IGFueSkge1xuICAgICAgICAgIHNlbGYuZGlzcGF0Y2goZW50cnkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyB0aGUgdW5vcmRlcmVkIGNhc2UgaXMgYSBsaXR0bGUgbW9yZSBjb21wbGljYXRlZDpcbiAgICAgIC8vIHNpbmNlIHRoZXJlIGlzIG5vIGNhbm9uaWNhbCBvcmRlcmluZyBvbiBvYmplY3RzLFxuICAgICAgLy8gaS5lLiB7YToxfSA8IHthOjJ9IGFuZCB7YToxfSA+IHthOjJ9IGFyZSBib3RoIGZhbHNlLFxuICAgICAgLy8gd2UgZmlyc3Qgc2VyaWFsaXplIGVhY2ggZW50cnkgdXNpbmcgYSBQYXNzVGhyb3VnaCBzdHJlYW1cbiAgICAgIC8vIGJlZm9yZSBzb3J0aW5nLlxuICAgICAgLy8gYWxzbzogd2UgY2Fu4oCZdCB1c2UgdGhlIHNhbWUgY29udGV4dCBhcnJheSBmb3IgYWxsIGVudHJpZXNcbiAgICAgIC8vIHNpbmNlIHRoZSBvcmRlciBvZiBoYXNoaW5nIHNob3VsZCAqbm90KiBtYXR0ZXIuIGluc3RlYWQsXG4gICAgICAvLyB3ZSBrZWVwIHRyYWNrIG9mIHRoZSBhZGRpdGlvbnMgdG8gYSBjb3B5IG9mIHRoZSBjb250ZXh0IGFycmF5XG4gICAgICAvLyBhbmQgYWRkIGFsbCBvZiB0aGVtIHRvIHRoZSBnbG9iYWwgY29udGV4dCBhcnJheSB3aGVuIHdl4oCZcmUgZG9uZVxuICAgICAgbGV0IGNvbnRleHRBZGRpdGlvbnM6IGFueVtdID0gW107XG4gICAgICBjb25zdCBlbnRyaWVzID0gYXJyLm1hcChmdW5jdGlvbiAoZW50cnk6IGFueSkge1xuICAgICAgICBjb25zdCBzdHJtID0gUGFzc1Rocm91Z2goKTtcbiAgICAgICAgY29uc3QgbG9jYWxDb250ZXh0ID0gY29udGV4dC5zbGljZSgpOyAvLyBtYWtlIGNvcHlcbiAgICAgICAgY29uc3QgaGFzaGVyID0gdHlwZUhhc2hlcihzdHJtLCBsb2NhbENvbnRleHQpO1xuICAgICAgICBoYXNoZXIuZGlzcGF0Y2goZW50cnkpO1xuICAgICAgICAvLyB0YWtlIG9ubHkgd2hhdCB3YXMgYWRkZWQgdG8gbG9jYWxDb250ZXh0IGFuZCBhcHBlbmQgaXQgdG8gY29udGV4dEFkZGl0aW9uc1xuICAgICAgICBjb250ZXh0QWRkaXRpb25zID0gY29udGV4dEFkZGl0aW9ucy5jb25jYXQobG9jYWxDb250ZXh0LnNsaWNlKGNvbnRleHQubGVuZ3RoKSk7XG4gICAgICAgIHJldHVybiBzdHJtLnJlYWQoKS50b1N0cmluZygpO1xuICAgICAgfSk7XG4gICAgICBjb250ZXh0ID0gY29udGV4dC5jb25jYXQoY29udGV4dEFkZGl0aW9ucyk7XG4gICAgICBlbnRyaWVzLnNvcnQoKTtcbiAgICAgIHRoaXMuX2FycmF5KGVudHJpZXMsIGZhbHNlKTtcbiAgICB9LFxuICAgIF9kYXRlOiBmdW5jdGlvbiAoZGF0ZTogRGF0ZSkge1xuICAgICAgd3JpdGUoXCJkYXRlOlwiICsgZGF0ZS50b0pTT04oKSk7XG4gICAgfSxcbiAgICBfc3ltYm9sOiBmdW5jdGlvbiAoc3ltOiBzeW1ib2wpIHtcbiAgICAgIHdyaXRlKFwic3ltYm9sOlwiICsgc3ltLnRvU3RyaW5nKCkpO1xuICAgIH0sXG4gICAgX2Vycm9yOiBmdW5jdGlvbiAoZXJyOiBFcnJvcikge1xuICAgICAgd3JpdGUoXCJlcnJvcjpcIiArIGVyci50b1N0cmluZygpKTtcbiAgICB9LFxuICAgIF9ib29sZWFuOiBmdW5jdGlvbiAoYm9vbDogYm9vbGVhbikge1xuICAgICAgd3JpdGUoXCJib29sOlwiICsgYm9vbC50b1N0cmluZygpKTtcbiAgICB9LFxuICAgIF9zdHJpbmc6IGZ1bmN0aW9uIChzdHJpbmc6IHN0cmluZykge1xuICAgICAgd3JpdGUoXCJzdHJpbmc6XCIgKyBzdHJpbmcubGVuZ3RoICsgXCI6XCIpO1xuICAgICAgd3JpdGUoc3RyaW5nLnRvU3RyaW5nKCkpO1xuICAgIH0sXG4gICAgX2Z1bmN0aW9uOiBmdW5jdGlvbiAoZm46IGFueSkge1xuICAgICAgd3JpdGUoXCJmbjpcIik7XG4gICAgICBpZiAoaXNOYXRpdmVGdW5jdGlvbihmbikpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaChcIltuYXRpdmVdXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaChmbi50b1N0cmluZygpKTtcbiAgICAgIH1cblxuICAgICAgLy8gTWFrZSBzdXJlIHdlIGNhbiBzdGlsbCBkaXN0aW5ndWlzaCBuYXRpdmUgZnVuY3Rpb25zXG4gICAgICAvLyBieSB0aGVpciBuYW1lLCBvdGhlcndpc2UgU3RyaW5nIGFuZCBGdW5jdGlvbiB3aWxsXG4gICAgICAvLyBoYXZlIHRoZSBzYW1lIGhhc2hcbiAgICAgIHRoaXMuZGlzcGF0Y2goXCJmdW5jdGlvbi1uYW1lOlwiICsgU3RyaW5nKGZuLm5hbWUpKTtcblxuICAgICAgdGhpcy5fb2JqZWN0KGZuKTtcbiAgICB9LFxuICAgIF9udW1iZXI6IGZ1bmN0aW9uIChudW1iZXI6IG51bWJlcikge1xuICAgICAgd3JpdGUoXCJudW1iZXI6XCIgKyBudW1iZXIudG9TdHJpbmcoKSk7XG4gICAgfSxcbiAgICBfeG1sOiBmdW5jdGlvbiAoeG1sOiBhbnkpIHtcbiAgICAgIHdyaXRlKFwieG1sOlwiICsgeG1sLnRvU3RyaW5nKCkpO1xuICAgIH0sXG4gICAgX251bGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwiTnVsbFwiKTtcbiAgICB9LFxuICAgIF91bmRlZmluZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwiVW5kZWZpbmVkXCIpO1xuICAgIH0sXG4gICAgX3JlZ2V4cDogZnVuY3Rpb24gKHJlZ2V4OiBSZWdFeHApIHtcbiAgICAgIHdyaXRlKFwicmVnZXg6XCIgKyByZWdleC50b1N0cmluZygpKTtcbiAgICB9LFxuICAgIF91aW50OGFycmF5OiBmdW5jdGlvbiAoYXJyOiBVaW50OEFycmF5KSB7XG4gICAgICB3cml0ZShcInVpbnQ4YXJyYXk6XCIpO1xuICAgICAgdGhpcy5kaXNwYXRjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpKTtcbiAgICB9LFxuICAgIF91aW50OGNsYW1wZWRhcnJheTogZnVuY3Rpb24gKGFycjogVWludDhDbGFtcGVkQXJyYXkpIHtcbiAgICAgIHdyaXRlKFwidWludDhjbGFtcGVkYXJyYXk6XCIpO1xuICAgICAgdGhpcy5kaXNwYXRjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpKTtcbiAgICB9LFxuICAgIF9pbnQ4YXJyYXk6IGZ1bmN0aW9uIChhcnI6IEludDhBcnJheSkge1xuICAgICAgd3JpdGUoXCJpbnQ4YXJyYXk6XCIpO1xuICAgICAgdGhpcy5kaXNwYXRjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpKTtcbiAgICB9LFxuICAgIF91aW50MTZhcnJheTogZnVuY3Rpb24gKGFycjogVWludDE2QXJyYXkpIHtcbiAgICAgIHdyaXRlKFwidWludDE2YXJyYXk6XCIpO1xuICAgICAgdGhpcy5kaXNwYXRjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpKTtcbiAgICB9LFxuICAgIF9pbnQxNmFycmF5OiBmdW5jdGlvbiAoYXJyOiBJbnQxNkFycmF5KSB7XG4gICAgICB3cml0ZShcImludDE2YXJyYXk6XCIpO1xuICAgICAgdGhpcy5kaXNwYXRjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpKTtcbiAgICB9LFxuICAgIF91aW50MzJhcnJheTogZnVuY3Rpb24gKGFycjogVWludDMyQXJyYXkpIHtcbiAgICAgIHdyaXRlKFwidWludDMyYXJyYXk6XCIpO1xuICAgICAgdGhpcy5kaXNwYXRjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpKTtcbiAgICB9LFxuICAgIF9pbnQzMmFycmF5OiBmdW5jdGlvbiAoYXJyOiBJbnQzMkFycmF5KSB7XG4gICAgICB3cml0ZShcImludDMyYXJyYXk6XCIpO1xuICAgICAgdGhpcy5kaXNwYXRjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpKTtcbiAgICB9LFxuICAgIF9mbG9hdDMyYXJyYXk6IGZ1bmN0aW9uIChhcnI6IEZsb2F0MzJBcnJheSkge1xuICAgICAgd3JpdGUoXCJmbG9hdDMyYXJyYXk6XCIpO1xuICAgICAgdGhpcy5kaXNwYXRjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpKTtcbiAgICB9LFxuICAgIF9mbG9hdDY0YXJyYXk6IGZ1bmN0aW9uIChhcnI6IEZsb2F0NjRBcnJheSkge1xuICAgICAgd3JpdGUoXCJmbG9hdDY0YXJyYXk6XCIpO1xuICAgICAgdGhpcy5kaXNwYXRjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpKTtcbiAgICB9LFxuICAgIF9hcnJheWJ1ZmZlcjogZnVuY3Rpb24gKGFycjogQXJyYXlCdWZmZXIpIHtcbiAgICAgIHdyaXRlKFwiYXJyYXlidWZmZXI6XCIpO1xuICAgICAgdGhpcy5kaXNwYXRjaChuZXcgVWludDhBcnJheShhcnIpKTtcbiAgICB9LFxuICAgIF91cmw6IGZ1bmN0aW9uICh1cmw6IFVSTCkge1xuICAgICAgd3JpdGUoXCJ1cmw6XCIgKyB1cmwudG9TdHJpbmcoKSk7XG4gICAgfSxcbiAgICBfbWFwOiBmdW5jdGlvbiAobWFwOiBNYXA8YW55LCBhbnk+KSB7XG4gICAgICB3cml0ZShcIm1hcDpcIik7XG4gICAgICBjb25zdCBhcnIgPSBBcnJheS5mcm9tKG1hcCk7XG4gICAgICB0aGlzLl9hcnJheShhcnIsIHRydWUpO1xuICAgIH0sXG4gICAgX3NldDogZnVuY3Rpb24gKHNldDogU2V0PGFueT4pIHtcbiAgICAgIHdyaXRlKFwic2V0OlwiKTtcbiAgICAgIGNvbnN0IGFyciA9IEFycmF5LmZyb20oc2V0KTtcbiAgICAgIHRoaXMuX2FycmF5KGFyciwgdHJ1ZSk7XG4gICAgfSxcbiAgICBfZmlsZTogZnVuY3Rpb24gKGZpbGU6IGFueSkge1xuICAgICAgd3JpdGUoXCJmaWxlOlwiKTtcbiAgICAgIHRoaXMuZGlzcGF0Y2goW2ZpbGUubmFtZSwgZmlsZS5zaXplLCBmaWxlLnR5cGUsIGZpbGUubGFzdE1vZGlmaWVkXSk7XG4gICAgfSxcbiAgICBfYmxvYjogZnVuY3Rpb24gKCkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIFwiSGFzaGluZyBCbG9iIG9iamVjdHMgaXMgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWRcXG5cIiArXG4gICAgICAgICAgXCIoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9wdWxlb3Mvb2JqZWN0LWhhc2gvaXNzdWVzLzI2KVxcblwiICtcbiAgICAgICAgICAnVXNlIFwib3B0aW9ucy5yZXBsYWNlclwiIG9yIFwib3B0aW9ucy5pZ25vcmVVbmtub3duXCJcXG4nLFxuICAgICAgKTtcbiAgICB9LFxuICAgIF9kb213aW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwiZG9td2luZG93XCIpO1xuICAgIH0sXG4gICAgX2JpZ2ludDogZnVuY3Rpb24gKG51bWJlcjogYmlnaW50KSB7XG4gICAgICB3cml0ZShcImJpZ2ludDpcIiArIG51bWJlci50b1N0cmluZygpKTtcbiAgICB9LFxuICAgIC8qIE5vZGUuanMgc3RhbmRhcmQgbmF0aXZlIG9iamVjdHMgKi9cbiAgICBfcHJvY2VzczogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJwcm9jZXNzXCIpO1xuICAgIH0sXG4gICAgX3RpbWVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcInRpbWVyXCIpO1xuICAgIH0sXG4gICAgX3BpcGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwicGlwZVwiKTtcbiAgICB9LFxuICAgIF90Y3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwidGNwXCIpO1xuICAgIH0sXG4gICAgX3VkcDogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJ1ZHBcIik7XG4gICAgfSxcbiAgICBfdHR5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcInR0eVwiKTtcbiAgICB9LFxuICAgIF9zdGF0d2F0Y2hlcjogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJzdGF0d2F0Y2hlclwiKTtcbiAgICB9LFxuICAgIF9zZWN1cmVjb250ZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcInNlY3VyZWNvbnRleHRcIik7XG4gICAgfSxcbiAgICBfY29ubmVjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJjb25uZWN0aW9uXCIpO1xuICAgIH0sXG4gICAgX3psaWI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwiemxpYlwiKTtcbiAgICB9LFxuICAgIF9jb250ZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcImNvbnRleHRcIik7XG4gICAgfSxcbiAgICBfbm9kZXNjcmlwdDogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJub2Rlc2NyaXB0XCIpO1xuICAgIH0sXG4gICAgX2h0dHBwYXJzZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwiaHR0cHBhcnNlclwiKTtcbiAgICB9LFxuICAgIF9kYXRhdmlldzogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJkYXRhdmlld1wiKTtcbiAgICB9LFxuICAgIF9zaWduYWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwic2lnbmFsXCIpO1xuICAgIH0sXG4gICAgX2ZzZXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwiZnNldmVudFwiKTtcbiAgICB9LFxuICAgIF90bHN3cmFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcInRsc3dyYXBcIik7XG4gICAgfSxcbiAgfTtcbn1cblxuLy8gTWluaS1pbXBsZW1lbnRhdGlvbiBvZiBzdHJlYW0uUGFzc1Rocm91Z2hcbi8vIFdlIGFyZSBmYXIgZnJvbSBoYXZpbmcgbmVlZCBmb3IgdGhlIGZ1bGwgaW1wbGVtZW50YXRpb24sIGFuZCB3ZSBjYW5cbi8vIG1ha2UgYXNzdW1wdGlvbnMgbGlrZSBcIm1hbnkgd3JpdGVzLCB0aGVuIG9ubHkgb25lIGZpbmFsIHJlYWRcIlxuLy8gYW5kIHdlIGNhbiBpZ25vcmUgZW5jb2Rpbmcgc3BlY2lmaWNzXG5mdW5jdGlvbiBQYXNzVGhyb3VnaCgpIHtcbiAgcmV0dXJuIHtcbiAgICBidWY6IFwiXCIsXG5cbiAgICB3cml0ZTogZnVuY3Rpb24gKGI6IHN0cmluZykge1xuICAgICAgdGhpcy5idWYgKz0gYjtcbiAgICB9LFxuXG4gICAgZW5kOiBmdW5jdGlvbiAoYjogc3RyaW5nKSB7XG4gICAgICB0aGlzLmJ1ZiArPSBiO1xuICAgIH0sXG5cbiAgICByZWFkOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5idWY7XG4gICAgfSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlQ2FsbGJhY2sgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7XG4gIEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZSxcbiAgVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGUsXG4gIE11dGF0ZVByb21pc2UsXG4gIEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZSxcbiAgVW53cmFwUmV0dXJuLFxuICBQYWdpbmF0aW9uT3B0aW9ucyxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IHVzZUNhY2hlZFN0YXRlIH0gZnJvbSBcIi4vdXNlQ2FjaGVkU3RhdGVcIjtcbmltcG9ydCB7IHVzZVByb21pc2UsIFByb21pc2VPcHRpb25zIH0gZnJvbSBcIi4vdXNlUHJvbWlzZVwiO1xuaW1wb3J0IHsgdXNlTGF0ZXN0IH0gZnJvbSBcIi4vdXNlTGF0ZXN0XCI7XG5pbXBvcnQgeyBoYXNoIH0gZnJvbSBcIi4vaGVscGVyc1wiO1xuXG4vLyBTeW1ib2wgdG8gZGlmZmVyZW50aWF0ZSBhbiBlbXB0eSBjYWNoZSBmcm9tIGB1bmRlZmluZWRgXG5jb25zdCBlbXB0eUNhY2hlID0gLyogI19fUFVSRV9fICovIFN5bWJvbCgpO1xuXG5leHBvcnQgdHlwZSBDYWNoZWRQcm9taXNlT3B0aW9uczxcbiAgVCBleHRlbmRzIEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZSB8IEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZSxcbiAgVSxcbj4gPSBQcm9taXNlT3B0aW9uczxUPiAmIHtcbiAgLyoqXG4gICAqIFRoZSBpbml0aWFsIGRhdGEgaWYgdGhlcmUgYXJlbid0IGFueSBpbiB0aGUgQ2FjaGUgeWV0LlxuICAgKi9cbiAgaW5pdGlhbERhdGE/OiBVO1xuICAvKipcbiAgICogVGVsbHMgdGhlIGhvb2sgdG8ga2VlcCB0aGUgcHJldmlvdXMgcmVzdWx0cyBpbnN0ZWFkIG9mIHJldHVybmluZyB0aGUgaW5pdGlhbCB2YWx1ZVxuICAgKiBpZiB0aGVyZSBhcmVuJ3QgYW55IGluIHRoZSBjYWNoZSBmb3IgdGhlIG5ldyBhcmd1bWVudHMuXG4gICAqIFRoaXMgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCB3aGVuIHVzZWQgZm9yIGRhdGEgZm9yIGEgTGlzdCB0byBhdm9pZCBmbGlja2VyaW5nLlxuICAgKi9cbiAga2VlcFByZXZpb3VzRGF0YT86IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIFdyYXBzIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvbiBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgaW4gYW5vdGhlciBmdW5jdGlvbiwgYW5kIHJldHVybnMgdGhlIHtAbGluayBBc3luY1N0YXRlfSBjb3JyZXNwb25kaW5nIHRvIHRoZSBleGVjdXRpb24gb2YgdGhlIGZ1bmN0aW9uLiBUaGUgbGFzdCB2YWx1ZSB3aWxsIGJlIGtlcHQgYmV0d2VlbiBjb21tYW5kIHJ1bnMuXG4gKlxuICogQHJlbWFyayBUaGlzIG92ZXJsb2FkIHNob3VsZCBiZSB1c2VkIHdoZW4gd29ya2luZyB3aXRoIHBhZ2luYXRlZCBkYXRhIHNvdXJjZXMuXG4gKiBAcmVtYXJrIFdoZW4gcGFnaW5hdGluZywgb25seSB0aGUgZmlyc3QgcGFnZSB3aWxsIGJlIGNhY2hlZC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyBzZXRUaW1lb3V0IH0gZnJvbSBcIm5vZGU6dGltZXJzL3Byb21pc2VzXCI7XG4gKiBpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuICogaW1wb3J0IHsgTGlzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZUNhY2hlZFByb21pc2UgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKCkge1xuICogICBjb25zdCBbc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAqXG4gKiAgIGNvbnN0IHsgaXNMb2FkaW5nLCBkYXRhLCBwYWdpbmF0aW9uIH0gPSB1c2VDYWNoZWRQcm9taXNlKFxuICogICAgIChzZWFyY2hUZXh0OiBzdHJpbmcpID0+IGFzeW5jIChvcHRpb25zOiB7IHBhZ2U6IG51bWJlciB9KSA9PiB7XG4gKiAgICAgICBhd2FpdCBzZXRUaW1lb3V0KDIwMCk7XG4gKiAgICAgICBjb25zdCBuZXdEYXRhID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogMjUgfSwgKF92LCBpbmRleCkgPT4gKHtcbiAqICAgICAgICAgaW5kZXgsXG4gKiAgICAgICAgIHBhZ2U6IG9wdGlvbnMucGFnZSxcbiAqICAgICAgICAgdGV4dDogc2VhcmNoVGV4dCxcbiAqICAgICAgIH0pKTtcbiAqICAgICAgIHJldHVybiB7IGRhdGE6IG5ld0RhdGEsIGhhc01vcmU6IG9wdGlvbnMucGFnZSA8IDEwIH07XG4gKiAgICAgfSxcbiAqICAgICBbc2VhcmNoVGV4dF0sXG4gKiAgICk7XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxMaXN0IGlzTG9hZGluZz17aXNMb2FkaW5nfSBvblNlYXJjaFRleHRDaGFuZ2U9e3NldFNlYXJjaFRleHR9IHBhZ2luYXRpb249e3BhZ2luYXRpb259PlxuICogICAgICAge2RhdGE/Lm1hcCgoaXRlbSkgPT4gKFxuICogICAgICAgICA8TGlzdC5JdGVtXG4gKiAgICAgICAgICAga2V5PXtgJHtpdGVtLnBhZ2V9ICR7aXRlbS5pbmRleH0gJHtpdGVtLnRleHR9YH1cbiAqICAgICAgICAgICB0aXRsZT17YFBhZ2UgJHtpdGVtLnBhZ2V9IEl0ZW0gJHtpdGVtLmluZGV4fWB9XG4gKiAgICAgICAgICAgc3VidGl0bGU9e2l0ZW0udGV4dH1cbiAqICAgICAgICAgLz5cbiAqICAgICAgICkpfVxuICogICAgIDwvTGlzdD5cbiAqICAgKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQ2FjaGVkUHJvbWlzZTxUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlPFtdPj4oXG4gIGZuOiBULFxuKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VW53cmFwUmV0dXJuPFQ+LCB1bmRlZmluZWQ+O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUNhY2hlZFByb21pc2U8VCBleHRlbmRzIEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZSwgVSBleHRlbmRzIGFueVtdID0gYW55W10+KFxuICBmbjogVCxcbiAgYXJnczogUGFyYW1ldGVyczxUPixcbiAgb3B0aW9ucz86IENhY2hlZFByb21pc2VPcHRpb25zPFQsIFU+LFxuKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VW53cmFwUmV0dXJuPFQ+LCBVPjtcblxuLyoqXG4gKiBXcmFwcyBhbiBhc3luY2hyb25vdXMgZnVuY3Rpb24gb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBQcm9taXNlIGFuZCByZXR1cm5zIHRoZSB7QGxpbmsgQXN5bmNTdGF0ZX0gY29ycmVzcG9uZGluZyB0byB0aGUgZXhlY3V0aW9uIG9mIHRoZSBmdW5jdGlvbi4gVGhlIGxhc3QgdmFsdWUgd2lsbCBiZSBrZXB0IGJldHdlZW4gY29tbWFuZCBydW5zLlxuICpcbiAqIEByZW1hcmsgVGhlIHZhbHVlIG5lZWRzIHRvIGJlIEpTT04gc2VyaWFsaXphYmxlLlxuICogQHJlbWFyayBUaGUgZnVuY3Rpb24gaXMgYXNzdW1lZCB0byBiZSBjb25zdGFudCAoZWcuIGNoYW5naW5nIGl0IHdvbid0IHRyaWdnZXIgYSByZXZhbGlkYXRpb24pLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBcbiAqIGltcG9ydCB7IHVzZUNhY2hlZFByb21pc2UgfSBmcm9tICdAcmF5Y2FzdC91dGlscyc7XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ29tbWFuZCgpIHtcbiAqICAgY29uc3QgYWJvcnRhYmxlID0gdXNlUmVmPEFib3J0Q29udHJvbGxlcj4oKTtcbiAqICAgY29uc3QgeyBpc0xvYWRpbmcsIGRhdGEsIHJldmFsaWRhdGUgfSA9IHVzZUNhY2hlZFByb21pc2UoYXN5bmMgKHVybDogc3RyaW5nKSA9PiB7XG4gKiAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHsgc2lnbmFsOiBhYm9ydGFibGUuY3VycmVudD8uc2lnbmFsIH0pO1xuICogICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAqICAgICByZXR1cm4gcmVzdWx0XG4gKiAgIH0sXG4gKiAgIFsnaHR0cHM6Ly9hcGkuZXhhbXBsZSddLFxuICogICB7XG4gKiAgICAgYWJvcnRhYmxlXG4gKiAgIH0pO1xuICpcbiAqICAgcmV0dXJuIChcbiAqICAgICA8RGV0YWlsXG4gKiAgICAgICBpc0xvYWRpbmc9e2lzTG9hZGluZ31cbiAqICAgICAgIG1hcmtkb3duPXtkYXRhfVxuICogICAgICAgYWN0aW9ucz17XG4gKiAgICAgICAgIDxBY3Rpb25QYW5lbD5cbiAqICAgICAgICAgICA8QWN0aW9uIHRpdGxlPVwiUmVsb2FkXCIgb25BY3Rpb249eygpID0+IHJldmFsaWRhdGUoKX0gLz5cbiAqICAgICAgICAgPC9BY3Rpb25QYW5lbD5cbiAqICAgICAgIH1cbiAqICAgICAvPlxuICogICApO1xuICogfTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQ2FjaGVkUHJvbWlzZTxUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlPFtdPj4oXG4gIGZuOiBULFxuKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VW53cmFwUmV0dXJuPFQ+LCB1bmRlZmluZWQ+O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUNhY2hlZFByb21pc2U8VCBleHRlbmRzIEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZSwgVSA9IHVuZGVmaW5lZD4oXG4gIGZuOiBULFxuICBhcmdzOiBQYXJhbWV0ZXJzPFQ+LFxuICBvcHRpb25zPzogQ2FjaGVkUHJvbWlzZU9wdGlvbnM8VCwgVT4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxVbndyYXBSZXR1cm48VD4sIFU+O1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlQ2FjaGVkUHJvbWlzZTxcbiAgVCBleHRlbmRzIEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZSB8IEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZSxcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgVSBleHRlbmRzIGFueVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkLFxuPihmbjogVCwgYXJncz86IFBhcmFtZXRlcnM8VD4sIG9wdGlvbnM/OiBDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPikge1xuICAvKipcbiAgICogVGhlIGhvb2sgZ2VuZXJhdGVzIGEgY2FjaGUga2V5IGZyb20gdGhlIHByb21pc2UgaXQgcmVjZWl2ZXMgJiBpdHMgYXJndW1lbnRzLlxuICAgKiBTb21ldGltZXMgdGhhdCdzIG5vdCBlbm91Z2ggdG8gZ3VhcmFudGVlIHVuaXF1ZW5lc3MsIHNvIGhvb2tzIHRoYXQgYnVpbGQgb24gdG9wIG9mIGB1c2VDYWNoZWRQcm9taXNlYCBjYW5cbiAgICogdXNlIGFuIGBpbnRlcm5hbF9jYWNoZUtleVN1ZmZpeGAgdG8gaGVscCBpdC5cbiAgICpcbiAgICogQHJlbWFyayBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXG4gICAqL1xuICBjb25zdCB7XG4gICAgaW5pdGlhbERhdGEsXG4gICAga2VlcFByZXZpb3VzRGF0YSxcbiAgICBpbnRlcm5hbF9jYWNoZUtleVN1ZmZpeCxcbiAgICAuLi51c2VQcm9taXNlT3B0aW9uc1xuICB9OiBDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPiAmIHsgaW50ZXJuYWxfY2FjaGVLZXlTdWZmaXg/OiBzdHJpbmcgfSA9IG9wdGlvbnMgfHwge307XG4gIGNvbnN0IGxhc3RVcGRhdGVGcm9tID0gdXNlUmVmPFwiY2FjaGVcIiB8IFwicHJvbWlzZVwiPihudWxsKTtcblxuICBjb25zdCBbY2FjaGVkRGF0YSwgbXV0YXRlQ2FjaGVdID0gdXNlQ2FjaGVkU3RhdGU8dHlwZW9mIGVtcHR5Q2FjaGUgfCAoVW53cmFwUmV0dXJuPFQ+IHwgVSk+KFxuICAgIGhhc2goYXJncyB8fCBbXSkgKyBpbnRlcm5hbF9jYWNoZUtleVN1ZmZpeCxcbiAgICBlbXB0eUNhY2hlLFxuICAgIHtcbiAgICAgIGNhY2hlTmFtZXNwYWNlOiBoYXNoKGZuKSxcbiAgICB9LFxuICApO1xuXG4gIC8vIFVzZSBhIHJlZiB0byBzdG9yZSBwcmV2aW91cyByZXR1cm5lZCBkYXRhLiBVc2UgdGhlIGluaXRhbCBkYXRhIGFzIGl0cyBpbml0YWwgdmFsdWUgZnJvbSB0aGUgY2FjaGUuXG4gIGNvbnN0IGxhZ2d5RGF0YVJlZiA9IHVzZVJlZjxBd2FpdGVkPFJldHVyblR5cGU8VD4+IHwgVT4oY2FjaGVkRGF0YSAhPT0gZW1wdHlDYWNoZSA/IGNhY2hlZERhdGEgOiAoaW5pdGlhbERhdGEgYXMgVSkpO1xuICBjb25zdCBwYWdpbmF0aW9uQXJnc1JlZiA9IHVzZVJlZjxQYWdpbmF0aW9uT3B0aW9uczxVbndyYXBSZXR1cm48VD4gfCBVPiB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKTtcblxuICBjb25zdCB7XG4gICAgbXV0YXRlOiBfbXV0YXRlLFxuICAgIHJldmFsaWRhdGUsXG4gICAgLi4uc3RhdGVcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGZuIGhhcyB0aGUgc2FtZSBzaWduYXR1cmUgaW4gYm90aCB1c2VQcm9taXNlIGFuZCB1c2VDYWNoZWRQcm9taXNlXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgfSA9IHVzZVByb21pc2UoZm4sIGFyZ3MgfHwgKFtdIGFzIGFueSBhcyBQYXJhbWV0ZXJzPFQ+KSwge1xuICAgIC4uLnVzZVByb21pc2VPcHRpb25zLFxuICAgIG9uRGF0YShkYXRhLCBwYWdpbmF0aW9uKSB7XG4gICAgICBwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50ID0gcGFnaW5hdGlvbjtcbiAgICAgIGlmICh1c2VQcm9taXNlT3B0aW9ucy5vbkRhdGEpIHtcbiAgICAgICAgdXNlUHJvbWlzZU9wdGlvbnMub25EYXRhKGRhdGEsIHBhZ2luYXRpb24pO1xuICAgICAgfVxuICAgICAgaWYgKHBhZ2luYXRpb24gJiYgcGFnaW5hdGlvbi5wYWdlID4gMCkge1xuICAgICAgICAvLyBkb24ndCBjYWNoZSBiZXlvbmQgdGhlIGZpcnN0IHBhZ2VcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbGFzdFVwZGF0ZUZyb20uY3VycmVudCA9IFwicHJvbWlzZVwiO1xuICAgICAgbGFnZ3lEYXRhUmVmLmN1cnJlbnQgPSBkYXRhO1xuICAgICAgbXV0YXRlQ2FjaGUoZGF0YSk7XG4gICAgfSxcbiAgfSk7XG5cbiAgbGV0IHJldHVybmVkRGF0YTogVSB8IEF3YWl0ZWQ8UmV0dXJuVHlwZTxUPj4gfCBVbndyYXBSZXR1cm48VD47XG4gIGNvbnN0IHBhZ2luYXRpb24gPSBzdGF0ZS5wYWdpbmF0aW9uO1xuICAvLyB3aGVuIHBhZ2luYXRpbmcsIG9ubHkgdGhlIGZpcnN0IHBhZ2UgZ2V0cyBjYWNoZWQsIHNvIHdlIHJldHVybiB0aGUgZGF0YSB3ZSBnZXQgZnJvbSBgdXNlUHJvbWlzZWAsIGJlY2F1c2VcbiAgLy8gaXQgd2lsbCBiZSBhY2N1bXVsYXRlZC5cbiAgaWYgKHBhZ2luYXRpb25BcmdzUmVmLmN1cnJlbnQgJiYgcGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudC5wYWdlID4gMCAmJiBzdGF0ZS5kYXRhKSB7XG4gICAgcmV0dXJuZWREYXRhID0gc3RhdGUuZGF0YSBhcyBVbndyYXBSZXR1cm48VD47XG4gICAgLy8gaWYgdGhlIGxhdGVzdCB1cGRhdGUgaWYgZnJvbSB0aGUgUHJvbWlzZSwgd2Uga2VlcCBpdFxuICB9IGVsc2UgaWYgKGxhc3RVcGRhdGVGcm9tLmN1cnJlbnQgPT09IFwicHJvbWlzZVwiKSB7XG4gICAgcmV0dXJuZWREYXRhID0gbGFnZ3lEYXRhUmVmLmN1cnJlbnQ7XG4gIH0gZWxzZSBpZiAoa2VlcFByZXZpb3VzRGF0YSAmJiBjYWNoZWREYXRhICE9PSBlbXB0eUNhY2hlKSB7XG4gICAgLy8gaWYgd2Ugd2FudCB0byBrZWVwIHRoZSBsYXRlc3QgZGF0YSwgd2UgcGljayB0aGUgY2FjaGUgYnV0IG9ubHkgaWYgaXQncyBub3QgZW1wdHlcbiAgICByZXR1cm5lZERhdGEgPSBjYWNoZWREYXRhO1xuICAgIGlmIChwYWdpbmF0aW9uKSB7XG4gICAgICBwYWdpbmF0aW9uLmhhc01vcmUgPSB0cnVlO1xuICAgICAgcGFnaW5hdGlvbi5wYWdlU2l6ZSA9IGNhY2hlZERhdGEubGVuZ3RoO1xuICAgIH1cbiAgfSBlbHNlIGlmIChrZWVwUHJldmlvdXNEYXRhICYmIGNhY2hlZERhdGEgPT09IGVtcHR5Q2FjaGUpIHtcbiAgICAvLyBpZiB0aGUgY2FjaGUgaXMgZW1wdHksIHdlIHdpbGwgcmV0dXJuIHRoZSBwcmV2aW91cyBkYXRhXG4gICAgcmV0dXJuZWREYXRhID0gbGFnZ3lEYXRhUmVmLmN1cnJlbnQ7XG4gICAgLy8gdGhlcmUgYXJlIG5vIHNwZWNpYWwgY2FzZXMsIHNvIGVpdGhlciByZXR1cm4gdGhlIGNhY2hlIG9yIGluaXRpYWwgZGF0YVxuICB9IGVsc2UgaWYgKGNhY2hlZERhdGEgIT09IGVtcHR5Q2FjaGUpIHtcbiAgICByZXR1cm5lZERhdGEgPSBjYWNoZWREYXRhO1xuICAgIGlmIChwYWdpbmF0aW9uKSB7XG4gICAgICBwYWdpbmF0aW9uLmhhc01vcmUgPSB0cnVlO1xuICAgICAgcGFnaW5hdGlvbi5wYWdlU2l6ZSA9IGNhY2hlZERhdGEubGVuZ3RoO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm5lZERhdGEgPSBpbml0aWFsRGF0YSBhcyBVO1xuICB9XG5cbiAgY29uc3QgbGF0ZXN0RGF0YSA9IHVzZUxhdGVzdChyZXR1cm5lZERhdGEpO1xuXG4gIC8vIHdlIHJld3JpdGUgdGhlIG11dGF0ZSBmdW5jdGlvbiB0byB1cGRhdGUgdGhlIGNhY2hlIGluc3RlYWRcbiAgY29uc3QgbXV0YXRlID0gdXNlQ2FsbGJhY2s8TXV0YXRlUHJvbWlzZTxBd2FpdGVkPFJldHVyblR5cGU8VD4+IHwgVT4+KFxuICAgIGFzeW5jIChhc3luY1VwZGF0ZSwgb3B0aW9ucykgPT4ge1xuICAgICAgbGV0IGRhdGFCZWZvcmVPcHRpbWlzdGljVXBkYXRlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKG9wdGlvbnM/Lm9wdGltaXN0aWNVcGRhdGUpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnM/LnJvbGxiYWNrT25FcnJvciAhPT0gXCJmdW5jdGlvblwiICYmIG9wdGlvbnM/LnJvbGxiYWNrT25FcnJvciAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIGRhdGEgYmVmb3JlIHRoZSBvcHRpbWlzdGljIHVwZGF0ZSxcbiAgICAgICAgICAgIC8vIGJ1dCBvbmx5IGlmIHdlIG5lZWQgaXQgKGVnLiBvbmx5IHdoZW4gd2Ugd2FudCB0byBhdXRvbWF0aWNhbGx5IHJvbGxiYWNrIGFmdGVyKVxuICAgICAgICAgICAgZGF0YUJlZm9yZU9wdGltaXN0aWNVcGRhdGUgPSBzdHJ1Y3R1cmVkQ2xvbmUobGF0ZXN0RGF0YS5jdXJyZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZGF0YSA9IG9wdGlvbnMub3B0aW1pc3RpY1VwZGF0ZShsYXRlc3REYXRhLmN1cnJlbnQpO1xuICAgICAgICAgIGxhc3RVcGRhdGVGcm9tLmN1cnJlbnQgPSBcImNhY2hlXCI7XG4gICAgICAgICAgbGFnZ3lEYXRhUmVmLmN1cnJlbnQgPSBkYXRhO1xuICAgICAgICAgIG11dGF0ZUNhY2hlKGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhd2FpdCBfbXV0YXRlKGFzeW5jVXBkYXRlLCB7IHNob3VsZFJldmFsaWRhdGVBZnRlcjogb3B0aW9ucz8uc2hvdWxkUmV2YWxpZGF0ZUFmdGVyIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBjb25zdCBkYXRhID0gb3B0aW9ucy5yb2xsYmFja09uRXJyb3IobGF0ZXN0RGF0YS5jdXJyZW50KTtcbiAgICAgICAgICBsYXN0VXBkYXRlRnJvbS5jdXJyZW50ID0gXCJjYWNoZVwiO1xuICAgICAgICAgIGxhZ2d5RGF0YVJlZi5jdXJyZW50ID0gZGF0YTtcbiAgICAgICAgICBtdXRhdGVDYWNoZShkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zPy5vcHRpbWlzdGljVXBkYXRlICYmIG9wdGlvbnM/LnJvbGxiYWNrT25FcnJvciAhPT0gZmFsc2UpIHtcbiAgICAgICAgICBsYXN0VXBkYXRlRnJvbS5jdXJyZW50ID0gXCJjYWNoZVwiO1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igd2hlbiB1bmRlZmluZWQsIGl0J3MgZXhwZWN0ZWRcbiAgICAgICAgICBsYWdneURhdGFSZWYuY3VycmVudCA9IGRhdGFCZWZvcmVPcHRpbWlzdGljVXBkYXRlO1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igd2hlbiB1bmRlZmluZWQsIGl0J3MgZXhwZWN0ZWRcbiAgICAgICAgICBtdXRhdGVDYWNoZShkYXRhQmVmb3JlT3B0aW1pc3RpY1VwZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH0sXG4gICAgW211dGF0ZUNhY2hlLCBfbXV0YXRlLCBsYXRlc3REYXRhLCBsYWdneURhdGFSZWYsIGxhc3RVcGRhdGVGcm9tXSxcbiAgKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChjYWNoZWREYXRhICE9PSBlbXB0eUNhY2hlKSB7XG4gICAgICBsYXN0VXBkYXRlRnJvbS5jdXJyZW50ID0gXCJjYWNoZVwiO1xuICAgICAgbGFnZ3lEYXRhUmVmLmN1cnJlbnQgPSBjYWNoZWREYXRhO1xuICAgIH1cbiAgfSwgW2NhY2hlZERhdGFdKTtcblxuICByZXR1cm4ge1xuICAgIGRhdGE6IHJldHVybmVkRGF0YSxcbiAgICBpc0xvYWRpbmc6IHN0YXRlLmlzTG9hZGluZyxcbiAgICBlcnJvcjogc3RhdGUuZXJyb3IsXG4gICAgbXV0YXRlOiBwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50ICYmIHBhZ2luYXRpb25BcmdzUmVmLmN1cnJlbnQucGFnZSA+IDAgPyBfbXV0YXRlIDogbXV0YXRlLFxuICAgIHBhZ2luYXRpb24sXG4gICAgcmV2YWxpZGF0ZSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyB1c2VDYWxsYmFjaywgdXNlTWVtbywgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VDYWNoZWRQcm9taXNlLCBDYWNoZWRQcm9taXNlT3B0aW9ucyB9IGZyb20gXCIuL3VzZUNhY2hlZFByb21pc2VcIjtcbmltcG9ydCB7IHVzZUxhdGVzdCB9IGZyb20gXCIuL3VzZUxhdGVzdFwiO1xuaW1wb3J0IHsgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLCBGdW5jdGlvblJldHVybmluZ1Byb21pc2UsIFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGlzSlNPTiB9IGZyb20gXCIuL2ZldGNoLXV0aWxzXCI7XG5pbXBvcnQgeyBoYXNoIH0gZnJvbSBcIi4vaGVscGVyc1wiO1xuXG5hc3luYyBmdW5jdGlvbiBkZWZhdWx0UGFyc2luZyhyZXNwb25zZTogUmVzcG9uc2UpIHtcbiAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgIHRocm93IG5ldyBFcnJvcihyZXNwb25zZS5zdGF0dXNUZXh0KTtcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnRUeXBlSGVhZGVyID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJjb250ZW50LXR5cGVcIik7XG5cbiAgaWYgKGNvbnRlbnRUeXBlSGVhZGVyICYmIGlzSlNPTihjb250ZW50VHlwZUhlYWRlcikpIHtcbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICB9XG4gIHJldHVybiBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRNYXBwaW5nPFYsIFQgZXh0ZW5kcyB1bmtub3duW10+KHJlc3VsdDogVik6IHsgZGF0YTogVDsgaGFzTW9yZT86IGJvb2xlYW47IGN1cnNvcj86IGFueSB9IHtcbiAgcmV0dXJuIHsgZGF0YTogcmVzdWx0IGFzIHVua25vd24gYXMgVCwgaGFzTW9yZTogZmFsc2UgfTtcbn1cblxudHlwZSBSZXF1ZXN0SW5mbyA9IHN0cmluZyB8IFVSTCB8IGdsb2JhbFRoaXMuUmVxdWVzdDtcbnR5cGUgUGFnaW5hdGVkUmVxdWVzdEluZm8gPSAocGFnaW5hdGlvbjogeyBwYWdlOiBudW1iZXI7IGxhc3RJdGVtPzogYW55OyBjdXJzb3I/OiBhbnkgfSkgPT4gUmVxdWVzdEluZm87XG5cbi8qKlxuICogRmV0Y2hlcyB0aGUgcGFnaW5hdGVkVVJMIGFuZCByZXR1cm5zIHRoZSB7QGxpbmsgQXN5bmNTdGF0ZX0gY29ycmVzcG9uZGluZyB0byB0aGUgZXhlY3V0aW9uIG9mIHRoZSBmZXRjaC4gVGhlIGxhc3QgdmFsdWUgd2lsbCBiZSBrZXB0IGJldHdlZW4gY29tbWFuZCBydW5zLlxuICpcbiAqIEByZW1hcmsgVGhpcyBvdmVybG9hZCBzaG91bGQgYmUgdXNlZCB3aGVuIHdvcmtpbmcgd2l0aCBwYWdpbmF0ZWQgZGF0YSBzb3VyY2VzLlxuICogQHJlbWFyayBXaGVuIHBhZ2luYXRpbmcsIG9ubHkgdGhlIGZpcnN0IHBhZ2Ugd2lsbCBiZSBjYWNoZWQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgSWNvbiwgSW1hZ2UsIExpc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG4gKiBpbXBvcnQgeyB1c2VGZXRjaCB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICogaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbiAqXG4gKiB0eXBlIFNlYXJjaFJlc3VsdCA9IHsgY29tcGFuaWVzOiBDb21wYW55W107IHBhZ2U6IG51bWJlcjsgdG90YWxQYWdlczogbnVtYmVyIH07XG4gKiB0eXBlIENvbXBhbnkgPSB7IGlkOiBudW1iZXI7IG5hbWU6IHN0cmluZzsgc21hbGxMb2dvVXJsPzogc3RyaW5nIH07XG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKCkge1xuICogICBjb25zdCBbc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAqICAgY29uc3QgeyBpc0xvYWRpbmcsIGRhdGEsIHBhZ2luYXRpb24gfSA9IHVzZUZldGNoKFxuICogICAgIChvcHRpb25zKSA9PlxuICogICAgICAgXCJodHRwczovL2FwaS55Y29tYmluYXRvci5jb20vdjAuMS9jb21wYW5pZXM/XCIgK1xuICogICAgICAgbmV3IFVSTFNlYXJjaFBhcmFtcyh7IHBhZ2U6IFN0cmluZyhvcHRpb25zLnBhZ2UgKyAxKSwgcTogc2VhcmNoVGV4dCB9KS50b1N0cmluZygpLFxuICogICAgIHtcbiAqICAgICAgIG1hcFJlc3VsdChyZXN1bHQ6IFNlYXJjaFJlc3VsdCkge1xuICogICAgICAgICByZXR1cm4ge1xuICogICAgICAgICAgIGRhdGE6IHJlc3VsdC5jb21wYW5pZXMsXG4gKiAgICAgICAgICAgaGFzTW9yZTogcmVzdWx0LnBhZ2UgPCByZXN1bHQudG90YWxQYWdlcyxcbiAqICAgICAgICAgfTtcbiAqICAgICAgIH0sXG4gKiAgICAgICBrZWVwUHJldmlvdXNEYXRhOiB0cnVlLFxuICogICAgICAgaW5pdGlhbERhdGE6IFtdLFxuICogICAgIH0sXG4gKiAgICk7XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxMaXN0IGlzTG9hZGluZz17aXNMb2FkaW5nfSBwYWdpbmF0aW9uPXtwYWdpbmF0aW9ufSBvblNlYXJjaFRleHRDaGFuZ2U9e3NldFNlYXJjaFRleHR9PlxuICogICAgICAge2RhdGEubWFwKChjb21wYW55KSA9PiAoXG4gKiAgICAgICAgIDxMaXN0Lkl0ZW1cbiAqICAgICAgICAgICBrZXk9e2NvbXBhbnkuaWR9XG4gKiAgICAgICAgICAgaWNvbj17eyBzb3VyY2U6IGNvbXBhbnkuc21hbGxMb2dvVXJsID8/IEljb24uTWludXNDaXJjbGUsIG1hc2s6IEltYWdlLk1hc2suUm91bmRlZFJlY3RhbmdsZSB9fVxuICogICAgICAgICAgIHRpdGxlPXtjb21wYW55Lm5hbWV9XG4gKiAgICAgICAgIC8+XG4gKiAgICAgICApKX1cbiAqICAgICA8L0xpc3Q+XG4gKiAgICk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUZldGNoPFYgPSB1bmtub3duLCBVID0gdW5kZWZpbmVkLCBUIGV4dGVuZHMgdW5rbm93bltdID0gdW5rbm93bltdPihcbiAgdXJsOiBQYWdpbmF0ZWRSZXF1ZXN0SW5mbyxcbiAgb3B0aW9uczogUmVxdWVzdEluaXQgJiB7XG4gICAgbWFwUmVzdWx0OiAocmVzdWx0OiBWKSA9PiB7IGRhdGE6IFQ7IGhhc01vcmU/OiBib29sZWFuOyBjdXJzb3I/OiBhbnkgfTtcbiAgICBwYXJzZVJlc3BvbnNlPzogKHJlc3BvbnNlOiBSZXNwb25zZSkgPT4gUHJvbWlzZTxWPjtcbiAgfSAmIE9taXQ8Q2FjaGVkUHJvbWlzZU9wdGlvbnM8KHVybDogUmVxdWVzdEluZm8sIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCkgPT4gUHJvbWlzZTxUPiwgVT4sIFwiYWJvcnRhYmxlXCI+LFxuKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VCwgVT47XG4vKipcbiAqIEZldGNoIHRoZSBVUkwgYW5kIHJldHVybnMgdGhlIHtAbGluayBBc3luY1N0YXRlfSBjb3JyZXNwb25kaW5nIHRvIHRoZSBleGVjdXRpb24gb2YgdGhlIGZldGNoLiBUaGUgbGFzdCB2YWx1ZSB3aWxsIGJlIGtlcHQgYmV0d2VlbiBjb21tYW5kIHJ1bnMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgdXNlRmV0Y2ggfSBmcm9tICdAcmF5Y2FzdC91dGlscyc7XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ29tbWFuZCgpIHtcbiAqICAgY29uc3QgeyBpc0xvYWRpbmcsIGRhdGEsIHJldmFsaWRhdGUgfSA9IHVzZUZldGNoKCdodHRwczovL2FwaS5leGFtcGxlJyk7XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxEZXRhaWxcbiAqICAgICAgIGlzTG9hZGluZz17aXNMb2FkaW5nfVxuICogICAgICAgbWFya2Rvd249e2RhdGF9XG4gKiAgICAgICBhY3Rpb25zPXtcbiAqICAgICAgICAgPEFjdGlvblBhbmVsPlxuICogICAgICAgICAgIDxBY3Rpb24gdGl0bGU9XCJSZWxvYWRcIiBvbkFjdGlvbj17KCkgPT4gcmV2YWxpZGF0ZSgpfSAvPlxuICogICAgICAgICA8L0FjdGlvblBhbmVsPlxuICogICAgICAgfVxuICogICAgIC8+XG4gKiAgICk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VGZXRjaDxWID0gdW5rbm93biwgVSA9IHVuZGVmaW5lZCwgVCA9IFY+KFxuICB1cmw6IFJlcXVlc3RJbmZvLFxuICBvcHRpb25zPzogUmVxdWVzdEluaXQgJiB7XG4gICAgbWFwUmVzdWx0PzogKHJlc3VsdDogVikgPT4geyBkYXRhOiBUOyBoYXNNb3JlPzogYm9vbGVhbjsgY3Vyc29yPzogYW55IH07XG4gICAgcGFyc2VSZXNwb25zZT86IChyZXNwb25zZTogUmVzcG9uc2UpID0+IFByb21pc2U8Vj47XG4gIH0gJiBPbWl0PENhY2hlZFByb21pc2VPcHRpb25zPCh1cmw6IFJlcXVlc3RJbmZvLCBvcHRpb25zPzogUmVxdWVzdEluaXQpID0+IFByb21pc2U8VD4sIFU+LCBcImFib3J0YWJsZVwiPixcbik6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFQsIFU+ICYgeyBwYWdpbmF0aW9uOiB1bmRlZmluZWQgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUZldGNoPFYgPSB1bmtub3duLCBVID0gdW5kZWZpbmVkLCBUIGV4dGVuZHMgdW5rbm93bltdID0gdW5rbm93bltdPihcbiAgdXJsOiBSZXF1ZXN0SW5mbyB8IFBhZ2luYXRlZFJlcXVlc3RJbmZvLFxuICBvcHRpb25zPzogUmVxdWVzdEluaXQgJiB7XG4gICAgbWFwUmVzdWx0PzogKHJlc3VsdDogVikgPT4geyBkYXRhOiBUOyBoYXNNb3JlPzogYm9vbGVhbjsgY3Vyc29yPzogYW55IH07XG4gICAgcGFyc2VSZXNwb25zZT86IChyZXNwb25zZTogUmVzcG9uc2UpID0+IFByb21pc2U8Vj47XG4gIH0gJiBPbWl0PENhY2hlZFByb21pc2VPcHRpb25zPCh1cmw6IFJlcXVlc3RJbmZvLCBvcHRpb25zPzogUmVxdWVzdEluaXQpID0+IFByb21pc2U8VD4sIFU+LCBcImFib3J0YWJsZVwiPixcbik6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFQsIFU+IHtcbiAgY29uc3Qge1xuICAgIHBhcnNlUmVzcG9uc2UsXG4gICAgbWFwUmVzdWx0LFxuICAgIGluaXRpYWxEYXRhLFxuICAgIGV4ZWN1dGUsXG4gICAga2VlcFByZXZpb3VzRGF0YSxcbiAgICBvbkVycm9yLFxuICAgIG9uRGF0YSxcbiAgICBvbldpbGxFeGVjdXRlLFxuICAgIGZhaWx1cmVUb2FzdE9wdGlvbnMsXG4gICAgLi4uZmV0Y2hPcHRpb25zXG4gIH0gPSBvcHRpb25zIHx8IHt9O1xuXG4gIGNvbnN0IHVzZUNhY2hlZFByb21pc2VPcHRpb25zOiBDYWNoZWRQcm9taXNlT3B0aW9uczwodXJsOiBSZXF1ZXN0SW5mbywgb3B0aW9ucz86IFJlcXVlc3RJbml0KSA9PiBQcm9taXNlPFQ+LCBVPiA9IHtcbiAgICBpbml0aWFsRGF0YSxcbiAgICBleGVjdXRlLFxuICAgIGtlZXBQcmV2aW91c0RhdGEsXG4gICAgb25FcnJvcixcbiAgICBvbkRhdGEsXG4gICAgb25XaWxsRXhlY3V0ZSxcbiAgICBmYWlsdXJlVG9hc3RPcHRpb25zLFxuICB9O1xuXG4gIGNvbnN0IHBhcnNlUmVzcG9uc2VSZWYgPSB1c2VMYXRlc3QocGFyc2VSZXNwb25zZSB8fCBkZWZhdWx0UGFyc2luZyk7XG4gIGNvbnN0IG1hcFJlc3VsdFJlZiA9IHVzZUxhdGVzdChtYXBSZXN1bHQgfHwgZGVmYXVsdE1hcHBpbmcpO1xuICBjb25zdCB1cmxSZWYgPSB1c2VSZWY8UmVxdWVzdEluZm8gfCBQYWdpbmF0ZWRSZXF1ZXN0SW5mbz4obnVsbCk7XG4gIGNvbnN0IGZpcnN0UGFnZVVybFJlZiA9IHVzZVJlZjxSZXF1ZXN0SW5mbyB8IHVuZGVmaW5lZD4obnVsbCk7XG4gIGNvbnN0IGZpcnN0UGFnZVVybCA9IHR5cGVvZiB1cmwgPT09IFwiZnVuY3Rpb25cIiA/IHVybCh7IHBhZ2U6IDAgfSkgOiB1bmRlZmluZWQ7XG4gIC8qKlxuICAgKiBXaGVuIHBhZ2luYXRpbmcsIGB1cmxgIGlzIGEgYFBhZ2luYXRlZFJlcXVlc3RJbmZvYCwgc28gd2Ugb25seSB3YW50IHRvIHVwZGF0ZSB0aGUgcmVmIHdoZW4gdGhlIGBmaXJzdFBhZ2VVcmxgIGNoYW5nZXMuXG4gICAqIFdoZW4gbm90IHBhZ2luYXRpbmcsIGB1cmxgIGlzIGEgYFJlcXVlc3RJbmZvYCwgc28gd2Ugd2FudCB0byB1cGRhdGUgdGhlIHJlZiB3aGVuZXZlciBgdXJsYCBjaGFuZ2VzLlxuICAgKi9cbiAgaWYgKCF1cmxSZWYuY3VycmVudCB8fCB0eXBlb2YgZmlyc3RQYWdlVXJsUmVmLmN1cnJlbnQgPT09IFwidW5kZWZpbmVkXCIgfHwgZmlyc3RQYWdlVXJsUmVmLmN1cnJlbnQgIT09IGZpcnN0UGFnZVVybCkge1xuICAgIHVybFJlZi5jdXJyZW50ID0gdXJsO1xuICB9XG4gIGZpcnN0UGFnZVVybFJlZi5jdXJyZW50ID0gZmlyc3RQYWdlVXJsO1xuICBjb25zdCBhYm9ydGFibGUgPSB1c2VSZWY8QWJvcnRDb250cm9sbGVyPihudWxsKTtcblxuICBjb25zdCBwYWdpbmF0ZWRGbjogRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlPFtQYWdpbmF0ZWRSZXF1ZXN0SW5mbywgdHlwZW9mIGZldGNoT3B0aW9uc10sIFQ+ID0gdXNlQ2FsbGJhY2soXG4gICAgKHVybDogUGFnaW5hdGVkUmVxdWVzdEluZm8sIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCkgPT4gYXN5bmMgKHBhZ2luYXRpb246IHsgcGFnZTogbnVtYmVyIH0pID0+IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybChwYWdpbmF0aW9uKSwgeyBzaWduYWw6IGFib3J0YWJsZS5jdXJyZW50Py5zaWduYWwsIC4uLm9wdGlvbnMgfSk7XG4gICAgICBjb25zdCBwYXJzZWQgPSAoYXdhaXQgcGFyc2VSZXNwb25zZVJlZi5jdXJyZW50KHJlcykpIGFzIFY7XG4gICAgICByZXR1cm4gbWFwUmVzdWx0UmVmLmN1cnJlbnQ/LihwYXJzZWQpO1xuICAgIH0sXG4gICAgW3BhcnNlUmVzcG9uc2VSZWYsIG1hcFJlc3VsdFJlZl0sXG4gICk7XG4gIGNvbnN0IGZuOiBGdW5jdGlvblJldHVybmluZ1Byb21pc2U8W1JlcXVlc3RJbmZvLCBSZXF1ZXN0SW5pdD9dLCBUPiA9IHVzZUNhbGxiYWNrKFxuICAgIGFzeW5jICh1cmw6IFJlcXVlc3RJbmZvLCBvcHRpb25zPzogUmVxdWVzdEluaXQpID0+IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybCwgeyBzaWduYWw6IGFib3J0YWJsZS5jdXJyZW50Py5zaWduYWwsIC4uLm9wdGlvbnMgfSk7XG4gICAgICBjb25zdCBwYXJzZWQgPSAoYXdhaXQgcGFyc2VSZXNwb25zZVJlZi5jdXJyZW50KHJlcykpIGFzIFY7XG4gICAgICBjb25zdCBtYXBwZWQgPSBtYXBSZXN1bHRSZWYuY3VycmVudChwYXJzZWQpO1xuICAgICAgcmV0dXJuIG1hcHBlZD8uZGF0YSBhcyB1bmtub3duIGFzIFQ7XG4gICAgfSxcbiAgICBbcGFyc2VSZXNwb25zZVJlZiwgbWFwUmVzdWx0UmVmXSxcbiAgKTtcblxuICBjb25zdCBwcm9taXNlID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKGZpcnN0UGFnZVVybFJlZi5jdXJyZW50KSB7XG4gICAgICByZXR1cm4gcGFnaW5hdGVkRm47XG4gICAgfVxuICAgIHJldHVybiBmbjtcbiAgfSwgW2ZpcnN0UGFnZVVybFJlZiwgZm4sIHBhZ2luYXRlZEZuXSk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBsYXN0SXRlbSBjYW4ndCBiZSBpbmZlcnJlZCBwcm9wZXJseVxuICByZXR1cm4gdXNlQ2FjaGVkUHJvbWlzZShwcm9taXNlLCBbdXJsUmVmLmN1cnJlbnQgYXMgUGFnaW5hdGVkUmVxdWVzdEluZm8sIGZldGNoT3B0aW9uc10sIHtcbiAgICAuLi51c2VDYWNoZWRQcm9taXNlT3B0aW9ucyxcbiAgICBpbnRlcm5hbF9jYWNoZUtleVN1ZmZpeDogZmlyc3RQYWdlVXJsUmVmLmN1cnJlbnQgKyBoYXNoKG1hcFJlc3VsdFJlZi5jdXJyZW50KSArIGhhc2gocGFyc2VSZXNwb25zZVJlZi5jdXJyZW50KSxcbiAgICBhYm9ydGFibGUsXG4gIH0pO1xufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBpc0pTT04oY29udGVudFR5cGVIZWFkZXI6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiBib29sZWFuIHtcbiAgaWYgKGNvbnRlbnRUeXBlSGVhZGVyKSB7XG4gICAgY29uc3QgbWVkaWFUeXBlID0gcGFyc2VDb250ZW50VHlwZShjb250ZW50VHlwZUhlYWRlcik7XG5cbiAgICBpZiAoIW1lZGlhVHlwZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChtZWRpYVR5cGUuc3VidHlwZSA9PT0gXCJqc29uXCIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChtZWRpYVR5cGUuc3VmZml4ID09PSBcImpzb25cIikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG1lZGlhVHlwZS5zdWZmaXggJiYgL1xcYmpzb25cXGIvaS50ZXN0KG1lZGlhVHlwZS5zdWZmaXgpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAobWVkaWFUeXBlLnN1YnR5cGUgJiYgL1xcYmpzb25cXGIvaS50ZXN0KG1lZGlhVHlwZS5zdWJ0eXBlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZWdFeHAgdG8gbWF0Y2ggdHlwZSBpbiBSRkMgNjgzOCB3aXRoIGFuIG9wdGlvbmFsIHRyYWlsaW5nIGA7YCBiZWNhdXNlIHNvbWUgQXBwbGUgQVBJcyByZXR1cm5zIG9uZS4uLlxuICpcbiAqIHR5cGUtbmFtZSA9IHJlc3RyaWN0ZWQtbmFtZVxuICogc3VidHlwZS1uYW1lID0gcmVzdHJpY3RlZC1uYW1lXG4gKiByZXN0cmljdGVkLW5hbWUgPSByZXN0cmljdGVkLW5hbWUtZmlyc3QgKjEyNnJlc3RyaWN0ZWQtbmFtZS1jaGFyc1xuICogcmVzdHJpY3RlZC1uYW1lLWZpcnN0ICA9IEFMUEhBIC8gRElHSVRcbiAqIHJlc3RyaWN0ZWQtbmFtZS1jaGFycyAgPSBBTFBIQSAvIERJR0lUIC8gXCIhXCIgLyBcIiNcIiAvXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkXCIgLyBcIiZcIiAvIFwiLVwiIC8gXCJeXCIgLyBcIl9cIlxuICogcmVzdHJpY3RlZC1uYW1lLWNoYXJzID0vIFwiLlwiIDsgQ2hhcmFjdGVycyBiZWZvcmUgZmlyc3QgZG90IGFsd2F5c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7IHNwZWNpZnkgYSBmYWNldCBuYW1lXG4gKiByZXN0cmljdGVkLW5hbWUtY2hhcnMgPS8gXCIrXCIgOyBDaGFyYWN0ZXJzIGFmdGVyIGxhc3QgcGx1cyBhbHdheXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOyBzcGVjaWZ5IGEgc3RydWN0dXJlZCBzeW50YXggc3VmZml4XG4gKiBBTFBIQSA9ICAleDQxLTVBIC8gJXg2MS03QSAgIDsgQS1aIC8gYS16XG4gKiBESUdJVCA9ICAleDMwLTM5ICAgICAgICAgICAgIDsgMC05XG4gKi9cbmNvbnN0IE1FRElBX1RZUEVfUkVHRVhQID0gL14oW0EtWmEtejAtOV1bQS1aYS16MC05ISMkJl5fLV17MCwxMjZ9KVxcLyhbQS1aYS16MC05XVtBLVphLXowLTkhIyQmXl8uKy1dezAsMTI2fSk7PyQvO1xuXG5mdW5jdGlvbiBwYXJzZUNvbnRlbnRUeXBlKGhlYWRlcjogc3RyaW5nKSB7XG4gIGNvbnN0IGhlYWRlckRlbGltaXRhdGlvbmluZGV4ID0gaGVhZGVyLmluZGV4T2YoXCI7XCIpO1xuICBjb25zdCBjb250ZW50VHlwZSA9IGhlYWRlckRlbGltaXRhdGlvbmluZGV4ICE9PSAtMSA/IGhlYWRlci5zbGljZSgwLCBoZWFkZXJEZWxpbWl0YXRpb25pbmRleCkudHJpbSgpIDogaGVhZGVyLnRyaW0oKTtcblxuICBjb25zdCBtYXRjaCA9IE1FRElBX1RZUEVfUkVHRVhQLmV4ZWMoY29udGVudFR5cGUudG9Mb3dlckNhc2UoKS50b0xvd2VyQ2FzZSgpKTtcblxuICBpZiAoIW1hdGNoKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgdHlwZSA9IG1hdGNoWzFdO1xuICBsZXQgc3VidHlwZSA9IG1hdGNoWzJdO1xuICBsZXQgc3VmZml4O1xuXG4gIC8vIHN1ZmZpeCBhZnRlciBsYXN0ICtcbiAgY29uc3QgaW5kZXggPSBzdWJ0eXBlLmxhc3RJbmRleE9mKFwiK1wiKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIHN1ZmZpeCA9IHN1YnR5cGUuc3Vic3RyaW5nKGluZGV4ICsgMSk7XG4gICAgc3VidHlwZSA9IHN1YnR5cGUuc3Vic3RyaW5nKDAsIGluZGV4KTtcbiAgfVxuXG4gIHJldHVybiB7IHR5cGUsIHN1YnR5cGUsIHN1ZmZpeCB9O1xufVxuIiwgIi8qXG4gKiBJbnNwaXJlZCBieSBFeGVjYVxuICovXG5cbmltcG9ydCBjaGlsZFByb2Nlc3MgZnJvbSBcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHsgdXNlQ2FsbGJhY2ssIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyB1c2VDYWNoZWRQcm9taXNlLCBDYWNoZWRQcm9taXNlT3B0aW9ucyB9IGZyb20gXCIuL3VzZUNhY2hlZFByb21pc2VcIjtcbmltcG9ydCB7IHVzZUxhdGVzdCB9IGZyb20gXCIuL3VzZUxhdGVzdFwiO1xuaW1wb3J0IHsgVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGUgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHtcbiAgZ2V0U3Bhd25lZFByb21pc2UsXG4gIGdldFNwYXduZWRSZXN1bHQsXG4gIGhhbmRsZU91dHB1dCxcbiAgZGVmYXVsdFBhcnNpbmcsXG4gIFBhcnNlRXhlY091dHB1dEhhbmRsZXIsXG59IGZyb20gXCIuL2V4ZWMtdXRpbHNcIjtcblxudHlwZSBFeGVjT3B0aW9ucyA9IHtcbiAgLyoqXG4gICAqIElmIGB0cnVlYCwgcnVucyB0aGUgY29tbWFuZCBpbnNpZGUgb2YgYSBzaGVsbC4gVXNlcyBgL2Jpbi9zaGAuIEEgZGlmZmVyZW50IHNoZWxsIGNhbiBiZSBzcGVjaWZpZWQgYXMgYSBzdHJpbmcuIFRoZSBzaGVsbCBzaG91bGQgdW5kZXJzdGFuZCB0aGUgYC1jYCBzd2l0Y2guXG4gICAqXG4gICAqIFdlIHJlY29tbWVuZCBhZ2FpbnN0IHVzaW5nIHRoaXMgb3B0aW9uIHNpbmNlIGl0IGlzOlxuICAgKiAtIG5vdCBjcm9zcy1wbGF0Zm9ybSwgZW5jb3VyYWdpbmcgc2hlbGwtc3BlY2lmaWMgc3ludGF4LlxuICAgKiAtIHNsb3dlciwgYmVjYXVzZSBvZiB0aGUgYWRkaXRpb25hbCBzaGVsbCBpbnRlcnByZXRhdGlvbi5cbiAgICogLSB1bnNhZmUsIHBvdGVudGlhbGx5IGFsbG93aW5nIGNvbW1hbmQgaW5qZWN0aW9uLlxuICAgKlxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgc2hlbGw/OiBib29sZWFuIHwgc3RyaW5nO1xuICAvKipcbiAgICogU3RyaXAgdGhlIGZpbmFsIG5ld2xpbmUgY2hhcmFjdGVyIGZyb20gdGhlIG91dHB1dC5cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgc3RyaXBGaW5hbE5ld2xpbmU/OiBib29sZWFuO1xuICAvKipcbiAgICogQ3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBvZiB0aGUgY2hpbGQgcHJvY2Vzcy5cbiAgICogQGRlZmF1bHQgcHJvY2Vzcy5jd2QoKVxuICAgKi9cbiAgY3dkPzogc3RyaW5nO1xuICAvKipcbiAgICogRW52aXJvbm1lbnQga2V5LXZhbHVlIHBhaXJzLiBFeHRlbmRzIGF1dG9tYXRpY2FsbHkgZnJvbSBgcHJvY2Vzcy5lbnZgLlxuICAgKiBAZGVmYXVsdCBwcm9jZXNzLmVudlxuICAgKi9cbiAgZW52PzogTm9kZUpTLlByb2Nlc3NFbnY7XG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBjaGFyYWN0ZXIgZW5jb2RpbmcgdXNlZCB0byBkZWNvZGUgdGhlIHN0ZG91dCBhbmQgc3RkZXJyIG91dHB1dC4gSWYgc2V0IHRvIGBcImJ1ZmZlclwiYCwgdGhlbiBzdGRvdXQgYW5kIHN0ZGVyciB3aWxsIGJlIGEgQnVmZmVyIGluc3RlYWQgb2YgYSBzdHJpbmcuXG4gICAqXG4gICAqIEBkZWZhdWx0IFwidXRmOFwiXG4gICAqL1xuICBlbmNvZGluZz86IEJ1ZmZlckVuY29kaW5nIHwgXCJidWZmZXJcIjtcbiAgLyoqXG4gICAqIFdyaXRlIHNvbWUgaW5wdXQgdG8gdGhlIGBzdGRpbmAgb2YgeW91ciBiaW5hcnkuXG4gICAqL1xuICBpbnB1dD86IHN0cmluZyB8IEJ1ZmZlcjtcbiAgLyoqIElmIHRpbWVvdXQgaXMgZ3JlYXRlciB0aGFuIGAwYCwgdGhlIHBhcmVudCB3aWxsIHNlbmQgdGhlIHNpZ25hbCBgU0lHVEVSTWAgaWYgdGhlIGNoaWxkIHJ1bnMgbG9uZ2VyIHRoYW4gdGltZW91dCBtaWxsaXNlY29uZHMuXG4gICAqXG4gICAqIEBkZWZhdWx0IDEwMDAwXG4gICAqL1xuICB0aW1lb3V0PzogbnVtYmVyO1xufTtcblxuY29uc3QgU1BBQ0VTX1JFR0VYUCA9IC8gKy9nO1xuZnVuY3Rpb24gcGFyc2VDb21tYW5kKGNvbW1hbmQ6IHN0cmluZywgYXJncz86IHN0cmluZ1tdKSB7XG4gIGlmIChhcmdzKSB7XG4gICAgcmV0dXJuIFtjb21tYW5kLCAuLi5hcmdzXTtcbiAgfVxuICBjb25zdCB0b2tlbnM6IHN0cmluZ1tdID0gW107XG4gIGZvciAoY29uc3QgdG9rZW4gb2YgY29tbWFuZC50cmltKCkuc3BsaXQoU1BBQ0VTX1JFR0VYUCkpIHtcbiAgICAvLyBBbGxvdyBzcGFjZXMgdG8gYmUgZXNjYXBlZCBieSBhIGJhY2tzbGFzaCBpZiBub3QgbWVhbnQgYXMgYSBkZWxpbWl0ZXJcbiAgICBjb25zdCBwcmV2aW91c1Rva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICBpZiAocHJldmlvdXNUb2tlbiAmJiBwcmV2aW91c1Rva2VuLmVuZHNXaXRoKFwiXFxcXFwiKSkge1xuICAgICAgLy8gTWVyZ2UgcHJldmlvdXMgdG9rZW4gd2l0aCBjdXJyZW50IG9uZVxuICAgICAgdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXSA9IGAke3ByZXZpb3VzVG9rZW4uc2xpY2UoMCwgLTEpfSAke3Rva2VufWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdG9rZW5zO1xufVxuXG50eXBlIEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPiA9IE9taXQ8XG4gIENhY2hlZFByb21pc2VPcHRpb25zPFxuICAgIChfY29tbWFuZDogc3RyaW5nLCBfYXJnczogc3RyaW5nW10sIF9vcHRpb25zPzogRXhlY09wdGlvbnMsIGlucHV0Pzogc3RyaW5nIHwgQnVmZmVyKSA9PiBQcm9taXNlPFQ+LFxuICAgIFVcbiAgPixcbiAgXCJhYm9ydGFibGVcIlxuPjtcblxuLyoqXG4gKiBFeGVjdXRlcyBhIGNvbW1hbmQgYW5kIHJldHVybnMgdGhlIHtAbGluayBBc3luY1N0YXRlfSBjb3JyZXNwb25kaW5nIHRvIHRoZSBleGVjdXRpb24gb2YgdGhlIGNvbW1hbmQuIFRoZSBsYXN0IHZhbHVlIHdpbGwgYmUga2VwdCBiZXR3ZWVuIGNvbW1hbmQgcnVucy5cbiAqXG4gKiBAcmVtYXJrIFdoZW4gc3BlY2lmeWluZyB0aGUgYXJndW1lbnRzIHZpYSB0aGUgYGNvbW1hbmRgIHN0cmluZywgaWYgdGhlIGZpbGUgb3IgYW4gYXJndW1lbnQgb2YgdGhlIGNvbW1hbmQgY29udGFpbnMgc3BhY2VzLCB0aGV5IG11c3QgYmUgZXNjYXBlZCB3aXRoIGJhY2tzbGFzaGVzLiBUaGlzIG1hdHRlcnMgZXNwZWNpYWxseSBpZiBgY29tbWFuZGAgaXMgbm90IGEgY29uc3RhbnQgYnV0IGEgdmFyaWFibGUsIGZvciBleGFtcGxlIHdpdGggYF9fZGlybmFtZWAgb3IgYHByb2Nlc3MuY3dkKClgLiBFeGNlcHQgZm9yIHNwYWNlcywgbm8gZXNjYXBpbmcvcXVvdGluZyBpcyBuZWVkZWQuXG4gKlxuICogVGhlIGBzaGVsbGAgb3B0aW9uIG11c3QgYmUgdXNlZCBpZiB0aGUgY29tbWFuZCB1c2VzIHNoZWxsLXNwZWNpZmljIGZlYXR1cmVzIChmb3IgZXhhbXBsZSwgYCYmYCBvciBgfHxgKSwgYXMgb3Bwb3NlZCB0byBiZWluZyBhIHNpbXBsZSBmaWxlIGZvbGxvd2VkIGJ5IGl0cyBhcmd1bWVudHMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgdXNlRXhlYyB9IGZyb20gJ0ByYXljYXN0L3V0aWxzJztcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKCkge1xuICogICBjb25zdCB7IGlzTG9hZGluZywgZGF0YSwgcmV2YWxpZGF0ZSB9ID0gdXNlRXhlYyhcImJyZXdcIiwgW1wiaW5mb1wiLCBcIi0tanNvbj12MlwiLCBcIi0taW5zdGFsbGVkXCJdKTtcbiAqICAgY29uc3QgcmVzdWx0cyA9IHVzZU1lbW88e31bXT4oKCkgPT4gSlNPTi5wYXJzZShkYXRhIHx8IFwiW11cIiksIFtkYXRhXSk7XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxMaXN0IGlzTG9hZGluZz17aXNMb2FkaW5nfT5cbiAqICAgICAgeyhkYXRhIHx8IFtdKS5tYXAoKGl0ZW0pID0+IChcbiAqICAgICAgICA8TGlzdC5JdGVtIGtleT17aXRlbS5pZH0gdGl0bGU9e2l0ZW0ubmFtZX0gLz5cbiAqICAgICAgKSl9XG4gKiAgICA8L0xpc3Q+XG4gKiAgICk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VFeGVjPFQgPSBCdWZmZXIsIFUgPSB1bmRlZmluZWQ+KFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIG9wdGlvbnM6IHtcbiAgICBwYXJzZU91dHB1dD86IFBhcnNlRXhlY091dHB1dEhhbmRsZXI8VCwgQnVmZmVyLCBFeGVjT3B0aW9ucz47XG4gIH0gJiBFeGVjT3B0aW9ucyAmIHtcbiAgICAgIGVuY29kaW5nOiBcImJ1ZmZlclwiO1xuICAgIH0gJiBFeGVjQ2FjaGVkUHJvbWlzZU9wdGlvbnM8VCwgVT4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxULCBVPjtcbmV4cG9ydCBmdW5jdGlvbiB1c2VFeGVjPFQgPSBzdHJpbmcsIFUgPSB1bmRlZmluZWQ+KFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiB7XG4gICAgcGFyc2VPdXRwdXQ/OiBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFQsIHN0cmluZywgRXhlY09wdGlvbnM+O1xuICB9ICYgRXhlY09wdGlvbnMgJiB7XG4gICAgICBlbmNvZGluZz86IEJ1ZmZlckVuY29kaW5nO1xuICAgIH0gJiBFeGVjQ2FjaGVkUHJvbWlzZU9wdGlvbnM8VCwgVT4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxULCBVPjtcbmV4cG9ydCBmdW5jdGlvbiB1c2VFeGVjPFQgPSBCdWZmZXIsIFUgPSB1bmRlZmluZWQ+KFxuICBmaWxlOiBzdHJpbmcsXG4gIC8qKlxuICAgKiBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGZpbGUuIE5vIGVzY2FwaW5nL3F1b3RpbmcgaXMgbmVlZGVkLlxuICAgKlxuICAgKiBJZiBkZWZpbmVkLCB0aGUgY29tbWFuZHMgbmVlZHMgdG8gYmUgYSBmaWxlIHRvIGV4ZWN1dGUuIElmIHVuZGVmaW5lZCwgdGhlIGFyZ3VtZW50cyB3aWxsIGJlIHBhcnNlZCBmcm9tIHRoZSBjb21tYW5kLlxuICAgKi9cbiAgYXJnczogc3RyaW5nW10sXG4gIG9wdGlvbnM6IHtcbiAgICBwYXJzZU91dHB1dD86IFBhcnNlRXhlY091dHB1dEhhbmRsZXI8VCwgQnVmZmVyLCBFeGVjT3B0aW9ucz47XG4gIH0gJiBFeGVjT3B0aW9ucyAmIHtcbiAgICAgIGVuY29kaW5nOiBcImJ1ZmZlclwiO1xuICAgIH0gJiBFeGVjQ2FjaGVkUHJvbWlzZU9wdGlvbnM8VCwgVT4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxULCBVPjtcbmV4cG9ydCBmdW5jdGlvbiB1c2VFeGVjPFQgPSBzdHJpbmcsIFUgPSB1bmRlZmluZWQ+KFxuICBmaWxlOiBzdHJpbmcsXG4gIC8qKlxuICAgKiBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGZpbGUuIE5vIGVzY2FwaW5nL3F1b3RpbmcgaXMgbmVlZGVkLlxuICAgKlxuICAgKiBJZiBkZWZpbmVkLCB0aGUgY29tbWFuZHMgbmVlZHMgdG8gYmUgYSBmaWxlIHRvIGV4ZWN1dGUuIElmIHVuZGVmaW5lZCwgdGhlIGFyZ3VtZW50cyB3aWxsIGJlIHBhcnNlZCBmcm9tIHRoZSBjb21tYW5kLlxuICAgKi9cbiAgYXJnczogc3RyaW5nW10sXG4gIG9wdGlvbnM/OiB7XG4gICAgcGFyc2VPdXRwdXQ/OiBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFQsIHN0cmluZywgRXhlY09wdGlvbnM+O1xuICB9ICYgRXhlY09wdGlvbnMgJiB7XG4gICAgICBlbmNvZGluZz86IEJ1ZmZlckVuY29kaW5nO1xuICAgIH0gJiBFeGVjQ2FjaGVkUHJvbWlzZU9wdGlvbnM8VCwgVT4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxULCBVPjtcbmV4cG9ydCBmdW5jdGlvbiB1c2VFeGVjPFQsIFUgPSB1bmRlZmluZWQ+KFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIG9wdGlvbnNPckFyZ3M/OlxuICAgIHwgc3RyaW5nW11cbiAgICB8ICh7XG4gICAgICAgIHBhcnNlT3V0cHV0PzogUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBCdWZmZXIsIEV4ZWNPcHRpb25zPiB8IFBhcnNlRXhlY091dHB1dEhhbmRsZXI8VCwgc3RyaW5nLCBFeGVjT3B0aW9ucz47XG4gICAgICB9ICYgRXhlY09wdGlvbnMgJlxuICAgICAgICBFeGVjQ2FjaGVkUHJvbWlzZU9wdGlvbnM8VCwgVT4pLFxuICBvcHRpb25zPzoge1xuICAgIHBhcnNlT3V0cHV0PzogUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBCdWZmZXIsIEV4ZWNPcHRpb25zPiB8IFBhcnNlRXhlY091dHB1dEhhbmRsZXI8VCwgc3RyaW5nLCBFeGVjT3B0aW9ucz47XG4gIH0gJiBFeGVjT3B0aW9ucyAmXG4gICAgRXhlY0NhY2hlZFByb21pc2VPcHRpb25zPFQsIFU+LFxuKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VCwgVT4ge1xuICBjb25zdCB7XG4gICAgcGFyc2VPdXRwdXQsXG4gICAgaW5wdXQsXG4gICAgb25EYXRhLFxuICAgIG9uV2lsbEV4ZWN1dGUsXG4gICAgaW5pdGlhbERhdGEsXG4gICAgZXhlY3V0ZSxcbiAgICBrZWVwUHJldmlvdXNEYXRhLFxuICAgIG9uRXJyb3IsXG4gICAgZmFpbHVyZVRvYXN0T3B0aW9ucyxcbiAgICAuLi5leGVjT3B0aW9uc1xuICB9ID0gQXJyYXkuaXNBcnJheShvcHRpb25zT3JBcmdzKSA/IG9wdGlvbnMgfHwge30gOiBvcHRpb25zT3JBcmdzIHx8IHt9O1xuXG4gIGNvbnN0IHVzZUNhY2hlZFByb21pc2VPcHRpb25zOiBFeGVjQ2FjaGVkUHJvbWlzZU9wdGlvbnM8VCwgVT4gPSB7XG4gICAgaW5pdGlhbERhdGEsXG4gICAgZXhlY3V0ZSxcbiAgICBrZWVwUHJldmlvdXNEYXRhLFxuICAgIG9uRXJyb3IsXG4gICAgb25EYXRhLFxuICAgIG9uV2lsbEV4ZWN1dGUsXG4gICAgZmFpbHVyZVRvYXN0T3B0aW9ucyxcbiAgfTtcblxuICBjb25zdCBhYm9ydGFibGUgPSB1c2VSZWY8QWJvcnRDb250cm9sbGVyPihudWxsKTtcbiAgY29uc3QgcGFyc2VPdXRwdXRSZWYgPSB1c2VMYXRlc3QocGFyc2VPdXRwdXQgfHwgZGVmYXVsdFBhcnNpbmcpO1xuXG4gIGNvbnN0IGZuID0gdXNlQ2FsbGJhY2soXG4gICAgYXN5bmMgKF9jb21tYW5kOiBzdHJpbmcsIF9hcmdzOiBzdHJpbmdbXSwgX29wdGlvbnM/OiBFeGVjT3B0aW9ucywgaW5wdXQ/OiBzdHJpbmcgfCBCdWZmZXIpID0+IHtcbiAgICAgIGNvbnN0IFtmaWxlLCAuLi5hcmdzXSA9IHBhcnNlQ29tbWFuZChfY29tbWFuZCwgX2FyZ3MpO1xuICAgICAgY29uc3QgY29tbWFuZCA9IFtmaWxlLCAuLi5hcmdzXS5qb2luKFwiIFwiKTtcblxuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgc3RyaXBGaW5hbE5ld2xpbmU6IHRydWUsXG4gICAgICAgIC4uLl9vcHRpb25zLFxuICAgICAgICB0aW1lb3V0OiBfb3B0aW9ucz8udGltZW91dCB8fCAxMDAwMCxcbiAgICAgICAgc2lnbmFsOiBhYm9ydGFibGUuY3VycmVudD8uc2lnbmFsLFxuICAgICAgICBlbmNvZGluZzogX29wdGlvbnM/LmVuY29kaW5nID09PSBudWxsID8gXCJidWZmZXJcIiA6IF9vcHRpb25zPy5lbmNvZGluZyB8fCBcInV0ZjhcIixcbiAgICAgICAgZW52OiB7IFBBVEg6IFwiL3Vzci9sb2NhbC9iaW46L3Vzci9iaW46L2JpbjovdXNyL3NiaW46L3NiaW5cIiwgLi4ucHJvY2Vzcy5lbnYsIC4uLl9vcHRpb25zPy5lbnYgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHNwYXduZWQgPSBjaGlsZFByb2Nlc3Muc3Bhd24oZmlsZSwgYXJncywgb3B0aW9ucyk7XG4gICAgICBjb25zdCBzcGF3bmVkUHJvbWlzZSA9IGdldFNwYXduZWRQcm9taXNlKHNwYXduZWQsIG9wdGlvbnMpO1xuXG4gICAgICBpZiAoaW5wdXQpIHtcbiAgICAgICAgc3Bhd25lZC5zdGRpbi5lbmQoaW5wdXQpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBbeyBlcnJvciwgZXhpdENvZGUsIHNpZ25hbCwgdGltZWRPdXQgfSwgc3Rkb3V0UmVzdWx0LCBzdGRlcnJSZXN1bHRdID0gYXdhaXQgZ2V0U3Bhd25lZFJlc3VsdChcbiAgICAgICAgc3Bhd25lZCxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgc3Bhd25lZFByb21pc2UsXG4gICAgICApO1xuICAgICAgY29uc3Qgc3Rkb3V0ID0gaGFuZGxlT3V0cHV0KG9wdGlvbnMsIHN0ZG91dFJlc3VsdCk7XG4gICAgICBjb25zdCBzdGRlcnIgPSBoYW5kbGVPdXRwdXQob3B0aW9ucywgc3RkZXJyUmVzdWx0KTtcblxuICAgICAgcmV0dXJuIHBhcnNlT3V0cHV0UmVmLmN1cnJlbnQoe1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRvbyBtYW55IGdlbmVyaWNzLCBJIGdpdmUgdXBcbiAgICAgICAgc3Rkb3V0LFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRvbyBtYW55IGdlbmVyaWNzLCBJIGdpdmUgdXBcbiAgICAgICAgc3RkZXJyLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgZXhpdENvZGUsXG4gICAgICAgIHNpZ25hbCxcbiAgICAgICAgdGltZWRPdXQsXG4gICAgICAgIGNvbW1hbmQsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIHBhcmVudEVycm9yOiBuZXcgRXJyb3IoKSxcbiAgICAgIH0pIGFzIFQ7XG4gICAgfSxcbiAgICBbcGFyc2VPdXRwdXRSZWZdLFxuICApO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgVCBjYW4ndCBiZSBhIFByb21pc2Ugc28gaXQncyBhY3R1YWxseSB0aGUgc2FtZVxuICByZXR1cm4gdXNlQ2FjaGVkUHJvbWlzZShmbiwgW2NvbW1hbmQsIEFycmF5LmlzQXJyYXkob3B0aW9uc09yQXJncykgPyBvcHRpb25zT3JBcmdzIDogW10sIGV4ZWNPcHRpb25zLCBpbnB1dF0sIHtcbiAgICAuLi51c2VDYWNoZWRQcm9taXNlT3B0aW9ucyxcbiAgICBhYm9ydGFibGUsXG4gIH0pO1xufVxuIiwgImltcG9ydCBjaGlsZFByb2Nlc3MgZnJvbSBcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHsgY29uc3RhbnRzIGFzIEJ1ZmZlckNvbnN0YW50cyB9IGZyb20gXCJub2RlOmJ1ZmZlclwiO1xuaW1wb3J0IFN0cmVhbSBmcm9tIFwibm9kZTpzdHJlYW1cIjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJub2RlOnV0aWxcIjtcbmltcG9ydCB7IG9uRXhpdCB9IGZyb20gXCIuL3ZlbmRvcnMvc2lnbmFsLWV4aXRcIjtcblxuZXhwb3J0IHR5cGUgU3Bhd25lZFByb21pc2UgPSBQcm9taXNlPHtcbiAgZXhpdENvZGU6IG51bWJlciB8IG51bGw7XG4gIGVycm9yPzogRXJyb3I7XG4gIHNpZ25hbDogTm9kZUpTLlNpZ25hbHMgfCBudWxsO1xuICB0aW1lZE91dDogYm9vbGVhbjtcbn0+O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3Bhd25lZFByb21pc2UoXG4gIHNwYXduZWQ6IGNoaWxkUHJvY2Vzcy5DaGlsZFByb2Nlc3NXaXRob3V0TnVsbFN0cmVhbXMsXG4gIHsgdGltZW91dCB9OiB7IHRpbWVvdXQ/OiBudW1iZXIgfSA9IHt9LFxuKTogU3Bhd25lZFByb21pc2Uge1xuICBjb25zdCBzcGF3bmVkUHJvbWlzZTogU3Bhd25lZFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgc3Bhd25lZC5vbihcImV4aXRcIiwgKGV4aXRDb2RlLCBzaWduYWwpID0+IHtcbiAgICAgIHJlc29sdmUoeyBleGl0Q29kZSwgc2lnbmFsLCB0aW1lZE91dDogZmFsc2UgfSk7XG4gICAgfSk7XG5cbiAgICBzcGF3bmVkLm9uKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XG4gICAgICByZWplY3QoZXJyb3IpO1xuICAgIH0pO1xuXG4gICAgaWYgKHNwYXduZWQuc3RkaW4pIHtcbiAgICAgIHNwYXduZWQuc3RkaW4ub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3QgcmVtb3ZlRXhpdEhhbmRsZXIgPSBvbkV4aXQoKCkgPT4ge1xuICAgIHNwYXduZWQua2lsbCgpO1xuICB9KTtcblxuICBpZiAodGltZW91dCA9PT0gMCB8fCB0aW1lb3V0ID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gc3Bhd25lZFByb21pc2UuZmluYWxseSgoKSA9PiByZW1vdmVFeGl0SGFuZGxlcigpKTtcbiAgfVxuXG4gIGxldCB0aW1lb3V0SWQ6IE5vZGVKUy5UaW1lb3V0O1xuICBjb25zdCB0aW1lb3V0UHJvbWlzZTogU3Bhd25lZFByb21pc2UgPSBuZXcgUHJvbWlzZSgoX3Jlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc3Bhd25lZC5raWxsKFwiU0lHVEVSTVwiKTtcbiAgICAgIHJlamVjdChPYmplY3QuYXNzaWduKG5ldyBFcnJvcihcIlRpbWVkIG91dFwiKSwgeyB0aW1lZE91dDogdHJ1ZSwgc2lnbmFsOiBcIlNJR1RFUk1cIiB9KSk7XG4gICAgfSwgdGltZW91dCk7XG4gIH0pO1xuXG4gIGNvbnN0IHNhZmVTcGF3bmVkUHJvbWlzZSA9IHNwYXduZWRQcm9taXNlLmZpbmFsbHkoKCkgPT4ge1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICB9KTtcblxuICByZXR1cm4gUHJvbWlzZS5yYWNlKFt0aW1lb3V0UHJvbWlzZSwgc2FmZVNwYXduZWRQcm9taXNlXSkuZmluYWxseSgoKSA9PiByZW1vdmVFeGl0SGFuZGxlcigpKTtcbn1cblxuY2xhc3MgTWF4QnVmZmVyRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFwiVGhlIG91dHB1dCBpcyB0b28gYmlnXCIpO1xuICAgIHRoaXMubmFtZSA9IFwiTWF4QnVmZmVyRXJyb3JcIjtcbiAgfVxufVxuXG5mdW5jdGlvbiBidWZmZXJTdHJlYW08VCBleHRlbmRzIHN0cmluZyB8IEJ1ZmZlcj4ob3B0aW9uczogeyBlbmNvZGluZzogQnVmZmVyRW5jb2RpbmcgfCBcImJ1ZmZlclwiIH0pIHtcbiAgY29uc3QgeyBlbmNvZGluZyB9ID0gb3B0aW9ucztcbiAgY29uc3QgaXNCdWZmZXIgPSBlbmNvZGluZyA9PT0gXCJidWZmZXJcIjtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yIG1pc3NpbmcgdGhlIG1ldGhvZHMgd2UgYXJlIGFkZGluZyBiZWxvd1xuICBjb25zdCBzdHJlYW06IFN0cmVhbS5QYXNzVGhyb3VnaCAmIHsgZ2V0QnVmZmVyZWRWYWx1ZTogKCkgPT4gVDsgZ2V0QnVmZmVyZWRMZW5ndGg6ICgpID0+IG51bWJlciB9ID1cbiAgICBuZXcgU3RyZWFtLlBhc3NUaHJvdWdoKHsgb2JqZWN0TW9kZTogZmFsc2UgfSk7XG5cbiAgaWYgKGVuY29kaW5nICYmIGVuY29kaW5nICE9PSBcImJ1ZmZlclwiKSB7XG4gICAgc3RyZWFtLnNldEVuY29kaW5nKGVuY29kaW5nKTtcbiAgfVxuXG4gIGxldCBsZW5ndGggPSAwO1xuICBjb25zdCBjaHVua3M6IGFueVtdID0gW107XG5cbiAgc3RyZWFtLm9uKFwiZGF0YVwiLCAoY2h1bmspID0+IHtcbiAgICBjaHVua3MucHVzaChjaHVuayk7XG5cbiAgICBsZW5ndGggKz0gY2h1bmsubGVuZ3RoO1xuICB9KTtcblxuICBzdHJlYW0uZ2V0QnVmZmVyZWRWYWx1ZSA9ICgpID0+IHtcbiAgICByZXR1cm4gKGlzQnVmZmVyID8gQnVmZmVyLmNvbmNhdChjaHVua3MsIGxlbmd0aCkgOiBjaHVua3Muam9pbihcIlwiKSkgYXMgVDtcbiAgfTtcblxuICBzdHJlYW0uZ2V0QnVmZmVyZWRMZW5ndGggPSAoKSA9PiBsZW5ndGg7XG5cbiAgcmV0dXJuIHN0cmVhbTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3RyZWFtPFQgZXh0ZW5kcyBzdHJpbmcgfCBCdWZmZXI+KFxuICBpbnB1dFN0cmVhbTogU3RyZWFtLlJlYWRhYmxlLFxuICBvcHRpb25zOiB7IGVuY29kaW5nOiBCdWZmZXJFbmNvZGluZyB8IFwiYnVmZmVyXCIgfSxcbikge1xuICBjb25zdCBzdHJlYW0gPSBidWZmZXJTdHJlYW08VD4ob3B0aW9ucyk7XG5cbiAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHJlamVjdFByb21pc2UgPSAoZXJyb3I6IEVycm9yICYgeyBidWZmZXJlZERhdGE/OiBUIH0pID0+IHtcbiAgICAgIC8vIERvbid0IHJldHJpZXZlIGFuIG92ZXJzaXplZCBidWZmZXIuXG4gICAgICBpZiAoZXJyb3IgJiYgc3RyZWFtLmdldEJ1ZmZlcmVkTGVuZ3RoKCkgPD0gQnVmZmVyQ29uc3RhbnRzLk1BWF9MRU5HVEgpIHtcbiAgICAgICAgZXJyb3IuYnVmZmVyZWREYXRhID0gc3RyZWFtLmdldEJ1ZmZlcmVkVmFsdWUoKTtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICB9O1xuXG4gICAgKGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHByb21pc2lmeShTdHJlYW0ucGlwZWxpbmUpKGlucHV0U3RyZWFtLCBzdHJlYW0pO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZWplY3RQcm9taXNlKGVycm9yIGFzIGFueSk7XG4gICAgICB9XG4gICAgfSkoKTtcblxuICAgIHN0cmVhbS5vbihcImRhdGFcIiwgKCkgPT4ge1xuICAgICAgLy8gODBtYlxuICAgICAgaWYgKHN0cmVhbS5nZXRCdWZmZXJlZExlbmd0aCgpID4gMTAwMCAqIDEwMDAgKiA4MCkge1xuICAgICAgICByZWplY3RQcm9taXNlKG5ldyBNYXhCdWZmZXJFcnJvcigpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHN0cmVhbS5nZXRCdWZmZXJlZFZhbHVlKCk7XG59XG5cbi8vIE9uIGZhaWx1cmUsIGByZXN1bHQuc3Rkb3V0fHN0ZGVycmAgc2hvdWxkIGNvbnRhaW4gdGhlIGN1cnJlbnRseSBidWZmZXJlZCBzdHJlYW1cbmFzeW5jIGZ1bmN0aW9uIGdldEJ1ZmZlcmVkRGF0YTxUIGV4dGVuZHMgc3RyaW5nIHwgQnVmZmVyPihzdHJlYW06IFN0cmVhbS5SZWFkYWJsZSwgc3RyZWFtUHJvbWlzZTogUHJvbWlzZTxUPikge1xuICBzdHJlYW0uZGVzdHJveSgpO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IHN0cmVhbVByb21pc2U7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIChlcnJvciBhcyBhbnkgYXMgeyBidWZmZXJlZERhdGE6IFQgfSkuYnVmZmVyZWREYXRhO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTcGF3bmVkUmVzdWx0PFQgZXh0ZW5kcyBzdHJpbmcgfCBCdWZmZXI+KFxuICB7IHN0ZG91dCwgc3RkZXJyIH06IGNoaWxkUHJvY2Vzcy5DaGlsZFByb2Nlc3NXaXRob3V0TnVsbFN0cmVhbXMsXG4gIHsgZW5jb2RpbmcgfTogeyBlbmNvZGluZzogQnVmZmVyRW5jb2RpbmcgfCBcImJ1ZmZlclwiIH0sXG4gIHByb2Nlc3NEb25lOiBTcGF3bmVkUHJvbWlzZSxcbikge1xuICBjb25zdCBzdGRvdXRQcm9taXNlID0gZ2V0U3RyZWFtPFQ+KHN0ZG91dCwgeyBlbmNvZGluZyB9KTtcbiAgY29uc3Qgc3RkZXJyUHJvbWlzZSA9IGdldFN0cmVhbTxUPihzdGRlcnIsIHsgZW5jb2RpbmcgfSk7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoW3Byb2Nlc3NEb25lLCBzdGRvdXRQcm9taXNlLCBzdGRlcnJQcm9taXNlXSk7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAge1xuICAgICAgICBlcnJvcjogZXJyb3IgYXMgRXJyb3IsXG4gICAgICAgIGV4aXRDb2RlOiBudWxsLFxuICAgICAgICBzaWduYWw6IGVycm9yLnNpZ25hbCBhcyBOb2RlSlMuU2lnbmFscyB8IG51bGwsXG4gICAgICAgIHRpbWVkT3V0OiAoZXJyb3IudGltZWRPdXQgYXMgYm9vbGVhbikgfHwgZmFsc2UsXG4gICAgICB9LFxuICAgICAgZ2V0QnVmZmVyZWREYXRhKHN0ZG91dCwgc3Rkb3V0UHJvbWlzZSksXG4gICAgICBnZXRCdWZmZXJlZERhdGEoc3RkZXJyLCBzdGRlcnJQcm9taXNlKSxcbiAgICBdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdHJpcEZpbmFsTmV3bGluZTxUIGV4dGVuZHMgc3RyaW5nIHwgQnVmZmVyPihpbnB1dDogVCkge1xuICBjb25zdCBMRiA9IHR5cGVvZiBpbnB1dCA9PT0gXCJzdHJpbmdcIiA/IFwiXFxuXCIgOiBcIlxcblwiLmNoYXJDb2RlQXQoMCk7XG4gIGNvbnN0IENSID0gdHlwZW9mIGlucHV0ID09PSBcInN0cmluZ1wiID8gXCJcXHJcIiA6IFwiXFxyXCIuY2hhckNvZGVBdCgwKTtcblxuICBpZiAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMV0gPT09IExGKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB3ZSBhcmUgZG9pbmcgc29tZSBuYXN0eSBzdHVmZiBoZXJlXG4gICAgaW5wdXQgPSBpbnB1dC5zbGljZSgwLCAtMSk7XG4gIH1cblxuICBpZiAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMV0gPT09IENSKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB3ZSBhcmUgZG9pbmcgc29tZSBuYXN0eSBzdHVmZiBoZXJlXG4gICAgaW5wdXQgPSBpbnB1dC5zbGljZSgwLCAtMSk7XG4gIH1cblxuICByZXR1cm4gaW5wdXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVPdXRwdXQ8VCBleHRlbmRzIHN0cmluZyB8IEJ1ZmZlcj4ob3B0aW9uczogeyBzdHJpcEZpbmFsTmV3bGluZT86IGJvb2xlYW4gfSwgdmFsdWU6IFQpIHtcbiAgaWYgKG9wdGlvbnMuc3RyaXBGaW5hbE5ld2xpbmUpIHtcbiAgICByZXR1cm4gc3RyaXBGaW5hbE5ld2xpbmUodmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBnZXRFcnJvclByZWZpeCh7XG4gIHRpbWVkT3V0LFxuICB0aW1lb3V0LFxuICBzaWduYWwsXG4gIGV4aXRDb2RlLFxufToge1xuICBleGl0Q29kZTogbnVtYmVyIHwgbnVsbDtcbiAgc2lnbmFsOiBOb2RlSlMuU2lnbmFscyB8IG51bGw7XG4gIHRpbWVkT3V0OiBib29sZWFuO1xuICB0aW1lb3V0PzogbnVtYmVyO1xufSkge1xuICBpZiAodGltZWRPdXQpIHtcbiAgICByZXR1cm4gYHRpbWVkIG91dCBhZnRlciAke3RpbWVvdXR9IG1pbGxpc2Vjb25kc2A7XG4gIH1cblxuICBpZiAoc2lnbmFsICE9PSB1bmRlZmluZWQgJiYgc2lnbmFsICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIGB3YXMga2lsbGVkIHdpdGggJHtzaWduYWx9YDtcbiAgfVxuXG4gIGlmIChleGl0Q29kZSAhPT0gdW5kZWZpbmVkICYmIGV4aXRDb2RlICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIGBmYWlsZWQgd2l0aCBleGl0IGNvZGUgJHtleGl0Q29kZX1gO1xuICB9XG5cbiAgcmV0dXJuIFwiZmFpbGVkXCI7XG59XG5cbmZ1bmN0aW9uIG1ha2VFcnJvcih7XG4gIHN0ZG91dCxcbiAgc3RkZXJyLFxuICBlcnJvcixcbiAgc2lnbmFsLFxuICBleGl0Q29kZSxcbiAgY29tbWFuZCxcbiAgdGltZWRPdXQsXG4gIG9wdGlvbnMsXG4gIHBhcmVudEVycm9yLFxufToge1xuICBzdGRvdXQ6IHN0cmluZyB8IEJ1ZmZlcjtcbiAgc3RkZXJyOiBzdHJpbmcgfCBCdWZmZXI7XG4gIGVycm9yPzogRXJyb3I7XG4gIGV4aXRDb2RlOiBudW1iZXIgfCBudWxsO1xuICBzaWduYWw6IE5vZGVKUy5TaWduYWxzIHwgbnVsbDtcbiAgdGltZWRPdXQ6IGJvb2xlYW47XG4gIGNvbW1hbmQ6IHN0cmluZztcbiAgb3B0aW9ucz86IHsgdGltZW91dD86IG51bWJlciB9O1xuICBwYXJlbnRFcnJvcjogRXJyb3I7XG59KSB7XG4gIGNvbnN0IHByZWZpeCA9IGdldEVycm9yUHJlZml4KHsgdGltZWRPdXQsIHRpbWVvdXQ6IG9wdGlvbnM/LnRpbWVvdXQsIHNpZ25hbCwgZXhpdENvZGUgfSk7XG4gIGNvbnN0IGV4ZWNhTWVzc2FnZSA9IGBDb21tYW5kICR7cHJlZml4fTogJHtjb21tYW5kfWA7XG4gIGNvbnN0IHNob3J0TWVzc2FnZSA9IGVycm9yID8gYCR7ZXhlY2FNZXNzYWdlfVxcbiR7ZXJyb3IubWVzc2FnZX1gIDogZXhlY2FNZXNzYWdlO1xuICBjb25zdCBtZXNzYWdlID0gW3Nob3J0TWVzc2FnZSwgc3RkZXJyLCBzdGRvdXRdLmZpbHRlcihCb29sZWFuKS5qb2luKFwiXFxuXCIpO1xuXG4gIGlmIChlcnJvcikge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igbm90IG9uIEVycm9yXG4gICAgZXJyb3Iub3JpZ2luYWxNZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcbiAgfSBlbHNlIHtcbiAgICBlcnJvciA9IHBhcmVudEVycm9yO1xuICB9XG5cbiAgZXJyb3IubWVzc2FnZSA9IG1lc3NhZ2U7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBub3Qgb24gRXJyb3JcbiAgZXJyb3Iuc2hvcnRNZXNzYWdlID0gc2hvcnRNZXNzYWdlO1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIG5vdCBvbiBFcnJvclxuICBlcnJvci5jb21tYW5kID0gY29tbWFuZDtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBub3Qgb24gRXJyb3JcbiAgZXJyb3IuZXhpdENvZGUgPSBleGl0Q29kZTtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBub3Qgb24gRXJyb3JcbiAgZXJyb3Iuc2lnbmFsID0gc2lnbmFsO1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIG5vdCBvbiBFcnJvclxuICBlcnJvci5zdGRvdXQgPSBzdGRvdXQ7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3Igbm90IG9uIEVycm9yXG4gIGVycm9yLnN0ZGVyciA9IHN0ZGVycjtcblxuICBpZiAoXCJidWZmZXJlZERhdGFcIiBpbiBlcnJvcikge1xuICAgIGRlbGV0ZSBlcnJvcltcImJ1ZmZlcmVkRGF0YVwiXTtcbiAgfVxuXG4gIHJldHVybiBlcnJvcjtcbn1cblxuZXhwb3J0IHR5cGUgUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxcbiAgVCxcbiAgRGVjb2RlZE91dHB1dCBleHRlbmRzIHN0cmluZyB8IEJ1ZmZlciA9IHN0cmluZyB8IEJ1ZmZlcixcbiAgT3B0aW9ucyA9IHVua25vd24sXG4+ID0gKGFyZ3M6IHtcbiAgLyoqIFRoZSBvdXRwdXQgb2YgdGhlIHByb2Nlc3Mgb24gc3Rkb3V0LiAqL1xuICBzdGRvdXQ6IERlY29kZWRPdXRwdXQ7XG4gIC8qKiBUaGUgb3V0cHV0IG9mIHRoZSBwcm9jZXNzIG9uIHN0ZGVyci4gKi9cbiAgc3RkZXJyOiBEZWNvZGVkT3V0cHV0O1xuICBlcnJvcj86IEVycm9yO1xuICAvKiogVGhlIG51bWVyaWMgZXhpdCBjb2RlIG9mIHRoZSBwcm9jZXNzIHRoYXQgd2FzIHJ1bi4gKi9cbiAgZXhpdENvZGU6IG51bWJlciB8IG51bGw7XG4gIC8qKlxuICAgKiBUaGUgbmFtZSBvZiB0aGUgc2lnbmFsIHRoYXQgd2FzIHVzZWQgdG8gdGVybWluYXRlIHRoZSBwcm9jZXNzLiBGb3IgZXhhbXBsZSwgU0lHRlBFLlxuICAgKlxuICAgKiBJZiBhIHNpZ25hbCB0ZXJtaW5hdGVkIHRoZSBwcm9jZXNzLCB0aGlzIHByb3BlcnR5IGlzIGRlZmluZWQuIE90aGVyd2lzZSBpdCBpcyBudWxsLlxuICAgKi9cbiAgc2lnbmFsOiBOb2RlSlMuU2lnbmFscyB8IG51bGw7XG4gIC8qKiBXaGV0aGVyIHRoZSBwcm9jZXNzIHRpbWVkIG91dC4gKi9cbiAgdGltZWRPdXQ6IGJvb2xlYW47XG4gIC8qKiBUaGUgY29tbWFuZCB0aGF0IHdhcyBydW4sIGZvciBsb2dnaW5nIHB1cnBvc2VzLiAqL1xuICBjb21tYW5kOiBzdHJpbmc7XG4gIG9wdGlvbnM/OiBPcHRpb25zO1xufSkgPT4gVDtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRQYXJzaW5nPFQgZXh0ZW5kcyBzdHJpbmcgfCBCdWZmZXI+KHtcbiAgc3Rkb3V0LFxuICBzdGRlcnIsXG4gIGVycm9yLFxuICBleGl0Q29kZSxcbiAgc2lnbmFsLFxuICB0aW1lZE91dCxcbiAgY29tbWFuZCxcbiAgb3B0aW9ucyxcbiAgcGFyZW50RXJyb3IsXG59OiB7XG4gIHN0ZG91dDogVDtcbiAgc3RkZXJyOiBUO1xuICBlcnJvcj86IEVycm9yO1xuICBleGl0Q29kZTogbnVtYmVyIHwgbnVsbDtcbiAgc2lnbmFsOiBOb2RlSlMuU2lnbmFscyB8IG51bGw7XG4gIHRpbWVkT3V0OiBib29sZWFuO1xuICBjb21tYW5kOiBzdHJpbmc7XG4gIG9wdGlvbnM/OiB7IHRpbWVvdXQ/OiBudW1iZXIgfTtcbiAgcGFyZW50RXJyb3I6IEVycm9yO1xufSkge1xuICBpZiAoZXJyb3IgfHwgZXhpdENvZGUgIT09IDAgfHwgc2lnbmFsICE9PSBudWxsKSB7XG4gICAgY29uc3QgcmV0dXJuZWRFcnJvciA9IG1ha2VFcnJvcih7XG4gICAgICBlcnJvcixcbiAgICAgIGV4aXRDb2RlLFxuICAgICAgc2lnbmFsLFxuICAgICAgc3Rkb3V0LFxuICAgICAgc3RkZXJyLFxuICAgICAgY29tbWFuZCxcbiAgICAgIHRpbWVkT3V0LFxuICAgICAgb3B0aW9ucyxcbiAgICAgIHBhcmVudEVycm9yLFxuICAgIH0pO1xuXG4gICAgdGhyb3cgcmV0dXJuZWRFcnJvcjtcbiAgfVxuXG4gIHJldHVybiBzdGRvdXQ7XG59XG4iLCAiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50ICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXG4vLyBOb3RlOiBzaW5jZSBueWMgdXNlcyB0aGlzIG1vZHVsZSB0byBvdXRwdXQgY292ZXJhZ2UsIGFueSBsaW5lc1xuLy8gdGhhdCBhcmUgaW4gdGhlIGRpcmVjdCBzeW5jIGZsb3cgb2YgbnljJ3Mgb3V0cHV0Q292ZXJhZ2UgYXJlXG4vLyBpZ25vcmVkLCBzaW5jZSB3ZSBjYW4gbmV2ZXIgZ2V0IGNvdmVyYWdlIGZvciB0aGVtLlxuLy8gZ3JhYiBhIHJlZmVyZW5jZSB0byBub2RlJ3MgcmVhbCBwcm9jZXNzIG9iamVjdCByaWdodCBhd2F5XG5cbmNvbnN0IHByb2Nlc3NPayA9IChwcm9jZXNzOiBhbnkpID0+XG4gICEhcHJvY2VzcyAmJlxuICB0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJlxuICB0eXBlb2YgcHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9PT0gXCJmdW5jdGlvblwiICYmXG4gIHR5cGVvZiBwcm9jZXNzLmVtaXQgPT09IFwiZnVuY3Rpb25cIiAmJlxuICB0eXBlb2YgcHJvY2Vzcy5yZWFsbHlFeGl0ID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgdHlwZW9mIHByb2Nlc3MubGlzdGVuZXJzID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgdHlwZW9mIHByb2Nlc3Mua2lsbCA9PT0gXCJmdW5jdGlvblwiICYmXG4gIHR5cGVvZiBwcm9jZXNzLnBpZCA9PT0gXCJudW1iZXJcIiAmJlxuICB0eXBlb2YgcHJvY2Vzcy5vbiA9PT0gXCJmdW5jdGlvblwiO1xuY29uc3Qga0V4aXRFbWl0dGVyID0gLyogI19fUFVSRV9fICovIFN5bWJvbC5mb3IoXCJzaWduYWwtZXhpdCBlbWl0dGVyXCIpO1xuLy8gdGVlbnkgc3BlY2lhbCBwdXJwb3NlIGVlXG5jbGFzcyBFbWl0dGVyIHtcbiAgZW1pdHRlZCA9IHtcbiAgICBhZnRlckV4aXQ6IGZhbHNlLFxuICAgIGV4aXQ6IGZhbHNlLFxuICB9O1xuICBsaXN0ZW5lcnMgPSB7XG4gICAgYWZ0ZXJFeGl0OiBbXSxcbiAgICBleGl0OiBbXSxcbiAgfTtcbiAgY291bnQgPSAwO1xuICBpZCA9IE1hdGgucmFuZG9tKCk7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBpZiAoZ2xvYmFsW2tFeGl0RW1pdHRlcl0pIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBnbG9iYWxba0V4aXRFbWl0dGVyXTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGdsb2JhbCwga0V4aXRFbWl0dGVyLCB7XG4gICAgICB2YWx1ZTogdGhpcyxcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuICBvbihldjogYW55LCBmbjogYW55KSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHRoaXMubGlzdGVuZXJzW2V2XS5wdXNoKGZuKTtcbiAgfVxuICByZW1vdmVMaXN0ZW5lcihldjogYW55LCBmbjogYW55KSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IGxpc3QgPSB0aGlzLmxpc3RlbmVyc1tldl07XG4gICAgY29uc3QgaSA9IGxpc3QuaW5kZXhPZihmbik7XG4gICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8qIGM4IGlnbm9yZSBzdG9wICovXG4gICAgaWYgKGkgPT09IDAgJiYgbGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgfVxuICB9XG4gIGVtaXQoZXY6IGFueSwgY29kZTogYW55LCBzaWduYWw6IGFueSk6IGFueSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGlmICh0aGlzLmVtaXR0ZWRbZXZdKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICB0aGlzLmVtaXR0ZWRbZXZdID0gdHJ1ZTtcbiAgICBsZXQgcmV0ID0gZmFsc2U7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGZvciAoY29uc3QgZm4gb2YgdGhpcy5saXN0ZW5lcnNbZXZdKSB7XG4gICAgICByZXQgPSBmbihjb2RlLCBzaWduYWwpID09PSB0cnVlIHx8IHJldDtcbiAgICB9XG4gICAgaWYgKGV2ID09PSBcImV4aXRcIikge1xuICAgICAgcmV0ID0gdGhpcy5lbWl0KFwiYWZ0ZXJFeGl0XCIsIGNvZGUsIHNpZ25hbCkgfHwgcmV0O1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbmNsYXNzIFNpZ25hbEV4aXRGYWxsYmFjayB7XG4gIG9uRXhpdCgpIHtcbiAgICByZXR1cm4gKCkgPT4ge307XG4gIH1cbiAgbG9hZCgpIHt9XG4gIHVubG9hZCgpIHt9XG59XG5jbGFzcyBTaWduYWxFeGl0IHtcbiAgLy8gXCJTSUdIVVBcIiB0aHJvd3MgYW4gYEVOT1NZU2AgZXJyb3Igb24gV2luZG93cyxcbiAgLy8gc28gdXNlIGEgc3VwcG9ydGVkIHNpZ25hbCBpbnN0ZWFkXG4gIC8qIGM4IGlnbm9yZSBzdGFydCAqL1xuICAvLyBAdHMtaWdub3JlXG4gICNodXBTaWcgPSBwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCIgPyBcIlNJR0lOVFwiIDogXCJTSUdIVVBcIjtcbiAgLyogYzggaWdub3JlIHN0b3AgKi9cbiAgI2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAjcHJvY2VzczogYW55O1xuICAjb3JpZ2luYWxQcm9jZXNzRW1pdDogYW55O1xuICAjb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdDogYW55O1xuICAjc2lnTGlzdGVuZXJzID0ge307XG4gICNsb2FkZWQgPSBmYWxzZTtcbiAgI3NpZ25hbHM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0cnVjdG9yKHByb2Nlc3M6IGFueSkge1xuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgbm90IHRoZSBzZXQgb2YgYWxsIHBvc3NpYmxlIHNpZ25hbHMuXG4gICAgICpcbiAgICAgKiBJdCBJUywgaG93ZXZlciwgdGhlIHNldCBvZiBhbGwgc2lnbmFscyB0aGF0IHRyaWdnZXJcbiAgICAgKiBhbiBleGl0IG9uIGVpdGhlciBMaW51eCBvciBCU0Qgc3lzdGVtcy4gIExpbnV4IGlzIGFcbiAgICAgKiBzdXBlcnNldCBvZiB0aGUgc2lnbmFsIG5hbWVzIHN1cHBvcnRlZCBvbiBCU0QsIGFuZFxuICAgICAqIHRoZSB1bmtub3duIHNpZ25hbHMganVzdCBmYWlsIHRvIHJlZ2lzdGVyLCBzbyB3ZSBjYW5cbiAgICAgKiBjYXRjaCB0aGF0IGVhc2lseSBlbm91Z2guXG4gICAgICpcbiAgICAgKiBXaW5kb3dzIHNpZ25hbHMgYXJlIGEgZGlmZmVyZW50IHNldCwgc2luY2UgdGhlcmUgYXJlXG4gICAgICogc2lnbmFscyB0aGF0IHRlcm1pbmF0ZSBXaW5kb3dzIHByb2Nlc3NlcywgYnV0IGRvbid0XG4gICAgICogdGVybWluYXRlIChvciBkb24ndCBldmVuIGV4aXN0KSBvbiBQb3NpeCBzeXN0ZW1zLlxuICAgICAqXG4gICAgICogRG9uJ3QgYm90aGVyIHdpdGggU0lHS0lMTC4gIEl0J3MgdW5jYXRjaGFibGUsIHdoaWNoXG4gICAgICogbWVhbnMgdGhhdCB3ZSBjYW4ndCBmaXJlIGFueSBjYWxsYmFja3MgYW55d2F5LlxuICAgICAqXG4gICAgICogSWYgYSB1c2VyIGRvZXMgaGFwcGVuIHRvIHJlZ2lzdGVyIGEgaGFuZGxlciBvbiBhIG5vbi1cbiAgICAgKiBmYXRhbCBzaWduYWwgbGlrZSBTSUdXSU5DSCBvciBzb21ldGhpbmcsIGFuZCB0aGVuXG4gICAgICogZXhpdCwgaXQnbGwgZW5kIHVwIGZpcmluZyBgcHJvY2Vzcy5lbWl0KCdleGl0JylgLCBzb1xuICAgICAqIHRoZSBoYW5kbGVyIHdpbGwgYmUgZmlyZWQgYW55d2F5LlxuICAgICAqXG4gICAgICogU0lHQlVTLCBTSUdGUEUsIFNJR1NFR1YgYW5kIFNJR0lMTCwgd2hlbiBub3QgcmFpc2VkXG4gICAgICogYXJ0aWZpY2lhbGx5LCBpbmhlcmVudGx5IGxlYXZlIHRoZSBwcm9jZXNzIGluIGFcbiAgICAgKiBzdGF0ZSBmcm9tIHdoaWNoIGl0IGlzIG5vdCBzYWZlIHRvIHRyeSBhbmQgZW50ZXIgSlNcbiAgICAgKiBsaXN0ZW5lcnMuXG4gICAgICovXG4gICAgdGhpcy4jc2lnbmFscy5wdXNoKFwiU0lHSFVQXCIsIFwiU0lHSU5UXCIsIFwiU0lHVEVSTVwiKTtcbiAgICBpZiAoZ2xvYmFsVGhpcy5wcm9jZXNzLnBsYXRmb3JtICE9PSBcIndpbjMyXCIpIHtcbiAgICAgIHRoaXMuI3NpZ25hbHMucHVzaChcbiAgICAgICAgXCJTSUdBTFJNXCIsXG4gICAgICAgIFwiU0lHQUJSVFwiLFxuICAgICAgICBcIlNJR1ZUQUxSTVwiLFxuICAgICAgICBcIlNJR1hDUFVcIixcbiAgICAgICAgXCJTSUdYRlNaXCIsXG4gICAgICAgIFwiU0lHVVNSMlwiLFxuICAgICAgICBcIlNJR1RSQVBcIixcbiAgICAgICAgXCJTSUdTWVNcIixcbiAgICAgICAgXCJTSUdRVUlUXCIsXG4gICAgICAgIFwiU0lHSU9UXCIsXG4gICAgICAgIC8vIHNob3VsZCBkZXRlY3QgcHJvZmlsZXIgYW5kIGVuYWJsZS9kaXNhYmxlIGFjY29yZGluZ2x5LlxuICAgICAgICAvLyBzZWUgIzIxXG4gICAgICAgIC8vICdTSUdQUk9GJ1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGdsb2JhbFRoaXMucHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJsaW51eFwiKSB7XG4gICAgICB0aGlzLiNzaWduYWxzLnB1c2goXCJTSUdJT1wiLCBcIlNJR1BPTExcIiwgXCJTSUdQV1JcIiwgXCJTSUdTVEtGTFRcIik7XG4gICAgfVxuICAgIHRoaXMuI3Byb2Nlc3MgPSBwcm9jZXNzO1xuICAgIC8vIHsgPHNpZ25hbD46IDxsaXN0ZW5lciBmbj4sIC4uLiB9XG4gICAgdGhpcy4jc2lnTGlzdGVuZXJzID0ge307XG4gICAgZm9yIChjb25zdCBzaWcgb2YgdGhpcy4jc2lnbmFscykge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGhpcy4jc2lnTGlzdGVuZXJzW3NpZ10gPSAoKSA9PiB7XG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBvdGhlciBsaXN0ZW5lcnMsIGFuIGV4aXQgaXMgY29taW5nIVxuICAgICAgICAvLyBTaW1wbGVzdCB3YXk6IHJlbW92ZSB1cyBhbmQgdGhlbiByZS1zZW5kIHRoZSBzaWduYWwuXG4gICAgICAgIC8vIFdlIGtub3cgdGhhdCB0aGlzIHdpbGwga2lsbCB0aGUgcHJvY2Vzcywgc28gd2UgY2FuXG4gICAgICAgIC8vIHNhZmVseSBlbWl0IG5vdy5cbiAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy4jcHJvY2Vzcy5saXN0ZW5lcnMoc2lnKTtcbiAgICAgICAgbGV0IHsgY291bnQgfSA9IHRoaXMuI2VtaXR0ZXI7XG4gICAgICAgIC8vIFRoaXMgaXMgYSB3b3JrYXJvdW5kIGZvciB0aGUgZmFjdCB0aGF0IHNpZ25hbC1leGl0IHYzIGFuZCBzaWduYWxcbiAgICAgICAgLy8gZXhpdCB2NCBhcmUgbm90IGF3YXJlIG9mIGVhY2ggb3RoZXIsIGFuZCBlYWNoIHdpbGwgYXR0ZW1wdCB0byBsZXRcbiAgICAgICAgLy8gdGhlIG90aGVyIGhhbmRsZSBpdCwgc28gbmVpdGhlciBvZiB0aGVtIGRvLiBUbyBjb3JyZWN0IHRoaXMsIHdlXG4gICAgICAgIC8vIGRldGVjdCBpZiB3ZSdyZSB0aGUgb25seSBoYW5kbGVyICpleGNlcHQqIGZvciBwcmV2aW91cyB2ZXJzaW9uc1xuICAgICAgICAvLyBvZiBzaWduYWwtZXhpdCwgYW5kIGluY3JlbWVudCBieSB0aGUgY291bnQgb2YgbGlzdGVuZXJzIGl0IGhhc1xuICAgICAgICAvLyBjcmVhdGVkLlxuICAgICAgICAvKiBjOCBpZ25vcmUgc3RhcnQgKi9cbiAgICAgICAgY29uc3QgcCA9IHByb2Nlc3M7XG4gICAgICAgIGlmICh0eXBlb2YgcC5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfXyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcC5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfXy5jb3VudCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgIGNvdW50ICs9IHAuX19zaWduYWxfZXhpdF9lbWl0dGVyX18uY291bnQ7XG4gICAgICAgIH1cbiAgICAgICAgLyogYzggaWdub3JlIHN0b3AgKi9cbiAgICAgICAgaWYgKGxpc3RlbmVycy5sZW5ndGggPT09IGNvdW50KSB7XG4gICAgICAgICAgdGhpcy51bmxvYWQoKTtcbiAgICAgICAgICBjb25zdCByZXQgPSB0aGlzLiNlbWl0dGVyLmVtaXQoXCJleGl0XCIsIG51bGwsIHNpZyk7XG4gICAgICAgICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgICAgICAgY29uc3QgcyA9IHNpZyA9PT0gXCJTSUdIVVBcIiA/IHRoaXMuI2h1cFNpZyA6IHNpZztcbiAgICAgICAgICBpZiAoIXJldCkgcHJvY2Vzcy5raWxsKHByb2Nlc3MucGlkLCBzKTtcbiAgICAgICAgICAvKiBjOCBpZ25vcmUgc3RvcCAqL1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgICB0aGlzLiNvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0ID0gcHJvY2Vzcy5yZWFsbHlFeGl0O1xuICAgIHRoaXMuI29yaWdpbmFsUHJvY2Vzc0VtaXQgPSBwcm9jZXNzLmVtaXQ7XG4gIH1cbiAgb25FeGl0KGNiOiBhbnksIG9wdHM6IGFueSkge1xuICAgIC8qIGM4IGlnbm9yZSBzdGFydCAqL1xuICAgIGlmICghcHJvY2Vzc09rKHRoaXMuI3Byb2Nlc3MpKSB7XG4gICAgICByZXR1cm4gKCkgPT4ge307XG4gICAgfVxuICAgIC8qIGM4IGlnbm9yZSBzdG9wICovXG4gICAgaWYgKHRoaXMuI2xvYWRlZCA9PT0gZmFsc2UpIHtcbiAgICAgIHRoaXMubG9hZCgpO1xuICAgIH1cbiAgICBjb25zdCBldiA9IG9wdHM/LmFsd2F5c0xhc3QgPyBcImFmdGVyRXhpdFwiIDogXCJleGl0XCI7XG4gICAgdGhpcy4jZW1pdHRlci5vbihldiwgY2IpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB0aGlzLiNlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKGV2LCBjYik7XG4gICAgICBpZiAodGhpcy4jZW1pdHRlci5saXN0ZW5lcnNbXCJleGl0XCJdLmxlbmd0aCA9PT0gMCAmJiB0aGlzLiNlbWl0dGVyLmxpc3RlbmVyc1tcImFmdGVyRXhpdFwiXS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy51bmxvYWQoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGxvYWQoKSB7XG4gICAgaWYgKHRoaXMuI2xvYWRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiNsb2FkZWQgPSB0cnVlO1xuICAgIC8vIFRoaXMgaXMgdGhlIG51bWJlciBvZiBvblNpZ25hbEV4aXQncyB0aGF0IGFyZSBpbiBwbGF5LlxuICAgIC8vIEl0J3MgaW1wb3J0YW50IHNvIHRoYXQgd2UgY2FuIGNvdW50IHRoZSBjb3JyZWN0IG51bWJlciBvZlxuICAgIC8vIGxpc3RlbmVycyBvbiBzaWduYWxzLCBhbmQgZG9uJ3Qgd2FpdCBmb3IgdGhlIG90aGVyIG9uZSB0b1xuICAgIC8vIGhhbmRsZSBpdCBpbnN0ZWFkIG9mIHVzLlxuICAgIHRoaXMuI2VtaXR0ZXIuY291bnQgKz0gMTtcbiAgICBmb3IgKGNvbnN0IHNpZyBvZiB0aGlzLiNzaWduYWxzKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNvbnN0IGZuID0gdGhpcy4jc2lnTGlzdGVuZXJzW3NpZ107XG4gICAgICAgIGlmIChmbikgdGhpcy4jcHJvY2Vzcy5vbihzaWcsIGZuKTtcbiAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgLy8gbm8tb3BcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy4jcHJvY2Vzcy5lbWl0ID0gKGV2OiBhbnksIC4uLmE6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuI3Byb2Nlc3NFbWl0KGV2LCAuLi5hKTtcbiAgICB9O1xuICAgIHRoaXMuI3Byb2Nlc3MucmVhbGx5RXhpdCA9IChjb2RlOiBhbnkpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLiNwcm9jZXNzUmVhbGx5RXhpdChjb2RlKTtcbiAgICB9O1xuICB9XG4gIHVubG9hZCgpIHtcbiAgICBpZiAoIXRoaXMuI2xvYWRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiNsb2FkZWQgPSBmYWxzZTtcbiAgICB0aGlzLiNzaWduYWxzLmZvckVhY2goKHNpZykgPT4ge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLiNzaWdMaXN0ZW5lcnNbc2lnXTtcbiAgICAgIC8qIGM4IGlnbm9yZSBzdGFydCAqL1xuICAgICAgaWYgKCFsaXN0ZW5lcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMaXN0ZW5lciBub3QgZGVmaW5lZCBmb3Igc2lnbmFsOiBcIiArIHNpZyk7XG4gICAgICB9XG4gICAgICAvKiBjOCBpZ25vcmUgc3RvcCAqL1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy4jcHJvY2Vzcy5yZW1vdmVMaXN0ZW5lcihzaWcsIGxpc3RlbmVyKTtcbiAgICAgICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIC8vIG5vLW9wXG4gICAgICB9XG4gICAgICAvKiBjOCBpZ25vcmUgc3RvcCAqL1xuICAgIH0pO1xuICAgIHRoaXMuI3Byb2Nlc3MuZW1pdCA9IHRoaXMuI29yaWdpbmFsUHJvY2Vzc0VtaXQ7XG4gICAgdGhpcy4jcHJvY2Vzcy5yZWFsbHlFeGl0ID0gdGhpcy4jb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdDtcbiAgICB0aGlzLiNlbWl0dGVyLmNvdW50IC09IDE7XG4gIH1cbiAgI3Byb2Nlc3NSZWFsbHlFeGl0KGNvZGU6IGFueSkge1xuICAgIC8qIGM4IGlnbm9yZSBzdGFydCAqL1xuICAgIGlmICghcHJvY2Vzc09rKHRoaXMuI3Byb2Nlc3MpKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgdGhpcy4jcHJvY2Vzcy5leGl0Q29kZSA9IGNvZGUgfHwgMDtcbiAgICAvKiBjOCBpZ25vcmUgc3RvcCAqL1xuICAgIHRoaXMuI2VtaXR0ZXIuZW1pdChcImV4aXRcIiwgdGhpcy4jcHJvY2Vzcy5leGl0Q29kZSwgbnVsbCk7XG4gICAgcmV0dXJuIHRoaXMuI29yaWdpbmFsUHJvY2Vzc1JlYWxseUV4aXQuY2FsbCh0aGlzLiNwcm9jZXNzLCB0aGlzLiNwcm9jZXNzLmV4aXRDb2RlKTtcbiAgfVxuICAjcHJvY2Vzc0VtaXQoZXY6IGFueSwgLi4uYXJnczogYW55KSB7XG4gICAgY29uc3Qgb2cgPSB0aGlzLiNvcmlnaW5hbFByb2Nlc3NFbWl0O1xuICAgIGlmIChldiA9PT0gXCJleGl0XCIgJiYgcHJvY2Vzc09rKHRoaXMuI3Byb2Nlc3MpKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgdGhpcy4jcHJvY2Vzcy5leGl0Q29kZSA9IGFyZ3NbMF07XG4gICAgICAgIC8qIGM4IGlnbm9yZSBzdGFydCAqL1xuICAgICAgfVxuICAgICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgICBjb25zdCByZXQgPSBvZy5jYWxsKHRoaXMuI3Byb2Nlc3MsIGV2LCAuLi5hcmdzKTtcbiAgICAgIC8qIGM4IGlnbm9yZSBzdGFydCAqL1xuICAgICAgdGhpcy4jZW1pdHRlci5lbWl0KFwiZXhpdFwiLCB0aGlzLiNwcm9jZXNzLmV4aXRDb2RlLCBudWxsKTtcbiAgICAgIC8qIGM4IGlnbm9yZSBzdG9wICovXG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2cuY2FsbCh0aGlzLiNwcm9jZXNzLCBldiwgLi4uYXJncyk7XG4gICAgfVxuICB9XG59XG5cbmxldCBzaWduYWxFeGl0OiBTaWduYWxFeGl0IHwgU2lnbmFsRXhpdEZhbGxiYWNrIHwgbnVsbCA9IG51bGw7XG5cbmV4cG9ydCBjb25zdCBvbkV4aXQgPSAoXG4gIGNiOiBhbnksXG4gIG9wdHM/OiB7XG4gICAgYWx3YXlzTGFzdD86IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gIH0sXG4pID0+IHtcbiAgaWYgKCFzaWduYWxFeGl0KSB7XG4gICAgc2lnbmFsRXhpdCA9IHByb2Nlc3NPayhwcm9jZXNzKSA/IG5ldyBTaWduYWxFeGl0KHByb2Nlc3MpIDogbmV3IFNpZ25hbEV4aXRGYWxsYmFjaygpO1xuICB9XG4gIHJldHVybiBzaWduYWxFeGl0Lm9uRXhpdChjYiwgb3B0cyk7XG59O1xuIiwgImltcG9ydCB7IGVudmlyb25tZW50IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgY3JlYXRlUmVhZFN0cmVhbSwgY3JlYXRlV3JpdGVTdHJlYW0sIG1rZGlyU3luYywgU3RhdHMgfSBmcm9tIFwibm9kZTpmc1wiO1xuaW1wb3J0IHsgc3RhdCB9IGZyb20gXCJub2RlOmZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyBqb2luLCBub3JtYWxpemUgfSBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBwaXBlbGluZSB9IGZyb20gXCJub2RlOnN0cmVhbS9wcm9taXNlc1wiO1xuaW1wb3J0IHsgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgQ2hhaW4gZnJvbSBcIi4vdmVuZG9ycy9zdHJlYW0tY2hhaW5cIjtcbmltcG9ydCB7IHBhcnNlciwgUGlja1BhcnNlciwgU3RyZWFtQXJyYXkgfSBmcm9tIFwiLi92ZW5kb3JzL3N0cmVhbS1qc29uXCI7XG5pbXBvcnQgeyBpc0pTT04gfSBmcm9tIFwiLi9mZXRjaC11dGlsc1wiO1xuaW1wb3J0IHsgRmxhdHRlbiwgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLCBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBDYWNoZWRQcm9taXNlT3B0aW9ucywgdXNlQ2FjaGVkUHJvbWlzZSB9IGZyb20gXCIuL3VzZUNhY2hlZFByb21pc2VcIjtcbmltcG9ydCB7IGhhc2ggfSBmcm9tIFwiLi9oZWxwZXJzXCI7XG5cbnR5cGUgUmVxdWVzdEluZm8gPSBzdHJpbmcgfCBVUkwgfCBnbG9iYWxUaGlzLlJlcXVlc3Q7XG5cbmFzeW5jIGZ1bmN0aW9uIGNhY2hlKHVybDogUmVxdWVzdEluZm8sIGRlc3RpbmF0aW9uOiBzdHJpbmcsIGZldGNoT3B0aW9ucz86IFJlcXVlc3RJbml0KSB7XG4gIGlmICh0eXBlb2YgdXJsID09PSBcIm9iamVjdFwiIHx8IHVybC5zdGFydHNXaXRoKFwiaHR0cDovL1wiKSB8fCB1cmwuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpKSB7XG4gICAgcmV0dXJuIGF3YWl0IGNhY2hlVVJMKHVybCwgZGVzdGluYXRpb24sIGZldGNoT3B0aW9ucyk7XG4gIH0gZWxzZSBpZiAodXJsLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKSB7XG4gICAgcmV0dXJuIGF3YWl0IGNhY2hlRmlsZShcbiAgICAgIG5vcm1hbGl6ZShkZWNvZGVVUklDb21wb25lbnQobmV3IFVSTCh1cmwpLnBhdGhuYW1lKSksXG4gICAgICBkZXN0aW5hdGlvbixcbiAgICAgIGZldGNoT3B0aW9ucz8uc2lnbmFsID8gZmV0Y2hPcHRpb25zLnNpZ25hbCA6IHVuZGVmaW5lZCxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk9ubHkgSFRUUChTKSBvciBmaWxlIFVSTHMgYXJlIHN1cHBvcnRlZFwiKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBjYWNoZVVSTCh1cmw6IFJlcXVlc3RJbmZvLCBkZXN0aW5hdGlvbjogc3RyaW5nLCBmZXRjaE9wdGlvbnM/OiBSZXF1ZXN0SW5pdCkge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgZmV0Y2hPcHRpb25zKTtcblxuICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGZldGNoIFVSTFwiKTtcbiAgfVxuXG4gIGlmICghaXNKU09OKHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiY29udGVudC10eXBlXCIpKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVSTCBkb2VzIG5vdCByZXR1cm4gSlNPTlwiKTtcbiAgfVxuICBpZiAoIXJlc3BvbnNlLmJvZHkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gcmV0cmlldmUgZXhwZWN0ZWQgSlNPTiBjb250ZW50OiBSZXNwb25zZSBib2R5IGlzIG1pc3Npbmcgb3IgaW5hY2Nlc3NpYmxlLlwiKTtcbiAgfVxuICBhd2FpdCBwaXBlbGluZShcbiAgICByZXNwb25zZS5ib2R5IGFzIHVua25vd24gYXMgTm9kZUpTLlJlYWRhYmxlU3RyZWFtLFxuICAgIGNyZWF0ZVdyaXRlU3RyZWFtKGRlc3RpbmF0aW9uKSxcbiAgICBmZXRjaE9wdGlvbnM/LnNpZ25hbCA/IHsgc2lnbmFsOiBmZXRjaE9wdGlvbnMuc2lnbmFsIH0gOiB1bmRlZmluZWQsXG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhY2hlRmlsZShzb3VyY2U6IHN0cmluZywgZGVzdGluYXRpb246IHN0cmluZywgYWJvcnRTaWduYWw/OiBBYm9ydFNpZ25hbCkge1xuICBhd2FpdCBwaXBlbGluZShcbiAgICBjcmVhdGVSZWFkU3RyZWFtKHNvdXJjZSksXG4gICAgY3JlYXRlV3JpdGVTdHJlYW0oZGVzdGluYXRpb24pLFxuICAgIGFib3J0U2lnbmFsID8geyBzaWduYWw6IGFib3J0U2lnbmFsIH0gOiB1bmRlZmluZWQsXG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhY2hlVVJMSWZOZWNlc3NhcnkoXG4gIHVybDogUmVxdWVzdEluZm8sXG4gIGZvbGRlcjogc3RyaW5nLFxuICBmaWxlTmFtZTogc3RyaW5nLFxuICBmb3JjZVVwZGF0ZTogYm9vbGVhbixcbiAgZmV0Y2hPcHRpb25zPzogUmVxdWVzdEluaXQsXG4pIHtcbiAgY29uc3QgZGVzdGluYXRpb24gPSBqb2luKGZvbGRlciwgZmlsZU5hbWUpO1xuXG4gIHRyeSB7XG4gICAgYXdhaXQgc3RhdChmb2xkZXIpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbWtkaXJTeW5jKGZvbGRlciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgYXdhaXQgY2FjaGUodXJsLCBkZXN0aW5hdGlvbiwgZmV0Y2hPcHRpb25zKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGZvcmNlVXBkYXRlKSB7XG4gICAgYXdhaXQgY2FjaGUodXJsLCBkZXN0aW5hdGlvbiwgZmV0Y2hPcHRpb25zKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgc3RhdHM6IFN0YXRzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICB0cnkge1xuICAgIHN0YXRzID0gYXdhaXQgc3RhdChkZXN0aW5hdGlvbik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBhd2FpdCBjYWNoZSh1cmwsIGRlc3RpbmF0aW9uLCBmZXRjaE9wdGlvbnMpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdXJsID09PSBcIm9iamVjdFwiIHx8IHVybC5zdGFydHNXaXRoKFwiaHR0cDovL1wiKSB8fCB1cmwuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpKSB7XG4gICAgY29uc3QgaGVhZFJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7IC4uLmZldGNoT3B0aW9ucywgbWV0aG9kOiBcIkhFQURcIiB9KTtcbiAgICBpZiAoIWhlYWRSZXNwb25zZS5vaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGZldGNoIFVSTFwiKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzSlNPTihoZWFkUmVzcG9uc2UuaGVhZGVycy5nZXQoXCJjb250ZW50LXR5cGVcIikpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVUkwgZG9lcyBub3QgcmV0dXJuIEpTT05cIik7XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdE1vZGlmaWVkID0gRGF0ZS5wYXJzZShoZWFkUmVzcG9uc2UuaGVhZGVycy5nZXQoXCJsYXN0LW1vZGlmaWVkXCIpID8/IFwiXCIpO1xuICAgIGlmIChzdGF0cy5zaXplID09PSAwIHx8IE51bWJlci5pc05hTihsYXN0TW9kaWZpZWQpIHx8IGxhc3RNb2RpZmllZCA+IHN0YXRzLm10aW1lTXMpIHtcbiAgICAgIGF3YWl0IGNhY2hlKHVybCwgZGVzdGluYXRpb24sIGZldGNoT3B0aW9ucyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9IGVsc2UgaWYgKHVybC5zdGFydHNXaXRoKFwiZmlsZTovL1wiKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzb3VyY2VTdGF0cyA9IGF3YWl0IHN0YXQobm9ybWFsaXplKGRlY29kZVVSSUNvbXBvbmVudChuZXcgVVJMKHVybCkucGF0aG5hbWUpKSk7XG4gICAgICBpZiAoc291cmNlU3RhdHMubXRpbWVNcyA+IHN0YXRzLm10aW1lTXMpIHtcbiAgICAgICAgYXdhaXQgY2FjaGUodXJsLCBkZXN0aW5hdGlvbiwgZmV0Y2hPcHRpb25zKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VyY2UgZmlsZSBjb3VsZCBub3QgYmUgcmVhZFwiKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiT25seSBIVFRQKFMpIG9yIGZpbGUgVVJMcyBhcmUgc3VwcG9ydGVkXCIpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uKiBzdHJlYW1Kc29uRmlsZTxUPihcbiAgZmlsZVBhdGg6IHN0cmluZyxcbiAgcGFnZVNpemU6IG51bWJlcixcbiAgYWJvcnRTaWduYWw/OiBBYm9ydFNpZ25hbCxcbiAgZGF0YVBhdGg/OiBzdHJpbmcgfCBSZWdFeHAsXG4gIGZpbHRlckZuPzogKGl0ZW06IEZsYXR0ZW48VD4pID0+IGJvb2xlYW4sXG4gIHRyYW5zZm9ybUZuPzogKGl0ZW06IGFueSkgPT4gVCxcbik6IEFzeW5jR2VuZXJhdG9yPFQgZXh0ZW5kcyB1bmtub3duW10gPyBUIDogVFtdPiB7XG4gIGxldCBwYWdlOiBUIGV4dGVuZHMgdW5rbm93bltdID8gVCA6IFRbXSA9IFtdIGFzIFQgZXh0ZW5kcyB1bmtub3duW10gPyBUIDogVFtdO1xuXG4gIGNvbnN0IHBpcGVsaW5lID0gQ2hhaW4oW1xuICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZVBhdGgpLFxuICAgIGRhdGFQYXRoID8gUGlja1BhcnNlcih7IGZpbHRlcjogZGF0YVBhdGggfSkgOiBwYXJzZXIoKSxcbiAgICBTdHJlYW1BcnJheSgpLFxuICAgIChkYXRhOiBhbnkpID0+IHRyYW5zZm9ybUZuPy4oZGF0YS52YWx1ZSkgPz8gZGF0YS52YWx1ZSxcbiAgXSk7XG5cbiAgYWJvcnRTaWduYWw/LmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCAoKSA9PiB7XG4gICAgcGlwZWxpbmUuZGVzdHJveSgpO1xuICB9KTtcblxuICB0cnkge1xuICAgIGZvciBhd2FpdCAoY29uc3QgZGF0YSBvZiBwaXBlbGluZSkge1xuICAgICAgaWYgKGFib3J0U2lnbmFsPy5hYm9ydGVkKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIGlmICghZmlsdGVyRm4gfHwgZmlsdGVyRm4oZGF0YSkpIHtcbiAgICAgICAgcGFnZS5wdXNoKGRhdGEpO1xuICAgICAgfVxuICAgICAgaWYgKHBhZ2UubGVuZ3RoID49IHBhZ2VTaXplKSB7XG4gICAgICAgIHlpZWxkIHBhZ2U7XG4gICAgICAgIHBhZ2UgPSBbXSBhcyBUIGV4dGVuZHMgdW5rbm93bltdID8gVCA6IFRbXTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBwaXBlbGluZS5kZXN0cm95KCk7XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIGlmIChwYWdlLmxlbmd0aCA+IDApIHtcbiAgICB5aWVsZCBwYWdlO1xuICB9XG5cbiAgcmV0dXJuIFtdO1xufVxuXG50eXBlIE9wdGlvbnM8VD4gPSB7XG4gIC8qKlxuICAgKiBUaGUgaG9vayBleHBlY3RzIHRvIGl0ZXJhdGUgdGhyb3VnaCBhbiBhcnJheSBvZiBkYXRhLCBzbyBieSBkZWZhdWx0LCBpdCBhc3N1bWVzIHRoZSBKU09OIGl0IHJlY2VpdmVzIGl0c2VsZiByZXByZXNlbnRzIGFuIGFycmF5LiBIb3dldmVyLCBzb21ldGltZXMgdGhlIGFycmF5IG9mIGRhdGEgaXMgd3JhcHBlZCBpbiBhbiBvYmplY3QsXG4gICAqIGkuZS4gYHsgXCJzdWNjZXNzXCI6IHRydWUsIFwiZGF0YVwiOiBb4oCmXSB9YCwgb3IgZXZlbiBgeyBcInN1Y2Nlc3NcIjogdHJ1ZSwgXCJyZXN1bHRzXCI6IHsgXCJkYXRhXCI6IFvigKZdIH0gfWAuIEluIHRob3NlIGNhc2VzLCB5b3UgY2FuIHVzZSBgZGF0YVBhdGhgIHRvIHNwZWNpZnkgd2hlcmUgdGhlIGRhdGEgYXJyYXkgY2FuIGJlIGZvdW5kLlxuICAgKlxuICAgKiBAcmVtYXJrIElmIHlvdXIgSlNPTiBvYmplY3QgaGFzIG11bHRpcGxlIGFycmF5cyB0aGF0IHlvdSB3YW50IHRvIHN0cmVhbSBkYXRhIGZyb20sIHlvdSBjYW4gcGFzcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBzdHJlYW0gdGhyb3VnaCBhbGwgb2YgdGhlbS5cbiAgICpcbiAgICogQGV4YW1wbGUgRm9yIGB7IFwic3VjY2Vzc1wiOiB0cnVlLCBcImRhdGFcIjogW+KApl0gfWAsIGRhdGFQYXRoIHdvdWxkIGJlIGBkYXRhYFxuICAgKiBAZXhhbXBsZSBGb3IgYHsgXCJzdWNjZXNzXCI6IHRydWUsIFwicmVzdWx0c1wiOiB7IFwiZGF0YVwiOiBb4oCmXSB9IH1gLCBkYXRhUGF0aCB3b3VsZCBiZSBgcmVzdWx0cy5kYXRhYFxuICAgKiBAZXhhbXBsZSBGb3IgYHsgXCJzdWNjZXNzXCI6IHRydWUsIFwicmVzdWx0c1wiOiB7IFwiZmlyc3RfbGlzdFwiOiBb4oCmXSwgXCJzZWNvbmRfbGlzdFwiOiBb4oCmXSwgXCJ0aGlyZF9saXN0XCI6IFvigKZdIH0gfWAsIGRhdGFQYXRoIHdvdWxkIGJlIGAvXnJlc3VsdHNcXC4oZmlyc3RfbGlzdHxzZWNvbmRfbGlzdHx0aGlyZF9saXN0KSRcbi9gLlxuICAgKi9cbiAgZGF0YVBhdGg/OiBzdHJpbmcgfCBSZWdFeHA7XG4gIC8qKlxuICAgKiBBIGZ1bmN0aW9uIHRvIGRlY2lkZSB3aGV0aGVyIGEgcGFydGljdWxhciBpdGVtIHNob3VsZCBiZSBrZXB0IG9yIG5vdC5cbiAgICogRGVmYXVsdHMgdG8gYHVuZGVmaW5lZGAsIGtlZXBpbmcgYW55IGVuY291bnRlcmVkIGl0ZW0uXG4gICAqXG4gICAqIEByZW1hcmsgVGhlIGhvb2sgd2lsbCByZXZhbGlkYXRlIGV2ZXJ5IHRpbWUgdGhlIGZpbHRlciBmdW5jdGlvbiBjaGFuZ2VzLCBzbyB5b3UgbmVlZCB0byB1c2UgW3VzZUNhbGxiYWNrXShodHRwczovL3JlYWN0LmRldi9yZWZlcmVuY2UvcmVhY3QvdXNlQ2FsbGJhY2spIHRvIG1ha2Ugc3VyZSBpdCBvbmx5IGNoYW5nZXMgd2hlbiBpdCBuZWVkcyB0by5cbiAgICovXG4gIGZpbHRlcj86IChpdGVtOiBGbGF0dGVuPFQ+KSA9PiBib29sZWFuO1xuICAvKipcbiAgICogQSBmdW5jdGlvbiB0byBhcHBseSB0byBlYWNoIGl0ZW0gYXMgaXQgaXMgZW5jb3VudGVyZWQuIFVzZWZ1bCBmb3IgYSBjb3VwbGUgb2YgdGhpbmdzOlxuICAgKiAxLiBlbnN1cmluZyB0aGF0IGFsbCBpdGVtcyBoYXZlIHRoZSBleHBlY3RlZCBwcm9wZXJ0aWVzLCBhbmQsIGFzIG9uIG9wdGltaXphdGlvbiwgZm9yIGdldHRpbmcgcmlkIG9mIHRoZSBwcm9wZXJ0aWVzIHRoYXQgeW91IGRvbid0IGNhcmUgYWJvdXQuXG4gICAqIDIuIHdoZW4gdG9wLWxldmVsIG9iamVjdHMgYWN0dWFsbHkgcmVwcmVzZW50IG5lc3RlZCBkYXRhLCB3aGljaCBzaG91bGQgYmUgZmxhdHRlbmVkLiBJbiB0aGlzIGNhc2UsIGB0cmFuc2Zvcm1gIGNhbiByZXR1cm4gYW4gYXJyYXkgb2YgaXRlbXMsIGFuZCB0aGUgaG9vayB3aWxsIHN0cmVhbSB0aHJvdWdoIGVhY2ggb25lIG9mIHRob3NlIGl0ZW1zLFxuICAgKiBwYXNzaW5nIHRoZW0gdG8gYGZpbHRlcmAgZXRjLlxuICAgKlxuICAgKiBEZWZhdWx0cyB0byBhIHBhc3N0aHJvdWdoIGZ1bmN0aW9uIGlmIG5vdCBwcm92aWRlZC5cbiAgICpcbiAgICogQHJlbWFyayBUaGUgaG9vayB3aWxsIHJldmFsaWRhdGUgZXZlcnkgdGltZSB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIGNoYW5nZXMsIHNvIGl0IGlzIGltcG9ydGFudCB0byB1c2UgW3VzZUNhbGxiYWNrXShodHRwczovL3JlYWN0LmRldi9yZWZlcmVuY2UvcmVhY3QvdXNlQ2FsbGJhY2spIHRvIGVuc3VyZSBpdCBvbmx5IGNoYW5nZXMgd2hlbiBuZWNlc3NhcnkgdG8gcHJldmVudCB1bm5lY2Vzc2FyeSByZS1yZW5kZXJzIG9yIGNvbXB1dGF0aW9ucy5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgXG4gICAqIC8vIEZvciBkYXRhOiBgeyBcImRhdGFcIjogWyB7IFwidHlwZVwiOiBcImZvbGRlclwiLCBcIm5hbWVcIjogXCJpdGVtIDFcIiwgXCJjaGlsZHJlblwiOiBbIHsgXCJ0eXBlXCI6IFwiaXRlbVwiLCBcIm5hbWVcIjogXCJpdGVtIDJcIiB9LCB7IFwidHlwZVwiOiBcIml0ZW1cIiwgXCJuYW1lXCI6IFwiaXRlbSAzXCIgfSBdIH0sIHsgXCJ0eXBlXCI6IFwiZm9sZGVyXCIsIFwibmFtZVwiOiBcIml0ZW0gNFwiLCBjaGlsZHJlbjogW10gfSBdIH1gXG4gICAqXG4gICAqIHR5cGUgSXRlbSA9IHtcbiAgICogIHR5cGU6IFwiaXRlbVwiO1xuICAgKiAgbmFtZTogc3RyaW5nO1xuICAgKiB9O1xuICAgKlxuICAgKiB0eXBlIEZvbGRlciA9IHtcbiAgICogICB0eXBlOiBcImZvbGRlclwiO1xuICAgKiAgIG5hbWU6IHN0cmluZztcbiAgICogICBjaGlsZHJlbjogKEl0ZW0gfCBGb2xkZXIpW107XG4gICAqIH07XG4gICAqXG4gICAqIGZ1bmN0aW9uIGZsYXR0ZW4oaXRlbTogSXRlbSB8IEZvbGRlcik6IHsgbmFtZTogc3RyaW5nIH1bXSB7XG4gICAqICAgY29uc3QgZmxhdHRlbmVkOiB7IG5hbWU6IHN0cmluZyB9W10gPSBbXTtcbiAgICogICBpZiAoaXRlbS50eXBlID09PSBcImZvbGRlclwiKSB7XG4gICAqICAgICBmbGF0dGVuZWQucHVzaCguLi5pdGVtLmNoaWxkcmVuLm1hcChmbGF0dGVuKS5mbGF0KCkpO1xuICAgKiAgIH1cbiAgICogICBpZiAoaXRlbS50eXBlID09PSBcIml0ZW1cIikge1xuICAgKiAgICAgZmxhdHRlbmVkLnB1c2goeyBuYW1lOiBpdGVtLm5hbWUgfSk7XG4gICAqICAgfVxuICAgKiAgIHJldHVybiBmbGF0dGVuZWQ7XG4gICAqIH1cbiAgICpcbiAgICogY29uc3QgdHJhbnNmb3JtID0gdXNlQ2FsbGJhY2soZmxhdHRlbiwgW10pO1xuICAgKiBjb25zdCBmaWx0ZXIgPSB1c2VDYWxsYmFjaygoaXRlbTogeyBuYW1lOiBzdHJpbmcgfSkgPT4ge1xuICAgKiAgIOKAplxuICAgKiB9KVxuICAgKiBgYGBcbiAgICovXG4gIHRyYW5zZm9ybT86IChpdGVtOiBhbnkpID0+IFQ7XG4gIC8qKlxuICAgKiBUaGUgYW1vdW50IG9mIGl0ZW1zIHRvIHJldHVybiBmb3IgZWFjaCBwYWdlLlxuICAgKiBEZWZhdWx0cyB0byBgMjBgLlxuICAgKi9cbiAgcGFnZVNpemU/OiBudW1iZXI7XG59O1xuXG4vKipcbiAqIFRha2VzIGEgYGh0dHA6Ly9gLCBgaHR0cHM6Ly9gIG9yIGBmaWxlOi8vL2AgVVJMIHBvaW50aW5nIHRvIGEgSlNPTiByZXNvdXJjZSwgY2FjaGVzIGl0IHRvIHRoZSBjb21tYW5kJ3Mgc3VwcG9ydFxuICogZm9sZGVyLCBhbmQgc3RyZWFtcyB0aHJvdWdoIGl0cyBjb250ZW50LiBVc2VmdWwgd2hlbiBkZWFsaW5nIHdpdGggbGFyZ2UgSlNPTiBhcnJheXMgd2hpY2ggd291bGQgYmUgdG9vIGJpZyB0byBmaXRcbiAqIGluIHRoZSBjb21tYW5kJ3MgbWVtb3J5LlxuICpcbiAqIEByZW1hcmsgVGhlIEpTT04gcmVzb3VyY2UgbmVlZHMgdG8gY29uc2lzdCBvZiBhbiBhcnJheSBvZiBvYmplY3RzXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgTGlzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZVN0cmVhbUpTT04gfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiB0eXBlIEZvcm11bGEgPSB7IG5hbWU6IHN0cmluZzsgZGVzYz86IHN0cmluZyB9O1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE1haW4oKTogUmVhY3QuSlNYLkVsZW1lbnQge1xuICogICBjb25zdCB7IGRhdGEsIGlzTG9hZGluZywgcGFnaW5hdGlvbiB9ID0gdXNlU3RyZWFtSlNPTjxGb3JtdWxhPihcImh0dHBzOi8vZm9ybXVsYWUuYnJldy5zaC9hcGkvZm9ybXVsYS5qc29uXCIpO1xuICpcbiAqICAgcmV0dXJuIChcbiAqICAgICA8TGlzdCBpc0xvYWRpbmc9e2lzTG9hZGluZ30gcGFnaW5hdGlvbj17cGFnaW5hdGlvbn0+XG4gKiAgICAgICA8TGlzdC5TZWN0aW9uIHRpdGxlPVwiRm9ybXVsYWVcIj5cbiAqICAgICAgICAge2RhdGE/Lm1hcCgoZCkgPT4gPExpc3QuSXRlbSBrZXk9e2QubmFtZX0gdGl0bGU9e2QubmFtZX0gc3VidGl0bGU9e2QuZGVzY30gLz4pfVxuICogICAgICAgPC9MaXN0LlNlY3Rpb24+XG4gKiAgICAgPC9MaXN0PlxuICogICApO1xuICogfVxuICogYGBgXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgTGlzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZVN0cmVhbUpTT04gfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqIGltcG9ydCB7IGhvbWVkaXIgfSBmcm9tIFwib3NcIjtcbiAqIGltcG9ydCB7IGpvaW4gfSBmcm9tIFwicGF0aFwiO1xuICpcbiAqIHR5cGUgRm9ybXVsYSA9IHsgbmFtZTogc3RyaW5nOyBkZXNjPzogc3RyaW5nIH07XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWFpbigpOiBSZWFjdC5KU1guRWxlbWVudCB7XG4gKiAgIGNvbnN0IHsgZGF0YSwgaXNMb2FkaW5nLCBwYWdpbmF0aW9uIH0gPSB1c2VTdHJlYW1KU09OPEZvcm11bGE+KGBmaWxlOi8vLyR7am9pbihob21lZGlyKCksIFwiRG93bmxvYWRzXCIsIFwiZm9ybXVsYWUuanNvblwiKX1gKTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9IHBhZ2luYXRpb249e3BhZ2luYXRpb259PlxuICogICAgICAgPExpc3QuU2VjdGlvbiB0aXRsZT1cIkZvcm11bGFlXCI+XG4gKiAgICAgICAgIHtkYXRhPy5tYXAoKGQpID0+IDxMaXN0Lkl0ZW0ga2V5PXtkLm5hbWV9IHRpdGxlPXtkLm5hbWV9IHN1YnRpdGxlPXtkLmRlc2N9IC8+KX1cbiAqICAgICAgIDwvTGlzdC5TZWN0aW9uPlxuICogICAgIDwvTGlzdD5cbiAqICAgKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlU3RyZWFtSlNPTjxULCBVID0gdW5rbm93bj4odXJsOiBSZXF1ZXN0SW5mbyk6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFQsIFU+O1xuXG4vKipcbiAqIFRha2VzIGEgYGh0dHA6Ly9gLCBgaHR0cHM6Ly9gIG9yIGBmaWxlOi8vL2AgVVJMIHBvaW50aW5nIHRvIGEgSlNPTiByZXNvdXJjZSwgY2FjaGVzIGl0IHRvIHRoZSBjb21tYW5kJ3Mgc3VwcG9ydFxuICogZm9sZGVyLCBhbmQgc3RyZWFtcyB0aHJvdWdoIGl0cyBjb250ZW50LiBVc2VmdWwgd2hlbiBkZWFsaW5nIHdpdGggbGFyZ2UgSlNPTiBhcnJheXMgd2hpY2ggd291bGQgYmUgdG9vIGJpZyB0byBmaXRcbiAqIGluIHRoZSBjb21tYW5kJ3MgbWVtb3J5LlxuICpcbiAqIEByZW1hcmsgVGhlIEpTT04gcmVzb3VyY2UgbmVlZHMgdG8gY29uc2lzdCBvZiBhbiBhcnJheSBvZiBvYmplY3RzXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgTGlzdCwgZW52aXJvbm1lbnQgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG4gKiBpbXBvcnQgeyB1c2VTdHJlYW1KU09OIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKiBpbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG4gKiBpbXBvcnQgeyB1c2VDYWxsYmFjaywgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbiAqXG4gKiB0eXBlIEZvcm11bGEgPSB7IG5hbWU6IHN0cmluZzsgZGVzYz86IHN0cmluZyB9O1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE1haW4oKTogUmVhY3QuSlNYLkVsZW1lbnQge1xuICogICBjb25zdCBbc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAqXG4gKiAgIGNvbnN0IGZvcm11bGFGaWx0ZXIgPSB1c2VDYWxsYmFjayhcbiAqICAgICAoaXRlbTogRm9ybXVsYSkgPT4ge1xuICogICAgICAgaWYgKCFzZWFyY2hUZXh0KSByZXR1cm4gdHJ1ZTtcbiAqICAgICAgIHJldHVybiBpdGVtLm5hbWUudG9Mb2NhbGVMb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXh0KTtcbiAqICAgICB9LFxuICogICAgIFtzZWFyY2hUZXh0XSxcbiAqICAgKTtcbiAqXG4gKiAgIGNvbnN0IGZvcm11bGFUcmFuc2Zvcm0gPSB1c2VDYWxsYmFjaygoaXRlbTogYW55KTogRm9ybXVsYSA9PiB7XG4gKiAgICAgcmV0dXJuIHsgbmFtZTogaXRlbS5uYW1lLCBkZXNjOiBpdGVtLmRlc2MgfTtcbiAqICAgfSwgW10pO1xuICpcbiAqICAgY29uc3QgeyBkYXRhLCBpc0xvYWRpbmcsIHBhZ2luYXRpb24gfSA9IHVzZVN0cmVhbUpTT04oXCJodHRwczovL2Zvcm11bGFlLmJyZXcuc2gvYXBpL2Zvcm11bGEuanNvblwiLCB7XG4gKiAgICAgaW5pdGlhbERhdGE6IFtdIGFzIEZvcm11bGFbXSxcbiAqICAgICBwYWdlU2l6ZTogMjAsXG4gKiAgICAgZmlsdGVyOiBmb3JtdWxhRmlsdGVyLFxuICogICAgIHRyYW5zZm9ybTogZm9ybXVsYVRyYW5zZm9ybSxcbiAqICAgfSk7XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxMaXN0IGlzTG9hZGluZz17aXNMb2FkaW5nfSBwYWdpbmF0aW9uPXtwYWdpbmF0aW9ufSBvblNlYXJjaFRleHRDaGFuZ2U9e3NldFNlYXJjaFRleHR9PlxuICogICAgICAgPExpc3QuU2VjdGlvbiB0aXRsZT1cIkZvcm11bGFlXCI+XG4gKiAgICAgICAgIHtkYXRhLm1hcCgoZCkgPT4gKFxuICogICAgICAgICAgIDxMaXN0Lkl0ZW0ga2V5PXtkLm5hbWV9IHRpdGxlPXtkLm5hbWV9IHN1YnRpdGxlPXtkLmRlc2N9IC8+XG4gKiAgICAgICAgICkpfVxuICogICAgICAgPC9MaXN0LlNlY3Rpb24+XG4gKiAgICAgPC9MaXN0PlxuICogICApO1xuICogfVxuICogYGBgIHN1cHBvcnQgZm9sZGVyLCBhbmQgc3RyZWFtcyB0aHJvdWdoIGl0cyBjb250ZW50LlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBcbiAqIGltcG9ydCB7IExpc3QsIGVudmlyb25tZW50IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgdXNlU3RyZWFtSlNPTiB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICogaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG4gKiBpbXBvcnQgeyBob21lZGlyIH0gZnJvbSBcIm9zXCI7XG4gKiBpbXBvcnQgeyB1c2VDYWxsYmFjaywgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbiAqXG4gKiB0eXBlIEZvcm11bGEgPSB7IG5hbWU6IHN0cmluZzsgZGVzYz86IHN0cmluZyB9O1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE1haW4oKTogUmVhY3QuSlNYLkVsZW1lbnQge1xuICogICBjb25zdCBbc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAqXG4gKiAgIGNvbnN0IGZvcm11bGFGaWx0ZXIgPSB1c2VDYWxsYmFjayhcbiAqICAgICAoaXRlbTogRm9ybXVsYSkgPT4ge1xuICogICAgICAgaWYgKCFzZWFyY2hUZXh0KSByZXR1cm4gdHJ1ZTtcbiAqICAgICAgIHJldHVybiBpdGVtLm5hbWUudG9Mb2NhbGVMb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXh0KTtcbiAqICAgICB9LFxuICogICAgIFtzZWFyY2hUZXh0XSxcbiAqICAgKTtcbiAqXG4gKiAgIGNvbnN0IGZvcm11bGFUcmFuc2Zvcm0gPSB1c2VDYWxsYmFjaygoaXRlbTogYW55KTogRm9ybXVsYSA9PiB7XG4gKiAgICAgcmV0dXJuIHsgbmFtZTogaXRlbS5uYW1lLCBkZXNjOiBpdGVtLmRlc2MgfTtcbiAqICAgfSwgW10pO1xuICpcbiAqICAgY29uc3QgeyBkYXRhLCBpc0xvYWRpbmcsIHBhZ2luYXRpb24gfSA9IHVzZVN0cmVhbUpTT04oYGZpbGU6Ly8vJHtqb2luKGhvbWVkaXIoKSwgXCJEb3dubG9hZHNcIiwgXCJmb3JtdWxhZS5qc29uXCIpfWAsIHtcbiAqICAgICBpbml0aWFsRGF0YTogW10gYXMgRm9ybXVsYVtdLFxuICogICAgIHBhZ2VTaXplOiAyMCxcbiAqICAgICBmaWx0ZXI6IGZvcm11bGFGaWx0ZXIsXG4gKiAgICAgdHJhbnNmb3JtOiBmb3JtdWxhVHJhbnNmb3JtLFxuICogICB9KTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9IHBhZ2luYXRpb249e3BhZ2luYXRpb259IG9uU2VhcmNoVGV4dENoYW5nZT17c2V0U2VhcmNoVGV4dH0+XG4gKiAgICAgICA8TGlzdC5TZWN0aW9uIHRpdGxlPVwiRm9ybXVsYWVcIj5cbiAqICAgICAgICAge2RhdGEubWFwKChkKSA9PiAoXG4gKiAgICAgICAgICAgPExpc3QuSXRlbSBrZXk9e2QubmFtZX0gdGl0bGU9e2QubmFtZX0gc3VidGl0bGU9e2QuZGVzY30gLz5cbiAqICAgICAgICAgKSl9XG4gKiAgICAgICA8L0xpc3QuU2VjdGlvbj5cbiAqICAgICA8L0xpc3Q+XG4gKiAgICk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVN0cmVhbUpTT048VCwgVSBleHRlbmRzIGFueVtdID0gYW55W10+KFxuICB1cmw6IFJlcXVlc3RJbmZvLFxuICBvcHRpb25zOiBPcHRpb25zPFQ+ICYgUmVxdWVzdEluaXQgJiBPbWl0PENhY2hlZFByb21pc2VPcHRpb25zPEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZSwgVT4sIFwiYWJvcnRhYmxlXCI+LFxuKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VCBleHRlbmRzIHVua25vd25bXSA/IFQgOiBUW10sIFU+O1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlU3RyZWFtSlNPTjxULCBVIGV4dGVuZHMgYW55W10gPSBhbnlbXT4oXG4gIHVybDogUmVxdWVzdEluZm8sXG4gIG9wdGlvbnM/OiBPcHRpb25zPFQ+ICYgUmVxdWVzdEluaXQgJiBPbWl0PENhY2hlZFByb21pc2VPcHRpb25zPEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZSwgVT4sIFwiYWJvcnRhYmxlXCI+LFxuKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VCBleHRlbmRzIHVua25vd25bXSA/IFQgOiBUW10sIFU+IHtcbiAgY29uc3Qge1xuICAgIGluaXRpYWxEYXRhLFxuICAgIGV4ZWN1dGUsXG4gICAga2VlcFByZXZpb3VzRGF0YSxcbiAgICBvbkVycm9yLFxuICAgIG9uRGF0YSxcbiAgICBvbldpbGxFeGVjdXRlLFxuICAgIGZhaWx1cmVUb2FzdE9wdGlvbnMsXG4gICAgZGF0YVBhdGgsXG4gICAgZmlsdGVyLFxuICAgIHRyYW5zZm9ybSxcbiAgICBwYWdlU2l6ZSA9IDIwLFxuICAgIC4uLmZldGNoT3B0aW9uc1xuICB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgY29uc3QgcHJldmlvdXNVcmwgPSB1c2VSZWY8UmVxdWVzdEluZm8+KG51bGwpO1xuICBjb25zdCBwcmV2aW91c0Rlc3RpbmF0aW9uID0gdXNlUmVmPHN0cmluZz4obnVsbCk7XG5cbiAgY29uc3QgdXNlQ2FjaGVkUHJvbWlzZU9wdGlvbnM6IENhY2hlZFByb21pc2VPcHRpb25zPEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZSwgVT4gPSB7XG4gICAgaW5pdGlhbERhdGEsXG4gICAgZXhlY3V0ZSxcbiAgICBrZWVwUHJldmlvdXNEYXRhLFxuICAgIG9uRXJyb3IsXG4gICAgb25EYXRhLFxuICAgIG9uV2lsbEV4ZWN1dGUsXG4gICAgZmFpbHVyZVRvYXN0T3B0aW9ucyxcbiAgfTtcblxuICBjb25zdCBnZW5lcmF0b3JSZWYgPSB1c2VSZWY8QXN5bmNHZW5lcmF0b3I8VCBleHRlbmRzIHVua25vd25bXSA/IFQgOiBUW10+IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IGNvbnRyb2xsZXJSZWYgPSB1c2VSZWY8QWJvcnRDb250cm9sbGVyIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IGhhc01vcmVSZWYgPSB1c2VSZWYoZmFsc2UpO1xuXG4gIHJldHVybiB1c2VDYWNoZWRQcm9taXNlKFxuICAgIChcbiAgICAgIHVybDogUmVxdWVzdEluZm8sXG4gICAgICBwYWdlU2l6ZTogbnVtYmVyLFxuICAgICAgZmV0Y2hPcHRpb25zOiBSZXF1ZXN0SW5pdCB8IHVuZGVmaW5lZCxcbiAgICAgIGRhdGFQYXRoOiBzdHJpbmcgfCBSZWdFeHAgfCB1bmRlZmluZWQsXG4gICAgICBmaWx0ZXI6ICgoaXRlbTogRmxhdHRlbjxUPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQsXG4gICAgICB0cmFuc2Zvcm06ICgoaXRlbTogdW5rbm93bikgPT4gVCkgfCB1bmRlZmluZWQsXG4gICAgKSA9PlxuICAgICAgYXN5bmMgKHsgcGFnZSB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gaGFzaCh1cmwpICsgXCIuanNvblwiO1xuICAgICAgICBjb25zdCBmb2xkZXIgPSBlbnZpcm9ubWVudC5zdXBwb3J0UGF0aDtcbiAgICAgICAgaWYgKHBhZ2UgPT09IDApIHtcbiAgICAgICAgICBjb250cm9sbGVyUmVmLmN1cnJlbnQ/LmFib3J0KCk7XG4gICAgICAgICAgY29udHJvbGxlclJlZi5jdXJyZW50ID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gam9pbihmb2xkZXIsIGZpbGVOYW1lKTtcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGb3JjZSB1cGRhdGUgdGhlIGNhY2hlIHdoZW4gdGhlIFVSTCBjaGFuZ2VzIGJ1dCB0aGUgY2FjaGUgZGVzdGluYXRpb24gZG9lcyBub3QuXG4gICAgICAgICAgICovXG4gICAgICAgICAgY29uc3QgZm9yY2VDYWNoZVVwZGF0ZSA9IEJvb2xlYW4oXG4gICAgICAgICAgICBwcmV2aW91c1VybC5jdXJyZW50ICYmXG4gICAgICAgICAgICAgIHByZXZpb3VzVXJsLmN1cnJlbnQgIT09IHVybCAmJlxuICAgICAgICAgICAgICBwcmV2aW91c0Rlc3RpbmF0aW9uLmN1cnJlbnQgJiZcbiAgICAgICAgICAgICAgcHJldmlvdXNEZXN0aW5hdGlvbi5jdXJyZW50ID09PSBkZXN0aW5hdGlvbixcbiAgICAgICAgICApO1xuICAgICAgICAgIHByZXZpb3VzVXJsLmN1cnJlbnQgPSB1cmw7XG4gICAgICAgICAgcHJldmlvdXNEZXN0aW5hdGlvbi5jdXJyZW50ID0gZGVzdGluYXRpb247XG4gICAgICAgICAgYXdhaXQgY2FjaGVVUkxJZk5lY2Vzc2FyeSh1cmwsIGZvbGRlciwgZmlsZU5hbWUsIGZvcmNlQ2FjaGVVcGRhdGUsIHtcbiAgICAgICAgICAgIC4uLmZldGNoT3B0aW9ucyxcbiAgICAgICAgICAgIHNpZ25hbDogY29udHJvbGxlclJlZi5jdXJyZW50Py5zaWduYWwsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZ2VuZXJhdG9yUmVmLmN1cnJlbnQgPSBzdHJlYW1Kc29uRmlsZShcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLFxuICAgICAgICAgICAgcGFnZVNpemUsXG4gICAgICAgICAgICBjb250cm9sbGVyUmVmLmN1cnJlbnQ/LnNpZ25hbCxcbiAgICAgICAgICAgIGRhdGFQYXRoLFxuICAgICAgICAgICAgZmlsdGVyLFxuICAgICAgICAgICAgdHJhbnNmb3JtLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFnZW5lcmF0b3JSZWYuY3VycmVudCkge1xuICAgICAgICAgIHJldHVybiB7IGhhc01vcmU6IGhhc01vcmVSZWYuY3VycmVudCwgZGF0YTogW10gYXMgVCBleHRlbmRzIHVua25vd25bXSA/IFQgOiBUW10gfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHZhbHVlOiBuZXdEYXRhLCBkb25lIH0gPSBhd2FpdCBnZW5lcmF0b3JSZWYuY3VycmVudC5uZXh0KCk7XG4gICAgICAgIGhhc01vcmVSZWYuY3VycmVudCA9ICFkb25lO1xuICAgICAgICByZXR1cm4geyBoYXNNb3JlOiBoYXNNb3JlUmVmLmN1cnJlbnQsIGRhdGE6IChuZXdEYXRhID8/IFtdKSBhcyBUIGV4dGVuZHMgdW5rbm93bltdID8gVCA6IFRbXSB9O1xuICAgICAgfSxcbiAgICBbdXJsLCBwYWdlU2l6ZSwgZmV0Y2hPcHRpb25zLCBkYXRhUGF0aCwgZmlsdGVyLCB0cmFuc2Zvcm1dLFxuICAgIHVzZUNhY2hlZFByb21pc2VPcHRpb25zLFxuICApO1xufVxuIiwgIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudCAqL1xuaW1wb3J0IHsgUmVhZGFibGUsIFdyaXRhYmxlLCBEdXBsZXggfSBmcm9tIFwibm9kZTpzdHJlYW1cIjtcblxuZXhwb3J0IGNvbnN0IG5vbmUgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sLmZvcihcIm9iamVjdC1zdHJlYW0ubm9uZVwiKTtcbmNvbnN0IHN0b3AgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sLmZvcihcIm9iamVjdC1zdHJlYW0uc3RvcFwiKTtcblxuY29uc3QgZmluYWxTeW1ib2wgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sLmZvcihcIm9iamVjdC1zdHJlYW0uZmluYWxcIik7XG5jb25zdCBtYW55U3ltYm9sID0gLyogI19fUFVSRV9fICovIFN5bWJvbC5mb3IoXCJvYmplY3Qtc3RyZWFtLm1hbnlcIik7XG5jb25zdCBmbHVzaFN5bWJvbCA9IC8qICNfX1BVUkVfXyAqLyBTeW1ib2wuZm9yKFwib2JqZWN0LXN0cmVhbS5mbHVzaFwiKTtcbmNvbnN0IGZMaXN0U3ltYm9sID0gLyogI19fUFVSRV9fICovIFN5bWJvbC5mb3IoXCJvYmplY3Qtc3RyZWFtLmZMaXN0XCIpO1xuXG5jb25zdCBmaW5hbFZhbHVlID0gKHZhbHVlOiBhbnkpID0+ICh7IFtmaW5hbFN5bWJvbF06IDEsIHZhbHVlIH0pO1xuZXhwb3J0IGNvbnN0IG1hbnkgPSAodmFsdWVzOiBhbnkpID0+ICh7IFttYW55U3ltYm9sXTogMSwgdmFsdWVzIH0pO1xuXG5jb25zdCBpc0ZpbmFsVmFsdWUgPSAobzogYW55KSA9PiBvICYmIG9bZmluYWxTeW1ib2xdID09PSAxO1xuY29uc3QgaXNNYW55ID0gKG86IGFueSkgPT4gbyAmJiBvW21hbnlTeW1ib2xdID09PSAxO1xuY29uc3QgaXNGbHVzaGFibGUgPSAobzogYW55KSA9PiBvICYmIG9bZmx1c2hTeW1ib2xdID09PSAxO1xuY29uc3QgaXNGdW5jdGlvbkxpc3QgPSAobzogYW55KSA9PiBvICYmIG9bZkxpc3RTeW1ib2xdID09PSAxO1xuXG5jb25zdCBnZXRGaW5hbFZhbHVlID0gKG86IGFueSkgPT4gby52YWx1ZTtcbmNvbnN0IGdldE1hbnlWYWx1ZXMgPSAobzogYW55KSA9PiBvLnZhbHVlcztcbmNvbnN0IGdldEZ1bmN0aW9uTGlzdCA9IChvOiBhbnkpID0+IG8uZkxpc3Q7XG5cbmV4cG9ydCBjb25zdCBjb21iaW5lTWFueU11dCA9IChhOiBhbnksIGI6IGFueSkgPT4ge1xuICBjb25zdCB2YWx1ZXMgPSBhID09PSBub25lID8gW10gOiBhPy5bbWFueVN5bWJvbF0gPT09IDEgPyBhLnZhbHVlcyA6IFthXTtcbiAgaWYgKGIgPT09IG5vbmUpIHtcbiAgICAvLyBkbyBub3RoaW5nXG4gIH0gZWxzZSBpZiAoYj8uW21hbnlTeW1ib2xdID09PSAxKSB7XG4gICAgdmFsdWVzLnB1c2goLi4uYi52YWx1ZXMpO1xuICB9IGVsc2Uge1xuICAgIHZhbHVlcy5wdXNoKGIpO1xuICB9XG4gIHJldHVybiBtYW55KHZhbHVlcyk7XG59O1xuXG5leHBvcnQgY29uc3QgZmx1c2hhYmxlID0gKHdyaXRlOiAodmFsdWU6IGFueSkgPT4gYW55LCBmaW5hbCA9IG51bGwpID0+IHtcbiAgY29uc3QgZm4gPSBmaW5hbCA/ICh2YWx1ZTogYW55KSA9PiAodmFsdWUgPT09IG5vbmUgPyBmaW5hbFZhbHVlKHVuZGVmaW5lZCkgOiB3cml0ZSh2YWx1ZSkpIDogd3JpdGU7XG4gIC8vIEB0cy1pZ25vcmVcbiAgZm5bZmx1c2hTeW1ib2xdID0gMTtcbiAgcmV0dXJuIGZuO1xufTtcblxuY29uc3Qgc2V0RnVuY3Rpb25MaXN0ID0gKG86IGFueSwgZm5zOiBhbnkpID0+IHtcbiAgby5mTGlzdCA9IGZucztcbiAgb1tmTGlzdFN5bWJvbF0gPSAxO1xuICByZXR1cm4gbztcbn07XG5cbi8vIGlzKk5vZGVTdHJlYW0gZnVuY3Rpb25zIHRha2VuIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvbWFzdGVyL2xpYi9pbnRlcm5hbC9zdHJlYW1zL3V0aWxzLmpzXG5jb25zdCBpc1JlYWRhYmxlTm9kZVN0cmVhbSA9IChvYmo6IGFueSkgPT5cbiAgb2JqICYmXG4gIHR5cGVvZiBvYmoucGlwZSA9PT0gXCJmdW5jdGlvblwiICYmXG4gIHR5cGVvZiBvYmoub24gPT09IFwiZnVuY3Rpb25cIiAmJlxuICAoIW9iai5fd3JpdGFibGVTdGF0ZSB8fCAodHlwZW9mIG9iai5fcmVhZGFibGVTdGF0ZSA9PT0gXCJvYmplY3RcIiA/IG9iai5fcmVhZGFibGVTdGF0ZS5yZWFkYWJsZSA6IG51bGwpICE9PSBmYWxzZSkgJiYgLy8gRHVwbGV4XG4gICghb2JqLl93cml0YWJsZVN0YXRlIHx8IG9iai5fcmVhZGFibGVTdGF0ZSk7IC8vIFdyaXRhYmxlIGhhcyAucGlwZS5cblxuY29uc3QgaXNXcml0YWJsZU5vZGVTdHJlYW0gPSAob2JqOiBhbnkpID0+XG4gIG9iaiAmJlxuICB0eXBlb2Ygb2JqLndyaXRlID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgdHlwZW9mIG9iai5vbiA9PT0gXCJmdW5jdGlvblwiICYmXG4gICghb2JqLl9yZWFkYWJsZVN0YXRlIHx8ICh0eXBlb2Ygb2JqLl93cml0YWJsZVN0YXRlID09PSBcIm9iamVjdFwiID8gb2JqLl93cml0YWJsZVN0YXRlLndyaXRhYmxlIDogbnVsbCkgIT09IGZhbHNlKTsgLy8gRHVwbGV4XG5cbmNvbnN0IGlzRHVwbGV4Tm9kZVN0cmVhbSA9IChvYmo6IGFueSkgPT5cbiAgb2JqICYmXG4gIHR5cGVvZiBvYmoucGlwZSA9PT0gXCJmdW5jdGlvblwiICYmXG4gIG9iai5fcmVhZGFibGVTdGF0ZSAmJlxuICB0eXBlb2Ygb2JqLm9uID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgdHlwZW9mIG9iai53cml0ZSA9PT0gXCJmdW5jdGlvblwiO1xuXG5jb25zdCBpc1JlYWRhYmxlV2ViU3RyZWFtID0gKG9iajogYW55KSA9PiBvYmogJiYgZ2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbSAmJiBvYmogaW5zdGFuY2VvZiBnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtO1xuXG5jb25zdCBpc1dyaXRhYmxlV2ViU3RyZWFtID0gKG9iajogYW55KSA9PiBvYmogJiYgZ2xvYmFsVGhpcy5Xcml0YWJsZVN0cmVhbSAmJiBvYmogaW5zdGFuY2VvZiBnbG9iYWxUaGlzLldyaXRhYmxlU3RyZWFtO1xuXG5jb25zdCBpc0R1cGxleFdlYlN0cmVhbSA9IChvYmo6IGFueSkgPT5cbiAgb2JqICYmXG4gIGdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW0gJiZcbiAgb2JqLnJlYWRhYmxlIGluc3RhbmNlb2YgZ2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbSAmJlxuICBnbG9iYWxUaGlzLldyaXRhYmxlU3RyZWFtICYmXG4gIG9iai53cml0YWJsZSBpbnN0YW5jZW9mIGdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW07XG5cbmNvbnN0IGdyb3VwRnVuY3Rpb25zID0gKG91dHB1dDogYW55LCBmbjogYW55LCBpbmRleDogYW55LCBmbnM6IGFueSkgPT4ge1xuICBpZiAoXG4gICAgaXNEdXBsZXhOb2RlU3RyZWFtKGZuKSB8fFxuICAgICghaW5kZXggJiYgaXNSZWFkYWJsZU5vZGVTdHJlYW0oZm4pKSB8fFxuICAgIChpbmRleCA9PT0gZm5zLmxlbmd0aCAtIDEgJiYgaXNXcml0YWJsZU5vZGVTdHJlYW0oZm4pKVxuICApIHtcbiAgICBvdXRwdXQucHVzaChmbik7XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuICBpZiAoaXNEdXBsZXhXZWJTdHJlYW0oZm4pKSB7XG4gICAgb3V0cHV0LnB1c2goRHVwbGV4LmZyb21XZWIoZm4sIHsgb2JqZWN0TW9kZTogdHJ1ZSB9KSk7XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuICBpZiAoIWluZGV4ICYmIGlzUmVhZGFibGVXZWJTdHJlYW0oZm4pKSB7XG4gICAgb3V0cHV0LnB1c2goUmVhZGFibGUuZnJvbVdlYihmbiwgeyBvYmplY3RNb2RlOiB0cnVlIH0pKTtcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG4gIGlmIChpbmRleCA9PT0gZm5zLmxlbmd0aCAtIDEgJiYgaXNXcml0YWJsZVdlYlN0cmVhbShmbikpIHtcbiAgICBvdXRwdXQucHVzaChXcml0YWJsZS5mcm9tV2ViKGZuLCB7IG9iamVjdE1vZGU6IHRydWUgfSkpO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cbiAgaWYgKHR5cGVvZiBmbiAhPSBcImZ1bmN0aW9uXCIpIHRocm93IFR5cGVFcnJvcihcIkl0ZW0gI1wiICsgaW5kZXggKyBcIiBpcyBub3QgYSBwcm9wZXIgc3RyZWFtLCBub3IgYSBmdW5jdGlvbi5cIik7XG4gIGlmICghb3V0cHV0Lmxlbmd0aCkgb3V0cHV0LnB1c2goW10pO1xuICBjb25zdCBsYXN0ID0gb3V0cHV0W291dHB1dC5sZW5ndGggLSAxXTtcbiAgaWYgKEFycmF5LmlzQXJyYXkobGFzdCkpIHtcbiAgICBsYXN0LnB1c2goZm4pO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dC5wdXNoKFtmbl0pO1xuICB9XG4gIHJldHVybiBvdXRwdXQ7XG59O1xuXG5jbGFzcyBTdG9wIGV4dGVuZHMgRXJyb3Ige31cblxuZXhwb3J0IGNvbnN0IGFzU3RyZWFtID0gKGZuOiBhbnkpID0+IHtcbiAgaWYgKHR5cGVvZiBmbiAhPSBcImZ1bmN0aW9uXCIpIHRocm93IFR5cGVFcnJvcihcIk9ubHkgYSBmdW5jdGlvbiBpcyBhY2NlcHRlZCBhcyB0aGUgZmlyc3QgYXJndW1lbnRcIik7XG5cbiAgLy8gcHVtcCB2YXJpYWJsZXNcbiAgbGV0IHBhdXNlZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuICBsZXQgcmVzb2x2ZVBhdXNlZDogKCh2YWx1ZTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICBjb25zdCBxdWV1ZTogYW55W10gPSBbXTtcblxuICAvLyBwYXVzZS9yZXN1bWVcbiAgY29uc3QgcmVzdW1lOiBhbnkgPSAoKSA9PiB7XG4gICAgaWYgKCFyZXNvbHZlUGF1c2VkKSByZXR1cm47XG4gICAgcmVzb2x2ZVBhdXNlZCgpO1xuICAgIHJlc29sdmVQYXVzZWQgPSBudWxsO1xuICAgIHBhdXNlZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuICB9O1xuICBjb25zdCBwYXVzZTogYW55ID0gKCkgPT4ge1xuICAgIGlmIChyZXNvbHZlUGF1c2VkKSByZXR1cm47XG4gICAgcGF1c2VkID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IChyZXNvbHZlUGF1c2VkID0gcmVzb2x2ZSkpO1xuICB9O1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItY29uc3RcbiAgbGV0IHN0cmVhbTogRHVwbGV4OyAvLyB3aWxsIGJlIGFzc2lnbmVkIGxhdGVyXG5cbiAgLy8gZGF0YSBwcm9jZXNzaW5nXG4gIGNvbnN0IHB1c2hSZXN1bHRzOiBhbnkgPSAodmFsdWVzOiBhbnkpID0+IHtcbiAgICBpZiAodmFsdWVzICYmIHR5cGVvZiB2YWx1ZXMubmV4dCA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIGdlbmVyYXRvclxuICAgICAgcXVldWUucHVzaCh2YWx1ZXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBhcnJheVxuICAgIHF1ZXVlLnB1c2godmFsdWVzW1N5bWJvbC5pdGVyYXRvcl0oKSk7XG4gIH07XG4gIGNvbnN0IHB1bXA6IGFueSA9IGFzeW5jICgpID0+IHtcbiAgICB3aGlsZSAocXVldWUubGVuZ3RoKSB7XG4gICAgICBhd2FpdCBwYXVzZWQ7XG4gICAgICBjb25zdCBnZW4gPSBxdWV1ZVtxdWV1ZS5sZW5ndGggLSAxXTtcbiAgICAgIGxldCByZXN1bHQgPSBnZW4ubmV4dCgpO1xuICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJlc3VsdCA9IGF3YWl0IHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICBxdWV1ZS5wb3AoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBsZXQgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHZhbHVlID0gYXdhaXQgdmFsdWU7XG4gICAgICB9XG4gICAgICBhd2FpdCBzYW5pdGl6ZSh2YWx1ZSk7XG4gICAgfVxuICB9O1xuICBjb25zdCBzYW5pdGl6ZTogYW55ID0gYXN5bmMgKHZhbHVlOiBhbnkpID0+IHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gbm9uZSkgcmV0dXJuO1xuICAgIGlmICh2YWx1ZSA9PT0gc3RvcCkgdGhyb3cgbmV3IFN0b3AoKTtcblxuICAgIGlmIChpc01hbnkodmFsdWUpKSB7XG4gICAgICBwdXNoUmVzdWx0cyhnZXRNYW55VmFsdWVzKHZhbHVlKSk7XG4gICAgICByZXR1cm4gcHVtcCgpO1xuICAgIH1cblxuICAgIGlmIChpc0ZpbmFsVmFsdWUodmFsdWUpKSB7XG4gICAgICAvLyBhIGZpbmFsIHZhbHVlIGlzIG5vdCBzdXBwb3J0ZWQsIGl0IGlzIHRyZWF0ZWQgYXMgYSByZWd1bGFyIHZhbHVlXG4gICAgICB2YWx1ZSA9IGdldEZpbmFsVmFsdWUodmFsdWUpO1xuICAgICAgcmV0dXJuIHByb2Nlc3NWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgaWYgKCFzdHJlYW0ucHVzaCh2YWx1ZSkpIHtcbiAgICAgIHBhdXNlKCk7XG4gICAgfVxuICB9O1xuICBjb25zdCBwcm9jZXNzQ2h1bms6IGFueSA9IGFzeW5jIChjaHVuazogYW55LCBlbmNvZGluZzogYW55KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gZm4oY2h1bmssIGVuY29kaW5nKTtcbiAgICAgIGF3YWl0IHByb2Nlc3NWYWx1ZSh2YWx1ZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFN0b3ApIHtcbiAgICAgICAgc3RyZWFtLnB1c2gobnVsbCk7XG4gICAgICAgIHN0cmVhbS5kZXN0cm95KCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgcHJvY2Vzc1ZhbHVlOiBhbnkgPSBhc3luYyAodmFsdWU6IGFueSkgPT4ge1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIHRoZW5hYmxlXG4gICAgICByZXR1cm4gdmFsdWUudGhlbigodmFsdWU6IGFueSkgPT4gcHJvY2Vzc1ZhbHVlKHZhbHVlKSk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUubmV4dCA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIGdlbmVyYXRvclxuICAgICAgcHVzaFJlc3VsdHModmFsdWUpO1xuICAgICAgcmV0dXJuIHB1bXAoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNhbml0aXplKHZhbHVlKTtcbiAgfTtcblxuICBzdHJlYW0gPSBuZXcgRHVwbGV4KFxuICAgIE9iamVjdC5hc3NpZ24oeyB3cml0YWJsZU9iamVjdE1vZGU6IHRydWUsIHJlYWRhYmxlT2JqZWN0TW9kZTogdHJ1ZSB9LCB1bmRlZmluZWQsIHtcbiAgICAgIHdyaXRlKGNodW5rOiBhbnksIGVuY29kaW5nOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgcHJvY2Vzc0NodW5rKGNodW5rLCBlbmNvZGluZykudGhlbihcbiAgICAgICAgICAoKSA9PiBjYWxsYmFjayhudWxsKSxcbiAgICAgICAgICAoZXJyb3I6IGFueSkgPT4gY2FsbGJhY2soZXJyb3IpLFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIGZpbmFsKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgaWYgKCFpc0ZsdXNoYWJsZShmbikpIHtcbiAgICAgICAgICBzdHJlYW0ucHVzaChudWxsKTtcbiAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcHJvY2Vzc0NodW5rKG5vbmUsIG51bGwpLnRoZW4oXG4gICAgICAgICAgKCkgPT4gKHN0cmVhbS5wdXNoKG51bGwpLCBjYWxsYmFjayhudWxsKSksXG4gICAgICAgICAgKGVycm9yOiBhbnkpID0+IGNhbGxiYWNrKGVycm9yKSxcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICByZWFkKCkge1xuICAgICAgICByZXN1bWUoKTtcbiAgICAgIH0sXG4gICAgfSksXG4gICk7XG5cbiAgcmV0dXJuIHN0cmVhbTtcbn07XG5cbmNvbnN0IHByb2R1Y2VTdHJlYW1zID0gKGl0ZW06IGFueSkgPT4ge1xuICBpZiAoQXJyYXkuaXNBcnJheShpdGVtKSkge1xuICAgIGlmICghaXRlbS5sZW5ndGgpIHJldHVybiBudWxsO1xuICAgIGlmIChpdGVtLmxlbmd0aCA9PSAxKSByZXR1cm4gaXRlbVswXSAmJiBhc1N0cmVhbShpdGVtWzBdKTtcbiAgICByZXR1cm4gYXNTdHJlYW0oZ2VuKC4uLml0ZW0pKTtcbiAgfVxuICByZXR1cm4gaXRlbTtcbn07XG5cbmNvbnN0IG5leHQ6IGFueSA9IGFzeW5jIGZ1bmN0aW9uKiAodmFsdWU6IGFueSwgZm5zOiBhbnksIGluZGV4OiBhbnkpIHtcbiAgZm9yIChsZXQgaSA9IGluZGV4OyBpIDw9IGZucy5sZW5ndGg7ICsraSkge1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIHRoZW5hYmxlXG4gICAgICB2YWx1ZSA9IGF3YWl0IHZhbHVlO1xuICAgIH1cbiAgICBpZiAodmFsdWUgPT09IG5vbmUpIGJyZWFrO1xuICAgIGlmICh2YWx1ZSA9PT0gc3RvcCkgdGhyb3cgbmV3IFN0b3AoKTtcbiAgICBpZiAoaXNGaW5hbFZhbHVlKHZhbHVlKSkge1xuICAgICAgeWllbGQgZ2V0RmluYWxWYWx1ZSh2YWx1ZSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGlzTWFueSh2YWx1ZSkpIHtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IGdldE1hbnlWYWx1ZXModmFsdWUpO1xuICAgICAgaWYgKGkgPT0gZm5zLmxlbmd0aCkge1xuICAgICAgICB5aWVsZCogdmFsdWVzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB2YWx1ZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICB5aWVsZCogbmV4dCh2YWx1ZXNbal0sIGZucywgaSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLm5leHQgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAvLyBnZW5lcmF0b3JcbiAgICAgIGZvciAoOzspIHtcbiAgICAgICAgbGV0IGRhdGEgPSB2YWx1ZS5uZXh0KCk7XG4gICAgICAgIGlmIChkYXRhICYmIHR5cGVvZiBkYXRhLnRoZW4gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgZGF0YSA9IGF3YWl0IGRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGEuZG9uZSkgYnJlYWs7XG4gICAgICAgIGlmIChpID09IGZucy5sZW5ndGgpIHtcbiAgICAgICAgICB5aWVsZCBkYXRhLnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHlpZWxkKiBuZXh0KGRhdGEudmFsdWUsIGZucywgaSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoaSA9PSBmbnMubGVuZ3RoKSB7XG4gICAgICB5aWVsZCB2YWx1ZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjb25zdCBmID0gZm5zW2ldO1xuICAgIHZhbHVlID0gZih2YWx1ZSk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZW4gPSAoLi4uZm5zOiBhbnkpID0+IHtcbiAgZm5zID0gZm5zXG4gICAgLmZpbHRlcigoZm46IGFueSkgPT4gZm4pXG4gICAgLmZsYXQoSW5maW5pdHkpXG4gICAgLm1hcCgoZm46IGFueSkgPT4gKGlzRnVuY3Rpb25MaXN0KGZuKSA/IGdldEZ1bmN0aW9uTGlzdChmbikgOiBmbikpXG4gICAgLmZsYXQoSW5maW5pdHkpO1xuICBpZiAoIWZucy5sZW5ndGgpIHtcbiAgICBmbnMgPSBbKHg6IGFueSkgPT4geF07XG4gIH1cbiAgbGV0IGZsdXNoZWQgPSBmYWxzZTtcbiAgbGV0IGcgPSBhc3luYyBmdW5jdGlvbiogKHZhbHVlOiBhbnkpIHtcbiAgICBpZiAoZmx1c2hlZCkgdGhyb3cgRXJyb3IoXCJDYWxsIHRvIGEgZmx1c2hlZCBwaXBlLlwiKTtcbiAgICBpZiAodmFsdWUgIT09IG5vbmUpIHtcbiAgICAgIHlpZWxkKiBuZXh0KHZhbHVlLCBmbnMsIDApO1xuICAgIH0gZWxzZSB7XG4gICAgICBmbHVzaGVkID0gdHJ1ZTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZm5zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGYgPSBmbnNbaV07XG4gICAgICAgIGlmIChpc0ZsdXNoYWJsZShmKSkge1xuICAgICAgICAgIHlpZWxkKiBuZXh0KGYobm9uZSksIGZucywgaSArIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBjb25zdCBuZWVkVG9GbHVzaCA9IGZucy5zb21lKChmbjogYW55KSA9PiBpc0ZsdXNoYWJsZShmbikpO1xuICBpZiAobmVlZFRvRmx1c2gpIGcgPSBmbHVzaGFibGUoZyk7XG4gIHJldHVybiBzZXRGdW5jdGlvbkxpc3QoZywgZm5zKTtcbn07XG5cbmNvbnN0IHdyaXRlID0gKGlucHV0OiBhbnksIGNodW5rOiBhbnksIGVuY29kaW5nOiBhbnksIGNhbGxiYWNrOiBhbnkpID0+IHtcbiAgbGV0IGVycm9yOiBhbnkgPSBudWxsO1xuICB0cnkge1xuICAgIGlucHV0LndyaXRlKGNodW5rLCBlbmNvZGluZywgKGU6IGFueSkgPT4gY2FsbGJhY2soZSB8fCBlcnJvcikpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZXJyb3IgPSBlO1xuICB9XG59O1xuXG5jb25zdCBmaW5hbCA9IChpbnB1dDogYW55LCBjYWxsYmFjazogYW55KSA9PiB7XG4gIGxldCBlcnJvcjogYW55ID0gbnVsbDtcbiAgdHJ5IHtcbiAgICBpbnB1dC5lbmQobnVsbCwgbnVsbCwgKGU6IGFueSkgPT4gY2FsbGJhY2soZSB8fCBlcnJvcikpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZXJyb3IgPSBlO1xuICB9XG59O1xuXG5jb25zdCByZWFkID0gKG91dHB1dDogYW55KSA9PiB7XG4gIG91dHB1dC5yZXN1bWUoKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNoYWluKGZuczogYW55KSB7XG4gIGZucyA9IGZucy5mbGF0KEluZmluaXR5KS5maWx0ZXIoKGZuOiBhbnkpID0+IGZuKTtcblxuICBjb25zdCBzdHJlYW1zID0gZm5zXG4gICAgICAubWFwKChmbjogYW55KSA9PiAoaXNGdW5jdGlvbkxpc3QoZm4pID8gZ2V0RnVuY3Rpb25MaXN0KGZuKSA6IGZuKSlcbiAgICAgIC5mbGF0KEluZmluaXR5KVxuICAgICAgLnJlZHVjZShncm91cEZ1bmN0aW9ucywgW10pXG4gICAgICAubWFwKHByb2R1Y2VTdHJlYW1zKVxuICAgICAgLmZpbHRlcigoczogYW55KSA9PiBzKSxcbiAgICBpbnB1dCA9IHN0cmVhbXNbMF0sXG4gICAgb3V0cHV0ID0gc3RyZWFtcy5yZWR1Y2UoKG91dHB1dDogYW55LCBpdGVtOiBhbnkpID0+IChvdXRwdXQgJiYgb3V0cHV0LnBpcGUoaXRlbSkpIHx8IGl0ZW0pO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItY29uc3RcbiAgbGV0IHN0cmVhbTogRHVwbGV4OyAvLyB3aWxsIGJlIGFzc2lnbmVkIGxhdGVyXG5cbiAgbGV0IHdyaXRlTWV0aG9kID0gKGNodW5rOiBhbnksIGVuY29kaW5nOiBhbnksIGNhbGxiYWNrOiBhbnkpID0+IHdyaXRlKGlucHV0LCBjaHVuaywgZW5jb2RpbmcsIGNhbGxiYWNrKSxcbiAgICBmaW5hbE1ldGhvZCA9IChjYWxsYmFjazogYW55KSA9PiBmaW5hbChpbnB1dCwgY2FsbGJhY2spLFxuICAgIHJlYWRNZXRob2QgPSAoKSA9PiByZWFkKG91dHB1dCk7XG5cbiAgaWYgKCFpc1dyaXRhYmxlTm9kZVN0cmVhbShpbnB1dCkpIHtcbiAgICB3cml0ZU1ldGhvZCA9IChfMSwgXzIsIGNhbGxiYWNrKSA9PiBjYWxsYmFjayhudWxsKTtcbiAgICBmaW5hbE1ldGhvZCA9IChjYWxsYmFjaykgPT4gY2FsbGJhY2sobnVsbCk7XG4gICAgaW5wdXQub24oXCJlbmRcIiwgKCkgPT4gc3RyZWFtLmVuZCgpKTtcbiAgfVxuXG4gIGlmIChpc1JlYWRhYmxlTm9kZVN0cmVhbShvdXRwdXQpKSB7XG4gICAgb3V0cHV0Lm9uKFwiZGF0YVwiLCAoY2h1bms6IGFueSkgPT4gIXN0cmVhbS5wdXNoKGNodW5rKSAmJiBvdXRwdXQucGF1c2UoKSk7XG4gICAgb3V0cHV0Lm9uKFwiZW5kXCIsICgpID0+IHN0cmVhbS5wdXNoKG51bGwpKTtcbiAgfSBlbHNlIHtcbiAgICByZWFkTWV0aG9kID0gKCkgPT4ge307IC8vIG5vcFxuICAgIG91dHB1dC5vbihcImZpbmlzaFwiLCAoKSA9PiBzdHJlYW0ucHVzaChudWxsKSk7XG4gIH1cblxuICBzdHJlYW0gPSBuZXcgRHVwbGV4KFxuICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICB7IHdyaXRhYmxlT2JqZWN0TW9kZTogdHJ1ZSwgcmVhZGFibGVPYmplY3RNb2RlOiB0cnVlIH0sXG4gICAgICB7XG4gICAgICAgIHJlYWRhYmxlOiBpc1JlYWRhYmxlTm9kZVN0cmVhbShvdXRwdXQpLFxuICAgICAgICB3cml0YWJsZTogaXNXcml0YWJsZU5vZGVTdHJlYW0oaW5wdXQpLFxuICAgICAgICB3cml0ZTogd3JpdGVNZXRob2QsXG4gICAgICAgIGZpbmFsOiBmaW5hbE1ldGhvZCxcbiAgICAgICAgcmVhZDogcmVhZE1ldGhvZCxcbiAgICAgIH0sXG4gICAgKSxcbiAgKTtcbiAgLy8gQHRzLWlnbm9yZVxuICBzdHJlYW0uc3RyZWFtcyA9IHN0cmVhbXM7XG4gIC8vIEB0cy1pZ25vcmVcbiAgc3RyZWFtLmlucHV0ID0gaW5wdXQ7XG4gIC8vIEB0cy1pZ25vcmVcbiAgc3RyZWFtLm91dHB1dCA9IG91dHB1dDtcblxuICBpZiAoIWlzUmVhZGFibGVOb2RlU3RyZWFtKG91dHB1dCkpIHtcbiAgICBzdHJlYW0ucmVzdW1lKCk7XG4gIH1cblxuICAvLyBjb25uZWN0IGV2ZW50c1xuICBzdHJlYW1zLmZvckVhY2goKGl0ZW06IGFueSkgPT4gaXRlbS5vbihcImVycm9yXCIsIChlcnJvcjogYW55KSA9PiBzdHJlYW0uZW1pdChcImVycm9yXCIsIGVycm9yKSkpO1xuXG4gIHJldHVybiBzdHJlYW07XG59XG4iLCAiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50ICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb250cm9sLXJlZ2V4ICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11c2VsZXNzLWVzY2FwZSAqL1xuaW1wb3J0IHsgZmx1c2hhYmxlLCBnZW4sIG1hbnksIG5vbmUsIGNvbWJpbmVNYW55TXV0IH0gZnJvbSBcIi4vc3RyZWFtLWNoYWluXCI7XG5pbXBvcnQgeyBTdHJpbmdEZWNvZGVyIH0gZnJvbSBcIm5vZGU6c3RyaW5nX2RlY29kZXJcIjtcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSBcIm5vZGU6ZXZlbnRzXCI7XG5cbmNvbnN0IGZpeFV0ZjhTdHJlYW0gPSAoKSA9PiB7XG4gIGNvbnN0IHN0cmluZ0RlY29kZXIgPSBuZXcgU3RyaW5nRGVjb2RlcigpO1xuICBsZXQgaW5wdXQgPSBcIlwiO1xuICByZXR1cm4gZmx1c2hhYmxlKChjaHVuazogYW55KSA9PiB7XG4gICAgaWYgKGNodW5rID09PSBub25lKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBpbnB1dCArIHN0cmluZ0RlY29kZXIuZW5kKCk7XG4gICAgICBpbnB1dCA9IFwiXCI7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNodW5rID09IFwic3RyaW5nXCIpIHtcbiAgICAgIGlmICghaW5wdXQpIHJldHVybiBjaHVuaztcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGlucHV0ICsgY2h1bms7XG4gICAgICBpbnB1dCA9IFwiXCI7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBpZiAoY2h1bmsgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGlucHV0ICsgc3RyaW5nRGVjb2Rlci53cml0ZShjaHVuayk7XG4gICAgICBpbnB1dCA9IFwiXCI7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgYSBzdHJpbmcgb3IgYSBCdWZmZXJcIik7XG4gIH0pO1xufTtcblxuY29uc3QgcGF0dGVybnMgPSB7XG4gIHZhbHVlMTogL1tcXFwiXFx7XFxbXFxdXFwtXFxkXXx0cnVlXFxifGZhbHNlXFxifG51bGxcXGJ8XFxzezEsMjU2fS95LFxuICBzdHJpbmc6IC9bXlxceDAwLVxceDFmXFxcIlxcXFxdezEsMjU2fXxcXFxcW2JmbnJ0XFxcIlxcXFxcXC9dfFxcXFx1W1xcZGEtZkEtRl17NH18XFxcIi95LFxuICBrZXkxOiAvW1xcXCJcXH1dfFxcc3sxLDI1Nn0veSxcbiAgY29sb246IC9cXDp8XFxzezEsMjU2fS95LFxuICBjb21tYTogL1tcXCxcXF1cXH1dfFxcc3sxLDI1Nn0veSxcbiAgd3M6IC9cXHN7MSwyNTZ9L3ksXG4gIG51bWJlclN0YXJ0OiAvXFxkL3ksXG4gIG51bWJlckRpZ2l0OiAvXFxkezAsMjU2fS95LFxuICBudW1iZXJGcmFjdGlvbjogL1tcXC5lRV0veSxcbiAgbnVtYmVyRXhwb25lbnQ6IC9bZUVdL3ksXG4gIG51bWJlckV4cFNpZ246IC9bLStdL3ksXG59O1xuY29uc3QgTUFYX1BBVFRFUk5fU0laRSA9IDE2O1xuXG5jb25zdCB2YWx1ZXM6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7IHRydWU6IHRydWUsIGZhbHNlOiBmYWxzZSwgbnVsbDogbnVsbCB9LFxuICBleHBlY3RlZDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHsgb2JqZWN0OiBcIm9iamVjdFN0b3BcIiwgYXJyYXk6IFwiYXJyYXlTdG9wXCIsIFwiXCI6IFwiZG9uZVwiIH07XG5cbi8vIGxvbmcgaGV4YWRlY2ltYWwgY29kZXM6IFxcdVhYWFhcbmNvbnN0IGZyb21IZXggPSAoczogc3RyaW5nKSA9PiBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KHMuc2xpY2UoMiksIDE2KSk7XG5cbi8vIHNob3J0IGNvZGVzOiBcXGIgXFxmIFxcbiBcXHIgXFx0IFxcXCIgXFxcXCBcXC9cbmNvbnN0IGNvZGVzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge1xuICBiOiBcIlxcYlwiLFxuICBmOiBcIlxcZlwiLFxuICBuOiBcIlxcblwiLFxuICByOiBcIlxcclwiLFxuICB0OiBcIlxcdFwiLFxuICAnXCInOiAnXCInLFxuICBcIlxcXFxcIjogXCJcXFxcXCIsXG4gIFwiL1wiOiBcIi9cIixcbn07XG5cbmNvbnN0IGpzb25QYXJzZXIgPSAob3B0aW9ucz86IGFueSkgPT4ge1xuICBsZXQgcGFja0tleXMgPSB0cnVlLFxuICAgIHBhY2tTdHJpbmdzID0gdHJ1ZSxcbiAgICBwYWNrTnVtYmVycyA9IHRydWUsXG4gICAgc3RyZWFtS2V5cyA9IHRydWUsXG4gICAgc3RyZWFtU3RyaW5ncyA9IHRydWUsXG4gICAgc3RyZWFtTnVtYmVycyA9IHRydWUsXG4gICAganNvblN0cmVhbWluZyA9IGZhbHNlO1xuXG4gIGlmIChvcHRpb25zKSB7XG4gICAgXCJwYWNrVmFsdWVzXCIgaW4gb3B0aW9ucyAmJiAocGFja0tleXMgPSBwYWNrU3RyaW5ncyA9IHBhY2tOdW1iZXJzID0gb3B0aW9ucy5wYWNrVmFsdWVzKTtcbiAgICBcInBhY2tLZXlzXCIgaW4gb3B0aW9ucyAmJiAocGFja0tleXMgPSBvcHRpb25zLnBhY2tLZXlzKTtcbiAgICBcInBhY2tTdHJpbmdzXCIgaW4gb3B0aW9ucyAmJiAocGFja1N0cmluZ3MgPSBvcHRpb25zLnBhY2tTdHJpbmdzKTtcbiAgICBcInBhY2tOdW1iZXJzXCIgaW4gb3B0aW9ucyAmJiAocGFja051bWJlcnMgPSBvcHRpb25zLnBhY2tOdW1iZXJzKTtcbiAgICBcInN0cmVhbVZhbHVlc1wiIGluIG9wdGlvbnMgJiYgKHN0cmVhbUtleXMgPSBzdHJlYW1TdHJpbmdzID0gc3RyZWFtTnVtYmVycyA9IG9wdGlvbnMuc3RyZWFtVmFsdWVzKTtcbiAgICBcInN0cmVhbUtleXNcIiBpbiBvcHRpb25zICYmIChzdHJlYW1LZXlzID0gb3B0aW9ucy5zdHJlYW1LZXlzKTtcbiAgICBcInN0cmVhbVN0cmluZ3NcIiBpbiBvcHRpb25zICYmIChzdHJlYW1TdHJpbmdzID0gb3B0aW9ucy5zdHJlYW1TdHJpbmdzKTtcbiAgICBcInN0cmVhbU51bWJlcnNcIiBpbiBvcHRpb25zICYmIChzdHJlYW1OdW1iZXJzID0gb3B0aW9ucy5zdHJlYW1OdW1iZXJzKTtcbiAgICBqc29uU3RyZWFtaW5nID0gb3B0aW9ucy5qc29uU3RyZWFtaW5nO1xuICB9XG5cbiAgIXBhY2tLZXlzICYmIChzdHJlYW1LZXlzID0gdHJ1ZSk7XG4gICFwYWNrU3RyaW5ncyAmJiAoc3RyZWFtU3RyaW5ncyA9IHRydWUpO1xuICAhcGFja051bWJlcnMgJiYgKHN0cmVhbU51bWJlcnMgPSB0cnVlKTtcblxuICBsZXQgZG9uZSA9IGZhbHNlLFxuICAgIGV4cGVjdCA9IGpzb25TdHJlYW1pbmcgPyBcImRvbmVcIiA6IFwidmFsdWVcIixcbiAgICBwYXJlbnQgPSBcIlwiLFxuICAgIG9wZW5OdW1iZXIgPSBmYWxzZSxcbiAgICBhY2N1bXVsYXRvciA9IFwiXCIsXG4gICAgYnVmZmVyID0gXCJcIjtcblxuICBjb25zdCBzdGFjazogYW55W10gPSBbXTtcblxuICByZXR1cm4gZmx1c2hhYmxlKChidWY6IGFueSkgPT4ge1xuICAgIGNvbnN0IHRva2VuczogYW55W10gPSBbXTtcblxuICAgIGlmIChidWYgPT09IG5vbmUpIHtcbiAgICAgIGRvbmUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXIgKz0gYnVmO1xuICAgIH1cblxuICAgIGxldCBtYXRjaDogYW55O1xuICAgIGxldCB2YWx1ZTogYW55O1xuICAgIGxldCBpbmRleCA9IDA7XG5cbiAgICBtYWluOiBmb3IgKDs7KSB7XG4gICAgICBzd2l0Y2ggKGV4cGVjdCkge1xuICAgICAgICBjYXNlIFwidmFsdWUxXCI6XG4gICAgICAgIGNhc2UgXCJ2YWx1ZVwiOlxuICAgICAgICAgIHBhdHRlcm5zLnZhbHVlMS5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLnZhbHVlMS5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGRvbmUgfHwgaW5kZXggKyBNQVhfUEFUVEVSTl9TSVpFIDwgYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiBleHBlY3RlZCBhIHZhbHVlXCIpO1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgaGFzIGV4cGVjdGVkIGEgdmFsdWVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gbWF0Y2hbMF07XG4gICAgICAgICAgc3dpdGNoICh2YWx1ZSkge1xuICAgICAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgICBpZiAoc3RyZWFtU3RyaW5ncykgdG9rZW5zLnB1c2goeyBuYW1lOiBcInN0YXJ0U3RyaW5nXCIgfSk7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IFwic3RyaW5nXCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIntcIjpcbiAgICAgICAgICAgICAgdG9rZW5zLnB1c2goeyBuYW1lOiBcInN0YXJ0T2JqZWN0XCIgfSk7XG4gICAgICAgICAgICAgIHN0YWNrLnB1c2gocGFyZW50KTtcbiAgICAgICAgICAgICAgcGFyZW50ID0gXCJvYmplY3RcIjtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJrZXkxXCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIltcIjpcbiAgICAgICAgICAgICAgdG9rZW5zLnB1c2goeyBuYW1lOiBcInN0YXJ0QXJyYXlcIiB9KTtcbiAgICAgICAgICAgICAgc3RhY2sucHVzaChwYXJlbnQpO1xuICAgICAgICAgICAgICBwYXJlbnQgPSBcImFycmF5XCI7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IFwidmFsdWUxXCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIl1cIjpcbiAgICAgICAgICAgICAgaWYgKGV4cGVjdCAhPT0gXCJ2YWx1ZTFcIikgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGNhbm5vdCBwYXJzZSBpbnB1dDogdW5leHBlY3RlZCB0b2tlbiAnXSdcIik7XG4gICAgICAgICAgICAgIGlmIChvcGVuTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJlbmROdW1iZXJcIiB9KTtcbiAgICAgICAgICAgICAgICBvcGVuTnVtYmVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHBhY2tOdW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyVmFsdWVcIiwgdmFsdWU6IGFjY3VtdWxhdG9yIH0pO1xuICAgICAgICAgICAgICAgICAgYWNjdW11bGF0b3IgPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwiZW5kQXJyYXlcIiB9KTtcbiAgICAgICAgICAgICAgcGFyZW50ID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IGV4cGVjdGVkW3BhcmVudF07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIi1cIjpcbiAgICAgICAgICAgICAgb3Blbk51bWJlciA9IHRydWU7XG4gICAgICAgICAgICAgIGlmIChzdHJlYW1OdW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goeyBuYW1lOiBcInN0YXJ0TnVtYmVyXCIgfSwgeyBuYW1lOiBcIm51bWJlckNodW5rXCIsIHZhbHVlOiBcIi1cIiB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgPSBcIi1cIik7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IFwibnVtYmVyU3RhcnRcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiMFwiOlxuICAgICAgICAgICAgICBvcGVuTnVtYmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnROdW1iZXJcIiB9LCB7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IFwiMFwiIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBhY2tOdW1iZXJzICYmIChhY2N1bXVsYXRvciA9IFwiMFwiKTtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJudW1iZXJGcmFjdGlvblwiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCIxXCI6XG4gICAgICAgICAgICBjYXNlIFwiMlwiOlxuICAgICAgICAgICAgY2FzZSBcIjNcIjpcbiAgICAgICAgICAgIGNhc2UgXCI0XCI6XG4gICAgICAgICAgICBjYXNlIFwiNVwiOlxuICAgICAgICAgICAgY2FzZSBcIjZcIjpcbiAgICAgICAgICAgIGNhc2UgXCI3XCI6XG4gICAgICAgICAgICBjYXNlIFwiOFwiOlxuICAgICAgICAgICAgY2FzZSBcIjlcIjpcbiAgICAgICAgICAgICAgb3Blbk51bWJlciA9IHRydWU7XG4gICAgICAgICAgICAgIGlmIChzdHJlYW1OdW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goeyBuYW1lOiBcInN0YXJ0TnVtYmVyXCIgfSwgeyBuYW1lOiBcIm51bWJlckNodW5rXCIsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgPSB2YWx1ZSk7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IFwibnVtYmVyRGlnaXRcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwidHJ1ZVwiOlxuICAgICAgICAgICAgY2FzZSBcImZhbHNlXCI6XG4gICAgICAgICAgICBjYXNlIFwibnVsbFwiOlxuICAgICAgICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCAtIGluZGV4ID09PSB2YWx1ZS5sZW5ndGggJiYgIWRvbmUpIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICAgICAgdG9rZW5zLnB1c2goeyBuYW1lOiB2YWx1ZSArIFwiVmFsdWVcIiwgdmFsdWU6IHZhbHVlc1t2YWx1ZV0gfSk7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IGV4cGVjdGVkW3BhcmVudF07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gZGVmYXVsdDogLy8gd3NcbiAgICAgICAgICB9XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwia2V5VmFsXCI6XG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICBwYXR0ZXJucy5zdHJpbmcubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5zdHJpbmcuZXhlYyhidWZmZXIpO1xuICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGggJiYgKGRvbmUgfHwgYnVmZmVyLmxlbmd0aCAtIGluZGV4ID49IDYpKVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiBlc2NhcGVkIGNoYXJhY3RlcnNcIik7XG4gICAgICAgICAgICBpZiAoZG9uZSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGhhcyBleHBlY3RlZCBhIHN0cmluZyB2YWx1ZVwiKTtcbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAodmFsdWUgPT09ICdcIicpIHtcbiAgICAgICAgICAgIGlmIChleHBlY3QgPT09IFwia2V5VmFsXCIpIHtcbiAgICAgICAgICAgICAgaWYgKHN0cmVhbUtleXMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJlbmRLZXlcIiB9KTtcbiAgICAgICAgICAgICAgaWYgKHBhY2tLZXlzKSB7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goeyBuYW1lOiBcImtleVZhbHVlXCIsIHZhbHVlOiBhY2N1bXVsYXRvciB9KTtcbiAgICAgICAgICAgICAgICBhY2N1bXVsYXRvciA9IFwiXCI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJjb2xvblwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHN0cmVhbVN0cmluZ3MpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJlbmRTdHJpbmdcIiB9KTtcbiAgICAgICAgICAgICAgaWYgKHBhY2tTdHJpbmdzKSB7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goeyBuYW1lOiBcInN0cmluZ1ZhbHVlXCIsIHZhbHVlOiBhY2N1bXVsYXRvciB9KTtcbiAgICAgICAgICAgICAgICBhY2N1bXVsYXRvciA9IFwiXCI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlLmxlbmd0aCA+IDEgJiYgdmFsdWUuY2hhckF0KDApID09PSBcIlxcXFxcIikge1xuICAgICAgICAgICAgY29uc3QgdCA9IHZhbHVlLmxlbmd0aCA9PSAyID8gY29kZXNbdmFsdWUuY2hhckF0KDEpXSA6IGZyb21IZXgodmFsdWUpO1xuICAgICAgICAgICAgaWYgKGV4cGVjdCA9PT0gXCJrZXlWYWxcIiA/IHN0cmVhbUtleXMgOiBzdHJlYW1TdHJpbmdzKSB7XG4gICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJzdHJpbmdDaHVua1wiLCB2YWx1ZTogdCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChleHBlY3QgPT09IFwia2V5VmFsXCIgPyBwYWNrS2V5cyA6IHBhY2tTdHJpbmdzKSB7XG4gICAgICAgICAgICAgIGFjY3VtdWxhdG9yICs9IHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChleHBlY3QgPT09IFwia2V5VmFsXCIgPyBzdHJlYW1LZXlzIDogc3RyZWFtU3RyaW5ncykge1xuICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RyaW5nQ2h1bmtcIiwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV4cGVjdCA9PT0gXCJrZXlWYWxcIiA/IHBhY2tLZXlzIDogcGFja1N0cmluZ3MpIHtcbiAgICAgICAgICAgICAgYWNjdW11bGF0b3IgKz0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImtleTFcIjpcbiAgICAgICAgY2FzZSBcImtleVwiOlxuICAgICAgICAgIHBhdHRlcm5zLmtleTEubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5rZXkxLmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoIHx8IGRvbmUpIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IGV4cGVjdGVkIGFuIG9iamVjdCBrZXlcIik7XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gbWF0Y2hbMF07XG4gICAgICAgICAgaWYgKHZhbHVlID09PSAnXCInKSB7XG4gICAgICAgICAgICBpZiAoc3RyZWFtS2V5cykgdG9rZW5zLnB1c2goeyBuYW1lOiBcInN0YXJ0S2V5XCIgfSk7XG4gICAgICAgICAgICBleHBlY3QgPSBcImtleVZhbFwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IFwifVwiKSB7XG4gICAgICAgICAgICBpZiAoZXhwZWN0ICE9PSBcImtleTFcIikgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGNhbm5vdCBwYXJzZSBpbnB1dDogdW5leHBlY3RlZCB0b2tlbiAnfSdcIik7XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwiZW5kT2JqZWN0XCIgfSk7XG4gICAgICAgICAgICBwYXJlbnQgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgIGV4cGVjdCA9IGV4cGVjdGVkW3BhcmVudF07XG4gICAgICAgICAgfVxuICAgICAgICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImNvbG9uXCI6XG4gICAgICAgICAgcGF0dGVybnMuY29sb24ubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5jb2xvbi5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCB8fCBkb25lKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiBleHBlY3RlZCAnOidcIik7XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gbWF0Y2hbMF07XG4gICAgICAgICAgdmFsdWUgPT09IFwiOlwiICYmIChleHBlY3QgPSBcInZhbHVlXCIpO1xuICAgICAgICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImFycmF5U3RvcFwiOlxuICAgICAgICBjYXNlIFwib2JqZWN0U3RvcFwiOlxuICAgICAgICAgIHBhdHRlcm5zLmNvbW1hLmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1hdGNoID0gcGF0dGVybnMuY29tbWEuZXhlYyhidWZmZXIpO1xuICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGggfHwgZG9uZSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGNhbm5vdCBwYXJzZSBpbnB1dDogZXhwZWN0ZWQgJywnXCIpO1xuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3Blbk51bWJlcikge1xuICAgICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJlbmROdW1iZXJcIiB9KTtcbiAgICAgICAgICAgIG9wZW5OdW1iZXIgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChwYWNrTnVtYmVycykge1xuICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyVmFsdWVcIiwgdmFsdWU6IGFjY3VtdWxhdG9yIH0pO1xuICAgICAgICAgICAgICBhY2N1bXVsYXRvciA9IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gbWF0Y2hbMF07XG4gICAgICAgICAgaWYgKHZhbHVlID09PSBcIixcIikge1xuICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ID09PSBcImFycmF5U3RvcFwiID8gXCJ2YWx1ZVwiIDogXCJrZXlcIjtcbiAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBcIn1cIiB8fCB2YWx1ZSA9PT0gXCJdXCIpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gXCJ9XCIgPyBleHBlY3QgPT09IFwiYXJyYXlTdG9wXCIgOiBleHBlY3QgIT09IFwiYXJyYXlTdG9wXCIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGNhbm5vdCBwYXJzZSBpbnB1dDogZXhwZWN0ZWQgJ1wiICsgKGV4cGVjdCA9PT0gXCJhcnJheVN0b3BcIiA/IFwiXVwiIDogXCJ9XCIpICsgXCInXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9rZW5zLnB1c2goeyBuYW1lOiB2YWx1ZSA9PT0gXCJ9XCIgPyBcImVuZE9iamVjdFwiIDogXCJlbmRBcnJheVwiIH0pO1xuICAgICAgICAgICAgcGFyZW50ID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgICBleHBlY3QgPSBleHBlY3RlZFtwYXJlbnRdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIG51bWJlciBjaHVua3NcbiAgICAgICAgY2FzZSBcIm51bWJlclN0YXJ0XCI6IC8vIFswLTldXG4gICAgICAgICAgcGF0dGVybnMubnVtYmVyU3RhcnQubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5udW1iZXJTdGFydC5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCB8fCBkb25lKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiBleHBlY3RlZCBhIHN0YXJ0aW5nIGRpZ2l0XCIpO1xuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmIChzdHJlYW1OdW1iZXJzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICAgIHBhY2tOdW1iZXJzICYmIChhY2N1bXVsYXRvciArPSB2YWx1ZSk7XG4gICAgICAgICAgZXhwZWN0ID0gdmFsdWUgPT09IFwiMFwiID8gXCJudW1iZXJGcmFjdGlvblwiIDogXCJudW1iZXJEaWdpdFwiO1xuICAgICAgICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIm51bWJlckRpZ2l0XCI6IC8vIFswLTldKlxuICAgICAgICAgIHBhdHRlcm5zLm51bWJlckRpZ2l0Lmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1hdGNoID0gcGF0dGVybnMubnVtYmVyRGlnaXQuZXhlYyhidWZmZXIpO1xuICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGggfHwgZG9uZSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGNhbm5vdCBwYXJzZSBpbnB1dDogZXhwZWN0ZWQgYSBkaWdpdFwiKTtcbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChzdHJlYW1OdW1iZXJzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICAgICAgcGFja051bWJlcnMgJiYgKGFjY3VtdWxhdG9yICs9IHZhbHVlKTtcbiAgICAgICAgICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICAgICAgICBleHBlY3QgPSBcIm51bWJlckZyYWN0aW9uXCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibnVtYmVyRnJhY3Rpb25cIjogLy8gW1xcLmVFXT9cbiAgICAgICAgICBwYXR0ZXJucy5udW1iZXJGcmFjdGlvbi5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLm51bWJlckZyYWN0aW9uLmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoIHx8IGRvbmUpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gbWF0Y2hbMF07XG4gICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJDaHVua1wiLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgICAgcGFja051bWJlcnMgJiYgKGFjY3VtdWxhdG9yICs9IHZhbHVlKTtcbiAgICAgICAgICBleHBlY3QgPSB2YWx1ZSA9PT0gXCIuXCIgPyBcIm51bWJlckZyYWNTdGFydFwiIDogXCJudW1iZXJFeHBTaWduXCI7XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibnVtYmVyRnJhY1N0YXJ0XCI6IC8vIFswLTldXG4gICAgICAgICAgcGF0dGVybnMubnVtYmVyU3RhcnQubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5udW1iZXJTdGFydC5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCB8fCBkb25lKVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiBleHBlY3RlZCBhIGZyYWN0aW9uYWwgcGFydCBvZiBhIG51bWJlclwiKTtcbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcIm51bWJlckNodW5rXCIsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgKz0gdmFsdWUpO1xuICAgICAgICAgIGV4cGVjdCA9IFwibnVtYmVyRnJhY0RpZ2l0XCI7XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibnVtYmVyRnJhY0RpZ2l0XCI6IC8vIFswLTldKlxuICAgICAgICAgIHBhdHRlcm5zLm51bWJlckRpZ2l0Lmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1hdGNoID0gcGF0dGVybnMubnVtYmVyRGlnaXQuZXhlYyhidWZmZXIpO1xuICAgICAgICAgIHZhbHVlID0gbWF0Y2hbMF07XG4gICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcIm51bWJlckNodW5rXCIsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgICAgIHBhY2tOdW1iZXJzICYmIChhY2N1bXVsYXRvciArPSB2YWx1ZSk7XG4gICAgICAgICAgICBpbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJudW1iZXJFeHBvbmVudFwiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IGV4cGVjdGVkW3BhcmVudF07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIm51bWJlckV4cG9uZW50XCI6IC8vIFtlRV0/XG4gICAgICAgICAgcGF0dGVybnMubnVtYmVyRXhwb25lbnQubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5udW1iZXJFeHBvbmVudC5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICAgICAgICBleHBlY3QgPSBleHBlY3RlZFtwYXJlbnRdO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IFwiZG9uZVwiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcIm51bWJlckNodW5rXCIsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgKz0gdmFsdWUpO1xuICAgICAgICAgIGV4cGVjdCA9IFwibnVtYmVyRXhwU2lnblwiO1xuICAgICAgICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIm51bWJlckV4cFNpZ25cIjogLy8gWy0rXT9cbiAgICAgICAgICBwYXR0ZXJucy5udW1iZXJFeHBTaWduLmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1hdGNoID0gcGF0dGVybnMubnVtYmVyRXhwU2lnbi5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICAgICAgICBleHBlY3QgPSBcIm51bWJlckV4cFN0YXJ0XCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRvbmUpIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBoYXMgZXhwZWN0ZWQgYW4gZXhwb25lbnQgdmFsdWUgb2YgYSBudW1iZXJcIik7XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gbWF0Y2hbMF07XG4gICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJDaHVua1wiLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgICAgcGFja051bWJlcnMgJiYgKGFjY3VtdWxhdG9yICs9IHZhbHVlKTtcbiAgICAgICAgICBleHBlY3QgPSBcIm51bWJlckV4cFN0YXJ0XCI7XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibnVtYmVyRXhwU3RhcnRcIjogLy8gWzAtOV1cbiAgICAgICAgICBwYXR0ZXJucy5udW1iZXJTdGFydC5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLm51bWJlclN0YXJ0LmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoIHx8IGRvbmUpXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IGV4cGVjdGVkIGFuIGV4cG9uZW50IHBhcnQgb2YgYSBudW1iZXJcIik7XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gbWF0Y2hbMF07XG4gICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJDaHVua1wiLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgICAgcGFja051bWJlcnMgJiYgKGFjY3VtdWxhdG9yICs9IHZhbHVlKTtcbiAgICAgICAgICBleHBlY3QgPSBcIm51bWJlckV4cERpZ2l0XCI7XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibnVtYmVyRXhwRGlnaXRcIjogLy8gWzAtOV0qXG4gICAgICAgICAgcGF0dGVybnMubnVtYmVyRGlnaXQubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5udW1iZXJEaWdpdC5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChzdHJlYW1OdW1iZXJzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICAgICAgcGFja051bWJlcnMgJiYgKGFjY3VtdWxhdG9yICs9IHZhbHVlKTtcbiAgICAgICAgICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCB8fCBkb25lKSB7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IGV4cGVjdGVkW3BhcmVudF07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImRvbmVcIjpcbiAgICAgICAgICBwYXR0ZXJucy53cy5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLndzLmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGlmIChqc29uU3RyZWFtaW5nKSB7XG4gICAgICAgICAgICAgICAgZXhwZWN0ID0gXCJ2YWx1ZVwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IHVuZXhwZWN0ZWQgY2hhcmFjdGVyc1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAob3Blbk51bWJlcikge1xuICAgICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJlbmROdW1iZXJcIiB9KTtcbiAgICAgICAgICAgIG9wZW5OdW1iZXIgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChwYWNrTnVtYmVycykge1xuICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyVmFsdWVcIiwgdmFsdWU6IGFjY3VtdWxhdG9yIH0pO1xuICAgICAgICAgICAgICBhY2N1bXVsYXRvciA9IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRvbmUgJiYgb3Blbk51bWJlcikge1xuICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJlbmROdW1iZXJcIiB9KTtcbiAgICAgIG9wZW5OdW1iZXIgPSBmYWxzZTtcbiAgICAgIGlmIChwYWNrTnVtYmVycykge1xuICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyVmFsdWVcIiwgdmFsdWU6IGFjY3VtdWxhdG9yIH0pO1xuICAgICAgICBhY2N1bXVsYXRvciA9IFwiXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGJ1ZmZlciA9IGJ1ZmZlci5zbGljZShpbmRleCk7XG4gICAgcmV0dXJuIHRva2Vucy5sZW5ndGggPyBtYW55KHRva2VucykgOiBub25lO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBwYXJzZXIgPSAob3B0aW9ucz86IGFueSkgPT4gZ2VuKGZpeFV0ZjhTdHJlYW0oKSwganNvblBhcnNlcihvcHRpb25zKSk7XG5cbmNvbnN0IHdpdGhQYXJzZXIgPSAoZm46IGFueSwgb3B0aW9ucz86IGFueSkgPT4gZ2VuKHBhcnNlcihvcHRpb25zKSwgZm4ob3B0aW9ucykpO1xuXG5jb25zdCBjaGVja2FibGVUb2tlbnMgPSB7XG4gICAgc3RhcnRPYmplY3Q6IDEsXG4gICAgc3RhcnRBcnJheTogMSxcbiAgICBzdGFydFN0cmluZzogMSxcbiAgICBzdGFydE51bWJlcjogMSxcbiAgICBudWxsVmFsdWU6IDEsXG4gICAgdHJ1ZVZhbHVlOiAxLFxuICAgIGZhbHNlVmFsdWU6IDEsXG4gICAgc3RyaW5nVmFsdWU6IDEsXG4gICAgbnVtYmVyVmFsdWU6IDEsXG4gIH0sXG4gIHN0b3BUb2tlbnMgPSB7XG4gICAgc3RhcnRPYmplY3Q6IFwiZW5kT2JqZWN0XCIsXG4gICAgc3RhcnRBcnJheTogXCJlbmRBcnJheVwiLFxuICAgIHN0YXJ0U3RyaW5nOiBcImVuZFN0cmluZ1wiLFxuICAgIHN0YXJ0TnVtYmVyOiBcImVuZE51bWJlclwiLFxuICB9LFxuICBvcHRpb25hbFRva2VucyA9IHsgZW5kU3RyaW5nOiBcInN0cmluZ1ZhbHVlXCIsIGVuZE51bWJlcjogXCJudW1iZXJWYWx1ZVwiIH07XG5cbmNvbnN0IGRlZmF1bHRGaWx0ZXIgPSAoX3N0YWNrOiBzdHJpbmdbXSwgX2E6IGFueSkgPT4gdHJ1ZTtcblxuY29uc3Qgc3RyaW5nRmlsdGVyID0gKHN0cmluZzogc3RyaW5nLCBzZXBhcmF0b3I6IHN0cmluZykgPT4ge1xuICBjb25zdCBzdHJpbmdXaXRoU2VwYXJhdG9yID0gc3RyaW5nICsgc2VwYXJhdG9yO1xuICByZXR1cm4gKHN0YWNrOiBzdHJpbmdbXSwgX2E6IGFueSkgPT4ge1xuICAgIGNvbnN0IHBhdGggPSBzdGFjay5qb2luKHNlcGFyYXRvcik7XG4gICAgcmV0dXJuIHBhdGggPT09IHN0cmluZyB8fCBwYXRoLnN0YXJ0c1dpdGgoc3RyaW5nV2l0aFNlcGFyYXRvcik7XG4gIH07XG59O1xuXG5jb25zdCByZWdFeHBGaWx0ZXIgPSAocmVnRXhwOiBSZWdFeHAsIHNlcGFyYXRvcjogc3RyaW5nKSA9PiB7XG4gIHJldHVybiAoc3RhY2s6IHN0cmluZ1tdLCBfYTogYW55KSA9PiByZWdFeHAudGVzdChzdGFjay5qb2luKHNlcGFyYXRvcikpO1xufTtcblxuY29uc3QgZmlsdGVyQmFzZSA9XG4gICh7XG4gICAgc3BlY2lhbEFjdGlvbiA9IFwiYWNjZXB0XCIsXG4gICAgZGVmYXVsdEFjdGlvbiA9IFwiaWdub3JlXCIsXG4gICAgbm9uQ2hlY2thYmxlQWN0aW9uID0gXCJwcm9jZXNzLWtleVwiLFxuICAgIHRyYW5zaXRpb24gPSB1bmRlZmluZWQgYXMgYW55LFxuICB9ID0ge30pID0+XG4gIChvcHRpb25zOiBhbnkpID0+IHtcbiAgICBjb25zdCBvbmNlID0gb3B0aW9ucz8ub25jZSxcbiAgICAgIHNlcGFyYXRvciA9IG9wdGlvbnM/LnBhdGhTZXBhcmF0b3IgfHwgXCIuXCI7XG4gICAgbGV0IGZpbHRlciA9IGRlZmF1bHRGaWx0ZXIsXG4gICAgICBzdHJlYW1LZXlzID0gdHJ1ZTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmZpbHRlciA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgZmlsdGVyID0gb3B0aW9ucy5maWx0ZXI7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zLmZpbHRlciA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGZpbHRlciA9IHN0cmluZ0ZpbHRlcihvcHRpb25zLmZpbHRlciwgc2VwYXJhdG9yKTtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5maWx0ZXIgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgZmlsdGVyID0gcmVnRXhwRmlsdGVyKG9wdGlvbnMuZmlsdGVyLCBzZXBhcmF0b3IpO1xuICAgICAgfVxuICAgICAgaWYgKFwic3RyZWFtVmFsdWVzXCIgaW4gb3B0aW9ucykgc3RyZWFtS2V5cyA9IG9wdGlvbnMuc3RyZWFtVmFsdWVzO1xuICAgICAgaWYgKFwic3RyZWFtS2V5c1wiIGluIG9wdGlvbnMpIHN0cmVhbUtleXMgPSBvcHRpb25zLnN0cmVhbUtleXM7XG4gICAgfVxuICAgIGNvbnN0IHNhbml0aXplZE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7IGZpbHRlciwgc3RyZWFtS2V5cywgc2VwYXJhdG9yIH0pO1xuICAgIGxldCBzdGF0ZSA9IFwiY2hlY2tcIjtcbiAgICBjb25zdCBzdGFjazogYW55W10gPSBbXTtcbiAgICBsZXQgZGVwdGggPSAwLFxuICAgICAgcHJldmlvdXNUb2tlbiA9IFwiXCIsXG4gICAgICBlbmRUb2tlbiA9IFwiXCIsXG4gICAgICBvcHRpb25hbFRva2VuID0gXCJcIixcbiAgICAgIHN0YXJ0VHJhbnNpdGlvbiA9IGZhbHNlO1xuICAgIHJldHVybiBmbHVzaGFibGUoKGNodW5rKSA9PiB7XG4gICAgICAvLyB0aGUgZmx1c2hcbiAgICAgIGlmIChjaHVuayA9PT0gbm9uZSkgcmV0dXJuIHRyYW5zaXRpb24gPyB0cmFuc2l0aW9uKFtdLCBudWxsLCBcImZsdXNoXCIsIHNhbml0aXplZE9wdGlvbnMpIDogbm9uZTtcblxuICAgICAgLy8gcHJvY2VzcyB0aGUgb3B0aW9uYWwgdmFsdWUgdG9rZW4gKHVuZmluaXNoZWQpXG4gICAgICBpZiAob3B0aW9uYWxUb2tlbikge1xuICAgICAgICBpZiAob3B0aW9uYWxUb2tlbiA9PT0gY2h1bmsubmFtZSkge1xuICAgICAgICAgIGxldCByZXR1cm5Ub2tlbiA9IG5vbmU7XG4gICAgICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSBcInByb2Nlc3Mta2V5XCI6XG4gICAgICAgICAgICAgIHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdID0gY2h1bmsudmFsdWU7XG4gICAgICAgICAgICAgIHN0YXRlID0gXCJjaGVja1wiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJhY2NlcHQtdmFsdWVcIjpcbiAgICAgICAgICAgICAgcmV0dXJuVG9rZW4gPSBjaHVuaztcbiAgICAgICAgICAgICAgc3RhdGUgPSBvbmNlID8gXCJwYXNzXCIgOiBcImNoZWNrXCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgc3RhdGUgPSBvbmNlID8gXCJhbGxcIiA6IFwiY2hlY2tcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIG9wdGlvbmFsVG9rZW4gPSBcIlwiO1xuICAgICAgICAgIHJldHVybiByZXR1cm5Ub2tlbjtcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25hbFRva2VuID0gXCJcIjtcbiAgICAgICAgc3RhdGUgPSBvbmNlICYmIHN0YXRlICE9PSBcInByb2Nlc3Mta2V5XCIgPyBcInBhc3NcIiA6IFwiY2hlY2tcIjtcbiAgICAgIH1cblxuICAgICAgbGV0IHJldHVyblRva2VuOiBhbnkgPSBub25lO1xuXG4gICAgICByZWNoZWNrOiBmb3IgKDs7KSB7XG4gICAgICAgIC8vIGFjY2VwdC9yZWplY3QgdG9rZW5zXG4gICAgICAgIHN3aXRjaCAoc3RhdGUpIHtcbiAgICAgICAgICBjYXNlIFwicHJvY2Vzcy1rZXlcIjpcbiAgICAgICAgICAgIGlmIChjaHVuay5uYW1lID09PSBcImVuZEtleVwiKSBvcHRpb25hbFRva2VuID0gXCJrZXlWYWx1ZVwiO1xuICAgICAgICAgICAgcmV0dXJuIG5vbmU7XG4gICAgICAgICAgY2FzZSBcInBhc3NcIjpcbiAgICAgICAgICAgIHJldHVybiBub25lO1xuICAgICAgICAgIGNhc2UgXCJhbGxcIjpcbiAgICAgICAgICAgIHJldHVybiBjaHVuaztcbiAgICAgICAgICBjYXNlIFwiYWNjZXB0XCI6XG4gICAgICAgICAgY2FzZSBcInJlamVjdFwiOlxuICAgICAgICAgICAgaWYgKHN0YXJ0VHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICBzdGFydFRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuVG9rZW4gPSB0cmFuc2l0aW9uKHN0YWNrLCBjaHVuaywgc3RhdGUsIHNhbml0aXplZE9wdGlvbnMpIHx8IG5vbmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzd2l0Y2ggKGNodW5rLm5hbWUpIHtcbiAgICAgICAgICAgICAgY2FzZSBcInN0YXJ0T2JqZWN0XCI6XG4gICAgICAgICAgICAgIGNhc2UgXCJzdGFydEFycmF5XCI6XG4gICAgICAgICAgICAgICAgKytkZXB0aDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSBcImVuZE9iamVjdFwiOlxuICAgICAgICAgICAgICBjYXNlIFwiZW5kQXJyYXlcIjpcbiAgICAgICAgICAgICAgICAtLWRlcHRoO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0YXRlID09PSBcImFjY2VwdFwiKSB7XG4gICAgICAgICAgICAgIHJldHVyblRva2VuID0gY29tYmluZU1hbnlNdXQocmV0dXJuVG9rZW4sIGNodW5rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZGVwdGgpIHtcbiAgICAgICAgICAgICAgaWYgKG9uY2UpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IHN0YXRlID09PSBcImFjY2VwdFwiID8gXCJwYXNzXCIgOiBcImFsbFwiO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0YXRlID0gXCJjaGVja1wiO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuVG9rZW47XG4gICAgICAgICAgY2FzZSBcImFjY2VwdC12YWx1ZVwiOlxuICAgICAgICAgIGNhc2UgXCJyZWplY3QtdmFsdWVcIjpcbiAgICAgICAgICAgIGlmIChzdGFydFRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgICAgc3RhcnRUcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVyblRva2VuID0gdHJhbnNpdGlvbihzdGFjaywgY2h1bmssIHN0YXRlLCBzYW5pdGl6ZWRPcHRpb25zKSB8fCBub25lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0YXRlID09PSBcImFjY2VwdC12YWx1ZVwiKSB7XG4gICAgICAgICAgICAgIHJldHVyblRva2VuID0gY29tYmluZU1hbnlNdXQocmV0dXJuVG9rZW4sIGNodW5rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaHVuay5uYW1lID09PSBlbmRUb2tlbikge1xuICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgIG9wdGlvbmFsVG9rZW4gPSBvcHRpb25hbFRva2Vuc1tlbmRUb2tlbl0gfHwgXCJcIjtcbiAgICAgICAgICAgICAgZW5kVG9rZW4gPSBcIlwiO1xuICAgICAgICAgICAgICBpZiAoIW9wdGlvbmFsVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAob25jZSkge1xuICAgICAgICAgICAgICAgICAgc3RhdGUgPSBzdGF0ZSA9PT0gXCJhY2NlcHQtdmFsdWVcIiA/IFwicGFzc1wiIDogXCJhbGxcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc3RhdGUgPSBcImNoZWNrXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuVG9rZW47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgdGhlIGxhc3QgaW5kZXggaW4gdGhlIHN0YWNrXG4gICAgICAgIGlmICh0eXBlb2Ygc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0gPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgIC8vIGFycmF5XG4gICAgICAgICAgc3dpdGNoIChjaHVuay5uYW1lKSB7XG4gICAgICAgICAgICBjYXNlIFwic3RhcnRPYmplY3RcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzdGFydEFycmF5XCI6XG4gICAgICAgICAgICBjYXNlIFwic3RhcnRTdHJpbmdcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzdGFydE51bWJlclwiOlxuICAgICAgICAgICAgY2FzZSBcIm51bGxWYWx1ZVwiOlxuICAgICAgICAgICAgY2FzZSBcInRydWVWYWx1ZVwiOlxuICAgICAgICAgICAgY2FzZSBcImZhbHNlVmFsdWVcIjpcbiAgICAgICAgICAgICAgKytzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibnVtYmVyVmFsdWVcIjpcbiAgICAgICAgICAgICAgaWYgKHByZXZpb3VzVG9rZW4gIT09IFwiZW5kTnVtYmVyXCIpICsrc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1ZhbHVlXCI6XG4gICAgICAgICAgICAgIGlmIChwcmV2aW91c1Rva2VuICE9PSBcImVuZFN0cmluZ1wiKSArK3N0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGNodW5rLm5hbWUgPT09IFwia2V5VmFsdWVcIikgc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0gPSBjaHVuay52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBwcmV2aW91c1Rva2VuID0gY2h1bmsubmFtZTtcblxuICAgICAgICAvLyBjaGVjayB0aGUgdG9rZW5cbiAgICAgICAgY29uc3QgYWN0aW9uID1cbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgY2hlY2thYmxlVG9rZW5zW2NodW5rLm5hbWVdICE9PSAxID8gbm9uQ2hlY2thYmxlQWN0aW9uIDogZmlsdGVyKHN0YWNrLCBjaHVuaykgPyBzcGVjaWFsQWN0aW9uIDogZGVmYXVsdEFjdGlvbjtcblxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGVuZFRva2VuID0gc3RvcFRva2Vuc1tjaHVuay5uYW1lXSB8fCBcIlwiO1xuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgIGNhc2UgXCJwcm9jZXNzLWtleVwiOlxuICAgICAgICAgICAgaWYgKGNodW5rLm5hbWUgPT09IFwic3RhcnRLZXlcIikge1xuICAgICAgICAgICAgICBzdGF0ZSA9IFwicHJvY2Vzcy1rZXlcIjtcbiAgICAgICAgICAgICAgY29udGludWUgcmVjaGVjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJhY2NlcHQtdG9rZW5cIjpcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGlmIChlbmRUb2tlbiAmJiBvcHRpb25hbFRva2Vuc1tlbmRUb2tlbl0pIHtcbiAgICAgICAgICAgICAgc3RhdGUgPSBcImFjY2VwdC12YWx1ZVwiO1xuICAgICAgICAgICAgICBzdGFydFRyYW5zaXRpb24gPSAhIXRyYW5zaXRpb247XG4gICAgICAgICAgICAgIGNvbnRpbnVlIHJlY2hlY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbikgcmV0dXJuVG9rZW4gPSB0cmFuc2l0aW9uKHN0YWNrLCBjaHVuaywgYWN0aW9uLCBzYW5pdGl6ZWRPcHRpb25zKTtcbiAgICAgICAgICAgIHJldHVyblRva2VuID0gY29tYmluZU1hbnlNdXQocmV0dXJuVG9rZW4sIGNodW5rKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJhY2NlcHRcIjpcbiAgICAgICAgICAgIGlmIChlbmRUb2tlbikge1xuICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgIHN0YXRlID0gb3B0aW9uYWxUb2tlbnNbZW5kVG9rZW5dID8gXCJhY2NlcHQtdmFsdWVcIiA6IFwiYWNjZXB0XCI7XG4gICAgICAgICAgICAgIHN0YXJ0VHJhbnNpdGlvbiA9ICEhdHJhbnNpdGlvbjtcbiAgICAgICAgICAgICAgY29udGludWUgcmVjaGVjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uKSByZXR1cm5Ub2tlbiA9IHRyYW5zaXRpb24oc3RhY2ssIGNodW5rLCBhY3Rpb24sIHNhbml0aXplZE9wdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuVG9rZW4gPSBjb21iaW5lTWFueU11dChyZXR1cm5Ub2tlbiwgY2h1bmspO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcInJlamVjdFwiOlxuICAgICAgICAgICAgaWYgKGVuZFRva2VuKSB7XG4gICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgc3RhdGUgPSBvcHRpb25hbFRva2Vuc1tlbmRUb2tlbl0gPyBcInJlamVjdC12YWx1ZVwiIDogXCJyZWplY3RcIjtcbiAgICAgICAgICAgICAgc3RhcnRUcmFuc2l0aW9uID0gISF0cmFuc2l0aW9uO1xuICAgICAgICAgICAgICBjb250aW51ZSByZWNoZWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24pIHJldHVyblRva2VuID0gdHJhbnNpdGlvbihzdGFjaywgY2h1bmssIGFjdGlvbiwgc2FuaXRpemVkT3B0aW9ucyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwicGFzc1wiOlxuICAgICAgICAgICAgc3RhdGUgPSBcInBhc3NcIjtcbiAgICAgICAgICAgIGNvbnRpbnVlIHJlY2hlY2s7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gdXBkYXRlIHRoZSBzdGFja1xuICAgICAgc3dpdGNoIChjaHVuay5uYW1lKSB7XG4gICAgICAgIGNhc2UgXCJzdGFydE9iamVjdFwiOlxuICAgICAgICAgIHN0YWNrLnB1c2gobnVsbCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzdGFydEFycmF5XCI6XG4gICAgICAgICAgc3RhY2sucHVzaCgtMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJlbmRPYmplY3RcIjpcbiAgICAgICAgY2FzZSBcImVuZEFycmF5XCI6XG4gICAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXR1cm5Ub2tlbjtcbiAgICB9KTtcbiAgfTtcblxuZXhwb3J0IGNvbnN0IFBpY2tQYXJzZXIgPSAob3B0aW9ucz86IGFueSkgPT4gd2l0aFBhcnNlcihmaWx0ZXJCYXNlKCksIE9iamVjdC5hc3NpZ24oeyBwYWNrS2V5czogdHJ1ZSB9LCBvcHRpb25zKSk7XG5cbmNsYXNzIENvdW50ZXIge1xuICBkZXB0aDogbnVtYmVyO1xuICBjb25zdHJ1Y3Rvcihpbml0aWFsRGVwdGg6IG51bWJlcikge1xuICAgIHRoaXMuZGVwdGggPSBpbml0aWFsRGVwdGg7XG4gIH1cbiAgc3RhcnRPYmplY3QoKSB7XG4gICAgKyt0aGlzLmRlcHRoO1xuICB9XG4gIGVuZE9iamVjdCgpIHtcbiAgICAtLXRoaXMuZGVwdGg7XG4gIH1cbiAgc3RhcnRBcnJheSgpIHtcbiAgICArK3RoaXMuZGVwdGg7XG4gIH1cbiAgZW5kQXJyYXkoKSB7XG4gICAgLS10aGlzLmRlcHRoO1xuICB9XG59XG5cbmNsYXNzIEFzc2VtYmxlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIHN0YXRpYyBjb25uZWN0VG8oc3RyZWFtOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgIHJldHVybiBuZXcgQXNzZW1ibGVyKG9wdGlvbnMpLmNvbm5lY3RUbyhzdHJlYW0pO1xuICB9XG5cbiAgc3RhY2s6IGFueTtcbiAgY3VycmVudDogYW55O1xuICBrZXk6IGFueTtcbiAgZG9uZTogYm9vbGVhbjtcbiAgcmV2aXZlcjogYW55O1xuICAvLyBAdHMtaWdub3JlXG4gIHN0cmluZ1ZhbHVlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZDtcbiAgdGFwQ2hhaW46IChjaHVuazogYW55KSA9PiBhbnk7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogYW55KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnN0YWNrID0gW107XG4gICAgdGhpcy5jdXJyZW50ID0gdGhpcy5rZXkgPSBudWxsO1xuICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMucmV2aXZlciA9IHR5cGVvZiBvcHRpb25zLnJldml2ZXIgPT0gXCJmdW5jdGlvblwiICYmIG9wdGlvbnMucmV2aXZlcjtcbiAgICAgIGlmICh0aGlzLnJldml2ZXIpIHtcbiAgICAgICAgdGhpcy5zdHJpbmdWYWx1ZSA9IHRoaXMuX3NhdmVWYWx1ZSA9IHRoaXMuX3NhdmVWYWx1ZVdpdGhSZXZpdmVyO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMubnVtYmVyQXNTdHJpbmcpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLm51bWJlclZhbHVlID0gdGhpcy5zdHJpbmdWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRhcENoYWluID0gKGNodW5rKSA9PiB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBpZiAodGhpc1tjaHVuay5uYW1lXSkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXNbY2h1bmsubmFtZV0oY2h1bmsudmFsdWUpO1xuICAgICAgICBpZiAodGhpcy5kb25lKSByZXR1cm4gdGhpcy5jdXJyZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vbmU7XG4gICAgfTtcblxuICAgIHRoaXMuc3RyaW5nVmFsdWUgPSB0aGlzLl9zYXZlVmFsdWU7XG4gIH1cblxuICBjb25uZWN0VG8oc3RyZWFtOiBhbnkpIHtcbiAgICBzdHJlYW0ub24oXCJkYXRhXCIsIChjaHVuazogYW55KSA9PiB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBpZiAodGhpc1tjaHVuay5uYW1lXSkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXNbY2h1bmsubmFtZV0oY2h1bmsudmFsdWUpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmICh0aGlzLmRvbmUpIHRoaXMuZW1pdChcImRvbmVcIiwgdGhpcyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXQgZGVwdGgoKSB7XG4gICAgcmV0dXJuICh0aGlzLnN0YWNrLmxlbmd0aCA+PiAxKSArICh0aGlzLmRvbmUgPyAwIDogMSk7XG4gIH1cblxuICBnZXQgcGF0aCgpIHtcbiAgICBjb25zdCBwYXRoOiBhbnlbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdGFjay5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgY29uc3Qga2V5ID0gdGhpcy5zdGFja1tpICsgMV07XG4gICAgICBwYXRoLnB1c2goa2V5ID09PSBudWxsID8gdGhpcy5zdGFja1tpXS5sZW5ndGggOiBrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aDtcbiAgfVxuXG4gIGRyb3BUb0xldmVsKGxldmVsOiBhbnkpIHtcbiAgICBpZiAobGV2ZWwgPCB0aGlzLmRlcHRoKSB7XG4gICAgICBpZiAobGV2ZWwgPiAwKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gKGxldmVsIC0gMSkgPDwgMTtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5zdGFja1tpbmRleF07XG4gICAgICAgIHRoaXMua2V5ID0gdGhpcy5zdGFja1tpbmRleCArIDFdO1xuICAgICAgICB0aGlzLnN0YWNrLnNwbGljZShpbmRleCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnN0YWNrID0gW107XG4gICAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMua2V5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjb25zdW1lKGNodW5rOiBhbnkpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpc1tjaHVuay5uYW1lXSAmJiB0aGlzW2NodW5rLm5hbWVdKGNodW5rLnZhbHVlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGtleVZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLmtleSA9IHZhbHVlO1xuICB9XG5cbiAgLy9zdHJpbmdWYWx1ZSgpIC0gYWxpYXNlZCBiZWxvdyB0byBfc2F2ZVZhbHVlKClcblxuICBudW1iZXJWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5fc2F2ZVZhbHVlKHBhcnNlRmxvYXQodmFsdWUpKTtcbiAgfVxuICBudWxsVmFsdWUoKSB7XG4gICAgdGhpcy5fc2F2ZVZhbHVlKG51bGwpO1xuICB9XG4gIHRydWVWYWx1ZSgpIHtcbiAgICB0aGlzLl9zYXZlVmFsdWUodHJ1ZSk7XG4gIH1cbiAgZmFsc2VWYWx1ZSgpIHtcbiAgICB0aGlzLl9zYXZlVmFsdWUoZmFsc2UpO1xuICB9XG5cbiAgc3RhcnRPYmplY3QoKSB7XG4gICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhY2sucHVzaCh0aGlzLmN1cnJlbnQsIHRoaXMua2V5KTtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50ID0gbmV3IE9iamVjdCgpO1xuICAgIHRoaXMua2V5ID0gbnVsbDtcbiAgfVxuXG4gIGVuZE9iamVjdCgpIHtcbiAgICBpZiAodGhpcy5zdGFjay5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5jdXJyZW50O1xuICAgICAgdGhpcy5rZXkgPSB0aGlzLnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5zdGFjay5wb3AoKTtcbiAgICAgIHRoaXMuX3NhdmVWYWx1ZSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgc3RhcnRBcnJheSgpIHtcbiAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFjay5wdXNoKHRoaXMuY3VycmVudCwgdGhpcy5rZXkpO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnQgPSBbXTtcbiAgICB0aGlzLmtleSA9IG51bGw7XG4gIH1cblxuICBlbmRBcnJheSgpIHtcbiAgICBpZiAodGhpcy5zdGFjay5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5jdXJyZW50O1xuICAgICAgdGhpcy5rZXkgPSB0aGlzLnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5zdGFjay5wb3AoKTtcbiAgICAgIHRoaXMuX3NhdmVWYWx1ZSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgX3NhdmVWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgdGhpcy5jdXJyZW50ID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0aGlzLmN1cnJlbnQucHVzaCh2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmN1cnJlbnRbdGhpcy5rZXldID0gdmFsdWU7XG4gICAgICAgIHRoaXMua2V5ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgX3NhdmVWYWx1ZVdpdGhSZXZpdmVyKHZhbHVlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLnJldml2ZXIoXCJcIiwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5jdXJyZW50IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdmFsdWUgPSB0aGlzLnJldml2ZXIoXCJcIiArIHRoaXMuY3VycmVudC5sZW5ndGgsIHZhbHVlKTtcbiAgICAgICAgdGhpcy5jdXJyZW50LnB1c2godmFsdWUpO1xuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmN1cnJlbnRbdGhpcy5jdXJyZW50Lmxlbmd0aCAtIDFdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHRoaXMucmV2aXZlcih0aGlzLmtleSwgdmFsdWUpO1xuICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuY3VycmVudFt0aGlzLmtleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmtleSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IHN0cmVhbUJhc2UgPVxuICAoeyBwdXNoLCBmaXJzdCwgbGV2ZWwgfTogYW55KSA9PlxuICAob3B0aW9ucyA9IHt9IGFzIGFueSkgPT4ge1xuICAgIGNvbnN0IHsgb2JqZWN0RmlsdGVyLCBpbmNsdWRlVW5kZWNpZGVkIH0gPSBvcHRpb25zO1xuICAgIGxldCBhc20gPSBuZXcgQXNzZW1ibGVyKG9wdGlvbnMpIGFzIGFueSxcbiAgICAgIHN0YXRlID0gZmlyc3QgPyBcImZpcnN0XCIgOiBcImNoZWNrXCIsXG4gICAgICBzYXZlZEFzbSA9IG51bGwgYXMgYW55O1xuXG4gICAgaWYgKHR5cGVvZiBvYmplY3RGaWx0ZXIgIT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAvLyBubyBvYmplY3QgZmlsdGVyICsgbm8gZmlyc3QgY2hlY2tcbiAgICAgIGlmIChzdGF0ZSA9PT0gXCJjaGVja1wiKVxuICAgICAgICByZXR1cm4gKGNodW5rOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAoYXNtW2NodW5rLm5hbWVdKSB7XG4gICAgICAgICAgICBhc21bY2h1bmsubmFtZV0oY2h1bmsudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGFzbS5kZXB0aCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHB1c2goYXNtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5vbmU7XG4gICAgICAgIH07XG4gICAgICAvLyBubyBvYmplY3QgZmlsdGVyXG4gICAgICByZXR1cm4gKGNodW5rOiBhbnkpID0+IHtcbiAgICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICAgIGNhc2UgXCJmaXJzdFwiOlxuICAgICAgICAgICAgZmlyc3QoY2h1bmspO1xuICAgICAgICAgICAgc3RhdGUgPSBcImFjY2VwdFwiO1xuICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaFxuICAgICAgICAgIGNhc2UgXCJhY2NlcHRcIjpcbiAgICAgICAgICAgIGlmIChhc21bY2h1bmsubmFtZV0pIHtcbiAgICAgICAgICAgICAgYXNtW2NodW5rLm5hbWVdKGNodW5rLnZhbHVlKTtcbiAgICAgICAgICAgICAgaWYgKGFzbS5kZXB0aCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHVzaChhc20pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9uZTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gb2JqZWN0IGZpbHRlciArIGEgcG9zc2libGUgZmlyc3QgY2hlY2tcbiAgICByZXR1cm4gKGNodW5rOiBhbnkpID0+IHtcbiAgICAgIHN3aXRjaCAoc3RhdGUpIHtcbiAgICAgICAgY2FzZSBcImZpcnN0XCI6XG4gICAgICAgICAgZmlyc3QoY2h1bmspO1xuICAgICAgICAgIHN0YXRlID0gXCJjaGVja1wiO1xuICAgICAgICAvLyBmYWxsIHRocm91Z2hcbiAgICAgICAgY2FzZSBcImNoZWNrXCI6XG4gICAgICAgICAgaWYgKGFzbVtjaHVuay5uYW1lXSkge1xuICAgICAgICAgICAgYXNtW2NodW5rLm5hbWVdKGNodW5rLnZhbHVlKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG9iamVjdEZpbHRlcihhc20pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICBzdGF0ZSA9IFwiYWNjZXB0XCI7XG4gICAgICAgICAgICAgIGlmIChhc20uZGVwdGggPT09IGxldmVsKSByZXR1cm4gcHVzaChhc20pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgIGlmIChhc20uZGVwdGggPT09IGxldmVsKSByZXR1cm4gcHVzaChhc20sIHRydWUpO1xuICAgICAgICAgICAgICBzdGF0ZSA9IFwicmVqZWN0XCI7XG4gICAgICAgICAgICAgIHNhdmVkQXNtID0gYXNtO1xuICAgICAgICAgICAgICBhc20gPSBuZXcgQ291bnRlcihzYXZlZEFzbS5kZXB0aCk7XG4gICAgICAgICAgICAgIHNhdmVkQXNtLmRyb3BUb0xldmVsKGxldmVsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChhc20uZGVwdGggPT09IGxldmVsKSByZXR1cm4gcHVzaChhc20sICFpbmNsdWRlVW5kZWNpZGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJhY2NlcHRcIjpcbiAgICAgICAgICBpZiAoYXNtW2NodW5rLm5hbWVdKSB7XG4gICAgICAgICAgICBhc21bY2h1bmsubmFtZV0oY2h1bmsudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGFzbS5kZXB0aCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgICAgICAgc3RhdGUgPSBcImNoZWNrXCI7XG4gICAgICAgICAgICAgIHJldHVybiBwdXNoKGFzbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicmVqZWN0XCI6XG4gICAgICAgICAgaWYgKGFzbVtjaHVuay5uYW1lXSkge1xuICAgICAgICAgICAgYXNtW2NodW5rLm5hbWVdKGNodW5rLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChhc20uZGVwdGggPT09IGxldmVsKSB7XG4gICAgICAgICAgICAgIHN0YXRlID0gXCJjaGVja1wiO1xuICAgICAgICAgICAgICBhc20gPSBzYXZlZEFzbTtcbiAgICAgICAgICAgICAgc2F2ZWRBc20gPSBudWxsO1xuICAgICAgICAgICAgICByZXR1cm4gcHVzaChhc20sIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHJldHVybiBub25lO1xuICAgIH07XG4gIH07XG5cbmV4cG9ydCBjb25zdCBTdHJlYW1BcnJheSA9IChvcHRpb25zPzogYW55KSA9PiB7XG4gIGxldCBrZXkgPSAwO1xuICByZXR1cm4gc3RyZWFtQmFzZSh7XG4gICAgbGV2ZWw6IDEsXG5cbiAgICBmaXJzdChjaHVuazogYW55KSB7XG4gICAgICBpZiAoY2h1bmsubmFtZSAhPT0gXCJzdGFydEFycmF5XCIpIHRocm93IG5ldyBFcnJvcihcIlRvcC1sZXZlbCBvYmplY3Qgc2hvdWxkIGJlIGFuIGFycmF5LlwiKTtcbiAgICB9LFxuXG4gICAgcHVzaChhc206IGFueSwgZGlzY2FyZDogYW55KSB7XG4gICAgICBpZiAoYXNtLmN1cnJlbnQubGVuZ3RoKSB7XG4gICAgICAgIGlmIChkaXNjYXJkKSB7XG4gICAgICAgICAgKytrZXk7XG4gICAgICAgICAgYXNtLmN1cnJlbnQucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHsga2V5OiBrZXkrKywgdmFsdWU6IGFzbS5jdXJyZW50LnBvcCgpIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBub25lO1xuICAgIH0sXG4gIH0pKG9wdGlvbnMpO1xufTtcbiIsICJpbXBvcnQgeyBMaXN0LCBNZW51QmFyRXh0cmEsIEljb24sIG9wZW4sIExhdW5jaFR5cGUsIGVudmlyb25tZW50LCBBY3Rpb25QYW5lbCwgQWN0aW9uIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gXCJub2RlOmZzXCI7XG5pbXBvcnQgb3MgZnJvbSBcIm5vZGU6b3NcIjtcbmltcG9ydCB7IHVzZVJlZiwgdXNlU3RhdGUsIHVzZUNhbGxiYWNrLCB1c2VNZW1vIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VQcm9taXNlLCBQcm9taXNlT3B0aW9ucyB9IGZyb20gXCIuL3VzZVByb21pc2VcIjtcbmltcG9ydCB7IHVzZUxhdGVzdCB9IGZyb20gXCIuL3VzZUxhdGVzdFwiO1xuaW1wb3J0IHsgc2hvd0ZhaWx1cmVUb2FzdCB9IGZyb20gXCIuL3Nob3dGYWlsdXJlVG9hc3RcIjtcbmltcG9ydCB7IGJhc2VFeGVjdXRlU1FMLCBQZXJtaXNzaW9uRXJyb3IsIGlzUGVybWlzc2lvbkVycm9yIH0gZnJvbSBcIi4vc3FsLXV0aWxzXCI7XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBxdWVyeSBvbiBhIGxvY2FsIFNRTCBkYXRhYmFzZSBhbmQgcmV0dXJucyB0aGUge0BsaW5rIEFzeW5jU3RhdGV9IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHF1ZXJ5IG9mIHRoZSBjb21tYW5kLiBUaGUgbGFzdCB2YWx1ZSB3aWxsIGJlIGtlcHQgYmV0d2VlbiBjb21tYW5kIHJ1bnMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgdXNlU1FMIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKiBpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbiAqIGltcG9ydCB7IGhvbWVkaXIgfSBmcm9tIFwib3NcIjtcbiAqXG4gKiBjb25zdCBOT1RFU19EQiA9IHJlc29sdmUoaG9tZWRpcigpLCBcIkxpYnJhcnkvR3JvdXAgQ29udGFpbmVycy9ncm91cC5jb20uYXBwbGUubm90ZXMvTm90ZVN0b3JlLnNxbGl0ZVwiKTtcbiAqIGNvbnN0IG5vdGVzUXVlcnkgPSBgU0VMRUNUIGlkLCB0aXRsZSBGUk9NIC4uLmA7XG4gKiB0eXBlIE5vdGVJdGVtID0ge1xuICogICBpZDogc3RyaW5nO1xuICogICB0aXRsZTogc3RyaW5nO1xuICogfTtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKCkge1xuICogICBjb25zdCB7IGlzTG9hZGluZywgZGF0YSwgcGVybWlzc2lvblZpZXcgfSA9IHVzZVNRTDxOb3RlSXRlbT4oTk9URVNfREIsIG5vdGVzUXVlcnkpO1xuICpcbiAqICAgaWYgKHBlcm1pc3Npb25WaWV3KSB7XG4gKiAgICAgcmV0dXJuIHBlcm1pc3Npb25WaWV3O1xuICogICB9XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxMaXN0IGlzTG9hZGluZz17aXNMb2FkaW5nfT5cbiAqICAgICAgIHsoZGF0YSB8fCBbXSkubWFwKChpdGVtKSA9PiAoXG4gKiAgICAgICAgIDxMaXN0Lkl0ZW0ga2V5PXtpdGVtLmlkfSB0aXRsZT17aXRlbS50aXRsZX0gLz5cbiAqICAgICAgICkpfVxuICogICAgIDwvTGlzdD5cbiAqICApO1xuICogfTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlU1FMPFQgPSB1bmtub3duPihcbiAgZGF0YWJhc2VQYXRoOiBzdHJpbmcsXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIG9wdGlvbnM/OiB7XG4gICAgLyoqIEEgc3RyaW5nIGV4cGxhaW5pbmcgd2h5IHRoZSBleHRlbnNpb24gbmVlZHMgZnVsbCBkaXNrIGFjY2Vzcy4gRm9yIGV4YW1wbGUsIHRoZSBBcHBsZSBOb3RlcyBleHRlbnNpb24gdXNlcyBgXCJUaGlzIGlzIHJlcXVpcmVkIHRvIHNlYXJjaCB5b3VyIEFwcGxlIE5vdGVzLlwiYC4gV2hpbGUgaXQgaXMgb3B0aW9uYWwsIHdlIHJlY29tbWVuZCBzZXR0aW5nIGl0IHRvIGhlbHAgdXNlcnMgdW5kZXJzdGFuZC4gKi9cbiAgICBwZXJtaXNzaW9uUHJpbWluZz86IHN0cmluZztcbiAgfSAmIE9taXQ8UHJvbWlzZU9wdGlvbnM8KGRhdGFiYXNlOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcpID0+IFByb21pc2U8VFtdPj4sIFwiYWJvcnRhYmxlXCI+LFxuKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgY29uc3QgeyBwZXJtaXNzaW9uUHJpbWluZywgLi4udXNlUHJvbWlzZU9wdGlvbnMgfSA9IG9wdGlvbnMgfHwge307XG5cbiAgY29uc3QgW3Blcm1pc3Npb25WaWV3LCBzZXRQZXJtaXNzaW9uVmlld10gPSB1c2VTdGF0ZTxSZWFjdC5KU1guRWxlbWVudCB8IG51bGw+KG51bGwpO1xuICBjb25zdCBsYXRlc3RPcHRpb25zID0gdXNlTGF0ZXN0KG9wdGlvbnMgfHwge30pO1xuICBjb25zdCBhYm9ydGFibGUgPSB1c2VSZWY8QWJvcnRDb250cm9sbGVyPihudWxsKTtcblxuICBjb25zdCBoYW5kbGVFcnJvciA9IHVzZUNhbGxiYWNrKFxuICAgIChfZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKF9lcnJvcik7XG4gICAgICBjb25zdCBlcnJvciA9XG4gICAgICAgIF9lcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIF9lcnJvci5tZXNzYWdlLmluY2x1ZGVzKFwiYXV0aG9yaXphdGlvbiBkZW5pZWRcIilcbiAgICAgICAgICA/IG5ldyBQZXJtaXNzaW9uRXJyb3IoXCJZb3UgZG8gbm90IGhhdmUgcGVybWlzc2lvbiB0byBhY2Nlc3MgdGhlIGRhdGFiYXNlLlwiKVxuICAgICAgICAgIDogKF9lcnJvciBhcyBFcnJvcik7XG5cbiAgICAgIGlmIChpc1Blcm1pc3Npb25FcnJvcihlcnJvcikpIHtcbiAgICAgICAgc2V0UGVybWlzc2lvblZpZXcoPFBlcm1pc3Npb25FcnJvclNjcmVlbiBwcmltaW5nPXtsYXRlc3RPcHRpb25zLmN1cnJlbnQucGVybWlzc2lvblByaW1pbmd9IC8+KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChsYXRlc3RPcHRpb25zLmN1cnJlbnQub25FcnJvcikge1xuICAgICAgICAgIGxhdGVzdE9wdGlvbnMuY3VycmVudC5vbkVycm9yKGVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZW52aXJvbm1lbnQubGF1bmNoVHlwZSAhPT0gTGF1bmNoVHlwZS5CYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICBzaG93RmFpbHVyZVRvYXN0KGVycm9yLCB7XG4gICAgICAgICAgICAgIHRpdGxlOiBcIkNhbm5vdCBxdWVyeSB0aGUgZGF0YVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBbbGF0ZXN0T3B0aW9uc10sXG4gICk7XG5cbiAgY29uc3QgZm4gPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoIWV4aXN0c1N5bmMoZGF0YWJhc2VQYXRoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGRhdGFiYXNlIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgIH1cblxuICAgIHJldHVybiBhc3luYyAoZGF0YWJhc2VQYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IGFib3J0U2lnbmFsID0gYWJvcnRhYmxlLmN1cnJlbnQ/LnNpZ25hbDtcbiAgICAgIHJldHVybiBiYXNlRXhlY3V0ZVNRTDxUPihkYXRhYmFzZVBhdGgsIHF1ZXJ5LCB7IHNpZ25hbDogYWJvcnRTaWduYWwgfSk7XG4gICAgfTtcbiAgfSwgW2RhdGFiYXNlUGF0aF0pO1xuXG4gIHJldHVybiB7XG4gICAgLi4udXNlUHJvbWlzZShmbiwgW2RhdGFiYXNlUGF0aCwgcXVlcnldLCB7IC4uLnVzZVByb21pc2VPcHRpb25zLCBvbkVycm9yOiBoYW5kbGVFcnJvciB9KSxcbiAgICBwZXJtaXNzaW9uVmlldyxcbiAgfTtcbn1cblxuZnVuY3Rpb24gUGVybWlzc2lvbkVycm9yU2NyZWVuKHByb3BzOiB7IHByaW1pbmc/OiBzdHJpbmcgfSkge1xuICBjb25zdCBtYWNvc1ZlbnR1cmFBbmRMYXRlciA9IHBhcnNlSW50KG9zLnJlbGVhc2UoKS5zcGxpdChcIi5cIilbMF0pID49IDIyO1xuICBjb25zdCBwcmVmZXJlbmNlc1N0cmluZyA9IG1hY29zVmVudHVyYUFuZExhdGVyID8gXCJTZXR0aW5nc1wiIDogXCJQcmVmZXJlbmNlc1wiO1xuXG4gIGNvbnN0IGFjdGlvbiA9IG1hY29zVmVudHVyYUFuZExhdGVyXG4gICAgPyB7XG4gICAgICAgIHRpdGxlOiBcIk9wZW4gU3lzdGVtIFNldHRpbmdzIC0+IFByaXZhY3lcIixcbiAgICAgICAgdGFyZ2V0OiBcIngtYXBwbGUuc3lzdGVtcHJlZmVyZW5jZXM6Y29tLmFwcGxlLnByZWZlcmVuY2Uuc2VjdXJpdHk/UHJpdmFjeV9BbGxGaWxlc1wiLFxuICAgICAgfVxuICAgIDoge1xuICAgICAgICB0aXRsZTogXCJPcGVuIFN5c3RlbSBQcmVmZXJlbmNlcyAtPiBTZWN1cml0eVwiLFxuICAgICAgICB0YXJnZXQ6IFwieC1hcHBsZS5zeXN0ZW1wcmVmZXJlbmNlczpjb20uYXBwbGUucHJlZmVyZW5jZS5zZWN1cml0eT9Qcml2YWN5X0FsbEZpbGVzXCIsXG4gICAgICB9O1xuXG4gIGlmIChlbnZpcm9ubWVudC5jb21tYW5kTW9kZSA9PT0gXCJtZW51LWJhclwiKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxNZW51QmFyRXh0cmEgaWNvbj17SWNvbi5XYXJuaW5nfSB0aXRsZT17ZW52aXJvbm1lbnQuY29tbWFuZE5hbWV9PlxuICAgICAgICA8TWVudUJhckV4dHJhLkl0ZW1cbiAgICAgICAgICB0aXRsZT1cIlJheWNhc3QgbmVlZHMgZnVsbCBkaXNrIGFjY2Vzc1wiXG4gICAgICAgICAgdG9vbHRpcD17YFlvdSBjYW4gcmV2ZXJ0IHRoaXMgYWNjZXNzIGluICR7cHJlZmVyZW5jZXNTdHJpbmd9IHdoZW5ldmVyIHlvdSB3YW50YH1cbiAgICAgICAgLz5cbiAgICAgICAge3Byb3BzLnByaW1pbmcgPyAoXG4gICAgICAgICAgPE1lbnVCYXJFeHRyYS5JdGVtXG4gICAgICAgICAgICB0aXRsZT17cHJvcHMucHJpbWluZ31cbiAgICAgICAgICAgIHRvb2x0aXA9e2BZb3UgY2FuIHJldmVydCB0aGlzIGFjY2VzcyBpbiAke3ByZWZlcmVuY2VzU3RyaW5nfSB3aGVuZXZlciB5b3Ugd2FudGB9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDxNZW51QmFyRXh0cmEuU2VwYXJhdG9yIC8+XG4gICAgICAgIDxNZW51QmFyRXh0cmEuSXRlbSB0aXRsZT17YWN0aW9uLnRpdGxlfSBvbkFjdGlvbj17KCkgPT4gb3BlbihhY3Rpb24udGFyZ2V0KX0gLz5cbiAgICAgIDwvTWVudUJhckV4dHJhPlxuICAgICk7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxMaXN0PlxuICAgICAgPExpc3QuRW1wdHlWaWV3XG4gICAgICAgIGljb249e3tcbiAgICAgICAgICBzb3VyY2U6IHtcbiAgICAgICAgICAgIGxpZ2h0OiBcImh0dHBzOi8vcmF5Y2FzdC5jb20vdXBsb2Fkcy9leHRlbnNpb25zLXV0aWxzLXNlY3VyaXR5LXBlcm1pc3Npb25zLWxpZ2h0LnBuZ1wiLFxuICAgICAgICAgICAgZGFyazogXCJodHRwczovL3JheWNhc3QuY29tL3VwbG9hZHMvZXh0ZW5zaW9ucy11dGlscy1zZWN1cml0eS1wZXJtaXNzaW9ucy1kYXJrLnBuZ1wiLFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICAgIHRpdGxlPVwiUmF5Y2FzdCBuZWVkcyBmdWxsIGRpc2sgYWNjZXNzLlwiXG4gICAgICAgIGRlc2NyaXB0aW9uPXtgJHtcbiAgICAgICAgICBwcm9wcy5wcmltaW5nID8gcHJvcHMucHJpbWluZyArIFwiXFxuXCIgOiBcIlwiXG4gICAgICAgIH1Zb3UgY2FuIHJldmVydCB0aGlzIGFjY2VzcyBpbiAke3ByZWZlcmVuY2VzU3RyaW5nfSB3aGVuZXZlciB5b3Ugd2FudC5gfVxuICAgICAgICBhY3Rpb25zPXtcbiAgICAgICAgICA8QWN0aW9uUGFuZWw+XG4gICAgICAgICAgICA8QWN0aW9uLk9wZW4gey4uLmFjdGlvbn0gLz5cbiAgICAgICAgICA8L0FjdGlvblBhbmVsPlxuICAgICAgICB9XG4gICAgICAvPlxuICAgIDwvTGlzdD5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCB7IGNvcHlGaWxlLCBta2Rpciwgd3JpdGVGaWxlIH0gZnJvbSBcIm5vZGU6ZnMvcHJvbWlzZXNcIjtcbmltcG9ydCBvcyBmcm9tIFwibm9kZTpvc1wiO1xuaW1wb3J0IGNoaWxkUHJvY2VzcyBmcm9tIFwibm9kZTpjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBnZXRTcGF3bmVkUHJvbWlzZSwgZ2V0U3Bhd25lZFJlc3VsdCB9IGZyb20gXCIuL2V4ZWMtdXRpbHNcIjtcbmltcG9ydCB7IGhhc2ggfSBmcm9tIFwiLi9oZWxwZXJzXCI7XG5cbmV4cG9ydCBjbGFzcyBQZXJtaXNzaW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IFwiUGVybWlzc2lvbkVycm9yXCI7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGVybWlzc2lvbkVycm9yKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgUGVybWlzc2lvbkVycm9yIHtcbiAgcmV0dXJuIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyb3IubmFtZSA9PT0gXCJQZXJtaXNzaW9uRXJyb3JcIjtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJhc2VFeGVjdXRlU1FMPFQgPSB1bmtub3duPihcbiAgZGF0YWJhc2VQYXRoOiBzdHJpbmcsXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIG9wdGlvbnM/OiB7XG4gICAgc2lnbmFsPzogQWJvcnRTaWduYWw7XG4gIH0sXG4pOiBQcm9taXNlPFRbXT4ge1xuICBpZiAoIWV4aXN0c1N5bmMoZGF0YWJhc2VQYXRoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBkYXRhYmFzZSBkb2VzIG5vdCBleGlzdFwiKTtcbiAgfVxuXG4gIGxldCBzcWxpdGUzOiB0eXBlb2YgaW1wb3J0KFwibm9kZTpzcWxpdGVcIik7XG4gIHRyeSB7XG4gICAgLy8gdGhpcyBpcyBhIGJpdCB1Z2x5IGJ1dCB3ZSBjYW4ndCBkaXJlY3RseSBpbXBvcnQgXCJub2RlOnNxbGl0ZVwiIGhlcmUgYmVjYXVzZSBwYXJjZWwgd2lsbCBob2lzdCBpdCBhbnl3YXkgYW5kIGl0IHdpbGwgYnJlYWsgd2hlbiBpdCdzIG5vdCBhdmFpbGFibGVcbiAgICBjb25zdCBkeW5hbWljSW1wb3J0ID0gKG1vZHVsZTogc3RyaW5nKSA9PiBpbXBvcnQobW9kdWxlKTtcbiAgICBzcWxpdGUzID0gYXdhaXQgZHluYW1pY0ltcG9ydChcIm5vZGU6c3FsaXRlXCIpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIElmIHNxbGl0ZTMgaXMgbm90IGF2YWlsYWJsZSwgd2UgZmFsbGJhY2sgdG8gdXNpbmcgdGhlIHNxbGl0ZTMgQ0xJIChhdmFpbGFibGUgb24gbWFjT1MgYW5kIExpbnV4IGJ5IGRlZmF1bHQpLlxuICAgIHJldHVybiBzcWxpdGVGYWxsYmFjazxUPihkYXRhYmFzZVBhdGgsIHF1ZXJ5LCBvcHRpb25zKTtcbiAgfVxuXG4gIGxldCBkYiA9IG5ldyBzcWxpdGUzLkRhdGFiYXNlU3luYyhkYXRhYmFzZVBhdGgsIHsgb3BlbjogZmFsc2UsIHJlYWRPbmx5OiB0cnVlIH0pO1xuXG4gIGNvbnN0IGFib3J0U2lnbmFsID0gb3B0aW9ucz8uc2lnbmFsO1xuXG4gIHRyeSB7XG4gICAgZGIub3BlbigpO1xuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIGlmIChlcnJvci5tZXNzYWdlLm1hdGNoKFwiKDUpXCIpIHx8IGVycm9yLm1lc3NhZ2UubWF0Y2goXCIoMTQpXCIpKSB7XG4gICAgICAvLyBUaGF0IG1lYW5zIHRoYXQgdGhlIERCIGlzIGJ1c3kgYmVjYXVzZSBvZiBhbm90aGVyIGFwcCBpcyBsb2NraW5nIGl0XG4gICAgICAvLyBUaGlzIGhhcHBlbnMgd2hlbiBDaHJvbWUgb3IgQXJjIGlzIG9wZW5lZDogdGhleSBsb2NrIHRoZSBIaXN0b3J5IGRiLlxuICAgICAgLy8gQXMgYW4gdWdseSB3b3JrYXJvdW5kLCB3ZSBkdXBsaWNhdGUgdGhlIGZpbGUgYW5kIHJlYWQgdGhhdCBpbnN0ZWFkXG4gICAgICAvLyAod2l0aCB2ZnMgdW5peCAtIG5vbmUgdG8ganVzdCBub3QgY2FyZSBhYm91dCBsb2NrcylcbiAgICAgIGxldCB3b3JrYXJvdW5kQ29waWVkRGI6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgIGlmICghd29ya2Fyb3VuZENvcGllZERiKSB7XG4gICAgICAgIGNvbnN0IHRlbXBGb2xkZXIgPSBwYXRoLmpvaW4ob3MudG1wZGlyKCksIFwidXNlU1FMXCIsIGhhc2goZGF0YWJhc2VQYXRoKSk7XG4gICAgICAgIGF3YWl0IG1rZGlyKHRlbXBGb2xkZXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICBjaGVja0Fib3J0ZWQoYWJvcnRTaWduYWwpO1xuXG4gICAgICAgIHdvcmthcm91bmRDb3BpZWREYiA9IHBhdGguam9pbih0ZW1wRm9sZGVyLCBcImRiLmRiXCIpO1xuICAgICAgICBhd2FpdCBjb3B5RmlsZShkYXRhYmFzZVBhdGgsIHdvcmthcm91bmRDb3BpZWREYik7XG5cbiAgICAgICAgYXdhaXQgd3JpdGVGaWxlKHdvcmthcm91bmRDb3BpZWREYiArIFwiLXNobVwiLCBcIlwiKTtcbiAgICAgICAgYXdhaXQgd3JpdGVGaWxlKHdvcmthcm91bmRDb3BpZWREYiArIFwiLXdhbFwiLCBcIlwiKTtcblxuICAgICAgICBjaGVja0Fib3J0ZWQoYWJvcnRTaWduYWwpO1xuICAgICAgfVxuXG4gICAgICBkYiA9IG5ldyBzcWxpdGUzLkRhdGFiYXNlU3luYyh3b3JrYXJvdW5kQ29waWVkRGIsIHsgb3BlbjogZmFsc2UsIHJlYWRPbmx5OiB0cnVlIH0pO1xuICAgICAgZGIub3BlbigpO1xuICAgICAgY2hlY2tBYm9ydGVkKGFib3J0U2lnbmFsKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdGF0ZW1lbnQgPSBkYi5wcmVwYXJlKHF1ZXJ5KTtcbiAgY2hlY2tBYm9ydGVkKGFib3J0U2lnbmFsKTtcblxuICBjb25zdCByZXN1bHQgPSBzdGF0ZW1lbnQuYWxsKCk7XG5cbiAgZGIuY2xvc2UoKTtcblxuICByZXR1cm4gcmVzdWx0IGFzIFRbXTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3FsaXRlRmFsbGJhY2s8VCA9IHVua25vd24+KFxuICBkYXRhYmFzZVBhdGg6IHN0cmluZyxcbiAgcXVlcnk6IHN0cmluZyxcbiAgb3B0aW9ucz86IHtcbiAgICBzaWduYWw/OiBBYm9ydFNpZ25hbDtcbiAgfSxcbik6IFByb21pc2U8VFtdPiB7XG4gIGNvbnN0IGFib3J0U2lnbmFsID0gb3B0aW9ucz8uc2lnbmFsO1xuXG4gIGxldCBzcGF3bmVkID0gY2hpbGRQcm9jZXNzLnNwYXduKFwic3FsaXRlM1wiLCBbXCItLWpzb25cIiwgXCItLXJlYWRvbmx5XCIsIGRhdGFiYXNlUGF0aCwgcXVlcnldLCB7IHNpZ25hbDogYWJvcnRTaWduYWwgfSk7XG4gIGxldCBzcGF3bmVkUHJvbWlzZSA9IGdldFNwYXduZWRQcm9taXNlKHNwYXduZWQpO1xuICBsZXQgW3sgZXJyb3IsIGV4aXRDb2RlLCBzaWduYWwgfSwgc3Rkb3V0UmVzdWx0LCBzdGRlcnJSZXN1bHRdID0gYXdhaXQgZ2V0U3Bhd25lZFJlc3VsdDxzdHJpbmc+KFxuICAgIHNwYXduZWQsXG4gICAgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0sXG4gICAgc3Bhd25lZFByb21pc2UsXG4gICk7XG4gIGNoZWNrQWJvcnRlZChhYm9ydFNpZ25hbCk7XG5cbiAgaWYgKHN0ZGVyclJlc3VsdC5tYXRjaChcIig1KVwiKSB8fCBzdGRlcnJSZXN1bHQubWF0Y2goXCIoMTQpXCIpKSB7XG4gICAgLy8gVGhhdCBtZWFucyB0aGF0IHRoZSBEQiBpcyBidXN5IGJlY2F1c2Ugb2YgYW5vdGhlciBhcHAgaXMgbG9ja2luZyBpdFxuICAgIC8vIFRoaXMgaGFwcGVucyB3aGVuIENocm9tZSBvciBBcmMgaXMgb3BlbmVkOiB0aGV5IGxvY2sgdGhlIEhpc3RvcnkgZGIuXG4gICAgLy8gQXMgYW4gdWdseSB3b3JrYXJvdW5kLCB3ZSBkdXBsaWNhdGUgdGhlIGZpbGUgYW5kIHJlYWQgdGhhdCBpbnN0ZWFkXG4gICAgLy8gKHdpdGggdmZzIHVuaXggLSBub25lIHRvIGp1c3Qgbm90IGNhcmUgYWJvdXQgbG9ja3MpXG4gICAgbGV0IHdvcmthcm91bmRDb3BpZWREYjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGlmICghd29ya2Fyb3VuZENvcGllZERiKSB7XG4gICAgICBjb25zdCB0ZW1wRm9sZGVyID0gcGF0aC5qb2luKG9zLnRtcGRpcigpLCBcInVzZVNRTFwiLCBoYXNoKGRhdGFiYXNlUGF0aCkpO1xuICAgICAgYXdhaXQgbWtkaXIodGVtcEZvbGRlciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICBjaGVja0Fib3J0ZWQoYWJvcnRTaWduYWwpO1xuXG4gICAgICB3b3JrYXJvdW5kQ29waWVkRGIgPSBwYXRoLmpvaW4odGVtcEZvbGRlciwgXCJkYi5kYlwiKTtcbiAgICAgIGF3YWl0IGNvcHlGaWxlKGRhdGFiYXNlUGF0aCwgd29ya2Fyb3VuZENvcGllZERiKTtcblxuICAgICAgYXdhaXQgd3JpdGVGaWxlKHdvcmthcm91bmRDb3BpZWREYiArIFwiLXNobVwiLCBcIlwiKTtcbiAgICAgIGF3YWl0IHdyaXRlRmlsZSh3b3JrYXJvdW5kQ29waWVkRGIgKyBcIi13YWxcIiwgXCJcIik7XG5cbiAgICAgIGNoZWNrQWJvcnRlZChhYm9ydFNpZ25hbCk7XG4gICAgfVxuXG4gICAgc3Bhd25lZCA9IGNoaWxkUHJvY2Vzcy5zcGF3bihcInNxbGl0ZTNcIiwgW1wiLS1qc29uXCIsIFwiLS1yZWFkb25seVwiLCBcIi0tdmZzXCIsIFwidW5peC1ub25lXCIsIHdvcmthcm91bmRDb3BpZWREYiwgcXVlcnldLCB7XG4gICAgICBzaWduYWw6IGFib3J0U2lnbmFsLFxuICAgIH0pO1xuICAgIHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCk7XG4gICAgW3sgZXJyb3IsIGV4aXRDb2RlLCBzaWduYWwgfSwgc3Rkb3V0UmVzdWx0LCBzdGRlcnJSZXN1bHRdID0gYXdhaXQgZ2V0U3Bhd25lZFJlc3VsdDxzdHJpbmc+KFxuICAgICAgc3Bhd25lZCxcbiAgICAgIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9LFxuICAgICAgc3Bhd25lZFByb21pc2UsXG4gICAgKTtcbiAgICBjaGVja0Fib3J0ZWQoYWJvcnRTaWduYWwpO1xuICB9XG5cbiAgaWYgKGVycm9yIHx8IGV4aXRDb2RlICE9PSAwIHx8IHNpZ25hbCAhPT0gbnVsbCkge1xuICAgIGlmIChzdGRlcnJSZXN1bHQuaW5jbHVkZXMoXCJhdXRob3JpemF0aW9uIGRlbmllZFwiKSkge1xuICAgICAgdGhyb3cgbmV3IFBlcm1pc3Npb25FcnJvcihcIllvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIGFjY2VzcyB0aGUgZGF0YWJhc2UuXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RkZXJyUmVzdWx0IHx8IFwiVW5rbm93biBlcnJvclwiKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gSlNPTi5wYXJzZShzdGRvdXRSZXN1bHQudHJpbSgpIHx8IFwiW11cIikgYXMgVFtdO1xufVxuXG5mdW5jdGlvbiBjaGVja0Fib3J0ZWQoc2lnbmFsPzogQWJvcnRTaWduYWwpIHtcbiAgaWYgKHNpZ25hbD8uYWJvcnRlZCkge1xuICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKFwiYWJvcnRlZFwiKTtcbiAgICBlcnJvci5uYW1lID0gXCJBYm9ydEVycm9yXCI7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBGb3JtIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUNhbGxiYWNrLCB1c2VNZW1vLCB1c2VSZWYsIFNldFN0YXRlQWN0aW9uIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VMYXRlc3QgfSBmcm9tIFwiLi91c2VMYXRlc3RcIjtcblxuLyoqXG4gKiBTaG9ydGhhbmRzIGZvciBjb21tb24gdmFsaWRhdGlvbiBjYXNlc1xuICovXG5leHBvcnQgZW51bSBGb3JtVmFsaWRhdGlvbiB7XG4gIC8qKiBTaG93IGFuIGVycm9yIHdoZW4gdGhlIHZhbHVlIG9mIHRoZSBpdGVtIGlzIGVtcHR5ICovXG4gIFJlcXVpcmVkID0gXCJyZXF1aXJlZFwiLFxufVxuXG50eXBlIFZhbGlkYXRpb25FcnJvciA9IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGw7XG50eXBlIFZhbGlkYXRvcjxWYWx1ZVR5cGU+ID0gKCh2YWx1ZTogVmFsdWVUeXBlIHwgdW5kZWZpbmVkKSA9PiBWYWxpZGF0aW9uRXJyb3IpIHwgRm9ybVZhbGlkYXRpb247XG5cbmZ1bmN0aW9uIHZhbGlkYXRpb25FcnJvcjxWYWx1ZVR5cGU+KFxuICB2YWxpZGF0aW9uOiBWYWxpZGF0b3I8VmFsdWVUeXBlPiB8IHVuZGVmaW5lZCxcbiAgdmFsdWU6IFZhbHVlVHlwZSB8IHVuZGVmaW5lZCxcbik6IFZhbGlkYXRpb25FcnJvciB7XG4gIGlmICh2YWxpZGF0aW9uKSB7XG4gICAgaWYgKHR5cGVvZiB2YWxpZGF0aW9uID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uKHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKHZhbGlkYXRpb24gPT09IEZvcm1WYWxpZGF0aW9uLlJlcXVpcmVkKSB7XG4gICAgICBsZXQgdmFsdWVJc1ZhbGlkID0gdHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiICYmIHZhbHVlICE9PSBudWxsO1xuICAgICAgaWYgKHZhbHVlSXNWYWxpZCkge1xuICAgICAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgIHZhbHVlSXNWYWxpZCA9IHZhbHVlLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgdmFsdWVJc1ZhbGlkID0gdmFsdWUubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgICAgIHZhbHVlSXNWYWxpZCA9IHZhbHVlLmdldFRpbWUoKSA+IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghdmFsdWVJc1ZhbGlkKSB7XG4gICAgICAgIHJldHVybiBcIlRoZSBpdGVtIGlzIHJlcXVpcmVkXCI7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbnR5cGUgVmFsaWRhdGlvbjxUIGV4dGVuZHMgRm9ybS5WYWx1ZXM+ID0geyBbaWQgaW4ga2V5b2YgVF0/OiBWYWxpZGF0b3I8VFtpZF0+IH07XG5cbmludGVyZmFjZSBGb3JtUHJvcHM8VCBleHRlbmRzIEZvcm0uVmFsdWVzPiB7XG4gIC8qKiBGdW5jdGlvbiB0byBwYXNzIHRvIHRoZSBgb25TdWJtaXRgIHByb3Agb2YgdGhlIGA8QWN0aW9uLlN1Ym1pdEZvcm0+YCBlbGVtZW50LiBJdCB3cmFwcyB0aGUgaW5pdGlhbCBgb25TdWJtaXRgIGFyZ3VtZW50IHdpdGggc29tZSBnb29kaWVzIHJlbGF0ZWQgdG8gdGhlIHZhbGlkYXRpb24uICovXG4gIGhhbmRsZVN1Ym1pdDogKHZhbHVlczogVCkgPT4gdm9pZCB8IGJvb2xlYW4gfCBQcm9taXNlPHZvaWQgfCBib29sZWFuPjtcbiAgLyoqIFRoZSBwcm9wcyB0aGF0IG11c3QgYmUgcGFzc2VkIHRvIHRoZSBgPEZvcm0uSXRlbT5gIGVsZW1lbnRzIHRvIGhhbmRsZSB0aGUgdmFsaWRhdGlvbnMuICovXG4gIGl0ZW1Qcm9wczoge1xuICAgIFtpZCBpbiBrZXlvZiBSZXF1aXJlZDxUPl06IFBhcnRpYWw8Rm9ybS5JdGVtUHJvcHM8VFtpZF0+PiAmIHtcbiAgICAgIGlkOiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbiAgLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gcHJvZ3JhbW1hdGljYWxseSBzZXQgdGhlIHZhbGlkYXRpb24gb2YgYSBzcGVjaWZpYyBmaWVsZC4gKi9cbiAgc2V0VmFsaWRhdGlvbkVycm9yOiAoaWQ6IGtleW9mIFQsIGVycm9yOiBWYWxpZGF0aW9uRXJyb3IpID0+IHZvaWQ7XG4gIC8qKiBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHByb2dyYW1tYXRpY2FsbHkgc2V0IHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmljIGZpZWxkLiAqL1xuICBzZXRWYWx1ZTogPEsgZXh0ZW5kcyBrZXlvZiBUPihpZDogSywgdmFsdWU6IFNldFN0YXRlQWN0aW9uPFRbS10+KSA9PiB2b2lkO1xuICAvKiogVGhlIGN1cnJlbnQgdmFsdWVzIG9mIHRoZSBmb3JtLiAqL1xuICB2YWx1ZXM6IFQ7XG4gIC8qKiBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHByb2dyYW1tYXRpY2FsbHkgZm9jdXMgYSBzcGVjaWZpYyBmaWVsZC4gKi9cbiAgZm9jdXM6IChpZDoga2V5b2YgVCkgPT4gdm9pZDtcbiAgLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVzZXQgdGhlIHZhbHVlcyBvZiB0aGUgRm9ybS4gKi9cbiAgcmVzZXQ6IChpbml0aWFsVmFsdWVzPzogUGFydGlhbDxUPikgPT4gdm9pZDtcbn1cblxuLyoqXG4gKiBIb29rIHRoYXQgcHJvdmlkZXMgYSBoaWdoLWxldmVsIGludGVyZmFjZSB0byB3b3JrIHdpdGggRm9ybXMsIGFuZCBtb3JlIHBhcnRpY3VsYXJseSwgd2l0aCBGb3JtIHZhbGlkYXRpb25zLiBJdCBpbmNvcnBvcmF0ZXMgYWxsIHRoZSBnb29kIHByYWN0aWNlcyB0byBwcm92aWRlIGEgZ3JlYXQgVXNlciBFeHBlcmllbmNlIGZvciB5b3VyIEZvcm1zLlxuICpcbiAqIEByZXR1cm5zIGFuIG9iamVjdCB3aGljaCBjb250YWlucyB0aGUgbmVjZXNzYXJ5IG1ldGhvZHMgYW5kIHByb3BzIHRvIHByb3ZpZGUgYSBnb29kIFVzZXIgRXhwZXJpZW5jZSBpbiB5b3VyIEZvcm0uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25QYW5lbCwgRm9ybSwgc2hvd1RvYXN0LCBUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZUZvcm0sIEZvcm1WYWxpZGF0aW9uIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKlxuICogaW50ZXJmYWNlIFNpZ25VcEZvcm1WYWx1ZXMge1xuICogICBuaWNrbmFtZTogc3RyaW5nO1xuICogICBwYXNzd29yZDogc3RyaW5nO1xuICogfVxuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IHsgaGFuZGxlU3VibWl0LCBpdGVtUHJvcHMgfSA9IHVzZUZvcm08U2lnblVwRm9ybVZhbHVlcz4oe1xuICogICAgIG9uU3VibWl0KHZhbHVlcykge1xuICogICAgICAgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLlN1Y2Nlc3MsIFwiWWF5IVwiLCBgJHt2YWx1ZXMubmlja25hbWV9IGFjY291bnQgY3JlYXRlZGApO1xuICogICAgIH0sXG4gKiAgICAgdmFsaWRhdGlvbjoge1xuICogICAgICAgbmlja25hbWU6IEZvcm1WYWxpZGF0aW9uLlJlcXVpcmVkLFxuICogICAgICAgcGFzc3dvcmQ6ICh2YWx1ZSkgPT4ge1xuICogICAgICAgICBpZiAodmFsdWUgJiYgdmFsdWUubGVuZ3RoIDwgOCkge1xuICogICAgICAgICAgIHJldHVybiBcIlBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBzeW1ib2xzXCI7XG4gKiAgICAgICAgIH0gZWxzZSBpZiAoIXZhbHVlKSB7XG4gKiAgICAgICAgICAgcmV0dXJuIFwiVGhlIGl0ZW0gaXMgcmVxdWlyZWRcIjtcbiAqICAgICAgICAgfVxuICogICAgICAgfSxcbiAqICAgICB9LFxuICogICB9KTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPEZvcm1cbiAqICAgICAgIGFjdGlvbnM9e1xuICogICAgICAgICA8QWN0aW9uUGFuZWw+XG4gKiAgICAgICAgICAgPEFjdGlvbi5TdWJtaXRGb3JtIHRpdGxlPVwiU3VibWl0XCIgb25TdWJtaXQ9e2hhbmRsZVN1Ym1pdH0gLz5cbiAqICAgICAgICAgPC9BY3Rpb25QYW5lbD5cbiAqICAgICAgIH1cbiAqICAgICA+XG4gKiAgICAgICA8Rm9ybS5UZXh0RmllbGQgdGl0bGU9XCJOaWNrbmFtZVwiIHBsYWNlaG9sZGVyPVwiRW50ZXIgeW91ciBuaWNrbmFtZVwiIHsuLi5pdGVtUHJvcHMubmlja25hbWV9IC8+XG4gKiAgICAgICA8Rm9ybS5QYXNzd29yZEZpZWxkXG4gKiAgICAgICAgIHRpdGxlPVwiUGFzc3dvcmRcIlxuICogICAgICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIHBhc3N3b3JkIGF0IGxlYXN0IDggY2hhcmFjdGVycyBsb25nXCJcbiAqICAgICAgICAgey4uLml0ZW1Qcm9wcy5wYXNzd29yZH1cbiAqICAgICAgIC8+XG4gKiAgICAgPC9Gb3JtPlxuICogICApO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VGb3JtPFQgZXh0ZW5kcyBGb3JtLlZhbHVlcz4ocHJvcHM6IHtcbiAgLyoqIENhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgZm9ybSBpcyBzdWJtaXR0ZWQgYW5kIGFsbCB2YWxpZGF0aW9ucyBwYXNzLiAqL1xuICBvblN1Ym1pdDogKHZhbHVlczogVCkgPT4gdm9pZCB8IGJvb2xlYW4gfCBQcm9taXNlPHZvaWQgfCBib29sZWFuPjtcbiAgLyoqIFRoZSBpbml0aWFsIHZhbHVlcyB0byBzZXQgd2hlbiB0aGUgRm9ybSBpcyBmaXJzdCByZW5kZXJlZC4gKi9cbiAgaW5pdGlhbFZhbHVlcz86IFBhcnRpYWw8VD47XG4gIC8qKiBUaGUgdmFsaWRhdGlvbiBydWxlcyBmb3IgdGhlIEZvcm0uIEEgdmFsaWRhdGlvbiBmb3IgYSBGb3JtIGl0ZW0gaXMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBpdGVtIGFzIGFuIGFyZ3VtZW50IGFuZCBtdXN0IHJldHVybiBhIHN0cmluZyB3aGVuIHRoZSB2YWxpZGF0aW9uIGlzIGZhaWxpbmcuXG4gICAqXG4gICAqIFRoZXJlIGFyZSBhbHNvIHNvbWUgc2hvcnRoYW5kcyBmb3IgY29tbW9uIGNhc2VzLCBzZWUge0BsaW5rIEZvcm1WYWxpZGF0aW9ufS5cbiAgICogKi9cbiAgdmFsaWRhdGlvbj86IFZhbGlkYXRpb248VD47XG59KTogRm9ybVByb3BzPFQ+IHtcbiAgY29uc3QgeyBvblN1Ym1pdDogX29uU3VibWl0LCB2YWxpZGF0aW9uLCBpbml0aWFsVmFsdWVzID0ge30gfSA9IHByb3BzO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgaXQncyBmaW5lIGlmIHdlIGRvbid0IHNwZWNpZnkgYWxsIHRoZSB2YWx1ZXNcbiAgY29uc3QgW3ZhbHVlcywgc2V0VmFsdWVzXSA9IHVzZVN0YXRlPFQ+KGluaXRpYWxWYWx1ZXMpO1xuICBjb25zdCBbZXJyb3JzLCBzZXRFcnJvcnNdID0gdXNlU3RhdGU8eyBbaWQgaW4ga2V5b2YgVF0/OiBWYWxpZGF0aW9uRXJyb3IgfT4oe30pO1xuICBjb25zdCByZWZzID0gdXNlUmVmPHsgW2lkIGluIGtleW9mIFRdPzogRm9ybS5JdGVtUmVmZXJlbmNlIH0+KHt9KTtcblxuICBjb25zdCBsYXRlc3RWYWxpZGF0aW9uID0gdXNlTGF0ZXN0PFZhbGlkYXRpb248VD4+KHZhbGlkYXRpb24gfHwge30pO1xuICBjb25zdCBsYXRlc3RPblN1Ym1pdCA9IHVzZUxhdGVzdChfb25TdWJtaXQpO1xuXG4gIGNvbnN0IGZvY3VzID0gdXNlQ2FsbGJhY2soXG4gICAgKGlkOiBrZXlvZiBUKSA9PiB7XG4gICAgICByZWZzLmN1cnJlbnRbaWRdPy5mb2N1cygpO1xuICAgIH0sXG4gICAgW3JlZnNdLFxuICApO1xuXG4gIGNvbnN0IGhhbmRsZVN1Ym1pdCA9IHVzZUNhbGxiYWNrKFxuICAgIGFzeW5jICh2YWx1ZXM6IFQpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIGxldCB2YWxpZGF0aW9uRXJyb3JzOiBmYWxzZSB8IHsgW2tleSBpbiBrZXlvZiBUXT86IFZhbGlkYXRpb25FcnJvciB9ID0gZmFsc2U7XG4gICAgICBmb3IgKGNvbnN0IFtpZCwgdmFsaWRhdGlvbl0gb2YgT2JqZWN0LmVudHJpZXMobGF0ZXN0VmFsaWRhdGlvbi5jdXJyZW50KSkge1xuICAgICAgICBjb25zdCBlcnJvciA9IHZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uLCB2YWx1ZXNbaWRdKTtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgaWYgKCF2YWxpZGF0aW9uRXJyb3JzKSB7XG4gICAgICAgICAgICB2YWxpZGF0aW9uRXJyb3JzID0ge307XG4gICAgICAgICAgICAvLyB3ZSBmb2N1cyB0aGUgZmlyc3QgaXRlbSB0aGF0IGhhcyBhbiBlcnJvclxuICAgICAgICAgICAgZm9jdXMoaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWxpZGF0aW9uRXJyb3JzW2lkIGFzIGtleW9mIFRdID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzKSB7XG4gICAgICAgIHNldEVycm9ycyh2YWxpZGF0aW9uRXJyb3JzKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbGF0ZXN0T25TdWJtaXQuY3VycmVudCh2YWx1ZXMpO1xuICAgICAgcmV0dXJuIHR5cGVvZiByZXN1bHQgPT09IFwiYm9vbGVhblwiID8gcmVzdWx0IDogdHJ1ZTtcbiAgICB9LFxuICAgIFtsYXRlc3RWYWxpZGF0aW9uLCBsYXRlc3RPblN1Ym1pdCwgZm9jdXNdLFxuICApO1xuXG4gIGNvbnN0IHNldFZhbGlkYXRpb25FcnJvciA9IHVzZUNhbGxiYWNrKFxuICAgIChpZDoga2V5b2YgVCwgZXJyb3I6IFZhbGlkYXRpb25FcnJvcikgPT4ge1xuICAgICAgc2V0RXJyb3JzKChlcnJvcnMpID0+ICh7IC4uLmVycm9ycywgW2lkXTogZXJyb3IgfSkpO1xuICAgIH0sXG4gICAgW3NldEVycm9yc10sXG4gICk7XG5cbiAgY29uc3Qgc2V0VmFsdWUgPSB1c2VDYWxsYmFjayhcbiAgICBmdW5jdGlvbiA8SyBleHRlbmRzIGtleW9mIFQ+KGlkOiBLLCB2YWx1ZTogU2V0U3RhdGVBY3Rpb248VFtLXT4pIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVFMgaXMgYWx3YXlzIGNvbmZ1c2VkIGFib3V0IFNldFN0YXRlQWN0aW9uLCBidXQgaXQncyBmaW5lIGhlcmVcbiAgICAgIHNldFZhbHVlcygodmFsdWVzKSA9PiAoeyAuLi52YWx1ZXMsIFtpZF06IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdmFsdWUodmFsdWVzW2lkXSkgOiB2YWx1ZSB9KSk7XG4gICAgfSxcbiAgICBbc2V0VmFsdWVzXSxcbiAgKTtcblxuICBjb25zdCBpdGVtUHJvcHMgPSB1c2VNZW1vPHsgW2lkIGluIGtleW9mIFJlcXVpcmVkPFQ+XTogUGFydGlhbDxGb3JtLkl0ZW1Qcm9wczxUW2lkXT4+ICYgeyBpZDogc3RyaW5nIH0gfT4oKCkgPT4ge1xuICAgIC8vIHdlIGhhdmUgdG8gdXNlIGEgcHJveHkgYmVjYXVzZSB3ZSBkb24ndCBhY3R1YWxseSBoYXZlIGFueSBvYmplY3QgdG8gaXRlcmF0ZSB0aHJvdWdoXG4gICAgLy8gc28gaW5zdGVhZCB3ZSBkeW5hbWljYWxseSBjcmVhdGUgdGhlIHByb3BzIHdoZW4gcmVxdWlyZWRcbiAgICByZXR1cm4gbmV3IFByb3h5PHsgW2lkIGluIGtleW9mIFJlcXVpcmVkPFQ+XTogUGFydGlhbDxGb3JtLkl0ZW1Qcm9wczxUW2lkXT4+ICYgeyBpZDogc3RyaW5nIH0gfT4oXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoZSB3aG9sZSBwb2ludCBvZiBhIHByb3h5Li4uXG4gICAgICB7fSxcbiAgICAgIHtcbiAgICAgICAgZ2V0KHRhcmdldCwgaWQ6IGtleW9mIFQpIHtcbiAgICAgICAgICBjb25zdCB2YWxpZGF0aW9uID0gbGF0ZXN0VmFsaWRhdGlvbi5jdXJyZW50W2lkXTtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHZhbHVlc1tpZF07XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKHZhbHVlKSB7XG4gICAgICAgICAgICAgIGlmIChlcnJvcnNbaWRdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSB2YWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvbiwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIHNldFZhbGlkYXRpb25FcnJvcihpZCwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2V0VmFsdWUoaWQsIHZhbHVlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkJsdXIoZXZlbnQpIHtcbiAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSB2YWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvbiwgZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgc2V0VmFsaWRhdGlvbkVycm9yKGlkLCBlcnJvcik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZXJyb3JzW2lkXSxcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgLy8gd2Ugc2hvdWxkbid0IHJldHVybiBgdW5kZWZpbmVkYCBvdGhlcndpc2UgaXQgd2lsbCBiZSBhbiB1bmNvbnRyb2xsZWQgY29tcG9uZW50XG4gICAgICAgICAgICB2YWx1ZTogdHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiID8gbnVsbCA6IHZhbHVlLFxuICAgICAgICAgICAgcmVmOiAoaW5zdGFuY2U6IEZvcm0uSXRlbVJlZmVyZW5jZSkgPT4ge1xuICAgICAgICAgICAgICByZWZzLmN1cnJlbnRbaWRdID0gaW5zdGFuY2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0gYXMgUGFydGlhbDxGb3JtLkl0ZW1Qcm9wczxUW2tleW9mIFRdPj4gJiB7IGlkOiBzdHJpbmcgfTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgKTtcbiAgfSwgW2Vycm9ycywgbGF0ZXN0VmFsaWRhdGlvbiwgc2V0VmFsaWRhdGlvbkVycm9yLCB2YWx1ZXMsIHJlZnMsIHNldFZhbHVlXSk7XG5cbiAgY29uc3QgcmVzZXQgPSB1c2VDYWxsYmFjayhcbiAgICAodmFsdWVzPzogUGFydGlhbDxUPikgPT4ge1xuICAgICAgc2V0RXJyb3JzKHt9KTtcbiAgICAgIE9iamVjdC5lbnRyaWVzKHJlZnMuY3VycmVudCkuZm9yRWFjaCgoW2lkLCByZWZdKSA9PiB7XG4gICAgICAgIGlmICghdmFsdWVzPy5baWRdKSB7XG4gICAgICAgICAgcmVmPy5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBpdCdzIGZpbmUgaWYgd2UgZG9uJ3Qgc3BlY2lmeSBhbGwgdGhlIHZhbHVlc1xuICAgICAgICBzZXRWYWx1ZXModmFsdWVzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFtzZXRWYWx1ZXMsIHNldEVycm9ycywgcmVmc10sXG4gICk7XG5cbiAgcmV0dXJuIHsgaGFuZGxlU3VibWl0LCBzZXRWYWxpZGF0aW9uRXJyb3IsIHNldFZhbHVlLCB2YWx1ZXMsIGl0ZW1Qcm9wcywgZm9jdXMsIHJlc2V0IH07XG59XG4iLCAiaW1wb3J0IHsgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQUkgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBQcm9taXNlT3B0aW9ucywgdXNlUHJvbWlzZSB9IGZyb20gXCIuL3VzZVByb21pc2VcIjtcbmltcG9ydCB7IEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogU3RyZWFtIGEgcHJvbXB0IGNvbXBsZXRpb24uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IERldGFpbCwgTGF1bmNoUHJvcHMgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG4gKiBpbXBvcnQgeyB1c2UgQUkgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKHByb3BzOiBMYXVuY2hQcm9wczx7IGFyZ3VtZW50czogeyBwcm9tcHQ6IHN0cmluZyB9IH0+KSB7XG4gKiAgIGNvbnN0IHsgaXNMb2FkaW5nLCBkYXRhIH0gPSB1c2VBSShwcm9wcy5hcmd1bWVudHMucHJvbXB0KTtcbiAqXG4gKiAgIHJldHVybiA8RGV0YWlsIGlzTG9hZGluZz17aXNMb2FkaW5nfSBtYXJrZG93bj17ZGF0YX0gLz47XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUFJKFxuICBwcm9tcHQ6IHN0cmluZyxcbiAgb3B0aW9uczoge1xuICAgIC8qKlxuICAgICAqIENvbmNyZXRlIHRhc2tzLCBzdWNoIGFzIGZpeGluZyBncmFtbWFyLCByZXF1aXJlIGxlc3MgY3JlYXRpdml0eSB3aGlsZSBvcGVuLWVuZGVkIHF1ZXN0aW9ucywgc3VjaCBhcyBnZW5lcmF0aW5nIGlkZWFzLCByZXF1aXJlIG1vcmUuXG4gICAgICogSWYgYSBudW1iZXIgaXMgcGFzc2VkLCBpdCBuZWVkcyB0byBiZSBpbiB0aGUgcmFuZ2UgMC0yLiBGb3IgbGFyZ2VyIHZhbHVlcywgMiB3aWxsIGJlIHVzZWQuIEZvciBsb3dlciB2YWx1ZXMsIDAgd2lsbCBiZSB1c2VkLlxuICAgICAqL1xuICAgIGNyZWF0aXZpdHk/OiBBSS5DcmVhdGl2aXR5O1xuICAgIC8qKlxuICAgICAqIFRoZSBBSSBtb2RlbCB0byB1c2UgdG8gYW5zd2VyIHRvIHRoZSBwcm9tcHQuXG4gICAgICovXG4gICAgbW9kZWw/OiBBSS5Nb2RlbDtcbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRvIHN0cmVhbSB0aGUgYW5zd2VyIG9yIG9ubHkgdXBkYXRlIHRoZSBkYXRhIHdoZW4gdGhlIGVudGlyZSBhbnN3ZXIgaGFzIGJlZW4gcmVjZWl2ZWQuXG4gICAgICovXG4gICAgc3RyZWFtPzogYm9vbGVhbjtcbiAgfSAmIE9taXQ8UHJvbWlzZU9wdGlvbnM8RnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlPiwgXCJhYm9ydGFibGVcIj4gPSB7fSxcbikge1xuICBjb25zdCB7IGNyZWF0aXZpdHksIHN0cmVhbSwgbW9kZWwsIC4uLnVzZVByb21pc2VPcHRpb25zIH0gPSBvcHRpb25zO1xuICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgYWJvcnRhYmxlID0gdXNlUmVmPEFib3J0Q29udHJvbGxlcj4obnVsbCk7XG4gIGNvbnN0IHsgaXNMb2FkaW5nLCBlcnJvciwgcmV2YWxpZGF0ZSB9ID0gdXNlUHJvbWlzZShcbiAgICBhc3luYyAocHJvbXB0OiBzdHJpbmcsIGNyZWF0aXZpdHk/OiBBSS5DcmVhdGl2aXR5LCBzaG91bGRTdHJlYW0/OiBib29sZWFuKSA9PiB7XG4gICAgICBzZXREYXRhKFwiXCIpO1xuICAgICAgY29uc3Qgc3RyZWFtID0gQUkuYXNrKHByb21wdCwgeyBjcmVhdGl2aXR5LCBtb2RlbCwgc2lnbmFsOiBhYm9ydGFibGUuY3VycmVudD8uc2lnbmFsIH0pO1xuICAgICAgaWYgKHNob3VsZFN0cmVhbSA9PT0gZmFsc2UpIHtcbiAgICAgICAgc2V0RGF0YShhd2FpdCBzdHJlYW0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyZWFtLm9uKFwiZGF0YVwiLCAoZGF0YSkgPT4ge1xuICAgICAgICAgIHNldERhdGEoKHgpID0+IHggKyBkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHN0cmVhbTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFtwcm9tcHQsIGNyZWF0aXZpdHksIHN0cmVhbV0sXG4gICAgeyAuLi51c2VQcm9taXNlT3B0aW9ucywgYWJvcnRhYmxlIH0sXG4gICk7XG5cbiAgcmV0dXJuIHsgaXNMb2FkaW5nLCBkYXRhLCBlcnJvciwgcmV2YWxpZGF0ZSB9O1xufVxuIiwgImltcG9ydCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VMYXRlc3QgfSBmcm9tIFwiLi91c2VMYXRlc3RcIjtcbmltcG9ydCB7IHVzZUNhY2hlZFN0YXRlIH0gZnJvbSBcIi4vdXNlQ2FjaGVkU3RhdGVcIjtcblxuLy8gVGhlIGFsZ29yaXRobSBiZWxvdyBpcyBpbnNwaXJlZCBieSB0aGUgb25lIHVzZWQgYnkgRmlyZWZveDpcbi8vIGh0dHBzOi8vd2lraS5tb3ppbGxhLm9yZy9Vc2VyOkplc3NlL05ld0ZyZWNlbmN5XG5cbnR5cGUgRnJlY2VuY3kgPSB7XG4gIGxhc3RWaXNpdGVkOiBudW1iZXI7XG4gIGZyZWNlbmN5OiBudW1iZXI7XG59O1xuXG5jb25zdCBIQUxGX0xJRkVfREFZUyA9IDEwO1xuXG5jb25zdCBNU19QRVJfREFZID0gMjQgKiA2MCAqIDYwICogMTAwMDtcblxuY29uc3QgVklTSVRfVFlQRV9QT0lOVFMgPSB7XG4gIERlZmF1bHQ6IDEwMCxcbiAgRW1iZWQ6IDAsXG4gIEJvb2ttYXJrOiAxNDAsXG59O1xuXG5mdW5jdGlvbiBnZXROZXdGcmVjZW5jeShpdGVtPzogRnJlY2VuY3kpOiBGcmVjZW5jeSB7XG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gIGNvbnN0IGxhc3RWaXNpdGVkID0gaXRlbSA/IGl0ZW0ubGFzdFZpc2l0ZWQgOiAwO1xuICBjb25zdCBmcmVjZW5jeSA9IGl0ZW0gPyBpdGVtLmZyZWNlbmN5IDogMDtcblxuICBjb25zdCB2aXNpdEFnZUluRGF5cyA9IChub3cgLSBsYXN0VmlzaXRlZCkgLyBNU19QRVJfREFZO1xuICBjb25zdCBERUNBWV9SQVRFX0NPTlNUQU5UID0gTWF0aC5sb2coMikgLyAoSEFMRl9MSUZFX0RBWVMgKiBNU19QRVJfREFZKTtcbiAgY29uc3QgY3VycmVudFZpc2l0VmFsdWUgPSBWSVNJVF9UWVBFX1BPSU5UUy5EZWZhdWx0ICogTWF0aC5leHAoLURFQ0FZX1JBVEVfQ09OU1RBTlQgKiB2aXNpdEFnZUluRGF5cyk7XG4gIGNvbnN0IHRvdGFsVmlzaXRWYWx1ZSA9IGZyZWNlbmN5ICsgY3VycmVudFZpc2l0VmFsdWU7XG5cbiAgcmV0dXJuIHtcbiAgICBsYXN0VmlzaXRlZDogbm93LFxuICAgIGZyZWNlbmN5OiB0b3RhbFZpc2l0VmFsdWUsXG4gIH07XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG5jb25zdCBkZWZhdWx0S2V5ID0gKGl0ZW06IGFueSk6IHN0cmluZyA9PiB7XG4gIGlmIChcbiAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIgJiZcbiAgICAodHlwZW9mIGl0ZW0gIT09IFwib2JqZWN0XCIgfHwgIWl0ZW0gfHwgIShcImlkXCIgaW4gaXRlbSkgfHwgdHlwZW9mIGl0ZW0uaWQgIT0gXCJzdHJpbmdcIilcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiU3BlY2lmeSBhIGtleSBmdW5jdGlvbiBvciBtYWtlIHN1cmUgeW91ciBpdGVtcyBoYXZlIGFuICdpZCcgcHJvcGVydHlcIik7XG4gIH1cbiAgcmV0dXJuIGl0ZW0uaWQ7XG59O1xuXG4vKipcbiAqIFNvcnQgYW4gYXJyYXkgYnkgaXRzIGZyZWNlbmN5IGFuZCBwcm92aWRlIG1ldGhvZHMgdG8gdXBkYXRlIHRoZSBmcmVjZW5jeSBvZiBpdHMgaXRlbXMuXG4gKiBGcmVjZW5jeSBpcyBhIG1lYXN1cmUgdGhhdCBjb21iaW5lcyBmcmVxdWVuY3kgYW5kIHJlY2VuY3kuIFRoZSBtb3JlIG9mdGVuIGFuIGl0ZW0gaXMgdmlzaXRlZC91c2VkLCBhbmQgdGhlIG1vcmUgcmVjZW50bHkgYW4gaXRlbSBpcyB2aXNpdGVkL3VzZWQsIHRoZSBoaWdoZXIgaXQgd2lsbCByYW5rLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBcbiAqIGltcG9ydCB7IExpc3QsIEFjdGlvblBhbmVsLCBBY3Rpb24sIEljb24gfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG4gKiBpbXBvcnQgeyB1c2VGZXRjaCwgdXNlRnJlY2VuY3lTb3J0aW5nIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ29tbWFuZCgpIHtcbiAqICAgY29uc3QgeyBpc0xvYWRpbmcsIGRhdGEgfSA9IHVzZUZldGNoKFwiaHR0cHM6Ly9hcGkuZXhhbXBsZVwiKTtcbiAqICAgY29uc3QgeyBkYXRhOiBzb3J0ZWREYXRhLCB2aXNpdEl0ZW0sIHJlc2V0UmFua2luZyB9ID0gdXNlRnJlY2VuY3lTb3J0aW5nKGRhdGEpO1xuICpcbiAqICAgcmV0dXJuIChcbiAqICAgICA8TGlzdCBpc0xvYWRpbmc9e2lzTG9hZGluZ30+XG4gKiAgICAgICB7c29ydGVkRGF0YS5tYXAoKGl0ZW0pID0+IChcbiAqICAgICAgICAgPExpc3QuSXRlbVxuICogICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAqICAgICAgICAgICB0aXRsZT17aXRlbS50aXRsZX1cbiAqICAgICAgICAgICBhY3Rpb25zPXtcbiAqICAgICAgICAgICAgIDxBY3Rpb25QYW5lbD5cbiAqICAgICAgICAgICAgICAgPEFjdGlvbi5PcGVuSW5Ccm93c2VyIHVybD17aXRlbS51cmx9IG9uT3Blbj17KCkgPT4gdmlzaXRJdGVtKGl0ZW0pfSAvPlxuICogICAgICAgICAgICAgICA8QWN0aW9uLkNvcHlUb0NsaXBib2FyZCB0aXRsZT1cIkNvcHkgTGlua1wiIGNvbnRlbnQ9e2l0ZW0udXJsfSBvbkNvcHk9eygpID0+IHZpc2l0SXRlbShpdGVtKX0gLz5cbiAqICAgICAgICAgICAgICAgPEFjdGlvbiB0aXRsZT1cIlJlc2V0IFJhbmtpbmdcIiBpY29uPXtJY29uLkFycm93Q291bnRlckNsb2Nrd2lzZX0gb25BY3Rpb249eygpID0+IHJlc2V0UmFua2luZyhpdGVtKX0gLz5cbiAqICAgICAgICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gKiAgICAgICAgICAgfVxuICogICAgICAgICAvPlxuICogICAgICAgKSl9XG4gKiAgICAgPC9MaXN0PlxuICogICApO1xuICogfTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRnJlY2VuY3lTb3J0aW5nPFQgZXh0ZW5kcyB7IGlkOiBzdHJpbmcgfT4oXG4gIGRhdGE/OiBUW10sXG4gIG9wdGlvbnM/OiB7IG5hbWVzcGFjZT86IHN0cmluZzsga2V5PzogKGl0ZW06IFQpID0+IHN0cmluZzsgc29ydFVudmlzaXRlZD86IChhOiBULCBiOiBUKSA9PiBudW1iZXIgfSxcbik6IHtcbiAgZGF0YTogVFtdO1xuICB2aXNpdEl0ZW06IChpdGVtOiBUKSA9PiBQcm9taXNlPHZvaWQ+O1xuICByZXNldFJhbmtpbmc6IChpdGVtOiBUKSA9PiBQcm9taXNlPHZvaWQ+O1xufTtcbmV4cG9ydCBmdW5jdGlvbiB1c2VGcmVjZW5jeVNvcnRpbmc8VD4oXG4gIGRhdGE6IFRbXSB8IHVuZGVmaW5lZCxcbiAgb3B0aW9uczogeyBuYW1lc3BhY2U/OiBzdHJpbmc7IGtleTogKGl0ZW06IFQpID0+IHN0cmluZzsgc29ydFVudmlzaXRlZD86IChhOiBULCBiOiBUKSA9PiBudW1iZXIgfSxcbik6IHtcbiAgZGF0YTogVFtdO1xuICB2aXNpdEl0ZW06IChpdGVtOiBUKSA9PiBQcm9taXNlPHZvaWQ+O1xuICByZXNldFJhbmtpbmc6IChpdGVtOiBUKSA9PiBQcm9taXNlPHZvaWQ+O1xufTtcbmV4cG9ydCBmdW5jdGlvbiB1c2VGcmVjZW5jeVNvcnRpbmc8VD4oXG4gIGRhdGE/OiBUW10sXG4gIG9wdGlvbnM/OiB7IG5hbWVzcGFjZT86IHN0cmluZzsga2V5PzogKGl0ZW06IFQpID0+IHN0cmluZzsgc29ydFVudmlzaXRlZD86IChhOiBULCBiOiBUKSA9PiBudW1iZXIgfSxcbik6IHtcbiAgZGF0YTogVFtdO1xuICB2aXNpdEl0ZW06IChpdGVtOiBUKSA9PiBQcm9taXNlPHZvaWQ+O1xuICByZXNldFJhbmtpbmc6IChpdGVtOiBUKSA9PiBQcm9taXNlPHZvaWQ+O1xufSB7XG4gIGNvbnN0IGtleVJlZiA9IHVzZUxhdGVzdChvcHRpb25zPy5rZXkgfHwgZGVmYXVsdEtleSk7XG4gIGNvbnN0IHNvcnRVbnZpc2l0ZWRSZWYgPSB1c2VMYXRlc3Qob3B0aW9ucz8uc29ydFVudmlzaXRlZCk7XG5cbiAgY29uc3QgW3N0b3JlZEZyZWNlbmNpZXMsIHNldFN0b3JlZEZyZWNlbmNpZXNdID0gdXNlQ2FjaGVkU3RhdGU8UmVjb3JkPHN0cmluZywgRnJlY2VuY3kgfCB1bmRlZmluZWQ+PihcbiAgICBgcmF5Y2FzdF9mcmVjZW5jeV8ke29wdGlvbnM/Lm5hbWVzcGFjZX1gLFxuICAgIHt9LFxuICApO1xuXG4gIGNvbnN0IHZpc2l0SXRlbSA9IHVzZUNhbGxiYWNrKFxuICAgIGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZUZyZWNlbmN5KGl0ZW06IFQpIHtcbiAgICAgIGNvbnN0IGl0ZW1LZXkgPSBrZXlSZWYuY3VycmVudChpdGVtKTtcblxuICAgICAgc2V0U3RvcmVkRnJlY2VuY2llcygoc3RvcmVkRnJlY2VuY2llcykgPT4ge1xuICAgICAgICBjb25zdCBmcmVjZW5jeSA9IHN0b3JlZEZyZWNlbmNpZXNbaXRlbUtleV07XG4gICAgICAgIGNvbnN0IG5ld0ZyZWNlbmN5ID0gZ2V0TmV3RnJlY2VuY3koZnJlY2VuY3kpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uc3RvcmVkRnJlY2VuY2llcyxcbiAgICAgICAgICBbaXRlbUtleV06IG5ld0ZyZWNlbmN5LFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBba2V5UmVmLCBzZXRTdG9yZWRGcmVjZW5jaWVzXSxcbiAgKTtcblxuICBjb25zdCByZXNldFJhbmtpbmcgPSB1c2VDYWxsYmFjayhcbiAgICBhc3luYyBmdW5jdGlvbiByZW1vdmVGcmVjZW5jeShpdGVtOiBUKSB7XG4gICAgICBjb25zdCBpdGVtS2V5ID0ga2V5UmVmLmN1cnJlbnQoaXRlbSk7XG5cbiAgICAgIHNldFN0b3JlZEZyZWNlbmNpZXMoKHN0b3JlZEZyZWNlbmNpZXMpID0+IHtcbiAgICAgICAgY29uc3QgbmV3RnJlbmNlbmNpZXMgPSB7IC4uLnN0b3JlZEZyZWNlbmNpZXMgfTtcbiAgICAgICAgZGVsZXRlIG5ld0ZyZW5jZW5jaWVzW2l0ZW1LZXldO1xuXG4gICAgICAgIHJldHVybiBuZXdGcmVuY2VuY2llcztcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgW2tleVJlZiwgc2V0U3RvcmVkRnJlY2VuY2llc10sXG4gICk7XG5cbiAgY29uc3Qgc29ydGVkRGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghZGF0YSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGNvbnN0IGZyZWNlbmN5QSA9IHN0b3JlZEZyZWNlbmNpZXNba2V5UmVmLmN1cnJlbnQoYSldO1xuICAgICAgY29uc3QgZnJlY2VuY3lCID0gc3RvcmVkRnJlY2VuY2llc1trZXlSZWYuY3VycmVudChiKV07XG5cbiAgICAgIC8vIElmIGEgaGFzIGEgZnJlY2VuY3ksIGJ1dCBiIGRvZXNuJ3QsIGEgc2hvdWxkIGNvbWUgZmlyc3RcbiAgICAgIGlmIChmcmVjZW5jeUEgJiYgIWZyZWNlbmN5Qikge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGIgaGFzIGEgZnJlY2VuY3ksIGJ1dCBhIGRvZXNuJ3QsIGIgc2hvdWxkIGNvbWUgZmlyc3RcbiAgICAgIGlmICghZnJlY2VuY3lBICYmIGZyZWNlbmN5Qikge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgYm90aCBmcmVjZW5jaWVzIGFyZSBkZWZpbmVkLHB1dCB0aGUgb25lIHdpdGggdGhlIGhpZ2hlciBmcmVjZW5jeSBmaXJzdFxuICAgICAgaWYgKGZyZWNlbmN5QSAmJiBmcmVjZW5jeUIpIHtcbiAgICAgICAgcmV0dXJuIGZyZWNlbmN5Qi5mcmVjZW5jeSAtIGZyZWNlbmN5QS5mcmVjZW5jeTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgYm90aCBmcmVjZW5jaWVzIGFyZSB1bmRlZmluZWQsIGtlZXAgdGhlIG9yaWdpbmFsIG9yZGVyXG4gICAgICByZXR1cm4gc29ydFVudmlzaXRlZFJlZi5jdXJyZW50ID8gc29ydFVudmlzaXRlZFJlZi5jdXJyZW50KGEsIGIpIDogMDtcbiAgICB9KTtcbiAgfSwgW3N0b3JlZEZyZWNlbmNpZXMsIGRhdGEsIGtleVJlZiwgc29ydFVudmlzaXRlZFJlZl0pO1xuXG4gIHJldHVybiB7IGRhdGE6IHNvcnRlZERhdGEsIHZpc2l0SXRlbSwgcmVzZXRSYW5raW5nIH07XG59XG4iLCAiaW1wb3J0IHsgTG9jYWxTdG9yYWdlIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgc2hvd0ZhaWx1cmVUb2FzdCB9IGZyb20gXCIuL3Nob3dGYWlsdXJlVG9hc3RcIjtcbmltcG9ydCB7IHJlcGxhY2VyLCByZXZpdmVyIH0gZnJvbSBcIi4vaGVscGVyc1wiO1xuaW1wb3J0IHsgdXNlUHJvbWlzZSB9IGZyb20gXCIuL3VzZVByb21pc2VcIjtcblxuLyoqXG4gKiBBIGhvb2sgdG8gbWFuYWdlIGEgdmFsdWUgaW4gdGhlIGxvY2FsIHN0b3JhZ2UuXG4gKlxuICogQHJlbWFyayBUaGUgdmFsdWUgaXMgc3RvcmVkIGFzIGEgSlNPTiBzdHJpbmcgaW4gdGhlIGxvY2FsIHN0b3JhZ2UuXG4gKlxuICogQHBhcmFtIGtleSAtIFRoZSBrZXkgdG8gdXNlIGZvciB0aGUgdmFsdWUgaW4gdGhlIGxvY2FsIHN0b3JhZ2UuXG4gKiBAcGFyYW0gaW5pdGlhbFZhbHVlIC0gVGhlIGluaXRpYWwgdmFsdWUgdG8gdXNlIGlmIHRoZSBrZXkgZG9lc24ndCBleGlzdCBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqIC0gYHZhbHVlYDogVGhlIHZhbHVlIGZyb20gdGhlIGxvY2FsIHN0b3JhZ2Ugb3IgdGhlIGluaXRpYWwgdmFsdWUgaWYgdGhlIGtleSBkb2Vzbid0IGV4aXN0LlxuICogLSBgc2V0VmFsdWVgOiBBIGZ1bmN0aW9uIHRvIHVwZGF0ZSB0aGUgdmFsdWUgaW4gdGhlIGxvY2FsIHN0b3JhZ2UuXG4gKiAtIGByZW1vdmVWYWx1ZWA6IEEgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoZSB2YWx1ZSBmcm9tIHRoZSBsb2NhbCBzdG9yYWdlLlxuICogLSBgaXNMb2FkaW5nYDogQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhlIHZhbHVlIGlzIGxvYWRpbmcuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogY29uc3QgeyB2YWx1ZSwgc2V0VmFsdWUgfSA9IHVzZUxvY2FsU3RvcmFnZTxzdHJpbmc+KFwibXkta2V5XCIpO1xuICogY29uc3QgeyB2YWx1ZSwgc2V0VmFsdWUgfSA9IHVzZUxvY2FsU3RvcmFnZTxzdHJpbmc+KFwibXkta2V5XCIsIFwiZGVmYXVsdCB2YWx1ZVwiKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlTG9jYWxTdG9yYWdlPFQ+KGtleTogc3RyaW5nLCBpbml0aWFsVmFsdWU/OiBUKSB7XG4gIGNvbnN0IHtcbiAgICBkYXRhOiB2YWx1ZSxcbiAgICBpc0xvYWRpbmcsXG4gICAgbXV0YXRlLFxuICB9ID0gdXNlUHJvbWlzZShcbiAgICBhc3luYyAoc3RvcmFnZUtleTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBpdGVtID0gYXdhaXQgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihzdG9yYWdlS2V5KTtcblxuICAgICAgcmV0dXJuIHR5cGVvZiBpdGVtICE9PSBcInVuZGVmaW5lZFwiID8gKEpTT04ucGFyc2UoaXRlbSwgcmV2aXZlcikgYXMgVCkgOiBpbml0aWFsVmFsdWU7XG4gICAgfSxcbiAgICBba2V5XSxcbiAgKTtcblxuICBhc3luYyBmdW5jdGlvbiBzZXRWYWx1ZSh2YWx1ZTogVCkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBtdXRhdGUoTG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgcmVwbGFjZXIpKSwge1xuICAgICAgICBvcHRpbWlzdGljVXBkYXRlKHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF3YWl0IHNob3dGYWlsdXJlVG9hc3QoZXJyb3IsIHsgdGl0bGU6IFwiRmFpbGVkIHRvIHNldCB2YWx1ZSBpbiBsb2NhbCBzdG9yYWdlXCIgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlVmFsdWUoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IG11dGF0ZShMb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpLCB7XG4gICAgICAgIG9wdGltaXN0aWNVcGRhdGUoKSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhd2FpdCBzaG93RmFpbHVyZVRvYXN0KGVycm9yLCB7IHRpdGxlOiBcIkZhaWxlZCB0byByZW1vdmUgdmFsdWUgZnJvbSBsb2NhbCBzdG9yYWdlXCIgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgdmFsdWUsIHNldFZhbHVlLCByZW1vdmVWYWx1ZSwgaXNMb2FkaW5nIH07XG59XG4iLCAiZXhwb3J0IHsgZ2V0QXZhdGFySWNvbiB9IGZyb20gXCIuL2F2YXRhclwiO1xuZXhwb3J0IHsgZ2V0RmF2aWNvbiB9IGZyb20gXCIuL2Zhdmljb25cIjtcbmV4cG9ydCB7IGdldFByb2dyZXNzSWNvbiB9IGZyb20gXCIuL3Byb2dyZXNzXCI7XG4iLCAiaW1wb3J0IHR5cGUgeyBJbWFnZSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IHNsaWdodGx5TGlnaHRlckNvbG9yLCBzbGlnaHRseURhcmtlckNvbG9yIH0gZnJvbSBcIi4vY29sb3JcIjtcblxuZnVuY3Rpb24gZ2V0V2hvbGVDaGFyQW5kSShzdHI6IHN0cmluZywgaTogbnVtYmVyKTogW3N0cmluZywgbnVtYmVyXSB7XG4gIGNvbnN0IGNvZGUgPSBzdHIuY2hhckNvZGVBdChpKTtcblxuICBpZiAoTnVtYmVyLmlzTmFOKGNvZGUpKSB7XG4gICAgcmV0dXJuIFtcIlwiLCBpXTtcbiAgfVxuICBpZiAoY29kZSA8IDB4ZDgwMCB8fCBjb2RlID4gMHhkZmZmKSB7XG4gICAgcmV0dXJuIFtzdHIuY2hhckF0KGkpLCBpXTsgLy8gTm9ybWFsIGNoYXJhY3Rlciwga2VlcGluZyAnaScgdGhlIHNhbWVcbiAgfVxuXG4gIC8vIEhpZ2ggc3Vycm9nYXRlIChjb3VsZCBjaGFuZ2UgbGFzdCBoZXggdG8gMHhEQjdGIHRvIHRyZWF0IGhpZ2ggcHJpdmF0ZVxuICAvLyBzdXJyb2dhdGVzIGFzIHNpbmdsZSBjaGFyYWN0ZXJzKVxuICBpZiAoMHhkODAwIDw9IGNvZGUgJiYgY29kZSA8PSAweGRiZmYpIHtcbiAgICBpZiAoc3RyLmxlbmd0aCA8PSBpICsgMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSGlnaCBzdXJyb2dhdGUgd2l0aG91dCBmb2xsb3dpbmcgbG93IHN1cnJvZ2F0ZVwiKTtcbiAgICB9XG4gICAgY29uc3QgbmV4dCA9IHN0ci5jaGFyQ29kZUF0KGkgKyAxKTtcbiAgICBpZiAoMHhkYzAwID4gbmV4dCB8fCBuZXh0ID4gMHhkZmZmKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJIaWdoIHN1cnJvZ2F0ZSB3aXRob3V0IGZvbGxvd2luZyBsb3cgc3Vycm9nYXRlXCIpO1xuICAgIH1cbiAgICByZXR1cm4gW3N0ci5jaGFyQXQoaSkgKyBzdHIuY2hhckF0KGkgKyAxKSwgaSArIDFdO1xuICB9XG5cbiAgLy8gTG93IHN1cnJvZ2F0ZSAoMHhEQzAwIDw9IGNvZGUgJiYgY29kZSA8PSAweERGRkYpXG4gIGlmIChpID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTG93IHN1cnJvZ2F0ZSB3aXRob3V0IHByZWNlZGluZyBoaWdoIHN1cnJvZ2F0ZVwiKTtcbiAgfVxuXG4gIGNvbnN0IHByZXYgPSBzdHIuY2hhckNvZGVBdChpIC0gMSk7XG5cbiAgLy8gKGNvdWxkIGNoYW5nZSBsYXN0IGhleCB0byAweERCN0YgdG8gdHJlYXQgaGlnaCBwcml2YXRlIHN1cnJvZ2F0ZXNcbiAgLy8gYXMgc2luZ2xlIGNoYXJhY3RlcnMpXG4gIGlmICgweGQ4MDAgPiBwcmV2IHx8IHByZXYgPiAweGRiZmYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb3cgc3Vycm9nYXRlIHdpdGhvdXQgcHJlY2VkaW5nIGhpZ2ggc3Vycm9nYXRlXCIpO1xuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBuZXh0IGNoYXJhY3RlciBpbnN0ZWFkIChhbmQgaW5jcmVtZW50KVxuICByZXR1cm4gW3N0ci5jaGFyQXQoaSArIDEpLCBpICsgMV07XG59XG5cbmNvbnN0IGF2YXRhckNvbG9yU2V0ID0gW1xuICBcIiNEQzgyOUFcIiwgLy8gUGlua1xuICBcIiNENjQ4NTRcIiwgLy8gUmVkXG4gIFwiI0Q0NzYwMFwiLCAvLyBZZWxsb3dPcmFuZ2VcbiAgXCIjRDM2Q0REXCIsIC8vIE1hZ2VudGFcbiAgXCIjNTJBOUU0XCIsIC8vIEFxdWFcbiAgXCIjNzg3MUU4XCIsIC8vIEluZGlnb1xuICBcIiM3MDkyMEZcIiwgLy8gWWVsbG93R3JlZW5cbiAgXCIjNDNCOTNBXCIsIC8vIEdyZWVuXG4gIFwiI0VCNkIzRVwiLCAvLyBPcmFuZ2VcbiAgXCIjMjZCNzk1XCIsIC8vIEJsdWVHcmVlblxuICBcIiNEODVBOUJcIiwgLy8gSG90UGlua1xuICBcIiNBMDY3RENcIiwgLy8gUHVycGxlXG4gIFwiI0JEOTUwMFwiLCAvLyBZZWxsb3dcbiAgXCIjNTM4NUQ5XCIsIC8vIEJsdWVcbl07XG5cbi8qKlxuICogSWNvbiB0byByZXByZXNlbnQgYW4gYXZhdGFyIHdoZW4geW91IGRvbid0IGhhdmUgb25lLiBUaGUgZ2VuZXJhdGVkIGF2YXRhclxuICogd2lsbCBiZSBnZW5lcmF0ZWQgZnJvbSB0aGUgaW5pdGlhbHMgb2YgdGhlIG5hbWUgYW5kIGhhdmUgYSBjb2xvcmZ1bCBidXQgY29uc2lzdGVudCBiYWNrZ3JvdW5kLlxuICpcbiAqIEByZXR1cm5zIGFuIEltYWdlIHRoYXQgY2FuIGJlIHVzZWQgd2hlcmUgUmF5Y2FzdCBleHBlY3RzIHRoZW0uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogPExpc3QuSXRlbSBpY29uPXtnZXRBdmF0YXJJY29uKCdNYXRoaWV1IER1dG91cicpfSB0aXRsZT1cIlByb2plY3RcIiAvPlxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBdmF0YXJJY29uKFxuICBuYW1lOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiB7XG4gICAgLyoqXG4gICAgICogQ3VzdG9tIGJhY2tncm91bmQgY29sb3JcbiAgICAgKi9cbiAgICBiYWNrZ3JvdW5kPzogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdG8gdXNlIGEgZ3JhZGllbnQgZm9yIHRoZSBiYWNrZ3JvdW5kIG9yIG5vdC5cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgZ3JhZGllbnQ/OiBib29sZWFuO1xuICB9LFxuKTogSW1hZ2UuQXNzZXQge1xuICBjb25zdCB3b3JkcyA9IG5hbWUudHJpbSgpLnNwbGl0KFwiIFwiKTtcbiAgbGV0IGluaXRpYWxzOiBzdHJpbmc7XG4gIGlmICh3b3Jkcy5sZW5ndGggPT0gMSAmJiBnZXRXaG9sZUNoYXJBbmRJKHdvcmRzWzBdLCAwKVswXSkge1xuICAgIGluaXRpYWxzID0gZ2V0V2hvbGVDaGFyQW5kSSh3b3Jkc1swXSwgMClbMF07XG4gIH0gZWxzZSBpZiAod29yZHMubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IGZpcnN0V29yZEZpcnN0TGV0dGVyID0gZ2V0V2hvbGVDaGFyQW5kSSh3b3Jkc1swXSwgMClbMF0gfHwgXCJcIjtcbiAgICBjb25zdCBsYXN0V29yZEZpcnN0TGV0dGVyID0gZ2V0V2hvbGVDaGFyQW5kSSh3b3Jkc1t3b3Jkcy5sZW5ndGggLSAxXSwgMClbMF0gPz8gXCJcIjtcbiAgICBpbml0aWFscyA9IGZpcnN0V29yZEZpcnN0TGV0dGVyICsgbGFzdFdvcmRGaXJzdExldHRlcjtcbiAgfSBlbHNlIHtcbiAgICBpbml0aWFscyA9IFwiXCI7XG4gIH1cblxuICBsZXQgYmFja2dyb3VuZENvbG9yOiBzdHJpbmc7XG5cbiAgaWYgKG9wdGlvbnM/LmJhY2tncm91bmQpIHtcbiAgICBiYWNrZ3JvdW5kQ29sb3IgPSBvcHRpb25zPy5iYWNrZ3JvdW5kO1xuICB9IGVsc2Uge1xuICAgIGxldCBpbml0aWFsc0NoYXJJbmRleCA9IDA7XG4gICAgbGV0IFtjaGFyLCBpXSA9IGdldFdob2xlQ2hhckFuZEkoaW5pdGlhbHMsIDApO1xuICAgIHdoaWxlIChjaGFyKSB7XG4gICAgICBpbml0aWFsc0NoYXJJbmRleCArPSBjaGFyLmNoYXJDb2RlQXQoMCk7XG4gICAgICBbY2hhciwgaV0gPSBnZXRXaG9sZUNoYXJBbmRJKGluaXRpYWxzLCBpICsgMSk7XG4gICAgfVxuXG4gICAgY29uc3QgY29sb3JJbmRleCA9IGluaXRpYWxzQ2hhckluZGV4ICUgYXZhdGFyQ29sb3JTZXQubGVuZ3RoO1xuICAgIGJhY2tncm91bmRDb2xvciA9IGF2YXRhckNvbG9yU2V0W2NvbG9ySW5kZXhdO1xuICB9XG5cbiAgY29uc3QgcGFkZGluZyA9IDA7XG4gIGNvbnN0IHJhZGl1cyA9IDUwIC0gcGFkZGluZztcblxuICBjb25zdCBzdmcgPSBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxMDBweFwiIGhlaWdodD1cIjEwMHB4XCI+XG4gICR7XG4gICAgb3B0aW9ucz8uZ3JhZGllbnQgIT09IGZhbHNlXG4gICAgICA/IGA8ZGVmcz5cbiAgICAgIDxsaW5lYXJHcmFkaWVudCBpZD1cIkdyYWRpZW50XCIgeDE9XCIwLjI1XCIgeDI9XCIwLjc1XCIgeTE9XCIwXCIgeTI9XCIxXCI+XG4gICAgICAgIDxzdG9wIG9mZnNldD1cIjAlXCIgc3RvcC1jb2xvcj1cIiR7c2xpZ2h0bHlMaWdodGVyQ29sb3IoYmFja2dyb3VuZENvbG9yKX1cIi8+XG4gICAgICAgIDxzdG9wIG9mZnNldD1cIjUwJVwiIHN0b3AtY29sb3I9XCIke2JhY2tncm91bmRDb2xvcn1cIi8+XG4gICAgICAgIDxzdG9wIG9mZnNldD1cIjEwMCVcIiBzdG9wLWNvbG9yPVwiJHtzbGlnaHRseURhcmtlckNvbG9yKGJhY2tncm91bmRDb2xvcil9XCIvPlxuICAgICAgPC9saW5lYXJHcmFkaWVudD5cbiAgPC9kZWZzPmBcbiAgICAgIDogXCJcIlxuICB9XG4gICAgICA8Y2lyY2xlIGN4PVwiNTBcIiBjeT1cIjUwXCIgcj1cIiR7cmFkaXVzfVwiIGZpbGw9XCIke1xuICAgICAgICBvcHRpb25zPy5ncmFkaWVudCAhPT0gZmFsc2UgPyBcInVybCgjR3JhZGllbnQpXCIgOiBiYWNrZ3JvdW5kQ29sb3JcbiAgICAgIH1cIiAvPlxuICAgICAgJHtcbiAgICAgICAgaW5pdGlhbHNcbiAgICAgICAgICA/IGA8dGV4dCB4PVwiNTBcIiB5PVwiODBcIiBmb250LXNpemU9XCIke1xuICAgICAgICAgICAgICByYWRpdXMgLSAxXG4gICAgICAgICAgICB9XCIgZm9udC1mYW1pbHk9XCJJbnRlciwgc2Fucy1zZXJpZlwiIHRleHQtYW5jaG9yPVwibWlkZGxlXCIgZmlsbD1cIndoaXRlXCI+JHtpbml0aWFscy50b1VwcGVyQ2FzZSgpfTwvdGV4dD5gXG4gICAgICAgICAgOiBcIlwiXG4gICAgICB9XG4gICAgPC9zdmc+XG4gIGAucmVwbGFjZUFsbChcIlxcblwiLCBcIlwiKTtcbiAgcmV0dXJuIGBkYXRhOmltYWdlL3N2Zyt4bWwsJHtlbmNvZGVVUklDb21wb25lbnQoc3ZnKX1gO1xufVxuIiwgImZ1bmN0aW9uIGhleFRvUkdCKGhleDogc3RyaW5nKSB7XG4gIGxldCByID0gMDtcbiAgbGV0IGcgPSAwO1xuICBsZXQgYiA9IDA7XG5cbiAgLy8gMyBkaWdpdHNcbiAgaWYgKGhleC5sZW5ndGggPT09IDQpIHtcbiAgICByID0gcGFyc2VJbnQoYCR7aGV4WzFdfSR7aGV4WzFdfWAsIDE2KTtcbiAgICBnID0gcGFyc2VJbnQoYCR7aGV4WzJdfSR7aGV4WzJdfWAsIDE2KTtcbiAgICBiID0gcGFyc2VJbnQoYCR7aGV4WzNdfSR7aGV4WzNdfWAsIDE2KTtcblxuICAgIC8vIDYgZGlnaXRzXG4gIH0gZWxzZSBpZiAoaGV4Lmxlbmd0aCA9PT0gNykge1xuICAgIHIgPSBwYXJzZUludChgJHtoZXhbMV19JHtoZXhbMl19YCwgMTYpO1xuICAgIGcgPSBwYXJzZUludChgJHtoZXhbM119JHtoZXhbNF19YCwgMTYpO1xuICAgIGIgPSBwYXJzZUludChgJHtoZXhbNV19JHtoZXhbNl19YCwgMTYpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihgTWFsZm9ybWVkIGhleCBjb2xvcjogJHtoZXh9YCk7XG4gIH1cblxuICByZXR1cm4geyByLCBnLCBiIH07XG59XG5cbmZ1bmN0aW9uIHJnYlRvSGV4KHsgciwgZywgYiB9OiB7IHI6IG51bWJlcjsgZzogbnVtYmVyOyBiOiBudW1iZXIgfSkge1xuICBsZXQgclN0cmluZyA9IHIudG9TdHJpbmcoMTYpO1xuICBsZXQgZ1N0cmluZyA9IGcudG9TdHJpbmcoMTYpO1xuICBsZXQgYlN0cmluZyA9IGIudG9TdHJpbmcoMTYpO1xuXG4gIGlmIChyU3RyaW5nLmxlbmd0aCA9PT0gMSkge1xuICAgIHJTdHJpbmcgPSBgMCR7clN0cmluZ31gO1xuICB9XG4gIGlmIChnU3RyaW5nLmxlbmd0aCA9PT0gMSkge1xuICAgIGdTdHJpbmcgPSBgMCR7Z1N0cmluZ31gO1xuICB9XG4gIGlmIChiU3RyaW5nLmxlbmd0aCA9PT0gMSkge1xuICAgIGJTdHJpbmcgPSBgMCR7YlN0cmluZ31gO1xuICB9XG5cbiAgcmV0dXJuIGAjJHtyU3RyaW5nfSR7Z1N0cmluZ30ke2JTdHJpbmd9YDtcbn1cblxuZnVuY3Rpb24gcmdiVG9IU0woeyByLCBnLCBiIH06IHsgcjogbnVtYmVyOyBnOiBudW1iZXI7IGI6IG51bWJlciB9KSB7XG4gIC8vIE1ha2UgciwgZywgYW5kIGIgZnJhY3Rpb25zIG9mIDFcbiAgciAvPSAyNTU7XG4gIGcgLz0gMjU1O1xuICBiIC89IDI1NTtcblxuICAvLyBGaW5kIGdyZWF0ZXN0IGFuZCBzbWFsbGVzdCBjaGFubmVsIHZhbHVlc1xuICBjb25zdCBjbWluID0gTWF0aC5taW4ociwgZywgYik7XG4gIGNvbnN0IGNtYXggPSBNYXRoLm1heChyLCBnLCBiKTtcbiAgY29uc3QgZGVsdGEgPSBjbWF4IC0gY21pbjtcbiAgbGV0IGggPSAwO1xuICBsZXQgcyA9IDA7XG4gIGxldCBsID0gMDtcblxuICAvLyBDYWxjdWxhdGUgaHVlXG4gIC8vIE5vIGRpZmZlcmVuY2VcbiAgaWYgKGRlbHRhID09PSAwKSB7XG4gICAgaCA9IDA7XG4gIH1cbiAgLy8gUmVkIGlzIG1heFxuICBlbHNlIGlmIChjbWF4ID09PSByKSB7XG4gICAgaCA9ICgoZyAtIGIpIC8gZGVsdGEpICUgNjtcbiAgfVxuICAvLyBHcmVlbiBpcyBtYXhcbiAgZWxzZSBpZiAoY21heCA9PT0gZykge1xuICAgIGggPSAoYiAtIHIpIC8gZGVsdGEgKyAyO1xuICB9XG4gIC8vIEJsdWUgaXMgbWF4XG4gIGVsc2Uge1xuICAgIGggPSAociAtIGcpIC8gZGVsdGEgKyA0O1xuICB9XG5cbiAgaCA9IE1hdGgucm91bmQoaCAqIDYwKTtcblxuICAvLyBNYWtlIG5lZ2F0aXZlIGh1ZXMgcG9zaXRpdmUgYmVoaW5kIDM2MMKwXG4gIGlmIChoIDwgMCkge1xuICAgIGggKz0gMzYwO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIGxpZ2h0bmVzc1xuICBsID0gKGNtYXggKyBjbWluKSAvIDI7XG5cbiAgLy8gQ2FsY3VsYXRlIHNhdHVyYXRpb25cbiAgcyA9IGRlbHRhID09PSAwID8gMCA6IGRlbHRhIC8gKDEgLSBNYXRoLmFicygyICogbCAtIDEpKTtcblxuICAvLyBNdWx0aXBseSBsIGFuZCBzIGJ5IDEwMFxuICBzID0gKyhzICogMTAwKS50b0ZpeGVkKDEpO1xuICBsID0gKyhsICogMTAwKS50b0ZpeGVkKDEpO1xuXG4gIHJldHVybiB7IGgsIHMsIGwgfTtcbn1cblxuZnVuY3Rpb24gaHNsVG9SR0IoeyBoLCBzLCBsIH06IHsgaDogbnVtYmVyOyBzOiBudW1iZXI7IGw6IG51bWJlciB9KSB7XG4gIC8vIE11c3QgYmUgZnJhY3Rpb25zIG9mIDFcbiAgcyAvPSAxMDA7XG4gIGwgLz0gMTAwO1xuXG4gIGNvbnN0IGMgPSAoMSAtIE1hdGguYWJzKDIgKiBsIC0gMSkpICogcztcbiAgY29uc3QgeCA9IGMgKiAoMSAtIE1hdGguYWJzKCgoaCAvIDYwKSAlIDIpIC0gMSkpO1xuICBjb25zdCBtID0gbCAtIGMgLyAyO1xuICBsZXQgciA9IDA7XG4gIGxldCBnID0gMDtcbiAgbGV0IGIgPSAwO1xuXG4gIGlmIChoID49IDAgJiYgaCA8IDYwKSB7XG4gICAgciA9IGM7XG4gICAgZyA9IHg7XG4gICAgYiA9IDA7XG4gIH0gZWxzZSBpZiAoaCA+PSA2MCAmJiBoIDwgMTIwKSB7XG4gICAgciA9IHg7XG4gICAgZyA9IGM7XG4gICAgYiA9IDA7XG4gIH0gZWxzZSBpZiAoaCA+PSAxMjAgJiYgaCA8IDE4MCkge1xuICAgIHIgPSAwO1xuICAgIGcgPSBjO1xuICAgIGIgPSB4O1xuICB9IGVsc2UgaWYgKGggPj0gMTgwICYmIGggPCAyNDApIHtcbiAgICByID0gMDtcbiAgICBnID0geDtcbiAgICBiID0gYztcbiAgfSBlbHNlIGlmIChoID49IDI0MCAmJiBoIDwgMzAwKSB7XG4gICAgciA9IHg7XG4gICAgZyA9IDA7XG4gICAgYiA9IGM7XG4gIH0gZWxzZSBpZiAoaCA+PSAzMDAgJiYgaCA8IDM2MCkge1xuICAgIHIgPSBjO1xuICAgIGcgPSAwO1xuICAgIGIgPSB4O1xuICB9XG4gIHIgPSBNYXRoLnJvdW5kKChyICsgbSkgKiAyNTUpO1xuICBnID0gTWF0aC5yb3VuZCgoZyArIG0pICogMjU1KTtcbiAgYiA9IE1hdGgucm91bmQoKGIgKyBtKSAqIDI1NSk7XG5cbiAgcmV0dXJuIHsgciwgZywgYiB9O1xufVxuXG5mdW5jdGlvbiBoZXhUb0hTTChoZXg6IHN0cmluZykge1xuICByZXR1cm4gcmdiVG9IU0woaGV4VG9SR0IoaGV4KSk7XG59XG5cbmZ1bmN0aW9uIGhzbFRvSGV4KGhzbDogeyBoOiBudW1iZXI7IHM6IG51bWJlcjsgbDogbnVtYmVyIH0pIHtcbiAgcmV0dXJuIHJnYlRvSGV4KGhzbFRvUkdCKGhzbCkpO1xufVxuXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZTogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHtcbiAgcmV0dXJuIG1pbiA8IG1heCA/ICh2YWx1ZSA8IG1pbiA/IG1pbiA6IHZhbHVlID4gbWF4ID8gbWF4IDogdmFsdWUpIDogdmFsdWUgPCBtYXggPyBtYXggOiB2YWx1ZSA+IG1pbiA/IG1pbiA6IHZhbHVlO1xufVxuXG5jb25zdCBvZmZzZXQgPSAxMjtcblxuZXhwb3J0IGZ1bmN0aW9uIHNsaWdodGx5RGFya2VyQ29sb3IoaGV4OiBzdHJpbmcpIHtcbiAgY29uc3QgaHNsID0gaGV4VG9IU0woaGV4KTtcblxuICByZXR1cm4gaHNsVG9IZXgoe1xuICAgIGg6IGhzbC5oLFxuICAgIHM6IGhzbC5zLFxuICAgIGw6IGNsYW1wKGhzbC5sIC0gb2Zmc2V0LCAwLCAxMDApLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNsaWdodGx5TGlnaHRlckNvbG9yKGhleDogc3RyaW5nKSB7XG4gIGNvbnN0IGhzbCA9IGhleFRvSFNMKGhleCk7XG5cbiAgcmV0dXJuIGhzbFRvSGV4KHtcbiAgICBoOiBoc2wuaCxcbiAgICBzOiBoc2wucyxcbiAgICBsOiBjbGFtcChoc2wubCArIG9mZnNldCwgMCwgMTAwKSxcbiAgfSk7XG59XG4iLCAiaW1wb3J0IHsgSWNvbiwgSW1hZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBVUkwgfSBmcm9tIFwibm9kZTp1cmxcIjtcblxuLyoqXG4gKiBJY29uIHNob3dpbmcgdGhlIGZhdmljb24gb2YgYSB3ZWJzaXRlLlxuICpcbiAqIEEgZmF2aWNvbiAoZmF2b3JpdGUgaWNvbikgaXMgYSB0aW55IGljb24gaW5jbHVkZWQgYWxvbmcgd2l0aCBhIHdlYnNpdGUsIHdoaWNoIGlzIGRpc3BsYXllZCBpbiBwbGFjZXMgbGlrZSB0aGUgYnJvd3NlcidzIGFkZHJlc3MgYmFyLCBwYWdlIHRhYnMsIGFuZCBib29rbWFya3MgbWVudS5cbiAqXG4gKiBAcGFyYW0gdXJsIFRoZSBVUkwgb2YgdGhlIHdlYnNpdGUgdG8gcmVwcmVzZW50LlxuICpcbiAqIEByZXR1cm5zIGFuIEltYWdlIHRoYXQgY2FuIGJlIHVzZWQgd2hlcmUgUmF5Y2FzdCBleHBlY3RzIHRoZW0uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogPExpc3QuSXRlbSBpY29uPXtnZXRGYXZpY29uKFwiaHR0cHM6Ly9yYXljYXN0LmNvbVwiKX0gdGl0bGU9XCJSYXljYXN0IFdlYnNpdGVcIiAvPlxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGYXZpY29uKFxuICB1cmw6IHN0cmluZyB8IFVSTCxcbiAgb3B0aW9ucz86IHtcbiAgICAvKipcbiAgICAgKiBTaXplIG9mIHRoZSBGYXZpY29uXG4gICAgICogQGRlZmF1bHQgNjRcbiAgICAgKi9cbiAgICBzaXplPzogbnVtYmVyO1xuICAgIC8qKlxuICAgICAqIEZhbGxiYWNrIGljb24gaW4gY2FzZSB0aGUgRmF2aWNvbiBpcyBub3QgZm91bmQuXG4gICAgICogQGRlZmF1bHQgSWNvbi5MaW5rXG4gICAgICovXG4gICAgZmFsbGJhY2s/OiBJbWFnZS5GYWxsYmFjaztcbiAgICAvKipcbiAgICAgKiBBIHtAbGluayBJbWFnZS5NYXNrfSB0byBhcHBseSB0byB0aGUgRmF2aWNvbi5cbiAgICAgKi9cbiAgICBtYXNrPzogSW1hZ2UuTWFzaztcbiAgfSxcbik6IEltYWdlLkltYWdlTGlrZSB7XG4gIHRyeSB7XG4gICAgLy8gYSBmdW5jIGFkZGluZyBodHRwczovLyB0byB0aGUgVVJMXG4gICAgLy8gZm9yIGNhc2VzIHdoZXJlIHRoZSBVUkwgaXMgbm90IGEgZnVsbCBVUkxcbiAgICAvLyBlLmcuIFwicmF5Y2FzdC5jb21cIlxuICAgIGNvbnN0IHNhbml0aXplID0gKHVybDogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoIXVybC5zdGFydHNXaXRoKFwiaHR0cFwiKSkge1xuICAgICAgICByZXR1cm4gYGh0dHBzOi8vJHt1cmx9YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1cmw7XG4gICAgfTtcblxuICAgIGNvbnN0IHVybE9iaiA9IHR5cGVvZiB1cmwgPT09IFwic3RyaW5nXCIgPyBuZXcgVVJMKHNhbml0aXplKHVybCkpIDogdXJsO1xuICAgIGNvbnN0IGhvc3RuYW1lID0gdXJsT2JqLmhvc3RuYW1lO1xuXG4gICAgY29uc3QgZmF2aWNvblByb3ZpZGVyOiBcIm5vbmVcIiB8IFwicmF5Y2FzdFwiIHwgXCJhcHBsZVwiIHwgXCJnb29nbGVcIiB8IFwiZHVja0R1Y2tHb1wiIHwgXCJkdWNrZHVja2dvXCIgfCBcImxlZ2FjeVwiID1cbiAgICAgIChwcm9jZXNzLmVudi5GQVZJQ09OX1BST1ZJREVSIGFzIGFueSkgPz8gXCJyYXljYXN0XCI7XG5cbiAgICBzd2l0Y2ggKGZhdmljb25Qcm92aWRlcikge1xuICAgICAgY2FzZSBcIm5vbmVcIjpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzb3VyY2U6IG9wdGlvbnM/LmZhbGxiYWNrID8/IEljb24uTGluayxcbiAgICAgICAgICBtYXNrOiBvcHRpb25zPy5tYXNrLFxuICAgICAgICB9O1xuICAgICAgY2FzZSBcImFwcGxlXCI6XG4gICAgICAgIC8vIHdlIGNhbid0IHN1cHBvcnQgYXBwbGUgZmF2aWNvbnMgYXMgaXQncyBhIG5hdGl2ZSBBUElcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzb3VyY2U6IG9wdGlvbnM/LmZhbGxiYWNrID8/IEljb24uTGluayxcbiAgICAgICAgICBtYXNrOiBvcHRpb25zPy5tYXNrLFxuICAgICAgICB9O1xuICAgICAgY2FzZSBcImR1Y2tkdWNrZ29cIjpcbiAgICAgIGNhc2UgXCJkdWNrRHVja0dvXCI6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc291cmNlOiBgaHR0cHM6Ly9pY29ucy5kdWNrZHVja2dvLmNvbS9pcDMvJHtob3N0bmFtZX0uaWNvYCxcbiAgICAgICAgICBmYWxsYmFjazogb3B0aW9ucz8uZmFsbGJhY2sgPz8gSWNvbi5MaW5rLFxuICAgICAgICAgIG1hc2s6IG9wdGlvbnM/Lm1hc2ssXG4gICAgICAgIH07XG4gICAgICBjYXNlIFwiZ29vZ2xlXCI6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc291cmNlOiBgaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9zMi9mYXZpY29ucz9zej0ke29wdGlvbnM/LnNpemUgPz8gNjR9JmRvbWFpbj0ke2hvc3RuYW1lfWAsXG4gICAgICAgICAgZmFsbGJhY2s6IG9wdGlvbnM/LmZhbGxiYWNrID8/IEljb24uTGluayxcbiAgICAgICAgICBtYXNrOiBvcHRpb25zPy5tYXNrLFxuICAgICAgICB9O1xuICAgICAgY2FzZSBcImxlZ2FjeVwiOlxuICAgICAgY2FzZSBcInJheWNhc3RcIjpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc291cmNlOiBgaHR0cHM6Ly9hcGkucmF5LnNvL2Zhdmljb24/dXJsPSR7aG9zdG5hbWV9JnNpemU9JHtvcHRpb25zPy5zaXplID8/IDY0fWAsXG4gICAgICAgICAgZmFsbGJhY2s6IG9wdGlvbnM/LmZhbGxiYWNrID8/IEljb24uTGluayxcbiAgICAgICAgICBtYXNrOiBvcHRpb25zPy5tYXNrLFxuICAgICAgICB9O1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgcmV0dXJuIEljb24uTGluaztcbiAgfVxufVxuIiwgImltcG9ydCB7IGVudmlyb25tZW50LCBDb2xvciB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB0eXBlIHsgSW1hZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5cbmZ1bmN0aW9uIHBvbGFyVG9DYXJ0ZXNpYW4oY2VudGVyWDogbnVtYmVyLCBjZW50ZXJZOiBudW1iZXIsIHJhZGl1czogbnVtYmVyLCBhbmdsZUluRGVncmVlczogbnVtYmVyKSB7XG4gIGNvbnN0IGFuZ2xlSW5SYWRpYW5zID0gKChhbmdsZUluRGVncmVlcyAtIDkwKSAqIE1hdGguUEkpIC8gMTgwLjA7XG5cbiAgcmV0dXJuIHtcbiAgICB4OiBjZW50ZXJYICsgcmFkaXVzICogTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpLFxuICAgIHk6IGNlbnRlclkgKyByYWRpdXMgKiBNYXRoLnNpbihhbmdsZUluUmFkaWFucyksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGRlc2NyaWJlQXJjKHg6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlciwgc3RhcnRBbmdsZTogbnVtYmVyLCBlbmRBbmdsZTogbnVtYmVyKSB7XG4gIGNvbnN0IHN0YXJ0ID0gcG9sYXJUb0NhcnRlc2lhbih4LCB5LCByYWRpdXMsIGVuZEFuZ2xlKTtcbiAgY29uc3QgZW5kID0gcG9sYXJUb0NhcnRlc2lhbih4LCB5LCByYWRpdXMsIHN0YXJ0QW5nbGUpO1xuXG4gIGNvbnN0IGxhcmdlQXJjRmxhZyA9IGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSA8PSAxODAgPyBcIjBcIiA6IFwiMVwiO1xuXG4gIGNvbnN0IGQgPSBbXCJNXCIsIHN0YXJ0LngsIHN0YXJ0LnksIFwiQVwiLCByYWRpdXMsIHJhZGl1cywgMCwgbGFyZ2VBcmNGbGFnLCAwLCBlbmQueCwgZW5kLnldLmpvaW4oXCIgXCIpO1xuXG4gIHJldHVybiBkO1xufVxuXG4vKipcbiAqIEljb24gdG8gcmVwcmVzZW50IHRoZSBwcm9ncmVzcyBvZiBfc29tZXRoaW5nXy5cbiAqXG4gKiBAcGFyYW0gcHJvZ3Jlc3MgTnVtYmVyIGJldHdlZW4gMCBhbmQgMS5cbiAqIEBwYXJhbSBjb2xvciBIZXggY29sb3IgKGRlZmF1bHQgYFwiI0ZGNjM2M1wiYCkgb3IgQ29sb3IuXG4gKlxuICogQHJldHVybnMgYW4gSW1hZ2UgdGhhdCBjYW4gYmUgdXNlZCB3aGVyZSBSYXljYXN0IGV4cGVjdHMgdGhlbS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiA8TGlzdC5JdGVtIGljb249e2dldFByb2dyZXNzSWNvbigwLjEpfSB0aXRsZT1cIlByb2plY3RcIiAvPlxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9ncmVzc0ljb24oXG4gIHByb2dyZXNzOiBudW1iZXIsXG4gIGNvbG9yOiBDb2xvciB8IHN0cmluZyA9IENvbG9yLlJlZCxcbiAgb3B0aW9ucz86IHsgYmFja2dyb3VuZD86IENvbG9yIHwgc3RyaW5nOyBiYWNrZ3JvdW5kT3BhY2l0eT86IG51bWJlciB9LFxuKTogSW1hZ2UuQXNzZXQge1xuICBjb25zdCBiYWNrZ3JvdW5kID0gb3B0aW9ucz8uYmFja2dyb3VuZCB8fCAoZW52aXJvbm1lbnQuYXBwZWFyYW5jZSA9PT0gXCJsaWdodFwiID8gXCJibGFja1wiIDogXCJ3aGl0ZVwiKTtcbiAgY29uc3QgYmFja2dyb3VuZE9wYWNpdHkgPSBvcHRpb25zPy5iYWNrZ3JvdW5kT3BhY2l0eSB8fCAwLjE7XG5cbiAgY29uc3Qgc3Ryb2tlID0gMTA7XG4gIGNvbnN0IHBhZGRpbmcgPSA1O1xuICBjb25zdCByYWRpdXMgPSA1MCAtIHBhZGRpbmcgLSBzdHJva2UgLyAyO1xuXG4gIGNvbnN0IHN2ZyA9IGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjEwMHB4XCIgaGVpZ2h0PVwiMTAwcHhcIj5cbiAgICAgIDxjaXJjbGUgY3g9XCI1MFwiIGN5PVwiNTBcIiByPVwiJHtyYWRpdXN9XCIgc3Ryb2tlLXdpZHRoPVwiJHtzdHJva2V9XCIgc3Ryb2tlPVwiJHtcbiAgICAgICAgcHJvZ3Jlc3MgPCAxID8gYmFja2dyb3VuZCA6IGNvbG9yXG4gICAgICB9XCIgb3BhY2l0eT1cIiR7cHJvZ3Jlc3MgPCAxID8gYmFja2dyb3VuZE9wYWNpdHkgOiBcIjFcIn1cIiBmaWxsPVwibm9uZVwiIC8+XG4gICAgICAke1xuICAgICAgICBwcm9ncmVzcyA+IDAgJiYgcHJvZ3Jlc3MgPCAxXG4gICAgICAgICAgPyBgPHBhdGggZD1cIiR7ZGVzY3JpYmVBcmMoXG4gICAgICAgICAgICAgIDUwLFxuICAgICAgICAgICAgICA1MCxcbiAgICAgICAgICAgICAgcmFkaXVzLFxuICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICBwcm9ncmVzcyAqIDM2MCxcbiAgICAgICAgICAgICl9XCIgc3Ryb2tlPVwiJHtjb2xvcn1cIiBzdHJva2Utd2lkdGg9XCIke3N0cm9rZX1cIiBmaWxsPVwibm9uZVwiIC8+YFxuICAgICAgICAgIDogXCJcIlxuICAgICAgfVxuICAgIDwvc3ZnPlxuICBgLnJlcGxhY2VBbGwoXCJcXG5cIiwgXCJcIik7XG4gIHJldHVybiBgZGF0YTppbWFnZS9zdmcreG1sLCR7ZW5jb2RlVVJJQ29tcG9uZW50KHN2Zyl9YDtcbn1cbiIsICJleHBvcnQgeyBPQXV0aFNlcnZpY2UgfSBmcm9tIFwiLi9PQXV0aFNlcnZpY2VcIjtcbmV4cG9ydCB7IHdpdGhBY2Nlc3NUb2tlbiwgZ2V0QWNjZXNzVG9rZW4gfSBmcm9tIFwiLi93aXRoQWNjZXNzVG9rZW5cIjtcblxuZXhwb3J0IHR5cGUgeyBXaXRoQWNjZXNzVG9rZW5Db21wb25lbnRPckZuIH0gZnJvbSBcIi4vd2l0aEFjY2Vzc1Rva2VuXCI7XG5leHBvcnQgdHlwZSB7XG4gIE9uQXV0aG9yaXplUGFyYW1zLFxuICBPQXV0aFNlcnZpY2VPcHRpb25zLFxuICBQcm92aWRlcldpdGhEZWZhdWx0Q2xpZW50T3B0aW9ucyxcbiAgUHJvdmlkZXJPcHRpb25zLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuIiwgImltcG9ydCB7IENvbG9yLCBPQXV0aCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IFBST1ZJREVSX0NMSUVOVF9JRFMgfSBmcm9tIFwiLi9wcm92aWRlcnNcIjtcbmltcG9ydCB0eXBlIHtcbiAgT0F1dGhTZXJ2aWNlT3B0aW9ucyxcbiAgT25BdXRob3JpemVQYXJhbXMsXG4gIFByb3ZpZGVyT3B0aW9ucyxcbiAgUHJvdmlkZXJXaXRoRGVmYXVsdENsaWVudE9wdGlvbnMsXG59IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogQ2xhc3MgYWxsb3dpbmcgdG8gY3JlYXRlIGFuIE9BdXRoIHNlcnZpY2UgdXNpbmcgdGhlIHRoZSBQS0NFIChQcm9vZiBLZXkgZm9yIENvZGUgRXhjaGFuZ2UpIGZsb3cuXG4gKlxuICogVGhpcyBzZXJ2aWNlIGlzIGNhcGFibGUgb2Ygc3RhcnRpbmcgdGhlIGF1dGhvcml6YXRpb24gcHJvY2VzcywgZmV0Y2hpbmcgYW5kIHJlZnJlc2hpbmcgdG9rZW5zLFxuICogYXMgd2VsbCBhcyBtYW5hZ2luZyB0aGUgYXV0aGVudGljYXRpb24gc3RhdGUuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IG9hdXRoQ2xpZW50ID0gbmV3IE9BdXRoLlBLQ0VDbGllbnQoeyAuLi4gfSk7XG4gKiBjb25zdCBvYXV0aFNlcnZpY2UgPSBuZXcgT0F1dGhTZXJ2aWNlKHtcbiAqICAgY2xpZW50OiBvYXV0aENsaWVudCxcbiAqICAgY2xpZW50SWQ6ICd5b3VyLWNsaWVudC1pZCcsXG4gKiAgIHNjb3BlOiAncmVxdWlyZWQgc2NvcGVzJyxcbiAqICAgYXV0aG9yaXplVXJsOiAnaHR0cHM6Ly9wcm92aWRlci5jb20vb2F1dGgvYXV0aG9yaXplJyxcbiAqICAgdG9rZW5Vcmw6ICdodHRwczovL3Byb3ZpZGVyLmNvbS9vYXV0aC90b2tlbicsXG4gKiAgIHJlZnJlc2hUb2tlblVybDogJ2h0dHBzOi8vcHJvdmlkZXIuY29tL29hdXRoL3Rva2VuJyxcbiAqICAgZXh0cmFQYXJhbWV0ZXJzOiB7ICdhZGRpdGlvbmFsX3BhcmFtJzogJ3ZhbHVlJyB9XG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgT0F1dGhTZXJ2aWNlIGltcGxlbWVudHMgT0F1dGhTZXJ2aWNlT3B0aW9ucyB7XG4gIHB1YmxpYyBjbGllbnRJZDogc3RyaW5nO1xuICBwdWJsaWMgc2NvcGU6IHN0cmluZztcbiAgcHVibGljIGNsaWVudDogT0F1dGguUEtDRUNsaWVudDtcbiAgcHVibGljIGV4dHJhUGFyYW1ldGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIHB1YmxpYyBhdXRob3JpemVVcmw6IHN0cmluZztcbiAgcHVibGljIHRva2VuVXJsOiBzdHJpbmc7XG4gIHB1YmxpYyByZWZyZXNoVG9rZW5Vcmw/OiBzdHJpbmc7XG4gIHB1YmxpYyBib2R5RW5jb2Rpbmc/OiBcImpzb25cIiB8IFwidXJsLWVuY29kZWRcIjtcbiAgcHVibGljIHBlcnNvbmFsQWNjZXNzVG9rZW4/OiBzdHJpbmc7XG4gIG9uQXV0aG9yaXplPzogKHBhcmFtczogT25BdXRob3JpemVQYXJhbXMpID0+IHZvaWQ7XG4gIHRva2VuUmVzcG9uc2VQYXJzZXI6IChyZXNwb25zZTogdW5rbm93bikgPT4gT0F1dGguVG9rZW5SZXNwb25zZTtcbiAgdG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXI6IChyZXNwb25zZTogdW5rbm93bikgPT4gT0F1dGguVG9rZW5SZXNwb25zZTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBPQXV0aFNlcnZpY2VPcHRpb25zKSB7XG4gICAgdGhpcy5jbGllbnRJZCA9IG9wdGlvbnMuY2xpZW50SWQ7XG4gICAgdGhpcy5zY29wZSA9IEFycmF5LmlzQXJyYXkob3B0aW9ucy5zY29wZSkgPyBvcHRpb25zLnNjb3BlLmpvaW4oXCIgXCIpIDogb3B0aW9ucy5zY29wZTtcbiAgICB0aGlzLnBlcnNvbmFsQWNjZXNzVG9rZW4gPSBvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW47XG4gICAgdGhpcy5ib2R5RW5jb2RpbmcgPSBvcHRpb25zLmJvZHlFbmNvZGluZztcbiAgICB0aGlzLmNsaWVudCA9IG9wdGlvbnMuY2xpZW50O1xuICAgIHRoaXMuZXh0cmFQYXJhbWV0ZXJzID0gb3B0aW9ucy5leHRyYVBhcmFtZXRlcnM7XG4gICAgdGhpcy5hdXRob3JpemVVcmwgPSBvcHRpb25zLmF1dGhvcml6ZVVybDtcbiAgICB0aGlzLnRva2VuVXJsID0gb3B0aW9ucy50b2tlblVybDtcbiAgICB0aGlzLnJlZnJlc2hUb2tlblVybCA9IG9wdGlvbnMucmVmcmVzaFRva2VuVXJsO1xuICAgIHRoaXMub25BdXRob3JpemUgPSBvcHRpb25zLm9uQXV0aG9yaXplO1xuICAgIHRoaXMudG9rZW5SZXNwb25zZVBhcnNlciA9IG9wdGlvbnMudG9rZW5SZXNwb25zZVBhcnNlciA/PyAoKHgpID0+IHggYXMgT0F1dGguVG9rZW5SZXNwb25zZSk7XG4gICAgdGhpcy50b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlciA9IG9wdGlvbnMudG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXIgPz8gKCh4KSA9PiB4IGFzIE9BdXRoLlRva2VuUmVzcG9uc2UpO1xuICAgIHRoaXMuYXV0aG9yaXplID0gdGhpcy5hdXRob3JpemUuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc2FuYSBPQXV0aCBzZXJ2aWNlIHByb3ZpZGVkIG91dCBvZiB0aGUgYm94LlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IGFzYW5hID0gT0F1dGhTZXJ2aWNlLmFzYW5hKHsgc2NvcGU6ICdkZWZhdWx0JyB9KVxuICAgKiBgYGBcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgYXNhbmEob3B0aW9uczogUHJvdmlkZXJXaXRoRGVmYXVsdENsaWVudE9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IE9BdXRoU2VydmljZSh7XG4gICAgICBjbGllbnQ6IG5ldyBPQXV0aC5QS0NFQ2xpZW50KHtcbiAgICAgICAgcmVkaXJlY3RNZXRob2Q6IE9BdXRoLlJlZGlyZWN0TWV0aG9kLldlYixcbiAgICAgICAgcHJvdmlkZXJOYW1lOiBcIkFzYW5hXCIsXG4gICAgICAgIHByb3ZpZGVySWNvbjogYGRhdGE6aW1hZ2Uvc3ZnK3htbCwke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIyNTFcIiBoZWlnaHQ9XCIyMzJcIiBmaWxsPVwibm9uZVwiPjxwYXRoIGZpbGw9XCIjRjA2QTZBXCIgZD1cIk0xNzkuMzgzIDU0LjM3M2MwIDMwLjAxNy0yNC4zMzcgNTQuMzc0LTU0LjM1NCA1NC4zNzQtMzAuMDM1IDAtNTQuMzczLTI0LjMzOC01NC4zNzMtNTQuMzc0QzcwLjY1NiAyNC4zMzggOTQuOTkzIDAgMTI1LjAyOSAwYzMwLjAxNyAwIDU0LjM1NCAyNC4zMzggNTQuMzU0IDU0LjM3M1pNNTQuMzkzIDEyMi4zM0MyNC4zNzYgMTIyLjMzLjAyIDE0Ni42NjguMDIgMTc2LjY4NWMwIDMwLjAxNyAyNC4zMzcgNTQuMzczIDU0LjM3MyA1NC4zNzMgMzAuMDM1IDAgNTQuMzczLTI0LjMzOCA1NC4zNzMtNTQuMzczIDAtMzAuMDE3LTI0LjMzOC01NC4zNTUtNTQuMzczLTU0LjM1NVptMTQxLjI1MyAwYy0zMC4wMzUgMC01NC4zNzMgMjQuMzM4LTU0LjM3MyA1NC4zNzQgMCAzMC4wMzUgMjQuMzM4IDU0LjM3MyA1NC4zNzMgNTQuMzczIDMwLjAxNyAwIDU0LjM3NC0yNC4zMzggNTQuMzc0LTU0LjM3MyAwLTMwLjAzNi0yNC4zMzgtNTQuMzc0LTU0LjM3NC01NC4zNzRaXCIvPjwvc3ZnPmAsXG4gICAgICAgICl9YCxcbiAgICAgICAgcHJvdmlkZXJJZDogXCJhc2FuYVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJDb25uZWN0IHlvdXIgQXNhbmEgYWNjb3VudFwiLFxuICAgICAgfSksXG4gICAgICBjbGllbnRJZDogb3B0aW9ucy5jbGllbnRJZCA/PyBQUk9WSURFUl9DTElFTlRfSURTLmFzYW5hLFxuICAgICAgYXV0aG9yaXplVXJsOiBvcHRpb25zLmF1dGhvcml6ZVVybCA/PyBcImh0dHBzOi8vYXNhbmEub2F1dGgucmF5Y2FzdC5jb20vYXV0aG9yaXplXCIsXG4gICAgICB0b2tlblVybDogb3B0aW9ucy50b2tlblVybCA/PyBcImh0dHBzOi8vYXNhbmEub2F1dGgucmF5Y2FzdC5jb20vdG9rZW5cIixcbiAgICAgIHJlZnJlc2hUb2tlblVybDogb3B0aW9ucy5yZWZyZXNoVG9rZW5VcmwgPz8gXCJodHRwczovL2FzYW5hLm9hdXRoLnJheWNhc3QuY29tL3JlZnJlc2gtdG9rZW5cIixcbiAgICAgIHNjb3BlOiBvcHRpb25zLnNjb3BlLFxuICAgICAgcGVyc29uYWxBY2Nlc3NUb2tlbjogb3B0aW9ucy5wZXJzb25hbEFjY2Vzc1Rva2VuLFxuICAgICAgb25BdXRob3JpemU6IG9wdGlvbnMub25BdXRob3JpemUsXG4gICAgICBib2R5RW5jb2Rpbmc6IG9wdGlvbnMuYm9keUVuY29kaW5nLFxuICAgICAgdG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXIsXG4gICAgICB0b2tlblJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVzcG9uc2VQYXJzZXIsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2l0SHViIE9BdXRoIHNlcnZpY2UgcHJvdmlkZWQgb3V0IG9mIHRoZSBib3guXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgZ2l0aHViID0gT0F1dGhTZXJ2aWNlLmdpdGh1Yih7IHNjb3BlOiAncmVwbyB1c2VyJyB9KVxuICAgKiBgYGBcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2l0aHViKG9wdGlvbnM6IFByb3ZpZGVyV2l0aERlZmF1bHRDbGllbnRPcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBPQXV0aFNlcnZpY2Uoe1xuICAgICAgY2xpZW50OiBuZXcgT0F1dGguUEtDRUNsaWVudCh7XG4gICAgICAgIHJlZGlyZWN0TWV0aG9kOiBPQXV0aC5SZWRpcmVjdE1ldGhvZC5XZWIsXG4gICAgICAgIHByb3ZpZGVyTmFtZTogXCJHaXRIdWJcIixcbiAgICAgICAgcHJvdmlkZXJJY29uOiB7XG4gICAgICAgICAgc291cmNlOiBgZGF0YTppbWFnZS9zdmcreG1sLCR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiNjRcIiBoZWlnaHQ9XCI2NFwiIHZpZXdCb3g9XCIwIDAgMTYgMTZcIj48cGF0aCBmaWxsLXJ1bGU9XCJldmVub2RkXCIgZD1cIk04IDBDMy41OCAwIDAgMy41OCAwIDhjMCAzLjU0IDIuMjkgNi41MyA1LjQ3IDcuNTkuNC4wNy41NS0uMTcuNTUtLjM4IDAtLjE5LS4wMS0uODItLjAxLTEuNDktMi4wMS4zNy0yLjUzLS40OS0yLjY5LS45NC0uMDktLjIzLS40OC0uOTQtLjgyLTEuMTMtLjI4LS4xNS0uNjgtLjUyLS4wMS0uNTMuNjMtLjAxIDEuMDguNTggMS4yMy44Mi43MiAxLjIxIDEuODcuODcgMi4zMy42Ni4wNy0uNTIuMjgtLjg3LjUxLTEuMDctMS43OC0uMi0zLjY0LS44OS0zLjY0LTMuOTUgMC0uODcuMzEtMS41OS44Mi0yLjE1LS4wOC0uMi0uMzYtMS4wMi4wOC0yLjEyIDAgMCAuNjctLjIxIDIuMi44Mi42NC0uMTggMS4zMi0uMjcgMi0uMjcuNjggMCAxLjM2LjA5IDIgLjI3IDEuNTMtMS4wNCAyLjItLjgyIDIuMi0uODIuNDQgMS4xLjE2IDEuOTIuMDggMi4xMi41MS41Ni44MiAxLjI3LjgyIDIuMTUgMCAzLjA3LTEuODcgMy43NS0zLjY1IDMuOTUuMjkuMjUuNTQuNzMuNTQgMS40OCAwIDEuMDctLjAxIDEuOTMtLjAxIDIuMiAwIC4yMS4xNS40Ni41NS4zOEE4LjAxMyA4LjAxMyAwIDAgMCAxNiA4YzAtNC40Mi0zLjU4LTgtOC04elwiLz48L3N2Zz5gLFxuICAgICAgICAgICl9YCxcblxuICAgICAgICAgIHRpbnRDb2xvcjogQ29sb3IuUHJpbWFyeVRleHQsXG4gICAgICAgIH0sXG4gICAgICAgIHByb3ZpZGVySWQ6IFwiZ2l0aHViXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbm5lY3QgeW91ciBHaXRIdWIgYWNjb3VudFwiLFxuICAgICAgfSksXG4gICAgICBjbGllbnRJZDogb3B0aW9ucy5jbGllbnRJZCA/PyBQUk9WSURFUl9DTElFTlRfSURTLmdpdGh1YixcbiAgICAgIGF1dGhvcml6ZVVybDogb3B0aW9ucy5hdXRob3JpemVVcmwgPz8gXCJodHRwczovL2dpdGh1Yi5vYXV0aC5yYXljYXN0LmNvbS9hdXRob3JpemVcIixcbiAgICAgIHRva2VuVXJsOiBvcHRpb25zLnRva2VuVXJsID8/IFwiaHR0cHM6Ly9naXRodWIub2F1dGgucmF5Y2FzdC5jb20vdG9rZW5cIixcbiAgICAgIHJlZnJlc2hUb2tlblVybDogb3B0aW9ucy5yZWZyZXNoVG9rZW5VcmwgPz8gXCJodHRwczovL2dpdGh1Yi5vYXV0aC5yYXljYXN0LmNvbS9yZWZyZXNoLXRva2VuXCIsXG4gICAgICBzY29wZTogb3B0aW9ucy5zY29wZSxcbiAgICAgIHBlcnNvbmFsQWNjZXNzVG9rZW46IG9wdGlvbnMucGVyc29uYWxBY2Nlc3NUb2tlbixcbiAgICAgIG9uQXV0aG9yaXplOiBvcHRpb25zLm9uQXV0aG9yaXplLFxuICAgICAgYm9keUVuY29kaW5nOiBvcHRpb25zLmJvZHlFbmNvZGluZyxcbiAgICAgIHRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyLFxuICAgICAgdG9rZW5SZXNwb25zZVBhcnNlcjogb3B0aW9ucy50b2tlblJlc3BvbnNlUGFyc2VyLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdvb2dsZSBPQXV0aCBzZXJ2aWNlIHByb3ZpZGVkIG91dCBvZiB0aGUgYm94LlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IGdvb2dsZSA9IE9BdXRoU2VydmljZS5nb29nbGUoe1xuICAgKiAgIGNsaWVudElkOiAnY3VzdG9tLWNsaWVudC1pZCcsXG4gICAqICAgYXV0aG9yaXplVXJsOiAnaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL3YyL2F1dGgnLFxuICAgKiAgIHRva2VuVXJsOiAnaHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4nLFxuICAgKiAgIHNjb3BlOiAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5yZWFkb25seScsXG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ29vZ2xlKG9wdGlvbnM6IFByb3ZpZGVyT3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgT0F1dGhTZXJ2aWNlKHtcbiAgICAgIGNsaWVudDogbmV3IE9BdXRoLlBLQ0VDbGllbnQoe1xuICAgICAgICByZWRpcmVjdE1ldGhvZDogT0F1dGguUmVkaXJlY3RNZXRob2QuQXBwVVJJLFxuICAgICAgICBwcm92aWRlck5hbWU6IFwiR29vZ2xlXCIsXG4gICAgICAgIHByb3ZpZGVySWNvbjogYGRhdGE6aW1hZ2Uvc3ZnK3htbCwke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgc3R5bGU9XCJkaXNwbGF5OmJsb2NrXCIgdmlld0JveD1cIjAgMCA0OCA0OFwiPjxwYXRoIGZpbGw9XCIjRUE0MzM1XCIgZD1cIk0yNCA5LjVjMy41NCAwIDYuNzEgMS4yMiA5LjIxIDMuNmw2Ljg1LTYuODVDMzUuOSAyLjM4IDMwLjQ3IDAgMjQgMCAxNC42MiAwIDYuNTEgNS4zOCAyLjU2IDEzLjIybDcuOTggNi4xOUMxMi40MyAxMy43MiAxNy43NCA5LjUgMjQgOS41elwiLz48cGF0aCBmaWxsPVwiIzQyODVGNFwiIGQ9XCJNNDYuOTggMjQuNTVjMC0xLjU3LS4xNS0zLjA5LS4zOC00LjU1SDI0djkuMDJoMTIuOTRjLS41OCAyLjk2LTIuMjYgNS40OC00Ljc4IDcuMThsNy43MyA2YzQuNTEtNC4xOCA3LjA5LTEwLjM2IDcuMDktMTcuNjV6XCIvPjxwYXRoIGZpbGw9XCIjRkJCQzA1XCIgZD1cIk0xMC41MyAyOC41OWMtLjQ4LTEuNDUtLjc2LTIuOTktLjc2LTQuNTlzLjI3LTMuMTQuNzYtNC41OWwtNy45OC02LjE5Qy45MiAxNi40NiAwIDIwLjEyIDAgMjRjMCAzLjg4LjkyIDcuNTQgMi41NiAxMC43OGw3Ljk3LTYuMTl6XCIvPjxwYXRoIGZpbGw9XCIjMzRBODUzXCIgZD1cIk0yNCA0OGM2LjQ4IDAgMTEuOTMtMi4xMyAxNS44OS01LjgxbC03LjczLTZjLTIuMTUgMS40NS00LjkyIDIuMy04LjE2IDIuMy02LjI2IDAtMTEuNTctNC4yMi0xMy40Ny05LjkxbC03Ljk4IDYuMTlDNi41MSA0Mi42MiAxNC42MiA0OCAyNCA0OHpcIi8+PHBhdGggZmlsbD1cIm5vbmVcIiBkPVwiTTAgMGg0OHY0OEgwelwiLz48L3N2Zz5gLFxuICAgICAgICApfWAsXG4gICAgICAgIHByb3ZpZGVySWQ6IFwiZ29vZ2xlXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbm5lY3QgeW91ciBHb29nbGUgYWNjb3VudFwiLFxuICAgICAgfSksXG4gICAgICBjbGllbnRJZDogb3B0aW9ucy5jbGllbnRJZCxcbiAgICAgIGF1dGhvcml6ZVVybDogb3B0aW9ucy5hdXRob3JpemVVcmwgPz8gXCJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvdjIvYXV0aFwiLFxuICAgICAgdG9rZW5Vcmw6IG9wdGlvbnMudG9rZW5VcmwgPz8gXCJodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlblwiLFxuICAgICAgcmVmcmVzaFRva2VuVXJsOiBvcHRpb25zLnRva2VuVXJsLFxuICAgICAgc2NvcGU6IG9wdGlvbnMuc2NvcGUsXG4gICAgICBwZXJzb25hbEFjY2Vzc1Rva2VuOiBvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW4sXG4gICAgICBib2R5RW5jb2Rpbmc6IG9wdGlvbnMuYm9keUVuY29kaW5nID8/IFwidXJsLWVuY29kZWRcIixcbiAgICAgIG9uQXV0aG9yaXplOiBvcHRpb25zLm9uQXV0aG9yaXplLFxuICAgICAgdG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXIsXG4gICAgICB0b2tlblJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVzcG9uc2VQYXJzZXIsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSmlyYSBPQXV0aCBzZXJ2aWNlIHByb3ZpZGVkIG91dCBvZiB0aGUgYm94LlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IGppcmEgPSBPQXV0aFNlcnZpY2UuamlyYSh7XG4gICAqICAgY2xpZW50SWQ6ICdjdXN0b20tY2xpZW50LWlkJyxcbiAgICogICBhdXRob3JpemVVcmw6ICdodHRwczovL2F1dGguYXRsYXNzaWFuLmNvbS9hdXRob3JpemUnLFxuICAgKiAgIHRva2VuVXJsOiAnaHR0cHM6Ly9hcGkuYXRsYXNzaWFuLmNvbS9vYXV0aC90b2tlbicsXG4gICAqICAgc2NvcGU6ICdyZWFkOmppcmEtdXNlciByZWFkOmppcmEtd29yayBvZmZsaW5lX2FjY2VzcydcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBqaXJhKG9wdGlvbnM6IFByb3ZpZGVyT3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgT0F1dGhTZXJ2aWNlKHtcbiAgICAgIGNsaWVudDogbmV3IE9BdXRoLlBLQ0VDbGllbnQoe1xuICAgICAgICByZWRpcmVjdE1ldGhvZDogT0F1dGguUmVkaXJlY3RNZXRob2QuV2ViLFxuICAgICAgICBwcm92aWRlck5hbWU6IFwiSmlyYVwiLFxuICAgICAgICBwcm92aWRlckljb246IGBkYXRhOmltYWdlL3N2Zyt4bWwsJHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHdpZHRoPVwiMjM2MVwiIGhlaWdodD1cIjI1MDBcIiB2aWV3Qm94PVwiMi41OSAwIDIxNC4wOTEgMjI0XCI+PGxpbmVhckdyYWRpZW50IGlkPVwiYVwiIHgxPVwiMTAyLjRcIiB4Mj1cIjU2LjE1XCIgeTE9XCIyMTguNjNcIiB5Mj1cIjE3Mi4zOVwiIGdyYWRpZW50VHJhbnNmb3JtPVwibWF0cml4KDEgMCAwIC0xIDAgMjY0KVwiIGdyYWRpZW50VW5pdHM9XCJ1c2VyU3BhY2VPblVzZVwiPjxzdG9wIG9mZnNldD1cIi4xOFwiIHN0b3AtY29sb3I9XCIjMDA1MmNjXCIvPjxzdG9wIG9mZnNldD1cIjFcIiBzdG9wLWNvbG9yPVwiIzI2ODRmZlwiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCB4bGluazpocmVmPVwiI2FcIiBpZD1cImJcIiB4MT1cIjExNC42NVwiIHgyPVwiMTYwLjgxXCIgeTE9XCI4NS43N1wiIHkyPVwiMTMxLjkyXCIvPjxwYXRoIGZpbGw9XCIjMjY4NGZmXCIgZD1cIk0yMTQuMDYgMTA1LjczIDExNy42NyA5LjM0IDEwOC4zMyAwIDM1Ljc3IDcyLjU2IDIuNTkgMTA1LjczYTguODkgOC44OSAwIDAgMCAwIDEyLjU0bDY2LjI5IDY2LjI5TDEwOC4zMyAyMjRsNzIuNTUtNzIuNTYgMS4xMy0xLjEyIDMyLjA1LTMyYTguODcgOC44NyAwIDAgMCAwLTEyLjU5em0tMTA1LjczIDM5LjM5TDc1LjIxIDExMmwzMy4xMi0zMy4xMkwxNDEuNDQgMTEyelwiLz48cGF0aCBmaWxsPVwidXJsKCNhKVwiIGQ9XCJNMTA4LjMzIDc4Ljg4YTU1Ljc1IDU1Ljc1IDAgMCAxLS4yNC03OC42MUwzNS42MiA3Mi43MWwzOS40NCAzOS40NHpcIi8+PHBhdGggZmlsbD1cInVybCgjYilcIiBkPVwibTE0MS41MyAxMTEuOTEtMzMuMiAzMy4yMWE1NS43NyA1NS43NyAwIDAgMSAwIDc4Ljg2TDE4MSAxNTEuMzV6XCIvPjwvc3ZnPmAsXG4gICAgICAgICl9YCxcbiAgICAgICAgcHJvdmlkZXJJZDogXCJqaXJhXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbm5lY3QgeW91ciBKaXJhIGFjY291bnRcIixcbiAgICAgIH0pLFxuICAgICAgY2xpZW50SWQ6IG9wdGlvbnMuY2xpZW50SWQsXG4gICAgICBhdXRob3JpemVVcmw6IG9wdGlvbnMuYXV0aG9yaXplVXJsID8/IFwiaHR0cHM6Ly9hdXRoLmF0bGFzc2lhbi5jb20vYXV0aG9yaXplXCIsXG4gICAgICB0b2tlblVybDogb3B0aW9ucy50b2tlblVybCA/PyBcImh0dHBzOi8vYXV0aC5hdGxhc3NpYW4uY29tL29hdXRoL3Rva2VuXCIsXG4gICAgICByZWZyZXNoVG9rZW5Vcmw6IG9wdGlvbnMucmVmcmVzaFRva2VuVXJsLFxuICAgICAgc2NvcGU6IG9wdGlvbnMuc2NvcGUsXG4gICAgICBwZXJzb25hbEFjY2Vzc1Rva2VuOiBvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW4sXG4gICAgICBvbkF1dGhvcml6ZTogb3B0aW9ucy5vbkF1dGhvcml6ZSxcbiAgICAgIGJvZHlFbmNvZGluZzogb3B0aW9ucy5ib2R5RW5jb2RpbmcsXG4gICAgICB0b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcjogb3B0aW9ucy50b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcixcbiAgICAgIHRva2VuUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZXNwb25zZVBhcnNlcixcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMaW5lYXIgT0F1dGggc2VydmljZSBwcm92aWRlZCBvdXQgb2YgdGhlIGJveC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBsaW5lYXIgPSBPQXV0aFNlcnZpY2UubGluZWFyKHsgc2NvcGU6ICdyZWFkIHdyaXRlJyB9KVxuICAgKiBgYGBcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbGluZWFyKG9wdGlvbnM6IFByb3ZpZGVyV2l0aERlZmF1bHRDbGllbnRPcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBPQXV0aFNlcnZpY2Uoe1xuICAgICAgY2xpZW50OiBuZXcgT0F1dGguUEtDRUNsaWVudCh7XG4gICAgICAgIHJlZGlyZWN0TWV0aG9kOiBPQXV0aC5SZWRpcmVjdE1ldGhvZC5XZWIsXG4gICAgICAgIHByb3ZpZGVyTmFtZTogXCJMaW5lYXJcIixcbiAgICAgICAgcHJvdmlkZXJJY29uOiB7XG4gICAgICAgICAgc291cmNlOiB7XG4gICAgICAgICAgICBsaWdodDogYGRhdGE6aW1hZ2Uvc3ZnK3htbCwke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICAgICAgYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGZpbGw9XCIjMjIyMzI2XCIgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDEwMCAxMDBcIj48cGF0aCBkPVwiTTEuMjI1NDEgNjEuNTIyOGMtLjIyMjUtLjk0ODUuOTA3NDgtMS41NDU5IDEuNTk2MzgtLjg1N0wzOS4zMzQyIDk3LjE3ODJjLjY4ODkuNjg4OS4wOTE1IDEuODE4OS0uODU3IDEuNTk2NEMyMC4wNTE1IDk0LjQ1MjIgNS41NDc3OSA3OS45NDg1IDEuMjI1NDEgNjEuNTIyOFpNLjAwMTg5MTM1IDQ2Ljg4OTFjLS4wMTc2NDM3NS4yODMzLjA4ODg3MjE1LjU1OTkuMjg5NTcxNjUuNzYwNkw1Mi4zNTAzIDk5LjcwODVjLjIwMDcuMjAwNy40NzczLjMwNzUuNzYwNi4yODk2IDIuMzY5Mi0uMTQ3NiA0LjY5MzgtLjQ2IDYuOTYyNC0uOTI1OS43NjQ1LS4xNTcgMS4wMzAxLTEuMDk2My40NzgyLTEuNjQ4MUwyLjU3NTk1IDM5LjQ0ODVjLS41NTE4Ni0uNTUxOS0xLjQ5MTE3LS4yODYzLTEuNjQ4MTc0LjQ3ODItLjQ2NTkxNSAyLjI2ODYtLjc3ODMyIDQuNTkzMi0uOTI1ODg0NjUgNi45NjI0Wk00LjIxMDkzIDI5LjcwNTRjLS4xNjY0OS4zNzM4LS4wODE2OS44MTA2LjIwNzY1IDEuMWw2NC43NzYwMiA2NC43NzZjLjI4OTQuMjg5NC43MjYyLjM3NDIgMS4xLjIwNzcgMS43ODYxLS43OTU2IDMuNTE3MS0xLjY5MjcgNS4xODU1LTIuNjg0LjU1MjEtLjMyOC42MzczLTEuMDg2Ny4xODMyLTEuNTQwN0w4LjQzNTY2IDI0LjMzNjdjLS40NTQwOS0uNDU0MS0xLjIxMjcxLS4zNjg5LTEuNTQwNzQuMTgzMi0uOTkxMzIgMS42Njg0LTEuODg4NDMgMy4zOTk0LTIuNjgzOTkgNS4xODU1Wk0xMi42NTg3IDE4LjA3NGMtLjM3MDEtLjM3MDEtLjM5My0uOTYzNy0uMDQ0My0xLjM1NDFDMjEuNzc5NSA2LjQ1OTMxIDM1LjExMTQgMCA0OS45NTE5IDAgNzcuNTkyNyAwIDEwMCAyMi40MDczIDEwMCA1MC4wNDgxYzAgMTQuODQwNS02LjQ1OTMgMjguMTcyNC0xNi43MTk5IDM3LjMzNzUtLjM5MDMuMzQ4Ny0uOTg0LjMyNTgtMS4zNTQyLS4wNDQzTDEyLjY1ODcgMTguMDc0WlwiLz48L3N2Zz5gLFxuICAgICAgICAgICAgKX1gLFxuICAgICAgICAgICAgZGFyazogYGRhdGE6aW1hZ2Uvc3ZnK3htbCwke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICAgICAgYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGZpbGw9XCIjZmZmXCIgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIyMDBcIiB2aWV3Qm94PVwiMCAwIDEwMCAxMDBcIj48cGF0aCBkPVwiTTEuMjI1NDEgNjEuNTIyOGMtLjIyMjUtLjk0ODUuOTA3NDgtMS41NDU5IDEuNTk2MzgtLjg1N0wzOS4zMzQyIDk3LjE3ODJjLjY4ODkuNjg4OS4wOTE1IDEuODE4OS0uODU3IDEuNTk2NEMyMC4wNTE1IDk0LjQ1MjIgNS41NDc3OSA3OS45NDg1IDEuMjI1NDEgNjEuNTIyOFpNLjAwMTg5MTM1IDQ2Ljg4OTFjLS4wMTc2NDM3NS4yODMzLjA4ODg3MjE1LjU1OTkuMjg5NTcxNjUuNzYwNkw1Mi4zNTAzIDk5LjcwODVjLjIwMDcuMjAwNy40NzczLjMwNzUuNzYwNi4yODk2IDIuMzY5Mi0uMTQ3NiA0LjY5MzgtLjQ2IDYuOTYyNC0uOTI1OS43NjQ1LS4xNTcgMS4wMzAxLTEuMDk2My40NzgyLTEuNjQ4MUwyLjU3NTk1IDM5LjQ0ODVjLS41NTE4Ni0uNTUxOS0xLjQ5MTE3LS4yODYzLTEuNjQ4MTc0LjQ3ODItLjQ2NTkxNSAyLjI2ODYtLjc3ODMyIDQuNTkzMi0uOTI1ODg0NjUgNi45NjI0Wk00LjIxMDkzIDI5LjcwNTRjLS4xNjY0OS4zNzM4LS4wODE2OS44MTA2LjIwNzY1IDEuMWw2NC43NzYwMiA2NC43NzZjLjI4OTQuMjg5NC43MjYyLjM3NDIgMS4xLjIwNzcgMS43ODYxLS43OTU2IDMuNTE3MS0xLjY5MjcgNS4xODU1LTIuNjg0LjU1MjEtLjMyOC42MzczLTEuMDg2Ny4xODMyLTEuNTQwN0w4LjQzNTY2IDI0LjMzNjdjLS40NTQwOS0uNDU0MS0xLjIxMjcxLS4zNjg5LTEuNTQwNzQuMTgzMi0uOTkxMzIgMS42Njg0LTEuODg4NDMgMy4zOTk0LTIuNjgzOTkgNS4xODU1Wk0xMi42NTg3IDE4LjA3NGMtLjM3MDEtLjM3MDEtLjM5My0uOTYzNy0uMDQ0My0xLjM1NDFDMjEuNzc5NSA2LjQ1OTMxIDM1LjExMTQgMCA0OS45NTE5IDAgNzcuNTkyNyAwIDEwMCAyMi40MDczIDEwMCA1MC4wNDgxYzAgMTQuODQwNS02LjQ1OTMgMjguMTcyNC0xNi43MTk5IDM3LjMzNzUtLjM5MDMuMzQ4Ny0uOTg0LjMyNTgtMS4zNTQyLS4wNDQzTDEyLjY1ODcgMTguMDc0WlwiIC8+PC9zdmc+YCxcbiAgICAgICAgICAgICl9YCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBwcm92aWRlcklkOiBcImxpbmVhclwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJDb25uZWN0IHlvdXIgTGluZWFyIGFjY291bnRcIixcbiAgICAgIH0pLFxuICAgICAgY2xpZW50SWQ6IG9wdGlvbnMuY2xpZW50SWQgPz8gUFJPVklERVJfQ0xJRU5UX0lEUy5saW5lYXIsXG4gICAgICBhdXRob3JpemVVcmw6IG9wdGlvbnMuYXV0aG9yaXplVXJsID8/IFwiaHR0cHM6Ly9saW5lYXIub2F1dGgucmF5Y2FzdC5jb20vYXV0aG9yaXplXCIsXG4gICAgICB0b2tlblVybDogb3B0aW9ucy50b2tlblVybCA/PyBcImh0dHBzOi8vbGluZWFyLm9hdXRoLnJheWNhc3QuY29tL3Rva2VuXCIsXG4gICAgICByZWZyZXNoVG9rZW5Vcmw6IG9wdGlvbnMucmVmcmVzaFRva2VuVXJsID8/IFwiaHR0cHM6Ly9saW5lYXIub2F1dGgucmF5Y2FzdC5jb20vcmVmcmVzaC10b2tlblwiLFxuICAgICAgc2NvcGU6IG9wdGlvbnMuc2NvcGUsXG4gICAgICBleHRyYVBhcmFtZXRlcnM6IHtcbiAgICAgICAgYWN0b3I6IFwidXNlclwiLFxuICAgICAgfSxcbiAgICAgIG9uQXV0aG9yaXplOiBvcHRpb25zLm9uQXV0aG9yaXplLFxuICAgICAgYm9keUVuY29kaW5nOiBvcHRpb25zLmJvZHlFbmNvZGluZyxcbiAgICAgIHRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyLFxuICAgICAgdG9rZW5SZXNwb25zZVBhcnNlcjogb3B0aW9ucy50b2tlblJlc3BvbnNlUGFyc2VyLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNsYWNrIE9BdXRoIHNlcnZpY2UgcHJvdmlkZWQgb3V0IG9mIHRoZSBib3guXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3Qgc2xhY2sgPSBPQXV0aFNlcnZpY2Uuc2xhY2soeyBzY29wZTogJ2Vtb2ppOnJlYWQnIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzbGFjayhvcHRpb25zOiBQcm92aWRlcldpdGhEZWZhdWx0Q2xpZW50T3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgT0F1dGhTZXJ2aWNlKHtcbiAgICAgIGNsaWVudDogbmV3IE9BdXRoLlBLQ0VDbGllbnQoe1xuICAgICAgICByZWRpcmVjdE1ldGhvZDogT0F1dGguUmVkaXJlY3RNZXRob2QuV2ViLFxuICAgICAgICBwcm92aWRlck5hbWU6IFwiU2xhY2tcIixcbiAgICAgICAgcHJvdmlkZXJJY29uOiBgZGF0YTppbWFnZS9zdmcreG1sLCR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgIGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiNzMgNzMgMTI0IDEyNFwiPjxzdHlsZT4uc3Qwe2ZpbGw6I2UwMWU1YX0uc3Qxe2ZpbGw6IzM2YzVmMH0uc3Qye2ZpbGw6IzJlYjY3ZH0uc3Qze2ZpbGw6I2VjYjIyZX08L3N0eWxlPjxwYXRoIGQ9XCJNOTkuNCAxNTEuMmMwIDcuMS01LjggMTIuOS0xMi45IDEyLjktNy4xIDAtMTIuOS01LjgtMTIuOS0xMi45IDAtNy4xIDUuOC0xMi45IDEyLjktMTIuOWgxMi45djEyLjl6TTEwNS45IDE1MS4yYzAtNy4xIDUuOC0xMi45IDEyLjktMTIuOXMxMi45IDUuOCAxMi45IDEyLjl2MzIuM2MwIDcuMS01LjggMTIuOS0xMi45IDEyLjlzLTEyLjktNS44LTEyLjktMTIuOXYtMzIuM3pcIiBjbGFzcz1cInN0MFwiLz48cGF0aCBkPVwiTTExOC44IDk5LjRjLTcuMSAwLTEyLjktNS44LTEyLjktMTIuOSAwLTcuMSA1LjgtMTIuOSAxMi45LTEyLjlzMTIuOSA1LjggMTIuOSAxMi45djEyLjloLTEyLjl6TTExOC44IDEwNS45YzcuMSAwIDEyLjkgNS44IDEyLjkgMTIuOXMtNS44IDEyLjktMTIuOSAxMi45SDg2LjVjLTcuMSAwLTEyLjktNS44LTEyLjktMTIuOXM1LjgtMTIuOSAxMi45LTEyLjloMzIuM3pcIiBjbGFzcz1cInN0MVwiLz48cGF0aCBkPVwiTTE3MC42IDExOC44YzAtNy4xIDUuOC0xMi45IDEyLjktMTIuOSA3LjEgMCAxMi45IDUuOCAxMi45IDEyLjlzLTUuOCAxMi45LTEyLjkgMTIuOWgtMTIuOXYtMTIuOXpNMTY0LjEgMTE4LjhjMCA3LjEtNS44IDEyLjktMTIuOSAxMi45LTcuMSAwLTEyLjktNS44LTEyLjktMTIuOVY4Ni41YzAtNy4xIDUuOC0xMi45IDEyLjktMTIuOSA3LjEgMCAxMi45IDUuOCAxMi45IDEyLjl2MzIuM3pcIiBjbGFzcz1cInN0MlwiLz48cGF0aCBkPVwiTTE1MS4yIDE3MC42YzcuMSAwIDEyLjkgNS44IDEyLjkgMTIuOSAwIDcuMS01LjggMTIuOS0xMi45IDEyLjktNy4xIDAtMTIuOS01LjgtMTIuOS0xMi45di0xMi45aDEyLjl6TTE1MS4yIDE2NC4xYy03LjEgMC0xMi45LTUuOC0xMi45LTEyLjkgMC03LjEgNS44LTEyLjkgMTIuOS0xMi45aDMyLjNjNy4xIDAgMTIuOSA1LjggMTIuOSAxMi45IDAgNy4xLTUuOCAxMi45LTEyLjkgMTIuOWgtMzIuM3pcIiBjbGFzcz1cInN0M1wiLz48L3N2Zz5gLFxuICAgICAgICApfWAsXG4gICAgICAgIHByb3ZpZGVySWQ6IFwic2xhY2tcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQ29ubmVjdCB5b3VyIFNsYWNrIGFjY291bnRcIixcbiAgICAgIH0pLFxuICAgICAgY2xpZW50SWQ6IG9wdGlvbnMuY2xpZW50SWQgPz8gUFJPVklERVJfQ0xJRU5UX0lEUy5zbGFjayxcbiAgICAgIGF1dGhvcml6ZVVybDogb3B0aW9ucy5hdXRob3JpemVVcmwgPz8gXCJodHRwczovL3NsYWNrLm9hdXRoLnJheWNhc3QuY29tL2F1dGhvcml6ZVwiLFxuICAgICAgdG9rZW5Vcmw6IG9wdGlvbnMudG9rZW5VcmwgPz8gXCJodHRwczovL3NsYWNrLm9hdXRoLnJheWNhc3QuY29tL3Rva2VuXCIsXG4gICAgICByZWZyZXNoVG9rZW5Vcmw6IG9wdGlvbnMudG9rZW5VcmwgPz8gXCJodHRwczovL3NsYWNrLm9hdXRoLnJheWNhc3QuY29tL3JlZnJlc2gtdG9rZW5cIixcbiAgICAgIHNjb3BlOiBcIlwiLFxuICAgICAgZXh0cmFQYXJhbWV0ZXJzOiB7XG4gICAgICAgIHVzZXJfc2NvcGU6IG9wdGlvbnMuc2NvcGUsXG4gICAgICB9LFxuICAgICAgcGVyc29uYWxBY2Nlc3NUb2tlbjogb3B0aW9ucy5wZXJzb25hbEFjY2Vzc1Rva2VuLFxuICAgICAgYm9keUVuY29kaW5nOiBvcHRpb25zLnRva2VuVXJsID8gb3B0aW9ucy5ib2R5RW5jb2RpbmcgPz8gXCJ1cmwtZW5jb2RlZFwiIDogXCJqc29uXCIsXG4gICAgICBvbkF1dGhvcml6ZTogb3B0aW9ucy5vbkF1dGhvcml6ZSxcbiAgICAgIHRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgIHRva2VuUmVzcG9uc2VQYXJzZXI6XG4gICAgICAgIG9wdGlvbnMudG9rZW5SZXNwb25zZVBhcnNlciA/P1xuICAgICAgICAoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWNjZXNzX3Rva2VuOiByZXNwb25zZS5hdXRoZWRfdXNlci5hY2Nlc3NfdG9rZW4sXG4gICAgICAgICAgICBzY29wZTogcmVzcG9uc2UuYXV0aGVkX3VzZXIuc2NvcGUsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogWm9vbSBPQXV0aCBzZXJ2aWNlIHByb3ZpZGVkIG91dCBvZiB0aGUgYm94LlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IHpvb20gPSBPQXV0aFNlcnZpY2Uuem9vbSh7XG4gICAqICAgY2xpZW50SWQ6ICdjdXN0b20tY2xpZW50LWlkJyxcbiAgICogICBhdXRob3JpemVVcmw6ICdodHRwczovL3pvb20udXMvb2F1dGgvYXV0aG9yaXplJyxcbiAgICogICB0b2tlblVybDogJ2h0dHBzOi8vem9vbS51cy9vYXV0aC90b2tlbicsXG4gICAqICAgc2NvcGU6ICdtZWV0aW5nOndyaXRlJyxcbiAgICogICBwZXJzb25hbEFjY2Vzc1Rva2VuOiAncGVyc29uYWwtYWNjZXNzLXRva2VuJyxcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyB6b29tKG9wdGlvbnM6IFByb3ZpZGVyT3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgT0F1dGhTZXJ2aWNlKHtcbiAgICAgIGNsaWVudDogbmV3IE9BdXRoLlBLQ0VDbGllbnQoe1xuICAgICAgICByZWRpcmVjdE1ldGhvZDogT0F1dGguUmVkaXJlY3RNZXRob2QuV2ViLFxuICAgICAgICBwcm92aWRlck5hbWU6IFwiWm9vbVwiLFxuICAgICAgICBwcm92aWRlckljb246IGBkYXRhOmltYWdlL3N2Zyt4bWwsJHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMzUxLjg0NSA4MFwiPjxwYXRoIGQ9XCJNNzMuNzg2IDc4LjgzNUgxMC44OEExMC44NDIgMTAuODQyIDAgMCAxIC44MzMgNzIuMTIyYTEwLjg0MSAxMC44NDEgMCAwIDEgMi4zNTctMTEuODVMNDYuNzY0IDE2LjdoLTMxLjIzQzYuOTU0IDE2LjY5OSAwIDkuNzQ0IDAgMS4xNjVoNTguMDE0YzQuNDE0IDAgOC4zNTcgMi42MzQgMTAuMDQ2IDYuNzEyYTEwLjg0MyAxMC44NDMgMCAwIDEtMi4zNTYgMTEuODVMMjIuMTMgNjMuMzAyaDM2LjEyMmM4LjU4IDAgMTUuNTM0IDYuOTU1IDE1LjUzNCAxNS41MzRabTI3OC4wNTktNDguNTQ0QzM1MS44NDUgMTMuNTg4IDMzOC4yNTYgMCAzMjEuNTUzIDBjLTguOTM0IDAtMTYuOTc1IDMuODktMjIuNTI0IDEwLjA2M0MyOTMuNDggMy44OSAyODUuNDQgMCAyNzYuNTA1IDBjLTE2LjcwMyAwLTMwLjI5MSAxMy41ODgtMzAuMjkxIDMwLjI5MXY0OC41NDRjOC41NzkgMCAxNS41MzQtNi45NTUgMTUuNTM0LTE1LjUzNHYtMzMuMDFjMC04LjEzNyA2LjYyLTE0Ljc1NyAxNC43NTctMTQuNzU3czE0Ljc1NyA2LjYyIDE0Ljc1NyAxNC43NTd2MzMuMDFjMCA4LjU4IDYuOTU1IDE1LjUzNCAxNS41MzQgMTUuNTM0VjMwLjI5MWMwLTguMTM3IDYuNjItMTQuNzU3IDE0Ljc1Ny0xNC43NTdzMTQuNzU4IDYuNjIgMTQuNzU4IDE0Ljc1N3YzMy4wMWMwIDguNTggNi45NTQgMTUuNTM0IDE1LjUzNCAxNS41MzRWMzAuMjkxWk0yMzguNDQ3IDQwYzAgMjIuMDkxLTE3LjkwOSA0MC00MCA0MHMtNDAtMTcuOTA5LTQwLTQwIDE3LjkwOC00MCA0MC00MCA0MCAxNy45MDkgNDAgNDBabS0xNS41MzQgMGMwLTEzLjUxMi0xMC45NTQtMjQuNDY2LTI0LjQ2Ni0yNC40NjZTMTczLjk4IDI2LjQ4OCAxNzMuOTggNDBzMTAuOTUzIDI0LjQ2NiAyNC40NjYgMjQuNDY2UzIyMi45MTMgNTMuNTEyIDIyMi45MTMgNDBabS03MC42OCAwYzAgMjIuMDkxLTE3LjkwOSA0MC00MCA0MHMtNDAtMTcuOTA5LTQwLTQwIDE3LjkwOS00MCA0MC00MCA0MCAxNy45MDkgNDAgNDBabS0xNS41MzQgMGMwLTEzLjUxMi0xMC45NTQtMjQuNDY2LTI0LjQ2Ni0yNC40NjZTODcuNzY3IDI2LjQ4OCA4Ny43NjcgNDBzMTAuOTU0IDI0LjQ2NiAyNC40NjYgMjQuNDY2UzEzNi42OTkgNTMuNTEyIDEzNi42OTkgNDBaXCIgc3R5bGU9XCJmaWxsOiMwYjVjZmZcIi8+PC9zdmc+YCxcbiAgICAgICAgKX1gLFxuICAgICAgICBwcm92aWRlcklkOiBcInpvb21cIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQ29ubmVjdCB5b3VyIFpvb20gYWNjb3VudFwiLFxuICAgICAgfSksXG4gICAgICBjbGllbnRJZDogb3B0aW9ucy5jbGllbnRJZCxcbiAgICAgIGF1dGhvcml6ZVVybDogb3B0aW9ucy5hdXRob3JpemVVcmwgPz8gXCJodHRwczovL3pvb20udXMvb2F1dGgvYXV0aG9yaXplXCIsXG4gICAgICB0b2tlblVybDogb3B0aW9ucy50b2tlblVybCA/PyBcImh0dHBzOi8vem9vbS51cy9vYXV0aC90b2tlblwiLFxuICAgICAgcmVmcmVzaFRva2VuVXJsOiBvcHRpb25zLnJlZnJlc2hUb2tlblVybCxcbiAgICAgIHNjb3BlOiBvcHRpb25zLnNjb3BlLFxuICAgICAgcGVyc29uYWxBY2Nlc3NUb2tlbjogb3B0aW9ucy5wZXJzb25hbEFjY2Vzc1Rva2VuLFxuICAgICAgYm9keUVuY29kaW5nOiBvcHRpb25zLmJvZHlFbmNvZGluZyA/PyBcInVybC1lbmNvZGVkXCIsXG4gICAgICBvbkF1dGhvcml6ZTogb3B0aW9ucy5vbkF1dGhvcml6ZSxcbiAgICAgIHRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyLFxuICAgICAgdG9rZW5SZXNwb25zZVBhcnNlcjogb3B0aW9ucy50b2tlblJlc3BvbnNlUGFyc2VyLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYXRlcyB0aGUgT0F1dGggYXV0aG9yaXphdGlvbiBwcm9jZXNzIG9yIHJlZnJlc2hlcyBleGlzdGluZyB0b2tlbnMgaWYgbmVjZXNzYXJ5LlxuICAgKiBJZiB0aGUgY3VycmVudCB0b2tlbiBzZXQgaGFzIGEgcmVmcmVzaCB0b2tlbiBhbmQgaXQgaXMgZXhwaXJlZCwgdGhlbiB0aGUgZnVuY3Rpb24gd2lsbCByZWZyZXNoIHRoZSB0b2tlbnMuXG4gICAqIElmIG5vIHRva2VucyBleGlzdCwgaXQgd2lsbCBpbml0aWF0ZSB0aGUgT0F1dGggYXV0aG9yaXphdGlvbiBwcm9jZXNzIGFuZCBmZXRjaCB0aGUgdG9rZW5zLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBhY2Nlc3MgdG9rZW4gb2J0YWluZWQgZnJvbSB0aGUgYXV0aG9yaXphdGlvbiBmbG93LCBvciBudWxsIGlmIHRoZSB0b2tlbiBjb3VsZCBub3QgYmUgb2J0YWluZWQuXG4gICAqL1xuICBhc3luYyBhdXRob3JpemUoKSB7XG4gICAgY29uc3QgY3VycmVudFRva2VuU2V0ID0gYXdhaXQgdGhpcy5jbGllbnQuZ2V0VG9rZW5zKCk7XG4gICAgaWYgKGN1cnJlbnRUb2tlblNldD8uYWNjZXNzVG9rZW4pIHtcbiAgICAgIGlmIChjdXJyZW50VG9rZW5TZXQucmVmcmVzaFRva2VuICYmIGN1cnJlbnRUb2tlblNldC5pc0V4cGlyZWQoKSkge1xuICAgICAgICBjb25zdCB0b2tlbnMgPSBhd2FpdCB0aGlzLnJlZnJlc2hUb2tlbnMoe1xuICAgICAgICAgIHRva2VuOiBjdXJyZW50VG9rZW5TZXQucmVmcmVzaFRva2VuLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJbiB0aGUgY2FzZSB3aGVyZSB0aGUgcmVmcmVzaCB0b2tlbiBmbG93cyBmYWlscywgbm90aGluZyBpcyByZXR1cm5lZCBhbmQgdGhlIGF1dGhvcml6ZSBmdW5jdGlvbiBpcyBjYWxsZWQgYWdhaW4uXG4gICAgICAgIGlmICh0b2tlbnMpIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmNsaWVudC5zZXRUb2tlbnModG9rZW5zKTtcbiAgICAgICAgICByZXR1cm4gdG9rZW5zLmFjY2Vzc190b2tlbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGN1cnJlbnRUb2tlblNldC5hY2Nlc3NUb2tlbjtcbiAgICB9XG5cbiAgICBjb25zdCBhdXRoUmVxdWVzdCA9IGF3YWl0IHRoaXMuY2xpZW50LmF1dGhvcml6YXRpb25SZXF1ZXN0KHtcbiAgICAgIGVuZHBvaW50OiB0aGlzLmF1dGhvcml6ZVVybCxcbiAgICAgIGNsaWVudElkOiB0aGlzLmNsaWVudElkLFxuICAgICAgc2NvcGU6IHRoaXMuc2NvcGUsXG4gICAgICBleHRyYVBhcmFtZXRlcnM6IHRoaXMuZXh0cmFQYXJhbWV0ZXJzLFxuICAgIH0pO1xuXG4gICAgY29uc3QgeyBhdXRob3JpemF0aW9uQ29kZSB9ID0gYXdhaXQgdGhpcy5jbGllbnQuYXV0aG9yaXplKGF1dGhSZXF1ZXN0KTtcbiAgICBjb25zdCB0b2tlbnMgPSBhd2FpdCB0aGlzLmZldGNoVG9rZW5zKHtcbiAgICAgIGF1dGhSZXF1ZXN0LFxuICAgICAgYXV0aG9yaXphdGlvbkNvZGUsXG4gICAgfSk7XG5cbiAgICBhd2FpdCB0aGlzLmNsaWVudC5zZXRUb2tlbnModG9rZW5zKTtcblxuICAgIHJldHVybiB0b2tlbnMuYWNjZXNzX3Rva2VuO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBmZXRjaFRva2Vucyh7XG4gICAgYXV0aFJlcXVlc3QsXG4gICAgYXV0aG9yaXphdGlvbkNvZGUsXG4gIH06IHtcbiAgICBhdXRoUmVxdWVzdDogT0F1dGguQXV0aG9yaXphdGlvblJlcXVlc3Q7XG4gICAgYXV0aG9yaXphdGlvbkNvZGU6IHN0cmluZztcbiAgfSkge1xuICAgIGxldCBvcHRpb25zO1xuICAgIGlmICh0aGlzLmJvZHlFbmNvZGluZyA9PT0gXCJ1cmwtZW5jb2RlZFwiKSB7XG4gICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG4gICAgICBwYXJhbXMuYXBwZW5kKFwiY2xpZW50X2lkXCIsIHRoaXMuY2xpZW50SWQpO1xuICAgICAgcGFyYW1zLmFwcGVuZChcImNvZGVcIiwgYXV0aG9yaXphdGlvbkNvZGUpO1xuICAgICAgcGFyYW1zLmFwcGVuZChcImNvZGVfdmVyaWZpZXJcIiwgYXV0aFJlcXVlc3QuY29kZVZlcmlmaWVyKTtcbiAgICAgIHBhcmFtcy5hcHBlbmQoXCJncmFudF90eXBlXCIsIFwiYXV0aG9yaXphdGlvbl9jb2RlXCIpO1xuICAgICAgcGFyYW1zLmFwcGVuZChcInJlZGlyZWN0X3VyaVwiLCBhdXRoUmVxdWVzdC5yZWRpcmVjdFVSSSk7XG5cbiAgICAgIG9wdGlvbnMgPSB7IGJvZHk6IHBhcmFtcyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zID0ge1xuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgY2xpZW50X2lkOiB0aGlzLmNsaWVudElkLFxuICAgICAgICAgIGNvZGU6IGF1dGhvcml6YXRpb25Db2RlLFxuICAgICAgICAgIGNvZGVfdmVyaWZpZXI6IGF1dGhSZXF1ZXN0LmNvZGVWZXJpZmllcixcbiAgICAgICAgICBncmFudF90eXBlOiBcImF1dGhvcml6YXRpb25fY29kZVwiLFxuICAgICAgICAgIHJlZGlyZWN0X3VyaTogYXV0aFJlcXVlc3QucmVkaXJlY3RVUkksXG4gICAgICAgIH0pLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godGhpcy50b2tlblVybCwgeyBtZXRob2Q6IFwiUE9TVFwiLCAuLi5vcHRpb25zIH0pO1xuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJmZXRjaCB0b2tlbnMgZXJyb3I6XCIsIHJlc3BvbnNlVGV4dCk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHdoaWxlIGZldGNoaW5nIHRva2VuczogJHtyZXNwb25zZS5zdGF0dXN9ICgke3Jlc3BvbnNlLnN0YXR1c1RleHR9KVxcbiR7cmVzcG9uc2VUZXh0fWApO1xuICAgIH1cbiAgICBjb25zdCB0b2tlbnMgPSB0aGlzLnRva2VuUmVzcG9uc2VQYXJzZXIoYXdhaXQgcmVzcG9uc2UuanNvbigpKTtcblxuICAgIC8vIFNvbWUgY2xpZW50cyBzdWNoIGFzIExpbmVhciBjYW4gcmV0dXJuIGEgc2NvcGUgYXJyYXkgaW5zdGVhZCBvZiBhIHN0cmluZ1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHRva2Vucy5zY29wZSkgPyB7IC4uLnRva2Vucywgc2NvcGU6IHRva2Vucy5zY29wZS5qb2luKFwiIFwiKSB9IDogdG9rZW5zO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZWZyZXNoVG9rZW5zKHsgdG9rZW4gfTogeyB0b2tlbjogc3RyaW5nIH0pIHtcbiAgICBsZXQgb3B0aW9ucztcbiAgICBpZiAodGhpcy5ib2R5RW5jb2RpbmcgPT09IFwidXJsLWVuY29kZWRcIikge1xuICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuICAgICAgcGFyYW1zLmFwcGVuZChcImNsaWVudF9pZFwiLCB0aGlzLmNsaWVudElkKTtcbiAgICAgIHBhcmFtcy5hcHBlbmQoXCJyZWZyZXNoX3Rva2VuXCIsIHRva2VuKTtcbiAgICAgIHBhcmFtcy5hcHBlbmQoXCJncmFudF90eXBlXCIsIFwicmVmcmVzaF90b2tlblwiKTtcblxuICAgICAgb3B0aW9ucyA9IHsgYm9keTogcGFyYW1zIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBjbGllbnRfaWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICAgICAgcmVmcmVzaF90b2tlbjogdG9rZW4sXG4gICAgICAgICAgZ3JhbnRfdHlwZTogXCJyZWZyZXNoX3Rva2VuXCIsXG4gICAgICAgIH0pLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godGhpcy5yZWZyZXNoVG9rZW5VcmwgPz8gdGhpcy50b2tlblVybCwgeyBtZXRob2Q6IFwiUE9TVFwiLCAuLi5vcHRpb25zIH0pO1xuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJyZWZyZXNoIHRva2VucyBlcnJvcjpcIiwgcmVzcG9uc2VUZXh0KTtcbiAgICAgIC8vIElmIHRoZSByZWZyZXNoIHRva2VuIGlzIGludmFsaWQsIHN0b3AgdGhlIGZsb3cgaGVyZSwgbG9nIG91dCB0aGUgdXNlciBhbmQgcHJvbXB0IHRoZW0gdG8gcmUtYXV0aG9yaXplLlxuICAgICAgdGhpcy5jbGllbnQuZGVzY3JpcHRpb24gPSBgJHt0aGlzLmNsaWVudC5wcm92aWRlck5hbWV9IG5lZWRzIHlvdSB0byBzaWduLWluIGFnYWluLiBQcmVzcyDij44gb3IgY2xpY2sgdGhlIGJ1dHRvbiBiZWxvdyB0byBjb250aW51ZS5gO1xuICAgICAgYXdhaXQgdGhpcy5jbGllbnQucmVtb3ZlVG9rZW5zKCk7XG4gICAgICBhd2FpdCB0aGlzLmF1dGhvcml6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0b2tlblJlc3BvbnNlID0gdGhpcy50b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcihhd2FpdCByZXNwb25zZS5qc29uKCkpO1xuICAgICAgdG9rZW5SZXNwb25zZS5yZWZyZXNoX3Rva2VuID0gdG9rZW5SZXNwb25zZS5yZWZyZXNoX3Rva2VuID8/IHRva2VuO1xuICAgICAgcmV0dXJuIHRva2VuUmVzcG9uc2U7XG4gICAgfVxuICB9XG59XG4iLCAiZXhwb3J0IGNvbnN0IFBST1ZJREVSX0NMSUVOVF9JRFMgPSB7XG4gIGFzYW5hOiBcIjExOTEyMDE3NDU2ODQzMTJcIixcbiAgZ2l0aHViOiBcIjcyMzVmZThkNDIxNTdmMWYzOGMwXCIsXG4gIGxpbmVhcjogXCJjOGZmMzdiOTIyNWMzYzlhZWZkN2Q2NmVhMGU1YjZmMVwiLFxuICBzbGFjazogXCI4NTE3NTY4ODQ2OTIuNTU0NjkyNzI5MDIxMlwiLFxufTtcbiIsICJpbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBlbnZpcm9ubWVudCwgT0F1dGggfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgdHlwZSB7IE9BdXRoVHlwZSwgT25BdXRob3JpemVQYXJhbXMgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5sZXQgdG9rZW46IHN0cmluZyB8IG51bGwgPSBudWxsO1xubGV0IHR5cGU6IE9BdXRoVHlwZSB8IG51bGwgPSBudWxsO1xubGV0IGF1dGhvcml6ZTogUHJvbWlzZTxzdHJpbmc+IHwgbnVsbCA9IG51bGw7XG5sZXQgZ2V0SWRUb2tlbjogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+IHwgbnVsbCA9IG51bGw7XG5sZXQgb25BdXRob3JpemU6IFByb21pc2U8dm9pZD4gfCBudWxsID0gbnVsbDtcblxudHlwZSBXaXRoQWNjZXNzVG9rZW5QYXJhbWV0ZXJzID0ge1xuICAvKipcbiAgICogQW4gb3B0aW9uYWwgaW5zdGFuY2Ugb2YgYSBQS0NFIENsaWVudCB0aGF0IHlvdSBjYW4gY3JlYXRlIHVzaW5nIFJheWNhc3QgQVBJLlxuICAgKiBUaGlzIGNsaWVudCBpcyB1c2VkIHRvIHJldHVybiB0aGUgYGlkVG9rZW5gIGFzIHBhcnQgb2YgdGhlIGBvbkF1dGhvcml6ZWAgY2FsbGJhY2suXG4gICAqL1xuICBjbGllbnQ/OiBPQXV0aC5QS0NFQ2xpZW50O1xuICAvKipcbiAgICogQSBmdW5jdGlvbiB0aGF0IGluaXRpYXRlcyB0aGUgT0F1dGggdG9rZW4gcmV0cmlldmFsIHByb2Nlc3NcbiAgICogQHJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gYWNjZXNzIHRva2VuLlxuICAgKi9cbiAgYXV0aG9yaXplOiAoKSA9PiBQcm9taXNlPHN0cmluZz47XG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBzdHJpbmcgdGhhdCByZXByZXNlbnRzIGFuIGFscmVhZHkgb2J0YWluZWQgcGVyc29uYWwgYWNjZXNzIHRva2VuXG4gICAqL1xuICBwZXJzb25hbEFjY2Vzc1Rva2VuPzogc3RyaW5nO1xuICAvKipcbiAgICogQW4gb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgb25jZSB0aGUgdXNlciBoYXMgYmVlbiBwcm9wZXJseSBsb2dnZWQgaW4gdGhyb3VnaCBPQXV0aC5cbiAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyAtIFBhcmFtZXRlcnMgb2YgdGhlIGNhbGxiYWNrXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRva2VuIC0gVGhlIHJldHJpZXZlZCBhY2Nlc3MgdG9rZW5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudHlwZSAtIFRoZSBhY2Nlc3MgdG9rZW4ncyB0eXBlIChlaXRoZXIgYG9hdXRoYCBvciBgcGVyc29uYWxgKVxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5pZFRva2VuIC0gVGhlIG9wdGlvbmFsIGlkIHRva2VuLiBUaGUgYGlkVG9rZW5gIGlzIHJldHVybmVkIGlmIGBvcHRpb25zLmNsaWVudGAgaXMgcHJvdmlkZWQgYW5kIGlmIGl0J3MgcmV0dXJuZWQgaW4gdGhlIGluaXRpYWwgdG9rZW4gc2V0LlxuICAgKi9cbiAgb25BdXRob3JpemU/OiAocGFyYW1zOiBPbkF1dGhvcml6ZVBhcmFtcykgPT4gdm9pZDtcbn07XG5cbi8qKlxuICogVGhlIGNvbXBvbmVudCAoZm9yIGEgdmlldy9tZW51LWJhciBjb21tYW5kcykgb3IgZnVuY3Rpb24gKGZvciBhIG5vLXZpZXcgY29tbWFuZCkgdGhhdCBpcyBwYXNzZWQgdG8gd2l0aEFjY2Vzc1Rva2VuLlxuICovXG5leHBvcnQgdHlwZSBXaXRoQWNjZXNzVG9rZW5Db21wb25lbnRPckZuPFQgPSBhbnksIFUgPSBhbnk+ID0gKChwYXJhbXM6IFQpID0+IFByb21pc2U8VT4gfCBVKSB8IFJlYWN0LkNvbXBvbmVudFR5cGU8VD47XG5cbi8qKlxuICogSGlnaGVyLW9yZGVyIGNvbXBvbmVudCB0byB3cmFwIGEgZ2l2ZW4gY29tcG9uZW50IG9yIGZ1bmN0aW9uIGFuZCBzZXQgYW4gYWNjZXNzIHRva2VuIGluIGEgc2hhcmVkIGdsb2JhbCB2YXJpYWJsZS5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gaW50ZXJjZXB0cyB0aGUgY29tcG9uZW50IHJlbmRlcmluZyBwcm9jZXNzIHRvIGVpdGhlciBmZXRjaCBhbiBPQXV0aCB0b2tlbiBhc3luY2hyb25vdXNseVxuICogb3IgdXNlIGEgcHJvdmlkZWQgcGVyc29uYWwgYWNjZXNzIHRva2VuLiBBIGdsb2JhbCB2YXJpYWJsZSB3aWxsIGJlIHRoZW4gc2V0IHdpdGggdGhlIHJlY2VpdmVkIHRva2VuXG4gKiB0aGF0IHlvdSBjYW4gZ2V0IHdpdGggdGhlIGBnZXRBY2Nlc3NUb2tlbmAgZnVuY3Rpb24uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IERldGFpbCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IE9BdXRoU2VydmljZSwgZ2V0QWNjZXNzVG9rZW4sIHdpdGhBY2Nlc3NUb2tlbiB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICpcbiAqIGNvbnN0IGdpdGh1YiA9IE9BdXRoU2VydmljZS5naXRodWIoeyBzY29wZTogXCJub3RpZmljYXRpb25zIHJlcG8gcmVhZDpvcmcgcmVhZDp1c2VyIHJlYWQ6cHJvamVjdFwiIH0pO1xuICpcbiAqIGZ1bmN0aW9uIEF1dGhvcml6ZWRDb21wb25lbnQoKSB7XG4gKiAgY29uc3QgeyB0b2tlbiB9ID0gZ2V0QWNjZXNzVG9rZW4oKTtcbiAqICAuLi5cbiAqIH1cbiAqXG4gKiBleHBvcnQgZGVmYXVsdCB3aXRoQWNjZXNzVG9rZW4oZ2l0aHViKShBdXRob3JpemVkQ29tcG9uZW50KTtcbiAqIGBgYFxuICpcbiAqIEByZXR1cm5zIHtSZWFjdC5Db21wb25lbnRUeXBlPFQ+fSBUaGUgd3JhcHBlZCBjb21wb25lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoQWNjZXNzVG9rZW48VCA9IGFueSwgVSA9IGFueT4oXG4gIG9wdGlvbnM6IFdpdGhBY2Nlc3NUb2tlblBhcmFtZXRlcnMsXG4pOiA8ViBleHRlbmRzIFdpdGhBY2Nlc3NUb2tlbkNvbXBvbmVudE9yRm48VCwgVT4+KFxuICBmbk9yQ29tcG9uZW50OiBWLFxuKSA9PiBWIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50VHlwZTxUPiA/IFJlYWN0LkZ1bmN0aW9uQ29tcG9uZW50PFQ+IDogKHByb3BzOiBUKSA9PiBQcm9taXNlPFU+O1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhBY2Nlc3NUb2tlbjxUPihvcHRpb25zOiBXaXRoQWNjZXNzVG9rZW5QYXJhbWV0ZXJzKSB7XG4gIGlmIChlbnZpcm9ubWVudC5jb21tYW5kTW9kZSA9PT0gXCJuby12aWV3XCIpIHtcbiAgICByZXR1cm4gKGZuOiAocHJvcHM6IFQpID0+IFByb21pc2U8dm9pZD4gfCAoKCkgPT4gdm9pZCkpID0+IHtcbiAgICAgIGNvbnN0IG5vVmlld0ZuID0gYXN5bmMgKHByb3BzOiBUKSA9PiB7XG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICB0b2tlbiA9IG9wdGlvbnMucGVyc29uYWxBY2Nlc3NUb2tlbiA/PyAoYXdhaXQgb3B0aW9ucy5hdXRob3JpemUoKSk7XG4gICAgICAgICAgdHlwZSA9IG9wdGlvbnMucGVyc29uYWxBY2Nlc3NUb2tlbiA/IFwicGVyc29uYWxcIiA6IFwib2F1dGhcIjtcbiAgICAgICAgICBjb25zdCBpZFRva2VuID0gKGF3YWl0IG9wdGlvbnMuY2xpZW50Py5nZXRUb2tlbnMoKSk/LmlkVG9rZW47XG5cbiAgICAgICAgICBpZiAob3B0aW9ucy5vbkF1dGhvcml6ZSkge1xuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5yZXNvbHZlKG9wdGlvbnMub25BdXRob3JpemUoeyB0b2tlbiwgdHlwZSwgaWRUb2tlbiB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZuKHByb3BzKTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBub1ZpZXdGbjtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIChDb21wb25lbnQ6IFJlYWN0LkNvbXBvbmVudFR5cGU8VD4pID0+IHtcbiAgICBjb25zdCBXcmFwcGVkQ29tcG9uZW50OiBSZWFjdC5Db21wb25lbnRUeXBlPFQ+ID0gKHByb3BzKSA9PiB7XG4gICAgICBpZiAob3B0aW9ucy5wZXJzb25hbEFjY2Vzc1Rva2VuKSB7XG4gICAgICAgIHRva2VuID0gb3B0aW9ucy5wZXJzb25hbEFjY2Vzc1Rva2VuO1xuICAgICAgICB0eXBlID0gXCJwZXJzb25hbFwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFhdXRob3JpemUpIHtcbiAgICAgICAgICBhdXRob3JpemUgPSBvcHRpb25zLmF1dGhvcml6ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRva2VuID0gUmVhY3QudXNlKGF1dGhvcml6ZSk7XG4gICAgICAgIHR5cGUgPSBcIm9hdXRoXCI7XG4gICAgICB9XG5cbiAgICAgIGxldCBpZFRva2VuOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICBpZiAob3B0aW9ucy5jbGllbnQpIHtcbiAgICAgICAgaWYgKCFnZXRJZFRva2VuKSB7XG4gICAgICAgICAgZ2V0SWRUb2tlbiA9IG9wdGlvbnMuY2xpZW50Py5nZXRUb2tlbnMoKS50aGVuKCh0b2tlbnMpID0+IHRva2Vucz8uaWRUb2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgaWRUb2tlbiA9IFJlYWN0LnVzZShnZXRJZFRva2VuKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMub25BdXRob3JpemUpIHtcbiAgICAgICAgaWYgKCFvbkF1dGhvcml6ZSkge1xuICAgICAgICAgIG9uQXV0aG9yaXplID0gUHJvbWlzZS5yZXNvbHZlKG9wdGlvbnMub25BdXRob3JpemUoeyB0b2tlbjogdG9rZW4hLCB0eXBlLCBpZFRva2VuIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBSZWFjdC51c2Uob25BdXRob3JpemUpO1xuICAgICAgfVxuXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgICAvLyBAdHMtaWdub3JlIHRvbyBjb21wbGljYXRlZCBmb3IgVFNcbiAgICAgIHJldHVybiA8Q29tcG9uZW50IHsuLi5wcm9wc30gLz47XG4gICAgfTtcblxuICAgIFdyYXBwZWRDb21wb25lbnQuZGlzcGxheU5hbWUgPSBgd2l0aEFjY2Vzc1Rva2VuKCR7Q29tcG9uZW50LmRpc3BsYXlOYW1lIHx8IENvbXBvbmVudC5uYW1lfSlgO1xuXG4gICAgcmV0dXJuIFdyYXBwZWRDb21wb25lbnQ7XG4gIH07XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYWNjZXNzIHRva2VuIGFuZCBpdHMgdHlwZS4gTm90ZSB0aGF0IHRoaXMgZnVuY3Rpb24gbXVzdCBiZSBjYWxsZWQgaW4gYSBjb21wb25lbnQgd3JhcHBlZCB3aXRoIGB3aXRoQWNjZXNzVG9rZW5gLlxuICpcbiAqIFdpbGwgdGhyb3cgYW4gRXJyb3IgaWYgY2FsbGVkIG91dHNpZGUgb2YgYSBmdW5jdGlvbiBvciBjb21wb25lbnQgd3JhcHBlZCB3aXRoIGB3aXRoQWNjZXNzVG9rZW5gXG4gKlxuICogQHJldHVybnMge3sgdG9rZW46IHN0cmluZywgdHlwZTogXCJvYXV0aFwiIHwgXCJwZXJzb25hbFwiIH19IEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBgdG9rZW5gXG4gKiBhbmQgaXRzIGB0eXBlYCwgd2hlcmUgdHlwZSBjYW4gYmUgZWl0aGVyICdvYXV0aCcgZm9yIE9BdXRoIHRva2VucyBvciAncGVyc29uYWwnIGZvciBhXG4gKiBwZXJzb25hbCBhY2Nlc3MgdG9rZW4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY2Nlc3NUb2tlbigpOiB7XG4gIHRva2VuOiBzdHJpbmc7XG4gIC8qKiBgb2F1dGhgIGZvciBPQXV0aCB0b2tlbnMgb3IgYHBlcnNvbmFsYCBmb3IgcGVyc29uYWwgYWNjZXNzIHRva2VuICovXG4gIHR5cGU6IFwib2F1dGhcIiB8IFwicGVyc29uYWxcIjtcbn0ge1xuICBpZiAoIXRva2VuIHx8ICF0eXBlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiZ2V0QWNjZXNzVG9rZW4gbXVzdCBiZSB1c2VkIHdoZW4gYXV0aGVudGljYXRlZCAoZWcuIHVzZWQgaW5zaWRlIGB3aXRoQWNjZXNzVG9rZW5gKVwiKTtcbiAgfVxuXG4gIHJldHVybiB7IHRva2VuLCB0eXBlIH07XG59XG4iLCAiaW1wb3J0IHsgZW52aXJvbm1lbnQsIExhdW5jaFByb3BzLCBMYXVuY2hUeXBlIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IGZzIGZyb20gXCJub2RlOmZzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XG5cbmV4cG9ydCBlbnVtIERlZXBsaW5rVHlwZSB7XG4gIC8qKiBBIHNjcmlwdCBjb21tYW5kICovXG4gIFNjcmlwdENvbW1hbmQgPSBcInNjcmlwdC1jb21tYW5kXCIsXG4gIC8qKiBBbiBleHRlbnNpb24gY29tbWFuZCAqL1xuICBFeHRlbnNpb24gPSBcImV4dGVuc2lvblwiLFxufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGNyZWF0aW5nIGEgZGVlcGxpbmsgdG8gYSBzY3JpcHQgY29tbWFuZC5cbiAqL1xuZXhwb3J0IHR5cGUgQ3JlYXRlU2NyaXB0Q29tbWFuZERlZXBsaW5rT3B0aW9ucyA9IHtcbiAgLyoqXG4gICAqIFRoZSB0eXBlIG9mIGRlZXBsaW5rLCB3aGljaCBzaG91bGQgYmUgXCJzY3JpcHQtY29tbWFuZFwiLlxuICAgKi9cbiAgdHlwZTogRGVlcGxpbmtUeXBlLlNjcmlwdENvbW1hbmQ7XG4gIC8qKlxuICAgKiBUaGUgbmFtZSBvZiB0aGUgY29tbWFuZC5cbiAgICovXG4gIGNvbW1hbmQ6IHN0cmluZztcbiAgLyoqXG4gICAqIElmIHRoZSBjb21tYW5kIGFjY2VwdHMgYXJndW1lbnRzLCB0aGV5IGNhbiBiZSBwYXNzZWQgdXNpbmcgdGhpcyBxdWVyeSBwYXJhbWV0ZXIuXG4gICAqL1xuICBhcmd1bWVudHM/OiBzdHJpbmdbXTtcbn07XG5cbi8qKlxuICogQmFzZSBvcHRpb25zIGZvciBjcmVhdGluZyBhIGRlZXBsaW5rIHRvIGFuIGV4dGVuc2lvbi5cbiAqL1xuZXhwb3J0IHR5cGUgQ3JlYXRlRXh0ZW5zaW9uRGVlcGxpbmtCYXNlT3B0aW9ucyA9IHtcbiAgLyoqXG4gICAqIFRoZSB0eXBlIG9mIGRlZXBsaW5rLCB3aGljaCBzaG91bGQgYmUgXCJleHRlbnNpb25cIi5cbiAgICovXG4gIHR5cGU/OiBEZWVwbGlua1R5cGUuRXh0ZW5zaW9uO1xuICAvKipcbiAgICogVGhlIGNvbW1hbmQgYXNzb2NpYXRlZCB3aXRoIHRoZSBleHRlbnNpb24uXG4gICAqL1xuICBjb21tYW5kOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBFaXRoZXIgXCJ1c2VySW5pdGlhdGVkXCIsIHdoaWNoIHJ1bnMgdGhlIGNvbW1hbmQgaW4gdGhlIGZvcmVncm91bmQsIG9yIFwiYmFja2dyb3VuZFwiLCB3aGljaCBza2lwcyBicmluZ2luZyBSYXljYXN0IHRvIHRoZSBmcm9udC5cbiAgICovXG4gIGxhdW5jaFR5cGU/OiBMYXVuY2hUeXBlO1xuICAvKipcbiAgICogSWYgdGhlIGNvbW1hbmQgYWNjZXB0cyBhcmd1bWVudHMsIHRoZXkgY2FuIGJlIHBhc3NlZCB1c2luZyB0aGlzIHF1ZXJ5IHBhcmFtZXRlci5cbiAgICovXG4gIGFyZ3VtZW50cz86IExhdW5jaFByb3BzW1wiYXJndW1lbnRzXCJdO1xuICAvKipcbiAgICogSWYgdGhlIGNvbW1hbmQgbWFrZSB1c2Ugb2YgTGF1bmNoQ29udGV4dCwgaXQgY2FuIGJlIHBhc3NlZCB1c2luZyB0aGlzIHF1ZXJ5IHBhcmFtZXRlci5cbiAgICovXG4gIGNvbnRleHQ/OiBMYXVuY2hQcm9wc1tcImxhdW5jaENvbnRleHRcIl07XG4gIC8qKlxuICAgKiBTb21lIHRleHQgdG8gcHJlZmlsbCB0aGUgc2VhcmNoIGJhciBvciBmaXJzdCB0ZXh0IGlucHV0IG9mIHRoZSBjb21tYW5kXG4gICAqL1xuICBmYWxsYmFja1RleHQ/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGNyZWF0aW5nIGEgZGVlcGxpbmsgdG8gYW4gZXh0ZW5zaW9uIGZyb20gYW5vdGhlciBleHRlbnNpb24uXG4gKiBSZXF1aXJlcyBib3RoIHRoZSBvd25lck9yQXV0aG9yTmFtZSBhbmQgZXh0ZW5zaW9uTmFtZS5cbiAqL1xuZXhwb3J0IHR5cGUgQ3JlYXRlSW50ZXJFeHRlbnNpb25EZWVwbGlua09wdGlvbnMgPSBDcmVhdGVFeHRlbnNpb25EZWVwbGlua0Jhc2VPcHRpb25zICYge1xuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIG93bmVyIG9yIGF1dGhvciBvZiB0aGUgZXh0ZW5zaW9uLlxuICAgKi9cbiAgb3duZXJPckF1dGhvck5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBleHRlbnNpb24uXG4gICAqL1xuICBleHRlbnNpb25OYW1lOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGNyZWF0aW5nIGEgZGVlcGxpbmsgdG8gYW4gZXh0ZW5zaW9uLlxuICovXG5leHBvcnQgdHlwZSBDcmVhdGVFeHRlbnNpb25EZWVwbGlua09wdGlvbnMgPSBDcmVhdGVJbnRlckV4dGVuc2lvbkRlZXBsaW5rT3B0aW9ucyB8IENyZWF0ZUV4dGVuc2lvbkRlZXBsaW5rQmFzZU9wdGlvbnM7XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgY3JlYXRpbmcgYSBkZWVwbGluay5cbiAqL1xuZXhwb3J0IHR5cGUgQ3JlYXRlRGVlcGxpbmtPcHRpb25zID0gQ3JlYXRlU2NyaXB0Q29tbWFuZERlZXBsaW5rT3B0aW9ucyB8IENyZWF0ZUV4dGVuc2lvbkRlZXBsaW5rT3B0aW9ucztcblxuZnVuY3Rpb24gZ2V0UHJvdG9jb2woKSB7XG4gIHJldHVybiBlbnZpcm9ubWVudC5yYXljYXN0VmVyc2lvbi5pbmNsdWRlcyhcImFscGhhXCIpID8gXCJyYXljYXN0aW50ZXJuYWw6Ly9cIiA6IFwicmF5Y2FzdDovL1wiO1xufVxuXG5mdW5jdGlvbiBnZXRPd25lck9yQXV0aG9yTmFtZSgpIHtcbiAgY29uc3QgcGFja2FnZUpTT04gPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oZW52aXJvbm1lbnQuYXNzZXRzUGF0aCwgXCIuLlwiLCBcInBhY2thZ2UuanNvblwiKSwgXCJ1dGY4XCIpKTtcbiAgcmV0dXJuIHBhY2thZ2VKU09OLm93bmVyIHx8IHBhY2thZ2VKU09OLmF1dGhvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNjcmlwdENvbW1hbmREZWVwbGluayhvcHRpb25zOiBDcmVhdGVTY3JpcHRDb21tYW5kRGVlcGxpbmtPcHRpb25zKTogc3RyaW5nIHtcbiAgbGV0IHVybCA9IGAke2dldFByb3RvY29sKCl9c2NyaXB0LWNvbW1hbmRzLyR7b3B0aW9ucy5jb21tYW5kfWA7XG5cbiAgaWYgKG9wdGlvbnMuYXJndW1lbnRzKSB7XG4gICAgbGV0IHBhcmFtcyA9IFwiXCI7XG4gICAgZm9yIChjb25zdCBhcmcgb2Ygb3B0aW9ucy5hcmd1bWVudHMpIHtcbiAgICAgIHBhcmFtcyArPSBcIiZhcmd1bWVudHM9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoYXJnKTtcbiAgICB9XG4gICAgdXJsICs9IFwiP1wiICsgcGFyYW1zLnN1YnN0cmluZygxKTtcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFeHRlbnNpb25EZWVwbGluayhvcHRpb25zOiBDcmVhdGVFeHRlbnNpb25EZWVwbGlua09wdGlvbnMpOiBzdHJpbmcge1xuICBsZXQgb3duZXJPckF1dGhvck5hbWUgPSBnZXRPd25lck9yQXV0aG9yTmFtZSgpO1xuICBsZXQgZXh0ZW5zaW9uTmFtZSA9IGVudmlyb25tZW50LmV4dGVuc2lvbk5hbWU7XG5cbiAgaWYgKFwib3duZXJPckF1dGhvck5hbWVcIiBpbiBvcHRpb25zICYmIFwiZXh0ZW5zaW9uTmFtZVwiIGluIG9wdGlvbnMpIHtcbiAgICBvd25lck9yQXV0aG9yTmFtZSA9IG9wdGlvbnMub3duZXJPckF1dGhvck5hbWU7XG4gICAgZXh0ZW5zaW9uTmFtZSA9IG9wdGlvbnMuZXh0ZW5zaW9uTmFtZTtcbiAgfVxuXG4gIGxldCB1cmwgPSBgJHtnZXRQcm90b2NvbCgpfWV4dGVuc2lvbnMvJHtvd25lck9yQXV0aG9yTmFtZX0vJHtleHRlbnNpb25OYW1lfS8ke29wdGlvbnMuY29tbWFuZH1gO1xuXG4gIGxldCBwYXJhbXMgPSBcIlwiO1xuICBpZiAob3B0aW9ucy5sYXVuY2hUeXBlKSB7XG4gICAgcGFyYW1zICs9IFwiJmxhdW5jaFR5cGU9XCIgKyBlbmNvZGVVUklDb21wb25lbnQob3B0aW9ucy5sYXVuY2hUeXBlKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmFyZ3VtZW50cykge1xuICAgIHBhcmFtcyArPSBcIiZhcmd1bWVudHM9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5hcmd1bWVudHMpKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmNvbnRleHQpIHtcbiAgICBwYXJhbXMgKz0gXCImY29udGV4dD1cIiArIGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShvcHRpb25zLmNvbnRleHQpKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmZhbGxiYWNrVGV4dCkge1xuICAgIHBhcmFtcyArPSBcIiZmYWxsYmFja1RleHQ9XCIgKyBlbmNvZGVVUklDb21wb25lbnQob3B0aW9ucy5mYWxsYmFja1RleHQpO1xuICB9XG5cbiAgaWYgKHBhcmFtcykge1xuICAgIHVybCArPSBcIj9cIiArIHBhcmFtcy5zdWJzdHJpbmcoMSk7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWVwbGluayB0byBhIHNjcmlwdCBjb21tYW5kIG9yIGV4dGVuc2lvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlZXBsaW5rKG9wdGlvbnM6IENyZWF0ZURlZXBsaW5rT3B0aW9ucyk6IHN0cmluZyB7XG4gIGlmIChvcHRpb25zLnR5cGUgPT09IERlZXBsaW5rVHlwZS5TY3JpcHRDb21tYW5kKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVNjcmlwdENvbW1hbmREZWVwbGluayhvcHRpb25zKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY3JlYXRlRXh0ZW5zaW9uRGVlcGxpbmsob3B0aW9ucyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBiYXNlRXhlY3V0ZVNRTCB9IGZyb20gXCIuL3NxbC11dGlsc1wiO1xuXG4vKipcbiAqIEV4ZWN1dGVzIGEgU1FMIHF1ZXJ5IG9uIGEgbG9jYWwgU1FMaXRlIGRhdGFiYXNlIGFuZCByZXR1cm5zIHRoZSBxdWVyeSByZXN1bHQgaW4gSlNPTiBmb3JtYXQuXG4gKlxuICogQHBhcmFtIGRhdGFiYXNlUGF0aCAtIFRoZSBwYXRoIHRvIHRoZSBTUUxpdGUgZGF0YWJhc2UgZmlsZS5cbiAqIEBwYXJhbSBxdWVyeSAtIFRoZSBTUUwgcXVlcnkgdG8gZXhlY3V0ZS5cbiAqIEByZXR1cm5zIEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIHRoZSBxdWVyeSByZXN1bHRzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBjbG9zZU1haW5XaW5kb3csIENsaXBib2FyZCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IGV4ZWN1dGVTUUwgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiB0eXBlIE1lc3NhZ2UgPSB7IGJvZHk6IHN0cmluZzsgY29kZTogc3RyaW5nIH07XG4gKlxuICogY29uc3QgREJfUEFUSCA9IFwiL3BhdGgvdG8vY2hhdC5kYlwiO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IHF1ZXJ5ID0gYFNFTEVDVCBib2R5LCBjb2RlIEZST00gLi4uYFxuICpcbiAqICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBleGVjdXRlU1FMPE1lc3NhZ2U+KERCX1BBVEgsIHF1ZXJ5KTtcbiAqXG4gKiAgIGlmIChtZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gKiAgICAgY29uc3QgbGF0ZXN0Q29kZSA9IG1lc3NhZ2VzWzBdLmNvZGU7XG4gKiAgICAgYXdhaXQgQ2xpcGJvYXJkLnBhc3RlKGxhdGVzdENvZGUpO1xuICogICAgIGF3YWl0IGNsb3NlTWFpbldpbmRvdygpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVTUUw8VCA9IHVua25vd24+KGRhdGFiYXNlUGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nKSB7XG4gIHJldHVybiBiYXNlRXhlY3V0ZVNRTDxUPihkYXRhYmFzZVBhdGgsIHF1ZXJ5KTtcbn1cbiIsICJpbXBvcnQgY2hpbGRQcm9jZXNzIGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7XG4gIGRlZmF1bHRQYXJzaW5nLFxuICBnZXRTcGF3bmVkUHJvbWlzZSxcbiAgZ2V0U3Bhd25lZFJlc3VsdCxcbiAgaGFuZGxlT3V0cHV0LFxuICBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyLFxufSBmcm9tIFwiLi9leGVjLXV0aWxzXCI7XG5cbnR5cGUgQXBwbGVTY3JpcHRPcHRpb25zID0ge1xuICAvKipcbiAgICogQnkgZGVmYXVsdCwgYHJ1bkFwcGxlU2NyaXB0YCByZXR1cm5zIGl0cyByZXN1bHRzIGluIGh1bWFuLXJlYWRhYmxlIGZvcm06IHN0cmluZ3MgZG8gbm90IGhhdmUgcXVvdGVzIGFyb3VuZCB0aGVtLCBjaGFyYWN0ZXJzIGFyZSBub3QgZXNjYXBlZCwgYnJhY2VzIGZvciBsaXN0cyBhbmQgcmVjb3JkcyBhcmUgb21pdHRlZCwgZXRjLiBUaGlzIGlzIGdlbmVyYWxseSBtb3JlIHVzZWZ1bCwgYnV0IGNhbiBpbnRyb2R1Y2UgYW1iaWd1aXRpZXMuIEZvciBleGFtcGxlLCB0aGUgbGlzdHMgYHtcImZvb1wiLCBcImJhclwifWAgYW5kIGB7e1wiZm9vXCIsIHtcImJhclwifX19YCB3b3VsZCBib3RoIGJlIGRpc3BsYXllZCBhcyDigJhmb28sIGJhcuKAmS4gVG8gc2VlIHRoZSByZXN1bHRzIGluIGFuIHVuYW1iaWd1b3VzIGZvcm0gdGhhdCBjb3VsZCBiZSByZWNvbXBpbGVkIGludG8gdGhlIHNhbWUgdmFsdWUsIHNldCBgaHVtYW5SZWFkYWJsZU91dHB1dGAgdG8gYGZhbHNlYC5cbiAgICpcbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgaHVtYW5SZWFkYWJsZU91dHB1dD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBzY3JpcHQgaXMgdXNpbmcgW2BBcHBsZVNjcmlwdGBdKGh0dHBzOi8vZGV2ZWxvcGVyLmFwcGxlLmNvbS9saWJyYXJ5L2FyY2hpdmUvZG9jdW1lbnRhdGlvbi9BcHBsZVNjcmlwdC9Db25jZXB0dWFsL0FwcGxlU2NyaXB0TGFuZ0d1aWRlL2ludHJvZHVjdGlvbi9BU0xSX2ludHJvLmh0bWwjLy9hcHBsZV9yZWYvZG9jL3VpZC9UUDQwMDAwOTgzKSBvciBbYEphdmFTY3JpcHRgXShodHRwczovL2RldmVsb3Blci5hcHBsZS5jb20vbGlicmFyeS9hcmNoaXZlL3JlbGVhc2Vub3Rlcy9JbnRlcmFwcGxpY2F0aW9uQ29tbXVuaWNhdGlvbi9STi1KYXZhU2NyaXB0Rm9yQXV0b21hdGlvbi9BcnRpY2xlcy9JbnRyb2R1Y3Rpb24uaHRtbCMvL2FwcGxlX3JlZi9kb2MvdWlkL1RQNDAwMTQ1MDgtQ0gxMTEtU1cxKS5cbiAgICpcbiAgICogQGRlZmF1bHQgXCJBcHBsZVNjcmlwdFwiXG4gICAqL1xuICBsYW5ndWFnZT86IFwiQXBwbGVTY3JpcHRcIiB8IFwiSmF2YVNjcmlwdFwiO1xuICAvKipcbiAgICogQSBTaWduYWwgb2JqZWN0IHRoYXQgYWxsb3dzIHlvdSB0byBhYm9ydCB0aGUgcmVxdWVzdCBpZiByZXF1aXJlZCB2aWEgYW4gQWJvcnRDb250cm9sbGVyIG9iamVjdC5cbiAgICovXG4gIHNpZ25hbD86IEFib3J0U2lnbmFsO1xuICAvKiogSWYgdGltZW91dCBpcyBncmVhdGVyIHRoYW4gYDBgLCB0aGUgcGFyZW50IHdpbGwgc2VuZCB0aGUgc2lnbmFsIGBTSUdURVJNYCBpZiB0aGUgY2hpbGQgcnVucyBsb25nZXIgdGhhbiB0aW1lb3V0IG1pbGxpc2Vjb25kcy5cbiAgICpcbiAgICogQGRlZmF1bHQgMTAwMDBcbiAgICovXG4gIHRpbWVvdXQ/OiBudW1iZXI7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGVzIGFuIEFwcGxlU2NyaXB0IHNjcmlwdC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgc2hvd0hVRCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHJ1bkFwcGxlU2NyaXB0LCBzaG93RmFpbHVyZVRvYXN0IH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKCkge1xuICogICB0cnkge1xuICogICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJ1bkFwcGxlU2NyaXB0KFxuICogICAgICAgYFxuICogICAgICAgb24gcnVuIGFyZ3ZcbiAqICAgICAgICAgcmV0dXJuIFwiaGVsbG8sIFwiICYgaXRlbSAxIG9mIGFyZ3YgJiBcIi5cIlxuICogICAgICAgZW5kIHJ1blxuICogICAgICAgYCxcbiAqICAgICAgIFtcIndvcmxkXCJdXG4gKiAgICAgKTtcbiAqICAgICBhd2FpdCBzaG93SFVEKHJlcyk7XG4gKiAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgICAgc2hvd0ZhaWx1cmVUb2FzdChlcnJvciwgeyB0aXRsZTogXCJDb3VsZCBub3QgcnVuIEFwcGxlU2NyaXB0XCIgfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuQXBwbGVTY3JpcHQ8VCA9IHN0cmluZz4oXG4gIHNjcmlwdDogc3RyaW5nLFxuICBvcHRpb25zPzogQXBwbGVTY3JpcHRPcHRpb25zICYge1xuICAgIHBhcnNlT3V0cHV0PzogUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBzdHJpbmcsIEFwcGxlU2NyaXB0T3B0aW9ucz47XG4gIH0sXG4pOiBQcm9taXNlPHN0cmluZz47XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuQXBwbGVTY3JpcHQ8VCA9IHN0cmluZz4oXG4gIHNjcmlwdDogc3RyaW5nLFxuICAvKipcbiAgICogVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBzY3JpcHQuXG4gICAqL1xuICBhcmdzOiBzdHJpbmdbXSxcbiAgb3B0aW9ucz86IEFwcGxlU2NyaXB0T3B0aW9ucyAmIHtcbiAgICBwYXJzZU91dHB1dD86IFBhcnNlRXhlY091dHB1dEhhbmRsZXI8VCwgc3RyaW5nLCBBcHBsZVNjcmlwdE9wdGlvbnM+O1xuICB9LFxuKTogUHJvbWlzZTxzdHJpbmc+O1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkFwcGxlU2NyaXB0PFQgPSBzdHJpbmc+KFxuICBzY3JpcHQ6IHN0cmluZyxcbiAgb3B0aW9uc09yQXJncz86XG4gICAgfCBzdHJpbmdbXVxuICAgIHwgKEFwcGxlU2NyaXB0T3B0aW9ucyAmIHtcbiAgICAgICAgcGFyc2VPdXRwdXQ/OiBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFQsIHN0cmluZywgQXBwbGVTY3JpcHRPcHRpb25zPjtcbiAgICAgIH0pLFxuICBvcHRpb25zPzogQXBwbGVTY3JpcHRPcHRpb25zICYge1xuICAgIHBhcnNlT3V0cHV0PzogUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBzdHJpbmcsIEFwcGxlU2NyaXB0T3B0aW9ucz47XG4gIH0sXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gXCJkYXJ3aW5cIikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkFwcGxlU2NyaXB0IGlzIG9ubHkgc3VwcG9ydGVkIG9uIG1hY09TXCIpO1xuICB9XG5cbiAgY29uc3QgeyBodW1hblJlYWRhYmxlT3V0cHV0LCBsYW5ndWFnZSwgdGltZW91dCwgLi4uZXhlY09wdGlvbnMgfSA9IEFycmF5LmlzQXJyYXkob3B0aW9uc09yQXJncylcbiAgICA/IG9wdGlvbnMgfHwge31cbiAgICA6IG9wdGlvbnNPckFyZ3MgfHwge307XG5cbiAgY29uc3Qgb3V0cHV0QXJndW1lbnRzID0gaHVtYW5SZWFkYWJsZU91dHB1dCAhPT0gZmFsc2UgPyBbXSA6IFtcIi1zc1wiXTtcbiAgaWYgKGxhbmd1YWdlID09PSBcIkphdmFTY3JpcHRcIikge1xuICAgIG91dHB1dEFyZ3VtZW50cy5wdXNoKFwiLWxcIiwgXCJKYXZhU2NyaXB0XCIpO1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KG9wdGlvbnNPckFyZ3MpKSB7XG4gICAgb3V0cHV0QXJndW1lbnRzLnB1c2goXCItXCIsIC4uLm9wdGlvbnNPckFyZ3MpO1xuICB9XG5cbiAgY29uc3Qgc3Bhd25lZCA9IGNoaWxkUHJvY2Vzcy5zcGF3bihcIm9zYXNjcmlwdFwiLCBvdXRwdXRBcmd1bWVudHMsIHtcbiAgICAuLi5leGVjT3B0aW9ucyxcbiAgICBlbnY6IHsgUEFUSDogXCIvdXNyL2xvY2FsL2JpbjovdXNyL2JpbjovYmluOi91c3Ivc2Jpbjovc2JpblwiIH0sXG4gIH0pO1xuICBjb25zdCBzcGF3bmVkUHJvbWlzZSA9IGdldFNwYXduZWRQcm9taXNlKHNwYXduZWQsIHsgdGltZW91dDogdGltZW91dCA/PyAxMDAwMCB9KTtcblxuICBzcGF3bmVkLnN0ZGluLmVuZChzY3JpcHQpO1xuXG4gIGNvbnN0IFt7IGVycm9yLCBleGl0Q29kZSwgc2lnbmFsLCB0aW1lZE91dCB9LCBzdGRvdXRSZXN1bHQsIHN0ZGVyclJlc3VsdF0gPSBhd2FpdCBnZXRTcGF3bmVkUmVzdWx0PHN0cmluZz4oXG4gICAgc3Bhd25lZCxcbiAgICB7IGVuY29kaW5nOiBcInV0ZjhcIiB9LFxuICAgIHNwYXduZWRQcm9taXNlLFxuICApO1xuICBjb25zdCBzdGRvdXQgPSBoYW5kbGVPdXRwdXQoeyBzdHJpcEZpbmFsTmV3bGluZTogdHJ1ZSB9LCBzdGRvdXRSZXN1bHQpO1xuICBjb25zdCBzdGRlcnIgPSBoYW5kbGVPdXRwdXQoeyBzdHJpcEZpbmFsTmV3bGluZTogdHJ1ZSB9LCBzdGRlcnJSZXN1bHQpO1xuXG4gIHJldHVybiBkZWZhdWx0UGFyc2luZyh7XG4gICAgc3Rkb3V0LFxuICAgIHN0ZGVycixcbiAgICBlcnJvcixcbiAgICBleGl0Q29kZSxcbiAgICBzaWduYWwsXG4gICAgdGltZWRPdXQsXG4gICAgY29tbWFuZDogXCJvc2FzY3JpcHRcIixcbiAgICBvcHRpb25zLFxuICAgIHBhcmVudEVycm9yOiBuZXcgRXJyb3IoKSxcbiAgfSk7XG59XG4iLCAiaW1wb3J0IGNoaWxkUHJvY2VzcyBmcm9tIFwibm9kZTpjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQge1xuICBkZWZhdWx0UGFyc2luZyxcbiAgZ2V0U3Bhd25lZFByb21pc2UsXG4gIGdldFNwYXduZWRSZXN1bHQsXG4gIGhhbmRsZU91dHB1dCxcbiAgUGFyc2VFeGVjT3V0cHV0SGFuZGxlcixcbn0gZnJvbSBcIi4vZXhlYy11dGlsc1wiO1xuXG50eXBlIFBvd2VyU2hlbGxTY3JpcHRPcHRpb25zID0ge1xuICAvKipcbiAgICogQSBTaWduYWwgb2JqZWN0IHRoYXQgYWxsb3dzIHlvdSB0byBhYm9ydCB0aGUgcmVxdWVzdCBpZiByZXF1aXJlZCB2aWEgYW4gQWJvcnRDb250cm9sbGVyIG9iamVjdC5cbiAgICovXG4gIHNpZ25hbD86IEFib3J0U2lnbmFsO1xuICAvKiogSWYgdGltZW91dCBpcyBncmVhdGVyIHRoYW4gYDBgLCB0aGUgcGFyZW50IHdpbGwgc2VuZCB0aGUgc2lnbmFsIGBTSUdURVJNYCBpZiB0aGUgY2hpbGQgcnVucyBsb25nZXIgdGhhbiB0aW1lb3V0IG1pbGxpc2Vjb25kcy5cbiAgICpcbiAgICogQGRlZmF1bHQgMTAwMDBcbiAgICovXG4gIHRpbWVvdXQ/OiBudW1iZXI7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGVzIGEgUG93ZXJTaGVsbCBzY3JpcHQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IHNob3dIVUQgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG4gKiBpbXBvcnQgeyBydW5Qb3dlclNoZWxsU2NyaXB0LCBzaG93RmFpbHVyZVRvYXN0IH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKCkge1xuICogICB0cnkge1xuICogICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJ1blBvd2VyU2hlbGxTY3JpcHQoXG4gKiAgICAgICBgXG4gKiAgICAgICBXcml0ZS1Ib3N0IFwiaGVsbG8sIHdvcmxkLlwiXG4gKiAgICAgICBgLFxuICogICAgICk7XG4gKiAgICAgYXdhaXQgc2hvd0hVRChyZXMpO1xuICogICB9IGNhdGNoIChlcnJvcikge1xuICogICAgIHNob3dGYWlsdXJlVG9hc3QoZXJyb3IsIHsgdGl0bGU6IFwiQ291bGQgbm90IHJ1biBQb3dlclNoZWxsXCIgfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuUG93ZXJTaGVsbFNjcmlwdDxUID0gc3RyaW5nPihcbiAgc2NyaXB0OiBzdHJpbmcsXG4gIG9wdGlvbnM/OiBQb3dlclNoZWxsU2NyaXB0T3B0aW9ucyAmIHtcbiAgICBwYXJzZU91dHB1dD86IFBhcnNlRXhlY091dHB1dEhhbmRsZXI8VCwgc3RyaW5nLCBQb3dlclNoZWxsU2NyaXB0T3B0aW9ucz47XG4gIH0sXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gXCJ3aW4zMlwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUG93ZXJTaGVsbCBpcyBvbmx5IHN1cHBvcnRlZCBvbiBXaW5kb3dzXCIpO1xuICB9XG5cbiAgY29uc3QgeyB0aW1lb3V0LCAuLi5leGVjT3B0aW9ucyB9ID0gb3B0aW9ucyB8fCB7fTtcblxuICBjb25zdCBvdXRwdXRBcmd1bWVudHMgPSBbXCItTm9Mb2dvXCIsIFwiLU5vUHJvZmlsZVwiLCBcIi1Ob25JbnRlcmFjdGl2ZVwiLCBcIi1Db21tYW5kXCIsIFwiLVwiXTtcblxuICBjb25zdCBzcGF3bmVkID0gY2hpbGRQcm9jZXNzLnNwYXduKFwicG93ZXJzaGVsbC5leGVcIiwgb3V0cHV0QXJndW1lbnRzLCB7XG4gICAgLi4uZXhlY09wdGlvbnMsXG4gIH0pO1xuICBjb25zdCBzcGF3bmVkUHJvbWlzZSA9IGdldFNwYXduZWRQcm9taXNlKHNwYXduZWQsIHsgdGltZW91dDogdGltZW91dCA/PyAxMDAwMCB9KTtcblxuICBzcGF3bmVkLnN0ZGluLmVuZChzY3JpcHQpO1xuXG4gIGNvbnN0IFt7IGVycm9yLCBleGl0Q29kZSwgc2lnbmFsLCB0aW1lZE91dCB9LCBzdGRvdXRSZXN1bHQsIHN0ZGVyclJlc3VsdF0gPSBhd2FpdCBnZXRTcGF3bmVkUmVzdWx0PHN0cmluZz4oXG4gICAgc3Bhd25lZCxcbiAgICB7IGVuY29kaW5nOiBcInV0ZjhcIiB9LFxuICAgIHNwYXduZWRQcm9taXNlLFxuICApO1xuICBjb25zdCBzdGRvdXQgPSBoYW5kbGVPdXRwdXQoeyBzdHJpcEZpbmFsTmV3bGluZTogdHJ1ZSB9LCBzdGRvdXRSZXN1bHQpO1xuICBjb25zdCBzdGRlcnIgPSBoYW5kbGVPdXRwdXQoeyBzdHJpcEZpbmFsTmV3bGluZTogdHJ1ZSB9LCBzdGRlcnJSZXN1bHQpO1xuXG4gIHJldHVybiBkZWZhdWx0UGFyc2luZyh7XG4gICAgc3Rkb3V0LFxuICAgIHN0ZGVycixcbiAgICBlcnJvcixcbiAgICBleGl0Q29kZSxcbiAgICBzaWduYWwsXG4gICAgdGltZWRPdXQsXG4gICAgY29tbWFuZDogXCJwb3dlcnNoZWxsLmV4ZVwiLFxuICAgIG9wdGlvbnMsXG4gICAgcGFyZW50RXJyb3I6IG5ldyBFcnJvcigpLFxuICB9KTtcbn1cbiIsICJpbXBvcnQgeyBDYWNoZSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IGhhc2gsIHJlcGxhY2VyLCByZXZpdmVyIH0gZnJvbSBcIi4vaGVscGVyc1wiO1xuXG4vKipcbiAqIFdyYXBzIGEgZnVuY3Rpb24gd2l0aCBjYWNoaW5nIGZ1bmN0aW9uYWxpdHkgdXNpbmcgUmF5Y2FzdCdzIENhY2hlIEFQSS5cbiAqIEFsbG93cyBmb3IgY2FjaGluZyBvZiBleHBlbnNpdmUgZnVuY3Rpb25zIGxpa2UgcGFnaW5hdGVkIEFQSSBjYWxscyB0aGF0IHJhcmVseSBjaGFuZ2UuXG4gKlxuICogQHBhcmFtIGZuIC0gVGhlIGFzeW5jIGZ1bmN0aW9uIHRvIGNhY2hlIHJlc3VsdHMgZnJvbVxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25hbCBjb25maWd1cmF0aW9uIGZvciB0aGUgY2FjaGUgYmVoYXZpb3JcbiAqIEBwYXJhbSBvcHRpb25zLnZhbGlkYXRlIC0gT3B0aW9uYWwgdmFsaWRhdGlvbiBmdW5jdGlvbiBmb3IgY2FjaGVkIGRhdGFcbiAqIEBwYXJhbSBvcHRpb25zLm1heEFnZSAtIE1heGltdW0gYWdlIG9mIGNhY2hlZCBkYXRhIGluIG1pbGxpc2Vjb25kc1xuICogQHJldHVybnMgQW4gYXN5bmMgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSByZXN1bHQgb2YgdGhlIGZ1bmN0aW9uLCBlaXRoZXIgZnJvbSBjYWNoZSBvciBmcmVzaCBleGVjdXRpb25cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGNvbnN0IGNhY2hlZEZ1bmN0aW9uID0gd2l0aENhY2hlKGZldGNoRXhwZW5zaXZlRGF0YSwge1xuICogICBtYXhBZ2U6IDUgKiA2MCAqIDEwMDAgLy8gQ2FjaGUgZm9yIDUgbWludXRlc1xuICogfSk7XG4gKlxuICogY29uc3QgcmVzdWx0ID0gYXdhaXQgY2FjaGVkRnVuY3Rpb24ocXVlcnkpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoQ2FjaGU8Rm4gZXh0ZW5kcyAoLi4uYXJnczogYW55KSA9PiBQcm9taXNlPGFueT4+KFxuICBmbjogRm4sXG4gIG9wdGlvbnM/OiB7XG4gICAgLyoqIGZ1bmN0aW9uIHRoYXQgcmVjZWl2ZXMgdGhlIGNhY2hlZCBkYXRhIGFuZCByZXR1cm5zIGEgYm9vbGVhbiBkZXBlbmRpbmcgb24gd2hldGhlciB0aGUgZGF0YSBpcyBzdGlsbCB2YWxpZCBvciBub3QuICovXG4gICAgdmFsaWRhdGU/OiAoZGF0YTogQXdhaXRlZDxSZXR1cm5UeXBlPEZuPj4pID0+IGJvb2xlYW47XG4gICAgLyoqIE1heGltdW0gYWdlIG9mIGNhY2hlZCBkYXRhIGluIG1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgZGF0YSB3aWxsIGJlIGNvbnNpZGVyZWQgaW52YWxpZCAqL1xuICAgIG1heEFnZT86IG51bWJlcjtcbiAgfSxcbik6IEZuICYgeyBjbGVhckNhY2hlOiAoKSA9PiB2b2lkIH0ge1xuICBjb25zdCBjYWNoZSA9IG5ldyBDYWNoZSh7IG5hbWVzcGFjZTogaGFzaChmbikgfSk7XG5cbiAgY29uc3Qgd3JhcHBlZEZuID0gYXN5bmMgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rm4+KSA9PiB7XG4gICAgY29uc3Qga2V5ID1cbiAgICAgIGhhc2goYXJncyB8fCBbXSkgKyAob3B0aW9ucyBhcyB1bmtub3duIGFzIHsgaW50ZXJuYWxfY2FjaGVLZXlTdWZmaXg/OiBzdHJpbmcgfSk/LmludGVybmFsX2NhY2hlS2V5U3VmZml4O1xuICAgIGNvbnN0IGNhY2hlZCA9IGNhY2hlLmdldChrZXkpO1xuICAgIGlmIChjYWNoZWQpIHtcbiAgICAgIGNvbnN0IHsgZGF0YSwgdGltZXN0YW1wIH0gPSBKU09OLnBhcnNlKGNhY2hlZCwgcmV2aXZlcik7XG4gICAgICBjb25zdCBpc0V4cGlyZWQgPSBvcHRpb25zPy5tYXhBZ2UgJiYgRGF0ZS5ub3coKSAtIHRpbWVzdGFtcCA+IG9wdGlvbnMubWF4QWdlO1xuICAgICAgaWYgKCFpc0V4cGlyZWQgJiYgKCFvcHRpb25zPy52YWxpZGF0ZSB8fCBvcHRpb25zLnZhbGlkYXRlKGRhdGEpKSkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZuKC4uLmFyZ3MpO1xuICAgIGNhY2hlLnNldChcbiAgICAgIGtleSxcbiAgICAgIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICB7XG4gICAgICAgICAgZGF0YTogcmVzdWx0LFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVwbGFjZXIsXG4gICAgICApLFxuICAgICk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICB3cmFwcGVkRm4uY2xlYXJDYWNoZSA9ICgpID0+IHtcbiAgICBjYWNoZS5jbGVhcigpO1xuICB9O1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdG9vIGNvbXBsZXggZm9yIFRTXG4gIHJldHVybiB3cmFwcGVkRm47XG59XG4iLCAiaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgdXNlU2VsZWN0ZWRWYXVsdEl0ZW0gfSBmcm9tIFwifi9jb21wb25lbnRzL3NlYXJjaFZhdWx0L2NvbnRleHQvdmF1bHRJdGVtXCI7XG5pbXBvcnQgdXNlUmVwcm9tcHQgZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlUmVwcm9tcHRcIjtcblxuZXhwb3J0IHR5cGUgQWN0aW9uV2l0aFJlcHJvbXB0UHJvcHMgPSBPbWl0PEFjdGlvbi5Qcm9wcywgXCJvbkFjdGlvblwiPiAmIHtcbiAgcmVwcm9tcHREZXNjcmlwdGlvbj86IHN0cmluZztcbiAgb25BY3Rpb246ICgpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xufTtcblxuZnVuY3Rpb24gQWN0aW9uV2l0aFJlcHJvbXB0KHByb3BzOiBBY3Rpb25XaXRoUmVwcm9tcHRQcm9wcykge1xuICBjb25zdCB7IHJlcHJvbXB0RGVzY3JpcHRpb24sIG9uQWN0aW9uLCAuLi5jb21wb25lbnRQcm9wcyB9ID0gcHJvcHM7XG4gIGNvbnN0IHsgcmVwcm9tcHQgfSA9IHVzZVNlbGVjdGVkVmF1bHRJdGVtKCk7XG4gIGNvbnN0IHJlcHJvbXB0QW5kUGVyZm9ybUFjdGlvbiA9IHVzZVJlcHJvbXB0KG9uQWN0aW9uLCB7IGRlc2NyaXB0aW9uOiByZXByb21wdERlc2NyaXB0aW9uIH0pO1xuXG4gIHJldHVybiA8QWN0aW9uIHsuLi5jb21wb25lbnRQcm9wc30gb25BY3Rpb249e3JlcHJvbXB0ID8gcmVwcm9tcHRBbmRQZXJmb3JtQWN0aW9uIDogb25BY3Rpb259IC8+O1xufVxuXG5leHBvcnQgZGVmYXVsdCBBY3Rpb25XaXRoUmVwcm9tcHQ7XG4iLCAiaW1wb3J0IHsgY3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgSXRlbSB9IGZyb20gXCJ+L3R5cGVzL3ZhdWx0XCI7XG5cbmNvbnN0IFZhdWx0SXRlbUNvbnRleHQgPSBjcmVhdGVDb250ZXh0PEl0ZW0gfCBudWxsPihudWxsKTtcblxuZXhwb3J0IGNvbnN0IHVzZVNlbGVjdGVkVmF1bHRJdGVtID0gKCkgPT4ge1xuICBjb25zdCBzZXNzaW9uID0gdXNlQ29udGV4dChWYXVsdEl0ZW1Db250ZXh0KTtcbiAgaWYgKHNlc3Npb24gPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcInVzZVNlbGVjdFZhdWx0SXRlbSBtdXN0IGJlIHVzZWQgd2l0aGluIGEgVmF1bHRJdGVtQ29udGV4dC5Qcm92aWRlclwiKTtcbiAgfVxuXG4gIHJldHVybiBzZXNzaW9uO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVmF1bHRJdGVtQ29udGV4dDtcbiIsICJpbXBvcnQgeyBzaG93VG9hc3QsIFRvYXN0LCB1c2VOYXZpZ2F0aW9uIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IFJlcHJvbXB0Rm9ybSBmcm9tIFwifi9jb21wb25lbnRzL1JlcHJvbXB0Rm9ybVwiO1xuaW1wb3J0IHsgdXNlU2Vzc2lvbiB9IGZyb20gXCJ+L2NvbnRleHQvc2Vzc2lvblwiO1xuXG5leHBvcnQgdHlwZSBVc2VyUmVwcm9tcHRBY3Rpb25Qcm9wID0geyBjbG9zZUZvcm06ICgpID0+IHZvaWQgfTtcbmV4cG9ydCB0eXBlIFVzZVJlcHJvbXB0QWN0aW9uID0gKHByb3BzOiBVc2VyUmVwcm9tcHRBY3Rpb25Qcm9wKSA9PiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPjtcblxuZXhwb3J0IHR5cGUgVXNlUmVwcm9tcHRPcHRpb25zID0ge1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIGZvciBhbiBBY3Rpb24gdGhhdCB3aWxsIG5hdmlnYXRlIHRvIHRoZSB7QGxpbmsgUmVwcm9tcHRGb3JtfS5cbiAqIFRoZSBwYXNzd29yZCBpcyBub3QgY29uZmlybSBpbiB0aGlzIGhvb2ssIG9ubHkgcGFzc2VkIGRvd24gdG8gdGhlIGFjdGlvbi5cbiAqL1xuZnVuY3Rpb24gdXNlUmVwcm9tcHQoYWN0aW9uOiAoKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPiwgb3B0aW9ucz86IFVzZVJlcHJvbXB0T3B0aW9ucykge1xuICBjb25zdCB7IGRlc2NyaXB0aW9uID0gXCJQZXJmb3JtaW5nIGFuIGFjdGlvbiB0aGF0IHJlcXVpcmVzIHRoZSBtYXN0ZXIgcGFzc3dvcmRcIiB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgY29uc3Qgc2Vzc2lvbiA9IHVzZVNlc3Npb24oKTtcbiAgY29uc3QgeyBwdXNoLCBwb3AgfSA9IHVzZU5hdmlnYXRpb24oKTtcblxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVDb25maXJtKHBhc3N3b3JkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBpc1Bhc3N3b3JkQ29ycmVjdCA9IGF3YWl0IHNlc3Npb24uY29uZmlybU1hc3RlclBhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICBpZiAoIWlzUGFzc3dvcmRDb3JyZWN0KSB7XG4gICAgICBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuRmFpbHVyZSwgXCJGYWlsZWQgdG8gdW5sb2NrIHZhdWx0XCIsIFwiQ2hlY2sgeW91ciBjcmVkZW50aWFsc1wiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcG9wKCk7XG5cbiAgICAvKiB1c2luZyBhIHNldFRpbWVvdXQgaGVyZSBmaXhlcyBhIGJ1ZyB3aGVyZSB0aGUgUmVwcm9tcHRGb3JtIGZsYXNoZXMgd2hlbiB5b3UgcG9wIGJhY2sgdG8gdGhlIHByZXZpb3VzIHNjcmVlbi4gXG4gICAgVGhpcyBjb21lcyB3aXRoIHRoZSB0cmFkZS1vZmYgb2YgYSB0aW55IHZpc2libGUgZGVsYXkgYmV0d2VlbiB0aGUgUmVwcm9tcHRGb3JtIHBvcCBhbmQgdGhlIGFjdGlvbiBwdXNoaW5nIGEgbmV3IHNjcmVlbiAqL1xuICAgIHNldFRpbWVvdXQoYWN0aW9uLCAxKTtcbiAgfVxuXG4gIHJldHVybiAoKSA9PiBwdXNoKDxSZXByb21wdEZvcm0gZGVzY3JpcHRpb249e2Rlc2NyaXB0aW9ufSBvbkNvbmZpcm09e2hhbmRsZUNvbmZpcm19IC8+KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdXNlUmVwcm9tcHQ7XG4iLCAiaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25QYW5lbCwgRm9ybSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcblxuZXhwb3J0IHR5cGUgUmVwcm9tcHRGb3JtUHJvcHMgPSB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIG9uQ29uZmlybTogKHBhc3N3b3JkOiBzdHJpbmcpID0+IHZvaWQ7XG59O1xuXG5jb25zdCBSZXByb21wdEZvcm0gPSAocHJvcHM6IFJlcHJvbXB0Rm9ybVByb3BzKSA9PiB7XG4gIGNvbnN0IHsgZGVzY3JpcHRpb24sIG9uQ29uZmlybSB9ID0gcHJvcHM7XG5cbiAgZnVuY3Rpb24gb25TdWJtaXQodmFsdWVzOiB7IHBhc3N3b3JkOiBzdHJpbmcgfSkge1xuICAgIG9uQ29uZmlybSh2YWx1ZXMucGFzc3dvcmQpO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Rm9ybVxuICAgICAgbmF2aWdhdGlvblRpdGxlPVwiQ29uZmlybWF0aW9uIFJlcXVpcmVkXCJcbiAgICAgIGFjdGlvbnM9e1xuICAgICAgICA8QWN0aW9uUGFuZWw+XG4gICAgICAgICAgPEFjdGlvbi5TdWJtaXRGb3JtIHRpdGxlPVwiQ29uZmlybVwiIG9uU3VibWl0PXtvblN1Ym1pdH0gLz5cbiAgICAgICAgPC9BY3Rpb25QYW5lbD5cbiAgICAgIH1cbiAgICA+XG4gICAgICA8Rm9ybS5EZXNjcmlwdGlvbiB0aXRsZT1cIkNvbmZpcm1hdGlvbiBSZXF1aXJlZCBmb3JcIiB0ZXh0PXtkZXNjcmlwdGlvbn0gLz5cbiAgICAgIDxGb3JtLlBhc3N3b3JkRmllbGQgYXV0b0ZvY3VzIGlkPVwicGFzc3dvcmRcIiB0aXRsZT1cIk1hc3RlciBQYXNzd29yZFwiIC8+XG4gICAgPC9Gb3JtPlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUmVwcm9tcHRGb3JtO1xuIiwgImltcG9ydCB7IExvY2FsU3RvcmFnZSwgZ2V0UHJlZmVyZW5jZVZhbHVlcyB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIFByb3BzV2l0aENoaWxkcmVuLCBSZWFjdE5vZGUsIHVzZUNvbnRleHQsIHVzZU1lbW8sIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFVubG9ja0Zvcm0gZnJvbSBcIn4vY29tcG9uZW50cy9VbmxvY2tGb3JtXCI7XG5pbXBvcnQgeyBWYXVsdExvYWRpbmdGYWxsYmFjayB9IGZyb20gXCJ+L2NvbXBvbmVudHMvc2VhcmNoVmF1bHQvVmF1bHRMb2FkaW5nRmFsbGJhY2tcIjtcbmltcG9ydCB7IExPQ0FMX1NUT1JBR0VfS0VZLCBWQVVMVF9MT0NLX01FU1NBR0VTIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcbmltcG9ydCB7IFZBVUxUX1RJTUVPVVQgfSBmcm9tIFwifi9jb25zdGFudHMvcHJlZmVyZW5jZXNcIjtcbmltcG9ydCB7IHVzZUJpdHdhcmRlbiB9IGZyb20gXCJ+L2NvbnRleHQvYml0d2FyZGVuXCI7XG5pbXBvcnQgeyB1c2VTZXNzaW9uUmVkdWNlciB9IGZyb20gXCJ+L2NvbnRleHQvc2Vzc2lvbi9yZWR1Y2VyXCI7XG5pbXBvcnQge1xuICBjaGVja1N5c3RlbUxvY2tlZFNpbmNlTGFzdEFjY2VzcyxcbiAgY2hlY2tTeXN0ZW1TbGVwdFNpbmNlTGFzdEFjY2VzcyxcbiAgU2Vzc2lvblN0b3JhZ2UsXG59IGZyb20gXCJ+L2NvbnRleHQvc2Vzc2lvbi91dGlsc1wiO1xuaW1wb3J0IHsgU2Vzc2lvblN0YXRlIH0gZnJvbSBcIn4vdHlwZXMvc2Vzc2lvblwiO1xuaW1wb3J0IHsgQ2FjaGUgfSBmcm9tIFwifi91dGlscy9jYWNoZVwiO1xuaW1wb3J0IHsgY2FwdHVyZUV4Y2VwdGlvbiB9IGZyb20gXCJ+L3V0aWxzL2RldmVsb3BtZW50XCI7XG5pbXBvcnQgdXNlT25jZUVmZmVjdCBmcm9tIFwifi91dGlscy9ob29rcy91c2VPbmNlRWZmZWN0XCI7XG5pbXBvcnQgeyBoYXNoTWFzdGVyUGFzc3dvcmRGb3JSZXByb21wdGluZyB9IGZyb20gXCJ+L3V0aWxzL3Bhc3N3b3Jkc1wiO1xuaW1wb3J0IHsgcGxhdGZvcm0gfSBmcm9tIFwifi91dGlscy9wbGF0Zm9ybVwiO1xuXG5leHBvcnQgdHlwZSBTZXNzaW9uID0ge1xuICBhY3RpdmU6IGJvb2xlYW47XG4gIGNvbmZpcm1NYXN0ZXJQYXNzd29yZDogKHBhc3N3b3JkOiBzdHJpbmcpID0+IFByb21pc2U8Ym9vbGVhbj47XG59ICYgUGljazxTZXNzaW9uU3RhdGUsIFwidG9rZW5cIiB8IFwiaXNMb2FkaW5nXCIgfCBcImlzTG9ja2VkXCIgfCBcImlzQXV0aGVudGljYXRlZFwiPjtcblxuZXhwb3J0IGNvbnN0IFNlc3Npb25Db250ZXh0ID0gY3JlYXRlQ29udGV4dDxTZXNzaW9uIHwgbnVsbD4obnVsbCk7XG5cbmV4cG9ydCB0eXBlIFNlc3Npb25Qcm92aWRlclByb3BzID0gUHJvcHNXaXRoQ2hpbGRyZW48e1xuICBsb2FkaW5nRmFsbGJhY2s/OiBSZWFjdE5vZGU7XG4gIHVubG9jaz86IGJvb2xlYW47XG59PjtcblxuLyoqXG4gKiBDb21wb25lbnQgd2hpY2ggcHJvdmlkZXMgYSBzZXNzaW9uIHZpYSB0aGUge0BsaW5rIHVzZVNlc3Npb259IGhvb2suXG4gKiBAcGFyYW0gcHJvcHMudW5sb2NrIElmIHRydWUsIGFuIHVubG9jayBmb3JtIHdpbGwgYmUgZGlzcGxheWVkIGlmIHRoZSB2YXVsdCBpcyBsb2NrZWQgb3IgdW5hdXRoZW50aWNhdGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gU2Vzc2lvblByb3ZpZGVyKHByb3BzOiBTZXNzaW9uUHJvdmlkZXJQcm9wcykge1xuICBjb25zdCB7IGNoaWxkcmVuLCBsb2FkaW5nRmFsbGJhY2sgPSA8VmF1bHRMb2FkaW5nRmFsbGJhY2sgLz4sIHVubG9jayB9ID0gcHJvcHM7XG5cbiAgY29uc3QgYml0d2FyZGVuID0gdXNlQml0d2FyZGVuKCk7XG4gIGNvbnN0IFtzdGF0ZSwgZGlzcGF0Y2hdID0gdXNlU2Vzc2lvblJlZHVjZXIoKTtcbiAgY29uc3QgcGVuZGluZ0FjdGlvblJlZiA9IHVzZVJlZjxQcm9taXNlPGFueT4+KFByb21pc2UucmVzb2x2ZSgpKTtcblxuICB1c2VPbmNlRWZmZWN0KGJvb3RzdHJhcFNlc3Npb24sIGJpdHdhcmRlbik7XG5cbiAgYXN5bmMgZnVuY3Rpb24gYm9vdHN0cmFwU2Vzc2lvbigpIHtcbiAgICB0cnkge1xuICAgICAgYml0d2FyZGVuXG4gICAgICAgIC5zZXRBY3Rpb25MaXN0ZW5lcihcImxvY2tcIiwgaGFuZGxlTG9jaylcbiAgICAgICAgLnNldEFjdGlvbkxpc3RlbmVyKFwidW5sb2NrXCIsIGhhbmRsZVVubG9jaylcbiAgICAgICAgLnNldEFjdGlvbkxpc3RlbmVyKFwibG9nb3V0XCIsIGhhbmRsZUxvZ291dCk7XG5cbiAgICAgIGNvbnN0IFt0b2tlbiwgcGFzc3dvcmRIYXNoLCBsYXN0QWN0aXZpdHlUaW1lU3RyaW5nLCBsYXN0VmF1bHRTdGF0dXNdID0gYXdhaXQgU2Vzc2lvblN0b3JhZ2UuZ2V0U2F2ZWRTZXNzaW9uKCk7XG4gICAgICBpZiAoIXRva2VuIHx8ICFwYXNzd29yZEhhc2gpIHRocm93IG5ldyBMb2NrVmF1bHRFcnJvcigpO1xuXG4gICAgICBkaXNwYXRjaCh7IHR5cGU6IFwibG9hZFN0YXRlXCIsIHRva2VuLCBwYXNzd29yZEhhc2ggfSk7XG4gICAgICBiaXR3YXJkZW4uc2V0U2Vzc2lvblRva2VuKHRva2VuKTtcblxuICAgICAgaWYgKGJpdHdhcmRlbi53YXNDbGlVcGRhdGVkKSB0aHJvdyBuZXcgTG9nb3V0VmF1bHRFcnJvcihWQVVMVF9MT0NLX01FU1NBR0VTLkNMSV9VUERBVEVEKTtcbiAgICAgIGlmIChsYXN0VmF1bHRTdGF0dXMgPT09IFwibG9ja2VkXCIpIHRocm93IG5ldyBMb2NrVmF1bHRFcnJvcigpO1xuICAgICAgaWYgKGxhc3RWYXVsdFN0YXR1cyA9PT0gXCJ1bmF1dGhlbnRpY2F0ZWRcIikgdGhyb3cgbmV3IExvZ291dFZhdWx0RXJyb3IoKTtcblxuICAgICAgaWYgKGxhc3RBY3Rpdml0eVRpbWVTdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbGFzdEFjdGl2aXR5VGltZSA9IG5ldyBEYXRlKGxhc3RBY3Rpdml0eVRpbWVTdHJpbmcpO1xuXG4gICAgICAgIGNvbnN0IHZhdWx0VGltZW91dE1zID0gK2dldFByZWZlcmVuY2VWYWx1ZXM8UHJlZmVyZW5jZXM+KCkucmVwcm9tcHRJZ25vcmVEdXJhdGlvbjtcbiAgICAgICAgaWYgKHBsYXRmb3JtID09PSBcIm1hY29zXCIgJiYgdmF1bHRUaW1lb3V0TXMgPT09IFZBVUxUX1RJTUVPVVQuU1lTVEVNX0xPQ0spIHtcbiAgICAgICAgICBpZiAoYXdhaXQgY2hlY2tTeXN0ZW1Mb2NrZWRTaW5jZUxhc3RBY2Nlc3MobGFzdEFjdGl2aXR5VGltZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBMb2NrVmF1bHRFcnJvcihWQVVMVF9MT0NLX01FU1NBR0VTLlNZU1RFTV9MT0NLKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocGxhdGZvcm0gPT09IFwibWFjb3NcIiAmJiB2YXVsdFRpbWVvdXRNcyA9PT0gVkFVTFRfVElNRU9VVC5TWVNURU1fU0xFRVApIHtcbiAgICAgICAgICBpZiAoYXdhaXQgY2hlY2tTeXN0ZW1TbGVwdFNpbmNlTGFzdEFjY2VzcyhsYXN0QWN0aXZpdHlUaW1lKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IExvY2tWYXVsdEVycm9yKFZBVUxUX0xPQ0tfTUVTU0FHRVMuU1lTVEVNX1NMRUVQKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodmF1bHRUaW1lb3V0TXMgIT09IFZBVUxUX1RJTUVPVVQuTkVWRVIpIHtcbiAgICAgICAgICBjb25zdCB0aW1lRWxhcHNlU2luY2VMYXN0QWN0aXZpdHkgPSBEYXRlLm5vdygpIC0gbGFzdEFjdGl2aXR5VGltZS5nZXRUaW1lKCk7XG4gICAgICAgICAgaWYgKHZhdWx0VGltZW91dE1zID09PSBWQVVMVF9USU1FT1VULklNTUVESUFURUxZIHx8IHRpbWVFbGFwc2VTaW5jZUxhc3RBY3Rpdml0eSA+PSB2YXVsdFRpbWVvdXRNcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IExvY2tWYXVsdEVycm9yKFZBVUxUX0xPQ0tfTUVTU0FHRVMuVElNRU9VVCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJmaW5pc2hMb2FkaW5nU2F2ZWRTdGF0ZVwiIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBMb2NrVmF1bHRFcnJvcikge1xuICAgICAgICBwZW5kaW5nQWN0aW9uUmVmLmN1cnJlbnQgPSBiaXR3YXJkZW4ubG9jayh7IHJlYXNvbjogZXJyb3IubWVzc2FnZSwgaW1tZWRpYXRlOiB0cnVlLCBjaGVja1ZhdWx0U3RhdHVzOiB0cnVlIH0pO1xuICAgICAgfSBlbHNlIGlmIChlcnJvciBpbnN0YW5jZW9mIExvZ291dFZhdWx0RXJyb3IpIHtcbiAgICAgICAgcGVuZGluZ0FjdGlvblJlZi5jdXJyZW50ID0gYml0d2FyZGVuLmxvZ291dCh7IHJlYXNvbjogZXJyb3IubWVzc2FnZSwgaW1tZWRpYXRlOiB0cnVlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVuZGluZ0FjdGlvblJlZi5jdXJyZW50ID0gYml0d2FyZGVuLmxvY2soeyBpbW1lZGlhdGU6IHRydWUgfSk7XG4gICAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJmYWlsTG9hZGluZ1NhdmVkU3RhdGVcIiB9KTtcbiAgICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBib290c3RyYXAgc2Vzc2lvbiBzdGF0ZVwiLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlVW5sb2NrKHBhc3N3b3JkOiBzdHJpbmcsIHRva2VuOiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXNzd29yZEhhc2ggPSBhd2FpdCBoYXNoTWFzdGVyUGFzc3dvcmRGb3JSZXByb21wdGluZyhwYXNzd29yZCk7XG4gICAgYXdhaXQgU2Vzc2lvblN0b3JhZ2Uuc2F2ZVNlc3Npb24odG9rZW4sIHBhc3N3b3JkSGFzaCk7XG4gICAgYXdhaXQgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuVkFVTFRfTE9DS19SRUFTT04pO1xuICAgIGRpc3BhdGNoKHsgdHlwZTogXCJ1bmxvY2tcIiwgdG9rZW4sIHBhc3N3b3JkSGFzaCB9KTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxvY2socmVhc29uPzogc3RyaW5nKSB7XG4gICAgYXdhaXQgU2Vzc2lvblN0b3JhZ2UuY2xlYXJTZXNzaW9uKCk7XG4gICAgaWYgKHJlYXNvbikgYXdhaXQgTG9jYWxTdG9yYWdlLnNldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuVkFVTFRfTE9DS19SRUFTT04sIHJlYXNvbik7XG4gICAgZGlzcGF0Y2goeyB0eXBlOiBcImxvY2tcIiB9KTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxvZ291dChyZWFzb24/OiBzdHJpbmcpIHtcbiAgICBhd2FpdCBTZXNzaW9uU3RvcmFnZS5jbGVhclNlc3Npb24oKTtcbiAgICBDYWNoZS5jbGVhcigpO1xuICAgIGlmIChyZWFzb24pIGF3YWl0IExvY2FsU3RvcmFnZS5zZXRJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlZBVUxUX0xPQ0tfUkVBU09OLCByZWFzb24pO1xuICAgIGRpc3BhdGNoKHsgdHlwZTogXCJsb2dvdXRcIiB9KTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGNvbmZpcm1NYXN0ZXJQYXNzd29yZChwYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZW50ZXJlZFBhc3N3b3JkSGFzaCA9IGF3YWl0IGhhc2hNYXN0ZXJQYXNzd29yZEZvclJlcHJvbXB0aW5nKHBhc3N3b3JkKTtcbiAgICByZXR1cm4gZW50ZXJlZFBhc3N3b3JkSGFzaCA9PT0gc3RhdGUucGFzc3dvcmRIYXNoO1xuICB9XG5cbiAgY29uc3QgY29udGV4dFZhbHVlOiBTZXNzaW9uID0gdXNlTWVtbyhcbiAgICAoKSA9PiAoe1xuICAgICAgdG9rZW46IHN0YXRlLnRva2VuLFxuICAgICAgaXNMb2FkaW5nOiBzdGF0ZS5pc0xvYWRpbmcsXG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IHN0YXRlLmlzQXV0aGVudGljYXRlZCxcbiAgICAgIGlzTG9ja2VkOiBzdGF0ZS5pc0xvY2tlZCxcbiAgICAgIGFjdGl2ZTogIXN0YXRlLmlzTG9hZGluZyAmJiBzdGF0ZS5pc0F1dGhlbnRpY2F0ZWQgJiYgIXN0YXRlLmlzTG9ja2VkLFxuICAgICAgY29uZmlybU1hc3RlclBhc3N3b3JkLFxuICAgIH0pLFxuICAgIFtzdGF0ZSwgY29uZmlybU1hc3RlclBhc3N3b3JkXVxuICApO1xuXG4gIGlmIChzdGF0ZS5pc0xvYWRpbmcpIHJldHVybiBsb2FkaW5nRmFsbGJhY2s7XG5cbiAgY29uc3Qgc2hvd1VubG9ja0Zvcm0gPSBzdGF0ZS5pc0xvY2tlZCB8fCAhc3RhdGUuaXNBdXRoZW50aWNhdGVkO1xuICBjb25zdCBfY2hpbGRyZW4gPSBzdGF0ZS50b2tlbiA/IGNoaWxkcmVuIDogbnVsbDtcblxuICByZXR1cm4gKFxuICAgIDxTZXNzaW9uQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17Y29udGV4dFZhbHVlfT5cbiAgICAgIHtzaG93VW5sb2NrRm9ybSAmJiB1bmxvY2sgPyA8VW5sb2NrRm9ybSBwZW5kaW5nQWN0aW9uPXtwZW5kaW5nQWN0aW9uUmVmLmN1cnJlbnR9IC8+IDogX2NoaWxkcmVufVxuICAgIDwvU2Vzc2lvbkNvbnRleHQuUHJvdmlkZXI+XG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VTZXNzaW9uKCk6IFNlc3Npb24ge1xuICBjb25zdCBzZXNzaW9uID0gdXNlQ29udGV4dChTZXNzaW9uQ29udGV4dCk7XG4gIGlmIChzZXNzaW9uID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1c2VTZXNzaW9uIG11c3QgYmUgdXNlZCB3aXRoaW4gYSBTZXNzaW9uUHJvdmlkZXJcIik7XG4gIH1cblxuICByZXR1cm4gc2Vzc2lvbjtcbn1cblxuY2xhc3MgTG9ja1ZhdWx0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGxvY2tSZWFzb24/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihsb2NrUmVhc29uKTtcbiAgfVxufVxuXG5jbGFzcyBMb2dvdXRWYXVsdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3Rvcihsb2NrUmVhc29uPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobG9ja1JlYXNvbik7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBY3Rpb24sIEFjdGlvblBhbmVsLCBDbGlwYm9hcmQsIEZvcm0sIGdldFByZWZlcmVuY2VWYWx1ZXMsIEljb24sIHNob3dUb2FzdCwgVG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgRGVidWdnaW5nQnVnUmVwb3J0aW5nQWN0aW9uU2VjdGlvbiB9IGZyb20gXCJ+L2NvbXBvbmVudHMvYWN0aW9uc1wiO1xuaW1wb3J0IHsgTE9DQUxfU1RPUkFHRV9LRVkgfSBmcm9tIFwifi9jb25zdGFudHMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgdXNlQml0d2FyZGVuIH0gZnJvbSBcIn4vY29udGV4dC9iaXR3YXJkZW5cIjtcbmltcG9ydCB7IHRyZWF0RXJyb3IgfSBmcm9tIFwifi91dGlscy9kZWJ1Z1wiO1xuaW1wb3J0IHsgY2FwdHVyZUV4Y2VwdGlvbiB9IGZyb20gXCJ+L3V0aWxzL2RldmVsb3BtZW50XCI7XG5pbXBvcnQgdXNlVmF1bHRNZXNzYWdlcyBmcm9tIFwifi91dGlscy9ob29rcy91c2VWYXVsdE1lc3NhZ2VzXCI7XG5pbXBvcnQgeyB1c2VMb2NhbFN0b3JhZ2VJdGVtIH0gZnJvbSBcIn4vdXRpbHMvbG9jYWxzdG9yYWdlXCI7XG5pbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gXCJ+L3V0aWxzL3BsYXRmb3JtXCI7XG5pbXBvcnQgeyBnZXRMYWJlbEZvclRpbWVvdXRQcmVmZXJlbmNlIH0gZnJvbSBcIn4vdXRpbHMvcHJlZmVyZW5jZXNcIjtcblxudHlwZSBVbmxvY2tGb3JtUHJvcHMgPSB7XG4gIHBlbmRpbmdBY3Rpb24/OiBQcm9taXNlPHZvaWQ+O1xufTtcblxuLyoqIEZvcm0gZm9yIHVubG9ja2luZyBvciBsb2dnaW5nIGluIHRvIHRoZSBCaXR3YXJkZW4gdmF1bHQuICovXG5jb25zdCBVbmxvY2tGb3JtID0gKHsgcGVuZGluZ0FjdGlvbiA9IFByb21pc2UucmVzb2x2ZSgpIH06IFVubG9ja0Zvcm1Qcm9wcykgPT4ge1xuICBjb25zdCBiaXR3YXJkZW4gPSB1c2VCaXR3YXJkZW4oKTtcbiAgY29uc3QgeyB1c2VyTWVzc2FnZSwgc2VydmVyTWVzc2FnZSwgc2hvdWxkU2hvd1NlcnZlciB9ID0gdXNlVmF1bHRNZXNzYWdlcygpO1xuXG4gIGNvbnN0IFtpc0xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbdW5sb2NrRXJyb3IsIHNldFVubG9ja0Vycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKTtcbiAgY29uc3QgW3Nob3dQYXNzd29yZCwgc2V0U2hvd1Bhc3N3b3JkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3Bhc3N3b3JkLCBzZXRQYXNzd29yZF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW2xvY2tSZWFzb24sIHsgcmVtb3ZlOiBjbGVhckxvY2tSZWFzb24gfV0gPSB1c2VMb2NhbFN0b3JhZ2VJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlZBVUxUX0xPQ0tfUkVBU09OKTtcblxuICBhc3luYyBmdW5jdGlvbiBvblN1Ym1pdCgpIHtcbiAgICBpZiAocGFzc3dvcmQubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCB0b2FzdCA9IGF3YWl0IHNob3dUb2FzdChUb2FzdC5TdHlsZS5BbmltYXRlZCwgXCJVbmxvY2tpbmcgVmF1bHQuLi5cIiwgXCJQbGVhc2Ugd2FpdFwiKTtcbiAgICB0cnkge1xuICAgICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICAgIHNldFVubG9ja0Vycm9yKHVuZGVmaW5lZCk7XG5cbiAgICAgIGF3YWl0IHBlbmRpbmdBY3Rpb247XG5cbiAgICAgIGNvbnN0IHsgZXJyb3IsIHJlc3VsdDogdmF1bHRTdGF0ZSB9ID0gYXdhaXQgYml0d2FyZGVuLnN0YXR1cygpO1xuICAgICAgaWYgKGVycm9yKSB0aHJvdyBlcnJvcjtcblxuICAgICAgaWYgKHZhdWx0U3RhdGUuc3RhdHVzID09PSBcInVuYXV0aGVudGljYXRlZFwiKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgYml0d2FyZGVuLmxvZ2luKCk7XG4gICAgICAgICAgaWYgKGVycm9yKSB0aHJvdyBlcnJvcjtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBkaXNwbGF5YWJsZUVycm9yID0gYFBsZWFzZSBjaGVjayB5b3VyICR7c2hvdWxkU2hvd1NlcnZlciA/IFwiU2VydmVyIFVSTCwgXCIgOiBcIlwifUFQSSBLZXkgYW5kIFNlY3JldC5gLFxuICAgICAgICAgICAgdHJlYXRlZEVycm9yLFxuICAgICAgICAgIH0gPSBnZXRVc2VmdWxFcnJvcihlcnJvciwgcGFzc3dvcmQpO1xuICAgICAgICAgIGF3YWl0IHNob3dUb2FzdChUb2FzdC5TdHlsZS5GYWlsdXJlLCBcIkZhaWxlZCB0byBsb2cgaW5cIiwgZGlzcGxheWFibGVFcnJvcik7XG4gICAgICAgICAgc2V0VW5sb2NrRXJyb3IodHJlYXRlZEVycm9yKTtcbiAgICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGxvZyBpblwiLCBlcnJvcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IGJpdHdhcmRlbi51bmxvY2socGFzc3dvcmQpO1xuICAgICAgYXdhaXQgY2xlYXJMb2NrUmVhc29uKCk7XG4gICAgICBhd2FpdCB0b2FzdC5oaWRlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IHsgZGlzcGxheWFibGVFcnJvciA9IFwiUGxlYXNlIGNoZWNrIHlvdXIgY3JlZGVudGlhbHNcIiwgdHJlYXRlZEVycm9yIH0gPSBnZXRVc2VmdWxFcnJvcihlcnJvciwgcGFzc3dvcmQpO1xuICAgICAgYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLkZhaWx1cmUsIFwiRmFpbGVkIHRvIHVubG9jayB2YXVsdFwiLCBkaXNwbGF5YWJsZUVycm9yKTtcbiAgICAgIHNldFVubG9ja0Vycm9yKHRyZWF0ZWRFcnJvcik7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHVubG9jayB2YXVsdFwiLCBlcnJvcik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGNvcHlVbmxvY2tFcnJvciA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXVubG9ja0Vycm9yKSByZXR1cm47XG4gICAgYXdhaXQgQ2xpcGJvYXJkLmNvcHkodW5sb2NrRXJyb3IpO1xuICAgIGF3YWl0IHNob3dUb2FzdChUb2FzdC5TdHlsZS5TdWNjZXNzLCBcIkVycm9yIGNvcGllZCB0byBjbGlwYm9hcmRcIik7XG4gIH07XG5cbiAgbGV0IFBhc3N3b3JkRmllbGQgPSBGb3JtLlBhc3N3b3JkRmllbGQ7XG4gIGxldCBwYXNzd29yZEZpZWxkSWQgPSBcInBhc3N3b3JkXCI7XG4gIGlmIChzaG93UGFzc3dvcmQpIHtcbiAgICBQYXNzd29yZEZpZWxkID0gRm9ybS5UZXh0RmllbGQ7XG4gICAgcGFzc3dvcmRGaWVsZElkID0gXCJwbGFpblBhc3N3b3JkXCI7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxGb3JtXG4gICAgICBhY3Rpb25zPXtcbiAgICAgICAgPEFjdGlvblBhbmVsPlxuICAgICAgICAgIHshaXNMb2FkaW5nICYmIChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxBY3Rpb24uU3VibWl0Rm9ybSBpY29uPXtJY29uLkxvY2tVbmxvY2tlZH0gdGl0bGU9XCJVbmxvY2tcIiBvblN1Ym1pdD17b25TdWJtaXR9IC8+XG4gICAgICAgICAgICAgIDxBY3Rpb25cbiAgICAgICAgICAgICAgICBpY29uPXtzaG93UGFzc3dvcmQgPyBJY29uLkV5ZURpc2FibGVkIDogSWNvbi5FeWV9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3Nob3dQYXNzd29yZCA/IFwiSGlkZSBQYXNzd29yZFwiIDogXCJTaG93IFBhc3N3b3JkXCJ9XG4gICAgICAgICAgICAgICAgb25BY3Rpb249eygpID0+IHNldFNob3dQYXNzd29yZCgocHJldikgPT4gIXByZXYpfVxuICAgICAgICAgICAgICAgIHNob3J0Y3V0PXt7IG1hY09TOiB7IGtleTogXCJlXCIsIG1vZGlmaWVyczogW1wib3B0XCJdIH0sIHdpbmRvd3M6IHsga2V5OiBcImVcIiwgbW9kaWZpZXJzOiBbXCJhbHRcIl0gfSB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgICB7ISF1bmxvY2tFcnJvciAmJiAoXG4gICAgICAgICAgICA8QWN0aW9uXG4gICAgICAgICAgICAgIG9uQWN0aW9uPXtjb3B5VW5sb2NrRXJyb3J9XG4gICAgICAgICAgICAgIHRpdGxlPVwiQ29weSBMYXN0IEVycm9yXCJcbiAgICAgICAgICAgICAgaWNvbj17SWNvbi5CdWd9XG4gICAgICAgICAgICAgIHN0eWxlPXtBY3Rpb24uU3R5bGUuRGVzdHJ1Y3RpdmV9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG4gICAgICAgICAgPERlYnVnZ2luZ0J1Z1JlcG9ydGluZ0FjdGlvblNlY3Rpb24gLz5cbiAgICAgICAgPC9BY3Rpb25QYW5lbD5cbiAgICAgIH1cbiAgICA+XG4gICAgICB7c2hvdWxkU2hvd1NlcnZlciAmJiA8Rm9ybS5EZXNjcmlwdGlvbiB0aXRsZT1cIlNlcnZlciBVUkxcIiB0ZXh0PXtzZXJ2ZXJNZXNzYWdlfSAvPn1cbiAgICAgIDxGb3JtLkRlc2NyaXB0aW9uIHRpdGxlPVwiVmF1bHQgU3RhdHVzXCIgdGV4dD17dXNlck1lc3NhZ2V9IC8+XG4gICAgICA8UGFzc3dvcmRGaWVsZFxuICAgICAgICBpZD17cGFzc3dvcmRGaWVsZElkfVxuICAgICAgICB0aXRsZT1cIk1hc3RlciBQYXNzd29yZFwiXG4gICAgICAgIHZhbHVlPXtwYXNzd29yZH1cbiAgICAgICAgb25DaGFuZ2U9e3NldFBhc3N3b3JkfVxuICAgICAgICByZWY9eyhmaWVsZCkgPT4gZmllbGQ/LmZvY3VzKCl9XG4gICAgICAvPlxuICAgICAgPEZvcm0uRGVzY3JpcHRpb25cbiAgICAgICAgdGl0bGU9XCJcIlxuICAgICAgICB0ZXh0PXtgUHJlc3MgJHtwbGF0Zm9ybSA9PT0gXCJtYWNvc1wiID8gXCJcdTIzMjVcIiA6IFwiQWx0XCJ9K0UgdG8gJHtzaG93UGFzc3dvcmQgPyBcImhpZGVcIiA6IFwic2hvd1wifSBwYXNzd29yZGB9XG4gICAgICAvPlxuICAgICAgeyEhbG9ja1JlYXNvbiAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPEZvcm0uRGVzY3JpcHRpb24gdGl0bGU9XCJcdTIxMzlcdUZFMEZcIiB0ZXh0PXtsb2NrUmVhc29ufSAvPlxuICAgICAgICAgIDxUaW1lb3V0SW5mb0Rlc2NyaXB0aW9uIC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICA8L0Zvcm0+XG4gICk7XG59O1xuXG5mdW5jdGlvbiBUaW1lb3V0SW5mb0Rlc2NyaXB0aW9uKCkge1xuICBjb25zdCB2YXVsdFRpbWVvdXRNcyA9IGdldFByZWZlcmVuY2VWYWx1ZXM8QWxsUHJlZmVyZW5jZXM+KCkucmVwcm9tcHRJZ25vcmVEdXJhdGlvbjtcbiAgY29uc3QgdGltZW91dExhYmVsID0gZ2V0TGFiZWxGb3JUaW1lb3V0UHJlZmVyZW5jZSh2YXVsdFRpbWVvdXRNcyk7XG5cbiAgaWYgKCF0aW1lb3V0TGFiZWwpIHJldHVybiBudWxsO1xuICByZXR1cm4gKFxuICAgIDxGb3JtLkRlc2NyaXB0aW9uXG4gICAgICB0aXRsZT1cIlwiXG4gICAgICB0ZXh0PXtgVGltZW91dCBpcyBzZXQgdG8gJHt0aW1lb3V0TGFiZWx9LCB0aGlzIGNhbiBiZSBjb25maWd1cmVkIGluIHRoZSBleHRlbnNpb24gc2V0dGluZ3NgfVxuICAgIC8+XG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldFVzZWZ1bEVycm9yKGVycm9yOiB1bmtub3duLCBwYXNzd29yZDogc3RyaW5nKSB7XG4gIGNvbnN0IHRyZWF0ZWRFcnJvciA9IHRyZWF0RXJyb3IoZXJyb3IsIHsgb21pdFNlbnNpdGl2ZVZhbHVlOiBwYXNzd29yZCB9KTtcbiAgbGV0IGRpc3BsYXlhYmxlRXJyb3I6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgaWYgKC9JbnZhbGlkIG1hc3RlciBwYXNzd29yZC9pLnRlc3QodHJlYXRlZEVycm9yKSkge1xuICAgIGRpc3BsYXlhYmxlRXJyb3IgPSBcIkludmFsaWQgbWFzdGVyIHBhc3N3b3JkXCI7XG4gIH0gZWxzZSBpZiAoL0ludmFsaWQgQVBJIEtleS9pLnRlc3QodHJlYXRlZEVycm9yKSkge1xuICAgIGRpc3BsYXlhYmxlRXJyb3IgPSBcIkludmFsaWQgQ2xpZW50IElEIG9yIFNlY3JldFwiO1xuICB9XG4gIHJldHVybiB7IGRpc3BsYXlhYmxlRXJyb3IsIHRyZWF0ZWRFcnJvciB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBVbmxvY2tGb3JtO1xuIiwgIi8qIFB1dCBjb25zdGFudHMgdGhhdCB5b3UgZmVlbCBsaWtlIHRoZXkgc3RpbGwgZG9uJ3QgZGVzZXJ2ZSBhIGZpbGUgb2YgdGhlaXIgb3duIGhlcmUgKi9cblxuaW1wb3J0IHsgSWNvbiwgS2V5Ym9hcmQgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBJdGVtVHlwZSB9IGZyb20gXCJ+L3R5cGVzL3ZhdWx0XCI7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFUlZFUl9VUkwgPSBcImh0dHBzOi8vYml0d2FyZGVuLmNvbVwiO1xuXG5leHBvcnQgY29uc3QgU0VOU0lUSVZFX1ZBTFVFX1BMQUNFSE9MREVSID0gXCJISURERU4tVkFMVUVcIjtcblxuZXhwb3J0IGNvbnN0IExPQ0FMX1NUT1JBR0VfS0VZID0ge1xuICBQQVNTV09SRF9PUFRJT05TOiBcImJ3LWdlbmVyYXRlLXBhc3N3b3JkLW9wdGlvbnNcIixcbiAgUEFTU1dPUkRfT05FX1RJTUVfV0FSTklORzogXCJidy1nZW5lcmF0ZS1wYXNzd29yZC13YXJuaW5nLWFjY2VwdGVkXCIsXG4gIFNFU1NJT05fVE9LRU46IFwic2Vzc2lvblRva2VuXCIsXG4gIFJFUFJPTVBUX0hBU0g6IFwic2Vzc2lvblJlcHJvbXB0SGFzaFwiLFxuICBTRVJWRVJfVVJMOiBcImNsaVNlcnZlclwiLFxuICBMQVNUX0FDVElWSVRZX1RJTUU6IFwibGFzdEFjdGl2aXR5VGltZVwiLFxuICBWQVVMVF9MT0NLX1JFQVNPTjogXCJ2YXVsdExvY2tSZWFzb25cIixcbiAgVkFVTFRfRkFWT1JJVEVfT1JERVI6IFwidmF1bHRGYXZvcml0ZU9yZGVyXCIsXG4gIFZBVUxUX0xBU1RfU1RBVFVTOiBcImxhc3RWYXVsdFN0YXR1c1wiLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IFZBVUxUX0xPQ0tfTUVTU0FHRVMgPSB7XG4gIFRJTUVPVVQ6IFwiVmF1bHQgdGltZWQgb3V0IGR1ZSB0byBpbmFjdGl2aXR5XCIsXG4gIE1BTlVBTDogXCJNYW51YWxseSBsb2NrZWQgYnkgdGhlIHVzZXJcIixcbiAgU1lTVEVNX0xPQ0s6IFwiU2NyZWVuIHdhcyBsb2NrZWRcIixcbiAgU1lTVEVNX1NMRUVQOiBcIlN5c3RlbSB3ZW50IHRvIHNsZWVwXCIsXG4gIENMSV9VUERBVEVEOiBcIkJpdHdhcmRlbiBoYXMgYmVlbiB1cGRhdGVkLiBQbGVhc2UgbG9naW4gYWdhaW4uXCIsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgU0hPUlRDVVRfS0VZX1NFUVVFTkNFOiBLZXlib2FyZC5LZXlFcXVpdmFsZW50W10gPSBbXG4gIFwiMVwiLFxuICBcIjJcIixcbiAgXCIzXCIsXG4gIFwiNFwiLFxuICBcIjVcIixcbiAgXCI2XCIsXG4gIFwiN1wiLFxuICBcIjhcIixcbiAgXCI5XCIsXG4gIFwiYlwiLFxuICBcImNcIixcbiAgXCJkXCIsXG4gIFwiZVwiLFxuICBcImZcIixcbiAgXCJnXCIsXG4gIFwiaFwiLFxuICBcImlcIixcbiAgXCJqXCIsXG4gIFwia1wiLFxuICBcImxcIixcbiAgXCJtXCIsXG4gIFwiblwiLFxuICBcIm9cIixcbiAgXCJwXCIsXG4gIFwicVwiLFxuICBcInJcIixcbiAgXCJzXCIsXG4gIFwidFwiLFxuICBcInVcIixcbiAgXCJ2XCIsXG4gIFwid1wiLFxuICBcInhcIixcbiAgXCJ5XCIsXG4gIFwielwiLFxuICBcIitcIixcbiAgXCItXCIsXG4gIFwiLlwiLFxuICBcIixcIixcbl07XG5cbmV4cG9ydCBjb25zdCBGT0xERVJfT1BUSU9OUyA9IHtcbiAgQUxMOiBcImFsbFwiLFxuICBOT19GT0xERVI6IFwibm8tZm9sZGVyXCIsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgQ0FDSEVfS0VZUyA9IHtcbiAgSVY6IFwiaXZcIixcbiAgVkFVTFQ6IFwidmF1bHRcIixcbiAgQ1VSUkVOVF9GT0xERVJfSUQ6IFwiY3VycmVudEZvbGRlcklkXCIsXG4gIFNFTkRfVFlQRV9GSUxURVI6IFwic2VuZFR5cGVGaWx0ZXJcIixcbiAgQ0xJX1ZFUlNJT046IFwiY2xpVmVyc2lvblwiLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IElURU1fVFlQRV9UT19JQ09OX01BUDogUmVjb3JkPEl0ZW1UeXBlLCBJY29uPiA9IHtcbiAgW0l0ZW1UeXBlLkxPR0lOXTogSWNvbi5HbG9iZSxcbiAgW0l0ZW1UeXBlLkNBUkRdOiBJY29uLkNyZWRpdENhcmQsXG4gIFtJdGVtVHlwZS5JREVOVElUWV06IEljb24uUGVyc29uLFxuICBbSXRlbVR5cGUuTk9URV06IEljb24uRG9jdW1lbnQsXG4gIFtJdGVtVHlwZS5TU0hfS0VZXTogSWNvbi5LZXksXG59O1xuIiwgImltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIFByb3BzV2l0aENoaWxkcmVuLCBSZWFjdE5vZGUsIHVzZUNvbnRleHQsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBCaXR3YXJkZW4gfSBmcm9tIFwifi9hcGkvYml0d2FyZGVuXCI7XG5pbXBvcnQgeyBMb2FkaW5nRmFsbGJhY2sgfSBmcm9tIFwifi9jb21wb25lbnRzL0xvYWRpbmdGYWxsYmFja1wiO1xuaW1wb3J0IFRyb3VibGVzaG9vdGluZ0d1aWRlIGZyb20gXCJ+L2NvbXBvbmVudHMvVHJvdWJsZXNob290aW5nR3VpZGVcIjtcbmltcG9ydCB7IEluc3RhbGxlZENMSU5vdEZvdW5kRXJyb3IgfSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcbmltcG9ydCB1c2VPbmNlRWZmZWN0IGZyb20gXCJ+L3V0aWxzL2hvb2tzL3VzZU9uY2VFZmZlY3RcIjtcblxuY29uc3QgQml0d2FyZGVuQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8Qml0d2FyZGVuIHwgbnVsbD4obnVsbCk7XG5cbmV4cG9ydCB0eXBlIEJpdHdhcmRlblByb3ZpZGVyUHJvcHMgPSBQcm9wc1dpdGhDaGlsZHJlbjx7XG4gIGxvYWRpbmdGYWxsYmFjaz86IFJlYWN0Tm9kZTtcbn0+O1xuXG5leHBvcnQgY29uc3QgQml0d2FyZGVuUHJvdmlkZXIgPSAoeyBjaGlsZHJlbiwgbG9hZGluZ0ZhbGxiYWNrID0gPExvYWRpbmdGYWxsYmFjayAvPiB9OiBCaXR3YXJkZW5Qcm92aWRlclByb3BzKSA9PiB7XG4gIGNvbnN0IFtiaXR3YXJkZW4sIHNldEJpdHdhcmRlbl0gPSB1c2VTdGF0ZTxCaXR3YXJkZW4+KCk7XG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8RXJyb3I+KCk7XG5cbiAgdXNlT25jZUVmZmVjdCgoKSA9PiB7XG4gICAgdm9pZCBuZXcgQml0d2FyZGVuKCkuaW5pdGlhbGl6ZSgpLnRoZW4oc2V0Qml0d2FyZGVuKS5jYXRjaChoYW5kbGVCd0luaXRFcnJvcik7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZUJ3SW5pdEVycm9yKGVycm9yOiBFcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEluc3RhbGxlZENMSU5vdEZvdW5kRXJyb3IpIHtcbiAgICAgIHNldEVycm9yKGVycm9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgaWYgKGVycm9yKSByZXR1cm4gPFRyb3VibGVzaG9vdGluZ0d1aWRlIGVycm9yPXtlcnJvcn0gLz47XG4gIGlmICghYml0d2FyZGVuKSByZXR1cm4gbG9hZGluZ0ZhbGxiYWNrO1xuXG4gIHJldHVybiA8Qml0d2FyZGVuQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17Yml0d2FyZGVufT57Y2hpbGRyZW59PC9CaXR3YXJkZW5Db250ZXh0LlByb3ZpZGVyPjtcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VCaXR3YXJkZW4gPSAoKSA9PiB7XG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KEJpdHdhcmRlbkNvbnRleHQpO1xuICBpZiAoY29udGV4dCA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwidXNlQml0d2FyZGVuIG11c3QgYmUgdXNlZCB3aXRoaW4gYSBCaXR3YXJkZW5Qcm92aWRlclwiKTtcbiAgfVxuXG4gIHJldHVybiBjb250ZXh0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQml0d2FyZGVuQ29udGV4dDtcbiIsICJpbXBvcnQgeyBlbnZpcm9ubWVudCwgZ2V0UHJlZmVyZW5jZVZhbHVlcywgTG9jYWxTdG9yYWdlLCBvcGVuLCBzaG93VG9hc3QsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgZXhlY2EsIEV4ZWNhQ2hpbGRQcm9jZXNzLCBFeGVjYUVycm9yLCBFeGVjYVJldHVyblZhbHVlIH0gZnJvbSBcImV4ZWNhXCI7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCB1bmxpbmtTeW5jLCB3cml0ZUZpbGVTeW5jLCBhY2Nlc3NTeW5jLCBjb25zdGFudHMsIGNobW9kU3luYyB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgTE9DQUxfU1RPUkFHRV9LRVksIERFRkFVTFRfU0VSVkVSX1VSTCwgQ0FDSEVfS0VZUyB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBWYXVsdFN0YXRlLCBWYXVsdFN0YXR1cyB9IGZyb20gXCJ+L3R5cGVzL2dlbmVyYWxcIjtcbmltcG9ydCB7IFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gXCJ+L3R5cGVzL3Bhc3N3b3Jkc1wiO1xuaW1wb3J0IHsgRm9sZGVyLCBJdGVtLCBJdGVtVHlwZSwgTG9naW4gfSBmcm9tIFwifi90eXBlcy92YXVsdFwiO1xuaW1wb3J0IHsgZ2V0UGFzc3dvcmRHZW5lcmF0aW5nQXJncyB9IGZyb20gXCJ+L3V0aWxzL3Bhc3N3b3Jkc1wiO1xuaW1wb3J0IHsgZ2V0U2VydmVyVXJsUHJlZmVyZW5jZSB9IGZyb20gXCJ+L3V0aWxzL3ByZWZlcmVuY2VzXCI7XG5pbXBvcnQge1xuICBFbnN1cmVDbGlCaW5FcnJvcixcbiAgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvcixcbiAgTWFudWFsbHlUaHJvd25FcnJvcixcbiAgTm90TG9nZ2VkSW5FcnJvcixcbiAgUHJlbWl1bUZlYXR1cmVFcnJvcixcbiAgU2VuZEludmFsaWRQYXNzd29yZEVycm9yLFxuICBTZW5kTmVlZHNQYXNzd29yZEVycm9yLFxuICB0cnlFeGVjLFxuICBWYXVsdElzTG9ja2VkRXJyb3IsXG59IGZyb20gXCJ+L3V0aWxzL2Vycm9yc1wiO1xuaW1wb3J0IHsgam9pbiwgZGlybmFtZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjaG1vZCwgcmVuYW1lLCBybSB9IGZyb20gXCJmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHsgZGVjb21wcmVzc0ZpbGUsIHJlbW92ZUZpbGVzVGhhdFN0YXJ0V2l0aCwgdW5saW5rQWxsU3luYywgd2FpdEZvckZpbGVBdmFpbGFibGUgfSBmcm9tIFwifi91dGlscy9mc1wiO1xuaW1wb3J0IHsgZG93bmxvYWQgfSBmcm9tIFwifi91dGlscy9uZXR3b3JrXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIH0gZnJvbSBcIn4vdXRpbHMvZGV2ZWxvcG1lbnRcIjtcbmltcG9ydCB7IFJlY2VpdmVkU2VuZCwgU2VuZCwgU2VuZENyZWF0ZVBheWxvYWQsIFNlbmRUeXBlIH0gZnJvbSBcIn4vdHlwZXMvc2VuZFwiO1xuaW1wb3J0IHsgcHJlcGFyZVNlbmRQYXlsb2FkIH0gZnJvbSBcIn4vYXBpL2JpdHdhcmRlbi5oZWxwZXJzXCI7XG5pbXBvcnQgeyBDYWNoZSB9IGZyb20gXCJ+L3V0aWxzL2NhY2hlXCI7XG5pbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gXCJ+L3V0aWxzL3BsYXRmb3JtXCI7XG5cbnR5cGUgRW52ID0ge1xuICBCSVRXQVJERU5DTElfQVBQREFUQV9ESVI6IHN0cmluZztcbiAgQldfQ0xJRU5UU0VDUkVUOiBzdHJpbmc7XG4gIEJXX0NMSUVOVElEOiBzdHJpbmc7XG4gIFBBVEg6IHN0cmluZztcbiAgTk9ERV9FWFRSQV9DQV9DRVJUUz86IHN0cmluZztcbiAgQldfU0VTU0lPTj86IHN0cmluZztcbn07XG5cbnR5cGUgQWN0aW9uTGlzdGVuZXJzID0ge1xuICBsb2dpbj86ICgpID0+IE1heWJlUHJvbWlzZTx2b2lkPjtcbiAgbG9nb3V0PzogKHJlYXNvbj86IHN0cmluZykgPT4gTWF5YmVQcm9taXNlPHZvaWQ+O1xuICBsb2NrPzogKHJlYXNvbj86IHN0cmluZykgPT4gTWF5YmVQcm9taXNlPHZvaWQ+O1xuICB1bmxvY2s/OiAocGFzc3dvcmQ6IHN0cmluZywgc2Vzc2lvblRva2VuOiBzdHJpbmcpID0+IE1heWJlUHJvbWlzZTx2b2lkPjtcbn07XG5cbnR5cGUgQWN0aW9uTGlzdGVuZXJzTWFwPFQgZXh0ZW5kcyBrZXlvZiBBY3Rpb25MaXN0ZW5lcnMgPSBrZXlvZiBBY3Rpb25MaXN0ZW5lcnM+ID0gTWFwPFQsIFNldDxBY3Rpb25MaXN0ZW5lcnNbVF0+PjtcblxudHlwZSBNYXliZUVycm9yPFQgPSB1bmRlZmluZWQ+ID0geyByZXN1bHQ6IFQ7IGVycm9yPzogdW5kZWZpbmVkIH0gfCB7IHJlc3VsdD86IHVuZGVmaW5lZDsgZXJyb3I6IE1hbnVhbGx5VGhyb3duRXJyb3IgfTtcblxudHlwZSBFeGVjUHJvcHMgPSB7XG4gIC8qKiBSZXNldCB0aGUgdGltZSBvZiB0aGUgbGFzdCBjb21tYW5kIHRoYXQgYWNjZXNzZWQgZGF0YSBvciBtb2RpZmllZCB0aGUgdmF1bHQsIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSB2YXVsdCB0aW1lZCBvdXQgKi9cbiAgcmVzZXRWYXVsdFRpbWVvdXQ6IGJvb2xlYW47XG4gIGFib3J0Q29udHJvbGxlcj86IEFib3J0Q29udHJvbGxlcjtcbiAgaW5wdXQ/OiBzdHJpbmc7XG59O1xuXG50eXBlIExvY2tPcHRpb25zID0ge1xuICAvKiogVGhlIHJlYXNvbiBmb3IgbG9ja2luZyB0aGUgdmF1bHQgKi9cbiAgcmVhc29uPzogc3RyaW5nO1xuICBjaGVja1ZhdWx0U3RhdHVzPzogYm9vbGVhbjtcbiAgLyoqIFRoZSBjYWxsYmFja3MgYXJlIGNhbGxlZCBiZWZvcmUgdGhlIG9wZXJhdGlvbiBpcyBmaW5pc2hlZCAob3B0aW1pc3RpYykgKi9cbiAgaW1tZWRpYXRlPzogYm9vbGVhbjtcbn07XG5cbnR5cGUgTG9nb3V0T3B0aW9ucyA9IHtcbiAgLyoqIFRoZSByZWFzb24gZm9yIGxvY2tpbmcgdGhlIHZhdWx0ICovXG4gIHJlYXNvbj86IHN0cmluZztcbiAgLyoqIFRoZSBjYWxsYmFja3MgYXJlIGNhbGxlZCBiZWZvcmUgdGhlIG9wZXJhdGlvbiBpcyBmaW5pc2hlZCAob3B0aW1pc3RpYykgKi9cbiAgaW1tZWRpYXRlPzogYm9vbGVhbjtcbn07XG5cbnR5cGUgUmVjZWl2ZVNlbmRPcHRpb25zID0ge1xuICBzYXZlUGF0aD86IHN0cmluZztcbiAgcGFzc3dvcmQ/OiBzdHJpbmc7XG59O1xuXG50eXBlIENyZWF0ZUxvZ2luSXRlbU9wdGlvbnMgPSB7XG4gIG5hbWU6IHN0cmluZztcbiAgdXNlcm5hbWU/OiBzdHJpbmc7XG4gIHBhc3N3b3JkOiBzdHJpbmc7XG4gIGZvbGRlcklkOiBzdHJpbmcgfCBudWxsO1xuICB1cmk/OiBzdHJpbmc7XG59O1xuXG5jb25zdCB7IHN1cHBvcnRQYXRoIH0gPSBlbnZpcm9ubWVudDtcblxuY29uc3QgXHUwMzk0ID0gXCI0XCI7IC8vIGNoYW5naW5nIHRoaXMgZm9yY2VzIGEgbmV3IGJpbiBkb3dubG9hZCBmb3IgcGVvcGxlIHRoYXQgaGFkIGEgZmFpbGVkIG9uZVxuY29uc3QgQmluRG93bmxvYWRMb2dnZXIgPSAoKCkgPT4ge1xuICAvKiBUaGUgaWRlYSBvZiB0aGlzIGxvZ2dlciBpcyB0byB3cml0ZSBhIGxvZyBmaWxlIHdoZW4gdGhlIGJpbiBkb3dubG9hZCBmYWlscywgc28gdGhhdCB3ZSBjYW4gbGV0IHRoZSBleHRlbnNpb24gY3Jhc2gsXG4gICBidXQgZmFsbGJhY2sgdG8gdGhlIGxvY2FsIGNsaSBwYXRoIGluIHRoZSBuZXh0IGxhdW5jaC4gVGhpcyBhbGxvd3MgdGhlIGVycm9yIHRvIGJlIHJlcG9ydGVkIGluIHRoZSBpc3N1ZXMgZGFzaGJvYXJkLiBJdCB1c2VzIGZpbGVzIHRvIGtlZXAgaXQgc3luY2hyb25vdXMsIGFzIGl0J3MgbmVlZGVkIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgIEFsdGhvdWdoLCB0aGUgcGxhbiBpcyB0byBkaXNjb250aW51ZSB0aGlzIG1ldGhvZCwgaWYgdGhlcmUncyBhIGJldHRlciB3YXkgb2YgbG9nZ2luZyBlcnJvcnMgaW4gdGhlIGlzc3VlcyBkYXNoYm9hcmRcbiAgIG9yIHRoZXJlIGFyZSBubyBjcmFzaGVzIHJlcG9ydGVkIHdpdGggdGhlIGJpbiBkb3dubG9hZCBhZnRlciBzb21lIHRpbWUuICovXG4gIGNvbnN0IGZpbGVQYXRoID0gam9pbihzdXBwb3J0UGF0aCwgYGJ3LWJpbi1kb3dubG9hZC1lcnJvci0ke1x1MDM5NH0ubG9nYCk7XG4gIHJldHVybiB7XG4gICAgbG9nRXJyb3I6IChlcnJvcjogYW55KSA9PiB0cnlFeGVjKCgpID0+IHdyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGVycm9yPy5tZXNzYWdlID8/IFwiVW5leHBlY3RlZCBlcnJvclwiKSksXG4gICAgY2xlYXJFcnJvcjogKCkgPT4gdHJ5RXhlYygoKSA9PiB1bmxpbmtTeW5jKGZpbGVQYXRoKSksXG4gICAgaGFzRXJyb3I6ICgpID0+IHRyeUV4ZWMoKCkgPT4gZXhpc3RzU3luYyhmaWxlUGF0aCksIGZhbHNlKSxcbiAgfTtcbn0pKCk7XG5cbmV4cG9ydCBjb25zdCBjbGlJbmZvID0ge1xuICB2ZXJzaW9uOiBcIjIwMjUuMi4wXCIsXG4gIGdldCBzaGEyNTYoKSB7XG4gICAgaWYgKHBsYXRmb3JtID09PSBcIndpbmRvd3NcIikgcmV0dXJuIFwiMzNhMTMxMDE3YWM5Yzk5ZDcyMWU0MzBhODZlOTI5MzgzMzE0ZDNmOTFjOWYyZmJmNDEzZDg3MjU2NTY1NGMxOFwiO1xuICAgIHJldHVybiBcImZhZGU1MTAxMmE0NjAxMWMwMTZhMmU1YWVlMmYyZTUzNGMxZWQwNzhlNDlkMTE3OGE2OWUyODg5ZDI4MTJhOTZcIjtcbiAgfSxcbiAgZG93bmxvYWRQYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iaXR3YXJkZW4vY2xpZW50cy9yZWxlYXNlc1wiLFxuICBwYXRoOiB7XG4gICAgZ2V0IGRvd25sb2FkZWRCaW4oKSB7XG4gICAgICByZXR1cm4gam9pbihzdXBwb3J0UGF0aCwgY2xpSW5mby5iaW5GaWxlbmFtZVZlcnNpb25lZCk7XG4gICAgfSxcbiAgICBnZXQgaW5zdGFsbGVkQmluKCkge1xuICAgICAgLy8gV2UgYXNzdW1lIHRoYXQgaXQgd2FzIGluc3RhbGxlZCB1c2luZyBDaG9jb2xhdGV5LCBpZiBub3QsIGl0J3MgaGFyZCB0byBtYWtlIGEgZ29vZCBndWVzcy5cbiAgICAgIGlmIChwbGF0Zm9ybSA9PT0gXCJ3aW5kb3dzXCIpIHJldHVybiBcIkM6XFxcXFByb2dyYW1EYXRhXFxcXGNob2NvbGF0ZXlcXFxcYmluXFxcXGJ3LmV4ZVwiO1xuICAgICAgcmV0dXJuIHByb2Nlc3MuYXJjaCA9PT0gXCJhcm02NFwiID8gXCIvb3B0L2hvbWVicmV3L2Jpbi9id1wiIDogXCIvdXNyL2xvY2FsL2Jpbi9id1wiO1xuICAgIH0sXG4gICAgZ2V0IGJpbigpIHtcbiAgICAgIHJldHVybiAhQmluRG93bmxvYWRMb2dnZXIuaGFzRXJyb3IoKSA/IHRoaXMuZG93bmxvYWRlZEJpbiA6IHRoaXMuaW5zdGFsbGVkQmluO1xuICAgIH0sXG4gIH0sXG4gIGdldCBiaW5GaWxlbmFtZSgpIHtcbiAgICByZXR1cm4gcGxhdGZvcm0gPT09IFwid2luZG93c1wiID8gXCJidy5leGVcIiA6IFwiYndcIjtcbiAgfSxcbiAgZ2V0IGJpbkZpbGVuYW1lVmVyc2lvbmVkKCkge1xuICAgIGNvbnN0IG5hbWUgPSBgYnctJHt0aGlzLnZlcnNpb259YDtcbiAgICByZXR1cm4gcGxhdGZvcm0gPT09IFwid2luZG93c1wiID8gYCR7bmFtZX0uZXhlYCA6IGAke25hbWV9YDtcbiAgfSxcbiAgZ2V0IGRvd25sb2FkVXJsKCkge1xuICAgIGxldCBhcmNoU3VmZml4ID0gXCJcIjtcbiAgICBpZiAocGxhdGZvcm0gPT09IFwibWFjb3NcIikge1xuICAgICAgYXJjaFN1ZmZpeCA9IHByb2Nlc3MuYXJjaCA9PT0gXCJhcm02NFwiID8gXCItYXJtNjRcIiA6IFwiXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAke3RoaXMuZG93bmxvYWRQYWdlfS9kb3dubG9hZC9jbGktdiR7dGhpcy52ZXJzaW9ufS9idy0ke3BsYXRmb3JtfSR7YXJjaFN1ZmZpeH0tJHt0aGlzLnZlcnNpb259LnppcGA7XG4gIH0sXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY2xhc3MgQml0d2FyZGVuIHtcbiAgcHJpdmF0ZSBlbnY6IEVudjtcbiAgcHJpdmF0ZSBpbml0UHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcbiAgcHJpdmF0ZSB0ZW1wU2Vzc2lvblRva2VuPzogc3RyaW5nO1xuICBwcml2YXRlIGFjdGlvbkxpc3RlbmVyczogQWN0aW9uTGlzdGVuZXJzTWFwID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIHByZWZlcmVuY2VzID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcz4oKTtcbiAgcHJpdmF0ZSBjbGlQYXRoOiBzdHJpbmc7XG4gIHByaXZhdGUgdG9hc3RJbnN0YW5jZTogVG9hc3QgfCB1bmRlZmluZWQ7XG4gIHdhc0NsaVVwZGF0ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3Rvcih0b2FzdEluc3RhbmNlPzogVG9hc3QpIHtcbiAgICBjb25zdCB7IGNsaVBhdGg6IGNsaVBhdGhQcmVmZXJlbmNlLCBjbGllbnRJZCwgY2xpZW50U2VjcmV0LCBzZXJ2ZXJDZXJ0c1BhdGggfSA9IHRoaXMucHJlZmVyZW5jZXM7XG4gICAgY29uc3Qgc2VydmVyVXJsID0gZ2V0U2VydmVyVXJsUHJlZmVyZW5jZSgpO1xuXG4gICAgdGhpcy50b2FzdEluc3RhbmNlID0gdG9hc3RJbnN0YW5jZTtcbiAgICB0aGlzLmNsaVBhdGggPSBjbGlQYXRoUHJlZmVyZW5jZSB8fCBjbGlJbmZvLnBhdGguYmluO1xuICAgIHRoaXMuZW52ID0ge1xuICAgICAgQklUV0FSREVOQ0xJX0FQUERBVEFfRElSOiBzdXBwb3J0UGF0aCxcbiAgICAgIEJXX0NMSUVOVFNFQ1JFVDogY2xpZW50U2VjcmV0LnRyaW0oKSxcbiAgICAgIEJXX0NMSUVOVElEOiBjbGllbnRJZC50cmltKCksXG4gICAgICBQQVRIOiBkaXJuYW1lKHByb2Nlc3MuZXhlY1BhdGgpLFxuICAgICAgLi4uKHNlcnZlclVybCAmJiBzZXJ2ZXJDZXJ0c1BhdGggPyB7IE5PREVfRVhUUkFfQ0FfQ0VSVFM6IHNlcnZlckNlcnRzUGF0aCB9IDoge30pLFxuICAgIH07XG5cbiAgICB0aGlzLmluaXRQcm9taXNlID0gKGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuZW5zdXJlQ2xpQmluYXJ5KCk7XG4gICAgICB2b2lkIHRoaXMucmV0cmlldmVBbmRDYWNoZUNsaVZlcnNpb24oKTtcbiAgICAgIGF3YWl0IHRoaXMuY2hlY2tTZXJ2ZXJVcmwoc2VydmVyVXJsKTtcbiAgICB9KSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVDbGlCaW5hcnkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuY2hlY2tDbGlCaW5Jc1JlYWR5KHRoaXMuY2xpUGF0aCkpIHJldHVybjtcbiAgICBpZiAodGhpcy5jbGlQYXRoID09PSB0aGlzLnByZWZlcmVuY2VzLmNsaVBhdGggfHwgdGhpcy5jbGlQYXRoID09PSBjbGlJbmZvLnBhdGguaW5zdGFsbGVkQmluKSB7XG4gICAgICB0aHJvdyBuZXcgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvcihgQml0d2FyZGVuIENMSSBub3QgZm91bmQgYXQgJHt0aGlzLmNsaVBhdGh9YCk7XG4gICAgfVxuICAgIGlmIChCaW5Eb3dubG9hZExvZ2dlci5oYXNFcnJvcigpKSBCaW5Eb3dubG9hZExvZ2dlci5jbGVhckVycm9yKCk7XG5cbiAgICAvLyByZW1vdmUgb2xkIGJpbmFyaWVzIHRvIGNoZWNrIGlmIGl0J3MgYW4gdXBkYXRlIGFuZCBiZWNhdXNlIHRoZXkgYXJlIDEwME1CK1xuICAgIGNvbnN0IGhhZE9sZEJpbmFyaWVzID0gYXdhaXQgcmVtb3ZlRmlsZXNUaGF0U3RhcnRXaXRoKFwiYnctXCIsIHN1cHBvcnRQYXRoKTtcbiAgICBjb25zdCB0b2FzdCA9IGF3YWl0IHRoaXMuc2hvd1RvYXN0KHtcbiAgICAgIHRpdGxlOiBgJHtoYWRPbGRCaW5hcmllcyA/IFwiVXBkYXRpbmdcIiA6IFwiSW5pdGlhbGl6aW5nXCJ9IEJpdHdhcmRlbiBDTElgLFxuICAgICAgc3R5bGU6IFRvYXN0LlN0eWxlLkFuaW1hdGVkLFxuICAgICAgcHJpbWFyeUFjdGlvbjogeyB0aXRsZTogXCJPcGVuIERvd25sb2FkIFBhZ2VcIiwgb25BY3Rpb246ICgpID0+IG9wZW4oY2xpSW5mby5kb3dubG9hZFBhZ2UpIH0sXG4gICAgfSk7XG4gICAgY29uc3QgdG1wRmlsZU5hbWUgPSBcImJ3LnppcFwiO1xuICAgIGNvbnN0IHppcFBhdGggPSBqb2luKHN1cHBvcnRQYXRoLCB0bXBGaWxlTmFtZSk7XG5cbiAgICB0cnkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdG9hc3QubWVzc2FnZSA9IFwiRG93bmxvYWRpbmcuLi5cIjtcbiAgICAgICAgYXdhaXQgZG93bmxvYWQoY2xpSW5mby5kb3dubG9hZFVybCwgemlwUGF0aCwge1xuICAgICAgICAgIG9uUHJvZ3Jlc3M6IChwZXJjZW50KSA9PiAodG9hc3QubWVzc2FnZSA9IGBEb3dubG9hZGluZyAke3BlcmNlbnR9JWApLFxuICAgICAgICAgIHNoYTI1NjogY2xpSW5mby5zaGEyNTYsXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZG93bmxvYWRFcnJvcikge1xuICAgICAgICB0b2FzdC50aXRsZSA9IFwiRmFpbGVkIHRvIGRvd25sb2FkIEJpdHdhcmRlbiBDTElcIjtcbiAgICAgICAgdGhyb3cgZG93bmxvYWRFcnJvcjtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgdG9hc3QubWVzc2FnZSA9IFwiRXh0cmFjdGluZy4uLlwiO1xuICAgICAgICBhd2FpdCBkZWNvbXByZXNzRmlsZSh6aXBQYXRoLCBzdXBwb3J0UGF0aCk7XG4gICAgICAgIGNvbnN0IGRlY29tcHJlc3NlZEJpblBhdGggPSBqb2luKHN1cHBvcnRQYXRoLCBjbGlJbmZvLmJpbkZpbGVuYW1lKTtcblxuICAgICAgICAvLyBGb3Igc29tZSByZWFzb24gdGhpcyByZW5hbWUgc3RhcnRlZCB0aHJvd2luZyBhbiBlcnJvciBhZnRlciBzdWNjZWVkaW5nLCBzbyBmb3Igbm93IHdlJ3JlIGp1c3RcbiAgICAgICAgLy8gY2F0Y2hpbmcgaXQgYW5kIGNoZWNraW5nIGlmIHRoZSBmaWxlIGV4aXN0cyBcdTAwQUZcXF8oXHUzMEM0KV8vXHUwMEFGXG4gICAgICAgIGF3YWl0IHJlbmFtZShkZWNvbXByZXNzZWRCaW5QYXRoLCB0aGlzLmNsaVBhdGgpLmNhdGNoKCgpID0+IG51bGwpO1xuICAgICAgICBhd2FpdCB3YWl0Rm9yRmlsZUF2YWlsYWJsZSh0aGlzLmNsaVBhdGgpO1xuXG4gICAgICAgIGF3YWl0IGNobW9kKHRoaXMuY2xpUGF0aCwgXCI3NTVcIik7XG4gICAgICAgIGF3YWl0IHJtKHppcFBhdGgsIHsgZm9yY2U6IHRydWUgfSk7XG5cbiAgICAgICAgQ2FjaGUuc2V0KENBQ0hFX0tFWVMuQ0xJX1ZFUlNJT04sIGNsaUluZm8udmVyc2lvbik7XG4gICAgICAgIHRoaXMud2FzQ2xpVXBkYXRlZCA9IHRydWU7XG4gICAgICB9IGNhdGNoIChleHRyYWN0RXJyb3IpIHtcbiAgICAgICAgdG9hc3QudGl0bGUgPSBcIkZhaWxlZCB0byBleHRyYWN0IEJpdHdhcmRlbiBDTElcIjtcbiAgICAgICAgdGhyb3cgZXh0cmFjdEVycm9yO1xuICAgICAgfVxuICAgICAgYXdhaXQgdG9hc3QuaGlkZSgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0b2FzdC5tZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFbnN1cmVDbGlCaW5FcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlBsZWFzZSB0cnkgYWdhaW5cIjtcbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuRmFpbHVyZTtcblxuICAgICAgdW5saW5rQWxsU3luYyh6aXBQYXRoLCB0aGlzLmNsaVBhdGgpO1xuXG4gICAgICBpZiAoIWVudmlyb25tZW50LmlzRGV2ZWxvcG1lbnQpIEJpbkRvd25sb2FkTG9nZ2VyLmxvZ0Vycm9yKGVycm9yKTtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB0aHJvdyBuZXcgRW5zdXJlQ2xpQmluRXJyb3IoZXJyb3IubWVzc2FnZSwgZXJyb3Iuc3RhY2spO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGF3YWl0IHRvYXN0LnJlc3RvcmUoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHJldHJpZXZlQW5kQ2FjaGVDbGlWZXJzaW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVycm9yLCByZXN1bHQgfSA9IGF3YWl0IHRoaXMuZ2V0VmVyc2lvbigpO1xuICAgICAgaWYgKCFlcnJvcikgQ2FjaGUuc2V0KENBQ0hFX0tFWVMuQ0xJX1ZFUlNJT04sIHJlc3VsdCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gcmV0cmlldmUgYW5kIGNhY2hlIGNsaSB2ZXJzaW9uXCIsIGVycm9yLCB7IGNhcHR1cmVUb1JheWNhc3Q6IHRydWUgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0NsaUJpbklzUmVhZHkoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWV4aXN0c1N5bmModGhpcy5jbGlQYXRoKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgYWNjZXNzU3luYyhmaWxlUGF0aCwgY29uc3RhbnRzLlhfT0spO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCB7XG4gICAgICBjaG1vZFN5bmMoZmlsZVBhdGgsIFwiNzU1XCIpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgc2V0U2Vzc2lvblRva2VuKHRva2VuOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmVudiA9IHtcbiAgICAgIC4uLnRoaXMuZW52LFxuICAgICAgQldfU0VTU0lPTjogdG9rZW4sXG4gICAgfTtcbiAgfVxuXG4gIGNsZWFyU2Vzc2lvblRva2VuKCk6IHZvaWQge1xuICAgIGRlbGV0ZSB0aGlzLmVudi5CV19TRVNTSU9OO1xuICB9XG5cbiAgd2l0aFNlc3Npb24odG9rZW46IHN0cmluZyk6IHRoaXMge1xuICAgIHRoaXMudGVtcFNlc3Npb25Ub2tlbiA9IHRva2VuO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHRoaXM+IHtcbiAgICBhd2FpdCB0aGlzLmluaXRQcm9taXNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXN5bmMgY2hlY2tTZXJ2ZXJVcmwoc2VydmVyVXJsOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBDaGVjayB0aGUgQ0xJIGhhcyBiZWVuIGNvbmZpZ3VyZWQgdG8gdXNlIHRoZSBwcmVmZXJlbmNlIFVybFxuICAgIGNvbnN0IHN0b3JlZFNlcnZlciA9IGF3YWl0IExvY2FsU3RvcmFnZS5nZXRJdGVtPHN0cmluZz4oTE9DQUxfU1RPUkFHRV9LRVkuU0VSVkVSX1VSTCk7XG4gICAgaWYgKCFzZXJ2ZXJVcmwgfHwgc3RvcmVkU2VydmVyID09PSBzZXJ2ZXJVcmwpIHJldHVybjtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc2VydmVyIFVybFxuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgdGhpcy5zaG93VG9hc3Qoe1xuICAgICAgc3R5bGU6IFRvYXN0LlN0eWxlLkFuaW1hdGVkLFxuICAgICAgdGl0bGU6IFwiU3dpdGNoaW5nIHNlcnZlci4uLlwiLFxuICAgICAgbWVzc2FnZTogXCJCaXR3YXJkZW4gc2VydmVyIHByZWZlcmVuY2UgY2hhbmdlZFwiLFxuICAgIH0pO1xuICAgIHRyeSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmxvZ291dCgpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIEl0IGRvZXNuJ3QgbWF0dGVyIGlmIHdlIHdlcmVuJ3QgbG9nZ2VkIGluLlxuICAgICAgfVxuICAgICAgLy8gSWYgVVJMIGlzIGVtcHR5LCBzZXQgaXQgdG8gdGhlIGRlZmF1bHRcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJjb25maWdcIiwgXCJzZXJ2ZXJcIiwgc2VydmVyVXJsIHx8IERFRkFVTFRfU0VSVkVSX1VSTF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgYXdhaXQgTG9jYWxTdG9yYWdlLnNldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuU0VSVkVSX1VSTCwgc2VydmVyVXJsKTtcblxuICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5TdWNjZXNzO1xuICAgICAgdG9hc3QudGl0bGUgPSBcIlN1Y2Nlc3NcIjtcbiAgICAgIHRvYXN0Lm1lc3NhZ2UgPSBcIkJpdHdhcmRlbiBzZXJ2ZXIgY2hhbmdlZFwiO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLkZhaWx1cmU7XG4gICAgICB0b2FzdC50aXRsZSA9IFwiRmFpbGVkIHRvIHN3aXRjaCBzZXJ2ZXJcIjtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRvYXN0Lm1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9hc3QubWVzc2FnZSA9IFwiVW5rbm93biBlcnJvciBvY2N1cnJlZFwiO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBhd2FpdCB0b2FzdC5yZXN0b3JlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBleGVjKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBFeGVjUHJvcHMpOiBQcm9taXNlPEV4ZWNhQ2hpbGRQcm9jZXNzPiB7XG4gICAgY29uc3QgeyBhYm9ydENvbnRyb2xsZXIsIGlucHV0ID0gXCJcIiwgcmVzZXRWYXVsdFRpbWVvdXQgfSA9IG9wdGlvbnMgPz8ge307XG5cbiAgICBsZXQgZW52ID0gdGhpcy5lbnY7XG4gICAgaWYgKHRoaXMudGVtcFNlc3Npb25Ub2tlbikge1xuICAgICAgZW52ID0geyAuLi5lbnYsIEJXX1NFU1NJT046IHRoaXMudGVtcFNlc3Npb25Ub2tlbiB9O1xuICAgICAgdGhpcy50ZW1wU2Vzc2lvblRva2VuID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWNhKHRoaXMuY2xpUGF0aCwgYXJncywgeyBpbnB1dCwgZW52LCBzaWduYWw6IGFib3J0Q29udHJvbGxlcj8uc2lnbmFsIH0pO1xuXG4gICAgaWYgKHRoaXMuaXNQcm9tcHRXYWl0aW5nRm9yTWFzdGVyUGFzc3dvcmQocmVzdWx0KSkge1xuICAgICAgLyogc2luY2Ugd2UgaGF2ZSB0aGUgc2Vzc2lvbiB0b2tlbiBpbiB0aGUgZW52LCB0aGUgcGFzc3dvcmQgXG4gICAgICBzaG91bGQgbm90IGJlIHJlcXVlc3RlZCwgdW5sZXNzIHRoZSB2YXVsdCBpcyBsb2NrZWQgKi9cbiAgICAgIGF3YWl0IHRoaXMubG9jaygpO1xuICAgICAgdGhyb3cgbmV3IFZhdWx0SXNMb2NrZWRFcnJvcigpO1xuICAgIH1cblxuICAgIGlmIChyZXNldFZhdWx0VGltZW91dCkge1xuICAgICAgYXdhaXQgTG9jYWxTdG9yYWdlLnNldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuTEFTVF9BQ1RJVklUWV9USU1FLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBhc3luYyBnZXRWZXJzaW9uKCk6IFByb21pc2U8TWF5YmVFcnJvcjxzdHJpbmc+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0OiByZXN1bHQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCItLXZlcnNpb25cIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0IH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGdldCBjbGkgdmVyc2lvblwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbG9naW4oKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJsb2dpblwiLCBcIi0tYXBpa2V5XCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwibG9naW5cIiwgXCJ1bmxvY2tlZFwiKTtcbiAgICAgIGF3YWl0IHRoaXMuY2FsbEFjdGlvbkxpc3RlbmVycyhcImxvZ2luXCIpO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gbG9naW5cIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxvZ291dChvcHRpb25zPzogTG9nb3V0T3B0aW9ucyk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIGNvbnN0IHsgcmVhc29uLCBpbW1lZGlhdGUgPSBmYWxzZSB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICB0cnkge1xuICAgICAgaWYgKGltbWVkaWF0ZSkgYXdhaXQgdGhpcy5oYW5kbGVQb3N0TG9nb3V0KHJlYXNvbik7XG5cbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJsb2dvdXRcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwibG9nb3V0XCIsIFwidW5hdXRoZW50aWNhdGVkXCIpO1xuICAgICAgaWYgKCFpbW1lZGlhdGUpIGF3YWl0IHRoaXMuaGFuZGxlUG9zdExvZ291dChyZWFzb24pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gbG9nb3V0XCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsb2NrKG9wdGlvbnM/OiBMb2NrT3B0aW9ucyk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIGNvbnN0IHsgcmVhc29uLCBjaGVja1ZhdWx0U3RhdHVzID0gZmFsc2UsIGltbWVkaWF0ZSA9IGZhbHNlIH0gPSBvcHRpb25zID8/IHt9O1xuICAgIHRyeSB7XG4gICAgICBpZiAoaW1tZWRpYXRlKSBhd2FpdCB0aGlzLmNhbGxBY3Rpb25MaXN0ZW5lcnMoXCJsb2NrXCIsIHJlYXNvbik7XG4gICAgICBpZiAoY2hlY2tWYXVsdFN0YXR1cykge1xuICAgICAgICBjb25zdCB7IGVycm9yLCByZXN1bHQgfSA9IGF3YWl0IHRoaXMuc3RhdHVzKCk7XG4gICAgICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG4gICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcInVuYXV0aGVudGljYXRlZFwiKSByZXR1cm4geyBlcnJvcjogbmV3IE5vdExvZ2dlZEluRXJyb3IoXCJOb3QgbG9nZ2VkIGluXCIpIH07XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJsb2NrXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUxhc3RWYXVsdFN0YXR1cyhcImxvY2tcIiwgXCJsb2NrZWRcIik7XG4gICAgICBpZiAoIWltbWVkaWF0ZSkgYXdhaXQgdGhpcy5jYWxsQWN0aW9uTGlzdGVuZXJzKFwibG9ja1wiLCByZWFzb24pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gbG9jayB2YXVsdFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgdW5sb2NrKHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I8c3RyaW5nPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dDogc2Vzc2lvblRva2VuIH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1widW5sb2NrXCIsIHBhc3N3b3JkLCBcIi0tcmF3XCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgdGhpcy5zZXRTZXNzaW9uVG9rZW4oc2Vzc2lvblRva2VuKTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUxhc3RWYXVsdFN0YXR1cyhcInVubG9ja1wiLCBcInVubG9ja2VkXCIpO1xuICAgICAgYXdhaXQgdGhpcy5jYWxsQWN0aW9uTGlzdGVuZXJzKFwidW5sb2NrXCIsIHBhc3N3b3JkLCBzZXNzaW9uVG9rZW4pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBzZXNzaW9uVG9rZW4gfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gdW5sb2NrIHZhdWx0XCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzeW5jKCk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoW1wic3luY1wiXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogdW5kZWZpbmVkIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHN5bmMgdmF1bHRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEl0ZW0oaWQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcjxJdGVtPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImdldFwiLCBcIml0ZW1cIiwgaWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPEl0ZW0+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IGl0ZW1cIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxpc3RJdGVtcygpOiBQcm9taXNlPE1heWJlRXJyb3I8SXRlbVtdPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImxpc3RcIiwgXCJpdGVtc1wiXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIGNvbnN0IGl0ZW1zID0gSlNPTi5wYXJzZTxJdGVtW10+KHN0ZG91dCk7XG4gICAgICAvLyBGaWx0ZXIgb3V0IGl0ZW1zIHdpdGhvdXQgYSBuYW1lIHByb3BlcnR5ICh0aGV5IGFyZSBub3QgZGlzcGxheWVkIGluIHRoZSBiaXR3YXJkZW4gYXBwKVxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBpdGVtcy5maWx0ZXIoKGl0ZW06IEl0ZW0pID0+ICEhaXRlbS5uYW1lKSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsaXN0IGl0ZW1zXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjcmVhdGVMb2dpbkl0ZW0ob3B0aW9uczogQ3JlYXRlTG9naW5JdGVtT3B0aW9ucyk6IFByb21pc2U8TWF5YmVFcnJvcjxJdGVtPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVycm9yOiBpdGVtVGVtcGxhdGVFcnJvciwgcmVzdWx0OiBpdGVtVGVtcGxhdGUgfSA9IGF3YWl0IHRoaXMuZ2V0VGVtcGxhdGU8SXRlbT4oXCJpdGVtXCIpO1xuICAgICAgaWYgKGl0ZW1UZW1wbGF0ZUVycm9yKSB0aHJvdyBpdGVtVGVtcGxhdGVFcnJvcjtcblxuICAgICAgY29uc3QgeyBlcnJvcjogbG9naW5UZW1wbGF0ZUVycm9yLCByZXN1bHQ6IGxvZ2luVGVtcGxhdGUgfSA9IGF3YWl0IHRoaXMuZ2V0VGVtcGxhdGU8TG9naW4+KFwiaXRlbS5sb2dpblwiKTtcbiAgICAgIGlmIChsb2dpblRlbXBsYXRlRXJyb3IpIHRocm93IGxvZ2luVGVtcGxhdGVFcnJvcjtcblxuICAgICAgaXRlbVRlbXBsYXRlLm5hbWUgPSBvcHRpb25zLm5hbWU7XG4gICAgICBpdGVtVGVtcGxhdGUudHlwZSA9IEl0ZW1UeXBlLkxPR0lOO1xuICAgICAgaXRlbVRlbXBsYXRlLmZvbGRlcklkID0gb3B0aW9ucy5mb2xkZXJJZCB8fCBudWxsO1xuICAgICAgaXRlbVRlbXBsYXRlLmxvZ2luID0gbG9naW5UZW1wbGF0ZTtcbiAgICAgIGl0ZW1UZW1wbGF0ZS5ub3RlcyA9IG51bGw7XG5cbiAgICAgIGxvZ2luVGVtcGxhdGUudXNlcm5hbWUgPSBvcHRpb25zLnVzZXJuYW1lIHx8IG51bGw7XG4gICAgICBsb2dpblRlbXBsYXRlLnBhc3N3b3JkID0gb3B0aW9ucy5wYXNzd29yZDtcbiAgICAgIGxvZ2luVGVtcGxhdGUudG90cCA9IG51bGw7XG4gICAgICBsb2dpblRlbXBsYXRlLmZpZG8yQ3JlZGVudGlhbHMgPSB1bmRlZmluZWQ7XG5cbiAgICAgIGlmIChvcHRpb25zLnVyaSkge1xuICAgICAgICBsb2dpblRlbXBsYXRlLnVyaXMgPSBbeyBtYXRjaDogbnVsbCwgdXJpOiBvcHRpb25zLnVyaSB9XTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgeyByZXN1bHQ6IGVuY29kZWRJdGVtLCBlcnJvcjogZW5jb2RlRXJyb3IgfSA9IGF3YWl0IHRoaXMuZW5jb2RlKEpTT04uc3RyaW5naWZ5KGl0ZW1UZW1wbGF0ZSkpO1xuICAgICAgaWYgKGVuY29kZUVycm9yKSB0aHJvdyBlbmNvZGVFcnJvcjtcblxuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJjcmVhdGVcIiwgXCJpdGVtXCIsIGVuY29kZWRJdGVtXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxJdGVtPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNyZWF0ZSBsb2dpbiBpdGVtXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsaXN0Rm9sZGVycygpOiBQcm9taXNlPE1heWJlRXJyb3I8Rm9sZGVyW10+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wibGlzdFwiLCBcImZvbGRlcnNcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8Rm9sZGVyW10+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gbGlzdCBmb2xkZXJcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZUZvbGRlcihuYW1lOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBlcnJvciwgcmVzdWx0OiBmb2xkZXIgfSA9IGF3YWl0IHRoaXMuZ2V0VGVtcGxhdGUoXCJmb2xkZXJcIik7XG4gICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuXG4gICAgICBmb2xkZXIubmFtZSA9IG5hbWU7XG4gICAgICBjb25zdCB7IHJlc3VsdDogZW5jb2RlZEZvbGRlciwgZXJyb3I6IGVuY29kZUVycm9yIH0gPSBhd2FpdCB0aGlzLmVuY29kZShKU09OLnN0cmluZ2lmeShmb2xkZXIpKTtcbiAgICAgIGlmIChlbmNvZGVFcnJvcikgdGhyb3cgZW5jb2RlRXJyb3I7XG5cbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJjcmVhdGVcIiwgXCJmb2xkZXJcIiwgZW5jb2RlZEZvbGRlcl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBjcmVhdGUgZm9sZGVyXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRUb3RwKGlkOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I8c3RyaW5nPj4ge1xuICAgIHRyeSB7XG4gICAgICAvLyB0aGlzIGNvdWxkIHJldHVybiBzb21ldGhpbmcgbGlrZSBcIk5vdCBmb3VuZC5cIiBidXQgY2hlY2tzIGZvciB0b3RwIGNvZGUgYXJlIGRvbmUgYmVmb3JlIGNhbGxpbmcgdGhpcyBmdW5jdGlvblxuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJnZXRcIiwgXCJ0b3RwXCIsIGlkXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogc3Rkb3V0IH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGdldCBUT1RQXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzdGF0dXMoKTogUHJvbWlzZTxNYXliZUVycm9yPFZhdWx0U3RhdGU+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wic3RhdHVzXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxWYXVsdFN0YXRlPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGdldCBzdGF0dXNcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNoZWNrTG9ja1N0YXR1cygpOiBQcm9taXNlPFZhdWx0U3RhdHVzPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJ1bmxvY2tcIiwgXCItLWNoZWNrXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUxhc3RWYXVsdFN0YXR1cyhcImNoZWNrTG9ja1N0YXR1c1wiLCBcInVubG9ja2VkXCIpO1xuICAgICAgcmV0dXJuIFwidW5sb2NrZWRcIjtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBjaGVjayBsb2NrIHN0YXR1c1wiLCBlcnJvcik7XG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAoZXJyb3IgYXMgRXhlY2FFcnJvcikuc3RkZXJyO1xuICAgICAgaWYgKGVycm9yTWVzc2FnZSA9PT0gXCJWYXVsdCBpcyBsb2NrZWQuXCIpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwiY2hlY2tMb2NrU3RhdHVzXCIsIFwibG9ja2VkXCIpO1xuICAgICAgICByZXR1cm4gXCJsb2NrZWRcIjtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUxhc3RWYXVsdFN0YXR1cyhcImNoZWNrTG9ja1N0YXR1c1wiLCBcInVuYXV0aGVudGljYXRlZFwiKTtcbiAgICAgIHJldHVybiBcInVuYXV0aGVudGljYXRlZFwiO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldFRlbXBsYXRlPFQgPSBhbnk+KHR5cGU6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcjxUPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImdldFwiLCBcInRlbXBsYXRlXCIsIHR5cGVdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFQ+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IHRlbXBsYXRlXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBlbmNvZGUoaW5wdXQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcjxzdHJpbmc+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiZW5jb2RlXCJdLCB7IGlucHV0LCByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHN0ZG91dCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBlbmNvZGVcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdlbmVyYXRlUGFzc3dvcmQob3B0aW9ucz86IFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucywgYWJvcnRDb250cm9sbGVyPzogQWJvcnRDb250cm9sbGVyKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBhcmdzID0gb3B0aW9ucyA/IGdldFBhc3N3b3JkR2VuZXJhdGluZ0FyZ3Mob3B0aW9ucykgOiBbXTtcbiAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImdlbmVyYXRlXCIsIC4uLmFyZ3NdLCB7IGFib3J0Q29udHJvbGxlciwgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgIHJldHVybiBzdGRvdXQ7XG4gIH1cblxuICBhc3luYyBsaXN0U2VuZHMoKTogUHJvbWlzZTxNYXliZUVycm9yPFNlbmRbXT4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJzZW5kXCIsIFwibGlzdFwiXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxTZW5kW10+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gbGlzdCBzZW5kc1wiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY3JlYXRlU2VuZCh2YWx1ZXM6IFNlbmRDcmVhdGVQYXlsb2FkKTogUHJvbWlzZTxNYXliZUVycm9yPFNlbmQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZXJyb3I6IHRlbXBsYXRlRXJyb3IsIHJlc3VsdDogdGVtcGxhdGUgfSA9IGF3YWl0IHRoaXMuZ2V0VGVtcGxhdGUoXG4gICAgICAgIHZhbHVlcy50eXBlID09PSBTZW5kVHlwZS5UZXh0ID8gXCJzZW5kLnRleHRcIiA6IFwic2VuZC5maWxlXCJcbiAgICAgICk7XG4gICAgICBpZiAodGVtcGxhdGVFcnJvcikgdGhyb3cgdGVtcGxhdGVFcnJvcjtcblxuICAgICAgY29uc3QgcGF5bG9hZCA9IHByZXBhcmVTZW5kUGF5bG9hZCh0ZW1wbGF0ZSwgdmFsdWVzKTtcbiAgICAgIGNvbnN0IHsgcmVzdWx0OiBlbmNvZGVkUGF5bG9hZCwgZXJyb3I6IGVuY29kZUVycm9yIH0gPSBhd2FpdCB0aGlzLmVuY29kZShKU09OLnN0cmluZ2lmeShwYXlsb2FkKSk7XG4gICAgICBpZiAoZW5jb2RlRXJyb3IpIHRocm93IGVuY29kZUVycm9yO1xuXG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJjcmVhdGVcIiwgZW5jb2RlZFBheWxvYWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuXG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8U2VuZD4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBjcmVhdGUgc2VuZFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZWRpdFNlbmQodmFsdWVzOiBTZW5kQ3JlYXRlUGF5bG9hZCk6IFByb21pc2U8TWF5YmVFcnJvcjxTZW5kPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHJlc3VsdDogZW5jb2RlZFBheWxvYWQsIGVycm9yOiBlbmNvZGVFcnJvciB9ID0gYXdhaXQgdGhpcy5lbmNvZGUoSlNPTi5zdHJpbmdpZnkodmFsdWVzKSk7XG4gICAgICBpZiAoZW5jb2RlRXJyb3IpIHRocm93IGVuY29kZUVycm9yO1xuXG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJlZGl0XCIsIGVuY29kZWRQYXlsb2FkXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxTZW5kPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGRlbGV0ZSBzZW5kXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBkZWxldGVTZW5kKGlkOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJkZWxldGVcIiwgaWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZGVsZXRlIHNlbmRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlbW92ZVNlbmRQYXNzd29yZChpZDogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJzZW5kXCIsIFwicmVtb3ZlLXBhc3N3b3JkXCIsIGlkXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogdW5kZWZpbmVkIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHJlbW92ZSBzZW5kIHBhc3N3b3JkXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyByZWNlaXZlU2VuZEluZm8odXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZWNlaXZlU2VuZE9wdGlvbnMpOiBQcm9taXNlPE1heWJlRXJyb3I8UmVjZWl2ZWRTZW5kPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCwgc3RkZXJyIH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcInJlY2VpdmVcIiwgdXJsLCBcIi0tb2JqXCJdLCB7XG4gICAgICAgIHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlLFxuICAgICAgICBpbnB1dDogb3B0aW9ucz8ucGFzc3dvcmQsXG4gICAgICB9KTtcbiAgICAgIGlmICghc3Rkb3V0ICYmIC9JbnZhbGlkIHBhc3N3b3JkL2kudGVzdChzdGRlcnIpKSByZXR1cm4geyBlcnJvcjogbmV3IFNlbmRJbnZhbGlkUGFzc3dvcmRFcnJvcigpIH07XG4gICAgICBpZiAoIXN0ZG91dCAmJiAvU2VuZCBwYXNzd29yZC9pLnRlc3Qoc3RkZXJyKSkgcmV0dXJuIHsgZXJyb3I6IG5ldyBTZW5kTmVlZHNQYXNzd29yZEVycm9yKCkgfTtcblxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFJlY2VpdmVkU2VuZD4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gKGV4ZWNFcnJvciBhcyBFeGVjYUVycm9yKS5zdGRlcnI7XG4gICAgICBpZiAoL0ludmFsaWQgcGFzc3dvcmQvZ2kudGVzdChlcnJvck1lc3NhZ2UpKSByZXR1cm4geyBlcnJvcjogbmV3IFNlbmRJbnZhbGlkUGFzc3dvcmRFcnJvcigpIH07XG4gICAgICBpZiAoL1NlbmQgcGFzc3dvcmQvZ2kudGVzdChlcnJvck1lc3NhZ2UpKSByZXR1cm4geyBlcnJvcjogbmV3IFNlbmROZWVkc1Bhc3N3b3JkRXJyb3IoKSB9O1xuXG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHJlY2VpdmUgc2VuZCBvYmpcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlY2VpdmVTZW5kKHVybDogc3RyaW5nLCBvcHRpb25zPzogUmVjZWl2ZVNlbmRPcHRpb25zKTogUHJvbWlzZTxNYXliZUVycm9yPHN0cmluZz4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzYXZlUGF0aCwgcGFzc3dvcmQgfSA9IG9wdGlvbnMgPz8ge307XG4gICAgICBjb25zdCBhcmdzID0gW1wic2VuZFwiLCBcInJlY2VpdmVcIiwgdXJsXTtcbiAgICAgIGlmIChzYXZlUGF0aCkgYXJncy5wdXNoKFwiLS1vdXRwdXRcIiwgc2F2ZVBhdGgpO1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhhcmdzLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlLCBpbnB1dDogcGFzc3dvcmQgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHN0ZG91dCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byByZWNlaXZlIHNlbmRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIHV0aWxzIGJlbG93XG5cbiAgYXN5bmMgc2F2ZUxhc3RWYXVsdFN0YXR1cyhjYWxsTmFtZTogc3RyaW5nLCBzdGF0dXM6IFZhdWx0U3RhdHVzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgTG9jYWxTdG9yYWdlLnNldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuVkFVTFRfTEFTVF9TVEFUVVMsIHN0YXR1cyk7XG4gIH1cblxuICBhc3luYyBnZXRMYXN0U2F2ZWRWYXVsdFN0YXR1cygpOiBQcm9taXNlPFZhdWx0U3RhdHVzIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgbGFzdFNhdmVkU3RhdHVzID0gYXdhaXQgTG9jYWxTdG9yYWdlLmdldEl0ZW08VmF1bHRTdGF0dXM+KExPQ0FMX1NUT1JBR0VfS0VZLlZBVUxUX0xBU1RfU1RBVFVTKTtcbiAgICBpZiAoIWxhc3RTYXZlZFN0YXR1cykge1xuICAgICAgY29uc3QgdmF1bHRTdGF0dXMgPSBhd2FpdCB0aGlzLnN0YXR1cygpO1xuICAgICAgcmV0dXJuIHZhdWx0U3RhdHVzLnJlc3VsdD8uc3RhdHVzO1xuICAgIH1cbiAgICByZXR1cm4gbGFzdFNhdmVkU3RhdHVzO1xuICB9XG5cbiAgcHJpdmF0ZSBpc1Byb21wdFdhaXRpbmdGb3JNYXN0ZXJQYXNzd29yZChyZXN1bHQ6IEV4ZWNhUmV0dXJuVmFsdWUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEocmVzdWx0LnN0ZGVyciAmJiByZXN1bHQuc3RkZXJyLmluY2x1ZGVzKFwiTWFzdGVyIHBhc3N3b3JkXCIpKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlUG9zdExvZ291dChyZWFzb24/OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmNsZWFyU2Vzc2lvblRva2VuKCk7XG4gICAgYXdhaXQgdGhpcy5jYWxsQWN0aW9uTGlzdGVuZXJzKFwibG9nb3V0XCIsIHJlYXNvbik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGhhbmRsZUNvbW1vbkVycm9ycyhlcnJvcjogYW55KTogUHJvbWlzZTx7IGVycm9yPzogTWFudWFsbHlUaHJvd25FcnJvciB9PiB7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gKGVycm9yIGFzIEV4ZWNhRXJyb3IpLnN0ZGVycjtcbiAgICBpZiAoIWVycm9yTWVzc2FnZSkgcmV0dXJuIHt9O1xuXG4gICAgaWYgKC9ub3QgbG9nZ2VkIGluL2kudGVzdChlcnJvck1lc3NhZ2UpKSB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZVBvc3RMb2dvdXQoKTtcbiAgICAgIHJldHVybiB7IGVycm9yOiBuZXcgTm90TG9nZ2VkSW5FcnJvcihcIk5vdCBsb2dnZWQgaW5cIikgfTtcbiAgICB9XG4gICAgaWYgKC9QcmVtaXVtIHN0YXR1cy9pLnRlc3QoZXJyb3JNZXNzYWdlKSkge1xuICAgICAgcmV0dXJuIHsgZXJyb3I6IG5ldyBQcmVtaXVtRmVhdHVyZUVycm9yKCkgfTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgc2V0QWN0aW9uTGlzdGVuZXI8QSBleHRlbmRzIGtleW9mIEFjdGlvbkxpc3RlbmVycz4oYWN0aW9uOiBBLCBsaXN0ZW5lcjogQWN0aW9uTGlzdGVuZXJzW0FdKTogdGhpcyB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5hY3Rpb25MaXN0ZW5lcnMuZ2V0KGFjdGlvbik7XG4gICAgaWYgKGxpc3RlbmVycyAmJiBsaXN0ZW5lcnMuc2l6ZSA+IDApIHtcbiAgICAgIGxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFjdGlvbkxpc3RlbmVycy5zZXQoYWN0aW9uLCBuZXcgU2V0KFtsaXN0ZW5lcl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZW1vdmVBY3Rpb25MaXN0ZW5lcjxBIGV4dGVuZHMga2V5b2YgQWN0aW9uTGlzdGVuZXJzPihhY3Rpb246IEEsIGxpc3RlbmVyOiBBY3Rpb25MaXN0ZW5lcnNbQV0pOiB0aGlzIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmFjdGlvbkxpc3RlbmVycy5nZXQoYWN0aW9uKTtcbiAgICBpZiAobGlzdGVuZXJzICYmIGxpc3RlbmVycy5zaXplID4gMCkge1xuICAgICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjYWxsQWN0aW9uTGlzdGVuZXJzPEEgZXh0ZW5kcyBrZXlvZiBBY3Rpb25MaXN0ZW5lcnM+KFxuICAgIGFjdGlvbjogQSxcbiAgICAuLi5hcmdzOiBQYXJhbWV0ZXJzPE5vbk51bGxhYmxlPEFjdGlvbkxpc3RlbmVyc1tBXT4+XG4gICkge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuYWN0aW9uTGlzdGVuZXJzLmdldChhY3Rpb24pO1xuICAgIGlmIChsaXN0ZW5lcnMgJiYgbGlzdGVuZXJzLnNpemUgPiAwKSB7XG4gICAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIGxpc3RlbmVycykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IChsaXN0ZW5lciBhcyBhbnkpPy4oLi4uYXJncyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY2FwdHVyZUV4Y2VwdGlvbihgRXJyb3IgY2FsbGluZyBiaXR3YXJkZW4gYWN0aW9uIGxpc3RlbmVyIGZvciAke2FjdGlvbn1gLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNob3dUb2FzdCA9IGFzeW5jICh0b2FzdE9wdHM6IFRvYXN0Lk9wdGlvbnMpOiBQcm9taXNlPFRvYXN0ICYgeyByZXN0b3JlOiAoKSA9PiBQcm9taXNlPHZvaWQ+IH0+ID0+IHtcbiAgICBpZiAodGhpcy50b2FzdEluc3RhbmNlKSB7XG4gICAgICBjb25zdCBwcmV2aW91c1N0YXRlVG9hc3RPcHRzOiBUb2FzdC5PcHRpb25zID0ge1xuICAgICAgICBtZXNzYWdlOiB0aGlzLnRvYXN0SW5zdGFuY2UubWVzc2FnZSxcbiAgICAgICAgdGl0bGU6IHRoaXMudG9hc3RJbnN0YW5jZS50aXRsZSxcbiAgICAgICAgcHJpbWFyeUFjdGlvbjogdGhpcy50b2FzdEluc3RhbmNlLnByaW1hcnlBY3Rpb24sXG4gICAgICAgIHNlY29uZGFyeUFjdGlvbjogdGhpcy50b2FzdEluc3RhbmNlLnNlY29uZGFyeUFjdGlvbixcbiAgICAgIH07XG5cbiAgICAgIGlmICh0b2FzdE9wdHMuc3R5bGUpIHRoaXMudG9hc3RJbnN0YW5jZS5zdHlsZSA9IHRvYXN0T3B0cy5zdHlsZTtcbiAgICAgIHRoaXMudG9hc3RJbnN0YW5jZS5tZXNzYWdlID0gdG9hc3RPcHRzLm1lc3NhZ2U7XG4gICAgICB0aGlzLnRvYXN0SW5zdGFuY2UudGl0bGUgPSB0b2FzdE9wdHMudGl0bGU7XG4gICAgICB0aGlzLnRvYXN0SW5zdGFuY2UucHJpbWFyeUFjdGlvbiA9IHRvYXN0T3B0cy5wcmltYXJ5QWN0aW9uO1xuICAgICAgdGhpcy50b2FzdEluc3RhbmNlLnNlY29uZGFyeUFjdGlvbiA9IHRvYXN0T3B0cy5zZWNvbmRhcnlBY3Rpb247XG4gICAgICBhd2FpdCB0aGlzLnRvYXN0SW5zdGFuY2Uuc2hvdygpO1xuXG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih0aGlzLnRvYXN0SW5zdGFuY2UsIHtcbiAgICAgICAgcmVzdG9yZTogYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGF3YWl0IHRoaXMuc2hvd1RvYXN0KHByZXZpb3VzU3RhdGVUb2FzdE9wdHMpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgc2hvd1RvYXN0KHRvYXN0T3B0cyk7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih0b2FzdCwgeyByZXN0b3JlOiAoKSA9PiB0b2FzdC5oaWRlKCkgfSk7XG4gICAgfVxuICB9O1xufVxuIiwgImltcG9ydCB7QnVmZmVyfSBmcm9tICdub2RlOmJ1ZmZlcic7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IGNoaWxkUHJvY2VzcyBmcm9tICdub2RlOmNoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCBjcm9zc1NwYXduIGZyb20gJ2Nyb3NzLXNwYXduJztcbmltcG9ydCBzdHJpcEZpbmFsTmV3bGluZSBmcm9tICdzdHJpcC1maW5hbC1uZXdsaW5lJztcbmltcG9ydCB7bnBtUnVuUGF0aEVudn0gZnJvbSAnbnBtLXJ1bi1wYXRoJztcbmltcG9ydCBvbmV0aW1lIGZyb20gJ29uZXRpbWUnO1xuaW1wb3J0IHttYWtlRXJyb3J9IGZyb20gJy4vbGliL2Vycm9yLmpzJztcbmltcG9ydCB7bm9ybWFsaXplU3RkaW8sIG5vcm1hbGl6ZVN0ZGlvTm9kZX0gZnJvbSAnLi9saWIvc3RkaW8uanMnO1xuaW1wb3J0IHtzcGF3bmVkS2lsbCwgc3Bhd25lZENhbmNlbCwgc2V0dXBUaW1lb3V0LCB2YWxpZGF0ZVRpbWVvdXQsIHNldEV4aXRIYW5kbGVyfSBmcm9tICcuL2xpYi9raWxsLmpzJztcbmltcG9ydCB7aGFuZGxlSW5wdXQsIGdldFNwYXduZWRSZXN1bHQsIG1ha2VBbGxTdHJlYW0sIHZhbGlkYXRlSW5wdXRTeW5jfSBmcm9tICcuL2xpYi9zdHJlYW0uanMnO1xuaW1wb3J0IHttZXJnZVByb21pc2UsIGdldFNwYXduZWRQcm9taXNlfSBmcm9tICcuL2xpYi9wcm9taXNlLmpzJztcbmltcG9ydCB7am9pbkNvbW1hbmQsIHBhcnNlQ29tbWFuZCwgZ2V0RXNjYXBlZENvbW1hbmR9IGZyb20gJy4vbGliL2NvbW1hbmQuanMnO1xuXG5jb25zdCBERUZBVUxUX01BWF9CVUZGRVIgPSAxMDAwICogMTAwMCAqIDEwMDtcblxuY29uc3QgZ2V0RW52ID0gKHtlbnY6IGVudk9wdGlvbiwgZXh0ZW5kRW52LCBwcmVmZXJMb2NhbCwgbG9jYWxEaXIsIGV4ZWNQYXRofSkgPT4ge1xuXHRjb25zdCBlbnYgPSBleHRlbmRFbnYgPyB7Li4ucHJvY2Vzcy5lbnYsIC4uLmVudk9wdGlvbn0gOiBlbnZPcHRpb247XG5cblx0aWYgKHByZWZlckxvY2FsKSB7XG5cdFx0cmV0dXJuIG5wbVJ1blBhdGhFbnYoe2VudiwgY3dkOiBsb2NhbERpciwgZXhlY1BhdGh9KTtcblx0fVxuXG5cdHJldHVybiBlbnY7XG59O1xuXG5jb25zdCBoYW5kbGVBcmd1bWVudHMgPSAoZmlsZSwgYXJncywgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IHBhcnNlZCA9IGNyb3NzU3Bhd24uX3BhcnNlKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xuXHRmaWxlID0gcGFyc2VkLmNvbW1hbmQ7XG5cdGFyZ3MgPSBwYXJzZWQuYXJncztcblx0b3B0aW9ucyA9IHBhcnNlZC5vcHRpb25zO1xuXG5cdG9wdGlvbnMgPSB7XG5cdFx0bWF4QnVmZmVyOiBERUZBVUxUX01BWF9CVUZGRVIsXG5cdFx0YnVmZmVyOiB0cnVlLFxuXHRcdHN0cmlwRmluYWxOZXdsaW5lOiB0cnVlLFxuXHRcdGV4dGVuZEVudjogdHJ1ZSxcblx0XHRwcmVmZXJMb2NhbDogZmFsc2UsXG5cdFx0bG9jYWxEaXI6IG9wdGlvbnMuY3dkIHx8IHByb2Nlc3MuY3dkKCksXG5cdFx0ZXhlY1BhdGg6IHByb2Nlc3MuZXhlY1BhdGgsXG5cdFx0ZW5jb2Rpbmc6ICd1dGY4Jyxcblx0XHRyZWplY3Q6IHRydWUsXG5cdFx0Y2xlYW51cDogdHJ1ZSxcblx0XHRhbGw6IGZhbHNlLFxuXHRcdHdpbmRvd3NIaWRlOiB0cnVlLFxuXHRcdC4uLm9wdGlvbnMsXG5cdH07XG5cblx0b3B0aW9ucy5lbnYgPSBnZXRFbnYob3B0aW9ucyk7XG5cblx0b3B0aW9ucy5zdGRpbyA9IG5vcm1hbGl6ZVN0ZGlvKG9wdGlvbnMpO1xuXG5cdGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInICYmIHBhdGguYmFzZW5hbWUoZmlsZSwgJy5leGUnKSA9PT0gJ2NtZCcpIHtcblx0XHQvLyAjMTE2XG5cdFx0YXJncy51bnNoaWZ0KCcvcScpO1xuXHR9XG5cblx0cmV0dXJuIHtmaWxlLCBhcmdzLCBvcHRpb25zLCBwYXJzZWR9O1xufTtcblxuY29uc3QgaGFuZGxlT3V0cHV0ID0gKG9wdGlvbnMsIHZhbHVlLCBlcnJvcikgPT4ge1xuXHRpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzQnVmZmVyKHZhbHVlKSkge1xuXHRcdC8vIFdoZW4gYGV4ZWNhU3luYygpYCBlcnJvcnMsIHdlIG5vcm1hbGl6ZSBpdCB0byAnJyB0byBtaW1pYyBgZXhlY2EoKWBcblx0XHRyZXR1cm4gZXJyb3IgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6ICcnO1xuXHR9XG5cblx0aWYgKG9wdGlvbnMuc3RyaXBGaW5hbE5ld2xpbmUpIHtcblx0XHRyZXR1cm4gc3RyaXBGaW5hbE5ld2xpbmUodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWNhKGZpbGUsIGFyZ3MsIG9wdGlvbnMpIHtcblx0Y29uc3QgcGFyc2VkID0gaGFuZGxlQXJndW1lbnRzKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xuXHRjb25zdCBjb21tYW5kID0gam9pbkNvbW1hbmQoZmlsZSwgYXJncyk7XG5cdGNvbnN0IGVzY2FwZWRDb21tYW5kID0gZ2V0RXNjYXBlZENvbW1hbmQoZmlsZSwgYXJncyk7XG5cblx0dmFsaWRhdGVUaW1lb3V0KHBhcnNlZC5vcHRpb25zKTtcblxuXHRsZXQgc3Bhd25lZDtcblx0dHJ5IHtcblx0XHRzcGF3bmVkID0gY2hpbGRQcm9jZXNzLnNwYXduKHBhcnNlZC5maWxlLCBwYXJzZWQuYXJncywgcGFyc2VkLm9wdGlvbnMpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdC8vIEVuc3VyZSB0aGUgcmV0dXJuZWQgZXJyb3IgaXMgYWx3YXlzIGJvdGggYSBwcm9taXNlIGFuZCBhIGNoaWxkIHByb2Nlc3Ncblx0XHRjb25zdCBkdW1teVNwYXduZWQgPSBuZXcgY2hpbGRQcm9jZXNzLkNoaWxkUHJvY2VzcygpO1xuXHRcdGNvbnN0IGVycm9yUHJvbWlzZSA9IFByb21pc2UucmVqZWN0KG1ha2VFcnJvcih7XG5cdFx0XHRlcnJvcixcblx0XHRcdHN0ZG91dDogJycsXG5cdFx0XHRzdGRlcnI6ICcnLFxuXHRcdFx0YWxsOiAnJyxcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdHBhcnNlZCxcblx0XHRcdHRpbWVkT3V0OiBmYWxzZSxcblx0XHRcdGlzQ2FuY2VsZWQ6IGZhbHNlLFxuXHRcdFx0a2lsbGVkOiBmYWxzZSxcblx0XHR9KSk7XG5cdFx0cmV0dXJuIG1lcmdlUHJvbWlzZShkdW1teVNwYXduZWQsIGVycm9yUHJvbWlzZSk7XG5cdH1cblxuXHRjb25zdCBzcGF3bmVkUHJvbWlzZSA9IGdldFNwYXduZWRQcm9taXNlKHNwYXduZWQpO1xuXHRjb25zdCB0aW1lZFByb21pc2UgPSBzZXR1cFRpbWVvdXQoc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMsIHNwYXduZWRQcm9taXNlKTtcblx0Y29uc3QgcHJvY2Vzc0RvbmUgPSBzZXRFeGl0SGFuZGxlcihzcGF3bmVkLCBwYXJzZWQub3B0aW9ucywgdGltZWRQcm9taXNlKTtcblxuXHRjb25zdCBjb250ZXh0ID0ge2lzQ2FuY2VsZWQ6IGZhbHNlfTtcblxuXHRzcGF3bmVkLmtpbGwgPSBzcGF3bmVkS2lsbC5iaW5kKG51bGwsIHNwYXduZWQua2lsbC5iaW5kKHNwYXduZWQpKTtcblx0c3Bhd25lZC5jYW5jZWwgPSBzcGF3bmVkQ2FuY2VsLmJpbmQobnVsbCwgc3Bhd25lZCwgY29udGV4dCk7XG5cblx0Y29uc3QgaGFuZGxlUHJvbWlzZSA9IGFzeW5jICgpID0+IHtcblx0XHRjb25zdCBbe2Vycm9yLCBleGl0Q29kZSwgc2lnbmFsLCB0aW1lZE91dH0sIHN0ZG91dFJlc3VsdCwgc3RkZXJyUmVzdWx0LCBhbGxSZXN1bHRdID0gYXdhaXQgZ2V0U3Bhd25lZFJlc3VsdChzcGF3bmVkLCBwYXJzZWQub3B0aW9ucywgcHJvY2Vzc0RvbmUpO1xuXHRcdGNvbnN0IHN0ZG91dCA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgc3Rkb3V0UmVzdWx0KTtcblx0XHRjb25zdCBzdGRlcnIgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIHN0ZGVyclJlc3VsdCk7XG5cdFx0Y29uc3QgYWxsID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCBhbGxSZXN1bHQpO1xuXG5cdFx0aWYgKGVycm9yIHx8IGV4aXRDb2RlICE9PSAwIHx8IHNpZ25hbCAhPT0gbnVsbCkge1xuXHRcdFx0Y29uc3QgcmV0dXJuZWRFcnJvciA9IG1ha2VFcnJvcih7XG5cdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRleGl0Q29kZSxcblx0XHRcdFx0c2lnbmFsLFxuXHRcdFx0XHRzdGRvdXQsXG5cdFx0XHRcdHN0ZGVycixcblx0XHRcdFx0YWxsLFxuXHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdFx0cGFyc2VkLFxuXHRcdFx0XHR0aW1lZE91dCxcblx0XHRcdFx0aXNDYW5jZWxlZDogY29udGV4dC5pc0NhbmNlbGVkIHx8IChwYXJzZWQub3B0aW9ucy5zaWduYWwgPyBwYXJzZWQub3B0aW9ucy5zaWduYWwuYWJvcnRlZCA6IGZhbHNlKSxcblx0XHRcdFx0a2lsbGVkOiBzcGF3bmVkLmtpbGxlZCxcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoIXBhcnNlZC5vcHRpb25zLnJlamVjdCkge1xuXHRcdFx0XHRyZXR1cm4gcmV0dXJuZWRFcnJvcjtcblx0XHRcdH1cblxuXHRcdFx0dGhyb3cgcmV0dXJuZWRFcnJvcjtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0ZXhpdENvZGU6IDAsXG5cdFx0XHRzdGRvdXQsXG5cdFx0XHRzdGRlcnIsXG5cdFx0XHRhbGwsXG5cdFx0XHRmYWlsZWQ6IGZhbHNlLFxuXHRcdFx0dGltZWRPdXQ6IGZhbHNlLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IGZhbHNlLFxuXHRcdH07XG5cdH07XG5cblx0Y29uc3QgaGFuZGxlUHJvbWlzZU9uY2UgPSBvbmV0aW1lKGhhbmRsZVByb21pc2UpO1xuXG5cdGhhbmRsZUlucHV0KHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLmlucHV0KTtcblxuXHRzcGF3bmVkLmFsbCA9IG1ha2VBbGxTdHJlYW0oc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMpO1xuXG5cdHJldHVybiBtZXJnZVByb21pc2Uoc3Bhd25lZCwgaGFuZGxlUHJvbWlzZU9uY2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2FTeW5jKGZpbGUsIGFyZ3MsIG9wdGlvbnMpIHtcblx0Y29uc3QgcGFyc2VkID0gaGFuZGxlQXJndW1lbnRzKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xuXHRjb25zdCBjb21tYW5kID0gam9pbkNvbW1hbmQoZmlsZSwgYXJncyk7XG5cdGNvbnN0IGVzY2FwZWRDb21tYW5kID0gZ2V0RXNjYXBlZENvbW1hbmQoZmlsZSwgYXJncyk7XG5cblx0dmFsaWRhdGVJbnB1dFN5bmMocGFyc2VkLm9wdGlvbnMpO1xuXG5cdGxldCByZXN1bHQ7XG5cdHRyeSB7XG5cdFx0cmVzdWx0ID0gY2hpbGRQcm9jZXNzLnNwYXduU3luYyhwYXJzZWQuZmlsZSwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHR0aHJvdyBtYWtlRXJyb3Ioe1xuXHRcdFx0ZXJyb3IsXG5cdFx0XHRzdGRvdXQ6ICcnLFxuXHRcdFx0c3RkZXJyOiAnJyxcblx0XHRcdGFsbDogJycsXG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRwYXJzZWQsXG5cdFx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogZmFsc2UsXG5cdFx0fSk7XG5cdH1cblxuXHRjb25zdCBzdGRvdXQgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIHJlc3VsdC5zdGRvdXQsIHJlc3VsdC5lcnJvcik7XG5cdGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgcmVzdWx0LnN0ZGVyciwgcmVzdWx0LmVycm9yKTtcblxuXHRpZiAocmVzdWx0LmVycm9yIHx8IHJlc3VsdC5zdGF0dXMgIT09IDAgfHwgcmVzdWx0LnNpZ25hbCAhPT0gbnVsbCkge1xuXHRcdGNvbnN0IGVycm9yID0gbWFrZUVycm9yKHtcblx0XHRcdHN0ZG91dCxcblx0XHRcdHN0ZGVycixcblx0XHRcdGVycm9yOiByZXN1bHQuZXJyb3IsXG5cdFx0XHRzaWduYWw6IHJlc3VsdC5zaWduYWwsXG5cdFx0XHRleGl0Q29kZTogcmVzdWx0LnN0YXR1cyxcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdHBhcnNlZCxcblx0XHRcdHRpbWVkT3V0OiByZXN1bHQuZXJyb3IgJiYgcmVzdWx0LmVycm9yLmNvZGUgPT09ICdFVElNRURPVVQnLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IHJlc3VsdC5zaWduYWwgIT09IG51bGwsXG5cdFx0fSk7XG5cblx0XHRpZiAoIXBhcnNlZC5vcHRpb25zLnJlamVjdCkge1xuXHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdH1cblxuXHRcdHRocm93IGVycm9yO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRjb21tYW5kLFxuXHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdGV4aXRDb2RlOiAwLFxuXHRcdHN0ZG91dCxcblx0XHRzdGRlcnIsXG5cdFx0ZmFpbGVkOiBmYWxzZSxcblx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0a2lsbGVkOiBmYWxzZSxcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWNhQ29tbWFuZChjb21tYW5kLCBvcHRpb25zKSB7XG5cdGNvbnN0IFtmaWxlLCAuLi5hcmdzXSA9IHBhcnNlQ29tbWFuZChjb21tYW5kKTtcblx0cmV0dXJuIGV4ZWNhKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2FDb21tYW5kU3luYyhjb21tYW5kLCBvcHRpb25zKSB7XG5cdGNvbnN0IFtmaWxlLCAuLi5hcmdzXSA9IHBhcnNlQ29tbWFuZChjb21tYW5kKTtcblx0cmV0dXJuIGV4ZWNhU3luYyhmaWxlLCBhcmdzLCBvcHRpb25zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWNhTm9kZShzY3JpcHRQYXRoLCBhcmdzLCBvcHRpb25zID0ge30pIHtcblx0aWYgKGFyZ3MgJiYgIUFycmF5LmlzQXJyYXkoYXJncykgJiYgdHlwZW9mIGFyZ3MgPT09ICdvYmplY3QnKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3M7XG5cdFx0YXJncyA9IFtdO1xuXHR9XG5cblx0Y29uc3Qgc3RkaW8gPSBub3JtYWxpemVTdGRpb05vZGUob3B0aW9ucyk7XG5cdGNvbnN0IGRlZmF1bHRFeGVjQXJndiA9IHByb2Nlc3MuZXhlY0FyZ3YuZmlsdGVyKGFyZyA9PiAhYXJnLnN0YXJ0c1dpdGgoJy0taW5zcGVjdCcpKTtcblxuXHRjb25zdCB7XG5cdFx0bm9kZVBhdGggPSBwcm9jZXNzLmV4ZWNQYXRoLFxuXHRcdG5vZGVPcHRpb25zID0gZGVmYXVsdEV4ZWNBcmd2LFxuXHR9ID0gb3B0aW9ucztcblxuXHRyZXR1cm4gZXhlY2EoXG5cdFx0bm9kZVBhdGgsXG5cdFx0W1xuXHRcdFx0Li4ubm9kZU9wdGlvbnMsXG5cdFx0XHRzY3JpcHRQYXRoLFxuXHRcdFx0Li4uKEFycmF5LmlzQXJyYXkoYXJncykgPyBhcmdzIDogW10pLFxuXHRcdF0sXG5cdFx0e1xuXHRcdFx0Li4ub3B0aW9ucyxcblx0XHRcdHN0ZGluOiB1bmRlZmluZWQsXG5cdFx0XHRzdGRvdXQ6IHVuZGVmaW5lZCxcblx0XHRcdHN0ZGVycjogdW5kZWZpbmVkLFxuXHRcdFx0c3RkaW8sXG5cdFx0XHRzaGVsbDogZmFsc2UsXG5cdFx0fSxcblx0KTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzdHJpcEZpbmFsTmV3bGluZShpbnB1dCkge1xuXHRjb25zdCBMRiA9IHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgPyAnXFxuJyA6ICdcXG4nLmNoYXJDb2RlQXQoKTtcblx0Y29uc3QgQ1IgPSB0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnID8gJ1xccicgOiAnXFxyJy5jaGFyQ29kZUF0KCk7XG5cblx0aWYgKGlucHV0W2lucHV0Lmxlbmd0aCAtIDFdID09PSBMRikge1xuXHRcdGlucHV0ID0gaW5wdXQuc2xpY2UoMCwgLTEpO1xuXHR9XG5cblx0aWYgKGlucHV0W2lucHV0Lmxlbmd0aCAtIDFdID09PSBDUikge1xuXHRcdGlucHV0ID0gaW5wdXQuc2xpY2UoMCwgLTEpO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuIiwgImltcG9ydCBwcm9jZXNzIGZyb20gJ25vZGU6cHJvY2Vzcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHVybCBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgcGF0aEtleSBmcm9tICdwYXRoLWtleSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBucG1SdW5QYXRoKG9wdGlvbnMgPSB7fSkge1xuXHRjb25zdCB7XG5cdFx0Y3dkID0gcHJvY2Vzcy5jd2QoKSxcblx0XHRwYXRoOiBwYXRoXyA9IHByb2Nlc3MuZW52W3BhdGhLZXkoKV0sXG5cdFx0ZXhlY1BhdGggPSBwcm9jZXNzLmV4ZWNQYXRoLFxuXHR9ID0gb3B0aW9ucztcblxuXHRsZXQgcHJldmlvdXM7XG5cdGNvbnN0IGN3ZFN0cmluZyA9IGN3ZCBpbnN0YW5jZW9mIFVSTCA/IHVybC5maWxlVVJMVG9QYXRoKGN3ZCkgOiBjd2Q7XG5cdGxldCBjd2RQYXRoID0gcGF0aC5yZXNvbHZlKGN3ZFN0cmluZyk7XG5cdGNvbnN0IHJlc3VsdCA9IFtdO1xuXG5cdHdoaWxlIChwcmV2aW91cyAhPT0gY3dkUGF0aCkge1xuXHRcdHJlc3VsdC5wdXNoKHBhdGguam9pbihjd2RQYXRoLCAnbm9kZV9tb2R1bGVzLy5iaW4nKSk7XG5cdFx0cHJldmlvdXMgPSBjd2RQYXRoO1xuXHRcdGN3ZFBhdGggPSBwYXRoLnJlc29sdmUoY3dkUGF0aCwgJy4uJyk7XG5cdH1cblxuXHQvLyBFbnN1cmUgdGhlIHJ1bm5pbmcgYG5vZGVgIGJpbmFyeSBpcyB1c2VkLlxuXHRyZXN1bHQucHVzaChwYXRoLnJlc29sdmUoY3dkU3RyaW5nLCBleGVjUGF0aCwgJy4uJykpO1xuXG5cdHJldHVybiBbLi4ucmVzdWx0LCBwYXRoX10uam9pbihwYXRoLmRlbGltaXRlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBucG1SdW5QYXRoRW52KHtlbnYgPSBwcm9jZXNzLmVudiwgLi4ub3B0aW9uc30gPSB7fSkge1xuXHRlbnYgPSB7Li4uZW52fTtcblxuXHRjb25zdCBwYXRoID0gcGF0aEtleSh7ZW52fSk7XG5cdG9wdGlvbnMucGF0aCA9IGVudltwYXRoXTtcblx0ZW52W3BhdGhdID0gbnBtUnVuUGF0aChvcHRpb25zKTtcblxuXHRyZXR1cm4gZW52O1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhdGhLZXkob3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IHtcblx0XHRlbnYgPSBwcm9jZXNzLmVudixcblx0XHRwbGF0Zm9ybSA9IHByb2Nlc3MucGxhdGZvcm1cblx0fSA9IG9wdGlvbnM7XG5cblx0aWYgKHBsYXRmb3JtICE9PSAnd2luMzInKSB7XG5cdFx0cmV0dXJuICdQQVRIJztcblx0fVxuXG5cdHJldHVybiBPYmplY3Qua2V5cyhlbnYpLnJldmVyc2UoKS5maW5kKGtleSA9PiBrZXkudG9VcHBlckNhc2UoKSA9PT0gJ1BBVEgnKSB8fCAnUGF0aCc7XG59XG4iLCAiY29uc3QgY29weVByb3BlcnR5ID0gKHRvLCBmcm9tLCBwcm9wZXJ0eSwgaWdub3JlTm9uQ29uZmlndXJhYmxlKSA9PiB7XG5cdC8vIGBGdW5jdGlvbiNsZW5ndGhgIHNob3VsZCByZWZsZWN0IHRoZSBwYXJhbWV0ZXJzIG9mIGB0b2Agbm90IGBmcm9tYCBzaW5jZSB3ZSBrZWVwIGl0cyBib2R5LlxuXHQvLyBgRnVuY3Rpb24jcHJvdG90eXBlYCBpcyBub24td3JpdGFibGUgYW5kIG5vbi1jb25maWd1cmFibGUgc28gY2FuIG5ldmVyIGJlIG1vZGlmaWVkLlxuXHRpZiAocHJvcGVydHkgPT09ICdsZW5ndGgnIHx8IHByb3BlcnR5ID09PSAncHJvdG90eXBlJykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIGBGdW5jdGlvbiNhcmd1bWVudHNgIGFuZCBgRnVuY3Rpb24jY2FsbGVyYCBzaG91bGQgbm90IGJlIGNvcGllZC4gVGhleSB3ZXJlIHJlcG9ydGVkIHRvIGJlIHByZXNlbnQgaW4gYFJlZmxlY3Qub3duS2V5c2AgZm9yIHNvbWUgZGV2aWNlcyBpbiBSZWFjdCBOYXRpdmUgKCM0MSksIHNvIHdlIGV4cGxpY2l0bHkgaWdub3JlIHRoZW0gaGVyZS5cblx0aWYgKHByb3BlcnR5ID09PSAnYXJndW1lbnRzJyB8fCBwcm9wZXJ0eSA9PT0gJ2NhbGxlcicpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCB0b0Rlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRvLCBwcm9wZXJ0eSk7XG5cdGNvbnN0IGZyb21EZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihmcm9tLCBwcm9wZXJ0eSk7XG5cblx0aWYgKCFjYW5Db3B5UHJvcGVydHkodG9EZXNjcmlwdG9yLCBmcm9tRGVzY3JpcHRvcikgJiYgaWdub3JlTm9uQ29uZmlndXJhYmxlKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRvLCBwcm9wZXJ0eSwgZnJvbURlc2NyaXB0b3IpO1xufTtcblxuLy8gYE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgpYCB0aHJvd3MgaWYgdGhlIHByb3BlcnR5IGV4aXN0cywgaXMgbm90IGNvbmZpZ3VyYWJsZSBhbmQgZWl0aGVyOlxuLy8gLSBvbmUgaXRzIGRlc2NyaXB0b3JzIGlzIGNoYW5nZWRcbi8vIC0gaXQgaXMgbm9uLXdyaXRhYmxlIGFuZCBpdHMgdmFsdWUgaXMgY2hhbmdlZFxuY29uc3QgY2FuQ29weVByb3BlcnR5ID0gZnVuY3Rpb24gKHRvRGVzY3JpcHRvciwgZnJvbURlc2NyaXB0b3IpIHtcblx0cmV0dXJuIHRvRGVzY3JpcHRvciA9PT0gdW5kZWZpbmVkIHx8IHRvRGVzY3JpcHRvci5jb25maWd1cmFibGUgfHwgKFxuXHRcdHRvRGVzY3JpcHRvci53cml0YWJsZSA9PT0gZnJvbURlc2NyaXB0b3Iud3JpdGFibGUgJiZcblx0XHR0b0Rlc2NyaXB0b3IuZW51bWVyYWJsZSA9PT0gZnJvbURlc2NyaXB0b3IuZW51bWVyYWJsZSAmJlxuXHRcdHRvRGVzY3JpcHRvci5jb25maWd1cmFibGUgPT09IGZyb21EZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSAmJlxuXHRcdCh0b0Rlc2NyaXB0b3Iud3JpdGFibGUgfHwgdG9EZXNjcmlwdG9yLnZhbHVlID09PSBmcm9tRGVzY3JpcHRvci52YWx1ZSlcblx0KTtcbn07XG5cbmNvbnN0IGNoYW5nZVByb3RvdHlwZSA9ICh0bywgZnJvbSkgPT4ge1xuXHRjb25zdCBmcm9tUHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGZyb20pO1xuXHRpZiAoZnJvbVByb3RvdHlwZSA9PT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRvKSkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdE9iamVjdC5zZXRQcm90b3R5cGVPZih0bywgZnJvbVByb3RvdHlwZSk7XG59O1xuXG5jb25zdCB3cmFwcGVkVG9TdHJpbmcgPSAod2l0aE5hbWUsIGZyb21Cb2R5KSA9PiBgLyogV3JhcHBlZCAke3dpdGhOYW1lfSovXFxuJHtmcm9tQm9keX1gO1xuXG5jb25zdCB0b1N0cmluZ0Rlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEZ1bmN0aW9uLnByb3RvdHlwZSwgJ3RvU3RyaW5nJyk7XG5jb25zdCB0b1N0cmluZ05hbWUgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZywgJ25hbWUnKTtcblxuLy8gV2UgY2FsbCBgZnJvbS50b1N0cmluZygpYCBlYXJseSAobm90IGxhemlseSkgdG8gZW5zdXJlIGBmcm9tYCBjYW4gYmUgZ2FyYmFnZSBjb2xsZWN0ZWQuXG4vLyBXZSB1c2UgYGJpbmQoKWAgaW5zdGVhZCBvZiBhIGNsb3N1cmUgZm9yIHRoZSBzYW1lIHJlYXNvbi5cbi8vIENhbGxpbmcgYGZyb20udG9TdHJpbmcoKWAgZWFybHkgYWxzbyBhbGxvd3MgY2FjaGluZyBpdCBpbiBjYXNlIGB0by50b1N0cmluZygpYCBpcyBjYWxsZWQgc2V2ZXJhbCB0aW1lcy5cbmNvbnN0IGNoYW5nZVRvU3RyaW5nID0gKHRvLCBmcm9tLCBuYW1lKSA9PiB7XG5cdGNvbnN0IHdpdGhOYW1lID0gbmFtZSA9PT0gJycgPyAnJyA6IGB3aXRoICR7bmFtZS50cmltKCl9KCkgYDtcblx0Y29uc3QgbmV3VG9TdHJpbmcgPSB3cmFwcGVkVG9TdHJpbmcuYmluZChudWxsLCB3aXRoTmFtZSwgZnJvbS50b1N0cmluZygpKTtcblx0Ly8gRW5zdXJlIGB0by50b1N0cmluZy50b1N0cmluZ2AgaXMgbm9uLWVudW1lcmFibGUgYW5kIGhhcyB0aGUgc2FtZSBgc2FtZWBcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5ld1RvU3RyaW5nLCAnbmFtZScsIHRvU3RyaW5nTmFtZSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0bywgJ3RvU3RyaW5nJywgey4uLnRvU3RyaW5nRGVzY3JpcHRvciwgdmFsdWU6IG5ld1RvU3RyaW5nfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtaW1pY0Z1bmN0aW9uKHRvLCBmcm9tLCB7aWdub3JlTm9uQ29uZmlndXJhYmxlID0gZmFsc2V9ID0ge30pIHtcblx0Y29uc3Qge25hbWV9ID0gdG87XG5cblx0Zm9yIChjb25zdCBwcm9wZXJ0eSBvZiBSZWZsZWN0Lm93bktleXMoZnJvbSkpIHtcblx0XHRjb3B5UHJvcGVydHkodG8sIGZyb20sIHByb3BlcnR5LCBpZ25vcmVOb25Db25maWd1cmFibGUpO1xuXHR9XG5cblx0Y2hhbmdlUHJvdG90eXBlKHRvLCBmcm9tKTtcblx0Y2hhbmdlVG9TdHJpbmcodG8sIGZyb20sIG5hbWUpO1xuXG5cdHJldHVybiB0bztcbn1cbiIsICJpbXBvcnQgbWltaWNGdW5jdGlvbiBmcm9tICdtaW1pYy1mbic7XG5cbmNvbnN0IGNhbGxlZEZ1bmN0aW9ucyA9IG5ldyBXZWFrTWFwKCk7XG5cbmNvbnN0IG9uZXRpbWUgPSAoZnVuY3Rpb25fLCBvcHRpb25zID0ge30pID0+IHtcblx0aWYgKHR5cGVvZiBmdW5jdGlvbl8gIT09ICdmdW5jdGlvbicpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIGZ1bmN0aW9uJyk7XG5cdH1cblxuXHRsZXQgcmV0dXJuVmFsdWU7XG5cdGxldCBjYWxsQ291bnQgPSAwO1xuXHRjb25zdCBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbl8uZGlzcGxheU5hbWUgfHwgZnVuY3Rpb25fLm5hbWUgfHwgJzxhbm9ueW1vdXM+JztcblxuXHRjb25zdCBvbmV0aW1lID0gZnVuY3Rpb24gKC4uLmFyZ3VtZW50c18pIHtcblx0XHRjYWxsZWRGdW5jdGlvbnMuc2V0KG9uZXRpbWUsICsrY2FsbENvdW50KTtcblxuXHRcdGlmIChjYWxsQ291bnQgPT09IDEpIHtcblx0XHRcdHJldHVyblZhbHVlID0gZnVuY3Rpb25fLmFwcGx5KHRoaXMsIGFyZ3VtZW50c18pO1xuXHRcdFx0ZnVuY3Rpb25fID0gbnVsbDtcblx0XHR9IGVsc2UgaWYgKG9wdGlvbnMudGhyb3cgPT09IHRydWUpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgRnVuY3Rpb24gXFxgJHtmdW5jdGlvbk5hbWV9XFxgIGNhbiBvbmx5IGJlIGNhbGxlZCBvbmNlYCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldHVyblZhbHVlO1xuXHR9O1xuXG5cdG1pbWljRnVuY3Rpb24ob25ldGltZSwgZnVuY3Rpb25fKTtcblx0Y2FsbGVkRnVuY3Rpb25zLnNldChvbmV0aW1lLCBjYWxsQ291bnQpO1xuXG5cdHJldHVybiBvbmV0aW1lO1xufTtcblxub25ldGltZS5jYWxsQ291bnQgPSBmdW5jdGlvbl8gPT4ge1xuXHRpZiAoIWNhbGxlZEZ1bmN0aW9ucy5oYXMoZnVuY3Rpb25fKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgVGhlIGdpdmVuIGZ1bmN0aW9uIFxcYCR7ZnVuY3Rpb25fLm5hbWV9XFxgIGlzIG5vdCB3cmFwcGVkIGJ5IHRoZSBcXGBvbmV0aW1lXFxgIHBhY2thZ2VgKTtcblx0fVxuXG5cdHJldHVybiBjYWxsZWRGdW5jdGlvbnMuZ2V0KGZ1bmN0aW9uXyk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBvbmV0aW1lO1xuIiwgImltcG9ydHtjb25zdGFudHN9ZnJvbVwibm9kZTpvc1wiO1xuXG5pbXBvcnR7U0lHUlRNQVh9ZnJvbVwiLi9yZWFsdGltZS5qc1wiO1xuaW1wb3J0e2dldFNpZ25hbHN9ZnJvbVwiLi9zaWduYWxzLmpzXCI7XG5cblxuXG5jb25zdCBnZXRTaWduYWxzQnlOYW1lPWZ1bmN0aW9uKCl7XG5jb25zdCBzaWduYWxzPWdldFNpZ25hbHMoKTtcbnJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoc2lnbmFscy5tYXAoZ2V0U2lnbmFsQnlOYW1lKSk7XG59O1xuXG5jb25zdCBnZXRTaWduYWxCeU5hbWU9ZnVuY3Rpb24oe1xubmFtZSxcbm51bWJlcixcbmRlc2NyaXB0aW9uLFxuc3VwcG9ydGVkLFxuYWN0aW9uLFxuZm9yY2VkLFxuc3RhbmRhcmR9KVxue1xucmV0dXJuW1xubmFtZSxcbntuYW1lLG51bWJlcixkZXNjcmlwdGlvbixzdXBwb3J0ZWQsYWN0aW9uLGZvcmNlZCxzdGFuZGFyZH1dO1xuXG59O1xuXG5leHBvcnQgY29uc3Qgc2lnbmFsc0J5TmFtZT1nZXRTaWduYWxzQnlOYW1lKCk7XG5cblxuXG5cbmNvbnN0IGdldFNpZ25hbHNCeU51bWJlcj1mdW5jdGlvbigpe1xuY29uc3Qgc2lnbmFscz1nZXRTaWduYWxzKCk7XG5jb25zdCBsZW5ndGg9U0lHUlRNQVgrMTtcbmNvbnN0IHNpZ25hbHNBPUFycmF5LmZyb20oe2xlbmd0aH0sKHZhbHVlLG51bWJlcik9PlxuZ2V0U2lnbmFsQnlOdW1iZXIobnVtYmVyLHNpZ25hbHMpKTtcblxucmV0dXJuIE9iamVjdC5hc3NpZ24oe30sLi4uc2lnbmFsc0EpO1xufTtcblxuY29uc3QgZ2V0U2lnbmFsQnlOdW1iZXI9ZnVuY3Rpb24obnVtYmVyLHNpZ25hbHMpe1xuY29uc3Qgc2lnbmFsPWZpbmRTaWduYWxCeU51bWJlcihudW1iZXIsc2lnbmFscyk7XG5cbmlmKHNpZ25hbD09PXVuZGVmaW5lZCl7XG5yZXR1cm57fTtcbn1cblxuY29uc3R7bmFtZSxkZXNjcmlwdGlvbixzdXBwb3J0ZWQsYWN0aW9uLGZvcmNlZCxzdGFuZGFyZH09c2lnbmFsO1xucmV0dXJue1xuW251bWJlcl06e1xubmFtZSxcbm51bWJlcixcbmRlc2NyaXB0aW9uLFxuc3VwcG9ydGVkLFxuYWN0aW9uLFxuZm9yY2VkLFxuc3RhbmRhcmR9fTtcblxuXG59O1xuXG5cblxuY29uc3QgZmluZFNpZ25hbEJ5TnVtYmVyPWZ1bmN0aW9uKG51bWJlcixzaWduYWxzKXtcbmNvbnN0IHNpZ25hbD1zaWduYWxzLmZpbmQoKHtuYW1lfSk9PmNvbnN0YW50cy5zaWduYWxzW25hbWVdPT09bnVtYmVyKTtcblxuaWYoc2lnbmFsIT09dW5kZWZpbmVkKXtcbnJldHVybiBzaWduYWw7XG59XG5cbnJldHVybiBzaWduYWxzLmZpbmQoKHNpZ25hbEEpPT5zaWduYWxBLm51bWJlcj09PW51bWJlcik7XG59O1xuXG5leHBvcnQgY29uc3Qgc2lnbmFsc0J5TnVtYmVyPWdldFNpZ25hbHNCeU51bWJlcigpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFpbi5qcy5tYXAiLCAiXG5leHBvcnQgY29uc3QgZ2V0UmVhbHRpbWVTaWduYWxzPWZ1bmN0aW9uKCl7XG5jb25zdCBsZW5ndGg9U0lHUlRNQVgtU0lHUlRNSU4rMTtcbnJldHVybiBBcnJheS5mcm9tKHtsZW5ndGh9LGdldFJlYWx0aW1lU2lnbmFsKTtcbn07XG5cbmNvbnN0IGdldFJlYWx0aW1lU2lnbmFsPWZ1bmN0aW9uKHZhbHVlLGluZGV4KXtcbnJldHVybntcbm5hbWU6YFNJR1JUJHtpbmRleCsxfWAsXG5udW1iZXI6U0lHUlRNSU4raW5kZXgsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQXBwbGljYXRpb24tc3BlY2lmaWMgc2lnbmFsIChyZWFsdGltZSlcIixcbnN0YW5kYXJkOlwicG9zaXhcIn07XG5cbn07XG5cbmNvbnN0IFNJR1JUTUlOPTM0O1xuZXhwb3J0IGNvbnN0IFNJR1JUTUFYPTY0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVhbHRpbWUuanMubWFwIiwgImltcG9ydHtjb25zdGFudHN9ZnJvbVwibm9kZTpvc1wiO1xuXG5pbXBvcnR7U0lHTkFMU31mcm9tXCIuL2NvcmUuanNcIjtcbmltcG9ydHtnZXRSZWFsdGltZVNpZ25hbHN9ZnJvbVwiLi9yZWFsdGltZS5qc1wiO1xuXG5cblxuZXhwb3J0IGNvbnN0IGdldFNpZ25hbHM9ZnVuY3Rpb24oKXtcbmNvbnN0IHJlYWx0aW1lU2lnbmFscz1nZXRSZWFsdGltZVNpZ25hbHMoKTtcbmNvbnN0IHNpZ25hbHM9Wy4uLlNJR05BTFMsLi4ucmVhbHRpbWVTaWduYWxzXS5tYXAobm9ybWFsaXplU2lnbmFsKTtcbnJldHVybiBzaWduYWxzO1xufTtcblxuXG5cblxuXG5cblxuY29uc3Qgbm9ybWFsaXplU2lnbmFsPWZ1bmN0aW9uKHtcbm5hbWUsXG5udW1iZXI6ZGVmYXVsdE51bWJlcixcbmRlc2NyaXB0aW9uLFxuYWN0aW9uLFxuZm9yY2VkPWZhbHNlLFxuc3RhbmRhcmR9KVxue1xuY29uc3R7XG5zaWduYWxzOntbbmFtZV06Y29uc3RhbnRTaWduYWx9fT1cbmNvbnN0YW50cztcbmNvbnN0IHN1cHBvcnRlZD1jb25zdGFudFNpZ25hbCE9PXVuZGVmaW5lZDtcbmNvbnN0IG51bWJlcj1zdXBwb3J0ZWQ/Y29uc3RhbnRTaWduYWw6ZGVmYXVsdE51bWJlcjtcbnJldHVybntuYW1lLG51bWJlcixkZXNjcmlwdGlvbixzdXBwb3J0ZWQsYWN0aW9uLGZvcmNlZCxzdGFuZGFyZH07XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2lnbmFscy5qcy5tYXAiLCAiXG5cbmV4cG9ydCBjb25zdCBTSUdOQUxTPVtcbntcbm5hbWU6XCJTSUdIVVBcIixcbm51bWJlcjoxLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlRlcm1pbmFsIGNsb3NlZFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0lOVFwiLFxubnVtYmVyOjIsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVXNlciBpbnRlcnJ1cHRpb24gd2l0aCBDVFJMLUNcIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR1FVSVRcIixcbm51bWJlcjozLFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJVc2VyIGludGVycnVwdGlvbiB3aXRoIENUUkwtXFxcXFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0lMTFwiLFxubnVtYmVyOjQsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkludmFsaWQgbWFjaGluZSBpbnN0cnVjdGlvblwiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHVFJBUFwiLFxubnVtYmVyOjUsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkRlYnVnZ2VyIGJyZWFrcG9pbnRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdBQlJUXCIsXG5udW1iZXI6NixcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiQWJvcnRlZFwiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHSU9UXCIsXG5udW1iZXI6NixcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiQWJvcnRlZFwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdCVVNcIixcbm51bWJlcjo3LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XG5cIkJ1cyBlcnJvciBkdWUgdG8gbWlzYWxpZ25lZCwgbm9uLWV4aXN0aW5nIGFkZHJlc3Mgb3IgcGFnaW5nIGVycm9yXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR0VNVFwiLFxubnVtYmVyOjcsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQ29tbWFuZCBzaG91bGQgYmUgZW11bGF0ZWQgYnV0IGlzIG5vdCBpbXBsZW1lbnRlZFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR0ZQRVwiLFxubnVtYmVyOjgsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkZsb2F0aW5nIHBvaW50IGFyaXRobWV0aWMgZXJyb3JcIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR0tJTExcIixcbm51bWJlcjo5LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkZvcmNlZCB0ZXJtaW5hdGlvblwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwiLFxuZm9yY2VkOnRydWV9LFxuXG57XG5uYW1lOlwiU0lHVVNSMVwiLFxubnVtYmVyOjEwLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkFwcGxpY2F0aW9uLXNwZWNpZmljIHNpZ25hbFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR1NFR1ZcIixcbm51bWJlcjoxMSxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiU2VnbWVudGF0aW9uIGZhdWx0XCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdVU1IyXCIsXG5udW1iZXI6MTIsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQXBwbGljYXRpb24tc3BlY2lmaWMgc2lnbmFsXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHUElQRVwiLFxubnVtYmVyOjEzLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkJyb2tlbiBwaXBlIG9yIHNvY2tldFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0FMUk1cIixcbm51bWJlcjoxNCxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUaW1lb3V0IG9yIHRpbWVyXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHVEVSTVwiLFxubnVtYmVyOjE1LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlRlcm1pbmF0aW9uXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdTVEtGTFRcIixcbm51bWJlcjoxNixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJTdGFjayBpcyBlbXB0eSBvciBvdmVyZmxvd2VkXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHQ0hMRFwiLFxubnVtYmVyOjE3LFxuYWN0aW9uOlwiaWdub3JlXCIsXG5kZXNjcmlwdGlvbjpcIkNoaWxkIHByb2Nlc3MgdGVybWluYXRlZCwgcGF1c2VkIG9yIHVucGF1c2VkXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHQ0xEXCIsXG5udW1iZXI6MTcsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiQ2hpbGQgcHJvY2VzcyB0ZXJtaW5hdGVkLCBwYXVzZWQgb3IgdW5wYXVzZWRcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdDT05UXCIsXG5udW1iZXI6MTgsXG5hY3Rpb246XCJ1bnBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIlVucGF1c2VkXCIsXG5zdGFuZGFyZDpcInBvc2l4XCIsXG5mb3JjZWQ6dHJ1ZX0sXG5cbntcbm5hbWU6XCJTSUdTVE9QXCIsXG5udW1iZXI6MTksXG5hY3Rpb246XCJwYXVzZVwiLFxuZGVzY3JpcHRpb246XCJQYXVzZWRcIixcbnN0YW5kYXJkOlwicG9zaXhcIixcbmZvcmNlZDp0cnVlfSxcblxue1xubmFtZTpcIlNJR1RTVFBcIixcbm51bWJlcjoyMCxcbmFjdGlvbjpcInBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIlBhdXNlZCB1c2luZyBDVFJMLVogb3IgXFxcInN1c3BlbmRcXFwiXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHVFRJTlwiLFxubnVtYmVyOjIxLFxuYWN0aW9uOlwicGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiQmFja2dyb3VuZCBwcm9jZXNzIGNhbm5vdCByZWFkIHRlcm1pbmFsIGlucHV0XCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHQlJFQUtcIixcbm51bWJlcjoyMSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJVc2VyIGludGVycnVwdGlvbiB3aXRoIENUUkwtQlJFQUtcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdUVE9VXCIsXG5udW1iZXI6MjIsXG5hY3Rpb246XCJwYXVzZVwiLFxuZGVzY3JpcHRpb246XCJCYWNrZ3JvdW5kIHByb2Nlc3MgY2Fubm90IHdyaXRlIHRvIHRlcm1pbmFsIG91dHB1dFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR1VSR1wiLFxubnVtYmVyOjIzLFxuYWN0aW9uOlwiaWdub3JlXCIsXG5kZXNjcmlwdGlvbjpcIlNvY2tldCByZWNlaXZlZCBvdXQtb2YtYmFuZCBkYXRhXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1hDUFVcIixcbm51bWJlcjoyNCxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiUHJvY2VzcyB0aW1lZCBvdXRcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHWEZTWlwiLFxubnVtYmVyOjI1LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJGaWxlIHRvbyBiaWdcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHVlRBTFJNXCIsXG5udW1iZXI6MjYsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGltZW91dCBvciB0aW1lclwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdQUk9GXCIsXG5udW1iZXI6MjcsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGltZW91dCBvciB0aW1lclwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdXSU5DSFwiLFxubnVtYmVyOjI4LFxuYWN0aW9uOlwiaWdub3JlXCIsXG5kZXNjcmlwdGlvbjpcIlRlcm1pbmFsIHdpbmRvdyBzaXplIGNoYW5nZWRcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHSU9cIixcbm51bWJlcjoyOSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJJL08gaXMgYXZhaWxhYmxlXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHUE9MTFwiLFxubnVtYmVyOjI5LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIldhdGNoZWQgZXZlbnRcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdJTkZPXCIsXG5udW1iZXI6MjksXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiUmVxdWVzdCBmb3IgcHJvY2VzcyBpbmZvcm1hdGlvblwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR1BXUlwiLFxubnVtYmVyOjMwLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkRldmljZSBydW5uaW5nIG91dCBvZiBwb3dlclwiLFxuc3RhbmRhcmQ6XCJzeXN0ZW12XCJ9LFxuXG57XG5uYW1lOlwiU0lHU1lTXCIsXG5udW1iZXI6MzEsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkludmFsaWQgc3lzdGVtIGNhbGxcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdVTlVTRURcIixcbm51bWJlcjozMSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJJbnZhbGlkIHN5c3RlbSBjYWxsXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9XTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvcmUuanMubWFwIiwgImltcG9ydCB7c2lnbmFsc0J5TmFtZX0gZnJvbSAnaHVtYW4tc2lnbmFscyc7XG5cbmNvbnN0IGdldEVycm9yUHJlZml4ID0gKHt0aW1lZE91dCwgdGltZW91dCwgZXJyb3JDb2RlLCBzaWduYWwsIHNpZ25hbERlc2NyaXB0aW9uLCBleGl0Q29kZSwgaXNDYW5jZWxlZH0pID0+IHtcblx0aWYgKHRpbWVkT3V0KSB7XG5cdFx0cmV0dXJuIGB0aW1lZCBvdXQgYWZ0ZXIgJHt0aW1lb3V0fSBtaWxsaXNlY29uZHNgO1xuXHR9XG5cblx0aWYgKGlzQ2FuY2VsZWQpIHtcblx0XHRyZXR1cm4gJ3dhcyBjYW5jZWxlZCc7XG5cdH1cblxuXHRpZiAoZXJyb3JDb2RlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYGZhaWxlZCB3aXRoICR7ZXJyb3JDb2RlfWA7XG5cdH1cblxuXHRpZiAoc2lnbmFsICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYHdhcyBraWxsZWQgd2l0aCAke3NpZ25hbH0gKCR7c2lnbmFsRGVzY3JpcHRpb259KWA7XG5cdH1cblxuXHRpZiAoZXhpdENvZGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBgZmFpbGVkIHdpdGggZXhpdCBjb2RlICR7ZXhpdENvZGV9YDtcblx0fVxuXG5cdHJldHVybiAnZmFpbGVkJztcbn07XG5cbmV4cG9ydCBjb25zdCBtYWtlRXJyb3IgPSAoe1xuXHRzdGRvdXQsXG5cdHN0ZGVycixcblx0YWxsLFxuXHRlcnJvcixcblx0c2lnbmFsLFxuXHRleGl0Q29kZSxcblx0Y29tbWFuZCxcblx0ZXNjYXBlZENvbW1hbmQsXG5cdHRpbWVkT3V0LFxuXHRpc0NhbmNlbGVkLFxuXHRraWxsZWQsXG5cdHBhcnNlZDoge29wdGlvbnM6IHt0aW1lb3V0fX0sXG59KSA9PiB7XG5cdC8vIGBzaWduYWxgIGFuZCBgZXhpdENvZGVgIGVtaXR0ZWQgb24gYHNwYXduZWQub24oJ2V4aXQnKWAgZXZlbnQgY2FuIGJlIGBudWxsYC5cblx0Ly8gV2Ugbm9ybWFsaXplIHRoZW0gdG8gYHVuZGVmaW5lZGBcblx0ZXhpdENvZGUgPSBleGl0Q29kZSA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGV4aXRDb2RlO1xuXHRzaWduYWwgPSBzaWduYWwgPT09IG51bGwgPyB1bmRlZmluZWQgOiBzaWduYWw7XG5cdGNvbnN0IHNpZ25hbERlc2NyaXB0aW9uID0gc2lnbmFsID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBzaWduYWxzQnlOYW1lW3NpZ25hbF0uZGVzY3JpcHRpb247XG5cblx0Y29uc3QgZXJyb3JDb2RlID0gZXJyb3IgJiYgZXJyb3IuY29kZTtcblxuXHRjb25zdCBwcmVmaXggPSBnZXRFcnJvclByZWZpeCh7dGltZWRPdXQsIHRpbWVvdXQsIGVycm9yQ29kZSwgc2lnbmFsLCBzaWduYWxEZXNjcmlwdGlvbiwgZXhpdENvZGUsIGlzQ2FuY2VsZWR9KTtcblx0Y29uc3QgZXhlY2FNZXNzYWdlID0gYENvbW1hbmQgJHtwcmVmaXh9OiAke2NvbW1hbmR9YDtcblx0Y29uc3QgaXNFcnJvciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlcnJvcikgPT09ICdbb2JqZWN0IEVycm9yXSc7XG5cdGNvbnN0IHNob3J0TWVzc2FnZSA9IGlzRXJyb3IgPyBgJHtleGVjYU1lc3NhZ2V9XFxuJHtlcnJvci5tZXNzYWdlfWAgOiBleGVjYU1lc3NhZ2U7XG5cdGNvbnN0IG1lc3NhZ2UgPSBbc2hvcnRNZXNzYWdlLCBzdGRlcnIsIHN0ZG91dF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuXG5cdGlmIChpc0Vycm9yKSB7XG5cdFx0ZXJyb3Iub3JpZ2luYWxNZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcblx0XHRlcnJvci5tZXNzYWdlID0gbWVzc2FnZTtcblx0fSBlbHNlIHtcblx0XHRlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcblx0fVxuXG5cdGVycm9yLnNob3J0TWVzc2FnZSA9IHNob3J0TWVzc2FnZTtcblx0ZXJyb3IuY29tbWFuZCA9IGNvbW1hbmQ7XG5cdGVycm9yLmVzY2FwZWRDb21tYW5kID0gZXNjYXBlZENvbW1hbmQ7XG5cdGVycm9yLmV4aXRDb2RlID0gZXhpdENvZGU7XG5cdGVycm9yLnNpZ25hbCA9IHNpZ25hbDtcblx0ZXJyb3Iuc2lnbmFsRGVzY3JpcHRpb24gPSBzaWduYWxEZXNjcmlwdGlvbjtcblx0ZXJyb3Iuc3Rkb3V0ID0gc3Rkb3V0O1xuXHRlcnJvci5zdGRlcnIgPSBzdGRlcnI7XG5cblx0aWYgKGFsbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0ZXJyb3IuYWxsID0gYWxsO1xuXHR9XG5cblx0aWYgKCdidWZmZXJlZERhdGEnIGluIGVycm9yKSB7XG5cdFx0ZGVsZXRlIGVycm9yLmJ1ZmZlcmVkRGF0YTtcblx0fVxuXG5cdGVycm9yLmZhaWxlZCA9IHRydWU7XG5cdGVycm9yLnRpbWVkT3V0ID0gQm9vbGVhbih0aW1lZE91dCk7XG5cdGVycm9yLmlzQ2FuY2VsZWQgPSBpc0NhbmNlbGVkO1xuXHRlcnJvci5raWxsZWQgPSBraWxsZWQgJiYgIXRpbWVkT3V0O1xuXG5cdHJldHVybiBlcnJvcjtcbn07XG4iLCAiY29uc3QgYWxpYXNlcyA9IFsnc3RkaW4nLCAnc3Rkb3V0JywgJ3N0ZGVyciddO1xuXG5jb25zdCBoYXNBbGlhcyA9IG9wdGlvbnMgPT4gYWxpYXNlcy5zb21lKGFsaWFzID0+IG9wdGlvbnNbYWxpYXNdICE9PSB1bmRlZmluZWQpO1xuXG5leHBvcnQgY29uc3Qgbm9ybWFsaXplU3RkaW8gPSBvcHRpb25zID0+IHtcblx0aWYgKCFvcHRpb25zKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3Qge3N0ZGlvfSA9IG9wdGlvbnM7XG5cblx0aWYgKHN0ZGlvID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYWxpYXNlcy5tYXAoYWxpYXMgPT4gb3B0aW9uc1thbGlhc10pO1xuXHR9XG5cblx0aWYgKGhhc0FsaWFzKG9wdGlvbnMpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBJdCdzIG5vdCBwb3NzaWJsZSB0byBwcm92aWRlIFxcYHN0ZGlvXFxgIGluIGNvbWJpbmF0aW9uIHdpdGggb25lIG9mICR7YWxpYXNlcy5tYXAoYWxpYXMgPT4gYFxcYCR7YWxpYXN9XFxgYCkuam9pbignLCAnKX1gKTtcblx0fVxuXG5cdGlmICh0eXBlb2Ygc3RkaW8gPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHN0ZGlvO1xuXHR9XG5cblx0aWYgKCFBcnJheS5pc0FycmF5KHN0ZGlvKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFxcYHN0ZGlvXFxgIHRvIGJlIG9mIHR5cGUgXFxgc3RyaW5nXFxgIG9yIFxcYEFycmF5XFxgLCBnb3QgXFxgJHt0eXBlb2Ygc3RkaW99XFxgYCk7XG5cdH1cblxuXHRjb25zdCBsZW5ndGggPSBNYXRoLm1heChzdGRpby5sZW5ndGgsIGFsaWFzZXMubGVuZ3RoKTtcblx0cmV0dXJuIEFycmF5LmZyb20oe2xlbmd0aH0sICh2YWx1ZSwgaW5kZXgpID0+IHN0ZGlvW2luZGV4XSk7XG59O1xuXG4vLyBgaXBjYCBpcyBwdXNoZWQgdW5sZXNzIGl0IGlzIGFscmVhZHkgcHJlc2VudFxuZXhwb3J0IGNvbnN0IG5vcm1hbGl6ZVN0ZGlvTm9kZSA9IG9wdGlvbnMgPT4ge1xuXHRjb25zdCBzdGRpbyA9IG5vcm1hbGl6ZVN0ZGlvKG9wdGlvbnMpO1xuXG5cdGlmIChzdGRpbyA9PT0gJ2lwYycpIHtcblx0XHRyZXR1cm4gJ2lwYyc7XG5cdH1cblxuXHRpZiAoc3RkaW8gPT09IHVuZGVmaW5lZCB8fCB0eXBlb2Ygc3RkaW8gPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIFtzdGRpbywgc3RkaW8sIHN0ZGlvLCAnaXBjJ107XG5cdH1cblxuXHRpZiAoc3RkaW8uaW5jbHVkZXMoJ2lwYycpKSB7XG5cdFx0cmV0dXJuIHN0ZGlvO1xuXHR9XG5cblx0cmV0dXJuIFsuLi5zdGRpbywgJ2lwYyddO1xufTtcbiIsICJpbXBvcnQgb3MgZnJvbSAnbm9kZTpvcyc7XG5pbXBvcnQgb25FeGl0IGZyb20gJ3NpZ25hbC1leGl0JztcblxuY29uc3QgREVGQVVMVF9GT1JDRV9LSUxMX1RJTUVPVVQgPSAxMDAwICogNTtcblxuLy8gTW9ua2V5LXBhdGNoZXMgYGNoaWxkUHJvY2Vzcy5raWxsKClgIHRvIGFkZCBgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0YCBiZWhhdmlvclxuZXhwb3J0IGNvbnN0IHNwYXduZWRLaWxsID0gKGtpbGwsIHNpZ25hbCA9ICdTSUdURVJNJywgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IGtpbGxSZXN1bHQgPSBraWxsKHNpZ25hbCk7XG5cdHNldEtpbGxUaW1lb3V0KGtpbGwsIHNpZ25hbCwgb3B0aW9ucywga2lsbFJlc3VsdCk7XG5cdHJldHVybiBraWxsUmVzdWx0O1xufTtcblxuY29uc3Qgc2V0S2lsbFRpbWVvdXQgPSAoa2lsbCwgc2lnbmFsLCBvcHRpb25zLCBraWxsUmVzdWx0KSA9PiB7XG5cdGlmICghc2hvdWxkRm9yY2VLaWxsKHNpZ25hbCwgb3B0aW9ucywga2lsbFJlc3VsdCkpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCB0aW1lb3V0ID0gZ2V0Rm9yY2VLaWxsQWZ0ZXJUaW1lb3V0KG9wdGlvbnMpO1xuXHRjb25zdCB0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0a2lsbCgnU0lHS0lMTCcpO1xuXHR9LCB0aW1lb3V0KTtcblxuXHQvLyBHdWFyZGVkIGJlY2F1c2UgdGhlcmUncyBubyBgLnVucmVmKClgIHdoZW4gYGV4ZWNhYCBpcyB1c2VkIGluIHRoZSByZW5kZXJlclxuXHQvLyBwcm9jZXNzIGluIEVsZWN0cm9uLiBUaGlzIGNhbm5vdCBiZSB0ZXN0ZWQgc2luY2Ugd2UgZG9uJ3QgcnVuIHRlc3RzIGluXG5cdC8vIEVsZWN0cm9uLlxuXHQvLyBpc3RhbmJ1bCBpZ25vcmUgZWxzZVxuXHRpZiAodC51bnJlZikge1xuXHRcdHQudW5yZWYoKTtcblx0fVxufTtcblxuY29uc3Qgc2hvdWxkRm9yY2VLaWxsID0gKHNpZ25hbCwge2ZvcmNlS2lsbEFmdGVyVGltZW91dH0sIGtpbGxSZXN1bHQpID0+IGlzU2lndGVybShzaWduYWwpICYmIGZvcmNlS2lsbEFmdGVyVGltZW91dCAhPT0gZmFsc2UgJiYga2lsbFJlc3VsdDtcblxuY29uc3QgaXNTaWd0ZXJtID0gc2lnbmFsID0+IHNpZ25hbCA9PT0gb3MuY29uc3RhbnRzLnNpZ25hbHMuU0lHVEVSTVxuXHRcdHx8ICh0eXBlb2Ygc2lnbmFsID09PSAnc3RyaW5nJyAmJiBzaWduYWwudG9VcHBlckNhc2UoKSA9PT0gJ1NJR1RFUk0nKTtcblxuY29uc3QgZ2V0Rm9yY2VLaWxsQWZ0ZXJUaW1lb3V0ID0gKHtmb3JjZUtpbGxBZnRlclRpbWVvdXQgPSB0cnVlfSkgPT4ge1xuXHRpZiAoZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0ID09PSB0cnVlKSB7XG5cdFx0cmV0dXJuIERFRkFVTFRfRk9SQ0VfS0lMTF9USU1FT1VUO1xuXHR9XG5cblx0aWYgKCFOdW1iZXIuaXNGaW5pdGUoZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0KSB8fCBmb3JjZUtpbGxBZnRlclRpbWVvdXQgPCAwKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgdGhlIFxcYGZvcmNlS2lsbEFmdGVyVGltZW91dFxcYCBvcHRpb24gdG8gYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlciwgZ290IFxcYCR7Zm9yY2VLaWxsQWZ0ZXJUaW1lb3V0fVxcYCAoJHt0eXBlb2YgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0fSlgKTtcblx0fVxuXG5cdHJldHVybiBmb3JjZUtpbGxBZnRlclRpbWVvdXQ7XG59O1xuXG4vLyBgY2hpbGRQcm9jZXNzLmNhbmNlbCgpYFxuZXhwb3J0IGNvbnN0IHNwYXduZWRDYW5jZWwgPSAoc3Bhd25lZCwgY29udGV4dCkgPT4ge1xuXHRjb25zdCBraWxsUmVzdWx0ID0gc3Bhd25lZC5raWxsKCk7XG5cblx0aWYgKGtpbGxSZXN1bHQpIHtcblx0XHRjb250ZXh0LmlzQ2FuY2VsZWQgPSB0cnVlO1xuXHR9XG59O1xuXG5jb25zdCB0aW1lb3V0S2lsbCA9IChzcGF3bmVkLCBzaWduYWwsIHJlamVjdCkgPT4ge1xuXHRzcGF3bmVkLmtpbGwoc2lnbmFsKTtcblx0cmVqZWN0KE9iamVjdC5hc3NpZ24obmV3IEVycm9yKCdUaW1lZCBvdXQnKSwge3RpbWVkT3V0OiB0cnVlLCBzaWduYWx9KSk7XG59O1xuXG4vLyBgdGltZW91dGAgb3B0aW9uIGhhbmRsaW5nXG5leHBvcnQgY29uc3Qgc2V0dXBUaW1lb3V0ID0gKHNwYXduZWQsIHt0aW1lb3V0LCBraWxsU2lnbmFsID0gJ1NJR1RFUk0nfSwgc3Bhd25lZFByb21pc2UpID0+IHtcblx0aWYgKHRpbWVvdXQgPT09IDAgfHwgdGltZW91dCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIHNwYXduZWRQcm9taXNlO1xuXHR9XG5cblx0bGV0IHRpbWVvdXRJZDtcblx0Y29uc3QgdGltZW91dFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0dGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHR0aW1lb3V0S2lsbChzcGF3bmVkLCBraWxsU2lnbmFsLCByZWplY3QpO1xuXHRcdH0sIHRpbWVvdXQpO1xuXHR9KTtcblxuXHRjb25zdCBzYWZlU3Bhd25lZFByb21pc2UgPSBzcGF3bmVkUHJvbWlzZS5maW5hbGx5KCgpID0+IHtcblx0XHRjbGVhclRpbWVvdXQodGltZW91dElkKTtcblx0fSk7XG5cblx0cmV0dXJuIFByb21pc2UucmFjZShbdGltZW91dFByb21pc2UsIHNhZmVTcGF3bmVkUHJvbWlzZV0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHZhbGlkYXRlVGltZW91dCA9ICh7dGltZW91dH0pID0+IHtcblx0aWYgKHRpbWVvdXQgIT09IHVuZGVmaW5lZCAmJiAoIU51bWJlci5pc0Zpbml0ZSh0aW1lb3V0KSB8fCB0aW1lb3V0IDwgMCkpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCB0aGUgXFxgdGltZW91dFxcYCBvcHRpb24gdG8gYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlciwgZ290IFxcYCR7dGltZW91dH1cXGAgKCR7dHlwZW9mIHRpbWVvdXR9KWApO1xuXHR9XG59O1xuXG4vLyBgY2xlYW51cGAgb3B0aW9uIGhhbmRsaW5nXG5leHBvcnQgY29uc3Qgc2V0RXhpdEhhbmRsZXIgPSBhc3luYyAoc3Bhd25lZCwge2NsZWFudXAsIGRldGFjaGVkfSwgdGltZWRQcm9taXNlKSA9PiB7XG5cdGlmICghY2xlYW51cCB8fCBkZXRhY2hlZCkge1xuXHRcdHJldHVybiB0aW1lZFByb21pc2U7XG5cdH1cblxuXHRjb25zdCByZW1vdmVFeGl0SGFuZGxlciA9IG9uRXhpdCgoKSA9PiB7XG5cdFx0c3Bhd25lZC5raWxsKCk7XG5cdH0pO1xuXG5cdHJldHVybiB0aW1lZFByb21pc2UuZmluYWxseSgoKSA9PiB7XG5cdFx0cmVtb3ZlRXhpdEhhbmRsZXIoKTtcblx0fSk7XG59O1xuIiwgImV4cG9ydCBmdW5jdGlvbiBpc1N0cmVhbShzdHJlYW0pIHtcblx0cmV0dXJuIHN0cmVhbSAhPT0gbnVsbFxuXHRcdCYmIHR5cGVvZiBzdHJlYW0gPT09ICdvYmplY3QnXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5waXBlID09PSAnZnVuY3Rpb24nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNXcml0YWJsZVN0cmVhbShzdHJlYW0pIHtcblx0cmV0dXJuIGlzU3RyZWFtKHN0cmVhbSlcblx0XHQmJiBzdHJlYW0ud3JpdGFibGUgIT09IGZhbHNlXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5fd3JpdGUgPT09ICdmdW5jdGlvbidcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLl93cml0YWJsZVN0YXRlID09PSAnb2JqZWN0Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVhZGFibGVTdHJlYW0oc3RyZWFtKSB7XG5cdHJldHVybiBpc1N0cmVhbShzdHJlYW0pXG5cdFx0JiYgc3RyZWFtLnJlYWRhYmxlICE9PSBmYWxzZVxuXHRcdCYmIHR5cGVvZiBzdHJlYW0uX3JlYWQgPT09ICdmdW5jdGlvbidcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLl9yZWFkYWJsZVN0YXRlID09PSAnb2JqZWN0Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHVwbGV4U3RyZWFtKHN0cmVhbSkge1xuXHRyZXR1cm4gaXNXcml0YWJsZVN0cmVhbShzdHJlYW0pXG5cdFx0JiYgaXNSZWFkYWJsZVN0cmVhbShzdHJlYW0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUcmFuc2Zvcm1TdHJlYW0oc3RyZWFtKSB7XG5cdHJldHVybiBpc0R1cGxleFN0cmVhbShzdHJlYW0pXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5fdHJhbnNmb3JtID09PSAnZnVuY3Rpb24nO1xufVxuIiwgImltcG9ydCB7aXNTdHJlYW19IGZyb20gJ2lzLXN0cmVhbSc7XG5pbXBvcnQgZ2V0U3RyZWFtIGZyb20gJ2dldC1zdHJlYW0nO1xuaW1wb3J0IG1lcmdlU3RyZWFtIGZyb20gJ21lcmdlLXN0cmVhbSc7XG5cbi8vIGBpbnB1dGAgb3B0aW9uXG5leHBvcnQgY29uc3QgaGFuZGxlSW5wdXQgPSAoc3Bhd25lZCwgaW5wdXQpID0+IHtcblx0aWYgKGlucHV0ID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAoaXNTdHJlYW0oaW5wdXQpKSB7XG5cdFx0aW5wdXQucGlwZShzcGF3bmVkLnN0ZGluKTtcblx0fSBlbHNlIHtcblx0XHRzcGF3bmVkLnN0ZGluLmVuZChpbnB1dCk7XG5cdH1cbn07XG5cbi8vIGBhbGxgIGludGVybGVhdmVzIGBzdGRvdXRgIGFuZCBgc3RkZXJyYFxuZXhwb3J0IGNvbnN0IG1ha2VBbGxTdHJlYW0gPSAoc3Bhd25lZCwge2FsbH0pID0+IHtcblx0aWYgKCFhbGwgfHwgKCFzcGF3bmVkLnN0ZG91dCAmJiAhc3Bhd25lZC5zdGRlcnIpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgbWl4ZWQgPSBtZXJnZVN0cmVhbSgpO1xuXG5cdGlmIChzcGF3bmVkLnN0ZG91dCkge1xuXHRcdG1peGVkLmFkZChzcGF3bmVkLnN0ZG91dCk7XG5cdH1cblxuXHRpZiAoc3Bhd25lZC5zdGRlcnIpIHtcblx0XHRtaXhlZC5hZGQoc3Bhd25lZC5zdGRlcnIpO1xuXHR9XG5cblx0cmV0dXJuIG1peGVkO1xufTtcblxuLy8gT24gZmFpbHVyZSwgYHJlc3VsdC5zdGRvdXR8c3RkZXJyfGFsbGAgc2hvdWxkIGNvbnRhaW4gdGhlIGN1cnJlbnRseSBidWZmZXJlZCBzdHJlYW1cbmNvbnN0IGdldEJ1ZmZlcmVkRGF0YSA9IGFzeW5jIChzdHJlYW0sIHN0cmVhbVByb21pc2UpID0+IHtcblx0Ly8gV2hlbiBgYnVmZmVyYCBpcyBgZmFsc2VgLCBgc3RyZWFtUHJvbWlzZWAgaXMgYHVuZGVmaW5lZGAgYW5kIHRoZXJlIGlzIG5vIGJ1ZmZlcmVkIGRhdGEgdG8gcmV0cmlldmVcblx0aWYgKCFzdHJlYW0gfHwgc3RyZWFtUHJvbWlzZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0c3RyZWFtLmRlc3Ryb3koKTtcblxuXHR0cnkge1xuXHRcdHJldHVybiBhd2FpdCBzdHJlYW1Qcm9taXNlO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHJldHVybiBlcnJvci5idWZmZXJlZERhdGE7XG5cdH1cbn07XG5cbmNvbnN0IGdldFN0cmVhbVByb21pc2UgPSAoc3RyZWFtLCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyfSkgPT4ge1xuXHRpZiAoIXN0cmVhbSB8fCAhYnVmZmVyKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKGVuY29kaW5nKSB7XG5cdFx0cmV0dXJuIGdldFN0cmVhbShzdHJlYW0sIHtlbmNvZGluZywgbWF4QnVmZmVyfSk7XG5cdH1cblxuXHRyZXR1cm4gZ2V0U3RyZWFtLmJ1ZmZlcihzdHJlYW0sIHttYXhCdWZmZXJ9KTtcbn07XG5cbi8vIFJldHJpZXZlIHJlc3VsdCBvZiBjaGlsZCBwcm9jZXNzOiBleGl0IGNvZGUsIHNpZ25hbCwgZXJyb3IsIHN0cmVhbXMgKHN0ZG91dC9zdGRlcnIvYWxsKVxuZXhwb3J0IGNvbnN0IGdldFNwYXduZWRSZXN1bHQgPSBhc3luYyAoe3N0ZG91dCwgc3RkZXJyLCBhbGx9LCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyfSwgcHJvY2Vzc0RvbmUpID0+IHtcblx0Y29uc3Qgc3Rkb3V0UHJvbWlzZSA9IGdldFN0cmVhbVByb21pc2Uoc3Rkb3V0LCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyfSk7XG5cdGNvbnN0IHN0ZGVyclByb21pc2UgPSBnZXRTdHJlYW1Qcm9taXNlKHN0ZGVyciwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcn0pO1xuXHRjb25zdCBhbGxQcm9taXNlID0gZ2V0U3RyZWFtUHJvbWlzZShhbGwsIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXI6IG1heEJ1ZmZlciAqIDJ9KTtcblxuXHR0cnkge1xuXHRcdHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChbcHJvY2Vzc0RvbmUsIHN0ZG91dFByb21pc2UsIHN0ZGVyclByb21pc2UsIGFsbFByb21pc2VdKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoW1xuXHRcdFx0e2Vycm9yLCBzaWduYWw6IGVycm9yLnNpZ25hbCwgdGltZWRPdXQ6IGVycm9yLnRpbWVkT3V0fSxcblx0XHRcdGdldEJ1ZmZlcmVkRGF0YShzdGRvdXQsIHN0ZG91dFByb21pc2UpLFxuXHRcdFx0Z2V0QnVmZmVyZWREYXRhKHN0ZGVyciwgc3RkZXJyUHJvbWlzZSksXG5cdFx0XHRnZXRCdWZmZXJlZERhdGEoYWxsLCBhbGxQcm9taXNlKSxcblx0XHRdKTtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IHZhbGlkYXRlSW5wdXRTeW5jID0gKHtpbnB1dH0pID0+IHtcblx0aWYgKGlzU3RyZWFtKGlucHV0KSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBgaW5wdXRgIG9wdGlvbiBjYW5ub3QgYmUgYSBzdHJlYW0gaW4gc3luYyBtb2RlJyk7XG5cdH1cbn07XG4iLCAiLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHVuaWNvcm4vcHJlZmVyLXRvcC1sZXZlbC1hd2FpdFxuY29uc3QgbmF0aXZlUHJvbWlzZVByb3RvdHlwZSA9IChhc3luYyAoKSA9PiB7fSkoKS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG5cbmNvbnN0IGRlc2NyaXB0b3JzID0gWyd0aGVuJywgJ2NhdGNoJywgJ2ZpbmFsbHknXS5tYXAocHJvcGVydHkgPT4gW1xuXHRwcm9wZXJ0eSxcblx0UmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobmF0aXZlUHJvbWlzZVByb3RvdHlwZSwgcHJvcGVydHkpLFxuXSk7XG5cbi8vIFRoZSByZXR1cm4gdmFsdWUgaXMgYSBtaXhpbiBvZiBgY2hpbGRQcm9jZXNzYCBhbmQgYFByb21pc2VgXG5leHBvcnQgY29uc3QgbWVyZ2VQcm9taXNlID0gKHNwYXduZWQsIHByb21pc2UpID0+IHtcblx0Zm9yIChjb25zdCBbcHJvcGVydHksIGRlc2NyaXB0b3JdIG9mIGRlc2NyaXB0b3JzKSB7XG5cdFx0Ly8gU3RhcnRpbmcgdGhlIG1haW4gYHByb21pc2VgIGlzIGRlZmVycmVkIHRvIGF2b2lkIGNvbnN1bWluZyBzdHJlYW1zXG5cdFx0Y29uc3QgdmFsdWUgPSB0eXBlb2YgcHJvbWlzZSA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdFx0PyAoLi4uYXJncykgPT4gUmVmbGVjdC5hcHBseShkZXNjcmlwdG9yLnZhbHVlLCBwcm9taXNlKCksIGFyZ3MpXG5cdFx0XHQ6IGRlc2NyaXB0b3IudmFsdWUuYmluZChwcm9taXNlKTtcblxuXHRcdFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoc3Bhd25lZCwgcHJvcGVydHksIHsuLi5kZXNjcmlwdG9yLCB2YWx1ZX0pO1xuXHR9XG5cblx0cmV0dXJuIHNwYXduZWQ7XG59O1xuXG4vLyBVc2UgcHJvbWlzZXMgaW5zdGVhZCBvZiBgY2hpbGRfcHJvY2Vzc2AgZXZlbnRzXG5leHBvcnQgY29uc3QgZ2V0U3Bhd25lZFByb21pc2UgPSBzcGF3bmVkID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0c3Bhd25lZC5vbignZXhpdCcsIChleGl0Q29kZSwgc2lnbmFsKSA9PiB7XG5cdFx0cmVzb2x2ZSh7ZXhpdENvZGUsIHNpZ25hbH0pO1xuXHR9KTtcblxuXHRzcGF3bmVkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcblx0XHRyZWplY3QoZXJyb3IpO1xuXHR9KTtcblxuXHRpZiAoc3Bhd25lZC5zdGRpbikge1xuXHRcdHNwYXduZWQuc3RkaW4ub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuXHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHR9KTtcblx0fVxufSk7XG4iLCAiY29uc3Qgbm9ybWFsaXplQXJncyA9IChmaWxlLCBhcmdzID0gW10pID0+IHtcblx0aWYgKCFBcnJheS5pc0FycmF5KGFyZ3MpKSB7XG5cdFx0cmV0dXJuIFtmaWxlXTtcblx0fVxuXG5cdHJldHVybiBbZmlsZSwgLi4uYXJnc107XG59O1xuXG5jb25zdCBOT19FU0NBUEVfUkVHRVhQID0gL15bXFx3Li1dKyQvO1xuY29uc3QgRE9VQkxFX1FVT1RFU19SRUdFWFAgPSAvXCIvZztcblxuY29uc3QgZXNjYXBlQXJnID0gYXJnID0+IHtcblx0aWYgKHR5cGVvZiBhcmcgIT09ICdzdHJpbmcnIHx8IE5PX0VTQ0FQRV9SRUdFWFAudGVzdChhcmcpKSB7XG5cdFx0cmV0dXJuIGFyZztcblx0fVxuXG5cdHJldHVybiBgXCIke2FyZy5yZXBsYWNlKERPVUJMRV9RVU9URVNfUkVHRVhQLCAnXFxcXFwiJyl9XCJgO1xufTtcblxuZXhwb3J0IGNvbnN0IGpvaW5Db21tYW5kID0gKGZpbGUsIGFyZ3MpID0+IG5vcm1hbGl6ZUFyZ3MoZmlsZSwgYXJncykuam9pbignICcpO1xuXG5leHBvcnQgY29uc3QgZ2V0RXNjYXBlZENvbW1hbmQgPSAoZmlsZSwgYXJncykgPT4gbm9ybWFsaXplQXJncyhmaWxlLCBhcmdzKS5tYXAoYXJnID0+IGVzY2FwZUFyZyhhcmcpKS5qb2luKCcgJyk7XG5cbmNvbnN0IFNQQUNFU19SRUdFWFAgPSAvICsvZztcblxuLy8gSGFuZGxlIGBleGVjYUNvbW1hbmQoKWBcbmV4cG9ydCBjb25zdCBwYXJzZUNvbW1hbmQgPSBjb21tYW5kID0+IHtcblx0Y29uc3QgdG9rZW5zID0gW107XG5cdGZvciAoY29uc3QgdG9rZW4gb2YgY29tbWFuZC50cmltKCkuc3BsaXQoU1BBQ0VTX1JFR0VYUCkpIHtcblx0XHQvLyBBbGxvdyBzcGFjZXMgdG8gYmUgZXNjYXBlZCBieSBhIGJhY2tzbGFzaCBpZiBub3QgbWVhbnQgYXMgYSBkZWxpbWl0ZXJcblx0XHRjb25zdCBwcmV2aW91c1Rva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcblx0XHRpZiAocHJldmlvdXNUb2tlbiAmJiBwcmV2aW91c1Rva2VuLmVuZHNXaXRoKCdcXFxcJykpIHtcblx0XHRcdC8vIE1lcmdlIHByZXZpb3VzIHRva2VuIHdpdGggY3VycmVudCBvbmVcblx0XHRcdHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0gPSBgJHtwcmV2aW91c1Rva2VuLnNsaWNlKDAsIC0xKX0gJHt0b2tlbn1gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0b2tlbnMucHVzaCh0b2tlbik7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRva2Vucztcbn07XG4iLCAiaW1wb3J0IHsgTG9jYWxTdG9yYWdlIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgcGJrZGYyIH0gZnJvbSBcImNyeXB0b1wiO1xuaW1wb3J0IHsgTE9DQUxfU1RPUkFHRV9LRVkgfSBmcm9tIFwifi9jb25zdGFudHMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgREVGQVVMVF9QQVNTV09SRF9PUFRJT05TLCBSRVBST01QVF9IQVNIX1NBTFQgfSBmcm9tIFwifi9jb25zdGFudHMvcGFzc3dvcmRzXCI7XG5pbXBvcnQgeyBQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMgfSBmcm9tIFwifi90eXBlcy9wYXNzd29yZHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhc3N3b3JkR2VuZXJhdGluZ0FyZ3Mob3B0aW9uczogUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zKTogc3RyaW5nW10ge1xuICByZXR1cm4gT2JqZWN0LmVudHJpZXMob3B0aW9ucykuZmxhdE1hcCgoW2FyZywgdmFsdWVdKSA9PiAodmFsdWUgPyBbYC0tJHthcmd9YCwgdmFsdWVdIDogW10pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc2hNYXN0ZXJQYXNzd29yZEZvclJlcHJvbXB0aW5nKHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHBia2RmMihwYXNzd29yZCwgUkVQUk9NUFRfSEFTSF9TQUxULCAxMDAwMDAsIDY0LCBcInNoYTUxMlwiLCAoZXJyb3IsIGhhc2hlZCkgPT4ge1xuICAgICAgaWYgKGVycm9yICE9IG51bGwpIHtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZXNvbHZlKGhhc2hlZC50b1N0cmluZyhcImhleFwiKSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zKCkge1xuICBjb25zdCBzdG9yZWRPcHRpb25zID0gYXdhaXQgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5QQVNTV09SRF9PUFRJT05TKTtcbiAgcmV0dXJuIHtcbiAgICAuLi5ERUZBVUxUX1BBU1NXT1JEX09QVElPTlMsXG4gICAgLi4uKHN0b3JlZE9wdGlvbnMgPyBKU09OLnBhcnNlKHN0b3JlZE9wdGlvbnMpIDoge30pLFxuICB9IGFzIFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucztcbn1cbiIsICJpbXBvcnQgeyBQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMgfSBmcm9tIFwifi90eXBlcy9wYXNzd29yZHNcIjtcblxuZXhwb3J0IGNvbnN0IFJFUFJPTVBUX0hBU0hfU0FMVCA9IFwiZm9vYmFyYmF6enliYXpcIjtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUEFTU1dPUkRfT1BUSU9OUzogUmVxdWlyZWQ8UGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zPiA9IHtcbiAgbG93ZXJjYXNlOiB0cnVlLFxuICB1cHBlcmNhc2U6IHRydWUsXG4gIG51bWJlcjogZmFsc2UsXG4gIHNwZWNpYWw6IGZhbHNlLFxuICBwYXNzcGhyYXNlOiBmYWxzZSxcbiAgbGVuZ3RoOiBcIjE0XCIsXG4gIHdvcmRzOiBcIjNcIixcbiAgc2VwYXJhdG9yOiBcIi1cIixcbiAgY2FwaXRhbGl6ZTogZmFsc2UsXG4gIGluY2x1ZGVOdW1iZXI6IGZhbHNlLFxuICBtaW5OdW1iZXI6IFwiMVwiLFxuICBtaW5TcGVjaWFsOiBcIjFcIixcbn07XG4iLCAiaW1wb3J0IHsgZW52aXJvbm1lbnQsIGdldFByZWZlcmVuY2VWYWx1ZXMgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBWQVVMVF9USU1FT1VUX01TX1RPX0xBQkVMIH0gZnJvbSBcIn4vY29uc3RhbnRzL2xhYmVsc1wiO1xuaW1wb3J0IHsgQ29tbWFuZE5hbWUgfSBmcm9tIFwifi90eXBlcy9nZW5lcmFsXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXJ2ZXJVcmxQcmVmZXJlbmNlKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHsgc2VydmVyVXJsIH0gPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpO1xuICByZXR1cm4gIXNlcnZlclVybCB8fCBzZXJ2ZXJVcmwgPT09IFwiYml0d2FyZGVuLmNvbVwiIHx8IHNlcnZlclVybCA9PT0gXCJodHRwczovL2JpdHdhcmRlbi5jb21cIiA/IHVuZGVmaW5lZCA6IHNlcnZlclVybDtcbn1cblxudHlwZSBQcmVmZXJlbmNlS2V5T2ZDb21tYW5kc1dpdGhUcmFuc2llbnRPcHRpb25zID1cbiAgfCBrZXlvZiBQcmVmZXJlbmNlcy5TZWFyY2hcbiAgfCBrZXlvZiBQcmVmZXJlbmNlcy5HZW5lcmF0ZVBhc3N3b3JkXG4gIHwga2V5b2YgUHJlZmVyZW5jZXMuR2VuZXJhdGVQYXNzd29yZFF1aWNrO1xuXG50eXBlIFRyYW5zaWVudE9wdGlvbnNWYWx1ZSA9XG4gIHwgUHJlZmVyZW5jZXMuU2VhcmNoW1widHJhbnNpZW50Q29weVNlYXJjaFwiXVxuICB8IFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmRbXCJ0cmFuc2llbnRDb3B5R2VuZXJhdGVQYXNzd29yZFwiXVxuICB8IFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmRRdWlja1tcInRyYW5zaWVudENvcHlHZW5lcmF0ZVBhc3N3b3JkUXVpY2tcIl07XG5cbmNvbnN0IENPTU1BTkRfTkFNRV9UT19QUkVGRVJFTkNFX0tFWV9NQVA6IFJlY29yZDxDb21tYW5kTmFtZSwgUHJlZmVyZW5jZUtleU9mQ29tbWFuZHNXaXRoVHJhbnNpZW50T3B0aW9ucz4gPSB7XG4gIHNlYXJjaDogXCJ0cmFuc2llbnRDb3B5U2VhcmNoXCIsXG4gIFwiZ2VuZXJhdGUtcGFzc3dvcmRcIjogXCJ0cmFuc2llbnRDb3B5R2VuZXJhdGVQYXNzd29yZFwiLFxuICBcImdlbmVyYXRlLXBhc3N3b3JkLXF1aWNrXCI6IFwidHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmRRdWlja1wiLFxufTtcblxudHlwZSBQcmVmZXJlbmNlcyA9IFByZWZlcmVuY2VzLlNlYXJjaCAmIFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmQgJiBQcmVmZXJlbmNlcy5HZW5lcmF0ZVBhc3N3b3JkUXVpY2s7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2llbnRDb3B5UHJlZmVyZW5jZSh0eXBlOiBcInBhc3N3b3JkXCIgfCBcIm90aGVyXCIpOiBib29sZWFuIHtcbiAgY29uc3QgcHJlZmVyZW5jZUtleSA9IENPTU1BTkRfTkFNRV9UT19QUkVGRVJFTkNFX0tFWV9NQVBbZW52aXJvbm1lbnQuY29tbWFuZE5hbWUgYXMgQ29tbWFuZE5hbWVdO1xuICBjb25zdCB0cmFuc2llbnRQcmVmZXJlbmNlID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcz4oKVtwcmVmZXJlbmNlS2V5XSBhcyBUcmFuc2llbnRPcHRpb25zVmFsdWU7XG4gIGlmICh0cmFuc2llbnRQcmVmZXJlbmNlID09PSBcIm5ldmVyXCIpIHJldHVybiBmYWxzZTtcbiAgaWYgKHRyYW5zaWVudFByZWZlcmVuY2UgPT09IFwiYWx3YXlzXCIpIHJldHVybiB0cnVlO1xuICBpZiAodHJhbnNpZW50UHJlZmVyZW5jZSA9PT0gXCJwYXNzd29yZHNcIikgcmV0dXJuIHR5cGUgPT09IFwicGFzc3dvcmRcIjtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMYWJlbEZvclRpbWVvdXRQcmVmZXJlbmNlKHRpbWVvdXQ6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBWQVVMVF9USU1FT1VUX01TX1RPX0xBQkVMW3RpbWVvdXQgYXMga2V5b2YgdHlwZW9mIFZBVUxUX1RJTUVPVVRfTVNfVE9fTEFCRUxdO1xufVxuIiwgImNvbnN0IFZBVUxUX1RJTUVPVVRfT1BUSU9OUyA9IHtcbiAgSU1NRURJQVRFTFk6IFwiMFwiLFxuICBPTkVfTUlOVVRFOiBcIjYwMDAwXCIsXG4gIEZJVkVfTUlOVVRFUzogXCIzMDAwMDBcIixcbiAgRklGVEVFTl9NSU5VVEVTOiBcIjkwMDAwMFwiLFxuICBUSElSVFlfTUlOVVRFUzogXCIxODAwMDAwXCIsXG4gIE9ORV9IT1VSOiBcIjM2MDAwMDBcIixcbiAgRk9VUl9IT1VSUzogXCIxNDQwMDAwMFwiLFxuICBFSUdIVF9IT1VSUzogXCIyODgwMDAwMFwiLFxuICBPTkVfREFZOiBcIjg2NDAwMDAwXCIsXG4gIE5FVkVSOiBcIi0xXCIsXG4gIFNZU1RFTV9MT0NLOiBcIi0yXCIsXG4gIFNZU1RFTV9TTEVFUDogXCItM1wiLFxufSBhcyBjb25zdCBzYXRpc2ZpZXMgUmVjb3JkPHN0cmluZywgUHJlZmVyZW5jZXNbXCJyZXByb21wdElnbm9yZUR1cmF0aW9uXCJdPjtcblxuZXhwb3J0IGNvbnN0IFZBVUxUX1RJTUVPVVQgPSBPYmplY3QuZW50cmllcyhWQVVMVF9USU1FT1VUX09QVElPTlMpLnJlZHVjZSgoYWNjLCBba2V5LCB2YWx1ZV0pID0+IHtcbiAgYWNjW2tleSBhcyBrZXlvZiB0eXBlb2YgVkFVTFRfVElNRU9VVF9PUFRJT05TXSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgcmV0dXJuIGFjYztcbn0sIHt9IGFzIFJlY29yZDxrZXlvZiB0eXBlb2YgVkFVTFRfVElNRU9VVF9PUFRJT05TLCBudW1iZXI+KTtcbiIsICJpbXBvcnQgeyBWQVVMVF9USU1FT1VUIH0gZnJvbSBcIn4vY29uc3RhbnRzL3ByZWZlcmVuY2VzXCI7XG5pbXBvcnQgeyBDYXJkLCBJZGVudGl0eSwgSXRlbVR5cGUgfSBmcm9tIFwifi90eXBlcy92YXVsdFwiO1xuXG5leHBvcnQgY29uc3QgVkFVTFRfVElNRU9VVF9NU19UT19MQUJFTDogUGFydGlhbDxSZWNvcmQ8a2V5b2YgdHlwZW9mIFZBVUxUX1RJTUVPVVQsIHN0cmluZz4+ID0ge1xuICBbVkFVTFRfVElNRU9VVC5JTU1FRElBVEVMWV06IFwiSW1tZWRpYXRlbHlcIixcbiAgW1ZBVUxUX1RJTUVPVVQuT05FX01JTlVURV06IFwiMSBNaW51dGVcIixcbiAgW1ZBVUxUX1RJTUVPVVQuRklWRV9NSU5VVEVTXTogXCI1IE1pbnV0ZXNcIixcbiAgW1ZBVUxUX1RJTUVPVVQuRklGVEVFTl9NSU5VVEVTXTogXCIxNSBNaW51dGVzXCIsXG4gIFtWQVVMVF9USU1FT1VULlRISVJUWV9NSU5VVEVTXTogXCIzMCBNaW51dGVzXCIsXG4gIFtWQVVMVF9USU1FT1VULk9ORV9IT1VSXTogXCIxIEhvdXJcIixcbiAgW1ZBVUxUX1RJTUVPVVQuRk9VUl9IT1VSU106IFwiNCBIb3Vyc1wiLFxuICBbVkFVTFRfVElNRU9VVC5FSUdIVF9IT1VSU106IFwiOCBIb3Vyc1wiLFxuICBbVkFVTFRfVElNRU9VVC5PTkVfREFZXTogXCIxIERheVwiLFxufTtcblxuZXhwb3J0IGNvbnN0IENBUkRfS0VZX0xBQkVMOiBSZWNvcmQ8a2V5b2YgQ2FyZCwgc3RyaW5nPiA9IHtcbiAgY2FyZGhvbGRlck5hbWU6IFwiQ2FyZGhvbGRlciBuYW1lXCIsXG4gIGJyYW5kOiBcIkJyYW5kXCIsXG4gIG51bWJlcjogXCJOdW1iZXJcIixcbiAgZXhwTW9udGg6IFwiRXhwaXJhdGlvbiBtb250aFwiLFxuICBleHBZZWFyOiBcIkV4cGlyYXRpb24geWVhclwiLFxuICBjb2RlOiBcIlNlY3VyaXR5IGNvZGUgKENWVilcIixcbn07XG5cbmV4cG9ydCBjb25zdCBJREVOVElUWV9LRVlfTEFCRUw6IFJlY29yZDxrZXlvZiBJZGVudGl0eSwgc3RyaW5nPiA9IHtcbiAgdGl0bGU6IFwiVGl0bGVcIixcbiAgZmlyc3ROYW1lOiBcIkZpcnN0IG5hbWVcIixcbiAgbWlkZGxlTmFtZTogXCJNaWRkbGUgbmFtZVwiLFxuICBsYXN0TmFtZTogXCJMYXN0IG5hbWVcIixcbiAgdXNlcm5hbWU6IFwiVXNlcm5hbWVcIixcbiAgY29tcGFueTogXCJDb21wYW55XCIsXG4gIHNzbjogXCJTb2NpYWwgU2VjdXJpdHkgbnVtYmVyXCIsXG4gIHBhc3Nwb3J0TnVtYmVyOiBcIlBhc3Nwb3J0IG51bWJlclwiLFxuICBsaWNlbnNlTnVtYmVyOiBcIkxpY2Vuc2UgbnVtYmVyXCIsXG4gIGVtYWlsOiBcIkVtYWlsXCIsXG4gIHBob25lOiBcIlBob25lXCIsXG4gIGFkZHJlc3MxOiBcIkFkZHJlc3MgMVwiLFxuICBhZGRyZXNzMjogXCJBZGRyZXNzIDJcIixcbiAgYWRkcmVzczM6IFwiQWRkcmVzcyAzXCIsXG4gIGNpdHk6IFwiQ2l0eSAvIFRvd25cIixcbiAgc3RhdGU6IFwiU3RhdGUgLyBQcm92aW5jZVwiLFxuICBwb3N0YWxDb2RlOiBcIlppcCAvIFBvc3RhbCBjb2RlXCIsXG4gIGNvdW50cnk6IFwiQ291bnRyeVwiLFxufTtcblxuZXhwb3J0IGNvbnN0IElURU1fVFlQRV9UT19MQUJFTDogUmVjb3JkPEl0ZW1UeXBlLCBzdHJpbmc+ID0ge1xuICBbSXRlbVR5cGUuTE9HSU5dOiBcIkxvZ2luXCIsXG4gIFtJdGVtVHlwZS5DQVJEXTogXCJDYXJkXCIsXG4gIFtJdGVtVHlwZS5JREVOVElUWV06IFwiSWRlbnRpdHlcIixcbiAgW0l0ZW1UeXBlLk5PVEVdOiBcIlNlY3VyZSBOb3RlXCIsXG4gIFtJdGVtVHlwZS5TU0hfS0VZXTogXCJTU0ggS2V5XCIsXG59O1xuIiwgImV4cG9ydCBjbGFzcyBNYW51YWxseVRocm93bkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5zdGFjayA9IHN0YWNrO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEaXNwbGF5YWJsZUVycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlLCBzdGFjayk7XG4gIH1cbn1cblxuLyogLS0gc3BlY2lmaWMgZXJyb3JzIGJlbG93IC0tICovXG5cbmV4cG9ydCBjbGFzcyBDTElOb3RGb3VuZEVycm9yIGV4dGVuZHMgRGlzcGxheWFibGVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiQml0d2FyZGVuIENMSSBub3QgZm91bmRcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiQ0xJTm90Rm91bmRFcnJvclwiO1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvciBleHRlbmRzIERpc3BsYXlhYmxlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIkJpdHdhcmRlbiBDTEkgbm90IGZvdW5kXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIkluc3RhbGxlZENMSU5vdEZvdW5kRXJyb3JcIjtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJGYWlsZWQgdG8gbG9hZCB2YXVsdCBpdGVtc1wiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJGYWlsZWRUb0xvYWRWYXVsdEl0ZW1zRXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVmF1bHRJc0xvY2tlZEVycm9yIGV4dGVuZHMgRGlzcGxheWFibGVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIlZhdWx0IGlzIGxvY2tlZFwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJWYXVsdElzTG9ja2VkRXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTm90TG9nZ2VkSW5FcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIk5vdCBsb2dnZWQgaW5cIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiTm90TG9nZ2VkSW5FcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFbnN1cmVDbGlCaW5FcnJvciBleHRlbmRzIERpc3BsYXlhYmxlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJGYWlsZWQgZG8gZG93bmxvYWQgQml0d2FyZGVuIENMSVwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJFbnN1cmVDbGlCaW5FcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcmVtaXVtRmVhdHVyZUVycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIlByZW1pdW0gc3RhdHVzIGlzIHJlcXVpcmVkIHRvIHVzZSB0aGlzIGZlYXR1cmVcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiUHJlbWl1bUZlYXR1cmVFcnJvclwiO1xuICB9XG59XG5leHBvcnQgY2xhc3MgU2VuZE5lZWRzUGFzc3dvcmRFcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJUaGlzIFNlbmQgaGFzIGEgaXMgcHJvdGVjdGVkIGJ5IGEgcGFzc3dvcmRcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiU2VuZE5lZWRzUGFzc3dvcmRFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZW5kSW52YWxpZFBhc3N3b3JkRXJyb3IgZXh0ZW5kcyBNYW51YWxseVRocm93bkVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiVGhlIHBhc3N3b3JkIHlvdSBlbnRlcmVkIGlzIGludmFsaWRcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiU2VuZEludmFsaWRQYXNzd29yZEVycm9yXCI7XG4gIH1cbn1cblxuLyogLS0gZXJyb3IgdXRpbHMgYmVsb3cgLS0gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHRyeUV4ZWM8VD4oZm46ICgpID0+IFQpOiBUIGV4dGVuZHMgdm9pZCA/IFQgOiBUIHwgdW5kZWZpbmVkO1xuZXhwb3J0IGZ1bmN0aW9uIHRyeUV4ZWM8VCwgRj4oZm46ICgpID0+IFQsIGZhbGxiYWNrVmFsdWU6IEYpOiBUIHwgRjtcbmV4cG9ydCBmdW5jdGlvbiB0cnlFeGVjPFQsIEY+KGZuOiAoKSA9PiBULCBmYWxsYmFja1ZhbHVlPzogRik6IFQgfCBGIHwgdW5kZWZpbmVkIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZm4oKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbGxiYWNrVmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERpc3BsYXlhYmxlRXJyb3JNZXNzYWdlKGVycm9yOiBhbnkpIHtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgRGlzcGxheWFibGVFcnJvcikgcmV0dXJuIGVycm9yLm1lc3NhZ2U7XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBjb25zdCBnZXRFcnJvclN0cmluZyA9IChlcnJvcjogYW55KTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgaWYgKCFlcnJvcikgcmV0dXJuIHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBlcnJvciA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIGVycm9yO1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgbmFtZSB9ID0gZXJyb3I7XG4gICAgaWYgKGVycm9yLnN0YWNrKSByZXR1cm4gZXJyb3Iuc3RhY2s7XG4gICAgcmV0dXJuIGAke25hbWV9OiAke21lc3NhZ2V9YDtcbiAgfVxuICByZXR1cm4gU3RyaW5nKGVycm9yKTtcbn07XG5cbmV4cG9ydCB0eXBlIFN1Y2Nlc3M8VD4gPSBbVCwgbnVsbF07XG5leHBvcnQgdHlwZSBGYWlsdXJlPEU+ID0gW251bGwsIEVdO1xuZXhwb3J0IHR5cGUgUmVzdWx0PFQsIEUgPSBFcnJvcj4gPSBTdWNjZXNzPFQ+IHwgRmFpbHVyZTxFPjtcblxuZXhwb3J0IGZ1bmN0aW9uIE9rPFQ+KGRhdGE6IFQpOiBTdWNjZXNzPFQ+IHtcbiAgcmV0dXJuIFtkYXRhLCBudWxsXTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBFcnI8RSA9IEVycm9yPihlcnJvcjogRSk6IEZhaWx1cmU8RT4ge1xuICByZXR1cm4gW251bGwsIGVycm9yXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyeUNhdGNoPFQsIEUgPSBFcnJvcj4oZm46ICgpID0+IFQpOiBSZXN1bHQ8VCwgRT47XG5leHBvcnQgZnVuY3Rpb24gdHJ5Q2F0Y2g8VCwgRSA9IEVycm9yPihwcm9taXNlOiBQcm9taXNlPFQ+KTogUHJvbWlzZTxSZXN1bHQ8VCwgRT4+O1xuLyoqXG4gKiBFeGVjdXRlcyBhIGZ1bmN0aW9uIG9yIGEgcHJvbWlzZSBzYWZlbHkgaW5zaWRlIGEgdHJ5L2NhdGNoIGFuZFxuICogcmV0dXJucyBhIGBSZXN1bHRgIChgW2RhdGEsIGVycm9yXWApLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ5Q2F0Y2g8VCwgRSA9IEVycm9yPihmbk9yUHJvbWlzZTogKCgpID0+IFQpIHwgUHJvbWlzZTxUPik6IE1heWJlUHJvbWlzZTxSZXN1bHQ8VCwgRT4+IHtcbiAgaWYgKHR5cGVvZiBmbk9yUHJvbWlzZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBPayhmbk9yUHJvbWlzZSgpKTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICByZXR1cm4gRXJyKGVycm9yKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZuT3JQcm9taXNlLnRoZW4oKGRhdGEpID0+IE9rKGRhdGEpKS5jYXRjaCgoZXJyb3IpID0+IEVycihlcnJvcikpO1xufVxuIiwgImltcG9ydCB7IGV4aXN0c1N5bmMsIG1rZGlyU3luYywgc3RhdFN5bmMsIHVubGlua1N5bmMgfSBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IHJlYWRkaXIsIHVubGluayB9IGZyb20gXCJmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgc3RyZWFtWmlwIGZyb20gXCJub2RlLXN0cmVhbS16aXBcIjtcbmltcG9ydCB7IHRyeUV4ZWMgfSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JGaWxlQXZhaWxhYmxlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgaWYgKCFleGlzdHNTeW5jKHBhdGgpKSByZXR1cm47XG4gICAgICBjb25zdCBzdGF0cyA9IHN0YXRTeW5jKHBhdGgpO1xuICAgICAgaWYgKHN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSwgMzAwKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICByZWplY3QobmV3IEVycm9yKGBGaWxlICR7cGF0aH0gbm90IGZvdW5kLmApKTtcbiAgICB9LCA1MDAwKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNvbXByZXNzRmlsZShmaWxlUGF0aDogc3RyaW5nLCB0YXJnZXRQYXRoOiBzdHJpbmcpIHtcbiAgY29uc3QgemlwID0gbmV3IHN0cmVhbVppcC5hc3luYyh7IGZpbGU6IGZpbGVQYXRoIH0pO1xuICBpZiAoIWV4aXN0c1N5bmModGFyZ2V0UGF0aCkpIG1rZGlyU3luYyh0YXJnZXRQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgYXdhaXQgemlwLmV4dHJhY3QobnVsbCwgdGFyZ2V0UGF0aCk7XG4gIGF3YWl0IHppcC5jbG9zZSgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlRmlsZXNUaGF0U3RhcnRXaXRoKHN0YXJ0aW5nV2l0aDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpIHtcbiAgbGV0IHJlbW92ZWRBdExlYXN0T25lID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCByZWFkZGlyKHBhdGgpO1xuICAgIGZvciBhd2FpdCAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgaWYgKCFmaWxlLnN0YXJ0c1dpdGgoc3RhcnRpbmdXaXRoKSkgY29udGludWU7XG4gICAgICBhd2FpdCB0cnlFeGVjKGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdW5saW5rKGpvaW4ocGF0aCwgZmlsZSkpO1xuICAgICAgICByZW1vdmVkQXRMZWFzdE9uZSA9IHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcmVtb3ZlZEF0TGVhc3RPbmU7XG59XG5leHBvcnQgZnVuY3Rpb24gdW5saW5rQWxsU3luYyguLi5wYXRoczogc3RyaW5nW10pIHtcbiAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgdHJ5RXhlYygoKSA9PiB1bmxpbmtTeW5jKHBhdGgpKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IGNyZWF0ZVdyaXRlU3RyZWFtLCB1bmxpbmsgfSBmcm9tIFwiZnNcIjtcbmltcG9ydCBodHRwIGZyb20gXCJodHRwXCI7XG5pbXBvcnQgaHR0cHMgZnJvbSBcImh0dHBzXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIH0gZnJvbSBcIn4vdXRpbHMvZGV2ZWxvcG1lbnRcIjtcbmltcG9ydCB7IGdldEZpbGVTaGEyNTYgfSBmcm9tIFwifi91dGlscy9jcnlwdG9cIjtcbmltcG9ydCB7IHdhaXRGb3JGaWxlQXZhaWxhYmxlIH0gZnJvbSBcIn4vdXRpbHMvZnNcIjtcblxudHlwZSBEb3dubG9hZE9wdGlvbnMgPSB7XG4gIG9uUHJvZ3Jlc3M/OiAocGVyY2VudDogbnVtYmVyKSA9PiB2b2lkO1xuICBzaGEyNTY/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZG93bmxvYWQodXJsOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgb3B0aW9ucz86IERvd25sb2FkT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IG9uUHJvZ3Jlc3MsIHNoYTI1NiB9ID0gb3B0aW9ucyA/PyB7fTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHVyaSA9IG5ldyBVUkwodXJsKTtcbiAgICBjb25zdCBwcm90b2NvbCA9IHVyaS5wcm90b2NvbCA9PT0gXCJodHRwczpcIiA/IGh0dHBzIDogaHR0cDtcblxuICAgIGxldCByZWRpcmVjdENvdW50ID0gMDtcbiAgICBjb25zdCByZXF1ZXN0ID0gcHJvdG9jb2wuZ2V0KHVyaS5ocmVmLCAocmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPj0gMzAwICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPCA0MDApIHtcbiAgICAgICAgcmVxdWVzdC5kZXN0cm95KCk7XG4gICAgICAgIHJlc3BvbnNlLmRlc3Ryb3koKTtcblxuICAgICAgICBjb25zdCByZWRpcmVjdFVybCA9IHJlc3BvbnNlLmhlYWRlcnMubG9jYXRpb247XG4gICAgICAgIGlmICghcmVkaXJlY3RVcmwpIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBSZWRpcmVjdCByZXNwb25zZSB3aXRob3V0IGxvY2F0aW9uIGhlYWRlcmApKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKytyZWRpcmVjdENvdW50ID49IDEwKSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlRvbyBtYW55IHJlZGlyZWN0c1wiKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZG93bmxvYWQocmVkaXJlY3RVcmwsIHBhdGgsIG9wdGlvbnMpLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFJlc3BvbnNlIHN0YXR1cyAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9OiAke3Jlc3BvbnNlLnN0YXR1c01lc3NhZ2V9YCkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpbGVTaXplID0gcGFyc2VJbnQocmVzcG9uc2UuaGVhZGVyc1tcImNvbnRlbnQtbGVuZ3RoXCJdIHx8IFwiMFwiLCAxMCk7XG4gICAgICBpZiAoZmlsZVNpemUgPT09IDApIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkludmFsaWQgZmlsZSBzaXplXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBmaWxlU3RyZWFtID0gY3JlYXRlV3JpdGVTdHJlYW0ocGF0aCwgeyBhdXRvQ2xvc2U6IHRydWUgfSk7XG4gICAgICBsZXQgZG93bmxvYWRlZEJ5dGVzID0gMDtcblxuICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHtcbiAgICAgICAgcmVxdWVzdC5kZXN0cm95KCk7XG4gICAgICAgIHJlc3BvbnNlLmRlc3Ryb3koKTtcbiAgICAgICAgZmlsZVN0cmVhbS5jbG9zZSgpO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgY2xlYW51cEFuZFJlamVjdCA9IChlcnJvcj86IEVycm9yKSA9PiB7XG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH07XG5cbiAgICAgIHJlc3BvbnNlLm9uKFwiZGF0YVwiLCAoY2h1bmspID0+IHtcbiAgICAgICAgZG93bmxvYWRlZEJ5dGVzICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcGVyY2VudCA9IE1hdGguZmxvb3IoKGRvd25sb2FkZWRCeXRlcyAvIGZpbGVTaXplKSAqIDEwMCk7XG4gICAgICAgIG9uUHJvZ3Jlc3M/LihwZXJjZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICBmaWxlU3RyZWFtLm9uKFwiZmluaXNoXCIsIGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCB3YWl0Rm9yRmlsZUF2YWlsYWJsZShwYXRoKTtcbiAgICAgICAgICBpZiAoc2hhMjU2KSBhd2FpdCB3YWl0Rm9ySGFzaFRvTWF0Y2gocGF0aCwgc2hhMjU2KTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBmaWxlU3RyZWFtLm9uKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XG4gICAgICAgIGNhcHR1cmVFeGNlcHRpb24oYEZpbGUgc3RyZWFtIGVycm9yIHdoaWxlIGRvd25sb2FkaW5nICR7dXJsfWAsIGVycm9yKTtcbiAgICAgICAgdW5saW5rKHBhdGgsICgpID0+IGNsZWFudXBBbmRSZWplY3QoZXJyb3IpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXNwb25zZS5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKGBSZXNwb25zZSBlcnJvciB3aGlsZSBkb3dubG9hZGluZyAke3VybH1gLCBlcnJvcik7XG4gICAgICAgIHVubGluayhwYXRoLCAoKSA9PiBjbGVhbnVwQW5kUmVqZWN0KGVycm9yKSk7XG4gICAgICB9KTtcblxuICAgICAgcmVxdWVzdC5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKGBSZXF1ZXN0IGVycm9yIHdoaWxlIGRvd25sb2FkaW5nICR7dXJsfWAsIGVycm9yKTtcbiAgICAgICAgdW5saW5rKHBhdGgsICgpID0+IGNsZWFudXBBbmRSZWplY3QoZXJyb3IpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXNwb25zZS5waXBlKGZpbGVTdHJlYW0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gd2FpdEZvckhhc2hUb01hdGNoKHBhdGg6IHN0cmluZywgc2hhMjU2OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBmaWxlU2hhID0gZ2V0RmlsZVNoYTI1NihwYXRoKTtcbiAgICBpZiAoIWZpbGVTaGEpIHJldHVybiByZWplY3QobmV3IEVycm9yKGBDb3VsZCBub3QgZ2VuZXJhdGUgaGFzaCBmb3IgZmlsZSAke3BhdGh9LmApKTtcbiAgICBpZiAoZmlsZVNoYSA9PT0gc2hhMjU2KSByZXR1cm4gcmVzb2x2ZSgpO1xuXG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAoZ2V0RmlsZVNoYTI1NihwYXRoKSA9PT0gc2hhMjU2KSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSwgMTAwMCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcihgSGFzaCBkaWQgbm90IG1hdGNoLCBleHBlY3RlZCAke3NoYTI1Ni5zdWJzdHJpbmcoMCwgNyl9LCBnb3QgJHtmaWxlU2hhLnN1YnN0cmluZygwLCA3KX0uYCkpO1xuICAgIH0sIDUwMDApO1xuICB9KTtcbn1cbiIsICJpbXBvcnQgeyBlbnZpcm9ubWVudCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IGdldEVycm9yU3RyaW5nIH0gZnJvbSBcIn4vdXRpbHMvZXJyb3JzXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIGFzIGNhcHR1cmVFeGNlcHRpb25SYXljYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuXG50eXBlIExvZyA9IHtcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBlcnJvcjogYW55O1xufTtcblxuY29uc3QgX2V4Y2VwdGlvbnMgPSB7XG4gIGxvZ3M6IG5ldyBNYXA8RGF0ZSwgTG9nPigpLFxuICBzZXQ6IChtZXNzYWdlOiBzdHJpbmcsIGVycm9yPzogYW55KTogdm9pZCA9PiB7XG4gICAgY2FwdHVyZWRFeGNlcHRpb25zLmxvZ3Muc2V0KG5ldyBEYXRlKCksIHsgbWVzc2FnZSwgZXJyb3IgfSk7XG4gIH0sXG4gIGNsZWFyOiAoKTogdm9pZCA9PiBjYXB0dXJlZEV4Y2VwdGlvbnMubG9ncy5jbGVhcigpLFxuICB0b1N0cmluZzogKCk6IHN0cmluZyA9PiB7XG4gICAgbGV0IHN0ciA9IFwiXCI7XG4gICAgY2FwdHVyZWRFeGNlcHRpb25zLmxvZ3MuZm9yRWFjaCgobG9nLCBkYXRlKSA9PiB7XG4gICAgICBpZiAoc3RyLmxlbmd0aCA+IDApIHN0ciArPSBcIlxcblxcblwiO1xuICAgICAgc3RyICs9IGBbJHtkYXRlLnRvSVNPU3RyaW5nKCl9XSAke2xvZy5tZXNzYWdlfWA7XG4gICAgICBpZiAobG9nLmVycm9yKSBzdHIgKz0gYDogJHtnZXRFcnJvclN0cmluZyhsb2cuZXJyb3IpfWA7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3RyO1xuICB9LFxufTtcblxuZXhwb3J0IGNvbnN0IGNhcHR1cmVkRXhjZXB0aW9ucyA9IE9iamVjdC5mcmVlemUoX2V4Y2VwdGlvbnMpO1xuXG50eXBlIENhcHR1cmVFeGNlcHRpb25PcHRpb25zID0ge1xuICBjYXB0dXJlVG9SYXljYXN0PzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCBjb25zdCBjYXB0dXJlRXhjZXB0aW9uID0gKFxuICBkZXNjcmlwdGlvbjogc3RyaW5nIHwgRmFsc3kgfCAoc3RyaW5nIHwgRmFsc3kpW10sXG4gIGVycm9yOiBhbnksXG4gIG9wdGlvbnM/OiBDYXB0dXJlRXhjZXB0aW9uT3B0aW9uc1xuKSA9PiB7XG4gIGNvbnN0IHsgY2FwdHVyZVRvUmF5Y2FzdCA9IGZhbHNlIH0gPSBvcHRpb25zID8/IHt9O1xuICBjb25zdCBkZXNjID0gQXJyYXkuaXNBcnJheShkZXNjcmlwdGlvbikgPyBkZXNjcmlwdGlvbi5maWx0ZXIoQm9vbGVhbikuam9pbihcIiBcIikgOiBkZXNjcmlwdGlvbiB8fCBcIkNhcHR1cmVkIGV4Y2VwdGlvblwiO1xuICBjYXB0dXJlZEV4Y2VwdGlvbnMuc2V0KGRlc2MsIGVycm9yKTtcbiAgaWYgKGVudmlyb25tZW50LmlzRGV2ZWxvcG1lbnQpIHtcbiAgICBjb25zb2xlLmVycm9yKGRlc2MsIGVycm9yKTtcbiAgfSBlbHNlIGlmIChjYXB0dXJlVG9SYXljYXN0KSB7XG4gICAgY2FwdHVyZUV4Y2VwdGlvblJheWNhc3QoZXJyb3IpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZGVidWdMb2cgPSAoLi4uYXJnczogYW55W10pID0+IHtcbiAgaWYgKCFlbnZpcm9ubWVudC5pc0RldmVsb3BtZW50KSByZXR1cm47XG4gIGNvbnNvbGUuZGVidWcoLi4uYXJncyk7XG59O1xuIiwgImltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gXCJjcnlwdG9cIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVTaGEyNTYoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICB0cnkge1xuICAgIHJldHVybiBjcmVhdGVIYXNoKFwic2hhMjU2XCIpLnVwZGF0ZShyZWFkRmlsZVN5bmMoZmlsZVBhdGgpKS5kaWdlc3QoXCJoZXhcIik7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBTZW5kQ3JlYXRlUGF5bG9hZCB9IGZyb20gXCJ+L3R5cGVzL3NlbmRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVTZW5kUGF5bG9hZCh0ZW1wbGF0ZTogU2VuZENyZWF0ZVBheWxvYWQsIHZhbHVlczogU2VuZENyZWF0ZVBheWxvYWQpOiBTZW5kQ3JlYXRlUGF5bG9hZCB7XG4gIHJldHVybiB7XG4gICAgLi4udGVtcGxhdGUsXG4gICAgLi4udmFsdWVzLFxuICAgIGZpbGU6IHZhbHVlcy5maWxlID8geyAuLi50ZW1wbGF0ZS5maWxlLCAuLi52YWx1ZXMuZmlsZSB9IDogdGVtcGxhdGUuZmlsZSxcbiAgICB0ZXh0OiB2YWx1ZXMudGV4dCA/IHsgLi4udGVtcGxhdGUudGV4dCwgLi4udmFsdWVzLnRleHQgfSA6IHRlbXBsYXRlLnRleHQsXG4gIH07XG59XG4iLCAiaW1wb3J0IHsgQ2FjaGUgYXMgUmF5Y2FzdENhY2hlIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuXG5leHBvcnQgY29uc3QgQ2FjaGUgPSBuZXcgUmF5Y2FzdENhY2hlKHsgbmFtZXNwYWNlOiBcImJ3LWNhY2hlXCIgfSk7XG4iLCAiZXhwb3J0IGNvbnN0IHBsYXRmb3JtID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJkYXJ3aW5cIiA/IFwibWFjb3NcIiA6IFwid2luZG93c1wiO1xuIiwgImltcG9ydCB7IEZvcm0gfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5cbmV4cG9ydCBjb25zdCBMb2FkaW5nRmFsbGJhY2sgPSAoKSA9PiA8Rm9ybSBpc0xvYWRpbmcgLz47XG4iLCAiaW1wb3J0IHsgQWN0aW9uUGFuZWwsIEFjdGlvbiwgRGV0YWlsLCBnZXRQcmVmZXJlbmNlVmFsdWVzLCBlbnZpcm9ubWVudCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IEJ1Z1JlcG9ydENvbGxlY3REYXRhQWN0aW9uLCBCdWdSZXBvcnRPcGVuQWN0aW9uIH0gZnJvbSBcIn4vY29tcG9uZW50cy9hY3Rpb25zXCI7XG5pbXBvcnQgeyBCVUdfUkVQT1JUX1VSTCB9IGZyb20gXCJ+L2NvbXBvbmVudHMvYWN0aW9ucy9CdWdSZXBvcnRPcGVuQWN0aW9uXCI7XG5pbXBvcnQgeyBFbnN1cmVDbGlCaW5FcnJvciwgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvciwgZ2V0RXJyb3JTdHJpbmcgfSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcbmltcG9ydCB7IHBsYXRmb3JtIH0gZnJvbSBcIn4vdXRpbHMvcGxhdGZvcm1cIjtcblxuY29uc3QgTElORV9CUkVBSyA9IFwiXFxuXFxuXCI7XG5jb25zdCBDTElfSU5TVEFMTEFUSU9OX0hFTFBfVVJMID0gXCJodHRwczovL2JpdHdhcmRlbi5jb20vaGVscC9jbGkvI2Rvd25sb2FkLWFuZC1pbnN0YWxsXCI7XG5cbmNvbnN0IGdldENvZGVCbG9jayA9IChjb250ZW50OiBzdHJpbmcpID0+IGBcXGBcXGBcXGBcXG4ke2NvbnRlbnR9XFxuXFxgXFxgXFxgYDtcblxudHlwZSBNZXNzYWdlcyA9IHN0cmluZyB8IG51bWJlciB8IGZhbHNlIHwgMCB8IFwiXCIgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG5leHBvcnQgdHlwZSBUcm91Ymxlc2hvb3RpbmdHdWlkZVByb3BzID0ge1xuICBlcnJvcj86IGFueTtcbn07XG5cbmNvbnN0IFRyb3VibGVzaG9vdGluZ0d1aWRlID0gKHsgZXJyb3IgfTogVHJvdWJsZXNob290aW5nR3VpZGVQcm9wcykgPT4ge1xuICBjb25zdCBlcnJvclN0cmluZyA9IGdldEVycm9yU3RyaW5nKGVycm9yKTtcbiAgY29uc3QgbG9jYWxDbGlQYXRoID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcz4oKS5jbGlQYXRoO1xuICBjb25zdCBpc0NsaURvd25sb2FkRXJyb3IgPSBlcnJvciBpbnN0YW5jZW9mIEVuc3VyZUNsaUJpbkVycm9yO1xuICBjb25zdCBuZWVkc1RvSW5zdGFsbENsaSA9IGxvY2FsQ2xpUGF0aCB8fCBlcnJvciBpbnN0YW5jZW9mIEluc3RhbGxlZENMSU5vdEZvdW5kRXJyb3I7XG5cbiAgY29uc3QgbWVzc2FnZXM6IE1lc3NhZ2VzW10gPSBbXTtcblxuICBpZiAobmVlZHNUb0luc3RhbGxDbGkgJiYgIWlzQ2xpRG93bmxvYWRFcnJvcikge1xuICAgIG1lc3NhZ2VzLnB1c2goXCIjIFx1MjZBMFx1RkUwRiBCaXR3YXJkZW4gQ0xJIG5vdCBmb3VuZFwiKTtcbiAgfSBlbHNlIHtcbiAgICBtZXNzYWdlcy5wdXNoKFwiIyBcdUQ4M0RcdURDQTUgV2hvb3BzISBTb21ldGhpbmcgd2VudCB3cm9uZ1wiKTtcbiAgfVxuXG4gIGlmIChpc0NsaURvd25sb2FkRXJyb3IpIHtcbiAgICBtZXNzYWdlcy5wdXNoKFxuICAgICAgYFdlIGNvdWxkbid0IGRvd25sb2FkIHRoZSBbQml0d2FyZGVuIENMSV0oJHtDTElfSU5TVEFMTEFUSU9OX0hFTFBfVVJMfSksIHlvdSBjYW4gYWx3YXlzIGluc3RhbGwgaXQgb24geW91ciBtYWNoaW5lLmBcbiAgICApO1xuICB9IGVsc2UgaWYgKG5lZWRzVG9JbnN0YWxsQ2xpKSB7XG4gICAgY29uc3QgY2xpUGF0aFN0cmluZyA9IGxvY2FsQ2xpUGF0aCA/IGAgKCR7bG9jYWxDbGlQYXRofSlgIDogXCJcIjtcbiAgICBtZXNzYWdlcy5wdXNoKFxuICAgICAgYFdlIGNvdWxkbid0IGZpbmQgdGhlIFtCaXR3YXJkZW4gQ0xJXSgke0NMSV9JTlNUQUxMQVRJT05fSEVMUF9VUkx9KSBpbnN0YWxsZWQgb24geW91ciBtYWNoaW5lJHtjbGlQYXRoU3RyaW5nfS5gXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBtZXNzYWdlcy5wdXNoKGBUaGUgXFxgJHtlbnZpcm9ubWVudC5jb21tYW5kTmFtZX1cXGAgY29tbWFuZCBjcmFzaGVkIHdoZW4gd2Ugd2VyZSBub3QgZXhwZWN0aW5nIGl0IHRvLmApO1xuICB9XG5cbiAgbWVzc2FnZXMucHVzaChcbiAgICBcIj4gUGxlYXNlIHJlYWQgdGhlIGBTZXR1cGAgc2VjdGlvbiBpbiB0aGUgW2V4dGVuc2lvbidzIGRlc2NyaXB0aW9uXShodHRwczovL3d3dy5yYXljYXN0LmNvbS9qb21pZmVwZS9iaXR3YXJkZW4pIHRvIGVuc3VyZSB0aGF0IGV2ZXJ5dGhpbmcgaXMgcHJvcGVybHkgY29uZmlndXJlZC5cIlxuICApO1xuXG4gIG1lc3NhZ2VzLnB1c2goXG4gICAgYCoqVHJ5IHJlc3RhcnRpbmcgdGhlIGNvbW1hbmQuIElmIHRoZSBpc3N1ZSBwZXJzaXN0cywgY29uc2lkZXIgW3JlcG9ydGluZyBhIGJ1ZyBvbiBHaXRIdWJdKCR7QlVHX1JFUE9SVF9VUkx9KSB0byBoZWxwIHVzIGZpeCBpdC4qKmBcbiAgKTtcblxuICBpZiAoZXJyb3JTdHJpbmcpIHtcbiAgICBjb25zdCBpc0FyY2hFcnJvciA9IC9pbmNvbXBhdGlibGUgYXJjaGl0ZWN0dXJlL2dpLnRlc3QoZXJyb3JTdHJpbmcpO1xuICAgIG1lc3NhZ2VzLnB1c2goXG4gICAgICBcIj4jIyBUZWNobmljYWwgZGV0YWlscyBcdUQ4M0VcdUREMTNcIixcbiAgICAgIGlzQXJjaEVycm9yICYmXG4gICAgICAgIGBcdTI2QTBcdUZFMEYgV2Ugc3VzcGVjdCB0aGF0IHlvdXIgQml0d2FyZGVuIENMSSB3YXMgaW5zdGFsbGVkIHVzaW5nIGEgdmVyc2lvbiBvZiBOb2RlSlMgdGhhdCdzIGluY29tcGF0aWJsZSB3aXRoIHlvdXIgc3lzdGVtIGFyY2hpdGVjdHVyZSAoZS5nLiB4NjQgTm9kZUpTIG9uIGEgTTEvQXBwbGUgU2lsaWNvbiBNYWMpLiBQbGVhc2UgbWFrZSBzdXJlIHlvdXIgaGF2ZSB0aGUgY29ycmVjdCB2ZXJzaW9ucyBvZiB5b3VyIHNvZnR3YXJlIGluc3RhbGxlZCAoZS5nLiwgJHtcbiAgICAgICAgICBwbGF0Zm9ybSA9PT0gXCJtYWNvc1wiID8gXCJIb21lYnJldywgXCIgOiBcIlwiXG4gICAgICAgIH1Ob2RlSlMsIGFuZCBCaXR3YXJkZW4gQ0xJKS5gLFxuICAgICAgZ2V0Q29kZUJsb2NrKGVycm9yU3RyaW5nKVxuICAgICk7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxEZXRhaWxcbiAgICAgIG1hcmtkb3duPXttZXNzYWdlcy5maWx0ZXIoQm9vbGVhbikuam9pbihMSU5FX0JSRUFLKX1cbiAgICAgIGFjdGlvbnM9e1xuICAgICAgICA8QWN0aW9uUGFuZWw+XG4gICAgICAgICAgPEFjdGlvblBhbmVsLlNlY3Rpb24gdGl0bGU9XCJCdWcgUmVwb3J0XCI+XG4gICAgICAgICAgICA8QnVnUmVwb3J0T3BlbkFjdGlvbiAvPlxuICAgICAgICAgICAgPEJ1Z1JlcG9ydENvbGxlY3REYXRhQWN0aW9uIC8+XG4gICAgICAgICAgPC9BY3Rpb25QYW5lbC5TZWN0aW9uPlxuICAgICAgICAgIHtuZWVkc1RvSW5zdGFsbENsaSAmJiAoXG4gICAgICAgICAgICA8QWN0aW9uLk9wZW5JbkJyb3dzZXIgdGl0bGU9XCJPcGVuIEluc3RhbGxhdGlvbiBHdWlkZVwiIHVybD17Q0xJX0lOU1RBTExBVElPTl9IRUxQX1VSTH0gLz5cbiAgICAgICAgICApfVxuICAgICAgICA8L0FjdGlvblBhbmVsPlxuICAgICAgfVxuICAgIC8+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBUcm91Ymxlc2hvb3RpbmdHdWlkZTtcbiIsICJpbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5cbmV4cG9ydCBjb25zdCBCVUdfUkVQT1JUX1VSTCA9XG4gIFwiaHR0cHM6Ly9naXRodWIuY29tL3JheWNhc3QvZXh0ZW5zaW9ucy9pc3N1ZXMvbmV3P2Fzc2lnbmVlcz0mbGFiZWxzPWV4dGVuc2lvbiUyQ2J1ZyZ0ZW1wbGF0ZT1leHRlbnNpb25fYnVnX3JlcG9ydC55bWwmdGl0bGU9JTVCQml0d2FyZGVuJTVEKy4uLlwiO1xuXG5mdW5jdGlvbiBCdWdSZXBvcnRPcGVuQWN0aW9uKCkge1xuICByZXR1cm4gPEFjdGlvbi5PcGVuSW5Ccm93c2VyIHRpdGxlPVwiT3BlbiBCdWcgUmVwb3J0XCIgdXJsPXtCVUdfUkVQT1JUX1VSTH0gLz47XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJ1Z1JlcG9ydE9wZW5BY3Rpb247XG4iLCAiaW1wb3J0IHsgRWZmZWN0Q2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5cbnR5cGUgQXN5bmNFZmZlY3RDYWxsYmFjayA9ICgpID0+IFByb21pc2U8YW55PjtcbnR5cGUgRWZmZWN0ID0gRWZmZWN0Q2FsbGJhY2sgfCBBc3luY0VmZmVjdENhbGxiYWNrO1xuXG50eXBlIERlZmluZWRWYWx1ZSA9IG51bGwgfCBib29sZWFuIHwgbnVtYmVyIHwgc3RyaW5nIHwgb2JqZWN0IHwgc3ltYm9sO1xuXG4vKiogYHVzZUVmZmVjdGAgdGhhdCBvbmx5IHJ1bnMgb25jZSBhZnRlciB0aGUgYGNvbmRpdGlvbmAgaXMgbWV0ICovXG5mdW5jdGlvbiB1c2VPbmNlRWZmZWN0KGVmZmVjdDogRWZmZWN0LCBjb25kaXRpb24/OiBEZWZpbmVkVmFsdWUpIHtcbiAgY29uc3QgaGFzUnVuID0gdXNlUmVmKGZhbHNlKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChoYXNSdW4uY3VycmVudCkgcmV0dXJuO1xuICAgIGlmIChjb25kaXRpb24gIT09IHVuZGVmaW5lZCAmJiAhY29uZGl0aW9uKSByZXR1cm47XG4gICAgaGFzUnVuLmN1cnJlbnQgPSB0cnVlO1xuICAgIHZvaWQgZWZmZWN0KCk7XG4gIH0sIFtjb25kaXRpb25dKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdXNlT25jZUVmZmVjdDtcbiIsICJleHBvcnQgdHlwZSBPYmplY3RFbnRyaWVzPE9iaj4gPSB7IFtLZXkgaW4ga2V5b2YgT2JqXTogW0tleSwgT2JqW0tleV1dIH1ba2V5b2YgT2JqXVtdO1xuXG4vKiogYE9iamVjdC5lbnRyaWVzYCB3aXRoIHR5cGVkIGtleXMgKi9cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3RFbnRyaWVzPFQgZXh0ZW5kcyBvYmplY3Q+KG9iajogVCkge1xuICByZXR1cm4gT2JqZWN0LmVudHJpZXMob2JqKSBhcyBPYmplY3RFbnRyaWVzPFQ+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3Qob2JqOiB1bmtub3duKTogb2JqIGlzIG9iamVjdCB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShvYmopO1xufVxuIiwgImltcG9ydCB7IEV4ZWNhRXJyb3IgfSBmcm9tIFwiZXhlY2FcIjtcbmltcG9ydCB7IGlzT2JqZWN0IH0gZnJvbSBcIn4vdXRpbHMvb2JqZWN0c1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gdHJlYXRFcnJvcihlcnJvcjogdW5rbm93biwgb3B0aW9ucz86IHsgb21pdFNlbnNpdGl2ZVZhbHVlOiBzdHJpbmcgfSkge1xuICB0cnkge1xuICAgIGNvbnN0IGV4ZWNhRXJyb3IgPSBlcnJvciBhcyBFeGVjYUVycm9yO1xuICAgIGxldCBlcnJvclN0cmluZzogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGlmIChleGVjYUVycm9yPy5zdGRlcnIpIHtcbiAgICAgIGVycm9yU3RyaW5nID0gZXhlY2FFcnJvci5zdGRlcnI7XG4gICAgfSBlbHNlIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBlcnJvclN0cmluZyA9IGAke2Vycm9yLm5hbWV9OiAke2Vycm9yLm1lc3NhZ2V9YDtcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGVycm9yKSkge1xuICAgICAgZXJyb3JTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShlcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yU3RyaW5nID0gYCR7ZXJyb3J9YDtcbiAgICB9XG5cbiAgICBpZiAoIWVycm9yU3RyaW5nKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoIW9wdGlvbnM/Lm9taXRTZW5zaXRpdmVWYWx1ZSkgcmV0dXJuIGVycm9yU3RyaW5nO1xuXG4gICAgcmV0dXJuIG9taXRTZW5zaXRpdmVWYWx1ZUZyb21TdHJpbmcoZXJyb3JTdHJpbmcsIG9wdGlvbnMub21pdFNlbnNpdGl2ZVZhbHVlKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9taXRTZW5zaXRpdmVWYWx1ZUZyb21TdHJpbmcodmFsdWU6IHN0cmluZywgc2Vuc2l0aXZlVmFsdWU6IHN0cmluZykge1xuICByZXR1cm4gdmFsdWUucmVwbGFjZShuZXcgUmVnRXhwKHNlbnNpdGl2ZVZhbHVlLCBcImlcIiksIFwiW1JFREFDVEVEXVwiKTtcbn1cbiIsICJpbXBvcnQgeyBBbGVydCwgY2xvc2VNYWluV2luZG93LCBjb25maXJtQWxlcnQsIEljb24sIHBvcFRvUm9vdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZUJpdHdhcmRlbiB9IGZyb20gXCJ+L2NvbnRleHQvYml0d2FyZGVuXCI7XG5pbXBvcnQgeyBWYXVsdFN0YXRlIH0gZnJvbSBcIn4vdHlwZXMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgZ2V0U2VydmVyVXJsUHJlZmVyZW5jZSB9IGZyb20gXCJ+L3V0aWxzL3ByZWZlcmVuY2VzXCI7XG5cbmZ1bmN0aW9uIHVzZVZhdWx0TWVzc2FnZXMoKSB7XG4gIGNvbnN0IGJpdHdhcmRlbiA9IHVzZUJpdHdhcmRlbigpO1xuICBjb25zdCBbdmF1bHRTdGF0ZSwgc2V0VmF1bHRTdGF0ZV0gPSB1c2VTdGF0ZTxWYXVsdFN0YXRlIHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB2b2lkIGJpdHdhcmRlblxuICAgICAgLnN0YXR1cygpXG4gICAgICAudGhlbigoeyBlcnJvciwgcmVzdWx0IH0pID0+IHtcbiAgICAgICAgaWYgKCFlcnJvcikgc2V0VmF1bHRTdGF0ZShyZXN1bHQpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIC8qIGlnbm9yZSAqL1xuICAgICAgfSk7XG4gIH0sIFtdKTtcblxuICBjb25zdCBzaG91bGRTaG93U2VydmVyID0gISFnZXRTZXJ2ZXJVcmxQcmVmZXJlbmNlKCk7XG5cbiAgbGV0IHVzZXJNZXNzYWdlID0gXCIuLi5cIjtcbiAgbGV0IHNlcnZlck1lc3NhZ2UgPSBcIi4uLlwiO1xuXG4gIGlmICh2YXVsdFN0YXRlKSB7XG4gICAgY29uc3QgeyBzdGF0dXMsIHVzZXJFbWFpbCwgc2VydmVyVXJsIH0gPSB2YXVsdFN0YXRlO1xuICAgIHVzZXJNZXNzYWdlID0gc3RhdHVzID09IFwidW5hdXRoZW50aWNhdGVkXCIgPyBcIlx1Mjc0QyBMb2dnZWQgb3V0XCIgOiBgXHVEODNEXHVERDEyIExvY2tlZCAoJHt1c2VyRW1haWx9KWA7XG4gICAgaWYgKHNlcnZlclVybCkge1xuICAgICAgc2VydmVyTWVzc2FnZSA9IHNlcnZlclVybCB8fCBcIlwiO1xuICAgIH0gZWxzZSBpZiAoKCFzZXJ2ZXJVcmwgJiYgc2hvdWxkU2hvd1NlcnZlcikgfHwgKHNlcnZlclVybCAmJiAhc2hvdWxkU2hvd1NlcnZlcikpIHtcbiAgICAgIC8vIEhvc3RlZCBzdGF0ZSBub3QgaW4gc3luYyB3aXRoIENMSSAod2UgZG9uJ3QgY2hlY2sgZm9yIGVxdWFsaXR5KVxuICAgICAgdm9pZCBjb25maXJtQWxlcnQoe1xuICAgICAgICBpY29uOiBJY29uLkV4Y2xhbWF0aW9uTWFyayxcbiAgICAgICAgdGl0bGU6IFwiUmVzdGFydCBSZXF1aXJlZFwiLFxuICAgICAgICBtZXNzYWdlOiBcIkJpdHdhcmRlbiBzZXJ2ZXIgVVJMIHByZWZlcmVuY2UgaGFzIGJlZW4gY2hhbmdlZCBzaW5jZSB0aGUgZXh0ZW5zaW9uIHdhcyBvcGVuZWQuXCIsXG4gICAgICAgIHByaW1hcnlBY3Rpb246IHtcbiAgICAgICAgICB0aXRsZTogXCJDbG9zZSBFeHRlbnNpb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgZGlzbWlzc0FjdGlvbjoge1xuICAgICAgICAgIHRpdGxlOiBcIkNsb3NlIFJheWNhc3RcIiwgLy8gT25seSBoZXJlIHRvIHByb3ZpZGUgdGhlIG5lY2Vzc2FyeSBzZWNvbmQgb3B0aW9uXG4gICAgICAgICAgc3R5bGU6IEFsZXJ0LkFjdGlvblN0eWxlLkNhbmNlbCxcbiAgICAgICAgfSxcbiAgICAgIH0pLnRoZW4oKGNsb3NlRXh0ZW5zaW9uKSA9PiB7XG4gICAgICAgIGlmIChjbG9zZUV4dGVuc2lvbikge1xuICAgICAgICAgIHZvaWQgcG9wVG9Sb290KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdm9pZCBjbG9zZU1haW5XaW5kb3coKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgdXNlck1lc3NhZ2UsIHNlcnZlck1lc3NhZ2UsIHNob3VsZFNob3dTZXJ2ZXIgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdXNlVmF1bHRNZXNzYWdlcztcbiIsICJpbXBvcnQgeyBMb2NhbFN0b3JhZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyB1c2VQcm9taXNlIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG5cbnR5cGUgTG9jYWxTdG9yYWdlSXRlbUFjdGlvbnMgPSB7XG4gIGlzTG9hZGluZzogYm9vbGVhbjtcbiAgc2V0OiAodmFsdWU6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcbiAgcmVtb3ZlOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xufTtcblxuLyoqIFJlYWQgYW5kIG1hbmFnZSBhIHNpbmdsZSBpdGVtIGluIExvY2FsU3RvcmFnZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VMb2NhbFN0b3JhZ2VJdGVtKGtleTogc3RyaW5nKTogW3N0cmluZyB8IHVuZGVmaW5lZCwgTG9jYWxTdG9yYWdlSXRlbUFjdGlvbnNdO1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUxvY2FsU3RvcmFnZUl0ZW0oa2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogc3RyaW5nKTogW3N0cmluZywgTG9jYWxTdG9yYWdlSXRlbUFjdGlvbnNdO1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUxvY2FsU3RvcmFnZUl0ZW0oa2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZT86IHN0cmluZykge1xuICBjb25zdCB7IGRhdGE6IHZhbHVlLCByZXZhbGlkYXRlLCBpc0xvYWRpbmcgfSA9IHVzZVByb21pc2UoKCkgPT4gTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihrZXkpKTtcblxuICBjb25zdCBzZXQgPSBhc3luYyAodmFsdWU6IHN0cmluZykgPT4ge1xuICAgIGF3YWl0IExvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xuICAgIGF3YWl0IHJldmFsaWRhdGUoKTtcbiAgfTtcblxuICBjb25zdCByZW1vdmUgPSBhc3luYyAoKSA9PiB7XG4gICAgYXdhaXQgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbiAgICBhd2FpdCByZXZhbGlkYXRlKCk7XG4gIH07XG5cbiAgcmV0dXJuIFt2YWx1ZSA/PyBkZWZhdWx0VmFsdWUsIHsgaXNMb2FkaW5nLCBzZXQsIHJlbW92ZSB9XSBhcyBjb25zdDtcbn1cbiIsICJpbXBvcnQgeyBMaXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuXG5leHBvcnQgY29uc3QgVmF1bHRMb2FkaW5nRmFsbGJhY2sgPSAoKSA9PiA8TGlzdCBzZWFyY2hCYXJQbGFjZWhvbGRlcj1cIlNlYXJjaCB2YXVsdFwiIGlzTG9hZGluZyAvPjtcbiIsICJpbXBvcnQgeyB1c2VSZWR1Y2VyIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBTZXNzaW9uU3RhdGUgfSBmcm9tIFwifi90eXBlcy9zZXNzaW9uXCI7XG5cbmNvbnN0IGluaXRpYWxTdGF0ZTogU2Vzc2lvblN0YXRlID0ge1xuICB0b2tlbjogdW5kZWZpbmVkLFxuICBwYXNzd29yZEhhc2g6IHVuZGVmaW5lZCxcblxuICBpc0xvYWRpbmc6IHRydWUsXG4gIGlzTG9ja2VkOiBmYWxzZSxcbiAgaXNBdXRoZW50aWNhdGVkOiBmYWxzZSxcbn07XG5cbnR5cGUgU2Vzc2lvblJlZHVjZXJBY3Rpb25zID1cbiAgfCAoeyB0eXBlOiBcImxvYWRTdGF0ZVwiIH0gJiBQYXJ0aWFsPE9taXQ8U2Vzc2lvblN0YXRlLCBcImlzTG9hZGluZ1wiIHwgXCJpc0xvY2tlZFwiIHwgXCJpc0F1dGhlbnRpY2F0ZWRcIj4+KVxuICB8IHsgdHlwZTogXCJsb2NrXCIgfVxuICB8ICh7IHR5cGU6IFwidW5sb2NrXCIgfSAmIFBpY2s8U2Vzc2lvblN0YXRlLCBcInRva2VuXCIgfCBcInBhc3N3b3JkSGFzaFwiPilcbiAgfCB7IHR5cGU6IFwibG9nb3V0XCIgfVxuICB8IHsgdHlwZTogXCJ2YXVsdFRpbWVvdXRcIiB9XG4gIHwgeyB0eXBlOiBcImZpbmlzaExvYWRpbmdTYXZlZFN0YXRlXCIgfVxuICB8IHsgdHlwZTogXCJmYWlsTG9hZGluZ1NhdmVkU3RhdGVcIiB9O1xuXG5leHBvcnQgY29uc3QgdXNlU2Vzc2lvblJlZHVjZXIgPSAoKSA9PiB7XG4gIHJldHVybiB1c2VSZWR1Y2VyKChzdGF0ZTogU2Vzc2lvblN0YXRlLCBhY3Rpb246IFNlc3Npb25SZWR1Y2VyQWN0aW9ucyk6IFNlc3Npb25TdGF0ZSA9PiB7XG4gICAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgICAgY2FzZSBcImxvYWRTdGF0ZVwiOiB7XG4gICAgICAgIGNvbnN0IHsgdHlwZTogXywgLi4uYWN0aW9uUGF5bG9hZCB9ID0gYWN0aW9uO1xuICAgICAgICByZXR1cm4geyAuLi5zdGF0ZSwgLi4uYWN0aW9uUGF5bG9hZCB9O1xuICAgICAgfVxuICAgICAgY2FzZSBcImxvY2tcIjoge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgIHRva2VuOiB1bmRlZmluZWQsXG4gICAgICAgICAgcGFzc3dvcmRIYXNoOiB1bmRlZmluZWQsXG4gICAgICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICBpc0xvY2tlZDogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGNhc2UgXCJ1bmxvY2tcIjoge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgIHRva2VuOiBhY3Rpb24udG9rZW4sXG4gICAgICAgICAgcGFzc3dvcmRIYXNoOiBhY3Rpb24ucGFzc3dvcmRIYXNoLFxuICAgICAgICAgIGlzTG9ja2VkOiBmYWxzZSxcbiAgICAgICAgICBpc0F1dGhlbnRpY2F0ZWQ6IHRydWUsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBjYXNlIFwibG9nb3V0XCI6IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgICB0b2tlbjogdW5kZWZpbmVkLFxuICAgICAgICAgIHBhc3N3b3JkSGFzaDogdW5kZWZpbmVkLFxuICAgICAgICAgIGlzTG9ja2VkOiB0cnVlLFxuICAgICAgICAgIGlzQXV0aGVudGljYXRlZDogZmFsc2UsXG4gICAgICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGNhc2UgXCJ2YXVsdFRpbWVvdXRcIjoge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgIGlzTG9ja2VkOiB0cnVlLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgY2FzZSBcImZpbmlzaExvYWRpbmdTYXZlZFN0YXRlXCI6IHtcbiAgICAgICAgaWYgKCFzdGF0ZS50b2tlbiB8fCAhc3RhdGUucGFzc3dvcmRIYXNoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyByZXF1aXJlZCBmaWVsZHM6IHRva2VuLCBwYXNzd29yZEhhc2hcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBoYXNUb2tlbiA9ICEhc3RhdGUudG9rZW47XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICBpc0xvY2tlZDogIWhhc1Rva2VuLFxuICAgICAgICAgIGlzQXV0aGVudGljYXRlZDogaGFzVG9rZW4sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBjYXNlIFwiZmFpbExvYWRpbmdTYXZlZFN0YXRlXCI6IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgICBpc0xvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgIGlzTG9ja2VkOiB0cnVlLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICB9XG4gICAgfVxuICB9LCBpbml0aWFsU3RhdGUpO1xufTtcbiIsICJpbXBvcnQgeyBMb2NhbFN0b3JhZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBMT0NBTF9TVE9SQUdFX0tFWSB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBleGVjIGFzIGNhbGxiYWNrRXhlYywgUHJvbWlzZVdpdGhDaGlsZCB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tIFwidXRpbFwiO1xuaW1wb3J0IHsgY2FwdHVyZUV4Y2VwdGlvbiwgZGVidWdMb2cgfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuXG5jb25zdCBleGVjID0gcHJvbWlzaWZ5KGNhbGxiYWNrRXhlYyk7XG5cbmV4cG9ydCBjb25zdCBTZXNzaW9uU3RvcmFnZSA9IHtcbiAgZ2V0U2F2ZWRTZXNzaW9uOiAoKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgIExvY2FsU3RvcmFnZS5nZXRJdGVtPHN0cmluZz4oTE9DQUxfU1RPUkFHRV9LRVkuU0VTU0lPTl9UT0tFTiksXG4gICAgICBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KExPQ0FMX1NUT1JBR0VfS0VZLlJFUFJPTVBUX0hBU0gpLFxuICAgICAgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5MQVNUX0FDVElWSVRZX1RJTUUpLFxuICAgICAgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5WQVVMVF9MQVNUX1NUQVRVUyksXG4gICAgXSk7XG4gIH0sXG4gIGNsZWFyU2Vzc2lvbjogYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIExvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlNFU1NJT05fVE9LRU4pLFxuICAgICAgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuUkVQUk9NUFRfSEFTSCksXG4gICAgXSk7XG4gIH0sXG4gIHNhdmVTZXNzaW9uOiBhc3luYyAodG9rZW46IHN0cmluZywgcGFzc3dvcmRIYXNoOiBzdHJpbmcpID0+IHtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5TRVNTSU9OX1RPS0VOLCB0b2tlbiksXG4gICAgICBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5SRVBST01QVF9IQVNILCBwYXNzd29yZEhhc2gpLFxuICAgIF0pO1xuICB9LFxuICBsb2dvdXRDbGVhclNlc3Npb246IGFzeW5jICgpID0+IHtcbiAgICAvLyBjbGVhciBldmVyeXRoaW5nIHJlbGF0ZWQgdG8gdGhlIHNlc3Npb25cbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICBMb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShMT0NBTF9TVE9SQUdFX0tFWS5TRVNTSU9OX1RPS0VOKSxcbiAgICAgIExvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlJFUFJPTVBUX0hBU0gpLFxuICAgICAgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuTEFTVF9BQ1RJVklUWV9USU1FKSxcbiAgICBdKTtcbiAgfSxcbn07XG5cbmV4cG9ydCBjb25zdCBjaGVja1N5c3RlbUxvY2tlZFNpbmNlTGFzdEFjY2VzcyA9IChsYXN0QWN0aXZpdHlUaW1lOiBEYXRlKSA9PiB7XG4gIHJldHVybiBjaGVja1N5c3RlbUxvZ1RpbWVBZnRlcihsYXN0QWN0aXZpdHlUaW1lLCAodGltZTogbnVtYmVyKSA9PiBnZXRMYXN0U3lzbG9nKHRpbWUsIFwiaGFuZGxlVW5sb2NrUmVzdWx0XCIpKTtcbn07XG5leHBvcnQgY29uc3QgY2hlY2tTeXN0ZW1TbGVwdFNpbmNlTGFzdEFjY2VzcyA9IChsYXN0QWN0aXZpdHlUaW1lOiBEYXRlKSA9PiB7XG4gIHJldHVybiBjaGVja1N5c3RlbUxvZ1RpbWVBZnRlcihsYXN0QWN0aXZpdHlUaW1lLCAodGltZTogbnVtYmVyKSA9PiBnZXRMYXN0U3lzbG9nKHRpbWUsIFwic2xlZXAgMFwiKSk7XG59O1xuXG5mdW5jdGlvbiBnZXRMYXN0U3lzbG9nKGhvdXJzOiBudW1iZXIsIGZpbHRlcjogc3RyaW5nKSB7XG4gIHJldHVybiBleGVjKFxuICAgIGBsb2cgc2hvdyAtLXN0eWxlIHN5c2xvZyAtLXByZWRpY2F0ZSBcInByb2Nlc3MgPT0gJ2xvZ2lud2luZG93J1wiIC0taW5mbyAtLWxhc3QgJHtob3Vyc31oIHwgZ3JlcCBcIiR7ZmlsdGVyfVwiIHwgdGFpbCAtbiAxYFxuICApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tTeXN0ZW1Mb2dUaW1lQWZ0ZXIoXG4gIHRpbWU6IERhdGUsXG4gIGdldExvZ0VudHJ5OiAodGltZVNwYW5Ib3VyczogbnVtYmVyKSA9PiBQcm9taXNlV2l0aENoaWxkPHsgc3Rkb3V0OiBzdHJpbmc7IHN0ZGVycjogc3RyaW5nIH0+XG4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgbGFzdFNjcmVlbkxvY2tUaW1lID0gYXdhaXQgZ2V0U3lzdGVtTG9nVGltZShnZXRMb2dFbnRyeSk7XG4gIGlmICghbGFzdFNjcmVlbkxvY2tUaW1lKSByZXR1cm4gdHJ1ZTsgLy8gYXNzdW1lIHRoYXQgbG9nIHdhcyBmb3VuZCBmb3IgaW1wcm92ZWQgc2FmZXR5XG4gIHJldHVybiBuZXcgRGF0ZShsYXN0U2NyZWVuTG9ja1RpbWUpLmdldFRpbWUoKSA+IHRpbWUuZ2V0VGltZSgpO1xufVxuXG5jb25zdCBnZXRTeXN0ZW1Mb2dUaW1lX0lOQ1JFTUVOVF9IT1VSUyA9IDI7XG5jb25zdCBnZXRTeXN0ZW1Mb2dUaW1lX01BWF9SRVRSSUVTID0gNTtcbi8qKlxuICogU3RhcnRzIGJ5IGNoZWNraW5nIHRoZSBsYXN0IGhvdXIgYW5kIGluY3JlYXNlcyB0aGUgdGltZSBzcGFuIGJ5IHtAbGluayBnZXRTeXN0ZW1Mb2dUaW1lX0lOQ1JFTUVOVF9IT1VSU30gaG91cnMgb24gZWFjaCByZXRyeS5cbiAqIFx1MjZBMFx1RkUwRiBDYWxscyB0byB0aGUgc3lzdGVtIGxvZyBhcmUgdmVyeSBzbG93LCBhbmQgaWYgdGhlIHNjcmVlbiBoYXNuJ3QgYmVlbiBsb2NrZWQgZm9yIHNvbWUgaG91cnMsIGl0IGdldHMgc2xvd2VyLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRTeXN0ZW1Mb2dUaW1lKFxuICBnZXRMb2dFbnRyeTogKHRpbWVTcGFuSG91cnM6IG51bWJlcikgPT4gUHJvbWlzZVdpdGhDaGlsZDx7IHN0ZG91dDogc3RyaW5nOyBzdGRlcnI6IHN0cmluZyB9PixcbiAgdGltZVNwYW5Ib3VycyA9IDEsXG4gIHJldHJ5QXR0ZW1wdCA9IDBcbik6IFByb21pc2U8RGF0ZSB8IHVuZGVmaW5lZD4ge1xuICB0cnkge1xuICAgIGlmIChyZXRyeUF0dGVtcHQgPiBnZXRTeXN0ZW1Mb2dUaW1lX01BWF9SRVRSSUVTKSB7XG4gICAgICBkZWJ1Z0xvZyhcIk1heCByZXRyeSBhdHRlbXB0cyByZWFjaGVkIHRvIGdldCBsYXN0IHNjcmVlbiBsb2NrIHRpbWVcIik7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCB7IHN0ZG91dCwgc3RkZXJyIH0gPSBhd2FpdCBnZXRMb2dFbnRyeSh0aW1lU3BhbkhvdXJzKTtcbiAgICBjb25zdCBbbG9nRGF0ZSwgbG9nVGltZV0gPSBzdGRvdXQ/LnNwbGl0KFwiIFwiKSA/PyBbXTtcbiAgICBpZiAoc3RkZXJyIHx8ICFsb2dEYXRlIHx8ICFsb2dUaW1lKSB7XG4gICAgICByZXR1cm4gZ2V0U3lzdGVtTG9nVGltZShnZXRMb2dFbnRyeSwgdGltZVNwYW5Ib3VycyArIGdldFN5c3RlbUxvZ1RpbWVfSU5DUkVNRU5UX0hPVVJTLCByZXRyeUF0dGVtcHQgKyAxKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dGdWxsRGF0ZSA9IG5ldyBEYXRlKGAke2xvZ0RhdGV9VCR7bG9nVGltZX1gKTtcbiAgICBpZiAoIWxvZ0Z1bGxEYXRlIHx8IGxvZ0Z1bGxEYXRlLnRvU3RyaW5nKCkgPT09IFwiSW52YWxpZCBEYXRlXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICByZXR1cm4gbG9nRnVsbERhdGU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZXQgbGFzdCBzY3JlZW4gbG9jayB0aW1lXCIsIGVycm9yKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQWN0aW9uLCBDbGlwYm9hcmQsIEljb24sIFRvYXN0LCBlbnZpcm9ubWVudCwgZ2V0UHJlZmVyZW5jZVZhbHVlcywgc2hvd1RvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgY2FwdHVyZUV4Y2VwdGlvbiB9IGZyb20gXCJ+L3V0aWxzL2RldmVsb3BtZW50XCI7XG5pbXBvcnQgeyBleGVjIGFzIGV4ZWNXaXRoQ2FsbGJhY2tzIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgeyBjbGlJbmZvIH0gZnJvbSBcIn4vYXBpL2JpdHdhcmRlblwiO1xuaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gXCJ+L3V0aWxzL3BsYXRmb3JtXCI7XG5cbmNvbnN0IGV4ZWMgPSBwcm9taXNpZnkoZXhlY1dpdGhDYWxsYmFja3MpO1xuY29uc3QgeyBzdXBwb3J0UGF0aCB9ID0gZW52aXJvbm1lbnQ7XG5cbi8qKiBzdHJpcCBvdXQgYW55IHNlbnNpdGl2ZSBkYXRhIGZyb20gcHJlZmVyZW5jZXMgKi9cbmNvbnN0IGdldFNhZmVQcmVmZXJlbmNlcyA9ICgpID0+IHtcbiAgY29uc3Qge1xuICAgIGNsaWVudElkLFxuICAgIGNsaWVudFNlY3JldCxcbiAgICBmZXRjaEZhdmljb25zLFxuICAgIGdlbmVyYXRlUGFzc3dvcmRRdWlja0FjdGlvbixcbiAgICByZXByb21wdElnbm9yZUR1cmF0aW9uLFxuICAgIHNlcnZlckNlcnRzUGF0aCxcbiAgICBzZXJ2ZXJVcmwsXG4gICAgc2hvdWxkQ2FjaGVWYXVsdEl0ZW1zLFxuICAgIHRyYW5zaWVudENvcHlHZW5lcmF0ZVBhc3N3b3JkLFxuICAgIHRyYW5zaWVudENvcHlHZW5lcmF0ZVBhc3N3b3JkUXVpY2ssXG4gICAgdHJhbnNpZW50Q29weVNlYXJjaCxcbiAgICB3aW5kb3dBY3Rpb25PbkNvcHksXG4gIH0gPSBnZXRQcmVmZXJlbmNlVmFsdWVzPEFsbFByZWZlcmVuY2VzPigpO1xuXG4gIHJldHVybiB7XG4gICAgaGFzX2NsaWVudElkOiAhIWNsaWVudElkLFxuICAgIGhhc19jbGllbnRTZWNyZXQ6ICEhY2xpZW50U2VjcmV0LFxuICAgIGZldGNoRmF2aWNvbnMsXG4gICAgZ2VuZXJhdGVQYXNzd29yZFF1aWNrQWN0aW9uLFxuICAgIHJlcHJvbXB0SWdub3JlRHVyYXRpb24sXG4gICAgaGFzX3NlcnZlckNlcnRzUGF0aDogISFzZXJ2ZXJDZXJ0c1BhdGgsXG4gICAgaGFzX3NlcnZlclVybDogISFzZXJ2ZXJVcmwsXG4gICAgc2hvdWxkQ2FjaGVWYXVsdEl0ZW1zLFxuICAgIHRyYW5zaWVudENvcHlHZW5lcmF0ZVBhc3N3b3JkLFxuICAgIHRyYW5zaWVudENvcHlHZW5lcmF0ZVBhc3N3b3JkUXVpY2ssXG4gICAgdHJhbnNpZW50Q29weVNlYXJjaCxcbiAgICB3aW5kb3dBY3Rpb25PbkNvcHksXG4gIH07XG59O1xuXG5jb25zdCBOQSA9IFwiTi9BXCI7XG5jb25zdCB0cnlFeGVjID0gYXN5bmMgKGNvbW1hbmQ6IHN0cmluZywgdHJpbUxpbmVCcmVha3MgPSB0cnVlKSA9PiB7XG4gIHRyeSB7XG4gICAgbGV0IGNtZCA9IGNvbW1hbmQ7XG5cbiAgICBpZiAocGxhdGZvcm0gPT09IFwid2luZG93c1wiKSB7XG4gICAgICBjbWQgPSBgcG93ZXJzaGVsbCAtQ29tbWFuZCBcIiR7Y29tbWFuZH1cImA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNtZCA9IGBQQVRIPVwiJFBBVEg6JHtkaXJuYW1lKHByb2Nlc3MuZXhlY1BhdGgpfVwiICR7Y29tbWFuZH1gO1xuICAgIH1cbiAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgZXhlYyhjbWQsIHsgZW52OiB7IEJJVFdBUkRFTkNMSV9BUFBEQVRBX0RJUjogc3VwcG9ydFBhdGggfSB9KTtcbiAgICBjb25zdCByZXNwb25zZSA9IHN0ZG91dC50cmltKCk7XG4gICAgaWYgKHRyaW1MaW5lQnJlYWtzKSByZXR1cm4gcmVzcG9uc2UucmVwbGFjZSgvXFxufFxcci9nLCBcIlwiKTtcbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY2FwdHVyZUV4Y2VwdGlvbihgRmFpbGVkIHRvIGV4ZWN1dGUgY29tbWFuZDogJHtjb21tYW5kfWAsIGVycm9yKTtcbiAgICByZXR1cm4gTkE7XG4gIH1cbn07XG5cbmNvbnN0IGdldEJ3QmluSW5mbyA9ICgpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBjbGlQYXRoUHJlZiA9IGdldFByZWZlcmVuY2VWYWx1ZXM8UHJlZmVyZW5jZXM+KCkuY2xpUGF0aDtcbiAgICBpZiAoY2xpUGF0aFByZWYpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiY3VzdG9tXCIsIHBhdGg6IGNsaVBhdGhQcmVmIH07XG4gICAgfVxuICAgIGlmIChjbGlJbmZvLnBhdGguYmluID09PSBjbGlJbmZvLnBhdGguZG93bmxvYWRlZEJpbikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJkb3dubG9hZGVkXCIsIHBhdGg6IGNsaUluZm8ucGF0aC5kb3dubG9hZGVkQmluIH07XG4gICAgfVxuICAgIHJldHVybiB7IHR5cGU6IFwiaW5zdGFsbGVkXCIsIHBhdGg6IGNsaUluZm8ucGF0aC5pbnN0YWxsZWRCaW4gfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4geyB0eXBlOiBOQSwgcGF0aDogTkEgfTtcbiAgfVxufTtcblxuY29uc3QgZ2V0SG9tZWJyZXdJbmZvID0gYXN5bmMgKCkgPT4ge1xuICB0cnkge1xuICAgIGxldCBwYXRoID0gXCIvb3B0L2hvbWVicmV3L2Jpbi9icmV3XCI7XG4gICAgaWYgKCFleGlzdHNTeW5jKHBhdGgpKSBwYXRoID0gXCIvdXNyL2xvY2FsL2Jpbi9icmV3XCI7XG4gICAgaWYgKCFleGlzdHNTeW5jKHBhdGgpKSByZXR1cm4geyBhcmNoOiBOQSwgdmVyc2lvbjogTkEgfTtcblxuICAgIGNvbnN0IGNvbmZpZyA9IGF3YWl0IHRyeUV4ZWMoYCR7cGF0aH0gY29uZmlnYCwgZmFsc2UpO1xuICAgIGlmIChjb25maWcgPT09IE5BKSByZXR1cm4geyBhcmNoOiBOQSwgdmVyc2lvbjogTkEgfTtcblxuICAgIGNvbnN0IGFyY2hWYWx1ZSA9IC9IT01FQlJFV19QUkVGSVg6ICguKykvLmV4ZWMoY29uZmlnKT8uWzFdIHx8IE5BO1xuICAgIGNvbnN0IHZlcnNpb24gPSAvSE9NRUJSRVdfVkVSU0lPTjogKC4rKS8uZXhlYyhjb25maWcpPy5bMV0gfHwgTkE7XG4gICAgY29uc3QgYXJjaCA9IGFyY2hWYWx1ZSAhPT0gTkEgPyAoYXJjaFZhbHVlLmluY2x1ZGVzKFwiL29wdC9ob21lYnJld1wiKSA/IFwiYXJtNjRcIiA6IFwieDg2XzY0XCIpIDogTkE7XG5cbiAgICByZXR1cm4geyBhcmNoLCB2ZXJzaW9uIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIHsgYXJjaDogTkEsIHZlcnNpb246IE5BIH07XG4gIH1cbn07XG5cbmZ1bmN0aW9uIEJ1Z1JlcG9ydENvbGxlY3REYXRhQWN0aW9uKCkge1xuICBjb25zdCBjb2xsZWN0RGF0YSA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB0b2FzdCA9IGF3YWl0IHNob3dUb2FzdChUb2FzdC5TdHlsZS5BbmltYXRlZCwgXCJDb2xsZWN0aW5nIGRhdGEuLi5cIik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHByZWZlcmVuY2VzID0gZ2V0U2FmZVByZWZlcmVuY2VzKCk7XG4gICAgICBjb25zdCBid0luZm8gPSBnZXRCd0JpbkluZm8oKTtcbiAgICAgIGNvbnN0IFtzeXN0ZW1BcmNoLCBvc1ZlcnNpb24sIG9zQnVpbGRWZXJzaW9uLCBid1ZlcnNpb25dID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAuLi4ocGxhdGZvcm0gPT09IFwibWFjb3NcIlxuICAgICAgICAgID8gW3RyeUV4ZWMoXCJ1bmFtZSAtbVwiKSwgdHJ5RXhlYyhcInN3X3ZlcnMgLXByb2R1Y3RWZXJzaW9uXCIpLCB0cnlFeGVjKFwic3dfdmVycyAtYnVpbGRWZXJzaW9uXCIpXVxuICAgICAgICAgIDogW1xuICAgICAgICAgICAgICB0cnlFeGVjKFwiKEdldC1DaW1JbnN0YW5jZSBXaW4zMl9PcGVyYXRpbmdTeXN0ZW0pLk9TQXJjaGl0ZWN0dXJlXCIpLFxuICAgICAgICAgICAgICB0cnlFeGVjKFwiKEdldC1DaW1JbnN0YW5jZSBXaW4zMl9PcGVyYXRpbmdTeXN0ZW0pLkNhcHRpb25cIiksXG4gICAgICAgICAgICAgIHRyeUV4ZWMoXCIoR2V0LUNpbUluc3RhbmNlIFdpbjMyX09wZXJhdGluZ1N5c3RlbSkuVmVyc2lvblwiKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICB0cnlFeGVjKGAke2J3SW5mby5wYXRofSAtLXZlcnNpb25gKSxcbiAgICAgIF0pO1xuXG4gICAgICBjb25zdCBkYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge1xuICAgICAgICByYXljYXN0OiB7XG4gICAgICAgICAgdmVyc2lvbjogZW52aXJvbm1lbnQucmF5Y2FzdFZlcnNpb24sXG4gICAgICAgIH0sXG4gICAgICAgIHN5c3RlbToge1xuICAgICAgICAgIGFyY2g6IHN5c3RlbUFyY2gsXG4gICAgICAgICAgdmVyc2lvbjogb3NWZXJzaW9uLFxuICAgICAgICAgIGJ1aWxkVmVyc2lvbjogb3NCdWlsZFZlcnNpb24sXG4gICAgICAgIH0sXG4gICAgICAgIG5vZGU6IHtcbiAgICAgICAgICBhcmNoOiBwcm9jZXNzLmFyY2gsXG4gICAgICAgICAgdmVyc2lvbjogcHJvY2Vzcy52ZXJzaW9uLFxuICAgICAgICB9LFxuICAgICAgICBjbGk6IHtcbiAgICAgICAgICB0eXBlOiBid0luZm8udHlwZSxcbiAgICAgICAgICB2ZXJzaW9uOiBid1ZlcnNpb24sXG4gICAgICAgIH0sXG4gICAgICAgIHByZWZlcmVuY2VzLFxuICAgICAgfTtcblxuICAgICAgaWYgKHBsYXRmb3JtID09PSBcIm1hY29zXCIpIHtcbiAgICAgICAgY29uc3QgYnJld0luZm8gPSBhd2FpdCBnZXRIb21lYnJld0luZm8oKTtcbiAgICAgICAgZGF0YS5ob21lYnJldyA9IHtcbiAgICAgICAgICBhcmNoOiBicmV3SW5mby5hcmNoLFxuICAgICAgICAgIHZlcnNpb246IGJyZXdJbmZvLnZlcnNpb24sXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IENsaXBib2FyZC5jb3B5KEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuU3VjY2VzcztcbiAgICAgIHRvYXN0LnRpdGxlID0gXCJEYXRhIGNvcGllZCB0byBjbGlwYm9hcmRcIjtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5GYWlsdXJlO1xuICAgICAgdG9hc3QudGl0bGUgPSBcIkZhaWxlZCB0byBjb2xsZWN0IGJ1ZyByZXBvcnQgZGF0YVwiO1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBjb2xsZWN0IGJ1ZyByZXBvcnQgZGF0YVwiLCBlcnJvcik7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiA8QWN0aW9uIHRpdGxlPVwiQ29sbGVjdCBCdWcgUmVwb3J0IERhdGFcIiBpY29uPXtJY29uLkJ1Z30gb25BY3Rpb249e2NvbGxlY3REYXRhfSAvPjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQnVnUmVwb3J0Q29sbGVjdERhdGFBY3Rpb247XG4iLCAiaW1wb3J0IHsgQWN0aW9uLCBBbGVydCwgQ2xpcGJvYXJkLCBJY29uLCBUb2FzdCwgY29uZmlybUFsZXJ0LCBzaG93VG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBjYXB0dXJlZEV4Y2VwdGlvbnMgfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuXG5mdW5jdGlvbiBDb3B5UnVudGltZUVycm9yTG9nKCkge1xuICBjb25zdCBjb3B5RXJyb3JzID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGVycm9yU3RyaW5nID0gY2FwdHVyZWRFeGNlcHRpb25zLnRvU3RyaW5nKCk7XG4gICAgaWYgKGVycm9yU3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHNob3dUb2FzdChUb2FzdC5TdHlsZS5TdWNjZXNzLCBcIk5vIGVycm9ycyB0byBjb3B5XCIpO1xuICAgIH1cbiAgICBhd2FpdCBDbGlwYm9hcmQuY29weShlcnJvclN0cmluZyk7XG4gICAgYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLlN1Y2Nlc3MsIFwiRXJyb3JzIGNvcGllZCB0byBjbGlwYm9hcmRcIik7XG4gICAgYXdhaXQgY29uZmlybUFsZXJ0KHtcbiAgICAgIHRpdGxlOiBcIkJlIGNhcmVmdWwgd2l0aCB0aGlzIGluZm9ybWF0aW9uXCIsXG4gICAgICBtZXNzYWdlOlxuICAgICAgICBcIlBsZWFzZSBiZSBtaW5kZnVsIG9mIHdoZXJlIHlvdSBzaGFyZSB0aGlzIGVycm9yIGxvZywgYXMgaXQgbWF5IGNvbnRhaW4gc2Vuc2l0aXZlIGluZm9ybWF0aW9uLiBBbHdheXMgYW5hbHl6ZSBpdCBiZWZvcmUgc2hhcmluZy5cIixcbiAgICAgIHByaW1hcnlBY3Rpb246IHsgdGl0bGU6IFwiR290IGl0XCIsIHN0eWxlOiBBbGVydC5BY3Rpb25TdHlsZS5EZWZhdWx0IH0sXG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8QWN0aW9uIG9uQWN0aW9uPXtjb3B5RXJyb3JzfSB0aXRsZT1cIkNvcHkgTGFzdCBFcnJvcnNcIiBpY29uPXtJY29uLkNvcHlDbGlwYm9hcmR9IHN0eWxlPXtBY3Rpb24uU3R5bGUuUmVndWxhcn0gLz5cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29weVJ1bnRpbWVFcnJvckxvZztcbiIsICJpbXBvcnQgeyBBY3Rpb25QYW5lbCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IEJ1Z1JlcG9ydENvbGxlY3REYXRhQWN0aW9uLCBCdWdSZXBvcnRPcGVuQWN0aW9uLCBDb3B5UnVudGltZUVycm9yTG9nIH0gZnJvbSBcIn4vY29tcG9uZW50cy9hY3Rpb25zXCI7XG5pbXBvcnQgeyB1c2VDbGlWZXJzaW9uIH0gZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlQ2xpVmVyc2lvblwiO1xuXG5leHBvcnQgZnVuY3Rpb24gRGVidWdnaW5nQnVnUmVwb3J0aW5nQWN0aW9uU2VjdGlvbigpIHtcbiAgY29uc3QgY2xpVmVyc2lvbiA9IHVzZUNsaVZlcnNpb24oKTtcblxuICByZXR1cm4gKFxuICAgIDxBY3Rpb25QYW5lbC5TZWN0aW9uIHRpdGxlPXtgRGVidWdnaW5nICYgQnVnIFJlcG9ydGluZyAoQ0xJIHYke2NsaVZlcnNpb259KWB9PlxuICAgICAgPENvcHlSdW50aW1lRXJyb3JMb2cgLz5cbiAgICAgIDxCdWdSZXBvcnRPcGVuQWN0aW9uIC8+XG4gICAgICA8QnVnUmVwb3J0Q29sbGVjdERhdGFBY3Rpb24gLz5cbiAgICA8L0FjdGlvblBhbmVsLlNlY3Rpb24+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IENBQ0hFX0tFWVMgfSBmcm9tIFwifi9jb25zdGFudHMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgQ2FjaGUgfSBmcm9tIFwifi91dGlscy9jYWNoZVwiO1xuaW1wb3J0IHVzZU9uY2VFZmZlY3QgZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlT25jZUVmZmVjdFwiO1xuXG5jb25zdCBnZXRDbGlWZXJzaW9uID0gKCkgPT4ge1xuICBjb25zdCB2ZXJzaW9uID0gQ2FjaGUuZ2V0KENBQ0hFX0tFWVMuQ0xJX1ZFUlNJT04pO1xuICBpZiAodmVyc2lvbikgcmV0dXJuIHBhcnNlRmxvYXQodmVyc2lvbik7XG4gIHJldHVybiAtMTtcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VDbGlWZXJzaW9uID0gKCkgPT4ge1xuICBjb25zdCBbdmVyc2lvbiwgc2V0VmVyc2lvbl0gPSB1c2VTdGF0ZTxudW1iZXI+KGdldENsaVZlcnNpb24pO1xuXG4gIHVzZU9uY2VFZmZlY3QoKCkgPT4ge1xuICAgIENhY2hlLnN1YnNjcmliZSgoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgaWYgKHZhbHVlICYmIGtleSA9PT0gQ0FDSEVfS0VZUy5DTElfVkVSU0lPTikge1xuICAgICAgICBzZXRWZXJzaW9uKHBhcnNlRmxvYXQodmFsdWUpIHx8IC0xKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHZlcnNpb247XG59O1xuIiwgImltcG9ydCB7IEFjdGlvbiwgQWN0aW9uUGFuZWwsIENvbG9yLCBJY29uLCBzaG93VG9hc3QsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgVkFVTFRfTE9DS19NRVNTQUdFUyB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyB1c2VCaXR3YXJkZW4gfSBmcm9tIFwifi9jb250ZXh0L2JpdHdhcmRlblwiO1xuaW1wb3J0IHsgdXNlVmF1bHRDb250ZXh0IH0gZnJvbSBcIn4vY29udGV4dC92YXVsdFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gVmF1bHRBY3Rpb25zU2VjdGlvbigpIHtcbiAgY29uc3QgdmF1bHQgPSB1c2VWYXVsdENvbnRleHQoKTtcbiAgY29uc3QgYml0d2FyZGVuID0gdXNlQml0d2FyZGVuKCk7XG5cbiAgY29uc3QgaGFuZGxlTG9ja1ZhdWx0ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLkFuaW1hdGVkLCBcIkxvY2tpbmcgVmF1bHQuLi5cIiwgXCJQbGVhc2Ugd2FpdFwiKTtcbiAgICBhd2FpdCBiaXR3YXJkZW4ubG9jayh7IHJlYXNvbjogVkFVTFRfTE9DS19NRVNTQUdFUy5NQU5VQUwgfSk7XG4gICAgYXdhaXQgdG9hc3QuaGlkZSgpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUxvZ291dFZhdWx0ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgc2hvd1RvYXN0KHsgdGl0bGU6IFwiTG9nZ2luZyBPdXQuLi5cIiwgc3R5bGU6IFRvYXN0LlN0eWxlLkFuaW1hdGVkIH0pO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBiaXR3YXJkZW4ubG9nb3V0KCk7XG4gICAgICBhd2FpdCB0b2FzdC5oaWRlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRvYXN0LnRpdGxlID0gXCJGYWlsZWQgdG8gbG9nb3V0XCI7XG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLkZhaWx1cmU7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPEFjdGlvblBhbmVsLlNlY3Rpb24gdGl0bGU9XCJWYXVsdCBBY3Rpb25zXCI+XG4gICAgICA8QWN0aW9uXG4gICAgICAgIHRpdGxlPVwiU3luYyBWYXVsdFwiXG4gICAgICAgIHNob3J0Y3V0PXt7IG1hY09TOiB7IGtleTogXCJyXCIsIG1vZGlmaWVyczogW1wib3B0XCJdIH0sIHdpbmRvd3M6IHsga2V5OiBcInJcIiwgbW9kaWZpZXJzOiBbXCJhbHRcIl0gfSB9fVxuICAgICAgICBpY29uPXtJY29uLkFycm93Q2xvY2t3aXNlfVxuICAgICAgICBvbkFjdGlvbj17dmF1bHQuc3luY0l0ZW1zfVxuICAgICAgLz5cbiAgICAgIDxBY3Rpb25cbiAgICAgICAgaWNvbj17eyBzb3VyY2U6IFwic2Zfc3ltYm9sc19sb2NrLnN2Z1wiLCB0aW50Q29sb3I6IENvbG9yLlByaW1hcnlUZXh0IH19IC8vIERvZXMgbm90IGltbWVkaWF0ZWx5IGZvbGxvdyB0aGVtZVxuICAgICAgICB0aXRsZT1cIkxvY2sgVmF1bHRcIlxuICAgICAgICBzaG9ydGN1dD17e1xuICAgICAgICAgIG1hY09TOiB7IGtleTogXCJsXCIsIG1vZGlmaWVyczogW1wib3B0XCIsIFwic2hpZnRcIl0gfSxcbiAgICAgICAgICB3aW5kb3dzOiB7IGtleTogXCJsXCIsIG1vZGlmaWVyczogW1wiYWx0XCIsIFwic2hpZnRcIl0gfSxcbiAgICAgICAgfX1cbiAgICAgICAgb25BY3Rpb249e2hhbmRsZUxvY2tWYXVsdH1cbiAgICAgIC8+XG4gICAgICA8QWN0aW9uIHN0eWxlPXtBY3Rpb24uU3R5bGUuRGVzdHJ1Y3RpdmV9IHRpdGxlPVwiTG9nb3V0XCIgaWNvbj17SWNvbi5Mb2dvdXR9IG9uQWN0aW9uPXtoYW5kbGVMb2dvdXRWYXVsdH0gLz5cbiAgICA8L0FjdGlvblBhbmVsLlNlY3Rpb24+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgZ2V0UHJlZmVyZW5jZVZhbHVlcywgc2hvd1RvYXN0LCBUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIFJlYWN0Tm9kZSwgdXNlQ29udGV4dCwgdXNlTWVtbywgdXNlUmVkdWNlciB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlVmF1bHRJdGVtUHVibGlzaGVyIH0gZnJvbSBcIn4vY29tcG9uZW50cy9zZWFyY2hWYXVsdC9jb250ZXh0L3ZhdWx0TGlzdGVuZXJzXCI7XG5pbXBvcnQgeyB1c2VCaXR3YXJkZW4gfSBmcm9tIFwifi9jb250ZXh0L2JpdHdhcmRlblwiO1xuaW1wb3J0IHsgdXNlU2Vzc2lvbiB9IGZyb20gXCJ+L2NvbnRleHQvc2Vzc2lvblwiO1xuaW1wb3J0IHsgRm9sZGVyLCBJdGVtLCBWYXVsdCB9IGZyb20gXCJ+L3R5cGVzL3ZhdWx0XCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIH0gZnJvbSBcIn4vdXRpbHMvZGV2ZWxvcG1lbnRcIjtcbmltcG9ydCB1c2VWYXVsdENhY2hpbmcgZnJvbSBcIn4vY29tcG9uZW50cy9zZWFyY2hWYXVsdC91dGlscy91c2VWYXVsdENhY2hpbmdcIjtcbmltcG9ydCB7IEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvciwgZ2V0RGlzcGxheWFibGVFcnJvck1lc3NhZ2UgfSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcbmltcG9ydCB1c2VPbmNlRWZmZWN0IGZyb20gXCJ+L3V0aWxzL2hvb2tzL3VzZU9uY2VFZmZlY3RcIjtcbmltcG9ydCB7IHVzZUNhY2hlZFN0YXRlIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG5pbXBvcnQgeyBDQUNIRV9LRVlTLCBGT0xERVJfT1BUSU9OUyB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5cbmV4cG9ydCB0eXBlIFZhdWx0U3RhdGUgPSBWYXVsdCAmIHtcbiAgaXNMb2FkaW5nOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgVmF1bHRDb250ZXh0VHlwZSA9IFZhdWx0U3RhdGUgJiB7XG4gIGlzRW1wdHk6IGJvb2xlYW47XG4gIHN5bmNJdGVtczogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgbG9hZEl0ZW1zOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBjdXJyZW50Rm9sZGVySWQ6IE51bGxhYmxlPHN0cmluZz47XG4gIHNldEN1cnJlbnRGb2xkZXI6IChmb2xkZXJPcklkOiBOdWxsYWJsZTxzdHJpbmcgfCBGb2xkZXI+KSA9PiB2b2lkO1xuICB1cGRhdGVTdGF0ZTogKG5leHQ6IFJlYWN0LlNldFN0YXRlQWN0aW9uPFZhdWx0U3RhdGU+KSA9PiB2b2lkO1xufTtcblxuY29uc3QgVmF1bHRDb250ZXh0ID0gY3JlYXRlQ29udGV4dDxWYXVsdENvbnRleHRUeXBlIHwgbnVsbD4obnVsbCk7XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpOiBWYXVsdFN0YXRlIHtcbiAgcmV0dXJuIHsgaXRlbXM6IFtdLCBmb2xkZXJzOiBbXSwgaXNMb2FkaW5nOiB0cnVlIH07XG59XG5cbmV4cG9ydCB0eXBlIFZhdWx0UHJvdmlkZXJQcm9wcyA9IHtcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbn07XG5cbmNvbnN0IHsgc3luY09uTGF1bmNoIH0gPSBnZXRQcmVmZXJlbmNlVmFsdWVzPEFsbFByZWZlcmVuY2VzPigpO1xuXG5leHBvcnQgZnVuY3Rpb24gVmF1bHRQcm92aWRlcihwcm9wczogVmF1bHRQcm92aWRlclByb3BzKSB7XG4gIGNvbnN0IHsgY2hpbGRyZW4gfSA9IHByb3BzO1xuXG4gIGNvbnN0IHNlc3Npb24gPSB1c2VTZXNzaW9uKCk7XG4gIGNvbnN0IGJpdHdhcmRlbiA9IHVzZUJpdHdhcmRlbigpO1xuICBjb25zdCBwdWJsaXNoSXRlbXMgPSB1c2VWYXVsdEl0ZW1QdWJsaXNoZXIoKTtcbiAgY29uc3QgeyBnZXRDYWNoZWRWYXVsdCwgY2FjaGVWYXVsdCB9ID0gdXNlVmF1bHRDYWNoaW5nKCk7XG5cbiAgY29uc3QgW2N1cnJlbnRGb2xkZXJJZCwgc2V0Q3VycmVudEZvbGRlcklkXSA9IHVzZUNhY2hlZFN0YXRlPE51bGxhYmxlPHN0cmluZz4+KENBQ0hFX0tFWVMuQ1VSUkVOVF9GT0xERVJfSUQsIG51bGwpO1xuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVJlZHVjZXIoXG4gICAgKHByZXZpb3VzOiBWYXVsdFN0YXRlLCBuZXh0OiBQYXJ0aWFsPFZhdWx0U3RhdGU+KSA9PiAoeyAuLi5wcmV2aW91cywgLi4ubmV4dCB9KSxcbiAgICB7IC4uLmdldEluaXRpYWxTdGF0ZSgpLCAuLi5nZXRDYWNoZWRWYXVsdCgpIH1cbiAgKTtcblxuICB1c2VPbmNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc3luY09uTGF1bmNoKSB7XG4gICAgICB2b2lkIHN5bmNJdGVtcyh7IGlzSW5pdGlhbDogdHJ1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdm9pZCBsb2FkSXRlbXMoKTtcbiAgICB9XG4gIH0sIHNlc3Npb24uYWN0aXZlICYmIHNlc3Npb24udG9rZW4pO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIGxvYWRJdGVtcygpIHtcbiAgICB0cnkge1xuICAgICAgc2V0U3RhdGUoeyBpc0xvYWRpbmc6IHRydWUgfSk7XG5cbiAgICAgIGxldCBpdGVtczogSXRlbVtdID0gW107XG4gICAgICBsZXQgZm9sZGVyczogRm9sZGVyW10gPSBbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IFtpdGVtc1Jlc3VsdCwgZm9sZGVyc1Jlc3VsdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbYml0d2FyZGVuLmxpc3RJdGVtcygpLCBiaXR3YXJkZW4ubGlzdEZvbGRlcnMoKV0pO1xuICAgICAgICBpZiAoaXRlbXNSZXN1bHQuZXJyb3IpIHRocm93IGl0ZW1zUmVzdWx0LmVycm9yO1xuICAgICAgICBpZiAoZm9sZGVyc1Jlc3VsdC5lcnJvcikgdGhyb3cgZm9sZGVyc1Jlc3VsdC5lcnJvcjtcbiAgICAgICAgaXRlbXMgPSBpdGVtc1Jlc3VsdC5yZXN1bHQ7XG4gICAgICAgIGZvbGRlcnMgPSBmb2xkZXJzUmVzdWx0LnJlc3VsdDtcbiAgICAgICAgaXRlbXMuc29ydChmYXZvcml0ZUl0ZW1zRmlyc3RTb3J0ZXIpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcHVibGlzaEl0ZW1zKG5ldyBGYWlsZWRUb0xvYWRWYXVsdEl0ZW1zRXJyb3IoKSk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuXG4gICAgICBzZXRTdGF0ZSh7IGl0ZW1zLCBmb2xkZXJzIH0pO1xuICAgICAgcHVibGlzaEl0ZW1zKGl0ZW1zKTtcbiAgICAgIGNhY2hlVmF1bHQoaXRlbXMsIGZvbGRlcnMpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuRmFpbHVyZSwgXCJGYWlsZWQgdG8gbG9hZCB2YXVsdCBpdGVtc1wiLCBnZXREaXNwbGF5YWJsZUVycm9yTWVzc2FnZShlcnJvcikpO1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsb2FkIHZhdWx0IGl0ZW1zXCIsIGVycm9yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0U3RhdGUoeyBpc0xvYWRpbmc6IGZhbHNlIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIHN5bmNJdGVtcyhwcm9wcz86IHsgaXNJbml0aWFsPzogYm9vbGVhbiB9KSB7XG4gICAgY29uc3QgeyBpc0luaXRpYWwgPSBmYWxzZSB9ID0gcHJvcHMgPz8ge307XG5cbiAgICBjb25zdCB0b2FzdCA9IGF3YWl0IHNob3dUb2FzdCh7XG4gICAgICB0aXRsZTogXCJTeW5jaW5nIFZhdWx0Li4uXCIsXG4gICAgICBtZXNzYWdlOiBpc0luaXRpYWwgPyBcIkJhY2tncm91bmQgVGFza1wiIDogdW5kZWZpbmVkLFxuICAgICAgc3R5bGU6IFRvYXN0LlN0eWxlLkFuaW1hdGVkLFxuICAgIH0pO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBiaXR3YXJkZW4uc3luYygpO1xuICAgICAgYXdhaXQgbG9hZEl0ZW1zKCk7XG4gICAgICBhd2FpdCB0b2FzdC5oaWRlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF3YWl0IGJpdHdhcmRlbi5sb2dvdXQoKTtcbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuRmFpbHVyZTtcbiAgICAgIHRvYXN0LnRpdGxlID0gXCJGYWlsZWQgdG8gc3luYyB2YXVsdFwiO1xuICAgICAgdG9hc3QubWVzc2FnZSA9IGdldERpc3BsYXlhYmxlRXJyb3JNZXNzYWdlKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRDdXJyZW50Rm9sZGVyKGZvbGRlck9ySWQ6IE51bGxhYmxlPHN0cmluZyB8IEZvbGRlcj4pIHtcbiAgICBzZXRDdXJyZW50Rm9sZGVySWQodHlwZW9mIGZvbGRlck9ySWQgPT09IFwic3RyaW5nXCIgPyBmb2xkZXJPcklkIDogZm9sZGVyT3JJZD8uaWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlU3RhdGUobmV4dDogUmVhY3QuU2V0U3RhdGVBY3Rpb248VmF1bHRTdGF0ZT4pIHtcbiAgICBjb25zdCBuZXdTdGF0ZSA9IHR5cGVvZiBuZXh0ID09PSBcImZ1bmN0aW9uXCIgPyBuZXh0KHN0YXRlKSA6IG5leHQ7XG4gICAgc2V0U3RhdGUobmV3U3RhdGUpO1xuICAgIGNhY2hlVmF1bHQobmV3U3RhdGUuaXRlbXMsIG5ld1N0YXRlLmZvbGRlcnMpO1xuICB9XG5cbiAgY29uc3QgbWVtb2l6ZWRWYWx1ZTogVmF1bHRDb250ZXh0VHlwZSA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKHtcbiAgICAgIC4uLnN0YXRlLFxuICAgICAgaXRlbXM6IGZpbHRlckl0ZW1zQnlGb2xkZXJJZChzdGF0ZS5pdGVtcywgY3VycmVudEZvbGRlcklkKSxcbiAgICAgIGlzRW1wdHk6IHN0YXRlLml0ZW1zLmxlbmd0aCA9PSAwLFxuICAgICAgaXNMb2FkaW5nOiBzdGF0ZS5pc0xvYWRpbmcgfHwgc2Vzc2lvbi5pc0xvYWRpbmcsXG4gICAgICBjdXJyZW50Rm9sZGVySWQsXG4gICAgICBzeW5jSXRlbXMsXG4gICAgICBsb2FkSXRlbXMsXG4gICAgICBzZXRDdXJyZW50Rm9sZGVyLFxuICAgICAgdXBkYXRlU3RhdGUsXG4gICAgfSksXG4gICAgW3N0YXRlLCBzZXNzaW9uLmlzTG9hZGluZywgY3VycmVudEZvbGRlcklkLCBzeW5jSXRlbXMsIGxvYWRJdGVtcywgc2V0Q3VycmVudEZvbGRlciwgdXBkYXRlU3RhdGVdXG4gICk7XG5cbiAgcmV0dXJuIDxWYXVsdENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e21lbW9pemVkVmFsdWV9PntjaGlsZHJlbn08L1ZhdWx0Q29udGV4dC5Qcm92aWRlcj47XG59XG5cbmZ1bmN0aW9uIGZpbHRlckl0ZW1zQnlGb2xkZXJJZChpdGVtczogSXRlbVtdLCBmb2xkZXJJZDogTnVsbGFibGU8c3RyaW5nPikge1xuICBpZiAoIWZvbGRlcklkIHx8IGZvbGRlcklkID09PSBGT0xERVJfT1BUSU9OUy5BTEwpIHJldHVybiBpdGVtcztcbiAgaWYgKGZvbGRlcklkID09PSBGT0xERVJfT1BUSU9OUy5OT19GT0xERVIpIHJldHVybiBpdGVtcy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZm9sZGVySWQgPT09IG51bGwpO1xuICByZXR1cm4gaXRlbXMuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmZvbGRlcklkID09PSBmb2xkZXJJZCk7XG59XG5cbmZ1bmN0aW9uIGZhdm9yaXRlSXRlbXNGaXJzdFNvcnRlcihhOiBJdGVtLCBiOiBJdGVtKSB7XG4gIGlmIChhLmZhdm9yaXRlICYmIGIuZmF2b3JpdGUpIHJldHVybiAwO1xuICByZXR1cm4gYS5mYXZvcml0ZSA/IC0xIDogMTtcbn1cblxuZXhwb3J0IGNvbnN0IHVzZVZhdWx0Q29udGV4dCA9ICgpID0+IHtcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoVmF1bHRDb250ZXh0KTtcbiAgaWYgKGNvbnRleHQgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcInVzZVZhdWx0IG11c3QgYmUgdXNlZCB3aXRoaW4gYSBWYXVsdFByb3ZpZGVyXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNvbnRleHQ7XG59O1xuIiwgImltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIE11dGFibGVSZWZPYmplY3QsIFJlYWN0Tm9kZSwgdXNlQ29udGV4dCwgdXNlTWVtbywgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBJdGVtIH0gZnJvbSBcIn4vdHlwZXMvdmF1bHRcIjtcbmltcG9ydCB7IEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvciB9IGZyb20gXCJ+L3V0aWxzL2Vycm9yc1wiO1xuXG5leHBvcnQgdHlwZSBJdGVtTGlzdGVuZXIgPSAoaXRlbTogSXRlbSB8IEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvcikgPT4gdm9pZDtcblxuZXhwb3J0IHR5cGUgVmF1bHRMaXN0ZW5lcnNDb250ZXh0VHlwZSA9IHtcbiAgbGlzdGVuZXJzOiBNdXRhYmxlUmVmT2JqZWN0PE1hcDxzdHJpbmcsIEl0ZW1MaXN0ZW5lcj4+O1xuICBzdWJzY3JpYmVJdGVtOiAoaXRlbUlkOiBzdHJpbmcsIGxpc3RlbmVyOiBJdGVtTGlzdGVuZXIpID0+ICgpID0+IHZvaWQ7XG4gIHB1Ymxpc2hJdGVtczogKGl0ZW1zOiBJdGVtW10gfCBGYWlsZWRUb0xvYWRWYXVsdEl0ZW1zRXJyb3IpID0+IHZvaWQ7XG59O1xuXG5jb25zdCBWYXVsdExpc3RlbmVyc0NvbnRleHQgPSBjcmVhdGVDb250ZXh0PFZhdWx0TGlzdGVuZXJzQ29udGV4dFR5cGUgfCBudWxsPihudWxsKTtcblxuY29uc3QgVmF1bHRMaXN0ZW5lcnNQcm92aWRlciA9ICh7IGNoaWxkcmVuIH06IHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9KSA9PiB7XG4gIGNvbnN0IGxpc3RlbmVycyA9IHVzZVJlZihuZXcgTWFwPHN0cmluZywgSXRlbUxpc3RlbmVyPigpKTtcblxuICBjb25zdCBwdWJsaXNoSXRlbXMgPSAoaXRlbXNPckVycm9yOiBJdGVtW10gfCBGYWlsZWRUb0xvYWRWYXVsdEl0ZW1zRXJyb3IpID0+IHtcbiAgICBpZiAoaXRlbXNPckVycm9yIGluc3RhbmNlb2YgRmFpbGVkVG9Mb2FkVmF1bHRJdGVtc0Vycm9yKSB7XG4gICAgICBsaXN0ZW5lcnMuY3VycmVudC5mb3JFYWNoKChsaXN0ZW5lcikgPT4gbGlzdGVuZXIoaXRlbXNPckVycm9yKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3RlbmVycy5jdXJyZW50LmZvckVhY2goKGxpc3RlbmVyLCBpdGVtSWQpID0+IHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zT3JFcnJvci5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBpdGVtSWQpO1xuICAgICAgICBpZiAoaXRlbSkgbGlzdGVuZXIoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgc3Vic2NyaWJlSXRlbSA9IChpdGVtSWQ6IHN0cmluZywgbGlzdGVuZXI6IEl0ZW1MaXN0ZW5lcikgPT4ge1xuICAgIGxpc3RlbmVycy5jdXJyZW50LnNldChpdGVtSWQsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgbGlzdGVuZXJzLmN1cnJlbnQuZGVsZXRlKGl0ZW1JZCk7XG4gICAgfTtcbiAgfTtcblxuICBjb25zdCBtZW1vaXplZFZhbHVlID0gdXNlTWVtbygoKSA9PiAoeyBsaXN0ZW5lcnMsIHB1Ymxpc2hJdGVtcywgc3Vic2NyaWJlSXRlbSB9KSwgW10pO1xuXG4gIHJldHVybiA8VmF1bHRMaXN0ZW5lcnNDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXttZW1vaXplZFZhbHVlfT57Y2hpbGRyZW59PC9WYXVsdExpc3RlbmVyc0NvbnRleHQuUHJvdmlkZXI+O1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZVZhdWx0SXRlbVB1Ymxpc2hlciA9ICgpID0+IHtcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoVmF1bHRMaXN0ZW5lcnNDb250ZXh0KTtcbiAgaWYgKGNvbnRleHQgPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwidXNlVmF1bHRJdGVtUHVibGlzaGVyIG11c3QgYmUgdXNlZCB3aXRoaW4gYSBWYXVsdExpc3RlbmVyc1Byb3ZpZGVyXCIpO1xuXG4gIHJldHVybiBjb250ZXh0LnB1Ymxpc2hJdGVtcztcbn07XG5cbi8qKiBBbGxvd3MgeW91IHRvIHN1YnNjcmliZSB0byBhIHNwZWNpZmljIGl0ZW0gYW5kIGdldCBub3RpZmllZCB3aGVuIGl0IGNoYW5nZXMuICovXG5leHBvcnQgY29uc3QgdXNlVmF1bHRJdGVtU3Vic2NyaWJlciA9ICgpID0+IHtcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoVmF1bHRMaXN0ZW5lcnNDb250ZXh0KTtcbiAgaWYgKGNvbnRleHQgPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwidXNlVmF1bHRJdGVtU3Vic2NyaWJlciBtdXN0IGJlIHVzZWQgd2l0aGluIGEgVmF1bHRMaXN0ZW5lcnNQcm92aWRlclwiKTtcblxuICByZXR1cm4gKGl0ZW1JZDogc3RyaW5nKSA9PiB7XG4gICAgbGV0IHRpbWVvdXRJZDogTm9kZUpTLlRpbWVvdXQ7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2U8SXRlbT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdW5zdWJzY3JpYmUgPSBjb250ZXh0LnN1YnNjcmliZUl0ZW0oaXRlbUlkLCAoaXRlbU9yRXJyb3IpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICAgIGlmIChpdGVtT3JFcnJvciBpbnN0YW5jZW9mIEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgaXRlbU9yRXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUoaXRlbU9yRXJyb3IpO1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgcmVqZWN0KG5ldyBTdWJzY3JpYmVyVGltZW91dEVycm9yKCkpO1xuICAgICAgfSwgMTUwMDApO1xuICAgIH0pO1xuICB9O1xufTtcblxuY2xhc3MgU3Vic2NyaWJlclRpbWVvdXRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoXCJUaW1lZCBvdXQgd2FpdGluZyBmb3IgaXRlbVwiKTtcbiAgICB0aGlzLm5hbWUgPSBcIlN1YnNjcmliZXJUaW1lb3V0RXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWYXVsdExpc3RlbmVyc1Byb3ZpZGVyO1xuIiwgImltcG9ydCB7IGdldFByZWZlcmVuY2VWYWx1ZXMgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBwcmVwYXJlRm9sZGVyc0ZvckNhY2hlLCBwcmVwYXJlSXRlbXNGb3JDYWNoZSB9IGZyb20gXCJ+L2NvbXBvbmVudHMvc2VhcmNoVmF1bHQvdXRpbHMvY2FjaGluZ1wiO1xuaW1wb3J0IHsgQ0FDSEVfS0VZUyB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBGb2xkZXIsIEl0ZW0sIFZhdWx0IH0gZnJvbSBcIn4vdHlwZXMvdmF1bHRcIjtcbmltcG9ydCB7IENhY2hlIH0gZnJvbSBcIn4vdXRpbHMvY2FjaGVcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuaW1wb3J0IHsgdXNlQ29udGVudEVuY3J5cHRvciB9IGZyb20gXCJ+L3V0aWxzL2hvb2tzL3VzZUNvbnRlbnRFbmNyeXB0b3JcIjtcbmltcG9ydCB1c2VPbmNlRWZmZWN0IGZyb20gXCJ+L3V0aWxzL2hvb2tzL3VzZU9uY2VFZmZlY3RcIjtcblxuZnVuY3Rpb24gdXNlVmF1bHRDYWNoaW5nKCkge1xuICBjb25zdCB7IGVuY3J5cHQsIGRlY3J5cHQgfSA9IHVzZUNvbnRlbnRFbmNyeXB0b3IoKTtcbiAgY29uc3QgaXNDYWNoaW5nRW5hYmxlID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcy5TZWFyY2g+KCkuc2hvdWxkQ2FjaGVWYXVsdEl0ZW1zO1xuXG4gIHVzZU9uY2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIHVzZXJzIHRoYXQgb3B0IG91dCBvZiBjYWNoaW5nIHByb2JhYmx5IHdhbnQgdG8gZGVsZXRlIGFueSBjYWNoZWQgZGF0YVxuICAgIGlmICghQ2FjaGUuaXNFbXB0eSkgQ2FjaGUuY2xlYXIoKTtcbiAgfSwgIWlzQ2FjaGluZ0VuYWJsZSk7XG5cbiAgY29uc3QgZ2V0Q2FjaGVkVmF1bHQgPSAoKTogVmF1bHQgPT4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWlzQ2FjaGluZ0VuYWJsZSkgdGhyb3cgbmV3IFZhdWx0Q2FjaGluZ05vRW5hYmxlZEVycm9yKCk7XG5cbiAgICAgIGNvbnN0IGNhY2hlZEl2ID0gQ2FjaGUuZ2V0KENBQ0hFX0tFWVMuSVYpO1xuICAgICAgY29uc3QgY2FjaGVkRW5jcnlwdGVkVmF1bHQgPSBDYWNoZS5nZXQoQ0FDSEVfS0VZUy5WQVVMVCk7XG4gICAgICBpZiAoIWNhY2hlZEl2IHx8ICFjYWNoZWRFbmNyeXB0ZWRWYXVsdCkgdGhyb3cgbmV3IFZhdWx0Q2FjaGluZ05vRW5hYmxlZEVycm9yKCk7XG5cbiAgICAgIGNvbnN0IGRlY3J5cHRlZFZhdWx0ID0gZGVjcnlwdChjYWNoZWRFbmNyeXB0ZWRWYXVsdCwgY2FjaGVkSXYpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2U8VmF1bHQ+KGRlY3J5cHRlZFZhdWx0KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBWYXVsdENhY2hpbmdOb0VuYWJsZWRFcnJvcikpIHtcbiAgICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBkZWNyeXB0IGNhY2hlZCB2YXVsdFwiLCBlcnJvcik7XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpdGVtczogW10sIGZvbGRlcnM6IFtdIH07XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGNhY2hlVmF1bHQgPSAoaXRlbXM6IEl0ZW1bXSwgZm9sZGVyczogRm9sZGVyW10pOiB2b2lkID0+IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFpc0NhY2hpbmdFbmFibGUpIHRocm93IG5ldyBWYXVsdENhY2hpbmdOb0VuYWJsZWRFcnJvcigpO1xuXG4gICAgICBjb25zdCB2YXVsdFRvRW5jcnlwdCA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgaXRlbXM6IHByZXBhcmVJdGVtc0ZvckNhY2hlKGl0ZW1zKSxcbiAgICAgICAgZm9sZGVyczogcHJlcGFyZUZvbGRlcnNGb3JDYWNoZShmb2xkZXJzKSxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZW5jcnlwdGVkVmF1bHQgPSBlbmNyeXB0KHZhdWx0VG9FbmNyeXB0KTtcbiAgICAgIENhY2hlLnNldChDQUNIRV9LRVlTLlZBVUxULCBlbmNyeXB0ZWRWYXVsdC5jb250ZW50KTtcbiAgICAgIENhY2hlLnNldChDQUNIRV9LRVlTLklWLCBlbmNyeXB0ZWRWYXVsdC5pdik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgVmF1bHRDYWNoaW5nTm9FbmFibGVkRXJyb3IpKSB7XG4gICAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gY2FjaGUgdmF1bHRcIiwgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICByZXR1cm4geyBnZXRDYWNoZWRWYXVsdCwgY2FjaGVWYXVsdCB9O1xufVxuXG5jbGFzcyBWYXVsdENhY2hpbmdOb0VuYWJsZWRFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbmV4cG9ydCBkZWZhdWx0IHVzZVZhdWx0Q2FjaGluZztcbiIsICJpbXBvcnQgeyBTRU5TSVRJVkVfVkFMVUVfUExBQ0VIT0xERVIgfSBmcm9tIFwifi9jb25zdGFudHMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgRm9sZGVyLCBJZGVudGl0eVRpdGxlLCBJdGVtIH0gZnJvbSBcIn4vdHlwZXMvdmF1bHRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVJdGVtc0ZvckNhY2hlKGl0ZW1zOiBJdGVtW10pOiBJdGVtW10ge1xuICByZXR1cm4gaXRlbXMubWFwKChpdGVtKSA9PiAoe1xuICAgIG9iamVjdDogaXRlbS5vYmplY3QsXG4gICAgaWQ6IGl0ZW0uaWQsXG4gICAgb3JnYW5pemF0aW9uSWQ6IGl0ZW0ub3JnYW5pemF0aW9uSWQsXG4gICAgZm9sZGVySWQ6IGl0ZW0uZm9sZGVySWQsXG4gICAgdHlwZTogaXRlbS50eXBlLFxuICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICByZXZpc2lvbkRhdGU6IGl0ZW0ucmV2aXNpb25EYXRlLFxuICAgIGNyZWF0aW9uRGF0ZTogaXRlbS5jcmVhdGlvbkRhdGUsXG4gICAgZGVsZXRlZERhdGU6IGl0ZW0uZGVsZXRlZERhdGUsXG4gICAgZmF2b3JpdGU6IGl0ZW0uZmF2b3JpdGUsXG4gICAgcmVwcm9tcHQ6IGl0ZW0ucmVwcm9tcHQsXG4gICAgY29sbGVjdGlvbklkczogaXRlbS5jb2xsZWN0aW9uSWRzLFxuICAgIHNlY3VyZU5vdGU6IGl0ZW0uc2VjdXJlTm90ZSA/IHsgdHlwZTogaXRlbS5zZWN1cmVOb3RlLnR5cGUgfSA6IHVuZGVmaW5lZCxcbiAgICAvLyBzZW5zaXRpdmUgZGF0YSBiZWxvd1xuICAgIGZpZWxkczogY2xlYW5GaWVsZHMoaXRlbS5maWVsZHMpLFxuICAgIGxvZ2luOiBjbGVhbkxvZ2luKGl0ZW0ubG9naW4pLFxuICAgIGlkZW50aXR5OiBjbGVhbklkZW50aXR5KGl0ZW0uaWRlbnRpdHkpLFxuICAgIGNhcmQ6IGNsZWFuQ2FyZChpdGVtLmNhcmQpLFxuICAgIHBhc3N3b3JkSGlzdG9yeTogY2xlYW5QYXNzd29yZEhpc3RvcnkoaXRlbS5wYXNzd29yZEhpc3RvcnkpLFxuICAgIG5vdGVzOiBoaWRlSWZEZWZpbmVkKGl0ZW0ubm90ZXMpLFxuICAgIHNzaEtleTogY2xlYW5Tc2hLZXkoaXRlbS5zc2hLZXkpLFxuICB9KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVwYXJlRm9sZGVyc0ZvckNhY2hlKGZvbGRlcnM6IEZvbGRlcltdKTogRm9sZGVyW10ge1xuICByZXR1cm4gZm9sZGVycy5tYXAoKGZvbGRlcikgPT4gKHsgb2JqZWN0OiBmb2xkZXIub2JqZWN0LCBpZDogZm9sZGVyLmlkLCBuYW1lOiBmb2xkZXIubmFtZSB9KSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFuRmllbGRzKGZpZWxkczogSXRlbVtcImZpZWxkc1wiXSk6IEl0ZW1bXCJmaWVsZHNcIl0ge1xuICByZXR1cm4gZmllbGRzPy5tYXAoKGZpZWxkKSA9PiAoe1xuICAgIG5hbWU6IGZpZWxkLm5hbWUsIC8vIG5lY2Vzc2FyeSBmb3IgZGlzcGxheVxuICAgIHZhbHVlOiBoaWRlSWZEZWZpbmVkKGZpZWxkLnZhbHVlKSxcbiAgICB0eXBlOiBmaWVsZC50eXBlLFxuICAgIGxpbmtlZElkOiBmaWVsZC5saW5rZWRJZCxcbiAgfSkpO1xufVxuXG5mdW5jdGlvbiBjbGVhbkxvZ2luKGxvZ2luOiBJdGVtW1wibG9naW5cIl0pOiBJdGVtW1wibG9naW5cIl0ge1xuICBpZiAoIWxvZ2luKSByZXR1cm4gdW5kZWZpbmVkO1xuICByZXR1cm4ge1xuICAgIHVzZXJuYW1lOiBsb2dpbi51c2VybmFtZSwgLy8gbmVjZXNzYXJ5IGZvciBkaXNwbGF5XG4gICAgdXJpczogbG9naW4udXJpcyxcbiAgICBwYXNzd29yZDogaGlkZUlmRGVmaW5lZChsb2dpbi5wYXNzd29yZCksXG4gICAgcGFzc3dvcmRSZXZpc2lvbkRhdGU6IGhpZGVJZkRlZmluZWQobG9naW4ucGFzc3dvcmRSZXZpc2lvbkRhdGUpLFxuICAgIHRvdHA6IGhpZGVJZkRlZmluZWQobG9naW4udG90cCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsZWFuSWRlbnRpdHkoaWRlbnRpdHk6IEl0ZW1bXCJpZGVudGl0eVwiXSk6IEl0ZW1bXCJpZGVudGl0eVwiXSB7XG4gIGlmICghaWRlbnRpdHkpIHJldHVybiB1bmRlZmluZWQ7XG4gIHJldHVybiB7XG4gICAgdGl0bGU6IGhpZGVJZkRlZmluZWQoaWRlbnRpdHkudGl0bGUpIGFzIElkZW50aXR5VGl0bGUgfCBudWxsLFxuICAgIGZpcnN0TmFtZTogaGlkZUlmRGVmaW5lZChpZGVudGl0eS5maXJzdE5hbWUpLFxuICAgIG1pZGRsZU5hbWU6IGhpZGVJZkRlZmluZWQoaWRlbnRpdHkubWlkZGxlTmFtZSksXG4gICAgbGFzdE5hbWU6IGhpZGVJZkRlZmluZWQoaWRlbnRpdHkubGFzdE5hbWUpLFxuICAgIGFkZHJlc3MxOiBoaWRlSWZEZWZpbmVkKGlkZW50aXR5LmFkZHJlc3MxKSxcbiAgICBhZGRyZXNzMjogaGlkZUlmRGVmaW5lZChpZGVudGl0eS5hZGRyZXNzMiksXG4gICAgYWRkcmVzczM6IGhpZGVJZkRlZmluZWQoaWRlbnRpdHkuYWRkcmVzczMpLFxuICAgIGNpdHk6IGhpZGVJZkRlZmluZWQoaWRlbnRpdHkuY2l0eSksXG4gICAgc3RhdGU6IGhpZGVJZkRlZmluZWQoaWRlbnRpdHkuc3RhdGUpLFxuICAgIHBvc3RhbENvZGU6IGhpZGVJZkRlZmluZWQoaWRlbnRpdHkucG9zdGFsQ29kZSksXG4gICAgY291bnRyeTogaGlkZUlmRGVmaW5lZChpZGVudGl0eS5jb3VudHJ5KSxcbiAgICBjb21wYW55OiBoaWRlSWZEZWZpbmVkKGlkZW50aXR5LmNvbXBhbnkpLFxuICAgIGVtYWlsOiBoaWRlSWZEZWZpbmVkKGlkZW50aXR5LmVtYWlsKSxcbiAgICBwaG9uZTogaGlkZUlmRGVmaW5lZChpZGVudGl0eS5waG9uZSksXG4gICAgc3NuOiBoaWRlSWZEZWZpbmVkKGlkZW50aXR5LnNzbiksXG4gICAgdXNlcm5hbWU6IGhpZGVJZkRlZmluZWQoaWRlbnRpdHkudXNlcm5hbWUpLFxuICAgIHBhc3Nwb3J0TnVtYmVyOiBoaWRlSWZEZWZpbmVkKGlkZW50aXR5LnBhc3Nwb3J0TnVtYmVyKSxcbiAgICBsaWNlbnNlTnVtYmVyOiBoaWRlSWZEZWZpbmVkKGlkZW50aXR5LmxpY2Vuc2VOdW1iZXIpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjbGVhbkNhcmQoY2FyZDogSXRlbVtcImNhcmRcIl0pOiBJdGVtW1wiY2FyZFwiXSB7XG4gIGlmICghY2FyZCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgcmV0dXJuIHtcbiAgICBicmFuZDogY2FyZC5icmFuZCxcbiAgICBjYXJkaG9sZGVyTmFtZTogaGlkZUlmRGVmaW5lZChjYXJkLmNhcmRob2xkZXJOYW1lKSxcbiAgICBudW1iZXI6IGhpZGVJZkRlZmluZWQoY2FyZC5udW1iZXIpLFxuICAgIGV4cE1vbnRoOiBoaWRlSWZEZWZpbmVkKGNhcmQuZXhwTW9udGgpLFxuICAgIGV4cFllYXI6IGhpZGVJZkRlZmluZWQoY2FyZC5leHBZZWFyKSxcbiAgICBjb2RlOiBoaWRlSWZEZWZpbmVkKGNhcmQuY29kZSksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsZWFuUGFzc3dvcmRIaXN0b3J5KHBhc3N3b3JkSGlzdG9yeUl0ZW1zOiBJdGVtW1wicGFzc3dvcmRIaXN0b3J5XCJdKTogSXRlbVtcInBhc3N3b3JkSGlzdG9yeVwiXSB7XG4gIHJldHVybiBwYXNzd29yZEhpc3RvcnlJdGVtcz8ubWFwKChwYXNzd29yZEhpc3RvcnkpID0+ICh7XG4gICAgcGFzc3dvcmQ6IGhpZGVJZkRlZmluZWQocGFzc3dvcmRIaXN0b3J5LnBhc3N3b3JkKSxcbiAgICBsYXN0VXNlZERhdGU6IGhpZGVJZkRlZmluZWQocGFzc3dvcmRIaXN0b3J5Lmxhc3RVc2VkRGF0ZSksXG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gY2xlYW5Tc2hLZXkoc3NoS2V5OiBJdGVtW1wic3NoS2V5XCJdKTogSXRlbVtcInNzaEtleVwiXSB7XG4gIGlmICghc3NoS2V5KSByZXR1cm4gdW5kZWZpbmVkO1xuICByZXR1cm4ge1xuICAgIHB1YmxpY0tleTogc3NoS2V5LnB1YmxpY0tleSxcbiAgICBrZXlGaW5nZXJwcmludDogc3NoS2V5LmtleUZpbmdlcnByaW50LFxuICAgIHByaXZhdGVLZXk6IGhpZGVJZkRlZmluZWQoc3NoS2V5LnByaXZhdGVLZXkpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBoaWRlSWZEZWZpbmVkPFQ+KHZhbHVlOiBUKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiB2YWx1ZTtcbiAgcmV0dXJuIFNFTlNJVElWRV9WQUxVRV9QTEFDRUhPTERFUjtcbn1cbiIsICJpbXBvcnQgeyBnZXRQcmVmZXJlbmNlVmFsdWVzIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgY3JlYXRlQ2lwaGVyaXYsIGNyZWF0ZURlY2lwaGVyaXYsIGNyZWF0ZUhhc2gsIHJhbmRvbUJ5dGVzIH0gZnJvbSBcImNyeXB0b1wiO1xuaW1wb3J0IHsgdXNlTWVtbyB9IGZyb20gXCJyZWFjdFwiO1xuXG5jb25zdCBBTEdPUklUSE0gPSBcImFlcy0yNTYtY2JjXCI7XG5cbmV4cG9ydCB0eXBlIEVuY3J5cHRlZENvbnRlbnQgPSB7IGl2OiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZyB9O1xuXG4vKiogRW5jcnlwdHMgYW5kIGRlY3J5cHRzIGRhdGEgdXNpbmcgdGhlIHVzZXIncyBjbGllbnQgc2VjcmV0ICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQ29udGVudEVuY3J5cHRvcigpIHtcbiAgY29uc3QgeyBjbGllbnRTZWNyZXQgfSA9IGdldFByZWZlcmVuY2VWYWx1ZXM8UHJlZmVyZW5jZXM+KCk7XG4gIGNvbnN0IGNpcGhlcktleUJ1ZmZlciA9IHVzZU1lbW8oKCkgPT4gZ2V0MzJCaXRTZWNyZXRLZXlCdWZmZXIoY2xpZW50U2VjcmV0LnRyaW0oKSksIFtjbGllbnRTZWNyZXRdKTtcblxuICBjb25zdCBlbmNyeXB0ID0gKGRhdGE6IHN0cmluZyk6IEVuY3J5cHRlZENvbnRlbnQgPT4ge1xuICAgIGNvbnN0IGl2QnVmZmVyID0gcmFuZG9tQnl0ZXMoMTYpO1xuICAgIGNvbnN0IGNpcGhlciA9IGNyZWF0ZUNpcGhlcml2KEFMR09SSVRITSwgY2lwaGVyS2V5QnVmZmVyLCBpdkJ1ZmZlcik7XG4gICAgY29uc3QgZW5jcnlwdGVkQ29udGVudEJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW2NpcGhlci51cGRhdGUoZGF0YSksIGNpcGhlci5maW5hbCgpXSk7XG4gICAgcmV0dXJuIHsgaXY6IGl2QnVmZmVyLnRvU3RyaW5nKFwiaGV4XCIpLCBjb250ZW50OiBlbmNyeXB0ZWRDb250ZW50QnVmZmVyLnRvU3RyaW5nKFwiaGV4XCIpIH07XG4gIH07XG5cbiAgY29uc3QgZGVjcnlwdCA9IChjb250ZW50OiBzdHJpbmcsIGl2OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IGRlY2lwaGVyID0gY3JlYXRlRGVjaXBoZXJpdihBTEdPUklUSE0sIGNpcGhlcktleUJ1ZmZlciwgQnVmZmVyLmZyb20oaXYsIFwiaGV4XCIpKTtcbiAgICBjb25zdCBkZWNyeXB0ZWRDb250ZW50QnVmZmVyID0gQnVmZmVyLmNvbmNhdChbZGVjaXBoZXIudXBkYXRlKEJ1ZmZlci5mcm9tKGNvbnRlbnQsIFwiaGV4XCIpKSwgZGVjaXBoZXIuZmluYWwoKV0pO1xuICAgIHJldHVybiBkZWNyeXB0ZWRDb250ZW50QnVmZmVyLnRvU3RyaW5nKCk7XG4gIH07XG5cbiAgcmV0dXJuIHsgZW5jcnlwdCwgZGVjcnlwdCB9O1xufVxuXG5mdW5jdGlvbiBnZXQzMkJpdFNlY3JldEtleUJ1ZmZlcihrZXk6IHN0cmluZykge1xuICByZXR1cm4gQnVmZmVyLmZyb20oY3JlYXRlSGFzaChcInNoYTI1NlwiKS51cGRhdGUoa2V5KS5kaWdlc3QoXCJiYXNlNjRcIikuc2xpY2UoMCwgMzIpKTtcbn1cbiIsICJpbXBvcnQgeyBlbnZpcm9ubWVudCwgc2hvd1RvYXN0LCBUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IENvbXBvbmVudCwgRXJyb3JJbmZvLCBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBUcm91Ymxlc2hvb3RpbmdHdWlkZSBmcm9tIFwifi9jb21wb25lbnRzL1Ryb3VibGVzaG9vdGluZ0d1aWRlXCI7XG5pbXBvcnQgeyBNYW51YWxseVRocm93bkVycm9yIH0gZnJvbSBcIn4vdXRpbHMvZXJyb3JzXCI7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgaGFzRXJyb3I6IGJvb2xlYW47XG4gIGVycm9yPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vdEVycm9yQm91bmRhcnkgZXh0ZW5kcyBDb21wb25lbnQ8UHJvcHMsIFN0YXRlPiB7XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0geyBoYXNFcnJvcjogZmFsc2UgfTtcbiAgfVxuXG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IoKSB7XG4gICAgcmV0dXJuIHsgaGFzRXJyb3I6IHRydWUgfTtcbiAgfVxuXG4gIGFzeW5jIGNvbXBvbmVudERpZENhdGNoKGVycm9yOiBFcnJvciwgZXJyb3JJbmZvOiBFcnJvckluZm8pIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBNYW51YWxseVRocm93bkVycm9yKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKChzdGF0ZSkgPT4gKHsgLi4uc3RhdGUsIGhhc0Vycm9yOiB0cnVlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KSk7XG4gICAgICBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuRmFpbHVyZSwgZXJyb3IubWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChlbnZpcm9ubWVudC5pc0RldmVsb3BtZW50KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoKHN0YXRlKSA9PiAoeyAuLi5zdGF0ZSwgaGFzRXJyb3I6IHRydWUsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvcjpcIiwgZXJyb3IsIGVycm9ySW5mbyk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5oYXNFcnJvcikgcmV0dXJuIDxUcm91Ymxlc2hvb3RpbmdHdWlkZSBlcnJvcj17dGhpcy5zdGF0ZS5lcnJvcn0gLz47XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiA8VHJvdWJsZXNob290aW5nR3VpZGUgLz47XG4gICAgfVxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBLGtDQUFBQSxVQUFBQyxTQUFBO0FBQUEsSUFBQUEsUUFBTyxVQUFVO0FBQ2pCLFVBQU0sT0FBTztBQUViLFFBQUksS0FBSyxRQUFRLElBQUk7QUFFckIsYUFBUyxhQUFjQyxPQUFNLFNBQVM7QUFDcEMsVUFBSSxVQUFVLFFBQVEsWUFBWSxTQUNoQyxRQUFRLFVBQVUsUUFBUSxJQUFJO0FBRWhDLFVBQUksQ0FBQyxTQUFTO0FBQ1osZUFBTztBQUFBLE1BQ1Q7QUFFQSxnQkFBVSxRQUFRLE1BQU0sR0FBRztBQUMzQixVQUFJLFFBQVEsUUFBUSxFQUFFLE1BQU0sSUFBSTtBQUM5QixlQUFPO0FBQUEsTUFDVDtBQUNBLGVBQVMsSUFBSSxHQUFHLElBQUksUUFBUSxRQUFRLEtBQUs7QUFDdkMsWUFBSSxJQUFJLFFBQVEsQ0FBQyxFQUFFLFlBQVk7QUFDL0IsWUFBSSxLQUFLQSxNQUFLLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxZQUFZLE1BQU0sR0FBRztBQUNuRCxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFFQSxhQUFTLFVBQVcsTUFBTUEsT0FBTSxTQUFTO0FBQ3ZDLFVBQUksQ0FBQyxLQUFLLGVBQWUsS0FBSyxDQUFDLEtBQUssT0FBTyxHQUFHO0FBQzVDLGVBQU87QUFBQSxNQUNUO0FBQ0EsYUFBTyxhQUFhQSxPQUFNLE9BQU87QUFBQSxJQUNuQztBQUVBLGFBQVMsTUFBT0EsT0FBTSxTQUFTLElBQUk7QUFDakMsU0FBRyxLQUFLQSxPQUFNLFNBQVUsSUFBSSxNQUFNO0FBQ2hDLFdBQUcsSUFBSSxLQUFLLFFBQVEsVUFBVSxNQUFNQSxPQUFNLE9BQU8sQ0FBQztBQUFBLE1BQ3BELENBQUM7QUFBQSxJQUNIO0FBRUEsYUFBUyxLQUFNQSxPQUFNLFNBQVM7QUFDNUIsYUFBTyxVQUFVLEdBQUcsU0FBU0EsS0FBSSxHQUFHQSxPQUFNLE9BQU87QUFBQSxJQUNuRDtBQUFBO0FBQUE7OztBQ3pDQTtBQUFBLCtCQUFBQyxVQUFBQyxTQUFBO0FBQUEsSUFBQUEsUUFBTyxVQUFVO0FBQ2pCLFVBQU0sT0FBTztBQUViLFFBQUksS0FBSyxRQUFRLElBQUk7QUFFckIsYUFBUyxNQUFPQyxPQUFNLFNBQVMsSUFBSTtBQUNqQyxTQUFHLEtBQUtBLE9BQU0sU0FBVSxJQUFJLE1BQU07QUFDaEMsV0FBRyxJQUFJLEtBQUssUUFBUSxVQUFVLE1BQU0sT0FBTyxDQUFDO0FBQUEsTUFDOUMsQ0FBQztBQUFBLElBQ0g7QUFFQSxhQUFTLEtBQU1BLE9BQU0sU0FBUztBQUM1QixhQUFPLFVBQVUsR0FBRyxTQUFTQSxLQUFJLEdBQUcsT0FBTztBQUFBLElBQzdDO0FBRUEsYUFBUyxVQUFXLE1BQU0sU0FBUztBQUNqQyxhQUFPLEtBQUssT0FBTyxLQUFLLFVBQVUsTUFBTSxPQUFPO0FBQUEsSUFDakQ7QUFFQSxhQUFTLFVBQVcsTUFBTSxTQUFTO0FBQ2pDLFVBQUksTUFBTSxLQUFLO0FBQ2YsVUFBSSxNQUFNLEtBQUs7QUFDZixVQUFJLE1BQU0sS0FBSztBQUVmLFVBQUksUUFBUSxRQUFRLFFBQVEsU0FDMUIsUUFBUSxNQUFNLFFBQVEsVUFBVSxRQUFRLE9BQU87QUFDakQsVUFBSSxRQUFRLFFBQVEsUUFBUSxTQUMxQixRQUFRLE1BQU0sUUFBUSxVQUFVLFFBQVEsT0FBTztBQUVqRCxVQUFJLElBQUksU0FBUyxPQUFPLENBQUM7QUFDekIsVUFBSSxJQUFJLFNBQVMsT0FBTyxDQUFDO0FBQ3pCLFVBQUksSUFBSSxTQUFTLE9BQU8sQ0FBQztBQUN6QixVQUFJLEtBQUssSUFBSTtBQUViLFVBQUksTUFBTyxNQUFNLEtBQ2QsTUFBTSxLQUFNLFFBQVEsU0FDcEIsTUFBTSxLQUFNLFFBQVEsU0FDcEIsTUFBTSxNQUFPLFVBQVU7QUFFMUIsYUFBTztBQUFBLElBQ1Q7QUFBQTtBQUFBOzs7QUN4Q0E7QUFBQSxnQ0FBQUMsVUFBQUMsU0FBQTtBQUFBLFFBQUksS0FBSyxRQUFRLElBQUk7QUFDckIsUUFBSTtBQUNKLFFBQUksUUFBUSxhQUFhLFdBQVcsT0FBTyxpQkFBaUI7QUFDMUQsYUFBTztBQUFBLElBQ1QsT0FBTztBQUNMLGFBQU87QUFBQSxJQUNUO0FBRUEsSUFBQUEsUUFBTyxVQUFVO0FBQ2pCLFVBQU0sT0FBTztBQUViLGFBQVMsTUFBT0MsT0FBTSxTQUFTLElBQUk7QUFDakMsVUFBSSxPQUFPLFlBQVksWUFBWTtBQUNqQyxhQUFLO0FBQ0wsa0JBQVUsQ0FBQztBQUFBLE1BQ2I7QUFFQSxVQUFJLENBQUMsSUFBSTtBQUNQLFlBQUksT0FBTyxZQUFZLFlBQVk7QUFDakMsZ0JBQU0sSUFBSSxVQUFVLHVCQUF1QjtBQUFBLFFBQzdDO0FBRUEsZUFBTyxJQUFJLFFBQVEsU0FBVSxTQUFTLFFBQVE7QUFDNUMsZ0JBQU1BLE9BQU0sV0FBVyxDQUFDLEdBQUcsU0FBVSxJQUFJLElBQUk7QUFDM0MsZ0JBQUksSUFBSTtBQUNOLHFCQUFPLEVBQUU7QUFBQSxZQUNYLE9BQU87QUFDTCxzQkFBUSxFQUFFO0FBQUEsWUFDWjtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0gsQ0FBQztBQUFBLE1BQ0g7QUFFQSxXQUFLQSxPQUFNLFdBQVcsQ0FBQyxHQUFHLFNBQVUsSUFBSSxJQUFJO0FBRTFDLFlBQUksSUFBSTtBQUNOLGNBQUksR0FBRyxTQUFTLFlBQVksV0FBVyxRQUFRLGNBQWM7QUFDM0QsaUJBQUs7QUFDTCxpQkFBSztBQUFBLFVBQ1A7QUFBQSxRQUNGO0FBQ0EsV0FBRyxJQUFJLEVBQUU7QUFBQSxNQUNYLENBQUM7QUFBQSxJQUNIO0FBRUEsYUFBUyxLQUFNQSxPQUFNLFNBQVM7QUFFNUIsVUFBSTtBQUNGLGVBQU8sS0FBSyxLQUFLQSxPQUFNLFdBQVcsQ0FBQyxDQUFDO0FBQUEsTUFDdEMsU0FBUyxJQUFJO0FBQ1gsWUFBSSxXQUFXLFFBQVEsZ0JBQWdCLEdBQUcsU0FBUyxVQUFVO0FBQzNELGlCQUFPO0FBQUEsUUFDVCxPQUFPO0FBQ0wsZ0JBQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBOzs7QUN4REE7QUFBQSxnQ0FBQUMsVUFBQUMsU0FBQTtBQUFBLFFBQU0sWUFBWSxRQUFRLGFBQWEsV0FDbkMsUUFBUSxJQUFJLFdBQVcsWUFDdkIsUUFBUSxJQUFJLFdBQVc7QUFFM0IsUUFBTUMsUUFBTyxRQUFRLE1BQU07QUFDM0IsUUFBTSxRQUFRLFlBQVksTUFBTTtBQUNoQyxRQUFNLFFBQVE7QUFFZCxRQUFNLG1CQUFtQixDQUFDLFFBQ3hCLE9BQU8sT0FBTyxJQUFJLE1BQU0sY0FBYyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRWxFLFFBQU0sY0FBYyxDQUFDLEtBQUssUUFBUTtBQUNoQyxZQUFNLFFBQVEsSUFBSSxTQUFTO0FBSTNCLFlBQU0sVUFBVSxJQUFJLE1BQU0sSUFBSSxLQUFLLGFBQWEsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLEVBQUUsSUFFakU7QUFBQTtBQUFBLFFBRUUsR0FBSSxZQUFZLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQUEsUUFDbkMsSUFBSSxJQUFJLFFBQVEsUUFBUSxJQUFJO0FBQUEsUUFDZSxJQUFJLE1BQU0sS0FBSztBQUFBLE1BQzVEO0FBRUosWUFBTSxhQUFhLFlBQ2YsSUFBSSxXQUFXLFFBQVEsSUFBSSxXQUFXLHdCQUN0QztBQUNKLFlBQU0sVUFBVSxZQUFZLFdBQVcsTUFBTSxLQUFLLElBQUksQ0FBQyxFQUFFO0FBRXpELFVBQUksV0FBVztBQUNiLFlBQUksSUFBSSxRQUFRLEdBQUcsTUFBTSxNQUFNLFFBQVEsQ0FBQyxNQUFNO0FBQzVDLGtCQUFRLFFBQVEsRUFBRTtBQUFBLE1BQ3RCO0FBRUEsYUFBTztBQUFBLFFBQ0w7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsUUFBTSxRQUFRLENBQUMsS0FBSyxLQUFLLE9BQU87QUFDOUIsVUFBSSxPQUFPLFFBQVEsWUFBWTtBQUM3QixhQUFLO0FBQ0wsY0FBTSxDQUFDO0FBQUEsTUFDVDtBQUNBLFVBQUksQ0FBQztBQUNILGNBQU0sQ0FBQztBQUVULFlBQU0sRUFBRSxTQUFTLFNBQVMsV0FBVyxJQUFJLFlBQVksS0FBSyxHQUFHO0FBQzdELFlBQU0sUUFBUSxDQUFDO0FBRWYsWUFBTSxPQUFPLE9BQUssSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ2pELFlBQUksTUFBTSxRQUFRO0FBQ2hCLGlCQUFPLElBQUksT0FBTyxNQUFNLFNBQVMsUUFBUSxLQUFLLElBQzFDLE9BQU8saUJBQWlCLEdBQUcsQ0FBQztBQUVsQyxjQUFNLFFBQVEsUUFBUSxDQUFDO0FBQ3ZCLGNBQU0sV0FBVyxTQUFTLEtBQUssS0FBSyxJQUFJLE1BQU0sTUFBTSxHQUFHLEVBQUUsSUFBSTtBQUU3RCxjQUFNLE9BQU9BLE1BQUssS0FBSyxVQUFVLEdBQUc7QUFDcEMsY0FBTSxJQUFJLENBQUMsWUFBWSxZQUFZLEtBQUssR0FBRyxJQUFJLElBQUksTUFBTSxHQUFHLENBQUMsSUFBSSxPQUM3RDtBQUVKLGdCQUFRLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUFBLE1BQzFCLENBQUM7QUFFRCxZQUFNLFVBQVUsQ0FBQyxHQUFHLEdBQUcsT0FBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDN0QsWUFBSSxPQUFPLFFBQVE7QUFDakIsaUJBQU8sUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQzVCLGNBQU0sTUFBTSxRQUFRLEVBQUU7QUFDdEIsY0FBTSxJQUFJLEtBQUssRUFBRSxTQUFTLFdBQVcsR0FBRyxDQUFDLElBQUksT0FBTztBQUNsRCxjQUFJLENBQUMsTUFBTSxJQUFJO0FBQ2IsZ0JBQUksSUFBSTtBQUNOLG9CQUFNLEtBQUssSUFBSSxHQUFHO0FBQUE7QUFFbEIscUJBQU8sUUFBUSxJQUFJLEdBQUc7QUFBQSxVQUMxQjtBQUNBLGlCQUFPLFFBQVEsUUFBUSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFBQSxRQUN0QyxDQUFDO0FBQUEsTUFDSCxDQUFDO0FBRUQsYUFBTyxLQUFLLEtBQUssQ0FBQyxFQUFFLEtBQUssU0FBTyxHQUFHLE1BQU0sR0FBRyxHQUFHLEVBQUUsSUFBSSxLQUFLLENBQUM7QUFBQSxJQUM3RDtBQUVBLFFBQU0sWUFBWSxDQUFDLEtBQUssUUFBUTtBQUM5QixZQUFNLE9BQU8sQ0FBQztBQUVkLFlBQU0sRUFBRSxTQUFTLFNBQVMsV0FBVyxJQUFJLFlBQVksS0FBSyxHQUFHO0FBQzdELFlBQU0sUUFBUSxDQUFDO0FBRWYsZUFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLFFBQVEsS0FBTTtBQUN4QyxjQUFNLFFBQVEsUUFBUSxDQUFDO0FBQ3ZCLGNBQU0sV0FBVyxTQUFTLEtBQUssS0FBSyxJQUFJLE1BQU0sTUFBTSxHQUFHLEVBQUUsSUFBSTtBQUU3RCxjQUFNLE9BQU9BLE1BQUssS0FBSyxVQUFVLEdBQUc7QUFDcEMsY0FBTSxJQUFJLENBQUMsWUFBWSxZQUFZLEtBQUssR0FBRyxJQUFJLElBQUksTUFBTSxHQUFHLENBQUMsSUFBSSxPQUM3RDtBQUVKLGlCQUFTLElBQUksR0FBRyxJQUFJLFFBQVEsUUFBUSxLQUFNO0FBQ3hDLGdCQUFNLE1BQU0sSUFBSSxRQUFRLENBQUM7QUFDekIsY0FBSTtBQUNGLGtCQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssRUFBRSxTQUFTLFdBQVcsQ0FBQztBQUNsRCxnQkFBSSxJQUFJO0FBQ04sa0JBQUksSUFBSTtBQUNOLHNCQUFNLEtBQUssR0FBRztBQUFBO0FBRWQsdUJBQU87QUFBQSxZQUNYO0FBQUEsVUFDRixTQUFTLElBQUk7QUFBQSxVQUFDO0FBQUEsUUFDaEI7QUFBQSxNQUNGO0FBRUEsVUFBSSxJQUFJLE9BQU8sTUFBTTtBQUNuQixlQUFPO0FBRVQsVUFBSSxJQUFJO0FBQ04sZUFBTztBQUVULFlBQU0saUJBQWlCLEdBQUc7QUFBQSxJQUM1QjtBQUVBLElBQUFELFFBQU8sVUFBVTtBQUNqQixVQUFNLE9BQU87QUFBQTtBQUFBOzs7QUM1SGI7QUFBQSxtQ0FBQUUsVUFBQUMsU0FBQTtBQUFBO0FBRUEsUUFBTUMsV0FBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNO0FBQ2pDLFlBQU1DLGVBQWMsUUFBUSxPQUFPLFFBQVE7QUFDM0MsWUFBTUMsWUFBVyxRQUFRLFlBQVksUUFBUTtBQUU3QyxVQUFJQSxjQUFhLFNBQVM7QUFDekIsZUFBTztBQUFBLE1BQ1I7QUFFQSxhQUFPLE9BQU8sS0FBS0QsWUFBVyxFQUFFLFFBQVEsRUFBRSxLQUFLLFNBQU8sSUFBSSxZQUFZLE1BQU0sTUFBTSxLQUFLO0FBQUEsSUFDeEY7QUFFQSxJQUFBRixRQUFPLFVBQVVDO0FBRWpCLElBQUFELFFBQU8sUUFBUSxVQUFVQztBQUFBO0FBQUE7OztBQ2Z6QjtBQUFBLHdEQUFBRyxVQUFBQyxTQUFBO0FBQUE7QUFFQSxRQUFNQyxRQUFPLFFBQVEsTUFBTTtBQUMzQixRQUFNLFFBQVE7QUFDZCxRQUFNLGFBQWE7QUFFbkIsYUFBUyxzQkFBc0IsUUFBUSxnQkFBZ0I7QUFDbkQsWUFBTSxNQUFNLE9BQU8sUUFBUSxPQUFPLFFBQVE7QUFDMUMsWUFBTSxNQUFNLFFBQVEsSUFBSTtBQUN4QixZQUFNLGVBQWUsT0FBTyxRQUFRLE9BQU87QUFFM0MsWUFBTSxrQkFBa0IsZ0JBQWdCLFFBQVEsVUFBVSxVQUFhLENBQUMsUUFBUSxNQUFNO0FBSXRGLFVBQUksaUJBQWlCO0FBQ2pCLFlBQUk7QUFDQSxrQkFBUSxNQUFNLE9BQU8sUUFBUSxHQUFHO0FBQUEsUUFDcEMsU0FBUyxLQUFLO0FBQUEsUUFFZDtBQUFBLE1BQ0o7QUFFQSxVQUFJO0FBRUosVUFBSTtBQUNBLG1CQUFXLE1BQU0sS0FBSyxPQUFPLFNBQVM7QUFBQSxVQUNsQyxNQUFNLElBQUksV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQUEsVUFDN0IsU0FBUyxpQkFBaUJBLE1BQUssWUFBWTtBQUFBLFFBQy9DLENBQUM7QUFBQSxNQUNMLFNBQVMsR0FBRztBQUFBLE1BRVosVUFBRTtBQUNFLFlBQUksaUJBQWlCO0FBQ2pCLGtCQUFRLE1BQU0sR0FBRztBQUFBLFFBQ3JCO0FBQUEsTUFDSjtBQUlBLFVBQUksVUFBVTtBQUNWLG1CQUFXQSxNQUFLLFFBQVEsZUFBZSxPQUFPLFFBQVEsTUFBTSxJQUFJLFFBQVE7QUFBQSxNQUM1RTtBQUVBLGFBQU87QUFBQSxJQUNYO0FBRUEsYUFBUyxlQUFlLFFBQVE7QUFDNUIsYUFBTyxzQkFBc0IsTUFBTSxLQUFLLHNCQUFzQixRQUFRLElBQUk7QUFBQSxJQUM5RTtBQUVBLElBQUFELFFBQU8sVUFBVTtBQUFBO0FBQUE7OztBQ25EakI7QUFBQSxnREFBQUUsVUFBQUMsU0FBQTtBQUFBO0FBR0EsUUFBTSxrQkFBa0I7QUFFeEIsYUFBUyxjQUFjLEtBQUs7QUFFeEIsWUFBTSxJQUFJLFFBQVEsaUJBQWlCLEtBQUs7QUFFeEMsYUFBTztBQUFBLElBQ1g7QUFFQSxhQUFTLGVBQWUsS0FBSyx1QkFBdUI7QUFFaEQsWUFBTSxHQUFHLEdBQUc7QUFRWixZQUFNLElBQUksUUFBUSxtQkFBbUIsU0FBUztBQUs5QyxZQUFNLElBQUksUUFBUSxrQkFBa0IsTUFBTTtBQUsxQyxZQUFNLElBQUksR0FBRztBQUdiLFlBQU0sSUFBSSxRQUFRLGlCQUFpQixLQUFLO0FBR3hDLFVBQUksdUJBQXVCO0FBQ3ZCLGNBQU0sSUFBSSxRQUFRLGlCQUFpQixLQUFLO0FBQUEsTUFDNUM7QUFFQSxhQUFPO0FBQUEsSUFDWDtBQUVBLElBQUFBLFFBQU8sUUFBUSxVQUFVO0FBQ3pCLElBQUFBLFFBQU8sUUFBUSxXQUFXO0FBQUE7QUFBQTs7O0FDOUMxQjtBQUFBLHdDQUFBQyxVQUFBQyxTQUFBO0FBQUE7QUFDQSxJQUFBQSxRQUFPLFVBQVU7QUFBQTtBQUFBOzs7QUNEakI7QUFBQSwwQ0FBQUMsVUFBQUMsU0FBQTtBQUFBO0FBQ0EsUUFBTSxlQUFlO0FBRXJCLElBQUFBLFFBQU8sVUFBVSxDQUFDLFNBQVMsT0FBTztBQUNqQyxZQUFNLFFBQVEsT0FBTyxNQUFNLFlBQVk7QUFFdkMsVUFBSSxDQUFDLE9BQU87QUFDWCxlQUFPO0FBQUEsTUFDUjtBQUVBLFlBQU0sQ0FBQ0MsT0FBTSxRQUFRLElBQUksTUFBTSxDQUFDLEVBQUUsUUFBUSxRQUFRLEVBQUUsRUFBRSxNQUFNLEdBQUc7QUFDL0QsWUFBTSxTQUFTQSxNQUFLLE1BQU0sR0FBRyxFQUFFLElBQUk7QUFFbkMsVUFBSSxXQUFXLE9BQU87QUFDckIsZUFBTztBQUFBLE1BQ1I7QUFFQSxhQUFPLFdBQVcsR0FBRyxNQUFNLElBQUksUUFBUSxLQUFLO0FBQUEsSUFDN0M7QUFBQTtBQUFBOzs7QUNsQkE7QUFBQSxxREFBQUMsVUFBQUMsU0FBQTtBQUFBO0FBRUEsUUFBTSxLQUFLLFFBQVEsSUFBSTtBQUN2QixRQUFNLGlCQUFpQjtBQUV2QixhQUFTLFlBQVksU0FBUztBQUUxQixZQUFNLE9BQU87QUFDYixZQUFNLFNBQVMsT0FBTyxNQUFNLElBQUk7QUFFaEMsVUFBSTtBQUVKLFVBQUk7QUFDQSxhQUFLLEdBQUcsU0FBUyxTQUFTLEdBQUc7QUFDN0IsV0FBRyxTQUFTLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQztBQUNsQyxXQUFHLFVBQVUsRUFBRTtBQUFBLE1BQ25CLFNBQVMsR0FBRztBQUFBLE1BQWM7QUFHMUIsYUFBTyxlQUFlLE9BQU8sU0FBUyxDQUFDO0FBQUEsSUFDM0M7QUFFQSxJQUFBQSxRQUFPLFVBQVU7QUFBQTtBQUFBOzs7QUN0QmpCO0FBQUEsMENBQUFDLFVBQUFDLFNBQUE7QUFBQTtBQUVBLFFBQU1DLFFBQU8sUUFBUSxNQUFNO0FBQzNCLFFBQU0saUJBQWlCO0FBQ3ZCLFFBQU0sU0FBUztBQUNmLFFBQU0sY0FBYztBQUVwQixRQUFNLFFBQVEsUUFBUSxhQUFhO0FBQ25DLFFBQU0scUJBQXFCO0FBQzNCLFFBQU0sa0JBQWtCO0FBRXhCLGFBQVMsY0FBYyxRQUFRO0FBQzNCLGFBQU8sT0FBTyxlQUFlLE1BQU07QUFFbkMsWUFBTSxVQUFVLE9BQU8sUUFBUSxZQUFZLE9BQU8sSUFBSTtBQUV0RCxVQUFJLFNBQVM7QUFDVCxlQUFPLEtBQUssUUFBUSxPQUFPLElBQUk7QUFDL0IsZUFBTyxVQUFVO0FBRWpCLGVBQU8sZUFBZSxNQUFNO0FBQUEsTUFDaEM7QUFFQSxhQUFPLE9BQU87QUFBQSxJQUNsQjtBQUVBLGFBQVMsY0FBYyxRQUFRO0FBQzNCLFVBQUksQ0FBQyxPQUFPO0FBQ1IsZUFBTztBQUFBLE1BQ1g7QUFHQSxZQUFNLGNBQWMsY0FBYyxNQUFNO0FBR3hDLFlBQU0sYUFBYSxDQUFDLG1CQUFtQixLQUFLLFdBQVc7QUFJdkQsVUFBSSxPQUFPLFFBQVEsY0FBYyxZQUFZO0FBS3pDLGNBQU0sNkJBQTZCLGdCQUFnQixLQUFLLFdBQVc7QUFJbkUsZUFBTyxVQUFVQSxNQUFLLFVBQVUsT0FBTyxPQUFPO0FBRzlDLGVBQU8sVUFBVSxPQUFPLFFBQVEsT0FBTyxPQUFPO0FBQzlDLGVBQU8sT0FBTyxPQUFPLEtBQUssSUFBSSxDQUFDLFFBQVEsT0FBTyxTQUFTLEtBQUssMEJBQTBCLENBQUM7QUFFdkYsY0FBTSxlQUFlLENBQUMsT0FBTyxPQUFPLEVBQUUsT0FBTyxPQUFPLElBQUksRUFBRSxLQUFLLEdBQUc7QUFFbEUsZUFBTyxPQUFPLENBQUMsTUFBTSxNQUFNLE1BQU0sSUFBSSxZQUFZLEdBQUc7QUFDcEQsZUFBTyxVQUFVLFFBQVEsSUFBSSxXQUFXO0FBQ3hDLGVBQU8sUUFBUSwyQkFBMkI7QUFBQSxNQUM5QztBQUVBLGFBQU87QUFBQSxJQUNYO0FBRUEsYUFBUyxNQUFNLFNBQVMsTUFBTSxTQUFTO0FBRW5DLFVBQUksUUFBUSxDQUFDLE1BQU0sUUFBUSxJQUFJLEdBQUc7QUFDOUIsa0JBQVU7QUFDVixlQUFPO0FBQUEsTUFDWDtBQUVBLGFBQU8sT0FBTyxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDL0IsZ0JBQVUsT0FBTyxPQUFPLENBQUMsR0FBRyxPQUFPO0FBR25DLFlBQU0sU0FBUztBQUFBLFFBQ1g7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0EsTUFBTTtBQUFBLFFBQ04sVUFBVTtBQUFBLFVBQ047QUFBQSxVQUNBO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFHQSxhQUFPLFFBQVEsUUFBUSxTQUFTLGNBQWMsTUFBTTtBQUFBLElBQ3hEO0FBRUEsSUFBQUQsUUFBTyxVQUFVO0FBQUE7QUFBQTs7O0FDMUZqQjtBQUFBLDJDQUFBRSxVQUFBQyxTQUFBO0FBQUE7QUFFQSxRQUFNLFFBQVEsUUFBUSxhQUFhO0FBRW5DLGFBQVMsY0FBYyxVQUFVLFNBQVM7QUFDdEMsYUFBTyxPQUFPLE9BQU8sSUFBSSxNQUFNLEdBQUcsT0FBTyxJQUFJLFNBQVMsT0FBTyxTQUFTLEdBQUc7QUFBQSxRQUNyRSxNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsUUFDUCxTQUFTLEdBQUcsT0FBTyxJQUFJLFNBQVMsT0FBTztBQUFBLFFBQ3ZDLE1BQU0sU0FBUztBQUFBLFFBQ2YsV0FBVyxTQUFTO0FBQUEsTUFDeEIsQ0FBQztBQUFBLElBQ0w7QUFFQSxhQUFTLGlCQUFpQixJQUFJLFFBQVE7QUFDbEMsVUFBSSxDQUFDLE9BQU87QUFDUjtBQUFBLE1BQ0o7QUFFQSxZQUFNLGVBQWUsR0FBRztBQUV4QixTQUFHLE9BQU8sU0FBVSxNQUFNLE1BQU07QUFJNUIsWUFBSSxTQUFTLFFBQVE7QUFDakIsZ0JBQU0sTUFBTSxhQUFhLE1BQU0sTUFBTTtBQUVyQyxjQUFJLEtBQUs7QUFDTCxtQkFBTyxhQUFhLEtBQUssSUFBSSxTQUFTLEdBQUc7QUFBQSxVQUM3QztBQUFBLFFBQ0o7QUFFQSxlQUFPLGFBQWEsTUFBTSxJQUFJLFNBQVM7QUFBQSxNQUMzQztBQUFBLElBQ0o7QUFFQSxhQUFTLGFBQWEsUUFBUSxRQUFRO0FBQ2xDLFVBQUksU0FBUyxXQUFXLEtBQUssQ0FBQyxPQUFPLE1BQU07QUFDdkMsZUFBTyxjQUFjLE9BQU8sVUFBVSxPQUFPO0FBQUEsTUFDakQ7QUFFQSxhQUFPO0FBQUEsSUFDWDtBQUVBLGFBQVMsaUJBQWlCLFFBQVEsUUFBUTtBQUN0QyxVQUFJLFNBQVMsV0FBVyxLQUFLLENBQUMsT0FBTyxNQUFNO0FBQ3ZDLGVBQU8sY0FBYyxPQUFPLFVBQVUsV0FBVztBQUFBLE1BQ3JEO0FBRUEsYUFBTztBQUFBLElBQ1g7QUFFQSxJQUFBQSxRQUFPLFVBQVU7QUFBQSxNQUNiO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBO0FBQUE7OztBQzFEQTtBQUFBLHNDQUFBQyxVQUFBQyxTQUFBO0FBQUE7QUFFQSxRQUFNLEtBQUssUUFBUSxlQUFlO0FBQ2xDLFFBQU0sUUFBUTtBQUNkLFFBQU0sU0FBUztBQUVmLGFBQVMsTUFBTSxTQUFTLE1BQU0sU0FBUztBQUVuQyxZQUFNLFNBQVMsTUFBTSxTQUFTLE1BQU0sT0FBTztBQUczQyxZQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sU0FBUyxPQUFPLE1BQU0sT0FBTyxPQUFPO0FBSXBFLGFBQU8saUJBQWlCLFNBQVMsTUFBTTtBQUV2QyxhQUFPO0FBQUEsSUFDWDtBQUVBLGFBQVMsVUFBVSxTQUFTLE1BQU0sU0FBUztBQUV2QyxZQUFNLFNBQVMsTUFBTSxTQUFTLE1BQU0sT0FBTztBQUczQyxZQUFNLFNBQVMsR0FBRyxVQUFVLE9BQU8sU0FBUyxPQUFPLE1BQU0sT0FBTyxPQUFPO0FBR3ZFLGFBQU8sUUFBUSxPQUFPLFNBQVMsT0FBTyxpQkFBaUIsT0FBTyxRQUFRLE1BQU07QUFFNUUsYUFBTztBQUFBLElBQ1g7QUFFQSxJQUFBQSxRQUFPLFVBQVU7QUFDakIsSUFBQUEsUUFBTyxRQUFRLFFBQVE7QUFDdkIsSUFBQUEsUUFBTyxRQUFRLE9BQU87QUFFdEIsSUFBQUEsUUFBTyxRQUFRLFNBQVM7QUFDeEIsSUFBQUEsUUFBTyxRQUFRLFVBQVU7QUFBQTtBQUFBOzs7QUN0Q3pCO0FBQUEsd0NBQUFDLFVBQUFDLFNBQUE7QUFvQkEsSUFBQUEsUUFBTyxVQUFVO0FBQUEsTUFDZjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBRUEsUUFBSSxRQUFRLGFBQWEsU0FBUztBQUNoQyxNQUFBQSxRQUFPLFFBQVE7QUFBQSxRQUNiO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSUY7QUFBQSxJQUNGO0FBRUEsUUFBSSxRQUFRLGFBQWEsU0FBUztBQUNoQyxNQUFBQSxRQUFPLFFBQVE7QUFBQSxRQUNiO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUE7QUFBQTs7O0FDcERBO0FBQUEsc0NBQUFDLFVBQUFDLFNBQUE7QUFJQSxRQUFJQyxXQUFVLE9BQU87QUFFckIsUUFBTSxZQUFZLFNBQVVBLFVBQVM7QUFDbkMsYUFBT0EsWUFDTCxPQUFPQSxhQUFZLFlBQ25CLE9BQU9BLFNBQVEsbUJBQW1CLGNBQ2xDLE9BQU9BLFNBQVEsU0FBUyxjQUN4QixPQUFPQSxTQUFRLGVBQWUsY0FDOUIsT0FBT0EsU0FBUSxjQUFjLGNBQzdCLE9BQU9BLFNBQVEsU0FBUyxjQUN4QixPQUFPQSxTQUFRLFFBQVEsWUFDdkIsT0FBT0EsU0FBUSxPQUFPO0FBQUEsSUFDMUI7QUFJQSxRQUFJLENBQUMsVUFBVUEsUUFBTyxHQUFHO0FBQ3ZCLE1BQUFELFFBQU8sVUFBVSxXQUFZO0FBQzNCLGVBQU8sV0FBWTtBQUFBLFFBQUM7QUFBQSxNQUN0QjtBQUFBLElBQ0YsT0FBTztBQUNELGVBQVMsUUFBUSxRQUFRO0FBQ3pCLGdCQUFVO0FBQ1YsY0FBUSxRQUFRLEtBQUtDLFNBQVEsUUFBUTtBQUVyQyxXQUFLLFFBQVEsUUFBUTtBQUV6QixVQUFJLE9BQU8sT0FBTyxZQUFZO0FBQzVCLGFBQUssR0FBRztBQUFBLE1BQ1Y7QUFHQSxVQUFJQSxTQUFRLHlCQUF5QjtBQUNuQyxrQkFBVUEsU0FBUTtBQUFBLE1BQ3BCLE9BQU87QUFDTCxrQkFBVUEsU0FBUSwwQkFBMEIsSUFBSSxHQUFHO0FBQ25ELGdCQUFRLFFBQVE7QUFDaEIsZ0JBQVEsVUFBVSxDQUFDO0FBQUEsTUFDckI7QUFNQSxVQUFJLENBQUMsUUFBUSxVQUFVO0FBQ3JCLGdCQUFRLGdCQUFnQixRQUFRO0FBQ2hDLGdCQUFRLFdBQVc7QUFBQSxNQUNyQjtBQUVBLE1BQUFELFFBQU8sVUFBVSxTQUFVLElBQUksTUFBTTtBQUVuQyxZQUFJLENBQUMsVUFBVSxPQUFPLE9BQU8sR0FBRztBQUM5QixpQkFBTyxXQUFZO0FBQUEsVUFBQztBQUFBLFFBQ3RCO0FBQ0EsZUFBTyxNQUFNLE9BQU8sSUFBSSxZQUFZLDhDQUE4QztBQUVsRixZQUFJLFdBQVcsT0FBTztBQUNwQixlQUFLO0FBQUEsUUFDUDtBQUVBLFlBQUksS0FBSztBQUNULFlBQUksUUFBUSxLQUFLLFlBQVk7QUFDM0IsZUFBSztBQUFBLFFBQ1A7QUFFQSxZQUFJLFNBQVMsV0FBWTtBQUN2QixrQkFBUSxlQUFlLElBQUksRUFBRTtBQUM3QixjQUFJLFFBQVEsVUFBVSxNQUFNLEVBQUUsV0FBVyxLQUNyQyxRQUFRLFVBQVUsV0FBVyxFQUFFLFdBQVcsR0FBRztBQUMvQyxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQ0EsZ0JBQVEsR0FBRyxJQUFJLEVBQUU7QUFFakIsZUFBTztBQUFBLE1BQ1Q7QUFFSSxlQUFTLFNBQVNFLFVBQVU7QUFDOUIsWUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLE9BQU8sT0FBTyxHQUFHO0FBQ3pDO0FBQUEsUUFDRjtBQUNBLGlCQUFTO0FBRVQsZ0JBQVEsUUFBUSxTQUFVLEtBQUs7QUFDN0IsY0FBSTtBQUNGLFlBQUFELFNBQVEsZUFBZSxLQUFLLGFBQWEsR0FBRyxDQUFDO0FBQUEsVUFDL0MsU0FBUyxJQUFJO0FBQUEsVUFBQztBQUFBLFFBQ2hCLENBQUM7QUFDRCxRQUFBQSxTQUFRLE9BQU87QUFDZixRQUFBQSxTQUFRLGFBQWE7QUFDckIsZ0JBQVEsU0FBUztBQUFBLE1BQ25CO0FBQ0EsTUFBQUQsUUFBTyxRQUFRLFNBQVM7QUFFcEIsYUFBTyxTQUFTRyxNQUFNLE9BQU8sTUFBTSxRQUFRO0FBRTdDLFlBQUksUUFBUSxRQUFRLEtBQUssR0FBRztBQUMxQjtBQUFBLFFBQ0Y7QUFDQSxnQkFBUSxRQUFRLEtBQUssSUFBSTtBQUN6QixnQkFBUSxLQUFLLE9BQU8sTUFBTSxNQUFNO0FBQUEsTUFDbEM7QUFHSSxxQkFBZSxDQUFDO0FBQ3BCLGNBQVEsUUFBUSxTQUFVLEtBQUs7QUFDN0IscUJBQWEsR0FBRyxJQUFJLFNBQVMsV0FBWTtBQUV2QyxjQUFJLENBQUMsVUFBVSxPQUFPLE9BQU8sR0FBRztBQUM5QjtBQUFBLFVBQ0Y7QUFLQSxjQUFJLFlBQVlGLFNBQVEsVUFBVSxHQUFHO0FBQ3JDLGNBQUksVUFBVSxXQUFXLFFBQVEsT0FBTztBQUN0QyxtQkFBTztBQUNQLGlCQUFLLFFBQVEsTUFBTSxHQUFHO0FBRXRCLGlCQUFLLGFBQWEsTUFBTSxHQUFHO0FBRTNCLGdCQUFJLFNBQVMsUUFBUSxVQUFVO0FBRzdCLG9CQUFNO0FBQUEsWUFDUjtBQUVBLFlBQUFBLFNBQVEsS0FBS0EsU0FBUSxLQUFLLEdBQUc7QUFBQSxVQUMvQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFFRCxNQUFBRCxRQUFPLFFBQVEsVUFBVSxXQUFZO0FBQ25DLGVBQU87QUFBQSxNQUNUO0FBRUksZUFBUztBQUVULGFBQU8sU0FBU0ksUUFBUTtBQUMxQixZQUFJLFVBQVUsQ0FBQyxVQUFVLE9BQU8sT0FBTyxHQUFHO0FBQ3hDO0FBQUEsUUFDRjtBQUNBLGlCQUFTO0FBTVQsZ0JBQVEsU0FBUztBQUVqQixrQkFBVSxRQUFRLE9BQU8sU0FBVSxLQUFLO0FBQ3RDLGNBQUk7QUFDRixZQUFBSCxTQUFRLEdBQUcsS0FBSyxhQUFhLEdBQUcsQ0FBQztBQUNqQyxtQkFBTztBQUFBLFVBQ1QsU0FBUyxJQUFJO0FBQ1gsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRixDQUFDO0FBRUQsUUFBQUEsU0FBUSxPQUFPO0FBQ2YsUUFBQUEsU0FBUSxhQUFhO0FBQUEsTUFDdkI7QUFDQSxNQUFBRCxRQUFPLFFBQVEsT0FBTztBQUVsQixrQ0FBNEJDLFNBQVE7QUFDcEMsMEJBQW9CLFNBQVNJLG1CQUFtQixNQUFNO0FBRXhELFlBQUksQ0FBQyxVQUFVLE9BQU8sT0FBTyxHQUFHO0FBQzlCO0FBQUEsUUFDRjtBQUNBLFFBQUFKLFNBQVEsV0FBVztBQUFBLFFBQW1DO0FBQ3RELGFBQUssUUFBUUEsU0FBUSxVQUFVLElBQUk7QUFFbkMsYUFBSyxhQUFhQSxTQUFRLFVBQVUsSUFBSTtBQUV4QyxrQ0FBMEIsS0FBS0EsVUFBU0EsU0FBUSxRQUFRO0FBQUEsTUFDMUQ7QUFFSSw0QkFBc0JBLFNBQVE7QUFDOUIsb0JBQWMsU0FBU0ssYUFBYSxJQUFJLEtBQUs7QUFDL0MsWUFBSSxPQUFPLFVBQVUsVUFBVSxPQUFPLE9BQU8sR0FBRztBQUU5QyxjQUFJLFFBQVEsUUFBVztBQUNyQixZQUFBTCxTQUFRLFdBQVc7QUFBQSxVQUNyQjtBQUNBLGNBQUksTUFBTSxvQkFBb0IsTUFBTSxNQUFNLFNBQVM7QUFFbkQsZUFBSyxRQUFRQSxTQUFRLFVBQVUsSUFBSTtBQUVuQyxlQUFLLGFBQWFBLFNBQVEsVUFBVSxJQUFJO0FBRXhDLGlCQUFPO0FBQUEsUUFDVCxPQUFPO0FBQ0wsaUJBQU8sb0JBQW9CLE1BQU0sTUFBTSxTQUFTO0FBQUEsUUFDbEQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQWhMTTtBQUNBO0FBQ0E7QUFFQTtBQU1BO0FBOENBO0FBaUJBO0FBVUE7QUFpQ0E7QUFFQTtBQTBCQTtBQUNBO0FBYUE7QUFDQTtBQUFBO0FBQUE7OztBQ3hMTjtBQUFBLDZDQUFBTSxVQUFBQyxTQUFBO0FBQUE7QUFDQSxRQUFNLEVBQUMsYUFBYSxrQkFBaUIsSUFBSSxRQUFRLFFBQVE7QUFFekQsSUFBQUEsUUFBTyxVQUFVLGFBQVc7QUFDM0IsZ0JBQVUsRUFBQyxHQUFHLFFBQU87QUFFckIsWUFBTSxFQUFDLE1BQUssSUFBSTtBQUNoQixVQUFJLEVBQUMsU0FBUSxJQUFJO0FBQ2pCLFlBQU0sV0FBVyxhQUFhO0FBQzlCLFVBQUksYUFBYTtBQUVqQixVQUFJLE9BQU87QUFDVixxQkFBYSxFQUFFLFlBQVk7QUFBQSxNQUM1QixPQUFPO0FBQ04sbUJBQVcsWUFBWTtBQUFBLE1BQ3hCO0FBRUEsVUFBSSxVQUFVO0FBQ2IsbUJBQVc7QUFBQSxNQUNaO0FBRUEsWUFBTSxTQUFTLElBQUksa0JBQWtCLEVBQUMsV0FBVSxDQUFDO0FBRWpELFVBQUksVUFBVTtBQUNiLGVBQU8sWUFBWSxRQUFRO0FBQUEsTUFDNUI7QUFFQSxVQUFJLFNBQVM7QUFDYixZQUFNLFNBQVMsQ0FBQztBQUVoQixhQUFPLEdBQUcsUUFBUSxXQUFTO0FBQzFCLGVBQU8sS0FBSyxLQUFLO0FBRWpCLFlBQUksWUFBWTtBQUNmLG1CQUFTLE9BQU87QUFBQSxRQUNqQixPQUFPO0FBQ04sb0JBQVUsTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDRCxDQUFDO0FBRUQsYUFBTyxtQkFBbUIsTUFBTTtBQUMvQixZQUFJLE9BQU87QUFDVixpQkFBTztBQUFBLFFBQ1I7QUFFQSxlQUFPLFdBQVcsT0FBTyxPQUFPLFFBQVEsTUFBTSxJQUFJLE9BQU8sS0FBSyxFQUFFO0FBQUEsTUFDakU7QUFFQSxhQUFPLG9CQUFvQixNQUFNO0FBRWpDLGFBQU87QUFBQSxJQUNSO0FBQUE7QUFBQTs7O0FDbkRBO0FBQUEscUNBQUFDLFVBQUFDLFNBQUE7QUFBQTtBQUNBLFFBQU0sRUFBQyxXQUFXLGdCQUFlLElBQUksUUFBUSxRQUFRO0FBQ3JELFFBQU0sU0FBUyxRQUFRLFFBQVE7QUFDL0IsUUFBTSxFQUFDLFdBQUFDLFdBQVMsSUFBSSxRQUFRLE1BQU07QUFDbEMsUUFBTSxlQUFlO0FBRXJCLFFBQU0sNEJBQTRCQSxXQUFVLE9BQU8sUUFBUTtBQUUzRCxRQUFNLGlCQUFOLGNBQTZCLE1BQU07QUFBQSxNQUNsQyxjQUFjO0FBQ2IsY0FBTSxvQkFBb0I7QUFDMUIsYUFBSyxPQUFPO0FBQUEsTUFDYjtBQUFBLElBQ0Q7QUFFQSxtQkFBZUMsV0FBVSxhQUFhLFNBQVM7QUFDOUMsVUFBSSxDQUFDLGFBQWE7QUFDakIsY0FBTSxJQUFJLE1BQU0sbUJBQW1CO0FBQUEsTUFDcEM7QUFFQSxnQkFBVTtBQUFBLFFBQ1QsV0FBVztBQUFBLFFBQ1gsR0FBRztBQUFBLE1BQ0o7QUFFQSxZQUFNLEVBQUMsVUFBUyxJQUFJO0FBQ3BCLFlBQU1DLFVBQVMsYUFBYSxPQUFPO0FBRW5DLFlBQU0sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3RDLGNBQU0sZ0JBQWdCLFdBQVM7QUFFOUIsY0FBSSxTQUFTQSxRQUFPLGtCQUFrQixLQUFLLGdCQUFnQixZQUFZO0FBQ3RFLGtCQUFNLGVBQWVBLFFBQU8saUJBQWlCO0FBQUEsVUFDOUM7QUFFQSxpQkFBTyxLQUFLO0FBQUEsUUFDYjtBQUVBLFNBQUMsWUFBWTtBQUNaLGNBQUk7QUFDSCxrQkFBTSwwQkFBMEIsYUFBYUEsT0FBTTtBQUNuRCxvQkFBUTtBQUFBLFVBQ1QsU0FBUyxPQUFPO0FBQ2YsMEJBQWMsS0FBSztBQUFBLFVBQ3BCO0FBQUEsUUFDRCxHQUFHO0FBRUgsUUFBQUEsUUFBTyxHQUFHLFFBQVEsTUFBTTtBQUN2QixjQUFJQSxRQUFPLGtCQUFrQixJQUFJLFdBQVc7QUFDM0MsMEJBQWMsSUFBSSxlQUFlLENBQUM7QUFBQSxVQUNuQztBQUFBLFFBQ0QsQ0FBQztBQUFBLE1BQ0YsQ0FBQztBQUVELGFBQU9BLFFBQU8saUJBQWlCO0FBQUEsSUFDaEM7QUFFQSxJQUFBSCxRQUFPLFVBQVVFO0FBQ2pCLElBQUFGLFFBQU8sUUFBUSxTQUFTLENBQUNHLFNBQVEsWUFBWUQsV0FBVUMsU0FBUSxFQUFDLEdBQUcsU0FBUyxVQUFVLFNBQVEsQ0FBQztBQUMvRixJQUFBSCxRQUFPLFFBQVEsUUFBUSxDQUFDRyxTQUFRLFlBQVlELFdBQVVDLFNBQVEsRUFBQyxHQUFHLFNBQVMsT0FBTyxLQUFJLENBQUM7QUFDdkYsSUFBQUgsUUFBTyxRQUFRLGlCQUFpQjtBQUFBO0FBQUE7OztBQzVEaEM7QUFBQSx1Q0FBQUksVUFBQUMsU0FBQTtBQUFBO0FBRUEsUUFBTSxFQUFFLFlBQVksSUFBSSxRQUFRLFFBQVE7QUFFeEMsSUFBQUEsUUFBTyxVQUFVLFdBQTBCO0FBQ3pDLFVBQUksVUFBVSxDQUFDO0FBQ2YsVUFBSSxTQUFVLElBQUksWUFBWSxFQUFDLFlBQVksS0FBSSxDQUFDO0FBRWhELGFBQU8sZ0JBQWdCLENBQUM7QUFFeEIsYUFBTyxNQUFNO0FBQ2IsYUFBTyxVQUFVO0FBRWpCLGFBQU8sR0FBRyxVQUFVLE1BQU07QUFFMUIsWUFBTSxVQUFVLE1BQU0sS0FBSyxTQUFTLEVBQUUsUUFBUSxHQUFHO0FBRWpELGFBQU87QUFFUCxlQUFTLElBQUssUUFBUTtBQUNwQixZQUFJLE1BQU0sUUFBUSxNQUFNLEdBQUc7QUFDekIsaUJBQU8sUUFBUSxHQUFHO0FBQ2xCLGlCQUFPO0FBQUEsUUFDVDtBQUVBLGdCQUFRLEtBQUssTUFBTTtBQUNuQixlQUFPLEtBQUssT0FBTyxPQUFPLEtBQUssTUFBTSxNQUFNLENBQUM7QUFDNUMsZUFBTyxLQUFLLFNBQVMsT0FBTyxLQUFLLEtBQUssUUFBUSxPQUFPLENBQUM7QUFDdEQsZUFBTyxLQUFLLFFBQVEsRUFBQyxLQUFLLE1BQUssQ0FBQztBQUNoQyxlQUFPO0FBQUEsTUFDVDtBQUVBLGVBQVMsVUFBVztBQUNsQixlQUFPLFFBQVEsVUFBVTtBQUFBLE1BQzNCO0FBRUEsZUFBUyxPQUFRLFFBQVE7QUFDdkIsa0JBQVUsUUFBUSxPQUFPLFNBQVUsSUFBSTtBQUFFLGlCQUFPLE9BQU87QUFBQSxRQUFPLENBQUM7QUFDL0QsWUFBSSxDQUFDLFFBQVEsVUFBVSxPQUFPLFVBQVU7QUFBRSxpQkFBTyxJQUFJO0FBQUEsUUFBRTtBQUFBLE1BQ3pEO0FBQUEsSUFDRjtBQUFBO0FBQUE7OztBQ3hDQTtBQUFBLG9EQUFBQyxVQUFBQyxTQUFBO0FBS0EsUUFBSSxLQUFLLFFBQVEsSUFBSTtBQUNyQixRQUFNLE9BQU8sUUFBUSxNQUFNO0FBQzNCLFFBQU1DLFFBQU8sUUFBUSxNQUFNO0FBQzNCLFFBQU0sU0FBUyxRQUFRLFFBQVE7QUFDL0IsUUFBTSxPQUFPLFFBQVEsTUFBTTtBQUMzQixRQUFNLFNBQVMsUUFBUSxRQUFRO0FBRS9CLFFBQU0sU0FBUztBQUFBO0FBQUEsTUFFWCxRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBO0FBQUEsTUFHUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBO0FBQUEsTUFHUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtB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YUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQUs7QUFBQSxFQUVkO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFLO0FBQUEsRUFFZDtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQUs7QUFBQSxFQUVkO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFLO0FBQUEsRUFFZDtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtB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QixJQUV2RSw4Q0FBQyxrQkFBSyxlQUFMLEVBQW9CLEdBQUcsVUFBVSxnQkFBaUIsR0FBRyxvQkFBb0I7QUFBQSxRQUU1RTtBQUFBLFVBQUMsa0JBQUs7QUFBQSxVQUFMO0FBQUEsWUFDQyxPQUFNO0FBQUEsWUFDTixNQUFNLFNBQVMsYUFBYSxVQUFVLFdBQU0sS0FBSyxTQUFTLGVBQWUsU0FBUyxNQUFNO0FBQUEsUUFDdEYsYUFBYSxVQUFVLFdBQU0sS0FDL0I7QUFBQTtBQUFBLFFBQ0Y7QUFBQTtBQUFBO0FBQUEsRUFDRjtBQUVKO0FBRUEsSUFBTyx1QkFBUTsiLAogICJuYW1lcyI6IFsiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoS2V5IiwgImVudmlyb25tZW50IiwgInBsYXRmb3JtIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInByb2Nlc3MiLCAidW5sb2FkIiwgImVtaXQiLCAibG9hZCIsICJwcm9jZXNzUmVhbGx5RXhpdCIsICJwcm9jZXNzRW1pdCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwcm9taXNpZnkiLCAiZ2V0U3RyZWFtIiwgInN0cmVhbSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgIm9wZW4iLCAiZXJyIiwgImVudHJ5IiwgImltcG9ydF9hcGkiLCAiJGhnVVcxJHVzZVJlZiIsICIkaGdVVzEkdXNlTWVtbyIsICIkaGdVVzEkc2hvd1RvYXN0IiwgIiRoZ1VXMSRUb2FzdCIsICIkaGdVVzEkcmVhZEZpbGVTeW5jIiwgIiRoZ1VXMSRqb2luIiwgIiRoZ1VXMSRlbnZpcm9ubWVudCIsICIkaGdVVzEkQ2xpcGJvYXJkIiwgIiRoZ1VXMSRvcGVuIiwgIiRoZ1VXMSR1c2VTdGF0ZSIsICIkaGdVVzEkdXNlQ2FsbGJhY2siLCAiYXJncyIsICIkaGdVVzEkTGF1bmNoVHlwZSIsICJvcHRpb25zIiwgIiRoZ1VXMSR1c2VFZmZlY3QiLCAiaW5pdGlhbFN0YXRlIiwgIiRoZ1VXMSRDYWNoZSIsICIkaGdVVzEkdXNlU3luY0V4dGVybmFsU3RvcmUiLCAiJGhnVVcxJHVzZU1lbW8iLCAiJGhnVVcxJHVzZUNhbGxiYWNrIiwgIiRoZ1VXMSR1c2VTdGF0ZSIsICIkaGdVVzEkdXNlUmVmIiwgIiRoZ1VXMSR1c2VDYWxsYmFjayIsICJ2YWx1ZXMiLCAidmFsaWRhdGlvbiIsICJlcnJvcnMiLCAiJGhnVVcxJHVzZU1lbW8iLCAidmFsdWUiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfbm9kZV9wYXRoIiwgImltcG9ydF9ub2RlX3Byb2Nlc3MiLCAiaW1wb3J0X25vZGVfcGF0aCIsICJwbGF0Zm9ybSIsICJwcm9jZXNzIiwgInVybCIsICJwYXRoIiwgIm9uZXRpbWUiLCAiaW1wb3J0X25vZGVfb3MiLCAiaW1wb3J0X25vZGVfb3MiLCAib3MiLCAib25FeGl0IiwgIm1lcmdlU3RyZWFtIiwgImdldFN0cmVhbSIsICJwcm9jZXNzIiwgImNyb3NzU3Bhd24iLCAicGF0aCIsICJjaGlsZFByb2Nlc3MiLCAiaW1wb3J0X2ZzIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfcGF0aCIsICJpbXBvcnRfcHJvbWlzZXMiLCAicGF0aCIsICJzdHJlYW1aaXAiLCAiaW1wb3J0X2ZzIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2FwaSIsICJjYXB0dXJlRXhjZXB0aW9uUmF5Y2FzdCIsICJpbXBvcnRfZnMiLCAiaW1wb3J0X2NyeXB0byIsICJ1cmwiLCAicGF0aCIsICJodHRwcyIsICJodHRwIiwgImltcG9ydF9hcGkiLCAiUmF5Y2FzdENhY2hlIiwgInVybCIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImVycm9yIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9hcGkiLCAidmFsdWUiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImVycm9yIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYXBpIiwgImNhbGxiYWNrRXhlYyIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9jaGlsZF9wcm9jZXNzIiwgImltcG9ydF91dGlsIiwgImltcG9ydF9mcyIsICJpbXBvcnRfcGF0aCIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiZXhlYyIsICJleGVjV2l0aENhbGxiYWNrcyIsICJzdXBwb3J0UGF0aCIsICJ0cnlFeGVjIiwgInBhdGgiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpdGVtIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfY3J5cHRvIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAicHJvcHMiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfanN4X3J1bnRpbWUiXQp9Cg==
