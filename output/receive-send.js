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

// src/receive-send.tsx
var receive_send_exports = {};
__export(receive_send_exports, {
  default: () => receive_send_default
});
module.exports = __toCommonJS(receive_send_exports);
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

// src/receive-send.tsx
var import_path4 = require("path");
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

// src/components/searchVault/utils/useVaultCaching.ts
var import_api25 = require("@raycast/api");

// src/utils/hooks/useContentEncryptor.ts
var import_api24 = require("@raycast/api");
var import_react11 = require("react");

// src/context/vault.tsx
var import_jsx_runtime16 = require("react/jsx-runtime");
var VaultContext = (0, import_react12.createContext)(null);
var { syncOnLaunch } = (0, import_api26.getPreferenceValues)();

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

// src/receive-send.tsx
var import_jsx_runtime19 = require("react/jsx-runtime");
var LoadingFallback2 = () => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form, { isLoading: true });
var ReceiveSendCommand = (props) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(RootErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(BitwardenProvider, { loadingFallback: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(LoadingFallback2, {}), children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(SessionProvider, { loadingFallback: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(LoadingFallback2, {}), unlock: true, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(ReceiveSendCommandContent, { ...props }) }) }) });
var cache = {
  setFilePath: (filePath) => Cache.set("sendFilePath", filePath),
  getFilePath: () => Cache.get("sendFilePath")
};
var getInitialValues = (args) => {
  const filePath = cache.getFilePath();
  return {
    url: args?.url || "",
    password: args?.password || "",
    filePaths: filePath ? [filePath] : []
  };
};
var stateReducer = (state, action) => {
  switch (action.status) {
    case "idle":
      return { status: "idle" };
    case "textRevealed":
      return { status: "textRevealed", sendInfo: action.sendInfo, text: action.text };
    case "pendingFile":
      return { status: "pendingFile", sendInfo: action.sendInfo };
    case "needsPassword":
      return { status: "needsPassword" };
  }
};
var withOnChangeEffect = (itemProps, onChange) => {
  return {
    ...itemProps,
    onChange: (value) => {
      itemProps.onChange?.(value);
      onChange(value);
    }
  };
};
function ReceiveSendCommandContent({ arguments: args }) {
  const bitwarden = useBitwarden();
  const [state, setState] = (0, import_react14.useReducer)(stateReducer, { status: "idle" });
  const urlFieldRef = (0, import_react14.useRef)(null);
  const passwordFieldRef = (0, import_react14.useRef)(null);
  const filePathFieldRef = (0, import_react14.useRef)(null);
  const { itemProps, handleSubmit, values, reset } = $79498421851e7e84$export$87c0cf8eb5a167e0({
    initialValues: getInitialValues(args),
    validation: {
      url: $79498421851e7e84$export$cd58ffd7e3880e66.Required,
      password: state.status === "needsPassword" ? $79498421851e7e84$export$cd58ffd7e3880e66.Required : void 0,
      filePaths: state.status === "pendingFile" ? $79498421851e7e84$export$cd58ffd7e3880e66.Required : void 0
    },
    onSubmit: async (values2) => {
      if (state.status === "idle" || state.status === "needsPassword") {
        await receiveSend(values2.url, values2.password);
      } else if (state.status === "pendingFile" && values2.filePaths[0] && state.sendInfo.type === 1 /* File */) {
        await downloadFile(values2.url, state.sendInfo, values2.filePaths[0]);
      } else {
        await (0, import_api29.showToast)({ title: "Failed to receive send", style: import_api29.Toast.Style.Failure });
      }
    }
  });
  useOnceEffect_default(() => {
    void handleSubmit(getInitialValues(args));
  }, args.url);
  const receiveSend = async (url2, password) => {
    const toast = await (0, import_api29.showToast)({ title: "Receiving Send...", style: import_api29.Toast.Style.Animated });
    try {
      const { result: sendInfo, error } = await bitwarden.receiveSendInfo(url2, { password });
      if (error) {
        if (error instanceof SendInvalidPasswordError) {
          toast.style = import_api29.Toast.Style.Failure;
          toast.title = "Invalid password";
          toast.message = "Please try again";
          return;
        }
        if (error instanceof SendNeedsPasswordError) {
          setState({ status: "needsPassword" });
          setTimeout(() => passwordFieldRef.current?.focus(), 1);
          return toast.hide();
        }
        throw error;
      }
      if (sendInfo.type === 0 /* Text */) {
        const { result, error: error2 } = await bitwarden.receiveSend(url2, { password });
        if (error2) throw error2;
        setState({ status: "textRevealed", sendInfo, text: result });
      } else {
        setState({ status: "pendingFile", sendInfo });
        setTimeout(() => filePathFieldRef.current?.focus(), 1);
      }
      await toast.hide();
    } catch (error) {
      const execaError = error;
      if (execaError && /Not found/i.test(execaError.message)) {
        toast.style = import_api29.Toast.Style.Failure;
        toast.title = "Send not found";
      } else {
        toast.style = import_api29.Toast.Style.Failure;
        toast.title = "Failed to receive Send";
        captureException("Failed to receive Send", error);
      }
    }
  };
  const downloadFile = async (url2, sendInfo, filePath) => {
    const toast = await (0, import_api29.showToast)({ title: "Downloading file...", style: import_api29.Toast.Style.Animated });
    try {
      const savePath = (0, import_path4.join)(filePath, sendInfo.file.fileName);
      const { error } = await bitwarden.receiveSend(url2, { savePath });
      if (error) throw error;
      toast.title = "File downloaded";
      toast.style = import_api29.Toast.Style.Success;
      await (0, import_api29.showInFinder)(savePath);
      await (0, import_api29.closeMainWindow)();
    } catch (error) {
      toast.style = import_api29.Toast.Style.Failure;
      toast.title = "Failed to download file";
      captureException("Failed to download file", error);
    }
  };
  const resetFields = () => {
    reset(getInitialValues());
    setState({ status: "idle" });
    urlFieldRef.current?.focus();
  };
  const onUrlChange = (url2) => {
    if (!url2 || url2 === "https://vault.bitwarden.com/#/send/") {
      resetFields();
    }
  };
  const onFilePathsChange = (paths) => {
    const [filePath] = paths ?? [];
    if (filePath) {
      cache.setFilePath(filePath);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
    import_api29.Form,
    {
      actions: /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_api29.ActionPanel, { children: [
        state.status === "textRevealed" && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Action.CopyToClipboard, { content: state.text, title: "Copy Text" }),
        state.status !== "textRevealed" && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          import_api29.Action.SubmitForm,
          {
            title: state.status === "pendingFile" ? "Download File" : "Receive Send",
            icon: { source: import_api29.Icon.Download },
            onSubmit: handleSubmit
          }
        ),
        (values.password || values.url) && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Action, { title: "Reset Fields", icon: { source: import_api29.Icon.Trash }, onAction: resetFields }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(DebuggingBugReportingActionSection, {})
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          import_api29.Form.TextField,
          {
            ...withOnChangeEffect(itemProps.url, onUrlChange),
            ref: urlFieldRef,
            title: "Send URL",
            autoFocus: true
          }
        ),
        (state.status === "needsPassword" || args.password) && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          import_api29.Form.PasswordField,
          {
            ...itemProps.password,
            ref: passwordFieldRef,
            title: "Password",
            info: "This Send is password protected"
          }
        ),
        (state.status === "pendingFile" || state.status === "textRevealed") && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form.Separator, {}),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form.Description, { title: "Name", text: state.sendInfo.name }),
          state.sendInfo.type === 1 /* File */ && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form.Description, { title: "File Name", text: state.sendInfo.file.fileName }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form.Description, { title: "File Size", text: state.sendInfo.file.sizeName })
          ] })
        ] }),
        state.status === "textRevealed" && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form.TextArea, { id: "text", title: "Text", value: state.text, onChange: () => null }),
        state.status === "pendingFile" && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_api29.Form.Description, { text: "" }),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
            import_api29.Form.FilePicker,
            {
              ...withOnChangeEffect(itemProps.filePaths, onFilePathsChange),
              ref: filePathFieldRef,
              title: "Save File To",
              info: "This is the folder to where the Send's file will be saved.",
              canChooseFiles: false,
              allowMultipleSelection: false,
              canChooseDirectories: true
            }
          )
        ] })
      ]
    }
  );
}
var receive_send_default = ReceiveSendCommand;
/*! Bundled license information:

node-stream-zip/node_stream_zip.js:
  (**
   * @license node-stream-zip | (c) 2020 Antelle | https://github.com/antelle/node-stream-zip/blob/master/LICENSE
   * Portions copyright https://github.com/cthackers/adm-zip | https://raw.githubusercontent.com/cthackers/adm-zip/master/LICENSE
   *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL3dpbmRvd3MuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL21vZGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy93aGljaC93aGljaC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi91dGlsL3Jlc29sdmVDb21tYW5kLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9jcm9zcy1zcGF3bi9saWIvdXRpbC9lc2NhcGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctcmVnZXgvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctY29tbWFuZC9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL3V0aWwvcmVhZFNoZWJhbmcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi9wYXJzZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL2Vub2VudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NpZ25hbC1leGl0L3NpZ25hbHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NpZ25hbC1leGl0L2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9nZXQtc3RyZWFtL2J1ZmZlci1zdHJlYW0uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2dldC1zdHJlYW0vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL21lcmdlLXN0cmVhbS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvbm9kZS1zdHJlYW0temlwL25vZGVfc3RyZWFtX3ppcC5qcyIsICIuLi9zcmMvcmVjZWl2ZS1zZW5kLnRzeCIsICIuLi9ub2RlX21vZHVsZXMvZGVxdWFsL2xpdGUvaW5kZXgubWpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9pbmRleC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlUHJvbWlzZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlRGVlcE1lbW8udHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUxhdGVzdC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvc2hvd0ZhaWx1cmVUb2FzdC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlQ2FjaGVkU3RhdGUudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2hlbHBlcnMudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3ZlbmRvcnMvdHlwZS1oYXNoZXIudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUNhY2hlZFByb21pc2UudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUZldGNoLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9mZXRjaC11dGlscy50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlRXhlYy50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvZXhlYy11dGlscy50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdmVuZG9ycy9zaWduYWwtZXhpdC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlU3RyZWFtSlNPTi50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdmVuZG9ycy9zdHJlYW0tY2hhaW4udHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3ZlbmRvcnMvc3RyZWFtLWpzb24udHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZVNRTC50c3giLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3NxbC11dGlscy50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvdXNlRm9ybS50c3giLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUFJLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy91c2VGcmVjZW5jeVNvcnRpbmcudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL3VzZUxvY2FsU3RvcmFnZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvaWNvbi9pbmRleC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvaWNvbi9hdmF0YXIudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2ljb24vY29sb3IudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2ljb24vZmF2aWNvbi50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvaWNvbi9wcm9ncmVzcy50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvb2F1dGgvaW5kZXgudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL29hdXRoL09BdXRoU2VydmljZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvb2F1dGgvcHJvdmlkZXJzLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9vYXV0aC93aXRoQWNjZXNzVG9rZW4udHN4IiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9jcmVhdGVEZWVwbGluay50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvZXhlY3V0ZVNRTC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHJheWNhc3QvdXRpbHMvZGlzdC9zcmMvcnVuLWFwcGxlc2NyaXB0LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AcmF5Y2FzdC91dGlscy9kaXN0L3NyYy9ydW4tcG93ZXJzaGVsbC1zY3JpcHQudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0ByYXljYXN0L3V0aWxzL2Rpc3Qvc3JjL2NhY2hlLnRzIiwgIi4uL3NyYy9jb21wb25lbnRzL2FjdGlvbnMvQWN0aW9uV2l0aFJlcHJvbXB0LnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9zZWFyY2hWYXVsdC9jb250ZXh0L3ZhdWx0SXRlbS50c3giLCAiLi4vc3JjL3V0aWxzL2hvb2tzL3VzZVJlcHJvbXB0LnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9SZXByb21wdEZvcm0udHN4IiwgIi4uL3NyYy9jb250ZXh0L3Nlc3Npb24vc2Vzc2lvbi50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvVW5sb2NrRm9ybS50c3giLCAiLi4vc3JjL2NvbnN0YW50cy9nZW5lcmFsLnRzIiwgIi4uL3NyYy9jb250ZXh0L2JpdHdhcmRlbi50c3giLCAiLi4vc3JjL2FwaS9iaXR3YXJkZW4udHMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9zdHJpcC1maW5hbC1uZXdsaW5lL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ucG0tcnVuLXBhdGgvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL25wbS1ydW4tcGF0aC9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL21pbWljLWZuL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9vbmV0aW1lL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9tYWluLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9yZWFsdGltZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvaHVtYW4tc2lnbmFscy9idWlsZC9zcmMvc2lnbmFscy5qcyIsICIuLi9ub2RlX21vZHVsZXMvaHVtYW4tc2lnbmFscy9idWlsZC9zcmMvY29yZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvbGliL2Vycm9yLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9leGVjYS9saWIvc3RkaW8uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9raWxsLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9pcy1zdHJlYW0vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9zdHJlYW0uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9wcm9taXNlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9leGVjYS9saWIvY29tbWFuZC5qcyIsICIuLi9zcmMvdXRpbHMvcGFzc3dvcmRzLnRzIiwgIi4uL3NyYy9jb25zdGFudHMvcGFzc3dvcmRzLnRzIiwgIi4uL3NyYy91dGlscy9wcmVmZXJlbmNlcy50cyIsICIuLi9zcmMvY29uc3RhbnRzL3ByZWZlcmVuY2VzLnRzIiwgIi4uL3NyYy9jb25zdGFudHMvbGFiZWxzLnRzIiwgIi4uL3NyYy91dGlscy9lcnJvcnMudHMiLCAiLi4vc3JjL3V0aWxzL2ZzLnRzIiwgIi4uL3NyYy91dGlscy9uZXR3b3JrLnRzIiwgIi4uL3NyYy91dGlscy9kZXZlbG9wbWVudC50cyIsICIuLi9zcmMvdXRpbHMvY3J5cHRvLnRzIiwgIi4uL3NyYy9hcGkvYml0d2FyZGVuLmhlbHBlcnMudHMiLCAiLi4vc3JjL3V0aWxzL2NhY2hlLnRzIiwgIi4uL3NyYy91dGlscy9wbGF0Zm9ybS50cyIsICIuLi9zcmMvY29tcG9uZW50cy9Mb2FkaW5nRmFsbGJhY2sudHN4IiwgIi4uL3NyYy9jb21wb25lbnRzL1Ryb3VibGVzaG9vdGluZ0d1aWRlLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9hY3Rpb25zL0J1Z1JlcG9ydE9wZW5BY3Rpb24udHN4IiwgIi4uL3NyYy91dGlscy9ob29rcy91c2VPbmNlRWZmZWN0LnRzIiwgIi4uL3NyYy91dGlscy9vYmplY3RzLnRzIiwgIi4uL3NyYy91dGlscy9kZWJ1Zy50cyIsICIuLi9zcmMvdXRpbHMvaG9va3MvdXNlVmF1bHRNZXNzYWdlcy50cyIsICIuLi9zcmMvdXRpbHMvbG9jYWxzdG9yYWdlLnRzIiwgIi4uL3NyYy9jb21wb25lbnRzL3NlYXJjaFZhdWx0L1ZhdWx0TG9hZGluZ0ZhbGxiYWNrLnRzeCIsICIuLi9zcmMvY29udGV4dC9zZXNzaW9uL3JlZHVjZXIudHMiLCAiLi4vc3JjL2NvbnRleHQvc2Vzc2lvbi91dGlscy50cyIsICIuLi9zcmMvY29tcG9uZW50cy9hY3Rpb25zL0J1Z1JlcG9ydENvbGxlY3REYXRhQWN0aW9uLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9hY3Rpb25zL0NvcHlSdW50aW1lRXJyb3JMb2cudHN4IiwgIi4uL3NyYy9jb21wb25lbnRzL2FjdGlvbnMvRGVidWdnaW5nQnVnUmVwb3J0aW5nQWN0aW9uU2VjdGlvbi50c3giLCAiLi4vc3JjL3V0aWxzL2hvb2tzL3VzZUNsaVZlcnNpb24udHMiLCAiLi4vc3JjL2NvbXBvbmVudHMvYWN0aW9ucy9WYXVsdEFjdGlvbnNTZWN0aW9uLnRzeCIsICIuLi9zcmMvY29udGV4dC92YXVsdC50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvc2VhcmNoVmF1bHQvY29udGV4dC92YXVsdExpc3RlbmVycy50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvc2VhcmNoVmF1bHQvdXRpbHMvdXNlVmF1bHRDYWNoaW5nLnRzIiwgIi4uL3NyYy91dGlscy9ob29rcy91c2VDb250ZW50RW5jcnlwdG9yLnRzIiwgIi4uL3NyYy9jb21wb25lbnRzL1Jvb3RFcnJvckJvdW5kYXJ5LnRzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsibW9kdWxlLmV4cG9ydHMgPSBpc2V4ZVxuaXNleGUuc3luYyA9IHN5bmNcblxudmFyIGZzID0gcmVxdWlyZSgnZnMnKVxuXG5mdW5jdGlvbiBjaGVja1BhdGhFeHQgKHBhdGgsIG9wdGlvbnMpIHtcbiAgdmFyIHBhdGhleHQgPSBvcHRpb25zLnBhdGhFeHQgIT09IHVuZGVmaW5lZCA/XG4gICAgb3B0aW9ucy5wYXRoRXh0IDogcHJvY2Vzcy5lbnYuUEFUSEVYVFxuXG4gIGlmICghcGF0aGV4dCkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBwYXRoZXh0ID0gcGF0aGV4dC5zcGxpdCgnOycpXG4gIGlmIChwYXRoZXh0LmluZGV4T2YoJycpICE9PSAtMSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoZXh0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHAgPSBwYXRoZXh0W2ldLnRvTG93ZXJDYXNlKClcbiAgICBpZiAocCAmJiBwYXRoLnN1YnN0cigtcC5sZW5ndGgpLnRvTG93ZXJDYXNlKCkgPT09IHApIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5mdW5jdGlvbiBjaGVja1N0YXQgKHN0YXQsIHBhdGgsIG9wdGlvbnMpIHtcbiAgaWYgKCFzdGF0LmlzU3ltYm9saWNMaW5rKCkgJiYgIXN0YXQuaXNGaWxlKCkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gY2hlY2tQYXRoRXh0KHBhdGgsIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGlzZXhlIChwYXRoLCBvcHRpb25zLCBjYikge1xuICBmcy5zdGF0KHBhdGgsIGZ1bmN0aW9uIChlciwgc3RhdCkge1xuICAgIGNiKGVyLCBlciA/IGZhbHNlIDogY2hlY2tTdGF0KHN0YXQsIHBhdGgsIG9wdGlvbnMpKVxuICB9KVxufVxuXG5mdW5jdGlvbiBzeW5jIChwYXRoLCBvcHRpb25zKSB7XG4gIHJldHVybiBjaGVja1N0YXQoZnMuc3RhdFN5bmMocGF0aCksIHBhdGgsIG9wdGlvbnMpXG59XG4iLCAibW9kdWxlLmV4cG9ydHMgPSBpc2V4ZVxuaXNleGUuc3luYyA9IHN5bmNcblxudmFyIGZzID0gcmVxdWlyZSgnZnMnKVxuXG5mdW5jdGlvbiBpc2V4ZSAocGF0aCwgb3B0aW9ucywgY2IpIHtcbiAgZnMuc3RhdChwYXRoLCBmdW5jdGlvbiAoZXIsIHN0YXQpIHtcbiAgICBjYihlciwgZXIgPyBmYWxzZSA6IGNoZWNrU3RhdChzdGF0LCBvcHRpb25zKSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gc3luYyAocGF0aCwgb3B0aW9ucykge1xuICByZXR1cm4gY2hlY2tTdGF0KGZzLnN0YXRTeW5jKHBhdGgpLCBvcHRpb25zKVxufVxuXG5mdW5jdGlvbiBjaGVja1N0YXQgKHN0YXQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHN0YXQuaXNGaWxlKCkgJiYgY2hlY2tNb2RlKHN0YXQsIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGNoZWNrTW9kZSAoc3RhdCwgb3B0aW9ucykge1xuICB2YXIgbW9kID0gc3RhdC5tb2RlXG4gIHZhciB1aWQgPSBzdGF0LnVpZFxuICB2YXIgZ2lkID0gc3RhdC5naWRcblxuICB2YXIgbXlVaWQgPSBvcHRpb25zLnVpZCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLnVpZCA6IHByb2Nlc3MuZ2V0dWlkICYmIHByb2Nlc3MuZ2V0dWlkKClcbiAgdmFyIG15R2lkID0gb3B0aW9ucy5naWQgIT09IHVuZGVmaW5lZCA/XG4gICAgb3B0aW9ucy5naWQgOiBwcm9jZXNzLmdldGdpZCAmJiBwcm9jZXNzLmdldGdpZCgpXG5cbiAgdmFyIHUgPSBwYXJzZUludCgnMTAwJywgOClcbiAgdmFyIGcgPSBwYXJzZUludCgnMDEwJywgOClcbiAgdmFyIG8gPSBwYXJzZUludCgnMDAxJywgOClcbiAgdmFyIHVnID0gdSB8IGdcblxuICB2YXIgcmV0ID0gKG1vZCAmIG8pIHx8XG4gICAgKG1vZCAmIGcpICYmIGdpZCA9PT0gbXlHaWQgfHxcbiAgICAobW9kICYgdSkgJiYgdWlkID09PSBteVVpZCB8fFxuICAgIChtb2QgJiB1ZykgJiYgbXlVaWQgPT09IDBcblxuICByZXR1cm4gcmV0XG59XG4iLCAidmFyIGZzID0gcmVxdWlyZSgnZnMnKVxudmFyIGNvcmVcbmlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInIHx8IGdsb2JhbC5URVNUSU5HX1dJTkRPV1MpIHtcbiAgY29yZSA9IHJlcXVpcmUoJy4vd2luZG93cy5qcycpXG59IGVsc2Uge1xuICBjb3JlID0gcmVxdWlyZSgnLi9tb2RlLmpzJylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc2V4ZVxuaXNleGUuc3luYyA9IHN5bmNcblxuZnVuY3Rpb24gaXNleGUgKHBhdGgsIG9wdGlvbnMsIGNiKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gb3B0aW9uc1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG5cbiAgaWYgKCFjYikge1xuICAgIGlmICh0eXBlb2YgUHJvbWlzZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FsbGJhY2sgbm90IHByb3ZpZGVkJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaXNleGUocGF0aCwgb3B0aW9ucyB8fCB7fSwgZnVuY3Rpb24gKGVyLCBpcykge1xuICAgICAgICBpZiAoZXIpIHtcbiAgICAgICAgICByZWplY3QoZXIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShpcylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgY29yZShwYXRoLCBvcHRpb25zIHx8IHt9LCBmdW5jdGlvbiAoZXIsIGlzKSB7XG4gICAgLy8gaWdub3JlIEVBQ0NFUyBiZWNhdXNlIHRoYXQganVzdCBtZWFucyB3ZSBhcmVuJ3QgYWxsb3dlZCB0byBydW4gaXRcbiAgICBpZiAoZXIpIHtcbiAgICAgIGlmIChlci5jb2RlID09PSAnRUFDQ0VTJyB8fCBvcHRpb25zICYmIG9wdGlvbnMuaWdub3JlRXJyb3JzKSB7XG4gICAgICAgIGVyID0gbnVsbFxuICAgICAgICBpcyA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIGNiKGVyLCBpcylcbiAgfSlcbn1cblxuZnVuY3Rpb24gc3luYyAocGF0aCwgb3B0aW9ucykge1xuICAvLyBteSBraW5nZG9tIGZvciBhIGZpbHRlcmVkIGNhdGNoXG4gIHRyeSB7XG4gICAgcmV0dXJuIGNvcmUuc3luYyhwYXRoLCBvcHRpb25zIHx8IHt9KVxuICB9IGNhdGNoIChlcikge1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuaWdub3JlRXJyb3JzIHx8IGVyLmNvZGUgPT09ICdFQUNDRVMnKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJcbiAgICB9XG4gIH1cbn1cbiIsICJjb25zdCBpc1dpbmRvd3MgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInIHx8XG4gICAgcHJvY2Vzcy5lbnYuT1NUWVBFID09PSAnY3lnd2luJyB8fFxuICAgIHByb2Nlc3MuZW52Lk9TVFlQRSA9PT0gJ21zeXMnXG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmNvbnN0IENPTE9OID0gaXNXaW5kb3dzID8gJzsnIDogJzonXG5jb25zdCBpc2V4ZSA9IHJlcXVpcmUoJ2lzZXhlJylcblxuY29uc3QgZ2V0Tm90Rm91bmRFcnJvciA9IChjbWQpID0+XG4gIE9iamVjdC5hc3NpZ24obmV3IEVycm9yKGBub3QgZm91bmQ6ICR7Y21kfWApLCB7IGNvZGU6ICdFTk9FTlQnIH0pXG5cbmNvbnN0IGdldFBhdGhJbmZvID0gKGNtZCwgb3B0KSA9PiB7XG4gIGNvbnN0IGNvbG9uID0gb3B0LmNvbG9uIHx8IENPTE9OXG5cbiAgLy8gSWYgaXQgaGFzIGEgc2xhc2gsIHRoZW4gd2UgZG9uJ3QgYm90aGVyIHNlYXJjaGluZyB0aGUgcGF0aGVudi5cbiAgLy8ganVzdCBjaGVjayB0aGUgZmlsZSBpdHNlbGYsIGFuZCB0aGF0J3MgaXQuXG4gIGNvbnN0IHBhdGhFbnYgPSBjbWQubWF0Y2goL1xcLy8pIHx8IGlzV2luZG93cyAmJiBjbWQubWF0Y2goL1xcXFwvKSA/IFsnJ11cbiAgICA6IChcbiAgICAgIFtcbiAgICAgICAgLy8gd2luZG93cyBhbHdheXMgY2hlY2tzIHRoZSBjd2QgZmlyc3RcbiAgICAgICAgLi4uKGlzV2luZG93cyA/IFtwcm9jZXNzLmN3ZCgpXSA6IFtdKSxcbiAgICAgICAgLi4uKG9wdC5wYXRoIHx8IHByb2Nlc3MuZW52LlBBVEggfHxcbiAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dDogdmVyeSB1bnVzdWFsICovICcnKS5zcGxpdChjb2xvbiksXG4gICAgICBdXG4gICAgKVxuICBjb25zdCBwYXRoRXh0RXhlID0gaXNXaW5kb3dzXG4gICAgPyBvcHQucGF0aEV4dCB8fCBwcm9jZXNzLmVudi5QQVRIRVhUIHx8ICcuRVhFOy5DTUQ7LkJBVDsuQ09NJ1xuICAgIDogJydcbiAgY29uc3QgcGF0aEV4dCA9IGlzV2luZG93cyA/IHBhdGhFeHRFeGUuc3BsaXQoY29sb24pIDogWycnXVxuXG4gIGlmIChpc1dpbmRvd3MpIHtcbiAgICBpZiAoY21kLmluZGV4T2YoJy4nKSAhPT0gLTEgJiYgcGF0aEV4dFswXSAhPT0gJycpXG4gICAgICBwYXRoRXh0LnVuc2hpZnQoJycpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBhdGhFbnYsXG4gICAgcGF0aEV4dCxcbiAgICBwYXRoRXh0RXhlLFxuICB9XG59XG5cbmNvbnN0IHdoaWNoID0gKGNtZCwgb3B0LCBjYikgPT4ge1xuICBpZiAodHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gb3B0XG4gICAgb3B0ID0ge31cbiAgfVxuICBpZiAoIW9wdClcbiAgICBvcHQgPSB7fVxuXG4gIGNvbnN0IHsgcGF0aEVudiwgcGF0aEV4dCwgcGF0aEV4dEV4ZSB9ID0gZ2V0UGF0aEluZm8oY21kLCBvcHQpXG4gIGNvbnN0IGZvdW5kID0gW11cblxuICBjb25zdCBzdGVwID0gaSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKGkgPT09IHBhdGhFbnYubGVuZ3RoKVxuICAgICAgcmV0dXJuIG9wdC5hbGwgJiYgZm91bmQubGVuZ3RoID8gcmVzb2x2ZShmb3VuZClcbiAgICAgICAgOiByZWplY3QoZ2V0Tm90Rm91bmRFcnJvcihjbWQpKVxuXG4gICAgY29uc3QgcHBSYXcgPSBwYXRoRW52W2ldXG4gICAgY29uc3QgcGF0aFBhcnQgPSAvXlwiLipcIiQvLnRlc3QocHBSYXcpID8gcHBSYXcuc2xpY2UoMSwgLTEpIDogcHBSYXdcblxuICAgIGNvbnN0IHBDbWQgPSBwYXRoLmpvaW4ocGF0aFBhcnQsIGNtZClcbiAgICBjb25zdCBwID0gIXBhdGhQYXJ0ICYmIC9eXFwuW1xcXFxcXC9dLy50ZXN0KGNtZCkgPyBjbWQuc2xpY2UoMCwgMikgKyBwQ21kXG4gICAgICA6IHBDbWRcblxuICAgIHJlc29sdmUoc3ViU3RlcChwLCBpLCAwKSlcbiAgfSlcblxuICBjb25zdCBzdWJTdGVwID0gKHAsIGksIGlpKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKGlpID09PSBwYXRoRXh0Lmxlbmd0aClcbiAgICAgIHJldHVybiByZXNvbHZlKHN0ZXAoaSArIDEpKVxuICAgIGNvbnN0IGV4dCA9IHBhdGhFeHRbaWldXG4gICAgaXNleGUocCArIGV4dCwgeyBwYXRoRXh0OiBwYXRoRXh0RXhlIH0sIChlciwgaXMpID0+IHtcbiAgICAgIGlmICghZXIgJiYgaXMpIHtcbiAgICAgICAgaWYgKG9wdC5hbGwpXG4gICAgICAgICAgZm91bmQucHVzaChwICsgZXh0KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUocCArIGV4dClcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlKHN1YlN0ZXAocCwgaSwgaWkgKyAxKSlcbiAgICB9KVxuICB9KVxuXG4gIHJldHVybiBjYiA/IHN0ZXAoMCkudGhlbihyZXMgPT4gY2IobnVsbCwgcmVzKSwgY2IpIDogc3RlcCgwKVxufVxuXG5jb25zdCB3aGljaFN5bmMgPSAoY21kLCBvcHQpID0+IHtcbiAgb3B0ID0gb3B0IHx8IHt9XG5cbiAgY29uc3QgeyBwYXRoRW52LCBwYXRoRXh0LCBwYXRoRXh0RXhlIH0gPSBnZXRQYXRoSW5mbyhjbWQsIG9wdClcbiAgY29uc3QgZm91bmQgPSBbXVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aEVudi5sZW5ndGg7IGkgKyspIHtcbiAgICBjb25zdCBwcFJhdyA9IHBhdGhFbnZbaV1cbiAgICBjb25zdCBwYXRoUGFydCA9IC9eXCIuKlwiJC8udGVzdChwcFJhdykgPyBwcFJhdy5zbGljZSgxLCAtMSkgOiBwcFJhd1xuXG4gICAgY29uc3QgcENtZCA9IHBhdGguam9pbihwYXRoUGFydCwgY21kKVxuICAgIGNvbnN0IHAgPSAhcGF0aFBhcnQgJiYgL15cXC5bXFxcXFxcL10vLnRlc3QoY21kKSA/IGNtZC5zbGljZSgwLCAyKSArIHBDbWRcbiAgICAgIDogcENtZFxuXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBwYXRoRXh0Lmxlbmd0aDsgaiArKykge1xuICAgICAgY29uc3QgY3VyID0gcCArIHBhdGhFeHRbal1cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGlzID0gaXNleGUuc3luYyhjdXIsIHsgcGF0aEV4dDogcGF0aEV4dEV4ZSB9KVxuICAgICAgICBpZiAoaXMpIHtcbiAgICAgICAgICBpZiAob3B0LmFsbClcbiAgICAgICAgICAgIGZvdW5kLnB1c2goY3VyKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBjdXJcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHt9XG4gICAgfVxuICB9XG5cbiAgaWYgKG9wdC5hbGwgJiYgZm91bmQubGVuZ3RoKVxuICAgIHJldHVybiBmb3VuZFxuXG4gIGlmIChvcHQubm90aHJvdylcbiAgICByZXR1cm4gbnVsbFxuXG4gIHRocm93IGdldE5vdEZvdW5kRXJyb3IoY21kKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdoaWNoXG53aGljaC5zeW5jID0gd2hpY2hTeW5jXG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoS2V5ID0gKG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRjb25zdCBlbnZpcm9ubWVudCA9IG9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52O1xuXHRjb25zdCBwbGF0Zm9ybSA9IG9wdGlvbnMucGxhdGZvcm0gfHwgcHJvY2Vzcy5wbGF0Zm9ybTtcblxuXHRpZiAocGxhdGZvcm0gIT09ICd3aW4zMicpIHtcblx0XHRyZXR1cm4gJ1BBVEgnO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKGVudmlyb25tZW50KS5yZXZlcnNlKCkuZmluZChrZXkgPT4ga2V5LnRvVXBwZXJDYXNlKCkgPT09ICdQQVRIJykgfHwgJ1BhdGgnO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXRoS2V5O1xuLy8gVE9ETzogUmVtb3ZlIHRoaXMgZm9yIHRoZSBuZXh0IG1ham9yIHJlbGVhc2Vcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBwYXRoS2V5O1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHdoaWNoID0gcmVxdWlyZSgnd2hpY2gnKTtcbmNvbnN0IGdldFBhdGhLZXkgPSByZXF1aXJlKCdwYXRoLWtleScpO1xuXG5mdW5jdGlvbiByZXNvbHZlQ29tbWFuZEF0dGVtcHQocGFyc2VkLCB3aXRob3V0UGF0aEV4dCkge1xuICAgIGNvbnN0IGVudiA9IHBhcnNlZC5vcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudjtcbiAgICBjb25zdCBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xuICAgIGNvbnN0IGhhc0N1c3RvbUN3ZCA9IHBhcnNlZC5vcHRpb25zLmN3ZCAhPSBudWxsO1xuICAgIC8vIFdvcmtlciB0aHJlYWRzIGRvIG5vdCBoYXZlIHByb2Nlc3MuY2hkaXIoKVxuICAgIGNvbnN0IHNob3VsZFN3aXRjaEN3ZCA9IGhhc0N1c3RvbUN3ZCAmJiBwcm9jZXNzLmNoZGlyICE9PSB1bmRlZmluZWQgJiYgIXByb2Nlc3MuY2hkaXIuZGlzYWJsZWQ7XG5cbiAgICAvLyBJZiBhIGN1c3RvbSBgY3dkYCB3YXMgc3BlY2lmaWVkLCB3ZSBuZWVkIHRvIGNoYW5nZSB0aGUgcHJvY2VzcyBjd2RcbiAgICAvLyBiZWNhdXNlIGB3aGljaGAgd2lsbCBkbyBzdGF0IGNhbGxzIGJ1dCBkb2VzIG5vdCBzdXBwb3J0IGEgY3VzdG9tIGN3ZFxuICAgIGlmIChzaG91bGRTd2l0Y2hDd2QpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb2Nlc3MuY2hkaXIocGFyc2VkLm9wdGlvbnMuY3dkKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAvKiBFbXB0eSAqL1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHJlc29sdmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZWQgPSB3aGljaC5zeW5jKHBhcnNlZC5jb21tYW5kLCB7XG4gICAgICAgICAgICBwYXRoOiBlbnZbZ2V0UGF0aEtleSh7IGVudiB9KV0sXG4gICAgICAgICAgICBwYXRoRXh0OiB3aXRob3V0UGF0aEV4dCA/IHBhdGguZGVsaW1pdGVyIDogdW5kZWZpbmVkLFxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8qIEVtcHR5ICovXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKHNob3VsZFN3aXRjaEN3ZCkge1xuICAgICAgICAgICAgcHJvY2Vzcy5jaGRpcihjd2QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2Ugc3VjY2Vzc2Z1bGx5IHJlc29sdmVkLCBlbnN1cmUgdGhhdCBhbiBhYnNvbHV0ZSBwYXRoIGlzIHJldHVybmVkXG4gICAgLy8gTm90ZSB0aGF0IHdoZW4gYSBjdXN0b20gYGN3ZGAgd2FzIHVzZWQsIHdlIG5lZWQgdG8gcmVzb2x2ZSB0byBhbiBhYnNvbHV0ZSBwYXRoIGJhc2VkIG9uIGl0XG4gICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICAgIHJlc29sdmVkID0gcGF0aC5yZXNvbHZlKGhhc0N1c3RvbUN3ZCA/IHBhcnNlZC5vcHRpb25zLmN3ZCA6ICcnLCByZXNvbHZlZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc29sdmVkO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlQ29tbWFuZChwYXJzZWQpIHtcbiAgICByZXR1cm4gcmVzb2x2ZUNvbW1hbmRBdHRlbXB0KHBhcnNlZCkgfHwgcmVzb2x2ZUNvbW1hbmRBdHRlbXB0KHBhcnNlZCwgdHJ1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzb2x2ZUNvbW1hbmQ7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG4vLyBTZWUgaHR0cDovL3d3dy5yb2J2YW5kZXJ3b3VkZS5jb20vZXNjYXBlY2hhcnMucGhwXG5jb25zdCBtZXRhQ2hhcnNSZWdFeHAgPSAvKFsoKVxcXVslIV5cImA8PiZ8OywgKj9dKS9nO1xuXG5mdW5jdGlvbiBlc2NhcGVDb21tYW5kKGFyZykge1xuICAgIC8vIEVzY2FwZSBtZXRhIGNoYXJzXG4gICAgYXJnID0gYXJnLnJlcGxhY2UobWV0YUNoYXJzUmVnRXhwLCAnXiQxJyk7XG5cbiAgICByZXR1cm4gYXJnO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVBcmd1bWVudChhcmcsIGRvdWJsZUVzY2FwZU1ldGFDaGFycykge1xuICAgIC8vIENvbnZlcnQgdG8gc3RyaW5nXG4gICAgYXJnID0gYCR7YXJnfWA7XG5cbiAgICAvLyBBbGdvcml0aG0gYmVsb3cgaXMgYmFzZWQgb24gaHR0cHM6Ly9xbnRtLm9yZy9jbWRcbiAgICAvLyBJdCdzIHNsaWdodGx5IGFsdGVyZWQgdG8gZGlzYWJsZSBKUyBiYWNrdHJhY2tpbmcgdG8gYXZvaWQgaGFuZ2luZyBvbiBzcGVjaWFsbHkgY3JhZnRlZCBpbnB1dFxuICAgIC8vIFBsZWFzZSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21veHlzdHVkaW8vbm9kZS1jcm9zcy1zcGF3bi9wdWxsLzE2MCBmb3IgbW9yZSBpbmZvcm1hdGlvblxuXG4gICAgLy8gU2VxdWVuY2Ugb2YgYmFja3NsYXNoZXMgZm9sbG93ZWQgYnkgYSBkb3VibGUgcXVvdGU6XG4gICAgLy8gZG91YmxlIHVwIGFsbCB0aGUgYmFja3NsYXNoZXMgYW5kIGVzY2FwZSB0aGUgZG91YmxlIHF1b3RlXG4gICAgYXJnID0gYXJnLnJlcGxhY2UoLyg/PShcXFxcKz8pPylcXDFcIi9nLCAnJDEkMVxcXFxcIicpO1xuXG4gICAgLy8gU2VxdWVuY2Ugb2YgYmFja3NsYXNoZXMgZm9sbG93ZWQgYnkgdGhlIGVuZCBvZiB0aGUgc3RyaW5nXG4gICAgLy8gKHdoaWNoIHdpbGwgYmVjb21lIGEgZG91YmxlIHF1b3RlIGxhdGVyKTpcbiAgICAvLyBkb3VibGUgdXAgYWxsIHRoZSBiYWNrc2xhc2hlc1xuICAgIGFyZyA9IGFyZy5yZXBsYWNlKC8oPz0oXFxcXCs/KT8pXFwxJC8sICckMSQxJyk7XG5cbiAgICAvLyBBbGwgb3RoZXIgYmFja3NsYXNoZXMgb2NjdXIgbGl0ZXJhbGx5XG5cbiAgICAvLyBRdW90ZSB0aGUgd2hvbGUgdGhpbmc6XG4gICAgYXJnID0gYFwiJHthcmd9XCJgO1xuXG4gICAgLy8gRXNjYXBlIG1ldGEgY2hhcnNcbiAgICBhcmcgPSBhcmcucmVwbGFjZShtZXRhQ2hhcnNSZWdFeHAsICdeJDEnKTtcblxuICAgIC8vIERvdWJsZSBlc2NhcGUgbWV0YSBjaGFycyBpZiBuZWNlc3NhcnlcbiAgICBpZiAoZG91YmxlRXNjYXBlTWV0YUNoYXJzKSB7XG4gICAgICAgIGFyZyA9IGFyZy5yZXBsYWNlKG1ldGFDaGFyc1JlZ0V4cCwgJ14kMScpO1xuICAgIH1cblxuICAgIHJldHVybiBhcmc7XG59XG5cbm1vZHVsZS5leHBvcnRzLmNvbW1hbmQgPSBlc2NhcGVDb21tYW5kO1xubW9kdWxlLmV4cG9ydHMuYXJndW1lbnQgPSBlc2NhcGVBcmd1bWVudDtcbiIsICIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IC9eIyEoLiopLztcbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCBzaGViYW5nUmVnZXggPSByZXF1aXJlKCdzaGViYW5nLXJlZ2V4Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKHN0cmluZyA9ICcnKSA9PiB7XG5cdGNvbnN0IG1hdGNoID0gc3RyaW5nLm1hdGNoKHNoZWJhbmdSZWdleCk7XG5cblx0aWYgKCFtYXRjaCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Y29uc3QgW3BhdGgsIGFyZ3VtZW50XSA9IG1hdGNoWzBdLnJlcGxhY2UoLyMhID8vLCAnJykuc3BsaXQoJyAnKTtcblx0Y29uc3QgYmluYXJ5ID0gcGF0aC5zcGxpdCgnLycpLnBvcCgpO1xuXG5cdGlmIChiaW5hcnkgPT09ICdlbnYnKSB7XG5cdFx0cmV0dXJuIGFyZ3VtZW50O1xuXHR9XG5cblx0cmV0dXJuIGFyZ3VtZW50ID8gYCR7YmluYXJ5fSAke2FyZ3VtZW50fWAgOiBiaW5hcnk7XG59O1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3Qgc2hlYmFuZ0NvbW1hbmQgPSByZXF1aXJlKCdzaGViYW5nLWNvbW1hbmQnKTtcblxuZnVuY3Rpb24gcmVhZFNoZWJhbmcoY29tbWFuZCkge1xuICAgIC8vIFJlYWQgdGhlIGZpcnN0IDE1MCBieXRlcyBmcm9tIHRoZSBmaWxlXG4gICAgY29uc3Qgc2l6ZSA9IDE1MDtcbiAgICBjb25zdCBidWZmZXIgPSBCdWZmZXIuYWxsb2Moc2l6ZSk7XG5cbiAgICBsZXQgZmQ7XG5cbiAgICB0cnkge1xuICAgICAgICBmZCA9IGZzLm9wZW5TeW5jKGNvbW1hbmQsICdyJyk7XG4gICAgICAgIGZzLnJlYWRTeW5jKGZkLCBidWZmZXIsIDAsIHNpemUsIDApO1xuICAgICAgICBmcy5jbG9zZVN5bmMoZmQpO1xuICAgIH0gY2F0Y2ggKGUpIHsgLyogRW1wdHkgKi8gfVxuXG4gICAgLy8gQXR0ZW1wdCB0byBleHRyYWN0IHNoZWJhbmcgKG51bGwgaXMgcmV0dXJuZWQgaWYgbm90IGEgc2hlYmFuZylcbiAgICByZXR1cm4gc2hlYmFuZ0NvbW1hbmQoYnVmZmVyLnRvU3RyaW5nKCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlYWRTaGViYW5nO1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHJlc29sdmVDb21tYW5kID0gcmVxdWlyZSgnLi91dGlsL3Jlc29sdmVDb21tYW5kJyk7XG5jb25zdCBlc2NhcGUgPSByZXF1aXJlKCcuL3V0aWwvZXNjYXBlJyk7XG5jb25zdCByZWFkU2hlYmFuZyA9IHJlcXVpcmUoJy4vdXRpbC9yZWFkU2hlYmFuZycpO1xuXG5jb25zdCBpc1dpbiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG5jb25zdCBpc0V4ZWN1dGFibGVSZWdFeHAgPSAvXFwuKD86Y29tfGV4ZSkkL2k7XG5jb25zdCBpc0NtZFNoaW1SZWdFeHAgPSAvbm9kZV9tb2R1bGVzW1xcXFwvXS5iaW5bXFxcXC9dW15cXFxcL10rXFwuY21kJC9pO1xuXG5mdW5jdGlvbiBkZXRlY3RTaGViYW5nKHBhcnNlZCkge1xuICAgIHBhcnNlZC5maWxlID0gcmVzb2x2ZUNvbW1hbmQocGFyc2VkKTtcblxuICAgIGNvbnN0IHNoZWJhbmcgPSBwYXJzZWQuZmlsZSAmJiByZWFkU2hlYmFuZyhwYXJzZWQuZmlsZSk7XG5cbiAgICBpZiAoc2hlYmFuZykge1xuICAgICAgICBwYXJzZWQuYXJncy51bnNoaWZ0KHBhcnNlZC5maWxlKTtcbiAgICAgICAgcGFyc2VkLmNvbW1hbmQgPSBzaGViYW5nO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlQ29tbWFuZChwYXJzZWQpO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJzZWQuZmlsZTtcbn1cblxuZnVuY3Rpb24gcGFyc2VOb25TaGVsbChwYXJzZWQpIHtcbiAgICBpZiAoIWlzV2luKSB7XG4gICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgfVxuXG4gICAgLy8gRGV0ZWN0ICYgYWRkIHN1cHBvcnQgZm9yIHNoZWJhbmdzXG4gICAgY29uc3QgY29tbWFuZEZpbGUgPSBkZXRlY3RTaGViYW5nKHBhcnNlZCk7XG5cbiAgICAvLyBXZSBkb24ndCBuZWVkIGEgc2hlbGwgaWYgdGhlIGNvbW1hbmQgZmlsZW5hbWUgaXMgYW4gZXhlY3V0YWJsZVxuICAgIGNvbnN0IG5lZWRzU2hlbGwgPSAhaXNFeGVjdXRhYmxlUmVnRXhwLnRlc3QoY29tbWFuZEZpbGUpO1xuXG4gICAgLy8gSWYgYSBzaGVsbCBpcyByZXF1aXJlZCwgdXNlIGNtZC5leGUgYW5kIHRha2UgY2FyZSBvZiBlc2NhcGluZyBldmVyeXRoaW5nIGNvcnJlY3RseVxuICAgIC8vIE5vdGUgdGhhdCBgZm9yY2VTaGVsbGAgaXMgYW4gaGlkZGVuIG9wdGlvbiB1c2VkIG9ubHkgaW4gdGVzdHNcbiAgICBpZiAocGFyc2VkLm9wdGlvbnMuZm9yY2VTaGVsbCB8fCBuZWVkc1NoZWxsKSB7XG4gICAgICAgIC8vIE5lZWQgdG8gZG91YmxlIGVzY2FwZSBtZXRhIGNoYXJzIGlmIHRoZSBjb21tYW5kIGlzIGEgY21kLXNoaW0gbG9jYXRlZCBpbiBgbm9kZV9tb2R1bGVzLy5iaW4vYFxuICAgICAgICAvLyBUaGUgY21kLXNoaW0gc2ltcGx5IGNhbGxzIGV4ZWN1dGUgdGhlIHBhY2thZ2UgYmluIGZpbGUgd2l0aCBOb2RlSlMsIHByb3h5aW5nIGFueSBhcmd1bWVudFxuICAgICAgICAvLyBCZWNhdXNlIHRoZSBlc2NhcGUgb2YgbWV0YWNoYXJzIHdpdGggXiBnZXRzIGludGVycHJldGVkIHdoZW4gdGhlIGNtZC5leGUgaXMgZmlyc3QgY2FsbGVkLFxuICAgICAgICAvLyB3ZSBuZWVkIHRvIGRvdWJsZSBlc2NhcGUgdGhlbVxuICAgICAgICBjb25zdCBuZWVkc0RvdWJsZUVzY2FwZU1ldGFDaGFycyA9IGlzQ21kU2hpbVJlZ0V4cC50ZXN0KGNvbW1hbmRGaWxlKTtcblxuICAgICAgICAvLyBOb3JtYWxpemUgcG9zaXggcGF0aHMgaW50byBPUyBjb21wYXRpYmxlIHBhdGhzIChlLmcuOiBmb28vYmFyIC0+IGZvb1xcYmFyKVxuICAgICAgICAvLyBUaGlzIGlzIG5lY2Vzc2FyeSBvdGhlcndpc2UgaXQgd2lsbCBhbHdheXMgZmFpbCB3aXRoIEVOT0VOVCBpbiB0aG9zZSBjYXNlc1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IHBhdGgubm9ybWFsaXplKHBhcnNlZC5jb21tYW5kKTtcblxuICAgICAgICAvLyBFc2NhcGUgY29tbWFuZCAmIGFyZ3VtZW50c1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IGVzY2FwZS5jb21tYW5kKHBhcnNlZC5jb21tYW5kKTtcbiAgICAgICAgcGFyc2VkLmFyZ3MgPSBwYXJzZWQuYXJncy5tYXAoKGFyZykgPT4gZXNjYXBlLmFyZ3VtZW50KGFyZywgbmVlZHNEb3VibGVFc2NhcGVNZXRhQ2hhcnMpKTtcblxuICAgICAgICBjb25zdCBzaGVsbENvbW1hbmQgPSBbcGFyc2VkLmNvbW1hbmRdLmNvbmNhdChwYXJzZWQuYXJncykuam9pbignICcpO1xuXG4gICAgICAgIHBhcnNlZC5hcmdzID0gWycvZCcsICcvcycsICcvYycsIGBcIiR7c2hlbGxDb21tYW5kfVwiYF07XG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gcHJvY2Vzcy5lbnYuY29tc3BlYyB8fCAnY21kLmV4ZSc7XG4gICAgICAgIHBhcnNlZC5vcHRpb25zLndpbmRvd3NWZXJiYXRpbUFyZ3VtZW50cyA9IHRydWU7IC8vIFRlbGwgbm9kZSdzIHNwYXduIHRoYXQgdGhlIGFyZ3VtZW50cyBhcmUgYWxyZWFkeSBlc2NhcGVkXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlZDtcbn1cblxuZnVuY3Rpb24gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucykge1xuICAgIC8vIE5vcm1hbGl6ZSBhcmd1bWVudHMsIHNpbWlsYXIgdG8gbm9kZWpzXG4gICAgaWYgKGFyZ3MgJiYgIUFycmF5LmlzQXJyYXkoYXJncykpIHtcbiAgICAgICAgb3B0aW9ucyA9IGFyZ3M7XG4gICAgICAgIGFyZ3MgPSBudWxsO1xuICAgIH1cblxuICAgIGFyZ3MgPSBhcmdzID8gYXJncy5zbGljZSgwKSA6IFtdOyAvLyBDbG9uZSBhcnJheSB0byBhdm9pZCBjaGFuZ2luZyB0aGUgb3JpZ2luYWxcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucyk7IC8vIENsb25lIG9iamVjdCB0byBhdm9pZCBjaGFuZ2luZyB0aGUgb3JpZ2luYWxcblxuICAgIC8vIEJ1aWxkIG91ciBwYXJzZWQgb2JqZWN0XG4gICAgY29uc3QgcGFyc2VkID0ge1xuICAgICAgICBjb21tYW5kLFxuICAgICAgICBhcmdzLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBmaWxlOiB1bmRlZmluZWQsXG4gICAgICAgIG9yaWdpbmFsOiB7XG4gICAgICAgICAgICBjb21tYW5kLFxuICAgICAgICAgICAgYXJncyxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gRGVsZWdhdGUgZnVydGhlciBwYXJzaW5nIHRvIHNoZWxsIG9yIG5vbi1zaGVsbFxuICAgIHJldHVybiBvcHRpb25zLnNoZWxsID8gcGFyc2VkIDogcGFyc2VOb25TaGVsbChwYXJzZWQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgaXNXaW4gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuXG5mdW5jdGlvbiBub3RGb3VuZEVycm9yKG9yaWdpbmFsLCBzeXNjYWxsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IEVycm9yKGAke3N5c2NhbGx9ICR7b3JpZ2luYWwuY29tbWFuZH0gRU5PRU5UYCksIHtcbiAgICAgICAgY29kZTogJ0VOT0VOVCcsXG4gICAgICAgIGVycm5vOiAnRU5PRU5UJyxcbiAgICAgICAgc3lzY2FsbDogYCR7c3lzY2FsbH0gJHtvcmlnaW5hbC5jb21tYW5kfWAsXG4gICAgICAgIHBhdGg6IG9yaWdpbmFsLmNvbW1hbmQsXG4gICAgICAgIHNwYXduYXJnczogb3JpZ2luYWwuYXJncyxcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gaG9va0NoaWxkUHJvY2VzcyhjcCwgcGFyc2VkKSB7XG4gICAgaWYgKCFpc1dpbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3JpZ2luYWxFbWl0ID0gY3AuZW1pdDtcblxuICAgIGNwLmVtaXQgPSBmdW5jdGlvbiAobmFtZSwgYXJnMSkge1xuICAgICAgICAvLyBJZiBlbWl0dGluZyBcImV4aXRcIiBldmVudCBhbmQgZXhpdCBjb2RlIGlzIDEsIHdlIG5lZWQgdG8gY2hlY2sgaWZcbiAgICAgICAgLy8gdGhlIGNvbW1hbmQgZXhpc3RzIGFuZCBlbWl0IGFuIFwiZXJyb3JcIiBpbnN0ZWFkXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vSW5kaWdvVW5pdGVkL25vZGUtY3Jvc3Mtc3Bhd24vaXNzdWVzLzE2XG4gICAgICAgIGlmIChuYW1lID09PSAnZXhpdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IHZlcmlmeUVOT0VOVChhcmcxLCBwYXJzZWQpO1xuXG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsRW1pdC5jYWxsKGNwLCAnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsRW1pdC5hcHBseShjcCwgYXJndW1lbnRzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwcmVmZXItcmVzdC1wYXJhbXNcbiAgICB9O1xufVxuXG5mdW5jdGlvbiB2ZXJpZnlFTk9FTlQoc3RhdHVzLCBwYXJzZWQpIHtcbiAgICBpZiAoaXNXaW4gJiYgc3RhdHVzID09PSAxICYmICFwYXJzZWQuZmlsZSkge1xuICAgICAgICByZXR1cm4gbm90Rm91bmRFcnJvcihwYXJzZWQub3JpZ2luYWwsICdzcGF3bicpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiB2ZXJpZnlFTk9FTlRTeW5jKHN0YXR1cywgcGFyc2VkKSB7XG4gICAgaWYgKGlzV2luICYmIHN0YXR1cyA9PT0gMSAmJiAhcGFyc2VkLmZpbGUpIHtcbiAgICAgICAgcmV0dXJuIG5vdEZvdW5kRXJyb3IocGFyc2VkLm9yaWdpbmFsLCAnc3Bhd25TeW5jJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGhvb2tDaGlsZFByb2Nlc3MsXG4gICAgdmVyaWZ5RU5PRU5ULFxuICAgIHZlcmlmeUVOT0VOVFN5bmMsXG4gICAgbm90Rm91bmRFcnJvcixcbn07XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBjcCA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcbmNvbnN0IHBhcnNlID0gcmVxdWlyZSgnLi9saWIvcGFyc2UnKTtcbmNvbnN0IGVub2VudCA9IHJlcXVpcmUoJy4vbGliL2Vub2VudCcpO1xuXG5mdW5jdGlvbiBzcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKSB7XG4gICAgLy8gUGFyc2UgdGhlIGFyZ3VtZW50c1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuXG4gICAgLy8gU3Bhd24gdGhlIGNoaWxkIHByb2Nlc3NcbiAgICBjb25zdCBzcGF3bmVkID0gY3Auc3Bhd24ocGFyc2VkLmNvbW1hbmQsIHBhcnNlZC5hcmdzLCBwYXJzZWQub3B0aW9ucyk7XG5cbiAgICAvLyBIb29rIGludG8gY2hpbGQgcHJvY2VzcyBcImV4aXRcIiBldmVudCB0byBlbWl0IGFuIGVycm9yIGlmIHRoZSBjb21tYW5kXG4gICAgLy8gZG9lcyBub3QgZXhpc3RzLCBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9JbmRpZ29Vbml0ZWQvbm9kZS1jcm9zcy1zcGF3bi9pc3N1ZXMvMTZcbiAgICBlbm9lbnQuaG9va0NoaWxkUHJvY2VzcyhzcGF3bmVkLCBwYXJzZWQpO1xuXG4gICAgcmV0dXJuIHNwYXduZWQ7XG59XG5cbmZ1bmN0aW9uIHNwYXduU3luYyhjb21tYW5kLCBhcmdzLCBvcHRpb25zKSB7XG4gICAgLy8gUGFyc2UgdGhlIGFyZ3VtZW50c1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuXG4gICAgLy8gU3Bhd24gdGhlIGNoaWxkIHByb2Nlc3NcbiAgICBjb25zdCByZXN1bHQgPSBjcC5zcGF3blN5bmMocGFyc2VkLmNvbW1hbmQsIHBhcnNlZC5hcmdzLCBwYXJzZWQub3B0aW9ucyk7XG5cbiAgICAvLyBBbmFseXplIGlmIHRoZSBjb21tYW5kIGRvZXMgbm90IGV4aXN0LCBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9JbmRpZ29Vbml0ZWQvbm9kZS1jcm9zcy1zcGF3bi9pc3N1ZXMvMTZcbiAgICByZXN1bHQuZXJyb3IgPSByZXN1bHQuZXJyb3IgfHwgZW5vZW50LnZlcmlmeUVOT0VOVFN5bmMocmVzdWx0LnN0YXR1cywgcGFyc2VkKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3Bhd247XG5tb2R1bGUuZXhwb3J0cy5zcGF3biA9IHNwYXduO1xubW9kdWxlLmV4cG9ydHMuc3luYyA9IHNwYXduU3luYztcblxubW9kdWxlLmV4cG9ydHMuX3BhcnNlID0gcGFyc2U7XG5tb2R1bGUuZXhwb3J0cy5fZW5vZW50ID0gZW5vZW50O1xuIiwgIi8vIFRoaXMgaXMgbm90IHRoZSBzZXQgb2YgYWxsIHBvc3NpYmxlIHNpZ25hbHMuXG4vL1xuLy8gSXQgSVMsIGhvd2V2ZXIsIHRoZSBzZXQgb2YgYWxsIHNpZ25hbHMgdGhhdCB0cmlnZ2VyXG4vLyBhbiBleGl0IG9uIGVpdGhlciBMaW51eCBvciBCU0Qgc3lzdGVtcy4gIExpbnV4IGlzIGFcbi8vIHN1cGVyc2V0IG9mIHRoZSBzaWduYWwgbmFtZXMgc3VwcG9ydGVkIG9uIEJTRCwgYW5kXG4vLyB0aGUgdW5rbm93biBzaWduYWxzIGp1c3QgZmFpbCB0byByZWdpc3Rlciwgc28gd2UgY2FuXG4vLyBjYXRjaCB0aGF0IGVhc2lseSBlbm91Z2guXG4vL1xuLy8gRG9uJ3QgYm90aGVyIHdpdGggU0lHS0lMTC4gIEl0J3MgdW5jYXRjaGFibGUsIHdoaWNoXG4vLyBtZWFucyB0aGF0IHdlIGNhbid0IGZpcmUgYW55IGNhbGxiYWNrcyBhbnl3YXkuXG4vL1xuLy8gSWYgYSB1c2VyIGRvZXMgaGFwcGVuIHRvIHJlZ2lzdGVyIGEgaGFuZGxlciBvbiBhIG5vbi1cbi8vIGZhdGFsIHNpZ25hbCBsaWtlIFNJR1dJTkNIIG9yIHNvbWV0aGluZywgYW5kIHRoZW5cbi8vIGV4aXQsIGl0J2xsIGVuZCB1cCBmaXJpbmcgYHByb2Nlc3MuZW1pdCgnZXhpdCcpYCwgc29cbi8vIHRoZSBoYW5kbGVyIHdpbGwgYmUgZmlyZWQgYW55d2F5LlxuLy9cbi8vIFNJR0JVUywgU0lHRlBFLCBTSUdTRUdWIGFuZCBTSUdJTEwsIHdoZW4gbm90IHJhaXNlZFxuLy8gYXJ0aWZpY2lhbGx5LCBpbmhlcmVudGx5IGxlYXZlIHRoZSBwcm9jZXNzIGluIGFcbi8vIHN0YXRlIGZyb20gd2hpY2ggaXQgaXMgbm90IHNhZmUgdG8gdHJ5IGFuZCBlbnRlciBKU1xuLy8gbGlzdGVuZXJzLlxubW9kdWxlLmV4cG9ydHMgPSBbXG4gICdTSUdBQlJUJyxcbiAgJ1NJR0FMUk0nLFxuICAnU0lHSFVQJyxcbiAgJ1NJR0lOVCcsXG4gICdTSUdURVJNJ1xuXVxuXG5pZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuICBtb2R1bGUuZXhwb3J0cy5wdXNoKFxuICAgICdTSUdWVEFMUk0nLFxuICAgICdTSUdYQ1BVJyxcbiAgICAnU0lHWEZTWicsXG4gICAgJ1NJR1VTUjInLFxuICAgICdTSUdUUkFQJyxcbiAgICAnU0lHU1lTJyxcbiAgICAnU0lHUVVJVCcsXG4gICAgJ1NJR0lPVCdcbiAgICAvLyBzaG91bGQgZGV0ZWN0IHByb2ZpbGVyIGFuZCBlbmFibGUvZGlzYWJsZSBhY2NvcmRpbmdseS5cbiAgICAvLyBzZWUgIzIxXG4gICAgLy8gJ1NJR1BST0YnXG4gIClcbn1cblxuaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdsaW51eCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMucHVzaChcbiAgICAnU0lHSU8nLFxuICAgICdTSUdQT0xMJyxcbiAgICAnU0lHUFdSJyxcbiAgICAnU0lHU1RLRkxUJyxcbiAgICAnU0lHVU5VU0VEJ1xuICApXG59XG4iLCAiLy8gTm90ZTogc2luY2UgbnljIHVzZXMgdGhpcyBtb2R1bGUgdG8gb3V0cHV0IGNvdmVyYWdlLCBhbnkgbGluZXNcbi8vIHRoYXQgYXJlIGluIHRoZSBkaXJlY3Qgc3luYyBmbG93IG9mIG55YydzIG91dHB1dENvdmVyYWdlIGFyZVxuLy8gaWdub3JlZCwgc2luY2Ugd2UgY2FuIG5ldmVyIGdldCBjb3ZlcmFnZSBmb3IgdGhlbS5cbi8vIGdyYWIgYSByZWZlcmVuY2UgdG8gbm9kZSdzIHJlYWwgcHJvY2VzcyBvYmplY3QgcmlnaHQgYXdheVxudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2Vzc1xuXG5jb25zdCBwcm9jZXNzT2sgPSBmdW5jdGlvbiAocHJvY2Vzcykge1xuICByZXR1cm4gcHJvY2VzcyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLnJlYWxseUV4aXQgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5saXN0ZW5lcnMgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5raWxsID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3MucGlkID09PSAnbnVtYmVyJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLm9uID09PSAnZnVuY3Rpb24nXG59XG5cbi8vIHNvbWUga2luZCBvZiBub24tbm9kZSBlbnZpcm9ubWVudCwganVzdCBuby1vcFxuLyogaXN0YW5idWwgaWdub3JlIGlmICovXG5pZiAoIXByb2Nlc3NPayhwcm9jZXNzKSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge31cbiAgfVxufSBlbHNlIHtcbiAgdmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpXG4gIHZhciBzaWduYWxzID0gcmVxdWlyZSgnLi9zaWduYWxzLmpzJylcbiAgdmFyIGlzV2luID0gL153aW4vaS50ZXN0KHByb2Nlc3MucGxhdGZvcm0pXG5cbiAgdmFyIEVFID0gcmVxdWlyZSgnZXZlbnRzJylcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICh0eXBlb2YgRUUgIT09ICdmdW5jdGlvbicpIHtcbiAgICBFRSA9IEVFLkV2ZW50RW1pdHRlclxuICB9XG5cbiAgdmFyIGVtaXR0ZXJcbiAgaWYgKHByb2Nlc3MuX19zaWduYWxfZXhpdF9lbWl0dGVyX18pIHtcbiAgICBlbWl0dGVyID0gcHJvY2Vzcy5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfX1xuICB9IGVsc2Uge1xuICAgIGVtaXR0ZXIgPSBwcm9jZXNzLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fID0gbmV3IEVFKClcbiAgICBlbWl0dGVyLmNvdW50ID0gMFxuICAgIGVtaXR0ZXIuZW1pdHRlZCA9IHt9XG4gIH1cblxuICAvLyBCZWNhdXNlIHRoaXMgZW1pdHRlciBpcyBhIGdsb2JhbCwgd2UgaGF2ZSB0byBjaGVjayB0byBzZWUgaWYgYVxuICAvLyBwcmV2aW91cyB2ZXJzaW9uIG9mIHRoaXMgbGlicmFyeSBmYWlsZWQgdG8gZW5hYmxlIGluZmluaXRlIGxpc3RlbmVycy5cbiAgLy8gSSBrbm93IHdoYXQgeW91J3JlIGFib3V0IHRvIHNheS4gIEJ1dCBsaXRlcmFsbHkgZXZlcnl0aGluZyBhYm91dFxuICAvLyBzaWduYWwtZXhpdCBpcyBhIGNvbXByb21pc2Ugd2l0aCBldmlsLiAgR2V0IHVzZWQgdG8gaXQuXG4gIGlmICghZW1pdHRlci5pbmZpbml0ZSkge1xuICAgIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKEluZmluaXR5KVxuICAgIGVtaXR0ZXIuaW5maW5pdGUgPSB0cnVlXG4gIH1cblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjYiwgb3B0cykge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHt9XG4gICAgfVxuICAgIGFzc2VydC5lcXVhbCh0eXBlb2YgY2IsICdmdW5jdGlvbicsICdhIGNhbGxiYWNrIG11c3QgYmUgcHJvdmlkZWQgZm9yIGV4aXQgaGFuZGxlcicpXG5cbiAgICBpZiAobG9hZGVkID09PSBmYWxzZSkge1xuICAgICAgbG9hZCgpXG4gICAgfVxuXG4gICAgdmFyIGV2ID0gJ2V4aXQnXG4gICAgaWYgKG9wdHMgJiYgb3B0cy5hbHdheXNMYXN0KSB7XG4gICAgICBldiA9ICdhZnRlcmV4aXQnXG4gICAgfVxuXG4gICAgdmFyIHJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoZXYsIGNiKVxuICAgICAgaWYgKGVtaXR0ZXIubGlzdGVuZXJzKCdleGl0JykubGVuZ3RoID09PSAwICYmXG4gICAgICAgICAgZW1pdHRlci5saXN0ZW5lcnMoJ2FmdGVyZXhpdCcpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB1bmxvYWQoKVxuICAgICAgfVxuICAgIH1cbiAgICBlbWl0dGVyLm9uKGV2LCBjYilcblxuICAgIHJldHVybiByZW1vdmVcbiAgfVxuXG4gIHZhciB1bmxvYWQgPSBmdW5jdGlvbiB1bmxvYWQgKCkge1xuICAgIGlmICghbG9hZGVkIHx8ICFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbG9hZGVkID0gZmFsc2VcblxuICAgIHNpZ25hbHMuZm9yRWFjaChmdW5jdGlvbiAoc2lnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBwcm9jZXNzLnJlbW92ZUxpc3RlbmVyKHNpZywgc2lnTGlzdGVuZXJzW3NpZ10pXG4gICAgICB9IGNhdGNoIChlcikge31cbiAgICB9KVxuICAgIHByb2Nlc3MuZW1pdCA9IG9yaWdpbmFsUHJvY2Vzc0VtaXRcbiAgICBwcm9jZXNzLnJlYWxseUV4aXQgPSBvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0XG4gICAgZW1pdHRlci5jb3VudCAtPSAxXG4gIH1cbiAgbW9kdWxlLmV4cG9ydHMudW5sb2FkID0gdW5sb2FkXG5cbiAgdmFyIGVtaXQgPSBmdW5jdGlvbiBlbWl0IChldmVudCwgY29kZSwgc2lnbmFsKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKGVtaXR0ZXIuZW1pdHRlZFtldmVudF0pIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBlbWl0dGVyLmVtaXR0ZWRbZXZlbnRdID0gdHJ1ZVxuICAgIGVtaXR0ZXIuZW1pdChldmVudCwgY29kZSwgc2lnbmFsKVxuICB9XG5cbiAgLy8geyA8c2lnbmFsPjogPGxpc3RlbmVyIGZuPiwgLi4uIH1cbiAgdmFyIHNpZ0xpc3RlbmVycyA9IHt9XG4gIHNpZ25hbHMuZm9yRWFjaChmdW5jdGlvbiAoc2lnKSB7XG4gICAgc2lnTGlzdGVuZXJzW3NpZ10gPSBmdW5jdGlvbiBsaXN0ZW5lciAoKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmICghcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBvdGhlciBsaXN0ZW5lcnMsIGFuIGV4aXQgaXMgY29taW5nIVxuICAgICAgLy8gU2ltcGxlc3Qgd2F5OiByZW1vdmUgdXMgYW5kIHRoZW4gcmUtc2VuZCB0aGUgc2lnbmFsLlxuICAgICAgLy8gV2Uga25vdyB0aGF0IHRoaXMgd2lsbCBraWxsIHRoZSBwcm9jZXNzLCBzbyB3ZSBjYW5cbiAgICAgIC8vIHNhZmVseSBlbWl0IG5vdy5cbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBwcm9jZXNzLmxpc3RlbmVycyhzaWcpXG4gICAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gZW1pdHRlci5jb3VudCkge1xuICAgICAgICB1bmxvYWQoKVxuICAgICAgICBlbWl0KCdleGl0JywgbnVsbCwgc2lnKVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBlbWl0KCdhZnRlcmV4aXQnLCBudWxsLCBzaWcpXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGlmIChpc1dpbiAmJiBzaWcgPT09ICdTSUdIVVAnKSB7XG4gICAgICAgICAgLy8gXCJTSUdIVVBcIiB0aHJvd3MgYW4gYEVOT1NZU2AgZXJyb3Igb24gV2luZG93cyxcbiAgICAgICAgICAvLyBzbyB1c2UgYSBzdXBwb3J0ZWQgc2lnbmFsIGluc3RlYWRcbiAgICAgICAgICBzaWcgPSAnU0lHSU5UJ1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHByb2Nlc3Mua2lsbChwcm9jZXNzLnBpZCwgc2lnKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICBtb2R1bGUuZXhwb3J0cy5zaWduYWxzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBzaWduYWxzXG4gIH1cblxuICB2YXIgbG9hZGVkID0gZmFsc2VcblxuICB2YXIgbG9hZCA9IGZ1bmN0aW9uIGxvYWQgKCkge1xuICAgIGlmIChsb2FkZWQgfHwgIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsb2FkZWQgPSB0cnVlXG5cbiAgICAvLyBUaGlzIGlzIHRoZSBudW1iZXIgb2Ygb25TaWduYWxFeGl0J3MgdGhhdCBhcmUgaW4gcGxheS5cbiAgICAvLyBJdCdzIGltcG9ydGFudCBzbyB0aGF0IHdlIGNhbiBjb3VudCB0aGUgY29ycmVjdCBudW1iZXIgb2ZcbiAgICAvLyBsaXN0ZW5lcnMgb24gc2lnbmFscywgYW5kIGRvbid0IHdhaXQgZm9yIHRoZSBvdGhlciBvbmUgdG9cbiAgICAvLyBoYW5kbGUgaXQgaW5zdGVhZCBvZiB1cy5cbiAgICBlbWl0dGVyLmNvdW50ICs9IDFcblxuICAgIHNpZ25hbHMgPSBzaWduYWxzLmZpbHRlcihmdW5jdGlvbiAoc2lnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBwcm9jZXNzLm9uKHNpZywgc2lnTGlzdGVuZXJzW3NpZ10pXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcHJvY2Vzcy5lbWl0ID0gcHJvY2Vzc0VtaXRcbiAgICBwcm9jZXNzLnJlYWxseUV4aXQgPSBwcm9jZXNzUmVhbGx5RXhpdFxuICB9XG4gIG1vZHVsZS5leHBvcnRzLmxvYWQgPSBsb2FkXG5cbiAgdmFyIG9yaWdpbmFsUHJvY2Vzc1JlYWxseUV4aXQgPSBwcm9jZXNzLnJlYWxseUV4aXRcbiAgdmFyIHByb2Nlc3NSZWFsbHlFeGl0ID0gZnVuY3Rpb24gcHJvY2Vzc1JlYWxseUV4aXQgKGNvZGUpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gY29kZSB8fCAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqLyAwXG4gICAgZW1pdCgnZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBlbWl0KCdhZnRlcmV4aXQnLCBwcm9jZXNzLmV4aXRDb2RlLCBudWxsKVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdC5jYWxsKHByb2Nlc3MsIHByb2Nlc3MuZXhpdENvZGUpXG4gIH1cblxuICB2YXIgb3JpZ2luYWxQcm9jZXNzRW1pdCA9IHByb2Nlc3MuZW1pdFxuICB2YXIgcHJvY2Vzc0VtaXQgPSBmdW5jdGlvbiBwcm9jZXNzRW1pdCAoZXYsIGFyZykge1xuICAgIGlmIChldiA9PT0gJ2V4aXQnICYmIHByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAoYXJnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IGFyZ1xuICAgICAgfVxuICAgICAgdmFyIHJldCA9IG9yaWdpbmFsUHJvY2Vzc0VtaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIGVtaXQoJ2V4aXQnLCBwcm9jZXNzLmV4aXRDb2RlLCBudWxsKVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIGVtaXQoJ2FmdGVyZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgcmV0dXJuIHJldFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3JpZ2luYWxQcm9jZXNzRW1pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgfVxuICB9XG59XG4iLCAiJ3VzZSBzdHJpY3QnO1xuY29uc3Qge1Bhc3NUaHJvdWdoOiBQYXNzVGhyb3VnaFN0cmVhbX0gPSByZXF1aXJlKCdzdHJlYW0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBvcHRpb25zID0+IHtcblx0b3B0aW9ucyA9IHsuLi5vcHRpb25zfTtcblxuXHRjb25zdCB7YXJyYXl9ID0gb3B0aW9ucztcblx0bGV0IHtlbmNvZGluZ30gPSBvcHRpb25zO1xuXHRjb25zdCBpc0J1ZmZlciA9IGVuY29kaW5nID09PSAnYnVmZmVyJztcblx0bGV0IG9iamVjdE1vZGUgPSBmYWxzZTtcblxuXHRpZiAoYXJyYXkpIHtcblx0XHRvYmplY3RNb2RlID0gIShlbmNvZGluZyB8fCBpc0J1ZmZlcik7XG5cdH0gZWxzZSB7XG5cdFx0ZW5jb2RpbmcgPSBlbmNvZGluZyB8fCAndXRmOCc7XG5cdH1cblxuXHRpZiAoaXNCdWZmZXIpIHtcblx0XHRlbmNvZGluZyA9IG51bGw7XG5cdH1cblxuXHRjb25zdCBzdHJlYW0gPSBuZXcgUGFzc1Rocm91Z2hTdHJlYW0oe29iamVjdE1vZGV9KTtcblxuXHRpZiAoZW5jb2RpbmcpIHtcblx0XHRzdHJlYW0uc2V0RW5jb2RpbmcoZW5jb2RpbmcpO1xuXHR9XG5cblx0bGV0IGxlbmd0aCA9IDA7XG5cdGNvbnN0IGNodW5rcyA9IFtdO1xuXG5cdHN0cmVhbS5vbignZGF0YScsIGNodW5rID0+IHtcblx0XHRjaHVua3MucHVzaChjaHVuayk7XG5cblx0XHRpZiAob2JqZWN0TW9kZSkge1xuXHRcdFx0bGVuZ3RoID0gY2h1bmtzLmxlbmd0aDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGVuZ3RoICs9IGNodW5rLmxlbmd0aDtcblx0XHR9XG5cdH0pO1xuXG5cdHN0cmVhbS5nZXRCdWZmZXJlZFZhbHVlID0gKCkgPT4ge1xuXHRcdGlmIChhcnJheSkge1xuXHRcdFx0cmV0dXJuIGNodW5rcztcblx0XHR9XG5cblx0XHRyZXR1cm4gaXNCdWZmZXIgPyBCdWZmZXIuY29uY2F0KGNodW5rcywgbGVuZ3RoKSA6IGNodW5rcy5qb2luKCcnKTtcblx0fTtcblxuXHRzdHJlYW0uZ2V0QnVmZmVyZWRMZW5ndGggPSAoKSA9PiBsZW5ndGg7XG5cblx0cmV0dXJuIHN0cmVhbTtcbn07XG4iLCAiJ3VzZSBzdHJpY3QnO1xuY29uc3Qge2NvbnN0YW50czogQnVmZmVyQ29uc3RhbnRzfSA9IHJlcXVpcmUoJ2J1ZmZlcicpO1xuY29uc3Qgc3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5jb25zdCB7cHJvbWlzaWZ5fSA9IHJlcXVpcmUoJ3V0aWwnKTtcbmNvbnN0IGJ1ZmZlclN0cmVhbSA9IHJlcXVpcmUoJy4vYnVmZmVyLXN0cmVhbScpO1xuXG5jb25zdCBzdHJlYW1QaXBlbGluZVByb21pc2lmaWVkID0gcHJvbWlzaWZ5KHN0cmVhbS5waXBlbGluZSk7XG5cbmNsYXNzIE1heEJ1ZmZlckVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcignbWF4QnVmZmVyIGV4Y2VlZGVkJyk7XG5cdFx0dGhpcy5uYW1lID0gJ01heEJ1ZmZlckVycm9yJztcblx0fVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRTdHJlYW0oaW5wdXRTdHJlYW0sIG9wdGlvbnMpIHtcblx0aWYgKCFpbnB1dFN0cmVhbSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgYSBzdHJlYW0nKTtcblx0fVxuXG5cdG9wdGlvbnMgPSB7XG5cdFx0bWF4QnVmZmVyOiBJbmZpbml0eSxcblx0XHQuLi5vcHRpb25zXG5cdH07XG5cblx0Y29uc3Qge21heEJ1ZmZlcn0gPSBvcHRpb25zO1xuXHRjb25zdCBzdHJlYW0gPSBidWZmZXJTdHJlYW0ob3B0aW9ucyk7XG5cblx0YXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdGNvbnN0IHJlamVjdFByb21pc2UgPSBlcnJvciA9PiB7XG5cdFx0XHQvLyBEb24ndCByZXRyaWV2ZSBhbiBvdmVyc2l6ZWQgYnVmZmVyLlxuXHRcdFx0aWYgKGVycm9yICYmIHN0cmVhbS5nZXRCdWZmZXJlZExlbmd0aCgpIDw9IEJ1ZmZlckNvbnN0YW50cy5NQVhfTEVOR1RIKSB7XG5cdFx0XHRcdGVycm9yLmJ1ZmZlcmVkRGF0YSA9IHN0cmVhbS5nZXRCdWZmZXJlZFZhbHVlKCk7XG5cdFx0XHR9XG5cblx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0fTtcblxuXHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCBzdHJlYW1QaXBlbGluZVByb21pc2lmaWVkKGlucHV0U3RyZWFtLCBzdHJlYW0pO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRyZWplY3RQcm9taXNlKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KSgpO1xuXG5cdFx0c3RyZWFtLm9uKCdkYXRhJywgKCkgPT4ge1xuXHRcdFx0aWYgKHN0cmVhbS5nZXRCdWZmZXJlZExlbmd0aCgpID4gbWF4QnVmZmVyKSB7XG5cdFx0XHRcdHJlamVjdFByb21pc2UobmV3IE1heEJ1ZmZlckVycm9yKCkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcblxuXHRyZXR1cm4gc3RyZWFtLmdldEJ1ZmZlcmVkVmFsdWUoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRTdHJlYW07XG5tb2R1bGUuZXhwb3J0cy5idWZmZXIgPSAoc3RyZWFtLCBvcHRpb25zKSA9PiBnZXRTdHJlYW0oc3RyZWFtLCB7Li4ub3B0aW9ucywgZW5jb2Rpbmc6ICdidWZmZXInfSk7XG5tb2R1bGUuZXhwb3J0cy5hcnJheSA9IChzdHJlYW0sIG9wdGlvbnMpID0+IGdldFN0cmVhbShzdHJlYW0sIHsuLi5vcHRpb25zLCBhcnJheTogdHJ1ZX0pO1xubW9kdWxlLmV4cG9ydHMuTWF4QnVmZmVyRXJyb3IgPSBNYXhCdWZmZXJFcnJvcjtcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHsgUGFzc1Rocm91Z2ggfSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgvKnN0cmVhbXMuLi4qLykge1xuICB2YXIgc291cmNlcyA9IFtdXG4gIHZhciBvdXRwdXQgID0gbmV3IFBhc3NUaHJvdWdoKHtvYmplY3RNb2RlOiB0cnVlfSlcblxuICBvdXRwdXQuc2V0TWF4TGlzdGVuZXJzKDApXG5cbiAgb3V0cHV0LmFkZCA9IGFkZFxuICBvdXRwdXQuaXNFbXB0eSA9IGlzRW1wdHlcblxuICBvdXRwdXQub24oJ3VucGlwZScsIHJlbW92ZSlcblxuICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmZvckVhY2goYWRkKVxuXG4gIHJldHVybiBvdXRwdXRcblxuICBmdW5jdGlvbiBhZGQgKHNvdXJjZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHNvdXJjZS5mb3JFYWNoKGFkZClcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgc291cmNlcy5wdXNoKHNvdXJjZSk7XG4gICAgc291cmNlLm9uY2UoJ2VuZCcsIHJlbW92ZS5iaW5kKG51bGwsIHNvdXJjZSkpXG4gICAgc291cmNlLm9uY2UoJ2Vycm9yJywgb3V0cHV0LmVtaXQuYmluZChvdXRwdXQsICdlcnJvcicpKVxuICAgIHNvdXJjZS5waXBlKG91dHB1dCwge2VuZDogZmFsc2V9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBmdW5jdGlvbiBpc0VtcHR5ICgpIHtcbiAgICByZXR1cm4gc291cmNlcy5sZW5ndGggPT0gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZSAoc291cmNlKSB7XG4gICAgc291cmNlcyA9IHNvdXJjZXMuZmlsdGVyKGZ1bmN0aW9uIChpdCkgeyByZXR1cm4gaXQgIT09IHNvdXJjZSB9KVxuICAgIGlmICghc291cmNlcy5sZW5ndGggJiYgb3V0cHV0LnJlYWRhYmxlKSB7IG91dHB1dC5lbmQoKSB9XG4gIH1cbn1cbiIsICIvKipcbiAqIEBsaWNlbnNlIG5vZGUtc3RyZWFtLXppcCB8IChjKSAyMDIwIEFudGVsbGUgfCBodHRwczovL2dpdGh1Yi5jb20vYW50ZWxsZS9ub2RlLXN0cmVhbS16aXAvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICogUG9ydGlvbnMgY29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9jdGhhY2tlcnMvYWRtLXppcCB8IGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9jdGhhY2tlcnMvYWRtLXppcC9tYXN0ZXIvTElDRU5TRVxuICovXG5cbmxldCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuY29uc3QgemxpYiA9IHJlcXVpcmUoJ3psaWInKTtcbmNvbnN0IHN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG5jb25zdCBjb25zdHMgPSB7XG4gICAgLyogVGhlIGxvY2FsIGZpbGUgaGVhZGVyICovXG4gICAgTE9DSERSOiAzMCwgLy8gTE9DIGhlYWRlciBzaXplXG4gICAgTE9DU0lHOiAweDA0MDM0YjUwLCAvLyBcIlBLXFwwMDNcXDAwNFwiXG4gICAgTE9DVkVSOiA0LCAvLyB2ZXJzaW9uIG5lZWRlZCB0byBleHRyYWN0XG4gICAgTE9DRkxHOiA2LCAvLyBnZW5lcmFsIHB1cnBvc2UgYml0IGZsYWdcbiAgICBMT0NIT1c6IDgsIC8vIGNvbXByZXNzaW9uIG1ldGhvZFxuICAgIExPQ1RJTTogMTAsIC8vIG1vZGlmaWNhdGlvbiB0aW1lICgyIGJ5dGVzIHRpbWUsIDIgYnl0ZXMgZGF0ZSlcbiAgICBMT0NDUkM6IDE0LCAvLyB1bmNvbXByZXNzZWQgZmlsZSBjcmMtMzIgdmFsdWVcbiAgICBMT0NTSVo6IDE4LCAvLyBjb21wcmVzc2VkIHNpemVcbiAgICBMT0NMRU46IDIyLCAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuICAgIExPQ05BTTogMjYsIC8vIGZpbGVuYW1lIGxlbmd0aFxuICAgIExPQ0VYVDogMjgsIC8vIGV4dHJhIGZpZWxkIGxlbmd0aFxuXG4gICAgLyogVGhlIERhdGEgZGVzY3JpcHRvciAqL1xuICAgIEVYVFNJRzogMHgwODA3NGI1MCwgLy8gXCJQS1xcMDA3XFwwMDhcIlxuICAgIEVYVEhEUjogMTYsIC8vIEVYVCBoZWFkZXIgc2l6ZVxuICAgIEVYVENSQzogNCwgLy8gdW5jb21wcmVzc2VkIGZpbGUgY3JjLTMyIHZhbHVlXG4gICAgRVhUU0laOiA4LCAvLyBjb21wcmVzc2VkIHNpemVcbiAgICBFWFRMRU46IDEyLCAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuXG4gICAgLyogVGhlIGNlbnRyYWwgZGlyZWN0b3J5IGZpbGUgaGVhZGVyICovXG4gICAgQ0VOSERSOiA0NiwgLy8gQ0VOIGhlYWRlciBzaXplXG4gICAgQ0VOU0lHOiAweDAyMDE0YjUwLCAvLyBcIlBLXFwwMDFcXDAwMlwiXG4gICAgQ0VOVkVNOiA0LCAvLyB2ZXJzaW9uIG1hZGUgYnlcbiAgICBDRU5WRVI6IDYsIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcbiAgICBDRU5GTEc6IDgsIC8vIGVuY3J5cHQsIGRlY3J5cHQgZmxhZ3NcbiAgICBDRU5IT1c6IDEwLCAvLyBjb21wcmVzc2lvbiBtZXRob2RcbiAgICBDRU5USU06IDEyLCAvLyBtb2RpZmljYXRpb24gdGltZSAoMiBieXRlcyB0aW1lLCAyIGJ5dGVzIGRhdGUpXG4gICAgQ0VOQ1JDOiAxNiwgLy8gdW5jb21wcmVzc2VkIGZpbGUgY3JjLTMyIHZhbHVlXG4gICAgQ0VOU0laOiAyMCwgLy8gY29tcHJlc3NlZCBzaXplXG4gICAgQ0VOTEVOOiAyNCwgLy8gdW5jb21wcmVzc2VkIHNpemVcbiAgICBDRU5OQU06IDI4LCAvLyBmaWxlbmFtZSBsZW5ndGhcbiAgICBDRU5FWFQ6IDMwLCAvLyBleHRyYSBmaWVsZCBsZW5ndGhcbiAgICBDRU5DT006IDMyLCAvLyBmaWxlIGNvbW1lbnQgbGVuZ3RoXG4gICAgQ0VORFNLOiAzNCwgLy8gdm9sdW1lIG51bWJlciBzdGFydFxuICAgIENFTkFUVDogMzYsIC8vIGludGVybmFsIGZpbGUgYXR0cmlidXRlc1xuICAgIENFTkFUWDogMzgsIC8vIGV4dGVybmFsIGZpbGUgYXR0cmlidXRlcyAoaG9zdCBzeXN0ZW0gZGVwZW5kZW50KVxuICAgIENFTk9GRjogNDIsIC8vIExPQyBoZWFkZXIgb2Zmc2V0XG5cbiAgICAvKiBUaGUgZW50cmllcyBpbiB0aGUgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5ICovXG4gICAgRU5ESERSOiAyMiwgLy8gRU5EIGhlYWRlciBzaXplXG4gICAgRU5EU0lHOiAweDA2MDU0YjUwLCAvLyBcIlBLXFwwMDVcXDAwNlwiXG4gICAgRU5EU0lHRklSU1Q6IDB4NTAsXG4gICAgRU5EU1VCOiA4LCAvLyBudW1iZXIgb2YgZW50cmllcyBvbiB0aGlzIGRpc2tcbiAgICBFTkRUT1Q6IDEwLCAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllc1xuICAgIEVORFNJWjogMTIsIC8vIGNlbnRyYWwgZGlyZWN0b3J5IHNpemUgaW4gYnl0ZXNcbiAgICBFTkRPRkY6IDE2LCAvLyBvZmZzZXQgb2YgZmlyc3QgQ0VOIGhlYWRlclxuICAgIEVORENPTTogMjAsIC8vIHppcCBmaWxlIGNvbW1lbnQgbGVuZ3RoXG4gICAgTUFYRklMRUNPTU1FTlQ6IDB4ZmZmZixcblxuICAgIC8qIFRoZSBlbnRyaWVzIGluIHRoZSBlbmQgb2YgWklQNjQgY2VudHJhbCBkaXJlY3RvcnkgbG9jYXRvciAqL1xuICAgIEVOREw2NEhEUjogMjAsIC8vIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBsb2NhdG9yIGhlYWRlciBzaXplXG4gICAgRU5ETDY0U0lHOiAweDA3MDY0YjUwLCAvLyBaSVA2NCBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnkgbG9jYXRvciBzaWduYXR1cmVcbiAgICBFTkRMNjRTSUdGSVJTVDogMHg1MCxcbiAgICBFTkRMNjRPRlM6IDgsIC8vIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBvZmZzZXRcblxuICAgIC8qIFRoZSBlbnRyaWVzIGluIHRoZSBlbmQgb2YgWklQNjQgY2VudHJhbCBkaXJlY3RvcnkgKi9cbiAgICBFTkQ2NEhEUjogNTYsIC8vIFpJUDY0IGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSBoZWFkZXIgc2l6ZVxuICAgIEVORDY0U0lHOiAweDA2MDY0YjUwLCAvLyBaSVA2NCBlbmQgb2YgY2VudHJhbCBkaXJlY3Rvcnkgc2lnbmF0dXJlXG4gICAgRU5ENjRTSUdGSVJTVDogMHg1MCxcbiAgICBFTkQ2NFNVQjogMjQsIC8vIG51bWJlciBvZiBlbnRyaWVzIG9uIHRoaXMgZGlza1xuICAgIEVORDY0VE9UOiAzMiwgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXNcbiAgICBFTkQ2NFNJWjogNDAsXG4gICAgRU5ENjRPRkY6IDQ4LFxuXG4gICAgLyogQ29tcHJlc3Npb24gbWV0aG9kcyAqL1xuICAgIFNUT1JFRDogMCwgLy8gbm8gY29tcHJlc3Npb25cbiAgICBTSFJVTks6IDEsIC8vIHNocnVua1xuICAgIFJFRFVDRUQxOiAyLCAvLyByZWR1Y2VkIHdpdGggY29tcHJlc3Npb24gZmFjdG9yIDFcbiAgICBSRURVQ0VEMjogMywgLy8gcmVkdWNlZCB3aXRoIGNvbXByZXNzaW9uIGZhY3RvciAyXG4gICAgUkVEVUNFRDM6IDQsIC8vIHJlZHVjZWQgd2l0aCBjb21wcmVzc2lvbiBmYWN0b3IgM1xuICAgIFJFRFVDRUQ0OiA1LCAvLyByZWR1Y2VkIHdpdGggY29tcHJlc3Npb24gZmFjdG9yIDRcbiAgICBJTVBMT0RFRDogNiwgLy8gaW1wbG9kZWRcbiAgICAvLyA3IHJlc2VydmVkXG4gICAgREVGTEFURUQ6IDgsIC8vIGRlZmxhdGVkXG4gICAgRU5IQU5DRURfREVGTEFURUQ6IDksIC8vIGRlZmxhdGU2NFxuICAgIFBLV0FSRTogMTAsIC8vIFBLV2FyZSBEQ0wgaW1wbG9kZWRcbiAgICAvLyAxMSByZXNlcnZlZFxuICAgIEJaSVAyOiAxMiwgLy8gIGNvbXByZXNzZWQgdXNpbmcgQlpJUDJcbiAgICAvLyAxMyByZXNlcnZlZFxuICAgIExaTUE6IDE0LCAvLyBMWk1BXG4gICAgLy8gMTUtMTcgcmVzZXJ2ZWRcbiAgICBJQk1fVEVSU0U6IDE4LCAvLyBjb21wcmVzc2VkIHVzaW5nIElCTSBURVJTRVxuICAgIElCTV9MWjc3OiAxOSwgLy9JQk0gTFo3NyB6XG5cbiAgICAvKiBHZW5lcmFsIHB1cnBvc2UgYml0IGZsYWcgKi9cbiAgICBGTEdfRU5DOiAwLCAvLyBlbmNyeXB0ZWQgZmlsZVxuICAgIEZMR19DT01QMTogMSwgLy8gY29tcHJlc3Npb24gb3B0aW9uXG4gICAgRkxHX0NPTVAyOiAyLCAvLyBjb21wcmVzc2lvbiBvcHRpb25cbiAgICBGTEdfREVTQzogNCwgLy8gZGF0YSBkZXNjcmlwdG9yXG4gICAgRkxHX0VOSDogOCwgLy8gZW5oYW5jZWQgZGVmbGF0aW9uXG4gICAgRkxHX1NUUjogMTYsIC8vIHN0cm9uZyBlbmNyeXB0aW9uXG4gICAgRkxHX0xORzogMTAyNCwgLy8gbGFuZ3VhZ2UgZW5jb2RpbmdcbiAgICBGTEdfTVNLOiA0MDk2LCAvLyBtYXNrIGhlYWRlciB2YWx1ZXNcbiAgICBGTEdfRU5UUllfRU5DOiAxLFxuXG4gICAgLyogNC41IEV4dGVuc2libGUgZGF0YSBmaWVsZHMgKi9cbiAgICBFRl9JRDogMCxcbiAgICBFRl9TSVpFOiAyLFxuXG4gICAgLyogSGVhZGVyIElEcyAqL1xuICAgIElEX1pJUDY0OiAweDAwMDEsXG4gICAgSURfQVZJTkZPOiAweDAwMDcsXG4gICAgSURfUEZTOiAweDAwMDgsXG4gICAgSURfT1MyOiAweDAwMDksXG4gICAgSURfTlRGUzogMHgwMDBhLFxuICAgIElEX09QRU5WTVM6IDB4MDAwYyxcbiAgICBJRF9VTklYOiAweDAwMGQsXG4gICAgSURfRk9SSzogMHgwMDBlLFxuICAgIElEX1BBVENIOiAweDAwMGYsXG4gICAgSURfWDUwOV9QS0NTNzogMHgwMDE0LFxuICAgIElEX1g1MDlfQ0VSVElEX0Y6IDB4MDAxNSxcbiAgICBJRF9YNTA5X0NFUlRJRF9DOiAweDAwMTYsXG4gICAgSURfU1RST05HRU5DOiAweDAwMTcsXG4gICAgSURfUkVDT1JEX01HVDogMHgwMDE4LFxuICAgIElEX1g1MDlfUEtDUzdfUkw6IDB4MDAxOSxcbiAgICBJRF9JQk0xOiAweDAwNjUsXG4gICAgSURfSUJNMjogMHgwMDY2LFxuICAgIElEX1BPU1pJUDogMHg0NjkwLFxuXG4gICAgRUZfWklQNjRfT1JfMzI6IDB4ZmZmZmZmZmYsXG4gICAgRUZfWklQNjRfT1JfMTY6IDB4ZmZmZixcbn07XG5cbmNvbnN0IFN0cmVhbVppcCA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBsZXQgZmQsIGZpbGVTaXplLCBjaHVua1NpemUsIG9wLCBjZW50cmFsRGlyZWN0b3J5LCBjbG9zZWQ7XG4gICAgY29uc3QgcmVhZHkgPSBmYWxzZSxcbiAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgIGVudHJpZXMgPSBjb25maWcuc3RvcmVFbnRyaWVzICE9PSBmYWxzZSA/IHt9IDogbnVsbCxcbiAgICAgICAgZmlsZU5hbWUgPSBjb25maWcuZmlsZSxcbiAgICAgICAgdGV4dERlY29kZXIgPSBjb25maWcubmFtZUVuY29kaW5nID8gbmV3IFRleHREZWNvZGVyKGNvbmZpZy5uYW1lRW5jb2RpbmcpIDogbnVsbDtcblxuICAgIG9wZW4oKTtcblxuICAgIGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICAgIGlmIChjb25maWcuZmQpIHtcbiAgICAgICAgICAgIGZkID0gY29uZmlnLmZkO1xuICAgICAgICAgICAgcmVhZEZpbGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZzLm9wZW4oZmlsZU5hbWUsICdyJywgKGVyciwgZikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmZCA9IGY7XG4gICAgICAgICAgICAgICAgcmVhZEZpbGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZEZpbGUoKSB7XG4gICAgICAgIGZzLmZzdGF0KGZkLCAoZXJyLCBzdGF0KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZVNpemUgPSBzdGF0LnNpemU7XG4gICAgICAgICAgICBjaHVua1NpemUgPSBjb25maWcuY2h1bmtTaXplIHx8IE1hdGgucm91bmQoZmlsZVNpemUgLyAxMDAwKTtcbiAgICAgICAgICAgIGNodW5rU2l6ZSA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgIE1hdGgubWluKGNodW5rU2l6ZSwgTWF0aC5taW4oMTI4ICogMTAyNCwgZmlsZVNpemUpKSxcbiAgICAgICAgICAgICAgICBNYXRoLm1pbigxMDI0LCBmaWxlU2l6ZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZWFkQ2VudHJhbERpcmVjdG9yeSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkVW50aWxGb3VuZENhbGxiYWNrKGVyciwgYnl0ZXNSZWFkKSB7XG4gICAgICAgIGlmIChlcnIgfHwgIWJ5dGVzUmVhZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW1pdCgnZXJyb3InLCBlcnIgfHwgbmV3IEVycm9yKCdBcmNoaXZlIHJlYWQgZXJyb3InKSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHBvcyA9IG9wLmxhc3RQb3M7XG4gICAgICAgIGxldCBidWZmZXJQb3NpdGlvbiA9IHBvcyAtIG9wLndpbi5wb3NpdGlvbjtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gb3Aud2luLmJ1ZmZlcjtcbiAgICAgICAgY29uc3QgbWluUG9zID0gb3AubWluUG9zO1xuICAgICAgICB3aGlsZSAoLS1wb3MgPj0gbWluUG9zICYmIC0tYnVmZmVyUG9zaXRpb24gPj0gMCkge1xuICAgICAgICAgICAgaWYgKGJ1ZmZlci5sZW5ndGggLSBidWZmZXJQb3NpdGlvbiA+PSA0ICYmIGJ1ZmZlcltidWZmZXJQb3NpdGlvbl0gPT09IG9wLmZpcnN0Qnl0ZSkge1xuICAgICAgICAgICAgICAgIC8vIHF1aWNrIGNoZWNrIGZpcnN0IHNpZ25hdHVyZSBieXRlXG4gICAgICAgICAgICAgICAgaWYgKGJ1ZmZlci5yZWFkVUludDMyTEUoYnVmZmVyUG9zaXRpb24pID09PSBvcC5zaWcpIHtcbiAgICAgICAgICAgICAgICAgICAgb3AubGFzdEJ1ZmZlclBvc2l0aW9uID0gYnVmZmVyUG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgIG9wLmxhc3RCeXRlc1JlYWQgPSBieXRlc1JlYWQ7XG4gICAgICAgICAgICAgICAgICAgIG9wLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvcyA9PT0gbWluUG9zKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignQmFkIGFyY2hpdmUnKSk7XG4gICAgICAgIH1cbiAgICAgICAgb3AubGFzdFBvcyA9IHBvcyArIDE7XG4gICAgICAgIG9wLmNodW5rU2l6ZSAqPSAyO1xuICAgICAgICBpZiAocG9zIDw9IG1pblBvcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ0JhZCBhcmNoaXZlJykpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4cGFuZExlbmd0aCA9IE1hdGgubWluKG9wLmNodW5rU2l6ZSwgcG9zIC0gbWluUG9zKTtcbiAgICAgICAgb3Aud2luLmV4cGFuZExlZnQoZXhwYW5kTGVuZ3RoLCByZWFkVW50aWxGb3VuZENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkQ2VudHJhbERpcmVjdG9yeSgpIHtcbiAgICAgICAgY29uc3QgdG90YWxSZWFkTGVuZ3RoID0gTWF0aC5taW4oY29uc3RzLkVOREhEUiArIGNvbnN0cy5NQVhGSUxFQ09NTUVOVCwgZmlsZVNpemUpO1xuICAgICAgICBvcCA9IHtcbiAgICAgICAgICAgIHdpbjogbmV3IEZpbGVXaW5kb3dCdWZmZXIoZmQpLFxuICAgICAgICAgICAgdG90YWxSZWFkTGVuZ3RoLFxuICAgICAgICAgICAgbWluUG9zOiBmaWxlU2l6ZSAtIHRvdGFsUmVhZExlbmd0aCxcbiAgICAgICAgICAgIGxhc3RQb3M6IGZpbGVTaXplLFxuICAgICAgICAgICAgY2h1bmtTaXplOiBNYXRoLm1pbigxMDI0LCBjaHVua1NpemUpLFxuICAgICAgICAgICAgZmlyc3RCeXRlOiBjb25zdHMuRU5EU0lHRklSU1QsXG4gICAgICAgICAgICBzaWc6IGNvbnN0cy5FTkRTSUcsXG4gICAgICAgICAgICBjb21wbGV0ZTogcmVhZENlbnRyYWxEaXJlY3RvcnlDb21wbGV0ZSxcbiAgICAgICAgfTtcbiAgICAgICAgb3Aud2luLnJlYWQoZmlsZVNpemUgLSBvcC5jaHVua1NpemUsIG9wLmNodW5rU2l6ZSwgcmVhZFVudGlsRm91bmRDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZENlbnRyYWxEaXJlY3RvcnlDb21wbGV0ZSgpIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gb3Aud2luLmJ1ZmZlcjtcbiAgICAgICAgY29uc3QgcG9zID0gb3AubGFzdEJ1ZmZlclBvc2l0aW9uO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2VudHJhbERpcmVjdG9yeSA9IG5ldyBDZW50cmFsRGlyZWN0b3J5SGVhZGVyKCk7XG4gICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5LnJlYWQoYnVmZmVyLnNsaWNlKHBvcywgcG9zICsgY29uc3RzLkVOREhEUikpO1xuICAgICAgICAgICAgY2VudHJhbERpcmVjdG9yeS5oZWFkZXJPZmZzZXQgPSBvcC53aW4ucG9zaXRpb24gKyBwb3M7XG4gICAgICAgICAgICBpZiAoY2VudHJhbERpcmVjdG9yeS5jb21tZW50TGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jb21tZW50ID0gYnVmZmVyXG4gICAgICAgICAgICAgICAgICAgIC5zbGljZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyArIGNvbnN0cy5FTkRIRFIsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgKyBjb25zdHMuRU5ESERSICsgY2VudHJhbERpcmVjdG9yeS5jb21tZW50TGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoYXQuY29tbWVudCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGF0LmVudHJpZXNDb3VudCA9IGNlbnRyYWxEaXJlY3Rvcnkudm9sdW1lRW50cmllcztcbiAgICAgICAgICAgIHRoYXQuY2VudHJhbERpcmVjdG9yeSA9IGNlbnRyYWxEaXJlY3Rvcnk7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgKGNlbnRyYWxEaXJlY3Rvcnkudm9sdW1lRW50cmllcyA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzE2ICYmXG4gICAgICAgICAgICAgICAgICAgIGNlbnRyYWxEaXJlY3RvcnkudG90YWxFbnRyaWVzID09PSBjb25zdHMuRUZfWklQNjRfT1JfMTYpIHx8XG4gICAgICAgICAgICAgICAgY2VudHJhbERpcmVjdG9yeS5zaXplID09PSBjb25zdHMuRUZfWklQNjRfT1JfMzIgfHxcbiAgICAgICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5Lm9mZnNldCA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzMyXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZWFkWmlwNjRDZW50cmFsRGlyZWN0b3J5TG9jYXRvcigpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcCA9IHt9O1xuICAgICAgICAgICAgICAgIHJlYWRFbnRyaWVzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhhdC5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkWmlwNjRDZW50cmFsRGlyZWN0b3J5TG9jYXRvcigpIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gY29uc3RzLkVOREw2NEhEUjtcbiAgICAgICAgaWYgKG9wLmxhc3RCdWZmZXJQb3NpdGlvbiA+IGxlbmd0aCkge1xuICAgICAgICAgICAgb3AubGFzdEJ1ZmZlclBvc2l0aW9uIC09IGxlbmd0aDtcbiAgICAgICAgICAgIHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlMb2NhdG9yQ29tcGxldGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9wID0ge1xuICAgICAgICAgICAgICAgIHdpbjogb3Aud2luLFxuICAgICAgICAgICAgICAgIHRvdGFsUmVhZExlbmd0aDogbGVuZ3RoLFxuICAgICAgICAgICAgICAgIG1pblBvczogb3Aud2luLnBvc2l0aW9uIC0gbGVuZ3RoLFxuICAgICAgICAgICAgICAgIGxhc3RQb3M6IG9wLndpbi5wb3NpdGlvbixcbiAgICAgICAgICAgICAgICBjaHVua1NpemU6IG9wLmNodW5rU2l6ZSxcbiAgICAgICAgICAgICAgICBmaXJzdEJ5dGU6IGNvbnN0cy5FTkRMNjRTSUdGSVJTVCxcbiAgICAgICAgICAgICAgICBzaWc6IGNvbnN0cy5FTkRMNjRTSUcsXG4gICAgICAgICAgICAgICAgY29tcGxldGU6IHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlMb2NhdG9yQ29tcGxldGUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgb3Aud2luLnJlYWQob3AubGFzdFBvcyAtIG9wLmNodW5rU2l6ZSwgb3AuY2h1bmtTaXplLCByZWFkVW50aWxGb3VuZENhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlMb2NhdG9yQ29tcGxldGUoKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IG9wLndpbi5idWZmZXI7XG4gICAgICAgIGNvbnN0IGxvY0hlYWRlciA9IG5ldyBDZW50cmFsRGlyZWN0b3J5TG9jNjRIZWFkZXIoKTtcbiAgICAgICAgbG9jSGVhZGVyLnJlYWQoXG4gICAgICAgICAgICBidWZmZXIuc2xpY2Uob3AubGFzdEJ1ZmZlclBvc2l0aW9uLCBvcC5sYXN0QnVmZmVyUG9zaXRpb24gKyBjb25zdHMuRU5ETDY0SERSKVxuICAgICAgICApO1xuICAgICAgICBjb25zdCByZWFkTGVuZ3RoID0gZmlsZVNpemUgLSBsb2NIZWFkZXIuaGVhZGVyT2Zmc2V0O1xuICAgICAgICBvcCA9IHtcbiAgICAgICAgICAgIHdpbjogb3Aud2luLFxuICAgICAgICAgICAgdG90YWxSZWFkTGVuZ3RoOiByZWFkTGVuZ3RoLFxuICAgICAgICAgICAgbWluUG9zOiBsb2NIZWFkZXIuaGVhZGVyT2Zmc2V0LFxuICAgICAgICAgICAgbGFzdFBvczogb3AubGFzdFBvcyxcbiAgICAgICAgICAgIGNodW5rU2l6ZTogb3AuY2h1bmtTaXplLFxuICAgICAgICAgICAgZmlyc3RCeXRlOiBjb25zdHMuRU5ENjRTSUdGSVJTVCxcbiAgICAgICAgICAgIHNpZzogY29uc3RzLkVORDY0U0lHLFxuICAgICAgICAgICAgY29tcGxldGU6IHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlDb21wbGV0ZSxcbiAgICAgICAgfTtcbiAgICAgICAgb3Aud2luLnJlYWQoZmlsZVNpemUgLSBvcC5jaHVua1NpemUsIG9wLmNodW5rU2l6ZSwgcmVhZFVudGlsRm91bmRDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUNvbXBsZXRlKCkge1xuICAgICAgICBjb25zdCBidWZmZXIgPSBvcC53aW4uYnVmZmVyO1xuICAgICAgICBjb25zdCB6aXA2NGNkID0gbmV3IENlbnRyYWxEaXJlY3RvcnlaaXA2NEhlYWRlcigpO1xuICAgICAgICB6aXA2NGNkLnJlYWQoYnVmZmVyLnNsaWNlKG9wLmxhc3RCdWZmZXJQb3NpdGlvbiwgb3AubGFzdEJ1ZmZlclBvc2l0aW9uICsgY29uc3RzLkVORDY0SERSKSk7XG4gICAgICAgIHRoYXQuY2VudHJhbERpcmVjdG9yeS52b2x1bWVFbnRyaWVzID0gemlwNjRjZC52b2x1bWVFbnRyaWVzO1xuICAgICAgICB0aGF0LmNlbnRyYWxEaXJlY3RvcnkudG90YWxFbnRyaWVzID0gemlwNjRjZC50b3RhbEVudHJpZXM7XG4gICAgICAgIHRoYXQuY2VudHJhbERpcmVjdG9yeS5zaXplID0gemlwNjRjZC5zaXplO1xuICAgICAgICB0aGF0LmNlbnRyYWxEaXJlY3Rvcnkub2Zmc2V0ID0gemlwNjRjZC5vZmZzZXQ7XG4gICAgICAgIHRoYXQuZW50cmllc0NvdW50ID0gemlwNjRjZC52b2x1bWVFbnRyaWVzO1xuICAgICAgICBvcCA9IHt9O1xuICAgICAgICByZWFkRW50cmllcygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRFbnRyaWVzKCkge1xuICAgICAgICBvcCA9IHtcbiAgICAgICAgICAgIHdpbjogbmV3IEZpbGVXaW5kb3dCdWZmZXIoZmQpLFxuICAgICAgICAgICAgcG9zOiBjZW50cmFsRGlyZWN0b3J5Lm9mZnNldCxcbiAgICAgICAgICAgIGNodW5rU2l6ZSxcbiAgICAgICAgICAgIGVudHJpZXNMZWZ0OiBjZW50cmFsRGlyZWN0b3J5LnZvbHVtZUVudHJpZXMsXG4gICAgICAgIH07XG4gICAgICAgIG9wLndpbi5yZWFkKG9wLnBvcywgTWF0aC5taW4oY2h1bmtTaXplLCBmaWxlU2l6ZSAtIG9wLnBvcyksIHJlYWRFbnRyaWVzQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRFbnRyaWVzQ2FsbGJhY2soZXJyLCBieXRlc1JlYWQpIHtcbiAgICAgICAgaWYgKGVyciB8fCAhYnl0ZXNSZWFkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhhdC5lbWl0KCdlcnJvcicsIGVyciB8fCBuZXcgRXJyb3IoJ0VudHJpZXMgcmVhZCBlcnJvcicpKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYnVmZmVyUG9zID0gb3AucG9zIC0gb3Aud2luLnBvc2l0aW9uO1xuICAgICAgICBsZXQgZW50cnkgPSBvcC5lbnRyeTtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gb3Aud2luLmJ1ZmZlcjtcbiAgICAgICAgY29uc3QgYnVmZmVyTGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHdoaWxlIChvcC5lbnRyaWVzTGVmdCA+IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5ID0gbmV3IFppcEVudHJ5KCk7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5LnJlYWRIZWFkZXIoYnVmZmVyLCBidWZmZXJQb3MpO1xuICAgICAgICAgICAgICAgICAgICBlbnRyeS5oZWFkZXJPZmZzZXQgPSBvcC53aW4ucG9zaXRpb24gKyBidWZmZXJQb3M7XG4gICAgICAgICAgICAgICAgICAgIG9wLmVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgICAgICAgICAgIG9wLnBvcyArPSBjb25zdHMuQ0VOSERSO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXJQb3MgKz0gY29uc3RzLkNFTkhEUjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgZW50cnlIZWFkZXJTaXplID0gZW50cnkuZm5hbWVMZW4gKyBlbnRyeS5leHRyYUxlbiArIGVudHJ5LmNvbUxlbjtcbiAgICAgICAgICAgICAgICBjb25zdCBhZHZhbmNlQnl0ZXMgPSBlbnRyeUhlYWRlclNpemUgKyAob3AuZW50cmllc0xlZnQgPiAxID8gY29uc3RzLkNFTkhEUiA6IDApO1xuICAgICAgICAgICAgICAgIGlmIChidWZmZXJMZW5ndGggLSBidWZmZXJQb3MgPCBhZHZhbmNlQnl0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgb3Aud2luLm1vdmVSaWdodChjaHVua1NpemUsIHJlYWRFbnRyaWVzQ2FsbGJhY2ssIGJ1ZmZlclBvcyk7XG4gICAgICAgICAgICAgICAgICAgIG9wLm1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVudHJ5LnJlYWQoYnVmZmVyLCBidWZmZXJQb3MsIHRleHREZWNvZGVyKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbmZpZy5za2lwRW50cnlOYW1lVmFsaWRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeS52YWxpZGF0ZU5hbWUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVudHJpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cmllc1tlbnRyeS5uYW1lXSA9IGVudHJ5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGF0LmVtaXQoJ2VudHJ5JywgZW50cnkpO1xuICAgICAgICAgICAgICAgIG9wLmVudHJ5ID0gZW50cnkgPSBudWxsO1xuICAgICAgICAgICAgICAgIG9wLmVudHJpZXNMZWZ0LS07XG4gICAgICAgICAgICAgICAgb3AucG9zICs9IGVudHJ5SGVhZGVyU2l6ZTtcbiAgICAgICAgICAgICAgICBidWZmZXJQb3MgKz0gZW50cnlIZWFkZXJTaXplO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5lbWl0KCdyZWFkeScpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoYXQuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hlY2tFbnRyaWVzRXhpc3QoKSB7XG4gICAgICAgIGlmICghZW50cmllcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzdG9yZUVudHJpZXMgZGlzYWJsZWQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncmVhZHknLCB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiByZWFkeTtcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRoaXMuZW50cnkgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICBjaGVja0VudHJpZXNFeGlzdCgpO1xuICAgICAgICByZXR1cm4gZW50cmllc1tuYW1lXTtcbiAgICB9O1xuXG4gICAgdGhpcy5lbnRyaWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGVja0VudHJpZXNFeGlzdCgpO1xuICAgICAgICByZXR1cm4gZW50cmllcztcbiAgICB9O1xuXG4gICAgdGhpcy5zdHJlYW0gPSBmdW5jdGlvbiAoZW50cnksIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wZW5FbnRyeShcbiAgICAgICAgICAgIGVudHJ5LFxuICAgICAgICAgICAgKGVyciwgZW50cnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBkYXRhT2Zmc2V0KGVudHJ5KTtcbiAgICAgICAgICAgICAgICBsZXQgZW50cnlTdHJlYW0gPSBuZXcgRW50cnlEYXRhUmVhZGVyU3RyZWFtKGZkLCBvZmZzZXQsIGVudHJ5LmNvbXByZXNzZWRTaXplKTtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkubWV0aG9kID09PSBjb25zdHMuU1RPUkVEKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmcgdG8gZG9cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5Lm1ldGhvZCA9PT0gY29uc3RzLkRFRkxBVEVEKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5U3RyZWFtID0gZW50cnlTdHJlYW0ucGlwZSh6bGliLmNyZWF0ZUluZmxhdGVSYXcoKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcignVW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Q6ICcgKyBlbnRyeS5tZXRob2QpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNhblZlcmlmeUNyYyhlbnRyeSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cnlTdHJlYW0gPSBlbnRyeVN0cmVhbS5waXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEVudHJ5VmVyaWZ5U3RyZWFtKGVudHJ5U3RyZWFtLCBlbnRyeS5jcmMsIGVudHJ5LnNpemUpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGVudHJ5U3RyZWFtKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuICAgIH07XG5cbiAgICB0aGlzLmVudHJ5RGF0YVN5bmMgPSBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgbGV0IGVyciA9IG51bGw7XG4gICAgICAgIHRoaXMub3BlbkVudHJ5KFxuICAgICAgICAgICAgZW50cnksXG4gICAgICAgICAgICAoZSwgZW4pID0+IHtcbiAgICAgICAgICAgICAgICBlcnIgPSBlO1xuICAgICAgICAgICAgICAgIGVudHJ5ID0gZW47XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRhdGEgPSBCdWZmZXIuYWxsb2MoZW50cnkuY29tcHJlc3NlZFNpemUpO1xuICAgICAgICBuZXcgRnNSZWFkKGZkLCBkYXRhLCAwLCBlbnRyeS5jb21wcmVzc2VkU2l6ZSwgZGF0YU9mZnNldChlbnRyeSksIChlKSA9PiB7XG4gICAgICAgICAgICBlcnIgPSBlO1xuICAgICAgICB9KS5yZWFkKHRydWUpO1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVudHJ5Lm1ldGhvZCA9PT0gY29uc3RzLlNUT1JFRCkge1xuICAgICAgICAgICAgLy8gbm90aGluZyB0byBkb1xuICAgICAgICB9IGVsc2UgaWYgKGVudHJ5Lm1ldGhvZCA9PT0gY29uc3RzLkRFRkxBVEVEIHx8IGVudHJ5Lm1ldGhvZCA9PT0gY29uc3RzLkVOSEFOQ0VEX0RFRkxBVEVEKSB7XG4gICAgICAgICAgICBkYXRhID0gemxpYi5pbmZsYXRlUmF3U3luYyhkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Q6ICcgKyBlbnRyeS5tZXRob2QpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCAhPT0gZW50cnkuc2l6ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHNpemUnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FuVmVyaWZ5Q3JjKGVudHJ5KSkge1xuICAgICAgICAgICAgY29uc3QgdmVyaWZ5ID0gbmV3IENyY1ZlcmlmeShlbnRyeS5jcmMsIGVudHJ5LnNpemUpO1xuICAgICAgICAgICAgdmVyaWZ5LmRhdGEoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfTtcblxuICAgIHRoaXMub3BlbkVudHJ5ID0gZnVuY3Rpb24gKGVudHJ5LCBjYWxsYmFjaywgc3luYykge1xuICAgICAgICBpZiAodHlwZW9mIGVudHJ5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY2hlY2tFbnRyaWVzRXhpc3QoKTtcbiAgICAgICAgICAgIGVudHJ5ID0gZW50cmllc1tlbnRyeV07XG4gICAgICAgICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcignRW50cnkgbm90IGZvdW5kJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghZW50cnkuaXNGaWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdFbnRyeSBpcyBub3QgZmlsZScpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZkKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdBcmNoaXZlIGNsb3NlZCcpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBidWZmZXIgPSBCdWZmZXIuYWxsb2MoY29uc3RzLkxPQ0hEUik7XG4gICAgICAgIG5ldyBGc1JlYWQoZmQsIGJ1ZmZlciwgMCwgYnVmZmVyLmxlbmd0aCwgZW50cnkub2Zmc2V0LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcmVhZEV4O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBlbnRyeS5yZWFkRGF0YUhlYWRlcihidWZmZXIpO1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5lbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVhZEV4ID0gbmV3IEVycm9yKCdFbnRyeSBlbmNyeXB0ZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIHJlYWRFeCA9IGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbGJhY2socmVhZEV4LCBlbnRyeSk7XG4gICAgICAgIH0pLnJlYWQoc3luYyk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGRhdGFPZmZzZXQoZW50cnkpIHtcbiAgICAgICAgcmV0dXJuIGVudHJ5Lm9mZnNldCArIGNvbnN0cy5MT0NIRFIgKyBlbnRyeS5mbmFtZUxlbiArIGVudHJ5LmV4dHJhTGVuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhblZlcmlmeUNyYyhlbnRyeSkge1xuICAgICAgICAvLyBpZiBiaXQgMyAoMHgwOCkgb2YgdGhlIGdlbmVyYWwtcHVycG9zZSBmbGFncyBmaWVsZCBpcyBzZXQsIHRoZW4gdGhlIENSQy0zMiBhbmQgZmlsZSBzaXplcyBhcmUgbm90IGtub3duIHdoZW4gdGhlIGhlYWRlciBpcyB3cml0dGVuXG4gICAgICAgIHJldHVybiAoZW50cnkuZmxhZ3MgJiAweDgpICE9PSAweDg7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0cmFjdChlbnRyeSwgb3V0UGF0aCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhhdC5zdHJlYW0oZW50cnksIChlcnIsIHN0bSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBmc1N0bSwgZXJyVGhyb3duO1xuICAgICAgICAgICAgICAgIHN0bS5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVyclRocm93biA9IGVycjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZzU3RtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG0udW5waXBlKGZzU3RtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzU3RtLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBmcy5vcGVuKG91dFBhdGgsICd3JywgKGVyciwgZmRGaWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJUaHJvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLmNsb3NlKGZkLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyVGhyb3duKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZzU3RtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0ob3V0UGF0aCwgeyBmZDogZmRGaWxlIH0pO1xuICAgICAgICAgICAgICAgICAgICBmc1N0bS5vbignZmluaXNoJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5lbWl0KCdleHRyYWN0JywgZW50cnksIG91dFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcnJUaHJvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RtLnBpcGUoZnNTdG0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVEaXJlY3RvcmllcyhiYXNlRGlyLCBkaXJzLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoIWRpcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGlyID0gZGlycy5zaGlmdCgpO1xuICAgICAgICBkaXIgPSBwYXRoLmpvaW4oYmFzZURpciwgcGF0aC5qb2luKC4uLmRpcikpO1xuICAgICAgICBmcy5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgIT09ICdFRVhJU1QnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjcmVhdGVEaXJlY3RvcmllcyhiYXNlRGlyLCBkaXJzLCBjYWxsYmFjayk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4dHJhY3RGaWxlcyhiYXNlRGlyLCBiYXNlUmVsUGF0aCwgZmlsZXMsIGNhbGxiYWNrLCBleHRyYWN0ZWRDb3VudCkge1xuICAgICAgICBpZiAoIWZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIGV4dHJhY3RlZENvdW50KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaWxlID0gZmlsZXMuc2hpZnQoKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IHBhdGguam9pbihiYXNlRGlyLCBmaWxlLm5hbWUucmVwbGFjZShiYXNlUmVsUGF0aCwgJycpKTtcbiAgICAgICAgZXh0cmFjdChmaWxlLCB0YXJnZXRQYXRoLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgZXh0cmFjdGVkQ291bnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXh0cmFjdEZpbGVzKGJhc2VEaXIsIGJhc2VSZWxQYXRoLCBmaWxlcywgY2FsbGJhY2ssIGV4dHJhY3RlZENvdW50ICsgMSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuZXh0cmFjdCA9IGZ1bmN0aW9uIChlbnRyeSwgb3V0UGF0aCwgY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGVudHJ5TmFtZSA9IGVudHJ5IHx8ICcnO1xuICAgICAgICBpZiAodHlwZW9mIGVudHJ5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZW50cnkgPSB0aGlzLmVudHJ5KGVudHJ5KTtcbiAgICAgICAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICAgICAgICAgIGVudHJ5TmFtZSA9IGVudHJ5Lm5hbWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeU5hbWUubGVuZ3RoICYmIGVudHJ5TmFtZVtlbnRyeU5hbWUubGVuZ3RoIC0gMV0gIT09ICcvJykge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeU5hbWUgKz0gJy8nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVudHJ5IHx8IGVudHJ5LmlzRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlcyA9IFtdLFxuICAgICAgICAgICAgICAgIGRpcnMgPSBbXSxcbiAgICAgICAgICAgICAgICBhbGxEaXJzID0ge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGUgaW4gZW50cmllcykge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGVudHJpZXMsIGUpICYmXG4gICAgICAgICAgICAgICAgICAgIGUubGFzdEluZGV4T2YoZW50cnlOYW1lLCAwKSA9PT0gMFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVsUGF0aCA9IGUucmVwbGFjZShlbnRyeU5hbWUsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRFbnRyeSA9IGVudHJpZXNbZV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZEVudHJ5LmlzRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMucHVzaChjaGlsZEVudHJ5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbFBhdGggPSBwYXRoLmRpcm5hbWUocmVsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbFBhdGggJiYgIWFsbERpcnNbcmVsUGF0aF0gJiYgcmVsUGF0aCAhPT0gJy4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxEaXJzW3JlbFBhdGhdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0cyA9IHJlbFBhdGguc3BsaXQoJy8nKS5maWx0ZXIoKGYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcnMucHVzaChwYXJ0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMCwgcGFydHMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydHNQYXRoID0gcGFydHMuam9pbignLycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbGxEaXJzW3BhcnRzUGF0aF0gfHwgcGFydHNQYXRoID09PSAnLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbERpcnNbcGFydHNQYXRoXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlycy5wdXNoKHBhcnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpcnMuc29ydCgoeCwgeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB4Lmxlbmd0aCAtIHkubGVuZ3RoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZGlycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVEaXJlY3RvcmllcyhvdXRQYXRoLCBkaXJzLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHRyYWN0RmlsZXMob3V0UGF0aCwgZW50cnlOYW1lLCBmaWxlcywgY2FsbGJhY2ssIDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGV4dHJhY3RGaWxlcyhvdXRQYXRoLCBlbnRyeU5hbWUsIGZpbGVzLCBjYWxsYmFjaywgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcy5zdGF0KG91dFBhdGgsIChlcnIsIHN0YXQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdCAmJiBzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdChlbnRyeSwgcGF0aC5qb2luKG91dFBhdGgsIHBhdGguYmFzZW5hbWUoZW50cnkubmFtZSkpLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdChlbnRyeSwgb3V0UGF0aCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuY2xvc2UgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGNsb3NlZCB8fCAhZmQpIHtcbiAgICAgICAgICAgIGNsb3NlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGZzLmNsb3NlKGZkLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgZmQgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9yaWdpbmFsRW1pdCA9IGV2ZW50cy5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQ7XG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFjbG9zZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbEVtaXQuY2FsbCh0aGlzLCAuLi5hcmdzKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5TdHJlYW1aaXAuc2V0RnMgPSBmdW5jdGlvbiAoY3VzdG9tRnMpIHtcbiAgICBmcyA9IGN1c3RvbUZzO1xufTtcblxuU3RyZWFtWmlwLmRlYnVnTG9nID0gKC4uLmFyZ3MpID0+IHtcbiAgICBpZiAoU3RyZWFtWmlwLmRlYnVnKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xuICAgIH1cbn07XG5cbnV0aWwuaW5oZXJpdHMoU3RyZWFtWmlwLCBldmVudHMuRXZlbnRFbWl0dGVyKTtcblxuY29uc3QgcHJvcFppcCA9IFN5bWJvbCgnemlwJyk7XG5cblN0cmVhbVppcC5hc3luYyA9IGNsYXNzIFN0cmVhbVppcEFzeW5jIGV4dGVuZHMgZXZlbnRzLkV2ZW50RW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgY29uc3QgemlwID0gbmV3IFN0cmVhbVppcChjb25maWcpO1xuXG4gICAgICAgIHppcC5vbignZW50cnknLCAoZW50cnkpID0+IHRoaXMuZW1pdCgnZW50cnknLCBlbnRyeSkpO1xuICAgICAgICB6aXAub24oJ2V4dHJhY3QnLCAoZW50cnksIG91dFBhdGgpID0+IHRoaXMuZW1pdCgnZXh0cmFjdCcsIGVudHJ5LCBvdXRQYXRoKSk7XG5cbiAgICAgICAgdGhpc1twcm9wWmlwXSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHppcC5vbigncmVhZHknLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgemlwLnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh6aXApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB6aXAub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IGVudHJpZXNDb3VudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbcHJvcFppcF0udGhlbigoemlwKSA9PiB6aXAuZW50cmllc0NvdW50KTtcbiAgICB9XG5cbiAgICBnZXQgY29tbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbcHJvcFppcF0udGhlbigoemlwKSA9PiB6aXAuY29tbWVudCk7XG4gICAgfVxuXG4gICAgYXN5bmMgZW50cnkobmFtZSkge1xuICAgICAgICBjb25zdCB6aXAgPSBhd2FpdCB0aGlzW3Byb3BaaXBdO1xuICAgICAgICByZXR1cm4gemlwLmVudHJ5KG5hbWUpO1xuICAgIH1cblxuICAgIGFzeW5jIGVudHJpZXMoKSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiB6aXAuZW50cmllcygpO1xuICAgIH1cblxuICAgIGFzeW5jIHN0cmVhbShlbnRyeSkge1xuICAgICAgICBjb25zdCB6aXAgPSBhd2FpdCB0aGlzW3Byb3BaaXBdO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemlwLnN0cmVhbShlbnRyeSwgKGVyciwgc3RtKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHN0bSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGVudHJ5RGF0YShlbnRyeSkge1xuICAgICAgICBjb25zdCBzdG0gPSBhd2FpdCB0aGlzLnN0cmVhbShlbnRyeSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gW107XG4gICAgICAgICAgICBzdG0ub24oJ2RhdGEnLCAoY2h1bmspID0+IGRhdGEucHVzaChjaHVuaykpO1xuICAgICAgICAgICAgc3RtLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShCdWZmZXIuY29uY2F0KGRhdGEpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RtLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBzdG0ucmVtb3ZlQWxsTGlzdGVuZXJzKCdlbmQnKTtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBleHRyYWN0KGVudHJ5LCBvdXRQYXRoKSB7XG4gICAgICAgIGNvbnN0IHppcCA9IGF3YWl0IHRoaXNbcHJvcFppcF07XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6aXAuZXh0cmFjdChlbnRyeSwgb3V0UGF0aCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGNsb3NlKCkge1xuICAgICAgICBjb25zdCB6aXAgPSBhd2FpdCB0aGlzW3Byb3BaaXBdO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemlwLmNsb3NlKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuY2xhc3MgQ2VudHJhbERpcmVjdG9yeUhlYWRlciB7XG4gICAgcmVhZChkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCAhPT0gY29uc3RzLkVOREhEUiB8fCBkYXRhLnJlYWRVSW50MzJMRSgwKSAhPT0gY29uc3RzLkVORFNJRykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNlbnRyYWwgZGlyZWN0b3J5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbnVtYmVyIG9mIGVudHJpZXMgb24gdGhpcyB2b2x1bWVcbiAgICAgICAgdGhpcy52b2x1bWVFbnRyaWVzID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkVORFNVQik7XG4gICAgICAgIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzXG4gICAgICAgIHRoaXMudG90YWxFbnRyaWVzID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkVORFRPVCk7XG4gICAgICAgIC8vIGNlbnRyYWwgZGlyZWN0b3J5IHNpemUgaW4gYnl0ZXNcbiAgICAgICAgdGhpcy5zaXplID0gZGF0YS5yZWFkVUludDMyTEUoY29uc3RzLkVORFNJWik7XG4gICAgICAgIC8vIG9mZnNldCBvZiBmaXJzdCBDRU4gaGVhZGVyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gZGF0YS5yZWFkVUludDMyTEUoY29uc3RzLkVORE9GRik7XG4gICAgICAgIC8vIHppcCBmaWxlIGNvbW1lbnQgbGVuZ3RoXG4gICAgICAgIHRoaXMuY29tbWVudExlbmd0aCA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5FTkRDT00pO1xuICAgIH1cbn1cblxuY2xhc3MgQ2VudHJhbERpcmVjdG9yeUxvYzY0SGVhZGVyIHtcbiAgICByZWFkKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoICE9PSBjb25zdHMuRU5ETDY0SERSIHx8IGRhdGEucmVhZFVJbnQzMkxFKDApICE9PSBjb25zdHMuRU5ETDY0U0lHKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgemlwNjQgY2VudHJhbCBkaXJlY3RvcnkgbG9jYXRvcicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFpJUDY0IEVPQ0QgaGVhZGVyIG9mZnNldFxuICAgICAgICB0aGlzLmhlYWRlck9mZnNldCA9IHJlYWRVSW50NjRMRShkYXRhLCBjb25zdHMuRU5EU1VCKTtcbiAgICB9XG59XG5cbmNsYXNzIENlbnRyYWxEaXJlY3RvcnlaaXA2NEhlYWRlciB7XG4gICAgcmVhZChkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCAhPT0gY29uc3RzLkVORDY0SERSIHx8IGRhdGEucmVhZFVJbnQzMkxFKDApICE9PSBjb25zdHMuRU5ENjRTSUcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjZW50cmFsIGRpcmVjdG9yeScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG51bWJlciBvZiBlbnRyaWVzIG9uIHRoaXMgdm9sdW1lXG4gICAgICAgIHRoaXMudm9sdW1lRW50cmllcyA9IHJlYWRVSW50NjRMRShkYXRhLCBjb25zdHMuRU5ENjRTVUIpO1xuICAgICAgICAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllc1xuICAgICAgICB0aGlzLnRvdGFsRW50cmllcyA9IHJlYWRVSW50NjRMRShkYXRhLCBjb25zdHMuRU5ENjRUT1QpO1xuICAgICAgICAvLyBjZW50cmFsIGRpcmVjdG9yeSBzaXplIGluIGJ5dGVzXG4gICAgICAgIHRoaXMuc2l6ZSA9IHJlYWRVSW50NjRMRShkYXRhLCBjb25zdHMuRU5ENjRTSVopO1xuICAgICAgICAvLyBvZmZzZXQgb2YgZmlyc3QgQ0VOIGhlYWRlclxuICAgICAgICB0aGlzLm9mZnNldCA9IHJlYWRVSW50NjRMRShkYXRhLCBjb25zdHMuRU5ENjRPRkYpO1xuICAgIH1cbn1cblxuY2xhc3MgWmlwRW50cnkge1xuICAgIHJlYWRIZWFkZXIoZGF0YSwgb2Zmc2V0KSB7XG4gICAgICAgIC8vIGRhdGEgc2hvdWxkIGJlIDQ2IGJ5dGVzIGFuZCBzdGFydCB3aXRoIFwiUEsgMDEgMDJcIlxuICAgICAgICBpZiAoZGF0YS5sZW5ndGggPCBvZmZzZXQgKyBjb25zdHMuQ0VOSERSIHx8IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCkgIT09IGNvbnN0cy5DRU5TSUcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBlbnRyeSBoZWFkZXInKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB2ZXJzaW9uIG1hZGUgYnlcbiAgICAgICAgdGhpcy52ZXJNYWRlID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTlZFTSk7XG4gICAgICAgIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTlZFUik7XG4gICAgICAgIC8vIGVuY3J5cHQsIGRlY3J5cHQgZmxhZ3NcbiAgICAgICAgdGhpcy5mbGFncyA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5GTEcpO1xuICAgICAgICAvLyBjb21wcmVzc2lvbiBtZXRob2RcbiAgICAgICAgdGhpcy5tZXRob2QgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOSE9XKTtcbiAgICAgICAgLy8gbW9kaWZpY2F0aW9uIHRpbWUgKDIgYnl0ZXMgdGltZSwgMiBieXRlcyBkYXRlKVxuICAgICAgICBjb25zdCB0aW1lYnl0ZXMgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOVElNKTtcbiAgICAgICAgY29uc3QgZGF0ZWJ5dGVzID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTlRJTSArIDIpO1xuICAgICAgICB0aGlzLnRpbWUgPSBwYXJzZVppcFRpbWUodGltZWJ5dGVzLCBkYXRlYnl0ZXMpO1xuXG4gICAgICAgIC8vIHVuY29tcHJlc3NlZCBmaWxlIGNyYy0zMiB2YWx1ZVxuICAgICAgICB0aGlzLmNyYyA9IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCArIGNvbnN0cy5DRU5DUkMpO1xuICAgICAgICAvLyBjb21wcmVzc2VkIHNpemVcbiAgICAgICAgdGhpcy5jb21wcmVzc2VkU2l6ZSA9IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCArIGNvbnN0cy5DRU5TSVopO1xuICAgICAgICAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuICAgICAgICB0aGlzLnNpemUgPSBkYXRhLnJlYWRVSW50MzJMRShvZmZzZXQgKyBjb25zdHMuQ0VOTEVOKTtcbiAgICAgICAgLy8gZmlsZW5hbWUgbGVuZ3RoXG4gICAgICAgIHRoaXMuZm5hbWVMZW4gPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOTkFNKTtcbiAgICAgICAgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG4gICAgICAgIHRoaXMuZXh0cmFMZW4gPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VORVhUKTtcbiAgICAgICAgLy8gZmlsZSBjb21tZW50IGxlbmd0aFxuICAgICAgICB0aGlzLmNvbUxlbiA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5DT00pO1xuICAgICAgICAvLyB2b2x1bWUgbnVtYmVyIHN0YXJ0XG4gICAgICAgIHRoaXMuZGlza1N0YXJ0ID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkRTSyk7XG4gICAgICAgIC8vIGludGVybmFsIGZpbGUgYXR0cmlidXRlc1xuICAgICAgICB0aGlzLmluYXR0ciA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5BVFQpO1xuICAgICAgICAvLyBleHRlcm5hbCBmaWxlIGF0dHJpYnV0ZXNcbiAgICAgICAgdGhpcy5hdHRyID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0ICsgY29uc3RzLkNFTkFUWCk7XG4gICAgICAgIC8vIExPQyBoZWFkZXIgb2Zmc2V0XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0ICsgY29uc3RzLkNFTk9GRik7XG4gICAgfVxuXG4gICAgcmVhZERhdGFIZWFkZXIoZGF0YSkge1xuICAgICAgICAvLyAzMCBieXRlcyBhbmQgc2hvdWxkIHN0YXJ0IHdpdGggXCJQS1xcMDAzXFwwMDRcIlxuICAgICAgICBpZiAoZGF0YS5yZWFkVUludDMyTEUoMCkgIT09IGNvbnN0cy5MT0NTSUcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBsb2NhbCBoZWFkZXInKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB2ZXJzaW9uIG5lZWRlZCB0byBleHRyYWN0XG4gICAgICAgIHRoaXMudmVyc2lvbiA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NWRVIpO1xuICAgICAgICAvLyBnZW5lcmFsIHB1cnBvc2UgYml0IGZsYWdcbiAgICAgICAgdGhpcy5mbGFncyA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NGTEcpO1xuICAgICAgICAvLyBjb21wcmVzc2lvbiBtZXRob2RcbiAgICAgICAgdGhpcy5tZXRob2QgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuTE9DSE9XKTtcbiAgICAgICAgLy8gbW9kaWZpY2F0aW9uIHRpbWUgKDIgYnl0ZXMgdGltZSA7IDIgYnl0ZXMgZGF0ZSlcbiAgICAgICAgY29uc3QgdGltZWJ5dGVzID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ1RJTSk7XG4gICAgICAgIGNvbnN0IGRhdGVieXRlcyA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NUSU0gKyAyKTtcbiAgICAgICAgdGhpcy50aW1lID0gcGFyc2VaaXBUaW1lKHRpbWVieXRlcywgZGF0ZWJ5dGVzKTtcblxuICAgICAgICAvLyB1bmNvbXByZXNzZWQgZmlsZSBjcmMtMzIgdmFsdWVcbiAgICAgICAgdGhpcy5jcmMgPSBkYXRhLnJlYWRVSW50MzJMRShjb25zdHMuTE9DQ1JDKSB8fCB0aGlzLmNyYztcbiAgICAgICAgLy8gY29tcHJlc3NlZCBzaXplXG4gICAgICAgIGNvbnN0IGNvbXByZXNzZWRTaXplID0gZGF0YS5yZWFkVUludDMyTEUoY29uc3RzLkxPQ1NJWik7XG4gICAgICAgIGlmIChjb21wcmVzc2VkU2l6ZSAmJiBjb21wcmVzc2VkU2l6ZSAhPT0gY29uc3RzLkVGX1pJUDY0X09SXzMyKSB7XG4gICAgICAgICAgICB0aGlzLmNvbXByZXNzZWRTaXplID0gY29tcHJlc3NlZFNpemU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdW5jb21wcmVzc2VkIHNpemVcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGRhdGEucmVhZFVJbnQzMkxFKGNvbnN0cy5MT0NMRU4pO1xuICAgICAgICBpZiAoc2l6ZSAmJiBzaXplICE9PSBjb25zdHMuRUZfWklQNjRfT1JfMzIpIHtcbiAgICAgICAgICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZmlsZW5hbWUgbGVuZ3RoXG4gICAgICAgIHRoaXMuZm5hbWVMZW4gPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuTE9DTkFNKTtcbiAgICAgICAgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG4gICAgICAgIHRoaXMuZXh0cmFMZW4gPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuTE9DRVhUKTtcbiAgICB9XG5cbiAgICByZWFkKGRhdGEsIG9mZnNldCwgdGV4dERlY29kZXIpIHtcbiAgICAgICAgY29uc3QgbmFtZURhdGEgPSBkYXRhLnNsaWNlKG9mZnNldCwgKG9mZnNldCArPSB0aGlzLmZuYW1lTGVuKSk7XG4gICAgICAgIHRoaXMubmFtZSA9IHRleHREZWNvZGVyXG4gICAgICAgICAgICA/IHRleHREZWNvZGVyLmRlY29kZShuZXcgVWludDhBcnJheShuYW1lRGF0YSkpXG4gICAgICAgICAgICA6IG5hbWVEYXRhLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgIGNvbnN0IGxhc3RDaGFyID0gZGF0YVtvZmZzZXQgLSAxXTtcbiAgICAgICAgdGhpcy5pc0RpcmVjdG9yeSA9IGxhc3RDaGFyID09PSA0NyB8fCBsYXN0Q2hhciA9PT0gOTI7XG5cbiAgICAgICAgaWYgKHRoaXMuZXh0cmFMZW4pIHtcbiAgICAgICAgICAgIHRoaXMucmVhZEV4dHJhKGRhdGEsIG9mZnNldCk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gdGhpcy5leHRyYUxlbjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbW1lbnQgPSB0aGlzLmNvbUxlbiA/IGRhdGEuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyB0aGlzLmNvbUxlbikudG9TdHJpbmcoKSA6IG51bGw7XG4gICAgfVxuXG4gICAgdmFsaWRhdGVOYW1lKCkge1xuICAgICAgICBpZiAoL1xcXFx8Xlxcdys6fF5cXC98KF58XFwvKVxcLlxcLihcXC98JCkvLnRlc3QodGhpcy5uYW1lKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNYWxpY2lvdXMgZW50cnk6ICcgKyB0aGlzLm5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVhZEV4dHJhKGRhdGEsIG9mZnNldCkge1xuICAgICAgICBsZXQgc2lnbmF0dXJlLCBzaXplO1xuICAgICAgICBjb25zdCBtYXhQb3MgPSBvZmZzZXQgKyB0aGlzLmV4dHJhTGVuO1xuICAgICAgICB3aGlsZSAob2Zmc2V0IDwgbWF4UG9zKSB7XG4gICAgICAgICAgICBzaWduYXR1cmUgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICAgICAgICBzaXplID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSAyO1xuICAgICAgICAgICAgaWYgKGNvbnN0cy5JRF9aSVA2NCA9PT0gc2lnbmF0dXJlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZVppcDY0RXh0cmEoZGF0YSwgb2Zmc2V0LCBzaXplKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCArPSBzaXplO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGFyc2VaaXA2NEV4dHJhKGRhdGEsIG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgICAgIGlmIChsZW5ndGggPj0gOCAmJiB0aGlzLnNpemUgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMikge1xuICAgICAgICAgICAgdGhpcy5zaXplID0gcmVhZFVJbnQ2NExFKGRhdGEsIG9mZnNldCk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gODtcbiAgICAgICAgICAgIGxlbmd0aCAtPSA4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPj0gOCAmJiB0aGlzLmNvbXByZXNzZWRTaXplID09PSBjb25zdHMuRUZfWklQNjRfT1JfMzIpIHtcbiAgICAgICAgICAgIHRoaXMuY29tcHJlc3NlZFNpemUgPSByZWFkVUludDY0TEUoZGF0YSwgb2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSA4O1xuICAgICAgICAgICAgbGVuZ3RoIC09IDg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA+PSA4ICYmIHRoaXMub2Zmc2V0ID09PSBjb25zdHMuRUZfWklQNjRfT1JfMzIpIHtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ID0gcmVhZFVJbnQ2NExFKGRhdGEsIG9mZnNldCk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gODtcbiAgICAgICAgICAgIGxlbmd0aCAtPSA4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPj0gNCAmJiB0aGlzLmRpc2tTdGFydCA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzE2KSB7XG4gICAgICAgICAgICB0aGlzLmRpc2tTdGFydCA9IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCk7XG4gICAgICAgICAgICAvLyBvZmZzZXQgKz0gNDsgbGVuZ3RoIC09IDQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgZW5jcnlwdGVkKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuZmxhZ3MgJiBjb25zdHMuRkxHX0VOVFJZX0VOQykgPT09IGNvbnN0cy5GTEdfRU5UUllfRU5DO1xuICAgIH1cblxuICAgIGdldCBpc0ZpbGUoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5pc0RpcmVjdG9yeTtcbiAgICB9XG59XG5cbmNsYXNzIEZzUmVhZCB7XG4gICAgY29uc3RydWN0b3IoZmQsIGJ1ZmZlciwgb2Zmc2V0LCBsZW5ndGgsIHBvc2l0aW9uLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmZkID0gZmQ7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLmJ5dGVzUmVhZCA9IDA7XG4gICAgICAgIHRoaXMud2FpdGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJlYWQoc3luYykge1xuICAgICAgICBTdHJlYW1aaXAuZGVidWdMb2coJ3JlYWQnLCB0aGlzLnBvc2l0aW9uLCB0aGlzLmJ5dGVzUmVhZCwgdGhpcy5sZW5ndGgsIHRoaXMub2Zmc2V0KTtcbiAgICAgICAgdGhpcy53YWl0aW5nID0gdHJ1ZTtcbiAgICAgICAgbGV0IGVycjtcbiAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgIGxldCBieXRlc1JlYWQgPSAwO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBieXRlc1JlYWQgPSBmcy5yZWFkU3luYyhcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mZCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWZmZXIsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2Zmc2V0ICsgdGhpcy5ieXRlc1JlYWQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGVuZ3RoIC0gdGhpcy5ieXRlc1JlYWQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKyB0aGlzLmJ5dGVzUmVhZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgZXJyID0gZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucmVhZENhbGxiYWNrKHN5bmMsIGVyciwgZXJyID8gYnl0ZXNSZWFkIDogbnVsbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcy5yZWFkKFxuICAgICAgICAgICAgICAgIHRoaXMuZmQsXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXIsXG4gICAgICAgICAgICAgICAgdGhpcy5vZmZzZXQgKyB0aGlzLmJ5dGVzUmVhZCxcbiAgICAgICAgICAgICAgICB0aGlzLmxlbmd0aCAtIHRoaXMuYnl0ZXNSZWFkLFxuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKyB0aGlzLmJ5dGVzUmVhZCxcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWRDYWxsYmFjay5iaW5kKHRoaXMsIHN5bmMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVhZENhbGxiYWNrKHN5bmMsIGVyciwgYnl0ZXNSZWFkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYnl0ZXNSZWFkID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhpcy5ieXRlc1JlYWQgKz0gYnl0ZXNSZWFkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlcnIgfHwgIWJ5dGVzUmVhZCB8fCB0aGlzLmJ5dGVzUmVhZCA9PT0gdGhpcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMud2FpdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soZXJyLCB0aGlzLmJ5dGVzUmVhZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlYWQoc3luYyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIEZpbGVXaW5kb3dCdWZmZXIge1xuICAgIGNvbnN0cnVjdG9yKGZkKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygwKTtcbiAgICAgICAgdGhpcy5mZCA9IGZkO1xuICAgICAgICB0aGlzLmZzT3AgPSBudWxsO1xuICAgIH1cblxuICAgIGNoZWNrT3AoKSB7XG4gICAgICAgIGlmICh0aGlzLmZzT3AgJiYgdGhpcy5mc09wLndhaXRpbmcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT3BlcmF0aW9uIGluIHByb2dyZXNzJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkKHBvcywgbGVuZ3RoLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNoZWNrT3AoKTtcbiAgICAgICAgaWYgKHRoaXMuYnVmZmVyLmxlbmd0aCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5idWZmZXIgPSBCdWZmZXIuYWxsb2MobGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zO1xuICAgICAgICB0aGlzLmZzT3AgPSBuZXcgRnNSZWFkKHRoaXMuZmQsIHRoaXMuYnVmZmVyLCAwLCBsZW5ndGgsIHRoaXMucG9zaXRpb24sIGNhbGxiYWNrKS5yZWFkKCk7XG4gICAgfVxuXG4gICAgZXhwYW5kTGVmdChsZW5ndGgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY2hlY2tPcCgpO1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW0J1ZmZlci5hbGxvYyhsZW5ndGgpLCB0aGlzLmJ1ZmZlcl0pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uIC09IGxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb24gPCAwKSB7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZzT3AgPSBuZXcgRnNSZWFkKHRoaXMuZmQsIHRoaXMuYnVmZmVyLCAwLCBsZW5ndGgsIHRoaXMucG9zaXRpb24sIGNhbGxiYWNrKS5yZWFkKCk7XG4gICAgfVxuXG4gICAgZXhwYW5kUmlnaHQobGVuZ3RoLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNoZWNrT3AoKTtcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW3RoaXMuYnVmZmVyLCBCdWZmZXIuYWxsb2MobGVuZ3RoKV0pO1xuICAgICAgICB0aGlzLmZzT3AgPSBuZXcgRnNSZWFkKFxuICAgICAgICAgICAgdGhpcy5mZCxcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgbGVuZ3RoLFxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArIG9mZnNldCxcbiAgICAgICAgICAgIGNhbGxiYWNrXG4gICAgICAgICkucmVhZCgpO1xuICAgIH1cblxuICAgIG1vdmVSaWdodChsZW5ndGgsIGNhbGxiYWNrLCBzaGlmdCkge1xuICAgICAgICB0aGlzLmNoZWNrT3AoKTtcbiAgICAgICAgaWYgKHNoaWZ0KSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlci5jb3B5KHRoaXMuYnVmZmVyLCAwLCBzaGlmdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaGlmdCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3NpdGlvbiArPSBzaGlmdDtcbiAgICAgICAgdGhpcy5mc09wID0gbmV3IEZzUmVhZChcbiAgICAgICAgICAgIHRoaXMuZmQsXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlcixcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyLmxlbmd0aCAtIHNoaWZ0LFxuICAgICAgICAgICAgc2hpZnQsXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uICsgdGhpcy5idWZmZXIubGVuZ3RoIC0gc2hpZnQsXG4gICAgICAgICAgICBjYWxsYmFja1xuICAgICAgICApLnJlYWQoKTtcbiAgICB9XG59XG5cbmNsYXNzIEVudHJ5RGF0YVJlYWRlclN0cmVhbSBleHRlbmRzIHN0cmVhbS5SZWFkYWJsZSB7XG4gICAgY29uc3RydWN0b3IoZmQsIG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZmQgPSBmZDtcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgICB0aGlzLnBvcyA9IDA7XG4gICAgICAgIHRoaXMucmVhZENhbGxiYWNrID0gdGhpcy5yZWFkQ2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBfcmVhZChuKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhNYXRoLm1pbihuLCB0aGlzLmxlbmd0aCAtIHRoaXMucG9zKSk7XG4gICAgICAgIGlmIChidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICBmcy5yZWFkKHRoaXMuZmQsIGJ1ZmZlciwgMCwgYnVmZmVyLmxlbmd0aCwgdGhpcy5vZmZzZXQgKyB0aGlzLnBvcywgdGhpcy5yZWFkQ2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wdXNoKG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVhZENhbGxiYWNrKGVyciwgYnl0ZXNSZWFkLCBidWZmZXIpIHtcbiAgICAgICAgdGhpcy5wb3MgKz0gYnl0ZXNSZWFkO1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgIHRoaXMucHVzaChudWxsKTtcbiAgICAgICAgfSBlbHNlIGlmICghYnl0ZXNSZWFkKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2gobnVsbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoYnl0ZXNSZWFkICE9PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyID0gYnVmZmVyLnNsaWNlKDAsIGJ5dGVzUmVhZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnB1c2goYnVmZmVyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgRW50cnlWZXJpZnlTdHJlYW0gZXh0ZW5kcyBzdHJlYW0uVHJhbnNmb3JtIHtcbiAgICBjb25zdHJ1Y3RvcihiYXNlU3RtLCBjcmMsIHNpemUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy52ZXJpZnkgPSBuZXcgQ3JjVmVyaWZ5KGNyYywgc2l6ZSk7XG4gICAgICAgIGJhc2VTdG0ub24oJ2Vycm9yJywgKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3RyYW5zZm9ybShkYXRhLCBlbmNvZGluZywgY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGVycjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMudmVyaWZ5LmRhdGEoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2soZXJyLCBkYXRhKTtcbiAgICB9XG59XG5cbmNsYXNzIENyY1ZlcmlmeSB7XG4gICAgY29uc3RydWN0b3IoY3JjLCBzaXplKSB7XG4gICAgICAgIHRoaXMuY3JjID0gY3JjO1xuICAgICAgICB0aGlzLnNpemUgPSBzaXplO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgY3JjOiB+MCxcbiAgICAgICAgICAgIHNpemU6IDAsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZGF0YShkYXRhKSB7XG4gICAgICAgIGNvbnN0IGNyY1RhYmxlID0gQ3JjVmVyaWZ5LmdldENyY1RhYmxlKCk7XG4gICAgICAgIGxldCBjcmMgPSB0aGlzLnN0YXRlLmNyYztcbiAgICAgICAgbGV0IG9mZiA9IDA7XG4gICAgICAgIGxldCBsZW4gPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKC0tbGVuID49IDApIHtcbiAgICAgICAgICAgIGNyYyA9IGNyY1RhYmxlWyhjcmMgXiBkYXRhW29mZisrXSkgJiAweGZmXSBeIChjcmMgPj4+IDgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhdGUuY3JjID0gY3JjO1xuICAgICAgICB0aGlzLnN0YXRlLnNpemUgKz0gZGF0YS5sZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNpemUgPj0gdGhpcy5zaXplKSB7XG4gICAgICAgICAgICBjb25zdCBidWYgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgICAgICAgICBidWYud3JpdGVJbnQzMkxFKH50aGlzLnN0YXRlLmNyYyAmIDB4ZmZmZmZmZmYsIDApO1xuICAgICAgICAgICAgY3JjID0gYnVmLnJlYWRVSW50MzJMRSgwKTtcbiAgICAgICAgICAgIGlmIChjcmMgIT09IHRoaXMuY3JjKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIENSQycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2l6ZSAhPT0gdGhpcy5zaXplKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHNpemUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRDcmNUYWJsZSgpIHtcbiAgICAgICAgbGV0IGNyY1RhYmxlID0gQ3JjVmVyaWZ5LmNyY1RhYmxlO1xuICAgICAgICBpZiAoIWNyY1RhYmxlKSB7XG4gICAgICAgICAgICBDcmNWZXJpZnkuY3JjVGFibGUgPSBjcmNUYWJsZSA9IFtdO1xuICAgICAgICAgICAgY29uc3QgYiA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICAgICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgMjU2OyBuKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgYyA9IG47XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgayA9IDg7IC0tayA+PSAwOyApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChjICYgMSkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgPSAweGVkYjg4MzIwIF4gKGMgPj4+IDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IGMgPj4+IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGMgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGIud3JpdGVJbnQzMkxFKGMsIDApO1xuICAgICAgICAgICAgICAgICAgICBjID0gYi5yZWFkVUludDMyTEUoMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNyY1RhYmxlW25dID0gYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JjVGFibGU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZVppcFRpbWUodGltZWJ5dGVzLCBkYXRlYnl0ZXMpIHtcbiAgICBjb25zdCB0aW1lYml0cyA9IHRvQml0cyh0aW1lYnl0ZXMsIDE2KTtcbiAgICBjb25zdCBkYXRlYml0cyA9IHRvQml0cyhkYXRlYnl0ZXMsIDE2KTtcblxuICAgIGNvbnN0IG10ID0ge1xuICAgICAgICBoOiBwYXJzZUludCh0aW1lYml0cy5zbGljZSgwLCA1KS5qb2luKCcnKSwgMiksXG4gICAgICAgIG06IHBhcnNlSW50KHRpbWViaXRzLnNsaWNlKDUsIDExKS5qb2luKCcnKSwgMiksXG4gICAgICAgIHM6IHBhcnNlSW50KHRpbWViaXRzLnNsaWNlKDExLCAxNikuam9pbignJyksIDIpICogMixcbiAgICAgICAgWTogcGFyc2VJbnQoZGF0ZWJpdHMuc2xpY2UoMCwgNykuam9pbignJyksIDIpICsgMTk4MCxcbiAgICAgICAgTTogcGFyc2VJbnQoZGF0ZWJpdHMuc2xpY2UoNywgMTEpLmpvaW4oJycpLCAyKSxcbiAgICAgICAgRDogcGFyc2VJbnQoZGF0ZWJpdHMuc2xpY2UoMTEsIDE2KS5qb2luKCcnKSwgMiksXG4gICAgfTtcbiAgICBjb25zdCBkdF9zdHIgPSBbbXQuWSwgbXQuTSwgbXQuRF0uam9pbignLScpICsgJyAnICsgW210LmgsIG10Lm0sIG10LnNdLmpvaW4oJzonKSArICcgR01UKzAnO1xuICAgIHJldHVybiBuZXcgRGF0ZShkdF9zdHIpLmdldFRpbWUoKTtcbn1cblxuZnVuY3Rpb24gdG9CaXRzKGRlYywgc2l6ZSkge1xuICAgIGxldCBiID0gKGRlYyA+Pj4gMCkudG9TdHJpbmcoMik7XG4gICAgd2hpbGUgKGIubGVuZ3RoIDwgc2l6ZSkge1xuICAgICAgICBiID0gJzAnICsgYjtcbiAgICB9XG4gICAgcmV0dXJuIGIuc3BsaXQoJycpO1xufVxuXG5mdW5jdGlvbiByZWFkVUludDY0TEUoYnVmZmVyLCBvZmZzZXQpIHtcbiAgICByZXR1cm4gYnVmZmVyLnJlYWRVSW50MzJMRShvZmZzZXQgKyA0KSAqIDB4MDAwMDAwMDEwMDAwMDAwMCArIGJ1ZmZlci5yZWFkVUludDMyTEUob2Zmc2V0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdHJlYW1aaXA7XG4iLCAiaW1wb3J0IHtcbiAgQWN0aW9uLFxuICBBY3Rpb25QYW5lbCxcbiAgRm9ybSxcbiAgSWNvbixcbiAgTGF1bmNoUHJvcHMsXG4gIFRvYXN0LFxuICBjbG9zZU1haW5XaW5kb3csXG4gIHNob3dJbkZpbmRlcixcbiAgc2hvd1RvYXN0LFxufSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBGb3JtVmFsaWRhdGlvbiwgdXNlRm9ybSB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuaW1wb3J0IHsgRXhlY2FFcnJvciB9IGZyb20gXCJleGVjYVwiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyB1c2VSZWR1Y2VyLCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IERlYnVnZ2luZ0J1Z1JlcG9ydGluZ0FjdGlvblNlY3Rpb24gfSBmcm9tIFwifi9jb21wb25lbnRzL2FjdGlvbnNcIjtcbmltcG9ydCBSb290RXJyb3JCb3VuZGFyeSBmcm9tIFwifi9jb21wb25lbnRzL1Jvb3RFcnJvckJvdW5kYXJ5XCI7XG5pbXBvcnQgeyBCaXR3YXJkZW5Qcm92aWRlciwgdXNlQml0d2FyZGVuIH0gZnJvbSBcIn4vY29udGV4dC9iaXR3YXJkZW5cIjtcbmltcG9ydCB7IFNlc3Npb25Qcm92aWRlciB9IGZyb20gXCJ+L2NvbnRleHQvc2Vzc2lvblwiO1xuaW1wb3J0IHsgUmVjZWl2ZWRGaWxlU2VuZCwgUmVjZWl2ZWRTZW5kLCBTZW5kVHlwZSB9IGZyb20gXCJ+L3R5cGVzL3NlbmRcIjtcbmltcG9ydCB7IENhY2hlIH0gZnJvbSBcIn4vdXRpbHMvY2FjaGVcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuaW1wb3J0IHsgU2VuZEludmFsaWRQYXNzd29yZEVycm9yLCBTZW5kTmVlZHNQYXNzd29yZEVycm9yIH0gZnJvbSBcIn4vdXRpbHMvZXJyb3JzXCI7XG5pbXBvcnQgdXNlT25jZUVmZmVjdCBmcm9tIFwifi91dGlscy9ob29rcy91c2VPbmNlRWZmZWN0XCI7XG5cbmNvbnN0IExvYWRpbmdGYWxsYmFjayA9ICgpID0+IDxGb3JtIGlzTG9hZGluZyAvPjtcblxuY29uc3QgUmVjZWl2ZVNlbmRDb21tYW5kID0gKHByb3BzOiBMYXVuY2hQcm9wczx7IGFyZ3VtZW50czogQXJndW1lbnRzLlJlY2VpdmVTZW5kIH0+KSA9PiAoXG4gIDxSb290RXJyb3JCb3VuZGFyeT5cbiAgICA8Qml0d2FyZGVuUHJvdmlkZXIgbG9hZGluZ0ZhbGxiYWNrPXs8TG9hZGluZ0ZhbGxiYWNrIC8+fT5cbiAgICAgIDxTZXNzaW9uUHJvdmlkZXIgbG9hZGluZ0ZhbGxiYWNrPXs8TG9hZGluZ0ZhbGxiYWNrIC8+fSB1bmxvY2s+XG4gICAgICAgIDxSZWNlaXZlU2VuZENvbW1hbmRDb250ZW50IHsuLi5wcm9wc30gLz5cbiAgICAgIDwvU2Vzc2lvblByb3ZpZGVyPlxuICAgIDwvQml0d2FyZGVuUHJvdmlkZXI+XG4gIDwvUm9vdEVycm9yQm91bmRhcnk+XG4pO1xuXG5jb25zdCBjYWNoZSA9IHtcbiAgc2V0RmlsZVBhdGg6IChmaWxlUGF0aDogc3RyaW5nKSA9PiBDYWNoZS5zZXQoXCJzZW5kRmlsZVBhdGhcIiwgZmlsZVBhdGgpLFxuICBnZXRGaWxlUGF0aDogKCkgPT4gQ2FjaGUuZ2V0KFwic2VuZEZpbGVQYXRoXCIpLFxufTtcblxudHlwZSBGb3JtVmFsdWVzID0ge1xuICB1cmw6IHN0cmluZztcbiAgcGFzc3dvcmQ6IHN0cmluZztcbiAgZmlsZVBhdGhzOiBzdHJpbmdbXTtcbn07XG5cbmNvbnN0IGdldEluaXRpYWxWYWx1ZXMgPSAoYXJncz86IEFyZ3VtZW50cy5SZWNlaXZlU2VuZCk6IEZvcm1WYWx1ZXMgPT4ge1xuICBjb25zdCBmaWxlUGF0aCA9IGNhY2hlLmdldEZpbGVQYXRoKCk7XG4gIHJldHVybiB7XG4gICAgdXJsOiBhcmdzPy51cmwgfHwgXCJcIixcbiAgICBwYXNzd29yZDogYXJncz8ucGFzc3dvcmQgfHwgXCJcIixcbiAgICBmaWxlUGF0aHM6IGZpbGVQYXRoID8gW2ZpbGVQYXRoXSA6IFtdLFxuICB9O1xufTtcblxudHlwZSBTdGF0ZSA9XG4gIHwgeyBzdGF0dXM6IFwiaWRsZVwiIH1cbiAgfCB7IHN0YXR1czogXCJ0ZXh0UmV2ZWFsZWRcIjsgc2VuZEluZm86IFJlY2VpdmVkU2VuZDsgdGV4dDogc3RyaW5nIH1cbiAgfCB7IHN0YXR1czogXCJwZW5kaW5nRmlsZVwiOyBzZW5kSW5mbzogUmVjZWl2ZWRTZW5kIH1cbiAgfCB7IHN0YXR1czogXCJuZWVkc1Bhc3N3b3JkXCIgfTtcblxuY29uc3Qgc3RhdGVSZWR1Y2VyID0gKHN0YXRlOiBTdGF0ZSwgYWN0aW9uOiBTdGF0ZSk6IFN0YXRlID0+IHtcbiAgc3dpdGNoIChhY3Rpb24uc3RhdHVzKSB7XG4gICAgY2FzZSBcImlkbGVcIjpcbiAgICAgIHJldHVybiB7IHN0YXR1czogXCJpZGxlXCIgfTtcbiAgICBjYXNlIFwidGV4dFJldmVhbGVkXCI6XG4gICAgICByZXR1cm4geyBzdGF0dXM6IFwidGV4dFJldmVhbGVkXCIsIHNlbmRJbmZvOiBhY3Rpb24uc2VuZEluZm8sIHRleHQ6IGFjdGlvbi50ZXh0IH07XG4gICAgY2FzZSBcInBlbmRpbmdGaWxlXCI6XG4gICAgICByZXR1cm4geyBzdGF0dXM6IFwicGVuZGluZ0ZpbGVcIiwgc2VuZEluZm86IGFjdGlvbi5zZW5kSW5mbyB9O1xuICAgIGNhc2UgXCJuZWVkc1Bhc3N3b3JkXCI6XG4gICAgICByZXR1cm4geyBzdGF0dXM6IFwibmVlZHNQYXNzd29yZFwiIH07XG4gIH1cbn07XG5cbmNvbnN0IHdpdGhPbkNoYW5nZUVmZmVjdCA9IDxUIGV4dGVuZHMgRm9ybS5WYWx1ZT4oXG4gIGl0ZW1Qcm9wczogUGFydGlhbDxGb3JtLkl0ZW1Qcm9wczxUPj4gJiB7IGlkOiBzdHJpbmcgfSxcbiAgb25DaGFuZ2U6ICh2YWx1ZTogVCkgPT4gdm9pZFxuKSA9PiB7XG4gIHJldHVybiB7XG4gICAgLi4uaXRlbVByb3BzLFxuICAgIG9uQ2hhbmdlOiAodmFsdWU6IFQpID0+IHtcbiAgICAgIGl0ZW1Qcm9wcy5vbkNoYW5nZT8uKHZhbHVlKTtcbiAgICAgIG9uQ2hhbmdlKHZhbHVlKTtcbiAgICB9LFxuICB9O1xufTtcblxuZnVuY3Rpb24gUmVjZWl2ZVNlbmRDb21tYW5kQ29udGVudCh7IGFyZ3VtZW50czogYXJncyB9OiBMYXVuY2hQcm9wczx7IGFyZ3VtZW50czogQXJndW1lbnRzLlJlY2VpdmVTZW5kIH0+KSB7XG4gIGNvbnN0IGJpdHdhcmRlbiA9IHVzZUJpdHdhcmRlbigpO1xuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVJlZHVjZXIoc3RhdGVSZWR1Y2VyLCB7IHN0YXR1czogXCJpZGxlXCIgfSk7XG5cbiAgY29uc3QgdXJsRmllbGRSZWYgPSB1c2VSZWY8Rm9ybS5UZXh0RmllbGQ+KG51bGwpO1xuICBjb25zdCBwYXNzd29yZEZpZWxkUmVmID0gdXNlUmVmPEZvcm0uUGFzc3dvcmRGaWVsZD4obnVsbCk7XG4gIGNvbnN0IGZpbGVQYXRoRmllbGRSZWYgPSB1c2VSZWY8Rm9ybS5GaWxlUGlja2VyPihudWxsKTtcblxuICBjb25zdCB7IGl0ZW1Qcm9wcywgaGFuZGxlU3VibWl0LCB2YWx1ZXMsIHJlc2V0IH0gPSB1c2VGb3JtPEZvcm1WYWx1ZXM+KHtcbiAgICBpbml0aWFsVmFsdWVzOiBnZXRJbml0aWFsVmFsdWVzKGFyZ3MpLFxuICAgIHZhbGlkYXRpb246IHtcbiAgICAgIHVybDogRm9ybVZhbGlkYXRpb24uUmVxdWlyZWQsXG4gICAgICBwYXNzd29yZDogc3RhdGUuc3RhdHVzID09PSBcIm5lZWRzUGFzc3dvcmRcIiA/IEZvcm1WYWxpZGF0aW9uLlJlcXVpcmVkIDogdW5kZWZpbmVkLFxuICAgICAgZmlsZVBhdGhzOiBzdGF0ZS5zdGF0dXMgPT09IFwicGVuZGluZ0ZpbGVcIiA/IEZvcm1WYWxpZGF0aW9uLlJlcXVpcmVkIDogdW5kZWZpbmVkLFxuICAgIH0sXG4gICAgb25TdWJtaXQ6IGFzeW5jICh2YWx1ZXMpID0+IHtcbiAgICAgIGlmIChzdGF0ZS5zdGF0dXMgPT09IFwiaWRsZVwiIHx8IHN0YXRlLnN0YXR1cyA9PT0gXCJuZWVkc1Bhc3N3b3JkXCIpIHtcbiAgICAgICAgYXdhaXQgcmVjZWl2ZVNlbmQodmFsdWVzLnVybCwgdmFsdWVzLnBhc3N3b3JkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUuc3RhdHVzID09PSBcInBlbmRpbmdGaWxlXCIgJiYgdmFsdWVzLmZpbGVQYXRoc1swXSAmJiBzdGF0ZS5zZW5kSW5mby50eXBlID09PSBTZW5kVHlwZS5GaWxlKSB7XG4gICAgICAgIGF3YWl0IGRvd25sb2FkRmlsZSh2YWx1ZXMudXJsLCBzdGF0ZS5zZW5kSW5mbywgdmFsdWVzLmZpbGVQYXRoc1swXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBzaG93VG9hc3QoeyB0aXRsZTogXCJGYWlsZWQgdG8gcmVjZWl2ZSBzZW5kXCIsIHN0eWxlOiBUb2FzdC5TdHlsZS5GYWlsdXJlIH0pO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xuXG4gIHVzZU9uY2VFZmZlY3QoKCkgPT4ge1xuICAgIHZvaWQgaGFuZGxlU3VibWl0KGdldEluaXRpYWxWYWx1ZXMoYXJncykpO1xuICB9LCBhcmdzLnVybCk7XG5cbiAgY29uc3QgcmVjZWl2ZVNlbmQgPSBhc3luYyAodXJsOiBzdHJpbmcsIHBhc3N3b3JkPzogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgdG9hc3QgPSBhd2FpdCBzaG93VG9hc3QoeyB0aXRsZTogXCJSZWNlaXZpbmcgU2VuZC4uLlwiLCBzdHlsZTogVG9hc3QuU3R5bGUuQW5pbWF0ZWQgfSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgcmVzdWx0OiBzZW5kSW5mbywgZXJyb3IgfSA9IGF3YWl0IGJpdHdhcmRlbi5yZWNlaXZlU2VuZEluZm8odXJsLCB7IHBhc3N3b3JkIH0pO1xuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFNlbmRJbnZhbGlkUGFzc3dvcmRFcnJvcikge1xuICAgICAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuRmFpbHVyZTtcbiAgICAgICAgICB0b2FzdC50aXRsZSA9IFwiSW52YWxpZCBwYXNzd29yZFwiO1xuICAgICAgICAgIHRvYXN0Lm1lc3NhZ2UgPSBcIlBsZWFzZSB0cnkgYWdhaW5cIjtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgU2VuZE5lZWRzUGFzc3dvcmRFcnJvcikge1xuICAgICAgICAgIHNldFN0YXRlKHsgc3RhdHVzOiBcIm5lZWRzUGFzc3dvcmRcIiB9KTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHBhc3N3b3JkRmllbGRSZWYuY3VycmVudD8uZm9jdXMoKSwgMSk7XG4gICAgICAgICAgcmV0dXJuIHRvYXN0LmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICAgIGlmIChzZW5kSW5mby50eXBlID09PSBTZW5kVHlwZS5UZXh0KSB7XG4gICAgICAgIGNvbnN0IHsgcmVzdWx0LCBlcnJvciB9ID0gYXdhaXQgYml0d2FyZGVuLnJlY2VpdmVTZW5kKHVybCwgeyBwYXNzd29yZCB9KTtcbiAgICAgICAgaWYgKGVycm9yKSB0aHJvdyBlcnJvcjtcblxuICAgICAgICBzZXRTdGF0ZSh7IHN0YXR1czogXCJ0ZXh0UmV2ZWFsZWRcIiwgc2VuZEluZm8sIHRleHQ6IHJlc3VsdCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFN0YXRlKHsgc3RhdHVzOiBcInBlbmRpbmdGaWxlXCIsIHNlbmRJbmZvIH0pO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGZpbGVQYXRoRmllbGRSZWYuY3VycmVudD8uZm9jdXMoKSwgMSk7XG4gICAgICB9XG4gICAgICBhd2FpdCB0b2FzdC5oaWRlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IGV4ZWNhRXJyb3IgPSBlcnJvciBhcyBFeGVjYUVycm9yO1xuICAgICAgaWYgKGV4ZWNhRXJyb3IgJiYgL05vdCBmb3VuZC9pLnRlc3QoZXhlY2FFcnJvci5tZXNzYWdlKSkge1xuICAgICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLkZhaWx1cmU7XG4gICAgICAgIHRvYXN0LnRpdGxlID0gXCJTZW5kIG5vdCBmb3VuZFwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5GYWlsdXJlO1xuICAgICAgICB0b2FzdC50aXRsZSA9IFwiRmFpbGVkIHRvIHJlY2VpdmUgU2VuZFwiO1xuICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHJlY2VpdmUgU2VuZFwiLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGRvd25sb2FkRmlsZSA9IGFzeW5jICh1cmw6IHN0cmluZywgc2VuZEluZm86IFJlY2VpdmVkRmlsZVNlbmQsIGZpbGVQYXRoOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCB0b2FzdCA9IGF3YWl0IHNob3dUb2FzdCh7IHRpdGxlOiBcIkRvd25sb2FkaW5nIGZpbGUuLi5cIiwgc3R5bGU6IFRvYXN0LlN0eWxlLkFuaW1hdGVkIH0pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlUGF0aCA9IGpvaW4oZmlsZVBhdGgsIHNlbmRJbmZvLmZpbGUuZmlsZU5hbWUpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgYml0d2FyZGVuLnJlY2VpdmVTZW5kKHVybCwgeyBzYXZlUGF0aCB9KTtcbiAgICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG5cbiAgICAgIHRvYXN0LnRpdGxlID0gXCJGaWxlIGRvd25sb2FkZWRcIjtcbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuU3VjY2VzcztcbiAgICAgIGF3YWl0IHNob3dJbkZpbmRlcihzYXZlUGF0aCk7XG4gICAgICBhd2FpdCBjbG9zZU1haW5XaW5kb3coKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5GYWlsdXJlO1xuICAgICAgdG9hc3QudGl0bGUgPSBcIkZhaWxlZCB0byBkb3dubG9hZCBmaWxlXCI7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGRvd25sb2FkIGZpbGVcIiwgZXJyb3IpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCByZXNldEZpZWxkcyA9ICgpID0+IHtcbiAgICByZXNldChnZXRJbml0aWFsVmFsdWVzKCkpO1xuICAgIHNldFN0YXRlKHsgc3RhdHVzOiBcImlkbGVcIiB9KTtcbiAgICB1cmxGaWVsZFJlZi5jdXJyZW50Py5mb2N1cygpO1xuICB9O1xuXG4gIGNvbnN0IG9uVXJsQ2hhbmdlID0gKHVybDogc3RyaW5nKSA9PiB7XG4gICAgaWYgKCF1cmwgfHwgdXJsID09PSBcImh0dHBzOi8vdmF1bHQuYml0d2FyZGVuLmNvbS8jL3NlbmQvXCIpIHtcbiAgICAgIHJlc2V0RmllbGRzKCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IG9uRmlsZVBhdGhzQ2hhbmdlID0gKHBhdGhzOiBzdHJpbmdbXSkgPT4ge1xuICAgIGNvbnN0IFtmaWxlUGF0aF0gPSBwYXRocyA/PyBbXTtcbiAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgIGNhY2hlLnNldEZpbGVQYXRoKGZpbGVQYXRoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8Rm9ybVxuICAgICAgYWN0aW9ucz17XG4gICAgICAgIDxBY3Rpb25QYW5lbD5cbiAgICAgICAgICB7c3RhdGUuc3RhdHVzID09PSBcInRleHRSZXZlYWxlZFwiICYmIDxBY3Rpb24uQ29weVRvQ2xpcGJvYXJkIGNvbnRlbnQ9e3N0YXRlLnRleHR9IHRpdGxlPVwiQ29weSBUZXh0XCIgLz59XG4gICAgICAgICAge3N0YXRlLnN0YXR1cyAhPT0gXCJ0ZXh0UmV2ZWFsZWRcIiAmJiAoXG4gICAgICAgICAgICA8QWN0aW9uLlN1Ym1pdEZvcm1cbiAgICAgICAgICAgICAgdGl0bGU9e3N0YXRlLnN0YXR1cyA9PT0gXCJwZW5kaW5nRmlsZVwiID8gXCJEb3dubG9hZCBGaWxlXCIgOiBcIlJlY2VpdmUgU2VuZFwifVxuICAgICAgICAgICAgICBpY29uPXt7IHNvdXJjZTogSWNvbi5Eb3dubG9hZCB9fVxuICAgICAgICAgICAgICBvblN1Ym1pdD17aGFuZGxlU3VibWl0fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApfVxuICAgICAgICAgIHsodmFsdWVzLnBhc3N3b3JkIHx8IHZhbHVlcy51cmwpICYmIChcbiAgICAgICAgICAgIDxBY3Rpb24gdGl0bGU9XCJSZXNldCBGaWVsZHNcIiBpY29uPXt7IHNvdXJjZTogSWNvbi5UcmFzaCB9fSBvbkFjdGlvbj17cmVzZXRGaWVsZHN9IC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8RGVidWdnaW5nQnVnUmVwb3J0aW5nQWN0aW9uU2VjdGlvbiAvPlxuICAgICAgICA8L0FjdGlvblBhbmVsPlxuICAgICAgfVxuICAgID5cbiAgICAgIDxGb3JtLlRleHRGaWVsZFxuICAgICAgICB7Li4ud2l0aE9uQ2hhbmdlRWZmZWN0KGl0ZW1Qcm9wcy51cmwsIG9uVXJsQ2hhbmdlKX1cbiAgICAgICAgcmVmPXt1cmxGaWVsZFJlZn1cbiAgICAgICAgdGl0bGU9XCJTZW5kIFVSTFwiXG4gICAgICAgIGF1dG9Gb2N1c1xuICAgICAgLz5cbiAgICAgIHsoc3RhdGUuc3RhdHVzID09PSBcIm5lZWRzUGFzc3dvcmRcIiB8fCBhcmdzLnBhc3N3b3JkKSAmJiAoXG4gICAgICAgIDxGb3JtLlBhc3N3b3JkRmllbGRcbiAgICAgICAgICB7Li4uaXRlbVByb3BzLnBhc3N3b3JkfVxuICAgICAgICAgIHJlZj17cGFzc3dvcmRGaWVsZFJlZn1cbiAgICAgICAgICB0aXRsZT1cIlBhc3N3b3JkXCJcbiAgICAgICAgICBpbmZvPVwiVGhpcyBTZW5kIGlzIHBhc3N3b3JkIHByb3RlY3RlZFwiXG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgeyhzdGF0ZS5zdGF0dXMgPT09IFwicGVuZGluZ0ZpbGVcIiB8fCBzdGF0ZS5zdGF0dXMgPT09IFwidGV4dFJldmVhbGVkXCIpICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8Rm9ybS5TZXBhcmF0b3IgLz5cbiAgICAgICAgICA8Rm9ybS5EZXNjcmlwdGlvbiB0aXRsZT1cIk5hbWVcIiB0ZXh0PXtzdGF0ZS5zZW5kSW5mby5uYW1lfSAvPlxuICAgICAgICAgIHtzdGF0ZS5zZW5kSW5mby50eXBlID09PSBTZW5kVHlwZS5GaWxlICYmIChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxGb3JtLkRlc2NyaXB0aW9uIHRpdGxlPVwiRmlsZSBOYW1lXCIgdGV4dD17c3RhdGUuc2VuZEluZm8uZmlsZS5maWxlTmFtZX0gLz5cbiAgICAgICAgICAgICAgPEZvcm0uRGVzY3JpcHRpb24gdGl0bGU9XCJGaWxlIFNpemVcIiB0ZXh0PXtzdGF0ZS5zZW5kSW5mby5maWxlLnNpemVOYW1lfSAvPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgICAge3N0YXRlLnN0YXR1cyA9PT0gXCJ0ZXh0UmV2ZWFsZWRcIiAmJiAoXG4gICAgICAgIDxGb3JtLlRleHRBcmVhIGlkPVwidGV4dFwiIHRpdGxlPVwiVGV4dFwiIHZhbHVlPXtzdGF0ZS50ZXh0fSBvbkNoYW5nZT17KCkgPT4gbnVsbH0gLz5cbiAgICAgICl9XG4gICAgICB7c3RhdGUuc3RhdHVzID09PSBcInBlbmRpbmdGaWxlXCIgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxGb3JtLkRlc2NyaXB0aW9uIHRleHQ9XCJcIiAvPlxuICAgICAgICAgIDxGb3JtLkZpbGVQaWNrZXJcbiAgICAgICAgICAgIHsuLi53aXRoT25DaGFuZ2VFZmZlY3QoaXRlbVByb3BzLmZpbGVQYXRocywgb25GaWxlUGF0aHNDaGFuZ2UpfVxuICAgICAgICAgICAgcmVmPXtmaWxlUGF0aEZpZWxkUmVmfVxuICAgICAgICAgICAgdGl0bGU9XCJTYXZlIEZpbGUgVG9cIlxuICAgICAgICAgICAgaW5mbz1cIlRoaXMgaXMgdGhlIGZvbGRlciB0byB3aGVyZSB0aGUgU2VuZCdzIGZpbGUgd2lsbCBiZSBzYXZlZC5cIlxuICAgICAgICAgICAgY2FuQ2hvb3NlRmlsZXM9e2ZhbHNlfVxuICAgICAgICAgICAgYWxsb3dNdWx0aXBsZVNlbGVjdGlvbj17ZmFsc2V9XG4gICAgICAgICAgICBjYW5DaG9vc2VEaXJlY3Rvcmllc1xuICAgICAgICAgIC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICA8L0Zvcm0+XG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlY2VpdmVTZW5kQ29tbWFuZDtcbiIsICJ2YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlcXVhbChmb28sIGJhcikge1xuXHR2YXIgY3RvciwgbGVuO1xuXHRpZiAoZm9vID09PSBiYXIpIHJldHVybiB0cnVlO1xuXG5cdGlmIChmb28gJiYgYmFyICYmIChjdG9yPWZvby5jb25zdHJ1Y3RvcikgPT09IGJhci5jb25zdHJ1Y3Rvcikge1xuXHRcdGlmIChjdG9yID09PSBEYXRlKSByZXR1cm4gZm9vLmdldFRpbWUoKSA9PT0gYmFyLmdldFRpbWUoKTtcblx0XHRpZiAoY3RvciA9PT0gUmVnRXhwKSByZXR1cm4gZm9vLnRvU3RyaW5nKCkgPT09IGJhci50b1N0cmluZygpO1xuXG5cdFx0aWYgKGN0b3IgPT09IEFycmF5KSB7XG5cdFx0XHRpZiAoKGxlbj1mb28ubGVuZ3RoKSA9PT0gYmFyLmxlbmd0aCkge1xuXHRcdFx0XHR3aGlsZSAobGVuLS0gJiYgZGVxdWFsKGZvb1tsZW5dLCBiYXJbbGVuXSkpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGxlbiA9PT0gLTE7XG5cdFx0fVxuXG5cdFx0aWYgKCFjdG9yIHx8IHR5cGVvZiBmb28gPT09ICdvYmplY3QnKSB7XG5cdFx0XHRsZW4gPSAwO1xuXHRcdFx0Zm9yIChjdG9yIGluIGZvbykge1xuXHRcdFx0XHRpZiAoaGFzLmNhbGwoZm9vLCBjdG9yKSAmJiArK2xlbiAmJiAhaGFzLmNhbGwoYmFyLCBjdG9yKSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRpZiAoIShjdG9yIGluIGJhcikgfHwgIWRlcXVhbChmb29bY3Rvcl0sIGJhcltjdG9yXSkpIHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBPYmplY3Qua2V5cyhiYXIpLmxlbmd0aCA9PT0gbGVuO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBmb28gIT09IGZvbyAmJiBiYXIgIT09IGJhcjtcbn1cbiIsICIvLy8gPHJlZmVyZW5jZSB0eXBlcz1cIm5vZGVcIiAvPlxuXG5leHBvcnQgeyB1c2VQcm9taXNlIH0gZnJvbSBcIi4vdXNlUHJvbWlzZVwiO1xuZXhwb3J0IHsgdXNlQ2FjaGVkU3RhdGUgfSBmcm9tIFwiLi91c2VDYWNoZWRTdGF0ZVwiO1xuZXhwb3J0IHsgdXNlQ2FjaGVkUHJvbWlzZSB9IGZyb20gXCIuL3VzZUNhY2hlZFByb21pc2VcIjtcbmV4cG9ydCB7IHVzZUZldGNoIH0gZnJvbSBcIi4vdXNlRmV0Y2hcIjtcbmV4cG9ydCB7IHVzZUV4ZWMgfSBmcm9tIFwiLi91c2VFeGVjXCI7XG5leHBvcnQgeyB1c2VTdHJlYW1KU09OIH0gZnJvbSBcIi4vdXNlU3RyZWFtSlNPTlwiO1xuZXhwb3J0IHsgdXNlU1FMIH0gZnJvbSBcIi4vdXNlU1FMXCI7XG5leHBvcnQgeyB1c2VGb3JtLCBGb3JtVmFsaWRhdGlvbiB9IGZyb20gXCIuL3VzZUZvcm1cIjtcbmV4cG9ydCB7IHVzZUFJIH0gZnJvbSBcIi4vdXNlQUlcIjtcbmV4cG9ydCB7IHVzZUZyZWNlbmN5U29ydGluZyB9IGZyb20gXCIuL3VzZUZyZWNlbmN5U29ydGluZ1wiO1xuZXhwb3J0IHsgdXNlTG9jYWxTdG9yYWdlIH0gZnJvbSBcIi4vdXNlTG9jYWxTdG9yYWdlXCI7XG5cbmV4cG9ydCB7IGdldEF2YXRhckljb24sIGdldEZhdmljb24sIGdldFByb2dyZXNzSWNvbiB9IGZyb20gXCIuL2ljb25cIjtcblxuZXhwb3J0IHsgT0F1dGhTZXJ2aWNlLCB3aXRoQWNjZXNzVG9rZW4sIGdldEFjY2Vzc1Rva2VuIH0gZnJvbSBcIi4vb2F1dGhcIjtcblxuZXhwb3J0IHsgY3JlYXRlRGVlcGxpbmssIGNyZWF0ZUV4dGVuc2lvbkRlZXBsaW5rLCBjcmVhdGVTY3JpcHRDb21tYW5kRGVlcGxpbmssIERlZXBsaW5rVHlwZSB9IGZyb20gXCIuL2NyZWF0ZURlZXBsaW5rXCI7XG5leHBvcnQgeyBleGVjdXRlU1FMIH0gZnJvbSBcIi4vZXhlY3V0ZVNRTFwiO1xuZXhwb3J0IHsgcnVuQXBwbGVTY3JpcHQgfSBmcm9tIFwiLi9ydW4tYXBwbGVzY3JpcHRcIjtcbmV4cG9ydCB7IHJ1blBvd2VyU2hlbGxTY3JpcHQgfSBmcm9tIFwiLi9ydW4tcG93ZXJzaGVsbC1zY3JpcHRcIjtcbmV4cG9ydCB7IHNob3dGYWlsdXJlVG9hc3QgfSBmcm9tIFwiLi9zaG93RmFpbHVyZVRvYXN0XCI7XG5leHBvcnQgeyB3aXRoQ2FjaGUgfSBmcm9tIFwiLi9jYWNoZVwiO1xuXG5leHBvcnQgdHlwZSB7IFByb21pc2VPcHRpb25zIH0gZnJvbSBcIi4vdXNlUHJvbWlzZVwiO1xuZXhwb3J0IHR5cGUgeyBDYWNoZWRQcm9taXNlT3B0aW9ucyB9IGZyb20gXCIuL3VzZUNhY2hlZFByb21pc2VcIjtcbmV4cG9ydCB0eXBlIHtcbiAgT0F1dGhTZXJ2aWNlT3B0aW9ucyxcbiAgT25BdXRob3JpemVQYXJhbXMsXG4gIFdpdGhBY2Nlc3NUb2tlbkNvbXBvbmVudE9yRm4sXG4gIFByb3ZpZGVyV2l0aERlZmF1bHRDbGllbnRPcHRpb25zLFxuICBQcm92aWRlck9wdGlvbnMsXG59IGZyb20gXCIuL29hdXRoXCI7XG5leHBvcnQgdHlwZSB7IEFzeW5jU3RhdGUsIE11dGF0ZVByb21pc2UgfSBmcm9tIFwiLi90eXBlc1wiO1xuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2ssIFJlZk9iamVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgZW52aXJvbm1lbnQsIExhdW5jaFR5cGUsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgdXNlRGVlcE1lbW8gfSBmcm9tIFwiLi91c2VEZWVwTWVtb1wiO1xuaW1wb3J0IHtcbiAgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlLFxuICBNdXRhdGVQcm9taXNlLFxuICBVc2VQcm9taXNlUmV0dXJuVHlwZSxcbiAgQXN5bmNTdGF0ZSxcbiAgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLFxuICBVbndyYXBSZXR1cm4sXG4gIFBhZ2luYXRpb25PcHRpb25zLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgdXNlTGF0ZXN0IH0gZnJvbSBcIi4vdXNlTGF0ZXN0XCI7XG5pbXBvcnQgeyBzaG93RmFpbHVyZVRvYXN0IH0gZnJvbSBcIi4vc2hvd0ZhaWx1cmVUb2FzdFwiO1xuXG5leHBvcnQgdHlwZSBQcm9taXNlT3B0aW9uczxUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlIHwgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlPiA9IHtcbiAgLyoqXG4gICAqIEEgcmVmZXJlbmNlIHRvIGFuIGBBYm9ydENvbnRyb2xsZXJgIHRvIGNhbmNlbCBhIHByZXZpb3VzIGNhbGwgd2hlbiB0cmlnZ2VyaW5nIGEgbmV3IG9uZVxuICAgKi9cbiAgYWJvcnRhYmxlPzogUmVmT2JqZWN0PEFib3J0Q29udHJvbGxlciB8IG51bGwgfCB1bmRlZmluZWQ+O1xuICAvKipcbiAgICogV2hldGhlciB0byBhY3R1YWxseSBleGVjdXRlIHRoZSBmdW5jdGlvbiBvciBub3QuXG4gICAqIFRoaXMgaXMgdXNlZnVsIGZvciBjYXNlcyB3aGVyZSBvbmUgb2YgdGhlIGZ1bmN0aW9uJ3MgYXJndW1lbnRzIGRlcGVuZHMgb24gc29tZXRoaW5nIHRoYXRcbiAgICogbWlnaHQgbm90IGJlIGF2YWlsYWJsZSByaWdodCBhd2F5IChmb3IgZXhhbXBsZSwgZGVwZW5kcyBvbiBzb21lIHVzZXIgaW5wdXRzKS4gQmVjYXVzZSBSZWFjdCByZXF1aXJlc1xuICAgKiBldmVyeSBob29rcyB0byBiZSBkZWZpbmVkIG9uIHRoZSByZW5kZXIsIHRoaXMgZmxhZyBlbmFibGVzIHlvdSB0byBkZWZpbmUgdGhlIGhvb2sgcmlnaHQgYXdheSBidXRcbiAgICogd2FpdCB1dGlsIHlvdSBoYXZlIGFsbCB0aGUgYXJndW1lbnRzIHJlYWR5IHRvIGV4ZWN1dGUgdGhlIGZ1bmN0aW9uLlxuICAgKi9cbiAgZXhlY3V0ZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBPcHRpb25zIGZvciB0aGUgZ2VuZXJpYyBmYWlsdXJlIHRvYXN0LlxuICAgKiBJdCBhbGxvd3MgeW91IHRvIGN1c3RvbWl6ZSB0aGUgdGl0bGUsIG1lc3NhZ2UsIGFuZCBwcmltYXJ5IGFjdGlvbiBvZiB0aGUgZmFpbHVyZSB0b2FzdC5cbiAgICovXG4gIGZhaWx1cmVUb2FzdE9wdGlvbnM/OiBQYXJ0aWFsPFBpY2s8VG9hc3QuT3B0aW9ucywgXCJ0aXRsZVwiIHwgXCJwcmltYXJ5QWN0aW9uXCIgfCBcIm1lc3NhZ2VcIj4+O1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYW4gZXhlY3V0aW9uIGZhaWxzLiBCeSBkZWZhdWx0IGl0IHdpbGwgbG9nIHRoZSBlcnJvciBhbmQgc2hvd1xuICAgKiBhIGdlbmVyaWMgZmFpbHVyZSB0b2FzdC5cbiAgICovXG4gIG9uRXJyb3I/OiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGFuIGV4ZWN1dGlvbiBzdWNjZWVkcy5cbiAgICovXG4gIG9uRGF0YT86IChkYXRhOiBVbndyYXBSZXR1cm48VD4sIHBhZ2luYXRpb24/OiBQYWdpbmF0aW9uT3B0aW9uczxVbndyYXBSZXR1cm48VD4+KSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGFuIGV4ZWN1dGlvbiB3aWxsIHN0YXJ0XG4gICAqL1xuICBvbldpbGxFeGVjdXRlPzogKHBhcmFtZXRlcnM6IFBhcmFtZXRlcnM8VD4pID0+IHZvaWQ7XG59O1xuXG4vKipcbiAqIFdyYXBzIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvbiBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgaW4gYW5vdGhlciBmdW5jdGlvbiwgYW5kIHJldHVybnMgdGhlIHtAbGluayBBc3luY1N0YXRlfSBjb3JyZXNwb25kaW5nIHRvIHRoZSBleGVjdXRpb24gb2YgdGhlIGZ1bmN0aW9uLlxuICpcbiAqIEByZW1hcmsgVGhpcyBvdmVybG9hZCBzaG91bGQgYmUgdXNlZCB3aGVuIHdvcmtpbmcgd2l0aCBwYWdpbmF0ZWQgZGF0YSBzb3VyY2VzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBcbiAqIGltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tIFwibm9kZTp0aW1lcnMvcHJvbWlzZXNcIjtcbiAqIGltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG4gKiBpbXBvcnQgeyBMaXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgdXNlUHJvbWlzZSB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IFtzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICpcbiAqICAgY29uc3QgeyBpc0xvYWRpbmcsIGRhdGEsIHBhZ2luYXRpb24gfSA9IHVzZVByb21pc2UoXG4gKiAgICAgKHNlYXJjaFRleHQ6IHN0cmluZykgPT4gYXN5bmMgKG9wdGlvbnM6IHsgcGFnZTogbnVtYmVyIH0pID0+IHtcbiAqICAgICAgIGF3YWl0IHNldFRpbWVvdXQoMjAwKTtcbiAqICAgICAgIGNvbnN0IG5ld0RhdGEgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAyNSB9LCAoX3YsIGluZGV4KSA9PiAoe1xuICogICAgICAgICBpbmRleCxcbiAqICAgICAgICAgcGFnZTogb3B0aW9ucy5wYWdlLFxuICogICAgICAgICB0ZXh0OiBzZWFyY2hUZXh0LFxuICogICAgICAgfSkpO1xuICogICAgICAgcmV0dXJuIHsgZGF0YTogbmV3RGF0YSwgaGFzTW9yZTogb3B0aW9ucy5wYWdlIDwgMTAgfTtcbiAqICAgICB9LFxuICogICAgIFtzZWFyY2hUZXh0XVxuICogICApO1xuICpcbiAqICAgcmV0dXJuIChcbiAqICAgICA8TGlzdCBpc0xvYWRpbmc9e2lzTG9hZGluZ30gb25TZWFyY2hUZXh0Q2hhbmdlPXtzZXRTZWFyY2hUZXh0fSBwYWdpbmF0aW9uPXtwYWdpbmF0aW9ufT5cbiAqICAgICAgIHtkYXRhPy5tYXAoKGl0ZW0pID0+IChcbiAqICAgICAgICAgPExpc3QuSXRlbVxuICogICAgICAgICAgIGtleT17YCR7aXRlbS5wYWdlfSAke2l0ZW0uaW5kZXh9ICR7aXRlbS50ZXh0fWB9XG4gKiAgICAgICAgICAgdGl0bGU9e2BQYWdlICR7aXRlbS5wYWdlfSBJdGVtICR7aXRlbS5pbmRleH1gfVxuICogICAgICAgICAgIHN1YnRpdGxlPXtpdGVtLnRleHR9XG4gKiAgICAgICAgIC8+XG4gKiAgICAgICApKX1cbiAqICAgICA8L0xpc3Q+XG4gKiAgICk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VQcm9taXNlPFQgZXh0ZW5kcyBGdW5jdGlvblJldHVybmluZ1BhZ2luYXRlZFByb21pc2U8W10+PihcbiAgZm46IFQsXG4pOiBVc2VQcm9taXNlUmV0dXJuVHlwZTxVbndyYXBSZXR1cm48VD4+O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb21pc2U8VCBleHRlbmRzIEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZT4oXG4gIGZuOiBULFxuICBhcmdzOiBQYXJhbWV0ZXJzPFQ+LFxuICBvcHRpb25zPzogUHJvbWlzZU9wdGlvbnM8VD4sXG4pOiBVc2VQcm9taXNlUmV0dXJuVHlwZTxVbndyYXBSZXR1cm48VD4+O1xuXG4vKipcbiAqIFdyYXBzIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvbiBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgYW5kIHJldHVybnMgdGhlIHtAbGluayBBc3luY1N0YXRlfSBjb3JyZXNwb25kaW5nIHRvIHRoZSBleGVjdXRpb24gb2YgdGhlIGZ1bmN0aW9uLlxuICpcbiAqIEByZW1hcmsgVGhlIGZ1bmN0aW9uIGlzIGFzc3VtZWQgdG8gYmUgY29uc3RhbnQgKGVnLiBjaGFuZ2luZyBpdCB3b24ndCB0cmlnZ2VyIGEgcmV2YWxpZGF0aW9uKS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyB1c2VQcm9taXNlIH0gZnJvbSAnQHJheWNhc3QvdXRpbHMnO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IGFib3J0YWJsZSA9IHVzZVJlZjxBYm9ydENvbnRyb2xsZXI+KCk7XG4gKiAgIGNvbnN0IHsgaXNMb2FkaW5nLCBkYXRhLCByZXZhbGlkYXRlIH0gPSB1c2VQcm9taXNlKGFzeW5jICh1cmw6IHN0cmluZykgPT4ge1xuICogICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7IHNpZ25hbDogYWJvcnRhYmxlLmN1cnJlbnQ/LnNpZ25hbCB9KTtcbiAqICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gKiAgICAgcmV0dXJuIHJlc3VsdFxuICogICB9LFxuICogICBbJ2h0dHBzOi8vYXBpLmV4YW1wbGUnXSxcbiAqICAge1xuICogICAgIGFib3J0YWJsZVxuICogICB9KTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPERldGFpbFxuICogICAgICAgaXNMb2FkaW5nPXtpc0xvYWRpbmd9XG4gKiAgICAgICBtYXJrZG93bj17ZGF0YX1cbiAqICAgICAgIGFjdGlvbnM9e1xuICogICAgICAgICA8QWN0aW9uUGFuZWw+XG4gKiAgICAgICAgICAgPEFjdGlvbiB0aXRsZT1cIlJlbG9hZFwiIG9uQWN0aW9uPXsoKSA9PiByZXZhbGlkYXRlKCl9IC8+XG4gKiAgICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gKiAgICAgICB9XG4gKiAgICAgLz5cbiAqICAgKTtcbiAqIH07XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb21pc2U8VCBleHRlbmRzIEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZTxbXT4+KGZuOiBUKTogVXNlUHJvbWlzZVJldHVyblR5cGU8VW53cmFwUmV0dXJuPFQ+PjtcbmV4cG9ydCBmdW5jdGlvbiB1c2VQcm9taXNlPFQgZXh0ZW5kcyBGdW5jdGlvblJldHVybmluZ1Byb21pc2U+KFxuICBmbjogVCxcbiAgYXJnczogUGFyYW1ldGVyczxUPixcbiAgb3B0aW9ucz86IFByb21pc2VPcHRpb25zPFQ+LFxuKTogVXNlUHJvbWlzZVJldHVyblR5cGU8VW53cmFwUmV0dXJuPFQ+PjtcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb21pc2U8VCBleHRlbmRzIEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZSB8IEZ1bmN0aW9uUmV0dXJuaW5nUGFnaW5hdGVkUHJvbWlzZT4oXG4gIGZuOiBULFxuICBhcmdzPzogUGFyYW1ldGVyczxUPixcbiAgb3B0aW9ucz86IFByb21pc2VPcHRpb25zPFQ+LFxuKTogVXNlUHJvbWlzZVJldHVyblR5cGU8YW55PiB7XG4gIGNvbnN0IGxhc3RDYWxsSWQgPSB1c2VSZWYoMCk7XG4gIGNvbnN0IFtzdGF0ZSwgc2V0XSA9IHVzZVN0YXRlPEFzeW5jU3RhdGU8VW53cmFwUmV0dXJuPFQ+Pj4oeyBpc0xvYWRpbmc6IHRydWUgfSk7XG5cbiAgY29uc3QgZm5SZWYgPSB1c2VMYXRlc3QoZm4pO1xuICBjb25zdCBsYXRlc3RBYm9ydGFibGUgPSB1c2VMYXRlc3Qob3B0aW9ucz8uYWJvcnRhYmxlKTtcbiAgY29uc3QgbGF0ZXN0QXJncyA9IHVzZUxhdGVzdChhcmdzIHx8IFtdKTtcbiAgY29uc3QgbGF0ZXN0T25FcnJvciA9IHVzZUxhdGVzdChvcHRpb25zPy5vbkVycm9yKTtcbiAgY29uc3QgbGF0ZXN0T25EYXRhID0gdXNlTGF0ZXN0KG9wdGlvbnM/Lm9uRGF0YSk7XG4gIGNvbnN0IGxhdGVzdE9uV2lsbEV4ZWN1dGUgPSB1c2VMYXRlc3Qob3B0aW9ucz8ub25XaWxsRXhlY3V0ZSk7XG4gIGNvbnN0IGxhdGVzdEZhaWx1cmVUb2FzdCA9IHVzZUxhdGVzdChvcHRpb25zPy5mYWlsdXJlVG9hc3RPcHRpb25zKTtcbiAgY29uc3QgbGF0ZXN0VmFsdWUgPSB1c2VMYXRlc3Qoc3RhdGUuZGF0YSk7XG4gIGNvbnN0IGxhdGVzdENhbGxiYWNrID0gdXNlUmVmPCguLi5hcmdzOiBQYXJhbWV0ZXJzPFQ+KSA9PiBQcm9taXNlPFVud3JhcFJldHVybjxUPj4+KG51bGwpO1xuXG4gIGNvbnN0IHBhZ2luYXRpb25BcmdzUmVmID0gdXNlUmVmPFBhZ2luYXRpb25PcHRpb25zPih7IHBhZ2U6IDAgfSk7XG4gIGNvbnN0IHVzZVBhZ2luYXRpb25SZWYgPSB1c2VSZWYoZmFsc2UpO1xuICBjb25zdCBoYXNNb3JlUmVmID0gdXNlUmVmKHRydWUpO1xuICBjb25zdCBwYWdlU2l6ZVJlZiA9IHVzZVJlZig1MCk7XG5cbiAgY29uc3QgYWJvcnQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGxhdGVzdEFib3J0YWJsZS5jdXJyZW50KSB7XG4gICAgICBsYXRlc3RBYm9ydGFibGUuY3VycmVudC5jdXJyZW50Py5hYm9ydCgpO1xuICAgICAgbGF0ZXN0QWJvcnRhYmxlLmN1cnJlbnQuY3VycmVudCA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuICsrbGFzdENhbGxJZC5jdXJyZW50O1xuICB9LCBbbGF0ZXN0QWJvcnRhYmxlXSk7XG5cbiAgY29uc3QgY2FsbGJhY2sgPSB1c2VDYWxsYmFjayhcbiAgICAoLi4uYXJnczogUGFyYW1ldGVyczxUPik6IFByb21pc2U8VW53cmFwUmV0dXJuPFQ+PiA9PiB7XG4gICAgICBjb25zdCBjYWxsSWQgPSBhYm9ydCgpO1xuXG4gICAgICBsYXRlc3RPbldpbGxFeGVjdXRlLmN1cnJlbnQ/LihhcmdzKTtcblxuICAgICAgc2V0KChwcmV2U3RhdGUpID0+ICh7IC4uLnByZXZTdGF0ZSwgaXNMb2FkaW5nOiB0cnVlIH0pKTtcblxuICAgICAgY29uc3QgcHJvbWlzZU9yUGFnaW5hdGVkUHJvbWlzZSA9IGJpbmRQcm9taXNlSWZOZWVkZWQoZm5SZWYuY3VycmVudCkoLi4uYXJncyk7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yOiBhbnkpIHtcbiAgICAgICAgaWYgKGVycm9yLm5hbWUgPT0gXCJBYm9ydEVycm9yXCIpIHtcbiAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbElkID09PSBsYXN0Q2FsbElkLmN1cnJlbnQpIHtcbiAgICAgICAgICAvLyBoYW5kbGUgZXJyb3JzXG4gICAgICAgICAgaWYgKGxhdGVzdE9uRXJyb3IuY3VycmVudCkge1xuICAgICAgICAgICAgbGF0ZXN0T25FcnJvci5jdXJyZW50KGVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGVudmlyb25tZW50LmxhdW5jaFR5cGUgIT09IExhdW5jaFR5cGUuQmFja2dyb3VuZCkge1xuICAgICAgICAgICAgICBzaG93RmFpbHVyZVRvYXN0KGVycm9yLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IFwiRmFpbGVkIHRvIGZldGNoIGxhdGVzdCBkYXRhXCIsXG4gICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbjoge1xuICAgICAgICAgICAgICAgICAgdGl0bGU6IFwiUmV0cnlcIixcbiAgICAgICAgICAgICAgICAgIG9uQWN0aW9uKHRvYXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRvYXN0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbGF0ZXN0Q2FsbGJhY2suY3VycmVudD8uKC4uLigobGF0ZXN0QXJncy5jdXJyZW50IHx8IFtdKSBhcyBQYXJhbWV0ZXJzPFQ+KSk7XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLi4ubGF0ZXN0RmFpbHVyZVRvYXN0LmN1cnJlbnQsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBzZXQoeyBlcnJvciwgaXNMb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBwcm9taXNlT3JQYWdpbmF0ZWRQcm9taXNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdXNlUGFnaW5hdGlvblJlZi5jdXJyZW50ID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHByb21pc2VPclBhZ2luYXRlZFByb21pc2UocGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudCkudGhlbihcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRvbyBjb21wbGljYXRlZCBmb3IgVFNcbiAgICAgICAgICAoeyBkYXRhLCBoYXNNb3JlLCBjdXJzb3IgfTogeyBkYXRhOiBVbndyYXBSZXR1cm48VD47IGhhc01vcmU6IGJvb2xlYW47IGN1cnNvcj86IGFueSB9KSA9PiB7XG4gICAgICAgICAgICBpZiAoY2FsbElkID09PSBsYXN0Q2FsbElkLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgaWYgKHBhZ2luYXRpb25BcmdzUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50LmN1cnNvciA9IGN1cnNvcjtcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50Lmxhc3RJdGVtID0gZGF0YT8uW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAobGF0ZXN0T25EYXRhLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBsYXRlc3RPbkRhdGEuY3VycmVudChkYXRhLCBwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChoYXNNb3JlKSB7XG4gICAgICAgICAgICAgICAgcGFnZVNpemVSZWYuY3VycmVudCA9IGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGhhc01vcmVSZWYuY3VycmVudCA9IGhhc01vcmU7XG5cbiAgICAgICAgICAgICAgc2V0KChwcmV2aW91c0RhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudC5wYWdlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4geyBkYXRhLCBpc0xvYWRpbmc6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igd2Uga25vdyBpdCdzIGFuIGFycmF5IGhlcmVcbiAgICAgICAgICAgICAgICByZXR1cm4geyBkYXRhOiAocHJldmlvdXNEYXRhLmRhdGEgfHwgW10pPy5jb25jYXQoZGF0YSksIGlzTG9hZGluZzogZmFsc2UgfTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgKGVycm9yOiB1bmtub3duKSA9PiB7XG4gICAgICAgICAgICBoYXNNb3JlUmVmLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICAgICAgfSxcbiAgICAgICAgKSBhcyBQcm9taXNlPFVud3JhcFJldHVybjxUPj47XG4gICAgICB9XG5cbiAgICAgIHVzZVBhZ2luYXRpb25SZWYuY3VycmVudCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHByb21pc2VPclBhZ2luYXRlZFByb21pc2UudGhlbigoZGF0YTogVW53cmFwUmV0dXJuPFQ+KSA9PiB7XG4gICAgICAgIGlmIChjYWxsSWQgPT09IGxhc3RDYWxsSWQuY3VycmVudCkge1xuICAgICAgICAgIGlmIChsYXRlc3RPbkRhdGEuY3VycmVudCkge1xuICAgICAgICAgICAgbGF0ZXN0T25EYXRhLmN1cnJlbnQoZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNldCh7IGRhdGEsIGlzTG9hZGluZzogZmFsc2UgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgIH0sIGhhbmRsZUVycm9yKSBhcyBQcm9taXNlPFVud3JhcFJldHVybjxUPj47XG4gICAgfSxcbiAgICBbXG4gICAgICBsYXRlc3RPbkRhdGEsXG4gICAgICBsYXRlc3RPbkVycm9yLFxuICAgICAgbGF0ZXN0QXJncyxcbiAgICAgIGZuUmVmLFxuICAgICAgc2V0LFxuICAgICAgbGF0ZXN0Q2FsbGJhY2ssXG4gICAgICBsYXRlc3RPbldpbGxFeGVjdXRlLFxuICAgICAgcGFnaW5hdGlvbkFyZ3NSZWYsXG4gICAgICBsYXRlc3RGYWlsdXJlVG9hc3QsXG4gICAgICBhYm9ydCxcbiAgICBdLFxuICApO1xuXG4gIGxhdGVzdENhbGxiYWNrLmN1cnJlbnQgPSBjYWxsYmFjaztcblxuICBjb25zdCByZXZhbGlkYXRlID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIC8vIHJlc2V0IHRoZSBwYWdpbmF0aW9uXG4gICAgcGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudCA9IHsgcGFnZTogMCB9O1xuXG4gICAgY29uc3QgYXJncyA9IChsYXRlc3RBcmdzLmN1cnJlbnQgfHwgW10pIGFzIFBhcmFtZXRlcnM8VD47XG4gICAgcmV0dXJuIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICB9LCBbY2FsbGJhY2ssIGxhdGVzdEFyZ3NdKTtcblxuICBjb25zdCBtdXRhdGUgPSB1c2VDYWxsYmFjazxNdXRhdGVQcm9taXNlPEF3YWl0ZWQ8UmV0dXJuVHlwZTxUPj4sIHVuZGVmaW5lZD4+KFxuICAgIGFzeW5jIChhc3luY1VwZGF0ZSwgb3B0aW9ucykgPT4ge1xuICAgICAgbGV0IGRhdGFCZWZvcmVPcHRpbWlzdGljVXBkYXRlOiBBd2FpdGVkPFJldHVyblR5cGU8VD4+IHwgdW5kZWZpbmVkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKG9wdGlvbnM/Lm9wdGltaXN0aWNVcGRhdGUpIHtcbiAgICAgICAgICAvLyBjYW5jZWwgdGhlIGluLWZsaWdodCByZXF1ZXN0IHRvIG1ha2Ugc3VyZSBpdCB3b24ndCBvdmVyd3JpdGUgdGhlIG9wdGltaXN0aWMgdXBkYXRlXG4gICAgICAgICAgYWJvcnQoKTtcblxuICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yICE9PSBcImZ1bmN0aW9uXCIgJiYgb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgLy8ga2VlcCB0cmFjayBvZiB0aGUgZGF0YSBiZWZvcmUgdGhlIG9wdGltaXN0aWMgdXBkYXRlLFxuICAgICAgICAgICAgLy8gYnV0IG9ubHkgaWYgd2UgbmVlZCBpdCAoZWcuIG9ubHkgd2hlbiB3ZSB3YW50IHRvIGF1dG9tYXRpY2FsbHkgcm9sbGJhY2sgYWZ0ZXIpXG4gICAgICAgICAgICBkYXRhQmVmb3JlT3B0aW1pc3RpY1VwZGF0ZSA9IHN0cnVjdHVyZWRDbG9uZShsYXRlc3RWYWx1ZS5jdXJyZW50Py52YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IG9wdGlvbnMub3B0aW1pc3RpY1VwZGF0ZTtcbiAgICAgICAgICBzZXQoKHByZXZTdGF0ZSkgPT4gKHsgLi4ucHJldlN0YXRlLCBkYXRhOiB1cGRhdGUocHJldlN0YXRlLmRhdGEpIH0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXdhaXQgYXN5bmNVcGRhdGU7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zPy5yb2xsYmFja09uRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IG9wdGlvbnMucm9sbGJhY2tPbkVycm9yO1xuICAgICAgICAgIHNldCgocHJldlN0YXRlKSA9PiAoeyAuLi5wcmV2U3RhdGUsIGRhdGE6IHVwZGF0ZShwcmV2U3RhdGUuZGF0YSkgfSkpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnM/Lm9wdGltaXN0aWNVcGRhdGUgJiYgb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yICE9PSBmYWxzZSkge1xuICAgICAgICAgIHNldCgocHJldlN0YXRlKSA9PiAoeyAuLi5wcmV2U3RhdGUsIGRhdGE6IGRhdGFCZWZvcmVPcHRpbWlzdGljVXBkYXRlIH0pKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAob3B0aW9ucz8uc2hvdWxkUmV2YWxpZGF0ZUFmdGVyICE9PSBmYWxzZSkge1xuICAgICAgICAgIGlmIChlbnZpcm9ubWVudC5sYXVuY2hUeXBlID09PSBMYXVuY2hUeXBlLkJhY2tncm91bmQgfHwgZW52aXJvbm1lbnQuY29tbWFuZE1vZGUgPT09IFwibWVudS1iYXJcIikge1xuICAgICAgICAgICAgLy8gd2hlbiBpbiB0aGUgYmFja2dyb3VuZCBvciBpbiBhIG1lbnUgYmFyLCB3ZSBhcmUgZ29pbmcgdG8gYXdhaXQgdGhlIHJldmFsaWRhdGlvblxuICAgICAgICAgICAgLy8gdG8gbWFrZSBzdXJlIHdlIGdldCB0aGUgcmlnaHQgZGF0YSBhdCB0aGUgZW5kIG9mIHRoZSBtdXRhdGlvblxuICAgICAgICAgICAgYXdhaXQgcmV2YWxpZGF0ZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXZhbGlkYXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBbcmV2YWxpZGF0ZSwgbGF0ZXN0VmFsdWUsIHNldCwgYWJvcnRdLFxuICApO1xuXG4gIGNvbnN0IG9uTG9hZE1vcmUgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgcGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudC5wYWdlICs9IDE7XG4gICAgY29uc3QgYXJncyA9IChsYXRlc3RBcmdzLmN1cnJlbnQgfHwgW10pIGFzIFBhcmFtZXRlcnM8VD47XG4gICAgY2FsbGJhY2soLi4uYXJncyk7XG4gIH0sIFtwYWdpbmF0aW9uQXJnc1JlZiwgbGF0ZXN0QXJncywgY2FsbGJhY2tdKTtcblxuICAvLyByZXZhbGlkYXRlIHdoZW4gdGhlIGFyZ3MgY2hhbmdlXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLy8gcmVzZXQgdGhlIHBhZ2luYXRpb25cbiAgICBwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50ID0geyBwYWdlOiAwIH07XG5cbiAgICBpZiAob3B0aW9ucz8uZXhlY3V0ZSAhPT0gZmFsc2UpIHtcbiAgICAgIGNhbGxiYWNrKC4uLigoYXJncyB8fCBbXSkgYXMgUGFyYW1ldGVyczxUPikpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjYW5jZWwgdGhlIHByZXZpb3VzIHJlcXVlc3QgaWYgd2UgZG9uJ3Qgd2FudCB0byBleGVjdXRlIGFueW1vcmVcbiAgICAgIGFib3J0KCk7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3VzZURlZXBNZW1vKFthcmdzLCBvcHRpb25zPy5leGVjdXRlLCBjYWxsYmFja10pLCBsYXRlc3RBYm9ydGFibGUsIHBhZ2luYXRpb25BcmdzUmVmXSk7XG5cbiAgLy8gYWJvcnQgcmVxdWVzdCB3aGVuIHVubW91bnRpbmdcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgYWJvcnQoKTtcbiAgICB9O1xuICB9LCBbYWJvcnRdKTtcblxuICAvLyB3ZSBvbmx5IHdhbnQgdG8gc2hvdyB0aGUgbG9hZGluZyBpbmRpY2F0b3IgaWYgdGhlIHByb21pc2UgaXMgZXhlY3V0aW5nXG4gIGNvbnN0IGlzTG9hZGluZyA9IG9wdGlvbnM/LmV4ZWN1dGUgIT09IGZhbHNlID8gc3RhdGUuaXNMb2FkaW5nIDogZmFsc2U7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBsb2FkaW5nIGlzIGhhcyBzb21lIGZpeGVkIHZhbHVlIGluIHRoZSBlbnVtIHdoaWNoXG4gIGNvbnN0IHN0YXRlV2l0aExvYWRpbmdGaXhlZDogQXN5bmNTdGF0ZTxBd2FpdGVkPFJldHVyblR5cGU8VD4+PiA9IHsgLi4uc3RhdGUsIGlzTG9hZGluZyB9O1xuXG4gIGNvbnN0IHBhZ2luYXRpb24gPSB1c2VQYWdpbmF0aW9uUmVmLmN1cnJlbnRcbiAgICA/IHtcbiAgICAgICAgcGFnZVNpemU6IHBhZ2VTaXplUmVmLmN1cnJlbnQsXG4gICAgICAgIGhhc01vcmU6IGhhc01vcmVSZWYuY3VycmVudCxcbiAgICAgICAgb25Mb2FkTW9yZSxcbiAgICAgIH1cbiAgICA6IHVuZGVmaW5lZDtcblxuICByZXR1cm4geyAuLi5zdGF0ZVdpdGhMb2FkaW5nRml4ZWQsIHJldmFsaWRhdGUsIG11dGF0ZSwgcGFnaW5hdGlvbiB9O1xufVxuXG4vKiogQmluZCB0aGUgZm4gaWYgaXQncyBhIFByb21pc2UgbWV0aG9kICovXG5mdW5jdGlvbiBiaW5kUHJvbWlzZUlmTmVlZGVkPFQ+KGZuOiBUKTogVCB7XG4gIGlmIChmbiA9PT0gKFByb21pc2UuYWxsIGFzIGFueSkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoaXMgaXMgZmluZVxuICAgIHJldHVybiBmbi5iaW5kKFByb21pc2UpO1xuICB9XG4gIGlmIChmbiA9PT0gKFByb21pc2UucmFjZSBhcyBhbnkpKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0aGlzIGlzIGZpbmVcbiAgICByZXR1cm4gZm4uYmluZChQcm9taXNlKTtcbiAgfVxuICBpZiAoZm4gPT09IChQcm9taXNlLnJlc29sdmUgYXMgYW55KSkge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdGhpcyBpcyBmaW5lXG4gICAgcmV0dXJuIGZuLmJpbmQoUHJvbWlzZSBhcyBhbnkpO1xuICB9XG4gIGlmIChmbiA9PT0gKFByb21pc2UucmVqZWN0IGFzIGFueSkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoaXMgaXMgZmluZVxuICAgIHJldHVybiBmbi5iaW5kKFByb21pc2UpO1xuICB9XG4gIHJldHVybiBmbjtcbn1cbiIsICJpbXBvcnQgeyB1c2VSZWYsIHVzZU1lbW8gfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGRlcXVhbCB9IGZyb20gXCJkZXF1YWwvbGl0ZVwiO1xuXG4vKipcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgdmFsdWUgdG8gYmUgbWVtb2l6ZWQgKHVzdWFsbHkgYSBkZXBlbmRlbmN5IGxpc3QpXG4gKiBAcmV0dXJucyBhIG1lbW9pemVkIHZlcnNpb24gb2YgdGhlIHZhbHVlIGFzIGxvbmcgYXMgaXQgcmVtYWlucyBkZWVwbHkgZXF1YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZURlZXBNZW1vPFQ+KHZhbHVlOiBUKSB7XG4gIGNvbnN0IHJlZiA9IHVzZVJlZjxUPih2YWx1ZSk7XG4gIGNvbnN0IHNpZ25hbFJlZiA9IHVzZVJlZjxudW1iZXI+KDApO1xuXG4gIGlmICghZGVxdWFsKHZhbHVlLCByZWYuY3VycmVudCkpIHtcbiAgICByZWYuY3VycmVudCA9IHZhbHVlO1xuICAgIHNpZ25hbFJlZi5jdXJyZW50ICs9IDE7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIHJldHVybiB1c2VNZW1vKCgpID0+IHJlZi5jdXJyZW50LCBbc2lnbmFsUmVmLmN1cnJlbnRdKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsYXRlc3Qgc3RhdGUuXG4gKlxuICogVGhpcyBpcyBtb3N0bHkgdXNlZnVsIHRvIGdldCBhY2Nlc3MgdG8gdGhlIGxhdGVzdCB2YWx1ZSBvZiBzb21lIHByb3BzIG9yIHN0YXRlIGluc2lkZSBhbiBhc3luY2hyb25vdXMgY2FsbGJhY2ssIGluc3RlYWQgb2YgdGhhdCB2YWx1ZSBhdCB0aGUgdGltZSB0aGUgY2FsbGJhY2sgd2FzIGNyZWF0ZWQgZnJvbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUxhdGVzdDxUPih2YWx1ZTogVCk6IHsgcmVhZG9ubHkgY3VycmVudDogVCB9IHtcbiAgY29uc3QgcmVmID0gdXNlUmVmKHZhbHVlKTtcbiAgcmVmLmN1cnJlbnQgPSB2YWx1ZTtcbiAgcmV0dXJuIHJlZjtcbn1cbiIsICJpbXBvcnQgKiBhcyBmcyBmcm9tIFwibm9kZTpmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBDbGlwYm9hcmQsIGVudmlyb25tZW50LCBvcGVuLCBUb2FzdCwgc2hvd1RvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuXG4vKipcbiAqIFNob3dzIGEgZmFpbHVyZSBUb2FzdCBmb3IgYSBnaXZlbiBFcnJvci5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgc2hvd0hVRCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHJ1bkFwcGxlU2NyaXB0LCBzaG93RmFpbHVyZVRvYXN0IH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKCkge1xuICogICB0cnkge1xuICogICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJ1bkFwcGxlU2NyaXB0KFxuICogICAgICAgYFxuICogICAgICAgb24gcnVuIGFyZ3ZcbiAqICAgICAgICAgcmV0dXJuIFwiaGVsbG8sIFwiICYgaXRlbSAxIG9mIGFyZ3YgJiBcIi5cIlxuICogICAgICAgZW5kIHJ1blxuICogICAgICAgYCxcbiAqICAgICAgIFtcIndvcmxkXCJdXG4gKiAgICAgKTtcbiAqICAgICBhd2FpdCBzaG93SFVEKHJlcyk7XG4gKiAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgICAgc2hvd0ZhaWx1cmVUb2FzdChlcnJvciwgeyB0aXRsZTogXCJDb3VsZCBub3QgcnVuIEFwcGxlU2NyaXB0XCIgfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvd0ZhaWx1cmVUb2FzdChcbiAgZXJyb3I6IHVua25vd24sXG4gIG9wdGlvbnM/OiBQYXJ0aWFsPFBpY2s8VG9hc3QuT3B0aW9ucywgXCJ0aXRsZVwiIHwgXCJwcmltYXJ5QWN0aW9uXCIgfCBcIm1lc3NhZ2VcIj4+LFxuKSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gIHJldHVybiBzaG93VG9hc3Qoe1xuICAgIHN0eWxlOiBUb2FzdC5TdHlsZS5GYWlsdXJlLFxuICAgIHRpdGxlOiBvcHRpb25zPy50aXRsZSA/PyBcIlNvbWV0aGluZyB3ZW50IHdyb25nXCIsXG4gICAgbWVzc2FnZTogb3B0aW9ucz8ubWVzc2FnZSA/PyBtZXNzYWdlLFxuICAgIHByaW1hcnlBY3Rpb246IG9wdGlvbnM/LnByaW1hcnlBY3Rpb24gPz8gaGFuZGxlRXJyb3JUb2FzdEFjdGlvbihlcnJvciksXG4gICAgc2Vjb25kYXJ5QWN0aW9uOiBvcHRpb25zPy5wcmltYXJ5QWN0aW9uID8gaGFuZGxlRXJyb3JUb2FzdEFjdGlvbihlcnJvcikgOiB1bmRlZmluZWQsXG4gIH0pO1xufVxuXG5jb25zdCBoYW5kbGVFcnJvclRvYXN0QWN0aW9uID0gKGVycm9yOiB1bmtub3duKTogVG9hc3QuQWN0aW9uT3B0aW9ucyA9PiB7XG4gIGxldCBwcml2YXRlRXh0ZW5zaW9uID0gdHJ1ZTtcbiAgbGV0IHRpdGxlID0gXCJbRXh0ZW5zaW9uIE5hbWVdLi4uXCI7XG4gIGxldCBleHRlbnNpb25VUkwgPSBcIlwiO1xuICB0cnkge1xuICAgIGNvbnN0IHBhY2thZ2VKU09OID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKGVudmlyb25tZW50LmFzc2V0c1BhdGgsIFwiLi5cIiwgXCJwYWNrYWdlLmpzb25cIiksIFwidXRmOFwiKSk7XG4gICAgdGl0bGUgPSBgWyR7cGFja2FnZUpTT04udGl0bGV9XS4uLmA7XG4gICAgZXh0ZW5zaW9uVVJMID0gYGh0dHBzOi8vcmF5Y2FzdC5jb20vJHtwYWNrYWdlSlNPTi5vd25lciB8fCBwYWNrYWdlSlNPTi5hdXRob3J9LyR7cGFja2FnZUpTT04ubmFtZX1gO1xuICAgIGlmICghcGFja2FnZUpTT04ub3duZXIgfHwgcGFja2FnZUpTT04uYWNjZXNzID09PSBcInB1YmxpY1wiKSB7XG4gICAgICBwcml2YXRlRXh0ZW5zaW9uID0gZmFsc2U7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBuby1vcFxuICB9XG5cbiAgLy8gaWYgaXQncyBhIHByaXZhdGUgZXh0ZW5zaW9uLCB3ZSBjYW4ndCBjb25zdHJ1Y3QgdGhlIFVSTCB0byByZXBvcnQgdGhlIGVycm9yXG4gIC8vIHNvIHdlIGZhbGxiYWNrIHRvIGNvcHlpbmcgdGhlIGVycm9yIHRvIHRoZSBjbGlwYm9hcmRcbiAgY29uc3QgZmFsbGJhY2sgPSBlbnZpcm9ubWVudC5pc0RldmVsb3BtZW50IHx8IHByaXZhdGVFeHRlbnNpb247XG5cbiAgY29uc3Qgc3RhY2sgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3I/LnN0YWNrIHx8IGVycm9yPy5tZXNzYWdlIHx8IFwiXCIgOiBTdHJpbmcoZXJyb3IpO1xuXG4gIHJldHVybiB7XG4gICAgdGl0bGU6IGZhbGxiYWNrID8gXCJDb3B5IExvZ3NcIiA6IFwiUmVwb3J0IEVycm9yXCIsXG4gICAgb25BY3Rpb24odG9hc3QpIHtcbiAgICAgIHRvYXN0LmhpZGUoKTtcbiAgICAgIGlmIChmYWxsYmFjaykge1xuICAgICAgICBDbGlwYm9hcmQuY29weShzdGFjayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcGVuKFxuICAgICAgICAgIGBodHRwczovL2dpdGh1Yi5jb20vcmF5Y2FzdC9leHRlbnNpb25zL2lzc3Vlcy9uZXc/JmxhYmVscz1leHRlbnNpb24lMkNidWcmdGVtcGxhdGU9ZXh0ZW5zaW9uX2J1Z19yZXBvcnQueW1sJnRpdGxlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgKX0mZXh0ZW5zaW9uLXVybD0ke2VuY29kZVVSSShleHRlbnNpb25VUkwpfSZkZXNjcmlwdGlvbj0ke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICAgIGAjIyMjIEVycm9yOlxuXFxgXFxgXFxgXG4ke3N0YWNrfVxuXFxgXFxgXFxgXG5gLFxuICAgICAgICAgICl9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xufTtcbiIsICJpbXBvcnQgeyB1c2VDYWxsYmFjaywgRGlzcGF0Y2gsIFNldFN0YXRlQWN0aW9uLCB1c2VTeW5jRXh0ZXJuYWxTdG9yZSwgdXNlTWVtbyB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQ2FjaGUgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyB1c2VMYXRlc3QgfSBmcm9tIFwiLi91c2VMYXRlc3RcIjtcbmltcG9ydCB7IHJlcGxhY2VyLCByZXZpdmVyIH0gZnJvbSBcIi4vaGVscGVyc1wiO1xuXG5jb25zdCByb290Q2FjaGUgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sKFwiY2FjaGUgd2l0aG91dCBuYW1lc3BhY2VcIik7XG5jb25zdCBjYWNoZU1hcCA9IC8qICNfX1BVUkVfXyAqLyBuZXcgTWFwPHN0cmluZyB8IHN5bWJvbCwgQ2FjaGU+KCk7XG5cbi8qKlxuICogUmV0dXJucyBhIHN0YXRlZnVsIHZhbHVlLCBhbmQgYSBmdW5jdGlvbiB0byB1cGRhdGUgaXQuIFRoZSB2YWx1ZSB3aWxsIGJlIGtlcHQgYmV0d2VlbiBjb21tYW5kIHJ1bnMuXG4gKlxuICogQHJlbWFyayBUaGUgdmFsdWUgbmVlZHMgdG8gYmUgSlNPTiBzZXJpYWxpemFibGUuXG4gKlxuICogQHBhcmFtIGtleSAtIFRoZSB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgc3RhdGUuIFRoaXMgY2FuIGJlIHVzZWQgdG8gc2hhcmUgdGhlIHN0YXRlIGFjcm9zcyBjb21wb25lbnRzIGFuZC9vciBjb21tYW5kcy5cbiAqIEBwYXJhbSBpbml0aWFsU3RhdGUgLSBUaGUgaW5pdGlhbCB2YWx1ZSBvZiB0aGUgc3RhdGUgaWYgdGhlcmUgYXJlbid0IGFueSBpbiB0aGUgQ2FjaGUgeWV0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQ2FjaGVkU3RhdGU8VD4oXG4gIGtleTogc3RyaW5nLFxuICBpbml0aWFsU3RhdGU6IFQsXG4gIGNvbmZpZz86IHsgY2FjaGVOYW1lc3BhY2U/OiBzdHJpbmcgfSxcbik6IFtULCBEaXNwYXRjaDxTZXRTdGF0ZUFjdGlvbjxUPj5dO1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUNhY2hlZFN0YXRlPFQgPSB1bmRlZmluZWQ+KGtleTogc3RyaW5nKTogW1QgfCB1bmRlZmluZWQsIERpc3BhdGNoPFNldFN0YXRlQWN0aW9uPFQgfCB1bmRlZmluZWQ+Pl07XG5leHBvcnQgZnVuY3Rpb24gdXNlQ2FjaGVkU3RhdGU8VD4oXG4gIGtleTogc3RyaW5nLFxuICBpbml0aWFsU3RhdGU/OiBULFxuICBjb25maWc/OiB7IGNhY2hlTmFtZXNwYWNlPzogc3RyaW5nIH0sXG4pOiBbVCwgRGlzcGF0Y2g8U2V0U3RhdGVBY3Rpb248VD4+XSB7XG4gIGNvbnN0IGNhY2hlS2V5ID0gY29uZmlnPy5jYWNoZU5hbWVzcGFjZSB8fCByb290Q2FjaGU7XG4gIGNvbnN0IGNhY2hlID1cbiAgICBjYWNoZU1hcC5nZXQoY2FjaGVLZXkpIHx8IGNhY2hlTWFwLnNldChjYWNoZUtleSwgbmV3IENhY2hlKHsgbmFtZXNwYWNlOiBjb25maWc/LmNhY2hlTmFtZXNwYWNlIH0pKS5nZXQoY2FjaGVLZXkpO1xuXG4gIGlmICghY2FjaGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGNhY2hlXCIpO1xuICB9XG5cbiAgY29uc3Qga2V5UmVmID0gdXNlTGF0ZXN0KGtleSk7XG4gIGNvbnN0IGluaXRpYWxWYWx1ZVJlZiA9IHVzZUxhdGVzdChpbml0aWFsU3RhdGUpO1xuXG4gIGNvbnN0IGNhY2hlZFN0YXRlID0gdXNlU3luY0V4dGVybmFsU3RvcmUoY2FjaGUuc3Vic2NyaWJlLCAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBjYWNoZS5nZXQoa2V5UmVmLmN1cnJlbnQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQ291bGQgbm90IGdldCBDYWNoZSBkYXRhOlwiLCBlcnJvcik7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3Qgc3RhdGUgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAodHlwZW9mIGNhY2hlZFN0YXRlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAoY2FjaGVkU3RhdGUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNhY2hlZFN0YXRlLCByZXZpdmVyKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyB0aGUgZGF0YSBnb3QgY29ycnVwdGVkIHNvbWVob3dcbiAgICAgICAgY29uc29sZS53YXJuKFwiVGhlIGNhY2hlZCBkYXRhIGlzIGNvcnJ1cHRlZFwiLCBlcnIpO1xuICAgICAgICByZXR1cm4gaW5pdGlhbFZhbHVlUmVmLmN1cnJlbnQ7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbml0aWFsVmFsdWVSZWYuY3VycmVudDtcbiAgICB9XG4gIH0sIFtjYWNoZWRTdGF0ZSwgaW5pdGlhbFZhbHVlUmVmXSk7XG5cbiAgY29uc3Qgc3RhdGVSZWYgPSB1c2VMYXRlc3Qoc3RhdGUpO1xuXG4gIGNvbnN0IHNldFN0YXRlQW5kQ2FjaGUgPSB1c2VDYWxsYmFjayhcbiAgICAodXBkYXRlcjogU2V0U3RhdGVBY3Rpb248VD4pID0+IHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVFMgc3RydWdnbGVzIHRvIGluZmVyIHRoZSB0eXBlcyBhcyBUIGNvdWxkIHBvdGVudGlhbGx5IGJlIGEgZnVuY3Rpb25cbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdHlwZW9mIHVwZGF0ZXIgPT09IFwiZnVuY3Rpb25cIiA/IHVwZGF0ZXIoc3RhdGVSZWYuY3VycmVudCkgOiB1cGRhdGVyO1xuICAgICAgaWYgKHR5cGVvZiBuZXdWYWx1ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBjYWNoZS5zZXQoa2V5UmVmLmN1cnJlbnQsIFwidW5kZWZpbmVkXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc3RyaW5naWZpZWRWYWx1ZSA9IEpTT04uc3RyaW5naWZ5KG5ld1ZhbHVlLCByZXBsYWNlcik7XG4gICAgICAgIGNhY2hlLnNldChrZXlSZWYuY3VycmVudCwgc3RyaW5naWZpZWRWYWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3VmFsdWU7XG4gICAgfSxcbiAgICBbY2FjaGUsIGtleVJlZiwgc3RhdGVSZWZdLFxuICApO1xuXG4gIHJldHVybiBbc3RhdGUsIHNldFN0YXRlQW5kQ2FjaGVdO1xufVxuIiwgImltcG9ydCBjcnlwdG8gZnJvbSBcIm5vZGU6Y3J5cHRvXCI7XG5pbXBvcnQgeyB0eXBlSGFzaGVyIH0gZnJvbSBcIi4vdmVuZG9ycy90eXBlLWhhc2hlclwiO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VyKHRoaXM6IGFueSwga2V5OiBzdHJpbmcsIF92YWx1ZTogdW5rbm93bikge1xuICBjb25zdCB2YWx1ZSA9IHRoaXNba2V5XTtcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBgX19yYXljYXN0X2NhY2hlZF9kYXRlX18ke3ZhbHVlLnRvSVNPU3RyaW5nKCl9YDtcbiAgfVxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbHVlKSkge1xuICAgIHJldHVybiBgX19yYXljYXN0X2NhY2hlZF9idWZmZXJfXyR7dmFsdWUudG9TdHJpbmcoXCJiYXNlNjRcIil9YDtcbiAgfVxuICByZXR1cm4gX3ZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2aXZlcihfa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgJiYgdmFsdWUuc3RhcnRzV2l0aChcIl9fcmF5Y2FzdF9jYWNoZWRfZGF0ZV9fXCIpKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHZhbHVlLnJlcGxhY2UoXCJfX3JheWNhc3RfY2FjaGVkX2RhdGVfX1wiLCBcIlwiKSk7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiB2YWx1ZS5zdGFydHNXaXRoKFwiX19yYXljYXN0X2NhY2hlZF9idWZmZXJfX1wiKSkge1xuICAgIHJldHVybiBCdWZmZXIuZnJvbSh2YWx1ZS5yZXBsYWNlKFwiX19yYXljYXN0X2NhY2hlZF9idWZmZXJfX1wiLCBcIlwiKSwgXCJiYXNlNjRcIik7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzaChvYmplY3Q6IGFueSkge1xuICBjb25zdCBoYXNoaW5nU3RyZWFtID0gY3J5cHRvLmNyZWF0ZUhhc2goXCJzaGExXCIpO1xuICBjb25zdCBoYXNoZXIgPSB0eXBlSGFzaGVyKGhhc2hpbmdTdHJlYW0pO1xuICBoYXNoZXIuZGlzcGF0Y2gob2JqZWN0KTtcblxuICByZXR1cm4gaGFzaGluZ1N0cmVhbS5kaWdlc3QoXCJoZXhcIik7XG59XG4iLCAiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50ICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhcyAqL1xuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSAqL1xuaW1wb3J0IGNyeXB0byBmcm9tIFwibm9kZTpjcnlwdG9cIjtcblxuLyoqIENoZWNrIGlmIHRoZSBnaXZlbiBmdW5jdGlvbiBpcyBhIG5hdGl2ZSBmdW5jdGlvbiAqL1xuZnVuY3Rpb24gaXNOYXRpdmVGdW5jdGlvbihmOiBhbnkpIHtcbiAgaWYgKHR5cGVvZiBmICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgZXhwID0gL15mdW5jdGlvblxccytcXHcqXFxzKlxcKFxccypcXClcXHMqe1xccytcXFtuYXRpdmUgY29kZVxcXVxccyt9JC9pO1xuICByZXR1cm4gZXhwLmV4ZWMoRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZikpICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBoYXNoUmVwbGFjZXIodmFsdWU6IGFueSk6IHN0cmluZyB7XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcykge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVIYXNoZXIoXG4gIHdyaXRlVG86XG4gICAgfCBjcnlwdG8uSGFzaFxuICAgIHwge1xuICAgICAgICBidWY6IHN0cmluZztcbiAgICAgICAgd3JpdGU6IChiOiBhbnkpID0+IHZvaWQ7XG4gICAgICAgIGVuZDogKGI6IGFueSkgPT4gdm9pZDtcbiAgICAgICAgcmVhZDogKCkgPT4gc3RyaW5nO1xuICAgICAgfSxcbiAgY29udGV4dDogYW55W10gPSBbXSxcbikge1xuICBmdW5jdGlvbiB3cml0ZShzdHI6IHN0cmluZykge1xuICAgIGlmIChcInVwZGF0ZVwiIGluIHdyaXRlVG8pIHtcbiAgICAgIHJldHVybiB3cml0ZVRvLnVwZGF0ZShzdHIsIFwidXRmOFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHdyaXRlVG8ud3JpdGUoc3RyKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGRpc3BhdGNoOiBmdW5jdGlvbiAodmFsdWU6IGFueSkge1xuICAgICAgdmFsdWUgPSBoYXNoUmVwbGFjZXIodmFsdWUpO1xuXG4gICAgICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHRoaXNbXCJfbnVsbFwiXSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzW1wiX1wiICsgdHlwZV0odmFsdWUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgX29iamVjdDogZnVuY3Rpb24gKG9iamVjdDogYW55KSB7XG4gICAgICBjb25zdCBwYXR0ZXJuID0gL1xcW29iamVjdCAoLiopXFxdL2k7XG4gICAgICBjb25zdCBvYmpTdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KTtcbiAgICAgIGxldCBvYmpUeXBlID0gcGF0dGVybi5leGVjKG9ialN0cmluZyk/LlsxXSA/PyBcInVua25vd246W1wiICsgb2JqU3RyaW5nICsgXCJdXCI7XG4gICAgICBvYmpUeXBlID0gb2JqVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICBsZXQgb2JqZWN0TnVtYmVyID0gbnVsbCBhcyBhbnk7XG5cbiAgICAgIGlmICgob2JqZWN0TnVtYmVyID0gY29udGV4dC5pbmRleE9mKG9iamVjdCkpID49IDApIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaChcIltDSVJDVUxBUjpcIiArIG9iamVjdE51bWJlciArIFwiXVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGV4dC5wdXNoKG9iamVjdCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqZWN0KSkge1xuICAgICAgICB3cml0ZShcImJ1ZmZlcjpcIik7XG4gICAgICAgIHJldHVybiB3cml0ZShvYmplY3QudG9TdHJpbmcoXCJ1dGY4XCIpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9ialR5cGUgIT09IFwib2JqZWN0XCIgJiYgb2JqVHlwZSAhPT0gXCJmdW5jdGlvblwiICYmIG9ialR5cGUgIT09IFwiYXN5bmNmdW5jdGlvblwiKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgaWYgKHRoaXNbXCJfXCIgKyBvYmpUeXBlXSkge1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICB0aGlzW1wiX1wiICsgb2JqVHlwZV0ob2JqZWN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gb2JqZWN0IHR5cGUgXCInICsgb2JqVHlwZSArICdcIicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7XG4gICAgICAgIGtleXMgPSBrZXlzLnNvcnQoKTtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRvIGluY29ycG9yYXRlIHNwZWNpYWwgcHJvcGVydGllcywgc29cbiAgICAgICAgLy8gVHlwZXMgd2l0aCBkaWZmZXJlbnQgcHJvdG90eXBlcyB3aWxsIHByb2R1Y2VcbiAgICAgICAgLy8gYSBkaWZmZXJlbnQgaGFzaCBhbmQgb2JqZWN0cyBkZXJpdmVkIGZyb21cbiAgICAgICAgLy8gZGlmZmVyZW50IGZ1bmN0aW9ucyAoYG5ldyBGb29gLCBgbmV3IEJhcmApIHdpbGxcbiAgICAgICAgLy8gcHJvZHVjZSBkaWZmZXJlbnQgaGFzaGVzLlxuICAgICAgICAvLyBXZSBuZXZlciBkbyB0aGlzIGZvciBuYXRpdmUgZnVuY3Rpb25zIHNpbmNlIHNvbWVcbiAgICAgICAgLy8gc2VlbSB0byBicmVhayBiZWNhdXNlIG9mIHRoYXQuXG4gICAgICAgIGlmICghaXNOYXRpdmVGdW5jdGlvbihvYmplY3QpKSB7XG4gICAgICAgICAga2V5cy5zcGxpY2UoMCwgMCwgXCJwcm90b3R5cGVcIiwgXCJfX3Byb3RvX19cIiwgXCJjb25zdHJ1Y3RvclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdyaXRlKFwib2JqZWN0OlwiICsga2V5cy5sZW5ndGggKyBcIjpcIik7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4ga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICBzZWxmLmRpc3BhdGNoKGtleSk7XG4gICAgICAgICAgd3JpdGUoXCI6XCIpO1xuICAgICAgICAgIHNlbGYuZGlzcGF0Y2gob2JqZWN0W2tleV0pO1xuICAgICAgICAgIHdyaXRlKFwiLFwiKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBfYXJyYXk6IGZ1bmN0aW9uIChhcnI6IGFueVtdLCB1bm9yZGVyZWQ6IGJvb2xlYW4pIHtcbiAgICAgIHVub3JkZXJlZCA9IHR5cGVvZiB1bm9yZGVyZWQgIT09IFwidW5kZWZpbmVkXCIgPyB1bm9yZGVyZWQgOiBmYWxzZTsgLy8gZGVmYXVsdCB0byBvcHRpb25zLnVub3JkZXJlZEFycmF5c1xuXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHdyaXRlKFwiYXJyYXk6XCIgKyBhcnIubGVuZ3RoICsgXCI6XCIpO1xuICAgICAgaWYgKCF1bm9yZGVyZWQgfHwgYXJyLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeTogYW55KSB7XG4gICAgICAgICAgc2VsZi5kaXNwYXRjaChlbnRyeSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIHRoZSB1bm9yZGVyZWQgY2FzZSBpcyBhIGxpdHRsZSBtb3JlIGNvbXBsaWNhdGVkOlxuICAgICAgLy8gc2luY2UgdGhlcmUgaXMgbm8gY2Fub25pY2FsIG9yZGVyaW5nIG9uIG9iamVjdHMsXG4gICAgICAvLyBpLmUuIHthOjF9IDwge2E6Mn0gYW5kIHthOjF9ID4ge2E6Mn0gYXJlIGJvdGggZmFsc2UsXG4gICAgICAvLyB3ZSBmaXJzdCBzZXJpYWxpemUgZWFjaCBlbnRyeSB1c2luZyBhIFBhc3NUaHJvdWdoIHN0cmVhbVxuICAgICAgLy8gYmVmb3JlIHNvcnRpbmcuXG4gICAgICAvLyBhbHNvOiB3ZSBjYW7igJl0IHVzZSB0aGUgc2FtZSBjb250ZXh0IGFycmF5IGZvciBhbGwgZW50cmllc1xuICAgICAgLy8gc2luY2UgdGhlIG9yZGVyIG9mIGhhc2hpbmcgc2hvdWxkICpub3QqIG1hdHRlci4gaW5zdGVhZCxcbiAgICAgIC8vIHdlIGtlZXAgdHJhY2sgb2YgdGhlIGFkZGl0aW9ucyB0byBhIGNvcHkgb2YgdGhlIGNvbnRleHQgYXJyYXlcbiAgICAgIC8vIGFuZCBhZGQgYWxsIG9mIHRoZW0gdG8gdGhlIGdsb2JhbCBjb250ZXh0IGFycmF5IHdoZW4gd2XigJlyZSBkb25lXG4gICAgICBsZXQgY29udGV4dEFkZGl0aW9uczogYW55W10gPSBbXTtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBhcnIubWFwKGZ1bmN0aW9uIChlbnRyeTogYW55KSB7XG4gICAgICAgIGNvbnN0IHN0cm0gPSBQYXNzVGhyb3VnaCgpO1xuICAgICAgICBjb25zdCBsb2NhbENvbnRleHQgPSBjb250ZXh0LnNsaWNlKCk7IC8vIG1ha2UgY29weVxuICAgICAgICBjb25zdCBoYXNoZXIgPSB0eXBlSGFzaGVyKHN0cm0sIGxvY2FsQ29udGV4dCk7XG4gICAgICAgIGhhc2hlci5kaXNwYXRjaChlbnRyeSk7XG4gICAgICAgIC8vIHRha2Ugb25seSB3aGF0IHdhcyBhZGRlZCB0byBsb2NhbENvbnRleHQgYW5kIGFwcGVuZCBpdCB0byBjb250ZXh0QWRkaXRpb25zXG4gICAgICAgIGNvbnRleHRBZGRpdGlvbnMgPSBjb250ZXh0QWRkaXRpb25zLmNvbmNhdChsb2NhbENvbnRleHQuc2xpY2UoY29udGV4dC5sZW5ndGgpKTtcbiAgICAgICAgcmV0dXJuIHN0cm0ucmVhZCgpLnRvU3RyaW5nKCk7XG4gICAgICB9KTtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNvbmNhdChjb250ZXh0QWRkaXRpb25zKTtcbiAgICAgIGVudHJpZXMuc29ydCgpO1xuICAgICAgdGhpcy5fYXJyYXkoZW50cmllcywgZmFsc2UpO1xuICAgIH0sXG4gICAgX2RhdGU6IGZ1bmN0aW9uIChkYXRlOiBEYXRlKSB7XG4gICAgICB3cml0ZShcImRhdGU6XCIgKyBkYXRlLnRvSlNPTigpKTtcbiAgICB9LFxuICAgIF9zeW1ib2w6IGZ1bmN0aW9uIChzeW06IHN5bWJvbCkge1xuICAgICAgd3JpdGUoXCJzeW1ib2w6XCIgKyBzeW0udG9TdHJpbmcoKSk7XG4gICAgfSxcbiAgICBfZXJyb3I6IGZ1bmN0aW9uIChlcnI6IEVycm9yKSB7XG4gICAgICB3cml0ZShcImVycm9yOlwiICsgZXJyLnRvU3RyaW5nKCkpO1xuICAgIH0sXG4gICAgX2Jvb2xlYW46IGZ1bmN0aW9uIChib29sOiBib29sZWFuKSB7XG4gICAgICB3cml0ZShcImJvb2w6XCIgKyBib29sLnRvU3RyaW5nKCkpO1xuICAgIH0sXG4gICAgX3N0cmluZzogZnVuY3Rpb24gKHN0cmluZzogc3RyaW5nKSB7XG4gICAgICB3cml0ZShcInN0cmluZzpcIiArIHN0cmluZy5sZW5ndGggKyBcIjpcIik7XG4gICAgICB3cml0ZShzdHJpbmcudG9TdHJpbmcoKSk7XG4gICAgfSxcbiAgICBfZnVuY3Rpb246IGZ1bmN0aW9uIChmbjogYW55KSB7XG4gICAgICB3cml0ZShcImZuOlwiKTtcbiAgICAgIGlmIChpc05hdGl2ZUZ1bmN0aW9uKGZuKSkge1xuICAgICAgICB0aGlzLmRpc3BhdGNoKFwiW25hdGl2ZV1cIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRpc3BhdGNoKGZuLnRvU3RyaW5nKCkpO1xuICAgICAgfVxuXG4gICAgICAvLyBNYWtlIHN1cmUgd2UgY2FuIHN0aWxsIGRpc3Rpbmd1aXNoIG5hdGl2ZSBmdW5jdGlvbnNcbiAgICAgIC8vIGJ5IHRoZWlyIG5hbWUsIG90aGVyd2lzZSBTdHJpbmcgYW5kIEZ1bmN0aW9uIHdpbGxcbiAgICAgIC8vIGhhdmUgdGhlIHNhbWUgaGFzaFxuICAgICAgdGhpcy5kaXNwYXRjaChcImZ1bmN0aW9uLW5hbWU6XCIgKyBTdHJpbmcoZm4ubmFtZSkpO1xuXG4gICAgICB0aGlzLl9vYmplY3QoZm4pO1xuICAgIH0sXG4gICAgX251bWJlcjogZnVuY3Rpb24gKG51bWJlcjogbnVtYmVyKSB7XG4gICAgICB3cml0ZShcIm51bWJlcjpcIiArIG51bWJlci50b1N0cmluZygpKTtcbiAgICB9LFxuICAgIF94bWw6IGZ1bmN0aW9uICh4bWw6IGFueSkge1xuICAgICAgd3JpdGUoXCJ4bWw6XCIgKyB4bWwudG9TdHJpbmcoKSk7XG4gICAgfSxcbiAgICBfbnVsbDogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJOdWxsXCIpO1xuICAgIH0sXG4gICAgX3VuZGVmaW5lZDogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJVbmRlZmluZWRcIik7XG4gICAgfSxcbiAgICBfcmVnZXhwOiBmdW5jdGlvbiAocmVnZXg6IFJlZ0V4cCkge1xuICAgICAgd3JpdGUoXCJyZWdleDpcIiArIHJlZ2V4LnRvU3RyaW5nKCkpO1xuICAgIH0sXG4gICAgX3VpbnQ4YXJyYXk6IGZ1bmN0aW9uIChhcnI6IFVpbnQ4QXJyYXkpIHtcbiAgICAgIHdyaXRlKFwidWludDhhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX3VpbnQ4Y2xhbXBlZGFycmF5OiBmdW5jdGlvbiAoYXJyOiBVaW50OENsYW1wZWRBcnJheSkge1xuICAgICAgd3JpdGUoXCJ1aW50OGNsYW1wZWRhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX2ludDhhcnJheTogZnVuY3Rpb24gKGFycjogSW50OEFycmF5KSB7XG4gICAgICB3cml0ZShcImludDhhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX3VpbnQxNmFycmF5OiBmdW5jdGlvbiAoYXJyOiBVaW50MTZBcnJheSkge1xuICAgICAgd3JpdGUoXCJ1aW50MTZhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX2ludDE2YXJyYXk6IGZ1bmN0aW9uIChhcnI6IEludDE2QXJyYXkpIHtcbiAgICAgIHdyaXRlKFwiaW50MTZhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX3VpbnQzMmFycmF5OiBmdW5jdGlvbiAoYXJyOiBVaW50MzJBcnJheSkge1xuICAgICAgd3JpdGUoXCJ1aW50MzJhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX2ludDMyYXJyYXk6IGZ1bmN0aW9uIChhcnI6IEludDMyQXJyYXkpIHtcbiAgICAgIHdyaXRlKFwiaW50MzJhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX2Zsb2F0MzJhcnJheTogZnVuY3Rpb24gKGFycjogRmxvYXQzMkFycmF5KSB7XG4gICAgICB3cml0ZShcImZsb2F0MzJhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX2Zsb2F0NjRhcnJheTogZnVuY3Rpb24gKGFycjogRmxvYXQ2NEFycmF5KSB7XG4gICAgICB3cml0ZShcImZsb2F0NjRhcnJheTpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycikpO1xuICAgIH0sXG4gICAgX2FycmF5YnVmZmVyOiBmdW5jdGlvbiAoYXJyOiBBcnJheUJ1ZmZlcikge1xuICAgICAgd3JpdGUoXCJhcnJheWJ1ZmZlcjpcIik7XG4gICAgICB0aGlzLmRpc3BhdGNoKG5ldyBVaW50OEFycmF5KGFycikpO1xuICAgIH0sXG4gICAgX3VybDogZnVuY3Rpb24gKHVybDogVVJMKSB7XG4gICAgICB3cml0ZShcInVybDpcIiArIHVybC50b1N0cmluZygpKTtcbiAgICB9LFxuICAgIF9tYXA6IGZ1bmN0aW9uIChtYXA6IE1hcDxhbnksIGFueT4pIHtcbiAgICAgIHdyaXRlKFwibWFwOlwiKTtcbiAgICAgIGNvbnN0IGFyciA9IEFycmF5LmZyb20obWFwKTtcbiAgICAgIHRoaXMuX2FycmF5KGFyciwgdHJ1ZSk7XG4gICAgfSxcbiAgICBfc2V0OiBmdW5jdGlvbiAoc2V0OiBTZXQ8YW55Pikge1xuICAgICAgd3JpdGUoXCJzZXQ6XCIpO1xuICAgICAgY29uc3QgYXJyID0gQXJyYXkuZnJvbShzZXQpO1xuICAgICAgdGhpcy5fYXJyYXkoYXJyLCB0cnVlKTtcbiAgICB9LFxuICAgIF9maWxlOiBmdW5jdGlvbiAoZmlsZTogYW55KSB7XG4gICAgICB3cml0ZShcImZpbGU6XCIpO1xuICAgICAgdGhpcy5kaXNwYXRjaChbZmlsZS5uYW1lLCBmaWxlLnNpemUsIGZpbGUudHlwZSwgZmlsZS5sYXN0TW9kaWZpZWRdKTtcbiAgICB9LFxuICAgIF9ibG9iOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgXCJIYXNoaW5nIEJsb2Igb2JqZWN0cyBpcyBjdXJyZW50bHkgbm90IHN1cHBvcnRlZFxcblwiICtcbiAgICAgICAgICBcIihzZWUgaHR0cHM6Ly9naXRodWIuY29tL3B1bGVvcy9vYmplY3QtaGFzaC9pc3N1ZXMvMjYpXFxuXCIgK1xuICAgICAgICAgICdVc2UgXCJvcHRpb25zLnJlcGxhY2VyXCIgb3IgXCJvcHRpb25zLmlnbm9yZVVua25vd25cIlxcbicsXG4gICAgICApO1xuICAgIH0sXG4gICAgX2RvbXdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJkb213aW5kb3dcIik7XG4gICAgfSxcbiAgICBfYmlnaW50OiBmdW5jdGlvbiAobnVtYmVyOiBiaWdpbnQpIHtcbiAgICAgIHdyaXRlKFwiYmlnaW50OlwiICsgbnVtYmVyLnRvU3RyaW5nKCkpO1xuICAgIH0sXG4gICAgLyogTm9kZS5qcyBzdGFuZGFyZCBuYXRpdmUgb2JqZWN0cyAqL1xuICAgIF9wcm9jZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcInByb2Nlc3NcIik7XG4gICAgfSxcbiAgICBfdGltZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwidGltZXJcIik7XG4gICAgfSxcbiAgICBfcGlwZTogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJwaXBlXCIpO1xuICAgIH0sXG4gICAgX3RjcDogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJ0Y3BcIik7XG4gICAgfSxcbiAgICBfdWRwOiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcInVkcFwiKTtcbiAgICB9LFxuICAgIF90dHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwidHR5XCIpO1xuICAgIH0sXG4gICAgX3N0YXR3YXRjaGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcInN0YXR3YXRjaGVyXCIpO1xuICAgIH0sXG4gICAgX3NlY3VyZWNvbnRleHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwic2VjdXJlY29udGV4dFwiKTtcbiAgICB9LFxuICAgIF9jb25uZWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcImNvbm5lY3Rpb25cIik7XG4gICAgfSxcbiAgICBfemxpYjogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJ6bGliXCIpO1xuICAgIH0sXG4gICAgX2NvbnRleHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwiY29udGV4dFwiKTtcbiAgICB9LFxuICAgIF9ub2Rlc2NyaXB0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcIm5vZGVzY3JpcHRcIik7XG4gICAgfSxcbiAgICBfaHR0cHBhcnNlcjogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJodHRwcGFyc2VyXCIpO1xuICAgIH0sXG4gICAgX2RhdGF2aWV3OiBmdW5jdGlvbiAoKSB7XG4gICAgICB3cml0ZShcImRhdGF2aWV3XCIpO1xuICAgIH0sXG4gICAgX3NpZ25hbDogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJzaWduYWxcIik7XG4gICAgfSxcbiAgICBfZnNldmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgd3JpdGUoXCJmc2V2ZW50XCIpO1xuICAgIH0sXG4gICAgX3Rsc3dyYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdyaXRlKFwidGxzd3JhcFwiKTtcbiAgICB9LFxuICB9O1xufVxuXG4vLyBNaW5pLWltcGxlbWVudGF0aW9uIG9mIHN0cmVhbS5QYXNzVGhyb3VnaFxuLy8gV2UgYXJlIGZhciBmcm9tIGhhdmluZyBuZWVkIGZvciB0aGUgZnVsbCBpbXBsZW1lbnRhdGlvbiwgYW5kIHdlIGNhblxuLy8gbWFrZSBhc3N1bXB0aW9ucyBsaWtlIFwibWFueSB3cml0ZXMsIHRoZW4gb25seSBvbmUgZmluYWwgcmVhZFwiXG4vLyBhbmQgd2UgY2FuIGlnbm9yZSBlbmNvZGluZyBzcGVjaWZpY3NcbmZ1bmN0aW9uIFBhc3NUaHJvdWdoKCkge1xuICByZXR1cm4ge1xuICAgIGJ1ZjogXCJcIixcblxuICAgIHdyaXRlOiBmdW5jdGlvbiAoYjogc3RyaW5nKSB7XG4gICAgICB0aGlzLmJ1ZiArPSBiO1xuICAgIH0sXG5cbiAgICBlbmQ6IGZ1bmN0aW9uIChiOiBzdHJpbmcpIHtcbiAgICAgIHRoaXMuYnVmICs9IGI7XG4gICAgfSxcblxuICAgIHJlYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmJ1ZjtcbiAgICB9LFxuICB9O1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VDYWxsYmFjayB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlLFxuICBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZSxcbiAgTXV0YXRlUHJvbWlzZSxcbiAgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLFxuICBVbndyYXBSZXR1cm4sXG4gIFBhZ2luYXRpb25PcHRpb25zLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgdXNlQ2FjaGVkU3RhdGUgfSBmcm9tIFwiLi91c2VDYWNoZWRTdGF0ZVwiO1xuaW1wb3J0IHsgdXNlUHJvbWlzZSwgUHJvbWlzZU9wdGlvbnMgfSBmcm9tIFwiLi91c2VQcm9taXNlXCI7XG5pbXBvcnQgeyB1c2VMYXRlc3QgfSBmcm9tIFwiLi91c2VMYXRlc3RcIjtcbmltcG9ydCB7IGhhc2ggfSBmcm9tIFwiLi9oZWxwZXJzXCI7XG5cbi8vIFN5bWJvbCB0byBkaWZmZXJlbnRpYXRlIGFuIGVtcHR5IGNhY2hlIGZyb20gYHVuZGVmaW5lZGBcbmNvbnN0IGVtcHR5Q2FjaGUgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sKCk7XG5cbmV4cG9ydCB0eXBlIENhY2hlZFByb21pc2VPcHRpb25zPFxuICBUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlIHwgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLFxuICBVLFxuPiA9IFByb21pc2VPcHRpb25zPFQ+ICYge1xuICAvKipcbiAgICogVGhlIGluaXRpYWwgZGF0YSBpZiB0aGVyZSBhcmVuJ3QgYW55IGluIHRoZSBDYWNoZSB5ZXQuXG4gICAqL1xuICBpbml0aWFsRGF0YT86IFU7XG4gIC8qKlxuICAgKiBUZWxscyB0aGUgaG9vayB0byBrZWVwIHRoZSBwcmV2aW91cyByZXN1bHRzIGluc3RlYWQgb2YgcmV0dXJuaW5nIHRoZSBpbml0aWFsIHZhbHVlXG4gICAqIGlmIHRoZXJlIGFyZW4ndCBhbnkgaW4gdGhlIGNhY2hlIGZvciB0aGUgbmV3IGFyZ3VtZW50cy5cbiAgICogVGhpcyBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIHdoZW4gdXNlZCBmb3IgZGF0YSBmb3IgYSBMaXN0IHRvIGF2b2lkIGZsaWNrZXJpbmcuXG4gICAqL1xuICBrZWVwUHJldmlvdXNEYXRhPzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogV3JhcHMgYW4gYXN5bmNocm9ub3VzIGZ1bmN0aW9uIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgUHJvbWlzZSBpbiBhbm90aGVyIGZ1bmN0aW9uLCBhbmQgcmV0dXJucyB0aGUge0BsaW5rIEFzeW5jU3RhdGV9IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGV4ZWN1dGlvbiBvZiB0aGUgZnVuY3Rpb24uIFRoZSBsYXN0IHZhbHVlIHdpbGwgYmUga2VwdCBiZXR3ZWVuIGNvbW1hbmQgcnVucy5cbiAqXG4gKiBAcmVtYXJrIFRoaXMgb3ZlcmxvYWQgc2hvdWxkIGJlIHVzZWQgd2hlbiB3b3JraW5nIHdpdGggcGFnaW5hdGVkIGRhdGEgc291cmNlcy5cbiAqIEByZW1hcmsgV2hlbiBwYWdpbmF0aW5nLCBvbmx5IHRoZSBmaXJzdCBwYWdlIHdpbGwgYmUgY2FjaGVkLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBcbiAqIGltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tIFwibm9kZTp0aW1lcnMvcHJvbWlzZXNcIjtcbiAqIGltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG4gKiBpbXBvcnQgeyBMaXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgdXNlQ2FjaGVkUHJvbWlzZSB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IFtzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICpcbiAqICAgY29uc3QgeyBpc0xvYWRpbmcsIGRhdGEsIHBhZ2luYXRpb24gfSA9IHVzZUNhY2hlZFByb21pc2UoXG4gKiAgICAgKHNlYXJjaFRleHQ6IHN0cmluZykgPT4gYXN5bmMgKG9wdGlvbnM6IHsgcGFnZTogbnVtYmVyIH0pID0+IHtcbiAqICAgICAgIGF3YWl0IHNldFRpbWVvdXQoMjAwKTtcbiAqICAgICAgIGNvbnN0IG5ld0RhdGEgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAyNSB9LCAoX3YsIGluZGV4KSA9PiAoe1xuICogICAgICAgICBpbmRleCxcbiAqICAgICAgICAgcGFnZTogb3B0aW9ucy5wYWdlLFxuICogICAgICAgICB0ZXh0OiBzZWFyY2hUZXh0LFxuICogICAgICAgfSkpO1xuICogICAgICAgcmV0dXJuIHsgZGF0YTogbmV3RGF0YSwgaGFzTW9yZTogb3B0aW9ucy5wYWdlIDwgMTAgfTtcbiAqICAgICB9LFxuICogICAgIFtzZWFyY2hUZXh0XSxcbiAqICAgKTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9IG9uU2VhcmNoVGV4dENoYW5nZT17c2V0U2VhcmNoVGV4dH0gcGFnaW5hdGlvbj17cGFnaW5hdGlvbn0+XG4gKiAgICAgICB7ZGF0YT8ubWFwKChpdGVtKSA9PiAoXG4gKiAgICAgICAgIDxMaXN0Lkl0ZW1cbiAqICAgICAgICAgICBrZXk9e2Ake2l0ZW0ucGFnZX0gJHtpdGVtLmluZGV4fSAke2l0ZW0udGV4dH1gfVxuICogICAgICAgICAgIHRpdGxlPXtgUGFnZSAke2l0ZW0ucGFnZX0gSXRlbSAke2l0ZW0uaW5kZXh9YH1cbiAqICAgICAgICAgICBzdWJ0aXRsZT17aXRlbS50ZXh0fVxuICogICAgICAgICAvPlxuICogICAgICAgKSl9XG4gKiAgICAgPC9MaXN0PlxuICogICApO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VDYWNoZWRQcm9taXNlPFQgZXh0ZW5kcyBGdW5jdGlvblJldHVybmluZ1BhZ2luYXRlZFByb21pc2U8W10+PihcbiAgZm46IFQsXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxVbndyYXBSZXR1cm48VD4sIHVuZGVmaW5lZD47XG5leHBvcnQgZnVuY3Rpb24gdXNlQ2FjaGVkUHJvbWlzZTxUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLCBVIGV4dGVuZHMgYW55W10gPSBhbnlbXT4oXG4gIGZuOiBULFxuICBhcmdzOiBQYXJhbWV0ZXJzPFQ+LFxuICBvcHRpb25zPzogQ2FjaGVkUHJvbWlzZU9wdGlvbnM8VCwgVT4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxVbndyYXBSZXR1cm48VD4sIFU+O1xuXG4vKipcbiAqIFdyYXBzIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvbiBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgYW5kIHJldHVybnMgdGhlIHtAbGluayBBc3luY1N0YXRlfSBjb3JyZXNwb25kaW5nIHRvIHRoZSBleGVjdXRpb24gb2YgdGhlIGZ1bmN0aW9uLiBUaGUgbGFzdCB2YWx1ZSB3aWxsIGJlIGtlcHQgYmV0d2VlbiBjb21tYW5kIHJ1bnMuXG4gKlxuICogQHJlbWFyayBUaGUgdmFsdWUgbmVlZHMgdG8gYmUgSlNPTiBzZXJpYWxpemFibGUuXG4gKiBAcmVtYXJrIFRoZSBmdW5jdGlvbiBpcyBhc3N1bWVkIHRvIGJlIGNvbnN0YW50IChlZy4gY2hhbmdpbmcgaXQgd29uJ3QgdHJpZ2dlciBhIHJldmFsaWRhdGlvbikuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgdXNlQ2FjaGVkUHJvbWlzZSB9IGZyb20gJ0ByYXljYXN0L3V0aWxzJztcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKCkge1xuICogICBjb25zdCBhYm9ydGFibGUgPSB1c2VSZWY8QWJvcnRDb250cm9sbGVyPigpO1xuICogICBjb25zdCB7IGlzTG9hZGluZywgZGF0YSwgcmV2YWxpZGF0ZSB9ID0gdXNlQ2FjaGVkUHJvbWlzZShhc3luYyAodXJsOiBzdHJpbmcpID0+IHtcbiAqICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgeyBzaWduYWw6IGFib3J0YWJsZS5jdXJyZW50Py5zaWduYWwgfSk7XG4gKiAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICogICAgIHJldHVybiByZXN1bHRcbiAqICAgfSxcbiAqICAgWydodHRwczovL2FwaS5leGFtcGxlJ10sXG4gKiAgIHtcbiAqICAgICBhYm9ydGFibGVcbiAqICAgfSk7XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxEZXRhaWxcbiAqICAgICAgIGlzTG9hZGluZz17aXNMb2FkaW5nfVxuICogICAgICAgbWFya2Rvd249e2RhdGF9XG4gKiAgICAgICBhY3Rpb25zPXtcbiAqICAgICAgICAgPEFjdGlvblBhbmVsPlxuICogICAgICAgICAgIDxBY3Rpb24gdGl0bGU9XCJSZWxvYWRcIiBvbkFjdGlvbj17KCkgPT4gcmV2YWxpZGF0ZSgpfSAvPlxuICogICAgICAgICA8L0FjdGlvblBhbmVsPlxuICogICAgICAgfVxuICogICAgIC8+XG4gKiAgICk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VDYWNoZWRQcm9taXNlPFQgZXh0ZW5kcyBGdW5jdGlvblJldHVybmluZ1Byb21pc2U8W10+PihcbiAgZm46IFQsXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxVbndyYXBSZXR1cm48VD4sIHVuZGVmaW5lZD47XG5leHBvcnQgZnVuY3Rpb24gdXNlQ2FjaGVkUHJvbWlzZTxUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlLCBVID0gdW5kZWZpbmVkPihcbiAgZm46IFQsXG4gIGFyZ3M6IFBhcmFtZXRlcnM8VD4sXG4gIG9wdGlvbnM/OiBDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPixcbik6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFVud3JhcFJldHVybjxUPiwgVT47XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VDYWNoZWRQcm9taXNlPFxuICBUIGV4dGVuZHMgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlIHwgRnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBVIGV4dGVuZHMgYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQsXG4+KGZuOiBULCBhcmdzPzogUGFyYW1ldGVyczxUPiwgb3B0aW9ucz86IENhY2hlZFByb21pc2VPcHRpb25zPFQsIFU+KSB7XG4gIC8qKlxuICAgKiBUaGUgaG9vayBnZW5lcmF0ZXMgYSBjYWNoZSBrZXkgZnJvbSB0aGUgcHJvbWlzZSBpdCByZWNlaXZlcyAmIGl0cyBhcmd1bWVudHMuXG4gICAqIFNvbWV0aW1lcyB0aGF0J3Mgbm90IGVub3VnaCB0byBndWFyYW50ZWUgdW5pcXVlbmVzcywgc28gaG9va3MgdGhhdCBidWlsZCBvbiB0b3Agb2YgYHVzZUNhY2hlZFByb21pc2VgIGNhblxuICAgKiB1c2UgYW4gYGludGVybmFsX2NhY2hlS2V5U3VmZml4YCB0byBoZWxwIGl0LlxuICAgKlxuICAgKiBAcmVtYXJrIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cbiAgICovXG4gIGNvbnN0IHtcbiAgICBpbml0aWFsRGF0YSxcbiAgICBrZWVwUHJldmlvdXNEYXRhLFxuICAgIGludGVybmFsX2NhY2hlS2V5U3VmZml4LFxuICAgIC4uLnVzZVByb21pc2VPcHRpb25zXG4gIH06IENhY2hlZFByb21pc2VPcHRpb25zPFQsIFU+ICYgeyBpbnRlcm5hbF9jYWNoZUtleVN1ZmZpeD86IHN0cmluZyB9ID0gb3B0aW9ucyB8fCB7fTtcbiAgY29uc3QgbGFzdFVwZGF0ZUZyb20gPSB1c2VSZWY8XCJjYWNoZVwiIHwgXCJwcm9taXNlXCI+KG51bGwpO1xuXG4gIGNvbnN0IFtjYWNoZWREYXRhLCBtdXRhdGVDYWNoZV0gPSB1c2VDYWNoZWRTdGF0ZTx0eXBlb2YgZW1wdHlDYWNoZSB8IChVbndyYXBSZXR1cm48VD4gfCBVKT4oXG4gICAgaGFzaChhcmdzIHx8IFtdKSArIGludGVybmFsX2NhY2hlS2V5U3VmZml4LFxuICAgIGVtcHR5Q2FjaGUsXG4gICAge1xuICAgICAgY2FjaGVOYW1lc3BhY2U6IGhhc2goZm4pLFxuICAgIH0sXG4gICk7XG5cbiAgLy8gVXNlIGEgcmVmIHRvIHN0b3JlIHByZXZpb3VzIHJldHVybmVkIGRhdGEuIFVzZSB0aGUgaW5pdGFsIGRhdGEgYXMgaXRzIGluaXRhbCB2YWx1ZSBmcm9tIHRoZSBjYWNoZS5cbiAgY29uc3QgbGFnZ3lEYXRhUmVmID0gdXNlUmVmPEF3YWl0ZWQ8UmV0dXJuVHlwZTxUPj4gfCBVPihjYWNoZWREYXRhICE9PSBlbXB0eUNhY2hlID8gY2FjaGVkRGF0YSA6IChpbml0aWFsRGF0YSBhcyBVKSk7XG4gIGNvbnN0IHBhZ2luYXRpb25BcmdzUmVmID0gdXNlUmVmPFBhZ2luYXRpb25PcHRpb25zPFVud3JhcFJldHVybjxUPiB8IFU+IHwgdW5kZWZpbmVkPih1bmRlZmluZWQpO1xuXG4gIGNvbnN0IHtcbiAgICBtdXRhdGU6IF9tdXRhdGUsXG4gICAgcmV2YWxpZGF0ZSxcbiAgICAuLi5zdGF0ZVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgZm4gaGFzIHRoZSBzYW1lIHNpZ25hdHVyZSBpbiBib3RoIHVzZVByb21pc2UgYW5kIHVzZUNhY2hlZFByb21pc2VcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICB9ID0gdXNlUHJvbWlzZShmbiwgYXJncyB8fCAoW10gYXMgYW55IGFzIFBhcmFtZXRlcnM8VD4pLCB7XG4gICAgLi4udXNlUHJvbWlzZU9wdGlvbnMsXG4gICAgb25EYXRhKGRhdGEsIHBhZ2luYXRpb24pIHtcbiAgICAgIHBhZ2luYXRpb25BcmdzUmVmLmN1cnJlbnQgPSBwYWdpbmF0aW9uO1xuICAgICAgaWYgKHVzZVByb21pc2VPcHRpb25zLm9uRGF0YSkge1xuICAgICAgICB1c2VQcm9taXNlT3B0aW9ucy5vbkRhdGEoZGF0YSwgcGFnaW5hdGlvbik7XG4gICAgICB9XG4gICAgICBpZiAocGFnaW5hdGlvbiAmJiBwYWdpbmF0aW9uLnBhZ2UgPiAwKSB7XG4gICAgICAgIC8vIGRvbid0IGNhY2hlIGJleW9uZCB0aGUgZmlyc3QgcGFnZVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsYXN0VXBkYXRlRnJvbS5jdXJyZW50ID0gXCJwcm9taXNlXCI7XG4gICAgICBsYWdneURhdGFSZWYuY3VycmVudCA9IGRhdGE7XG4gICAgICBtdXRhdGVDYWNoZShkYXRhKTtcbiAgICB9LFxuICB9KTtcblxuICBsZXQgcmV0dXJuZWREYXRhOiBVIHwgQXdhaXRlZDxSZXR1cm5UeXBlPFQ+PiB8IFVud3JhcFJldHVybjxUPjtcbiAgY29uc3QgcGFnaW5hdGlvbiA9IHN0YXRlLnBhZ2luYXRpb247XG4gIC8vIHdoZW4gcGFnaW5hdGluZywgb25seSB0aGUgZmlyc3QgcGFnZSBnZXRzIGNhY2hlZCwgc28gd2UgcmV0dXJuIHRoZSBkYXRhIHdlIGdldCBmcm9tIGB1c2VQcm9taXNlYCwgYmVjYXVzZVxuICAvLyBpdCB3aWxsIGJlIGFjY3VtdWxhdGVkLlxuICBpZiAocGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudCAmJiBwYWdpbmF0aW9uQXJnc1JlZi5jdXJyZW50LnBhZ2UgPiAwICYmIHN0YXRlLmRhdGEpIHtcbiAgICByZXR1cm5lZERhdGEgPSBzdGF0ZS5kYXRhIGFzIFVud3JhcFJldHVybjxUPjtcbiAgICAvLyBpZiB0aGUgbGF0ZXN0IHVwZGF0ZSBpZiBmcm9tIHRoZSBQcm9taXNlLCB3ZSBrZWVwIGl0XG4gIH0gZWxzZSBpZiAobGFzdFVwZGF0ZUZyb20uY3VycmVudCA9PT0gXCJwcm9taXNlXCIpIHtcbiAgICByZXR1cm5lZERhdGEgPSBsYWdneURhdGFSZWYuY3VycmVudDtcbiAgfSBlbHNlIGlmIChrZWVwUHJldmlvdXNEYXRhICYmIGNhY2hlZERhdGEgIT09IGVtcHR5Q2FjaGUpIHtcbiAgICAvLyBpZiB3ZSB3YW50IHRvIGtlZXAgdGhlIGxhdGVzdCBkYXRhLCB3ZSBwaWNrIHRoZSBjYWNoZSBidXQgb25seSBpZiBpdCdzIG5vdCBlbXB0eVxuICAgIHJldHVybmVkRGF0YSA9IGNhY2hlZERhdGE7XG4gICAgaWYgKHBhZ2luYXRpb24pIHtcbiAgICAgIHBhZ2luYXRpb24uaGFzTW9yZSA9IHRydWU7XG4gICAgICBwYWdpbmF0aW9uLnBhZ2VTaXplID0gY2FjaGVkRGF0YS5sZW5ndGg7XG4gICAgfVxuICB9IGVsc2UgaWYgKGtlZXBQcmV2aW91c0RhdGEgJiYgY2FjaGVkRGF0YSA9PT0gZW1wdHlDYWNoZSkge1xuICAgIC8vIGlmIHRoZSBjYWNoZSBpcyBlbXB0eSwgd2Ugd2lsbCByZXR1cm4gdGhlIHByZXZpb3VzIGRhdGFcbiAgICByZXR1cm5lZERhdGEgPSBsYWdneURhdGFSZWYuY3VycmVudDtcbiAgICAvLyB0aGVyZSBhcmUgbm8gc3BlY2lhbCBjYXNlcywgc28gZWl0aGVyIHJldHVybiB0aGUgY2FjaGUgb3IgaW5pdGlhbCBkYXRhXG4gIH0gZWxzZSBpZiAoY2FjaGVkRGF0YSAhPT0gZW1wdHlDYWNoZSkge1xuICAgIHJldHVybmVkRGF0YSA9IGNhY2hlZERhdGE7XG4gICAgaWYgKHBhZ2luYXRpb24pIHtcbiAgICAgIHBhZ2luYXRpb24uaGFzTW9yZSA9IHRydWU7XG4gICAgICBwYWdpbmF0aW9uLnBhZ2VTaXplID0gY2FjaGVkRGF0YS5sZW5ndGg7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybmVkRGF0YSA9IGluaXRpYWxEYXRhIGFzIFU7XG4gIH1cblxuICBjb25zdCBsYXRlc3REYXRhID0gdXNlTGF0ZXN0KHJldHVybmVkRGF0YSk7XG5cbiAgLy8gd2UgcmV3cml0ZSB0aGUgbXV0YXRlIGZ1bmN0aW9uIHRvIHVwZGF0ZSB0aGUgY2FjaGUgaW5zdGVhZFxuICBjb25zdCBtdXRhdGUgPSB1c2VDYWxsYmFjazxNdXRhdGVQcm9taXNlPEF3YWl0ZWQ8UmV0dXJuVHlwZTxUPj4gfCBVPj4oXG4gICAgYXN5bmMgKGFzeW5jVXBkYXRlLCBvcHRpb25zKSA9PiB7XG4gICAgICBsZXQgZGF0YUJlZm9yZU9wdGltaXN0aWNVcGRhdGU7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAob3B0aW9ucz8ub3B0aW1pc3RpY1VwZGF0ZSkge1xuICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yICE9PSBcImZ1bmN0aW9uXCIgJiYgb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgLy8ga2VlcCB0cmFjayBvZiB0aGUgZGF0YSBiZWZvcmUgdGhlIG9wdGltaXN0aWMgdXBkYXRlLFxuICAgICAgICAgICAgLy8gYnV0IG9ubHkgaWYgd2UgbmVlZCBpdCAoZWcuIG9ubHkgd2hlbiB3ZSB3YW50IHRvIGF1dG9tYXRpY2FsbHkgcm9sbGJhY2sgYWZ0ZXIpXG4gICAgICAgICAgICBkYXRhQmVmb3JlT3B0aW1pc3RpY1VwZGF0ZSA9IHN0cnVjdHVyZWRDbG9uZShsYXRlc3REYXRhLmN1cnJlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBkYXRhID0gb3B0aW9ucy5vcHRpbWlzdGljVXBkYXRlKGxhdGVzdERhdGEuY3VycmVudCk7XG4gICAgICAgICAgbGFzdFVwZGF0ZUZyb20uY3VycmVudCA9IFwiY2FjaGVcIjtcbiAgICAgICAgICBsYWdneURhdGFSZWYuY3VycmVudCA9IGRhdGE7XG4gICAgICAgICAgbXV0YXRlQ2FjaGUoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF3YWl0IF9tdXRhdGUoYXN5bmNVcGRhdGUsIHsgc2hvdWxkUmV2YWxpZGF0ZUFmdGVyOiBvcHRpb25zPy5zaG91bGRSZXZhbGlkYXRlQWZ0ZXIgfSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zPy5yb2xsYmFja09uRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSBvcHRpb25zLnJvbGxiYWNrT25FcnJvcihsYXRlc3REYXRhLmN1cnJlbnQpO1xuICAgICAgICAgIGxhc3RVcGRhdGVGcm9tLmN1cnJlbnQgPSBcImNhY2hlXCI7XG4gICAgICAgICAgbGFnZ3lEYXRhUmVmLmN1cnJlbnQgPSBkYXRhO1xuICAgICAgICAgIG11dGF0ZUNhY2hlKGRhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnM/Lm9wdGltaXN0aWNVcGRhdGUgJiYgb3B0aW9ucz8ucm9sbGJhY2tPbkVycm9yICE9PSBmYWxzZSkge1xuICAgICAgICAgIGxhc3RVcGRhdGVGcm9tLmN1cnJlbnQgPSBcImNhY2hlXCI7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB3aGVuIHVuZGVmaW5lZCwgaXQncyBleHBlY3RlZFxuICAgICAgICAgIGxhZ2d5RGF0YVJlZi5jdXJyZW50ID0gZGF0YUJlZm9yZU9wdGltaXN0aWNVcGRhdGU7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB3aGVuIHVuZGVmaW5lZCwgaXQncyBleHBlY3RlZFxuICAgICAgICAgIG11dGF0ZUNhY2hlKGRhdGFCZWZvcmVPcHRpbWlzdGljVXBkYXRlKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfSxcbiAgICBbbXV0YXRlQ2FjaGUsIF9tdXRhdGUsIGxhdGVzdERhdGEsIGxhZ2d5RGF0YVJlZiwgbGFzdFVwZGF0ZUZyb21dLFxuICApO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGNhY2hlZERhdGEgIT09IGVtcHR5Q2FjaGUpIHtcbiAgICAgIGxhc3RVcGRhdGVGcm9tLmN1cnJlbnQgPSBcImNhY2hlXCI7XG4gICAgICBsYWdneURhdGFSZWYuY3VycmVudCA9IGNhY2hlZERhdGE7XG4gICAgfVxuICB9LCBbY2FjaGVkRGF0YV0pO1xuXG4gIHJldHVybiB7XG4gICAgZGF0YTogcmV0dXJuZWREYXRhLFxuICAgIGlzTG9hZGluZzogc3RhdGUuaXNMb2FkaW5nLFxuICAgIGVycm9yOiBzdGF0ZS5lcnJvcixcbiAgICBtdXRhdGU6IHBhZ2luYXRpb25BcmdzUmVmLmN1cnJlbnQgJiYgcGFnaW5hdGlvbkFyZ3NSZWYuY3VycmVudC5wYWdlID4gMCA/IF9tdXRhdGUgOiBtdXRhdGUsXG4gICAgcGFnaW5hdGlvbixcbiAgICByZXZhbGlkYXRlLFxuICB9O1xufVxuIiwgImltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VNZW1vLCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZUNhY2hlZFByb21pc2UsIENhY2hlZFByb21pc2VPcHRpb25zIH0gZnJvbSBcIi4vdXNlQ2FjaGVkUHJvbWlzZVwiO1xuaW1wb3J0IHsgdXNlTGF0ZXN0IH0gZnJvbSBcIi4vdXNlTGF0ZXN0XCI7XG5pbXBvcnQgeyBGdW5jdGlvblJldHVybmluZ1BhZ2luYXRlZFByb21pc2UsIEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZSwgVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGUgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgaXNKU09OIH0gZnJvbSBcIi4vZmV0Y2gtdXRpbHNcIjtcbmltcG9ydCB7IGhhc2ggfSBmcm9tIFwiLi9oZWxwZXJzXCI7XG5cbmFzeW5jIGZ1bmN0aW9uIGRlZmF1bHRQYXJzaW5nKHJlc3BvbnNlOiBSZXNwb25zZSkge1xuICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpO1xuICB9XG5cbiAgY29uc3QgY29udGVudFR5cGVIZWFkZXIgPSByZXNwb25zZS5oZWFkZXJzLmdldChcImNvbnRlbnQtdHlwZVwiKTtcblxuICBpZiAoY29udGVudFR5cGVIZWFkZXIgJiYgaXNKU09OKGNvbnRlbnRUeXBlSGVhZGVyKSkge1xuICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gIH1cbiAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdE1hcHBpbmc8ViwgVCBleHRlbmRzIHVua25vd25bXT4ocmVzdWx0OiBWKTogeyBkYXRhOiBUOyBoYXNNb3JlPzogYm9vbGVhbjsgY3Vyc29yPzogYW55IH0ge1xuICByZXR1cm4geyBkYXRhOiByZXN1bHQgYXMgdW5rbm93biBhcyBULCBoYXNNb3JlOiBmYWxzZSB9O1xufVxuXG50eXBlIFJlcXVlc3RJbmZvID0gc3RyaW5nIHwgVVJMIHwgZ2xvYmFsVGhpcy5SZXF1ZXN0O1xudHlwZSBQYWdpbmF0ZWRSZXF1ZXN0SW5mbyA9IChwYWdpbmF0aW9uOiB7IHBhZ2U6IG51bWJlcjsgbGFzdEl0ZW0/OiBhbnk7IGN1cnNvcj86IGFueSB9KSA9PiBSZXF1ZXN0SW5mbztcblxuLyoqXG4gKiBGZXRjaGVzIHRoZSBwYWdpbmF0ZWRVUkwgYW5kIHJldHVybnMgdGhlIHtAbGluayBBc3luY1N0YXRlfSBjb3JyZXNwb25kaW5nIHRvIHRoZSBleGVjdXRpb24gb2YgdGhlIGZldGNoLiBUaGUgbGFzdCB2YWx1ZSB3aWxsIGJlIGtlcHQgYmV0d2VlbiBjb21tYW5kIHJ1bnMuXG4gKlxuICogQHJlbWFyayBUaGlzIG92ZXJsb2FkIHNob3VsZCBiZSB1c2VkIHdoZW4gd29ya2luZyB3aXRoIHBhZ2luYXRlZCBkYXRhIHNvdXJjZXMuXG4gKiBAcmVtYXJrIFdoZW4gcGFnaW5hdGluZywgb25seSB0aGUgZmlyc3QgcGFnZSB3aWxsIGJlIGNhY2hlZC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyBJY29uLCBJbWFnZSwgTGlzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZUZldGNoIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKiBpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuICpcbiAqIHR5cGUgU2VhcmNoUmVzdWx0ID0geyBjb21wYW5pZXM6IENvbXBhbnlbXTsgcGFnZTogbnVtYmVyOyB0b3RhbFBhZ2VzOiBudW1iZXIgfTtcbiAqIHR5cGUgQ29tcGFueSA9IHsgaWQ6IG51bWJlcjsgbmFtZTogc3RyaW5nOyBzbWFsbExvZ29Vcmw/OiBzdHJpbmcgfTtcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IFtzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICogICBjb25zdCB7IGlzTG9hZGluZywgZGF0YSwgcGFnaW5hdGlvbiB9ID0gdXNlRmV0Y2goXG4gKiAgICAgKG9wdGlvbnMpID0+XG4gKiAgICAgICBcImh0dHBzOi8vYXBpLnljb21iaW5hdG9yLmNvbS92MC4xL2NvbXBhbmllcz9cIiArXG4gKiAgICAgICBuZXcgVVJMU2VhcmNoUGFyYW1zKHsgcGFnZTogU3RyaW5nKG9wdGlvbnMucGFnZSArIDEpLCBxOiBzZWFyY2hUZXh0IH0pLnRvU3RyaW5nKCksXG4gKiAgICAge1xuICogICAgICAgbWFwUmVzdWx0KHJlc3VsdDogU2VhcmNoUmVzdWx0KSB7XG4gKiAgICAgICAgIHJldHVybiB7XG4gKiAgICAgICAgICAgZGF0YTogcmVzdWx0LmNvbXBhbmllcyxcbiAqICAgICAgICAgICBoYXNNb3JlOiByZXN1bHQucGFnZSA8IHJlc3VsdC50b3RhbFBhZ2VzLFxuICogICAgICAgICB9O1xuICogICAgICAgfSxcbiAqICAgICAgIGtlZXBQcmV2aW91c0RhdGE6IHRydWUsXG4gKiAgICAgICBpbml0aWFsRGF0YTogW10sXG4gKiAgICAgfSxcbiAqICAgKTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9IHBhZ2luYXRpb249e3BhZ2luYXRpb259IG9uU2VhcmNoVGV4dENoYW5nZT17c2V0U2VhcmNoVGV4dH0+XG4gKiAgICAgICB7ZGF0YS5tYXAoKGNvbXBhbnkpID0+IChcbiAqICAgICAgICAgPExpc3QuSXRlbVxuICogICAgICAgICAgIGtleT17Y29tcGFueS5pZH1cbiAqICAgICAgICAgICBpY29uPXt7IHNvdXJjZTogY29tcGFueS5zbWFsbExvZ29VcmwgPz8gSWNvbi5NaW51c0NpcmNsZSwgbWFzazogSW1hZ2UuTWFzay5Sb3VuZGVkUmVjdGFuZ2xlIH19XG4gKiAgICAgICAgICAgdGl0bGU9e2NvbXBhbnkubmFtZX1cbiAqICAgICAgICAgLz5cbiAqICAgICAgICkpfVxuICogICAgIDwvTGlzdD5cbiAqICAgKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRmV0Y2g8ViA9IHVua25vd24sIFUgPSB1bmRlZmluZWQsIFQgZXh0ZW5kcyB1bmtub3duW10gPSB1bmtub3duW10+KFxuICB1cmw6IFBhZ2luYXRlZFJlcXVlc3RJbmZvLFxuICBvcHRpb25zOiBSZXF1ZXN0SW5pdCAmIHtcbiAgICBtYXBSZXN1bHQ6IChyZXN1bHQ6IFYpID0+IHsgZGF0YTogVDsgaGFzTW9yZT86IGJvb2xlYW47IGN1cnNvcj86IGFueSB9O1xuICAgIHBhcnNlUmVzcG9uc2U/OiAocmVzcG9uc2U6IFJlc3BvbnNlKSA9PiBQcm9taXNlPFY+O1xuICB9ICYgT21pdDxDYWNoZWRQcm9taXNlT3B0aW9uczwodXJsOiBSZXF1ZXN0SW5mbywgb3B0aW9ucz86IFJlcXVlc3RJbml0KSA9PiBQcm9taXNlPFQ+LCBVPiwgXCJhYm9ydGFibGVcIj4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxULCBVPjtcbi8qKlxuICogRmV0Y2ggdGhlIFVSTCBhbmQgcmV0dXJucyB0aGUge0BsaW5rIEFzeW5jU3RhdGV9IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGV4ZWN1dGlvbiBvZiB0aGUgZmV0Y2guIFRoZSBsYXN0IHZhbHVlIHdpbGwgYmUga2VwdCBiZXR3ZWVuIGNvbW1hbmQgcnVucy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyB1c2VGZXRjaCB9IGZyb20gJ0ByYXljYXN0L3V0aWxzJztcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKCkge1xuICogICBjb25zdCB7IGlzTG9hZGluZywgZGF0YSwgcmV2YWxpZGF0ZSB9ID0gdXNlRmV0Y2goJ2h0dHBzOi8vYXBpLmV4YW1wbGUnKTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPERldGFpbFxuICogICAgICAgaXNMb2FkaW5nPXtpc0xvYWRpbmd9XG4gKiAgICAgICBtYXJrZG93bj17ZGF0YX1cbiAqICAgICAgIGFjdGlvbnM9e1xuICogICAgICAgICA8QWN0aW9uUGFuZWw+XG4gKiAgICAgICAgICAgPEFjdGlvbiB0aXRsZT1cIlJlbG9hZFwiIG9uQWN0aW9uPXsoKSA9PiByZXZhbGlkYXRlKCl9IC8+XG4gKiAgICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gKiAgICAgICB9XG4gKiAgICAgLz5cbiAqICAgKTtcbiAqIH07XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUZldGNoPFYgPSB1bmtub3duLCBVID0gdW5kZWZpbmVkLCBUID0gVj4oXG4gIHVybDogUmVxdWVzdEluZm8sXG4gIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCAmIHtcbiAgICBtYXBSZXN1bHQ/OiAocmVzdWx0OiBWKSA9PiB7IGRhdGE6IFQ7IGhhc01vcmU/OiBib29sZWFuOyBjdXJzb3I/OiBhbnkgfTtcbiAgICBwYXJzZVJlc3BvbnNlPzogKHJlc3BvbnNlOiBSZXNwb25zZSkgPT4gUHJvbWlzZTxWPjtcbiAgfSAmIE9taXQ8Q2FjaGVkUHJvbWlzZU9wdGlvbnM8KHVybDogUmVxdWVzdEluZm8sIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCkgPT4gUHJvbWlzZTxUPiwgVT4sIFwiYWJvcnRhYmxlXCI+LFxuKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VCwgVT4gJiB7IHBhZ2luYXRpb246IHVuZGVmaW5lZCB9O1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlRmV0Y2g8ViA9IHVua25vd24sIFUgPSB1bmRlZmluZWQsIFQgZXh0ZW5kcyB1bmtub3duW10gPSB1bmtub3duW10+KFxuICB1cmw6IFJlcXVlc3RJbmZvIHwgUGFnaW5hdGVkUmVxdWVzdEluZm8sXG4gIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCAmIHtcbiAgICBtYXBSZXN1bHQ/OiAocmVzdWx0OiBWKSA9PiB7IGRhdGE6IFQ7IGhhc01vcmU/OiBib29sZWFuOyBjdXJzb3I/OiBhbnkgfTtcbiAgICBwYXJzZVJlc3BvbnNlPzogKHJlc3BvbnNlOiBSZXNwb25zZSkgPT4gUHJvbWlzZTxWPjtcbiAgfSAmIE9taXQ8Q2FjaGVkUHJvbWlzZU9wdGlvbnM8KHVybDogUmVxdWVzdEluZm8sIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCkgPT4gUHJvbWlzZTxUPiwgVT4sIFwiYWJvcnRhYmxlXCI+LFxuKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VCwgVT4ge1xuICBjb25zdCB7XG4gICAgcGFyc2VSZXNwb25zZSxcbiAgICBtYXBSZXN1bHQsXG4gICAgaW5pdGlhbERhdGEsXG4gICAgZXhlY3V0ZSxcbiAgICBrZWVwUHJldmlvdXNEYXRhLFxuICAgIG9uRXJyb3IsXG4gICAgb25EYXRhLFxuICAgIG9uV2lsbEV4ZWN1dGUsXG4gICAgZmFpbHVyZVRvYXN0T3B0aW9ucyxcbiAgICAuLi5mZXRjaE9wdGlvbnNcbiAgfSA9IG9wdGlvbnMgfHwge307XG5cbiAgY29uc3QgdXNlQ2FjaGVkUHJvbWlzZU9wdGlvbnM6IENhY2hlZFByb21pc2VPcHRpb25zPCh1cmw6IFJlcXVlc3RJbmZvLCBvcHRpb25zPzogUmVxdWVzdEluaXQpID0+IFByb21pc2U8VD4sIFU+ID0ge1xuICAgIGluaXRpYWxEYXRhLFxuICAgIGV4ZWN1dGUsXG4gICAga2VlcFByZXZpb3VzRGF0YSxcbiAgICBvbkVycm9yLFxuICAgIG9uRGF0YSxcbiAgICBvbldpbGxFeGVjdXRlLFxuICAgIGZhaWx1cmVUb2FzdE9wdGlvbnMsXG4gIH07XG5cbiAgY29uc3QgcGFyc2VSZXNwb25zZVJlZiA9IHVzZUxhdGVzdChwYXJzZVJlc3BvbnNlIHx8IGRlZmF1bHRQYXJzaW5nKTtcbiAgY29uc3QgbWFwUmVzdWx0UmVmID0gdXNlTGF0ZXN0KG1hcFJlc3VsdCB8fCBkZWZhdWx0TWFwcGluZyk7XG4gIGNvbnN0IHVybFJlZiA9IHVzZVJlZjxSZXF1ZXN0SW5mbyB8IFBhZ2luYXRlZFJlcXVlc3RJbmZvPihudWxsKTtcbiAgY29uc3QgZmlyc3RQYWdlVXJsUmVmID0gdXNlUmVmPFJlcXVlc3RJbmZvIHwgdW5kZWZpbmVkPihudWxsKTtcbiAgY29uc3QgZmlyc3RQYWdlVXJsID0gdHlwZW9mIHVybCA9PT0gXCJmdW5jdGlvblwiID8gdXJsKHsgcGFnZTogMCB9KSA6IHVuZGVmaW5lZDtcbiAgLyoqXG4gICAqIFdoZW4gcGFnaW5hdGluZywgYHVybGAgaXMgYSBgUGFnaW5hdGVkUmVxdWVzdEluZm9gLCBzbyB3ZSBvbmx5IHdhbnQgdG8gdXBkYXRlIHRoZSByZWYgd2hlbiB0aGUgYGZpcnN0UGFnZVVybGAgY2hhbmdlcy5cbiAgICogV2hlbiBub3QgcGFnaW5hdGluZywgYHVybGAgaXMgYSBgUmVxdWVzdEluZm9gLCBzbyB3ZSB3YW50IHRvIHVwZGF0ZSB0aGUgcmVmIHdoZW5ldmVyIGB1cmxgIGNoYW5nZXMuXG4gICAqL1xuICBpZiAoIXVybFJlZi5jdXJyZW50IHx8IHR5cGVvZiBmaXJzdFBhZ2VVcmxSZWYuY3VycmVudCA9PT0gXCJ1bmRlZmluZWRcIiB8fCBmaXJzdFBhZ2VVcmxSZWYuY3VycmVudCAhPT0gZmlyc3RQYWdlVXJsKSB7XG4gICAgdXJsUmVmLmN1cnJlbnQgPSB1cmw7XG4gIH1cbiAgZmlyc3RQYWdlVXJsUmVmLmN1cnJlbnQgPSBmaXJzdFBhZ2VVcmw7XG4gIGNvbnN0IGFib3J0YWJsZSA9IHVzZVJlZjxBYm9ydENvbnRyb2xsZXI+KG51bGwpO1xuXG4gIGNvbnN0IHBhZ2luYXRlZEZuOiBGdW5jdGlvblJldHVybmluZ1BhZ2luYXRlZFByb21pc2U8W1BhZ2luYXRlZFJlcXVlc3RJbmZvLCB0eXBlb2YgZmV0Y2hPcHRpb25zXSwgVD4gPSB1c2VDYWxsYmFjayhcbiAgICAodXJsOiBQYWdpbmF0ZWRSZXF1ZXN0SW5mbywgb3B0aW9ucz86IFJlcXVlc3RJbml0KSA9PiBhc3luYyAocGFnaW5hdGlvbjogeyBwYWdlOiBudW1iZXIgfSkgPT4ge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsKHBhZ2luYXRpb24pLCB7IHNpZ25hbDogYWJvcnRhYmxlLmN1cnJlbnQ/LnNpZ25hbCwgLi4ub3B0aW9ucyB9KTtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IChhd2FpdCBwYXJzZVJlc3BvbnNlUmVmLmN1cnJlbnQocmVzKSkgYXMgVjtcbiAgICAgIHJldHVybiBtYXBSZXN1bHRSZWYuY3VycmVudD8uKHBhcnNlZCk7XG4gICAgfSxcbiAgICBbcGFyc2VSZXNwb25zZVJlZiwgbWFwUmVzdWx0UmVmXSxcbiAgKTtcbiAgY29uc3QgZm46IEZ1bmN0aW9uUmV0dXJuaW5nUHJvbWlzZTxbUmVxdWVzdEluZm8sIFJlcXVlc3RJbml0P10sIFQ+ID0gdXNlQ2FsbGJhY2soXG4gICAgYXN5bmMgKHVybDogUmVxdWVzdEluZm8sIG9wdGlvbnM/OiBSZXF1ZXN0SW5pdCkgPT4ge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsLCB7IHNpZ25hbDogYWJvcnRhYmxlLmN1cnJlbnQ/LnNpZ25hbCwgLi4ub3B0aW9ucyB9KTtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IChhd2FpdCBwYXJzZVJlc3BvbnNlUmVmLmN1cnJlbnQocmVzKSkgYXMgVjtcbiAgICAgIGNvbnN0IG1hcHBlZCA9IG1hcFJlc3VsdFJlZi5jdXJyZW50KHBhcnNlZCk7XG4gICAgICByZXR1cm4gbWFwcGVkPy5kYXRhIGFzIHVua25vd24gYXMgVDtcbiAgICB9LFxuICAgIFtwYXJzZVJlc3BvbnNlUmVmLCBtYXBSZXN1bHRSZWZdLFxuICApO1xuXG4gIGNvbnN0IHByb21pc2UgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoZmlyc3RQYWdlVXJsUmVmLmN1cnJlbnQpIHtcbiAgICAgIHJldHVybiBwYWdpbmF0ZWRGbjtcbiAgICB9XG4gICAgcmV0dXJuIGZuO1xuICB9LCBbZmlyc3RQYWdlVXJsUmVmLCBmbiwgcGFnaW5hdGVkRm5dKTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yIGxhc3RJdGVtIGNhbid0IGJlIGluZmVycmVkIHByb3Blcmx5XG4gIHJldHVybiB1c2VDYWNoZWRQcm9taXNlKHByb21pc2UsIFt1cmxSZWYuY3VycmVudCBhcyBQYWdpbmF0ZWRSZXF1ZXN0SW5mbywgZmV0Y2hPcHRpb25zXSwge1xuICAgIC4uLnVzZUNhY2hlZFByb21pc2VPcHRpb25zLFxuICAgIGludGVybmFsX2NhY2hlS2V5U3VmZml4OiBmaXJzdFBhZ2VVcmxSZWYuY3VycmVudCArIGhhc2gobWFwUmVzdWx0UmVmLmN1cnJlbnQpICsgaGFzaChwYXJzZVJlc3BvbnNlUmVmLmN1cnJlbnQpLFxuICAgIGFib3J0YWJsZSxcbiAgfSk7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGlzSlNPTihjb250ZW50VHlwZUhlYWRlcjogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuICBpZiAoY29udGVudFR5cGVIZWFkZXIpIHtcbiAgICBjb25zdCBtZWRpYVR5cGUgPSBwYXJzZUNvbnRlbnRUeXBlKGNvbnRlbnRUeXBlSGVhZGVyKTtcblxuICAgIGlmICghbWVkaWFUeXBlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKG1lZGlhVHlwZS5zdWJ0eXBlID09PSBcImpzb25cIikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG1lZGlhVHlwZS5zdWZmaXggPT09IFwianNvblwiKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAobWVkaWFUeXBlLnN1ZmZpeCAmJiAvXFxianNvblxcYi9pLnRlc3QobWVkaWFUeXBlLnN1ZmZpeCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChtZWRpYVR5cGUuc3VidHlwZSAmJiAvXFxianNvblxcYi9pLnRlc3QobWVkaWFUeXBlLnN1YnR5cGUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFJlZ0V4cCB0byBtYXRjaCB0eXBlIGluIFJGQyA2ODM4IHdpdGggYW4gb3B0aW9uYWwgdHJhaWxpbmcgYDtgIGJlY2F1c2Ugc29tZSBBcHBsZSBBUElzIHJldHVybnMgb25lLi4uXG4gKlxuICogdHlwZS1uYW1lID0gcmVzdHJpY3RlZC1uYW1lXG4gKiBzdWJ0eXBlLW5hbWUgPSByZXN0cmljdGVkLW5hbWVcbiAqIHJlc3RyaWN0ZWQtbmFtZSA9IHJlc3RyaWN0ZWQtbmFtZS1maXJzdCAqMTI2cmVzdHJpY3RlZC1uYW1lLWNoYXJzXG4gKiByZXN0cmljdGVkLW5hbWUtZmlyc3QgID0gQUxQSEEgLyBESUdJVFxuICogcmVzdHJpY3RlZC1uYW1lLWNoYXJzICA9IEFMUEhBIC8gRElHSVQgLyBcIiFcIiAvIFwiI1wiIC9cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRcIiAvIFwiJlwiIC8gXCItXCIgLyBcIl5cIiAvIFwiX1wiXG4gKiByZXN0cmljdGVkLW5hbWUtY2hhcnMgPS8gXCIuXCIgOyBDaGFyYWN0ZXJzIGJlZm9yZSBmaXJzdCBkb3QgYWx3YXlzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDsgc3BlY2lmeSBhIGZhY2V0IG5hbWVcbiAqIHJlc3RyaWN0ZWQtbmFtZS1jaGFycyA9LyBcIitcIiA7IENoYXJhY3RlcnMgYWZ0ZXIgbGFzdCBwbHVzIGFsd2F5c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7IHNwZWNpZnkgYSBzdHJ1Y3R1cmVkIHN5bnRheCBzdWZmaXhcbiAqIEFMUEhBID0gICV4NDEtNUEgLyAleDYxLTdBICAgOyBBLVogLyBhLXpcbiAqIERJR0lUID0gICV4MzAtMzkgICAgICAgICAgICAgOyAwLTlcbiAqL1xuY29uc3QgTUVESUFfVFlQRV9SRUdFWFAgPSAvXihbQS1aYS16MC05XVtBLVphLXowLTkhIyQmXl8tXXswLDEyNn0pXFwvKFtBLVphLXowLTldW0EtWmEtejAtOSEjJCZeXy4rLV17MCwxMjZ9KTs/JC87XG5cbmZ1bmN0aW9uIHBhcnNlQ29udGVudFR5cGUoaGVhZGVyOiBzdHJpbmcpIHtcbiAgY29uc3QgaGVhZGVyRGVsaW1pdGF0aW9uaW5kZXggPSBoZWFkZXIuaW5kZXhPZihcIjtcIik7XG4gIGNvbnN0IGNvbnRlbnRUeXBlID0gaGVhZGVyRGVsaW1pdGF0aW9uaW5kZXggIT09IC0xID8gaGVhZGVyLnNsaWNlKDAsIGhlYWRlckRlbGltaXRhdGlvbmluZGV4KS50cmltKCkgOiBoZWFkZXIudHJpbSgpO1xuXG4gIGNvbnN0IG1hdGNoID0gTUVESUFfVFlQRV9SRUdFWFAuZXhlYyhjb250ZW50VHlwZS50b0xvd2VyQ2FzZSgpLnRvTG93ZXJDYXNlKCkpO1xuXG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB0eXBlID0gbWF0Y2hbMV07XG4gIGxldCBzdWJ0eXBlID0gbWF0Y2hbMl07XG4gIGxldCBzdWZmaXg7XG5cbiAgLy8gc3VmZml4IGFmdGVyIGxhc3QgK1xuICBjb25zdCBpbmRleCA9IHN1YnR5cGUubGFzdEluZGV4T2YoXCIrXCIpO1xuICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgc3VmZml4ID0gc3VidHlwZS5zdWJzdHJpbmcoaW5kZXggKyAxKTtcbiAgICBzdWJ0eXBlID0gc3VidHlwZS5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuICB9XG5cbiAgcmV0dXJuIHsgdHlwZSwgc3VidHlwZSwgc3VmZml4IH07XG59XG4iLCAiLypcbiAqIEluc3BpcmVkIGJ5IEV4ZWNhXG4gKi9cblxuaW1wb3J0IGNoaWxkUHJvY2VzcyBmcm9tIFwibm9kZTpjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgeyB1c2VDYWxsYmFjaywgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IHVzZUNhY2hlZFByb21pc2UsIENhY2hlZFByb21pc2VPcHRpb25zIH0gZnJvbSBcIi4vdXNlQ2FjaGVkUHJvbWlzZVwiO1xuaW1wb3J0IHsgdXNlTGF0ZXN0IH0gZnJvbSBcIi4vdXNlTGF0ZXN0XCI7XG5pbXBvcnQgeyBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQge1xuICBnZXRTcGF3bmVkUHJvbWlzZSxcbiAgZ2V0U3Bhd25lZFJlc3VsdCxcbiAgaGFuZGxlT3V0cHV0LFxuICBkZWZhdWx0UGFyc2luZyxcbiAgUGFyc2VFeGVjT3V0cHV0SGFuZGxlcixcbn0gZnJvbSBcIi4vZXhlYy11dGlsc1wiO1xuXG50eXBlIEV4ZWNPcHRpb25zID0ge1xuICAvKipcbiAgICogSWYgYHRydWVgLCBydW5zIHRoZSBjb21tYW5kIGluc2lkZSBvZiBhIHNoZWxsLiBVc2VzIGAvYmluL3NoYC4gQSBkaWZmZXJlbnQgc2hlbGwgY2FuIGJlIHNwZWNpZmllZCBhcyBhIHN0cmluZy4gVGhlIHNoZWxsIHNob3VsZCB1bmRlcnN0YW5kIHRoZSBgLWNgIHN3aXRjaC5cbiAgICpcbiAgICogV2UgcmVjb21tZW5kIGFnYWluc3QgdXNpbmcgdGhpcyBvcHRpb24gc2luY2UgaXQgaXM6XG4gICAqIC0gbm90IGNyb3NzLXBsYXRmb3JtLCBlbmNvdXJhZ2luZyBzaGVsbC1zcGVjaWZpYyBzeW50YXguXG4gICAqIC0gc2xvd2VyLCBiZWNhdXNlIG9mIHRoZSBhZGRpdGlvbmFsIHNoZWxsIGludGVycHJldGF0aW9uLlxuICAgKiAtIHVuc2FmZSwgcG90ZW50aWFsbHkgYWxsb3dpbmcgY29tbWFuZCBpbmplY3Rpb24uXG4gICAqXG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBzaGVsbD86IGJvb2xlYW4gfCBzdHJpbmc7XG4gIC8qKlxuICAgKiBTdHJpcCB0aGUgZmluYWwgbmV3bGluZSBjaGFyYWN0ZXIgZnJvbSB0aGUgb3V0cHV0LlxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBzdHJpcEZpbmFsTmV3bGluZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBDdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IG9mIHRoZSBjaGlsZCBwcm9jZXNzLlxuICAgKiBAZGVmYXVsdCBwcm9jZXNzLmN3ZCgpXG4gICAqL1xuICBjd2Q/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBFbnZpcm9ubWVudCBrZXktdmFsdWUgcGFpcnMuIEV4dGVuZHMgYXV0b21hdGljYWxseSBmcm9tIGBwcm9jZXNzLmVudmAuXG4gICAqIEBkZWZhdWx0IHByb2Nlc3MuZW52XG4gICAqL1xuICBlbnY/OiBOb2RlSlMuUHJvY2Vzc0VudjtcbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGNoYXJhY3RlciBlbmNvZGluZyB1c2VkIHRvIGRlY29kZSB0aGUgc3Rkb3V0IGFuZCBzdGRlcnIgb3V0cHV0LiBJZiBzZXQgdG8gYFwiYnVmZmVyXCJgLCB0aGVuIHN0ZG91dCBhbmQgc3RkZXJyIHdpbGwgYmUgYSBCdWZmZXIgaW5zdGVhZCBvZiBhIHN0cmluZy5cbiAgICpcbiAgICogQGRlZmF1bHQgXCJ1dGY4XCJcbiAgICovXG4gIGVuY29kaW5nPzogQnVmZmVyRW5jb2RpbmcgfCBcImJ1ZmZlclwiO1xuICAvKipcbiAgICogV3JpdGUgc29tZSBpbnB1dCB0byB0aGUgYHN0ZGluYCBvZiB5b3VyIGJpbmFyeS5cbiAgICovXG4gIGlucHV0Pzogc3RyaW5nIHwgQnVmZmVyO1xuICAvKiogSWYgdGltZW91dCBpcyBncmVhdGVyIHRoYW4gYDBgLCB0aGUgcGFyZW50IHdpbGwgc2VuZCB0aGUgc2lnbmFsIGBTSUdURVJNYCBpZiB0aGUgY2hpbGQgcnVucyBsb25nZXIgdGhhbiB0aW1lb3V0IG1pbGxpc2Vjb25kcy5cbiAgICpcbiAgICogQGRlZmF1bHQgMTAwMDBcbiAgICovXG4gIHRpbWVvdXQ/OiBudW1iZXI7XG59O1xuXG5jb25zdCBTUEFDRVNfUkVHRVhQID0gLyArL2c7XG5mdW5jdGlvbiBwYXJzZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nLCBhcmdzPzogc3RyaW5nW10pIHtcbiAgaWYgKGFyZ3MpIHtcbiAgICByZXR1cm4gW2NvbW1hbmQsIC4uLmFyZ3NdO1xuICB9XG4gIGNvbnN0IHRva2Vuczogc3RyaW5nW10gPSBbXTtcbiAgZm9yIChjb25zdCB0b2tlbiBvZiBjb21tYW5kLnRyaW0oKS5zcGxpdChTUEFDRVNfUkVHRVhQKSkge1xuICAgIC8vIEFsbG93IHNwYWNlcyB0byBiZSBlc2NhcGVkIGJ5IGEgYmFja3NsYXNoIGlmIG5vdCBtZWFudCBhcyBhIGRlbGltaXRlclxuICAgIGNvbnN0IHByZXZpb3VzVG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgIGlmIChwcmV2aW91c1Rva2VuICYmIHByZXZpb3VzVG9rZW4uZW5kc1dpdGgoXCJcXFxcXCIpKSB7XG4gICAgICAvLyBNZXJnZSBwcmV2aW91cyB0b2tlbiB3aXRoIGN1cnJlbnQgb25lXG4gICAgICB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdID0gYCR7cHJldmlvdXNUb2tlbi5zbGljZSgwLCAtMSl9ICR7dG9rZW59YDtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0b2tlbnM7XG59XG5cbnR5cGUgRXhlY0NhY2hlZFByb21pc2VPcHRpb25zPFQsIFU+ID0gT21pdDxcbiAgQ2FjaGVkUHJvbWlzZU9wdGlvbnM8XG4gICAgKF9jb21tYW5kOiBzdHJpbmcsIF9hcmdzOiBzdHJpbmdbXSwgX29wdGlvbnM/OiBFeGVjT3B0aW9ucywgaW5wdXQ/OiBzdHJpbmcgfCBCdWZmZXIpID0+IFByb21pc2U8VD4sXG4gICAgVVxuICA+LFxuICBcImFib3J0YWJsZVwiXG4+O1xuXG4vKipcbiAqIEV4ZWN1dGVzIGEgY29tbWFuZCBhbmQgcmV0dXJucyB0aGUge0BsaW5rIEFzeW5jU3RhdGV9IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGV4ZWN1dGlvbiBvZiB0aGUgY29tbWFuZC4gVGhlIGxhc3QgdmFsdWUgd2lsbCBiZSBrZXB0IGJldHdlZW4gY29tbWFuZCBydW5zLlxuICpcbiAqIEByZW1hcmsgV2hlbiBzcGVjaWZ5aW5nIHRoZSBhcmd1bWVudHMgdmlhIHRoZSBgY29tbWFuZGAgc3RyaW5nLCBpZiB0aGUgZmlsZSBvciBhbiBhcmd1bWVudCBvZiB0aGUgY29tbWFuZCBjb250YWlucyBzcGFjZXMsIHRoZXkgbXVzdCBiZSBlc2NhcGVkIHdpdGggYmFja3NsYXNoZXMuIFRoaXMgbWF0dGVycyBlc3BlY2lhbGx5IGlmIGBjb21tYW5kYCBpcyBub3QgYSBjb25zdGFudCBidXQgYSB2YXJpYWJsZSwgZm9yIGV4YW1wbGUgd2l0aCBgX19kaXJuYW1lYCBvciBgcHJvY2Vzcy5jd2QoKWAuIEV4Y2VwdCBmb3Igc3BhY2VzLCBubyBlc2NhcGluZy9xdW90aW5nIGlzIG5lZWRlZC5cbiAqXG4gKiBUaGUgYHNoZWxsYCBvcHRpb24gbXVzdCBiZSB1c2VkIGlmIHRoZSBjb21tYW5kIHVzZXMgc2hlbGwtc3BlY2lmaWMgZmVhdHVyZXMgKGZvciBleGFtcGxlLCBgJiZgIG9yIGB8fGApLCBhcyBvcHBvc2VkIHRvIGJlaW5nIGEgc2ltcGxlIGZpbGUgZm9sbG93ZWQgYnkgaXRzIGFyZ3VtZW50cy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyB1c2VFeGVjIH0gZnJvbSAnQHJheWNhc3QvdXRpbHMnO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IHsgaXNMb2FkaW5nLCBkYXRhLCByZXZhbGlkYXRlIH0gPSB1c2VFeGVjKFwiYnJld1wiLCBbXCJpbmZvXCIsIFwiLS1qc29uPXYyXCIsIFwiLS1pbnN0YWxsZWRcIl0pO1xuICogICBjb25zdCByZXN1bHRzID0gdXNlTWVtbzx7fVtdPigoKSA9PiBKU09OLnBhcnNlKGRhdGEgfHwgXCJbXVwiKSwgW2RhdGFdKTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9PlxuICogICAgICB7KGRhdGEgfHwgW10pLm1hcCgoaXRlbSkgPT4gKFxuICogICAgICAgIDxMaXN0Lkl0ZW0ga2V5PXtpdGVtLmlkfSB0aXRsZT17aXRlbS5uYW1lfSAvPlxuICogICAgICApKX1cbiAqICAgIDwvTGlzdD5cbiAqICAgKTtcbiAqIH07XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUV4ZWM8VCA9IEJ1ZmZlciwgVSA9IHVuZGVmaW5lZD4oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgb3B0aW9uczoge1xuICAgIHBhcnNlT3V0cHV0PzogUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBCdWZmZXIsIEV4ZWNPcHRpb25zPjtcbiAgfSAmIEV4ZWNPcHRpb25zICYge1xuICAgICAgZW5jb2Rpbmc6IFwiYnVmZmVyXCI7XG4gICAgfSAmIEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPixcbik6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFQsIFU+O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUV4ZWM8VCA9IHN0cmluZywgVSA9IHVuZGVmaW5lZD4oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgb3B0aW9ucz86IHtcbiAgICBwYXJzZU91dHB1dD86IFBhcnNlRXhlY091dHB1dEhhbmRsZXI8VCwgc3RyaW5nLCBFeGVjT3B0aW9ucz47XG4gIH0gJiBFeGVjT3B0aW9ucyAmIHtcbiAgICAgIGVuY29kaW5nPzogQnVmZmVyRW5jb2Rpbmc7XG4gICAgfSAmIEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPixcbik6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFQsIFU+O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUV4ZWM8VCA9IEJ1ZmZlciwgVSA9IHVuZGVmaW5lZD4oXG4gIGZpbGU6IHN0cmluZyxcbiAgLyoqXG4gICAqIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgZmlsZS4gTm8gZXNjYXBpbmcvcXVvdGluZyBpcyBuZWVkZWQuXG4gICAqXG4gICAqIElmIGRlZmluZWQsIHRoZSBjb21tYW5kcyBuZWVkcyB0byBiZSBhIGZpbGUgdG8gZXhlY3V0ZS4gSWYgdW5kZWZpbmVkLCB0aGUgYXJndW1lbnRzIHdpbGwgYmUgcGFyc2VkIGZyb20gdGhlIGNvbW1hbmQuXG4gICAqL1xuICBhcmdzOiBzdHJpbmdbXSxcbiAgb3B0aW9uczoge1xuICAgIHBhcnNlT3V0cHV0PzogUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBCdWZmZXIsIEV4ZWNPcHRpb25zPjtcbiAgfSAmIEV4ZWNPcHRpb25zICYge1xuICAgICAgZW5jb2Rpbmc6IFwiYnVmZmVyXCI7XG4gICAgfSAmIEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPixcbik6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFQsIFU+O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUV4ZWM8VCA9IHN0cmluZywgVSA9IHVuZGVmaW5lZD4oXG4gIGZpbGU6IHN0cmluZyxcbiAgLyoqXG4gICAqIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgZmlsZS4gTm8gZXNjYXBpbmcvcXVvdGluZyBpcyBuZWVkZWQuXG4gICAqXG4gICAqIElmIGRlZmluZWQsIHRoZSBjb21tYW5kcyBuZWVkcyB0byBiZSBhIGZpbGUgdG8gZXhlY3V0ZS4gSWYgdW5kZWZpbmVkLCB0aGUgYXJndW1lbnRzIHdpbGwgYmUgcGFyc2VkIGZyb20gdGhlIGNvbW1hbmQuXG4gICAqL1xuICBhcmdzOiBzdHJpbmdbXSxcbiAgb3B0aW9ucz86IHtcbiAgICBwYXJzZU91dHB1dD86IFBhcnNlRXhlY091dHB1dEhhbmRsZXI8VCwgc3RyaW5nLCBFeGVjT3B0aW9ucz47XG4gIH0gJiBFeGVjT3B0aW9ucyAmIHtcbiAgICAgIGVuY29kaW5nPzogQnVmZmVyRW5jb2Rpbmc7XG4gICAgfSAmIEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPixcbik6IFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlPFQsIFU+O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUV4ZWM8VCwgVSA9IHVuZGVmaW5lZD4oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgb3B0aW9uc09yQXJncz86XG4gICAgfCBzdHJpbmdbXVxuICAgIHwgKHtcbiAgICAgICAgcGFyc2VPdXRwdXQ/OiBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFQsIEJ1ZmZlciwgRXhlY09wdGlvbnM+IHwgUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBzdHJpbmcsIEV4ZWNPcHRpb25zPjtcbiAgICAgIH0gJiBFeGVjT3B0aW9ucyAmXG4gICAgICAgIEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPiksXG4gIG9wdGlvbnM/OiB7XG4gICAgcGFyc2VPdXRwdXQ/OiBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFQsIEJ1ZmZlciwgRXhlY09wdGlvbnM+IHwgUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBzdHJpbmcsIEV4ZWNPcHRpb25zPjtcbiAgfSAmIEV4ZWNPcHRpb25zICZcbiAgICBFeGVjQ2FjaGVkUHJvbWlzZU9wdGlvbnM8VCwgVT4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxULCBVPiB7XG4gIGNvbnN0IHtcbiAgICBwYXJzZU91dHB1dCxcbiAgICBpbnB1dCxcbiAgICBvbkRhdGEsXG4gICAgb25XaWxsRXhlY3V0ZSxcbiAgICBpbml0aWFsRGF0YSxcbiAgICBleGVjdXRlLFxuICAgIGtlZXBQcmV2aW91c0RhdGEsXG4gICAgb25FcnJvcixcbiAgICBmYWlsdXJlVG9hc3RPcHRpb25zLFxuICAgIC4uLmV4ZWNPcHRpb25zXG4gIH0gPSBBcnJheS5pc0FycmF5KG9wdGlvbnNPckFyZ3MpID8gb3B0aW9ucyB8fCB7fSA6IG9wdGlvbnNPckFyZ3MgfHwge307XG5cbiAgY29uc3QgdXNlQ2FjaGVkUHJvbWlzZU9wdGlvbnM6IEV4ZWNDYWNoZWRQcm9taXNlT3B0aW9uczxULCBVPiA9IHtcbiAgICBpbml0aWFsRGF0YSxcbiAgICBleGVjdXRlLFxuICAgIGtlZXBQcmV2aW91c0RhdGEsXG4gICAgb25FcnJvcixcbiAgICBvbkRhdGEsXG4gICAgb25XaWxsRXhlY3V0ZSxcbiAgICBmYWlsdXJlVG9hc3RPcHRpb25zLFxuICB9O1xuXG4gIGNvbnN0IGFib3J0YWJsZSA9IHVzZVJlZjxBYm9ydENvbnRyb2xsZXI+KG51bGwpO1xuICBjb25zdCBwYXJzZU91dHB1dFJlZiA9IHVzZUxhdGVzdChwYXJzZU91dHB1dCB8fCBkZWZhdWx0UGFyc2luZyk7XG5cbiAgY29uc3QgZm4gPSB1c2VDYWxsYmFjayhcbiAgICBhc3luYyAoX2NvbW1hbmQ6IHN0cmluZywgX2FyZ3M6IHN0cmluZ1tdLCBfb3B0aW9ucz86IEV4ZWNPcHRpb25zLCBpbnB1dD86IHN0cmluZyB8IEJ1ZmZlcikgPT4ge1xuICAgICAgY29uc3QgW2ZpbGUsIC4uLmFyZ3NdID0gcGFyc2VDb21tYW5kKF9jb21tYW5kLCBfYXJncyk7XG4gICAgICBjb25zdCBjb21tYW5kID0gW2ZpbGUsIC4uLmFyZ3NdLmpvaW4oXCIgXCIpO1xuXG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBzdHJpcEZpbmFsTmV3bGluZTogdHJ1ZSxcbiAgICAgICAgLi4uX29wdGlvbnMsXG4gICAgICAgIHRpbWVvdXQ6IF9vcHRpb25zPy50aW1lb3V0IHx8IDEwMDAwLFxuICAgICAgICBzaWduYWw6IGFib3J0YWJsZS5jdXJyZW50Py5zaWduYWwsXG4gICAgICAgIGVuY29kaW5nOiBfb3B0aW9ucz8uZW5jb2RpbmcgPT09IG51bGwgPyBcImJ1ZmZlclwiIDogX29wdGlvbnM/LmVuY29kaW5nIHx8IFwidXRmOFwiLFxuICAgICAgICBlbnY6IHsgUEFUSDogXCIvdXNyL2xvY2FsL2JpbjovdXNyL2JpbjovYmluOi91c3Ivc2Jpbjovc2JpblwiLCAuLi5wcm9jZXNzLmVudiwgLi4uX29wdGlvbnM/LmVudiB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3Qgc3Bhd25lZCA9IGNoaWxkUHJvY2Vzcy5zcGF3bihmaWxlLCBhcmdzLCBvcHRpb25zKTtcbiAgICAgIGNvbnN0IHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCwgb3B0aW9ucyk7XG5cbiAgICAgIGlmIChpbnB1dCkge1xuICAgICAgICBzcGF3bmVkLnN0ZGluLmVuZChpbnB1dCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IFt7IGVycm9yLCBleGl0Q29kZSwgc2lnbmFsLCB0aW1lZE91dCB9LCBzdGRvdXRSZXN1bHQsIHN0ZGVyclJlc3VsdF0gPSBhd2FpdCBnZXRTcGF3bmVkUmVzdWx0KFxuICAgICAgICBzcGF3bmVkLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBzcGF3bmVkUHJvbWlzZSxcbiAgICAgICk7XG4gICAgICBjb25zdCBzdGRvdXQgPSBoYW5kbGVPdXRwdXQob3B0aW9ucywgc3Rkb3V0UmVzdWx0KTtcbiAgICAgIGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dChvcHRpb25zLCBzdGRlcnJSZXN1bHQpO1xuXG4gICAgICByZXR1cm4gcGFyc2VPdXRwdXRSZWYuY3VycmVudCh7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdG9vIG1hbnkgZ2VuZXJpY3MsIEkgZ2l2ZSB1cFxuICAgICAgICBzdGRvdXQsXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdG9vIG1hbnkgZ2VuZXJpY3MsIEkgZ2l2ZSB1cFxuICAgICAgICBzdGRlcnIsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBleGl0Q29kZSxcbiAgICAgICAgc2lnbmFsLFxuICAgICAgICB0aW1lZE91dCxcbiAgICAgICAgY29tbWFuZCxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgcGFyZW50RXJyb3I6IG5ldyBFcnJvcigpLFxuICAgICAgfSkgYXMgVDtcbiAgICB9LFxuICAgIFtwYXJzZU91dHB1dFJlZl0sXG4gICk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBUIGNhbid0IGJlIGEgUHJvbWlzZSBzbyBpdCdzIGFjdHVhbGx5IHRoZSBzYW1lXG4gIHJldHVybiB1c2VDYWNoZWRQcm9taXNlKGZuLCBbY29tbWFuZCwgQXJyYXkuaXNBcnJheShvcHRpb25zT3JBcmdzKSA/IG9wdGlvbnNPckFyZ3MgOiBbXSwgZXhlY09wdGlvbnMsIGlucHV0XSwge1xuICAgIC4uLnVzZUNhY2hlZFByb21pc2VPcHRpb25zLFxuICAgIGFib3J0YWJsZSxcbiAgfSk7XG59XG4iLCAiaW1wb3J0IGNoaWxkUHJvY2VzcyBmcm9tIFwibm9kZTpjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgeyBjb25zdGFudHMgYXMgQnVmZmVyQ29uc3RhbnRzIH0gZnJvbSBcIm5vZGU6YnVmZmVyXCI7XG5pbXBvcnQgU3RyZWFtIGZyb20gXCJub2RlOnN0cmVhbVwiO1xuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSBcIm5vZGU6dXRpbFwiO1xuaW1wb3J0IHsgb25FeGl0IH0gZnJvbSBcIi4vdmVuZG9ycy9zaWduYWwtZXhpdFwiO1xuXG5leHBvcnQgdHlwZSBTcGF3bmVkUHJvbWlzZSA9IFByb21pc2U8e1xuICBleGl0Q29kZTogbnVtYmVyIHwgbnVsbDtcbiAgZXJyb3I/OiBFcnJvcjtcbiAgc2lnbmFsOiBOb2RlSlMuU2lnbmFscyB8IG51bGw7XG4gIHRpbWVkT3V0OiBib29sZWFuO1xufT47XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTcGF3bmVkUHJvbWlzZShcbiAgc3Bhd25lZDogY2hpbGRQcm9jZXNzLkNoaWxkUHJvY2Vzc1dpdGhvdXROdWxsU3RyZWFtcyxcbiAgeyB0aW1lb3V0IH06IHsgdGltZW91dD86IG51bWJlciB9ID0ge30sXG4pOiBTcGF3bmVkUHJvbWlzZSB7XG4gIGNvbnN0IHNwYXduZWRQcm9taXNlOiBTcGF3bmVkUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBzcGF3bmVkLm9uKFwiZXhpdFwiLCAoZXhpdENvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgcmVzb2x2ZSh7IGV4aXRDb2RlLCBzaWduYWwsIHRpbWVkT3V0OiBmYWxzZSB9KTtcbiAgICB9KTtcblxuICAgIHNwYXduZWQub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcbiAgICAgIHJlamVjdChlcnJvcik7XG4gICAgfSk7XG5cbiAgICBpZiAoc3Bhd25lZC5zdGRpbikge1xuICAgICAgc3Bhd25lZC5zdGRpbi5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCByZW1vdmVFeGl0SGFuZGxlciA9IG9uRXhpdCgoKSA9PiB7XG4gICAgc3Bhd25lZC5raWxsKCk7XG4gIH0pO1xuXG4gIGlmICh0aW1lb3V0ID09PSAwIHx8IHRpbWVvdXQgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBzcGF3bmVkUHJvbWlzZS5maW5hbGx5KCgpID0+IHJlbW92ZUV4aXRIYW5kbGVyKCkpO1xuICB9XG5cbiAgbGV0IHRpbWVvdXRJZDogTm9kZUpTLlRpbWVvdXQ7XG4gIGNvbnN0IHRpbWVvdXRQcm9taXNlOiBTcGF3bmVkUHJvbWlzZSA9IG5ldyBQcm9taXNlKChfcmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzcGF3bmVkLmtpbGwoXCJTSUdURVJNXCIpO1xuICAgICAgcmVqZWN0KE9iamVjdC5hc3NpZ24obmV3IEVycm9yKFwiVGltZWQgb3V0XCIpLCB7IHRpbWVkT3V0OiB0cnVlLCBzaWduYWw6IFwiU0lHVEVSTVwiIH0pKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfSk7XG5cbiAgY29uc3Qgc2FmZVNwYXduZWRQcm9taXNlID0gc3Bhd25lZFByb21pc2UuZmluYWxseSgoKSA9PiB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gIH0pO1xuXG4gIHJldHVybiBQcm9taXNlLnJhY2UoW3RpbWVvdXRQcm9taXNlLCBzYWZlU3Bhd25lZFByb21pc2VdKS5maW5hbGx5KCgpID0+IHJlbW92ZUV4aXRIYW5kbGVyKCkpO1xufVxuXG5jbGFzcyBNYXhCdWZmZXJFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoXCJUaGUgb3V0cHV0IGlzIHRvbyBiaWdcIik7XG4gICAgdGhpcy5uYW1lID0gXCJNYXhCdWZmZXJFcnJvclwiO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJ1ZmZlclN0cmVhbTxUIGV4dGVuZHMgc3RyaW5nIHwgQnVmZmVyPihvcHRpb25zOiB7IGVuY29kaW5nOiBCdWZmZXJFbmNvZGluZyB8IFwiYnVmZmVyXCIgfSkge1xuICBjb25zdCB7IGVuY29kaW5nIH0gPSBvcHRpb25zO1xuICBjb25zdCBpc0J1ZmZlciA9IGVuY29kaW5nID09PSBcImJ1ZmZlclwiO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgbWlzc2luZyB0aGUgbWV0aG9kcyB3ZSBhcmUgYWRkaW5nIGJlbG93XG4gIGNvbnN0IHN0cmVhbTogU3RyZWFtLlBhc3NUaHJvdWdoICYgeyBnZXRCdWZmZXJlZFZhbHVlOiAoKSA9PiBUOyBnZXRCdWZmZXJlZExlbmd0aDogKCkgPT4gbnVtYmVyIH0gPVxuICAgIG5ldyBTdHJlYW0uUGFzc1Rocm91Z2goeyBvYmplY3RNb2RlOiBmYWxzZSB9KTtcblxuICBpZiAoZW5jb2RpbmcgJiYgZW5jb2RpbmcgIT09IFwiYnVmZmVyXCIpIHtcbiAgICBzdHJlYW0uc2V0RW5jb2RpbmcoZW5jb2RpbmcpO1xuICB9XG5cbiAgbGV0IGxlbmd0aCA9IDA7XG4gIGNvbnN0IGNodW5rczogYW55W10gPSBbXTtcblxuICBzdHJlYW0ub24oXCJkYXRhXCIsIChjaHVuaykgPT4ge1xuICAgIGNodW5rcy5wdXNoKGNodW5rKTtcblxuICAgIGxlbmd0aCArPSBjaHVuay5sZW5ndGg7XG4gIH0pO1xuXG4gIHN0cmVhbS5nZXRCdWZmZXJlZFZhbHVlID0gKCkgPT4ge1xuICAgIHJldHVybiAoaXNCdWZmZXIgPyBCdWZmZXIuY29uY2F0KGNodW5rcywgbGVuZ3RoKSA6IGNodW5rcy5qb2luKFwiXCIpKSBhcyBUO1xuICB9O1xuXG4gIHN0cmVhbS5nZXRCdWZmZXJlZExlbmd0aCA9ICgpID0+IGxlbmd0aDtcblxuICByZXR1cm4gc3RyZWFtO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRTdHJlYW08VCBleHRlbmRzIHN0cmluZyB8IEJ1ZmZlcj4oXG4gIGlucHV0U3RyZWFtOiBTdHJlYW0uUmVhZGFibGUsXG4gIG9wdGlvbnM6IHsgZW5jb2Rpbmc6IEJ1ZmZlckVuY29kaW5nIHwgXCJidWZmZXJcIiB9LFxuKSB7XG4gIGNvbnN0IHN0cmVhbSA9IGJ1ZmZlclN0cmVhbTxUPihvcHRpb25zKTtcblxuICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgcmVqZWN0UHJvbWlzZSA9IChlcnJvcjogRXJyb3IgJiB7IGJ1ZmZlcmVkRGF0YT86IFQgfSkgPT4ge1xuICAgICAgLy8gRG9uJ3QgcmV0cmlldmUgYW4gb3ZlcnNpemVkIGJ1ZmZlci5cbiAgICAgIGlmIChlcnJvciAmJiBzdHJlYW0uZ2V0QnVmZmVyZWRMZW5ndGgoKSA8PSBCdWZmZXJDb25zdGFudHMuTUFYX0xFTkdUSCkge1xuICAgICAgICBlcnJvci5idWZmZXJlZERhdGEgPSBzdHJlYW0uZ2V0QnVmZmVyZWRWYWx1ZSgpO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoZXJyb3IpO1xuICAgIH07XG5cbiAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgcHJvbWlzaWZ5KFN0cmVhbS5waXBlbGluZSkoaW5wdXRTdHJlYW0sIHN0cmVhbSk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlamVjdFByb21pc2UoZXJyb3IgYXMgYW55KTtcbiAgICAgIH1cbiAgICB9KSgpO1xuXG4gICAgc3RyZWFtLm9uKFwiZGF0YVwiLCAoKSA9PiB7XG4gICAgICAvLyA4MG1iXG4gICAgICBpZiAoc3RyZWFtLmdldEJ1ZmZlcmVkTGVuZ3RoKCkgPiAxMDAwICogMTAwMCAqIDgwKSB7XG4gICAgICAgIHJlamVjdFByb21pc2UobmV3IE1heEJ1ZmZlckVycm9yKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gc3RyZWFtLmdldEJ1ZmZlcmVkVmFsdWUoKTtcbn1cblxuLy8gT24gZmFpbHVyZSwgYHJlc3VsdC5zdGRvdXR8c3RkZXJyYCBzaG91bGQgY29udGFpbiB0aGUgY3VycmVudGx5IGJ1ZmZlcmVkIHN0cmVhbVxuYXN5bmMgZnVuY3Rpb24gZ2V0QnVmZmVyZWREYXRhPFQgZXh0ZW5kcyBzdHJpbmcgfCBCdWZmZXI+KHN0cmVhbTogU3RyZWFtLlJlYWRhYmxlLCBzdHJlYW1Qcm9taXNlOiBQcm9taXNlPFQ+KSB7XG4gIHN0cmVhbS5kZXN0cm95KCk7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgc3RyZWFtUHJvbWlzZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gKGVycm9yIGFzIGFueSBhcyB7IGJ1ZmZlcmVkRGF0YTogVCB9KS5idWZmZXJlZERhdGE7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNwYXduZWRSZXN1bHQ8VCBleHRlbmRzIHN0cmluZyB8IEJ1ZmZlcj4oXG4gIHsgc3Rkb3V0LCBzdGRlcnIgfTogY2hpbGRQcm9jZXNzLkNoaWxkUHJvY2Vzc1dpdGhvdXROdWxsU3RyZWFtcyxcbiAgeyBlbmNvZGluZyB9OiB7IGVuY29kaW5nOiBCdWZmZXJFbmNvZGluZyB8IFwiYnVmZmVyXCIgfSxcbiAgcHJvY2Vzc0RvbmU6IFNwYXduZWRQcm9taXNlLFxuKSB7XG4gIGNvbnN0IHN0ZG91dFByb21pc2UgPSBnZXRTdHJlYW08VD4oc3Rkb3V0LCB7IGVuY29kaW5nIH0pO1xuICBjb25zdCBzdGRlcnJQcm9taXNlID0gZ2V0U3RyZWFtPFQ+KHN0ZGVyciwgeyBlbmNvZGluZyB9KTtcblxuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChbcHJvY2Vzc0RvbmUsIHN0ZG91dFByb21pc2UsIHN0ZGVyclByb21pc2VdKTtcbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICB7XG4gICAgICAgIGVycm9yOiBlcnJvciBhcyBFcnJvcixcbiAgICAgICAgZXhpdENvZGU6IG51bGwsXG4gICAgICAgIHNpZ25hbDogZXJyb3Iuc2lnbmFsIGFzIE5vZGVKUy5TaWduYWxzIHwgbnVsbCxcbiAgICAgICAgdGltZWRPdXQ6IChlcnJvci50aW1lZE91dCBhcyBib29sZWFuKSB8fCBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBnZXRCdWZmZXJlZERhdGEoc3Rkb3V0LCBzdGRvdXRQcm9taXNlKSxcbiAgICAgIGdldEJ1ZmZlcmVkRGF0YShzdGRlcnIsIHN0ZGVyclByb21pc2UpLFxuICAgIF0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0cmlwRmluYWxOZXdsaW5lPFQgZXh0ZW5kcyBzdHJpbmcgfCBCdWZmZXI+KGlucHV0OiBUKSB7XG4gIGNvbnN0IExGID0gdHlwZW9mIGlucHV0ID09PSBcInN0cmluZ1wiID8gXCJcXG5cIiA6IFwiXFxuXCIuY2hhckNvZGVBdCgwKTtcbiAgY29uc3QgQ1IgPSB0eXBlb2YgaW5wdXQgPT09IFwic3RyaW5nXCIgPyBcIlxcclwiIDogXCJcXHJcIi5jaGFyQ29kZUF0KDApO1xuXG4gIGlmIChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA9PT0gTEYpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHdlIGFyZSBkb2luZyBzb21lIG5hc3R5IHN0dWZmIGhlcmVcbiAgICBpbnB1dCA9IGlucHV0LnNsaWNlKDAsIC0xKTtcbiAgfVxuXG4gIGlmIChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA9PT0gQ1IpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHdlIGFyZSBkb2luZyBzb21lIG5hc3R5IHN0dWZmIGhlcmVcbiAgICBpbnB1dCA9IGlucHV0LnNsaWNlKDAsIC0xKTtcbiAgfVxuXG4gIHJldHVybiBpbnB1dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZU91dHB1dDxUIGV4dGVuZHMgc3RyaW5nIHwgQnVmZmVyPihvcHRpb25zOiB7IHN0cmlwRmluYWxOZXdsaW5lPzogYm9vbGVhbiB9LCB2YWx1ZTogVCkge1xuICBpZiAob3B0aW9ucy5zdHJpcEZpbmFsTmV3bGluZSkge1xuICAgIHJldHVybiBzdHJpcEZpbmFsTmV3bGluZSh2YWx1ZSk7XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGdldEVycm9yUHJlZml4KHtcbiAgdGltZWRPdXQsXG4gIHRpbWVvdXQsXG4gIHNpZ25hbCxcbiAgZXhpdENvZGUsXG59OiB7XG4gIGV4aXRDb2RlOiBudW1iZXIgfCBudWxsO1xuICBzaWduYWw6IE5vZGVKUy5TaWduYWxzIHwgbnVsbDtcbiAgdGltZWRPdXQ6IGJvb2xlYW47XG4gIHRpbWVvdXQ/OiBudW1iZXI7XG59KSB7XG4gIGlmICh0aW1lZE91dCkge1xuICAgIHJldHVybiBgdGltZWQgb3V0IGFmdGVyICR7dGltZW91dH0gbWlsbGlzZWNvbmRzYDtcbiAgfVxuXG4gIGlmIChzaWduYWwgIT09IHVuZGVmaW5lZCAmJiBzaWduYWwgIT09IG51bGwpIHtcbiAgICByZXR1cm4gYHdhcyBraWxsZWQgd2l0aCAke3NpZ25hbH1gO1xuICB9XG5cbiAgaWYgKGV4aXRDb2RlICE9PSB1bmRlZmluZWQgJiYgZXhpdENvZGUgIT09IG51bGwpIHtcbiAgICByZXR1cm4gYGZhaWxlZCB3aXRoIGV4aXQgY29kZSAke2V4aXRDb2RlfWA7XG4gIH1cblxuICByZXR1cm4gXCJmYWlsZWRcIjtcbn1cblxuZnVuY3Rpb24gbWFrZUVycm9yKHtcbiAgc3Rkb3V0LFxuICBzdGRlcnIsXG4gIGVycm9yLFxuICBzaWduYWwsXG4gIGV4aXRDb2RlLFxuICBjb21tYW5kLFxuICB0aW1lZE91dCxcbiAgb3B0aW9ucyxcbiAgcGFyZW50RXJyb3IsXG59OiB7XG4gIHN0ZG91dDogc3RyaW5nIHwgQnVmZmVyO1xuICBzdGRlcnI6IHN0cmluZyB8IEJ1ZmZlcjtcbiAgZXJyb3I/OiBFcnJvcjtcbiAgZXhpdENvZGU6IG51bWJlciB8IG51bGw7XG4gIHNpZ25hbDogTm9kZUpTLlNpZ25hbHMgfCBudWxsO1xuICB0aW1lZE91dDogYm9vbGVhbjtcbiAgY29tbWFuZDogc3RyaW5nO1xuICBvcHRpb25zPzogeyB0aW1lb3V0PzogbnVtYmVyIH07XG4gIHBhcmVudEVycm9yOiBFcnJvcjtcbn0pIHtcbiAgY29uc3QgcHJlZml4ID0gZ2V0RXJyb3JQcmVmaXgoeyB0aW1lZE91dCwgdGltZW91dDogb3B0aW9ucz8udGltZW91dCwgc2lnbmFsLCBleGl0Q29kZSB9KTtcbiAgY29uc3QgZXhlY2FNZXNzYWdlID0gYENvbW1hbmQgJHtwcmVmaXh9OiAke2NvbW1hbmR9YDtcbiAgY29uc3Qgc2hvcnRNZXNzYWdlID0gZXJyb3IgPyBgJHtleGVjYU1lc3NhZ2V9XFxuJHtlcnJvci5tZXNzYWdlfWAgOiBleGVjYU1lc3NhZ2U7XG4gIGNvbnN0IG1lc3NhZ2UgPSBbc2hvcnRNZXNzYWdlLCBzdGRlcnIsIHN0ZG91dF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cIik7XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBub3Qgb24gRXJyb3JcbiAgICBlcnJvci5vcmlnaW5hbE1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICB9IGVsc2Uge1xuICAgIGVycm9yID0gcGFyZW50RXJyb3I7XG4gIH1cblxuICBlcnJvci5tZXNzYWdlID0gbWVzc2FnZTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yIG5vdCBvbiBFcnJvclxuICBlcnJvci5zaG9ydE1lc3NhZ2UgPSBzaG9ydE1lc3NhZ2U7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3Igbm90IG9uIEVycm9yXG4gIGVycm9yLmNvbW1hbmQgPSBjb21tYW5kO1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIG5vdCBvbiBFcnJvclxuICBlcnJvci5leGl0Q29kZSA9IGV4aXRDb2RlO1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIG5vdCBvbiBFcnJvclxuICBlcnJvci5zaWduYWwgPSBzaWduYWw7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3Igbm90IG9uIEVycm9yXG4gIGVycm9yLnN0ZG91dCA9IHN0ZG91dDtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBub3Qgb24gRXJyb3JcbiAgZXJyb3Iuc3RkZXJyID0gc3RkZXJyO1xuXG4gIGlmIChcImJ1ZmZlcmVkRGF0YVwiIGluIGVycm9yKSB7XG4gICAgZGVsZXRlIGVycm9yW1wiYnVmZmVyZWREYXRhXCJdO1xuICB9XG5cbiAgcmV0dXJuIGVycm9yO1xufVxuXG5leHBvcnQgdHlwZSBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFxuICBULFxuICBEZWNvZGVkT3V0cHV0IGV4dGVuZHMgc3RyaW5nIHwgQnVmZmVyID0gc3RyaW5nIHwgQnVmZmVyLFxuICBPcHRpb25zID0gdW5rbm93bixcbj4gPSAoYXJnczoge1xuICAvKiogVGhlIG91dHB1dCBvZiB0aGUgcHJvY2VzcyBvbiBzdGRvdXQuICovXG4gIHN0ZG91dDogRGVjb2RlZE91dHB1dDtcbiAgLyoqIFRoZSBvdXRwdXQgb2YgdGhlIHByb2Nlc3Mgb24gc3RkZXJyLiAqL1xuICBzdGRlcnI6IERlY29kZWRPdXRwdXQ7XG4gIGVycm9yPzogRXJyb3I7XG4gIC8qKiBUaGUgbnVtZXJpYyBleGl0IGNvZGUgb2YgdGhlIHByb2Nlc3MgdGhhdCB3YXMgcnVuLiAqL1xuICBleGl0Q29kZTogbnVtYmVyIHwgbnVsbDtcbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBzaWduYWwgdGhhdCB3YXMgdXNlZCB0byB0ZXJtaW5hdGUgdGhlIHByb2Nlc3MuIEZvciBleGFtcGxlLCBTSUdGUEUuXG4gICAqXG4gICAqIElmIGEgc2lnbmFsIHRlcm1pbmF0ZWQgdGhlIHByb2Nlc3MsIHRoaXMgcHJvcGVydHkgaXMgZGVmaW5lZC4gT3RoZXJ3aXNlIGl0IGlzIG51bGwuXG4gICAqL1xuICBzaWduYWw6IE5vZGVKUy5TaWduYWxzIHwgbnVsbDtcbiAgLyoqIFdoZXRoZXIgdGhlIHByb2Nlc3MgdGltZWQgb3V0LiAqL1xuICB0aW1lZE91dDogYm9vbGVhbjtcbiAgLyoqIFRoZSBjb21tYW5kIHRoYXQgd2FzIHJ1biwgZm9yIGxvZ2dpbmcgcHVycG9zZXMuICovXG4gIGNvbW1hbmQ6IHN0cmluZztcbiAgb3B0aW9ucz86IE9wdGlvbnM7XG59KSA9PiBUO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdFBhcnNpbmc8VCBleHRlbmRzIHN0cmluZyB8IEJ1ZmZlcj4oe1xuICBzdGRvdXQsXG4gIHN0ZGVycixcbiAgZXJyb3IsXG4gIGV4aXRDb2RlLFxuICBzaWduYWwsXG4gIHRpbWVkT3V0LFxuICBjb21tYW5kLFxuICBvcHRpb25zLFxuICBwYXJlbnRFcnJvcixcbn06IHtcbiAgc3Rkb3V0OiBUO1xuICBzdGRlcnI6IFQ7XG4gIGVycm9yPzogRXJyb3I7XG4gIGV4aXRDb2RlOiBudW1iZXIgfCBudWxsO1xuICBzaWduYWw6IE5vZGVKUy5TaWduYWxzIHwgbnVsbDtcbiAgdGltZWRPdXQ6IGJvb2xlYW47XG4gIGNvbW1hbmQ6IHN0cmluZztcbiAgb3B0aW9ucz86IHsgdGltZW91dD86IG51bWJlciB9O1xuICBwYXJlbnRFcnJvcjogRXJyb3I7XG59KSB7XG4gIGlmIChlcnJvciB8fCBleGl0Q29kZSAhPT0gMCB8fCBzaWduYWwgIT09IG51bGwpIHtcbiAgICBjb25zdCByZXR1cm5lZEVycm9yID0gbWFrZUVycm9yKHtcbiAgICAgIGVycm9yLFxuICAgICAgZXhpdENvZGUsXG4gICAgICBzaWduYWwsXG4gICAgICBzdGRvdXQsXG4gICAgICBzdGRlcnIsXG4gICAgICBjb21tYW5kLFxuICAgICAgdGltZWRPdXQsXG4gICAgICBvcHRpb25zLFxuICAgICAgcGFyZW50RXJyb3IsXG4gICAgfSk7XG5cbiAgICB0aHJvdyByZXR1cm5lZEVycm9yO1xuICB9XG5cbiAgcmV0dXJuIHN0ZG91dDtcbn1cbiIsICIvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnQgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbi8vIE5vdGU6IHNpbmNlIG55YyB1c2VzIHRoaXMgbW9kdWxlIHRvIG91dHB1dCBjb3ZlcmFnZSwgYW55IGxpbmVzXG4vLyB0aGF0IGFyZSBpbiB0aGUgZGlyZWN0IHN5bmMgZmxvdyBvZiBueWMncyBvdXRwdXRDb3ZlcmFnZSBhcmVcbi8vIGlnbm9yZWQsIHNpbmNlIHdlIGNhbiBuZXZlciBnZXQgY292ZXJhZ2UgZm9yIHRoZW0uXG4vLyBncmFiIGEgcmVmZXJlbmNlIHRvIG5vZGUncyByZWFsIHByb2Nlc3Mgb2JqZWN0IHJpZ2h0IGF3YXlcblxuY29uc3QgcHJvY2Vzc09rID0gKHByb2Nlc3M6IGFueSkgPT5cbiAgISFwcm9jZXNzICYmXG4gIHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmXG4gIHR5cGVvZiBwcm9jZXNzLnJlbW92ZUxpc3RlbmVyID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gXCJmdW5jdGlvblwiICYmXG4gIHR5cGVvZiBwcm9jZXNzLnJlYWxseUV4aXQgPT09IFwiZnVuY3Rpb25cIiAmJlxuICB0eXBlb2YgcHJvY2Vzcy5saXN0ZW5lcnMgPT09IFwiZnVuY3Rpb25cIiAmJlxuICB0eXBlb2YgcHJvY2Vzcy5raWxsID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgdHlwZW9mIHByb2Nlc3MucGlkID09PSBcIm51bWJlclwiICYmXG4gIHR5cGVvZiBwcm9jZXNzLm9uID09PSBcImZ1bmN0aW9uXCI7XG5jb25zdCBrRXhpdEVtaXR0ZXIgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sLmZvcihcInNpZ25hbC1leGl0IGVtaXR0ZXJcIik7XG4vLyB0ZWVueSBzcGVjaWFsIHB1cnBvc2UgZWVcbmNsYXNzIEVtaXR0ZXIge1xuICBlbWl0dGVkID0ge1xuICAgIGFmdGVyRXhpdDogZmFsc2UsXG4gICAgZXhpdDogZmFsc2UsXG4gIH07XG4gIGxpc3RlbmVycyA9IHtcbiAgICBhZnRlckV4aXQ6IFtdLFxuICAgIGV4aXQ6IFtdLFxuICB9O1xuICBjb3VudCA9IDA7XG4gIGlkID0gTWF0aC5yYW5kb20oKTtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGlmIChnbG9iYWxba0V4aXRFbWl0dGVyXSkge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgcmV0dXJuIGdsb2JhbFtrRXhpdEVtaXR0ZXJdO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xvYmFsLCBrRXhpdEVtaXR0ZXIsIHtcbiAgICAgIHZhbHVlOiB0aGlzLFxuICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG4gIG9uKGV2OiBhbnksIGZuOiBhbnkpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy5saXN0ZW5lcnNbZXZdLnB1c2goZm4pO1xuICB9XG4gIHJlbW92ZUxpc3RlbmVyKGV2OiBhbnksIGZuOiBhbnkpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgbGlzdCA9IHRoaXMubGlzdGVuZXJzW2V2XTtcbiAgICBjb25zdCBpID0gbGlzdC5pbmRleE9mKGZuKTtcbiAgICAvKiBjOCBpZ25vcmUgc3RhcnQgKi9cbiAgICBpZiAoaSA9PT0gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLyogYzggaWdub3JlIHN0b3AgKi9cbiAgICBpZiAoaSA9PT0gMCAmJiBsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICB9XG4gIH1cbiAgZW1pdChldjogYW55LCBjb2RlOiBhbnksIHNpZ25hbDogYW55KTogYW55IHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgaWYgKHRoaXMuZW1pdHRlZFtldl0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHRoaXMuZW1pdHRlZFtldl0gPSB0cnVlO1xuICAgIGxldCByZXQgPSBmYWxzZTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgZm9yIChjb25zdCBmbiBvZiB0aGlzLmxpc3RlbmVyc1tldl0pIHtcbiAgICAgIHJldCA9IGZuKGNvZGUsIHNpZ25hbCkgPT09IHRydWUgfHwgcmV0O1xuICAgIH1cbiAgICBpZiAoZXYgPT09IFwiZXhpdFwiKSB7XG4gICAgICByZXQgPSB0aGlzLmVtaXQoXCJhZnRlckV4aXRcIiwgY29kZSwgc2lnbmFsKSB8fCByZXQ7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cbn1cblxuY2xhc3MgU2lnbmFsRXhpdEZhbGxiYWNrIHtcbiAgb25FeGl0KCkge1xuICAgIHJldHVybiAoKSA9PiB7fTtcbiAgfVxuICBsb2FkKCkge31cbiAgdW5sb2FkKCkge31cbn1cbmNsYXNzIFNpZ25hbEV4aXQge1xuICAvLyBcIlNJR0hVUFwiIHRocm93cyBhbiBgRU5PU1lTYCBlcnJvciBvbiBXaW5kb3dzLFxuICAvLyBzbyB1c2UgYSBzdXBwb3J0ZWQgc2lnbmFsIGluc3RlYWRcbiAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gIC8vIEB0cy1pZ25vcmVcbiAgI2h1cFNpZyA9IHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIiA/IFwiU0lHSU5UXCIgOiBcIlNJR0hVUFwiO1xuICAvKiBjOCBpZ25vcmUgc3RvcCAqL1xuICAjZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICNwcm9jZXNzOiBhbnk7XG4gICNvcmlnaW5hbFByb2Nlc3NFbWl0OiBhbnk7XG4gICNvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0OiBhbnk7XG4gICNzaWdMaXN0ZW5lcnMgPSB7fTtcbiAgI2xvYWRlZCA9IGZhbHNlO1xuICAjc2lnbmFsczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3RydWN0b3IocHJvY2VzczogYW55KSB7XG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBub3QgdGhlIHNldCBvZiBhbGwgcG9zc2libGUgc2lnbmFscy5cbiAgICAgKlxuICAgICAqIEl0IElTLCBob3dldmVyLCB0aGUgc2V0IG9mIGFsbCBzaWduYWxzIHRoYXQgdHJpZ2dlclxuICAgICAqIGFuIGV4aXQgb24gZWl0aGVyIExpbnV4IG9yIEJTRCBzeXN0ZW1zLiAgTGludXggaXMgYVxuICAgICAqIHN1cGVyc2V0IG9mIHRoZSBzaWduYWwgbmFtZXMgc3VwcG9ydGVkIG9uIEJTRCwgYW5kXG4gICAgICogdGhlIHVua25vd24gc2lnbmFscyBqdXN0IGZhaWwgdG8gcmVnaXN0ZXIsIHNvIHdlIGNhblxuICAgICAqIGNhdGNoIHRoYXQgZWFzaWx5IGVub3VnaC5cbiAgICAgKlxuICAgICAqIFdpbmRvd3Mgc2lnbmFscyBhcmUgYSBkaWZmZXJlbnQgc2V0LCBzaW5jZSB0aGVyZSBhcmVcbiAgICAgKiBzaWduYWxzIHRoYXQgdGVybWluYXRlIFdpbmRvd3MgcHJvY2Vzc2VzLCBidXQgZG9uJ3RcbiAgICAgKiB0ZXJtaW5hdGUgKG9yIGRvbid0IGV2ZW4gZXhpc3QpIG9uIFBvc2l4IHN5c3RlbXMuXG4gICAgICpcbiAgICAgKiBEb24ndCBib3RoZXIgd2l0aCBTSUdLSUxMLiAgSXQncyB1bmNhdGNoYWJsZSwgd2hpY2hcbiAgICAgKiBtZWFucyB0aGF0IHdlIGNhbid0IGZpcmUgYW55IGNhbGxiYWNrcyBhbnl3YXkuXG4gICAgICpcbiAgICAgKiBJZiBhIHVzZXIgZG9lcyBoYXBwZW4gdG8gcmVnaXN0ZXIgYSBoYW5kbGVyIG9uIGEgbm9uLVxuICAgICAqIGZhdGFsIHNpZ25hbCBsaWtlIFNJR1dJTkNIIG9yIHNvbWV0aGluZywgYW5kIHRoZW5cbiAgICAgKiBleGl0LCBpdCdsbCBlbmQgdXAgZmlyaW5nIGBwcm9jZXNzLmVtaXQoJ2V4aXQnKWAsIHNvXG4gICAgICogdGhlIGhhbmRsZXIgd2lsbCBiZSBmaXJlZCBhbnl3YXkuXG4gICAgICpcbiAgICAgKiBTSUdCVVMsIFNJR0ZQRSwgU0lHU0VHViBhbmQgU0lHSUxMLCB3aGVuIG5vdCByYWlzZWRcbiAgICAgKiBhcnRpZmljaWFsbHksIGluaGVyZW50bHkgbGVhdmUgdGhlIHByb2Nlc3MgaW4gYVxuICAgICAqIHN0YXRlIGZyb20gd2hpY2ggaXQgaXMgbm90IHNhZmUgdG8gdHJ5IGFuZCBlbnRlciBKU1xuICAgICAqIGxpc3RlbmVycy5cbiAgICAgKi9cbiAgICB0aGlzLiNzaWduYWxzLnB1c2goXCJTSUdIVVBcIiwgXCJTSUdJTlRcIiwgXCJTSUdURVJNXCIpO1xuICAgIGlmIChnbG9iYWxUaGlzLnByb2Nlc3MucGxhdGZvcm0gIT09IFwid2luMzJcIikge1xuICAgICAgdGhpcy4jc2lnbmFscy5wdXNoKFxuICAgICAgICBcIlNJR0FMUk1cIixcbiAgICAgICAgXCJTSUdBQlJUXCIsXG4gICAgICAgIFwiU0lHVlRBTFJNXCIsXG4gICAgICAgIFwiU0lHWENQVVwiLFxuICAgICAgICBcIlNJR1hGU1pcIixcbiAgICAgICAgXCJTSUdVU1IyXCIsXG4gICAgICAgIFwiU0lHVFJBUFwiLFxuICAgICAgICBcIlNJR1NZU1wiLFxuICAgICAgICBcIlNJR1FVSVRcIixcbiAgICAgICAgXCJTSUdJT1RcIixcbiAgICAgICAgLy8gc2hvdWxkIGRldGVjdCBwcm9maWxlciBhbmQgZW5hYmxlL2Rpc2FibGUgYWNjb3JkaW5nbHkuXG4gICAgICAgIC8vIHNlZSAjMjFcbiAgICAgICAgLy8gJ1NJR1BST0YnXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZ2xvYmFsVGhpcy5wcm9jZXNzLnBsYXRmb3JtID09PSBcImxpbnV4XCIpIHtcbiAgICAgIHRoaXMuI3NpZ25hbHMucHVzaChcIlNJR0lPXCIsIFwiU0lHUE9MTFwiLCBcIlNJR1BXUlwiLCBcIlNJR1NUS0ZMVFwiKTtcbiAgICB9XG4gICAgdGhpcy4jcHJvY2VzcyA9IHByb2Nlc3M7XG4gICAgLy8geyA8c2lnbmFsPjogPGxpc3RlbmVyIGZuPiwgLi4uIH1cbiAgICB0aGlzLiNzaWdMaXN0ZW5lcnMgPSB7fTtcbiAgICBmb3IgKGNvbnN0IHNpZyBvZiB0aGlzLiNzaWduYWxzKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0aGlzLiNzaWdMaXN0ZW5lcnNbc2lnXSA9ICgpID0+IHtcbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIG90aGVyIGxpc3RlbmVycywgYW4gZXhpdCBpcyBjb21pbmchXG4gICAgICAgIC8vIFNpbXBsZXN0IHdheTogcmVtb3ZlIHVzIGFuZCB0aGVuIHJlLXNlbmQgdGhlIHNpZ25hbC5cbiAgICAgICAgLy8gV2Uga25vdyB0aGF0IHRoaXMgd2lsbCBraWxsIHRoZSBwcm9jZXNzLCBzbyB3ZSBjYW5cbiAgICAgICAgLy8gc2FmZWx5IGVtaXQgbm93LlxuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLiNwcm9jZXNzLmxpc3RlbmVycyhzaWcpO1xuICAgICAgICBsZXQgeyBjb3VudCB9ID0gdGhpcy4jZW1pdHRlcjtcbiAgICAgICAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIHRoZSBmYWN0IHRoYXQgc2lnbmFsLWV4aXQgdjMgYW5kIHNpZ25hbFxuICAgICAgICAvLyBleGl0IHY0IGFyZSBub3QgYXdhcmUgb2YgZWFjaCBvdGhlciwgYW5kIGVhY2ggd2lsbCBhdHRlbXB0IHRvIGxldFxuICAgICAgICAvLyB0aGUgb3RoZXIgaGFuZGxlIGl0LCBzbyBuZWl0aGVyIG9mIHRoZW0gZG8uIFRvIGNvcnJlY3QgdGhpcywgd2VcbiAgICAgICAgLy8gZGV0ZWN0IGlmIHdlJ3JlIHRoZSBvbmx5IGhhbmRsZXIgKmV4Y2VwdCogZm9yIHByZXZpb3VzIHZlcnNpb25zXG4gICAgICAgIC8vIG9mIHNpZ25hbC1leGl0LCBhbmQgaW5jcmVtZW50IGJ5IHRoZSBjb3VudCBvZiBsaXN0ZW5lcnMgaXQgaGFzXG4gICAgICAgIC8vIGNyZWF0ZWQuXG4gICAgICAgIC8qIGM4IGlnbm9yZSBzdGFydCAqL1xuICAgICAgICBjb25zdCBwID0gcHJvY2VzcztcbiAgICAgICAgaWYgKHR5cGVvZiBwLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBwLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fLmNvdW50ID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgY291bnQgKz0gcC5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfXy5jb3VudDtcbiAgICAgICAgfVxuICAgICAgICAvKiBjOCBpZ25vcmUgc3RvcCAqL1xuICAgICAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gY291bnQpIHtcbiAgICAgICAgICB0aGlzLnVubG9hZCgpO1xuICAgICAgICAgIGNvbnN0IHJldCA9IHRoaXMuI2VtaXR0ZXIuZW1pdChcImV4aXRcIiwgbnVsbCwgc2lnKTtcbiAgICAgICAgICAvKiBjOCBpZ25vcmUgc3RhcnQgKi9cbiAgICAgICAgICBjb25zdCBzID0gc2lnID09PSBcIlNJR0hVUFwiID8gdGhpcy4jaHVwU2lnIDogc2lnO1xuICAgICAgICAgIGlmICghcmV0KSBwcm9jZXNzLmtpbGwocHJvY2Vzcy5waWQsIHMpO1xuICAgICAgICAgIC8qIGM4IGlnbm9yZSBzdG9wICovXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIHRoaXMuI29yaWdpbmFsUHJvY2Vzc1JlYWxseUV4aXQgPSBwcm9jZXNzLnJlYWxseUV4aXQ7XG4gICAgdGhpcy4jb3JpZ2luYWxQcm9jZXNzRW1pdCA9IHByb2Nlc3MuZW1pdDtcbiAgfVxuICBvbkV4aXQoY2I6IGFueSwgb3B0czogYW55KSB7XG4gICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgaWYgKCFwcm9jZXNzT2sodGhpcy4jcHJvY2VzcykpIHtcbiAgICAgIHJldHVybiAoKSA9PiB7fTtcbiAgICB9XG4gICAgLyogYzggaWdub3JlIHN0b3AgKi9cbiAgICBpZiAodGhpcy4jbG9hZGVkID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5sb2FkKCk7XG4gICAgfVxuICAgIGNvbnN0IGV2ID0gb3B0cz8uYWx3YXlzTGFzdCA/IFwiYWZ0ZXJFeGl0XCIgOiBcImV4aXRcIjtcbiAgICB0aGlzLiNlbWl0dGVyLm9uKGV2LCBjYik7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHRoaXMuI2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoZXYsIGNiKTtcbiAgICAgIGlmICh0aGlzLiNlbWl0dGVyLmxpc3RlbmVyc1tcImV4aXRcIl0ubGVuZ3RoID09PSAwICYmIHRoaXMuI2VtaXR0ZXIubGlzdGVuZXJzW1wiYWZ0ZXJFeGl0XCJdLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLnVubG9hZCgpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgbG9hZCgpIHtcbiAgICBpZiAodGhpcy4jbG9hZGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuI2xvYWRlZCA9IHRydWU7XG4gICAgLy8gVGhpcyBpcyB0aGUgbnVtYmVyIG9mIG9uU2lnbmFsRXhpdCdzIHRoYXQgYXJlIGluIHBsYXkuXG4gICAgLy8gSXQncyBpbXBvcnRhbnQgc28gdGhhdCB3ZSBjYW4gY291bnQgdGhlIGNvcnJlY3QgbnVtYmVyIG9mXG4gICAgLy8gbGlzdGVuZXJzIG9uIHNpZ25hbHMsIGFuZCBkb24ndCB3YWl0IGZvciB0aGUgb3RoZXIgb25lIHRvXG4gICAgLy8gaGFuZGxlIGl0IGluc3RlYWQgb2YgdXMuXG4gICAgdGhpcy4jZW1pdHRlci5jb3VudCArPSAxO1xuICAgIGZvciAoY29uc3Qgc2lnIG9mIHRoaXMuI3NpZ25hbHMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29uc3QgZm4gPSB0aGlzLiNzaWdMaXN0ZW5lcnNbc2lnXTtcbiAgICAgICAgaWYgKGZuKSB0aGlzLiNwcm9jZXNzLm9uKHNpZywgZm4pO1xuICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAvLyBuby1vcFxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLiNwcm9jZXNzLmVtaXQgPSAoZXY6IGFueSwgLi4uYTogYW55KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy4jcHJvY2Vzc0VtaXQoZXYsIC4uLmEpO1xuICAgIH07XG4gICAgdGhpcy4jcHJvY2Vzcy5yZWFsbHlFeGl0ID0gKGNvZGU6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuI3Byb2Nlc3NSZWFsbHlFeGl0KGNvZGUpO1xuICAgIH07XG4gIH1cbiAgdW5sb2FkKCkge1xuICAgIGlmICghdGhpcy4jbG9hZGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuI2xvYWRlZCA9IGZhbHNlO1xuICAgIHRoaXMuI3NpZ25hbHMuZm9yRWFjaCgoc2lnKSA9PiB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuI3NpZ0xpc3RlbmVyc1tzaWddO1xuICAgICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxpc3RlbmVyIG5vdCBkZWZpbmVkIGZvciBzaWduYWw6IFwiICsgc2lnKTtcbiAgICAgIH1cbiAgICAgIC8qIGM4IGlnbm9yZSBzdG9wICovXG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLiNwcm9jZXNzLnJlbW92ZUxpc3RlbmVyKHNpZywgbGlzdGVuZXIpO1xuICAgICAgICAvKiBjOCBpZ25vcmUgc3RhcnQgKi9cbiAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgLy8gbm8tb3BcbiAgICAgIH1cbiAgICAgIC8qIGM4IGlnbm9yZSBzdG9wICovXG4gICAgfSk7XG4gICAgdGhpcy4jcHJvY2Vzcy5lbWl0ID0gdGhpcy4jb3JpZ2luYWxQcm9jZXNzRW1pdDtcbiAgICB0aGlzLiNwcm9jZXNzLnJlYWxseUV4aXQgPSB0aGlzLiNvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0O1xuICAgIHRoaXMuI2VtaXR0ZXIuY291bnQgLT0gMTtcbiAgfVxuICAjcHJvY2Vzc1JlYWxseUV4aXQoY29kZTogYW55KSB7XG4gICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgaWYgKCFwcm9jZXNzT2sodGhpcy4jcHJvY2VzcykpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICB0aGlzLiNwcm9jZXNzLmV4aXRDb2RlID0gY29kZSB8fCAwO1xuICAgIC8qIGM4IGlnbm9yZSBzdG9wICovXG4gICAgdGhpcy4jZW1pdHRlci5lbWl0KFwiZXhpdFwiLCB0aGlzLiNwcm9jZXNzLmV4aXRDb2RlLCBudWxsKTtcbiAgICByZXR1cm4gdGhpcy4jb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdC5jYWxsKHRoaXMuI3Byb2Nlc3MsIHRoaXMuI3Byb2Nlc3MuZXhpdENvZGUpO1xuICB9XG4gICNwcm9jZXNzRW1pdChldjogYW55LCAuLi5hcmdzOiBhbnkpIHtcbiAgICBjb25zdCBvZyA9IHRoaXMuI29yaWdpbmFsUHJvY2Vzc0VtaXQ7XG4gICAgaWYgKGV2ID09PSBcImV4aXRcIiAmJiBwcm9jZXNzT2sodGhpcy4jcHJvY2VzcykpIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICB0aGlzLiNwcm9jZXNzLmV4aXRDb2RlID0gYXJnc1swXTtcbiAgICAgICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgICB9XG4gICAgICAvKiBjOCBpZ25vcmUgc3RhcnQgKi9cbiAgICAgIGNvbnN0IHJldCA9IG9nLmNhbGwodGhpcy4jcHJvY2VzcywgZXYsIC4uLmFyZ3MpO1xuICAgICAgLyogYzggaWdub3JlIHN0YXJ0ICovXG4gICAgICB0aGlzLiNlbWl0dGVyLmVtaXQoXCJleGl0XCIsIHRoaXMuI3Byb2Nlc3MuZXhpdENvZGUsIG51bGwpO1xuICAgICAgLyogYzggaWdub3JlIHN0b3AgKi9cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZy5jYWxsKHRoaXMuI3Byb2Nlc3MsIGV2LCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cbn1cblxubGV0IHNpZ25hbEV4aXQ6IFNpZ25hbEV4aXQgfCBTaWduYWxFeGl0RmFsbGJhY2sgfCBudWxsID0gbnVsbDtcblxuZXhwb3J0IGNvbnN0IG9uRXhpdCA9IChcbiAgY2I6IGFueSxcbiAgb3B0cz86IHtcbiAgICBhbHdheXNMYXN0PzogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgfSxcbikgPT4ge1xuICBpZiAoIXNpZ25hbEV4aXQpIHtcbiAgICBzaWduYWxFeGl0ID0gcHJvY2Vzc09rKHByb2Nlc3MpID8gbmV3IFNpZ25hbEV4aXQocHJvY2VzcykgOiBuZXcgU2lnbmFsRXhpdEZhbGxiYWNrKCk7XG4gIH1cbiAgcmV0dXJuIHNpZ25hbEV4aXQub25FeGl0KGNiLCBvcHRzKTtcbn07XG4iLCAiaW1wb3J0IHsgZW52aXJvbm1lbnQgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBjcmVhdGVSZWFkU3RyZWFtLCBjcmVhdGVXcml0ZVN0cmVhbSwgbWtkaXJTeW5jLCBTdGF0cyB9IGZyb20gXCJub2RlOmZzXCI7XG5pbXBvcnQgeyBzdGF0IH0gZnJvbSBcIm5vZGU6ZnMvcHJvbWlzZXNcIjtcbmltcG9ydCB7IGpvaW4sIG5vcm1hbGl6ZSB9IGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB7IHBpcGVsaW5lIH0gZnJvbSBcIm5vZGU6c3RyZWFtL3Byb21pc2VzXCI7XG5pbXBvcnQgeyB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBDaGFpbiBmcm9tIFwiLi92ZW5kb3JzL3N0cmVhbS1jaGFpblwiO1xuaW1wb3J0IHsgcGFyc2VyLCBQaWNrUGFyc2VyLCBTdHJlYW1BcnJheSB9IGZyb20gXCIuL3ZlbmRvcnMvc3RyZWFtLWpzb25cIjtcbmltcG9ydCB7IGlzSlNPTiB9IGZyb20gXCIuL2ZldGNoLXV0aWxzXCI7XG5pbXBvcnQgeyBGbGF0dGVuLCBGdW5jdGlvblJldHVybmluZ1BhZ2luYXRlZFByb21pc2UsIFVzZUNhY2hlZFByb21pc2VSZXR1cm5UeXBlIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IENhY2hlZFByb21pc2VPcHRpb25zLCB1c2VDYWNoZWRQcm9taXNlIH0gZnJvbSBcIi4vdXNlQ2FjaGVkUHJvbWlzZVwiO1xuaW1wb3J0IHsgaGFzaCB9IGZyb20gXCIuL2hlbHBlcnNcIjtcblxudHlwZSBSZXF1ZXN0SW5mbyA9IHN0cmluZyB8IFVSTCB8IGdsb2JhbFRoaXMuUmVxdWVzdDtcblxuYXN5bmMgZnVuY3Rpb24gY2FjaGUodXJsOiBSZXF1ZXN0SW5mbywgZGVzdGluYXRpb246IHN0cmluZywgZmV0Y2hPcHRpb25zPzogUmVxdWVzdEluaXQpIHtcbiAgaWYgKHR5cGVvZiB1cmwgPT09IFwib2JqZWN0XCIgfHwgdXJsLnN0YXJ0c1dpdGgoXCJodHRwOi8vXCIpIHx8IHVybC5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikpIHtcbiAgICByZXR1cm4gYXdhaXQgY2FjaGVVUkwodXJsLCBkZXN0aW5hdGlvbiwgZmV0Y2hPcHRpb25zKTtcbiAgfSBlbHNlIGlmICh1cmwuc3RhcnRzV2l0aChcImZpbGU6Ly9cIikpIHtcbiAgICByZXR1cm4gYXdhaXQgY2FjaGVGaWxlKFxuICAgICAgbm9ybWFsaXplKGRlY29kZVVSSUNvbXBvbmVudChuZXcgVVJMKHVybCkucGF0aG5hbWUpKSxcbiAgICAgIGRlc3RpbmF0aW9uLFxuICAgICAgZmV0Y2hPcHRpb25zPy5zaWduYWwgPyBmZXRjaE9wdGlvbnMuc2lnbmFsIDogdW5kZWZpbmVkLFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiT25seSBIVFRQKFMpIG9yIGZpbGUgVVJMcyBhcmUgc3VwcG9ydGVkXCIpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhY2hlVVJMKHVybDogUmVxdWVzdEluZm8sIGRlc3RpbmF0aW9uOiBzdHJpbmcsIGZldGNoT3B0aW9ucz86IFJlcXVlc3RJbml0KSB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCBmZXRjaE9wdGlvbnMpO1xuXG4gIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggVVJMXCIpO1xuICB9XG5cbiAgaWYgKCFpc0pTT04ocmVzcG9uc2UuaGVhZGVycy5nZXQoXCJjb250ZW50LXR5cGVcIikpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVVJMIGRvZXMgbm90IHJldHVybiBKU09OXCIpO1xuICB9XG4gIGlmICghcmVzcG9uc2UuYm9keSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byByZXRyaWV2ZSBleHBlY3RlZCBKU09OIGNvbnRlbnQ6IFJlc3BvbnNlIGJvZHkgaXMgbWlzc2luZyBvciBpbmFjY2Vzc2libGUuXCIpO1xuICB9XG4gIGF3YWl0IHBpcGVsaW5lKFxuICAgIHJlc3BvbnNlLmJvZHkgYXMgdW5rbm93biBhcyBOb2RlSlMuUmVhZGFibGVTdHJlYW0sXG4gICAgY3JlYXRlV3JpdGVTdHJlYW0oZGVzdGluYXRpb24pLFxuICAgIGZldGNoT3B0aW9ucz8uc2lnbmFsID8geyBzaWduYWw6IGZldGNoT3B0aW9ucy5zaWduYWwgfSA6IHVuZGVmaW5lZCxcbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2FjaGVGaWxlKHNvdXJjZTogc3RyaW5nLCBkZXN0aW5hdGlvbjogc3RyaW5nLCBhYm9ydFNpZ25hbD86IEFib3J0U2lnbmFsKSB7XG4gIGF3YWl0IHBpcGVsaW5lKFxuICAgIGNyZWF0ZVJlYWRTdHJlYW0oc291cmNlKSxcbiAgICBjcmVhdGVXcml0ZVN0cmVhbShkZXN0aW5hdGlvbiksXG4gICAgYWJvcnRTaWduYWwgPyB7IHNpZ25hbDogYWJvcnRTaWduYWwgfSA6IHVuZGVmaW5lZCxcbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2FjaGVVUkxJZk5lY2Vzc2FyeShcbiAgdXJsOiBSZXF1ZXN0SW5mbyxcbiAgZm9sZGVyOiBzdHJpbmcsXG4gIGZpbGVOYW1lOiBzdHJpbmcsXG4gIGZvcmNlVXBkYXRlOiBib29sZWFuLFxuICBmZXRjaE9wdGlvbnM/OiBSZXF1ZXN0SW5pdCxcbikge1xuICBjb25zdCBkZXN0aW5hdGlvbiA9IGpvaW4oZm9sZGVyLCBmaWxlTmFtZSk7XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBzdGF0KGZvbGRlcik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBta2RpclN5bmMoZm9sZGVyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICBhd2FpdCBjYWNoZSh1cmwsIGRlc3RpbmF0aW9uLCBmZXRjaE9wdGlvbnMpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoZm9yY2VVcGRhdGUpIHtcbiAgICBhd2FpdCBjYWNoZSh1cmwsIGRlc3RpbmF0aW9uLCBmZXRjaE9wdGlvbnMpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBzdGF0czogU3RhdHMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIHRyeSB7XG4gICAgc3RhdHMgPSBhd2FpdCBzdGF0KGRlc3RpbmF0aW9uKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGF3YWl0IGNhY2hlKHVybCwgZGVzdGluYXRpb24sIGZldGNoT3B0aW9ucyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB1cmwgPT09IFwib2JqZWN0XCIgfHwgdXJsLnN0YXJ0c1dpdGgoXCJodHRwOi8vXCIpIHx8IHVybC5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikpIHtcbiAgICBjb25zdCBoZWFkUmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHsgLi4uZmV0Y2hPcHRpb25zLCBtZXRob2Q6IFwiSEVBRFwiIH0pO1xuICAgIGlmICghaGVhZFJlc3BvbnNlLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZmV0Y2ggVVJMXCIpO1xuICAgIH1cblxuICAgIGlmICghaXNKU09OKGhlYWRSZXNwb25zZS5oZWFkZXJzLmdldChcImNvbnRlbnQtdHlwZVwiKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVSTCBkb2VzIG5vdCByZXR1cm4gSlNPTlwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0TW9kaWZpZWQgPSBEYXRlLnBhcnNlKGhlYWRSZXNwb25zZS5oZWFkZXJzLmdldChcImxhc3QtbW9kaWZpZWRcIikgPz8gXCJcIik7XG4gICAgaWYgKHN0YXRzLnNpemUgPT09IDAgfHwgTnVtYmVyLmlzTmFOKGxhc3RNb2RpZmllZCkgfHwgbGFzdE1vZGlmaWVkID4gc3RhdHMubXRpbWVNcykge1xuICAgICAgYXdhaXQgY2FjaGUodXJsLCBkZXN0aW5hdGlvbiwgZmV0Y2hPcHRpb25zKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gZWxzZSBpZiAodXJsLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNvdXJjZVN0YXRzID0gYXdhaXQgc3RhdChub3JtYWxpemUoZGVjb2RlVVJJQ29tcG9uZW50KG5ldyBVUkwodXJsKS5wYXRobmFtZSkpKTtcbiAgICAgIGlmIChzb3VyY2VTdGF0cy5tdGltZU1zID4gc3RhdHMubXRpbWVNcykge1xuICAgICAgICBhd2FpdCBjYWNoZSh1cmwsIGRlc3RpbmF0aW9uLCBmZXRjaE9wdGlvbnMpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdXJjZSBmaWxlIGNvdWxkIG5vdCBiZSByZWFkXCIpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJPbmx5IEhUVFAoUykgb3IgZmlsZSBVUkxzIGFyZSBzdXBwb3J0ZWRcIik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24qIHN0cmVhbUpzb25GaWxlPFQ+KFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICBwYWdlU2l6ZTogbnVtYmVyLFxuICBhYm9ydFNpZ25hbD86IEFib3J0U2lnbmFsLFxuICBkYXRhUGF0aD86IHN0cmluZyB8IFJlZ0V4cCxcbiAgZmlsdGVyRm4/OiAoaXRlbTogRmxhdHRlbjxUPikgPT4gYm9vbGVhbixcbiAgdHJhbnNmb3JtRm4/OiAoaXRlbTogYW55KSA9PiBULFxuKTogQXN5bmNHZW5lcmF0b3I8VCBleHRlbmRzIHVua25vd25bXSA/IFQgOiBUW10+IHtcbiAgbGV0IHBhZ2U6IFQgZXh0ZW5kcyB1bmtub3duW10gPyBUIDogVFtdID0gW10gYXMgVCBleHRlbmRzIHVua25vd25bXSA/IFQgOiBUW107XG5cbiAgY29uc3QgcGlwZWxpbmUgPSBDaGFpbihbXG4gICAgY3JlYXRlUmVhZFN0cmVhbShmaWxlUGF0aCksXG4gICAgZGF0YVBhdGggPyBQaWNrUGFyc2VyKHsgZmlsdGVyOiBkYXRhUGF0aCB9KSA6IHBhcnNlcigpLFxuICAgIFN0cmVhbUFycmF5KCksXG4gICAgKGRhdGE6IGFueSkgPT4gdHJhbnNmb3JtRm4/LihkYXRhLnZhbHVlKSA/PyBkYXRhLnZhbHVlLFxuICBdKTtcblxuICBhYm9ydFNpZ25hbD8uYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsICgpID0+IHtcbiAgICBwaXBlbGluZS5kZXN0cm95KCk7XG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgZm9yIGF3YWl0IChjb25zdCBkYXRhIG9mIHBpcGVsaW5lKSB7XG4gICAgICBpZiAoYWJvcnRTaWduYWw/LmFib3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgaWYgKCFmaWx0ZXJGbiB8fCBmaWx0ZXJGbihkYXRhKSkge1xuICAgICAgICBwYWdlLnB1c2goZGF0YSk7XG4gICAgICB9XG4gICAgICBpZiAocGFnZS5sZW5ndGggPj0gcGFnZVNpemUpIHtcbiAgICAgICAgeWllbGQgcGFnZTtcbiAgICAgICAgcGFnZSA9IFtdIGFzIFQgZXh0ZW5kcyB1bmtub3duW10gPyBUIDogVFtdO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIHBpcGVsaW5lLmRlc3Ryb3koKTtcbiAgICB0aHJvdyBlO1xuICB9XG5cbiAgaWYgKHBhZ2UubGVuZ3RoID4gMCkge1xuICAgIHlpZWxkIHBhZ2U7XG4gIH1cblxuICByZXR1cm4gW107XG59XG5cbnR5cGUgT3B0aW9uczxUPiA9IHtcbiAgLyoqXG4gICAqIFRoZSBob29rIGV4cGVjdHMgdG8gaXRlcmF0ZSB0aHJvdWdoIGFuIGFycmF5IG9mIGRhdGEsIHNvIGJ5IGRlZmF1bHQsIGl0IGFzc3VtZXMgdGhlIEpTT04gaXQgcmVjZWl2ZXMgaXRzZWxmIHJlcHJlc2VudHMgYW4gYXJyYXkuIEhvd2V2ZXIsIHNvbWV0aW1lcyB0aGUgYXJyYXkgb2YgZGF0YSBpcyB3cmFwcGVkIGluIGFuIG9iamVjdCxcbiAgICogaS5lLiBgeyBcInN1Y2Nlc3NcIjogdHJ1ZSwgXCJkYXRhXCI6IFvigKZdIH1gLCBvciBldmVuIGB7IFwic3VjY2Vzc1wiOiB0cnVlLCBcInJlc3VsdHNcIjogeyBcImRhdGFcIjogW+KApl0gfSB9YC4gSW4gdGhvc2UgY2FzZXMsIHlvdSBjYW4gdXNlIGBkYXRhUGF0aGAgdG8gc3BlY2lmeSB3aGVyZSB0aGUgZGF0YSBhcnJheSBjYW4gYmUgZm91bmQuXG4gICAqXG4gICAqIEByZW1hcmsgSWYgeW91ciBKU09OIG9iamVjdCBoYXMgbXVsdGlwbGUgYXJyYXlzIHRoYXQgeW91IHdhbnQgdG8gc3RyZWFtIGRhdGEgZnJvbSwgeW91IGNhbiBwYXNzIGEgcmVndWxhciBleHByZXNzaW9uIHRvIHN0cmVhbSB0aHJvdWdoIGFsbCBvZiB0aGVtLlxuICAgKlxuICAgKiBAZXhhbXBsZSBGb3IgYHsgXCJzdWNjZXNzXCI6IHRydWUsIFwiZGF0YVwiOiBb4oCmXSB9YCwgZGF0YVBhdGggd291bGQgYmUgYGRhdGFgXG4gICAqIEBleGFtcGxlIEZvciBgeyBcInN1Y2Nlc3NcIjogdHJ1ZSwgXCJyZXN1bHRzXCI6IHsgXCJkYXRhXCI6IFvigKZdIH0gfWAsIGRhdGFQYXRoIHdvdWxkIGJlIGByZXN1bHRzLmRhdGFgXG4gICAqIEBleGFtcGxlIEZvciBgeyBcInN1Y2Nlc3NcIjogdHJ1ZSwgXCJyZXN1bHRzXCI6IHsgXCJmaXJzdF9saXN0XCI6IFvigKZdLCBcInNlY29uZF9saXN0XCI6IFvigKZdLCBcInRoaXJkX2xpc3RcIjogW+KApl0gfSB9YCwgZGF0YVBhdGggd291bGQgYmUgYC9ecmVzdWx0c1xcLihmaXJzdF9saXN0fHNlY29uZF9saXN0fHRoaXJkX2xpc3QpJFxuL2AuXG4gICAqL1xuICBkYXRhUGF0aD86IHN0cmluZyB8IFJlZ0V4cDtcbiAgLyoqXG4gICAqIEEgZnVuY3Rpb24gdG8gZGVjaWRlIHdoZXRoZXIgYSBwYXJ0aWN1bGFyIGl0ZW0gc2hvdWxkIGJlIGtlcHQgb3Igbm90LlxuICAgKiBEZWZhdWx0cyB0byBgdW5kZWZpbmVkYCwga2VlcGluZyBhbnkgZW5jb3VudGVyZWQgaXRlbS5cbiAgICpcbiAgICogQHJlbWFyayBUaGUgaG9vayB3aWxsIHJldmFsaWRhdGUgZXZlcnkgdGltZSB0aGUgZmlsdGVyIGZ1bmN0aW9uIGNoYW5nZXMsIHNvIHlvdSBuZWVkIHRvIHVzZSBbdXNlQ2FsbGJhY2tdKGh0dHBzOi8vcmVhY3QuZGV2L3JlZmVyZW5jZS9yZWFjdC91c2VDYWxsYmFjaykgdG8gbWFrZSBzdXJlIGl0IG9ubHkgY2hhbmdlcyB3aGVuIGl0IG5lZWRzIHRvLlxuICAgKi9cbiAgZmlsdGVyPzogKGl0ZW06IEZsYXR0ZW48VD4pID0+IGJvb2xlYW47XG4gIC8qKlxuICAgKiBBIGZ1bmN0aW9uIHRvIGFwcGx5IHRvIGVhY2ggaXRlbSBhcyBpdCBpcyBlbmNvdW50ZXJlZC4gVXNlZnVsIGZvciBhIGNvdXBsZSBvZiB0aGluZ3M6XG4gICAqIDEuIGVuc3VyaW5nIHRoYXQgYWxsIGl0ZW1zIGhhdmUgdGhlIGV4cGVjdGVkIHByb3BlcnRpZXMsIGFuZCwgYXMgb24gb3B0aW1pemF0aW9uLCBmb3IgZ2V0dGluZyByaWQgb2YgdGhlIHByb3BlcnRpZXMgdGhhdCB5b3UgZG9uJ3QgY2FyZSBhYm91dC5cbiAgICogMi4gd2hlbiB0b3AtbGV2ZWwgb2JqZWN0cyBhY3R1YWxseSByZXByZXNlbnQgbmVzdGVkIGRhdGEsIHdoaWNoIHNob3VsZCBiZSBmbGF0dGVuZWQuIEluIHRoaXMgY2FzZSwgYHRyYW5zZm9ybWAgY2FuIHJldHVybiBhbiBhcnJheSBvZiBpdGVtcywgYW5kIHRoZSBob29rIHdpbGwgc3RyZWFtIHRocm91Z2ggZWFjaCBvbmUgb2YgdGhvc2UgaXRlbXMsXG4gICAqIHBhc3NpbmcgdGhlbSB0byBgZmlsdGVyYCBldGMuXG4gICAqXG4gICAqIERlZmF1bHRzIHRvIGEgcGFzc3Rocm91Z2ggZnVuY3Rpb24gaWYgbm90IHByb3ZpZGVkLlxuICAgKlxuICAgKiBAcmVtYXJrIFRoZSBob29rIHdpbGwgcmV2YWxpZGF0ZSBldmVyeSB0aW1lIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gY2hhbmdlcywgc28gaXQgaXMgaW1wb3J0YW50IHRvIHVzZSBbdXNlQ2FsbGJhY2tdKGh0dHBzOi8vcmVhY3QuZGV2L3JlZmVyZW5jZS9yZWFjdC91c2VDYWxsYmFjaykgdG8gZW5zdXJlIGl0IG9ubHkgY2hhbmdlcyB3aGVuIG5lY2Vzc2FyeSB0byBwcmV2ZW50IHVubmVjZXNzYXJ5IHJlLXJlbmRlcnMgb3IgY29tcHV0YXRpb25zLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGBcbiAgICogLy8gRm9yIGRhdGE6IGB7IFwiZGF0YVwiOiBbIHsgXCJ0eXBlXCI6IFwiZm9sZGVyXCIsIFwibmFtZVwiOiBcIml0ZW0gMVwiLCBcImNoaWxkcmVuXCI6IFsgeyBcInR5cGVcIjogXCJpdGVtXCIsIFwibmFtZVwiOiBcIml0ZW0gMlwiIH0sIHsgXCJ0eXBlXCI6IFwiaXRlbVwiLCBcIm5hbWVcIjogXCJpdGVtIDNcIiB9IF0gfSwgeyBcInR5cGVcIjogXCJmb2xkZXJcIiwgXCJuYW1lXCI6IFwiaXRlbSA0XCIsIGNoaWxkcmVuOiBbXSB9IF0gfWBcbiAgICpcbiAgICogdHlwZSBJdGVtID0ge1xuICAgKiAgdHlwZTogXCJpdGVtXCI7XG4gICAqICBuYW1lOiBzdHJpbmc7XG4gICAqIH07XG4gICAqXG4gICAqIHR5cGUgRm9sZGVyID0ge1xuICAgKiAgIHR5cGU6IFwiZm9sZGVyXCI7XG4gICAqICAgbmFtZTogc3RyaW5nO1xuICAgKiAgIGNoaWxkcmVuOiAoSXRlbSB8IEZvbGRlcilbXTtcbiAgICogfTtcbiAgICpcbiAgICogZnVuY3Rpb24gZmxhdHRlbihpdGVtOiBJdGVtIHwgRm9sZGVyKTogeyBuYW1lOiBzdHJpbmcgfVtdIHtcbiAgICogICBjb25zdCBmbGF0dGVuZWQ6IHsgbmFtZTogc3RyaW5nIH1bXSA9IFtdO1xuICAgKiAgIGlmIChpdGVtLnR5cGUgPT09IFwiZm9sZGVyXCIpIHtcbiAgICogICAgIGZsYXR0ZW5lZC5wdXNoKC4uLml0ZW0uY2hpbGRyZW4ubWFwKGZsYXR0ZW4pLmZsYXQoKSk7XG4gICAqICAgfVxuICAgKiAgIGlmIChpdGVtLnR5cGUgPT09IFwiaXRlbVwiKSB7XG4gICAqICAgICBmbGF0dGVuZWQucHVzaCh7IG5hbWU6IGl0ZW0ubmFtZSB9KTtcbiAgICogICB9XG4gICAqICAgcmV0dXJuIGZsYXR0ZW5lZDtcbiAgICogfVxuICAgKlxuICAgKiBjb25zdCB0cmFuc2Zvcm0gPSB1c2VDYWxsYmFjayhmbGF0dGVuLCBbXSk7XG4gICAqIGNvbnN0IGZpbHRlciA9IHVzZUNhbGxiYWNrKChpdGVtOiB7IG5hbWU6IHN0cmluZyB9KSA9PiB7XG4gICAqICAg4oCmXG4gICAqIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgdHJhbnNmb3JtPzogKGl0ZW06IGFueSkgPT4gVDtcbiAgLyoqXG4gICAqIFRoZSBhbW91bnQgb2YgaXRlbXMgdG8gcmV0dXJuIGZvciBlYWNoIHBhZ2UuXG4gICAqIERlZmF1bHRzIHRvIGAyMGAuXG4gICAqL1xuICBwYWdlU2l6ZT86IG51bWJlcjtcbn07XG5cbi8qKlxuICogVGFrZXMgYSBgaHR0cDovL2AsIGBodHRwczovL2Agb3IgYGZpbGU6Ly8vYCBVUkwgcG9pbnRpbmcgdG8gYSBKU09OIHJlc291cmNlLCBjYWNoZXMgaXQgdG8gdGhlIGNvbW1hbmQncyBzdXBwb3J0XG4gKiBmb2xkZXIsIGFuZCBzdHJlYW1zIHRocm91Z2ggaXRzIGNvbnRlbnQuIFVzZWZ1bCB3aGVuIGRlYWxpbmcgd2l0aCBsYXJnZSBKU09OIGFycmF5cyB3aGljaCB3b3VsZCBiZSB0b28gYmlnIHRvIGZpdFxuICogaW4gdGhlIGNvbW1hbmQncyBtZW1vcnkuXG4gKlxuICogQHJlbWFyayBUaGUgSlNPTiByZXNvdXJjZSBuZWVkcyB0byBjb25zaXN0IG9mIGFuIGFycmF5IG9mIG9iamVjdHNcbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyBMaXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgdXNlU3RyZWFtSlNPTiB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICpcbiAqIHR5cGUgRm9ybXVsYSA9IHsgbmFtZTogc3RyaW5nOyBkZXNjPzogc3RyaW5nIH07XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWFpbigpOiBSZWFjdC5KU1guRWxlbWVudCB7XG4gKiAgIGNvbnN0IHsgZGF0YSwgaXNMb2FkaW5nLCBwYWdpbmF0aW9uIH0gPSB1c2VTdHJlYW1KU09OPEZvcm11bGE+KFwiaHR0cHM6Ly9mb3JtdWxhZS5icmV3LnNoL2FwaS9mb3JtdWxhLmpzb25cIik7XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxMaXN0IGlzTG9hZGluZz17aXNMb2FkaW5nfSBwYWdpbmF0aW9uPXtwYWdpbmF0aW9ufT5cbiAqICAgICAgIDxMaXN0LlNlY3Rpb24gdGl0bGU9XCJGb3JtdWxhZVwiPlxuICogICAgICAgICB7ZGF0YT8ubWFwKChkKSA9PiA8TGlzdC5JdGVtIGtleT17ZC5uYW1lfSB0aXRsZT17ZC5uYW1lfSBzdWJ0aXRsZT17ZC5kZXNjfSAvPil9XG4gKiAgICAgICA8L0xpc3QuU2VjdGlvbj5cbiAqICAgICA8L0xpc3Q+XG4gKiAgICk7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyBMaXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgdXNlU3RyZWFtSlNPTiB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICogaW1wb3J0IHsgaG9tZWRpciB9IGZyb20gXCJvc1wiO1xuICogaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG4gKlxuICogdHlwZSBGb3JtdWxhID0geyBuYW1lOiBzdHJpbmc7IGRlc2M/OiBzdHJpbmcgfTtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBNYWluKCk6IFJlYWN0LkpTWC5FbGVtZW50IHtcbiAqICAgY29uc3QgeyBkYXRhLCBpc0xvYWRpbmcsIHBhZ2luYXRpb24gfSA9IHVzZVN0cmVhbUpTT048Rm9ybXVsYT4oYGZpbGU6Ly8vJHtqb2luKGhvbWVkaXIoKSwgXCJEb3dubG9hZHNcIiwgXCJmb3JtdWxhZS5qc29uXCIpfWApO1xuICpcbiAqICAgcmV0dXJuIChcbiAqICAgICA8TGlzdCBpc0xvYWRpbmc9e2lzTG9hZGluZ30gcGFnaW5hdGlvbj17cGFnaW5hdGlvbn0+XG4gKiAgICAgICA8TGlzdC5TZWN0aW9uIHRpdGxlPVwiRm9ybXVsYWVcIj5cbiAqICAgICAgICAge2RhdGE/Lm1hcCgoZCkgPT4gPExpc3QuSXRlbSBrZXk9e2QubmFtZX0gdGl0bGU9e2QubmFtZX0gc3VidGl0bGU9e2QuZGVzY30gLz4pfVxuICogICAgICAgPC9MaXN0LlNlY3Rpb24+XG4gKiAgICAgPC9MaXN0PlxuICogICApO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VTdHJlYW1KU09OPFQsIFUgPSB1bmtub3duPih1cmw6IFJlcXVlc3RJbmZvKTogVXNlQ2FjaGVkUHJvbWlzZVJldHVyblR5cGU8VCwgVT47XG5cbi8qKlxuICogVGFrZXMgYSBgaHR0cDovL2AsIGBodHRwczovL2Agb3IgYGZpbGU6Ly8vYCBVUkwgcG9pbnRpbmcgdG8gYSBKU09OIHJlc291cmNlLCBjYWNoZXMgaXQgdG8gdGhlIGNvbW1hbmQncyBzdXBwb3J0XG4gKiBmb2xkZXIsIGFuZCBzdHJlYW1zIHRocm91Z2ggaXRzIGNvbnRlbnQuIFVzZWZ1bCB3aGVuIGRlYWxpbmcgd2l0aCBsYXJnZSBKU09OIGFycmF5cyB3aGljaCB3b3VsZCBiZSB0b28gYmlnIHRvIGZpdFxuICogaW4gdGhlIGNvbW1hbmQncyBtZW1vcnkuXG4gKlxuICogQHJlbWFyayBUaGUgSlNPTiByZXNvdXJjZSBuZWVkcyB0byBjb25zaXN0IG9mIGFuIGFycmF5IG9mIG9iamVjdHNcbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyBMaXN0LCBlbnZpcm9ubWVudCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZVN0cmVhbUpTT04gfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqIGltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbiAqIGltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuICpcbiAqIHR5cGUgRm9ybXVsYSA9IHsgbmFtZTogc3RyaW5nOyBkZXNjPzogc3RyaW5nIH07XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWFpbigpOiBSZWFjdC5KU1guRWxlbWVudCB7XG4gKiAgIGNvbnN0IFtzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICpcbiAqICAgY29uc3QgZm9ybXVsYUZpbHRlciA9IHVzZUNhbGxiYWNrKFxuICogICAgIChpdGVtOiBGb3JtdWxhKSA9PiB7XG4gKiAgICAgICBpZiAoIXNlYXJjaFRleHQpIHJldHVybiB0cnVlO1xuICogICAgICAgcmV0dXJuIGl0ZW0ubmFtZS50b0xvY2FsZUxvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRleHQpO1xuICogICAgIH0sXG4gKiAgICAgW3NlYXJjaFRleHRdLFxuICogICApO1xuICpcbiAqICAgY29uc3QgZm9ybXVsYVRyYW5zZm9ybSA9IHVzZUNhbGxiYWNrKChpdGVtOiBhbnkpOiBGb3JtdWxhID0+IHtcbiAqICAgICByZXR1cm4geyBuYW1lOiBpdGVtLm5hbWUsIGRlc2M6IGl0ZW0uZGVzYyB9O1xuICogICB9LCBbXSk7XG4gKlxuICogICBjb25zdCB7IGRhdGEsIGlzTG9hZGluZywgcGFnaW5hdGlvbiB9ID0gdXNlU3RyZWFtSlNPTihcImh0dHBzOi8vZm9ybXVsYWUuYnJldy5zaC9hcGkvZm9ybXVsYS5qc29uXCIsIHtcbiAqICAgICBpbml0aWFsRGF0YTogW10gYXMgRm9ybXVsYVtdLFxuICogICAgIHBhZ2VTaXplOiAyMCxcbiAqICAgICBmaWx0ZXI6IGZvcm11bGFGaWx0ZXIsXG4gKiAgICAgdHJhbnNmb3JtOiBmb3JtdWxhVHJhbnNmb3JtLFxuICogICB9KTtcbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9IHBhZ2luYXRpb249e3BhZ2luYXRpb259IG9uU2VhcmNoVGV4dENoYW5nZT17c2V0U2VhcmNoVGV4dH0+XG4gKiAgICAgICA8TGlzdC5TZWN0aW9uIHRpdGxlPVwiRm9ybXVsYWVcIj5cbiAqICAgICAgICAge2RhdGEubWFwKChkKSA9PiAoXG4gKiAgICAgICAgICAgPExpc3QuSXRlbSBrZXk9e2QubmFtZX0gdGl0bGU9e2QubmFtZX0gc3VidGl0bGU9e2QuZGVzY30gLz5cbiAqICAgICAgICAgKSl9XG4gKiAgICAgICA8L0xpc3QuU2VjdGlvbj5cbiAqICAgICA8L0xpc3Q+XG4gKiAgICk7XG4gKiB9XG4gKiBgYGAgc3VwcG9ydCBmb2xkZXIsIGFuZCBzdHJlYW1zIHRocm91Z2ggaXRzIGNvbnRlbnQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgTGlzdCwgZW52aXJvbm1lbnQgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG4gKiBpbXBvcnQgeyB1c2VTdHJlYW1KU09OIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKiBpbXBvcnQgeyBqb2luIH0gZnJvbSBcInBhdGhcIjtcbiAqIGltcG9ydCB7IGhvbWVkaXIgfSBmcm9tIFwib3NcIjtcbiAqIGltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuICpcbiAqIHR5cGUgRm9ybXVsYSA9IHsgbmFtZTogc3RyaW5nOyBkZXNjPzogc3RyaW5nIH07XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWFpbigpOiBSZWFjdC5KU1guRWxlbWVudCB7XG4gKiAgIGNvbnN0IFtzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICpcbiAqICAgY29uc3QgZm9ybXVsYUZpbHRlciA9IHVzZUNhbGxiYWNrKFxuICogICAgIChpdGVtOiBGb3JtdWxhKSA9PiB7XG4gKiAgICAgICBpZiAoIXNlYXJjaFRleHQpIHJldHVybiB0cnVlO1xuICogICAgICAgcmV0dXJuIGl0ZW0ubmFtZS50b0xvY2FsZUxvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRleHQpO1xuICogICAgIH0sXG4gKiAgICAgW3NlYXJjaFRleHRdLFxuICogICApO1xuICpcbiAqICAgY29uc3QgZm9ybXVsYVRyYW5zZm9ybSA9IHVzZUNhbGxiYWNrKChpdGVtOiBhbnkpOiBGb3JtdWxhID0+IHtcbiAqICAgICByZXR1cm4geyBuYW1lOiBpdGVtLm5hbWUsIGRlc2M6IGl0ZW0uZGVzYyB9O1xuICogICB9LCBbXSk7XG4gKlxuICogICBjb25zdCB7IGRhdGEsIGlzTG9hZGluZywgcGFnaW5hdGlvbiB9ID0gdXNlU3RyZWFtSlNPTihgZmlsZTovLy8ke2pvaW4oaG9tZWRpcigpLCBcIkRvd25sb2Fkc1wiLCBcImZvcm11bGFlLmpzb25cIil9YCwge1xuICogICAgIGluaXRpYWxEYXRhOiBbXSBhcyBGb3JtdWxhW10sXG4gKiAgICAgcGFnZVNpemU6IDIwLFxuICogICAgIGZpbHRlcjogZm9ybXVsYUZpbHRlcixcbiAqICAgICB0cmFuc2Zvcm06IGZvcm11bGFUcmFuc2Zvcm0sXG4gKiAgIH0pO1xuICpcbiAqICAgcmV0dXJuIChcbiAqICAgICA8TGlzdCBpc0xvYWRpbmc9e2lzTG9hZGluZ30gcGFnaW5hdGlvbj17cGFnaW5hdGlvbn0gb25TZWFyY2hUZXh0Q2hhbmdlPXtzZXRTZWFyY2hUZXh0fT5cbiAqICAgICAgIDxMaXN0LlNlY3Rpb24gdGl0bGU9XCJGb3JtdWxhZVwiPlxuICogICAgICAgICB7ZGF0YS5tYXAoKGQpID0+IChcbiAqICAgICAgICAgICA8TGlzdC5JdGVtIGtleT17ZC5uYW1lfSB0aXRsZT17ZC5uYW1lfSBzdWJ0aXRsZT17ZC5kZXNjfSAvPlxuICogICAgICAgICApKX1cbiAqICAgICAgIDwvTGlzdC5TZWN0aW9uPlxuICogICAgIDwvTGlzdD5cbiAqICAgKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlU3RyZWFtSlNPTjxULCBVIGV4dGVuZHMgYW55W10gPSBhbnlbXT4oXG4gIHVybDogUmVxdWVzdEluZm8sXG4gIG9wdGlvbnM6IE9wdGlvbnM8VD4gJiBSZXF1ZXN0SW5pdCAmIE9taXQ8Q2FjaGVkUHJvbWlzZU9wdGlvbnM8RnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLCBVPiwgXCJhYm9ydGFibGVcIj4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxUIGV4dGVuZHMgdW5rbm93bltdID8gVCA6IFRbXSwgVT47XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VTdHJlYW1KU09OPFQsIFUgZXh0ZW5kcyBhbnlbXSA9IGFueVtdPihcbiAgdXJsOiBSZXF1ZXN0SW5mbyxcbiAgb3B0aW9ucz86IE9wdGlvbnM8VD4gJiBSZXF1ZXN0SW5pdCAmIE9taXQ8Q2FjaGVkUHJvbWlzZU9wdGlvbnM8RnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLCBVPiwgXCJhYm9ydGFibGVcIj4sXG4pOiBVc2VDYWNoZWRQcm9taXNlUmV0dXJuVHlwZTxUIGV4dGVuZHMgdW5rbm93bltdID8gVCA6IFRbXSwgVT4ge1xuICBjb25zdCB7XG4gICAgaW5pdGlhbERhdGEsXG4gICAgZXhlY3V0ZSxcbiAgICBrZWVwUHJldmlvdXNEYXRhLFxuICAgIG9uRXJyb3IsXG4gICAgb25EYXRhLFxuICAgIG9uV2lsbEV4ZWN1dGUsXG4gICAgZmFpbHVyZVRvYXN0T3B0aW9ucyxcbiAgICBkYXRhUGF0aCxcbiAgICBmaWx0ZXIsXG4gICAgdHJhbnNmb3JtLFxuICAgIHBhZ2VTaXplID0gMjAsXG4gICAgLi4uZmV0Y2hPcHRpb25zXG4gIH0gPSBvcHRpb25zID8/IHt9O1xuICBjb25zdCBwcmV2aW91c1VybCA9IHVzZVJlZjxSZXF1ZXN0SW5mbz4obnVsbCk7XG4gIGNvbnN0IHByZXZpb3VzRGVzdGluYXRpb24gPSB1c2VSZWY8c3RyaW5nPihudWxsKTtcblxuICBjb25zdCB1c2VDYWNoZWRQcm9taXNlT3B0aW9uczogQ2FjaGVkUHJvbWlzZU9wdGlvbnM8RnVuY3Rpb25SZXR1cm5pbmdQYWdpbmF0ZWRQcm9taXNlLCBVPiA9IHtcbiAgICBpbml0aWFsRGF0YSxcbiAgICBleGVjdXRlLFxuICAgIGtlZXBQcmV2aW91c0RhdGEsXG4gICAgb25FcnJvcixcbiAgICBvbkRhdGEsXG4gICAgb25XaWxsRXhlY3V0ZSxcbiAgICBmYWlsdXJlVG9hc3RPcHRpb25zLFxuICB9O1xuXG4gIGNvbnN0IGdlbmVyYXRvclJlZiA9IHVzZVJlZjxBc3luY0dlbmVyYXRvcjxUIGV4dGVuZHMgdW5rbm93bltdID8gVCA6IFRbXT4gfCBudWxsPihudWxsKTtcbiAgY29uc3QgY29udHJvbGxlclJlZiA9IHVzZVJlZjxBYm9ydENvbnRyb2xsZXIgfCBudWxsPihudWxsKTtcbiAgY29uc3QgaGFzTW9yZVJlZiA9IHVzZVJlZihmYWxzZSk7XG5cbiAgcmV0dXJuIHVzZUNhY2hlZFByb21pc2UoXG4gICAgKFxuICAgICAgdXJsOiBSZXF1ZXN0SW5mbyxcbiAgICAgIHBhZ2VTaXplOiBudW1iZXIsXG4gICAgICBmZXRjaE9wdGlvbnM6IFJlcXVlc3RJbml0IHwgdW5kZWZpbmVkLFxuICAgICAgZGF0YVBhdGg6IHN0cmluZyB8IFJlZ0V4cCB8IHVuZGVmaW5lZCxcbiAgICAgIGZpbHRlcjogKChpdGVtOiBGbGF0dGVuPFQ+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCxcbiAgICAgIHRyYW5zZm9ybTogKChpdGVtOiB1bmtub3duKSA9PiBUKSB8IHVuZGVmaW5lZCxcbiAgICApID0+XG4gICAgICBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBoYXNoKHVybCkgKyBcIi5qc29uXCI7XG4gICAgICAgIGNvbnN0IGZvbGRlciA9IGVudmlyb25tZW50LnN1cHBvcnRQYXRoO1xuICAgICAgICBpZiAocGFnZSA9PT0gMCkge1xuICAgICAgICAgIGNvbnRyb2xsZXJSZWYuY3VycmVudD8uYWJvcnQoKTtcbiAgICAgICAgICBjb250cm9sbGVyUmVmLmN1cnJlbnQgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgY29uc3QgZGVzdGluYXRpb24gPSBqb2luKGZvbGRlciwgZmlsZU5hbWUpO1xuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZvcmNlIHVwZGF0ZSB0aGUgY2FjaGUgd2hlbiB0aGUgVVJMIGNoYW5nZXMgYnV0IHRoZSBjYWNoZSBkZXN0aW5hdGlvbiBkb2VzIG5vdC5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICBjb25zdCBmb3JjZUNhY2hlVXBkYXRlID0gQm9vbGVhbihcbiAgICAgICAgICAgIHByZXZpb3VzVXJsLmN1cnJlbnQgJiZcbiAgICAgICAgICAgICAgcHJldmlvdXNVcmwuY3VycmVudCAhPT0gdXJsICYmXG4gICAgICAgICAgICAgIHByZXZpb3VzRGVzdGluYXRpb24uY3VycmVudCAmJlxuICAgICAgICAgICAgICBwcmV2aW91c0Rlc3RpbmF0aW9uLmN1cnJlbnQgPT09IGRlc3RpbmF0aW9uLFxuICAgICAgICAgICk7XG4gICAgICAgICAgcHJldmlvdXNVcmwuY3VycmVudCA9IHVybDtcbiAgICAgICAgICBwcmV2aW91c0Rlc3RpbmF0aW9uLmN1cnJlbnQgPSBkZXN0aW5hdGlvbjtcbiAgICAgICAgICBhd2FpdCBjYWNoZVVSTElmTmVjZXNzYXJ5KHVybCwgZm9sZGVyLCBmaWxlTmFtZSwgZm9yY2VDYWNoZVVwZGF0ZSwge1xuICAgICAgICAgICAgLi4uZmV0Y2hPcHRpb25zLFxuICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyUmVmLmN1cnJlbnQ/LnNpZ25hbCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBnZW5lcmF0b3JSZWYuY3VycmVudCA9IHN0cmVhbUpzb25GaWxlKFxuICAgICAgICAgICAgZGVzdGluYXRpb24sXG4gICAgICAgICAgICBwYWdlU2l6ZSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJSZWYuY3VycmVudD8uc2lnbmFsLFxuICAgICAgICAgICAgZGF0YVBhdGgsXG4gICAgICAgICAgICBmaWx0ZXIsXG4gICAgICAgICAgICB0cmFuc2Zvcm0sXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWdlbmVyYXRvclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgcmV0dXJuIHsgaGFzTW9yZTogaGFzTW9yZVJlZi5jdXJyZW50LCBkYXRhOiBbXSBhcyBUIGV4dGVuZHMgdW5rbm93bltdID8gVCA6IFRbXSB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgdmFsdWU6IG5ld0RhdGEsIGRvbmUgfSA9IGF3YWl0IGdlbmVyYXRvclJlZi5jdXJyZW50Lm5leHQoKTtcbiAgICAgICAgaGFzTW9yZVJlZi5jdXJyZW50ID0gIWRvbmU7XG4gICAgICAgIHJldHVybiB7IGhhc01vcmU6IGhhc01vcmVSZWYuY3VycmVudCwgZGF0YTogKG5ld0RhdGEgPz8gW10pIGFzIFQgZXh0ZW5kcyB1bmtub3duW10gPyBUIDogVFtdIH07XG4gICAgICB9LFxuICAgIFt1cmwsIHBhZ2VTaXplLCBmZXRjaE9wdGlvbnMsIGRhdGFQYXRoLCBmaWx0ZXIsIHRyYW5zZm9ybV0sXG4gICAgdXNlQ2FjaGVkUHJvbWlzZU9wdGlvbnMsXG4gICk7XG59XG4iLCAiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSAqL1xuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50ICovXG5pbXBvcnQgeyBSZWFkYWJsZSwgV3JpdGFibGUsIER1cGxleCB9IGZyb20gXCJub2RlOnN0cmVhbVwiO1xuXG5leHBvcnQgY29uc3Qgbm9uZSA9IC8qICNfX1BVUkVfXyAqLyBTeW1ib2wuZm9yKFwib2JqZWN0LXN0cmVhbS5ub25lXCIpO1xuY29uc3Qgc3RvcCA9IC8qICNfX1BVUkVfXyAqLyBTeW1ib2wuZm9yKFwib2JqZWN0LXN0cmVhbS5zdG9wXCIpO1xuXG5jb25zdCBmaW5hbFN5bWJvbCA9IC8qICNfX1BVUkVfXyAqLyBTeW1ib2wuZm9yKFwib2JqZWN0LXN0cmVhbS5maW5hbFwiKTtcbmNvbnN0IG1hbnlTeW1ib2wgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sLmZvcihcIm9iamVjdC1zdHJlYW0ubWFueVwiKTtcbmNvbnN0IGZsdXNoU3ltYm9sID0gLyogI19fUFVSRV9fICovIFN5bWJvbC5mb3IoXCJvYmplY3Qtc3RyZWFtLmZsdXNoXCIpO1xuY29uc3QgZkxpc3RTeW1ib2wgPSAvKiAjX19QVVJFX18gKi8gU3ltYm9sLmZvcihcIm9iamVjdC1zdHJlYW0uZkxpc3RcIik7XG5cbmNvbnN0IGZpbmFsVmFsdWUgPSAodmFsdWU6IGFueSkgPT4gKHsgW2ZpbmFsU3ltYm9sXTogMSwgdmFsdWUgfSk7XG5leHBvcnQgY29uc3QgbWFueSA9ICh2YWx1ZXM6IGFueSkgPT4gKHsgW21hbnlTeW1ib2xdOiAxLCB2YWx1ZXMgfSk7XG5cbmNvbnN0IGlzRmluYWxWYWx1ZSA9IChvOiBhbnkpID0+IG8gJiYgb1tmaW5hbFN5bWJvbF0gPT09IDE7XG5jb25zdCBpc01hbnkgPSAobzogYW55KSA9PiBvICYmIG9bbWFueVN5bWJvbF0gPT09IDE7XG5jb25zdCBpc0ZsdXNoYWJsZSA9IChvOiBhbnkpID0+IG8gJiYgb1tmbHVzaFN5bWJvbF0gPT09IDE7XG5jb25zdCBpc0Z1bmN0aW9uTGlzdCA9IChvOiBhbnkpID0+IG8gJiYgb1tmTGlzdFN5bWJvbF0gPT09IDE7XG5cbmNvbnN0IGdldEZpbmFsVmFsdWUgPSAobzogYW55KSA9PiBvLnZhbHVlO1xuY29uc3QgZ2V0TWFueVZhbHVlcyA9IChvOiBhbnkpID0+IG8udmFsdWVzO1xuY29uc3QgZ2V0RnVuY3Rpb25MaXN0ID0gKG86IGFueSkgPT4gby5mTGlzdDtcblxuZXhwb3J0IGNvbnN0IGNvbWJpbmVNYW55TXV0ID0gKGE6IGFueSwgYjogYW55KSA9PiB7XG4gIGNvbnN0IHZhbHVlcyA9IGEgPT09IG5vbmUgPyBbXSA6IGE/LlttYW55U3ltYm9sXSA9PT0gMSA/IGEudmFsdWVzIDogW2FdO1xuICBpZiAoYiA9PT0gbm9uZSkge1xuICAgIC8vIGRvIG5vdGhpbmdcbiAgfSBlbHNlIGlmIChiPy5bbWFueVN5bWJvbF0gPT09IDEpIHtcbiAgICB2YWx1ZXMucHVzaCguLi5iLnZhbHVlcyk7XG4gIH0gZWxzZSB7XG4gICAgdmFsdWVzLnB1c2goYik7XG4gIH1cbiAgcmV0dXJuIG1hbnkodmFsdWVzKTtcbn07XG5cbmV4cG9ydCBjb25zdCBmbHVzaGFibGUgPSAod3JpdGU6ICh2YWx1ZTogYW55KSA9PiBhbnksIGZpbmFsID0gbnVsbCkgPT4ge1xuICBjb25zdCBmbiA9IGZpbmFsID8gKHZhbHVlOiBhbnkpID0+ICh2YWx1ZSA9PT0gbm9uZSA/IGZpbmFsVmFsdWUodW5kZWZpbmVkKSA6IHdyaXRlKHZhbHVlKSkgOiB3cml0ZTtcbiAgLy8gQHRzLWlnbm9yZVxuICBmbltmbHVzaFN5bWJvbF0gPSAxO1xuICByZXR1cm4gZm47XG59O1xuXG5jb25zdCBzZXRGdW5jdGlvbkxpc3QgPSAobzogYW55LCBmbnM6IGFueSkgPT4ge1xuICBvLmZMaXN0ID0gZm5zO1xuICBvW2ZMaXN0U3ltYm9sXSA9IDE7XG4gIHJldHVybiBvO1xufTtcblxuLy8gaXMqTm9kZVN0cmVhbSBmdW5jdGlvbnMgdGFrZW4gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9tYXN0ZXIvbGliL2ludGVybmFsL3N0cmVhbXMvdXRpbHMuanNcbmNvbnN0IGlzUmVhZGFibGVOb2RlU3RyZWFtID0gKG9iajogYW55KSA9PlxuICBvYmogJiZcbiAgdHlwZW9mIG9iai5waXBlID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgdHlwZW9mIG9iai5vbiA9PT0gXCJmdW5jdGlvblwiICYmXG4gICghb2JqLl93cml0YWJsZVN0YXRlIHx8ICh0eXBlb2Ygb2JqLl9yZWFkYWJsZVN0YXRlID09PSBcIm9iamVjdFwiID8gb2JqLl9yZWFkYWJsZVN0YXRlLnJlYWRhYmxlIDogbnVsbCkgIT09IGZhbHNlKSAmJiAvLyBEdXBsZXhcbiAgKCFvYmouX3dyaXRhYmxlU3RhdGUgfHwgb2JqLl9yZWFkYWJsZVN0YXRlKTsgLy8gV3JpdGFibGUgaGFzIC5waXBlLlxuXG5jb25zdCBpc1dyaXRhYmxlTm9kZVN0cmVhbSA9IChvYmo6IGFueSkgPT5cbiAgb2JqICYmXG4gIHR5cGVvZiBvYmoud3JpdGUgPT09IFwiZnVuY3Rpb25cIiAmJlxuICB0eXBlb2Ygb2JqLm9uID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgKCFvYmouX3JlYWRhYmxlU3RhdGUgfHwgKHR5cGVvZiBvYmouX3dyaXRhYmxlU3RhdGUgPT09IFwib2JqZWN0XCIgPyBvYmouX3dyaXRhYmxlU3RhdGUud3JpdGFibGUgOiBudWxsKSAhPT0gZmFsc2UpOyAvLyBEdXBsZXhcblxuY29uc3QgaXNEdXBsZXhOb2RlU3RyZWFtID0gKG9iajogYW55KSA9PlxuICBvYmogJiZcbiAgdHlwZW9mIG9iai5waXBlID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgb2JqLl9yZWFkYWJsZVN0YXRlICYmXG4gIHR5cGVvZiBvYmoub24gPT09IFwiZnVuY3Rpb25cIiAmJlxuICB0eXBlb2Ygb2JqLndyaXRlID09PSBcImZ1bmN0aW9uXCI7XG5cbmNvbnN0IGlzUmVhZGFibGVXZWJTdHJlYW0gPSAob2JqOiBhbnkpID0+IG9iaiAmJiBnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtICYmIG9iaiBpbnN0YW5jZW9mIGdsb2JhbFRoaXMuUmVhZGFibGVTdHJlYW07XG5cbmNvbnN0IGlzV3JpdGFibGVXZWJTdHJlYW0gPSAob2JqOiBhbnkpID0+IG9iaiAmJiBnbG9iYWxUaGlzLldyaXRhYmxlU3RyZWFtICYmIG9iaiBpbnN0YW5jZW9mIGdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW07XG5cbmNvbnN0IGlzRHVwbGV4V2ViU3RyZWFtID0gKG9iajogYW55KSA9PlxuICBvYmogJiZcbiAgZ2xvYmFsVGhpcy5SZWFkYWJsZVN0cmVhbSAmJlxuICBvYmoucmVhZGFibGUgaW5zdGFuY2VvZiBnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtICYmXG4gIGdsb2JhbFRoaXMuV3JpdGFibGVTdHJlYW0gJiZcbiAgb2JqLndyaXRhYmxlIGluc3RhbmNlb2YgZ2xvYmFsVGhpcy5Xcml0YWJsZVN0cmVhbTtcblxuY29uc3QgZ3JvdXBGdW5jdGlvbnMgPSAob3V0cHV0OiBhbnksIGZuOiBhbnksIGluZGV4OiBhbnksIGZuczogYW55KSA9PiB7XG4gIGlmIChcbiAgICBpc0R1cGxleE5vZGVTdHJlYW0oZm4pIHx8XG4gICAgKCFpbmRleCAmJiBpc1JlYWRhYmxlTm9kZVN0cmVhbShmbikpIHx8XG4gICAgKGluZGV4ID09PSBmbnMubGVuZ3RoIC0gMSAmJiBpc1dyaXRhYmxlTm9kZVN0cmVhbShmbikpXG4gICkge1xuICAgIG91dHB1dC5wdXNoKGZuKTtcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG4gIGlmIChpc0R1cGxleFdlYlN0cmVhbShmbikpIHtcbiAgICBvdXRwdXQucHVzaChEdXBsZXguZnJvbVdlYihmbiwgeyBvYmplY3RNb2RlOiB0cnVlIH0pKTtcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG4gIGlmICghaW5kZXggJiYgaXNSZWFkYWJsZVdlYlN0cmVhbShmbikpIHtcbiAgICBvdXRwdXQucHVzaChSZWFkYWJsZS5mcm9tV2ViKGZuLCB7IG9iamVjdE1vZGU6IHRydWUgfSkpO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cbiAgaWYgKGluZGV4ID09PSBmbnMubGVuZ3RoIC0gMSAmJiBpc1dyaXRhYmxlV2ViU3RyZWFtKGZuKSkge1xuICAgIG91dHB1dC5wdXNoKFdyaXRhYmxlLmZyb21XZWIoZm4sIHsgb2JqZWN0TW9kZTogdHJ1ZSB9KSk7XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuICBpZiAodHlwZW9mIGZuICE9IFwiZnVuY3Rpb25cIikgdGhyb3cgVHlwZUVycm9yKFwiSXRlbSAjXCIgKyBpbmRleCArIFwiIGlzIG5vdCBhIHByb3BlciBzdHJlYW0sIG5vciBhIGZ1bmN0aW9uLlwiKTtcbiAgaWYgKCFvdXRwdXQubGVuZ3RoKSBvdXRwdXQucHVzaChbXSk7XG4gIGNvbnN0IGxhc3QgPSBvdXRwdXRbb3V0cHV0Lmxlbmd0aCAtIDFdO1xuICBpZiAoQXJyYXkuaXNBcnJheShsYXN0KSkge1xuICAgIGxhc3QucHVzaChmbik7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0LnB1c2goW2ZuXSk7XG4gIH1cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbmNsYXNzIFN0b3AgZXh0ZW5kcyBFcnJvciB7fVxuXG5leHBvcnQgY29uc3QgYXNTdHJlYW0gPSAoZm46IGFueSkgPT4ge1xuICBpZiAodHlwZW9mIGZuICE9IFwiZnVuY3Rpb25cIikgdGhyb3cgVHlwZUVycm9yKFwiT25seSBhIGZ1bmN0aW9uIGlzIGFjY2VwdGVkIGFzIHRoZSBmaXJzdCBhcmd1bWVudFwiKTtcblxuICAvLyBwdW1wIHZhcmlhYmxlc1xuICBsZXQgcGF1c2VkID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIGxldCByZXNvbHZlUGF1c2VkOiAoKHZhbHVlOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4pID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIGNvbnN0IHF1ZXVlOiBhbnlbXSA9IFtdO1xuXG4gIC8vIHBhdXNlL3Jlc3VtZVxuICBjb25zdCByZXN1bWU6IGFueSA9ICgpID0+IHtcbiAgICBpZiAoIXJlc29sdmVQYXVzZWQpIHJldHVybjtcbiAgICByZXNvbHZlUGF1c2VkKCk7XG4gICAgcmVzb2x2ZVBhdXNlZCA9IG51bGw7XG4gICAgcGF1c2VkID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH07XG4gIGNvbnN0IHBhdXNlOiBhbnkgPSAoKSA9PiB7XG4gICAgaWYgKHJlc29sdmVQYXVzZWQpIHJldHVybjtcbiAgICBwYXVzZWQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gKHJlc29sdmVQYXVzZWQgPSByZXNvbHZlKSk7XG4gIH07XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1jb25zdFxuICBsZXQgc3RyZWFtOiBEdXBsZXg7IC8vIHdpbGwgYmUgYXNzaWduZWQgbGF0ZXJcblxuICAvLyBkYXRhIHByb2Nlc3NpbmdcbiAgY29uc3QgcHVzaFJlc3VsdHM6IGFueSA9ICh2YWx1ZXM6IGFueSkgPT4ge1xuICAgIGlmICh2YWx1ZXMgJiYgdHlwZW9mIHZhbHVlcy5uZXh0ID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gZ2VuZXJhdG9yXG4gICAgICBxdWV1ZS5wdXNoKHZhbHVlcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGFycmF5XG4gICAgcXVldWUucHVzaCh2YWx1ZXNbU3ltYm9sLml0ZXJhdG9yXSgpKTtcbiAgfTtcbiAgY29uc3QgcHVtcDogYW55ID0gYXN5bmMgKCkgPT4ge1xuICAgIHdoaWxlIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgIGF3YWl0IHBhdXNlZDtcbiAgICAgIGNvbnN0IGdlbiA9IHF1ZXVlW3F1ZXVlLmxlbmd0aCAtIDFdO1xuICAgICAgbGV0IHJlc3VsdCA9IGdlbi5uZXh0KCk7XG4gICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzdWx0O1xuICAgICAgfVxuICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgIHF1ZXVlLnBvcCgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGxldCB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdmFsdWUgPSBhd2FpdCB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHNhbml0aXplKHZhbHVlKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IHNhbml0aXplOiBhbnkgPSBhc3luYyAodmFsdWU6IGFueSkgPT4ge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSBub25lKSByZXR1cm47XG4gICAgaWYgKHZhbHVlID09PSBzdG9wKSB0aHJvdyBuZXcgU3RvcCgpO1xuXG4gICAgaWYgKGlzTWFueSh2YWx1ZSkpIHtcbiAgICAgIHB1c2hSZXN1bHRzKGdldE1hbnlWYWx1ZXModmFsdWUpKTtcbiAgICAgIHJldHVybiBwdW1wKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzRmluYWxWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIC8vIGEgZmluYWwgdmFsdWUgaXMgbm90IHN1cHBvcnRlZCwgaXQgaXMgdHJlYXRlZCBhcyBhIHJlZ3VsYXIgdmFsdWVcbiAgICAgIHZhbHVlID0gZ2V0RmluYWxWYWx1ZSh2YWx1ZSk7XG4gICAgICByZXR1cm4gcHJvY2Vzc1ZhbHVlKHZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAoIXN0cmVhbS5wdXNoKHZhbHVlKSkge1xuICAgICAgcGF1c2UoKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IHByb2Nlc3NDaHVuazogYW55ID0gYXN5bmMgKGNodW5rOiBhbnksIGVuY29kaW5nOiBhbnkpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdmFsdWUgPSBmbihjaHVuaywgZW5jb2RpbmcpO1xuICAgICAgYXdhaXQgcHJvY2Vzc1ZhbHVlKHZhbHVlKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgU3RvcCkge1xuICAgICAgICBzdHJlYW0ucHVzaChudWxsKTtcbiAgICAgICAgc3RyZWFtLmRlc3Ryb3koKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9O1xuICBjb25zdCBwcm9jZXNzVmFsdWU6IGFueSA9IGFzeW5jICh2YWx1ZTogYW55KSA9PiB7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50aGVuID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gdGhlbmFibGVcbiAgICAgIHJldHVybiB2YWx1ZS50aGVuKCh2YWx1ZTogYW55KSA9PiBwcm9jZXNzVmFsdWUodmFsdWUpKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS5uZXh0ID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gZ2VuZXJhdG9yXG4gICAgICBwdXNoUmVzdWx0cyh2YWx1ZSk7XG4gICAgICByZXR1cm4gcHVtcCgpO1xuICAgIH1cbiAgICByZXR1cm4gc2FuaXRpemUodmFsdWUpO1xuICB9O1xuXG4gIHN0cmVhbSA9IG5ldyBEdXBsZXgoXG4gICAgT2JqZWN0LmFzc2lnbih7IHdyaXRhYmxlT2JqZWN0TW9kZTogdHJ1ZSwgcmVhZGFibGVPYmplY3RNb2RlOiB0cnVlIH0sIHVuZGVmaW5lZCwge1xuICAgICAgd3JpdGUoY2h1bms6IGFueSwgZW5jb2Rpbmc6IGFueSwgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBwcm9jZXNzQ2h1bmsoY2h1bmssIGVuY29kaW5nKS50aGVuKFxuICAgICAgICAgICgpID0+IGNhbGxiYWNrKG51bGwpLFxuICAgICAgICAgIChlcnJvcjogYW55KSA9PiBjYWxsYmFjayhlcnJvciksXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgZmluYWwoY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBpZiAoIWlzRmx1c2hhYmxlKGZuKSkge1xuICAgICAgICAgIHN0cmVhbS5wdXNoKG51bGwpO1xuICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBwcm9jZXNzQ2h1bmsobm9uZSwgbnVsbCkudGhlbihcbiAgICAgICAgICAoKSA9PiAoc3RyZWFtLnB1c2gobnVsbCksIGNhbGxiYWNrKG51bGwpKSxcbiAgICAgICAgICAoZXJyb3I6IGFueSkgPT4gY2FsbGJhY2soZXJyb3IpLFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIHJlYWQoKSB7XG4gICAgICAgIHJlc3VtZSgpO1xuICAgICAgfSxcbiAgICB9KSxcbiAgKTtcblxuICByZXR1cm4gc3RyZWFtO1xufTtcblxuY29uc3QgcHJvZHVjZVN0cmVhbXMgPSAoaXRlbTogYW55KSA9PiB7XG4gIGlmIChBcnJheS5pc0FycmF5KGl0ZW0pKSB7XG4gICAgaWYgKCFpdGVtLmxlbmd0aCkgcmV0dXJuIG51bGw7XG4gICAgaWYgKGl0ZW0ubGVuZ3RoID09IDEpIHJldHVybiBpdGVtWzBdICYmIGFzU3RyZWFtKGl0ZW1bMF0pO1xuICAgIHJldHVybiBhc1N0cmVhbShnZW4oLi4uaXRlbSkpO1xuICB9XG4gIHJldHVybiBpdGVtO1xufTtcblxuY29uc3QgbmV4dDogYW55ID0gYXN5bmMgZnVuY3Rpb24qICh2YWx1ZTogYW55LCBmbnM6IGFueSwgaW5kZXg6IGFueSkge1xuICBmb3IgKGxldCBpID0gaW5kZXg7IGkgPD0gZm5zLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50aGVuID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gdGhlbmFibGVcbiAgICAgIHZhbHVlID0gYXdhaXQgdmFsdWU7XG4gICAgfVxuICAgIGlmICh2YWx1ZSA9PT0gbm9uZSkgYnJlYWs7XG4gICAgaWYgKHZhbHVlID09PSBzdG9wKSB0aHJvdyBuZXcgU3RvcCgpO1xuICAgIGlmIChpc0ZpbmFsVmFsdWUodmFsdWUpKSB7XG4gICAgICB5aWVsZCBnZXRGaW5hbFZhbHVlKHZhbHVlKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoaXNNYW55KHZhbHVlKSkge1xuICAgICAgY29uc3QgdmFsdWVzID0gZ2V0TWFueVZhbHVlcyh2YWx1ZSk7XG4gICAgICBpZiAoaSA9PSBmbnMubGVuZ3RoKSB7XG4gICAgICAgIHlpZWxkKiB2YWx1ZXM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHZhbHVlcy5sZW5ndGg7ICsraikge1xuICAgICAgICAgIHlpZWxkKiBuZXh0KHZhbHVlc1tqXSwgZm5zLCBpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUubmV4dCA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIGdlbmVyYXRvclxuICAgICAgZm9yICg7Oykge1xuICAgICAgICBsZXQgZGF0YSA9IHZhbHVlLm5leHQoKTtcbiAgICAgICAgaWYgKGRhdGEgJiYgdHlwZW9mIGRhdGEudGhlbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBkYXRhID0gYXdhaXQgZGF0YTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5kb25lKSBicmVhaztcbiAgICAgICAgaWYgKGkgPT0gZm5zLmxlbmd0aCkge1xuICAgICAgICAgIHlpZWxkIGRhdGEudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeWllbGQqIG5leHQoZGF0YS52YWx1ZSwgZm5zLCBpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChpID09IGZucy5sZW5ndGgpIHtcbiAgICAgIHlpZWxkIHZhbHVlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IGYgPSBmbnNbaV07XG4gICAgdmFsdWUgPSBmKHZhbHVlKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGdlbiA9ICguLi5mbnM6IGFueSkgPT4ge1xuICBmbnMgPSBmbnNcbiAgICAuZmlsdGVyKChmbjogYW55KSA9PiBmbilcbiAgICAuZmxhdChJbmZpbml0eSlcbiAgICAubWFwKChmbjogYW55KSA9PiAoaXNGdW5jdGlvbkxpc3QoZm4pID8gZ2V0RnVuY3Rpb25MaXN0KGZuKSA6IGZuKSlcbiAgICAuZmxhdChJbmZpbml0eSk7XG4gIGlmICghZm5zLmxlbmd0aCkge1xuICAgIGZucyA9IFsoeDogYW55KSA9PiB4XTtcbiAgfVxuICBsZXQgZmx1c2hlZCA9IGZhbHNlO1xuICBsZXQgZyA9IGFzeW5jIGZ1bmN0aW9uKiAodmFsdWU6IGFueSkge1xuICAgIGlmIChmbHVzaGVkKSB0aHJvdyBFcnJvcihcIkNhbGwgdG8gYSBmbHVzaGVkIHBpcGUuXCIpO1xuICAgIGlmICh2YWx1ZSAhPT0gbm9uZSkge1xuICAgICAgeWllbGQqIG5leHQodmFsdWUsIGZucywgMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZsdXNoZWQgPSB0cnVlO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgZiA9IGZuc1tpXTtcbiAgICAgICAgaWYgKGlzRmx1c2hhYmxlKGYpKSB7XG4gICAgICAgICAgeWllbGQqIG5leHQoZihub25lKSwgZm5zLCBpICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGNvbnN0IG5lZWRUb0ZsdXNoID0gZm5zLnNvbWUoKGZuOiBhbnkpID0+IGlzRmx1c2hhYmxlKGZuKSk7XG4gIGlmIChuZWVkVG9GbHVzaCkgZyA9IGZsdXNoYWJsZShnKTtcbiAgcmV0dXJuIHNldEZ1bmN0aW9uTGlzdChnLCBmbnMpO1xufTtcblxuY29uc3Qgd3JpdGUgPSAoaW5wdXQ6IGFueSwgY2h1bms6IGFueSwgZW5jb2Rpbmc6IGFueSwgY2FsbGJhY2s6IGFueSkgPT4ge1xuICBsZXQgZXJyb3I6IGFueSA9IG51bGw7XG4gIHRyeSB7XG4gICAgaW5wdXQud3JpdGUoY2h1bmssIGVuY29kaW5nLCAoZTogYW55KSA9PiBjYWxsYmFjayhlIHx8IGVycm9yKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvciA9IGU7XG4gIH1cbn07XG5cbmNvbnN0IGZpbmFsID0gKGlucHV0OiBhbnksIGNhbGxiYWNrOiBhbnkpID0+IHtcbiAgbGV0IGVycm9yOiBhbnkgPSBudWxsO1xuICB0cnkge1xuICAgIGlucHV0LmVuZChudWxsLCBudWxsLCAoZTogYW55KSA9PiBjYWxsYmFjayhlIHx8IGVycm9yKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvciA9IGU7XG4gIH1cbn07XG5cbmNvbnN0IHJlYWQgPSAob3V0cHV0OiBhbnkpID0+IHtcbiAgb3V0cHV0LnJlc3VtZSgpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2hhaW4oZm5zOiBhbnkpIHtcbiAgZm5zID0gZm5zLmZsYXQoSW5maW5pdHkpLmZpbHRlcigoZm46IGFueSkgPT4gZm4pO1xuXG4gIGNvbnN0IHN0cmVhbXMgPSBmbnNcbiAgICAgIC5tYXAoKGZuOiBhbnkpID0+IChpc0Z1bmN0aW9uTGlzdChmbikgPyBnZXRGdW5jdGlvbkxpc3QoZm4pIDogZm4pKVxuICAgICAgLmZsYXQoSW5maW5pdHkpXG4gICAgICAucmVkdWNlKGdyb3VwRnVuY3Rpb25zLCBbXSlcbiAgICAgIC5tYXAocHJvZHVjZVN0cmVhbXMpXG4gICAgICAuZmlsdGVyKChzOiBhbnkpID0+IHMpLFxuICAgIGlucHV0ID0gc3RyZWFtc1swXSxcbiAgICBvdXRwdXQgPSBzdHJlYW1zLnJlZHVjZSgob3V0cHV0OiBhbnksIGl0ZW06IGFueSkgPT4gKG91dHB1dCAmJiBvdXRwdXQucGlwZShpdGVtKSkgfHwgaXRlbSk7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1jb25zdFxuICBsZXQgc3RyZWFtOiBEdXBsZXg7IC8vIHdpbGwgYmUgYXNzaWduZWQgbGF0ZXJcblxuICBsZXQgd3JpdGVNZXRob2QgPSAoY2h1bms6IGFueSwgZW5jb2Rpbmc6IGFueSwgY2FsbGJhY2s6IGFueSkgPT4gd3JpdGUoaW5wdXQsIGNodW5rLCBlbmNvZGluZywgY2FsbGJhY2spLFxuICAgIGZpbmFsTWV0aG9kID0gKGNhbGxiYWNrOiBhbnkpID0+IGZpbmFsKGlucHV0LCBjYWxsYmFjayksXG4gICAgcmVhZE1ldGhvZCA9ICgpID0+IHJlYWQob3V0cHV0KTtcblxuICBpZiAoIWlzV3JpdGFibGVOb2RlU3RyZWFtKGlucHV0KSkge1xuICAgIHdyaXRlTWV0aG9kID0gKF8xLCBfMiwgY2FsbGJhY2spID0+IGNhbGxiYWNrKG51bGwpO1xuICAgIGZpbmFsTWV0aG9kID0gKGNhbGxiYWNrKSA9PiBjYWxsYmFjayhudWxsKTtcbiAgICBpbnB1dC5vbihcImVuZFwiLCAoKSA9PiBzdHJlYW0uZW5kKCkpO1xuICB9XG5cbiAgaWYgKGlzUmVhZGFibGVOb2RlU3RyZWFtKG91dHB1dCkpIHtcbiAgICBvdXRwdXQub24oXCJkYXRhXCIsIChjaHVuazogYW55KSA9PiAhc3RyZWFtLnB1c2goY2h1bmspICYmIG91dHB1dC5wYXVzZSgpKTtcbiAgICBvdXRwdXQub24oXCJlbmRcIiwgKCkgPT4gc3RyZWFtLnB1c2gobnVsbCkpO1xuICB9IGVsc2Uge1xuICAgIHJlYWRNZXRob2QgPSAoKSA9PiB7fTsgLy8gbm9wXG4gICAgb3V0cHV0Lm9uKFwiZmluaXNoXCIsICgpID0+IHN0cmVhbS5wdXNoKG51bGwpKTtcbiAgfVxuXG4gIHN0cmVhbSA9IG5ldyBEdXBsZXgoXG4gICAgT2JqZWN0LmFzc2lnbihcbiAgICAgIHsgd3JpdGFibGVPYmplY3RNb2RlOiB0cnVlLCByZWFkYWJsZU9iamVjdE1vZGU6IHRydWUgfSxcbiAgICAgIHtcbiAgICAgICAgcmVhZGFibGU6IGlzUmVhZGFibGVOb2RlU3RyZWFtKG91dHB1dCksXG4gICAgICAgIHdyaXRhYmxlOiBpc1dyaXRhYmxlTm9kZVN0cmVhbShpbnB1dCksXG4gICAgICAgIHdyaXRlOiB3cml0ZU1ldGhvZCxcbiAgICAgICAgZmluYWw6IGZpbmFsTWV0aG9kLFxuICAgICAgICByZWFkOiByZWFkTWV0aG9kLFxuICAgICAgfSxcbiAgICApLFxuICApO1xuICAvLyBAdHMtaWdub3JlXG4gIHN0cmVhbS5zdHJlYW1zID0gc3RyZWFtcztcbiAgLy8gQHRzLWlnbm9yZVxuICBzdHJlYW0uaW5wdXQgPSBpbnB1dDtcbiAgLy8gQHRzLWlnbm9yZVxuICBzdHJlYW0ub3V0cHV0ID0gb3V0cHV0O1xuXG4gIGlmICghaXNSZWFkYWJsZU5vZGVTdHJlYW0ob3V0cHV0KSkge1xuICAgIHN0cmVhbS5yZXN1bWUoKTtcbiAgfVxuXG4gIC8vIGNvbm5lY3QgZXZlbnRzXG4gIHN0cmVhbXMuZm9yRWFjaCgoaXRlbTogYW55KSA9PiBpdGVtLm9uKFwiZXJyb3JcIiwgKGVycm9yOiBhbnkpID0+IHN0cmVhbS5lbWl0KFwiZXJyb3JcIiwgZXJyb3IpKSk7XG5cbiAgcmV0dXJuIHN0cmVhbTtcbn1cbiIsICIvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnQgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnRyb2wtcmVnZXggKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVzZWxlc3MtZXNjYXBlICovXG5pbXBvcnQgeyBmbHVzaGFibGUsIGdlbiwgbWFueSwgbm9uZSwgY29tYmluZU1hbnlNdXQgfSBmcm9tIFwiLi9zdHJlYW0tY2hhaW5cIjtcbmltcG9ydCB7IFN0cmluZ0RlY29kZXIgfSBmcm9tIFwibm9kZTpzdHJpbmdfZGVjb2RlclwiO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tIFwibm9kZTpldmVudHNcIjtcblxuY29uc3QgZml4VXRmOFN0cmVhbSA9ICgpID0+IHtcbiAgY29uc3Qgc3RyaW5nRGVjb2RlciA9IG5ldyBTdHJpbmdEZWNvZGVyKCk7XG4gIGxldCBpbnB1dCA9IFwiXCI7XG4gIHJldHVybiBmbHVzaGFibGUoKGNodW5rOiBhbnkpID0+IHtcbiAgICBpZiAoY2h1bmsgPT09IG5vbmUpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGlucHV0ICsgc3RyaW5nRGVjb2Rlci5lbmQoKTtcbiAgICAgIGlucHV0ID0gXCJcIjtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY2h1bmsgPT0gXCJzdHJpbmdcIikge1xuICAgICAgaWYgKCFpbnB1dCkgcmV0dXJuIGNodW5rO1xuICAgICAgY29uc3QgcmVzdWx0ID0gaW5wdXQgKyBjaHVuaztcbiAgICAgIGlucHV0ID0gXCJcIjtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmIChjaHVuayBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgY29uc3QgcmVzdWx0ID0gaW5wdXQgKyBzdHJpbmdEZWNvZGVyLndyaXRlKGNodW5rKTtcbiAgICAgIGlucHV0ID0gXCJcIjtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHBlY3RlZCBhIHN0cmluZyBvciBhIEJ1ZmZlclwiKTtcbiAgfSk7XG59O1xuXG5jb25zdCBwYXR0ZXJucyA9IHtcbiAgdmFsdWUxOiAvW1xcXCJcXHtcXFtcXF1cXC1cXGRdfHRydWVcXGJ8ZmFsc2VcXGJ8bnVsbFxcYnxcXHN7MSwyNTZ9L3ksXG4gIHN0cmluZzogL1teXFx4MDAtXFx4MWZcXFwiXFxcXF17MSwyNTZ9fFxcXFxbYmZucnRcXFwiXFxcXFxcL118XFxcXHVbXFxkYS1mQS1GXXs0fXxcXFwiL3ksXG4gIGtleTE6IC9bXFxcIlxcfV18XFxzezEsMjU2fS95LFxuICBjb2xvbjogL1xcOnxcXHN7MSwyNTZ9L3ksXG4gIGNvbW1hOiAvW1xcLFxcXVxcfV18XFxzezEsMjU2fS95LFxuICB3czogL1xcc3sxLDI1Nn0veSxcbiAgbnVtYmVyU3RhcnQ6IC9cXGQveSxcbiAgbnVtYmVyRGlnaXQ6IC9cXGR7MCwyNTZ9L3ksXG4gIG51bWJlckZyYWN0aW9uOiAvW1xcLmVFXS95LFxuICBudW1iZXJFeHBvbmVudDogL1tlRV0veSxcbiAgbnVtYmVyRXhwU2lnbjogL1stK10veSxcbn07XG5jb25zdCBNQVhfUEFUVEVSTl9TSVpFID0gMTY7XG5cbmNvbnN0IHZhbHVlczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHsgdHJ1ZTogdHJ1ZSwgZmFsc2U6IGZhbHNlLCBudWxsOiBudWxsIH0sXG4gIGV4cGVjdGVkOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0geyBvYmplY3Q6IFwib2JqZWN0U3RvcFwiLCBhcnJheTogXCJhcnJheVN0b3BcIiwgXCJcIjogXCJkb25lXCIgfTtcblxuLy8gbG9uZyBoZXhhZGVjaW1hbCBjb2RlczogXFx1WFhYWFxuY29uc3QgZnJvbUhleCA9IChzOiBzdHJpbmcpID0+IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQocy5zbGljZSgyKSwgMTYpKTtcblxuLy8gc2hvcnQgY29kZXM6IFxcYiBcXGYgXFxuIFxcciBcXHQgXFxcIiBcXFxcIFxcL1xuY29uc3QgY29kZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7XG4gIGI6IFwiXFxiXCIsXG4gIGY6IFwiXFxmXCIsXG4gIG46IFwiXFxuXCIsXG4gIHI6IFwiXFxyXCIsXG4gIHQ6IFwiXFx0XCIsXG4gICdcIic6ICdcIicsXG4gIFwiXFxcXFwiOiBcIlxcXFxcIixcbiAgXCIvXCI6IFwiL1wiLFxufTtcblxuY29uc3QganNvblBhcnNlciA9IChvcHRpb25zPzogYW55KSA9PiB7XG4gIGxldCBwYWNrS2V5cyA9IHRydWUsXG4gICAgcGFja1N0cmluZ3MgPSB0cnVlLFxuICAgIHBhY2tOdW1iZXJzID0gdHJ1ZSxcbiAgICBzdHJlYW1LZXlzID0gdHJ1ZSxcbiAgICBzdHJlYW1TdHJpbmdzID0gdHJ1ZSxcbiAgICBzdHJlYW1OdW1iZXJzID0gdHJ1ZSxcbiAgICBqc29uU3RyZWFtaW5nID0gZmFsc2U7XG5cbiAgaWYgKG9wdGlvbnMpIHtcbiAgICBcInBhY2tWYWx1ZXNcIiBpbiBvcHRpb25zICYmIChwYWNrS2V5cyA9IHBhY2tTdHJpbmdzID0gcGFja051bWJlcnMgPSBvcHRpb25zLnBhY2tWYWx1ZXMpO1xuICAgIFwicGFja0tleXNcIiBpbiBvcHRpb25zICYmIChwYWNrS2V5cyA9IG9wdGlvbnMucGFja0tleXMpO1xuICAgIFwicGFja1N0cmluZ3NcIiBpbiBvcHRpb25zICYmIChwYWNrU3RyaW5ncyA9IG9wdGlvbnMucGFja1N0cmluZ3MpO1xuICAgIFwicGFja051bWJlcnNcIiBpbiBvcHRpb25zICYmIChwYWNrTnVtYmVycyA9IG9wdGlvbnMucGFja051bWJlcnMpO1xuICAgIFwic3RyZWFtVmFsdWVzXCIgaW4gb3B0aW9ucyAmJiAoc3RyZWFtS2V5cyA9IHN0cmVhbVN0cmluZ3MgPSBzdHJlYW1OdW1iZXJzID0gb3B0aW9ucy5zdHJlYW1WYWx1ZXMpO1xuICAgIFwic3RyZWFtS2V5c1wiIGluIG9wdGlvbnMgJiYgKHN0cmVhbUtleXMgPSBvcHRpb25zLnN0cmVhbUtleXMpO1xuICAgIFwic3RyZWFtU3RyaW5nc1wiIGluIG9wdGlvbnMgJiYgKHN0cmVhbVN0cmluZ3MgPSBvcHRpb25zLnN0cmVhbVN0cmluZ3MpO1xuICAgIFwic3RyZWFtTnVtYmVyc1wiIGluIG9wdGlvbnMgJiYgKHN0cmVhbU51bWJlcnMgPSBvcHRpb25zLnN0cmVhbU51bWJlcnMpO1xuICAgIGpzb25TdHJlYW1pbmcgPSBvcHRpb25zLmpzb25TdHJlYW1pbmc7XG4gIH1cblxuICAhcGFja0tleXMgJiYgKHN0cmVhbUtleXMgPSB0cnVlKTtcbiAgIXBhY2tTdHJpbmdzICYmIChzdHJlYW1TdHJpbmdzID0gdHJ1ZSk7XG4gICFwYWNrTnVtYmVycyAmJiAoc3RyZWFtTnVtYmVycyA9IHRydWUpO1xuXG4gIGxldCBkb25lID0gZmFsc2UsXG4gICAgZXhwZWN0ID0ganNvblN0cmVhbWluZyA/IFwiZG9uZVwiIDogXCJ2YWx1ZVwiLFxuICAgIHBhcmVudCA9IFwiXCIsXG4gICAgb3Blbk51bWJlciA9IGZhbHNlLFxuICAgIGFjY3VtdWxhdG9yID0gXCJcIixcbiAgICBidWZmZXIgPSBcIlwiO1xuXG4gIGNvbnN0IHN0YWNrOiBhbnlbXSA9IFtdO1xuXG4gIHJldHVybiBmbHVzaGFibGUoKGJ1ZjogYW55KSA9PiB7XG4gICAgY29uc3QgdG9rZW5zOiBhbnlbXSA9IFtdO1xuXG4gICAgaWYgKGJ1ZiA9PT0gbm9uZSkge1xuICAgICAgZG9uZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1ZmZlciArPSBidWY7XG4gICAgfVxuXG4gICAgbGV0IG1hdGNoOiBhbnk7XG4gICAgbGV0IHZhbHVlOiBhbnk7XG4gICAgbGV0IGluZGV4ID0gMDtcblxuICAgIG1haW46IGZvciAoOzspIHtcbiAgICAgIHN3aXRjaCAoZXhwZWN0KSB7XG4gICAgICAgIGNhc2UgXCJ2YWx1ZTFcIjpcbiAgICAgICAgY2FzZSBcInZhbHVlXCI6XG4gICAgICAgICAgcGF0dGVybnMudmFsdWUxLmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1hdGNoID0gcGF0dGVybnMudmFsdWUxLmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoZG9uZSB8fCBpbmRleCArIE1BWF9QQVRURVJOX1NJWkUgPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IGV4cGVjdGVkIGEgdmFsdWVcIik7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBoYXMgZXhwZWN0ZWQgYSB2YWx1ZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBzd2l0Y2ggKHZhbHVlKSB7XG4gICAgICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICAgIGlmIChzdHJlYW1TdHJpbmdzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnRTdHJpbmdcIiB9KTtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJzdHJpbmdcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwie1wiOlxuICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnRPYmplY3RcIiB9KTtcbiAgICAgICAgICAgICAgc3RhY2sucHVzaChwYXJlbnQpO1xuICAgICAgICAgICAgICBwYXJlbnQgPSBcIm9iamVjdFwiO1xuICAgICAgICAgICAgICBleHBlY3QgPSBcImtleTFcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiW1wiOlxuICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnRBcnJheVwiIH0pO1xuICAgICAgICAgICAgICBzdGFjay5wdXNoKHBhcmVudCk7XG4gICAgICAgICAgICAgIHBhcmVudCA9IFwiYXJyYXlcIjtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJ2YWx1ZTFcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiXVwiOlxuICAgICAgICAgICAgICBpZiAoZXhwZWN0ICE9PSBcInZhbHVlMVwiKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiB1bmV4cGVjdGVkIHRva2VuICddJ1wiKTtcbiAgICAgICAgICAgICAgaWYgKG9wZW5OdW1iZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcImVuZE51bWJlclwiIH0pO1xuICAgICAgICAgICAgICAgIG9wZW5OdW1iZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAocGFja051bWJlcnMpIHtcbiAgICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJWYWx1ZVwiLCB2YWx1ZTogYWNjdW11bGF0b3IgfSk7XG4gICAgICAgICAgICAgICAgICBhY2N1bXVsYXRvciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJlbmRBcnJheVwiIH0pO1xuICAgICAgICAgICAgICBwYXJlbnQgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiLVwiOlxuICAgICAgICAgICAgICBvcGVuTnVtYmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnROdW1iZXJcIiB9LCB7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IFwiLVwiIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBhY2tOdW1iZXJzICYmIChhY2N1bXVsYXRvciA9IFwiLVwiKTtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJudW1iZXJTdGFydFwiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCIwXCI6XG4gICAgICAgICAgICAgIG9wZW5OdW1iZXIgPSB0cnVlO1xuICAgICAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykge1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJzdGFydE51bWJlclwiIH0sIHsgbmFtZTogXCJudW1iZXJDaHVua1wiLCB2YWx1ZTogXCIwXCIgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGFja051bWJlcnMgJiYgKGFjY3VtdWxhdG9yID0gXCIwXCIpO1xuICAgICAgICAgICAgICBleHBlY3QgPSBcIm51bWJlckZyYWN0aW9uXCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIjFcIjpcbiAgICAgICAgICAgIGNhc2UgXCIyXCI6XG4gICAgICAgICAgICBjYXNlIFwiM1wiOlxuICAgICAgICAgICAgY2FzZSBcIjRcIjpcbiAgICAgICAgICAgIGNhc2UgXCI1XCI6XG4gICAgICAgICAgICBjYXNlIFwiNlwiOlxuICAgICAgICAgICAgY2FzZSBcIjdcIjpcbiAgICAgICAgICAgIGNhc2UgXCI4XCI6XG4gICAgICAgICAgICBjYXNlIFwiOVwiOlxuICAgICAgICAgICAgICBvcGVuTnVtYmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnROdW1iZXJcIiB9LCB7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBhY2tOdW1iZXJzICYmIChhY2N1bXVsYXRvciA9IHZhbHVlKTtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJudW1iZXJEaWdpdFwiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ0cnVlXCI6XG4gICAgICAgICAgICBjYXNlIFwiZmFsc2VcIjpcbiAgICAgICAgICAgIGNhc2UgXCJudWxsXCI6XG4gICAgICAgICAgICAgIGlmIChidWZmZXIubGVuZ3RoIC0gaW5kZXggPT09IHZhbHVlLmxlbmd0aCAmJiAhZG9uZSkgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IHZhbHVlICsgXCJWYWx1ZVwiLCB2YWx1ZTogdmFsdWVzW3ZhbHVlXSB9KTtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBkZWZhdWx0OiAvLyB3c1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJrZXlWYWxcIjpcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgIHBhdHRlcm5zLnN0cmluZy5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLnN0cmluZy5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCAmJiAoZG9uZSB8fCBidWZmZXIubGVuZ3RoIC0gaW5kZXggPj0gNikpXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IGVzY2FwZWQgY2hhcmFjdGVyc1wiKTtcbiAgICAgICAgICAgIGlmIChkb25lKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgaGFzIGV4cGVjdGVkIGEgc3RyaW5nIHZhbHVlXCIpO1xuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ1wiJykge1xuICAgICAgICAgICAgaWYgKGV4cGVjdCA9PT0gXCJrZXlWYWxcIikge1xuICAgICAgICAgICAgICBpZiAoc3RyZWFtS2V5cykgdG9rZW5zLnB1c2goeyBuYW1lOiBcImVuZEtleVwiIH0pO1xuICAgICAgICAgICAgICBpZiAocGFja0tleXMpIHtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwia2V5VmFsdWVcIiwgdmFsdWU6IGFjY3VtdWxhdG9yIH0pO1xuICAgICAgICAgICAgICAgIGFjY3VtdWxhdG9yID0gXCJcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBleHBlY3QgPSBcImNvbG9uXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoc3RyZWFtU3RyaW5ncykgdG9rZW5zLnB1c2goeyBuYW1lOiBcImVuZFN0cmluZ1wiIH0pO1xuICAgICAgICAgICAgICBpZiAocGFja1N0cmluZ3MpIHtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RyaW5nVmFsdWVcIiwgdmFsdWU6IGFjY3VtdWxhdG9yIH0pO1xuICAgICAgICAgICAgICAgIGFjY3VtdWxhdG9yID0gXCJcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBleHBlY3QgPSBleHBlY3RlZFtwYXJlbnRdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUubGVuZ3RoID4gMSAmJiB2YWx1ZS5jaGFyQXQoMCkgPT09IFwiXFxcXFwiKSB7XG4gICAgICAgICAgICBjb25zdCB0ID0gdmFsdWUubGVuZ3RoID09IDIgPyBjb2Rlc1t2YWx1ZS5jaGFyQXQoMSldIDogZnJvbUhleCh2YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZXhwZWN0ID09PSBcImtleVZhbFwiID8gc3RyZWFtS2V5cyA6IHN0cmVhbVN0cmluZ3MpIHtcbiAgICAgICAgICAgICAgdG9rZW5zLnB1c2goeyBuYW1lOiBcInN0cmluZ0NodW5rXCIsIHZhbHVlOiB0IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV4cGVjdCA9PT0gXCJrZXlWYWxcIiA/IHBhY2tLZXlzIDogcGFja1N0cmluZ3MpIHtcbiAgICAgICAgICAgICAgYWNjdW11bGF0b3IgKz0gdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGV4cGVjdCA9PT0gXCJrZXlWYWxcIiA/IHN0cmVhbUtleXMgOiBzdHJlYW1TdHJpbmdzKSB7XG4gICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJzdHJpbmdDaHVua1wiLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXhwZWN0ID09PSBcImtleVZhbFwiID8gcGFja0tleXMgOiBwYWNrU3RyaW5ncykge1xuICAgICAgICAgICAgICBhY2N1bXVsYXRvciArPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwia2V5MVwiOlxuICAgICAgICBjYXNlIFwia2V5XCI6XG4gICAgICAgICAgcGF0dGVybnMua2V5MS5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLmtleTEuZXhlYyhidWZmZXIpO1xuICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGggfHwgZG9uZSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGNhbm5vdCBwYXJzZSBpbnB1dDogZXhwZWN0ZWQgYW4gb2JqZWN0IGtleVwiKTtcbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAodmFsdWUgPT09ICdcIicpIHtcbiAgICAgICAgICAgIGlmIChzdHJlYW1LZXlzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwic3RhcnRLZXlcIiB9KTtcbiAgICAgICAgICAgIGV4cGVjdCA9IFwia2V5VmFsXCI7XG4gICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gXCJ9XCIpIHtcbiAgICAgICAgICAgIGlmIChleHBlY3QgIT09IFwia2V5MVwiKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiB1bmV4cGVjdGVkIHRva2VuICd9J1wiKTtcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJlbmRPYmplY3RcIiB9KTtcbiAgICAgICAgICAgIHBhcmVudCA9IHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiY29sb25cIjpcbiAgICAgICAgICBwYXR0ZXJucy5jb2xvbi5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLmNvbG9uLmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoIHx8IGRvbmUpIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IGV4cGVjdGVkICc6J1wiKTtcbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICB2YWx1ZSA9PT0gXCI6XCIgJiYgKGV4cGVjdCA9IFwidmFsdWVcIik7XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiYXJyYXlTdG9wXCI6XG4gICAgICAgIGNhc2UgXCJvYmplY3RTdG9wXCI6XG4gICAgICAgICAgcGF0dGVybnMuY29tbWEubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5jb21tYS5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCB8fCBkb25lKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiBleHBlY3RlZCAnLCdcIik7XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcGVuTnVtYmVyKSB7XG4gICAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcImVuZE51bWJlclwiIH0pO1xuICAgICAgICAgICAgb3Blbk51bWJlciA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHBhY2tOdW1iZXJzKSB7XG4gICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJWYWx1ZVwiLCB2YWx1ZTogYWNjdW11bGF0b3IgfSk7XG4gICAgICAgICAgICAgIGFjY3VtdWxhdG9yID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAodmFsdWUgPT09IFwiLFwiKSB7XG4gICAgICAgICAgICBleHBlY3QgPSBleHBlY3QgPT09IFwiYXJyYXlTdG9wXCIgPyBcInZhbHVlXCIgOiBcImtleVwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IFwifVwiIHx8IHZhbHVlID09PSBcIl1cIikge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBcIn1cIiA/IGV4cGVjdCA9PT0gXCJhcnJheVN0b3BcIiA6IGV4cGVjdCAhPT0gXCJhcnJheVN0b3BcIikge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiBleHBlY3RlZCAnXCIgKyAoZXhwZWN0ID09PSBcImFycmF5U3RvcFwiID8gXCJdXCIgOiBcIn1cIikgKyBcIidcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh7IG5hbWU6IHZhbHVlID09PSBcIn1cIiA/IFwiZW5kT2JqZWN0XCIgOiBcImVuZEFycmF5XCIgfSk7XG4gICAgICAgICAgICBwYXJlbnQgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgIGV4cGVjdCA9IGV4cGVjdGVkW3BhcmVudF07XG4gICAgICAgICAgfVxuICAgICAgICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gbnVtYmVyIGNodW5rc1xuICAgICAgICBjYXNlIFwibnVtYmVyU3RhcnRcIjogLy8gWzAtOV1cbiAgICAgICAgICBwYXR0ZXJucy5udW1iZXJTdGFydC5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLm51bWJlclN0YXJ0LmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoIHx8IGRvbmUpIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IGV4cGVjdGVkIGEgc3RhcnRpbmcgZGlnaXRcIik7XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gbWF0Y2hbMF07XG4gICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJDaHVua1wiLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgICAgcGFja051bWJlcnMgJiYgKGFjY3VtdWxhdG9yICs9IHZhbHVlKTtcbiAgICAgICAgICBleHBlY3QgPSB2YWx1ZSA9PT0gXCIwXCIgPyBcIm51bWJlckZyYWN0aW9uXCIgOiBcIm51bWJlckRpZ2l0XCI7XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibnVtYmVyRGlnaXRcIjogLy8gWzAtOV0qXG4gICAgICAgICAgcGF0dGVybnMubnVtYmVyRGlnaXQubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5udW1iZXJEaWdpdC5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCB8fCBkb25lKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZXIgY2Fubm90IHBhcnNlIGlucHV0OiBleHBlY3RlZCBhIGRpZ2l0XCIpO1xuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJDaHVua1wiLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgKz0gdmFsdWUpO1xuICAgICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IFwibnVtYmVyRnJhY3Rpb25cIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgICBleHBlY3QgPSBleHBlY3RlZFtwYXJlbnRdO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJudW1iZXJGcmFjdGlvblwiOiAvLyBbXFwuZUVdP1xuICAgICAgICAgIHBhdHRlcm5zLm51bWJlckZyYWN0aW9uLmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1hdGNoID0gcGF0dGVybnMubnVtYmVyRnJhY3Rpb24uZXhlYyhidWZmZXIpO1xuICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGggfHwgZG9uZSkge1xuICAgICAgICAgICAgICBleHBlY3QgPSBleHBlY3RlZFtwYXJlbnRdO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcIm51bWJlckNodW5rXCIsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgKz0gdmFsdWUpO1xuICAgICAgICAgIGV4cGVjdCA9IHZhbHVlID09PSBcIi5cIiA/IFwibnVtYmVyRnJhY1N0YXJ0XCIgOiBcIm51bWJlckV4cFNpZ25cIjtcbiAgICAgICAgICBpbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJudW1iZXJGcmFjU3RhcnRcIjogLy8gWzAtOV1cbiAgICAgICAgICBwYXR0ZXJucy5udW1iZXJTdGFydC5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLm51bWJlclN0YXJ0LmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoIHx8IGRvbmUpXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlciBjYW5ub3QgcGFyc2UgaW5wdXQ6IGV4cGVjdGVkIGEgZnJhY3Rpb25hbCBwYXJ0IG9mIGEgbnVtYmVyXCIpO1xuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmIChzdHJlYW1OdW1iZXJzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICAgIHBhY2tOdW1iZXJzICYmIChhY2N1bXVsYXRvciArPSB2YWx1ZSk7XG4gICAgICAgICAgZXhwZWN0ID0gXCJudW1iZXJGcmFjRGlnaXRcIjtcbiAgICAgICAgICBpbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJudW1iZXJGcmFjRGlnaXRcIjogLy8gWzAtOV0qXG4gICAgICAgICAgcGF0dGVybnMubnVtYmVyRGlnaXQubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5udW1iZXJEaWdpdC5leGVjKGJ1ZmZlcik7XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChzdHJlYW1OdW1iZXJzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICAgICAgcGFja051bWJlcnMgJiYgKGFjY3VtdWxhdG9yICs9IHZhbHVlKTtcbiAgICAgICAgICAgIGluZGV4ICs9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICAgICAgICBleHBlY3QgPSBcIm51bWJlckV4cG9uZW50XCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibnVtYmVyRXhwb25lbnRcIjogLy8gW2VFXT9cbiAgICAgICAgICBwYXR0ZXJucy5udW1iZXJFeHBvbmVudC5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLm51bWJlckV4cG9uZW50LmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IGV4cGVjdGVkW3BhcmVudF07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gXCJkb25lXCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmIChzdHJlYW1OdW1iZXJzKSB0b2tlbnMucHVzaCh7IG5hbWU6IFwibnVtYmVyQ2h1bmtcIiwgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICAgIHBhY2tOdW1iZXJzICYmIChhY2N1bXVsYXRvciArPSB2YWx1ZSk7XG4gICAgICAgICAgZXhwZWN0ID0gXCJudW1iZXJFeHBTaWduXCI7XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibnVtYmVyRXhwU2lnblwiOiAvLyBbLStdP1xuICAgICAgICAgIHBhdHRlcm5zLm51bWJlckV4cFNpZ24ubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJucy5udW1iZXJFeHBTaWduLmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGV4cGVjdCA9IFwibnVtYmVyRXhwU3RhcnRcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZG9uZSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGhhcyBleHBlY3RlZCBhbiBleHBvbmVudCB2YWx1ZSBvZiBhIG51bWJlclwiKTtcbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcIm51bWJlckNodW5rXCIsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgKz0gdmFsdWUpO1xuICAgICAgICAgIGV4cGVjdCA9IFwibnVtYmVyRXhwU3RhcnRcIjtcbiAgICAgICAgICBpbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJudW1iZXJFeHBTdGFydFwiOiAvLyBbMC05XVxuICAgICAgICAgIHBhdHRlcm5zLm51bWJlclN0YXJ0Lmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1hdGNoID0gcGF0dGVybnMubnVtYmVyU3RhcnQuZXhlYyhidWZmZXIpO1xuICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGggfHwgZG9uZSlcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGNhbm5vdCBwYXJzZSBpbnB1dDogZXhwZWN0ZWQgYW4gZXhwb25lbnQgcGFydCBvZiBhIG51bWJlclwiKTtcbiAgICAgICAgICAgIGJyZWFrIG1haW47IC8vIHdhaXQgZm9yIG1vcmUgaW5wdXRcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcIm51bWJlckNodW5rXCIsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgKz0gdmFsdWUpO1xuICAgICAgICAgIGV4cGVjdCA9IFwibnVtYmVyRXhwRGlnaXRcIjtcbiAgICAgICAgICBpbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJudW1iZXJFeHBEaWdpdFwiOiAvLyBbMC05XSpcbiAgICAgICAgICBwYXR0ZXJucy5udW1iZXJEaWdpdC5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm5zLm51bWJlckRpZ2l0LmV4ZWMoYnVmZmVyKTtcbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHN0cmVhbU51bWJlcnMpIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJDaHVua1wiLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgICAgICBwYWNrTnVtYmVycyAmJiAoYWNjdW11bGF0b3IgKz0gdmFsdWUpO1xuICAgICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBidWZmZXIubGVuZ3RoIHx8IGRvbmUpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ID0gZXhwZWN0ZWRbcGFyZW50XTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhayBtYWluOyAvLyB3YWl0IGZvciBtb3JlIGlucHV0XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZG9uZVwiOlxuICAgICAgICAgIHBhdHRlcm5zLndzLmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1hdGNoID0gcGF0dGVybnMud3MuZXhlYyhidWZmZXIpO1xuICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgaWYgKGpzb25TdHJlYW1pbmcpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QgPSBcInZhbHVlXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2VyIGNhbm5vdCBwYXJzZSBpbnB1dDogdW5leHBlY3RlZCBjaGFyYWN0ZXJzXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWsgbWFpbjsgLy8gd2FpdCBmb3IgbW9yZSBpbnB1dFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgIGlmIChvcGVuTnVtYmVyKSB7XG4gICAgICAgICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcImVuZE51bWJlclwiIH0pO1xuICAgICAgICAgICAgb3Blbk51bWJlciA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHBhY2tOdW1iZXJzKSB7XG4gICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJWYWx1ZVwiLCB2YWx1ZTogYWNjdW11bGF0b3IgfSk7XG4gICAgICAgICAgICAgIGFjY3VtdWxhdG9yID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZG9uZSAmJiBvcGVuTnVtYmVyKSB7XG4gICAgICBpZiAoc3RyZWFtTnVtYmVycykgdG9rZW5zLnB1c2goeyBuYW1lOiBcImVuZE51bWJlclwiIH0pO1xuICAgICAgb3Blbk51bWJlciA9IGZhbHNlO1xuICAgICAgaWYgKHBhY2tOdW1iZXJzKSB7XG4gICAgICAgIHRva2Vucy5wdXNoKHsgbmFtZTogXCJudW1iZXJWYWx1ZVwiLCB2YWx1ZTogYWNjdW11bGF0b3IgfSk7XG4gICAgICAgIGFjY3VtdWxhdG9yID0gXCJcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgYnVmZmVyID0gYnVmZmVyLnNsaWNlKGluZGV4KTtcbiAgICByZXR1cm4gdG9rZW5zLmxlbmd0aCA/IG1hbnkodG9rZW5zKSA6IG5vbmU7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHBhcnNlciA9IChvcHRpb25zPzogYW55KSA9PiBnZW4oZml4VXRmOFN0cmVhbSgpLCBqc29uUGFyc2VyKG9wdGlvbnMpKTtcblxuY29uc3Qgd2l0aFBhcnNlciA9IChmbjogYW55LCBvcHRpb25zPzogYW55KSA9PiBnZW4ocGFyc2VyKG9wdGlvbnMpLCBmbihvcHRpb25zKSk7XG5cbmNvbnN0IGNoZWNrYWJsZVRva2VucyA9IHtcbiAgICBzdGFydE9iamVjdDogMSxcbiAgICBzdGFydEFycmF5OiAxLFxuICAgIHN0YXJ0U3RyaW5nOiAxLFxuICAgIHN0YXJ0TnVtYmVyOiAxLFxuICAgIG51bGxWYWx1ZTogMSxcbiAgICB0cnVlVmFsdWU6IDEsXG4gICAgZmFsc2VWYWx1ZTogMSxcbiAgICBzdHJpbmdWYWx1ZTogMSxcbiAgICBudW1iZXJWYWx1ZTogMSxcbiAgfSxcbiAgc3RvcFRva2VucyA9IHtcbiAgICBzdGFydE9iamVjdDogXCJlbmRPYmplY3RcIixcbiAgICBzdGFydEFycmF5OiBcImVuZEFycmF5XCIsXG4gICAgc3RhcnRTdHJpbmc6IFwiZW5kU3RyaW5nXCIsXG4gICAgc3RhcnROdW1iZXI6IFwiZW5kTnVtYmVyXCIsXG4gIH0sXG4gIG9wdGlvbmFsVG9rZW5zID0geyBlbmRTdHJpbmc6IFwic3RyaW5nVmFsdWVcIiwgZW5kTnVtYmVyOiBcIm51bWJlclZhbHVlXCIgfTtcblxuY29uc3QgZGVmYXVsdEZpbHRlciA9IChfc3RhY2s6IHN0cmluZ1tdLCBfYTogYW55KSA9PiB0cnVlO1xuXG5jb25zdCBzdHJpbmdGaWx0ZXIgPSAoc3RyaW5nOiBzdHJpbmcsIHNlcGFyYXRvcjogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHN0cmluZ1dpdGhTZXBhcmF0b3IgPSBzdHJpbmcgKyBzZXBhcmF0b3I7XG4gIHJldHVybiAoc3RhY2s6IHN0cmluZ1tdLCBfYTogYW55KSA9PiB7XG4gICAgY29uc3QgcGF0aCA9IHN0YWNrLmpvaW4oc2VwYXJhdG9yKTtcbiAgICByZXR1cm4gcGF0aCA9PT0gc3RyaW5nIHx8IHBhdGguc3RhcnRzV2l0aChzdHJpbmdXaXRoU2VwYXJhdG9yKTtcbiAgfTtcbn07XG5cbmNvbnN0IHJlZ0V4cEZpbHRlciA9IChyZWdFeHA6IFJlZ0V4cCwgc2VwYXJhdG9yOiBzdHJpbmcpID0+IHtcbiAgcmV0dXJuIChzdGFjazogc3RyaW5nW10sIF9hOiBhbnkpID0+IHJlZ0V4cC50ZXN0KHN0YWNrLmpvaW4oc2VwYXJhdG9yKSk7XG59O1xuXG5jb25zdCBmaWx0ZXJCYXNlID1cbiAgKHtcbiAgICBzcGVjaWFsQWN0aW9uID0gXCJhY2NlcHRcIixcbiAgICBkZWZhdWx0QWN0aW9uID0gXCJpZ25vcmVcIixcbiAgICBub25DaGVja2FibGVBY3Rpb24gPSBcInByb2Nlc3Mta2V5XCIsXG4gICAgdHJhbnNpdGlvbiA9IHVuZGVmaW5lZCBhcyBhbnksXG4gIH0gPSB7fSkgPT5cbiAgKG9wdGlvbnM6IGFueSkgPT4ge1xuICAgIGNvbnN0IG9uY2UgPSBvcHRpb25zPy5vbmNlLFxuICAgICAgc2VwYXJhdG9yID0gb3B0aW9ucz8ucGF0aFNlcGFyYXRvciB8fCBcIi5cIjtcbiAgICBsZXQgZmlsdGVyID0gZGVmYXVsdEZpbHRlcixcbiAgICAgIHN0cmVhbUtleXMgPSB0cnVlO1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMuZmlsdGVyID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmZpbHRlcjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMuZmlsdGVyID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZmlsdGVyID0gc3RyaW5nRmlsdGVyKG9wdGlvbnMuZmlsdGVyLCBzZXBhcmF0b3IpO1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmZpbHRlciBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICBmaWx0ZXIgPSByZWdFeHBGaWx0ZXIob3B0aW9ucy5maWx0ZXIsIHNlcGFyYXRvcik7XG4gICAgICB9XG4gICAgICBpZiAoXCJzdHJlYW1WYWx1ZXNcIiBpbiBvcHRpb25zKSBzdHJlYW1LZXlzID0gb3B0aW9ucy5zdHJlYW1WYWx1ZXM7XG4gICAgICBpZiAoXCJzdHJlYW1LZXlzXCIgaW4gb3B0aW9ucykgc3RyZWFtS2V5cyA9IG9wdGlvbnMuc3RyZWFtS2V5cztcbiAgICB9XG4gICAgY29uc3Qgc2FuaXRpemVkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMsIHsgZmlsdGVyLCBzdHJlYW1LZXlzLCBzZXBhcmF0b3IgfSk7XG4gICAgbGV0IHN0YXRlID0gXCJjaGVja1wiO1xuICAgIGNvbnN0IHN0YWNrOiBhbnlbXSA9IFtdO1xuICAgIGxldCBkZXB0aCA9IDAsXG4gICAgICBwcmV2aW91c1Rva2VuID0gXCJcIixcbiAgICAgIGVuZFRva2VuID0gXCJcIixcbiAgICAgIG9wdGlvbmFsVG9rZW4gPSBcIlwiLFxuICAgICAgc3RhcnRUcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgcmV0dXJuIGZsdXNoYWJsZSgoY2h1bmspID0+IHtcbiAgICAgIC8vIHRoZSBmbHVzaFxuICAgICAgaWYgKGNodW5rID09PSBub25lKSByZXR1cm4gdHJhbnNpdGlvbiA/IHRyYW5zaXRpb24oW10sIG51bGwsIFwiZmx1c2hcIiwgc2FuaXRpemVkT3B0aW9ucykgOiBub25lO1xuXG4gICAgICAvLyBwcm9jZXNzIHRoZSBvcHRpb25hbCB2YWx1ZSB0b2tlbiAodW5maW5pc2hlZClcbiAgICAgIGlmIChvcHRpb25hbFRva2VuKSB7XG4gICAgICAgIGlmIChvcHRpb25hbFRva2VuID09PSBjaHVuay5uYW1lKSB7XG4gICAgICAgICAgbGV0IHJldHVyblRva2VuID0gbm9uZTtcbiAgICAgICAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvY2Vzcy1rZXlcIjpcbiAgICAgICAgICAgICAgc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0gPSBjaHVuay52YWx1ZTtcbiAgICAgICAgICAgICAgc3RhdGUgPSBcImNoZWNrXCI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImFjY2VwdC12YWx1ZVwiOlxuICAgICAgICAgICAgICByZXR1cm5Ub2tlbiA9IGNodW5rO1xuICAgICAgICAgICAgICBzdGF0ZSA9IG9uY2UgPyBcInBhc3NcIiA6IFwiY2hlY2tcIjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICBzdGF0ZSA9IG9uY2UgPyBcImFsbFwiIDogXCJjaGVja1wiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgb3B0aW9uYWxUb2tlbiA9IFwiXCI7XG4gICAgICAgICAgcmV0dXJuIHJldHVyblRva2VuO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbmFsVG9rZW4gPSBcIlwiO1xuICAgICAgICBzdGF0ZSA9IG9uY2UgJiYgc3RhdGUgIT09IFwicHJvY2Vzcy1rZXlcIiA/IFwicGFzc1wiIDogXCJjaGVja1wiO1xuICAgICAgfVxuXG4gICAgICBsZXQgcmV0dXJuVG9rZW46IGFueSA9IG5vbmU7XG5cbiAgICAgIHJlY2hlY2s6IGZvciAoOzspIHtcbiAgICAgICAgLy8gYWNjZXB0L3JlamVjdCB0b2tlbnNcbiAgICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICAgIGNhc2UgXCJwcm9jZXNzLWtleVwiOlxuICAgICAgICAgICAgaWYgKGNodW5rLm5hbWUgPT09IFwiZW5kS2V5XCIpIG9wdGlvbmFsVG9rZW4gPSBcImtleVZhbHVlXCI7XG4gICAgICAgICAgICByZXR1cm4gbm9uZTtcbiAgICAgICAgICBjYXNlIFwicGFzc1wiOlxuICAgICAgICAgICAgcmV0dXJuIG5vbmU7XG4gICAgICAgICAgY2FzZSBcImFsbFwiOlxuICAgICAgICAgICAgcmV0dXJuIGNodW5rO1xuICAgICAgICAgIGNhc2UgXCJhY2NlcHRcIjpcbiAgICAgICAgICBjYXNlIFwicmVqZWN0XCI6XG4gICAgICAgICAgICBpZiAoc3RhcnRUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgICAgIHN0YXJ0VHJhbnNpdGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm5Ub2tlbiA9IHRyYW5zaXRpb24oc3RhY2ssIGNodW5rLCBzdGF0ZSwgc2FuaXRpemVkT3B0aW9ucykgfHwgbm9uZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAoY2h1bmsubmFtZSkge1xuICAgICAgICAgICAgICBjYXNlIFwic3RhcnRPYmplY3RcIjpcbiAgICAgICAgICAgICAgY2FzZSBcInN0YXJ0QXJyYXlcIjpcbiAgICAgICAgICAgICAgICArK2RlcHRoO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIFwiZW5kT2JqZWN0XCI6XG4gICAgICAgICAgICAgIGNhc2UgXCJlbmRBcnJheVwiOlxuICAgICAgICAgICAgICAgIC0tZGVwdGg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RhdGUgPT09IFwiYWNjZXB0XCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuVG9rZW4gPSBjb21iaW5lTWFueU11dChyZXR1cm5Ub2tlbiwgY2h1bmspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFkZXB0aCkge1xuICAgICAgICAgICAgICBpZiAob25jZSkge1xuICAgICAgICAgICAgICAgIHN0YXRlID0gc3RhdGUgPT09IFwiYWNjZXB0XCIgPyBcInBhc3NcIiA6IFwiYWxsXCI7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBcImNoZWNrXCI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXR1cm5Ub2tlbjtcbiAgICAgICAgICBjYXNlIFwiYWNjZXB0LXZhbHVlXCI6XG4gICAgICAgICAgY2FzZSBcInJlamVjdC12YWx1ZVwiOlxuICAgICAgICAgICAgaWYgKHN0YXJ0VHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICBzdGFydFRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuVG9rZW4gPSB0cmFuc2l0aW9uKHN0YWNrLCBjaHVuaywgc3RhdGUsIHNhbml0aXplZE9wdGlvbnMpIHx8IG5vbmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RhdGUgPT09IFwiYWNjZXB0LXZhbHVlXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuVG9rZW4gPSBjb21iaW5lTWFueU11dChyZXR1cm5Ub2tlbiwgY2h1bmspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNodW5rLm5hbWUgPT09IGVuZFRva2VuKSB7XG4gICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgb3B0aW9uYWxUb2tlbiA9IG9wdGlvbmFsVG9rZW5zW2VuZFRva2VuXSB8fCBcIlwiO1xuICAgICAgICAgICAgICBlbmRUb2tlbiA9IFwiXCI7XG4gICAgICAgICAgICAgIGlmICghb3B0aW9uYWxUb2tlbikge1xuICAgICAgICAgICAgICAgIGlmIChvbmNlKSB7XG4gICAgICAgICAgICAgICAgICBzdGF0ZSA9IHN0YXRlID09PSBcImFjY2VwdC12YWx1ZVwiID8gXCJwYXNzXCIgOiBcImFsbFwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzdGF0ZSA9IFwiY2hlY2tcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXR1cm5Ub2tlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgbGFzdCBpbmRleCBpbiB0aGUgc3RhY2tcbiAgICAgICAgaWYgKHR5cGVvZiBzdGFja1tzdGFjay5sZW5ndGggLSAxXSA9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgLy8gYXJyYXlcbiAgICAgICAgICBzd2l0Y2ggKGNodW5rLm5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJzdGFydE9iamVjdFwiOlxuICAgICAgICAgICAgY2FzZSBcInN0YXJ0QXJyYXlcIjpcbiAgICAgICAgICAgIGNhc2UgXCJzdGFydFN0cmluZ1wiOlxuICAgICAgICAgICAgY2FzZSBcInN0YXJ0TnVtYmVyXCI6XG4gICAgICAgICAgICBjYXNlIFwibnVsbFZhbHVlXCI6XG4gICAgICAgICAgICBjYXNlIFwidHJ1ZVZhbHVlXCI6XG4gICAgICAgICAgICBjYXNlIFwiZmFsc2VWYWx1ZVwiOlxuICAgICAgICAgICAgICArK3N0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJudW1iZXJWYWx1ZVwiOlxuICAgICAgICAgICAgICBpZiAocHJldmlvdXNUb2tlbiAhPT0gXCJlbmROdW1iZXJcIikgKytzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nVmFsdWVcIjpcbiAgICAgICAgICAgICAgaWYgKHByZXZpb3VzVG9rZW4gIT09IFwiZW5kU3RyaW5nXCIpICsrc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY2h1bmsubmFtZSA9PT0gXCJrZXlWYWx1ZVwiKSBzdGFja1tzdGFjay5sZW5ndGggLSAxXSA9IGNodW5rLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHByZXZpb3VzVG9rZW4gPSBjaHVuay5uYW1lO1xuXG4gICAgICAgIC8vIGNoZWNrIHRoZSB0b2tlblxuICAgICAgICBjb25zdCBhY3Rpb24gPVxuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICBjaGVja2FibGVUb2tlbnNbY2h1bmsubmFtZV0gIT09IDEgPyBub25DaGVja2FibGVBY3Rpb24gOiBmaWx0ZXIoc3RhY2ssIGNodW5rKSA/IHNwZWNpYWxBY3Rpb24gOiBkZWZhdWx0QWN0aW9uO1xuXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgZW5kVG9rZW4gPSBzdG9wVG9rZW5zW2NodW5rLm5hbWVdIHx8IFwiXCI7XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSBcInByb2Nlc3Mta2V5XCI6XG4gICAgICAgICAgICBpZiAoY2h1bmsubmFtZSA9PT0gXCJzdGFydEtleVwiKSB7XG4gICAgICAgICAgICAgIHN0YXRlID0gXCJwcm9jZXNzLWtleVwiO1xuICAgICAgICAgICAgICBjb250aW51ZSByZWNoZWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImFjY2VwdC10b2tlblwiOlxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgaWYgKGVuZFRva2VuICYmIG9wdGlvbmFsVG9rZW5zW2VuZFRva2VuXSkge1xuICAgICAgICAgICAgICBzdGF0ZSA9IFwiYWNjZXB0LXZhbHVlXCI7XG4gICAgICAgICAgICAgIHN0YXJ0VHJhbnNpdGlvbiA9ICEhdHJhbnNpdGlvbjtcbiAgICAgICAgICAgICAgY29udGludWUgcmVjaGVjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uKSByZXR1cm5Ub2tlbiA9IHRyYW5zaXRpb24oc3RhY2ssIGNodW5rLCBhY3Rpb24sIHNhbml0aXplZE9wdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuVG9rZW4gPSBjb21iaW5lTWFueU11dChyZXR1cm5Ub2tlbiwgY2h1bmspO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImFjY2VwdFwiOlxuICAgICAgICAgICAgaWYgKGVuZFRva2VuKSB7XG4gICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgc3RhdGUgPSBvcHRpb25hbFRva2Vuc1tlbmRUb2tlbl0gPyBcImFjY2VwdC12YWx1ZVwiIDogXCJhY2NlcHRcIjtcbiAgICAgICAgICAgICAgc3RhcnRUcmFuc2l0aW9uID0gISF0cmFuc2l0aW9uO1xuICAgICAgICAgICAgICBjb250aW51ZSByZWNoZWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24pIHJldHVyblRva2VuID0gdHJhbnNpdGlvbihzdGFjaywgY2h1bmssIGFjdGlvbiwgc2FuaXRpemVkT3B0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm5Ub2tlbiA9IGNvbWJpbmVNYW55TXV0KHJldHVyblRva2VuLCBjaHVuayk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwicmVqZWN0XCI6XG4gICAgICAgICAgICBpZiAoZW5kVG9rZW4pIHtcbiAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICBzdGF0ZSA9IG9wdGlvbmFsVG9rZW5zW2VuZFRva2VuXSA/IFwicmVqZWN0LXZhbHVlXCIgOiBcInJlamVjdFwiO1xuICAgICAgICAgICAgICBzdGFydFRyYW5zaXRpb24gPSAhIXRyYW5zaXRpb247XG4gICAgICAgICAgICAgIGNvbnRpbnVlIHJlY2hlY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbikgcmV0dXJuVG9rZW4gPSB0cmFuc2l0aW9uKHN0YWNrLCBjaHVuaywgYWN0aW9uLCBzYW5pdGl6ZWRPcHRpb25zKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJwYXNzXCI6XG4gICAgICAgICAgICBzdGF0ZSA9IFwicGFzc1wiO1xuICAgICAgICAgICAgY29udGludWUgcmVjaGVjaztcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyB1cGRhdGUgdGhlIHN0YWNrXG4gICAgICBzd2l0Y2ggKGNodW5rLm5hbWUpIHtcbiAgICAgICAgY2FzZSBcInN0YXJ0T2JqZWN0XCI6XG4gICAgICAgICAgc3RhY2sucHVzaChudWxsKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInN0YXJ0QXJyYXlcIjpcbiAgICAgICAgICBzdGFjay5wdXNoKC0xKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImVuZE9iamVjdFwiOlxuICAgICAgICBjYXNlIFwiZW5kQXJyYXlcIjpcbiAgICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJldHVyblRva2VuO1xuICAgIH0pO1xuICB9O1xuXG5leHBvcnQgY29uc3QgUGlja1BhcnNlciA9IChvcHRpb25zPzogYW55KSA9PiB3aXRoUGFyc2VyKGZpbHRlckJhc2UoKSwgT2JqZWN0LmFzc2lnbih7IHBhY2tLZXlzOiB0cnVlIH0sIG9wdGlvbnMpKTtcblxuY2xhc3MgQ291bnRlciB7XG4gIGRlcHRoOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKGluaXRpYWxEZXB0aDogbnVtYmVyKSB7XG4gICAgdGhpcy5kZXB0aCA9IGluaXRpYWxEZXB0aDtcbiAgfVxuICBzdGFydE9iamVjdCgpIHtcbiAgICArK3RoaXMuZGVwdGg7XG4gIH1cbiAgZW5kT2JqZWN0KCkge1xuICAgIC0tdGhpcy5kZXB0aDtcbiAgfVxuICBzdGFydEFycmF5KCkge1xuICAgICsrdGhpcy5kZXB0aDtcbiAgfVxuICBlbmRBcnJheSgpIHtcbiAgICAtLXRoaXMuZGVwdGg7XG4gIH1cbn1cblxuY2xhc3MgQXNzZW1ibGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgc3RhdGljIGNvbm5lY3RUbyhzdHJlYW06IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgcmV0dXJuIG5ldyBBc3NlbWJsZXIob3B0aW9ucykuY29ubmVjdFRvKHN0cmVhbSk7XG4gIH1cblxuICBzdGFjazogYW55O1xuICBjdXJyZW50OiBhbnk7XG4gIGtleTogYW55O1xuICBkb25lOiBib29sZWFuO1xuICByZXZpdmVyOiBhbnk7XG4gIC8vIEB0cy1pZ25vcmVcbiAgc3RyaW5nVmFsdWU6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkO1xuICB0YXBDaGFpbjogKGNodW5rOiBhbnkpID0+IGFueTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmtleSA9IG51bGw7XG4gICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgdGhpcy5yZXZpdmVyID0gdHlwZW9mIG9wdGlvbnMucmV2aXZlciA9PSBcImZ1bmN0aW9uXCIgJiYgb3B0aW9ucy5yZXZpdmVyO1xuICAgICAgaWYgKHRoaXMucmV2aXZlcikge1xuICAgICAgICB0aGlzLnN0cmluZ1ZhbHVlID0gdGhpcy5fc2F2ZVZhbHVlID0gdGhpcy5fc2F2ZVZhbHVlV2l0aFJldml2ZXI7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5udW1iZXJBc1N0cmluZykge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMubnVtYmVyVmFsdWUgPSB0aGlzLnN0cmluZ1ZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGFwQ2hhaW4gPSAoY2h1bmspID0+IHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGlmICh0aGlzW2NodW5rLm5hbWVdKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpc1tjaHVuay5uYW1lXShjaHVuay52YWx1ZSk7XG4gICAgICAgIGlmICh0aGlzLmRvbmUpIHJldHVybiB0aGlzLmN1cnJlbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9uZTtcbiAgICB9O1xuXG4gICAgdGhpcy5zdHJpbmdWYWx1ZSA9IHRoaXMuX3NhdmVWYWx1ZTtcbiAgfVxuXG4gIGNvbm5lY3RUbyhzdHJlYW06IGFueSkge1xuICAgIHN0cmVhbS5vbihcImRhdGFcIiwgKGNodW5rOiBhbnkpID0+IHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGlmICh0aGlzW2NodW5rLm5hbWVdKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpc1tjaHVuay5uYW1lXShjaHVuay52YWx1ZSk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgaWYgKHRoaXMuZG9uZSkgdGhpcy5lbWl0KFwiZG9uZVwiLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldCBkZXB0aCgpIHtcbiAgICByZXR1cm4gKHRoaXMuc3RhY2subGVuZ3RoID4+IDEpICsgKHRoaXMuZG9uZSA/IDAgOiAxKTtcbiAgfVxuXG4gIGdldCBwYXRoKCkge1xuICAgIGNvbnN0IHBhdGg6IGFueVtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN0YWNrLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICBjb25zdCBrZXkgPSB0aGlzLnN0YWNrW2kgKyAxXTtcbiAgICAgIHBhdGgucHVzaChrZXkgPT09IG51bGwgPyB0aGlzLnN0YWNrW2ldLmxlbmd0aCA6IGtleSk7XG4gICAgfVxuICAgIHJldHVybiBwYXRoO1xuICB9XG5cbiAgZHJvcFRvTGV2ZWwobGV2ZWw6IGFueSkge1xuICAgIGlmIChsZXZlbCA8IHRoaXMuZGVwdGgpIHtcbiAgICAgIGlmIChsZXZlbCA+IDApIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSAobGV2ZWwgLSAxKSA8PCAxO1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLnN0YWNrW2luZGV4XTtcbiAgICAgICAgdGhpcy5rZXkgPSB0aGlzLnN0YWNrW2luZGV4ICsgMV07XG4gICAgICAgIHRoaXMuc3RhY2suc3BsaWNlKGluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5rZXkgPSBudWxsO1xuICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNvbnN1bWUoY2h1bms6IGFueSkge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICB0aGlzW2NodW5rLm5hbWVdICYmIHRoaXNbY2h1bmsubmFtZV0oY2h1bmsudmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAga2V5VmFsdWUodmFsdWU6IGFueSkge1xuICAgIHRoaXMua2V5ID0gdmFsdWU7XG4gIH1cblxuICAvL3N0cmluZ1ZhbHVlKCkgLSBhbGlhc2VkIGJlbG93IHRvIF9zYXZlVmFsdWUoKVxuXG4gIG51bWJlclZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9zYXZlVmFsdWUocGFyc2VGbG9hdCh2YWx1ZSkpO1xuICB9XG4gIG51bGxWYWx1ZSgpIHtcbiAgICB0aGlzLl9zYXZlVmFsdWUobnVsbCk7XG4gIH1cbiAgdHJ1ZVZhbHVlKCkge1xuICAgIHRoaXMuX3NhdmVWYWx1ZSh0cnVlKTtcbiAgfVxuICBmYWxzZVZhbHVlKCkge1xuICAgIHRoaXMuX3NhdmVWYWx1ZShmYWxzZSk7XG4gIH1cblxuICBzdGFydE9iamVjdCgpIHtcbiAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFjay5wdXNoKHRoaXMuY3VycmVudCwgdGhpcy5rZXkpO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnQgPSBuZXcgT2JqZWN0KCk7XG4gICAgdGhpcy5rZXkgPSBudWxsO1xuICB9XG5cbiAgZW5kT2JqZWN0KCkge1xuICAgIGlmICh0aGlzLnN0YWNrLmxlbmd0aCkge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmN1cnJlbnQ7XG4gICAgICB0aGlzLmtleSA9IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5fc2F2ZVZhbHVlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBzdGFydEFycmF5KCkge1xuICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YWNrLnB1c2godGhpcy5jdXJyZW50LCB0aGlzLmtleSk7XG4gICAgfVxuICAgIHRoaXMuY3VycmVudCA9IFtdO1xuICAgIHRoaXMua2V5ID0gbnVsbDtcbiAgfVxuXG4gIGVuZEFycmF5KCkge1xuICAgIGlmICh0aGlzLnN0YWNrLmxlbmd0aCkge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmN1cnJlbnQ7XG4gICAgICB0aGlzLmtleSA9IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5fc2F2ZVZhbHVlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBfc2F2ZVZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuY3VycmVudCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRoaXMuY3VycmVudC5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY3VycmVudFt0aGlzLmtleV0gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5rZXkgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBfc2F2ZVZhbHVlV2l0aFJldml2ZXIodmFsdWU6IGFueSkge1xuICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMucmV2aXZlcihcIlwiLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB2YWx1ZSA9IHRoaXMucmV2aXZlcihcIlwiICsgdGhpcy5jdXJyZW50Lmxlbmd0aCwgdmFsdWUpO1xuICAgICAgICB0aGlzLmN1cnJlbnQucHVzaCh2YWx1ZSk7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuY3VycmVudFt0aGlzLmN1cnJlbnQubGVuZ3RoIC0gMV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gdGhpcy5yZXZpdmVyKHRoaXMua2V5LCB2YWx1ZSk7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5jdXJyZW50W3RoaXMua2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMua2V5ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY29uc3Qgc3RyZWFtQmFzZSA9XG4gICh7IHB1c2gsIGZpcnN0LCBsZXZlbCB9OiBhbnkpID0+XG4gIChvcHRpb25zID0ge30gYXMgYW55KSA9PiB7XG4gICAgY29uc3QgeyBvYmplY3RGaWx0ZXIsIGluY2x1ZGVVbmRlY2lkZWQgfSA9IG9wdGlvbnM7XG4gICAgbGV0IGFzbSA9IG5ldyBBc3NlbWJsZXIob3B0aW9ucykgYXMgYW55LFxuICAgICAgc3RhdGUgPSBmaXJzdCA/IFwiZmlyc3RcIiA6IFwiY2hlY2tcIixcbiAgICAgIHNhdmVkQXNtID0gbnVsbCBhcyBhbnk7XG5cbiAgICBpZiAodHlwZW9mIG9iamVjdEZpbHRlciAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIG5vIG9iamVjdCBmaWx0ZXIgKyBubyBmaXJzdCBjaGVja1xuICAgICAgaWYgKHN0YXRlID09PSBcImNoZWNrXCIpXG4gICAgICAgIHJldHVybiAoY2h1bms6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChhc21bY2h1bmsubmFtZV0pIHtcbiAgICAgICAgICAgIGFzbVtjaHVuay5uYW1lXShjaHVuay52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoYXNtLmRlcHRoID09PSBsZXZlbCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHVzaChhc20pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbm9uZTtcbiAgICAgICAgfTtcbiAgICAgIC8vIG5vIG9iamVjdCBmaWx0ZXJcbiAgICAgIHJldHVybiAoY2h1bms6IGFueSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICAgICAgY2FzZSBcImZpcnN0XCI6XG4gICAgICAgICAgICBmaXJzdChjaHVuayk7XG4gICAgICAgICAgICBzdGF0ZSA9IFwiYWNjZXB0XCI7XG4gICAgICAgICAgLy8gZmFsbCB0aHJvdWdoXG4gICAgICAgICAgY2FzZSBcImFjY2VwdFwiOlxuICAgICAgICAgICAgaWYgKGFzbVtjaHVuay5uYW1lXSkge1xuICAgICAgICAgICAgICBhc21bY2h1bmsubmFtZV0oY2h1bmsudmFsdWUpO1xuICAgICAgICAgICAgICBpZiAoYXNtLmRlcHRoID09PSBsZXZlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwdXNoKGFzbSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub25lO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBvYmplY3QgZmlsdGVyICsgYSBwb3NzaWJsZSBmaXJzdCBjaGVja1xuICAgIHJldHVybiAoY2h1bms6IGFueSkgPT4ge1xuICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICBjYXNlIFwiZmlyc3RcIjpcbiAgICAgICAgICBmaXJzdChjaHVuayk7XG4gICAgICAgICAgc3RhdGUgPSBcImNoZWNrXCI7XG4gICAgICAgIC8vIGZhbGwgdGhyb3VnaFxuICAgICAgICBjYXNlIFwiY2hlY2tcIjpcbiAgICAgICAgICBpZiAoYXNtW2NodW5rLm5hbWVdKSB7XG4gICAgICAgICAgICBhc21bY2h1bmsubmFtZV0oY2h1bmsudmFsdWUpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gb2JqZWN0RmlsdGVyKGFzbSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgIHN0YXRlID0gXCJhY2NlcHRcIjtcbiAgICAgICAgICAgICAgaWYgKGFzbS5kZXB0aCA9PT0gbGV2ZWwpIHJldHVybiBwdXNoKGFzbSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgaWYgKGFzbS5kZXB0aCA9PT0gbGV2ZWwpIHJldHVybiBwdXNoKGFzbSwgdHJ1ZSk7XG4gICAgICAgICAgICAgIHN0YXRlID0gXCJyZWplY3RcIjtcbiAgICAgICAgICAgICAgc2F2ZWRBc20gPSBhc207XG4gICAgICAgICAgICAgIGFzbSA9IG5ldyBDb3VudGVyKHNhdmVkQXNtLmRlcHRoKTtcbiAgICAgICAgICAgICAgc2F2ZWRBc20uZHJvcFRvTGV2ZWwobGV2ZWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKGFzbS5kZXB0aCA9PT0gbGV2ZWwpIHJldHVybiBwdXNoKGFzbSwgIWluY2x1ZGVVbmRlY2lkZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImFjY2VwdFwiOlxuICAgICAgICAgIGlmIChhc21bY2h1bmsubmFtZV0pIHtcbiAgICAgICAgICAgIGFzbVtjaHVuay5uYW1lXShjaHVuay52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoYXNtLmRlcHRoID09PSBsZXZlbCkge1xuICAgICAgICAgICAgICBzdGF0ZSA9IFwiY2hlY2tcIjtcbiAgICAgICAgICAgICAgcmV0dXJuIHB1c2goYXNtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJyZWplY3RcIjpcbiAgICAgICAgICBpZiAoYXNtW2NodW5rLm5hbWVdKSB7XG4gICAgICAgICAgICBhc21bY2h1bmsubmFtZV0oY2h1bmsudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGFzbS5kZXB0aCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgICAgICAgc3RhdGUgPSBcImNoZWNrXCI7XG4gICAgICAgICAgICAgIGFzbSA9IHNhdmVkQXNtO1xuICAgICAgICAgICAgICBzYXZlZEFzbSA9IG51bGw7XG4gICAgICAgICAgICAgIHJldHVybiBwdXNoKGFzbSwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vbmU7XG4gICAgfTtcbiAgfTtcblxuZXhwb3J0IGNvbnN0IFN0cmVhbUFycmF5ID0gKG9wdGlvbnM/OiBhbnkpID0+IHtcbiAgbGV0IGtleSA9IDA7XG4gIHJldHVybiBzdHJlYW1CYXNlKHtcbiAgICBsZXZlbDogMSxcblxuICAgIGZpcnN0KGNodW5rOiBhbnkpIHtcbiAgICAgIGlmIChjaHVuay5uYW1lICE9PSBcInN0YXJ0QXJyYXlcIikgdGhyb3cgbmV3IEVycm9yKFwiVG9wLWxldmVsIG9iamVjdCBzaG91bGQgYmUgYW4gYXJyYXkuXCIpO1xuICAgIH0sXG5cbiAgICBwdXNoKGFzbTogYW55LCBkaXNjYXJkOiBhbnkpIHtcbiAgICAgIGlmIChhc20uY3VycmVudC5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGRpc2NhcmQpIHtcbiAgICAgICAgICArK2tleTtcbiAgICAgICAgICBhc20uY3VycmVudC5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4geyBrZXk6IGtleSsrLCB2YWx1ZTogYXNtLmN1cnJlbnQucG9wKCkgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5vbmU7XG4gICAgfSxcbiAgfSkob3B0aW9ucyk7XG59O1xuIiwgImltcG9ydCB7IExpc3QsIE1lbnVCYXJFeHRyYSwgSWNvbiwgb3BlbiwgTGF1bmNoVHlwZSwgZW52aXJvbm1lbnQsIEFjdGlvblBhbmVsLCBBY3Rpb24gfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCBvcyBmcm9tIFwibm9kZTpvc1wiO1xuaW1wb3J0IHsgdXNlUmVmLCB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZU1lbW8gfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZVByb21pc2UsIFByb21pc2VPcHRpb25zIH0gZnJvbSBcIi4vdXNlUHJvbWlzZVwiO1xuaW1wb3J0IHsgdXNlTGF0ZXN0IH0gZnJvbSBcIi4vdXNlTGF0ZXN0XCI7XG5pbXBvcnQgeyBzaG93RmFpbHVyZVRvYXN0IH0gZnJvbSBcIi4vc2hvd0ZhaWx1cmVUb2FzdFwiO1xuaW1wb3J0IHsgYmFzZUV4ZWN1dGVTUUwsIFBlcm1pc3Npb25FcnJvciwgaXNQZXJtaXNzaW9uRXJyb3IgfSBmcm9tIFwiLi9zcWwtdXRpbHNcIjtcblxuLyoqXG4gKiBFeGVjdXRlcyBhIHF1ZXJ5IG9uIGEgbG9jYWwgU1FMIGRhdGFiYXNlIGFuZCByZXR1cm5zIHRoZSB7QGxpbmsgQXN5bmNTdGF0ZX0gY29ycmVzcG9uZGluZyB0byB0aGUgcXVlcnkgb2YgdGhlIGNvbW1hbmQuIFRoZSBsYXN0IHZhbHVlIHdpbGwgYmUga2VwdCBiZXR3ZWVuIGNvbW1hbmQgcnVucy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyB1c2VTUUwgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqIGltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuICogaW1wb3J0IHsgaG9tZWRpciB9IGZyb20gXCJvc1wiO1xuICpcbiAqIGNvbnN0IE5PVEVTX0RCID0gcmVzb2x2ZShob21lZGlyKCksIFwiTGlicmFyeS9Hcm91cCBDb250YWluZXJzL2dyb3VwLmNvbS5hcHBsZS5ub3Rlcy9Ob3RlU3RvcmUuc3FsaXRlXCIpO1xuICogY29uc3Qgbm90ZXNRdWVyeSA9IGBTRUxFQ1QgaWQsIHRpdGxlIEZST00gLi4uYDtcbiAqIHR5cGUgTm90ZUl0ZW0gPSB7XG4gKiAgIGlkOiBzdHJpbmc7XG4gKiAgIHRpdGxlOiBzdHJpbmc7XG4gKiB9O1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQoKSB7XG4gKiAgIGNvbnN0IHsgaXNMb2FkaW5nLCBkYXRhLCBwZXJtaXNzaW9uVmlldyB9ID0gdXNlU1FMPE5vdGVJdGVtPihOT1RFU19EQiwgbm90ZXNRdWVyeSk7XG4gKlxuICogICBpZiAocGVybWlzc2lvblZpZXcpIHtcbiAqICAgICByZXR1cm4gcGVybWlzc2lvblZpZXc7XG4gKiAgIH1cbiAqXG4gKiAgIHJldHVybiAoXG4gKiAgICAgPExpc3QgaXNMb2FkaW5nPXtpc0xvYWRpbmd9PlxuICogICAgICAgeyhkYXRhIHx8IFtdKS5tYXAoKGl0ZW0pID0+IChcbiAqICAgICAgICAgPExpc3QuSXRlbSBrZXk9e2l0ZW0uaWR9IHRpdGxlPXtpdGVtLnRpdGxlfSAvPlxuICogICAgICAgKSl9XG4gKiAgICAgPC9MaXN0PlxuICogICk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VTUUw8VCA9IHVua25vd24+KFxuICBkYXRhYmFzZVBhdGg6IHN0cmluZyxcbiAgcXVlcnk6IHN0cmluZyxcbiAgb3B0aW9ucz86IHtcbiAgICAvKiogQSBzdHJpbmcgZXhwbGFpbmluZyB3aHkgdGhlIGV4dGVuc2lvbiBuZWVkcyBmdWxsIGRpc2sgYWNjZXNzLiBGb3IgZXhhbXBsZSwgdGhlIEFwcGxlIE5vdGVzIGV4dGVuc2lvbiB1c2VzIGBcIlRoaXMgaXMgcmVxdWlyZWQgdG8gc2VhcmNoIHlvdXIgQXBwbGUgTm90ZXMuXCJgLiBXaGlsZSBpdCBpcyBvcHRpb25hbCwgd2UgcmVjb21tZW5kIHNldHRpbmcgaXQgdG8gaGVscCB1c2VycyB1bmRlcnN0YW5kLiAqL1xuICAgIHBlcm1pc3Npb25QcmltaW5nPzogc3RyaW5nO1xuICB9ICYgT21pdDxQcm9taXNlT3B0aW9uczwoZGF0YWJhc2U6IHN0cmluZywgcXVlcnk6IHN0cmluZykgPT4gUHJvbWlzZTxUW10+PiwgXCJhYm9ydGFibGVcIj4sXG4pIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICBjb25zdCB7IHBlcm1pc3Npb25QcmltaW5nLCAuLi51c2VQcm9taXNlT3B0aW9ucyB9ID0gb3B0aW9ucyB8fCB7fTtcblxuICBjb25zdCBbcGVybWlzc2lvblZpZXcsIHNldFBlcm1pc3Npb25WaWV3XSA9IHVzZVN0YXRlPFJlYWN0LkpTWC5FbGVtZW50IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IGxhdGVzdE9wdGlvbnMgPSB1c2VMYXRlc3Qob3B0aW9ucyB8fCB7fSk7XG4gIGNvbnN0IGFib3J0YWJsZSA9IHVzZVJlZjxBYm9ydENvbnRyb2xsZXI+KG51bGwpO1xuXG4gIGNvbnN0IGhhbmRsZUVycm9yID0gdXNlQ2FsbGJhY2soXG4gICAgKF9lcnJvcjogRXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoX2Vycm9yKTtcbiAgICAgIGNvbnN0IGVycm9yID1cbiAgICAgICAgX2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgX2Vycm9yLm1lc3NhZ2UuaW5jbHVkZXMoXCJhdXRob3JpemF0aW9uIGRlbmllZFwiKVxuICAgICAgICAgID8gbmV3IFBlcm1pc3Npb25FcnJvcihcIllvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIGFjY2VzcyB0aGUgZGF0YWJhc2UuXCIpXG4gICAgICAgICAgOiAoX2Vycm9yIGFzIEVycm9yKTtcblxuICAgICAgaWYgKGlzUGVybWlzc2lvbkVycm9yKGVycm9yKSkge1xuICAgICAgICBzZXRQZXJtaXNzaW9uVmlldyg8UGVybWlzc2lvbkVycm9yU2NyZWVuIHByaW1pbmc9e2xhdGVzdE9wdGlvbnMuY3VycmVudC5wZXJtaXNzaW9uUHJpbWluZ30gLz4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGxhdGVzdE9wdGlvbnMuY3VycmVudC5vbkVycm9yKSB7XG4gICAgICAgICAgbGF0ZXN0T3B0aW9ucy5jdXJyZW50Lm9uRXJyb3IoZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChlbnZpcm9ubWVudC5sYXVuY2hUeXBlICE9PSBMYXVuY2hUeXBlLkJhY2tncm91bmQpIHtcbiAgICAgICAgICAgIHNob3dGYWlsdXJlVG9hc3QoZXJyb3IsIHtcbiAgICAgICAgICAgICAgdGl0bGU6IFwiQ2Fubm90IHF1ZXJ5IHRoZSBkYXRhXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIFtsYXRlc3RPcHRpb25zXSxcbiAgKTtcblxuICBjb25zdCBmbiA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghZXhpc3RzU3luYyhkYXRhYmFzZVBhdGgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgZGF0YWJhc2UgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFzeW5jIChkYXRhYmFzZVBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgYWJvcnRTaWduYWwgPSBhYm9ydGFibGUuY3VycmVudD8uc2lnbmFsO1xuICAgICAgcmV0dXJuIGJhc2VFeGVjdXRlU1FMPFQ+KGRhdGFiYXNlUGF0aCwgcXVlcnksIHsgc2lnbmFsOiBhYm9ydFNpZ25hbCB9KTtcbiAgICB9O1xuICB9LCBbZGF0YWJhc2VQYXRoXSk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi51c2VQcm9taXNlKGZuLCBbZGF0YWJhc2VQYXRoLCBxdWVyeV0sIHsgLi4udXNlUHJvbWlzZU9wdGlvbnMsIG9uRXJyb3I6IGhhbmRsZUVycm9yIH0pLFxuICAgIHBlcm1pc3Npb25WaWV3LFxuICB9O1xufVxuXG5mdW5jdGlvbiBQZXJtaXNzaW9uRXJyb3JTY3JlZW4ocHJvcHM6IHsgcHJpbWluZz86IHN0cmluZyB9KSB7XG4gIGNvbnN0IG1hY29zVmVudHVyYUFuZExhdGVyID0gcGFyc2VJbnQob3MucmVsZWFzZSgpLnNwbGl0KFwiLlwiKVswXSkgPj0gMjI7XG4gIGNvbnN0IHByZWZlcmVuY2VzU3RyaW5nID0gbWFjb3NWZW50dXJhQW5kTGF0ZXIgPyBcIlNldHRpbmdzXCIgOiBcIlByZWZlcmVuY2VzXCI7XG5cbiAgY29uc3QgYWN0aW9uID0gbWFjb3NWZW50dXJhQW5kTGF0ZXJcbiAgICA/IHtcbiAgICAgICAgdGl0bGU6IFwiT3BlbiBTeXN0ZW0gU2V0dGluZ3MgLT4gUHJpdmFjeVwiLFxuICAgICAgICB0YXJnZXQ6IFwieC1hcHBsZS5zeXN0ZW1wcmVmZXJlbmNlczpjb20uYXBwbGUucHJlZmVyZW5jZS5zZWN1cml0eT9Qcml2YWN5X0FsbEZpbGVzXCIsXG4gICAgICB9XG4gICAgOiB7XG4gICAgICAgIHRpdGxlOiBcIk9wZW4gU3lzdGVtIFByZWZlcmVuY2VzIC0+IFNlY3VyaXR5XCIsXG4gICAgICAgIHRhcmdldDogXCJ4LWFwcGxlLnN5c3RlbXByZWZlcmVuY2VzOmNvbS5hcHBsZS5wcmVmZXJlbmNlLnNlY3VyaXR5P1ByaXZhY3lfQWxsRmlsZXNcIixcbiAgICAgIH07XG5cbiAgaWYgKGVudmlyb25tZW50LmNvbW1hbmRNb2RlID09PSBcIm1lbnUtYmFyXCIpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPE1lbnVCYXJFeHRyYSBpY29uPXtJY29uLldhcm5pbmd9IHRpdGxlPXtlbnZpcm9ubWVudC5jb21tYW5kTmFtZX0+XG4gICAgICAgIDxNZW51QmFyRXh0cmEuSXRlbVxuICAgICAgICAgIHRpdGxlPVwiUmF5Y2FzdCBuZWVkcyBmdWxsIGRpc2sgYWNjZXNzXCJcbiAgICAgICAgICB0b29sdGlwPXtgWW91IGNhbiByZXZlcnQgdGhpcyBhY2Nlc3MgaW4gJHtwcmVmZXJlbmNlc1N0cmluZ30gd2hlbmV2ZXIgeW91IHdhbnRgfVxuICAgICAgICAvPlxuICAgICAgICB7cHJvcHMucHJpbWluZyA/IChcbiAgICAgICAgICA8TWVudUJhckV4dHJhLkl0ZW1cbiAgICAgICAgICAgIHRpdGxlPXtwcm9wcy5wcmltaW5nfVxuICAgICAgICAgICAgdG9vbHRpcD17YFlvdSBjYW4gcmV2ZXJ0IHRoaXMgYWNjZXNzIGluICR7cHJlZmVyZW5jZXNTdHJpbmd9IHdoZW5ldmVyIHlvdSB3YW50YH1cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPE1lbnVCYXJFeHRyYS5TZXBhcmF0b3IgLz5cbiAgICAgICAgPE1lbnVCYXJFeHRyYS5JdGVtIHRpdGxlPXthY3Rpb24udGl0bGV9IG9uQWN0aW9uPXsoKSA9PiBvcGVuKGFjdGlvbi50YXJnZXQpfSAvPlxuICAgICAgPC9NZW51QmFyRXh0cmE+XG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPExpc3Q+XG4gICAgICA8TGlzdC5FbXB0eVZpZXdcbiAgICAgICAgaWNvbj17e1xuICAgICAgICAgIHNvdXJjZToge1xuICAgICAgICAgICAgbGlnaHQ6IFwiaHR0cHM6Ly9yYXljYXN0LmNvbS91cGxvYWRzL2V4dGVuc2lvbnMtdXRpbHMtc2VjdXJpdHktcGVybWlzc2lvbnMtbGlnaHQucG5nXCIsXG4gICAgICAgICAgICBkYXJrOiBcImh0dHBzOi8vcmF5Y2FzdC5jb20vdXBsb2Fkcy9leHRlbnNpb25zLXV0aWxzLXNlY3VyaXR5LXBlcm1pc3Npb25zLWRhcmsucG5nXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfX1cbiAgICAgICAgdGl0bGU9XCJSYXljYXN0IG5lZWRzIGZ1bGwgZGlzayBhY2Nlc3MuXCJcbiAgICAgICAgZGVzY3JpcHRpb249e2Ake1xuICAgICAgICAgIHByb3BzLnByaW1pbmcgPyBwcm9wcy5wcmltaW5nICsgXCJcXG5cIiA6IFwiXCJcbiAgICAgICAgfVlvdSBjYW4gcmV2ZXJ0IHRoaXMgYWNjZXNzIGluICR7cHJlZmVyZW5jZXNTdHJpbmd9IHdoZW5ldmVyIHlvdSB3YW50LmB9XG4gICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgIDxBY3Rpb25QYW5lbD5cbiAgICAgICAgICAgIDxBY3Rpb24uT3BlbiB7Li4uYWN0aW9ufSAvPlxuICAgICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gICAgICAgIH1cbiAgICAgIC8+XG4gICAgPC9MaXN0PlxuICApO1xufVxuIiwgImltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwibm9kZTpmc1wiO1xuaW1wb3J0IHsgY29weUZpbGUsIG1rZGlyLCB3cml0ZUZpbGUgfSBmcm9tIFwibm9kZTpmcy9wcm9taXNlc1wiO1xuaW1wb3J0IG9zIGZyb20gXCJub2RlOm9zXCI7XG5pbXBvcnQgY2hpbGRQcm9jZXNzIGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB7IGdldFNwYXduZWRQcm9taXNlLCBnZXRTcGF3bmVkUmVzdWx0IH0gZnJvbSBcIi4vZXhlYy11dGlsc1wiO1xuaW1wb3J0IHsgaGFzaCB9IGZyb20gXCIuL2hlbHBlcnNcIjtcblxuZXhwb3J0IGNsYXNzIFBlcm1pc3Npb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJQZXJtaXNzaW9uRXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQZXJtaXNzaW9uRXJyb3IoZXJyb3I6IHVua25vd24pOiBlcnJvciBpcyBQZXJtaXNzaW9uRXJyb3Ige1xuICByZXR1cm4gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5uYW1lID09PSBcIlBlcm1pc3Npb25FcnJvclwiO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYmFzZUV4ZWN1dGVTUUw8VCA9IHVua25vd24+KFxuICBkYXRhYmFzZVBhdGg6IHN0cmluZyxcbiAgcXVlcnk6IHN0cmluZyxcbiAgb3B0aW9ucz86IHtcbiAgICBzaWduYWw/OiBBYm9ydFNpZ25hbDtcbiAgfSxcbik6IFByb21pc2U8VFtdPiB7XG4gIGlmICghZXhpc3RzU3luYyhkYXRhYmFzZVBhdGgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGRhdGFiYXNlIGRvZXMgbm90IGV4aXN0XCIpO1xuICB9XG5cbiAgbGV0IHNxbGl0ZTM6IHR5cGVvZiBpbXBvcnQoXCJub2RlOnNxbGl0ZVwiKTtcbiAgdHJ5IHtcbiAgICAvLyB0aGlzIGlzIGEgYml0IHVnbHkgYnV0IHdlIGNhbid0IGRpcmVjdGx5IGltcG9ydCBcIm5vZGU6c3FsaXRlXCIgaGVyZSBiZWNhdXNlIHBhcmNlbCB3aWxsIGhvaXN0IGl0IGFueXdheSBhbmQgaXQgd2lsbCBicmVhayB3aGVuIGl0J3Mgbm90IGF2YWlsYWJsZVxuICAgIGNvbnN0IGR5bmFtaWNJbXBvcnQgPSAobW9kdWxlOiBzdHJpbmcpID0+IGltcG9ydChtb2R1bGUpO1xuICAgIHNxbGl0ZTMgPSBhd2FpdCBkeW5hbWljSW1wb3J0KFwibm9kZTpzcWxpdGVcIik7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gSWYgc3FsaXRlMyBpcyBub3QgYXZhaWxhYmxlLCB3ZSBmYWxsYmFjayB0byB1c2luZyB0aGUgc3FsaXRlMyBDTEkgKGF2YWlsYWJsZSBvbiBtYWNPUyBhbmQgTGludXggYnkgZGVmYXVsdCkuXG4gICAgcmV0dXJuIHNxbGl0ZUZhbGxiYWNrPFQ+KGRhdGFiYXNlUGF0aCwgcXVlcnksIG9wdGlvbnMpO1xuICB9XG5cbiAgbGV0IGRiID0gbmV3IHNxbGl0ZTMuRGF0YWJhc2VTeW5jKGRhdGFiYXNlUGF0aCwgeyBvcGVuOiBmYWxzZSwgcmVhZE9ubHk6IHRydWUgfSk7XG5cbiAgY29uc3QgYWJvcnRTaWduYWwgPSBvcHRpb25zPy5zaWduYWw7XG5cbiAgdHJ5IHtcbiAgICBkYi5vcGVuKCk7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgaWYgKGVycm9yLm1lc3NhZ2UubWF0Y2goXCIoNSlcIikgfHwgZXJyb3IubWVzc2FnZS5tYXRjaChcIigxNClcIikpIHtcbiAgICAgIC8vIFRoYXQgbWVhbnMgdGhhdCB0aGUgREIgaXMgYnVzeSBiZWNhdXNlIG9mIGFub3RoZXIgYXBwIGlzIGxvY2tpbmcgaXRcbiAgICAgIC8vIFRoaXMgaGFwcGVucyB3aGVuIENocm9tZSBvciBBcmMgaXMgb3BlbmVkOiB0aGV5IGxvY2sgdGhlIEhpc3RvcnkgZGIuXG4gICAgICAvLyBBcyBhbiB1Z2x5IHdvcmthcm91bmQsIHdlIGR1cGxpY2F0ZSB0aGUgZmlsZSBhbmQgcmVhZCB0aGF0IGluc3RlYWRcbiAgICAgIC8vICh3aXRoIHZmcyB1bml4IC0gbm9uZSB0byBqdXN0IG5vdCBjYXJlIGFib3V0IGxvY2tzKVxuICAgICAgbGV0IHdvcmthcm91bmRDb3BpZWREYjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKCF3b3JrYXJvdW5kQ29waWVkRGIpIHtcbiAgICAgICAgY29uc3QgdGVtcEZvbGRlciA9IHBhdGguam9pbihvcy50bXBkaXIoKSwgXCJ1c2VTUUxcIiwgaGFzaChkYXRhYmFzZVBhdGgpKTtcbiAgICAgICAgYXdhaXQgbWtkaXIodGVtcEZvbGRlciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIGNoZWNrQWJvcnRlZChhYm9ydFNpZ25hbCk7XG5cbiAgICAgICAgd29ya2Fyb3VuZENvcGllZERiID0gcGF0aC5qb2luKHRlbXBGb2xkZXIsIFwiZGIuZGJcIik7XG4gICAgICAgIGF3YWl0IGNvcHlGaWxlKGRhdGFiYXNlUGF0aCwgd29ya2Fyb3VuZENvcGllZERiKTtcblxuICAgICAgICBhd2FpdCB3cml0ZUZpbGUod29ya2Fyb3VuZENvcGllZERiICsgXCItc2htXCIsIFwiXCIpO1xuICAgICAgICBhd2FpdCB3cml0ZUZpbGUod29ya2Fyb3VuZENvcGllZERiICsgXCItd2FsXCIsIFwiXCIpO1xuXG4gICAgICAgIGNoZWNrQWJvcnRlZChhYm9ydFNpZ25hbCk7XG4gICAgICB9XG5cbiAgICAgIGRiID0gbmV3IHNxbGl0ZTMuRGF0YWJhc2VTeW5jKHdvcmthcm91bmRDb3BpZWREYiwgeyBvcGVuOiBmYWxzZSwgcmVhZE9ubHk6IHRydWUgfSk7XG4gICAgICBkYi5vcGVuKCk7XG4gICAgICBjaGVja0Fib3J0ZWQoYWJvcnRTaWduYWwpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN0YXRlbWVudCA9IGRiLnByZXBhcmUocXVlcnkpO1xuICBjaGVja0Fib3J0ZWQoYWJvcnRTaWduYWwpO1xuXG4gIGNvbnN0IHJlc3VsdCA9IHN0YXRlbWVudC5hbGwoKTtcblxuICBkYi5jbG9zZSgpO1xuXG4gIHJldHVybiByZXN1bHQgYXMgVFtdO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzcWxpdGVGYWxsYmFjazxUID0gdW5rbm93bj4oXG4gIGRhdGFiYXNlUGF0aDogc3RyaW5nLFxuICBxdWVyeTogc3RyaW5nLFxuICBvcHRpb25zPzoge1xuICAgIHNpZ25hbD86IEFib3J0U2lnbmFsO1xuICB9LFxuKTogUHJvbWlzZTxUW10+IHtcbiAgY29uc3QgYWJvcnRTaWduYWwgPSBvcHRpb25zPy5zaWduYWw7XG5cbiAgbGV0IHNwYXduZWQgPSBjaGlsZFByb2Nlc3Muc3Bhd24oXCJzcWxpdGUzXCIsIFtcIi0tanNvblwiLCBcIi0tcmVhZG9ubHlcIiwgZGF0YWJhc2VQYXRoLCBxdWVyeV0sIHsgc2lnbmFsOiBhYm9ydFNpZ25hbCB9KTtcbiAgbGV0IHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCk7XG4gIGxldCBbeyBlcnJvciwgZXhpdENvZGUsIHNpZ25hbCB9LCBzdGRvdXRSZXN1bHQsIHN0ZGVyclJlc3VsdF0gPSBhd2FpdCBnZXRTcGF3bmVkUmVzdWx0PHN0cmluZz4oXG4gICAgc3Bhd25lZCxcbiAgICB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSxcbiAgICBzcGF3bmVkUHJvbWlzZSxcbiAgKTtcbiAgY2hlY2tBYm9ydGVkKGFib3J0U2lnbmFsKTtcblxuICBpZiAoc3RkZXJyUmVzdWx0Lm1hdGNoKFwiKDUpXCIpIHx8IHN0ZGVyclJlc3VsdC5tYXRjaChcIigxNClcIikpIHtcbiAgICAvLyBUaGF0IG1lYW5zIHRoYXQgdGhlIERCIGlzIGJ1c3kgYmVjYXVzZSBvZiBhbm90aGVyIGFwcCBpcyBsb2NraW5nIGl0XG4gICAgLy8gVGhpcyBoYXBwZW5zIHdoZW4gQ2hyb21lIG9yIEFyYyBpcyBvcGVuZWQ6IHRoZXkgbG9jayB0aGUgSGlzdG9yeSBkYi5cbiAgICAvLyBBcyBhbiB1Z2x5IHdvcmthcm91bmQsIHdlIGR1cGxpY2F0ZSB0aGUgZmlsZSBhbmQgcmVhZCB0aGF0IGluc3RlYWRcbiAgICAvLyAod2l0aCB2ZnMgdW5peCAtIG5vbmUgdG8ganVzdCBub3QgY2FyZSBhYm91dCBsb2NrcylcbiAgICBsZXQgd29ya2Fyb3VuZENvcGllZERiOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgaWYgKCF3b3JrYXJvdW5kQ29waWVkRGIpIHtcbiAgICAgIGNvbnN0IHRlbXBGb2xkZXIgPSBwYXRoLmpvaW4ob3MudG1wZGlyKCksIFwidXNlU1FMXCIsIGhhc2goZGF0YWJhc2VQYXRoKSk7XG4gICAgICBhd2FpdCBta2Rpcih0ZW1wRm9sZGVyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIGNoZWNrQWJvcnRlZChhYm9ydFNpZ25hbCk7XG5cbiAgICAgIHdvcmthcm91bmRDb3BpZWREYiA9IHBhdGguam9pbih0ZW1wRm9sZGVyLCBcImRiLmRiXCIpO1xuICAgICAgYXdhaXQgY29weUZpbGUoZGF0YWJhc2VQYXRoLCB3b3JrYXJvdW5kQ29waWVkRGIpO1xuXG4gICAgICBhd2FpdCB3cml0ZUZpbGUod29ya2Fyb3VuZENvcGllZERiICsgXCItc2htXCIsIFwiXCIpO1xuICAgICAgYXdhaXQgd3JpdGVGaWxlKHdvcmthcm91bmRDb3BpZWREYiArIFwiLXdhbFwiLCBcIlwiKTtcblxuICAgICAgY2hlY2tBYm9ydGVkKGFib3J0U2lnbmFsKTtcbiAgICB9XG5cbiAgICBzcGF3bmVkID0gY2hpbGRQcm9jZXNzLnNwYXduKFwic3FsaXRlM1wiLCBbXCItLWpzb25cIiwgXCItLXJlYWRvbmx5XCIsIFwiLS12ZnNcIiwgXCJ1bml4LW5vbmVcIiwgd29ya2Fyb3VuZENvcGllZERiLCBxdWVyeV0sIHtcbiAgICAgIHNpZ25hbDogYWJvcnRTaWduYWwsXG4gICAgfSk7XG4gICAgc3Bhd25lZFByb21pc2UgPSBnZXRTcGF3bmVkUHJvbWlzZShzcGF3bmVkKTtcbiAgICBbeyBlcnJvciwgZXhpdENvZGUsIHNpZ25hbCB9LCBzdGRvdXRSZXN1bHQsIHN0ZGVyclJlc3VsdF0gPSBhd2FpdCBnZXRTcGF3bmVkUmVzdWx0PHN0cmluZz4oXG4gICAgICBzcGF3bmVkLFxuICAgICAgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0sXG4gICAgICBzcGF3bmVkUHJvbWlzZSxcbiAgICApO1xuICAgIGNoZWNrQWJvcnRlZChhYm9ydFNpZ25hbCk7XG4gIH1cblxuICBpZiAoZXJyb3IgfHwgZXhpdENvZGUgIT09IDAgfHwgc2lnbmFsICE9PSBudWxsKSB7XG4gICAgaWYgKHN0ZGVyclJlc3VsdC5pbmNsdWRlcyhcImF1dGhvcml6YXRpb24gZGVuaWVkXCIpKSB7XG4gICAgICB0aHJvdyBuZXcgUGVybWlzc2lvbkVycm9yKFwiWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gYWNjZXNzIHRoZSBkYXRhYmFzZS5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihzdGRlcnJSZXN1bHQgfHwgXCJVbmtub3duIGVycm9yXCIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBKU09OLnBhcnNlKHN0ZG91dFJlc3VsdC50cmltKCkgfHwgXCJbXVwiKSBhcyBUW107XG59XG5cbmZ1bmN0aW9uIGNoZWNrQWJvcnRlZChzaWduYWw/OiBBYm9ydFNpZ25hbCkge1xuICBpZiAoc2lnbmFsPy5hYm9ydGVkKSB7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoXCJhYm9ydGVkXCIpO1xuICAgIGVycm9yLm5hbWUgPSBcIkFib3J0RXJyb3JcIjtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuIiwgImltcG9ydCB7IEZvcm0gfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZU1lbW8sIHVzZVJlZiwgU2V0U3RhdGVBY3Rpb24gfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZUxhdGVzdCB9IGZyb20gXCIuL3VzZUxhdGVzdFwiO1xuXG4vKipcbiAqIFNob3J0aGFuZHMgZm9yIGNvbW1vbiB2YWxpZGF0aW9uIGNhc2VzXG4gKi9cbmV4cG9ydCBlbnVtIEZvcm1WYWxpZGF0aW9uIHtcbiAgLyoqIFNob3cgYW4gZXJyb3Igd2hlbiB0aGUgdmFsdWUgb2YgdGhlIGl0ZW0gaXMgZW1wdHkgKi9cbiAgUmVxdWlyZWQgPSBcInJlcXVpcmVkXCIsXG59XG5cbnR5cGUgVmFsaWRhdGlvbkVycm9yID0gc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbDtcbnR5cGUgVmFsaWRhdG9yPFZhbHVlVHlwZT4gPSAoKHZhbHVlOiBWYWx1ZVR5cGUgfCB1bmRlZmluZWQpID0+IFZhbGlkYXRpb25FcnJvcikgfCBGb3JtVmFsaWRhdGlvbjtcblxuZnVuY3Rpb24gdmFsaWRhdGlvbkVycm9yPFZhbHVlVHlwZT4oXG4gIHZhbGlkYXRpb246IFZhbGlkYXRvcjxWYWx1ZVR5cGU+IHwgdW5kZWZpbmVkLFxuICB2YWx1ZTogVmFsdWVUeXBlIHwgdW5kZWZpbmVkLFxuKTogVmFsaWRhdGlvbkVycm9yIHtcbiAgaWYgKHZhbGlkYXRpb24pIHtcbiAgICBpZiAodHlwZW9mIHZhbGlkYXRpb24gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb24odmFsdWUpO1xuICAgIH0gZWxzZSBpZiAodmFsaWRhdGlvbiA9PT0gRm9ybVZhbGlkYXRpb24uUmVxdWlyZWQpIHtcbiAgICAgIGxldCB2YWx1ZUlzVmFsaWQgPSB0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIgJiYgdmFsdWUgIT09IG51bGw7XG4gICAgICBpZiAodmFsdWVJc1ZhbGlkKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgdmFsdWVJc1ZhbGlkID0gdmFsdWUubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICB2YWx1ZUlzVmFsaWQgPSB2YWx1ZS5sZW5ndGggPiAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgICAgdmFsdWVJc1ZhbGlkID0gdmFsdWUuZ2V0VGltZSgpID4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCF2YWx1ZUlzVmFsaWQpIHtcbiAgICAgICAgcmV0dXJuIFwiVGhlIGl0ZW0gaXMgcmVxdWlyZWRcIjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxudHlwZSBWYWxpZGF0aW9uPFQgZXh0ZW5kcyBGb3JtLlZhbHVlcz4gPSB7IFtpZCBpbiBrZXlvZiBUXT86IFZhbGlkYXRvcjxUW2lkXT4gfTtcblxuaW50ZXJmYWNlIEZvcm1Qcm9wczxUIGV4dGVuZHMgRm9ybS5WYWx1ZXM+IHtcbiAgLyoqIEZ1bmN0aW9uIHRvIHBhc3MgdG8gdGhlIGBvblN1Ym1pdGAgcHJvcCBvZiB0aGUgYDxBY3Rpb24uU3VibWl0Rm9ybT5gIGVsZW1lbnQuIEl0IHdyYXBzIHRoZSBpbml0aWFsIGBvblN1Ym1pdGAgYXJndW1lbnQgd2l0aCBzb21lIGdvb2RpZXMgcmVsYXRlZCB0byB0aGUgdmFsaWRhdGlvbi4gKi9cbiAgaGFuZGxlU3VibWl0OiAodmFsdWVzOiBUKSA9PiB2b2lkIHwgYm9vbGVhbiB8IFByb21pc2U8dm9pZCB8IGJvb2xlYW4+O1xuICAvKiogVGhlIHByb3BzIHRoYXQgbXVzdCBiZSBwYXNzZWQgdG8gdGhlIGA8Rm9ybS5JdGVtPmAgZWxlbWVudHMgdG8gaGFuZGxlIHRoZSB2YWxpZGF0aW9ucy4gKi9cbiAgaXRlbVByb3BzOiB7XG4gICAgW2lkIGluIGtleW9mIFJlcXVpcmVkPFQ+XTogUGFydGlhbDxGb3JtLkl0ZW1Qcm9wczxUW2lkXT4+ICYge1xuICAgICAgaWQ6IHN0cmluZztcbiAgICB9O1xuICB9O1xuICAvKiogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBwcm9ncmFtbWF0aWNhbGx5IHNldCB0aGUgdmFsaWRhdGlvbiBvZiBhIHNwZWNpZmljIGZpZWxkLiAqL1xuICBzZXRWYWxpZGF0aW9uRXJyb3I6IChpZDoga2V5b2YgVCwgZXJyb3I6IFZhbGlkYXRpb25FcnJvcikgPT4gdm9pZDtcbiAgLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gcHJvZ3JhbW1hdGljYWxseSBzZXQgdGhlIHZhbHVlIG9mIGEgc3BlY2lmaWMgZmllbGQuICovXG4gIHNldFZhbHVlOiA8SyBleHRlbmRzIGtleW9mIFQ+KGlkOiBLLCB2YWx1ZTogU2V0U3RhdGVBY3Rpb248VFtLXT4pID0+IHZvaWQ7XG4gIC8qKiBUaGUgY3VycmVudCB2YWx1ZXMgb2YgdGhlIGZvcm0uICovXG4gIHZhbHVlczogVDtcbiAgLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gcHJvZ3JhbW1hdGljYWxseSBmb2N1cyBhIHNwZWNpZmljIGZpZWxkLiAqL1xuICBmb2N1czogKGlkOiBrZXlvZiBUKSA9PiB2b2lkO1xuICAvKiogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZXNldCB0aGUgdmFsdWVzIG9mIHRoZSBGb3JtLiAqL1xuICByZXNldDogKGluaXRpYWxWYWx1ZXM/OiBQYXJ0aWFsPFQ+KSA9PiB2b2lkO1xufVxuXG4vKipcbiAqIEhvb2sgdGhhdCBwcm92aWRlcyBhIGhpZ2gtbGV2ZWwgaW50ZXJmYWNlIHRvIHdvcmsgd2l0aCBGb3JtcywgYW5kIG1vcmUgcGFydGljdWxhcmx5LCB3aXRoIEZvcm0gdmFsaWRhdGlvbnMuIEl0IGluY29ycG9yYXRlcyBhbGwgdGhlIGdvb2QgcHJhY3RpY2VzIHRvIHByb3ZpZGUgYSBncmVhdCBVc2VyIEV4cGVyaWVuY2UgZm9yIHlvdXIgRm9ybXMuXG4gKlxuICogQHJldHVybnMgYW4gb2JqZWN0IHdoaWNoIGNvbnRhaW5zIHRoZSBuZWNlc3NhcnkgbWV0aG9kcyBhbmQgcHJvcHMgdG8gcHJvdmlkZSBhIGdvb2QgVXNlciBFeHBlcmllbmNlIGluIHlvdXIgRm9ybS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQgeyBBY3Rpb24sIEFjdGlvblBhbmVsLCBGb3JtLCBzaG93VG9hc3QsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgdXNlRm9ybSwgRm9ybVZhbGlkYXRpb24gfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiBpbnRlcmZhY2UgU2lnblVwRm9ybVZhbHVlcyB7XG4gKiAgIG5pY2tuYW1lOiBzdHJpbmc7XG4gKiAgIHBhc3N3b3JkOiBzdHJpbmc7XG4gKiB9XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ29tbWFuZCgpIHtcbiAqICAgY29uc3QgeyBoYW5kbGVTdWJtaXQsIGl0ZW1Qcm9wcyB9ID0gdXNlRm9ybTxTaWduVXBGb3JtVmFsdWVzPih7XG4gKiAgICAgb25TdWJtaXQodmFsdWVzKSB7XG4gKiAgICAgICBzaG93VG9hc3QoVG9hc3QuU3R5bGUuU3VjY2VzcywgXCJZYXkhXCIsIGAke3ZhbHVlcy5uaWNrbmFtZX0gYWNjb3VudCBjcmVhdGVkYCk7XG4gKiAgICAgfSxcbiAqICAgICB2YWxpZGF0aW9uOiB7XG4gKiAgICAgICBuaWNrbmFtZTogRm9ybVZhbGlkYXRpb24uUmVxdWlyZWQsXG4gKiAgICAgICBwYXNzd29yZDogKHZhbHVlKSA9PiB7XG4gKiAgICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPCA4KSB7XG4gKiAgICAgICAgICAgcmV0dXJuIFwiUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IHN5bWJvbHNcIjtcbiAqICAgICAgICAgfSBlbHNlIGlmICghdmFsdWUpIHtcbiAqICAgICAgICAgICByZXR1cm4gXCJUaGUgaXRlbSBpcyByZXF1aXJlZFwiO1xuICogICAgICAgICB9XG4gKiAgICAgICB9LFxuICogICAgIH0sXG4gKiAgIH0pO1xuICpcbiAqICAgcmV0dXJuIChcbiAqICAgICA8Rm9ybVxuICogICAgICAgYWN0aW9ucz17XG4gKiAgICAgICAgIDxBY3Rpb25QYW5lbD5cbiAqICAgICAgICAgICA8QWN0aW9uLlN1Ym1pdEZvcm0gdGl0bGU9XCJTdWJtaXRcIiBvblN1Ym1pdD17aGFuZGxlU3VibWl0fSAvPlxuICogICAgICAgICA8L0FjdGlvblBhbmVsPlxuICogICAgICAgfVxuICogICAgID5cbiAqICAgICAgIDxGb3JtLlRleHRGaWVsZCB0aXRsZT1cIk5pY2tuYW1lXCIgcGxhY2Vob2xkZXI9XCJFbnRlciB5b3VyIG5pY2tuYW1lXCIgey4uLml0ZW1Qcm9wcy5uaWNrbmFtZX0gLz5cbiAqICAgICAgIDxGb3JtLlBhc3N3b3JkRmllbGRcbiAqICAgICAgICAgdGl0bGU9XCJQYXNzd29yZFwiXG4gKiAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgcGFzc3dvcmQgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzIGxvbmdcIlxuICogICAgICAgICB7Li4uaXRlbVByb3BzLnBhc3N3b3JkfVxuICogICAgICAgLz5cbiAqICAgICA8L0Zvcm0+XG4gKiAgICk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUZvcm08VCBleHRlbmRzIEZvcm0uVmFsdWVzPihwcm9wczoge1xuICAvKiogQ2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBmb3JtIGlzIHN1Ym1pdHRlZCBhbmQgYWxsIHZhbGlkYXRpb25zIHBhc3MuICovXG4gIG9uU3VibWl0OiAodmFsdWVzOiBUKSA9PiB2b2lkIHwgYm9vbGVhbiB8IFByb21pc2U8dm9pZCB8IGJvb2xlYW4+O1xuICAvKiogVGhlIGluaXRpYWwgdmFsdWVzIHRvIHNldCB3aGVuIHRoZSBGb3JtIGlzIGZpcnN0IHJlbmRlcmVkLiAqL1xuICBpbml0aWFsVmFsdWVzPzogUGFydGlhbDxUPjtcbiAgLyoqIFRoZSB2YWxpZGF0aW9uIHJ1bGVzIGZvciB0aGUgRm9ybS4gQSB2YWxpZGF0aW9uIGZvciBhIEZvcm0gaXRlbSBpcyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGl0ZW0gYXMgYW4gYXJndW1lbnQgYW5kIG11c3QgcmV0dXJuIGEgc3RyaW5nIHdoZW4gdGhlIHZhbGlkYXRpb24gaXMgZmFpbGluZy5cbiAgICpcbiAgICogVGhlcmUgYXJlIGFsc28gc29tZSBzaG9ydGhhbmRzIGZvciBjb21tb24gY2FzZXMsIHNlZSB7QGxpbmsgRm9ybVZhbGlkYXRpb259LlxuICAgKiAqL1xuICB2YWxpZGF0aW9uPzogVmFsaWRhdGlvbjxUPjtcbn0pOiBGb3JtUHJvcHM8VD4ge1xuICBjb25zdCB7IG9uU3VibWl0OiBfb25TdWJtaXQsIHZhbGlkYXRpb24sIGluaXRpYWxWYWx1ZXMgPSB7fSB9ID0gcHJvcHM7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBpdCdzIGZpbmUgaWYgd2UgZG9uJ3Qgc3BlY2lmeSBhbGwgdGhlIHZhbHVlc1xuICBjb25zdCBbdmFsdWVzLCBzZXRWYWx1ZXNdID0gdXNlU3RhdGU8VD4oaW5pdGlhbFZhbHVlcyk7XG4gIGNvbnN0IFtlcnJvcnMsIHNldEVycm9yc10gPSB1c2VTdGF0ZTx7IFtpZCBpbiBrZXlvZiBUXT86IFZhbGlkYXRpb25FcnJvciB9Pih7fSk7XG4gIGNvbnN0IHJlZnMgPSB1c2VSZWY8eyBbaWQgaW4ga2V5b2YgVF0/OiBGb3JtLkl0ZW1SZWZlcmVuY2UgfT4oe30pO1xuXG4gIGNvbnN0IGxhdGVzdFZhbGlkYXRpb24gPSB1c2VMYXRlc3Q8VmFsaWRhdGlvbjxUPj4odmFsaWRhdGlvbiB8fCB7fSk7XG4gIGNvbnN0IGxhdGVzdE9uU3VibWl0ID0gdXNlTGF0ZXN0KF9vblN1Ym1pdCk7XG5cbiAgY29uc3QgZm9jdXMgPSB1c2VDYWxsYmFjayhcbiAgICAoaWQ6IGtleW9mIFQpID0+IHtcbiAgICAgIHJlZnMuY3VycmVudFtpZF0/LmZvY3VzKCk7XG4gICAgfSxcbiAgICBbcmVmc10sXG4gICk7XG5cbiAgY29uc3QgaGFuZGxlU3VibWl0ID0gdXNlQ2FsbGJhY2soXG4gICAgYXN5bmMgKHZhbHVlczogVCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgbGV0IHZhbGlkYXRpb25FcnJvcnM6IGZhbHNlIHwgeyBba2V5IGluIGtleW9mIFRdPzogVmFsaWRhdGlvbkVycm9yIH0gPSBmYWxzZTtcbiAgICAgIGZvciAoY29uc3QgW2lkLCB2YWxpZGF0aW9uXSBvZiBPYmplY3QuZW50cmllcyhsYXRlc3RWYWxpZGF0aW9uLmN1cnJlbnQpKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gdmFsaWRhdGlvbkVycm9yKHZhbGlkYXRpb24sIHZhbHVlc1tpZF0pO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoIXZhbGlkYXRpb25FcnJvcnMpIHtcbiAgICAgICAgICAgIHZhbGlkYXRpb25FcnJvcnMgPSB7fTtcbiAgICAgICAgICAgIC8vIHdlIGZvY3VzIHRoZSBmaXJzdCBpdGVtIHRoYXQgaGFzIGFuIGVycm9yXG4gICAgICAgICAgICBmb2N1cyhpZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbGlkYXRpb25FcnJvcnNbaWQgYXMga2V5b2YgVF0gPSBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHZhbGlkYXRpb25FcnJvcnMpIHtcbiAgICAgICAgc2V0RXJyb3JzKHZhbGlkYXRpb25FcnJvcnMpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBsYXRlc3RPblN1Ym1pdC5jdXJyZW50KHZhbHVlcyk7XG4gICAgICByZXR1cm4gdHlwZW9mIHJlc3VsdCA9PT0gXCJib29sZWFuXCIgPyByZXN1bHQgOiB0cnVlO1xuICAgIH0sXG4gICAgW2xhdGVzdFZhbGlkYXRpb24sIGxhdGVzdE9uU3VibWl0LCBmb2N1c10sXG4gICk7XG5cbiAgY29uc3Qgc2V0VmFsaWRhdGlvbkVycm9yID0gdXNlQ2FsbGJhY2soXG4gICAgKGlkOiBrZXlvZiBULCBlcnJvcjogVmFsaWRhdGlvbkVycm9yKSA9PiB7XG4gICAgICBzZXRFcnJvcnMoKGVycm9ycykgPT4gKHsgLi4uZXJyb3JzLCBbaWRdOiBlcnJvciB9KSk7XG4gICAgfSxcbiAgICBbc2V0RXJyb3JzXSxcbiAgKTtcblxuICBjb25zdCBzZXRWYWx1ZSA9IHVzZUNhbGxiYWNrKFxuICAgIGZ1bmN0aW9uIDxLIGV4dGVuZHMga2V5b2YgVD4oaWQ6IEssIHZhbHVlOiBTZXRTdGF0ZUFjdGlvbjxUW0tdPikge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUUyBpcyBhbHdheXMgY29uZnVzZWQgYWJvdXQgU2V0U3RhdGVBY3Rpb24sIGJ1dCBpdCdzIGZpbmUgaGVyZVxuICAgICAgc2V0VmFsdWVzKCh2YWx1ZXMpID0+ICh7IC4uLnZhbHVlcywgW2lkXTogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZSh2YWx1ZXNbaWRdKSA6IHZhbHVlIH0pKTtcbiAgICB9LFxuICAgIFtzZXRWYWx1ZXNdLFxuICApO1xuXG4gIGNvbnN0IGl0ZW1Qcm9wcyA9IHVzZU1lbW88eyBbaWQgaW4ga2V5b2YgUmVxdWlyZWQ8VD5dOiBQYXJ0aWFsPEZvcm0uSXRlbVByb3BzPFRbaWRdPj4gJiB7IGlkOiBzdHJpbmcgfSB9PigoKSA9PiB7XG4gICAgLy8gd2UgaGF2ZSB0byB1c2UgYSBwcm94eSBiZWNhdXNlIHdlIGRvbid0IGFjdHVhbGx5IGhhdmUgYW55IG9iamVjdCB0byBpdGVyYXRlIHRocm91Z2hcbiAgICAvLyBzbyBpbnN0ZWFkIHdlIGR5bmFtaWNhbGx5IGNyZWF0ZSB0aGUgcHJvcHMgd2hlbiByZXF1aXJlZFxuICAgIHJldHVybiBuZXcgUHJveHk8eyBbaWQgaW4ga2V5b2YgUmVxdWlyZWQ8VD5dOiBQYXJ0aWFsPEZvcm0uSXRlbVByb3BzPFRbaWRdPj4gJiB7IGlkOiBzdHJpbmcgfSB9PihcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdGhlIHdob2xlIHBvaW50IG9mIGEgcHJveHkuLi5cbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBnZXQodGFyZ2V0LCBpZDoga2V5b2YgVCkge1xuICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb24gPSBsYXRlc3RWYWxpZGF0aW9uLmN1cnJlbnRbaWRdO1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gdmFsdWVzW2lkXTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb25DaGFuZ2UodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKGVycm9yc1tpZF0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IHZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICAgICAgICAgICAgc2V0VmFsaWRhdGlvbkVycm9yKGlkLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZXRWYWx1ZShpZCwgdmFsdWUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQmx1cihldmVudCkge1xuICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IHZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uLCBldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBzZXRWYWxpZGF0aW9uRXJyb3IoaWQsIGVycm9yKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBlcnJvcnNbaWRdLFxuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAvLyB3ZSBzaG91bGRuJ3QgcmV0dXJuIGB1bmRlZmluZWRgIG90aGVyd2lzZSBpdCB3aWxsIGJlIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnRcbiAgICAgICAgICAgIHZhbHVlOiB0eXBlb2YgdmFsdWUgPT09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogdmFsdWUsXG4gICAgICAgICAgICByZWY6IChpbnN0YW5jZTogRm9ybS5JdGVtUmVmZXJlbmNlKSA9PiB7XG4gICAgICAgICAgICAgIHJlZnMuY3VycmVudFtpZF0gPSBpbnN0YW5jZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSBhcyBQYXJ0aWFsPEZvcm0uSXRlbVByb3BzPFRba2V5b2YgVF0+PiAmIHsgaWQ6IHN0cmluZyB9O1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICApO1xuICB9LCBbZXJyb3JzLCBsYXRlc3RWYWxpZGF0aW9uLCBzZXRWYWxpZGF0aW9uRXJyb3IsIHZhbHVlcywgcmVmcywgc2V0VmFsdWVdKTtcblxuICBjb25zdCByZXNldCA9IHVzZUNhbGxiYWNrKFxuICAgICh2YWx1ZXM/OiBQYXJ0aWFsPFQ+KSA9PiB7XG4gICAgICBzZXRFcnJvcnMoe30pO1xuICAgICAgT2JqZWN0LmVudHJpZXMocmVmcy5jdXJyZW50KS5mb3JFYWNoKChbaWQsIHJlZl0pID0+IHtcbiAgICAgICAgaWYgKCF2YWx1ZXM/LltpZF0pIHtcbiAgICAgICAgICByZWY/LnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGl0J3MgZmluZSBpZiB3ZSBkb24ndCBzcGVjaWZ5IGFsbCB0aGUgdmFsdWVzXG4gICAgICAgIHNldFZhbHVlcyh2YWx1ZXMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgW3NldFZhbHVlcywgc2V0RXJyb3JzLCByZWZzXSxcbiAgKTtcblxuICByZXR1cm4geyBoYW5kbGVTdWJtaXQsIHNldFZhbGlkYXRpb25FcnJvciwgc2V0VmFsdWUsIHZhbHVlcywgaXRlbVByb3BzLCBmb2N1cywgcmVzZXQgfTtcbn1cbiIsICJpbXBvcnQgeyB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBBSSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IFByb21pc2VPcHRpb25zLCB1c2VQcm9taXNlIH0gZnJvbSBcIi4vdXNlUHJvbWlzZVwiO1xuaW1wb3J0IHsgRnVuY3Rpb25SZXR1cm5pbmdQcm9taXNlIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBTdHJlYW0gYSBwcm9tcHQgY29tcGxldGlvbi5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgRGV0YWlsLCBMYXVuY2hQcm9wcyB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZSBBSSB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbW1hbmQocHJvcHM6IExhdW5jaFByb3BzPHsgYXJndW1lbnRzOiB7IHByb21wdDogc3RyaW5nIH0gfT4pIHtcbiAqICAgY29uc3QgeyBpc0xvYWRpbmcsIGRhdGEgfSA9IHVzZUFJKHByb3BzLmFyZ3VtZW50cy5wcm9tcHQpO1xuICpcbiAqICAgcmV0dXJuIDxEZXRhaWwgaXNMb2FkaW5nPXtpc0xvYWRpbmd9IG1hcmtkb3duPXtkYXRhfSAvPjtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQUkoXG4gIHByb21wdDogc3RyaW5nLFxuICBvcHRpb25zOiB7XG4gICAgLyoqXG4gICAgICogQ29uY3JldGUgdGFza3MsIHN1Y2ggYXMgZml4aW5nIGdyYW1tYXIsIHJlcXVpcmUgbGVzcyBjcmVhdGl2aXR5IHdoaWxlIG9wZW4tZW5kZWQgcXVlc3Rpb25zLCBzdWNoIGFzIGdlbmVyYXRpbmcgaWRlYXMsIHJlcXVpcmUgbW9yZS5cbiAgICAgKiBJZiBhIG51bWJlciBpcyBwYXNzZWQsIGl0IG5lZWRzIHRvIGJlIGluIHRoZSByYW5nZSAwLTIuIEZvciBsYXJnZXIgdmFsdWVzLCAyIHdpbGwgYmUgdXNlZC4gRm9yIGxvd2VyIHZhbHVlcywgMCB3aWxsIGJlIHVzZWQuXG4gICAgICovXG4gICAgY3JlYXRpdml0eT86IEFJLkNyZWF0aXZpdHk7XG4gICAgLyoqXG4gICAgICogVGhlIEFJIG1vZGVsIHRvIHVzZSB0byBhbnN3ZXIgdG8gdGhlIHByb21wdC5cbiAgICAgKi9cbiAgICBtb2RlbD86IEFJLk1vZGVsO1xuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdG8gc3RyZWFtIHRoZSBhbnN3ZXIgb3Igb25seSB1cGRhdGUgdGhlIGRhdGEgd2hlbiB0aGUgZW50aXJlIGFuc3dlciBoYXMgYmVlbiByZWNlaXZlZC5cbiAgICAgKi9cbiAgICBzdHJlYW0/OiBib29sZWFuO1xuICB9ICYgT21pdDxQcm9taXNlT3B0aW9uczxGdW5jdGlvblJldHVybmluZ1Byb21pc2U+LCBcImFib3J0YWJsZVwiPiA9IHt9LFxuKSB7XG4gIGNvbnN0IHsgY3JlYXRpdml0eSwgc3RyZWFtLCBtb2RlbCwgLi4udXNlUHJvbWlzZU9wdGlvbnMgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBhYm9ydGFibGUgPSB1c2VSZWY8QWJvcnRDb250cm9sbGVyPihudWxsKTtcbiAgY29uc3QgeyBpc0xvYWRpbmcsIGVycm9yLCByZXZhbGlkYXRlIH0gPSB1c2VQcm9taXNlKFxuICAgIGFzeW5jIChwcm9tcHQ6IHN0cmluZywgY3JlYXRpdml0eT86IEFJLkNyZWF0aXZpdHksIHNob3VsZFN0cmVhbT86IGJvb2xlYW4pID0+IHtcbiAgICAgIHNldERhdGEoXCJcIik7XG4gICAgICBjb25zdCBzdHJlYW0gPSBBSS5hc2socHJvbXB0LCB7IGNyZWF0aXZpdHksIG1vZGVsLCBzaWduYWw6IGFib3J0YWJsZS5jdXJyZW50Py5zaWduYWwgfSk7XG4gICAgICBpZiAoc2hvdWxkU3RyZWFtID09PSBmYWxzZSkge1xuICAgICAgICBzZXREYXRhKGF3YWl0IHN0cmVhbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHJlYW0ub24oXCJkYXRhXCIsIChkYXRhKSA9PiB7XG4gICAgICAgICAgc2V0RGF0YSgoeCkgPT4geCArIGRhdGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgc3RyZWFtO1xuICAgICAgfVxuICAgIH0sXG4gICAgW3Byb21wdCwgY3JlYXRpdml0eSwgc3RyZWFtXSxcbiAgICB7IC4uLnVzZVByb21pc2VPcHRpb25zLCBhYm9ydGFibGUgfSxcbiAgKTtcblxuICByZXR1cm4geyBpc0xvYWRpbmcsIGRhdGEsIGVycm9yLCByZXZhbGlkYXRlIH07XG59XG4iLCAiaW1wb3J0IHsgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZUxhdGVzdCB9IGZyb20gXCIuL3VzZUxhdGVzdFwiO1xuaW1wb3J0IHsgdXNlQ2FjaGVkU3RhdGUgfSBmcm9tIFwiLi91c2VDYWNoZWRTdGF0ZVwiO1xuXG4vLyBUaGUgYWxnb3JpdGhtIGJlbG93IGlzIGluc3BpcmVkIGJ5IHRoZSBvbmUgdXNlZCBieSBGaXJlZm94OlxuLy8gaHR0cHM6Ly93aWtpLm1vemlsbGEub3JnL1VzZXI6SmVzc2UvTmV3RnJlY2VuY3lcblxudHlwZSBGcmVjZW5jeSA9IHtcbiAgbGFzdFZpc2l0ZWQ6IG51bWJlcjtcbiAgZnJlY2VuY3k6IG51bWJlcjtcbn07XG5cbmNvbnN0IEhBTEZfTElGRV9EQVlTID0gMTA7XG5cbmNvbnN0IE1TX1BFUl9EQVkgPSAyNCAqIDYwICogNjAgKiAxMDAwO1xuXG5jb25zdCBWSVNJVF9UWVBFX1BPSU5UUyA9IHtcbiAgRGVmYXVsdDogMTAwLFxuICBFbWJlZDogMCxcbiAgQm9va21hcms6IDE0MCxcbn07XG5cbmZ1bmN0aW9uIGdldE5ld0ZyZWNlbmN5KGl0ZW0/OiBGcmVjZW5jeSk6IEZyZWNlbmN5IHtcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgY29uc3QgbGFzdFZpc2l0ZWQgPSBpdGVtID8gaXRlbS5sYXN0VmlzaXRlZCA6IDA7XG4gIGNvbnN0IGZyZWNlbmN5ID0gaXRlbSA/IGl0ZW0uZnJlY2VuY3kgOiAwO1xuXG4gIGNvbnN0IHZpc2l0QWdlSW5EYXlzID0gKG5vdyAtIGxhc3RWaXNpdGVkKSAvIE1TX1BFUl9EQVk7XG4gIGNvbnN0IERFQ0FZX1JBVEVfQ09OU1RBTlQgPSBNYXRoLmxvZygyKSAvIChIQUxGX0xJRkVfREFZUyAqIE1TX1BFUl9EQVkpO1xuICBjb25zdCBjdXJyZW50VmlzaXRWYWx1ZSA9IFZJU0lUX1RZUEVfUE9JTlRTLkRlZmF1bHQgKiBNYXRoLmV4cCgtREVDQVlfUkFURV9DT05TVEFOVCAqIHZpc2l0QWdlSW5EYXlzKTtcbiAgY29uc3QgdG90YWxWaXNpdFZhbHVlID0gZnJlY2VuY3kgKyBjdXJyZW50VmlzaXRWYWx1ZTtcblxuICByZXR1cm4ge1xuICAgIGxhc3RWaXNpdGVkOiBub3csXG4gICAgZnJlY2VuY3k6IHRvdGFsVmlzaXRWYWx1ZSxcbiAgfTtcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbmNvbnN0IGRlZmF1bHRLZXkgPSAoaXRlbTogYW55KTogc3RyaW5nID0+IHtcbiAgaWYgKFxuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIiAmJlxuICAgICh0eXBlb2YgaXRlbSAhPT0gXCJvYmplY3RcIiB8fCAhaXRlbSB8fCAhKFwiaWRcIiBpbiBpdGVtKSB8fCB0eXBlb2YgaXRlbS5pZCAhPSBcInN0cmluZ1wiKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJTcGVjaWZ5IGEga2V5IGZ1bmN0aW9uIG9yIG1ha2Ugc3VyZSB5b3VyIGl0ZW1zIGhhdmUgYW4gJ2lkJyBwcm9wZXJ0eVwiKTtcbiAgfVxuICByZXR1cm4gaXRlbS5pZDtcbn07XG5cbi8qKlxuICogU29ydCBhbiBhcnJheSBieSBpdHMgZnJlY2VuY3kgYW5kIHByb3ZpZGUgbWV0aG9kcyB0byB1cGRhdGUgdGhlIGZyZWNlbmN5IG9mIGl0cyBpdGVtcy5cbiAqIEZyZWNlbmN5IGlzIGEgbWVhc3VyZSB0aGF0IGNvbWJpbmVzIGZyZXF1ZW5jeSBhbmQgcmVjZW5jeS4gVGhlIG1vcmUgb2Z0ZW4gYW4gaXRlbSBpcyB2aXNpdGVkL3VzZWQsIGFuZCB0aGUgbW9yZSByZWNlbnRseSBhbiBpdGVtIGlzIHZpc2l0ZWQvdXNlZCwgdGhlIGhpZ2hlciBpdCB3aWxsIHJhbmsuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgTGlzdCwgQWN0aW9uUGFuZWwsIEFjdGlvbiwgSWNvbiB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHVzZUZldGNoLCB1c2VGcmVjZW5jeVNvcnRpbmcgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21tYW5kKCkge1xuICogICBjb25zdCB7IGlzTG9hZGluZywgZGF0YSB9ID0gdXNlRmV0Y2goXCJodHRwczovL2FwaS5leGFtcGxlXCIpO1xuICogICBjb25zdCB7IGRhdGE6IHNvcnRlZERhdGEsIHZpc2l0SXRlbSwgcmVzZXRSYW5raW5nIH0gPSB1c2VGcmVjZW5jeVNvcnRpbmcoZGF0YSk7XG4gKlxuICogICByZXR1cm4gKFxuICogICAgIDxMaXN0IGlzTG9hZGluZz17aXNMb2FkaW5nfT5cbiAqICAgICAgIHtzb3J0ZWREYXRhLm1hcCgoaXRlbSkgPT4gKFxuICogICAgICAgICA8TGlzdC5JdGVtXG4gKiAgICAgICAgICAga2V5PXtpdGVtLmlkfVxuICogICAgICAgICAgIHRpdGxlPXtpdGVtLnRpdGxlfVxuICogICAgICAgICAgIGFjdGlvbnM9e1xuICogICAgICAgICAgICAgPEFjdGlvblBhbmVsPlxuICogICAgICAgICAgICAgICA8QWN0aW9uLk9wZW5JbkJyb3dzZXIgdXJsPXtpdGVtLnVybH0gb25PcGVuPXsoKSA9PiB2aXNpdEl0ZW0oaXRlbSl9IC8+XG4gKiAgICAgICAgICAgICAgIDxBY3Rpb24uQ29weVRvQ2xpcGJvYXJkIHRpdGxlPVwiQ29weSBMaW5rXCIgY29udGVudD17aXRlbS51cmx9IG9uQ29weT17KCkgPT4gdmlzaXRJdGVtKGl0ZW0pfSAvPlxuICogICAgICAgICAgICAgICA8QWN0aW9uIHRpdGxlPVwiUmVzZXQgUmFua2luZ1wiIGljb249e0ljb24uQXJyb3dDb3VudGVyQ2xvY2t3aXNlfSBvbkFjdGlvbj17KCkgPT4gcmVzZXRSYW5raW5nKGl0ZW0pfSAvPlxuICogICAgICAgICAgICAgPC9BY3Rpb25QYW5lbD5cbiAqICAgICAgICAgICB9XG4gKiAgICAgICAgIC8+XG4gKiAgICAgICApKX1cbiAqICAgICA8L0xpc3Q+XG4gKiAgICk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VGcmVjZW5jeVNvcnRpbmc8VCBleHRlbmRzIHsgaWQ6IHN0cmluZyB9PihcbiAgZGF0YT86IFRbXSxcbiAgb3B0aW9ucz86IHsgbmFtZXNwYWNlPzogc3RyaW5nOyBrZXk/OiAoaXRlbTogVCkgPT4gc3RyaW5nOyBzb3J0VW52aXNpdGVkPzogKGE6IFQsIGI6IFQpID0+IG51bWJlciB9LFxuKToge1xuICBkYXRhOiBUW107XG4gIHZpc2l0SXRlbTogKGl0ZW06IFQpID0+IFByb21pc2U8dm9pZD47XG4gIHJlc2V0UmFua2luZzogKGl0ZW06IFQpID0+IFByb21pc2U8dm9pZD47XG59O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUZyZWNlbmN5U29ydGluZzxUPihcbiAgZGF0YTogVFtdIHwgdW5kZWZpbmVkLFxuICBvcHRpb25zOiB7IG5hbWVzcGFjZT86IHN0cmluZzsga2V5OiAoaXRlbTogVCkgPT4gc3RyaW5nOyBzb3J0VW52aXNpdGVkPzogKGE6IFQsIGI6IFQpID0+IG51bWJlciB9LFxuKToge1xuICBkYXRhOiBUW107XG4gIHZpc2l0SXRlbTogKGl0ZW06IFQpID0+IFByb21pc2U8dm9pZD47XG4gIHJlc2V0UmFua2luZzogKGl0ZW06IFQpID0+IFByb21pc2U8dm9pZD47XG59O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUZyZWNlbmN5U29ydGluZzxUPihcbiAgZGF0YT86IFRbXSxcbiAgb3B0aW9ucz86IHsgbmFtZXNwYWNlPzogc3RyaW5nOyBrZXk/OiAoaXRlbTogVCkgPT4gc3RyaW5nOyBzb3J0VW52aXNpdGVkPzogKGE6IFQsIGI6IFQpID0+IG51bWJlciB9LFxuKToge1xuICBkYXRhOiBUW107XG4gIHZpc2l0SXRlbTogKGl0ZW06IFQpID0+IFByb21pc2U8dm9pZD47XG4gIHJlc2V0UmFua2luZzogKGl0ZW06IFQpID0+IFByb21pc2U8dm9pZD47XG59IHtcbiAgY29uc3Qga2V5UmVmID0gdXNlTGF0ZXN0KG9wdGlvbnM/LmtleSB8fCBkZWZhdWx0S2V5KTtcbiAgY29uc3Qgc29ydFVudmlzaXRlZFJlZiA9IHVzZUxhdGVzdChvcHRpb25zPy5zb3J0VW52aXNpdGVkKTtcblxuICBjb25zdCBbc3RvcmVkRnJlY2VuY2llcywgc2V0U3RvcmVkRnJlY2VuY2llc10gPSB1c2VDYWNoZWRTdGF0ZTxSZWNvcmQ8c3RyaW5nLCBGcmVjZW5jeSB8IHVuZGVmaW5lZD4+KFxuICAgIGByYXljYXN0X2ZyZWNlbmN5XyR7b3B0aW9ucz8ubmFtZXNwYWNlfWAsXG4gICAge30sXG4gICk7XG5cbiAgY29uc3QgdmlzaXRJdGVtID0gdXNlQ2FsbGJhY2soXG4gICAgYXN5bmMgZnVuY3Rpb24gdXBkYXRlRnJlY2VuY3koaXRlbTogVCkge1xuICAgICAgY29uc3QgaXRlbUtleSA9IGtleVJlZi5jdXJyZW50KGl0ZW0pO1xuXG4gICAgICBzZXRTdG9yZWRGcmVjZW5jaWVzKChzdG9yZWRGcmVjZW5jaWVzKSA9PiB7XG4gICAgICAgIGNvbnN0IGZyZWNlbmN5ID0gc3RvcmVkRnJlY2VuY2llc1tpdGVtS2V5XTtcbiAgICAgICAgY29uc3QgbmV3RnJlY2VuY3kgPSBnZXROZXdGcmVjZW5jeShmcmVjZW5jeSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5zdG9yZWRGcmVjZW5jaWVzLFxuICAgICAgICAgIFtpdGVtS2V5XTogbmV3RnJlY2VuY3ksXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9LFxuICAgIFtrZXlSZWYsIHNldFN0b3JlZEZyZWNlbmNpZXNdLFxuICApO1xuXG4gIGNvbnN0IHJlc2V0UmFua2luZyA9IHVzZUNhbGxiYWNrKFxuICAgIGFzeW5jIGZ1bmN0aW9uIHJlbW92ZUZyZWNlbmN5KGl0ZW06IFQpIHtcbiAgICAgIGNvbnN0IGl0ZW1LZXkgPSBrZXlSZWYuY3VycmVudChpdGVtKTtcblxuICAgICAgc2V0U3RvcmVkRnJlY2VuY2llcygoc3RvcmVkRnJlY2VuY2llcykgPT4ge1xuICAgICAgICBjb25zdCBuZXdGcmVuY2VuY2llcyA9IHsgLi4uc3RvcmVkRnJlY2VuY2llcyB9O1xuICAgICAgICBkZWxldGUgbmV3RnJlbmNlbmNpZXNbaXRlbUtleV07XG5cbiAgICAgICAgcmV0dXJuIG5ld0ZyZW5jZW5jaWVzO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBba2V5UmVmLCBzZXRTdG9yZWRGcmVjZW5jaWVzXSxcbiAgKTtcblxuICBjb25zdCBzb3J0ZWREYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGEuc29ydCgoYSwgYikgPT4ge1xuICAgICAgY29uc3QgZnJlY2VuY3lBID0gc3RvcmVkRnJlY2VuY2llc1trZXlSZWYuY3VycmVudChhKV07XG4gICAgICBjb25zdCBmcmVjZW5jeUIgPSBzdG9yZWRGcmVjZW5jaWVzW2tleVJlZi5jdXJyZW50KGIpXTtcblxuICAgICAgLy8gSWYgYSBoYXMgYSBmcmVjZW5jeSwgYnV0IGIgZG9lc24ndCwgYSBzaG91bGQgY29tZSBmaXJzdFxuICAgICAgaWYgKGZyZWNlbmN5QSAmJiAhZnJlY2VuY3lCKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgYiBoYXMgYSBmcmVjZW5jeSwgYnV0IGEgZG9lc24ndCwgYiBzaG91bGQgY29tZSBmaXJzdFxuICAgICAgaWYgKCFmcmVjZW5jeUEgJiYgZnJlY2VuY3lCKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBib3RoIGZyZWNlbmNpZXMgYXJlIGRlZmluZWQscHV0IHRoZSBvbmUgd2l0aCB0aGUgaGlnaGVyIGZyZWNlbmN5IGZpcnN0XG4gICAgICBpZiAoZnJlY2VuY3lBICYmIGZyZWNlbmN5Qikge1xuICAgICAgICByZXR1cm4gZnJlY2VuY3lCLmZyZWNlbmN5IC0gZnJlY2VuY3lBLmZyZWNlbmN5O1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBib3RoIGZyZWNlbmNpZXMgYXJlIHVuZGVmaW5lZCwga2VlcCB0aGUgb3JpZ2luYWwgb3JkZXJcbiAgICAgIHJldHVybiBzb3J0VW52aXNpdGVkUmVmLmN1cnJlbnQgPyBzb3J0VW52aXNpdGVkUmVmLmN1cnJlbnQoYSwgYikgOiAwO1xuICAgIH0pO1xuICB9LCBbc3RvcmVkRnJlY2VuY2llcywgZGF0YSwga2V5UmVmLCBzb3J0VW52aXNpdGVkUmVmXSk7XG5cbiAgcmV0dXJuIHsgZGF0YTogc29ydGVkRGF0YSwgdmlzaXRJdGVtLCByZXNldFJhbmtpbmcgfTtcbn1cbiIsICJpbXBvcnQgeyBMb2NhbFN0b3JhZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBzaG93RmFpbHVyZVRvYXN0IH0gZnJvbSBcIi4vc2hvd0ZhaWx1cmVUb2FzdFwiO1xuaW1wb3J0IHsgcmVwbGFjZXIsIHJldml2ZXIgfSBmcm9tIFwiLi9oZWxwZXJzXCI7XG5pbXBvcnQgeyB1c2VQcm9taXNlIH0gZnJvbSBcIi4vdXNlUHJvbWlzZVwiO1xuXG4vKipcbiAqIEEgaG9vayB0byBtYW5hZ2UgYSB2YWx1ZSBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAcmVtYXJrIFRoZSB2YWx1ZSBpcyBzdG9yZWQgYXMgYSBKU09OIHN0cmluZyBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAcGFyYW0ga2V5IC0gVGhlIGtleSB0byB1c2UgZm9yIHRoZSB2YWx1ZSBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cbiAqIEBwYXJhbSBpbml0aWFsVmFsdWUgLSBUaGUgaW5pdGlhbCB2YWx1ZSB0byB1c2UgaWYgdGhlIGtleSBkb2Vzbid0IGV4aXN0IGluIHRoZSBsb2NhbCBzdG9yYWdlLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICogLSBgdmFsdWVgOiBUaGUgdmFsdWUgZnJvbSB0aGUgbG9jYWwgc3RvcmFnZSBvciB0aGUgaW5pdGlhbCB2YWx1ZSBpZiB0aGUga2V5IGRvZXNuJ3QgZXhpc3QuXG4gKiAtIGBzZXRWYWx1ZWA6IEEgZnVuY3Rpb24gdG8gdXBkYXRlIHRoZSB2YWx1ZSBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cbiAqIC0gYHJlbW92ZVZhbHVlYDogQSBmdW5jdGlvbiB0byByZW1vdmUgdGhlIHZhbHVlIGZyb20gdGhlIGxvY2FsIHN0b3JhZ2UuXG4gKiAtIGBpc0xvYWRpbmdgOiBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGUgdmFsdWUgaXMgbG9hZGluZy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiBjb25zdCB7IHZhbHVlLCBzZXRWYWx1ZSB9ID0gdXNlTG9jYWxTdG9yYWdlPHN0cmluZz4oXCJteS1rZXlcIik7XG4gKiBjb25zdCB7IHZhbHVlLCBzZXRWYWx1ZSB9ID0gdXNlTG9jYWxTdG9yYWdlPHN0cmluZz4oXCJteS1rZXlcIiwgXCJkZWZhdWx0IHZhbHVlXCIpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VMb2NhbFN0b3JhZ2U8VD4oa2V5OiBzdHJpbmcsIGluaXRpYWxWYWx1ZT86IFQpIHtcbiAgY29uc3Qge1xuICAgIGRhdGE6IHZhbHVlLFxuICAgIGlzTG9hZGluZyxcbiAgICBtdXRhdGUsXG4gIH0gPSB1c2VQcm9taXNlKFxuICAgIGFzeW5jIChzdG9yYWdlS2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBhd2FpdCBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KHN0b3JhZ2VLZXkpO1xuXG4gICAgICByZXR1cm4gdHlwZW9mIGl0ZW0gIT09IFwidW5kZWZpbmVkXCIgPyAoSlNPTi5wYXJzZShpdGVtLCByZXZpdmVyKSBhcyBUKSA6IGluaXRpYWxWYWx1ZTtcbiAgICB9LFxuICAgIFtrZXldLFxuICApO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIHNldFZhbHVlKHZhbHVlOiBUKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IG11dGF0ZShMb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlLCByZXBsYWNlcikpLCB7XG4gICAgICAgIG9wdGltaXN0aWNVcGRhdGUodmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYXdhaXQgc2hvd0ZhaWx1cmVUb2FzdChlcnJvciwgeyB0aXRsZTogXCJGYWlsZWQgdG8gc2V0IHZhbHVlIGluIGxvY2FsIHN0b3JhZ2VcIiB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiByZW1vdmVWYWx1ZSgpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgbXV0YXRlKExvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSksIHtcbiAgICAgICAgb3B0aW1pc3RpY1VwZGF0ZSgpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF3YWl0IHNob3dGYWlsdXJlVG9hc3QoZXJyb3IsIHsgdGl0bGU6IFwiRmFpbGVkIHRvIHJlbW92ZSB2YWx1ZSBmcm9tIGxvY2FsIHN0b3JhZ2VcIiB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyB2YWx1ZSwgc2V0VmFsdWUsIHJlbW92ZVZhbHVlLCBpc0xvYWRpbmcgfTtcbn1cbiIsICJleHBvcnQgeyBnZXRBdmF0YXJJY29uIH0gZnJvbSBcIi4vYXZhdGFyXCI7XG5leHBvcnQgeyBnZXRGYXZpY29uIH0gZnJvbSBcIi4vZmF2aWNvblwiO1xuZXhwb3J0IHsgZ2V0UHJvZ3Jlc3NJY29uIH0gZnJvbSBcIi4vcHJvZ3Jlc3NcIjtcbiIsICJpbXBvcnQgdHlwZSB7IEltYWdlIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgc2xpZ2h0bHlMaWdodGVyQ29sb3IsIHNsaWdodGx5RGFya2VyQ29sb3IgfSBmcm9tIFwiLi9jb2xvclwiO1xuXG5mdW5jdGlvbiBnZXRXaG9sZUNoYXJBbmRJKHN0cjogc3RyaW5nLCBpOiBudW1iZXIpOiBbc3RyaW5nLCBudW1iZXJdIHtcbiAgY29uc3QgY29kZSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuXG4gIGlmIChOdW1iZXIuaXNOYU4oY29kZSkpIHtcbiAgICByZXR1cm4gW1wiXCIsIGldO1xuICB9XG4gIGlmIChjb2RlIDwgMHhkODAwIHx8IGNvZGUgPiAweGRmZmYpIHtcbiAgICByZXR1cm4gW3N0ci5jaGFyQXQoaSksIGldOyAvLyBOb3JtYWwgY2hhcmFjdGVyLCBrZWVwaW5nICdpJyB0aGUgc2FtZVxuICB9XG5cbiAgLy8gSGlnaCBzdXJyb2dhdGUgKGNvdWxkIGNoYW5nZSBsYXN0IGhleCB0byAweERCN0YgdG8gdHJlYXQgaGlnaCBwcml2YXRlXG4gIC8vIHN1cnJvZ2F0ZXMgYXMgc2luZ2xlIGNoYXJhY3RlcnMpXG4gIGlmICgweGQ4MDAgPD0gY29kZSAmJiBjb2RlIDw9IDB4ZGJmZikge1xuICAgIGlmIChzdHIubGVuZ3RoIDw9IGkgKyAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJIaWdoIHN1cnJvZ2F0ZSB3aXRob3V0IGZvbGxvd2luZyBsb3cgc3Vycm9nYXRlXCIpO1xuICAgIH1cbiAgICBjb25zdCBuZXh0ID0gc3RyLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgIGlmICgweGRjMDAgPiBuZXh0IHx8IG5leHQgPiAweGRmZmYpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkhpZ2ggc3Vycm9nYXRlIHdpdGhvdXQgZm9sbG93aW5nIGxvdyBzdXJyb2dhdGVcIik7XG4gICAgfVxuICAgIHJldHVybiBbc3RyLmNoYXJBdChpKSArIHN0ci5jaGFyQXQoaSArIDEpLCBpICsgMV07XG4gIH1cblxuICAvLyBMb3cgc3Vycm9nYXRlICgweERDMDAgPD0gY29kZSAmJiBjb2RlIDw9IDB4REZGRilcbiAgaWYgKGkgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb3cgc3Vycm9nYXRlIHdpdGhvdXQgcHJlY2VkaW5nIGhpZ2ggc3Vycm9nYXRlXCIpO1xuICB9XG5cbiAgY29uc3QgcHJldiA9IHN0ci5jaGFyQ29kZUF0KGkgLSAxKTtcblxuICAvLyAoY291bGQgY2hhbmdlIGxhc3QgaGV4IHRvIDB4REI3RiB0byB0cmVhdCBoaWdoIHByaXZhdGUgc3Vycm9nYXRlc1xuICAvLyBhcyBzaW5nbGUgY2hhcmFjdGVycylcbiAgaWYgKDB4ZDgwMCA+IHByZXYgfHwgcHJldiA+IDB4ZGJmZikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkxvdyBzdXJyb2dhdGUgd2l0aG91dCBwcmVjZWRpbmcgaGlnaCBzdXJyb2dhdGVcIik7XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIG5leHQgY2hhcmFjdGVyIGluc3RlYWQgKGFuZCBpbmNyZW1lbnQpXG4gIHJldHVybiBbc3RyLmNoYXJBdChpICsgMSksIGkgKyAxXTtcbn1cblxuY29uc3QgYXZhdGFyQ29sb3JTZXQgPSBbXG4gIFwiI0RDODI5QVwiLCAvLyBQaW5rXG4gIFwiI0Q2NDg1NFwiLCAvLyBSZWRcbiAgXCIjRDQ3NjAwXCIsIC8vIFllbGxvd09yYW5nZVxuICBcIiNEMzZDRERcIiwgLy8gTWFnZW50YVxuICBcIiM1MkE5RTRcIiwgLy8gQXF1YVxuICBcIiM3ODcxRThcIiwgLy8gSW5kaWdvXG4gIFwiIzcwOTIwRlwiLCAvLyBZZWxsb3dHcmVlblxuICBcIiM0M0I5M0FcIiwgLy8gR3JlZW5cbiAgXCIjRUI2QjNFXCIsIC8vIE9yYW5nZVxuICBcIiMyNkI3OTVcIiwgLy8gQmx1ZUdyZWVuXG4gIFwiI0Q4NUE5QlwiLCAvLyBIb3RQaW5rXG4gIFwiI0EwNjdEQ1wiLCAvLyBQdXJwbGVcbiAgXCIjQkQ5NTAwXCIsIC8vIFllbGxvd1xuICBcIiM1Mzg1RDlcIiwgLy8gQmx1ZVxuXTtcblxuLyoqXG4gKiBJY29uIHRvIHJlcHJlc2VudCBhbiBhdmF0YXIgd2hlbiB5b3UgZG9uJ3QgaGF2ZSBvbmUuIFRoZSBnZW5lcmF0ZWQgYXZhdGFyXG4gKiB3aWxsIGJlIGdlbmVyYXRlZCBmcm9tIHRoZSBpbml0aWFscyBvZiB0aGUgbmFtZSBhbmQgaGF2ZSBhIGNvbG9yZnVsIGJ1dCBjb25zaXN0ZW50IGJhY2tncm91bmQuXG4gKlxuICogQHJldHVybnMgYW4gSW1hZ2UgdGhhdCBjYW4gYmUgdXNlZCB3aGVyZSBSYXljYXN0IGV4cGVjdHMgdGhlbS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiA8TGlzdC5JdGVtIGljb249e2dldEF2YXRhckljb24oJ01hdGhpZXUgRHV0b3VyJyl9IHRpdGxlPVwiUHJvamVjdFwiIC8+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEF2YXRhckljb24oXG4gIG5hbWU6IHN0cmluZyxcbiAgb3B0aW9ucz86IHtcbiAgICAvKipcbiAgICAgKiBDdXN0b20gYmFja2dyb3VuZCBjb2xvclxuICAgICAqL1xuICAgIGJhY2tncm91bmQ/OiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogV2hldGhlciB0byB1c2UgYSBncmFkaWVudCBmb3IgdGhlIGJhY2tncm91bmQgb3Igbm90LlxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBncmFkaWVudD86IGJvb2xlYW47XG4gIH0sXG4pOiBJbWFnZS5Bc3NldCB7XG4gIGNvbnN0IHdvcmRzID0gbmFtZS50cmltKCkuc3BsaXQoXCIgXCIpO1xuICBsZXQgaW5pdGlhbHM6IHN0cmluZztcbiAgaWYgKHdvcmRzLmxlbmd0aCA9PSAxICYmIGdldFdob2xlQ2hhckFuZEkod29yZHNbMF0sIDApWzBdKSB7XG4gICAgaW5pdGlhbHMgPSBnZXRXaG9sZUNoYXJBbmRJKHdvcmRzWzBdLCAwKVswXTtcbiAgfSBlbHNlIGlmICh3b3Jkcy5sZW5ndGggPiAxKSB7XG4gICAgY29uc3QgZmlyc3RXb3JkRmlyc3RMZXR0ZXIgPSBnZXRXaG9sZUNoYXJBbmRJKHdvcmRzWzBdLCAwKVswXSB8fCBcIlwiO1xuICAgIGNvbnN0IGxhc3RXb3JkRmlyc3RMZXR0ZXIgPSBnZXRXaG9sZUNoYXJBbmRJKHdvcmRzW3dvcmRzLmxlbmd0aCAtIDFdLCAwKVswXSA/PyBcIlwiO1xuICAgIGluaXRpYWxzID0gZmlyc3RXb3JkRmlyc3RMZXR0ZXIgKyBsYXN0V29yZEZpcnN0TGV0dGVyO1xuICB9IGVsc2Uge1xuICAgIGluaXRpYWxzID0gXCJcIjtcbiAgfVxuXG4gIGxldCBiYWNrZ3JvdW5kQ29sb3I6IHN0cmluZztcblxuICBpZiAob3B0aW9ucz8uYmFja2dyb3VuZCkge1xuICAgIGJhY2tncm91bmRDb2xvciA9IG9wdGlvbnM/LmJhY2tncm91bmQ7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGluaXRpYWxzQ2hhckluZGV4ID0gMDtcbiAgICBsZXQgW2NoYXIsIGldID0gZ2V0V2hvbGVDaGFyQW5kSShpbml0aWFscywgMCk7XG4gICAgd2hpbGUgKGNoYXIpIHtcbiAgICAgIGluaXRpYWxzQ2hhckluZGV4ICs9IGNoYXIuY2hhckNvZGVBdCgwKTtcbiAgICAgIFtjaGFyLCBpXSA9IGdldFdob2xlQ2hhckFuZEkoaW5pdGlhbHMsIGkgKyAxKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb2xvckluZGV4ID0gaW5pdGlhbHNDaGFySW5kZXggJSBhdmF0YXJDb2xvclNldC5sZW5ndGg7XG4gICAgYmFja2dyb3VuZENvbG9yID0gYXZhdGFyQ29sb3JTZXRbY29sb3JJbmRleF07XG4gIH1cblxuICBjb25zdCBwYWRkaW5nID0gMDtcbiAgY29uc3QgcmFkaXVzID0gNTAgLSBwYWRkaW5nO1xuXG4gIGNvbnN0IHN2ZyA9IGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjEwMHB4XCIgaGVpZ2h0PVwiMTAwcHhcIj5cbiAgJHtcbiAgICBvcHRpb25zPy5ncmFkaWVudCAhPT0gZmFsc2VcbiAgICAgID8gYDxkZWZzPlxuICAgICAgPGxpbmVhckdyYWRpZW50IGlkPVwiR3JhZGllbnRcIiB4MT1cIjAuMjVcIiB4Mj1cIjAuNzVcIiB5MT1cIjBcIiB5Mj1cIjFcIj5cbiAgICAgICAgPHN0b3Agb2Zmc2V0PVwiMCVcIiBzdG9wLWNvbG9yPVwiJHtzbGlnaHRseUxpZ2h0ZXJDb2xvcihiYWNrZ3JvdW5kQ29sb3IpfVwiLz5cbiAgICAgICAgPHN0b3Agb2Zmc2V0PVwiNTAlXCIgc3RvcC1jb2xvcj1cIiR7YmFja2dyb3VuZENvbG9yfVwiLz5cbiAgICAgICAgPHN0b3Agb2Zmc2V0PVwiMTAwJVwiIHN0b3AtY29sb3I9XCIke3NsaWdodGx5RGFya2VyQ29sb3IoYmFja2dyb3VuZENvbG9yKX1cIi8+XG4gICAgICA8L2xpbmVhckdyYWRpZW50PlxuICA8L2RlZnM+YFxuICAgICAgOiBcIlwiXG4gIH1cbiAgICAgIDxjaXJjbGUgY3g9XCI1MFwiIGN5PVwiNTBcIiByPVwiJHtyYWRpdXN9XCIgZmlsbD1cIiR7XG4gICAgICAgIG9wdGlvbnM/LmdyYWRpZW50ICE9PSBmYWxzZSA/IFwidXJsKCNHcmFkaWVudClcIiA6IGJhY2tncm91bmRDb2xvclxuICAgICAgfVwiIC8+XG4gICAgICAke1xuICAgICAgICBpbml0aWFsc1xuICAgICAgICAgID8gYDx0ZXh0IHg9XCI1MFwiIHk9XCI4MFwiIGZvbnQtc2l6ZT1cIiR7XG4gICAgICAgICAgICAgIHJhZGl1cyAtIDFcbiAgICAgICAgICAgIH1cIiBmb250LWZhbWlseT1cIkludGVyLCBzYW5zLXNlcmlmXCIgdGV4dC1hbmNob3I9XCJtaWRkbGVcIiBmaWxsPVwid2hpdGVcIj4ke2luaXRpYWxzLnRvVXBwZXJDYXNlKCl9PC90ZXh0PmBcbiAgICAgICAgICA6IFwiXCJcbiAgICAgIH1cbiAgICA8L3N2Zz5cbiAgYC5yZXBsYWNlQWxsKFwiXFxuXCIsIFwiXCIpO1xuICByZXR1cm4gYGRhdGE6aW1hZ2Uvc3ZnK3htbCwke2VuY29kZVVSSUNvbXBvbmVudChzdmcpfWA7XG59XG4iLCAiZnVuY3Rpb24gaGV4VG9SR0IoaGV4OiBzdHJpbmcpIHtcbiAgbGV0IHIgPSAwO1xuICBsZXQgZyA9IDA7XG4gIGxldCBiID0gMDtcblxuICAvLyAzIGRpZ2l0c1xuICBpZiAoaGV4Lmxlbmd0aCA9PT0gNCkge1xuICAgIHIgPSBwYXJzZUludChgJHtoZXhbMV19JHtoZXhbMV19YCwgMTYpO1xuICAgIGcgPSBwYXJzZUludChgJHtoZXhbMl19JHtoZXhbMl19YCwgMTYpO1xuICAgIGIgPSBwYXJzZUludChgJHtoZXhbM119JHtoZXhbM119YCwgMTYpO1xuXG4gICAgLy8gNiBkaWdpdHNcbiAgfSBlbHNlIGlmIChoZXgubGVuZ3RoID09PSA3KSB7XG4gICAgciA9IHBhcnNlSW50KGAke2hleFsxXX0ke2hleFsyXX1gLCAxNik7XG4gICAgZyA9IHBhcnNlSW50KGAke2hleFszXX0ke2hleFs0XX1gLCAxNik7XG4gICAgYiA9IHBhcnNlSW50KGAke2hleFs1XX0ke2hleFs2XX1gLCAxNik7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBNYWxmb3JtZWQgaGV4IGNvbG9yOiAke2hleH1gKTtcbiAgfVxuXG4gIHJldHVybiB7IHIsIGcsIGIgfTtcbn1cblxuZnVuY3Rpb24gcmdiVG9IZXgoeyByLCBnLCBiIH06IHsgcjogbnVtYmVyOyBnOiBudW1iZXI7IGI6IG51bWJlciB9KSB7XG4gIGxldCByU3RyaW5nID0gci50b1N0cmluZygxNik7XG4gIGxldCBnU3RyaW5nID0gZy50b1N0cmluZygxNik7XG4gIGxldCBiU3RyaW5nID0gYi50b1N0cmluZygxNik7XG5cbiAgaWYgKHJTdHJpbmcubGVuZ3RoID09PSAxKSB7XG4gICAgclN0cmluZyA9IGAwJHtyU3RyaW5nfWA7XG4gIH1cbiAgaWYgKGdTdHJpbmcubGVuZ3RoID09PSAxKSB7XG4gICAgZ1N0cmluZyA9IGAwJHtnU3RyaW5nfWA7XG4gIH1cbiAgaWYgKGJTdHJpbmcubGVuZ3RoID09PSAxKSB7XG4gICAgYlN0cmluZyA9IGAwJHtiU3RyaW5nfWA7XG4gIH1cblxuICByZXR1cm4gYCMke3JTdHJpbmd9JHtnU3RyaW5nfSR7YlN0cmluZ31gO1xufVxuXG5mdW5jdGlvbiByZ2JUb0hTTCh7IHIsIGcsIGIgfTogeyByOiBudW1iZXI7IGc6IG51bWJlcjsgYjogbnVtYmVyIH0pIHtcbiAgLy8gTWFrZSByLCBnLCBhbmQgYiBmcmFjdGlvbnMgb2YgMVxuICByIC89IDI1NTtcbiAgZyAvPSAyNTU7XG4gIGIgLz0gMjU1O1xuXG4gIC8vIEZpbmQgZ3JlYXRlc3QgYW5kIHNtYWxsZXN0IGNoYW5uZWwgdmFsdWVzXG4gIGNvbnN0IGNtaW4gPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgY29uc3QgY21heCA9IE1hdGgubWF4KHIsIGcsIGIpO1xuICBjb25zdCBkZWx0YSA9IGNtYXggLSBjbWluO1xuICBsZXQgaCA9IDA7XG4gIGxldCBzID0gMDtcbiAgbGV0IGwgPSAwO1xuXG4gIC8vIENhbGN1bGF0ZSBodWVcbiAgLy8gTm8gZGlmZmVyZW5jZVxuICBpZiAoZGVsdGEgPT09IDApIHtcbiAgICBoID0gMDtcbiAgfVxuICAvLyBSZWQgaXMgbWF4XG4gIGVsc2UgaWYgKGNtYXggPT09IHIpIHtcbiAgICBoID0gKChnIC0gYikgLyBkZWx0YSkgJSA2O1xuICB9XG4gIC8vIEdyZWVuIGlzIG1heFxuICBlbHNlIGlmIChjbWF4ID09PSBnKSB7XG4gICAgaCA9IChiIC0gcikgLyBkZWx0YSArIDI7XG4gIH1cbiAgLy8gQmx1ZSBpcyBtYXhcbiAgZWxzZSB7XG4gICAgaCA9IChyIC0gZykgLyBkZWx0YSArIDQ7XG4gIH1cblxuICBoID0gTWF0aC5yb3VuZChoICogNjApO1xuXG4gIC8vIE1ha2UgbmVnYXRpdmUgaHVlcyBwb3NpdGl2ZSBiZWhpbmQgMzYwwrBcbiAgaWYgKGggPCAwKSB7XG4gICAgaCArPSAzNjA7XG4gIH1cblxuICAvLyBDYWxjdWxhdGUgbGlnaHRuZXNzXG4gIGwgPSAoY21heCArIGNtaW4pIC8gMjtcblxuICAvLyBDYWxjdWxhdGUgc2F0dXJhdGlvblxuICBzID0gZGVsdGEgPT09IDAgPyAwIDogZGVsdGEgLyAoMSAtIE1hdGguYWJzKDIgKiBsIC0gMSkpO1xuXG4gIC8vIE11bHRpcGx5IGwgYW5kIHMgYnkgMTAwXG4gIHMgPSArKHMgKiAxMDApLnRvRml4ZWQoMSk7XG4gIGwgPSArKGwgKiAxMDApLnRvRml4ZWQoMSk7XG5cbiAgcmV0dXJuIHsgaCwgcywgbCB9O1xufVxuXG5mdW5jdGlvbiBoc2xUb1JHQih7IGgsIHMsIGwgfTogeyBoOiBudW1iZXI7IHM6IG51bWJlcjsgbDogbnVtYmVyIH0pIHtcbiAgLy8gTXVzdCBiZSBmcmFjdGlvbnMgb2YgMVxuICBzIC89IDEwMDtcbiAgbCAvPSAxMDA7XG5cbiAgY29uc3QgYyA9ICgxIC0gTWF0aC5hYnMoMiAqIGwgLSAxKSkgKiBzO1xuICBjb25zdCB4ID0gYyAqICgxIC0gTWF0aC5hYnMoKChoIC8gNjApICUgMikgLSAxKSk7XG4gIGNvbnN0IG0gPSBsIC0gYyAvIDI7XG4gIGxldCByID0gMDtcbiAgbGV0IGcgPSAwO1xuICBsZXQgYiA9IDA7XG5cbiAgaWYgKGggPj0gMCAmJiBoIDwgNjApIHtcbiAgICByID0gYztcbiAgICBnID0geDtcbiAgICBiID0gMDtcbiAgfSBlbHNlIGlmIChoID49IDYwICYmIGggPCAxMjApIHtcbiAgICByID0geDtcbiAgICBnID0gYztcbiAgICBiID0gMDtcbiAgfSBlbHNlIGlmIChoID49IDEyMCAmJiBoIDwgMTgwKSB7XG4gICAgciA9IDA7XG4gICAgZyA9IGM7XG4gICAgYiA9IHg7XG4gIH0gZWxzZSBpZiAoaCA+PSAxODAgJiYgaCA8IDI0MCkge1xuICAgIHIgPSAwO1xuICAgIGcgPSB4O1xuICAgIGIgPSBjO1xuICB9IGVsc2UgaWYgKGggPj0gMjQwICYmIGggPCAzMDApIHtcbiAgICByID0geDtcbiAgICBnID0gMDtcbiAgICBiID0gYztcbiAgfSBlbHNlIGlmIChoID49IDMwMCAmJiBoIDwgMzYwKSB7XG4gICAgciA9IGM7XG4gICAgZyA9IDA7XG4gICAgYiA9IHg7XG4gIH1cbiAgciA9IE1hdGgucm91bmQoKHIgKyBtKSAqIDI1NSk7XG4gIGcgPSBNYXRoLnJvdW5kKChnICsgbSkgKiAyNTUpO1xuICBiID0gTWF0aC5yb3VuZCgoYiArIG0pICogMjU1KTtcblxuICByZXR1cm4geyByLCBnLCBiIH07XG59XG5cbmZ1bmN0aW9uIGhleFRvSFNMKGhleDogc3RyaW5nKSB7XG4gIHJldHVybiByZ2JUb0hTTChoZXhUb1JHQihoZXgpKTtcbn1cblxuZnVuY3Rpb24gaHNsVG9IZXgoaHNsOiB7IGg6IG51bWJlcjsgczogbnVtYmVyOyBsOiBudW1iZXIgfSkge1xuICByZXR1cm4gcmdiVG9IZXgoaHNsVG9SR0IoaHNsKSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wKHZhbHVlOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xuICByZXR1cm4gbWluIDwgbWF4ID8gKHZhbHVlIDwgbWluID8gbWluIDogdmFsdWUgPiBtYXggPyBtYXggOiB2YWx1ZSkgOiB2YWx1ZSA8IG1heCA/IG1heCA6IHZhbHVlID4gbWluID8gbWluIDogdmFsdWU7XG59XG5cbmNvbnN0IG9mZnNldCA9IDEyO1xuXG5leHBvcnQgZnVuY3Rpb24gc2xpZ2h0bHlEYXJrZXJDb2xvcihoZXg6IHN0cmluZykge1xuICBjb25zdCBoc2wgPSBoZXhUb0hTTChoZXgpO1xuXG4gIHJldHVybiBoc2xUb0hleCh7XG4gICAgaDogaHNsLmgsXG4gICAgczogaHNsLnMsXG4gICAgbDogY2xhbXAoaHNsLmwgLSBvZmZzZXQsIDAsIDEwMCksXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2xpZ2h0bHlMaWdodGVyQ29sb3IoaGV4OiBzdHJpbmcpIHtcbiAgY29uc3QgaHNsID0gaGV4VG9IU0woaGV4KTtcblxuICByZXR1cm4gaHNsVG9IZXgoe1xuICAgIGg6IGhzbC5oLFxuICAgIHM6IGhzbC5zLFxuICAgIGw6IGNsYW1wKGhzbC5sICsgb2Zmc2V0LCAwLCAxMDApLFxuICB9KTtcbn1cbiIsICJpbXBvcnQgeyBJY29uLCBJbWFnZSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IFVSTCB9IGZyb20gXCJub2RlOnVybFwiO1xuXG4vKipcbiAqIEljb24gc2hvd2luZyB0aGUgZmF2aWNvbiBvZiBhIHdlYnNpdGUuXG4gKlxuICogQSBmYXZpY29uIChmYXZvcml0ZSBpY29uKSBpcyBhIHRpbnkgaWNvbiBpbmNsdWRlZCBhbG9uZyB3aXRoIGEgd2Vic2l0ZSwgd2hpY2ggaXMgZGlzcGxheWVkIGluIHBsYWNlcyBsaWtlIHRoZSBicm93c2VyJ3MgYWRkcmVzcyBiYXIsIHBhZ2UgdGFicywgYW5kIGJvb2ttYXJrcyBtZW51LlxuICpcbiAqIEBwYXJhbSB1cmwgVGhlIFVSTCBvZiB0aGUgd2Vic2l0ZSB0byByZXByZXNlbnQuXG4gKlxuICogQHJldHVybnMgYW4gSW1hZ2UgdGhhdCBjYW4gYmUgdXNlZCB3aGVyZSBSYXljYXN0IGV4cGVjdHMgdGhlbS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiA8TGlzdC5JdGVtIGljb249e2dldEZhdmljb24oXCJodHRwczovL3JheWNhc3QuY29tXCIpfSB0aXRsZT1cIlJheWNhc3QgV2Vic2l0ZVwiIC8+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZhdmljb24oXG4gIHVybDogc3RyaW5nIHwgVVJMLFxuICBvcHRpb25zPzoge1xuICAgIC8qKlxuICAgICAqIFNpemUgb2YgdGhlIEZhdmljb25cbiAgICAgKiBAZGVmYXVsdCA2NFxuICAgICAqL1xuICAgIHNpemU/OiBudW1iZXI7XG4gICAgLyoqXG4gICAgICogRmFsbGJhY2sgaWNvbiBpbiBjYXNlIHRoZSBGYXZpY29uIGlzIG5vdCBmb3VuZC5cbiAgICAgKiBAZGVmYXVsdCBJY29uLkxpbmtcbiAgICAgKi9cbiAgICBmYWxsYmFjaz86IEltYWdlLkZhbGxiYWNrO1xuICAgIC8qKlxuICAgICAqIEEge0BsaW5rIEltYWdlLk1hc2t9IHRvIGFwcGx5IHRvIHRoZSBGYXZpY29uLlxuICAgICAqL1xuICAgIG1hc2s/OiBJbWFnZS5NYXNrO1xuICB9LFxuKTogSW1hZ2UuSW1hZ2VMaWtlIHtcbiAgdHJ5IHtcbiAgICAvLyBhIGZ1bmMgYWRkaW5nIGh0dHBzOi8vIHRvIHRoZSBVUkxcbiAgICAvLyBmb3IgY2FzZXMgd2hlcmUgdGhlIFVSTCBpcyBub3QgYSBmdWxsIFVSTFxuICAgIC8vIGUuZy4gXCJyYXljYXN0LmNvbVwiXG4gICAgY29uc3Qgc2FuaXRpemUgPSAodXJsOiBzdHJpbmcpID0+IHtcbiAgICAgIGlmICghdXJsLnN0YXJ0c1dpdGgoXCJodHRwXCIpKSB7XG4gICAgICAgIHJldHVybiBgaHR0cHM6Ly8ke3VybH1gO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHVybDtcbiAgICB9O1xuXG4gICAgY29uc3QgdXJsT2JqID0gdHlwZW9mIHVybCA9PT0gXCJzdHJpbmdcIiA/IG5ldyBVUkwoc2FuaXRpemUodXJsKSkgOiB1cmw7XG4gICAgY29uc3QgaG9zdG5hbWUgPSB1cmxPYmouaG9zdG5hbWU7XG5cbiAgICBjb25zdCBmYXZpY29uUHJvdmlkZXI6IFwibm9uZVwiIHwgXCJyYXljYXN0XCIgfCBcImFwcGxlXCIgfCBcImdvb2dsZVwiIHwgXCJkdWNrRHVja0dvXCIgfCBcImR1Y2tkdWNrZ29cIiB8IFwibGVnYWN5XCIgPVxuICAgICAgKHByb2Nlc3MuZW52LkZBVklDT05fUFJPVklERVIgYXMgYW55KSA/PyBcInJheWNhc3RcIjtcblxuICAgIHN3aXRjaCAoZmF2aWNvblByb3ZpZGVyKSB7XG4gICAgICBjYXNlIFwibm9uZVwiOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNvdXJjZTogb3B0aW9ucz8uZmFsbGJhY2sgPz8gSWNvbi5MaW5rLFxuICAgICAgICAgIG1hc2s6IG9wdGlvbnM/Lm1hc2ssXG4gICAgICAgIH07XG4gICAgICBjYXNlIFwiYXBwbGVcIjpcbiAgICAgICAgLy8gd2UgY2FuJ3Qgc3VwcG9ydCBhcHBsZSBmYXZpY29ucyBhcyBpdCdzIGEgbmF0aXZlIEFQSVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNvdXJjZTogb3B0aW9ucz8uZmFsbGJhY2sgPz8gSWNvbi5MaW5rLFxuICAgICAgICAgIG1hc2s6IG9wdGlvbnM/Lm1hc2ssXG4gICAgICAgIH07XG4gICAgICBjYXNlIFwiZHVja2R1Y2tnb1wiOlxuICAgICAgY2FzZSBcImR1Y2tEdWNrR29cIjpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzb3VyY2U6IGBodHRwczovL2ljb25zLmR1Y2tkdWNrZ28uY29tL2lwMy8ke2hvc3RuYW1lfS5pY29gLFxuICAgICAgICAgIGZhbGxiYWNrOiBvcHRpb25zPy5mYWxsYmFjayA/PyBJY29uLkxpbmssXG4gICAgICAgICAgbWFzazogb3B0aW9ucz8ubWFzayxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgXCJnb29nbGVcIjpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzb3VyY2U6IGBodHRwczovL3d3dy5nb29nbGUuY29tL3MyL2Zhdmljb25zP3N6PSR7b3B0aW9ucz8uc2l6ZSA/PyA2NH0mZG9tYWluPSR7aG9zdG5hbWV9YCxcbiAgICAgICAgICBmYWxsYmFjazogb3B0aW9ucz8uZmFsbGJhY2sgPz8gSWNvbi5MaW5rLFxuICAgICAgICAgIG1hc2s6IG9wdGlvbnM/Lm1hc2ssXG4gICAgICAgIH07XG4gICAgICBjYXNlIFwibGVnYWN5XCI6XG4gICAgICBjYXNlIFwicmF5Y2FzdFwiOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzb3VyY2U6IGBodHRwczovL2FwaS5yYXkuc28vZmF2aWNvbj91cmw9JHtob3N0bmFtZX0mc2l6ZT0ke29wdGlvbnM/LnNpemUgPz8gNjR9YCxcbiAgICAgICAgICBmYWxsYmFjazogb3B0aW9ucz8uZmFsbGJhY2sgPz8gSWNvbi5MaW5rLFxuICAgICAgICAgIG1hc2s6IG9wdGlvbnM/Lm1hc2ssXG4gICAgICAgIH07XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICByZXR1cm4gSWNvbi5MaW5rO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgZW52aXJvbm1lbnQsIENvbG9yIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHR5cGUgeyBJbWFnZSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcblxuZnVuY3Rpb24gcG9sYXJUb0NhcnRlc2lhbihjZW50ZXJYOiBudW1iZXIsIGNlbnRlclk6IG51bWJlciwgcmFkaXVzOiBudW1iZXIsIGFuZ2xlSW5EZWdyZWVzOiBudW1iZXIpIHtcbiAgY29uc3QgYW5nbGVJblJhZGlhbnMgPSAoKGFuZ2xlSW5EZWdyZWVzIC0gOTApICogTWF0aC5QSSkgLyAxODAuMDtcblxuICByZXR1cm4ge1xuICAgIHg6IGNlbnRlclggKyByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyksXG4gICAgeTogY2VudGVyWSArIHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVzY3JpYmVBcmMoeDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyLCBzdGFydEFuZ2xlOiBudW1iZXIsIGVuZEFuZ2xlOiBudW1iZXIpIHtcbiAgY29uc3Qgc3RhcnQgPSBwb2xhclRvQ2FydGVzaWFuKHgsIHksIHJhZGl1cywgZW5kQW5nbGUpO1xuICBjb25zdCBlbmQgPSBwb2xhclRvQ2FydGVzaWFuKHgsIHksIHJhZGl1cywgc3RhcnRBbmdsZSk7XG5cbiAgY29uc3QgbGFyZ2VBcmNGbGFnID0gZW5kQW5nbGUgLSBzdGFydEFuZ2xlIDw9IDE4MCA/IFwiMFwiIDogXCIxXCI7XG5cbiAgY29uc3QgZCA9IFtcIk1cIiwgc3RhcnQueCwgc3RhcnQueSwgXCJBXCIsIHJhZGl1cywgcmFkaXVzLCAwLCBsYXJnZUFyY0ZsYWcsIDAsIGVuZC54LCBlbmQueV0uam9pbihcIiBcIik7XG5cbiAgcmV0dXJuIGQ7XG59XG5cbi8qKlxuICogSWNvbiB0byByZXByZXNlbnQgdGhlIHByb2dyZXNzIG9mIF9zb21ldGhpbmdfLlxuICpcbiAqIEBwYXJhbSBwcm9ncmVzcyBOdW1iZXIgYmV0d2VlbiAwIGFuZCAxLlxuICogQHBhcmFtIGNvbG9yIEhleCBjb2xvciAoZGVmYXVsdCBgXCIjRkY2MzYzXCJgKSBvciBDb2xvci5cbiAqXG4gKiBAcmV0dXJucyBhbiBJbWFnZSB0aGF0IGNhbiBiZSB1c2VkIHdoZXJlIFJheWNhc3QgZXhwZWN0cyB0aGVtLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBcbiAqIDxMaXN0Lkl0ZW0gaWNvbj17Z2V0UHJvZ3Jlc3NJY29uKDAuMSl9IHRpdGxlPVwiUHJvamVjdFwiIC8+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByb2dyZXNzSWNvbihcbiAgcHJvZ3Jlc3M6IG51bWJlcixcbiAgY29sb3I6IENvbG9yIHwgc3RyaW5nID0gQ29sb3IuUmVkLFxuICBvcHRpb25zPzogeyBiYWNrZ3JvdW5kPzogQ29sb3IgfCBzdHJpbmc7IGJhY2tncm91bmRPcGFjaXR5PzogbnVtYmVyIH0sXG4pOiBJbWFnZS5Bc3NldCB7XG4gIGNvbnN0IGJhY2tncm91bmQgPSBvcHRpb25zPy5iYWNrZ3JvdW5kIHx8IChlbnZpcm9ubWVudC5hcHBlYXJhbmNlID09PSBcImxpZ2h0XCIgPyBcImJsYWNrXCIgOiBcIndoaXRlXCIpO1xuICBjb25zdCBiYWNrZ3JvdW5kT3BhY2l0eSA9IG9wdGlvbnM/LmJhY2tncm91bmRPcGFjaXR5IHx8IDAuMTtcblxuICBjb25zdCBzdHJva2UgPSAxMDtcbiAgY29uc3QgcGFkZGluZyA9IDU7XG4gIGNvbnN0IHJhZGl1cyA9IDUwIC0gcGFkZGluZyAtIHN0cm9rZSAvIDI7XG5cbiAgY29uc3Qgc3ZnID0gYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMTAwcHhcIiBoZWlnaHQ9XCIxMDBweFwiPlxuICAgICAgPGNpcmNsZSBjeD1cIjUwXCIgY3k9XCI1MFwiIHI9XCIke3JhZGl1c31cIiBzdHJva2Utd2lkdGg9XCIke3N0cm9rZX1cIiBzdHJva2U9XCIke1xuICAgICAgICBwcm9ncmVzcyA8IDEgPyBiYWNrZ3JvdW5kIDogY29sb3JcbiAgICAgIH1cIiBvcGFjaXR5PVwiJHtwcm9ncmVzcyA8IDEgPyBiYWNrZ3JvdW5kT3BhY2l0eSA6IFwiMVwifVwiIGZpbGw9XCJub25lXCIgLz5cbiAgICAgICR7XG4gICAgICAgIHByb2dyZXNzID4gMCAmJiBwcm9ncmVzcyA8IDFcbiAgICAgICAgICA/IGA8cGF0aCBkPVwiJHtkZXNjcmliZUFyYyhcbiAgICAgICAgICAgICAgNTAsXG4gICAgICAgICAgICAgIDUwLFxuICAgICAgICAgICAgICByYWRpdXMsXG4gICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgIHByb2dyZXNzICogMzYwLFxuICAgICAgICAgICAgKX1cIiBzdHJva2U9XCIke2NvbG9yfVwiIHN0cm9rZS13aWR0aD1cIiR7c3Ryb2tlfVwiIGZpbGw9XCJub25lXCIgLz5gXG4gICAgICAgICAgOiBcIlwiXG4gICAgICB9XG4gICAgPC9zdmc+XG4gIGAucmVwbGFjZUFsbChcIlxcblwiLCBcIlwiKTtcbiAgcmV0dXJuIGBkYXRhOmltYWdlL3N2Zyt4bWwsJHtlbmNvZGVVUklDb21wb25lbnQoc3ZnKX1gO1xufVxuIiwgImV4cG9ydCB7IE9BdXRoU2VydmljZSB9IGZyb20gXCIuL09BdXRoU2VydmljZVwiO1xuZXhwb3J0IHsgd2l0aEFjY2Vzc1Rva2VuLCBnZXRBY2Nlc3NUb2tlbiB9IGZyb20gXCIuL3dpdGhBY2Nlc3NUb2tlblwiO1xuXG5leHBvcnQgdHlwZSB7IFdpdGhBY2Nlc3NUb2tlbkNvbXBvbmVudE9yRm4gfSBmcm9tIFwiLi93aXRoQWNjZXNzVG9rZW5cIjtcbmV4cG9ydCB0eXBlIHtcbiAgT25BdXRob3JpemVQYXJhbXMsXG4gIE9BdXRoU2VydmljZU9wdGlvbnMsXG4gIFByb3ZpZGVyV2l0aERlZmF1bHRDbGllbnRPcHRpb25zLFxuICBQcm92aWRlck9wdGlvbnMsXG59IGZyb20gXCIuL3R5cGVzXCI7XG4iLCAiaW1wb3J0IHsgQ29sb3IsIE9BdXRoIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgUFJPVklERVJfQ0xJRU5UX0lEUyB9IGZyb20gXCIuL3Byb3ZpZGVyc1wiO1xuaW1wb3J0IHR5cGUge1xuICBPQXV0aFNlcnZpY2VPcHRpb25zLFxuICBPbkF1dGhvcml6ZVBhcmFtcyxcbiAgUHJvdmlkZXJPcHRpb25zLFxuICBQcm92aWRlcldpdGhEZWZhdWx0Q2xpZW50T3B0aW9ucyxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBDbGFzcyBhbGxvd2luZyB0byBjcmVhdGUgYW4gT0F1dGggc2VydmljZSB1c2luZyB0aGUgdGhlIFBLQ0UgKFByb29mIEtleSBmb3IgQ29kZSBFeGNoYW5nZSkgZmxvdy5cbiAqXG4gKiBUaGlzIHNlcnZpY2UgaXMgY2FwYWJsZSBvZiBzdGFydGluZyB0aGUgYXV0aG9yaXphdGlvbiBwcm9jZXNzLCBmZXRjaGluZyBhbmQgcmVmcmVzaGluZyB0b2tlbnMsXG4gKiBhcyB3ZWxsIGFzIG1hbmFnaW5nIHRoZSBhdXRoZW50aWNhdGlvbiBzdGF0ZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3Qgb2F1dGhDbGllbnQgPSBuZXcgT0F1dGguUEtDRUNsaWVudCh7IC4uLiB9KTtcbiAqIGNvbnN0IG9hdXRoU2VydmljZSA9IG5ldyBPQXV0aFNlcnZpY2Uoe1xuICogICBjbGllbnQ6IG9hdXRoQ2xpZW50LFxuICogICBjbGllbnRJZDogJ3lvdXItY2xpZW50LWlkJyxcbiAqICAgc2NvcGU6ICdyZXF1aXJlZCBzY29wZXMnLFxuICogICBhdXRob3JpemVVcmw6ICdodHRwczovL3Byb3ZpZGVyLmNvbS9vYXV0aC9hdXRob3JpemUnLFxuICogICB0b2tlblVybDogJ2h0dHBzOi8vcHJvdmlkZXIuY29tL29hdXRoL3Rva2VuJyxcbiAqICAgcmVmcmVzaFRva2VuVXJsOiAnaHR0cHM6Ly9wcm92aWRlci5jb20vb2F1dGgvdG9rZW4nLFxuICogICBleHRyYVBhcmFtZXRlcnM6IHsgJ2FkZGl0aW9uYWxfcGFyYW0nOiAndmFsdWUnIH1cbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBPQXV0aFNlcnZpY2UgaW1wbGVtZW50cyBPQXV0aFNlcnZpY2VPcHRpb25zIHtcbiAgcHVibGljIGNsaWVudElkOiBzdHJpbmc7XG4gIHB1YmxpYyBzY29wZTogc3RyaW5nO1xuICBwdWJsaWMgY2xpZW50OiBPQXV0aC5QS0NFQ2xpZW50O1xuICBwdWJsaWMgZXh0cmFQYXJhbWV0ZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgcHVibGljIGF1dGhvcml6ZVVybDogc3RyaW5nO1xuICBwdWJsaWMgdG9rZW5Vcmw6IHN0cmluZztcbiAgcHVibGljIHJlZnJlc2hUb2tlblVybD86IHN0cmluZztcbiAgcHVibGljIGJvZHlFbmNvZGluZz86IFwianNvblwiIHwgXCJ1cmwtZW5jb2RlZFwiO1xuICBwdWJsaWMgcGVyc29uYWxBY2Nlc3NUb2tlbj86IHN0cmluZztcbiAgb25BdXRob3JpemU/OiAocGFyYW1zOiBPbkF1dGhvcml6ZVBhcmFtcykgPT4gdm9pZDtcbiAgdG9rZW5SZXNwb25zZVBhcnNlcjogKHJlc3BvbnNlOiB1bmtub3duKSA9PiBPQXV0aC5Ub2tlblJlc3BvbnNlO1xuICB0b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcjogKHJlc3BvbnNlOiB1bmtub3duKSA9PiBPQXV0aC5Ub2tlblJlc3BvbnNlO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IE9BdXRoU2VydmljZU9wdGlvbnMpIHtcbiAgICB0aGlzLmNsaWVudElkID0gb3B0aW9ucy5jbGllbnRJZDtcbiAgICB0aGlzLnNjb3BlID0gQXJyYXkuaXNBcnJheShvcHRpb25zLnNjb3BlKSA/IG9wdGlvbnMuc2NvcGUuam9pbihcIiBcIikgOiBvcHRpb25zLnNjb3BlO1xuICAgIHRoaXMucGVyc29uYWxBY2Nlc3NUb2tlbiA9IG9wdGlvbnMucGVyc29uYWxBY2Nlc3NUb2tlbjtcbiAgICB0aGlzLmJvZHlFbmNvZGluZyA9IG9wdGlvbnMuYm9keUVuY29kaW5nO1xuICAgIHRoaXMuY2xpZW50ID0gb3B0aW9ucy5jbGllbnQ7XG4gICAgdGhpcy5leHRyYVBhcmFtZXRlcnMgPSBvcHRpb25zLmV4dHJhUGFyYW1ldGVycztcbiAgICB0aGlzLmF1dGhvcml6ZVVybCA9IG9wdGlvbnMuYXV0aG9yaXplVXJsO1xuICAgIHRoaXMudG9rZW5VcmwgPSBvcHRpb25zLnRva2VuVXJsO1xuICAgIHRoaXMucmVmcmVzaFRva2VuVXJsID0gb3B0aW9ucy5yZWZyZXNoVG9rZW5Vcmw7XG4gICAgdGhpcy5vbkF1dGhvcml6ZSA9IG9wdGlvbnMub25BdXRob3JpemU7XG4gICAgdGhpcy50b2tlblJlc3BvbnNlUGFyc2VyID0gb3B0aW9ucy50b2tlblJlc3BvbnNlUGFyc2VyID8/ICgoeCkgPT4geCBhcyBPQXV0aC5Ub2tlblJlc3BvbnNlKTtcbiAgICB0aGlzLnRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyID0gb3B0aW9ucy50b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlciA/PyAoKHgpID0+IHggYXMgT0F1dGguVG9rZW5SZXNwb25zZSk7XG4gICAgdGhpcy5hdXRob3JpemUgPSB0aGlzLmF1dGhvcml6ZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzYW5hIE9BdXRoIHNlcnZpY2UgcHJvdmlkZWQgb3V0IG9mIHRoZSBib3guXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgYXNhbmEgPSBPQXV0aFNlcnZpY2UuYXNhbmEoeyBzY29wZTogJ2RlZmF1bHQnIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhc2FuYShvcHRpb25zOiBQcm92aWRlcldpdGhEZWZhdWx0Q2xpZW50T3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgT0F1dGhTZXJ2aWNlKHtcbiAgICAgIGNsaWVudDogbmV3IE9BdXRoLlBLQ0VDbGllbnQoe1xuICAgICAgICByZWRpcmVjdE1ldGhvZDogT0F1dGguUmVkaXJlY3RNZXRob2QuV2ViLFxuICAgICAgICBwcm92aWRlck5hbWU6IFwiQXNhbmFcIixcbiAgICAgICAgcHJvdmlkZXJJY29uOiBgZGF0YTppbWFnZS9zdmcreG1sLCR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgIGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjI1MVwiIGhlaWdodD1cIjIzMlwiIGZpbGw9XCJub25lXCI+PHBhdGggZmlsbD1cIiNGMDZBNkFcIiBkPVwiTTE3OS4zODMgNTQuMzczYzAgMzAuMDE3LTI0LjMzNyA1NC4zNzQtNTQuMzU0IDU0LjM3NC0zMC4wMzUgMC01NC4zNzMtMjQuMzM4LTU0LjM3My01NC4zNzRDNzAuNjU2IDI0LjMzOCA5NC45OTMgMCAxMjUuMDI5IDBjMzAuMDE3IDAgNTQuMzU0IDI0LjMzOCA1NC4zNTQgNTQuMzczWk01NC4zOTMgMTIyLjMzQzI0LjM3NiAxMjIuMzMuMDIgMTQ2LjY2OC4wMiAxNzYuNjg1YzAgMzAuMDE3IDI0LjMzNyA1NC4zNzMgNTQuMzczIDU0LjM3MyAzMC4wMzUgMCA1NC4zNzMtMjQuMzM4IDU0LjM3My01NC4zNzMgMC0zMC4wMTctMjQuMzM4LTU0LjM1NS01NC4zNzMtNTQuMzU1Wm0xNDEuMjUzIDBjLTMwLjAzNSAwLTU0LjM3MyAyNC4zMzgtNTQuMzczIDU0LjM3NCAwIDMwLjAzNSAyNC4zMzggNTQuMzczIDU0LjM3MyA1NC4zNzMgMzAuMDE3IDAgNTQuMzc0LTI0LjMzOCA1NC4zNzQtNTQuMzczIDAtMzAuMDM2LTI0LjMzOC01NC4zNzQtNTQuMzc0LTU0LjM3NFpcIi8+PC9zdmc+YCxcbiAgICAgICAgKX1gLFxuICAgICAgICBwcm92aWRlcklkOiBcImFzYW5hXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbm5lY3QgeW91ciBBc2FuYSBhY2NvdW50XCIsXG4gICAgICB9KSxcbiAgICAgIGNsaWVudElkOiBvcHRpb25zLmNsaWVudElkID8/IFBST1ZJREVSX0NMSUVOVF9JRFMuYXNhbmEsXG4gICAgICBhdXRob3JpemVVcmw6IG9wdGlvbnMuYXV0aG9yaXplVXJsID8/IFwiaHR0cHM6Ly9hc2FuYS5vYXV0aC5yYXljYXN0LmNvbS9hdXRob3JpemVcIixcbiAgICAgIHRva2VuVXJsOiBvcHRpb25zLnRva2VuVXJsID8/IFwiaHR0cHM6Ly9hc2FuYS5vYXV0aC5yYXljYXN0LmNvbS90b2tlblwiLFxuICAgICAgcmVmcmVzaFRva2VuVXJsOiBvcHRpb25zLnJlZnJlc2hUb2tlblVybCA/PyBcImh0dHBzOi8vYXNhbmEub2F1dGgucmF5Y2FzdC5jb20vcmVmcmVzaC10b2tlblwiLFxuICAgICAgc2NvcGU6IG9wdGlvbnMuc2NvcGUsXG4gICAgICBwZXJzb25hbEFjY2Vzc1Rva2VuOiBvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW4sXG4gICAgICBvbkF1dGhvcml6ZTogb3B0aW9ucy5vbkF1dGhvcml6ZSxcbiAgICAgIGJvZHlFbmNvZGluZzogb3B0aW9ucy5ib2R5RW5jb2RpbmcsXG4gICAgICB0b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcjogb3B0aW9ucy50b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcixcbiAgICAgIHRva2VuUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZXNwb25zZVBhcnNlcixcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXRIdWIgT0F1dGggc2VydmljZSBwcm92aWRlZCBvdXQgb2YgdGhlIGJveC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBnaXRodWIgPSBPQXV0aFNlcnZpY2UuZ2l0aHViKHsgc2NvcGU6ICdyZXBvIHVzZXInIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnaXRodWIob3B0aW9uczogUHJvdmlkZXJXaXRoRGVmYXVsdENsaWVudE9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IE9BdXRoU2VydmljZSh7XG4gICAgICBjbGllbnQ6IG5ldyBPQXV0aC5QS0NFQ2xpZW50KHtcbiAgICAgICAgcmVkaXJlY3RNZXRob2Q6IE9BdXRoLlJlZGlyZWN0TWV0aG9kLldlYixcbiAgICAgICAgcHJvdmlkZXJOYW1lOiBcIkdpdEh1YlwiLFxuICAgICAgICBwcm92aWRlckljb246IHtcbiAgICAgICAgICBzb3VyY2U6IGBkYXRhOmltYWdlL3N2Zyt4bWwsJHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCI2NFwiIGhlaWdodD1cIjY0XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiPjxwYXRoIGZpbGwtcnVsZT1cImV2ZW5vZGRcIiBkPVwiTTggMEMzLjU4IDAgMCAzLjU4IDAgOGMwIDMuNTQgMi4yOSA2LjUzIDUuNDcgNy41OS40LjA3LjU1LS4xNy41NS0uMzggMC0uMTktLjAxLS44Mi0uMDEtMS40OS0yLjAxLjM3LTIuNTMtLjQ5LTIuNjktLjk0LS4wOS0uMjMtLjQ4LS45NC0uODItMS4xMy0uMjgtLjE1LS42OC0uNTItLjAxLS41My42My0uMDEgMS4wOC41OCAxLjIzLjgyLjcyIDEuMjEgMS44Ny44NyAyLjMzLjY2LjA3LS41Mi4yOC0uODcuNTEtMS4wNy0xLjc4LS4yLTMuNjQtLjg5LTMuNjQtMy45NSAwLS44Ny4zMS0xLjU5LjgyLTIuMTUtLjA4LS4yLS4zNi0xLjAyLjA4LTIuMTIgMCAwIC42Ny0uMjEgMi4yLjgyLjY0LS4xOCAxLjMyLS4yNyAyLS4yNy42OCAwIDEuMzYuMDkgMiAuMjcgMS41My0xLjA0IDIuMi0uODIgMi4yLS44Mi40NCAxLjEuMTYgMS45Mi4wOCAyLjEyLjUxLjU2LjgyIDEuMjcuODIgMi4xNSAwIDMuMDctMS44NyAzLjc1LTMuNjUgMy45NS4yOS4yNS41NC43My41NCAxLjQ4IDAgMS4wNy0uMDEgMS45My0uMDEgMi4yIDAgLjIxLjE1LjQ2LjU1LjM4QTguMDEzIDguMDEzIDAgMCAwIDE2IDhjMC00LjQyLTMuNTgtOC04LTh6XCIvPjwvc3ZnPmAsXG4gICAgICAgICAgKX1gLFxuXG4gICAgICAgICAgdGludENvbG9yOiBDb2xvci5QcmltYXJ5VGV4dCxcbiAgICAgICAgfSxcbiAgICAgICAgcHJvdmlkZXJJZDogXCJnaXRodWJcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQ29ubmVjdCB5b3VyIEdpdEh1YiBhY2NvdW50XCIsXG4gICAgICB9KSxcbiAgICAgIGNsaWVudElkOiBvcHRpb25zLmNsaWVudElkID8/IFBST1ZJREVSX0NMSUVOVF9JRFMuZ2l0aHViLFxuICAgICAgYXV0aG9yaXplVXJsOiBvcHRpb25zLmF1dGhvcml6ZVVybCA/PyBcImh0dHBzOi8vZ2l0aHViLm9hdXRoLnJheWNhc3QuY29tL2F1dGhvcml6ZVwiLFxuICAgICAgdG9rZW5Vcmw6IG9wdGlvbnMudG9rZW5VcmwgPz8gXCJodHRwczovL2dpdGh1Yi5vYXV0aC5yYXljYXN0LmNvbS90b2tlblwiLFxuICAgICAgcmVmcmVzaFRva2VuVXJsOiBvcHRpb25zLnJlZnJlc2hUb2tlblVybCA/PyBcImh0dHBzOi8vZ2l0aHViLm9hdXRoLnJheWNhc3QuY29tL3JlZnJlc2gtdG9rZW5cIixcbiAgICAgIHNjb3BlOiBvcHRpb25zLnNjb3BlLFxuICAgICAgcGVyc29uYWxBY2Nlc3NUb2tlbjogb3B0aW9ucy5wZXJzb25hbEFjY2Vzc1Rva2VuLFxuICAgICAgb25BdXRob3JpemU6IG9wdGlvbnMub25BdXRob3JpemUsXG4gICAgICBib2R5RW5jb2Rpbmc6IG9wdGlvbnMuYm9keUVuY29kaW5nLFxuICAgICAgdG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXIsXG4gICAgICB0b2tlblJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVzcG9uc2VQYXJzZXIsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR29vZ2xlIE9BdXRoIHNlcnZpY2UgcHJvdmlkZWQgb3V0IG9mIHRoZSBib3guXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgZ29vZ2xlID0gT0F1dGhTZXJ2aWNlLmdvb2dsZSh7XG4gICAqICAgY2xpZW50SWQ6ICdjdXN0b20tY2xpZW50LWlkJyxcbiAgICogICBhdXRob3JpemVVcmw6ICdodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvdjIvYXV0aCcsXG4gICAqICAgdG9rZW5Vcmw6ICdodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbicsXG4gICAqICAgc2NvcGU6ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLnJlYWRvbmx5JyxcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnb29nbGUob3B0aW9uczogUHJvdmlkZXJPcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBPQXV0aFNlcnZpY2Uoe1xuICAgICAgY2xpZW50OiBuZXcgT0F1dGguUEtDRUNsaWVudCh7XG4gICAgICAgIHJlZGlyZWN0TWV0aG9kOiBPQXV0aC5SZWRpcmVjdE1ldGhvZC5BcHBVUkksXG4gICAgICAgIHByb3ZpZGVyTmFtZTogXCJHb29nbGVcIixcbiAgICAgICAgcHJvdmlkZXJJY29uOiBgZGF0YTppbWFnZS9zdmcreG1sLCR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgIGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBzdHlsZT1cImRpc3BsYXk6YmxvY2tcIiB2aWV3Qm94PVwiMCAwIDQ4IDQ4XCI+PHBhdGggZmlsbD1cIiNFQTQzMzVcIiBkPVwiTTI0IDkuNWMzLjU0IDAgNi43MSAxLjIyIDkuMjEgMy42bDYuODUtNi44NUMzNS45IDIuMzggMzAuNDcgMCAyNCAwIDE0LjYyIDAgNi41MSA1LjM4IDIuNTYgMTMuMjJsNy45OCA2LjE5QzEyLjQzIDEzLjcyIDE3Ljc0IDkuNSAyNCA5LjV6XCIvPjxwYXRoIGZpbGw9XCIjNDI4NUY0XCIgZD1cIk00Ni45OCAyNC41NWMwLTEuNTctLjE1LTMuMDktLjM4LTQuNTVIMjR2OS4wMmgxMi45NGMtLjU4IDIuOTYtMi4yNiA1LjQ4LTQuNzggNy4xOGw3LjczIDZjNC41MS00LjE4IDcuMDktMTAuMzYgNy4wOS0xNy42NXpcIi8+PHBhdGggZmlsbD1cIiNGQkJDMDVcIiBkPVwiTTEwLjUzIDI4LjU5Yy0uNDgtMS40NS0uNzYtMi45OS0uNzYtNC41OXMuMjctMy4xNC43Ni00LjU5bC03Ljk4LTYuMTlDLjkyIDE2LjQ2IDAgMjAuMTIgMCAyNGMwIDMuODguOTIgNy41NCAyLjU2IDEwLjc4bDcuOTctNi4xOXpcIi8+PHBhdGggZmlsbD1cIiMzNEE4NTNcIiBkPVwiTTI0IDQ4YzYuNDggMCAxMS45My0yLjEzIDE1Ljg5LTUuODFsLTcuNzMtNmMtMi4xNSAxLjQ1LTQuOTIgMi4zLTguMTYgMi4zLTYuMjYgMC0xMS41Ny00LjIyLTEzLjQ3LTkuOTFsLTcuOTggNi4xOUM2LjUxIDQyLjYyIDE0LjYyIDQ4IDI0IDQ4elwiLz48cGF0aCBmaWxsPVwibm9uZVwiIGQ9XCJNMCAwaDQ4djQ4SDB6XCIvPjwvc3ZnPmAsXG4gICAgICAgICl9YCxcbiAgICAgICAgcHJvdmlkZXJJZDogXCJnb29nbGVcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQ29ubmVjdCB5b3VyIEdvb2dsZSBhY2NvdW50XCIsXG4gICAgICB9KSxcbiAgICAgIGNsaWVudElkOiBvcHRpb25zLmNsaWVudElkLFxuICAgICAgYXV0aG9yaXplVXJsOiBvcHRpb25zLmF1dGhvcml6ZVVybCA/PyBcImh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi92Mi9hdXRoXCIsXG4gICAgICB0b2tlblVybDogb3B0aW9ucy50b2tlblVybCA/PyBcImh0dHBzOi8vb2F1dGgyLmdvb2dsZWFwaXMuY29tL3Rva2VuXCIsXG4gICAgICByZWZyZXNoVG9rZW5Vcmw6IG9wdGlvbnMudG9rZW5VcmwsXG4gICAgICBzY29wZTogb3B0aW9ucy5zY29wZSxcbiAgICAgIHBlcnNvbmFsQWNjZXNzVG9rZW46IG9wdGlvbnMucGVyc29uYWxBY2Nlc3NUb2tlbixcbiAgICAgIGJvZHlFbmNvZGluZzogb3B0aW9ucy5ib2R5RW5jb2RpbmcgPz8gXCJ1cmwtZW5jb2RlZFwiLFxuICAgICAgb25BdXRob3JpemU6IG9wdGlvbnMub25BdXRob3JpemUsXG4gICAgICB0b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcjogb3B0aW9ucy50b2tlblJlZnJlc2hSZXNwb25zZVBhcnNlcixcbiAgICAgIHRva2VuUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZXNwb25zZVBhcnNlcixcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBKaXJhIE9BdXRoIHNlcnZpY2UgcHJvdmlkZWQgb3V0IG9mIHRoZSBib3guXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3QgamlyYSA9IE9BdXRoU2VydmljZS5qaXJhKHtcbiAgICogICBjbGllbnRJZDogJ2N1c3RvbS1jbGllbnQtaWQnLFxuICAgKiAgIGF1dGhvcml6ZVVybDogJ2h0dHBzOi8vYXV0aC5hdGxhc3NpYW4uY29tL2F1dGhvcml6ZScsXG4gICAqICAgdG9rZW5Vcmw6ICdodHRwczovL2FwaS5hdGxhc3NpYW4uY29tL29hdXRoL3Rva2VuJyxcbiAgICogICBzY29wZTogJ3JlYWQ6amlyYS11c2VyIHJlYWQ6amlyYS13b3JrIG9mZmxpbmVfYWNjZXNzJ1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGppcmEob3B0aW9uczogUHJvdmlkZXJPcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBPQXV0aFNlcnZpY2Uoe1xuICAgICAgY2xpZW50OiBuZXcgT0F1dGguUEtDRUNsaWVudCh7XG4gICAgICAgIHJlZGlyZWN0TWV0aG9kOiBPQXV0aC5SZWRpcmVjdE1ldGhvZC5XZWIsXG4gICAgICAgIHByb3ZpZGVyTmFtZTogXCJKaXJhXCIsXG4gICAgICAgIHByb3ZpZGVySWNvbjogYGRhdGE6aW1hZ2Uvc3ZnK3htbCwke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgd2lkdGg9XCIyMzYxXCIgaGVpZ2h0PVwiMjUwMFwiIHZpZXdCb3g9XCIyLjU5IDAgMjE0LjA5MSAyMjRcIj48bGluZWFyR3JhZGllbnQgaWQ9XCJhXCIgeDE9XCIxMDIuNFwiIHgyPVwiNTYuMTVcIiB5MT1cIjIxOC42M1wiIHkyPVwiMTcyLjM5XCIgZ3JhZGllbnRUcmFuc2Zvcm09XCJtYXRyaXgoMSAwIDAgLTEgMCAyNjQpXCIgZ3JhZGllbnRVbml0cz1cInVzZXJTcGFjZU9uVXNlXCI+PHN0b3Agb2Zmc2V0PVwiLjE4XCIgc3RvcC1jb2xvcj1cIiMwMDUyY2NcIi8+PHN0b3Agb2Zmc2V0PVwiMVwiIHN0b3AtY29sb3I9XCIjMjY4NGZmXCIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IHhsaW5rOmhyZWY9XCIjYVwiIGlkPVwiYlwiIHgxPVwiMTE0LjY1XCIgeDI9XCIxNjAuODFcIiB5MT1cIjg1Ljc3XCIgeTI9XCIxMzEuOTJcIi8+PHBhdGggZmlsbD1cIiMyNjg0ZmZcIiBkPVwiTTIxNC4wNiAxMDUuNzMgMTE3LjY3IDkuMzQgMTA4LjMzIDAgMzUuNzcgNzIuNTYgMi41OSAxMDUuNzNhOC44OSA4Ljg5IDAgMCAwIDAgMTIuNTRsNjYuMjkgNjYuMjlMMTA4LjMzIDIyNGw3Mi41NS03Mi41NiAxLjEzLTEuMTIgMzIuMDUtMzJhOC44NyA4Ljg3IDAgMCAwIDAtMTIuNTl6bS0xMDUuNzMgMzkuMzlMNzUuMjEgMTEybDMzLjEyLTMzLjEyTDE0MS40NCAxMTJ6XCIvPjxwYXRoIGZpbGw9XCJ1cmwoI2EpXCIgZD1cIk0xMDguMzMgNzguODhhNTUuNzUgNTUuNzUgMCAwIDEtLjI0LTc4LjYxTDM1LjYyIDcyLjcxbDM5LjQ0IDM5LjQ0elwiLz48cGF0aCBmaWxsPVwidXJsKCNiKVwiIGQ9XCJtMTQxLjUzIDExMS45MS0zMy4yIDMzLjIxYTU1Ljc3IDU1Ljc3IDAgMCAxIDAgNzguODZMMTgxIDE1MS4zNXpcIi8+PC9zdmc+YCxcbiAgICAgICAgKX1gLFxuICAgICAgICBwcm92aWRlcklkOiBcImppcmFcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQ29ubmVjdCB5b3VyIEppcmEgYWNjb3VudFwiLFxuICAgICAgfSksXG4gICAgICBjbGllbnRJZDogb3B0aW9ucy5jbGllbnRJZCxcbiAgICAgIGF1dGhvcml6ZVVybDogb3B0aW9ucy5hdXRob3JpemVVcmwgPz8gXCJodHRwczovL2F1dGguYXRsYXNzaWFuLmNvbS9hdXRob3JpemVcIixcbiAgICAgIHRva2VuVXJsOiBvcHRpb25zLnRva2VuVXJsID8/IFwiaHR0cHM6Ly9hdXRoLmF0bGFzc2lhbi5jb20vb2F1dGgvdG9rZW5cIixcbiAgICAgIHJlZnJlc2hUb2tlblVybDogb3B0aW9ucy5yZWZyZXNoVG9rZW5VcmwsXG4gICAgICBzY29wZTogb3B0aW9ucy5zY29wZSxcbiAgICAgIHBlcnNvbmFsQWNjZXNzVG9rZW46IG9wdGlvbnMucGVyc29uYWxBY2Nlc3NUb2tlbixcbiAgICAgIG9uQXV0aG9yaXplOiBvcHRpb25zLm9uQXV0aG9yaXplLFxuICAgICAgYm9keUVuY29kaW5nOiBvcHRpb25zLmJvZHlFbmNvZGluZyxcbiAgICAgIHRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyLFxuICAgICAgdG9rZW5SZXNwb25zZVBhcnNlcjogb3B0aW9ucy50b2tlblJlc3BvbnNlUGFyc2VyLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIExpbmVhciBPQXV0aCBzZXJ2aWNlIHByb3ZpZGVkIG91dCBvZiB0aGUgYm94LlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNvbnN0IGxpbmVhciA9IE9BdXRoU2VydmljZS5saW5lYXIoeyBzY29wZTogJ3JlYWQgd3JpdGUnIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBsaW5lYXIob3B0aW9uczogUHJvdmlkZXJXaXRoRGVmYXVsdENsaWVudE9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IE9BdXRoU2VydmljZSh7XG4gICAgICBjbGllbnQ6IG5ldyBPQXV0aC5QS0NFQ2xpZW50KHtcbiAgICAgICAgcmVkaXJlY3RNZXRob2Q6IE9BdXRoLlJlZGlyZWN0TWV0aG9kLldlYixcbiAgICAgICAgcHJvdmlkZXJOYW1lOiBcIkxpbmVhclwiLFxuICAgICAgICBwcm92aWRlckljb246IHtcbiAgICAgICAgICBzb3VyY2U6IHtcbiAgICAgICAgICAgIGxpZ2h0OiBgZGF0YTppbWFnZS9zdmcreG1sLCR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cIiMyMjIzMjZcIiB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMTAwIDEwMFwiPjxwYXRoIGQ9XCJNMS4yMjU0MSA2MS41MjI4Yy0uMjIyNS0uOTQ4NS45MDc0OC0xLjU0NTkgMS41OTYzOC0uODU3TDM5LjMzNDIgOTcuMTc4MmMuNjg4OS42ODg5LjA5MTUgMS44MTg5LS44NTcgMS41OTY0QzIwLjA1MTUgOTQuNDUyMiA1LjU0Nzc5IDc5Ljk0ODUgMS4yMjU0MSA2MS41MjI4Wk0uMDAxODkxMzUgNDYuODg5MWMtLjAxNzY0Mzc1LjI4MzMuMDg4ODcyMTUuNTU5OS4yODk1NzE2NS43NjA2TDUyLjM1MDMgOTkuNzA4NWMuMjAwNy4yMDA3LjQ3NzMuMzA3NS43NjA2LjI4OTYgMi4zNjkyLS4xNDc2IDQuNjkzOC0uNDYgNi45NjI0LS45MjU5Ljc2NDUtLjE1NyAxLjAzMDEtMS4wOTYzLjQ3ODItMS42NDgxTDIuNTc1OTUgMzkuNDQ4NWMtLjU1MTg2LS41NTE5LTEuNDkxMTctLjI4NjMtMS42NDgxNzQuNDc4Mi0uNDY1OTE1IDIuMjY4Ni0uNzc4MzIgNC41OTMyLS45MjU4ODQ2NSA2Ljk2MjRaTTQuMjEwOTMgMjkuNzA1NGMtLjE2NjQ5LjM3MzgtLjA4MTY5LjgxMDYuMjA3NjUgMS4xbDY0Ljc3NjAyIDY0Ljc3NmMuMjg5NC4yODk0LjcyNjIuMzc0MiAxLjEuMjA3NyAxLjc4NjEtLjc5NTYgMy41MTcxLTEuNjkyNyA1LjE4NTUtMi42ODQuNTUyMS0uMzI4LjYzNzMtMS4wODY3LjE4MzItMS41NDA3TDguNDM1NjYgMjQuMzM2N2MtLjQ1NDA5LS40NTQxLTEuMjEyNzEtLjM2ODktMS41NDA3NC4xODMyLS45OTEzMiAxLjY2ODQtMS44ODg0MyAzLjM5OTQtMi42ODM5OSA1LjE4NTVaTTEyLjY1ODcgMTguMDc0Yy0uMzcwMS0uMzcwMS0uMzkzLS45NjM3LS4wNDQzLTEuMzU0MUMyMS43Nzk1IDYuNDU5MzEgMzUuMTExNCAwIDQ5Ljk1MTkgMCA3Ny41OTI3IDAgMTAwIDIyLjQwNzMgMTAwIDUwLjA0ODFjMCAxNC44NDA1LTYuNDU5MyAyOC4xNzI0LTE2LjcxOTkgMzcuMzM3NS0uMzkwMy4zNDg3LS45ODQuMzI1OC0xLjM1NDItLjA0NDNMMTIuNjU4NyAxOC4wNzRaXCIvPjwvc3ZnPmAsXG4gICAgICAgICAgICApfWAsXG4gICAgICAgICAgICBkYXJrOiBgZGF0YTppbWFnZS9zdmcreG1sLCR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cIiNmZmZcIiB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjIwMFwiIHZpZXdCb3g9XCIwIDAgMTAwIDEwMFwiPjxwYXRoIGQ9XCJNMS4yMjU0MSA2MS41MjI4Yy0uMjIyNS0uOTQ4NS45MDc0OC0xLjU0NTkgMS41OTYzOC0uODU3TDM5LjMzNDIgOTcuMTc4MmMuNjg4OS42ODg5LjA5MTUgMS44MTg5LS44NTcgMS41OTY0QzIwLjA1MTUgOTQuNDUyMiA1LjU0Nzc5IDc5Ljk0ODUgMS4yMjU0MSA2MS41MjI4Wk0uMDAxODkxMzUgNDYuODg5MWMtLjAxNzY0Mzc1LjI4MzMuMDg4ODcyMTUuNTU5OS4yODk1NzE2NS43NjA2TDUyLjM1MDMgOTkuNzA4NWMuMjAwNy4yMDA3LjQ3NzMuMzA3NS43NjA2LjI4OTYgMi4zNjkyLS4xNDc2IDQuNjkzOC0uNDYgNi45NjI0LS45MjU5Ljc2NDUtLjE1NyAxLjAzMDEtMS4wOTYzLjQ3ODItMS42NDgxTDIuNTc1OTUgMzkuNDQ4NWMtLjU1MTg2LS41NTE5LTEuNDkxMTctLjI4NjMtMS42NDgxNzQuNDc4Mi0uNDY1OTE1IDIuMjY4Ni0uNzc4MzIgNC41OTMyLS45MjU4ODQ2NSA2Ljk2MjRaTTQuMjEwOTMgMjkuNzA1NGMtLjE2NjQ5LjM3MzgtLjA4MTY5LjgxMDYuMjA3NjUgMS4xbDY0Ljc3NjAyIDY0Ljc3NmMuMjg5NC4yODk0LjcyNjIuMzc0MiAxLjEuMjA3NyAxLjc4NjEtLjc5NTYgMy41MTcxLTEuNjkyNyA1LjE4NTUtMi42ODQuNTUyMS0uMzI4LjYzNzMtMS4wODY3LjE4MzItMS41NDA3TDguNDM1NjYgMjQuMzM2N2MtLjQ1NDA5LS40NTQxLTEuMjEyNzEtLjM2ODktMS41NDA3NC4xODMyLS45OTEzMiAxLjY2ODQtMS44ODg0MyAzLjM5OTQtMi42ODM5OSA1LjE4NTVaTTEyLjY1ODcgMTguMDc0Yy0uMzcwMS0uMzcwMS0uMzkzLS45NjM3LS4wNDQzLTEuMzU0MUMyMS43Nzk1IDYuNDU5MzEgMzUuMTExNCAwIDQ5Ljk1MTkgMCA3Ny41OTI3IDAgMTAwIDIyLjQwNzMgMTAwIDUwLjA0ODFjMCAxNC44NDA1LTYuNDU5MyAyOC4xNzI0LTE2LjcxOTkgMzcuMzM3NS0uMzkwMy4zNDg3LS45ODQuMzI1OC0xLjM1NDItLjA0NDNMMTIuNjU4NyAxOC4wNzRaXCIgLz48L3N2Zz5gLFxuICAgICAgICAgICAgKX1gLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHByb3ZpZGVySWQ6IFwibGluZWFyXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbm5lY3QgeW91ciBMaW5lYXIgYWNjb3VudFwiLFxuICAgICAgfSksXG4gICAgICBjbGllbnRJZDogb3B0aW9ucy5jbGllbnRJZCA/PyBQUk9WSURFUl9DTElFTlRfSURTLmxpbmVhcixcbiAgICAgIGF1dGhvcml6ZVVybDogb3B0aW9ucy5hdXRob3JpemVVcmwgPz8gXCJodHRwczovL2xpbmVhci5vYXV0aC5yYXljYXN0LmNvbS9hdXRob3JpemVcIixcbiAgICAgIHRva2VuVXJsOiBvcHRpb25zLnRva2VuVXJsID8/IFwiaHR0cHM6Ly9saW5lYXIub2F1dGgucmF5Y2FzdC5jb20vdG9rZW5cIixcbiAgICAgIHJlZnJlc2hUb2tlblVybDogb3B0aW9ucy5yZWZyZXNoVG9rZW5VcmwgPz8gXCJodHRwczovL2xpbmVhci5vYXV0aC5yYXljYXN0LmNvbS9yZWZyZXNoLXRva2VuXCIsXG4gICAgICBzY29wZTogb3B0aW9ucy5zY29wZSxcbiAgICAgIGV4dHJhUGFyYW1ldGVyczoge1xuICAgICAgICBhY3RvcjogXCJ1c2VyXCIsXG4gICAgICB9LFxuICAgICAgb25BdXRob3JpemU6IG9wdGlvbnMub25BdXRob3JpemUsXG4gICAgICBib2R5RW5jb2Rpbmc6IG9wdGlvbnMuYm9keUVuY29kaW5nLFxuICAgICAgdG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXIsXG4gICAgICB0b2tlblJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVzcG9uc2VQYXJzZXIsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2xhY2sgT0F1dGggc2VydmljZSBwcm92aWRlZCBvdXQgb2YgdGhlIGJveC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjb25zdCBzbGFjayA9IE9BdXRoU2VydmljZS5zbGFjayh7IHNjb3BlOiAnZW1vamk6cmVhZCcgfSlcbiAgICogYGBgXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNsYWNrKG9wdGlvbnM6IFByb3ZpZGVyV2l0aERlZmF1bHRDbGllbnRPcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBPQXV0aFNlcnZpY2Uoe1xuICAgICAgY2xpZW50OiBuZXcgT0F1dGguUEtDRUNsaWVudCh7XG4gICAgICAgIHJlZGlyZWN0TWV0aG9kOiBPQXV0aC5SZWRpcmVjdE1ldGhvZC5XZWIsXG4gICAgICAgIHByb3ZpZGVyTmFtZTogXCJTbGFja1wiLFxuICAgICAgICBwcm92aWRlckljb246IGBkYXRhOmltYWdlL3N2Zyt4bWwsJHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCI3MyA3MyAxMjQgMTI0XCI+PHN0eWxlPi5zdDB7ZmlsbDojZTAxZTVhfS5zdDF7ZmlsbDojMzZjNWYwfS5zdDJ7ZmlsbDojMmViNjdkfS5zdDN7ZmlsbDojZWNiMjJlfTwvc3R5bGU+PHBhdGggZD1cIk05OS40IDE1MS4yYzAgNy4xLTUuOCAxMi45LTEyLjkgMTIuOS03LjEgMC0xMi45LTUuOC0xMi45LTEyLjkgMC03LjEgNS44LTEyLjkgMTIuOS0xMi45aDEyLjl2MTIuOXpNMTA1LjkgMTUxLjJjMC03LjEgNS44LTEyLjkgMTIuOS0xMi45czEyLjkgNS44IDEyLjkgMTIuOXYzMi4zYzAgNy4xLTUuOCAxMi45LTEyLjkgMTIuOXMtMTIuOS01LjgtMTIuOS0xMi45di0zMi4zelwiIGNsYXNzPVwic3QwXCIvPjxwYXRoIGQ9XCJNMTE4LjggOTkuNGMtNy4xIDAtMTIuOS01LjgtMTIuOS0xMi45IDAtNy4xIDUuOC0xMi45IDEyLjktMTIuOXMxMi45IDUuOCAxMi45IDEyLjl2MTIuOWgtMTIuOXpNMTE4LjggMTA1LjljNy4xIDAgMTIuOSA1LjggMTIuOSAxMi45cy01LjggMTIuOS0xMi45IDEyLjlIODYuNWMtNy4xIDAtMTIuOS01LjgtMTIuOS0xMi45czUuOC0xMi45IDEyLjktMTIuOWgzMi4zelwiIGNsYXNzPVwic3QxXCIvPjxwYXRoIGQ9XCJNMTcwLjYgMTE4LjhjMC03LjEgNS44LTEyLjkgMTIuOS0xMi45IDcuMSAwIDEyLjkgNS44IDEyLjkgMTIuOXMtNS44IDEyLjktMTIuOSAxMi45aC0xMi45di0xMi45ek0xNjQuMSAxMTguOGMwIDcuMS01LjggMTIuOS0xMi45IDEyLjktNy4xIDAtMTIuOS01LjgtMTIuOS0xMi45Vjg2LjVjMC03LjEgNS44LTEyLjkgMTIuOS0xMi45IDcuMSAwIDEyLjkgNS44IDEyLjkgMTIuOXYzMi4zelwiIGNsYXNzPVwic3QyXCIvPjxwYXRoIGQ9XCJNMTUxLjIgMTcwLjZjNy4xIDAgMTIuOSA1LjggMTIuOSAxMi45IDAgNy4xLTUuOCAxMi45LTEyLjkgMTIuOS03LjEgMC0xMi45LTUuOC0xMi45LTEyLjl2LTEyLjloMTIuOXpNMTUxLjIgMTY0LjFjLTcuMSAwLTEyLjktNS44LTEyLjktMTIuOSAwLTcuMSA1LjgtMTIuOSAxMi45LTEyLjloMzIuM2M3LjEgMCAxMi45IDUuOCAxMi45IDEyLjkgMCA3LjEtNS44IDEyLjktMTIuOSAxMi45aC0zMi4zelwiIGNsYXNzPVwic3QzXCIvPjwvc3ZnPmAsXG4gICAgICAgICl9YCxcbiAgICAgICAgcHJvdmlkZXJJZDogXCJzbGFja1wiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJDb25uZWN0IHlvdXIgU2xhY2sgYWNjb3VudFwiLFxuICAgICAgfSksXG4gICAgICBjbGllbnRJZDogb3B0aW9ucy5jbGllbnRJZCA/PyBQUk9WSURFUl9DTElFTlRfSURTLnNsYWNrLFxuICAgICAgYXV0aG9yaXplVXJsOiBvcHRpb25zLmF1dGhvcml6ZVVybCA/PyBcImh0dHBzOi8vc2xhY2sub2F1dGgucmF5Y2FzdC5jb20vYXV0aG9yaXplXCIsXG4gICAgICB0b2tlblVybDogb3B0aW9ucy50b2tlblVybCA/PyBcImh0dHBzOi8vc2xhY2sub2F1dGgucmF5Y2FzdC5jb20vdG9rZW5cIixcbiAgICAgIHJlZnJlc2hUb2tlblVybDogb3B0aW9ucy50b2tlblVybCA/PyBcImh0dHBzOi8vc2xhY2sub2F1dGgucmF5Y2FzdC5jb20vcmVmcmVzaC10b2tlblwiLFxuICAgICAgc2NvcGU6IFwiXCIsXG4gICAgICBleHRyYVBhcmFtZXRlcnM6IHtcbiAgICAgICAgdXNlcl9zY29wZTogb3B0aW9ucy5zY29wZSxcbiAgICAgIH0sXG4gICAgICBwZXJzb25hbEFjY2Vzc1Rva2VuOiBvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW4sXG4gICAgICBib2R5RW5jb2Rpbmc6IG9wdGlvbnMudG9rZW5VcmwgPyBvcHRpb25zLmJvZHlFbmNvZGluZyA/PyBcInVybC1lbmNvZGVkXCIgOiBcImpzb25cIixcbiAgICAgIG9uQXV0aG9yaXplOiBvcHRpb25zLm9uQXV0aG9yaXplLFxuICAgICAgdG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXIsXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgdG9rZW5SZXNwb25zZVBhcnNlcjpcbiAgICAgICAgb3B0aW9ucy50b2tlblJlc3BvbnNlUGFyc2VyID8/XG4gICAgICAgICgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhY2Nlc3NfdG9rZW46IHJlc3BvbnNlLmF1dGhlZF91c2VyLmFjY2Vzc190b2tlbixcbiAgICAgICAgICAgIHNjb3BlOiByZXNwb25zZS5hdXRoZWRfdXNlci5zY29wZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBab29tIE9BdXRoIHNlcnZpY2UgcHJvdmlkZWQgb3V0IG9mIHRoZSBib3guXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY29uc3Qgem9vbSA9IE9BdXRoU2VydmljZS56b29tKHtcbiAgICogICBjbGllbnRJZDogJ2N1c3RvbS1jbGllbnQtaWQnLFxuICAgKiAgIGF1dGhvcml6ZVVybDogJ2h0dHBzOi8vem9vbS51cy9vYXV0aC9hdXRob3JpemUnLFxuICAgKiAgIHRva2VuVXJsOiAnaHR0cHM6Ly96b29tLnVzL29hdXRoL3Rva2VuJyxcbiAgICogICBzY29wZTogJ21lZXRpbmc6d3JpdGUnLFxuICAgKiAgIHBlcnNvbmFsQWNjZXNzVG9rZW46ICdwZXJzb25hbC1hY2Nlc3MtdG9rZW4nLFxuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHpvb20ob3B0aW9uczogUHJvdmlkZXJPcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBPQXV0aFNlcnZpY2Uoe1xuICAgICAgY2xpZW50OiBuZXcgT0F1dGguUEtDRUNsaWVudCh7XG4gICAgICAgIHJlZGlyZWN0TWV0aG9kOiBPQXV0aC5SZWRpcmVjdE1ldGhvZC5XZWIsXG4gICAgICAgIHByb3ZpZGVyTmFtZTogXCJab29tXCIsXG4gICAgICAgIHByb3ZpZGVySWNvbjogYGRhdGE6aW1hZ2Uvc3ZnK3htbCwke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAzNTEuODQ1IDgwXCI+PHBhdGggZD1cIk03My43ODYgNzguODM1SDEwLjg4QTEwLjg0MiAxMC44NDIgMCAwIDEgLjgzMyA3Mi4xMjJhMTAuODQxIDEwLjg0MSAwIDAgMSAyLjM1Ny0xMS44NUw0Ni43NjQgMTYuN2gtMzEuMjNDNi45NTQgMTYuNjk5IDAgOS43NDQgMCAxLjE2NWg1OC4wMTRjNC40MTQgMCA4LjM1NyAyLjYzNCAxMC4wNDYgNi43MTJhMTAuODQzIDEwLjg0MyAwIDAgMS0yLjM1NiAxMS44NUwyMi4xMyA2My4zMDJoMzYuMTIyYzguNTggMCAxNS41MzQgNi45NTUgMTUuNTM0IDE1LjUzNFptMjc4LjA1OS00OC41NDRDMzUxLjg0NSAxMy41ODggMzM4LjI1NiAwIDMyMS41NTMgMGMtOC45MzQgMC0xNi45NzUgMy44OS0yMi41MjQgMTAuMDYzQzI5My40OCAzLjg5IDI4NS40NCAwIDI3Ni41MDUgMGMtMTYuNzAzIDAtMzAuMjkxIDEzLjU4OC0zMC4yOTEgMzAuMjkxdjQ4LjU0NGM4LjU3OSAwIDE1LjUzNC02Ljk1NSAxNS41MzQtMTUuNTM0di0zMy4wMWMwLTguMTM3IDYuNjItMTQuNzU3IDE0Ljc1Ny0xNC43NTdzMTQuNzU3IDYuNjIgMTQuNzU3IDE0Ljc1N3YzMy4wMWMwIDguNTggNi45NTUgMTUuNTM0IDE1LjUzNCAxNS41MzRWMzAuMjkxYzAtOC4xMzcgNi42Mi0xNC43NTcgMTQuNzU3LTE0Ljc1N3MxNC43NTggNi42MiAxNC43NTggMTQuNzU3djMzLjAxYzAgOC41OCA2Ljk1NCAxNS41MzQgMTUuNTM0IDE1LjUzNFYzMC4yOTFaTTIzOC40NDcgNDBjMCAyMi4wOTEtMTcuOTA5IDQwLTQwIDQwcy00MC0xNy45MDktNDAtNDAgMTcuOTA4LTQwIDQwLTQwIDQwIDE3LjkwOSA0MCA0MFptLTE1LjUzNCAwYzAtMTMuNTEyLTEwLjk1NC0yNC40NjYtMjQuNDY2LTI0LjQ2NlMxNzMuOTggMjYuNDg4IDE3My45OCA0MHMxMC45NTMgMjQuNDY2IDI0LjQ2NiAyNC40NjZTMjIyLjkxMyA1My41MTIgMjIyLjkxMyA0MFptLTcwLjY4IDBjMCAyMi4wOTEtMTcuOTA5IDQwLTQwIDQwcy00MC0xNy45MDktNDAtNDAgMTcuOTA5LTQwIDQwLTQwIDQwIDE3LjkwOSA0MCA0MFptLTE1LjUzNCAwYzAtMTMuNTEyLTEwLjk1NC0yNC40NjYtMjQuNDY2LTI0LjQ2NlM4Ny43NjcgMjYuNDg4IDg3Ljc2NyA0MHMxMC45NTQgMjQuNDY2IDI0LjQ2NiAyNC40NjZTMTM2LjY5OSA1My41MTIgMTM2LjY5OSA0MFpcIiBzdHlsZT1cImZpbGw6IzBiNWNmZlwiLz48L3N2Zz5gLFxuICAgICAgICApfWAsXG4gICAgICAgIHByb3ZpZGVySWQ6IFwiem9vbVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJDb25uZWN0IHlvdXIgWm9vbSBhY2NvdW50XCIsXG4gICAgICB9KSxcbiAgICAgIGNsaWVudElkOiBvcHRpb25zLmNsaWVudElkLFxuICAgICAgYXV0aG9yaXplVXJsOiBvcHRpb25zLmF1dGhvcml6ZVVybCA/PyBcImh0dHBzOi8vem9vbS51cy9vYXV0aC9hdXRob3JpemVcIixcbiAgICAgIHRva2VuVXJsOiBvcHRpb25zLnRva2VuVXJsID8/IFwiaHR0cHM6Ly96b29tLnVzL29hdXRoL3Rva2VuXCIsXG4gICAgICByZWZyZXNoVG9rZW5Vcmw6IG9wdGlvbnMucmVmcmVzaFRva2VuVXJsLFxuICAgICAgc2NvcGU6IG9wdGlvbnMuc2NvcGUsXG4gICAgICBwZXJzb25hbEFjY2Vzc1Rva2VuOiBvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW4sXG4gICAgICBib2R5RW5jb2Rpbmc6IG9wdGlvbnMuYm9keUVuY29kaW5nID8/IFwidXJsLWVuY29kZWRcIixcbiAgICAgIG9uQXV0aG9yaXplOiBvcHRpb25zLm9uQXV0aG9yaXplLFxuICAgICAgdG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXI6IG9wdGlvbnMudG9rZW5SZWZyZXNoUmVzcG9uc2VQYXJzZXIsXG4gICAgICB0b2tlblJlc3BvbnNlUGFyc2VyOiBvcHRpb25zLnRva2VuUmVzcG9uc2VQYXJzZXIsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhdGVzIHRoZSBPQXV0aCBhdXRob3JpemF0aW9uIHByb2Nlc3Mgb3IgcmVmcmVzaGVzIGV4aXN0aW5nIHRva2VucyBpZiBuZWNlc3NhcnkuXG4gICAqIElmIHRoZSBjdXJyZW50IHRva2VuIHNldCBoYXMgYSByZWZyZXNoIHRva2VuIGFuZCBpdCBpcyBleHBpcmVkLCB0aGVuIHRoZSBmdW5jdGlvbiB3aWxsIHJlZnJlc2ggdGhlIHRva2Vucy5cbiAgICogSWYgbm8gdG9rZW5zIGV4aXN0LCBpdCB3aWxsIGluaXRpYXRlIHRoZSBPQXV0aCBhdXRob3JpemF0aW9uIHByb2Nlc3MgYW5kIGZldGNoIHRoZSB0b2tlbnMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGFjY2VzcyB0b2tlbiBvYnRhaW5lZCBmcm9tIHRoZSBhdXRob3JpemF0aW9uIGZsb3csIG9yIG51bGwgaWYgdGhlIHRva2VuIGNvdWxkIG5vdCBiZSBvYnRhaW5lZC5cbiAgICovXG4gIGFzeW5jIGF1dGhvcml6ZSgpIHtcbiAgICBjb25zdCBjdXJyZW50VG9rZW5TZXQgPSBhd2FpdCB0aGlzLmNsaWVudC5nZXRUb2tlbnMoKTtcbiAgICBpZiAoY3VycmVudFRva2VuU2V0Py5hY2Nlc3NUb2tlbikge1xuICAgICAgaWYgKGN1cnJlbnRUb2tlblNldC5yZWZyZXNoVG9rZW4gJiYgY3VycmVudFRva2VuU2V0LmlzRXhwaXJlZCgpKSB7XG4gICAgICAgIGNvbnN0IHRva2VucyA9IGF3YWl0IHRoaXMucmVmcmVzaFRva2Vucyh7XG4gICAgICAgICAgdG9rZW46IGN1cnJlbnRUb2tlblNldC5yZWZyZXNoVG9rZW4sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEluIHRoZSBjYXNlIHdoZXJlIHRoZSByZWZyZXNoIHRva2VuIGZsb3dzIGZhaWxzLCBub3RoaW5nIGlzIHJldHVybmVkIGFuZCB0aGUgYXV0aG9yaXplIGZ1bmN0aW9uIGlzIGNhbGxlZCBhZ2Fpbi5cbiAgICAgICAgaWYgKHRva2Vucykge1xuICAgICAgICAgIGF3YWl0IHRoaXMuY2xpZW50LnNldFRva2Vucyh0b2tlbnMpO1xuICAgICAgICAgIHJldHVybiB0b2tlbnMuYWNjZXNzX3Rva2VuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VycmVudFRva2VuU2V0LmFjY2Vzc1Rva2VuO1xuICAgIH1cblxuICAgIGNvbnN0IGF1dGhSZXF1ZXN0ID0gYXdhaXQgdGhpcy5jbGllbnQuYXV0aG9yaXphdGlvblJlcXVlc3Qoe1xuICAgICAgZW5kcG9pbnQ6IHRoaXMuYXV0aG9yaXplVXJsLFxuICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICBzY29wZTogdGhpcy5zY29wZSxcbiAgICAgIGV4dHJhUGFyYW1ldGVyczogdGhpcy5leHRyYVBhcmFtZXRlcnMsXG4gICAgfSk7XG5cbiAgICBjb25zdCB7IGF1dGhvcml6YXRpb25Db2RlIH0gPSBhd2FpdCB0aGlzLmNsaWVudC5hdXRob3JpemUoYXV0aFJlcXVlc3QpO1xuICAgIGNvbnN0IHRva2VucyA9IGF3YWl0IHRoaXMuZmV0Y2hUb2tlbnMoe1xuICAgICAgYXV0aFJlcXVlc3QsXG4gICAgICBhdXRob3JpemF0aW9uQ29kZSxcbiAgICB9KTtcblxuICAgIGF3YWl0IHRoaXMuY2xpZW50LnNldFRva2Vucyh0b2tlbnMpO1xuXG4gICAgcmV0dXJuIHRva2Vucy5hY2Nlc3NfdG9rZW47XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGZldGNoVG9rZW5zKHtcbiAgICBhdXRoUmVxdWVzdCxcbiAgICBhdXRob3JpemF0aW9uQ29kZSxcbiAgfToge1xuICAgIGF1dGhSZXF1ZXN0OiBPQXV0aC5BdXRob3JpemF0aW9uUmVxdWVzdDtcbiAgICBhdXRob3JpemF0aW9uQ29kZTogc3RyaW5nO1xuICB9KSB7XG4gICAgbGV0IG9wdGlvbnM7XG4gICAgaWYgKHRoaXMuYm9keUVuY29kaW5nID09PSBcInVybC1lbmNvZGVkXCIpIHtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcbiAgICAgIHBhcmFtcy5hcHBlbmQoXCJjbGllbnRfaWRcIiwgdGhpcy5jbGllbnRJZCk7XG4gICAgICBwYXJhbXMuYXBwZW5kKFwiY29kZVwiLCBhdXRob3JpemF0aW9uQ29kZSk7XG4gICAgICBwYXJhbXMuYXBwZW5kKFwiY29kZV92ZXJpZmllclwiLCBhdXRoUmVxdWVzdC5jb2RlVmVyaWZpZXIpO1xuICAgICAgcGFyYW1zLmFwcGVuZChcImdyYW50X3R5cGVcIiwgXCJhdXRob3JpemF0aW9uX2NvZGVcIik7XG4gICAgICBwYXJhbXMuYXBwZW5kKFwicmVkaXJlY3RfdXJpXCIsIGF1dGhSZXF1ZXN0LnJlZGlyZWN0VVJJKTtcblxuICAgICAgb3B0aW9ucyA9IHsgYm9keTogcGFyYW1zIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBjbGllbnRfaWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICAgICAgY29kZTogYXV0aG9yaXphdGlvbkNvZGUsXG4gICAgICAgICAgY29kZV92ZXJpZmllcjogYXV0aFJlcXVlc3QuY29kZVZlcmlmaWVyLFxuICAgICAgICAgIGdyYW50X3R5cGU6IFwiYXV0aG9yaXphdGlvbl9jb2RlXCIsXG4gICAgICAgICAgcmVkaXJlY3RfdXJpOiBhdXRoUmVxdWVzdC5yZWRpcmVjdFVSSSxcbiAgICAgICAgfSksXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh0aGlzLnRva2VuVXJsLCB7IG1ldGhvZDogXCJQT1NUXCIsIC4uLm9wdGlvbnMgfSk7XG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgY29uc3QgcmVzcG9uc2VUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgY29uc29sZS5lcnJvcihcImZldGNoIHRva2VucyBlcnJvcjpcIiwgcmVzcG9uc2VUZXh0KTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3Igd2hpbGUgZmV0Y2hpbmcgdG9rZW5zOiAke3Jlc3BvbnNlLnN0YXR1c30gKCR7cmVzcG9uc2Uuc3RhdHVzVGV4dH0pXFxuJHtyZXNwb25zZVRleHR9YCk7XG4gICAgfVxuICAgIGNvbnN0IHRva2VucyA9IHRoaXMudG9rZW5SZXNwb25zZVBhcnNlcihhd2FpdCByZXNwb25zZS5qc29uKCkpO1xuXG4gICAgLy8gU29tZSBjbGllbnRzIHN1Y2ggYXMgTGluZWFyIGNhbiByZXR1cm4gYSBzY29wZSBhcnJheSBpbnN0ZWFkIG9mIGEgc3RyaW5nXG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodG9rZW5zLnNjb3BlKSA/IHsgLi4udG9rZW5zLCBzY29wZTogdG9rZW5zLnNjb3BlLmpvaW4oXCIgXCIpIH0gOiB0b2tlbnM7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHJlZnJlc2hUb2tlbnMoeyB0b2tlbiB9OiB7IHRva2VuOiBzdHJpbmcgfSkge1xuICAgIGxldCBvcHRpb25zO1xuICAgIGlmICh0aGlzLmJvZHlFbmNvZGluZyA9PT0gXCJ1cmwtZW5jb2RlZFwiKSB7XG4gICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG4gICAgICBwYXJhbXMuYXBwZW5kKFwiY2xpZW50X2lkXCIsIHRoaXMuY2xpZW50SWQpO1xuICAgICAgcGFyYW1zLmFwcGVuZChcInJlZnJlc2hfdG9rZW5cIiwgdG9rZW4pO1xuICAgICAgcGFyYW1zLmFwcGVuZChcImdyYW50X3R5cGVcIiwgXCJyZWZyZXNoX3Rva2VuXCIpO1xuXG4gICAgICBvcHRpb25zID0geyBib2R5OiBwYXJhbXMgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIGNsaWVudF9pZDogdGhpcy5jbGllbnRJZCxcbiAgICAgICAgICByZWZyZXNoX3Rva2VuOiB0b2tlbixcbiAgICAgICAgICBncmFudF90eXBlOiBcInJlZnJlc2hfdG9rZW5cIixcbiAgICAgICAgfSksXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh0aGlzLnJlZnJlc2hUb2tlblVybCA/PyB0aGlzLnRva2VuVXJsLCB7IG1ldGhvZDogXCJQT1NUXCIsIC4uLm9wdGlvbnMgfSk7XG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgY29uc3QgcmVzcG9uc2VUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgY29uc29sZS5lcnJvcihcInJlZnJlc2ggdG9rZW5zIGVycm9yOlwiLCByZXNwb25zZVRleHQpO1xuICAgICAgLy8gSWYgdGhlIHJlZnJlc2ggdG9rZW4gaXMgaW52YWxpZCwgc3RvcCB0aGUgZmxvdyBoZXJlLCBsb2cgb3V0IHRoZSB1c2VyIGFuZCBwcm9tcHQgdGhlbSB0byByZS1hdXRob3JpemUuXG4gICAgICB0aGlzLmNsaWVudC5kZXNjcmlwdGlvbiA9IGAke3RoaXMuY2xpZW50LnByb3ZpZGVyTmFtZX0gbmVlZHMgeW91IHRvIHNpZ24taW4gYWdhaW4uIFByZXNzIOKPjiBvciBjbGljayB0aGUgYnV0dG9uIGJlbG93IHRvIGNvbnRpbnVlLmA7XG4gICAgICBhd2FpdCB0aGlzLmNsaWVudC5yZW1vdmVUb2tlbnMoKTtcbiAgICAgIGF3YWl0IHRoaXMuYXV0aG9yaXplKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHRva2VuUmVzcG9uc2UgPSB0aGlzLnRva2VuUmVmcmVzaFJlc3BvbnNlUGFyc2VyKGF3YWl0IHJlc3BvbnNlLmpzb24oKSk7XG4gICAgICB0b2tlblJlc3BvbnNlLnJlZnJlc2hfdG9rZW4gPSB0b2tlblJlc3BvbnNlLnJlZnJlc2hfdG9rZW4gPz8gdG9rZW47XG4gICAgICByZXR1cm4gdG9rZW5SZXNwb25zZTtcbiAgICB9XG4gIH1cbn1cbiIsICJleHBvcnQgY29uc3QgUFJPVklERVJfQ0xJRU5UX0lEUyA9IHtcbiAgYXNhbmE6IFwiMTE5MTIwMTc0NTY4NDMxMlwiLFxuICBnaXRodWI6IFwiNzIzNWZlOGQ0MjE1N2YxZjM4YzBcIixcbiAgbGluZWFyOiBcImM4ZmYzN2I5MjI1YzNjOWFlZmQ3ZDY2ZWEwZTViNmYxXCIsXG4gIHNsYWNrOiBcIjg1MTc1Njg4NDY5Mi41NTQ2OTI3MjkwMjEyXCIsXG59O1xuIiwgImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGVudmlyb25tZW50LCBPQXV0aCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB0eXBlIHsgT0F1dGhUeXBlLCBPbkF1dGhvcml6ZVBhcmFtcyB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmxldCB0b2tlbjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5sZXQgdHlwZTogT0F1dGhUeXBlIHwgbnVsbCA9IG51bGw7XG5sZXQgYXV0aG9yaXplOiBQcm9taXNlPHN0cmluZz4gfCBudWxsID0gbnVsbDtcbmxldCBnZXRJZFRva2VuOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4gfCBudWxsID0gbnVsbDtcbmxldCBvbkF1dGhvcml6ZTogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xuXG50eXBlIFdpdGhBY2Nlc3NUb2tlblBhcmFtZXRlcnMgPSB7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBpbnN0YW5jZSBvZiBhIFBLQ0UgQ2xpZW50IHRoYXQgeW91IGNhbiBjcmVhdGUgdXNpbmcgUmF5Y2FzdCBBUEkuXG4gICAqIFRoaXMgY2xpZW50IGlzIHVzZWQgdG8gcmV0dXJuIHRoZSBgaWRUb2tlbmAgYXMgcGFydCBvZiB0aGUgYG9uQXV0aG9yaXplYCBjYWxsYmFjay5cbiAgICovXG4gIGNsaWVudD86IE9BdXRoLlBLQ0VDbGllbnQ7XG4gIC8qKlxuICAgKiBBIGZ1bmN0aW9uIHRoYXQgaW5pdGlhdGVzIHRoZSBPQXV0aCB0b2tlbiByZXRyaWV2YWwgcHJvY2Vzc1xuICAgKiBAcmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBhY2Nlc3MgdG9rZW4uXG4gICAqL1xuICBhdXRob3JpemU6ICgpID0+IFByb21pc2U8c3RyaW5nPjtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbmFsIHN0cmluZyB0aGF0IHJlcHJlc2VudHMgYW4gYWxyZWFkeSBvYnRhaW5lZCBwZXJzb25hbCBhY2Nlc3MgdG9rZW5cbiAgICovXG4gIHBlcnNvbmFsQWNjZXNzVG9rZW4/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCBvbmNlIHRoZSB1c2VyIGhhcyBiZWVuIHByb3Blcmx5IGxvZ2dlZCBpbiB0aHJvdWdoIE9BdXRoLlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIC0gUGFyYW1ldGVycyBvZiB0aGUgY2FsbGJhY2tcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudG9rZW4gLSBUaGUgcmV0cmlldmVkIGFjY2VzcyB0b2tlblxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy50eXBlIC0gVGhlIGFjY2VzcyB0b2tlbidzIHR5cGUgKGVpdGhlciBgb2F1dGhgIG9yIGBwZXJzb25hbGApXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmlkVG9rZW4gLSBUaGUgb3B0aW9uYWwgaWQgdG9rZW4uIFRoZSBgaWRUb2tlbmAgaXMgcmV0dXJuZWQgaWYgYG9wdGlvbnMuY2xpZW50YCBpcyBwcm92aWRlZCBhbmQgaWYgaXQncyByZXR1cm5lZCBpbiB0aGUgaW5pdGlhbCB0b2tlbiBzZXQuXG4gICAqL1xuICBvbkF1dGhvcml6ZT86IChwYXJhbXM6IE9uQXV0aG9yaXplUGFyYW1zKSA9PiB2b2lkO1xufTtcblxuLyoqXG4gKiBUaGUgY29tcG9uZW50IChmb3IgYSB2aWV3L21lbnUtYmFyIGNvbW1hbmRzKSBvciBmdW5jdGlvbiAoZm9yIGEgbm8tdmlldyBjb21tYW5kKSB0aGF0IGlzIHBhc3NlZCB0byB3aXRoQWNjZXNzVG9rZW4uXG4gKi9cbmV4cG9ydCB0eXBlIFdpdGhBY2Nlc3NUb2tlbkNvbXBvbmVudE9yRm48VCA9IGFueSwgVSA9IGFueT4gPSAoKHBhcmFtczogVCkgPT4gUHJvbWlzZTxVPiB8IFUpIHwgUmVhY3QuQ29tcG9uZW50VHlwZTxUPjtcblxuLyoqXG4gKiBIaWdoZXItb3JkZXIgY29tcG9uZW50IHRvIHdyYXAgYSBnaXZlbiBjb21wb25lbnQgb3IgZnVuY3Rpb24gYW5kIHNldCBhbiBhY2Nlc3MgdG9rZW4gaW4gYSBzaGFyZWQgZ2xvYmFsIHZhcmlhYmxlLlxuICpcbiAqIFRoZSBmdW5jdGlvbiBpbnRlcmNlcHRzIHRoZSBjb21wb25lbnQgcmVuZGVyaW5nIHByb2Nlc3MgdG8gZWl0aGVyIGZldGNoIGFuIE9BdXRoIHRva2VuIGFzeW5jaHJvbm91c2x5XG4gKiBvciB1c2UgYSBwcm92aWRlZCBwZXJzb25hbCBhY2Nlc3MgdG9rZW4uIEEgZ2xvYmFsIHZhcmlhYmxlIHdpbGwgYmUgdGhlbiBzZXQgd2l0aCB0aGUgcmVjZWl2ZWQgdG9rZW5cbiAqIHRoYXQgeW91IGNhbiBnZXQgd2l0aCB0aGUgYGdldEFjY2Vzc1Rva2VuYCBmdW5jdGlvbi5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgRGV0YWlsIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgT0F1dGhTZXJ2aWNlLCBnZXRBY2Nlc3NUb2tlbiwgd2l0aEFjY2Vzc1Rva2VuIH0gZnJvbSBcIkByYXljYXN0L3V0aWxzXCI7XG4gKlxuICogY29uc3QgZ2l0aHViID0gT0F1dGhTZXJ2aWNlLmdpdGh1Yih7IHNjb3BlOiBcIm5vdGlmaWNhdGlvbnMgcmVwbyByZWFkOm9yZyByZWFkOnVzZXIgcmVhZDpwcm9qZWN0XCIgfSk7XG4gKlxuICogZnVuY3Rpb24gQXV0aG9yaXplZENvbXBvbmVudCgpIHtcbiAqICBjb25zdCB7IHRva2VuIH0gPSBnZXRBY2Nlc3NUb2tlbigpO1xuICogIC4uLlxuICogfVxuICpcbiAqIGV4cG9ydCBkZWZhdWx0IHdpdGhBY2Nlc3NUb2tlbihnaXRodWIpKEF1dGhvcml6ZWRDb21wb25lbnQpO1xuICogYGBgXG4gKlxuICogQHJldHVybnMge1JlYWN0LkNvbXBvbmVudFR5cGU8VD59IFRoZSB3cmFwcGVkIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhBY2Nlc3NUb2tlbjxUID0gYW55LCBVID0gYW55PihcbiAgb3B0aW9uczogV2l0aEFjY2Vzc1Rva2VuUGFyYW1ldGVycyxcbik6IDxWIGV4dGVuZHMgV2l0aEFjY2Vzc1Rva2VuQ29tcG9uZW50T3JGbjxULCBVPj4oXG4gIGZuT3JDb21wb25lbnQ6IFYsXG4pID0+IFYgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnRUeXBlPFQ+ID8gUmVhY3QuRnVuY3Rpb25Db21wb25lbnQ8VD4gOiAocHJvcHM6IFQpID0+IFByb21pc2U8VT47XG5leHBvcnQgZnVuY3Rpb24gd2l0aEFjY2Vzc1Rva2VuPFQ+KG9wdGlvbnM6IFdpdGhBY2Nlc3NUb2tlblBhcmFtZXRlcnMpIHtcbiAgaWYgKGVudmlyb25tZW50LmNvbW1hbmRNb2RlID09PSBcIm5vLXZpZXdcIikge1xuICAgIHJldHVybiAoZm46IChwcm9wczogVCkgPT4gUHJvbWlzZTx2b2lkPiB8ICgoKSA9PiB2b2lkKSkgPT4ge1xuICAgICAgY29uc3Qgbm9WaWV3Rm4gPSBhc3luYyAocHJvcHM6IFQpID0+IHtcbiAgICAgICAgaWYgKCF0b2tlbikge1xuICAgICAgICAgIHRva2VuID0gb3B0aW9ucy5wZXJzb25hbEFjY2Vzc1Rva2VuID8/IChhd2FpdCBvcHRpb25zLmF1dGhvcml6ZSgpKTtcbiAgICAgICAgICB0eXBlID0gb3B0aW9ucy5wZXJzb25hbEFjY2Vzc1Rva2VuID8gXCJwZXJzb25hbFwiIDogXCJvYXV0aFwiO1xuICAgICAgICAgIGNvbnN0IGlkVG9rZW4gPSAoYXdhaXQgb3B0aW9ucy5jbGllbnQ/LmdldFRva2VucygpKT8uaWRUb2tlbjtcblxuICAgICAgICAgIGlmIChvcHRpb25zLm9uQXV0aG9yaXplKSB7XG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLnJlc29sdmUob3B0aW9ucy5vbkF1dGhvcml6ZSh7IHRva2VuLCB0eXBlLCBpZFRva2VuIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm4ocHJvcHMpO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIG5vVmlld0ZuO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gKENvbXBvbmVudDogUmVhY3QuQ29tcG9uZW50VHlwZTxUPikgPT4ge1xuICAgIGNvbnN0IFdyYXBwZWRDb21wb25lbnQ6IFJlYWN0LkNvbXBvbmVudFR5cGU8VD4gPSAocHJvcHMpID0+IHtcbiAgICAgIGlmIChvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW4pIHtcbiAgICAgICAgdG9rZW4gPSBvcHRpb25zLnBlcnNvbmFsQWNjZXNzVG9rZW47XG4gICAgICAgIHR5cGUgPSBcInBlcnNvbmFsXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIWF1dGhvcml6ZSkge1xuICAgICAgICAgIGF1dGhvcml6ZSA9IG9wdGlvbnMuYXV0aG9yaXplKCk7XG4gICAgICAgIH1cbiAgICAgICAgdG9rZW4gPSBSZWFjdC51c2UoYXV0aG9yaXplKTtcbiAgICAgICAgdHlwZSA9IFwib2F1dGhcIjtcbiAgICAgIH1cblxuICAgICAgbGV0IGlkVG9rZW46IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgIGlmIChvcHRpb25zLmNsaWVudCkge1xuICAgICAgICBpZiAoIWdldElkVG9rZW4pIHtcbiAgICAgICAgICBnZXRJZFRva2VuID0gb3B0aW9ucy5jbGllbnQ/LmdldFRva2VucygpLnRoZW4oKHRva2VucykgPT4gdG9rZW5zPy5pZFRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBpZFRva2VuID0gUmVhY3QudXNlKGdldElkVG9rZW4pO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5vbkF1dGhvcml6ZSkge1xuICAgICAgICBpZiAoIW9uQXV0aG9yaXplKSB7XG4gICAgICAgICAgb25BdXRob3JpemUgPSBQcm9taXNlLnJlc29sdmUob3B0aW9ucy5vbkF1dGhvcml6ZSh7IHRva2VuOiB0b2tlbiEsIHR5cGUsIGlkVG9rZW4gfSkpO1xuICAgICAgICB9XG4gICAgICAgIFJlYWN0LnVzZShvbkF1dGhvcml6ZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAgIC8vIEB0cy1pZ25vcmUgdG9vIGNvbXBsaWNhdGVkIGZvciBUU1xuICAgICAgcmV0dXJuIDxDb21wb25lbnQgey4uLnByb3BzfSAvPjtcbiAgICB9O1xuXG4gICAgV3JhcHBlZENvbXBvbmVudC5kaXNwbGF5TmFtZSA9IGB3aXRoQWNjZXNzVG9rZW4oJHtDb21wb25lbnQuZGlzcGxheU5hbWUgfHwgQ29tcG9uZW50Lm5hbWV9KWA7XG5cbiAgICByZXR1cm4gV3JhcHBlZENvbXBvbmVudDtcbiAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBhY2Nlc3MgdG9rZW4gYW5kIGl0cyB0eXBlLiBOb3RlIHRoYXQgdGhpcyBmdW5jdGlvbiBtdXN0IGJlIGNhbGxlZCBpbiBhIGNvbXBvbmVudCB3cmFwcGVkIHdpdGggYHdpdGhBY2Nlc3NUb2tlbmAuXG4gKlxuICogV2lsbCB0aHJvdyBhbiBFcnJvciBpZiBjYWxsZWQgb3V0c2lkZSBvZiBhIGZ1bmN0aW9uIG9yIGNvbXBvbmVudCB3cmFwcGVkIHdpdGggYHdpdGhBY2Nlc3NUb2tlbmBcbiAqXG4gKiBAcmV0dXJucyB7eyB0b2tlbjogc3RyaW5nLCB0eXBlOiBcIm9hdXRoXCIgfCBcInBlcnNvbmFsXCIgfX0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGB0b2tlbmBcbiAqIGFuZCBpdHMgYHR5cGVgLCB3aGVyZSB0eXBlIGNhbiBiZSBlaXRoZXIgJ29hdXRoJyBmb3IgT0F1dGggdG9rZW5zIG9yICdwZXJzb25hbCcgZm9yIGFcbiAqIHBlcnNvbmFsIGFjY2VzcyB0b2tlbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFjY2Vzc1Rva2VuKCk6IHtcbiAgdG9rZW46IHN0cmluZztcbiAgLyoqIGBvYXV0aGAgZm9yIE9BdXRoIHRva2VucyBvciBgcGVyc29uYWxgIGZvciBwZXJzb25hbCBhY2Nlc3MgdG9rZW4gKi9cbiAgdHlwZTogXCJvYXV0aFwiIHwgXCJwZXJzb25hbFwiO1xufSB7XG4gIGlmICghdG9rZW4gfHwgIXR5cGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJnZXRBY2Nlc3NUb2tlbiBtdXN0IGJlIHVzZWQgd2hlbiBhdXRoZW50aWNhdGVkIChlZy4gdXNlZCBpbnNpZGUgYHdpdGhBY2Nlc3NUb2tlbmApXCIpO1xuICB9XG5cbiAgcmV0dXJuIHsgdG9rZW4sIHR5cGUgfTtcbn1cbiIsICJpbXBvcnQgeyBlbnZpcm9ubWVudCwgTGF1bmNoUHJvcHMsIExhdW5jaFR5cGUgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgZnMgZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcblxuZXhwb3J0IGVudW0gRGVlcGxpbmtUeXBlIHtcbiAgLyoqIEEgc2NyaXB0IGNvbW1hbmQgKi9cbiAgU2NyaXB0Q29tbWFuZCA9IFwic2NyaXB0LWNvbW1hbmRcIixcbiAgLyoqIEFuIGV4dGVuc2lvbiBjb21tYW5kICovXG4gIEV4dGVuc2lvbiA9IFwiZXh0ZW5zaW9uXCIsXG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgY3JlYXRpbmcgYSBkZWVwbGluayB0byBhIHNjcmlwdCBjb21tYW5kLlxuICovXG5leHBvcnQgdHlwZSBDcmVhdGVTY3JpcHRDb21tYW5kRGVlcGxpbmtPcHRpb25zID0ge1xuICAvKipcbiAgICogVGhlIHR5cGUgb2YgZGVlcGxpbmssIHdoaWNoIHNob3VsZCBiZSBcInNjcmlwdC1jb21tYW5kXCIuXG4gICAqL1xuICB0eXBlOiBEZWVwbGlua1R5cGUuU2NyaXB0Q29tbWFuZDtcbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBjb21tYW5kLlxuICAgKi9cbiAgY29tbWFuZDogc3RyaW5nO1xuICAvKipcbiAgICogSWYgdGhlIGNvbW1hbmQgYWNjZXB0cyBhcmd1bWVudHMsIHRoZXkgY2FuIGJlIHBhc3NlZCB1c2luZyB0aGlzIHF1ZXJ5IHBhcmFtZXRlci5cbiAgICovXG4gIGFyZ3VtZW50cz86IHN0cmluZ1tdO1xufTtcblxuLyoqXG4gKiBCYXNlIG9wdGlvbnMgZm9yIGNyZWF0aW5nIGEgZGVlcGxpbmsgdG8gYW4gZXh0ZW5zaW9uLlxuICovXG5leHBvcnQgdHlwZSBDcmVhdGVFeHRlbnNpb25EZWVwbGlua0Jhc2VPcHRpb25zID0ge1xuICAvKipcbiAgICogVGhlIHR5cGUgb2YgZGVlcGxpbmssIHdoaWNoIHNob3VsZCBiZSBcImV4dGVuc2lvblwiLlxuICAgKi9cbiAgdHlwZT86IERlZXBsaW5rVHlwZS5FeHRlbnNpb247XG4gIC8qKlxuICAgKiBUaGUgY29tbWFuZCBhc3NvY2lhdGVkIHdpdGggdGhlIGV4dGVuc2lvbi5cbiAgICovXG4gIGNvbW1hbmQ6IHN0cmluZztcbiAgLyoqXG4gICAqIEVpdGhlciBcInVzZXJJbml0aWF0ZWRcIiwgd2hpY2ggcnVucyB0aGUgY29tbWFuZCBpbiB0aGUgZm9yZWdyb3VuZCwgb3IgXCJiYWNrZ3JvdW5kXCIsIHdoaWNoIHNraXBzIGJyaW5naW5nIFJheWNhc3QgdG8gdGhlIGZyb250LlxuICAgKi9cbiAgbGF1bmNoVHlwZT86IExhdW5jaFR5cGU7XG4gIC8qKlxuICAgKiBJZiB0aGUgY29tbWFuZCBhY2NlcHRzIGFyZ3VtZW50cywgdGhleSBjYW4gYmUgcGFzc2VkIHVzaW5nIHRoaXMgcXVlcnkgcGFyYW1ldGVyLlxuICAgKi9cbiAgYXJndW1lbnRzPzogTGF1bmNoUHJvcHNbXCJhcmd1bWVudHNcIl07XG4gIC8qKlxuICAgKiBJZiB0aGUgY29tbWFuZCBtYWtlIHVzZSBvZiBMYXVuY2hDb250ZXh0LCBpdCBjYW4gYmUgcGFzc2VkIHVzaW5nIHRoaXMgcXVlcnkgcGFyYW1ldGVyLlxuICAgKi9cbiAgY29udGV4dD86IExhdW5jaFByb3BzW1wibGF1bmNoQ29udGV4dFwiXTtcbiAgLyoqXG4gICAqIFNvbWUgdGV4dCB0byBwcmVmaWxsIHRoZSBzZWFyY2ggYmFyIG9yIGZpcnN0IHRleHQgaW5wdXQgb2YgdGhlIGNvbW1hbmRcbiAgICovXG4gIGZhbGxiYWNrVGV4dD86IHN0cmluZztcbn07XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgY3JlYXRpbmcgYSBkZWVwbGluayB0byBhbiBleHRlbnNpb24gZnJvbSBhbm90aGVyIGV4dGVuc2lvbi5cbiAqIFJlcXVpcmVzIGJvdGggdGhlIG93bmVyT3JBdXRob3JOYW1lIGFuZCBleHRlbnNpb25OYW1lLlxuICovXG5leHBvcnQgdHlwZSBDcmVhdGVJbnRlckV4dGVuc2lvbkRlZXBsaW5rT3B0aW9ucyA9IENyZWF0ZUV4dGVuc2lvbkRlZXBsaW5rQmFzZU9wdGlvbnMgJiB7XG4gIC8qKlxuICAgKiBUaGUgbmFtZSBvZiB0aGUgb3duZXIgb3IgYXV0aG9yIG9mIHRoZSBleHRlbnNpb24uXG4gICAqL1xuICBvd25lck9yQXV0aG9yTmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIGV4dGVuc2lvbi5cbiAgICovXG4gIGV4dGVuc2lvbk5hbWU6IHN0cmluZztcbn07XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgY3JlYXRpbmcgYSBkZWVwbGluayB0byBhbiBleHRlbnNpb24uXG4gKi9cbmV4cG9ydCB0eXBlIENyZWF0ZUV4dGVuc2lvbkRlZXBsaW5rT3B0aW9ucyA9IENyZWF0ZUludGVyRXh0ZW5zaW9uRGVlcGxpbmtPcHRpb25zIHwgQ3JlYXRlRXh0ZW5zaW9uRGVlcGxpbmtCYXNlT3B0aW9ucztcblxuLyoqXG4gKiBPcHRpb25zIGZvciBjcmVhdGluZyBhIGRlZXBsaW5rLlxuICovXG5leHBvcnQgdHlwZSBDcmVhdGVEZWVwbGlua09wdGlvbnMgPSBDcmVhdGVTY3JpcHRDb21tYW5kRGVlcGxpbmtPcHRpb25zIHwgQ3JlYXRlRXh0ZW5zaW9uRGVlcGxpbmtPcHRpb25zO1xuXG5mdW5jdGlvbiBnZXRQcm90b2NvbCgpIHtcbiAgcmV0dXJuIGVudmlyb25tZW50LnJheWNhc3RWZXJzaW9uLmluY2x1ZGVzKFwiYWxwaGFcIikgPyBcInJheWNhc3RpbnRlcm5hbDovL1wiIDogXCJyYXljYXN0Oi8vXCI7XG59XG5cbmZ1bmN0aW9uIGdldE93bmVyT3JBdXRob3JOYW1lKCkge1xuICBjb25zdCBwYWNrYWdlSlNPTiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihlbnZpcm9ubWVudC5hc3NldHNQYXRoLCBcIi4uXCIsIFwicGFja2FnZS5qc29uXCIpLCBcInV0ZjhcIikpO1xuICByZXR1cm4gcGFja2FnZUpTT04ub3duZXIgfHwgcGFja2FnZUpTT04uYXV0aG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2NyaXB0Q29tbWFuZERlZXBsaW5rKG9wdGlvbnM6IENyZWF0ZVNjcmlwdENvbW1hbmREZWVwbGlua09wdGlvbnMpOiBzdHJpbmcge1xuICBsZXQgdXJsID0gYCR7Z2V0UHJvdG9jb2woKX1zY3JpcHQtY29tbWFuZHMvJHtvcHRpb25zLmNvbW1hbmR9YDtcblxuICBpZiAob3B0aW9ucy5hcmd1bWVudHMpIHtcbiAgICBsZXQgcGFyYW1zID0gXCJcIjtcbiAgICBmb3IgKGNvbnN0IGFyZyBvZiBvcHRpb25zLmFyZ3VtZW50cykge1xuICAgICAgcGFyYW1zICs9IFwiJmFyZ3VtZW50cz1cIiArIGVuY29kZVVSSUNvbXBvbmVudChhcmcpO1xuICAgIH1cbiAgICB1cmwgKz0gXCI/XCIgKyBwYXJhbXMuc3Vic3RyaW5nKDEpO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV4dGVuc2lvbkRlZXBsaW5rKG9wdGlvbnM6IENyZWF0ZUV4dGVuc2lvbkRlZXBsaW5rT3B0aW9ucyk6IHN0cmluZyB7XG4gIGxldCBvd25lck9yQXV0aG9yTmFtZSA9IGdldE93bmVyT3JBdXRob3JOYW1lKCk7XG4gIGxldCBleHRlbnNpb25OYW1lID0gZW52aXJvbm1lbnQuZXh0ZW5zaW9uTmFtZTtcblxuICBpZiAoXCJvd25lck9yQXV0aG9yTmFtZVwiIGluIG9wdGlvbnMgJiYgXCJleHRlbnNpb25OYW1lXCIgaW4gb3B0aW9ucykge1xuICAgIG93bmVyT3JBdXRob3JOYW1lID0gb3B0aW9ucy5vd25lck9yQXV0aG9yTmFtZTtcbiAgICBleHRlbnNpb25OYW1lID0gb3B0aW9ucy5leHRlbnNpb25OYW1lO1xuICB9XG5cbiAgbGV0IHVybCA9IGAke2dldFByb3RvY29sKCl9ZXh0ZW5zaW9ucy8ke293bmVyT3JBdXRob3JOYW1lfS8ke2V4dGVuc2lvbk5hbWV9LyR7b3B0aW9ucy5jb21tYW5kfWA7XG5cbiAgbGV0IHBhcmFtcyA9IFwiXCI7XG4gIGlmIChvcHRpb25zLmxhdW5jaFR5cGUpIHtcbiAgICBwYXJhbXMgKz0gXCImbGF1bmNoVHlwZT1cIiArIGVuY29kZVVSSUNvbXBvbmVudChvcHRpb25zLmxhdW5jaFR5cGUpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuYXJndW1lbnRzKSB7XG4gICAgcGFyYW1zICs9IFwiJmFyZ3VtZW50cz1cIiArIGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShvcHRpb25zLmFyZ3VtZW50cykpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuY29udGV4dCkge1xuICAgIHBhcmFtcyArPSBcIiZjb250ZXh0PVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuY29udGV4dCkpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuZmFsbGJhY2tUZXh0KSB7XG4gICAgcGFyYW1zICs9IFwiJmZhbGxiYWNrVGV4dD1cIiArIGVuY29kZVVSSUNvbXBvbmVudChvcHRpb25zLmZhbGxiYWNrVGV4dCk7XG4gIH1cblxuICBpZiAocGFyYW1zKSB7XG4gICAgdXJsICs9IFwiP1wiICsgcGFyYW1zLnN1YnN0cmluZygxKTtcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlZXBsaW5rIHRvIGEgc2NyaXB0IGNvbW1hbmQgb3IgZXh0ZW5zaW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVlcGxpbmsob3B0aW9uczogQ3JlYXRlRGVlcGxpbmtPcHRpb25zKTogc3RyaW5nIHtcbiAgaWYgKG9wdGlvbnMudHlwZSA9PT0gRGVlcGxpbmtUeXBlLlNjcmlwdENvbW1hbmQpIHtcbiAgICByZXR1cm4gY3JlYXRlU2NyaXB0Q29tbWFuZERlZXBsaW5rKG9wdGlvbnMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjcmVhdGVFeHRlbnNpb25EZWVwbGluayhvcHRpb25zKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IGJhc2VFeGVjdXRlU1FMIH0gZnJvbSBcIi4vc3FsLXV0aWxzXCI7XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBTUUwgcXVlcnkgb24gYSBsb2NhbCBTUUxpdGUgZGF0YWJhc2UgYW5kIHJldHVybnMgdGhlIHF1ZXJ5IHJlc3VsdCBpbiBKU09OIGZvcm1hdC5cbiAqXG4gKiBAcGFyYW0gZGF0YWJhc2VQYXRoIC0gVGhlIHBhdGggdG8gdGhlIFNRTGl0ZSBkYXRhYmFzZSBmaWxlLlxuICogQHBhcmFtIHF1ZXJ5IC0gVGhlIFNRTCBxdWVyeSB0byBleGVjdXRlLlxuICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgdGhlIHF1ZXJ5IHJlc3VsdHMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IGNsb3NlTWFpbldpbmRvdywgQ2xpcGJvYXJkIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgZXhlY3V0ZVNRTCB9IGZyb20gXCJAcmF5Y2FzdC91dGlsc1wiO1xuICpcbiAqIHR5cGUgTWVzc2FnZSA9IHsgYm9keTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfTtcbiAqXG4gKiBjb25zdCBEQl9QQVRIID0gXCIvcGF0aC90by9jaGF0LmRiXCI7XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gQ29tbWFuZCgpIHtcbiAqICAgY29uc3QgcXVlcnkgPSBgU0VMRUNUIGJvZHksIGNvZGUgRlJPTSAuLi5gXG4gKlxuICogICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGV4ZWN1dGVTUUw8TWVzc2FnZT4oREJfUEFUSCwgcXVlcnkpO1xuICpcbiAqICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAqICAgICBjb25zdCBsYXRlc3RDb2RlID0gbWVzc2FnZXNbMF0uY29kZTtcbiAqICAgICBhd2FpdCBDbGlwYm9hcmQucGFzdGUobGF0ZXN0Q29kZSk7XG4gKiAgICAgYXdhaXQgY2xvc2VNYWluV2luZG93KCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZVNRTDxUID0gdW5rbm93bj4oZGF0YWJhc2VQYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGJhc2VFeGVjdXRlU1FMPFQ+KGRhdGFiYXNlUGF0aCwgcXVlcnkpO1xufVxuIiwgImltcG9ydCBjaGlsZFByb2Nlc3MgZnJvbSBcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHtcbiAgZGVmYXVsdFBhcnNpbmcsXG4gIGdldFNwYXduZWRQcm9taXNlLFxuICBnZXRTcGF3bmVkUmVzdWx0LFxuICBoYW5kbGVPdXRwdXQsXG4gIFBhcnNlRXhlY091dHB1dEhhbmRsZXIsXG59IGZyb20gXCIuL2V4ZWMtdXRpbHNcIjtcblxudHlwZSBBcHBsZVNjcmlwdE9wdGlvbnMgPSB7XG4gIC8qKlxuICAgKiBCeSBkZWZhdWx0LCBgcnVuQXBwbGVTY3JpcHRgIHJldHVybnMgaXRzIHJlc3VsdHMgaW4gaHVtYW4tcmVhZGFibGUgZm9ybTogc3RyaW5ncyBkbyBub3QgaGF2ZSBxdW90ZXMgYXJvdW5kIHRoZW0sIGNoYXJhY3RlcnMgYXJlIG5vdCBlc2NhcGVkLCBicmFjZXMgZm9yIGxpc3RzIGFuZCByZWNvcmRzIGFyZSBvbWl0dGVkLCBldGMuIFRoaXMgaXMgZ2VuZXJhbGx5IG1vcmUgdXNlZnVsLCBidXQgY2FuIGludHJvZHVjZSBhbWJpZ3VpdGllcy4gRm9yIGV4YW1wbGUsIHRoZSBsaXN0cyBge1wiZm9vXCIsIFwiYmFyXCJ9YCBhbmQgYHt7XCJmb29cIiwge1wiYmFyXCJ9fX1gIHdvdWxkIGJvdGggYmUgZGlzcGxheWVkIGFzIOKAmGZvbywgYmFy4oCZLiBUbyBzZWUgdGhlIHJlc3VsdHMgaW4gYW4gdW5hbWJpZ3VvdXMgZm9ybSB0aGF0IGNvdWxkIGJlIHJlY29tcGlsZWQgaW50byB0aGUgc2FtZSB2YWx1ZSwgc2V0IGBodW1hblJlYWRhYmxlT3V0cHV0YCB0byBgZmFsc2VgLlxuICAgKlxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBodW1hblJlYWRhYmxlT3V0cHV0PzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHNjcmlwdCBpcyB1c2luZyBbYEFwcGxlU2NyaXB0YF0oaHR0cHM6Ly9kZXZlbG9wZXIuYXBwbGUuY29tL2xpYnJhcnkvYXJjaGl2ZS9kb2N1bWVudGF0aW9uL0FwcGxlU2NyaXB0L0NvbmNlcHR1YWwvQXBwbGVTY3JpcHRMYW5nR3VpZGUvaW50cm9kdWN0aW9uL0FTTFJfaW50cm8uaHRtbCMvL2FwcGxlX3JlZi9kb2MvdWlkL1RQNDAwMDA5ODMpIG9yIFtgSmF2YVNjcmlwdGBdKGh0dHBzOi8vZGV2ZWxvcGVyLmFwcGxlLmNvbS9saWJyYXJ5L2FyY2hpdmUvcmVsZWFzZW5vdGVzL0ludGVyYXBwbGljYXRpb25Db21tdW5pY2F0aW9uL1JOLUphdmFTY3JpcHRGb3JBdXRvbWF0aW9uL0FydGljbGVzL0ludHJvZHVjdGlvbi5odG1sIy8vYXBwbGVfcmVmL2RvYy91aWQvVFA0MDAxNDUwOC1DSDExMS1TVzEpLlxuICAgKlxuICAgKiBAZGVmYXVsdCBcIkFwcGxlU2NyaXB0XCJcbiAgICovXG4gIGxhbmd1YWdlPzogXCJBcHBsZVNjcmlwdFwiIHwgXCJKYXZhU2NyaXB0XCI7XG4gIC8qKlxuICAgKiBBIFNpZ25hbCBvYmplY3QgdGhhdCBhbGxvd3MgeW91IHRvIGFib3J0IHRoZSByZXF1ZXN0IGlmIHJlcXVpcmVkIHZpYSBhbiBBYm9ydENvbnRyb2xsZXIgb2JqZWN0LlxuICAgKi9cbiAgc2lnbmFsPzogQWJvcnRTaWduYWw7XG4gIC8qKiBJZiB0aW1lb3V0IGlzIGdyZWF0ZXIgdGhhbiBgMGAsIHRoZSBwYXJlbnQgd2lsbCBzZW5kIHRoZSBzaWduYWwgYFNJR1RFUk1gIGlmIHRoZSBjaGlsZCBydW5zIGxvbmdlciB0aGFuIHRpbWVvdXQgbWlsbGlzZWNvbmRzLlxuICAgKlxuICAgKiBAZGVmYXVsdCAxMDAwMFxuICAgKi9cbiAgdGltZW91dD86IG51bWJlcjtcbn07XG5cbi8qKlxuICogRXhlY3V0ZXMgYW4gQXBwbGVTY3JpcHQgc2NyaXB0LlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBzaG93SFVEIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuICogaW1wb3J0IHsgcnVuQXBwbGVTY3JpcHQsIHNob3dGYWlsdXJlVG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gKiAgIHRyeSB7XG4gKiAgICAgY29uc3QgcmVzID0gYXdhaXQgcnVuQXBwbGVTY3JpcHQoXG4gKiAgICAgICBgXG4gKiAgICAgICBvbiBydW4gYXJndlxuICogICAgICAgICByZXR1cm4gXCJoZWxsbywgXCIgJiBpdGVtIDEgb2YgYXJndiAmIFwiLlwiXG4gKiAgICAgICBlbmQgcnVuXG4gKiAgICAgICBgLFxuICogICAgICAgW1wid29ybGRcIl1cbiAqICAgICApO1xuICogICAgIGF3YWl0IHNob3dIVUQocmVzKTtcbiAqICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgICBzaG93RmFpbHVyZVRvYXN0KGVycm9yLCB7IHRpdGxlOiBcIkNvdWxkIG5vdCBydW4gQXBwbGVTY3JpcHRcIiB9KTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5BcHBsZVNjcmlwdDxUID0gc3RyaW5nPihcbiAgc2NyaXB0OiBzdHJpbmcsXG4gIG9wdGlvbnM/OiBBcHBsZVNjcmlwdE9wdGlvbnMgJiB7XG4gICAgcGFyc2VPdXRwdXQ/OiBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFQsIHN0cmluZywgQXBwbGVTY3JpcHRPcHRpb25zPjtcbiAgfSxcbik6IFByb21pc2U8c3RyaW5nPjtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5BcHBsZVNjcmlwdDxUID0gc3RyaW5nPihcbiAgc2NyaXB0OiBzdHJpbmcsXG4gIC8qKlxuICAgKiBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIHNjcmlwdC5cbiAgICovXG4gIGFyZ3M6IHN0cmluZ1tdLFxuICBvcHRpb25zPzogQXBwbGVTY3JpcHRPcHRpb25zICYge1xuICAgIHBhcnNlT3V0cHV0PzogUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBzdHJpbmcsIEFwcGxlU2NyaXB0T3B0aW9ucz47XG4gIH0sXG4pOiBQcm9taXNlPHN0cmluZz47XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuQXBwbGVTY3JpcHQ8VCA9IHN0cmluZz4oXG4gIHNjcmlwdDogc3RyaW5nLFxuICBvcHRpb25zT3JBcmdzPzpcbiAgICB8IHN0cmluZ1tdXG4gICAgfCAoQXBwbGVTY3JpcHRPcHRpb25zICYge1xuICAgICAgICBwYXJzZU91dHB1dD86IFBhcnNlRXhlY091dHB1dEhhbmRsZXI8VCwgc3RyaW5nLCBBcHBsZVNjcmlwdE9wdGlvbnM+O1xuICAgICAgfSksXG4gIG9wdGlvbnM/OiBBcHBsZVNjcmlwdE9wdGlvbnMgJiB7XG4gICAgcGFyc2VPdXRwdXQ/OiBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyPFQsIHN0cmluZywgQXBwbGVTY3JpcHRPcHRpb25zPjtcbiAgfSxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSBcImRhcndpblwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQXBwbGVTY3JpcHQgaXMgb25seSBzdXBwb3J0ZWQgb24gbWFjT1NcIik7XG4gIH1cblxuICBjb25zdCB7IGh1bWFuUmVhZGFibGVPdXRwdXQsIGxhbmd1YWdlLCB0aW1lb3V0LCAuLi5leGVjT3B0aW9ucyB9ID0gQXJyYXkuaXNBcnJheShvcHRpb25zT3JBcmdzKVxuICAgID8gb3B0aW9ucyB8fCB7fVxuICAgIDogb3B0aW9uc09yQXJncyB8fCB7fTtcblxuICBjb25zdCBvdXRwdXRBcmd1bWVudHMgPSBodW1hblJlYWRhYmxlT3V0cHV0ICE9PSBmYWxzZSA/IFtdIDogW1wiLXNzXCJdO1xuICBpZiAobGFuZ3VhZ2UgPT09IFwiSmF2YVNjcmlwdFwiKSB7XG4gICAgb3V0cHV0QXJndW1lbnRzLnB1c2goXCItbFwiLCBcIkphdmFTY3JpcHRcIik7XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9uc09yQXJncykpIHtcbiAgICBvdXRwdXRBcmd1bWVudHMucHVzaChcIi1cIiwgLi4ub3B0aW9uc09yQXJncyk7XG4gIH1cblxuICBjb25zdCBzcGF3bmVkID0gY2hpbGRQcm9jZXNzLnNwYXduKFwib3Nhc2NyaXB0XCIsIG91dHB1dEFyZ3VtZW50cywge1xuICAgIC4uLmV4ZWNPcHRpb25zLFxuICAgIGVudjogeyBQQVRIOiBcIi91c3IvbG9jYWwvYmluOi91c3IvYmluOi9iaW46L3Vzci9zYmluOi9zYmluXCIgfSxcbiAgfSk7XG4gIGNvbnN0IHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCwgeyB0aW1lb3V0OiB0aW1lb3V0ID8/IDEwMDAwIH0pO1xuXG4gIHNwYXduZWQuc3RkaW4uZW5kKHNjcmlwdCk7XG5cbiAgY29uc3QgW3sgZXJyb3IsIGV4aXRDb2RlLCBzaWduYWwsIHRpbWVkT3V0IH0sIHN0ZG91dFJlc3VsdCwgc3RkZXJyUmVzdWx0XSA9IGF3YWl0IGdldFNwYXduZWRSZXN1bHQ8c3RyaW5nPihcbiAgICBzcGF3bmVkLFxuICAgIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0sXG4gICAgc3Bhd25lZFByb21pc2UsXG4gICk7XG4gIGNvbnN0IHN0ZG91dCA9IGhhbmRsZU91dHB1dCh7IHN0cmlwRmluYWxOZXdsaW5lOiB0cnVlIH0sIHN0ZG91dFJlc3VsdCk7XG4gIGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dCh7IHN0cmlwRmluYWxOZXdsaW5lOiB0cnVlIH0sIHN0ZGVyclJlc3VsdCk7XG5cbiAgcmV0dXJuIGRlZmF1bHRQYXJzaW5nKHtcbiAgICBzdGRvdXQsXG4gICAgc3RkZXJyLFxuICAgIGVycm9yLFxuICAgIGV4aXRDb2RlLFxuICAgIHNpZ25hbCxcbiAgICB0aW1lZE91dCxcbiAgICBjb21tYW5kOiBcIm9zYXNjcmlwdFwiLFxuICAgIG9wdGlvbnMsXG4gICAgcGFyZW50RXJyb3I6IG5ldyBFcnJvcigpLFxuICB9KTtcbn1cbiIsICJpbXBvcnQgY2hpbGRQcm9jZXNzIGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7XG4gIGRlZmF1bHRQYXJzaW5nLFxuICBnZXRTcGF3bmVkUHJvbWlzZSxcbiAgZ2V0U3Bhd25lZFJlc3VsdCxcbiAgaGFuZGxlT3V0cHV0LFxuICBQYXJzZUV4ZWNPdXRwdXRIYW5kbGVyLFxufSBmcm9tIFwiLi9leGVjLXV0aWxzXCI7XG5cbnR5cGUgUG93ZXJTaGVsbFNjcmlwdE9wdGlvbnMgPSB7XG4gIC8qKlxuICAgKiBBIFNpZ25hbCBvYmplY3QgdGhhdCBhbGxvd3MgeW91IHRvIGFib3J0IHRoZSByZXF1ZXN0IGlmIHJlcXVpcmVkIHZpYSBhbiBBYm9ydENvbnRyb2xsZXIgb2JqZWN0LlxuICAgKi9cbiAgc2lnbmFsPzogQWJvcnRTaWduYWw7XG4gIC8qKiBJZiB0aW1lb3V0IGlzIGdyZWF0ZXIgdGhhbiBgMGAsIHRoZSBwYXJlbnQgd2lsbCBzZW5kIHRoZSBzaWduYWwgYFNJR1RFUk1gIGlmIHRoZSBjaGlsZCBydW5zIGxvbmdlciB0aGFuIHRpbWVvdXQgbWlsbGlzZWNvbmRzLlxuICAgKlxuICAgKiBAZGVmYXVsdCAxMDAwMFxuICAgKi9cbiAgdGltZW91dD86IG51bWJlcjtcbn07XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBQb3dlclNoZWxsIHNjcmlwdC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgc2hvd0hVRCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbiAqIGltcG9ydCB7IHJ1blBvd2VyU2hlbGxTY3JpcHQsIHNob3dGYWlsdXJlVG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gKiAgIHRyeSB7XG4gKiAgICAgY29uc3QgcmVzID0gYXdhaXQgcnVuUG93ZXJTaGVsbFNjcmlwdChcbiAqICAgICAgIGBcbiAqICAgICAgIFdyaXRlLUhvc3QgXCJoZWxsbywgd29ybGQuXCJcbiAqICAgICAgIGAsXG4gKiAgICAgKTtcbiAqICAgICBhd2FpdCBzaG93SFVEKHJlcyk7XG4gKiAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgICAgc2hvd0ZhaWx1cmVUb2FzdChlcnJvciwgeyB0aXRsZTogXCJDb3VsZCBub3QgcnVuIFBvd2VyU2hlbGxcIiB9KTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Qb3dlclNoZWxsU2NyaXB0PFQgPSBzdHJpbmc+KFxuICBzY3JpcHQ6IHN0cmluZyxcbiAgb3B0aW9ucz86IFBvd2VyU2hlbGxTY3JpcHRPcHRpb25zICYge1xuICAgIHBhcnNlT3V0cHV0PzogUGFyc2VFeGVjT3V0cHV0SGFuZGxlcjxULCBzdHJpbmcsIFBvd2VyU2hlbGxTY3JpcHRPcHRpb25zPjtcbiAgfSxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSBcIndpbjMyXCIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJQb3dlclNoZWxsIGlzIG9ubHkgc3VwcG9ydGVkIG9uIFdpbmRvd3NcIik7XG4gIH1cblxuICBjb25zdCB7IHRpbWVvdXQsIC4uLmV4ZWNPcHRpb25zIH0gPSBvcHRpb25zIHx8IHt9O1xuXG4gIGNvbnN0IG91dHB1dEFyZ3VtZW50cyA9IFtcIi1Ob0xvZ29cIiwgXCItTm9Qcm9maWxlXCIsIFwiLU5vbkludGVyYWN0aXZlXCIsIFwiLUNvbW1hbmRcIiwgXCItXCJdO1xuXG4gIGNvbnN0IHNwYXduZWQgPSBjaGlsZFByb2Nlc3Muc3Bhd24oXCJwb3dlcnNoZWxsLmV4ZVwiLCBvdXRwdXRBcmd1bWVudHMsIHtcbiAgICAuLi5leGVjT3B0aW9ucyxcbiAgfSk7XG4gIGNvbnN0IHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCwgeyB0aW1lb3V0OiB0aW1lb3V0ID8/IDEwMDAwIH0pO1xuXG4gIHNwYXduZWQuc3RkaW4uZW5kKHNjcmlwdCk7XG5cbiAgY29uc3QgW3sgZXJyb3IsIGV4aXRDb2RlLCBzaWduYWwsIHRpbWVkT3V0IH0sIHN0ZG91dFJlc3VsdCwgc3RkZXJyUmVzdWx0XSA9IGF3YWl0IGdldFNwYXduZWRSZXN1bHQ8c3RyaW5nPihcbiAgICBzcGF3bmVkLFxuICAgIHsgZW5jb2Rpbmc6IFwidXRmOFwiIH0sXG4gICAgc3Bhd25lZFByb21pc2UsXG4gICk7XG4gIGNvbnN0IHN0ZG91dCA9IGhhbmRsZU91dHB1dCh7IHN0cmlwRmluYWxOZXdsaW5lOiB0cnVlIH0sIHN0ZG91dFJlc3VsdCk7XG4gIGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dCh7IHN0cmlwRmluYWxOZXdsaW5lOiB0cnVlIH0sIHN0ZGVyclJlc3VsdCk7XG5cbiAgcmV0dXJuIGRlZmF1bHRQYXJzaW5nKHtcbiAgICBzdGRvdXQsXG4gICAgc3RkZXJyLFxuICAgIGVycm9yLFxuICAgIGV4aXRDb2RlLFxuICAgIHNpZ25hbCxcbiAgICB0aW1lZE91dCxcbiAgICBjb21tYW5kOiBcInBvd2Vyc2hlbGwuZXhlXCIsXG4gICAgb3B0aW9ucyxcbiAgICBwYXJlbnRFcnJvcjogbmV3IEVycm9yKCksXG4gIH0pO1xufVxuIiwgImltcG9ydCB7IENhY2hlIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgaGFzaCwgcmVwbGFjZXIsIHJldml2ZXIgfSBmcm9tIFwiLi9oZWxwZXJzXCI7XG5cbi8qKlxuICogV3JhcHMgYSBmdW5jdGlvbiB3aXRoIGNhY2hpbmcgZnVuY3Rpb25hbGl0eSB1c2luZyBSYXljYXN0J3MgQ2FjaGUgQVBJLlxuICogQWxsb3dzIGZvciBjYWNoaW5nIG9mIGV4cGVuc2l2ZSBmdW5jdGlvbnMgbGlrZSBwYWdpbmF0ZWQgQVBJIGNhbGxzIHRoYXQgcmFyZWx5IGNoYW5nZS5cbiAqXG4gKiBAcGFyYW0gZm4gLSBUaGUgYXN5bmMgZnVuY3Rpb24gdG8gY2FjaGUgcmVzdWx0cyBmcm9tXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBjYWNoZSBiZWhhdmlvclxuICogQHBhcmFtIG9wdGlvbnMudmFsaWRhdGUgLSBPcHRpb25hbCB2YWxpZGF0aW9uIGZ1bmN0aW9uIGZvciBjYWNoZWQgZGF0YVxuICogQHBhcmFtIG9wdGlvbnMubWF4QWdlIC0gTWF4aW11bSBhZ2Ugb2YgY2FjaGVkIGRhdGEgaW4gbWlsbGlzZWNvbmRzXG4gKiBAcmV0dXJucyBBbiBhc3luYyBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHJlc3VsdCBvZiB0aGUgZnVuY3Rpb24sIGVpdGhlciBmcm9tIGNhY2hlIG9yIGZyZXNoIGV4ZWN1dGlvblxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogY29uc3QgY2FjaGVkRnVuY3Rpb24gPSB3aXRoQ2FjaGUoZmV0Y2hFeHBlbnNpdmVEYXRhLCB7XG4gKiAgIG1heEFnZTogNSAqIDYwICogMTAwMCAvLyBDYWNoZSBmb3IgNSBtaW51dGVzXG4gKiB9KTtcbiAqXG4gKiBjb25zdCByZXN1bHQgPSBhd2FpdCBjYWNoZWRGdW5jdGlvbihxdWVyeSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhDYWNoZTxGbiBleHRlbmRzICguLi5hcmdzOiBhbnkpID0+IFByb21pc2U8YW55Pj4oXG4gIGZuOiBGbixcbiAgb3B0aW9ucz86IHtcbiAgICAvKiogZnVuY3Rpb24gdGhhdCByZWNlaXZlcyB0aGUgY2FjaGVkIGRhdGEgYW5kIHJldHVybnMgYSBib29sZWFuIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBkYXRhIGlzIHN0aWxsIHZhbGlkIG9yIG5vdC4gKi9cbiAgICB2YWxpZGF0ZT86IChkYXRhOiBBd2FpdGVkPFJldHVyblR5cGU8Rm4+PikgPT4gYm9vbGVhbjtcbiAgICAvKiogTWF4aW11bSBhZ2Ugb2YgY2FjaGVkIGRhdGEgaW4gbWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRoZSBkYXRhIHdpbGwgYmUgY29uc2lkZXJlZCBpbnZhbGlkICovXG4gICAgbWF4QWdlPzogbnVtYmVyO1xuICB9LFxuKTogRm4gJiB7IGNsZWFyQ2FjaGU6ICgpID0+IHZvaWQgfSB7XG4gIGNvbnN0IGNhY2hlID0gbmV3IENhY2hlKHsgbmFtZXNwYWNlOiBoYXNoKGZuKSB9KTtcblxuICBjb25zdCB3cmFwcGVkRm4gPSBhc3luYyAoLi4uYXJnczogUGFyYW1ldGVyczxGbj4pID0+IHtcbiAgICBjb25zdCBrZXkgPVxuICAgICAgaGFzaChhcmdzIHx8IFtdKSArIChvcHRpb25zIGFzIHVua25vd24gYXMgeyBpbnRlcm5hbF9jYWNoZUtleVN1ZmZpeD86IHN0cmluZyB9KT8uaW50ZXJuYWxfY2FjaGVLZXlTdWZmaXg7XG4gICAgY29uc3QgY2FjaGVkID0gY2FjaGUuZ2V0KGtleSk7XG4gICAgaWYgKGNhY2hlZCkge1xuICAgICAgY29uc3QgeyBkYXRhLCB0aW1lc3RhbXAgfSA9IEpTT04ucGFyc2UoY2FjaGVkLCByZXZpdmVyKTtcbiAgICAgIGNvbnN0IGlzRXhwaXJlZCA9IG9wdGlvbnM/Lm1heEFnZSAmJiBEYXRlLm5vdygpIC0gdGltZXN0YW1wID4gb3B0aW9ucy5tYXhBZ2U7XG4gICAgICBpZiAoIWlzRXhwaXJlZCAmJiAoIW9wdGlvbnM/LnZhbGlkYXRlIHx8IG9wdGlvbnMudmFsaWRhdGUoZGF0YSkpKSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZm4oLi4uYXJncyk7XG4gICAgY2FjaGUuc2V0KFxuICAgICAga2V5LFxuICAgICAgSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIHtcbiAgICAgICAgICBkYXRhOiByZXN1bHQsXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICB9LFxuICAgICAgICByZXBsYWNlcixcbiAgICAgICksXG4gICAgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHdyYXBwZWRGbi5jbGVhckNhY2hlID0gKCkgPT4ge1xuICAgIGNhY2hlLmNsZWFyKCk7XG4gIH07XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0b28gY29tcGxleCBmb3IgVFNcbiAgcmV0dXJuIHdyYXBwZWRGbjtcbn1cbiIsICJpbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyB1c2VTZWxlY3RlZFZhdWx0SXRlbSB9IGZyb20gXCJ+L2NvbXBvbmVudHMvc2VhcmNoVmF1bHQvY29udGV4dC92YXVsdEl0ZW1cIjtcbmltcG9ydCB1c2VSZXByb21wdCBmcm9tIFwifi91dGlscy9ob29rcy91c2VSZXByb21wdFwiO1xuXG5leHBvcnQgdHlwZSBBY3Rpb25XaXRoUmVwcm9tcHRQcm9wcyA9IE9taXQ8QWN0aW9uLlByb3BzLCBcIm9uQWN0aW9uXCI+ICYge1xuICByZXByb21wdERlc2NyaXB0aW9uPzogc3RyaW5nO1xuICBvbkFjdGlvbjogKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG59O1xuXG5mdW5jdGlvbiBBY3Rpb25XaXRoUmVwcm9tcHQocHJvcHM6IEFjdGlvbldpdGhSZXByb21wdFByb3BzKSB7XG4gIGNvbnN0IHsgcmVwcm9tcHREZXNjcmlwdGlvbiwgb25BY3Rpb24sIC4uLmNvbXBvbmVudFByb3BzIH0gPSBwcm9wcztcbiAgY29uc3QgeyByZXByb21wdCB9ID0gdXNlU2VsZWN0ZWRWYXVsdEl0ZW0oKTtcbiAgY29uc3QgcmVwcm9tcHRBbmRQZXJmb3JtQWN0aW9uID0gdXNlUmVwcm9tcHQob25BY3Rpb24sIHsgZGVzY3JpcHRpb246IHJlcHJvbXB0RGVzY3JpcHRpb24gfSk7XG5cbiAgcmV0dXJuIDxBY3Rpb24gey4uLmNvbXBvbmVudFByb3BzfSBvbkFjdGlvbj17cmVwcm9tcHQgPyByZXByb21wdEFuZFBlcmZvcm1BY3Rpb24gOiBvbkFjdGlvbn0gLz47XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFjdGlvbldpdGhSZXByb21wdDtcbiIsICJpbXBvcnQgeyBjcmVhdGVDb250ZXh0LCB1c2VDb250ZXh0IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBJdGVtIH0gZnJvbSBcIn4vdHlwZXMvdmF1bHRcIjtcblxuY29uc3QgVmF1bHRJdGVtQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8SXRlbSB8IG51bGw+KG51bGwpO1xuXG5leHBvcnQgY29uc3QgdXNlU2VsZWN0ZWRWYXVsdEl0ZW0gPSAoKSA9PiB7XG4gIGNvbnN0IHNlc3Npb24gPSB1c2VDb250ZXh0KFZhdWx0SXRlbUNvbnRleHQpO1xuICBpZiAoc2Vzc2lvbiA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwidXNlU2VsZWN0VmF1bHRJdGVtIG11c3QgYmUgdXNlZCB3aXRoaW4gYSBWYXVsdEl0ZW1Db250ZXh0LlByb3ZpZGVyXCIpO1xuICB9XG5cbiAgcmV0dXJuIHNlc3Npb247XG59O1xuXG5leHBvcnQgZGVmYXVsdCBWYXVsdEl0ZW1Db250ZXh0O1xuIiwgImltcG9ydCB7IHNob3dUb2FzdCwgVG9hc3QsIHVzZU5hdmlnYXRpb24gfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgUmVwcm9tcHRGb3JtIGZyb20gXCJ+L2NvbXBvbmVudHMvUmVwcm9tcHRGb3JtXCI7XG5pbXBvcnQgeyB1c2VTZXNzaW9uIH0gZnJvbSBcIn4vY29udGV4dC9zZXNzaW9uXCI7XG5cbmV4cG9ydCB0eXBlIFVzZXJSZXByb21wdEFjdGlvblByb3AgPSB7IGNsb3NlRm9ybTogKCkgPT4gdm9pZCB9O1xuZXhwb3J0IHR5cGUgVXNlUmVwcm9tcHRBY3Rpb24gPSAocHJvcHM6IFVzZXJSZXByb21wdEFjdGlvblByb3ApID0+IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+O1xuXG5leHBvcnQgdHlwZSBVc2VSZXByb21wdE9wdGlvbnMgPSB7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gZm9yIGFuIEFjdGlvbiB0aGF0IHdpbGwgbmF2aWdhdGUgdG8gdGhlIHtAbGluayBSZXByb21wdEZvcm19LlxuICogVGhlIHBhc3N3b3JkIGlzIG5vdCBjb25maXJtIGluIHRoaXMgaG9vaywgb25seSBwYXNzZWQgZG93biB0byB0aGUgYWN0aW9uLlxuICovXG5mdW5jdGlvbiB1c2VSZXByb21wdChhY3Rpb246ICgpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+LCBvcHRpb25zPzogVXNlUmVwcm9tcHRPcHRpb25zKSB7XG4gIGNvbnN0IHsgZGVzY3JpcHRpb24gPSBcIlBlcmZvcm1pbmcgYW4gYWN0aW9uIHRoYXQgcmVxdWlyZXMgdGhlIG1hc3RlciBwYXNzd29yZFwiIH0gPSBvcHRpb25zID8/IHt9O1xuICBjb25zdCBzZXNzaW9uID0gdXNlU2Vzc2lvbigpO1xuICBjb25zdCB7IHB1c2gsIHBvcCB9ID0gdXNlTmF2aWdhdGlvbigpO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvbmZpcm0ocGFzc3dvcmQ6IHN0cmluZykge1xuICAgIGNvbnN0IGlzUGFzc3dvcmRDb3JyZWN0ID0gYXdhaXQgc2Vzc2lvbi5jb25maXJtTWFzdGVyUGFzc3dvcmQocGFzc3dvcmQpO1xuICAgIGlmICghaXNQYXNzd29yZENvcnJlY3QpIHtcbiAgICAgIGF3YWl0IHNob3dUb2FzdChUb2FzdC5TdHlsZS5GYWlsdXJlLCBcIkZhaWxlZCB0byB1bmxvY2sgdmF1bHRcIiwgXCJDaGVjayB5b3VyIGNyZWRlbnRpYWxzXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBwb3AoKTtcblxuICAgIC8qIHVzaW5nIGEgc2V0VGltZW91dCBoZXJlIGZpeGVzIGEgYnVnIHdoZXJlIHRoZSBSZXByb21wdEZvcm0gZmxhc2hlcyB3aGVuIHlvdSBwb3AgYmFjayB0byB0aGUgcHJldmlvdXMgc2NyZWVuLiBcbiAgICBUaGlzIGNvbWVzIHdpdGggdGhlIHRyYWRlLW9mZiBvZiBhIHRpbnkgdmlzaWJsZSBkZWxheSBiZXR3ZWVuIHRoZSBSZXByb21wdEZvcm0gcG9wIGFuZCB0aGUgYWN0aW9uIHB1c2hpbmcgYSBuZXcgc2NyZWVuICovXG4gICAgc2V0VGltZW91dChhY3Rpb24sIDEpO1xuICB9XG5cbiAgcmV0dXJuICgpID0+IHB1c2goPFJlcHJvbXB0Rm9ybSBkZXNjcmlwdGlvbj17ZGVzY3JpcHRpb259IG9uQ29uZmlybT17aGFuZGxlQ29uZmlybX0gLz4pO1xufVxuXG5leHBvcnQgZGVmYXVsdCB1c2VSZXByb21wdDtcbiIsICJpbXBvcnQgeyBBY3Rpb24sIEFjdGlvblBhbmVsLCBGb3JtIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuXG5leHBvcnQgdHlwZSBSZXByb21wdEZvcm1Qcm9wcyA9IHtcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgb25Db25maXJtOiAocGFzc3dvcmQ6IHN0cmluZykgPT4gdm9pZDtcbn07XG5cbmNvbnN0IFJlcHJvbXB0Rm9ybSA9IChwcm9wczogUmVwcm9tcHRGb3JtUHJvcHMpID0+IHtcbiAgY29uc3QgeyBkZXNjcmlwdGlvbiwgb25Db25maXJtIH0gPSBwcm9wcztcblxuICBmdW5jdGlvbiBvblN1Ym1pdCh2YWx1ZXM6IHsgcGFzc3dvcmQ6IHN0cmluZyB9KSB7XG4gICAgb25Db25maXJtKHZhbHVlcy5wYXNzd29yZCk7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxGb3JtXG4gICAgICBuYXZpZ2F0aW9uVGl0bGU9XCJDb25maXJtYXRpb24gUmVxdWlyZWRcIlxuICAgICAgYWN0aW9ucz17XG4gICAgICAgIDxBY3Rpb25QYW5lbD5cbiAgICAgICAgICA8QWN0aW9uLlN1Ym1pdEZvcm0gdGl0bGU9XCJDb25maXJtXCIgb25TdWJtaXQ9e29uU3VibWl0fSAvPlxuICAgICAgICA8L0FjdGlvblBhbmVsPlxuICAgICAgfVxuICAgID5cbiAgICAgIDxGb3JtLkRlc2NyaXB0aW9uIHRpdGxlPVwiQ29uZmlybWF0aW9uIFJlcXVpcmVkIGZvclwiIHRleHQ9e2Rlc2NyaXB0aW9ufSAvPlxuICAgICAgPEZvcm0uUGFzc3dvcmRGaWVsZCBhdXRvRm9jdXMgaWQ9XCJwYXNzd29yZFwiIHRpdGxlPVwiTWFzdGVyIFBhc3N3b3JkXCIgLz5cbiAgICA8L0Zvcm0+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBSZXByb21wdEZvcm07XG4iLCAiaW1wb3J0IHsgTG9jYWxTdG9yYWdlLCBnZXRQcmVmZXJlbmNlVmFsdWVzIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgY3JlYXRlQ29udGV4dCwgUHJvcHNXaXRoQ2hpbGRyZW4sIFJlYWN0Tm9kZSwgdXNlQ29udGV4dCwgdXNlTWVtbywgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgVW5sb2NrRm9ybSBmcm9tIFwifi9jb21wb25lbnRzL1VubG9ja0Zvcm1cIjtcbmltcG9ydCB7IFZhdWx0TG9hZGluZ0ZhbGxiYWNrIH0gZnJvbSBcIn4vY29tcG9uZW50cy9zZWFyY2hWYXVsdC9WYXVsdExvYWRpbmdGYWxsYmFja1wiO1xuaW1wb3J0IHsgTE9DQUxfU1RPUkFHRV9LRVksIFZBVUxUX0xPQ0tfTUVTU0FHRVMgfSBmcm9tIFwifi9jb25zdGFudHMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgVkFVTFRfVElNRU9VVCB9IGZyb20gXCJ+L2NvbnN0YW50cy9wcmVmZXJlbmNlc1wiO1xuaW1wb3J0IHsgdXNlQml0d2FyZGVuIH0gZnJvbSBcIn4vY29udGV4dC9iaXR3YXJkZW5cIjtcbmltcG9ydCB7IHVzZVNlc3Npb25SZWR1Y2VyIH0gZnJvbSBcIn4vY29udGV4dC9zZXNzaW9uL3JlZHVjZXJcIjtcbmltcG9ydCB7XG4gIGNoZWNrU3lzdGVtTG9ja2VkU2luY2VMYXN0QWNjZXNzLFxuICBjaGVja1N5c3RlbVNsZXB0U2luY2VMYXN0QWNjZXNzLFxuICBTZXNzaW9uU3RvcmFnZSxcbn0gZnJvbSBcIn4vY29udGV4dC9zZXNzaW9uL3V0aWxzXCI7XG5pbXBvcnQgeyBTZXNzaW9uU3RhdGUgfSBmcm9tIFwifi90eXBlcy9zZXNzaW9uXCI7XG5pbXBvcnQgeyBDYWNoZSB9IGZyb20gXCJ+L3V0aWxzL2NhY2hlXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIH0gZnJvbSBcIn4vdXRpbHMvZGV2ZWxvcG1lbnRcIjtcbmltcG9ydCB1c2VPbmNlRWZmZWN0IGZyb20gXCJ+L3V0aWxzL2hvb2tzL3VzZU9uY2VFZmZlY3RcIjtcbmltcG9ydCB7IGhhc2hNYXN0ZXJQYXNzd29yZEZvclJlcHJvbXB0aW5nIH0gZnJvbSBcIn4vdXRpbHMvcGFzc3dvcmRzXCI7XG5pbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gXCJ+L3V0aWxzL3BsYXRmb3JtXCI7XG5cbmV4cG9ydCB0eXBlIFNlc3Npb24gPSB7XG4gIGFjdGl2ZTogYm9vbGVhbjtcbiAgY29uZmlybU1hc3RlclBhc3N3b3JkOiAocGFzc3dvcmQ6IHN0cmluZykgPT4gUHJvbWlzZTxib29sZWFuPjtcbn0gJiBQaWNrPFNlc3Npb25TdGF0ZSwgXCJ0b2tlblwiIHwgXCJpc0xvYWRpbmdcIiB8IFwiaXNMb2NrZWRcIiB8IFwiaXNBdXRoZW50aWNhdGVkXCI+O1xuXG5leHBvcnQgY29uc3QgU2Vzc2lvbkNvbnRleHQgPSBjcmVhdGVDb250ZXh0PFNlc3Npb24gfCBudWxsPihudWxsKTtcblxuZXhwb3J0IHR5cGUgU2Vzc2lvblByb3ZpZGVyUHJvcHMgPSBQcm9wc1dpdGhDaGlsZHJlbjx7XG4gIGxvYWRpbmdGYWxsYmFjaz86IFJlYWN0Tm9kZTtcbiAgdW5sb2NrPzogYm9vbGVhbjtcbn0+O1xuXG4vKipcbiAqIENvbXBvbmVudCB3aGljaCBwcm92aWRlcyBhIHNlc3Npb24gdmlhIHRoZSB7QGxpbmsgdXNlU2Vzc2lvbn0gaG9vay5cbiAqIEBwYXJhbSBwcm9wcy51bmxvY2sgSWYgdHJ1ZSwgYW4gdW5sb2NrIGZvcm0gd2lsbCBiZSBkaXNwbGF5ZWQgaWYgdGhlIHZhdWx0IGlzIGxvY2tlZCBvciB1bmF1dGhlbnRpY2F0ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXNzaW9uUHJvdmlkZXIocHJvcHM6IFNlc3Npb25Qcm92aWRlclByb3BzKSB7XG4gIGNvbnN0IHsgY2hpbGRyZW4sIGxvYWRpbmdGYWxsYmFjayA9IDxWYXVsdExvYWRpbmdGYWxsYmFjayAvPiwgdW5sb2NrIH0gPSBwcm9wcztcblxuICBjb25zdCBiaXR3YXJkZW4gPSB1c2VCaXR3YXJkZW4oKTtcbiAgY29uc3QgW3N0YXRlLCBkaXNwYXRjaF0gPSB1c2VTZXNzaW9uUmVkdWNlcigpO1xuICBjb25zdCBwZW5kaW5nQWN0aW9uUmVmID0gdXNlUmVmPFByb21pc2U8YW55Pj4oUHJvbWlzZS5yZXNvbHZlKCkpO1xuXG4gIHVzZU9uY2VFZmZlY3QoYm9vdHN0cmFwU2Vzc2lvbiwgYml0d2FyZGVuKTtcblxuICBhc3luYyBmdW5jdGlvbiBib290c3RyYXBTZXNzaW9uKCkge1xuICAgIHRyeSB7XG4gICAgICBiaXR3YXJkZW5cbiAgICAgICAgLnNldEFjdGlvbkxpc3RlbmVyKFwibG9ja1wiLCBoYW5kbGVMb2NrKVxuICAgICAgICAuc2V0QWN0aW9uTGlzdGVuZXIoXCJ1bmxvY2tcIiwgaGFuZGxlVW5sb2NrKVxuICAgICAgICAuc2V0QWN0aW9uTGlzdGVuZXIoXCJsb2dvdXRcIiwgaGFuZGxlTG9nb3V0KTtcblxuICAgICAgY29uc3QgW3Rva2VuLCBwYXNzd29yZEhhc2gsIGxhc3RBY3Rpdml0eVRpbWVTdHJpbmcsIGxhc3RWYXVsdFN0YXR1c10gPSBhd2FpdCBTZXNzaW9uU3RvcmFnZS5nZXRTYXZlZFNlc3Npb24oKTtcbiAgICAgIGlmICghdG9rZW4gfHwgIXBhc3N3b3JkSGFzaCkgdGhyb3cgbmV3IExvY2tWYXVsdEVycm9yKCk7XG5cbiAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJsb2FkU3RhdGVcIiwgdG9rZW4sIHBhc3N3b3JkSGFzaCB9KTtcbiAgICAgIGJpdHdhcmRlbi5zZXRTZXNzaW9uVG9rZW4odG9rZW4pO1xuXG4gICAgICBpZiAoYml0d2FyZGVuLndhc0NsaVVwZGF0ZWQpIHRocm93IG5ldyBMb2dvdXRWYXVsdEVycm9yKFZBVUxUX0xPQ0tfTUVTU0FHRVMuQ0xJX1VQREFURUQpO1xuICAgICAgaWYgKGxhc3RWYXVsdFN0YXR1cyA9PT0gXCJsb2NrZWRcIikgdGhyb3cgbmV3IExvY2tWYXVsdEVycm9yKCk7XG4gICAgICBpZiAobGFzdFZhdWx0U3RhdHVzID09PSBcInVuYXV0aGVudGljYXRlZFwiKSB0aHJvdyBuZXcgTG9nb3V0VmF1bHRFcnJvcigpO1xuXG4gICAgICBpZiAobGFzdEFjdGl2aXR5VGltZVN0cmluZykge1xuICAgICAgICBjb25zdCBsYXN0QWN0aXZpdHlUaW1lID0gbmV3IERhdGUobGFzdEFjdGl2aXR5VGltZVN0cmluZyk7XG5cbiAgICAgICAgY29uc3QgdmF1bHRUaW1lb3V0TXMgPSArZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcz4oKS5yZXByb21wdElnbm9yZUR1cmF0aW9uO1xuICAgICAgICBpZiAocGxhdGZvcm0gPT09IFwibWFjb3NcIiAmJiB2YXVsdFRpbWVvdXRNcyA9PT0gVkFVTFRfVElNRU9VVC5TWVNURU1fTE9DSykge1xuICAgICAgICAgIGlmIChhd2FpdCBjaGVja1N5c3RlbUxvY2tlZFNpbmNlTGFzdEFjY2VzcyhsYXN0QWN0aXZpdHlUaW1lKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IExvY2tWYXVsdEVycm9yKFZBVUxUX0xPQ0tfTUVTU0FHRVMuU1lTVEVNX0xPQ0spO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwbGF0Zm9ybSA9PT0gXCJtYWNvc1wiICYmIHZhdWx0VGltZW91dE1zID09PSBWQVVMVF9USU1FT1VULlNZU1RFTV9TTEVFUCkge1xuICAgICAgICAgIGlmIChhd2FpdCBjaGVja1N5c3RlbVNsZXB0U2luY2VMYXN0QWNjZXNzKGxhc3RBY3Rpdml0eVRpbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTG9ja1ZhdWx0RXJyb3IoVkFVTFRfTE9DS19NRVNTQUdFUy5TWVNURU1fU0xFRVApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh2YXVsdFRpbWVvdXRNcyAhPT0gVkFVTFRfVElNRU9VVC5ORVZFUikge1xuICAgICAgICAgIGNvbnN0IHRpbWVFbGFwc2VTaW5jZUxhc3RBY3Rpdml0eSA9IERhdGUubm93KCkgLSBsYXN0QWN0aXZpdHlUaW1lLmdldFRpbWUoKTtcbiAgICAgICAgICBpZiAodmF1bHRUaW1lb3V0TXMgPT09IFZBVUxUX1RJTUVPVVQuSU1NRURJQVRFTFkgfHwgdGltZUVsYXBzZVNpbmNlTGFzdEFjdGl2aXR5ID49IHZhdWx0VGltZW91dE1zKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTG9ja1ZhdWx0RXJyb3IoVkFVTFRfTE9DS19NRVNTQUdFUy5USU1FT1VUKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZGlzcGF0Y2goeyB0eXBlOiBcImZpbmlzaExvYWRpbmdTYXZlZFN0YXRlXCIgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIExvY2tWYXVsdEVycm9yKSB7XG4gICAgICAgIHBlbmRpbmdBY3Rpb25SZWYuY3VycmVudCA9IGJpdHdhcmRlbi5sb2NrKHsgcmVhc29uOiBlcnJvci5tZXNzYWdlLCBpbW1lZGlhdGU6IHRydWUsIGNoZWNrVmF1bHRTdGF0dXM6IHRydWUgfSk7XG4gICAgICB9IGVsc2UgaWYgKGVycm9yIGluc3RhbmNlb2YgTG9nb3V0VmF1bHRFcnJvcikge1xuICAgICAgICBwZW5kaW5nQWN0aW9uUmVmLmN1cnJlbnQgPSBiaXR3YXJkZW4ubG9nb3V0KHsgcmVhc29uOiBlcnJvci5tZXNzYWdlLCBpbW1lZGlhdGU6IHRydWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwZW5kaW5nQWN0aW9uUmVmLmN1cnJlbnQgPSBiaXR3YXJkZW4ubG9jayh7IGltbWVkaWF0ZTogdHJ1ZSB9KTtcbiAgICAgICAgZGlzcGF0Y2goeyB0eXBlOiBcImZhaWxMb2FkaW5nU2F2ZWRTdGF0ZVwiIH0pO1xuICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGJvb3RzdHJhcCBzZXNzaW9uIHN0YXRlXCIsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVVbmxvY2socGFzc3dvcmQ6IHN0cmluZywgdG9rZW46IHN0cmluZykge1xuICAgIGNvbnN0IHBhc3N3b3JkSGFzaCA9IGF3YWl0IGhhc2hNYXN0ZXJQYXNzd29yZEZvclJlcHJvbXB0aW5nKHBhc3N3b3JkKTtcbiAgICBhd2FpdCBTZXNzaW9uU3RvcmFnZS5zYXZlU2Vzc2lvbih0b2tlbiwgcGFzc3dvcmRIYXNoKTtcbiAgICBhd2FpdCBMb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShMT0NBTF9TVE9SQUdFX0tFWS5WQVVMVF9MT0NLX1JFQVNPTik7XG4gICAgZGlzcGF0Y2goeyB0eXBlOiBcInVubG9ja1wiLCB0b2tlbiwgcGFzc3dvcmRIYXNoIH0pO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTG9jayhyZWFzb24/OiBzdHJpbmcpIHtcbiAgICBhd2FpdCBTZXNzaW9uU3RvcmFnZS5jbGVhclNlc3Npb24oKTtcbiAgICBpZiAocmVhc29uKSBhd2FpdCBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5WQVVMVF9MT0NLX1JFQVNPTiwgcmVhc29uKTtcbiAgICBkaXNwYXRjaCh7IHR5cGU6IFwibG9ja1wiIH0pO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTG9nb3V0KHJlYXNvbj86IHN0cmluZykge1xuICAgIGF3YWl0IFNlc3Npb25TdG9yYWdlLmNsZWFyU2Vzc2lvbigpO1xuICAgIENhY2hlLmNsZWFyKCk7XG4gICAgaWYgKHJlYXNvbikgYXdhaXQgTG9jYWxTdG9yYWdlLnNldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuVkFVTFRfTE9DS19SRUFTT04sIHJlYXNvbik7XG4gICAgZGlzcGF0Y2goeyB0eXBlOiBcImxvZ291dFwiIH0pO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gY29uZmlybU1hc3RlclBhc3N3b3JkKHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBlbnRlcmVkUGFzc3dvcmRIYXNoID0gYXdhaXQgaGFzaE1hc3RlclBhc3N3b3JkRm9yUmVwcm9tcHRpbmcocGFzc3dvcmQpO1xuICAgIHJldHVybiBlbnRlcmVkUGFzc3dvcmRIYXNoID09PSBzdGF0ZS5wYXNzd29yZEhhc2g7XG4gIH1cblxuICBjb25zdCBjb250ZXh0VmFsdWU6IFNlc3Npb24gPSB1c2VNZW1vKFxuICAgICgpID0+ICh7XG4gICAgICB0b2tlbjogc3RhdGUudG9rZW4sXG4gICAgICBpc0xvYWRpbmc6IHN0YXRlLmlzTG9hZGluZyxcbiAgICAgIGlzQXV0aGVudGljYXRlZDogc3RhdGUuaXNBdXRoZW50aWNhdGVkLFxuICAgICAgaXNMb2NrZWQ6IHN0YXRlLmlzTG9ja2VkLFxuICAgICAgYWN0aXZlOiAhc3RhdGUuaXNMb2FkaW5nICYmIHN0YXRlLmlzQXV0aGVudGljYXRlZCAmJiAhc3RhdGUuaXNMb2NrZWQsXG4gICAgICBjb25maXJtTWFzdGVyUGFzc3dvcmQsXG4gICAgfSksXG4gICAgW3N0YXRlLCBjb25maXJtTWFzdGVyUGFzc3dvcmRdXG4gICk7XG5cbiAgaWYgKHN0YXRlLmlzTG9hZGluZykgcmV0dXJuIGxvYWRpbmdGYWxsYmFjaztcblxuICBjb25zdCBzaG93VW5sb2NrRm9ybSA9IHN0YXRlLmlzTG9ja2VkIHx8ICFzdGF0ZS5pc0F1dGhlbnRpY2F0ZWQ7XG4gIGNvbnN0IF9jaGlsZHJlbiA9IHN0YXRlLnRva2VuID8gY2hpbGRyZW4gOiBudWxsO1xuXG4gIHJldHVybiAoXG4gICAgPFNlc3Npb25Db250ZXh0LlByb3ZpZGVyIHZhbHVlPXtjb250ZXh0VmFsdWV9PlxuICAgICAge3Nob3dVbmxvY2tGb3JtICYmIHVubG9jayA/IDxVbmxvY2tGb3JtIHBlbmRpbmdBY3Rpb249e3BlbmRpbmdBY3Rpb25SZWYuY3VycmVudH0gLz4gOiBfY2hpbGRyZW59XG4gICAgPC9TZXNzaW9uQ29udGV4dC5Qcm92aWRlcj5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVNlc3Npb24oKTogU2Vzc2lvbiB7XG4gIGNvbnN0IHNlc3Npb24gPSB1c2VDb250ZXh0KFNlc3Npb25Db250ZXh0KTtcbiAgaWYgKHNlc3Npb24gPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcInVzZVNlc3Npb24gbXVzdCBiZSB1c2VkIHdpdGhpbiBhIFNlc3Npb25Qcm92aWRlclwiKTtcbiAgfVxuXG4gIHJldHVybiBzZXNzaW9uO1xufVxuXG5jbGFzcyBMb2NrVmF1bHRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobG9ja1JlYXNvbj86IHN0cmluZykge1xuICAgIHN1cGVyKGxvY2tSZWFzb24pO1xuICB9XG59XG5cbmNsYXNzIExvZ291dFZhdWx0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGxvY2tSZWFzb24/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihsb2NrUmVhc29uKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFjdGlvbiwgQWN0aW9uUGFuZWwsIENsaXBib2FyZCwgRm9ybSwgZ2V0UHJlZmVyZW5jZVZhbHVlcywgSWNvbiwgc2hvd1RvYXN0LCBUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBEZWJ1Z2dpbmdCdWdSZXBvcnRpbmdBY3Rpb25TZWN0aW9uIH0gZnJvbSBcIn4vY29tcG9uZW50cy9hY3Rpb25zXCI7XG5pbXBvcnQgeyBMT0NBTF9TVE9SQUdFX0tFWSB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyB1c2VCaXR3YXJkZW4gfSBmcm9tIFwifi9jb250ZXh0L2JpdHdhcmRlblwiO1xuaW1wb3J0IHsgdHJlYXRFcnJvciB9IGZyb20gXCJ+L3V0aWxzL2RlYnVnXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIH0gZnJvbSBcIn4vdXRpbHMvZGV2ZWxvcG1lbnRcIjtcbmltcG9ydCB1c2VWYXVsdE1lc3NhZ2VzIGZyb20gXCJ+L3V0aWxzL2hvb2tzL3VzZVZhdWx0TWVzc2FnZXNcIjtcbmltcG9ydCB7IHVzZUxvY2FsU3RvcmFnZUl0ZW0gfSBmcm9tIFwifi91dGlscy9sb2NhbHN0b3JhZ2VcIjtcbmltcG9ydCB7IHBsYXRmb3JtIH0gZnJvbSBcIn4vdXRpbHMvcGxhdGZvcm1cIjtcbmltcG9ydCB7IGdldExhYmVsRm9yVGltZW91dFByZWZlcmVuY2UgfSBmcm9tIFwifi91dGlscy9wcmVmZXJlbmNlc1wiO1xuXG50eXBlIFVubG9ja0Zvcm1Qcm9wcyA9IHtcbiAgcGVuZGluZ0FjdGlvbj86IFByb21pc2U8dm9pZD47XG59O1xuXG4vKiogRm9ybSBmb3IgdW5sb2NraW5nIG9yIGxvZ2dpbmcgaW4gdG8gdGhlIEJpdHdhcmRlbiB2YXVsdC4gKi9cbmNvbnN0IFVubG9ja0Zvcm0gPSAoeyBwZW5kaW5nQWN0aW9uID0gUHJvbWlzZS5yZXNvbHZlKCkgfTogVW5sb2NrRm9ybVByb3BzKSA9PiB7XG4gIGNvbnN0IGJpdHdhcmRlbiA9IHVzZUJpdHdhcmRlbigpO1xuICBjb25zdCB7IHVzZXJNZXNzYWdlLCBzZXJ2ZXJNZXNzYWdlLCBzaG91bGRTaG93U2VydmVyIH0gPSB1c2VWYXVsdE1lc3NhZ2VzKCk7XG5cbiAgY29uc3QgW2lzTG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFt1bmxvY2tFcnJvciwgc2V0VW5sb2NrRXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgdW5kZWZpbmVkPih1bmRlZmluZWQpO1xuICBjb25zdCBbc2hvd1Bhc3N3b3JkLCBzZXRTaG93UGFzc3dvcmRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbcGFzc3dvcmQsIHNldFBhc3N3b3JkXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbbG9ja1JlYXNvbiwgeyByZW1vdmU6IGNsZWFyTG9ja1JlYXNvbiB9XSA9IHVzZUxvY2FsU3RvcmFnZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuVkFVTFRfTE9DS19SRUFTT04pO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIG9uU3VibWl0KCkge1xuICAgIGlmIChwYXNzd29yZC5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLkFuaW1hdGVkLCBcIlVubG9ja2luZyBWYXVsdC4uLlwiLCBcIlBsZWFzZSB3YWl0XCIpO1xuICAgIHRyeSB7XG4gICAgICBzZXRMb2FkaW5nKHRydWUpO1xuICAgICAgc2V0VW5sb2NrRXJyb3IodW5kZWZpbmVkKTtcblxuICAgICAgYXdhaXQgcGVuZGluZ0FjdGlvbjtcblxuICAgICAgY29uc3QgeyBlcnJvciwgcmVzdWx0OiB2YXVsdFN0YXRlIH0gPSBhd2FpdCBiaXR3YXJkZW4uc3RhdHVzKCk7XG4gICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuXG4gICAgICBpZiAodmF1bHRTdGF0ZS5zdGF0dXMgPT09IFwidW5hdXRoZW50aWNhdGVkXCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBiaXR3YXJkZW4ubG9naW4oKTtcbiAgICAgICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIGRpc3BsYXlhYmxlRXJyb3IgPSBgUGxlYXNlIGNoZWNrIHlvdXIgJHtzaG91bGRTaG93U2VydmVyID8gXCJTZXJ2ZXIgVVJMLCBcIiA6IFwiXCJ9QVBJIEtleSBhbmQgU2VjcmV0LmAsXG4gICAgICAgICAgICB0cmVhdGVkRXJyb3IsXG4gICAgICAgICAgfSA9IGdldFVzZWZ1bEVycm9yKGVycm9yLCBwYXNzd29yZCk7XG4gICAgICAgICAgYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLkZhaWx1cmUsIFwiRmFpbGVkIHRvIGxvZyBpblwiLCBkaXNwbGF5YWJsZUVycm9yKTtcbiAgICAgICAgICBzZXRVbmxvY2tFcnJvcih0cmVhdGVkRXJyb3IpO1xuICAgICAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gbG9nIGluXCIsIGVycm9yKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYXdhaXQgYml0d2FyZGVuLnVubG9jayhwYXNzd29yZCk7XG4gICAgICBhd2FpdCBjbGVhckxvY2tSZWFzb24oKTtcbiAgICAgIGF3YWl0IHRvYXN0LmhpZGUoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgeyBkaXNwbGF5YWJsZUVycm9yID0gXCJQbGVhc2UgY2hlY2sgeW91ciBjcmVkZW50aWFsc1wiLCB0cmVhdGVkRXJyb3IgfSA9IGdldFVzZWZ1bEVycm9yKGVycm9yLCBwYXNzd29yZCk7XG4gICAgICBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuRmFpbHVyZSwgXCJGYWlsZWQgdG8gdW5sb2NrIHZhdWx0XCIsIGRpc3BsYXlhYmxlRXJyb3IpO1xuICAgICAgc2V0VW5sb2NrRXJyb3IodHJlYXRlZEVycm9yKTtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gdW5sb2NrIHZhdWx0XCIsIGVycm9yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY29weVVubG9ja0Vycm9yID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghdW5sb2NrRXJyb3IpIHJldHVybjtcbiAgICBhd2FpdCBDbGlwYm9hcmQuY29weSh1bmxvY2tFcnJvcik7XG4gICAgYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLlN1Y2Nlc3MsIFwiRXJyb3IgY29waWVkIHRvIGNsaXBib2FyZFwiKTtcbiAgfTtcblxuICBsZXQgUGFzc3dvcmRGaWVsZCA9IEZvcm0uUGFzc3dvcmRGaWVsZDtcbiAgbGV0IHBhc3N3b3JkRmllbGRJZCA9IFwicGFzc3dvcmRcIjtcbiAgaWYgKHNob3dQYXNzd29yZCkge1xuICAgIFBhc3N3b3JkRmllbGQgPSBGb3JtLlRleHRGaWVsZDtcbiAgICBwYXNzd29yZEZpZWxkSWQgPSBcInBsYWluUGFzc3dvcmRcIjtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEZvcm1cbiAgICAgIGFjdGlvbnM9e1xuICAgICAgICA8QWN0aW9uUGFuZWw+XG4gICAgICAgICAgeyFpc0xvYWRpbmcgJiYgKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPEFjdGlvbi5TdWJtaXRGb3JtIGljb249e0ljb24uTG9ja1VubG9ja2VkfSB0aXRsZT1cIlVubG9ja1wiIG9uU3VibWl0PXtvblN1Ym1pdH0gLz5cbiAgICAgICAgICAgICAgPEFjdGlvblxuICAgICAgICAgICAgICAgIGljb249e3Nob3dQYXNzd29yZCA/IEljb24uRXllRGlzYWJsZWQgOiBJY29uLkV5ZX1cbiAgICAgICAgICAgICAgICB0aXRsZT17c2hvd1Bhc3N3b3JkID8gXCJIaWRlIFBhc3N3b3JkXCIgOiBcIlNob3cgUGFzc3dvcmRcIn1cbiAgICAgICAgICAgICAgICBvbkFjdGlvbj17KCkgPT4gc2V0U2hvd1Bhc3N3b3JkKChwcmV2KSA9PiAhcHJldil9XG4gICAgICAgICAgICAgICAgc2hvcnRjdXQ9e3sgbWFjT1M6IHsga2V5OiBcImVcIiwgbW9kaWZpZXJzOiBbXCJvcHRcIl0gfSwgd2luZG93czogeyBrZXk6IFwiZVwiLCBtb2RpZmllcnM6IFtcImFsdFwiXSB9IH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICAgIHshIXVubG9ja0Vycm9yICYmIChcbiAgICAgICAgICAgIDxBY3Rpb25cbiAgICAgICAgICAgICAgb25BY3Rpb249e2NvcHlVbmxvY2tFcnJvcn1cbiAgICAgICAgICAgICAgdGl0bGU9XCJDb3B5IExhc3QgRXJyb3JcIlxuICAgICAgICAgICAgICBpY29uPXtJY29uLkJ1Z31cbiAgICAgICAgICAgICAgc3R5bGU9e0FjdGlvbi5TdHlsZS5EZXN0cnVjdGl2ZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8RGVidWdnaW5nQnVnUmVwb3J0aW5nQWN0aW9uU2VjdGlvbiAvPlxuICAgICAgICA8L0FjdGlvblBhbmVsPlxuICAgICAgfVxuICAgID5cbiAgICAgIHtzaG91bGRTaG93U2VydmVyICYmIDxGb3JtLkRlc2NyaXB0aW9uIHRpdGxlPVwiU2VydmVyIFVSTFwiIHRleHQ9e3NlcnZlck1lc3NhZ2V9IC8+fVxuICAgICAgPEZvcm0uRGVzY3JpcHRpb24gdGl0bGU9XCJWYXVsdCBTdGF0dXNcIiB0ZXh0PXt1c2VyTWVzc2FnZX0gLz5cbiAgICAgIDxQYXNzd29yZEZpZWxkXG4gICAgICAgIGlkPXtwYXNzd29yZEZpZWxkSWR9XG4gICAgICAgIHRpdGxlPVwiTWFzdGVyIFBhc3N3b3JkXCJcbiAgICAgICAgdmFsdWU9e3Bhc3N3b3JkfVxuICAgICAgICBvbkNoYW5nZT17c2V0UGFzc3dvcmR9XG4gICAgICAgIHJlZj17KGZpZWxkKSA9PiBmaWVsZD8uZm9jdXMoKX1cbiAgICAgIC8+XG4gICAgICA8Rm9ybS5EZXNjcmlwdGlvblxuICAgICAgICB0aXRsZT1cIlwiXG4gICAgICAgIHRleHQ9e2BQcmVzcyAke3BsYXRmb3JtID09PSBcIm1hY29zXCIgPyBcIlx1MjMyNVwiIDogXCJBbHRcIn0rRSB0byAke3Nob3dQYXNzd29yZCA/IFwiaGlkZVwiIDogXCJzaG93XCJ9IHBhc3N3b3JkYH1cbiAgICAgIC8+XG4gICAgICB7ISFsb2NrUmVhc29uICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8Rm9ybS5EZXNjcmlwdGlvbiB0aXRsZT1cIlx1MjEzOVx1RkUwRlwiIHRleHQ9e2xvY2tSZWFzb259IC8+XG4gICAgICAgICAgPFRpbWVvdXRJbmZvRGVzY3JpcHRpb24gLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgIDwvRm9ybT5cbiAgKTtcbn07XG5cbmZ1bmN0aW9uIFRpbWVvdXRJbmZvRGVzY3JpcHRpb24oKSB7XG4gIGNvbnN0IHZhdWx0VGltZW91dE1zID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxBbGxQcmVmZXJlbmNlcz4oKS5yZXByb21wdElnbm9yZUR1cmF0aW9uO1xuICBjb25zdCB0aW1lb3V0TGFiZWwgPSBnZXRMYWJlbEZvclRpbWVvdXRQcmVmZXJlbmNlKHZhdWx0VGltZW91dE1zKTtcblxuICBpZiAoIXRpbWVvdXRMYWJlbCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiAoXG4gICAgPEZvcm0uRGVzY3JpcHRpb25cbiAgICAgIHRpdGxlPVwiXCJcbiAgICAgIHRleHQ9e2BUaW1lb3V0IGlzIHNldCB0byAke3RpbWVvdXRMYWJlbH0sIHRoaXMgY2FuIGJlIGNvbmZpZ3VyZWQgaW4gdGhlIGV4dGVuc2lvbiBzZXR0aW5nc2B9XG4gICAgLz5cbiAgKTtcbn1cblxuZnVuY3Rpb24gZ2V0VXNlZnVsRXJyb3IoZXJyb3I6IHVua25vd24sIHBhc3N3b3JkOiBzdHJpbmcpIHtcbiAgY29uc3QgdHJlYXRlZEVycm9yID0gdHJlYXRFcnJvcihlcnJvciwgeyBvbWl0U2Vuc2l0aXZlVmFsdWU6IHBhc3N3b3JkIH0pO1xuICBsZXQgZGlzcGxheWFibGVFcnJvcjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBpZiAoL0ludmFsaWQgbWFzdGVyIHBhc3N3b3JkL2kudGVzdCh0cmVhdGVkRXJyb3IpKSB7XG4gICAgZGlzcGxheWFibGVFcnJvciA9IFwiSW52YWxpZCBtYXN0ZXIgcGFzc3dvcmRcIjtcbiAgfSBlbHNlIGlmICgvSW52YWxpZCBBUEkgS2V5L2kudGVzdCh0cmVhdGVkRXJyb3IpKSB7XG4gICAgZGlzcGxheWFibGVFcnJvciA9IFwiSW52YWxpZCBDbGllbnQgSUQgb3IgU2VjcmV0XCI7XG4gIH1cbiAgcmV0dXJuIHsgZGlzcGxheWFibGVFcnJvciwgdHJlYXRlZEVycm9yIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IFVubG9ja0Zvcm07XG4iLCAiLyogUHV0IGNvbnN0YW50cyB0aGF0IHlvdSBmZWVsIGxpa2UgdGhleSBzdGlsbCBkb24ndCBkZXNlcnZlIGEgZmlsZSBvZiB0aGVpciBvd24gaGVyZSAqL1xuXG5pbXBvcnQgeyBJY29uLCBLZXlib2FyZCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IEl0ZW1UeXBlIH0gZnJvbSBcIn4vdHlwZXMvdmF1bHRcIjtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VSVkVSX1VSTCA9IFwiaHR0cHM6Ly9iaXR3YXJkZW4uY29tXCI7XG5cbmV4cG9ydCBjb25zdCBTRU5TSVRJVkVfVkFMVUVfUExBQ0VIT0xERVIgPSBcIkhJRERFTi1WQUxVRVwiO1xuXG5leHBvcnQgY29uc3QgTE9DQUxfU1RPUkFHRV9LRVkgPSB7XG4gIFBBU1NXT1JEX09QVElPTlM6IFwiYnctZ2VuZXJhdGUtcGFzc3dvcmQtb3B0aW9uc1wiLFxuICBQQVNTV09SRF9PTkVfVElNRV9XQVJOSU5HOiBcImJ3LWdlbmVyYXRlLXBhc3N3b3JkLXdhcm5pbmctYWNjZXB0ZWRcIixcbiAgU0VTU0lPTl9UT0tFTjogXCJzZXNzaW9uVG9rZW5cIixcbiAgUkVQUk9NUFRfSEFTSDogXCJzZXNzaW9uUmVwcm9tcHRIYXNoXCIsXG4gIFNFUlZFUl9VUkw6IFwiY2xpU2VydmVyXCIsXG4gIExBU1RfQUNUSVZJVFlfVElNRTogXCJsYXN0QWN0aXZpdHlUaW1lXCIsXG4gIFZBVUxUX0xPQ0tfUkVBU09OOiBcInZhdWx0TG9ja1JlYXNvblwiLFxuICBWQVVMVF9GQVZPUklURV9PUkRFUjogXCJ2YXVsdEZhdm9yaXRlT3JkZXJcIixcbiAgVkFVTFRfTEFTVF9TVEFUVVM6IFwibGFzdFZhdWx0U3RhdHVzXCIsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgVkFVTFRfTE9DS19NRVNTQUdFUyA9IHtcbiAgVElNRU9VVDogXCJWYXVsdCB0aW1lZCBvdXQgZHVlIHRvIGluYWN0aXZpdHlcIixcbiAgTUFOVUFMOiBcIk1hbnVhbGx5IGxvY2tlZCBieSB0aGUgdXNlclwiLFxuICBTWVNURU1fTE9DSzogXCJTY3JlZW4gd2FzIGxvY2tlZFwiLFxuICBTWVNURU1fU0xFRVA6IFwiU3lzdGVtIHdlbnQgdG8gc2xlZXBcIixcbiAgQ0xJX1VQREFURUQ6IFwiQml0d2FyZGVuIGhhcyBiZWVuIHVwZGF0ZWQuIFBsZWFzZSBsb2dpbiBhZ2Fpbi5cIixcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBTSE9SVENVVF9LRVlfU0VRVUVOQ0U6IEtleWJvYXJkLktleUVxdWl2YWxlbnRbXSA9IFtcbiAgXCIxXCIsXG4gIFwiMlwiLFxuICBcIjNcIixcbiAgXCI0XCIsXG4gIFwiNVwiLFxuICBcIjZcIixcbiAgXCI3XCIsXG4gIFwiOFwiLFxuICBcIjlcIixcbiAgXCJiXCIsXG4gIFwiY1wiLFxuICBcImRcIixcbiAgXCJlXCIsXG4gIFwiZlwiLFxuICBcImdcIixcbiAgXCJoXCIsXG4gIFwiaVwiLFxuICBcImpcIixcbiAgXCJrXCIsXG4gIFwibFwiLFxuICBcIm1cIixcbiAgXCJuXCIsXG4gIFwib1wiLFxuICBcInBcIixcbiAgXCJxXCIsXG4gIFwiclwiLFxuICBcInNcIixcbiAgXCJ0XCIsXG4gIFwidVwiLFxuICBcInZcIixcbiAgXCJ3XCIsXG4gIFwieFwiLFxuICBcInlcIixcbiAgXCJ6XCIsXG4gIFwiK1wiLFxuICBcIi1cIixcbiAgXCIuXCIsXG4gIFwiLFwiLFxuXTtcblxuZXhwb3J0IGNvbnN0IEZPTERFUl9PUFRJT05TID0ge1xuICBBTEw6IFwiYWxsXCIsXG4gIE5PX0ZPTERFUjogXCJuby1mb2xkZXJcIixcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBDQUNIRV9LRVlTID0ge1xuICBJVjogXCJpdlwiLFxuICBWQVVMVDogXCJ2YXVsdFwiLFxuICBDVVJSRU5UX0ZPTERFUl9JRDogXCJjdXJyZW50Rm9sZGVySWRcIixcbiAgU0VORF9UWVBFX0ZJTFRFUjogXCJzZW5kVHlwZUZpbHRlclwiLFxuICBDTElfVkVSU0lPTjogXCJjbGlWZXJzaW9uXCIsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgSVRFTV9UWVBFX1RPX0lDT05fTUFQOiBSZWNvcmQ8SXRlbVR5cGUsIEljb24+ID0ge1xuICBbSXRlbVR5cGUuTE9HSU5dOiBJY29uLkdsb2JlLFxuICBbSXRlbVR5cGUuQ0FSRF06IEljb24uQ3JlZGl0Q2FyZCxcbiAgW0l0ZW1UeXBlLklERU5USVRZXTogSWNvbi5QZXJzb24sXG4gIFtJdGVtVHlwZS5OT1RFXTogSWNvbi5Eb2N1bWVudCxcbiAgW0l0ZW1UeXBlLlNTSF9LRVldOiBJY29uLktleSxcbn07XG4iLCAiaW1wb3J0IHsgY3JlYXRlQ29udGV4dCwgUHJvcHNXaXRoQ2hpbGRyZW4sIFJlYWN0Tm9kZSwgdXNlQ29udGV4dCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEJpdHdhcmRlbiB9IGZyb20gXCJ+L2FwaS9iaXR3YXJkZW5cIjtcbmltcG9ydCB7IExvYWRpbmdGYWxsYmFjayB9IGZyb20gXCJ+L2NvbXBvbmVudHMvTG9hZGluZ0ZhbGxiYWNrXCI7XG5pbXBvcnQgVHJvdWJsZXNob290aW5nR3VpZGUgZnJvbSBcIn4vY29tcG9uZW50cy9Ucm91Ymxlc2hvb3RpbmdHdWlkZVwiO1xuaW1wb3J0IHsgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvciB9IGZyb20gXCJ+L3V0aWxzL2Vycm9yc1wiO1xuaW1wb3J0IHVzZU9uY2VFZmZlY3QgZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlT25jZUVmZmVjdFwiO1xuXG5jb25zdCBCaXR3YXJkZW5Db250ZXh0ID0gY3JlYXRlQ29udGV4dDxCaXR3YXJkZW4gfCBudWxsPihudWxsKTtcblxuZXhwb3J0IHR5cGUgQml0d2FyZGVuUHJvdmlkZXJQcm9wcyA9IFByb3BzV2l0aENoaWxkcmVuPHtcbiAgbG9hZGluZ0ZhbGxiYWNrPzogUmVhY3ROb2RlO1xufT47XG5cbmV4cG9ydCBjb25zdCBCaXR3YXJkZW5Qcm92aWRlciA9ICh7IGNoaWxkcmVuLCBsb2FkaW5nRmFsbGJhY2sgPSA8TG9hZGluZ0ZhbGxiYWNrIC8+IH06IEJpdHdhcmRlblByb3ZpZGVyUHJvcHMpID0+IHtcbiAgY29uc3QgW2JpdHdhcmRlbiwgc2V0Qml0d2FyZGVuXSA9IHVzZVN0YXRlPEJpdHdhcmRlbj4oKTtcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxFcnJvcj4oKTtcblxuICB1c2VPbmNlRWZmZWN0KCgpID0+IHtcbiAgICB2b2lkIG5ldyBCaXR3YXJkZW4oKS5pbml0aWFsaXplKCkudGhlbihzZXRCaXR3YXJkZW4pLmNhdGNoKGhhbmRsZUJ3SW5pdEVycm9yKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gaGFuZGxlQndJbml0RXJyb3IoZXJyb3I6IEVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvcikge1xuICAgICAgc2V0RXJyb3IoZXJyb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICBpZiAoZXJyb3IpIHJldHVybiA8VHJvdWJsZXNob290aW5nR3VpZGUgZXJyb3I9e2Vycm9yfSAvPjtcbiAgaWYgKCFiaXR3YXJkZW4pIHJldHVybiBsb2FkaW5nRmFsbGJhY2s7XG5cbiAgcmV0dXJuIDxCaXR3YXJkZW5Db250ZXh0LlByb3ZpZGVyIHZhbHVlPXtiaXR3YXJkZW59PntjaGlsZHJlbn08L0JpdHdhcmRlbkNvbnRleHQuUHJvdmlkZXI+O1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZUJpdHdhcmRlbiA9ICgpID0+IHtcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoQml0d2FyZGVuQ29udGV4dCk7XG4gIGlmIChjb250ZXh0ID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1c2VCaXR3YXJkZW4gbXVzdCBiZSB1c2VkIHdpdGhpbiBhIEJpdHdhcmRlblByb3ZpZGVyXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNvbnRleHQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBCaXR3YXJkZW5Db250ZXh0O1xuIiwgImltcG9ydCB7IGVudmlyb25tZW50LCBnZXRQcmVmZXJlbmNlVmFsdWVzLCBMb2NhbFN0b3JhZ2UsIG9wZW4sIHNob3dUb2FzdCwgVG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBleGVjYSwgRXhlY2FDaGlsZFByb2Nlc3MsIEV4ZWNhRXJyb3IsIEV4ZWNhUmV0dXJuVmFsdWUgfSBmcm9tIFwiZXhlY2FcIjtcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHVubGlua1N5bmMsIHdyaXRlRmlsZVN5bmMsIGFjY2Vzc1N5bmMsIGNvbnN0YW50cywgY2htb2RTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBMT0NBTF9TVE9SQUdFX0tFWSwgREVGQVVMVF9TRVJWRVJfVVJMLCBDQUNIRV9LRVlTIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcbmltcG9ydCB7IFZhdWx0U3RhdGUsIFZhdWx0U3RhdHVzIH0gZnJvbSBcIn4vdHlwZXMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zIH0gZnJvbSBcIn4vdHlwZXMvcGFzc3dvcmRzXCI7XG5pbXBvcnQgeyBGb2xkZXIsIEl0ZW0sIEl0ZW1UeXBlLCBMb2dpbiB9IGZyb20gXCJ+L3R5cGVzL3ZhdWx0XCI7XG5pbXBvcnQgeyBnZXRQYXNzd29yZEdlbmVyYXRpbmdBcmdzIH0gZnJvbSBcIn4vdXRpbHMvcGFzc3dvcmRzXCI7XG5pbXBvcnQgeyBnZXRTZXJ2ZXJVcmxQcmVmZXJlbmNlIH0gZnJvbSBcIn4vdXRpbHMvcHJlZmVyZW5jZXNcIjtcbmltcG9ydCB7XG4gIEVuc3VyZUNsaUJpbkVycm9yLFxuICBJbnN0YWxsZWRDTElOb3RGb3VuZEVycm9yLFxuICBNYW51YWxseVRocm93bkVycm9yLFxuICBOb3RMb2dnZWRJbkVycm9yLFxuICBQcmVtaXVtRmVhdHVyZUVycm9yLFxuICBTZW5kSW52YWxpZFBhc3N3b3JkRXJyb3IsXG4gIFNlbmROZWVkc1Bhc3N3b3JkRXJyb3IsXG4gIHRyeUV4ZWMsXG4gIFZhdWx0SXNMb2NrZWRFcnJvcixcbn0gZnJvbSBcIn4vdXRpbHMvZXJyb3JzXCI7XG5pbXBvcnQgeyBqb2luLCBkaXJuYW1lIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNobW9kLCByZW5hbWUsIHJtIH0gZnJvbSBcImZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyBkZWNvbXByZXNzRmlsZSwgcmVtb3ZlRmlsZXNUaGF0U3RhcnRXaXRoLCB1bmxpbmtBbGxTeW5jLCB3YWl0Rm9yRmlsZUF2YWlsYWJsZSB9IGZyb20gXCJ+L3V0aWxzL2ZzXCI7XG5pbXBvcnQgeyBkb3dubG9hZCB9IGZyb20gXCJ+L3V0aWxzL25ldHdvcmtcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuaW1wb3J0IHsgUmVjZWl2ZWRTZW5kLCBTZW5kLCBTZW5kQ3JlYXRlUGF5bG9hZCwgU2VuZFR5cGUgfSBmcm9tIFwifi90eXBlcy9zZW5kXCI7XG5pbXBvcnQgeyBwcmVwYXJlU2VuZFBheWxvYWQgfSBmcm9tIFwifi9hcGkvYml0d2FyZGVuLmhlbHBlcnNcIjtcbmltcG9ydCB7IENhY2hlIH0gZnJvbSBcIn4vdXRpbHMvY2FjaGVcIjtcbmltcG9ydCB7IHBsYXRmb3JtIH0gZnJvbSBcIn4vdXRpbHMvcGxhdGZvcm1cIjtcblxudHlwZSBFbnYgPSB7XG4gIEJJVFdBUkRFTkNMSV9BUFBEQVRBX0RJUjogc3RyaW5nO1xuICBCV19DTElFTlRTRUNSRVQ6IHN0cmluZztcbiAgQldfQ0xJRU5USUQ6IHN0cmluZztcbiAgUEFUSDogc3RyaW5nO1xuICBOT0RFX0VYVFJBX0NBX0NFUlRTPzogc3RyaW5nO1xuICBCV19TRVNTSU9OPzogc3RyaW5nO1xufTtcblxudHlwZSBBY3Rpb25MaXN0ZW5lcnMgPSB7XG4gIGxvZ2luPzogKCkgPT4gTWF5YmVQcm9taXNlPHZvaWQ+O1xuICBsb2dvdXQ/OiAocmVhc29uPzogc3RyaW5nKSA9PiBNYXliZVByb21pc2U8dm9pZD47XG4gIGxvY2s/OiAocmVhc29uPzogc3RyaW5nKSA9PiBNYXliZVByb21pc2U8dm9pZD47XG4gIHVubG9jaz86IChwYXNzd29yZDogc3RyaW5nLCBzZXNzaW9uVG9rZW46IHN0cmluZykgPT4gTWF5YmVQcm9taXNlPHZvaWQ+O1xufTtcblxudHlwZSBBY3Rpb25MaXN0ZW5lcnNNYXA8VCBleHRlbmRzIGtleW9mIEFjdGlvbkxpc3RlbmVycyA9IGtleW9mIEFjdGlvbkxpc3RlbmVycz4gPSBNYXA8VCwgU2V0PEFjdGlvbkxpc3RlbmVyc1tUXT4+O1xuXG50eXBlIE1heWJlRXJyb3I8VCA9IHVuZGVmaW5lZD4gPSB7IHJlc3VsdDogVDsgZXJyb3I/OiB1bmRlZmluZWQgfSB8IHsgcmVzdWx0PzogdW5kZWZpbmVkOyBlcnJvcjogTWFudWFsbHlUaHJvd25FcnJvciB9O1xuXG50eXBlIEV4ZWNQcm9wcyA9IHtcbiAgLyoqIFJlc2V0IHRoZSB0aW1lIG9mIHRoZSBsYXN0IGNvbW1hbmQgdGhhdCBhY2Nlc3NlZCBkYXRhIG9yIG1vZGlmaWVkIHRoZSB2YXVsdCwgdXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIHZhdWx0IHRpbWVkIG91dCAqL1xuICByZXNldFZhdWx0VGltZW91dDogYm9vbGVhbjtcbiAgYWJvcnRDb250cm9sbGVyPzogQWJvcnRDb250cm9sbGVyO1xuICBpbnB1dD86IHN0cmluZztcbn07XG5cbnR5cGUgTG9ja09wdGlvbnMgPSB7XG4gIC8qKiBUaGUgcmVhc29uIGZvciBsb2NraW5nIHRoZSB2YXVsdCAqL1xuICByZWFzb24/OiBzdHJpbmc7XG4gIGNoZWNrVmF1bHRTdGF0dXM/OiBib29sZWFuO1xuICAvKiogVGhlIGNhbGxiYWNrcyBhcmUgY2FsbGVkIGJlZm9yZSB0aGUgb3BlcmF0aW9uIGlzIGZpbmlzaGVkIChvcHRpbWlzdGljKSAqL1xuICBpbW1lZGlhdGU/OiBib29sZWFuO1xufTtcblxudHlwZSBMb2dvdXRPcHRpb25zID0ge1xuICAvKiogVGhlIHJlYXNvbiBmb3IgbG9ja2luZyB0aGUgdmF1bHQgKi9cbiAgcmVhc29uPzogc3RyaW5nO1xuICAvKiogVGhlIGNhbGxiYWNrcyBhcmUgY2FsbGVkIGJlZm9yZSB0aGUgb3BlcmF0aW9uIGlzIGZpbmlzaGVkIChvcHRpbWlzdGljKSAqL1xuICBpbW1lZGlhdGU/OiBib29sZWFuO1xufTtcblxudHlwZSBSZWNlaXZlU2VuZE9wdGlvbnMgPSB7XG4gIHNhdmVQYXRoPzogc3RyaW5nO1xuICBwYXNzd29yZD86IHN0cmluZztcbn07XG5cbnR5cGUgQ3JlYXRlTG9naW5JdGVtT3B0aW9ucyA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICB1c2VybmFtZT86IHN0cmluZztcbiAgcGFzc3dvcmQ6IHN0cmluZztcbiAgZm9sZGVySWQ6IHN0cmluZyB8IG51bGw7XG4gIHVyaT86IHN0cmluZztcbn07XG5cbmNvbnN0IHsgc3VwcG9ydFBhdGggfSA9IGVudmlyb25tZW50O1xuXG5jb25zdCBcdTAzOTQgPSBcIjRcIjsgLy8gY2hhbmdpbmcgdGhpcyBmb3JjZXMgYSBuZXcgYmluIGRvd25sb2FkIGZvciBwZW9wbGUgdGhhdCBoYWQgYSBmYWlsZWQgb25lXG5jb25zdCBCaW5Eb3dubG9hZExvZ2dlciA9ICgoKSA9PiB7XG4gIC8qIFRoZSBpZGVhIG9mIHRoaXMgbG9nZ2VyIGlzIHRvIHdyaXRlIGEgbG9nIGZpbGUgd2hlbiB0aGUgYmluIGRvd25sb2FkIGZhaWxzLCBzbyB0aGF0IHdlIGNhbiBsZXQgdGhlIGV4dGVuc2lvbiBjcmFzaCxcbiAgIGJ1dCBmYWxsYmFjayB0byB0aGUgbG9jYWwgY2xpIHBhdGggaW4gdGhlIG5leHQgbGF1bmNoLiBUaGlzIGFsbG93cyB0aGUgZXJyb3IgdG8gYmUgcmVwb3J0ZWQgaW4gdGhlIGlzc3VlcyBkYXNoYm9hcmQuIEl0IHVzZXMgZmlsZXMgdG8ga2VlcCBpdCBzeW5jaHJvbm91cywgYXMgaXQncyBuZWVkZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICAgQWx0aG91Z2gsIHRoZSBwbGFuIGlzIHRvIGRpc2NvbnRpbnVlIHRoaXMgbWV0aG9kLCBpZiB0aGVyZSdzIGEgYmV0dGVyIHdheSBvZiBsb2dnaW5nIGVycm9ycyBpbiB0aGUgaXNzdWVzIGRhc2hib2FyZFxuICAgb3IgdGhlcmUgYXJlIG5vIGNyYXNoZXMgcmVwb3J0ZWQgd2l0aCB0aGUgYmluIGRvd25sb2FkIGFmdGVyIHNvbWUgdGltZS4gKi9cbiAgY29uc3QgZmlsZVBhdGggPSBqb2luKHN1cHBvcnRQYXRoLCBgYnctYmluLWRvd25sb2FkLWVycm9yLSR7XHUwMzk0fS5sb2dgKTtcbiAgcmV0dXJuIHtcbiAgICBsb2dFcnJvcjogKGVycm9yOiBhbnkpID0+IHRyeUV4ZWMoKCkgPT4gd3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgZXJyb3I/Lm1lc3NhZ2UgPz8gXCJVbmV4cGVjdGVkIGVycm9yXCIpKSxcbiAgICBjbGVhckVycm9yOiAoKSA9PiB0cnlFeGVjKCgpID0+IHVubGlua1N5bmMoZmlsZVBhdGgpKSxcbiAgICBoYXNFcnJvcjogKCkgPT4gdHJ5RXhlYygoKSA9PiBleGlzdHNTeW5jKGZpbGVQYXRoKSwgZmFsc2UpLFxuICB9O1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IGNsaUluZm8gPSB7XG4gIHZlcnNpb246IFwiMjAyNS4yLjBcIixcbiAgZ2V0IHNoYTI1NigpIHtcbiAgICBpZiAocGxhdGZvcm0gPT09IFwid2luZG93c1wiKSByZXR1cm4gXCIzM2ExMzEwMTdhYzljOTlkNzIxZTQzMGE4NmU5MjkzODMzMTRkM2Y5MWM5ZjJmYmY0MTNkODcyNTY1NjU0YzE4XCI7XG4gICAgcmV0dXJuIFwiZmFkZTUxMDEyYTQ2MDExYzAxNmEyZTVhZWUyZjJlNTM0YzFlZDA3OGU0OWQxMTc4YTY5ZTI4ODlkMjgxMmE5NlwiO1xuICB9LFxuICBkb3dubG9hZFBhZ2U6IFwiaHR0cHM6Ly9naXRodWIuY29tL2JpdHdhcmRlbi9jbGllbnRzL3JlbGVhc2VzXCIsXG4gIHBhdGg6IHtcbiAgICBnZXQgZG93bmxvYWRlZEJpbigpIHtcbiAgICAgIHJldHVybiBqb2luKHN1cHBvcnRQYXRoLCBjbGlJbmZvLmJpbkZpbGVuYW1lVmVyc2lvbmVkKTtcbiAgICB9LFxuICAgIGdldCBpbnN0YWxsZWRCaW4oKSB7XG4gICAgICAvLyBXZSBhc3N1bWUgdGhhdCBpdCB3YXMgaW5zdGFsbGVkIHVzaW5nIENob2NvbGF0ZXksIGlmIG5vdCwgaXQncyBoYXJkIHRvIG1ha2UgYSBnb29kIGd1ZXNzLlxuICAgICAgaWYgKHBsYXRmb3JtID09PSBcIndpbmRvd3NcIikgcmV0dXJuIFwiQzpcXFxcUHJvZ3JhbURhdGFcXFxcY2hvY29sYXRleVxcXFxiaW5cXFxcYncuZXhlXCI7XG4gICAgICByZXR1cm4gcHJvY2Vzcy5hcmNoID09PSBcImFybTY0XCIgPyBcIi9vcHQvaG9tZWJyZXcvYmluL2J3XCIgOiBcIi91c3IvbG9jYWwvYmluL2J3XCI7XG4gICAgfSxcbiAgICBnZXQgYmluKCkge1xuICAgICAgcmV0dXJuICFCaW5Eb3dubG9hZExvZ2dlci5oYXNFcnJvcigpID8gdGhpcy5kb3dubG9hZGVkQmluIDogdGhpcy5pbnN0YWxsZWRCaW47XG4gICAgfSxcbiAgfSxcbiAgZ2V0IGJpbkZpbGVuYW1lKCkge1xuICAgIHJldHVybiBwbGF0Zm9ybSA9PT0gXCJ3aW5kb3dzXCIgPyBcImJ3LmV4ZVwiIDogXCJid1wiO1xuICB9LFxuICBnZXQgYmluRmlsZW5hbWVWZXJzaW9uZWQoKSB7XG4gICAgY29uc3QgbmFtZSA9IGBidy0ke3RoaXMudmVyc2lvbn1gO1xuICAgIHJldHVybiBwbGF0Zm9ybSA9PT0gXCJ3aW5kb3dzXCIgPyBgJHtuYW1lfS5leGVgIDogYCR7bmFtZX1gO1xuICB9LFxuICBnZXQgZG93bmxvYWRVcmwoKSB7XG4gICAgbGV0IGFyY2hTdWZmaXggPSBcIlwiO1xuICAgIGlmIChwbGF0Zm9ybSA9PT0gXCJtYWNvc1wiKSB7XG4gICAgICBhcmNoU3VmZml4ID0gcHJvY2Vzcy5hcmNoID09PSBcImFybTY0XCIgPyBcIi1hcm02NFwiIDogXCJcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7dGhpcy5kb3dubG9hZFBhZ2V9L2Rvd25sb2FkL2NsaS12JHt0aGlzLnZlcnNpb259L2J3LSR7cGxhdGZvcm19JHthcmNoU3VmZml4fS0ke3RoaXMudmVyc2lvbn0uemlwYDtcbiAgfSxcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjbGFzcyBCaXR3YXJkZW4ge1xuICBwcml2YXRlIGVudjogRW52O1xuICBwcml2YXRlIGluaXRQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuICBwcml2YXRlIHRlbXBTZXNzaW9uVG9rZW4/OiBzdHJpbmc7XG4gIHByaXZhdGUgYWN0aW9uTGlzdGVuZXJzOiBBY3Rpb25MaXN0ZW5lcnNNYXAgPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgcHJlZmVyZW5jZXMgPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpO1xuICBwcml2YXRlIGNsaVBhdGg6IHN0cmluZztcbiAgcHJpdmF0ZSB0b2FzdEluc3RhbmNlOiBUb2FzdCB8IHVuZGVmaW5lZDtcbiAgd2FzQ2xpVXBkYXRlZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHRvYXN0SW5zdGFuY2U/OiBUb2FzdCkge1xuICAgIGNvbnN0IHsgY2xpUGF0aDogY2xpUGF0aFByZWZlcmVuY2UsIGNsaWVudElkLCBjbGllbnRTZWNyZXQsIHNlcnZlckNlcnRzUGF0aCB9ID0gdGhpcy5wcmVmZXJlbmNlcztcbiAgICBjb25zdCBzZXJ2ZXJVcmwgPSBnZXRTZXJ2ZXJVcmxQcmVmZXJlbmNlKCk7XG5cbiAgICB0aGlzLnRvYXN0SW5zdGFuY2UgPSB0b2FzdEluc3RhbmNlO1xuICAgIHRoaXMuY2xpUGF0aCA9IGNsaVBhdGhQcmVmZXJlbmNlIHx8IGNsaUluZm8ucGF0aC5iaW47XG4gICAgdGhpcy5lbnYgPSB7XG4gICAgICBCSVRXQVJERU5DTElfQVBQREFUQV9ESVI6IHN1cHBvcnRQYXRoLFxuICAgICAgQldfQ0xJRU5UU0VDUkVUOiBjbGllbnRTZWNyZXQudHJpbSgpLFxuICAgICAgQldfQ0xJRU5USUQ6IGNsaWVudElkLnRyaW0oKSxcbiAgICAgIFBBVEg6IGRpcm5hbWUocHJvY2Vzcy5leGVjUGF0aCksXG4gICAgICAuLi4oc2VydmVyVXJsICYmIHNlcnZlckNlcnRzUGF0aCA/IHsgTk9ERV9FWFRSQV9DQV9DRVJUUzogc2VydmVyQ2VydHNQYXRoIH0gOiB7fSksXG4gICAgfTtcblxuICAgIHRoaXMuaW5pdFByb21pc2UgPSAoYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgYXdhaXQgdGhpcy5lbnN1cmVDbGlCaW5hcnkoKTtcbiAgICAgIHZvaWQgdGhpcy5yZXRyaWV2ZUFuZENhY2hlQ2xpVmVyc2lvbigpO1xuICAgICAgYXdhaXQgdGhpcy5jaGVja1NlcnZlclVybChzZXJ2ZXJVcmwpO1xuICAgIH0pKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGVuc3VyZUNsaUJpbmFyeSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5jaGVja0NsaUJpbklzUmVhZHkodGhpcy5jbGlQYXRoKSkgcmV0dXJuO1xuICAgIGlmICh0aGlzLmNsaVBhdGggPT09IHRoaXMucHJlZmVyZW5jZXMuY2xpUGF0aCB8fCB0aGlzLmNsaVBhdGggPT09IGNsaUluZm8ucGF0aC5pbnN0YWxsZWRCaW4pIHtcbiAgICAgIHRocm93IG5ldyBJbnN0YWxsZWRDTElOb3RGb3VuZEVycm9yKGBCaXR3YXJkZW4gQ0xJIG5vdCBmb3VuZCBhdCAke3RoaXMuY2xpUGF0aH1gKTtcbiAgICB9XG4gICAgaWYgKEJpbkRvd25sb2FkTG9nZ2VyLmhhc0Vycm9yKCkpIEJpbkRvd25sb2FkTG9nZ2VyLmNsZWFyRXJyb3IoKTtcblxuICAgIC8vIHJlbW92ZSBvbGQgYmluYXJpZXMgdG8gY2hlY2sgaWYgaXQncyBhbiB1cGRhdGUgYW5kIGJlY2F1c2UgdGhleSBhcmUgMTAwTUIrXG4gICAgY29uc3QgaGFkT2xkQmluYXJpZXMgPSBhd2FpdCByZW1vdmVGaWxlc1RoYXRTdGFydFdpdGgoXCJidy1cIiwgc3VwcG9ydFBhdGgpO1xuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgdGhpcy5zaG93VG9hc3Qoe1xuICAgICAgdGl0bGU6IGAke2hhZE9sZEJpbmFyaWVzID8gXCJVcGRhdGluZ1wiIDogXCJJbml0aWFsaXppbmdcIn0gQml0d2FyZGVuIENMSWAsXG4gICAgICBzdHlsZTogVG9hc3QuU3R5bGUuQW5pbWF0ZWQsXG4gICAgICBwcmltYXJ5QWN0aW9uOiB7IHRpdGxlOiBcIk9wZW4gRG93bmxvYWQgUGFnZVwiLCBvbkFjdGlvbjogKCkgPT4gb3BlbihjbGlJbmZvLmRvd25sb2FkUGFnZSkgfSxcbiAgICB9KTtcbiAgICBjb25zdCB0bXBGaWxlTmFtZSA9IFwiYncuemlwXCI7XG4gICAgY29uc3QgemlwUGF0aCA9IGpvaW4oc3VwcG9ydFBhdGgsIHRtcEZpbGVOYW1lKTtcblxuICAgIHRyeSB7XG4gICAgICB0cnkge1xuICAgICAgICB0b2FzdC5tZXNzYWdlID0gXCJEb3dubG9hZGluZy4uLlwiO1xuICAgICAgICBhd2FpdCBkb3dubG9hZChjbGlJbmZvLmRvd25sb2FkVXJsLCB6aXBQYXRoLCB7XG4gICAgICAgICAgb25Qcm9ncmVzczogKHBlcmNlbnQpID0+ICh0b2FzdC5tZXNzYWdlID0gYERvd25sb2FkaW5nICR7cGVyY2VudH0lYCksXG4gICAgICAgICAgc2hhMjU2OiBjbGlJbmZvLnNoYTI1NixcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChkb3dubG9hZEVycm9yKSB7XG4gICAgICAgIHRvYXN0LnRpdGxlID0gXCJGYWlsZWQgdG8gZG93bmxvYWQgQml0d2FyZGVuIENMSVwiO1xuICAgICAgICB0aHJvdyBkb3dubG9hZEVycm9yO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICB0b2FzdC5tZXNzYWdlID0gXCJFeHRyYWN0aW5nLi4uXCI7XG4gICAgICAgIGF3YWl0IGRlY29tcHJlc3NGaWxlKHppcFBhdGgsIHN1cHBvcnRQYXRoKTtcbiAgICAgICAgY29uc3QgZGVjb21wcmVzc2VkQmluUGF0aCA9IGpvaW4oc3VwcG9ydFBhdGgsIGNsaUluZm8uYmluRmlsZW5hbWUpO1xuXG4gICAgICAgIC8vIEZvciBzb21lIHJlYXNvbiB0aGlzIHJlbmFtZSBzdGFydGVkIHRocm93aW5nIGFuIGVycm9yIGFmdGVyIHN1Y2NlZWRpbmcsIHNvIGZvciBub3cgd2UncmUganVzdFxuICAgICAgICAvLyBjYXRjaGluZyBpdCBhbmQgY2hlY2tpbmcgaWYgdGhlIGZpbGUgZXhpc3RzIFx1MDBBRlxcXyhcdTMwQzQpXy9cdTAwQUZcbiAgICAgICAgYXdhaXQgcmVuYW1lKGRlY29tcHJlc3NlZEJpblBhdGgsIHRoaXMuY2xpUGF0aCkuY2F0Y2goKCkgPT4gbnVsbCk7XG4gICAgICAgIGF3YWl0IHdhaXRGb3JGaWxlQXZhaWxhYmxlKHRoaXMuY2xpUGF0aCk7XG5cbiAgICAgICAgYXdhaXQgY2htb2QodGhpcy5jbGlQYXRoLCBcIjc1NVwiKTtcbiAgICAgICAgYXdhaXQgcm0oemlwUGF0aCwgeyBmb3JjZTogdHJ1ZSB9KTtcblxuICAgICAgICBDYWNoZS5zZXQoQ0FDSEVfS0VZUy5DTElfVkVSU0lPTiwgY2xpSW5mby52ZXJzaW9uKTtcbiAgICAgICAgdGhpcy53YXNDbGlVcGRhdGVkID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGV4dHJhY3RFcnJvcikge1xuICAgICAgICB0b2FzdC50aXRsZSA9IFwiRmFpbGVkIHRvIGV4dHJhY3QgQml0d2FyZGVuIENMSVwiO1xuICAgICAgICB0aHJvdyBleHRyYWN0RXJyb3I7XG4gICAgICB9XG4gICAgICBhd2FpdCB0b2FzdC5oaWRlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRvYXN0Lm1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVuc3VyZUNsaUJpbkVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiUGxlYXNlIHRyeSBhZ2FpblwiO1xuICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5GYWlsdXJlO1xuXG4gICAgICB1bmxpbmtBbGxTeW5jKHppcFBhdGgsIHRoaXMuY2xpUGF0aCk7XG5cbiAgICAgIGlmICghZW52aXJvbm1lbnQuaXNEZXZlbG9wbWVudCkgQmluRG93bmxvYWRMb2dnZXIubG9nRXJyb3IoZXJyb3IpO1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHRocm93IG5ldyBFbnN1cmVDbGlCaW5FcnJvcihlcnJvci5tZXNzYWdlLCBlcnJvci5zdGFjayk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgdG9hc3QucmVzdG9yZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmV0cmlldmVBbmRDYWNoZUNsaVZlcnNpb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZXJyb3IsIHJlc3VsdCB9ID0gYXdhaXQgdGhpcy5nZXRWZXJzaW9uKCk7XG4gICAgICBpZiAoIWVycm9yKSBDYWNoZS5zZXQoQ0FDSEVfS0VZUy5DTElfVkVSU0lPTiwgcmVzdWx0KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byByZXRyaWV2ZSBhbmQgY2FjaGUgY2xpIHZlcnNpb25cIiwgZXJyb3IsIHsgY2FwdHVyZVRvUmF5Y2FzdDogdHJ1ZSB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNoZWNrQ2xpQmluSXNSZWFkeShmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZXhpc3RzU3luYyh0aGlzLmNsaVBhdGgpKSByZXR1cm4gZmFsc2U7XG4gICAgICBhY2Nlc3NTeW5jKGZpbGVQYXRoLCBjb25zdGFudHMuWF9PSyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGNobW9kU3luYyhmaWxlUGF0aCwgXCI3NTVcIik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBzZXRTZXNzaW9uVG9rZW4odG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuZW52ID0ge1xuICAgICAgLi4udGhpcy5lbnYsXG4gICAgICBCV19TRVNTSU9OOiB0b2tlbixcbiAgICB9O1xuICB9XG5cbiAgY2xlYXJTZXNzaW9uVG9rZW4oKTogdm9pZCB7XG4gICAgZGVsZXRlIHRoaXMuZW52LkJXX1NFU1NJT047XG4gIH1cblxuICB3aXRoU2Vzc2lvbih0b2tlbjogc3RyaW5nKTogdGhpcyB7XG4gICAgdGhpcy50ZW1wU2Vzc2lvblRva2VuID0gdG9rZW47XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dGhpcz4ge1xuICAgIGF3YWl0IHRoaXMuaW5pdFByb21pc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBjaGVja1NlcnZlclVybChzZXJ2ZXJVcmw6IHN0cmluZyB8IHVuZGVmaW5lZCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIENoZWNrIHRoZSBDTEkgaGFzIGJlZW4gY29uZmlndXJlZCB0byB1c2UgdGhlIHByZWZlcmVuY2UgVXJsXG4gICAgY29uc3Qgc3RvcmVkU2VydmVyID0gYXdhaXQgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5TRVJWRVJfVVJMKTtcbiAgICBpZiAoIXNlcnZlclVybCB8fCBzdG9yZWRTZXJ2ZXIgPT09IHNlcnZlclVybCkgcmV0dXJuO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzZXJ2ZXIgVXJsXG4gICAgY29uc3QgdG9hc3QgPSBhd2FpdCB0aGlzLnNob3dUb2FzdCh7XG4gICAgICBzdHlsZTogVG9hc3QuU3R5bGUuQW5pbWF0ZWQsXG4gICAgICB0aXRsZTogXCJTd2l0Y2hpbmcgc2VydmVyLi4uXCIsXG4gICAgICBtZXNzYWdlOiBcIkJpdHdhcmRlbiBzZXJ2ZXIgcHJlZmVyZW5jZSBjaGFuZ2VkXCIsXG4gICAgfSk7XG4gICAgdHJ5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9nb3V0KCk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gSXQgZG9lc24ndCBtYXR0ZXIgaWYgd2Ugd2VyZW4ndCBsb2dnZWQgaW4uXG4gICAgICB9XG4gICAgICAvLyBJZiBVUkwgaXMgZW1wdHksIHNldCBpdCB0byB0aGUgZGVmYXVsdFxuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImNvbmZpZ1wiLCBcInNlcnZlclwiLCBzZXJ2ZXJVcmwgfHwgREVGQVVMVF9TRVJWRVJfVVJMXSwgeyByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICBhd2FpdCBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5TRVJWRVJfVVJMLCBzZXJ2ZXJVcmwpO1xuXG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLlN1Y2Nlc3M7XG4gICAgICB0b2FzdC50aXRsZSA9IFwiU3VjY2Vzc1wiO1xuICAgICAgdG9hc3QubWVzc2FnZSA9IFwiQml0d2FyZGVuIHNlcnZlciBjaGFuZ2VkXCI7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuRmFpbHVyZTtcbiAgICAgIHRvYXN0LnRpdGxlID0gXCJGYWlsZWQgdG8gc3dpdGNoIHNlcnZlclwiO1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdG9hc3QubWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2FzdC5tZXNzYWdlID0gXCJVbmtub3duIGVycm9yIG9jY3VycmVkXCI7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGF3YWl0IHRvYXN0LnJlc3RvcmUoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGV4ZWMoYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IEV4ZWNQcm9wcyk6IFByb21pc2U8RXhlY2FDaGlsZFByb2Nlc3M+IHtcbiAgICBjb25zdCB7IGFib3J0Q29udHJvbGxlciwgaW5wdXQgPSBcIlwiLCByZXNldFZhdWx0VGltZW91dCB9ID0gb3B0aW9ucyA/PyB7fTtcblxuICAgIGxldCBlbnYgPSB0aGlzLmVudjtcbiAgICBpZiAodGhpcy50ZW1wU2Vzc2lvblRva2VuKSB7XG4gICAgICBlbnYgPSB7IC4uLmVudiwgQldfU0VTU0lPTjogdGhpcy50ZW1wU2Vzc2lvblRva2VuIH07XG4gICAgICB0aGlzLnRlbXBTZXNzaW9uVG9rZW4gPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY2EodGhpcy5jbGlQYXRoLCBhcmdzLCB7IGlucHV0LCBlbnYsIHNpZ25hbDogYWJvcnRDb250cm9sbGVyPy5zaWduYWwgfSk7XG5cbiAgICBpZiAodGhpcy5pc1Byb21wdFdhaXRpbmdGb3JNYXN0ZXJQYXNzd29yZChyZXN1bHQpKSB7XG4gICAgICAvKiBzaW5jZSB3ZSBoYXZlIHRoZSBzZXNzaW9uIHRva2VuIGluIHRoZSBlbnYsIHRoZSBwYXNzd29yZCBcbiAgICAgIHNob3VsZCBub3QgYmUgcmVxdWVzdGVkLCB1bmxlc3MgdGhlIHZhdWx0IGlzIGxvY2tlZCAqL1xuICAgICAgYXdhaXQgdGhpcy5sb2NrKCk7XG4gICAgICB0aHJvdyBuZXcgVmF1bHRJc0xvY2tlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlc2V0VmF1bHRUaW1lb3V0KSB7XG4gICAgICBhd2FpdCBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5MQVNUX0FDVElWSVRZX1RJTUUsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGFzeW5jIGdldFZlcnNpb24oKTogUHJvbWlzZTxNYXliZUVycm9yPHN0cmluZz4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQ6IHJlc3VsdCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcIi0tdmVyc2lvblwiXSwgeyByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IGNsaSB2ZXJzaW9uXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsb2dpbigpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImxvZ2luXCIsIFwiLS1hcGlrZXlcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJsb2dpblwiLCBcInVubG9ja2VkXCIpO1xuICAgICAgYXdhaXQgdGhpcy5jYWxsQWN0aW9uTGlzdGVuZXJzKFwibG9naW5cIik7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsb2dpblwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbG9nb3V0KG9wdGlvbnM/OiBMb2dvdXRPcHRpb25zKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgY29uc3QgeyByZWFzb24sIGltbWVkaWF0ZSA9IGZhbHNlIH0gPSBvcHRpb25zID8/IHt9O1xuICAgIHRyeSB7XG4gICAgICBpZiAoaW1tZWRpYXRlKSBhd2FpdCB0aGlzLmhhbmRsZVBvc3RMb2dvdXQocmVhc29uKTtcblxuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImxvZ291dFwiXSwgeyByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJsb2dvdXRcIiwgXCJ1bmF1dGhlbnRpY2F0ZWRcIik7XG4gICAgICBpZiAoIWltbWVkaWF0ZSkgYXdhaXQgdGhpcy5oYW5kbGVQb3N0TG9nb3V0KHJlYXNvbik7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsb2dvdXRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxvY2sob3B0aW9ucz86IExvY2tPcHRpb25zKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgY29uc3QgeyByZWFzb24sIGNoZWNrVmF1bHRTdGF0dXMgPSBmYWxzZSwgaW1tZWRpYXRlID0gZmFsc2UgfSA9IG9wdGlvbnMgPz8ge307XG4gICAgdHJ5IHtcbiAgICAgIGlmIChpbW1lZGlhdGUpIGF3YWl0IHRoaXMuY2FsbEFjdGlvbkxpc3RlbmVycyhcImxvY2tcIiwgcmVhc29uKTtcbiAgICAgIGlmIChjaGVja1ZhdWx0U3RhdHVzKSB7XG4gICAgICAgIGNvbnN0IHsgZXJyb3IsIHJlc3VsdCB9ID0gYXdhaXQgdGhpcy5zdGF0dXMoKTtcbiAgICAgICAgaWYgKGVycm9yKSB0aHJvdyBlcnJvcjtcbiAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwidW5hdXRoZW50aWNhdGVkXCIpIHJldHVybiB7IGVycm9yOiBuZXcgTm90TG9nZ2VkSW5FcnJvcihcIk5vdCBsb2dnZWQgaW5cIikgfTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImxvY2tcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwibG9ja1wiLCBcImxvY2tlZFwiKTtcbiAgICAgIGlmICghaW1tZWRpYXRlKSBhd2FpdCB0aGlzLmNhbGxBY3Rpb25MaXN0ZW5lcnMoXCJsb2NrXCIsIHJlYXNvbik7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsb2NrIHZhdWx0XCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyB1bmxvY2socGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcjxzdHJpbmc+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0OiBzZXNzaW9uVG9rZW4gfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJ1bmxvY2tcIiwgcGFzc3dvcmQsIFwiLS1yYXdcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICB0aGlzLnNldFNlc3Npb25Ub2tlbihzZXNzaW9uVG9rZW4pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwidW5sb2NrXCIsIFwidW5sb2NrZWRcIik7XG4gICAgICBhd2FpdCB0aGlzLmNhbGxBY3Rpb25MaXN0ZW5lcnMoXCJ1bmxvY2tcIiwgcGFzc3dvcmQsIHNlc3Npb25Ub2tlbik7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHNlc3Npb25Ub2tlbiB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byB1bmxvY2sgdmF1bHRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN5bmMoKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJzeW5jXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gc3luYyB2YXVsdFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0SXRlbShpZDogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPEl0ZW0+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiZ2V0XCIsIFwiaXRlbVwiLCBpZF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8SXRlbT4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZXQgaXRlbVwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbGlzdEl0ZW1zKCk6IFByb21pc2U8TWF5YmVFcnJvcjxJdGVtW10+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wibGlzdFwiLCBcIml0ZW1zXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgY29uc3QgaXRlbXMgPSBKU09OLnBhcnNlPEl0ZW1bXT4oc3Rkb3V0KTtcbiAgICAgIC8vIEZpbHRlciBvdXQgaXRlbXMgd2l0aG91dCBhIG5hbWUgcHJvcGVydHkgKHRoZXkgYXJlIG5vdCBkaXNwbGF5ZWQgaW4gdGhlIGJpdHdhcmRlbiBhcHApXG4gICAgICByZXR1cm4geyByZXN1bHQ6IGl0ZW1zLmZpbHRlcigoaXRlbTogSXRlbSkgPT4gISFpdGVtLm5hbWUpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGxpc3QgaXRlbXNcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZUxvZ2luSXRlbShvcHRpb25zOiBDcmVhdGVMb2dpbkl0ZW1PcHRpb25zKTogUHJvbWlzZTxNYXliZUVycm9yPEl0ZW0+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZXJyb3I6IGl0ZW1UZW1wbGF0ZUVycm9yLCByZXN1bHQ6IGl0ZW1UZW1wbGF0ZSB9ID0gYXdhaXQgdGhpcy5nZXRUZW1wbGF0ZTxJdGVtPihcIml0ZW1cIik7XG4gICAgICBpZiAoaXRlbVRlbXBsYXRlRXJyb3IpIHRocm93IGl0ZW1UZW1wbGF0ZUVycm9yO1xuXG4gICAgICBjb25zdCB7IGVycm9yOiBsb2dpblRlbXBsYXRlRXJyb3IsIHJlc3VsdDogbG9naW5UZW1wbGF0ZSB9ID0gYXdhaXQgdGhpcy5nZXRUZW1wbGF0ZTxMb2dpbj4oXCJpdGVtLmxvZ2luXCIpO1xuICAgICAgaWYgKGxvZ2luVGVtcGxhdGVFcnJvcikgdGhyb3cgbG9naW5UZW1wbGF0ZUVycm9yO1xuXG4gICAgICBpdGVtVGVtcGxhdGUubmFtZSA9IG9wdGlvbnMubmFtZTtcbiAgICAgIGl0ZW1UZW1wbGF0ZS50eXBlID0gSXRlbVR5cGUuTE9HSU47XG4gICAgICBpdGVtVGVtcGxhdGUuZm9sZGVySWQgPSBvcHRpb25zLmZvbGRlcklkIHx8IG51bGw7XG4gICAgICBpdGVtVGVtcGxhdGUubG9naW4gPSBsb2dpblRlbXBsYXRlO1xuICAgICAgaXRlbVRlbXBsYXRlLm5vdGVzID0gbnVsbDtcblxuICAgICAgbG9naW5UZW1wbGF0ZS51c2VybmFtZSA9IG9wdGlvbnMudXNlcm5hbWUgfHwgbnVsbDtcbiAgICAgIGxvZ2luVGVtcGxhdGUucGFzc3dvcmQgPSBvcHRpb25zLnBhc3N3b3JkO1xuICAgICAgbG9naW5UZW1wbGF0ZS50b3RwID0gbnVsbDtcbiAgICAgIGxvZ2luVGVtcGxhdGUuZmlkbzJDcmVkZW50aWFscyA9IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKG9wdGlvbnMudXJpKSB7XG4gICAgICAgIGxvZ2luVGVtcGxhdGUudXJpcyA9IFt7IG1hdGNoOiBudWxsLCB1cmk6IG9wdGlvbnMudXJpIH1dO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7IHJlc3VsdDogZW5jb2RlZEl0ZW0sIGVycm9yOiBlbmNvZGVFcnJvciB9ID0gYXdhaXQgdGhpcy5lbmNvZGUoSlNPTi5zdHJpbmdpZnkoaXRlbVRlbXBsYXRlKSk7XG4gICAgICBpZiAoZW5jb2RlRXJyb3IpIHRocm93IGVuY29kZUVycm9yO1xuXG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImNyZWF0ZVwiLCBcIml0ZW1cIiwgZW5jb2RlZEl0ZW1dLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPEl0ZW0+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gY3JlYXRlIGxvZ2luIGl0ZW1cIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxpc3RGb2xkZXJzKCk6IFByb21pc2U8TWF5YmVFcnJvcjxGb2xkZXJbXT4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJsaXN0XCIsIFwiZm9sZGVyc1wiXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxGb2xkZXJbXT4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsaXN0IGZvbGRlclwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY3JlYXRlRm9sZGVyKG5hbWU6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVycm9yLCByZXN1bHQ6IGZvbGRlciB9ID0gYXdhaXQgdGhpcy5nZXRUZW1wbGF0ZShcImZvbGRlclwiKTtcbiAgICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG5cbiAgICAgIGZvbGRlci5uYW1lID0gbmFtZTtcbiAgICAgIGNvbnN0IHsgcmVzdWx0OiBlbmNvZGVkRm9sZGVyLCBlcnJvcjogZW5jb2RlRXJyb3IgfSA9IGF3YWl0IHRoaXMuZW5jb2RlKEpTT04uc3RyaW5naWZ5KGZvbGRlcikpO1xuICAgICAgaWYgKGVuY29kZUVycm9yKSB0aHJvdyBlbmNvZGVFcnJvcjtcblxuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcImNyZWF0ZVwiLCBcImZvbGRlclwiLCBlbmNvZGVkRm9sZGVyXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogdW5kZWZpbmVkIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNyZWF0ZSBmb2xkZXJcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldFRvdHAoaWQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcjxzdHJpbmc+PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIHRoaXMgY291bGQgcmV0dXJuIHNvbWV0aGluZyBsaWtlIFwiTm90IGZvdW5kLlwiIGJ1dCBjaGVja3MgZm9yIHRvdHAgY29kZSBhcmUgZG9uZSBiZWZvcmUgY2FsbGluZyB0aGlzIGZ1bmN0aW9uXG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImdldFwiLCBcInRvdHBcIiwgaWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBzdGRvdXQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IFRPVFBcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN0YXR1cygpOiBQcm9taXNlPE1heWJlRXJyb3I8VmF1bHRTdGF0ZT4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJzdGF0dXNcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFZhdWx0U3RhdGU+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IHN0YXR1c1wiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY2hlY2tMb2NrU3RhdHVzKCk6IFByb21pc2U8VmF1bHRTdGF0dXM+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcInVubG9ja1wiLCBcIi0tY2hlY2tcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwiY2hlY2tMb2NrU3RhdHVzXCIsIFwidW5sb2NrZWRcIik7XG4gICAgICByZXR1cm4gXCJ1bmxvY2tlZFwiO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNoZWNrIGxvY2sgc3RhdHVzXCIsIGVycm9yKTtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IChlcnJvciBhcyBFeGVjYUVycm9yKS5zdGRlcnI7XG4gICAgICBpZiAoZXJyb3JNZXNzYWdlID09PSBcIlZhdWx0IGlzIGxvY2tlZC5cIikge1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVMYXN0VmF1bHRTdGF0dXMoXCJjaGVja0xvY2tTdGF0dXNcIiwgXCJsb2NrZWRcIik7XG4gICAgICAgIHJldHVybiBcImxvY2tlZFwiO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwiY2hlY2tMb2NrU3RhdHVzXCIsIFwidW5hdXRoZW50aWNhdGVkXCIpO1xuICAgICAgcmV0dXJuIFwidW5hdXRoZW50aWNhdGVkXCI7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0VGVtcGxhdGU8VCA9IGFueT4odHlwZTogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPFQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiZ2V0XCIsIFwidGVtcGxhdGVcIiwgdHlwZV0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8VD4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZXQgdGVtcGxhdGVcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGVuY29kZShpbnB1dDogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPHN0cmluZz4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJlbmNvZGVcIl0sIHsgaW5wdXQsIHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogc3Rkb3V0IH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGVuY29kZVwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2VuZXJhdGVQYXNzd29yZChvcHRpb25zPzogUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zLCBhYm9ydENvbnRyb2xsZXI/OiBBYm9ydENvbnRyb2xsZXIpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGFyZ3MgPSBvcHRpb25zID8gZ2V0UGFzc3dvcmRHZW5lcmF0aW5nQXJncyhvcHRpb25zKSA6IFtdO1xuICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiZ2VuZXJhdGVcIiwgLi4uYXJnc10sIHsgYWJvcnRDb250cm9sbGVyLCByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgcmV0dXJuIHN0ZG91dDtcbiAgfVxuXG4gIGFzeW5jIGxpc3RTZW5kcygpOiBQcm9taXNlPE1heWJlRXJyb3I8U2VuZFtdPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJsaXN0XCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFNlbmRbXT4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsaXN0IHNlbmRzXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjcmVhdGVTZW5kKHZhbHVlczogU2VuZENyZWF0ZVBheWxvYWQpOiBQcm9taXNlPE1heWJlRXJyb3I8U2VuZD4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBlcnJvcjogdGVtcGxhdGVFcnJvciwgcmVzdWx0OiB0ZW1wbGF0ZSB9ID0gYXdhaXQgdGhpcy5nZXRUZW1wbGF0ZShcbiAgICAgICAgdmFsdWVzLnR5cGUgPT09IFNlbmRUeXBlLlRleHQgPyBcInNlbmQudGV4dFwiIDogXCJzZW5kLmZpbGVcIlxuICAgICAgKTtcbiAgICAgIGlmICh0ZW1wbGF0ZUVycm9yKSB0aHJvdyB0ZW1wbGF0ZUVycm9yO1xuXG4gICAgICBjb25zdCBwYXlsb2FkID0gcHJlcGFyZVNlbmRQYXlsb2FkKHRlbXBsYXRlLCB2YWx1ZXMpO1xuICAgICAgY29uc3QgeyByZXN1bHQ6IGVuY29kZWRQYXlsb2FkLCBlcnJvcjogZW5jb2RlRXJyb3IgfSA9IGF3YWl0IHRoaXMuZW5jb2RlKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKTtcbiAgICAgIGlmIChlbmNvZGVFcnJvcikgdGhyb3cgZW5jb2RlRXJyb3I7XG5cbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcImNyZWF0ZVwiLCBlbmNvZGVkUGF5bG9hZF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG5cbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxTZW5kPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNyZWF0ZSBzZW5kXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBlZGl0U2VuZCh2YWx1ZXM6IFNlbmRDcmVhdGVQYXlsb2FkKTogUHJvbWlzZTxNYXliZUVycm9yPFNlbmQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgcmVzdWx0OiBlbmNvZGVkUGF5bG9hZCwgZXJyb3I6IGVuY29kZUVycm9yIH0gPSBhd2FpdCB0aGlzLmVuY29kZShKU09OLnN0cmluZ2lmeSh2YWx1ZXMpKTtcbiAgICAgIGlmIChlbmNvZGVFcnJvcikgdGhyb3cgZW5jb2RlRXJyb3I7XG5cbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcImVkaXRcIiwgZW5jb2RlZFBheWxvYWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFNlbmQ+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZGVsZXRlIHNlbmRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZVNlbmQoaWQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcImRlbGV0ZVwiLCBpZF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBkZWxldGUgc2VuZFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVtb3ZlU2VuZFBhc3N3b3JkKGlkOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJyZW1vdmUtcGFzc3dvcmRcIiwgaWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gcmVtb3ZlIHNlbmQgcGFzc3dvcmRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlY2VpdmVTZW5kSW5mbyh1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlY2VpdmVTZW5kT3B0aW9ucyk6IFByb21pc2U8TWF5YmVFcnJvcjxSZWNlaXZlZFNlbmQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0LCBzdGRlcnIgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJzZW5kXCIsIFwicmVjZWl2ZVwiLCB1cmwsIFwiLS1vYmpcIl0sIHtcbiAgICAgICAgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUsXG4gICAgICAgIGlucHV0OiBvcHRpb25zPy5wYXNzd29yZCxcbiAgICAgIH0pO1xuICAgICAgaWYgKCFzdGRvdXQgJiYgL0ludmFsaWQgcGFzc3dvcmQvaS50ZXN0KHN0ZGVycikpIHJldHVybiB7IGVycm9yOiBuZXcgU2VuZEludmFsaWRQYXNzd29yZEVycm9yKCkgfTtcbiAgICAgIGlmICghc3Rkb3V0ICYmIC9TZW5kIHBhc3N3b3JkL2kudGVzdChzdGRlcnIpKSByZXR1cm4geyBlcnJvcjogbmV3IFNlbmROZWVkc1Bhc3N3b3JkRXJyb3IoKSB9O1xuXG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8UmVjZWl2ZWRTZW5kPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAoZXhlY0Vycm9yIGFzIEV4ZWNhRXJyb3IpLnN0ZGVycjtcbiAgICAgIGlmICgvSW52YWxpZCBwYXNzd29yZC9naS50ZXN0KGVycm9yTWVzc2FnZSkpIHJldHVybiB7IGVycm9yOiBuZXcgU2VuZEludmFsaWRQYXNzd29yZEVycm9yKCkgfTtcbiAgICAgIGlmICgvU2VuZCBwYXNzd29yZC9naS50ZXN0KGVycm9yTWVzc2FnZSkpIHJldHVybiB7IGVycm9yOiBuZXcgU2VuZE5lZWRzUGFzc3dvcmRFcnJvcigpIH07XG5cbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gcmVjZWl2ZSBzZW5kIG9ialwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVjZWl2ZVNlbmQodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZWNlaXZlU2VuZE9wdGlvbnMpOiBQcm9taXNlPE1heWJlRXJyb3I8c3RyaW5nPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHNhdmVQYXRoLCBwYXNzd29yZCB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICAgIGNvbnN0IGFyZ3MgPSBbXCJzZW5kXCIsIFwicmVjZWl2ZVwiLCB1cmxdO1xuICAgICAgaWYgKHNhdmVQYXRoKSBhcmdzLnB1c2goXCItLW91dHB1dFwiLCBzYXZlUGF0aCk7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKGFyZ3MsIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUsIGlucHV0OiBwYXNzd29yZCB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogc3Rkb3V0IH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHJlY2VpdmUgc2VuZFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgLy8gdXRpbHMgYmVsb3dcblxuICBhc3luYyBzYXZlTGFzdFZhdWx0U3RhdHVzKGNhbGxOYW1lOiBzdHJpbmcsIHN0YXR1czogVmF1bHRTdGF0dXMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCBMb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9TVE9SQUdFX0tFWS5WQVVMVF9MQVNUX1NUQVRVUywgc3RhdHVzKTtcbiAgfVxuXG4gIGFzeW5jIGdldExhc3RTYXZlZFZhdWx0U3RhdHVzKCk6IFByb21pc2U8VmF1bHRTdGF0dXMgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBsYXN0U2F2ZWRTdGF0dXMgPSBhd2FpdCBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxWYXVsdFN0YXR1cz4oTE9DQUxfU1RPUkFHRV9LRVkuVkFVTFRfTEFTVF9TVEFUVVMpO1xuICAgIGlmICghbGFzdFNhdmVkU3RhdHVzKSB7XG4gICAgICBjb25zdCB2YXVsdFN0YXR1cyA9IGF3YWl0IHRoaXMuc3RhdHVzKCk7XG4gICAgICByZXR1cm4gdmF1bHRTdGF0dXMucmVzdWx0Py5zdGF0dXM7XG4gICAgfVxuICAgIHJldHVybiBsYXN0U2F2ZWRTdGF0dXM7XG4gIH1cblxuICBwcml2YXRlIGlzUHJvbXB0V2FpdGluZ0Zvck1hc3RlclBhc3N3b3JkKHJlc3VsdDogRXhlY2FSZXR1cm5WYWx1ZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIShyZXN1bHQuc3RkZXJyICYmIHJlc3VsdC5zdGRlcnIuaW5jbHVkZXMoXCJNYXN0ZXIgcGFzc3dvcmRcIikpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVQb3N0TG9nb3V0KHJlYXNvbj86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuY2xlYXJTZXNzaW9uVG9rZW4oKTtcbiAgICBhd2FpdCB0aGlzLmNhbGxBY3Rpb25MaXN0ZW5lcnMoXCJsb2dvdXRcIiwgcmVhc29uKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlQ29tbW9uRXJyb3JzKGVycm9yOiBhbnkpOiBQcm9taXNlPHsgZXJyb3I/OiBNYW51YWxseVRocm93bkVycm9yIH0+IHtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAoZXJyb3IgYXMgRXhlY2FFcnJvcikuc3RkZXJyO1xuICAgIGlmICghZXJyb3JNZXNzYWdlKSByZXR1cm4ge307XG5cbiAgICBpZiAoL25vdCBsb2dnZWQgaW4vaS50ZXN0KGVycm9yTWVzc2FnZSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUG9zdExvZ291dCgpO1xuICAgICAgcmV0dXJuIHsgZXJyb3I6IG5ldyBOb3RMb2dnZWRJbkVycm9yKFwiTm90IGxvZ2dlZCBpblwiKSB9O1xuICAgIH1cbiAgICBpZiAoL1ByZW1pdW0gc3RhdHVzL2kudGVzdChlcnJvck1lc3NhZ2UpKSB7XG4gICAgICByZXR1cm4geyBlcnJvcjogbmV3IFByZW1pdW1GZWF0dXJlRXJyb3IoKSB9O1xuICAgIH1cbiAgICByZXR1cm4ge307XG4gIH1cblxuICBzZXRBY3Rpb25MaXN0ZW5lcjxBIGV4dGVuZHMga2V5b2YgQWN0aW9uTGlzdGVuZXJzPihhY3Rpb246IEEsIGxpc3RlbmVyOiBBY3Rpb25MaXN0ZW5lcnNbQV0pOiB0aGlzIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmFjdGlvbkxpc3RlbmVycy5nZXQoYWN0aW9uKTtcbiAgICBpZiAobGlzdGVuZXJzICYmIGxpc3RlbmVycy5zaXplID4gMCkge1xuICAgICAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWN0aW9uTGlzdGVuZXJzLnNldChhY3Rpb24sIG5ldyBTZXQoW2xpc3RlbmVyXSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbW92ZUFjdGlvbkxpc3RlbmVyPEEgZXh0ZW5kcyBrZXlvZiBBY3Rpb25MaXN0ZW5lcnM+KGFjdGlvbjogQSwgbGlzdGVuZXI6IEFjdGlvbkxpc3RlbmVyc1tBXSk6IHRoaXMge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuYWN0aW9uTGlzdGVuZXJzLmdldChhY3Rpb24pO1xuICAgIGlmIChsaXN0ZW5lcnMgJiYgbGlzdGVuZXJzLnNpemUgPiAwKSB7XG4gICAgICBsaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNhbGxBY3Rpb25MaXN0ZW5lcnM8QSBleHRlbmRzIGtleW9mIEFjdGlvbkxpc3RlbmVycz4oXG4gICAgYWN0aW9uOiBBLFxuICAgIC4uLmFyZ3M6IFBhcmFtZXRlcnM8Tm9uTnVsbGFibGU8QWN0aW9uTGlzdGVuZXJzW0FdPj5cbiAgKSB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5hY3Rpb25MaXN0ZW5lcnMuZ2V0KGFjdGlvbik7XG4gICAgaWYgKGxpc3RlbmVycyAmJiBsaXN0ZW5lcnMuc2l6ZSA+IDApIHtcbiAgICAgIGZvciAoY29uc3QgbGlzdGVuZXIgb2YgbGlzdGVuZXJzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgKGxpc3RlbmVyIGFzIGFueSk/LiguLi5hcmdzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKGBFcnJvciBjYWxsaW5nIGJpdHdhcmRlbiBhY3Rpb24gbGlzdGVuZXIgZm9yICR7YWN0aW9ufWAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2hvd1RvYXN0ID0gYXN5bmMgKHRvYXN0T3B0czogVG9hc3QuT3B0aW9ucyk6IFByb21pc2U8VG9hc3QgJiB7IHJlc3RvcmU6ICgpID0+IFByb21pc2U8dm9pZD4gfT4gPT4ge1xuICAgIGlmICh0aGlzLnRvYXN0SW5zdGFuY2UpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzU3RhdGVUb2FzdE9wdHM6IFRvYXN0Lk9wdGlvbnMgPSB7XG4gICAgICAgIG1lc3NhZ2U6IHRoaXMudG9hc3RJbnN0YW5jZS5tZXNzYWdlLFxuICAgICAgICB0aXRsZTogdGhpcy50b2FzdEluc3RhbmNlLnRpdGxlLFxuICAgICAgICBwcmltYXJ5QWN0aW9uOiB0aGlzLnRvYXN0SW5zdGFuY2UucHJpbWFyeUFjdGlvbixcbiAgICAgICAgc2Vjb25kYXJ5QWN0aW9uOiB0aGlzLnRvYXN0SW5zdGFuY2Uuc2Vjb25kYXJ5QWN0aW9uLFxuICAgICAgfTtcblxuICAgICAgaWYgKHRvYXN0T3B0cy5zdHlsZSkgdGhpcy50b2FzdEluc3RhbmNlLnN0eWxlID0gdG9hc3RPcHRzLnN0eWxlO1xuICAgICAgdGhpcy50b2FzdEluc3RhbmNlLm1lc3NhZ2UgPSB0b2FzdE9wdHMubWVzc2FnZTtcbiAgICAgIHRoaXMudG9hc3RJbnN0YW5jZS50aXRsZSA9IHRvYXN0T3B0cy50aXRsZTtcbiAgICAgIHRoaXMudG9hc3RJbnN0YW5jZS5wcmltYXJ5QWN0aW9uID0gdG9hc3RPcHRzLnByaW1hcnlBY3Rpb247XG4gICAgICB0aGlzLnRvYXN0SW5zdGFuY2Uuc2Vjb25kYXJ5QWN0aW9uID0gdG9hc3RPcHRzLnNlY29uZGFyeUFjdGlvbjtcbiAgICAgIGF3YWl0IHRoaXMudG9hc3RJbnN0YW5jZS5zaG93KCk7XG5cbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHRoaXMudG9hc3RJbnN0YW5jZSwge1xuICAgICAgICByZXN0b3JlOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5zaG93VG9hc3QocHJldmlvdXNTdGF0ZVRvYXN0T3B0cyk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdG9hc3QgPSBhd2FpdCBzaG93VG9hc3QodG9hc3RPcHRzKTtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHRvYXN0LCB7IHJlc3RvcmU6ICgpID0+IHRvYXN0LmhpZGUoKSB9KTtcbiAgICB9XG4gIH07XG59XG4iLCAiaW1wb3J0IHtCdWZmZXJ9IGZyb20gJ25vZGU6YnVmZmVyJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgY2hpbGRQcm9jZXNzIGZyb20gJ25vZGU6Y2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IGNyb3NzU3Bhd24gZnJvbSAnY3Jvc3Mtc3Bhd24nO1xuaW1wb3J0IHN0cmlwRmluYWxOZXdsaW5lIGZyb20gJ3N0cmlwLWZpbmFsLW5ld2xpbmUnO1xuaW1wb3J0IHtucG1SdW5QYXRoRW52fSBmcm9tICducG0tcnVuLXBhdGgnO1xuaW1wb3J0IG9uZXRpbWUgZnJvbSAnb25ldGltZSc7XG5pbXBvcnQge21ha2VFcnJvcn0gZnJvbSAnLi9saWIvZXJyb3IuanMnO1xuaW1wb3J0IHtub3JtYWxpemVTdGRpbywgbm9ybWFsaXplU3RkaW9Ob2RlfSBmcm9tICcuL2xpYi9zdGRpby5qcyc7XG5pbXBvcnQge3NwYXduZWRLaWxsLCBzcGF3bmVkQ2FuY2VsLCBzZXR1cFRpbWVvdXQsIHZhbGlkYXRlVGltZW91dCwgc2V0RXhpdEhhbmRsZXJ9IGZyb20gJy4vbGliL2tpbGwuanMnO1xuaW1wb3J0IHtoYW5kbGVJbnB1dCwgZ2V0U3Bhd25lZFJlc3VsdCwgbWFrZUFsbFN0cmVhbSwgdmFsaWRhdGVJbnB1dFN5bmN9IGZyb20gJy4vbGliL3N0cmVhbS5qcyc7XG5pbXBvcnQge21lcmdlUHJvbWlzZSwgZ2V0U3Bhd25lZFByb21pc2V9IGZyb20gJy4vbGliL3Byb21pc2UuanMnO1xuaW1wb3J0IHtqb2luQ29tbWFuZCwgcGFyc2VDb21tYW5kLCBnZXRFc2NhcGVkQ29tbWFuZH0gZnJvbSAnLi9saWIvY29tbWFuZC5qcyc7XG5cbmNvbnN0IERFRkFVTFRfTUFYX0JVRkZFUiA9IDEwMDAgKiAxMDAwICogMTAwO1xuXG5jb25zdCBnZXRFbnYgPSAoe2VudjogZW52T3B0aW9uLCBleHRlbmRFbnYsIHByZWZlckxvY2FsLCBsb2NhbERpciwgZXhlY1BhdGh9KSA9PiB7XG5cdGNvbnN0IGVudiA9IGV4dGVuZEVudiA/IHsuLi5wcm9jZXNzLmVudiwgLi4uZW52T3B0aW9ufSA6IGVudk9wdGlvbjtcblxuXHRpZiAocHJlZmVyTG9jYWwpIHtcblx0XHRyZXR1cm4gbnBtUnVuUGF0aEVudih7ZW52LCBjd2Q6IGxvY2FsRGlyLCBleGVjUGF0aH0pO1xuXHR9XG5cblx0cmV0dXJuIGVudjtcbn07XG5cbmNvbnN0IGhhbmRsZUFyZ3VtZW50cyA9IChmaWxlLCBhcmdzLCBvcHRpb25zID0ge30pID0+IHtcblx0Y29uc3QgcGFyc2VkID0gY3Jvc3NTcGF3bi5fcGFyc2UoZmlsZSwgYXJncywgb3B0aW9ucyk7XG5cdGZpbGUgPSBwYXJzZWQuY29tbWFuZDtcblx0YXJncyA9IHBhcnNlZC5hcmdzO1xuXHRvcHRpb25zID0gcGFyc2VkLm9wdGlvbnM7XG5cblx0b3B0aW9ucyA9IHtcblx0XHRtYXhCdWZmZXI6IERFRkFVTFRfTUFYX0JVRkZFUixcblx0XHRidWZmZXI6IHRydWUsXG5cdFx0c3RyaXBGaW5hbE5ld2xpbmU6IHRydWUsXG5cdFx0ZXh0ZW5kRW52OiB0cnVlLFxuXHRcdHByZWZlckxvY2FsOiBmYWxzZSxcblx0XHRsb2NhbERpcjogb3B0aW9ucy5jd2QgfHwgcHJvY2Vzcy5jd2QoKSxcblx0XHRleGVjUGF0aDogcHJvY2Vzcy5leGVjUGF0aCxcblx0XHRlbmNvZGluZzogJ3V0ZjgnLFxuXHRcdHJlamVjdDogdHJ1ZSxcblx0XHRjbGVhbnVwOiB0cnVlLFxuXHRcdGFsbDogZmFsc2UsXG5cdFx0d2luZG93c0hpZGU6IHRydWUsXG5cdFx0Li4ub3B0aW9ucyxcblx0fTtcblxuXHRvcHRpb25zLmVudiA9IGdldEVudihvcHRpb25zKTtcblxuXHRvcHRpb25zLnN0ZGlvID0gbm9ybWFsaXplU3RkaW8ob3B0aW9ucyk7XG5cblx0aWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgJiYgcGF0aC5iYXNlbmFtZShmaWxlLCAnLmV4ZScpID09PSAnY21kJykge1xuXHRcdC8vICMxMTZcblx0XHRhcmdzLnVuc2hpZnQoJy9xJyk7XG5cdH1cblxuXHRyZXR1cm4ge2ZpbGUsIGFyZ3MsIG9wdGlvbnMsIHBhcnNlZH07XG59O1xuXG5jb25zdCBoYW5kbGVPdXRwdXQgPSAob3B0aW9ucywgdmFsdWUsIGVycm9yKSA9PiB7XG5cdGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNCdWZmZXIodmFsdWUpKSB7XG5cdFx0Ly8gV2hlbiBgZXhlY2FTeW5jKClgIGVycm9ycywgd2Ugbm9ybWFsaXplIGl0IHRvICcnIHRvIG1pbWljIGBleGVjYSgpYFxuXHRcdHJldHVybiBlcnJvciA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogJyc7XG5cdH1cblxuXHRpZiAob3B0aW9ucy5zdHJpcEZpbmFsTmV3bGluZSkge1xuXHRcdHJldHVybiBzdHJpcEZpbmFsTmV3bGluZSh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2EoZmlsZSwgYXJncywgb3B0aW9ucykge1xuXHRjb25zdCBwYXJzZWQgPSBoYW5kbGVBcmd1bWVudHMoZmlsZSwgYXJncywgb3B0aW9ucyk7XG5cdGNvbnN0IGNvbW1hbmQgPSBqb2luQ29tbWFuZChmaWxlLCBhcmdzKTtcblx0Y29uc3QgZXNjYXBlZENvbW1hbmQgPSBnZXRFc2NhcGVkQ29tbWFuZChmaWxlLCBhcmdzKTtcblxuXHR2YWxpZGF0ZVRpbWVvdXQocGFyc2VkLm9wdGlvbnMpO1xuXG5cdGxldCBzcGF3bmVkO1xuXHR0cnkge1xuXHRcdHNwYXduZWQgPSBjaGlsZFByb2Nlc3Muc3Bhd24ocGFyc2VkLmZpbGUsIHBhcnNlZC5hcmdzLCBwYXJzZWQub3B0aW9ucyk7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0Ly8gRW5zdXJlIHRoZSByZXR1cm5lZCBlcnJvciBpcyBhbHdheXMgYm90aCBhIHByb21pc2UgYW5kIGEgY2hpbGQgcHJvY2Vzc1xuXHRcdGNvbnN0IGR1bW15U3Bhd25lZCA9IG5ldyBjaGlsZFByb2Nlc3MuQ2hpbGRQcm9jZXNzKCk7XG5cdFx0Y29uc3QgZXJyb3JQcm9taXNlID0gUHJvbWlzZS5yZWplY3QobWFrZUVycm9yKHtcblx0XHRcdGVycm9yLFxuXHRcdFx0c3Rkb3V0OiAnJyxcblx0XHRcdHN0ZGVycjogJycsXG5cdFx0XHRhbGw6ICcnLFxuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0cGFyc2VkLFxuXHRcdFx0dGltZWRPdXQ6IGZhbHNlLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IGZhbHNlLFxuXHRcdH0pKTtcblx0XHRyZXR1cm4gbWVyZ2VQcm9taXNlKGR1bW15U3Bhd25lZCwgZXJyb3JQcm9taXNlKTtcblx0fVxuXG5cdGNvbnN0IHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCk7XG5cdGNvbnN0IHRpbWVkUHJvbWlzZSA9IHNldHVwVGltZW91dChzcGF3bmVkLCBwYXJzZWQub3B0aW9ucywgc3Bhd25lZFByb21pc2UpO1xuXHRjb25zdCBwcm9jZXNzRG9uZSA9IHNldEV4aXRIYW5kbGVyKHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLCB0aW1lZFByb21pc2UpO1xuXG5cdGNvbnN0IGNvbnRleHQgPSB7aXNDYW5jZWxlZDogZmFsc2V9O1xuXG5cdHNwYXduZWQua2lsbCA9IHNwYXduZWRLaWxsLmJpbmQobnVsbCwgc3Bhd25lZC5raWxsLmJpbmQoc3Bhd25lZCkpO1xuXHRzcGF3bmVkLmNhbmNlbCA9IHNwYXduZWRDYW5jZWwuYmluZChudWxsLCBzcGF3bmVkLCBjb250ZXh0KTtcblxuXHRjb25zdCBoYW5kbGVQcm9taXNlID0gYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IFt7ZXJyb3IsIGV4aXRDb2RlLCBzaWduYWwsIHRpbWVkT3V0fSwgc3Rkb3V0UmVzdWx0LCBzdGRlcnJSZXN1bHQsIGFsbFJlc3VsdF0gPSBhd2FpdCBnZXRTcGF3bmVkUmVzdWx0KHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLCBwcm9jZXNzRG9uZSk7XG5cdFx0Y29uc3Qgc3Rkb3V0ID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCBzdGRvdXRSZXN1bHQpO1xuXHRcdGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgc3RkZXJyUmVzdWx0KTtcblx0XHRjb25zdCBhbGwgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIGFsbFJlc3VsdCk7XG5cblx0XHRpZiAoZXJyb3IgfHwgZXhpdENvZGUgIT09IDAgfHwgc2lnbmFsICE9PSBudWxsKSB7XG5cdFx0XHRjb25zdCByZXR1cm5lZEVycm9yID0gbWFrZUVycm9yKHtcblx0XHRcdFx0ZXJyb3IsXG5cdFx0XHRcdGV4aXRDb2RlLFxuXHRcdFx0XHRzaWduYWwsXG5cdFx0XHRcdHN0ZG91dCxcblx0XHRcdFx0c3RkZXJyLFxuXHRcdFx0XHRhbGwsXG5cdFx0XHRcdGNvbW1hbmQsXG5cdFx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0XHRwYXJzZWQsXG5cdFx0XHRcdHRpbWVkT3V0LFxuXHRcdFx0XHRpc0NhbmNlbGVkOiBjb250ZXh0LmlzQ2FuY2VsZWQgfHwgKHBhcnNlZC5vcHRpb25zLnNpZ25hbCA/IHBhcnNlZC5vcHRpb25zLnNpZ25hbC5hYm9ydGVkIDogZmFsc2UpLFxuXHRcdFx0XHRraWxsZWQ6IHNwYXduZWQua2lsbGVkLFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmICghcGFyc2VkLm9wdGlvbnMucmVqZWN0KSB7XG5cdFx0XHRcdHJldHVybiByZXR1cm5lZEVycm9yO1xuXHRcdFx0fVxuXG5cdFx0XHR0aHJvdyByZXR1cm5lZEVycm9yO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRleGl0Q29kZTogMCxcblx0XHRcdHN0ZG91dCxcblx0XHRcdHN0ZGVycixcblx0XHRcdGFsbCxcblx0XHRcdGZhaWxlZDogZmFsc2UsXG5cdFx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogZmFsc2UsXG5cdFx0fTtcblx0fTtcblxuXHRjb25zdCBoYW5kbGVQcm9taXNlT25jZSA9IG9uZXRpbWUoaGFuZGxlUHJvbWlzZSk7XG5cblx0aGFuZGxlSW5wdXQoc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMuaW5wdXQpO1xuXG5cdHNwYXduZWQuYWxsID0gbWFrZUFsbFN0cmVhbShzcGF3bmVkLCBwYXJzZWQub3B0aW9ucyk7XG5cblx0cmV0dXJuIG1lcmdlUHJvbWlzZShzcGF3bmVkLCBoYW5kbGVQcm9taXNlT25jZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjYVN5bmMoZmlsZSwgYXJncywgb3B0aW9ucykge1xuXHRjb25zdCBwYXJzZWQgPSBoYW5kbGVBcmd1bWVudHMoZmlsZSwgYXJncywgb3B0aW9ucyk7XG5cdGNvbnN0IGNvbW1hbmQgPSBqb2luQ29tbWFuZChmaWxlLCBhcmdzKTtcblx0Y29uc3QgZXNjYXBlZENvbW1hbmQgPSBnZXRFc2NhcGVkQ29tbWFuZChmaWxlLCBhcmdzKTtcblxuXHR2YWxpZGF0ZUlucHV0U3luYyhwYXJzZWQub3B0aW9ucyk7XG5cblx0bGV0IHJlc3VsdDtcblx0dHJ5IHtcblx0XHRyZXN1bHQgPSBjaGlsZFByb2Nlc3Muc3Bhd25TeW5jKHBhcnNlZC5maWxlLCBwYXJzZWQuYXJncywgcGFyc2VkLm9wdGlvbnMpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHRocm93IG1ha2VFcnJvcih7XG5cdFx0XHRlcnJvcixcblx0XHRcdHN0ZG91dDogJycsXG5cdFx0XHRzdGRlcnI6ICcnLFxuXHRcdFx0YWxsOiAnJyxcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdHBhcnNlZCxcblx0XHRcdHRpbWVkT3V0OiBmYWxzZSxcblx0XHRcdGlzQ2FuY2VsZWQ6IGZhbHNlLFxuXHRcdFx0a2lsbGVkOiBmYWxzZSxcblx0XHR9KTtcblx0fVxuXG5cdGNvbnN0IHN0ZG91dCA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgcmVzdWx0LnN0ZG91dCwgcmVzdWx0LmVycm9yKTtcblx0Y29uc3Qgc3RkZXJyID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCByZXN1bHQuc3RkZXJyLCByZXN1bHQuZXJyb3IpO1xuXG5cdGlmIChyZXN1bHQuZXJyb3IgfHwgcmVzdWx0LnN0YXR1cyAhPT0gMCB8fCByZXN1bHQuc2lnbmFsICE9PSBudWxsKSB7XG5cdFx0Y29uc3QgZXJyb3IgPSBtYWtlRXJyb3Ioe1xuXHRcdFx0c3Rkb3V0LFxuXHRcdFx0c3RkZXJyLFxuXHRcdFx0ZXJyb3I6IHJlc3VsdC5lcnJvcixcblx0XHRcdHNpZ25hbDogcmVzdWx0LnNpZ25hbCxcblx0XHRcdGV4aXRDb2RlOiByZXN1bHQuc3RhdHVzLFxuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0cGFyc2VkLFxuXHRcdFx0dGltZWRPdXQ6IHJlc3VsdC5lcnJvciAmJiByZXN1bHQuZXJyb3IuY29kZSA9PT0gJ0VUSU1FRE9VVCcsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogcmVzdWx0LnNpZ25hbCAhPT0gbnVsbCxcblx0XHR9KTtcblxuXHRcdGlmICghcGFyc2VkLm9wdGlvbnMucmVqZWN0KSB7XG5cdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0fVxuXG5cdFx0dGhyb3cgZXJyb3I7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGNvbW1hbmQsXG5cdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0ZXhpdENvZGU6IDAsXG5cdFx0c3Rkb3V0LFxuXHRcdHN0ZGVycixcblx0XHRmYWlsZWQ6IGZhbHNlLFxuXHRcdHRpbWVkT3V0OiBmYWxzZSxcblx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRraWxsZWQ6IGZhbHNlLFxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2FDb21tYW5kKGNvbW1hbmQsIG9wdGlvbnMpIHtcblx0Y29uc3QgW2ZpbGUsIC4uLmFyZ3NdID0gcGFyc2VDb21tYW5kKGNvbW1hbmQpO1xuXHRyZXR1cm4gZXhlY2EoZmlsZSwgYXJncywgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjYUNvbW1hbmRTeW5jKGNvbW1hbmQsIG9wdGlvbnMpIHtcblx0Y29uc3QgW2ZpbGUsIC4uLmFyZ3NdID0gcGFyc2VDb21tYW5kKGNvbW1hbmQpO1xuXHRyZXR1cm4gZXhlY2FTeW5jKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2FOb2RlKHNjcmlwdFBhdGgsIGFyZ3MsIG9wdGlvbnMgPSB7fSkge1xuXHRpZiAoYXJncyAmJiAhQXJyYXkuaXNBcnJheShhcmdzKSAmJiB0eXBlb2YgYXJncyA9PT0gJ29iamVjdCcpIHtcblx0XHRvcHRpb25zID0gYXJncztcblx0XHRhcmdzID0gW107XG5cdH1cblxuXHRjb25zdCBzdGRpbyA9IG5vcm1hbGl6ZVN0ZGlvTm9kZShvcHRpb25zKTtcblx0Y29uc3QgZGVmYXVsdEV4ZWNBcmd2ID0gcHJvY2Vzcy5leGVjQXJndi5maWx0ZXIoYXJnID0+ICFhcmcuc3RhcnRzV2l0aCgnLS1pbnNwZWN0JykpO1xuXG5cdGNvbnN0IHtcblx0XHRub2RlUGF0aCA9IHByb2Nlc3MuZXhlY1BhdGgsXG5cdFx0bm9kZU9wdGlvbnMgPSBkZWZhdWx0RXhlY0FyZ3YsXG5cdH0gPSBvcHRpb25zO1xuXG5cdHJldHVybiBleGVjYShcblx0XHRub2RlUGF0aCxcblx0XHRbXG5cdFx0XHQuLi5ub2RlT3B0aW9ucyxcblx0XHRcdHNjcmlwdFBhdGgsXG5cdFx0XHQuLi4oQXJyYXkuaXNBcnJheShhcmdzKSA/IGFyZ3MgOiBbXSksXG5cdFx0XSxcblx0XHR7XG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdFx0c3RkaW46IHVuZGVmaW5lZCxcblx0XHRcdHN0ZG91dDogdW5kZWZpbmVkLFxuXHRcdFx0c3RkZXJyOiB1bmRlZmluZWQsXG5cdFx0XHRzdGRpbyxcblx0XHRcdHNoZWxsOiBmYWxzZSxcblx0XHR9LFxuXHQpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN0cmlwRmluYWxOZXdsaW5lKGlucHV0KSB7XG5cdGNvbnN0IExGID0gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/ICdcXG4nIDogJ1xcbicuY2hhckNvZGVBdCgpO1xuXHRjb25zdCBDUiA9IHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgPyAnXFxyJyA6ICdcXHInLmNoYXJDb2RlQXQoKTtcblxuXHRpZiAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMV0gPT09IExGKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC5zbGljZSgwLCAtMSk7XG5cdH1cblxuXHRpZiAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMV0gPT09IENSKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC5zbGljZSgwLCAtMSk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59XG4iLCAiaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgdXJsIGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCBwYXRoS2V5IGZyb20gJ3BhdGgta2V5JztcblxuZXhwb3J0IGZ1bmN0aW9uIG5wbVJ1blBhdGgob3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IHtcblx0XHRjd2QgPSBwcm9jZXNzLmN3ZCgpLFxuXHRcdHBhdGg6IHBhdGhfID0gcHJvY2Vzcy5lbnZbcGF0aEtleSgpXSxcblx0XHRleGVjUGF0aCA9IHByb2Nlc3MuZXhlY1BhdGgsXG5cdH0gPSBvcHRpb25zO1xuXG5cdGxldCBwcmV2aW91cztcblx0Y29uc3QgY3dkU3RyaW5nID0gY3dkIGluc3RhbmNlb2YgVVJMID8gdXJsLmZpbGVVUkxUb1BhdGgoY3dkKSA6IGN3ZDtcblx0bGV0IGN3ZFBhdGggPSBwYXRoLnJlc29sdmUoY3dkU3RyaW5nKTtcblx0Y29uc3QgcmVzdWx0ID0gW107XG5cblx0d2hpbGUgKHByZXZpb3VzICE9PSBjd2RQYXRoKSB7XG5cdFx0cmVzdWx0LnB1c2gocGF0aC5qb2luKGN3ZFBhdGgsICdub2RlX21vZHVsZXMvLmJpbicpKTtcblx0XHRwcmV2aW91cyA9IGN3ZFBhdGg7XG5cdFx0Y3dkUGF0aCA9IHBhdGgucmVzb2x2ZShjd2RQYXRoLCAnLi4nKTtcblx0fVxuXG5cdC8vIEVuc3VyZSB0aGUgcnVubmluZyBgbm9kZWAgYmluYXJ5IGlzIHVzZWQuXG5cdHJlc3VsdC5wdXNoKHBhdGgucmVzb2x2ZShjd2RTdHJpbmcsIGV4ZWNQYXRoLCAnLi4nKSk7XG5cblx0cmV0dXJuIFsuLi5yZXN1bHQsIHBhdGhfXS5qb2luKHBhdGguZGVsaW1pdGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5wbVJ1blBhdGhFbnYoe2VudiA9IHByb2Nlc3MuZW52LCAuLi5vcHRpb25zfSA9IHt9KSB7XG5cdGVudiA9IHsuLi5lbnZ9O1xuXG5cdGNvbnN0IHBhdGggPSBwYXRoS2V5KHtlbnZ9KTtcblx0b3B0aW9ucy5wYXRoID0gZW52W3BhdGhdO1xuXHRlbnZbcGF0aF0gPSBucG1SdW5QYXRoKG9wdGlvbnMpO1xuXG5cdHJldHVybiBlbnY7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGF0aEtleShvcHRpb25zID0ge30pIHtcblx0Y29uc3Qge1xuXHRcdGVudiA9IHByb2Nlc3MuZW52LFxuXHRcdHBsYXRmb3JtID0gcHJvY2Vzcy5wbGF0Zm9ybVxuXHR9ID0gb3B0aW9ucztcblxuXHRpZiAocGxhdGZvcm0gIT09ICd3aW4zMicpIHtcblx0XHRyZXR1cm4gJ1BBVEgnO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKGVudikucmV2ZXJzZSgpLmZpbmQoa2V5ID0+IGtleS50b1VwcGVyQ2FzZSgpID09PSAnUEFUSCcpIHx8ICdQYXRoJztcbn1cbiIsICJjb25zdCBjb3B5UHJvcGVydHkgPSAodG8sIGZyb20sIHByb3BlcnR5LCBpZ25vcmVOb25Db25maWd1cmFibGUpID0+IHtcblx0Ly8gYEZ1bmN0aW9uI2xlbmd0aGAgc2hvdWxkIHJlZmxlY3QgdGhlIHBhcmFtZXRlcnMgb2YgYHRvYCBub3QgYGZyb21gIHNpbmNlIHdlIGtlZXAgaXRzIGJvZHkuXG5cdC8vIGBGdW5jdGlvbiNwcm90b3R5cGVgIGlzIG5vbi13cml0YWJsZSBhbmQgbm9uLWNvbmZpZ3VyYWJsZSBzbyBjYW4gbmV2ZXIgYmUgbW9kaWZpZWQuXG5cdGlmIChwcm9wZXJ0eSA9PT0gJ2xlbmd0aCcgfHwgcHJvcGVydHkgPT09ICdwcm90b3R5cGUnKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gYEZ1bmN0aW9uI2FyZ3VtZW50c2AgYW5kIGBGdW5jdGlvbiNjYWxsZXJgIHNob3VsZCBub3QgYmUgY29waWVkLiBUaGV5IHdlcmUgcmVwb3J0ZWQgdG8gYmUgcHJlc2VudCBpbiBgUmVmbGVjdC5vd25LZXlzYCBmb3Igc29tZSBkZXZpY2VzIGluIFJlYWN0IE5hdGl2ZSAoIzQxKSwgc28gd2UgZXhwbGljaXRseSBpZ25vcmUgdGhlbSBoZXJlLlxuXHRpZiAocHJvcGVydHkgPT09ICdhcmd1bWVudHMnIHx8IHByb3BlcnR5ID09PSAnY2FsbGVyJykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHRvRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodG8sIHByb3BlcnR5KTtcblx0Y29uc3QgZnJvbURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGZyb20sIHByb3BlcnR5KTtcblxuXHRpZiAoIWNhbkNvcHlQcm9wZXJ0eSh0b0Rlc2NyaXB0b3IsIGZyb21EZXNjcmlwdG9yKSAmJiBpZ25vcmVOb25Db25maWd1cmFibGUpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodG8sIHByb3BlcnR5LCBmcm9tRGVzY3JpcHRvcik7XG59O1xuXG4vLyBgT2JqZWN0LmRlZmluZVByb3BlcnR5KClgIHRocm93cyBpZiB0aGUgcHJvcGVydHkgZXhpc3RzLCBpcyBub3QgY29uZmlndXJhYmxlIGFuZCBlaXRoZXI6XG4vLyAtIG9uZSBpdHMgZGVzY3JpcHRvcnMgaXMgY2hhbmdlZFxuLy8gLSBpdCBpcyBub24td3JpdGFibGUgYW5kIGl0cyB2YWx1ZSBpcyBjaGFuZ2VkXG5jb25zdCBjYW5Db3B5UHJvcGVydHkgPSBmdW5jdGlvbiAodG9EZXNjcmlwdG9yLCBmcm9tRGVzY3JpcHRvcikge1xuXHRyZXR1cm4gdG9EZXNjcmlwdG9yID09PSB1bmRlZmluZWQgfHwgdG9EZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSB8fCAoXG5cdFx0dG9EZXNjcmlwdG9yLndyaXRhYmxlID09PSBmcm9tRGVzY3JpcHRvci53cml0YWJsZSAmJlxuXHRcdHRvRGVzY3JpcHRvci5lbnVtZXJhYmxlID09PSBmcm9tRGVzY3JpcHRvci5lbnVtZXJhYmxlICYmXG5cdFx0dG9EZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9PT0gZnJvbURlc2NyaXB0b3IuY29uZmlndXJhYmxlICYmXG5cdFx0KHRvRGVzY3JpcHRvci53cml0YWJsZSB8fCB0b0Rlc2NyaXB0b3IudmFsdWUgPT09IGZyb21EZXNjcmlwdG9yLnZhbHVlKVxuXHQpO1xufTtcblxuY29uc3QgY2hhbmdlUHJvdG90eXBlID0gKHRvLCBmcm9tKSA9PiB7XG5cdGNvbnN0IGZyb21Qcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZnJvbSk7XG5cdGlmIChmcm9tUHJvdG90eXBlID09PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodG8pKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0T2JqZWN0LnNldFByb3RvdHlwZU9mKHRvLCBmcm9tUHJvdG90eXBlKTtcbn07XG5cbmNvbnN0IHdyYXBwZWRUb1N0cmluZyA9ICh3aXRoTmFtZSwgZnJvbUJvZHkpID0+IGAvKiBXcmFwcGVkICR7d2l0aE5hbWV9Ki9cXG4ke2Zyb21Cb2R5fWA7XG5cbmNvbnN0IHRvU3RyaW5nRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRnVuY3Rpb24ucHJvdG90eXBlLCAndG9TdHJpbmcnKTtcbmNvbnN0IHRvU3RyaW5nTmFtZSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLCAnbmFtZScpO1xuXG4vLyBXZSBjYWxsIGBmcm9tLnRvU3RyaW5nKClgIGVhcmx5IChub3QgbGF6aWx5KSB0byBlbnN1cmUgYGZyb21gIGNhbiBiZSBnYXJiYWdlIGNvbGxlY3RlZC5cbi8vIFdlIHVzZSBgYmluZCgpYCBpbnN0ZWFkIG9mIGEgY2xvc3VyZSBmb3IgdGhlIHNhbWUgcmVhc29uLlxuLy8gQ2FsbGluZyBgZnJvbS50b1N0cmluZygpYCBlYXJseSBhbHNvIGFsbG93cyBjYWNoaW5nIGl0IGluIGNhc2UgYHRvLnRvU3RyaW5nKClgIGlzIGNhbGxlZCBzZXZlcmFsIHRpbWVzLlxuY29uc3QgY2hhbmdlVG9TdHJpbmcgPSAodG8sIGZyb20sIG5hbWUpID0+IHtcblx0Y29uc3Qgd2l0aE5hbWUgPSBuYW1lID09PSAnJyA/ICcnIDogYHdpdGggJHtuYW1lLnRyaW0oKX0oKSBgO1xuXHRjb25zdCBuZXdUb1N0cmluZyA9IHdyYXBwZWRUb1N0cmluZy5iaW5kKG51bGwsIHdpdGhOYW1lLCBmcm9tLnRvU3RyaW5nKCkpO1xuXHQvLyBFbnN1cmUgYHRvLnRvU3RyaW5nLnRvU3RyaW5nYCBpcyBub24tZW51bWVyYWJsZSBhbmQgaGFzIHRoZSBzYW1lIGBzYW1lYFxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3VG9TdHJpbmcsICduYW1lJywgdG9TdHJpbmdOYW1lKTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRvLCAndG9TdHJpbmcnLCB7Li4udG9TdHJpbmdEZXNjcmlwdG9yLCB2YWx1ZTogbmV3VG9TdHJpbmd9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1pbWljRnVuY3Rpb24odG8sIGZyb20sIHtpZ25vcmVOb25Db25maWd1cmFibGUgPSBmYWxzZX0gPSB7fSkge1xuXHRjb25zdCB7bmFtZX0gPSB0bztcblxuXHRmb3IgKGNvbnN0IHByb3BlcnR5IG9mIFJlZmxlY3Qub3duS2V5cyhmcm9tKSkge1xuXHRcdGNvcHlQcm9wZXJ0eSh0bywgZnJvbSwgcHJvcGVydHksIGlnbm9yZU5vbkNvbmZpZ3VyYWJsZSk7XG5cdH1cblxuXHRjaGFuZ2VQcm90b3R5cGUodG8sIGZyb20pO1xuXHRjaGFuZ2VUb1N0cmluZyh0bywgZnJvbSwgbmFtZSk7XG5cblx0cmV0dXJuIHRvO1xufVxuIiwgImltcG9ydCBtaW1pY0Z1bmN0aW9uIGZyb20gJ21pbWljLWZuJztcblxuY29uc3QgY2FsbGVkRnVuY3Rpb25zID0gbmV3IFdlYWtNYXAoKTtcblxuY29uc3Qgb25ldGltZSA9IChmdW5jdGlvbl8sIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRpZiAodHlwZW9mIGZ1bmN0aW9uXyAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgZnVuY3Rpb24nKTtcblx0fVxuXG5cdGxldCByZXR1cm5WYWx1ZTtcblx0bGV0IGNhbGxDb3VudCA9IDA7XG5cdGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uXy5kaXNwbGF5TmFtZSB8fCBmdW5jdGlvbl8ubmFtZSB8fCAnPGFub255bW91cz4nO1xuXG5cdGNvbnN0IG9uZXRpbWUgPSBmdW5jdGlvbiAoLi4uYXJndW1lbnRzXykge1xuXHRcdGNhbGxlZEZ1bmN0aW9ucy5zZXQob25ldGltZSwgKytjYWxsQ291bnQpO1xuXG5cdFx0aWYgKGNhbGxDb3VudCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuVmFsdWUgPSBmdW5jdGlvbl8uYXBwbHkodGhpcywgYXJndW1lbnRzXyk7XG5cdFx0XHRmdW5jdGlvbl8gPSBudWxsO1xuXHRcdH0gZWxzZSBpZiAob3B0aW9ucy50aHJvdyA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBGdW5jdGlvbiBcXGAke2Z1bmN0aW9uTmFtZX1cXGAgY2FuIG9ubHkgYmUgY2FsbGVkIG9uY2VgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XG5cdH07XG5cblx0bWltaWNGdW5jdGlvbihvbmV0aW1lLCBmdW5jdGlvbl8pO1xuXHRjYWxsZWRGdW5jdGlvbnMuc2V0KG9uZXRpbWUsIGNhbGxDb3VudCk7XG5cblx0cmV0dXJuIG9uZXRpbWU7XG59O1xuXG5vbmV0aW1lLmNhbGxDb3VudCA9IGZ1bmN0aW9uXyA9PiB7XG5cdGlmICghY2FsbGVkRnVuY3Rpb25zLmhhcyhmdW5jdGlvbl8pKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBUaGUgZ2l2ZW4gZnVuY3Rpb24gXFxgJHtmdW5jdGlvbl8ubmFtZX1cXGAgaXMgbm90IHdyYXBwZWQgYnkgdGhlIFxcYG9uZXRpbWVcXGAgcGFja2FnZWApO1xuXHR9XG5cblx0cmV0dXJuIGNhbGxlZEZ1bmN0aW9ucy5nZXQoZnVuY3Rpb25fKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG9uZXRpbWU7XG4iLCAiaW1wb3J0e2NvbnN0YW50c31mcm9tXCJub2RlOm9zXCI7XG5cbmltcG9ydHtTSUdSVE1BWH1mcm9tXCIuL3JlYWx0aW1lLmpzXCI7XG5pbXBvcnR7Z2V0U2lnbmFsc31mcm9tXCIuL3NpZ25hbHMuanNcIjtcblxuXG5cbmNvbnN0IGdldFNpZ25hbHNCeU5hbWU9ZnVuY3Rpb24oKXtcbmNvbnN0IHNpZ25hbHM9Z2V0U2lnbmFscygpO1xucmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhzaWduYWxzLm1hcChnZXRTaWduYWxCeU5hbWUpKTtcbn07XG5cbmNvbnN0IGdldFNpZ25hbEJ5TmFtZT1mdW5jdGlvbih7XG5uYW1lLFxubnVtYmVyLFxuZGVzY3JpcHRpb24sXG5zdXBwb3J0ZWQsXG5hY3Rpb24sXG5mb3JjZWQsXG5zdGFuZGFyZH0pXG57XG5yZXR1cm5bXG5uYW1lLFxue25hbWUsbnVtYmVyLGRlc2NyaXB0aW9uLHN1cHBvcnRlZCxhY3Rpb24sZm9yY2VkLHN0YW5kYXJkfV07XG5cbn07XG5cbmV4cG9ydCBjb25zdCBzaWduYWxzQnlOYW1lPWdldFNpZ25hbHNCeU5hbWUoKTtcblxuXG5cblxuY29uc3QgZ2V0U2lnbmFsc0J5TnVtYmVyPWZ1bmN0aW9uKCl7XG5jb25zdCBzaWduYWxzPWdldFNpZ25hbHMoKTtcbmNvbnN0IGxlbmd0aD1TSUdSVE1BWCsxO1xuY29uc3Qgc2lnbmFsc0E9QXJyYXkuZnJvbSh7bGVuZ3RofSwodmFsdWUsbnVtYmVyKT0+XG5nZXRTaWduYWxCeU51bWJlcihudW1iZXIsc2lnbmFscykpO1xuXG5yZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwuLi5zaWduYWxzQSk7XG59O1xuXG5jb25zdCBnZXRTaWduYWxCeU51bWJlcj1mdW5jdGlvbihudW1iZXIsc2lnbmFscyl7XG5jb25zdCBzaWduYWw9ZmluZFNpZ25hbEJ5TnVtYmVyKG51bWJlcixzaWduYWxzKTtcblxuaWYoc2lnbmFsPT09dW5kZWZpbmVkKXtcbnJldHVybnt9O1xufVxuXG5jb25zdHtuYW1lLGRlc2NyaXB0aW9uLHN1cHBvcnRlZCxhY3Rpb24sZm9yY2VkLHN0YW5kYXJkfT1zaWduYWw7XG5yZXR1cm57XG5bbnVtYmVyXTp7XG5uYW1lLFxubnVtYmVyLFxuZGVzY3JpcHRpb24sXG5zdXBwb3J0ZWQsXG5hY3Rpb24sXG5mb3JjZWQsXG5zdGFuZGFyZH19O1xuXG5cbn07XG5cblxuXG5jb25zdCBmaW5kU2lnbmFsQnlOdW1iZXI9ZnVuY3Rpb24obnVtYmVyLHNpZ25hbHMpe1xuY29uc3Qgc2lnbmFsPXNpZ25hbHMuZmluZCgoe25hbWV9KT0+Y29uc3RhbnRzLnNpZ25hbHNbbmFtZV09PT1udW1iZXIpO1xuXG5pZihzaWduYWwhPT11bmRlZmluZWQpe1xucmV0dXJuIHNpZ25hbDtcbn1cblxucmV0dXJuIHNpZ25hbHMuZmluZCgoc2lnbmFsQSk9PnNpZ25hbEEubnVtYmVyPT09bnVtYmVyKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzaWduYWxzQnlOdW1iZXI9Z2V0U2lnbmFsc0J5TnVtYmVyKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYWluLmpzLm1hcCIsICJcbmV4cG9ydCBjb25zdCBnZXRSZWFsdGltZVNpZ25hbHM9ZnVuY3Rpb24oKXtcbmNvbnN0IGxlbmd0aD1TSUdSVE1BWC1TSUdSVE1JTisxO1xucmV0dXJuIEFycmF5LmZyb20oe2xlbmd0aH0sZ2V0UmVhbHRpbWVTaWduYWwpO1xufTtcblxuY29uc3QgZ2V0UmVhbHRpbWVTaWduYWw9ZnVuY3Rpb24odmFsdWUsaW5kZXgpe1xucmV0dXJue1xubmFtZTpgU0lHUlQke2luZGV4KzF9YCxcbm51bWJlcjpTSUdSVE1JTitpbmRleCxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJBcHBsaWNhdGlvbi1zcGVjaWZpYyBzaWduYWwgKHJlYWx0aW1lKVwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifTtcblxufTtcblxuY29uc3QgU0lHUlRNSU49MzQ7XG5leHBvcnQgY29uc3QgU0lHUlRNQVg9NjQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZWFsdGltZS5qcy5tYXAiLCAiaW1wb3J0e2NvbnN0YW50c31mcm9tXCJub2RlOm9zXCI7XG5cbmltcG9ydHtTSUdOQUxTfWZyb21cIi4vY29yZS5qc1wiO1xuaW1wb3J0e2dldFJlYWx0aW1lU2lnbmFsc31mcm9tXCIuL3JlYWx0aW1lLmpzXCI7XG5cblxuXG5leHBvcnQgY29uc3QgZ2V0U2lnbmFscz1mdW5jdGlvbigpe1xuY29uc3QgcmVhbHRpbWVTaWduYWxzPWdldFJlYWx0aW1lU2lnbmFscygpO1xuY29uc3Qgc2lnbmFscz1bLi4uU0lHTkFMUywuLi5yZWFsdGltZVNpZ25hbHNdLm1hcChub3JtYWxpemVTaWduYWwpO1xucmV0dXJuIHNpZ25hbHM7XG59O1xuXG5cblxuXG5cblxuXG5jb25zdCBub3JtYWxpemVTaWduYWw9ZnVuY3Rpb24oe1xubmFtZSxcbm51bWJlcjpkZWZhdWx0TnVtYmVyLFxuZGVzY3JpcHRpb24sXG5hY3Rpb24sXG5mb3JjZWQ9ZmFsc2UsXG5zdGFuZGFyZH0pXG57XG5jb25zdHtcbnNpZ25hbHM6e1tuYW1lXTpjb25zdGFudFNpZ25hbH19PVxuY29uc3RhbnRzO1xuY29uc3Qgc3VwcG9ydGVkPWNvbnN0YW50U2lnbmFsIT09dW5kZWZpbmVkO1xuY29uc3QgbnVtYmVyPXN1cHBvcnRlZD9jb25zdGFudFNpZ25hbDpkZWZhdWx0TnVtYmVyO1xucmV0dXJue25hbWUsbnVtYmVyLGRlc2NyaXB0aW9uLHN1cHBvcnRlZCxhY3Rpb24sZm9yY2VkLHN0YW5kYXJkfTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zaWduYWxzLmpzLm1hcCIsICJcblxuZXhwb3J0IGNvbnN0IFNJR05BTFM9W1xue1xubmFtZTpcIlNJR0hVUFwiLFxubnVtYmVyOjEsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGVybWluYWwgY2xvc2VkXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHSU5UXCIsXG5udW1iZXI6MixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJVc2VyIGludGVycnVwdGlvbiB3aXRoIENUUkwtQ1wiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHUVVJVFwiLFxubnVtYmVyOjMsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIlVzZXIgaW50ZXJydXB0aW9uIHdpdGggQ1RSTC1cXFxcXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHSUxMXCIsXG5udW1iZXI6NCxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiSW52YWxpZCBtYWNoaW5lIGluc3RydWN0aW9uXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdUUkFQXCIsXG5udW1iZXI6NSxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiRGVidWdnZXIgYnJlYWtwb2ludFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0FCUlRcIixcbm51bWJlcjo2LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJBYm9ydGVkXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdJT1RcIixcbm51bWJlcjo2LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJBYm9ydGVkXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR0JVU1wiLFxubnVtYmVyOjcsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcblwiQnVzIGVycm9yIGR1ZSB0byBtaXNhbGlnbmVkLCBub24tZXhpc3RpbmcgYWRkcmVzcyBvciBwYWdpbmcgZXJyb3JcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHRU1UXCIsXG5udW1iZXI6NyxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJDb21tYW5kIHNob3VsZCBiZSBlbXVsYXRlZCBidXQgaXMgbm90IGltcGxlbWVudGVkXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHRlBFXCIsXG5udW1iZXI6OCxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiRmxvYXRpbmcgcG9pbnQgYXJpdGhtZXRpYyBlcnJvclwiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHS0lMTFwiLFxubnVtYmVyOjksXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiRm9yY2VkIHRlcm1pbmF0aW9uXCIsXG5zdGFuZGFyZDpcInBvc2l4XCIsXG5mb3JjZWQ6dHJ1ZX0sXG5cbntcbm5hbWU6XCJTSUdVU1IxXCIsXG5udW1iZXI6MTAsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQXBwbGljYXRpb24tc3BlY2lmaWMgc2lnbmFsXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHU0VHVlwiLFxubnVtYmVyOjExLFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJTZWdtZW50YXRpb24gZmF1bHRcIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR1VTUjJcIixcbm51bWJlcjoxMixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJBcHBsaWNhdGlvbi1zcGVjaWZpYyBzaWduYWxcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdQSVBFXCIsXG5udW1iZXI6MTMsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQnJva2VuIHBpcGUgb3Igc29ja2V0XCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHQUxSTVwiLFxubnVtYmVyOjE0LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlRpbWVvdXQgb3IgdGltZXJcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdURVJNXCIsXG5udW1iZXI6MTUsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGVybWluYXRpb25cIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR1NUS0ZMVFwiLFxubnVtYmVyOjE2LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlN0YWNrIGlzIGVtcHR5IG9yIG92ZXJmbG93ZWRcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdDSExEXCIsXG5udW1iZXI6MTcsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiQ2hpbGQgcHJvY2VzcyB0ZXJtaW5hdGVkLCBwYXVzZWQgb3IgdW5wYXVzZWRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdDTERcIixcbm51bWJlcjoxNyxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJDaGlsZCBwcm9jZXNzIHRlcm1pbmF0ZWQsIHBhdXNlZCBvciB1bnBhdXNlZFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR0NPTlRcIixcbm51bWJlcjoxOCxcbmFjdGlvbjpcInVucGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiVW5wYXVzZWRcIixcbnN0YW5kYXJkOlwicG9zaXhcIixcbmZvcmNlZDp0cnVlfSxcblxue1xubmFtZTpcIlNJR1NUT1BcIixcbm51bWJlcjoxOSxcbmFjdGlvbjpcInBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIlBhdXNlZFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwiLFxuZm9yY2VkOnRydWV9LFxuXG57XG5uYW1lOlwiU0lHVFNUUFwiLFxubnVtYmVyOjIwLFxuYWN0aW9uOlwicGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiUGF1c2VkIHVzaW5nIENUUkwtWiBvciBcXFwic3VzcGVuZFxcXCJcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdUVElOXCIsXG5udW1iZXI6MjEsXG5hY3Rpb246XCJwYXVzZVwiLFxuZGVzY3JpcHRpb246XCJCYWNrZ3JvdW5kIHByb2Nlc3MgY2Fubm90IHJlYWQgdGVybWluYWwgaW5wdXRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdCUkVBS1wiLFxubnVtYmVyOjIxLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlVzZXIgaW50ZXJydXB0aW9uIHdpdGggQ1RSTC1CUkVBS1wiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR1RUT1VcIixcbm51bWJlcjoyMixcbmFjdGlvbjpcInBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIkJhY2tncm91bmQgcHJvY2VzcyBjYW5ub3Qgd3JpdGUgdG8gdGVybWluYWwgb3V0cHV0XCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHVVJHXCIsXG5udW1iZXI6MjMsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiU29ja2V0IHJlY2VpdmVkIG91dC1vZi1iYW5kIGRhdGFcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHWENQVVwiLFxubnVtYmVyOjI0LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJQcm9jZXNzIHRpbWVkIG91dFwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdYRlNaXCIsXG5udW1iZXI6MjUsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkZpbGUgdG9vIGJpZ1wiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdWVEFMUk1cIixcbm51bWJlcjoyNixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUaW1lb3V0IG9yIHRpbWVyXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1BST0ZcIixcbm51bWJlcjoyNyxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUaW1lb3V0IG9yIHRpbWVyXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1dJTkNIXCIsXG5udW1iZXI6MjgsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiVGVybWluYWwgd2luZG93IHNpemUgY2hhbmdlZFwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdJT1wiLFxubnVtYmVyOjI5LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkkvTyBpcyBhdmFpbGFibGVcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdQT0xMXCIsXG5udW1iZXI6MjksXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiV2F0Y2hlZCBldmVudFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR0lORk9cIixcbm51bWJlcjoyOSxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJSZXF1ZXN0IGZvciBwcm9jZXNzIGluZm9ybWF0aW9uXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHUFdSXCIsXG5udW1iZXI6MzAsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiRGV2aWNlIHJ1bm5pbmcgb3V0IG9mIHBvd2VyXCIsXG5zdGFuZGFyZDpcInN5c3RlbXZcIn0sXG5cbntcbm5hbWU6XCJTSUdTWVNcIixcbm51bWJlcjozMSxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiSW52YWxpZCBzeXN0ZW0gY2FsbFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR1VOVVNFRFwiLFxubnVtYmVyOjMxLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkludmFsaWQgc3lzdGVtIGNhbGxcIixcbnN0YW5kYXJkOlwib3RoZXJcIn1dO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29yZS5qcy5tYXAiLCAiaW1wb3J0IHtzaWduYWxzQnlOYW1lfSBmcm9tICdodW1hbi1zaWduYWxzJztcblxuY29uc3QgZ2V0RXJyb3JQcmVmaXggPSAoe3RpbWVkT3V0LCB0aW1lb3V0LCBlcnJvckNvZGUsIHNpZ25hbCwgc2lnbmFsRGVzY3JpcHRpb24sIGV4aXRDb2RlLCBpc0NhbmNlbGVkfSkgPT4ge1xuXHRpZiAodGltZWRPdXQpIHtcblx0XHRyZXR1cm4gYHRpbWVkIG91dCBhZnRlciAke3RpbWVvdXR9IG1pbGxpc2Vjb25kc2A7XG5cdH1cblxuXHRpZiAoaXNDYW5jZWxlZCkge1xuXHRcdHJldHVybiAnd2FzIGNhbmNlbGVkJztcblx0fVxuXG5cdGlmIChlcnJvckNvZGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBgZmFpbGVkIHdpdGggJHtlcnJvckNvZGV9YDtcblx0fVxuXG5cdGlmIChzaWduYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBgd2FzIGtpbGxlZCB3aXRoICR7c2lnbmFsfSAoJHtzaWduYWxEZXNjcmlwdGlvbn0pYDtcblx0fVxuXG5cdGlmIChleGl0Q29kZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGBmYWlsZWQgd2l0aCBleGl0IGNvZGUgJHtleGl0Q29kZX1gO1xuXHR9XG5cblx0cmV0dXJuICdmYWlsZWQnO1xufTtcblxuZXhwb3J0IGNvbnN0IG1ha2VFcnJvciA9ICh7XG5cdHN0ZG91dCxcblx0c3RkZXJyLFxuXHRhbGwsXG5cdGVycm9yLFxuXHRzaWduYWwsXG5cdGV4aXRDb2RlLFxuXHRjb21tYW5kLFxuXHRlc2NhcGVkQ29tbWFuZCxcblx0dGltZWRPdXQsXG5cdGlzQ2FuY2VsZWQsXG5cdGtpbGxlZCxcblx0cGFyc2VkOiB7b3B0aW9uczoge3RpbWVvdXR9fSxcbn0pID0+IHtcblx0Ly8gYHNpZ25hbGAgYW5kIGBleGl0Q29kZWAgZW1pdHRlZCBvbiBgc3Bhd25lZC5vbignZXhpdCcpYCBldmVudCBjYW4gYmUgYG51bGxgLlxuXHQvLyBXZSBub3JtYWxpemUgdGhlbSB0byBgdW5kZWZpbmVkYFxuXHRleGl0Q29kZSA9IGV4aXRDb2RlID09PSBudWxsID8gdW5kZWZpbmVkIDogZXhpdENvZGU7XG5cdHNpZ25hbCA9IHNpZ25hbCA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IHNpZ25hbDtcblx0Y29uc3Qgc2lnbmFsRGVzY3JpcHRpb24gPSBzaWduYWwgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IHNpZ25hbHNCeU5hbWVbc2lnbmFsXS5kZXNjcmlwdGlvbjtcblxuXHRjb25zdCBlcnJvckNvZGUgPSBlcnJvciAmJiBlcnJvci5jb2RlO1xuXG5cdGNvbnN0IHByZWZpeCA9IGdldEVycm9yUHJlZml4KHt0aW1lZE91dCwgdGltZW91dCwgZXJyb3JDb2RlLCBzaWduYWwsIHNpZ25hbERlc2NyaXB0aW9uLCBleGl0Q29kZSwgaXNDYW5jZWxlZH0pO1xuXHRjb25zdCBleGVjYU1lc3NhZ2UgPSBgQ29tbWFuZCAke3ByZWZpeH06ICR7Y29tbWFuZH1gO1xuXHRjb25zdCBpc0Vycm9yID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGVycm9yKSA9PT0gJ1tvYmplY3QgRXJyb3JdJztcblx0Y29uc3Qgc2hvcnRNZXNzYWdlID0gaXNFcnJvciA/IGAke2V4ZWNhTWVzc2FnZX1cXG4ke2Vycm9yLm1lc3NhZ2V9YCA6IGV4ZWNhTWVzc2FnZTtcblx0Y29uc3QgbWVzc2FnZSA9IFtzaG9ydE1lc3NhZ2UsIHN0ZGVyciwgc3Rkb3V0XS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG5cblx0aWYgKGlzRXJyb3IpIHtcblx0XHRlcnJvci5vcmlnaW5hbE1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuXHRcdGVycm9yLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR9IGVsc2Uge1xuXHRcdGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuXHR9XG5cblx0ZXJyb3Iuc2hvcnRNZXNzYWdlID0gc2hvcnRNZXNzYWdlO1xuXHRlcnJvci5jb21tYW5kID0gY29tbWFuZDtcblx0ZXJyb3IuZXNjYXBlZENvbW1hbmQgPSBlc2NhcGVkQ29tbWFuZDtcblx0ZXJyb3IuZXhpdENvZGUgPSBleGl0Q29kZTtcblx0ZXJyb3Iuc2lnbmFsID0gc2lnbmFsO1xuXHRlcnJvci5zaWduYWxEZXNjcmlwdGlvbiA9IHNpZ25hbERlc2NyaXB0aW9uO1xuXHRlcnJvci5zdGRvdXQgPSBzdGRvdXQ7XG5cdGVycm9yLnN0ZGVyciA9IHN0ZGVycjtcblxuXHRpZiAoYWxsICE9PSB1bmRlZmluZWQpIHtcblx0XHRlcnJvci5hbGwgPSBhbGw7XG5cdH1cblxuXHRpZiAoJ2J1ZmZlcmVkRGF0YScgaW4gZXJyb3IpIHtcblx0XHRkZWxldGUgZXJyb3IuYnVmZmVyZWREYXRhO1xuXHR9XG5cblx0ZXJyb3IuZmFpbGVkID0gdHJ1ZTtcblx0ZXJyb3IudGltZWRPdXQgPSBCb29sZWFuKHRpbWVkT3V0KTtcblx0ZXJyb3IuaXNDYW5jZWxlZCA9IGlzQ2FuY2VsZWQ7XG5cdGVycm9yLmtpbGxlZCA9IGtpbGxlZCAmJiAhdGltZWRPdXQ7XG5cblx0cmV0dXJuIGVycm9yO1xufTtcbiIsICJjb25zdCBhbGlhc2VzID0gWydzdGRpbicsICdzdGRvdXQnLCAnc3RkZXJyJ107XG5cbmNvbnN0IGhhc0FsaWFzID0gb3B0aW9ucyA9PiBhbGlhc2VzLnNvbWUoYWxpYXMgPT4gb3B0aW9uc1thbGlhc10gIT09IHVuZGVmaW5lZCk7XG5cbmV4cG9ydCBjb25zdCBub3JtYWxpemVTdGRpbyA9IG9wdGlvbnMgPT4ge1xuXHRpZiAoIW9wdGlvbnMpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCB7c3RkaW99ID0gb3B0aW9ucztcblxuXHRpZiAoc3RkaW8gPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBhbGlhc2VzLm1hcChhbGlhcyA9PiBvcHRpb25zW2FsaWFzXSk7XG5cdH1cblxuXHRpZiAoaGFzQWxpYXMob3B0aW9ucykpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYEl0J3Mgbm90IHBvc3NpYmxlIHRvIHByb3ZpZGUgXFxgc3RkaW9cXGAgaW4gY29tYmluYXRpb24gd2l0aCBvbmUgb2YgJHthbGlhc2VzLm1hcChhbGlhcyA9PiBgXFxgJHthbGlhc31cXGBgKS5qb2luKCcsICcpfWApO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBzdGRpbyA9PT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gc3RkaW87XG5cdH1cblxuXHRpZiAoIUFycmF5LmlzQXJyYXkoc3RkaW8pKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgc3RkaW9cXGAgdG8gYmUgb2YgdHlwZSBcXGBzdHJpbmdcXGAgb3IgXFxgQXJyYXlcXGAsIGdvdCBcXGAke3R5cGVvZiBzdGRpb31cXGBgKTtcblx0fVxuXG5cdGNvbnN0IGxlbmd0aCA9IE1hdGgubWF4KHN0ZGlvLmxlbmd0aCwgYWxpYXNlcy5sZW5ndGgpO1xuXHRyZXR1cm4gQXJyYXkuZnJvbSh7bGVuZ3RofSwgKHZhbHVlLCBpbmRleCkgPT4gc3RkaW9baW5kZXhdKTtcbn07XG5cbi8vIGBpcGNgIGlzIHB1c2hlZCB1bmxlc3MgaXQgaXMgYWxyZWFkeSBwcmVzZW50XG5leHBvcnQgY29uc3Qgbm9ybWFsaXplU3RkaW9Ob2RlID0gb3B0aW9ucyA9PiB7XG5cdGNvbnN0IHN0ZGlvID0gbm9ybWFsaXplU3RkaW8ob3B0aW9ucyk7XG5cblx0aWYgKHN0ZGlvID09PSAnaXBjJykge1xuXHRcdHJldHVybiAnaXBjJztcblx0fVxuXG5cdGlmIChzdGRpbyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBzdGRpbyA9PT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gW3N0ZGlvLCBzdGRpbywgc3RkaW8sICdpcGMnXTtcblx0fVxuXG5cdGlmIChzdGRpby5pbmNsdWRlcygnaXBjJykpIHtcblx0XHRyZXR1cm4gc3RkaW87XG5cdH1cblxuXHRyZXR1cm4gWy4uLnN0ZGlvLCAnaXBjJ107XG59O1xuIiwgImltcG9ydCBvcyBmcm9tICdub2RlOm9zJztcbmltcG9ydCBvbkV4aXQgZnJvbSAnc2lnbmFsLWV4aXQnO1xuXG5jb25zdCBERUZBVUxUX0ZPUkNFX0tJTExfVElNRU9VVCA9IDEwMDAgKiA1O1xuXG4vLyBNb25rZXktcGF0Y2hlcyBgY2hpbGRQcm9jZXNzLmtpbGwoKWAgdG8gYWRkIGBmb3JjZUtpbGxBZnRlclRpbWVvdXRgIGJlaGF2aW9yXG5leHBvcnQgY29uc3Qgc3Bhd25lZEtpbGwgPSAoa2lsbCwgc2lnbmFsID0gJ1NJR1RFUk0nLCBvcHRpb25zID0ge30pID0+IHtcblx0Y29uc3Qga2lsbFJlc3VsdCA9IGtpbGwoc2lnbmFsKTtcblx0c2V0S2lsbFRpbWVvdXQoa2lsbCwgc2lnbmFsLCBvcHRpb25zLCBraWxsUmVzdWx0KTtcblx0cmV0dXJuIGtpbGxSZXN1bHQ7XG59O1xuXG5jb25zdCBzZXRLaWxsVGltZW91dCA9IChraWxsLCBzaWduYWwsIG9wdGlvbnMsIGtpbGxSZXN1bHQpID0+IHtcblx0aWYgKCFzaG91bGRGb3JjZUtpbGwoc2lnbmFsLCBvcHRpb25zLCBraWxsUmVzdWx0KSkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHRpbWVvdXQgPSBnZXRGb3JjZUtpbGxBZnRlclRpbWVvdXQob3B0aW9ucyk7XG5cdGNvbnN0IHQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRraWxsKCdTSUdLSUxMJyk7XG5cdH0sIHRpbWVvdXQpO1xuXG5cdC8vIEd1YXJkZWQgYmVjYXVzZSB0aGVyZSdzIG5vIGAudW5yZWYoKWAgd2hlbiBgZXhlY2FgIGlzIHVzZWQgaW4gdGhlIHJlbmRlcmVyXG5cdC8vIHByb2Nlc3MgaW4gRWxlY3Ryb24uIFRoaXMgY2Fubm90IGJlIHRlc3RlZCBzaW5jZSB3ZSBkb24ndCBydW4gdGVzdHMgaW5cblx0Ly8gRWxlY3Ryb24uXG5cdC8vIGlzdGFuYnVsIGlnbm9yZSBlbHNlXG5cdGlmICh0LnVucmVmKSB7XG5cdFx0dC51bnJlZigpO1xuXHR9XG59O1xuXG5jb25zdCBzaG91bGRGb3JjZUtpbGwgPSAoc2lnbmFsLCB7Zm9yY2VLaWxsQWZ0ZXJUaW1lb3V0fSwga2lsbFJlc3VsdCkgPT4gaXNTaWd0ZXJtKHNpZ25hbCkgJiYgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0ICE9PSBmYWxzZSAmJiBraWxsUmVzdWx0O1xuXG5jb25zdCBpc1NpZ3Rlcm0gPSBzaWduYWwgPT4gc2lnbmFsID09PSBvcy5jb25zdGFudHMuc2lnbmFscy5TSUdURVJNXG5cdFx0fHwgKHR5cGVvZiBzaWduYWwgPT09ICdzdHJpbmcnICYmIHNpZ25hbC50b1VwcGVyQ2FzZSgpID09PSAnU0lHVEVSTScpO1xuXG5jb25zdCBnZXRGb3JjZUtpbGxBZnRlclRpbWVvdXQgPSAoe2ZvcmNlS2lsbEFmdGVyVGltZW91dCA9IHRydWV9KSA9PiB7XG5cdGlmIChmb3JjZUtpbGxBZnRlclRpbWVvdXQgPT09IHRydWUpIHtcblx0XHRyZXR1cm4gREVGQVVMVF9GT1JDRV9LSUxMX1RJTUVPVVQ7XG5cdH1cblxuXHRpZiAoIU51bWJlci5pc0Zpbml0ZShmb3JjZUtpbGxBZnRlclRpbWVvdXQpIHx8IGZvcmNlS2lsbEFmdGVyVGltZW91dCA8IDApIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCB0aGUgXFxgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0XFxgIG9wdGlvbiB0byBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3QgXFxgJHtmb3JjZUtpbGxBZnRlclRpbWVvdXR9XFxgICgke3R5cGVvZiBmb3JjZUtpbGxBZnRlclRpbWVvdXR9KWApO1xuXHR9XG5cblx0cmV0dXJuIGZvcmNlS2lsbEFmdGVyVGltZW91dDtcbn07XG5cbi8vIGBjaGlsZFByb2Nlc3MuY2FuY2VsKClgXG5leHBvcnQgY29uc3Qgc3Bhd25lZENhbmNlbCA9IChzcGF3bmVkLCBjb250ZXh0KSA9PiB7XG5cdGNvbnN0IGtpbGxSZXN1bHQgPSBzcGF3bmVkLmtpbGwoKTtcblxuXHRpZiAoa2lsbFJlc3VsdCkge1xuXHRcdGNvbnRleHQuaXNDYW5jZWxlZCA9IHRydWU7XG5cdH1cbn07XG5cbmNvbnN0IHRpbWVvdXRLaWxsID0gKHNwYXduZWQsIHNpZ25hbCwgcmVqZWN0KSA9PiB7XG5cdHNwYXduZWQua2lsbChzaWduYWwpO1xuXHRyZWplY3QoT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoJ1RpbWVkIG91dCcpLCB7dGltZWRPdXQ6IHRydWUsIHNpZ25hbH0pKTtcbn07XG5cbi8vIGB0aW1lb3V0YCBvcHRpb24gaGFuZGxpbmdcbmV4cG9ydCBjb25zdCBzZXR1cFRpbWVvdXQgPSAoc3Bhd25lZCwge3RpbWVvdXQsIGtpbGxTaWduYWwgPSAnU0lHVEVSTSd9LCBzcGF3bmVkUHJvbWlzZSkgPT4ge1xuXHRpZiAodGltZW91dCA9PT0gMCB8fCB0aW1lb3V0ID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gc3Bhd25lZFByb21pc2U7XG5cdH1cblxuXHRsZXQgdGltZW91dElkO1xuXHRjb25zdCB0aW1lb3V0UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHR0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHRpbWVvdXRLaWxsKHNwYXduZWQsIGtpbGxTaWduYWwsIHJlamVjdCk7XG5cdFx0fSwgdGltZW91dCk7XG5cdH0pO1xuXG5cdGNvbnN0IHNhZmVTcGF3bmVkUHJvbWlzZSA9IHNwYXduZWRQcm9taXNlLmZpbmFsbHkoKCkgPT4ge1xuXHRcdGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXHR9KTtcblxuXHRyZXR1cm4gUHJvbWlzZS5yYWNlKFt0aW1lb3V0UHJvbWlzZSwgc2FmZVNwYXduZWRQcm9taXNlXSk7XG59O1xuXG5leHBvcnQgY29uc3QgdmFsaWRhdGVUaW1lb3V0ID0gKHt0aW1lb3V0fSkgPT4ge1xuXHRpZiAodGltZW91dCAhPT0gdW5kZWZpbmVkICYmICghTnVtYmVyLmlzRmluaXRlKHRpbWVvdXQpIHx8IHRpbWVvdXQgPCAwKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIHRoZSBcXGB0aW1lb3V0XFxgIG9wdGlvbiB0byBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3QgXFxgJHt0aW1lb3V0fVxcYCAoJHt0eXBlb2YgdGltZW91dH0pYCk7XG5cdH1cbn07XG5cbi8vIGBjbGVhbnVwYCBvcHRpb24gaGFuZGxpbmdcbmV4cG9ydCBjb25zdCBzZXRFeGl0SGFuZGxlciA9IGFzeW5jIChzcGF3bmVkLCB7Y2xlYW51cCwgZGV0YWNoZWR9LCB0aW1lZFByb21pc2UpID0+IHtcblx0aWYgKCFjbGVhbnVwIHx8IGRldGFjaGVkKSB7XG5cdFx0cmV0dXJuIHRpbWVkUHJvbWlzZTtcblx0fVxuXG5cdGNvbnN0IHJlbW92ZUV4aXRIYW5kbGVyID0gb25FeGl0KCgpID0+IHtcblx0XHRzcGF3bmVkLmtpbGwoKTtcblx0fSk7XG5cblx0cmV0dXJuIHRpbWVkUHJvbWlzZS5maW5hbGx5KCgpID0+IHtcblx0XHRyZW1vdmVFeGl0SGFuZGxlcigpO1xuXHR9KTtcbn07XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGlzU3RyZWFtKHN0cmVhbSkge1xuXHRyZXR1cm4gc3RyZWFtICE9PSBudWxsXG5cdFx0JiYgdHlwZW9mIHN0cmVhbSA9PT0gJ29iamVjdCdcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLnBpcGUgPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1dyaXRhYmxlU3RyZWFtKHN0cmVhbSkge1xuXHRyZXR1cm4gaXNTdHJlYW0oc3RyZWFtKVxuXHRcdCYmIHN0cmVhbS53cml0YWJsZSAhPT0gZmFsc2Vcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLl93cml0ZSA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdCYmIHR5cGVvZiBzdHJlYW0uX3dyaXRhYmxlU3RhdGUgPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWFkYWJsZVN0cmVhbShzdHJlYW0pIHtcblx0cmV0dXJuIGlzU3RyZWFtKHN0cmVhbSlcblx0XHQmJiBzdHJlYW0ucmVhZGFibGUgIT09IGZhbHNlXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5fcmVhZCA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdCYmIHR5cGVvZiBzdHJlYW0uX3JlYWRhYmxlU3RhdGUgPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEdXBsZXhTdHJlYW0oc3RyZWFtKSB7XG5cdHJldHVybiBpc1dyaXRhYmxlU3RyZWFtKHN0cmVhbSlcblx0XHQmJiBpc1JlYWRhYmxlU3RyZWFtKHN0cmVhbSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1RyYW5zZm9ybVN0cmVhbShzdHJlYW0pIHtcblx0cmV0dXJuIGlzRHVwbGV4U3RyZWFtKHN0cmVhbSlcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLl90cmFuc2Zvcm0gPT09ICdmdW5jdGlvbic7XG59XG4iLCAiaW1wb3J0IHtpc1N0cmVhbX0gZnJvbSAnaXMtc3RyZWFtJztcbmltcG9ydCBnZXRTdHJlYW0gZnJvbSAnZ2V0LXN0cmVhbSc7XG5pbXBvcnQgbWVyZ2VTdHJlYW0gZnJvbSAnbWVyZ2Utc3RyZWFtJztcblxuLy8gYGlucHV0YCBvcHRpb25cbmV4cG9ydCBjb25zdCBoYW5kbGVJbnB1dCA9IChzcGF3bmVkLCBpbnB1dCkgPT4ge1xuXHRpZiAoaW5wdXQgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmIChpc1N0cmVhbShpbnB1dCkpIHtcblx0XHRpbnB1dC5waXBlKHNwYXduZWQuc3RkaW4pO1xuXHR9IGVsc2Uge1xuXHRcdHNwYXduZWQuc3RkaW4uZW5kKGlucHV0KTtcblx0fVxufTtcblxuLy8gYGFsbGAgaW50ZXJsZWF2ZXMgYHN0ZG91dGAgYW5kIGBzdGRlcnJgXG5leHBvcnQgY29uc3QgbWFrZUFsbFN0cmVhbSA9IChzcGF3bmVkLCB7YWxsfSkgPT4ge1xuXHRpZiAoIWFsbCB8fCAoIXNwYXduZWQuc3Rkb3V0ICYmICFzcGF3bmVkLnN0ZGVycikpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBtaXhlZCA9IG1lcmdlU3RyZWFtKCk7XG5cblx0aWYgKHNwYXduZWQuc3Rkb3V0KSB7XG5cdFx0bWl4ZWQuYWRkKHNwYXduZWQuc3Rkb3V0KTtcblx0fVxuXG5cdGlmIChzcGF3bmVkLnN0ZGVycikge1xuXHRcdG1peGVkLmFkZChzcGF3bmVkLnN0ZGVycik7XG5cdH1cblxuXHRyZXR1cm4gbWl4ZWQ7XG59O1xuXG4vLyBPbiBmYWlsdXJlLCBgcmVzdWx0LnN0ZG91dHxzdGRlcnJ8YWxsYCBzaG91bGQgY29udGFpbiB0aGUgY3VycmVudGx5IGJ1ZmZlcmVkIHN0cmVhbVxuY29uc3QgZ2V0QnVmZmVyZWREYXRhID0gYXN5bmMgKHN0cmVhbSwgc3RyZWFtUHJvbWlzZSkgPT4ge1xuXHQvLyBXaGVuIGBidWZmZXJgIGlzIGBmYWxzZWAsIGBzdHJlYW1Qcm9taXNlYCBpcyBgdW5kZWZpbmVkYCBhbmQgdGhlcmUgaXMgbm8gYnVmZmVyZWQgZGF0YSB0byByZXRyaWV2ZVxuXHRpZiAoIXN0cmVhbSB8fCBzdHJlYW1Qcm9taXNlID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRzdHJlYW0uZGVzdHJveSgpO1xuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIGF3YWl0IHN0cmVhbVByb21pc2U7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0cmV0dXJuIGVycm9yLmJ1ZmZlcmVkRGF0YTtcblx0fVxufTtcblxuY29uc3QgZ2V0U3RyZWFtUHJvbWlzZSA9IChzdHJlYW0sIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9KSA9PiB7XG5cdGlmICghc3RyZWFtIHx8ICFidWZmZXIpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAoZW5jb2RpbmcpIHtcblx0XHRyZXR1cm4gZ2V0U3RyZWFtKHN0cmVhbSwge2VuY29kaW5nLCBtYXhCdWZmZXJ9KTtcblx0fVxuXG5cdHJldHVybiBnZXRTdHJlYW0uYnVmZmVyKHN0cmVhbSwge21heEJ1ZmZlcn0pO1xufTtcblxuLy8gUmV0cmlldmUgcmVzdWx0IG9mIGNoaWxkIHByb2Nlc3M6IGV4aXQgY29kZSwgc2lnbmFsLCBlcnJvciwgc3RyZWFtcyAoc3Rkb3V0L3N0ZGVyci9hbGwpXG5leHBvcnQgY29uc3QgZ2V0U3Bhd25lZFJlc3VsdCA9IGFzeW5jICh7c3Rkb3V0LCBzdGRlcnIsIGFsbH0sIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9LCBwcm9jZXNzRG9uZSkgPT4ge1xuXHRjb25zdCBzdGRvdXRQcm9taXNlID0gZ2V0U3RyZWFtUHJvbWlzZShzdGRvdXQsIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9KTtcblx0Y29uc3Qgc3RkZXJyUHJvbWlzZSA9IGdldFN0cmVhbVByb21pc2Uoc3RkZXJyLCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyfSk7XG5cdGNvbnN0IGFsbFByb21pc2UgPSBnZXRTdHJlYW1Qcm9taXNlKGFsbCwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcjogbWF4QnVmZmVyICogMn0pO1xuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKFtwcm9jZXNzRG9uZSwgc3Rkb3V0UHJvbWlzZSwgc3RkZXJyUHJvbWlzZSwgYWxsUHJvbWlzZV0pO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHJldHVybiBQcm9taXNlLmFsbChbXG5cdFx0XHR7ZXJyb3IsIHNpZ25hbDogZXJyb3Iuc2lnbmFsLCB0aW1lZE91dDogZXJyb3IudGltZWRPdXR9LFxuXHRcdFx0Z2V0QnVmZmVyZWREYXRhKHN0ZG91dCwgc3Rkb3V0UHJvbWlzZSksXG5cdFx0XHRnZXRCdWZmZXJlZERhdGEoc3RkZXJyLCBzdGRlcnJQcm9taXNlKSxcblx0XHRcdGdldEJ1ZmZlcmVkRGF0YShhbGwsIGFsbFByb21pc2UpLFxuXHRcdF0pO1xuXHR9XG59O1xuXG5leHBvcnQgY29uc3QgdmFsaWRhdGVJbnB1dFN5bmMgPSAoe2lucHV0fSkgPT4ge1xuXHRpZiAoaXNTdHJlYW0oaW5wdXQpKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIGBpbnB1dGAgb3B0aW9uIGNhbm5vdCBiZSBhIHN0cmVhbSBpbiBzeW5jIG1vZGUnKTtcblx0fVxufTtcbiIsICIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgdW5pY29ybi9wcmVmZXItdG9wLWxldmVsLWF3YWl0XG5jb25zdCBuYXRpdmVQcm9taXNlUHJvdG90eXBlID0gKGFzeW5jICgpID0+IHt9KSgpLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcblxuY29uc3QgZGVzY3JpcHRvcnMgPSBbJ3RoZW4nLCAnY2F0Y2gnLCAnZmluYWxseSddLm1hcChwcm9wZXJ0eSA9PiBbXG5cdHByb3BlcnR5LFxuXHRSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihuYXRpdmVQcm9taXNlUHJvdG90eXBlLCBwcm9wZXJ0eSksXG5dKTtcblxuLy8gVGhlIHJldHVybiB2YWx1ZSBpcyBhIG1peGluIG9mIGBjaGlsZFByb2Nlc3NgIGFuZCBgUHJvbWlzZWBcbmV4cG9ydCBjb25zdCBtZXJnZVByb21pc2UgPSAoc3Bhd25lZCwgcHJvbWlzZSkgPT4ge1xuXHRmb3IgKGNvbnN0IFtwcm9wZXJ0eSwgZGVzY3JpcHRvcl0gb2YgZGVzY3JpcHRvcnMpIHtcblx0XHQvLyBTdGFydGluZyB0aGUgbWFpbiBgcHJvbWlzZWAgaXMgZGVmZXJyZWQgdG8gYXZvaWQgY29uc3VtaW5nIHN0cmVhbXNcblx0XHRjb25zdCB2YWx1ZSA9IHR5cGVvZiBwcm9taXNlID09PSAnZnVuY3Rpb24nXG5cdFx0XHQ/ICguLi5hcmdzKSA9PiBSZWZsZWN0LmFwcGx5KGRlc2NyaXB0b3IudmFsdWUsIHByb21pc2UoKSwgYXJncylcblx0XHRcdDogZGVzY3JpcHRvci52YWx1ZS5iaW5kKHByb21pc2UpO1xuXG5cdFx0UmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShzcGF3bmVkLCBwcm9wZXJ0eSwgey4uLmRlc2NyaXB0b3IsIHZhbHVlfSk7XG5cdH1cblxuXHRyZXR1cm4gc3Bhd25lZDtcbn07XG5cbi8vIFVzZSBwcm9taXNlcyBpbnN0ZWFkIG9mIGBjaGlsZF9wcm9jZXNzYCBldmVudHNcbmV4cG9ydCBjb25zdCBnZXRTcGF3bmVkUHJvbWlzZSA9IHNwYXduZWQgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRzcGF3bmVkLm9uKCdleGl0JywgKGV4aXRDb2RlLCBzaWduYWwpID0+IHtcblx0XHRyZXNvbHZlKHtleGl0Q29kZSwgc2lnbmFsfSk7XG5cdH0pO1xuXG5cdHNwYXduZWQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuXHRcdHJlamVjdChlcnJvcik7XG5cdH0pO1xuXG5cdGlmIChzcGF3bmVkLnN0ZGluKSB7XG5cdFx0c3Bhd25lZC5zdGRpbi5vbignZXJyb3InLCBlcnJvciA9PiB7XG5cdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdH0pO1xuXHR9XG59KTtcbiIsICJjb25zdCBub3JtYWxpemVBcmdzID0gKGZpbGUsIGFyZ3MgPSBbXSkgPT4ge1xuXHRpZiAoIUFycmF5LmlzQXJyYXkoYXJncykpIHtcblx0XHRyZXR1cm4gW2ZpbGVdO1xuXHR9XG5cblx0cmV0dXJuIFtmaWxlLCAuLi5hcmdzXTtcbn07XG5cbmNvbnN0IE5PX0VTQ0FQRV9SRUdFWFAgPSAvXltcXHcuLV0rJC87XG5jb25zdCBET1VCTEVfUVVPVEVTX1JFR0VYUCA9IC9cIi9nO1xuXG5jb25zdCBlc2NhcGVBcmcgPSBhcmcgPT4ge1xuXHRpZiAodHlwZW9mIGFyZyAhPT0gJ3N0cmluZycgfHwgTk9fRVNDQVBFX1JFR0VYUC50ZXN0KGFyZykpIHtcblx0XHRyZXR1cm4gYXJnO1xuXHR9XG5cblx0cmV0dXJuIGBcIiR7YXJnLnJlcGxhY2UoRE9VQkxFX1FVT1RFU19SRUdFWFAsICdcXFxcXCInKX1cImA7XG59O1xuXG5leHBvcnQgY29uc3Qgam9pbkNvbW1hbmQgPSAoZmlsZSwgYXJncykgPT4gbm9ybWFsaXplQXJncyhmaWxlLCBhcmdzKS5qb2luKCcgJyk7XG5cbmV4cG9ydCBjb25zdCBnZXRFc2NhcGVkQ29tbWFuZCA9IChmaWxlLCBhcmdzKSA9PiBub3JtYWxpemVBcmdzKGZpbGUsIGFyZ3MpLm1hcChhcmcgPT4gZXNjYXBlQXJnKGFyZykpLmpvaW4oJyAnKTtcblxuY29uc3QgU1BBQ0VTX1JFR0VYUCA9IC8gKy9nO1xuXG4vLyBIYW5kbGUgYGV4ZWNhQ29tbWFuZCgpYFxuZXhwb3J0IGNvbnN0IHBhcnNlQ29tbWFuZCA9IGNvbW1hbmQgPT4ge1xuXHRjb25zdCB0b2tlbnMgPSBbXTtcblx0Zm9yIChjb25zdCB0b2tlbiBvZiBjb21tYW5kLnRyaW0oKS5zcGxpdChTUEFDRVNfUkVHRVhQKSkge1xuXHRcdC8vIEFsbG93IHNwYWNlcyB0byBiZSBlc2NhcGVkIGJ5IGEgYmFja3NsYXNoIGlmIG5vdCBtZWFudCBhcyBhIGRlbGltaXRlclxuXHRcdGNvbnN0IHByZXZpb3VzVG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuXHRcdGlmIChwcmV2aW91c1Rva2VuICYmIHByZXZpb3VzVG9rZW4uZW5kc1dpdGgoJ1xcXFwnKSkge1xuXHRcdFx0Ly8gTWVyZ2UgcHJldmlvdXMgdG9rZW4gd2l0aCBjdXJyZW50IG9uZVxuXHRcdFx0dG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXSA9IGAke3ByZXZpb3VzVG9rZW4uc2xpY2UoMCwgLTEpfSAke3Rva2VufWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRva2Vucy5wdXNoKHRva2VuKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG9rZW5zO1xufTtcbiIsICJpbXBvcnQgeyBMb2NhbFN0b3JhZ2UgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBwYmtkZjIgfSBmcm9tIFwiY3J5cHRvXCI7XG5pbXBvcnQgeyBMT0NBTF9TVE9SQUdFX0tFWSB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBERUZBVUxUX1BBU1NXT1JEX09QVElPTlMsIFJFUFJPTVBUX0hBU0hfU0FMVCB9IGZyb20gXCJ+L2NvbnN0YW50cy9wYXNzd29yZHNcIjtcbmltcG9ydCB7IFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gXCJ+L3R5cGVzL3Bhc3N3b3Jkc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFzc3dvcmRHZW5lcmF0aW5nQXJncyhvcHRpb25zOiBQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBPYmplY3QuZW50cmllcyhvcHRpb25zKS5mbGF0TWFwKChbYXJnLCB2YWx1ZV0pID0+ICh2YWx1ZSA/IFtgLS0ke2FyZ31gLCB2YWx1ZV0gOiBbXSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzaE1hc3RlclBhc3N3b3JkRm9yUmVwcm9tcHRpbmcocGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgcGJrZGYyKHBhc3N3b3JkLCBSRVBST01QVF9IQVNIX1NBTFQsIDEwMDAwMCwgNjQsIFwic2hhNTEyXCIsIChlcnJvciwgaGFzaGVkKSA9PiB7XG4gICAgICBpZiAoZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmUoaGFzaGVkLnRvU3RyaW5nKFwiaGV4XCIpKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMoKSB7XG4gIGNvbnN0IHN0b3JlZE9wdGlvbnMgPSBhd2FpdCBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KExPQ0FMX1NUT1JBR0VfS0VZLlBBU1NXT1JEX09QVElPTlMpO1xuICByZXR1cm4ge1xuICAgIC4uLkRFRkFVTFRfUEFTU1dPUkRfT1BUSU9OUyxcbiAgICAuLi4oc3RvcmVkT3B0aW9ucyA/IEpTT04ucGFyc2Uoc3RvcmVkT3B0aW9ucykgOiB7fSksXG4gIH0gYXMgUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zO1xufVxuIiwgImltcG9ydCB7IFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gXCJ+L3R5cGVzL3Bhc3N3b3Jkc1wiO1xuXG5leHBvcnQgY29uc3QgUkVQUk9NUFRfSEFTSF9TQUxUID0gXCJmb29iYXJiYXp6eWJhelwiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QQVNTV09SRF9PUFRJT05TOiBSZXF1aXJlZDxQYXNzd29yZEdlbmVyYXRvck9wdGlvbnM+ID0ge1xuICBsb3dlcmNhc2U6IHRydWUsXG4gIHVwcGVyY2FzZTogdHJ1ZSxcbiAgbnVtYmVyOiBmYWxzZSxcbiAgc3BlY2lhbDogZmFsc2UsXG4gIHBhc3NwaHJhc2U6IGZhbHNlLFxuICBsZW5ndGg6IFwiMTRcIixcbiAgd29yZHM6IFwiM1wiLFxuICBzZXBhcmF0b3I6IFwiLVwiLFxuICBjYXBpdGFsaXplOiBmYWxzZSxcbiAgaW5jbHVkZU51bWJlcjogZmFsc2UsXG4gIG1pbk51bWJlcjogXCIxXCIsXG4gIG1pblNwZWNpYWw6IFwiMVwiLFxufTtcbiIsICJpbXBvcnQgeyBlbnZpcm9ubWVudCwgZ2V0UHJlZmVyZW5jZVZhbHVlcyB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IFZBVUxUX1RJTUVPVVRfTVNfVE9fTEFCRUwgfSBmcm9tIFwifi9jb25zdGFudHMvbGFiZWxzXCI7XG5pbXBvcnQgeyBDb21tYW5kTmFtZSB9IGZyb20gXCJ+L3R5cGVzL2dlbmVyYWxcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlcnZlclVybFByZWZlcmVuY2UoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgeyBzZXJ2ZXJVcmwgfSA9IGdldFByZWZlcmVuY2VWYWx1ZXM8UHJlZmVyZW5jZXM+KCk7XG4gIHJldHVybiAhc2VydmVyVXJsIHx8IHNlcnZlclVybCA9PT0gXCJiaXR3YXJkZW4uY29tXCIgfHwgc2VydmVyVXJsID09PSBcImh0dHBzOi8vYml0d2FyZGVuLmNvbVwiID8gdW5kZWZpbmVkIDogc2VydmVyVXJsO1xufVxuXG50eXBlIFByZWZlcmVuY2VLZXlPZkNvbW1hbmRzV2l0aFRyYW5zaWVudE9wdGlvbnMgPVxuICB8IGtleW9mIFByZWZlcmVuY2VzLlNlYXJjaFxuICB8IGtleW9mIFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmRcbiAgfCBrZXlvZiBQcmVmZXJlbmNlcy5HZW5lcmF0ZVBhc3N3b3JkUXVpY2s7XG5cbnR5cGUgVHJhbnNpZW50T3B0aW9uc1ZhbHVlID1cbiAgfCBQcmVmZXJlbmNlcy5TZWFyY2hbXCJ0cmFuc2llbnRDb3B5U2VhcmNoXCJdXG4gIHwgUHJlZmVyZW5jZXMuR2VuZXJhdGVQYXNzd29yZFtcInRyYW5zaWVudENvcHlHZW5lcmF0ZVBhc3N3b3JkXCJdXG4gIHwgUHJlZmVyZW5jZXMuR2VuZXJhdGVQYXNzd29yZFF1aWNrW1widHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmRRdWlja1wiXTtcblxuY29uc3QgQ09NTUFORF9OQU1FX1RPX1BSRUZFUkVOQ0VfS0VZX01BUDogUmVjb3JkPENvbW1hbmROYW1lLCBQcmVmZXJlbmNlS2V5T2ZDb21tYW5kc1dpdGhUcmFuc2llbnRPcHRpb25zPiA9IHtcbiAgc2VhcmNoOiBcInRyYW5zaWVudENvcHlTZWFyY2hcIixcbiAgXCJnZW5lcmF0ZS1wYXNzd29yZFwiOiBcInRyYW5zaWVudENvcHlHZW5lcmF0ZVBhc3N3b3JkXCIsXG4gIFwiZ2VuZXJhdGUtcGFzc3dvcmQtcXVpY2tcIjogXCJ0cmFuc2llbnRDb3B5R2VuZXJhdGVQYXNzd29yZFF1aWNrXCIsXG59O1xuXG50eXBlIFByZWZlcmVuY2VzID0gUHJlZmVyZW5jZXMuU2VhcmNoICYgUHJlZmVyZW5jZXMuR2VuZXJhdGVQYXNzd29yZCAmIFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmRRdWljaztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zaWVudENvcHlQcmVmZXJlbmNlKHR5cGU6IFwicGFzc3dvcmRcIiB8IFwib3RoZXJcIik6IGJvb2xlYW4ge1xuICBjb25zdCBwcmVmZXJlbmNlS2V5ID0gQ09NTUFORF9OQU1FX1RPX1BSRUZFUkVOQ0VfS0VZX01BUFtlbnZpcm9ubWVudC5jb21tYW5kTmFtZSBhcyBDb21tYW5kTmFtZV07XG4gIGNvbnN0IHRyYW5zaWVudFByZWZlcmVuY2UgPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpW3ByZWZlcmVuY2VLZXldIGFzIFRyYW5zaWVudE9wdGlvbnNWYWx1ZTtcbiAgaWYgKHRyYW5zaWVudFByZWZlcmVuY2UgPT09IFwibmV2ZXJcIikgcmV0dXJuIGZhbHNlO1xuICBpZiAodHJhbnNpZW50UHJlZmVyZW5jZSA9PT0gXCJhbHdheXNcIikgcmV0dXJuIHRydWU7XG4gIGlmICh0cmFuc2llbnRQcmVmZXJlbmNlID09PSBcInBhc3N3b3Jkc1wiKSByZXR1cm4gdHlwZSA9PT0gXCJwYXNzd29yZFwiO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExhYmVsRm9yVGltZW91dFByZWZlcmVuY2UodGltZW91dDogc3RyaW5nIHwgbnVtYmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIFZBVUxUX1RJTUVPVVRfTVNfVE9fTEFCRUxbdGltZW91dCBhcyBrZXlvZiB0eXBlb2YgVkFVTFRfVElNRU9VVF9NU19UT19MQUJFTF07XG59XG4iLCAiY29uc3QgVkFVTFRfVElNRU9VVF9PUFRJT05TID0ge1xuICBJTU1FRElBVEVMWTogXCIwXCIsXG4gIE9ORV9NSU5VVEU6IFwiNjAwMDBcIixcbiAgRklWRV9NSU5VVEVTOiBcIjMwMDAwMFwiLFxuICBGSUZURUVOX01JTlVURVM6IFwiOTAwMDAwXCIsXG4gIFRISVJUWV9NSU5VVEVTOiBcIjE4MDAwMDBcIixcbiAgT05FX0hPVVI6IFwiMzYwMDAwMFwiLFxuICBGT1VSX0hPVVJTOiBcIjE0NDAwMDAwXCIsXG4gIEVJR0hUX0hPVVJTOiBcIjI4ODAwMDAwXCIsXG4gIE9ORV9EQVk6IFwiODY0MDAwMDBcIixcbiAgTkVWRVI6IFwiLTFcIixcbiAgU1lTVEVNX0xPQ0s6IFwiLTJcIixcbiAgU1lTVEVNX1NMRUVQOiBcIi0zXCIsXG59IGFzIGNvbnN0IHNhdGlzZmllcyBSZWNvcmQ8c3RyaW5nLCBQcmVmZXJlbmNlc1tcInJlcHJvbXB0SWdub3JlRHVyYXRpb25cIl0+O1xuXG5leHBvcnQgY29uc3QgVkFVTFRfVElNRU9VVCA9IE9iamVjdC5lbnRyaWVzKFZBVUxUX1RJTUVPVVRfT1BUSU9OUykucmVkdWNlKChhY2MsIFtrZXksIHZhbHVlXSkgPT4ge1xuICBhY2Nba2V5IGFzIGtleW9mIHR5cGVvZiBWQVVMVF9USU1FT1VUX09QVElPTlNdID0gcGFyc2VJbnQodmFsdWUpO1xuICByZXR1cm4gYWNjO1xufSwge30gYXMgUmVjb3JkPGtleW9mIHR5cGVvZiBWQVVMVF9USU1FT1VUX09QVElPTlMsIG51bWJlcj4pO1xuIiwgImltcG9ydCB7IFZBVUxUX1RJTUVPVVQgfSBmcm9tIFwifi9jb25zdGFudHMvcHJlZmVyZW5jZXNcIjtcbmltcG9ydCB7IENhcmQsIElkZW50aXR5LCBJdGVtVHlwZSB9IGZyb20gXCJ+L3R5cGVzL3ZhdWx0XCI7XG5cbmV4cG9ydCBjb25zdCBWQVVMVF9USU1FT1VUX01TX1RPX0xBQkVMOiBQYXJ0aWFsPFJlY29yZDxrZXlvZiB0eXBlb2YgVkFVTFRfVElNRU9VVCwgc3RyaW5nPj4gPSB7XG4gIFtWQVVMVF9USU1FT1VULklNTUVESUFURUxZXTogXCJJbW1lZGlhdGVseVwiLFxuICBbVkFVTFRfVElNRU9VVC5PTkVfTUlOVVRFXTogXCIxIE1pbnV0ZVwiLFxuICBbVkFVTFRfVElNRU9VVC5GSVZFX01JTlVURVNdOiBcIjUgTWludXRlc1wiLFxuICBbVkFVTFRfVElNRU9VVC5GSUZURUVOX01JTlVURVNdOiBcIjE1IE1pbnV0ZXNcIixcbiAgW1ZBVUxUX1RJTUVPVVQuVEhJUlRZX01JTlVURVNdOiBcIjMwIE1pbnV0ZXNcIixcbiAgW1ZBVUxUX1RJTUVPVVQuT05FX0hPVVJdOiBcIjEgSG91clwiLFxuICBbVkFVTFRfVElNRU9VVC5GT1VSX0hPVVJTXTogXCI0IEhvdXJzXCIsXG4gIFtWQVVMVF9USU1FT1VULkVJR0hUX0hPVVJTXTogXCI4IEhvdXJzXCIsXG4gIFtWQVVMVF9USU1FT1VULk9ORV9EQVldOiBcIjEgRGF5XCIsXG59O1xuXG5leHBvcnQgY29uc3QgQ0FSRF9LRVlfTEFCRUw6IFJlY29yZDxrZXlvZiBDYXJkLCBzdHJpbmc+ID0ge1xuICBjYXJkaG9sZGVyTmFtZTogXCJDYXJkaG9sZGVyIG5hbWVcIixcbiAgYnJhbmQ6IFwiQnJhbmRcIixcbiAgbnVtYmVyOiBcIk51bWJlclwiLFxuICBleHBNb250aDogXCJFeHBpcmF0aW9uIG1vbnRoXCIsXG4gIGV4cFllYXI6IFwiRXhwaXJhdGlvbiB5ZWFyXCIsXG4gIGNvZGU6IFwiU2VjdXJpdHkgY29kZSAoQ1ZWKVwiLFxufTtcblxuZXhwb3J0IGNvbnN0IElERU5USVRZX0tFWV9MQUJFTDogUmVjb3JkPGtleW9mIElkZW50aXR5LCBzdHJpbmc+ID0ge1xuICB0aXRsZTogXCJUaXRsZVwiLFxuICBmaXJzdE5hbWU6IFwiRmlyc3QgbmFtZVwiLFxuICBtaWRkbGVOYW1lOiBcIk1pZGRsZSBuYW1lXCIsXG4gIGxhc3ROYW1lOiBcIkxhc3QgbmFtZVwiLFxuICB1c2VybmFtZTogXCJVc2VybmFtZVwiLFxuICBjb21wYW55OiBcIkNvbXBhbnlcIixcbiAgc3NuOiBcIlNvY2lhbCBTZWN1cml0eSBudW1iZXJcIixcbiAgcGFzc3BvcnROdW1iZXI6IFwiUGFzc3BvcnQgbnVtYmVyXCIsXG4gIGxpY2Vuc2VOdW1iZXI6IFwiTGljZW5zZSBudW1iZXJcIixcbiAgZW1haWw6IFwiRW1haWxcIixcbiAgcGhvbmU6IFwiUGhvbmVcIixcbiAgYWRkcmVzczE6IFwiQWRkcmVzcyAxXCIsXG4gIGFkZHJlc3MyOiBcIkFkZHJlc3MgMlwiLFxuICBhZGRyZXNzMzogXCJBZGRyZXNzIDNcIixcbiAgY2l0eTogXCJDaXR5IC8gVG93blwiLFxuICBzdGF0ZTogXCJTdGF0ZSAvIFByb3ZpbmNlXCIsXG4gIHBvc3RhbENvZGU6IFwiWmlwIC8gUG9zdGFsIGNvZGVcIixcbiAgY291bnRyeTogXCJDb3VudHJ5XCIsXG59O1xuXG5leHBvcnQgY29uc3QgSVRFTV9UWVBFX1RPX0xBQkVMOiBSZWNvcmQ8SXRlbVR5cGUsIHN0cmluZz4gPSB7XG4gIFtJdGVtVHlwZS5MT0dJTl06IFwiTG9naW5cIixcbiAgW0l0ZW1UeXBlLkNBUkRdOiBcIkNhcmRcIixcbiAgW0l0ZW1UeXBlLklERU5USVRZXTogXCJJZGVudGl0eVwiLFxuICBbSXRlbVR5cGUuTk9URV06IFwiU2VjdXJlIE5vdGVcIixcbiAgW0l0ZW1UeXBlLlNTSF9LRVldOiBcIlNTSCBLZXlcIixcbn07XG4iLCAiZXhwb3J0IGNsYXNzIE1hbnVhbGx5VGhyb3duRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERpc3BsYXlhYmxlRXJyb3IgZXh0ZW5kcyBNYW51YWxseVRocm93bkVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UsIHN0YWNrKTtcbiAgfVxufVxuXG4vKiAtLSBzcGVjaWZpYyBlcnJvcnMgYmVsb3cgLS0gKi9cblxuZXhwb3J0IGNsYXNzIENMSU5vdEZvdW5kRXJyb3IgZXh0ZW5kcyBEaXNwbGF5YWJsZUVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJCaXR3YXJkZW4gQ0xJIG5vdCBmb3VuZFwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJDTElOb3RGb3VuZEVycm9yXCI7XG4gICAgdGhpcy5zdGFjayA9IHN0YWNrO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbnN0YWxsZWRDTElOb3RGb3VuZEVycm9yIGV4dGVuZHMgRGlzcGxheWFibGVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiQml0d2FyZGVuIENMSSBub3QgZm91bmRcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvclwiO1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRmFpbGVkVG9Mb2FkVmF1bHRJdGVtc0Vycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIkZhaWxlZCB0byBsb2FkIHZhdWx0IGl0ZW1zXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIkZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBWYXVsdElzTG9ja2VkRXJyb3IgZXh0ZW5kcyBEaXNwbGF5YWJsZUVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiVmF1bHQgaXMgbG9ja2VkXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIlZhdWx0SXNMb2NrZWRFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOb3RMb2dnZWRJbkVycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiTm90IGxvZ2dlZCBpblwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJOb3RMb2dnZWRJbkVycm9yXCI7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVuc3VyZUNsaUJpbkVycm9yIGV4dGVuZHMgRGlzcGxheWFibGVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIkZhaWxlZCBkbyBkb3dubG9hZCBCaXR3YXJkZW4gQ0xJXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIkVuc3VyZUNsaUJpbkVycm9yXCI7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByZW1pdW1GZWF0dXJlRXJyb3IgZXh0ZW5kcyBNYW51YWxseVRocm93bkVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiUHJlbWl1bSBzdGF0dXMgaXMgcmVxdWlyZWQgdG8gdXNlIHRoaXMgZmVhdHVyZVwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJQcmVtaXVtRmVhdHVyZUVycm9yXCI7XG4gIH1cbn1cbmV4cG9ydCBjbGFzcyBTZW5kTmVlZHNQYXNzd29yZEVycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIlRoaXMgU2VuZCBoYXMgYSBpcyBwcm90ZWN0ZWQgYnkgYSBwYXNzd29yZFwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJTZW5kTmVlZHNQYXNzd29yZEVycm9yXCI7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNlbmRJbnZhbGlkUGFzc3dvcmRFcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJUaGUgcGFzc3dvcmQgeW91IGVudGVyZWQgaXMgaW52YWxpZFwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJTZW5kSW52YWxpZFBhc3N3b3JkRXJyb3JcIjtcbiAgfVxufVxuXG4vKiAtLSBlcnJvciB1dGlscyBiZWxvdyAtLSAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdHJ5RXhlYzxUPihmbjogKCkgPT4gVCk6IFQgZXh0ZW5kcyB2b2lkID8gVCA6IFQgfCB1bmRlZmluZWQ7XG5leHBvcnQgZnVuY3Rpb24gdHJ5RXhlYzxULCBGPihmbjogKCkgPT4gVCwgZmFsbGJhY2tWYWx1ZTogRik6IFQgfCBGO1xuZXhwb3J0IGZ1bmN0aW9uIHRyeUV4ZWM8VCwgRj4oZm46ICgpID0+IFQsIGZhbGxiYWNrVmFsdWU/OiBGKTogVCB8IEYgfCB1bmRlZmluZWQge1xuICB0cnkge1xuICAgIHJldHVybiBmbigpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsbGJhY2tWYWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGlzcGxheWFibGVFcnJvck1lc3NhZ2UoZXJyb3I6IGFueSkge1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBEaXNwbGF5YWJsZUVycm9yKSByZXR1cm4gZXJyb3IubWVzc2FnZTtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IGdldEVycm9yU3RyaW5nID0gKGVycm9yOiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICBpZiAoIWVycm9yKSByZXR1cm4gdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIGVycm9yID09PSBcInN0cmluZ1wiKSByZXR1cm4gZXJyb3I7XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgY29uc3QgeyBtZXNzYWdlLCBuYW1lIH0gPSBlcnJvcjtcbiAgICBpZiAoZXJyb3Iuc3RhY2spIHJldHVybiBlcnJvci5zdGFjaztcbiAgICByZXR1cm4gYCR7bmFtZX06ICR7bWVzc2FnZX1gO1xuICB9XG4gIHJldHVybiBTdHJpbmcoZXJyb3IpO1xufTtcblxuZXhwb3J0IHR5cGUgU3VjY2VzczxUPiA9IFtULCBudWxsXTtcbmV4cG9ydCB0eXBlIEZhaWx1cmU8RT4gPSBbbnVsbCwgRV07XG5leHBvcnQgdHlwZSBSZXN1bHQ8VCwgRSA9IEVycm9yPiA9IFN1Y2Nlc3M8VD4gfCBGYWlsdXJlPEU+O1xuXG5leHBvcnQgZnVuY3Rpb24gT2s8VD4oZGF0YTogVCk6IFN1Y2Nlc3M8VD4ge1xuICByZXR1cm4gW2RhdGEsIG51bGxdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIEVycjxFID0gRXJyb3I+KGVycm9yOiBFKTogRmFpbHVyZTxFPiB7XG4gIHJldHVybiBbbnVsbCwgZXJyb3JdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ5Q2F0Y2g8VCwgRSA9IEVycm9yPihmbjogKCkgPT4gVCk6IFJlc3VsdDxULCBFPjtcbmV4cG9ydCBmdW5jdGlvbiB0cnlDYXRjaDxULCBFID0gRXJyb3I+KHByb21pc2U6IFByb21pc2U8VD4pOiBQcm9taXNlPFJlc3VsdDxULCBFPj47XG4vKipcbiAqIEV4ZWN1dGVzIGEgZnVuY3Rpb24gb3IgYSBwcm9taXNlIHNhZmVseSBpbnNpZGUgYSB0cnkvY2F0Y2ggYW5kXG4gKiByZXR1cm5zIGEgYFJlc3VsdGAgKGBbZGF0YSwgZXJyb3JdYCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlDYXRjaDxULCBFID0gRXJyb3I+KGZuT3JQcm9taXNlOiAoKCkgPT4gVCkgfCBQcm9taXNlPFQ+KTogTWF5YmVQcm9taXNlPFJlc3VsdDxULCBFPj4ge1xuICBpZiAodHlwZW9mIGZuT3JQcm9taXNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIE9rKGZuT3JQcm9taXNlKCkpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIHJldHVybiBFcnIoZXJyb3IpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZm5PclByb21pc2UudGhlbigoZGF0YSkgPT4gT2soZGF0YSkpLmNhdGNoKChlcnJvcikgPT4gRXJyKGVycm9yKSk7XG59XG4iLCAiaW1wb3J0IHsgZXhpc3RzU3luYywgbWtkaXJTeW5jLCBzdGF0U3luYywgdW5saW5rU3luYyB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgcmVhZGRpciwgdW5saW5rIH0gZnJvbSBcImZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCBzdHJlYW1aaXAgZnJvbSBcIm5vZGUtc3RyZWFtLXppcFwiO1xuaW1wb3J0IHsgdHJ5RXhlYyB9IGZyb20gXCJ+L3V0aWxzL2Vycm9yc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gd2FpdEZvckZpbGVBdmFpbGFibGUocGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAoIWV4aXN0c1N5bmMocGF0aCkpIHJldHVybjtcbiAgICAgIGNvbnN0IHN0YXRzID0gc3RhdFN5bmMocGF0aCk7XG4gICAgICBpZiAoc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9LCAzMDApO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoYEZpbGUgJHtwYXRofSBub3QgZm91bmQuYCkpO1xuICAgIH0sIDUwMDApO1xuICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY29tcHJlc3NGaWxlKGZpbGVQYXRoOiBzdHJpbmcsIHRhcmdldFBhdGg6IHN0cmluZykge1xuICBjb25zdCB6aXAgPSBuZXcgc3RyZWFtWmlwLmFzeW5jKHsgZmlsZTogZmlsZVBhdGggfSk7XG4gIGlmICghZXhpc3RzU3luYyh0YXJnZXRQYXRoKSkgbWtkaXJTeW5jKHRhcmdldFBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICBhd2FpdCB6aXAuZXh0cmFjdChudWxsLCB0YXJnZXRQYXRoKTtcbiAgYXdhaXQgemlwLmNsb3NlKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVGaWxlc1RoYXRTdGFydFdpdGgoc3RhcnRpbmdXaXRoOiBzdHJpbmcsIHBhdGg6IHN0cmluZykge1xuICBsZXQgcmVtb3ZlZEF0TGVhc3RPbmUgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHJlYWRkaXIocGF0aCk7XG4gICAgZm9yIGF3YWl0IChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBpZiAoIWZpbGUuc3RhcnRzV2l0aChzdGFydGluZ1dpdGgpKSBjb250aW51ZTtcbiAgICAgIGF3YWl0IHRyeUV4ZWMoYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCB1bmxpbmsoam9pbihwYXRoLCBmaWxlKSk7XG4gICAgICAgIHJlbW92ZWRBdExlYXN0T25lID0gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiByZW1vdmVkQXRMZWFzdE9uZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB1bmxpbmtBbGxTeW5jKC4uLnBhdGhzOiBzdHJpbmdbXSkge1xuICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHMpIHtcbiAgICB0cnlFeGVjKCgpID0+IHVubGlua1N5bmMocGF0aCkpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgY3JlYXRlV3JpdGVTdHJlYW0sIHVubGluayB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IGh0dHAgZnJvbSBcImh0dHBcIjtcbmltcG9ydCBodHRwcyBmcm9tIFwiaHR0cHNcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuaW1wb3J0IHsgZ2V0RmlsZVNoYTI1NiB9IGZyb20gXCJ+L3V0aWxzL2NyeXB0b1wiO1xuaW1wb3J0IHsgd2FpdEZvckZpbGVBdmFpbGFibGUgfSBmcm9tIFwifi91dGlscy9mc1wiO1xuXG50eXBlIERvd25sb2FkT3B0aW9ucyA9IHtcbiAgb25Qcm9ncmVzcz86IChwZXJjZW50OiBudW1iZXIpID0+IHZvaWQ7XG4gIHNoYTI1Nj86IHN0cmluZztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkb3dubG9hZCh1cmw6IHN0cmluZywgcGF0aDogc3RyaW5nLCBvcHRpb25zPzogRG93bmxvYWRPcHRpb25zKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHsgb25Qcm9ncmVzcywgc2hhMjU2IH0gPSBvcHRpb25zID8/IHt9O1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgdXJpID0gbmV3IFVSTCh1cmwpO1xuICAgIGNvbnN0IHByb3RvY29sID0gdXJpLnByb3RvY29sID09PSBcImh0dHBzOlwiID8gaHR0cHMgOiBodHRwO1xuXG4gICAgbGV0IHJlZGlyZWN0Q291bnQgPSAwO1xuICAgIGNvbnN0IHJlcXVlc3QgPSBwcm90b2NvbC5nZXQodXJpLmhyZWYsIChyZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA+PSAzMDAgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA8IDQwMCkge1xuICAgICAgICByZXF1ZXN0LmRlc3Ryb3koKTtcbiAgICAgICAgcmVzcG9uc2UuZGVzdHJveSgpO1xuXG4gICAgICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gcmVzcG9uc2UuaGVhZGVycy5sb2NhdGlvbjtcbiAgICAgICAgaWYgKCFyZWRpcmVjdFVybCkge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFJlZGlyZWN0IHJlc3BvbnNlIHdpdGhvdXQgbG9jYXRpb24gaGVhZGVyYCkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgrK3JlZGlyZWN0Q291bnQgPj0gMTApIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiVG9vIG1hbnkgcmVkaXJlY3RzXCIpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkb3dubG9hZChyZWRpcmVjdFVybCwgcGF0aCwgb3B0aW9ucykudGhlbihyZXNvbHZlKS5jYXRjaChyZWplY3QpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICE9PSAyMDApIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgUmVzcG9uc2Ugc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX06ICR7cmVzcG9uc2Uuc3RhdHVzTWVzc2FnZX1gKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsZVNpemUgPSBwYXJzZUludChyZXNwb25zZS5oZWFkZXJzW1wiY29udGVudC1sZW5ndGhcIl0gfHwgXCIwXCIsIDEwKTtcbiAgICAgIGlmIChmaWxlU2l6ZSA9PT0gMCkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKFwiSW52YWxpZCBmaWxlIHNpemVcIikpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpbGVTdHJlYW0gPSBjcmVhdGVXcml0ZVN0cmVhbShwYXRoLCB7IGF1dG9DbG9zZTogdHJ1ZSB9KTtcbiAgICAgIGxldCBkb3dubG9hZGVkQnl0ZXMgPSAwO1xuXG4gICAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4ge1xuICAgICAgICByZXF1ZXN0LmRlc3Ryb3koKTtcbiAgICAgICAgcmVzcG9uc2UuZGVzdHJveSgpO1xuICAgICAgICBmaWxlU3RyZWFtLmNsb3NlKCk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBjbGVhbnVwQW5kUmVqZWN0ID0gKGVycm9yPzogRXJyb3IpID0+IHtcbiAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfTtcblxuICAgICAgcmVzcG9uc2Uub24oXCJkYXRhXCIsIChjaHVuaykgPT4ge1xuICAgICAgICBkb3dubG9hZGVkQnl0ZXMgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICBjb25zdCBwZXJjZW50ID0gTWF0aC5mbG9vcigoZG93bmxvYWRlZEJ5dGVzIC8gZmlsZVNpemUpICogMTAwKTtcbiAgICAgICAgb25Qcm9ncmVzcz8uKHBlcmNlbnQpO1xuICAgICAgfSk7XG5cbiAgICAgIGZpbGVTdHJlYW0ub24oXCJmaW5pc2hcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IHdhaXRGb3JGaWxlQXZhaWxhYmxlKHBhdGgpO1xuICAgICAgICAgIGlmIChzaGEyNTYpIGF3YWl0IHdhaXRGb3JIYXNoVG9NYXRjaChwYXRoLCBzaGEyNTYpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGZpbGVTdHJlYW0ub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcbiAgICAgICAgY2FwdHVyZUV4Y2VwdGlvbihgRmlsZSBzdHJlYW0gZXJyb3Igd2hpbGUgZG93bmxvYWRpbmcgJHt1cmx9YCwgZXJyb3IpO1xuICAgICAgICB1bmxpbmsocGF0aCwgKCkgPT4gY2xlYW51cEFuZFJlamVjdChlcnJvcikpO1xuICAgICAgfSk7XG5cbiAgICAgIHJlc3BvbnNlLm9uKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XG4gICAgICAgIGNhcHR1cmVFeGNlcHRpb24oYFJlc3BvbnNlIGVycm9yIHdoaWxlIGRvd25sb2FkaW5nICR7dXJsfWAsIGVycm9yKTtcbiAgICAgICAgdW5saW5rKHBhdGgsICgpID0+IGNsZWFudXBBbmRSZWplY3QoZXJyb3IpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXF1ZXN0Lm9uKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XG4gICAgICAgIGNhcHR1cmVFeGNlcHRpb24oYFJlcXVlc3QgZXJyb3Igd2hpbGUgZG93bmxvYWRpbmcgJHt1cmx9YCwgZXJyb3IpO1xuICAgICAgICB1bmxpbmsocGF0aCwgKCkgPT4gY2xlYW51cEFuZFJlamVjdChlcnJvcikpO1xuICAgICAgfSk7XG5cbiAgICAgIHJlc3BvbnNlLnBpcGUoZmlsZVN0cmVhbSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB3YWl0Rm9ySGFzaFRvTWF0Y2gocGF0aDogc3RyaW5nLCBzaGEyNTY6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGZpbGVTaGEgPSBnZXRGaWxlU2hhMjU2KHBhdGgpO1xuICAgIGlmICghZmlsZVNoYSkgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoYENvdWxkIG5vdCBnZW5lcmF0ZSBoYXNoIGZvciBmaWxlICR7cGF0aH0uYCkpO1xuICAgIGlmIChmaWxlU2hhID09PSBzaGEyNTYpIHJldHVybiByZXNvbHZlKCk7XG5cbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmIChnZXRGaWxlU2hhMjU2KHBhdGgpID09PSBzaGEyNTYpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9LCAxMDAwKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICByZWplY3QobmV3IEVycm9yKGBIYXNoIGRpZCBub3QgbWF0Y2gsIGV4cGVjdGVkICR7c2hhMjU2LnN1YnN0cmluZygwLCA3KX0sIGdvdCAke2ZpbGVTaGEuc3Vic3RyaW5nKDAsIDcpfS5gKSk7XG4gICAgfSwgNTAwMCk7XG4gIH0pO1xufVxuIiwgImltcG9ydCB7IGVudmlyb25tZW50IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgZ2V0RXJyb3JTdHJpbmcgfSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gYXMgY2FwdHVyZUV4Y2VwdGlvblJheWNhc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5cbnR5cGUgTG9nID0ge1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIGVycm9yOiBhbnk7XG59O1xuXG5jb25zdCBfZXhjZXB0aW9ucyA9IHtcbiAgbG9nczogbmV3IE1hcDxEYXRlLCBMb2c+KCksXG4gIHNldDogKG1lc3NhZ2U6IHN0cmluZywgZXJyb3I/OiBhbnkpOiB2b2lkID0+IHtcbiAgICBjYXB0dXJlZEV4Y2VwdGlvbnMubG9ncy5zZXQobmV3IERhdGUoKSwgeyBtZXNzYWdlLCBlcnJvciB9KTtcbiAgfSxcbiAgY2xlYXI6ICgpOiB2b2lkID0+IGNhcHR1cmVkRXhjZXB0aW9ucy5sb2dzLmNsZWFyKCksXG4gIHRvU3RyaW5nOiAoKTogc3RyaW5nID0+IHtcbiAgICBsZXQgc3RyID0gXCJcIjtcbiAgICBjYXB0dXJlZEV4Y2VwdGlvbnMubG9ncy5mb3JFYWNoKChsb2csIGRhdGUpID0+IHtcbiAgICAgIGlmIChzdHIubGVuZ3RoID4gMCkgc3RyICs9IFwiXFxuXFxuXCI7XG4gICAgICBzdHIgKz0gYFske2RhdGUudG9JU09TdHJpbmcoKX1dICR7bG9nLm1lc3NhZ2V9YDtcbiAgICAgIGlmIChsb2cuZXJyb3IpIHN0ciArPSBgOiAke2dldEVycm9yU3RyaW5nKGxvZy5lcnJvcil9YDtcbiAgICB9KTtcblxuICAgIHJldHVybiBzdHI7XG4gIH0sXG59O1xuXG5leHBvcnQgY29uc3QgY2FwdHVyZWRFeGNlcHRpb25zID0gT2JqZWN0LmZyZWV6ZShfZXhjZXB0aW9ucyk7XG5cbnR5cGUgQ2FwdHVyZUV4Y2VwdGlvbk9wdGlvbnMgPSB7XG4gIGNhcHR1cmVUb1JheWNhc3Q/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IGNvbnN0IGNhcHR1cmVFeGNlcHRpb24gPSAoXG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgfCBGYWxzeSB8IChzdHJpbmcgfCBGYWxzeSlbXSxcbiAgZXJyb3I6IGFueSxcbiAgb3B0aW9ucz86IENhcHR1cmVFeGNlcHRpb25PcHRpb25zXG4pID0+IHtcbiAgY29uc3QgeyBjYXB0dXJlVG9SYXljYXN0ID0gZmFsc2UgfSA9IG9wdGlvbnMgPz8ge307XG4gIGNvbnN0IGRlc2MgPSBBcnJheS5pc0FycmF5KGRlc2NyaXB0aW9uKSA/IGRlc2NyaXB0aW9uLmZpbHRlcihCb29sZWFuKS5qb2luKFwiIFwiKSA6IGRlc2NyaXB0aW9uIHx8IFwiQ2FwdHVyZWQgZXhjZXB0aW9uXCI7XG4gIGNhcHR1cmVkRXhjZXB0aW9ucy5zZXQoZGVzYywgZXJyb3IpO1xuICBpZiAoZW52aXJvbm1lbnQuaXNEZXZlbG9wbWVudCkge1xuICAgIGNvbnNvbGUuZXJyb3IoZGVzYywgZXJyb3IpO1xuICB9IGVsc2UgaWYgKGNhcHR1cmVUb1JheWNhc3QpIHtcbiAgICBjYXB0dXJlRXhjZXB0aW9uUmF5Y2FzdChlcnJvcik7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBkZWJ1Z0xvZyA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICBpZiAoIWVudmlyb25tZW50LmlzRGV2ZWxvcG1lbnQpIHJldHVybjtcbiAgY29uc29sZS5kZWJ1ZyguLi5hcmdzKTtcbn07XG4iLCAiaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBjcmVhdGVIYXNoIH0gZnJvbSBcImNyeXB0b1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZVNoYTI1NihmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGNyZWF0ZUhhc2goXCJzaGEyNTZcIikudXBkYXRlKHJlYWRGaWxlU3luYyhmaWxlUGF0aCkpLmRpZ2VzdChcImhleFwiKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIiwgImltcG9ydCB7IFNlbmRDcmVhdGVQYXlsb2FkIH0gZnJvbSBcIn4vdHlwZXMvc2VuZFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJlcGFyZVNlbmRQYXlsb2FkKHRlbXBsYXRlOiBTZW5kQ3JlYXRlUGF5bG9hZCwgdmFsdWVzOiBTZW5kQ3JlYXRlUGF5bG9hZCk6IFNlbmRDcmVhdGVQYXlsb2FkIHtcbiAgcmV0dXJuIHtcbiAgICAuLi50ZW1wbGF0ZSxcbiAgICAuLi52YWx1ZXMsXG4gICAgZmlsZTogdmFsdWVzLmZpbGUgPyB7IC4uLnRlbXBsYXRlLmZpbGUsIC4uLnZhbHVlcy5maWxlIH0gOiB0ZW1wbGF0ZS5maWxlLFxuICAgIHRleHQ6IHZhbHVlcy50ZXh0ID8geyAuLi50ZW1wbGF0ZS50ZXh0LCAuLi52YWx1ZXMudGV4dCB9IDogdGVtcGxhdGUudGV4dCxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyBDYWNoZSBhcyBSYXljYXN0Q2FjaGUgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5cbmV4cG9ydCBjb25zdCBDYWNoZSA9IG5ldyBSYXljYXN0Q2FjaGUoeyBuYW1lc3BhY2U6IFwiYnctY2FjaGVcIiB9KTtcbiIsICJleHBvcnQgY29uc3QgcGxhdGZvcm0gPSBwcm9jZXNzLnBsYXRmb3JtID09PSBcImRhcndpblwiID8gXCJtYWNvc1wiIDogXCJ3aW5kb3dzXCI7XG4iLCAiaW1wb3J0IHsgRm9ybSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcblxuZXhwb3J0IGNvbnN0IExvYWRpbmdGYWxsYmFjayA9ICgpID0+IDxGb3JtIGlzTG9hZGluZyAvPjtcbiIsICJpbXBvcnQgeyBBY3Rpb25QYW5lbCwgQWN0aW9uLCBEZXRhaWwsIGdldFByZWZlcmVuY2VWYWx1ZXMsIGVudmlyb25tZW50IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgQnVnUmVwb3J0Q29sbGVjdERhdGFBY3Rpb24sIEJ1Z1JlcG9ydE9wZW5BY3Rpb24gfSBmcm9tIFwifi9jb21wb25lbnRzL2FjdGlvbnNcIjtcbmltcG9ydCB7IEJVR19SRVBPUlRfVVJMIH0gZnJvbSBcIn4vY29tcG9uZW50cy9hY3Rpb25zL0J1Z1JlcG9ydE9wZW5BY3Rpb25cIjtcbmltcG9ydCB7IEVuc3VyZUNsaUJpbkVycm9yLCBJbnN0YWxsZWRDTElOb3RGb3VuZEVycm9yLCBnZXRFcnJvclN0cmluZyB9IGZyb20gXCJ+L3V0aWxzL2Vycm9yc1wiO1xuaW1wb3J0IHsgcGxhdGZvcm0gfSBmcm9tIFwifi91dGlscy9wbGF0Zm9ybVwiO1xuXG5jb25zdCBMSU5FX0JSRUFLID0gXCJcXG5cXG5cIjtcbmNvbnN0IENMSV9JTlNUQUxMQVRJT05fSEVMUF9VUkwgPSBcImh0dHBzOi8vYml0d2FyZGVuLmNvbS9oZWxwL2NsaS8jZG93bmxvYWQtYW5kLWluc3RhbGxcIjtcblxuY29uc3QgZ2V0Q29kZUJsb2NrID0gKGNvbnRlbnQ6IHN0cmluZykgPT4gYFxcYFxcYFxcYFxcbiR7Y29udGVudH1cXG5cXGBcXGBcXGBgO1xuXG50eXBlIE1lc3NhZ2VzID0gc3RyaW5nIHwgbnVtYmVyIHwgZmFsc2UgfCAwIHwgXCJcIiB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCB0eXBlIFRyb3VibGVzaG9vdGluZ0d1aWRlUHJvcHMgPSB7XG4gIGVycm9yPzogYW55O1xufTtcblxuY29uc3QgVHJvdWJsZXNob290aW5nR3VpZGUgPSAoeyBlcnJvciB9OiBUcm91Ymxlc2hvb3RpbmdHdWlkZVByb3BzKSA9PiB7XG4gIGNvbnN0IGVycm9yU3RyaW5nID0gZ2V0RXJyb3JTdHJpbmcoZXJyb3IpO1xuICBjb25zdCBsb2NhbENsaVBhdGggPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpLmNsaVBhdGg7XG4gIGNvbnN0IGlzQ2xpRG93bmxvYWRFcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRW5zdXJlQ2xpQmluRXJyb3I7XG4gIGNvbnN0IG5lZWRzVG9JbnN0YWxsQ2xpID0gbG9jYWxDbGlQYXRoIHx8IGVycm9yIGluc3RhbmNlb2YgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvcjtcblxuICBjb25zdCBtZXNzYWdlczogTWVzc2FnZXNbXSA9IFtdO1xuXG4gIGlmIChuZWVkc1RvSW5zdGFsbENsaSAmJiAhaXNDbGlEb3dubG9hZEVycm9yKSB7XG4gICAgbWVzc2FnZXMucHVzaChcIiMgXHUyNkEwXHVGRTBGIEJpdHdhcmRlbiBDTEkgbm90IGZvdW5kXCIpO1xuICB9IGVsc2Uge1xuICAgIG1lc3NhZ2VzLnB1c2goXCIjIFx1RDgzRFx1RENBNSBXaG9vcHMhIFNvbWV0aGluZyB3ZW50IHdyb25nXCIpO1xuICB9XG5cbiAgaWYgKGlzQ2xpRG93bmxvYWRFcnJvcikge1xuICAgIG1lc3NhZ2VzLnB1c2goXG4gICAgICBgV2UgY291bGRuJ3QgZG93bmxvYWQgdGhlIFtCaXR3YXJkZW4gQ0xJXSgke0NMSV9JTlNUQUxMQVRJT05fSEVMUF9VUkx9KSwgeW91IGNhbiBhbHdheXMgaW5zdGFsbCBpdCBvbiB5b3VyIG1hY2hpbmUuYFxuICAgICk7XG4gIH0gZWxzZSBpZiAobmVlZHNUb0luc3RhbGxDbGkpIHtcbiAgICBjb25zdCBjbGlQYXRoU3RyaW5nID0gbG9jYWxDbGlQYXRoID8gYCAoJHtsb2NhbENsaVBhdGh9KWAgOiBcIlwiO1xuICAgIG1lc3NhZ2VzLnB1c2goXG4gICAgICBgV2UgY291bGRuJ3QgZmluZCB0aGUgW0JpdHdhcmRlbiBDTEldKCR7Q0xJX0lOU1RBTExBVElPTl9IRUxQX1VSTH0pIGluc3RhbGxlZCBvbiB5b3VyIG1hY2hpbmUke2NsaVBhdGhTdHJpbmd9LmBcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIG1lc3NhZ2VzLnB1c2goYFRoZSBcXGAke2Vudmlyb25tZW50LmNvbW1hbmROYW1lfVxcYCBjb21tYW5kIGNyYXNoZWQgd2hlbiB3ZSB3ZXJlIG5vdCBleHBlY3RpbmcgaXQgdG8uYCk7XG4gIH1cblxuICBtZXNzYWdlcy5wdXNoKFxuICAgIFwiPiBQbGVhc2UgcmVhZCB0aGUgYFNldHVwYCBzZWN0aW9uIGluIHRoZSBbZXh0ZW5zaW9uJ3MgZGVzY3JpcHRpb25dKGh0dHBzOi8vd3d3LnJheWNhc3QuY29tL2pvbWlmZXBlL2JpdHdhcmRlbikgdG8gZW5zdXJlIHRoYXQgZXZlcnl0aGluZyBpcyBwcm9wZXJseSBjb25maWd1cmVkLlwiXG4gICk7XG5cbiAgbWVzc2FnZXMucHVzaChcbiAgICBgKipUcnkgcmVzdGFydGluZyB0aGUgY29tbWFuZC4gSWYgdGhlIGlzc3VlIHBlcnNpc3RzLCBjb25zaWRlciBbcmVwb3J0aW5nIGEgYnVnIG9uIEdpdEh1Yl0oJHtCVUdfUkVQT1JUX1VSTH0pIHRvIGhlbHAgdXMgZml4IGl0LioqYFxuICApO1xuXG4gIGlmIChlcnJvclN0cmluZykge1xuICAgIGNvbnN0IGlzQXJjaEVycm9yID0gL2luY29tcGF0aWJsZSBhcmNoaXRlY3R1cmUvZ2kudGVzdChlcnJvclN0cmluZyk7XG4gICAgbWVzc2FnZXMucHVzaChcbiAgICAgIFwiPiMjIFRlY2huaWNhbCBkZXRhaWxzIFx1RDgzRVx1REQxM1wiLFxuICAgICAgaXNBcmNoRXJyb3IgJiZcbiAgICAgICAgYFx1MjZBMFx1RkUwRiBXZSBzdXNwZWN0IHRoYXQgeW91ciBCaXR3YXJkZW4gQ0xJIHdhcyBpbnN0YWxsZWQgdXNpbmcgYSB2ZXJzaW9uIG9mIE5vZGVKUyB0aGF0J3MgaW5jb21wYXRpYmxlIHdpdGggeW91ciBzeXN0ZW0gYXJjaGl0ZWN0dXJlIChlLmcuIHg2NCBOb2RlSlMgb24gYSBNMS9BcHBsZSBTaWxpY29uIE1hYykuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBoYXZlIHRoZSBjb3JyZWN0IHZlcnNpb25zIG9mIHlvdXIgc29mdHdhcmUgaW5zdGFsbGVkIChlLmcuLCAke1xuICAgICAgICAgIHBsYXRmb3JtID09PSBcIm1hY29zXCIgPyBcIkhvbWVicmV3LCBcIiA6IFwiXCJcbiAgICAgICAgfU5vZGVKUywgYW5kIEJpdHdhcmRlbiBDTEkpLmAsXG4gICAgICBnZXRDb2RlQmxvY2soZXJyb3JTdHJpbmcpXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPERldGFpbFxuICAgICAgbWFya2Rvd249e21lc3NhZ2VzLmZpbHRlcihCb29sZWFuKS5qb2luKExJTkVfQlJFQUspfVxuICAgICAgYWN0aW9ucz17XG4gICAgICAgIDxBY3Rpb25QYW5lbD5cbiAgICAgICAgICA8QWN0aW9uUGFuZWwuU2VjdGlvbiB0aXRsZT1cIkJ1ZyBSZXBvcnRcIj5cbiAgICAgICAgICAgIDxCdWdSZXBvcnRPcGVuQWN0aW9uIC8+XG4gICAgICAgICAgICA8QnVnUmVwb3J0Q29sbGVjdERhdGFBY3Rpb24gLz5cbiAgICAgICAgICA8L0FjdGlvblBhbmVsLlNlY3Rpb24+XG4gICAgICAgICAge25lZWRzVG9JbnN0YWxsQ2xpICYmIChcbiAgICAgICAgICAgIDxBY3Rpb24uT3BlbkluQnJvd3NlciB0aXRsZT1cIk9wZW4gSW5zdGFsbGF0aW9uIEd1aWRlXCIgdXJsPXtDTElfSU5TVEFMTEFUSU9OX0hFTFBfVVJMfSAvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gICAgICB9XG4gICAgLz5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRyb3VibGVzaG9vdGluZ0d1aWRlO1xuIiwgImltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcblxuZXhwb3J0IGNvbnN0IEJVR19SRVBPUlRfVVJMID1cbiAgXCJodHRwczovL2dpdGh1Yi5jb20vcmF5Y2FzdC9leHRlbnNpb25zL2lzc3Vlcy9uZXc/YXNzaWduZWVzPSZsYWJlbHM9ZXh0ZW5zaW9uJTJDYnVnJnRlbXBsYXRlPWV4dGVuc2lvbl9idWdfcmVwb3J0LnltbCZ0aXRsZT0lNUJCaXR3YXJkZW4lNUQrLi4uXCI7XG5cbmZ1bmN0aW9uIEJ1Z1JlcG9ydE9wZW5BY3Rpb24oKSB7XG4gIHJldHVybiA8QWN0aW9uLk9wZW5JbkJyb3dzZXIgdGl0bGU9XCJPcGVuIEJ1ZyBSZXBvcnRcIiB1cmw9e0JVR19SRVBPUlRfVVJMfSAvPjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQnVnUmVwb3J0T3BlbkFjdGlvbjtcbiIsICJpbXBvcnQgeyBFZmZlY3RDYWxsYmFjaywgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcblxudHlwZSBBc3luY0VmZmVjdENhbGxiYWNrID0gKCkgPT4gUHJvbWlzZTxhbnk+O1xudHlwZSBFZmZlY3QgPSBFZmZlY3RDYWxsYmFjayB8IEFzeW5jRWZmZWN0Q2FsbGJhY2s7XG5cbnR5cGUgRGVmaW5lZFZhbHVlID0gbnVsbCB8IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmcgfCBvYmplY3QgfCBzeW1ib2w7XG5cbi8qKiBgdXNlRWZmZWN0YCB0aGF0IG9ubHkgcnVucyBvbmNlIGFmdGVyIHRoZSBgY29uZGl0aW9uYCBpcyBtZXQgKi9cbmZ1bmN0aW9uIHVzZU9uY2VFZmZlY3QoZWZmZWN0OiBFZmZlY3QsIGNvbmRpdGlvbj86IERlZmluZWRWYWx1ZSkge1xuICBjb25zdCBoYXNSdW4gPSB1c2VSZWYoZmFsc2UpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGhhc1J1bi5jdXJyZW50KSByZXR1cm47XG4gICAgaWYgKGNvbmRpdGlvbiAhPT0gdW5kZWZpbmVkICYmICFjb25kaXRpb24pIHJldHVybjtcbiAgICBoYXNSdW4uY3VycmVudCA9IHRydWU7XG4gICAgdm9pZCBlZmZlY3QoKTtcbiAgfSwgW2NvbmRpdGlvbl0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCB1c2VPbmNlRWZmZWN0O1xuIiwgImV4cG9ydCB0eXBlIE9iamVjdEVudHJpZXM8T2JqPiA9IHsgW0tleSBpbiBrZXlvZiBPYmpdOiBbS2V5LCBPYmpbS2V5XV0gfVtrZXlvZiBPYmpdW107XG5cbi8qKiBgT2JqZWN0LmVudHJpZXNgIHdpdGggdHlwZWQga2V5cyAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdEVudHJpZXM8VCBleHRlbmRzIG9iamVjdD4ob2JqOiBUKSB7XG4gIHJldHVybiBPYmplY3QuZW50cmllcyhvYmopIGFzIE9iamVjdEVudHJpZXM8VD47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdChvYmo6IHVua25vd24pOiBvYmogaXMgb2JqZWN0IHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsICYmICFBcnJheS5pc0FycmF5KG9iaik7XG59XG4iLCAiaW1wb3J0IHsgRXhlY2FFcnJvciB9IGZyb20gXCJleGVjYVwiO1xuaW1wb3J0IHsgaXNPYmplY3QgfSBmcm9tIFwifi91dGlscy9vYmplY3RzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmVhdEVycm9yKGVycm9yOiB1bmtub3duLCBvcHRpb25zPzogeyBvbWl0U2Vuc2l0aXZlVmFsdWU6IHN0cmluZyB9KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZXhlY2FFcnJvciA9IGVycm9yIGFzIEV4ZWNhRXJyb3I7XG4gICAgbGV0IGVycm9yU3RyaW5nOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgaWYgKGV4ZWNhRXJyb3I/LnN0ZGVycikge1xuICAgICAgZXJyb3JTdHJpbmcgPSBleGVjYUVycm9yLnN0ZGVycjtcbiAgICB9IGVsc2UgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIGVycm9yU3RyaW5nID0gYCR7ZXJyb3IubmFtZX06ICR7ZXJyb3IubWVzc2FnZX1gO1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QoZXJyb3IpKSB7XG4gICAgICBlcnJvclN0cmluZyA9IEpTT04uc3RyaW5naWZ5KGVycm9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JTdHJpbmcgPSBgJHtlcnJvcn1gO1xuICAgIH1cblxuICAgIGlmICghZXJyb3JTdHJpbmcpIHJldHVybiBcIlwiO1xuICAgIGlmICghb3B0aW9ucz8ub21pdFNlbnNpdGl2ZVZhbHVlKSByZXR1cm4gZXJyb3JTdHJpbmc7XG5cbiAgICByZXR1cm4gb21pdFNlbnNpdGl2ZVZhbHVlRnJvbVN0cmluZyhlcnJvclN0cmluZywgb3B0aW9ucy5vbWl0U2Vuc2l0aXZlVmFsdWUpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb21pdFNlbnNpdGl2ZVZhbHVlRnJvbVN0cmluZyh2YWx1ZTogc3RyaW5nLCBzZW5zaXRpdmVWYWx1ZTogc3RyaW5nKSB7XG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKG5ldyBSZWdFeHAoc2Vuc2l0aXZlVmFsdWUsIFwiaVwiKSwgXCJbUkVEQUNURURdXCIpO1xufVxuIiwgImltcG9ydCB7IEFsZXJ0LCBjbG9zZU1haW5XaW5kb3csIGNvbmZpcm1BbGVydCwgSWNvbiwgcG9wVG9Sb290IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlQml0d2FyZGVuIH0gZnJvbSBcIn4vY29udGV4dC9iaXR3YXJkZW5cIjtcbmltcG9ydCB7IFZhdWx0U3RhdGUgfSBmcm9tIFwifi90eXBlcy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBnZXRTZXJ2ZXJVcmxQcmVmZXJlbmNlIH0gZnJvbSBcIn4vdXRpbHMvcHJlZmVyZW5jZXNcIjtcblxuZnVuY3Rpb24gdXNlVmF1bHRNZXNzYWdlcygpIHtcbiAgY29uc3QgYml0d2FyZGVuID0gdXNlQml0d2FyZGVuKCk7XG4gIGNvbnN0IFt2YXVsdFN0YXRlLCBzZXRWYXVsdFN0YXRlXSA9IHVzZVN0YXRlPFZhdWx0U3RhdGUgfCBudWxsPihudWxsKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHZvaWQgYml0d2FyZGVuXG4gICAgICAuc3RhdHVzKClcbiAgICAgIC50aGVuKCh7IGVycm9yLCByZXN1bHQgfSkgPT4ge1xuICAgICAgICBpZiAoIWVycm9yKSBzZXRWYXVsdFN0YXRlKHJlc3VsdCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgLyogaWdub3JlICovXG4gICAgICB9KTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IHNob3VsZFNob3dTZXJ2ZXIgPSAhIWdldFNlcnZlclVybFByZWZlcmVuY2UoKTtcblxuICBsZXQgdXNlck1lc3NhZ2UgPSBcIi4uLlwiO1xuICBsZXQgc2VydmVyTWVzc2FnZSA9IFwiLi4uXCI7XG5cbiAgaWYgKHZhdWx0U3RhdGUpIHtcbiAgICBjb25zdCB7IHN0YXR1cywgdXNlckVtYWlsLCBzZXJ2ZXJVcmwgfSA9IHZhdWx0U3RhdGU7XG4gICAgdXNlck1lc3NhZ2UgPSBzdGF0dXMgPT0gXCJ1bmF1dGhlbnRpY2F0ZWRcIiA/IFwiXHUyNzRDIExvZ2dlZCBvdXRcIiA6IGBcdUQ4M0RcdUREMTIgTG9ja2VkICgke3VzZXJFbWFpbH0pYDtcbiAgICBpZiAoc2VydmVyVXJsKSB7XG4gICAgICBzZXJ2ZXJNZXNzYWdlID0gc2VydmVyVXJsIHx8IFwiXCI7XG4gICAgfSBlbHNlIGlmICgoIXNlcnZlclVybCAmJiBzaG91bGRTaG93U2VydmVyKSB8fCAoc2VydmVyVXJsICYmICFzaG91bGRTaG93U2VydmVyKSkge1xuICAgICAgLy8gSG9zdGVkIHN0YXRlIG5vdCBpbiBzeW5jIHdpdGggQ0xJICh3ZSBkb24ndCBjaGVjayBmb3IgZXF1YWxpdHkpXG4gICAgICB2b2lkIGNvbmZpcm1BbGVydCh7XG4gICAgICAgIGljb246IEljb24uRXhjbGFtYXRpb25NYXJrLFxuICAgICAgICB0aXRsZTogXCJSZXN0YXJ0IFJlcXVpcmVkXCIsXG4gICAgICAgIG1lc3NhZ2U6IFwiQml0d2FyZGVuIHNlcnZlciBVUkwgcHJlZmVyZW5jZSBoYXMgYmVlbiBjaGFuZ2VkIHNpbmNlIHRoZSBleHRlbnNpb24gd2FzIG9wZW5lZC5cIixcbiAgICAgICAgcHJpbWFyeUFjdGlvbjoge1xuICAgICAgICAgIHRpdGxlOiBcIkNsb3NlIEV4dGVuc2lvblwiLFxuICAgICAgICB9LFxuICAgICAgICBkaXNtaXNzQWN0aW9uOiB7XG4gICAgICAgICAgdGl0bGU6IFwiQ2xvc2UgUmF5Y2FzdFwiLCAvLyBPbmx5IGhlcmUgdG8gcHJvdmlkZSB0aGUgbmVjZXNzYXJ5IHNlY29uZCBvcHRpb25cbiAgICAgICAgICBzdHlsZTogQWxlcnQuQWN0aW9uU3R5bGUuQ2FuY2VsLFxuICAgICAgICB9LFxuICAgICAgfSkudGhlbigoY2xvc2VFeHRlbnNpb24pID0+IHtcbiAgICAgICAgaWYgKGNsb3NlRXh0ZW5zaW9uKSB7XG4gICAgICAgICAgdm9pZCBwb3BUb1Jvb3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2b2lkIGNsb3NlTWFpbldpbmRvdygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyB1c2VyTWVzc2FnZSwgc2VydmVyTWVzc2FnZSwgc2hvdWxkU2hvd1NlcnZlciB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCB1c2VWYXVsdE1lc3NhZ2VzO1xuIiwgImltcG9ydCB7IExvY2FsU3RvcmFnZSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IHVzZVByb21pc2UgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcblxudHlwZSBMb2NhbFN0b3JhZ2VJdGVtQWN0aW9ucyA9IHtcbiAgaXNMb2FkaW5nOiBib29sZWFuO1xuICBzZXQ6ICh2YWx1ZTogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+O1xuICByZW1vdmU6ICgpID0+IFByb21pc2U8dm9pZD47XG59O1xuXG4vKiogUmVhZCBhbmQgbWFuYWdlIGEgc2luZ2xlIGl0ZW0gaW4gTG9jYWxTdG9yYWdlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUxvY2FsU3RvcmFnZUl0ZW0oa2V5OiBzdHJpbmcpOiBbc3RyaW5nIHwgdW5kZWZpbmVkLCBMb2NhbFN0b3JhZ2VJdGVtQWN0aW9uc107XG5leHBvcnQgZnVuY3Rpb24gdXNlTG9jYWxTdG9yYWdlSXRlbShrZXk6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBzdHJpbmcpOiBbc3RyaW5nLCBMb2NhbFN0b3JhZ2VJdGVtQWN0aW9uc107XG5leHBvcnQgZnVuY3Rpb24gdXNlTG9jYWxTdG9yYWdlSXRlbShrZXk6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogc3RyaW5nKSB7XG4gIGNvbnN0IHsgZGF0YTogdmFsdWUsIHJldmFsaWRhdGUsIGlzTG9hZGluZyB9ID0gdXNlUHJvbWlzZSgoKSA9PiBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KGtleSkpO1xuXG4gIGNvbnN0IHNldCA9IGFzeW5jICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgYXdhaXQgTG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG4gICAgYXdhaXQgcmV2YWxpZGF0ZSgpO1xuICB9O1xuXG4gIGNvbnN0IHJlbW92ZSA9IGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCBMb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xuICAgIGF3YWl0IHJldmFsaWRhdGUoKTtcbiAgfTtcblxuICByZXR1cm4gW3ZhbHVlID8/IGRlZmF1bHRWYWx1ZSwgeyBpc0xvYWRpbmcsIHNldCwgcmVtb3ZlIH1dIGFzIGNvbnN0O1xufVxuIiwgImltcG9ydCB7IExpc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5cbmV4cG9ydCBjb25zdCBWYXVsdExvYWRpbmdGYWxsYmFjayA9ICgpID0+IDxMaXN0IHNlYXJjaEJhclBsYWNlaG9sZGVyPVwiU2VhcmNoIHZhdWx0XCIgaXNMb2FkaW5nIC8+O1xuIiwgImltcG9ydCB7IHVzZVJlZHVjZXIgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFNlc3Npb25TdGF0ZSB9IGZyb20gXCJ+L3R5cGVzL3Nlc3Npb25cIjtcblxuY29uc3QgaW5pdGlhbFN0YXRlOiBTZXNzaW9uU3RhdGUgPSB7XG4gIHRva2VuOiB1bmRlZmluZWQsXG4gIHBhc3N3b3JkSGFzaDogdW5kZWZpbmVkLFxuXG4gIGlzTG9hZGluZzogdHJ1ZSxcbiAgaXNMb2NrZWQ6IGZhbHNlLFxuICBpc0F1dGhlbnRpY2F0ZWQ6IGZhbHNlLFxufTtcblxudHlwZSBTZXNzaW9uUmVkdWNlckFjdGlvbnMgPVxuICB8ICh7IHR5cGU6IFwibG9hZFN0YXRlXCIgfSAmIFBhcnRpYWw8T21pdDxTZXNzaW9uU3RhdGUsIFwiaXNMb2FkaW5nXCIgfCBcImlzTG9ja2VkXCIgfCBcImlzQXV0aGVudGljYXRlZFwiPj4pXG4gIHwgeyB0eXBlOiBcImxvY2tcIiB9XG4gIHwgKHsgdHlwZTogXCJ1bmxvY2tcIiB9ICYgUGljazxTZXNzaW9uU3RhdGUsIFwidG9rZW5cIiB8IFwicGFzc3dvcmRIYXNoXCI+KVxuICB8IHsgdHlwZTogXCJsb2dvdXRcIiB9XG4gIHwgeyB0eXBlOiBcInZhdWx0VGltZW91dFwiIH1cbiAgfCB7IHR5cGU6IFwiZmluaXNoTG9hZGluZ1NhdmVkU3RhdGVcIiB9XG4gIHwgeyB0eXBlOiBcImZhaWxMb2FkaW5nU2F2ZWRTdGF0ZVwiIH07XG5cbmV4cG9ydCBjb25zdCB1c2VTZXNzaW9uUmVkdWNlciA9ICgpID0+IHtcbiAgcmV0dXJuIHVzZVJlZHVjZXIoKHN0YXRlOiBTZXNzaW9uU3RhdGUsIGFjdGlvbjogU2Vzc2lvblJlZHVjZXJBY3Rpb25zKTogU2Vzc2lvblN0YXRlID0+IHtcbiAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgICBjYXNlIFwibG9hZFN0YXRlXCI6IHtcbiAgICAgICAgY29uc3QgeyB0eXBlOiBfLCAuLi5hY3Rpb25QYXlsb2FkIH0gPSBhY3Rpb247XG4gICAgICAgIHJldHVybiB7IC4uLnN0YXRlLCAuLi5hY3Rpb25QYXlsb2FkIH07XG4gICAgICB9XG4gICAgICBjYXNlIFwibG9ja1wiOiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgdG9rZW46IHVuZGVmaW5lZCxcbiAgICAgICAgICBwYXNzd29yZEhhc2g6IHVuZGVmaW5lZCxcbiAgICAgICAgICBpc0xvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgIGlzTG9ja2VkOiB0cnVlLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgY2FzZSBcInVubG9ja1wiOiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgdG9rZW46IGFjdGlvbi50b2tlbixcbiAgICAgICAgICBwYXNzd29yZEhhc2g6IGFjdGlvbi5wYXNzd29yZEhhc2gsXG4gICAgICAgICAgaXNMb2NrZWQ6IGZhbHNlLFxuICAgICAgICAgIGlzQXV0aGVudGljYXRlZDogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGNhc2UgXCJsb2dvdXRcIjoge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgIHRva2VuOiB1bmRlZmluZWQsXG4gICAgICAgICAgcGFzc3dvcmRIYXNoOiB1bmRlZmluZWQsXG4gICAgICAgICAgaXNMb2NrZWQ6IHRydWUsXG4gICAgICAgICAgaXNBdXRoZW50aWNhdGVkOiBmYWxzZSxcbiAgICAgICAgICBpc0xvYWRpbmc6IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgY2FzZSBcInZhdWx0VGltZW91dFwiOiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgaXNMb2NrZWQ6IHRydWUsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBjYXNlIFwiZmluaXNoTG9hZGluZ1NhdmVkU3RhdGVcIjoge1xuICAgICAgICBpZiAoIXN0YXRlLnRva2VuIHx8ICFzdGF0ZS5wYXNzd29yZEhhc2gpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIHJlcXVpcmVkIGZpZWxkczogdG9rZW4sIHBhc3N3b3JkSGFzaFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGhhc1Rva2VuID0gISFzdGF0ZS50b2tlbjtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgICBpc0xvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgIGlzTG9ja2VkOiAhaGFzVG9rZW4sXG4gICAgICAgICAgaXNBdXRoZW50aWNhdGVkOiBoYXNUb2tlbixcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGNhc2UgXCJmYWlsTG9hZGluZ1NhdmVkU3RhdGVcIjoge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgIGlzTG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgaXNMb2NrZWQ6IHRydWUsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIGluaXRpYWxTdGF0ZSk7XG59O1xuIiwgImltcG9ydCB7IExvY2FsU3RvcmFnZSB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IExPQ0FMX1NUT1JBR0VfS0VZIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcbmltcG9ydCB7IGV4ZWMgYXMgY2FsbGJhY2tFeGVjLCBQcm9taXNlV2l0aENoaWxkIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uLCBkZWJ1Z0xvZyB9IGZyb20gXCJ+L3V0aWxzL2RldmVsb3BtZW50XCI7XG5cbmNvbnN0IGV4ZWMgPSBwcm9taXNpZnkoY2FsbGJhY2tFeGVjKTtcblxuZXhwb3J0IGNvbnN0IFNlc3Npb25TdG9yYWdlID0ge1xuICBnZXRTYXZlZFNlc3Npb246ICgpID0+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5TRVNTSU9OX1RPS0VOKSxcbiAgICAgIExvY2FsU3RvcmFnZS5nZXRJdGVtPHN0cmluZz4oTE9DQUxfU1RPUkFHRV9LRVkuUkVQUk9NUFRfSEFTSCksXG4gICAgICBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KExPQ0FMX1NUT1JBR0VfS0VZLkxBU1RfQUNUSVZJVFlfVElNRSksXG4gICAgICBMb2NhbFN0b3JhZ2UuZ2V0SXRlbTxzdHJpbmc+KExPQ0FMX1NUT1JBR0VfS0VZLlZBVUxUX0xBU1RfU1RBVFVTKSxcbiAgICBdKTtcbiAgfSxcbiAgY2xlYXJTZXNzaW9uOiBhc3luYyAoKSA9PiB7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuU0VTU0lPTl9UT0tFTiksXG4gICAgICBMb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShMT0NBTF9TVE9SQUdFX0tFWS5SRVBST01QVF9IQVNIKSxcbiAgICBdKTtcbiAgfSxcbiAgc2F2ZVNlc3Npb246IGFzeW5jICh0b2tlbjogc3RyaW5nLCBwYXNzd29yZEhhc2g6IHN0cmluZykgPT4ge1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIExvY2FsU3RvcmFnZS5zZXRJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlNFU1NJT05fVE9LRU4sIHRva2VuKSxcbiAgICAgIExvY2FsU3RvcmFnZS5zZXRJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlJFUFJPTVBUX0hBU0gsIHBhc3N3b3JkSGFzaCksXG4gICAgXSk7XG4gIH0sXG4gIGxvZ291dENsZWFyU2Vzc2lvbjogYXN5bmMgKCkgPT4ge1xuICAgIC8vIGNsZWFyIGV2ZXJ5dGhpbmcgcmVsYXRlZCB0byB0aGUgc2Vzc2lvblxuICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIExvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKExPQ0FMX1NUT1JBR0VfS0VZLlNFU1NJT05fVE9LRU4pLFxuICAgICAgTG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuUkVQUk9NUFRfSEFTSCksXG4gICAgICBMb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShMT0NBTF9TVE9SQUdFX0tFWS5MQVNUX0FDVElWSVRZX1RJTUUpLFxuICAgIF0pO1xuICB9LFxufTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrU3lzdGVtTG9ja2VkU2luY2VMYXN0QWNjZXNzID0gKGxhc3RBY3Rpdml0eVRpbWU6IERhdGUpID0+IHtcbiAgcmV0dXJuIGNoZWNrU3lzdGVtTG9nVGltZUFmdGVyKGxhc3RBY3Rpdml0eVRpbWUsICh0aW1lOiBudW1iZXIpID0+IGdldExhc3RTeXNsb2codGltZSwgXCJoYW5kbGVVbmxvY2tSZXN1bHRcIikpO1xufTtcbmV4cG9ydCBjb25zdCBjaGVja1N5c3RlbVNsZXB0U2luY2VMYXN0QWNjZXNzID0gKGxhc3RBY3Rpdml0eVRpbWU6IERhdGUpID0+IHtcbiAgcmV0dXJuIGNoZWNrU3lzdGVtTG9nVGltZUFmdGVyKGxhc3RBY3Rpdml0eVRpbWUsICh0aW1lOiBudW1iZXIpID0+IGdldExhc3RTeXNsb2codGltZSwgXCJzbGVlcCAwXCIpKTtcbn07XG5cbmZ1bmN0aW9uIGdldExhc3RTeXNsb2coaG91cnM6IG51bWJlciwgZmlsdGVyOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGV4ZWMoXG4gICAgYGxvZyBzaG93IC0tc3R5bGUgc3lzbG9nIC0tcHJlZGljYXRlIFwicHJvY2VzcyA9PSAnbG9naW53aW5kb3cnXCIgLS1pbmZvIC0tbGFzdCAke2hvdXJzfWggfCBncmVwIFwiJHtmaWx0ZXJ9XCIgfCB0YWlsIC1uIDFgXG4gICk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja1N5c3RlbUxvZ1RpbWVBZnRlcihcbiAgdGltZTogRGF0ZSxcbiAgZ2V0TG9nRW50cnk6ICh0aW1lU3BhbkhvdXJzOiBudW1iZXIpID0+IFByb21pc2VXaXRoQ2hpbGQ8eyBzdGRvdXQ6IHN0cmluZzsgc3RkZXJyOiBzdHJpbmcgfT5cbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBsYXN0U2NyZWVuTG9ja1RpbWUgPSBhd2FpdCBnZXRTeXN0ZW1Mb2dUaW1lKGdldExvZ0VudHJ5KTtcbiAgaWYgKCFsYXN0U2NyZWVuTG9ja1RpbWUpIHJldHVybiB0cnVlOyAvLyBhc3N1bWUgdGhhdCBsb2cgd2FzIGZvdW5kIGZvciBpbXByb3ZlZCBzYWZldHlcbiAgcmV0dXJuIG5ldyBEYXRlKGxhc3RTY3JlZW5Mb2NrVGltZSkuZ2V0VGltZSgpID4gdGltZS5nZXRUaW1lKCk7XG59XG5cbmNvbnN0IGdldFN5c3RlbUxvZ1RpbWVfSU5DUkVNRU5UX0hPVVJTID0gMjtcbmNvbnN0IGdldFN5c3RlbUxvZ1RpbWVfTUFYX1JFVFJJRVMgPSA1O1xuLyoqXG4gKiBTdGFydHMgYnkgY2hlY2tpbmcgdGhlIGxhc3QgaG91ciBhbmQgaW5jcmVhc2VzIHRoZSB0aW1lIHNwYW4gYnkge0BsaW5rIGdldFN5c3RlbUxvZ1RpbWVfSU5DUkVNRU5UX0hPVVJTfSBob3VycyBvbiBlYWNoIHJldHJ5LlxuICogXHUyNkEwXHVGRTBGIENhbGxzIHRvIHRoZSBzeXN0ZW0gbG9nIGFyZSB2ZXJ5IHNsb3csIGFuZCBpZiB0aGUgc2NyZWVuIGhhc24ndCBiZWVuIGxvY2tlZCBmb3Igc29tZSBob3VycywgaXQgZ2V0cyBzbG93ZXIuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldFN5c3RlbUxvZ1RpbWUoXG4gIGdldExvZ0VudHJ5OiAodGltZVNwYW5Ib3VyczogbnVtYmVyKSA9PiBQcm9taXNlV2l0aENoaWxkPHsgc3Rkb3V0OiBzdHJpbmc7IHN0ZGVycjogc3RyaW5nIH0+LFxuICB0aW1lU3BhbkhvdXJzID0gMSxcbiAgcmV0cnlBdHRlbXB0ID0gMFxuKTogUHJvbWlzZTxEYXRlIHwgdW5kZWZpbmVkPiB7XG4gIHRyeSB7XG4gICAgaWYgKHJldHJ5QXR0ZW1wdCA+IGdldFN5c3RlbUxvZ1RpbWVfTUFYX1JFVFJJRVMpIHtcbiAgICAgIGRlYnVnTG9nKFwiTWF4IHJldHJ5IGF0dGVtcHRzIHJlYWNoZWQgdG8gZ2V0IGxhc3Qgc2NyZWVuIGxvY2sgdGltZVwiKTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IHsgc3Rkb3V0LCBzdGRlcnIgfSA9IGF3YWl0IGdldExvZ0VudHJ5KHRpbWVTcGFuSG91cnMpO1xuICAgIGNvbnN0IFtsb2dEYXRlLCBsb2dUaW1lXSA9IHN0ZG91dD8uc3BsaXQoXCIgXCIpID8/IFtdO1xuICAgIGlmIChzdGRlcnIgfHwgIWxvZ0RhdGUgfHwgIWxvZ1RpbWUpIHtcbiAgICAgIHJldHVybiBnZXRTeXN0ZW1Mb2dUaW1lKGdldExvZ0VudHJ5LCB0aW1lU3BhbkhvdXJzICsgZ2V0U3lzdGVtTG9nVGltZV9JTkNSRU1FTlRfSE9VUlMsIHJldHJ5QXR0ZW1wdCArIDEpO1xuICAgIH1cblxuICAgIGNvbnN0IGxvZ0Z1bGxEYXRlID0gbmV3IERhdGUoYCR7bG9nRGF0ZX1UJHtsb2dUaW1lfWApO1xuICAgIGlmICghbG9nRnVsbERhdGUgfHwgbG9nRnVsbERhdGUudG9TdHJpbmcoKSA9PT0gXCJJbnZhbGlkIERhdGVcIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgIHJldHVybiBsb2dGdWxsRGF0ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGdldCBsYXN0IHNjcmVlbiBsb2NrIHRpbWVcIiwgZXJyb3IpO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBY3Rpb24sIENsaXBib2FyZCwgSWNvbiwgVG9hc3QsIGVudmlyb25tZW50LCBnZXRQcmVmZXJlbmNlVmFsdWVzLCBzaG93VG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIH0gZnJvbSBcIn4vdXRpbHMvZGV2ZWxvcG1lbnRcIjtcbmltcG9ydCB7IGV4ZWMgYXMgZXhlY1dpdGhDYWxsYmFja3MgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSBcInV0aWxcIjtcbmltcG9ydCB7IGNsaUluZm8gfSBmcm9tIFwifi9hcGkvYml0d2FyZGVuXCI7XG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IHBsYXRmb3JtIH0gZnJvbSBcIn4vdXRpbHMvcGxhdGZvcm1cIjtcblxuY29uc3QgZXhlYyA9IHByb21pc2lmeShleGVjV2l0aENhbGxiYWNrcyk7XG5jb25zdCB7IHN1cHBvcnRQYXRoIH0gPSBlbnZpcm9ubWVudDtcblxuLyoqIHN0cmlwIG91dCBhbnkgc2Vuc2l0aXZlIGRhdGEgZnJvbSBwcmVmZXJlbmNlcyAqL1xuY29uc3QgZ2V0U2FmZVByZWZlcmVuY2VzID0gKCkgPT4ge1xuICBjb25zdCB7XG4gICAgY2xpZW50SWQsXG4gICAgY2xpZW50U2VjcmV0LFxuICAgIGZldGNoRmF2aWNvbnMsXG4gICAgZ2VuZXJhdGVQYXNzd29yZFF1aWNrQWN0aW9uLFxuICAgIHJlcHJvbXB0SWdub3JlRHVyYXRpb24sXG4gICAgc2VydmVyQ2VydHNQYXRoLFxuICAgIHNlcnZlclVybCxcbiAgICBzaG91bGRDYWNoZVZhdWx0SXRlbXMsXG4gICAgdHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmQsXG4gICAgdHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmRRdWljayxcbiAgICB0cmFuc2llbnRDb3B5U2VhcmNoLFxuICAgIHdpbmRvd0FjdGlvbk9uQ29weSxcbiAgfSA9IGdldFByZWZlcmVuY2VWYWx1ZXM8QWxsUHJlZmVyZW5jZXM+KCk7XG5cbiAgcmV0dXJuIHtcbiAgICBoYXNfY2xpZW50SWQ6ICEhY2xpZW50SWQsXG4gICAgaGFzX2NsaWVudFNlY3JldDogISFjbGllbnRTZWNyZXQsXG4gICAgZmV0Y2hGYXZpY29ucyxcbiAgICBnZW5lcmF0ZVBhc3N3b3JkUXVpY2tBY3Rpb24sXG4gICAgcmVwcm9tcHRJZ25vcmVEdXJhdGlvbixcbiAgICBoYXNfc2VydmVyQ2VydHNQYXRoOiAhIXNlcnZlckNlcnRzUGF0aCxcbiAgICBoYXNfc2VydmVyVXJsOiAhIXNlcnZlclVybCxcbiAgICBzaG91bGRDYWNoZVZhdWx0SXRlbXMsXG4gICAgdHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmQsXG4gICAgdHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmRRdWljayxcbiAgICB0cmFuc2llbnRDb3B5U2VhcmNoLFxuICAgIHdpbmRvd0FjdGlvbk9uQ29weSxcbiAgfTtcbn07XG5cbmNvbnN0IE5BID0gXCJOL0FcIjtcbmNvbnN0IHRyeUV4ZWMgPSBhc3luYyAoY29tbWFuZDogc3RyaW5nLCB0cmltTGluZUJyZWFrcyA9IHRydWUpID0+IHtcbiAgdHJ5IHtcbiAgICBsZXQgY21kID0gY29tbWFuZDtcblxuICAgIGlmIChwbGF0Zm9ybSA9PT0gXCJ3aW5kb3dzXCIpIHtcbiAgICAgIGNtZCA9IGBwb3dlcnNoZWxsIC1Db21tYW5kIFwiJHtjb21tYW5kfVwiYDtcbiAgICB9IGVsc2Uge1xuICAgICAgY21kID0gYFBBVEg9XCIkUEFUSDoke2Rpcm5hbWUocHJvY2Vzcy5leGVjUGF0aCl9XCIgJHtjb21tYW5kfWA7XG4gICAgfVxuICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCBleGVjKGNtZCwgeyBlbnY6IHsgQklUV0FSREVOQ0xJX0FQUERBVEFfRElSOiBzdXBwb3J0UGF0aCB9IH0pO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gc3Rkb3V0LnRyaW0oKTtcbiAgICBpZiAodHJpbUxpbmVCcmVha3MpIHJldHVybiByZXNwb25zZS5yZXBsYWNlKC9cXG58XFxyL2csIFwiXCIpO1xuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjYXB0dXJlRXhjZXB0aW9uKGBGYWlsZWQgdG8gZXhlY3V0ZSBjb21tYW5kOiAke2NvbW1hbmR9YCwgZXJyb3IpO1xuICAgIHJldHVybiBOQTtcbiAgfVxufTtcblxuY29uc3QgZ2V0QndCaW5JbmZvID0gKCkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGNsaVBhdGhQcmVmID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcz4oKS5jbGlQYXRoO1xuICAgIGlmIChjbGlQYXRoUHJlZikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJjdXN0b21cIiwgcGF0aDogY2xpUGF0aFByZWYgfTtcbiAgICB9XG4gICAgaWYgKGNsaUluZm8ucGF0aC5iaW4gPT09IGNsaUluZm8ucGF0aC5kb3dubG9hZGVkQmluKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcImRvd25sb2FkZWRcIiwgcGF0aDogY2xpSW5mby5wYXRoLmRvd25sb2FkZWRCaW4gfTtcbiAgICB9XG4gICAgcmV0dXJuIHsgdHlwZTogXCJpbnN0YWxsZWRcIiwgcGF0aDogY2xpSW5mby5wYXRoLmluc3RhbGxlZEJpbiB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiB7IHR5cGU6IE5BLCBwYXRoOiBOQSB9O1xuICB9XG59O1xuXG5jb25zdCBnZXRIb21lYnJld0luZm8gPSBhc3luYyAoKSA9PiB7XG4gIHRyeSB7XG4gICAgbGV0IHBhdGggPSBcIi9vcHQvaG9tZWJyZXcvYmluL2JyZXdcIjtcbiAgICBpZiAoIWV4aXN0c1N5bmMocGF0aCkpIHBhdGggPSBcIi91c3IvbG9jYWwvYmluL2JyZXdcIjtcbiAgICBpZiAoIWV4aXN0c1N5bmMocGF0aCkpIHJldHVybiB7IGFyY2g6IE5BLCB2ZXJzaW9uOiBOQSB9O1xuXG4gICAgY29uc3QgY29uZmlnID0gYXdhaXQgdHJ5RXhlYyhgJHtwYXRofSBjb25maWdgLCBmYWxzZSk7XG4gICAgaWYgKGNvbmZpZyA9PT0gTkEpIHJldHVybiB7IGFyY2g6IE5BLCB2ZXJzaW9uOiBOQSB9O1xuXG4gICAgY29uc3QgYXJjaFZhbHVlID0gL0hPTUVCUkVXX1BSRUZJWDogKC4rKS8uZXhlYyhjb25maWcpPy5bMV0gfHwgTkE7XG4gICAgY29uc3QgdmVyc2lvbiA9IC9IT01FQlJFV19WRVJTSU9OOiAoLispLy5leGVjKGNvbmZpZyk/LlsxXSB8fCBOQTtcbiAgICBjb25zdCBhcmNoID0gYXJjaFZhbHVlICE9PSBOQSA/IChhcmNoVmFsdWUuaW5jbHVkZXMoXCIvb3B0L2hvbWVicmV3XCIpID8gXCJhcm02NFwiIDogXCJ4ODZfNjRcIikgOiBOQTtcblxuICAgIHJldHVybiB7IGFyY2gsIHZlcnNpb24gfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4geyBhcmNoOiBOQSwgdmVyc2lvbjogTkEgfTtcbiAgfVxufTtcblxuZnVuY3Rpb24gQnVnUmVwb3J0Q29sbGVjdERhdGFBY3Rpb24oKSB7XG4gIGNvbnN0IGNvbGxlY3REYXRhID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgc2hvd1RvYXN0KFRvYXN0LlN0eWxlLkFuaW1hdGVkLCBcIkNvbGxlY3RpbmcgZGF0YS4uLlwiKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcHJlZmVyZW5jZXMgPSBnZXRTYWZlUHJlZmVyZW5jZXMoKTtcbiAgICAgIGNvbnN0IGJ3SW5mbyA9IGdldEJ3QmluSW5mbygpO1xuICAgICAgY29uc3QgW3N5c3RlbUFyY2gsIG9zVmVyc2lvbiwgb3NCdWlsZFZlcnNpb24sIGJ3VmVyc2lvbl0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIC4uLihwbGF0Zm9ybSA9PT0gXCJtYWNvc1wiXG4gICAgICAgICAgPyBbdHJ5RXhlYyhcInVuYW1lIC1tXCIpLCB0cnlFeGVjKFwic3dfdmVycyAtcHJvZHVjdFZlcnNpb25cIiksIHRyeUV4ZWMoXCJzd192ZXJzIC1idWlsZFZlcnNpb25cIildXG4gICAgICAgICAgOiBbXG4gICAgICAgICAgICAgIHRyeUV4ZWMoXCIoR2V0LUNpbUluc3RhbmNlIFdpbjMyX09wZXJhdGluZ1N5c3RlbSkuT1NBcmNoaXRlY3R1cmVcIiksXG4gICAgICAgICAgICAgIHRyeUV4ZWMoXCIoR2V0LUNpbUluc3RhbmNlIFdpbjMyX09wZXJhdGluZ1N5c3RlbSkuQ2FwdGlvblwiKSxcbiAgICAgICAgICAgICAgdHJ5RXhlYyhcIihHZXQtQ2ltSW5zdGFuY2UgV2luMzJfT3BlcmF0aW5nU3lzdGVtKS5WZXJzaW9uXCIpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgIHRyeUV4ZWMoYCR7YndJbmZvLnBhdGh9IC0tdmVyc2lvbmApLFxuICAgICAgXSk7XG5cbiAgICAgIGNvbnN0IGRhdGE6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7XG4gICAgICAgIHJheWNhc3Q6IHtcbiAgICAgICAgICB2ZXJzaW9uOiBlbnZpcm9ubWVudC5yYXljYXN0VmVyc2lvbixcbiAgICAgICAgfSxcbiAgICAgICAgc3lzdGVtOiB7XG4gICAgICAgICAgYXJjaDogc3lzdGVtQXJjaCxcbiAgICAgICAgICB2ZXJzaW9uOiBvc1ZlcnNpb24sXG4gICAgICAgICAgYnVpbGRWZXJzaW9uOiBvc0J1aWxkVmVyc2lvbixcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZToge1xuICAgICAgICAgIGFyY2g6IHByb2Nlc3MuYXJjaCxcbiAgICAgICAgICB2ZXJzaW9uOiBwcm9jZXNzLnZlcnNpb24sXG4gICAgICAgIH0sXG4gICAgICAgIGNsaToge1xuICAgICAgICAgIHR5cGU6IGJ3SW5mby50eXBlLFxuICAgICAgICAgIHZlcnNpb246IGJ3VmVyc2lvbixcbiAgICAgICAgfSxcbiAgICAgICAgcHJlZmVyZW5jZXMsXG4gICAgICB9O1xuXG4gICAgICBpZiAocGxhdGZvcm0gPT09IFwibWFjb3NcIikge1xuICAgICAgICBjb25zdCBicmV3SW5mbyA9IGF3YWl0IGdldEhvbWVicmV3SW5mbygpO1xuICAgICAgICBkYXRhLmhvbWVicmV3ID0ge1xuICAgICAgICAgIGFyY2g6IGJyZXdJbmZvLmFyY2gsXG4gICAgICAgICAgdmVyc2lvbjogYnJld0luZm8udmVyc2lvbixcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgQ2xpcGJvYXJkLmNvcHkoSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xuICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5TdWNjZXNzO1xuICAgICAgdG9hc3QudGl0bGUgPSBcIkRhdGEgY29waWVkIHRvIGNsaXBib2FyZFwiO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLkZhaWx1cmU7XG4gICAgICB0b2FzdC50aXRsZSA9IFwiRmFpbGVkIHRvIGNvbGxlY3QgYnVnIHJlcG9ydCBkYXRhXCI7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNvbGxlY3QgYnVnIHJlcG9ydCBkYXRhXCIsIGVycm9yKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIDxBY3Rpb24gdGl0bGU9XCJDb2xsZWN0IEJ1ZyBSZXBvcnQgRGF0YVwiIGljb249e0ljb24uQnVnfSBvbkFjdGlvbj17Y29sbGVjdERhdGF9IC8+O1xufVxuXG5leHBvcnQgZGVmYXVsdCBCdWdSZXBvcnRDb2xsZWN0RGF0YUFjdGlvbjtcbiIsICJpbXBvcnQgeyBBY3Rpb24sIEFsZXJ0LCBDbGlwYm9hcmQsIEljb24sIFRvYXN0LCBjb25maXJtQWxlcnQsIHNob3dUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IGNhcHR1cmVkRXhjZXB0aW9ucyB9IGZyb20gXCJ+L3V0aWxzL2RldmVsb3BtZW50XCI7XG5cbmZ1bmN0aW9uIENvcHlSdW50aW1lRXJyb3JMb2coKSB7XG4gIGNvbnN0IGNvcHlFcnJvcnMgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgZXJyb3JTdHJpbmcgPSBjYXB0dXJlZEV4Y2VwdGlvbnMudG9TdHJpbmcoKTtcbiAgICBpZiAoZXJyb3JTdHJpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gc2hvd1RvYXN0KFRvYXN0LlN0eWxlLlN1Y2Nlc3MsIFwiTm8gZXJyb3JzIHRvIGNvcHlcIik7XG4gICAgfVxuICAgIGF3YWl0IENsaXBib2FyZC5jb3B5KGVycm9yU3RyaW5nKTtcbiAgICBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuU3VjY2VzcywgXCJFcnJvcnMgY29waWVkIHRvIGNsaXBib2FyZFwiKTtcbiAgICBhd2FpdCBjb25maXJtQWxlcnQoe1xuICAgICAgdGl0bGU6IFwiQmUgY2FyZWZ1bCB3aXRoIHRoaXMgaW5mb3JtYXRpb25cIixcbiAgICAgIG1lc3NhZ2U6XG4gICAgICAgIFwiUGxlYXNlIGJlIG1pbmRmdWwgb2Ygd2hlcmUgeW91IHNoYXJlIHRoaXMgZXJyb3IgbG9nLCBhcyBpdCBtYXkgY29udGFpbiBzZW5zaXRpdmUgaW5mb3JtYXRpb24uIEFsd2F5cyBhbmFseXplIGl0IGJlZm9yZSBzaGFyaW5nLlwiLFxuICAgICAgcHJpbWFyeUFjdGlvbjogeyB0aXRsZTogXCJHb3QgaXRcIiwgc3R5bGU6IEFsZXJ0LkFjdGlvblN0eWxlLkRlZmF1bHQgfSxcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxBY3Rpb24gb25BY3Rpb249e2NvcHlFcnJvcnN9IHRpdGxlPVwiQ29weSBMYXN0IEVycm9yc1wiIGljb249e0ljb24uQ29weUNsaXBib2FyZH0gc3R5bGU9e0FjdGlvbi5TdHlsZS5SZWd1bGFyfSAvPlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBDb3B5UnVudGltZUVycm9yTG9nO1xuIiwgImltcG9ydCB7IEFjdGlvblBhbmVsIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgQnVnUmVwb3J0Q29sbGVjdERhdGFBY3Rpb24sIEJ1Z1JlcG9ydE9wZW5BY3Rpb24sIENvcHlSdW50aW1lRXJyb3JMb2cgfSBmcm9tIFwifi9jb21wb25lbnRzL2FjdGlvbnNcIjtcbmltcG9ydCB7IHVzZUNsaVZlcnNpb24gfSBmcm9tIFwifi91dGlscy9ob29rcy91c2VDbGlWZXJzaW9uXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWJ1Z2dpbmdCdWdSZXBvcnRpbmdBY3Rpb25TZWN0aW9uKCkge1xuICBjb25zdCBjbGlWZXJzaW9uID0gdXNlQ2xpVmVyc2lvbigpO1xuXG4gIHJldHVybiAoXG4gICAgPEFjdGlvblBhbmVsLlNlY3Rpb24gdGl0bGU9e2BEZWJ1Z2dpbmcgJiBCdWcgUmVwb3J0aW5nIChDTEkgdiR7Y2xpVmVyc2lvbn0pYH0+XG4gICAgICA8Q29weVJ1bnRpbWVFcnJvckxvZyAvPlxuICAgICAgPEJ1Z1JlcG9ydE9wZW5BY3Rpb24gLz5cbiAgICAgIDxCdWdSZXBvcnRDb2xsZWN0RGF0YUFjdGlvbiAvPlxuICAgIDwvQWN0aW9uUGFuZWwuU2VjdGlvbj5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQ0FDSEVfS0VZUyB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBDYWNoZSB9IGZyb20gXCJ+L3V0aWxzL2NhY2hlXCI7XG5pbXBvcnQgdXNlT25jZUVmZmVjdCBmcm9tIFwifi91dGlscy9ob29rcy91c2VPbmNlRWZmZWN0XCI7XG5cbmNvbnN0IGdldENsaVZlcnNpb24gPSAoKSA9PiB7XG4gIGNvbnN0IHZlcnNpb24gPSBDYWNoZS5nZXQoQ0FDSEVfS0VZUy5DTElfVkVSU0lPTik7XG4gIGlmICh2ZXJzaW9uKSByZXR1cm4gcGFyc2VGbG9hdCh2ZXJzaW9uKTtcbiAgcmV0dXJuIC0xO1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZUNsaVZlcnNpb24gPSAoKSA9PiB7XG4gIGNvbnN0IFt2ZXJzaW9uLCBzZXRWZXJzaW9uXSA9IHVzZVN0YXRlPG51bWJlcj4oZ2V0Q2xpVmVyc2lvbik7XG5cbiAgdXNlT25jZUVmZmVjdCgoKSA9PiB7XG4gICAgQ2FjaGUuc3Vic2NyaWJlKChrZXksIHZhbHVlKSA9PiB7XG4gICAgICBpZiAodmFsdWUgJiYga2V5ID09PSBDQUNIRV9LRVlTLkNMSV9WRVJTSU9OKSB7XG4gICAgICAgIHNldFZlcnNpb24ocGFyc2VGbG9hdCh2YWx1ZSkgfHwgLTEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gdmVyc2lvbjtcbn07XG4iLCAiaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25QYW5lbCwgQ29sb3IsIEljb24sIHNob3dUb2FzdCwgVG9hc3QgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBWQVVMVF9MT0NLX01FU1NBR0VTIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcbmltcG9ydCB7IHVzZUJpdHdhcmRlbiB9IGZyb20gXCJ+L2NvbnRleHQvYml0d2FyZGVuXCI7XG5pbXBvcnQgeyB1c2VWYXVsdENvbnRleHQgfSBmcm9tIFwifi9jb250ZXh0L3ZhdWx0XCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBWYXVsdEFjdGlvbnNTZWN0aW9uKCkge1xuICBjb25zdCB2YXVsdCA9IHVzZVZhdWx0Q29udGV4dCgpO1xuICBjb25zdCBiaXR3YXJkZW4gPSB1c2VCaXR3YXJkZW4oKTtcblxuICBjb25zdCBoYW5kbGVMb2NrVmF1bHQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgdG9hc3QgPSBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuQW5pbWF0ZWQsIFwiTG9ja2luZyBWYXVsdC4uLlwiLCBcIlBsZWFzZSB3YWl0XCIpO1xuICAgIGF3YWl0IGJpdHdhcmRlbi5sb2NrKHsgcmVhc29uOiBWQVVMVF9MT0NLX01FU1NBR0VTLk1BTlVBTCB9KTtcbiAgICBhd2FpdCB0b2FzdC5oaWRlKCk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlTG9nb3V0VmF1bHQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgdG9hc3QgPSBhd2FpdCBzaG93VG9hc3QoeyB0aXRsZTogXCJMb2dnaW5nIE91dC4uLlwiLCBzdHlsZTogVG9hc3QuU3R5bGUuQW5pbWF0ZWQgfSk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGJpdHdhcmRlbi5sb2dvdXQoKTtcbiAgICAgIGF3YWl0IHRvYXN0LmhpZGUoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdG9hc3QudGl0bGUgPSBcIkZhaWxlZCB0byBsb2dvdXRcIjtcbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuRmFpbHVyZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8QWN0aW9uUGFuZWwuU2VjdGlvbiB0aXRsZT1cIlZhdWx0IEFjdGlvbnNcIj5cbiAgICAgIDxBY3Rpb25cbiAgICAgICAgdGl0bGU9XCJTeW5jIFZhdWx0XCJcbiAgICAgICAgc2hvcnRjdXQ9e3sgbWFjT1M6IHsga2V5OiBcInJcIiwgbW9kaWZpZXJzOiBbXCJvcHRcIl0gfSwgd2luZG93czogeyBrZXk6IFwiclwiLCBtb2RpZmllcnM6IFtcImFsdFwiXSB9IH19XG4gICAgICAgIGljb249e0ljb24uQXJyb3dDbG9ja3dpc2V9XG4gICAgICAgIG9uQWN0aW9uPXt2YXVsdC5zeW5jSXRlbXN9XG4gICAgICAvPlxuICAgICAgPEFjdGlvblxuICAgICAgICBpY29uPXt7IHNvdXJjZTogXCJzZl9zeW1ib2xzX2xvY2suc3ZnXCIsIHRpbnRDb2xvcjogQ29sb3IuUHJpbWFyeVRleHQgfX0gLy8gRG9lcyBub3QgaW1tZWRpYXRlbHkgZm9sbG93IHRoZW1lXG4gICAgICAgIHRpdGxlPVwiTG9jayBWYXVsdFwiXG4gICAgICAgIHNob3J0Y3V0PXt7XG4gICAgICAgICAgbWFjT1M6IHsga2V5OiBcImxcIiwgbW9kaWZpZXJzOiBbXCJvcHRcIiwgXCJzaGlmdFwiXSB9LFxuICAgICAgICAgIHdpbmRvd3M6IHsga2V5OiBcImxcIiwgbW9kaWZpZXJzOiBbXCJhbHRcIiwgXCJzaGlmdFwiXSB9LFxuICAgICAgICB9fVxuICAgICAgICBvbkFjdGlvbj17aGFuZGxlTG9ja1ZhdWx0fVxuICAgICAgLz5cbiAgICAgIDxBY3Rpb24gc3R5bGU9e0FjdGlvbi5TdHlsZS5EZXN0cnVjdGl2ZX0gdGl0bGU9XCJMb2dvdXRcIiBpY29uPXtJY29uLkxvZ291dH0gb25BY3Rpb249e2hhbmRsZUxvZ291dFZhdWx0fSAvPlxuICAgIDwvQWN0aW9uUGFuZWwuU2VjdGlvbj5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyBnZXRQcmVmZXJlbmNlVmFsdWVzLCBzaG93VG9hc3QsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgY3JlYXRlQ29udGV4dCwgUmVhY3ROb2RlLCB1c2VDb250ZXh0LCB1c2VNZW1vLCB1c2VSZWR1Y2VyIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VWYXVsdEl0ZW1QdWJsaXNoZXIgfSBmcm9tIFwifi9jb21wb25lbnRzL3NlYXJjaFZhdWx0L2NvbnRleHQvdmF1bHRMaXN0ZW5lcnNcIjtcbmltcG9ydCB7IHVzZUJpdHdhcmRlbiB9IGZyb20gXCJ+L2NvbnRleHQvYml0d2FyZGVuXCI7XG5pbXBvcnQgeyB1c2VTZXNzaW9uIH0gZnJvbSBcIn4vY29udGV4dC9zZXNzaW9uXCI7XG5pbXBvcnQgeyBGb2xkZXIsIEl0ZW0sIFZhdWx0IH0gZnJvbSBcIn4vdHlwZXMvdmF1bHRcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuaW1wb3J0IHVzZVZhdWx0Q2FjaGluZyBmcm9tIFwifi9jb21wb25lbnRzL3NlYXJjaFZhdWx0L3V0aWxzL3VzZVZhdWx0Q2FjaGluZ1wiO1xuaW1wb3J0IHsgRmFpbGVkVG9Mb2FkVmF1bHRJdGVtc0Vycm9yLCBnZXREaXNwbGF5YWJsZUVycm9yTWVzc2FnZSB9IGZyb20gXCJ+L3V0aWxzL2Vycm9yc1wiO1xuaW1wb3J0IHVzZU9uY2VFZmZlY3QgZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlT25jZUVmZmVjdFwiO1xuaW1wb3J0IHsgdXNlQ2FjaGVkU3RhdGUgfSBmcm9tIFwiQHJheWNhc3QvdXRpbHNcIjtcbmltcG9ydCB7IENBQ0hFX0tFWVMsIEZPTERFUl9PUFRJT05TIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcblxuZXhwb3J0IHR5cGUgVmF1bHRTdGF0ZSA9IFZhdWx0ICYge1xuICBpc0xvYWRpbmc6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBWYXVsdENvbnRleHRUeXBlID0gVmF1bHRTdGF0ZSAmIHtcbiAgaXNFbXB0eTogYm9vbGVhbjtcbiAgc3luY0l0ZW1zOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBsb2FkSXRlbXM6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIGN1cnJlbnRGb2xkZXJJZDogTnVsbGFibGU8c3RyaW5nPjtcbiAgc2V0Q3VycmVudEZvbGRlcjogKGZvbGRlck9ySWQ6IE51bGxhYmxlPHN0cmluZyB8IEZvbGRlcj4pID0+IHZvaWQ7XG4gIHVwZGF0ZVN0YXRlOiAobmV4dDogUmVhY3QuU2V0U3RhdGVBY3Rpb248VmF1bHRTdGF0ZT4pID0+IHZvaWQ7XG59O1xuXG5jb25zdCBWYXVsdENvbnRleHQgPSBjcmVhdGVDb250ZXh0PFZhdWx0Q29udGV4dFR5cGUgfCBudWxsPihudWxsKTtcblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCk6IFZhdWx0U3RhdGUge1xuICByZXR1cm4geyBpdGVtczogW10sIGZvbGRlcnM6IFtdLCBpc0xvYWRpbmc6IHRydWUgfTtcbn1cblxuZXhwb3J0IHR5cGUgVmF1bHRQcm92aWRlclByb3BzID0ge1xuICBjaGlsZHJlbjogUmVhY3ROb2RlO1xufTtcblxuY29uc3QgeyBzeW5jT25MYXVuY2ggfSA9IGdldFByZWZlcmVuY2VWYWx1ZXM8QWxsUHJlZmVyZW5jZXM+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBWYXVsdFByb3ZpZGVyKHByb3BzOiBWYXVsdFByb3ZpZGVyUHJvcHMpIHtcbiAgY29uc3QgeyBjaGlsZHJlbiB9ID0gcHJvcHM7XG5cbiAgY29uc3Qgc2Vzc2lvbiA9IHVzZVNlc3Npb24oKTtcbiAgY29uc3QgYml0d2FyZGVuID0gdXNlQml0d2FyZGVuKCk7XG4gIGNvbnN0IHB1Ymxpc2hJdGVtcyA9IHVzZVZhdWx0SXRlbVB1Ymxpc2hlcigpO1xuICBjb25zdCB7IGdldENhY2hlZFZhdWx0LCBjYWNoZVZhdWx0IH0gPSB1c2VWYXVsdENhY2hpbmcoKTtcblxuICBjb25zdCBbY3VycmVudEZvbGRlcklkLCBzZXRDdXJyZW50Rm9sZGVySWRdID0gdXNlQ2FjaGVkU3RhdGU8TnVsbGFibGU8c3RyaW5nPj4oQ0FDSEVfS0VZUy5DVVJSRU5UX0ZPTERFUl9JRCwgbnVsbCk7XG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlUmVkdWNlcihcbiAgICAocHJldmlvdXM6IFZhdWx0U3RhdGUsIG5leHQ6IFBhcnRpYWw8VmF1bHRTdGF0ZT4pID0+ICh7IC4uLnByZXZpb3VzLCAuLi5uZXh0IH0pLFxuICAgIHsgLi4uZ2V0SW5pdGlhbFN0YXRlKCksIC4uLmdldENhY2hlZFZhdWx0KCkgfVxuICApO1xuXG4gIHVzZU9uY2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzeW5jT25MYXVuY2gpIHtcbiAgICAgIHZvaWQgc3luY0l0ZW1zKHsgaXNJbml0aWFsOiB0cnVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2b2lkIGxvYWRJdGVtcygpO1xuICAgIH1cbiAgfSwgc2Vzc2lvbi5hY3RpdmUgJiYgc2Vzc2lvbi50b2tlbik7XG5cbiAgYXN5bmMgZnVuY3Rpb24gbG9hZEl0ZW1zKCkge1xuICAgIHRyeSB7XG4gICAgICBzZXRTdGF0ZSh7IGlzTG9hZGluZzogdHJ1ZSB9KTtcblxuICAgICAgbGV0IGl0ZW1zOiBJdGVtW10gPSBbXTtcbiAgICAgIGxldCBmb2xkZXJzOiBGb2xkZXJbXSA9IFtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgW2l0ZW1zUmVzdWx0LCBmb2xkZXJzUmVzdWx0XSA9IGF3YWl0IFByb21pc2UuYWxsKFtiaXR3YXJkZW4ubGlzdEl0ZW1zKCksIGJpdHdhcmRlbi5saXN0Rm9sZGVycygpXSk7XG4gICAgICAgIGlmIChpdGVtc1Jlc3VsdC5lcnJvcikgdGhyb3cgaXRlbXNSZXN1bHQuZXJyb3I7XG4gICAgICAgIGlmIChmb2xkZXJzUmVzdWx0LmVycm9yKSB0aHJvdyBmb2xkZXJzUmVzdWx0LmVycm9yO1xuICAgICAgICBpdGVtcyA9IGl0ZW1zUmVzdWx0LnJlc3VsdDtcbiAgICAgICAgZm9sZGVycyA9IGZvbGRlcnNSZXN1bHQucmVzdWx0O1xuICAgICAgICBpdGVtcy5zb3J0KGZhdm9yaXRlSXRlbXNGaXJzdFNvcnRlcik7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBwdWJsaXNoSXRlbXMobmV3IEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvcigpKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG5cbiAgICAgIHNldFN0YXRlKHsgaXRlbXMsIGZvbGRlcnMgfSk7XG4gICAgICBwdWJsaXNoSXRlbXMoaXRlbXMpO1xuICAgICAgY2FjaGVWYXVsdChpdGVtcywgZm9sZGVycyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF3YWl0IHNob3dUb2FzdChUb2FzdC5TdHlsZS5GYWlsdXJlLCBcIkZhaWxlZCB0byBsb2FkIHZhdWx0IGl0ZW1zXCIsIGdldERpc3BsYXlhYmxlRXJyb3JNZXNzYWdlKGVycm9yKSk7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGxvYWQgdmF1bHQgaXRlbXNcIiwgZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRTdGF0ZSh7IGlzTG9hZGluZzogZmFsc2UgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gc3luY0l0ZW1zKHByb3BzPzogeyBpc0luaXRpYWw/OiBib29sZWFuIH0pIHtcbiAgICBjb25zdCB7IGlzSW5pdGlhbCA9IGZhbHNlIH0gPSBwcm9wcyA/PyB7fTtcblxuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgc2hvd1RvYXN0KHtcbiAgICAgIHRpdGxlOiBcIlN5bmNpbmcgVmF1bHQuLi5cIixcbiAgICAgIG1lc3NhZ2U6IGlzSW5pdGlhbCA/IFwiQmFja2dyb3VuZCBUYXNrXCIgOiB1bmRlZmluZWQsXG4gICAgICBzdHlsZTogVG9hc3QuU3R5bGUuQW5pbWF0ZWQsXG4gICAgfSk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGJpdHdhcmRlbi5zeW5jKCk7XG4gICAgICBhd2FpdCBsb2FkSXRlbXMoKTtcbiAgICAgIGF3YWl0IHRvYXN0LmhpZGUoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYXdhaXQgYml0d2FyZGVuLmxvZ291dCgpO1xuICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5GYWlsdXJlO1xuICAgICAgdG9hc3QudGl0bGUgPSBcIkZhaWxlZCB0byBzeW5jIHZhdWx0XCI7XG4gICAgICB0b2FzdC5tZXNzYWdlID0gZ2V0RGlzcGxheWFibGVFcnJvck1lc3NhZ2UoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldEN1cnJlbnRGb2xkZXIoZm9sZGVyT3JJZDogTnVsbGFibGU8c3RyaW5nIHwgRm9sZGVyPikge1xuICAgIHNldEN1cnJlbnRGb2xkZXJJZCh0eXBlb2YgZm9sZGVyT3JJZCA9PT0gXCJzdHJpbmdcIiA/IGZvbGRlck9ySWQgOiBmb2xkZXJPcklkPy5pZCk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVTdGF0ZShuZXh0OiBSZWFjdC5TZXRTdGF0ZUFjdGlvbjxWYXVsdFN0YXRlPikge1xuICAgIGNvbnN0IG5ld1N0YXRlID0gdHlwZW9mIG5leHQgPT09IFwiZnVuY3Rpb25cIiA/IG5leHQoc3RhdGUpIDogbmV4dDtcbiAgICBzZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgY2FjaGVWYXVsdChuZXdTdGF0ZS5pdGVtcywgbmV3U3RhdGUuZm9sZGVycyk7XG4gIH1cblxuICBjb25zdCBtZW1vaXplZFZhbHVlOiBWYXVsdENvbnRleHRUeXBlID0gdXNlTWVtbyhcbiAgICAoKSA9PiAoe1xuICAgICAgLi4uc3RhdGUsXG4gICAgICBpdGVtczogZmlsdGVySXRlbXNCeUZvbGRlcklkKHN0YXRlLml0ZW1zLCBjdXJyZW50Rm9sZGVySWQpLFxuICAgICAgaXNFbXB0eTogc3RhdGUuaXRlbXMubGVuZ3RoID09IDAsXG4gICAgICBpc0xvYWRpbmc6IHN0YXRlLmlzTG9hZGluZyB8fCBzZXNzaW9uLmlzTG9hZGluZyxcbiAgICAgIGN1cnJlbnRGb2xkZXJJZCxcbiAgICAgIHN5bmNJdGVtcyxcbiAgICAgIGxvYWRJdGVtcyxcbiAgICAgIHNldEN1cnJlbnRGb2xkZXIsXG4gICAgICB1cGRhdGVTdGF0ZSxcbiAgICB9KSxcbiAgICBbc3RhdGUsIHNlc3Npb24uaXNMb2FkaW5nLCBjdXJyZW50Rm9sZGVySWQsIHN5bmNJdGVtcywgbG9hZEl0ZW1zLCBzZXRDdXJyZW50Rm9sZGVyLCB1cGRhdGVTdGF0ZV1cbiAgKTtcblxuICByZXR1cm4gPFZhdWx0Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17bWVtb2l6ZWRWYWx1ZX0+e2NoaWxkcmVufTwvVmF1bHRDb250ZXh0LlByb3ZpZGVyPjtcbn1cblxuZnVuY3Rpb24gZmlsdGVySXRlbXNCeUZvbGRlcklkKGl0ZW1zOiBJdGVtW10sIGZvbGRlcklkOiBOdWxsYWJsZTxzdHJpbmc+KSB7XG4gIGlmICghZm9sZGVySWQgfHwgZm9sZGVySWQgPT09IEZPTERFUl9PUFRJT05TLkFMTCkgcmV0dXJuIGl0ZW1zO1xuICBpZiAoZm9sZGVySWQgPT09IEZPTERFUl9PUFRJT05TLk5PX0ZPTERFUikgcmV0dXJuIGl0ZW1zLmZpbHRlcigoaXRlbSkgPT4gaXRlbS5mb2xkZXJJZCA9PT0gbnVsbCk7XG4gIHJldHVybiBpdGVtcy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZm9sZGVySWQgPT09IGZvbGRlcklkKTtcbn1cblxuZnVuY3Rpb24gZmF2b3JpdGVJdGVtc0ZpcnN0U29ydGVyKGE6IEl0ZW0sIGI6IEl0ZW0pIHtcbiAgaWYgKGEuZmF2b3JpdGUgJiYgYi5mYXZvcml0ZSkgcmV0dXJuIDA7XG4gIHJldHVybiBhLmZhdm9yaXRlID8gLTEgOiAxO1xufVxuXG5leHBvcnQgY29uc3QgdXNlVmF1bHRDb250ZXh0ID0gKCkgPT4ge1xuICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChWYXVsdENvbnRleHQpO1xuICBpZiAoY29udGV4dCA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwidXNlVmF1bHQgbXVzdCBiZSB1c2VkIHdpdGhpbiBhIFZhdWx0UHJvdmlkZXJcIik7XG4gIH1cblxuICByZXR1cm4gY29udGV4dDtcbn07XG4iLCAiaW1wb3J0IHsgY3JlYXRlQ29udGV4dCwgTXV0YWJsZVJlZk9iamVjdCwgUmVhY3ROb2RlLCB1c2VDb250ZXh0LCB1c2VNZW1vLCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEl0ZW0gfSBmcm9tIFwifi90eXBlcy92YXVsdFwiO1xuaW1wb3J0IHsgRmFpbGVkVG9Mb2FkVmF1bHRJdGVtc0Vycm9yIH0gZnJvbSBcIn4vdXRpbHMvZXJyb3JzXCI7XG5cbmV4cG9ydCB0eXBlIEl0ZW1MaXN0ZW5lciA9IChpdGVtOiBJdGVtIHwgRmFpbGVkVG9Mb2FkVmF1bHRJdGVtc0Vycm9yKSA9PiB2b2lkO1xuXG5leHBvcnQgdHlwZSBWYXVsdExpc3RlbmVyc0NvbnRleHRUeXBlID0ge1xuICBsaXN0ZW5lcnM6IE11dGFibGVSZWZPYmplY3Q8TWFwPHN0cmluZywgSXRlbUxpc3RlbmVyPj47XG4gIHN1YnNjcmliZUl0ZW06IChpdGVtSWQ6IHN0cmluZywgbGlzdGVuZXI6IEl0ZW1MaXN0ZW5lcikgPT4gKCkgPT4gdm9pZDtcbiAgcHVibGlzaEl0ZW1zOiAoaXRlbXM6IEl0ZW1bXSB8IEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvcikgPT4gdm9pZDtcbn07XG5cbmNvbnN0IFZhdWx0TGlzdGVuZXJzQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8VmF1bHRMaXN0ZW5lcnNDb250ZXh0VHlwZSB8IG51bGw+KG51bGwpO1xuXG5jb25zdCBWYXVsdExpc3RlbmVyc1Byb3ZpZGVyID0gKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pID0+IHtcbiAgY29uc3QgbGlzdGVuZXJzID0gdXNlUmVmKG5ldyBNYXA8c3RyaW5nLCBJdGVtTGlzdGVuZXI+KCkpO1xuXG4gIGNvbnN0IHB1Ymxpc2hJdGVtcyA9IChpdGVtc09yRXJyb3I6IEl0ZW1bXSB8IEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvcikgPT4ge1xuICAgIGlmIChpdGVtc09yRXJyb3IgaW5zdGFuY2VvZiBGYWlsZWRUb0xvYWRWYXVsdEl0ZW1zRXJyb3IpIHtcbiAgICAgIGxpc3RlbmVycy5jdXJyZW50LmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcihpdGVtc09yRXJyb3IpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdGVuZXJzLmN1cnJlbnQuZm9yRWFjaCgobGlzdGVuZXIsIGl0ZW1JZCkgPT4ge1xuICAgICAgICBjb25zdCBpdGVtID0gaXRlbXNPckVycm9yLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGl0ZW1JZCk7XG4gICAgICAgIGlmIChpdGVtKSBsaXN0ZW5lcihpdGVtKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBzdWJzY3JpYmVJdGVtID0gKGl0ZW1JZDogc3RyaW5nLCBsaXN0ZW5lcjogSXRlbUxpc3RlbmVyKSA9PiB7XG4gICAgbGlzdGVuZXJzLmN1cnJlbnQuc2V0KGl0ZW1JZCwgbGlzdGVuZXIpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBsaXN0ZW5lcnMuY3VycmVudC5kZWxldGUoaXRlbUlkKTtcbiAgICB9O1xuICB9O1xuXG4gIGNvbnN0IG1lbW9pemVkVmFsdWUgPSB1c2VNZW1vKCgpID0+ICh7IGxpc3RlbmVycywgcHVibGlzaEl0ZW1zLCBzdWJzY3JpYmVJdGVtIH0pLCBbXSk7XG5cbiAgcmV0dXJuIDxWYXVsdExpc3RlbmVyc0NvbnRleHQuUHJvdmlkZXIgdmFsdWU9e21lbW9pemVkVmFsdWV9PntjaGlsZHJlbn08L1ZhdWx0TGlzdGVuZXJzQ29udGV4dC5Qcm92aWRlcj47XG59O1xuXG5leHBvcnQgY29uc3QgdXNlVmF1bHRJdGVtUHVibGlzaGVyID0gKCkgPT4ge1xuICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChWYXVsdExpc3RlbmVyc0NvbnRleHQpO1xuICBpZiAoY29udGV4dCA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJ1c2VWYXVsdEl0ZW1QdWJsaXNoZXIgbXVzdCBiZSB1c2VkIHdpdGhpbiBhIFZhdWx0TGlzdGVuZXJzUHJvdmlkZXJcIik7XG5cbiAgcmV0dXJuIGNvbnRleHQucHVibGlzaEl0ZW1zO1xufTtcblxuLyoqIEFsbG93cyB5b3UgdG8gc3Vic2NyaWJlIHRvIGEgc3BlY2lmaWMgaXRlbSBhbmQgZ2V0IG5vdGlmaWVkIHdoZW4gaXQgY2hhbmdlcy4gKi9cbmV4cG9ydCBjb25zdCB1c2VWYXVsdEl0ZW1TdWJzY3JpYmVyID0gKCkgPT4ge1xuICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChWYXVsdExpc3RlbmVyc0NvbnRleHQpO1xuICBpZiAoY29udGV4dCA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJ1c2VWYXVsdEl0ZW1TdWJzY3JpYmVyIG11c3QgYmUgdXNlZCB3aXRoaW4gYSBWYXVsdExpc3RlbmVyc1Byb3ZpZGVyXCIpO1xuXG4gIHJldHVybiAoaXRlbUlkOiBzdHJpbmcpID0+IHtcbiAgICBsZXQgdGltZW91dElkOiBOb2RlSlMuVGltZW91dDtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZTxJdGVtPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB1bnN1YnNjcmliZSA9IGNvbnRleHQuc3Vic2NyaWJlSXRlbShpdGVtSWQsIChpdGVtT3JFcnJvcikgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgaWYgKGl0ZW1PckVycm9yIGluc3RhbmNlb2YgRmFpbGVkVG9Mb2FkVmF1bHRJdGVtc0Vycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBpdGVtT3JFcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzb2x2ZShpdGVtT3JFcnJvcik7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICByZWplY3QobmV3IFN1YnNjcmliZXJUaW1lb3V0RXJyb3IoKSk7XG4gICAgICB9LCAxNTAwMCk7XG4gICAgfSk7XG4gIH07XG59O1xuXG5jbGFzcyBTdWJzY3JpYmVyVGltZW91dEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihcIlRpbWVkIG91dCB3YWl0aW5nIGZvciBpdGVtXCIpO1xuICAgIHRoaXMubmFtZSA9IFwiU3Vic2NyaWJlclRpbWVvdXRFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZhdWx0TGlzdGVuZXJzUHJvdmlkZXI7XG4iLCAiaW1wb3J0IHsgZ2V0UHJlZmVyZW5jZVZhbHVlcyB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IHByZXBhcmVGb2xkZXJzRm9yQ2FjaGUsIHByZXBhcmVJdGVtc0ZvckNhY2hlIH0gZnJvbSBcIn4vY29tcG9uZW50cy9zZWFyY2hWYXVsdC91dGlscy9jYWNoaW5nXCI7XG5pbXBvcnQgeyBDQUNIRV9LRVlTIH0gZnJvbSBcIn4vY29uc3RhbnRzL2dlbmVyYWxcIjtcbmltcG9ydCB7IEZvbGRlciwgSXRlbSwgVmF1bHQgfSBmcm9tIFwifi90eXBlcy92YXVsdFwiO1xuaW1wb3J0IHsgQ2FjaGUgfSBmcm9tIFwifi91dGlscy9jYWNoZVwiO1xuaW1wb3J0IHsgY2FwdHVyZUV4Y2VwdGlvbiB9IGZyb20gXCJ+L3V0aWxzL2RldmVsb3BtZW50XCI7XG5pbXBvcnQgeyB1c2VDb250ZW50RW5jcnlwdG9yIH0gZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlQ29udGVudEVuY3J5cHRvclwiO1xuaW1wb3J0IHVzZU9uY2VFZmZlY3QgZnJvbSBcIn4vdXRpbHMvaG9va3MvdXNlT25jZUVmZmVjdFwiO1xuXG5mdW5jdGlvbiB1c2VWYXVsdENhY2hpbmcoKSB7XG4gIGNvbnN0IHsgZW5jcnlwdCwgZGVjcnlwdCB9ID0gdXNlQ29udGVudEVuY3J5cHRvcigpO1xuICBjb25zdCBpc0NhY2hpbmdFbmFibGUgPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzLlNlYXJjaD4oKS5zaG91bGRDYWNoZVZhdWx0SXRlbXM7XG5cbiAgdXNlT25jZUVmZmVjdCgoKSA9PiB7XG4gICAgLy8gdXNlcnMgdGhhdCBvcHQgb3V0IG9mIGNhY2hpbmcgcHJvYmFibHkgd2FudCB0byBkZWxldGUgYW55IGNhY2hlZCBkYXRhXG4gICAgaWYgKCFDYWNoZS5pc0VtcHR5KSBDYWNoZS5jbGVhcigpO1xuICB9LCAhaXNDYWNoaW5nRW5hYmxlKTtcblxuICBjb25zdCBnZXRDYWNoZWRWYXVsdCA9ICgpOiBWYXVsdCA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghaXNDYWNoaW5nRW5hYmxlKSB0aHJvdyBuZXcgVmF1bHRDYWNoaW5nTm9FbmFibGVkRXJyb3IoKTtcblxuICAgICAgY29uc3QgY2FjaGVkSXYgPSBDYWNoZS5nZXQoQ0FDSEVfS0VZUy5JVik7XG4gICAgICBjb25zdCBjYWNoZWRFbmNyeXB0ZWRWYXVsdCA9IENhY2hlLmdldChDQUNIRV9LRVlTLlZBVUxUKTtcbiAgICAgIGlmICghY2FjaGVkSXYgfHwgIWNhY2hlZEVuY3J5cHRlZFZhdWx0KSB0aHJvdyBuZXcgVmF1bHRDYWNoaW5nTm9FbmFibGVkRXJyb3IoKTtcblxuICAgICAgY29uc3QgZGVjcnlwdGVkVmF1bHQgPSBkZWNyeXB0KGNhY2hlZEVuY3J5cHRlZFZhdWx0LCBjYWNoZWRJdik7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZTxWYXVsdD4oZGVjcnlwdGVkVmF1bHQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIFZhdWx0Q2FjaGluZ05vRW5hYmxlZEVycm9yKSkge1xuICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGRlY3J5cHQgY2FjaGVkIHZhdWx0XCIsIGVycm9yKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGl0ZW1zOiBbXSwgZm9sZGVyczogW10gfTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgY2FjaGVWYXVsdCA9IChpdGVtczogSXRlbVtdLCBmb2xkZXJzOiBGb2xkZXJbXSk6IHZvaWQgPT4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWlzQ2FjaGluZ0VuYWJsZSkgdGhyb3cgbmV3IFZhdWx0Q2FjaGluZ05vRW5hYmxlZEVycm9yKCk7XG5cbiAgICAgIGNvbnN0IHZhdWx0VG9FbmNyeXB0ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBpdGVtczogcHJlcGFyZUl0ZW1zRm9yQ2FjaGUoaXRlbXMpLFxuICAgICAgICBmb2xkZXJzOiBwcmVwYXJlRm9sZGVyc0ZvckNhY2hlKGZvbGRlcnMpLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBlbmNyeXB0ZWRWYXVsdCA9IGVuY3J5cHQodmF1bHRUb0VuY3J5cHQpO1xuICAgICAgQ2FjaGUuc2V0KENBQ0hFX0tFWVMuVkFVTFQsIGVuY3J5cHRlZFZhdWx0LmNvbnRlbnQpO1xuICAgICAgQ2FjaGUuc2V0KENBQ0hFX0tFWVMuSVYsIGVuY3J5cHRlZFZhdWx0Lml2KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBWYXVsdENhY2hpbmdOb0VuYWJsZWRFcnJvcikpIHtcbiAgICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBjYWNoZSB2YXVsdFwiLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7IGdldENhY2hlZFZhdWx0LCBjYWNoZVZhdWx0IH07XG59XG5cbmNsYXNzIFZhdWx0Q2FjaGluZ05vRW5hYmxlZEVycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuZXhwb3J0IGRlZmF1bHQgdXNlVmF1bHRDYWNoaW5nO1xuIiwgImltcG9ydCB7IGdldFByZWZlcmVuY2VWYWx1ZXMgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBjcmVhdGVDaXBoZXJpdiwgY3JlYXRlRGVjaXBoZXJpdiwgY3JlYXRlSGFzaCwgcmFuZG9tQnl0ZXMgfSBmcm9tIFwiY3J5cHRvXCI7XG5pbXBvcnQgeyB1c2VNZW1vIH0gZnJvbSBcInJlYWN0XCI7XG5cbmNvbnN0IEFMR09SSVRITSA9IFwiYWVzLTI1Ni1jYmNcIjtcblxuZXhwb3J0IHR5cGUgRW5jcnlwdGVkQ29udGVudCA9IHsgaXY6IHN0cmluZzsgY29udGVudDogc3RyaW5nIH07XG5cbi8qKiBFbmNyeXB0cyBhbmQgZGVjcnlwdHMgZGF0YSB1c2luZyB0aGUgdXNlcidzIGNsaWVudCBzZWNyZXQgKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VDb250ZW50RW5jcnlwdG9yKCkge1xuICBjb25zdCB7IGNsaWVudFNlY3JldCB9ID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcz4oKTtcbiAgY29uc3QgY2lwaGVyS2V5QnVmZmVyID0gdXNlTWVtbygoKSA9PiBnZXQzMkJpdFNlY3JldEtleUJ1ZmZlcihjbGllbnRTZWNyZXQudHJpbSgpKSwgW2NsaWVudFNlY3JldF0pO1xuXG4gIGNvbnN0IGVuY3J5cHQgPSAoZGF0YTogc3RyaW5nKTogRW5jcnlwdGVkQ29udGVudCA9PiB7XG4gICAgY29uc3QgaXZCdWZmZXIgPSByYW5kb21CeXRlcygxNik7XG4gICAgY29uc3QgY2lwaGVyID0gY3JlYXRlQ2lwaGVyaXYoQUxHT1JJVEhNLCBjaXBoZXJLZXlCdWZmZXIsIGl2QnVmZmVyKTtcbiAgICBjb25zdCBlbmNyeXB0ZWRDb250ZW50QnVmZmVyID0gQnVmZmVyLmNvbmNhdChbY2lwaGVyLnVwZGF0ZShkYXRhKSwgY2lwaGVyLmZpbmFsKCldKTtcbiAgICByZXR1cm4geyBpdjogaXZCdWZmZXIudG9TdHJpbmcoXCJoZXhcIiksIGNvbnRlbnQ6IGVuY3J5cHRlZENvbnRlbnRCdWZmZXIudG9TdHJpbmcoXCJoZXhcIikgfTtcbiAgfTtcblxuICBjb25zdCBkZWNyeXB0ID0gKGNvbnRlbnQ6IHN0cmluZywgaXY6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgZGVjaXBoZXIgPSBjcmVhdGVEZWNpcGhlcml2KEFMR09SSVRITSwgY2lwaGVyS2V5QnVmZmVyLCBCdWZmZXIuZnJvbShpdiwgXCJoZXhcIikpO1xuICAgIGNvbnN0IGRlY3J5cHRlZENvbnRlbnRCdWZmZXIgPSBCdWZmZXIuY29uY2F0KFtkZWNpcGhlci51cGRhdGUoQnVmZmVyLmZyb20oY29udGVudCwgXCJoZXhcIikpLCBkZWNpcGhlci5maW5hbCgpXSk7XG4gICAgcmV0dXJuIGRlY3J5cHRlZENvbnRlbnRCdWZmZXIudG9TdHJpbmcoKTtcbiAgfTtcblxuICByZXR1cm4geyBlbmNyeXB0LCBkZWNyeXB0IH07XG59XG5cbmZ1bmN0aW9uIGdldDMyQml0U2VjcmV0S2V5QnVmZmVyKGtleTogc3RyaW5nKSB7XG4gIHJldHVybiBCdWZmZXIuZnJvbShjcmVhdGVIYXNoKFwic2hhMjU2XCIpLnVwZGF0ZShrZXkpLmRpZ2VzdChcImJhc2U2NFwiKS5zbGljZSgwLCAzMikpO1xufVxuIiwgImltcG9ydCB7IGVudmlyb25tZW50LCBzaG93VG9hc3QsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgQ29tcG9uZW50LCBFcnJvckluZm8sIFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFRyb3VibGVzaG9vdGluZ0d1aWRlIGZyb20gXCJ+L2NvbXBvbmVudHMvVHJvdWJsZXNob290aW5nR3VpZGVcIjtcbmltcG9ydCB7IE1hbnVhbGx5VGhyb3duRXJyb3IgfSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcblxudHlwZSBQcm9wcyA9IHtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59O1xuXG50eXBlIFN0YXRlID0ge1xuICBoYXNFcnJvcjogYm9vbGVhbjtcbiAgZXJyb3I/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb290RXJyb3JCb3VuZGFyeSBleHRlbmRzIENvbXBvbmVudDxQcm9wcywgU3RhdGU+IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7IGhhc0Vycm9yOiBmYWxzZSB9O1xuICB9XG5cbiAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcigpIHtcbiAgICByZXR1cm4geyBoYXNFcnJvcjogdHJ1ZSB9O1xuICB9XG5cbiAgYXN5bmMgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3I6IEVycm9yLCBlcnJvckluZm86IEVycm9ySW5mbykge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIE1hbnVhbGx5VGhyb3duRXJyb3IpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoKHN0YXRlKSA9PiAoeyAuLi5zdGF0ZSwgaGFzRXJyb3I6IHRydWUsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pKTtcbiAgICAgIGF3YWl0IHNob3dUb2FzdChUb2FzdC5TdHlsZS5GYWlsdXJlLCBlcnJvci5tZXNzYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGVudmlyb25tZW50LmlzRGV2ZWxvcG1lbnQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSgoc3RhdGUpID0+ICh7IC4uLnN0YXRlLCBoYXNFcnJvcjogdHJ1ZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSkpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yOlwiLCBlcnJvciwgZXJyb3JJbmZvKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmhhc0Vycm9yKSByZXR1cm4gPFRyb3VibGVzaG9vdGluZ0d1aWRlIGVycm9yPXt0aGlzLnN0YXRlLmVycm9yfSAvPjtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIDxUcm91Ymxlc2hvb3RpbmdHdWlkZSAvPjtcbiAgICB9XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUEsa0NBQUFBLFVBQUFDLFNBQUE7QUFBQSxJQUFBQSxRQUFPLFVBQVU7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Q1IsUUFBUTtBQUFBO0FBQUE7QUFBQSxNQUdSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUE7QUFBQSxNQUdSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUE7QUFBQSxNQUdSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixhQUFhO0FBQUEsTUFDYixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsZ0JBQWdCO0FBQUE7QUFBQSxNQUdoQixXQUFXO0FBQUE7QUFBQSxNQUNYLFdBQVc7QUFBQTtBQUFBLE1BQ1gsZ0JBQWdCO0FBQUEsTUFDaEIsV0FBVztBQUFBO0FBQUE7QUFBQSxNQUdYLFVBQVU7QUFBQTtBQUFBLE1BQ1YsVUFBVTtBQUFBO0FBQUEsTUFDVixlQUFlO0FBQUEsTUFDZixVQUFVO0FBQUE7QUFBQSxNQUNWLFVBQVU7QUFBQTtBQUFBLE1BQ1YsVUFBVTtBQUFBLE1BQ1YsVUFBVTtBQUFBO0FBQUEsTUFHVixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtB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O0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUNBO0FBQUEsSUFDQSxVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFNO0FBQUEsRUFFZjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLElBQ1QsUUFBTztBQUFBLEVBQUk7QUFBQSxFQUVYO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBTztBQUFBLEVBRWhCO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBTTtBQUFBLEVBRWY7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFNO0FBQUEsRUFFZjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLElBQ1QsUUFBTztBQUFBLEVBQUk7QUFBQSxFQUVYO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsSUFDVCxRQUFPO0FBQUEsRUFBSTtBQUFBLEVBRVg7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFLO0FBQUEsRUFFZDtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQUs7QUFBQSxFQUVkO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFLO0FBQUEsRUFFZDtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQUs7QUFBQSxFQUVkO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNB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QUFDLGtCQUFLLFdBQUwsRUFBZTtBQUFBLFVBQ2hCLDhDQUFDLGtCQUFLLGFBQUwsRUFBaUIsT0FBTSxRQUFPLE1BQU0sTUFBTSxTQUFTLE1BQU07QUFBQSxVQUN6RCxNQUFNLFNBQVMseUJBQ2QsZ0ZBQ0U7QUFBQSwwREFBQyxrQkFBSyxhQUFMLEVBQWlCLE9BQU0sYUFBWSxNQUFNLE1BQU0sU0FBUyxLQUFLLFVBQVU7QUFBQSxZQUN4RSw4Q0FBQyxrQkFBSyxhQUFMLEVBQWlCLE9BQU0sYUFBWSxNQUFNLE1BQU0sU0FBUyxLQUFLLFVBQVU7QUFBQSxhQUMxRTtBQUFBLFdBRUo7QUFBQSxRQUVELE1BQU0sV0FBVyxrQkFDaEIsOENBQUMsa0JBQUssVUFBTCxFQUFjLElBQUcsUUFBTyxPQUFNLFFBQU8sT0FBTyxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU07QUFBQSxRQUVoRixNQUFNLFdBQVcsaUJBQ2hCLGdGQUNFO0FBQUEsd0RBQUMsa0JBQUssYUFBTCxFQUFpQixNQUFLLElBQUc7QUFBQSxVQUMxQjtBQUFBLFlBQUMsa0JBQUs7QUFBQSxZQUFMO0FBQUEsY0FDRSxHQUFHLG1CQUFtQixVQUFVLFdBQVcsaUJBQWlCO0FBQUEsY0FDN0QsS0FBSztBQUFBLGNBQ0wsT0FBTTtBQUFBLGNBQ04sTUFBSztBQUFBLGNBQ0wsZ0JBQWdCO0FBQUEsY0FDaEIsd0JBQXdCO0FBQUEsY0FDeEIsc0JBQW9CO0FBQUE7QUFBQSxVQUN0QjtBQUFBLFdBQ0Y7QUFBQTtBQUFBO0FBQUEsRUFFSjtBQUVKO0FBRUEsSUFBTyx1QkFBUTsiLAogICJuYW1lcyI6IFsiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoS2V5IiwgImVudmlyb25tZW50IiwgInBsYXRmb3JtIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInByb2Nlc3MiLCAidW5sb2FkIiwgImVtaXQiLCAibG9hZCIsICJwcm9jZXNzUmVhbGx5RXhpdCIsICJwcm9jZXNzRW1pdCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwcm9taXNpZnkiLCAiZ2V0U3RyZWFtIiwgInN0cmVhbSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgIm9wZW4iLCAiZXJyIiwgImVudHJ5IiwgImltcG9ydF9hcGkiLCAiJGhnVVcxJHVzZVJlZiIsICIkaGdVVzEkdXNlTWVtbyIsICIkaGdVVzEkc2hvd1RvYXN0IiwgIiRoZ1VXMSRUb2FzdCIsICIkaGdVVzEkcmVhZEZpbGVTeW5jIiwgIiRoZ1VXMSRqb2luIiwgIiRoZ1VXMSRlbnZpcm9ubWVudCIsICIkaGdVVzEkQ2xpcGJvYXJkIiwgIiRoZ1VXMSRvcGVuIiwgIiRoZ1VXMSR1c2VTdGF0ZSIsICIkaGdVVzEkdXNlQ2FsbGJhY2siLCAiYXJncyIsICIkaGdVVzEkTGF1bmNoVHlwZSIsICJvcHRpb25zIiwgIiRoZ1VXMSR1c2VFZmZlY3QiLCAiJGhnVVcxJHVzZVN0YXRlIiwgIiRoZ1VXMSR1c2VSZWYiLCAiJGhnVVcxJHVzZUNhbGxiYWNrIiwgInZhbHVlcyIsICJ2YWxpZGF0aW9uIiwgImVycm9ycyIsICIkaGdVVzEkdXNlTWVtbyIsICJ2YWx1ZSIsICJpbXBvcnRfcGF0aCIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9ub2RlX3BhdGgiLCAiaW1wb3J0X25vZGVfcHJvY2VzcyIsICJpbXBvcnRfbm9kZV9wYXRoIiwgInBsYXRmb3JtIiwgInByb2Nlc3MiLCAidXJsIiwgInBhdGgiLCAib25ldGltZSIsICJpbXBvcnRfbm9kZV9vcyIsICJpbXBvcnRfbm9kZV9vcyIsICJvcyIsICJvbkV4aXQiLCAibWVyZ2VTdHJlYW0iLCAiZ2V0U3RyZWFtIiwgInByb2Nlc3MiLCAiY3Jvc3NTcGF3biIsICJwYXRoIiwgImNoaWxkUHJvY2VzcyIsICJpbXBvcnRfZnMiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9wYXRoIiwgImltcG9ydF9wcm9taXNlcyIsICJwYXRoIiwgInN0cmVhbVppcCIsICJpbXBvcnRfZnMiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfYXBpIiwgImNhcHR1cmVFeGNlcHRpb25SYXljYXN0IiwgImltcG9ydF9mcyIsICJpbXBvcnRfY3J5cHRvIiwgInVybCIsICJwYXRoIiwgImh0dHBzIiwgImh0dHAiLCAiaW1wb3J0X2FwaSIsICJSYXljYXN0Q2FjaGUiLCAidXJsIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiZXJyb3IiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2FwaSIsICJ2YWx1ZSIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiZXJyb3IiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9hcGkiLCAiY2FsbGJhY2tFeGVjIiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2NoaWxkX3Byb2Nlc3MiLCAiaW1wb3J0X3V0aWwiLCAiaW1wb3J0X2ZzIiwgImltcG9ydF9wYXRoIiwgImltcG9ydF9qc3hfcnVudGltZSIsICJleGVjIiwgImV4ZWNXaXRoQ2FsbGJhY2tzIiwgInN1cHBvcnRQYXRoIiwgInRyeUV4ZWMiLCAicGF0aCIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgImltcG9ydF9qc3hfcnVudGltZSIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgIkxvYWRpbmdGYWxsYmFjayIsICJ2YWx1ZXMiLCAidXJsIiwgImVycm9yIl0KfQo=
