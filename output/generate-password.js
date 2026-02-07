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

// src/generate-password.tsx
var generate_password_exports = {};
__export(generate_password_exports, {
  default: () => generate_password_default
});
module.exports = __toCommonJS(generate_password_exports);
var import_api33 = require("@raycast/api");

// src/utils/hooks/useOneTimePasswordHistoryWarning.ts
var import_api2 = require("@raycast/api");
var import_react = require("react");

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

// src/utils/hooks/useOneTimePasswordHistoryWarning.ts
var useOneTimePasswordHistoryWarning = () => {
  const handleDismissAction = () => (0, import_api2.popToRoot)({ clearSearchBar: false });
  const handlePrimaryAction = () => import_api2.LocalStorage.setItem(LOCAL_STORAGE_KEY.PASSWORD_ONE_TIME_WARNING, true);
  const displayWarning = async () => {
    const alertWasShown = await import_api2.LocalStorage.getItem(LOCAL_STORAGE_KEY.PASSWORD_ONE_TIME_WARNING);
    if (alertWasShown) return;
    await (0, import_api2.confirmAlert)({
      title: "Warning",
      message: "Password history is not available yet, so make sure to store the password after generating it!",
      icon: import_api2.Icon.ExclamationMark,
      dismissAction: {
        title: "Go back",
        onAction: handleDismissAction
      },
      primaryAction: {
        title: "I understand",
        onAction: handlePrimaryAction
      }
    });
  };
  (0, import_react.useEffect)(() => {
    void displayWarning();
  }, []);
};
var useOneTimePasswordHistoryWarning_default = useOneTimePasswordHistoryWarning;

// src/utils/hooks/usePasswordGenerator.ts
var import_api29 = require("@raycast/api");
var import_react15 = require("react");

// src/utils/hooks/useAbortController.ts
var import_react2 = require("react");
function useAbortController() {
  const abortControllerRef = (0, import_react2.useRef)(new AbortController());
  const renew = () => {
    if (!abortControllerRef.current.signal.aborted) return;
    abortControllerRef.current = new AbortController();
  };
  const abort = () => {
    abortControllerRef.current?.abort();
  };
  return { abortControllerRef, renew, abort };
}
var useAbortController_default = useAbortController;

// src/context/bitwarden.tsx
var import_react14 = require("react");

// src/api/bitwarden.ts
var import_api8 = require("@raycast/api");

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

// src/utils/passwords.ts
var import_api3 = require("@raycast/api");

// src/constants/passwords.ts
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
async function getPasswordGeneratorOptions() {
  const storedOptions = await import_api3.LocalStorage.getItem(LOCAL_STORAGE_KEY.PASSWORD_OPTIONS);
  return {
    ...DEFAULT_PASSWORD_OPTIONS,
    ...storedOptions ? JSON.parse(storedOptions) : {}
  };
}

// src/utils/preferences.ts
var import_api4 = require("@raycast/api");

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
  const { serverUrl } = (0, import_api4.getPreferenceValues)();
  return !serverUrl || serverUrl === "bitwarden.com" || serverUrl === "https://bitwarden.com" ? void 0 : serverUrl;
}
var COMMAND_NAME_TO_PREFERENCE_KEY_MAP = {
  search: "transientCopySearch",
  "generate-password": "transientCopyGeneratePassword",
  "generate-password-quick": "transientCopyGeneratePasswordQuick"
};
function getTransientCopyPreference(type) {
  const preferenceKey = COMMAND_NAME_TO_PREFERENCE_KEY_MAP[import_api4.environment.commandName];
  const transientPreference = (0, import_api4.getPreferenceValues)()[preferenceKey];
  if (transientPreference === "never") return false;
  if (transientPreference === "always") return true;
  if (transientPreference === "passwords") return type === "password";
  return true;
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
var import_api5 = require("@raycast/api");
var import_api6 = require("@raycast/api");
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
  if (import_api5.environment.isDevelopment) {
    console.error(desc, error);
  } else if (captureToRaycast) {
    (0, import_api6.captureException)(error);
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
var import_api7 = require("@raycast/api");
var Cache = new import_api7.Cache({ namespace: "bw-cache" });

// src/utils/platform.ts
var platform = process.platform === "darwin" ? "macos" : "windows";

// src/api/bitwarden.ts
var { supportPath } = import_api8.environment;
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
    this.preferences = (0, import_api8.getPreferenceValues)();
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
        const toast = await (0, import_api8.showToast)(toastOpts);
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
      style: import_api8.Toast.Style.Animated,
      primaryAction: { title: "Open Download Page", onAction: () => (0, import_api8.open)(cliInfo.downloadPage) }
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
      toast.style = import_api8.Toast.Style.Failure;
      unlinkAllSync(zipPath, this.cliPath);
      if (!import_api8.environment.isDevelopment) BinDownloadLogger.logError(error);
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
    const storedServer = await import_api8.LocalStorage.getItem(LOCAL_STORAGE_KEY.SERVER_URL);
    if (!serverUrl || storedServer === serverUrl) return;
    const toast = await this.showToast({
      style: import_api8.Toast.Style.Animated,
      title: "Switching server...",
      message: "Bitwarden server preference changed"
    });
    try {
      try {
        await this.logout();
      } catch {
      }
      await this.exec(["config", "server", serverUrl || DEFAULT_SERVER_URL], { resetVaultTimeout: false });
      await import_api8.LocalStorage.setItem(LOCAL_STORAGE_KEY.SERVER_URL, serverUrl);
      toast.style = import_api8.Toast.Style.Success;
      toast.title = "Success";
      toast.message = "Bitwarden server changed";
    } catch (error) {
      toast.style = import_api8.Toast.Style.Failure;
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
      await import_api8.LocalStorage.setItem(LOCAL_STORAGE_KEY.LAST_ACTIVITY_TIME, (/* @__PURE__ */ new Date()).toISOString());
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
    await import_api8.LocalStorage.setItem(LOCAL_STORAGE_KEY.VAULT_LAST_STATUS, status);
  }
  async getLastSavedVaultStatus() {
    const lastSavedStatus = await import_api8.LocalStorage.getItem(LOCAL_STORAGE_KEY.VAULT_LAST_STATUS);
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
var import_api9 = require("@raycast/api");
var import_jsx_runtime = require("react/jsx-runtime");
var LoadingFallback = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_api9.Form, { isLoading: true });

// src/components/TroubleshootingGuide.tsx
var import_api28 = require("@raycast/api");

// src/components/actions/ActionWithReprompt.tsx
var import_api19 = require("@raycast/api");

// src/components/searchVault/context/vaultItem.tsx
var import_react3 = require("react");
var VaultItemContext = (0, import_react3.createContext)(null);

// src/utils/hooks/useReprompt.tsx
var import_api18 = require("@raycast/api");

// src/components/RepromptForm.tsx
var import_api10 = require("@raycast/api");
var import_jsx_runtime2 = require("react/jsx-runtime");

// src/context/session/session.tsx
var import_api17 = require("@raycast/api");
var import_react9 = require("react");

// src/components/UnlockForm.tsx
var import_api14 = require("@raycast/api");
var import_react6 = require("react");

// src/utils/hooks/useVaultMessages.ts
var import_api11 = require("@raycast/api");
var import_react4 = require("react");

// src/utils/localstorage.ts
var import_api13 = require("@raycast/api");

// node_modules/@raycast/utils/dist/module.js
var import_react5 = __toESM(require("react"));
var import_api12 = require("@raycast/api");
var import_jsx_runtime3 = require("react/jsx-runtime");
function $bfcf6ee368b3bd9f$export$d4b699e2c1148419(value) {
  const ref = (0, import_react5.useRef)(value);
  ref.current = value;
  return ref;
}
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
  const [values, setValues] = (0, import_react5.useState)(initialValues);
  const [errors, setErrors] = (0, import_react5.useState)({});
  const refs = (0, import_react5.useRef)({});
  const latestValidation = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(validation || {});
  const latestOnSubmit = (0, $bfcf6ee368b3bd9f$export$d4b699e2c1148419)(_onSubmit);
  const focus = (0, import_react5.useCallback)((id) => {
    refs.current[id]?.focus();
  }, [
    refs
  ]);
  const handleSubmit = (0, import_react5.useCallback)(async (values2) => {
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
  const setValidationError = (0, import_react5.useCallback)((id, error) => {
    setErrors((errors2) => ({
      ...errors2,
      [id]: error
    }));
  }, [
    setErrors
  ]);
  const setValue = (0, import_react5.useCallback)(function(id, value) {
    setValues((values2) => ({
      ...values2,
      [id]: typeof value === "function" ? value(values2[id]) : value
    }));
  }, [
    setValues
  ]);
  const itemProps = (0, import_react5.useMemo)(() => {
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
  const reset = (0, import_react5.useCallback)((values2) => {
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

// src/components/UnlockForm.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");

// src/components/searchVault/VaultLoadingFallback.tsx
var import_api15 = require("@raycast/api");
var import_jsx_runtime5 = require("react/jsx-runtime");

// src/context/session/reducer.ts
var import_react7 = require("react");

// src/context/session/utils.ts
var import_api16 = require("@raycast/api");
var import_child_process = require("child_process");
var import_util = require("util");
var exec = (0, import_util.promisify)(import_child_process.exec);

// src/utils/hooks/useOnceEffect.ts
var import_react8 = require("react");
function useOnceEffect(effect, condition) {
  const hasRun = (0, import_react8.useRef)(false);
  (0, import_react8.useEffect)(() => {
    if (hasRun.current) return;
    if (condition !== void 0 && !condition) return;
    hasRun.current = true;
    void effect();
  }, [condition]);
}
var useOnceEffect_default = useOnceEffect;

// src/context/session/session.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
var SessionContext = (0, import_react9.createContext)(null);

// src/utils/hooks/useReprompt.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");

// src/components/actions/ActionWithReprompt.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");

// src/components/actions/BugReportCollectDataAction.tsx
var import_api20 = require("@raycast/api");
var import_child_process2 = require("child_process");
var import_util2 = require("util");
var import_fs7 = require("fs");
var import_path3 = require("path");
var import_jsx_runtime9 = require("react/jsx-runtime");
var exec2 = (0, import_util2.promisify)(import_child_process2.exec);
var { supportPath: supportPath2 } = import_api20.environment;
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
  } = (0, import_api20.getPreferenceValues)();
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
    const cliPathPref = (0, import_api20.getPreferenceValues)().cliPath;
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
    const toast = await (0, import_api20.showToast)(import_api20.Toast.Style.Animated, "Collecting data...");
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
          version: import_api20.environment.raycastVersion
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
      await import_api20.Clipboard.copy(JSON.stringify(data, null, 2));
      toast.style = import_api20.Toast.Style.Success;
      toast.title = "Data copied to clipboard";
    } catch (error) {
      toast.style = import_api20.Toast.Style.Failure;
      toast.title = "Failed to collect bug report data";
      captureException("Failed to collect bug report data", error);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_api20.Action, { title: "Collect Bug Report Data", icon: import_api20.Icon.Bug, onAction: collectData });
}
var BugReportCollectDataAction_default = BugReportCollectDataAction;

// src/components/actions/BugReportOpenAction.tsx
var import_api21 = require("@raycast/api");
var import_jsx_runtime10 = require("react/jsx-runtime");
var BUG_REPORT_URL = "https://github.com/raycast/extensions/issues/new?assignees=&labels=extension%2Cbug&template=extension_bug_report.yml&title=%5BBitwarden%5D+...";
function BugReportOpenAction() {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_api21.Action.OpenInBrowser, { title: "Open Bug Report", url: BUG_REPORT_URL });
}
var BugReportOpenAction_default = BugReportOpenAction;

// src/components/actions/CopyRuntimeErrorLog.tsx
var import_api22 = require("@raycast/api");
var import_jsx_runtime11 = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_api22.Action, { onAction: copyErrors, title: "Copy Last Errors", icon: import_api22.Icon.CopyClipboard, style: import_api22.Action.Style.Regular });
}
var CopyRuntimeErrorLog_default = CopyRuntimeErrorLog;

// src/components/actions/DebuggingBugReportingActionSection.tsx
var import_api23 = require("@raycast/api");

// src/utils/hooks/useCliVersion.ts
var import_react10 = require("react");
var getCliVersion = () => {
  const version = Cache.get(CACHE_KEYS.CLI_VERSION);
  if (version) return parseFloat(version);
  return -1;
};
var useCliVersion = () => {
  const [version, setVersion] = (0, import_react10.useState)(getCliVersion);
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
var import_jsx_runtime12 = require("react/jsx-runtime");
function DebuggingBugReportingActionSection() {
  const cliVersion = useCliVersion();
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_api23.ActionPanel.Section, { title: `Debugging & Bug Reporting (CLI v${cliVersion})`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(CopyRuntimeErrorLog_default, {}),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(BugReportOpenAction_default, {}),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(BugReportCollectDataAction_default, {})
  ] });
}

// src/components/actions/VaultActionsSection.tsx
var import_api27 = require("@raycast/api");

// src/context/vault.tsx
var import_api26 = require("@raycast/api");
var import_react13 = require("react");

// src/components/searchVault/context/vaultListeners.tsx
var import_react11 = require("react");
var import_jsx_runtime13 = require("react/jsx-runtime");
var VaultListenersContext = (0, import_react11.createContext)(null);

// src/components/searchVault/utils/useVaultCaching.ts
var import_api25 = require("@raycast/api");

// src/utils/hooks/useContentEncryptor.ts
var import_api24 = require("@raycast/api");
var import_react12 = require("react");

// src/context/vault.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
var VaultContext = (0, import_react13.createContext)(null);
var { syncOnLaunch } = (0, import_api26.getPreferenceValues)();

// src/components/actions/VaultActionsSection.tsx
var import_jsx_runtime15 = require("react/jsx-runtime");

// src/components/TroubleshootingGuide.tsx
var import_jsx_runtime16 = require("react/jsx-runtime");
var LINE_BREAK = "\n\n";
var CLI_INSTALLATION_HELP_URL = "https://bitwarden.com/help/cli/#download-and-install";
var getCodeBlock = (content) => `\`\`\`
${content}
\`\`\``;
var TroubleshootingGuide = ({ error }) => {
  const errorString = getErrorString(error);
  const localCliPath = (0, import_api28.getPreferenceValues)().cliPath;
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
    messages.push(`The \`${import_api28.environment.commandName}\` command crashed when we were not expecting it to.`);
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
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
    import_api28.Detail,
    {
      markdown: messages.filter(Boolean).join(LINE_BREAK),
      actions: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_api28.ActionPanel, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_api28.ActionPanel.Section, { title: "Bug Report", children: [
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(BugReportOpenAction_default, {}),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(BugReportCollectDataAction_default, {})
        ] }),
        needsToInstallCli && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_api28.Action.OpenInBrowser, { title: "Open Installation Guide", url: CLI_INSTALLATION_HELP_URL })
      ] })
    }
  );
};
var TroubleshootingGuide_default = TroubleshootingGuide;

// src/context/bitwarden.tsx
var import_jsx_runtime17 = require("react/jsx-runtime");
var BitwardenContext = (0, import_react14.createContext)(null);
var BitwardenProvider = ({ children, loadingFallback = /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(LoadingFallback, {}) }) => {
  const [bitwarden, setBitwarden] = (0, import_react14.useState)();
  const [error, setError] = (0, import_react14.useState)();
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
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(TroubleshootingGuide_default, { error });
  if (!bitwarden) return loadingFallback;
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(BitwardenContext.Provider, { value: bitwarden, children });
};
var useBitwarden = () => {
  const context = (0, import_react14.useContext)(BitwardenContext);
  if (context == null) {
    throw new Error("useBitwarden must be used within a BitwardenProvider");
  }
  return context;
};

// src/utils/hooks/usePasswordGenerator.ts
var initialPasswordGeneratorState = {
  options: void 0,
  password: void 0,
  isGenerating: true
};
var passwordReducer = (state, action) => {
  switch (action.type) {
    case "generate":
      return { ...state, isGenerating: true };
    case "setPassword":
      return { ...state, password: action.password, isGenerating: false };
    case "setOptions":
      return { ...state, options: action.options };
    case "cancelGenerate":
      return { ...state, isGenerating: false };
    case "clearPassword":
      return { ...state, isGenerating: false, password: void 0 };
  }
};
var prepareOptions = (options) => ({
  lowercase: options.lowercase ?? DEFAULT_PASSWORD_OPTIONS.lowercase,
  uppercase: options.uppercase ?? DEFAULT_PASSWORD_OPTIONS.uppercase,
  number: options.number ?? DEFAULT_PASSWORD_OPTIONS.number,
  special: options.special ?? DEFAULT_PASSWORD_OPTIONS.special,
  passphrase: options.passphrase ?? DEFAULT_PASSWORD_OPTIONS.passphrase,
  length: options.length ?? DEFAULT_PASSWORD_OPTIONS.length,
  words: options.words ?? DEFAULT_PASSWORD_OPTIONS.words,
  separator: options.separator ?? DEFAULT_PASSWORD_OPTIONS.separator,
  capitalize: options.capitalize ?? DEFAULT_PASSWORD_OPTIONS.capitalize,
  includeNumber: options.includeNumber ?? DEFAULT_PASSWORD_OPTIONS.includeNumber,
  minNumber: options.minNumber ?? DEFAULT_PASSWORD_OPTIONS.minNumber,
  minSpecial: options.minSpecial ?? DEFAULT_PASSWORD_OPTIONS.minSpecial
});
function usePasswordGenerator() {
  const bitwarden = useBitwarden();
  const [{ options, ...state }, dispatch] = (0, import_react15.useReducer)(passwordReducer, initialPasswordGeneratorState);
  const { abortControllerRef, renew: renewAbortController, abort: abortPreviousGenerate } = useAbortController_default();
  const restoreStoredOptions = async () => {
    const restoredOptions = await getPasswordGeneratorOptions();
    dispatch({ type: "setOptions", options: restoredOptions });
    await generatePassword(restoredOptions);
  };
  (0, import_react15.useEffect)(() => void restoreStoredOptions(), []);
  const generatePassword = async (newOptions = options) => {
    try {
      if (state.isGenerating) abortPreviousGenerate();
      renewAbortController();
      dispatch({ type: "generate" });
      const password = await bitwarden.generatePassword(newOptions, abortControllerRef?.current);
      dispatch({ type: "setPassword", password });
    } catch (error) {
      if (abortControllerRef?.current.signal.aborted) {
        dispatch({ type: "cancelGenerate" });
      }
    }
  };
  const regeneratePassword = async (newOptions) => {
    if (newOptions) {
      dispatch({ type: "setOptions", options: newOptions });
      const preparedOptions = prepareOptions(newOptions);
      await Promise.all([
        generatePassword(preparedOptions),
        import_api29.LocalStorage.setItem(LOCAL_STORAGE_KEY.PASSWORD_OPTIONS, JSON.stringify(preparedOptions))
      ]);
    } else {
      await generatePassword();
    }
  };
  return { ...state, regeneratePassword, options };
}
var usePasswordGenerator_default = usePasswordGenerator;

// src/components/generatePassword/ActionPanel.tsx
var import_api31 = require("@raycast/api");

// src/utils/clipboard.ts
var import_api30 = require("@raycast/api");

// src/utils/strings.ts
var capitalize = (value, lowercaseRest = false) => {
  const firstLetter = value.charAt(0).toUpperCase();
  const rest = lowercaseRest ? value.slice(1).toLowerCase() : value.slice(1);
  return firstLetter + rest;
};

// src/utils/clipboard.ts
async function showCopySuccessMessage(title, message) {
  const action = (0, import_api30.getPreferenceValues)().windowActionOnCopy;
  const messageTitle = capitalize(title, true);
  if (action === "keepOpen") {
    await (0, import_api30.showToast)({ title: messageTitle, message, style: import_api30.Toast.Style.Success });
  } else if (action === "closeAndPopToRoot") {
    await (0, import_api30.showHUD)(messageTitle);
    await (0, import_api30.popToRoot)();
  } else {
    await (0, import_api30.showHUD)(messageTitle);
  }
}

// src/components/generatePassword/ActionPanel.tsx
var import_jsx_runtime18 = require("react/jsx-runtime");
var GeneratePasswordActionPanel = (props) => {
  const { password, regeneratePassword } = props;
  const handleCopy = (password2) => async () => {
    await import_api31.Clipboard.copy(password2, { transient: getTransientCopyPreference("password") });
    await showCopySuccessMessage("Copied password to clipboard");
  };
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(import_api31.ActionPanel, { children: [
    !!password && /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(import_jsx_runtime18.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
        import_api31.Action,
        {
          title: "Copy Password",
          icon: import_api31.Icon.Clipboard,
          onAction: handleCopy(password),
          shortcut: { macOS: { key: "enter", modifiers: ["opt"] }, windows: { key: "enter", modifiers: ["alt"] } }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
        import_api31.Action.Paste,
        {
          title: "Paste Password to Active App",
          icon: import_api31.Icon.Text,
          content: password,
          shortcut: {
            key: "enter",
            macOS: { key: "enter", modifiers: ["opt", "shift"] },
            windows: { key: "enter", modifiers: ["alt", "shift"] }
          }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
      import_api31.Action,
      {
        title: "Regenerate Password",
        icon: import_api31.Icon.ArrowClockwise,
        shortcut: {
          macOS: { key: "backspace", modifiers: ["opt"] },
          windows: { key: "backspace", modifiers: ["alt"] }
        },
        onAction: () => regeneratePassword()
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(DebuggingBugReportingActionSection, {}),
    process.env.NODE_ENV === "development" && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(import_api31.Action, { title: "Clear storage", icon: import_api31.Icon.Trash, onAction: clearStorage })
  ] });
};
async function clearStorage() {
  for (const key of Object.values(LOCAL_STORAGE_KEY)) {
    await import_api31.LocalStorage.removeItem(key);
  }
}
var ActionPanel_default = GeneratePasswordActionPanel;

// src/components/RootErrorBoundary.tsx
var import_api32 = require("@raycast/api");
var import_react16 = require("react");
var import_jsx_runtime19 = require("react/jsx-runtime");
var RootErrorBoundary = class extends import_react16.Component {
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
      await (0, import_api32.showToast)(import_api32.Toast.Style.Failure, error.message);
    } else {
      if (import_api32.environment.isDevelopment) {
        this.setState((state) => ({ ...state, hasError: true, error: error.message }));
      }
      console.error("Error:", error, errorInfo);
    }
  }
  render() {
    try {
      if (this.state.hasError) return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(TroubleshootingGuide_default, { error: this.state.error });
      return this.props.children;
    } catch {
      return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(TroubleshootingGuide_default, {});
    }
  }
};

// src/utils/form.ts
var import_react17 = require("react");
var CustomValidations = {
  NumberStringBetween: (min, max) => {
    return (value) => {
      const num = value !== "" ? Number(value) : NaN;
      if (isNaN(num) || num < min || num > max) return `Must be between ${min} and ${max}`;
      return void 0;
    };
  },
  OneCharacter: (value) => {
    if (!value || value.length !== 1) return "Must be one character";
    return void 0;
  }
};
var stringifyBooleanItemProps = (itemProps, trueValue, falseValue) => ({
  ...itemProps,
  defaultValue: itemProps.value ? trueValue : falseValue,
  value: itemProps.value ? trueValue : falseValue,
  onChange: (value) => itemProps.onChange?.(value === trueValue),
  onBlur: (event) => {
    itemProps.onBlur?.({ ...event, target: { ...event.target, value: event.target.value === trueValue } });
  },
  onFocus: (event) => {
    itemProps.onFocus?.({ ...event, target: { ...event.target, value: event.target.value === trueValue } });
  }
});
var useOnChangeForm = (props) => {
  const form = $79498421851e7e84$export$87c0cf8eb5a167e0({ ...props, onSubmit: props.onChange });
  (0, import_react17.useEffect)(() => void form.handleSubmit(form.values), [form.values]);
  return form;
};

// src/generate-password.tsx
var import_jsx_runtime20 = require("react/jsx-runtime");
var GeneratePasswordCommand = () => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(RootErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(BitwardenProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(GeneratePasswordForm, {}) }) });
function GeneratePasswordForm() {
  const generator = usePasswordGenerator_default();
  if (!generator.options) return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Detail, { isLoading: true });
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(GeneratePasswordFormContent, { generator });
}
var passwordTypeOptions = ["password", "passphrase"];
function GeneratePasswordFormContent({ generator }) {
  const { options, password, isGenerating, regeneratePassword } = generator;
  const cliVersion = useCliVersion();
  const form = useOnChangeForm({
    onChange: regeneratePassword,
    initialValues: options,
    validation: {
      length: CustomValidations.NumberStringBetween(5, 128),
      words: CustomValidations.NumberStringBetween(3, 20),
      separator: CustomValidations.OneCharacter,
      minNumber: CustomValidations.NumberStringBetween(0, 9),
      minSpecial: CustomValidations.NumberStringBetween(0, 9)
    }
  });
  const { values, itemProps } = form;
  useOneTimePasswordHistoryWarning_default();
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
    import_api33.Form,
    {
      isLoading: isGenerating,
      actions: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(ActionPanel_default, { password, regeneratePassword }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.Description, { title: "\u{1F511}", text: password ?? "Generating..." }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.Separator, {}),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          import_api33.Form.Dropdown,
          {
            ...stringifyBooleanItemProps(itemProps.passphrase, "passphrase", "password"),
            title: "Type",
            autoFocus: true,
            children: passwordTypeOptions.map((type) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.Dropdown.Item, { value: type, title: capitalize(type) }, type))
          }
        ),
        values.passphrase ? /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.TextField, { ...itemProps.words, title: "Number of words", placeholder: "3 - 20" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.TextField, { ...itemProps.separator, title: "Word separator", placeholder: "this-is-a-passphrase" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.Checkbox, { ...itemProps.capitalize, title: "Capitalize", label: "This-Is-A-Passphrase" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.Checkbox, { ...itemProps.includeNumber, title: "Include number", label: "This2-Is-A-Passphrase" })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.TextField, { ...itemProps.length, title: "Length of the password", placeholder: "5 - 128" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.Checkbox, { ...itemProps.uppercase, title: "Uppercase characters", label: "ABCDEFGHIJLMNOPQRSTUVWXYZ" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.Checkbox, { ...itemProps.lowercase, title: "Lowercase characters", label: "abcdefghijklmnopqrstuvwxyz" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.Checkbox, { ...itemProps.number, title: "Numeric characters", label: "0123456789" }),
          cliVersion >= 2023.9 && values.number && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.TextField, { ...itemProps.minNumber, title: "Minimum numbers", placeholder: "1" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.Checkbox, { ...itemProps.special, title: "Special characters", label: "!@#$%^&*()_+-=[]{}|;:,./<>?" }),
          cliVersion >= 2023.9 && values.special && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_api33.Form.TextField, { ...itemProps.minSpecial, title: "Minimum special", placeholder: "1" })
        ] })
      ]
    }
  );
}
var generate_password_default = GeneratePasswordCommand;
/*! Bundled license information:

node-stream-zip/node_stream_zip.js:
  (**
   * @license node-stream-zip | (c) 2020 Antelle | https://github.com/antelle/node-stream-zip/blob/master/LICENSE
   * Portions copyright https://github.com/cthackers/adm-zip | https://raw.githubusercontent.com/cthackers/adm-zip/master/LICENSE
   *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL3dpbmRvd3MuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL21vZGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy93aGljaC93aGljaC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi91dGlsL3Jlc29sdmVDb21tYW5kLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9jcm9zcy1zcGF3bi9saWIvdXRpbC9lc2NhcGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctcmVnZXgvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctY29tbWFuZC9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL3V0aWwvcmVhZFNoZWJhbmcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi9wYXJzZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL2Vub2VudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NpZ25hbC1leGl0L3NpZ25hbHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NpZ25hbC1leGl0L2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9nZXQtc3RyZWFtL2J1ZmZlci1zdHJlYW0uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2dldC1zdHJlYW0vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL21lcmdlLXN0cmVhbS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvbm9kZS1zdHJlYW0temlwL25vZGVfc3RyZWFtX3ppcC5qcyIsICIuLi9zcmMvZ2VuZXJhdGUtcGFzc3dvcmQudHN4IiwgIi4uL3NyYy91dGlscy9ob29rcy91c2VPbmVUaW1lUGFzc3dvcmRIaXN0b3J5V2FybmluZy50cyIsICIuLi9zcmMvY29uc3RhbnRzL2dlbmVyYWwudHMiLCAiLi4vc3JjL3V0aWxzL2hvb2tzL3VzZVBhc3N3b3JkR2VuZXJhdG9yLnRzIiwgIi4uL3NyYy91dGlscy9ob29rcy91c2VBYm9ydENvbnRyb2xsZXIudHMiLCAiLi4vc3JjL2NvbnRleHQvYml0d2FyZGVuLnRzeCIsICIuLi9zcmMvYXBpL2JpdHdhcmRlbi50cyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3N0cmlwLWZpbmFsLW5ld2xpbmUvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL25wbS1ydW4tcGF0aC9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvbnBtLXJ1bi1wYXRoL25vZGVfbW9kdWxlcy9wYXRoLWtleS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvbWltaWMtZm4vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL29uZXRpbWUvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2h1bWFuLXNpZ25hbHMvYnVpbGQvc3JjL21haW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2h1bWFuLXNpZ25hbHMvYnVpbGQvc3JjL3JlYWx0aW1lLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9zaWduYWxzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9jb3JlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9leGVjYS9saWIvZXJyb3IuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9zdGRpby5qcyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvbGliL2tpbGwuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzLXN0cmVhbS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvbGliL3N0cmVhbS5qcyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvbGliL3Byb21pc2UuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9jb21tYW5kLmpzIiwgIi4uL3NyYy91dGlscy9wYXNzd29yZHMudHMiLCAiLi4vc3JjL2NvbnN0YW50cy9wYXNzd29yZHMudHMiLCAiLi4vc3JjL3V0aWxzL3ByZWZlcmVuY2VzLnRzIiwgIi4uL3NyYy9jb25zdGFudHMvcHJlZmVyZW5jZXMudHMiLCAiLi4vc3JjL2NvbnN0YW50cy9sYWJlbHMudHMiLCAiLi4vc3JjL3V0aWxzL2Vycm9ycy50cyIsICIuLi9zcmMvdXRpbHMvZnMudHMiLCAiLi4vc3JjL3V0aWxzL25ldHdvcmsudHMiLCAiLi4vc3JjL3V0aWxzL2RldmVsb3BtZW50LnRzIiwgIi4uL3NyYy91dGlscy9jcnlwdG8udHMiLCAiLi4vc3JjL2FwaS9iaXR3YXJkZW4uaGVscGVycy50cyIsICIuLi9zcmMvdXRpbHMvY2FjaGUudHMiLCAiLi4vc3JjL3V0aWxzL3BsYXRmb3JtLnRzIiwgIi4uL3NyYy9jb21wb25lbnRzL0xvYWRpbmdGYWxsYmFjay50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvVHJvdWJsZXNob290aW5nR3VpZGUudHN4IiwgIi4uL3NyYy9jb21wb25lbnRzL2FjdGlvbnMvQWN0aW9uV2l0aFJlcHJvbXB0LnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9zZWFyY2hWYXVsdC9jb250ZXh0L3ZhdWx0SXRlbS50c3giLCAiLi4vc3JjL3V0aWxzL2hvb2tzL3VzZVJlcHJvbXB0LnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9SZXByb21wdEZvcm0udHN4IiwgIi4uL3NyYy9jb250ZXh0L3Nlc3Npb24vc2Vzc2lvbi50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvVW5sb2NrRm9ybS50c3giLCAiLi4vc3JjL3V0aWxzL2hvb2tzL3VzZVZhdWx0TWVzc2FnZXMudHMiLCAiLi4vc3JjL3V0aWxzL2xvY2Fsc3RvcmFnZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvaW5kZXgudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZVByb21pc2UudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZURlZXBNZW1vLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy91c2VMYXRlc3QudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3Nob3dGYWlsdXJlVG9hc3QudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUNhY2hlZFN0YXRlLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9oZWxwZXJzLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy92ZW5kb3JzL3R5cGUtaGFzaGVyLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy91c2VDYWNoZWRQcm9taXNlLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy91c2VGZXRjaC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvZmV0Y2gtdXRpbHMudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUV4ZWMudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2V4ZWMtdXRpbHMudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3ZlbmRvcnMvc2lnbmFsLWV4aXQudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZVN0cmVhbUpTT04udHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3ZlbmRvcnMvc3RyZWFtLWNoYWluLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy92ZW5kb3JzL3N0cmVhbS1qc29uLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy91c2VTUUwudHN4IiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9zcWwtdXRpbHMudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUZvcm0udHN4IiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy91c2VBSS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlRnJlY2VuY3lTb3J0aW5nLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy91c2VMb2NhbFN0b3JhZ2UudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2ljb24vaW5kZXgudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2ljb24vYXZhdGFyLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9pY29uL2NvbG9yLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9pY29uL2Zhdmljb24udHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2ljb24vcHJvZ3Jlc3MudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL29hdXRoL2luZGV4LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9vYXV0aC9PQXV0aFNlcnZpY2UudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL29hdXRoL3Byb3ZpZGVycy50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvb2F1dGgvd2l0aEFjY2Vzc1Rva2VuLnRzeCIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvY3JlYXRlRGVlcGxpbmsudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2V4ZWN1dGVTUUwudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3J1bi1hcHBsZXNjcmlwdC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvcnVuLXBvd2Vyc2hlbGwtc2NyaXB0LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9jYWNoZS50cyIsICIuLi9zcmMvY29tcG9uZW50cy9zZWFyY2hWYXVsdC9WYXVsdExvYWRpbmdGYWxsYmFjay50c3giLCAiLi4vc3JjL2NvbnRleHQvc2Vzc2lvbi9yZWR1Y2VyLnRzIiwgIi4uL3NyYy9jb250ZXh0L3Nlc3Npb24vdXRpbHMudHMiLCAiLi4vc3JjL3V0aWxzL2hvb2tzL3VzZU9uY2VFZmZlY3QudHMiLCAiLi4vc3JjL2NvbXBvbmVudHMvYWN0aW9ucy9CdWdSZXBvcnRDb2xsZWN0RGF0YUFjdGlvbi50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvYWN0aW9ucy9CdWdSZXBvcnRPcGVuQWN0aW9uLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9hY3Rpb25zL0NvcHlSdW50aW1lRXJyb3JMb2cudHN4IiwgIi4uL3NyYy9jb21wb25lbnRzL2FjdGlvbnMvRGVidWdnaW5nQnVnUmVwb3J0aW5nQWN0aW9uU2VjdGlvbi50c3giLCAiLi4vc3JjL3V0aWxzL2hvb2tzL3VzZUNsaVZlcnNpb24udHMiLCAiLi4vc3JjL2NvbXBvbmVudHMvYWN0aW9ucy9WYXVsdEFjdGlvbnNTZWN0aW9uLnRzeCIsICIuLi9zcmMvY29udGV4dC92YXVsdC50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvc2VhcmNoVmF1bHQvY29udGV4dC92YXVsdExpc3RlbmVycy50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvc2VhcmNoVmF1bHQvdXRpbHMvdXNlVmF1bHRDYWNoaW5nLnRzIiwgIi4uL3NyYy91dGlscy9ob29rcy91c2VDb250ZW50RW5jcnlwdG9yLnRzIiwgIi4uL3NyYy9jb21wb25lbnRzL2dlbmVyYXRlUGFzc3dvcmQvQWN0aW9uUGFuZWwudHN4IiwgIi4uL3NyYy91dGlscy9jbGlwYm9hcmQudHMiLCAiLi4vc3JjL3V0aWxzL3N0cmluZ3MudHMiLCAiLi4vc3JjL2NvbXBvbmVudHMvUm9vdEVycm9yQm91bmRhcnkudHN4IiwgIi4uL3NyYy91dGlscy9mb3JtLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJtb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG52YXIgZnMgPSByZXF1aXJlKCdmcycpXG5cbmZ1bmN0aW9uIGNoZWNrUGF0aEV4dCAocGF0aCwgb3B0aW9ucykge1xuICB2YXIgcGF0aGV4dCA9IG9wdGlvbnMucGF0aEV4dCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLnBhdGhFeHQgOiBwcm9jZXNzLmVudi5QQVRIRVhUXG5cbiAgaWYgKCFwYXRoZXh0KSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHBhdGhleHQgPSBwYXRoZXh0LnNwbGl0KCc7JylcbiAgaWYgKHBhdGhleHQuaW5kZXhPZignJykgIT09IC0xKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhleHQubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcCA9IHBhdGhleHRbaV0udG9Mb3dlckNhc2UoKVxuICAgIGlmIChwICYmIHBhdGguc3Vic3RyKC1wLmxlbmd0aCkudG9Mb3dlckNhc2UoKSA9PT0gcCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIGNoZWNrU3RhdCAoc3RhdCwgcGF0aCwgb3B0aW9ucykge1xuICBpZiAoIXN0YXQuaXNTeW1ib2xpY0xpbmsoKSAmJiAhc3RhdC5pc0ZpbGUoKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiBjaGVja1BhdGhFeHQocGF0aCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gaXNleGUgKHBhdGgsIG9wdGlvbnMsIGNiKSB7XG4gIGZzLnN0YXQocGF0aCwgZnVuY3Rpb24gKGVyLCBzdGF0KSB7XG4gICAgY2IoZXIsIGVyID8gZmFsc2UgOiBjaGVja1N0YXQoc3RhdCwgcGF0aCwgb3B0aW9ucykpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHN5bmMgKHBhdGgsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNoZWNrU3RhdChmcy5zdGF0U3luYyhwYXRoKSwgcGF0aCwgb3B0aW9ucylcbn1cbiIsICJtb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG52YXIgZnMgPSByZXF1aXJlKCdmcycpXG5cbmZ1bmN0aW9uIGlzZXhlIChwYXRoLCBvcHRpb25zLCBjYikge1xuICBmcy5zdGF0KHBhdGgsIGZ1bmN0aW9uIChlciwgc3RhdCkge1xuICAgIGNiKGVyLCBlciA/IGZhbHNlIDogY2hlY2tTdGF0KHN0YXQsIG9wdGlvbnMpKVxuICB9KVxufVxuXG5mdW5jdGlvbiBzeW5jIChwYXRoLCBvcHRpb25zKSB7XG4gIHJldHVybiBjaGVja1N0YXQoZnMuc3RhdFN5bmMocGF0aCksIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGNoZWNrU3RhdCAoc3RhdCwgb3B0aW9ucykge1xuICByZXR1cm4gc3RhdC5pc0ZpbGUoKSAmJiBjaGVja01vZGUoc3RhdCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gY2hlY2tNb2RlIChzdGF0LCBvcHRpb25zKSB7XG4gIHZhciBtb2QgPSBzdGF0Lm1vZGVcbiAgdmFyIHVpZCA9IHN0YXQudWlkXG4gIHZhciBnaWQgPSBzdGF0LmdpZFxuXG4gIHZhciBteVVpZCA9IG9wdGlvbnMudWlkICE9PSB1bmRlZmluZWQgP1xuICAgIG9wdGlvbnMudWlkIDogcHJvY2Vzcy5nZXR1aWQgJiYgcHJvY2Vzcy5nZXR1aWQoKVxuICB2YXIgbXlHaWQgPSBvcHRpb25zLmdpZCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLmdpZCA6IHByb2Nlc3MuZ2V0Z2lkICYmIHByb2Nlc3MuZ2V0Z2lkKClcblxuICB2YXIgdSA9IHBhcnNlSW50KCcxMDAnLCA4KVxuICB2YXIgZyA9IHBhcnNlSW50KCcwMTAnLCA4KVxuICB2YXIgbyA9IHBhcnNlSW50KCcwMDEnLCA4KVxuICB2YXIgdWcgPSB1IHwgZ1xuXG4gIHZhciByZXQgPSAobW9kICYgbykgfHxcbiAgICAobW9kICYgZykgJiYgZ2lkID09PSBteUdpZCB8fFxuICAgIChtb2QgJiB1KSAmJiB1aWQgPT09IG15VWlkIHx8XG4gICAgKG1vZCAmIHVnKSAmJiBteVVpZCA9PT0gMFxuXG4gIHJldHVybiByZXRcbn1cbiIsICJ2YXIgZnMgPSByZXF1aXJlKCdmcycpXG52YXIgY29yZVxuaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgfHwgZ2xvYmFsLlRFU1RJTkdfV0lORE9XUykge1xuICBjb3JlID0gcmVxdWlyZSgnLi93aW5kb3dzLmpzJylcbn0gZWxzZSB7XG4gIGNvcmUgPSByZXF1aXJlKCcuL21vZGUuanMnKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG5mdW5jdGlvbiBpc2V4ZSAocGF0aCwgb3B0aW9ucywgY2IpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IHt9XG4gIH1cblxuICBpZiAoIWNiKSB7XG4gICAgaWYgKHR5cGVvZiBQcm9taXNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYWxsYmFjayBub3QgcHJvdmlkZWQnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBpc2V4ZShwYXRoLCBvcHRpb25zIHx8IHt9LCBmdW5jdGlvbiAoZXIsIGlzKSB7XG4gICAgICAgIGlmIChlcikge1xuICAgICAgICAgIHJlamVjdChlcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKGlzKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBjb3JlKHBhdGgsIG9wdGlvbnMgfHwge30sIGZ1bmN0aW9uIChlciwgaXMpIHtcbiAgICAvLyBpZ25vcmUgRUFDQ0VTIGJlY2F1c2UgdGhhdCBqdXN0IG1lYW5zIHdlIGFyZW4ndCBhbGxvd2VkIHRvIHJ1biBpdFxuICAgIGlmIChlcikge1xuICAgICAgaWYgKGVyLmNvZGUgPT09ICdFQUNDRVMnIHx8IG9wdGlvbnMgJiYgb3B0aW9ucy5pZ25vcmVFcnJvcnMpIHtcbiAgICAgICAgZXIgPSBudWxsXG4gICAgICAgIGlzID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gICAgY2IoZXIsIGlzKVxuICB9KVxufVxuXG5mdW5jdGlvbiBzeW5jIChwYXRoLCBvcHRpb25zKSB7XG4gIC8vIG15IGtpbmdkb20gZm9yIGEgZmlsdGVyZWQgY2F0Y2hcbiAgdHJ5IHtcbiAgICByZXR1cm4gY29yZS5zeW5jKHBhdGgsIG9wdGlvbnMgfHwge30pXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5pZ25vcmVFcnJvcnMgfHwgZXIuY29kZSA9PT0gJ0VBQ0NFUycpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlclxuICAgIH1cbiAgfVxufVxuIiwgImNvbnN0IGlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgfHxcbiAgICBwcm9jZXNzLmVudi5PU1RZUEUgPT09ICdjeWd3aW4nIHx8XG4gICAgcHJvY2Vzcy5lbnYuT1NUWVBFID09PSAnbXN5cydcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuY29uc3QgQ09MT04gPSBpc1dpbmRvd3MgPyAnOycgOiAnOidcbmNvbnN0IGlzZXhlID0gcmVxdWlyZSgnaXNleGUnKVxuXG5jb25zdCBnZXROb3RGb3VuZEVycm9yID0gKGNtZCkgPT5cbiAgT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoYG5vdCBmb3VuZDogJHtjbWR9YCksIHsgY29kZTogJ0VOT0VOVCcgfSlcblxuY29uc3QgZ2V0UGF0aEluZm8gPSAoY21kLCBvcHQpID0+IHtcbiAgY29uc3QgY29sb24gPSBvcHQuY29sb24gfHwgQ09MT05cblxuICAvLyBJZiBpdCBoYXMgYSBzbGFzaCwgdGhlbiB3ZSBkb24ndCBib3RoZXIgc2VhcmNoaW5nIHRoZSBwYXRoZW52LlxuICAvLyBqdXN0IGNoZWNrIHRoZSBmaWxlIGl0c2VsZiwgYW5kIHRoYXQncyBpdC5cbiAgY29uc3QgcGF0aEVudiA9IGNtZC5tYXRjaCgvXFwvLykgfHwgaXNXaW5kb3dzICYmIGNtZC5tYXRjaCgvXFxcXC8pID8gWycnXVxuICAgIDogKFxuICAgICAgW1xuICAgICAgICAvLyB3aW5kb3dzIGFsd2F5cyBjaGVja3MgdGhlIGN3ZCBmaXJzdFxuICAgICAgICAuLi4oaXNXaW5kb3dzID8gW3Byb2Nlc3MuY3dkKCldIDogW10pLFxuICAgICAgICAuLi4ob3B0LnBhdGggfHwgcHJvY2Vzcy5lbnYuUEFUSCB8fFxuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiB2ZXJ5IHVudXN1YWwgKi8gJycpLnNwbGl0KGNvbG9uKSxcbiAgICAgIF1cbiAgICApXG4gIGNvbnN0IHBhdGhFeHRFeGUgPSBpc1dpbmRvd3NcbiAgICA/IG9wdC5wYXRoRXh0IHx8IHByb2Nlc3MuZW52LlBBVEhFWFQgfHwgJy5FWEU7LkNNRDsuQkFUOy5DT00nXG4gICAgOiAnJ1xuICBjb25zdCBwYXRoRXh0ID0gaXNXaW5kb3dzID8gcGF0aEV4dEV4ZS5zcGxpdChjb2xvbikgOiBbJyddXG5cbiAgaWYgKGlzV2luZG93cykge1xuICAgIGlmIChjbWQuaW5kZXhPZignLicpICE9PSAtMSAmJiBwYXRoRXh0WzBdICE9PSAnJylcbiAgICAgIHBhdGhFeHQudW5zaGlmdCgnJylcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGF0aEVudixcbiAgICBwYXRoRXh0LFxuICAgIHBhdGhFeHRFeGUsXG4gIH1cbn1cblxuY29uc3Qgd2hpY2ggPSAoY21kLCBvcHQsIGNiKSA9PiB7XG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBvcHRcbiAgICBvcHQgPSB7fVxuICB9XG4gIGlmICghb3B0KVxuICAgIG9wdCA9IHt9XG5cbiAgY29uc3QgeyBwYXRoRW52LCBwYXRoRXh0LCBwYXRoRXh0RXhlIH0gPSBnZXRQYXRoSW5mbyhjbWQsIG9wdClcbiAgY29uc3QgZm91bmQgPSBbXVxuXG4gIGNvbnN0IHN0ZXAgPSBpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoaSA9PT0gcGF0aEVudi5sZW5ndGgpXG4gICAgICByZXR1cm4gb3B0LmFsbCAmJiBmb3VuZC5sZW5ndGggPyByZXNvbHZlKGZvdW5kKVxuICAgICAgICA6IHJlamVjdChnZXROb3RGb3VuZEVycm9yKGNtZCkpXG5cbiAgICBjb25zdCBwcFJhdyA9IHBhdGhFbnZbaV1cbiAgICBjb25zdCBwYXRoUGFydCA9IC9eXCIuKlwiJC8udGVzdChwcFJhdykgPyBwcFJhdy5zbGljZSgxLCAtMSkgOiBwcFJhd1xuXG4gICAgY29uc3QgcENtZCA9IHBhdGguam9pbihwYXRoUGFydCwgY21kKVxuICAgIGNvbnN0IHAgPSAhcGF0aFBhcnQgJiYgL15cXC5bXFxcXFxcL10vLnRlc3QoY21kKSA/IGNtZC5zbGljZSgwLCAyKSArIHBDbWRcbiAgICAgIDogcENtZFxuXG4gICAgcmVzb2x2ZShzdWJTdGVwKHAsIGksIDApKVxuICB9KVxuXG4gIGNvbnN0IHN1YlN0ZXAgPSAocCwgaSwgaWkpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoaWkgPT09IHBhdGhFeHQubGVuZ3RoKVxuICAgICAgcmV0dXJuIHJlc29sdmUoc3RlcChpICsgMSkpXG4gICAgY29uc3QgZXh0ID0gcGF0aEV4dFtpaV1cbiAgICBpc2V4ZShwICsgZXh0LCB7IHBhdGhFeHQ6IHBhdGhFeHRFeGUgfSwgKGVyLCBpcykgPT4ge1xuICAgICAgaWYgKCFlciAmJiBpcykge1xuICAgICAgICBpZiAob3B0LmFsbClcbiAgICAgICAgICBmb3VuZC5wdXNoKHAgKyBleHQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShwICsgZXh0KVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoc3ViU3RlcChwLCBpLCBpaSArIDEpKVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIGNiID8gc3RlcCgwKS50aGVuKHJlcyA9PiBjYihudWxsLCByZXMpLCBjYikgOiBzdGVwKDApXG59XG5cbmNvbnN0IHdoaWNoU3luYyA9IChjbWQsIG9wdCkgPT4ge1xuICBvcHQgPSBvcHQgfHwge31cblxuICBjb25zdCB7IHBhdGhFbnYsIHBhdGhFeHQsIHBhdGhFeHRFeGUgfSA9IGdldFBhdGhJbmZvKGNtZCwgb3B0KVxuICBjb25zdCBmb3VuZCA9IFtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoRW52Lmxlbmd0aDsgaSArKykge1xuICAgIGNvbnN0IHBwUmF3ID0gcGF0aEVudltpXVxuICAgIGNvbnN0IHBhdGhQYXJ0ID0gL15cIi4qXCIkLy50ZXN0KHBwUmF3KSA/IHBwUmF3LnNsaWNlKDEsIC0xKSA6IHBwUmF3XG5cbiAgICBjb25zdCBwQ21kID0gcGF0aC5qb2luKHBhdGhQYXJ0LCBjbWQpXG4gICAgY29uc3QgcCA9ICFwYXRoUGFydCAmJiAvXlxcLltcXFxcXFwvXS8udGVzdChjbWQpID8gY21kLnNsaWNlKDAsIDIpICsgcENtZFxuICAgICAgOiBwQ21kXG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBhdGhFeHQubGVuZ3RoOyBqICsrKSB7XG4gICAgICBjb25zdCBjdXIgPSBwICsgcGF0aEV4dFtqXVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXMgPSBpc2V4ZS5zeW5jKGN1ciwgeyBwYXRoRXh0OiBwYXRoRXh0RXhlIH0pXG4gICAgICAgIGlmIChpcykge1xuICAgICAgICAgIGlmIChvcHQuYWxsKVxuICAgICAgICAgICAgZm91bmQucHVzaChjdXIpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGN1clxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge31cbiAgICB9XG4gIH1cblxuICBpZiAob3B0LmFsbCAmJiBmb3VuZC5sZW5ndGgpXG4gICAgcmV0dXJuIGZvdW5kXG5cbiAgaWYgKG9wdC5ub3Rocm93KVxuICAgIHJldHVybiBudWxsXG5cbiAgdGhyb3cgZ2V0Tm90Rm91bmRFcnJvcihjbWQpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2hpY2hcbndoaWNoLnN5bmMgPSB3aGljaFN5bmNcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHBhdGhLZXkgPSAob3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IGVudmlyb25tZW50ID0gb3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG5cdGNvbnN0IHBsYXRmb3JtID0gb3B0aW9ucy5wbGF0Zm9ybSB8fCBwcm9jZXNzLnBsYXRmb3JtO1xuXG5cdGlmIChwbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuXHRcdHJldHVybiAnUEFUSCc7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0LmtleXMoZW52aXJvbm1lbnQpLnJldmVyc2UoKS5maW5kKGtleSA9PiBrZXkudG9VcHBlckNhc2UoKSA9PT0gJ1BBVEgnKSB8fCAnUGF0aCc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGhLZXk7XG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBmb3IgdGhlIG5leHQgbWFqb3IgcmVsZWFzZVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IHBhdGhLZXk7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3Qgd2hpY2ggPSByZXF1aXJlKCd3aGljaCcpO1xuY29uc3QgZ2V0UGF0aEtleSA9IHJlcXVpcmUoJ3BhdGgta2V5Jyk7XG5cbmZ1bmN0aW9uIHJlc29sdmVDb21tYW5kQXR0ZW1wdChwYXJzZWQsIHdpdGhvdXRQYXRoRXh0KSB7XG4gICAgY29uc3QgZW52ID0gcGFyc2VkLm9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52O1xuICAgIGNvbnN0IGN3ZCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgY29uc3QgaGFzQ3VzdG9tQ3dkID0gcGFyc2VkLm9wdGlvbnMuY3dkICE9IG51bGw7XG4gICAgLy8gV29ya2VyIHRocmVhZHMgZG8gbm90IGhhdmUgcHJvY2Vzcy5jaGRpcigpXG4gICAgY29uc3Qgc2hvdWxkU3dpdGNoQ3dkID0gaGFzQ3VzdG9tQ3dkICYmIHByb2Nlc3MuY2hkaXIgIT09IHVuZGVmaW5lZCAmJiAhcHJvY2Vzcy5jaGRpci5kaXNhYmxlZDtcblxuICAgIC8vIElmIGEgY3VzdG9tIGBjd2RgIHdhcyBzcGVjaWZpZWQsIHdlIG5lZWQgdG8gY2hhbmdlIHRoZSBwcm9jZXNzIGN3ZFxuICAgIC8vIGJlY2F1c2UgYHdoaWNoYCB3aWxsIGRvIHN0YXQgY2FsbHMgYnV0IGRvZXMgbm90IHN1cHBvcnQgYSBjdXN0b20gY3dkXG4gICAgaWYgKHNob3VsZFN3aXRjaEN3ZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvY2Vzcy5jaGRpcihwYXJzZWQub3B0aW9ucy5jd2QpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIC8qIEVtcHR5ICovXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcmVzb2x2ZWQ7XG5cbiAgICB0cnkge1xuICAgICAgICByZXNvbHZlZCA9IHdoaWNoLnN5bmMocGFyc2VkLmNvbW1hbmQsIHtcbiAgICAgICAgICAgIHBhdGg6IGVudltnZXRQYXRoS2V5KHsgZW52IH0pXSxcbiAgICAgICAgICAgIHBhdGhFeHQ6IHdpdGhvdXRQYXRoRXh0ID8gcGF0aC5kZWxpbWl0ZXIgOiB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLyogRW1wdHkgKi9cbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoc2hvdWxkU3dpdGNoQ3dkKSB7XG4gICAgICAgICAgICBwcm9jZXNzLmNoZGlyKGN3ZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBzdWNjZXNzZnVsbHkgcmVzb2x2ZWQsIGVuc3VyZSB0aGF0IGFuIGFic29sdXRlIHBhdGggaXMgcmV0dXJuZWRcbiAgICAvLyBOb3RlIHRoYXQgd2hlbiBhIGN1c3RvbSBgY3dkYCB3YXMgdXNlZCwgd2UgbmVlZCB0byByZXNvbHZlIHRvIGFuIGFic29sdXRlIHBhdGggYmFzZWQgb24gaXRcbiAgICBpZiAocmVzb2x2ZWQpIHtcbiAgICAgICAgcmVzb2x2ZWQgPSBwYXRoLnJlc29sdmUoaGFzQ3VzdG9tQ3dkID8gcGFyc2VkLm9wdGlvbnMuY3dkIDogJycsIHJlc29sdmVkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzb2x2ZWQ7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVDb21tYW5kKHBhcnNlZCkge1xuICAgIHJldHVybiByZXNvbHZlQ29tbWFuZEF0dGVtcHQocGFyc2VkKSB8fCByZXNvbHZlQ29tbWFuZEF0dGVtcHQocGFyc2VkLCB0cnVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZXNvbHZlQ29tbWFuZDtcbiIsICIndXNlIHN0cmljdCc7XG5cbi8vIFNlZSBodHRwOi8vd3d3LnJvYnZhbmRlcndvdWRlLmNvbS9lc2NhcGVjaGFycy5waHBcbmNvbnN0IG1ldGFDaGFyc1JlZ0V4cCA9IC8oWygpXFxdWyUhXlwiYDw+Jnw7LCAqP10pL2c7XG5cbmZ1bmN0aW9uIGVzY2FwZUNvbW1hbmQoYXJnKSB7XG4gICAgLy8gRXNjYXBlIG1ldGEgY2hhcnNcbiAgICBhcmcgPSBhcmcucmVwbGFjZShtZXRhQ2hhcnNSZWdFeHAsICdeJDEnKTtcblxuICAgIHJldHVybiBhcmc7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUFyZ3VtZW50KGFyZywgZG91YmxlRXNjYXBlTWV0YUNoYXJzKSB7XG4gICAgLy8gQ29udmVydCB0byBzdHJpbmdcbiAgICBhcmcgPSBgJHthcmd9YDtcblxuICAgIC8vIEFsZ29yaXRobSBiZWxvdyBpcyBiYXNlZCBvbiBodHRwczovL3FudG0ub3JnL2NtZFxuICAgIC8vIEl0J3Mgc2xpZ2h0bHkgYWx0ZXJlZCB0byBkaXNhYmxlIEpTIGJhY2t0cmFja2luZyB0byBhdm9pZCBoYW5naW5nIG9uIHNwZWNpYWxseSBjcmFmdGVkIGlucHV0XG4gICAgLy8gUGxlYXNlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbW94eXN0dWRpby9ub2RlLWNyb3NzLXNwYXduL3B1bGwvMTYwIGZvciBtb3JlIGluZm9ybWF0aW9uXG5cbiAgICAvLyBTZXF1ZW5jZSBvZiBiYWNrc2xhc2hlcyBmb2xsb3dlZCBieSBhIGRvdWJsZSBxdW90ZTpcbiAgICAvLyBkb3VibGUgdXAgYWxsIHRoZSBiYWNrc2xhc2hlcyBhbmQgZXNjYXBlIHRoZSBkb3VibGUgcXVvdGVcbiAgICBhcmcgPSBhcmcucmVwbGFjZSgvKD89KFxcXFwrPyk/KVxcMVwiL2csICckMSQxXFxcXFwiJyk7XG5cbiAgICAvLyBTZXF1ZW5jZSBvZiBiYWNrc2xhc2hlcyBmb2xsb3dlZCBieSB0aGUgZW5kIG9mIHRoZSBzdHJpbmdcbiAgICAvLyAod2hpY2ggd2lsbCBiZWNvbWUgYSBkb3VibGUgcXVvdGUgbGF0ZXIpOlxuICAgIC8vIGRvdWJsZSB1cCBhbGwgdGhlIGJhY2tzbGFzaGVzXG4gICAgYXJnID0gYXJnLnJlcGxhY2UoLyg/PShcXFxcKz8pPylcXDEkLywgJyQxJDEnKTtcblxuICAgIC8vIEFsbCBvdGhlciBiYWNrc2xhc2hlcyBvY2N1ciBsaXRlcmFsbHlcblxuICAgIC8vIFF1b3RlIHRoZSB3aG9sZSB0aGluZzpcbiAgICBhcmcgPSBgXCIke2FyZ31cImA7XG5cbiAgICAvLyBFc2NhcGUgbWV0YSBjaGFyc1xuICAgIGFyZyA9IGFyZy5yZXBsYWNlKG1ldGFDaGFyc1JlZ0V4cCwgJ14kMScpO1xuXG4gICAgLy8gRG91YmxlIGVzY2FwZSBtZXRhIGNoYXJzIGlmIG5lY2Vzc2FyeVxuICAgIGlmIChkb3VibGVFc2NhcGVNZXRhQ2hhcnMpIHtcbiAgICAgICAgYXJnID0gYXJnLnJlcGxhY2UobWV0YUNoYXJzUmVnRXhwLCAnXiQxJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZztcbn1cblxubW9kdWxlLmV4cG9ydHMuY29tbWFuZCA9IGVzY2FwZUNvbW1hbmQ7XG5tb2R1bGUuZXhwb3J0cy5hcmd1bWVudCA9IGVzY2FwZUFyZ3VtZW50O1xuIiwgIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gL14jISguKikvO1xuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IHNoZWJhbmdSZWdleCA9IHJlcXVpcmUoJ3NoZWJhbmctcmVnZXgnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoc3RyaW5nID0gJycpID0+IHtcblx0Y29uc3QgbWF0Y2ggPSBzdHJpbmcubWF0Y2goc2hlYmFuZ1JlZ2V4KTtcblxuXHRpZiAoIW1hdGNoKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRjb25zdCBbcGF0aCwgYXJndW1lbnRdID0gbWF0Y2hbMF0ucmVwbGFjZSgvIyEgPy8sICcnKS5zcGxpdCgnICcpO1xuXHRjb25zdCBiaW5hcnkgPSBwYXRoLnNwbGl0KCcvJykucG9wKCk7XG5cblx0aWYgKGJpbmFyeSA9PT0gJ2VudicpIHtcblx0XHRyZXR1cm4gYXJndW1lbnQ7XG5cdH1cblxuXHRyZXR1cm4gYXJndW1lbnQgPyBgJHtiaW5hcnl9ICR7YXJndW1lbnR9YCA6IGJpbmFyeTtcbn07XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBzaGViYW5nQ29tbWFuZCA9IHJlcXVpcmUoJ3NoZWJhbmctY29tbWFuZCcpO1xuXG5mdW5jdGlvbiByZWFkU2hlYmFuZyhjb21tYW5kKSB7XG4gICAgLy8gUmVhZCB0aGUgZmlyc3QgMTUwIGJ5dGVzIGZyb20gdGhlIGZpbGVcbiAgICBjb25zdCBzaXplID0gMTUwO1xuICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhzaXplKTtcblxuICAgIGxldCBmZDtcblxuICAgIHRyeSB7XG4gICAgICAgIGZkID0gZnMub3BlblN5bmMoY29tbWFuZCwgJ3InKTtcbiAgICAgICAgZnMucmVhZFN5bmMoZmQsIGJ1ZmZlciwgMCwgc2l6ZSwgMCk7XG4gICAgICAgIGZzLmNsb3NlU3luYyhmZCk7XG4gICAgfSBjYXRjaCAoZSkgeyAvKiBFbXB0eSAqLyB9XG5cbiAgICAvLyBBdHRlbXB0IHRvIGV4dHJhY3Qgc2hlYmFuZyAobnVsbCBpcyByZXR1cm5lZCBpZiBub3QgYSBzaGViYW5nKVxuICAgIHJldHVybiBzaGViYW5nQ29tbWFuZChidWZmZXIudG9TdHJpbmcoKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVhZFNoZWJhbmc7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgcmVzb2x2ZUNvbW1hbmQgPSByZXF1aXJlKCcuL3V0aWwvcmVzb2x2ZUNvbW1hbmQnKTtcbmNvbnN0IGVzY2FwZSA9IHJlcXVpcmUoJy4vdXRpbC9lc2NhcGUnKTtcbmNvbnN0IHJlYWRTaGViYW5nID0gcmVxdWlyZSgnLi91dGlsL3JlYWRTaGViYW5nJyk7XG5cbmNvbnN0IGlzV2luID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJztcbmNvbnN0IGlzRXhlY3V0YWJsZVJlZ0V4cCA9IC9cXC4oPzpjb218ZXhlKSQvaTtcbmNvbnN0IGlzQ21kU2hpbVJlZ0V4cCA9IC9ub2RlX21vZHVsZXNbXFxcXC9dLmJpbltcXFxcL11bXlxcXFwvXStcXC5jbWQkL2k7XG5cbmZ1bmN0aW9uIGRldGVjdFNoZWJhbmcocGFyc2VkKSB7XG4gICAgcGFyc2VkLmZpbGUgPSByZXNvbHZlQ29tbWFuZChwYXJzZWQpO1xuXG4gICAgY29uc3Qgc2hlYmFuZyA9IHBhcnNlZC5maWxlICYmIHJlYWRTaGViYW5nKHBhcnNlZC5maWxlKTtcblxuICAgIGlmIChzaGViYW5nKSB7XG4gICAgICAgIHBhcnNlZC5hcmdzLnVuc2hpZnQocGFyc2VkLmZpbGUpO1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IHNoZWJhbmc7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmVDb21tYW5kKHBhcnNlZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlZC5maWxlO1xufVxuXG5mdW5jdGlvbiBwYXJzZU5vblNoZWxsKHBhcnNlZCkge1xuICAgIGlmICghaXNXaW4pIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICB9XG5cbiAgICAvLyBEZXRlY3QgJiBhZGQgc3VwcG9ydCBmb3Igc2hlYmFuZ3NcbiAgICBjb25zdCBjb21tYW5kRmlsZSA9IGRldGVjdFNoZWJhbmcocGFyc2VkKTtcblxuICAgIC8vIFdlIGRvbid0IG5lZWQgYSBzaGVsbCBpZiB0aGUgY29tbWFuZCBmaWxlbmFtZSBpcyBhbiBleGVjdXRhYmxlXG4gICAgY29uc3QgbmVlZHNTaGVsbCA9ICFpc0V4ZWN1dGFibGVSZWdFeHAudGVzdChjb21tYW5kRmlsZSk7XG5cbiAgICAvLyBJZiBhIHNoZWxsIGlzIHJlcXVpcmVkLCB1c2UgY21kLmV4ZSBhbmQgdGFrZSBjYXJlIG9mIGVzY2FwaW5nIGV2ZXJ5dGhpbmcgY29ycmVjdGx5XG4gICAgLy8gTm90ZSB0aGF0IGBmb3JjZVNoZWxsYCBpcyBhbiBoaWRkZW4gb3B0aW9uIHVzZWQgb25seSBpbiB0ZXN0c1xuICAgIGlmIChwYXJzZWQub3B0aW9ucy5mb3JjZVNoZWxsIHx8IG5lZWRzU2hlbGwpIHtcbiAgICAgICAgLy8gTmVlZCB0byBkb3VibGUgZXNjYXBlIG1ldGEgY2hhcnMgaWYgdGhlIGNvbW1hbmQgaXMgYSBjbWQtc2hpbSBsb2NhdGVkIGluIGBub2RlX21vZHVsZXMvLmJpbi9gXG4gICAgICAgIC8vIFRoZSBjbWQtc2hpbSBzaW1wbHkgY2FsbHMgZXhlY3V0ZSB0aGUgcGFja2FnZSBiaW4gZmlsZSB3aXRoIE5vZGVKUywgcHJveHlpbmcgYW55IGFyZ3VtZW50XG4gICAgICAgIC8vIEJlY2F1c2UgdGhlIGVzY2FwZSBvZiBtZXRhY2hhcnMgd2l0aCBeIGdldHMgaW50ZXJwcmV0ZWQgd2hlbiB0aGUgY21kLmV4ZSBpcyBmaXJzdCBjYWxsZWQsXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gZG91YmxlIGVzY2FwZSB0aGVtXG4gICAgICAgIGNvbnN0IG5lZWRzRG91YmxlRXNjYXBlTWV0YUNoYXJzID0gaXNDbWRTaGltUmVnRXhwLnRlc3QoY29tbWFuZEZpbGUpO1xuXG4gICAgICAgIC8vIE5vcm1hbGl6ZSBwb3NpeCBwYXRocyBpbnRvIE9TIGNvbXBhdGlibGUgcGF0aHMgKGUuZy46IGZvby9iYXIgLT4gZm9vXFxiYXIpXG4gICAgICAgIC8vIFRoaXMgaXMgbmVjZXNzYXJ5IG90aGVyd2lzZSBpdCB3aWxsIGFsd2F5cyBmYWlsIHdpdGggRU5PRU5UIGluIHRob3NlIGNhc2VzXG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gcGF0aC5ub3JtYWxpemUocGFyc2VkLmNvbW1hbmQpO1xuXG4gICAgICAgIC8vIEVzY2FwZSBjb21tYW5kICYgYXJndW1lbnRzXG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gZXNjYXBlLmNvbW1hbmQocGFyc2VkLmNvbW1hbmQpO1xuICAgICAgICBwYXJzZWQuYXJncyA9IHBhcnNlZC5hcmdzLm1hcCgoYXJnKSA9PiBlc2NhcGUuYXJndW1lbnQoYXJnLCBuZWVkc0RvdWJsZUVzY2FwZU1ldGFDaGFycykpO1xuXG4gICAgICAgIGNvbnN0IHNoZWxsQ29tbWFuZCA9IFtwYXJzZWQuY29tbWFuZF0uY29uY2F0KHBhcnNlZC5hcmdzKS5qb2luKCcgJyk7XG5cbiAgICAgICAgcGFyc2VkLmFyZ3MgPSBbJy9kJywgJy9zJywgJy9jJywgYFwiJHtzaGVsbENvbW1hbmR9XCJgXTtcbiAgICAgICAgcGFyc2VkLmNvbW1hbmQgPSBwcm9jZXNzLmVudi5jb21zcGVjIHx8ICdjbWQuZXhlJztcbiAgICAgICAgcGFyc2VkLm9wdGlvbnMud2luZG93c1ZlcmJhdGltQXJndW1lbnRzID0gdHJ1ZTsgLy8gVGVsbCBub2RlJ3Mgc3Bhd24gdGhhdCB0aGUgYXJndW1lbnRzIGFyZSBhbHJlYWR5IGVzY2FwZWRcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyc2VkO1xufVxuXG5mdW5jdGlvbiBwYXJzZShjb21tYW5kLCBhcmdzLCBvcHRpb25zKSB7XG4gICAgLy8gTm9ybWFsaXplIGFyZ3VtZW50cywgc2ltaWxhciB0byBub2RlanNcbiAgICBpZiAoYXJncyAmJiAhQXJyYXkuaXNBcnJheShhcmdzKSkge1xuICAgICAgICBvcHRpb25zID0gYXJncztcbiAgICAgICAgYXJncyA9IG51bGw7XG4gICAgfVxuXG4gICAgYXJncyA9IGFyZ3MgPyBhcmdzLnNsaWNlKDApIDogW107IC8vIENsb25lIGFycmF5IHRvIGF2b2lkIGNoYW5naW5nIHRoZSBvcmlnaW5hbFxuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTsgLy8gQ2xvbmUgb2JqZWN0IHRvIGF2b2lkIGNoYW5naW5nIHRoZSBvcmlnaW5hbFxuXG4gICAgLy8gQnVpbGQgb3VyIHBhcnNlZCBvYmplY3RcbiAgICBjb25zdCBwYXJzZWQgPSB7XG4gICAgICAgIGNvbW1hbmQsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIGZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgb3JpZ2luYWw6IHtcbiAgICAgICAgICAgIGNvbW1hbmQsXG4gICAgICAgICAgICBhcmdzLFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICAvLyBEZWxlZ2F0ZSBmdXJ0aGVyIHBhcnNpbmcgdG8gc2hlbGwgb3Igbm9uLXNoZWxsXG4gICAgcmV0dXJuIG9wdGlvbnMuc2hlbGwgPyBwYXJzZWQgOiBwYXJzZU5vblNoZWxsKHBhcnNlZCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBpc1dpbiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG5cbmZ1bmN0aW9uIG5vdEZvdW5kRXJyb3Iob3JpZ2luYWwsIHN5c2NhbGwpIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoYCR7c3lzY2FsbH0gJHtvcmlnaW5hbC5jb21tYW5kfSBFTk9FTlRgKSwge1xuICAgICAgICBjb2RlOiAnRU5PRU5UJyxcbiAgICAgICAgZXJybm86ICdFTk9FTlQnLFxuICAgICAgICBzeXNjYWxsOiBgJHtzeXNjYWxsfSAke29yaWdpbmFsLmNvbW1hbmR9YCxcbiAgICAgICAgcGF0aDogb3JpZ2luYWwuY29tbWFuZCxcbiAgICAgICAgc3Bhd25hcmdzOiBvcmlnaW5hbC5hcmdzLFxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBob29rQ2hpbGRQcm9jZXNzKGNwLCBwYXJzZWQpIHtcbiAgICBpZiAoIWlzV2luKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnaW5hbEVtaXQgPSBjcC5lbWl0O1xuXG4gICAgY3AuZW1pdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmcxKSB7XG4gICAgICAgIC8vIElmIGVtaXR0aW5nIFwiZXhpdFwiIGV2ZW50IGFuZCBleGl0IGNvZGUgaXMgMSwgd2UgbmVlZCB0byBjaGVjayBpZlxuICAgICAgICAvLyB0aGUgY29tbWFuZCBleGlzdHMgYW5kIGVtaXQgYW4gXCJlcnJvclwiIGluc3RlYWRcbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9JbmRpZ29Vbml0ZWQvbm9kZS1jcm9zcy1zcGF3bi9pc3N1ZXMvMTZcbiAgICAgICAgaWYgKG5hbWUgPT09ICdleGl0Jykge1xuICAgICAgICAgICAgY29uc3QgZXJyID0gdmVyaWZ5RU5PRU5UKGFyZzEsIHBhcnNlZCk7XG5cbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxFbWl0LmNhbGwoY3AsICdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3JpZ2luYWxFbWl0LmFwcGx5KGNwLCBhcmd1bWVudHMpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHByZWZlci1yZXN0LXBhcmFtc1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIHZlcmlmeUVOT0VOVChzdGF0dXMsIHBhcnNlZCkge1xuICAgIGlmIChpc1dpbiAmJiBzdGF0dXMgPT09IDEgJiYgIXBhcnNlZC5maWxlKSB7XG4gICAgICAgIHJldHVybiBub3RGb3VuZEVycm9yKHBhcnNlZC5vcmlnaW5hbCwgJ3NwYXduJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHZlcmlmeUVOT0VOVFN5bmMoc3RhdHVzLCBwYXJzZWQpIHtcbiAgICBpZiAoaXNXaW4gJiYgc3RhdHVzID09PSAxICYmICFwYXJzZWQuZmlsZSkge1xuICAgICAgICByZXR1cm4gbm90Rm91bmRFcnJvcihwYXJzZWQub3JpZ2luYWwsICdzcGF3blN5bmMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaG9va0NoaWxkUHJvY2VzcyxcbiAgICB2ZXJpZnlFTk9FTlQsXG4gICAgdmVyaWZ5RU5PRU5UU3luYyxcbiAgICBub3RGb3VuZEVycm9yLFxufTtcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGNwID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuY29uc3QgcGFyc2UgPSByZXF1aXJlKCcuL2xpYi9wYXJzZScpO1xuY29uc3QgZW5vZW50ID0gcmVxdWlyZSgnLi9saWIvZW5vZW50Jyk7XG5cbmZ1bmN0aW9uIHNwYXduKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBQYXJzZSB0aGUgYXJndW1lbnRzXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG5cbiAgICAvLyBTcGF3biB0aGUgY2hpbGQgcHJvY2Vzc1xuICAgIGNvbnN0IHNwYXduZWQgPSBjcC5zcGF3bihwYXJzZWQuY29tbWFuZCwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblxuICAgIC8vIEhvb2sgaW50byBjaGlsZCBwcm9jZXNzIFwiZXhpdFwiIGV2ZW50IHRvIGVtaXQgYW4gZXJyb3IgaWYgdGhlIGNvbW1hbmRcbiAgICAvLyBkb2VzIG5vdCBleGlzdHMsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgIGVub2VudC5ob29rQ2hpbGRQcm9jZXNzKHNwYXduZWQsIHBhcnNlZCk7XG5cbiAgICByZXR1cm4gc3Bhd25lZDtcbn1cblxuZnVuY3Rpb24gc3Bhd25TeW5jKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBQYXJzZSB0aGUgYXJndW1lbnRzXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG5cbiAgICAvLyBTcGF3biB0aGUgY2hpbGQgcHJvY2Vzc1xuICAgIGNvbnN0IHJlc3VsdCA9IGNwLnNwYXduU3luYyhwYXJzZWQuY29tbWFuZCwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblxuICAgIC8vIEFuYWx5emUgaWYgdGhlIGNvbW1hbmQgZG9lcyBub3QgZXhpc3QsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgIHJlc3VsdC5lcnJvciA9IHJlc3VsdC5lcnJvciB8fCBlbm9lbnQudmVyaWZ5RU5PRU5UU3luYyhyZXN1bHQuc3RhdHVzLCBwYXJzZWQpO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzcGF3bjtcbm1vZHVsZS5leHBvcnRzLnNwYXduID0gc3Bhd247XG5tb2R1bGUuZXhwb3J0cy5zeW5jID0gc3Bhd25TeW5jO1xuXG5tb2R1bGUuZXhwb3J0cy5fcGFyc2UgPSBwYXJzZTtcbm1vZHVsZS5leHBvcnRzLl9lbm9lbnQgPSBlbm9lbnQ7XG4iLCAiLy8gVGhpcyBpcyBub3QgdGhlIHNldCBvZiBhbGwgcG9zc2libGUgc2lnbmFscy5cbi8vXG4vLyBJdCBJUywgaG93ZXZlciwgdGhlIHNldCBvZiBhbGwgc2lnbmFscyB0aGF0IHRyaWdnZXJcbi8vIGFuIGV4aXQgb24gZWl0aGVyIExpbnV4IG9yIEJTRCBzeXN0ZW1zLiAgTGludXggaXMgYVxuLy8gc3VwZXJzZXQgb2YgdGhlIHNpZ25hbCBuYW1lcyBzdXBwb3J0ZWQgb24gQlNELCBhbmRcbi8vIHRoZSB1bmtub3duIHNpZ25hbHMganVzdCBmYWlsIHRvIHJlZ2lzdGVyLCBzbyB3ZSBjYW5cbi8vIGNhdGNoIHRoYXQgZWFzaWx5IGVub3VnaC5cbi8vXG4vLyBEb24ndCBib3RoZXIgd2l0aCBTSUdLSUxMLiAgSXQncyB1bmNhdGNoYWJsZSwgd2hpY2hcbi8vIG1lYW5zIHRoYXQgd2UgY2FuJ3QgZmlyZSBhbnkgY2FsbGJhY2tzIGFueXdheS5cbi8vXG4vLyBJZiBhIHVzZXIgZG9lcyBoYXBwZW4gdG8gcmVnaXN0ZXIgYSBoYW5kbGVyIG9uIGEgbm9uLVxuLy8gZmF0YWwgc2lnbmFsIGxpa2UgU0lHV0lOQ0ggb3Igc29tZXRoaW5nLCBhbmQgdGhlblxuLy8gZXhpdCwgaXQnbGwgZW5kIHVwIGZpcmluZyBgcHJvY2Vzcy5lbWl0KCdleGl0JylgLCBzb1xuLy8gdGhlIGhhbmRsZXIgd2lsbCBiZSBmaXJlZCBhbnl3YXkuXG4vL1xuLy8gU0lHQlVTLCBTSUdGUEUsIFNJR1NFR1YgYW5kIFNJR0lMTCwgd2hlbiBub3QgcmFpc2VkXG4vLyBhcnRpZmljaWFsbHksIGluaGVyZW50bHkgbGVhdmUgdGhlIHByb2Nlc3MgaW4gYVxuLy8gc3RhdGUgZnJvbSB3aGljaCBpdCBpcyBub3Qgc2FmZSB0byB0cnkgYW5kIGVudGVyIEpTXG4vLyBsaXN0ZW5lcnMuXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgJ1NJR0FCUlQnLFxuICAnU0lHQUxSTScsXG4gICdTSUdIVVAnLFxuICAnU0lHSU5UJyxcbiAgJ1NJR1RFUk0nXG5dXG5cbmlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSB7XG4gIG1vZHVsZS5leHBvcnRzLnB1c2goXG4gICAgJ1NJR1ZUQUxSTScsXG4gICAgJ1NJR1hDUFUnLFxuICAgICdTSUdYRlNaJyxcbiAgICAnU0lHVVNSMicsXG4gICAgJ1NJR1RSQVAnLFxuICAgICdTSUdTWVMnLFxuICAgICdTSUdRVUlUJyxcbiAgICAnU0lHSU9UJ1xuICAgIC8vIHNob3VsZCBkZXRlY3QgcHJvZmlsZXIgYW5kIGVuYWJsZS9kaXNhYmxlIGFjY29yZGluZ2x5LlxuICAgIC8vIHNlZSAjMjFcbiAgICAvLyAnU0lHUFJPRidcbiAgKVxufVxuXG5pZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2xpbnV4Jykge1xuICBtb2R1bGUuZXhwb3J0cy5wdXNoKFxuICAgICdTSUdJTycsXG4gICAgJ1NJR1BPTEwnLFxuICAgICdTSUdQV1InLFxuICAgICdTSUdTVEtGTFQnLFxuICAgICdTSUdVTlVTRUQnXG4gIClcbn1cbiIsICIvLyBOb3RlOiBzaW5jZSBueWMgdXNlcyB0aGlzIG1vZHVsZSB0byBvdXRwdXQgY292ZXJhZ2UsIGFueSBsaW5lc1xuLy8gdGhhdCBhcmUgaW4gdGhlIGRpcmVjdCBzeW5jIGZsb3cgb2YgbnljJ3Mgb3V0cHV0Q292ZXJhZ2UgYXJlXG4vLyBpZ25vcmVkLCBzaW5jZSB3ZSBjYW4gbmV2ZXIgZ2V0IGNvdmVyYWdlIGZvciB0aGVtLlxuLy8gZ3JhYiBhIHJlZmVyZW5jZSB0byBub2RlJ3MgcmVhbCBwcm9jZXNzIG9iamVjdCByaWdodCBhd2F5XG52YXIgcHJvY2VzcyA9IGdsb2JhbC5wcm9jZXNzXG5cbmNvbnN0IHByb2Nlc3NPayA9IGZ1bmN0aW9uIChwcm9jZXNzKSB7XG4gIHJldHVybiBwcm9jZXNzICYmXG4gICAgdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5lbWl0ID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3MucmVhbGx5RXhpdCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLmxpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLmtpbGwgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5waWQgPT09ICdudW1iZXInICYmXG4gICAgdHlwZW9mIHByb2Nlc3Mub24gPT09ICdmdW5jdGlvbidcbn1cblxuLy8gc29tZSBraW5kIG9mIG5vbi1ub2RlIGVudmlyb25tZW50LCBqdXN0IG5vLW9wXG4vKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbmlmICghcHJvY2Vzc09rKHByb2Nlc3MpKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7fVxuICB9XG59IGVsc2Uge1xuICB2YXIgYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0JylcbiAgdmFyIHNpZ25hbHMgPSByZXF1aXJlKCcuL3NpZ25hbHMuanMnKVxuICB2YXIgaXNXaW4gPSAvXndpbi9pLnRlc3QocHJvY2Vzcy5wbGF0Zm9ybSlcblxuICB2YXIgRUUgPSByZXF1aXJlKCdldmVudHMnKVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKHR5cGVvZiBFRSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIEVFID0gRUUuRXZlbnRFbWl0dGVyXG4gIH1cblxuICB2YXIgZW1pdHRlclxuICBpZiAocHJvY2Vzcy5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfXykge1xuICAgIGVtaXR0ZXIgPSBwcm9jZXNzLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fXG4gIH0gZWxzZSB7XG4gICAgZW1pdHRlciA9IHByb2Nlc3MuX19zaWduYWxfZXhpdF9lbWl0dGVyX18gPSBuZXcgRUUoKVxuICAgIGVtaXR0ZXIuY291bnQgPSAwXG4gICAgZW1pdHRlci5lbWl0dGVkID0ge31cbiAgfVxuXG4gIC8vIEJlY2F1c2UgdGhpcyBlbWl0dGVyIGlzIGEgZ2xvYmFsLCB3ZSBoYXZlIHRvIGNoZWNrIHRvIHNlZSBpZiBhXG4gIC8vIHByZXZpb3VzIHZlcnNpb24gb2YgdGhpcyBsaWJyYXJ5IGZhaWxlZCB0byBlbmFibGUgaW5maW5pdGUgbGlzdGVuZXJzLlxuICAvLyBJIGtub3cgd2hhdCB5b3UncmUgYWJvdXQgdG8gc2F5LiAgQnV0IGxpdGVyYWxseSBldmVyeXRoaW5nIGFib3V0XG4gIC8vIHNpZ25hbC1leGl0IGlzIGEgY29tcHJvbWlzZSB3aXRoIGV2aWwuICBHZXQgdXNlZCB0byBpdC5cbiAgaWYgKCFlbWl0dGVyLmluZmluaXRlKSB7XG4gICAgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoSW5maW5pdHkpXG4gICAgZW1pdHRlci5pbmZpbml0ZSA9IHRydWVcbiAgfVxuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNiLCBvcHRzKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge31cbiAgICB9XG4gICAgYXNzZXJ0LmVxdWFsKHR5cGVvZiBjYiwgJ2Z1bmN0aW9uJywgJ2EgY2FsbGJhY2sgbXVzdCBiZSBwcm92aWRlZCBmb3IgZXhpdCBoYW5kbGVyJylcblxuICAgIGlmIChsb2FkZWQgPT09IGZhbHNlKSB7XG4gICAgICBsb2FkKClcbiAgICB9XG5cbiAgICB2YXIgZXYgPSAnZXhpdCdcbiAgICBpZiAob3B0cyAmJiBvcHRzLmFsd2F5c0xhc3QpIHtcbiAgICAgIGV2ID0gJ2FmdGVyZXhpdCdcbiAgICB9XG5cbiAgICB2YXIgcmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihldiwgY2IpXG4gICAgICBpZiAoZW1pdHRlci5saXN0ZW5lcnMoJ2V4aXQnKS5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgICBlbWl0dGVyLmxpc3RlbmVycygnYWZ0ZXJleGl0JykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHVubG9hZCgpXG4gICAgICB9XG4gICAgfVxuICAgIGVtaXR0ZXIub24oZXYsIGNiKVxuXG4gICAgcmV0dXJuIHJlbW92ZVxuICB9XG5cbiAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uIHVubG9hZCAoKSB7XG4gICAgaWYgKCFsb2FkZWQgfHwgIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsb2FkZWQgPSBmYWxzZVxuXG4gICAgc2lnbmFscy5mb3JFYWNoKGZ1bmN0aW9uIChzaWcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIoc2lnLCBzaWdMaXN0ZW5lcnNbc2lnXSlcbiAgICAgIH0gY2F0Y2ggKGVyKSB7fVxuICAgIH0pXG4gICAgcHJvY2Vzcy5lbWl0ID0gb3JpZ2luYWxQcm9jZXNzRW1pdFxuICAgIHByb2Nlc3MucmVhbGx5RXhpdCA9IG9yaWdpbmFsUHJvY2Vzc1JlYWxseUV4aXRcbiAgICBlbWl0dGVyLmNvdW50IC09IDFcbiAgfVxuICBtb2R1bGUuZXhwb3J0cy51bmxvYWQgPSB1bmxvYWRcblxuICB2YXIgZW1pdCA9IGZ1bmN0aW9uIGVtaXQgKGV2ZW50LCBjb2RlLCBzaWduYWwpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoZW1pdHRlci5lbWl0dGVkW2V2ZW50XSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGVtaXR0ZXIuZW1pdHRlZFtldmVudF0gPSB0cnVlXG4gICAgZW1pdHRlci5lbWl0KGV2ZW50LCBjb2RlLCBzaWduYWwpXG4gIH1cblxuICAvLyB7IDxzaWduYWw+OiA8bGlzdGVuZXIgZm4+LCAuLi4gfVxuICB2YXIgc2lnTGlzdGVuZXJzID0ge31cbiAgc2lnbmFscy5mb3JFYWNoKGZ1bmN0aW9uIChzaWcpIHtcbiAgICBzaWdMaXN0ZW5lcnNbc2lnXSA9IGZ1bmN0aW9uIGxpc3RlbmVyICgpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKCFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIG90aGVyIGxpc3RlbmVycywgYW4gZXhpdCBpcyBjb21pbmchXG4gICAgICAvLyBTaW1wbGVzdCB3YXk6IHJlbW92ZSB1cyBhbmQgdGhlbiByZS1zZW5kIHRoZSBzaWduYWwuXG4gICAgICAvLyBXZSBrbm93IHRoYXQgdGhpcyB3aWxsIGtpbGwgdGhlIHByb2Nlc3MsIHNvIHdlIGNhblxuICAgICAgLy8gc2FmZWx5IGVtaXQgbm93LlxuICAgICAgdmFyIGxpc3RlbmVycyA9IHByb2Nlc3MubGlzdGVuZXJzKHNpZylcbiAgICAgIGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSBlbWl0dGVyLmNvdW50KSB7XG4gICAgICAgIHVubG9hZCgpXG4gICAgICAgIGVtaXQoJ2V4aXQnLCBudWxsLCBzaWcpXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGVtaXQoJ2FmdGVyZXhpdCcsIG51bGwsIHNpZylcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgaWYgKGlzV2luICYmIHNpZyA9PT0gJ1NJR0hVUCcpIHtcbiAgICAgICAgICAvLyBcIlNJR0hVUFwiIHRocm93cyBhbiBgRU5PU1lTYCBlcnJvciBvbiBXaW5kb3dzLFxuICAgICAgICAgIC8vIHNvIHVzZSBhIHN1cHBvcnRlZCBzaWduYWwgaW5zdGVhZFxuICAgICAgICAgIHNpZyA9ICdTSUdJTlQnXG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgcHJvY2Vzcy5raWxsKHByb2Nlc3MucGlkLCBzaWcpXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIG1vZHVsZS5leHBvcnRzLnNpZ25hbHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHNpZ25hbHNcbiAgfVxuXG4gIHZhciBsb2FkZWQgPSBmYWxzZVxuXG4gIHZhciBsb2FkID0gZnVuY3Rpb24gbG9hZCAoKSB7XG4gICAgaWYgKGxvYWRlZCB8fCAhcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxvYWRlZCA9IHRydWVcblxuICAgIC8vIFRoaXMgaXMgdGhlIG51bWJlciBvZiBvblNpZ25hbEV4aXQncyB0aGF0IGFyZSBpbiBwbGF5LlxuICAgIC8vIEl0J3MgaW1wb3J0YW50IHNvIHRoYXQgd2UgY2FuIGNvdW50IHRoZSBjb3JyZWN0IG51bWJlciBvZlxuICAgIC8vIGxpc3RlbmVycyBvbiBzaWduYWxzLCBhbmQgZG9uJ3Qgd2FpdCBmb3IgdGhlIG90aGVyIG9uZSB0b1xuICAgIC8vIGhhbmRsZSBpdCBpbnN0ZWFkIG9mIHVzLlxuICAgIGVtaXR0ZXIuY291bnQgKz0gMVxuXG4gICAgc2lnbmFscyA9IHNpZ25hbHMuZmlsdGVyKGZ1bmN0aW9uIChzaWcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHByb2Nlc3Mub24oc2lnLCBzaWdMaXN0ZW5lcnNbc2lnXSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBwcm9jZXNzLmVtaXQgPSBwcm9jZXNzRW1pdFxuICAgIHByb2Nlc3MucmVhbGx5RXhpdCA9IHByb2Nlc3NSZWFsbHlFeGl0XG4gIH1cbiAgbW9kdWxlLmV4cG9ydHMubG9hZCA9IGxvYWRcblxuICB2YXIgb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdCA9IHByb2Nlc3MucmVhbGx5RXhpdFxuICB2YXIgcHJvY2Vzc1JlYWxseUV4aXQgPSBmdW5jdGlvbiBwcm9jZXNzUmVhbGx5RXhpdCAoY29kZSkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHByb2Nlc3MuZXhpdENvZGUgPSBjb2RlIHx8IC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIDBcbiAgICBlbWl0KCdleGl0JywgcHJvY2Vzcy5leGl0Q29kZSwgbnVsbClcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGVtaXQoJ2FmdGVyZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0LmNhbGwocHJvY2VzcywgcHJvY2Vzcy5leGl0Q29kZSlcbiAgfVxuXG4gIHZhciBvcmlnaW5hbFByb2Nlc3NFbWl0ID0gcHJvY2Vzcy5lbWl0XG4gIHZhciBwcm9jZXNzRW1pdCA9IGZ1bmN0aW9uIHByb2Nlc3NFbWl0IChldiwgYXJnKSB7XG4gICAgaWYgKGV2ID09PSAnZXhpdCcgJiYgcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmIChhcmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwcm9jZXNzLmV4aXRDb2RlID0gYXJnXG4gICAgICB9XG4gICAgICB2YXIgcmV0ID0gb3JpZ2luYWxQcm9jZXNzRW1pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgZW1pdCgnZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgZW1pdCgnYWZ0ZXJleGl0JywgcHJvY2Vzcy5leGl0Q29kZSwgbnVsbClcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICByZXR1cm4gcmV0XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcmlnaW5hbFByb2Nlc3NFbWl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9XG4gIH1cbn1cbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCB7UGFzc1Rocm91Z2g6IFBhc3NUaHJvdWdoU3RyZWFtfSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG9wdGlvbnMgPT4ge1xuXHRvcHRpb25zID0gey4uLm9wdGlvbnN9O1xuXG5cdGNvbnN0IHthcnJheX0gPSBvcHRpb25zO1xuXHRsZXQge2VuY29kaW5nfSA9IG9wdGlvbnM7XG5cdGNvbnN0IGlzQnVmZmVyID0gZW5jb2RpbmcgPT09ICdidWZmZXInO1xuXHRsZXQgb2JqZWN0TW9kZSA9IGZhbHNlO1xuXG5cdGlmIChhcnJheSkge1xuXHRcdG9iamVjdE1vZGUgPSAhKGVuY29kaW5nIHx8IGlzQnVmZmVyKTtcblx0fSBlbHNlIHtcblx0XHRlbmNvZGluZyA9IGVuY29kaW5nIHx8ICd1dGY4Jztcblx0fVxuXG5cdGlmIChpc0J1ZmZlcikge1xuXHRcdGVuY29kaW5nID0gbnVsbDtcblx0fVxuXG5cdGNvbnN0IHN0cmVhbSA9IG5ldyBQYXNzVGhyb3VnaFN0cmVhbSh7b2JqZWN0TW9kZX0pO1xuXG5cdGlmIChlbmNvZGluZykge1xuXHRcdHN0cmVhbS5zZXRFbmNvZGluZyhlbmNvZGluZyk7XG5cdH1cblxuXHRsZXQgbGVuZ3RoID0gMDtcblx0Y29uc3QgY2h1bmtzID0gW107XG5cblx0c3RyZWFtLm9uKCdkYXRhJywgY2h1bmsgPT4ge1xuXHRcdGNodW5rcy5wdXNoKGNodW5rKTtcblxuXHRcdGlmIChvYmplY3RNb2RlKSB7XG5cdFx0XHRsZW5ndGggPSBjaHVua3MubGVuZ3RoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZW5ndGggKz0gY2h1bmsubGVuZ3RoO1xuXHRcdH1cblx0fSk7XG5cblx0c3RyZWFtLmdldEJ1ZmZlcmVkVmFsdWUgPSAoKSA9PiB7XG5cdFx0aWYgKGFycmF5KSB7XG5cdFx0XHRyZXR1cm4gY2h1bmtzO1xuXHRcdH1cblxuXHRcdHJldHVybiBpc0J1ZmZlciA/IEJ1ZmZlci5jb25jYXQoY2h1bmtzLCBsZW5ndGgpIDogY2h1bmtzLmpvaW4oJycpO1xuXHR9O1xuXG5cdHN0cmVhbS5nZXRCdWZmZXJlZExlbmd0aCA9ICgpID0+IGxlbmd0aDtcblxuXHRyZXR1cm4gc3RyZWFtO1xufTtcbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCB7Y29uc3RhbnRzOiBCdWZmZXJDb25zdGFudHN9ID0gcmVxdWlyZSgnYnVmZmVyJyk7XG5jb25zdCBzdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcbmNvbnN0IHtwcm9taXNpZnl9ID0gcmVxdWlyZSgndXRpbCcpO1xuY29uc3QgYnVmZmVyU3RyZWFtID0gcmVxdWlyZSgnLi9idWZmZXItc3RyZWFtJyk7XG5cbmNvbnN0IHN0cmVhbVBpcGVsaW5lUHJvbWlzaWZpZWQgPSBwcm9taXNpZnkoc3RyZWFtLnBpcGVsaW5lKTtcblxuY2xhc3MgTWF4QnVmZmVyRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCdtYXhCdWZmZXIgZXhjZWVkZWQnKTtcblx0XHR0aGlzLm5hbWUgPSAnTWF4QnVmZmVyRXJyb3InO1xuXHR9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFN0cmVhbShpbnB1dFN0cmVhbSwgb3B0aW9ucykge1xuXHRpZiAoIWlucHV0U3RyZWFtKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBhIHN0cmVhbScpO1xuXHR9XG5cblx0b3B0aW9ucyA9IHtcblx0XHRtYXhCdWZmZXI6IEluZmluaXR5LFxuXHRcdC4uLm9wdGlvbnNcblx0fTtcblxuXHRjb25zdCB7bWF4QnVmZmVyfSA9IG9wdGlvbnM7XG5cdGNvbnN0IHN0cmVhbSA9IGJ1ZmZlclN0cmVhbShvcHRpb25zKTtcblxuXHRhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0Y29uc3QgcmVqZWN0UHJvbWlzZSA9IGVycm9yID0+IHtcblx0XHRcdC8vIERvbid0IHJldHJpZXZlIGFuIG92ZXJzaXplZCBidWZmZXIuXG5cdFx0XHRpZiAoZXJyb3IgJiYgc3RyZWFtLmdldEJ1ZmZlcmVkTGVuZ3RoKCkgPD0gQnVmZmVyQ29uc3RhbnRzLk1BWF9MRU5HVEgpIHtcblx0XHRcdFx0ZXJyb3IuYnVmZmVyZWREYXRhID0gc3RyZWFtLmdldEJ1ZmZlcmVkVmFsdWUoKTtcblx0XHRcdH1cblxuXHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHR9O1xuXG5cdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF3YWl0IHN0cmVhbVBpcGVsaW5lUHJvbWlzaWZpZWQoaW5wdXRTdHJlYW0sIHN0cmVhbSk7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdHJlamVjdFByb21pc2UoZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pKCk7XG5cblx0XHRzdHJlYW0ub24oJ2RhdGEnLCAoKSA9PiB7XG5cdFx0XHRpZiAoc3RyZWFtLmdldEJ1ZmZlcmVkTGVuZ3RoKCkgPiBtYXhCdWZmZXIpIHtcblx0XHRcdFx0cmVqZWN0UHJvbWlzZShuZXcgTWF4QnVmZmVyRXJyb3IoKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiBzdHJlYW0uZ2V0QnVmZmVyZWRWYWx1ZSgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFN0cmVhbTtcbm1vZHVsZS5leHBvcnRzLmJ1ZmZlciA9IChzdHJlYW0sIG9wdGlvbnMpID0+IGdldFN0cmVhbShzdHJlYW0sIHsuLi5vcHRpb25zLCBlbmNvZGluZzogJ2J1ZmZlcid9KTtcbm1vZHVsZS5leHBvcnRzLmFycmF5ID0gKHN0cmVhbSwgb3B0aW9ucykgPT4gZ2V0U3RyZWFtKHN0cmVhbSwgey4uLm9wdGlvbnMsIGFycmF5OiB0cnVlfSk7XG5tb2R1bGUuZXhwb3J0cy5NYXhCdWZmZXJFcnJvciA9IE1heEJ1ZmZlckVycm9yO1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgeyBQYXNzVGhyb3VnaCB9ID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKC8qc3RyZWFtcy4uLiovKSB7XG4gIHZhciBzb3VyY2VzID0gW11cbiAgdmFyIG91dHB1dCAgPSBuZXcgUGFzc1Rocm91Z2goe29iamVjdE1vZGU6IHRydWV9KVxuXG4gIG91dHB1dC5zZXRNYXhMaXN0ZW5lcnMoMClcblxuICBvdXRwdXQuYWRkID0gYWRkXG4gIG91dHB1dC5pc0VtcHR5ID0gaXNFbXB0eVxuXG4gIG91dHB1dC5vbigndW5waXBlJywgcmVtb3ZlKVxuXG4gIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuZm9yRWFjaChhZGQpXG5cbiAgcmV0dXJuIG91dHB1dFxuXG4gIGZ1bmN0aW9uIGFkZCAoc291cmNlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgc291cmNlLmZvckVhY2goYWRkKVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICBzb3VyY2VzLnB1c2goc291cmNlKTtcbiAgICBzb3VyY2Uub25jZSgnZW5kJywgcmVtb3ZlLmJpbmQobnVsbCwgc291cmNlKSlcbiAgICBzb3VyY2Uub25jZSgnZXJyb3InLCBvdXRwdXQuZW1pdC5iaW5kKG91dHB1dCwgJ2Vycm9yJykpXG4gICAgc291cmNlLnBpcGUob3V0cHV0LCB7ZW5kOiBmYWxzZX0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRW1wdHkgKCkge1xuICAgIHJldHVybiBzb3VyY2VzLmxlbmd0aCA9PSAwO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlIChzb3VyY2UpIHtcbiAgICBzb3VyY2VzID0gc291cmNlcy5maWx0ZXIoZnVuY3Rpb24gKGl0KSB7IHJldHVybiBpdCAhPT0gc291cmNlIH0pXG4gICAgaWYgKCFzb3VyY2VzLmxlbmd0aCAmJiBvdXRwdXQucmVhZGFibGUpIHsgb3V0cHV0LmVuZCgpIH1cbiAgfVxufVxuIiwgIi8qKlxuICogQGxpY2Vuc2Ugbm9kZS1zdHJlYW0temlwIHwgKGMpIDIwMjAgQW50ZWxsZSB8IGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRlbGxlL25vZGUtc3RyZWFtLXppcC9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKiBQb3J0aW9ucyBjb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL2N0aGFja2Vycy9hZG0temlwIHwgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2N0aGFja2Vycy9hZG0temlwL21hc3Rlci9MSUNFTlNFXG4gKi9cblxubGV0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZXZlbnRzID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCB6bGliID0gcmVxdWlyZSgnemxpYicpO1xuY29uc3Qgc3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5cbmNvbnN0IGNvbnN0cyA9IHtcbiAgICAvKiBUaGUgbG9jYWwgZmlsZSBoZWFkZXIgKi9cbiAgICBMT0NIRFI6IDMwLCAvLyBMT0MgaGVhZGVyIHNpemVcbiAgICBMT0NTSUc6IDB4MDQwMzRiNTAsIC8vIFwiUEtcXDAwM1xcMDA0XCJcbiAgICBMT0NWRVI6IDQsIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcbiAgICBMT0NGTEc6IDYsIC8vIGdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZ1xuICAgIExPQ0hPVzogOCwgLy8gY29tcHJlc3Npb24gbWV0aG9kXG4gICAgTE9DVElNOiAxMCwgLy8gbW9kaWZpY2F0aW9uIHRpbWUgKDIgYnl0ZXMgdGltZSwgMiBieXRlcyBkYXRlKVxuICAgIExPQ0NSQzogMTQsIC8vIHVuY29tcHJlc3NlZCBmaWxlIGNyYy0zMiB2YWx1ZVxuICAgIExPQ1NJWjogMTgsIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgIExPQ0xFTjogMjIsIC8vIHVuY29tcHJlc3NlZCBzaXplXG4gICAgTE9DTkFNOiAyNiwgLy8gZmlsZW5hbWUgbGVuZ3RoXG4gICAgTE9DRVhUOiAyOCwgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG5cbiAgICAvKiBUaGUgRGF0YSBkZXNjcmlwdG9yICovXG4gICAgRVhUU0lHOiAweDA4MDc0YjUwLCAvLyBcIlBLXFwwMDdcXDAwOFwiXG4gICAgRVhUSERSOiAxNiwgLy8gRVhUIGhlYWRlciBzaXplXG4gICAgRVhUQ1JDOiA0LCAvLyB1bmNvbXByZXNzZWQgZmlsZSBjcmMtMzIgdmFsdWVcbiAgICBFWFRTSVo6IDgsIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgIEVYVExFTjogMTIsIC8vIHVuY29tcHJlc3NlZCBzaXplXG5cbiAgICAvKiBUaGUgY2VudHJhbCBkaXJlY3RvcnkgZmlsZSBoZWFkZXIgKi9cbiAgICBDRU5IRFI6IDQ2LCAvLyBDRU4gaGVhZGVyIHNpemVcbiAgICBDRU5TSUc6IDB4MDIwMTRiNTAsIC8vIFwiUEtcXDAwMVxcMDAyXCJcbiAgICBDRU5WRU06IDQsIC8vIHZlcnNpb24gbWFkZSBieVxuICAgIENFTlZFUjogNiwgLy8gdmVyc2lvbiBuZWVkZWQgdG8gZXh0cmFjdFxuICAgIENFTkZMRzogOCwgLy8gZW5jcnlwdCwgZGVjcnlwdCBmbGFnc1xuICAgIENFTkhPVzogMTAsIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICAgIENFTlRJTTogMTIsIC8vIG1vZGlmaWNhdGlvbiB0aW1lICgyIGJ5dGVzIHRpbWUsIDIgYnl0ZXMgZGF0ZSlcbiAgICBDRU5DUkM6IDE2LCAvLyB1bmNvbXByZXNzZWQgZmlsZSBjcmMtMzIgdmFsdWVcbiAgICBDRU5TSVo6IDIwLCAvLyBjb21wcmVzc2VkIHNpemVcbiAgICBDRU5MRU46IDI0LCAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuICAgIENFTk5BTTogMjgsIC8vIGZpbGVuYW1lIGxlbmd0aFxuICAgIENFTkVYVDogMzAsIC8vIGV4dHJhIGZpZWxkIGxlbmd0aFxuICAgIENFTkNPTTogMzIsIC8vIGZpbGUgY29tbWVudCBsZW5ndGhcbiAgICBDRU5EU0s6IDM0LCAvLyB2b2x1bWUgbnVtYmVyIHN0YXJ0XG4gICAgQ0VOQVRUOiAzNiwgLy8gaW50ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXG4gICAgQ0VOQVRYOiAzOCwgLy8gZXh0ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzIChob3N0IHN5c3RlbSBkZXBlbmRlbnQpXG4gICAgQ0VOT0ZGOiA0MiwgLy8gTE9DIGhlYWRlciBvZmZzZXRcblxuICAgIC8qIFRoZSBlbnRyaWVzIGluIHRoZSBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnkgKi9cbiAgICBFTkRIRFI6IDIyLCAvLyBFTkQgaGVhZGVyIHNpemVcbiAgICBFTkRTSUc6IDB4MDYwNTRiNTAsIC8vIFwiUEtcXDAwNVxcMDA2XCJcbiAgICBFTkRTSUdGSVJTVDogMHg1MCxcbiAgICBFTkRTVUI6IDgsIC8vIG51bWJlciBvZiBlbnRyaWVzIG9uIHRoaXMgZGlza1xuICAgIEVORFRPVDogMTAsIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzXG4gICAgRU5EU0laOiAxMiwgLy8gY2VudHJhbCBkaXJlY3Rvcnkgc2l6ZSBpbiBieXRlc1xuICAgIEVORE9GRjogMTYsIC8vIG9mZnNldCBvZiBmaXJzdCBDRU4gaGVhZGVyXG4gICAgRU5EQ09NOiAyMCwgLy8gemlwIGZpbGUgY29tbWVudCBsZW5ndGhcbiAgICBNQVhGSUxFQ09NTUVOVDogMHhmZmZmLFxuXG4gICAgLyogVGhlIGVudHJpZXMgaW4gdGhlIGVuZCBvZiBaSVA2NCBjZW50cmFsIGRpcmVjdG9yeSBsb2NhdG9yICovXG4gICAgRU5ETDY0SERSOiAyMCwgLy8gWklQNjQgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5IGxvY2F0b3IgaGVhZGVyIHNpemVcbiAgICBFTkRMNjRTSUc6IDB4MDcwNjRiNTAsIC8vIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBsb2NhdG9yIHNpZ25hdHVyZVxuICAgIEVOREw2NFNJR0ZJUlNUOiAweDUwLFxuICAgIEVOREw2NE9GUzogOCwgLy8gWklQNjQgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5IG9mZnNldFxuXG4gICAgLyogVGhlIGVudHJpZXMgaW4gdGhlIGVuZCBvZiBaSVA2NCBjZW50cmFsIGRpcmVjdG9yeSAqL1xuICAgIEVORDY0SERSOiA1NiwgLy8gWklQNjQgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5IGhlYWRlciBzaXplXG4gICAgRU5ENjRTSUc6IDB4MDYwNjRiNTAsIC8vIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBzaWduYXR1cmVcbiAgICBFTkQ2NFNJR0ZJUlNUOiAweDUwLFxuICAgIEVORDY0U1VCOiAyNCwgLy8gbnVtYmVyIG9mIGVudHJpZXMgb24gdGhpcyBkaXNrXG4gICAgRU5ENjRUT1Q6IDMyLCAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllc1xuICAgIEVORDY0U0laOiA0MCxcbiAgICBFTkQ2NE9GRjogNDgsXG5cbiAgICAvKiBDb21wcmVzc2lvbiBtZXRob2RzICovXG4gICAgU1RPUkVEOiAwLCAvLyBubyBjb21wcmVzc2lvblxuICAgIFNIUlVOSzogMSwgLy8gc2hydW5rXG4gICAgUkVEVUNFRDE6IDIsIC8vIHJlZHVjZWQgd2l0aCBjb21wcmVzc2lvbiBmYWN0b3IgMVxuICAgIFJFRFVDRUQyOiAzLCAvLyByZWR1Y2VkIHdpdGggY29tcHJlc3Npb24gZmFjdG9yIDJcbiAgICBSRURVQ0VEMzogNCwgLy8gcmVkdWNlZCB3aXRoIGNvbXByZXNzaW9uIGZhY3RvciAzXG4gICAgUkVEVUNFRDQ6IDUsIC8vIHJlZHVjZWQgd2l0aCBjb21wcmVzc2lvbiBmYWN0b3IgNFxuICAgIElNUExPREVEOiA2LCAvLyBpbXBsb2RlZFxuICAgIC8vIDcgcmVzZXJ2ZWRcbiAgICBERUZMQVRFRDogOCwgLy8gZGVmbGF0ZWRcbiAgICBFTkhBTkNFRF9ERUZMQVRFRDogOSwgLy8gZGVmbGF0ZTY0XG4gICAgUEtXQVJFOiAxMCwgLy8gUEtXYXJlIERDTCBpbXBsb2RlZFxuICAgIC8vIDExIHJlc2VydmVkXG4gICAgQlpJUDI6IDEyLCAvLyAgY29tcHJlc3NlZCB1c2luZyBCWklQMlxuICAgIC8vIDEzIHJlc2VydmVkXG4gICAgTFpNQTogMTQsIC8vIExaTUFcbiAgICAvLyAxNS0xNyByZXNlcnZlZFxuICAgIElCTV9URVJTRTogMTgsIC8vIGNvbXByZXNzZWQgdXNpbmcgSUJNIFRFUlNFXG4gICAgSUJNX0xaNzc6IDE5LCAvL0lCTSBMWjc3IHpcblxuICAgIC8qIEdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZyAqL1xuICAgIEZMR19FTkM6IDAsIC8vIGVuY3J5cHRlZCBmaWxlXG4gICAgRkxHX0NPTVAxOiAxLCAvLyBjb21wcmVzc2lvbiBvcHRpb25cbiAgICBGTEdfQ09NUDI6IDIsIC8vIGNvbXByZXNzaW9uIG9wdGlvblxuICAgIEZMR19ERVNDOiA0LCAvLyBkYXRhIGRlc2NyaXB0b3JcbiAgICBGTEdfRU5IOiA4LCAvLyBlbmhhbmNlZCBkZWZsYXRpb25cbiAgICBGTEdfU1RSOiAxNiwgLy8gc3Ryb25nIGVuY3J5cHRpb25cbiAgICBGTEdfTE5HOiAxMDI0LCAvLyBsYW5ndWFnZSBlbmNvZGluZ1xuICAgIEZMR19NU0s6IDQwOTYsIC8vIG1hc2sgaGVhZGVyIHZhbHVlc1xuICAgIEZMR19FTlRSWV9FTkM6IDEsXG5cbiAgICAvKiA0LjUgRXh0ZW5zaWJsZSBkYXRhIGZpZWxkcyAqL1xuICAgIEVGX0lEOiAwLFxuICAgIEVGX1NJWkU6IDIsXG5cbiAgICAvKiBIZWFkZXIgSURzICovXG4gICAgSURfWklQNjQ6IDB4MDAwMSxcbiAgICBJRF9BVklORk86IDB4MDAwNyxcbiAgICBJRF9QRlM6IDB4MDAwOCxcbiAgICBJRF9PUzI6IDB4MDAwOSxcbiAgICBJRF9OVEZTOiAweDAwMGEsXG4gICAgSURfT1BFTlZNUzogMHgwMDBjLFxuICAgIElEX1VOSVg6IDB4MDAwZCxcbiAgICBJRF9GT1JLOiAweDAwMGUsXG4gICAgSURfUEFUQ0g6IDB4MDAwZixcbiAgICBJRF9YNTA5X1BLQ1M3OiAweDAwMTQsXG4gICAgSURfWDUwOV9DRVJUSURfRjogMHgwMDE1LFxuICAgIElEX1g1MDlfQ0VSVElEX0M6IDB4MDAxNixcbiAgICBJRF9TVFJPTkdFTkM6IDB4MDAxNyxcbiAgICBJRF9SRUNPUkRfTUdUOiAweDAwMTgsXG4gICAgSURfWDUwOV9QS0NTN19STDogMHgwMDE5LFxuICAgIElEX0lCTTE6IDB4MDA2NSxcbiAgICBJRF9JQk0yOiAweDAwNjYsXG4gICAgSURfUE9TWklQOiAweDQ2OTAsXG5cbiAgICBFRl9aSVA2NF9PUl8zMjogMHhmZmZmZmZmZixcbiAgICBFRl9aSVA2NF9PUl8xNjogMHhmZmZmLFxufTtcblxuY29uc3QgU3RyZWFtWmlwID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIGxldCBmZCwgZmlsZVNpemUsIGNodW5rU2l6ZSwgb3AsIGNlbnRyYWxEaXJlY3RvcnksIGNsb3NlZDtcbiAgICBjb25zdCByZWFkeSA9IGZhbHNlLFxuICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgZW50cmllcyA9IGNvbmZpZy5zdG9yZUVudHJpZXMgIT09IGZhbHNlID8ge30gOiBudWxsLFxuICAgICAgICBmaWxlTmFtZSA9IGNvbmZpZy5maWxlLFxuICAgICAgICB0ZXh0RGVjb2RlciA9IGNvbmZpZy5uYW1lRW5jb2RpbmcgPyBuZXcgVGV4dERlY29kZXIoY29uZmlnLm5hbWVFbmNvZGluZykgOiBudWxsO1xuXG4gICAgb3BlbigpO1xuXG4gICAgZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5mZCkge1xuICAgICAgICAgICAgZmQgPSBjb25maWcuZmQ7XG4gICAgICAgICAgICByZWFkRmlsZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnMub3BlbihmaWxlTmFtZSwgJ3InLCAoZXJyLCBmKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZkID0gZjtcbiAgICAgICAgICAgICAgICByZWFkRmlsZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkRmlsZSgpIHtcbiAgICAgICAgZnMuZnN0YXQoZmQsIChlcnIsIHN0YXQpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlU2l6ZSA9IHN0YXQuc2l6ZTtcbiAgICAgICAgICAgIGNodW5rU2l6ZSA9IGNvbmZpZy5jaHVua1NpemUgfHwgTWF0aC5yb3VuZChmaWxlU2l6ZSAvIDEwMDApO1xuICAgICAgICAgICAgY2h1bmtTaXplID0gTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgTWF0aC5taW4oY2h1bmtTaXplLCBNYXRoLm1pbigxMjggKiAxMDI0LCBmaWxlU2l6ZSkpLFxuICAgICAgICAgICAgICAgIE1hdGgubWluKDEwMjQsIGZpbGVTaXplKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJlYWRDZW50cmFsRGlyZWN0b3J5KCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRVbnRpbEZvdW5kQ2FsbGJhY2soZXJyLCBieXRlc1JlYWQpIHtcbiAgICAgICAgaWYgKGVyciB8fCAhYnl0ZXNSZWFkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIGVyciB8fCBuZXcgRXJyb3IoJ0FyY2hpdmUgcmVhZCBlcnJvcicpKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcG9zID0gb3AubGFzdFBvcztcbiAgICAgICAgbGV0IGJ1ZmZlclBvc2l0aW9uID0gcG9zIC0gb3Aud2luLnBvc2l0aW9uO1xuICAgICAgICBjb25zdCBidWZmZXIgPSBvcC53aW4uYnVmZmVyO1xuICAgICAgICBjb25zdCBtaW5Qb3MgPSBvcC5taW5Qb3M7XG4gICAgICAgIHdoaWxlICgtLXBvcyA+PSBtaW5Qb3MgJiYgLS1idWZmZXJQb3NpdGlvbiA+PSAwKSB7XG4gICAgICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCAtIGJ1ZmZlclBvc2l0aW9uID49IDQgJiYgYnVmZmVyW2J1ZmZlclBvc2l0aW9uXSA9PT0gb3AuZmlyc3RCeXRlKSB7XG4gICAgICAgICAgICAgICAgLy8gcXVpY2sgY2hlY2sgZmlyc3Qgc2lnbmF0dXJlIGJ5dGVcbiAgICAgICAgICAgICAgICBpZiAoYnVmZmVyLnJlYWRVSW50MzJMRShidWZmZXJQb3NpdGlvbikgPT09IG9wLnNpZykge1xuICAgICAgICAgICAgICAgICAgICBvcC5sYXN0QnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgb3AubGFzdEJ5dGVzUmVhZCA9IGJ5dGVzUmVhZDtcbiAgICAgICAgICAgICAgICAgICAgb3AuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocG9zID09PSBtaW5Qb3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdCYWQgYXJjaGl2ZScpKTtcbiAgICAgICAgfVxuICAgICAgICBvcC5sYXN0UG9zID0gcG9zICsgMTtcbiAgICAgICAgb3AuY2h1bmtTaXplICo9IDI7XG4gICAgICAgIGlmIChwb3MgPD0gbWluUG9zKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignQmFkIGFyY2hpdmUnKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXhwYW5kTGVuZ3RoID0gTWF0aC5taW4ob3AuY2h1bmtTaXplLCBwb3MgLSBtaW5Qb3MpO1xuICAgICAgICBvcC53aW4uZXhwYW5kTGVmdChleHBhbmRMZW5ndGgsIHJlYWRVbnRpbEZvdW5kQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRDZW50cmFsRGlyZWN0b3J5KCkge1xuICAgICAgICBjb25zdCB0b3RhbFJlYWRMZW5ndGggPSBNYXRoLm1pbihjb25zdHMuRU5ESERSICsgY29uc3RzLk1BWEZJTEVDT01NRU5ULCBmaWxlU2l6ZSk7XG4gICAgICAgIG9wID0ge1xuICAgICAgICAgICAgd2luOiBuZXcgRmlsZVdpbmRvd0J1ZmZlcihmZCksXG4gICAgICAgICAgICB0b3RhbFJlYWRMZW5ndGgsXG4gICAgICAgICAgICBtaW5Qb3M6IGZpbGVTaXplIC0gdG90YWxSZWFkTGVuZ3RoLFxuICAgICAgICAgICAgbGFzdFBvczogZmlsZVNpemUsXG4gICAgICAgICAgICBjaHVua1NpemU6IE1hdGgubWluKDEwMjQsIGNodW5rU2l6ZSksXG4gICAgICAgICAgICBmaXJzdEJ5dGU6IGNvbnN0cy5FTkRTSUdGSVJTVCxcbiAgICAgICAgICAgIHNpZzogY29uc3RzLkVORFNJRyxcbiAgICAgICAgICAgIGNvbXBsZXRlOiByZWFkQ2VudHJhbERpcmVjdG9yeUNvbXBsZXRlLFxuICAgICAgICB9O1xuICAgICAgICBvcC53aW4ucmVhZChmaWxlU2l6ZSAtIG9wLmNodW5rU2l6ZSwgb3AuY2h1bmtTaXplLCByZWFkVW50aWxGb3VuZENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkQ2VudHJhbERpcmVjdG9yeUNvbXBsZXRlKCkge1xuICAgICAgICBjb25zdCBidWZmZXIgPSBvcC53aW4uYnVmZmVyO1xuICAgICAgICBjb25zdCBwb3MgPSBvcC5sYXN0QnVmZmVyUG9zaXRpb247XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5ID0gbmV3IENlbnRyYWxEaXJlY3RvcnlIZWFkZXIoKTtcbiAgICAgICAgICAgIGNlbnRyYWxEaXJlY3RvcnkucmVhZChidWZmZXIuc2xpY2UocG9zLCBwb3MgKyBjb25zdHMuRU5ESERSKSk7XG4gICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5LmhlYWRlck9mZnNldCA9IG9wLndpbi5wb3NpdGlvbiArIHBvcztcbiAgICAgICAgICAgIGlmIChjZW50cmFsRGlyZWN0b3J5LmNvbW1lbnRMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmNvbW1lbnQgPSBidWZmZXJcbiAgICAgICAgICAgICAgICAgICAgLnNsaWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zICsgY29uc3RzLkVOREhEUixcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyArIGNvbnN0cy5FTkRIRFIgKyBjZW50cmFsRGlyZWN0b3J5LmNvbW1lbnRMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jb21tZW50ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuZW50cmllc0NvdW50ID0gY2VudHJhbERpcmVjdG9yeS52b2x1bWVFbnRyaWVzO1xuICAgICAgICAgICAgdGhhdC5jZW50cmFsRGlyZWN0b3J5ID0gY2VudHJhbERpcmVjdG9yeTtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAoY2VudHJhbERpcmVjdG9yeS52b2x1bWVFbnRyaWVzID09PSBjb25zdHMuRUZfWklQNjRfT1JfMTYgJiZcbiAgICAgICAgICAgICAgICAgICAgY2VudHJhbERpcmVjdG9yeS50b3RhbEVudHJpZXMgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8xNikgfHxcbiAgICAgICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5LnNpemUgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMiB8fFxuICAgICAgICAgICAgICAgIGNlbnRyYWxEaXJlY3Rvcnkub2Zmc2V0ID09PSBjb25zdHMuRUZfWklQNjRfT1JfMzJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlMb2NhdG9yKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wID0ge307XG4gICAgICAgICAgICAgICAgcmVhZEVudHJpZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGF0LmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlMb2NhdG9yKCkge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBjb25zdHMuRU5ETDY0SERSO1xuICAgICAgICBpZiAob3AubGFzdEJ1ZmZlclBvc2l0aW9uID4gbGVuZ3RoKSB7XG4gICAgICAgICAgICBvcC5sYXN0QnVmZmVyUG9zaXRpb24gLT0gbGVuZ3RoO1xuICAgICAgICAgICAgcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUxvY2F0b3JDb21wbGV0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3AgPSB7XG4gICAgICAgICAgICAgICAgd2luOiBvcC53aW4sXG4gICAgICAgICAgICAgICAgdG90YWxSZWFkTGVuZ3RoOiBsZW5ndGgsXG4gICAgICAgICAgICAgICAgbWluUG9zOiBvcC53aW4ucG9zaXRpb24gLSBsZW5ndGgsXG4gICAgICAgICAgICAgICAgbGFzdFBvczogb3Aud2luLnBvc2l0aW9uLFxuICAgICAgICAgICAgICAgIGNodW5rU2l6ZTogb3AuY2h1bmtTaXplLFxuICAgICAgICAgICAgICAgIGZpcnN0Qnl0ZTogY29uc3RzLkVOREw2NFNJR0ZJUlNULFxuICAgICAgICAgICAgICAgIHNpZzogY29uc3RzLkVOREw2NFNJRyxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUxvY2F0b3JDb21wbGV0ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBvcC53aW4ucmVhZChvcC5sYXN0UG9zIC0gb3AuY2h1bmtTaXplLCBvcC5jaHVua1NpemUsIHJlYWRVbnRpbEZvdW5kQ2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUxvY2F0b3JDb21wbGV0ZSgpIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gb3Aud2luLmJ1ZmZlcjtcbiAgICAgICAgY29uc3QgbG9jSGVhZGVyID0gbmV3IENlbnRyYWxEaXJlY3RvcnlMb2M2NEhlYWRlcigpO1xuICAgICAgICBsb2NIZWFkZXIucmVhZChcbiAgICAgICAgICAgIGJ1ZmZlci5zbGljZShvcC5sYXN0QnVmZmVyUG9zaXRpb24sIG9wLmxhc3RCdWZmZXJQb3NpdGlvbiArIGNvbnN0cy5FTkRMNjRIRFIpXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHJlYWRMZW5ndGggPSBmaWxlU2l6ZSAtIGxvY0hlYWRlci5oZWFkZXJPZmZzZXQ7XG4gICAgICAgIG9wID0ge1xuICAgICAgICAgICAgd2luOiBvcC53aW4sXG4gICAgICAgICAgICB0b3RhbFJlYWRMZW5ndGg6IHJlYWRMZW5ndGgsXG4gICAgICAgICAgICBtaW5Qb3M6IGxvY0hlYWRlci5oZWFkZXJPZmZzZXQsXG4gICAgICAgICAgICBsYXN0UG9zOiBvcC5sYXN0UG9zLFxuICAgICAgICAgICAgY2h1bmtTaXplOiBvcC5jaHVua1NpemUsXG4gICAgICAgICAgICBmaXJzdEJ5dGU6IGNvbnN0cy5FTkQ2NFNJR0ZJUlNULFxuICAgICAgICAgICAgc2lnOiBjb25zdHMuRU5ENjRTSUcsXG4gICAgICAgICAgICBjb21wbGV0ZTogcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUNvbXBsZXRlLFxuICAgICAgICB9O1xuICAgICAgICBvcC53aW4ucmVhZChmaWxlU2l6ZSAtIG9wLmNodW5rU2l6ZSwgb3AuY2h1bmtTaXplLCByZWFkVW50aWxGb3VuZENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkWmlwNjRDZW50cmFsRGlyZWN0b3J5Q29tcGxldGUoKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IG9wLndpbi5idWZmZXI7XG4gICAgICAgIGNvbnN0IHppcDY0Y2QgPSBuZXcgQ2VudHJhbERpcmVjdG9yeVppcDY0SGVhZGVyKCk7XG4gICAgICAgIHppcDY0Y2QucmVhZChidWZmZXIuc2xpY2Uob3AubGFzdEJ1ZmZlclBvc2l0aW9uLCBvcC5sYXN0QnVmZmVyUG9zaXRpb24gKyBjb25zdHMuRU5ENjRIRFIpKTtcbiAgICAgICAgdGhhdC5jZW50cmFsRGlyZWN0b3J5LnZvbHVtZUVudHJpZXMgPSB6aXA2NGNkLnZvbHVtZUVudHJpZXM7XG4gICAgICAgIHRoYXQuY2VudHJhbERpcmVjdG9yeS50b3RhbEVudHJpZXMgPSB6aXA2NGNkLnRvdGFsRW50cmllcztcbiAgICAgICAgdGhhdC5jZW50cmFsRGlyZWN0b3J5LnNpemUgPSB6aXA2NGNkLnNpemU7XG4gICAgICAgIHRoYXQuY2VudHJhbERpcmVjdG9yeS5vZmZzZXQgPSB6aXA2NGNkLm9mZnNldDtcbiAgICAgICAgdGhhdC5lbnRyaWVzQ291bnQgPSB6aXA2NGNkLnZvbHVtZUVudHJpZXM7XG4gICAgICAgIG9wID0ge307XG4gICAgICAgIHJlYWRFbnRyaWVzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZEVudHJpZXMoKSB7XG4gICAgICAgIG9wID0ge1xuICAgICAgICAgICAgd2luOiBuZXcgRmlsZVdpbmRvd0J1ZmZlcihmZCksXG4gICAgICAgICAgICBwb3M6IGNlbnRyYWxEaXJlY3Rvcnkub2Zmc2V0LFxuICAgICAgICAgICAgY2h1bmtTaXplLFxuICAgICAgICAgICAgZW50cmllc0xlZnQ6IGNlbnRyYWxEaXJlY3Rvcnkudm9sdW1lRW50cmllcyxcbiAgICAgICAgfTtcbiAgICAgICAgb3Aud2luLnJlYWQob3AucG9zLCBNYXRoLm1pbihjaHVua1NpemUsIGZpbGVTaXplIC0gb3AucG9zKSwgcmVhZEVudHJpZXNDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZEVudHJpZXNDYWxsYmFjayhlcnIsIGJ5dGVzUmVhZCkge1xuICAgICAgICBpZiAoZXJyIHx8ICFieXRlc1JlYWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmVtaXQoJ2Vycm9yJywgZXJyIHx8IG5ldyBFcnJvcignRW50cmllcyByZWFkIGVycm9yJykpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBidWZmZXJQb3MgPSBvcC5wb3MgLSBvcC53aW4ucG9zaXRpb247XG4gICAgICAgIGxldCBlbnRyeSA9IG9wLmVudHJ5O1xuICAgICAgICBjb25zdCBidWZmZXIgPSBvcC53aW4uYnVmZmVyO1xuICAgICAgICBjb25zdCBidWZmZXJMZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgd2hpbGUgKG9wLmVudHJpZXNMZWZ0ID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghZW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cnkgPSBuZXcgWmlwRW50cnkoKTtcbiAgICAgICAgICAgICAgICAgICAgZW50cnkucmVhZEhlYWRlcihidWZmZXIsIGJ1ZmZlclBvcyk7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5LmhlYWRlck9mZnNldCA9IG9wLndpbi5wb3NpdGlvbiArIGJ1ZmZlclBvcztcbiAgICAgICAgICAgICAgICAgICAgb3AuZW50cnkgPSBlbnRyeTtcbiAgICAgICAgICAgICAgICAgICAgb3AucG9zICs9IGNvbnN0cy5DRU5IRFI7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlclBvcyArPSBjb25zdHMuQ0VOSERSO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBlbnRyeUhlYWRlclNpemUgPSBlbnRyeS5mbmFtZUxlbiArIGVudHJ5LmV4dHJhTGVuICsgZW50cnkuY29tTGVuO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFkdmFuY2VCeXRlcyA9IGVudHJ5SGVhZGVyU2l6ZSArIChvcC5lbnRyaWVzTGVmdCA+IDEgPyBjb25zdHMuQ0VOSERSIDogMCk7XG4gICAgICAgICAgICAgICAgaWYgKGJ1ZmZlckxlbmd0aCAtIGJ1ZmZlclBvcyA8IGFkdmFuY2VCeXRlcykge1xuICAgICAgICAgICAgICAgICAgICBvcC53aW4ubW92ZVJpZ2h0KGNodW5rU2l6ZSwgcmVhZEVudHJpZXNDYWxsYmFjaywgYnVmZmVyUG9zKTtcbiAgICAgICAgICAgICAgICAgICAgb3AubW92ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZW50cnkucmVhZChidWZmZXIsIGJ1ZmZlclBvcywgdGV4dERlY29kZXIpO1xuICAgICAgICAgICAgICAgIGlmICghY29uZmlnLnNraXBFbnRyeU5hbWVWYWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5LnZhbGlkYXRlTmFtZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZW50cmllcykge1xuICAgICAgICAgICAgICAgICAgICBlbnRyaWVzW2VudHJ5Lm5hbWVdID0gZW50cnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoYXQuZW1pdCgnZW50cnknLCBlbnRyeSk7XG4gICAgICAgICAgICAgICAgb3AuZW50cnkgPSBlbnRyeSA9IG51bGw7XG4gICAgICAgICAgICAgICAgb3AuZW50cmllc0xlZnQtLTtcbiAgICAgICAgICAgICAgICBvcC5wb3MgKz0gZW50cnlIZWFkZXJTaXplO1xuICAgICAgICAgICAgICAgIGJ1ZmZlclBvcyArPSBlbnRyeUhlYWRlclNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGF0LmVtaXQoJ3JlYWR5Jyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhhdC5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja0VudHJpZXNFeGlzdCgpIHtcbiAgICAgICAgaWYgKCFlbnRyaWVzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0b3JlRW50cmllcyBkaXNhYmxlZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdyZWFkeScsIHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlYWR5O1xuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5lbnRyeSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGNoZWNrRW50cmllc0V4aXN0KCk7XG4gICAgICAgIHJldHVybiBlbnRyaWVzW25hbWVdO1xuICAgIH07XG5cbiAgICB0aGlzLmVudHJpZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoZWNrRW50cmllc0V4aXN0KCk7XG4gICAgICAgIHJldHVybiBlbnRyaWVzO1xuICAgIH07XG5cbiAgICB0aGlzLnN0cmVhbSA9IGZ1bmN0aW9uIChlbnRyeSwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3BlbkVudHJ5KFxuICAgICAgICAgICAgZW50cnksXG4gICAgICAgICAgICAoZXJyLCBlbnRyeSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IGRhdGFPZmZzZXQoZW50cnkpO1xuICAgICAgICAgICAgICAgIGxldCBlbnRyeVN0cmVhbSA9IG5ldyBFbnRyeURhdGFSZWFkZXJTdHJlYW0oZmQsIG9mZnNldCwgZW50cnkuY29tcHJlc3NlZFNpemUpO1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5tZXRob2QgPT09IGNvbnN0cy5TVE9SRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZyB0byBkb1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkubWV0aG9kID09PSBjb25zdHMuREVGTEFURUQpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cnlTdHJlYW0gPSBlbnRyeVN0cmVhbS5waXBlKHpsaWIuY3JlYXRlSW5mbGF0ZVJhdygpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdVbmtub3duIGNvbXByZXNzaW9uIG1ldGhvZDogJyArIGVudHJ5Lm1ldGhvZCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2FuVmVyaWZ5Q3JjKGVudHJ5KSkge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeVN0cmVhbSA9IGVudHJ5U3RyZWFtLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRW50cnlWZXJpZnlTdHJlYW0oZW50cnlTdHJlYW0sIGVudHJ5LmNyYywgZW50cnkuc2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZW50cnlTdHJlYW0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHRoaXMuZW50cnlEYXRhU3luYyA9IGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICBsZXQgZXJyID0gbnVsbDtcbiAgICAgICAgdGhpcy5vcGVuRW50cnkoXG4gICAgICAgICAgICBlbnRyeSxcbiAgICAgICAgICAgIChlLCBlbikgPT4ge1xuICAgICAgICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgICAgICAgICAgZW50cnkgPSBlbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YSA9IEJ1ZmZlci5hbGxvYyhlbnRyeS5jb21wcmVzc2VkU2l6ZSk7XG4gICAgICAgIG5ldyBGc1JlYWQoZmQsIGRhdGEsIDAsIGVudHJ5LmNvbXByZXNzZWRTaXplLCBkYXRhT2Zmc2V0KGVudHJ5KSwgKGUpID0+IHtcbiAgICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgIH0pLnJlYWQodHJ1ZSk7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW50cnkubWV0aG9kID09PSBjb25zdHMuU1RPUkVEKSB7XG4gICAgICAgICAgICAvLyBub3RoaW5nIHRvIGRvXG4gICAgICAgIH0gZWxzZSBpZiAoZW50cnkubWV0aG9kID09PSBjb25zdHMuREVGTEFURUQgfHwgZW50cnkubWV0aG9kID09PSBjb25zdHMuRU5IQU5DRURfREVGTEFURUQpIHtcbiAgICAgICAgICAgIGRhdGEgPSB6bGliLmluZmxhdGVSYXdTeW5jKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGNvbXByZXNzaW9uIG1ldGhvZDogJyArIGVudHJ5Lm1ldGhvZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoICE9PSBlbnRyeS5zaXplKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2l6ZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYW5WZXJpZnlDcmMoZW50cnkpKSB7XG4gICAgICAgICAgICBjb25zdCB2ZXJpZnkgPSBuZXcgQ3JjVmVyaWZ5KGVudHJ5LmNyYywgZW50cnkuc2l6ZSk7XG4gICAgICAgICAgICB2ZXJpZnkuZGF0YShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9O1xuXG4gICAgdGhpcy5vcGVuRW50cnkgPSBmdW5jdGlvbiAoZW50cnksIGNhbGxiYWNrLCBzeW5jKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZW50cnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjaGVja0VudHJpZXNFeGlzdCgpO1xuICAgICAgICAgICAgZW50cnkgPSBlbnRyaWVzW2VudHJ5XTtcbiAgICAgICAgICAgIGlmICghZW50cnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdFbnRyeSBub3QgZm91bmQnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbnRyeS5pc0ZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ0VudHJ5IGlzIG5vdCBmaWxlJykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZmQpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ0FyY2hpdmUgY2xvc2VkJykpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhjb25zdHMuTE9DSERSKTtcbiAgICAgICAgbmV3IEZzUmVhZChmZCwgYnVmZmVyLCAwLCBidWZmZXIubGVuZ3RoLCBlbnRyeS5vZmZzZXQsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCByZWFkRXg7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGVudHJ5LnJlYWREYXRhSGVhZGVyKGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LmVuY3J5cHRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZWFkRXggPSBuZXcgRXJyb3IoJ0VudHJ5IGVuY3J5cHRlZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgcmVhZEV4ID0gZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjayhyZWFkRXgsIGVudHJ5KTtcbiAgICAgICAgfSkucmVhZChzeW5jKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZGF0YU9mZnNldChlbnRyeSkge1xuICAgICAgICByZXR1cm4gZW50cnkub2Zmc2V0ICsgY29uc3RzLkxPQ0hEUiArIGVudHJ5LmZuYW1lTGVuICsgZW50cnkuZXh0cmFMZW47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuVmVyaWZ5Q3JjKGVudHJ5KSB7XG4gICAgICAgIC8vIGlmIGJpdCAzICgweDA4KSBvZiB0aGUgZ2VuZXJhbC1wdXJwb3NlIGZsYWdzIGZpZWxkIGlzIHNldCwgdGhlbiB0aGUgQ1JDLTMyIGFuZCBmaWxlIHNpemVzIGFyZSBub3Qga25vd24gd2hlbiB0aGUgaGVhZGVyIGlzIHdyaXR0ZW5cbiAgICAgICAgcmV0dXJuIChlbnRyeS5mbGFncyAmIDB4OCkgIT09IDB4ODtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRyYWN0KGVudHJ5LCBvdXRQYXRoLCBjYWxsYmFjaykge1xuICAgICAgICB0aGF0LnN0cmVhbShlbnRyeSwgKGVyciwgc3RtKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGZzU3RtLCBlcnJUaHJvd247XG4gICAgICAgICAgICAgICAgc3RtLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyVGhyb3duID0gZXJyO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZnNTdG0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0bS51bnBpcGUoZnNTdG0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnNTdG0uY2xvc2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZzLm9wZW4ob3V0UGF0aCwgJ3cnLCAoZXJyLCBmZEZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyclRocm93bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnMuY2xvc2UoZmQsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnJUaHJvd24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZnNTdG0gPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShvdXRQYXRoLCB7IGZkOiBmZEZpbGUgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZzU3RtLm9uKCdmaW5pc2gnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmVtaXQoJ2V4dHJhY3QnLCBlbnRyeSwgb3V0UGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVyclRocm93bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdG0ucGlwZShmc1N0bSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZURpcmVjdG9yaWVzKGJhc2VEaXIsIGRpcnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghZGlycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkaXIgPSBkaXJzLnNoaWZ0KCk7XG4gICAgICAgIGRpciA9IHBhdGguam9pbihiYXNlRGlyLCBwYXRoLmpvaW4oLi4uZGlyKSk7XG4gICAgICAgIGZzLm1rZGlyKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVyciAmJiBlcnIuY29kZSAhPT0gJ0VFWElTVCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNyZWF0ZURpcmVjdG9yaWVzKGJhc2VEaXIsIGRpcnMsIGNhbGxiYWNrKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0cmFjdEZpbGVzKGJhc2VEaXIsIGJhc2VSZWxQYXRoLCBmaWxlcywgY2FsbGJhY2ssIGV4dHJhY3RlZENvdW50KSB7XG4gICAgICAgIGlmICghZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgZXh0cmFjdGVkQ291bnQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpbGUgPSBmaWxlcy5zaGlmdCgpO1xuICAgICAgICBjb25zdCB0YXJnZXRQYXRoID0gcGF0aC5qb2luKGJhc2VEaXIsIGZpbGUubmFtZS5yZXBsYWNlKGJhc2VSZWxQYXRoLCAnJykpO1xuICAgICAgICBleHRyYWN0KGZpbGUsIHRhcmdldFBhdGgsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCBleHRyYWN0ZWRDb3VudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBleHRyYWN0RmlsZXMoYmFzZURpciwgYmFzZVJlbFBhdGgsIGZpbGVzLCBjYWxsYmFjaywgZXh0cmFjdGVkQ291bnQgKyAxKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5leHRyYWN0ID0gZnVuY3Rpb24gKGVudHJ5LCBvdXRQYXRoLCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgZW50cnlOYW1lID0gZW50cnkgfHwgJyc7XG4gICAgICAgIGlmICh0eXBlb2YgZW50cnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBlbnRyeSA9IHRoaXMuZW50cnkoZW50cnkpO1xuICAgICAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgZW50cnlOYW1lID0gZW50cnkubmFtZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5TmFtZS5sZW5ndGggJiYgZW50cnlOYW1lW2VudHJ5TmFtZS5sZW5ndGggLSAxXSAhPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5TmFtZSArPSAnLyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghZW50cnkgfHwgZW50cnkuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzID0gW10sXG4gICAgICAgICAgICAgICAgZGlycyA9IFtdLFxuICAgICAgICAgICAgICAgIGFsbERpcnMgPSB7fTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZSBpbiBlbnRyaWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZW50cmllcywgZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgZS5sYXN0SW5kZXhPZihlbnRyeU5hbWUsIDApID09PSAwXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZWxQYXRoID0gZS5yZXBsYWNlKGVudHJ5TmFtZSwgJycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEVudHJ5ID0gZW50cmllc1tlXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkRW50cnkuaXNGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGNoaWxkRW50cnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVsUGF0aCA9IHBhdGguZGlybmFtZShyZWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVsUGF0aCAmJiAhYWxsRGlyc1tyZWxQYXRoXSAmJiByZWxQYXRoICE9PSAnLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbERpcnNbcmVsUGF0aF0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnRzID0gcmVsUGF0aC5zcGxpdCgnLycpLmZpbHRlcigoZikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlycy5wdXNoKHBhcnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHMgPSBwYXJ0cy5zbGljZSgwLCBwYXJ0cy5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0c1BhdGggPSBwYXJ0cy5qb2luKCcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbERpcnNbcGFydHNQYXRoXSB8fCBwYXJ0c1BhdGggPT09ICcuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsRGlyc1twYXJ0c1BhdGhdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJzLnB1c2gocGFydHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlycy5zb3J0KCh4LCB5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHgubGVuZ3RoIC0geS5sZW5ndGg7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChkaXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZURpcmVjdG9yaWVzKG91dFBhdGgsIGRpcnMsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3RGaWxlcyhvdXRQYXRoLCBlbnRyeU5hbWUsIGZpbGVzLCBjYWxsYmFjaywgMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXh0cmFjdEZpbGVzKG91dFBhdGgsIGVudHJ5TmFtZSwgZmlsZXMsIGNhbGxiYWNrLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZzLnN0YXQob3V0UGF0aCwgKGVyciwgc3RhdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ICYmIHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICBleHRyYWN0KGVudHJ5LCBwYXRoLmpvaW4ob3V0UGF0aCwgcGF0aC5iYXNlbmFtZShlbnRyeS5uYW1lKSksIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBleHRyYWN0KGVudHJ5LCBvdXRQYXRoLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5jbG9zZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICBpZiAoY2xvc2VkIHx8ICFmZCkge1xuICAgICAgICAgICAgY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbG9zZWQgPSB0cnVlO1xuICAgICAgICAgICAgZnMuY2xvc2UoZmQsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBmZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb3JpZ2luYWxFbWl0ID0gZXZlbnRzLkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdDtcbiAgICB0aGlzLmVtaXQgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpZiAoIWNsb3NlZCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsRW1pdC5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cblN0cmVhbVppcC5zZXRGcyA9IGZ1bmN0aW9uIChjdXN0b21Gcykge1xuICAgIGZzID0gY3VzdG9tRnM7XG59O1xuXG5TdHJlYW1aaXAuZGVidWdMb2cgPSAoLi4uYXJncykgPT4ge1xuICAgIGlmIChTdHJlYW1aaXAuZGVidWcpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5sb2coLi4uYXJncyk7XG4gICAgfVxufTtcblxudXRpbC5pbmhlcml0cyhTdHJlYW1aaXAsIGV2ZW50cy5FdmVudEVtaXR0ZXIpO1xuXG5jb25zdCBwcm9wWmlwID0gU3ltYm9sKCd6aXAnKTtcblxuU3RyZWFtWmlwLmFzeW5jID0gY2xhc3MgU3RyZWFtWmlwQXN5bmMgZXh0ZW5kcyBldmVudHMuRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBjb25zdCB6aXAgPSBuZXcgU3RyZWFtWmlwKGNvbmZpZyk7XG5cbiAgICAgICAgemlwLm9uKCdlbnRyeScsIChlbnRyeSkgPT4gdGhpcy5lbWl0KCdlbnRyeScsIGVudHJ5KSk7XG4gICAgICAgIHppcC5vbignZXh0cmFjdCcsIChlbnRyeSwgb3V0UGF0aCkgPT4gdGhpcy5lbWl0KCdleHRyYWN0JywgZW50cnksIG91dFBhdGgpKTtcblxuICAgICAgICB0aGlzW3Byb3BaaXBdID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemlwLm9uKCdyZWFkeScsICgpID0+IHtcbiAgICAgICAgICAgICAgICB6aXAucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHppcCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHppcC5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgZW50cmllc0NvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpc1twcm9wWmlwXS50aGVuKCh6aXApID0+IHppcC5lbnRyaWVzQ291bnQpO1xuICAgIH1cblxuICAgIGdldCBjb21tZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpc1twcm9wWmlwXS50aGVuKCh6aXApID0+IHppcC5jb21tZW50KTtcbiAgICB9XG5cbiAgICBhc3luYyBlbnRyeShuYW1lKSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiB6aXAuZW50cnkobmFtZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZW50cmllcygpIHtcbiAgICAgICAgY29uc3QgemlwID0gYXdhaXQgdGhpc1twcm9wWmlwXTtcbiAgICAgICAgcmV0dXJuIHppcC5lbnRyaWVzKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgc3RyZWFtKGVudHJ5KSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6aXAuc3RyZWFtKGVudHJ5LCAoZXJyLCBzdG0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZW50cnlEYXRhKGVudHJ5KSB7XG4gICAgICAgIGNvbnN0IHN0bSA9IGF3YWl0IHRoaXMuc3RyZWFtKGVudHJ5KTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBbXTtcbiAgICAgICAgICAgIHN0bS5vbignZGF0YScsIChjaHVuaykgPT4gZGF0YS5wdXNoKGNodW5rKSk7XG4gICAgICAgICAgICBzdG0ub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKEJ1ZmZlci5jb25jYXQoZGF0YSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdG0ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHN0bS5yZW1vdmVBbGxMaXN0ZW5lcnMoJ2VuZCcpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGV4dHJhY3QoZW50cnksIG91dFBhdGgpIHtcbiAgICAgICAgY29uc3QgemlwID0gYXdhaXQgdGhpc1twcm9wWmlwXTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHppcC5leHRyYWN0KGVudHJ5LCBvdXRQYXRoLCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgY2xvc2UoKSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6aXAuY2xvc2UoKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5jbGFzcyBDZW50cmFsRGlyZWN0b3J5SGVhZGVyIHtcbiAgICByZWFkKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoICE9PSBjb25zdHMuRU5ESERSIHx8IGRhdGEucmVhZFVJbnQzMkxFKDApICE9PSBjb25zdHMuRU5EU0lHKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY2VudHJhbCBkaXJlY3RvcnknKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBudW1iZXIgb2YgZW50cmllcyBvbiB0aGlzIHZvbHVtZVxuICAgICAgICB0aGlzLnZvbHVtZUVudHJpZXMgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuRU5EU1VCKTtcbiAgICAgICAgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXNcbiAgICAgICAgdGhpcy50b3RhbEVudHJpZXMgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuRU5EVE9UKTtcbiAgICAgICAgLy8gY2VudHJhbCBkaXJlY3Rvcnkgc2l6ZSBpbiBieXRlc1xuICAgICAgICB0aGlzLnNpemUgPSBkYXRhLnJlYWRVSW50MzJMRShjb25zdHMuRU5EU0laKTtcbiAgICAgICAgLy8gb2Zmc2V0IG9mIGZpcnN0IENFTiBoZWFkZXJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBkYXRhLnJlYWRVSW50MzJMRShjb25zdHMuRU5ET0ZGKTtcbiAgICAgICAgLy8gemlwIGZpbGUgY29tbWVudCBsZW5ndGhcbiAgICAgICAgdGhpcy5jb21tZW50TGVuZ3RoID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkVORENPTSk7XG4gICAgfVxufVxuXG5jbGFzcyBDZW50cmFsRGlyZWN0b3J5TG9jNjRIZWFkZXIge1xuICAgIHJlYWQoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5sZW5ndGggIT09IGNvbnN0cy5FTkRMNjRIRFIgfHwgZGF0YS5yZWFkVUludDMyTEUoMCkgIT09IGNvbnN0cy5FTkRMNjRTSUcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB6aXA2NCBjZW50cmFsIGRpcmVjdG9yeSBsb2NhdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gWklQNjQgRU9DRCBoZWFkZXIgb2Zmc2V0XG4gICAgICAgIHRoaXMuaGVhZGVyT2Zmc2V0ID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkRTVUIpO1xuICAgIH1cbn1cblxuY2xhc3MgQ2VudHJhbERpcmVjdG9yeVppcDY0SGVhZGVyIHtcbiAgICByZWFkKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoICE9PSBjb25zdHMuRU5ENjRIRFIgfHwgZGF0YS5yZWFkVUludDMyTEUoMCkgIT09IGNvbnN0cy5FTkQ2NFNJRykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNlbnRyYWwgZGlyZWN0b3J5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbnVtYmVyIG9mIGVudHJpZXMgb24gdGhpcyB2b2x1bWVcbiAgICAgICAgdGhpcy52b2x1bWVFbnRyaWVzID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkQ2NFNVQik7XG4gICAgICAgIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzXG4gICAgICAgIHRoaXMudG90YWxFbnRyaWVzID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkQ2NFRPVCk7XG4gICAgICAgIC8vIGNlbnRyYWwgZGlyZWN0b3J5IHNpemUgaW4gYnl0ZXNcbiAgICAgICAgdGhpcy5zaXplID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkQ2NFNJWik7XG4gICAgICAgIC8vIG9mZnNldCBvZiBmaXJzdCBDRU4gaGVhZGVyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gcmVhZFVJbnQ2NExFKGRhdGEsIGNvbnN0cy5FTkQ2NE9GRik7XG4gICAgfVxufVxuXG5jbGFzcyBaaXBFbnRyeSB7XG4gICAgcmVhZEhlYWRlcihkYXRhLCBvZmZzZXQpIHtcbiAgICAgICAgLy8gZGF0YSBzaG91bGQgYmUgNDYgYnl0ZXMgYW5kIHN0YXJ0IHdpdGggXCJQSyAwMSAwMlwiXG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCA8IG9mZnNldCArIGNvbnN0cy5DRU5IRFIgfHwgZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0KSAhPT0gY29uc3RzLkNFTlNJRykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGVudHJ5IGhlYWRlcicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHZlcnNpb24gbWFkZSBieVxuICAgICAgICB0aGlzLnZlck1hZGUgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOVkVNKTtcbiAgICAgICAgLy8gdmVyc2lvbiBuZWVkZWQgdG8gZXh0cmFjdFxuICAgICAgICB0aGlzLnZlcnNpb24gPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOVkVSKTtcbiAgICAgICAgLy8gZW5jcnlwdCwgZGVjcnlwdCBmbGFnc1xuICAgICAgICB0aGlzLmZsYWdzID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkZMRyk7XG4gICAgICAgIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICAgICAgICB0aGlzLm1ldGhvZCA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5IT1cpO1xuICAgICAgICAvLyBtb2RpZmljYXRpb24gdGltZSAoMiBieXRlcyB0aW1lLCAyIGJ5dGVzIGRhdGUpXG4gICAgICAgIGNvbnN0IHRpbWVieXRlcyA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5USU0pO1xuICAgICAgICBjb25zdCBkYXRlYnl0ZXMgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOVElNICsgMik7XG4gICAgICAgIHRoaXMudGltZSA9IHBhcnNlWmlwVGltZSh0aW1lYnl0ZXMsIGRhdGVieXRlcyk7XG5cbiAgICAgICAgLy8gdW5jb21wcmVzc2VkIGZpbGUgY3JjLTMyIHZhbHVlXG4gICAgICAgIHRoaXMuY3JjID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0ICsgY29uc3RzLkNFTkNSQyk7XG4gICAgICAgIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgICAgICB0aGlzLmNvbXByZXNzZWRTaXplID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0ICsgY29uc3RzLkNFTlNJWik7XG4gICAgICAgIC8vIHVuY29tcHJlc3NlZCBzaXplXG4gICAgICAgIHRoaXMuc2l6ZSA9IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCArIGNvbnN0cy5DRU5MRU4pO1xuICAgICAgICAvLyBmaWxlbmFtZSBsZW5ndGhcbiAgICAgICAgdGhpcy5mbmFtZUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5OQU0pO1xuICAgICAgICAvLyBleHRyYSBmaWVsZCBsZW5ndGhcbiAgICAgICAgdGhpcy5leHRyYUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5FWFQpO1xuICAgICAgICAvLyBmaWxlIGNvbW1lbnQgbGVuZ3RoXG4gICAgICAgIHRoaXMuY29tTGVuID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkNPTSk7XG4gICAgICAgIC8vIHZvbHVtZSBudW1iZXIgc3RhcnRcbiAgICAgICAgdGhpcy5kaXNrU3RhcnQgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VORFNLKTtcbiAgICAgICAgLy8gaW50ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXG4gICAgICAgIHRoaXMuaW5hdHRyID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkFUVCk7XG4gICAgICAgIC8vIGV4dGVybmFsIGZpbGUgYXR0cmlidXRlc1xuICAgICAgICB0aGlzLmF0dHIgPSBkYXRhLnJlYWRVSW50MzJMRShvZmZzZXQgKyBjb25zdHMuQ0VOQVRYKTtcbiAgICAgICAgLy8gTE9DIGhlYWRlciBvZmZzZXRcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBkYXRhLnJlYWRVSW50MzJMRShvZmZzZXQgKyBjb25zdHMuQ0VOT0ZGKTtcbiAgICB9XG5cbiAgICByZWFkRGF0YUhlYWRlcihkYXRhKSB7XG4gICAgICAgIC8vIDMwIGJ5dGVzIGFuZCBzaG91bGQgc3RhcnQgd2l0aCBcIlBLXFwwMDNcXDAwNFwiXG4gICAgICAgIGlmIChkYXRhLnJlYWRVSW50MzJMRSgwKSAhPT0gY29uc3RzLkxPQ1NJRykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGxvY2FsIGhlYWRlcicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ1ZFUik7XG4gICAgICAgIC8vIGdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZ1xuICAgICAgICB0aGlzLmZsYWdzID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ0ZMRyk7XG4gICAgICAgIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICAgICAgICB0aGlzLm1ldGhvZCA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NIT1cpO1xuICAgICAgICAvLyBtb2RpZmljYXRpb24gdGltZSAoMiBieXRlcyB0aW1lIDsgMiBieXRlcyBkYXRlKVxuICAgICAgICBjb25zdCB0aW1lYnl0ZXMgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuTE9DVElNKTtcbiAgICAgICAgY29uc3QgZGF0ZWJ5dGVzID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ1RJTSArIDIpO1xuICAgICAgICB0aGlzLnRpbWUgPSBwYXJzZVppcFRpbWUodGltZWJ5dGVzLCBkYXRlYnl0ZXMpO1xuXG4gICAgICAgIC8vIHVuY29tcHJlc3NlZCBmaWxlIGNyYy0zMiB2YWx1ZVxuICAgICAgICB0aGlzLmNyYyA9IGRhdGEucmVhZFVJbnQzMkxFKGNvbnN0cy5MT0NDUkMpIHx8IHRoaXMuY3JjO1xuICAgICAgICAvLyBjb21wcmVzc2VkIHNpemVcbiAgICAgICAgY29uc3QgY29tcHJlc3NlZFNpemUgPSBkYXRhLnJlYWRVSW50MzJMRShjb25zdHMuTE9DU0laKTtcbiAgICAgICAgaWYgKGNvbXByZXNzZWRTaXplICYmIGNvbXByZXNzZWRTaXplICE9PSBjb25zdHMuRUZfWklQNjRfT1JfMzIpIHtcbiAgICAgICAgICAgIHRoaXMuY29tcHJlc3NlZFNpemUgPSBjb21wcmVzc2VkU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuICAgICAgICBjb25zdCBzaXplID0gZGF0YS5yZWFkVUludDMyTEUoY29uc3RzLkxPQ0xFTik7XG4gICAgICAgIGlmIChzaXplICYmIHNpemUgIT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMikge1xuICAgICAgICAgICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBmaWxlbmFtZSBsZW5ndGhcbiAgICAgICAgdGhpcy5mbmFtZUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NOQU0pO1xuICAgICAgICAvLyBleHRyYSBmaWVsZCBsZW5ndGhcbiAgICAgICAgdGhpcy5leHRyYUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NFWFQpO1xuICAgIH1cblxuICAgIHJlYWQoZGF0YSwgb2Zmc2V0LCB0ZXh0RGVjb2Rlcikge1xuICAgICAgICBjb25zdCBuYW1lRGF0YSA9IGRhdGEuc2xpY2Uob2Zmc2V0LCAob2Zmc2V0ICs9IHRoaXMuZm5hbWVMZW4pKTtcbiAgICAgICAgdGhpcy5uYW1lID0gdGV4dERlY29kZXJcbiAgICAgICAgICAgID8gdGV4dERlY29kZXIuZGVjb2RlKG5ldyBVaW50OEFycmF5KG5hbWVEYXRhKSlcbiAgICAgICAgICAgIDogbmFtZURhdGEudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgY29uc3QgbGFzdENoYXIgPSBkYXRhW29mZnNldCAtIDFdO1xuICAgICAgICB0aGlzLmlzRGlyZWN0b3J5ID0gbGFzdENoYXIgPT09IDQ3IHx8IGxhc3RDaGFyID09PSA5MjtcblxuICAgICAgICBpZiAodGhpcy5leHRyYUxlbikge1xuICAgICAgICAgICAgdGhpcy5yZWFkRXh0cmEoZGF0YSwgb2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSB0aGlzLmV4dHJhTGVuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29tbWVudCA9IHRoaXMuY29tTGVuID8gZGF0YS5zbGljZShvZmZzZXQsIG9mZnNldCArIHRoaXMuY29tTGVuKS50b1N0cmluZygpIDogbnVsbDtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZU5hbWUoKSB7XG4gICAgICAgIGlmICgvXFxcXHxeXFx3Kzp8XlxcL3woXnxcXC8pXFwuXFwuKFxcL3wkKS8udGVzdCh0aGlzLm5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01hbGljaW91cyBlbnRyeTogJyArIHRoaXMubmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkRXh0cmEoZGF0YSwgb2Zmc2V0KSB7XG4gICAgICAgIGxldCBzaWduYXR1cmUsIHNpemU7XG4gICAgICAgIGNvbnN0IG1heFBvcyA9IG9mZnNldCArIHRoaXMuZXh0cmFMZW47XG4gICAgICAgIHdoaWxlIChvZmZzZXQgPCBtYXhQb3MpIHtcbiAgICAgICAgICAgIHNpZ25hdHVyZSA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gMjtcbiAgICAgICAgICAgIHNpemUgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICAgICAgICBpZiAoY29uc3RzLklEX1pJUDY0ID09PSBzaWduYXR1cmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlWmlwNjRFeHRyYShkYXRhLCBvZmZzZXQsIHNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ICs9IHNpemU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwYXJzZVppcDY0RXh0cmEoZGF0YSwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgICAgICAgaWYgKGxlbmd0aCA+PSA4ICYmIHRoaXMuc2l6ZSA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzMyKSB7XG4gICAgICAgICAgICB0aGlzLnNpemUgPSByZWFkVUludDY0TEUoZGF0YSwgb2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSA4O1xuICAgICAgICAgICAgbGVuZ3RoIC09IDg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA+PSA4ICYmIHRoaXMuY29tcHJlc3NlZFNpemUgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMikge1xuICAgICAgICAgICAgdGhpcy5jb21wcmVzc2VkU2l6ZSA9IHJlYWRVSW50NjRMRShkYXRhLCBvZmZzZXQpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDg7XG4gICAgICAgICAgICBsZW5ndGggLT0gODtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoID49IDggJiYgdGhpcy5vZmZzZXQgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMikge1xuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSByZWFkVUludDY0TEUoZGF0YSwgb2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSA4O1xuICAgICAgICAgICAgbGVuZ3RoIC09IDg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA+PSA0ICYmIHRoaXMuZGlza1N0YXJ0ID09PSBjb25zdHMuRUZfWklQNjRfT1JfMTYpIHtcbiAgICAgICAgICAgIHRoaXMuZGlza1N0YXJ0ID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0KTtcbiAgICAgICAgICAgIC8vIG9mZnNldCArPSA0OyBsZW5ndGggLT0gNDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBlbmNyeXB0ZWQoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5mbGFncyAmIGNvbnN0cy5GTEdfRU5UUllfRU5DKSA9PT0gY29uc3RzLkZMR19FTlRSWV9FTkM7XG4gICAgfVxuXG4gICAgZ2V0IGlzRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzRGlyZWN0b3J5O1xuICAgIH1cbn1cblxuY2xhc3MgRnNSZWFkIHtcbiAgICBjb25zdHJ1Y3RvcihmZCwgYnVmZmVyLCBvZmZzZXQsIGxlbmd0aCwgcG9zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuZmQgPSBmZDtcbiAgICAgICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuYnl0ZXNSZWFkID0gMDtcbiAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmVhZChzeW5jKSB7XG4gICAgICAgIFN0cmVhbVppcC5kZWJ1Z0xvZygncmVhZCcsIHRoaXMucG9zaXRpb24sIHRoaXMuYnl0ZXNSZWFkLCB0aGlzLmxlbmd0aCwgdGhpcy5vZmZzZXQpO1xuICAgICAgICB0aGlzLndhaXRpbmcgPSB0cnVlO1xuICAgICAgICBsZXQgZXJyO1xuICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgbGV0IGJ5dGVzUmVhZCA9IDA7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGJ5dGVzUmVhZCA9IGZzLnJlYWRTeW5jKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZkLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXQgKyB0aGlzLmJ5dGVzUmVhZCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZW5ndGggLSB0aGlzLmJ5dGVzUmVhZCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArIHRoaXMuYnl0ZXNSZWFkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBlcnIgPSBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yZWFkQ2FsbGJhY2soc3luYywgZXJyLCBlcnIgPyBieXRlc1JlYWQgOiBudWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZzLnJlYWQoXG4gICAgICAgICAgICAgICAgdGhpcy5mZCxcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcixcbiAgICAgICAgICAgICAgICB0aGlzLm9mZnNldCArIHRoaXMuYnl0ZXNSZWFkLFxuICAgICAgICAgICAgICAgIHRoaXMubGVuZ3RoIC0gdGhpcy5ieXRlc1JlYWQsXG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArIHRoaXMuYnl0ZXNSZWFkLFxuICAgICAgICAgICAgICAgIHRoaXMucmVhZENhbGxiYWNrLmJpbmQodGhpcywgc3luYylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkQ2FsbGJhY2soc3luYywgZXJyLCBieXRlc1JlYWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBieXRlc1JlYWQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aGlzLmJ5dGVzUmVhZCArPSBieXRlc1JlYWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVyciB8fCAhYnl0ZXNSZWFkIHx8IHRoaXMuYnl0ZXNSZWFkID09PSB0aGlzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhlcnIsIHRoaXMuYnl0ZXNSZWFkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVhZChzeW5jKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgRmlsZVdpbmRvd0J1ZmZlciB7XG4gICAgY29uc3RydWN0b3IoZmQpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmFsbG9jKDApO1xuICAgICAgICB0aGlzLmZkID0gZmQ7XG4gICAgICAgIHRoaXMuZnNPcCA9IG51bGw7XG4gICAgfVxuXG4gICAgY2hlY2tPcCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZnNPcCAmJiB0aGlzLmZzT3Aud2FpdGluZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPcGVyYXRpb24gaW4gcHJvZ3Jlc3MnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlYWQocG9zLCBsZW5ndGgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY2hlY2tPcCgpO1xuICAgICAgICBpZiAodGhpcy5idWZmZXIubGVuZ3RoIDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhsZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3M7XG4gICAgICAgIHRoaXMuZnNPcCA9IG5ldyBGc1JlYWQodGhpcy5mZCwgdGhpcy5idWZmZXIsIDAsIGxlbmd0aCwgdGhpcy5wb3NpdGlvbiwgY2FsbGJhY2spLnJlYWQoKTtcbiAgICB9XG5cbiAgICBleHBhbmRMZWZ0KGxlbmd0aCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jaGVja09wKCk7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmNvbmNhdChbQnVmZmVyLmFsbG9jKGxlbmd0aCksIHRoaXMuYnVmZmVyXSk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gLT0gbGVuZ3RoO1xuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbiA8IDApIHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZnNPcCA9IG5ldyBGc1JlYWQodGhpcy5mZCwgdGhpcy5idWZmZXIsIDAsIGxlbmd0aCwgdGhpcy5wb3NpdGlvbiwgY2FsbGJhY2spLnJlYWQoKTtcbiAgICB9XG5cbiAgICBleHBhbmRSaWdodChsZW5ndGgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY2hlY2tPcCgpO1xuICAgICAgICBjb25zdCBvZmZzZXQgPSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmNvbmNhdChbdGhpcy5idWZmZXIsIEJ1ZmZlci5hbGxvYyhsZW5ndGgpXSk7XG4gICAgICAgIHRoaXMuZnNPcCA9IG5ldyBGc1JlYWQoXG4gICAgICAgICAgICB0aGlzLmZkLFxuICAgICAgICAgICAgdGhpcy5idWZmZXIsXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBsZW5ndGgsXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICsgb2Zmc2V0LFxuICAgICAgICAgICAgY2FsbGJhY2tcbiAgICAgICAgKS5yZWFkKCk7XG4gICAgfVxuXG4gICAgbW92ZVJpZ2h0KGxlbmd0aCwgY2FsbGJhY2ssIHNoaWZ0KSB7XG4gICAgICAgIHRoaXMuY2hlY2tPcCgpO1xuICAgICAgICBpZiAoc2hpZnQpIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyLmNvcHkodGhpcy5idWZmZXIsIDAsIHNoaWZ0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNoaWZ0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBvc2l0aW9uICs9IHNoaWZ0O1xuICAgICAgICB0aGlzLmZzT3AgPSBuZXcgRnNSZWFkKFxuICAgICAgICAgICAgdGhpcy5mZCxcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyLFxuICAgICAgICAgICAgdGhpcy5idWZmZXIubGVuZ3RoIC0gc2hpZnQsXG4gICAgICAgICAgICBzaGlmdCxcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKyB0aGlzLmJ1ZmZlci5sZW5ndGggLSBzaGlmdCxcbiAgICAgICAgICAgIGNhbGxiYWNrXG4gICAgICAgICkucmVhZCgpO1xuICAgIH1cbn1cblxuY2xhc3MgRW50cnlEYXRhUmVhZGVyU3RyZWFtIGV4dGVuZHMgc3RyZWFtLlJlYWRhYmxlIHtcbiAgICBjb25zdHJ1Y3RvcihmZCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5mZCA9IGZkO1xuICAgICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICAgICAgdGhpcy5yZWFkQ2FsbGJhY2sgPSB0aGlzLnJlYWRDYWxsYmFjay5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIF9yZWFkKG4pIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jKE1hdGgubWluKG4sIHRoaXMubGVuZ3RoIC0gdGhpcy5wb3MpKTtcbiAgICAgICAgaWYgKGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZzLnJlYWQodGhpcy5mZCwgYnVmZmVyLCAwLCBidWZmZXIubGVuZ3RoLCB0aGlzLm9mZnNldCArIHRoaXMucG9zLCB0aGlzLnJlYWRDYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnB1c2gobnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkQ2FsbGJhY2soZXJyLCBieXRlc1JlYWQsIGJ1ZmZlcikge1xuICAgICAgICB0aGlzLnBvcyArPSBieXRlc1JlYWQ7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgdGhpcy5wdXNoKG51bGwpO1xuICAgICAgICB9IGVsc2UgaWYgKCFieXRlc1JlYWQpIHtcbiAgICAgICAgICAgIHRoaXMucHVzaChudWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChieXRlc1JlYWQgIT09IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoMCwgYnl0ZXNSZWFkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucHVzaChidWZmZXIpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBFbnRyeVZlcmlmeVN0cmVhbSBleHRlbmRzIHN0cmVhbS5UcmFuc2Zvcm0ge1xuICAgIGNvbnN0cnVjdG9yKGJhc2VTdG0sIGNyYywgc2l6ZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnZlcmlmeSA9IG5ldyBDcmNWZXJpZnkoY3JjLCBzaXplKTtcbiAgICAgICAgYmFzZVN0bS5vbignZXJyb3InLCAoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfdHJhbnNmb3JtKGRhdGEsIGVuY29kaW5nLCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgZXJyO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy52ZXJpZnkuZGF0YShkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZXJyID0gZTtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayhlcnIsIGRhdGEpO1xuICAgIH1cbn1cblxuY2xhc3MgQ3JjVmVyaWZ5IHtcbiAgICBjb25zdHJ1Y3RvcihjcmMsIHNpemUpIHtcbiAgICAgICAgdGhpcy5jcmMgPSBjcmM7XG4gICAgICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBjcmM6IH4wLFxuICAgICAgICAgICAgc2l6ZTogMCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBkYXRhKGRhdGEpIHtcbiAgICAgICAgY29uc3QgY3JjVGFibGUgPSBDcmNWZXJpZnkuZ2V0Q3JjVGFibGUoKTtcbiAgICAgICAgbGV0IGNyYyA9IHRoaXMuc3RhdGUuY3JjO1xuICAgICAgICBsZXQgb2ZmID0gMDtcbiAgICAgICAgbGV0IGxlbiA9IGRhdGEubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoLS1sZW4gPj0gMCkge1xuICAgICAgICAgICAgY3JjID0gY3JjVGFibGVbKGNyYyBeIGRhdGFbb2ZmKytdKSAmIDB4ZmZdIF4gKGNyYyA+Pj4gOCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdGF0ZS5jcmMgPSBjcmM7XG4gICAgICAgIHRoaXMuc3RhdGUuc2l6ZSArPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2l6ZSA+PSB0aGlzLnNpemUpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICAgICAgICAgIGJ1Zi53cml0ZUludDMyTEUofnRoaXMuc3RhdGUuY3JjICYgMHhmZmZmZmZmZiwgMCk7XG4gICAgICAgICAgICBjcmMgPSBidWYucmVhZFVJbnQzMkxFKDApO1xuICAgICAgICAgICAgaWYgKGNyYyAhPT0gdGhpcy5jcmMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgQ1JDJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaXplICE9PSB0aGlzLnNpemUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2l6ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldENyY1RhYmxlKCkge1xuICAgICAgICBsZXQgY3JjVGFibGUgPSBDcmNWZXJpZnkuY3JjVGFibGU7XG4gICAgICAgIGlmICghY3JjVGFibGUpIHtcbiAgICAgICAgICAgIENyY1ZlcmlmeS5jcmNUYWJsZSA9IGNyY1RhYmxlID0gW107XG4gICAgICAgICAgICBjb25zdCBiID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgICAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCAyNTY7IG4rKykge1xuICAgICAgICAgICAgICAgIGxldCBjID0gbjtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gODsgLS1rID49IDA7ICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGMgJiAxKSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IDB4ZWRiODgzMjAgXiAoYyA+Pj4gMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gYyA+Pj4gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYyA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYi53cml0ZUludDMyTEUoYywgMCk7XG4gICAgICAgICAgICAgICAgICAgIGMgPSBiLnJlYWRVSW50MzJMRSgwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JjVGFibGVbbl0gPSBjO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcmNUYWJsZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlWmlwVGltZSh0aW1lYnl0ZXMsIGRhdGVieXRlcykge1xuICAgIGNvbnN0IHRpbWViaXRzID0gdG9CaXRzKHRpbWVieXRlcywgMTYpO1xuICAgIGNvbnN0IGRhdGViaXRzID0gdG9CaXRzKGRhdGVieXRlcywgMTYpO1xuXG4gICAgY29uc3QgbXQgPSB7XG4gICAgICAgIGg6IHBhcnNlSW50KHRpbWViaXRzLnNsaWNlKDAsIDUpLmpvaW4oJycpLCAyKSxcbiAgICAgICAgbTogcGFyc2VJbnQodGltZWJpdHMuc2xpY2UoNSwgMTEpLmpvaW4oJycpLCAyKSxcbiAgICAgICAgczogcGFyc2VJbnQodGltZWJpdHMuc2xpY2UoMTEsIDE2KS5qb2luKCcnKSwgMikgKiAyLFxuICAgICAgICBZOiBwYXJzZUludChkYXRlYml0cy5zbGljZSgwLCA3KS5qb2luKCcnKSwgMikgKyAxOTgwLFxuICAgICAgICBNOiBwYXJzZUludChkYXRlYml0cy5zbGljZSg3LCAxMSkuam9pbignJyksIDIpLFxuICAgICAgICBEOiBwYXJzZUludChkYXRlYml0cy5zbGljZSgxMSwgMTYpLmpvaW4oJycpLCAyKSxcbiAgICB9O1xuICAgIGNvbnN0IGR0X3N0ciA9IFttdC5ZLCBtdC5NLCBtdC5EXS5qb2luKCctJykgKyAnICcgKyBbbXQuaCwgbXQubSwgbXQuc10uam9pbignOicpICsgJyBHTVQrMCc7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGR0X3N0cikuZ2V0VGltZSgpO1xufVxuXG5mdW5jdGlvbiB0b0JpdHMoZGVjLCBzaXplKSB7XG4gICAgbGV0IGIgPSAoZGVjID4+PiAwKS50b1N0cmluZygyKTtcbiAgICB3aGlsZSAoYi5sZW5ndGggPCBzaXplKSB7XG4gICAgICAgIGIgPSAnMCcgKyBiO1xuICAgIH1cbiAgICByZXR1cm4gYi5zcGxpdCgnJyk7XG59XG5cbmZ1bmN0aW9uIHJlYWRVSW50NjRMRShidWZmZXIsIG9mZnNldCkge1xuICAgIHJldHVybiBidWZmZXIucmVhZFVJbnQzMkxFKG9mZnNldCArIDQpICogMHgwMDAwMDAwMTAwMDAwMDAwICsgYnVmZmVyLnJlYWRVSW50MzJMRShvZmZzZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0cmVhbVppcDtcbiIsICJpbXBvcnQgeyBGb3JtLCBEZXRhaWwgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgdXNlT25lVGltZVBhc3N3b3JkSGlzdG9yeVdhcm5pbmcgZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlT25lVGltZVBhc3N3b3JkSGlzdG9yeVdhcm5pbmdcIjtcbmltcG9ydCB1c2VQYXNzd29yZEdlbmVyYXRvciwgeyBVc2VQYXNzd29yZEdlbmVyYXRvclJlc3VsdCB9IGZyb20gXCJ+L3V0aWxzL2hvb2tzL3VzZVBhc3N3b3JkR2VuZXJhdG9yXCI7XG5pbXBvcnQgeyBQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMsIFBhc3N3b3JkVHlwZSB9IGZyb20gXCJ+L3R5cGVzL3Bhc3N3b3Jkc1wiO1xuaW1wb3J0IEZvcm1BY3Rpb25QYW5lbCBmcm9tIFwifi9jb21wb25lbnRzL2dlbmVyYXRlUGFzc3dvcmQvQWN0aW9uUGFuZWxcIjtcbmltcG9ydCB7IEJpdHdhcmRlblByb3ZpZGVyIH0gZnJvbSBcIn4vY29udGV4dC9iaXR3YXJkZW5cIjtcbmltcG9ydCBSb290RXJyb3JCb3VuZGFyeSBmcm9tIFwifi9jb21wb25lbnRzL1Jvb3RFcnJvckJvdW5kYXJ5XCI7XG5pbXBvcnQgeyB1c2VDbGlWZXJzaW9uIH0gZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlQ2xpVmVyc2lvblwiO1xuaW1wb3J0IHsgQ3VzdG9tVmFsaWRhdGlvbnMsIHN0cmluZ2lmeUJvb2xlYW5JdGVtUHJvcHMsIHVzZU9uQ2hhbmdlRm9ybSB9IGZyb20gXCJ+L3V0aWxzL2Zvcm1cIjtcbmltcG9ydCB7IGNhcGl0YWxpemUgfSBmcm9tIFwifi91dGlscy9zdHJpbmdzXCI7XG5cbmNvbnN0IEdlbmVyYXRlUGFzc3dvcmRDb21tYW5kID0gKCkgPT4gKFxuICA8Um9vdEVycm9yQm91bmRhcnk+XG4gICAgPEJpdHdhcmRlblByb3ZpZGVyPlxuICAgICAgPEdlbmVyYXRlUGFzc3dvcmRGb3JtIC8+XG4gICAgPC9CaXR3YXJkZW5Qcm92aWRlcj5cbiAgPC9Sb290RXJyb3JCb3VuZGFyeT5cbik7XG5cbmZ1bmN0aW9uIEdlbmVyYXRlUGFzc3dvcmRGb3JtKCkge1xuICBjb25zdCBnZW5lcmF0b3IgPSB1c2VQYXNzd29yZEdlbmVyYXRvcigpO1xuXG4gIGlmICghZ2VuZXJhdG9yLm9wdGlvbnMpIHJldHVybiA8RGV0YWlsIGlzTG9hZGluZyAvPjtcbiAgcmV0dXJuIDxHZW5lcmF0ZVBhc3N3b3JkRm9ybUNvbnRlbnQgZ2VuZXJhdG9yPXtnZW5lcmF0b3J9IC8+O1xufVxuXG5jb25zdCBwYXNzd29yZFR5cGVPcHRpb25zOiBQYXNzd29yZFR5cGVbXSA9IFtcInBhc3N3b3JkXCIsIFwicGFzc3BocmFzZVwiXTtcblxuZnVuY3Rpb24gR2VuZXJhdGVQYXNzd29yZEZvcm1Db250ZW50KHsgZ2VuZXJhdG9yIH06IHsgZ2VuZXJhdG9yOiBVc2VQYXNzd29yZEdlbmVyYXRvclJlc3VsdCB9KSB7XG4gIGNvbnN0IHsgb3B0aW9ucywgcGFzc3dvcmQsIGlzR2VuZXJhdGluZywgcmVnZW5lcmF0ZVBhc3N3b3JkIH0gPSBnZW5lcmF0b3I7XG5cbiAgY29uc3QgY2xpVmVyc2lvbiA9IHVzZUNsaVZlcnNpb24oKTtcbiAgY29uc3QgZm9ybSA9IHVzZU9uQ2hhbmdlRm9ybTxQYXNzd29yZEdlbmVyYXRvck9wdGlvbnM+KHtcbiAgICBvbkNoYW5nZTogcmVnZW5lcmF0ZVBhc3N3b3JkLFxuICAgIGluaXRpYWxWYWx1ZXM6IG9wdGlvbnMsXG4gICAgdmFsaWRhdGlvbjoge1xuICAgICAgbGVuZ3RoOiBDdXN0b21WYWxpZGF0aW9ucy5OdW1iZXJTdHJpbmdCZXR3ZWVuKDUsIDEyOCksXG4gICAgICB3b3JkczogQ3VzdG9tVmFsaWRhdGlvbnMuTnVtYmVyU3RyaW5nQmV0d2VlbigzLCAyMCksXG4gICAgICBzZXBhcmF0b3I6IEN1c3RvbVZhbGlkYXRpb25zLk9uZUNoYXJhY3RlcixcbiAgICAgIG1pbk51bWJlcjogQ3VzdG9tVmFsaWRhdGlvbnMuTnVtYmVyU3RyaW5nQmV0d2VlbigwLCA5KSxcbiAgICAgIG1pblNwZWNpYWw6IEN1c3RvbVZhbGlkYXRpb25zLk51bWJlclN0cmluZ0JldHdlZW4oMCwgOSksXG4gICAgfSxcbiAgfSk7XG5cbiAgY29uc3QgeyB2YWx1ZXMsIGl0ZW1Qcm9wcyB9ID0gZm9ybTtcblxuICB1c2VPbmVUaW1lUGFzc3dvcmRIaXN0b3J5V2FybmluZygpO1xuXG4gIHJldHVybiAoXG4gICAgPEZvcm1cbiAgICAgIGlzTG9hZGluZz17aXNHZW5lcmF0aW5nfVxuICAgICAgYWN0aW9ucz17PEZvcm1BY3Rpb25QYW5lbCBwYXNzd29yZD17cGFzc3dvcmR9IHJlZ2VuZXJhdGVQYXNzd29yZD17cmVnZW5lcmF0ZVBhc3N3b3JkfSAvPn1cbiAgICA+XG4gICAgICA8Rm9ybS5EZXNjcmlwdGlvbiB0aXRsZT1cIlx1RDgzRFx1REQxMVwiIHRleHQ9e3Bhc3N3b3JkID8/IFwiR2VuZXJhdGluZy4uLlwifSAvPlxuICAgICAgPEZvcm0uU2VwYXJhdG9yIC8+XG4gICAgICA8Rm9ybS5Ecm9wZG93blxuICAgICAgICB7Li4uc3RyaW5naWZ5Qm9vbGVhbkl0ZW1Qcm9wczxQYXNzd29yZFR5cGU+KGl0ZW1Qcm9wcy5wYXNzcGhyYXNlLCBcInBhc3NwaHJhc2VcIiwgXCJwYXNzd29yZFwiKX1cbiAgICAgICAgdGl0bGU9XCJUeXBlXCJcbiAgICAgICAgYXV0b0ZvY3VzXG4gICAgICA+XG4gICAgICAgIHtwYXNzd29yZFR5cGVPcHRpb25zLm1hcCgodHlwZSkgPT4gKFxuICAgICAgICAgIDxGb3JtLkRyb3Bkb3duLkl0ZW0ga2V5PXt0eXBlfSB2YWx1ZT17dHlwZX0gdGl0bGU9e2NhcGl0YWxpemUodHlwZSl9IC8+XG4gICAgICAgICkpfVxuICAgICAgPC9Gb3JtLkRyb3Bkb3duPlxuICAgICAge3ZhbHVlcy5wYXNzcGhyYXNlID8gKFxuICAgICAgICA8PlxuICAgICAgICAgIDxGb3JtLlRleHRGaWVsZCB7Li4uaXRlbVByb3BzLndvcmRzfSB0aXRsZT1cIk51bWJlciBvZiB3b3Jkc1wiIHBsYWNlaG9sZGVyPVwiMyAtIDIwXCIgLz5cbiAgICAgICAgICA8Rm9ybS5UZXh0RmllbGQgey4uLml0ZW1Qcm9wcy5zZXBhcmF0b3J9IHRpdGxlPVwiV29yZCBzZXBhcmF0b3JcIiBwbGFjZWhvbGRlcj1cInRoaXMtaXMtYS1wYXNzcGhyYXNlXCIgLz5cbiAgICAgICAgICA8Rm9ybS5DaGVja2JveCB7Li4uaXRlbVByb3BzLmNhcGl0YWxpemV9IHRpdGxlPVwiQ2FwaXRhbGl6ZVwiIGxhYmVsPVwiVGhpcy1Jcy1BLVBhc3NwaHJhc2VcIiAvPlxuICAgICAgICAgIDxGb3JtLkNoZWNrYm94IHsuLi5pdGVtUHJvcHMuaW5jbHVkZU51bWJlcn0gdGl0bGU9XCJJbmNsdWRlIG51bWJlclwiIGxhYmVsPVwiVGhpczItSXMtQS1QYXNzcGhyYXNlXCIgLz5cbiAgICAgICAgPC8+XG4gICAgICApIDogKFxuICAgICAgICA8PlxuICAgICAgICAgIDxGb3JtLlRleHRGaWVsZCB7Li4uaXRlbVByb3BzLmxlbmd0aH0gdGl0bGU9XCJMZW5ndGggb2YgdGhlIHBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCI1IC0gMTI4XCIgLz5cbiAgICAgICAgICA8Rm9ybS5DaGVja2JveCB7Li4uaXRlbVByb3BzLnVwcGVyY2FzZX0gdGl0bGU9XCJVcHBlcmNhc2UgY2hhcmFjdGVyc1wiIGxhYmVsPVwiQUJDREVGR0hJSkxNTk9QUVJTVFVWV1hZWlwiIC8+XG4gICAgICAgICAgPEZvcm0uQ2hlY2tib3ggey4uLml0ZW1Qcm9wcy5sb3dlcmNhc2V9IHRpdGxlPVwiTG93ZXJjYXNlIGNoYXJhY3RlcnNcIiBsYWJlbD1cImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCIgLz5cbiAgICAgICAgICA8Rm9ybS5DaGVja2JveCB7Li4uaXRlbVByb3BzLm51bWJlcn0gdGl0bGU9XCJOdW1lcmljIGNoYXJhY3RlcnNcIiBsYWJlbD1cIjAxMjM0NTY3ODlcIiAvPlxuICAgICAgICAgIHtjbGlWZXJzaW9uID49IDIwMjMuOSAmJiB2YWx1ZXMubnVtYmVyICYmIChcbiAgICAgICAgICAgIDxGb3JtLlRleHRGaWVsZCB7Li4uaXRlbVByb3BzLm1pbk51bWJlcn0gdGl0bGU9XCJNaW5pbXVtIG51bWJlcnNcIiBwbGFjZWhvbGRlcj1cIjFcIiAvPlxuICAgICAgICAgICl9XG4gICAgICAgICAgPEZvcm0uQ2hlY2tib3ggey4uLml0ZW1Qcm9wcy5zcGVjaWFsfSB0aXRsZT1cIlNwZWNpYWwgY2hhcmFjdGVyc1wiIGxhYmVsPVwiIUAjJCVeJiooKV8rLT1bXXt9fDs6LC4vPD4/XCIgLz5cbiAgICAgICAgICB7Y2xpVmVyc2lvbiA+PSAyMDIzLjkgJiYgdmFsdWVzLnNwZWNpYWwgJiYgKFxuICAgICAgICAgICAgPEZvcm0uVGV4dEZpZWxkIHsuLi5pdGVtUHJvcHMubWluU3BlY2lhbH0gdGl0bGU9XCJNaW5pbXVtIHNwZWNpYWxcIiBwbGFjZWhvbGRlcj1cIjFcIiAvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICA8L0Zvcm0+XG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdlbmVyYXRlUGFzc3dvcmRDb21tYW5kO1xuIiwgImltcG9ydCB7IGNvbmZpcm1BbGVydCwgSWNvbiwgTG9jYWxTdG9yYWdlLCBwb3BUb1Jvb3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IExPQ0FMX1NUT1JBR0VfS0VZIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcblxuY29uc3QgdXNlT25lVGltZVBhc3N3b3JkSGlzdG9yeVdhcm5pbmcgPSAoKSA9PiB7XG4gIGNvbnN0IGhhbmRsZURpc21pc3NBY3Rpb24gPSAoKSA9PiBwb3BUb1Jvb3QoeyBjbGVhclNlYXJjaEJhcjogZmFsc2UgfSk7XG5cbiAgY29uc3QgaGFuZGxlUHJpbWFyeUFjdGlvbiA9ICgpID0+IExvY2FsU3RvcmFnZS5zZXRJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlBBU1NXT1JEX09ORV9USU1FX1dBUk5JTkcsIHRydWUpO1xuXG4gIGNvbnN0IGRpc3BsYXlXYXJuaW5nID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGFsZXJ0V2FzU2hvd24gPSBhd2FpdCBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxib29sZWFuPihMT0NBTF9TVE9SQUdFX0tFWS5QQVNTV09SRF9PTkVfVElNRV9XQVJOSU5HKTtcbiAgICBpZiAoYWxlcnRXYXNTaG93bikgcmV0dXJuO1xuXG4gICAgYXdhaXQgY29uZmlybUFsZXJ0KHtcbiAgICAgIHRpdGxlOiBcIldhcm5pbmdcIixcbiAgICAgIG1lc3NhZ2U6IFwiUGFzc3dvcmQgaGlzdG9yeSBpcyBub3QgYXZhaWxhYmxlIHlldCwgc28gbWFrZSBzdXJlIHRvIHN0b3JlIHRoZSBwYXNzd29yZCBhZnRlciBnZW5lcmF0aW5nIGl0IVwiLFxuICAgICAgaWNvbjogSWNvbi5FeGNsYW1hdGlvbk1hcmssXG4gICAgICBkaXNtaXNzQWN0aW9uOiB7XG4gICAgICAgIHRpdGxlOiBcIkdvIGJhY2tcIixcbiAgICAgICAgb25BY3Rpb246IGhhbmRsZURpc21pc3NBY3Rpb24sXG4gICAgICB9LFxuICAgICAgcHJpbWFyeUFjdGlvbjoge1xuICAgICAgICB0aXRsZTogXCJJIHVuZGVyc3RhbmRcIixcbiAgICAgICAgb25BY3Rpb246IGhhbmRsZVByaW1hcnlBY3Rpb24sXG4gICAgICB9LFxuICAgIH0pO1xuICB9O1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdm9pZCBkaXNwbGF5V2FybmluZygpO1xuICB9LCBbXSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB1c2VPbmVUaW1lUGFzc3dvcmRIaXN0b3J5V2FybmluZztcbiIsICIvKiBQdXQgY29uc3RhbnRzIHRoYXQgeW91IGZlZWwgbGlrZSB0aGV5IHN0aWxsIGRvbid0IGRlc2VydmUgYSBmaWxlIG9mIHRoZWlyIG93biBoZXJlICovXG5cbmltcG9ydCB7IEljb24sIEtleWJvYXJkIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgSXRlbVR5cGUgfSBmcm9tIFwifi90eXBlcy92YXVsdFwiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVJWRVJfVVJMID0gXCJodHRwczovL2JpdHdhcmRlbi5jb21cIjtcblxuZXhwb3J0IGNvbnN0IFNFTlNJVElWRV9WQUxVRV9QTEFDRUhPTERFUiA9IFwiSElEREVOLVZBTFVFXCI7XG5cbmV4cG9ydCBjb25zdCBMT0NBTF9TVE9SQUdFX0tFWSA9IHtcbiAgUEFTU1dPUkRfT1BUSU9OUzogXCJidy1nZW5lcmF0ZS1wYXNzd29yZC1vcHRpb25zXCIsXG4gIFBBU1NXT1JEX09ORV9USU1FX1dBUk5JTkc6IFwiYnctZ2VuZXJhdGUtcGFzc3dvcmQtd2FybmluZy1hY2NlcHRlZFwiLFxuICBTRVNTSU9OX1RPS0VOOiBcInNlc3Npb25Ub2tlblwiLFxuICBSRVBST01QVF9IQVNIOiBcInNlc3Npb25SZXByb21wdEhhc2hcIixcbiAgU0VSVkVSX1VSTDogXCJjbGlTZXJ2ZXJcIixcbiAgTEFTVF9BQ1RJVklUWV9USU1FOiBcImxhc3RBY3Rpdml0eVRpbWVcIixcbiAgVkFVTFRfTE9DS19SRUFTT046IFwidmF1bHRMb2NrUmVhc29uXCIsXG4gIFZBVUxUX0ZBVk9SSVRFX09SREVSOiBcInZhdWx0RmF2b3JpdGVPcmRlclwiLFxuICBWQVVMVF9MQVNUX1NUQVRVUzogXCJsYXN0VmF1bHRTdGF0dXNcIixcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBWQVVMVF9MT0NLX01FU1NBR0VTID0ge1xuICBUSU1FT1VUOiBcIlZhdWx0IHRpbWVkIG91dCBkdWUgdG8gaW5hY3Rpdml0eVwiLFxuICBNQU5VQUw6IFwiTWFudWFsbHkgbG9ja2VkIGJ5IHRoZSB1c2VyXCIsXG4gIFNZU1RFTV9MT0NLOiBcIlNjcmVlbiB3YXMgbG9ja2VkXCIsXG4gIFNZU1RFTV9TTEVFUDogXCJTeXN0ZW0gd2VudCB0byBzbGVlcFwiLFxuICBDTElfVVBEQVRFRDogXCJCaXR3YXJkZW4gaGFzIGJlZW4gdXBkYXRlZC4gUGxlYXNlIGxvZ2luIGFnYWluLlwiLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IFNIT1JUQ1VUX0tFWV9TRVFVRU5DRTogS2V5Ym9hcmQuS2V5RXF1aXZhbGVudFtdID0gW1xuICBcIjFcIixcbiAgXCIyXCIsXG4gIFwiM1wiLFxuICBcIjRcIixcbiAgXCI1XCIsXG4gIFwiNlwiLFxuICBcIjdcIixcbiAgXCI4XCIsXG4gIFwiOVwiLFxuICBcImJcIixcbiAgXCJjXCIsXG4gIFwiZFwiLFxuICBcImVcIixcbiAgXCJmXCIsXG4gIFwiZ1wiLFxuICBcImhcIixcbiAgXCJpXCIsXG4gIFwialwiLFxuICBcImtcIixcbiAgXCJsXCIsXG4gIFwibVwiLFxuICBcIm5cIixcbiAgXCJvXCIsXG4gIFwicFwiLFxuICBcInFcIixcbiAgXCJyXCIsXG4gIFwic1wiLFxuICBcInRcIixcbiAgXCJ1XCIsXG4gIFwidlwiLFxuICBcIndcIixcbiAgXCJ4XCIsXG4gIFwieVwiLFxuICBcInpcIixcbiAgXCIrXCIsXG4gIFwiLVwiLFxuICBcIi5cIixcbiAgXCIsXCIsXG5dO1xuXG5leHBvcnQgY29uc3QgRk9MREVSX09QVElPTlMgPSB7XG4gIEFMTDogXCJhbGxcIixcbiAgTk9fRk9MREVSOiBcIm5vLWZvbGRlclwiLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IENBQ0hFX0tFWVMgPSB7XG4gIElWOiBcIml2XCIsXG4gIFZBVUxUOiBcInZhdWx0XCIsXG4gIENVUlJFTlRfRk9MREVSX0lEOiBcImN1cnJlbnRGb2xkZXJJZFwiLFxuICBTRU5EX1RZUEVfRklMVEVSOiBcInNlbmRUeXBlRmlsdGVyXCIsXG4gIENMSV9WRVJTSU9OOiBcImNsaVZlcnNpb25cIixcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBJVEVNX1RZUEVfVE9fSUNPTl9NQVA6IFJlY29yZDxJdGVtVHlwZSwgSWNvbj4gPSB7XG4gIFtJdGVtVHlwZS5MT0dJTl06IEljb24uR2xvYmUsXG4gIFtJdGVtVHlwZS5DQVJEXTogSWNvbi5DcmVkaXRDYXJkLFxuICBbSXRlbVR5cGUuSURFTlRJVFldOiBJY29uLlBlcnNvbixcbiAgW0l0ZW1UeXBlLk5PVEVdOiBJY29uLkRvY3VtZW50LFxuICBbSXRlbVR5cGUuU1NIX0tFWV06IEljb24uS2V5LFxufTtcbiIsICJpbXBvcnQgeyBMb2NhbFN0b3JhZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZHVjZXIgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IExPQ0FMX1NUT1JBR0VfS0VZIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcbmltcG9ydCB7IFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gXCJ+L3R5cGVzL3Bhc3N3b3Jkc1wiO1xuaW1wb3J0IHVzZUFib3J0Q29udHJvbGxlciBmcm9tIFwifi91dGlscy9ob29rcy91c2VBYm9ydENvbnRyb2xsZXJcIjtcbmltcG9ydCB7IHVzZUJpdHdhcmRlbiB9IGZyb20gXCJ+L2NvbnRleHQvYml0d2FyZGVuXCI7XG5pbXBvcnQgeyBnZXRQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMgfSBmcm9tIFwifi91dGlscy9wYXNzd29yZHNcIjtcbmltcG9ydCB7IERFRkFVTFRfUEFTU1dPUkRfT1BUSU9OUyB9IGZyb20gXCJ+L2NvbnN0YW50cy9wYXNzd29yZHNcIjtcblxuY29uc3QgaW5pdGlhbFBhc3N3b3JkR2VuZXJhdG9yU3RhdGUgPSB7XG4gIG9wdGlvbnM6IHVuZGVmaW5lZCBhcyBQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMgfCB1bmRlZmluZWQsXG4gIHBhc3N3b3JkOiB1bmRlZmluZWQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkLFxuICBpc0dlbmVyYXRpbmc6IHRydWUsXG59O1xuXG50eXBlIEdlbmVyYXRvclN0YXRlID0gdHlwZW9mIGluaXRpYWxQYXNzd29yZEdlbmVyYXRvclN0YXRlO1xuXG50eXBlIEdlbmVyYXRvckFjdGlvbnMgPVxuICB8IHsgdHlwZTogXCJnZW5lcmF0ZVwiIH1cbiAgfCB7IHR5cGU6IFwic2V0UGFzc3dvcmRcIjsgcGFzc3dvcmQ6IHN0cmluZyB9XG4gIHwgeyB0eXBlOiBcInNldE9wdGlvbnNcIjsgb3B0aW9uczogUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zIH1cbiAgfCB7IHR5cGU6IFwiY2FuY2VsR2VuZXJhdGVcIiB9XG4gIHwgeyB0eXBlOiBcImNsZWFyUGFzc3dvcmRcIjsgcGFzc3dvcmQ6IHN0cmluZyB9O1xuXG5jb25zdCBwYXNzd29yZFJlZHVjZXIgPSAoc3RhdGU6IEdlbmVyYXRvclN0YXRlLCBhY3Rpb246IEdlbmVyYXRvckFjdGlvbnMpOiBHZW5lcmF0b3JTdGF0ZSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFwiZ2VuZXJhdGVcIjpcbiAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBpc0dlbmVyYXRpbmc6IHRydWUgfTtcbiAgICBjYXNlIFwic2V0UGFzc3dvcmRcIjpcbiAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBwYXNzd29yZDogYWN0aW9uLnBhc3N3b3JkLCBpc0dlbmVyYXRpbmc6IGZhbHNlIH07XG4gICAgY2FzZSBcInNldE9wdGlvbnNcIjpcbiAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBvcHRpb25zOiBhY3Rpb24ub3B0aW9ucyB9O1xuICAgIGNhc2UgXCJjYW5jZWxHZW5lcmF0ZVwiOlxuICAgICAgcmV0dXJuIHsgLi4uc3RhdGUsIGlzR2VuZXJhdGluZzogZmFsc2UgfTtcbiAgICBjYXNlIFwiY2xlYXJQYXNzd29yZFwiOlxuICAgICAgcmV0dXJuIHsgLi4uc3RhdGUsIGlzR2VuZXJhdGluZzogZmFsc2UsIHBhc3N3b3JkOiB1bmRlZmluZWQgfTtcbiAgfVxufTtcblxuY29uc3QgcHJlcGFyZU9wdGlvbnMgPSAob3B0aW9uczogUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zKTogUmVxdWlyZWQ8UGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zPiA9PiAoe1xuICBsb3dlcmNhc2U6IG9wdGlvbnMubG93ZXJjYXNlID8/IERFRkFVTFRfUEFTU1dPUkRfT1BUSU9OUy5sb3dlcmNhc2UsXG4gIHVwcGVyY2FzZTogb3B0aW9ucy51cHBlcmNhc2UgPz8gREVGQVVMVF9QQVNTV09SRF9PUFRJT05TLnVwcGVyY2FzZSxcbiAgbnVtYmVyOiBvcHRpb25zLm51bWJlciA/PyBERUZBVUxUX1BBU1NXT1JEX09QVElPTlMubnVtYmVyLFxuICBzcGVjaWFsOiBvcHRpb25zLnNwZWNpYWwgPz8gREVGQVVMVF9QQVNTV09SRF9PUFRJT05TLnNwZWNpYWwsXG4gIHBhc3NwaHJhc2U6IG9wdGlvbnMucGFzc3BocmFzZSA/PyBERUZBVUxUX1BBU1NXT1JEX09QVElPTlMucGFzc3BocmFzZSxcbiAgbGVuZ3RoOiBvcHRpb25zLmxlbmd0aCA/PyBERUZBVUxUX1BBU1NXT1JEX09QVElPTlMubGVuZ3RoLFxuICB3b3Jkczogb3B0aW9ucy53b3JkcyA/PyBERUZBVUxUX1BBU1NXT1JEX09QVElPTlMud29yZHMsXG4gIHNlcGFyYXRvcjogb3B0aW9ucy5zZXBhcmF0b3IgPz8gREVGQVVMVF9QQVNTV09SRF9PUFRJT05TLnNlcGFyYXRvcixcbiAgY2FwaXRhbGl6ZTogb3B0aW9ucy5jYXBpdGFsaXplID8/IERFRkFVTFRfUEFTU1dPUkRfT1BUSU9OUy5jYXBpdGFsaXplLFxuICBpbmNsdWRlTnVtYmVyOiBvcHRpb25zLmluY2x1ZGVOdW1iZXIgPz8gREVGQVVMVF9QQVNTV09SRF9PUFRJT05TLmluY2x1ZGVOdW1iZXIsXG4gIG1pbk51bWJlcjogb3B0aW9ucy5taW5OdW1iZXIgPz8gREVGQVVMVF9QQVNTV09SRF9PUFRJT05TLm1pbk51bWJlcixcbiAgbWluU3BlY2lhbDogb3B0aW9ucy5taW5TcGVjaWFsID8/IERFRkFVTFRfUEFTU1dPUkRfT1BUSU9OUy5taW5TcGVjaWFsLFxufSk7XG5cbmV4cG9ydCB0eXBlIFVzZVBhc3N3b3JkR2VuZXJhdG9yUmVzdWx0ID0gUmV0dXJuVHlwZTx0eXBlb2YgdXNlUGFzc3dvcmRHZW5lcmF0b3I+O1xuXG5mdW5jdGlvbiB1c2VQYXNzd29yZEdlbmVyYXRvcigpIHtcbiAgY29uc3QgYml0d2FyZGVuID0gdXNlQml0d2FyZGVuKCk7XG4gIGNvbnN0IFt7IG9wdGlvbnMsIC4uLnN0YXRlIH0sIGRpc3BhdGNoXSA9IHVzZVJlZHVjZXIocGFzc3dvcmRSZWR1Y2VyLCBpbml0aWFsUGFzc3dvcmRHZW5lcmF0b3JTdGF0ZSk7XG4gIGNvbnN0IHsgYWJvcnRDb250cm9sbGVyUmVmLCByZW5ldzogcmVuZXdBYm9ydENvbnRyb2xsZXIsIGFib3J0OiBhYm9ydFByZXZpb3VzR2VuZXJhdGUgfSA9IHVzZUFib3J0Q29udHJvbGxlcigpO1xuXG4gIGNvbnN0IHJlc3RvcmVTdG9yZWRPcHRpb25zID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3RvcmVkT3B0aW9ucyA9IGF3YWl0IGdldFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucygpO1xuICAgIGRpc3BhdGNoKHsgdHlwZTogXCJzZXRPcHRpb25zXCIsIG9wdGlvbnM6IHJlc3RvcmVkT3B0aW9ucyB9KTtcbiAgICBhd2FpdCBnZW5lcmF0ZVBhc3N3b3JkKHJlc3RvcmVkT3B0aW9ucyk7XG4gIH07XG5cbiAgdXNlRWZmZWN0KCgpID0+IHZvaWQgcmVzdG9yZVN0b3JlZE9wdGlvbnMoKSwgW10pO1xuXG4gIGNvbnN0IGdlbmVyYXRlUGFzc3dvcmQgPSBhc3luYyAobmV3T3B0aW9ucyA9IG9wdGlvbnMpID0+IHtcbiAgICB0cnkge1xuICAgICAgaWYgKHN0YXRlLmlzR2VuZXJhdGluZykgYWJvcnRQcmV2aW91c0dlbmVyYXRlKCk7XG4gICAgICByZW5ld0Fib3J0Q29udHJvbGxlcigpO1xuXG4gICAgICBkaXNwYXRjaCh7IHR5cGU6IFwiZ2VuZXJhdGVcIiB9KTtcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgYml0d2FyZGVuLmdlbmVyYXRlUGFzc3dvcmQobmV3T3B0aW9ucywgYWJvcnRDb250cm9sbGVyUmVmPy5jdXJyZW50KTtcbiAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJzZXRQYXNzd29yZFwiLCBwYXNzd29yZCB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gZ2VuZXJhdGUgcGFzc3dvcmQgd2FzIGxpa2VseSBhYm9ydGVkXG4gICAgICBpZiAoYWJvcnRDb250cm9sbGVyUmVmPy5jdXJyZW50LnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJjYW5jZWxHZW5lcmF0ZVwiIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBjb25zdCByZWdlbmVyYXRlUGFzc3dvcmQgPSBhc3luYyAobmV3T3B0aW9ucz86IFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucykgPT4ge1xuICAgIGlmIChuZXdPcHRpb25zKSB7XG4gICAgICBkaXNwYXRjaCh7IHR5cGU6IFwic2V0T3B0aW9uc1wiLCBvcHRpb25zOiBuZXdPcHRpb25zIH0pO1xuICAgICAgY29uc3QgcHJlcGFyZWRPcHRpb25zID0gcHJlcGFyZU9wdGlvbnMobmV3T3B0aW9ucyk7XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIGdlbmVyYXRlUGFzc3dvcmQocHJlcGFyZWRPcHRpb25zKSxcbiAgICAgICAgTG9jYWxTdG9yYWdlLnNldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuUEFTU1dPUkRfT1BUSU9OUywgSlNPTi5zdHJpbmdpZnkocHJlcGFyZWRPcHRpb25zKSksXG4gICAgICBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgZ2VuZXJhdGVQYXNzd29yZCgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4geyAuLi5zdGF0ZSwgcmVnZW5lcmF0ZVBhc3N3b3JkLCBvcHRpb25zIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHVzZVBhc3N3b3JkR2VuZXJhdG9yO1xuIiwgImltcG9ydCB7IHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuXG5mdW5jdGlvbiB1c2VBYm9ydENvbnRyb2xsZXIoKSB7XG4gIGNvbnN0IGFib3J0Q29udHJvbGxlclJlZiA9IHVzZVJlZihuZXcgQWJvcnRDb250cm9sbGVyKCkpO1xuXG4gIGNvbnN0IHJlbmV3ID0gKCkgPT4ge1xuICAgIGlmICghYWJvcnRDb250cm9sbGVyUmVmLmN1cnJlbnQuc2lnbmFsLmFib3J0ZWQpIHJldHVybjtcbiAgICBhYm9ydENvbnRyb2xsZXJSZWYuY3VycmVudCA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgfTtcblxuICBjb25zdCBhYm9ydCA9ICgpID0+IHtcbiAgICBhYm9ydENvbnRyb2xsZXJSZWYuY3VycmVudD8uYWJvcnQoKTtcbiAgfTtcblxuICByZXR1cm4geyBhYm9ydENvbnRyb2xsZXJSZWYsIHJlbmV3LCBhYm9ydCB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCB1c2VBYm9ydENvbnRyb2xsZXI7XG4iLCAiaW1wb3J0IHsgY3JlYXRlQ29udGV4dCwgUHJvcHNXaXRoQ2hpbGRyZW4sIFJlYWN0Tm9kZSwgdXNlQ29udGV4dCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEJpdHdhcmRlbiB9IGZyb20gXCJ+L2FwaS9iaXR3YXJkZW5cIjtcbmltcG9ydCB7IExvYWRpbmdGYWxsYmFjayB9IGZyb20gXCJ+L2NvbXBvbmVudHMvTG9hZGluZ0ZhbGxiYWNrXCI7XG5pbXBvcnQgVHJvdWJsZXNob290aW5nR3VpZGUgZnJvbSBcIn4vY29tcG9uZW50cy9Ucm91Ymxlc2hvb3RpbmdHdWlkZVwiO1xuaW1wb3J0IHsgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvciB9IGZyb20gXCJ+L3V0aWxzL2Vycm9yc1wiO1xuaW1wb3J0IHVzZU9uY2VFZmZlY3QgZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlT25jZUVmZmVjdFwiO1xuXG5jb25zdCBCaXR3YXJkZW5Db250ZXh0ID0gY3JlYXRlQ29udGV4dDxCaXR3YXJkZW4gfCBudWxsPihudWxsKTtcblxuZXhwb3J0IHR5cGUgQml0d2FyZGVuUHJvdmlkZXJQcm9wcyA9IFByb3BzV2l0aENoaWxkcmVuPHtcbiAgbG9hZGluZ0ZhbGxiYWNrPzogUmVhY3ROb2RlO1xufT47XG5cbmV4cG9ydCBjb25zdCBCaXR3YXJkZW5Qcm92aWRlciA9ICh7IGNoaWxkcmVuLCBsb2FkaW5nRmFsbGJhY2sgPSA8TG9hZGluZ0ZhbGxiYWNrIC8+IH06IEJpdHdhcmRlblByb3ZpZGVyUHJvcHMpID0+IHtcbiAgY29uc3QgW2JpdHdhcmRlbiwgc2V0Qml0d2FyZGVuXSA9IHVzZVN0YXRlPEJpdHdhcmRlbj4oKTtcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxFcnJvcj4oKTtcblxuICB1c2VPbmNlRWZmZWN0KCgpID0+IHtcbiAgICB2b2lkIG5ldyBCaXR3YXJkZW4oKS5pbml0aWFsaXplKCkudGhlbihzZXRCaXR3YXJkZW4pLmNhdGNoKGhhbmRsZUJ3SW5pdEVycm9yKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gaGFuZGxlQndJbml0RXJyb3IoZXJyb3I6IEVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvcikge1xuICAgICAgc2V0RXJyb3IoZXJyb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICBpZiAoZXJyb3IpIHJldHVybiA8VHJvdWJsZXNob290aW5nR3VpZGUgZXJyb3I9e2Vycm9yfSAvPjtcbiAgaWYgKCFiaXR3YXJkZW4pIHJldHVybiBsb2FkaW5nRmFsbGJhY2s7XG5cbiAgcmV0dXJuIDxCaXR3YXJkZW5Db250ZXh0LlByb3ZpZGVyIHZhbHVlPXtiaXR3YXJkZW59PntjaGlsZHJlbn08L0JpdHdhcmRlbkNvbnRleHQuUHJvdmlkZXI+O1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZUJpdHdhcmRlbiA9ICgpID0+IHtcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoQml0d2FyZGVuQ29udGV4dCk7XG4gIGlmIChjb250ZXh0ID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1c2VCaXR3YXJkZW4gbXVzdCBiZSB1c2VkIHdpdGhpbiBhIEJpdHdhcmRlblByb3ZpZGVyXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNvbnRleHQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBCaXR3YXJkZW5Db250ZXh0O1xuIiwgImltcG9ydCB7IGVudmlyb25tZW50LCBnZXRQcmVmZXJlbmNlVmFsdWVzLCBMb2NhbFN0b3JhZ2UsIG9wZW4sIHNob3dUb2FzdCwgVG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBleGVjYSwgRXhlY2FDaGlsZFByb2Nlc3MsIEV4ZWNhRXJyb3IsIEV4ZWNhUmV0dXJuVmFsdWUgfSBmcm9tIFwiZXhlY2FcIjtcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHVubGlua1N5bmMsIHdyaXRlRmlsZVN5bmMsIGFjY2Vzc1N5bmMsIGNvbnN0YW50cywgY2htb2RTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBMT0NBTF9TVE9SQUdFX0tFWSwgREVGQVVMVF9TRVJWRVJfVVJMLCBDQUNIRV9LRVlTIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcbmltcG9ydCB7IFZhdWx0U3RhdGUsIFZhdWx0U3RhdHVzIH0gZnJvbSBcIn4vdHlwZXMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zIH0gZnJvbSBcIn4vdHlwZXMvcGFzc3dvcmRzXCI7XG5pbXBvcnQgeyBGb2xkZXIsIEl0ZW0sIEl0ZW1UeXBlLCBMb2dpbiB9IGZyb20gXCJ+L3R5cGVzL3ZhdWx0XCI7XG5pbXBvcnQgeyBnZXRQYXNzd29yZEdlbmVyYXRpbmdBcmdzIH0gZnJvbSBcIn4vdXRpbHMvcGFzc3dvcmRzXCI7XG5pbXBvcnQgeyBnZXRTZXJ2ZXJVcmxQcmVmZXJlbmNlIH0gZnJvbSBcIn4vdXRpbHMvcHJlZmVyZW5jZXNcIjtcbmltcG9ydCB7XG4gIEVuc3VyZUNsaUJpbkVycm9yLFxuICBJbnN0YWxsZWRDTElOb3RGb3VuZEVycm9yLFxuICBNYW51YWxseVRocm93bkVycm9yLFxuICBOb3RMb2dnZWRJbkVycm9yLFxuICBQcmVtaXVtRmVhdHVyZUVycm9yLFxuICBTZW5kSW52YWxpZFBhc3N3b3JkRXJyb3IsXG4gIFNlbmROZWVkc1Bhc3N3b3JkRXJyb3IsXG4gIHRyeUV4ZWMsXG4gIFZhdWx0SXNMb2NrZWRFcnJvcixcbn0gZnJvbSBcIn4vdXRpbHMvZXJyb3JzXCI7XG5pbXBvcnQgeyBqb2luLCBkaXJuYW1lIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNobW9kLCByZW5hbWUsIHJtIH0gZnJvbSBcImZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyBkZWNvbXByZXNzRmlsZSwgcmVtb3ZlRmlsZXNUaGF0U3RhcnRXaXRoLCB1bmxpbmtBbGxTeW5jLCB3YWl0Rm9yRmlsZUF2YWlsYWJsZSB9IGZyb20gXCJ+L3V0aWxzL2ZzXCI7XG5pbXBvcnQgeyBkb3dubG9hZCB9IGZyb20gXCJ+L3V0aWxzL25ldHdvcmtcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuaW1wb3J0IHsgUmVjZWl2ZWRTZW5kLCBTZW5kLCBTZW5kQ3JlYXRlUGF5bG9hZCwgU2VuZFR5cGUgfSBmcm9tIFwifi90eXBlcy9zZW5kXCI7XG5pbXBvcnQgeyBwcmVwYXJlU2VuZFBheWxvYWQgfSBmcm9tIFwifi9hcGkvYml0d2FyZGVuLmhlbHBlcnNcIjtcbmltcG9ydCB7IENhY2hlIH0gZnJvbSBcIn4vdXRpbHMvY2FjaGVcIjtcbmltcG9ydCB7IHBsYXRmb3JtIH0gZnJvbSBcIn4vdXRpbHMvcGxhdGZvcm1cIjtcblxudHlwZSBFbnYgPSB7XG4gIEJJVFdBUkRFTkNMSV9BUFBEQVRBX0RJUjogc3RyaW5nO1xuICBCV19DTElFTlRTRUNSRVQ6IHN0cmluZztcbiAgQldfQ0xJRU5USUQ6IHN0cmluZztcbiAgUEFUSDogc3RyaW5nO1xuICBOT0RFX0VYVFJBX0NBX0NFUlRTPzogc3RyaW5nO1xuICBCV19TRVNTSU9OPzogc3RyaW5nO1xufTtcblxudHlwZSBBY3Rpb25MaXN0ZW5lcnMgPSB7XG4gIGxvZ2luPzogKCkgPT4gTWF5YmVQcm9taXNlPHZvaWQ+O1xuICBsb2dvdXQ/OiAocmVhc29uPzogc3RyaW5nKSA9PiBNYXliZVByb21pc2U8dm9pZD47XG4gIGxvY2s/OiAocmVhc29uPzogc3RyaW5nKSA9PiBNYXliZVByb21pc2U8dm9pZD47XG4gIHVubG9jaz86IChwYXNzd29yZDogc3RyaW5nLCBzZXNzaW9uVG9rZW46IHN0cmluZykgPT4gTWF5YmVQcm9taXNlPHZvaWQ+O1xufTtcblxudHlwZSBBY3Rpb25MaXN0ZW5lcnNNYXA8VCBleHRlbmRzIGtleW9mIEFjdGlvbkxpc3RlbmVycyA9IGtleW9mIEFjdGlvbkxpc3RlbmVycz4gPSBNYXA8VCwgU2V0PEFjdGlvbkxpc3RlbmVyc1tUXT4+O1xuXG50eXBlIE1heWJlRXJyb3I8VCA9IHVuZGVmaW5lZD4gPSB7IHJlc3VsdDogVDsgZXJyb3I/OiB1bmRlZmluZWQgfSB8IHsgcmVzdWx0PzogdW5kZWZpbmVkOyBlcnJvcjogTWFudWFsbHlUaHJvd25FcnJvciB9O1xuXG50eXBlIEV4ZWNQcm9wcyA9IHtcbiAgLyoqIFJlc2V0IHRoZSB0aW1lIG9mIHRoZSBsYXN0IGNvbW1hbmQgdGhhdCBhY2Nlc3NlZCBkYXRhIG9yIG1vZGlmaWVkIHRoZSB2YXVsdCwgdXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIHZhdWx0IHRpbWVkIG91dCAqL1xuICByZXNldFZhdWx0VGltZW91dDogYm9vbGVhbjtcbiAgYWJvcnRDb250cm9sbGVyPzogQWJvcnRDb250cm9sbGVyO1xuICBpbnB1dD86IHN0cmluZztcbn07XG5cbnR5cGUgTG9ja09wdGlvbnMgPSB7XG4gIC8qKiBUaGUgcmVhc29uIGZvciBsb2NraW5nIHRoZSB2YXVsdCAqL1xuICByZWFzb24/OiBzdHJpbmc7XG4gIGNoZWNrVmF1bHRTdGF0dXM/OiBib29sZWFuO1xuICAvKiogVGhlIGNhbGxiYWNrcyBhcmUgY2FsbGVkIGJlZm9yZSB0aGUgb3BlcmF0aW9uIGlzIGZpbmlzaGVkIChvcHRpbWlzdGljKSAqL1xuICBpbW1lZGlhdGU/OiBib29sZWFuO1xufTtcblxudHlwZSBMb2dvdXRPcHRpb25zID0ge1xuICAvKiogVGhlIHJlYXNvbiBmb3IgbG9ja2luZyB0aGUgdmF1bHQgKi9cbiAgcmVhc29uPzogc3RyaW5nO1xuICAvKiogVGhlIGNhbGxiYWNrcyBhcmUgY2FsbGVkIGJlZm9yZSB0aGUgb3BlcmF0aW9uIGlzIGZpbmlzaGVkIChvcHRpbWlzdGljKSAqL1xuICBpbW1lZGlhdGU/OiBib29sZWFuO1xufTtcblxudHlwZSBSZWNlaXZlU2VuZE9wdGlvbnMgPSB7XG4gIHNhdmVQYXRoPzogc3RyaW5nO1xuICBwYXNzd29yZD86IHN0cmluZztcbn07XG5cbnR5cGUgQ3JlYXRlTG9naW5JdGVtT3B0aW9ucyA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICB1c2VybmFtZT86IHN0cmluZztcbiAgcGFzc3dvcmQ6IHN0cmluZztcbiAgZm9sZGVySWQ6IHN0cmluZyB8IG51bGw7XG4gIHVyaT86IHN0cmluZztcbn07XG5cbmNvbnN0IHsgc3VwcG9ydFBhdGggfSA9IGVudmlyb25tZW50O1xuXG5jb25zdCBcdTAzOTQgPSBcIjRcIjsgLy8gY2hhbmdpbmcgdGhpcyBmb3JjZXMgYSBuZXcgYmluIGRvd25sb2FkIGZvciBwZW9wbGUgdGhhdCBoYWQgYSBmYWlsZWQgb25lXG5jb25zdCBCaW5Eb3dubG9hZExvZ2dlciA9ICgoKSA9PiB7XG4gIC8qIFRoZSBpZGVhIG9mIHRoaXMgbG9nZ2VyIGlzIHRvIHdyaXRlIGEgbG9nIGZpbGUgd2hlbiB0aGUgYmluIGRvd25sb2FkIGZhaWxzLCBzbyB0aGF0IHdlIGNhbiBsZXQgdGhlIGV4dGVuc2lvbiBjcmFzaCxcbiAgIGJ1dCBmYWxsYmFjayB0byB0aGUgbG9jYWwgY2xpIHBhdGggaW4gdGhlIG5leHQgbGF1bmNoLiBUaGlzIGFsbG93cyB0aGUgZXJyb3IgdG8gYmUgcmVwb3J0ZWQgaW4gdGhlIGlzc3VlcyBkYXNoYm9hcmQuIEl0IHVzZXMgZmlsZXMgdG8ga2VlcCBpdCBzeW5jaHJvbm91cywgYXMgaXQncyBuZWVkZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICAgQWx0aG91Z2gsIHRoZSBwbGFuIGlzIHRvIGRpc2NvbnRpbnVlIHRoaXMgbWV0aG9kLCBpZiB0aGVyZSdzIGEgYmV0dGVyIHdheSBvZiBsb2dnaW5nIGVycm9ycyBpbiB0aGUgaXNzdWVzIGRhc2hib2FyZFxuICAgb3IgdGhlcmUgYXJlIG5vIGNyYXNoZXMgcmVwb3J0ZWQgd2l0aCB0aGUgYmluIGRvd25sb2FkIGFmdGVyIHNvbWUgdGltZS4gKi9cbiAgY29uc3QgZmlsZVBhdGggPSBqb2luKHN1cHBvcnRQYXRoLCBgYnctYmluLWRvd25sb2FkLWVycm9yLSR7XHUwMzk0fS5sb2dgKTtcbiAgcmV0dXJuIHtcbiAgICBsb2dFcnJvcjogKGVycm9yOiBhbnkpID0+IHRyeUV4ZWMoKCkgPT4gd3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgZXJyb3I/Lm1lc3NhZ2UgPz8gXCJVbmV4cGVjdGVkIGVycm9yXCIpKSxcbiAgICBjbGVhckVycm9yOiAoKSA9PiB0cnlFeGVjKCgpID0+IHVubGlua1N5bmMoZmlsZVBhdGgpKSxcbiAgICBoYXNFcnJvcjogKCkgPT4gdHJ5RXhlYygoKSA9PiBleGlzdHNTeW5jKGZpbGVQYXRoKSwgZmFsc2UpLFxuICB9O1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IGNsaUluZm8gPSB7XG4gIHZlcnNpb246IFwiMjAyNS4yLjBcIixcbiAgZ2V0IHNoYTI1NigpIHtcbiAgICBpZiAocGxhdGZvcm0gPT09IFwid2luZG93c1wiKSByZXR1cm4gXCIzM2ExMzEwMTdhYzljOTlkNzIxZTQzMGE4NmU5MjkzODMzMTRkM2Y5MWM5ZjJmYmY0MTNkODcyNTY1NjU0YzE4XCI7XG4gICAgcmV0dXJuIFwiZmFkZTUxMDEyYTQ2MDExYzAxNmEyZTVhZWUyZjJlNTM0YzFlZDA3OGU0OWQxMTc4YTY5ZTI4ODlkMjgxMmE5NlwiO1xuICB9LFxuICBkb3dubG9hZFBhZ2U6IFwiaHR0cHM6Ly9naXRodWIuY29tL2JpdHdhcmRlbi9jbGllbnRzL3JlbGVhc2VzXCIsXG4gIHBhdGg6IHtcbiAgICBnZXQgZG93bmxvYWRlZEJpbigpIHtcbiAgICAgIHJldHVybiBqb2luKHN1cHBvcnRQYXRoLCBjbGlJbmZvLmJpbkZpbGVuYW1lVmVyc2lvbmVkKTtcbiAgICB9LFxuICAgIGdldCBpbnN0YWxsZWRCaW4oKSB7XG4gICAgICAvLyBXZSBhc3N1bWUgdGhhdCBpdCB3YXMgaW5zdGFsbGVkIHVzaW5nIENob2NvbGF0ZXksIGlmIG5vdCwgaXQncyBoYXJkIHRvIG1ha2UgYSBnb29kIGd1ZXNzLlxuICAgICAgaWYgKHBsYXRmb3JtID09PSBcIndpbmRvd3NcIikgcmV0dXJuIFwiQzpcXFxcUHJvZ3JhbURhdGFcXFxcY2hvY29sYXRleVxcXFxiaW5cXFxcYncuZXhlXCI7XG4gICAgICByZXR1cm4gcHJvY2Vzcy5hcmNoID09PSBcImFybTY0XCIgPyBcIi9vcHQvaG9tZWJyZXcvYmluL2J3XCIgOiBcIi91c3IvbG9jYWwvYmluL2J3XCI7XG4gICAgfSxcbiAgICBnZXQgYmluKCkge1xuICAgICAgcmV0dXJuICFCaW5Eb3dubG9hZExvZ2dlci5oYXNFcnJvcigpID8gdGhpcy5kb3dubG9hZGVkQmluIDogdGhpcy5pbnN0YWxsZWRCaW47XG4gICAgfSxcbiAgfSxcbiAgZ2V0IGJpbkZpbGVuYW1lKCkge1xuICAgIHJldHVybiBwbGF0Zm9ybSA9PT0gXCJ3aW5kb3dzXCIgPyBcImJ3LmV4ZVwiIDogXCJid1wiO1xuICB9LFxuICBnZXQgYmluRmlsZW5hbWVWZXJzaW9uZWQoKSB7XG4gICAgY29uc3QgbmFtZSA9IGBidy0ke3RoaXMudmVyc2lvbn1gO1xuICAgIHJldHVybiBwbGF0Zm9ybSA9PT0gXCJ3aW5kb3dzXCIgPyBgJHtuYW1lfS5leGVgIDogYCR7bmFtZX1gO1xuICB9LFxuICBnZXQgZG93bmxvYWRVcmwoKSB7XG4gICAgbGV0IGFyY2hTdWZmaXggPSBcIlwiO1xuICAgIGlmIChwbGF0Zm9ybSA9PT0gXCJtYWNvc1wiKSB7XG4gICAgICBhcmNoU3VmZml4ID0gcHJvY2Vzcy5hcmNoID09PSBcImFybTY0XCIgPyBcIi1hcm02NFwiIDogXCJcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7dGhpcy5kb3dubG9hZFBhZ2V9L2Rvd25sb2FkL2NsaS12JHt0aGlzLnZlcnNpb259L2J3LSR7cGxhdGZvcm19JHthcmNoU3VmZml4fS0ke3RoaXMudmVyc2lvbn0uemlwYDtcbiAgfSxcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjbGFzcyBCaXR3YXJkZW4ge1xuICBwcml2YXRlIGVudjogRW52O1xuICBwcml2YXRlIGluaXRQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuICBwcml2YXRlIHRlbXBTZXNzaW9uVG9rZW4/OiBzdHJpbmc7XG4gIHByaXZhdGUgYWN0aW9uTGlzdGVuZXJzOiBBY3Rpb25MaXN0ZW5lcnNNYXAgPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgcHJlZmVyZW5jZXMgPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpO1xuICBwcml2YXRlIGNsaVBhdGg6IHN0cmluZztcbiAgcHJpdmF0ZSB0b2FzdEluc3RhbmNlOiBUb2FzdCB8IHVuZGVmaW5lZDtcbiAgd2FzQ2xpVXBkYXRlZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHRvYXN0SW5zdGFuY2U/OiBUb2FzdCkge1xuICAgIGNvbnN0IHsgY2xpUGF0aDogY2xpUGF0aFByZWZlcmVuY2UsIGNsaWVudElkLCBjbGllbnRTZWNyZXQsIHNlcnZlckNlcnRzUGF0aCB9ID0gdGhpcy5wcmVmZXJlbmNlcztcbiAgICBjb25zdCBzZXJ2ZXJVcmwgPSBnZXRTZXJ2ZXJVcmxQcmVmZXJlbmNlKCk7XG5cbiAgICB0aGlzLnRvYXN0SW5zdGFuY2UgPSB0b2FzdEluc3RhbmNlO1xuICAgIHRoaXMuY2xpUGF0aCA9IGNsaVBhdGhQcmVmZXJlbmNlIHx8IGNsaUluZm8ucGF0aC5iaW47XG4gICAgdGhpcy5lbnYgPSB7XG4gICAgICBCSVRXQVJERU5DTElfQVBQREFUQV9ESVI6IHN1cHBvcnRQYXRoLFxuICAgICAgQldfQ0xJRU5UU0VDUkVUOiBjbGllbnRTZWNyZXQudHJpbSgpLFxuICAgICAgQldfQ0xJRU5USUQ6IGNsaWVudElkLnRyaW0oKSxcbiAgICAgIFBBVEg6IGRpcm5hbWUocHJvY2Vzcy5leGVjUGF0aCksXG4gICAgICAuLi4oc2VydmVyVXJsICYmIHNlcnZlckNlcnRzUGF0aCA/IHsgTk9ERV9FWFRSQV9DQV9DRVJUUzogc2VydmVyQ2VydHNQYXRoIH0gOiB7fSksXG4gICAgfTtcblxuICAgIHRoaXMuaW5pdFByb21pc2UgPSAoYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgYXdhaXQgdGhpcy5lbnN1cmVDbGlCaW5hcnkoKTtcbiAgICAgIHZvaWQgdGhpcy5yZXRyaWV2ZUFuZENhY2hlQ2xpVmVyc2lvbigpO1xuICAgICAgYXdhaXQgdGhpcy5jaGVja1NlcnZlclVybChzZXJ2ZXJVcmwpO1xuICAgIH0pKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGVuc3VyZUNsaUJpbmFyeSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5jaGVja0NsaUJpbklzUmVhZHkodGhpcy5jbGlQYXRoKSkgcmV0dXJuO1xuICAgIGlmICh0aGlzLmNsaVBhdGggPT09IHRoaXMucHJlZmVyZW5jZXMuY2xpUGF0aCB8fCB0aGlzLmNsaVBhdGggPT09IGNsaUluZm8ucGF0aC5pbnN0YWxsZWRCaW4pIHtcbiAgICAgIHRocm93IG5ldyBJbnN0YWxsZWRDTElOb3RGb3VuZEVycm9yKGBCaXR3YXJkZW4gQ0xJIG5vdCBmb3VuZCBhdCAke3RoaXMuY2xpUGF0aH1gKTtcbiAgICB9XG4gICAgaWYgKEJpbkRvd25sb2FkTG9nZ2VyLmhhc0Vycm9yKCkpIEJpbkRvd25sb2FkTG9nZ2VyLmNsZWFyRXJyb3IoKTtcblxuICAgIC8vIHJlbW92ZSBvbGQgYmluYXJpZXMgdG8gY2hlY2sgaWYgaXQncyBhbiB1cGRhdGUgYW5kIGJlY2F1c2UgdGhleSBhcmUgMTAwTUIrXG4gICAgY29uc3QgaGFkT2xkQmluYXJpZXMgPSBhd2FpdCByZW1vdmVGaWxlc1RoYXRTdGFydFdpdGgoXCJidy1cIiwgc3VwcG9ydFBhdGgpO1xuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgdGhpcy5zaG93VG9hc3Qoe1xuICAgICAgdGl0bGU6IGAke2hhZE9sZEJpbmFyaWVzID8gXCJVcGRhdGluZ1wiIDogXCJJbml0aWFsaXppbmdcIn0gQml0d2FyZGVuIENMSWAsXG4gICAgICBzdHlsZTogVG9hc3QuU3R5bGUuQW5pbWF0ZWQsXG4gICAgICBwcmltYXJ5QWN0aW9uOiB7IHRpdGxlOiBcIk9wZW4gRG93bmxvYWQgUGFnZVwiLCBvbkFjdGlvbjogKCkgPT4gb3BlbihjbGlJbmZvLmRvd25sb2FkUGFnZSkgfSxcbiAgICB9KTtcbiAgICBjb25zdCB0bXBGaWxlTmFtZSA9IFwiYncuemlwXCI7XG4gICAgY29uc3QgemlwUGF0aCA9IGpvaW4oc3VwcG9ydFBhdGgsIHRtcEZpbGVOYW1lKTtcblxuICAgIHRyeSB7XG4gICAgICB0cnkge1xuICAgICAgICB0b2FzdC5tZXNzYWdlID0gXCJEb3dubG9hZGluZy4uLlwiO1xuICAgICAgICBhd2FpdCBkb3dubG9hZChjbGlJbmZvLmRvd25sb2FkVXJsLCB6aXBQYXRoLCB7XG4gICAgICAgICAgb25Qcm9ncmVzczogKHBlcmNlbnQpID0+ICh0b2FzdC5tZXNzYWdlID0gYERvd25sb2FkaW5nICR7cGVyY2VudH0lYCksXG4gICAgICAgICAgc2hhMjU2OiBjbGlJbmZvLnNoYTI1NixcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChkb3dubG9hZEVycm9yKSB7XG4gICAgICAgIHRvYXN0LnRpdGxlID0gXCJGYWlsZWQgdG8gZG93bmxvYWQgQml0d2FyZGVuIENMSVwiO1xuICAgICAgICB0aHJvdyBkb3dubG9hZEVycm9yO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICB0b2FzdC5tZXNzYWdlID0gXCJFeHRyYWN0aW5nLi4uXCI7XG4gICAgICAgIGF3YWl0IGRlY29tcHJlc3NGaWxlKHppcFBhdGgsIHN1cHBvcnRQYXRoKTtcbiAgICAgICAgY29uc3QgZGVjb21wcmVzc2VkQmluUGF0aCA9IGpvaW4oc3VwcG9ydFBhdGgsIGNsaUluZm8uYmluRmlsZW5hbWUpO1xuXG4gICAgICAgIC8vIEZvciBzb21lIHJlYXNvbiB0aGlzIHJlbmFtZSBzdGFydGVkIHRocm93aW5nIGFuIGVycm9yIGFmdGVyIHN1Y2NlZWRpbmcsIHNvIGZvciBub3cgd2UncmUganVzdFxuICAgICAgICAvLyBjYXRjaGluZyBpdCBhbmQgY2hlY2tpbmcgaWYgdGhlIGZpbGUgZXhpc3RzIFx1MDBBRlxcXyhcdTMwQzQpXy9cdTAwQUZcbiAgICAgICAgYXdhaXQgcmVuYW1lKGRlY29tcHJlc3NlZEJpblBhdGgsIHRoaXMuY2xpUGF0aCkuY2F0Y2goKCkgPT4gbnVsbCk7XG4gICAgICAgIGF3YWl0IHdhaXRGb3JGaWxlQXZhaWxhYmxlKHRoaXMuY2xpUGF0aCk7XG5cbiAgICAgICAgYXdhaXQgY2htb2QodGhpcy5jbGlQYXRoLCBcIjc1NVwiKTtcbiAgICAgICAgYXdhaXQgcm0oemlwUGF0aCwgeyBmb3JjZTogdHJ1ZSB9KTtcblxuICAgICAgICBDYWNoZS5zZXQoQ0FDSEVfS0VZUy5DTElfVkVSU0lPTiwgY2xpSW5mby52ZXJzaW9uKTtcbiAgICAgICAgdGhpcy53YXNDbGlVcGRhdGVkID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGV4dHJhY3RFcnJvcikge1xuICAgICAgICB0b2FzdC50aXRsZSA9IFwiRmFpbGVkIHRvIGV4dHJhY3QgQml0d2FyZGVuIENMSVwiO1xuICAgICAgICB0aHJvdyBleHRyYWN0RXJyb3I7XG4gICAgICB9XG4gICAgICBhd2FpdCB0b2FzdC5oaWRlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRvYXN0Lm1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVuc3VyZUNsaUJpbkVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiUGxlYXNlIHRyeSBhZ2FpblwiO1xuICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5GYWlsdXJlO1xuXG4gICAgICB1bmxpbmtBbGxTeW5jKHppcFBhdGgsIHRoaXMuY2xpUGF0aCk7XG5cbiAgICAgIGlmICghZW52aXJvbm1lbnQuaXNEZXZlbG9wbWVudCkgQmluRG93bmxvYWRMb2dnZXIubG9nRXJyb3IoZXJyb3IpO1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHRocm93IG5ldyBFbnN1cmVDbGlCaW5FcnJvcihlcnJvci5tZXNzYWdlLCBlcnJvci5zdGFjayk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgdG9hc3QucmVzdG9yZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmV0cmlldmVBbmRDYWNoZUNsaVZlcnNpb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZXJyb3IsIHJlc3VsdCB9ID0gYXdhaXQgdGhpcy5nZXRWZXJzaW9uKCk7XG4gICAgICBpZiAoIWVycm9yKSBDYWNoZS5zZXQoQ0FDSEVfS0VZUy5DTElfVkVSU0lPTiwgcmVzdWx0KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byByZXRyaWV2ZSBhbmQgY2FjaGUgY2xpIHZlcnNpb25cIiwgZXJyb3IsIHsgY2FwdHVyZVRvUmF5Y2FzdDogdHJ1ZSB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNoZWNrQ2xpQmluSXNSZWFkeShmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZXhpc3RzU3luYyh0aGlzLmNsaVBhdGgpKSByZXR1cm4gZmFsc2U7XG4gICAgICBhY2Nlc3NTeW5jKGZpbGVQYXRoLCBjb25zdGFudHMuWF9PSyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGNobW9kU3luYyhmaWxlUGF0aCwgXCI3NTVcIik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBzZXRTZXNzaW9uVG9rZW4odG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuZW52ID0ge1xuICAgICAgLi4udGhpcy5lbnYsXG4gICAgICBCV19TRVNTSU9OOiB0b2tlbixcbiAgICB9O1xuICB9XG5cbiAgY2xlYXJTZXNzaW9uVG9rZW4oKTogdm9pZCB7XG4gICAgZGVsZXRlIHRoaXMuZW52LkJXX1NFU1NJT047XG4gIH1cblxuICB3aXRoU2Vzc2lvbih0b2tlbjogc3RyaW5nKTogdGhpcyB7XG4gICAgdGhpcy50ZW1wU2Vzc2lvblRva2VuID0gdG9rZW47XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dGhpcz4ge1xuICAgIGF3YWl0IHRoaXMuaW5pdFByb21pc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBjaGVja1NlcnZlclVybChzZXJ2ZXJVcmw6IHN0cmluZyB8IHVuZGVmaW5lZCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIENoZWNrIHRoZSBDTEkgaGFzIGJlZW4gY29uZmlndXJlZCB0byB1c2UgdGhlIHByZWZlcmVuY2UgVXJsXG4gICAgY29uc3Qgc3RvcmVkU2VydmVyID0gYXdhaXQgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5TRVJWRVJfVVJMKTtcbiAgICBpZiAoIXNlcnZlclVybCB8fCBzdG9yZWRTZXJ2ZXIgPT09IHNlcnZlclVybCkgcmV0dXJuO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzZXJ2ZXIgVXJsXG4gICAgY29uc3QgdG9hc3QgPSBhd2FpdCB0aGlzLnNob3dUb2FzdCh7XG4gICAgICBzdHlsZTogVG9hc3QuU3R5bGUuQW5pbWF0ZWQsXG4gICAgICB0aXRsZTogXCJTd2l0Y2hpbmcgc2VydmVyLi4uXCIsXG4gICAgICBtZXNzYWdlOiBcIkJpdHdhcmRlbiBzZXJ2ZXIgcHJlZmVyZW5jZSBjaGFuZ2VkXCIsXG4gICAgfSk7XG4gICAgdHJ5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9nb3V0KCk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gSXQgZG9lc24ndCBtYXR0ZXIgaWYgd2Ugd2VyZW4ndCBsb2dnZWQgaW4uXG4gICAgICB9XG4gICAgICAvLyBJZiBVUkwgaXMgZW1wdHksIHNldCBpdCB0byB0aGUgZGVmYXVsdFxuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImNvbmZpZ1wiLCBcInNlcnZlclwiLCBzZXJ2ZXJVcmwgfHwgREVGQVVMVF9TRVJWRVJfVVJMXSwgeyByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICBhd2FpdCBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5TRVJWRVJfVVJMLCBzZXJ2ZXJVcmwpO1xuXG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLlN1Y2Nlc3M7XG4gICAgICB0b2FzdC50aXRsZSA9IFwiU3VjY2Vzc1wiO1xuICAgICAgdG9hc3QubWVzc2FnZSA9IFwiQml0d2FyZGVuIHNlcnZlciBjaGFuZ2VkXCI7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuRmFpbHVyZTtcbiAgICAgIHRvYXN0LnRpdGxlID0gXCJGYWlsZWQgdG8gc3dpdGNoIHNlcnZlclwiO1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdG9hc3QubWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2FzdC5tZXNzYWdlID0gXCJVbmtub3duIGVycm9yIG9jY3VycmVkXCI7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGF3YWl0IHRvYXN0LnJlc3RvcmUoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGV4ZWMoYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IEV4ZWNQcm9wcyk6IFByb21pc2U8RXhlY2FDaGlsZFByb2Nlc3M+IHtcbiAgICBjb25zdCB7IGFib3J0Q29udHJvbGxlciwgaW5wdXQgPSBcIlwiLCByZXNldFZhdWx0VGltZW91dCB9ID0gb3B0aW9ucyA/PyB7fTtcblxuICAgIGxldCBlbnYgPSB0aGlzLmVudjtcbiAgICBpZiAodGhpcy50ZW1wU2Vzc2lvblRva2VuKSB7XG4gICAgICBlbnYgPSB7IC4uLmVudiwgQldfU0VTU0lPTjogdGhpcy50ZW1wU2Vzc2lvblRva2VuIH07XG4gICAgICB0aGlzLnRlbXBTZXNzaW9uVG9rZW4gPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY2EodGhpcy5jbGlQYXRoLCBhcmdzLCB7IGlucHV0LCBlbnYsIHNpZ25hbDogYWJvcnRDb250cm9sbGVyPy5zaWduYWwgfSk7XG5cbiAgICBpZiAodGhpcy5pc1Byb21wdFdhaXRpbmdGb3JNYXN0ZXJQYXNzd29yZChyZXN1bHQpKSB7XG4gICAgICAvKiBzaW5jZSB3ZSBoYXZlIHRoZSBzZXNzaW9uIHRva2VuIGluIHRoZSBlbnYsIHRoZSBwYXNzd29yZCBcbiAgICAgIHNob3VsZCBub3QgYmUgcmVxdWVzdGVkLCB1bmxlc3MgdGhlIHZhdWx0IGlzIGxvY2tlZCAqL1xuICAgICAgYXdhaXQgdGhpcy5sb2NrKCk7XG4gICAgICB0aHJvdyBuZXcgVmF1bHRJc0xvY2tlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlc2V0VmF1bHRUaW1lb3V0KSB7XG4gICAgICBhd2FpdCBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5MQVNUX0FDVElWSVRZX1RJTUUsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGFzeW5jIGdldFZlcnNpb24oKTogUHJvbWlzZTxNYXliZUVycm9yPHN0cmluZz4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQ6IHJlc3VsdCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcIi0tdmVyc2lvblwiXSwgeyByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IGNsaSB2ZXJzaW9uXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsb2dpbigpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImxvZ2luXCIsIFwiLS1hcGlrZXlcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJsb2dpblwiLCBcInVubG9ja2VkXCIpO1xuICAgICAgYXdhaXQgdGhpcy5jYWxsQWN0aW9uTGlzdGVuZXJzKFwibG9naW5cIik7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsb2dpblwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbG9nb3V0KG9wdGlvbnM/OiBMb2dvdXRPcHRpb25zKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgY29uc3QgeyByZWFzb24sIGltbWVkaWF0ZSA9IGZhbHNlIH0gPSBvcHRpb25zID8/IHt9O1xuICAgIHRyeSB7XG4gICAgICBpZiAoaW1tZWRpYXRlKSBhd2FpdCB0aGlzLmhhbmRsZVBvc3RMb2dvdXQocmVhc29uKTtcblxuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImxvZ291dFwiXSwgeyByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJsb2dvdXRcIiwgXCJ1bmF1dGhlbnRpY2F0ZWRcIik7XG4gICAgICBpZiAoIWltbWVkaWF0ZSkgYXdhaXQgdGhpcy5oYW5kbGVQb3N0TG9nb3V0KHJlYXNvbik7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsb2dvdXRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxvY2sob3B0aW9ucz86IExvY2tPcHRpb25zKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgY29uc3QgeyByZWFzb24sIGNoZWNrVmF1bHRTdGF0dXMgPSBmYWxzZSwgaW1tZWRpYXRlID0gZmFsc2UgfSA9IG9wdGlvbnMgPz8ge307XG4gICAgdHJ5IHtcbiAgICAgIGlmIChpbW1lZGlhdGUpIGF3YWl0IHRoaXMuY2FsbEFjdGlvbkxpc3RlbmVycyhcImxvY2tcIiwgcmVhc29uKTtcbiAgICAgIGlmIChjaGVja1ZhdWx0U3RhdHVzKSB7XG4gICAgICAgIGNvbnN0IHsgZXJyb3IsIHJlc3VsdCB9ID0gYXdhaXQgdGhpcy5zdGF0dXMoKTtcbiAgICAgICAgaWYgKGVycm9yKSB0aHJvdyBlcnJvcjtcbiAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwidW5hdXRoZW50aWNhdGVkXCIpIHJldHVybiB7IGVycm9yOiBuZXcgTm90TG9nZ2VkSW5FcnJvcihcIk5vdCBsb2dnZWQgaW5cIikgfTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImxvY2tcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwibG9ja1wiLCBcImxvY2tlZFwiKTtcbiAgICAgIGlmICghaW1tZWRpYXRlKSBhd2FpdCB0aGlzLmNhbGxBY3Rpb25MaXN0ZW5lcnMoXCJsb2NrXCIsIHJlYXNvbik7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsb2NrIHZhdWx0XCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyB1bmxvY2socGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcjxzdHJpbmc+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0OiBzZXNzaW9uVG9rZW4gfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJ1bmxvY2tcIiwgcGFzc3dvcmQsIFwiLS1yYXdcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICB0aGlzLnNldFNlc3Npb25Ub2tlbihzZXNzaW9uVG9rZW4pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwidW5sb2NrXCIsIFwidW5sb2NrZWRcIik7XG4gICAgICBhd2FpdCB0aGlzLmNhbGxBY3Rpb25MaXN0ZW5lcnMoXCJ1bmxvY2tcIiwgcGFzc3dvcmQsIHNlc3Npb25Ub2tlbik7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHNlc3Npb25Ub2tlbiB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byB1bmxvY2sgdmF1bHRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN5bmMoKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJzeW5jXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gc3luYyB2YXVsdFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0SXRlbShpZDogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPEl0ZW0+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiZ2V0XCIsIFwiaXRlbVwiLCBpZF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8SXRlbT4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZXQgaXRlbVwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbGlzdEl0ZW1zKCk6IFByb21pc2U8TWF5YmVFcnJvcjxJdGVtW10+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wibGlzdFwiLCBcIml0ZW1zXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgY29uc3QgaXRlbXMgPSBKU09OLnBhcnNlPEl0ZW1bXT4oc3Rkb3V0KTtcbiAgICAgIC8vIEZpbHRlciBvdXQgaXRlbXMgd2l0aG91dCBhIG5hbWUgcHJvcGVydHkgKHRoZXkgYXJlIG5vdCBkaXNwbGF5ZWQgaW4gdGhlIGJpdHdhcmRlbiBhcHApXG4gICAgICByZXR1cm4geyByZXN1bHQ6IGl0ZW1zLmZpbHRlcigoaXRlbTogSXRlbSkgPT4gISFpdGVtLm5hbWUpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGxpc3QgaXRlbXNcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZUxvZ2luSXRlbShvcHRpb25zOiBDcmVhdGVMb2dpbkl0ZW1PcHRpb25zKTogUHJvbWlzZTxNYXliZUVycm9yPEl0ZW0+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZXJyb3I6IGl0ZW1UZW1wbGF0ZUVycm9yLCByZXN1bHQ6IGl0ZW1UZW1wbGF0ZSB9ID0gYXdhaXQgdGhpcy5nZXRUZW1wbGF0ZTxJdGVtPihcIml0ZW1cIik7XG4gICAgICBpZiAoaXRlbVRlbXBsYXRlRXJyb3IpIHRocm93IGl0ZW1UZW1wbGF0ZUVycm9yO1xuXG4gICAgICBjb25zdCB7IGVycm9yOiBsb2dpblRlbXBsYXRlRXJyb3IsIHJlc3VsdDogbG9naW5UZW1wbGF0ZSB9ID0gYXdhaXQgdGhpcy5nZXRUZW1wbGF0ZTxMb2dpbj4oXCJpdGVtLmxvZ2luXCIpO1xuICAgICAgaWYgKGxvZ2luVGVtcGxhdGVFcnJvcikgdGhyb3cgbG9naW5UZW1wbGF0ZUVycm9yO1xuXG4gICAgICBpdGVtVGVtcGxhdGUubmFtZSA9IG9wdGlvbnMubmFtZTtcbiAgICAgIGl0ZW1UZW1wbGF0ZS50eXBlID0gSXRlbVR5cGUuTE9HSU47XG4gICAgICBpdGVtVGVtcGxhdGUuZm9sZGVySWQgPSBvcHRpb25zLmZvbGRlcklkIHx8IG51bGw7XG4gICAgICBpdGVtVGVtcGxhdGUubG9naW4gPSBsb2dpblRlbXBsYXRlO1xuICAgICAgaXRlbVRlbXBsYXRlLm5vdGVzID0gbnVsbDtcblxuICAgICAgbG9naW5UZW1wbGF0ZS51c2VybmFtZSA9IG9wdGlvbnMudXNlcm5hbWUgfHwgbnVsbDtcbiAgICAgIGxvZ2luVGVtcGxhdGUucGFzc3dvcmQgPSBvcHRpb25zLnBhc3N3b3JkO1xuICAgICAgbG9naW5UZW1wbGF0ZS50b3RwID0gbnVsbDtcbiAgICAgIGxvZ2luVGVtcGxhdGUuZmlkbzJDcmVkZW50aWFscyA9IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKG9wdGlvbnMudXJpKSB7XG4gICAgICAgIGxvZ2luVGVtcGxhdGUudXJpcyA9IFt7IG1hdGNoOiBudWxsLCB1cmk6IG9wdGlvbnMudXJpIH1dO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7IHJlc3VsdDogZW5jb2RlZEl0ZW0sIGVycm9yOiBlbmNvZGVFcnJvciB9ID0gYXdhaXQgdGhpcy5lbmNvZGUoSlNPTi5zdHJpbmdpZnkoaXRlbVRlbXBsYXRlKSk7XG4gICAgICBpZiAoZW5jb2RlRXJyb3IpIHRocm93IGVuY29kZUVycm9yO1xuXG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImNyZWF0ZVwiLCBcIml0ZW1cIiwgZW5jb2RlZEl0ZW1dLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPEl0ZW0+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gY3JlYXRlIGxvZ2luIGl0ZW1cIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxpc3RGb2xkZXJzKCk6IFByb21pc2U8TWF5YmVFcnJvcjxGb2xkZXJbXT4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJsaXN0XCIsIFwiZm9sZGVyc1wiXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxGb2xkZXJbXT4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsaXN0IGZvbGRlclwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY3JlYXRlRm9sZGVyKG5hbWU6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVycm9yLCByZXN1bHQ6IGZvbGRlciB9ID0gYXdhaXQgdGhpcy5nZXRUZW1wbGF0ZShcImZvbGRlclwiKTtcbiAgICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG5cbiAgICAgIGZvbGRlci5uYW1lID0gbmFtZTtcbiAgICAgIGNvbnN0IHsgcmVzdWx0OiBlbmNvZGVkRm9sZGVyLCBlcnJvcjogZW5jb2RlRXJyb3IgfSA9IGF3YWl0IHRoaXMuZW5jb2RlKEpTT04uc3RyaW5naWZ5KGZvbGRlcikpO1xuICAgICAgaWYgKGVuY29kZUVycm9yKSB0aHJvdyBlbmNvZGVFcnJvcjtcblxuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImNyZWF0ZVwiLCBcImZvbGRlclwiLCBlbmNvZGVkRm9sZGVyXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogdW5kZWZpbmVkIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNyZWF0ZSBmb2xkZXJcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldFRvdHAoaWQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcjxzdHJpbmc+PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIHRoaXMgY291bGQgcmV0dXJuIHNvbWV0aGluZyBsaWtlIFwiTm90IGZvdW5kLlwiIGJ1dCBjaGVja3MgZm9yIHRvdHAgY29kZSBhcmUgZG9uZSBiZWZvcmUgY2FsbGluZyB0aGlzIGZ1bmN0aW9uXG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImdldFwiLCBcInRvdHBcIiwgaWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBzdGRvdXQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IFRPVFBcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN0YXR1cygpOiBQcm9taXNlPE1heWJlRXJyb3I8VmF1bHRTdGF0ZT4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJzdGF0dXNcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFZhdWx0U3RhdGU+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IHN0YXR1c1wiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY2hlY2tMb2NrU3RhdHVzKCk6IFByb21pc2U8VmF1bHRTdGF0dXM+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcInVubG9ja1wiLCBcIi0tY2hlY2tcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwiY2hlY2tMb2NrU3RhdHVzXCIsIFwidW5sb2NrZWRcIik7XG4gICAgICByZXR1cm4gXCJ1bmxvY2tlZFwiO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNoZWNrIGxvY2sgc3RhdHVzXCIsIGVycm9yKTtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IChlcnJvciBhcyBFeGVjYUVycm9yKS5zdGRlcnI7XG4gICAgICBpZiAoZXJyb3JNZXNzYWdlID09PSBcIlZhdWx0IGlzIGxvY2tlZC5cIikge1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJjaGVja0xvY2tTdGF0dXNcIiwgXCJsb2NrZWRcIik7XG4gICAgICAgIHJldHVybiBcImxvY2tlZFwiO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwiY2hlY2tMb2NrU3RhdHVzXCIsIFwidW5hdXRoZW50aWNhdGVkXCIpO1xuICAgICAgcmV0dXJuIFwidW5hdXRoZW50aWNhdGVkXCI7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0VGVtcGxhdGU8VCA9IGFueT4odHlwZTogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPFQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiZ2V0XCIsIFwidGVtcGxhdGVcIiwgdHlwZV0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8VD4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZXQgdGVtcGxhdGVcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGVuY29kZShpbnB1dDogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPHN0cmluZz4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJlbmNvZGVcIl0sIHsgaW5wdXQsIHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogc3Rkb3V0IH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGVuY29kZVwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2VuZXJhdGVQYXNzd29yZChvcHRpb25zPzogUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zLCBhYm9ydENvbnRyb2xsZXI/OiBBYm9ydENvbnRyb2xsZXIpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGFyZ3MgPSBvcHRpb25zID8gZ2V0UGFzc3dvcmRHZW5lcmF0aW5nQXJncyhvcHRpb25zKSA6IFtdO1xuICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiZ2VuZXJhdGVcIiwgLi4uYXJnc10sIHsgYWJvcnRDb250cm9sbGVyLCByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgcmV0dXJuIHN0ZG91dDtcbiAgfVxuXG4gIGFzeW5jIGxpc3RTZW5kcygpOiBQcm9taXNlPE1heWJlRXJyb3I8U2VuZFtdPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJsaXN0XCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFNlbmRbXT4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsaXN0IHNlbmRzXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjcmVhdGVTZW5kKHZhbHVlczogU2VuZENyZWF0ZVBheWxvYWQpOiBQcm9taXNlPE1heWJlRXJyb3I8U2VuZD4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBlcnJvcjogdGVtcGxhdGVFcnJvciwgcmVzdWx0OiB0ZW1wbGF0ZSB9ID0gYXdhaXQgdGhpcy5nZXRUZW1wbGF0ZShcbiAgICAgICAgdmFsdWVzLnR5cGUgPT09IFNlbmRUeXBlLlRleHQgPyBcInNlbmQudGV4dFwiIDogXCJzZW5kLmZpbGVcIlxuICAgICAgKTtcbiAgICAgIGlmICh0ZW1wbGF0ZUVycm9yKSB0aHJvdyB0ZW1wbGF0ZUVycm9yO1xuXG4gICAgICBjb25zdCBwYXlsb2FkID0gcHJlcGFyZVNlbmRQYXlsb2FkKHRlbXBsYXRlLCB2YWx1ZXMpO1xuICAgICAgY29uc3QgeyByZXN1bHQ6IGVuY29kZWRQYXlsb2FkLCBlcnJvcjogZW5jb2RlRXJyb3IgfSA9IGF3YWl0IHRoaXMuZW5jb2RlKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKTtcbiAgICAgIGlmIChlbmNvZGVFcnJvcikgdGhyb3cgZW5jb2RlRXJyb3I7XG5cbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcImNyZWF0ZVwiLCBlbmNvZGVkUGF5bG9hZF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG5cbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxTZW5kPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNyZWF0ZSBzZW5kXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBlZGl0U2VuZCh2YWx1ZXM6IFNlbmRDcmVhdGVQYXlsb2FkKTogUHJvbWlzZTxNYXliZUVycm9yPFNlbmQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgcmVzdWx0OiBlbmNvZGVkUGF5bG9hZCwgZXJyb3I6IGVuY29kZUVycm9yIH0gPSBhd2FpdCB0aGlzLmVuY29kZShKU09OLnN0cmluZ2lmeSh2YWx1ZXMpKTtcbiAgICAgIGlmIChlbmNvZGVFcnJvcikgdGhyb3cgZW5jb2RlRXJyb3I7XG5cbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcImVkaXRcIiwgZW5jb2RlZFBheWxvYWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFNlbmQ+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZGVsZXRlIHNlbmRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZVNlbmQoaWQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcImRlbGV0ZVwiLCBpZF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBkZWxldGUgc2VuZFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVtb3ZlU2VuZFBhc3N3b3JkKGlkOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJyZW1vdmUtcGFzc3dvcmRcIiwgaWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gcmVtb3ZlIHNlbmQgcGFzc3dvcmRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlY2VpdmVTZW5kSW5mbyh1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlY2VpdmVTZW5kT3B0aW9ucyk6IFByb21pc2U8TWF5YmVFcnJvcjxSZWNlaXZlZFNlbmQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0LCBzdGRlcnIgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJzZW5kXCIsIFwicmVjZWl2ZVwiLCB1cmwsIFwiLS1vYmpcIl0sIHtcbiAgICAgICAgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUsXG4gICAgICAgIGlucHV0OiBvcHRpb25zPy5wYXNzd29yZCxcbiAgICAgIH0pO1xuICAgICAgaWYgKCFzdGRvdXQgJiYgL0ludmFsaWQgcGFzc3dvcmQvaS50ZXN0KHN0ZGVycikpIHJldHVybiB7IGVycm9yOiBuZXcgU2VuZEludmFsaWRQYXNzd29yZEVycm9yKCkgfTtcbiAgICAgIGlmICghc3Rkb3V0ICYmIC9TZW5kIHBhc3N3b3JkL2kudGVzdChzdGRlcnIpKSByZXR1cm4geyBlcnJvcjogbmV3IFNlbmROZWVkc1Bhc3N3b3JkRXJyb3IoKSB9O1xuXG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8UmVjZWl2ZWRTZW5kPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAoZXhlY0Vycm9yIGFzIEV4ZWNhRXJyb3IpLnN0ZGVycjtcbiAgICAgIGlmICgvSW52YWxpZCBwYXNzd29yZC9naS50ZXN0KGVycm9yTWVzc2FnZSkpIHJldHVybiB7IGVycm9yOiBuZXcgU2VuZEludmFsaWRQYXNzd29yZEVycm9yKCkgfTtcbiAgICAgIGlmICgvU2VuZCBwYXNzd29yZC9naS50ZXN0KGVycm9yTWVzc2FnZSkpIHJldHVybiB7IGVycm9yOiBuZXcgU2VuZE5lZWRzUGFzc3dvcmRFcnJvcigpIH07XG5cbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gcmVjZWl2ZSBzZW5kIG9ialwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVjZWl2ZVNlbmQodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZWNlaXZlU2VuZE9wdGlvbnMpOiBQcm9taXNlPE1heWJlRXJyb3I8c3RyaW5nPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHNhdmVQYXRoLCBwYXNzd29yZCB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICAgIGNvbnN0IGFyZ3MgPSBbXCJzZW5kXCIsIFwicmVjZWl2ZVwiLCB1cmxdO1xuICAgICAgaWYgKHNhdmVQYXRoKSBhcmdzLnB1c2goXCItLW91dHB1dFwiLCBzYXZlUGF0aCk7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKGFyZ3MsIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUsIGlucHV0OiBwYXNzd29yZCB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogc3Rkb3V0IH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHJlY2VpdmUgc2VuZFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgLy8gdXRpbHMgYmVsb3dcblxuICBhc3luYyBzYXZlTGFzdFZhdWx0U3RhdHVzKGNhbGxOYW1lOiBzdHJpbmcsIHN0YXR1czogVmF1bHRTdGF0dXMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5WQVVMVF9MQVNUX1NUQVRVUywgc3RhdHVzKTtcbiAgfVxuXG4gIGFzeW5jIGdldExhc3RTYXZlZFZhdWx0U3RhdHVzKCk6IFByb21pc2U8VmF1bHRTdGF0dXMgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBsYXN0U2F2ZWRTdGF0dXMgPSBhd2FpdCBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxWYXVsdFN0YXR1cz4oTE9DQUxfU1RPUkFHRV9LRVkuVkFVTFRfTEFTVF9TVEFUVVMpO1xuICAgIGlmICghbGFzdFNhdmVkU3RhdHVzKSB7XG4gICAgICBjb25zdCB2YXVsdFN0YXR1cyA9IGF3YWl0IHRoaXMuc3RhdHVzKCk7XG4gICAgICByZXR1cm4gdmF1bHRTdGF0dXMucmVzdWx0Py5zdGF0dXM7XG4gICAgfVxuICAgIHJldHVybiBsYXN0U2F2ZWRTdGF0dXM7XG4gIH1cblxuICBwcml2YXRlIGlzUHJvbXB0V2FpdGluZ0Zvck1hc3RlclBhc3N3b3JkKHJlc3VsdDogRXhlY2FSZXR1cm5WYWx1ZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIShyZXN1bHQuc3RkZXJyICYmIHJlc3VsdC5zdGRlcnIuaW5jbHVkZXMoXCJNYXN0ZXIgcGFzc3dvcmRcIikpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVQb3N0TG9nb3V0KHJlYXNvbj86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuY2xlYXJTZXNzaW9uVG9rZW4oKTtcbiAgICBhd2FpdCB0aGlzLmNhbGxBY3Rpb25MaXN0ZW5lcnMoXCJsb2dvdXRcIiwgcmVhc29uKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlQ29tbW9uRXJyb3JzKGVycm9yOiBhbnkpOiBQcm9taXNlPHsgZXJyb3I/OiBNYW51YWxseVRocm93bkVycm9yIH0+IHtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAoZXJyb3IgYXMgRXhlY2FFcnJvcikuc3RkZXJyO1xuICAgIGlmICghZXJyb3JNZXNzYWdlKSByZXR1cm4ge307XG5cbiAgICBpZiAoL25vdCBsb2dnZWQgaW4vaS50ZXN0KGVycm9yTWVzc2FnZSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUG9zdExvZ291dCgpO1xuICAgICAgcmV0dXJuIHsgZXJyb3I6IG5ldyBOb3RMb2dnZWRJbkVycm9yKFwiTm90IGxvZ2dlZCBpblwiKSB9O1xuICAgIH1cbiAgICBpZiAoL1ByZW1pdW0gc3RhdHVzL2kudGVzdChlcnJvck1lc3NhZ2UpKSB7XG4gICAgICByZXR1cm4geyBlcnJvcjogbmV3IFByZW1pdW1GZWF0dXJlRXJyb3IoKSB9O1xuICAgIH1cbiAgICByZXR1cm4ge307XG4gIH1cblxuICBzZXRBY3Rpb25MaXN0ZW5lcjxBIGV4dGVuZHMga2V5b2YgQWN0aW9uTGlzdGVuZXJzPihhY3Rpb246IEEsIGxpc3RlbmVyOiBBY3Rpb25MaXN0ZW5lcnNbQV0pOiB0aGlzIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmFjdGlvbkxpc3RlbmVycy5nZXQoYWN0aW9uKTtcbiAgICBpZiAobGlzdGVuZXJzICYmIGxpc3RlbmVycy5zaXplID4gMCkge1xuICAgICAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWN0aW9uTGlzdGVuZXJzLnNldChhY3Rpb24sIG5ldyBTZXQoW2xpc3RlbmVyXSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbW92ZUFjdGlvbkxpc3RlbmVyPEEgZXh0ZW5kcyBrZXlvZiBBY3Rpb25MaXN0ZW5lcnM+KGFjdGlvbjogQSwgbGlzdGVuZXI6IEFjdGlvbkxpc3RlbmVyc1tBXSk6IHRoaXMge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuYWN0aW9uTGlzdGVuZXJzLmdldChhY3Rpb24pO1xuICAgIGlmIChsaXN0ZW5lcnMgJiYgbGlzdGVuZXJzLnNpemUgPiAwKSB7XG4gICAgICBsaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNhbGxBY3Rpb25MaXN0ZW5lcnM8QSBleHRlbmRzIGtleW9mIEFjdGlvbkxpc3RlbmVycz4oXG4gICAgYWN0aW9uOiBBLFxuICAgIC4uLmFyZ3M6IFBhcmFtZXRlcnM8Tm9uTnVsbGFibGU8QWN0aW9uTGlzdGVuZXJzW0FdPj5cbiAgKSB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5hY3Rpb25MaXN0ZW5lcnMuZ2V0KGFjdGlvbik7XG4gICAgaWYgKGxpc3RlbmVycyAmJiBsaXN0ZW5lcnMuc2l6ZSA+IDApIHtcbiAgICAgIGZvciAoY29uc3QgbGlzdGVuZXIgb2YgbGlzdGVuZXJzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgKGxpc3RlbmVyIGFzIGFueSk/LiguLi5hcmdzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKGBFcnJvciBjYWxsaW5nIGJpdHdhcmRlbiBhY3Rpb24gbGlzdGVuZXIgZm9yICR7YWN0aW9ufWAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2hvd1RvYXN0ID0gYXN5bmMgKHRvYXN0T3B0czogVG9hc3QuT3B0aW9ucyk6IFByb21pc2U8VG9hc3QgJiB7IHJlc3RvcmU6ICgpID0+IFByb21pc2U8dm9pZD4gfT4gPT4ge1xuICAgIGlmICh0aGlzLnRvYXN0SW5zdGFuY2UpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzU3RhdGVUb2FzdE9wdHM6IFRvYXN0Lk9wdGlvbnMgPSB7XG4gICAgICAgIG1lc3NhZ2U6IHRoaXMudG9hc3RJbnN0YW5jZS5tZXNzYWdlLFxuICAgICAgICB0aXRsZTogdGhpcy50b2FzdEluc3RhbmNlLnRpdGxlLFxuICAgICAgICBwcmltYXJ5QWN0aW9uOiB0aGlzLnRvYXN0SW5zdGFuY2UucHJpbWFyeUFjdGlvbixcbiAgICAgICAgc2Vjb25kYXJ5QWN0aW9uOiB0aGlzLnRvYXN0SW5zdGFuY2Uuc2Vjb25kYXJ5QWN0aW9uLFxuICAgICAgfTtcblxuICAgICAgaWYgKHRvYXN0T3B0cy5zdHlsZSkgdGhpcy50b2FzdEluc3RhbmNlLnN0eWxlID0gdG9hc3RPcHRzLnN0eWxlO1xuICAgICAgdGhpcy50b2FzdEluc3RhbmNlLm1lc3NhZ2UgPSB0b2FzdE9wdHMubWVzc2FnZTtcbiAgICAgIHRoaXMudG9hc3RJbnN0YW5jZS50aXRsZSA9IHRvYXN0T3B0cy50aXRsZTtcbiAgICAgIHRoaXMudG9hc3RJbnN0YW5jZS5wcmltYXJ5QWN0aW9uID0gdG9hc3RPcHRzLnByaW1hcnlBY3Rpb247XG4gICAgICB0aGlzLnRvYXN0SW5zdGFuY2Uuc2Vjb25kYXJ5QWN0aW9uID0gdG9hc3RPcHRzLnNlY29uZGFyeUFjdGlvbjtcbiAgICAgIGF3YWl0IHRoaXMudG9hc3RJbnN0YW5jZS5zaG93KCk7XG5cbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHRoaXMudG9hc3RJbnN0YW5jZSwge1xuICAgICAgICByZXN0b3JlOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5zaG93VG9hc3QocHJldmlvdXNTdGF0ZVRvYXN0T3B0cyk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdG9hc3QgPSBhd2FpdCBzaG93VG9hc3QodG9hc3RPcHRzKTtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHRvYXN0LCB7IHJlc3RvcmU6ICgpID0+IHRvYXN0LmhpZGUoKSB9KTtcbiAgICB9XG4gIH07XG59XG4iLCAiaW1wb3J0IHtCdWZmZXJ9IGZyb20gJ25vZGU6YnVmZmVyJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgY2hpbGRQcm9jZXNzIGZyb20gJ25vZGU6Y2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IGNyb3NzU3Bhd24gZnJvbSAnY3Jvc3Mtc3Bhd24nO1xuaW1wb3J0IHN0cmlwRmluYWxOZXdsaW5lIGZyb20gJ3N0cmlwLWZpbmFsLW5ld2xpbmUnO1xuaW1wb3J0IHtucG1SdW5QYXRoRW52fSBmcm9tICducG0tcnVuLXBhdGgnO1xuaW1wb3J0IG9uZXRpbWUgZnJvbSAnb25ldGltZSc7XG5pbXBvcnQge21ha2VFcnJvcn0gZnJvbSAnLi9saWIvZXJyb3IuanMnO1xuaW1wb3J0IHtub3JtYWxpemVTdGRpbywgbm9ybWFsaXplU3RkaW9Ob2RlfSBmcm9tICcuL2xpYi9zdGRpby5qcyc7XG5pbXBvcnQge3NwYXduZWRLaWxsLCBzcGF3bmVkQ2FuY2VsLCBzZXR1cFRpbWVvdXQsIHZhbGlkYXRlVGltZW91dCwgc2V0RXhpdEhhbmRsZXJ9IGZyb20gJy4vbGliL2tpbGwuanMnO1xuaW1wb3J0IHtoYW5kbGVJbnB1dCwgZ2V0U3Bhd25lZFJlc3VsdCwgbWFrZUFsbFN0cmVhbSwgdmFsaWRhdGVJbnB1dFN5bmN9IGZyb20gJy4vbGliL3N0cmVhbS5qcyc7XG5pbXBvcnQge21lcmdlUHJvbWlzZSwgZ2V0U3Bhd25lZFByb21pc2V9IGZyb20gJy4vbGliL3Byb21pc2UuanMnO1xuaW1wb3J0IHtqb2luQ29tbWFuZCwgcGFyc2VDb21tYW5kLCBnZXRFc2NhcGVkQ29tbWFuZH0gZnJvbSAnLi9saWIvY29tbWFuZC5qcyc7XG5cbmNvbnN0IERFRkFVTFRfTUFYX0JVRkZFUiA9IDEwMDAgKiAxMDAwICogMTAwO1xuXG5jb25zdCBnZXRFbnYgPSAoe2VudjogZW52T3B0aW9uLCBleHRlbmRFbnYsIHByZWZlckxvY2FsLCBsb2NhbERpciwgZXhlY1BhdGh9KSA9PiB7XG5cdGNvbnN0IGVudiA9IGV4dGVuZEVudiA/IHsuLi5wcm9jZXNzLmVudiwgLi4uZW52T3B0aW9ufSA6IGVudk9wdGlvbjtcblxuXHRpZiAocHJlZmVyTG9jYWwpIHtcblx0XHRyZXR1cm4gbnBtUnVuUGF0aEVudih7ZW52LCBjd2Q6IGxvY2FsRGlyLCBleGVjUGF0aH0pO1xuXHR9XG5cblx0cmV0dXJuIGVudjtcbn07XG5cbmNvbnN0IGhhbmRsZUFyZ3VtZW50cyA9IChmaWxlLCBhcmdzLCBvcHRpb25zID0ge30pID0+IHtcblx0Y29uc3QgcGFyc2VkID0gY3Jvc3NTcGF3bi5fcGFyc2UoZmlsZSwgYXJncywgb3B0aW9ucyk7XG5cdGZpbGUgPSBwYXJzZWQuY29tbWFuZDtcblx0YXJncyA9IHBhcnNlZC5hcmdzO1xuXHRvcHRpb25zID0gcGFyc2VkLm9wdGlvbnM7XG5cblx0b3B0aW9ucyA9IHtcblx0XHRtYXhCdWZmZXI6IERFRkFVTFRfTUFYX0JVRkZFUixcblx0XHRidWZmZXI6IHRydWUsXG5cdFx0c3RyaXBGaW5hbE5ld2xpbmU6IHRydWUsXG5cdFx0ZXh0ZW5kRW52OiB0cnVlLFxuXHRcdHByZWZlckxvY2FsOiBmYWxzZSxcblx0XHRsb2NhbERpcjogb3B0aW9ucy5jd2QgfHwgcHJvY2Vzcy5jd2QoKSxcblx0XHRleGVjUGF0aDogcHJvY2Vzcy5leGVjUGF0aCxcblx0XHRlbmNvZGluZzogJ3V0ZjgnLFxuXHRcdHJlamVjdDogdHJ1ZSxcblx0XHRjbGVhbnVwOiB0cnVlLFxuXHRcdGFsbDogZmFsc2UsXG5cdFx0d2luZG93c0hpZGU6IHRydWUsXG5cdFx0Li4ub3B0aW9ucyxcblx0fTtcblxuXHRvcHRpb25zLmVudiA9IGdldEVudihvcHRpb25zKTtcblxuXHRvcHRpb25zLnN0ZGlvID0gbm9ybWFsaXplU3RkaW8ob3B0aW9ucyk7XG5cblx0aWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgJiYgcGF0aC5iYXNlbmFtZShmaWxlLCAnLmV4ZScpID09PSAnY21kJykge1xuXHRcdC8vICMxMTZcblx0XHRhcmdzLnVuc2hpZnQoJy9xJyk7XG5cdH1cblxuXHRyZXR1cm4ge2ZpbGUsIGFyZ3MsIG9wdGlvbnMsIHBhcnNlZH07XG59O1xuXG5jb25zdCBoYW5kbGVPdXRwdXQgPSAob3B0aW9ucywgdmFsdWUsIGVycm9yKSA9PiB7XG5cdGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNCdWZmZXIodmFsdWUpKSB7XG5cdFx0Ly8gV2hlbiBgZXhlY2FTeW5jKClgIGVycm9ycywgd2Ugbm9ybWFsaXplIGl0IHRvICcnIHRvIG1pbWljIGBleGVjYSgpYFxuXHRcdHJldHVybiBlcnJvciA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogJyc7XG5cdH1cblxuXHRpZiAob3B0aW9ucy5zdHJpcEZpbmFsTmV3bGluZSkge1xuXHRcdHJldHVybiBzdHJpcEZpbmFsTmV3bGluZSh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2EoZmlsZSwgYXJncywgb3B0aW9ucykge1xuXHRjb25zdCBwYXJzZWQgPSBoYW5kbGVBcmd1bWVudHMoZmlsZSwgYXJncywgb3B0aW9ucyk7XG5cdGNvbnN0IGNvbW1hbmQgPSBqb2luQ29tbWFuZChmaWxlLCBhcmdzKTtcblx0Y29uc3QgZXNjYXBlZENvbW1hbmQgPSBnZXRFc2NhcGVkQ29tbWFuZChmaWxlLCBhcmdzKTtcblxuXHR2YWxpZGF0ZVRpbWVvdXQocGFyc2VkLm9wdGlvbnMpO1xuXG5cdGxldCBzcGF3bmVkO1xuXHR0cnkge1xuXHRcdHNwYXduZWQgPSBjaGlsZFByb2Nlc3Muc3Bhd24ocGFyc2VkLmZpbGUsIHBhcnNlZC5hcmdzLCBwYXJzZWQub3B0aW9ucyk7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0Ly8gRW5zdXJlIHRoZSByZXR1cm5lZCBlcnJvciBpcyBhbHdheXMgYm90aCBhIHByb21pc2UgYW5kIGEgY2hpbGQgcHJvY2Vzc1xuXHRcdGNvbnN0IGR1bW15U3Bhd25lZCA9IG5ldyBjaGlsZFByb2Nlc3MuQ2hpbGRQcm9jZXNzKCk7XG5cdFx0Y29uc3QgZXJyb3JQcm9taXNlID0gUHJvbWlzZS5yZWplY3QobWFrZUVycm9yKHtcblx0XHRcdGVycm9yLFxuXHRcdFx0c3Rkb3V0OiAnJyxcblx0XHRcdHN0ZGVycjogJycsXG5cdFx0XHRhbGw6ICcnLFxuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0cGFyc2VkLFxuXHRcdFx0dGltZWRPdXQ6IGZhbHNlLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IGZhbHNlLFxuXHRcdH0pKTtcblx0XHRyZXR1cm4gbWVyZ2VQcm9taXNlKGR1bW15U3Bhd25lZCwgZXJyb3JQcm9taXNlKTtcblx0fVxuXG5cdGNvbnN0IHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCk7XG5cdGNvbnN0IHRpbWVkUHJvbWlzZSA9IHNldHVwVGltZW91dChzcGF3bmVkLCBwYXJzZWQub3B0aW9ucywgc3Bhd25lZFByb21pc2UpO1xuXHRjb25zdCBwcm9jZXNzRG9uZSA9IHNldEV4aXRIYW5kbGVyKHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLCB0aW1lZFByb21pc2UpO1xuXG5cdGNvbnN0IGNvbnRleHQgPSB7aXNDYW5jZWxlZDogZmFsc2V9O1xuXG5cdHNwYXduZWQua2lsbCA9IHNwYXduZWRLaWxsLmJpbmQobnVsbCwgc3Bhd25lZC5raWxsLmJpbmQoc3Bhd25lZCkpO1xuXHRzcGF3bmVkLmNhbmNlbCA9IHNwYXduZWRDYW5jZWwuYmluZChudWxsLCBzcGF3bmVkLCBjb250ZXh0KTtcblxuXHRjb25zdCBoYW5kbGVQcm9taXNlID0gYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IFt7ZXJyb3IsIGV4aXRDb2RlLCBzaWduYWwsIHRpbWVkT3V0fSwgc3Rkb3V0UmVzdWx0LCBzdGRlcnJSZXN1bHQsIGFsbFJlc3VsdF0gPSBhd2FpdCBnZXRTcGF3bmVkUmVzdWx0KHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLCBwcm9jZXNzRG9uZSk7XG5cdFx0Y29uc3Qgc3Rkb3V0ID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCBzdGRvdXRSZXN1bHQpO1xuXHRcdGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgc3RkZXJyUmVzdWx0KTtcblx0XHRjb25zdCBhbGwgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIGFsbFJlc3VsdCk7XG5cblx0XHRpZiAoZXJyb3IgfHwgZXhpdENvZGUgIT09IDAgfHwgc2lnbmFsICE9PSBudWxsKSB7XG5cdFx0XHRjb25zdCByZXR1cm5lZEVycm9yID0gbWFrZUVycm9yKHtcblx0XHRcdFx0ZXJyb3IsXG5cdFx0XHRcdGV4aXRDb2RlLFxuXHRcdFx0XHRzaWduYWwsXG5cdFx0XHRcdHN0ZG91dCxcblx0XHRcdFx0c3RkZXJyLFxuXHRcdFx0XHRhbGwsXG5cdFx0XHRcdGNvbW1hbmQsXG5cdFx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0XHRwYXJzZWQsXG5cdFx0XHRcdHRpbWVkT3V0LFxuXHRcdFx0XHRpc0NhbmNlbGVkOiBjb250ZXh0LmlzQ2FuY2VsZWQgfHwgKHBhcnNlZC5vcHRpb25zLnNpZ25hbCA/IHBhcnNlZC5vcHRpb25zLnNpZ25hbC5hYm9ydGVkIDogZmFsc2UpLFxuXHRcdFx0XHRraWxsZWQ6IHNwYXduZWQua2lsbGVkLFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmICghcGFyc2VkLm9wdGlvbnMucmVqZWN0KSB7XG5cdFx0XHRcdHJldHVybiByZXR1cm5lZEVycm9yO1xuXHRcdFx0fVxuXG5cdFx0XHR0aHJvdyByZXR1cm5lZEVycm9yO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRleGl0Q29kZTogMCxcblx0XHRcdHN0ZG91dCxcblx0XHRcdHN0ZGVycixcblx0XHRcdGFsbCxcblx0XHRcdGZhaWxlZDogZmFsc2UsXG5cdFx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogZmFsc2UsXG5cdFx0fTtcblx0fTtcblxuXHRjb25zdCBoYW5kbGVQcm9taXNlT25jZSA9IG9uZXRpbWUoaGFuZGxlUHJvbWlzZSk7XG5cblx0aGFuZGxlSW5wdXQoc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMuaW5wdXQpO1xuXG5cdHNwYXduZWQuYWxsID0gbWFrZUFsbFN0cmVhbShzcGF3bmVkLCBwYXJzZWQub3B0aW9ucyk7XG5cblx0cmV0dXJuIG1lcmdlUHJvbWlzZShzcGF3bmVkLCBoYW5kbGVQcm9taXNlT25jZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjYVN5bmMoZmlsZSwgYXJncywgb3B0aW9ucykge1xuXHRjb25zdCBwYXJzZWQgPSBoYW5kbGVBcmd1bWVudHMoZmlsZSwgYXJncywgb3B0aW9ucyk7XG5cdGNvbnN0IGNvbW1hbmQgPSBqb2luQ29tbWFuZChmaWxlLCBhcmdzKTtcblx0Y29uc3QgZXNjYXBlZENvbW1hbmQgPSBnZXRFc2NhcGVkQ29tbWFuZChmaWxlLCBhcmdzKTtcblxuXHR2YWxpZGF0ZUlucHV0U3luYyhwYXJzZWQub3B0aW9ucyk7XG5cblx0bGV0IHJlc3VsdDtcblx0dHJ5IHtcblx0XHRyZXN1bHQgPSBjaGlsZFByb2Nlc3Muc3Bhd25TeW5jKHBhcnNlZC5maWxlLCBwYXJzZWQuYXJncywgcGFyc2VkLm9wdGlvbnMpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHRocm93IG1ha2VFcnJvcih7XG5cdFx0XHRlcnJvcixcblx0XHRcdHN0ZG91dDogJycsXG5cdFx0XHRzdGRlcnI6ICcnLFxuXHRcdFx0YWxsOiAnJyxcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdHBhcnNlZCxcblx0XHRcdHRpbWVkT3V0OiBmYWxzZSxcblx0XHRcdGlzQ2FuY2VsZWQ6IGZhbHNlLFxuXHRcdFx0a2lsbGVkOiBmYWxzZSxcblx0XHR9KTtcblx0fVxuXG5cdGNvbnN0IHN0ZG91dCA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgcmVzdWx0LnN0ZG91dCwgcmVzdWx0LmVycm9yKTtcblx0Y29uc3Qgc3RkZXJyID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCByZXN1bHQuc3RkZXJyLCByZXN1bHQuZXJyb3IpO1xuXG5cdGlmIChyZXN1bHQuZXJyb3IgfHwgcmVzdWx0LnN0YXR1cyAhPT0gMCB8fCByZXN1bHQuc2lnbmFsICE9PSBudWxsKSB7XG5cdFx0Y29uc3QgZXJyb3IgPSBtYWtlRXJyb3Ioe1xuXHRcdFx0c3Rkb3V0LFxuXHRcdFx0c3RkZXJyLFxuXHRcdFx0ZXJyb3I6IHJlc3VsdC5lcnJvcixcblx0XHRcdHNpZ25hbDogcmVzdWx0LnNpZ25hbCxcblx0XHRcdGV4aXRDb2RlOiByZXN1bHQuc3RhdHVzLFxuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0cGFyc2VkLFxuXHRcdFx0dGltZWRPdXQ6IHJlc3VsdC5lcnJvciAmJiByZXN1bHQuZXJyb3IuY29kZSA9PT0gJ0VUSU1FRE9VVCcsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogcmVzdWx0LnNpZ25hbCAhPT0gbnVsbCxcblx0XHR9KTtcblxuXHRcdGlmICghcGFyc2VkLm9wdGlvbnMucmVqZWN0KSB7XG5cdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0fVxuXG5cdFx0dGhyb3cgZXJyb3I7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGNvbW1hbmQsXG5cdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0ZXhpdENvZGU6IDAsXG5cdFx0c3Rkb3V0LFxuXHRcdHN0ZGVycixcblx0XHRmYWlsZWQ6IGZhbHNlLFxuXHRcdHRpbWVkT3V0OiBmYWxzZSxcblx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRraWxsZWQ6IGZhbHNlLFxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2FDb21tYW5kKGNvbW1hbmQsIG9wdGlvbnMpIHtcblx0Y29uc3QgW2ZpbGUsIC4uLmFyZ3NdID0gcGFyc2VDb21tYW5kKGNvbW1hbmQpO1xuXHRyZXR1cm4gZXhlY2EoZmlsZSwgYXJncywgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjYUNvbW1hbmRTeW5jKGNvbW1hbmQsIG9wdGlvbnMpIHtcblx0Y29uc3QgW2ZpbGUsIC4uLmFyZ3NdID0gcGFyc2VDb21tYW5kKGNvbW1hbmQpO1xuXHRyZXR1cm4gZXhlY2FTeW5jKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2FOb2RlKHNjcmlwdFBhdGgsIGFyZ3MsIG9wdGlvbnMgPSB7fSkge1xuXHRpZiAoYXJncyAmJiAhQXJyYXkuaXNBcnJheShhcmdzKSAmJiB0eXBlb2YgYXJncyA9PT0gJ29iamVjdCcpIHtcblx0XHRvcHRpb25zID0gYXJncztcblx0XHRhcmdzID0gW107XG5cdH1cblxuXHRjb25zdCBzdGRpbyA9IG5vcm1hbGl6ZVN0ZGlvTm9kZShvcHRpb25zKTtcblx0Y29uc3QgZGVmYXVsdEV4ZWNBcmd2ID0gcHJvY2Vzcy5leGVjQXJndi5maWx0ZXIoYXJnID0+ICFhcmcuc3RhcnRzV2l0aCgnLS1pbnNwZWN0JykpO1xuXG5cdGNvbnN0IHtcblx0XHRub2RlUGF0aCA9IHByb2Nlc3MuZXhlY1BhdGgsXG5cdFx0bm9kZU9wdGlvbnMgPSBkZWZhdWx0RXhlY0FyZ3YsXG5cdH0gPSBvcHRpb25zO1xuXG5cdHJldHVybiBleGVjYShcblx0XHRub2RlUGF0aCxcblx0XHRbXG5cdFx0XHQuLi5ub2RlT3B0aW9ucyxcblx0XHRcdHNjcmlwdFBhdGgsXG5cdFx0XHQuLi4oQXJyYXkuaXNBcnJheShhcmdzKSA/IGFyZ3MgOiBbXSksXG5cdFx0XSxcblx0XHR7XG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdFx0c3RkaW46IHVuZGVmaW5lZCxcblx0XHRcdHN0ZG91dDogdW5kZWZpbmVkLFxuXHRcdFx0c3RkZXJyOiB1bmRlZmluZWQsXG5cdFx0XHRzdGRpbyxcblx0XHRcdHNoZWxsOiBmYWxzZSxcblx0XHR9LFxuXHQpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN0cmlwRmluYWxOZXdsaW5lKGlucHV0KSB7XG5cdGNvbnN0IExGID0gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/ICdcXG4nIDogJ1xcbicuY2hhckNvZGVBdCgpO1xuXHRjb25zdCBDUiA9IHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgPyAnXFxyJyA6ICdcXHInLmNoYXJDb2RlQXQoKTtcblxuXHRpZiAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMV0gPT09IExGKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC5zbGljZSgwLCAtMSk7XG5cdH1cblxuXHRpZiAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMV0gPT09IENSKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC5zbGljZSgwLCAtMSk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59XG4iLCAiaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgdXJsIGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCBwYXRoS2V5IGZyb20gJ3BhdGgta2V5JztcblxuZXhwb3J0IGZ1bmN0aW9uIG5wbVJ1blBhdGgob3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IHtcblx0XHRjd2QgPSBwcm9jZXNzLmN3ZCgpLFxuXHRcdHBhdGg6IHBhdGhfID0gcHJvY2Vzcy5lbnZbcGF0aEtleSgpXSxcblx0XHRleGVjUGF0aCA9IHByb2Nlc3MuZXhlY1BhdGgsXG5cdH0gPSBvcHRpb25zO1xuXG5cdGxldCBwcmV2aW91cztcblx0Y29uc3QgY3dkU3RyaW5nID0gY3dkIGluc3RhbmNlb2YgVVJMID8gdXJsLmZpbGVVUkxUb1BhdGgoY3dkKSA6IGN3ZDtcblx0bGV0IGN3ZFBhdGggPSBwYXRoLnJlc29sdmUoY3dkU3RyaW5nKTtcblx0Y29uc3QgcmVzdWx0ID0gW107XG5cblx0d2hpbGUgKHByZXZpb3VzICE9PSBjd2RQYXRoKSB7XG5cdFx0cmVzdWx0LnB1c2gocGF0aC5qb2luKGN3ZFBhdGgsICdub2RlX21vZHVsZXMvLmJpbicpKTtcblx0XHRwcmV2aW91cyA9IGN3ZFBhdGg7XG5cdFx0Y3dkUGF0aCA9IHBhdGgucmVzb2x2ZShjd2RQYXRoLCAnLi4nKTtcblx0fVxuXG5cdC8vIEVuc3VyZSB0aGUgcnVubmluZyBgbm9kZWAgYmluYXJ5IGlzIHVzZWQuXG5cdHJlc3VsdC5wdXNoKHBhdGgucmVzb2x2ZShjd2RTdHJpbmcsIGV4ZWNQYXRoLCAnLi4nKSk7XG5cblx0cmV0dXJuIFsuLi5yZXN1bHQsIHBhdGhfXS5qb2luKHBhdGguZGVsaW1pdGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5wbVJ1blBhdGhFbnYoe2VudiA9IHByb2Nlc3MuZW52LCAuLi5vcHRpb25zfSA9IHt9KSB7XG5cdGVudiA9IHsuLi5lbnZ9O1xuXG5cdGNvbnN0IHBhdGggPSBwYXRoS2V5KHtlbnZ9KTtcblx0b3B0aW9ucy5wYXRoID0gZW52W3BhdGhdO1xuXHRlbnZbcGF0aF0gPSBucG1SdW5QYXRoKG9wdGlvbnMpO1xuXG5cdHJldHVybiBlbnY7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGF0aEtleShvcHRpb25zID0ge30pIHtcblx0Y29uc3Qge1xuXHRcdGVudiA9IHByb2Nlc3MuZW52LFxuXHRcdHBsYXRmb3JtID0gcHJvY2Vzcy5wbGF0Zm9ybVxuXHR9ID0gb3B0aW9ucztcblxuXHRpZiAocGxhdGZvcm0gIT09ICd3aW4zMicpIHtcblx0XHRyZXR1cm4gJ1BBVEgnO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKGVudikucmV2ZXJzZSgpLmZpbmQoa2V5ID0+IGtleS50b1VwcGVyQ2FzZSgpID09PSAnUEFUSCcpIHx8ICdQYXRoJztcbn1cbiIsICJjb25zdCBjb3B5UHJvcGVydHkgPSAodG8sIGZyb20sIHByb3BlcnR5LCBpZ25vcmVOb25Db25maWd1cmFibGUpID0+IHtcblx0Ly8gYEZ1bmN0aW9uI2xlbmd0aGAgc2hvdWxkIHJlZmxlY3QgdGhlIHBhcmFtZXRlcnMgb2YgYHRvYCBub3QgYGZyb21gIHNpbmNlIHdlIGtlZXAgaXRzIGJvZHkuXG5cdC8vIGBGdW5jdGlvbiNwcm90b3R5cGVgIGlzIG5vbi13cml0YWJsZSBhbmQgbm9uLWNvbmZpZ3VyYWJsZSBzbyBjYW4gbmV2ZXIgYmUgbW9kaWZpZWQuXG5cdGlmIChwcm9wZXJ0eSA9PT0gJ2xlbmd0aCcgfHwgcHJvcGVydHkgPT09ICdwcm90b3R5cGUnKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gYEZ1bmN0aW9uI2FyZ3VtZW50c2AgYW5kIGBGdW5jdGlvbiNjYWxsZXJgIHNob3VsZCBub3QgYmUgY29waWVkLiBUaGV5IHdlcmUgcmVwb3J0ZWQgdG8gYmUgcHJlc2VudCBpbiBgUmVmbGVjdC5vd25LZXlzYCBmb3Igc29tZSBkZXZpY2VzIGluIFJlYWN0IE5hdGl2ZSAoIzQxKSwgc28gd2UgZXhwbGljaXRseSBpZ25vcmUgdGhlbSBoZXJlLlxuXHRpZiAocHJvcGVydHkgPT09ICdhcmd1bWVudHMnIHx8IHByb3BlcnR5ID09PSAnY2FsbGVyJykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHRvRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodG8sIHByb3BlcnR5KTtcblx0Y29uc3QgZnJvbURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGZyb20sIHByb3BlcnR5KTtcblxuXHRpZiAoIWNhbkNvcHlQcm9wZXJ0eSh0b0Rlc2NyaXB0b3IsIGZyb21EZXNjcmlwdG9yKSAmJiBpZ25vcmVOb25Db25maWd1cmFibGUpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodG8sIHByb3BlcnR5LCBmcm9tRGVzY3JpcHRvcik7XG59O1xuXG4vLyBgT2JqZWN0LmRlZmluZVByb3BlcnR5KClgIHRocm93cyBpZiB0aGUgcHJvcGVydHkgZXhpc3RzLCBpcyBub3QgY29uZmlndXJhYmxlIGFuZCBlaXRoZXI6XG4vLyAtIG9uZSBpdHMgZGVzY3JpcHRvcnMgaXMgY2hhbmdlZFxuLy8gLSBpdCBpcyBub24td3JpdGFibGUgYW5kIGl0cyB2YWx1ZSBpcyBjaGFuZ2VkXG5jb25zdCBjYW5Db3B5UHJvcGVydHkgPSBmdW5jdGlvbiAodG9EZXNjcmlwdG9yLCBmcm9tRGVzY3JpcHRvcikge1xuXHRyZXR1cm4gdG9EZXNjcmlwdG9yID09PSB1bmRlZmluZWQgfHwgdG9EZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSB8fCAoXG5cdFx0dG9EZXNjcmlwdG9yLndyaXRhYmxlID09PSBmcm9tRGVzY3JpcHRvci53cml0YWJsZSAmJlxuXHRcdHRvRGVzY3JpcHRvci5lbnVtZXJhYmxlID09PSBmcm9tRGVzY3JpcHRvci5lbnVtZXJhYmxlICYmXG5cdFx0dG9EZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9PT0gZnJvbURlc2NyaXB0b3IuY29uZmlndXJhYmxlICYmXG5cdFx0KHRvRGVzY3JpcHRvci53cml0YWJsZSB8fCB0b0Rlc2NyaXB0b3IudmFsdWUgPT09IGZyb21EZXNjcmlwdG9yLnZhbHVlKVxuXHQpO1xufTtcblxuY29uc3QgY2hhbmdlUHJvdG90eXBlID0gKHRvLCBmcm9tKSA9PiB7XG5cdGNvbnN0IGZyb21Qcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZnJvbSk7XG5cdGlmIChmcm9tUHJvdG90eXBlID09PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodG8pKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0T2JqZWN0LnNldFByb3RvdHlwZU9mKHRvLCBmcm9tUHJvdG90eXBlKTtcbn07XG5cbmNvbnN0IHdyYXBwZWRUb1N0cmluZyA9ICh3aXRoTmFtZSwgZnJvbUJvZHkpID0+IGAvKiBXcmFwcGVkICR7d2l0aE5hbWV9Ki9cXG4ke2Zyb21Cb2R5fWA7XG5cbmNvbnN0IHRvU3RyaW5nRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRnVuY3Rpb24ucHJvdG90eXBlLCAndG9TdHJpbmcnKTtcbmNvbnN0IHRvU3RyaW5nTmFtZSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLCAnbmFtZScpO1xuXG4vLyBXZSBjYWxsIGBmcm9tLnRvU3RyaW5nKClgIGVhcmx5IChub3QgbGF6aWx5KSB0byBlbnN1cmUgYGZyb21gIGNhbiBiZSBnYXJiYWdlIGNvbGxlY3RlZC5cbi8vIFdlIHVzZSBgYmluZCgpYCBpbnN0ZWFkIG9mIGEgY2xvc3VyZSBmb3IgdGhlIHNhbWUgcmVhc29uLlxuLy8gQ2FsbGluZyBgZnJvbS50b1N0cmluZygpYCBlYXJseSBhbHNvIGFsbG93cyBjYWNoaW5nIGl0IGluIGNhc2UgYHRvLnRvU3RyaW5nKClgIGlzIGNhbGxlZCBzZXZlcmFsIHRpbWVzLlxuY29uc3QgY2hhbmdlVG9TdHJpbmcgPSAodG8sIGZyb20sIG5hbWUpID0+IHtcblx0Y29uc3Qgd2l0aE5hbWUgPSBuYW1lID09PSAnJyA/ICcnIDogYHdpdGggJHtuYW1lLnRyaW0oKX0oKSBgO1xuXHRjb25zdCBuZXdUb1N0cmluZyA9IHdyYXBwZWRUb1N0cmluZy5iaW5kKG51bGwsIHdpdGhOYW1lLCBmcm9tLnRvU3RyaW5nKCkpO1xuXHQvLyBFbnN1cmUgYHRvLnRvU3RyaW5nLnRvU3RyaW5nYCBpcyBub24tZW51bWVyYWJsZSBhbmQgaGFzIHRoZSBzYW1lIGBzYW1lYFxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3VG9TdHJpbmcsICduYW1lJywgdG9TdHJpbmdOYW1lKTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRvLCAndG9TdHJpbmcnLCB7Li4udG9TdHJpbmdEZXNjcmlwdG9yLCB2YWx1ZTogbmV3VG9TdHJpbmd9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1pbWljRnVuY3Rpb24odG8sIGZyb20sIHtpZ25vcmVOb25Db25maWd1cmFibGUgPSBmYWxzZX0gPSB7fSkge1xuXHRjb25zdCB7bmFtZX0gPSB0bztcblxuXHRmb3IgKGNvbnN0IHByb3BlcnR5IG9mIFJlZmxlY3Qub3duS2V5cyhmcm9tKSkge1xuXHRcdGNvcHlQcm9wZXJ0eSh0bywgZnJvbSwgcHJvcGVydHksIGlnbm9yZU5vbkNvbmZpZ3VyYWJsZSk7XG5cdH1cblxuXHRjaGFuZ2VQcm90b3R5cGUodG8sIGZyb20pO1xuXHRjaGFuZ2VUb1N0cmluZyh0bywgZnJvbSwgbmFtZSk7XG5cblx0cmV0dXJuIHRvO1xufVxuIiwgImltcG9ydCBtaW1pY0Z1bmN0aW9uIGZyb20gJ21pbWljLWZuJztcblxuY29uc3QgY2FsbGVkRnVuY3Rpb25zID0gbmV3IFdlYWtNYXAoKTtcblxuY29uc3Qgb25ldGltZSA9IChmdW5jdGlvbl8sIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRpZiAodHlwZW9mIGZ1bmN0aW9uXyAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgZnVuY3Rpb24nKTtcblx0fVxuXG5cdGxldCByZXR1cm5WYWx1ZTtcblx0bGV0IGNhbGxDb3VudCA9IDA7XG5cdGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uXy5kaXNwbGF5TmFtZSB8fCBmdW5jdGlvbl8ubmFtZSB8fCAnPGFub255bW91cz4nO1xuXG5cdGNvbnN0IG9uZXRpbWUgPSBmdW5jdGlvbiAoLi4uYXJndW1lbnRzXykge1xuXHRcdGNhbGxlZEZ1bmN0aW9ucy5zZXQob25ldGltZSwgKytjYWxsQ291bnQpO1xuXG5cdFx0aWYgKGNhbGxDb3VudCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuVmFsdWUgPSBmdW5jdGlvbl8uYXBwbHkodGhpcywgYXJndW1lbnRzXyk7XG5cdFx0XHRmdW5jdGlvbl8gPSBudWxsO1xuXHRcdH0gZWxzZSBpZiAob3B0aW9ucy50aHJvdyA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBGdW5jdGlvbiBcXGAke2Z1bmN0aW9uTmFtZX1cXGAgY2FuIG9ubHkgYmUgY2FsbGVkIG9uY2VgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XG5cdH07XG5cblx0bWltaWNGdW5jdGlvbihvbmV0aW1lLCBmdW5jdGlvbl8pO1xuXHRjYWxsZWRGdW5jdGlvbnMuc2V0KG9uZXRpbWUsIGNhbGxDb3VudCk7XG5cblx0cmV0dXJuIG9uZXRpbWU7XG59O1xuXG5vbmV0aW1lLmNhbGxDb3VudCA9IGZ1bmN0aW9uXyA9PiB7XG5cdGlmICghY2FsbGVkRnVuY3Rpb25zLmhhcyhmdW5jdGlvbl8pKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBUaGUgZ2l2ZW4gZnVuY3Rpb24gXFxgJHtmdW5jdGlvbl8ubmFtZX1cXGAgaXMgbm90IHdyYXBwZWQgYnkgdGhlIFxcYG9uZXRpbWVcXGAgcGFja2FnZWApO1xuXHR9XG5cblx0cmV0dXJuIGNhbGxlZEZ1bmN0aW9ucy5nZXQoZnVuY3Rpb25fKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG9uZXRpbWU7XG4iLCAiaW1wb3J0e2NvbnN0YW50c31mcm9tXCJub2RlOm9zXCI7XG5cbmltcG9ydHtTSUdSVE1BWH1mcm9tXCIuL3JlYWx0aW1lLmpzXCI7XG5pbXBvcnR7Z2V0U2lnbmFsc31mcm9tXCIuL3NpZ25hbHMuanNcIjtcblxuXG5cbmNvbnN0IGdldFNpZ25hbHNCeU5hbWU9ZnVuY3Rpb24oKXtcbmNvbnN0IHNpZ25hbHM9Z2V0U2lnbmFscygpO1xucmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhzaWduYWxzLm1hcChnZXRTaWduYWxCeU5hbWUpKTtcbn07XG5cbmNvbnN0IGdldFNpZ25hbEJ5TmFtZT1mdW5jdGlvbih7XG5uYW1lLFxubnVtYmVyLFxuZGVzY3JpcHRpb24sXG5zdXBwb3J0ZWQsXG5hY3Rpb24sXG5mb3JjZWQsXG5zdGFuZGFyZH0pXG57XG5yZXR1cm5bXG5uYW1lLFxue25hbWUsbnVtYmVyLGRlc2NyaXB0aW9uLHN1cHBvcnRlZCxhY3Rpb24sZm9yY2VkLHN0YW5kYXJkfV07XG5cbn07XG5cbmV4cG9ydCBjb25zdCBzaWduYWxzQnlOYW1lPWdldFNpZ25hbHNCeU5hbWUoKTtcblxuXG5cblxuY29uc3QgZ2V0U2lnbmFsc0J5TnVtYmVyPWZ1bmN0aW9uKCl7XG5jb25zdCBzaWduYWxzPWdldFNpZ25hbHMoKTtcbmNvbnN0IGxlbmd0aD1TSUdSVE1BWCsxO1xuY29uc3Qgc2lnbmFsc0E9QXJyYXkuZnJvbSh7bGVuZ3RofSwodmFsdWUsbnVtYmVyKT0+XG5nZXRTaWduYWxCeU51bWJlcihudW1iZXIsc2lnbmFscykpO1xuXG5yZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwuLi5zaWduYWxzQSk7XG59O1xuXG5jb25zdCBnZXRTaWduYWxCeU51bWJlcj1mdW5jdGlvbihudW1iZXIsc2lnbmFscyl7XG5jb25zdCBzaWduYWw9ZmluZFNpZ25hbEJ5TnVtYmVyKG51bWJlcixzaWduYWxzKTtcblxuaWYoc2lnbmFsPT09dW5kZWZpbmVkKXtcbnJldHVybnt9O1xufVxuXG5jb25zdHtuYW1lLGRlc2NyaXB0aW9uLHN1cHBvcnRlZCxhY3Rpb24sZm9yY2VkLHN0YW5kYXJkfT1zaWduYWw7XG5yZXR1cm57XG5bbnVtYmVyXTp7XG5uYW1lLFxubnVtYmVyLFxuZGVzY3JpcHRpb24sXG5zdXBwb3J0ZWQsXG5hY3Rpb24sXG5mb3JjZWQsXG5zdGFuZGFyZH19O1xuXG5cbn07XG5cblxuXG5jb25zdCBmaW5kU2lnbmFsQnlOdW1iZXI9ZnVuY3Rpb24obnVtYmVyLHNpZ25hbHMpe1xuY29uc3Qgc2lnbmFsPXNpZ25hbHMuZmluZCgoe25hbWV9KT0+Y29uc3RhbnRzLnNpZ25hbHNbbmFtZV09PT1udW1iZXIpO1xuXG5pZihzaWduYWwhPT11bmRlZmluZWQpe1xucmV0dXJuIHNpZ25hbDtcbn1cblxucmV0dXJuIHNpZ25hbHMuZmluZCgoc2lnbmFsQSk9PnNpZ25hbEEubnVtYmVyPT09bnVtYmVyKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzaWduYWxzQnlOdW1iZXI9Z2V0U2lnbmFsc0J5TnVtYmVyKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYWluLmpzLm1hcCIsICJcbmV4cG9ydCBjb25zdCBnZXRSZWFsdGltZVNpZ25hbHM9ZnVuY3Rpb24oKXtcbmNvbnN0IGxlbmd0aD1TSUdSVE1BWC1TSUdSVE1JTisxO1xucmV0dXJuIEFycmF5LmZyb20oe2xlbmd0aH0sZ2V0UmVhbHRpbWVTaWduYWwpO1xufTtcblxuY29uc3QgZ2V0UmVhbHRpbWVTaWduYWw9ZnVuY3Rpb24odmFsdWUsaW5kZXgpe1xucmV0dXJue1xubmFtZTpgU0lHUlQke2luZGV4KzF9YCxcbm51bWJlcjpTSUdSVE1JTitpbmRleCxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJBcHBsaWNhdGlvbi1zcGVjaWZpYyBzaWduYWwgKHJlYWx0aW1lKVwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifTtcblxufTtcblxuY29uc3QgU0lHUlRNSU49MzQ7XG5leHBvcnQgY29uc3QgU0lHUlRNQVg9NjQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZWFsdGltZS5qcy5tYXAiLCAiaW1wb3J0e2NvbnN0YW50c31mcm9tXCJub2RlOm9zXCI7XG5cbmltcG9ydHtTSUdOQUxTfWZyb21cIi4vY29yZS5qc1wiO1xuaW1wb3J0e2dldFJlYWx0aW1lU2lnbmFsc31mcm9tXCIuL3JlYWx0aW1lLmpzXCI7XG5cblxuXG5leHBvcnQgY29uc3QgZ2V0U2lnbmFscz1mdW5jdGlvbigpe1xuY29uc3QgcmVhbHRpbWVTaWduYWxzPWdldFJlYWx0aW1lU2lnbmFscygpO1xuY29uc3Qgc2lnbmFscz1bLi4uU0lHTkFMUywuLi5yZWFsdGltZVNpZ25hbHNdLm1hcChub3JtYWxpemVTaWduYWwpO1xucmV0dXJuIHNpZ25hbHM7XG59O1xuXG5cblxuXG5cblxuXG5jb25zdCBub3JtYWxpemVTaWduYWw9ZnVuY3Rpb24oe1xubmFtZSxcbm51bWJlcjpkZWZhdWx0TnVtYmVyLFxuZGVzY3JpcHRpb24sXG5hY3Rpb24sXG5mb3JjZWQ9ZmFsc2UsXG5zdGFuZGFyZH0pXG57XG5jb25zdHtcbnNpZ25hbHM6e1tuYW1lXTpjb25zdGFudFNpZ25hbH19PVxuY29uc3RhbnRzO1xuY29uc3Qgc3VwcG9ydGVkPWNvbnN0YW50U2lnbmFsIT09dW5kZWZpbmVkO1xuY29uc3QgbnVtYmVyPXN1cHBvcnRlZD9jb25zdGFudFNpZ25hbDpkZWZhdWx0TnVtYmVyO1xucmV0dXJue25hbWUsbnVtYmVyLGRlc2NyaXB0aW9uLHN1cHBvcnRlZCxhY3Rpb24sZm9yY2VkLHN0YW5kYXJkfTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zaWduYWxzLmpzLm1hcCIsICJcblxuZXhwb3J0IGNvbnN0IFNJR05BTFM9W1xue1xubmFtZTpcIlNJR0hVUFwiLFxubnVtYmVyOjEsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGVybWluYWwgY2xvc2VkXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHSU5UXCIsXG5udW1iZXI6MixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJVc2VyIGludGVycnVwdGlvbiB3aXRoIENUUkwtQ1wiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHUVVJVFwiLFxubnVtYmVyOjMsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIlVzZXIgaW50ZXJydXB0aW9uIHdpdGggQ1RSTC1cXFxcXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHSUxMXCIsXG5udW1iZXI6NCxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiSW52YWxpZCBtYWNoaW5lIGluc3RydWN0aW9uXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdUUkFQXCIsXG5udW1iZXI6NSxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiRGVidWdnZXIgYnJlYWtwb2ludFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0FCUlRcIixcbm51bWJlcjo2LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJBYm9ydGVkXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdJT1RcIixcbm51bWJlcjo2LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJBYm9ydGVkXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR0JVU1wiLFxubnVtYmVyOjcsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcblwiQnVzIGVycm9yIGR1ZSB0byBtaXNhbGlnbmVkLCBub24tZXhpc3RpbmcgYWRkcmVzcyBvciBwYWdpbmcgZXJyb3JcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHRU1UXCIsXG5udW1iZXI6NyxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJDb21tYW5kIHNob3VsZCBiZSBlbXVsYXRlZCBidXQgaXMgbm90IGltcGxlbWVudGVkXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHRlBFXCIsXG5udW1iZXI6OCxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiRmxvYXRpbmcgcG9pbnQgYXJpdGhtZXRpYyBlcnJvclwiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHS0lMTFwiLFxubnVtYmVyOjksXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiRm9yY2VkIHRlcm1pbmF0aW9uXCIsXG5zdGFuZGFyZDpcInBvc2l4XCIsXG5mb3JjZWQ6dHJ1ZX0sXG5cbntcbm5hbWU6XCJTSUdVU1IxXCIsXG5udW1iZXI6MTAsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQXBwbGljYXRpb24tc3BlY2lmaWMgc2lnbmFsXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHU0VHVlwiLFxubnVtYmVyOjExLFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJTZWdtZW50YXRpb24gZmF1bHRcIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR1VTUjJcIixcbm51bWJlcjoxMixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJBcHBsaWNhdGlvbi1zcGVjaWZpYyBzaWduYWxcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdQSVBFXCIsXG5udW1iZXI6MTMsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQnJva2VuIHBpcGUgb3Igc29ja2V0XCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHQUxSTVwiLFxubnVtYmVyOjE0LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlRpbWVvdXQgb3IgdGltZXJcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdURVJNXCIsXG5udW1iZXI6MTUsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGVybWluYXRpb25cIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR1NUS0ZMVFwiLFxubnVtYmVyOjE2LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlN0YWNrIGlzIGVtcHR5IG9yIG92ZXJmbG93ZWRcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdDSExEXCIsXG5udW1iZXI6MTcsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiQ2hpbGQgcHJvY2VzcyB0ZXJtaW5hdGVkLCBwYXVzZWQgb3IgdW5wYXVzZWRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdDTERcIixcbm51bWJlcjoxNyxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJDaGlsZCBwcm9jZXNzIHRlcm1pbmF0ZWQsIHBhdXNlZCBvciB1bnBhdXNlZFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR0NPTlRcIixcbm51bWJlcjoxOCxcbmFjdGlvbjpcInVucGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiVW5wYXVzZWRcIixcbnN0YW5kYXJkOlwicG9zaXhcIixcbmZvcmNlZDp0cnVlfSxcblxue1xubmFtZTpcIlNJR1NUT1BcIixcbm51bWJlcjoxOSxcbmFjdGlvbjpcInBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIlBhdXNlZFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwiLFxuZm9yY2VkOnRydWV9LFxuXG57XG5uYW1lOlwiU0lHVFNUUFwiLFxubnVtYmVyOjIwLFxuYWN0aW9uOlwicGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiUGF1c2VkIHVzaW5nIENUUkwtWiBvciBcXFwic3VzcGVuZFxcXCJcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdUVElOXCIsXG5udW1iZXI6MjEsXG5hY3Rpb246XCJwYXVzZVwiLFxuZGVzY3JpcHRpb246XCJCYWNrZ3JvdW5kIHByb2Nlc3MgY2Fubm90IHJlYWQgdGVybWluYWwgaW5wdXRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdCUkVBS1wiLFxubnVtYmVyOjIxLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlVzZXIgaW50ZXJydXB0aW9uIHdpdGggQ1RSTC1CUkVBS1wiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR1RUT1VcIixcbm51bWJlcjoyMixcbmFjdGlvbjpcInBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIkJhY2tncm91bmQgcHJvY2VzcyBjYW5ub3Qgd3JpdGUgdG8gdGVybWluYWwgb3V0cHV0XCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHVVJHXCIsXG5udW1iZXI6MjMsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiU29ja2V0IHJlY2VpdmVkIG91dC1vZi1iYW5kIGRhdGFcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHWENQVVwiLFxubnVtYmVyOjI0LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJQcm9jZXNzIHRpbWVkIG91dFwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdYRlNaXCIsXG5udW1iZXI6MjUsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkZpbGUgdG9vIGJpZ1wiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdWVEFMUk1cIixcbm51bWJlcjoyNixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUaW1lb3V0IG9yIHRpbWVyXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1BST0ZcIixcbm51bWJlcjoyNyxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUaW1lb3V0IG9yIHRpbWVyXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1dJTkNIXCIsXG5udW1iZXI6MjgsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiVGVybWluYWwgd2luZG93IHNpemUgY2hhbmdlZFwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdJT1wiLFxubnVtYmVyOjI5LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkkvTyBpcyBhdmFpbGFibGVcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdQT0xMXCIsXG5udW1iZXI6MjksXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiV2F0Y2hlZCBldmVudFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR0lORk9cIixcbm51bWJlcjoyOSxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJSZXF1ZXN0IGZvciBwcm9jZXNzIGluZm9ybWF0aW9uXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHUFdSXCIsXG5udW1iZXI6MzAsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiRGV2aWNlIHJ1bm5pbmcgb3V0IG9mIHBvd2VyXCIsXG5zdGFuZGFyZDpcInN5c3RlbXZcIn0sXG5cbntcbm5hbWU6XCJTSUdTWVNcIixcbm51bWJlcjozMSxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiSW52YWxpZCBzeXN0ZW0gY2FsbFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR1VOVVNFRFwiLFxubnVtYmVyOjMxLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkludmFsaWQgc3lzdGVtIGNhbGxcIixcbnN0YW5kYXJkOlwib3RoZXJcIn1dO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29yZS5qcy5tYXAiLCAiaW1wb3J0IHtzaWduYWxzQnlOYW1lfSBmcm9tICdodW1hbi1zaWduYWxzJztcblxuY29uc3QgZ2V0RXJyb3JQcmVmaXggPSAoe3RpbWVkT3V0LCB0aW1lb3V0LCBlcnJvckNvZGUsIHNpZ25hbCwgc2lnbmFsRGVzY3JpcHRpb24sIGV4aXRDb2RlLCBpc0NhbmNlbGVkfSkgPT4ge1xuXHRpZiAodGltZWRPdXQpIHtcblx0XHRyZXR1cm4gYHRpbWVkIG91dCBhZnRlciAke3RpbWVvdXR9IG1pbGxpc2Vjb25kc2A7XG5cdH1cblxuXHRpZiAoaXNDYW5jZWxlZCkge1xuXHRcdHJldHVybiAnd2FzIGNhbmNlbGVkJztcblx0fVxuXG5cdGlmIChlcnJvckNvZGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBgZmFpbGVkIHdpdGggJHtlcnJvckNvZGV9YDtcblx0fVxuXG5cdGlmIChzaWduYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBgd2FzIGtpbGxlZCB3aXRoICR7c2lnbmFsfSAoJHtzaWduYWxEZXNjcmlwdGlvbn0pYDtcblx0fVxuXG5cdGlmIChleGl0Q29kZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGBmYWlsZWQgd2l0aCBleGl0IGNvZGUgJHtleGl0Q29kZX1gO1xuXHR9XG5cblx0cmV0dXJuICdmYWlsZWQnO1xufTtcblxuZXhwb3J0IGNvbnN0IG1ha2VFcnJvciA9ICh7XG5cdHN0ZG91dCxcblx0c3RkZXJyLFxuXHRhbGwsXG5cdGVycm9yLFxuXHRzaWduYWwsXG5cdGV4aXRDb2RlLFxuXHRjb21tYW5kLFxuXHRlc2NhcGVkQ29tbWFuZCxcblx0dGltZWRPdXQsXG5cdGlzQ2FuY2VsZWQsXG5cdGtpbGxlZCxcblx0cGFyc2VkOiB7b3B0aW9uczoge3RpbWVvdXR9fSxcbn0pID0+IHtcblx0Ly8gYHNpZ25hbGAgYW5kIGBleGl0Q29kZWAgZW1pdHRlZCBvbiBgc3Bhd25lZC5vbignZXhpdCcpYCBldmVudCBjYW4gYmUgYG51bGxgLlxuXHQvLyBXZSBub3JtYWxpemUgdGhlbSB0byBgdW5kZWZpbmVkYFxuXHRleGl0Q29kZSA9IGV4aXRDb2RlID09PSBudWxsID8gdW5kZWZpbmVkIDogZXhpdENvZGU7XG5cdHNpZ25hbCA9IHNpZ25hbCA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IHNpZ25hbDtcblx0Y29uc3Qgc2lnbmFsRGVzY3JpcHRpb24gPSBzaWduYWwgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IHNpZ25hbHNCeU5hbWVbc2lnbmFsXS5kZXNjcmlwdGlvbjtcblxuXHRjb25zdCBlcnJvckNvZGUgPSBlcnJvciAmJiBlcnJvci5jb2RlO1xuXG5cdGNvbnN0IHByZWZpeCA9IGdldEVycm9yUHJlZml4KHt0aW1lZE91dCwgdGltZW91dCwgZXJyb3JDb2RlLCBzaWduYWwsIHNpZ25hbERlc2NyaXB0aW9uLCBleGl0Q29kZSwgaXNDYW5jZWxlZH0pO1xuXHRjb25zdCBleGVjYU1lc3NhZ2UgPSBgQ29tbWFuZCAke3ByZWZpeH06ICR7Y29tbWFuZH1gO1xuXHRjb25zdCBpc0Vycm9yID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGVycm9yKSA9PT0gJ1tvYmplY3QgRXJyb3JdJztcblx0Y29uc3Qgc2hvcnRNZXNzYWdlID0gaXNFcnJvciA/IGAke2V4ZWNhTWVzc2FnZX1cXG4ke2Vycm9yLm1lc3NhZ2V9YCA6IGV4ZWNhTWVzc2FnZTtcblx0Y29uc3QgbWVzc2FnZSA9IFtzaG9ydE1lc3NhZ2UsIHN0ZGVyciwgc3Rkb3V0XS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG5cblx0aWYgKGlzRXJyb3IpIHtcblx0XHRlcnJvci5vcmlnaW5hbE1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuXHRcdGVycm9yLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR9IGVsc2Uge1xuXHRcdGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuXHR9XG5cblx0ZXJyb3Iuc2hvcnRNZXNzYWdlID0gc2hvcnRNZXNzYWdlO1xuXHRlcnJvci5jb21tYW5kID0gY29tbWFuZDtcblx0ZXJyb3IuZXNjYXBlZENvbW1hbmQgPSBlc2NhcGVkQ29tbWFuZDtcblx0ZXJyb3IuZXhpdENvZGUgPSBleGl0Q29kZTtcblx0ZXJyb3Iuc2lnbmFsID0gc2lnbmFsO1xuXHRlcnJvci5zaWduYWxEZXNjcmlwdGlvbiA9IHNpZ25hbERlc2NyaXB0aW9uO1xuXHRlcnJvci5zdGRvdXQgPSBzdGRvdXQ7XG5cdGVycm9yLnN0ZGVyciA9IHN0ZGVycjtcblxuXHRpZiAoYWxsICE9PSB1bmRlZmluZWQpIHtcblx0XHRlcnJvci5hbGwgPSBhbGw7XG5cdH1cblxuXHRpZiAoJ2J1ZmZlcmVkRGF0YScgaW4gZXJyb3IpIHtcblx0XHRkZWxldGUgZXJyb3IuYnVmZmVyZWREYXRhO1xuXHR9XG5cblx0ZXJyb3IuZmFpbGVkID0gdHJ1ZTtcblx0ZXJyb3IudGltZWRPdXQgPSBCb29sZWFuKHRpbWVkT3V0KTtcblx0ZXJyb3IuaXNDYW5jZWxlZCA9IGlzQ2FuY2VsZWQ7XG5cdGVycm9yLmtpbGxlZCA9IGtpbGxlZCAmJiAhdGltZWRPdXQ7XG5cblx0cmV0dXJuIGVycm9yO1xufTtcbiIsICJjb25zdCBhbGlhc2VzID0gWydzdGRpbicsICdzdGRvdXQnLCAnc3RkZXJyJ107XG5cbmNvbnN0IGhhc0FsaWFzID0gb3B0aW9ucyA9PiBhbGlhc2VzLnNvbWUoYWxpYXMgPT4gb3B0aW9uc1thbGlhc10gIT09IHVuZGVmaW5lZCk7XG5cbmV4cG9ydCBjb25zdCBub3JtYWxpemVTdGRpbyA9IG9wdGlvbnMgPT4ge1xuXHRpZiAoIW9wdGlvbnMpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCB7c3RkaW99ID0gb3B0aW9ucztcblxuXHRpZiAoc3RkaW8gPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBhbGlhc2VzLm1hcChhbGlhcyA9PiBvcHRpb25zW2FsaWFzXSk7XG5cdH1cblxuXHRpZiAoaGFzQWxpYXMob3B0aW9ucykpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYEl0J3Mgbm90IHBvc3NpYmxlIHRvIHByb3ZpZGUgXFxgc3RkaW9cXGAgaW4gY29tYmluYXRpb24gd2l0aCBvbmUgb2YgJHthbGlhc2VzLm1hcChhbGlhcyA9PiBgXFxgJHthbGlhc31cXGBgKS5qb2luKCcsICcpfWApO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBzdGRpbyA9PT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gc3RkaW87XG5cdH1cblxuXHRpZiAoIUFycmF5LmlzQXJyYXkoc3RkaW8pKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgc3RkaW9cXGAgdG8gYmUgb2YgdHlwZSBcXGBzdHJpbmdcXGAgb3IgXFxgQXJyYXlcXGAsIGdvdCBcXGAke3R5cGVvZiBzdGRpb31cXGBgKTtcblx0fVxuXG5cdGNvbnN0IGxlbmd0aCA9IE1hdGgubWF4KHN0ZGlvLmxlbmd0aCwgYWxpYXNlcy5sZW5ndGgpO1xuXHRyZXR1cm4gQXJyYXkuZnJvbSh7bGVuZ3RofSwgKHZhbHVlLCBpbmRleCkgPT4gc3RkaW9baW5kZXhdKTtcbn07XG5cbi8vIGBpcGNgIGlzIHB1c2hlZCB1bmxlc3MgaXQgaXMgYWxyZWFkeSBwcmVzZW50XG5leHBvcnQgY29uc3Qgbm9ybWFsaXplU3RkaW9Ob2RlID0gb3B0aW9ucyA9PiB7XG5cdGNvbnN0IHN0ZGlvID0gbm9ybWFsaXplU3RkaW8ob3B0aW9ucyk7XG5cblx0aWYgKHN0ZGlvID09PSAnaXBjJykge1xuXHRcdHJldHVybiAnaXBjJztcblx0fVxuXG5cdGlmIChzdGRpbyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzdGRpbyA9PT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gW3N0ZGlvLCBzdGRpbywgc3RkaW8sICdpcGMnXTtcblx0fVxuXG5cdGlmIChzdGRpby5pbmNsdWRlcygnaXBjJykpIHtcblx0XHRyZXR1cm4gc3RkaW87XG5cdH1cblxuXHRyZXR1cm4gWy4uLnN0ZGlvLCAnaXBjJ107XG59O1xuIiwgImltcG9ydCBvcyBmcm9tICdub2RlOm9zJztcbmltcG9ydCBvbkV4aXQgZnJvbSAnc2lnbmFsLWV4aXQnO1xuXG5jb25zdCBERUZBVUxUX0ZPUkNFX0tJTExfVElNRU9VVCA9IDEwMDAgKiA1O1xuXG4vLyBNb25rZXktcGF0Y2hlcyBgY2hpbGRQcm9jZXNzLmtpbGwoKWAgdG8gYWRkIGBmb3JjZUtpbGxBZnRlclRpbWVvdXRgIGJlaGF2aW9yXG5leHBvcnQgY29uc3Qgc3Bhd25lZEtpbGwgPSAoa2lsbCwgc2lnbmFsID0gJ1NJR1RFUk0nLCBvcHRpb25zID0ge30pID0+IHtcblx0Y29uc3Qga2lsbFJlc3VsdCA9IGtpbGwoc2lnbmFsKTtcblx0c2V0S2lsbFRpbWVvdXQoa2lsbCwgc2lnbmFsLCBvcHRpb25zLCBraWxsUmVzdWx0KTtcblx0cmV0dXJuIGtpbGxSZXN1bHQ7XG59O1xuXG5jb25zdCBzZXRLaWxsVGltZW91dCA9IChraWxsLCBzaWduYWwsIG9wdGlvbnMsIGtpbGxSZXN1bHQpID0+IHtcblx0aWYgKCFzaG91bGRGb3JjZUtpbGwoc2lnbmFsLCBvcHRpb25zLCBraWxsUmVzdWx0KSkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHRpbWVvdXQgPSBnZXRGb3JjZUtpbGxBZnRlclRpbWVvdXQob3B0aW9ucyk7XG5cdGNvbnN0IHQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRraWxsKCdTSUdLSUxMJyk7XG5cdH0sIHRpbWVvdXQpO1xuXG5cdC8vIEd1YXJkZWQgYmVjYXVzZSB0aGVyZSdzIG5vIGAudW5yZWYoKWAgd2hlbiBgZXhlY2FgIGlzIHVzZWQgaW4gdGhlIHJlbmRlcmVyXG5cdC8vIHByb2Nlc3MgaW4gRWxlY3Ryb24uIFRoaXMgY2Fubm90IGJlIHRlc3RlZCBzaW5jZSB3ZSBkb24ndCBydW4gdGVzdHMgaW5cblx0Ly8gRWxlY3Ryb24uXG5cdC8vIGlzdGFuYnVsIGlnbm9yZSBlbHNlXG5cdGlmICh0LnVucmVmKSB7XG5cdFx0dC51bnJlZigpO1xuXHR9XG59O1xuXG5jb25zdCBzaG91bGRGb3JjZUtpbGwgPSAoc2lnbmFsLCB7Zm9yY2VLaWxsQWZ0ZXJUaW1lb3V0fSwga2lsbFJlc3VsdCkgPT4gaXNTaWd0ZXJtKHNpZ25hbCkgJiYgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0ICE9PSBmYWxzZSAmJiBraWxsUmVzdWx0O1xuXG5jb25zdCBpc1NpZ3Rlcm0gPSBzaWduYWwgPT4gc2lnbmFsID09PSBvcy5jb25zdGFudHMuc2lnbmFscy5TSUdURVJNXG5cdFx0fHwgKHR5cGVvZiBzaWduYWwgPT09ICdzdHJpbmcnICYmIHNpZ25hbC50b1VwcGVyQ2FzZSgpID09PSAnU0lHVEVSTScpO1xuXG5jb25zdCBnZXRGb3JjZUtpbGxBZnRlclRpbWVvdXQgPSAoe2ZvcmNlS2lsbEFmdGVyVGltZW91dCA9IHRydWV9KSA9PiB7XG5cdGlmIChmb3JjZUtpbGxBZnRlclRpbWVvdXQgPT09IHRydWUpIHtcblx0XHRyZXR1cm4gREVGQVVMVF9GT1JDRV9LSUxMX1RJTUVPVVQ7XG5cdH1cblxuXHRpZiAoIU51bWJlci5pc0Zpbml0ZShmb3JjZUtpbGxBZnRlclRpbWVvdXQpIHx8IGZvcmNlS2lsbEFmdGVyVGltZW91dCA8IDApIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCB0aGUgXFxgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0XFxgIG9wdGlvbiB0byBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3QgXFxgJHtmb3JjZUtpbGxBZnRlclRpbWVvdXR9XFxgICgke3R5cGVvZiBmb3JjZUtpbGxBZnRlclRpbWVvdXR9KWApO1xuXHR9XG5cblx0cmV0dXJuIGZvcmNlS2lsbEFmdGVyVGltZW91dDtcbn07XG5cbi8vIGBjaGlsZFByb2Nlc3MuY2FuY2VsKClgXG5leHBvcnQgY29uc3Qgc3Bhd25lZENhbmNlbCA9IChzcGF3bmVkLCBjb250ZXh0KSA9PiB7XG5cdGNvbnN0IGtpbGxSZXN1bHQgPSBzcGF3bmVkLmtpbGwoKTtcblxuXHRpZiAoa2lsbFJlc3VsdCkge1xuXHRcdGNvbnRleHQuaXNDYW5jZWxlZCA9IHRydWU7XG5cdH1cbn07XG5cbmNvbnN0IHRpbWVvdXRLaWxsID0gKHNwYXduZWQsIHNpZ25hbCwgcmVqZWN0KSA9PiB7XG5cdHNwYXduZWQua2lsbChzaWduYWwpO1xuXHRyZWplY3QoT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoJ1RpbWVkIG91dCcpLCB7dGltZWRPdXQ6IHRydWUsIHNpZ25hbH0pKTtcbn07XG5cbi8vIGB0aW1lb3V0YCBvcHRpb24gaGFuZGxpbmdcbmV4cG9ydCBjb25zdCBzZXR1cFRpbWVvdXQgPSAoc3Bhd25lZCwge3RpbWVvdXQsIGtpbGxTaWduYWwgPSAnU0lHVEVSTSd9LCBzcGF3bmVkUHJvbWlzZSkgPT4ge1xuXHRpZiAodGltZW91dCA9PT0gMCB8fCB0aW1lb3V0ID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gc3Bhd25lZFByb21pc2U7XG5cdH1cblxuXHRsZXQgdGltZW91dElkO1xuXHRjb25zdCB0aW1lb3V0UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHR0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHRpbWVvdXRLaWxsKHNwYXduZWQsIGtpbGxTaWduYWwsIHJlamVjdCk7XG5cdFx0fSwgdGltZW91dCk7XG5cdH0pO1xuXG5cdGNvbnN0IHNhZmVTcGF3bmVkUHJvbWlzZSA9IHNwYXduZWRQcm9taXNlLmZpbmFsbHkoKCkgPT4ge1xuXHRcdGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXHR9KTtcblxuXHRyZXR1cm4gUHJvbWlzZS5yYWNlKFt0aW1lb3V0UHJvbWlzZSwgc2FmZVNwYXduZWRQcm9taXNlXSk7XG59O1xuXG5leHBvcnQgY29uc3QgdmFsaWRhdGVUaW1lb3V0ID0gKHt0aW1lb3V0fSkgPT4ge1xuXHRpZiAodGltZW91dCAhPT0gdW5kZWZpbmVkICYmICghTnVtYmVyLmlzRmluaXRlKHRpbWVvdXQpIHx8IHRpbWVvdXQgPCAwKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIHRoZSBcXGB0aW1lb3V0XFxgIG9wdGlvbiB0byBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3QgXFxgJHt0aW1lb3V0fVxcYCAoJHt0eXBlb2YgdGltZW91dH0pYCk7XG5cdH1cbn07XG5cbi8vIGBjbGVhbnVwYCBvcHRpb24gaGFuZGxpbmdcbmV4cG9ydCBjb25zdCBzZXRFeGl0SGFuZGxlciA9IGFzeW5jIChzcGF3bmVkLCB7Y2xlYW51cCwgZGV0YWNoZWR9LCB0aW1lZFByb21pc2UpID0+IHtcblx0aWYgKCFjbGVhbnVwIHx8IGRldGFjaGVkKSB7XG5cdFx0cmV0dXJuIHRpbWVkUHJvbWlzZTtcblx0fVxuXG5cdGNvbnN0IHJlbW92ZUV4aXRIYW5kbGVyID0gb25FeGl0KCgpID0+IHtcblx0XHRzcGF3bmVkLmtpbGwoKTtcblx0fSk7XG5cblx0cmV0dXJuIHRpbWVkUHJvbWlzZS5maW5hbGx5KCgpID0+IHtcblx0XHRyZW1vdmVFeGl0SGFuZGxlcigpO1xuXHR9KTtcbn07XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGlzU3RyZWFtKHN0cmVhbSkge1xuXHRyZXR1cm4gc3RyZWFtICE9PSBudWxsXG5cdFx0JiYgdHlwZW9mIHN0cmVhbSA9PT0gJ29iamVjdCdcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLnBpcGUgPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1dyaXRhYmxlU3RyZWFtKHN0cmVhbSkge1xuXHRyZXR1cm4gaXNTdHJlYW0oc3RyZWFtKVxuXHRcdCYmIHN0cmVhbS53cml0YWJsZSAhPT0gZmFsc2Vcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLl93cml0ZSA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdCYmIHR5cGVvZiBzdHJlYW0uX3dyaXRhYmxlU3RhdGUgPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWFkYWJsZVN0cmVhbShzdHJlYW0pIHtcblx0cmV0dXJuIGlzU3RyZWFtKHN0cmVhbSlcblx0XHQmJiBzdHJlYW0ucmVhZGFibGUgIT09IGZhbHNlXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5fcmVhZCA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdCYmIHR5cGVvZiBzdHJlYW0uX3JlYWRhYmxlU3RhdGUgPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEdXBsZXhTdHJlYW0oc3RyZWFtKSB7XG5cdHJldHVybiBpc1dyaXRhYmxlU3RyZWFtKHN0cmVhbSlcblx0XHQmJiBpc1JlYWRhYmxlU3RyZWFtKHN0cmVhbSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1RyYW5zZm9ybVN0cmVhbShzdHJlYW0pIHtcblx0cmV0dXJuIGlzRHVwbGV4U3RyZWFtKHN0cmVhbSlcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLl90cmFuc2Zvcm0gPT09ICdmdW5jdGlvbic7XG59XG4iLCAiaW1wb3J0IHtpc1N0cmVhbX0gZnJvbSAnaXMtc3RyZWFtJztcbmltcG9ydCBnZXRTdHJlYW0gZnJvbSAnZ2V0LXN0cmVhbSc7XG5pbXBvcnQgbWVyZ2VTdHJlYW0gZnJvbSAnbWVyZ2Utc3RyZWFtJztcblxuLy8gYGlucHV0YCBvcHRpb25cbmV4cG9ydCBjb25zdCBoYW5kbGVJbnB1dCA9IChzcGF3bmVkLCBpbnB1dCkgPT4ge1xuXHRpZiAoaW5wdXQgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmIChpc1N0cmVhbShpbnB1dCkpIHtcblx0XHRpbnB1dC5waXBlKHNwYXduZWQuc3RkaW4pO1xuXHR9IGVsc2Uge1xuXHRcdHNwYXduZWQuc3RkaW4uZW5kKGlucHV0KTtcblx0fVxufTtcblxuLy8gYGFsbGAgaW50ZXJsZWF2ZXMgYHN0ZG91dGAgYW5kIGBzdGRlcnJgXG5leHBvcnQgY29uc3QgbWFrZUFsbFN0cmVhbSA9IChzcGF3bmVkLCB7YWxsfSkgPT4ge1xuXHRpZiAoIWFsbCB8fCAoIXNwYXduZWQuc3Rkb3V0ICYmICFzcGF3bmVkLnN0ZGVycikpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBtaXhlZCA9IG1lcmdlU3RyZWFtKCk7XG5cblx0aWYgKHNwYXduZWQuc3Rkb3V0KSB7XG5cdFx0bWl4ZWQuYWRkKHNwYXduZWQuc3Rkb3V0KTtcblx0fVxuXG5cdGlmIChzcGF3bmVkLnN0ZGVycikge1xuXHRcdG1peGVkLmFkZChzcGF3bmVkLnN0ZGVycik7XG5cdH1cblxuXHRyZXR1cm4gbWl4ZWQ7XG59O1xuXG4vLyBPbiBmYWlsdXJlLCBgcmVzdWx0LnN0ZG91dHxzdGRlcnJ8YWxsYCBzaG91bGQgY29udGFpbiB0aGUgY3VycmVudGx5IGJ1ZmZlcmVkIHN0cmVhbVxuY29uc3QgZ2V0QnVmZmVyZWREYXRhID0gYXN5bmMgKHN0cmVhbSwgc3RyZWFtUHJvbWlzZSkgPT4ge1xuXHQvLyBXaGVuIGBidWZmZXJgIGlzIGBmYWxzZWAsIGBzdHJlYW1Qcm9taXNlYCBpcyBgdW5kZWZpbmVkYCBhbmQgdGhlcmUgaXMgbm8gYnVmZmVyZWQgZGF0YSB0byByZXRyaWV2ZVxuXHRpZiAoIXN0cmVhbSB8fCBzdHJlYW1Qcm9taXNlID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRzdHJlYW0uZGVzdHJveSgpO1xuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIGF3YWl0IHN0cmVhbVByb21pc2U7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0cmV0dXJuIGVycm9yLmJ1ZmZlcmVkRGF0YTtcblx0fVxufTtcblxuY29uc3QgZ2V0U3RyZWFtUHJvbWlzZSA9IChzdHJlYW0sIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9KSA9PiB7XG5cdGlmICghc3RyZWFtIHx8ICFidWZmZXIpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAoZW5jb2RpbmcpIHtcblx0XHRyZXR1cm4gZ2V0U3RyZWFtKHN0cmVhbSwge2VuY29kaW5nLCBtYXhCdWZmZXJ9KTtcblx0fVxuXG5cdHJldHVybiBnZXRTdHJlYW0uYnVmZmVyKHN0cmVhbSwge21heEJ1ZmZlcn0pO1xufTtcblxuLy8gUmV0cmlldmUgcmVzdWx0IG9mIGNoaWxkIHByb2Nlc3M6IGV4aXQgY29kZSwgc2lnbmFsLCBlcnJvciwgc3RyZWFtcyAoc3Rkb3V0L3N0ZGVyci9hbGwpXG5leHBvcnQgY29uc3QgZ2V0U3Bhd25lZFJlc3VsdCA9IGFzeW5jICh7c3Rkb3V0LCBzdGRlcnIsIGFsbH0sIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9LCBwcm9jZXNzRG9uZSkgPT4ge1xuXHRjb25zdCBzdGRvdXRQcm9taXNlID0gZ2V0U3RyZWFtUHJvbWlzZShzdGRvdXQsIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9KTtcblx0Y29uc3Qgc3RkZXJyUHJvbWlzZSA9IGdldFN0cmVhbVByb21pc2Uoc3RkZXJyLCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyfSk7XG5cdGNvbnN0IGFsbFByb21pc2UgPSBnZXRTdHJlYW1Qcm9taXNlKGFsbCwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcjogbWF4QnVmZmVyICogMn0pO1xuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKFtwcm9jZXNzRG9uZSwgc3Rkb3V0UHJvbWlzZSwgc3RkZXJyUHJvbWlzZSwgYWxsUHJvbWlzZV0pO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHJldHVybiBQcm9taXNlLmFsbChbXG5cdFx0XHR7ZXJyb3IsIHNpZ25hbDogZXJyb3Iuc2lnbmFsLCB0aW1lZE91dDogZXJyb3IudGltZWRPdXR9LFxuXHRcdFx0Z2V0QnVmZmVyZWREYXRhKHN0ZG91dCwgc3Rkb3V0UHJvbWlzZSksXG5cdFx0XHRnZXRCdWZmZXJlZERhdGEoc3RkZXJyLCBzdGRlcnJQcm9taXNlKSxcblx0XHRcdGdldEJ1ZmZlcmVkRGF0YShhbGwsIGFsbFByb21pc2UpLFxuXHRcdF0pO1xuXHR9XG59O1xuXG5leHBvcnQgY29uc3QgdmFsaWRhdGVJbnB1dFN5bmMgPSAoe2lucHV0fSkgPT4ge1xuXHRpZiAoaXNTdHJlYW0oaW5wdXQpKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIGBpbnB1dGAgb3B0aW9uIGNhbm5vdCBiZSBhIHN0cmVhbSBpbiBzeW5jIG1vZGUnKTtcblx0fVxufTtcbiIsICIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgdW5pY29ybi9wcmVmZXItdG9wLWxldmVsLWF3YWl0XG5jb25zdCBuYXRpdmVQcm9taXNlUHJvdG90eXBlID0gKGFzeW5jICgpID0+IHt9KSgpLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcblxuY29uc3QgZGVzY3JpcHRvcnMgPSBbJ3RoZW4nLCAnY2F0Y2gnLCAnZmluYWxseSddLm1hcChwcm9wZXJ0eSA9PiBbXG5cdHByb3BlcnR5LFxuXHRSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihuYXRpdmVQcm9taXNlUHJvdG90eXBlLCBwcm9wZXJ0eSksXG5dKTtcblxuLy8gVGhlIHJldHVybiB2YWx1ZSBpcyBhIG1peGluIG9mIGBjaGlsZFByb2Nlc3NgIGFuZCBgUHJvbWlzZWBcbmV4cG9ydCBjb25zdCBtZXJnZVByb21pc2UgPSAoc3Bhd25lZCwgcHJvbWlzZSkgPT4ge1xuXHRmb3IgKGNvbnN0IFtwcm9wZXJ0eSwgZGVzY3JpcHRvcl0gb2YgZGVzY3JpcHRvcnMpIHtcblx0XHQvLyBTdGFydGluZyB0aGUgbWFpbiBgcHJvbWlzZWAgaXMgZGVmZXJyZWQgdG8gYXZvaWQgY29uc3VtaW5nIHN0cmVhbXNcblx0XHRjb25zdCB2YWx1ZSA9IHR5cGVvZiBwcm9taXNlID09PSAnZnVuY3Rpb24nXG5cdFx0XHQ/ICguLi5hcmdzKSA9PiBSZWZsZWN0LmFwcGx5KGRlc2NyaXB0b3IudmFsdWUsIHByb21pc2UoKSwgYXJncylcblx0XHRcdDogZGVzY3JpcHRvci52YWx1ZS5iaW5kKHByb21pc2UpO1xuXG5cdFx0UmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShzcGF3bmVkLCBwcm9wZXJ0eSwgey4uLmRlc2NyaXB0b3IsIHZhbHVlfSk7XG5cdH1cblxuXHRyZXR1cm4gc3Bhd25lZDtcbn07XG5cbi8vIFVzZSBwcm9taXNlcyBpbnN0ZWFkIG9mIGBjaGlsZF9wcm9jZXNzYCBldmVudHNcbmV4cG9ydCBjb25zdCBnZXRTcGF3bmVkUHJvbWlzZSA9IHNwYXduZWQgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRzcGF3bmVkLm9uKCdleGl0JywgKGV4aXRDb2RlLCBzaWduYWwpID0+IHtcblx0XHRyZXNvbHZlKHtleGl0Q29kZSwgc2lnbmFsfSk7XG5cdH0pO1xuXG5cdHNwYXduZWQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuXHRcdHJlamVjdChlcnJvcik7XG5cdH0pO1xuXG5cdGlmIChzcGF3bmVkLnN0ZGluKSB7XG5cdFx0c3Bhd25lZC5zdGRpbi5vbignZXJyb3InLCBlcnJvciA9PiB7XG5cdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdH0pO1xuXHR9XG59KTtcbiIsICJjb25zdCBub3JtYWxpemVBcmdzID0gKGZpbGUsIGFyZ3MgPSBbXSkgPT4ge1xuXHRpZiAoIUFycmF5LmlzQXJyYXkoYXJncykpIHtcblx0XHRyZXR1cm4gW2ZpbGVdO1xuXHR9XG5cblx0cmV0dXJuIFtmaWxlLCAuLi5hcmdzXTtcbn07XG5cbmNvbnN0IE5PX0VTQ0FQRV9SRUdFWFAgPSAvXltcXHcuLV0rJC87XG5jb25zdCBET1VCTEVfUVVPVEVTX1JFR0VYUCA9IC9cIi9nO1xuXG5jb25zdCBlc2NhcGVBcmcgPSBhcmcgPT4ge1xuXHRpZiAodHlwZW9mIGFyZyAhPT0gJ3N0cmluZycgfHwgTk9fRVNDQVBFX1JFR0VYUC50ZXN0KGFyZykpIHtcblx0XHRyZXR1cm4gYXJnO1xuXHR9XG5cblx0cmV0dXJuIGBcIiR7YXJnLnJlcGxhY2UoRE9VQkxFX1FVT1RFU19SRUdFWFAsICdcXFxcXCInKX1cImA7XG59O1xuXG5leHBvcnQgY29uc3Qgam9pbkNvbW1hbmQgPSAoZmlsZSwgYXJncykgPT4gbm9ybWFsaXplQXJncyhmaWxlLCBhcmdzKS5qb2luKCcgJyk7XG5cbmV4cG9ydCBjb25zdCBnZXRFc2NhcGVkQ29tbWFuZCA9IChmaWxlLCBhcmdzKSA9PiBub3JtYWxpemVBcmdzKGZpbGUsIGFyZ3MpLm1hcChhcmcgPT4gZXNjYXBlQXJnKGFyZykpLmpvaW4oJyAnKTtcblxuY29uc3QgU1BBQ0VTX1JFR0VYUCA9IC8gKy9nO1xuXG4vLyBIYW5kbGUgYGV4ZWNhQ29tbWFuZCgpYFxuZXhwb3J0IGNvbnN0IHBhcnNlQ29tbWFuZCA9IGNvbW1hbmQgPT4ge1xuXHRjb25zdCB0b2tlbnMgPSBbXTtcblx0Zm9yIChjb25zdCB0b2tlbiBvZiBjb21tYW5kLnRyaW0oKS5zcGxpdChTUEFDRVNfUkVHRVhQKSkge1xuXHRcdC8vIEFsbG93IHNwYWNlcyB0byBiZSBlc2NhcGVkIGJ5IGEgYmFja3NsYXNoIGlmIG5vdCBtZWFudCBhcyBhIGRlbGltaXRlclxuXHRcdGNvbnN0IHByZXZpb3VzVG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuXHRcdGlmIChwcmV2aW91c1Rva2VuICYmIHByZXZpb3VzVG9rZW4uZW5kc1dpdGgoJ1xcXFwnKSkge1xuXHRcdFx0Ly8gTWVyZ2UgcHJldmlvdXMgdG9rZW4gd2l0aCBjdXJyZW50IG9uZVxuXHRcdFx0dG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXSA9IGAke3ByZXZpb3VzVG9rZW4uc2xpY2UoMCwgLTEpfSAke3Rva2VufWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRva2Vucy5wdXNoKHRva2VuKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG9rZW5zO1xufTtcbiIsICJpbXBvcnQgeyBMb2NhbFN0b3JhZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBwYmtkZjIgfSBmcm9tIFwiY3J5cHRvXCI7XG5pbXBvcnQgeyBMT0NBTF9TVE9SQUdFX0tFWSB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBERUZBVUxUX1BBU1NXT1JEX09QVElPTlMsIFJFUFJPTVBUX0hBU0hfU0FMVCB9IGZyb20gXCJ+L2NvbnN0YW50cy9wYXNzd29yZHNcIjtcbmltcG9ydCB7IFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gXCJ+L3R5cGVzL3Bhc3N3b3Jkc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFzc3dvcmRHZW5lcmF0aW5nQXJncyhvcHRpb25zOiBQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBPYmplY3QuZW50cmllcyhvcHRpb25zKS5mbGF0TWFwKChbYXJnLCB2YWx1ZV0pID0+ICh2YWx1ZSA/IFtgLS0ke2FyZ31gLCB2YWx1ZV0gOiBbXSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzaE1hc3RlclBhc3N3b3JkRm9yUmVwcm9tcHRpbmcocGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgcGJrZGYyKHBhc3N3b3JkLCBSRVBST01QVF9IQVNIX1NBTFQsIDEwMDAwMCwgNjQsIFwic2hhNTEyXCIsIChlcnJvciwgaGFzaGVkKSA9PiB7XG4gICAgICBpZiAoZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmUoaGFzaGVkLnRvU3RyaW5nKFwiaGV4XCIpKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMoKSB7XG4gIGNvbnN0IHN0b3JlZE9wdGlvbnMgPSBhd2FpdCBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KExPQ0FMX1NUT1JBR0VfS0VZLlBBU1NXT1JEX09QVElPTlMpO1xuICByZXR1cm4ge1xuICAgIC4uLkRFRkFVTFRfUEFTU1dPUkRfT1BUSU9OUyxcbiAgICAuLi4oc3RvcmVkT3B0aW9ucyA/IEpTT04ucGFyc2Uoc3RvcmVkT3B0aW9ucykgOiB7fSksXG4gIH0gYXMgUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zO1xufVxuIiwgImltcG9ydCB7IFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gXCJ+L3R5cGVzL3Bhc3N3b3Jkc1wiO1xuXG5leHBvcnQgY29uc3QgUkVQUk9NUFRfSEFTSF9TQUxUID0gXCJmb29iYXJiYXp6eWJhelwiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QQVNTV09SRF9PUFRJT05TOiBSZXF1aXJlZDxQYXNzd29yZEdlbmVyYXRvck9wdGlvbnM+ID0ge1xuICBsb3dlcmNhc2U6IHRydWUsXG4gIHVwcGVyY2FzZTogdHJ1ZSxcbiAgbnVtYmVyOiBmYWxzZSxcbiAgc3BlY2lhbDogZmFsc2UsXG4gIHBhc3NwaHJhc2U6IGZhbHNlLFxuICBsZW5ndGg6IFwiMTRcIixcbiAgd29yZHM6IFwiM1wiLFxuICBzZXBhcmF0b3I6IFwiLVwiLFxuICBjYXBpdGFsaXplOiBmYWxzZSxcbiAgaW5jbHVkZU51bWJlcjogZmFsc2UsXG4gIG1pbk51bWJlcjogXCIxXCIsXG4gIG1pblNwZWNpYWw6IFwiMVwiLFxufTtcbiIsICJpbXBvcnQgeyBlbnZpcm9ubWVudCwgZ2V0UHJlZmVyZW5jZVZhbHVlcyB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IFZBVUxUX1RJTUVPVVRfTVNfVE9fTEFCRUwgfSBmcm9tIFwifi9jb25zdGFudHMvbGFiZWxzXCI7XG5pbXBvcnQgeyBDb21tYW5kTmFtZSB9IGZyb20gXCJ+L3R5cGVzL2dlbmVyYWxcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlcnZlclVybFByZWZlcmVuY2UoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgeyBzZXJ2ZXJVcmwgfSA9IGdldFByZWZlcmVuY2VWYWx1ZXM8UHJlZmVyZW5jZXM+KCk7XG4gIHJldHVybiAhc2VydmVyVXJsIHx8IHNlcnZlclVybCA9PT0gXCJiaXR3YXJkZW4uY29tXCIgfHwgc2VydmVyVXJsID09PSBcImh0dHBzOi8vYml0d2FyZGVuLmNvbVwiID8gdW5kZWZpbmVkIDogc2VydmVyVXJsO1xufVxuXG50eXBlIFByZWZlcmVuY2VLZXlPZkNvbW1hbmRzV2l0aFRyYW5zaWVudE9wdGlvbnMgPVxuICB8IGtleW9mIFByZWZlcmVuY2VzLlNlYXJjaFxuICB8IGtleW9mIFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmRcbiAgfCBrZXlvZiBQcmVmZXJlbmNlcy5HZW5lcmF0ZVBhc3N3b3JkUXVpY2s7XG5cbnR5cGUgVHJhbnNpZW50T3B0aW9uc1ZhbHVlID1cbiAgfCBQcmVmZXJlbmNlcy5TZWFyY2hbXCJ0cmFuc2llbnRDb3B5U2VhcmNoXCJdXG4gIHwgUHJlZmVyZW5jZXMuR2VuZXJhdGVQYXNzd29yZFtcInRyYW5zaWVudENvcHlHZW5lcmF0ZVBhc3N3b3JkXCJdXG4gIHwgUHJlZmVyZW5jZXMuR2VuZXJhdGVQYXNzd29yZFF1aWNrW1widHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmRRdWlja1wiXTtcblxuY29uc3QgQ09NTUFORF9OQU1FX1RPX1BSRUZFUkVOQ0VfS0VZX01BUDogUmVjb3JkPENvbW1hbmROYW1lLCBQcmVmZXJlbmNlS2V5T2ZDb21tYW5kc1dpdGhUcmFuc2llbnRPcHRpb25zPiA9IHtcbiAgc2VhcmNoOiBcInRyYW5zaWVudENvcHlTZWFyY2hcIixcbiAgXCJnZW5lcmF0ZS1wYXNzd29yZFwiOiBcInRyYW5zaWVudENvcHlHZW5lcmF0ZVBhc3N3b3JkXCIsXG4gIFwiZ2VuZXJhdGUtcGFzc3dvcmQtcXVpY2tcIjogXCJ0cmFuc2llbnRDb3B5R2VuZXJhdGVQYXNzd29yZFF1aWNrXCIsXG59O1xuXG50eXBlIFByZWZlcmVuY2VzID0gUHJlZmVyZW5jZXMuU2VhcmNoICYgUHJlZmVyZW5jZXMuR2VuZXJhdGVQYXNzd29yZCAmIFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmRRdWljaztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zaWVudENvcHlQcmVmZXJlbmNlKHR5cGU6IFwicGFzc3dvcmRcIiB8IFwib3RoZXJcIik6IGJvb2xlYW4ge1xuICBjb25zdCBwcmVmZXJlbmNlS2V5ID0gQ09NTUFORF9OQU1FX1RPX1BSRUZFUkVOQ0VfS0VZX01BUFtlbnZpcm9ubWVudC5jb21tYW5kTmFtZSBhcyBDb21tYW5kTmFtZV07XG4gIGNvbnN0IHRyYW5zaWVudFByZWZlcmVuY2UgPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpW3ByZWZlcmVuY2VLZXldIGFzIFRyYW5zaWVudE9wdGlvbnNWYWx1ZTtcbiAgaWYgKHRyYW5zaWVudFByZWZlcmVuY2UgPT09IFwibmV2ZXJcIikgcmV0dXJuIGZhbHNlO1xuICBpZiAodHJhbnNpZW50UHJlZmVyZW5jZSA9PT0gXCJhbHdheXNcIikgcmV0dXJuIHRydWU7XG4gIGlmICh0cmFuc2llbnRQcmVmZXJlbmNlID09PSBcInBhc3N3b3Jkc1wiKSByZXR1cm4gdHlwZSA9PT0gXCJwYXNzd29yZFwiO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExhYmVsRm9yVGltZW91dFByZWZlcmVuY2UodGltZW91dDogc3RyaW5nIHwgbnVtYmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIFZBVUxUX1RJTUVPVVRfTVNfVE9fTEFCRUxbdGltZW91dCBhcyBrZXlvZiB0eXBlb2YgVkFVTFRfVElNRU9VVF9NU19UT19MQUJFTF07XG59XG4iLCAiY29uc3QgVkFVTFRfVElNRU9VVF9PUFRJT05TID0ge1xuICBJTU1FRElBVEVMWTogXCIwXCIsXG4gIE9ORV9NSU5VVEU6IFwiNjAwMDBcIixcbiAgRklWRV9NSU5VVEVTOiBcIjMwMDAwMFwiLFxuICBGSUZURUVOX01JTlVURVM6IFwiOTAwMDAwXCIsXG4gIFRISVJUWV9NSU5VVEVTOiBcIjE4MDAwMDBcIixcbiAgT05FX0hPVVI6IFwiMzYwMDAwMFwiLFxuICBGT1VSX0hPVVJTOiBcIjE0NDAwMDAwXCIsXG4gIEVJR0hUX0hPVVJTOiBcIjI4ODAwMDAwXCIsXG4gIE9ORV9EQVk6IFwiODY0MDAwMDBcIixcbiAgTkVWRVI6IFwiLTFcIixcbiAgU1lTVEVNX0xPQ0s6IFwiLTJcIixcbiAgU1lTVEVNX1NMRUVQOiBcIi0zXCIsXG59IGFzIGNvbnN0IHNhdGlzZmllcyBSZWNvcmQ8c3RyaW5nLCBQcmVmZXJlbmNlc1tcInJlcHJvbXB0SWdub3JlRHVyYXRpb25cIl0+O1xuXG5leHBvcnQgY29uc3QgVkFVTFRfVElNRU9VVCA9IE9iamVjdC5lbnRyaWVzKFZBVUxUX1RJTUVPVVRfT1BUSU9OUykucmVkdWNlKChhY2MsIFtrZXksIHZhbHVlXSkgPT4ge1xuICBhY2Nba2V5IGFzIGtleW9mIHR5cGVvZiBWQVVMVF9USU1FT1VUX09QVElPTlNdID0gcGFyc2VJbnQodmFsdWUpO1xuICByZXR1cm4gYWNjO1xufSwge30gYXMgUmVjb3JkPGtleW9mIHR5cGVvZiBWQVVMVF9USU1FT1VUX09QVElPTlMsIG51bWJlcj4pO1xuIiwgImltcG9ydCB7IFZBVUxUX1RJTUVPVVQgfSBmcm9tIFwifi9jb25zdGFudHMvcHJlZmVyZW5jZXNcIjtcbmltcG9ydCB7IENhcmQsIElkZW50aXR5LCBJdGVtVHlwZSB9IGZyb20gXCJ+L3R5cGVzL3ZhdWx0XCI7XG5cbmV4cG9ydCBjb25zdCBWQVVMVF9USU1FT1VUX01TX1RPX0xBQkVMOiBQYXJ0aWFsPFJlY29yZDxrZXlvZiB0eXBlb2YgVkFVTFRfVElNRU9VVCwgc3RyaW5nPj4gPSB7XG4gIFtWQVVMVF9USU1FT1VULklNTUVESUFURUxZXTogXCJJbW1lZGlhdGVseVwiLFxuICBbVkFVTFRfVElNRU9VVC5PTkVfTUlOVVRFXTogXCIxIE1pbnV0ZVwiLFxuICBbVkFVTFRfVElNRU9VVC5GSVZFX01JTlVURVNdOiBcIjUgTWludXRlc1wiLFxuICBbVkFVTFRfVElNRU9VVC5GSUZURUVOX01JTlVURVNdOiBcIjE1IE1pbnV0ZXNcIixcbiAgW1ZBVUxUX1RJTUVPVVQuVEhJUlRZX01JTlVURVNdOiBcIjMwIE1pbnV0ZXNcIixcbiAgW1ZBVUxUX1RJTUVPVVQuT05FX0hPVVJdOiBcIjEgSG91clwiLFxuICBbVkFVTFRfVElNRU9VVC5GT1VSX0hPVVJTXTogXCI0IEhvdXJzXCIsXG4gIFtWQVVMVF9USU1FT1VULkVJR0hUX0hPVVJTXTogXCI4IEhvdXJzXCIsXG4gIFtWQVVMVF9USU1FT1VULk9ORV9EQVldOiBcIjEgRGF5XCIsXG59O1xuXG5leHBvcnQgY29uc3QgQ0FSRF9LRVlfTEFCRUw6IFJlY29yZDxrZXlvZiBDYXJkLCBzdHJpbmc+ID0ge1xuICBjYXJkaG9sZGVyTmFtZTogXCJDYXJkaG9sZGVyIG5hbWVcIixcbiAgYnJhbmQ6IFwiQnJhbmRcIixcbiAgbnVtYmVyOiBcIk51bWJlclwiLFxuICBleHBNb250aDogXCJFeHBpcmF0aW9uIG1vbnRoXCIsXG4gIGV4cFllYXI6IFwiRXhwaXJhdGlvbiB5ZWFyXCIsXG4gIGNvZGU6IFwiU2VjdXJpdHkgY29kZSAoQ1ZWKVwiLFxufTtcblxuZXhwb3J0IGNvbnN0IElERU5USVRZX0tFWV9MQUJFTDogUmVjb3JkPGtleW9mIElkZW50aXR5LCBzdHJpbmc+ID0ge1xuICB0aXRsZTogXCJUaXRsZVwiLFxuICBmaXJzdE5hbWU6IFwiRmlyc3QgbmFtZVwiLFxuICBtaWRkbGVOYW1lOiBcIk1pZGRsZSBuYW1lXCIsXG4gIGxhc3ROYW1lOiBcIkxhc3QgbmFtZVwiLFxuICB1c2VybmFtZTogXCJVc2VybmFtZVwiLFxuICBjb21wYW55OiBcIkNvbXBhbnlcIixcbiAgc3NuOiBcIlNvY2lhbCBTZWN1cml0eSBudW1iZXJcIixcbiAgcGFzc3BvcnROdW1iZXI6IFwiUGFzc3BvcnQgbnVtYmVyXCIsXG4gIGxpY2Vuc2VOdW1iZXI6IFwiTGljZW5zZSBudW1iZXJcIixcbiAgZW1haWw6IFwiRW1haWxcIixcbiAgcGhvbmU6IFwiUGhvbmVcIixcbiAgYWRkcmVzczE6IFwiQWRkcmVzcyAxXCIsXG4gIGFkZHJlc3MyOiBcIkFkZHJlc3MgMlwiLFxuICBhZGRyZXNzMzogXCJBZGRyZXNzIDNcIixcbiAgY2l0eTogXCJDaXR5IC8gVG93blwiLFxuICBzdGF0ZTogXCJTdGF0ZSAvIFByb3ZpbmNlXCIsXG4gIHBvc3RhbENvZGU6IFwiWmlwIC8gUG9zdGFsIGNvZGVcIixcbiAgY291bnRyeTogXCJDb3VudHJ5XCIsXG59O1xuXG5leHBvcnQgY29uc3QgSVRFTV9UWVBFX1RPX0xBQkVMOiBSZWNvcmQ8SXRlbVR5cGUsIHN0cmluZz4gPSB7XG4gIFtJdGVtVHlwZS5MT0dJTl06IFwiTG9naW5cIixcbiAgW0l0ZW1UeXBlLkNBUkRdOiBcIkNhcmRcIixcbiAgW0l0ZW1UeXBlLklERU5USVRZXTogXCJJZGVudGl0eVwiLFxuICBbSXRlbVR5cGUuTk9URV06IFwiU2VjdXJlIE5vdGVcIixcbiAgW0l0ZW1UeXBlLlNTSF9LRVldOiBcIlNTSCBLZXlcIixcbn07XG4iLCAiZXhwb3J0IGNsYXNzIE1hbnVhbGx5VGhyb3duRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERpc3BsYXlhYmxlRXJyb3IgZXh0ZW5kcyBNYW51YWxseVRocm93bkVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UsIHN0YWNrKTtcbiAgfVxufVxuXG4vKiAtLSBzcGVjaWZpYyBlcnJvcnMgYmVsb3cgLS0gKi9cblxuZXhwb3J0IGNsYXNzIENMSU5vdEZvdW5kRXJyb3IgZXh0ZW5kcyBEaXNwbGF5YWJsZUVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJCaXR3YXJkZW4gQ0xJIG5vdCBmb3VuZFwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJDTElOb3RGb3VuZEVycm9yXCI7XG4gICAgdGhpcy5zdGFjayA9IHN0YWNrO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbnN0YWxsZWRDTElOb3RGb3VuZEVycm9yIGV4dGVuZHMgRGlzcGxheWFibGVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiQml0d2FyZGVuIENMSSBub3QgZm91bmRcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvclwiO1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRmFpbGVkVG9Mb2FkVmF1bHRJdGVtc0Vycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIkZhaWxlZCB0byBsb2FkIHZhdWx0IGl0ZW1zXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIkZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBWYXVsdElzTG9ja2VkRXJyb3IgZXh0ZW5kcyBEaXNwbGF5YWJsZUVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiVmF1bHQgaXMgbG9ja2VkXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIlZhdWx0SXNMb2NrZWRFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOb3RMb2dnZWRJbkVycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiTm90IGxvZ2dlZCBpblwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJOb3RMb2dnZWRJbkVycm9yXCI7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVuc3VyZUNsaUJpbkVycm9yIGV4dGVuZHMgRGlzcGxheWFibGVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIkZhaWxlZCBkbyBkb3dubG9hZCBCaXR3YXJkZW4gQ0xJXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIkVuc3VyZUNsaUJpbkVycm9yXCI7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByZW1pdW1GZWF0dXJlRXJyb3IgZXh0ZW5kcyBNYW51YWxseVRocm93bkVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiUHJlbWl1bSBzdGF0dXMgaXMgcmVxdWlyZWQgdG8gdXNlIHRoaXMgZmVhdHVyZVwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJQcmVtaXVtRmVhdHVyZUVycm9yXCI7XG4gIH1cbn1cbmV4cG9ydCBjbGFzcyBTZW5kTmVlZHNQYXNzd29yZEVycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIlRoaXMgU2VuZCBoYXMgYSBpcyBwcm90ZWN0ZWQgYnkgYSBwYXNzd29yZFwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJTZW5kTmVlZHNQYXNzd29yZEVycm9yXCI7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNlbmRJbnZhbGlkUGFzc3dvcmRFcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJUaGUgcGFzc3dvcmQgeW91IGVudGVyZWQgaXMgaW52YWxpZFwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJTZW5kSW52YWxpZFBhc3N3b3JkRXJyb3JcIjtcbiAgfVxufVxuXG4vKiAtLSBlcnJvciB1dGlscyBiZWxvdyAtLSAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdHJ5RXhlYzxUPihmbjogKCkgPT4gVCk6IFQgZXh0ZW5kcyB2b2lkID8gVCA6IFQgfCB1bmRlZmluZWQ7XG5leHBvcnQgZnVuY3Rpb24gdHJ5RXhlYzxULCBGPihmbjogKCkgPT4gVCwgZmFsbGJhY2tWYWx1ZTogRik6IFQgfCBGO1xuZXhwb3J0IGZ1bmN0aW9uIHRyeUV4ZWM8VCwgRj4oZm46ICgpID0+IFQsIGZhbGxiYWNrVmFsdWU/OiBGKTogVCB8IEYgfCB1bmRlZmluZWQge1xuICB0cnkge1xuICAgIHJldHVybiBmbigpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsbGJhY2tWYWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGlzcGxheWFibGVFcnJvck1lc3NhZ2UoZXJyb3I6IGFueSkge1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBEaXNwbGF5YWJsZUVycm9yKSByZXR1cm4gZXJyb3IubWVzc2FnZTtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IGdldEVycm9yU3RyaW5nID0gKGVycm9yOiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICBpZiAoIWVycm9yKSByZXR1cm4gdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIGVycm9yID09PSBcInN0cmluZ1wiKSByZXR1cm4gZXJyb3I7XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgY29uc3QgeyBtZXNzYWdlLCBuYW1lIH0gPSBlcnJvcjtcbiAgICBpZiAoZXJyb3Iuc3RhY2spIHJldHVybiBlcnJvci5zdGFjaztcbiAgICByZXR1cm4gYCR7bmFtZX06ICR7bWVzc2FnZX1gO1xuICB9XG4gIHJldHVybiBTdHJpbmcoZXJyb3IpO1xufTtcblxuZXhwb3J0IHR5cGUgU3VjY2VzczxUPiA9IFtULCBudWxsXTtcbmV4cG9ydCB0eXBlIEZhaWx1cmU8RT4gPSBbbnVsbCwgRV07XG5leHBvcnQgdHlwZSBSZXN1bHQ8VCwgRSA9IEVycm9yPiA9IFN1Y2Nlc3M8VD4gfCBGYWlsdXJlPEU+O1xuXG5leHBvcnQgZnVuY3Rpb24gT2s8VD4oZGF0YTogVCk6IFN1Y2Nlc3M8VD4ge1xuICByZXR1cm4gW2RhdGEsIG51bGxdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIEVycjxFID0gRXJyb3I+KGVycm9yOiBFKTogRmFpbHVyZTxFPiB7XG4gIHJldHVybiBbbnVsbCwgZXJyb3JdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ5Q2F0Y2g8VCwgRSA9IEVycm9yPihmbjogKCkgPT4gVCk6IFJlc3VsdDxULCBFPjtcbmV4cG9ydCBmdW5jdGlvbiB0cnlDYXRjaDxULCBFID0gRXJyb3I+KHByb21pc2U6IFByb21pc2U8VD4pOiBQcm9taXNlPFJlc3VsdDxULCBFPj47XG4vKipcbiAqIEV4ZWN1dGVzIGEgZnVuY3Rpb24gb3IgYSBwcm9taXNlIHNhZmVseSBpbnNpZGUgYSB0cnkvY2F0Y2ggYW5kXG4gKiByZXR1cm5zIGEgYFJlc3VsdGAgKGBbZGF0YSwgZXJyb3JdYCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlDYXRjaDxULCBFID0gRXJyb3I+KGZuT3JQcm9taXNlOiAoKCkgPT4gVCkgfCBQcm9taXNlPFQ+KTogTWF5YmVQcm9taXNlPFJlc3VsdDxULCBFPj4ge1xuICBpZiAodHlwZW9mIGZuT3JQcm9taXNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIE9rKGZuT3JQcm9taXNlKCkpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIHJldHVybiBFcnIoZXJyb3IpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZm5PclByb21pc2UudGhlbigoZGF0YSkgPT4gT2soZGF0YSkpLmNhdGNoKChlcnJvcikgPT4gRXJyKGVycm9yKSk7XG59XG4iLCAiaW1wb3J0IHsgZXhpc3RzU3luYywgbWtkaXJTeW5jLCBzdGF0U3luYywgdW5saW5rU3luYyB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgcmVhZGRpciwgdW5saW5rIH0gZnJvbSBcImZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCBzdHJlYW1aaXAgZnJvbSBcIm5vZGUtc3RyZWFtLXppcFwiO1xuaW1wb3J0IHsgdHJ5RXhlYyB9IGZyb20gXCJ+L3V0aWxzL2Vycm9yc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gd2FpdEZvckZpbGVBdmFpbGFibGUocGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAoIWV4aXN0c1N5bmMocGF0aCkpIHJldHVybjtcbiAgICAgIGNvbnN0IHN0YXRzID0gc3RhdFN5bmMocGF0aCk7XG4gICAgICBpZiAoc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9LCAzMDApO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoYEZpbGUgJHtwYXRofSBub3QgZm91bmQuYCkpO1xuICAgIH0sIDUwMDApO1xuICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY29tcHJlc3NGaWxlKGZpbGVQYXRoOiBzdHJpbmcsIHRhcmdldFBhdGg6IHN0cmluZykge1xuICBjb25zdCB6aXAgPSBuZXcgc3RyZWFtWmlwLmFzeW5jKHsgZmlsZTogZmlsZVBhdGggfSk7XG4gIGlmICghZXhpc3RzU3luYyh0YXJnZXRQYXRoKSkgbWtkaXJTeW5jKHRhcmdldFBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICBhd2FpdCB6aXAuZXh0cmFjdChudWxsLCB0YXJnZXRQYXRoKTtcbiAgYXdhaXQgemlwLmNsb3NlKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVGaWxlc1RoYXRTdGFydFdpdGgoc3RhcnRpbmdXaXRoOiBzdHJpbmcsIHBhdGg6IHN0cmluZykge1xuICBsZXQgcmVtb3ZlZEF0TGVhc3RPbmUgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHJlYWRkaXIocGF0aCk7XG4gICAgZm9yIGF3YWl0IChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBpZiAoIWZpbGUuc3RhcnRzV2l0aChzdGFydGluZ1dpdGgpKSBjb250aW51ZTtcbiAgICAgIGF3YWl0IHRyeUV4ZWMoYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCB1bmxpbmsoam9pbihwYXRoLCBmaWxlKSk7XG4gICAgICAgIHJlbW92ZWRBdExlYXN0T25lID0gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiByZW1vdmVkQXRMZWFzdE9uZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB1bmxpbmtBbGxTeW5jKC4uLnBhdGhzOiBzdHJpbmdbXSkge1xuICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHMpIHtcbiAgICB0cnlFeGVjKCgpID0+IHVubGlua1N5bmMocGF0aCkpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgY3JlYXRlV3JpdGVTdHJlYW0sIHVubGluayB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IGh0dHAgZnJvbSBcImh0dHBcIjtcbmltcG9ydCBodHRwcyBmcm9tIFwiaHR0cHNcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuaW1wb3J0IHsgZ2V0RmlsZVNoYTI1NiB9IGZyb20gXCJ+L3V0aWxzL2NyeXB0b1wiO1xuaW1wb3J0IHsgd2FpdEZvckZpbGVBdmFpbGFibGUgfSBmcm9tIFwifi91dGlscy9mc1wiO1xuXG50eXBlIERvd25sb2FkT3B0aW9ucyA9IHtcbiAgb25Qcm9ncmVzcz86IChwZXJjZW50OiBudW1iZXIpID0+IHZvaWQ7XG4gIHNoYTI1Nj86IHN0cmluZztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkb3dubG9hZCh1cmw6IHN0cmluZywgcGF0aDogc3RyaW5nLCBvcHRpb25zPzogRG93bmxvYWRPcHRpb25zKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHsgb25Qcm9ncmVzcywgc2hhMjU2IH0gPSBvcHRpb25zID8/IHt9O1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgdXJpID0gbmV3IFVSTCh1cmwpO1xuICAgIGNvbnN0IHByb3RvY29sID0gdXJpLnByb3RvY29sID09PSBcImh0dHBzOlwiID8gaHR0cHMgOiBodHRwO1xuXG4gICAgbGV0IHJlZGlyZWN0Q291bnQgPSAwO1xuICAgIGNvbnN0IHJlcXVlc3QgPSBwcm90b2NvbC5nZXQodXJpLmhyZWYsIChyZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA+PSAzMDAgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA8IDQwMCkge1xuICAgICAgICByZXF1ZXN0LmRlc3Ryb3koKTtcbiAgICAgICAgcmVzcG9uc2UuZGVzdHJveSgpO1xuXG4gICAgICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gcmVzcG9uc2UuaGVhZGVycy5sb2NhdGlvbjtcbiAgICAgICAgaWYgKCFyZWRpcmVjdFVybCkge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFJlZGlyZWN0IHJlc3BvbnNlIHdpdGhvdXQgbG9jYXRpb24gaGVhZGVyYCkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgrK3JlZGlyZWN0Q291bnQgPj0gMTApIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiVG9vIG1hbnkgcmVkaXJlY3RzXCIpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkb3dubG9hZChyZWRpcmVjdFVybCwgcGF0aCwgb3B0aW9ucykudGhlbihyZXNvbHZlKS5jYXRjaChyZWplY3QpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICE9PSAyMDApIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgUmVzcG9uc2Ugc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06ICR7cmVzcG9uc2Uuc3RhdHVzTWVzc2FnZX1gKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsZVNpemUgPSBwYXJzZUludChyZXNwb25zZS5oZWFkZXJzW1wiY29udGVudC1sZW5ndGhcIl0gfHwgXCIwXCIsIDEwKTtcbiAgICAgIGlmIChmaWxlU2l6ZSA9PT0gMCkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKFwiSW52YWxpZCBmaWxlIHNpemVcIikpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpbGVTdHJlYW0gPSBjcmVhdGVXcml0ZVN0cmVhbShwYXRoLCB7IGF1dG9DbG9zZTogdHJ1ZSB9KTtcbiAgICAgIGxldCBkb3dubG9hZGVkQnl0ZXMgPSAwO1xuXG4gICAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4ge1xuICAgICAgICByZXF1ZXN0LmRlc3Ryb3koKTtcbiAgICAgICAgcmVzcG9uc2UuZGVzdHJveSgpO1xuICAgICAgICBmaWxlU3RyZWFtLmNsb3NlKCk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBjbGVhbnVwQW5kUmVqZWN0ID0gKGVycm9yPzogRXJyb3IpID0+IHtcbiAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfTtcblxuICAgICAgcmVzcG9uc2Uub24oXCJkYXRhXCIsIChjaHVuaykgPT4ge1xuICAgICAgICBkb3dubG9hZGVkQnl0ZXMgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICBjb25zdCBwZXJjZW50ID0gTWF0aC5mbG9vcigoZG93bmxvYWRlZEJ5dGVzIC8gZmlsZVNpemUpICogMTAwKTtcbiAgICAgICAgb25Qcm9ncmVzcz8uKHBlcmNlbnQpO1xuICAgICAgfSk7XG5cbiAgICAgIGZpbGVTdHJlYW0ub24oXCJmaW5pc2hcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IHdhaXRGb3JGaWxlQXZhaWxhYmxlKHBhdGgpO1xuICAgICAgICAgIGlmIChzaGEyNTYpIGF3YWl0IHdhaXRGb3JIYXNoVG9NYXRjaChwYXRoLCBzaGEyNTYpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGZpbGVTdHJlYW0ub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcbiAgICAgICAgY2FwdHVyZUV4Y2VwdGlvbihgRmlsZSBzdHJlYW0gZXJyb3Igd2hpbGUgZG93bmxvYWRpbmcgJHt1cmx9YCwgZXJyb3IpO1xuICAgICAgICB1bmxpbmsocGF0aCwgKCkgPT4gY2xlYW51cEFuZFJlamVjdChlcnJvcikpO1xuICAgICAgfSk7XG5cbiAgICAgIHJlc3BvbnNlLm9uKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XG4gICAgICAgIGNhcHR1cmVFeGNlcHRpb24oYFJlc3BvbnNlIGVycm9yIHdoaWxlIGRvd25sb2FkaW5nICR7dXJsfWAsIGVycm9yKTtcbiAgICAgICAgdW5saW5rKHBhdGgsICgpID0+IGNsZWFudXBBbmRSZWplY3QoZXJyb3IpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXF1ZXN0Lm9uKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XG4gICAgICAgIGNhcHR1cmVFeGNlcHRpb24oYFJlcXVlc3QgZXJyb3Igd2hpbGUgZG93bmxvYWRpbmcgJHt1cmx9YCwgZXJyb3IpO1xuICAgICAgICB1bmxpbmsocGF0aCwgKCkgPT4gY2xlYW51cEFuZFJlamVjdChlcnJvcikpO1xuICAgICAgfSk7XG5cbiAgICAgIHJlc3BvbnNlLnBpcGUoZmlsZVN0cmVhbSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB3YWl0Rm9ySGFzaFRvTWF0Y2gocGF0aDogc3RyaW5nLCBzaGEyNTY6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGZpbGVTaGEgPSBnZXRGaWxlU2hhMjU2KHBhdGgpO1xuICAgIGlmICghZmlsZVNoYSkgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoYENvdWxkIG5vdCBnZW5lcmF0ZSBoYXNoIGZvciBmaWxlICR7cGF0aH0uYCkpO1xuICAgIGlmIChmaWxlU2hhID09PSBzaGEyNTYpIHJldHVybiByZXNvbHZlKCk7XG5cbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmIChnZXRGaWxlU2hhMjU2KHBhdGgpID09PSBzaGEyNTYpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9LCAxMDAwKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICByZWplY3QobmV3IEVycm9yKGBIYXNoIGRpZCBub3QgbWF0Y2gsIGV4cGVjdGVkICR7c2hhMjU2LnN1YnN0cmluZygwLCA3KX0sIGdvdCAke2ZpbGVTaGEuc3Vic3RyaW5nKDAsIDcpfS5gKSk7XG4gICAgfSwgNTAwMCk7XG4gIH0pO1xufVxuIiwgImltcG9ydCB7IGVudmlyb25tZW50IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgZ2V0RXJyb3JTdHJpbmcgfSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gYXMgY2FwdHVyZUV4Y2VwdGlvblJheWNhc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5cbnR5cGUgTG9nID0ge1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIGVycm9yOiBhbnk7XG59O1xuXG5jb25zdCBfZXhjZXB0aW9ucyA9IHtcbiAgbG9nczogbmV3IE1hcDxEYXRlLCBMb2c+KCksXG4gIHNldDogKG1lc3NhZ2U6IHN0cmluZywgZXJyb3I/OiBhbnkpOiB2b2lkID0+IHtcbiAgICBjYXB0dXJlZEV4Y2VwdGlvbnMubG9ncy5zZXQobmV3IERhdGUoKSwgeyBtZXNzYWdlLCBlcnJvciB9KTtcbiAgfSxcbiAgY2xlYXI6ICgpOiB2b2lkID0+IGNhcHR1cmVkRXhjZXB0aW9ucy5sb2dzLmNsZWFyKCksXG4gIHRvU3RyaW5nOiAoKTogc3RyaW5nID0+IHtcbiAgICBsZXQgc3RyID0gXCJcIjtcbiAgICBjYXB0dXJlZEV4Y2VwdGlvbnMubG9ncy5mb3JFYWNoKChsb2csIGRhdGUpID0+IHtcbiAgICAgIGlmIChzdHIubGVuZ3RoID4gMCkgc3RyICs9IFwiXFxuXFxuXCI7XG4gICAgICBzdHIgKz0gYFske2RhdGUudG9JU09TdHJpbmcoKX1dICR7bG9nLm1lc3NhZ2V9YDtcbiAgICAgIGlmIChsb2cuZXJyb3IpIHN0ciArPSBgOiAke2dldEVycm9yU3RyaW5nKGxvZy5lcnJvcil9YDtcbiAgICB9KTtcblxuICAgIHJldHVybiBzdHI7XG4gIH0sXG59O1xuXG5leHBvcnQgY29uc3QgY2FwdHVyZWRFeGNlcHRpb25zID0gT2JqZWN0LmZyZWV6ZShfZXhjZXB0aW9ucyk7XG5cbnR5cGUgQ2FwdHVyZUV4Y2VwdGlvbk9wdGlvbnMgPSB7XG4gIGNhcHR1cmVUb1JheWNhc3Q/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IGNvbnN0IGNhcHR1cmVFeGNlcHRpb24gPSAoXG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgfCBGYWxzeSB8IChzdHJpbmcgfCBGYWxzeSlbXSxcbiAgZXJyb3I6IGFueSxcbiAgb3B0aW9ucz86IENhcHR1cmVFeGNlcHRpb25PcHRpb25zXG4pID0+IHtcbiAgY29uc3QgeyBjYXB0dXJlVG9SYXljYXN0ID0gZmFsc2UgfSA9IG9wdGlvbnMgPz8ge307XG4gIGNvbnN0IGRlc2MgPSBBcnJheS5pc0FycmF5KGRlc2NyaXB0aW9uKSA/IGRlc2NyaXB0aW9uLmZpbHRlcihCb29sZWFuKS5qb2luKFwiIFwiKSA6IGRlc2NyaXB0aW9uIHx8IFwiQ2FwdHVyZWQgZXhjZXB0aW9uXCI7XG4gIGNhcHR1cmVkRXhjZXB0aW9ucy5zZXQoZGVzYywgZXJyb3IpO1xuICBpZiAoZW52aXJvbm1lbnQuaXNEZXZlbG9wbWVudCkge1xuICAgIGNvbnNvbGUuZXJyb3IoZGVzYywgZXJyb3IpO1xuICB9IGVsc2UgaWYgKGNhcHR1cmVUb1JheWNhc3QpIHtcbiAgICBjYXB0dXJlRXhjZXB0aW9uUmF5Y2FzdChlcnJvcik7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBkZWJ1Z0xvZyA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICBpZiAoIWVudmlyb25tZW50LmlzRGV2ZWxvcG1lbnQpIHJldHVybjtcbiAgY29uc29sZS5kZWJ1ZyguLi5hcmdzKTtcbn07XG4iLCAiaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBjcmVhdGVIYXNoIH0gZnJvbSBcImNyeXB0b1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZVNoYTI1NihmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGNyZWF0ZUhhc2goXCJzaGEyNTZcIikudXBkYXRlKHJlYWRGaWxlU3luYyhmaWxlUGF0aCkpLmRpZ2VzdChcImhleFwiKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIiwgImltcG9ydCB7IFNlbmRDcmVhdGVQYXlsb2FkIH0gZnJvbSBcIn4vdHlwZXMvc2VuZFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJlcGFyZVNlbmRQYXlsb2FkKHRlbXBsYXRlOiBTZW5kQ3JlYXRlUGF5bG9hZCwgdmFsdWVzOiBTZW5kQ3JlYXRlUGF5bG9hZCk6IFNlbmRDcmVhdGVQYXlsb2FkIHtcbiAgcmV0dXJuIHtcbiAgICAuLi50ZW1wbGF0ZSxcbiAgICAuLi52YWx1ZXMsXG4gICAgZmlsZTogdmFsdWVzLmZpbGUgPyB7IC4uLnRlbXBsYXRlLmZpbGUsIC4uLnZhbHVlcy5maWxlIH0gOiB0ZW1wbGF0ZS5maWxlLFxuICAgIHRleHQ6IHZhbHVlcy50ZXh0ID8geyAuLi50ZW1wbGF0ZS50ZXh0LCAuLi52YWx1ZXMudGV4dCB9IDogdGVtcGxhdGUudGV4dCxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyBDYWNoZSBhcyBSYXljYXN0Q2FjaGUgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5cbmV4cG9ydCBjb25zdCBDYWNoZSA9IG5ldyBSYXljYXN0Q2FjaGUoeyBuYW1lc3BhY2U6IFwiYnctY2FjaGVcIiB9KTtcbiIsICJleHBvcnQgY29uc3QgcGxhdGZvcm0gPSBwcm9jZXNzLnBsYXRmb3JtID09PSBcImRhcndpblwiID8gXCJtYWNvc1wiIDogXCJ3aW5kb3dzXCI7XG4iLCAiaW1wb3J0IHsgRm9ybSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcblxuZXhwb3J0IGNvbnN0IExvYWRpbmdGYWxsYmFjayA9ICgpID0+IDxGb3JtIGlzTG9hZGluZyAvPjtcbiIsICJpbXBvcnQgeyBBY3Rpb25QYW5lbCwgQWN0aW9uLCBEZXRhaWwsIGdldFByZWZlcmVuY2VWYWx1ZXMsIGVudmlyb25tZW50IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgQnVnUmVwb3J0Q29sbGVjdERhdGFBY3Rpb24sIEJ1Z1JlcG9ydE9wZW5BY3Rpb24gfSBmcm9tIFwifi9jb21wb25lbnRzL2FjdGlvbnNcIjtcbmltcG9ydCB7IEJVR19SRVBPUlRfVVJMIH0gZnJvbSBcIn4vY29tcG9uZW50cy9hY3Rpb25zL0J1Z1JlcG9ydE9wZW5BY3Rpb25cIjtcbmltcG9ydCB7IEVuc3VyZUNsaUJpbkVycm9yLCBJbnN0YWxsZWRDTElOb3RGb3VuZEVycm9yLCBnZXRFcnJvclN0cmluZyB9IGZyb20gXCJ+L3V0aWxzL2Vycm9yc1wiO1xuaW1wb3J0IHsgcGxhdGZvcm0gfSBmcm9tIFwifi91dGlscy9wbGF0Zm9ybVwiO1xuXG5jb25zdCBMSU5FX0JSRUFLID0gXCJcXG5cXG5cIjtcbmNvbnN0IENMSV9JTlNUQUxMQVRJT05fSEVMUF9VUkwgPSBcImh0dHBzOi8vYml0d2FyZGVuLmNvbS9oZWxwL2NsaS8jZG93bmxvYWQtYW5kLWluc3RhbGxcIjtcblxuY29uc3QgZ2V0Q29kZUJsb2NrID0gKGNvbnRlbnQ6IHN0cmluZykgPT4gYFxcYFxcYFxcYFxcbiR7Y29udGVudH1cXG5cXGBcXGBcXGBgO1xuXG50eXBlIE1lc3NhZ2VzID0gc3RyaW5nIHwgbnVtYmVyIHwgZmFsc2UgfCAwIHwgXCJcIiB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCB0eXBlIFRyb3VibGVzaG9vdGluZ0d1aWRlUHJvcHMgPSB7XG4gIGVycm9yPzogYW55O1xufTtcblxuY29uc3QgVHJvdWJsZXNob290aW5nR3VpZGUgPSAoeyBlcnJvciB9OiBUcm91Ymxlc2hvb3RpbmdHdWlkZVByb3BzKSA9PiB7XG4gIGNvbnN0IGVycm9yU3RyaW5nID0gZ2V0RXJyb3JTdHJpbmcoZXJyb3IpO1xuICBjb25zdCBsb2NhbENsaVBhdGggPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpLmNsaVBhdGg7XG4gIGNvbnN0IGlzQ2xpRG93bmxvYWRFcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRW5zdXJlQ2xpQmluRXJyb3I7XG4gIGNvbnN0IG5lZWRzVG9JbnN0YWxsQ2xpID0gbG9jYWxDbGlQYXRoIHx8IGVycm9yIGluc3RhbmNlb2YgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvcjtcblxuICBjb25zdCBtZXNzYWdlczogTWVzc2FnZXNbXSA9IFtdO1xuXG4gIGlmIChuZWVkc1RvSW5zdGFsbENsaSAmJiAhaXNDbGlEb3dubG9hZEVycm9yKSB7XG4gICAgbWVzc2FnZXMucHVzaChcIiMgXHUyNkEwXHVGRTBGIEJpdHdhcmRlbiBDTEkgbm90IGZvdW5kXCIpO1xuICB9IGVsc2Uge1xuICAgIG1lc3NhZ2VzLnB1c2goXCIjIFx1RDgzRFx1RENBNSBXaG9vcHMhIFNvbWV0aGluZyB3ZW50IHdyb25nXCIpO1xuICB9XG5cbiAgaWYgKGlzQ2xpRG93bmxvYWRFcnJvcikge1xuICAgIG1lc3NhZ2VzLnB1c2goXG4gICAgICBgV2UgY291bGRuJ3QgZG93bmxvYWQgdGhlIFtCaXR3YXJkZW4gQ0xJXSgke0NMSV9JTlNUQUxMQVRJT05fSEVMUF9VUkx9KSwgeW91IGNhbiBhbHdheXMgaW5zdGFsbCBpdCBvbiB5b3VyIG1hY2hpbmUuYFxuICAgICk7XG4gIH0gZWxzZSBpZiAobmVlZHNUb0luc3RhbGxDbGkpIHtcbiAgICBjb25zdCBjbGlQYXRoU3RyaW5nID0gbG9jYWxDbGlQYXRoID8gYCAoJHtsb2NhbENsaVBhdGh9KWAgOiBcIlwiO1xuICAgIG1lc3NhZ2VzLnB1c2goXG4gICAgICBgV2UgY291bGRuJ3QgZmluZCB0aGUgW0JpdHdhcmRlbiBDTEldKCR7Q0xJX0lOU1RBTExBVElPTl9IRUxQX1VSTH0pIGluc3RhbGxlZCBvbiB5b3VyIG1hY2hpbmUke2NsaVBhdGhTdHJpbmd9LmBcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIG1lc3NhZ2VzLnB1c2goYFRoZSBcXGAke2Vudmlyb25tZW50LmNvbW1hbmROYW1lfVxcYCBjb21tYW5kIGNyYXNoZWQgd2hlbiB3ZSB3ZXJlIG5vdCBleHBlY3RpbmcgaXQgdG8uYCk7XG4gIH1cblxuICBtZXNzYWdlcy5wdXNoKFxuICAgIFwiPiBQbGVhc2UgcmVhZCB0aGUgYFNldHVwYCBzZWN0aW9uIGluIHRoZSBbZXh0ZW5zaW9uJ3MgZGVzY3JpcHRpb25dKGh0dHBzOi8vd3d3LnJheWNhc3QuY29tL2pvbWlmZXBlL2JpdHdhcmRlbikgdG8gZW5zdXJlIHRoYXQgZXZlcnl0aGluZyBpcyBwcm9wZXJseSBjb25maWd1cmVkLlwiXG4gICk7XG5cbiAgbWVzc2FnZXMucHVzaChcbiAgICBgKipUcnkgcmVzdGFydGluZyB0aGUgY29tbWFuZC4gSWYgdGhlIGlzc3VlIHBlcnNpc3RzLCBjb25zaWRlciBbcmVwb3J0aW5nIGEgYnVnIG9uIEdpdEh1Yl0oJHtCVUdfUkVQT1JUX1VSTH0pIHRvIGhlbHAgdXMgZml4IGl0LioqYFxuICApO1xuXG4gIGlmIChlcnJvclN0cmluZykge1xuICAgIGNvbnN0IGlzQXJjaEVycm9yID0gL2luY29tcGF0aWJsZSBhcmNoaXRlY3R1cmUvZ2kudGVzdChlcnJvclN0cmluZyk7XG4gICAgbWVzc2FnZXMucHVzaChcbiAgICAgIFwiPiMjIFRlY2huaWNhbCBkZXRhaWxzIFx1RDgzRVx1REQxM1wiLFxuICAgICAgaXNBcmNoRXJyb3IgJiZcbiAgICAgICAgYFx1MjZBMFx1RkUwRiBXZSBzdXNwZWN0IHRoYXQgeW91ciBCaXR3YXJkZW4gQ0xJIHdhcyBpbnN0YWxsZWQgdXNpbmcgYSB2ZXJzaW9uIG9mIE5vZGVKUyB0aGF0J3MgaW5jb21wYXRpYmxlIHdpdGggeW91ciBzeXN0ZW0gYXJjaGl0ZWN0dXJlIChlLmcuIHg2NCBOb2RlSlMgb24gYSBNMS9BcHBsZSBTaWxpY29uIE1hYykuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBoYXZlIHRoZSBjb3JyZWN0IHZlcnNpb25zIG9mIHlvdXIgc29mdHdhcmUgaW5zdGFsbGVkIChlLmcuLCAke1xuICAgICAgICAgIHBsYXRmb3JtID09PSBcIm1hY29zXCIgPyBcIkhvbWVicmV3LCBcIiA6IFwiXCJcbiAgICAgICAgfU5vZGVKUywgYW5kIEJpdHdhcmRlbiBDTEkpLmAsXG4gICAgICBnZXRDb2RlQmxvY2soZXJyb3JTdHJpbmcpXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPERldGFpbFxuICAgICAgbWFya2Rvd249e21lc3NhZ2VzLmZpbHRlcihCb29sZWFuKS5qb2luKExJTkVfQlJFQUspfVxuICAgICAgYWN0aW9ucz17XG4gICAgICAgIDxBY3Rpb25QYW5lbD5cbiAgICAgICAgICA8QWN0aW9uUGFuZWwuU2VjdGlvbiB0aXRsZT1cIkJ1ZyBSZXBvcnRcIj5cbiAgICAgICAgICAgIDxCdWdSZXBvcnRPcGVuQWN0aW9uIC8+XG4gICAgICAgICAgICA8QnVnUmVwb3J0Q29sbGVjdERhdGFBY3Rpb24gLz5cbiAgICAgICAgICA8L0FjdGlvblBhbmVsLlNlY3Rpb24+XG4gICAgICAgICAge25lZWRzVG9JbnN0YWxsQ2xpICYmIChcbiAgICAgICAgICAgIDxBY3Rpb24uT3BlbkluQnJvd3NlciB0aXRsZT1cIk9wZW4gSW5zdGFsbGF0aW9uIEd1aWRlXCIgdXJsPXtDTElfSU5TVEFMTEFUSU9OX0hFTFBfVVJMfSAvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gICAgICB9XG4gICAgLz5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRyb3VibGVzaG9vdGluZ0d1aWRlO1xuIiwgImltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IHVzZVNlbGVjdGVkVmF1bHRJdGVtIH0gZnJvbSBcIn4vY29tcG9uZW50cy9zZWFyY2hWYXVsdC9jb250ZXh0L3ZhdWx0SXRlbVwiO1xuaW1wb3J0IHVzZVJlcHJvbXB0IGZyb20gXCJ+L3V0aWxzL2hvb2tzL3VzZVJlcHJvbXB0XCI7XG5cbmV4cG9ydCB0eXBlIEFjdGlvbldpdGhSZXByb21wdFByb3BzID0gT21pdDxBY3Rpb24uUHJvcHMsIFwib25BY3Rpb25cIj4gJiB7XG4gIHJlcHJvbXB0RGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIG9uQWN0aW9uOiAoKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbn07XG5cbmZ1bmN0aW9uIEFjdGlvbldpdGhSZXByb21wdChwcm9wczogQWN0aW9uV2l0aFJlcHJvbXB0UHJvcHMpIHtcbiAgY29uc3QgeyByZXByb21wdERlc2NyaXB0aW9uLCBvbkFjdGlvbiwgLi4uY29tcG9uZW50UHJvcHMgfSA9IHByb3BzO1xuICBjb25zdCB7IHJlcHJvbXB0IH0gPSB1c2VTZWxlY3RlZFZhdWx0SXRlbSgpO1xuICBjb25zdCByZXByb21wdEFuZFBlcmZvcm1BY3Rpb24gPSB1c2VSZXByb21wdChvbkFjdGlvbiwgeyBkZXNjcmlwdGlvbjogcmVwcm9tcHREZXNjcmlwdGlvbiB9KTtcblxuICByZXR1cm4gPEFjdGlvbiB7Li4uY29tcG9uZW50UHJvcHN9IG9uQWN0aW9uPXtyZXByb21wdCA/IHJlcHJvbXB0QW5kUGVyZm9ybUFjdGlvbiA6IG9uQWN0aW9ufSAvPjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQWN0aW9uV2l0aFJlcHJvbXB0O1xuIiwgImltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEl0ZW0gfSBmcm9tIFwifi90eXBlcy92YXVsdFwiO1xuXG5jb25zdCBWYXVsdEl0ZW1Db250ZXh0ID0gY3JlYXRlQ29udGV4dDxJdGVtIHwgbnVsbD4obnVsbCk7XG5cbmV4cG9ydCBjb25zdCB1c2VTZWxlY3RlZFZhdWx0SXRlbSA9ICgpID0+IHtcbiAgY29uc3Qgc2Vzc2lvbiA9IHVzZUNvbnRleHQoVmF1bHRJdGVtQ29udGV4dCk7XG4gIGlmIChzZXNzaW9uID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1c2VTZWxlY3RWYXVsdEl0ZW0gbXVzdCBiZSB1c2VkIHdpdGhpbiBhIFZhdWx0SXRlbUNvbnRleHQuUHJvdmlkZXJcIik7XG4gIH1cblxuICByZXR1cm4gc2Vzc2lvbjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFZhdWx0SXRlbUNvbnRleHQ7XG4iLCAiaW1wb3J0IHsgc2hvd1RvYXN0LCBUb2FzdCwgdXNlTmF2aWdhdGlvbiB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCBSZXByb21wdEZvcm0gZnJvbSBcIn4vY29tcG9uZW50cy9SZXByb21wdEZvcm1cIjtcbmltcG9ydCB7IHVzZVNlc3Npb24gfSBmcm9tIFwifi9jb250ZXh0L3Nlc3Npb25cIjtcblxuZXhwb3J0IHR5cGUgVXNlclJlcHJvbXB0QWN0aW9uUHJvcCA9IHsgY2xvc2VGb3JtOiAoKSA9PiB2b2lkIH07XG5leHBvcnQgdHlwZSBVc2VSZXByb21wdEFjdGlvbiA9IChwcm9wczogVXNlclJlcHJvbXB0QWN0aW9uUHJvcCkgPT4gYm9vbGVhbiB8IFByb21pc2U8Ym9vbGVhbj47XG5cbmV4cG9ydCB0eXBlIFVzZVJlcHJvbXB0T3B0aW9ucyA9IHtcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiBmb3IgYW4gQWN0aW9uIHRoYXQgd2lsbCBuYXZpZ2F0ZSB0byB0aGUge0BsaW5rIFJlcHJvbXB0Rm9ybX0uXG4gKiBUaGUgcGFzc3dvcmQgaXMgbm90IGNvbmZpcm0gaW4gdGhpcyBob29rLCBvbmx5IHBhc3NlZCBkb3duIHRvIHRoZSBhY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHVzZVJlcHJvbXB0KGFjdGlvbjogKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD4sIG9wdGlvbnM/OiBVc2VSZXByb21wdE9wdGlvbnMpIHtcbiAgY29uc3QgeyBkZXNjcmlwdGlvbiA9IFwiUGVyZm9ybWluZyBhbiBhY3Rpb24gdGhhdCByZXF1aXJlcyB0aGUgbWFzdGVyIHBhc3N3b3JkXCIgfSA9IG9wdGlvbnMgPz8ge307XG4gIGNvbnN0IHNlc3Npb24gPSB1c2VTZXNzaW9uKCk7XG4gIGNvbnN0IHsgcHVzaCwgcG9wIH0gPSB1c2VOYXZpZ2F0aW9uKCk7XG5cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ29uZmlybShwYXNzd29yZDogc3RyaW5nKSB7XG4gICAgY29uc3QgaXNQYXNzd29yZENvcnJlY3QgPSBhd2FpdCBzZXNzaW9uLmNvbmZpcm1NYXN0ZXJQYXNzd29yZChwYXNzd29yZCk7XG4gICAgaWYgKCFpc1Bhc3N3b3JkQ29ycmVjdCkge1xuICAgICAgYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLkZhaWx1cmUsIFwiRmFpbGVkIHRvIHVubG9jayB2YXVsdFwiLCBcIkNoZWNrIHlvdXIgY3JlZGVudGlhbHNcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHBvcCgpO1xuXG4gICAgLyogdXNpbmcgYSBzZXRUaW1lb3V0IGhlcmUgZml4ZXMgYSBidWcgd2hlcmUgdGhlIFJlcHJvbXB0Rm9ybSBmbGFzaGVzIHdoZW4geW91IHBvcCBiYWNrIHRvIHRoZSBwcmV2aW91cyBzY3JlZW4uIFxuICAgIFRoaXMgY29tZXMgd2l0aCB0aGUgdHJhZGUtb2ZmIG9mIGEgdGlueSB2aXNpYmxlIGRlbGF5IGJldHdlZW4gdGhlIFJlcHJvbXB0Rm9ybSBwb3AgYW5kIHRoZSBhY3Rpb24gcHVzaGluZyBhIG5ldyBzY3JlZW4gKi9cbiAgICBzZXRUaW1lb3V0KGFjdGlvbiwgMSk7XG4gIH1cblxuICByZXR1cm4gKCkgPT4gcHVzaCg8UmVwcm9tcHRGb3JtIGRlc2NyaXB0aW9uPXtkZXNjcmlwdGlvbn0gb25Db25maXJtPXtoYW5kbGVDb25maXJtfSAvPik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHVzZVJlcHJvbXB0O1xuIiwgImltcG9ydCB7IEFjdGlvbiwgQWN0aW9uUGFuZWwsIEZvcm0gfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5cbmV4cG9ydCB0eXBlIFJlcHJvbXB0Rm9ybVByb3BzID0ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBvbkNvbmZpcm06IChwYXNzd29yZDogc3RyaW5nKSA9PiB2b2lkO1xufTtcblxuY29uc3QgUmVwcm9tcHRGb3JtID0gKHByb3BzOiBSZXByb21wdEZvcm1Qcm9wcykgPT4ge1xuICBjb25zdCB7IGRlc2NyaXB0aW9uLCBvbkNvbmZpcm0gfSA9IHByb3BzO1xuXG4gIGZ1bmN0aW9uIG9uU3VibWl0KHZhbHVlczogeyBwYXNzd29yZDogc3RyaW5nIH0pIHtcbiAgICBvbkNvbmZpcm0odmFsdWVzLnBhc3N3b3JkKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEZvcm1cbiAgICAgIG5hdmlnYXRpb25UaXRsZT1cIkNvbmZpcm1hdGlvbiBSZXF1aXJlZFwiXG4gICAgICBhY3Rpb25zPXtcbiAgICAgICAgPEFjdGlvblBhbmVsPlxuICAgICAgICAgIDxBY3Rpb24uU3VibWl0Rm9ybSB0aXRsZT1cIkNvbmZpcm1cIiBvblN1Ym1pdD17b25TdWJtaXR9IC8+XG4gICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gICAgICB9XG4gICAgPlxuICAgICAgPEZvcm0uRGVzY3JpcHRpb24gdGl0bGU9XCJDb25maXJtYXRpb24gUmVxdWlyZWQgZm9yXCIgdGV4dD17ZGVzY3JpcHRpb259IC8+XG4gICAgICA8Rm9ybS5QYXNzd29yZEZpZWxkIGF1dG9Gb2N1cyBpZD1cInBhc3N3b3JkXCIgdGl0bGU9XCJNYXN0ZXIgUGFzc3dvcmRcIiAvPlxuICAgIDwvRm9ybT5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFJlcHJvbXB0Rm9ybTtcbiIsICJpbXBvcnQgeyBMb2NhbFN0b3JhZ2UsIGdldFByZWZlcmVuY2VWYWx1ZXMgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBjcmVhdGVDb250ZXh0LCBQcm9wc1dpdGhDaGlsZHJlbiwgUmVhY3ROb2RlLCB1c2VDb250ZXh0LCB1c2VNZW1vLCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBVbmxvY2tGb3JtIGZyb20gXCJ+L2NvbXBvbmVudHMvVW5sb2NrRm9ybVwiO1xuaW1wb3J0IHsgVmF1bHRMb2FkaW5nRmFsbGJhY2sgfSBmcm9tIFwifi9jb21wb25lbnRzL3NlYXJjaFZhdWx0L1ZhdWx0TG9hZGluZ0ZhbGxiYWNrXCI7XG5pbXBvcnQgeyBMT0NBTF9TVE9SQUdFX0tFWSwgVkFVTFRfTE9DS19NRVNTQUdFUyB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBWQVVMVF9USU1FT1VUIH0gZnJvbSBcIn4vY29uc3RhbnRzL3ByZWZlcmVuY2VzXCI7XG5pbXBvcnQgeyB1c2VCaXR3YXJkZW4gfSBmcm9tIFwifi9jb250ZXh0L2JpdHdhcmRlblwiO1xuaW1wb3J0IHsgdXNlU2Vzc2lvblJlZHVjZXIgfSBmcm9tIFwifi9jb250ZXh0L3Nlc3Npb24vcmVkdWNlclwiO1xuaW1wb3J0IHtcbiAgY2hlY2tTeXN0ZW1Mb2NrZWRTaW5jZUxhc3RBY2Nlc3MsXG4gIGNoZWNrU3lzdGVtU2xlcHRTaW5jZUxhc3RBY2Nlc3MsXG4gIFNlc3Npb25TdG9yYWdlLFxufSBmcm9tIFwifi9jb250ZXh0L3Nlc3Npb24vdXRpbHNcIjtcbmltcG9ydCB7IFNlc3Npb25TdGF0ZSB9IGZyb20gXCJ+L3R5cGVzL3Nlc3Npb25cIjtcbmltcG9ydCB7IENhY2hlIH0gZnJvbSBcIn4vdXRpbHMvY2FjaGVcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuaW1wb3J0IHVzZU9uY2VFZmZlY3QgZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlT25jZUVmZmVjdFwiO1xuaW1wb3J0IHsgaGFzaE1hc3RlclBhc3N3b3JkRm9yUmVwcm9tcHRpbmcgfSBmcm9tIFwifi91dGlscy9wYXNzd29yZHNcIjtcbmltcG9ydCB7IHBsYXRmb3JtIH0gZnJvbSBcIn4vdXRpbHMvcGxhdGZvcm1cIjtcblxuZXhwb3J0IHR5cGUgU2Vzc2lvbiA9IHtcbiAgYWN0aXZlOiBib29sZWFuO1xuICBjb25maXJtTWFzdGVyUGFzc3dvcmQ6IChwYXNzd29yZDogc3RyaW5nKSA9PiBQcm9taXNlPGJvb2xlYW4+O1xufSAmIFBpY2s8U2Vzc2lvblN0YXRlLCBcInRva2VuXCIgfCBcImlzTG9hZGluZ1wiIHwgXCJpc0xvY2tlZFwiIHwgXCJpc0F1dGhlbnRpY2F0ZWRcIj47XG5cbmV4cG9ydCBjb25zdCBTZXNzaW9uQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8U2Vzc2lvbiB8IG51bGw+KG51bGwpO1xuXG5leHBvcnQgdHlwZSBTZXNzaW9uUHJvdmlkZXJQcm9wcyA9IFByb3BzV2l0aENoaWxkcmVuPHtcbiAgbG9hZGluZ0ZhbGxiYWNrPzogUmVhY3ROb2RlO1xuICB1bmxvY2s/OiBib29sZWFuO1xufT47XG5cbi8qKlxuICogQ29tcG9uZW50IHdoaWNoIHByb3ZpZGVzIGEgc2Vzc2lvbiB2aWEgdGhlIHtAbGluayB1c2VTZXNzaW9ufSBob29rLlxuICogQHBhcmFtIHByb3BzLnVubG9jayBJZiB0cnVlLCBhbiB1bmxvY2sgZm9ybSB3aWxsIGJlIGRpc3BsYXllZCBpZiB0aGUgdmF1bHQgaXMgbG9ja2VkIG9yIHVuYXV0aGVudGljYXRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNlc3Npb25Qcm92aWRlcihwcm9wczogU2Vzc2lvblByb3ZpZGVyUHJvcHMpIHtcbiAgY29uc3QgeyBjaGlsZHJlbiwgbG9hZGluZ0ZhbGxiYWNrID0gPFZhdWx0TG9hZGluZ0ZhbGxiYWNrIC8+LCB1bmxvY2sgfSA9IHByb3BzO1xuXG4gIGNvbnN0IGJpdHdhcmRlbiA9IHVzZUJpdHdhcmRlbigpO1xuICBjb25zdCBbc3RhdGUsIGRpc3BhdGNoXSA9IHVzZVNlc3Npb25SZWR1Y2VyKCk7XG4gIGNvbnN0IHBlbmRpbmdBY3Rpb25SZWYgPSB1c2VSZWY8UHJvbWlzZTxhbnk+PihQcm9taXNlLnJlc29sdmUoKSk7XG5cbiAgdXNlT25jZUVmZmVjdChib290c3RyYXBTZXNzaW9uLCBiaXR3YXJkZW4pO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIGJvb3RzdHJhcFNlc3Npb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgIGJpdHdhcmRlblxuICAgICAgICAuc2V0QWN0aW9uTGlzdGVuZXIoXCJsb2NrXCIsIGhhbmRsZUxvY2spXG4gICAgICAgIC5zZXRBY3Rpb25MaXN0ZW5lcihcInVubG9ja1wiLCBoYW5kbGVVbmxvY2spXG4gICAgICAgIC5zZXRBY3Rpb25MaXN0ZW5lcihcImxvZ291dFwiLCBoYW5kbGVMb2dvdXQpO1xuXG4gICAgICBjb25zdCBbdG9rZW4sIHBhc3N3b3JkSGFzaCwgbGFzdEFjdGl2aXR5VGltZVN0cmluZywgbGFzdFZhdWx0U3RhdHVzXSA9IGF3YWl0IFNlc3Npb25TdG9yYWdlLmdldFNhdmVkU2Vzc2lvbigpO1xuICAgICAgaWYgKCF0b2tlbiB8fCAhcGFzc3dvcmRIYXNoKSB0aHJvdyBuZXcgTG9ja1ZhdWx0RXJyb3IoKTtcblxuICAgICAgZGlzcGF0Y2goeyB0eXBlOiBcImxvYWRTdGF0ZVwiLCB0b2tlbiwgcGFzc3dvcmRIYXNoIH0pO1xuICAgICAgYml0d2FyZGVuLnNldFNlc3Npb25Ub2tlbih0b2tlbik7XG5cbiAgICAgIGlmIChiaXR3YXJkZW4ud2FzQ2xpVXBkYXRlZCkgdGhyb3cgbmV3IExvZ291dFZhdWx0RXJyb3IoVkFVTFRfTE9DS19NRVNTQUdFUy5DTElfVVBEQVRFRCk7XG4gICAgICBpZiAobGFzdFZhdWx0U3RhdHVzID09PSBcImxvY2tlZFwiKSB0aHJvdyBuZXcgTG9ja1ZhdWx0RXJyb3IoKTtcbiAgICAgIGlmIChsYXN0VmF1bHRTdGF0dXMgPT09IFwidW5hdXRoZW50aWNhdGVkXCIpIHRocm93IG5ldyBMb2dvdXRWYXVsdEVycm9yKCk7XG5cbiAgICAgIGlmIChsYXN0QWN0aXZpdHlUaW1lU3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGxhc3RBY3Rpdml0eVRpbWUgPSBuZXcgRGF0ZShsYXN0QWN0aXZpdHlUaW1lU3RyaW5nKTtcblxuICAgICAgICBjb25zdCB2YXVsdFRpbWVvdXRNcyA9ICtnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpLnJlcHJvbXB0SWdub3JlRHVyYXRpb247XG4gICAgICAgIGlmIChwbGF0Zm9ybSA9PT0gXCJtYWNvc1wiICYmIHZhdWx0VGltZW91dE1zID09PSBWQVVMVF9USU1FT1VULlNZU1RFTV9MT0NLKSB7XG4gICAgICAgICAgaWYgKGF3YWl0IGNoZWNrU3lzdGVtTG9ja2VkU2luY2VMYXN0QWNjZXNzKGxhc3RBY3Rpdml0eVRpbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTG9ja1ZhdWx0RXJyb3IoVkFVTFRfTE9DS19NRVNTQUdFUy5TWVNURU1fTE9DSyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHBsYXRmb3JtID09PSBcIm1hY29zXCIgJiYgdmF1bHRUaW1lb3V0TXMgPT09IFZBVUxUX1RJTUVPVVQuU1lTVEVNX1NMRUVQKSB7XG4gICAgICAgICAgaWYgKGF3YWl0IGNoZWNrU3lzdGVtU2xlcHRTaW5jZUxhc3RBY2Nlc3MobGFzdEFjdGl2aXR5VGltZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBMb2NrVmF1bHRFcnJvcihWQVVMVF9MT0NLX01FU1NBR0VTLlNZU1RFTV9TTEVFUCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHZhdWx0VGltZW91dE1zICE9PSBWQVVMVF9USU1FT1VULk5FVkVSKSB7XG4gICAgICAgICAgY29uc3QgdGltZUVsYXBzZVNpbmNlTGFzdEFjdGl2aXR5ID0gRGF0ZS5ub3coKSAtIGxhc3RBY3Rpdml0eVRpbWUuZ2V0VGltZSgpO1xuICAgICAgICAgIGlmICh2YXVsdFRpbWVvdXRNcyA9PT0gVkFVTFRfVElNRU9VVC5JTU1FRElBVEVMWSB8fCB0aW1lRWxhcHNlU2luY2VMYXN0QWN0aXZpdHkgPj0gdmF1bHRUaW1lb3V0TXMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBMb2NrVmF1bHRFcnJvcihWQVVMVF9MT0NLX01FU1NBR0VTLlRJTUVPVVQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBkaXNwYXRjaCh7IHR5cGU6IFwiZmluaXNoTG9hZGluZ1NhdmVkU3RhdGVcIiB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgTG9ja1ZhdWx0RXJyb3IpIHtcbiAgICAgICAgcGVuZGluZ0FjdGlvblJlZi5jdXJyZW50ID0gYml0d2FyZGVuLmxvY2soeyByZWFzb246IGVycm9yLm1lc3NhZ2UsIGltbWVkaWF0ZTogdHJ1ZSwgY2hlY2tWYXVsdFN0YXR1czogdHJ1ZSB9KTtcbiAgICAgIH0gZWxzZSBpZiAoZXJyb3IgaW5zdGFuY2VvZiBMb2dvdXRWYXVsdEVycm9yKSB7XG4gICAgICAgIHBlbmRpbmdBY3Rpb25SZWYuY3VycmVudCA9IGJpdHdhcmRlbi5sb2dvdXQoeyByZWFzb246IGVycm9yLm1lc3NhZ2UsIGltbWVkaWF0ZTogdHJ1ZSB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBlbmRpbmdBY3Rpb25SZWYuY3VycmVudCA9IGJpdHdhcmRlbi5sb2NrKHsgaW1tZWRpYXRlOiB0cnVlIH0pO1xuICAgICAgICBkaXNwYXRjaCh7IHR5cGU6IFwiZmFpbExvYWRpbmdTYXZlZFN0YXRlXCIgfSk7XG4gICAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gYm9vdHN0cmFwIHNlc3Npb24gc3RhdGVcIiwgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVVubG9jayhwYXNzd29yZDogc3RyaW5nLCB0b2tlbjogc3RyaW5nKSB7XG4gICAgY29uc3QgcGFzc3dvcmRIYXNoID0gYXdhaXQgaGFzaE1hc3RlclBhc3N3b3JkRm9yUmVwcm9tcHRpbmcocGFzc3dvcmQpO1xuICAgIGF3YWl0IFNlc3Npb25TdG9yYWdlLnNhdmVTZXNzaW9uKHRva2VuLCBwYXNzd29yZEhhc2gpO1xuICAgIGF3YWl0IExvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlZBVUxUX0xPQ0tfUkVBU09OKTtcbiAgICBkaXNwYXRjaCh7IHR5cGU6IFwidW5sb2NrXCIsIHRva2VuLCBwYXNzd29yZEhhc2ggfSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVMb2NrKHJlYXNvbj86IHN0cmluZykge1xuICAgIGF3YWl0IFNlc3Npb25TdG9yYWdlLmNsZWFyU2Vzc2lvbigpO1xuICAgIGlmIChyZWFzb24pIGF3YWl0IExvY2FsU3RvcmFnZS5zZXRJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlZBVUxUX0xPQ0tfUkVBU09OLCByZWFzb24pO1xuICAgIGRpc3BhdGNoKHsgdHlwZTogXCJsb2NrXCIgfSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVMb2dvdXQocmVhc29uPzogc3RyaW5nKSB7XG4gICAgYXdhaXQgU2Vzc2lvblN0b3JhZ2UuY2xlYXJTZXNzaW9uKCk7XG4gICAgQ2FjaGUuY2xlYXIoKTtcbiAgICBpZiAocmVhc29uKSBhd2FpdCBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5WQVVMVF9MT0NLX1JFQVNPTiwgcmVhc29uKTtcbiAgICBkaXNwYXRjaCh7IHR5cGU6IFwibG9nb3V0XCIgfSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBjb25maXJtTWFzdGVyUGFzc3dvcmQocGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGVudGVyZWRQYXNzd29yZEhhc2ggPSBhd2FpdCBoYXNoTWFzdGVyUGFzc3dvcmRGb3JSZXByb21wdGluZyhwYXNzd29yZCk7XG4gICAgcmV0dXJuIGVudGVyZWRQYXNzd29yZEhhc2ggPT09IHN0YXRlLnBhc3N3b3JkSGFzaDtcbiAgfVxuXG4gIGNvbnN0IGNvbnRleHRWYWx1ZTogU2Vzc2lvbiA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKHtcbiAgICAgIHRva2VuOiBzdGF0ZS50b2tlbixcbiAgICAgIGlzTG9hZGluZzogc3RhdGUuaXNMb2FkaW5nLFxuICAgICAgaXNBdXRoZW50aWNhdGVkOiBzdGF0ZS5pc0F1dGhlbnRpY2F0ZWQsXG4gICAgICBpc0xvY2tlZDogc3RhdGUuaXNMb2NrZWQsXG4gICAgICBhY3RpdmU6ICFzdGF0ZS5pc0xvYWRpbmcgJiYgc3RhdGUuaXNBdXRoZW50aWNhdGVkICYmICFzdGF0ZS5pc0xvY2tlZCxcbiAgICAgIGNvbmZpcm1NYXN0ZXJQYXNzd29yZCxcbiAgICB9KSxcbiAgICBbc3RhdGUsIGNvbmZpcm1NYXN0ZXJQYXNzd29yZF1cbiAgKTtcblxuICBpZiAoc3RhdGUuaXNMb2FkaW5nKSByZXR1cm4gbG9hZGluZ0ZhbGxiYWNrO1xuXG4gIGNvbnN0IHNob3dVbmxvY2tGb3JtID0gc3RhdGUuaXNMb2NrZWQgfHwgIXN0YXRlLmlzQXV0aGVudGljYXRlZDtcbiAgY29uc3QgX2NoaWxkcmVuID0gc3RhdGUudG9rZW4gPyBjaGlsZHJlbiA6IG51bGw7XG5cbiAgcmV0dXJuIChcbiAgICA8U2Vzc2lvbkNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e2NvbnRleHRWYWx1ZX0+XG4gICAgICB7c2hvd1VubG9ja0Zvcm0gJiYgdW5sb2NrID8gPFVubG9ja0Zvcm0gcGVuZGluZ0FjdGlvbj17cGVuZGluZ0FjdGlvblJlZi5jdXJyZW50fSAvPiA6IF9jaGlsZHJlbn1cbiAgICA8L1Nlc3Npb25Db250ZXh0LlByb3ZpZGVyPlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlU2Vzc2lvbigpOiBTZXNzaW9uIHtcbiAgY29uc3Qgc2Vzc2lvbiA9IHVzZUNvbnRleHQoU2Vzc2lvbkNvbnRleHQpO1xuICBpZiAoc2Vzc2lvbiA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwidXNlU2Vzc2lvbiBtdXN0IGJlIHVzZWQgd2l0aGluIGEgU2Vzc2lvblByb3ZpZGVyXCIpO1xuICB9XG5cbiAgcmV0dXJuIHNlc3Npb247XG59XG5cbmNsYXNzIExvY2tWYXVsdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3Rvcihsb2NrUmVhc29uPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobG9ja1JlYXNvbik7XG4gIH1cbn1cblxuY2xhc3MgTG9nb3V0VmF1bHRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobG9ja1JlYXNvbj86IHN0cmluZykge1xuICAgIHN1cGVyKGxvY2tSZWFzb24pO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25QYW5lbCwgQ2xpcGJvYXJkLCBGb3JtLCBnZXRQcmVmZXJlbmNlVmFsdWVzLCBJY29uLCBzaG93VG9hc3QsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IERlYnVnZ2luZ0J1Z1JlcG9ydGluZ0FjdGlvblNlY3Rpb24gfSBmcm9tIFwifi9jb21wb25lbnRzL2FjdGlvbnNcIjtcbmltcG9ydCB7IExPQ0FMX1NUT1JBR0VfS0VZIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcbmltcG9ydCB7IHVzZUJpdHdhcmRlbiB9IGZyb20gXCJ+L2NvbnRleHQvYml0d2FyZGVuXCI7XG5pbXBvcnQgeyB0cmVhdEVycm9yIH0gZnJvbSBcIn4vdXRpbHMvZGVidWdcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuaW1wb3J0IHVzZVZhdWx0TWVzc2FnZXMgZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlVmF1bHRNZXNzYWdlc1wiO1xuaW1wb3J0IHsgdXNlTG9jYWxTdG9yYWdlSXRlbSB9IGZyb20gXCJ+L3V0aWxzL2xvY2Fsc3RvcmFnZVwiO1xuaW1wb3J0IHsgcGxhdGZvcm0gfSBmcm9tIFwifi91dGlscy9wbGF0Zm9ybVwiO1xuaW1wb3J0IHsgZ2V0TGFiZWxGb3JUaW1lb3V0UHJlZmVyZW5jZSB9IGZyb20gXCJ+L3V0aWxzL3ByZWZlcmVuY2VzXCI7XG5cbnR5cGUgVW5sb2NrRm9ybVByb3BzID0ge1xuICBwZW5kaW5nQWN0aW9uPzogUHJvbWlzZTx2b2lkPjtcbn07XG5cbi8qKiBGb3JtIGZvciB1bmxvY2tpbmcgb3IgbG9nZ2luZyBpbiB0byB0aGUgQml0d2FyZGVuIHZhdWx0LiAqL1xuY29uc3QgVW5sb2NrRm9ybSA9ICh7IHBlbmRpbmdBY3Rpb24gPSBQcm9taXNlLnJlc29sdmUoKSB9OiBVbmxvY2tGb3JtUHJvcHMpID0+IHtcbiAgY29uc3QgYml0d2FyZGVuID0gdXNlQml0d2FyZGVuKCk7XG4gIGNvbnN0IHsgdXNlck1lc3NhZ2UsIHNlcnZlck1lc3NhZ2UsIHNob3VsZFNob3dTZXJ2ZXIgfSA9IHVzZVZhdWx0TWVzc2FnZXMoKTtcblxuICBjb25zdCBbaXNMb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3VubG9ja0Vycm9yLCBzZXRVbmxvY2tFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCB1bmRlZmluZWQ+KHVuZGVmaW5lZCk7XG4gIGNvbnN0IFtzaG93UGFzc3dvcmQsIHNldFNob3dQYXNzd29yZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtwYXNzd29yZCwgc2V0UGFzc3dvcmRdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtsb2NrUmVhc29uLCB7IHJlbW92ZTogY2xlYXJMb2NrUmVhc29uIH1dID0gdXNlTG9jYWxTdG9yYWdlSXRlbShMT0NBTF9TVE9SQUdFX0tFWS5WQVVMVF9MT0NLX1JFQVNPTik7XG5cbiAgYXN5bmMgZnVuY3Rpb24gb25TdWJtaXQoKSB7XG4gICAgaWYgKHBhc3N3b3JkLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdG9hc3QgPSBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuQW5pbWF0ZWQsIFwiVW5sb2NraW5nIFZhdWx0Li4uXCIsIFwiUGxlYXNlIHdhaXRcIik7XG4gICAgdHJ5IHtcbiAgICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgICBzZXRVbmxvY2tFcnJvcih1bmRlZmluZWQpO1xuXG4gICAgICBhd2FpdCBwZW5kaW5nQWN0aW9uO1xuXG4gICAgICBjb25zdCB7IGVycm9yLCByZXN1bHQ6IHZhdWx0U3RhdGUgfSA9IGF3YWl0IGJpdHdhcmRlbi5zdGF0dXMoKTtcbiAgICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG5cbiAgICAgIGlmICh2YXVsdFN0YXRlLnN0YXR1cyA9PT0gXCJ1bmF1dGhlbnRpY2F0ZWRcIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IGJpdHdhcmRlbi5sb2dpbigpO1xuICAgICAgICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgZGlzcGxheWFibGVFcnJvciA9IGBQbGVhc2UgY2hlY2sgeW91ciAke3Nob3VsZFNob3dTZXJ2ZXIgPyBcIlNlcnZlciBVUkwsIFwiIDogXCJcIn1BUEkgS2V5IGFuZCBTZWNyZXQuYCxcbiAgICAgICAgICAgIHRyZWF0ZWRFcnJvcixcbiAgICAgICAgICB9ID0gZ2V0VXNlZnVsRXJyb3IoZXJyb3IsIHBhc3N3b3JkKTtcbiAgICAgICAgICBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuRmFpbHVyZSwgXCJGYWlsZWQgdG8gbG9nIGluXCIsIGRpc3BsYXlhYmxlRXJyb3IpO1xuICAgICAgICAgIHNldFVubG9ja0Vycm9yKHRyZWF0ZWRFcnJvcik7XG4gICAgICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsb2cgaW5cIiwgZXJyb3IpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhd2FpdCBiaXR3YXJkZW4udW5sb2NrKHBhc3N3b3JkKTtcbiAgICAgIGF3YWl0IGNsZWFyTG9ja1JlYXNvbigpO1xuICAgICAgYXdhaXQgdG9hc3QuaGlkZSgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCB7IGRpc3BsYXlhYmxlRXJyb3IgPSBcIlBsZWFzZSBjaGVjayB5b3VyIGNyZWRlbnRpYWxzXCIsIHRyZWF0ZWRFcnJvciB9ID0gZ2V0VXNlZnVsRXJyb3IoZXJyb3IsIHBhc3N3b3JkKTtcbiAgICAgIGF3YWl0IHNob3dUb2FzdChUb2FzdC5TdHlsZS5GYWlsdXJlLCBcIkZhaWxlZCB0byB1bmxvY2sgdmF1bHRcIiwgZGlzcGxheWFibGVFcnJvcik7XG4gICAgICBzZXRVbmxvY2tFcnJvcih0cmVhdGVkRXJyb3IpO1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byB1bmxvY2sgdmF1bHRcIiwgZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBjb3B5VW5sb2NrRXJyb3IgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCF1bmxvY2tFcnJvcikgcmV0dXJuO1xuICAgIGF3YWl0IENsaXBib2FyZC5jb3B5KHVubG9ja0Vycm9yKTtcbiAgICBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuU3VjY2VzcywgXCJFcnJvciBjb3BpZWQgdG8gY2xpcGJvYXJkXCIpO1xuICB9O1xuXG4gIGxldCBQYXNzd29yZEZpZWxkID0gRm9ybS5QYXNzd29yZEZpZWxkO1xuICBsZXQgcGFzc3dvcmRGaWVsZElkID0gXCJwYXNzd29yZFwiO1xuICBpZiAoc2hvd1Bhc3N3b3JkKSB7XG4gICAgUGFzc3dvcmRGaWVsZCA9IEZvcm0uVGV4dEZpZWxkO1xuICAgIHBhc3N3b3JkRmllbGRJZCA9IFwicGxhaW5QYXNzd29yZFwiO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Rm9ybVxuICAgICAgYWN0aW9ucz17XG4gICAgICAgIDxBY3Rpb25QYW5lbD5cbiAgICAgICAgICB7IWlzTG9hZGluZyAmJiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8QWN0aW9uLlN1Ym1pdEZvcm0gaWNvbj17SWNvbi5Mb2NrVW5sb2NrZWR9IHRpdGxlPVwiVW5sb2NrXCIgb25TdWJtaXQ9e29uU3VibWl0fSAvPlxuICAgICAgICAgICAgICA8QWN0aW9uXG4gICAgICAgICAgICAgICAgaWNvbj17c2hvd1Bhc3N3b3JkID8gSWNvbi5FeWVEaXNhYmxlZCA6IEljb24uRXllfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtzaG93UGFzc3dvcmQgPyBcIkhpZGUgUGFzc3dvcmRcIiA6IFwiU2hvdyBQYXNzd29yZFwifVxuICAgICAgICAgICAgICAgIG9uQWN0aW9uPXsoKSA9PiBzZXRTaG93UGFzc3dvcmQoKHByZXYpID0+ICFwcmV2KX1cbiAgICAgICAgICAgICAgICBzaG9ydGN1dD17eyBtYWNPUzogeyBrZXk6IFwiZVwiLCBtb2RpZmllcnM6IFtcIm9wdFwiXSB9LCB3aW5kb3dzOiB7IGtleTogXCJlXCIsIG1vZGlmaWVyczogW1wiYWx0XCJdIH0gfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG4gICAgICAgICAgeyEhdW5sb2NrRXJyb3IgJiYgKFxuICAgICAgICAgICAgPEFjdGlvblxuICAgICAgICAgICAgICBvbkFjdGlvbj17Y29weVVubG9ja0Vycm9yfVxuICAgICAgICAgICAgICB0aXRsZT1cIkNvcHkgTGFzdCBFcnJvclwiXG4gICAgICAgICAgICAgIGljb249e0ljb24uQnVnfVxuICAgICAgICAgICAgICBzdHlsZT17QWN0aW9uLlN0eWxlLkRlc3RydWN0aXZlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApfVxuICAgICAgICAgIDxEZWJ1Z2dpbmdCdWdSZXBvcnRpbmdBY3Rpb25TZWN0aW9uIC8+XG4gICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gICAgICB9XG4gICAgPlxuICAgICAge3Nob3VsZFNob3dTZXJ2ZXIgJiYgPEZvcm0uRGVzY3JpcHRpb24gdGl0bGU9XCJTZXJ2ZXIgVVJMXCIgdGV4dD17c2VydmVyTWVzc2FnZX0gLz59XG4gICAgICA8Rm9ybS5EZXNjcmlwdGlvbiB0aXRsZT1cIlZhdWx0IFN0YXR1c1wiIHRleHQ9e3VzZXJNZXNzYWdlfSAvPlxuICAgICAgPFBhc3N3b3JkRmllbGRcbiAgICAgICAgaWQ9e3Bhc3N3b3JkRmllbGRJZH1cbiAgICAgICAgdGl0bGU9XCJNYXN0ZXIgUGFzc3dvcmRcIlxuICAgICAgICB2YWx1ZT17cGFzc3dvcmR9XG4gICAgICAgIG9uQ2hhbmdlPXtzZXRQYXNzd29yZH1cbiAgICAgICAgcmVmPXsoZmllbGQpID0+IGZpZWxkPy5mb2N1cygpfVxuICAgICAgLz5cbiAgICAgIDxGb3JtLkRlc2NyaXB0aW9uXG4gICAgICAgIHRpdGxlPVwiXCJcbiAgICAgICAgdGV4dD17YFByZXNzICR7cGxhdGZvcm0gPT09IFwibWFjb3NcIiA/IFwiXHUyMzI1XCIgOiBcIkFsdFwifStFIHRvICR7c2hvd1Bhc3N3b3JkID8gXCJoaWRlXCIgOiBcInNob3dcIn0gcGFzc3dvcmRgfVxuICAgICAgLz5cbiAgICAgIHshIWxvY2tSZWFzb24gJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxGb3JtLkRlc2NyaXB0aW9uIHRpdGxlPVwiXHUyMTM5XHVGRTBGXCIgdGV4dD17bG9ja1JlYXNvbn0gLz5cbiAgICAgICAgICA8VGltZW91dEluZm9EZXNjcmlwdGlvbiAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgPC9Gb3JtPlxuICApO1xufTtcblxuZnVuY3Rpb24gVGltZW91dEluZm9EZXNjcmlwdGlvbigpIHtcbiAgY29uc3QgdmF1bHRUaW1lb3V0TXMgPSBnZXRQcmVmZXJlbmNlVmFsdWVzPEFsbFByZWZlcmVuY2VzPigpLnJlcHJvbXB0SWdub3JlRHVyYXRpb247XG4gIGNvbnN0IHRpbWVvdXRMYWJlbCA9IGdldExhYmVsRm9yVGltZW91dFByZWZlcmVuY2UodmF1bHRUaW1lb3V0TXMpO1xuXG4gIGlmICghdGltZW91dExhYmVsKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIChcbiAgICA8Rm9ybS5EZXNjcmlwdGlvblxuICAgICAgdGl0bGU9XCJcIlxuICAgICAgdGV4dD17YFRpbWVvdXQgaXMgc2V0IHRvICR7dGltZW91dExhYmVsfSwgdGhpcyBjYW4gYmUgY29uZmlndXJlZCBpbiB0aGUgZXh0ZW5zaW9uIHNldHRpbmdzYH1cbiAgICAvPlxuICApO1xufVxuXG5mdW5jdGlvbiBnZXRVc2VmdWxFcnJvcihlcnJvcjogdW5rbm93biwgcGFzc3dvcmQ6IHN0cmluZykge1xuICBjb25zdCB0cmVhdGVkRXJyb3IgPSB0cmVhdEVycm9yKGVycm9yLCB7IG9taXRTZW5zaXRpdmVWYWx1ZTogcGFzc3dvcmQgfSk7XG4gIGxldCBkaXNwbGF5YWJsZUVycm9yOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIGlmICgvSW52YWxpZCBtYXN0ZXIgcGFzc3dvcmQvaS50ZXN0KHRyZWF0ZWRFcnJvcikpIHtcbiAgICBkaXNwbGF5YWJsZUVycm9yID0gXCJJbnZhbGlkIG1hc3RlciBwYXNzd29yZFwiO1xuICB9IGVsc2UgaWYgKC9JbnZhbGlkIEFQSSBLZXkvaS50ZXN0KHRyZWF0ZWRFcnJvcikpIHtcbiAgICBkaXNwbGF5YWJsZUVycm9yID0gXCJJbnZhbGlkIENsaWVudCBJRCBvciBTZWNyZXRcIjtcbiAgfVxuICByZXR1cm4geyBkaXNwbGF5YWJsZUVycm9yLCB0cmVhdGVkRXJyb3IgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgVW5sb2NrRm9ybTtcbiIsICJpbXBvcnQgeyBBbGVydCwgY2xvc2VNYWluV2luZG93LCBjb25maXJtQWxlcnQsIEljb24sIHBvcFRvUm9vdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZUJpdHdhcmRlbiB9IGZyb20gXCJ+L2NvbnRleHQvYml0d2FyZGVuXCI7XG5pbXBvcnQgeyBWYXVsdFN0YXRlIH0gZnJvbSBcIn4vdHlwZXMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgZ2V0U2VydmVyVXJsUHJlZmVyZW5jZSB9IGZyb20gXCJ+L3V0aWxzL3ByZWZlcmVuY2VzXCI7XG5cbmZ1bmN0aW9uIHVzZVZhdWx0TWVzc2FnZXMoKSB7XG4gIGNvbnN0IGJpdHdhcmRlbiA9IHVzZUJpdHdhcmRlbigpO1xuICBjb25zdCBbdmF1bHRTdGF0ZSwgc2V0VmF1bHRTdGF0ZV0gPSB1c2VTdGF0ZTxWYXVsdFN0YXRlIHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB2b2lkIGJpdHdhcmRlblxuICAgICAgLnN0YXR1cygpXG4gICAgICAudGhlbigoeyBlcnJvciwgcmVzdWx0IH0pID0+IHtcbiAgICAgICAgaWYgKCFlcnJvcikgc2V0VmF1bHRTdGF0ZShyZXN1bHQpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIC8qIGlnbm9yZSAqL1xuICAgICAgfSk7XG4gIH0sIFtdKTtcblxuICBjb25zdCBzaG91bGRTaG93U2VydmVyID0gISFnZXRTZXJ2ZXJVcmxQcmVmZXJlbmNlKCk7XG5cbiAgbGV0IHVzZXJNZXNzYWdlID0gXCIuLi5cIjtcbiAgbGV0IHNlcnZlck1lc3NhZ2UgPSBcIi4uLlwiO1xuXG4gIGlmICh2YXVsdFN0YXRlKSB7XG4gICAgY29uc3QgeyBzdGF0dXMsIHVzZXJFbWFpbCwgc2VydmVyVXJsIH0gPSB2YXVsdFN0YXRlO1xuICAgIHVzZXJNZXNzYWdlID0gc3RhdHVzID09IFwidW5hdXRoZW50aWNhdGVkXCIgPyBcIlx1Mjc0QyBMb2dnZWQgb3V0XCIgOiBgXHVEODNEXHVERDEyIExvY2tlZCAoJHt1c2VyRW1haWx9KWA7XG4gICAgaWYgKHNlcnZlclVybCkge1xuICAgICAgc2VydmVyTWVzc2FnZSA9IHNlcnZlclVybCB8fCBcIlwiO1xuICAgIH0gZWxzZSBpZiAoKCFzZXJ2ZXJVcmwgJiYgc2hvdWxkU2hvd1NlcnZlcikgfHwgKHNlcnZlclVybCAmJiAhc2hvdWxkU2hvd1NlcnZlcikpIHtcbiAgICAgIC8vIEhvc3RlZCBzdGF0ZSBub3QgaW4gc3luYyB3aXRoIENMSSAod2UgZG9uJ3QgY2hlY2sgZm9yIGVxdWFsaXR5KVxuICAgICAgdm9pZCBjb25maXJtQWxlcnQoe1xuICAgICAgICBpY29uOiBJY29uLkV4Y2xhbWF0aW9uTWFyayxcbiAgICAgICAgdGl0bGU6IFwiUmVzdGFydCBSZXF1aXJlZFwiLFxuICAgICAgICBtZXNzYWdlOiBcIkJpdHdhcmRlbiBzZXJ2ZXIgVVJMIHByZWZlcmVuY2UgaGFzIGJlZW4gY2hhbmdlZCBzaW5jZSB0aGUgZXh0ZW5zaW9uIHdhcyBvcGVuZWQuXCIsXG4gICAgICAgIHByaW1hcnlBY3Rpb246IHtcbiAgICAgICAgICB0aXRsZTogXCJDbG9zZSBFeHRlbnNpb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgZGlzbWlzc0FjdGlvbjoge1xuICAgICAgICAgIHRpdGxlOiBcIkNsb3NlIFJheWNhc3RcIiwgLy8gT25seSBoZXJlIHRvIHByb3ZpZGUgdGhlIG5lY2Vzc2FyeSBzZWNvbmQgb3B0aW9uXG4gICAgICAgICAgc3R5bGU6IEFsZXJ0LkFjdGlvblN0eWxlLkNhbmNlbCxcbiAgICAgICAgfSxcbiAgICAgIH0pLnRoZW4oKGNsb3NlRXh0ZW5zaW9uKSA9PiB7XG4gICAgICAgIGlmIChjbG9zZUV4dGVuc2lvbikge1xuICAgICAgICAgIHZvaWQgcG9wVG9Sb290KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdm9pZCBjbG9zZU1haW5XaW5kb3coKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgdXNlck1lc3NhZ2UsIHNlcnZlck1lc3NhZ2UsIHNob3VsZFNob3dTZXJ2ZXIgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdXNlVmF1bHRNZXNzYWdlcztcbiIsICJpbXBvcnQgeyBMb2NhbFN0b3JhZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyB1c2VQcm9taXNlIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG5cbnR5cGUgTG9jYWxTdG9yYWdlSXRlbUFjdGlvbnMgPSB7XG4gIGlzTG9hZGluZzogYm9vbGVhbjtcbiAgc2V0OiAodmFsdWU6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcbiAgcmVtb3ZlOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xufTtcblxuLyoqIFJlYWQgYW5kIG1hbmFnZSBhIHNpbmdsZSBpdGVtIGluIExvY2FsU3RvcmFnZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VMb2NhbFN0b3JhZ2VJdGVtKGtleTogc3RyaW5nKTogW3N0cmluZyB8IHVuZGVmaW5lZCwgTG9jYWxTdG9yYWdlSXRlbUFjdGlvbnNdO1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUxvY2FsU3RvcmFnZUl0ZW0oa2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogc3RyaW5nKTogW3N0cmluZywgTG9jYWxTdG9yYWdlSXRlbUFjdGlvbnNdO1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUxvY2FsU3RvcmFnZUl0ZW0oa2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZT86IHN0cmluZykge1xuICBjb25zdCB7IGRhdGE6IHZhbHVlLCByZXZhbGlkYXRlLCBpc0xvYWRpbmcgfSA9IHVzZVByb21pc2UoKCkgPT4gTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihrZXkpKTtcblxuICBjb25zdCBzZXQgPSBhc3luYyAodmFsdWU6IHN0cmluZykgPT4ge1xuICAgIGF3YWl0IExvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xuICAgIGF3YWl0IHJldmFsaWRhdGUoKTtcbiAgfTtcblxuICBjb25zdCByZW1vdmUgPSBhc3luYyAoKSA9PiB7XG4gICAgYXdhaXQgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbiAgICBhd2FpdCByZXZhbGlkYXRlKCk7XG4gIH07XG5cbiAgcmV0dXJuIFt2YWx1ZSA/PyBkZWZhdWx0VmFsdWUsIHsgaXNMb2FkaW5nLCBzZXQsIHJlbW92ZSB9XSBhcyBjb25zdDtcbn1cbiIsICIvLy8gPHJlZmVyZW5jZSB0eXBlcz1cIm5vZGVcIiAvPlxuXG5leHBvcnQgeyB1c2VQcm9taXNlIH0gZnJvbSBcIi4vdXNlUHJvbWlzZVwiO1xuZXhwb3J0IHsgdXNlQ2FjaGVkU3RhdGUgfSBmcm9tIFwiLi91c2VDYWNoZWRTdGF0ZVwiO1xuZXhwb3J0IHsgdXNlQ2FjaGVkUHJvbWlzZSB9IGZyb20gXCIuL3VzZUNhY2hlZFByb21pc2VcIjtcbmV4cG9ydCB7IHVzZUZldGNoIH0gZnJvbSBcIi4vdXNlRmV0Y2hcIjtcbmV4cG9ydCB7IHVzZUV4ZWMgfSBmcm9tIFwiLi91c2VFeGVjXCI7XG5leHBvcnQgeyB1c2VTdHJlYW1KU09OIH0gZnJvbSBcIi4vdXNlU3RyZWFtSlNPTlwiO1xuZXhwb3J0IHsgdXNlU1FMIH0gZnJvbSBcIi4vdXNlU1FMXCI7XG5leHBvcnQgeyB1c2VGb3JtLCBGb3JtVmFsaWRhdGlvbiB9IGZyb20gXCIuL3VzZUZvcm1cIjtcbmV4cG9ydCB7IHVzZUFJIH0gZnJvbSBcIi4vdXNlQUlcIjtcbmV4cG9ydCB7IHVzZUZyZWNlbmN5U29ydGluZyB9IGZyb20gXCIuL3VzZUZyZWNlbmN5U29ydGluZ1wiO1xuZXhwb3J0IHsgdXNlTG9jYWxTdG9yYWdlIH0gZnJvbSBcIi4vdXNlTG9jYWxTdG9yYWdlXCI7XG5cbmV4cG9ydCB7IGdldEF2YXRhckljb24sIGdldEZhdmljb24sIGdldFByb2dyZXNzSWNvbiB9IGZyb20gXCIuL2ljb25cIjtcblxuZXhwb3J0IHsgT0F1dGhTZXJ2aWNlLCB3aXRoQWNjZXNzVG9rZW4sIGdldEFjY2Vzc1Rva2VuIH0gZnJvbSBcIi4vb2F1dGhcIjtcblxuZXhwb3J0IHsgY3JlYXRlRGVlcGxpbmssIGNyZWF0ZUV4dGVuc2lvbkRlZXBsaW5rLCBjcmVhdGVTY3JpcHRDb21tYW5kRGVlcGxpbmssIERlZXBsaW5rVHlwZSB9IGZyb20gXCIuL2NyZWF0ZURlZXBsaW5rXCI7XG5leHBvcnQgeyBleGVjdXRlU1FMIH0gZnJvbSBcIi4vZXhlY3V0ZVNRTFwiO1xuZXhwb3J0IHsgcnVuQXBwbGVTY3JpcHQgfSBmcm9tIFwiLi9ydW4tYXBwbGVzY3JpcHRcIjtcbmV4cG9ydCB7IHJ1blBvd2VyU2hlbGxTY3JpcHQgfSBmcm9tIFwiLi9ydW4tcG93ZXJzaGVsbC1zY3JpcHRcIjtcbmV4cG9ydCB7IHNob3dGYWlsdXJlVG9hc3QgfSBmcm9tIFwiLi9zaG93RmFpbHVyZVRvYXN0XCI7XG5leHBvcnQgeyB3aXRoQ2FjaGUgfSBmcm9tIFwiLi9jYWNoZVwiO1xuXG5leHBvcnQgdHlwZSB7IFByb21pc2VPcHRpb25zIH0gZnJvbSBcIi4vdXNlUHJvbWlzZVwiO1xuZXhwb3J0IHR5cGUgeyBDYWNoZWRQcm9taXNlT3B0aW9ucyB9IGZyb20gXCIuL3VzZUNhY2hlZFByb21pc2VcIjtcbmV4cG9ydCB0eXBlIHtcbiAgT0F1dGhTZXJ2aWNlT3B0aW9ucyxcbiAgT25BdXRob3JpemVQYXJhbXMsXG4gIFdpdGhBY2Nlc3NUb2tlbkNvbXBvbmVudE9yRm4sXG4gIFByb3ZpZGVyV2l0aERlZmF1bHRDbGllbnRPcHRpb25zLFxuICBQcm92aWRlck9wdGlvbnMsXG59IGZyb20gXCIuL29hdXRoXCI7XG5leHBvcnQgdHlwZSB7IEFzeW5jU3RhdGUsIE11dGF0ZVByb21pc2UgfSBmcm9tIFwiLi90eXBlc1wiO1xuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2ssIFJlZk9iamVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgZW52aXJvbm1lbnQsIExhdW5jaFR5cGUsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgdXNlRGVlcE1lbW8gfSBmcm9tIFwiLi91c2VEZWVwTWVtb1wiO1xuaW1wb3J0IHtcbiAgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlLFxuICBNdXRhdGVQcm9taXNlLFxuICBVc2VQcm9taXNlUmV0dXJuVHlwZSxcbiAgQXN5bmNTdGF0ZSxcbiAgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLFxuICBVbndyYXBSZXR1cm4sXG4gIFBhZ2luYXRpb25PcHRpb25zLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgdXNlTGF0ZXN0IH0gZnJvbSBcIi4vdXNlTGF0ZXN0XCI7XG5pbXBvcnQgeyBzaG93RmFpbHVyZVRvYXN0IH0gZnJvbSBcIi4vc2hvd0ZhaWx1cmVUb2FzdFwiO1xuXG5leHBvcnQgdHlwZSBQcm9taXNlT3B0aW9uczxUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlIHwgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlPiA9IHtcbiAgLyoqXG4gICAqIEEgcmVmZXJlbmNlIHRvIGFuIGBBYm9ydENvbnRyb2xsZXJgIHRvIGNhbmNlbCBhIHByZXZpb3VzIGNhbGwgd2hlbiB0cmlnZ2VyaW5nIGEgbmV3IG9uZVxuICAgKi9cbiAgYWJvcnRhYmxlPzogUmVmT2JqZWN0PEFib3J0Q29udHJvbGxlciB8IG51bGwgfCB1bmRlZmluZWQ+O1xuICAvKipcbiAgICogV2hldGhlciB0byBhY3R1YWxseSBleGVjdXRlIHRoZSBmdW5jdGlvbiBvciBub3QuXG4gICAqIFRoaXMgaXMgdXNlZnVsIGZvciBjYXNlcyB3aGVyZSBvbmUgb2YgdGhlIGZ1bmN0aW9uJ3MgYXJndW1lbnRzIGRlcGVuZHMgb24gc29tZXRoaW5nIHRoYXRcbiAgICogbWlnaHQgbm90IGJlIGF2YWlsYWJsZSByaWdodCBhd2F5IChmb3IgZXhhbXBsZSwgZGVwZW5kcyBvbiBzb21lIHVzZXIgaW5wdXRzKS4gQmVjYXVzZSBSZWFjdCByZXF1aXJlc1xuICAgKiBldmVyeSBob29rcyB0byBiZSBkZWZpbmVkIG9uIHRoZSByZW5kZXIsIHRoaXMgZmxhZyBlbmFibGVzIHlvdSB0byBkZWZpbmUgdGhlIGhvb2sgcmlnaHQgYXdheSBidXRcbiAgICogd2FpdCB1dGlsIHlvdSBoYXZlIGFsbCB0aGUgYXJndW1lbnRzIHJlYWR5IHRvIGV4ZWN1dGUgdGhlIGZ1bmN0aW9uLlxuICAgKi9cbiAgZXhlY3V0ZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBPcHRpb25zIGZvciB0aGUgZ2VuZXJpYyBmYWlsdXJlIHRvYXN0LlxuICAgKiBJdCBhbGxvd3MgeW91IHRvIGN1c3RvbWl6ZSB0aGUgdGl0bGUsIG1lc3NhZ2UsIGFuZCBwcmltYXJ5IGFjdGlvbiBvZiB0aGUgZmFpbHVyZSB0b2FzdC5cbiAgICovXG4gIGZhaWx1cmVUb2FzdE9wdGlvbnM/OiBQYXJ0aWFsPFBpY2s8VG9hc3QuT3B0aW9ucywgXCJ0aXRsZVwiIHwgXCJwcmltYXJ5QWN0aW9uXCIgfCBcIm1lc3NhZ2VcIj4+O1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYW4gZXhlY3V0aW9uIGZhaWxzLiBCeSBkZWZhdWx0IGl0IHdpbGwgbG9nIHRoZSBlcnJvciBhbmQgc2hvd1xuICAgKiBhIGdlbmVyaWMgZmFpbHVyZSB0b2FzdC5cbiAgICovXG4gIG9uRXJyb3I/OiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGFuIGV4ZWN1dGlvbiBzdWNjZWVkcy5cbiAgICovXG4gIG9uRGF0YT86IChkYXRhOiBVbndyYXBSZXR1cm48VD4sIHBhZ2luYXRpb24/OiBQYWdpbmF0aW9uT3B0aW9uczxVbndyYXBSZXR1cm48VD4+KSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGFuIGV4ZWN1dGlvbiB3aWxsIHN0YXJ0XG4gICAqL1xuICBvbldpbGxFeGVjdXRlPzogKHBhcmFtZXRlcnM6IFBhcmFtZXRlcnM8VD4pID0+IHZvaWQ7XG59O1xuXG4vKipcbiAqIFdyYXBzIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvbiBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgaW4gYW5vdGhlciBmdW5jdGlvbiwgYW5kIHJldHVybnMgdGhlIHtAbGluayBBc3luY1N0YXRlfSBjb3JyZXNwb25kaW5nIHRvIHRoZSBleGVjdXRpb24gb2YgdGhlIGZ1bmN0aW9uLlxuICpcbiAqIEByZW1hcmsgVGhpcyBvdmVybG9hZCBzaG91bGQgYmUgdXNlZCB3aGVuIHdvcmtpbmcgd2l0aCBwYWdpbmF0ZWQgZGF0YSBzb3VyY2VzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBcbiAqIGltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tIFwibm9kZTp0aW1lcnMvcHJvbWlzZXNcIjtcbiAqIGltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG4gKiBpbXBvcnQgeyBMaXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgdXNlUHJvbWlzZSB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IFtzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICpcbiAqICAgY29uc3QgeyBpc0xvYWRpbmcsIGRhdGEsIHBhZ2luYXRpb24gfSA9IHVzZVByb21pc2UoXG4gKiAgICAgKHNlYXJjaFRleHQ6IHN0cmluZykgPT4gYXN5bmMgKG9wdGlvbnM6IHsgcGFnZTogbnVtYmVyIH0pID0+IHtcbiAqICAgICAgIGF3YWl0IHNldFRpbWVvdXQoMjAwKTtcbiAqICAgICAgIGNvbnN0IG5ld0RhdGEgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAyNSB9LCAoX3YsIGluZGV4KSA9PiAoe1xuICogICAgICAgICBpbmRleCxcbiAqICAgICAgICAgcGFnZTogb3B0aW9ucy5wYWdlLFxuICogICAgICAgICB0ZXh0OiBzZWFyY2hUZXh0LFxuICogICAgICAgfSkpO1xuICogICAgICAgcmV0dXJuIHsgZGF0YTogbmV3RGF0YSwgaGFzTW9yZTogb3B0aW9ucy5wYWdlIDwgMTAgfTtcbiAqICAgICB9LFxuICogICAgIFtzZWFyY2hUZXh0XVxuICogICApO1xuICpcbiAqICAgcmV0dXJuIChcbiAqICAgICA8TGlzdCBpc0xvYWRpbmc9e2lzTG9hZGluZ30gb25TZWFyY2hUZXh0Q2hhbmdlPXtzZXRTZWFyY2hUZXh0fSBwYWdpbmF0aW9uPXtwYWdpbmF0aW9ufT5cbiAqICAgICAgIHtkYXRhPy5tYXAoKGl0ZW0pID0+IChcbiAqICAgICAgICAgPExpc3QuSXRlbVxuICogICAgICAgICAgIGtleT17YCR7aXRlbS5wYWdlfSAke2l0ZW0uaW5kZXh9ICR7aXRlbS50ZXh0fWB9XG4gKiAgICAgICAgICAgdGl0bGU9e2BQYWdlICR7aXRlbS5wYWdlfSBJdGVtICR7aXRlbS5pbmRleH1gfVxuICogICAgICAgICAgIHN1YnRpdGxlPXtpdGVtLnRleHR9XG4gKiAgICAgICAgIC8+XG4gKiAgICAgICApKX1cbiAqICAgICA8L0xpc3Q+XG4gKiAgICk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VQcm9taXNlPFQgZXh0ZW5kcyBGdW5jdGlvblJldHVybmluZ1BhZ2luYXRlZFByb21pc2U8W10+PihcbiAgZm46IFQsXG4pOiBVc2VQcm9taXNlUmV0dXJuVHlwZTxVbndyYXBSZXR1cm48VD4+O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb21pc2U8VCBleHRlbmRzIEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZT4oXG4gIGZuOiBULFxuICBhcmdzOiBQYXJhbWV0ZXJzPFQ+LFxuICBvcHRpb25zPzogUHJvbWlzZU9wdGlvbnM8VD4sXG4pOiBVc2VQcm9taXNlUmV0dXJuVHlwZTxVbndyYXBSZXR1cm48VD4+O1xuXG4vKipcbiAqIFdyYXBzIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvbiBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgYW5kIHJldHVybnMgdGhlIHtAbGluayBBc3luY1N0YXRlfSBjb3JyZXNwb25kaW5nIHRvIHRoZSBleGVjdXRpb24gb2YgdGhlIGZ1bmN0aW9uLlxuICpcbiAqIEByZW1hcmsgVGhlIGZ1bmN0aW9uIGlzIGFzc3VtZWQgdG8gYmUgY29uc3RhbnQgKGVnLiBjaGFuZ2luZyBpdCB3b24ndCB0cmlnZ2VyIGEgcmV2YWxpZGF0aW9uKS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyB1c2VQcm9taXNlIH0gZnJvbSAnQHJheWNhc3QvdXRpbHMnO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IGFib3J0YWJsZSA9IHVzZVJlZjxBYm9ydENvbnRyb2xsZXI+KCk7XG4gKiAgIGNvbnN0IHsgaXNMb2FkaW5nLCBkYXRhLCByZXZhbGlkYXRlIH0gPSB1c2VQcm9taXNlKGFzeW5jICh1cmw6IHN0cmluZykgPT4ge1xuICogICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7IHNpZ25hbDogYWJvcnRhYmxlLmN1cnJlbnQ/LnNpZ25hbCB9KTtcbiAqICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gKiAgICAgcmV0dXJuIHJlc3VsdFxuICogICB9LFxuICogICBbJ2h0dHBzOi8vYXBpLmV4YW1wbGUnXSxcbiAqICAge1xuICogICAgIGFib3J0YWJsZVxuICogICB9KTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPERldGFpbFxuICogICAgICAgaXNMb2FkaW5nPXtpc0xvYWRpbmd9XG4gKiAgICAgICBtYXJrZG93bj17ZGF0YX1cbiAqICAgICAgIGFjdGlvbnM9e1xuICogICAgICAgICA8QWN0aW9uUGFuZWw+XG4gKiAgICAgICAgICAgPEFjdGlvbiB0aXRsZT1cIlJlbG9hZFwiIG9uQWN0aW9uPXsoKSA9PiByZXZhbGlkYXRlKCl9IC8+XG4gKiAgICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gKiAgICAgICB9XG4gKiAgICAgLz5cbiAqICAgKTtcbiAqIH07XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb21pc2U8VCBleHRlbmRzIEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZTxbXT4+KGZuOiBUKTogVXNlUHJvbWlzZVJldHVyblR5cGU8VW53cmFwUmV0dXJuPFQ+PjtcbmV4cG9ydCBmdW5jdGlvbiB1c2VQcm9taXNlPFQgZXh0ZW5kcyBGdW5jdGlvblJldHVybmluZ1Byb21pc2U+KFxuICBmbjogVCxcbiAgYXJnczogUGFyYW1ldGVyczxUPixcbiAgb3B0aW9ucz86IFByb21pc2VPcHRpb25zPFQ+LFxuKTogVXNlUHJvbWlzZVJldHVyblR5cGU8VW53cmFwUmV0dXJuPFQ+PjtcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb21pc2U8VCBleHRlbmRzIEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZSB8IEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZT4oXG4gIGZuOiBULFxuICBhcmdzPzogUGFyYW1ldGVyczxUPixcbiAgb3B0aW9ucz86IFByb21pc2VPcHRpb25zPFQ+LFxuKTogVXNlUHJvbWlzZVJldHVyblR5cGU8YW55PiB7XG4gIGNvbnN0IGxhc3RDYWxsSWQgPSB1c2VSZWYoMCk7XG4gIGNvbnN0IFtzdGF0ZSwgc2V0XSA9IHVzZVN0YXRlPEFzeW5jU3RhdGU8VW53cmFwUmV0dXJuPFQ+Pj4oeyBpc0xvYWRpbmc6IHRydWUgfSk7XG5cbiAgY29uc3QgZm5SZWYgPSB1c2VMYXRlc3QoZm4pO1xuICBjb25zdCBsYXRlc3RBYm9ydGFibGUgPSB1c2VMYXRlc3Qob3B0aW9ucz8uYWJvcnRhYmxlKTtcbiAgY29uc3QgbGF0ZXN0QXJncyA9IHVzZUxhdGVzdChhcmdzIHx8IFtdKTtcbiAgY29uc3QgbGF0ZXN0T25FcnJvciA9IHVzZUxhdGVzdChvcHRpb25zPy5vbkVycm9yKTtcbiAgY29uc3QgbGF0ZXN0T25EYXRhID0gdXNlTGF0ZXN0KG9wdGlvbnM/Lm9uRGF0YSk7XG4gIGNvbnN0IGxhdGVzdE9uV2lsbEV4ZWN1dGUgPSB1c2VMYXRlc3Qob3B0aW9ucz8ub25XaWxsRXhlY3V0ZSk7XG4gIGNvbnN0IGxhdGVzdEZhaWx1cmVUb2FzdCA9IHVzZUxhdGVzdChvcHRpb25zPy5mYWlsdXJlVG9hc3RPcHRpb25zKTtcbiAgY29uc3QgbGF0ZXN0VmFsdWUgPSB1c2VMYXRlc3Qoc3RhdGUuZGF0YSk7XG4gIGNvbnN0IGxhdGVzdENhbGxiYWNrID0gdXNlUmVmPCguLi5hcmdzOiBQYXJhbWV0ZXJzPFQ+KSA9PiBQcm9taXNlPFVud3JhcFJldHVybjxUPj4+KG51bGwpO1xuXG4gIGNvbnN0IHBhZ2luYXRpb25BcmdzUmVmID0gdXNlUmVmPFBhZ2luYXRpb25PcHRpb25zPih7IHBhZ2U6IDAgfSk7XG4gIGNvbnN0IHVzZVBhZ2luYXRpb25SZWYgPSB1c2VSZWYoZmFsc2UpO1xuICBjb25zdCBoYXNNb3JlUmVmID0gdXNlUmVmKHRydWUpO1xuICBjb25zdCBwYWdlU2l6ZVJlZiA9IHVzZVJlZig1MCk7XG5cbiAgY29uc3QgYWJvcnQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGxhdGVzdEFib3J0YWJsZS5jdXJyZW50KSB7XG4gICAgICBsYXRlc3RBYm9ydGFibGUuY3VycmVudC5jdXJyZW50Py5hYm9ydCgpO1xuICAgICAgbGF0ZXN0QWJvcnRhYmxlLmN1cnJlbnQuY3VycmVudCA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuICsrbGFzdENhbGxJZC5jdXJyZW50O1xuICB9LCBbbGF0ZXN0QWJvcnRhYmxlXSk7XG5cbiAgY29uc3QgY2FsbGJhY2sgPSB1c2VDYWxsYmFjayhcbiAgICAoLi4uYXJnczogUGFyYW1ldGVyczxUPik6IFByb21pc2U8VW53cmFwUmV0dXJuPFQ+PiA9PiB7XG4gICAgICBjb25zdCBjYWxsSWQgPSBhYm9ydCgpO1xuXG4gICAgICBsYXRlc3RPbldpbGxFeGVjdXRlLmN1cnJlbnQ/LihhcmdzKTtcblxuICAgICAgc2V0KChwcmV2U3RhdGUpID0+ICh7IC4uLnByZXZTdGF0ZSwgaXNMb2FkaW5nOiB0cnVlIH0pKTtcblxuICAgICAgY29uc3QgcHJvbWlzZU9yUGFnaW5hdGVkUHJvbWlzZSA9IGJpbmRQcm9taXNlSWZOZWVkZWQoZm5SZWYuY3VycmVudCkoLi4uYXJncyk7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiBhbnkpIHtcbiAgICAgICAgaWYgKGVycm9yLm5hbWUgPT0gXCJBYm9ydEVycm9yXCIpIHtcbiAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbElkID09PSBsYXN0Q2FsbElkLmN1cnJlbnQpIHtcbiAgICAgICAgICAvLyBoYW5kbGUgZXJyb3JzXG4gICAgICAgICAgaWYgKGxhdGVzdE9uRXJyb3IuY3VycmVudCkge1xuICAgICAgICAgICAgbGF0ZXN0T25FcnJvci5jdXJyZW50KGVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGVudmlyb25tZW50LmxhdW5jaFR5cGUgIT09IExhdW5jaFR5cGUuQmFja2dyb3VuZCkge1xuICAgICAgICAgICAgICBzaG93RmFpbHVyZVRvYXN0KGVycm9yLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IFwiRmFpbGVkIHRvIGZldGNoIGxhdGVzdCBkYXRhXCIsXG4gICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbjoge1xuICAgICAgICAgICAgICAgICAgdGl0bGU6IFwiUmV0cnlcIixcbiAgICAgICAgICAgICAgICAgIG9uQWN0aW9uKHRvYXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRvYXN0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbGF0ZXN0Q2FsbGJhY2suY3VycmVudD8uKC4uLigobGF0ZXN0QXJncy5jdXJyZW50IHx8IFtdKSBhcyBQYXJhbWV0ZXJzPFQ+KSk7XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLi4ubGF0ZXN0RmFpbHVyZVRvYXN0LmN1cnJlbnQsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBzZXQoeyBlcnJvciwgaXNMb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBwcm9taXNlT3JQYWdpbmF0ZWRQcm9taXNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdXNlUGFnaW5hdGlvblJlZi5jdXJyZW50ID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHByb21pc2VPclBhZ2luYXRlZFByb21pc2UocGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudCkudGhlbihcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRvbyBjb21wbGljYXRlZCBmb3IgVFNcbiAgICAgICAgICAoeyBkYXRhLCBoYXNNb3JlLCBjdXJzb3IgfTogeyBkYXRhOiBVbndyYXBSZXR1cm48VD47IGhhc01vcmU6IGJvb2xlYW47IGN1cnNvcj86IGFueSB9KSA9PiB7XG4gICAgICAgICAgICBpZiAoY2FsbElkID09PSBsYXN0Q2FsbElkLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgaWYgKHBhZ2luYXRpb25BcmdzUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50LmN1cnNvciA9IGN1cnNvcjtcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50Lmxhc3RJdGVtID0gZGF0YT8uW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAobGF0ZXN0T25EYXRhLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBsYXRlc3RPbkRhdGEuY3VycmVudChkYXRhLCBwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChoYXNNb3JlKSB7XG4gICAgICAgICAgICAgICAgcGFnZVNpemVSZWYuY3VycmVudCA9IGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGhhc01vcmVSZWYuY3VycmVudCA9IGhhc01vcmU7XG5cbiAgICAgICAgICAgICAgc2V0KChwcmV2aW91c0RhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudC5wYWdlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4geyBkYXRhLCBpc0xvYWRpbmc6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igd2Uga25vdyBpdCdzIGFuIGFycmF5IGhlcmVcbiAgICAgICAgICAgICAgICByZXR1cm4geyBkYXRhOiAocHJldmlvdXNEYXRhLmRhdGEgfHwgW10pPy5jb25jYXQoZGF0YSksIGlzTG9hZGluZzogZmFsc2UgfTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgKGVycm9yOiB1bmtub3duKSA9PiB7XG4gICAgICAgICAgICBoYXNNb3JlUmVmLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICAgICAgfSxcbiAgICAgICAgKSBhcyBQcm9taXNlPFVud3JhcFJldHVybjxUPj47XG4gICAgICB9XG5cbiAgICAgIHVzZVBhZ2luYXRpb25SZWYuY3VycmVudCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHByb21pc2VPclBhZ2luYXRlZFByb21pc2UudGhlbigoZGF0YTogVW53cmFwUmV0dXJuPFQ+KSA9PiB7XG4gICAgICAgIGlmIChjYWxsSWQgPT09IGxhc3RDYWxsSWQuY3VycmVudCkge1xuICAgICAgICAgIGlmIChsYXRlc3RPbkRhdGEuY3VycmVudCkge1xuICAgICAgICAgICAgbGF0ZXN0T25EYXRhLmN1cnJlbnQoZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNldCh7IGRhdGEsIGlzTG9hZGluZzogZmFsc2UgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgIH0sIGhhbmRsZUVycm9yKSBhcyBQcm9taXNlPFVud3JhcFJldHVybjxUPj47XG4gICAgfSxcbiAgICBbXG4gICAgICBsYXRlc3RPbkRhdGEsXG4gICAgICBsYXRlc3RPbkVycm9yLFxuICAgICAgbGF0ZXN0QXJncyxcbiAgICAgIGZuUmVmLFxuICAgICAgc2V0LFxuICAgICAgbGF0ZXN0Q2FsbGJhY2ssXG4gICAgICBsYXRlc3RPbldpbGxFeGVjdXRlLFxuICAgICAgcGFnaW5hdGlvbkFyZ3NSZWYsXG4gICAgICBsYXRlc3RGYWlsdXJlVG9hc3QsXG4gICAgICBhYm9ydCxcbiAgICBdLFxuICApO1xuXG4gIGxhdGVzdENhbGxiYWNrLmN1cnJlbnQgPSBjYWxsYmFjaztcblxuICBjb25zdCByZXZhbGlkYXRlID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIC8vIHJlc2V0IHRoZSBwYWdpbmF0aW9uXG4gICAgcGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudCA9IHsgcGFnZTogMCB9O1xuXG4gICAgY29uc3QgYXJncyA9IChsYXRlc3RBcmdzLmN1cnJlbnQgfHwgW10pIGFzIFBhcmFtZXRlcnM8VD47XG4gICAgcmV0dXJuIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICB9LCBbY2FsbGJhY2ssIGxhdGVzdEFyZ3NdKTtcblxuICBjb25zdCBtdXRhdGUgPSB1c2VDYWxsYmFjazxNdXRhdGVQcm9taXNlPEF3YWl0ZWQ8UmV0dXJuVHlwZTxUPj4sIHVuZGVmaW5lZD4+KFxuICAgIGFzeW5jIChhc3luY1VwZGF0ZSwgb3B0aW9ucykgPT4ge1xuICAgICAgbGV0IGRhdGFCZWZvcmVPcHRpbWlzdGljVXBkYXRlOiBBd2FpdGVkPFJldHVyblR5cGU8VD4+IHwgdW5kZWZpbmVkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKG9wdGlvbnM/Lm9wdGltaXN0aWNVcGRhdGUpIHtcbiAgICAgICAgICAvLyBjYW5jZWwgdGhlIGluLWZsaWdodCByZXF1ZXN0IHRvIG1ha2Ugc3VyZSBpdCB3b24ndCBvdmVyd3JpdGUgdGhlIG9wdGltaXN0aWMgdXBkYXRlXG4gICAgICAgICAgYWJvcnQoKTtcblxuICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yICE9PSBcImZ1bmN0aW9uXCIgJiYgb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgLy8ga2VlcCB0cmFjayBvZiB0aGUgZGF0YSBiZWZvcmUgdGhlIG9wdGltaXN0aWMgdXBkYXRlLFxuICAgICAgICAgICAgLy8gYnV0IG9ubHkgaWYgd2UgbmVlZCBpdCAoZWcuIG9ubHkgd2hlbiB3ZSB3YW50IHRvIGF1dG9tYXRpY2FsbHkgcm9sbGJhY2sgYWZ0ZXIpXG4gICAgICAgICAgICBkYXRhQmVmb3JlT3B0aW1pc3RpY1VwZGF0ZSA9IHN0cnVjdHVyZWRDbG9uZShsYXRlc3RWYWx1ZS5jdXJyZW50Py52YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IG9wdGlvbnMub3B0aW1pc3RpY1VwZGF0ZTtcbiAgICAgICAgICBzZXQoKHByZXZTdGF0ZSkgPT4gKHsgLi4ucHJldlN0YXRlLCBkYXRhOiB1cGRhdGUocHJldlN0YXRlLmRhdGEpIH0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXdhaXQgYXN5bmNVcGRhdGU7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zPy5yb2xsYmFja09uRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IG9wdGlvbnMucm9sbGJhY2tPbkVycm9yO1xuICAgICAgICAgIHNldCgocHJldlN0YXRlKSA9PiAoeyAuLi5wcmV2U3RhdGUsIGRhdGE6IHVwZGF0ZShwcmV2U3RhdGUuZGF0YSkgfSkpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnM/Lm9wdGltaXN0aWNVcGRhdGUgJiYgb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yICE9PSBmYWxzZSkge1xuICAgICAgICAgIHNldCgocHJldlN0YXRlKSA9PiAoeyAuLi5wcmV2U3RhdGUsIGRhdGE6IGRhdGFCZWZvcmVPcHRpbWlzdGljVXBkYXRlIH0pKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAob3B0aW9ucz8uc2hvdWxkUmV2YWxpZGF0ZUFmdGVyICE9PSBmYWxzZSkge1xuICAgICAgICAgIGlmIChlbnZpcm9ubWVudC5sYXVuY2hUeXBlID09PSBMYXVuY2hUeXBlLkJhY2tncm91bmQgfHwgZW52aXJvbm1lbnQuY29tbWFuZE1vZGUgPT09IFwibWVudS1iYXJcIikge1xuICAgICAgICAgICAgLy8gd2hlbiBpbiB0aGUgYmFja2dyb3VuZCBvciBpbiBhIG1lbnUgYmFyLCB3ZSBhcmUgZ29pbmcgdG8gYXdhaXQgdGhlIHJldmFsaWRhdGlvblxuICAgICAgICAgICAgLy8gdG8gbWFrZSBzdXJlIHdlIGdldCB0aGUgcmlnaHQgZGF0YSBhdCB0aGUgZW5kIG9mIHRoZSBtdXRhdGlvblxuICAgICAgICAgICAgYXdhaXQgcmV2YWxpZGF0ZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXZhbGlkYXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBbcmV2YWxpZGF0ZSwgbGF0ZXN0VmFsdWUsIHNldCwgYWJvcnRdLFxuICApO1xuXG4gIGNvbnN0IG9uTG9hZE1vcmUgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgcGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudC5wYWdlICs9IDE7XG4gICAgY29uc3QgYXJncyA9IChsYXRlc3RBcmdzLmN1cnJlbnQgfHwgW10pIGFzIFBhcmFtZXRlcnM8VD47XG4gICAgY2FsbGJhY2soLi4uYXJncyk7XG4gIH0sIFtwYWdpbmF0aW9uQXJnc1JlZiwgbGF0ZXN0QXJncywgY2FsbGJhY2tdKTtcblxuICAvLyByZXZhbGlkYXRlIHdoZW4gdGhlIGFyZ3MgY2hhbmdlXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLy8gcmVzZXQgdGhlIHBhZ2luYXRpb25cbiAgICBwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50ID0geyBwYWdlOiAwIH07XG5cbiAgICBpZiAob3B0aW9ucz8uZXhlY3V0ZSAhPT0gZmFsc2UpIHtcbiAgICAgIGNhbGxiYWNrKC4uLigoYXJncyB8fCBbXSkgYXMgUGFyYW1ldGVyczxUPikpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjYW5jZWwgdGhlIHByZXZpb3VzIHJlcXVlc3QgaWYgd2UgZG9uJ3Qgd2FudCB0byBleGVjdXRlIGFueW1vcmVcbiAgICAgIGFib3J0KCk7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3VzZURlZXBNZW1vKFthcmdzLCBvcHRpb25zPy5leGVjdXRlLCBjYWxsYmFja10pLCBsYXRlc3RBYm9ydGFibGUsIHBhZ2luYXRpb25BcmdzUmVmXSk7XG5cbiAgLy8gYWJvcnQgcmVxdWVzdCB3aGVuIHVubW91bnRpbmdcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgYWJvcnQoKTtcbiAgICB9O1xuICB9LCBbYWJvcnRdKTtcblxuICAvLyB3ZSBvbmx5IHdhbnQgdG8gc2hvdyB0aGUgbG9hZGluZyBpbmRpY2F0b3IgaWYgdGhlIHByb21pc2UgaXMgZXhlY3V0aW5nXG4gIGNvbnN0IGlzTG9hZGluZyA9IG9wdGlvbnM/LmV4ZWN1dGUgIT09IGZhbHNlID8gc3RhdGUuaXNMb2FkaW5nIDogZmFsc2U7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBsb2FkaW5nIGlzIGhhcyBzb21lIGZpeGVkIHZhbHVlIGluIHRoZSBlbnVtIHdoaWNoXG4gIGNvbnN0IHN0YXRlV2l0aExvYWRpbmdGaXhlZDogQXN5bmNTdGF0ZTxBd2FpdGVkPFJldHVyblR5cGU8VD4+PiA9IHsgLi4uc3RhdGUsIGlzTG9hZGluZyB9O1xuXG4gIGNvbnN0IHBhZ2luYXRpb24gPSB1c2VQYWdpbmF0aW9uUmVmLmN1cnJlbnRcbiAgICA/IHtcbiAgICAgICAgcGFnZVNpemU6IHBhZ2VTaXplUmVmLmN1cnJlbnQsXG4gICAgICAgIGhhc01vcmU6IGhhc01vcmVSZWYuY3VycmVudCxcbiAgICAgICAgb25Mb2FkTW9yZSxcbiAgICAgIH1cbiAgICA6IHVuZGVmaW5lZDtcblxuICByZXR1cm4geyAuLi5zdGF0ZVdpdGhMb2FkaW5nRml4ZWQsIHJldmFsaWRhdGUsIG11dGF0ZSwgcGFnaW5hdGlvbiB9O1xufVxuXG4vKiogQmluZCB0aGUgZm4gaWYgaXQncyBhIFByb21pc2UgbWV0aG9kICovXG5mdW5jdGlvbiBiaW5kUHJvbWlzZUlmTmVlZGVkPFQ+KGZuOiBUKTogVCB7XG4gIGlmIChmbiA9PT0gKFByb21pc2UuYWxsIGFzIGFueSkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoaXMgaXMgZmluZVxuICAgIHJldHVybiBmbi5iaW5kKFByb21pc2UpO1xuICB9XG4gIGlmIChmbiA9PT0gKFByb21pc2UucmFjZSBhcyBhbnkpKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0aGlzIGlzIGZpbmVcbiAgICByZXR1cm4gZm4uYmluZChQcm9taXNlKTtcbiAgfVxuICBpZiAoZm4gPT09IChQcm9taXNlLnJlc29sdmUgYXMgYW55KSkge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdGhpcyBpcyBmaW5lXG4gICAgcmV0dXJuIGZuLmJpbmQoUHJvbWlzZSBhcyBhbnkpO1xuICB9XG4gIGlmIChmbiA9PT0gKFByb21pc2UucmVqZWN0IGFzIGFueSkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoaXMgaXMgZmluZVxuICAgIHJldHVybiBmbi5iaW5kKFByb21pc2UpO1xuICB9XG4gIHJldHVybiBmbjtcbn1cbiIsICJpbXBvcnQgeyB1c2VSZWYsIHVzZU1lbW8gfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGRlcXVhbCB9IGZyb20gXCJkZXF1YWwvbGl0ZVwiO1xuXG4vKipcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgdmFsdWUgdG8gYmUgbWVtb2l6ZWQgKHVzdWFsbHkgYSBkZXBlbmRlbmN5IGxpc3QpXG4gKiBAcmV0dXJucyBhIG1lbW9pemVkIHZlcnNpb24gb2YgdGhlIHZhbHVlIGFzIGxvbmcgYXMgaXQgcmVtYWlucyBkZWVwbHkgZXF1YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZURlZXBNZW1vPFQ+KHZhbHVlOiBUKSB7XG4gIGNvbnN0IHJlZiA9IHVzZVJlZjxUPih2YWx1ZSk7XG4gIGNvbnN0IHNpZ25hbFJlZiA9IHVzZVJlZjxudW1iZXI+KDApO1xuXG4gIGlmICghZGVxdWFsKHZhbHVlLCByZWYuY3VycmVudCkpIHtcbiAgICByZWYuY3VycmVudCA9IHZhbHVlO1xuICAgIHNpZ25hbFJlZi5jdXJyZW50ICs9IDE7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIHJldHVybiB1c2VNZW1vKCgpID0+IHJlZi5jdXJyZW50LCBbc2lnbmFsUmVmLmN1cnJlbnRdKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsYXRlc3Qgc3RhdGUuXG4gKlxuICogVGhpcyBpcyBtb3N0bHkgdXNlZnVsIHRvIGdldCBhY2Nlc3MgdG8gdGhlIGxhdGVzdCB2YWx1ZSBvZiBzb21lIHByb3BzIG9yIHN0YXRlIGluc2lkZSBhbiBhc3luY2hyb25vdXMgY2FsbGJhY2ssIGluc3RlYWQgb2YgdGhhdCB2YWx1ZSBhdCB0aGUgdGltZSB0aGUgY2FsbGJhY2sgd2FzIGNyZWF0ZWQgZnJvbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUxhdGVzdDxUPih2YWx1ZTogVCk6IHsgcmVhZG9ubHkgY3VycmVudDogVCB9IHtcbiAgY29uc3QgcmVmID0gdXNlUmVmKHZhbHVlKTtcbiAgcmVmLmN1cnJlbnQgPSB2YWx1ZTtcbiAgcmV0dXJuIHJlZjtcbn1cbiIsICJpbXBvcnQgKiBhcyBmcyBmcm9tIFwibm9kZTpmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBDbGlwYm9hcmQsIGVudmlyb25tZW50LCBvcGVuLCBUb2FzdCwgc2hvd1RvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuXG4vKipcbiAqIFNob3dzIGEgZmFpbHVyZSBUb2FzdCBmb3IgYSBnaXZlbiBFcnJvci5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgc2hvd0hVRCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHJ1bkFwcGxlU2NyaXB0LCBzaG93RmFpbHVyZVRvYXN0IH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKCkge1xuICogICB0cnkge1xuICogICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJ1bkFwcGxlU2NyaXB0KFxuICogICAgICAgYFxuICogICAgICAgb24gcnVuIGFyZ3ZcbiAqICAgICAgICAgcmV0dXJuIFwiaGVsbG8sIFwiICYgaXRlbSAxIG9mIGFyZ3YgJiBcIi5cIlxuICogICAgICAgZW5kIHJ1blxuICogICAgICAgYCxcbiAqICAgICAgIFtcIndvcmxkXCJdXG4gKiAgICAgKTtcbiAqICAgICBhd2FpdCBzaG93SFVEKHJlcyk7XG4gKiAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgICAgc2hvd0ZhaWx1cmVUb2FzdChlcnJvciwgeyB0aXRsZTogXCJDb3VsZCBub3QgcnVuIEFwcGxlU2NyaXB0XCIgfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvd0ZhaWx1cmVUb2FzdChcbiAgZXJyb3I6IHVua25vd24sXG4gIG9wdGlvbnM/OiBQYXJ0aWFsPFBpY2s8VG9hc3QuT3B0aW9ucywgXCJ0aXRsZVwiIHwgXCJwcmltYXJ5QWN0aW9uXCIgfCBcIm1lc3NhZ2VcIj4+LFxuKSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiBzaG93VG9hc3Qoe1xuICAgIHN0eWxlOiBUb2FzdC5TdHlsZS5GYWlsdXJlLFxuICAgIHRpdGxlOiBvcHRpb25zPy50aXRsZSA/PyBcIlNvbWV0aGluZyB3ZW50IHdyb25nXCIsXG4gICAgbWVzc2FnZTogb3B0aW9ucz8ubWVzc2FnZSA/PyBtZXNzYWdlLFxuICAgIHByaW1hcnlBY3Rpb246IG9wdGlvbnM/LnByaW1hcnlBY3Rpb24gPz8gaGFuZGxlRXJyb3JUb2FzdEFjdGlvbihlcnJvciksXG4gICAgc2Vjb25kYXJ5QWN0aW9uOiBvcHRpb25zPy5wcmltYXJ5QWN0aW9uID8gaGFuZGxlRXJyb3JUb2FzdEFjdGlvbihlcnJvcikgOiB1bmRlZmluZWQsXG4gIH0pO1xufVxuXG5jb25zdCBoYW5kbGVFcnJvclRvYXN0QWN0aW9uID0gKGVycm9yOiB1bmtub3duKTogVG9hc3QuQWN0aW9uT3B0aW9ucyA9PiB7XG4gIGxldCBwcml2YXRlRXh0ZW5zaW9uID0gdHJ1ZTtcbiAgbGV0IHRpdGxlID0gXCJbRXh0ZW5zaW9uIE5hbWVdLi4uXCI7XG4gIGxldCBleHRlbnNpb25VUkwgPSBcIlwiO1xuICB0cnkge1xuICAgIGNvbnN0IHBhY2thZ2VKU09OID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKGVudmlyb25tZW50LmFzc2V0c1BhdGgsIFwiLi5cIiwgXCJwYWNrYWdlLmpzb25cIiksIFwidXRmOFwiKSk7XG4gICAgdGl0bGUgPSBgWyR7cGFja2FnZUpTT04udGl0bGV9XS4uLmA7XG4gICAgZXh0ZW5zaW9uVVJMID0gYGh0dHBzOi8vcmF5Y2FzdC5jb20vJHtwYWNrYWdlSlNPTi5vd25lciB8fCBwYWNrYWdlSlNPTi5hdXRob3J9LyR7cGFja2FnZUpTT04ubmFtZX1gO1xuICAgIGlmICghcGFja2FnZUpTT04ub3duZXIgfHwgcGFja2FnZUpTT04uYWNjZXNzID09PSBcInB1YmxpY1wiKSB7XG4gICAgICBwcml2YXRlRXh0ZW5zaW9uID0gZmFsc2U7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBuby1vcFxuICB9XG5cbiAgLy8gaWYgaXQncyBhIHByaXZhdGUgZXh0ZW5zaW9uLCB3ZSBjYW4ndCBjb25zdHJ1Y3QgdGhlIFVSTCB0byByZXBvcnQgdGhlIGVycm9yXG4gIC8vIHNvIHdlIGZhbGxiYWNrIHRvIGNvcHlpbmcgdGhlIGVycm9yIHRvIHRoZSBjbGlwYm9hcmRcbiAgY29uc3QgZmFsbGJhY2sgPSBlbnZpcm9ubWVudC5pc0RldmVsb3BtZW50IHx8IHByaXZhdGVFeHRlbnNpb247XG5cbiAgY29uc3Qgc3RhY2sgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3I/LnN0YWNrIHx8IGVycm9yPy5tZXNzYWdlIHx8IFwiXCIgOiBTdHJpbmcoZXJyb3IpO1xuXG4gIHJldHVybiB7XG4gICAgdGl0bGU6IGZhbGxiYWNrID8gXCJDb3B5IExvZ3NcIiA6IFwiUmVwb3J0IEVycm9yXCIsXG4gICAgb25BY3Rpb24odG9hc3QpIHtcbiAgICAgIHRvYXN0LmhpZGUoKTtcbiAgICAgIGlmIChmYWxsYmFjaykge1xuICAgICAgICBDbGlwYm9hcmQuY29weShzdGFjayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcGVuKFxuICAgICAgICAgIGBodHRwczovL2dpdGh1Yi5jb20vcmF5Y2FzdC9leHRlbnNpb25zL2lzc3Vlcy9uZXc/JmxhYmVscz1leHRlbnNpb24lMkNidWcmdGVtcGxhdGU9ZXh0ZW5zaW9uX2J1Z19yZXBvcnQueW1sJnRpdGxlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgKX0mZXh0ZW5zaW9uLXVybD0ke2VuY29kZVVSSShleHRlbnNpb25VUkwpfSZkZXNjcmlwdGlvbj0ke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICAgIGAjIyMjIEVycm9yOlxuXFxgXFxgXFxgXG4ke3N0YWNrfVxuXFxgXFxgXFxgXG5gLFxuICAgICAgICAgICl9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xufTtcbiIsICJpbXBvcnQgeyB1c2VDYWxsYmFjaywgRGlzcGF0Y2gsIFNldFN0YXRlQWN0aW9uLCB1c2VTeW5jRXh0ZXJuYWxTdG9yZSwgdXNlTWVtbyB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQ2FjaGUgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyB1c2VMYXRlc3QgfSBmcm9tIFwiLi91c2VMYXRlc3RcIjtcbmltcG9ydCB7IHJlcGxhY2VyLCByZXZpdmVyIH0gZnJvbSBcIi4vaGVscGVyc1wiO1xuXG5jb25zdCByb290Q2FjaGUgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sKFwiY2FjaGUgd2l0aG91dCBuYW1lc3BhY2VcIik7XG5jb25zdCBjYWNoZU1hcCA9IC8qICNfX1BVUkVfXyAqLyBuZXcgTWFwPHN0cmluZyB8IHN5bWJvbCwgQ2FjaGU+KCk7XG5cbi8qKlxuICogUmV0dXJucyBhIHN0YXRlZnVsIHZhbHVlLCBhbmQgYSBmdW5jdGlvbiB0byB1cGRhdGUgaXQuIFRoZSB2YWx1ZSB3aWxsIGJlIGtlcHQgYmV0d2VlbiBjb21tYW5kIHJ1bnMuXG4gKlxuICogQHJlbWFyayBUaGUgdmFsdWUgbmVlZHMgdG8gYmUgSlNPTiBzZXJpYWxpemFibGUuXG4gKlxuICogQHBhcmFtIGtleSAtIFRoZSB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgc3RhdGUuIFRoaXMgY2FuIGJlIHVzZWQgdG8gc2hhcmUgdGhlIHN0YXRlIGFjcm9zcyBjb21wb25lbnRzIGFuZC9vciBjb21tYW5kcy5cbiAqIEBwYXJhbSBpbml0aWFsU3RhdGUgLSBUaGUgaW5pdGlhbCB2YWx1ZSBvZiB0aGUgc3RhdGUgaWYgdGhlcmUgYXJlbid0IGFueSBpbiB0aGUgQ2FjaGUgeWV0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQ2FjaGVkU3RhdGU8VD4oXG4gIGtleTogc3RyaW5nLFxuICBpbml0aWFsU3RhdGU6IFQsXG4gIGNvbmZpZz86IHsgY2FjaGVOYW1lc3BhY2U/OiBzdHJpbmcgfSxcbik6IFtULCBEaXNwYXRjaDxTZXRTdGF0ZUFjdGlvbjxUPj5dO1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUNhY2hlZFN0YXRlPFQgPSB1bmRlZmluZWQ+KGtleTogc3RyaW5nKTogW1QgfCB1bmRlZmluZWQsIERpc3BhdGNoPFNldFN0YXRlQWN0aW9uPFQgfCB1bmRlZmluZWQ+Pl07XG5leHBvcnQgZnVuY3Rpb24gdXNlQ2FjaGVkU3RhdGU8VD4oXG4gIGtleTogc3RyaW5nLFxuICBpbml0aWFsU3RhdGU/OiBULFxuICBjb25maWc/OiB7IGNhY2hlTmFtZXNwYWNlPzogc3RyaW5nIH0sXG4pOiBbVCwgRGlzcGF0Y2g8U2V0U3RhdGVBY3Rpb248VD4+XSB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gY29uZmlnPy5jYWNoZU5hbWVzcGFjZSB8fCByb290Q2FjaGU7XG4gIGNvbnN0IGNhY2hlID1cbiAgICBjYWNoZU1hcC5nZXQoY2FjaGVLZXkpIHx8IGNhY2hlTWFwLnNldChjYWNoZUtleSwgbmV3IENhY2hlKHsgbmFtZXNwYWNlOiBjb25maWc/LmNhY2hlTmFtZXNwYWNlIH0pKS5nZXQoY2FjaGVLZXkpO1xuXG4gIGlmICghY2FjaGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGNhY2hlXCIpO1xuICB9XG5cbiAgY29uc3Qga2V5UmVmID0gdXNlTGF0ZXN0KGtleSk7XG4gIGNvbnN0IGluaXRpYWxWYWx1ZVJlZiA9IHVzZUxhdGVzdChpbml0aWFsU3RhdGUpO1xuXG4gIGNvbnN0IGNhY2hlZFN0YXRlID0gdXNlU3luY0V4dGVybmFsU3RvcmUoY2FjaGUuc3Vic2NyaWJlLCAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBjYWNoZS5nZXQoa2V5UmVmLmN1cnJlbnQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQ291bGQgbm90IGdldCBDYWNoZSBkYXRhOlwiLCBlcnJvcik7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3Qgc3RhdGUgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAodHlwZW9mIGNhY2hlZFN0YXRlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAoY2FjaGVkU3RhdGUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNhY2hlZFN0YXRlLCByZXZpdmVyKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyB0aGUgZGF0YSBnb3QgY29ycnVwdGVkIHNvbWVob3dcbiAgICAgICAgY29uc29sZS53YXJuKFwiVGhlIGNhY2hlZCBkYXRhIGlzIGNvcnJ1cHRlZFwiLCBlcnIpO1xuICAgICAgICByZXR1cm4gaW5pdGlhbFZhbHVlUmVmLmN1cnJlbnQ7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbml0aWFsVmFsdWVSZWYuY3VycmVudDtcbiAgICB9XG4gIH0sIFtjYWNoZWRTdGF0ZSwgaW5pdGlhbFZhbHVlUmVmXSk7XG5cbiAgY29uc3Qgc3RhdGVSZWYgPSB1c2VMYXRlc3Qoc3RhdGUpO1xuXG4gIGNvbnN0IHNldFN0YXRlQW5kQ2FjaGUgPSB1c2VDYWxsYmFjayhcbiAgICAodXBkYXRlcjogU2V0U3RhdGVBY3Rpb248VD4pID0+IHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVFMgc3RydWdnbGVzIHRvIGluZmVyIHRoZSB0eXBlcyBhcyBUIGNvdWxkIHBvdGVudGlhbGx5IGJlIGEgZnVuY3Rpb25cbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdHlwZW9mIHVwZGF0ZXIgPT09IFwiZnVuY3Rpb25cIiA/IHVwZGF0ZXIoc3RhdGVSZWYuY3VycmVudCkgOiB1cGRhdGVyO1xuICAgICAgaWYgKHR5cGVvZiBuZXdWYWx1ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBjYWNoZS5zZXQoa2V5UmVmLmN1cnJlbnQsIFwidW5kZWZpbmVkXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc3RyaW5naWZpZWRWYWx1ZSA9IEpTT04uc3RyaW5naWZ5KG5ld1ZhbHVlLCByZXBsYWNlcik7XG4gICAgICAgIGNhY2hlLnNldChrZXlSZWYuY3VycmVudCwgc3RyaW5naWZpZWRWYWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3VmFsdWU7XG4gICAgfSxcbiAgICBbY2FjaGUsIGtleVJlZiwgc3RhdGVSZWZdLFxuICApO1xuXG4gIHJldHVybiBbc3RhdGUsIHNldFN0YXRlQW5kQ2FjaGVdO1xufVxuIiwgImltcG9ydCBjcnlwdG8gZnJvbSBcIm5vZGU6Y3J5cHRvXCI7XG5pbXBvcnQgeyB0eXBlSGFzaGVyIH0gZnJvbSBcIi4vdmVuZG9ycy90eXBlLWhhc2hlclwiO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VyKHRoaXM6IGFueSwga2V5OiBzdHJpbmcsIF92YWx1ZTogdW5rbm93bikge1xuICBjb25zdCB2YWx1ZSA9IHRoaXNba2V5XTtcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBgX19yYXljYXN0X2NhY2hlZF9kYXRlX18ke3ZhbHVlLnRvSVNPU3RyaW5nKCl9YDtcbiAgfVxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbHVlKSkge1xuICAgIHJldHVybiBgX19yYXljYXN0X2NhY2hlZF9idWZmZXJfXyR7dmFsdWUudG9TdHJpbmcoXCJiYXNlNjRcIil9YDtcbiAgfVxuICByZXR1cm4gX3ZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2aXZlcihfa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgJiYgdmFsdWUuc3RhcnRzV2l0aChcIl9fcmF5Y2FzdF9jYWNoZWRfZGF0ZV9fXCIpKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHZhbHVlLnJlcGxhY2UoXCJfX3JheWNhc3RfY2FjaGVkX2RhdGVfX1wiLCBcIlwiKSk7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiB2YWx1ZS5zdGFydHNXaXRoKFwiX19yYXljYXN0X2NhY2hlZF9idWZmZXJfX1wiKSkge1xuICAgIHJldHVybiBCdWZmZXIuZnJvbSh2YWx1ZS5yZXBsYWNlKFwiX19yYXljYXN0X2NhY2hlZF9idWZmZXJfX1wiLCBcIlwiKSwgXCJiYXNlNjRcIik7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzaChvYmplY3Q6IGFueSkge1xuICBjb25zdCBoYXNoaW5nU3RyZWFtID0gY3J5cHRvLmNyZWF0ZUhhc2goXCJzaGExXCIpO1xuICBjb25zdCBoYXNoZXIgPSB0eXBlSGFzaGVyKGhhc2hpbmdTdHJlYW0pO1xuICBoYXNoZXIuZGlzcGF0Y2gob2JqZWN0KTtcblxuICByZXR1cm4gaGFzaGluZ1N0cmVhbS5kaWdlc3QoXCJoZXhcIik7XG59XG4iLCAiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50ICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhcyAqL1xuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSAqL1xuaW1wb3J0IGNyeXB0byBmcm9tIFwibm9kZTpjcnlwdG9cIjtcblxuLyoqIENoZWNrIGlmIHRoZSBnaXZlbiBmdW5jdGlvbiBpcyBhIG5hdGl2ZSBmdW5jdGlvbiAqL1xuZnVuY3Rpb24gaXNOYXRpdmVGdW5jdGlvbihmOiBhbnkpIHtcbiAgaWYgKHR5cGVvZiBmICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgZXhwID0gL15mdW5jdGlvblxccytcXHcqXFxzKlxcKFxccypcXClcXHMqe1xccytcXFtuYXRpdmUgY29kZVxcXVxccyt9JC9pO1xuICByZXR1cm4gZXhwLmV4ZWMoRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZikpICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBoYXNoUmVwbGFjZXIodmFsdWU6IGFueSk6IHN0cmluZyB7XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcykge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVIYXNoZXIoXG4gIHdyaXRlVG86XG4gICAgfCBjcnlwdG8uSGFzaFxuICAgIHwge1xuICAgICAgICBidWY6IHN0cmluZztcbiAgICAgICAgd3JpdGU6IChiOiBhbnkpID0+IHZvaWQ7XG4gICAgICAgIGVuZDogKGI6IGFueSkgPT4gdm9pZDtcbiAgICAgICAgcmVhZDogKCkgPT4gc3RyaW5nO1xuICAgICAgfSxcbiAgY29udGV4dDogYW55W10gPSBbXSxcbikge1xuICBmdW5jdGlvbiB3cml0ZShzdHI6IHN0cmluZykge1xuICAgIGlmIChcInVwZGF0ZVwiIGluIHdyaXRlVG8pIHtcbiAgICAgIHJldHVybiB3cml0ZVRvLnVwZGF0ZShzdHIsIFwidXRmOFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHdyaXRlVG8ud3JpdGUoc3RyKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGRpc3BhdGNoOiBmdW5jdGlvbiAodmFsdWU6IGFueSkge1xuICAgICAgdmFsdWUgPSBoYXNoUmVwbGFjZXIodmFsdWUpO1xuXG4gICAgICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHRoaXNbXCJfbnVsbFwiXSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzW1wiX1wiICsgdHlwZV0odmFsdWUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgX29iamVjdDogZnVuY3Rpb24gKG9iamVjdDogYW55KSB7XG4gICAgICBjb25zdCBwYXR0ZXJuID0gL1xcW29iamVjdCAoLiopXFxdL2k7XG4gICAgICBjb25zdCBvYmpTdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KTtcbiAgICAgIGxldCBvYmpUeXBlID0gcGF0dGVybi5leGVjKG9ialN0cmluZyk/LlsxXSA/PyBcInVua25vd246W1wiICsgb2JqU3RyaW5nICsgXCJdXCI7XG4gICAgICBvYmpUeXBlID0gb2JqVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICBsZXQgb2JqZWN0TnVtYmVyID0gbnVsbCBhcyBhbnk7XG5cbiAgICAgIGlmICgob2JqZWN0TnVtYmVyID0gY29udGV4dC5pbmRleE9mKG9iamVjdCkpID49IDApIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaChcIltDSVJDVUxBUjpcIiArIG9iamVjdE51bWJlciArIFwiXVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGV4dC5wdXNoKG9iamVjdCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqZWN0KSkge1xuICAgICAgICB3cml0ZShcImJ1ZmZlcjpcIik7XG4gICAgICAgIHJldHVybiB3cml0ZShvYmplY3QudG9TdHJpbmcoXCJ1dGY4XCIpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9ialR5cGUgIT09IFwib2JqZWN0XCIgJiYgb2JqVHlwZSAhPT0gXCJmdW5jdGlvblwiICYmIG9ialR5cGUgIT09IFwiYXN5bmNmdW5jdGlvblwiKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgaWYgKHRoaXNbXCJfXCIgKyBvYmpUeXBlXSkge1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICB0aGlzW1wiX1wiICsgb2JqVHlwZV0ob2JqZWN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gb2JqZWN0IHR5cGUgXCInICsgb2JqVHlwZSArICdcIicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7XG4gICAgICAgIGtleXMgPSBrZXlzLnNvcnQoKTtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRvIGluY29ycG9yYXRlIHNwZWNpYWwgcHJvcGVydGllcywgc29cbiAgICAgICAgLy8gVHlwZXMgd2l0aCBkaWZmZXJlbnQgcHJvdG90eXBlcyB3aWxsIHByb2R1Y2VcbiAgICAgICAgLy8gYSBkaWZmZXJlbnQgaGFzaCBhbmQgb2JqZWN0cyBkZXJpdmVkIGZyb21cbiAgICAgICAgLy8gZGlmZmVyZW50IGZ1bmN0aW9ucyAoYG5ldyBGb29gLCBgbmV3IEJhcmApIHdpbGxcbiAgICAgICAgLy8gcHJvZHVjZSBkaWZmZXJlbnQgaGFzaGVzLlxuICAgICAgICAvLyBXZSBuZXZlciBkbyB0aGlzIGZvciBuYXRpdmUgZnVuY3Rpb25zIHNpbmNlIHNvbWVcbiAgICAgICAgLy8gc2VlbSB0byBicmVhayBiZWNhdXNlIG9mIHRoYXQuXG4gICAgICAgIGlmICghaXNOYXRpdmVGdW5jdGlvbihvYmplY3QpKSB7XG4gICAgICAgICAga2V5cy5zcGxpY2UoMCwgMCwgXCJwcm90b3R5cGVcIiwgXCJfX3Byb3RvX19cIiwgXCJjb25zdHJ1Y3RvclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdyaXRlKFwib2JqZWN0OlwiICsga2V5cy5sZW5ndGggKyBcIjpcIik7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4ga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICBzZWxmLmRpc3BhdGNoKGtleSk7XG4gICAgICAgICAgd3JpdGUoXCI6XCIpO1xuICAgICAgICAgIHNlbGYuZGlzcGF0Y2gob2JqZWN0W2tleV0pO1xuICAgICAgICAgIHdyaXRlKFwiLFwiKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBfYXJyYXk6IGZ1bmN0aW9uIChhcnI6IGFueVtdLCB1bm9yZGVyZWQ6IGJvb2xlYW4pIHtcbiAgICAgIHVub3JkZXJlZCA9IHR5cGVvZiB1bm9yZGVyZWQgIT09IFwidW5kZWZpbmVkXCIgPyB1bm9yZGVyZWQgOiBmYWxzZTsgLy8gZGVmYXVsdCB0byBvcHRpb25zLnVub3JkZXJlZEFycmF5c1xuXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHdyaXRlKFwiYXJyYXk6XCIgKyBhcnIubGVuZ3RoICsgXCI6XCIpO1xuICAgICAgaWYgKCF1bm9yZGVyZWQgfHwgYXJyLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeTogYW55KSB7XG4gICAgICAgICAgc2VsZi5kaXNwYXRjaChlbnRyeSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIHRoZSB1bm9yZGVyZWQgY2FzZSBpcyBhIGxpdHRsZSBtb3JlIGNvbXBsaWNhdGVkOlxuICAgICAgLy8gc2luY2UgdGhlcmUgaXMgbm8gY2Fub25pY2FsIG9yZGVyaW5nIG9uIG9iamVjdHMsXG4gICAgICAvLyBpLmUuIHthOjF9IDwge2E6Mn0gYW5kIHthOjF9ID4ge2E6Mn0gYXJlIGJvdGggZmFsc2UsXG4gICAgICAvLyB3ZSBmaXJzdCBzZXJpYWxpemUgZWFjaCBlbnRyeSB1c2luZyBhIFBhc3NUaHJvdWdoIHN0cmVhbVxuICAgICAgLy8gYmVmb3JlIHNvcnRpbmcuXG4gICAgICAvLyBhbHNvOiB3ZSBjYW7igJl0IHVzZSB0aGUgc2FtZSBjb250ZXh0IGFycmF5IGZvciBhbGwgZW50cmllc1xuICAgICAgLy8gc2luY2UgdGhlIG9yZGVyIG9mIGhhc2hpbmcgc2hvdWxkICpub3QqIG1hdHRlci4gaW5zdGVhZCxcbiAgICAgIC8vIHdlIGtlZXAgdHJhY2sgb2YgdGhlIGFkZGl0aW9ucyB0byBhIGNvcHkgb2YgdGhlIGNvbnRleHQgYXJyYXlcbiAgICAgIC8vIGFuZCBhZGQgYWxsIG9mIHRoZW0gdG8gdGhlIGdsb2JhbCBjb250ZXh0IGFycmF5IHdoZW4gd2XigJlyZSBkb25lXG4gICAgICBsZXQgY29udGV4dEFkZGl0aW9uczogYW55W10gPSBbXTtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBhcnIubWFwKGZ1bmN0aW9uIChlbnRyeTogYW55KSB7XG4gICAgICAgIGNvbnN0IHN0cm0gPSBQYXNzVGhyb3VnaCgpO1xuICAgICAgICBjb25zdCBsb2NhbENvbnRleHQgPSBjb250ZXh0LnNsaWNlKCk7IC8vIG1ha2UgY29weVxuICAgICAgICBjb25zdCBoYXNoZXIgPSB0eXBlSGFzaGVyKHN0cm0sIGxvY2FsQ29udGV4dCk7XG4gICAgICAgIGhhc2hlci5kaXNwYXRjaChlbnRyeSk7XG4gICAgICAgIC8vIHRha2Ugb25seSB3aGF0IHdhcyBhZGRlZCB0byBsb2NhbENvbnRleHQgYW5kIGFwcGVuZCBpdCB0byBjb250ZXh0QWRkaXRpb25zXG4gICAgICAgIGNvbnRleHRBZGRpdGlvbnMgPSBjb250ZXh0QWRkaXRpb25zLmNvbmNhdChsb2NhbENvbnRleHQuc2xpY2UoY29udGV4dC5sZW5ndGgpKTtcbiAgICAgICAgcmV0dXJuIHN0cm0ucmVhZCgpLnRvU3RyaW5nKCk7XG4gICAgICB9KTtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNvbmNhdChjb250ZXh0QWRkaXRpb25zKTtcbiAgICAgIGVudHJpZXMuc29ydCgpO1xuICAgICAgdGhpcy5fYXJyYXkoZW50cmllcywgZmFsc2UpO1xuICAgIH0sXG4gICAgX2RhdGU6IGZ1bmN0aW9uIChkYXRlOiBEYXRlKSB7XG4gICAgICB3cml0ZShcImRhdGU6XCIgKyBkYXRlLnRvSlNPTigpKTtcbiAgICB9LFxuICAgIF9zeW1ib2w6IGZ1bmN0aW9uIChzeW06IHN5bWJvbCkge1xuICAgICAgd3JpdGUoXCJzeW1ib2w6XCIgKyBzeW0udG9TdHJpbmcoKSk7XG4gICAgfSxcbiAgICBfZXJyb3I6IGZ1bmN0aW9uIChlcnI6IEVycm9yKSB7XG4gICAgICB3cml0ZShcImVycm9yOlwiICsgZXJyLnRvU3RyaW5nKCkpO1xuICAgIH0sXG4gICAgX2Jvb2xlYW46IGZ1bmN0aW9uIChib29sOiBib29sZWFuKSB7XG4gICAgICB3cml0ZShcImJvb2w6XCIgKyBib29sLnRvU3RyaW5nKCkpO1xuICAgIH0sXG4gICAgX3N0cmluZzogZnVuY3Rpb24gKHN0cmluZzogc3RyaW5nKSB7XG4gICAgICB3cml0ZShcInN0cmluZzpcIiArIHN0cmluZy5sZW5ndGggKyBcIjpcIik7XG4gICAgICB3cml0ZShzdHJpbmcudG9TdHJpbmcoKSk7XG4gICAgfSxcbiAgICBfZnVuY3Rpb246IGZ1bmN0aW9uIChmbjogYW55KSB7XG4gICAgICB3cml0ZShcImZuOlwiKTtcbiAgICAgIGlmIChpc05hdGl2ZUZ1bmN0aW9uKGZuKSkge1xuICAgICAgICB0aGlzLmRpc3BhdGNoKFwiW25hdGl2ZV1cIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRpc3BhdGNoKGZuLnRvU3RyaW5nKCkpO1xuICAgICAgfVxuXG4gICAgICAvLyBNYWtlIHN1cmUgd2UgY2FuIHN0aWxsIGRpc3Rpbmd1aXNoIG5hdGl2ZSBmdW5jdGlvbnNcbiAgICAgIC8vIGJ5IHRoZWlyIG5hbWUsIG90aGVyd2lzZSBTdHJpbmcgYW5kIEZ1bmN0aW9uIHdpbGxcbiAgICAgIC8vIGhhdmUgdGhlIHNhbWUgaGFzaFxuICAgICAgdGhpcy5kaXNwYXRjaChcImZ1bmN0aW9uLW5hbWU6XCIgKyBTdHJpbmcoZm4ubmFtZSkpO1xuXG4gICAgICB0aGlzLl9vYmplY3QoZm4pO1xuICAgIH0sXG4gICAgX251bWJlcjogZnVuY3Rpb24gKG51bWJlcjogbnVtYmVyKSB7XG4gICAgICB3cml0ZShcIm51bWJlcjpcIiArIG51bWJlci50b1N0cmluZygpKTtcbiAgICB9LFxuICAgIF94bWw6IGZ1bmN0aW9uICh4bWw6IGFueSkge1xuICAgICAgd3JpdGUoXCJ4bWw6XCIgKyB4bWwudG9TdHJpbmcoKSk7XG4gICAgfSxcbiAgICBfbnVsbDogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJOdWxsXCIpO1xuICAgIH0sXG4gICAgX3VuZGVmaW5lZDogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJVbmRlZmluZWRcIik7XG4gICAgfSxcbiAgICBfcmVnZXhwOiBmdW5jdGlvbiAocmVnZXg6IFJlZ0V4cCkge1xuICAgICAgd3JpdGUoXCJyZWdleDpcIiArIHJlZ2V4LnRvU3RyaW5nKCkpO1xuICAgIH0sXG4gICAgX3VpbnQ4YXJyYXk6IGZ1bmN0aW9uIChhcnI6IFVpbnQ4QXJyYXkpIHtcbiAgICAgIHdyaXRlKFwidWludDhhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX3VpbnQ4Y2xhbXBlZGFycmF5OiBmdW5jdGlvbiAoYXJyOiBVaW50OENsYW1wZWRBcnJheSkge1xuICAgICAgd3JpdGUoXCJ1aW50OGNsYW1wZWRhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX2ludDhhcnJheTogZnVuY3Rpb24gKGFycjogSW50OEFycmF5KSB7XG4gICAgICB3cml0ZShcImludDhhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX3VpbnQxNmFycmF5OiBmdW5jdGlvbiAoYXJyOiBVaW50MTZBcnJheSkge1xuICAgICAgd3JpdGUoXCJ1aW50MTZhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX2ludDE2YXJyYXk6IGZ1bmN0aW9uIChhcnI6IEludDE2QXJyYXkpIHtcbiAgICAgIHdyaXRlKFwiaW50MTZhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX3VpbnQzMmFycmF5OiBmdW5jdGlvbiAoYXJyOiBVaW50MzJBcnJheSkge1xuICAgICAgd3JpdGUoXCJ1aW50MzJhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX2ludDMyYXJyYXk6IGZ1bmN0aW9uIChhcnI6IEludDMyQXJyYXkpIHtcbiAgICAgIHdyaXRlKFwiaW50MzJhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX2Zsb2F0MzJhcnJheTogZnVuY3Rpb24gKGFycjogRmxvYXQzMkFycmF5KSB7XG4gICAgICB3cml0ZShcImZsb2F0MzJhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX2Zsb2F0NjRhcnJheTogZnVuY3Rpb24gKGFycjogRmxvYXQ2NEFycmF5KSB7XG4gICAgICB3cml0ZShcImZsb2F0NjRhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX2FycmF5YnVmZmVyOiBmdW5jdGlvbiAoYXJyOiBBcnJheUJ1ZmZlcikge1xuICAgICAgd3JpdGUoXCJhcnJheWJ1ZmZlcjpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKG5ldyBVaW50OEFycmF5KGFycikpO1xuICAgIH0sXG4gICAgX3VybDogZnVuY3Rpb24gKHVybDogVVJMKSB7XG4gICAgICB3cml0ZShcInVybDpcIiArIHVybC50b1N0cmluZygpKTtcbiAgICB9LFxuICAgIF9tYXA6IGZ1bmN0aW9uIChtYXA6IE1hcDxhbnksIGFueT4pIHtcbiAgICAgIHdyaXRlKFwibWFwOlwiKTtcbiAgICAgIGNvbnN0IGFyciA9IEFycmF5LmZyb20obWFwKTtcbiAgICAgIHRoaXMuX2FycmF5KGFyciwgdHJ1ZSk7XG4gICAgfSxcbiAgICBfc2V0OiBmdW5jdGlvbiAoc2V0OiBTZXQ8YW55Pikge1xuICAgICAgd3JpdGUoXCJzZXQ6XCIpO1xuICAgICAgY29uc3QgYXJyID0gQXJyYXkuZnJvbShzZXQpO1xuICAgICAgdGhpcy5fYXJyYXkoYXJyLCB0cnVlKTtcbiAgICB9LFxuICAgIF9maWxlOiBmdW5jdGlvbiAoZmlsZTogYW55KSB7XG4gICAgICB3cml0ZShcImZpbGU6XCIpO1xuICAgICAgdGhpcy5kaXNwYXRjaChbZmlsZS5uYW1lLCBmaWxlLnNpemUsIGZpbGUudHlwZSwgZmlsZS5sYXN0TW9kaWZpZWRdKTtcbiAgICB9LFxuICAgIF9ibG9iOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgXCJIYXNoaW5nIEJsb2Igb2JqZWN0cyBpcyBjdXJyZW50bHkgbm90IHN1cHBvcnRlZFxcblwiICtcbiAgICAgICAgICBcIihzZWUgaHR0cHM6Ly9naXRodWIuY29tL3B1bGVvcy9vYmplY3QtaGFzaC9pc3N1ZXMvMjYpXFxuXCIgK1xuICAgICAgICAgICdVc2UgXCJvcHRpb25zLnJlcGxhY2VyXCIgb3IgXCJvcHRpb25zLmlnbm9yZVVua25vd25cIlxcbicsXG4gICAgICApO1xuICAgIH0sXG4gICAgX2RvbXdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJkb213aW5kb3dcIik7XG4gICAgfSxcbiAgICBfYmlnaW50OiBmdW5jdGlvbiAobnVtYmVyOiBiaWdpbnQpIHtcbiAgICAgIHdyaXRlKFwiYmlnaW50OlwiICsgbnVtYmVyLnRvU3RyaW5nKCkpO1xuICAgIH0sXG4gICAgLyogTm9kZS5qcyBzdGFuZGFyZCBuYXRpdmUgb2JqZWN0cyAqL1xuICAgIF9wcm9jZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcInByb2Nlc3NcIik7XG4gICAgfSxcbiAgICBfdGltZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwidGltZXJcIik7XG4gICAgfSxcbiAgICBfcGlwZTogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJwaXBlXCIpO1xuICAgIH0sXG4gICAgX3RjcDogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJ0Y3BcIik7XG4gICAgfSxcbiAgICBfdWRwOiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcInVkcFwiKTtcbiAgICB9LFxuICAgIF90dHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwidHR5XCIpO1xuICAgIH0sXG4gICAgX3N0YXR3YXRjaGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcInN0YXR3YXRjaGVyXCIpO1xuICAgIH0sXG4gICAgX3NlY3VyZWNvbnRleHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwic2VjdXJlY29udGV4dFwiKTtcbiAgICB9LFxuICAgIF9jb25uZWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcImNvbm5lY3Rpb25cIik7XG4gICAgfSxcbiAgICBfemxpYjogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJ6bGliXCIpO1xuICAgIH0sXG4gICAgX2NvbnRleHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwiY29udGV4dFwiKTtcbiAgICB9LFxuICAgIF9ub2Rlc2NyaXB0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcIm5vZGVzY3JpcHRcIik7XG4gICAgfSxcbiAgICBfaHR0cHBhcnNlcjogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJodHRwcGFyc2VyXCIpO1xuICAgIH0sXG4gICAgX2RhdGF2aWV3OiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcImRhdGF2aWV3XCIpO1xuICAgIH0sXG4gICAgX3NpZ25hbDogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJzaWduYWxcIik7XG4gICAgfSxcbiAgICBfZnNldmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJmc2V2ZW50XCIpO1xuICAgIH0sXG4gICAgX3Rsc3dyYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwidGxzd3JhcFwiKTtcbiAgICB9LFxuICB9O1xufVxuXG4vLyBNaW5pLWltcGxlbWVudGF0aW9uIG9mIHN0cmVhbS5QYXNzVGhyb3VnaFxuLy8gV2UgYXJlIGZhciBmcm9tIGhhdmluZyBuZWVkIGZvciB0aGUgZnVsbCBpbXBsZW1lbnRhdGlvbiwgYW5kIHdlIGNhblxuLy8gbWFrZSBhc3N1bXB0aW9ucyBsaWtlIFwibWFueSB3cml0ZXMsIHRoZW4gb25seSBvbmUgZmluYWwgcmVhZFwiXG4vLyBhbmQgd2UgY2FuIGlnbm9yZSBlbmNvZGluZyBzcGVjaWZpY3NcbmZ1bmN0aW9uIFBhc3NUaHJvdWdoKCkge1xuICByZXR1cm4ge1xuICAgIGJ1ZjogXCJcIixcblxuICAgIHdyaXRlOiBmdW5jdGlvbiAoYjogc3RyaW5nKSB7XG4gICAgICB0aGlzLmJ1ZiArPSBiO1xuICAgIH0sXG5cbiAgICBlbmQ6IGZ1bmN0aW9uIChiOiBzdHJpbmcpIHtcbiAgICAgIHRoaXMuYnVmICs9IGI7XG4gICAgfSxcblxuICAgIHJlYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmJ1ZjtcbiAgICB9LFxuICB9O1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VDYWxsYmFjayB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlLFxuICBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZSxcbiAgTXV0YXRlUHJvbWlzZSxcbiAgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLFxuICBVbndyYXBSZXR1cm4sXG4gIFBhZ2luYXRpb25PcHRpb25zLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgdXNlQ2FjaGVkU3RhdGUgfSBmcm9tIFwiLi91c2VDYWNoZWRTdGF0ZVwiO1xuaW1wb3J0IHsgdXNlUHJvbWlzZSwgUHJvbWlzZU9wdGlvbnMgfSBmcm9tIFwiLi91c2VQcm9taXNlXCI7XG5pbXBvcnQgeyB1c2VMYXRlc3QgfSBmcm9tIFwiLi91c2VMYXRlc3RcIjtcbmltcG9ydCB7IGhhc2ggfSBmcm9tIFwiLi9oZWxwZXJzXCI7XG5cbi8vIFN5bWJvbCB0byBkaWZmZXJlbnRpYXRlIGFuIGVtcHR5IGNhY2hlIGZyb20gYHVuZGVmaW5lZGBcbmNvbnN0IGVtcHR5Q2FjaGUgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sKCk7XG5cbmV4cG9ydCB0eXBlIENhY2hlZFByb21pc2VPcHRpb25zPFxuICBUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlIHwgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLFxuICBVLFxuPiA9IFByb21pc2VPcHRpb25zPFQ+ICYge1xuICAvKipcbiAgICogVGhlIGluaXRpYWwgZGF0YSBpZiB0aGVyZSBhcmVuJ3QgYW55IGluIHRoZSBDYWNoZSB5ZXQuXG4gICAqL1xuICBpbml0aWFsRGF0YT86IFU7XG4gIC8qKlxuICAgKiBUZWxscyB0aGUgaG9vayB0byBrZWVwIHRoZSBwcmV2aW91cyByZXN1bHRzIGluc3RlYWQgb2YgcmV0dXJuaW5nIHRoZSBpbml0aWFsIHZhbHVlXG4gICAqIGlmIHRoZXJlIGFyZW4ndCBhbnkgaW4gdGhlIGNhY2hlIGZvciB0aGUgbmV3IGFyZ3VtZW50cy5cbiAgICogVGhpcyBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIHdoZW4gdXNlZCBmb3IgZGF0YSBmb3IgYSBMaXN0IHRvIGF2b2lkIGZsaWNrZXJpbmcuXG4gICAqL1xuICBrZWVwUHJldmlvdXNEYXRhPzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogV3JhcHMgYW4gYXN5bmNocm9ub3VzIGZ1bmN0aW9uIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgUHJvbWlzZSBpbiBhbm90aGVyIGZ1bmN0aW9uLCBhbmQgcmV0dXJucyB0aGUge0BsaW5rIEFzeW5jU3RhdGV9IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGV4ZWN1dGlvbiBvZiB0aGUgZnVuY3Rpb24uIFRoZSBsYXN0IHZhbHVlIHdpbGwgYmUga2VwdCBiZXR3ZWVuIGNvbW1hbmQgcnVucy5cbiAqXG4gKiBAcmVtYXJrIFRoaXMgb3ZlcmxvYWQgc2hvdWxkIGJlIHVzZWQgd2hlbiB3b3JraW5nIHdpdGggcGFnaW5hdGVkIGRhdGEgc291cmNlcy5cbiAqIEByZW1hcmsgV2hlbiBwYWdpbmF0aW5nLCBvbmx5IHRoZSBmaXJzdCBwYWdlIHdpbGwgYmUgY2FjaGVkLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBcbiAqIGltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tIFwibm9kZTp0aW1lcnMvcHJvbWlzZXNcIjtcbiAqIGltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG4gKiBpbXBvcnQgeyBMaXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgdXNlQ2FjaGVkUHJvbWlzZSB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IFtzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICpcbiAqICAgY29uc3QgeyBpc0xvYWRpbmcsIGRhdGEsIHBhZ2luYXRpb24gfSA9IHVzZUNhY2hlZFByb21pc2UoXG4gKiAgICAgKHNlYXJjaFRleHQ6IHN0cmluZykgPT4gYXN5bmMgKG9wdGlvbnM6IHsgcGFnZTogbnVtYmVyIH0pID0+IHtcbiAqICAgICAgIGF3YWl0IHNldFRpbWVvdXQoMjAwKTtcbiAqICAgICAgIGNvbnN0IG5ld0RhdGEgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAyNSB9LCAoX3YsIGluZGV4KSA9PiAoe1xuICogICAgICAgICBpbmRleCxcbiAqICAgICAgICAgcGFnZTogb3B0aW9ucy5wYWdlLFxuICogICAgICAgICB0ZXh0OiBzZWFyY2hUZXh0LFxuICogICAgICAgfSkpO1xuICogICAgICAgcmV0dXJuIHsgZGF0YTogbmV3RGF0YSwgaGFzTW9yZTogb3B0aW9ucy5wYWdlIDwgMTAgfTtcbiAqICAgICB9LFxuICogICAgIFtzZWFyY2hUZXh0XSxcbiAqICAgKTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9IG9uU2VhcmNoVGV4dENoYW5nZT17c2V0U2VhcmNoVGV4dH0gcGFnaW5hdGlvbj17cGFnaW5hdGlvbn0+XG4gKiAgICAgICB7ZGF0YT8ubWFwKChpdGVtKSA9PiAoXG4gKiAgICAgICAgIDxMaXN0Lkl0ZW1cbiAqICAgICAgICAgICBrZXk9e2Ake2l0ZW0ucGFnZX0gJHtpdGVtLmluZGV4fSAke2l0ZW0udGV4dH1gfVxuICogICAgICAgICAgIHRpdGxlPXtgUGFnZSAke2l0ZW0ucGFnZX0gSXRlbSAke2l0ZW0uaW5kZXh9YH1cbiAqICAgICAgICAgICBzdWJ0aXRsZT17aXRlbS50ZXh0fVxuICogICAgICAgICAvPlxuICogICAgICAgKSl9XG4gKiAgICAgPC9MaXN0PlxuICogICApO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VDYWNoZWRQcm9taXNlPFQgZXh0ZW5kcyBGdW5jdGlvblJldHVybmluZ1BhZ2luYXRlZFByb21pc2U8W10+PihcbiAgZm46IFQsXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxVbndyYXBSZXR1cm48VD4sIHVuZGVmaW5lZD47XG5leHBvcnQgZnVuY3Rpb24gdXNlQ2FjaGVkUHJvbWlzZTxUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLCBVIGV4dGVuZHMgYW55W10gPSBhbnlbXT4oXG4gIGZuOiBULFxuICBhcmdzOiBQYXJhbWV0ZXJzPFQ+LFxuICBvcHRpb25zPzogQ2FjaGVkUHJvbWlzZU9wdGlvbnM8VCwgVT4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxVbndyYXBSZXR1cm48VD4sIFU+O1xuXG4vKipcbiAqIFdyYXBzIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvbiBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgYW5kIHJldHVybnMgdGhlIHtAbGluayBBc3luY1N0YXRlfSBjb3JyZXNwb25kaW5nIHRvIHRoZSBleGVjdXRpb24gb2YgdGhlIGZ1bmN0aW9uLiBUaGUgbGFzdCB2YWx1ZSB3aWxsIGJlIGtlcHQgYmV0d2VlbiBjb21tYW5kIHJ1bnMuXG4gKlxuICogQHJlbWFyayBUaGUgdmFsdWUgbmVlZHMgdG8gYmUgSlNPTiBzZXJpYWxpemFibGUuXG4gKiBAcmVtYXJrIFRoZSBmdW5jdGlvbiBpcyBhc3N1bWVkIHRvIGJlIGNvbnN0YW50IChlZy4gY2hhbmdpbmcgaXQgd29uJ3QgdHJpZ2dlciBhIHJldmFsaWRhdGlvbikuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgdXNlQ2FjaGVkUHJvbWlzZSB9IGZyb20gJ0ByYXljYXN0L3V0aWxzJztcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKCkge1xuICogICBjb25zdCBhYm9ydGFibGUgPSB1c2VSZWY8QWJvcnRDb250cm9sbGVyPigpO1xuICogICBjb25zdCB7IGlzTG9hZGluZywgZGF0YSwgcmV2YWxpZGF0ZSB9ID0gdXNlQ2FjaGVkUHJvbWlzZShhc3luYyAodXJsOiBzdHJpbmcpID0+IHtcbiAqICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgeyBzaWduYWw6IGFib3J0YWJsZS5jdXJyZW50Py5zaWduYWwgfSk7XG4gKiAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICogICAgIHJldHVybiByZXN1bHRcbiAqICAgfSxcbiAqICAgWydodHRwczovL2FwaS5leGFtcGxlJ10sXG4gKiAgIHtcbiAqICAgICBhYm9ydGFibGVcbiAqICAgfSk7XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxEZXRhaWxcbiAqICAgICAgIGlzTG9hZGluZz17aXNMb2FkaW5nfVxuICogICAgICAgbWFya2Rvd249e2RhdGF9XG4gKiAgICAgICBhY3Rpb25zPXtcbiAqICAgICAgICAgPEFjdGlvblBhbmVsPlxuICogICAgICAgICAgIDxBY3Rpb24gdGl0bGU9XCJSZWxvYWRcIiBvbkFjdGlvbj17KCkgPT4gcmV2YWxpZGF0ZSgpfSAvPlxuICogICAgICAgICA8L0FjdGlvblBhbmVsPlxuICogICAgICAgfVxuICogICAgIC8+XG4gKiAgICk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VDYWNoZWRQcm9taXNlPFQgZXh0ZW5kcyBGdW5jdGlvblJldHVybmluZ1Byb21pc2U8W10+PihcbiAgZm46IFQsXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxVbndyYXBSZXR1cm48VD4sIHVuZGVmaW5lZD47XG5leHBvcnQgZnVuY3Rpb24gdXNlQ2FjaGVkUHJvbWlzZTxUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlLCBVID0gdW5kZWZpbmVkPihcbiAgZm46IFQsXG4gIGFyZ3M6IFBhcmFtZXRlcnM8VD4sXG4gIG9wdGlvbnM/OiBDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPixcbik6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFVud3JhcFJldHVybjxUPiwgVT47XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VDYWNoZWRQcm9taXNlPFxuICBUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlIHwgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBVIGV4dGVuZHMgYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQsXG4+KGZuOiBULCBhcmdzPzogUGFyYW1ldGVyczxUPiwgb3B0aW9ucz86IENhY2hlZFByb21pc2VPcHRpb25zPFQsIFU+KSB7XG4gIC8qKlxuICAgKiBUaGUgaG9vayBnZW5lcmF0ZXMgYSBjYWNoZSBrZXkgZnJvbSB0aGUgcHJvbWlzZSBpdCByZWNlaXZlcyAmIGl0cyBhcmd1bWVudHMuXG4gICAqIFNvbWV0aW1lcyB0aGF0J3Mgbm90IGVub3VnaCB0byBndWFyYW50ZWUgdW5pcXVlbmVzcywgc28gaG9va3MgdGhhdCBidWlsZCBvbiB0b3Agb2YgYHVzZUNhY2hlZFByb21pc2VgIGNhblxuICAgKiB1c2UgYW4gYGludGVybmFsX2NhY2hlS2V5U3VmZml4YCB0byBoZWxwIGl0LlxuICAgKlxuICAgKiBAcmVtYXJrIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cbiAgICovXG4gIGNvbnN0IHtcbiAgICBpbml0aWFsRGF0YSxcbiAgICBrZWVwUHJldmlvdXNEYXRhLFxuICAgIGludGVybmFsX2NhY2hlS2V5U3VmZml4LFxuICAgIC4uLnVzZVByb21pc2VPcHRpb25zXG4gIH06IENhY2hlZFByb21pc2VPcHRpb25zPFQsIFU+ICYgeyBpbnRlcm5hbF9jYWNoZUtleVN1ZmZpeD86IHN0cmluZyB9ID0gb3B0aW9ucyB8fCB7fTtcbiAgY29uc3QgbGFzdFVwZGF0ZUZyb20gPSB1c2VSZWY8XCJjYWNoZVwiIHwgXCJwcm9taXNlXCI+KG51bGwpO1xuXG4gIGNvbnN0IFtjYWNoZWREYXRhLCBtdXRhdGVDYWNoZV0gPSB1c2VDYWNoZWRTdGF0ZTx0eXBlb2YgZW1wdHlDYWNoZSB8IChVbndyYXBSZXR1cm48VD4gfCBVKT4oXG4gICAgaGFzaChhcmdzIHx8IFtdKSArIGludGVybmFsX2NhY2hlS2V5U3VmZml4LFxuICAgIGVtcHR5Q2FjaGUsXG4gICAge1xuICAgICAgY2FjaGVOYW1lc3BhY2U6IGhhc2goZm4pLFxuICAgIH0sXG4gICk7XG5cbiAgLy8gVXNlIGEgcmVmIHRvIHN0b3JlIHByZXZpb3VzIHJldHVybmVkIGRhdGEuIFVzZSB0aGUgaW5pdGFsIGRhdGEgYXMgaXRzIGluaXRhbCB2YWx1ZSBmcm9tIHRoZSBjYWNoZS5cbiAgY29uc3QgbGFnZ3lEYXRhUmVmID0gdXNlUmVmPEF3YWl0ZWQ8UmV0dXJuVHlwZTxUPj4gfCBVPihjYWNoZWREYXRhICE9PSBlbXB0eUNhY2hlID8gY2FjaGVkRGF0YSA6IChpbml0aWFsRGF0YSBhcyBVKSk7XG4gIGNvbnN0IHBhZ2luYXRpb25BcmdzUmVmID0gdXNlUmVmPFBhZ2luYXRpb25PcHRpb25zPFVud3JhcFJldHVybjxUPiB8IFU+IHwgdW5kZWZpbmVkPih1bmRlZmluZWQpO1xuXG4gIGNvbnN0IHtcbiAgICBtdXRhdGU6IF9tdXRhdGUsXG4gICAgcmV2YWxpZGF0ZSxcbiAgICAuLi5zdGF0ZVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgZm4gaGFzIHRoZSBzYW1lIHNpZ25hdHVyZSBpbiBib3RoIHVzZVByb21pc2UgYW5kIHVzZUNhY2hlZFByb21pc2VcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICB9ID0gdXNlUHJvbWlzZShmbiwgYXJncyB8fCAoW10gYXMgYW55IGFzIFBhcmFtZXRlcnM8VD4pLCB7XG4gICAgLi4udXNlUHJvbWlzZU9wdGlvbnMsXG4gICAgb25EYXRhKGRhdGEsIHBhZ2luYXRpb24pIHtcbiAgICAgIHBhZ2luYXRpb25BcmdzUmVmLmN1cnJlbnQgPSBwYWdpbmF0aW9uO1xuICAgICAgaWYgKHVzZVByb21pc2VPcHRpb25zLm9uRGF0YSkge1xuICAgICAgICB1c2VQcm9taXNlT3B0aW9ucy5vbkRhdGEoZGF0YSwgcGFnaW5hdGlvbik7XG4gICAgICB9XG4gICAgICBpZiAocGFnaW5hdGlvbiAmJiBwYWdpbmF0aW9uLnBhZ2UgPiAwKSB7XG4gICAgICAgIC8vIGRvbid0IGNhY2hlIGJleW9uZCB0aGUgZmlyc3QgcGFnZVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsYXN0VXBkYXRlRnJvbS5jdXJyZW50ID0gXCJwcm9taXNlXCI7XG4gICAgICBsYWdneURhdGFSZWYuY3VycmVudCA9IGRhdGE7XG4gICAgICBtdXRhdGVDYWNoZShkYXRhKTtcbiAgICB9LFxuICB9KTtcblxuICBsZXQgcmV0dXJuZWREYXRhOiBVIHwgQXdhaXRlZDxSZXR1cm5UeXBlPFQ+PiB8IFVud3JhcFJldHVybjxUPjtcbiAgY29uc3QgcGFnaW5hdGlvbiA9IHN0YXRlLnBhZ2luYXRpb247XG4gIC8vIHdoZW4gcGFnaW5hdGluZywgb25seSB0aGUgZmlyc3QgcGFnZSBnZXRzIGNhY2hlZCwgc28gd2UgcmV0dXJuIHRoZSBkYXRhIHdlIGdldCBmcm9tIGB1c2VQcm9taXNlYCwgYmVjYXVzZVxuICAvLyBpdCB3aWxsIGJlIGFjY3VtdWxhdGVkLlxuICBpZiAocGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudCAmJiBwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50LnBhZ2UgPiAwICYmIHN0YXRlLmRhdGEpIHtcbiAgICByZXR1cm5lZERhdGEgPSBzdGF0ZS5kYXRhIGFzIFVud3JhcFJldHVybjxUPjtcbiAgICAvLyBpZiB0aGUgbGF0ZXN0IHVwZGF0ZSBpZiBmcm9tIHRoZSBQcm9taXNlLCB3ZSBrZWVwIGl0XG4gIH0gZWxzZSBpZiAobGFzdFVwZGF0ZUZyb20uY3VycmVudCA9PT0gXCJwcm9taXNlXCIpIHtcbiAgICByZXR1cm5lZERhdGEgPSBsYWdneURhdGFSZWYuY3VycmVudDtcbiAgfSBlbHNlIGlmIChrZWVwUHJldmlvdXNEYXRhICYmIGNhY2hlZERhdGEgIT09IGVtcHR5Q2FjaGUpIHtcbiAgICAvLyBpZiB3ZSB3YW50IHRvIGtlZXAgdGhlIGxhdGVzdCBkYXRhLCB3ZSBwaWNrIHRoZSBjYWNoZSBidXQgb25seSBpZiBpdCdzIG5vdCBlbXB0eVxuICAgIHJldHVybmVkRGF0YSA9IGNhY2hlZERhdGE7XG4gICAgaWYgKHBhZ2luYXRpb24pIHtcbiAgICAgIHBhZ2luYXRpb24uaGFzTW9yZSA9IHRydWU7XG4gICAgICBwYWdpbmF0aW9uLnBhZ2VTaXplID0gY2FjaGVkRGF0YS5sZW5ndGg7XG4gICAgfVxuICB9IGVsc2UgaWYgKGtlZXBQcmV2aW91c0RhdGEgJiYgY2FjaGVkRGF0YSA9PT0gZW1wdHlDYWNoZSkge1xuICAgIC8vIGlmIHRoZSBjYWNoZSBpcyBlbXB0eSwgd2Ugd2lsbCByZXR1cm4gdGhlIHByZXZpb3VzIGRhdGFcbiAgICByZXR1cm5lZERhdGEgPSBsYWdneURhdGFSZWYuY3VycmVudDtcbiAgICAvLyB0aGVyZSBhcmUgbm8gc3BlY2lhbCBjYXNlcywgc28gZWl0aGVyIHJldHVybiB0aGUgY2FjaGUgb3IgaW5pdGlhbCBkYXRhXG4gIH0gZWxzZSBpZiAoY2FjaGVkRGF0YSAhPT0gZW1wdHlDYWNoZSkge1xuICAgIHJldHVybmVkRGF0YSA9IGNhY2hlZERhdGE7XG4gICAgaWYgKHBhZ2luYXRpb24pIHtcbiAgICAgIHBhZ2luYXRpb24uaGFzTW9yZSA9IHRydWU7XG4gICAgICBwYWdpbmF0aW9uLnBhZ2VTaXplID0gY2FjaGVkRGF0YS5sZW5ndGg7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybmVkRGF0YSA9IGluaXRpYWxEYXRhIGFzIFU7XG4gIH1cblxuICBjb25zdCBsYXRlc3REYXRhID0gdXNlTGF0ZXN0KHJldHVybmVkRGF0YSk7XG5cbiAgLy8gd2UgcmV3cml0ZSB0aGUgbXV0YXRlIGZ1bmN0aW9uIHRvIHVwZGF0ZSB0aGUgY2FjaGUgaW5zdGVhZFxuICBjb25zdCBtdXRhdGUgPSB1c2VDYWxsYmFjazxNdXRhdGVQcm9taXNlPEF3YWl0ZWQ8UmV0dXJuVHlwZTxUPj4gfCBVPj4oXG4gICAgYXN5bmMgKGFzeW5jVXBkYXRlLCBvcHRpb25zKSA9PiB7XG4gICAgICBsZXQgZGF0YUJlZm9yZU9wdGltaXN0aWNVcGRhdGU7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAob3B0aW9ucz8ub3B0aW1pc3RpY1VwZGF0ZSkge1xuICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yICE9PSBcImZ1bmN0aW9uXCIgJiYgb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgLy8ga2VlcCB0cmFjayBvZiB0aGUgZGF0YSBiZWZvcmUgdGhlIG9wdGltaXN0aWMgdXBkYXRlLFxuICAgICAgICAgICAgLy8gYnV0IG9ubHkgaWYgd2UgbmVlZCBpdCAoZWcuIG9ubHkgd2hlbiB3ZSB3YW50IHRvIGF1dG9tYXRpY2FsbHkgcm9sbGJhY2sgYWZ0ZXIpXG4gICAgICAgICAgICBkYXRhQmVmb3JlT3B0aW1pc3RpY1VwZGF0ZSA9IHN0cnVjdHVyZWRDbG9uZShsYXRlc3REYXRhLmN1cnJlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBkYXRhID0gb3B0aW9ucy5vcHRpbWlzdGljVXBkYXRlKGxhdGVzdERhdGEuY3VycmVudCk7XG4gICAgICAgICAgbGFzdFVwZGF0ZUZyb20uY3VycmVudCA9IFwiY2FjaGVcIjtcbiAgICAgICAgICBsYWdneURhdGFSZWYuY3VycmVudCA9IGRhdGE7XG4gICAgICAgICAgbXV0YXRlQ2FjaGUoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF3YWl0IF9tdXRhdGUoYXN5bmNVcGRhdGUsIHsgc2hvdWxkUmV2YWxpZGF0ZUFmdGVyOiBvcHRpb25zPy5zaG91bGRSZXZhbGlkYXRlQWZ0ZXIgfSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zPy5yb2xsYmFja09uRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSBvcHRpb25zLnJvbGxiYWNrT25FcnJvcihsYXRlc3REYXRhLmN1cnJlbnQpO1xuICAgICAgICAgIGxhc3RVcGRhdGVGcm9tLmN1cnJlbnQgPSBcImNhY2hlXCI7XG4gICAgICAgICAgbGFnZ3lEYXRhUmVmLmN1cnJlbnQgPSBkYXRhO1xuICAgICAgICAgIG11dGF0ZUNhY2hlKGRhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnM/Lm9wdGltaXN0aWNVcGRhdGUgJiYgb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yICE9PSBmYWxzZSkge1xuICAgICAgICAgIGxhc3RVcGRhdGVGcm9tLmN1cnJlbnQgPSBcImNhY2hlXCI7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB3aGVuIHVuZGVmaW5lZCwgaXQncyBleHBlY3RlZFxuICAgICAgICAgIGxhZ2d5RGF0YVJlZi5jdXJyZW50ID0gZGF0YUJlZm9yZU9wdGltaXN0aWNVcGRhdGU7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB3aGVuIHVuZGVmaW5lZCwgaXQncyBleHBlY3RlZFxuICAgICAgICAgIG11dGF0ZUNhY2hlKGRhdGFCZWZvcmVPcHRpbWlzdGljVXBkYXRlKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfSxcbiAgICBbbXV0YXRlQ2FjaGUsIF9tdXRhdGUsIGxhdGVzdERhdGEsIGxhZ2d5RGF0YVJlZiwgbGFzdFVwZGF0ZUZyb21dLFxuICApO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGNhY2hlZERhdGEgIT09IGVtcHR5Q2FjaGUpIHtcbiAgICAgIGxhc3RVcGRhdGVGcm9tLmN1cnJlbnQgPSBcImNhY2hlXCI7XG4gICAgICBsYWdneURhdGFSZWYuY3VycmVudCA9IGNhY2hlZERhdGE7XG4gICAgfVxuICB9LCBbY2FjaGVkRGF0YV0pO1xuXG4gIHJldHVybiB7XG4gICAgZGF0YTogcmV0dXJuZWREYXRhLFxuICAgIGlzTG9hZGluZzogc3RhdGUuaXNMb2FkaW5nLFxuICAgIGVycm9yOiBzdGF0ZS5lcnJvcixcbiAgICBtdXRhdGU6IHBhZ2luYXRpb25BcmdzUmVmLmN1cnJlbnQgJiYgcGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudC5wYWdlID4gMCA/IF9tdXRhdGUgOiBtdXRhdGUsXG4gICAgcGFnaW5hdGlvbixcbiAgICByZXZhbGlkYXRlLFxuICB9O1xufVxuIiwgImltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VNZW1vLCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZUNhY2hlZFByb21pc2UsIENhY2hlZFByb21pc2VPcHRpb25zIH0gZnJvbSBcIi4vdXNlQ2FjaGVkUHJvbWlzZVwiO1xuaW1wb3J0IHsgdXNlTGF0ZXN0IH0gZnJvbSBcIi4vdXNlTGF0ZXN0XCI7XG5pbXBvcnQgeyBGdW5jdGlvblJldHVybmluZ1BhZ2luYXRlZFByb21pc2UsIEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZSwgVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGUgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgaXNKU09OIH0gZnJvbSBcIi4vZmV0Y2gtdXRpbHNcIjtcbmltcG9ydCB7IGhhc2ggfSBmcm9tIFwiLi9oZWxwZXJzXCI7XG5cbmFzeW5jIGZ1bmN0aW9uIGRlZmF1bHRQYXJzaW5nKHJlc3BvbnNlOiBSZXNwb25zZSkge1xuICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpO1xuICB9XG5cbiAgY29uc3QgY29udGVudFR5cGVIZWFkZXIgPSByZXNwb25zZS5oZWFkZXJzLmdldChcImNvbnRlbnQtdHlwZVwiKTtcblxuICBpZiAoY29udGVudFR5cGVIZWFkZXIgJiYgaXNKU09OKGNvbnRlbnRUeXBlSGVhZGVyKSkge1xuICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gIH1cbiAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdE1hcHBpbmc8ViwgVCBleHRlbmRzIHVua25vd25bXT4ocmVzdWx0OiBWKTogeyBkYXRhOiBUOyBoYXNNb3JlPzogYm9vbGVhbjsgY3Vyc29yPzogYW55IH0ge1xuICByZXR1cm4geyBkYXRhOiByZXN1bHQgYXMgdW5rbm93biBhcyBULCBoYXNNb3JlOiBmYWxzZSB9O1xufVxuXG50eXBlIFJlcXVlc3RJbmZvID0gc3RyaW5nIHwgVVJMIHwgZ2xvYmFsVGhpcy5SZXF1ZXN0O1xudHlwZSBQYWdpbmF0ZWRSZXF1ZXN0SW5mbyA9IChwYWdpbmF0aW9uOiB7IHBhZ2U6IG51bWJlcjsgbGFzdEl0ZW0/OiBhbnk7IGN1cnNvcj86IGFueSB9KSA9PiBSZXF1ZXN0SW5mbztcblxuLyoqXG4gKiBGZXRjaGVzIHRoZSBwYWdpbmF0ZWRVUkwgYW5kIHJldHVybnMgdGhlIHtAbGluayBBc3luY1N0YXRlfSBjb3JyZXNwb25kaW5nIHRvIHRoZSBleGVjdXRpb24gb2YgdGhlIGZldGNoLiBUaGUgbGFzdCB2YWx1ZSB3aWxsIGJlIGtlcHQgYmV0d2VlbiBjb21tYW5kIHJ1bnMuXG4gKlxuICogQHJlbWFyayBUaGlzIG92ZXJsb2FkIHNob3VsZCBiZSB1c2VkIHdoZW4gd29ya2luZyB3aXRoIHBhZ2luYXRlZCBkYXRhIHNvdXJjZXMuXG4gKiBAcmVtYXJrIFdoZW4gcGFnaW5hdGluZywgb25seSB0aGUgZmlyc3QgcGFnZSB3aWxsIGJlIGNhY2hlZC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyBJY29uLCBJbWFnZSwgTGlzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZUZldGNoIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKiBpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuICpcbiAqIHR5cGUgU2VhcmNoUmVzdWx0ID0geyBjb21wYW5pZXM6IENvbXBhbnlbXTsgcGFnZTogbnVtYmVyOyB0b3RhbFBhZ2VzOiBudW1iZXIgfTtcbiAqIHR5cGUgQ29tcGFueSA9IHsgaWQ6IG51bWJlcjsgbmFtZTogc3RyaW5nOyBzbWFsbExvZ29Vcmw/OiBzdHJpbmcgfTtcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IFtzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICogICBjb25zdCB7IGlzTG9hZGluZywgZGF0YSwgcGFnaW5hdGlvbiB9ID0gdXNlRmV0Y2goXG4gKiAgICAgKG9wdGlvbnMpID0+XG4gKiAgICAgICBcImh0dHBzOi8vYXBpLnljb21iaW5hdG9yLmNvbS92MC4xL2NvbXBhbmllcz9cIiArXG4gKiAgICAgICBuZXcgVVJMU2VhcmNoUGFyYW1zKHsgcGFnZTogU3RyaW5nKG9wdGlvbnMucGFnZSArIDEpLCBxOiBzZWFyY2hUZXh0IH0pLnRvU3RyaW5nKCksXG4gKiAgICAge1xuICogICAgICAgbWFwUmVzdWx0KHJlc3VsdDogU2VhcmNoUmVzdWx0KSB7XG4gKiAgICAgICAgIHJldHVybiB7XG4gKiAgICAgICAgICAgZGF0YTogcmVzdWx0LmNvbXBhbmllcyxcbiAqICAgICAgICAgICBoYXNNb3JlOiByZXN1bHQucGFnZSA8IHJlc3VsdC50b3RhbFBhZ2VzLFxuICogICAgICAgICB9O1xuICogICAgICAgfSxcbiAqICAgICAgIGtlZXBQcmV2aW91c0RhdGE6IHRydWUsXG4gKiAgICAgICBpbml0aWFsRGF0YTogW10sXG4gKiAgICAgfSxcbiAqICAgKTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9IHBhZ2luYXRpb249e3BhZ2luYXRpb259IG9uU2VhcmNoVGV4dENoYW5nZT17c2V0U2VhcmNoVGV4dH0+XG4gKiAgICAgICB7ZGF0YS5tYXAoKGNvbXBhbnkpID0+IChcbiAqICAgICAgICAgPExpc3QuSXRlbVxuICogICAgICAgICAgIGtleT17Y29tcGFueS5pZH1cbiAqICAgICAgICAgICBpY29uPXt7IHNvdXJjZTogY29tcGFueS5zbWFsbExvZ29VcmwgPz8gSWNvbi5NaW51c0NpcmNsZSwgbWFzazogSW1hZ2UuTWFzay5Sb3VuZGVkUmVjdGFuZ2xlIH19XG4gKiAgICAgICAgICAgdGl0bGU9e2NvbXBhbnkubmFtZX1cbiAqICAgICAgICAgLz5cbiAqICAgICAgICkpfVxuICogICAgIDwvTGlzdD5cbiAqICAgKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRmV0Y2g8ViA9IHVua25vd24sIFUgPSB1bmRlZmluZWQsIFQgZXh0ZW5kcyB1bmtub3duW10gPSB1bmtub3duW10+KFxuICB1cmw6IFBhZ2luYXRlZFJlcXVlc3RJbmZvLFxuICBvcHRpb25zOiBSZXF1ZXN0SW5pdCAmIHtcbiAgICBtYXBSZXN1bHQ6IChyZXN1bHQ6IFYpID0+IHsgZGF0YTogVDsgaGFzTW9yZT86IGJvb2xlYW47IGN1cnNvcj86IGFueSB9O1xuICAgIHBhcnNlUmVzcG9uc2U/OiAocmVzcG9uc2U6IFJlc3BvbnNlKSA9PiBQcm9taXNlPFY+O1xuICB9ICYgT21pdDxDYWNoZWRQcm9taXNlT3B0aW9uczwodXJsOiBSZXF1ZXN0SW5mbywgb3B0aW9ucz86IFJlcXVlc3RJbml0KSA9PiBQcm9taXNlPFQ+LCBVPiwgXCJhYm9ydGFibGVcIj4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxULCBVPjtcbi8qKlxuICogRmV0Y2ggdGhlIFVSTCBhbmQgcmV0dXJucyB0aGUge0BsaW5rIEFzeW5jU3RhdGV9IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGV4ZWN1dGlvbiBvZiB0aGUgZmV0Y2guIFRoZSBsYXN0IHZhbHVlIHdpbGwgYmUga2VwdCBiZXR3ZWVuIGNvbW1hbmQgcnVucy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyB1c2VGZXRjaCB9IGZyb20gJ0ByYXljYXN0L3V0aWxzJztcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKCkge1xuICogICBjb25zdCB7IGlzTG9hZGluZywgZGF0YSwgcmV2YWxpZGF0ZSB9ID0gdXNlRmV0Y2goJ2h0dHBzOi8vYXBpLmV4YW1wbGUnKTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPERldGFpbFxuICogICAgICAgaXNMb2FkaW5nPXtpc0xvYWRpbmd9XG4gKiAgICAgICBtYXJrZG93bj17ZGF0YX1cbiAqICAgICAgIGFjdGlvbnM9e1xuICogICAgICAgICA8QWN0aW9uUGFuZWw+XG4gKiAgICAgICAgICAgPEFjdGlvbiB0aXRsZT1cIlJlbG9hZFwiIG9uQWN0aW9uPXsoKSA9PiByZXZhbGlkYXRlKCl9IC8+XG4gKiAgICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gKiAgICAgICB9XG4gKiAgICAgLz5cbiAqICAgKTtcbiAqIH07XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUZldGNoPFYgPSB1bmtub3duLCBVID0gdW5kZWZpbmVkLCBUID0gVj4oXG4gIHVybDogUmVxdWVzdEluZm8sXG4gIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCAmIHtcbiAgICBtYXBSZXN1bHQ/OiAocmVzdWx0OiBWKSA9PiB7IGRhdGE6IFQ7IGhhc01vcmU/OiBib29sZWFuOyBjdXJzb3I/OiBhbnkgfTtcbiAgICBwYXJzZVJlc3BvbnNlPzogKHJlc3BvbnNlOiBSZXNwb25zZSkgPT4gUHJvbWlzZTxWPjtcbiAgfSAmIE9taXQ8Q2FjaGVkUHJvbWlzZU9wdGlvbnM8KHVybDogUmVxdWVzdEluZm8sIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCkgPT4gUHJvbWlzZTxUPiwgVT4sIFwiYWJvcnRhYmxlXCI+LFxuKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VCwgVT4gJiB7IHBhZ2luYXRpb246IHVuZGVmaW5lZCB9O1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlRmV0Y2g8ViA9IHVua25vd24sIFUgPSB1bmRlZmluZWQsIFQgZXh0ZW5kcyB1bmtub3duW10gPSB1bmtub3duW10+KFxuICB1cmw6IFJlcXVlc3RJbmZvIHwgUGFnaW5hdGVkUmVxdWVzdEluZm8sXG4gIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCAmIHtcbiAgICBtYXBSZXN1bHQ/OiAocmVzdWx0OiBWKSA9PiB7IGRhdGE6IFQ7IGhhc01vcmU/OiBib29sZWFuOyBjdXJzb3I/OiBhbnkgfTtcbiAgICBwYXJzZVJlc3BvbnNlPzogKHJlc3BvbnNlOiBSZXNwb25zZSkgPT4gUHJvbWlzZTxWPjtcbiAgfSAmIE9taXQ8Q2FjaGVkUHJvbWlzZU9wdGlvbnM8KHVybDogUmVxdWVzdEluZm8sIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCkgPT4gUHJvbWlzZTxUPiwgVT4sIFwiYWJvcnRhYmxlXCI+LFxuKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VCwgVT4ge1xuICBjb25zdCB7XG4gICAgcGFyc2VSZXNwb25zZSxcbiAgICBtYXBSZXN1bHQsXG4gICAgaW5pdGlhbERhdGEsXG4gICAgZXhlY3V0ZSxcbiAgICBrZWVwUHJldmlvdXNEYXRhLFxuICAgIG9uRXJyb3IsXG4gICAgb25EYXRhLFxuICAgIG9uV2lsbEV4ZWN1dGUsXG4gICAgZmFpbHVyZVRvYXN0T3B0aW9ucyxcbiAgICAuLi5mZXRjaE9wdGlvbnNcbiAgfSA9IG9wdGlvbnMgfHwge307XG5cbiAgY29uc3QgdXNlQ2FjaGVkUHJvbWlzZU9wdGlvbnM6IENhY2hlZFByb21pc2VPcHRpb25zPCh1cmw6IFJlcXVlc3RJbmZvLCBvcHRpb25zPzogUmVxdWVzdEluaXQpID0+IFByb21pc2U8VD4sIFU+ID0ge1xuICAgIGluaXRpYWxEYXRhLFxuICAgIGV4ZWN1dGUsXG4gICAga2VlcFByZXZpb3VzRGF0YSxcbiAgICBvbkVycm9yLFxuICAgIG9uRGF0YSxcbiAgICBvbldpbGxFeGVjdXRlLFxuICAgIGZhaWx1cmVUb2FzdE9wdGlvbnMsXG4gIH07XG5cbiAgY29uc3QgcGFyc2VSZXNwb25zZVJlZiA9IHVzZUxhdGVzdChwYXJzZVJlc3BvbnNlIHx8IGRlZmF1bHRQYXJzaW5nKTtcbiAgY29uc3QgbWFwUmVzdWx0UmVmID0gdXNlTGF0ZXN0KG1hcFJlc3VsdCB8fCBkZWZhdWx0TWFwcGluZyk7XG4gIGNvbnN0IHVybFJlZiA9IHVzZVJlZjxSZXF1ZXN0SW5mbyB8IFBhZ2luYXRlZFJlcXVlc3RJbmZvPihudWxsKTtcbiAgY29uc3QgZmlyc3RQYWdlVXJsUmVmID0gdXNlUmVmPFJlcXVlc3RJbmZvIHwgdW5kZWZpbmVkPihudWxsKTtcbiAgY29uc3QgZmlyc3RQYWdlVXJsID0gdHlwZW9mIHVybCA9PT0gXCJmdW5jdGlvblwiID8gdXJsKHsgcGFnZTogMCB9KSA6IHVuZGVmaW5lZDtcbiAgLyoqXG4gICAqIFdoZW4gcGFnaW5hdGluZywgYHVybGAgaXMgYSBgUGFnaW5hdGVkUmVxdWVzdEluZm9gLCBzbyB3ZSBvbmx5IHdhbnQgdG8gdXBkYXRlIHRoZSByZWYgd2hlbiB0aGUgYGZpcnN0UGFnZVVybGAgY2hhbmdlcy5cbiAgICogV2hlbiBub3QgcGFnaW5hdGluZywgYHVybGAgaXMgYSBgUmVxdWVzdEluZm9gLCBzbyB3ZSB3YW50IHRvIHVwZGF0ZSB0aGUgcmVmIHdoZW5ldmVyIGB1cmxgIGNoYW5nZXMuXG4gICAqL1xuICBpZiAoIXVybFJlZi5jdXJyZW50IHx8IHR5cGVvZiBmaXJzdFBhZ2VVcmxSZWYuY3VycmVudCA9PT0gXCJ1bmRlZmluZWRcIiB8fCBmaXJzdFBhZ2VVcmxSZWYuY3VycmVudCAhPT0gZmlyc3RQYWdlVXJsKSB7XG4gICAgdXJsUmVmLmN1cnJlbnQgPSB1cmw7XG4gIH1cbiAgZmlyc3RQYWdlVXJsUmVmLmN1cnJlbnQgPSBmaXJzdFBhZ2VVcmw7XG4gIGNvbnN0IGFib3J0YWJsZSA9IHVzZVJlZjxBYm9ydENvbnRyb2xsZXI+KG51bGwpO1xuXG4gIGNvbnN0IHBhZ2luYXRlZEZuOiBGdW5jdGlvblJldHVybmluZ1BhZ2luYXRlZFByb21pc2U8W1BhZ2luYXRlZFJlcXVlc3RJbmZvLCB0eXBlb2YgZmV0Y2hPcHRpb25zXSwgVD4gPSB1c2VDYWxsYmFjayhcbiAgICAodXJsOiBQYWdpbmF0ZWRSZXF1ZXN0SW5mbywgb3B0aW9ucz86IFJlcXVlc3RJbml0KSA9PiBhc3luYyAocGFnaW5hdGlvbjogeyBwYWdlOiBudW1iZXIgfSkgPT4ge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsKHBhZ2luYXRpb24pLCB7IHNpZ25hbDogYWJvcnRhYmxlLmN1cnJlbnQ/LnNpZ25hbCwgLi4ub3B0aW9ucyB9KTtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IChhd2FpdCBwYXJzZVJlc3BvbnNlUmVmLmN1cnJlbnQocmVzKSkgYXMgVjtcbiAgICAgIHJldHVybiBtYXBSZXN1bHRSZWYuY3VycmVudD8uKHBhcnNlZCk7XG4gICAgfSxcbiAgICBbcGFyc2VSZXNwb25zZVJlZiwgbWFwUmVzdWx0UmVmXSxcbiAgKTtcbiAgY29uc3QgZm46IEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZTxbUmVxdWVzdEluZm8sIFJlcXVlc3RJbml0P10sIFQ+ID0gdXNlQ2FsbGJhY2soXG4gICAgYXN5bmMgKHVybDogUmVxdWVzdEluZm8sIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCkgPT4ge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsLCB7IHNpZ25hbDogYWJvcnRhYmxlLmN1cnJlbnQ/LnNpZ25hbCwgLi4ub3B0aW9ucyB9KTtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IChhd2FpdCBwYXJzZVJlc3BvbnNlUmVmLmN1cnJlbnQocmVzKSkgYXMgVjtcbiAgICAgIGNvbnN0IG1hcHBlZCA9IG1hcFJlc3VsdFJlZi5jdXJyZW50KHBhcnNlZCk7XG4gICAgICByZXR1cm4gbWFwcGVkPy5kYXRhIGFzIHVua25vd24gYXMgVDtcbiAgICB9LFxuICAgIFtwYXJzZVJlc3BvbnNlUmVmLCBtYXBSZXN1bHRSZWZdLFxuICApO1xuXG4gIGNvbnN0IHByb21pc2UgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoZmlyc3RQYWdlVXJsUmVmLmN1cnJlbnQpIHtcbiAgICAgIHJldHVybiBwYWdpbmF0ZWRGbjtcbiAgICB9XG4gICAgcmV0dXJuIGZuO1xuICB9LCBbZmlyc3RQYWdlVXJsUmVmLCBmbiwgcGFnaW5hdGVkRm5dKTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yIGxhc3RJdGVtIGNhbid0IGJlIGluZmVycmVkIHByb3Blcmx5XG4gIHJldHVybiB1c2VDYWNoZWRQcm9taXNlKHByb21pc2UsIFt1cmxSZWYuY3VycmVudCBhcyBQYWdpbmF0ZWRSZXF1ZXN0SW5mbywgZmV0Y2hPcHRpb25zXSwge1xuICAgIC4uLnVzZUNhY2hlZFByb21pc2VPcHRpb25zLFxuICAgIGludGVybmFsX2NhY2hlS2V5U3VmZml4OiBmaXJzdFBhZ2VVcmxSZWYuY3VycmVudCArIGhhc2gobWFwUmVzdWx0UmVmLmN1cnJlbnQpICsgaGFzaChwYXJzZVJlc3BvbnNlUmVmLmN1cnJlbnQpLFxuICAgIGFib3J0YWJsZSxcbiAgfSk7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGlzSlNPTihjb250ZW50VHlwZUhlYWRlcjogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuICBpZiAoY29udGVudFR5cGVIZWFkZXIpIHtcbiAgICBjb25zdCBtZWRpYVR5cGUgPSBwYXJzZUNvbnRlbnRUeXBlKGNvbnRlbnRUeXBlSGVhZGVyKTtcblxuICAgIGlmICghbWVkaWFUeXBlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKG1lZGlhVHlwZS5zdWJ0eXBlID09PSBcImpzb25cIikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG1lZGlhVHlwZS5zdWZmaXggPT09IFwianNvblwiKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAobWVkaWFUeXBlLnN1ZmZpeCAmJiAvXFxianNvblxcYi9pLnRlc3QobWVkaWFUeXBlLnN1ZmZpeCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChtZWRpYVR5cGUuc3VidHlwZSAmJiAvXFxianNvblxcYi9pLnRlc3QobWVkaWFUeXBlLnN1YnR5cGUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFJlZ0V4cCB0byBtYXRjaCB0eXBlIGluIFJGQyA2ODM4IHdpdGggYW4gb3B0aW9uYWwgdHJhaWxpbmcgYDtgIGJlY2F1c2Ugc29tZSBBcHBsZSBBUElzIHJldHVybnMgb25lLi4uXG4gKlxuICogdHlwZS1uYW1lID0gcmVzdHJpY3RlZC1uYW1lXG4gKiBzdWJ0eXBlLW5hbWUgPSByZXN0cmljdGVkLW5hbWVcbiAqIHJlc3RyaWN0ZWQtbmFtZSA9IHJlc3RyaWN0ZWQtbmFtZS1maXJzdCAqMTI2cmVzdHJpY3RlZC1uYW1lLWNoYXJzXG4gKiByZXN0cmljdGVkLW5hbWUtZmlyc3QgID0gQUxQSEEgLyBESUdJVFxuICogcmVzdHJpY3RlZC1uYW1lLWNoYXJzICA9IEFMUEhBIC8gRElHSVQgLyBcIiFcIiAvIFwiI1wiIC9cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRcIiAvIFwiJlwiIC8gXCItXCIgLyBcIl5cIiAvIFwiX1wiXG4gKiByZXN0cmljdGVkLW5hbWUtY2hhcnMgPS8gXCIuXCIgOyBDaGFyYWN0ZXJzIGJlZm9yZSBmaXJzdCBkb3QgYWx3YXlzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDsgc3BlY2lmeSBhIGZhY2V0IG5hbWVcbiAqIHJlc3RyaWN0ZWQtbmFtZS1jaGFycyA9LyBcIitcIiA7IENoYXJhY3RlcnMgYWZ0ZXIgbGFzdCBwbHVzIGFsd2F5c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7IHNwZWNpZnkgYSBzdHJ1Y3R1cmVkIHN5bnRheCBzdWZmaXhcbiAqIEFMUEhBID0gICV4NDEtNUEgLyAleDYxLTdBICAgOyBBLVogLyBhLXpcbiAqIERJR0lUID0gICV4MzAtMzkgICAgICAgICAgICAgOyAwLTlcbiAqL1xuY29uc3QgTUVESUFfVFlQRV9SRUdFWFAgPSAvXihbQS1aYS16MC05XVtBLVphLXowLTkhIyQmXl8tXXswLDEyNn0pXFwvKFtBLVphLXowLTldW0EtWmEtejAtOSEjJCZeXy4rLV17MCwxMjZ9KTs/JC87XG5cbmZ1bmN0aW9uIHBhcnNlQ29udGVudFR5cGUoaGVhZGVyOiBzdHJpbmcpIHtcbiAgY29uc3QgaGVhZGVyRGVsaW1pdGF0aW9uaW5kZXggPSBoZWFkZXIuaW5kZXhPZihcIjtcIik7XG4gIGNvbnN0IGNvbnRlbnRUeXBlID0gaGVhZGVyRGVsaW1pdGF0aW9uaW5kZXggIT09IC0xID8gaGVhZGVyLnNsaWNlKDAsIGhlYWRlckRlbGltaXRhdGlvbmluZGV4KS50cmltKCkgOiBoZWFkZXIudHJpbSgpO1xuXG4gIGNvbnN0IG1hdGNoID0gTUVESUFfVFlQRV9SRUdFWFAuZXhlYyhjb250ZW50VHlwZS50b0xvd2VyQ2FzZSgpLnRvTG93ZXJDYXNlKCkpO1xuXG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB0eXBlID0gbWF0Y2hbMV07XG4gIGxldCBzdWJ0eXBlID0gbWF0Y2hbMl07XG4gIGxldCBzdWZmaXg7XG5cbiAgLy8gc3VmZml4IGFmdGVyIGxhc3QgK1xuICBjb25zdCBpbmRleCA9IHN1YnR5cGUubGFzdEluZGV4T2YoXCIrXCIpO1xuICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgc3VmZml4ID0gc3VidHlwZS5zdWJzdHJpbmcoaW5kZXggKyAxKTtcbiAgICBzdWJ0eXBlID0gc3VidHlwZS5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuICB9XG5cbiAgcmV0dXJuIHsgdHlwZSwgc3VidHlwZSwgc3VmZml4IH07XG59XG4iLCAiLypcbiAqIEluc3BpcmVkIGJ5IEV4ZWNhXG4gKi9cblxuaW1wb3J0IGNoaWxkUHJvY2VzcyBmcm9tIFwibm9kZTpjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgeyB1c2VDYWxsYmFjaywgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IHVzZUNhY2hlZFByb21pc2UsIENhY2hlZFByb21pc2VPcHRpb25zIH0gZnJvbSBcIi4vdXNlQ2FjaGVkUHJvbWlzZVwiO1xuaW1wb3J0IHsgdXNlTGF0ZXN0IH0gZnJvbSBcIi4vdXNlTGF0ZXN0XCI7XG5pbXBvcnQgeyBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQge1xuICBnZXRTcGF3bmVkUHJvbWlzZSxcbiAgZ2V0U3Bhd25lZFJlc3VsdCxcbiAgaGFuZGxlT3V0cHV0LFxuICBkZWZhdWx0UGFyc2luZyxcbiAgUGFyc2VFeGVjT3V0cHV0SGFuZGxlcixcbn0gZnJvbSBcIi4vZXhlYy11dGlsc1wiO1xuXG50eXBlIEV4ZWNPcHRpb25zID0ge1xuICAvKipcbiAgICogSWYgYHRydWVgLCBydW5zIHRoZSBjb21tYW5kIGluc2lkZSBvZiBhIHNoZWxsLiBVc2VzIGAvYmluL3NoYC4gQSBkaWZmZXJlbnQgc2hlbGwgY2FuIGJlIHNwZWNpZmllZCBhcyBhIHN0cmluZy4gVGhlIHNoZWxsIHNob3VsZCB1bmRlcnN0YW5kIHRoZSBgLWNgIHN3aXRjaC5cbiAgICpcbiAgICogV2UgcmVjb21tZW5kIGFnYWluc3QgdXNpbmcgdGhpcyBvcHRpb24gc2luY2UgaXQgaXM6XG4gICAqIC0gbm90IGNyb3NzLXBsYXRmb3JtLCBlbmNvdXJhZ2luZyBzaGVsbC1zcGVjaWZpYyBzeW50YXguXG4gICAqIC0gc2xvd2VyLCBiZWNhdXNlIG9mIHRoZSBhZGRpdGlvbmFsIHNoZWxsIGludGVycHJldGF0aW9uLlxuICAgKiAtIHVuc2FmZSwgcG90ZW50aWFsbHkgYWxsb3dpbmcgY29tbWFuZCBpbmplY3Rpb24uXG4gICAqXG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBzaGVsbD86IGJvb2xlYW4gfCBzdHJpbmc7XG4gIC8qKlxuICAgKiBTdHJpcCB0aGUgZmluYWwgbmV3bGluZSBjaGFyYWN0ZXIgZnJvbSB0aGUgb3V0cHV0LlxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBzdHJpcEZpbmFsTmV3bGluZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBDdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IG9mIHRoZSBjaGlsZCBwcm9jZXNzLlxuICAgKiBAZGVmYXVsdCBwcm9jZXNzLmN3ZCgpXG4gICAqL1xuICBjd2Q/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBFbnZpcm9ubWVudCBrZXktdmFsdWUgcGFpcnMuIEV4dGVuZHMgYXV0b21hdGljYWxseSBmcm9tIGBwcm9jZXNzLmVudmAuXG4gICAqIEBkZWZhdWx0IHByb2Nlc3MuZW52XG4gICAqL1xuICBlbnY/OiBOb2RlSlMuUHJvY2Vzc0VudjtcbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGNoYXJhY3RlciBlbmNvZGluZyB1c2VkIHRvIGRlY29kZSB0aGUgc3Rkb3V0IGFuZCBzdGRlcnIgb3V0cHV0LiBJZiBzZXQgdG8gYFwiYnVmZmVyXCJgLCB0aGVuIHN0ZG91dCBhbmQgc3RkZXJyIHdpbGwgYmUgYSBCdWZmZXIgaW5zdGVhZCBvZiBhIHN0cmluZy5cbiAgICpcbiAgICogQGRlZmF1bHQgXCJ1dGY4XCJcbiAgICovXG4gIGVuY29kaW5nPzogQnVmZmVyRW5jb2RpbmcgfCBcImJ1ZmZlclwiO1xuICAvKipcbiAgICogV3JpdGUgc29tZSBpbnB1dCB0byB0aGUgYHN0ZGluYCBvZiB5b3VyIGJpbmFyeS5cbiAgICovXG4gIGlucHV0Pzogc3RyaW5nIHwgQnVmZmVyO1xuICAvKiogSWYgdGltZW91dCBpcyBncmVhdGVyIHRoYW4gYDBgLCB0aGUgcGFyZW50IHdpbGwgc2VuZCB0aGUgc2lnbmFsIGBTSUdURVJNYCBpZiB0aGUgY2hpbGQgcnVucyBsb25nZXIgdGhhbiB0aW1lb3V0IG1pbGxpc2Vjb25kcy5cbiAgICpcbiAgICogQGRlZmF1bHQgMTAwMDBcbiAgICovXG4gIHRpbWVvdXQ/OiBudW1iZXI7XG59O1xuXG5jb25zdCBTUEFDRVNfUkVHRVhQID0gLyArL2c7XG5mdW5jdGlvbiBwYXJzZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nLCBhcmdzPzogc3RyaW5nW10pIHtcbiAgaWYgKGFyZ3MpIHtcbiAgICByZXR1cm4gW2NvbW1hbmQsIC4uLmFyZ3NdO1xuICB9XG4gIGNvbnN0IHRva2Vuczogc3RyaW5nW10gPSBbXTtcbiAgZm9yIChjb25zdCB0b2tlbiBvZiBjb21tYW5kLnRyaW0oKS5zcGxpdChTUEFDRVNfUkVHRVhQKSkge1xuICAgIC8vIEFsbG93IHNwYWNlcyB0byBiZSBlc2NhcGVkIGJ5IGEgYmFja3NsYXNoIGlmIG5vdCBtZWFudCBhcyBhIGRlbGltaXRlclxuICAgIGNvbnN0IHByZXZpb3VzVG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgIGlmIChwcmV2aW91c1Rva2VuICYmIHByZXZpb3VzVG9rZW4uZW5kc1dpdGgoXCJcXFxcXCIpKSB7XG4gICAgICAvLyBNZXJnZSBwcmV2aW91cyB0b2tlbiB3aXRoIGN1cnJlbnQgb25lXG4gICAgICB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdID0gYCR7cHJldmlvdXNUb2tlbi5zbGljZSgwLCAtMSl9ICR7dG9rZW59YDtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0b2tlbnM7XG59XG5cbnR5cGUgRXhlY0NhY2hlZFByb21pc2VPcHRpb25zPFQsIFU+ID0gT21pdDxcbiAgQ2FjaGVkUHJvbWlzZU9wdGlvbnM8XG4gICAgKF9jb21tYW5kOiBzdHJpbmcsIF9hcmdzOiBzdHJpbmdbXSwgX29wdGlvbnM/OiBFeGVjT3B0aW9ucywgaW5wdXQ/OiBzdHJpbmcgfCBCdWZmZXIpID0+IFByb21pc2U8VD4sXG4gICAgVVxuICA+LFxuICBcImFib3J0YWJsZVwiXG4+O1xuXG4vKipcbiAqIEV4ZWN1dGVzIGEgY29tbWFuZCBhbmQgcmV0dXJucyB0aGUge0BsaW5rIEFzeW5jU3RhdGV9IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGV4ZWN1dGlvbiBvZiB0aGUgY29tbWFuZC4gVGhlIGxhc3QgdmFsdWUgd2lsbCBiZSBrZXB0IGJldHdlZW4gY29tbWFuZCBydW5zLlxuICpcbiAqIEByZW1hcmsgV2hlbiBzcGVjaWZ5aW5nIHRoZSBhcmd1bWVudHMgdmlhIHRoZSBgY29tbWFuZGAgc3RyaW5nLCBpZiB0aGUgZmlsZSBvciBhbiBhcmd1bWVudCBvZiB0aGUgY29tbWFuZCBjb250YWlucyBzcGFjZXMsIHRoZXkgbXVzdCBiZSBlc2NhcGVkIHdpdGggYmFja3NsYXNoZXMuIFRoaXMgbWF0dGVycyBlc3BlY2lhbGx5IGlmIGBjb21tYW5kYCBpcyBub3QgYSBjb25zdGFudCBidXQgYSB2YXJpYWJsZSwgZm9yIGV4YW1wbGUgd2l0aCBgX19kaXJuYW1lYCBvciBgcHJvY2Vzcy5jd2QoKWAuIEV4Y2VwdCBmb3Igc3BhY2VzLCBubyBlc2NhcGluZy9xdW90aW5nIGlzIG5lZWRlZC5cbiAqXG4gKiBUaGUgYHNoZWxsYCBvcHRpb24gbXVzdCBiZSB1c2VkIGlmIHRoZSBjb21tYW5kIHVzZXMgc2hlbGwtc3BlY2lmaWMgZmVhdHVyZXMgKGZvciBleGFtcGxlLCBgJiZgIG9yIGB8fGApLCBhcyBvcHBvc2VkIHRvIGJlaW5nIGEgc2ltcGxlIGZpbGUgZm9sbG93ZWQgYnkgaXRzIGFyZ3VtZW50cy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyB1c2VFeGVjIH0gZnJvbSAnQHJheWNhc3QvdXRpbHMnO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IHsgaXNMb2FkaW5nLCBkYXRhLCByZXZhbGlkYXRlIH0gPSB1c2VFeGVjKFwiYnJld1wiLCBbXCJpbmZvXCIsIFwiLS1qc29uPXYyXCIsIFwiLS1pbnN0YWxsZWRcIl0pO1xuICogICBjb25zdCByZXN1bHRzID0gdXNlTWVtbzx7fVtdPigoKSA9PiBKU09OLnBhcnNlKGRhdGEgfHwgXCJbXVwiKSwgW2RhdGFdKTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9PlxuICogICAgICB7KGRhdGEgfHwgW10pLm1hcCgoaXRlbSkgPT4gKFxuICogICAgICAgIDxMaXN0Lkl0ZW0ga2V5PXtpdGVtLmlkfSB0aXRsZT17aXRlbS5uYW1lfSAvPlxuICogICAgICApKX1cbiAqICAgIDwvTGlzdD5cbiAqICAgKTtcbiAqIH07XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUV4ZWM8VCA9IEJ1ZmZlciwgVSA9IHVuZGVmaW5lZD4oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgb3B0aW9uczoge1xuICAgIHBhcnNlT3V0cHV0PzogUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBCdWZmZXIsIEV4ZWNPcHRpb25zPjtcbiAgfSAmIEV4ZWNPcHRpb25zICYge1xuICAgICAgZW5jb2Rpbmc6IFwiYnVmZmVyXCI7XG4gICAgfSAmIEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPixcbik6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFQsIFU+O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUV4ZWM8VCA9IHN0cmluZywgVSA9IHVuZGVmaW5lZD4oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgb3B0aW9ucz86IHtcbiAgICBwYXJzZU91dHB1dD86IFBhcnNlRXhlY091dHB1dEhhbmRsZXI8VCwgc3RyaW5nLCBFeGVjT3B0aW9ucz47XG4gIH0gJiBFeGVjT3B0aW9ucyAmIHtcbiAgICAgIGVuY29kaW5nPzogQnVmZmVyRW5jb2Rpbmc7XG4gICAgfSAmIEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPixcbik6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFQsIFU+O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUV4ZWM8VCA9IEJ1ZmZlciwgVSA9IHVuZGVmaW5lZD4oXG4gIGZpbGU6IHN0cmluZyxcbiAgLyoqXG4gICAqIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgZmlsZS4gTm8gZXNjYXBpbmcvcXVvdGluZyBpcyBuZWVkZWQuXG4gICAqXG4gICAqIElmIGRlZmluZWQsIHRoZSBjb21tYW5kcyBuZWVkcyB0byBiZSBhIGZpbGUgdG8gZXhlY3V0ZS4gSWYgdW5kZWZpbmVkLCB0aGUgYXJndW1lbnRzIHdpbGwgYmUgcGFyc2VkIGZyb20gdGhlIGNvbW1hbmQuXG4gICAqL1xuICBhcmdzOiBzdHJpbmdbXSxcbiAgb3B0aW9uczoge1xuICAgIHBhcnNlT3V0cHV0PzogUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBCdWZmZXIsIEV4ZWNPcHRpb25zPjtcbiAgfSAmIEV4ZWNPcHRpb25zICYge1xuICAgICAgZW5jb2Rpbmc6IFwiYnVmZmVyXCI7XG4gICAgfSAmIEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPixcbik6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFQsIFU+O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUV4ZWM8VCA9IHN0cmluZywgVSA9IHVuZGVmaW5lZD4oXG4gIGZpbGU6IHN0cmluZyxcbiAgLyoqXG4gICAqIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgZmlsZS4gTm8gZXNjYXBpbmcvcXVvdGluZyBpcyBuZWVkZWQuXG4gICAqXG4gICAqIElmIGRlZmluZWQsIHRoZSBjb21tYW5kcyBuZWVkcyB0byBiZSBhIGZpbGUgdG8gZXhlY3V0ZS4gSWYgdW5kZWZpbmVkLCB0aGUgYXJndW1lbnRzIHdpbGwgYmUgcGFyc2VkIGZyb20gdGhlIGNvbW1hbmQuXG4gICAqL1xuICBhcmdzOiBzdHJpbmdbXSxcbiAgb3B0aW9ucz86IHtcbiAgICBwYXJzZU91dHB1dD86IFBhcnNlRXhlY091dHB1dEhhbmRsZXI8VCwgc3RyaW5nLCBFeGVjT3B0aW9ucz47XG4gIH0gJiBFeGVjT3B0aW9ucyAmIHtcbiAgICAgIGVuY29kaW5nPzogQnVmZmVyRW5jb2Rpbmc7XG4gICAgfSAmIEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPixcbik6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFQsIFU+O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUV4ZWM8VCwgVSA9IHVuZGVmaW5lZD4oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgb3B0aW9uc09yQXJncz86XG4gICAgfCBzdHJpbmdbXVxuICAgIHwgKHtcbiAgICAgICAgcGFyc2VPdXRwdXQ/OiBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFQsIEJ1ZmZlciwgRXhlY09wdGlvbnM+IHwgUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBzdHJpbmcsIEV4ZWNPcHRpb25zPjtcbiAgICAgIH0gJiBFeGVjT3B0aW9ucyAmXG4gICAgICAgIEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPiksXG4gIG9wdGlvbnM/OiB7XG4gICAgcGFyc2VPdXRwdXQ/OiBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFQsIEJ1ZmZlciwgRXhlY09wdGlvbnM+IHwgUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBzdHJpbmcsIEV4ZWNPcHRpb25zPjtcbiAgfSAmIEV4ZWNPcHRpb25zICZcbiAgICBFeGVjQ2FjaGVkUHJvbWlzZU9wdGlvbnM8VCwgVT4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxULCBVPiB7XG4gIGNvbnN0IHtcbiAgICBwYXJzZU91dHB1dCxcbiAgICBpbnB1dCxcbiAgICBvbkRhdGEsXG4gICAgb25XaWxsRXhlY3V0ZSxcbiAgICBpbml0aWFsRGF0YSxcbiAgICBleGVjdXRlLFxuICAgIGtlZXBQcmV2aW91c0RhdGEsXG4gICAgb25FcnJvcixcbiAgICBmYWlsdXJlVG9hc3RPcHRpb25zLFxuICAgIC4uLmV4ZWNPcHRpb25zXG4gIH0gPSBBcnJheS5pc0FycmF5KG9wdGlvbnNPckFyZ3MpID8gb3B0aW9ucyB8fCB7fSA6IG9wdGlvbnNPckFyZ3MgfHwge307XG5cbiAgY29uc3QgdXNlQ2FjaGVkUHJvbWlzZU9wdGlvbnM6IEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPiA9IHtcbiAgICBpbml0aWFsRGF0YSxcbiAgICBleGVjdXRlLFxuICAgIGtlZXBQcmV2aW91c0RhdGEsXG4gICAgb25FcnJvcixcbiAgICBvbkRhdGEsXG4gICAgb25XaWxsRXhlY3V0ZSxcbiAgICBmYWlsdXJlVG9hc3RPcHRpb25zLFxuICB9O1xuXG4gIGNvbnN0IGFib3J0YWJsZSA9IHVzZVJlZjxBYm9ydENvbnRyb2xsZXI+KG51bGwpO1xuICBjb25zdCBwYXJzZU91dHB1dFJlZiA9IHVzZUxhdGVzdChwYXJzZU91dHB1dCB8fCBkZWZhdWx0UGFyc2luZyk7XG5cbiAgY29uc3QgZm4gPSB1c2VDYWxsYmFjayhcbiAgICBhc3luYyAoX2NvbW1hbmQ6IHN0cmluZywgX2FyZ3M6IHN0cmluZ1tdLCBfb3B0aW9ucz86IEV4ZWNPcHRpb25zLCBpbnB1dD86IHN0cmluZyB8IEJ1ZmZlcikgPT4ge1xuICAgICAgY29uc3QgW2ZpbGUsIC4uLmFyZ3NdID0gcGFyc2VDb21tYW5kKF9jb21tYW5kLCBfYXJncyk7XG4gICAgICBjb25zdCBjb21tYW5kID0gW2ZpbGUsIC4uLmFyZ3NdLmpvaW4oXCIgXCIpO1xuXG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBzdHJpcEZpbmFsTmV3bGluZTogdHJ1ZSxcbiAgICAgICAgLi4uX29wdGlvbnMsXG4gICAgICAgIHRpbWVvdXQ6IF9vcHRpb25zPy50aW1lb3V0IHx8IDEwMDAwLFxuICAgICAgICBzaWduYWw6IGFib3J0YWJsZS5jdXJyZW50Py5zaWduYWwsXG4gICAgICAgIGVuY29kaW5nOiBfb3B0aW9ucz8uZW5jb2RpbmcgPT09IG51bGwgPyBcImJ1ZmZlclwiIDogX29wdGlvbnM/LmVuY29kaW5nIHx8IFwidXRmOFwiLFxuICAgICAgICBlbnY6IHsgUEFUSDogXCIvdXNyL2xvY2FsL2JpbjovdXNyL2JpbjovYmluOi91c3Ivc2Jpbjovc2JpblwiLCAuLi5wcm9jZXNzLmVudiwgLi4uX29wdGlvbnM/LmVudiB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3Qgc3Bhd25lZCA9IGNoaWxkUHJvY2Vzcy5zcGF3bihmaWxlLCBhcmdzLCBvcHRpb25zKTtcbiAgICAgIGNvbnN0IHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCwgb3B0aW9ucyk7XG5cbiAgICAgIGlmIChpbnB1dCkge1xuICAgICAgICBzcGF3bmVkLnN0ZGluLmVuZChpbnB1dCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IFt7IGVycm9yLCBleGl0Q29kZSwgc2lnbmFsLCB0aW1lZE91dCB9LCBzdGRvdXRSZXN1bHQsIHN0ZGVyclJlc3VsdF0gPSBhd2FpdCBnZXRTcGF3bmVkUmVzdWx0KFxuICAgICAgICBzcGF3bmVkLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBzcGF3bmVkUHJvbWlzZSxcbiAgICAgICk7XG4gICAgICBjb25zdCBzdGRvdXQgPSBoYW5kbGVPdXRwdXQob3B0aW9ucywgc3Rkb3V0UmVzdWx0KTtcbiAgICAgIGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dChvcHRpb25zLCBzdGRlcnJSZXN1bHQpO1xuXG4gICAgICByZXR1cm4gcGFyc2VPdXRwdXRSZWYuY3VycmVudCh7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdG9vIG1hbnkgZ2VuZXJpY3MsIEkgZ2l2ZSB1cFxuICAgICAgICBzdGRvdXQsXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdG9vIG1hbnkgZ2VuZXJpY3MsIEkgZ2l2ZSB1cFxuICAgICAgICBzdGRlcnIsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBleGl0Q29kZSxcbiAgICAgICAgc2lnbmFsLFxuICAgICAgICB0aW1lZE91dCxcbiAgICAgICAgY29tbWFuZCxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgcGFyZW50RXJyb3I6IG5ldyBFcnJvcigpLFxuICAgICAgfSkgYXMgVDtcbiAgICB9LFxuICAgIFtwYXJzZU91dHB1dFJlZl0sXG4gICk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBUIGNhbid0IGJlIGEgUHJvbWlzZSBzbyBpdCdzIGFjdHVhbGx5IHRoZSBzYW1lXG4gIHJldHVybiB1c2VDYWNoZWRQcm9taXNlKGZuLCBbY29tbWFuZCwgQXJyYXkuaXNBcnJheShvcHRpb25zT3JBcmdzKSA/IG9wdGlvbnNPckFyZ3MgOiBbXSwgZXhlY09wdGlvbnMsIGlucHV0XSwge1xuICAgIC4uLnVzZUNhY2hlZFByb21pc2VPcHRpb25zLFxuICAgIGFib3J0YWJsZSxcbiAgfSk7XG59XG4iLCAiaW1wb3J0IGNoaWxkUHJvY2VzcyBmcm9tIFwibm9kZTpjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgeyBjb25zdGFudHMgYXMgQnVmZmVyQ29uc3RhbnRzIH0gZnJvbSBcIm5vZGU6YnVmZmVyXCI7XG5pbXBvcnQgU3RyZWFtIGZyb20gXCJub2RlOnN0cmVhbVwiO1xuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSBcIm5vZGU6dXRpbFwiO1xuaW1wb3J0IHsgb25FeGl0IH0gZnJvbSBcIi4vdmVuZG9ycy9zaWduYWwtZXhpdFwiO1xuXG5leHBvcnQgdHlwZSBTcGF3bmVkUHJvbWlzZSA9IFByb21pc2U8e1xuICBleGl0Q29kZTogbnVtYmVyIHwgbnVsbDtcbiAgZXJyb3I/OiBFcnJvcjtcbiAgc2lnbmFsOiBOb2RlSlMuU2lnbmFscyB8IG51bGw7XG4gIHRpbWVkT3V0OiBib29sZWFuO1xufT47XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTcGF3bmVkUHJvbWlzZShcbiAgc3Bhd25lZDogY2hpbGRQcm9jZXNzLkNoaWxkUHJvY2Vzc1dpdGhvdXROdWxsU3RyZWFtcyxcbiAgeyB0aW1lb3V0IH06IHsgdGltZW91dD86IG51bWJlciB9ID0ge30sXG4pOiBTcGF3bmVkUHJvbWlzZSB7XG4gIGNvbnN0IHNwYXduZWRQcm9taXNlOiBTcGF3bmVkUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBzcGF3bmVkLm9uKFwiZXhpdFwiLCAoZXhpdENvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgcmVzb2x2ZSh7IGV4aXRDb2RlLCBzaWduYWwsIHRpbWVkT3V0OiBmYWxzZSB9KTtcbiAgICB9KTtcblxuICAgIHNwYXduZWQub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcbiAgICAgIHJlamVjdChlcnJvcik7XG4gICAgfSk7XG5cbiAgICBpZiAoc3Bhd25lZC5zdGRpbikge1xuICAgICAgc3Bhd25lZC5zdGRpbi5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCByZW1vdmVFeGl0SGFuZGxlciA9IG9uRXhpdCgoKSA9PiB7XG4gICAgc3Bhd25lZC5raWxsKCk7XG4gIH0pO1xuXG4gIGlmICh0aW1lb3V0ID09PSAwIHx8IHRpbWVvdXQgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBzcGF3bmVkUHJvbWlzZS5maW5hbGx5KCgpID0+IHJlbW92ZUV4aXRIYW5kbGVyKCkpO1xuICB9XG5cbiAgbGV0IHRpbWVvdXRJZDogTm9kZUpTLlRpbWVvdXQ7XG4gIGNvbnN0IHRpbWVvdXRQcm9taXNlOiBTcGF3bmVkUHJvbWlzZSA9IG5ldyBQcm9taXNlKChfcmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzcGF3bmVkLmtpbGwoXCJTSUdURVJNXCIpO1xuICAgICAgcmVqZWN0KE9iamVjdC5hc3NpZ24obmV3IEVycm9yKFwiVGltZWQgb3V0XCIpLCB7IHRpbWVkT3V0OiB0cnVlLCBzaWduYWw6IFwiU0lHVEVSTVwiIH0pKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfSk7XG5cbiAgY29uc3Qgc2FmZVNwYXduZWRQcm9taXNlID0gc3Bhd25lZFByb21pc2UuZmluYWxseSgoKSA9PiB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gIH0pO1xuXG4gIHJldHVybiBQcm9taXNlLnJhY2UoW3RpbWVvdXRQcm9taXNlLCBzYWZlU3Bhd25lZFByb21pc2VdKS5maW5hbGx5KCgpID0+IHJlbW92ZUV4aXRIYW5kbGVyKCkpO1xufVxuXG5jbGFzcyBNYXhCdWZmZXJFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoXCJUaGUgb3V0cHV0IGlzIHRvbyBiaWdcIik7XG4gICAgdGhpcy5uYW1lID0gXCJNYXhCdWZmZXJFcnJvclwiO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJ1ZmZlclN0cmVhbTxUIGV4dGVuZHMgc3RyaW5nIHwgQnVmZmVyPihvcHRpb25zOiB7IGVuY29kaW5nOiBCdWZmZXJFbmNvZGluZyB8IFwiYnVmZmVyXCIgfSkge1xuICBjb25zdCB7IGVuY29kaW5nIH0gPSBvcHRpb25zO1xuICBjb25zdCBpc0J1ZmZlciA9IGVuY29kaW5nID09PSBcImJ1ZmZlclwiO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgbWlzc2luZyB0aGUgbWV0aG9kcyB3ZSBhcmUgYWRkaW5nIGJlbG93XG4gIGNvbnN0IHN0cmVhbTogU3RyZWFtLlBhc3NUaHJvdWdoICYgeyBnZXRCdWZmZXJlZFZhbHVlOiAoKSA9PiBUOyBnZXRCdWZmZXJlZExlbmd0aDogKCkgPT4gbnVtYmVyIH0gPVxuICAgIG5ldyBTdHJlYW0uUGFzc1Rocm91Z2goeyBvYmplY3RNb2RlOiBmYWxzZSB9KTtcblxuICBpZiAoZW5jb2RpbmcgJiYgZW5jb2RpbmcgIT09IFwiYnVmZmVyXCIpIHtcbiAgICBzdHJlYW0uc2V0RW5jb2RpbmcoZW5jb2RpbmcpO1xuICB9XG5cbiAgbGV0IGxlbmd0aCA9IDA7XG4gIGNvbnN0IGNodW5rczogYW55W10gPSBbXTtcblxuICBzdHJlYW0ub24oXCJkYXRhXCIsIChjaHVuaykgPT4ge1xuICAgIGNodW5rcy5wdXNoKGNodW5rKTtcblxuICAgIGxlbmd0aCArPSBjaHVuay5sZW5ndGg7XG4gIH0pO1xuXG4gIHN0cmVhbS5nZXRCdWZmZXJlZFZhbHVlID0gKCkgPT4ge1xuICAgIHJldHVybiAoaXNCdWZmZXIgPyBCdWZmZXIuY29uY2F0KGNodW5rcywgbGVuZ3RoKSA6IGNodW5rcy5qb2luKFwiXCIpKSBhcyBUO1xuICB9O1xuXG4gIHN0cmVhbS5nZXRCdWZmZXJlZExlbmd0aCA9ICgpID0+IGxlbmd0aDtcblxuICByZXR1cm4gc3RyZWFtO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRTdHJlYW08VCBleHRlbmRzIHN0cmluZyB8IEJ1ZmZlcj4oXG4gIGlucHV0U3RyZWFtOiBTdHJlYW0uUmVhZGFibGUsXG4gIG9wdGlvbnM6IHsgZW5jb2Rpbmc6IEJ1ZmZlckVuY29kaW5nIHwgXCJidWZmZXJcIiB9LFxuKSB7XG4gIGNvbnN0IHN0cmVhbSA9IGJ1ZmZlclN0cmVhbTxUPihvcHRpb25zKTtcblxuICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgcmVqZWN0UHJvbWlzZSA9IChlcnJvcjogRXJyb3IgJiB7IGJ1ZmZlcmVkRGF0YT86IFQgfSkgPT4ge1xuICAgICAgLy8gRG9uJ3QgcmV0cmlldmUgYW4gb3ZlcnNpemVkIGJ1ZmZlci5cbiAgICAgIGlmIChlcnJvciAmJiBzdHJlYW0uZ2V0QnVmZmVyZWRMZW5ndGgoKSA8PSBCdWZmZXJDb25zdGFudHMuTUFYX0xFTkdUSCkge1xuICAgICAgICBlcnJvci5idWZmZXJlZERhdGEgPSBzdHJlYW0uZ2V0QnVmZmVyZWRWYWx1ZSgpO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoZXJyb3IpO1xuICAgIH07XG5cbiAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgcHJvbWlzaWZ5KFN0cmVhbS5waXBlbGluZSkoaW5wdXRTdHJlYW0sIHN0cmVhbSk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlamVjdFByb21pc2UoZXJyb3IgYXMgYW55KTtcbiAgICAgIH1cbiAgICB9KSgpO1xuXG4gICAgc3RyZWFtLm9uKFwiZGF0YVwiLCAoKSA9PiB7XG4gICAgICAvLyA4MG1iXG4gICAgICBpZiAoc3RyZWFtLmdldEJ1ZmZlcmVkTGVuZ3RoKCkgPiAxMDAwICogMTAwMCAqIDgwKSB7XG4gICAgICAgIHJlamVjdFByb21pc2UobmV3IE1heEJ1ZmZlckVycm9yKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gc3RyZWFtLmdldEJ1ZmZlcmVkVmFsdWUoKTtcbn1cblxuLy8gT24gZmFpbHVyZSwgYHJlc3VsdC5zdGRvdXR8c3RkZXJyYCBzaG91bGQgY29udGFpbiB0aGUgY3VycmVudGx5IGJ1ZmZlcmVkIHN0cmVhbVxuYXN5bmMgZnVuY3Rpb24gZ2V0QnVmZmVyZWREYXRhPFQgZXh0ZW5kcyBzdHJpbmcgfCBCdWZmZXI+KHN0cmVhbTogU3RyZWFtLlJlYWRhYmxlLCBzdHJlYW1Qcm9taXNlOiBQcm9taXNlPFQ+KSB7XG4gIHN0cmVhbS5kZXN0cm95KCk7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgc3RyZWFtUHJvbWlzZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gKGVycm9yIGFzIGFueSBhcyB7IGJ1ZmZlcmVkRGF0YTogVCB9KS5idWZmZXJlZERhdGE7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNwYXduZWRSZXN1bHQ8VCBleHRlbmRzIHN0cmluZyB8IEJ1ZmZlcj4oXG4gIHsgc3Rkb3V0LCBzdGRlcnIgfTogY2hpbGRQcm9jZXNzLkNoaWxkUHJvY2Vzc1dpdGhvdXROdWxsU3RyZWFtcyxcbiAgeyBlbmNvZGluZyB9OiB7IGVuY29kaW5nOiBCdWZmZXJFbmNvZGluZyB8IFwiYnVmZmVyXCIgfSxcbiAgcHJvY2Vzc0RvbmU6IFNwYXduZWRQcm9taXNlLFxuKSB7XG4gIGNvbnN0IHN0ZG91dFByb21pc2UgPSBnZXRTdHJlYW08VD4oc3Rkb3V0LCB7IGVuY29kaW5nIH0pO1xuICBjb25zdCBzdGRlcnJQcm9taXNlID0gZ2V0U3RyZWFtPFQ+KHN0ZGVyciwgeyBlbmNvZGluZyB9KTtcblxuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChbcHJvY2Vzc0RvbmUsIHN0ZG91dFByb21pc2UsIHN0ZGVyclByb21pc2VdKTtcbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICB7XG4gICAgICAgIGVycm9yOiBlcnJvciBhcyBFcnJvcixcbiAgICAgICAgZXhpdENvZGU6IG51bGwsXG4gICAgICAgIHNpZ25hbDogZXJyb3Iuc2lnbmFsIGFzIE5vZGVKUy5TaWduYWxzIHwgbnVsbCxcbiAgICAgICAgdGltZWRPdXQ6IChlcnJvci50aW1lZE91dCBhcyBib29sZWFuKSB8fCBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBnZXRCdWZmZXJlZERhdGEoc3Rkb3V0LCBzdGRvdXRQcm9taXNlKSxcbiAgICAgIGdldEJ1ZmZlcmVkRGF0YShzdGRlcnIsIHN0ZGVyclByb21pc2UpLFxuICAgIF0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0cmlwRmluYWxOZXdsaW5lPFQgZXh0ZW5kcyBzdHJpbmcgfCBCdWZmZXI+KGlucHV0OiBUKSB7XG4gIGNvbnN0IExGID0gdHlwZW9mIGlucHV0ID09PSBcInN0cmluZ1wiID8gXCJcXG5cIiA6IFwiXFxuXCIuY2hhckNvZGVBdCgwKTtcbiAgY29uc3QgQ1IgPSB0eXBlb2YgaW5wdXQgPT09IFwic3RyaW5nXCIgPyBcIlxcclwiIDogXCJcXHJcIi5jaGFyQ29kZUF0KDApO1xuXG4gIGlmIChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA9PT0gTEYpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHdlIGFyZSBkb2luZyBzb21lIG5hc3R5IHN0dWZmIGhlcmVcbiAgICBpbnB1dCA9IGlucHV0LnNsaWNlKDAsIC0xKTtcbiAgfVxuXG4gIGlmIChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA9PT0gQ1IpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHdlIGFyZSBkb2luZyBzb21lIG5hc3R5IHN0dWZmIGhlcmVcbiAgICBpbnB1dCA9IGlucHV0LnNsaWNlKDAsIC0xKTtcbiAgfVxuXG4gIHJldHVybiBpbnB1dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZU91dHB1dDxUIGV4dGVuZHMgc3RyaW5nIHwgQnVmZmVyPihvcHRpb25zOiB7IHN0cmlwRmluYWxOZXdsaW5lPzogYm9vbGVhbiB9LCB2YWx1ZTogVCkge1xuICBpZiAob3B0aW9ucy5zdHJpcEZpbmFsTmV3bGluZSkge1xuICAgIHJldHVybiBzdHJpcEZpbmFsTmV3bGluZSh2YWx1ZSk7XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGdldEVycm9yUHJlZml4KHtcbiAgdGltZWRPdXQsXG4gIHRpbWVvdXQsXG4gIHNpZ25hbCxcbiAgZXhpdENvZGUsXG59OiB7XG4gIGV4aXRDb2RlOiBudW1iZXIgfCBudWxsO1xuICBzaWduYWw6IE5vZGVKUy5TaWduYWxzIHwgbnVsbDtcbiAgdGltZWRPdXQ6IGJvb2xlYW47XG4gIHRpbWVvdXQ/OiBudW1iZXI7XG59KSB7XG4gIGlmICh0aW1lZE91dCkge1xuICAgIHJldHVybiBgdGltZWQgb3V0IGFmdGVyICR7dGltZW91dH0gbWlsbGlzZWNvbmRzYDtcbiAgfVxuXG4gIGlmIChzaWduYWwgIT09IHVuZGVmaW5lZCAmJiBzaWduYWwgIT09IG51bGwpIHtcbiAgICByZXR1cm4gYHdhcyBraWxsZWQgd2l0aCAke3NpZ25hbH1gO1xuICB9XG5cbiAgaWYgKGV4aXRDb2RlICE9PSB1bmRlZmluZWQgJiYgZXhpdENvZGUgIT09IG51bGwpIHtcbiAgICByZXR1cm4gYGZhaWxlZCB3aXRoIGV4aXQgY29kZSAke2V4aXRDb2RlfWA7XG4gIH1cblxuICByZXR1cm4gXCJmYWlsZWRcIjtcbn1cblxuZnVuY3Rpb24gbWFrZUVycm9yKHtcbiAgc3Rkb3V0LFxuICBzdGRlcnIsXG4gIGVycm9yLFxuICBzaWduYWwsXG4gIGV4aXRDb2RlLFxuICBjb21tYW5kLFxuICB0aW1lZE91dCxcbiAgb3B0aW9ucyxcbiAgcGFyZW50RXJyb3IsXG59OiB7XG4gIHN0ZG91dDogc3RyaW5nIHwgQnVmZmVyO1xuICBzdGRlcnI6IHN0cmluZyB8IEJ1ZmZlcjtcbiAgZXJyb3I/OiBFcnJvcjtcbiAgZXhpdENvZGU6IG51bWJlciB8IG51bGw7XG4gIHNpZ25hbDogTm9kZUpTLlNpZ25hbHMgfCBudWxsO1xuICB0aW1lZE91dDogYm9vbGVhbjtcbiAgY29tbWFuZDogc3RyaW5nO1xuICBvcHRpb25zPzogeyB0aW1lb3V0PzogbnVtYmVyIH07XG4gIHBhcmVudEVycm9yOiBFcnJvcjtcbn0pIHtcbiAgY29uc3QgcHJlZml4ID0gZ2V0RXJyb3JQcmVmaXgoeyB0aW1lZE91dCwgdGltZW91dDogb3B0aW9ucz8udGltZW91dCwgc2lnbmFsLCBleGl0Q29kZSB9KTtcbiAgY29uc3QgZXhlY2FNZXNzYWdlID0gYENvbW1hbmQgJHtwcmVmaXh9OiAke2NvbW1hbmR9YDtcbiAgY29uc3Qgc2hvcnRNZXNzYWdlID0gZXJyb3IgPyBgJHtleGVjYU1lc3NhZ2V9XFxuJHtlcnJvci5tZXNzYWdlfWAgOiBleGVjYU1lc3NhZ2U7XG4gIGNvbnN0IG1lc3NhZ2UgPSBbc2hvcnRNZXNzYWdlLCBzdGRlcnIsIHN0ZG91dF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cIik7XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBub3Qgb24gRXJyb3JcbiAgICBlcnJvci5vcmlnaW5hbE1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICB9IGVsc2Uge1xuICAgIGVycm9yID0gcGFyZW50RXJyb3I7XG4gIH1cblxuICBlcnJvci5tZXNzYWdlID0gbWVzc2FnZTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yIG5vdCBvbiBFcnJvclxuICBlcnJvci5zaG9ydE1lc3NhZ2UgPSBzaG9ydE1lc3NhZ2U7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3Igbm90IG9uIEVycm9yXG4gIGVycm9yLmNvbW1hbmQgPSBjb21tYW5kO1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIG5vdCBvbiBFcnJvclxuICBlcnJvci5leGl0Q29kZSA9IGV4aXRDb2RlO1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIG5vdCBvbiBFcnJvclxuICBlcnJvci5zaWduYWwgPSBzaWduYWw7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3Igbm90IG9uIEVycm9yXG4gIGVycm9yLnN0ZG91dCA9IHN0ZG91dDtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBub3Qgb24gRXJyb3JcbiAgZXJyb3Iuc3RkZXJyID0gc3RkZXJyO1xuXG4gIGlmIChcImJ1ZmZlcmVkRGF0YVwiIGluIGVycm9yKSB7XG4gICAgZGVsZXRlIGVycm9yW1wiYnVmZmVyZWREYXRhXCJdO1xuICB9XG5cbiAgcmV0dXJuIGVycm9yO1xufVxuXG5leHBvcnQgdHlwZSBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFxuICBULFxuICBEZWNvZGVkT3V0cHV0IGV4dGVuZHMgc3RyaW5nIHwgQnVmZmVyID0gc3RyaW5nIHwgQnVmZmVyLFxuICBPcHRpb25zID0gdW5rbm93bixcbj4gPSAoYXJnczoge1xuICAvKiogVGhlIG91dHB1dCBvZiB0aGUgcHJvY2VzcyBvbiBzdGRvdXQuICovXG4gIHN0ZG91dDogRGVjb2RlZE91dHB1dDtcbiAgLyoqIFRoZSBvdXRwdXQgb2YgdGhlIHByb2Nlc3Mgb24gc3RkZXJyLiAqL1xuICBzdGRlcnI6IERlY29kZWRPdXRwdXQ7XG4gIGVycm9yPzogRXJyb3I7XG4gIC8qKiBUaGUgbnVtZXJpYyBleGl0IGNvZGUgb2YgdGhlIHByb2Nlc3MgdGhhdCB3YXMgcnVuLiAqL1xuICBleGl0Q29kZTogbnVtYmVyIHwgbnVsbDtcbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBzaWduYWwgdGhhdCB3YXMgdXNlZCB0byB0ZXJtaW5hdGUgdGhlIHByb2Nlc3MuIEZvciBleGFtcGxlLCBTSUdGUEUuXG4gICAqXG4gICAqIElmIGEgc2lnbmFsIHRlcm1pbmF0ZWQgdGhlIHByb2Nlc3MsIHRoaXMgcHJvcGVydHkgaXMgZGVmaW5lZC4gT3RoZXJ3aXNlIGl0IGlzIG51bGwuXG4gICAqL1xuICBzaWduYWw6IE5vZGVKUy5TaWduYWxzIHwgbnVsbDtcbiAgLyoqIFdoZXRoZXIgdGhlIHByb2Nlc3MgdGltZWQgb3V0LiAqL1xuICB0aW1lZE91dDogYm9vbGVhbjtcbiAgLyoqIFRoZSBjb21tYW5kIHRoYXQgd2FzIHJ1biwgZm9yIGxvZ2dpbmcgcHVycG9zZXMuICovXG4gIGNvbW1hbmQ6IHN0cmluZztcbiAgb3B0aW9ucz86IE9wdGlvbnM7XG59KSA9PiBUO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdFBhcnNpbmc8VCBleHRlbmRzIHN0cmluZyB8IEJ1ZmZlcj4oe1xuICBzdGRvdXQsXG4gIHN0ZGVycixcbiAgZXJyb3IsXG4gIGV4aXRDb2RlLFxuICBzaWduYWwsXG4gIHRpbWVkT3V0LFxuICBjb21tYW5kLFxuICBvcHRpb25zLFxuICBwYXJlbnRFcnJvcixcbn06IHtcbiAgc3Rkb3V0OiBUO1xuICBzdGRlcnI6IFQ7XG4gIGVycm9yPzogRXJyb3I7XG4gIGV4aXRDb2RlOiBudW1iZXIgfCBudWxsO1xuICBzaWduYWw6IE5vZGVKUy5TaWduYWxzIHwgbnVsbDtcbiAgdGltZWRPdXQ6IGJvb2xlYW47XG4gIGNvbW1hbmQ6IHN0cmluZztcbiAgb3B0aW9ucz86IHsgdGltZW91dD86IG51bWJlciB9O1xuICBwYXJlbnRFcnJvcjogRXJyb3I7XG59KSB7XG4gIGlmIChlcnJvciB8fCBleGl0Q29kZSAhPT0gMCB8fCBzaWduYWwgIT09IG51bGwpIHtcbiAgICBjb25zdCByZXR1cm5lZEVycm9yID0gbWFrZUVycm9yKHtcbiAgICAgIGVycm9yLFxuICAgICAgZXhpdENvZGUsXG4gICAgICBzaWduYWwsXG4gICAgICBzdGRvdXQsXG4gICAgICBzdGRlcnIsXG4gICAgICBjb21tYW5kLFxuICAgICAgdGltZWRPdXQsXG4gICAgICBvcHRpb25zLFxuICAgICAgcGFyZW50RXJyb3IsXG4gICAgfSk7XG5cbiAgICB0aHJvdyByZXR1cm5lZEVycm9yO1xuICB9XG5cbiAgcmV0dXJuIHN0ZG91dDtcbn1cbiIsICIvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnQgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbi8vIE5vdGU6IHNpbmNlIG55YyB1c2VzIHRoaXMgbW9kdWxlIHRvIG91dHB1dCBjb3ZlcmFnZSwgYW55IGxpbmVzXG4vLyB0aGF0IGFyZSBpbiB0aGUgZGlyZWN0IHN5bmMgZmxvdyBvZiBueWMncyBvdXRwdXRDb3ZlcmFnZSBhcmVcbi8vIGlnbm9yZWQsIHNpbmNlIHdlIGNhbiBuZXZlciBnZXQgY292ZXJhZ2UgZm9yIHRoZW0uXG4vLyBncmFiIGEgcmVmZXJlbmNlIHRvIG5vZGUncyByZWFsIHByb2Nlc3Mgb2JqZWN0IHJpZ2h0IGF3YXlcblxuY29uc3QgcHJvY2Vzc09rID0gKHByb2Nlc3M6IGFueSkgPT5cbiAgISFwcm9jZXNzICYmXG4gIHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmXG4gIHR5cGVvZiBwcm9jZXNzLnJlbW92ZUxpc3RlbmVyID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gXCJmdW5jdGlvblwiICYmXG4gIHR5cGVvZiBwcm9jZXNzLnJlYWxseUV4aXQgPT09IFwiZnVuY3Rpb25cIiAmJlxuICB0eXBlb2YgcHJvY2Vzcy5saXN0ZW5lcnMgPT09IFwiZnVuY3Rpb25cIiAmJlxuICB0eXBlb2YgcHJvY2Vzcy5raWxsID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgdHlwZW9mIHByb2Nlc3MucGlkID09PSBcIm51bWJlclwiICYmXG4gIHR5cGVvZiBwcm9jZXNzLm9uID09PSBcImZ1bmN0aW9uXCI7XG5jb25zdCBrRXhpdEVtaXR0ZXIgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sLmZvcihcInNpZ25hbC1leGl0IGVtaXR0ZXJcIik7XG4vLyB0ZWVueSBzcGVjaWFsIHB1cnBvc2UgZWVcbmNsYXNzIEVtaXR0ZXIge1xuICBlbWl0dGVkID0ge1xuICAgIGFmdGVyRXhpdDogZmFsc2UsXG4gICAgZXhpdDogZmFsc2UsXG4gIH07XG4gIGxpc3RlbmVycyA9IHtcbiAgICBhZnRlckV4aXQ6IFtdLFxuICAgIGV4aXQ6IFtdLFxuICB9O1xuICBjb3VudCA9IDA7XG4gIGlkID0gTWF0aC5yYW5kb20oKTtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGlmIChnbG9iYWxba0V4aXRFbWl0dGVyXSkge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgcmV0dXJuIGdsb2JhbFtrRXhpdEVtaXR0ZXJdO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xvYmFsLCBrRXhpdEVtaXR0ZXIsIHtcbiAgICAgIHZhbHVlOiB0aGlzLFxuICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG4gIG9uKGV2OiBhbnksIGZuOiBhbnkpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy5saXN0ZW5lcnNbZXZdLnB1c2goZm4pO1xuICB9XG4gIHJlbW92ZUxpc3RlbmVyKGV2OiBhbnksIGZuOiBhbnkpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgbGlzdCA9IHRoaXMubGlzdGVuZXJzW2V2XTtcbiAgICBjb25zdCBpID0gbGlzdC5pbmRleE9mKGZuKTtcbiAgICAvKiBjOCBpZ25vcmUgc3RhcnQgKi9cbiAgICBpZiAoaSA9PT0gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLyogYzggaWdub3JlIHN0b3AgKi9cbiAgICBpZiAoaSA9PT0gMCAmJiBsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICB9XG4gIH1cbiAgZW1pdChldjogYW55LCBjb2RlOiBhbnksIHNpZ25hbDogYW55KTogYW55IHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgaWYgKHRoaXMuZW1pdHRlZFtldl0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHRoaXMuZW1pdHRlZFtldl0gPSB0cnVlO1xuICAgIGxldCByZXQgPSBmYWxzZTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgZm9yIChjb25zdCBmbiBvZiB0aGlzLmxpc3RlbmVyc1tldl0pIHtcbiAgICAgIHJldCA9IGZuKGNvZGUsIHNpZ25hbCkgPT09IHRydWUgfHwgcmV0O1xuICAgIH1cbiAgICBpZiAoZXYgPT09IFwiZXhpdFwiKSB7XG4gICAgICByZXQgPSB0aGlzLmVtaXQoXCJhZnRlckV4aXRcIiwgY29kZSwgc2lnbmFsKSB8fCByZXQ7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cbn1cblxuY2xhc3MgU2lnbmFsRXhpdEZhbGxiYWNrIHtcbiAgb25FeGl0KCkge1xuICAgIHJldHVybiAoKSA9PiB7fTtcbiAgfVxuICBsb2FkKCkge31cbiAgdW5sb2FkKCkge31cbn1cbmNsYXNzIFNpZ25hbEV4aXQge1xuICAvLyBcIlNJR0hVUFwiIHRocm93cyBhbiBgRU5PU1lTYCBlcnJvciBvbiBXaW5kb3dzLFxuICAvLyBzbyB1c2UgYSBzdXBwb3J0ZWQgc2lnbmFsIGluc3RlYWRcbiAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gIC8vIEB0cy1pZ25vcmVcbiAgI2h1cFNpZyA9IHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIiA/IFwiU0lHSU5UXCIgOiBcIlNJR0hVUFwiO1xuICAvKiBjOCBpZ25vcmUgc3RvcCAqL1xuICAjZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICNwcm9jZXNzOiBhbnk7XG4gICNvcmlnaW5hbFByb2Nlc3NFbWl0OiBhbnk7XG4gICNvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0OiBhbnk7XG4gICNzaWdMaXN0ZW5lcnMgPSB7fTtcbiAgI2xvYWRlZCA9IGZhbHNlO1xuICAjc2lnbmFsczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3RydWN0b3IocHJvY2VzczogYW55KSB7XG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBub3QgdGhlIHNldCBvZiBhbGwgcG9zc2libGUgc2lnbmFscy5cbiAgICAgKlxuICAgICAqIEl0IElTLCBob3dldmVyLCB0aGUgc2V0IG9mIGFsbCBzaWduYWxzIHRoYXQgdHJpZ2dlclxuICAgICAqIGFuIGV4aXQgb24gZWl0aGVyIExpbnV4IG9yIEJTRCBzeXN0ZW1zLiAgTGludXggaXMgYVxuICAgICAqIHN1cGVyc2V0IG9mIHRoZSBzaWduYWwgbmFtZXMgc3VwcG9ydGVkIG9uIEJTRCwgYW5kXG4gICAgICogdGhlIHVua25vd24gc2lnbmFscyBqdXN0IGZhaWwgdG8gcmVnaXN0ZXIsIHNvIHdlIGNhblxuICAgICAqIGNhdGNoIHRoYXQgZWFzaWx5IGVub3VnaC5cbiAgICAgKlxuICAgICAqIFdpbmRvd3Mgc2lnbmFscyBhcmUgYSBkaWZmZXJlbnQgc2V0LCBzaW5jZSB0aGVyZSBhcmVcbiAgICAgKiBzaWduYWxzIHRoYXQgdGVybWluYXRlIFdpbmRvd3MgcHJvY2Vzc2VzLCBidXQgZG9uJ3RcbiAgICAgKiB0ZXJtaW5hdGUgKG9yIGRvbid0IGV2ZW4gZXhpc3QpIG9uIFBvc2l4IHN5c3RlbXMuXG4gICAgICpcbiAgICAgKiBEb24ndCBib3RoZXIgd2l0aCBTSUdLSUxMLiAgSXQncyB1bmNhdGNoYWJsZSwgd2hpY2hcbiAgICAgKiBtZWFucyB0aGF0IHdlIGNhbid0IGZpcmUgYW55IGNhbGxiYWNrcyBhbnl3YXkuXG4gICAgICpcbiAgICAgKiBJZiBhIHVzZXIgZG9lcyBoYXBwZW4gdG8gcmVnaXN0ZXIgYSBoYW5kbGVyIG9uIGEgbm9uLVxuICAgICAqIGZhdGFsIHNpZ25hbCBsaWtlIFNJR1dJTkNIIG9yIHNvbWV0aGluZywgYW5kIHRoZW5cbiAgICAgKiBleGl0LCBpdCdsbCBlbmQgdXAgZmlyaW5nIGBwcm9jZXNzLmVtaXQoJ2V4aXQnKWAsIHNvXG4gICAgICogdGhlIGhhbmRsZXIgd2lsbCBiZSBmaXJlZCBhbnl3YXkuXG4gICAgICpcbiAgICAgKiBTSUdCVVMsIFNJR0ZQRSwgU0lHU0VHViBhbmQgU0lHSUxMLCB3aGVuIG5vdCByYWlzZWRcbiAgICAgKiBhcnRpZmljaWFsbHksIGluaGVyZW50bHkgbGVhdmUgdGhlIHByb2Nlc3MgaW4gYVxuICAgICAqIHN0YXRlIGZyb20gd2hpY2ggaXQgaXMgbm90IHNhZmUgdG8gdHJ5IGFuZCBlbnRlciBKU1xuICAgICAqIGxpc3RlbmVycy5cbiAgICAgKi9cbiAgICB0aGlzLiNzaWduYWxzLnB1c2goXCJTSUdIVVBcIiwgXCJTSUdJTlRcIiwgXCJTSUdURVJNXCIpO1xuICAgIGlmIChnbG9iYWxUaGlzLnByb2Nlc3MucGxhdGZvcm0gIT09IFwid2luMzJcIikge1xuICAgICAgdGhpcy4jc2lnbmFscy5wdXNoKFxuICAgICAgICBcIlNJR0FMUk1cIixcbiAgICAgICAgXCJTSUdBQlJUXCIsXG4gICAgICAgIFwiU0lHVlRBTFJNXCIsXG4gICAgICAgIFwiU0lHWENQVVwiLFxuICAgICAgICBcIlNJR1hGU1pcIixcbiAgICAgICAgXCJTSUdVU1IyXCIsXG4gICAgICAgIFwiU0lHVFJBUFwiLFxuICAgICAgICBcIlNJR1NZU1wiLFxuICAgICAgICBcIlNJR1FVSVRcIixcbiAgICAgICAgXCJTSUdJT1RcIixcbiAgICAgICAgLy8gc2hvdWxkIGRldGVjdCBwcm9maWxlciBhbmQgZW5hYmxlL2Rpc2FibGUgYWNjb3JkaW5nbHkuXG4gICAgICAgIC8vIHNlZSAjMjFcbiAgICAgICAgLy8gJ1NJR1BST0YnXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZ2xvYmFsVGhpcy5wcm9jZXNzLnBsYXRmb3JtID09PSBcImxpbnV4XCIpIHtcbiAgICAgIHRoaXMuI3NpZ25hbHMucHVzaChcIlNJR0lPXCIsIFwiU0lHUE9MTFwiLCBcIlNJR1BXUlwiLCBcIlNJR1NUS0ZMVFwiKTtcbiAgICB9XG4gICAgdGhpcy4jcHJvY2VzcyA9IHByb2Nlc3M7XG4gICAgLy8geyA8c2lnbmFsPjogPGxpc3RlbmVyIGZuPiwgLi4uIH1cbiAgICB0aGlzLiNzaWdMaXN0ZW5lcnMgPSB7fTtcbiAgICBmb3IgKGNvbnN0IHNpZyBvZiB0aGlzLiNzaWduYWxzKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0aGlzLiNzaWdMaXN0ZW5lcnNbc2lnXSA9ICgpID0+IHtcbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIG90aGVyIGxpc3RlbmVycywgYW4gZXhpdCBpcyBjb21pbmchXG4gICAgICAgIC8vIFNpbXBsZXN0IHdheTogcmVtb3ZlIHVzIGFuZCB0aGVuIHJlLXNlbmQgdGhlIHNpZ25hbC5cbiAgICAgICAgLy8gV2Uga25vdyB0aGF0IHRoaXMgd2lsbCBraWxsIHRoZSBwcm9jZXNzLCBzbyB3ZSBjYW5cbiAgICAgICAgLy8gc2FmZWx5IGVtaXQgbm93LlxuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLiNwcm9jZXNzLmxpc3RlbmVycyhzaWcpO1xuICAgICAgICBsZXQgeyBjb3VudCB9ID0gdGhpcy4jZW1pdHRlcjtcbiAgICAgICAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIHRoZSBmYWN0IHRoYXQgc2lnbmFsLWV4aXQgdjMgYW5kIHNpZ25hbFxuICAgICAgICAvLyBleGl0IHY0IGFyZSBub3QgYXdhcmUgb2YgZWFjaCBvdGhlciwgYW5kIGVhY2ggd2lsbCBhdHRlbXB0IHRvIGxldFxuICAgICAgICAvLyB0aGUgb3RoZXIgaGFuZGxlIGl0LCBzbyBuZWl0aGVyIG9mIHRoZW0gZG8uIFRvIGNvcnJlY3QgdGhpcywgd2VcbiAgICAgICAgLy8gZGV0ZWN0IGlmIHdlJ3JlIHRoZSBvbmx5IGhhbmRsZXIgKmV4Y2VwdCogZm9yIHByZXZpb3VzIHZlcnNpb25zXG4gICAgICAgIC8vIG9mIHNpZ25hbC1leGl0LCBhbmQgaW5jcmVtZW50IGJ5IHRoZSBjb3VudCBvZiBsaXN0ZW5lcnMgaXQgaGFzXG4gICAgICAgIC8vIGNyZWF0ZWQuXG4gICAgICAgIC8qIGM4IGlnbm9yZSBzdGFydCAqL1xuICAgICAgICBjb25zdCBwID0gcHJvY2VzcztcbiAgICAgICAgaWYgKHR5cGVvZiBwLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBwLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fLmNvdW50ID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgY291bnQgKz0gcC5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfXy5jb3VudDtcbiAgICAgICAgfVxuICAgICAgICAvKiBjOCBpZ25vcmUgc3RvcCAqL1xuICAgICAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gY291bnQpIHtcbiAgICAgICAgICB0aGlzLnVubG9hZCgpO1xuICAgICAgICAgIGNvbnN0IHJldCA9IHRoaXMuI2VtaXR0ZXIuZW1pdChcImV4aXRcIiwgbnVsbCwgc2lnKTtcbiAgICAgICAgICAvKiBjOCBpZ25vcmUgc3RhcnQgKi9cbiAgICAgICAgICBjb25zdCBzID0gc2lnID09PSBcIlNJR0hVUFwiID8gdGhpcy4jaHVwU2lnIDogc2lnO1xuICAgICAgICAgIGlmICghcmV0KSBwcm9jZXNzLmtpbGwocHJvY2Vzcy5waWQsIHMpO1xuICAgICAgICAgIC8qIGM4IGlnbm9yZSBzdG9wICovXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIHRoaXMuI29yaWdpbmFsUHJvY2Vzc1JlYWxseUV4aXQgPSBwcm9jZXNzLnJlYWxseUV4aXQ7XG4gICAgdGhpcy4jb3JpZ2luYWxQcm9jZXNzRW1pdCA9IHByb2Nlc3MuZW1pdDtcbiAgfVxuICBvbkV4aXQoY2I6IGFueSwgb3B0czogYW55KSB7XG4gICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgaWYgKCFwcm9jZXNzT2sodGhpcy4jcHJvY2VzcykpIHtcbiAgICAgIHJldHVybiAoKSA9PiB7fTtcbiAgICB9XG4gICAgLyogYzggaWdub3JlIHN0b3AgKi9cbiAgICBpZiAodGhpcy4jbG9hZGVkID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5sb2FkKCk7XG4gICAgfVxuICAgIGNvbnN0IGV2ID0gb3B0cz8uYWx3YXlzTGFzdCA/IFwiYWZ0ZXJFeGl0XCIgOiBcImV4aXRcIjtcbiAgICB0aGlzLiNlbWl0dGVyLm9uKGV2LCBjYik7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHRoaXMuI2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoZXYsIGNiKTtcbiAgICAgIGlmICh0aGlzLiNlbWl0dGVyLmxpc3RlbmVyc1tcImV4aXRcIl0ubGVuZ3RoID09PSAwICYmIHRoaXMuI2VtaXR0ZXIubGlzdGVuZXJzW1wiYWZ0ZXJFeGl0XCJdLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLnVubG9hZCgpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgbG9hZCgpIHtcbiAgICBpZiAodGhpcy4jbG9hZGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuI2xvYWRlZCA9IHRydWU7XG4gICAgLy8gVGhpcyBpcyB0aGUgbnVtYmVyIG9mIG9uU2lnbmFsRXhpdCdzIHRoYXQgYXJlIGluIHBsYXkuXG4gICAgLy8gSXQncyBpbXBvcnRhbnQgc28gdGhhdCB3ZSBjYW4gY291bnQgdGhlIGNvcnJlY3QgbnVtYmVyIG9mXG4gICAgLy8gbGlzdGVuZXJzIG9uIHNpZ25hbHMsIGFuZCBkb24ndCB3YWl0IGZvciB0aGUgb3RoZXIgb25lIHRvXG4gICAgLy8gaGFuZGxlIGl0IGluc3RlYWQgb2YgdXMuXG4gICAgdGhpcy4jZW1pdHRlci5jb3VudCArPSAxO1xuICAgIGZvciAoY29uc3Qgc2lnIG9mIHRoaXMuI3NpZ25hbHMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29uc3QgZm4gPSB0aGlzLiNzaWdMaXN0ZW5lcnNbc2lnXTtcbiAgICAgICAgaWYgKGZuKSB0aGlzLiNwcm9jZXNzLm9uKHNpZywgZm4pO1xuICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAvLyBuby1vcFxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLiNwcm9jZXNzLmVtaXQgPSAoZXY6IGFueSwgLi4uYTogYW55KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy4jcHJvY2Vzc0VtaXQoZXYsIC4uLmEpO1xuICAgIH07XG4gICAgdGhpcy4jcHJvY2Vzcy5yZWFsbHlFeGl0ID0gKGNvZGU6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuI3Byb2Nlc3NSZWFsbHlFeGl0KGNvZGUpO1xuICAgIH07XG4gIH1cbiAgdW5sb2FkKCkge1xuICAgIGlmICghdGhpcy4jbG9hZGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuI2xvYWRlZCA9IGZhbHNlO1xuICAgIHRoaXMuI3NpZ25hbHMuZm9yRWFjaCgoc2lnKSA9PiB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuI3NpZ0xpc3RlbmVyc1tzaWddO1xuICAgICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxpc3RlbmVyIG5vdCBkZWZpbmVkIGZvciBzaWduYWw6IFwiICsgc2lnKTtcbiAgICAgIH1cbiAgICAgIC8qIGM4IGlnbm9yZSBzdG9wICovXG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLiNwcm9jZXNzLnJlbW92ZUxpc3RlbmVyKHNpZywgbGlzdGVuZXIpO1xuICAgICAgICAvKiBjOCBpZ25vcmUgc3RhcnQgKi9cbiAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgLy8gbm8tb3BcbiAgICAgIH1cbiAgICAgIC8qIGM4IGlnbm9yZSBzdG9wICovXG4gICAgfSk7XG4gICAgdGhpcy4jcHJvY2Vzcy5lbWl0ID0gdGhpcy4jb3JpZ2luYWxQcm9jZXNzRW1pdDtcbiAgICB0aGlzLiNwcm9jZXNzLnJlYWxseUV4aXQgPSB0aGlzLiNvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0O1xuICAgIHRoaXMuI2VtaXR0ZXIuY291bnQgLT0gMTtcbiAgfVxuICAjcHJvY2Vzc1JlYWxseUV4aXQoY29kZTogYW55KSB7XG4gICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgaWYgKCFwcm9jZXNzT2sodGhpcy4jcHJvY2VzcykpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICB0aGlzLiNwcm9jZXNzLmV4aXRDb2RlID0gY29kZSB8fCAwO1xuICAgIC8qIGM4IGlnbm9yZSBzdG9wICovXG4gICAgdGhpcy4jZW1pdHRlci5lbWl0KFwiZXhpdFwiLCB0aGlzLiNwcm9jZXNzLmV4aXRDb2RlLCBudWxsKTtcbiAgICByZXR1cm4gdGhpcy4jb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdC5jYWxsKHRoaXMuI3Byb2Nlc3MsIHRoaXMuI3Byb2Nlc3MuZXhpdENvZGUpO1xuICB9XG4gICNwcm9jZXNzRW1pdChldjogYW55LCAuLi5hcmdzOiBhbnkpIHtcbiAgICBjb25zdCBvZyA9IHRoaXMuI29yaWdpbmFsUHJvY2Vzc0VtaXQ7XG4gICAgaWYgKGV2ID09PSBcImV4aXRcIiAmJiBwcm9jZXNzT2sodGhpcy4jcHJvY2VzcykpIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICB0aGlzLiNwcm9jZXNzLmV4aXRDb2RlID0gYXJnc1swXTtcbiAgICAgICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgICB9XG4gICAgICAvKiBjOCBpZ25vcmUgc3RhcnQgKi9cbiAgICAgIGNvbnN0IHJldCA9IG9nLmNhbGwodGhpcy4jcHJvY2VzcywgZXYsIC4uLmFyZ3MpO1xuICAgICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgICB0aGlzLiNlbWl0dGVyLmVtaXQoXCJleGl0XCIsIHRoaXMuI3Byb2Nlc3MuZXhpdENvZGUsIG51bGwpO1xuICAgICAgLyogYzggaWdub3JlIHN0b3AgKi9cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZy5jYWxsKHRoaXMuI3Byb2Nlc3MsIGV2LCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cbn1cblxubGV0IHNpZ25hbEV4aXQ6IFNpZ25hbEV4aXQgfCBTaWduYWxFeGl0RmFsbGJhY2sgfCBudWxsID0gbnVsbDtcblxuZXhwb3J0IGNvbnN0IG9uRXhpdCA9IChcbiAgY2I6IGFueSxcbiAgb3B0cz86IHtcbiAgICBhbHdheXNMYXN0PzogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgfSxcbikgPT4ge1xuICBpZiAoIXNpZ25hbEV4aXQpIHtcbiAgICBzaWduYWxFeGl0ID0gcHJvY2Vzc09rKHByb2Nlc3MpID8gbmV3IFNpZ25hbEV4aXQocHJvY2VzcykgOiBuZXcgU2lnbmFsRXhpdEZhbGxiYWNrKCk7XG4gIH1cbiAgcmV0dXJuIHNpZ25hbEV4aXQub25FeGl0KGNiLCBvcHRzKTtcbn07XG4iLCAiaW1wb3J0IHsgZW52aXJvbm1lbnQgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBjcmVhdGVSZWFkU3RyZWFtLCBjcmVhdGVXcml0ZVN0cmVhbSwgbWtkaXJTeW5jLCBTdGF0cyB9IGZyb20gXCJub2RlOmZzXCI7XG5pbXBvcnQgeyBzdGF0IH0gZnJvbSBcIm5vZGU6ZnMvcHJvbWlzZXNcIjtcbmltcG9ydCB7IGpvaW4sIG5vcm1hbGl6ZSB9IGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB7IHBpcGVsaW5lIH0gZnJvbSBcIm5vZGU6c3RyZWFtL3Byb21pc2VzXCI7XG5pbXBvcnQgeyB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBDaGFpbiBmcm9tIFwiLi92ZW5kb3JzL3N0cmVhbS1jaGFpblwiO1xuaW1wb3J0IHsgcGFyc2VyLCBQaWNrUGFyc2VyLCBTdHJlYW1BcnJheSB9IGZyb20gXCIuL3ZlbmRvcnMvc3RyZWFtLWpzb25cIjtcbmltcG9ydCB7IGlzSlNPTiB9IGZyb20gXCIuL2ZldGNoLXV0aWxzXCI7XG5pbXBvcnQgeyBGbGF0dGVuLCBGdW5jdGlvblJldHVybmluZ1BhZ2luYXRlZFByb21pc2UsIFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IENhY2hlZFByb21pc2VPcHRpb25zLCB1c2VDYWNoZWRQcm9taXNlIH0gZnJvbSBcIi4vdXNlQ2FjaGVkUHJvbWlzZVwiO1xuaW1wb3J0IHsgaGFzaCB9IGZyb20gXCIuL2hlbHBlcnNcIjtcblxudHlwZSBSZXF1ZXN0SW5mbyA9IHN0cmluZyB8IFVSTCB8IGdsb2JhbFRoaXMuUmVxdWVzdDtcblxuYXN5bmMgZnVuY3Rpb24gY2FjaGUodXJsOiBSZXF1ZXN0SW5mbywgZGVzdGluYXRpb246IHN0cmluZywgZmV0Y2hPcHRpb25zPzogUmVxdWVzdEluaXQpIHtcbiAgaWYgKHR5cGVvZiB1cmwgPT09IFwib2JqZWN0XCIgfHwgdXJsLnN0YXJ0c1dpdGgoXCJodHRwOi8vXCIpIHx8IHVybC5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikpIHtcbiAgICByZXR1cm4gYXdhaXQgY2FjaGVVUkwodXJsLCBkZXN0aW5hdGlvbiwgZmV0Y2hPcHRpb25zKTtcbiAgfSBlbHNlIGlmICh1cmwuc3RhcnRzV2l0aChcImZpbGU6Ly9cIikpIHtcbiAgICByZXR1cm4gYXdhaXQgY2FjaGVGaWxlKFxuICAgICAgbm9ybWFsaXplKGRlY29kZVVSSUNvbXBvbmVudChuZXcgVVJMKHVybCkucGF0aG5hbWUpKSxcbiAgICAgIGRlc3RpbmF0aW9uLFxuICAgICAgZmV0Y2hPcHRpb25zPy5zaWduYWwgPyBmZXRjaE9wdGlvbnMuc2lnbmFsIDogdW5kZWZpbmVkLFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiT25seSBIVFRQKFMpIG9yIGZpbGUgVVJMcyBhcmUgc3VwcG9ydGVkXCIpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhY2hlVVJMKHVybDogUmVxdWVzdEluZm8sIGRlc3RpbmF0aW9uOiBzdHJpbmcsIGZldGNoT3B0aW9ucz86IFJlcXVlc3RJbml0KSB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCBmZXRjaE9wdGlvbnMpO1xuXG4gIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggVVJMXCIpO1xuICB9XG5cbiAgaWYgKCFpc0pTT04ocmVzcG9uc2UuaGVhZGVycy5nZXQoXCJjb250ZW50LXR5cGVcIikpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVVJMIGRvZXMgbm90IHJldHVybiBKU09OXCIpO1xuICB9XG4gIGlmICghcmVzcG9uc2UuYm9keSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byByZXRyaWV2ZSBleHBlY3RlZCBKU09OIGNvbnRlbnQ6IFJlc3BvbnNlIGJvZHkgaXMgbWlzc2luZyBvciBpbmFjY2Vzc2libGUuXCIpO1xuICB9XG4gIGF3YWl0IHBpcGVsaW5lKFxuICAgIHJlc3BvbnNlLmJvZHkgYXMgdW5rbm93biBhcyBOb2RlSlMuUmVhZGFibGVTdHJlYW0sXG4gICAgY3JlYXRlV3JpdGVTdHJlYW0oZGVzdGluYXRpb24pLFxuICAgIGZldGNoT3B0aW9ucz8uc2lnbmFsID8geyBzaWduYWw6IGZldGNoT3B0aW9ucy5zaWduYWwgfSA6IHVuZGVmaW5lZCxcbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2FjaGVGaWxlKHNvdXJjZTogc3RyaW5nLCBkZXN0aW5hdGlvbjogc3RyaW5nLCBhYm9ydFNpZ25hbD86IEFib3J0U2lnbmFsKSB7XG4gIGF3YWl0IHBpcGVsaW5lKFxuICAgIGNyZWF0ZVJlYWRTdHJlYW0oc291cmNlKSxcbiAgICBjcmVhdGVXcml0ZVN0cmVhbShkZXN0aW5hdGlvbiksXG4gICAgYWJvcnRTaWduYWwgPyB7IHNpZ25hbDogYWJvcnRTaWduYWwgfSA6IHVuZGVmaW5lZCxcbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2FjaGVVUkxJZk5lY2Vzc2FyeShcbiAgdXJsOiBSZXF1ZXN0SW5mbyxcbiAgZm9sZGVyOiBzdHJpbmcsXG4gIGZpbGVOYW1lOiBzdHJpbmcsXG4gIGZvcmNlVXBkYXRlOiBib29sZWFuLFxuICBmZXRjaE9wdGlvbnM/OiBSZXF1ZXN0SW5pdCxcbikge1xuICBjb25zdCBkZXN0aW5hdGlvbiA9IGpvaW4oZm9sZGVyLCBmaWxlTmFtZSk7XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBzdGF0KGZvbGRlcik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBta2RpclN5bmMoZm9sZGVyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICBhd2FpdCBjYWNoZSh1cmwsIGRlc3RpbmF0aW9uLCBmZXRjaE9wdGlvbnMpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoZm9yY2VVcGRhdGUpIHtcbiAgICBhd2FpdCBjYWNoZSh1cmwsIGRlc3RpbmF0aW9uLCBmZXRjaE9wdGlvbnMpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBzdGF0czogU3RhdHMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIHRyeSB7XG4gICAgc3RhdHMgPSBhd2FpdCBzdGF0KGRlc3RpbmF0aW9uKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGF3YWl0IGNhY2hlKHVybCwgZGVzdGluYXRpb24sIGZldGNoT3B0aW9ucyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB1cmwgPT09IFwib2JqZWN0XCIgfHwgdXJsLnN0YXJ0c1dpdGgoXCJodHRwOi8vXCIpIHx8IHVybC5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikpIHtcbiAgICBjb25zdCBoZWFkUmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHsgLi4uZmV0Y2hPcHRpb25zLCBtZXRob2Q6IFwiSEVBRFwiIH0pO1xuICAgIGlmICghaGVhZFJlc3BvbnNlLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZmV0Y2ggVVJMXCIpO1xuICAgIH1cblxuICAgIGlmICghaXNKU09OKGhlYWRSZXNwb25zZS5oZWFkZXJzLmdldChcImNvbnRlbnQtdHlwZVwiKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVSTCBkb2VzIG5vdCByZXR1cm4gSlNPTlwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0TW9kaWZpZWQgPSBEYXRlLnBhcnNlKGhlYWRSZXNwb25zZS5oZWFkZXJzLmdldChcImxhc3QtbW9kaWZpZWRcIikgPz8gXCJcIik7XG4gICAgaWYgKHN0YXRzLnNpemUgPT09IDAgfHwgTnVtYmVyLmlzTmFOKGxhc3RNb2RpZmllZCkgfHwgbGFzdE1vZGlmaWVkID4gc3RhdHMubXRpbWVNcykge1xuICAgICAgYXdhaXQgY2FjaGUodXJsLCBkZXN0aW5hdGlvbiwgZmV0Y2hPcHRpb25zKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gZWxzZSBpZiAodXJsLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNvdXJjZVN0YXRzID0gYXdhaXQgc3RhdChub3JtYWxpemUoZGVjb2RlVVJJQ29tcG9uZW50KG5ldyBVUkwodXJsKS5wYXRobmFtZSkpKTtcbiAgICAgIGlmIChzb3VyY2VTdGF0cy5tdGltZU1zID4gc3RhdHMubXRpbWVNcykge1xuICAgICAgICBhd2FpdCBjYWNoZSh1cmwsIGRlc3RpbmF0aW9uLCBmZXRjaE9wdGlvbnMpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdXJjZSBmaWxlIGNvdWxkIG5vdCBiZSByZWFkXCIpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJPbmx5IEhUVFAoUykgb3IgZmlsZSBVUkxzIGFyZSBzdXBwb3J0ZWRcIik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24qIHN0cmVhbUpzb25GaWxlPFQ+KFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICBwYWdlU2l6ZTogbnVtYmVyLFxuICBhYm9ydFNpZ25hbD86IEFib3J0U2lnbmFsLFxuICBkYXRhUGF0aD86IHN0cmluZyB8IFJlZ0V4cCxcbiAgZmlsdGVyRm4/OiAoaXRlbTogRmxhdHRlbjxUPikgPT4gYm9vbGVhbixcbiAgdHJhbnNmb3JtRm4/OiAoaXRlbTogYW55KSA9PiBULFxuKTogQXN5bmNHZW5lcmF0b3I8VCBleHRlbmRzIHVua25vd25bXSA/IFQgOiBUW10+IHtcbiAgbGV0IHBhZ2U6IFQgZXh0ZW5kcyB1bmtub3duW10gPyBUIDogVFtdID0gW10gYXMgVCBleHRlbmRzIHVua25vd25bXSA/IFQgOiBUW107XG5cbiAgY29uc3QgcGlwZWxpbmUgPSBDaGFpbihbXG4gICAgY3JlYXRlUmVhZFN0cmVhbShmaWxlUGF0aCksXG4gICAgZGF0YVBhdGggPyBQaWNrUGFyc2VyKHsgZmlsdGVyOiBkYXRhUGF0aCB9KSA6IHBhcnNlcigpLFxuICAgIFN0cmVhbUFycmF5KCksXG4gICAgKGRhdGE6IGFueSkgPT4gdHJhbnNmb3JtRm4/LihkYXRhLnZhbHVlKSA/PyBkYXRhLnZhbHVlLFxuICBdKTtcblxuICBhYm9ydFNpZ25hbD8uYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsICgpID0+IHtcbiAgICBwaXBlbGluZS5kZXN0cm95KCk7XG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgZm9yIGF3YWl0IChjb25zdCBkYXRhIG9mIHBpcGVsaW5lKSB7XG4gICAgICBpZiAoYWJvcnRTaWduYWw/LmFib3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgaWYgKCFmaWx0ZXJGbiB8fCBmaWx0ZXJGbihkYXRhKSkge1xuICAgICAgICBwYWdlLnB1c2goZGF0YSk7XG4gICAgICB9XG4gICAgICBpZiAocGFnZS5sZW5ndGggPj0gcGFnZVNpemUpIHtcbiAgICAgICAgeWllbGQgcGFnZTtcbiAgICAgICAgcGFnZSA9IFtdIGFzIFQgZXh0ZW5kcyB1bmtub3duW10gPyBUIDogVFtdO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIHBpcGVsaW5lLmRlc3Ryb3koKTtcbiAgICB0aHJvdyBlO1xuICB9XG5cbiAgaWYgKHBhZ2UubGVuZ3RoID4gMCkge1xuICAgIHlpZWxkIHBhZ2U7XG4gIH1cblxuICByZXR1cm4gW107XG59XG5cbnR5cGUgT3B0aW9uczxUPiA9IHtcbiAgLyoqXG4gICAqIFRoZSBob29rIGV4cGVjdHMgdG8gaXRlcmF0ZSB0aHJvdWdoIGFuIGFycmF5IG9mIGRhdGEsIHNvIGJ5IGRlZmF1bHQsIGl0IGFzc3VtZXMgdGhlIEpTT04gaXQgcmVjZWl2ZXMgaXRzZWxmIHJlcHJlc2VudHMgYW4gYXJyYXkuIEhvd2V2ZXIsIHNvbWV0aW1lcyB0aGUgYXJyYXkgb2YgZGF0YSBpcyB3cmFwcGVkIGluIGFuIG9iamVjdCxcbiAgICogaS5lLiBgeyBcInN1Y2Nlc3NcIjogdHJ1ZSwgXCJkYXRhXCI6IFvigKZdIH1gLCBvciBldmVuIGB7IFwic3VjY2Vzc1wiOiB0cnVlLCBcInJlc3VsdHNcIjogeyBcImRhdGFcIjogW+KApl0gfSB9YC4gSW4gdGhvc2UgY2FzZXMsIHlvdSBjYW4gdXNlIGBkYXRhUGF0aGAgdG8gc3BlY2lmeSB3aGVyZSB0aGUgZGF0YSBhcnJheSBjYW4gYmUgZm91bmQuXG4gICAqXG4gICAqIEByZW1hcmsgSWYgeW91ciBKU09OIG9iamVjdCBoYXMgbXVsdGlwbGUgYXJyYXlzIHRoYXQgeW91IHdhbnQgdG8gc3RyZWFtIGRhdGEgZnJvbSwgeW91IGNhbiBwYXNzIGEgcmVndWxhciBleHByZXNzaW9uIHRvIHN0cmVhbSB0aHJvdWdoIGFsbCBvZiB0aGVtLlxuICAgKlxuICAgKiBAZXhhbXBsZSBGb3IgYHsgXCJzdWNjZXNzXCI6IHRydWUsIFwiZGF0YVwiOiBb4oCmXSB9YCwgZGF0YVBhdGggd291bGQgYmUgYGRhdGFgXG4gICAqIEBleGFtcGxlIEZvciBgeyBcInN1Y2Nlc3NcIjogdHJ1ZSwgXCJyZXN1bHRzXCI6IHsgXCJkYXRhXCI6IFvigKZdIH0gfWAsIGRhdGFQYXRoIHdvdWxkIGJlIGByZXN1bHRzLmRhdGFgXG4gICAqIEBleGFtcGxlIEZvciBgeyBcInN1Y2Nlc3NcIjogdHJ1ZSwgXCJyZXN1bHRzXCI6IHsgXCJmaXJzdF9saXN0XCI6IFvigKZdLCBcInNlY29uZF9saXN0XCI6IFvigKZdLCBcInRoaXJkX2xpc3RcIjogW+KApl0gfSB9YCwgZGF0YVBhdGggd291bGQgYmUgYC9ecmVzdWx0c1xcLihmaXJzdF9saXN0fHNlY29uZF9saXN0fHRoaXJkX2xpc3QpJFxuL2AuXG4gICAqL1xuICBkYXRhUGF0aD86IHN0cmluZyB8IFJlZ0V4cDtcbiAgLyoqXG4gICAqIEEgZnVuY3Rpb24gdG8gZGVjaWRlIHdoZXRoZXIgYSBwYXJ0aWN1bGFyIGl0ZW0gc2hvdWxkIGJlIGtlcHQgb3Igbm90LlxuICAgKiBEZWZhdWx0cyB0byBgdW5kZWZpbmVkYCwga2VlcGluZyBhbnkgZW5jb3VudGVyZWQgaXRlbS5cbiAgICpcbiAgICogQHJlbWFyayBUaGUgaG9vayB3aWxsIHJldmFsaWRhdGUgZXZlcnkgdGltZSB0aGUgZmlsdGVyIGZ1bmN0aW9uIGNoYW5nZXMsIHNvIHlvdSBuZWVkIHRvIHVzZSBbdXNlQ2FsbGJhY2tdKGh0dHBzOi8vcmVhY3QuZGV2L3JlZmVyZW5jZS9yZWFjdC91c2VDYWxsYmFjaykgdG8gbWFrZSBzdXJlIGl0IG9ubHkgY2hhbmdlcyB3aGVuIGl0IG5lZWRzIHRvLlxuICAgKi9cbiAgZmlsdGVyPzogKGl0ZW06IEZsYXR0ZW48VD4pID0+IGJvb2xlYW47XG4gIC8qKlxuICAgKiBBIGZ1bmN0aW9uIHRvIGFwcGx5IHRvIGVhY2ggaXRlbSBhcyBpdCBpcyBlbmNvdW50ZXJlZC4gVXNlZnVsIGZvciBhIGNvdXBsZSBvZiB0aGluZ3M6XG4gICAqIDEuIGVuc3VyaW5nIHRoYXQgYWxsIGl0ZW1zIGhhdmUgdGhlIGV4cGVjdGVkIHByb3BlcnRpZXMsIGFuZCwgYXMgb24gb3B0aW1pemF0aW9uLCBmb3IgZ2V0dGluZyByaWQgb2YgdGhlIHByb3BlcnRpZXMgdGhhdCB5b3UgZG9uJ3QgY2FyZSBhYm91dC5cbiAgICogMi4gd2hlbiB0b3AtbGV2ZWwgb2JqZWN0cyBhY3R1YWxseSByZXByZXNlbnQgbmVzdGVkIGRhdGEsIHdoaWNoIHNob3VsZCBiZSBmbGF0dGVuZWQuIEluIHRoaXMgY2FzZSwgYHRyYW5zZm9ybWAgY2FuIHJldHVybiBhbiBhcnJheSBvZiBpdGVtcywgYW5kIHRoZSBob29rIHdpbGwgc3RyZWFtIHRocm91Z2ggZWFjaCBvbmUgb2YgdGhvc2UgaXRlbXMsXG4gICAqIHBhc3NpbmcgdGhlbSB0byBgZmlsdGVyYCBldGMuXG4gICAqXG4gICAqIERlZmF1bHRzIHRvIGEgcGFzc3Rocm91Z2ggZnVuY3Rpb24gaWYgbm90IHByb3ZpZGVkLlxuICAgKlxuICAgKiBAcmVtYXJrIFRoZSBob29rIHdpbGwgcmV2YWxpZGF0ZSBldmVyeSB0aW1lIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gY2hhbmdlcywgc28gaXQgaXMgaW1wb3J0YW50IHRvIHVzZSBbdXNlQ2FsbGJhY2tdKGh0dHBzOi8vcmVhY3QuZGV2L3JlZmVyZW5jZS9yZWFjdC91c2VDYWxsYmFjaykgdG8gZW5zdXJlIGl0IG9ubHkgY2hhbmdlcyB3aGVuIG5lY2Vzc2FyeSB0byBwcmV2ZW50IHVubmVjZXNzYXJ5IHJlLXJlbmRlcnMgb3IgY29tcHV0YXRpb25zLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGBcbiAgICogLy8gRm9yIGRhdGE6IGB7IFwiZGF0YVwiOiBbIHsgXCJ0eXBlXCI6IFwiZm9sZGVyXCIsIFwibmFtZVwiOiBcIml0ZW0gMVwiLCBcImNoaWxkcmVuXCI6IFsgeyBcInR5cGVcIjogXCJpdGVtXCIsIFwibmFtZVwiOiBcIml0ZW0gMlwiIH0sIHsgXCJ0eXBlXCI6IFwiaXRlbVwiLCBcIm5hbWVcIjogXCJpdGVtIDNcIiB9IF0gfSwgeyBcInR5cGVcIjogXCJmb2xkZXJcIiwgXCJuYW1lXCI6IFwiaXRlbSA0XCIsIGNoaWxkcmVuOiBbXSB9IF0gfWBcbiAgICpcbiAgICogdHlwZSBJdGVtID0ge1xuICAgKiAgdHlwZTogXCJpdGVtXCI7XG4gICAqICBuYW1lOiBzdHJpbmc7XG4gICAqIH07XG4gICAqXG4gICAqIHR5cGUgRm9sZGVyID0ge1xuICAgKiAgIHR5cGU6IFwiZm9sZGVyXCI7XG4gICAqICAgbmFtZTogc3RyaW5nO1xuICAgKiAgIGNoaWxkcmVuOiAoSXRlbSB8IEZvbGRlcilbXTtcbiAgICogfTtcbiAgICpcbiAgICogZnVuY3Rpb24gZmxhdHRlbihpdGVtOiBJdGVtIHwgRm9sZGVyKTogeyBuYW1lOiBzdHJpbmcgfVtdIHtcbiAgICogICBjb25zdCBmbGF0dGVuZWQ6IHsgbmFtZTogc3RyaW5nIH1bXSA9IFtdO1xuICAgKiAgIGlmIChpdGVtLnR5cGUgPT09IFwiZm9sZGVyXCIpIHtcbiAgICogICAgIGZsYXR0ZW5lZC5wdXNoKC4uLml0ZW0uY2hpbGRyZW4ubWFwKGZsYXR0ZW4pLmZsYXQoKSk7XG4gICAqICAgfVxuICAgKiAgIGlmIChpdGVtLnR5cGUgPT09IFwiaXRlbVwiKSB7XG4gICAqICAgICBmbGF0dGVuZWQucHVzaCh7IG5hbWU6IGl0ZW0ubmFtZSB9KTtcbiAgICogICB9XG4gICAqICAgcmV0dXJuIGZsYXR0ZW5lZDtcbiAgICogfVxuICAgKlxuICAgKiBjb25zdCB0cmFuc2Zvcm0gPSB1c2VDYWxsYmFjayhmbGF0dGVuLCBbXSk7XG4gICAqIGNvbnN0IGZpbHRlciA9IHVzZUNhbGxiYWNrKChpdGVtOiB7IG5hbWU6IHN0cmluZyB9KSA9PiB7XG4gICAqICAg4oCmXG4gICAqIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgdHJhbnNmb3JtPzogKGl0ZW06IGFueSkgPT4gVDtcbiAgLyoqXG4gICAqIFRoZSBhbW91bnQgb2YgaXRlbXMgdG8gcmV0dXJuIGZvciBlYWNoIHBhZ2UuXG4gICAqIERlZmF1bHRzIHRvIGAyMGAuXG4gICAqL1xuICBwYWdlU2l6ZT86IG51bWJlcjtcbn07XG5cbi8qKlxuICogVGFrZXMgYSBgaHR0cDovL2AsIGBodHRwczovL2Agb3IgYGZpbGU6Ly8vYCBVUkwgcG9pbnRpbmcgdG8gYSBKU09OIHJlc291cmNlLCBjYWNoZXMgaXQgdG8gdGhlIGNvbW1hbmQncyBzdXBwb3J0XG4gKiBmb2xkZXIsIGFuZCBzdHJlYW1zIHRocm91Z2ggaXRzIGNvbnRlbnQuIFVzZWZ1bCB3aGVuIGRlYWxpbmcgd2l0aCBsYXJnZSBKU09OIGFycmF5cyB3aGljaCB3b3VsZCBiZSB0b28gYmlnIHRvIGZpdFxuICogaW4gdGhlIGNvbW1hbmQncyBtZW1vcnkuXG4gKlxuICogQHJlbWFyayBUaGUgSlNPTiByZXNvdXJjZSBuZWVkcyB0byBjb25zaXN0IG9mIGFuIGFycmF5IG9mIG9iamVjdHNcbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyBMaXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgdXNlU3RyZWFtSlNPTiB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICpcbiAqIHR5cGUgRm9ybXVsYSA9IHsgbmFtZTogc3RyaW5nOyBkZXNjPzogc3RyaW5nIH07XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWFpbigpOiBSZWFjdC5KU1guRWxlbWVudCB7XG4gKiAgIGNvbnN0IHsgZGF0YSwgaXNMb2FkaW5nLCBwYWdpbmF0aW9uIH0gPSB1c2VTdHJlYW1KU09OPEZvcm11bGE+KFwiaHR0cHM6Ly9mb3JtdWxhZS5icmV3LnNoL2FwaS9mb3JtdWxhLmpzb25cIik7XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxMaXN0IGlzTG9hZGluZz17aXNMb2FkaW5nfSBwYWdpbmF0aW9uPXtwYWdpbmF0aW9ufT5cbiAqICAgICAgIDxMaXN0LlNlY3Rpb24gdGl0bGU9XCJGb3JtdWxhZVwiPlxuICogICAgICAgICB7ZGF0YT8ubWFwKChkKSA9PiA8TGlzdC5JdGVtIGtleT17ZC5uYW1lfSB0aXRsZT17ZC5uYW1lfSBzdWJ0aXRsZT17ZC5kZXNjfSAvPil9XG4gKiAgICAgICA8L0xpc3QuU2VjdGlvbj5cbiAqICAgICA8L0xpc3Q+XG4gKiAgICk7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyBMaXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgdXNlU3RyZWFtSlNPTiB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICogaW1wb3J0IHsgaG9tZWRpciB9IGZyb20gXCJvc1wiO1xuICogaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG4gKlxuICogdHlwZSBGb3JtdWxhID0geyBuYW1lOiBzdHJpbmc7IGRlc2M/OiBzdHJpbmcgfTtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBNYWluKCk6IFJlYWN0LkpTWC5FbGVtZW50IHtcbiAqICAgY29uc3QgeyBkYXRhLCBpc0xvYWRpbmcsIHBhZ2luYXRpb24gfSA9IHVzZVN0cmVhbUpTT048Rm9ybXVsYT4oYGZpbGU6Ly8vJHtqb2luKGhvbWVkaXIoKSwgXCJEb3dubG9hZHNcIiwgXCJmb3JtdWxhZS5qc29uXCIpfWApO1xuICpcbiAqICAgcmV0dXJuIChcbiAqICAgICA8TGlzdCBpc0xvYWRpbmc9e2lzTG9hZGluZ30gcGFnaW5hdGlvbj17cGFnaW5hdGlvbn0+XG4gKiAgICAgICA8TGlzdC5TZWN0aW9uIHRpdGxlPVwiRm9ybXVsYWVcIj5cbiAqICAgICAgICAge2RhdGE/Lm1hcCgoZCkgPT4gPExpc3QuSXRlbSBrZXk9e2QubmFtZX0gdGl0bGU9e2QubmFtZX0gc3VidGl0bGU9e2QuZGVzY30gLz4pfVxuICogICAgICAgPC9MaXN0LlNlY3Rpb24+XG4gKiAgICAgPC9MaXN0PlxuICogICApO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VTdHJlYW1KU09OPFQsIFUgPSB1bmtub3duPih1cmw6IFJlcXVlc3RJbmZvKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VCwgVT47XG5cbi8qKlxuICogVGFrZXMgYSBgaHR0cDovL2AsIGBodHRwczovL2Agb3IgYGZpbGU6Ly8vYCBVUkwgcG9pbnRpbmcgdG8gYSBKU09OIHJlc291cmNlLCBjYWNoZXMgaXQgdG8gdGhlIGNvbW1hbmQncyBzdXBwb3J0XG4gKiBmb2xkZXIsIGFuZCBzdHJlYW1zIHRocm91Z2ggaXRzIGNvbnRlbnQuIFVzZWZ1bCB3aGVuIGRlYWxpbmcgd2l0aCBsYXJnZSBKU09OIGFycmF5cyB3aGljaCB3b3VsZCBiZSB0b28gYmlnIHRvIGZpdFxuICogaW4gdGhlIGNvbW1hbmQncyBtZW1vcnkuXG4gKlxuICogQHJlbWFyayBUaGUgSlNPTiByZXNvdXJjZSBuZWVkcyB0byBjb25zaXN0IG9mIGFuIGFycmF5IG9mIG9iamVjdHNcbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyBMaXN0LCBlbnZpcm9ubWVudCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZVN0cmVhbUpTT04gfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqIGltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbiAqIGltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuICpcbiAqIHR5cGUgRm9ybXVsYSA9IHsgbmFtZTogc3RyaW5nOyBkZXNjPzogc3RyaW5nIH07XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWFpbigpOiBSZWFjdC5KU1guRWxlbWVudCB7XG4gKiAgIGNvbnN0IFtzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICpcbiAqICAgY29uc3QgZm9ybXVsYUZpbHRlciA9IHVzZUNhbGxiYWNrKFxuICogICAgIChpdGVtOiBGb3JtdWxhKSA9PiB7XG4gKiAgICAgICBpZiAoIXNlYXJjaFRleHQpIHJldHVybiB0cnVlO1xuICogICAgICAgcmV0dXJuIGl0ZW0ubmFtZS50b0xvY2FsZUxvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRleHQpO1xuICogICAgIH0sXG4gKiAgICAgW3NlYXJjaFRleHRdLFxuICogICApO1xuICpcbiAqICAgY29uc3QgZm9ybXVsYVRyYW5zZm9ybSA9IHVzZUNhbGxiYWNrKChpdGVtOiBhbnkpOiBGb3JtdWxhID0+IHtcbiAqICAgICByZXR1cm4geyBuYW1lOiBpdGVtLm5hbWUsIGRlc2M6IGl0ZW0uZGVzYyB9O1xuICogICB9LCBbXSk7XG4gKlxuICogICBjb25zdCB7IGRhdGEsIGlzTG9hZGluZywgcGFnaW5hdGlvbiB9ID0gdXNlU3RyZWFtSlNPTihcImh0dHBzOi8vZm9ybXVsYWUuYnJldy5zaC9hcGkvZm9ybXVsYS5qc29uXCIsIHtcbiAqICAgICBpbml0aWFsRGF0YTogW10gYXMgRm9ybXVsYVtdLFxuICogICAgIHBhZ2VTaXplOiAyMCxcbiAqICAgICBmaWx0ZXI6IGZvcm11bGFGaWx0ZXIsXG4gKiAgICAgdHJhbnNmb3JtOiBmb3JtdWxhVHJhbnNmb3JtLFxuICogICB9KTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9IHBhZ2luYXRpb249e3BhZ2luYXRpb259IG9uU2VhcmNoVGV4dENoYW5nZT17c2V0U2VhcmNoVGV4dH0+XG4gKiAgICAgICA8TGlzdC5TZWN0aW9uIHRpdGxlPVwiRm9ybXVsYWVcIj5cbiAqICAgICAgICAge2RhdGEubWFwKChkKSA9PiAoXG4gKiAgICAgICAgICAgPExpc3QuSXRlbSBrZXk9e2QubmFtZX0gdGl0bGU9e2QubmFtZX0gc3VidGl0bGU9e2QuZGVzY30gLz5cbiAqICAgICAgICAgKSl9XG4gKiAgICAgICA8L0xpc3QuU2VjdGlvbj5cbiAqICAgICA8L0xpc3Q+XG4gKiAgICk7XG4gKiB9XG4gKiBgYGAgc3VwcG9ydCBmb2xkZXIsIGFuZCBzdHJlYW1zIHRocm91Z2ggaXRzIGNvbnRlbnQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgTGlzdCwgZW52aXJvbm1lbnQgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG4gKiBpbXBvcnQgeyB1c2VTdHJlYW1KU09OIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKiBpbXBvcnQgeyBqb2luIH0gZnJvbSBcInBhdGhcIjtcbiAqIGltcG9ydCB7IGhvbWVkaXIgfSBmcm9tIFwib3NcIjtcbiAqIGltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuICpcbiAqIHR5cGUgRm9ybXVsYSA9IHsgbmFtZTogc3RyaW5nOyBkZXNjPzogc3RyaW5nIH07XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWFpbigpOiBSZWFjdC5KU1guRWxlbWVudCB7XG4gKiAgIGNvbnN0IFtzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICpcbiAqICAgY29uc3QgZm9ybXVsYUZpbHRlciA9IHVzZUNhbGxiYWNrKFxuICogICAgIChpdGVtOiBGb3JtdWxhKSA9PiB7XG4gKiAgICAgICBpZiAoIXNlYXJjaFRleHQpIHJldHVybiB0cnVlO1xuICogICAgICAgcmV0dXJuIGl0ZW0ubmFtZS50b0xvY2FsZUxvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRleHQpO1xuICogICAgIH0sXG4gKiAgICAgW3NlYXJjaFRleHRdLFxuICogICApO1xuICpcbiAqICAgY29uc3QgZm9ybXVsYVRyYW5zZm9ybSA9IHVzZUNhbGxiYWNrKChpdGVtOiBhbnkpOiBGb3JtdWxhID0+IHtcbiAqICAgICByZXR1cm4geyBuYW1lOiBpdGVtLm5hbWUsIGRlc2M6IGl0ZW0uZGVzYyB9O1xuICogICB9LCBbXSk7XG4gKlxuICogICBjb25zdCB7IGRhdGEsIGlzTG9hZGluZywgcGFnaW5hdGlvbiB9ID0gdXNlU3RyZWFtSlNPTihgZmlsZTovLy8ke2pvaW4oaG9tZWRpcigpLCBcIkRvd25sb2Fkc1wiLCBcImZvcm11bGFlLmpzb25cIil9YCwge1xuICogICAgIGluaXRpYWxEYXRhOiBbXSBhcyBGb3JtdWxhW10sXG4gKiAgICAgcGFnZVNpemU6IDIwLFxuICogICAgIGZpbHRlcjogZm9ybXVsYUZpbHRlcixcbiAqICAgICB0cmFuc2Zvcm06IGZvcm11bGFUcmFuc2Zvcm0sXG4gKiAgIH0pO1xuICpcbiAqICAgcmV0dXJuIChcbiAqICAgICA8TGlzdCBpc0xvYWRpbmc9e2lzTG9hZGluZ30gcGFnaW5hdGlvbj17cGFnaW5hdGlvbn0gb25TZWFyY2hUZXh0Q2hhbmdlPXtzZXRTZWFyY2hUZXh0fT5cbiAqICAgICAgIDxMaXN0LlNlY3Rpb24gdGl0bGU9XCJGb3JtdWxhZVwiPlxuICogICAgICAgICB7ZGF0YS5tYXAoKGQpID0+IChcbiAqICAgICAgICAgICA8TGlzdC5JdGVtIGtleT17ZC5uYW1lfSB0aXRsZT17ZC5uYW1lfSBzdWJ0aXRsZT17ZC5kZXNjfSAvPlxuICogICAgICAgICApKX1cbiAqICAgICAgIDwvTGlzdC5TZWN0aW9uPlxuICogICAgIDwvTGlzdD5cbiAqICAgKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlU3RyZWFtSlNPTjxULCBVIGV4dGVuZHMgYW55W10gPSBhbnlbXT4oXG4gIHVybDogUmVxdWVzdEluZm8sXG4gIG9wdGlvbnM6IE9wdGlvbnM8VD4gJiBSZXF1ZXN0SW5pdCAmIE9taXQ8Q2FjaGVkUHJvbWlzZU9wdGlvbnM8RnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLCBVPiwgXCJhYm9ydGFibGVcIj4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxUIGV4dGVuZHMgdW5rbm93bltdID8gVCA6IFRbXSwgVT47XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VTdHJlYW1KU09OPFQsIFUgZXh0ZW5kcyBhbnlbXSA9IGFueVtdPihcbiAgdXJsOiBSZXF1ZXN0SW5mbyxcbiAgb3B0aW9ucz86IE9wdGlvbnM8VD4gJiBSZXF1ZXN0SW5pdCAmIE9taXQ8Q2FjaGVkUHJvbWlzZU9wdGlvbnM8RnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLCBVPiwgXCJhYm9ydGFibGVcIj4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxUIGV4dGVuZHMgdW5rbm93bltdID8gVCA6IFRbXSwgVT4ge1xuICBjb25zdCB7XG4gICAgaW5pdGlhbERhdGEsXG4gICAgZXhlY3V0ZSxcbiAgICBrZWVwUHJldmlvdXNEYXRhLFxuICAgIG9uRXJyb3IsXG4gICAgb25EYXRhLFxuICAgIG9uV2lsbEV4ZWN1dGUsXG4gICAgZmFpbHVyZVRvYXN0T3B0aW9ucyxcbiAgICBkYXRhUGF0aCxcbiAgICBmaWx0ZXIsXG4gICAgdHJhbnNmb3JtLFxuICAgIHBhZ2VTaXplID0gMjAsXG4gICAgLi4uZmV0Y2hPcHRpb25zXG4gIH0gPSBvcHRpb25zID8/IHt9O1xuICBjb25zdCBwcmV2aW91c1VybCA9IHVzZVJlZjxSZXF1ZXN0SW5mbz4obnVsbCk7XG4gIGNvbnN0IHByZXZpb3VzRGVzdGluYXRpb24gPSB1c2VSZWY8c3RyaW5nPihudWxsKTtcblxuICBjb25zdCB1c2VDYWNoZWRQcm9taXNlT3B0aW9uczogQ2FjaGVkUHJvbWlzZU9wdGlvbnM8RnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLCBVPiA9IHtcbiAgICBpbml0aWFsRGF0YSxcbiAgICBleGVjdXRlLFxuICAgIGtlZXBQcmV2aW91c0RhdGEsXG4gICAgb25FcnJvcixcbiAgICBvbkRhdGEsXG4gICAgb25XaWxsRXhlY3V0ZSxcbiAgICBmYWlsdXJlVG9hc3RPcHRpb25zLFxuICB9O1xuXG4gIGNvbnN0IGdlbmVyYXRvclJlZiA9IHVzZVJlZjxBc3luY0dlbmVyYXRvcjxUIGV4dGVuZHMgdW5rbm93bltdID8gVCA6IFRbXT4gfCBudWxsPihudWxsKTtcbiAgY29uc3QgY29udHJvbGxlclJlZiA9IHVzZVJlZjxBYm9ydENvbnRyb2xsZXIgfCBudWxsPihudWxsKTtcbiAgY29uc3QgaGFzTW9yZVJlZiA9IHVzZVJlZihmYWxzZSk7XG5cbiAgcmV0dXJuIHVzZUNhY2hlZFByb21pc2UoXG4gICAgKFxuICAgICAgdXJsOiBSZXF1ZXN0SW5mbyxcbiAgICAgIHBhZ2VTaXplOiBudW1iZXIsXG4gICAgICBmZXRjaE9wdGlvbnM6IFJlcXVlc3RJbml0IHwgdW5kZWZpbmVkLFxuICAgICAgZGF0YVBhdGg6IHN0cmluZyB8IFJlZ0V4cCB8IHVuZGVmaW5lZCxcbiAgICAgIGZpbHRlcjogKChpdGVtOiBGbGF0dGVuPFQ+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCxcbiAgICAgIHRyYW5zZm9ybTogKChpdGVtOiB1bmtub3duKSA9PiBUKSB8IHVuZGVmaW5lZCxcbiAgICApID0+XG4gICAgICBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBoYXNoKHVybCkgKyBcIi5qc29uXCI7XG4gICAgICAgIGNvbnN0IGZvbGRlciA9IGVudmlyb25tZW50LnN1cHBvcnRQYXRoO1xuICAgICAgICBpZiAocGFnZSA9PT0gMCkge1xuICAgICAgICAgIGNvbnRyb2xsZXJSZWYuY3VycmVudD8uYWJvcnQoKTtcbiAgICAgICAgICBjb250cm9sbGVyUmVmLmN1cnJlbnQgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgY29uc3QgZGVzdGluYXRpb24gPSBqb2luKGZvbGRlciwgZmlsZU5hbWUpO1xuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZvcmNlIHVwZGF0ZSB0aGUgY2FjaGUgd2hlbiB0aGUgVVJMIGNoYW5nZXMgYnV0IHRoZSBjYWNoZSBkZXN0aW5hdGlvbiBkb2VzIG5vdC5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICBjb25zdCBmb3JjZUNhY2hlVXBkYXRlID0gQm9vbGVhbihcbiAgICAgICAgICAgIHByZXZpb3VzVXJsLmN1cnJlbnQgJiZcbiAgICAgICAgICAgICAgcHJldmlvdXNVcmwuY3VycmVudCAhPT0gdXJsICYmXG4gICAgICAgICAgICAgIHByZXZpb3VzRGVzdGluYXRpb24uY3VycmVudCAmJlxuICAgICAgICAgICAgICBwcmV2aW91c0Rlc3RpbmF0aW9uLmN1cnJlbnQgPT09IGRlc3RpbmF0aW9uLFxuICAgICAgICAgICk7XG4gICAgICAgICAgcHJldmlvdXNVcmwuY3VycmVudCA9IHVybDtcbiAgICAgICAgICBwcmV2aW91c0Rlc3RpbmF0aW9uLmN1cnJlbnQgPSBkZXN0aW5hdGlvbjtcbiAgICAgICAgICBhd2FpdCBjYWNoZVVSTElmTmVjZXNzYXJ5KHVybCwgZm9sZGVyLCBmaWxlTmFtZSwgZm9yY2VDYWNoZVVwZGF0ZSwge1xuICAgICAgICAgICAgLi4uZmV0Y2hPcHRpb25zLFxuICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyUmVmLmN1cnJlbnQ/LnNpZ25hbCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBnZW5lcmF0b3JSZWYuY3VycmVudCA9IHN0cmVhbUpzb25GaWxlKFxuICAgICAgICAgICAgZGVzdGluYXRpb24sXG4gICAgICAgICAgICBwYWdlU2l6ZSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJSZWYuY3VycmVudD8uc2lnbmFsLFxuICAgICAgICAgICAgZGF0YVBhdGgsXG4gICAgICAgICAgICBmaWx0ZXIsXG4gICAgICAgICAgICB0cmFuc2Zvcm0sXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWdlbmVyYXRvclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgcmV0dXJuIHsgaGFzTW9yZTogaGFzTW9yZVJlZi5jdXJyZW50LCBkYXRhOiBbXSBhcyBUIGV4dGVuZHMgdW5rbm93bltdID8gVCA6IFRbXSB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgdmFsdWU6IG5ld0RhdGEsIGRvbmUgfSA9IGF3YWl0IGdlbmVyYXRvclJlZi5jdXJyZW50Lm5leHQoKTtcbiAgICAgICAgaGFzTW9yZVJlZi5jdXJyZW50ID0gIWRvbmU7XG4gICAgICAgIHJldHVybiB7IGhhc01vcmU6IGhhc01vcmVSZWYuY3VycmVudCwgZGF0YTogKG5ld0RhdGEgPz8gW10pIGFzIFQgZXh0ZW5kcyB1bmtub3duW10gPyBUIDogVFtdIH07XG4gICAgICB9LFxuICAgIFt1cmwsIHBhZ2VTaXplLCBmZXRjaE9wdGlvbnMsIGRhdGFQYXRoLCBmaWx0ZXIsIHRyYW5zZm9ybV0sXG4gICAgdXNlQ2FjaGVkUHJvbWlzZU9wdGlvbnMsXG4gICk7XG59XG4iLCAiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSAqL1xuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50ICovXG5pbXBvcnQgeyBSZWFkYWJsZSwgV3JpdGFibGUsIER1cGxleCB9IGZyb20gXCJub2RlOnN0cmVhbVwiO1xuXG5leHBvcnQgY29uc3Qgbm9uZSA9IC8qICNfX1BVUkVfXyAqLyBTeW1ib2wuZm9yKFwib2JqZWN0LXN0cmVhbS5ub25lXCIpO1xuY29uc3Qgc3RvcCA9IC8qICNfX1BVUkVfXyAqLyBTeW1ib2wuZm9yKFwib2JqZWN0LXN0cmVhbS5zdG9wXCIpO1xuXG5jb25zdCBmaW5hbFN5bWJvbCA9IC8qICNfX1BVUkVfXyAqLyBTeW1ib2wuZm9yKFwib2JqZWN0LXN0cmVhbS5maW5hbFwiKTtcbmNvbnN0IG1hbnlTeW1ib2wgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sLmZvcihcIm9iamVjdC1zdHJlYW0ubWFueVwiKTtcbmNvbnN0IGZsdXNoU3ltYm9sID0gLyogI19fUFVSRV9fICovIFN5bWJvbC5mb3IoXCJvYmplY3Qtc3RyZWFtLmZsdXNoXCIpO1xuY29uc3QgZkxpc3RTeW1ib2wgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sLmZvcihcIm9iamVjdC1zdHJlYW0uZkxpc3RcIik7XG5cbmNvbnN0IGZpbmFsVmFsdWUgPSAodmFsdWU6IGFueSkgPT4gKHsgW2ZpbmFsU3ltYm9sXTogMSwgdmFsdWUgfSk7XG5leHBvcnQgY29uc3QgbWFueSA9ICh2YWx1ZXM6IGFueSkgPT4gKHsgW21hbnlTeW1ib2xdOiAxLCB2YWx1ZXMgfSk7XG5cbmNvbnN0IGlzRmluYWxWYWx1ZSA9IChvOiBhbnkpID0+IG8gJiYgb1tmaW5hbFN5bWJvbF0gPT09IDE7XG5jb25zdCBpc01hbnkgPSAobzogYW55KSA9PiBvICYmIG9bbWFueVN5bWJvbF0gPT09IDE7XG5jb25zdCBpc0ZsdXNoYWJsZSA9IChvOiBhbnkpID0+IG8gJiYgb1tmbHVzaFN5bWJvbF0gPT09IDE7XG5jb25zdCBpc0Z1bmN0aW9uTGlzdCA9IChvOiBhbnkpID0+IG8gJiYgb1tmTGlzdFN5bWJvbF0gPT09IDE7XG5cbmNvbnN0IGdldEZpbmFsVmFsdWUgPSAobzogYW55KSA9PiBvLnZhbHVlO1xuY29uc3QgZ2V0TWFueVZhbHVlcyA9IChvOiBhbnkpID0+IG8udmFsdWVzO1xuY29uc3QgZ2V0RnVuY3Rpb25MaXN0ID0gKG86IGFueSkgPT4gby5mTGlzdDtcblxuZXhwb3J0IGNvbnN0IGNvbWJpbmVNYW55TXV0ID0gKGE6IGFueSwgYjogYW55KSA9PiB7XG4gIGNvbnN0IHZhbHVlcyA9IGEgPT09IG5vbmUgPyBbXSA6IGE/LlttYW55U3ltYm9sXSA9PT0gMSA/IGEudmFsdWVzIDogW2FdO1xuICBpZiAoYiA9PT0gbm9uZSkge1xuICAgIC8vIGRvIG5vdGhpbmdcbiAgfSBlbHNlIGlmIChiPy5bbWFueVN5bWJvbF0gPT09IDEpIHtcbiAgICB2YWx1ZXMucHVzaCguLi5iLnZhbHVlcyk7XG4gIH0gZWxzZSB7XG4gICAgdmFsdWVzLnB1c2goYik7XG4gIH1cbiAgcmV0dXJuIG1hbnkodmFsdWVzKTtcbn07XG5cbmV4cG9ydCBjb25zdCBmbHVzaGFibGUgPSAod3JpdGU6ICh2YWx1ZTogYW55KSA9PiBhbnksIGZpbmFsID0gbnVsbCkgPT4ge1xuICBjb25zdCBmbiA9IGZpbmFsID8gKHZhbHVlOiBhbnkpID0+ICh2YWx1ZSA9PT0gbm9uZSA/IGZpbmFsVmFsdWUodW5kZWZpbmVkKSA6IHdyaXRlKHZhbHVlKSkgOiB3cml0ZTtcbiAgLy8gQHRzLWlnbm9yZVxuICBmbltmbHVzaFN5bWJvbF0gPSAxO1xuICByZXR1cm4gZm47XG59O1xuXG5jb25zdCBzZXRGdW5jdGlvbkxpc3QgPSAobzogYW55LCBmbnM6IGFueSkgPT4ge1xuICBvLmZMaXN0ID0gZm5zO1xuICBvW2ZMaXN0U3ltYm9sXSA9IDE7XG4gIHJldHVybiBvO1xufTtcblxuLy8gaXMqTm9kZVN0cmVhbSBmdW5jdGlvbnMgdGFrZW4gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9tYXN0ZXIvbGliL2ludGVybmFsL3N0cmVhbXMvdXRpbHMuanNcbmNvbnN0IGlzUmVhZGFibGVOb2RlU3RyZWFtID0gKG9iajogYW55KSA9PlxuICBvYmogJiZcbiAgdHlwZW9mIG9iai5waXBlID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgdHlwZW9mIG9iai5vbiA9PT0gXCJmdW5jdGlvblwiICYmXG4gICghb2JqLl93cml0YWJsZVN0YXRlIHx8ICh0eXBlb2Ygb2JqLl9yZWFkYWJsZVN0YXRlID09PSBcIm9iamVjdFwiID8gb2JqLl9yZWFkYWJsZVN0YXRlLnJlYWRhYmxlIDogbnVsbCkgIT09IGZhbHNlKSAmJiAvLyBEdXBsZXhcbiAgKCFvYmouX3dyaXRhYmxlU3RhdGUgfHwgb2JqLl9yZWFkYWJsZVN0YXRlKTsgLy8gV3JpdGFibGUgaGFzIC5waXBlLlxuXG5jb25zdCBpc1dyaXRhYmxlTm9kZVN0cmVhbSA9IChvYmo6IGFueSkgPT5cbiAgb2JqICYmXG4gIHR5cGVvZiBvYmoud3JpdGUgPT09IFwiZnVuY3Rpb25cIiAmJlxuICB0eXBlb2Ygb2JqLm9uID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgKCFvYmouX3JlYWRhYmxlU3RhdGUgfHwgKHR5cGVvZiBvYmouX3dyaXRhYmxlU3RhdGUgPT09IFwib2JqZWN0XCIgPyBvYmouX3dyaXRhYmxlU3RhdGUud3JpdGFibGUgOiBudWxsKSAhPT0gZmFsc2UpOyAvLyBEdXBsZXhcblxuY29uc3QgaXNEdXBsZXhOb2RlU3RyZWFtID0gKG9iajogYW55KSA9PlxuICBvYmogJiZcbiAgdHlwZW9mIG9iai5waXBlID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgb2JqLl9yZWFkYWJsZVN0YXRlICYmXG4gIHR5cGVvZiBvYmoub24gPT09IFwiZnVuY3Rpb25cIiAmJlxuICB0eXBlb2Ygb2JqLndyaXRlID09PSBcImZ1bmN0aW9uXCI7XG5cbmNvbnN0IGlzUmVhZGFibGVXZWJTdHJlYW0gPSAob2JqOiBhbnkpID0+IG9iaiAmJiBnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtICYmIG9iaiBpbnN0YW5jZW9mIGdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW07XG5cbmNvbnN0IGlzV3JpdGFibGVXZWJTdHJlYW0gPSAob2JqOiBhbnkpID0+IG9iaiAmJiBnbG9iYWxUaGlzLldyaXRhYmxlU3RyZWFtICYmIG9iaiBpbnN0YW5jZW9mIGdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW07XG5cbmNvbnN0IGlzRHVwbGV4V2ViU3RyZWFtID0gKG9iajogYW55KSA9PlxuICBvYmogJiZcbiAgZ2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbSAmJlxuICBvYmoucmVhZGFibGUgaW5zdGFuY2VvZiBnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtICYmXG4gIGdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW0gJiZcbiAgb2JqLndyaXRhYmxlIGluc3RhbmNlb2YgZ2xvYmFsVGhpcy5Xcml0YWJsZVN0cmVhbTtcblxuY29uc3QgZ3JvdXBGdW5jdGlvbnMgPSAob3V0cHV0OiBhbnksIGZuOiBhbnksIGluZGV4OiBhbnksIGZuczogYW55KSA9PiB7XG4gIGlmIChcbiAgICBpc0R1cGxleE5vZGVTdHJlYW0oZm4pIHx8XG4gICAgKCFpbmRleCAmJiBpc1JlYWRhYmxlTm9kZVN0cmVhbShmbikpIHx8XG4gICAgKGluZGV4ID09PSBmbnMubGVuZ3RoIC0gMSAmJiBpc1dyaXRhYmxlTm9kZVN0cmVhbShmbikpXG4gICkge1xuICAgIG91dHB1dC5wdXNoKGZuKTtcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG4gIGlmIChpc0R1cGxleFdlYlN0cmVhbShmbikpIHtcbiAgICBvdXRwdXQucHVzaChEdXBsZXguZnJvbVdlYihmbiwgeyBvYmplY3RNb2RlOiB0cnVlIH0pKTtcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG4gIGlmICghaW5kZXggJiYgaXNSZWFkYWJsZVdlYlN0cmVhbShmbikpIHtcbiAgICBvdXRwdXQucHVzaChSZWFkYWJsZS5mcm9tV2ViKGZuLCB7IG9iamVjdE1vZGU6IHRydWUgfSkpO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cbiAgaWYgKGluZGV4ID09PSBmbnMubGVuZ3RoIC0gMSAmJiBpc1dyaXRhYmxlV2ViU3RyZWFtKGZuKSkge1xuICAgIG91dHB1dC5wdXNoKFdyaXRhYmxlLmZyb21XZWIoZm4sIHsgb2JqZWN0TW9kZTogdHJ1ZSB9KSk7XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuICBpZiAodHlwZW9mIGZuICE9IFwiZnVuY3Rpb25cIikgdGhyb3cgVHlwZUVycm9yKFwiSXRlbSAjXCIgKyBpbmRleCArIFwiIGlzIG5vdCBhIHByb3BlciBzdHJlYW0sIG5vciBhIGZ1bmN0aW9uLlwiKTtcbiAgaWYgKCFvdXRwdXQubGVuZ3RoKSBvdXRwdXQucHVzaChbXSk7XG4gIGNvbnN0IGxhc3QgPSBvdXRwdXRbb3V0cHV0Lmxlbmd0aCAtIDFdO1xuICBpZiAoQXJyYXkuaXNBcnJheShsYXN0KSkge1xuICAgIGxhc3QucHVzaChmbik7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0LnB1c2goW2ZuXSk7XG4gIH1cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbmNsYXNzIFN0b3AgZXh0ZW5kcyBFcnJvciB7fVxuXG5leHBvcnQgY29uc3QgYXNTdHJlYW0gPSAoZm46IGFueSkgPT4ge1xuICBpZiAodHlwZW9mIGZuICE9IFwiZnVuY3Rpb25cIikgdGhyb3cgVHlwZUVycm9yKFwiT25seSBhIGZ1bmN0aW9uIGlzIGFjY2VwdGVkIGFzIHRoZSBmaXJzdCBhcmd1bWVudFwiKTtcblxuICAvLyBwdW1wIHZhcmlhYmxlc1xuICBsZXQgcGF1c2VkID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIGxldCByZXNvbHZlUGF1c2VkOiAoKHZhbHVlOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIGNvbnN0IHF1ZXVlOiBhbnlbXSA9IFtdO1xuXG4gIC8vIHBhdXNlL3Jlc3VtZVxuICBjb25zdCByZXN1bWU6IGFueSA9ICgpID0+IHtcbiAgICBpZiAoIXJlc29sdmVQYXVzZWQpIHJldHVybjtcbiAgICByZXNvbHZlUGF1c2VkKCk7XG4gICAgcmVzb2x2ZVBhdXNlZCA9IG51bGw7XG4gICAgcGF1c2VkID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH07XG4gIGNvbnN0IHBhdXNlOiBhbnkgPSAoKSA9PiB7XG4gICAgaWYgKHJlc29sdmVQYXVzZWQpIHJldHVybjtcbiAgICBwYXVzZWQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gKHJlc29sdmVQYXVzZWQgPSByZXNvbHZlKSk7XG4gIH07XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1jb25zdFxuICBsZXQgc3RyZWFtOiBEdXBsZXg7IC8vIHdpbGwgYmUgYXNzaWduZWQgbGF0ZXJcblxuICAvLyBkYXRhIHByb2Nlc3NpbmdcbiAgY29uc3QgcHVzaFJlc3VsdHM6IGFueSA9ICh2YWx1ZXM6IGFueSkgPT4ge1xuICAgIGlmICh2YWx1ZXMgJiYgdHlwZW9mIHZhbHVlcy5uZXh0ID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gZ2VuZXJhdG9yXG4gICAgICBxdWV1ZS5wdXNoKHZhbHVlcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGFycmF5XG4gICAgcXVldWUucHVzaCh2YWx1ZXNbU3ltYm9sLml0ZXJhdG9yXSgpKTtcbiAgfTtcbiAgY29uc3QgcHVtcDogYW55ID0gYXN5bmMgKCkgPT4ge1xuICAgIHdoaWxlIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgIGF3YWl0IHBhdXNlZDtcbiAgICAgIGNvbnN0IGdlbiA9IHF1ZXVlW3F1ZXVlLmxlbmd0aCAtIDFdO1xuICAgICAgbGV0IHJlc3VsdCA9IGdlbi5uZXh0KCk7XG4gICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzdWx0O1xuICAgICAgfVxuICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgIHF1ZXVlLnBvcCgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGxldCB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdmFsdWUgPSBhd2FpdCB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHNhbml0aXplKHZhbHVlKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IHNhbml0aXplOiBhbnkgPSBhc3luYyAodmFsdWU6IGFueSkgPT4ge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSBub25lKSByZXR1cm47XG4gICAgaWYgKHZhbHVlID09PSBzdG9wKSB0aHJvdyBuZXcgU3RvcCgpO1xuXG4gICAgaWYgKGlzTWFueSh2YWx1ZSkpIHtcbiAgICAgIHB1c2hSZXN1bHRzKGdldE1hbnlWYWx1ZXModmFsdWUpKTtcbiAgICAgIHJldHVybiBwdW1wKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzRmluYWxWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIC8vIGEgZmluYWwgdmFsdWUgaXMgbm90IHN1cHBvcnRlZCwgaXQgaXMgdHJlYXRlZCBhcyBhIHJlZ3VsYXIgdmFsdWVcbiAgICAgIHZhbHVlID0gZ2V0RmluYWxWYWx1ZSh2YWx1ZSk7XG4gICAgICByZXR1cm4gcHJvY2Vzc1ZhbHVlKHZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAoIXN0cmVhbS5wdXNoKHZhbHVlKSkge1xuICAgICAgcGF1c2UoKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IHByb2Nlc3NDaHVuazogYW55ID0gYXN5bmMgKGNodW5rOiBhbnksIGVuY29kaW5nOiBhbnkpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdmFsdWUgPSBmbihjaHVuaywgZW5jb2RpbmcpO1xuICAgICAgYXdhaXQgcHJvY2Vzc1ZhbHVlKHZhbHVlKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgU3RvcCkge1xuICAgICAgICBzdHJlYW0ucHVzaChudWxsKTtcbiAgICAgICAgc3RyZWFtLmRlc3Ryb3koKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9O1xuICBjb25zdCBwcm9jZXNzVmFsdWU6IGFueSA9IGFzeW5jICh2YWx1ZTogYW55KSA9PiB7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50aGVuID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gdGhlbmFibGVcbiAgICAgIHJldHVybiB2YWx1ZS50aGVuKCh2YWx1ZTogYW55KSA9PiBwcm9jZXNzVmFsdWUodmFsdWUpKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS5uZXh0ID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gZ2VuZXJhdG9yXG4gICAgICBwdXNoUmVzdWx0cyh2YWx1ZSk7XG4gICAgICByZXR1cm4gcHVtcCgpO1xuICAgIH1cbiAgICByZXR1cm4gc2FuaXRpemUodmFsdWUpO1xuICB9O1xuXG4gIHN0cmVhbSA9IG5ldyBEdXBsZXgoXG4gICAgT2JqZWN0LmFzc2lnbih7IHdyaXRhYmxlT2JqZWN0TW9kZTogdHJ1ZSwgcmVhZGFibGVPYmplY3RNb2RlOiB0cnVlIH0sIHVuZGVmaW5lZCwge1xuICAgICAgd3JpdGUoY2h1bms6IGFueSwgZW5jb2Rpbmc6IGFueSwgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBwcm9jZXNzQ2h1bmsoY2h1bmssIGVuY29kaW5nKS50aGVuKFxuICAgICAgICAgICgpID0+IGNhbGxiYWNrKG51bGwpLFxuICAgICAgICAgIChlcnJvcjogYW55KSA9PiBjYWxsYmFjayhlcnJvciksXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgZmluYWwoY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBpZiAoIWlzRmx1c2hhYmxlKGZuKSkge1xuICAgICAgICAgIHN0cmVhbS5wdXNoKG51bGwpO1xuICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBwcm9jZXNzQ2h1bmsobm9uZSwgbnVsbCkudGhlbihcbiAgICAgICAgICAoKSA9PiAoc3RyZWFtLnB1c2gobnVsbCksIGNhbGxiYWNrKG51bGwpKSxcbiAgICAgICAgICAoZXJyb3I6IGFueSkgPT4gY2FsbGJhY2soZXJyb3IpLFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIHJlYWQoKSB7XG4gICAgICAgIHJlc3VtZSgpO1xuICAgICAgfSxcbiAgICB9KSxcbiAgKTtcblxuICByZXR1cm4gc3RyZWFtO1xufTtcblxuY29uc3QgcHJvZHVjZVN0cmVhbXMgPSAoaXRlbTogYW55KSA9PiB7XG4gIGlmIChBcnJheS5pc0FycmF5KGl0ZW0pKSB7XG4gICAgaWYgKCFpdGVtLmxlbmd0aCkgcmV0dXJuIG51bGw7XG4gICAgaWYgKGl0ZW0ubGVuZ3RoID09IDEpIHJldHVybiBpdGVtWzBdICYmIGFzU3RyZWFtKGl0ZW1bMF0pO1xuICAgIHJldHVybiBhc1N0cmVhbShnZW4oLi4uaXRlbSkpO1xuICB9XG4gIHJldHVybiBpdGVtO1xufTtcblxuY29uc3QgbmV4dDogYW55ID0gYXN5bmMgZnVuY3Rpb24qICh2YWx1ZTogYW55LCBmbnM6IGFueSwgaW5kZXg6IGFueSkge1xuICBmb3IgKGxldCBpID0gaW5kZXg7IGkgPD0gZm5zLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50aGVuID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gdGhlbmFibGVcbiAgICAgIHZhbHVlID0gYXdhaXQgdmFsdWU7XG4gICAgfVxuICAgIGlmICh2YWx1ZSA9PT0gbm9uZSkgYnJlYWs7XG4gICAgaWYgKHZhbHVlID09PSBzdG9wKSB0aHJvdyBuZXcgU3RvcCgpO1xuICAgIGlmIChpc0ZpbmFsVmFsdWUodmFsdWUpKSB7XG4gICAgICB5aWVsZCBnZXRGaW5hbFZhbHVlKHZhbHVlKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoaXNNYW55KHZhbHVlKSkge1xuICAgICAgY29uc3QgdmFsdWVzID0gZ2V0TWFueVZhbHVlcyh2YWx1ZSk7XG4gICAgICBpZiAoaSA9PSBmbnMubGVuZ3RoKSB7XG4gICAgICAgIHlpZWxkKiB2YWx1ZXM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHZhbHVlcy5sZW5ndGg7ICsraikge1xuICAgICAgICAgIHlpZWxkKiBuZXh0KHZhbHVlc1tqXSwgZm5zLCBpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUubmV4dCA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIGdlbmVyYXRvclxuICAgICAgZm9yICg7Oykge1xuICAgICAgICBsZXQgZGF0YSA9IHZhbHVlLm5leHQoKTtcbiAgICAgICAgaWYgKGRhdGEgJiYgdHlwZW9mIGRhdGEudGhlbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBkYXRhID0gYXdhaXQgZGF0YTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5kb25lKSBicmVhaztcbiAgICAgICAgaWYgKGkgPT0gZm5zLmxlbmd0aCkge1xuICAgICAgICAgIHlpZWxkIGRhdGEudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeWllbGQqIG5leHQoZGF0YS52YWx1ZSwgZm5zLCBpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChpID09IGZucy5sZW5ndGgpIHtcbiAgICAgIHlpZWxkIHZhbHVlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IGYgPSBmbnNbaV07XG4gICAgdmFsdWUgPSBmKHZhbHVlKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGdlbiA9ICguLi5mbnM6IGFueSkgPT4ge1xuICBmbnMgPSBmbnNcbiAgICAuZmlsdGVyKChmbjogYW55KSA9PiBmbilcbiAgICAuZmxhdChJbmZpbml0eSlcbiAgICAubWFwKChmbjogYW55KSA9PiAoaXNGdW5jdGlvbkxpc3QoZm4pID8gZ2V0RnVuY3Rpb25MaXN0KGZuKSA6IGZuKSlcbiAgICAuZmxhdChJbmZpbml0eSk7XG4gIGlmICghZm5zLmxlbmd0aCkge1xuICAgIGZucyA9IFsoeDogYW55KSA9PiB4XTtcbiAgfVxuICBsZXQgZmx1c2hlZCA9IGZhbHNlO1xuICBsZXQgZyA9IGFzeW5jIGZ1bmN0aW9uKiAodmFsdWU6IGFueSkge1xuICAgIGlmIChmbHVzaGVkKSB0aHJvdyBFcnJvcihcIkNhbGwgdG8gYSBmbHVzaGVkIHBpcGUuXCIpO1xuICAgIGlmICh2YWx1ZSAhPT0gbm9uZSkge1xuICAgICAgeWllbGQqIG5leHQodmFsdWUsIGZucywgMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZsdXNoZWQgPSB0cnVlO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgZiA9IGZuc1tpXTtcbiAgICAgICAgaWYgKGlzRmx1c2hhYmxlKGYpKSB7XG4gICAgICAgICAgeWllbGQqIG5leHQoZihub25lKSwgZm5zLCBpICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGNvbnN0IG5lZWRUb0ZsdXNoID0gZm5zLnNvbWUoKGZuOiBhbnkpID0+IGlzRmx1c2hhYmxlKGZuKSk7XG4gIGlmIChuZWVkVG9GbHVzaCkgZyA9IGZsdXNoYWJsZShnKTtcbiAgcmV0dXJuIHNldEZ1bmN0aW9uTGlzdChnLCBmbnMpO1xufTtcblxuY29uc3Qgd3JpdGUgPSAoaW5wdXQ6IGFueSwgY2h1bms6IGFueSwgZW5jb2Rpbmc6IGFueSwgY2FsbGJhY2s6IGFueSkgPT4ge1xuICBsZXQgZXJyb3I6IGFueSA9IG51bGw7XG4gIHRyeSB7XG4gICAgaW5wdXQud3JpdGUoY2h1bmssIGVuY29kaW5nLCAoZTogYW55KSA9PiBjYWxsYmFjayhlIHx8IGVycm9yKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvciA9IGU7XG4gIH1cbn07XG5cbmNvbnN0IGZpbmFsID0gKGlucHV0OiBhbnksIGNhbGxiYWNrOiBhbnkpID0+IHtcbiAgbGV0IGVycm9yOiBhbnkgPSBudWxsO1xuICB0cnkge1xuICAgIGlucHV0LmVuZChudWxsLCBudWxsLCAoZTogYW55KSA9PiBjYWxsYmFjayhlIHx8IGVycm9yKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvciA9IGU7XG4gIH1cbn07XG5cbmNvbnN0IHJlYWQgPSAob3V0cHV0OiBhbnkpID0+IHtcbiAgb3V0cHV0LnJlc3VtZSgpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2hhaW4oZm5zOiBhbnkpIHtcbiAgZm5zID0gZm5zLmZsYXQoSW5maW5pdHkpLmZpbHRlcigoZm46IGFueSkgPT4gZm4pO1xuXG4gIGNvbnN0IHN0cmVhbXMgPSBmbnNcbiAgICAgIC5tYXAoKGZuOiBhbnkpID0+IChpc0Z1bmN0aW9uTGlzdChmbikgPyBnZXRGdW5jdGlvbkxpc3QoZm4pIDogZm4pKVxuICAgICAgLmZsYXQoSW5maW5pdHkpXG4gICAgICAucmVkdWNlKGdyb3VwRnVuY3Rpb25zLCBbXSlcbiAgICAgIC5tYXAocHJvZHVjZVN0cmVhbXMpXG4gICAgICAuZmlsdGVyKChzOiBhbnkpID0+IHMpLFxuICAgIGlucHV0ID0gc3RyZWFtc1swXSxcbiAgICBvdXRwdXQgPSBzdHJlYW1zLnJlZHVjZSgob3V0cHV0OiBhbnksIGl0ZW06IGFueSkgPT4gKG91dHB1dCAmJiBvdXRwdXQucGlwZShpdGVtKSkgfHwgaXRlbSk7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1jb25zdFxuICBsZXQgc3RyZWFtOiBEdXBsZXg7IC8vIHdpbGwgYmUgYXNzaWduZWQgbGF0ZXJcblxuICBsZXQgd3JpdGVNZXRob2QgPSAoY2h1bms6IGFueSwgZW5jb2Rpbmc6IGFueSwgY2FsbGJhY2s6IGFueSkgPT4gd3JpdGUoaW5wdXQsIGNodW5rLCBlbmNvZGluZywgY2FsbGJhY2spLFxuICAgIGZpbmFsTWV0aG9kID0gKGNhbGxiYWNrOiBhbnkpID0+IGZpbmFsKGlucHV0LCBjYWxsYmFjayksXG4gICAgcmVhZE1ldGhvZCA9ICgpID0+IHJlYWQob3V0cHV0KTtcblxuICBpZiAoIWlzV3JpdGFibGVOb2RlU3RyZWFtKGlucHV0KSkge1xuICAgIHdyaXRlTWV0aG9kID0gKF8xLCBfMiwgY2FsbGJhY2spID0+IGNhbGxiYWNrKG51bGwpO1xuICAgIGZpbmFsTWV0aG9kID0gKGNhbGxiYWNrKSA9PiBjYWxsYmFjayhudWxsKTtcbiAgICBpbnB1dC5vbihcImVuZFwiLCAoKSA9PiBzdHJlYW0uZW5kKCkpO1xuICB9XG5cbiAgaWYgKGlzUmVhZGFibGVOb2RlU3RyZWFtKG91dHB1dCkpIHtcbiAgICBvdXRwdXQub24oXCJkYXRhXCIsIChjaHVuazogYW55KSA9PiAhc3RyZWFtLnB1c2goY2h1bmspICYmIG91dHB1dC5wYXVzZSgpKTtcbiAgICBvdXRwdXQub24oXCJlbmRcIiwgKCkgPT4gc3RyZWFtLnB1c2gobnVsbCkpO1xuICB9IGVsc2Uge1xuICAgIHJlYWRNZXRob2QgPSAoKSA9PiB7fTsgLy8gbm9wXG4gICAgb3V0cHV0Lm9uKFwiZmluaXNoXCIsICgpID0+IHN0cmVhbS5wdXNoKG51bGwpKTtcbiAgfVxuXG4gIHN0cmVhbSA9IG5ldyBEdXBsZXgoXG4gICAgT2JqZWN0LmFzc2lnbihcbiAgICAgIHsgd3JpdGFibGVPYmplY3RNb2RlOiB0cnVlLCByZWFkYWJsZU9iamVjdE1vZGU6IHRydWUgfSxcbiAgICAgIHtcbiAgICAgICAgcmVhZGFibGU6IGlzUmVhZGFibGVOb2RlU3RyZWFtKG91dHB1dCksXG4gICAgICAgIHdyaXRhYmxlOiBpc1dyaXRhYmxlTm9kZVN0cmVhbShpbnB1dCksXG4gICAgICAgIHdyaXRlOiB3cml0ZU1ldGhvZCxcbiAgICAgICAgZmluYWw6IGZpbmFsTWV0aG9kLFxuICAgICAgICByZWFkOiByZWFkTWV0aG9kLFxuICAgICAgfSxcbiAgICApLFxuICApO1xuICAvLyBAdHMtaWdub3JlXG4gIHN0cmVhbS5zdHJlYW1zID0gc3RyZWFtcztcbiAgLy8gQHRzLWlnbm9yZVxuICBzdHJlYW0uaW5wdXQgPSBpbnB1dDtcbiAgLy8gQHRzLWlnbm9yZVxuICBzdHJlYW0ub3V0cHV0ID0gb3V0cHV0O1xuXG4gIGlmICghaXNSZWFkYWJsZU5vZGVTdHJlYW0ob3V0cHV0KSkge1xuICAgIHN0cmVhbS5yZXN1bWUoKTtcbiAgfVxuXG4gIC8vIGNvbm5lY3QgZXZlbnRzXG4gIHN0cmVhbXMuZm9yRWFjaCgoaXRlbTogYW55KSA9PiBpdGVtLm9uKFwiZXJyb3JcIiwgKGVycm9yOiBhbnkpID0+IHN0cmVhbS5lbWl0KFwiZXJyb3JcIiwgZXJyb3IpKSk7XG5cbiAgcmV0dXJuIHN0cmVhbTtcbn1cbiIsICIvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnQgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnRyb2wtcmVnZXggKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVzZWxlc3MtZXNjYXBlICovXG5pbXBvcnQgeyBmbHVzaGFibGUsIGdlbiwgbWFueSwgbm9uZSwgY29tYmluZU1hbnlNdXQgfSBmcm9tIFwiLi9zdHJlYW0tY2hhaW5cIjtcbmltcG9ydCB7IFN0cmluZ0RlY29kZXIgfSBmcm9tIFwibm9kZTpzdHJpbmdfZGVjb2RlclwiO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tIFwibm9kZTpldmVudHNcIjtcblxuY29uc3QgZml4VXRmOFN0cmVhbSA9ICgpID0+IHtcbiAgY29uc3Qgc3RyaW5nRGVjb2RlciA9IG5ldyBTdHJpbmdEZWNvZGVyKCk7XG4gIGxldCBpbnB1dCA9IFwiXCI7XG4gIHJldHVybiBmbHVzaGFibGUoKGNodW5rOiBhbnkpID0+IHtcbiAgICBpZiAoY2h1bmsgPT09IG5vbmUpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGlucHV0ICsgc3RyaW5nRGVjb2Rlci5lbmQoKTtcbiAgICAgIGlucHV0ID0gXCJcIjtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY2h1bmsgPT0gXCJzdHJpbmdcIikge1xuICAgICAgaWYgKCFpbnB1dCkgcmV0dXJuIGNodW5rO1xuICAgICAgY29uc3QgcmVzdWx0ID0gaW5wdXQgKyBjaHVuaztcbiAgICAgIGlucHV0ID0gXCJcIjtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmIChjaHVuayBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgY29uc3QgcmVzdWx0ID0gaW5wdXQgKyBzdHJpbmdEZWNvZGVyLndyaXRlKGNodW5rKTtcbiAgICAgIGlucHV0ID0gXCJcIjtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHBlY3RlZCBhIHN0cmluZyBvciBhIEJ1ZmZlclwiKTtcbiAgfSk7XG59O1xuXG5jb25zdCBwYXR0ZXJucyA9IHtcbiAgdmFsdWUxOiAvW1xcXCJcXHtcXFtcXF1cXC1cXGRdfHRydWVcXGJ8ZmFsc2VcXGJ8bnVsbFxcYnxcXHN7MSwyNTZ9L3ksXG4gIHN0cmluZzogL1teXFx4MDAtXFx4MWZcXFwiXFxcXF17MSwyNTZ9fFxcXFxbYmZucnRcXFwiXFxcXFxcL118XFxcXHVbXFxkYS1mQS1GXXs0fXxcXFwiL3ksXG4gIGtleTE6IC9bXFxcIlxcfV18XFxzezEsMjU2fS95LFxuICBjb2xvbjogL1xcOnxcXHN7MSwyNTZ9L3ksXG4gIGNvbW1hOiAvW1xcLFxcXVxcfV18XFxzezEsMjU2fS95LFxuICB3czogL1xcc3sxLDI1Nn0veSxcbiAgbnVtYmVyU3RhcnQ6IC9cXGQveSxcbiAgbnVtYmVyRGlnaXQ6IC9cXGR7MCwyNTZ9L3ksXG4gIG51bWJlckZyYWN0aW9uOiAvW1xcLmVFXS95LFxuICBudW1iZXJFeHBvbmVudDogL1tlRV0veSxcbiAgbnVtYmVyRXhwU2lnbjogL1stK10veSxcbn07XG5jb25zdCBNQVhfUEFUVEVSTl9TSVpFID0gMTY7XG5cbmNvbnN0IHZhbHVlczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHsgdHJ1ZTogdHJ1ZSwgZmFsc2U6IGZhbHNlLCBudWxsOiBudWxsIH0sXG4gIGV4cGVjdGVkOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0geyBvYmplY3Q6IFwib2JqZWN0U3RvcFwiLCBhcnJheTogXCJhcnJheVN0b3BcIiwgXCJcIjogXCJkb25lXCIgfTtcblxuLy8gbG9uZyBoZXhhZGVjaW1hbCBjb2RlczogXFx1WFhYWFxuY29uc3QgZnJvbUhleCA9IChzOiBzdHJpbmcpID0+IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQocy5zbGljZSgyKSwgMTYpKTtcblxuLy8gc2hvcnQgY29kZXM6IFxcYiBcXGYgXFxuIFxcciBcXHQgXFxcIiBcXFxcIFxcL1xuY29uc3QgY29kZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7XG4gIGI6IFwiXFxiXCIsXG4gIGY6IFwiXFxmXCIsXG4gIG46IFwiXFxuXCIsXG4gIHI6IFwiXFxyXCIsXG4gIHQ6IFwiXFx0XCIsXG4gICdcIic6ICdcIicsXG4gIFwiXFxcXFwiOiBcIlxcXFxcIixcbiAgXCIvXCI6IFwiL1wiLFxufTtcblxuY29uc3QganNvblBhcnNlciA9IChvcHRpb25zPzogYW55KSA9PiB7XG4gIGxldCBwYWNrS2V5cyA9IHRydWUsXG4gICAgcGFja1N0cmluZ3MgPSB0cnVlLFxuICAgIHBhY2tOdW1iZXJzID0gdHJ1ZSxcbiAgICBzdHJlYW1LZXlzID0gdHJ1ZSxcbiAgICBzdHJlYW1TdHJpbmdzID0gdHJ1ZSxcbiAgICBzdHJlYW1OdW1iZXJzID0gdHJ1ZSxcbiAgICBqc29uU3RyZWFtaW5nID0gZmFsc2U7XG5cbiAgaWYgKG9wdGlvbnMpIHtcbiAgICBcInBhY2tWYWx1ZXNcIiBpbiBvcHRpb25zICYmIChwYWNrS2V5cyA9IHBhY2tTdHJpbmdzID0gcGFja051bWJlcnMgPSBvcHRpb25zLnBhY2tWYWx1ZXMpO1xuICAgIFwicGFja0tleXNcIiBpbiBvcHRpb25zICYmIChwYWNrS2V5cyA9IG9wdGlvbnMucGFja0tleXMpO1xuICAgIFwicGFja1N0cmluZ3NcIiBpbiBvcHRpb25zICYmIChwYWNrU3RyaW5ncyA9IG9wdGlvbnMucGFja1N0cmluZ3MpO1xuICAgIFwicGFja051bWJlcnNcIiBpbiBvcHRpb25zICYmIChwYWNrTnVtYmVycyA9IG9wdGlvbnMucGFja051bWJlcnMpO1xuICAgIFwic3RyZWFtVmFsdWVzXCIgaW4gb3B0aW9ucyAmJiAoc3RyZWFtS2V5cyA9IHN0cmVhbVN0cmluZ3MgPSBzdHJlYW1OdW1iZXJzID0gb3B0aW9ucy5zdHJlYW1WYWx1ZXMpO1xuICAgIFwic3RyZWFtS2V5c1wiIGluIG9wdGlvbnMgJiYgKHN0cmVhbUtleXMgPSBvcHRpb25zLnN0cmVhbUtleXMpO1xuICAgIFwic3RyZWFtU3RyaW5nc1wiIGluIG9wdGlvbnMgJiYgKHN0cmVhbVN0cmluZ3MgPSBvcHRpb25zLnN0cmVhbVN0cmluZ3MpO1xuICAgIFwic3RyZWFtTnVtYmVyc1wiIGluIG9wdGlvbnMgJiYgKHN0cmVhbU51bWJlcnMgPSBvcHRpb25zLnN0cmVhbU51bWJlcnMpO1xuICAgIGpzb25TdHJlYW1pbmcgPSBvcHRpb25zLmpzb25TdHJlYW1pbmc7XG4gIH1cblxuICAhcGFja0tleXMgJiYgKHN0cmVhbUtleXMgPSB0cnVlKTtcbiAgIXBhY2tTdHJpbmdzICYmIChzdHJlYW1TdHJpbmdzID0gdHJ1ZSk7XG4gICFwYWNrTnVtYmVycyAmJiAoc3RyZWFtTnVtYmVycyA9IHRydWUpO1xuXG4gIGxldCBkb25lID0gZmFsc2UsXG4gICAgZXhwZWN0ID0ganNvblN0cmVhbWluZyA/IFwiZG9uZVwiIDogXCJ2YWx1ZVwiLFxuICAgIHBhcmVudCA9IFwiXCIsXG4gICAgb3Blbk51bWJlciA9IGZhbHNlLFxuICAgIGFjY3VtdWxhdG9yID0gXCJcIixcbiAgICBidWZmZXIgPSBcIlwiO1xuXG4gIGNvbnN0IHN0YWNrOiBhbnlbXSA9IFtdO1xuXG4gIHJldHVybiBmbHVzaGFibGUoKGJ1ZjogYW55KSA9PiB7XG4gICAgY29uc3QgdG9rZW5zOiBhbnlbXSA9IFtdO1xuXG4gICAgaWYgKGJ1ZiA9PT0gbm9uZSkge1xuICAgICAgZG9uZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1ZmZlciArPSBidWY7XG4gICAgfVxuXG4gICAgbGV0IG1hdGNoOiBhbnk7XG4gICAgbGV0IHZhbHVlOiBhbnk7XG4gICAgbGV0IGluZGV4ID0gMDtcblxuICAgIG1haW46IGZvciAoOzspIHtcbiAgICAgIHN3aXRjaCAoZXhwZWN0KSB7XG4gICAgICAgIGNhc2UgXCJ2YWx1ZTFcIjpcbiAgICAgICAgY2FzZSBcInZhbHVlXCI6XG4gICAgICAgICAgcGF0dGVybnMudmFsdWUxLmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1hdGNoID0gcGF0dGVybnMudmFsdWUxLmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoZG9uZSB8fCBpbmRleCArIE1BWF9QQVRURVJOX1NJWkUgPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IGV4cGVjdGVkIGEgdmFsdWVcIik7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBoYXMgZXhwZWN0ZWQgYSB2YWx1ZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBzd2l0Y2ggKHZhbHVlKSB7XG4gICAgICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICAgIGlmIChzdHJlYW1TdHJpbmdzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnRTdHJpbmdcIiB9KTtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJzdHJpbmdcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwie1wiOlxuICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnRPYmplY3RcIiB9KTtcbiAgICAgICAgICAgICAgc3RhY2sucHVzaChwYXJlbnQpO1xuICAgICAgICAgICAgICBwYXJlbnQgPSBcIm9iamVjdFwiO1xuICAgICAgICAgICAgICBleHBlY3QgPSBcImtleTFcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiW1wiOlxuICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnRBcnJheVwiIH0pO1xuICAgICAgICAgICAgICBzdGFjay5wdXNoKHBhcmVudCk7XG4gICAgICAgICAgICAgIHBhcmVudCA9IFwiYXJyYXlcIjtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJ2YWx1ZTFcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiXVwiOlxuICAgICAgICAgICAgICBpZiAoZXhwZWN0ICE9PSBcInZhbHVlMVwiKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiB1bmV4cGVjdGVkIHRva2VuICddJ1wiKTtcbiAgICAgICAgICAgICAgaWYgKG9wZW5OdW1iZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcImVuZE51bWJlclwiIH0pO1xuICAgICAgICAgICAgICAgIG9wZW5OdW1iZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAocGFja051bWJlcnMpIHtcbiAgICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJWYWx1ZVwiLCB2YWx1ZTogYWNjdW11bGF0b3IgfSk7XG4gICAgICAgICAgICAgICAgICBhY2N1bXVsYXRvciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJlbmRBcnJheVwiIH0pO1xuICAgICAgICAgICAgICBwYXJlbnQgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiLVwiOlxuICAgICAgICAgICAgICBvcGVuTnVtYmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnROdW1iZXJcIiB9LCB7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IFwiLVwiIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBhY2tOdW1iZXJzICYmIChhY2N1bXVsYXRvciA9IFwiLVwiKTtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJudW1iZXJTdGFydFwiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCIwXCI6XG4gICAgICAgICAgICAgIG9wZW5OdW1iZXIgPSB0cnVlO1xuICAgICAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykge1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJzdGFydE51bWJlclwiIH0sIHsgbmFtZTogXCJudW1iZXJDaHVua1wiLCB2YWx1ZTogXCIwXCIgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGFja051bWJlcnMgJiYgKGFjY3VtdWxhdG9yID0gXCIwXCIpO1xuICAgICAgICAgICAgICBleHBlY3QgPSBcIm51bWJlckZyYWN0aW9uXCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIjFcIjpcbiAgICAgICAgICAgIGNhc2UgXCIyXCI6XG4gICAgICAgICAgICBjYXNlIFwiM1wiOlxuICAgICAgICAgICAgY2FzZSBcIjRcIjpcbiAgICAgICAgICAgIGNhc2UgXCI1XCI6XG4gICAgICAgICAgICBjYXNlIFwiNlwiOlxuICAgICAgICAgICAgY2FzZSBcIjdcIjpcbiAgICAgICAgICAgIGNhc2UgXCI4XCI6XG4gICAgICAgICAgICBjYXNlIFwiOVwiOlxuICAgICAgICAgICAgICBvcGVuTnVtYmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnROdW1iZXJcIiB9LCB7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBhY2tOdW1iZXJzICYmIChhY2N1bXVsYXRvciA9IHZhbHVlKTtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJudW1iZXJEaWdpdFwiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ0cnVlXCI6XG4gICAgICAgICAgICBjYXNlIFwiZmFsc2VcIjpcbiAgICAgICAgICAgIGNhc2UgXCJudWxsXCI6XG4gICAgICAgICAgICAgIGlmIChidWZmZXIubGVuZ3RoIC0gaW5kZXggPT09IHZhbHVlLmxlbmd0aCAmJiAhZG9uZSkgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IHZhbHVlICsgXCJWYWx1ZVwiLCB2YWx1ZTogdmFsdWVzW3ZhbHVlXSB9KTtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBkZWZhdWx0OiAvLyB3c1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJrZXlWYWxcIjpcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgIHBhdHRlcm5zLnN0cmluZy5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLnN0cmluZy5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCAmJiAoZG9uZSB8fCBidWZmZXIubGVuZ3RoIC0gaW5kZXggPj0gNikpXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IGVzY2FwZWQgY2hhcmFjdGVyc1wiKTtcbiAgICAgICAgICAgIGlmIChkb25lKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgaGFzIGV4cGVjdGVkIGEgc3RyaW5nIHZhbHVlXCIpO1xuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ1wiJykge1xuICAgICAgICAgICAgaWYgKGV4cGVjdCA9PT0gXCJrZXlWYWxcIikge1xuICAgICAgICAgICAgICBpZiAoc3RyZWFtS2V5cykgdG9rZW5zLnB1c2goeyBuYW1lOiBcImVuZEtleVwiIH0pO1xuICAgICAgICAgICAgICBpZiAocGFja0tleXMpIHtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwia2V5VmFsdWVcIiwgdmFsdWU6IGFjY3VtdWxhdG9yIH0pO1xuICAgICAgICAgICAgICAgIGFjY3VtdWxhdG9yID0gXCJcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBleHBlY3QgPSBcImNvbG9uXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoc3RyZWFtU3RyaW5ncykgdG9rZW5zLnB1c2goeyBuYW1lOiBcImVuZFN0cmluZ1wiIH0pO1xuICAgICAgICAgICAgICBpZiAocGFja1N0cmluZ3MpIHtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RyaW5nVmFsdWVcIiwgdmFsdWU6IGFjY3VtdWxhdG9yIH0pO1xuICAgICAgICAgICAgICAgIGFjY3VtdWxhdG9yID0gXCJcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBleHBlY3QgPSBleHBlY3RlZFtwYXJlbnRdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUubGVuZ3RoID4gMSAmJiB2YWx1ZS5jaGFyQXQoMCkgPT09IFwiXFxcXFwiKSB7XG4gICAgICAgICAgICBjb25zdCB0ID0gdmFsdWUubGVuZ3RoID09IDIgPyBjb2Rlc1t2YWx1ZS5jaGFyQXQoMSldIDogZnJvbUhleCh2YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZXhwZWN0ID09PSBcImtleVZhbFwiID8gc3RyZWFtS2V5cyA6IHN0cmVhbVN0cmluZ3MpIHtcbiAgICAgICAgICAgICAgdG9rZW5zLnB1c2goeyBuYW1lOiBcInN0cmluZ0NodW5rXCIsIHZhbHVlOiB0IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV4cGVjdCA9PT0gXCJrZXlWYWxcIiA/IHBhY2tLZXlzIDogcGFja1N0cmluZ3MpIHtcbiAgICAgICAgICAgICAgYWNjdW11bGF0b3IgKz0gdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGV4cGVjdCA9PT0gXCJrZXlWYWxcIiA/IHN0cmVhbUtleXMgOiBzdHJlYW1TdHJpbmdzKSB7XG4gICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJzdHJpbmdDaHVua1wiLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXhwZWN0ID09PSBcImtleVZhbFwiID8gcGFja0tleXMgOiBwYWNrU3RyaW5ncykge1xuICAgICAgICAgICAgICBhY2N1bXVsYXRvciArPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwia2V5MVwiOlxuICAgICAgICBjYXNlIFwia2V5XCI6XG4gICAgICAgICAgcGF0dGVybnMua2V5MS5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLmtleTEuZXhlYyhidWZmZXIpO1xuICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGggfHwgZG9uZSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGNhbm5vdCBwYXJzZSBpbnB1dDogZXhwZWN0ZWQgYW4gb2JqZWN0IGtleVwiKTtcbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAodmFsdWUgPT09ICdcIicpIHtcbiAgICAgICAgICAgIGlmIChzdHJlYW1LZXlzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnRLZXlcIiB9KTtcbiAgICAgICAgICAgIGV4cGVjdCA9IFwia2V5VmFsXCI7XG4gICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gXCJ9XCIpIHtcbiAgICAgICAgICAgIGlmIChleHBlY3QgIT09IFwia2V5MVwiKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiB1bmV4cGVjdGVkIHRva2VuICd9J1wiKTtcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJlbmRPYmplY3RcIiB9KTtcbiAgICAgICAgICAgIHBhcmVudCA9IHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiY29sb25cIjpcbiAgICAgICAgICBwYXR0ZXJucy5jb2xvbi5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLmNvbG9uLmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoIHx8IGRvbmUpIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IGV4cGVjdGVkICc6J1wiKTtcbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICB2YWx1ZSA9PT0gXCI6XCIgJiYgKGV4cGVjdCA9IFwidmFsdWVcIik7XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiYXJyYXlTdG9wXCI6XG4gICAgICAgIGNhc2UgXCJvYmplY3RTdG9wXCI6XG4gICAgICAgICAgcGF0dGVybnMuY29tbWEubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5jb21tYS5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCB8fCBkb25lKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiBleHBlY3RlZCAnLCdcIik7XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcGVuTnVtYmVyKSB7XG4gICAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcImVuZE51bWJlclwiIH0pO1xuICAgICAgICAgICAgb3Blbk51bWJlciA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHBhY2tOdW1iZXJzKSB7XG4gICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJWYWx1ZVwiLCB2YWx1ZTogYWNjdW11bGF0b3IgfSk7XG4gICAgICAgICAgICAgIGFjY3VtdWxhdG9yID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAodmFsdWUgPT09IFwiLFwiKSB7XG4gICAgICAgICAgICBleHBlY3QgPSBleHBlY3QgPT09IFwiYXJyYXlTdG9wXCIgPyBcInZhbHVlXCIgOiBcImtleVwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IFwifVwiIHx8IHZhbHVlID09PSBcIl1cIikge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBcIn1cIiA/IGV4cGVjdCA9PT0gXCJhcnJheVN0b3BcIiA6IGV4cGVjdCAhPT0gXCJhcnJheVN0b3BcIikge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiBleHBlY3RlZCAnXCIgKyAoZXhwZWN0ID09PSBcImFycmF5U3RvcFwiID8gXCJdXCIgOiBcIn1cIikgKyBcIidcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IHZhbHVlID09PSBcIn1cIiA/IFwiZW5kT2JqZWN0XCIgOiBcImVuZEFycmF5XCIgfSk7XG4gICAgICAgICAgICBwYXJlbnQgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgIGV4cGVjdCA9IGV4cGVjdGVkW3BhcmVudF07XG4gICAgICAgICAgfVxuICAgICAgICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gbnVtYmVyIGNodW5rc1xuICAgICAgICBjYXNlIFwibnVtYmVyU3RhcnRcIjogLy8gWzAtOV1cbiAgICAgICAgICBwYXR0ZXJucy5udW1iZXJTdGFydC5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLm51bWJlclN0YXJ0LmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoIHx8IGRvbmUpIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IGV4cGVjdGVkIGEgc3RhcnRpbmcgZGlnaXRcIik7XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gbWF0Y2hbMF07XG4gICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJDaHVua1wiLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgICAgcGFja051bWJlcnMgJiYgKGFjY3VtdWxhdG9yICs9IHZhbHVlKTtcbiAgICAgICAgICBleHBlY3QgPSB2YWx1ZSA9PT0gXCIwXCIgPyBcIm51bWJlckZyYWN0aW9uXCIgOiBcIm51bWJlckRpZ2l0XCI7XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibnVtYmVyRGlnaXRcIjogLy8gWzAtOV0qXG4gICAgICAgICAgcGF0dGVybnMubnVtYmVyRGlnaXQubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5udW1iZXJEaWdpdC5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCB8fCBkb25lKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiBleHBlY3RlZCBhIGRpZ2l0XCIpO1xuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJDaHVua1wiLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgKz0gdmFsdWUpO1xuICAgICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IFwibnVtYmVyRnJhY3Rpb25cIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgICBleHBlY3QgPSBleHBlY3RlZFtwYXJlbnRdO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJudW1iZXJGcmFjdGlvblwiOiAvLyBbXFwuZUVdP1xuICAgICAgICAgIHBhdHRlcm5zLm51bWJlckZyYWN0aW9uLmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1hdGNoID0gcGF0dGVybnMubnVtYmVyRnJhY3Rpb24uZXhlYyhidWZmZXIpO1xuICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGggfHwgZG9uZSkge1xuICAgICAgICAgICAgICBleHBlY3QgPSBleHBlY3RlZFtwYXJlbnRdO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcIm51bWJlckNodW5rXCIsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgKz0gdmFsdWUpO1xuICAgICAgICAgIGV4cGVjdCA9IHZhbHVlID09PSBcIi5cIiA/IFwibnVtYmVyRnJhY1N0YXJ0XCIgOiBcIm51bWJlckV4cFNpZ25cIjtcbiAgICAgICAgICBpbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJudW1iZXJGcmFjU3RhcnRcIjogLy8gWzAtOV1cbiAgICAgICAgICBwYXR0ZXJucy5udW1iZXJTdGFydC5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLm51bWJlclN0YXJ0LmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoIHx8IGRvbmUpXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IGV4cGVjdGVkIGEgZnJhY3Rpb25hbCBwYXJ0IG9mIGEgbnVtYmVyXCIpO1xuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmIChzdHJlYW1OdW1iZXJzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICAgIHBhY2tOdW1iZXJzICYmIChhY2N1bXVsYXRvciArPSB2YWx1ZSk7XG4gICAgICAgICAgZXhwZWN0ID0gXCJudW1iZXJGcmFjRGlnaXRcIjtcbiAgICAgICAgICBpbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJudW1iZXJGcmFjRGlnaXRcIjogLy8gWzAtOV0qXG4gICAgICAgICAgcGF0dGVybnMubnVtYmVyRGlnaXQubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5udW1iZXJEaWdpdC5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChzdHJlYW1OdW1iZXJzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICAgICAgcGFja051bWJlcnMgJiYgKGFjY3VtdWxhdG9yICs9IHZhbHVlKTtcbiAgICAgICAgICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICAgICAgICBleHBlY3QgPSBcIm51bWJlckV4cG9uZW50XCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibnVtYmVyRXhwb25lbnRcIjogLy8gW2VFXT9cbiAgICAgICAgICBwYXR0ZXJucy5udW1iZXJFeHBvbmVudC5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLm51bWJlckV4cG9uZW50LmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IGV4cGVjdGVkW3BhcmVudF07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJkb25lXCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmIChzdHJlYW1OdW1iZXJzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICAgIHBhY2tOdW1iZXJzICYmIChhY2N1bXVsYXRvciArPSB2YWx1ZSk7XG4gICAgICAgICAgZXhwZWN0ID0gXCJudW1iZXJFeHBTaWduXCI7XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibnVtYmVyRXhwU2lnblwiOiAvLyBbLStdP1xuICAgICAgICAgIHBhdHRlcm5zLm51bWJlckV4cFNpZ24ubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5udW1iZXJFeHBTaWduLmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IFwibnVtYmVyRXhwU3RhcnRcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZG9uZSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGhhcyBleHBlY3RlZCBhbiBleHBvbmVudCB2YWx1ZSBvZiBhIG51bWJlclwiKTtcbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcIm51bWJlckNodW5rXCIsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgKz0gdmFsdWUpO1xuICAgICAgICAgIGV4cGVjdCA9IFwibnVtYmVyRXhwU3RhcnRcIjtcbiAgICAgICAgICBpbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJudW1iZXJFeHBTdGFydFwiOiAvLyBbMC05XVxuICAgICAgICAgIHBhdHRlcm5zLm51bWJlclN0YXJ0Lmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1hdGNoID0gcGF0dGVybnMubnVtYmVyU3RhcnQuZXhlYyhidWZmZXIpO1xuICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGggfHwgZG9uZSlcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGNhbm5vdCBwYXJzZSBpbnB1dDogZXhwZWN0ZWQgYW4gZXhwb25lbnQgcGFydCBvZiBhIG51bWJlclwiKTtcbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcIm51bWJlckNodW5rXCIsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgKz0gdmFsdWUpO1xuICAgICAgICAgIGV4cGVjdCA9IFwibnVtYmVyRXhwRGlnaXRcIjtcbiAgICAgICAgICBpbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJudW1iZXJFeHBEaWdpdFwiOiAvLyBbMC05XSpcbiAgICAgICAgICBwYXR0ZXJucy5udW1iZXJEaWdpdC5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLm51bWJlckRpZ2l0LmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJDaHVua1wiLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgKz0gdmFsdWUpO1xuICAgICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoIHx8IGRvbmUpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZG9uZVwiOlxuICAgICAgICAgIHBhdHRlcm5zLndzLmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1hdGNoID0gcGF0dGVybnMud3MuZXhlYyhidWZmZXIpO1xuICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgaWYgKGpzb25TdHJlYW1pbmcpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QgPSBcInZhbHVlXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGNhbm5vdCBwYXJzZSBpbnB1dDogdW5leHBlY3RlZCBjaGFyYWN0ZXJzXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmIChvcGVuTnVtYmVyKSB7XG4gICAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcImVuZE51bWJlclwiIH0pO1xuICAgICAgICAgICAgb3Blbk51bWJlciA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHBhY2tOdW1iZXJzKSB7XG4gICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJWYWx1ZVwiLCB2YWx1ZTogYWNjdW11bGF0b3IgfSk7XG4gICAgICAgICAgICAgIGFjY3VtdWxhdG9yID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZG9uZSAmJiBvcGVuTnVtYmVyKSB7XG4gICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcImVuZE51bWJlclwiIH0pO1xuICAgICAgb3Blbk51bWJlciA9IGZhbHNlO1xuICAgICAgaWYgKHBhY2tOdW1iZXJzKSB7XG4gICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJWYWx1ZVwiLCB2YWx1ZTogYWNjdW11bGF0b3IgfSk7XG4gICAgICAgIGFjY3VtdWxhdG9yID0gXCJcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgYnVmZmVyID0gYnVmZmVyLnNsaWNlKGluZGV4KTtcbiAgICByZXR1cm4gdG9rZW5zLmxlbmd0aCA/IG1hbnkodG9rZW5zKSA6IG5vbmU7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHBhcnNlciA9IChvcHRpb25zPzogYW55KSA9PiBnZW4oZml4VXRmOFN0cmVhbSgpLCBqc29uUGFyc2VyKG9wdGlvbnMpKTtcblxuY29uc3Qgd2l0aFBhcnNlciA9IChmbjogYW55LCBvcHRpb25zPzogYW55KSA9PiBnZW4ocGFyc2VyKG9wdGlvbnMpLCBmbihvcHRpb25zKSk7XG5cbmNvbnN0IGNoZWNrYWJsZVRva2VucyA9IHtcbiAgICBzdGFydE9iamVjdDogMSxcbiAgICBzdGFydEFycmF5OiAxLFxuICAgIHN0YXJ0U3RyaW5nOiAxLFxuICAgIHN0YXJ0TnVtYmVyOiAxLFxuICAgIG51bGxWYWx1ZTogMSxcbiAgICB0cnVlVmFsdWU6IDEsXG4gICAgZmFsc2VWYWx1ZTogMSxcbiAgICBzdHJpbmdWYWx1ZTogMSxcbiAgICBudW1iZXJWYWx1ZTogMSxcbiAgfSxcbiAgc3RvcFRva2VucyA9IHtcbiAgICBzdGFydE9iamVjdDogXCJlbmRPYmplY3RcIixcbiAgICBzdGFydEFycmF5OiBcImVuZEFycmF5XCIsXG4gICAgc3RhcnRTdHJpbmc6IFwiZW5kU3RyaW5nXCIsXG4gICAgc3RhcnROdW1iZXI6IFwiZW5kTnVtYmVyXCIsXG4gIH0sXG4gIG9wdGlvbmFsVG9rZW5zID0geyBlbmRTdHJpbmc6IFwic3RyaW5nVmFsdWVcIiwgZW5kTnVtYmVyOiBcIm51bWJlclZhbHVlXCIgfTtcblxuY29uc3QgZGVmYXVsdEZpbHRlciA9IChfc3RhY2s6IHN0cmluZ1tdLCBfYTogYW55KSA9PiB0cnVlO1xuXG5jb25zdCBzdHJpbmdGaWx0ZXIgPSAoc3RyaW5nOiBzdHJpbmcsIHNlcGFyYXRvcjogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHN0cmluZ1dpdGhTZXBhcmF0b3IgPSBzdHJpbmcgKyBzZXBhcmF0b3I7XG4gIHJldHVybiAoc3RhY2s6IHN0cmluZ1tdLCBfYTogYW55KSA9PiB7XG4gICAgY29uc3QgcGF0aCA9IHN0YWNrLmpvaW4oc2VwYXJhdG9yKTtcbiAgICByZXR1cm4gcGF0aCA9PT0gc3RyaW5nIHx8IHBhdGguc3RhcnRzV2l0aChzdHJpbmdXaXRoU2VwYXJhdG9yKTtcbiAgfTtcbn07XG5cbmNvbnN0IHJlZ0V4cEZpbHRlciA9IChyZWdFeHA6IFJlZ0V4cCwgc2VwYXJhdG9yOiBzdHJpbmcpID0+IHtcbiAgcmV0dXJuIChzdGFjazogc3RyaW5nW10sIF9hOiBhbnkpID0+IHJlZ0V4cC50ZXN0KHN0YWNrLmpvaW4oc2VwYXJhdG9yKSk7XG59O1xuXG5jb25zdCBmaWx0ZXJCYXNlID1cbiAgKHtcbiAgICBzcGVjaWFsQWN0aW9uID0gXCJhY2NlcHRcIixcbiAgICBkZWZhdWx0QWN0aW9uID0gXCJpZ25vcmVcIixcbiAgICBub25DaGVja2FibGVBY3Rpb24gPSBcInByb2Nlc3Mta2V5XCIsXG4gICAgdHJhbnNpdGlvbiA9IHVuZGVmaW5lZCBhcyBhbnksXG4gIH0gPSB7fSkgPT5cbiAgKG9wdGlvbnM6IGFueSkgPT4ge1xuICAgIGNvbnN0IG9uY2UgPSBvcHRpb25zPy5vbmNlLFxuICAgICAgc2VwYXJhdG9yID0gb3B0aW9ucz8ucGF0aFNlcGFyYXRvciB8fCBcIi5cIjtcbiAgICBsZXQgZmlsdGVyID0gZGVmYXVsdEZpbHRlcixcbiAgICAgIHN0cmVhbUtleXMgPSB0cnVlO1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMuZmlsdGVyID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmZpbHRlcjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMuZmlsdGVyID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZmlsdGVyID0gc3RyaW5nRmlsdGVyKG9wdGlvbnMuZmlsdGVyLCBzZXBhcmF0b3IpO1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmZpbHRlciBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICBmaWx0ZXIgPSByZWdFeHBGaWx0ZXIob3B0aW9ucy5maWx0ZXIsIHNlcGFyYXRvcik7XG4gICAgICB9XG4gICAgICBpZiAoXCJzdHJlYW1WYWx1ZXNcIiBpbiBvcHRpb25zKSBzdHJlYW1LZXlzID0gb3B0aW9ucy5zdHJlYW1WYWx1ZXM7XG4gICAgICBpZiAoXCJzdHJlYW1LZXlzXCIgaW4gb3B0aW9ucykgc3RyZWFtS2V5cyA9IG9wdGlvbnMuc3RyZWFtS2V5cztcbiAgICB9XG4gICAgY29uc3Qgc2FuaXRpemVkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMsIHsgZmlsdGVyLCBzdHJlYW1LZXlzLCBzZXBhcmF0b3IgfSk7XG4gICAgbGV0IHN0YXRlID0gXCJjaGVja1wiO1xuICAgIGNvbnN0IHN0YWNrOiBhbnlbXSA9IFtdO1xuICAgIGxldCBkZXB0aCA9IDAsXG4gICAgICBwcmV2aW91c1Rva2VuID0gXCJcIixcbiAgICAgIGVuZFRva2VuID0gXCJcIixcbiAgICAgIG9wdGlvbmFsVG9rZW4gPSBcIlwiLFxuICAgICAgc3RhcnRUcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgcmV0dXJuIGZsdXNoYWJsZSgoY2h1bmspID0+IHtcbiAgICAgIC8vIHRoZSBmbHVzaFxuICAgICAgaWYgKGNodW5rID09PSBub25lKSByZXR1cm4gdHJhbnNpdGlvbiA/IHRyYW5zaXRpb24oW10sIG51bGwsIFwiZmx1c2hcIiwgc2FuaXRpemVkT3B0aW9ucykgOiBub25lO1xuXG4gICAgICAvLyBwcm9jZXNzIHRoZSBvcHRpb25hbCB2YWx1ZSB0b2tlbiAodW5maW5pc2hlZClcbiAgICAgIGlmIChvcHRpb25hbFRva2VuKSB7XG4gICAgICAgIGlmIChvcHRpb25hbFRva2VuID09PSBjaHVuay5uYW1lKSB7XG4gICAgICAgICAgbGV0IHJldHVyblRva2VuID0gbm9uZTtcbiAgICAgICAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvY2Vzcy1rZXlcIjpcbiAgICAgICAgICAgICAgc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0gPSBjaHVuay52YWx1ZTtcbiAgICAgICAgICAgICAgc3RhdGUgPSBcImNoZWNrXCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImFjY2VwdC12YWx1ZVwiOlxuICAgICAgICAgICAgICByZXR1cm5Ub2tlbiA9IGNodW5rO1xuICAgICAgICAgICAgICBzdGF0ZSA9IG9uY2UgPyBcInBhc3NcIiA6IFwiY2hlY2tcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICBzdGF0ZSA9IG9uY2UgPyBcImFsbFwiIDogXCJjaGVja1wiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgb3B0aW9uYWxUb2tlbiA9IFwiXCI7XG4gICAgICAgICAgcmV0dXJuIHJldHVyblRva2VuO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbmFsVG9rZW4gPSBcIlwiO1xuICAgICAgICBzdGF0ZSA9IG9uY2UgJiYgc3RhdGUgIT09IFwicHJvY2Vzcy1rZXlcIiA/IFwicGFzc1wiIDogXCJjaGVja1wiO1xuICAgICAgfVxuXG4gICAgICBsZXQgcmV0dXJuVG9rZW46IGFueSA9IG5vbmU7XG5cbiAgICAgIHJlY2hlY2s6IGZvciAoOzspIHtcbiAgICAgICAgLy8gYWNjZXB0L3JlamVjdCB0b2tlbnNcbiAgICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICAgIGNhc2UgXCJwcm9jZXNzLWtleVwiOlxuICAgICAgICAgICAgaWYgKGNodW5rLm5hbWUgPT09IFwiZW5kS2V5XCIpIG9wdGlvbmFsVG9rZW4gPSBcImtleVZhbHVlXCI7XG4gICAgICAgICAgICByZXR1cm4gbm9uZTtcbiAgICAgICAgICBjYXNlIFwicGFzc1wiOlxuICAgICAgICAgICAgcmV0dXJuIG5vbmU7XG4gICAgICAgICAgY2FzZSBcImFsbFwiOlxuICAgICAgICAgICAgcmV0dXJuIGNodW5rO1xuICAgICAgICAgIGNhc2UgXCJhY2NlcHRcIjpcbiAgICAgICAgICBjYXNlIFwicmVqZWN0XCI6XG4gICAgICAgICAgICBpZiAoc3RhcnRUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgICAgIHN0YXJ0VHJhbnNpdGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm5Ub2tlbiA9IHRyYW5zaXRpb24oc3RhY2ssIGNodW5rLCBzdGF0ZSwgc2FuaXRpemVkT3B0aW9ucykgfHwgbm9uZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAoY2h1bmsubmFtZSkge1xuICAgICAgICAgICAgICBjYXNlIFwic3RhcnRPYmplY3RcIjpcbiAgICAgICAgICAgICAgY2FzZSBcInN0YXJ0QXJyYXlcIjpcbiAgICAgICAgICAgICAgICArK2RlcHRoO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIFwiZW5kT2JqZWN0XCI6XG4gICAgICAgICAgICAgIGNhc2UgXCJlbmRBcnJheVwiOlxuICAgICAgICAgICAgICAgIC0tZGVwdGg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RhdGUgPT09IFwiYWNjZXB0XCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuVG9rZW4gPSBjb21iaW5lTWFueU11dChyZXR1cm5Ub2tlbiwgY2h1bmspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFkZXB0aCkge1xuICAgICAgICAgICAgICBpZiAob25jZSkge1xuICAgICAgICAgICAgICAgIHN0YXRlID0gc3RhdGUgPT09IFwiYWNjZXB0XCIgPyBcInBhc3NcIiA6IFwiYWxsXCI7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBcImNoZWNrXCI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXR1cm5Ub2tlbjtcbiAgICAgICAgICBjYXNlIFwiYWNjZXB0LXZhbHVlXCI6XG4gICAgICAgICAgY2FzZSBcInJlamVjdC12YWx1ZVwiOlxuICAgICAgICAgICAgaWYgKHN0YXJ0VHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICBzdGFydFRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuVG9rZW4gPSB0cmFuc2l0aW9uKHN0YWNrLCBjaHVuaywgc3RhdGUsIHNhbml0aXplZE9wdGlvbnMpIHx8IG5vbmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RhdGUgPT09IFwiYWNjZXB0LXZhbHVlXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuVG9rZW4gPSBjb21iaW5lTWFueU11dChyZXR1cm5Ub2tlbiwgY2h1bmspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNodW5rLm5hbWUgPT09IGVuZFRva2VuKSB7XG4gICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgb3B0aW9uYWxUb2tlbiA9IG9wdGlvbmFsVG9rZW5zW2VuZFRva2VuXSB8fCBcIlwiO1xuICAgICAgICAgICAgICBlbmRUb2tlbiA9IFwiXCI7XG4gICAgICAgICAgICAgIGlmICghb3B0aW9uYWxUb2tlbikge1xuICAgICAgICAgICAgICAgIGlmIChvbmNlKSB7XG4gICAgICAgICAgICAgICAgICBzdGF0ZSA9IHN0YXRlID09PSBcImFjY2VwdC12YWx1ZVwiID8gXCJwYXNzXCIgOiBcImFsbFwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzdGF0ZSA9IFwiY2hlY2tcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXR1cm5Ub2tlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgbGFzdCBpbmRleCBpbiB0aGUgc3RhY2tcbiAgICAgICAgaWYgKHR5cGVvZiBzdGFja1tzdGFjay5sZW5ndGggLSAxXSA9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgLy8gYXJyYXlcbiAgICAgICAgICBzd2l0Y2ggKGNodW5rLm5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJzdGFydE9iamVjdFwiOlxuICAgICAgICAgICAgY2FzZSBcInN0YXJ0QXJyYXlcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzdGFydFN0cmluZ1wiOlxuICAgICAgICAgICAgY2FzZSBcInN0YXJ0TnVtYmVyXCI6XG4gICAgICAgICAgICBjYXNlIFwibnVsbFZhbHVlXCI6XG4gICAgICAgICAgICBjYXNlIFwidHJ1ZVZhbHVlXCI6XG4gICAgICAgICAgICBjYXNlIFwiZmFsc2VWYWx1ZVwiOlxuICAgICAgICAgICAgICArK3N0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJudW1iZXJWYWx1ZVwiOlxuICAgICAgICAgICAgICBpZiAocHJldmlvdXNUb2tlbiAhPT0gXCJlbmROdW1iZXJcIikgKytzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nVmFsdWVcIjpcbiAgICAgICAgICAgICAgaWYgKHByZXZpb3VzVG9rZW4gIT09IFwiZW5kU3RyaW5nXCIpICsrc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY2h1bmsubmFtZSA9PT0gXCJrZXlWYWx1ZVwiKSBzdGFja1tzdGFjay5sZW5ndGggLSAxXSA9IGNodW5rLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHByZXZpb3VzVG9rZW4gPSBjaHVuay5uYW1lO1xuXG4gICAgICAgIC8vIGNoZWNrIHRoZSB0b2tlblxuICAgICAgICBjb25zdCBhY3Rpb24gPVxuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICBjaGVja2FibGVUb2tlbnNbY2h1bmsubmFtZV0gIT09IDEgPyBub25DaGVja2FibGVBY3Rpb24gOiBmaWx0ZXIoc3RhY2ssIGNodW5rKSA/IHNwZWNpYWxBY3Rpb24gOiBkZWZhdWx0QWN0aW9uO1xuXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgZW5kVG9rZW4gPSBzdG9wVG9rZW5zW2NodW5rLm5hbWVdIHx8IFwiXCI7XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSBcInByb2Nlc3Mta2V5XCI6XG4gICAgICAgICAgICBpZiAoY2h1bmsubmFtZSA9PT0gXCJzdGFydEtleVwiKSB7XG4gICAgICAgICAgICAgIHN0YXRlID0gXCJwcm9jZXNzLWtleVwiO1xuICAgICAgICAgICAgICBjb250aW51ZSByZWNoZWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImFjY2VwdC10b2tlblwiOlxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgaWYgKGVuZFRva2VuICYmIG9wdGlvbmFsVG9rZW5zW2VuZFRva2VuXSkge1xuICAgICAgICAgICAgICBzdGF0ZSA9IFwiYWNjZXB0LXZhbHVlXCI7XG4gICAgICAgICAgICAgIHN0YXJ0VHJhbnNpdGlvbiA9ICEhdHJhbnNpdGlvbjtcbiAgICAgICAgICAgICAgY29udGludWUgcmVjaGVjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uKSByZXR1cm5Ub2tlbiA9IHRyYW5zaXRpb24oc3RhY2ssIGNodW5rLCBhY3Rpb24sIHNhbml0aXplZE9wdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuVG9rZW4gPSBjb21iaW5lTWFueU11dChyZXR1cm5Ub2tlbiwgY2h1bmspO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImFjY2VwdFwiOlxuICAgICAgICAgICAgaWYgKGVuZFRva2VuKSB7XG4gICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgc3RhdGUgPSBvcHRpb25hbFRva2Vuc1tlbmRUb2tlbl0gPyBcImFjY2VwdC12YWx1ZVwiIDogXCJhY2NlcHRcIjtcbiAgICAgICAgICAgICAgc3RhcnRUcmFuc2l0aW9uID0gISF0cmFuc2l0aW9uO1xuICAgICAgICAgICAgICBjb250aW51ZSByZWNoZWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24pIHJldHVyblRva2VuID0gdHJhbnNpdGlvbihzdGFjaywgY2h1bmssIGFjdGlvbiwgc2FuaXRpemVkT3B0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm5Ub2tlbiA9IGNvbWJpbmVNYW55TXV0KHJldHVyblRva2VuLCBjaHVuayk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwicmVqZWN0XCI6XG4gICAgICAgICAgICBpZiAoZW5kVG9rZW4pIHtcbiAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICBzdGF0ZSA9IG9wdGlvbmFsVG9rZW5zW2VuZFRva2VuXSA/IFwicmVqZWN0LXZhbHVlXCIgOiBcInJlamVjdFwiO1xuICAgICAgICAgICAgICBzdGFydFRyYW5zaXRpb24gPSAhIXRyYW5zaXRpb247XG4gICAgICAgICAgICAgIGNvbnRpbnVlIHJlY2hlY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbikgcmV0dXJuVG9rZW4gPSB0cmFuc2l0aW9uKHN0YWNrLCBjaHVuaywgYWN0aW9uLCBzYW5pdGl6ZWRPcHRpb25zKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJwYXNzXCI6XG4gICAgICAgICAgICBzdGF0ZSA9IFwicGFzc1wiO1xuICAgICAgICAgICAgY29udGludWUgcmVjaGVjaztcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyB1cGRhdGUgdGhlIHN0YWNrXG4gICAgICBzd2l0Y2ggKGNodW5rLm5hbWUpIHtcbiAgICAgICAgY2FzZSBcInN0YXJ0T2JqZWN0XCI6XG4gICAgICAgICAgc3RhY2sucHVzaChudWxsKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInN0YXJ0QXJyYXlcIjpcbiAgICAgICAgICBzdGFjay5wdXNoKC0xKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImVuZE9iamVjdFwiOlxuICAgICAgICBjYXNlIFwiZW5kQXJyYXlcIjpcbiAgICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJldHVyblRva2VuO1xuICAgIH0pO1xuICB9O1xuXG5leHBvcnQgY29uc3QgUGlja1BhcnNlciA9IChvcHRpb25zPzogYW55KSA9PiB3aXRoUGFyc2VyKGZpbHRlckJhc2UoKSwgT2JqZWN0LmFzc2lnbih7IHBhY2tLZXlzOiB0cnVlIH0sIG9wdGlvbnMpKTtcblxuY2xhc3MgQ291bnRlciB7XG4gIGRlcHRoOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKGluaXRpYWxEZXB0aDogbnVtYmVyKSB7XG4gICAgdGhpcy5kZXB0aCA9IGluaXRpYWxEZXB0aDtcbiAgfVxuICBzdGFydE9iamVjdCgpIHtcbiAgICArK3RoaXMuZGVwdGg7XG4gIH1cbiAgZW5kT2JqZWN0KCkge1xuICAgIC0tdGhpcy5kZXB0aDtcbiAgfVxuICBzdGFydEFycmF5KCkge1xuICAgICsrdGhpcy5kZXB0aDtcbiAgfVxuICBlbmRBcnJheSgpIHtcbiAgICAtLXRoaXMuZGVwdGg7XG4gIH1cbn1cblxuY2xhc3MgQXNzZW1ibGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgc3RhdGljIGNvbm5lY3RUbyhzdHJlYW06IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgcmV0dXJuIG5ldyBBc3NlbWJsZXIob3B0aW9ucykuY29ubmVjdFRvKHN0cmVhbSk7XG4gIH1cblxuICBzdGFjazogYW55O1xuICBjdXJyZW50OiBhbnk7XG4gIGtleTogYW55O1xuICBkb25lOiBib29sZWFuO1xuICByZXZpdmVyOiBhbnk7XG4gIC8vIEB0cy1pZ25vcmVcbiAgc3RyaW5nVmFsdWU6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkO1xuICB0YXBDaGFpbjogKGNodW5rOiBhbnkpID0+IGFueTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmtleSA9IG51bGw7XG4gICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgdGhpcy5yZXZpdmVyID0gdHlwZW9mIG9wdGlvbnMucmV2aXZlciA9PSBcImZ1bmN0aW9uXCIgJiYgb3B0aW9ucy5yZXZpdmVyO1xuICAgICAgaWYgKHRoaXMucmV2aXZlcikge1xuICAgICAgICB0aGlzLnN0cmluZ1ZhbHVlID0gdGhpcy5fc2F2ZVZhbHVlID0gdGhpcy5fc2F2ZVZhbHVlV2l0aFJldml2ZXI7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5udW1iZXJBc1N0cmluZykge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMubnVtYmVyVmFsdWUgPSB0aGlzLnN0cmluZ1ZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGFwQ2hhaW4gPSAoY2h1bmspID0+IHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGlmICh0aGlzW2NodW5rLm5hbWVdKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpc1tjaHVuay5uYW1lXShjaHVuay52YWx1ZSk7XG4gICAgICAgIGlmICh0aGlzLmRvbmUpIHJldHVybiB0aGlzLmN1cnJlbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9uZTtcbiAgICB9O1xuXG4gICAgdGhpcy5zdHJpbmdWYWx1ZSA9IHRoaXMuX3NhdmVWYWx1ZTtcbiAgfVxuXG4gIGNvbm5lY3RUbyhzdHJlYW06IGFueSkge1xuICAgIHN0cmVhbS5vbihcImRhdGFcIiwgKGNodW5rOiBhbnkpID0+IHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGlmICh0aGlzW2NodW5rLm5hbWVdKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpc1tjaHVuay5uYW1lXShjaHVuay52YWx1ZSk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgaWYgKHRoaXMuZG9uZSkgdGhpcy5lbWl0KFwiZG9uZVwiLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldCBkZXB0aCgpIHtcbiAgICByZXR1cm4gKHRoaXMuc3RhY2subGVuZ3RoID4+IDEpICsgKHRoaXMuZG9uZSA/IDAgOiAxKTtcbiAgfVxuXG4gIGdldCBwYXRoKCkge1xuICAgIGNvbnN0IHBhdGg6IGFueVtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN0YWNrLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICBjb25zdCBrZXkgPSB0aGlzLnN0YWNrW2kgKyAxXTtcbiAgICAgIHBhdGgucHVzaChrZXkgPT09IG51bGwgPyB0aGlzLnN0YWNrW2ldLmxlbmd0aCA6IGtleSk7XG4gICAgfVxuICAgIHJldHVybiBwYXRoO1xuICB9XG5cbiAgZHJvcFRvTGV2ZWwobGV2ZWw6IGFueSkge1xuICAgIGlmIChsZXZlbCA8IHRoaXMuZGVwdGgpIHtcbiAgICAgIGlmIChsZXZlbCA+IDApIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSAobGV2ZWwgLSAxKSA8PCAxO1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLnN0YWNrW2luZGV4XTtcbiAgICAgICAgdGhpcy5rZXkgPSB0aGlzLnN0YWNrW2luZGV4ICsgMV07XG4gICAgICAgIHRoaXMuc3RhY2suc3BsaWNlKGluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5rZXkgPSBudWxsO1xuICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNvbnN1bWUoY2h1bms6IGFueSkge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICB0aGlzW2NodW5rLm5hbWVdICYmIHRoaXNbY2h1bmsubmFtZV0oY2h1bmsudmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAga2V5VmFsdWUodmFsdWU6IGFueSkge1xuICAgIHRoaXMua2V5ID0gdmFsdWU7XG4gIH1cblxuICAvL3N0cmluZ1ZhbHVlKCkgLSBhbGlhc2VkIGJlbG93IHRvIF9zYXZlVmFsdWUoKVxuXG4gIG51bWJlclZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9zYXZlVmFsdWUocGFyc2VGbG9hdCh2YWx1ZSkpO1xuICB9XG4gIG51bGxWYWx1ZSgpIHtcbiAgICB0aGlzLl9zYXZlVmFsdWUobnVsbCk7XG4gIH1cbiAgdHJ1ZVZhbHVlKCkge1xuICAgIHRoaXMuX3NhdmVWYWx1ZSh0cnVlKTtcbiAgfVxuICBmYWxzZVZhbHVlKCkge1xuICAgIHRoaXMuX3NhdmVWYWx1ZShmYWxzZSk7XG4gIH1cblxuICBzdGFydE9iamVjdCgpIHtcbiAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFjay5wdXNoKHRoaXMuY3VycmVudCwgdGhpcy5rZXkpO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnQgPSBuZXcgT2JqZWN0KCk7XG4gICAgdGhpcy5rZXkgPSBudWxsO1xuICB9XG5cbiAgZW5kT2JqZWN0KCkge1xuICAgIGlmICh0aGlzLnN0YWNrLmxlbmd0aCkge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmN1cnJlbnQ7XG4gICAgICB0aGlzLmtleSA9IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5fc2F2ZVZhbHVlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBzdGFydEFycmF5KCkge1xuICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YWNrLnB1c2godGhpcy5jdXJyZW50LCB0aGlzLmtleSk7XG4gICAgfVxuICAgIHRoaXMuY3VycmVudCA9IFtdO1xuICAgIHRoaXMua2V5ID0gbnVsbDtcbiAgfVxuXG4gIGVuZEFycmF5KCkge1xuICAgIGlmICh0aGlzLnN0YWNrLmxlbmd0aCkge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmN1cnJlbnQ7XG4gICAgICB0aGlzLmtleSA9IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5fc2F2ZVZhbHVlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBfc2F2ZVZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuY3VycmVudCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRoaXMuY3VycmVudC5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY3VycmVudFt0aGlzLmtleV0gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5rZXkgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBfc2F2ZVZhbHVlV2l0aFJldml2ZXIodmFsdWU6IGFueSkge1xuICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMucmV2aXZlcihcIlwiLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB2YWx1ZSA9IHRoaXMucmV2aXZlcihcIlwiICsgdGhpcy5jdXJyZW50Lmxlbmd0aCwgdmFsdWUpO1xuICAgICAgICB0aGlzLmN1cnJlbnQucHVzaCh2YWx1ZSk7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuY3VycmVudFt0aGlzLmN1cnJlbnQubGVuZ3RoIC0gMV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gdGhpcy5yZXZpdmVyKHRoaXMua2V5LCB2YWx1ZSk7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5jdXJyZW50W3RoaXMua2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMua2V5ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY29uc3Qgc3RyZWFtQmFzZSA9XG4gICh7IHB1c2gsIGZpcnN0LCBsZXZlbCB9OiBhbnkpID0+XG4gIChvcHRpb25zID0ge30gYXMgYW55KSA9PiB7XG4gICAgY29uc3QgeyBvYmplY3RGaWx0ZXIsIGluY2x1ZGVVbmRlY2lkZWQgfSA9IG9wdGlvbnM7XG4gICAgbGV0IGFzbSA9IG5ldyBBc3NlbWJsZXIob3B0aW9ucykgYXMgYW55LFxuICAgICAgc3RhdGUgPSBmaXJzdCA/IFwiZmlyc3RcIiA6IFwiY2hlY2tcIixcbiAgICAgIHNhdmVkQXNtID0gbnVsbCBhcyBhbnk7XG5cbiAgICBpZiAodHlwZW9mIG9iamVjdEZpbHRlciAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIG5vIG9iamVjdCBmaWx0ZXIgKyBubyBmaXJzdCBjaGVja1xuICAgICAgaWYgKHN0YXRlID09PSBcImNoZWNrXCIpXG4gICAgICAgIHJldHVybiAoY2h1bms6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChhc21bY2h1bmsubmFtZV0pIHtcbiAgICAgICAgICAgIGFzbVtjaHVuay5uYW1lXShjaHVuay52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoYXNtLmRlcHRoID09PSBsZXZlbCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHVzaChhc20pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbm9uZTtcbiAgICAgICAgfTtcbiAgICAgIC8vIG5vIG9iamVjdCBmaWx0ZXJcbiAgICAgIHJldHVybiAoY2h1bms6IGFueSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICAgICAgY2FzZSBcImZpcnN0XCI6XG4gICAgICAgICAgICBmaXJzdChjaHVuayk7XG4gICAgICAgICAgICBzdGF0ZSA9IFwiYWNjZXB0XCI7XG4gICAgICAgICAgLy8gZmFsbCB0aHJvdWdoXG4gICAgICAgICAgY2FzZSBcImFjY2VwdFwiOlxuICAgICAgICAgICAgaWYgKGFzbVtjaHVuay5uYW1lXSkge1xuICAgICAgICAgICAgICBhc21bY2h1bmsubmFtZV0oY2h1bmsudmFsdWUpO1xuICAgICAgICAgICAgICBpZiAoYXNtLmRlcHRoID09PSBsZXZlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwdXNoKGFzbSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub25lO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBvYmplY3QgZmlsdGVyICsgYSBwb3NzaWJsZSBmaXJzdCBjaGVja1xuICAgIHJldHVybiAoY2h1bms6IGFueSkgPT4ge1xuICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICBjYXNlIFwiZmlyc3RcIjpcbiAgICAgICAgICBmaXJzdChjaHVuayk7XG4gICAgICAgICAgc3RhdGUgPSBcImNoZWNrXCI7XG4gICAgICAgIC8vIGZhbGwgdGhyb3VnaFxuICAgICAgICBjYXNlIFwiY2hlY2tcIjpcbiAgICAgICAgICBpZiAoYXNtW2NodW5rLm5hbWVdKSB7XG4gICAgICAgICAgICBhc21bY2h1bmsubmFtZV0oY2h1bmsudmFsdWUpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gb2JqZWN0RmlsdGVyKGFzbSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgIHN0YXRlID0gXCJhY2NlcHRcIjtcbiAgICAgICAgICAgICAgaWYgKGFzbS5kZXB0aCA9PT0gbGV2ZWwpIHJldHVybiBwdXNoKGFzbSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgaWYgKGFzbS5kZXB0aCA9PT0gbGV2ZWwpIHJldHVybiBwdXNoKGFzbSwgdHJ1ZSk7XG4gICAgICAgICAgICAgIHN0YXRlID0gXCJyZWplY3RcIjtcbiAgICAgICAgICAgICAgc2F2ZWRBc20gPSBhc207XG4gICAgICAgICAgICAgIGFzbSA9IG5ldyBDb3VudGVyKHNhdmVkQXNtLmRlcHRoKTtcbiAgICAgICAgICAgICAgc2F2ZWRBc20uZHJvcFRvTGV2ZWwobGV2ZWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKGFzbS5kZXB0aCA9PT0gbGV2ZWwpIHJldHVybiBwdXNoKGFzbSwgIWluY2x1ZGVVbmRlY2lkZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImFjY2VwdFwiOlxuICAgICAgICAgIGlmIChhc21bY2h1bmsubmFtZV0pIHtcbiAgICAgICAgICAgIGFzbVtjaHVuay5uYW1lXShjaHVuay52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoYXNtLmRlcHRoID09PSBsZXZlbCkge1xuICAgICAgICAgICAgICBzdGF0ZSA9IFwiY2hlY2tcIjtcbiAgICAgICAgICAgICAgcmV0dXJuIHB1c2goYXNtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJyZWplY3RcIjpcbiAgICAgICAgICBpZiAoYXNtW2NodW5rLm5hbWVdKSB7XG4gICAgICAgICAgICBhc21bY2h1bmsubmFtZV0oY2h1bmsudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGFzbS5kZXB0aCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgICAgICAgc3RhdGUgPSBcImNoZWNrXCI7XG4gICAgICAgICAgICAgIGFzbSA9IHNhdmVkQXNtO1xuICAgICAgICAgICAgICBzYXZlZEFzbSA9IG51bGw7XG4gICAgICAgICAgICAgIHJldHVybiBwdXNoKGFzbSwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vbmU7XG4gICAgfTtcbiAgfTtcblxuZXhwb3J0IGNvbnN0IFN0cmVhbUFycmF5ID0gKG9wdGlvbnM/OiBhbnkpID0+IHtcbiAgbGV0IGtleSA9IDA7XG4gIHJldHVybiBzdHJlYW1CYXNlKHtcbiAgICBsZXZlbDogMSxcblxuICAgIGZpcnN0KGNodW5rOiBhbnkpIHtcbiAgICAgIGlmIChjaHVuay5uYW1lICE9PSBcInN0YXJ0QXJyYXlcIikgdGhyb3cgbmV3IEVycm9yKFwiVG9wLWxldmVsIG9iamVjdCBzaG91bGQgYmUgYW4gYXJyYXkuXCIpO1xuICAgIH0sXG5cbiAgICBwdXNoKGFzbTogYW55LCBkaXNjYXJkOiBhbnkpIHtcbiAgICAgIGlmIChhc20uY3VycmVudC5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGRpc2NhcmQpIHtcbiAgICAgICAgICArK2tleTtcbiAgICAgICAgICBhc20uY3VycmVudC5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4geyBrZXk6IGtleSsrLCB2YWx1ZTogYXNtLmN1cnJlbnQucG9wKCkgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5vbmU7XG4gICAgfSxcbiAgfSkob3B0aW9ucyk7XG59O1xuIiwgImltcG9ydCB7IExpc3QsIE1lbnVCYXJFeHRyYSwgSWNvbiwgb3BlbiwgTGF1bmNoVHlwZSwgZW52aXJvbm1lbnQsIEFjdGlvblBhbmVsLCBBY3Rpb24gfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCBvcyBmcm9tIFwibm9kZTpvc1wiO1xuaW1wb3J0IHsgdXNlUmVmLCB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZU1lbW8gfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZVByb21pc2UsIFByb21pc2VPcHRpb25zIH0gZnJvbSBcIi4vdXNlUHJvbWlzZVwiO1xuaW1wb3J0IHsgdXNlTGF0ZXN0IH0gZnJvbSBcIi4vdXNlTGF0ZXN0XCI7XG5pbXBvcnQgeyBzaG93RmFpbHVyZVRvYXN0IH0gZnJvbSBcIi4vc2hvd0ZhaWx1cmVUb2FzdFwiO1xuaW1wb3J0IHsgYmFzZUV4ZWN1dGVTUUwsIFBlcm1pc3Npb25FcnJvciwgaXNQZXJtaXNzaW9uRXJyb3IgfSBmcm9tIFwiLi9zcWwtdXRpbHNcIjtcblxuLyoqXG4gKiBFeGVjdXRlcyBhIHF1ZXJ5IG9uIGEgbG9jYWwgU1FMIGRhdGFiYXNlIGFuZCByZXR1cm5zIHRoZSB7QGxpbmsgQXN5bmNTdGF0ZX0gY29ycmVzcG9uZGluZyB0byB0aGUgcXVlcnkgb2YgdGhlIGNvbW1hbmQuIFRoZSBsYXN0IHZhbHVlIHdpbGwgYmUga2VwdCBiZXR3ZWVuIGNvbW1hbmQgcnVucy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyB1c2VTUUwgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqIGltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuICogaW1wb3J0IHsgaG9tZWRpciB9IGZyb20gXCJvc1wiO1xuICpcbiAqIGNvbnN0IE5PVEVTX0RCID0gcmVzb2x2ZShob21lZGlyKCksIFwiTGlicmFyeS9Hcm91cCBDb250YWluZXJzL2dyb3VwLmNvbS5hcHBsZS5ub3Rlcy9Ob3RlU3RvcmUuc3FsaXRlXCIpO1xuICogY29uc3Qgbm90ZXNRdWVyeSA9IGBTRUxFQ1QgaWQsIHRpdGxlIEZST00gLi4uYDtcbiAqIHR5cGUgTm90ZUl0ZW0gPSB7XG4gKiAgIGlkOiBzdHJpbmc7XG4gKiAgIHRpdGxlOiBzdHJpbmc7XG4gKiB9O1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IHsgaXNMb2FkaW5nLCBkYXRhLCBwZXJtaXNzaW9uVmlldyB9ID0gdXNlU1FMPE5vdGVJdGVtPihOT1RFU19EQiwgbm90ZXNRdWVyeSk7XG4gKlxuICogICBpZiAocGVybWlzc2lvblZpZXcpIHtcbiAqICAgICByZXR1cm4gcGVybWlzc2lvblZpZXc7XG4gKiAgIH1cbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9PlxuICogICAgICAgeyhkYXRhIHx8IFtdKS5tYXAoKGl0ZW0pID0+IChcbiAqICAgICAgICAgPExpc3QuSXRlbSBrZXk9e2l0ZW0uaWR9IHRpdGxlPXtpdGVtLnRpdGxlfSAvPlxuICogICAgICAgKSl9XG4gKiAgICAgPC9MaXN0PlxuICogICk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VTUUw8VCA9IHVua25vd24+KFxuICBkYXRhYmFzZVBhdGg6IHN0cmluZyxcbiAgcXVlcnk6IHN0cmluZyxcbiAgb3B0aW9ucz86IHtcbiAgICAvKiogQSBzdHJpbmcgZXhwbGFpbmluZyB3aHkgdGhlIGV4dGVuc2lvbiBuZWVkcyBmdWxsIGRpc2sgYWNjZXNzLiBGb3IgZXhhbXBsZSwgdGhlIEFwcGxlIE5vdGVzIGV4dGVuc2lvbiB1c2VzIGBcIlRoaXMgaXMgcmVxdWlyZWQgdG8gc2VhcmNoIHlvdXIgQXBwbGUgTm90ZXMuXCJgLiBXaGlsZSBpdCBpcyBvcHRpb25hbCwgd2UgcmVjb21tZW5kIHNldHRpbmcgaXQgdG8gaGVscCB1c2VycyB1bmRlcnN0YW5kLiAqL1xuICAgIHBlcm1pc3Npb25QcmltaW5nPzogc3RyaW5nO1xuICB9ICYgT21pdDxQcm9taXNlT3B0aW9uczwoZGF0YWJhc2U6IHN0cmluZywgcXVlcnk6IHN0cmluZykgPT4gUHJvbWlzZTxUW10+PiwgXCJhYm9ydGFibGVcIj4sXG4pIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICBjb25zdCB7IHBlcm1pc3Npb25QcmltaW5nLCAuLi51c2VQcm9taXNlT3B0aW9ucyB9ID0gb3B0aW9ucyB8fCB7fTtcblxuICBjb25zdCBbcGVybWlzc2lvblZpZXcsIHNldFBlcm1pc3Npb25WaWV3XSA9IHVzZVN0YXRlPFJlYWN0LkpTWC5FbGVtZW50IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IGxhdGVzdE9wdGlvbnMgPSB1c2VMYXRlc3Qob3B0aW9ucyB8fCB7fSk7XG4gIGNvbnN0IGFib3J0YWJsZSA9IHVzZVJlZjxBYm9ydENvbnRyb2xsZXI+KG51bGwpO1xuXG4gIGNvbnN0IGhhbmRsZUVycm9yID0gdXNlQ2FsbGJhY2soXG4gICAgKF9lcnJvcjogRXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoX2Vycm9yKTtcbiAgICAgIGNvbnN0IGVycm9yID1cbiAgICAgICAgX2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgX2Vycm9yLm1lc3NhZ2UuaW5jbHVkZXMoXCJhdXRob3JpemF0aW9uIGRlbmllZFwiKVxuICAgICAgICAgID8gbmV3IFBlcm1pc3Npb25FcnJvcihcIllvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIGFjY2VzcyB0aGUgZGF0YWJhc2UuXCIpXG4gICAgICAgICAgOiAoX2Vycm9yIGFzIEVycm9yKTtcblxuICAgICAgaWYgKGlzUGVybWlzc2lvbkVycm9yKGVycm9yKSkge1xuICAgICAgICBzZXRQZXJtaXNzaW9uVmlldyg8UGVybWlzc2lvbkVycm9yU2NyZWVuIHByaW1pbmc9e2xhdGVzdE9wdGlvbnMuY3VycmVudC5wZXJtaXNzaW9uUHJpbWluZ30gLz4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGxhdGVzdE9wdGlvbnMuY3VycmVudC5vbkVycm9yKSB7XG4gICAgICAgICAgbGF0ZXN0T3B0aW9ucy5jdXJyZW50Lm9uRXJyb3IoZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChlbnZpcm9ubWVudC5sYXVuY2hUeXBlICE9PSBMYXVuY2hUeXBlLkJhY2tncm91bmQpIHtcbiAgICAgICAgICAgIHNob3dGYWlsdXJlVG9hc3QoZXJyb3IsIHtcbiAgICAgICAgICAgICAgdGl0bGU6IFwiQ2Fubm90IHF1ZXJ5IHRoZSBkYXRhXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIFtsYXRlc3RPcHRpb25zXSxcbiAgKTtcblxuICBjb25zdCBmbiA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghZXhpc3RzU3luYyhkYXRhYmFzZVBhdGgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgZGF0YWJhc2UgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFzeW5jIChkYXRhYmFzZVBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgYWJvcnRTaWduYWwgPSBhYm9ydGFibGUuY3VycmVudD8uc2lnbmFsO1xuICAgICAgcmV0dXJuIGJhc2VFeGVjdXRlU1FMPFQ+KGRhdGFiYXNlUGF0aCwgcXVlcnksIHsgc2lnbmFsOiBhYm9ydFNpZ25hbCB9KTtcbiAgICB9O1xuICB9LCBbZGF0YWJhc2VQYXRoXSk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi51c2VQcm9taXNlKGZuLCBbZGF0YWJhc2VQYXRoLCBxdWVyeV0sIHsgLi4udXNlUHJvbWlzZU9wdGlvbnMsIG9uRXJyb3I6IGhhbmRsZUVycm9yIH0pLFxuICAgIHBlcm1pc3Npb25WaWV3LFxuICB9O1xufVxuXG5mdW5jdGlvbiBQZXJtaXNzaW9uRXJyb3JTY3JlZW4ocHJvcHM6IHsgcHJpbWluZz86IHN0cmluZyB9KSB7XG4gIGNvbnN0IG1hY29zVmVudHVyYUFuZExhdGVyID0gcGFyc2VJbnQob3MucmVsZWFzZSgpLnNwbGl0KFwiLlwiKVswXSkgPj0gMjI7XG4gIGNvbnN0IHByZWZlcmVuY2VzU3RyaW5nID0gbWFjb3NWZW50dXJhQW5kTGF0ZXIgPyBcIlNldHRpbmdzXCIgOiBcIlByZWZlcmVuY2VzXCI7XG5cbiAgY29uc3QgYWN0aW9uID0gbWFjb3NWZW50dXJhQW5kTGF0ZXJcbiAgICA/IHtcbiAgICAgICAgdGl0bGU6IFwiT3BlbiBTeXN0ZW0gU2V0dGluZ3MgLT4gUHJpdmFjeVwiLFxuICAgICAgICB0YXJnZXQ6IFwieC1hcHBsZS5zeXN0ZW1wcmVmZXJlbmNlczpjb20uYXBwbGUucHJlZmVyZW5jZS5zZWN1cml0eT9Qcml2YWN5X0FsbEZpbGVzXCIsXG4gICAgICB9XG4gICAgOiB7XG4gICAgICAgIHRpdGxlOiBcIk9wZW4gU3lzdGVtIFByZWZlcmVuY2VzIC0+IFNlY3VyaXR5XCIsXG4gICAgICAgIHRhcmdldDogXCJ4LWFwcGxlLnN5c3RlbXByZWZlcmVuY2VzOmNvbS5hcHBsZS5wcmVmZXJlbmNlLnNlY3VyaXR5P1ByaXZhY3lfQWxsRmlsZXNcIixcbiAgICAgIH07XG5cbiAgaWYgKGVudmlyb25tZW50LmNvbW1hbmRNb2RlID09PSBcIm1lbnUtYmFyXCIpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPE1lbnVCYXJFeHRyYSBpY29uPXtJY29uLldhcm5pbmd9IHRpdGxlPXtlbnZpcm9ubWVudC5jb21tYW5kTmFtZX0+XG4gICAgICAgIDxNZW51QmFyRXh0cmEuSXRlbVxuICAgICAgICAgIHRpdGxlPVwiUmF5Y2FzdCBuZWVkcyBmdWxsIGRpc2sgYWNjZXNzXCJcbiAgICAgICAgICB0b29sdGlwPXtgWW91IGNhbiByZXZlcnQgdGhpcyBhY2Nlc3MgaW4gJHtwcmVmZXJlbmNlc1N0cmluZ30gd2hlbmV2ZXIgeW91IHdhbnRgfVxuICAgICAgICAvPlxuICAgICAgICB7cHJvcHMucHJpbWluZyA/IChcbiAgICAgICAgICA8TWVudUJhckV4dHJhLkl0ZW1cbiAgICAgICAgICAgIHRpdGxlPXtwcm9wcy5wcmltaW5nfVxuICAgICAgICAgICAgdG9vbHRpcD17YFlvdSBjYW4gcmV2ZXJ0IHRoaXMgYWNjZXNzIGluICR7cHJlZmVyZW5jZXNTdHJpbmd9IHdoZW5ldmVyIHlvdSB3YW50YH1cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPE1lbnVCYXJFeHRyYS5TZXBhcmF0b3IgLz5cbiAgICAgICAgPE1lbnVCYXJFeHRyYS5JdGVtIHRpdGxlPXthY3Rpb24udGl0bGV9IG9uQWN0aW9uPXsoKSA9PiBvcGVuKGFjdGlvbi50YXJnZXQpfSAvPlxuICAgICAgPC9NZW51QmFyRXh0cmE+XG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPExpc3Q+XG4gICAgICA8TGlzdC5FbXB0eVZpZXdcbiAgICAgICAgaWNvbj17e1xuICAgICAgICAgIHNvdXJjZToge1xuICAgICAgICAgICAgbGlnaHQ6IFwiaHR0cHM6Ly9yYXljYXN0LmNvbS91cGxvYWRzL2V4dGVuc2lvbnMtdXRpbHMtc2VjdXJpdHktcGVybWlzc2lvbnMtbGlnaHQucG5nXCIsXG4gICAgICAgICAgICBkYXJrOiBcImh0dHBzOi8vcmF5Y2FzdC5jb20vdXBsb2Fkcy9leHRlbnNpb25zLXV0aWxzLXNlY3VyaXR5LXBlcm1pc3Npb25zLWRhcmsucG5nXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfX1cbiAgICAgICAgdGl0bGU9XCJSYXljYXN0IG5lZWRzIGZ1bGwgZGlzayBhY2Nlc3MuXCJcbiAgICAgICAgZGVzY3JpcHRpb249e2Ake1xuICAgICAgICAgIHByb3BzLnByaW1pbmcgPyBwcm9wcy5wcmltaW5nICsgXCJcXG5cIiA6IFwiXCJcbiAgICAgICAgfVlvdSBjYW4gcmV2ZXJ0IHRoaXMgYWNjZXNzIGluICR7cHJlZmVyZW5jZXNTdHJpbmd9IHdoZW5ldmVyIHlvdSB3YW50LmB9XG4gICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgIDxBY3Rpb25QYW5lbD5cbiAgICAgICAgICAgIDxBY3Rpb24uT3BlbiB7Li4uYWN0aW9ufSAvPlxuICAgICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gICAgICAgIH1cbiAgICAgIC8+XG4gICAgPC9MaXN0PlxuICApO1xufVxuIiwgImltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwibm9kZTpmc1wiO1xuaW1wb3J0IHsgY29weUZpbGUsIG1rZGlyLCB3cml0ZUZpbGUgfSBmcm9tIFwibm9kZTpmcy9wcm9taXNlc1wiO1xuaW1wb3J0IG9zIGZyb20gXCJub2RlOm9zXCI7XG5pbXBvcnQgY2hpbGRQcm9jZXNzIGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB7IGdldFNwYXduZWRQcm9taXNlLCBnZXRTcGF3bmVkUmVzdWx0IH0gZnJvbSBcIi4vZXhlYy11dGlsc1wiO1xuaW1wb3J0IHsgaGFzaCB9IGZyb20gXCIuL2hlbHBlcnNcIjtcblxuZXhwb3J0IGNsYXNzIFBlcm1pc3Npb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJQZXJtaXNzaW9uRXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQZXJtaXNzaW9uRXJyb3IoZXJyb3I6IHVua25vd24pOiBlcnJvciBpcyBQZXJtaXNzaW9uRXJyb3Ige1xuICByZXR1cm4gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5uYW1lID09PSBcIlBlcm1pc3Npb25FcnJvclwiO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYmFzZUV4ZWN1dGVTUUw8VCA9IHVua25vd24+KFxuICBkYXRhYmFzZVBhdGg6IHN0cmluZyxcbiAgcXVlcnk6IHN0cmluZyxcbiAgb3B0aW9ucz86IHtcbiAgICBzaWduYWw/OiBBYm9ydFNpZ25hbDtcbiAgfSxcbik6IFByb21pc2U8VFtdPiB7XG4gIGlmICghZXhpc3RzU3luYyhkYXRhYmFzZVBhdGgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGRhdGFiYXNlIGRvZXMgbm90IGV4aXN0XCIpO1xuICB9XG5cbiAgbGV0IHNxbGl0ZTM6IHR5cGVvZiBpbXBvcnQoXCJub2RlOnNxbGl0ZVwiKTtcbiAgdHJ5IHtcbiAgICAvLyB0aGlzIGlzIGEgYml0IHVnbHkgYnV0IHdlIGNhbid0IGRpcmVjdGx5IGltcG9ydCBcIm5vZGU6c3FsaXRlXCIgaGVyZSBiZWNhdXNlIHBhcmNlbCB3aWxsIGhvaXN0IGl0IGFueXdheSBhbmQgaXQgd2lsbCBicmVhayB3aGVuIGl0J3Mgbm90IGF2YWlsYWJsZVxuICAgIGNvbnN0IGR5bmFtaWNJbXBvcnQgPSAobW9kdWxlOiBzdHJpbmcpID0+IGltcG9ydChtb2R1bGUpO1xuICAgIHNxbGl0ZTMgPSBhd2FpdCBkeW5hbWljSW1wb3J0KFwibm9kZTpzcWxpdGVcIik7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gSWYgc3FsaXRlMyBpcyBub3QgYXZhaWxhYmxlLCB3ZSBmYWxsYmFjayB0byB1c2luZyB0aGUgc3FsaXRlMyBDTEkgKGF2YWlsYWJsZSBvbiBtYWNPUyBhbmQgTGludXggYnkgZGVmYXVsdCkuXG4gICAgcmV0dXJuIHNxbGl0ZUZhbGxiYWNrPFQ+KGRhdGFiYXNlUGF0aCwgcXVlcnksIG9wdGlvbnMpO1xuICB9XG5cbiAgbGV0IGRiID0gbmV3IHNxbGl0ZTMuRGF0YWJhc2VTeW5jKGRhdGFiYXNlUGF0aCwgeyBvcGVuOiBmYWxzZSwgcmVhZE9ubHk6IHRydWUgfSk7XG5cbiAgY29uc3QgYWJvcnRTaWduYWwgPSBvcHRpb25zPy5zaWduYWw7XG5cbiAgdHJ5IHtcbiAgICBkYi5vcGVuKCk7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgaWYgKGVycm9yLm1lc3NhZ2UubWF0Y2goXCIoNSlcIikgfHwgZXJyb3IubWVzc2FnZS5tYXRjaChcIigxNClcIikpIHtcbiAgICAgIC8vIFRoYXQgbWVhbnMgdGhhdCB0aGUgREIgaXMgYnVzeSBiZWNhdXNlIG9mIGFub3RoZXIgYXBwIGlzIGxvY2tpbmcgaXRcbiAgICAgIC8vIFRoaXMgaGFwcGVucyB3aGVuIENocm9tZSBvciBBcmMgaXMgb3BlbmVkOiB0aGV5IGxvY2sgdGhlIEhpc3RvcnkgZGIuXG4gICAgICAvLyBBcyBhbiB1Z2x5IHdvcmthcm91bmQsIHdlIGR1cGxpY2F0ZSB0aGUgZmlsZSBhbmQgcmVhZCB0aGF0IGluc3RlYWRcbiAgICAgIC8vICh3aXRoIHZmcyB1bml4IC0gbm9uZSB0byBqdXN0IG5vdCBjYXJlIGFib3V0IGxvY2tzKVxuICAgICAgbGV0IHdvcmthcm91bmRDb3BpZWREYjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKCF3b3JrYXJvdW5kQ29waWVkRGIpIHtcbiAgICAgICAgY29uc3QgdGVtcEZvbGRlciA9IHBhdGguam9pbihvcy50bXBkaXIoKSwgXCJ1c2VTUUxcIiwgaGFzaChkYXRhYmFzZVBhdGgpKTtcbiAgICAgICAgYXdhaXQgbWtkaXIodGVtcEZvbGRlciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIGNoZWNrQWJvcnRlZChhYm9ydFNpZ25hbCk7XG5cbiAgICAgICAgd29ya2Fyb3VuZENvcGllZERiID0gcGF0aC5qb2luKHRlbXBGb2xkZXIsIFwiZGIuZGJcIik7XG4gICAgICAgIGF3YWl0IGNvcHlGaWxlKGRhdGFiYXNlUGF0aCwgd29ya2Fyb3VuZENvcGllZERiKTtcblxuICAgICAgICBhd2FpdCB3cml0ZUZpbGUod29ya2Fyb3VuZENvcGllZERiICsgXCItc2htXCIsIFwiXCIpO1xuICAgICAgICBhd2FpdCB3cml0ZUZpbGUod29ya2Fyb3VuZENvcGllZERiICsgXCItd2FsXCIsIFwiXCIpO1xuXG4gICAgICAgIGNoZWNrQWJvcnRlZChhYm9ydFNpZ25hbCk7XG4gICAgICB9XG5cbiAgICAgIGRiID0gbmV3IHNxbGl0ZTMuRGF0YWJhc2VTeW5jKHdvcmthcm91bmRDb3BpZWREYiwgeyBvcGVuOiBmYWxzZSwgcmVhZE9ubHk6IHRydWUgfSk7XG4gICAgICBkYi5vcGVuKCk7XG4gICAgICBjaGVja0Fib3J0ZWQoYWJvcnRTaWduYWwpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN0YXRlbWVudCA9IGRiLnByZXBhcmUocXVlcnkpO1xuICBjaGVja0Fib3J0ZWQoYWJvcnRTaWduYWwpO1xuXG4gIGNvbnN0IHJlc3VsdCA9IHN0YXRlbWVudC5hbGwoKTtcblxuICBkYi5jbG9zZSgpO1xuXG4gIHJldHVybiByZXN1bHQgYXMgVFtdO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzcWxpdGVGYWxsYmFjazxUID0gdW5rbm93bj4oXG4gIGRhdGFiYXNlUGF0aDogc3RyaW5nLFxuICBxdWVyeTogc3RyaW5nLFxuICBvcHRpb25zPzoge1xuICAgIHNpZ25hbD86IEFib3J0U2lnbmFsO1xuICB9LFxuKTogUHJvbWlzZTxUW10+IHtcbiAgY29uc3QgYWJvcnRTaWduYWwgPSBvcHRpb25zPy5zaWduYWw7XG5cbiAgbGV0IHNwYXduZWQgPSBjaGlsZFByb2Nlc3Muc3Bhd24oXCJzcWxpdGUzXCIsIFtcIi0tanNvblwiLCBcIi0tcmVhZG9ubHlcIiwgZGF0YWJhc2VQYXRoLCBxdWVyeV0sIHsgc2lnbmFsOiBhYm9ydFNpZ25hbCB9KTtcbiAgbGV0IHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCk7XG4gIGxldCBbeyBlcnJvciwgZXhpdENvZGUsIHNpZ25hbCB9LCBzdGRvdXRSZXN1bHQsIHN0ZGVyclJlc3VsdF0gPSBhd2FpdCBnZXRTcGF3bmVkUmVzdWx0PHN0cmluZz4oXG4gICAgc3Bhd25lZCxcbiAgICB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSxcbiAgICBzcGF3bmVkUHJvbWlzZSxcbiAgKTtcbiAgY2hlY2tBYm9ydGVkKGFib3J0U2lnbmFsKTtcblxuICBpZiAoc3RkZXJyUmVzdWx0Lm1hdGNoKFwiKDUpXCIpIHx8IHN0ZGVyclJlc3VsdC5tYXRjaChcIigxNClcIikpIHtcbiAgICAvLyBUaGF0IG1lYW5zIHRoYXQgdGhlIERCIGlzIGJ1c3kgYmVjYXVzZSBvZiBhbm90aGVyIGFwcCBpcyBsb2NraW5nIGl0XG4gICAgLy8gVGhpcyBoYXBwZW5zIHdoZW4gQ2hyb21lIG9yIEFyYyBpcyBvcGVuZWQ6IHRoZXkgbG9jayB0aGUgSGlzdG9yeSBkYi5cbiAgICAvLyBBcyBhbiB1Z2x5IHdvcmthcm91bmQsIHdlIGR1cGxpY2F0ZSB0aGUgZmlsZSBhbmQgcmVhZCB0aGF0IGluc3RlYWRcbiAgICAvLyAod2l0aCB2ZnMgdW5peCAtIG5vbmUgdG8ganVzdCBub3QgY2FyZSBhYm91dCBsb2NrcylcbiAgICBsZXQgd29ya2Fyb3VuZENvcGllZERiOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgaWYgKCF3b3JrYXJvdW5kQ29waWVkRGIpIHtcbiAgICAgIGNvbnN0IHRlbXBGb2xkZXIgPSBwYXRoLmpvaW4ob3MudG1wZGlyKCksIFwidXNlU1FMXCIsIGhhc2goZGF0YWJhc2VQYXRoKSk7XG4gICAgICBhd2FpdCBta2Rpcih0ZW1wRm9sZGVyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIGNoZWNrQWJvcnRlZChhYm9ydFNpZ25hbCk7XG5cbiAgICAgIHdvcmthcm91bmRDb3BpZWREYiA9IHBhdGguam9pbih0ZW1wRm9sZGVyLCBcImRiLmRiXCIpO1xuICAgICAgYXdhaXQgY29weUZpbGUoZGF0YWJhc2VQYXRoLCB3b3JrYXJvdW5kQ29waWVkRGIpO1xuXG4gICAgICBhd2FpdCB3cml0ZUZpbGUod29ya2Fyb3VuZENvcGllZERiICsgXCItc2htXCIsIFwiXCIpO1xuICAgICAgYXdhaXQgd3JpdGVGaWxlKHdvcmthcm91bmRDb3BpZWREYiArIFwiLXdhbFwiLCBcIlwiKTtcblxuICAgICAgY2hlY2tBYm9ydGVkKGFib3J0U2lnbmFsKTtcbiAgICB9XG5cbiAgICBzcGF3bmVkID0gY2hpbGRQcm9jZXNzLnNwYXduKFwic3FsaXRlM1wiLCBbXCItLWpzb25cIiwgXCItLXJlYWRvbmx5XCIsIFwiLS12ZnNcIiwgXCJ1bml4LW5vbmVcIiwgd29ya2Fyb3VuZENvcGllZERiLCBxdWVyeV0sIHtcbiAgICAgIHNpZ25hbDogYWJvcnRTaWduYWwsXG4gICAgfSk7XG4gICAgc3Bhd25lZFByb21pc2UgPSBnZXRTcGF3bmVkUHJvbWlzZShzcGF3bmVkKTtcbiAgICBbeyBlcnJvciwgZXhpdENvZGUsIHNpZ25hbCB9LCBzdGRvdXRSZXN1bHQsIHN0ZGVyclJlc3VsdF0gPSBhd2FpdCBnZXRTcGF3bmVkUmVzdWx0PHN0cmluZz4oXG4gICAgICBzcGF3bmVkLFxuICAgICAgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0sXG4gICAgICBzcGF3bmVkUHJvbWlzZSxcbiAgICApO1xuICAgIGNoZWNrQWJvcnRlZChhYm9ydFNpZ25hbCk7XG4gIH1cblxuICBpZiAoZXJyb3IgfHwgZXhpdENvZGUgIT09IDAgfHwgc2lnbmFsICE9PSBudWxsKSB7XG4gICAgaWYgKHN0ZGVyclJlc3VsdC5pbmNsdWRlcyhcImF1dGhvcml6YXRpb24gZGVuaWVkXCIpKSB7XG4gICAgICB0aHJvdyBuZXcgUGVybWlzc2lvbkVycm9yKFwiWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gYWNjZXNzIHRoZSBkYXRhYmFzZS5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihzdGRlcnJSZXN1bHQgfHwgXCJVbmtub3duIGVycm9yXCIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBKU09OLnBhcnNlKHN0ZG91dFJlc3VsdC50cmltKCkgfHwgXCJbXVwiKSBhcyBUW107XG59XG5cbmZ1bmN0aW9uIGNoZWNrQWJvcnRlZChzaWduYWw/OiBBYm9ydFNpZ25hbCkge1xuICBpZiAoc2lnbmFsPy5hYm9ydGVkKSB7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoXCJhYm9ydGVkXCIpO1xuICAgIGVycm9yLm5hbWUgPSBcIkFib3J0RXJyb3JcIjtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuIiwgImltcG9ydCB7IEZvcm0gfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZU1lbW8sIHVzZVJlZiwgU2V0U3RhdGVBY3Rpb24gfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZUxhdGVzdCB9IGZyb20gXCIuL3VzZUxhdGVzdFwiO1xuXG4vKipcbiAqIFNob3J0aGFuZHMgZm9yIGNvbW1vbiB2YWxpZGF0aW9uIGNhc2VzXG4gKi9cbmV4cG9ydCBlbnVtIEZvcm1WYWxpZGF0aW9uIHtcbiAgLyoqIFNob3cgYW4gZXJyb3Igd2hlbiB0aGUgdmFsdWUgb2YgdGhlIGl0ZW0gaXMgZW1wdHkgKi9cbiAgUmVxdWlyZWQgPSBcInJlcXVpcmVkXCIsXG59XG5cbnR5cGUgVmFsaWRhdGlvbkVycm9yID0gc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbDtcbnR5cGUgVmFsaWRhdG9yPFZhbHVlVHlwZT4gPSAoKHZhbHVlOiBWYWx1ZVR5cGUgfCB1bmRlZmluZWQpID0+IFZhbGlkYXRpb25FcnJvcikgfCBGb3JtVmFsaWRhdGlvbjtcblxuZnVuY3Rpb24gdmFsaWRhdGlvbkVycm9yPFZhbHVlVHlwZT4oXG4gIHZhbGlkYXRpb246IFZhbGlkYXRvcjxWYWx1ZVR5cGU+IHwgdW5kZWZpbmVkLFxuICB2YWx1ZTogVmFsdWVUeXBlIHwgdW5kZWZpbmVkLFxuKTogVmFsaWRhdGlvbkVycm9yIHtcbiAgaWYgKHZhbGlkYXRpb24pIHtcbiAgICBpZiAodHlwZW9mIHZhbGlkYXRpb24gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb24odmFsdWUpO1xuICAgIH0gZWxzZSBpZiAodmFsaWRhdGlvbiA9PT0gRm9ybVZhbGlkYXRpb24uUmVxdWlyZWQpIHtcbiAgICAgIGxldCB2YWx1ZUlzVmFsaWQgPSB0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIgJiYgdmFsdWUgIT09IG51bGw7XG4gICAgICBpZiAodmFsdWVJc1ZhbGlkKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgdmFsdWVJc1ZhbGlkID0gdmFsdWUubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICB2YWx1ZUlzVmFsaWQgPSB2YWx1ZS5sZW5ndGggPiAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgICAgdmFsdWVJc1ZhbGlkID0gdmFsdWUuZ2V0VGltZSgpID4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCF2YWx1ZUlzVmFsaWQpIHtcbiAgICAgICAgcmV0dXJuIFwiVGhlIGl0ZW0gaXMgcmVxdWlyZWRcIjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxudHlwZSBWYWxpZGF0aW9uPFQgZXh0ZW5kcyBGb3JtLlZhbHVlcz4gPSB7IFtpZCBpbiBrZXlvZiBUXT86IFZhbGlkYXRvcjxUW2lkXT4gfTtcblxuaW50ZXJmYWNlIEZvcm1Qcm9wczxUIGV4dGVuZHMgRm9ybS5WYWx1ZXM+IHtcbiAgLyoqIEZ1bmN0aW9uIHRvIHBhc3MgdG8gdGhlIGBvblN1Ym1pdGAgcHJvcCBvZiB0aGUgYDxBY3Rpb24uU3VibWl0Rm9ybT5gIGVsZW1lbnQuIEl0IHdyYXBzIHRoZSBpbml0aWFsIGBvblN1Ym1pdGAgYXJndW1lbnQgd2l0aCBzb21lIGdvb2RpZXMgcmVsYXRlZCB0byB0aGUgdmFsaWRhdGlvbi4gKi9cbiAgaGFuZGxlU3VibWl0OiAodmFsdWVzOiBUKSA9PiB2b2lkIHwgYm9vbGVhbiB8IFByb21pc2U8dm9pZCB8IGJvb2xlYW4+O1xuICAvKiogVGhlIHByb3BzIHRoYXQgbXVzdCBiZSBwYXNzZWQgdG8gdGhlIGA8Rm9ybS5JdGVtPmAgZWxlbWVudHMgdG8gaGFuZGxlIHRoZSB2YWxpZGF0aW9ucy4gKi9cbiAgaXRlbVByb3BzOiB7XG4gICAgW2lkIGluIGtleW9mIFJlcXVpcmVkPFQ+XTogUGFydGlhbDxGb3JtLkl0ZW1Qcm9wczxUW2lkXT4+ICYge1xuICAgICAgaWQ6IHN0cmluZztcbiAgICB9O1xuICB9O1xuICAvKiogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBwcm9ncmFtbWF0aWNhbGx5IHNldCB0aGUgdmFsaWRhdGlvbiBvZiBhIHNwZWNpZmljIGZpZWxkLiAqL1xuICBzZXRWYWxpZGF0aW9uRXJyb3I6IChpZDoga2V5b2YgVCwgZXJyb3I6IFZhbGlkYXRpb25FcnJvcikgPT4gdm9pZDtcbiAgLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gcHJvZ3JhbW1hdGljYWxseSBzZXQgdGhlIHZhbHVlIG9mIGEgc3BlY2lmaWMgZmllbGQuICovXG4gIHNldFZhbHVlOiA8SyBleHRlbmRzIGtleW9mIFQ+KGlkOiBLLCB2YWx1ZTogU2V0U3RhdGVBY3Rpb248VFtLXT4pID0+IHZvaWQ7XG4gIC8qKiBUaGUgY3VycmVudCB2YWx1ZXMgb2YgdGhlIGZvcm0uICovXG4gIHZhbHVlczogVDtcbiAgLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gcHJvZ3JhbW1hdGljYWxseSBmb2N1cyBhIHNwZWNpZmljIGZpZWxkLiAqL1xuICBmb2N1czogKGlkOiBrZXlvZiBUKSA9PiB2b2lkO1xuICAvKiogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZXNldCB0aGUgdmFsdWVzIG9mIHRoZSBGb3JtLiAqL1xuICByZXNldDogKGluaXRpYWxWYWx1ZXM/OiBQYXJ0aWFsPFQ+KSA9PiB2b2lkO1xufVxuXG4vKipcbiAqIEhvb2sgdGhhdCBwcm92aWRlcyBhIGhpZ2gtbGV2ZWwgaW50ZXJmYWNlIHRvIHdvcmsgd2l0aCBGb3JtcywgYW5kIG1vcmUgcGFydGljdWxhcmx5LCB3aXRoIEZvcm0gdmFsaWRhdGlvbnMuIEl0IGluY29ycG9yYXRlcyBhbGwgdGhlIGdvb2QgcHJhY3RpY2VzIHRvIHByb3ZpZGUgYSBncmVhdCBVc2VyIEV4cGVyaWVuY2UgZm9yIHlvdXIgRm9ybXMuXG4gKlxuICogQHJldHVybnMgYW4gb2JqZWN0IHdoaWNoIGNvbnRhaW5zIHRoZSBuZWNlc3NhcnkgbWV0aG9kcyBhbmQgcHJvcHMgdG8gcHJvdmlkZSBhIGdvb2QgVXNlciBFeHBlcmllbmNlIGluIHlvdXIgRm9ybS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyBBY3Rpb24sIEFjdGlvblBhbmVsLCBGb3JtLCBzaG93VG9hc3QsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgdXNlRm9ybSwgRm9ybVZhbGlkYXRpb24gfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiBpbnRlcmZhY2UgU2lnblVwRm9ybVZhbHVlcyB7XG4gKiAgIG5pY2tuYW1lOiBzdHJpbmc7XG4gKiAgIHBhc3N3b3JkOiBzdHJpbmc7XG4gKiB9XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ29tbWFuZCgpIHtcbiAqICAgY29uc3QgeyBoYW5kbGVTdWJtaXQsIGl0ZW1Qcm9wcyB9ID0gdXNlRm9ybTxTaWduVXBGb3JtVmFsdWVzPih7XG4gKiAgICAgb25TdWJtaXQodmFsdWVzKSB7XG4gKiAgICAgICBzaG93VG9hc3QoVG9hc3QuU3R5bGUuU3VjY2VzcywgXCJZYXkhXCIsIGAke3ZhbHVlcy5uaWNrbmFtZX0gYWNjb3VudCBjcmVhdGVkYCk7XG4gKiAgICAgfSxcbiAqICAgICB2YWxpZGF0aW9uOiB7XG4gKiAgICAgICBuaWNrbmFtZTogRm9ybVZhbGlkYXRpb24uUmVxdWlyZWQsXG4gKiAgICAgICBwYXNzd29yZDogKHZhbHVlKSA9PiB7XG4gKiAgICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPCA4KSB7XG4gKiAgICAgICAgICAgcmV0dXJuIFwiUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IHN5bWJvbHNcIjtcbiAqICAgICAgICAgfSBlbHNlIGlmICghdmFsdWUpIHtcbiAqICAgICAgICAgICByZXR1cm4gXCJUaGUgaXRlbSBpcyByZXF1aXJlZFwiO1xuICogICAgICAgICB9XG4gKiAgICAgICB9LFxuICogICAgIH0sXG4gKiAgIH0pO1xuICpcbiAqICAgcmV0dXJuIChcbiAqICAgICA8Rm9ybVxuICogICAgICAgYWN0aW9ucz17XG4gKiAgICAgICAgIDxBY3Rpb25QYW5lbD5cbiAqICAgICAgICAgICA8QWN0aW9uLlN1Ym1pdEZvcm0gdGl0bGU9XCJTdWJtaXRcIiBvblN1Ym1pdD17aGFuZGxlU3VibWl0fSAvPlxuICogICAgICAgICA8L0FjdGlvblBhbmVsPlxuICogICAgICAgfVxuICogICAgID5cbiAqICAgICAgIDxGb3JtLlRleHRGaWVsZCB0aXRsZT1cIk5pY2tuYW1lXCIgcGxhY2Vob2xkZXI9XCJFbnRlciB5b3VyIG5pY2tuYW1lXCIgey4uLml0ZW1Qcm9wcy5uaWNrbmFtZX0gLz5cbiAqICAgICAgIDxGb3JtLlBhc3N3b3JkRmllbGRcbiAqICAgICAgICAgdGl0bGU9XCJQYXNzd29yZFwiXG4gKiAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgcGFzc3dvcmQgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzIGxvbmdcIlxuICogICAgICAgICB7Li4uaXRlbVByb3BzLnBhc3N3b3JkfVxuICogICAgICAgLz5cbiAqICAgICA8L0Zvcm0+XG4gKiAgICk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUZvcm08VCBleHRlbmRzIEZvcm0uVmFsdWVzPihwcm9wczoge1xuICAvKiogQ2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBmb3JtIGlzIHN1Ym1pdHRlZCBhbmQgYWxsIHZhbGlkYXRpb25zIHBhc3MuICovXG4gIG9uU3VibWl0OiAodmFsdWVzOiBUKSA9PiB2b2lkIHwgYm9vbGVhbiB8IFByb21pc2U8dm9pZCB8IGJvb2xlYW4+O1xuICAvKiogVGhlIGluaXRpYWwgdmFsdWVzIHRvIHNldCB3aGVuIHRoZSBGb3JtIGlzIGZpcnN0IHJlbmRlcmVkLiAqL1xuICBpbml0aWFsVmFsdWVzPzogUGFydGlhbDxUPjtcbiAgLyoqIFRoZSB2YWxpZGF0aW9uIHJ1bGVzIGZvciB0aGUgRm9ybS4gQSB2YWxpZGF0aW9uIGZvciBhIEZvcm0gaXRlbSBpcyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGl0ZW0gYXMgYW4gYXJndW1lbnQgYW5kIG11c3QgcmV0dXJuIGEgc3RyaW5nIHdoZW4gdGhlIHZhbGlkYXRpb24gaXMgZmFpbGluZy5cbiAgICpcbiAgICogVGhlcmUgYXJlIGFsc28gc29tZSBzaG9ydGhhbmRzIGZvciBjb21tb24gY2FzZXMsIHNlZSB7QGxpbmsgRm9ybVZhbGlkYXRpb259LlxuICAgKiAqL1xuICB2YWxpZGF0aW9uPzogVmFsaWRhdGlvbjxUPjtcbn0pOiBGb3JtUHJvcHM8VD4ge1xuICBjb25zdCB7IG9uU3VibWl0OiBfb25TdWJtaXQsIHZhbGlkYXRpb24sIGluaXRpYWxWYWx1ZXMgPSB7fSB9ID0gcHJvcHM7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBpdCdzIGZpbmUgaWYgd2UgZG9uJ3Qgc3BlY2lmeSBhbGwgdGhlIHZhbHVlc1xuICBjb25zdCBbdmFsdWVzLCBzZXRWYWx1ZXNdID0gdXNlU3RhdGU8VD4oaW5pdGlhbFZhbHVlcyk7XG4gIGNvbnN0IFtlcnJvcnMsIHNldEVycm9yc10gPSB1c2VTdGF0ZTx7IFtpZCBpbiBrZXlvZiBUXT86IFZhbGlkYXRpb25FcnJvciB9Pih7fSk7XG4gIGNvbnN0IHJlZnMgPSB1c2VSZWY8eyBbaWQgaW4ga2V5b2YgVF0/OiBGb3JtLkl0ZW1SZWZlcmVuY2UgfT4oe30pO1xuXG4gIGNvbnN0IGxhdGVzdFZhbGlkYXRpb24gPSB1c2VMYXRlc3Q8VmFsaWRhdGlvbjxUPj4odmFsaWRhdGlvbiB8fCB7fSk7XG4gIGNvbnN0IGxhdGVzdE9uU3VibWl0ID0gdXNlTGF0ZXN0KF9vblN1Ym1pdCk7XG5cbiAgY29uc3QgZm9jdXMgPSB1c2VDYWxsYmFjayhcbiAgICAoaWQ6IGtleW9mIFQpID0+IHtcbiAgICAgIHJlZnMuY3VycmVudFtpZF0/LmZvY3VzKCk7XG4gICAgfSxcbiAgICBbcmVmc10sXG4gICk7XG5cbiAgY29uc3QgaGFuZGxlU3VibWl0ID0gdXNlQ2FsbGJhY2soXG4gICAgYXN5bmMgKHZhbHVlczogVCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgbGV0IHZhbGlkYXRpb25FcnJvcnM6IGZhbHNlIHwgeyBba2V5IGluIGtleW9mIFRdPzogVmFsaWRhdGlvbkVycm9yIH0gPSBmYWxzZTtcbiAgICAgIGZvciAoY29uc3QgW2lkLCB2YWxpZGF0aW9uXSBvZiBPYmplY3QuZW50cmllcyhsYXRlc3RWYWxpZGF0aW9uLmN1cnJlbnQpKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gdmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb24sIHZhbHVlc1tpZF0pO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoIXZhbGlkYXRpb25FcnJvcnMpIHtcbiAgICAgICAgICAgIHZhbGlkYXRpb25FcnJvcnMgPSB7fTtcbiAgICAgICAgICAgIC8vIHdlIGZvY3VzIHRoZSBmaXJzdCBpdGVtIHRoYXQgaGFzIGFuIGVycm9yXG4gICAgICAgICAgICBmb2N1cyhpZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbGlkYXRpb25FcnJvcnNbaWQgYXMga2V5b2YgVF0gPSBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHZhbGlkYXRpb25FcnJvcnMpIHtcbiAgICAgICAgc2V0RXJyb3JzKHZhbGlkYXRpb25FcnJvcnMpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBsYXRlc3RPblN1Ym1pdC5jdXJyZW50KHZhbHVlcyk7XG4gICAgICByZXR1cm4gdHlwZW9mIHJlc3VsdCA9PT0gXCJib29sZWFuXCIgPyByZXN1bHQgOiB0cnVlO1xuICAgIH0sXG4gICAgW2xhdGVzdFZhbGlkYXRpb24sIGxhdGVzdE9uU3VibWl0LCBmb2N1c10sXG4gICk7XG5cbiAgY29uc3Qgc2V0VmFsaWRhdGlvbkVycm9yID0gdXNlQ2FsbGJhY2soXG4gICAgKGlkOiBrZXlvZiBULCBlcnJvcjogVmFsaWRhdGlvbkVycm9yKSA9PiB7XG4gICAgICBzZXRFcnJvcnMoKGVycm9ycykgPT4gKHsgLi4uZXJyb3JzLCBbaWRdOiBlcnJvciB9KSk7XG4gICAgfSxcbiAgICBbc2V0RXJyb3JzXSxcbiAgKTtcblxuICBjb25zdCBzZXRWYWx1ZSA9IHVzZUNhbGxiYWNrKFxuICAgIGZ1bmN0aW9uIDxLIGV4dGVuZHMga2V5b2YgVD4oaWQ6IEssIHZhbHVlOiBTZXRTdGF0ZUFjdGlvbjxUW0tdPikge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUUyBpcyBhbHdheXMgY29uZnVzZWQgYWJvdXQgU2V0U3RhdGVBY3Rpb24sIGJ1dCBpdCdzIGZpbmUgaGVyZVxuICAgICAgc2V0VmFsdWVzKCh2YWx1ZXMpID0+ICh7IC4uLnZhbHVlcywgW2lkXTogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZSh2YWx1ZXNbaWRdKSA6IHZhbHVlIH0pKTtcbiAgICB9LFxuICAgIFtzZXRWYWx1ZXNdLFxuICApO1xuXG4gIGNvbnN0IGl0ZW1Qcm9wcyA9IHVzZU1lbW88eyBbaWQgaW4ga2V5b2YgUmVxdWlyZWQ8VD5dOiBQYXJ0aWFsPEZvcm0uSXRlbVByb3BzPFRbaWRdPj4gJiB7IGlkOiBzdHJpbmcgfSB9PigoKSA9PiB7XG4gICAgLy8gd2UgaGF2ZSB0byB1c2UgYSBwcm94eSBiZWNhdXNlIHdlIGRvbid0IGFjdHVhbGx5IGhhdmUgYW55IG9iamVjdCB0byBpdGVyYXRlIHRocm91Z2hcbiAgICAvLyBzbyBpbnN0ZWFkIHdlIGR5bmFtaWNhbGx5IGNyZWF0ZSB0aGUgcHJvcHMgd2hlbiByZXF1aXJlZFxuICAgIHJldHVybiBuZXcgUHJveHk8eyBbaWQgaW4ga2V5b2YgUmVxdWlyZWQ8VD5dOiBQYXJ0aWFsPEZvcm0uSXRlbVByb3BzPFRbaWRdPj4gJiB7IGlkOiBzdHJpbmcgfSB9PihcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdGhlIHdob2xlIHBvaW50IG9mIGEgcHJveHkuLi5cbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBnZXQodGFyZ2V0LCBpZDoga2V5b2YgVCkge1xuICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb24gPSBsYXRlc3RWYWxpZGF0aW9uLmN1cnJlbnRbaWRdO1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gdmFsdWVzW2lkXTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb25DaGFuZ2UodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKGVycm9yc1tpZF0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IHZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICAgICAgICAgICAgc2V0VmFsaWRhdGlvbkVycm9yKGlkLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZXRWYWx1ZShpZCwgdmFsdWUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQmx1cihldmVudCkge1xuICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IHZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uLCBldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBzZXRWYWxpZGF0aW9uRXJyb3IoaWQsIGVycm9yKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBlcnJvcnNbaWRdLFxuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAvLyB3ZSBzaG91bGRuJ3QgcmV0dXJuIGB1bmRlZmluZWRgIG90aGVyd2lzZSBpdCB3aWxsIGJlIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnRcbiAgICAgICAgICAgIHZhbHVlOiB0eXBlb2YgdmFsdWUgPT09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogdmFsdWUsXG4gICAgICAgICAgICByZWY6IChpbnN0YW5jZTogRm9ybS5JdGVtUmVmZXJlbmNlKSA9PiB7XG4gICAgICAgICAgICAgIHJlZnMuY3VycmVudFtpZF0gPSBpbnN0YW5jZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSBhcyBQYXJ0aWFsPEZvcm0uSXRlbVByb3BzPFRba2V5b2YgVF0+PiAmIHsgaWQ6IHN0cmluZyB9O1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICApO1xuICB9LCBbZXJyb3JzLCBsYXRlc3RWYWxpZGF0aW9uLCBzZXRWYWxpZGF0aW9uRXJyb3IsIHZhbHVlcywgcmVmcywgc2V0VmFsdWVdKTtcblxuICBjb25zdCByZXNldCA9IHVzZUNhbGxiYWNrKFxuICAgICh2YWx1ZXM/OiBQYXJ0aWFsPFQ+KSA9PiB7XG4gICAgICBzZXRFcnJvcnMoe30pO1xuICAgICAgT2JqZWN0LmVudHJpZXMocmVmcy5jdXJyZW50KS5mb3JFYWNoKChbaWQsIHJlZl0pID0+IHtcbiAgICAgICAgaWYgKCF2YWx1ZXM/LltpZF0pIHtcbiAgICAgICAgICByZWY/LnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGl0J3MgZmluZSBpZiB3ZSBkb24ndCBzcGVjaWZ5IGFsbCB0aGUgdmFsdWVzXG4gICAgICAgIHNldFZhbHVlcyh2YWx1ZXMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgW3NldFZhbHVlcywgc2V0RXJyb3JzLCByZWZzXSxcbiAgKTtcblxuICByZXR1cm4geyBoYW5kbGVTdWJtaXQsIHNldFZhbGlkYXRpb25FcnJvciwgc2V0VmFsdWUsIHZhbHVlcywgaXRlbVByb3BzLCBmb2N1cywgcmVzZXQgfTtcbn1cbiIsICJpbXBvcnQgeyB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBBSSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IFByb21pc2VPcHRpb25zLCB1c2VQcm9taXNlIH0gZnJvbSBcIi4vdXNlUHJvbWlzZVwiO1xuaW1wb3J0IHsgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBTdHJlYW0gYSBwcm9tcHQgY29tcGxldGlvbi5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgRGV0YWlsLCBMYXVuY2hQcm9wcyB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZSBBSSB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQocHJvcHM6IExhdW5jaFByb3BzPHsgYXJndW1lbnRzOiB7IHByb21wdDogc3RyaW5nIH0gfT4pIHtcbiAqICAgY29uc3QgeyBpc0xvYWRpbmcsIGRhdGEgfSA9IHVzZUFJKHByb3BzLmFyZ3VtZW50cy5wcm9tcHQpO1xuICpcbiAqICAgcmV0dXJuIDxEZXRhaWwgaXNMb2FkaW5nPXtpc0xvYWRpbmd9IG1hcmtkb3duPXtkYXRhfSAvPjtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQUkoXG4gIHByb21wdDogc3RyaW5nLFxuICBvcHRpb25zOiB7XG4gICAgLyoqXG4gICAgICogQ29uY3JldGUgdGFza3MsIHN1Y2ggYXMgZml4aW5nIGdyYW1tYXIsIHJlcXVpcmUgbGVzcyBjcmVhdGl2aXR5IHdoaWxlIG9wZW4tZW5kZWQgcXVlc3Rpb25zLCBzdWNoIGFzIGdlbmVyYXRpbmcgaWRlYXMsIHJlcXVpcmUgbW9yZS5cbiAgICAgKiBJZiBhIG51bWJlciBpcyBwYXNzZWQsIGl0IG5lZWRzIHRvIGJlIGluIHRoZSByYW5nZSAwLTIuIEZvciBsYXJnZXIgdmFsdWVzLCAyIHdpbGwgYmUgdXNlZC4gRm9yIGxvd2VyIHZhbHVlcywgMCB3aWxsIGJlIHVzZWQuXG4gICAgICovXG4gICAgY3JlYXRpdml0eT86IEFJLkNyZWF0aXZpdHk7XG4gICAgLyoqXG4gICAgICogVGhlIEFJIG1vZGVsIHRvIHVzZSB0byBhbnN3ZXIgdG8gdGhlIHByb21wdC5cbiAgICAgKi9cbiAgICBtb2RlbD86IEFJLk1vZGVsO1xuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdG8gc3RyZWFtIHRoZSBhbnN3ZXIgb3Igb25seSB1cGRhdGUgdGhlIGRhdGEgd2hlbiB0aGUgZW50aXJlIGFuc3dlciBoYXMgYmVlbiByZWNlaXZlZC5cbiAgICAgKi9cbiAgICBzdHJlYW0/OiBib29sZWFuO1xuICB9ICYgT21pdDxQcm9taXNlT3B0aW9uczxGdW5jdGlvblJldHVybmluZ1Byb21pc2U+LCBcImFib3J0YWJsZVwiPiA9IHt9LFxuKSB7XG4gIGNvbnN0IHsgY3JlYXRpdml0eSwgc3RyZWFtLCBtb2RlbCwgLi4udXNlUHJvbWlzZU9wdGlvbnMgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBhYm9ydGFibGUgPSB1c2VSZWY8QWJvcnRDb250cm9sbGVyPihudWxsKTtcbiAgY29uc3QgeyBpc0xvYWRpbmcsIGVycm9yLCByZXZhbGlkYXRlIH0gPSB1c2VQcm9taXNlKFxuICAgIGFzeW5jIChwcm9tcHQ6IHN0cmluZywgY3JlYXRpdml0eT86IEFJLkNyZWF0aXZpdHksIHNob3VsZFN0cmVhbT86IGJvb2xlYW4pID0+IHtcbiAgICAgIHNldERhdGEoXCJcIik7XG4gICAgICBjb25zdCBzdHJlYW0gPSBBSS5hc2socHJvbXB0LCB7IGNyZWF0aXZpdHksIG1vZGVsLCBzaWduYWw6IGFib3J0YWJsZS5jdXJyZW50Py5zaWduYWwgfSk7XG4gICAgICBpZiAoc2hvdWxkU3RyZWFtID09PSBmYWxzZSkge1xuICAgICAgICBzZXREYXRhKGF3YWl0IHN0cmVhbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHJlYW0ub24oXCJkYXRhXCIsIChkYXRhKSA9PiB7XG4gICAgICAgICAgc2V0RGF0YSgoeCkgPT4geCArIGRhdGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgc3RyZWFtO1xuICAgICAgfVxuICAgIH0sXG4gICAgW3Byb21wdCwgY3JlYXRpdml0eSwgc3RyZWFtXSxcbiAgICB7IC4uLnVzZVByb21pc2VPcHRpb25zLCBhYm9ydGFibGUgfSxcbiAgKTtcblxuICByZXR1cm4geyBpc0xvYWRpbmcsIGRhdGEsIGVycm9yLCByZXZhbGlkYXRlIH07XG59XG4iLCAiaW1wb3J0IHsgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZUxhdGVzdCB9IGZyb20gXCIuL3VzZUxhdGVzdFwiO1xuaW1wb3J0IHsgdXNlQ2FjaGVkU3RhdGUgfSBmcm9tIFwiLi91c2VDYWNoZWRTdGF0ZVwiO1xuXG4vLyBUaGUgYWxnb3JpdGhtIGJlbG93IGlzIGluc3BpcmVkIGJ5IHRoZSBvbmUgdXNlZCBieSBGaXJlZm94OlxuLy8gaHR0cHM6Ly93aWtpLm1vemlsbGEub3JnL1VzZXI6SmVzc2UvTmV3RnJlY2VuY3lcblxudHlwZSBGcmVjZW5jeSA9IHtcbiAgbGFzdFZpc2l0ZWQ6IG51bWJlcjtcbiAgZnJlY2VuY3k6IG51bWJlcjtcbn07XG5cbmNvbnN0IEhBTEZfTElGRV9EQVlTID0gMTA7XG5cbmNvbnN0IE1TX1BFUl9EQVkgPSAyNCAqIDYwICogNjAgKiAxMDAwO1xuXG5jb25zdCBWSVNJVF9UWVBFX1BPSU5UUyA9IHtcbiAgRGVmYXVsdDogMTAwLFxuICBFbWJlZDogMCxcbiAgQm9va21hcms6IDE0MCxcbn07XG5cbmZ1bmN0aW9uIGdldE5ld0ZyZWNlbmN5KGl0ZW0/OiBGcmVjZW5jeSk6IEZyZWNlbmN5IHtcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgY29uc3QgbGFzdFZpc2l0ZWQgPSBpdGVtID8gaXRlbS5sYXN0VmlzaXRlZCA6IDA7XG4gIGNvbnN0IGZyZWNlbmN5ID0gaXRlbSA/IGl0ZW0uZnJlY2VuY3kgOiAwO1xuXG4gIGNvbnN0IHZpc2l0QWdlSW5EYXlzID0gKG5vdyAtIGxhc3RWaXNpdGVkKSAvIE1TX1BFUl9EQVk7XG4gIGNvbnN0IERFQ0FZX1JBVEVfQ09OU1RBTlQgPSBNYXRoLmxvZygyKSAvIChIQUxGX0xJRkVfREFZUyAqIE1TX1BFUl9EQVkpO1xuICBjb25zdCBjdXJyZW50VmlzaXRWYWx1ZSA9IFZJU0lUX1RZUEVfUE9JTlRTLkRlZmF1bHQgKiBNYXRoLmV4cCgtREVDQVlfUkFURV9DT05TVEFOVCAqIHZpc2l0QWdlSW5EYXlzKTtcbiAgY29uc3QgdG90YWxWaXNpdFZhbHVlID0gZnJlY2VuY3kgKyBjdXJyZW50VmlzaXRWYWx1ZTtcblxuICByZXR1cm4ge1xuICAgIGxhc3RWaXNpdGVkOiBub3csXG4gICAgZnJlY2VuY3k6IHRvdGFsVmlzaXRWYWx1ZSxcbiAgfTtcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbmNvbnN0IGRlZmF1bHRLZXkgPSAoaXRlbTogYW55KTogc3RyaW5nID0+IHtcbiAgaWYgKFxuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIiAmJlxuICAgICh0eXBlb2YgaXRlbSAhPT0gXCJvYmplY3RcIiB8fCAhaXRlbSB8fCAhKFwiaWRcIiBpbiBpdGVtKSB8fCB0eXBlb2YgaXRlbS5pZCAhPSBcInN0cmluZ1wiKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJTcGVjaWZ5IGEga2V5IGZ1bmN0aW9uIG9yIG1ha2Ugc3VyZSB5b3VyIGl0ZW1zIGhhdmUgYW4gJ2lkJyBwcm9wZXJ0eVwiKTtcbiAgfVxuICByZXR1cm4gaXRlbS5pZDtcbn07XG5cbi8qKlxuICogU29ydCBhbiBhcnJheSBieSBpdHMgZnJlY2VuY3kgYW5kIHByb3ZpZGUgbWV0aG9kcyB0byB1cGRhdGUgdGhlIGZyZWNlbmN5IG9mIGl0cyBpdGVtcy5cbiAqIEZyZWNlbmN5IGlzIGEgbWVhc3VyZSB0aGF0IGNvbWJpbmVzIGZyZXF1ZW5jeSBhbmQgcmVjZW5jeS4gVGhlIG1vcmUgb2Z0ZW4gYW4gaXRlbSBpcyB2aXNpdGVkL3VzZWQsIGFuZCB0aGUgbW9yZSByZWNlbnRseSBhbiBpdGVtIGlzIHZpc2l0ZWQvdXNlZCwgdGhlIGhpZ2hlciBpdCB3aWxsIHJhbmsuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgTGlzdCwgQWN0aW9uUGFuZWwsIEFjdGlvbiwgSWNvbiB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZUZldGNoLCB1c2VGcmVjZW5jeVNvcnRpbmcgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKCkge1xuICogICBjb25zdCB7IGlzTG9hZGluZywgZGF0YSB9ID0gdXNlRmV0Y2goXCJodHRwczovL2FwaS5leGFtcGxlXCIpO1xuICogICBjb25zdCB7IGRhdGE6IHNvcnRlZERhdGEsIHZpc2l0SXRlbSwgcmVzZXRSYW5raW5nIH0gPSB1c2VGcmVjZW5jeVNvcnRpbmcoZGF0YSk7XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxMaXN0IGlzTG9hZGluZz17aXNMb2FkaW5nfT5cbiAqICAgICAgIHtzb3J0ZWREYXRhLm1hcCgoaXRlbSkgPT4gKFxuICogICAgICAgICA8TGlzdC5JdGVtXG4gKiAgICAgICAgICAga2V5PXtpdGVtLmlkfVxuICogICAgICAgICAgIHRpdGxlPXtpdGVtLnRpdGxlfVxuICogICAgICAgICAgIGFjdGlvbnM9e1xuICogICAgICAgICAgICAgPEFjdGlvblBhbmVsPlxuICogICAgICAgICAgICAgICA8QWN0aW9uLk9wZW5JbkJyb3dzZXIgdXJsPXtpdGVtLnVybH0gb25PcGVuPXsoKSA9PiB2aXNpdEl0ZW0oaXRlbSl9IC8+XG4gKiAgICAgICAgICAgICAgIDxBY3Rpb24uQ29weVRvQ2xpcGJvYXJkIHRpdGxlPVwiQ29weSBMaW5rXCIgY29udGVudD17aXRlbS51cmx9IG9uQ29weT17KCkgPT4gdmlzaXRJdGVtKGl0ZW0pfSAvPlxuICogICAgICAgICAgICAgICA8QWN0aW9uIHRpdGxlPVwiUmVzZXQgUmFua2luZ1wiIGljb249e0ljb24uQXJyb3dDb3VudGVyQ2xvY2t3aXNlfSBvbkFjdGlvbj17KCkgPT4gcmVzZXRSYW5raW5nKGl0ZW0pfSAvPlxuICogICAgICAgICAgICAgPC9BY3Rpb25QYW5lbD5cbiAqICAgICAgICAgICB9XG4gKiAgICAgICAgIC8+XG4gKiAgICAgICApKX1cbiAqICAgICA8L0xpc3Q+XG4gKiAgICk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VGcmVjZW5jeVNvcnRpbmc8VCBleHRlbmRzIHsgaWQ6IHN0cmluZyB9PihcbiAgZGF0YT86IFRbXSxcbiAgb3B0aW9ucz86IHsgbmFtZXNwYWNlPzogc3RyaW5nOyBrZXk/OiAoaXRlbTogVCkgPT4gc3RyaW5nOyBzb3J0VW52aXNpdGVkPzogKGE6IFQsIGI6IFQpID0+IG51bWJlciB9LFxuKToge1xuICBkYXRhOiBUW107XG4gIHZpc2l0SXRlbTogKGl0ZW06IFQpID0+IFByb21pc2U8dm9pZD47XG4gIHJlc2V0UmFua2luZzogKGl0ZW06IFQpID0+IFByb21pc2U8dm9pZD47XG59O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUZyZWNlbmN5U29ydGluZzxUPihcbiAgZGF0YTogVFtdIHwgdW5kZWZpbmVkLFxuICBvcHRpb25zOiB7IG5hbWVzcGFjZT86IHN0cmluZzsga2V5OiAoaXRlbTogVCkgPT4gc3RyaW5nOyBzb3J0VW52aXNpdGVkPzogKGE6IFQsIGI6IFQpID0+IG51bWJlciB9LFxuKToge1xuICBkYXRhOiBUW107XG4gIHZpc2l0SXRlbTogKGl0ZW06IFQpID0+IFByb21pc2U8dm9pZD47XG4gIHJlc2V0UmFua2luZzogKGl0ZW06IFQpID0+IFByb21pc2U8dm9pZD47XG59O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUZyZWNlbmN5U29ydGluZzxUPihcbiAgZGF0YT86IFRbXSxcbiAgb3B0aW9ucz86IHsgbmFtZXNwYWNlPzogc3RyaW5nOyBrZXk/OiAoaXRlbTogVCkgPT4gc3RyaW5nOyBzb3J0VW52aXNpdGVkPzogKGE6IFQsIGI6IFQpID0+IG51bWJlciB9LFxuKToge1xuICBkYXRhOiBUW107XG4gIHZpc2l0SXRlbTogKGl0ZW06IFQpID0+IFByb21pc2U8dm9pZD47XG4gIHJlc2V0UmFua2luZzogKGl0ZW06IFQpID0+IFByb21pc2U8dm9pZD47XG59IHtcbiAgY29uc3Qga2V5UmVmID0gdXNlTGF0ZXN0KG9wdGlvbnM/LmtleSB8fCBkZWZhdWx0S2V5KTtcbiAgY29uc3Qgc29ydFVudmlzaXRlZFJlZiA9IHVzZUxhdGVzdChvcHRpb25zPy5zb3J0VW52aXNpdGVkKTtcblxuICBjb25zdCBbc3RvcmVkRnJlY2VuY2llcywgc2V0U3RvcmVkRnJlY2VuY2llc10gPSB1c2VDYWNoZWRTdGF0ZTxSZWNvcmQ8c3RyaW5nLCBGcmVjZW5jeSB8IHVuZGVmaW5lZD4+KFxuICAgIGByYXljYXN0X2ZyZWNlbmN5XyR7b3B0aW9ucz8ubmFtZXNwYWNlfWAsXG4gICAge30sXG4gICk7XG5cbiAgY29uc3QgdmlzaXRJdGVtID0gdXNlQ2FsbGJhY2soXG4gICAgYXN5bmMgZnVuY3Rpb24gdXBkYXRlRnJlY2VuY3koaXRlbTogVCkge1xuICAgICAgY29uc3QgaXRlbUtleSA9IGtleVJlZi5jdXJyZW50KGl0ZW0pO1xuXG4gICAgICBzZXRTdG9yZWRGcmVjZW5jaWVzKChzdG9yZWRGcmVjZW5jaWVzKSA9PiB7XG4gICAgICAgIGNvbnN0IGZyZWNlbmN5ID0gc3RvcmVkRnJlY2VuY2llc1tpdGVtS2V5XTtcbiAgICAgICAgY29uc3QgbmV3RnJlY2VuY3kgPSBnZXROZXdGcmVjZW5jeShmcmVjZW5jeSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5zdG9yZWRGcmVjZW5jaWVzLFxuICAgICAgICAgIFtpdGVtS2V5XTogbmV3RnJlY2VuY3ksXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9LFxuICAgIFtrZXlSZWYsIHNldFN0b3JlZEZyZWNlbmNpZXNdLFxuICApO1xuXG4gIGNvbnN0IHJlc2V0UmFua2luZyA9IHVzZUNhbGxiYWNrKFxuICAgIGFzeW5jIGZ1bmN0aW9uIHJlbW92ZUZyZWNlbmN5KGl0ZW06IFQpIHtcbiAgICAgIGNvbnN0IGl0ZW1LZXkgPSBrZXlSZWYuY3VycmVudChpdGVtKTtcblxuICAgICAgc2V0U3RvcmVkRnJlY2VuY2llcygoc3RvcmVkRnJlY2VuY2llcykgPT4ge1xuICAgICAgICBjb25zdCBuZXdGcmVuY2VuY2llcyA9IHsgLi4uc3RvcmVkRnJlY2VuY2llcyB9O1xuICAgICAgICBkZWxldGUgbmV3RnJlbmNlbmNpZXNbaXRlbUtleV07XG5cbiAgICAgICAgcmV0dXJuIG5ld0ZyZW5jZW5jaWVzO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBba2V5UmVmLCBzZXRTdG9yZWRGcmVjZW5jaWVzXSxcbiAgKTtcblxuICBjb25zdCBzb3J0ZWREYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGEuc29ydCgoYSwgYikgPT4ge1xuICAgICAgY29uc3QgZnJlY2VuY3lBID0gc3RvcmVkRnJlY2VuY2llc1trZXlSZWYuY3VycmVudChhKV07XG4gICAgICBjb25zdCBmcmVjZW5jeUIgPSBzdG9yZWRGcmVjZW5jaWVzW2tleVJlZi5jdXJyZW50KGIpXTtcblxuICAgICAgLy8gSWYgYSBoYXMgYSBmcmVjZW5jeSwgYnV0IGIgZG9lc24ndCwgYSBzaG91bGQgY29tZSBmaXJzdFxuICAgICAgaWYgKGZyZWNlbmN5QSAmJiAhZnJlY2VuY3lCKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgYiBoYXMgYSBmcmVjZW5jeSwgYnV0IGEgZG9lc24ndCwgYiBzaG91bGQgY29tZSBmaXJzdFxuICAgICAgaWYgKCFmcmVjZW5jeUEgJiYgZnJlY2VuY3lCKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBib3RoIGZyZWNlbmNpZXMgYXJlIGRlZmluZWQscHV0IHRoZSBvbmUgd2l0aCB0aGUgaGlnaGVyIGZyZWNlbmN5IGZpcnN0XG4gICAgICBpZiAoZnJlY2VuY3lBICYmIGZyZWNlbmN5Qikge1xuICAgICAgICByZXR1cm4gZnJlY2VuY3lCLmZyZWNlbmN5IC0gZnJlY2VuY3lBLmZyZWNlbmN5O1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBib3RoIGZyZWNlbmNpZXMgYXJlIHVuZGVmaW5lZCwga2VlcCB0aGUgb3JpZ2luYWwgb3JkZXJcbiAgICAgIHJldHVybiBzb3J0VW52aXNpdGVkUmVmLmN1cnJlbnQgPyBzb3J0VW52aXNpdGVkUmVmLmN1cnJlbnQoYSwgYikgOiAwO1xuICAgIH0pO1xuICB9LCBbc3RvcmVkRnJlY2VuY2llcywgZGF0YSwga2V5UmVmLCBzb3J0VW52aXNpdGVkUmVmXSk7XG5cbiAgcmV0dXJuIHsgZGF0YTogc29ydGVkRGF0YSwgdmlzaXRJdGVtLCByZXNldFJhbmtpbmcgfTtcbn1cbiIsICJpbXBvcnQgeyBMb2NhbFN0b3JhZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBzaG93RmFpbHVyZVRvYXN0IH0gZnJvbSBcIi4vc2hvd0ZhaWx1cmVUb2FzdFwiO1xuaW1wb3J0IHsgcmVwbGFjZXIsIHJldml2ZXIgfSBmcm9tIFwiLi9oZWxwZXJzXCI7XG5pbXBvcnQgeyB1c2VQcm9taXNlIH0gZnJvbSBcIi4vdXNlUHJvbWlzZVwiO1xuXG4vKipcbiAqIEEgaG9vayB0byBtYW5hZ2UgYSB2YWx1ZSBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAcmVtYXJrIFRoZSB2YWx1ZSBpcyBzdG9yZWQgYXMgYSBKU09OIHN0cmluZyBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAcGFyYW0ga2V5IC0gVGhlIGtleSB0byB1c2UgZm9yIHRoZSB2YWx1ZSBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cbiAqIEBwYXJhbSBpbml0aWFsVmFsdWUgLSBUaGUgaW5pdGlhbCB2YWx1ZSB0byB1c2UgaWYgdGhlIGtleSBkb2Vzbid0IGV4aXN0IGluIHRoZSBsb2NhbCBzdG9yYWdlLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICogLSBgdmFsdWVgOiBUaGUgdmFsdWUgZnJvbSB0aGUgbG9jYWwgc3RvcmFnZSBvciB0aGUgaW5pdGlhbCB2YWx1ZSBpZiB0aGUga2V5IGRvZXNuJ3QgZXhpc3QuXG4gKiAtIGBzZXRWYWx1ZWA6IEEgZnVuY3Rpb24gdG8gdXBkYXRlIHRoZSB2YWx1ZSBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cbiAqIC0gYHJlbW92ZVZhbHVlYDogQSBmdW5jdGlvbiB0byByZW1vdmUgdGhlIHZhbHVlIGZyb20gdGhlIGxvY2FsIHN0b3JhZ2UuXG4gKiAtIGBpc0xvYWRpbmdgOiBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGUgdmFsdWUgaXMgbG9hZGluZy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBjb25zdCB7IHZhbHVlLCBzZXRWYWx1ZSB9ID0gdXNlTG9jYWxTdG9yYWdlPHN0cmluZz4oXCJteS1rZXlcIik7XG4gKiBjb25zdCB7IHZhbHVlLCBzZXRWYWx1ZSB9ID0gdXNlTG9jYWxTdG9yYWdlPHN0cmluZz4oXCJteS1rZXlcIiwgXCJkZWZhdWx0IHZhbHVlXCIpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VMb2NhbFN0b3JhZ2U8VD4oa2V5OiBzdHJpbmcsIGluaXRpYWxWYWx1ZT86IFQpIHtcbiAgY29uc3Qge1xuICAgIGRhdGE6IHZhbHVlLFxuICAgIGlzTG9hZGluZyxcbiAgICBtdXRhdGUsXG4gIH0gPSB1c2VQcm9taXNlKFxuICAgIGFzeW5jIChzdG9yYWdlS2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBhd2FpdCBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KHN0b3JhZ2VLZXkpO1xuXG4gICAgICByZXR1cm4gdHlwZW9mIGl0ZW0gIT09IFwidW5kZWZpbmVkXCIgPyAoSlNPTi5wYXJzZShpdGVtLCByZXZpdmVyKSBhcyBUKSA6IGluaXRpYWxWYWx1ZTtcbiAgICB9LFxuICAgIFtrZXldLFxuICApO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIHNldFZhbHVlKHZhbHVlOiBUKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IG11dGF0ZShMb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlLCByZXBsYWNlcikpLCB7XG4gICAgICAgIG9wdGltaXN0aWNVcGRhdGUodmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYXdhaXQgc2hvd0ZhaWx1cmVUb2FzdChlcnJvciwgeyB0aXRsZTogXCJGYWlsZWQgdG8gc2V0IHZhbHVlIGluIGxvY2FsIHN0b3JhZ2VcIiB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiByZW1vdmVWYWx1ZSgpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgbXV0YXRlKExvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSksIHtcbiAgICAgICAgb3B0aW1pc3RpY1VwZGF0ZSgpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF3YWl0IHNob3dGYWlsdXJlVG9hc3QoZXJyb3IsIHsgdGl0bGU6IFwiRmFpbGVkIHRvIHJlbW92ZSB2YWx1ZSBmcm9tIGxvY2FsIHN0b3JhZ2VcIiB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyB2YWx1ZSwgc2V0VmFsdWUsIHJlbW92ZVZhbHVlLCBpc0xvYWRpbmcgfTtcbn1cbiIsICJleHBvcnQgeyBnZXRBdmF0YXJJY29uIH0gZnJvbSBcIi4vYXZhdGFyXCI7XG5leHBvcnQgeyBnZXRGYXZpY29uIH0gZnJvbSBcIi4vZmF2aWNvblwiO1xuZXhwb3J0IHsgZ2V0UHJvZ3Jlc3NJY29uIH0gZnJvbSBcIi4vcHJvZ3Jlc3NcIjtcbiIsICJpbXBvcnQgdHlwZSB7IEltYWdlIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgc2xpZ2h0bHlMaWdodGVyQ29sb3IsIHNsaWdodGx5RGFya2VyQ29sb3IgfSBmcm9tIFwiLi9jb2xvclwiO1xuXG5mdW5jdGlvbiBnZXRXaG9sZUNoYXJBbmRJKHN0cjogc3RyaW5nLCBpOiBudW1iZXIpOiBbc3RyaW5nLCBudW1iZXJdIHtcbiAgY29uc3QgY29kZSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuXG4gIGlmIChOdW1iZXIuaXNOYU4oY29kZSkpIHtcbiAgICByZXR1cm4gW1wiXCIsIGldO1xuICB9XG4gIGlmIChjb2RlIDwgMHhkODAwIHx8IGNvZGUgPiAweGRmZmYpIHtcbiAgICByZXR1cm4gW3N0ci5jaGFyQXQoaSksIGldOyAvLyBOb3JtYWwgY2hhcmFjdGVyLCBrZWVwaW5nICdpJyB0aGUgc2FtZVxuICB9XG5cbiAgLy8gSGlnaCBzdXJyb2dhdGUgKGNvdWxkIGNoYW5nZSBsYXN0IGhleCB0byAweERCN0YgdG8gdHJlYXQgaGlnaCBwcml2YXRlXG4gIC8vIHN1cnJvZ2F0ZXMgYXMgc2luZ2xlIGNoYXJhY3RlcnMpXG4gIGlmICgweGQ4MDAgPD0gY29kZSAmJiBjb2RlIDw9IDB4ZGJmZikge1xuICAgIGlmIChzdHIubGVuZ3RoIDw9IGkgKyAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJIaWdoIHN1cnJvZ2F0ZSB3aXRob3V0IGZvbGxvd2luZyBsb3cgc3Vycm9nYXRlXCIpO1xuICAgIH1cbiAgICBjb25zdCBuZXh0ID0gc3RyLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgIGlmICgweGRjMDAgPiBuZXh0IHx8IG5leHQgPiAweGRmZmYpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkhpZ2ggc3Vycm9nYXRlIHdpdGhvdXQgZm9sbG93aW5nIGxvdyBzdXJyb2dhdGVcIik7XG4gICAgfVxuICAgIHJldHVybiBbc3RyLmNoYXJBdChpKSArIHN0ci5jaGFyQXQoaSArIDEpLCBpICsgMV07XG4gIH1cblxuICAvLyBMb3cgc3Vycm9nYXRlICgweERDMDAgPD0gY29kZSAmJiBjb2RlIDw9IDB4REZGRilcbiAgaWYgKGkgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb3cgc3Vycm9nYXRlIHdpdGhvdXQgcHJlY2VkaW5nIGhpZ2ggc3Vycm9nYXRlXCIpO1xuICB9XG5cbiAgY29uc3QgcHJldiA9IHN0ci5jaGFyQ29kZUF0KGkgLSAxKTtcblxuICAvLyAoY291bGQgY2hhbmdlIGxhc3QgaGV4IHRvIDB4REI3RiB0byB0cmVhdCBoaWdoIHByaXZhdGUgc3Vycm9nYXRlc1xuICAvLyBhcyBzaW5nbGUgY2hhcmFjdGVycylcbiAgaWYgKDB4ZDgwMCA+IHByZXYgfHwgcHJldiA+IDB4ZGJmZikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkxvdyBzdXJyb2dhdGUgd2l0aG91dCBwcmVjZWRpbmcgaGlnaCBzdXJyb2dhdGVcIik7XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIG5leHQgY2hhcmFjdGVyIGluc3RlYWQgKGFuZCBpbmNyZW1lbnQpXG4gIHJldHVybiBbc3RyLmNoYXJBdChpICsgMSksIGkgKyAxXTtcbn1cblxuY29uc3QgYXZhdGFyQ29sb3JTZXQgPSBbXG4gIFwiI0RDODI5QVwiLCAvLyBQaW5rXG4gIFwiI0Q2NDg1NFwiLCAvLyBSZWRcbiAgXCIjRDQ3NjAwXCIsIC8vIFllbGxvd09yYW5nZVxuICBcIiNEMzZDRERcIiwgLy8gTWFnZW50YVxuICBcIiM1MkE5RTRcIiwgLy8gQXF1YVxuICBcIiM3ODcxRThcIiwgLy8gSW5kaWdvXG4gIFwiIzcwOTIwRlwiLCAvLyBZZWxsb3dHcmVlblxuICBcIiM0M0I5M0FcIiwgLy8gR3JlZW5cbiAgXCIjRUI2QjNFXCIsIC8vIE9yYW5nZVxuICBcIiMyNkI3OTVcIiwgLy8gQmx1ZUdyZWVuXG4gIFwiI0Q4NUE5QlwiLCAvLyBIb3RQaW5rXG4gIFwiI0EwNjdEQ1wiLCAvLyBQdXJwbGVcbiAgXCIjQkQ5NTAwXCIsIC8vIFllbGxvd1xuICBcIiM1Mzg1RDlcIiwgLy8gQmx1ZVxuXTtcblxuLyoqXG4gKiBJY29uIHRvIHJlcHJlc2VudCBhbiBhdmF0YXIgd2hlbiB5b3UgZG9uJ3QgaGF2ZSBvbmUuIFRoZSBnZW5lcmF0ZWQgYXZhdGFyXG4gKiB3aWxsIGJlIGdlbmVyYXRlZCBmcm9tIHRoZSBpbml0aWFscyBvZiB0aGUgbmFtZSBhbmQgaGF2ZSBhIGNvbG9yZnVsIGJ1dCBjb25zaXN0ZW50IGJhY2tncm91bmQuXG4gKlxuICogQHJldHVybnMgYW4gSW1hZ2UgdGhhdCBjYW4gYmUgdXNlZCB3aGVyZSBSYXljYXN0IGV4cGVjdHMgdGhlbS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiA8TGlzdC5JdGVtIGljb249e2dldEF2YXRhckljb24oJ01hdGhpZXUgRHV0b3VyJyl9IHRpdGxlPVwiUHJvamVjdFwiIC8+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEF2YXRhckljb24oXG4gIG5hbWU6IHN0cmluZyxcbiAgb3B0aW9ucz86IHtcbiAgICAvKipcbiAgICAgKiBDdXN0b20gYmFja2dyb3VuZCBjb2xvclxuICAgICAqL1xuICAgIGJhY2tncm91bmQ/OiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogV2hldGhlciB0byB1c2UgYSBncmFkaWVudCBmb3IgdGhlIGJhY2tncm91bmQgb3Igbm90LlxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBncmFkaWVudD86IGJvb2xlYW47XG4gIH0sXG4pOiBJbWFnZS5Bc3NldCB7XG4gIGNvbnN0IHdvcmRzID0gbmFtZS50cmltKCkuc3BsaXQoXCIgXCIpO1xuICBsZXQgaW5pdGlhbHM6IHN0cmluZztcbiAgaWYgKHdvcmRzLmxlbmd0aCA9PSAxICYmIGdldFdob2xlQ2hhckFuZEkod29yZHNbMF0sIDApWzBdKSB7XG4gICAgaW5pdGlhbHMgPSBnZXRXaG9sZUNoYXJBbmRJKHdvcmRzWzBdLCAwKVswXTtcbiAgfSBlbHNlIGlmICh3b3Jkcy5sZW5ndGggPiAxKSB7XG4gICAgY29uc3QgZmlyc3RXb3JkRmlyc3RMZXR0ZXIgPSBnZXRXaG9sZUNoYXJBbmRJKHdvcmRzWzBdLCAwKVswXSB8fCBcIlwiO1xuICAgIGNvbnN0IGxhc3RXb3JkRmlyc3RMZXR0ZXIgPSBnZXRXaG9sZUNoYXJBbmRJKHdvcmRzW3dvcmRzLmxlbmd0aCAtIDFdLCAwKVswXSA/PyBcIlwiO1xuICAgIGluaXRpYWxzID0gZmlyc3RXb3JkRmlyc3RMZXR0ZXIgKyBsYXN0V29yZEZpcnN0TGV0dGVyO1xuICB9IGVsc2Uge1xuICAgIGluaXRpYWxzID0gXCJcIjtcbiAgfVxuXG4gIGxldCBiYWNrZ3JvdW5kQ29sb3I6IHN0cmluZztcblxuICBpZiAob3B0aW9ucz8uYmFja2dyb3VuZCkge1xuICAgIGJhY2tncm91bmRDb2xvciA9IG9wdGlvbnM/LmJhY2tncm91bmQ7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGluaXRpYWxzQ2hhckluZGV4ID0gMDtcbiAgICBsZXQgW2NoYXIsIGldID0gZ2V0V2hvbGVDaGFyQW5kSShpbml0aWFscywgMCk7XG4gICAgd2hpbGUgKGNoYXIpIHtcbiAgICAgIGluaXRpYWxzQ2hhckluZGV4ICs9IGNoYXIuY2hhckNvZGVBdCgwKTtcbiAgICAgIFtjaGFyLCBpXSA9IGdldFdob2xlQ2hhckFuZEkoaW5pdGlhbHMsIGkgKyAxKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb2xvckluZGV4ID0gaW5pdGlhbHNDaGFySW5kZXggJSBhdmF0YXJDb2xvclNldC5sZW5ndGg7XG4gICAgYmFja2dyb3VuZENvbG9yID0gYXZhdGFyQ29sb3JTZXRbY29sb3JJbmRleF07XG4gIH1cblxuICBjb25zdCBwYWRkaW5nID0gMDtcbiAgY29uc3QgcmFkaXVzID0gNTAgLSBwYWRkaW5nO1xuXG4gIGNvbnN0IHN2ZyA9IGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjEwMHB4XCIgaGVpZ2h0PVwiMTAwcHhcIj5cbiAgJHtcbiAgICBvcHRpb25zPy5ncmFkaWVudCAhPT0gZmFsc2VcbiAgICAgID8gYDxkZWZzPlxuICAgICAgPGxpbmVhckdyYWRpZW50IGlkPVwiR3JhZGllbnRcIiB4MT1cIjAuMjVcIiB4Mj1cIjAuNzVcIiB5MT1cIjBcIiB5Mj1cIjFcIj5cbiAgICAgICAgPHN0b3Agb2Zmc2V0PVwiMCVcIiBzdG9wLWNvbG9yPVwiJHtzbGlnaHRseUxpZ2h0ZXJDb2xvcihiYWNrZ3JvdW5kQ29sb3IpfVwiLz5cbiAgICAgICAgPHN0b3Agb2Zmc2V0PVwiNTAlXCIgc3RvcC1jb2xvcj1cIiR7YmFja2dyb3VuZENvbG9yfVwiLz5cbiAgICAgICAgPHN0b3Agb2Zmc2V0PVwiMTAwJVwiIHN0b3AtY29sb3I9XCIke3NsaWdodGx5RGFya2VyQ29sb3IoYmFja2dyb3VuZENvbG9yKX1cIi8+XG4gICAgICA8L2xpbmVhckdyYWRpZW50PlxuICA8L2RlZnM+YFxuICAgICAgOiBcIlwiXG4gIH1cbiAgICAgIDxjaXJjbGUgY3g9XCI1MFwiIGN5PVwiNTBcIiByPVwiJHtyYWRpdXN9XCIgZmlsbD1cIiR7XG4gICAgICAgIG9wdGlvbnM/LmdyYWRpZW50ICE9PSBmYWxzZSA/IFwidXJsKCNHcmFkaWVudClcIiA6IGJhY2tncm91bmRDb2xvclxuICAgICAgfVwiIC8+XG4gICAgICAke1xuICAgICAgICBpbml0aWFsc1xuICAgICAgICAgID8gYDx0ZXh0IHg9XCI1MFwiIHk9XCI4MFwiIGZvbnQtc2l6ZT1cIiR7XG4gICAgICAgICAgICAgIHJhZGl1cyAtIDFcbiAgICAgICAgICAgIH1cIiBmb250LWZhbWlseT1cIkludGVyLCBzYW5zLXNlcmlmXCIgdGV4dC1hbmNob3I9XCJtaWRkbGVcIiBmaWxsPVwid2hpdGVcIj4ke2luaXRpYWxzLnRvVXBwZXJDYXNlKCl9PC90ZXh0PmBcbiAgICAgICAgICA6IFwiXCJcbiAgICAgIH1cbiAgICA8L3N2Zz5cbiAgYC5yZXBsYWNlQWxsKFwiXFxuXCIsIFwiXCIpO1xuICByZXR1cm4gYGRhdGE6aW1hZ2Uvc3ZnK3htbCwke2VuY29kZVVSSUNvbXBvbmVudChzdmcpfWA7XG59XG4iLCAiZnVuY3Rpb24gaGV4VG9SR0IoaGV4OiBzdHJpbmcpIHtcbiAgbGV0IHIgPSAwO1xuICBsZXQgZyA9IDA7XG4gIGxldCBiID0gMDtcblxuICAvLyAzIGRpZ2l0c1xuICBpZiAoaGV4Lmxlbmd0aCA9PT0gNCkge1xuICAgIHIgPSBwYXJzZUludChgJHtoZXhbMV19JHtoZXhbMV19YCwgMTYpO1xuICAgIGcgPSBwYXJzZUludChgJHtoZXhbMl19JHtoZXhbMl19YCwgMTYpO1xuICAgIGIgPSBwYXJzZUludChgJHtoZXhbM119JHtoZXhbM119YCwgMTYpO1xuXG4gICAgLy8gNiBkaWdpdHNcbiAgfSBlbHNlIGlmIChoZXgubGVuZ3RoID09PSA3KSB7XG4gICAgciA9IHBhcnNlSW50KGAke2hleFsxXX0ke2hleFsyXX1gLCAxNik7XG4gICAgZyA9IHBhcnNlSW50KGAke2hleFszXX0ke2hleFs0XX1gLCAxNik7XG4gICAgYiA9IHBhcnNlSW50KGAke2hleFs1XX0ke2hleFs2XX1gLCAxNik7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBNYWxmb3JtZWQgaGV4IGNvbG9yOiAke2hleH1gKTtcbiAgfVxuXG4gIHJldHVybiB7IHIsIGcsIGIgfTtcbn1cblxuZnVuY3Rpb24gcmdiVG9IZXgoeyByLCBnLCBiIH06IHsgcjogbnVtYmVyOyBnOiBudW1iZXI7IGI6IG51bWJlciB9KSB7XG4gIGxldCByU3RyaW5nID0gci50b1N0cmluZygxNik7XG4gIGxldCBnU3RyaW5nID0gZy50b1N0cmluZygxNik7XG4gIGxldCBiU3RyaW5nID0gYi50b1N0cmluZygxNik7XG5cbiAgaWYgKHJTdHJpbmcubGVuZ3RoID09PSAxKSB7XG4gICAgclN0cmluZyA9IGAwJHtyU3RyaW5nfWA7XG4gIH1cbiAgaWYgKGdTdHJpbmcubGVuZ3RoID09PSAxKSB7XG4gICAgZ1N0cmluZyA9IGAwJHtnU3RyaW5nfWA7XG4gIH1cbiAgaWYgKGJTdHJpbmcubGVuZ3RoID09PSAxKSB7XG4gICAgYlN0cmluZyA9IGAwJHtiU3RyaW5nfWA7XG4gIH1cblxuICByZXR1cm4gYCMke3JTdHJpbmd9JHtnU3RyaW5nfSR7YlN0cmluZ31gO1xufVxuXG5mdW5jdGlvbiByZ2JUb0hTTCh7IHIsIGcsIGIgfTogeyByOiBudW1iZXI7IGc6IG51bWJlcjsgYjogbnVtYmVyIH0pIHtcbiAgLy8gTWFrZSByLCBnLCBhbmQgYiBmcmFjdGlvbnMgb2YgMVxuICByIC89IDI1NTtcbiAgZyAvPSAyNTU7XG4gIGIgLz0gMjU1O1xuXG4gIC8vIEZpbmQgZ3JlYXRlc3QgYW5kIHNtYWxsZXN0IGNoYW5uZWwgdmFsdWVzXG4gIGNvbnN0IGNtaW4gPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgY29uc3QgY21heCA9IE1hdGgubWF4KHIsIGcsIGIpO1xuICBjb25zdCBkZWx0YSA9IGNtYXggLSBjbWluO1xuICBsZXQgaCA9IDA7XG4gIGxldCBzID0gMDtcbiAgbGV0IGwgPSAwO1xuXG4gIC8vIENhbGN1bGF0ZSBodWVcbiAgLy8gTm8gZGlmZmVyZW5jZVxuICBpZiAoZGVsdGEgPT09IDApIHtcbiAgICBoID0gMDtcbiAgfVxuICAvLyBSZWQgaXMgbWF4XG4gIGVsc2UgaWYgKGNtYXggPT09IHIpIHtcbiAgICBoID0gKChnIC0gYikgLyBkZWx0YSkgJSA2O1xuICB9XG4gIC8vIEdyZWVuIGlzIG1heFxuICBlbHNlIGlmIChjbWF4ID09PSBnKSB7XG4gICAgaCA9IChiIC0gcikgLyBkZWx0YSArIDI7XG4gIH1cbiAgLy8gQmx1ZSBpcyBtYXhcbiAgZWxzZSB7XG4gICAgaCA9IChyIC0gZykgLyBkZWx0YSArIDQ7XG4gIH1cblxuICBoID0gTWF0aC5yb3VuZChoICogNjApO1xuXG4gIC8vIE1ha2UgbmVnYXRpdmUgaHVlcyBwb3NpdGl2ZSBiZWhpbmQgMzYwwrBcbiAgaWYgKGggPCAwKSB7XG4gICAgaCArPSAzNjA7XG4gIH1cblxuICAvLyBDYWxjdWxhdGUgbGlnaHRuZXNzXG4gIGwgPSAoY21heCArIGNtaW4pIC8gMjtcblxuICAvLyBDYWxjdWxhdGUgc2F0dXJhdGlvblxuICBzID0gZGVsdGEgPT09IDAgPyAwIDogZGVsdGEgLyAoMSAtIE1hdGguYWJzKDIgKiBsIC0gMSkpO1xuXG4gIC8vIE11bHRpcGx5IGwgYW5kIHMgYnkgMTAwXG4gIHMgPSArKHMgKiAxMDApLnRvRml4ZWQoMSk7XG4gIGwgPSArKGwgKiAxMDApLnRvRml4ZWQoMSk7XG5cbiAgcmV0dXJuIHsgaCwgcywgbCB9O1xufVxuXG5mdW5jdGlvbiBoc2xUb1JHQih7IGgsIHMsIGwgfTogeyBoOiBudW1iZXI7IHM6IG51bWJlcjsgbDogbnVtYmVyIH0pIHtcbiAgLy8gTXVzdCBiZSBmcmFjdGlvbnMgb2YgMVxuICBzIC89IDEwMDtcbiAgbCAvPSAxMDA7XG5cbiAgY29uc3QgYyA9ICgxIC0gTWF0aC5hYnMoMiAqIGwgLSAxKSkgKiBzO1xuICBjb25zdCB4ID0gYyAqICgxIC0gTWF0aC5hYnMoKChoIC8gNjApICUgMikgLSAxKSk7XG4gIGNvbnN0IG0gPSBsIC0gYyAvIDI7XG4gIGxldCByID0gMDtcbiAgbGV0IGcgPSAwO1xuICBsZXQgYiA9IDA7XG5cbiAgaWYgKGggPj0gMCAmJiBoIDwgNjApIHtcbiAgICByID0gYztcbiAgICBnID0geDtcbiAgICBiID0gMDtcbiAgfSBlbHNlIGlmIChoID49IDYwICYmIGggPCAxMjApIHtcbiAgICByID0geDtcbiAgICBnID0gYztcbiAgICBiID0gMDtcbiAgfSBlbHNlIGlmIChoID49IDEyMCAmJiBoIDwgMTgwKSB7XG4gICAgciA9IDA7XG4gICAgZyA9IGM7XG4gICAgYiA9IHg7XG4gIH0gZWxzZSBpZiAoaCA+PSAxODAgJiYgaCA8IDI0MCkge1xuICAgIHIgPSAwO1xuICAgIGcgPSB4O1xuICAgIGIgPSBjO1xuICB9IGVsc2UgaWYgKGggPj0gMjQwICYmIGggPCAzMDApIHtcbiAgICByID0geDtcbiAgICBnID0gMDtcbiAgICBiID0gYztcbiAgfSBlbHNlIGlmIChoID49IDMwMCAmJiBoIDwgMzYwKSB7XG4gICAgciA9IGM7XG4gICAgZyA9IDA7XG4gICAgYiA9IHg7XG4gIH1cbiAgciA9IE1hdGgucm91bmQoKHIgKyBtKSAqIDI1NSk7XG4gIGcgPSBNYXRoLnJvdW5kKChnICsgbSkgKiAyNTUpO1xuICBiID0gTWF0aC5yb3VuZCgoYiArIG0pICogMjU1KTtcblxuICByZXR1cm4geyByLCBnLCBiIH07XG59XG5cbmZ1bmN0aW9uIGhleFRvSFNMKGhleDogc3RyaW5nKSB7XG4gIHJldHVybiByZ2JUb0hTTChoZXhUb1JHQihoZXgpKTtcbn1cblxuZnVuY3Rpb24gaHNsVG9IZXgoaHNsOiB7IGg6IG51bWJlcjsgczogbnVtYmVyOyBsOiBudW1iZXIgfSkge1xuICByZXR1cm4gcmdiVG9IZXgoaHNsVG9SR0IoaHNsKSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wKHZhbHVlOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xuICByZXR1cm4gbWluIDwgbWF4ID8gKHZhbHVlIDwgbWluID8gbWluIDogdmFsdWUgPiBtYXggPyBtYXggOiB2YWx1ZSkgOiB2YWx1ZSA8IG1heCA/IG1heCA6IHZhbHVlID4gbWluID8gbWluIDogdmFsdWU7XG59XG5cbmNvbnN0IG9mZnNldCA9IDEyO1xuXG5leHBvcnQgZnVuY3Rpb24gc2xpZ2h0bHlEYXJrZXJDb2xvcihoZXg6IHN0cmluZykge1xuICBjb25zdCBoc2wgPSBoZXhUb0hTTChoZXgpO1xuXG4gIHJldHVybiBoc2xUb0hleCh7XG4gICAgaDogaHNsLmgsXG4gICAgczogaHNsLnMsXG4gICAgbDogY2xhbXAoaHNsLmwgLSBvZmZzZXQsIDAsIDEwMCksXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2xpZ2h0bHlMaWdodGVyQ29sb3IoaGV4OiBzdHJpbmcpIHtcbiAgY29uc3QgaHNsID0gaGV4VG9IU0woaGV4KTtcblxuICByZXR1cm4gaHNsVG9IZXgoe1xuICAgIGg6IGhzbC5oLFxuICAgIHM6IGhzbC5zLFxuICAgIGw6IGNsYW1wKGhzbC5sICsgb2Zmc2V0LCAwLCAxMDApLFxuICB9KTtcbn1cbiIsICJpbXBvcnQgeyBJY29uLCBJbWFnZSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IFVSTCB9IGZyb20gXCJub2RlOnVybFwiO1xuXG4vKipcbiAqIEljb24gc2hvd2luZyB0aGUgZmF2aWNvbiBvZiBhIHdlYnNpdGUuXG4gKlxuICogQSBmYXZpY29uIChmYXZvcml0ZSBpY29uKSBpcyBhIHRpbnkgaWNvbiBpbmNsdWRlZCBhbG9uZyB3aXRoIGEgd2Vic2l0ZSwgd2hpY2ggaXMgZGlzcGxheWVkIGluIHBsYWNlcyBsaWtlIHRoZSBicm93c2VyJ3MgYWRkcmVzcyBiYXIsIHBhZ2UgdGFicywgYW5kIGJvb2ttYXJrcyBtZW51LlxuICpcbiAqIEBwYXJhbSB1cmwgVGhlIFVSTCBvZiB0aGUgd2Vic2l0ZSB0byByZXByZXNlbnQuXG4gKlxuICogQHJldHVybnMgYW4gSW1hZ2UgdGhhdCBjYW4gYmUgdXNlZCB3aGVyZSBSYXljYXN0IGV4cGVjdHMgdGhlbS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiA8TGlzdC5JdGVtIGljb249e2dldEZhdmljb24oXCJodHRwczovL3JheWNhc3QuY29tXCIpfSB0aXRsZT1cIlJheWNhc3QgV2Vic2l0ZVwiIC8+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZhdmljb24oXG4gIHVybDogc3RyaW5nIHwgVVJMLFxuICBvcHRpb25zPzoge1xuICAgIC8qKlxuICAgICAqIFNpemUgb2YgdGhlIEZhdmljb25cbiAgICAgKiBAZGVmYXVsdCA2NFxuICAgICAqL1xuICAgIHNpemU/OiBudW1iZXI7XG4gICAgLyoqXG4gICAgICogRmFsbGJhY2sgaWNvbiBpbiBjYXNlIHRoZSBGYXZpY29uIGlzIG5vdCBmb3VuZC5cbiAgICAgKiBAZGVmYXVsdCBJY29uLkxpbmtcbiAgICAgKi9cbiAgICBmYWxsYmFjaz86IEltYWdlLkZhbGxiYWNrO1xuICAgIC8qKlxuICAgICAqIEEge0BsaW5rIEltYWdlLk1hc2t9IHRvIGFwcGx5IHRvIHRoZSBGYXZpY29uLlxuICAgICAqL1xuICAgIG1hc2s/OiBJbWFnZS5NYXNrO1xuICB9LFxuKTogSW1hZ2UuSW1hZ2VMaWtlIHtcbiAgdHJ5IHtcbiAgICAvLyBhIGZ1bmMgYWRkaW5nIGh0dHBzOi8vIHRvIHRoZSBVUkxcbiAgICAvLyBmb3IgY2FzZXMgd2hlcmUgdGhlIFVSTCBpcyBub3QgYSBmdWxsIFVSTFxuICAgIC8vIGUuZy4gXCJyYXljYXN0LmNvbVwiXG4gICAgY29uc3Qgc2FuaXRpemUgPSAodXJsOiBzdHJpbmcpID0+IHtcbiAgICAgIGlmICghdXJsLnN0YXJ0c1dpdGgoXCJodHRwXCIpKSB7XG4gICAgICAgIHJldHVybiBgaHR0cHM6Ly8ke3VybH1gO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHVybDtcbiAgICB9O1xuXG4gICAgY29uc3QgdXJsT2JqID0gdHlwZW9mIHVybCA9PT0gXCJzdHJpbmdcIiA/IG5ldyBVUkwoc2FuaXRpemUodXJsKSkgOiB1cmw7XG4gICAgY29uc3QgaG9zdG5hbWUgPSB1cmxPYmouaG9zdG5hbWU7XG5cbiAgICBjb25zdCBmYXZpY29uUHJvdmlkZXI6IFwibm9uZVwiIHwgXCJyYXljYXN0XCIgfCBcImFwcGxlXCIgfCBcImdvb2dsZVwiIHwgXCJkdWNrRHVja0dvXCIgfCBcImR1Y2tkdWNrZ29cIiB8IFwibGVnYWN5XCIgPVxuICAgICAgKHByb2Nlc3MuZW52LkZBVklDT05fUFJPVklERVIgYXMgYW55KSA/PyBcInJheWNhc3RcIjtcblxuICAgIHN3aXRjaCAoZmF2aWNvblByb3ZpZGVyKSB7XG4gICAgICBjYXNlIFwibm9uZVwiOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNvdXJjZTogb3B0aW9ucz8uZmFsbGJhY2sgPz8gSWNvbi5MaW5rLFxuICAgICAgICAgIG1hc2s6IG9wdGlvbnM/Lm1hc2ssXG4gICAgICAgIH07XG4gICAgICBjYXNlIFwiYXBwbGVcIjpcbiAgICAgICAgLy8gd2UgY2FuJ3Qgc3VwcG9ydCBhcHBsZSBmYXZpY29ucyBhcyBpdCdzIGEgbmF0aXZlIEFQSVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNvdXJjZTogb3B0aW9ucz8uZmFsbGJhY2sgPz8gSWNvbi5MaW5rLFxuICAgICAgICAgIG1hc2s6IG9wdGlvbnM/Lm1hc2ssXG4gICAgICAgIH07XG4gICAgICBjYXNlIFwiZHVja2R1Y2tnb1wiOlxuICAgICAgY2FzZSBcImR1Y2tEdWNrR29cIjpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzb3VyY2U6IGBodHRwczovL2ljb25zLmR1Y2tkdWNrZ28uY29tL2lwMy8ke2hvc3RuYW1lfS5pY29gLFxuICAgICAgICAgIGZhbGxiYWNrOiBvcHRpb25zPy5mYWxsYmFjayA/PyBJY29uLkxpbmssXG4gICAgICAgICAgbWFzazogb3B0aW9ucz8ubWFzayxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgXCJnb29nbGVcIjpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzb3VyY2U6IGBodHRwczovL3d3dy5nb29nbGUuY29tL3MyL2Zhdmljb25zP3N6PSR7b3B0aW9ucz8uc2l6ZSA/PyA2NH0mZG9tYWluPSR7aG9zdG5hbWV9YCxcbiAgICAgICAgICBmYWxsYmFjazogb3B0aW9ucz8uZmFsbGJhY2sgPz8gSWNvbi5MaW5rLFxuICAgICAgICAgIG1hc2s6IG9wdGlvbnM/Lm1hc2ssXG4gICAgICAgIH07XG4gICAgICBjYXNlIFwibGVnYWN5XCI6XG4gICAgICBjYXNlIFwicmF5Y2FzdFwiOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzb3VyY2U6IGBodHRwczovL2FwaS5yYXkuc28vZmF2aWNvbj91cmw9JHtob3N0bmFtZX0mc2l6ZT0ke29wdGlvbnM/LnNpemUgPz8gNjR9YCxcbiAgICAgICAgICBmYWxsYmFjazogb3B0aW9ucz8uZmFsbGJhY2sgPz8gSWNvbi5MaW5rLFxuICAgICAgICAgIG1hc2s6IG9wdGlvbnM/Lm1hc2ssXG4gICAgICAgIH07XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICByZXR1cm4gSWNvbi5MaW5rO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgZW52aXJvbm1lbnQsIENvbG9yIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHR5cGUgeyBJbWFnZSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcblxuZnVuY3Rpb24gcG9sYXJUb0NhcnRlc2lhbihjZW50ZXJYOiBudW1iZXIsIGNlbnRlclk6IG51bWJlciwgcmFkaXVzOiBudW1iZXIsIGFuZ2xlSW5EZWdyZWVzOiBudW1iZXIpIHtcbiAgY29uc3QgYW5nbGVJblJhZGlhbnMgPSAoKGFuZ2xlSW5EZWdyZWVzIC0gOTApICogTWF0aC5QSSkgLyAxODAuMDtcblxuICByZXR1cm4ge1xuICAgIHg6IGNlbnRlclggKyByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyksXG4gICAgeTogY2VudGVyWSArIHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVzY3JpYmVBcmMoeDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyLCBzdGFydEFuZ2xlOiBudW1iZXIsIGVuZEFuZ2xlOiBudW1iZXIpIHtcbiAgY29uc3Qgc3RhcnQgPSBwb2xhclRvQ2FydGVzaWFuKHgsIHksIHJhZGl1cywgZW5kQW5nbGUpO1xuICBjb25zdCBlbmQgPSBwb2xhclRvQ2FydGVzaWFuKHgsIHksIHJhZGl1cywgc3RhcnRBbmdsZSk7XG5cbiAgY29uc3QgbGFyZ2VBcmNGbGFnID0gZW5kQW5nbGUgLSBzdGFydEFuZ2xlIDw9IDE4MCA/IFwiMFwiIDogXCIxXCI7XG5cbiAgY29uc3QgZCA9IFtcIk1cIiwgc3RhcnQueCwgc3RhcnQueSwgXCJBXCIsIHJhZGl1cywgcmFkaXVzLCAwLCBsYXJnZUFyY0ZsYWcsIDAsIGVuZC54LCBlbmQueV0uam9pbihcIiBcIik7XG5cbiAgcmV0dXJuIGQ7XG59XG5cbi8qKlxuICogSWNvbiB0byByZXByZXNlbnQgdGhlIHByb2dyZXNzIG9mIF9zb21ldGhpbmdfLlxuICpcbiAqIEBwYXJhbSBwcm9ncmVzcyBOdW1iZXIgYmV0d2VlbiAwIGFuZCAxLlxuICogQHBhcmFtIGNvbG9yIEhleCBjb2xvciAoZGVmYXVsdCBgXCIjRkY2MzYzXCJgKSBvciBDb2xvci5cbiAqXG4gKiBAcmV0dXJucyBhbiBJbWFnZSB0aGF0IGNhbiBiZSB1c2VkIHdoZXJlIFJheWNhc3QgZXhwZWN0cyB0aGVtLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBcbiAqIDxMaXN0Lkl0ZW0gaWNvbj17Z2V0UHJvZ3Jlc3NJY29uKDAuMSl9IHRpdGxlPVwiUHJvamVjdFwiIC8+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByb2dyZXNzSWNvbihcbiAgcHJvZ3Jlc3M6IG51bWJlcixcbiAgY29sb3I6IENvbG9yIHwgc3RyaW5nID0gQ29sb3IuUmVkLFxuICBvcHRpb25zPzogeyBiYWNrZ3JvdW5kPzogQ29sb3IgfCBzdHJpbmc7IGJhY2tncm91bmRPcGFjaXR5PzogbnVtYmVyIH0sXG4pOiBJbWFnZS5Bc3NldCB7XG4gIGNvbnN0IGJhY2tncm91bmQgPSBvcHRpb25zPy5iYWNrZ3JvdW5kIHx8IChlbnZpcm9ubWVudC5hcHBlYXJhbmNlID09PSBcImxpZ2h0XCIgPyBcImJsYWNrXCIgOiBcIndoaXRlXCIpO1xuICBjb25zdCBiYWNrZ3JvdW5kT3BhY2l0eSA9IG9wdGlvbnM/LmJhY2tncm91bmRPcGFjaXR5IHx8IDAuMTtcblxuICBjb25zdCBzdHJva2UgPSAxMDtcbiAgY29uc3QgcGFkZGluZyA9IDU7XG4gIGNvbnN0IHJhZGl1cyA9IDUwIC0gcGFkZGluZyAtIHN0cm9rZSAvIDI7XG5cbiAgY29uc3Qgc3ZnID0gYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMTAwcHhcIiBoZWlnaHQ9XCIxMDBweFwiPlxuICAgICAgPGNpcmNsZSBjeD1cIjUwXCIgY3k9XCI1MFwiIHI9XCIke3JhZGl1c31cIiBzdHJva2Utd2lkdGg9XCIke3N0cm9rZX1cIiBzdHJva2U9XCIke1xuICAgICAgICBwcm9ncmVzcyA8IDEgPyBiYWNrZ3JvdW5kIDogY29sb3JcbiAgICAgIH1cIiBvcGFjaXR5PVwiJHtwcm9ncmVzcyA8IDEgPyBiYWNrZ3JvdW5kT3BhY2l0eSA6IFwiMVwifVwiIGZpbGw9XCJub25lXCIgLz5cbiAgICAgICR7XG4gICAgICAgIHByb2dyZXNzID4gMCAmJiBwcm9ncmVzcyA8IDFcbiAgICAgICAgICA/IGA8cGF0aCBkPVwiJHtkZXNjcmliZUFyYyhcbiAgICAgICAgICAgICAgNTAsXG4gICAgICAgICAgICAgIDUwLFxuICAgICAgICAgICAgICByYWRpdXMsXG4gICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgIHByb2dyZXNzICogMzYwLFxuICAgICAgICAgICAgKX1cIiBzdHJva2U9XCIke2NvbG9yfVwiIHN0cm9rZS13aWR0aD1cIiR7c3Ryb2tlfVwiIGZpbGw9XCJub25lXCIgLz5gXG4gICAgICAgICAgOiBcIlwiXG4gICAgICB9XG4gICAgPC9zdmc+XG4gIGAucmVwbGFjZUFsbChcIlxcblwiLCBcIlwiKTtcbiAgcmV0dXJuIGBkYXRhOmltYWdlL3N2Zyt4bWwsJHtlbmNvZGVVUklDb21wb25lbnQoc3ZnKX1gO1xufVxuIiwgImV4cG9ydCB7IE9BdXRoU2VydmljZSB9IGZyb20gXCIuL09BdXRoU2VydmljZVwiO1xuZXhwb3J0IHsgd2l0aEFjY2Vzc1Rva2VuLCBnZXRBY2Nlc3NUb2tlbiB9IGZyb20gXCIuL3dpdGhBY2Nlc3NUb2tlblwiO1xuXG5leHBvcnQgdHlwZSB7IFdpdGhBY2Nlc3NUb2tlbkNvbXBvbmVudE9yRm4gfSBmcm9tIFwiLi93aXRoQWNjZXNzVG9rZW5cIjtcbmV4cG9ydCB0eXBlIHtcbiAgT25BdXRob3JpemVQYXJhbXMsXG4gIE9BdXRoU2VydmljZU9wdGlvbnMsXG4gIFByb3ZpZGVyV2l0aERlZmF1bHRDbGllbnRPcHRpb25zLFxuICBQcm92aWRlck9wdGlvbnMsXG59IGZyb20gXCIuL3R5cGVzXCI7XG4iLCAiaW1wb3J0IHsgQ29sb3IsIE9BdXRoIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgUFJPVklERVJfQ0xJRU5UX0lEUyB9IGZyb20gXCIuL3Byb3ZpZGVyc1wiO1xuaW1wb3J0IHR5cGUge1xuICBPQXV0aFNlcnZpY2VPcHRpb25zLFxuICBPbkF1dGhvcml6ZVBhcmFtcyxcbiAgUHJvdmlkZXJPcHRpb25zLFxuICBQcm92aWRlcldpdGhEZWZhdWx0Q2xpZW50T3B0aW9ucyxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBDbGFzcyBhbGxvd2luZyB0byBjcmVhdGUgYW4gT0F1dGggc2VydmljZSB1c2luZyB0aGUgdGhlIFBLQ0UgKFByb29mIEtleSBmb3IgQ29kZSBFeGNoYW5nZSkgZmxvdy5cbiAqXG4gKiBUaGlzIHNlcnZpY2UgaXMgY2FwYWJsZSBvZiBzdGFydGluZyB0aGUgYXV0aG9yaXphdGlvbiBwcm9jZXNzLCBmZXRjaGluZyBhbmQgcmVmcmVzaGluZyB0b2tlbnMsXG4gKiBhcyB3ZWxsIGFzIG1hbmFnaW5nIHRoZSBhdXRoZW50aWNhdGlvbiBzdGF0ZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3Qgb2F1dGhDbGllbnQgPSBuZXcgT0F1dGguUEtDRUNsaWVudCh7IC4uLiB9KTtcbiAqIGNvbnN0IG9hdXRoU2VydmljZSA9IG5ldyBPQXV0aFNlcnZpY2Uoe1xuICogICBjbGllbnQ6IG9hdXRoQ2xpZW50LFxuICogICBjbGllbnRJZDogJ3lvdXItY2xpZW50LWlkJyxcbiAqICAgc2NvcGU6ICdyZXF1aXJlZCBzY29wZXMnLFxuICogICBhdXRob3JpemVVcmw6ICdodHRwczovL3Byb3ZpZGVyLmNvbS9vYXV0aC9hdXRob3JpemUnLFxuICogICB0b2tlblVybDogJ2h0dHBzOi8vcHJvdmlkZXIuY29tL29hdXRoL3Rva2VuJyxcbiAqICAgcmVmcmVzaFRva2VuVXJsOiAnaHR0cHM6Ly9wcm92aWRlci5jb20vb2F1dGgvdG9rZW4nLFxuICogICBleHRyYVBhcmFtZXRlcnM6IHsgJ2FkZGl0aW9uYWxfcGFyYW0nOiAndmFsdWUnIH1cbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBPQXV0aFNlcnZpY2UgaW1wbGVtZW50cyBPQXV0aFNlcnZpY2VPcHRpb25zIHtcbiAgcHVibGljIGNsaWVudElkOiBzdHJpbmc7XG4gIHB1YmxpYyBzY29wZTogc3RyaW5nO1xuICBwdWJsaWMgY2xpZW50OiBPQXV0aC5QS0NFQ2xpZW50O1xuICBwdWJsaWMgZXh0cmFQYXJhbWV0ZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgcHVibGljIGF1dGhvcml6ZVVybDogc3RyaW5nO1xuICBwdWJsaWMgdG9rZW5Vcmw6IHN0cmluZztcbiAgcHVibGljIHJlZnJlc2hUb2tlblVybD86IHN0cmluZztcbiAgcHVibGljIGJvZHlFbmNvZGluZz86IFwianNvblwiIHwgXCJ1cmwtZW5jb2RlZFwiO1xuICBwdWJsaWMgcGVyc29uYWxBY2Nlc3NUb2tlbj86IHN0cmluZztcbiAgb25BdXRob3JpemU/OiAocGFyYW1zOiBPbkF1dGhvcml6ZVBhcmFtcykgPT4gdm9pZDtcbiAgdG9rZW5SZXNwb25zZVBhcnNlcjogKHJlc3BvbnNlOiB1bmtub3duKSA9PiBPQXV0aC5Ub2tlblJlc3BvbnNlO1xuICB0b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcjogKHJlc3BvbnNlOiB1bmtub3duKSA9PiBPQXV0aC5Ub2tlblJlc3BvbnNlO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IE9BdXRoU2VydmljZU9wdGlvbnMpIHtcbiAgICB0aGlzLmNsaWVudElkID0gb3B0aW9ucy5jbGllbnRJZDtcbiAgICB0aGlzLnNjb3BlID0gQXJyYXkuaXNBcnJheShvcHRpb25zLnNjb3BlKSA/IG9wdGlvbnMuc2NvcGUuam9pbihcIiBcIikgOiBvcHRpb25zLnNjb3BlO1xuICAgIHRoaXMucGVyc29uYWxBY2Nlc3NUb2tlbiA9IG9wdGlvbnMucGVyc29uYWxBY2Nlc3NUb2tlbjtcbiAgICB0aGlzLmJvZHlFbmNvZGluZyA9IG9wdGlvbnMuYm9keUVuY29kaW5nO1xuICAgIHRoaXMuY2xpZW50ID0gb3B0aW9ucy5jbGllbnQ7XG4gICAgdGhpcy5leHRyYVBhcmFtZXRlcnMgPSBvcHRpb25zLmV4dHJhUGFyYW1ldGVycztcbiAgICB0aGlzLmF1dGhvcml6ZVVybCA9IG9wdGlvbnMuYXV0aG9yaXplVXJsO1xuICAgIHRoaXMudG9rZW5VcmwgPSBvcHRpb25zLnRva2VuVXJsO1xuICAgIHRoaXMucmVmcmVzaFRva2VuVXJsID0gb3B0aW9ucy5yZWZyZXNoVG9rZW5Vcmw7XG4gICAgdGhpcy5vbkF1dGhvcml6ZSA9IG9wdGlvbnMub25BdXRob3JpemU7XG4gICAgdGhpcy50b2tlblJlc3BvbnNlUGFyc2VyID0gb3B0aW9ucy50b2tlblJlc3BvbnNlUGFyc2VyID8/ICgoeCkgPT4geCBhcyBPQXV0aC5Ub2tlblJlc3BvbnNlKTtcbiAgICB0aGlzLnRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyID0gb3B0aW9ucy50b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlciA/PyAoKHgpID0+IHggYXMgT0F1dGguVG9rZW5SZXNwb25zZSk7XG4gICAgdGhpcy5hdXRob3JpemUgPSB0aGlzLmF1dGhvcml6ZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzYW5hIE9BdXRoIHNlcnZpY2UgcHJvdmlkZWQgb3V0IG9mIHRoZSBib3guXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgYXNhbmEgPSBPQXV0aFNlcnZpY2UuYXNhbmEoeyBzY29wZTogJ2RlZmF1bHQnIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhc2FuYShvcHRpb25zOiBQcm92aWRlcldpdGhEZWZhdWx0Q2xpZW50T3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgT0F1dGhTZXJ2aWNlKHtcbiAgICAgIGNsaWVudDogbmV3IE9BdXRoLlBLQ0VDbGllbnQoe1xuICAgICAgICByZWRpcmVjdE1ldGhvZDogT0F1dGguUmVkaXJlY3RNZXRob2QuV2ViLFxuICAgICAgICBwcm92aWRlck5hbWU6IFwiQXNhbmFcIixcbiAgICAgICAgcHJvdmlkZXJJY29uOiBgZGF0YTppbWFnZS9zdmcreG1sLCR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgIGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjI1MVwiIGhlaWdodD1cIjIzMlwiIGZpbGw9XCJub25lXCI+PHBhdGggZmlsbD1cIiNGMDZBNkFcIiBkPVwiTTE3OS4zODMgNTQuMzczYzAgMzAuMDE3LTI0LjMzNyA1NC4zNzQtNTQuMzU0IDU0LjM3NC0zMC4wMzUgMC01NC4zNzMtMjQuMzM4LTU0LjM3My01NC4zNzRDNzAuNjU2IDI0LjMzOCA5NC45OTMgMCAxMjUuMDI5IDBjMzAuMDE3IDAgNTQuMzU0IDI0LjMzOCA1NC4zNTQgNTQuMzczWk01NC4zOTMgMTIyLjMzQzI0LjM3NiAxMjIuMzMuMDIgMTQ2LjY2OC4wMiAxNzYuNjg1YzAgMzAuMDE3IDI0LjMzNyA1NC4zNzMgNTQuMzczIDU0LjM3MyAzMC4wMzUgMCA1NC4zNzMtMjQuMzM4IDU0LjM3My01NC4zNzMgMC0zMC4wMTctMjQuMzM4LTU0LjM1NS01NC4zNzMtNTQuMzU1Wm0xNDEuMjUzIDBjLTMwLjAzNSAwLTU0LjM3MyAyNC4zMzgtNTQuMzczIDU0LjM3NCAwIDMwLjAzNSAyNC4zMzggNTQuMzczIDU0LjM3MyA1NC4zNzMgMzAuMDE3IDAgNTQuMzc0LTI0LjMzOCA1NC4zNzQtNTQuMzczIDAtMzAuMDM2LTI0LjMzOC01NC4zNzQtNTQuMzc0LTU0LjM3NFpcIi8+PC9zdmc+YCxcbiAgICAgICAgKX1gLFxuICAgICAgICBwcm92aWRlcklkOiBcImFzYW5hXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbm5lY3QgeW91ciBBc2FuYSBhY2NvdW50XCIsXG4gICAgICB9KSxcbiAgICAgIGNsaWVudElkOiBvcHRpb25zLmNsaWVudElkID8/IFBST1ZJREVSX0NMSUVOVF9JRFMuYXNhbmEsXG4gICAgICBhdXRob3JpemVVcmw6IG9wdGlvbnMuYXV0aG9yaXplVXJsID8/IFwiaHR0cHM6Ly9hc2FuYS5vYXV0aC5yYXljYXN0LmNvbS9hdXRob3JpemVcIixcbiAgICAgIHRva2VuVXJsOiBvcHRpb25zLnRva2VuVXJsID8/IFwiaHR0cHM6Ly9hc2FuYS5vYXV0aC5yYXljYXN0LmNvbS90b2tlblwiLFxuICAgICAgcmVmcmVzaFRva2VuVXJsOiBvcHRpb25zLnJlZnJlc2hUb2tlblVybCA/PyBcImh0dHBzOi8vYXNhbmEub2F1dGgucmF5Y2FzdC5jb20vcmVmcmVzaC10b2tlblwiLFxuICAgICAgc2NvcGU6IG9wdGlvbnMuc2NvcGUsXG4gICAgICBwZXJzb25hbEFjY2Vzc1Rva2VuOiBvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW4sXG4gICAgICBvbkF1dGhvcml6ZTogb3B0aW9ucy5vbkF1dGhvcml6ZSxcbiAgICAgIGJvZHlFbmNvZGluZzogb3B0aW9ucy5ib2R5RW5jb2RpbmcsXG4gICAgICB0b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcjogb3B0aW9ucy50b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcixcbiAgICAgIHRva2VuUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZXNwb25zZVBhcnNlcixcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXRIdWIgT0F1dGggc2VydmljZSBwcm92aWRlZCBvdXQgb2YgdGhlIGJveC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBnaXRodWIgPSBPQXV0aFNlcnZpY2UuZ2l0aHViKHsgc2NvcGU6ICdyZXBvIHVzZXInIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnaXRodWIob3B0aW9uczogUHJvdmlkZXJXaXRoRGVmYXVsdENsaWVudE9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IE9BdXRoU2VydmljZSh7XG4gICAgICBjbGllbnQ6IG5ldyBPQXV0aC5QS0NFQ2xpZW50KHtcbiAgICAgICAgcmVkaXJlY3RNZXRob2Q6IE9BdXRoLlJlZGlyZWN0TWV0aG9kLldlYixcbiAgICAgICAgcHJvdmlkZXJOYW1lOiBcIkdpdEh1YlwiLFxuICAgICAgICBwcm92aWRlckljb246IHtcbiAgICAgICAgICBzb3VyY2U6IGBkYXRhOmltYWdlL3N2Zyt4bWwsJHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCI2NFwiIGhlaWdodD1cIjY0XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiPjxwYXRoIGZpbGwtcnVsZT1cImV2ZW5vZGRcIiBkPVwiTTggMEMzLjU4IDAgMCAzLjU4IDAgOGMwIDMuNTQgMi4yOSA2LjUzIDUuNDcgNy41OS40LjA3LjU1LS4xNy41NS0uMzggMC0uMTktLjAxLS44Mi0uMDEtMS40OS0yLjAxLjM3LTIuNTMtLjQ5LTIuNjktLjk0LS4wOS0uMjMtLjQ4LS45NC0uODItMS4xMy0uMjgtLjE1LS42OC0uNTItLjAxLS41My42My0uMDEgMS4wOC41OCAxLjIzLjgyLjcyIDEuMjEgMS44Ny44NyAyLjMzLjY2LjA3LS41Mi4yOC0uODcuNTEtMS4wNy0xLjc4LS4yLTMuNjQtLjg5LTMuNjQtMy45NSAwLS44Ny4zMS0xLjU5LjgyLTIuMTUtLjA4LS4yLS4zNi0xLjAyLjA4LTIuMTIgMCAwIC42Ny0uMjEgMi4yLjgyLjY0LS4xOCAxLjMyLS4yNyAyLS4yNy42OCAwIDEuMzYuMDkgMiAuMjcgMS41My0xLjA0IDIuMi0uODIgMi4yLS44Mi40NCAxLjEuMTYgMS45Mi4wOCAyLjEyLjUxLjU2LjgyIDEuMjcuODIgMi4xNSAwIDMuMDctMS44NyAzLjc1LTMuNjUgMy45NS4yOS4yNS41NC43My41NCAxLjQ4IDAgMS4wNy0uMDEgMS45My0uMDEgMi4yIDAgLjIxLjE1LjQ2LjU1LjM4QTguMDEzIDguMDEzIDAgMCAwIDE2IDhjMC00LjQyLTMuNTgtOC04LTh6XCIvPjwvc3ZnPmAsXG4gICAgICAgICAgKX1gLFxuXG4gICAgICAgICAgdGludENvbG9yOiBDb2xvci5QcmltYXJ5VGV4dCxcbiAgICAgICAgfSxcbiAgICAgICAgcHJvdmlkZXJJZDogXCJnaXRodWJcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQ29ubmVjdCB5b3VyIEdpdEh1YiBhY2NvdW50XCIsXG4gICAgICB9KSxcbiAgICAgIGNsaWVudElkOiBvcHRpb25zLmNsaWVudElkID8/IFBST1ZJREVSX0NMSUVOVF9JRFMuZ2l0aHViLFxuICAgICAgYXV0aG9yaXplVXJsOiBvcHRpb25zLmF1dGhvcml6ZVVybCA/PyBcImh0dHBzOi8vZ2l0aHViLm9hdXRoLnJheWNhc3QuY29tL2F1dGhvcml6ZVwiLFxuICAgICAgdG9rZW5Vcmw6IG9wdGlvbnMudG9rZW5VcmwgPz8gXCJodHRwczovL2dpdGh1Yi5vYXV0aC5yYXljYXN0LmNvbS90b2tlblwiLFxuICAgICAgcmVmcmVzaFRva2VuVXJsOiBvcHRpb25zLnJlZnJlc2hUb2tlblVybCA/PyBcImh0dHBzOi8vZ2l0aHViLm9hdXRoLnJheWNhc3QuY29tL3JlZnJlc2gtdG9rZW5cIixcbiAgICAgIHNjb3BlOiBvcHRpb25zLnNjb3BlLFxuICAgICAgcGVyc29uYWxBY2Nlc3NUb2tlbjogb3B0aW9ucy5wZXJzb25hbEFjY2Vzc1Rva2VuLFxuICAgICAgb25BdXRob3JpemU6IG9wdGlvbnMub25BdXRob3JpemUsXG4gICAgICBib2R5RW5jb2Rpbmc6IG9wdGlvbnMuYm9keUVuY29kaW5nLFxuICAgICAgdG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXIsXG4gICAgICB0b2tlblJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVzcG9uc2VQYXJzZXIsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR29vZ2xlIE9BdXRoIHNlcnZpY2UgcHJvdmlkZWQgb3V0IG9mIHRoZSBib3guXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgZ29vZ2xlID0gT0F1dGhTZXJ2aWNlLmdvb2dsZSh7XG4gICAqICAgY2xpZW50SWQ6ICdjdXN0b20tY2xpZW50LWlkJyxcbiAgICogICBhdXRob3JpemVVcmw6ICdodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvdjIvYXV0aCcsXG4gICAqICAgdG9rZW5Vcmw6ICdodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbicsXG4gICAqICAgc2NvcGU6ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLnJlYWRvbmx5JyxcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnb29nbGUob3B0aW9uczogUHJvdmlkZXJPcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBPQXV0aFNlcnZpY2Uoe1xuICAgICAgY2xpZW50OiBuZXcgT0F1dGguUEtDRUNsaWVudCh7XG4gICAgICAgIHJlZGlyZWN0TWV0aG9kOiBPQXV0aC5SZWRpcmVjdE1ldGhvZC5BcHBVUkksXG4gICAgICAgIHByb3ZpZGVyTmFtZTogXCJHb29nbGVcIixcbiAgICAgICAgcHJvdmlkZXJJY29uOiBgZGF0YTppbWFnZS9zdmcreG1sLCR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgIGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBzdHlsZT1cImRpc3BsYXk6YmxvY2tcIiB2aWV3Qm94PVwiMCAwIDQ4IDQ4XCI+PHBhdGggZmlsbD1cIiNFQTQzMzVcIiBkPVwiTTI0IDkuNWMzLjU0IDAgNi43MSAxLjIyIDkuMjEgMy42bDYuODUtNi44NUMzNS45IDIuMzggMzAuNDcgMCAyNCAwIDE0LjYyIDAgNi41MSA1LjM4IDIuNTYgMTMuMjJsNy45OCA2LjE5QzEyLjQzIDEzLjcyIDE3Ljc0IDkuNSAyNCA5LjV6XCIvPjxwYXRoIGZpbGw9XCIjNDI4NUY0XCIgZD1cIk00Ni45OCAyNC41NWMwLTEuNTctLjE1LTMuMDktLjM4LTQuNTVIMjR2OS4wMmgxMi45NGMtLjU4IDIuOTYtMi4yNiA1LjQ4LTQuNzggNy4xOGw3LjczIDZjNC41MS00LjE4IDcuMDktMTAuMzYgNy4wOS0xNy42NXpcIi8+PHBhdGggZmlsbD1cIiNGQkJDMDVcIiBkPVwiTTEwLjUzIDI4LjU5Yy0uNDgtMS40NS0uNzYtMi45OS0uNzYtNC41OXMuMjctMy4xNC43Ni00LjU5bC03Ljk4LTYuMTlDLjkyIDE2LjQ2IDAgMjAuMTIgMCAyNGMwIDMuODguOTIgNy41NCAyLjU2IDEwLjc4bDcuOTctNi4xOXpcIi8+PHBhdGggZmlsbD1cIiMzNEE4NTNcIiBkPVwiTTI0IDQ4YzYuNDggMCAxMS45My0yLjEzIDE1Ljg5LTUuODFsLTcuNzMtNmMtMi4xNSAxLjQ1LTQuOTIgMi4zLTguMTYgMi4zLTYuMjYgMC0xMS41Ny00LjIyLTEzLjQ3LTkuOTFsLTcuOTggNi4xOUM2LjUxIDQyLjYyIDE0LjYyIDQ4IDI0IDQ4elwiLz48cGF0aCBmaWxsPVwibm9uZVwiIGQ9XCJNMCAwaDQ4djQ4SDB6XCIvPjwvc3ZnPmAsXG4gICAgICAgICl9YCxcbiAgICAgICAgcHJvdmlkZXJJZDogXCJnb29nbGVcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQ29ubmVjdCB5b3VyIEdvb2dsZSBhY2NvdW50XCIsXG4gICAgICB9KSxcbiAgICAgIGNsaWVudElkOiBvcHRpb25zLmNsaWVudElkLFxuICAgICAgYXV0aG9yaXplVXJsOiBvcHRpb25zLmF1dGhvcml6ZVVybCA/PyBcImh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi92Mi9hdXRoXCIsXG4gICAgICB0b2tlblVybDogb3B0aW9ucy50b2tlblVybCA/PyBcImh0dHBzOi8vb2F1dGgyLmdvb2dsZWFwaXMuY29tL3Rva2VuXCIsXG4gICAgICByZWZyZXNoVG9rZW5Vcmw6IG9wdGlvbnMudG9rZW5VcmwsXG4gICAgICBzY29wZTogb3B0aW9ucy5zY29wZSxcbiAgICAgIHBlcnNvbmFsQWNjZXNzVG9rZW46IG9wdGlvbnMucGVyc29uYWxBY2Nlc3NUb2tlbixcbiAgICAgIGJvZHlFbmNvZGluZzogb3B0aW9ucy5ib2R5RW5jb2RpbmcgPz8gXCJ1cmwtZW5jb2RlZFwiLFxuICAgICAgb25BdXRob3JpemU6IG9wdGlvbnMub25BdXRob3JpemUsXG4gICAgICB0b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcjogb3B0aW9ucy50b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcixcbiAgICAgIHRva2VuUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZXNwb25zZVBhcnNlcixcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBKaXJhIE9BdXRoIHNlcnZpY2UgcHJvdmlkZWQgb3V0IG9mIHRoZSBib3guXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgamlyYSA9IE9BdXRoU2VydmljZS5qaXJhKHtcbiAgICogICBjbGllbnRJZDogJ2N1c3RvbS1jbGllbnQtaWQnLFxuICAgKiAgIGF1dGhvcml6ZVVybDogJ2h0dHBzOi8vYXV0aC5hdGxhc3NpYW4uY29tL2F1dGhvcml6ZScsXG4gICAqICAgdG9rZW5Vcmw6ICdodHRwczovL2FwaS5hdGxhc3NpYW4uY29tL29hdXRoL3Rva2VuJyxcbiAgICogICBzY29wZTogJ3JlYWQ6amlyYS11c2VyIHJlYWQ6amlyYS13b3JrIG9mZmxpbmVfYWNjZXNzJ1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGppcmEob3B0aW9uczogUHJvdmlkZXJPcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBPQXV0aFNlcnZpY2Uoe1xuICAgICAgY2xpZW50OiBuZXcgT0F1dGguUEtDRUNsaWVudCh7XG4gICAgICAgIHJlZGlyZWN0TWV0aG9kOiBPQXV0aC5SZWRpcmVjdE1ldGhvZC5XZWIsXG4gICAgICAgIHByb3ZpZGVyTmFtZTogXCJKaXJhXCIsXG4gICAgICAgIHByb3ZpZGVySWNvbjogYGRhdGE6aW1hZ2Uvc3ZnK3htbCwke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgd2lkdGg9XCIyMzYxXCIgaGVpZ2h0PVwiMjUwMFwiIHZpZXdCb3g9XCIyLjU5IDAgMjE0LjA5MSAyMjRcIj48bGluZWFyR3JhZGllbnQgaWQ9XCJhXCIgeDE9XCIxMDIuNFwiIHgyPVwiNTYuMTVcIiB5MT1cIjIxOC42M1wiIHkyPVwiMTcyLjM5XCIgZ3JhZGllbnRUcmFuc2Zvcm09XCJtYXRyaXgoMSAwIDAgLTEgMCAyNjQpXCIgZ3JhZGllbnRVbml0cz1cInVzZXJTcGFjZU9uVXNlXCI+PHN0b3Agb2Zmc2V0PVwiLjE4XCIgc3RvcC1jb2xvcj1cIiMwMDUyY2NcIi8+PHN0b3Agb2Zmc2V0PVwiMVwiIHN0b3AtY29sb3I9XCIjMjY4NGZmXCIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IHhsaW5rOmhyZWY9XCIjYVwiIGlkPVwiYlwiIHgxPVwiMTE0LjY1XCIgeDI9XCIxNjAuODFcIiB5MT1cIjg1Ljc3XCIgeTI9XCIxMzEuOTJcIi8+PHBhdGggZmlsbD1cIiMyNjg0ZmZcIiBkPVwiTTIxNC4wNiAxMDUuNzMgMTE3LjY3IDkuMzQgMTA4LjMzIDAgMzUuNzcgNzIuNTYgMi41OSAxMDUuNzNhOC44OSA4Ljg5IDAgMCAwIDAgMTIuNTRsNjYuMjkgNjYuMjlMMTA4LjMzIDIyNGw3Mi41NS03Mi41NiAxLjEzLTEuMTIgMzIuMDUtMzJhOC44NyA4Ljg3IDAgMCAwIDAtMTIuNTl6bS0xMDUuNzMgMzkuMzlMNzUuMjEgMTEybDMzLjEyLTMzLjEyTDE0MS40NCAxMTJ6XCIvPjxwYXRoIGZpbGw9XCJ1cmwoI2EpXCIgZD1cIk0xMDguMzMgNzguODhhNTUuNzUgNTUuNzUgMCAwIDEtLjI0LTc4LjYxTDM1LjYyIDcyLjcxbDM5LjQ0IDM5LjQ0elwiLz48cGF0aCBmaWxsPVwidXJsKCNiKVwiIGQ9XCJtMTQxLjUzIDExMS45MS0zMy4yIDMzLjIxYTU1Ljc3IDU1Ljc3IDAgMCAxIDAgNzguODZMMTgxIDE1MS4zNXpcIi8+PC9zdmc+YCxcbiAgICAgICAgKX1gLFxuICAgICAgICBwcm92aWRlcklkOiBcImppcmFcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQ29ubmVjdCB5b3VyIEppcmEgYWNjb3VudFwiLFxuICAgICAgfSksXG4gICAgICBjbGllbnRJZDogb3B0aW9ucy5jbGllbnRJZCxcbiAgICAgIGF1dGhvcml6ZVVybDogb3B0aW9ucy5hdXRob3JpemVVcmwgPz8gXCJodHRwczovL2F1dGguYXRsYXNzaWFuLmNvbS9hdXRob3JpemVcIixcbiAgICAgIHRva2VuVXJsOiBvcHRpb25zLnRva2VuVXJsID8/IFwiaHR0cHM6Ly9hdXRoLmF0bGFzc2lhbi5jb20vb2F1dGgvdG9rZW5cIixcbiAgICAgIHJlZnJlc2hUb2tlblVybDogb3B0aW9ucy5yZWZyZXNoVG9rZW5VcmwsXG4gICAgICBzY29wZTogb3B0aW9ucy5zY29wZSxcbiAgICAgIHBlcnNvbmFsQWNjZXNzVG9rZW46IG9wdGlvbnMucGVyc29uYWxBY2Nlc3NUb2tlbixcbiAgICAgIG9uQXV0aG9yaXplOiBvcHRpb25zLm9uQXV0aG9yaXplLFxuICAgICAgYm9keUVuY29kaW5nOiBvcHRpb25zLmJvZHlFbmNvZGluZyxcbiAgICAgIHRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyLFxuICAgICAgdG9rZW5SZXNwb25zZVBhcnNlcjogb3B0aW9ucy50b2tlblJlc3BvbnNlUGFyc2VyLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIExpbmVhciBPQXV0aCBzZXJ2aWNlIHByb3ZpZGVkIG91dCBvZiB0aGUgYm94LlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IGxpbmVhciA9IE9BdXRoU2VydmljZS5saW5lYXIoeyBzY29wZTogJ3JlYWQgd3JpdGUnIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBsaW5lYXIob3B0aW9uczogUHJvdmlkZXJXaXRoRGVmYXVsdENsaWVudE9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IE9BdXRoU2VydmljZSh7XG4gICAgICBjbGllbnQ6IG5ldyBPQXV0aC5QS0NFQ2xpZW50KHtcbiAgICAgICAgcmVkaXJlY3RNZXRob2Q6IE9BdXRoLlJlZGlyZWN0TWV0aG9kLldlYixcbiAgICAgICAgcHJvdmlkZXJOYW1lOiBcIkxpbmVhclwiLFxuICAgICAgICBwcm92aWRlckljb246IHtcbiAgICAgICAgICBzb3VyY2U6IHtcbiAgICAgICAgICAgIGxpZ2h0OiBgZGF0YTppbWFnZS9zdmcreG1sLCR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cIiMyMjIzMjZcIiB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMTAwIDEwMFwiPjxwYXRoIGQ9XCJNMS4yMjU0MSA2MS41MjI4Yy0uMjIyNS0uOTQ4NS45MDc0OC0xLjU0NTkgMS41OTYzOC0uODU3TDM5LjMzNDIgOTcuMTc4MmMuNjg4OS42ODg5LjA5MTUgMS44MTg5LS44NTcgMS41OTY0QzIwLjA1MTUgOTQuNDUyMiA1LjU0Nzc5IDc5Ljk0ODUgMS4yMjU0MSA2MS41MjI4Wk0uMDAxODkxMzUgNDYuODg5MWMtLjAxNzY0Mzc1LjI4MzMuMDg4ODcyMTUuNTU5OS4yODk1NzE2NS43NjA2TDUyLjM1MDMgOTkuNzA4NWMuMjAwNy4yMDA3LjQ3NzMuMzA3NS43NjA2LjI4OTYgMi4zNjkyLS4xNDc2IDQuNjkzOC0uNDYgNi45NjI0LS45MjU5Ljc2NDUtLjE1NyAxLjAzMDEtMS4wOTYzLjQ3ODItMS42NDgxTDIuNTc1OTUgMzkuNDQ4NWMtLjU1MTg2LS41NTE5LTEuNDkxMTctLjI4NjMtMS42NDgxNzQuNDc4Mi0uNDY1OTE1IDIuMjY4Ni0uNzc4MzIgNC41OTMyLS45MjU4ODQ2NSA2Ljk2MjRaTTQuMjEwOTMgMjkuNzA1NGMtLjE2NjQ5LjM3MzgtLjA4MTY5LjgxMDYuMjA3NjUgMS4xbDY0Ljc3NjAyIDY0Ljc3NmMuMjg5NC4yODk0LjcyNjIuMzc0MiAxLjEuMjA3NyAxLjc4NjEtLjc5NTYgMy41MTcxLTEuNjkyNyA1LjE4NTUtMi42ODQuNTUyMS0uMzI4LjYzNzMtMS4wODY3LjE4MzItMS41NDA3TDguNDM1NjYgMjQuMzM2N2MtLjQ1NDA5LS40NTQxLTEuMjEyNzEtLjM2ODktMS41NDA3NC4xODMyLS45OTEzMiAxLjY2ODQtMS44ODg0MyAzLjM5OTQtMi42ODM5OSA1LjE4NTVaTTEyLjY1ODcgMTguMDc0Yy0uMzcwMS0uMzcwMS0uMzkzLS45NjM3LS4wNDQzLTEuMzU0MUMyMS43Nzk1IDYuNDU5MzEgMzUuMTExNCAwIDQ5Ljk1MTkgMCA3Ny41OTI3IDAgMTAwIDIyLjQwNzMgMTAwIDUwLjA0ODFjMCAxNC44NDA1LTYuNDU5MyAyOC4xNzI0LTE2LjcxOTkgMzcuMzM3NS0uMzkwMy4zNDg3LS45ODQuMzI1OC0xLjM1NDItLjA0NDNMMTIuNjU4NyAxOC4wNzRaXCIvPjwvc3ZnPmAsXG4gICAgICAgICAgICApfWAsXG4gICAgICAgICAgICBkYXJrOiBgZGF0YTppbWFnZS9zdmcreG1sLCR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cIiNmZmZcIiB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMTAwIDEwMFwiPjxwYXRoIGQ9XCJNMS4yMjU0MSA2MS41MjI4Yy0uMjIyNS0uOTQ4NS45MDc0OC0xLjU0NTkgMS41OTYzOC0uODU3TDM5LjMzNDIgOTcuMTc4MmMuNjg4OS42ODg5LjA5MTUgMS44MTg5LS44NTcgMS41OTY0QzIwLjA1MTUgOTQuNDUyMiA1LjU0Nzc5IDc5Ljk0ODUgMS4yMjU0MSA2MS41MjI4Wk0uMDAxODkxMzUgNDYuODg5MWMtLjAxNzY0Mzc1LjI4MzMuMDg4ODcyMTUuNTU5OS4yODk1NzE2NS43NjA2TDUyLjM1MDMgOTkuNzA4NWMuMjAwNy4yMDA3LjQ3NzMuMzA3NS43NjA2LjI4OTYgMi4zNjkyLS4xNDc2IDQuNjkzOC0uNDYgNi45NjI0LS45MjU5Ljc2NDUtLjE1NyAxLjAzMDEtMS4wOTYzLjQ3ODItMS42NDgxTDIuNTc1OTUgMzkuNDQ4NWMtLjU1MTg2LS41NTE5LTEuNDkxMTctLjI4NjMtMS42NDgxNzQuNDc4Mi0uNDY1OTE1IDIuMjY4Ni0uNzc4MzIgNC41OTMyLS45MjU4ODQ2NSA2Ljk2MjRaTTQuMjEwOTMgMjkuNzA1NGMtLjE2NjQ5LjM3MzgtLjA4MTY5LjgxMDYuMjA3NjUgMS4xbDY0Ljc3NjAyIDY0Ljc3NmMuMjg5NC4yODk0LjcyNjIuMzc0MiAxLjEuMjA3NyAxLjc4NjEtLjc5NTYgMy41MTcxLTEuNjkyNyA1LjE4NTUtMi42ODQuNTUyMS0uMzI4LjYzNzMtMS4wODY3LjE4MzItMS41NDA3TDguNDM1NjYgMjQuMzM2N2MtLjQ1NDA5LS40NTQxLTEuMjEyNzEtLjM2ODktMS41NDA3NC4xODMyLS45OTEzMiAxLjY2ODQtMS44ODg0MyAzLjM5OTQtMi42ODM5OSA1LjE4NTVaTTEyLjY1ODcgMTguMDc0Yy0uMzcwMS0uMzcwMS0uMzkzLS45NjM3LS4wNDQzLTEuMzU0MUMyMS43Nzk1IDYuNDU5MzEgMzUuMTExNCAwIDQ5Ljk1MTkgMCA3Ny41OTI3IDAgMTAwIDIyLjQwNzMgMTAwIDUwLjA0ODFjMCAxNC44NDA1LTYuNDU5MyAyOC4xNzI0LTE2LjcxOTkgMzcuMzM3NS0uMzkwMy4zNDg3LS45ODQuMzI1OC0xLjM1NDItLjA0NDNMMTIuNjU4NyAxOC4wNzRaXCIgLz48L3N2Zz5gLFxuICAgICAgICAgICAgKX1gLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHByb3ZpZGVySWQ6IFwibGluZWFyXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbm5lY3QgeW91ciBMaW5lYXIgYWNjb3VudFwiLFxuICAgICAgfSksXG4gICAgICBjbGllbnRJZDogb3B0aW9ucy5jbGllbnRJZCA/PyBQUk9WSURFUl9DTElFTlRfSURTLmxpbmVhcixcbiAgICAgIGF1dGhvcml6ZVVybDogb3B0aW9ucy5hdXRob3JpemVVcmwgPz8gXCJodHRwczovL2xpbmVhci5vYXV0aC5yYXljYXN0LmNvbS9hdXRob3JpemVcIixcbiAgICAgIHRva2VuVXJsOiBvcHRpb25zLnRva2VuVXJsID8/IFwiaHR0cHM6Ly9saW5lYXIub2F1dGgucmF5Y2FzdC5jb20vdG9rZW5cIixcbiAgICAgIHJlZnJlc2hUb2tlblVybDogb3B0aW9ucy5yZWZyZXNoVG9rZW5VcmwgPz8gXCJodHRwczovL2xpbmVhci5vYXV0aC5yYXljYXN0LmNvbS9yZWZyZXNoLXRva2VuXCIsXG4gICAgICBzY29wZTogb3B0aW9ucy5zY29wZSxcbiAgICAgIGV4dHJhUGFyYW1ldGVyczoge1xuICAgICAgICBhY3RvcjogXCJ1c2VyXCIsXG4gICAgICB9LFxuICAgICAgb25BdXRob3JpemU6IG9wdGlvbnMub25BdXRob3JpemUsXG4gICAgICBib2R5RW5jb2Rpbmc6IG9wdGlvbnMuYm9keUVuY29kaW5nLFxuICAgICAgdG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXIsXG4gICAgICB0b2tlblJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVzcG9uc2VQYXJzZXIsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2xhY2sgT0F1dGggc2VydmljZSBwcm92aWRlZCBvdXQgb2YgdGhlIGJveC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBzbGFjayA9IE9BdXRoU2VydmljZS5zbGFjayh7IHNjb3BlOiAnZW1vamk6cmVhZCcgfSlcbiAgICogYGBgXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNsYWNrKG9wdGlvbnM6IFByb3ZpZGVyV2l0aERlZmF1bHRDbGllbnRPcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBPQXV0aFNlcnZpY2Uoe1xuICAgICAgY2xpZW50OiBuZXcgT0F1dGguUEtDRUNsaWVudCh7XG4gICAgICAgIHJlZGlyZWN0TWV0aG9kOiBPQXV0aC5SZWRpcmVjdE1ldGhvZC5XZWIsXG4gICAgICAgIHByb3ZpZGVyTmFtZTogXCJTbGFja1wiLFxuICAgICAgICBwcm92aWRlckljb246IGBkYXRhOmltYWdlL3N2Zyt4bWwsJHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCI3MyA3MyAxMjQgMTI0XCI+PHN0eWxlPi5zdDB7ZmlsbDojZTAxZTVhfS5zdDF7ZmlsbDojMzZjNWYwfS5zdDJ7ZmlsbDojMmViNjdkfS5zdDN7ZmlsbDojZWNiMjJlfTwvc3R5bGU+PHBhdGggZD1cIk05OS40IDE1MS4yYzAgNy4xLTUuOCAxMi45LTEyLjkgMTIuOS03LjEgMC0xMi45LTUuOC0xMi45LTEyLjkgMC03LjEgNS44LTEyLjkgMTIuOS0xMi45aDEyLjl2MTIuOXpNMTA1LjkgMTUxLjJjMC03LjEgNS44LTEyLjkgMTIuOS0xMi45czEyLjkgNS44IDEyLjkgMTIuOXYzMi4zYzAgNy4xLTUuOCAxMi45LTEyLjkgMTIuOXMtMTIuOS01LjgtMTIuOS0xMi45di0zMi4zelwiIGNsYXNzPVwic3QwXCIvPjxwYXRoIGQ9XCJNMTE4LjggOTkuNGMtNy4xIDAtMTIuOS01LjgtMTIuOS0xMi45IDAtNy4xIDUuOC0xMi45IDEyLjktMTIuOXMxMi45IDUuOCAxMi45IDEyLjl2MTIuOWgtMTIuOXpNMTE4LjggMTA1LjljNy4xIDAgMTIuOSA1LjggMTIuOSAxMi45cy01LjggMTIuOS0xMi45IDEyLjlIODYuNWMtNy4xIDAtMTIuOS01LjgtMTIuOS0xMi45czUuOC0xMi45IDEyLjktMTIuOWgzMi4zelwiIGNsYXNzPVwic3QxXCIvPjxwYXRoIGQ9XCJNMTcwLjYgMTE4LjhjMC03LjEgNS44LTEyLjkgMTIuOS0xMi45IDcuMSAwIDEyLjkgNS44IDEyLjkgMTIuOXMtNS44IDEyLjktMTIuOSAxMi45aC0xMi45di0xMi45ek0xNjQuMSAxMTguOGMwIDcuMS01LjggMTIuOS0xMi45IDEyLjktNy4xIDAtMTIuOS01LjgtMTIuOS0xMi45Vjg2LjVjMC03LjEgNS44LTEyLjkgMTIuOS0xMi45IDcuMSAwIDEyLjkgNS44IDEyLjkgMTIuOXYzMi4zelwiIGNsYXNzPVwic3QyXCIvPjxwYXRoIGQ9XCJNMTUxLjIgMTcwLjZjNy4xIDAgMTIuOSA1LjggMTIuOSAxMi45IDAgNy4xLTUuOCAxMi45LTEyLjkgMTIuOS03LjEgMC0xMi45LTUuOC0xMi45LTEyLjl2LTEyLjloMTIuOXpNMTUxLjIgMTY0LjFjLTcuMSAwLTEyLjktNS44LTEyLjktMTIuOSAwLTcuMSA1LjgtMTIuOSAxMi45LTEyLjloMzIuM2M3LjEgMCAxMi45IDUuOCAxMi45IDEyLjkgMCA3LjEtNS44IDEyLjktMTIuOSAxMi45aC0zMi4zelwiIGNsYXNzPVwic3QzXCIvPjwvc3ZnPmAsXG4gICAgICAgICl9YCxcbiAgICAgICAgcHJvdmlkZXJJZDogXCJzbGFja1wiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJDb25uZWN0IHlvdXIgU2xhY2sgYWNjb3VudFwiLFxuICAgICAgfSksXG4gICAgICBjbGllbnRJZDogb3B0aW9ucy5jbGllbnRJZCA/PyBQUk9WSURFUl9DTElFTlRfSURTLnNsYWNrLFxuICAgICAgYXV0aG9yaXplVXJsOiBvcHRpb25zLmF1dGhvcml6ZVVybCA/PyBcImh0dHBzOi8vc2xhY2sub2F1dGgucmF5Y2FzdC5jb20vYXV0aG9yaXplXCIsXG4gICAgICB0b2tlblVybDogb3B0aW9ucy50b2tlblVybCA/PyBcImh0dHBzOi8vc2xhY2sub2F1dGgucmF5Y2FzdC5jb20vdG9rZW5cIixcbiAgICAgIHJlZnJlc2hUb2tlblVybDogb3B0aW9ucy50b2tlblVybCA/PyBcImh0dHBzOi8vc2xhY2sub2F1dGgucmF5Y2FzdC5jb20vcmVmcmVzaC10b2tlblwiLFxuICAgICAgc2NvcGU6IFwiXCIsXG4gICAgICBleHRyYVBhcmFtZXRlcnM6IHtcbiAgICAgICAgdXNlcl9zY29wZTogb3B0aW9ucy5zY29wZSxcbiAgICAgIH0sXG4gICAgICBwZXJzb25hbEFjY2Vzc1Rva2VuOiBvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW4sXG4gICAgICBib2R5RW5jb2Rpbmc6IG9wdGlvbnMudG9rZW5VcmwgPyBvcHRpb25zLmJvZHlFbmNvZGluZyA/PyBcInVybC1lbmNvZGVkXCIgOiBcImpzb25cIixcbiAgICAgIG9uQXV0aG9yaXplOiBvcHRpb25zLm9uQXV0aG9yaXplLFxuICAgICAgdG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXIsXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgdG9rZW5SZXNwb25zZVBhcnNlcjpcbiAgICAgICAgb3B0aW9ucy50b2tlblJlc3BvbnNlUGFyc2VyID8/XG4gICAgICAgICgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhY2Nlc3NfdG9rZW46IHJlc3BvbnNlLmF1dGhlZF91c2VyLmFjY2Vzc190b2tlbixcbiAgICAgICAgICAgIHNjb3BlOiByZXNwb25zZS5hdXRoZWRfdXNlci5zY29wZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBab29tIE9BdXRoIHNlcnZpY2UgcHJvdmlkZWQgb3V0IG9mIHRoZSBib3guXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3Qgem9vbSA9IE9BdXRoU2VydmljZS56b29tKHtcbiAgICogICBjbGllbnRJZDogJ2N1c3RvbS1jbGllbnQtaWQnLFxuICAgKiAgIGF1dGhvcml6ZVVybDogJ2h0dHBzOi8vem9vbS51cy9vYXV0aC9hdXRob3JpemUnLFxuICAgKiAgIHRva2VuVXJsOiAnaHR0cHM6Ly96b29tLnVzL29hdXRoL3Rva2VuJyxcbiAgICogICBzY29wZTogJ21lZXRpbmc6d3JpdGUnLFxuICAgKiAgIHBlcnNvbmFsQWNjZXNzVG9rZW46ICdwZXJzb25hbC1hY2Nlc3MtdG9rZW4nLFxuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHpvb20ob3B0aW9uczogUHJvdmlkZXJPcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBPQXV0aFNlcnZpY2Uoe1xuICAgICAgY2xpZW50OiBuZXcgT0F1dGguUEtDRUNsaWVudCh7XG4gICAgICAgIHJlZGlyZWN0TWV0aG9kOiBPQXV0aC5SZWRpcmVjdE1ldGhvZC5XZWIsXG4gICAgICAgIHByb3ZpZGVyTmFtZTogXCJab29tXCIsXG4gICAgICAgIHByb3ZpZGVySWNvbjogYGRhdGE6aW1hZ2Uvc3ZnK3htbCwke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAzNTEuODQ1IDgwXCI+PHBhdGggZD1cIk03My43ODYgNzguODM1SDEwLjg4QTEwLjg0MiAxMC44NDIgMCAwIDEgLjgzMyA3Mi4xMjJhMTAuODQxIDEwLjg0MSAwIDAgMSAyLjM1Ny0xMS44NUw0Ni43NjQgMTYuN2gtMzEuMjNDNi45NTQgMTYuNjk5IDAgOS43NDQgMCAxLjE2NWg1OC4wMTRjNC40MTQgMCA4LjM1NyAyLjYzNCAxMC4wNDYgNi43MTJhMTAuODQzIDEwLjg0MyAwIDAgMS0yLjM1NiAxMS44NUwyMi4xMyA2My4zMDJoMzYuMTIyYzguNTggMCAxNS41MzQgNi45NTUgMTUuNTM0IDE1LjUzNFptMjc4LjA1OS00OC41NDRDMzUxLjg0NSAxMy41ODggMzM4LjI1NiAwIDMyMS41NTMgMGMtOC45MzQgMC0xNi45NzUgMy44OS0yMi41MjQgMTAuMDYzQzI5My40OCAzLjg5IDI4NS40NCAwIDI3Ni41MDUgMGMtMTYuNzAzIDAtMzAuMjkxIDEzLjU4OC0zMC4yOTEgMzAuMjkxdjQ4LjU0NGM4LjU3OSAwIDE1LjUzNC02Ljk1NSAxNS41MzQtMTUuNTM0di0zMy4wMWMwLTguMTM3IDYuNjItMTQuNzU3IDE0Ljc1Ny0xNC43NTdzMTQuNzU3IDYuNjIgMTQuNzU3IDE0Ljc1N3YzMy4wMWMwIDguNTggNi45NTUgMTUuNTM0IDE1LjUzNCAxNS41MzRWMzAuMjkxYzAtOC4xMzcgNi42Mi0xNC43NTcgMTQuNzU3LTE0Ljc1N3MxNC43NTggNi42MiAxNC43NTggMTQuNzU3djMzLjAxYzAgOC41OCA2Ljk1NCAxNS41MzQgMTUuNTM0IDE1LjUzNFYzMC4yOTFaTTIzOC40NDcgNDBjMCAyMi4wOTEtMTcuOTA5IDQwLTQwIDQwcy00MC0xNy45MDktNDAtNDAgMTcuOTA4LTQwIDQwLTQwIDQwIDE3LjkwOSA0MCA0MFptLTE1LjUzNCAwYzAtMTMuNTEyLTEwLjk1NC0yNC40NjYtMjQuNDY2LTI0LjQ2NlMxNzMuOTggMjYuNDg4IDE3My45OCA0MHMxMC45NTMgMjQuNDY2IDI0LjQ2NiAyNC40NjZTMjIyLjkxMyA1My41MTIgMjIyLjkxMyA0MFptLTcwLjY4IDBjMCAyMi4wOTEtMTcuOTA5IDQwLTQwIDQwcy00MC0xNy45MDktNDAtNDAgMTcuOTA5LTQwIDQwLTQwIDQwIDE3LjkwOSA0MCA0MFptLTE1LjUzNCAwYzAtMTMuNTEyLTEwLjk1NC0yNC40NjYtMjQuNDY2LTI0LjQ2NlM4Ny43NjcgMjYuNDg4IDg3Ljc2NyA0MHMxMC45NTQgMjQuNDY2IDI0LjQ2NiAyNC40NjZTMTM2LjY5OSA1My41MTIgMTM2LjY5OSA0MFpcIiBzdHlsZT1cImZpbGw6IzBiNWNmZlwiLz48L3N2Zz5gLFxuICAgICAgICApfWAsXG4gICAgICAgIHByb3ZpZGVySWQ6IFwiem9vbVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJDb25uZWN0IHlvdXIgWm9vbSBhY2NvdW50XCIsXG4gICAgICB9KSxcbiAgICAgIGNsaWVudElkOiBvcHRpb25zLmNsaWVudElkLFxuICAgICAgYXV0aG9yaXplVXJsOiBvcHRpb25zLmF1dGhvcml6ZVVybCA/PyBcImh0dHBzOi8vem9vbS51cy9vYXV0aC9hdXRob3JpemVcIixcbiAgICAgIHRva2VuVXJsOiBvcHRpb25zLnRva2VuVXJsID8/IFwiaHR0cHM6Ly96b29tLnVzL29hdXRoL3Rva2VuXCIsXG4gICAgICByZWZyZXNoVG9rZW5Vcmw6IG9wdGlvbnMucmVmcmVzaFRva2VuVXJsLFxuICAgICAgc2NvcGU6IG9wdGlvbnMuc2NvcGUsXG4gICAgICBwZXJzb25hbEFjY2Vzc1Rva2VuOiBvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW4sXG4gICAgICBib2R5RW5jb2Rpbmc6IG9wdGlvbnMuYm9keUVuY29kaW5nID8/IFwidXJsLWVuY29kZWRcIixcbiAgICAgIG9uQXV0aG9yaXplOiBvcHRpb25zLm9uQXV0aG9yaXplLFxuICAgICAgdG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXIsXG4gICAgICB0b2tlblJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVzcG9uc2VQYXJzZXIsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhdGVzIHRoZSBPQXV0aCBhdXRob3JpemF0aW9uIHByb2Nlc3Mgb3IgcmVmcmVzaGVzIGV4aXN0aW5nIHRva2VucyBpZiBuZWNlc3NhcnkuXG4gICAqIElmIHRoZSBjdXJyZW50IHRva2VuIHNldCBoYXMgYSByZWZyZXNoIHRva2VuIGFuZCBpdCBpcyBleHBpcmVkLCB0aGVuIHRoZSBmdW5jdGlvbiB3aWxsIHJlZnJlc2ggdGhlIHRva2Vucy5cbiAgICogSWYgbm8gdG9rZW5zIGV4aXN0LCBpdCB3aWxsIGluaXRpYXRlIHRoZSBPQXV0aCBhdXRob3JpemF0aW9uIHByb2Nlc3MgYW5kIGZldGNoIHRoZSB0b2tlbnMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGFjY2VzcyB0b2tlbiBvYnRhaW5lZCBmcm9tIHRoZSBhdXRob3JpemF0aW9uIGZsb3csIG9yIG51bGwgaWYgdGhlIHRva2VuIGNvdWxkIG5vdCBiZSBvYnRhaW5lZC5cbiAgICovXG4gIGFzeW5jIGF1dGhvcml6ZSgpIHtcbiAgICBjb25zdCBjdXJyZW50VG9rZW5TZXQgPSBhd2FpdCB0aGlzLmNsaWVudC5nZXRUb2tlbnMoKTtcbiAgICBpZiAoY3VycmVudFRva2VuU2V0Py5hY2Nlc3NUb2tlbikge1xuICAgICAgaWYgKGN1cnJlbnRUb2tlblNldC5yZWZyZXNoVG9rZW4gJiYgY3VycmVudFRva2VuU2V0LmlzRXhwaXJlZCgpKSB7XG4gICAgICAgIGNvbnN0IHRva2VucyA9IGF3YWl0IHRoaXMucmVmcmVzaFRva2Vucyh7XG4gICAgICAgICAgdG9rZW46IGN1cnJlbnRUb2tlblNldC5yZWZyZXNoVG9rZW4sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEluIHRoZSBjYXNlIHdoZXJlIHRoZSByZWZyZXNoIHRva2VuIGZsb3dzIGZhaWxzLCBub3RoaW5nIGlzIHJldHVybmVkIGFuZCB0aGUgYXV0aG9yaXplIGZ1bmN0aW9uIGlzIGNhbGxlZCBhZ2Fpbi5cbiAgICAgICAgaWYgKHRva2Vucykge1xuICAgICAgICAgIGF3YWl0IHRoaXMuY2xpZW50LnNldFRva2Vucyh0b2tlbnMpO1xuICAgICAgICAgIHJldHVybiB0b2tlbnMuYWNjZXNzX3Rva2VuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VycmVudFRva2VuU2V0LmFjY2Vzc1Rva2VuO1xuICAgIH1cblxuICAgIGNvbnN0IGF1dGhSZXF1ZXN0ID0gYXdhaXQgdGhpcy5jbGllbnQuYXV0aG9yaXphdGlvblJlcXVlc3Qoe1xuICAgICAgZW5kcG9pbnQ6IHRoaXMuYXV0aG9yaXplVXJsLFxuICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICBzY29wZTogdGhpcy5zY29wZSxcbiAgICAgIGV4dHJhUGFyYW1ldGVyczogdGhpcy5leHRyYVBhcmFtZXRlcnMsXG4gICAgfSk7XG5cbiAgICBjb25zdCB7IGF1dGhvcml6YXRpb25Db2RlIH0gPSBhd2FpdCB0aGlzLmNsaWVudC5hdXRob3JpemUoYXV0aFJlcXVlc3QpO1xuICAgIGNvbnN0IHRva2VucyA9IGF3YWl0IHRoaXMuZmV0Y2hUb2tlbnMoe1xuICAgICAgYXV0aFJlcXVlc3QsXG4gICAgICBhdXRob3JpemF0aW9uQ29kZSxcbiAgICB9KTtcblxuICAgIGF3YWl0IHRoaXMuY2xpZW50LnNldFRva2Vucyh0b2tlbnMpO1xuXG4gICAgcmV0dXJuIHRva2Vucy5hY2Nlc3NfdG9rZW47XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGZldGNoVG9rZW5zKHtcbiAgICBhdXRoUmVxdWVzdCxcbiAgICBhdXRob3JpemF0aW9uQ29kZSxcbiAgfToge1xuICAgIGF1dGhSZXF1ZXN0OiBPQXV0aC5BdXRob3JpemF0aW9uUmVxdWVzdDtcbiAgICBhdXRob3JpemF0aW9uQ29kZTogc3RyaW5nO1xuICB9KSB7XG4gICAgbGV0IG9wdGlvbnM7XG4gICAgaWYgKHRoaXMuYm9keUVuY29kaW5nID09PSBcInVybC1lbmNvZGVkXCIpIHtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcbiAgICAgIHBhcmFtcy5hcHBlbmQoXCJjbGllbnRfaWRcIiwgdGhpcy5jbGllbnRJZCk7XG4gICAgICBwYXJhbXMuYXBwZW5kKFwiY29kZVwiLCBhdXRob3JpemF0aW9uQ29kZSk7XG4gICAgICBwYXJhbXMuYXBwZW5kKFwiY29kZV92ZXJpZmllclwiLCBhdXRoUmVxdWVzdC5jb2RlVmVyaWZpZXIpO1xuICAgICAgcGFyYW1zLmFwcGVuZChcImdyYW50X3R5cGVcIiwgXCJhdXRob3JpemF0aW9uX2NvZGVcIik7XG4gICAgICBwYXJhbXMuYXBwZW5kKFwicmVkaXJlY3RfdXJpXCIsIGF1dGhSZXF1ZXN0LnJlZGlyZWN0VVJJKTtcblxuICAgICAgb3B0aW9ucyA9IHsgYm9keTogcGFyYW1zIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBjbGllbnRfaWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICAgICAgY29kZTogYXV0aG9yaXphdGlvbkNvZGUsXG4gICAgICAgICAgY29kZV92ZXJpZmllcjogYXV0aFJlcXVlc3QuY29kZVZlcmlmaWVyLFxuICAgICAgICAgIGdyYW50X3R5cGU6IFwiYXV0aG9yaXphdGlvbl9jb2RlXCIsXG4gICAgICAgICAgcmVkaXJlY3RfdXJpOiBhdXRoUmVxdWVzdC5yZWRpcmVjdFVSSSxcbiAgICAgICAgfSksXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh0aGlzLnRva2VuVXJsLCB7IG1ldGhvZDogXCJQT1NUXCIsIC4uLm9wdGlvbnMgfSk7XG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgY29uc3QgcmVzcG9uc2VUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgY29uc29sZS5lcnJvcihcImZldGNoIHRva2VucyBlcnJvcjpcIiwgcmVzcG9uc2VUZXh0KTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3Igd2hpbGUgZmV0Y2hpbmcgdG9rZW5zOiAke3Jlc3BvbnNlLnN0YXR1c30gKCR7cmVzcG9uc2Uuc3RhdHVzVGV4dH0pXFxuJHtyZXNwb25zZVRleHR9YCk7XG4gICAgfVxuICAgIGNvbnN0IHRva2VucyA9IHRoaXMudG9rZW5SZXNwb25zZVBhcnNlcihhd2FpdCByZXNwb25zZS5qc29uKCkpO1xuXG4gICAgLy8gU29tZSBjbGllbnRzIHN1Y2ggYXMgTGluZWFyIGNhbiByZXR1cm4gYSBzY29wZSBhcnJheSBpbnN0ZWFkIG9mIGEgc3RyaW5nXG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodG9rZW5zLnNjb3BlKSA/IHsgLi4udG9rZW5zLCBzY29wZTogdG9rZW5zLnNjb3BlLmpvaW4oXCIgXCIpIH0gOiB0b2tlbnM7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHJlZnJlc2hUb2tlbnMoeyB0b2tlbiB9OiB7IHRva2VuOiBzdHJpbmcgfSkge1xuICAgIGxldCBvcHRpb25zO1xuICAgIGlmICh0aGlzLmJvZHlFbmNvZGluZyA9PT0gXCJ1cmwtZW5jb2RlZFwiKSB7XG4gICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG4gICAgICBwYXJhbXMuYXBwZW5kKFwiY2xpZW50X2lkXCIsIHRoaXMuY2xpZW50SWQpO1xuICAgICAgcGFyYW1zLmFwcGVuZChcInJlZnJlc2hfdG9rZW5cIiwgdG9rZW4pO1xuICAgICAgcGFyYW1zLmFwcGVuZChcImdyYW50X3R5cGVcIiwgXCJyZWZyZXNoX3Rva2VuXCIpO1xuXG4gICAgICBvcHRpb25zID0geyBib2R5OiBwYXJhbXMgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIGNsaWVudF9pZDogdGhpcy5jbGllbnRJZCxcbiAgICAgICAgICByZWZyZXNoX3Rva2VuOiB0b2tlbixcbiAgICAgICAgICBncmFudF90eXBlOiBcInJlZnJlc2hfdG9rZW5cIixcbiAgICAgICAgfSksXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh0aGlzLnJlZnJlc2hUb2tlblVybCA/PyB0aGlzLnRva2VuVXJsLCB7IG1ldGhvZDogXCJQT1NUXCIsIC4uLm9wdGlvbnMgfSk7XG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgY29uc3QgcmVzcG9uc2VUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgY29uc29sZS5lcnJvcihcInJlZnJlc2ggdG9rZW5zIGVycm9yOlwiLCByZXNwb25zZVRleHQpO1xuICAgICAgLy8gSWYgdGhlIHJlZnJlc2ggdG9rZW4gaXMgaW52YWxpZCwgc3RvcCB0aGUgZmxvdyBoZXJlLCBsb2cgb3V0IHRoZSB1c2VyIGFuZCBwcm9tcHQgdGhlbSB0byByZS1hdXRob3JpemUuXG4gICAgICB0aGlzLmNsaWVudC5kZXNjcmlwdGlvbiA9IGAke3RoaXMuY2xpZW50LnByb3ZpZGVyTmFtZX0gbmVlZHMgeW91IHRvIHNpZ24taW4gYWdhaW4uIFByZXNzIOKPjiBvciBjbGljayB0aGUgYnV0dG9uIGJlbG93IHRvIGNvbnRpbnVlLmA7XG4gICAgICBhd2FpdCB0aGlzLmNsaWVudC5yZW1vdmVUb2tlbnMoKTtcbiAgICAgIGF3YWl0IHRoaXMuYXV0aG9yaXplKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHRva2VuUmVzcG9uc2UgPSB0aGlzLnRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyKGF3YWl0IHJlc3BvbnNlLmpzb24oKSk7XG4gICAgICB0b2tlblJlc3BvbnNlLnJlZnJlc2hfdG9rZW4gPSB0b2tlblJlc3BvbnNlLnJlZnJlc2hfdG9rZW4gPz8gdG9rZW47XG4gICAgICByZXR1cm4gdG9rZW5SZXNwb25zZTtcbiAgICB9XG4gIH1cbn1cbiIsICJleHBvcnQgY29uc3QgUFJPVklERVJfQ0xJRU5UX0lEUyA9IHtcbiAgYXNhbmE6IFwiMTE5MTIwMTc0NTY4NDMxMlwiLFxuICBnaXRodWI6IFwiNzIzNWZlOGQ0MjE1N2YxZjM4YzBcIixcbiAgbGluZWFyOiBcImM4ZmYzN2I5MjI1YzNjOWFlZmQ3ZDY2ZWEwZTViNmYxXCIsXG4gIHNsYWNrOiBcIjg1MTc1Njg4NDY5Mi41NTQ2OTI3MjkwMjEyXCIsXG59O1xuIiwgImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGVudmlyb25tZW50LCBPQXV0aCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB0eXBlIHsgT0F1dGhUeXBlLCBPbkF1dGhvcml6ZVBhcmFtcyB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmxldCB0b2tlbjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5sZXQgdHlwZTogT0F1dGhUeXBlIHwgbnVsbCA9IG51bGw7XG5sZXQgYXV0aG9yaXplOiBQcm9taXNlPHN0cmluZz4gfCBudWxsID0gbnVsbDtcbmxldCBnZXRJZFRva2VuOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4gfCBudWxsID0gbnVsbDtcbmxldCBvbkF1dGhvcml6ZTogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xuXG50eXBlIFdpdGhBY2Nlc3NUb2tlblBhcmFtZXRlcnMgPSB7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBpbnN0YW5jZSBvZiBhIFBLQ0UgQ2xpZW50IHRoYXQgeW91IGNhbiBjcmVhdGUgdXNpbmcgUmF5Y2FzdCBBUEkuXG4gICAqIFRoaXMgY2xpZW50IGlzIHVzZWQgdG8gcmV0dXJuIHRoZSBgaWRUb2tlbmAgYXMgcGFydCBvZiB0aGUgYG9uQXV0aG9yaXplYCBjYWxsYmFjay5cbiAgICovXG4gIGNsaWVudD86IE9BdXRoLlBLQ0VDbGllbnQ7XG4gIC8qKlxuICAgKiBBIGZ1bmN0aW9uIHRoYXQgaW5pdGlhdGVzIHRoZSBPQXV0aCB0b2tlbiByZXRyaWV2YWwgcHJvY2Vzc1xuICAgKiBAcmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBhY2Nlc3MgdG9rZW4uXG4gICAqL1xuICBhdXRob3JpemU6ICgpID0+IFByb21pc2U8c3RyaW5nPjtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbmFsIHN0cmluZyB0aGF0IHJlcHJlc2VudHMgYW4gYWxyZWFkeSBvYnRhaW5lZCBwZXJzb25hbCBhY2Nlc3MgdG9rZW5cbiAgICovXG4gIHBlcnNvbmFsQWNjZXNzVG9rZW4/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCBvbmNlIHRoZSB1c2VyIGhhcyBiZWVuIHByb3Blcmx5IGxvZ2dlZCBpbiB0aHJvdWdoIE9BdXRoLlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIC0gUGFyYW1ldGVycyBvZiB0aGUgY2FsbGJhY2tcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9rZW4gLSBUaGUgcmV0cmlldmVkIGFjY2VzcyB0b2tlblxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50eXBlIC0gVGhlIGFjY2VzcyB0b2tlbidzIHR5cGUgKGVpdGhlciBgb2F1dGhgIG9yIGBwZXJzb25hbGApXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmlkVG9rZW4gLSBUaGUgb3B0aW9uYWwgaWQgdG9rZW4uIFRoZSBgaWRUb2tlbmAgaXMgcmV0dXJuZWQgaWYgYG9wdGlvbnMuY2xpZW50YCBpcyBwcm92aWRlZCBhbmQgaWYgaXQncyByZXR1cm5lZCBpbiB0aGUgaW5pdGlhbCB0b2tlbiBzZXQuXG4gICAqL1xuICBvbkF1dGhvcml6ZT86IChwYXJhbXM6IE9uQXV0aG9yaXplUGFyYW1zKSA9PiB2b2lkO1xufTtcblxuLyoqXG4gKiBUaGUgY29tcG9uZW50IChmb3IgYSB2aWV3L21lbnUtYmFyIGNvbW1hbmRzKSBvciBmdW5jdGlvbiAoZm9yIGEgbm8tdmlldyBjb21tYW5kKSB0aGF0IGlzIHBhc3NlZCB0byB3aXRoQWNjZXNzVG9rZW4uXG4gKi9cbmV4cG9ydCB0eXBlIFdpdGhBY2Nlc3NUb2tlbkNvbXBvbmVudE9yRm48VCA9IGFueSwgVSA9IGFueT4gPSAoKHBhcmFtczogVCkgPT4gUHJvbWlzZTxVPiB8IFUpIHwgUmVhY3QuQ29tcG9uZW50VHlwZTxUPjtcblxuLyoqXG4gKiBIaWdoZXItb3JkZXIgY29tcG9uZW50IHRvIHdyYXAgYSBnaXZlbiBjb21wb25lbnQgb3IgZnVuY3Rpb24gYW5kIHNldCBhbiBhY2Nlc3MgdG9rZW4gaW4gYSBzaGFyZWQgZ2xvYmFsIHZhcmlhYmxlLlxuICpcbiAqIFRoZSBmdW5jdGlvbiBpbnRlcmNlcHRzIHRoZSBjb21wb25lbnQgcmVuZGVyaW5nIHByb2Nlc3MgdG8gZWl0aGVyIGZldGNoIGFuIE9BdXRoIHRva2VuIGFzeW5jaHJvbm91c2x5XG4gKiBvciB1c2UgYSBwcm92aWRlZCBwZXJzb25hbCBhY2Nlc3MgdG9rZW4uIEEgZ2xvYmFsIHZhcmlhYmxlIHdpbGwgYmUgdGhlbiBzZXQgd2l0aCB0aGUgcmVjZWl2ZWQgdG9rZW5cbiAqIHRoYXQgeW91IGNhbiBnZXQgd2l0aCB0aGUgYGdldEFjY2Vzc1Rva2VuYCBmdW5jdGlvbi5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgRGV0YWlsIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgT0F1dGhTZXJ2aWNlLCBnZXRBY2Nlc3NUb2tlbiwgd2l0aEFjY2Vzc1Rva2VuIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKlxuICogY29uc3QgZ2l0aHViID0gT0F1dGhTZXJ2aWNlLmdpdGh1Yih7IHNjb3BlOiBcIm5vdGlmaWNhdGlvbnMgcmVwbyByZWFkOm9yZyByZWFkOnVzZXIgcmVhZDpwcm9qZWN0XCIgfSk7XG4gKlxuICogZnVuY3Rpb24gQXV0aG9yaXplZENvbXBvbmVudCgpIHtcbiAqICBjb25zdCB7IHRva2VuIH0gPSBnZXRBY2Nlc3NUb2tlbigpO1xuICogIC4uLlxuICogfVxuICpcbiAqIGV4cG9ydCBkZWZhdWx0IHdpdGhBY2Nlc3NUb2tlbihnaXRodWIpKEF1dGhvcml6ZWRDb21wb25lbnQpO1xuICogYGBgXG4gKlxuICogQHJldHVybnMge1JlYWN0LkNvbXBvbmVudFR5cGU8VD59IFRoZSB3cmFwcGVkIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhBY2Nlc3NUb2tlbjxUID0gYW55LCBVID0gYW55PihcbiAgb3B0aW9uczogV2l0aEFjY2Vzc1Rva2VuUGFyYW1ldGVycyxcbik6IDxWIGV4dGVuZHMgV2l0aEFjY2Vzc1Rva2VuQ29tcG9uZW50T3JGbjxULCBVPj4oXG4gIGZuT3JDb21wb25lbnQ6IFYsXG4pID0+IFYgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnRUeXBlPFQ+ID8gUmVhY3QuRnVuY3Rpb25Db21wb25lbnQ8VD4gOiAocHJvcHM6IFQpID0+IFByb21pc2U8VT47XG5leHBvcnQgZnVuY3Rpb24gd2l0aEFjY2Vzc1Rva2VuPFQ+KG9wdGlvbnM6IFdpdGhBY2Nlc3NUb2tlblBhcmFtZXRlcnMpIHtcbiAgaWYgKGVudmlyb25tZW50LmNvbW1hbmRNb2RlID09PSBcIm5vLXZpZXdcIikge1xuICAgIHJldHVybiAoZm46IChwcm9wczogVCkgPT4gUHJvbWlzZTx2b2lkPiB8ICgoKSA9PiB2b2lkKSkgPT4ge1xuICAgICAgY29uc3Qgbm9WaWV3Rm4gPSBhc3luYyAocHJvcHM6IFQpID0+IHtcbiAgICAgICAgaWYgKCF0b2tlbikge1xuICAgICAgICAgIHRva2VuID0gb3B0aW9ucy5wZXJzb25hbEFjY2Vzc1Rva2VuID8/IChhd2FpdCBvcHRpb25zLmF1dGhvcml6ZSgpKTtcbiAgICAgICAgICB0eXBlID0gb3B0aW9ucy5wZXJzb25hbEFjY2Vzc1Rva2VuID8gXCJwZXJzb25hbFwiIDogXCJvYXV0aFwiO1xuICAgICAgICAgIGNvbnN0IGlkVG9rZW4gPSAoYXdhaXQgb3B0aW9ucy5jbGllbnQ/LmdldFRva2VucygpKT8uaWRUb2tlbjtcblxuICAgICAgICAgIGlmIChvcHRpb25zLm9uQXV0aG9yaXplKSB7XG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLnJlc29sdmUob3B0aW9ucy5vbkF1dGhvcml6ZSh7IHRva2VuLCB0eXBlLCBpZFRva2VuIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm4ocHJvcHMpO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIG5vVmlld0ZuO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gKENvbXBvbmVudDogUmVhY3QuQ29tcG9uZW50VHlwZTxUPikgPT4ge1xuICAgIGNvbnN0IFdyYXBwZWRDb21wb25lbnQ6IFJlYWN0LkNvbXBvbmVudFR5cGU8VD4gPSAocHJvcHMpID0+IHtcbiAgICAgIGlmIChvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW4pIHtcbiAgICAgICAgdG9rZW4gPSBvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW47XG4gICAgICAgIHR5cGUgPSBcInBlcnNvbmFsXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIWF1dGhvcml6ZSkge1xuICAgICAgICAgIGF1dGhvcml6ZSA9IG9wdGlvbnMuYXV0aG9yaXplKCk7XG4gICAgICAgIH1cbiAgICAgICAgdG9rZW4gPSBSZWFjdC51c2UoYXV0aG9yaXplKTtcbiAgICAgICAgdHlwZSA9IFwib2F1dGhcIjtcbiAgICAgIH1cblxuICAgICAgbGV0IGlkVG9rZW46IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgIGlmIChvcHRpb25zLmNsaWVudCkge1xuICAgICAgICBpZiAoIWdldElkVG9rZW4pIHtcbiAgICAgICAgICBnZXRJZFRva2VuID0gb3B0aW9ucy5jbGllbnQ/LmdldFRva2VucygpLnRoZW4oKHRva2VucykgPT4gdG9rZW5zPy5pZFRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBpZFRva2VuID0gUmVhY3QudXNlKGdldElkVG9rZW4pO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5vbkF1dGhvcml6ZSkge1xuICAgICAgICBpZiAoIW9uQXV0aG9yaXplKSB7XG4gICAgICAgICAgb25BdXRob3JpemUgPSBQcm9taXNlLnJlc29sdmUob3B0aW9ucy5vbkF1dGhvcml6ZSh7IHRva2VuOiB0b2tlbiEsIHR5cGUsIGlkVG9rZW4gfSkpO1xuICAgICAgICB9XG4gICAgICAgIFJlYWN0LnVzZShvbkF1dGhvcml6ZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAgIC8vIEB0cy1pZ25vcmUgdG9vIGNvbXBsaWNhdGVkIGZvciBUU1xuICAgICAgcmV0dXJuIDxDb21wb25lbnQgey4uLnByb3BzfSAvPjtcbiAgICB9O1xuXG4gICAgV3JhcHBlZENvbXBvbmVudC5kaXNwbGF5TmFtZSA9IGB3aXRoQWNjZXNzVG9rZW4oJHtDb21wb25lbnQuZGlzcGxheU5hbWUgfHwgQ29tcG9uZW50Lm5hbWV9KWA7XG5cbiAgICByZXR1cm4gV3JhcHBlZENvbXBvbmVudDtcbiAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBhY2Nlc3MgdG9rZW4gYW5kIGl0cyB0eXBlLiBOb3RlIHRoYXQgdGhpcyBmdW5jdGlvbiBtdXN0IGJlIGNhbGxlZCBpbiBhIGNvbXBvbmVudCB3cmFwcGVkIHdpdGggYHdpdGhBY2Nlc3NUb2tlbmAuXG4gKlxuICogV2lsbCB0aHJvdyBhbiBFcnJvciBpZiBjYWxsZWQgb3V0c2lkZSBvZiBhIGZ1bmN0aW9uIG9yIGNvbXBvbmVudCB3cmFwcGVkIHdpdGggYHdpdGhBY2Nlc3NUb2tlbmBcbiAqXG4gKiBAcmV0dXJucyB7eyB0b2tlbjogc3RyaW5nLCB0eXBlOiBcIm9hdXRoXCIgfCBcInBlcnNvbmFsXCIgfX0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGB0b2tlbmBcbiAqIGFuZCBpdHMgYHR5cGVgLCB3aGVyZSB0eXBlIGNhbiBiZSBlaXRoZXIgJ29hdXRoJyBmb3IgT0F1dGggdG9rZW5zIG9yICdwZXJzb25hbCcgZm9yIGFcbiAqIHBlcnNvbmFsIGFjY2VzcyB0b2tlbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFjY2Vzc1Rva2VuKCk6IHtcbiAgdG9rZW46IHN0cmluZztcbiAgLyoqIGBvYXV0aGAgZm9yIE9BdXRoIHRva2VucyBvciBgcGVyc29uYWxgIGZvciBwZXJzb25hbCBhY2Nlc3MgdG9rZW4gKi9cbiAgdHlwZTogXCJvYXV0aFwiIHwgXCJwZXJzb25hbFwiO1xufSB7XG4gIGlmICghdG9rZW4gfHwgIXR5cGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJnZXRBY2Nlc3NUb2tlbiBtdXN0IGJlIHVzZWQgd2hlbiBhdXRoZW50aWNhdGVkIChlZy4gdXNlZCBpbnNpZGUgYHdpdGhBY2Nlc3NUb2tlbmApXCIpO1xuICB9XG5cbiAgcmV0dXJuIHsgdG9rZW4sIHR5cGUgfTtcbn1cbiIsICJpbXBvcnQgeyBlbnZpcm9ubWVudCwgTGF1bmNoUHJvcHMsIExhdW5jaFR5cGUgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgZnMgZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcblxuZXhwb3J0IGVudW0gRGVlcGxpbmtUeXBlIHtcbiAgLyoqIEEgc2NyaXB0IGNvbW1hbmQgKi9cbiAgU2NyaXB0Q29tbWFuZCA9IFwic2NyaXB0LWNvbW1hbmRcIixcbiAgLyoqIEFuIGV4dGVuc2lvbiBjb21tYW5kICovXG4gIEV4dGVuc2lvbiA9IFwiZXh0ZW5zaW9uXCIsXG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgY3JlYXRpbmcgYSBkZWVwbGluayB0byBhIHNjcmlwdCBjb21tYW5kLlxuICovXG5leHBvcnQgdHlwZSBDcmVhdGVTY3JpcHRDb21tYW5kRGVlcGxpbmtPcHRpb25zID0ge1xuICAvKipcbiAgICogVGhlIHR5cGUgb2YgZGVlcGxpbmssIHdoaWNoIHNob3VsZCBiZSBcInNjcmlwdC1jb21tYW5kXCIuXG4gICAqL1xuICB0eXBlOiBEZWVwbGlua1R5cGUuU2NyaXB0Q29tbWFuZDtcbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBjb21tYW5kLlxuICAgKi9cbiAgY29tbWFuZDogc3RyaW5nO1xuICAvKipcbiAgICogSWYgdGhlIGNvbW1hbmQgYWNjZXB0cyBhcmd1bWVudHMsIHRoZXkgY2FuIGJlIHBhc3NlZCB1c2luZyB0aGlzIHF1ZXJ5IHBhcmFtZXRlci5cbiAgICovXG4gIGFyZ3VtZW50cz86IHN0cmluZ1tdO1xufTtcblxuLyoqXG4gKiBCYXNlIG9wdGlvbnMgZm9yIGNyZWF0aW5nIGEgZGVlcGxpbmsgdG8gYW4gZXh0ZW5zaW9uLlxuICovXG5leHBvcnQgdHlwZSBDcmVhdGVFeHRlbnNpb25EZWVwbGlua0Jhc2VPcHRpb25zID0ge1xuICAvKipcbiAgICogVGhlIHR5cGUgb2YgZGVlcGxpbmssIHdoaWNoIHNob3VsZCBiZSBcImV4dGVuc2lvblwiLlxuICAgKi9cbiAgdHlwZT86IERlZXBsaW5rVHlwZS5FeHRlbnNpb247XG4gIC8qKlxuICAgKiBUaGUgY29tbWFuZCBhc3NvY2lhdGVkIHdpdGggdGhlIGV4dGVuc2lvbi5cbiAgICovXG4gIGNvbW1hbmQ6IHN0cmluZztcbiAgLyoqXG4gICAqIEVpdGhlciBcInVzZXJJbml0aWF0ZWRcIiwgd2hpY2ggcnVucyB0aGUgY29tbWFuZCBpbiB0aGUgZm9yZWdyb3VuZCwgb3IgXCJiYWNrZ3JvdW5kXCIsIHdoaWNoIHNraXBzIGJyaW5naW5nIFJheWNhc3QgdG8gdGhlIGZyb250LlxuICAgKi9cbiAgbGF1bmNoVHlwZT86IExhdW5jaFR5cGU7XG4gIC8qKlxuICAgKiBJZiB0aGUgY29tbWFuZCBhY2NlcHRzIGFyZ3VtZW50cywgdGhleSBjYW4gYmUgcGFzc2VkIHVzaW5nIHRoaXMgcXVlcnkgcGFyYW1ldGVyLlxuICAgKi9cbiAgYXJndW1lbnRzPzogTGF1bmNoUHJvcHNbXCJhcmd1bWVudHNcIl07XG4gIC8qKlxuICAgKiBJZiB0aGUgY29tbWFuZCBtYWtlIHVzZSBvZiBMYXVuY2hDb250ZXh0LCBpdCBjYW4gYmUgcGFzc2VkIHVzaW5nIHRoaXMgcXVlcnkgcGFyYW1ldGVyLlxuICAgKi9cbiAgY29udGV4dD86IExhdW5jaFByb3BzW1wibGF1bmNoQ29udGV4dFwiXTtcbiAgLyoqXG4gICAqIFNvbWUgdGV4dCB0byBwcmVmaWxsIHRoZSBzZWFyY2ggYmFyIG9yIGZpcnN0IHRleHQgaW5wdXQgb2YgdGhlIGNvbW1hbmRcbiAgICovXG4gIGZhbGxiYWNrVGV4dD86IHN0cmluZztcbn07XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgY3JlYXRpbmcgYSBkZWVwbGluayB0byBhbiBleHRlbnNpb24gZnJvbSBhbm90aGVyIGV4dGVuc2lvbi5cbiAqIFJlcXVpcmVzIGJvdGggdGhlIG93bmVyT3JBdXRob3JOYW1lIGFuZCBleHRlbnNpb25OYW1lLlxuICovXG5leHBvcnQgdHlwZSBDcmVhdGVJbnRlckV4dGVuc2lvbkRlZXBsaW5rT3B0aW9ucyA9IENyZWF0ZUV4dGVuc2lvbkRlZXBsaW5rQmFzZU9wdGlvbnMgJiB7XG4gIC8qKlxuICAgKiBUaGUgbmFtZSBvZiB0aGUgb3duZXIgb3IgYXV0aG9yIG9mIHRoZSBleHRlbnNpb24uXG4gICAqL1xuICBvd25lck9yQXV0aG9yTmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIGV4dGVuc2lvbi5cbiAgICovXG4gIGV4dGVuc2lvbk5hbWU6IHN0cmluZztcbn07XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgY3JlYXRpbmcgYSBkZWVwbGluayB0byBhbiBleHRlbnNpb24uXG4gKi9cbmV4cG9ydCB0eXBlIENyZWF0ZUV4dGVuc2lvbkRlZXBsaW5rT3B0aW9ucyA9IENyZWF0ZUludGVyRXh0ZW5zaW9uRGVlcGxpbmtPcHRpb25zIHwgQ3JlYXRlRXh0ZW5zaW9uRGVlcGxpbmtCYXNlT3B0aW9ucztcblxuLyoqXG4gKiBPcHRpb25zIGZvciBjcmVhdGluZyBhIGRlZXBsaW5rLlxuICovXG5leHBvcnQgdHlwZSBDcmVhdGVEZWVwbGlua09wdGlvbnMgPSBDcmVhdGVTY3JpcHRDb21tYW5kRGVlcGxpbmtPcHRpb25zIHwgQ3JlYXRlRXh0ZW5zaW9uRGVlcGxpbmtPcHRpb25zO1xuXG5mdW5jdGlvbiBnZXRQcm90b2NvbCgpIHtcbiAgcmV0dXJuIGVudmlyb25tZW50LnJheWNhc3RWZXJzaW9uLmluY2x1ZGVzKFwiYWxwaGFcIikgPyBcInJheWNhc3RpbnRlcm5hbDovL1wiIDogXCJyYXljYXN0Oi8vXCI7XG59XG5cbmZ1bmN0aW9uIGdldE93bmVyT3JBdXRob3JOYW1lKCkge1xuICBjb25zdCBwYWNrYWdlSlNPTiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihlbnZpcm9ubWVudC5hc3NldHNQYXRoLCBcIi4uXCIsIFwicGFja2FnZS5qc29uXCIpLCBcInV0ZjhcIikpO1xuICByZXR1cm4gcGFja2FnZUpTT04ub3duZXIgfHwgcGFja2FnZUpTT04uYXV0aG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2NyaXB0Q29tbWFuZERlZXBsaW5rKG9wdGlvbnM6IENyZWF0ZVNjcmlwdENvbW1hbmREZWVwbGlua09wdGlvbnMpOiBzdHJpbmcge1xuICBsZXQgdXJsID0gYCR7Z2V0UHJvdG9jb2woKX1zY3JpcHQtY29tbWFuZHMvJHtvcHRpb25zLmNvbW1hbmR9YDtcblxuICBpZiAob3B0aW9ucy5hcmd1bWVudHMpIHtcbiAgICBsZXQgcGFyYW1zID0gXCJcIjtcbiAgICBmb3IgKGNvbnN0IGFyZyBvZiBvcHRpb25zLmFyZ3VtZW50cykge1xuICAgICAgcGFyYW1zICs9IFwiJmFyZ3VtZW50cz1cIiArIGVuY29kZVVSSUNvbXBvbmVudChhcmcpO1xuICAgIH1cbiAgICB1cmwgKz0gXCI/XCIgKyBwYXJhbXMuc3Vic3RyaW5nKDEpO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV4dGVuc2lvbkRlZXBsaW5rKG9wdGlvbnM6IENyZWF0ZUV4dGVuc2lvbkRlZXBsaW5rT3B0aW9ucyk6IHN0cmluZyB7XG4gIGxldCBvd25lck9yQXV0aG9yTmFtZSA9IGdldE93bmVyT3JBdXRob3JOYW1lKCk7XG4gIGxldCBleHRlbnNpb25OYW1lID0gZW52aXJvbm1lbnQuZXh0ZW5zaW9uTmFtZTtcblxuICBpZiAoXCJvd25lck9yQXV0aG9yTmFtZVwiIGluIG9wdGlvbnMgJiYgXCJleHRlbnNpb25OYW1lXCIgaW4gb3B0aW9ucykge1xuICAgIG93bmVyT3JBdXRob3JOYW1lID0gb3B0aW9ucy5vd25lck9yQXV0aG9yTmFtZTtcbiAgICBleHRlbnNpb25OYW1lID0gb3B0aW9ucy5leHRlbnNpb25OYW1lO1xuICB9XG5cbiAgbGV0IHVybCA9IGAke2dldFByb3RvY29sKCl9ZXh0ZW5zaW9ucy8ke293bmVyT3JBdXRob3JOYW1lfS8ke2V4dGVuc2lvbk5hbWV9LyR7b3B0aW9ucy5jb21tYW5kfWA7XG5cbiAgbGV0IHBhcmFtcyA9IFwiXCI7XG4gIGlmIChvcHRpb25zLmxhdW5jaFR5cGUpIHtcbiAgICBwYXJhbXMgKz0gXCImbGF1bmNoVHlwZT1cIiArIGVuY29kZVVSSUNvbXBvbmVudChvcHRpb25zLmxhdW5jaFR5cGUpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuYXJndW1lbnRzKSB7XG4gICAgcGFyYW1zICs9IFwiJmFyZ3VtZW50cz1cIiArIGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShvcHRpb25zLmFyZ3VtZW50cykpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuY29udGV4dCkge1xuICAgIHBhcmFtcyArPSBcIiZjb250ZXh0PVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuY29udGV4dCkpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuZmFsbGJhY2tUZXh0KSB7XG4gICAgcGFyYW1zICs9IFwiJmZhbGxiYWNrVGV4dD1cIiArIGVuY29kZVVSSUNvbXBvbmVudChvcHRpb25zLmZhbGxiYWNrVGV4dCk7XG4gIH1cblxuICBpZiAocGFyYW1zKSB7XG4gICAgdXJsICs9IFwiP1wiICsgcGFyYW1zLnN1YnN0cmluZygxKTtcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlZXBsaW5rIHRvIGEgc2NyaXB0IGNvbW1hbmQgb3IgZXh0ZW5zaW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVlcGxpbmsob3B0aW9uczogQ3JlYXRlRGVlcGxpbmtPcHRpb25zKTogc3RyaW5nIHtcbiAgaWYgKG9wdGlvbnMudHlwZSA9PT0gRGVlcGxpbmtUeXBlLlNjcmlwdENvbW1hbmQpIHtcbiAgICByZXR1cm4gY3JlYXRlU2NyaXB0Q29tbWFuZERlZXBsaW5rKG9wdGlvbnMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjcmVhdGVFeHRlbnNpb25EZWVwbGluayhvcHRpb25zKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IGJhc2VFeGVjdXRlU1FMIH0gZnJvbSBcIi4vc3FsLXV0aWxzXCI7XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBTUUwgcXVlcnkgb24gYSBsb2NhbCBTUUxpdGUgZGF0YWJhc2UgYW5kIHJldHVybnMgdGhlIHF1ZXJ5IHJlc3VsdCBpbiBKU09OIGZvcm1hdC5cbiAqXG4gKiBAcGFyYW0gZGF0YWJhc2VQYXRoIC0gVGhlIHBhdGggdG8gdGhlIFNRTGl0ZSBkYXRhYmFzZSBmaWxlLlxuICogQHBhcmFtIHF1ZXJ5IC0gVGhlIFNRTCBxdWVyeSB0byBleGVjdXRlLlxuICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgdGhlIHF1ZXJ5IHJlc3VsdHMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IGNsb3NlTWFpbldpbmRvdywgQ2xpcGJvYXJkIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgZXhlY3V0ZVNRTCB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICpcbiAqIHR5cGUgTWVzc2FnZSA9IHsgYm9keTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfTtcbiAqXG4gKiBjb25zdCBEQl9QQVRIID0gXCIvcGF0aC90by9jaGF0LmRiXCI7XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gQ29tbWFuZCgpIHtcbiAqICAgY29uc3QgcXVlcnkgPSBgU0VMRUNUIGJvZHksIGNvZGUgRlJPTSAuLi5gXG4gKlxuICogICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGV4ZWN1dGVTUUw8TWVzc2FnZT4oREJfUEFUSCwgcXVlcnkpO1xuICpcbiAqICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAqICAgICBjb25zdCBsYXRlc3RDb2RlID0gbWVzc2FnZXNbMF0uY29kZTtcbiAqICAgICBhd2FpdCBDbGlwYm9hcmQucGFzdGUobGF0ZXN0Q29kZSk7XG4gKiAgICAgYXdhaXQgY2xvc2VNYWluV2luZG93KCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZVNRTDxUID0gdW5rbm93bj4oZGF0YWJhc2VQYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGJhc2VFeGVjdXRlU1FMPFQ+KGRhdGFiYXNlUGF0aCwgcXVlcnkpO1xufVxuIiwgImltcG9ydCBjaGlsZFByb2Nlc3MgZnJvbSBcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHtcbiAgZGVmYXVsdFBhcnNpbmcsXG4gIGdldFNwYXduZWRQcm9taXNlLFxuICBnZXRTcGF3bmVkUmVzdWx0LFxuICBoYW5kbGVPdXRwdXQsXG4gIFBhcnNlRXhlY091dHB1dEhhbmRsZXIsXG59IGZyb20gXCIuL2V4ZWMtdXRpbHNcIjtcblxudHlwZSBBcHBsZVNjcmlwdE9wdGlvbnMgPSB7XG4gIC8qKlxuICAgKiBCeSBkZWZhdWx0LCBgcnVuQXBwbGVTY3JpcHRgIHJldHVybnMgaXRzIHJlc3VsdHMgaW4gaHVtYW4tcmVhZGFibGUgZm9ybTogc3RyaW5ncyBkbyBub3QgaGF2ZSBxdW90ZXMgYXJvdW5kIHRoZW0sIGNoYXJhY3RlcnMgYXJlIG5vdCBlc2NhcGVkLCBicmFjZXMgZm9yIGxpc3RzIGFuZCByZWNvcmRzIGFyZSBvbWl0dGVkLCBldGMuIFRoaXMgaXMgZ2VuZXJhbGx5IG1vcmUgdXNlZnVsLCBidXQgY2FuIGludHJvZHVjZSBhbWJpZ3VpdGllcy4gRm9yIGV4YW1wbGUsIHRoZSBsaXN0cyBge1wiZm9vXCIsIFwiYmFyXCJ9YCBhbmQgYHt7XCJmb29cIiwge1wiYmFyXCJ9fX1gIHdvdWxkIGJvdGggYmUgZGlzcGxheWVkIGFzIOKAmGZvbywgYmFy4oCZLiBUbyBzZWUgdGhlIHJlc3VsdHMgaW4gYW4gdW5hbWJpZ3VvdXMgZm9ybSB0aGF0IGNvdWxkIGJlIHJlY29tcGlsZWQgaW50byB0aGUgc2FtZSB2YWx1ZSwgc2V0IGBodW1hblJlYWRhYmxlT3V0cHV0YCB0byBgZmFsc2VgLlxuICAgKlxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBodW1hblJlYWRhYmxlT3V0cHV0PzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHNjcmlwdCBpcyB1c2luZyBbYEFwcGxlU2NyaXB0YF0oaHR0cHM6Ly9kZXZlbG9wZXIuYXBwbGUuY29tL2xpYnJhcnkvYXJjaGl2ZS9kb2N1bWVudGF0aW9uL0FwcGxlU2NyaXB0L0NvbmNlcHR1YWwvQXBwbGVTY3JpcHRMYW5nR3VpZGUvaW50cm9kdWN0aW9uL0FTTFJfaW50cm8uaHRtbCMvL2FwcGxlX3JlZi9kb2MvdWlkL1RQNDAwMDA5ODMpIG9yIFtgSmF2YVNjcmlwdGBdKGh0dHBzOi8vZGV2ZWxvcGVyLmFwcGxlLmNvbS9saWJyYXJ5L2FyY2hpdmUvcmVsZWFzZW5vdGVzL0ludGVyYXBwbGljYXRpb25Db21tdW5pY2F0aW9uL1JOLUphdmFTY3JpcHRGb3JBdXRvbWF0aW9uL0FydGljbGVzL0ludHJvZHVjdGlvbi5odG1sIy8vYXBwbGVfcmVmL2RvYy91aWQvVFA0MDAxNDUwOC1DSDExMS1TVzEpLlxuICAgKlxuICAgKiBAZGVmYXVsdCBcIkFwcGxlU2NyaXB0XCJcbiAgICovXG4gIGxhbmd1YWdlPzogXCJBcHBsZVNjcmlwdFwiIHwgXCJKYXZhU2NyaXB0XCI7XG4gIC8qKlxuICAgKiBBIFNpZ25hbCBvYmplY3QgdGhhdCBhbGxvd3MgeW91IHRvIGFib3J0IHRoZSByZXF1ZXN0IGlmIHJlcXVpcmVkIHZpYSBhbiBBYm9ydENvbnRyb2xsZXIgb2JqZWN0LlxuICAgKi9cbiAgc2lnbmFsPzogQWJvcnRTaWduYWw7XG4gIC8qKiBJZiB0aW1lb3V0IGlzIGdyZWF0ZXIgdGhhbiBgMGAsIHRoZSBwYXJlbnQgd2lsbCBzZW5kIHRoZSBzaWduYWwgYFNJR1RFUk1gIGlmIHRoZSBjaGlsZCBydW5zIGxvbmdlciB0aGFuIHRpbWVvdXQgbWlsbGlzZWNvbmRzLlxuICAgKlxuICAgKiBAZGVmYXVsdCAxMDAwMFxuICAgKi9cbiAgdGltZW91dD86IG51bWJlcjtcbn07XG5cbi8qKlxuICogRXhlY3V0ZXMgYW4gQXBwbGVTY3JpcHQgc2NyaXB0LlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBzaG93SFVEIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgcnVuQXBwbGVTY3JpcHQsIHNob3dGYWlsdXJlVG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gKiAgIHRyeSB7XG4gKiAgICAgY29uc3QgcmVzID0gYXdhaXQgcnVuQXBwbGVTY3JpcHQoXG4gKiAgICAgICBgXG4gKiAgICAgICBvbiBydW4gYXJndlxuICogICAgICAgICByZXR1cm4gXCJoZWxsbywgXCIgJiBpdGVtIDEgb2YgYXJndiAmIFwiLlwiXG4gKiAgICAgICBlbmQgcnVuXG4gKiAgICAgICBgLFxuICogICAgICAgW1wid29ybGRcIl1cbiAqICAgICApO1xuICogICAgIGF3YWl0IHNob3dIVUQocmVzKTtcbiAqICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgICBzaG93RmFpbHVyZVRvYXN0KGVycm9yLCB7IHRpdGxlOiBcIkNvdWxkIG5vdCBydW4gQXBwbGVTY3JpcHRcIiB9KTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5BcHBsZVNjcmlwdDxUID0gc3RyaW5nPihcbiAgc2NyaXB0OiBzdHJpbmcsXG4gIG9wdGlvbnM/OiBBcHBsZVNjcmlwdE9wdGlvbnMgJiB7XG4gICAgcGFyc2VPdXRwdXQ/OiBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFQsIHN0cmluZywgQXBwbGVTY3JpcHRPcHRpb25zPjtcbiAgfSxcbik6IFByb21pc2U8c3RyaW5nPjtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5BcHBsZVNjcmlwdDxUID0gc3RyaW5nPihcbiAgc2NyaXB0OiBzdHJpbmcsXG4gIC8qKlxuICAgKiBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIHNjcmlwdC5cbiAgICovXG4gIGFyZ3M6IHN0cmluZ1tdLFxuICBvcHRpb25zPzogQXBwbGVTY3JpcHRPcHRpb25zICYge1xuICAgIHBhcnNlT3V0cHV0PzogUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBzdHJpbmcsIEFwcGxlU2NyaXB0T3B0aW9ucz47XG4gIH0sXG4pOiBQcm9taXNlPHN0cmluZz47XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuQXBwbGVTY3JpcHQ8VCA9IHN0cmluZz4oXG4gIHNjcmlwdDogc3RyaW5nLFxuICBvcHRpb25zT3JBcmdzPzpcbiAgICB8IHN0cmluZ1tdXG4gICAgfCAoQXBwbGVTY3JpcHRPcHRpb25zICYge1xuICAgICAgICBwYXJzZU91dHB1dD86IFBhcnNlRXhlY091dHB1dEhhbmRsZXI8VCwgc3RyaW5nLCBBcHBsZVNjcmlwdE9wdGlvbnM+O1xuICAgICAgfSksXG4gIG9wdGlvbnM/OiBBcHBsZVNjcmlwdE9wdGlvbnMgJiB7XG4gICAgcGFyc2VPdXRwdXQ/OiBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFQsIHN0cmluZywgQXBwbGVTY3JpcHRPcHRpb25zPjtcbiAgfSxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSBcImRhcndpblwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQXBwbGVTY3JpcHQgaXMgb25seSBzdXBwb3J0ZWQgb24gbWFjT1NcIik7XG4gIH1cblxuICBjb25zdCB7IGh1bWFuUmVhZGFibGVPdXRwdXQsIGxhbmd1YWdlLCB0aW1lb3V0LCAuLi5leGVjT3B0aW9ucyB9ID0gQXJyYXkuaXNBcnJheShvcHRpb25zT3JBcmdzKVxuICAgID8gb3B0aW9ucyB8fCB7fVxuICAgIDogb3B0aW9uc09yQXJncyB8fCB7fTtcblxuICBjb25zdCBvdXRwdXRBcmd1bWVudHMgPSBodW1hblJlYWRhYmxlT3V0cHV0ICE9PSBmYWxzZSA/IFtdIDogW1wiLXNzXCJdO1xuICBpZiAobGFuZ3VhZ2UgPT09IFwiSmF2YVNjcmlwdFwiKSB7XG4gICAgb3V0cHV0QXJndW1lbnRzLnB1c2goXCItbFwiLCBcIkphdmFTY3JpcHRcIik7XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9uc09yQXJncykpIHtcbiAgICBvdXRwdXRBcmd1bWVudHMucHVzaChcIi1cIiwgLi4ub3B0aW9uc09yQXJncyk7XG4gIH1cblxuICBjb25zdCBzcGF3bmVkID0gY2hpbGRQcm9jZXNzLnNwYXduKFwib3Nhc2NyaXB0XCIsIG91dHB1dEFyZ3VtZW50cywge1xuICAgIC4uLmV4ZWNPcHRpb25zLFxuICAgIGVudjogeyBQQVRIOiBcIi91c3IvbG9jYWwvYmluOi91c3IvYmluOi9iaW46L3Vzci9zYmluOi9zYmluXCIgfSxcbiAgfSk7XG4gIGNvbnN0IHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCwgeyB0aW1lb3V0OiB0aW1lb3V0ID8/IDEwMDAwIH0pO1xuXG4gIHNwYXduZWQuc3RkaW4uZW5kKHNjcmlwdCk7XG5cbiAgY29uc3QgW3sgZXJyb3IsIGV4aXRDb2RlLCBzaWduYWwsIHRpbWVkT3V0IH0sIHN0ZG91dFJlc3VsdCwgc3RkZXJyUmVzdWx0XSA9IGF3YWl0IGdldFNwYXduZWRSZXN1bHQ8c3RyaW5nPihcbiAgICBzcGF3bmVkLFxuICAgIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0sXG4gICAgc3Bhd25lZFByb21pc2UsXG4gICk7XG4gIGNvbnN0IHN0ZG91dCA9IGhhbmRsZU91dHB1dCh7IHN0cmlwRmluYWxOZXdsaW5lOiB0cnVlIH0sIHN0ZG91dFJlc3VsdCk7XG4gIGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dCh7IHN0cmlwRmluYWxOZXdsaW5lOiB0cnVlIH0sIHN0ZGVyclJlc3VsdCk7XG5cbiAgcmV0dXJuIGRlZmF1bHRQYXJzaW5nKHtcbiAgICBzdGRvdXQsXG4gICAgc3RkZXJyLFxuICAgIGVycm9yLFxuICAgIGV4aXRDb2RlLFxuICAgIHNpZ25hbCxcbiAgICB0aW1lZE91dCxcbiAgICBjb21tYW5kOiBcIm9zYXNjcmlwdFwiLFxuICAgIG9wdGlvbnMsXG4gICAgcGFyZW50RXJyb3I6IG5ldyBFcnJvcigpLFxuICB9KTtcbn1cbiIsICJpbXBvcnQgY2hpbGRQcm9jZXNzIGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7XG4gIGRlZmF1bHRQYXJzaW5nLFxuICBnZXRTcGF3bmVkUHJvbWlzZSxcbiAgZ2V0U3Bhd25lZFJlc3VsdCxcbiAgaGFuZGxlT3V0cHV0LFxuICBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyLFxufSBmcm9tIFwiLi9leGVjLXV0aWxzXCI7XG5cbnR5cGUgUG93ZXJTaGVsbFNjcmlwdE9wdGlvbnMgPSB7XG4gIC8qKlxuICAgKiBBIFNpZ25hbCBvYmplY3QgdGhhdCBhbGxvd3MgeW91IHRvIGFib3J0IHRoZSByZXF1ZXN0IGlmIHJlcXVpcmVkIHZpYSBhbiBBYm9ydENvbnRyb2xsZXIgb2JqZWN0LlxuICAgKi9cbiAgc2lnbmFsPzogQWJvcnRTaWduYWw7XG4gIC8qKiBJZiB0aW1lb3V0IGlzIGdyZWF0ZXIgdGhhbiBgMGAsIHRoZSBwYXJlbnQgd2lsbCBzZW5kIHRoZSBzaWduYWwgYFNJR1RFUk1gIGlmIHRoZSBjaGlsZCBydW5zIGxvbmdlciB0aGFuIHRpbWVvdXQgbWlsbGlzZWNvbmRzLlxuICAgKlxuICAgKiBAZGVmYXVsdCAxMDAwMFxuICAgKi9cbiAgdGltZW91dD86IG51bWJlcjtcbn07XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBQb3dlclNoZWxsIHNjcmlwdC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgc2hvd0hVRCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHJ1blBvd2VyU2hlbGxTY3JpcHQsIHNob3dGYWlsdXJlVG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gKiAgIHRyeSB7XG4gKiAgICAgY29uc3QgcmVzID0gYXdhaXQgcnVuUG93ZXJTaGVsbFNjcmlwdChcbiAqICAgICAgIGBcbiAqICAgICAgIFdyaXRlLUhvc3QgXCJoZWxsbywgd29ybGQuXCJcbiAqICAgICAgIGAsXG4gKiAgICAgKTtcbiAqICAgICBhd2FpdCBzaG93SFVEKHJlcyk7XG4gKiAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgICAgc2hvd0ZhaWx1cmVUb2FzdChlcnJvciwgeyB0aXRsZTogXCJDb3VsZCBub3QgcnVuIFBvd2VyU2hlbGxcIiB9KTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Qb3dlclNoZWxsU2NyaXB0PFQgPSBzdHJpbmc+KFxuICBzY3JpcHQ6IHN0cmluZyxcbiAgb3B0aW9ucz86IFBvd2VyU2hlbGxTY3JpcHRPcHRpb25zICYge1xuICAgIHBhcnNlT3V0cHV0PzogUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBzdHJpbmcsIFBvd2VyU2hlbGxTY3JpcHRPcHRpb25zPjtcbiAgfSxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSBcIndpbjMyXCIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJQb3dlclNoZWxsIGlzIG9ubHkgc3VwcG9ydGVkIG9uIFdpbmRvd3NcIik7XG4gIH1cblxuICBjb25zdCB7IHRpbWVvdXQsIC4uLmV4ZWNPcHRpb25zIH0gPSBvcHRpb25zIHx8IHt9O1xuXG4gIGNvbnN0IG91dHB1dEFyZ3VtZW50cyA9IFtcIi1Ob0xvZ29cIiwgXCItTm9Qcm9maWxlXCIsIFwiLU5vbkludGVyYWN0aXZlXCIsIFwiLUNvbW1hbmRcIiwgXCItXCJdO1xuXG4gIGNvbnN0IHNwYXduZWQgPSBjaGlsZFByb2Nlc3Muc3Bhd24oXCJwb3dlcnNoZWxsLmV4ZVwiLCBvdXRwdXRBcmd1bWVudHMsIHtcbiAgICAuLi5leGVjT3B0aW9ucyxcbiAgfSk7XG4gIGNvbnN0IHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCwgeyB0aW1lb3V0OiB0aW1lb3V0ID8/IDEwMDAwIH0pO1xuXG4gIHNwYXduZWQuc3RkaW4uZW5kKHNjcmlwdCk7XG5cbiAgY29uc3QgW3sgZXJyb3IsIGV4aXRDb2RlLCBzaWduYWwsIHRpbWVkT3V0IH0sIHN0ZG91dFJlc3VsdCwgc3RkZXJyUmVzdWx0XSA9IGF3YWl0IGdldFNwYXduZWRSZXN1bHQ8c3RyaW5nPihcbiAgICBzcGF3bmVkLFxuICAgIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0sXG4gICAgc3Bhd25lZFByb21pc2UsXG4gICk7XG4gIGNvbnN0IHN0ZG91dCA9IGhhbmRsZU91dHB1dCh7IHN0cmlwRmluYWxOZXdsaW5lOiB0cnVlIH0sIHN0ZG91dFJlc3VsdCk7XG4gIGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dCh7IHN0cmlwRmluYWxOZXdsaW5lOiB0cnVlIH0sIHN0ZGVyclJlc3VsdCk7XG5cbiAgcmV0dXJuIGRlZmF1bHRQYXJzaW5nKHtcbiAgICBzdGRvdXQsXG4gICAgc3RkZXJyLFxuICAgIGVycm9yLFxuICAgIGV4aXRDb2RlLFxuICAgIHNpZ25hbCxcbiAgICB0aW1lZE91dCxcbiAgICBjb21tYW5kOiBcInBvd2Vyc2hlbGwuZXhlXCIsXG4gICAgb3B0aW9ucyxcbiAgICBwYXJlbnRFcnJvcjogbmV3IEVycm9yKCksXG4gIH0pO1xufVxuIiwgImltcG9ydCB7IENhY2hlIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgaGFzaCwgcmVwbGFjZXIsIHJldml2ZXIgfSBmcm9tIFwiLi9oZWxwZXJzXCI7XG5cbi8qKlxuICogV3JhcHMgYSBmdW5jdGlvbiB3aXRoIGNhY2hpbmcgZnVuY3Rpb25hbGl0eSB1c2luZyBSYXljYXN0J3MgQ2FjaGUgQVBJLlxuICogQWxsb3dzIGZvciBjYWNoaW5nIG9mIGV4cGVuc2l2ZSBmdW5jdGlvbnMgbGlrZSBwYWdpbmF0ZWQgQVBJIGNhbGxzIHRoYXQgcmFyZWx5IGNoYW5nZS5cbiAqXG4gKiBAcGFyYW0gZm4gLSBUaGUgYXN5bmMgZnVuY3Rpb24gdG8gY2FjaGUgcmVzdWx0cyBmcm9tXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBjYWNoZSBiZWhhdmlvclxuICogQHBhcmFtIG9wdGlvbnMudmFsaWRhdGUgLSBPcHRpb25hbCB2YWxpZGF0aW9uIGZ1bmN0aW9uIGZvciBjYWNoZWQgZGF0YVxuICogQHBhcmFtIG9wdGlvbnMubWF4QWdlIC0gTWF4aW11bSBhZ2Ugb2YgY2FjaGVkIGRhdGEgaW4gbWlsbGlzZWNvbmRzXG4gKiBAcmV0dXJucyBBbiBhc3luYyBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHJlc3VsdCBvZiB0aGUgZnVuY3Rpb24sIGVpdGhlciBmcm9tIGNhY2hlIG9yIGZyZXNoIGV4ZWN1dGlvblxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogY29uc3QgY2FjaGVkRnVuY3Rpb24gPSB3aXRoQ2FjaGUoZmV0Y2hFeHBlbnNpdmVEYXRhLCB7XG4gKiAgIG1heEFnZTogNSAqIDYwICogMTAwMCAvLyBDYWNoZSBmb3IgNSBtaW51dGVzXG4gKiB9KTtcbiAqXG4gKiBjb25zdCByZXN1bHQgPSBhd2FpdCBjYWNoZWRGdW5jdGlvbihxdWVyeSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhDYWNoZTxGbiBleHRlbmRzICguLi5hcmdzOiBhbnkpID0+IFByb21pc2U8YW55Pj4oXG4gIGZuOiBGbixcbiAgb3B0aW9ucz86IHtcbiAgICAvKiogZnVuY3Rpb24gdGhhdCByZWNlaXZlcyB0aGUgY2FjaGVkIGRhdGEgYW5kIHJldHVybnMgYSBib29sZWFuIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBkYXRhIGlzIHN0aWxsIHZhbGlkIG9yIG5vdC4gKi9cbiAgICB2YWxpZGF0ZT86IChkYXRhOiBBd2FpdGVkPFJldHVyblR5cGU8Rm4+PikgPT4gYm9vbGVhbjtcbiAgICAvKiogTWF4aW11bSBhZ2Ugb2YgY2FjaGVkIGRhdGEgaW4gbWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRoZSBkYXRhIHdpbGwgYmUgY29uc2lkZXJlZCBpbnZhbGlkICovXG4gICAgbWF4QWdlPzogbnVtYmVyO1xuICB9LFxuKTogRm4gJiB7IGNsZWFyQ2FjaGU6ICgpID0+IHZvaWQgfSB7XG4gIGNvbnN0IGNhY2hlID0gbmV3IENhY2hlKHsgbmFtZXNwYWNlOiBoYXNoKGZuKSB9KTtcblxuICBjb25zdCB3cmFwcGVkRm4gPSBhc3luYyAoLi4uYXJnczogUGFyYW1ldGVyczxGbj4pID0+IHtcbiAgICBjb25zdCBrZXkgPVxuICAgICAgaGFzaChhcmdzIHx8IFtdKSArIChvcHRpb25zIGFzIHVua25vd24gYXMgeyBpbnRlcm5hbF9jYWNoZUtleVN1ZmZpeD86IHN0cmluZyB9KT8uaW50ZXJuYWxfY2FjaGVLZXlTdWZmaXg7XG4gICAgY29uc3QgY2FjaGVkID0gY2FjaGUuZ2V0KGtleSk7XG4gICAgaWYgKGNhY2hlZCkge1xuICAgICAgY29uc3QgeyBkYXRhLCB0aW1lc3RhbXAgfSA9IEpTT04ucGFyc2UoY2FjaGVkLCByZXZpdmVyKTtcbiAgICAgIGNvbnN0IGlzRXhwaXJlZCA9IG9wdGlvbnM/Lm1heEFnZSAmJiBEYXRlLm5vdygpIC0gdGltZXN0YW1wID4gb3B0aW9ucy5tYXhBZ2U7XG4gICAgICBpZiAoIWlzRXhwaXJlZCAmJiAoIW9wdGlvbnM/LnZhbGlkYXRlIHx8IG9wdGlvbnMudmFsaWRhdGUoZGF0YSkpKSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZm4oLi4uYXJncyk7XG4gICAgY2FjaGUuc2V0KFxuICAgICAga2V5LFxuICAgICAgSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIHtcbiAgICAgICAgICBkYXRhOiByZXN1bHQsXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICB9LFxuICAgICAgICByZXBsYWNlcixcbiAgICAgICksXG4gICAgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHdyYXBwZWRGbi5jbGVhckNhY2hlID0gKCkgPT4ge1xuICAgIGNhY2hlLmNsZWFyKCk7XG4gIH07XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0b28gY29tcGxleCBmb3IgVFNcbiAgcmV0dXJuIHdyYXBwZWRGbjtcbn1cbiIsICJpbXBvcnQgeyBMaXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuXG5leHBvcnQgY29uc3QgVmF1bHRMb2FkaW5nRmFsbGJhY2sgPSAoKSA9PiA8TGlzdCBzZWFyY2hCYXJQbGFjZWhvbGRlcj1cIlNlYXJjaCB2YXVsdFwiIGlzTG9hZGluZyAvPjtcbiIsICJpbXBvcnQgeyB1c2VSZWR1Y2VyIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBTZXNzaW9uU3RhdGUgfSBmcm9tIFwifi90eXBlcy9zZXNzaW9uXCI7XG5cbmNvbnN0IGluaXRpYWxTdGF0ZTogU2Vzc2lvblN0YXRlID0ge1xuICB0b2tlbjogdW5kZWZpbmVkLFxuICBwYXNzd29yZEhhc2g6IHVuZGVmaW5lZCxcblxuICBpc0xvYWRpbmc6IHRydWUsXG4gIGlzTG9ja2VkOiBmYWxzZSxcbiAgaXNBdXRoZW50aWNhdGVkOiBmYWxzZSxcbn07XG5cbnR5cGUgU2Vzc2lvblJlZHVjZXJBY3Rpb25zID1cbiAgfCAoeyB0eXBlOiBcImxvYWRTdGF0ZVwiIH0gJiBQYXJ0aWFsPE9taXQ8U2Vzc2lvblN0YXRlLCBcImlzTG9hZGluZ1wiIHwgXCJpc0xvY2tlZFwiIHwgXCJpc0F1dGhlbnRpY2F0ZWRcIj4+KVxuICB8IHsgdHlwZTogXCJsb2NrXCIgfVxuICB8ICh7IHR5cGU6IFwidW5sb2NrXCIgfSAmIFBpY2s8U2Vzc2lvblN0YXRlLCBcInRva2VuXCIgfCBcInBhc3N3b3JkSGFzaFwiPilcbiAgfCB7IHR5cGU6IFwibG9nb3V0XCIgfVxuICB8IHsgdHlwZTogXCJ2YXVsdFRpbWVvdXRcIiB9XG4gIHwgeyB0eXBlOiBcImZpbmlzaExvYWRpbmdTYXZlZFN0YXRlXCIgfVxuICB8IHsgdHlwZTogXCJmYWlsTG9hZGluZ1NhdmVkU3RhdGVcIiB9O1xuXG5leHBvcnQgY29uc3QgdXNlU2Vzc2lvblJlZHVjZXIgPSAoKSA9PiB7XG4gIHJldHVybiB1c2VSZWR1Y2VyKChzdGF0ZTogU2Vzc2lvblN0YXRlLCBhY3Rpb246IFNlc3Npb25SZWR1Y2VyQWN0aW9ucyk6IFNlc3Npb25TdGF0ZSA9PiB7XG4gICAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgICAgY2FzZSBcImxvYWRTdGF0ZVwiOiB7XG4gICAgICAgIGNvbnN0IHsgdHlwZTogXywgLi4uYWN0aW9uUGF5bG9hZCB9ID0gYWN0aW9uO1xuICAgICAgICByZXR1cm4geyAuLi5zdGF0ZSwgLi4uYWN0aW9uUGF5bG9hZCB9O1xuICAgICAgfVxuICAgICAgY2FzZSBcImxvY2tcIjoge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgIHRva2VuOiB1bmRlZmluZWQsXG4gICAgICAgICAgcGFzc3dvcmRIYXNoOiB1bmRlZmluZWQsXG4gICAgICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICBpc0xvY2tlZDogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGNhc2UgXCJ1bmxvY2tcIjoge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgIHRva2VuOiBhY3Rpb24udG9rZW4sXG4gICAgICAgICAgcGFzc3dvcmRIYXNoOiBhY3Rpb24ucGFzc3dvcmRIYXNoLFxuICAgICAgICAgIGlzTG9ja2VkOiBmYWxzZSxcbiAgICAgICAgICBpc0F1dGhlbnRpY2F0ZWQ6IHRydWUsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBjYXNlIFwibG9nb3V0XCI6IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgICB0b2tlbjogdW5kZWZpbmVkLFxuICAgICAgICAgIHBhc3N3b3JkSGFzaDogdW5kZWZpbmVkLFxuICAgICAgICAgIGlzTG9ja2VkOiB0cnVlLFxuICAgICAgICAgIGlzQXV0aGVudGljYXRlZDogZmFsc2UsXG4gICAgICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGNhc2UgXCJ2YXVsdFRpbWVvdXRcIjoge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgIGlzTG9ja2VkOiB0cnVlLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgY2FzZSBcImZpbmlzaExvYWRpbmdTYXZlZFN0YXRlXCI6IHtcbiAgICAgICAgaWYgKCFzdGF0ZS50b2tlbiB8fCAhc3RhdGUucGFzc3dvcmRIYXNoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyByZXF1aXJlZCBmaWVsZHM6IHRva2VuLCBwYXNzd29yZEhhc2hcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBoYXNUb2tlbiA9ICEhc3RhdGUudG9rZW47XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICBpc0xvY2tlZDogIWhhc1Rva2VuLFxuICAgICAgICAgIGlzQXV0aGVudGljYXRlZDogaGFzVG9rZW4sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBjYXNlIFwiZmFpbExvYWRpbmdTYXZlZFN0YXRlXCI6IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgICBpc0xvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgIGlzTG9ja2VkOiB0cnVlLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICB9XG4gICAgfVxuICB9LCBpbml0aWFsU3RhdGUpO1xufTtcbiIsICJpbXBvcnQgeyBMb2NhbFN0b3JhZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBMT0NBTF9TVE9SQUdFX0tFWSB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBleGVjIGFzIGNhbGxiYWNrRXhlYywgUHJvbWlzZVdpdGhDaGlsZCB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tIFwidXRpbFwiO1xuaW1wb3J0IHsgY2FwdHVyZUV4Y2VwdGlvbiwgZGVidWdMb2cgfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuXG5jb25zdCBleGVjID0gcHJvbWlzaWZ5KGNhbGxiYWNrRXhlYyk7XG5cbmV4cG9ydCBjb25zdCBTZXNzaW9uU3RvcmFnZSA9IHtcbiAgZ2V0U2F2ZWRTZXNzaW9uOiAoKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgIExvY2FsU3RvcmFnZS5nZXRJdGVtPHN0cmluZz4oTE9DQUxfU1RPUkFHRV9LRVkuU0VTU0lPTl9UT0tFTiksXG4gICAgICBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KExPQ0FMX1NUT1JBR0VfS0VZLlJFUFJPTVBUX0hBU0gpLFxuICAgICAgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5MQVNUX0FDVElWSVRZX1RJTUUpLFxuICAgICAgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5WQVVMVF9MQVNUX1NUQVRVUyksXG4gICAgXSk7XG4gIH0sXG4gIGNsZWFyU2Vzc2lvbjogYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIExvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlNFU1NJT05fVE9LRU4pLFxuICAgICAgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuUkVQUk9NUFRfSEFTSCksXG4gICAgXSk7XG4gIH0sXG4gIHNhdmVTZXNzaW9uOiBhc3luYyAodG9rZW46IHN0cmluZywgcGFzc3dvcmRIYXNoOiBzdHJpbmcpID0+IHtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5TRVNTSU9OX1RPS0VOLCB0b2tlbiksXG4gICAgICBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5SRVBST01QVF9IQVNILCBwYXNzd29yZEhhc2gpLFxuICAgIF0pO1xuICB9LFxuICBsb2dvdXRDbGVhclNlc3Npb246IGFzeW5jICgpID0+IHtcbiAgICAvLyBjbGVhciBldmVyeXRoaW5nIHJlbGF0ZWQgdG8gdGhlIHNlc3Npb25cbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICBMb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShMT0NBTF9TVE9SQUdFX0tFWS5TRVNTSU9OX1RPS0VOKSxcbiAgICAgIExvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlJFUFJPTVBUX0hBU0gpLFxuICAgICAgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuTEFTVF9BQ1RJVklUWV9USU1FKSxcbiAgICBdKTtcbiAgfSxcbn07XG5cbmV4cG9ydCBjb25zdCBjaGVja1N5c3RlbUxvY2tlZFNpbmNlTGFzdEFjY2VzcyA9IChsYXN0QWN0aXZpdHlUaW1lOiBEYXRlKSA9PiB7XG4gIHJldHVybiBjaGVja1N5c3RlbUxvZ1RpbWVBZnRlcihsYXN0QWN0aXZpdHlUaW1lLCAodGltZTogbnVtYmVyKSA9PiBnZXRMYXN0U3lzbG9nKHRpbWUsIFwiaGFuZGxlVW5sb2NrUmVzdWx0XCIpKTtcbn07XG5leHBvcnQgY29uc3QgY2hlY2tTeXN0ZW1TbGVwdFNpbmNlTGFzdEFjY2VzcyA9IChsYXN0QWN0aXZpdHlUaW1lOiBEYXRlKSA9PiB7XG4gIHJldHVybiBjaGVja1N5c3RlbUxvZ1RpbWVBZnRlcihsYXN0QWN0aXZpdHlUaW1lLCAodGltZTogbnVtYmVyKSA9PiBnZXRMYXN0U3lzbG9nKHRpbWUsIFwic2xlZXAgMFwiKSk7XG59O1xuXG5mdW5jdGlvbiBnZXRMYXN0U3lzbG9nKGhvdXJzOiBudW1iZXIsIGZpbHRlcjogc3RyaW5nKSB7XG4gIHJldHVybiBleGVjKFxuICAgIGBsb2cgc2hvdyAtLXN0eWxlIHN5c2xvZyAtLXByZWRpY2F0ZSBcInByb2Nlc3MgPT0gJ2xvZ2lud2luZG93J1wiIC0taW5mbyAtLWxhc3QgJHtob3Vyc31oIHwgZ3JlcCBcIiR7ZmlsdGVyfVwiIHwgdGFpbCAtbiAxYFxuICApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tTeXN0ZW1Mb2dUaW1lQWZ0ZXIoXG4gIHRpbWU6IERhdGUsXG4gIGdldExvZ0VudHJ5OiAodGltZVNwYW5Ib3VyczogbnVtYmVyKSA9PiBQcm9taXNlV2l0aENoaWxkPHsgc3Rkb3V0OiBzdHJpbmc7IHN0ZGVycjogc3RyaW5nIH0+XG4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgbGFzdFNjcmVlbkxvY2tUaW1lID0gYXdhaXQgZ2V0U3lzdGVtTG9nVGltZShnZXRMb2dFbnRyeSk7XG4gIGlmICghbGFzdFNjcmVlbkxvY2tUaW1lKSByZXR1cm4gdHJ1ZTsgLy8gYXNzdW1lIHRoYXQgbG9nIHdhcyBmb3VuZCBmb3IgaW1wcm92ZWQgc2FmZXR5XG4gIHJldHVybiBuZXcgRGF0ZShsYXN0U2NyZWVuTG9ja1RpbWUpLmdldFRpbWUoKSA+IHRpbWUuZ2V0VGltZSgpO1xufVxuXG5jb25zdCBnZXRTeXN0ZW1Mb2dUaW1lX0lOQ1JFTUVOVF9IT1VSUyA9IDI7XG5jb25zdCBnZXRTeXN0ZW1Mb2dUaW1lX01BWF9SRVRSSUVTID0gNTtcbi8qKlxuICogU3RhcnRzIGJ5IGNoZWNraW5nIHRoZSBsYXN0IGhvdXIgYW5kIGluY3JlYXNlcyB0aGUgdGltZSBzcGFuIGJ5IHtAbGluayBnZXRTeXN0ZW1Mb2dUaW1lX0lOQ1JFTUVOVF9IT1VSU30gaG91cnMgb24gZWFjaCByZXRyeS5cbiAqIFx1MjZBMFx1RkUwRiBDYWxscyB0byB0aGUgc3lzdGVtIGxvZyBhcmUgdmVyeSBzbG93LCBhbmQgaWYgdGhlIHNjcmVlbiBoYXNuJ3QgYmVlbiBsb2NrZWQgZm9yIHNvbWUgaG91cnMsIGl0IGdldHMgc2xvd2VyLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRTeXN0ZW1Mb2dUaW1lKFxuICBnZXRMb2dFbnRyeTogKHRpbWVTcGFuSG91cnM6IG51bWJlcikgPT4gUHJvbWlzZVdpdGhDaGlsZDx7IHN0ZG91dDogc3RyaW5nOyBzdGRlcnI6IHN0cmluZyB9PixcbiAgdGltZVNwYW5Ib3VycyA9IDEsXG4gIHJldHJ5QXR0ZW1wdCA9IDBcbik6IFByb21pc2U8RGF0ZSB8IHVuZGVmaW5lZD4ge1xuICB0cnkge1xuICAgIGlmIChyZXRyeUF0dGVtcHQgPiBnZXRTeXN0ZW1Mb2dUaW1lX01BWF9SRVRSSUVTKSB7XG4gICAgICBkZWJ1Z0xvZyhcIk1heCByZXRyeSBhdHRlbXB0cyByZWFjaGVkIHRvIGdldCBsYXN0IHNjcmVlbiBsb2NrIHRpbWVcIik7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCB7IHN0ZG91dCwgc3RkZXJyIH0gPSBhd2FpdCBnZXRMb2dFbnRyeSh0aW1lU3BhbkhvdXJzKTtcbiAgICBjb25zdCBbbG9nRGF0ZSwgbG9nVGltZV0gPSBzdGRvdXQ/LnNwbGl0KFwiIFwiKSA/PyBbXTtcbiAgICBpZiAoc3RkZXJyIHx8ICFsb2dEYXRlIHx8ICFsb2dUaW1lKSB7XG4gICAgICByZXR1cm4gZ2V0U3lzdGVtTG9nVGltZShnZXRMb2dFbnRyeSwgdGltZVNwYW5Ib3VycyArIGdldFN5c3RlbUxvZ1RpbWVfSU5DUkVNRU5UX0hPVVJTLCByZXRyeUF0dGVtcHQgKyAxKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dGdWxsRGF0ZSA9IG5ldyBEYXRlKGAke2xvZ0RhdGV9VCR7bG9nVGltZX1gKTtcbiAgICBpZiAoIWxvZ0Z1bGxEYXRlIHx8IGxvZ0Z1bGxEYXRlLnRvU3RyaW5nKCkgPT09IFwiSW52YWxpZCBEYXRlXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICByZXR1cm4gbG9nRnVsbERhdGU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZXQgbGFzdCBzY3JlZW4gbG9jayB0aW1lXCIsIGVycm9yKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRWZmZWN0Q2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5cbnR5cGUgQXN5bmNFZmZlY3RDYWxsYmFjayA9ICgpID0+IFByb21pc2U8YW55PjtcbnR5cGUgRWZmZWN0ID0gRWZmZWN0Q2FsbGJhY2sgfCBBc3luY0VmZmVjdENhbGxiYWNrO1xuXG50eXBlIERlZmluZWRWYWx1ZSA9IG51bGwgfCBib29sZWFuIHwgbnVtYmVyIHwgc3RyaW5nIHwgb2JqZWN0IHwgc3ltYm9sO1xuXG4vKiogYHVzZUVmZmVjdGAgdGhhdCBvbmx5IHJ1bnMgb25jZSBhZnRlciB0aGUgYGNvbmRpdGlvbmAgaXMgbWV0ICovXG5mdW5jdGlvbiB1c2VPbmNlRWZmZWN0KGVmZmVjdDogRWZmZWN0LCBjb25kaXRpb24/OiBEZWZpbmVkVmFsdWUpIHtcbiAgY29uc3QgaGFzUnVuID0gdXNlUmVmKGZhbHNlKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChoYXNSdW4uY3VycmVudCkgcmV0dXJuO1xuICAgIGlmIChjb25kaXRpb24gIT09IHVuZGVmaW5lZCAmJiAhY29uZGl0aW9uKSByZXR1cm47XG4gICAgaGFzUnVuLmN1cnJlbnQgPSB0cnVlO1xuICAgIHZvaWQgZWZmZWN0KCk7XG4gIH0sIFtjb25kaXRpb25dKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdXNlT25jZUVmZmVjdDtcbiIsICJpbXBvcnQgeyBBY3Rpb24sIENsaXBib2FyZCwgSWNvbiwgVG9hc3QsIGVudmlyb25tZW50LCBnZXRQcmVmZXJlbmNlVmFsdWVzLCBzaG93VG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIH0gZnJvbSBcIn4vdXRpbHMvZGV2ZWxvcG1lbnRcIjtcbmltcG9ydCB7IGV4ZWMgYXMgZXhlY1dpdGhDYWxsYmFja3MgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSBcInV0aWxcIjtcbmltcG9ydCB7IGNsaUluZm8gfSBmcm9tIFwifi9hcGkvYml0d2FyZGVuXCI7XG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IHBsYXRmb3JtIH0gZnJvbSBcIn4vdXRpbHMvcGxhdGZvcm1cIjtcblxuY29uc3QgZXhlYyA9IHByb21pc2lmeShleGVjV2l0aENhbGxiYWNrcyk7XG5jb25zdCB7IHN1cHBvcnRQYXRoIH0gPSBlbnZpcm9ubWVudDtcblxuLyoqIHN0cmlwIG91dCBhbnkgc2Vuc2l0aXZlIGRhdGEgZnJvbSBwcmVmZXJlbmNlcyAqL1xuY29uc3QgZ2V0U2FmZVByZWZlcmVuY2VzID0gKCkgPT4ge1xuICBjb25zdCB7XG4gICAgY2xpZW50SWQsXG4gICAgY2xpZW50U2VjcmV0LFxuICAgIGZldGNoRmF2aWNvbnMsXG4gICAgZ2VuZXJhdGVQYXNzd29yZFF1aWNrQWN0aW9uLFxuICAgIHJlcHJvbXB0SWdub3JlRHVyYXRpb24sXG4gICAgc2VydmVyQ2VydHNQYXRoLFxuICAgIHNlcnZlclVybCxcbiAgICBzaG91bGRDYWNoZVZhdWx0SXRlbXMsXG4gICAgdHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmQsXG4gICAgdHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmRRdWljayxcbiAgICB0cmFuc2llbnRDb3B5U2VhcmNoLFxuICAgIHdpbmRvd0FjdGlvbk9uQ29weSxcbiAgfSA9IGdldFByZWZlcmVuY2VWYWx1ZXM8QWxsUHJlZmVyZW5jZXM+KCk7XG5cbiAgcmV0dXJuIHtcbiAgICBoYXNfY2xpZW50SWQ6ICEhY2xpZW50SWQsXG4gICAgaGFzX2NsaWVudFNlY3JldDogISFjbGllbnRTZWNyZXQsXG4gICAgZmV0Y2hGYXZpY29ucyxcbiAgICBnZW5lcmF0ZVBhc3N3b3JkUXVpY2tBY3Rpb24sXG4gICAgcmVwcm9tcHRJZ25vcmVEdXJhdGlvbixcbiAgICBoYXNfc2VydmVyQ2VydHNQYXRoOiAhIXNlcnZlckNlcnRzUGF0aCxcbiAgICBoYXNfc2VydmVyVXJsOiAhIXNlcnZlclVybCxcbiAgICBzaG91bGRDYWNoZVZhdWx0SXRlbXMsXG4gICAgdHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmQsXG4gICAgdHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmRRdWljayxcbiAgICB0cmFuc2llbnRDb3B5U2VhcmNoLFxuICAgIHdpbmRvd0FjdGlvbk9uQ29weSxcbiAgfTtcbn07XG5cbmNvbnN0IE5BID0gXCJOL0FcIjtcbmNvbnN0IHRyeUV4ZWMgPSBhc3luYyAoY29tbWFuZDogc3RyaW5nLCB0cmltTGluZUJyZWFrcyA9IHRydWUpID0+IHtcbiAgdHJ5IHtcbiAgICBsZXQgY21kID0gY29tbWFuZDtcblxuICAgIGlmIChwbGF0Zm9ybSA9PT0gXCJ3aW5kb3dzXCIpIHtcbiAgICAgIGNtZCA9IGBwb3dlcnNoZWxsIC1Db21tYW5kIFwiJHtjb21tYW5kfVwiYDtcbiAgICB9IGVsc2Uge1xuICAgICAgY21kID0gYFBBVEg9XCIkUEFUSDoke2Rpcm5hbWUocHJvY2Vzcy5leGVjUGF0aCl9XCIgJHtjb21tYW5kfWA7XG4gICAgfVxuICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCBleGVjKGNtZCwgeyBlbnY6IHsgQklUV0FSREVOQ0xJX0FQUERBVEFfRElSOiBzdXBwb3J0UGF0aCB9IH0pO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gc3Rkb3V0LnRyaW0oKTtcbiAgICBpZiAodHJpbUxpbmVCcmVha3MpIHJldHVybiByZXNwb25zZS5yZXBsYWNlKC9cXG58XFxyL2csIFwiXCIpO1xuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjYXB0dXJlRXhjZXB0aW9uKGBGYWlsZWQgdG8gZXhlY3V0ZSBjb21tYW5kOiAke2NvbW1hbmR9YCwgZXJyb3IpO1xuICAgIHJldHVybiBOQTtcbiAgfVxufTtcblxuY29uc3QgZ2V0QndCaW5JbmZvID0gKCkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGNsaVBhdGhQcmVmID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcz4oKS5jbGlQYXRoO1xuICAgIGlmIChjbGlQYXRoUHJlZikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJjdXN0b21cIiwgcGF0aDogY2xpUGF0aFByZWYgfTtcbiAgICB9XG4gICAgaWYgKGNsaUluZm8ucGF0aC5iaW4gPT09IGNsaUluZm8ucGF0aC5kb3dubG9hZGVkQmluKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcImRvd25sb2FkZWRcIiwgcGF0aDogY2xpSW5mby5wYXRoLmRvd25sb2FkZWRCaW4gfTtcbiAgICB9XG4gICAgcmV0dXJuIHsgdHlwZTogXCJpbnN0YWxsZWRcIiwgcGF0aDogY2xpSW5mby5wYXRoLmluc3RhbGxlZEJpbiB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiB7IHR5cGU6IE5BLCBwYXRoOiBOQSB9O1xuICB9XG59O1xuXG5jb25zdCBnZXRIb21lYnJld0luZm8gPSBhc3luYyAoKSA9PiB7XG4gIHRyeSB7XG4gICAgbGV0IHBhdGggPSBcIi9vcHQvaG9tZWJyZXcvYmluL2JyZXdcIjtcbiAgICBpZiAoIWV4aXN0c1N5bmMocGF0aCkpIHBhdGggPSBcIi91c3IvbG9jYWwvYmluL2JyZXdcIjtcbiAgICBpZiAoIWV4aXN0c1N5bmMocGF0aCkpIHJldHVybiB7IGFyY2g6IE5BLCB2ZXJzaW9uOiBOQSB9O1xuXG4gICAgY29uc3QgY29uZmlnID0gYXdhaXQgdHJ5RXhlYyhgJHtwYXRofSBjb25maWdgLCBmYWxzZSk7XG4gICAgaWYgKGNvbmZpZyA9PT0gTkEpIHJldHVybiB7IGFyY2g6IE5BLCB2ZXJzaW9uOiBOQSB9O1xuXG4gICAgY29uc3QgYXJjaFZhbHVlID0gL0hPTUVCUkVXX1BSRUZJWDogKC4rKS8uZXhlYyhjb25maWcpPy5bMV0gfHwgTkE7XG4gICAgY29uc3QgdmVyc2lvbiA9IC9IT01FQlJFV19WRVJTSU9OOiAoLispLy5leGVjKGNvbmZpZyk/LlsxXSB8fCBOQTtcbiAgICBjb25zdCBhcmNoID0gYXJjaFZhbHVlICE9PSBOQSA/IChhcmNoVmFsdWUuaW5jbHVkZXMoXCIvb3B0L2hvbWVicmV3XCIpID8gXCJhcm02NFwiIDogXCJ4ODZfNjRcIikgOiBOQTtcblxuICAgIHJldHVybiB7IGFyY2gsIHZlcnNpb24gfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4geyBhcmNoOiBOQSwgdmVyc2lvbjogTkEgfTtcbiAgfVxufTtcblxuZnVuY3Rpb24gQnVnUmVwb3J0Q29sbGVjdERhdGFBY3Rpb24oKSB7XG4gIGNvbnN0IGNvbGxlY3REYXRhID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLkFuaW1hdGVkLCBcIkNvbGxlY3RpbmcgZGF0YS4uLlwiKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcHJlZmVyZW5jZXMgPSBnZXRTYWZlUHJlZmVyZW5jZXMoKTtcbiAgICAgIGNvbnN0IGJ3SW5mbyA9IGdldEJ3QmluSW5mbygpO1xuICAgICAgY29uc3QgW3N5c3RlbUFyY2gsIG9zVmVyc2lvbiwgb3NCdWlsZFZlcnNpb24sIGJ3VmVyc2lvbl0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIC4uLihwbGF0Zm9ybSA9PT0gXCJtYWNvc1wiXG4gICAgICAgICAgPyBbdHJ5RXhlYyhcInVuYW1lIC1tXCIpLCB0cnlFeGVjKFwic3dfdmVycyAtcHJvZHVjdFZlcnNpb25cIiksIHRyeUV4ZWMoXCJzd192ZXJzIC1idWlsZFZlcnNpb25cIildXG4gICAgICAgICAgOiBbXG4gICAgICAgICAgICAgIHRyeUV4ZWMoXCIoR2V0LUNpbUluc3RhbmNlIFdpbjMyX09wZXJhdGluZ1N5c3RlbSkuT1NBcmNoaXRlY3R1cmVcIiksXG4gICAgICAgICAgICAgIHRyeUV4ZWMoXCIoR2V0LUNpbUluc3RhbmNlIFdpbjMyX09wZXJhdGluZ1N5c3RlbSkuQ2FwdGlvblwiKSxcbiAgICAgICAgICAgICAgdHJ5RXhlYyhcIihHZXQtQ2ltSW5zdGFuY2UgV2luMzJfT3BlcmF0aW5nU3lzdGVtKS5WZXJzaW9uXCIpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgIHRyeUV4ZWMoYCR7YndJbmZvLnBhdGh9IC0tdmVyc2lvbmApLFxuICAgICAgXSk7XG5cbiAgICAgIGNvbnN0IGRhdGE6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7XG4gICAgICAgIHJheWNhc3Q6IHtcbiAgICAgICAgICB2ZXJzaW9uOiBlbnZpcm9ubWVudC5yYXljYXN0VmVyc2lvbixcbiAgICAgICAgfSxcbiAgICAgICAgc3lzdGVtOiB7XG4gICAgICAgICAgYXJjaDogc3lzdGVtQXJjaCxcbiAgICAgICAgICB2ZXJzaW9uOiBvc1ZlcnNpb24sXG4gICAgICAgICAgYnVpbGRWZXJzaW9uOiBvc0J1aWxkVmVyc2lvbixcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZToge1xuICAgICAgICAgIGFyY2g6IHByb2Nlc3MuYXJjaCxcbiAgICAgICAgICB2ZXJzaW9uOiBwcm9jZXNzLnZlcnNpb24sXG4gICAgICAgIH0sXG4gICAgICAgIGNsaToge1xuICAgICAgICAgIHR5cGU6IGJ3SW5mby50eXBlLFxuICAgICAgICAgIHZlcnNpb246IGJ3VmVyc2lvbixcbiAgICAgICAgfSxcbiAgICAgICAgcHJlZmVyZW5jZXMsXG4gICAgICB9O1xuXG4gICAgICBpZiAocGxhdGZvcm0gPT09IFwibWFjb3NcIikge1xuICAgICAgICBjb25zdCBicmV3SW5mbyA9IGF3YWl0IGdldEhvbWVicmV3SW5mbygpO1xuICAgICAgICBkYXRhLmhvbWVicmV3ID0ge1xuICAgICAgICAgIGFyY2g6IGJyZXdJbmZvLmFyY2gsXG4gICAgICAgICAgdmVyc2lvbjogYnJld0luZm8udmVyc2lvbixcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgQ2xpcGJvYXJkLmNvcHkoSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xuICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5TdWNjZXNzO1xuICAgICAgdG9hc3QudGl0bGUgPSBcIkRhdGEgY29waWVkIHRvIGNsaXBib2FyZFwiO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLkZhaWx1cmU7XG4gICAgICB0b2FzdC50aXRsZSA9IFwiRmFpbGVkIHRvIGNvbGxlY3QgYnVnIHJlcG9ydCBkYXRhXCI7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNvbGxlY3QgYnVnIHJlcG9ydCBkYXRhXCIsIGVycm9yKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIDxBY3Rpb24gdGl0bGU9XCJDb2xsZWN0IEJ1ZyBSZXBvcnQgRGF0YVwiIGljb249e0ljb24uQnVnfSBvbkFjdGlvbj17Y29sbGVjdERhdGF9IC8+O1xufVxuXG5leHBvcnQgZGVmYXVsdCBCdWdSZXBvcnRDb2xsZWN0RGF0YUFjdGlvbjtcbiIsICJpbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5cbmV4cG9ydCBjb25zdCBCVUdfUkVQT1JUX1VSTCA9XG4gIFwiaHR0cHM6Ly9naXRodWIuY29tL3JheWNhc3QvZXh0ZW5zaW9ucy9pc3N1ZXMvbmV3P2Fzc2lnbmVlcz0mbGFiZWxzPWV4dGVuc2lvbiUyQ2J1ZyZ0ZW1wbGF0ZT1leHRlbnNpb25fYnVnX3JlcG9ydC55bWwmdGl0bGU9JTVCQml0d2FyZGVuJTVEKy4uLlwiO1xuXG5mdW5jdGlvbiBCdWdSZXBvcnRPcGVuQWN0aW9uKCkge1xuICByZXR1cm4gPEFjdGlvbi5PcGVuSW5Ccm93c2VyIHRpdGxlPVwiT3BlbiBCdWcgUmVwb3J0XCIgdXJsPXtCVUdfUkVQT1JUX1VSTH0gLz47XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJ1Z1JlcG9ydE9wZW5BY3Rpb247XG4iLCAiaW1wb3J0IHsgQWN0aW9uLCBBbGVydCwgQ2xpcGJvYXJkLCBJY29uLCBUb2FzdCwgY29uZmlybUFsZXJ0LCBzaG93VG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBjYXB0dXJlZEV4Y2VwdGlvbnMgfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuXG5mdW5jdGlvbiBDb3B5UnVudGltZUVycm9yTG9nKCkge1xuICBjb25zdCBjb3B5RXJyb3JzID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGVycm9yU3RyaW5nID0gY2FwdHVyZWRFeGNlcHRpb25zLnRvU3RyaW5nKCk7XG4gICAgaWYgKGVycm9yU3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHNob3dUb2FzdChUb2FzdC5TdHlsZS5TdWNjZXNzLCBcIk5vIGVycm9ycyB0byBjb3B5XCIpO1xuICAgIH1cbiAgICBhd2FpdCBDbGlwYm9hcmQuY29weShlcnJvclN0cmluZyk7XG4gICAgYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLlN1Y2Nlc3MsIFwiRXJyb3JzIGNvcGllZCB0byBjbGlwYm9hcmRcIik7XG4gICAgYXdhaXQgY29uZmlybUFsZXJ0KHtcbiAgICAgIHRpdGxlOiBcIkJlIGNhcmVmdWwgd2l0aCB0aGlzIGluZm9ybWF0aW9uXCIsXG4gICAgICBtZXNzYWdlOlxuICAgICAgICBcIlBsZWFzZSBiZSBtaW5kZnVsIG9mIHdoZXJlIHlvdSBzaGFyZSB0aGlzIGVycm9yIGxvZywgYXMgaXQgbWF5IGNvbnRhaW4gc2Vuc2l0aXZlIGluZm9ybWF0aW9uLiBBbHdheXMgYW5hbHl6ZSBpdCBiZWZvcmUgc2hhcmluZy5cIixcbiAgICAgIHByaW1hcnlBY3Rpb246IHsgdGl0bGU6IFwiR290IGl0XCIsIHN0eWxlOiBBbGVydC5BY3Rpb25TdHlsZS5EZWZhdWx0IH0sXG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8QWN0aW9uIG9uQWN0aW9uPXtjb3B5RXJyb3JzfSB0aXRsZT1cIkNvcHkgTGFzdCBFcnJvcnNcIiBpY29uPXtJY29uLkNvcHlDbGlwYm9hcmR9IHN0eWxlPXtBY3Rpb24uU3R5bGUuUmVndWxhcn0gLz5cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29weVJ1bnRpbWVFcnJvckxvZztcbiIsICJpbXBvcnQgeyBBY3Rpb25QYW5lbCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IEJ1Z1JlcG9ydENvbGxlY3REYXRhQWN0aW9uLCBCdWdSZXBvcnRPcGVuQWN0aW9uLCBDb3B5UnVudGltZUVycm9yTG9nIH0gZnJvbSBcIn4vY29tcG9uZW50cy9hY3Rpb25zXCI7XG5pbXBvcnQgeyB1c2VDbGlWZXJzaW9uIH0gZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlQ2xpVmVyc2lvblwiO1xuXG5leHBvcnQgZnVuY3Rpb24gRGVidWdnaW5nQnVnUmVwb3J0aW5nQWN0aW9uU2VjdGlvbigpIHtcbiAgY29uc3QgY2xpVmVyc2lvbiA9IHVzZUNsaVZlcnNpb24oKTtcblxuICByZXR1cm4gKFxuICAgIDxBY3Rpb25QYW5lbC5TZWN0aW9uIHRpdGxlPXtgRGVidWdnaW5nICYgQnVnIFJlcG9ydGluZyAoQ0xJIHYke2NsaVZlcnNpb259KWB9PlxuICAgICAgPENvcHlSdW50aW1lRXJyb3JMb2cgLz5cbiAgICAgIDxCdWdSZXBvcnRPcGVuQWN0aW9uIC8+XG4gICAgICA8QnVnUmVwb3J0Q29sbGVjdERhdGFBY3Rpb24gLz5cbiAgICA8L0FjdGlvblBhbmVsLlNlY3Rpb24+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IENBQ0hFX0tFWVMgfSBmcm9tIFwifi9jb25zdGFudHMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgQ2FjaGUgfSBmcm9tIFwifi91dGlscy9jYWNoZVwiO1xuaW1wb3J0IHVzZU9uY2VFZmZlY3QgZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlT25jZUVmZmVjdFwiO1xuXG5jb25zdCBnZXRDbGlWZXJzaW9uID0gKCkgPT4ge1xuICBjb25zdCB2ZXJzaW9uID0gQ2FjaGUuZ2V0KENBQ0hFX0tFWVMuQ0xJX1ZFUlNJT04pO1xuICBpZiAodmVyc2lvbikgcmV0dXJuIHBhcnNlRmxvYXQodmVyc2lvbik7XG4gIHJldHVybiAtMTtcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VDbGlWZXJzaW9uID0gKCkgPT4ge1xuICBjb25zdCBbdmVyc2lvbiwgc2V0VmVyc2lvbl0gPSB1c2VTdGF0ZTxudW1iZXI+KGdldENsaVZlcnNpb24pO1xuXG4gIHVzZU9uY2VFZmZlY3QoKCkgPT4ge1xuICAgIENhY2hlLnN1YnNjcmliZSgoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgaWYgKHZhbHVlICYmIGtleSA9PT0gQ0FDSEVfS0VZUy5DTElfVkVSU0lPTikge1xuICAgICAgICBzZXRWZXJzaW9uKHBhcnNlRmxvYXQodmFsdWUpIHx8IC0xKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHZlcnNpb247XG59O1xuIiwgImltcG9ydCB7IEFjdGlvbiwgQWN0aW9uUGFuZWwsIENvbG9yLCBJY29uLCBzaG93VG9hc3QsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgVkFVTFRfTE9DS19NRVNTQUdFUyB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyB1c2VCaXR3YXJkZW4gfSBmcm9tIFwifi9jb250ZXh0L2JpdHdhcmRlblwiO1xuaW1wb3J0IHsgdXNlVmF1bHRDb250ZXh0IH0gZnJvbSBcIn4vY29udGV4dC92YXVsdFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gVmF1bHRBY3Rpb25zU2VjdGlvbigpIHtcbiAgY29uc3QgdmF1bHQgPSB1c2VWYXVsdENvbnRleHQoKTtcbiAgY29uc3QgYml0d2FyZGVuID0gdXNlQml0d2FyZGVuKCk7XG5cbiAgY29uc3QgaGFuZGxlTG9ja1ZhdWx0ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLkFuaW1hdGVkLCBcIkxvY2tpbmcgVmF1bHQuLi5cIiwgXCJQbGVhc2Ugd2FpdFwiKTtcbiAgICBhd2FpdCBiaXR3YXJkZW4ubG9jayh7IHJlYXNvbjogVkFVTFRfTE9DS19NRVNTQUdFUy5NQU5VQUwgfSk7XG4gICAgYXdhaXQgdG9hc3QuaGlkZSgpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUxvZ291dFZhdWx0ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgc2hvd1RvYXN0KHsgdGl0bGU6IFwiTG9nZ2luZyBPdXQuLi5cIiwgc3R5bGU6IFRvYXN0LlN0eWxlLkFuaW1hdGVkIH0pO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBiaXR3YXJkZW4ubG9nb3V0KCk7XG4gICAgICBhd2FpdCB0b2FzdC5oaWRlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRvYXN0LnRpdGxlID0gXCJGYWlsZWQgdG8gbG9nb3V0XCI7XG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLkZhaWx1cmU7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPEFjdGlvblBhbmVsLlNlY3Rpb24gdGl0bGU9XCJWYXVsdCBBY3Rpb25zXCI+XG4gICAgICA8QWN0aW9uXG4gICAgICAgIHRpdGxlPVwiU3luYyBWYXVsdFwiXG4gICAgICAgIHNob3J0Y3V0PXt7IG1hY09TOiB7IGtleTogXCJyXCIsIG1vZGlmaWVyczogW1wib3B0XCJdIH0sIHdpbmRvd3M6IHsga2V5OiBcInJcIiwgbW9kaWZpZXJzOiBbXCJhbHRcIl0gfSB9fVxuICAgICAgICBpY29uPXtJY29uLkFycm93Q2xvY2t3aXNlfVxuICAgICAgICBvbkFjdGlvbj17dmF1bHQuc3luY0l0ZW1zfVxuICAgICAgLz5cbiAgICAgIDxBY3Rpb25cbiAgICAgICAgaWNvbj17eyBzb3VyY2U6IFwic2Zfc3ltYm9sc19sb2NrLnN2Z1wiLCB0aW50Q29sb3I6IENvbG9yLlByaW1hcnlUZXh0IH19IC8vIERvZXMgbm90IGltbWVkaWF0ZWx5IGZvbGxvdyB0aGVtZVxuICAgICAgICB0aXRsZT1cIkxvY2sgVmF1bHRcIlxuICAgICAgICBzaG9ydGN1dD17e1xuICAgICAgICAgIG1hY09TOiB7IGtleTogXCJsXCIsIG1vZGlmaWVyczogW1wib3B0XCIsIFwic2hpZnRcIl0gfSxcbiAgICAgICAgICB3aW5kb3dzOiB7IGtleTogXCJsXCIsIG1vZGlmaWVyczogW1wiYWx0XCIsIFwic2hpZnRcIl0gfSxcbiAgICAgICAgfX1cbiAgICAgICAgb25BY3Rpb249e2hhbmRsZUxvY2tWYXVsdH1cbiAgICAgIC8+XG4gICAgICA8QWN0aW9uIHN0eWxlPXtBY3Rpb24uU3R5bGUuRGVzdHJ1Y3RpdmV9IHRpdGxlPVwiTG9nb3V0XCIgaWNvbj17SWNvbi5Mb2dvdXR9IG9uQWN0aW9uPXtoYW5kbGVMb2dvdXRWYXVsdH0gLz5cbiAgICA8L0FjdGlvblBhbmVsLlNlY3Rpb24+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgZ2V0UHJlZmVyZW5jZVZhbHVlcywgc2hvd1RvYXN0LCBUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIFJlYWN0Tm9kZSwgdXNlQ29udGV4dCwgdXNlTWVtbywgdXNlUmVkdWNlciB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlVmF1bHRJdGVtUHVibGlzaGVyIH0gZnJvbSBcIn4vY29tcG9uZW50cy9zZWFyY2hWYXVsdC9jb250ZXh0L3ZhdWx0TGlzdGVuZXJzXCI7XG5pbXBvcnQgeyB1c2VCaXR3YXJkZW4gfSBmcm9tIFwifi9jb250ZXh0L2JpdHdhcmRlblwiO1xuaW1wb3J0IHsgdXNlU2Vzc2lvbiB9IGZyb20gXCJ+L2NvbnRleHQvc2Vzc2lvblwiO1xuaW1wb3J0IHsgRm9sZGVyLCBJdGVtLCBWYXVsdCB9IGZyb20gXCJ+L3R5cGVzL3ZhdWx0XCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIH0gZnJvbSBcIn4vdXRpbHMvZGV2ZWxvcG1lbnRcIjtcbmltcG9ydCB1c2VWYXVsdENhY2hpbmcgZnJvbSBcIn4vY29tcG9uZW50cy9zZWFyY2hWYXVsdC91dGlscy91c2VWYXVsdENhY2hpbmdcIjtcbmltcG9ydCB7IEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvciwgZ2V0RGlzcGxheWFibGVFcnJvck1lc3NhZ2UgfSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcbmltcG9ydCB1c2VPbmNlRWZmZWN0IGZyb20gXCJ+L3V0aWxzL2hvb2tzL3VzZU9uY2VFZmZlY3RcIjtcbmltcG9ydCB7IHVzZUNhY2hlZFN0YXRlIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG5pbXBvcnQgeyBDQUNIRV9LRVlTLCBGT0xERVJfT1BUSU9OUyB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5cbmV4cG9ydCB0eXBlIFZhdWx0U3RhdGUgPSBWYXVsdCAmIHtcbiAgaXNMb2FkaW5nOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgVmF1bHRDb250ZXh0VHlwZSA9IFZhdWx0U3RhdGUgJiB7XG4gIGlzRW1wdHk6IGJvb2xlYW47XG4gIHN5bmNJdGVtczogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgbG9hZEl0ZW1zOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBjdXJyZW50Rm9sZGVySWQ6IE51bGxhYmxlPHN0cmluZz47XG4gIHNldEN1cnJlbnRGb2xkZXI6IChmb2xkZXJPcklkOiBOdWxsYWJsZTxzdHJpbmcgfCBGb2xkZXI+KSA9PiB2b2lkO1xuICB1cGRhdGVTdGF0ZTogKG5leHQ6IFJlYWN0LlNldFN0YXRlQWN0aW9uPFZhdWx0U3RhdGU+KSA9PiB2b2lkO1xufTtcblxuY29uc3QgVmF1bHRDb250ZXh0ID0gY3JlYXRlQ29udGV4dDxWYXVsdENvbnRleHRUeXBlIHwgbnVsbD4obnVsbCk7XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpOiBWYXVsdFN0YXRlIHtcbiAgcmV0dXJuIHsgaXRlbXM6IFtdLCBmb2xkZXJzOiBbXSwgaXNMb2FkaW5nOiB0cnVlIH07XG59XG5cbmV4cG9ydCB0eXBlIFZhdWx0UHJvdmlkZXJQcm9wcyA9IHtcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbn07XG5cbmNvbnN0IHsgc3luY09uTGF1bmNoIH0gPSBnZXRQcmVmZXJlbmNlVmFsdWVzPEFsbFByZWZlcmVuY2VzPigpO1xuXG5leHBvcnQgZnVuY3Rpb24gVmF1bHRQcm92aWRlcihwcm9wczogVmF1bHRQcm92aWRlclByb3BzKSB7XG4gIGNvbnN0IHsgY2hpbGRyZW4gfSA9IHByb3BzO1xuXG4gIGNvbnN0IHNlc3Npb24gPSB1c2VTZXNzaW9uKCk7XG4gIGNvbnN0IGJpdHdhcmRlbiA9IHVzZUJpdHdhcmRlbigpO1xuICBjb25zdCBwdWJsaXNoSXRlbXMgPSB1c2VWYXVsdEl0ZW1QdWJsaXNoZXIoKTtcbiAgY29uc3QgeyBnZXRDYWNoZWRWYXVsdCwgY2FjaGVWYXVsdCB9ID0gdXNlVmF1bHRDYWNoaW5nKCk7XG5cbiAgY29uc3QgW2N1cnJlbnRGb2xkZXJJZCwgc2V0Q3VycmVudEZvbGRlcklkXSA9IHVzZUNhY2hlZFN0YXRlPE51bGxhYmxlPHN0cmluZz4+KENBQ0hFX0tFWVMuQ1VSUkVOVF9GT0xERVJfSUQsIG51bGwpO1xuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVJlZHVjZXIoXG4gICAgKHByZXZpb3VzOiBWYXVsdFN0YXRlLCBuZXh0OiBQYXJ0aWFsPFZhdWx0U3RhdGU+KSA9PiAoeyAuLi5wcmV2aW91cywgLi4ubmV4dCB9KSxcbiAgICB7IC4uLmdldEluaXRpYWxTdGF0ZSgpLCAuLi5nZXRDYWNoZWRWYXVsdCgpIH1cbiAgKTtcblxuICB1c2VPbmNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc3luY09uTGF1bmNoKSB7XG4gICAgICB2b2lkIHN5bmNJdGVtcyh7IGlzSW5pdGlhbDogdHJ1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdm9pZCBsb2FkSXRlbXMoKTtcbiAgICB9XG4gIH0sIHNlc3Npb24uYWN0aXZlICYmIHNlc3Npb24udG9rZW4pO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIGxvYWRJdGVtcygpIHtcbiAgICB0cnkge1xuICAgICAgc2V0U3RhdGUoeyBpc0xvYWRpbmc6IHRydWUgfSk7XG5cbiAgICAgIGxldCBpdGVtczogSXRlbVtdID0gW107XG4gICAgICBsZXQgZm9sZGVyczogRm9sZGVyW10gPSBbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IFtpdGVtc1Jlc3VsdCwgZm9sZGVyc1Jlc3VsdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbYml0d2FyZGVuLmxpc3RJdGVtcygpLCBiaXR3YXJkZW4ubGlzdEZvbGRlcnMoKV0pO1xuICAgICAgICBpZiAoaXRlbXNSZXN1bHQuZXJyb3IpIHRocm93IGl0ZW1zUmVzdWx0LmVycm9yO1xuICAgICAgICBpZiAoZm9sZGVyc1Jlc3VsdC5lcnJvcikgdGhyb3cgZm9sZGVyc1Jlc3VsdC5lcnJvcjtcbiAgICAgICAgaXRlbXMgPSBpdGVtc1Jlc3VsdC5yZXN1bHQ7XG4gICAgICAgIGZvbGRlcnMgPSBmb2xkZXJzUmVzdWx0LnJlc3VsdDtcbiAgICAgICAgaXRlbXMuc29ydChmYXZvcml0ZUl0ZW1zRmlyc3RTb3J0ZXIpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcHVibGlzaEl0ZW1zKG5ldyBGYWlsZWRUb0xvYWRWYXVsdEl0ZW1zRXJyb3IoKSk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuXG4gICAgICBzZXRTdGF0ZSh7IGl0ZW1zLCBmb2xkZXJzIH0pO1xuICAgICAgcHVibGlzaEl0ZW1zKGl0ZW1zKTtcbiAgICAgIGNhY2hlVmF1bHQoaXRlbXMsIGZvbGRlcnMpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuRmFpbHVyZSwgXCJGYWlsZWQgdG8gbG9hZCB2YXVsdCBpdGVtc1wiLCBnZXREaXNwbGF5YWJsZUVycm9yTWVzc2FnZShlcnJvcikpO1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsb2FkIHZhdWx0IGl0ZW1zXCIsIGVycm9yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0U3RhdGUoeyBpc0xvYWRpbmc6IGZhbHNlIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIHN5bmNJdGVtcyhwcm9wcz86IHsgaXNJbml0aWFsPzogYm9vbGVhbiB9KSB7XG4gICAgY29uc3QgeyBpc0luaXRpYWwgPSBmYWxzZSB9ID0gcHJvcHMgPz8ge307XG5cbiAgICBjb25zdCB0b2FzdCA9IGF3YWl0IHNob3dUb2FzdCh7XG4gICAgICB0aXRsZTogXCJTeW5jaW5nIFZhdWx0Li4uXCIsXG4gICAgICBtZXNzYWdlOiBpc0luaXRpYWwgPyBcIkJhY2tncm91bmQgVGFza1wiIDogdW5kZWZpbmVkLFxuICAgICAgc3R5bGU6IFRvYXN0LlN0eWxlLkFuaW1hdGVkLFxuICAgIH0pO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBiaXR3YXJkZW4uc3luYygpO1xuICAgICAgYXdhaXQgbG9hZEl0ZW1zKCk7XG4gICAgICBhd2FpdCB0b2FzdC5oaWRlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF3YWl0IGJpdHdhcmRlbi5sb2dvdXQoKTtcbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuRmFpbHVyZTtcbiAgICAgIHRvYXN0LnRpdGxlID0gXCJGYWlsZWQgdG8gc3luYyB2YXVsdFwiO1xuICAgICAgdG9hc3QubWVzc2FnZSA9IGdldERpc3BsYXlhYmxlRXJyb3JNZXNzYWdlKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRDdXJyZW50Rm9sZGVyKGZvbGRlck9ySWQ6IE51bGxhYmxlPHN0cmluZyB8IEZvbGRlcj4pIHtcbiAgICBzZXRDdXJyZW50Rm9sZGVySWQodHlwZW9mIGZvbGRlck9ySWQgPT09IFwic3RyaW5nXCIgPyBmb2xkZXJPcklkIDogZm9sZGVyT3JJZD8uaWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlU3RhdGUobmV4dDogUmVhY3QuU2V0U3RhdGVBY3Rpb248VmF1bHRTdGF0ZT4pIHtcbiAgICBjb25zdCBuZXdTdGF0ZSA9IHR5cGVvZiBuZXh0ID09PSBcImZ1bmN0aW9uXCIgPyBuZXh0KHN0YXRlKSA6IG5leHQ7XG4gICAgc2V0U3RhdGUobmV3U3RhdGUpO1xuICAgIGNhY2hlVmF1bHQobmV3U3RhdGUuaXRlbXMsIG5ld1N0YXRlLmZvbGRlcnMpO1xuICB9XG5cbiAgY29uc3QgbWVtb2l6ZWRWYWx1ZTogVmF1bHRDb250ZXh0VHlwZSA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKHtcbiAgICAgIC4uLnN0YXRlLFxuICAgICAgaXRlbXM6IGZpbHRlckl0ZW1zQnlGb2xkZXJJZChzdGF0ZS5pdGVtcywgY3VycmVudEZvbGRlcklkKSxcbiAgICAgIGlzRW1wdHk6IHN0YXRlLml0ZW1zLmxlbmd0aCA9PSAwLFxuICAgICAgaXNMb2FkaW5nOiBzdGF0ZS5pc0xvYWRpbmcgfHwgc2Vzc2lvbi5pc0xvYWRpbmcsXG4gICAgICBjdXJyZW50Rm9sZGVySWQsXG4gICAgICBzeW5jSXRlbXMsXG4gICAgICBsb2FkSXRlbXMsXG4gICAgICBzZXRDdXJyZW50Rm9sZGVyLFxuICAgICAgdXBkYXRlU3RhdGUsXG4gICAgfSksXG4gICAgW3N0YXRlLCBzZXNzaW9uLmlzTG9hZGluZywgY3VycmVudEZvbGRlcklkLCBzeW5jSXRlbXMsIGxvYWRJdGVtcywgc2V0Q3VycmVudEZvbGRlciwgdXBkYXRlU3RhdGVdXG4gICk7XG5cbiAgcmV0dXJuIDxWYXVsdENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e21lbW9pemVkVmFsdWV9PntjaGlsZHJlbn08L1ZhdWx0Q29udGV4dC5Qcm92aWRlcj47XG59XG5cbmZ1bmN0aW9uIGZpbHRlckl0ZW1zQnlGb2xkZXJJZChpdGVtczogSXRlbVtdLCBmb2xkZXJJZDogTnVsbGFibGU8c3RyaW5nPikge1xuICBpZiAoIWZvbGRlcklkIHx8IGZvbGRlcklkID09PSBGT0xERVJfT1BUSU9OUy5BTEwpIHJldHVybiBpdGVtcztcbiAgaWYgKGZvbGRlcklkID09PSBGT0xERVJfT1BUSU9OUy5OT19GT0xERVIpIHJldHVybiBpdGVtcy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZm9sZGVySWQgPT09IG51bGwpO1xuICByZXR1cm4gaXRlbXMuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmZvbGRlcklkID09PSBmb2xkZXJJZCk7XG59XG5cbmZ1bmN0aW9uIGZhdm9yaXRlSXRlbXNGaXJzdFNvcnRlcihhOiBJdGVtLCBiOiBJdGVtKSB7XG4gIGlmIChhLmZhdm9yaXRlICYmIGIuZmF2b3JpdGUpIHJldHVybiAwO1xuICByZXR1cm4gYS5mYXZvcml0ZSA/IC0xIDogMTtcbn1cblxuZXhwb3J0IGNvbnN0IHVzZVZhdWx0Q29udGV4dCA9ICgpID0+IHtcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoVmF1bHRDb250ZXh0KTtcbiAgaWYgKGNvbnRleHQgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcInVzZVZhdWx0IG11c3QgYmUgdXNlZCB3aXRoaW4gYSBWYXVsdFByb3ZpZGVyXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNvbnRleHQ7XG59O1xuIiwgImltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIE11dGFibGVSZWZPYmplY3QsIFJlYWN0Tm9kZSwgdXNlQ29udGV4dCwgdXNlTWVtbywgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBJdGVtIH0gZnJvbSBcIn4vdHlwZXMvdmF1bHRcIjtcbmltcG9ydCB7IEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvciB9IGZyb20gXCJ+L3V0aWxzL2Vycm9yc1wiO1xuXG5leHBvcnQgdHlwZSBJdGVtTGlzdGVuZXIgPSAoaXRlbTogSXRlbSB8IEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvcikgPT4gdm9pZDtcblxuZXhwb3J0IHR5cGUgVmF1bHRMaXN0ZW5lcnNDb250ZXh0VHlwZSA9IHtcbiAgbGlzdGVuZXJzOiBNdXRhYmxlUmVmT2JqZWN0PE1hcDxzdHJpbmcsIEl0ZW1MaXN0ZW5lcj4+O1xuICBzdWJzY3JpYmVJdGVtOiAoaXRlbUlkOiBzdHJpbmcsIGxpc3RlbmVyOiBJdGVtTGlzdGVuZXIpID0+ICgpID0+IHZvaWQ7XG4gIHB1Ymxpc2hJdGVtczogKGl0ZW1zOiBJdGVtW10gfCBGYWlsZWRUb0xvYWRWYXVsdEl0ZW1zRXJyb3IpID0+IHZvaWQ7XG59O1xuXG5jb25zdCBWYXVsdExpc3RlbmVyc0NvbnRleHQgPSBjcmVhdGVDb250ZXh0PFZhdWx0TGlzdGVuZXJzQ29udGV4dFR5cGUgfCBudWxsPihudWxsKTtcblxuY29uc3QgVmF1bHRMaXN0ZW5lcnNQcm92aWRlciA9ICh7IGNoaWxkcmVuIH06IHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9KSA9PiB7XG4gIGNvbnN0IGxpc3RlbmVycyA9IHVzZVJlZihuZXcgTWFwPHN0cmluZywgSXRlbUxpc3RlbmVyPigpKTtcblxuICBjb25zdCBwdWJsaXNoSXRlbXMgPSAoaXRlbXNPckVycm9yOiBJdGVtW10gfCBGYWlsZWRUb0xvYWRWYXVsdEl0ZW1zRXJyb3IpID0+IHtcbiAgICBpZiAoaXRlbXNPckVycm9yIGluc3RhbmNlb2YgRmFpbGVkVG9Mb2FkVmF1bHRJdGVtc0Vycm9yKSB7XG4gICAgICBsaXN0ZW5lcnMuY3VycmVudC5mb3JFYWNoKChsaXN0ZW5lcikgPT4gbGlzdGVuZXIoaXRlbXNPckVycm9yKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3RlbmVycy5jdXJyZW50LmZvckVhY2goKGxpc3RlbmVyLCBpdGVtSWQpID0+IHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zT3JFcnJvci5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBpdGVtSWQpO1xuICAgICAgICBpZiAoaXRlbSkgbGlzdGVuZXIoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgc3Vic2NyaWJlSXRlbSA9IChpdGVtSWQ6IHN0cmluZywgbGlzdGVuZXI6IEl0ZW1MaXN0ZW5lcikgPT4ge1xuICAgIGxpc3RlbmVycy5jdXJyZW50LnNldChpdGVtSWQsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgbGlzdGVuZXJzLmN1cnJlbnQuZGVsZXRlKGl0ZW1JZCk7XG4gICAgfTtcbiAgfTtcblxuICBjb25zdCBtZW1vaXplZFZhbHVlID0gdXNlTWVtbygoKSA9PiAoeyBsaXN0ZW5lcnMsIHB1Ymxpc2hJdGVtcywgc3Vic2NyaWJlSXRlbSB9KSwgW10pO1xuXG4gIHJldHVybiA8VmF1bHRMaXN0ZW5lcnNDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXttZW1vaXplZFZhbHVlfT57Y2hpbGRyZW59PC9WYXVsdExpc3RlbmVyc0NvbnRleHQuUHJvdmlkZXI+O1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZVZhdWx0SXRlbVB1Ymxpc2hlciA9ICgpID0+IHtcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoVmF1bHRMaXN0ZW5lcnNDb250ZXh0KTtcbiAgaWYgKGNvbnRleHQgPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwidXNlVmF1bHRJdGVtUHVibGlzaGVyIG11c3QgYmUgdXNlZCB3aXRoaW4gYSBWYXVsdExpc3RlbmVyc1Byb3ZpZGVyXCIpO1xuXG4gIHJldHVybiBjb250ZXh0LnB1Ymxpc2hJdGVtcztcbn07XG5cbi8qKiBBbGxvd3MgeW91IHRvIHN1YnNjcmliZSB0byBhIHNwZWNpZmljIGl0ZW0gYW5kIGdldCBub3RpZmllZCB3aGVuIGl0IGNoYW5nZXMuICovXG5leHBvcnQgY29uc3QgdXNlVmF1bHRJdGVtU3Vic2NyaWJlciA9ICgpID0+IHtcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoVmF1bHRMaXN0ZW5lcnNDb250ZXh0KTtcbiAgaWYgKGNvbnRleHQgPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwidXNlVmF1bHRJdGVtU3Vic2NyaWJlciBtdXN0IGJlIHVzZWQgd2l0aGluIGEgVmF1bHRMaXN0ZW5lcnNQcm92aWRlclwiKTtcblxuICByZXR1cm4gKGl0ZW1JZDogc3RyaW5nKSA9PiB7XG4gICAgbGV0IHRpbWVvdXRJZDogTm9kZUpTLlRpbWVvdXQ7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2U8SXRlbT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdW5zdWJzY3JpYmUgPSBjb250ZXh0LnN1YnNjcmliZUl0ZW0oaXRlbUlkLCAoaXRlbU9yRXJyb3IpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICAgIGlmIChpdGVtT3JFcnJvciBpbnN0YW5jZW9mIEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgaXRlbU9yRXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUoaXRlbU9yRXJyb3IpO1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgcmVqZWN0KG5ldyBTdWJzY3JpYmVyVGltZW91dEVycm9yKCkpO1xuICAgICAgfSwgMTUwMDApO1xuICAgIH0pO1xuICB9O1xufTtcblxuY2xhc3MgU3Vic2NyaWJlclRpbWVvdXRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoXCJUaW1lZCBvdXQgd2FpdGluZyBmb3IgaXRlbVwiKTtcbiAgICB0aGlzLm5hbWUgPSBcIlN1YnNjcmliZXJUaW1lb3V0RXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWYXVsdExpc3RlbmVyc1Byb3ZpZGVyO1xuIiwgImltcG9ydCB7IGdldFByZWZlcmVuY2VWYWx1ZXMgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBwcmVwYXJlRm9sZGVyc0ZvckNhY2hlLCBwcmVwYXJlSXRlbXNGb3JDYWNoZSB9IGZyb20gXCJ+L2NvbXBvbmVudHMvc2VhcmNoVmF1bHQvdXRpbHMvY2FjaGluZ1wiO1xuaW1wb3J0IHsgQ0FDSEVfS0VZUyB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBGb2xkZXIsIEl0ZW0sIFZhdWx0IH0gZnJvbSBcIn4vdHlwZXMvdmF1bHRcIjtcbmltcG9ydCB7IENhY2hlIH0gZnJvbSBcIn4vdXRpbHMvY2FjaGVcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuaW1wb3J0IHsgdXNlQ29udGVudEVuY3J5cHRvciB9IGZyb20gXCJ+L3V0aWxzL2hvb2tzL3VzZUNvbnRlbnRFbmNyeXB0b3JcIjtcbmltcG9ydCB1c2VPbmNlRWZmZWN0IGZyb20gXCJ+L3V0aWxzL2hvb2tzL3VzZU9uY2VFZmZlY3RcIjtcblxuZnVuY3Rpb24gdXNlVmF1bHRDYWNoaW5nKCkge1xuICBjb25zdCB7IGVuY3J5cHQsIGRlY3J5cHQgfSA9IHVzZUNvbnRlbnRFbmNyeXB0b3IoKTtcbiAgY29uc3QgaXNDYWNoaW5nRW5hYmxlID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcy5TZWFyY2g+KCkuc2hvdWxkQ2FjaGVWYXVsdEl0ZW1zO1xuXG4gIHVzZU9uY2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIHVzZXJzIHRoYXQgb3B0IG91dCBvZiBjYWNoaW5nIHByb2JhYmx5IHdhbnQgdG8gZGVsZXRlIGFueSBjYWNoZWQgZGF0YVxuICAgIGlmICghQ2FjaGUuaXNFbXB0eSkgQ2FjaGUuY2xlYXIoKTtcbiAgfSwgIWlzQ2FjaGluZ0VuYWJsZSk7XG5cbiAgY29uc3QgZ2V0Q2FjaGVkVmF1bHQgPSAoKTogVmF1bHQgPT4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWlzQ2FjaGluZ0VuYWJsZSkgdGhyb3cgbmV3IFZhdWx0Q2FjaGluZ05vRW5hYmxlZEVycm9yKCk7XG5cbiAgICAgIGNvbnN0IGNhY2hlZEl2ID0gQ2FjaGUuZ2V0KENBQ0hFX0tFWVMuSVYpO1xuICAgICAgY29uc3QgY2FjaGVkRW5jcnlwdGVkVmF1bHQgPSBDYWNoZS5nZXQoQ0FDSEVfS0VZUy5WQVVMVCk7XG4gICAgICBpZiAoIWNhY2hlZEl2IHx8ICFjYWNoZWRFbmNyeXB0ZWRWYXVsdCkgdGhyb3cgbmV3IFZhdWx0Q2FjaGluZ05vRW5hYmxlZEVycm9yKCk7XG5cbiAgICAgIGNvbnN0IGRlY3J5cHRlZFZhdWx0ID0gZGVjcnlwdChjYWNoZWRFbmNyeXB0ZWRWYXVsdCwgY2FjaGVkSXYpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2U8VmF1bHQ+KGRlY3J5cHRlZFZhdWx0KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBWYXVsdENhY2hpbmdOb0VuYWJsZWRFcnJvcikpIHtcbiAgICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBkZWNyeXB0IGNhY2hlZCB2YXVsdFwiLCBlcnJvcik7XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpdGVtczogW10sIGZvbGRlcnM6IFtdIH07XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGNhY2hlVmF1bHQgPSAoaXRlbXM6IEl0ZW1bXSwgZm9sZGVyczogRm9sZGVyW10pOiB2b2lkID0+IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFpc0NhY2hpbmdFbmFibGUpIHRocm93IG5ldyBWYXVsdENhY2hpbmdOb0VuYWJsZWRFcnJvcigpO1xuXG4gICAgICBjb25zdCB2YXVsdFRvRW5jcnlwdCA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgaXRlbXM6IHByZXBhcmVJdGVtc0ZvckNhY2hlKGl0ZW1zKSxcbiAgICAgICAgZm9sZGVyczogcHJlcGFyZUZvbGRlcnNGb3JDYWNoZShmb2xkZXJzKSxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZW5jcnlwdGVkVmF1bHQgPSBlbmNyeXB0KHZhdWx0VG9FbmNyeXB0KTtcbiAgICAgIENhY2hlLnNldChDQUNIRV9LRVlTLlZBVUxULCBlbmNyeXB0ZWRWYXVsdC5jb250ZW50KTtcbiAgICAgIENhY2hlLnNldChDQUNIRV9LRVlTLklWLCBlbmNyeXB0ZWRWYXVsdC5pdik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgVmF1bHRDYWNoaW5nTm9FbmFibGVkRXJyb3IpKSB7XG4gICAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gY2FjaGUgdmF1bHRcIiwgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICByZXR1cm4geyBnZXRDYWNoZWRWYXVsdCwgY2FjaGVWYXVsdCB9O1xufVxuXG5jbGFzcyBWYXVsdENhY2hpbmdOb0VuYWJsZWRFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbmV4cG9ydCBkZWZhdWx0IHVzZVZhdWx0Q2FjaGluZztcbiIsICJpbXBvcnQgeyBnZXRQcmVmZXJlbmNlVmFsdWVzIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgY3JlYXRlQ2lwaGVyaXYsIGNyZWF0ZURlY2lwaGVyaXYsIGNyZWF0ZUhhc2gsIHJhbmRvbUJ5dGVzIH0gZnJvbSBcImNyeXB0b1wiO1xuaW1wb3J0IHsgdXNlTWVtbyB9IGZyb20gXCJyZWFjdFwiO1xuXG5jb25zdCBBTEdPUklUSE0gPSBcImFlcy0yNTYtY2JjXCI7XG5cbmV4cG9ydCB0eXBlIEVuY3J5cHRlZENvbnRlbnQgPSB7IGl2OiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZyB9O1xuXG4vKiogRW5jcnlwdHMgYW5kIGRlY3J5cHRzIGRhdGEgdXNpbmcgdGhlIHVzZXIncyBjbGllbnQgc2VjcmV0ICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQ29udGVudEVuY3J5cHRvcigpIHtcbiAgY29uc3QgeyBjbGllbnRTZWNyZXQgfSA9IGdldFByZWZlcmVuY2VWYWx1ZXM8UHJlZmVyZW5jZXM+KCk7XG4gIGNvbnN0IGNpcGhlcktleUJ1ZmZlciA9IHVzZU1lbW8oKCkgPT4gZ2V0MzJCaXRTZWNyZXRLZXlCdWZmZXIoY2xpZW50U2VjcmV0LnRyaW0oKSksIFtjbGllbnRTZWNyZXRdKTtcblxuICBjb25zdCBlbmNyeXB0ID0gKGRhdGE6IHN0cmluZyk6IEVuY3J5cHRlZENvbnRlbnQgPT4ge1xuICAgIGNvbnN0IGl2QnVmZmVyID0gcmFuZG9tQnl0ZXMoMTYpO1xuICAgIGNvbnN0IGNpcGhlciA9IGNyZWF0ZUNpcGhlcml2KEFMR09SSVRITSwgY2lwaGVyS2V5QnVmZmVyLCBpdkJ1ZmZlcik7XG4gICAgY29uc3QgZW5jcnlwdGVkQ29udGVudEJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW2NpcGhlci51cGRhdGUoZGF0YSksIGNpcGhlci5maW5hbCgpXSk7XG4gICAgcmV0dXJuIHsgaXY6IGl2QnVmZmVyLnRvU3RyaW5nKFwiaGV4XCIpLCBjb250ZW50OiBlbmNyeXB0ZWRDb250ZW50QnVmZmVyLnRvU3RyaW5nKFwiaGV4XCIpIH07XG4gIH07XG5cbiAgY29uc3QgZGVjcnlwdCA9IChjb250ZW50OiBzdHJpbmcsIGl2OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IGRlY2lwaGVyID0gY3JlYXRlRGVjaXBoZXJpdihBTEdPUklUSE0sIGNpcGhlcktleUJ1ZmZlciwgQnVmZmVyLmZyb20oaXYsIFwiaGV4XCIpKTtcbiAgICBjb25zdCBkZWNyeXB0ZWRDb250ZW50QnVmZmVyID0gQnVmZmVyLmNvbmNhdChbZGVjaXBoZXIudXBkYXRlKEJ1ZmZlci5mcm9tKGNvbnRlbnQsIFwiaGV4XCIpKSwgZGVjaXBoZXIuZmluYWwoKV0pO1xuICAgIHJldHVybiBkZWNyeXB0ZWRDb250ZW50QnVmZmVyLnRvU3RyaW5nKCk7XG4gIH07XG5cbiAgcmV0dXJuIHsgZW5jcnlwdCwgZGVjcnlwdCB9O1xufVxuXG5mdW5jdGlvbiBnZXQzMkJpdFNlY3JldEtleUJ1ZmZlcihrZXk6IHN0cmluZykge1xuICByZXR1cm4gQnVmZmVyLmZyb20oY3JlYXRlSGFzaChcInNoYTI1NlwiKS51cGRhdGUoa2V5KS5kaWdlc3QoXCJiYXNlNjRcIikuc2xpY2UoMCwgMzIpKTtcbn1cbiIsICJpbXBvcnQgeyBBY3Rpb24sIEFjdGlvblBhbmVsLCBDbGlwYm9hcmQsIEljb24sIExvY2FsU3RvcmFnZSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IERlYnVnZ2luZ0J1Z1JlcG9ydGluZ0FjdGlvblNlY3Rpb24gfSBmcm9tIFwifi9jb21wb25lbnRzL2FjdGlvbnNcIjtcbmltcG9ydCB7IExPQ0FMX1NUT1JBR0VfS0VZIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcbmltcG9ydCB7IHNob3dDb3B5U3VjY2Vzc01lc3NhZ2UgfSBmcm9tIFwifi91dGlscy9jbGlwYm9hcmRcIjtcbmltcG9ydCB7IGdldFRyYW5zaWVudENvcHlQcmVmZXJlbmNlIH0gZnJvbSBcIn4vdXRpbHMvcHJlZmVyZW5jZXNcIjtcblxuZXhwb3J0IHR5cGUgR2VuZXJhdGVQYXNzd29yZEFjdGlvblBhbmVsUHJvcHMgPSB7XG4gIHBhc3N3b3JkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIHJlZ2VuZXJhdGVQYXNzd29yZDogKCkgPT4gdm9pZDtcbn07XG5cbmNvbnN0IEdlbmVyYXRlUGFzc3dvcmRBY3Rpb25QYW5lbCA9IChwcm9wczogR2VuZXJhdGVQYXNzd29yZEFjdGlvblBhbmVsUHJvcHMpID0+IHtcbiAgY29uc3QgeyBwYXNzd29yZCwgcmVnZW5lcmF0ZVBhc3N3b3JkIH0gPSBwcm9wcztcblxuICBjb25zdCBoYW5kbGVDb3B5ID0gKHBhc3N3b3JkOiBzdHJpbmcpID0+IGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCBDbGlwYm9hcmQuY29weShwYXNzd29yZCwgeyB0cmFuc2llbnQ6IGdldFRyYW5zaWVudENvcHlQcmVmZXJlbmNlKFwicGFzc3dvcmRcIikgfSk7XG4gICAgYXdhaXQgc2hvd0NvcHlTdWNjZXNzTWVzc2FnZShcIkNvcGllZCBwYXNzd29yZCB0byBjbGlwYm9hcmRcIik7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8QWN0aW9uUGFuZWw+XG4gICAgICB7ISFwYXNzd29yZCAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPEFjdGlvblxuICAgICAgICAgICAgdGl0bGU9XCJDb3B5IFBhc3N3b3JkXCJcbiAgICAgICAgICAgIGljb249e0ljb24uQ2xpcGJvYXJkfVxuICAgICAgICAgICAgb25BY3Rpb249e2hhbmRsZUNvcHkocGFzc3dvcmQpfVxuICAgICAgICAgICAgc2hvcnRjdXQ9e3sgbWFjT1M6IHsga2V5OiBcImVudGVyXCIsIG1vZGlmaWVyczogW1wib3B0XCJdIH0sIHdpbmRvd3M6IHsga2V5OiBcImVudGVyXCIsIG1vZGlmaWVyczogW1wiYWx0XCJdIH0gfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxBY3Rpb24uUGFzdGVcbiAgICAgICAgICAgIHRpdGxlPVwiUGFzdGUgUGFzc3dvcmQgdG8gQWN0aXZlIEFwcFwiXG4gICAgICAgICAgICBpY29uPXtJY29uLlRleHR9XG4gICAgICAgICAgICBjb250ZW50PXtwYXNzd29yZH1cbiAgICAgICAgICAgIHNob3J0Y3V0PXt7XG4gICAgICAgICAgICAgIGtleTogXCJlbnRlclwiLFxuICAgICAgICAgICAgICBtYWNPUzogeyBrZXk6IFwiZW50ZXJcIiwgbW9kaWZpZXJzOiBbXCJvcHRcIiwgXCJzaGlmdFwiXSB9LFxuICAgICAgICAgICAgICB3aW5kb3dzOiB7IGtleTogXCJlbnRlclwiLCBtb2RpZmllcnM6IFtcImFsdFwiLCBcInNoaWZ0XCJdIH0sXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICAgIDxBY3Rpb25cbiAgICAgICAgdGl0bGU9XCJSZWdlbmVyYXRlIFBhc3N3b3JkXCJcbiAgICAgICAgaWNvbj17SWNvbi5BcnJvd0Nsb2Nrd2lzZX1cbiAgICAgICAgc2hvcnRjdXQ9e3tcbiAgICAgICAgICBtYWNPUzogeyBrZXk6IFwiYmFja3NwYWNlXCIsIG1vZGlmaWVyczogW1wib3B0XCJdIH0sXG4gICAgICAgICAgd2luZG93czogeyBrZXk6IFwiYmFja3NwYWNlXCIsIG1vZGlmaWVyczogW1wiYWx0XCJdIH0sXG4gICAgICAgIH19XG4gICAgICAgIC8qIGF2b2lkIHBhc3NpbmcgYSByZWZlcmVuY2UgdG8gb25BY3Rpb24gYmVjYXVzZSwgZm9yIHNvbWUgcmVhc29uLCBhIHN0cmluZ1xuICAgICAgICBpcyBwYXNzZWQgdG8gaXQsIGV2ZW4gdGhvdWdoIHRoZSB0eXBlIHNheXMgb3RoZXJ3aXNlIFx1RDgzRVx1REQxNCAqL1xuICAgICAgICBvbkFjdGlvbj17KCkgPT4gcmVnZW5lcmF0ZVBhc3N3b3JkKCl9XG4gICAgICAvPlxuICAgICAgPERlYnVnZ2luZ0J1Z1JlcG9ydGluZ0FjdGlvblNlY3Rpb24gLz5cbiAgICAgIHtwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiICYmIChcbiAgICAgICAgPEFjdGlvbiB0aXRsZT1cIkNsZWFyIHN0b3JhZ2VcIiBpY29uPXtJY29uLlRyYXNofSBvbkFjdGlvbj17Y2xlYXJTdG9yYWdlfSAvPlxuICAgICAgKX1cbiAgICA8L0FjdGlvblBhbmVsPlxuICApO1xufTtcblxuYXN5bmMgZnVuY3Rpb24gY2xlYXJTdG9yYWdlKCkge1xuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3QudmFsdWVzKExPQ0FMX1NUT1JBR0VfS0VZKSkge1xuICAgIGF3YWl0IExvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2VuZXJhdGVQYXNzd29yZEFjdGlvblBhbmVsO1xuIiwgImltcG9ydCB7IFRvYXN0LCBnZXRQcmVmZXJlbmNlVmFsdWVzLCBwb3BUb1Jvb3QsIHNob3dIVUQsIHNob3dUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IGNhcGl0YWxpemUgfSBmcm9tIFwifi91dGlscy9zdHJpbmdzXCI7XG5cbi8qKiBEaXNwbGF5cyBhIEhVRCBvciBUb2FzdCBhbmQgY2xvc2VzIHRoZSB3aW5kb3cgb3Igbm90LCBkZXBlbmRpbmcgb24gdGhlIHByZWZlcmVuY2VzLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNob3dDb3B5U3VjY2Vzc01lc3NhZ2UodGl0bGU6IHN0cmluZywgbWVzc2FnZT86IHN0cmluZykge1xuICBjb25zdCBhY3Rpb24gPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpLndpbmRvd0FjdGlvbk9uQ29weTtcbiAgY29uc3QgbWVzc2FnZVRpdGxlID0gY2FwaXRhbGl6ZSh0aXRsZSwgdHJ1ZSk7XG5cbiAgaWYgKGFjdGlvbiA9PT0gXCJrZWVwT3BlblwiKSB7XG4gICAgYXdhaXQgc2hvd1RvYXN0KHsgdGl0bGU6IG1lc3NhZ2VUaXRsZSwgbWVzc2FnZSwgc3R5bGU6IFRvYXN0LlN0eWxlLlN1Y2Nlc3MgfSk7XG4gIH0gZWxzZSBpZiAoYWN0aW9uID09PSBcImNsb3NlQW5kUG9wVG9Sb290XCIpIHtcbiAgICBhd2FpdCBzaG93SFVEKG1lc3NhZ2VUaXRsZSk7XG4gICAgYXdhaXQgcG9wVG9Sb290KCk7XG4gIH0gZWxzZSB7XG4gICAgYXdhaXQgc2hvd0hVRChtZXNzYWdlVGl0bGUpO1xuICB9XG59XG4iLCAiZXhwb3J0IGNvbnN0IGNhcGl0YWxpemUgPSAodmFsdWU6IHN0cmluZywgbG93ZXJjYXNlUmVzdCA9IGZhbHNlKSA9PiB7XG4gIGNvbnN0IGZpcnN0TGV0dGVyID0gdmFsdWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCk7XG4gIGNvbnN0IHJlc3QgPSBsb3dlcmNhc2VSZXN0ID8gdmFsdWUuc2xpY2UoMSkudG9Mb3dlckNhc2UoKSA6IHZhbHVlLnNsaWNlKDEpO1xuXG4gIHJldHVybiBmaXJzdExldHRlciArIHJlc3Q7XG59O1xuIiwgImltcG9ydCB7IGVudmlyb25tZW50LCBzaG93VG9hc3QsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgQ29tcG9uZW50LCBFcnJvckluZm8sIFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFRyb3VibGVzaG9vdGluZ0d1aWRlIGZyb20gXCJ+L2NvbXBvbmVudHMvVHJvdWJsZXNob290aW5nR3VpZGVcIjtcbmltcG9ydCB7IE1hbnVhbGx5VGhyb3duRXJyb3IgfSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcblxudHlwZSBQcm9wcyA9IHtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59O1xuXG50eXBlIFN0YXRlID0ge1xuICBoYXNFcnJvcjogYm9vbGVhbjtcbiAgZXJyb3I/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb290RXJyb3JCb3VuZGFyeSBleHRlbmRzIENvbXBvbmVudDxQcm9wcywgU3RhdGU+IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7IGhhc0Vycm9yOiBmYWxzZSB9O1xuICB9XG5cbiAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcigpIHtcbiAgICByZXR1cm4geyBoYXNFcnJvcjogdHJ1ZSB9O1xuICB9XG5cbiAgYXN5bmMgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3I6IEVycm9yLCBlcnJvckluZm86IEVycm9ySW5mbykge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIE1hbnVhbGx5VGhyb3duRXJyb3IpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoKHN0YXRlKSA9PiAoeyAuLi5zdGF0ZSwgaGFzRXJyb3I6IHRydWUsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pKTtcbiAgICAgIGF3YWl0IHNob3dUb2FzdChUb2FzdC5TdHlsZS5GYWlsdXJlLCBlcnJvci5tZXNzYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGVudmlyb25tZW50LmlzRGV2ZWxvcG1lbnQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSgoc3RhdGUpID0+ICh7IC4uLnN0YXRlLCBoYXNFcnJvcjogdHJ1ZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSkpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yOlwiLCBlcnJvciwgZXJyb3JJbmZvKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmhhc0Vycm9yKSByZXR1cm4gPFRyb3VibGVzaG9vdGluZ0d1aWRlIGVycm9yPXt0aGlzLnN0YXRlLmVycm9yfSAvPjtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIDxUcm91Ymxlc2hvb3RpbmdHdWlkZSAvPjtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBGb3JtIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgdXNlRm9ybSB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuaW1wb3J0IHsgdXNlRWZmZWN0IH0gZnJvbSBcInJlYWN0XCI7XG5cbmV4cG9ydCBjb25zdCBDdXN0b21WYWxpZGF0aW9ucyA9IHtcbiAgTnVtYmVyU3RyaW5nQmV0d2VlbjogKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikgPT4ge1xuICAgIHJldHVybiAodmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCkgPT4ge1xuICAgICAgY29uc3QgbnVtID0gdmFsdWUgIT09IFwiXCIgPyBOdW1iZXIodmFsdWUpIDogTmFOO1xuICAgICAgaWYgKGlzTmFOKG51bSkgfHwgbnVtIDwgbWluIHx8IG51bSA+IG1heCkgcmV0dXJuIGBNdXN0IGJlIGJldHdlZW4gJHttaW59IGFuZCAke21heH1gO1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICB9LFxuICBPbmVDaGFyYWN0ZXI6ICh2YWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkKSA9PiB7XG4gICAgaWYgKCF2YWx1ZSB8fCB2YWx1ZS5sZW5ndGggIT09IDEpIHJldHVybiBcIk11c3QgYmUgb25lIGNoYXJhY3RlclwiO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0sXG59O1xuXG5leHBvcnQgY29uc3Qgc3RyaW5naWZ5Qm9vbGVhbkl0ZW1Qcm9wcyA9IDxUVmFsdWUgZXh0ZW5kcyBzdHJpbmc+KFxuICBpdGVtUHJvcHM6IEZvcm0uSXRlbVByb3BzPGJvb2xlYW4+LFxuICB0cnVlVmFsdWU6IFRWYWx1ZSxcbiAgZmFsc2VWYWx1ZTogVFZhbHVlXG4pOiBGb3JtLkl0ZW1Qcm9wczxzdHJpbmc+ID0+ICh7XG4gIC4uLml0ZW1Qcm9wcyxcbiAgZGVmYXVsdFZhbHVlOiBpdGVtUHJvcHMudmFsdWUgPyB0cnVlVmFsdWUgOiBmYWxzZVZhbHVlLFxuICB2YWx1ZTogaXRlbVByb3BzLnZhbHVlID8gdHJ1ZVZhbHVlIDogZmFsc2VWYWx1ZSxcbiAgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gaXRlbVByb3BzLm9uQ2hhbmdlPy4odmFsdWUgPT09IHRydWVWYWx1ZSksXG4gIG9uQmx1cjogKGV2ZW50KSA9PiB7XG4gICAgaXRlbVByb3BzLm9uQmx1cj8uKHsgLi4uZXZlbnQsIHRhcmdldDogeyAuLi5ldmVudC50YXJnZXQsIHZhbHVlOiBldmVudC50YXJnZXQudmFsdWUgPT09IHRydWVWYWx1ZSB9IH0pO1xuICB9LFxuICBvbkZvY3VzOiAoZXZlbnQpID0+IHtcbiAgICBpdGVtUHJvcHMub25Gb2N1cz8uKHsgLi4uZXZlbnQsIHRhcmdldDogeyAuLi5ldmVudC50YXJnZXQsIHZhbHVlOiBldmVudC50YXJnZXQudmFsdWUgPT09IHRydWVWYWx1ZSB9IH0pO1xuICB9LFxufSk7XG5cbnR5cGUgVXNlRm9ybVByb3BzPFQgZXh0ZW5kcyBGb3JtLlZhbHVlcz4gPSBQYXJhbWV0ZXJzPHR5cGVvZiB1c2VGb3JtPFQ+PlswXTtcbmV4cG9ydCBjb25zdCB1c2VPbkNoYW5nZUZvcm0gPSA8VCBleHRlbmRzIEZvcm0uVmFsdWVzPihcbiAgcHJvcHM6IE9taXQ8VXNlRm9ybVByb3BzPFQ+LCBcIm9uU3VibWl0XCI+ICYgeyBvbkNoYW5nZTogVXNlRm9ybVByb3BzPFQ+W1wib25TdWJtaXRcIl0gfVxuKSA9PiB7XG4gIGNvbnN0IGZvcm0gPSB1c2VGb3JtKHsgLi4ucHJvcHMsIG9uU3VibWl0OiBwcm9wcy5vbkNoYW5nZSB9KTtcbiAgdXNlRWZmZWN0KCgpID0+IHZvaWQgZm9ybS5oYW5kbGVTdWJtaXQoZm9ybS52YWx1ZXMpLCBbZm9ybS52YWx1ZXNdKTtcbiAgcmV0dXJuIGZvcm07XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQSxrQ0FBQUEsVUFBQUMsU0FBQTtBQUFBLElBQUFBLFFBQU8sVUFBVTtBQUNqQixVQUFNLE9BQU87QUFFYixRQUFJLEtBQUssUUFBUSxJQUFJO0FBRXJCLGFBQVMsYUFBY0MsT0FBTSxTQUFTO0FBQ3BDLFVBQUksVUFBVSxRQUFRLFlBQVksU0FDaEMsUUFBUSxVQUFVLFFBQVEsSUFBSTtBQUVoQyxVQUFJLENBQUMsU0FBUztBQUNaLGVBQU87QUFBQSxNQUNUO0FBRUEsZ0JBQVUsUUFBUSxNQUFNLEdBQUc7QUFDM0IsVUFBSSxRQUFRLFFBQVEsRUFBRSxNQUFNLElBQUk7QUFDOUIsZUFBTztBQUFBLE1BQ1Q7QUFDQSxlQUFTLElBQUksR0FBRyxJQUFJLFFBQVEsUUFBUSxLQUFLO0FBQ3ZDLFlBQUksSUFBSSxRQUFRLENBQUMsRUFBRSxZQUFZO0FBQy9CLFlBQUksS0FBS0EsTUFBSyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsWUFBWSxNQUFNLEdBQUc7QUFDbkQsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUNBLGFBQU87QUFBQSxJQUNUO0FBRUEsYUFBUyxVQUFXLE1BQU1BLE9BQU0sU0FBUztBQUN2QyxVQUFJLENBQUMsS0FBSyxlQUFlLEtBQUssQ0FBQyxLQUFLLE9BQU8sR0FBRztBQUM1QyxlQUFPO0FBQUEsTUFDVDtBQUNBLGFBQU8sYUFBYUEsT0FBTSxPQUFPO0FBQUEsSUFDbkM7QUFFQSxhQUFTLE1BQU9BLE9BQU0sU0FBUyxJQUFJO0FBQ2pDLFNBQUcsS0FBS0EsT0FBTSxTQUFVLElBQUksTUFBTTtBQUNoQyxXQUFHLElBQUksS0FBSyxRQUFRLFVBQVUsTUFBTUEsT0FBTSxPQUFPLENBQUM7QUFBQSxNQUNwRCxDQUFDO0FBQUEsSUFDSDtBQUVBLGFBQVMsS0FBTUEsT0FBTSxT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LFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQTtBQUFBLE1BR1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQTtBQUFBLE1BR1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQTtBQUFBLE1BR1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLGFBQWE7QUFBQSxNQUNiLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixnQkFBZ0I7QUFBQTtBQUFBLE1BR2hCLFdBQVc7QUFBQTtBQUFBLE1BQ1gsV0FBVztBQUFBO0FBQUEsTUFDWCxnQkFBZ0I7QUFBQSxNQUNoQixXQUFXO0FBQUE7QUFBQTtBQUFBLE1BR1gsVUFB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O0FBQUEsRUFBTztBQUFBLEVBRWhCO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBTTtBQUFBLEVBRWY7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFNO0FBQUEsRUFFZjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQUs7QUFBQSxFQUVkO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUNBO0FBQUEsSUFDQSxVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFNO0FBQUEsRUFFZjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLElBQ1QsUUFBTztBQUFBLEVBQUk7QUFBQSxFQUVYO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBTztBQUFBLEVBRWhCO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBTTtBQUFBLEVBRWY7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFNO0FBQUEsRUFFZjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLElBQ1QsUUFBTztBQUFBLEVBQUk7QUFBQSxFQUVYO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsSUFDVCxRQUFPO0FBQUEsRUFBSTtBQUFBLEVBRVg7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFLO0FBQUEsRUFFZDtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQUs7QUFBQSxFQUVkO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFLO0FBQUEsRUFFZDtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1As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LEdBQUcsVUFBVSxRQUFRLE9BQU0sMEJBQXlCLGFBQVksV0FBVTtBQUFBLFVBQzNGLDhDQUFDLGtCQUFLLFVBQUwsRUFBZSxHQUFHLFVBQVUsV0FBVyxPQUFNLHdCQUF1QixPQUFNLDZCQUE0QjtBQUFBLFVBQ3ZHLDhDQUFDLGtCQUFLLFVBQUwsRUFBZSxHQUFHLFVBQVUsV0FBVyxPQUFNLHdCQUF1QixPQUFNLDhCQUE2QjtBQUFBLFVBQ3hHLDhDQUFDLGtCQUFLLFVBQUwsRUFBZSxHQUFHLFVBQVUsUUFBUSxPQUFNLHNCQUFxQixPQUFNLGNBQWE7QUFBQSxVQUNsRixjQUFjLFVBQVUsT0FBTyxVQUM5Qiw4Q0FBQyxrQkFBSyxXQUFMLEVBQWdCLEdBQUcsVUFBVSxXQUFXLE9BQU0sbUJBQWtCLGFBQVksS0FBSTtBQUFBLFVBRW5GLDhDQUFDLGtCQUFLLFVBQUwsRUFBZSxHQUFHLFVBQVUsU0FBUyxPQUFNLHNCQUFxQixPQUFNLCtCQUE4QjtBQUFBLFVBQ3BHLGNBQWMsVUFBVSxPQUFPLFdBQzlCLDhDQUFDLGtCQUFLLFdBQUwsRUFBZ0IsR0FBRyxVQUFVLFlBQVksT0FBTSxtQkFBa0IsYUFBWSxLQUFJO0FBQUEsV0FFdEY7QUFBQTtBQUFBO0FBQUEsRUFFSjtBQUVKO0FBRUEsSUFBTyw0QkFBUTsiLAogICJuYW1lcyI6IFsiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoS2V5IiwgImVudmlyb25tZW50IiwgInBsYXRmb3JtIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInByb2Nlc3MiLCAidW5sb2FkIiwgImVtaXQiLCAibG9hZCIsICJwcm9jZXNzUmVhbGx5RXhpdCIsICJwcm9jZXNzRW1pdCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwcm9taXNpZnkiLCAiZ2V0U3RyZWFtIiwgInN0cmVhbSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgIm9wZW4iLCAiZXJyIiwgImVudHJ5IiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X25vZGVfcGF0aCIsICJpbXBvcnRfbm9kZV9wcm9jZXNzIiwgInBsYXRmb3JtIiwgInByb2Nlc3MiLCAidXJsIiwgInBhdGgiLCAib25ldGltZSIsICJpbXBvcnRfbm9kZV9vcyIsICJpbXBvcnRfbm9kZV9vcyIsICJvcyIsICJvbkV4aXQiLCAibWVyZ2VTdHJlYW0iLCAiZ2V0U3RyZWFtIiwgInByb2Nlc3MiLCAiY3Jvc3NTcGF3biIsICJwYXRoIiwgImNoaWxkUHJvY2VzcyIsICJpbXBvcnRfZnMiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9wYXRoIiwgImltcG9ydF9wcm9taXNlcyIsICJwYXRoIiwgInN0cmVhbVppcCIsICJpbXBvcnRfZnMiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfYXBpIiwgImNhcHR1cmVFeGNlcHRpb25SYXljYXN0IiwgImltcG9ydF9mcyIsICJ1cmwiLCAicGF0aCIsICJodHRwcyIsICJodHRwIiwgImltcG9ydF9hcGkiLCAiUmF5Y2FzdENhY2hlIiwgInVybCIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYXBpIiwgIiRoZ1VXMSR1c2VSZWYiLCAiJGhnVVcxJHVzZVN0YXRlIiwgIiRoZ1VXMSR1c2VSZWYiLCAiJGhnVVcxJHVzZUNhbGxiYWNrIiwgInZhbHVlcyIsICJ2YWxpZGF0aW9uIiwgImVycm9ycyIsICIkaGdVVzEkdXNlTWVtbyIsICJ2YWx1ZSIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9hcGkiLCAiY2FsbGJhY2tFeGVjIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9jaGlsZF9wcm9jZXNzIiwgImltcG9ydF91dGlsIiwgImltcG9ydF9mcyIsICJpbXBvcnRfcGF0aCIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiZXhlYyIsICJleGVjV2l0aENhbGxiYWNrcyIsICJzdXBwb3J0UGF0aCIsICJ0cnlFeGVjIiwgInBhdGgiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9qc3hfcnVudGltZSIsICJlcnJvciIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgInBhc3N3b3JkIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2pzeF9ydW50aW1lIl0KfQo=
