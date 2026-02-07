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
    var { promisify } = require("util");
    var bufferStream = require_buffer_stream();
    var streamPipelinePromisified = promisify(stream.pipeline);
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

// src/generate-password-quick.tsx
var generate_password_quick_exports = {};
__export(generate_password_quick_exports, {
  default: () => generate_password_quick_default
});
module.exports = __toCommonJS(generate_password_quick_exports);
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
  const storedOptions = await import_api2.LocalStorage.getItem(LOCAL_STORAGE_KEY.PASSWORD_OPTIONS);
  return {
    ...DEFAULT_PASSWORD_OPTIONS,
    ...storedOptions ? JSON.parse(storedOptions) : {}
  };
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
var COMMAND_NAME_TO_PREFERENCE_KEY_MAP = {
  search: "transientCopySearch",
  "generate-password": "transientCopyGeneratePassword",
  "generate-password-quick": "transientCopyGeneratePasswordQuick"
};
function getTransientCopyPreference(type) {
  const preferenceKey = COMMAND_NAME_TO_PREFERENCE_KEY_MAP[import_api3.environment.commandName];
  const transientPreference = (0, import_api3.getPreferenceValues)()[preferenceKey];
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

// src/utils/clipboard.ts
var import_api8 = require("@raycast/api");

// src/utils/strings.ts
var capitalize = (value, lowercaseRest = false) => {
  const firstLetter = value.charAt(0).toUpperCase();
  const rest = lowercaseRest ? value.slice(1).toLowerCase() : value.slice(1);
  return firstLetter + rest;
};

// src/utils/clipboard.ts
async function showCopySuccessMessage(title, message) {
  const action = (0, import_api8.getPreferenceValues)().windowActionOnCopy;
  const messageTitle = capitalize(title, true);
  if (action === "keepOpen") {
    await (0, import_api8.showToast)({ title: messageTitle, message, style: import_api8.Toast.Style.Success });
  } else if (action === "closeAndPopToRoot") {
    await (0, import_api8.showHUD)(messageTitle);
    await (0, import_api8.popToRoot)();
  } else {
    await (0, import_api8.showHUD)(messageTitle);
  }
}

// src/generate-password-quick.tsx
var { generatePasswordQuickAction } = (0, import_api9.getPreferenceValues)();
var actions = {
  copy: async (password) => {
    await import_api9.Clipboard.copy(password, { transient: getTransientCopyPreference("password") });
    await showCopySuccessMessage("Copied password to clipboard");
  },
  paste: async (password) => {
    await import_api9.Clipboard.paste(password);
  },
  copyAndPaste: async (password) => {
    await import_api9.Clipboard.copy(password, { transient: getTransientCopyPreference("password") });
    await import_api9.Clipboard.paste(password);
    await (0, import_api9.showHUD)("Copied password to clipboard");
  }
};
async function generatePasswordQuickCommand() {
  const toast = await (0, import_api9.showToast)(import_api9.Toast.Style.Animated, "Generating password...");
  try {
    const bitwarden = await new Bitwarden(toast).initialize();
    const options = await getPasswordGeneratorOptions();
    const password = await bitwarden.generatePassword(options);
    await actions[generatePasswordQuickAction](password);
  } catch (error) {
    toast.style = import_api9.Toast.Style.Failure;
    toast.message = "Failed to generate";
    captureException("Failed to generate password", error);
  }
}
var generate_password_quick_default = generatePasswordQuickCommand;
/*! Bundled license information:

node-stream-zip/node_stream_zip.js:
  (**
   * @license node-stream-zip | (c) 2020 Antelle | https://github.com/antelle/node-stream-zip/blob/master/LICENSE
   * Portions copyright https://github.com/cthackers/adm-zip | https://raw.githubusercontent.com/cthackers/adm-zip/master/LICENSE
   *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL3dpbmRvd3MuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL21vZGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy93aGljaC93aGljaC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi91dGlsL3Jlc29sdmVDb21tYW5kLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9jcm9zcy1zcGF3bi9saWIvdXRpbC9lc2NhcGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctcmVnZXgvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctY29tbWFuZC9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL3V0aWwvcmVhZFNoZWJhbmcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi9wYXJzZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL2Vub2VudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NpZ25hbC1leGl0L3NpZ25hbHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NpZ25hbC1leGl0L2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9nZXQtc3RyZWFtL2J1ZmZlci1zdHJlYW0uanMiLCAiLi4vbm9kZV9tb2R1bGVzL2dldC1zdHJlYW0vaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL21lcmdlLXN0cmVhbS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvbm9kZS1zdHJlYW0temlwL25vZGVfc3RyZWFtX3ppcC5qcyIsICIuLi9zcmMvZ2VuZXJhdGUtcGFzc3dvcmQtcXVpY2sudHN4IiwgIi4uL3NyYy9hcGkvYml0d2FyZGVuLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9leGVjYS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvc3RyaXAtZmluYWwtbmV3bGluZS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvbnBtLXJ1bi1wYXRoL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ucG0tcnVuLXBhdGgvbm9kZV9tb2R1bGVzL3BhdGgta2V5L2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9taW1pYy1mbi9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvb25ldGltZS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvaHVtYW4tc2lnbmFscy9idWlsZC9zcmMvbWFpbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvaHVtYW4tc2lnbmFscy9idWlsZC9zcmMvcmVhbHRpbWUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2h1bWFuLXNpZ25hbHMvYnVpbGQvc3JjL3NpZ25hbHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2h1bWFuLXNpZ25hbHMvYnVpbGQvc3JjL2NvcmUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9lcnJvci5qcyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvbGliL3N0ZGlvLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9leGVjYS9saWIva2lsbC5qcyIsICIuLi9ub2RlX21vZHVsZXMvaXMtc3RyZWFtL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9leGVjYS9saWIvc3RyZWFtLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9leGVjYS9saWIvcHJvbWlzZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvZXhlY2EvbGliL2NvbW1hbmQuanMiLCAiLi4vc3JjL2NvbnN0YW50cy9nZW5lcmFsLnRzIiwgIi4uL3NyYy91dGlscy9wYXNzd29yZHMudHMiLCAiLi4vc3JjL2NvbnN0YW50cy9wYXNzd29yZHMudHMiLCAiLi4vc3JjL3V0aWxzL3ByZWZlcmVuY2VzLnRzIiwgIi4uL3NyYy9jb25zdGFudHMvcHJlZmVyZW5jZXMudHMiLCAiLi4vc3JjL2NvbnN0YW50cy9sYWJlbHMudHMiLCAiLi4vc3JjL3V0aWxzL2Vycm9ycy50cyIsICIuLi9zcmMvdXRpbHMvZnMudHMiLCAiLi4vc3JjL3V0aWxzL25ldHdvcmsudHMiLCAiLi4vc3JjL3V0aWxzL2RldmVsb3BtZW50LnRzIiwgIi4uL3NyYy91dGlscy9jcnlwdG8udHMiLCAiLi4vc3JjL2FwaS9iaXR3YXJkZW4uaGVscGVycy50cyIsICIuLi9zcmMvdXRpbHMvY2FjaGUudHMiLCAiLi4vc3JjL3V0aWxzL3BsYXRmb3JtLnRzIiwgIi4uL3NyYy91dGlscy9jbGlwYm9hcmQudHMiLCAiLi4vc3JjL3V0aWxzL3N0cmluZ3MudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIm1vZHVsZS5leHBvcnRzID0gaXNleGVcbmlzZXhlLnN5bmMgPSBzeW5jXG5cbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJylcblxuZnVuY3Rpb24gY2hlY2tQYXRoRXh0IChwYXRoLCBvcHRpb25zKSB7XG4gIHZhciBwYXRoZXh0ID0gb3B0aW9ucy5wYXRoRXh0ICE9PSB1bmRlZmluZWQgP1xuICAgIG9wdGlvbnMucGF0aEV4dCA6IHByb2Nlc3MuZW52LlBBVEhFWFRcblxuICBpZiAoIXBhdGhleHQpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcGF0aGV4dCA9IHBhdGhleHQuc3BsaXQoJzsnKVxuICBpZiAocGF0aGV4dC5pbmRleE9mKCcnKSAhPT0gLTEpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aGV4dC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwID0gcGF0aGV4dFtpXS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKHAgJiYgcGF0aC5zdWJzdHIoLXAubGVuZ3RoKS50b0xvd2VyQ2FzZSgpID09PSBwKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gY2hlY2tTdGF0IChzdGF0LCBwYXRoLCBvcHRpb25zKSB7XG4gIGlmICghc3RhdC5pc1N5bWJvbGljTGluaygpICYmICFzdGF0LmlzRmlsZSgpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcmV0dXJuIGNoZWNrUGF0aEV4dChwYXRoLCBvcHRpb25zKVxufVxuXG5mdW5jdGlvbiBpc2V4ZSAocGF0aCwgb3B0aW9ucywgY2IpIHtcbiAgZnMuc3RhdChwYXRoLCBmdW5jdGlvbiAoZXIsIHN0YXQpIHtcbiAgICBjYihlciwgZXIgPyBmYWxzZSA6IGNoZWNrU3RhdChzdGF0LCBwYXRoLCBvcHRpb25zKSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gc3luYyAocGF0aCwgb3B0aW9ucykge1xuICByZXR1cm4gY2hlY2tTdGF0KGZzLnN0YXRTeW5jKHBhdGgpLCBwYXRoLCBvcHRpb25zKVxufVxuIiwgIm1vZHVsZS5leHBvcnRzID0gaXNleGVcbmlzZXhlLnN5bmMgPSBzeW5jXG5cbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJylcblxuZnVuY3Rpb24gaXNleGUgKHBhdGgsIG9wdGlvbnMsIGNiKSB7XG4gIGZzLnN0YXQocGF0aCwgZnVuY3Rpb24gKGVyLCBzdGF0KSB7XG4gICAgY2IoZXIsIGVyID8gZmFsc2UgOiBjaGVja1N0YXQoc3RhdCwgb3B0aW9ucykpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHN5bmMgKHBhdGgsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNoZWNrU3RhdChmcy5zdGF0U3luYyhwYXRoKSwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gY2hlY2tTdGF0IChzdGF0LCBvcHRpb25zKSB7XG4gIHJldHVybiBzdGF0LmlzRmlsZSgpICYmIGNoZWNrTW9kZShzdGF0LCBvcHRpb25zKVxufVxuXG5mdW5jdGlvbiBjaGVja01vZGUgKHN0YXQsIG9wdGlvbnMpIHtcbiAgdmFyIG1vZCA9IHN0YXQubW9kZVxuICB2YXIgdWlkID0gc3RhdC51aWRcbiAgdmFyIGdpZCA9IHN0YXQuZ2lkXG5cbiAgdmFyIG15VWlkID0gb3B0aW9ucy51aWQgIT09IHVuZGVmaW5lZCA/XG4gICAgb3B0aW9ucy51aWQgOiBwcm9jZXNzLmdldHVpZCAmJiBwcm9jZXNzLmdldHVpZCgpXG4gIHZhciBteUdpZCA9IG9wdGlvbnMuZ2lkICE9PSB1bmRlZmluZWQgP1xuICAgIG9wdGlvbnMuZ2lkIDogcHJvY2Vzcy5nZXRnaWQgJiYgcHJvY2Vzcy5nZXRnaWQoKVxuXG4gIHZhciB1ID0gcGFyc2VJbnQoJzEwMCcsIDgpXG4gIHZhciBnID0gcGFyc2VJbnQoJzAxMCcsIDgpXG4gIHZhciBvID0gcGFyc2VJbnQoJzAwMScsIDgpXG4gIHZhciB1ZyA9IHUgfCBnXG5cbiAgdmFyIHJldCA9IChtb2QgJiBvKSB8fFxuICAgIChtb2QgJiBnKSAmJiBnaWQgPT09IG15R2lkIHx8XG4gICAgKG1vZCAmIHUpICYmIHVpZCA9PT0gbXlVaWQgfHxcbiAgICAobW9kICYgdWcpICYmIG15VWlkID09PSAwXG5cbiAgcmV0dXJuIHJldFxufVxuIiwgInZhciBmcyA9IHJlcXVpcmUoJ2ZzJylcbnZhciBjb3JlXG5pZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyB8fCBnbG9iYWwuVEVTVElOR19XSU5ET1dTKSB7XG4gIGNvcmUgPSByZXF1aXJlKCcuL3dpbmRvd3MuanMnKVxufSBlbHNlIHtcbiAgY29yZSA9IHJlcXVpcmUoJy4vbW9kZS5qcycpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNleGVcbmlzZXhlLnN5bmMgPSBzeW5jXG5cbmZ1bmN0aW9uIGlzZXhlIChwYXRoLCBvcHRpb25zLCBjYikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IG9wdGlvbnNcbiAgICBvcHRpb25zID0ge31cbiAgfVxuXG4gIGlmICghY2IpIHtcbiAgICBpZiAodHlwZW9mIFByb21pc2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2NhbGxiYWNrIG5vdCBwcm92aWRlZCcpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGlzZXhlKHBhdGgsIG9wdGlvbnMgfHwge30sIGZ1bmN0aW9uIChlciwgaXMpIHtcbiAgICAgICAgaWYgKGVyKSB7XG4gICAgICAgICAgcmVqZWN0KGVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoaXMpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGNvcmUocGF0aCwgb3B0aW9ucyB8fCB7fSwgZnVuY3Rpb24gKGVyLCBpcykge1xuICAgIC8vIGlnbm9yZSBFQUNDRVMgYmVjYXVzZSB0aGF0IGp1c3QgbWVhbnMgd2UgYXJlbid0IGFsbG93ZWQgdG8gcnVuIGl0XG4gICAgaWYgKGVyKSB7XG4gICAgICBpZiAoZXIuY29kZSA9PT0gJ0VBQ0NFUycgfHwgb3B0aW9ucyAmJiBvcHRpb25zLmlnbm9yZUVycm9ycykge1xuICAgICAgICBlciA9IG51bGxcbiAgICAgICAgaXMgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICBjYihlciwgaXMpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHN5bmMgKHBhdGgsIG9wdGlvbnMpIHtcbiAgLy8gbXkga2luZ2RvbSBmb3IgYSBmaWx0ZXJlZCBjYXRjaFxuICB0cnkge1xuICAgIHJldHVybiBjb3JlLnN5bmMocGF0aCwgb3B0aW9ucyB8fCB7fSlcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmlnbm9yZUVycm9ycyB8fCBlci5jb2RlID09PSAnRUFDQ0VTJykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGVyXG4gICAgfVxuICB9XG59XG4iLCAiY29uc3QgaXNXaW5kb3dzID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyB8fFxuICAgIHByb2Nlc3MuZW52Lk9TVFlQRSA9PT0gJ2N5Z3dpbicgfHxcbiAgICBwcm9jZXNzLmVudi5PU1RZUEUgPT09ICdtc3lzJ1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5jb25zdCBDT0xPTiA9IGlzV2luZG93cyA/ICc7JyA6ICc6J1xuY29uc3QgaXNleGUgPSByZXF1aXJlKCdpc2V4ZScpXG5cbmNvbnN0IGdldE5vdEZvdW5kRXJyb3IgPSAoY21kKSA9PlxuICBPYmplY3QuYXNzaWduKG5ldyBFcnJvcihgbm90IGZvdW5kOiAke2NtZH1gKSwgeyBjb2RlOiAnRU5PRU5UJyB9KVxuXG5jb25zdCBnZXRQYXRoSW5mbyA9IChjbWQsIG9wdCkgPT4ge1xuICBjb25zdCBjb2xvbiA9IG9wdC5jb2xvbiB8fCBDT0xPTlxuXG4gIC8vIElmIGl0IGhhcyBhIHNsYXNoLCB0aGVuIHdlIGRvbid0IGJvdGhlciBzZWFyY2hpbmcgdGhlIHBhdGhlbnYuXG4gIC8vIGp1c3QgY2hlY2sgdGhlIGZpbGUgaXRzZWxmLCBhbmQgdGhhdCdzIGl0LlxuICBjb25zdCBwYXRoRW52ID0gY21kLm1hdGNoKC9cXC8vKSB8fCBpc1dpbmRvd3MgJiYgY21kLm1hdGNoKC9cXFxcLykgPyBbJyddXG4gICAgOiAoXG4gICAgICBbXG4gICAgICAgIC8vIHdpbmRvd3MgYWx3YXlzIGNoZWNrcyB0aGUgY3dkIGZpcnN0XG4gICAgICAgIC4uLihpc1dpbmRvd3MgPyBbcHJvY2Vzcy5jd2QoKV0gOiBbXSksXG4gICAgICAgIC4uLihvcHQucGF0aCB8fCBwcm9jZXNzLmVudi5QQVRIIHx8XG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQ6IHZlcnkgdW51c3VhbCAqLyAnJykuc3BsaXQoY29sb24pLFxuICAgICAgXVxuICAgIClcbiAgY29uc3QgcGF0aEV4dEV4ZSA9IGlzV2luZG93c1xuICAgID8gb3B0LnBhdGhFeHQgfHwgcHJvY2Vzcy5lbnYuUEFUSEVYVCB8fCAnLkVYRTsuQ01EOy5CQVQ7LkNPTSdcbiAgICA6ICcnXG4gIGNvbnN0IHBhdGhFeHQgPSBpc1dpbmRvd3MgPyBwYXRoRXh0RXhlLnNwbGl0KGNvbG9uKSA6IFsnJ11cblxuICBpZiAoaXNXaW5kb3dzKSB7XG4gICAgaWYgKGNtZC5pbmRleE9mKCcuJykgIT09IC0xICYmIHBhdGhFeHRbMF0gIT09ICcnKVxuICAgICAgcGF0aEV4dC51bnNoaWZ0KCcnKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYXRoRW52LFxuICAgIHBhdGhFeHQsXG4gICAgcGF0aEV4dEV4ZSxcbiAgfVxufVxuXG5jb25zdCB3aGljaCA9IChjbWQsIG9wdCwgY2IpID0+IHtcbiAgaWYgKHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IG9wdFxuICAgIG9wdCA9IHt9XG4gIH1cbiAgaWYgKCFvcHQpXG4gICAgb3B0ID0ge31cblxuICBjb25zdCB7IHBhdGhFbnYsIHBhdGhFeHQsIHBhdGhFeHRFeGUgfSA9IGdldFBhdGhJbmZvKGNtZCwgb3B0KVxuICBjb25zdCBmb3VuZCA9IFtdXG5cbiAgY29uc3Qgc3RlcCA9IGkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmIChpID09PSBwYXRoRW52Lmxlbmd0aClcbiAgICAgIHJldHVybiBvcHQuYWxsICYmIGZvdW5kLmxlbmd0aCA/IHJlc29sdmUoZm91bmQpXG4gICAgICAgIDogcmVqZWN0KGdldE5vdEZvdW5kRXJyb3IoY21kKSlcblxuICAgIGNvbnN0IHBwUmF3ID0gcGF0aEVudltpXVxuICAgIGNvbnN0IHBhdGhQYXJ0ID0gL15cIi4qXCIkLy50ZXN0KHBwUmF3KSA/IHBwUmF3LnNsaWNlKDEsIC0xKSA6IHBwUmF3XG5cbiAgICBjb25zdCBwQ21kID0gcGF0aC5qb2luKHBhdGhQYXJ0LCBjbWQpXG4gICAgY29uc3QgcCA9ICFwYXRoUGFydCAmJiAvXlxcLltcXFxcXFwvXS8udGVzdChjbWQpID8gY21kLnNsaWNlKDAsIDIpICsgcENtZFxuICAgICAgOiBwQ21kXG5cbiAgICByZXNvbHZlKHN1YlN0ZXAocCwgaSwgMCkpXG4gIH0pXG5cbiAgY29uc3Qgc3ViU3RlcCA9IChwLCBpLCBpaSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmIChpaSA9PT0gcGF0aEV4dC5sZW5ndGgpXG4gICAgICByZXR1cm4gcmVzb2x2ZShzdGVwKGkgKyAxKSlcbiAgICBjb25zdCBleHQgPSBwYXRoRXh0W2lpXVxuICAgIGlzZXhlKHAgKyBleHQsIHsgcGF0aEV4dDogcGF0aEV4dEV4ZSB9LCAoZXIsIGlzKSA9PiB7XG4gICAgICBpZiAoIWVyICYmIGlzKSB7XG4gICAgICAgIGlmIChvcHQuYWxsKVxuICAgICAgICAgIGZvdW5kLnB1c2gocCArIGV4dClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiByZXNvbHZlKHAgKyBleHQpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZShzdWJTdGVwKHAsIGksIGlpICsgMSkpXG4gICAgfSlcbiAgfSlcblxuICByZXR1cm4gY2IgPyBzdGVwKDApLnRoZW4ocmVzID0+IGNiKG51bGwsIHJlcyksIGNiKSA6IHN0ZXAoMClcbn1cblxuY29uc3Qgd2hpY2hTeW5jID0gKGNtZCwgb3B0KSA9PiB7XG4gIG9wdCA9IG9wdCB8fCB7fVxuXG4gIGNvbnN0IHsgcGF0aEVudiwgcGF0aEV4dCwgcGF0aEV4dEV4ZSB9ID0gZ2V0UGF0aEluZm8oY21kLCBvcHQpXG4gIGNvbnN0IGZvdW5kID0gW11cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGhFbnYubGVuZ3RoOyBpICsrKSB7XG4gICAgY29uc3QgcHBSYXcgPSBwYXRoRW52W2ldXG4gICAgY29uc3QgcGF0aFBhcnQgPSAvXlwiLipcIiQvLnRlc3QocHBSYXcpID8gcHBSYXcuc2xpY2UoMSwgLTEpIDogcHBSYXdcblxuICAgIGNvbnN0IHBDbWQgPSBwYXRoLmpvaW4ocGF0aFBhcnQsIGNtZClcbiAgICBjb25zdCBwID0gIXBhdGhQYXJ0ICYmIC9eXFwuW1xcXFxcXC9dLy50ZXN0KGNtZCkgPyBjbWQuc2xpY2UoMCwgMikgKyBwQ21kXG4gICAgICA6IHBDbWRcblxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGF0aEV4dC5sZW5ndGg7IGogKyspIHtcbiAgICAgIGNvbnN0IGN1ciA9IHAgKyBwYXRoRXh0W2pdXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBpcyA9IGlzZXhlLnN5bmMoY3VyLCB7IHBhdGhFeHQ6IHBhdGhFeHRFeGUgfSlcbiAgICAgICAgaWYgKGlzKSB7XG4gICAgICAgICAgaWYgKG9wdC5hbGwpXG4gICAgICAgICAgICBmb3VuZC5wdXNoKGN1cilcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gY3VyXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7fVxuICAgIH1cbiAgfVxuXG4gIGlmIChvcHQuYWxsICYmIGZvdW5kLmxlbmd0aClcbiAgICByZXR1cm4gZm91bmRcblxuICBpZiAob3B0Lm5vdGhyb3cpXG4gICAgcmV0dXJuIG51bGxcblxuICB0aHJvdyBnZXROb3RGb3VuZEVycm9yKGNtZClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB3aGljaFxud2hpY2guc3luYyA9IHdoaWNoU3luY1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcGF0aEtleSA9IChvcHRpb25zID0ge30pID0+IHtcblx0Y29uc3QgZW52aXJvbm1lbnQgPSBvcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudjtcblx0Y29uc3QgcGxhdGZvcm0gPSBvcHRpb25zLnBsYXRmb3JtIHx8IHByb2Nlc3MucGxhdGZvcm07XG5cblx0aWYgKHBsYXRmb3JtICE9PSAnd2luMzInKSB7XG5cdFx0cmV0dXJuICdQQVRIJztcblx0fVxuXG5cdHJldHVybiBPYmplY3Qua2V5cyhlbnZpcm9ubWVudCkucmV2ZXJzZSgpLmZpbmQoa2V5ID0+IGtleS50b1VwcGVyQ2FzZSgpID09PSAnUEFUSCcpIHx8ICdQYXRoJztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcGF0aEtleTtcbi8vIFRPRE86IFJlbW92ZSB0aGlzIGZvciB0aGUgbmV4dCBtYWpvciByZWxlYXNlXG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gcGF0aEtleTtcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB3aGljaCA9IHJlcXVpcmUoJ3doaWNoJyk7XG5jb25zdCBnZXRQYXRoS2V5ID0gcmVxdWlyZSgncGF0aC1rZXknKTtcblxuZnVuY3Rpb24gcmVzb2x2ZUNvbW1hbmRBdHRlbXB0KHBhcnNlZCwgd2l0aG91dFBhdGhFeHQpIHtcbiAgICBjb25zdCBlbnYgPSBwYXJzZWQub3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG4gICAgY29uc3QgY3dkID0gcHJvY2Vzcy5jd2QoKTtcbiAgICBjb25zdCBoYXNDdXN0b21Dd2QgPSBwYXJzZWQub3B0aW9ucy5jd2QgIT0gbnVsbDtcbiAgICAvLyBXb3JrZXIgdGhyZWFkcyBkbyBub3QgaGF2ZSBwcm9jZXNzLmNoZGlyKClcbiAgICBjb25zdCBzaG91bGRTd2l0Y2hDd2QgPSBoYXNDdXN0b21Dd2QgJiYgcHJvY2Vzcy5jaGRpciAhPT0gdW5kZWZpbmVkICYmICFwcm9jZXNzLmNoZGlyLmRpc2FibGVkO1xuXG4gICAgLy8gSWYgYSBjdXN0b20gYGN3ZGAgd2FzIHNwZWNpZmllZCwgd2UgbmVlZCB0byBjaGFuZ2UgdGhlIHByb2Nlc3MgY3dkXG4gICAgLy8gYmVjYXVzZSBgd2hpY2hgIHdpbGwgZG8gc3RhdCBjYWxscyBidXQgZG9lcyBub3Qgc3VwcG9ydCBhIGN1c3RvbSBjd2RcbiAgICBpZiAoc2hvdWxkU3dpdGNoQ3dkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm9jZXNzLmNoZGlyKHBhcnNlZC5vcHRpb25zLmN3ZCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLyogRW1wdHkgKi9cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxldCByZXNvbHZlZDtcblxuICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVkID0gd2hpY2guc3luYyhwYXJzZWQuY29tbWFuZCwge1xuICAgICAgICAgICAgcGF0aDogZW52W2dldFBhdGhLZXkoeyBlbnYgfSldLFxuICAgICAgICAgICAgcGF0aEV4dDogd2l0aG91dFBhdGhFeHQgPyBwYXRoLmRlbGltaXRlciA6IHVuZGVmaW5lZCxcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvKiBFbXB0eSAqL1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChzaG91bGRTd2l0Y2hDd2QpIHtcbiAgICAgICAgICAgIHByb2Nlc3MuY2hkaXIoY3dkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHdlIHN1Y2Nlc3NmdWxseSByZXNvbHZlZCwgZW5zdXJlIHRoYXQgYW4gYWJzb2x1dGUgcGF0aCBpcyByZXR1cm5lZFxuICAgIC8vIE5vdGUgdGhhdCB3aGVuIGEgY3VzdG9tIGBjd2RgIHdhcyB1c2VkLCB3ZSBuZWVkIHRvIHJlc29sdmUgdG8gYW4gYWJzb2x1dGUgcGF0aCBiYXNlZCBvbiBpdFxuICAgIGlmIChyZXNvbHZlZCkge1xuICAgICAgICByZXNvbHZlZCA9IHBhdGgucmVzb2x2ZShoYXNDdXN0b21Dd2QgPyBwYXJzZWQub3B0aW9ucy5jd2QgOiAnJywgcmVzb2x2ZWQpO1xuICAgIH1cblxuICAgIHJldHVybiByZXNvbHZlZDtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUNvbW1hbmQocGFyc2VkKSB7XG4gICAgcmV0dXJuIHJlc29sdmVDb21tYW5kQXR0ZW1wdChwYXJzZWQpIHx8IHJlc29sdmVDb21tYW5kQXR0ZW1wdChwYXJzZWQsIHRydWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc29sdmVDb21tYW5kO1xuIiwgIid1c2Ugc3RyaWN0JztcblxuLy8gU2VlIGh0dHA6Ly93d3cucm9idmFuZGVyd291ZGUuY29tL2VzY2FwZWNoYXJzLnBocFxuY29uc3QgbWV0YUNoYXJzUmVnRXhwID0gLyhbKClcXF1bJSFeXCJgPD4mfDssICo/XSkvZztcblxuZnVuY3Rpb24gZXNjYXBlQ29tbWFuZChhcmcpIHtcbiAgICAvLyBFc2NhcGUgbWV0YSBjaGFyc1xuICAgIGFyZyA9IGFyZy5yZXBsYWNlKG1ldGFDaGFyc1JlZ0V4cCwgJ14kMScpO1xuXG4gICAgcmV0dXJuIGFyZztcbn1cblxuZnVuY3Rpb24gZXNjYXBlQXJndW1lbnQoYXJnLCBkb3VibGVFc2NhcGVNZXRhQ2hhcnMpIHtcbiAgICAvLyBDb252ZXJ0IHRvIHN0cmluZ1xuICAgIGFyZyA9IGAke2FyZ31gO1xuXG4gICAgLy8gQWxnb3JpdGhtIGJlbG93IGlzIGJhc2VkIG9uIGh0dHBzOi8vcW50bS5vcmcvY21kXG4gICAgLy8gSXQncyBzbGlnaHRseSBhbHRlcmVkIHRvIGRpc2FibGUgSlMgYmFja3RyYWNraW5nIHRvIGF2b2lkIGhhbmdpbmcgb24gc3BlY2lhbGx5IGNyYWZ0ZWQgaW5wdXRcbiAgICAvLyBQbGVhc2Ugc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3h5c3R1ZGlvL25vZGUtY3Jvc3Mtc3Bhd24vcHVsbC8xNjAgZm9yIG1vcmUgaW5mb3JtYXRpb25cblxuICAgIC8vIFNlcXVlbmNlIG9mIGJhY2tzbGFzaGVzIGZvbGxvd2VkIGJ5IGEgZG91YmxlIHF1b3RlOlxuICAgIC8vIGRvdWJsZSB1cCBhbGwgdGhlIGJhY2tzbGFzaGVzIGFuZCBlc2NhcGUgdGhlIGRvdWJsZSBxdW90ZVxuICAgIGFyZyA9IGFyZy5yZXBsYWNlKC8oPz0oXFxcXCs/KT8pXFwxXCIvZywgJyQxJDFcXFxcXCInKTtcblxuICAgIC8vIFNlcXVlbmNlIG9mIGJhY2tzbGFzaGVzIGZvbGxvd2VkIGJ5IHRoZSBlbmQgb2YgdGhlIHN0cmluZ1xuICAgIC8vICh3aGljaCB3aWxsIGJlY29tZSBhIGRvdWJsZSBxdW90ZSBsYXRlcik6XG4gICAgLy8gZG91YmxlIHVwIGFsbCB0aGUgYmFja3NsYXNoZXNcbiAgICBhcmcgPSBhcmcucmVwbGFjZSgvKD89KFxcXFwrPyk/KVxcMSQvLCAnJDEkMScpO1xuXG4gICAgLy8gQWxsIG90aGVyIGJhY2tzbGFzaGVzIG9jY3VyIGxpdGVyYWxseVxuXG4gICAgLy8gUXVvdGUgdGhlIHdob2xlIHRoaW5nOlxuICAgIGFyZyA9IGBcIiR7YXJnfVwiYDtcblxuICAgIC8vIEVzY2FwZSBtZXRhIGNoYXJzXG4gICAgYXJnID0gYXJnLnJlcGxhY2UobWV0YUNoYXJzUmVnRXhwLCAnXiQxJyk7XG5cbiAgICAvLyBEb3VibGUgZXNjYXBlIG1ldGEgY2hhcnMgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKGRvdWJsZUVzY2FwZU1ldGFDaGFycykge1xuICAgICAgICBhcmcgPSBhcmcucmVwbGFjZShtZXRhQ2hhcnNSZWdFeHAsICdeJDEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJnO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5jb21tYW5kID0gZXNjYXBlQ29tbWFuZDtcbm1vZHVsZS5leHBvcnRzLmFyZ3VtZW50ID0gZXNjYXBlQXJndW1lbnQ7XG4iLCAiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSAvXiMhKC4qKS87XG4iLCAiJ3VzZSBzdHJpY3QnO1xuY29uc3Qgc2hlYmFuZ1JlZ2V4ID0gcmVxdWlyZSgnc2hlYmFuZy1yZWdleCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChzdHJpbmcgPSAnJykgPT4ge1xuXHRjb25zdCBtYXRjaCA9IHN0cmluZy5tYXRjaChzaGViYW5nUmVnZXgpO1xuXG5cdGlmICghbWF0Y2gpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGNvbnN0IFtwYXRoLCBhcmd1bWVudF0gPSBtYXRjaFswXS5yZXBsYWNlKC8jISA/LywgJycpLnNwbGl0KCcgJyk7XG5cdGNvbnN0IGJpbmFyeSA9IHBhdGguc3BsaXQoJy8nKS5wb3AoKTtcblxuXHRpZiAoYmluYXJ5ID09PSAnZW52Jykge1xuXHRcdHJldHVybiBhcmd1bWVudDtcblx0fVxuXG5cdHJldHVybiBhcmd1bWVudCA/IGAke2JpbmFyeX0gJHthcmd1bWVudH1gIDogYmluYXJ5O1xufTtcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHNoZWJhbmdDb21tYW5kID0gcmVxdWlyZSgnc2hlYmFuZy1jb21tYW5kJyk7XG5cbmZ1bmN0aW9uIHJlYWRTaGViYW5nKGNvbW1hbmQpIHtcbiAgICAvLyBSZWFkIHRoZSBmaXJzdCAxNTAgYnl0ZXMgZnJvbSB0aGUgZmlsZVxuICAgIGNvbnN0IHNpemUgPSAxNTA7XG4gICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jKHNpemUpO1xuXG4gICAgbGV0IGZkO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgZmQgPSBmcy5vcGVuU3luYyhjb21tYW5kLCAncicpO1xuICAgICAgICBmcy5yZWFkU3luYyhmZCwgYnVmZmVyLCAwLCBzaXplLCAwKTtcbiAgICAgICAgZnMuY2xvc2VTeW5jKGZkKTtcbiAgICB9IGNhdGNoIChlKSB7IC8qIEVtcHR5ICovIH1cblxuICAgIC8vIEF0dGVtcHQgdG8gZXh0cmFjdCBzaGViYW5nIChudWxsIGlzIHJldHVybmVkIGlmIG5vdCBhIHNoZWJhbmcpXG4gICAgcmV0dXJuIHNoZWJhbmdDb21tYW5kKGJ1ZmZlci50b1N0cmluZygpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZWFkU2hlYmFuZztcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCByZXNvbHZlQ29tbWFuZCA9IHJlcXVpcmUoJy4vdXRpbC9yZXNvbHZlQ29tbWFuZCcpO1xuY29uc3QgZXNjYXBlID0gcmVxdWlyZSgnLi91dGlsL2VzY2FwZScpO1xuY29uc3QgcmVhZFNoZWJhbmcgPSByZXF1aXJlKCcuL3V0aWwvcmVhZFNoZWJhbmcnKTtcblxuY29uc3QgaXNXaW4gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuY29uc3QgaXNFeGVjdXRhYmxlUmVnRXhwID0gL1xcLig/OmNvbXxleGUpJC9pO1xuY29uc3QgaXNDbWRTaGltUmVnRXhwID0gL25vZGVfbW9kdWxlc1tcXFxcL10uYmluW1xcXFwvXVteXFxcXC9dK1xcLmNtZCQvaTtcblxuZnVuY3Rpb24gZGV0ZWN0U2hlYmFuZyhwYXJzZWQpIHtcbiAgICBwYXJzZWQuZmlsZSA9IHJlc29sdmVDb21tYW5kKHBhcnNlZCk7XG5cbiAgICBjb25zdCBzaGViYW5nID0gcGFyc2VkLmZpbGUgJiYgcmVhZFNoZWJhbmcocGFyc2VkLmZpbGUpO1xuXG4gICAgaWYgKHNoZWJhbmcpIHtcbiAgICAgICAgcGFyc2VkLmFyZ3MudW5zaGlmdChwYXJzZWQuZmlsZSk7XG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gc2hlYmFuZztcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZUNvbW1hbmQocGFyc2VkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyc2VkLmZpbGU7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTm9uU2hlbGwocGFyc2VkKSB7XG4gICAgaWYgKCFpc1dpbikge1xuICAgICAgICByZXR1cm4gcGFyc2VkO1xuICAgIH1cblxuICAgIC8vIERldGVjdCAmIGFkZCBzdXBwb3J0IGZvciBzaGViYW5nc1xuICAgIGNvbnN0IGNvbW1hbmRGaWxlID0gZGV0ZWN0U2hlYmFuZyhwYXJzZWQpO1xuXG4gICAgLy8gV2UgZG9uJ3QgbmVlZCBhIHNoZWxsIGlmIHRoZSBjb21tYW5kIGZpbGVuYW1lIGlzIGFuIGV4ZWN1dGFibGVcbiAgICBjb25zdCBuZWVkc1NoZWxsID0gIWlzRXhlY3V0YWJsZVJlZ0V4cC50ZXN0KGNvbW1hbmRGaWxlKTtcblxuICAgIC8vIElmIGEgc2hlbGwgaXMgcmVxdWlyZWQsIHVzZSBjbWQuZXhlIGFuZCB0YWtlIGNhcmUgb2YgZXNjYXBpbmcgZXZlcnl0aGluZyBjb3JyZWN0bHlcbiAgICAvLyBOb3RlIHRoYXQgYGZvcmNlU2hlbGxgIGlzIGFuIGhpZGRlbiBvcHRpb24gdXNlZCBvbmx5IGluIHRlc3RzXG4gICAgaWYgKHBhcnNlZC5vcHRpb25zLmZvcmNlU2hlbGwgfHwgbmVlZHNTaGVsbCkge1xuICAgICAgICAvLyBOZWVkIHRvIGRvdWJsZSBlc2NhcGUgbWV0YSBjaGFycyBpZiB0aGUgY29tbWFuZCBpcyBhIGNtZC1zaGltIGxvY2F0ZWQgaW4gYG5vZGVfbW9kdWxlcy8uYmluL2BcbiAgICAgICAgLy8gVGhlIGNtZC1zaGltIHNpbXBseSBjYWxscyBleGVjdXRlIHRoZSBwYWNrYWdlIGJpbiBmaWxlIHdpdGggTm9kZUpTLCBwcm94eWluZyBhbnkgYXJndW1lbnRcbiAgICAgICAgLy8gQmVjYXVzZSB0aGUgZXNjYXBlIG9mIG1ldGFjaGFycyB3aXRoIF4gZ2V0cyBpbnRlcnByZXRlZCB3aGVuIHRoZSBjbWQuZXhlIGlzIGZpcnN0IGNhbGxlZCxcbiAgICAgICAgLy8gd2UgbmVlZCB0byBkb3VibGUgZXNjYXBlIHRoZW1cbiAgICAgICAgY29uc3QgbmVlZHNEb3VibGVFc2NhcGVNZXRhQ2hhcnMgPSBpc0NtZFNoaW1SZWdFeHAudGVzdChjb21tYW5kRmlsZSk7XG5cbiAgICAgICAgLy8gTm9ybWFsaXplIHBvc2l4IHBhdGhzIGludG8gT1MgY29tcGF0aWJsZSBwYXRocyAoZS5nLjogZm9vL2JhciAtPiBmb29cXGJhcilcbiAgICAgICAgLy8gVGhpcyBpcyBuZWNlc3Nhcnkgb3RoZXJ3aXNlIGl0IHdpbGwgYWx3YXlzIGZhaWwgd2l0aCBFTk9FTlQgaW4gdGhvc2UgY2FzZXNcbiAgICAgICAgcGFyc2VkLmNvbW1hbmQgPSBwYXRoLm5vcm1hbGl6ZShwYXJzZWQuY29tbWFuZCk7XG5cbiAgICAgICAgLy8gRXNjYXBlIGNvbW1hbmQgJiBhcmd1bWVudHNcbiAgICAgICAgcGFyc2VkLmNvbW1hbmQgPSBlc2NhcGUuY29tbWFuZChwYXJzZWQuY29tbWFuZCk7XG4gICAgICAgIHBhcnNlZC5hcmdzID0gcGFyc2VkLmFyZ3MubWFwKChhcmcpID0+IGVzY2FwZS5hcmd1bWVudChhcmcsIG5lZWRzRG91YmxlRXNjYXBlTWV0YUNoYXJzKSk7XG5cbiAgICAgICAgY29uc3Qgc2hlbGxDb21tYW5kID0gW3BhcnNlZC5jb21tYW5kXS5jb25jYXQocGFyc2VkLmFyZ3MpLmpvaW4oJyAnKTtcblxuICAgICAgICBwYXJzZWQuYXJncyA9IFsnL2QnLCAnL3MnLCAnL2MnLCBgXCIke3NoZWxsQ29tbWFuZH1cImBdO1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IHByb2Nlc3MuZW52LmNvbXNwZWMgfHwgJ2NtZC5leGUnO1xuICAgICAgICBwYXJzZWQub3B0aW9ucy53aW5kb3dzVmVyYmF0aW1Bcmd1bWVudHMgPSB0cnVlOyAvLyBUZWxsIG5vZGUncyBzcGF3biB0aGF0IHRoZSBhcmd1bWVudHMgYXJlIGFscmVhZHkgZXNjYXBlZFxuICAgIH1cblxuICAgIHJldHVybiBwYXJzZWQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBOb3JtYWxpemUgYXJndW1lbnRzLCBzaW1pbGFyIHRvIG5vZGVqc1xuICAgIGlmIChhcmdzICYmICFBcnJheS5pc0FycmF5KGFyZ3MpKSB7XG4gICAgICAgIG9wdGlvbnMgPSBhcmdzO1xuICAgICAgICBhcmdzID0gbnVsbDtcbiAgICB9XG5cbiAgICBhcmdzID0gYXJncyA/IGFyZ3Muc2xpY2UoMCkgOiBbXTsgLy8gQ2xvbmUgYXJyYXkgdG8gYXZvaWQgY2hhbmdpbmcgdGhlIG9yaWdpbmFsXG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMpOyAvLyBDbG9uZSBvYmplY3QgdG8gYXZvaWQgY2hhbmdpbmcgdGhlIG9yaWdpbmFsXG5cbiAgICAvLyBCdWlsZCBvdXIgcGFyc2VkIG9iamVjdFxuICAgIGNvbnN0IHBhcnNlZCA9IHtcbiAgICAgICAgY29tbWFuZCxcbiAgICAgICAgYXJncyxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgZmlsZTogdW5kZWZpbmVkLFxuICAgICAgICBvcmlnaW5hbDoge1xuICAgICAgICAgICAgY29tbWFuZCxcbiAgICAgICAgICAgIGFyZ3MsXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIC8vIERlbGVnYXRlIGZ1cnRoZXIgcGFyc2luZyB0byBzaGVsbCBvciBub24tc2hlbGxcbiAgICByZXR1cm4gb3B0aW9ucy5zaGVsbCA/IHBhcnNlZCA6IHBhcnNlTm9uU2hlbGwocGFyc2VkKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGlzV2luID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJztcblxuZnVuY3Rpb24gbm90Rm91bmRFcnJvcihvcmlnaW5hbCwgc3lzY2FsbCkge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyBFcnJvcihgJHtzeXNjYWxsfSAke29yaWdpbmFsLmNvbW1hbmR9IEVOT0VOVGApLCB7XG4gICAgICAgIGNvZGU6ICdFTk9FTlQnLFxuICAgICAgICBlcnJubzogJ0VOT0VOVCcsXG4gICAgICAgIHN5c2NhbGw6IGAke3N5c2NhbGx9ICR7b3JpZ2luYWwuY29tbWFuZH1gLFxuICAgICAgICBwYXRoOiBvcmlnaW5hbC5jb21tYW5kLFxuICAgICAgICBzcGF3bmFyZ3M6IG9yaWdpbmFsLmFyZ3MsXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGhvb2tDaGlsZFByb2Nlc3MoY3AsIHBhcnNlZCkge1xuICAgIGlmICghaXNXaW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG9yaWdpbmFsRW1pdCA9IGNwLmVtaXQ7XG5cbiAgICBjcC5lbWl0ID0gZnVuY3Rpb24gKG5hbWUsIGFyZzEpIHtcbiAgICAgICAgLy8gSWYgZW1pdHRpbmcgXCJleGl0XCIgZXZlbnQgYW5kIGV4aXQgY29kZSBpcyAxLCB3ZSBuZWVkIHRvIGNoZWNrIGlmXG4gICAgICAgIC8vIHRoZSBjb21tYW5kIGV4aXN0cyBhbmQgZW1pdCBhbiBcImVycm9yXCIgaW5zdGVhZFxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgICAgICBpZiAobmFtZSA9PT0gJ2V4aXQnKSB7XG4gICAgICAgICAgICBjb25zdCBlcnIgPSB2ZXJpZnlFTk9FTlQoYXJnMSwgcGFyc2VkKTtcblxuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbEVtaXQuY2FsbChjcCwgJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcmlnaW5hbEVtaXQuYXBwbHkoY3AsIGFyZ3VtZW50cyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcHJlZmVyLXJlc3QtcGFyYW1zXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gdmVyaWZ5RU5PRU5UKHN0YXR1cywgcGFyc2VkKSB7XG4gICAgaWYgKGlzV2luICYmIHN0YXR1cyA9PT0gMSAmJiAhcGFyc2VkLmZpbGUpIHtcbiAgICAgICAgcmV0dXJuIG5vdEZvdW5kRXJyb3IocGFyc2VkLm9yaWdpbmFsLCAnc3Bhd24nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gdmVyaWZ5RU5PRU5UU3luYyhzdGF0dXMsIHBhcnNlZCkge1xuICAgIGlmIChpc1dpbiAmJiBzdGF0dXMgPT09IDEgJiYgIXBhcnNlZC5maWxlKSB7XG4gICAgICAgIHJldHVybiBub3RGb3VuZEVycm9yKHBhcnNlZC5vcmlnaW5hbCwgJ3NwYXduU3luYycpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBob29rQ2hpbGRQcm9jZXNzLFxuICAgIHZlcmlmeUVOT0VOVCxcbiAgICB2ZXJpZnlFTk9FTlRTeW5jLFxuICAgIG5vdEZvdW5kRXJyb3IsXG59O1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgY3AgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XG5jb25zdCBwYXJzZSA9IHJlcXVpcmUoJy4vbGliL3BhcnNlJyk7XG5jb25zdCBlbm9lbnQgPSByZXF1aXJlKCcuL2xpYi9lbm9lbnQnKTtcblxuZnVuY3Rpb24gc3Bhd24oY29tbWFuZCwgYXJncywgb3B0aW9ucykge1xuICAgIC8vIFBhcnNlIHRoZSBhcmd1bWVudHNcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZShjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcblxuICAgIC8vIFNwYXduIHRoZSBjaGlsZCBwcm9jZXNzXG4gICAgY29uc3Qgc3Bhd25lZCA9IGNwLnNwYXduKHBhcnNlZC5jb21tYW5kLCBwYXJzZWQuYXJncywgcGFyc2VkLm9wdGlvbnMpO1xuXG4gICAgLy8gSG9vayBpbnRvIGNoaWxkIHByb2Nlc3MgXCJleGl0XCIgZXZlbnQgdG8gZW1pdCBhbiBlcnJvciBpZiB0aGUgY29tbWFuZFxuICAgIC8vIGRvZXMgbm90IGV4aXN0cywgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vSW5kaWdvVW5pdGVkL25vZGUtY3Jvc3Mtc3Bhd24vaXNzdWVzLzE2XG4gICAgZW5vZW50Lmhvb2tDaGlsZFByb2Nlc3Moc3Bhd25lZCwgcGFyc2VkKTtcblxuICAgIHJldHVybiBzcGF3bmVkO1xufVxuXG5mdW5jdGlvbiBzcGF3blN5bmMoY29tbWFuZCwgYXJncywgb3B0aW9ucykge1xuICAgIC8vIFBhcnNlIHRoZSBhcmd1bWVudHNcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZShjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcblxuICAgIC8vIFNwYXduIHRoZSBjaGlsZCBwcm9jZXNzXG4gICAgY29uc3QgcmVzdWx0ID0gY3Auc3Bhd25TeW5jKHBhcnNlZC5jb21tYW5kLCBwYXJzZWQuYXJncywgcGFyc2VkLm9wdGlvbnMpO1xuXG4gICAgLy8gQW5hbHl6ZSBpZiB0aGUgY29tbWFuZCBkb2VzIG5vdCBleGlzdCwgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vSW5kaWdvVW5pdGVkL25vZGUtY3Jvc3Mtc3Bhd24vaXNzdWVzLzE2XG4gICAgcmVzdWx0LmVycm9yID0gcmVzdWx0LmVycm9yIHx8IGVub2VudC52ZXJpZnlFTk9FTlRTeW5jKHJlc3VsdC5zdGF0dXMsIHBhcnNlZCk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNwYXduO1xubW9kdWxlLmV4cG9ydHMuc3Bhd24gPSBzcGF3bjtcbm1vZHVsZS5leHBvcnRzLnN5bmMgPSBzcGF3blN5bmM7XG5cbm1vZHVsZS5leHBvcnRzLl9wYXJzZSA9IHBhcnNlO1xubW9kdWxlLmV4cG9ydHMuX2Vub2VudCA9IGVub2VudDtcbiIsICIvLyBUaGlzIGlzIG5vdCB0aGUgc2V0IG9mIGFsbCBwb3NzaWJsZSBzaWduYWxzLlxuLy9cbi8vIEl0IElTLCBob3dldmVyLCB0aGUgc2V0IG9mIGFsbCBzaWduYWxzIHRoYXQgdHJpZ2dlclxuLy8gYW4gZXhpdCBvbiBlaXRoZXIgTGludXggb3IgQlNEIHN5c3RlbXMuICBMaW51eCBpcyBhXG4vLyBzdXBlcnNldCBvZiB0aGUgc2lnbmFsIG5hbWVzIHN1cHBvcnRlZCBvbiBCU0QsIGFuZFxuLy8gdGhlIHVua25vd24gc2lnbmFscyBqdXN0IGZhaWwgdG8gcmVnaXN0ZXIsIHNvIHdlIGNhblxuLy8gY2F0Y2ggdGhhdCBlYXNpbHkgZW5vdWdoLlxuLy9cbi8vIERvbid0IGJvdGhlciB3aXRoIFNJR0tJTEwuICBJdCdzIHVuY2F0Y2hhYmxlLCB3aGljaFxuLy8gbWVhbnMgdGhhdCB3ZSBjYW4ndCBmaXJlIGFueSBjYWxsYmFja3MgYW55d2F5LlxuLy9cbi8vIElmIGEgdXNlciBkb2VzIGhhcHBlbiB0byByZWdpc3RlciBhIGhhbmRsZXIgb24gYSBub24tXG4vLyBmYXRhbCBzaWduYWwgbGlrZSBTSUdXSU5DSCBvciBzb21ldGhpbmcsIGFuZCB0aGVuXG4vLyBleGl0LCBpdCdsbCBlbmQgdXAgZmlyaW5nIGBwcm9jZXNzLmVtaXQoJ2V4aXQnKWAsIHNvXG4vLyB0aGUgaGFuZGxlciB3aWxsIGJlIGZpcmVkIGFueXdheS5cbi8vXG4vLyBTSUdCVVMsIFNJR0ZQRSwgU0lHU0VHViBhbmQgU0lHSUxMLCB3aGVuIG5vdCByYWlzZWRcbi8vIGFydGlmaWNpYWxseSwgaW5oZXJlbnRseSBsZWF2ZSB0aGUgcHJvY2VzcyBpbiBhXG4vLyBzdGF0ZSBmcm9tIHdoaWNoIGl0IGlzIG5vdCBzYWZlIHRvIHRyeSBhbmQgZW50ZXIgSlNcbi8vIGxpc3RlbmVycy5cbm1vZHVsZS5leHBvcnRzID0gW1xuICAnU0lHQUJSVCcsXG4gICdTSUdBTFJNJyxcbiAgJ1NJR0hVUCcsXG4gICdTSUdJTlQnLFxuICAnU0lHVEVSTSdcbl1cblxuaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICd3aW4zMicpIHtcbiAgbW9kdWxlLmV4cG9ydHMucHVzaChcbiAgICAnU0lHVlRBTFJNJyxcbiAgICAnU0lHWENQVScsXG4gICAgJ1NJR1hGU1onLFxuICAgICdTSUdVU1IyJyxcbiAgICAnU0lHVFJBUCcsXG4gICAgJ1NJR1NZUycsXG4gICAgJ1NJR1FVSVQnLFxuICAgICdTSUdJT1QnXG4gICAgLy8gc2hvdWxkIGRldGVjdCBwcm9maWxlciBhbmQgZW5hYmxlL2Rpc2FibGUgYWNjb3JkaW5nbHkuXG4gICAgLy8gc2VlICMyMVxuICAgIC8vICdTSUdQUk9GJ1xuICApXG59XG5cbmlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnbGludXgnKSB7XG4gIG1vZHVsZS5leHBvcnRzLnB1c2goXG4gICAgJ1NJR0lPJyxcbiAgICAnU0lHUE9MTCcsXG4gICAgJ1NJR1BXUicsXG4gICAgJ1NJR1NUS0ZMVCcsXG4gICAgJ1NJR1VOVVNFRCdcbiAgKVxufVxuIiwgIi8vIE5vdGU6IHNpbmNlIG55YyB1c2VzIHRoaXMgbW9kdWxlIHRvIG91dHB1dCBjb3ZlcmFnZSwgYW55IGxpbmVzXG4vLyB0aGF0IGFyZSBpbiB0aGUgZGlyZWN0IHN5bmMgZmxvdyBvZiBueWMncyBvdXRwdXRDb3ZlcmFnZSBhcmVcbi8vIGlnbm9yZWQsIHNpbmNlIHdlIGNhbiBuZXZlciBnZXQgY292ZXJhZ2UgZm9yIHRoZW0uXG4vLyBncmFiIGEgcmVmZXJlbmNlIHRvIG5vZGUncyByZWFsIHByb2Nlc3Mgb2JqZWN0IHJpZ2h0IGF3YXlcbnZhciBwcm9jZXNzID0gZ2xvYmFsLnByb2Nlc3NcblxuY29uc3QgcHJvY2Vzc09rID0gZnVuY3Rpb24gKHByb2Nlc3MpIHtcbiAgcmV0dXJuIHByb2Nlc3MgJiZcbiAgICB0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLmVtaXQgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5yZWFsbHlFeGl0ID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3MubGlzdGVuZXJzID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3Mua2lsbCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLnBpZCA9PT0gJ251bWJlcicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5vbiA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG4vLyBzb21lIGtpbmQgb2Ygbm9uLW5vZGUgZW52aXJvbm1lbnQsIGp1c3Qgbm8tb3Bcbi8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuaWYgKCFwcm9jZXNzT2socHJvY2VzcykpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHt9XG4gIH1cbn0gZWxzZSB7XG4gIHZhciBhc3NlcnQgPSByZXF1aXJlKCdhc3NlcnQnKVxuICB2YXIgc2lnbmFscyA9IHJlcXVpcmUoJy4vc2lnbmFscy5qcycpXG4gIHZhciBpc1dpbiA9IC9ed2luL2kudGVzdChwcm9jZXNzLnBsYXRmb3JtKVxuXG4gIHZhciBFRSA9IHJlcXVpcmUoJ2V2ZW50cycpXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAodHlwZW9mIEVFICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgRUUgPSBFRS5FdmVudEVtaXR0ZXJcbiAgfVxuXG4gIHZhciBlbWl0dGVyXG4gIGlmIChwcm9jZXNzLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fKSB7XG4gICAgZW1pdHRlciA9IHByb2Nlc3MuX19zaWduYWxfZXhpdF9lbWl0dGVyX19cbiAgfSBlbHNlIHtcbiAgICBlbWl0dGVyID0gcHJvY2Vzcy5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfXyA9IG5ldyBFRSgpXG4gICAgZW1pdHRlci5jb3VudCA9IDBcbiAgICBlbWl0dGVyLmVtaXR0ZWQgPSB7fVxuICB9XG5cbiAgLy8gQmVjYXVzZSB0aGlzIGVtaXR0ZXIgaXMgYSBnbG9iYWwsIHdlIGhhdmUgdG8gY2hlY2sgdG8gc2VlIGlmIGFcbiAgLy8gcHJldmlvdXMgdmVyc2lvbiBvZiB0aGlzIGxpYnJhcnkgZmFpbGVkIHRvIGVuYWJsZSBpbmZpbml0ZSBsaXN0ZW5lcnMuXG4gIC8vIEkga25vdyB3aGF0IHlvdSdyZSBhYm91dCB0byBzYXkuICBCdXQgbGl0ZXJhbGx5IGV2ZXJ5dGhpbmcgYWJvdXRcbiAgLy8gc2lnbmFsLWV4aXQgaXMgYSBjb21wcm9taXNlIHdpdGggZXZpbC4gIEdldCB1c2VkIHRvIGl0LlxuICBpZiAoIWVtaXR0ZXIuaW5maW5pdGUpIHtcbiAgICBlbWl0dGVyLnNldE1heExpc3RlbmVycyhJbmZpbml0eSlcbiAgICBlbWl0dGVyLmluZmluaXRlID0gdHJ1ZVxuICB9XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2IsIG9wdHMpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7fVxuICAgIH1cbiAgICBhc3NlcnQuZXF1YWwodHlwZW9mIGNiLCAnZnVuY3Rpb24nLCAnYSBjYWxsYmFjayBtdXN0IGJlIHByb3ZpZGVkIGZvciBleGl0IGhhbmRsZXInKVxuXG4gICAgaWYgKGxvYWRlZCA9PT0gZmFsc2UpIHtcbiAgICAgIGxvYWQoKVxuICAgIH1cblxuICAgIHZhciBldiA9ICdleGl0J1xuICAgIGlmIChvcHRzICYmIG9wdHMuYWx3YXlzTGFzdCkge1xuICAgICAgZXYgPSAnYWZ0ZXJleGl0J1xuICAgIH1cblxuICAgIHZhciByZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKGV2LCBjYilcbiAgICAgIGlmIChlbWl0dGVyLmxpc3RlbmVycygnZXhpdCcpLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgIGVtaXR0ZXIubGlzdGVuZXJzKCdhZnRlcmV4aXQnKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdW5sb2FkKClcbiAgICAgIH1cbiAgICB9XG4gICAgZW1pdHRlci5vbihldiwgY2IpXG5cbiAgICByZXR1cm4gcmVtb3ZlXG4gIH1cblxuICB2YXIgdW5sb2FkID0gZnVuY3Rpb24gdW5sb2FkICgpIHtcbiAgICBpZiAoIWxvYWRlZCB8fCAhcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxvYWRlZCA9IGZhbHNlXG5cbiAgICBzaWduYWxzLmZvckVhY2goZnVuY3Rpb24gKHNpZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcHJvY2Vzcy5yZW1vdmVMaXN0ZW5lcihzaWcsIHNpZ0xpc3RlbmVyc1tzaWddKVxuICAgICAgfSBjYXRjaCAoZXIpIHt9XG4gICAgfSlcbiAgICBwcm9jZXNzLmVtaXQgPSBvcmlnaW5hbFByb2Nlc3NFbWl0XG4gICAgcHJvY2Vzcy5yZWFsbHlFeGl0ID0gb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdFxuICAgIGVtaXR0ZXIuY291bnQgLT0gMVxuICB9XG4gIG1vZHVsZS5leHBvcnRzLnVubG9hZCA9IHVubG9hZFxuXG4gIHZhciBlbWl0ID0gZnVuY3Rpb24gZW1pdCAoZXZlbnQsIGNvZGUsIHNpZ25hbCkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChlbWl0dGVyLmVtaXR0ZWRbZXZlbnRdKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZW1pdHRlci5lbWl0dGVkW2V2ZW50XSA9IHRydWVcbiAgICBlbWl0dGVyLmVtaXQoZXZlbnQsIGNvZGUsIHNpZ25hbClcbiAgfVxuXG4gIC8vIHsgPHNpZ25hbD46IDxsaXN0ZW5lciBmbj4sIC4uLiB9XG4gIHZhciBzaWdMaXN0ZW5lcnMgPSB7fVxuICBzaWduYWxzLmZvckVhY2goZnVuY3Rpb24gKHNpZykge1xuICAgIHNpZ0xpc3RlbmVyc1tzaWddID0gZnVuY3Rpb24gbGlzdGVuZXIgKCkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gb3RoZXIgbGlzdGVuZXJzLCBhbiBleGl0IGlzIGNvbWluZyFcbiAgICAgIC8vIFNpbXBsZXN0IHdheTogcmVtb3ZlIHVzIGFuZCB0aGVuIHJlLXNlbmQgdGhlIHNpZ25hbC5cbiAgICAgIC8vIFdlIGtub3cgdGhhdCB0aGlzIHdpbGwga2lsbCB0aGUgcHJvY2Vzcywgc28gd2UgY2FuXG4gICAgICAvLyBzYWZlbHkgZW1pdCBub3cuXG4gICAgICB2YXIgbGlzdGVuZXJzID0gcHJvY2Vzcy5saXN0ZW5lcnMoc2lnKVxuICAgICAgaWYgKGxpc3RlbmVycy5sZW5ndGggPT09IGVtaXR0ZXIuY291bnQpIHtcbiAgICAgICAgdW5sb2FkKClcbiAgICAgICAgZW1pdCgnZXhpdCcsIG51bGwsIHNpZylcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZW1pdCgnYWZ0ZXJleGl0JywgbnVsbCwgc2lnKVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBpZiAoaXNXaW4gJiYgc2lnID09PSAnU0lHSFVQJykge1xuICAgICAgICAgIC8vIFwiU0lHSFVQXCIgdGhyb3dzIGFuIGBFTk9TWVNgIGVycm9yIG9uIFdpbmRvd3MsXG4gICAgICAgICAgLy8gc28gdXNlIGEgc3VwcG9ydGVkIHNpZ25hbCBpbnN0ZWFkXG4gICAgICAgICAgc2lnID0gJ1NJR0lOVCdcbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBwcm9jZXNzLmtpbGwocHJvY2Vzcy5waWQsIHNpZylcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgbW9kdWxlLmV4cG9ydHMuc2lnbmFscyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gc2lnbmFsc1xuICB9XG5cbiAgdmFyIGxvYWRlZCA9IGZhbHNlXG5cbiAgdmFyIGxvYWQgPSBmdW5jdGlvbiBsb2FkICgpIHtcbiAgICBpZiAobG9hZGVkIHx8ICFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbG9hZGVkID0gdHJ1ZVxuXG4gICAgLy8gVGhpcyBpcyB0aGUgbnVtYmVyIG9mIG9uU2lnbmFsRXhpdCdzIHRoYXQgYXJlIGluIHBsYXkuXG4gICAgLy8gSXQncyBpbXBvcnRhbnQgc28gdGhhdCB3ZSBjYW4gY291bnQgdGhlIGNvcnJlY3QgbnVtYmVyIG9mXG4gICAgLy8gbGlzdGVuZXJzIG9uIHNpZ25hbHMsIGFuZCBkb24ndCB3YWl0IGZvciB0aGUgb3RoZXIgb25lIHRvXG4gICAgLy8gaGFuZGxlIGl0IGluc3RlYWQgb2YgdXMuXG4gICAgZW1pdHRlci5jb3VudCArPSAxXG5cbiAgICBzaWduYWxzID0gc2lnbmFscy5maWx0ZXIoZnVuY3Rpb24gKHNpZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcHJvY2Vzcy5vbihzaWcsIHNpZ0xpc3RlbmVyc1tzaWddKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHByb2Nlc3MuZW1pdCA9IHByb2Nlc3NFbWl0XG4gICAgcHJvY2Vzcy5yZWFsbHlFeGl0ID0gcHJvY2Vzc1JlYWxseUV4aXRcbiAgfVxuICBtb2R1bGUuZXhwb3J0cy5sb2FkID0gbG9hZFxuXG4gIHZhciBvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0ID0gcHJvY2Vzcy5yZWFsbHlFeGl0XG4gIHZhciBwcm9jZXNzUmVhbGx5RXhpdCA9IGZ1bmN0aW9uIHByb2Nlc3NSZWFsbHlFeGl0IChjb2RlKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgcHJvY2Vzcy5leGl0Q29kZSA9IGNvZGUgfHwgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gMFxuICAgIGVtaXQoJ2V4aXQnLCBwcm9jZXNzLmV4aXRDb2RlLCBudWxsKVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZW1pdCgnYWZ0ZXJleGl0JywgcHJvY2Vzcy5leGl0Q29kZSwgbnVsbClcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIG9yaWdpbmFsUHJvY2Vzc1JlYWxseUV4aXQuY2FsbChwcm9jZXNzLCBwcm9jZXNzLmV4aXRDb2RlKVxuICB9XG5cbiAgdmFyIG9yaWdpbmFsUHJvY2Vzc0VtaXQgPSBwcm9jZXNzLmVtaXRcbiAgdmFyIHByb2Nlc3NFbWl0ID0gZnVuY3Rpb24gcHJvY2Vzc0VtaXQgKGV2LCBhcmcpIHtcbiAgICBpZiAoZXYgPT09ICdleGl0JyAmJiBwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgaWYgKGFyZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSBhcmdcbiAgICAgIH1cbiAgICAgIHZhciByZXQgPSBvcmlnaW5hbFByb2Nlc3NFbWl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICBlbWl0KCdleGl0JywgcHJvY2Vzcy5leGl0Q29kZSwgbnVsbClcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICBlbWl0KCdhZnRlcmV4aXQnLCBwcm9jZXNzLmV4aXRDb2RlLCBudWxsKVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHJldHVybiByZXRcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9yaWdpbmFsUHJvY2Vzc0VtaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIH1cbiAgfVxufVxuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IHtQYXNzVGhyb3VnaDogUGFzc1Rocm91Z2hTdHJlYW19ID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gb3B0aW9ucyA9PiB7XG5cdG9wdGlvbnMgPSB7Li4ub3B0aW9uc307XG5cblx0Y29uc3Qge2FycmF5fSA9IG9wdGlvbnM7XG5cdGxldCB7ZW5jb2Rpbmd9ID0gb3B0aW9ucztcblx0Y29uc3QgaXNCdWZmZXIgPSBlbmNvZGluZyA9PT0gJ2J1ZmZlcic7XG5cdGxldCBvYmplY3RNb2RlID0gZmFsc2U7XG5cblx0aWYgKGFycmF5KSB7XG5cdFx0b2JqZWN0TW9kZSA9ICEoZW5jb2RpbmcgfHwgaXNCdWZmZXIpO1xuXHR9IGVsc2Uge1xuXHRcdGVuY29kaW5nID0gZW5jb2RpbmcgfHwgJ3V0ZjgnO1xuXHR9XG5cblx0aWYgKGlzQnVmZmVyKSB7XG5cdFx0ZW5jb2RpbmcgPSBudWxsO1xuXHR9XG5cblx0Y29uc3Qgc3RyZWFtID0gbmV3IFBhc3NUaHJvdWdoU3RyZWFtKHtvYmplY3RNb2RlfSk7XG5cblx0aWYgKGVuY29kaW5nKSB7XG5cdFx0c3RyZWFtLnNldEVuY29kaW5nKGVuY29kaW5nKTtcblx0fVxuXG5cdGxldCBsZW5ndGggPSAwO1xuXHRjb25zdCBjaHVua3MgPSBbXTtcblxuXHRzdHJlYW0ub24oJ2RhdGEnLCBjaHVuayA9PiB7XG5cdFx0Y2h1bmtzLnB1c2goY2h1bmspO1xuXG5cdFx0aWYgKG9iamVjdE1vZGUpIHtcblx0XHRcdGxlbmd0aCA9IGNodW5rcy5sZW5ndGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxlbmd0aCArPSBjaHVuay5sZW5ndGg7XG5cdFx0fVxuXHR9KTtcblxuXHRzdHJlYW0uZ2V0QnVmZmVyZWRWYWx1ZSA9ICgpID0+IHtcblx0XHRpZiAoYXJyYXkpIHtcblx0XHRcdHJldHVybiBjaHVua3M7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlzQnVmZmVyID8gQnVmZmVyLmNvbmNhdChjaHVua3MsIGxlbmd0aCkgOiBjaHVua3Muam9pbignJyk7XG5cdH07XG5cblx0c3RyZWFtLmdldEJ1ZmZlcmVkTGVuZ3RoID0gKCkgPT4gbGVuZ3RoO1xuXG5cdHJldHVybiBzdHJlYW07XG59O1xuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IHtjb25zdGFudHM6IEJ1ZmZlckNvbnN0YW50c30gPSByZXF1aXJlKCdidWZmZXInKTtcbmNvbnN0IHN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuY29uc3Qge3Byb21pc2lmeX0gPSByZXF1aXJlKCd1dGlsJyk7XG5jb25zdCBidWZmZXJTdHJlYW0gPSByZXF1aXJlKCcuL2J1ZmZlci1zdHJlYW0nKTtcblxuY29uc3Qgc3RyZWFtUGlwZWxpbmVQcm9taXNpZmllZCA9IHByb21pc2lmeShzdHJlYW0ucGlwZWxpbmUpO1xuXG5jbGFzcyBNYXhCdWZmZXJFcnJvciBleHRlbmRzIEVycm9yIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoJ21heEJ1ZmZlciBleGNlZWRlZCcpO1xuXHRcdHRoaXMubmFtZSA9ICdNYXhCdWZmZXJFcnJvcic7XG5cdH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3RyZWFtKGlucHV0U3RyZWFtLCBvcHRpb25zKSB7XG5cdGlmICghaW5wdXRTdHJlYW0pIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGEgc3RyZWFtJyk7XG5cdH1cblxuXHRvcHRpb25zID0ge1xuXHRcdG1heEJ1ZmZlcjogSW5maW5pdHksXG5cdFx0Li4ub3B0aW9uc1xuXHR9O1xuXG5cdGNvbnN0IHttYXhCdWZmZXJ9ID0gb3B0aW9ucztcblx0Y29uc3Qgc3RyZWFtID0gYnVmZmVyU3RyZWFtKG9wdGlvbnMpO1xuXG5cdGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRjb25zdCByZWplY3RQcm9taXNlID0gZXJyb3IgPT4ge1xuXHRcdFx0Ly8gRG9uJ3QgcmV0cmlldmUgYW4gb3ZlcnNpemVkIGJ1ZmZlci5cblx0XHRcdGlmIChlcnJvciAmJiBzdHJlYW0uZ2V0QnVmZmVyZWRMZW5ndGgoKSA8PSBCdWZmZXJDb25zdGFudHMuTUFYX0xFTkdUSCkge1xuXHRcdFx0XHRlcnJvci5idWZmZXJlZERhdGEgPSBzdHJlYW0uZ2V0QnVmZmVyZWRWYWx1ZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdH07XG5cblx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0YXdhaXQgc3RyZWFtUGlwZWxpbmVQcm9taXNpZmllZChpbnB1dFN0cmVhbSwgc3RyZWFtKTtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0cmVqZWN0UHJvbWlzZShlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSkoKTtcblxuXHRcdHN0cmVhbS5vbignZGF0YScsICgpID0+IHtcblx0XHRcdGlmIChzdHJlYW0uZ2V0QnVmZmVyZWRMZW5ndGgoKSA+IG1heEJ1ZmZlcikge1xuXHRcdFx0XHRyZWplY3RQcm9taXNlKG5ldyBNYXhCdWZmZXJFcnJvcigpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHN0cmVhbS5nZXRCdWZmZXJlZFZhbHVlKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3RyZWFtO1xubW9kdWxlLmV4cG9ydHMuYnVmZmVyID0gKHN0cmVhbSwgb3B0aW9ucykgPT4gZ2V0U3RyZWFtKHN0cmVhbSwgey4uLm9wdGlvbnMsIGVuY29kaW5nOiAnYnVmZmVyJ30pO1xubW9kdWxlLmV4cG9ydHMuYXJyYXkgPSAoc3RyZWFtLCBvcHRpb25zKSA9PiBnZXRTdHJlYW0oc3RyZWFtLCB7Li4ub3B0aW9ucywgYXJyYXk6IHRydWV9KTtcbm1vZHVsZS5leHBvcnRzLk1heEJ1ZmZlckVycm9yID0gTWF4QnVmZmVyRXJyb3I7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCB7IFBhc3NUaHJvdWdoIH0gPSByZXF1aXJlKCdzdHJlYW0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoLypzdHJlYW1zLi4uKi8pIHtcbiAgdmFyIHNvdXJjZXMgPSBbXVxuICB2YXIgb3V0cHV0ICA9IG5ldyBQYXNzVGhyb3VnaCh7b2JqZWN0TW9kZTogdHJ1ZX0pXG5cbiAgb3V0cHV0LnNldE1heExpc3RlbmVycygwKVxuXG4gIG91dHB1dC5hZGQgPSBhZGRcbiAgb3V0cHV0LmlzRW1wdHkgPSBpc0VtcHR5XG5cbiAgb3V0cHV0Lm9uKCd1bnBpcGUnLCByZW1vdmUpXG5cbiAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5mb3JFYWNoKGFkZClcblxuICByZXR1cm4gb3V0cHV0XG5cbiAgZnVuY3Rpb24gYWRkIChzb3VyY2UpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICBzb3VyY2UuZm9yRWFjaChhZGQpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIHNvdXJjZXMucHVzaChzb3VyY2UpO1xuICAgIHNvdXJjZS5vbmNlKCdlbmQnLCByZW1vdmUuYmluZChudWxsLCBzb3VyY2UpKVxuICAgIHNvdXJjZS5vbmNlKCdlcnJvcicsIG91dHB1dC5lbWl0LmJpbmQob3V0cHV0LCAnZXJyb3InKSlcbiAgICBzb3VyY2UucGlwZShvdXRwdXQsIHtlbmQ6IGZhbHNlfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZnVuY3Rpb24gaXNFbXB0eSAoKSB7XG4gICAgcmV0dXJuIHNvdXJjZXMubGVuZ3RoID09IDA7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUgKHNvdXJjZSkge1xuICAgIHNvdXJjZXMgPSBzb3VyY2VzLmZpbHRlcihmdW5jdGlvbiAoaXQpIHsgcmV0dXJuIGl0ICE9PSBzb3VyY2UgfSlcbiAgICBpZiAoIXNvdXJjZXMubGVuZ3RoICYmIG91dHB1dC5yZWFkYWJsZSkgeyBvdXRwdXQuZW5kKCkgfVxuICB9XG59XG4iLCAiLyoqXG4gKiBAbGljZW5zZSBub2RlLXN0cmVhbS16aXAgfCAoYykgMjAyMCBBbnRlbGxlIHwgaHR0cHM6Ly9naXRodWIuY29tL2FudGVsbGUvbm9kZS1zdHJlYW0temlwL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqIFBvcnRpb25zIGNvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vY3RoYWNrZXJzL2FkbS16aXAgfCBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vY3RoYWNrZXJzL2FkbS16aXAvbWFzdGVyL0xJQ0VOU0VcbiAqL1xuXG5sZXQgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBldmVudHMgPSByZXF1aXJlKCdldmVudHMnKTtcbmNvbnN0IHpsaWIgPSByZXF1aXJlKCd6bGliJyk7XG5jb25zdCBzdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcblxuY29uc3QgY29uc3RzID0ge1xuICAgIC8qIFRoZSBsb2NhbCBmaWxlIGhlYWRlciAqL1xuICAgIExPQ0hEUjogMzAsIC8vIExPQyBoZWFkZXIgc2l6ZVxuICAgIExPQ1NJRzogMHgwNDAzNGI1MCwgLy8gXCJQS1xcMDAzXFwwMDRcIlxuICAgIExPQ1ZFUjogNCwgLy8gdmVyc2lvbiBuZWVkZWQgdG8gZXh0cmFjdFxuICAgIExPQ0ZMRzogNiwgLy8gZ2VuZXJhbCBwdXJwb3NlIGJpdCBmbGFnXG4gICAgTE9DSE9XOiA4LCAvLyBjb21wcmVzc2lvbiBtZXRob2RcbiAgICBMT0NUSU06IDEwLCAvLyBtb2RpZmljYXRpb24gdGltZSAoMiBieXRlcyB0aW1lLCAyIGJ5dGVzIGRhdGUpXG4gICAgTE9DQ1JDOiAxNCwgLy8gdW5jb21wcmVzc2VkIGZpbGUgY3JjLTMyIHZhbHVlXG4gICAgTE9DU0laOiAxOCwgLy8gY29tcHJlc3NlZCBzaXplXG4gICAgTE9DTEVOOiAyMiwgLy8gdW5jb21wcmVzc2VkIHNpemVcbiAgICBMT0NOQU06IDI2LCAvLyBmaWxlbmFtZSBsZW5ndGhcbiAgICBMT0NFWFQ6IDI4LCAvLyBleHRyYSBmaWVsZCBsZW5ndGhcblxuICAgIC8qIFRoZSBEYXRhIGRlc2NyaXB0b3IgKi9cbiAgICBFWFRTSUc6IDB4MDgwNzRiNTAsIC8vIFwiUEtcXDAwN1xcMDA4XCJcbiAgICBFWFRIRFI6IDE2LCAvLyBFWFQgaGVhZGVyIHNpemVcbiAgICBFWFRDUkM6IDQsIC8vIHVuY29tcHJlc3NlZCBmaWxlIGNyYy0zMiB2YWx1ZVxuICAgIEVYVFNJWjogOCwgLy8gY29tcHJlc3NlZCBzaXplXG4gICAgRVhUTEVOOiAxMiwgLy8gdW5jb21wcmVzc2VkIHNpemVcblxuICAgIC8qIFRoZSBjZW50cmFsIGRpcmVjdG9yeSBmaWxlIGhlYWRlciAqL1xuICAgIENFTkhEUjogNDYsIC8vIENFTiBoZWFkZXIgc2l6ZVxuICAgIENFTlNJRzogMHgwMjAxNGI1MCwgLy8gXCJQS1xcMDAxXFwwMDJcIlxuICAgIENFTlZFTTogNCwgLy8gdmVyc2lvbiBtYWRlIGJ5XG4gICAgQ0VOVkVSOiA2LCAvLyB2ZXJzaW9uIG5lZWRlZCB0byBleHRyYWN0XG4gICAgQ0VORkxHOiA4LCAvLyBlbmNyeXB0LCBkZWNyeXB0IGZsYWdzXG4gICAgQ0VOSE9XOiAxMCwgLy8gY29tcHJlc3Npb24gbWV0aG9kXG4gICAgQ0VOVElNOiAxMiwgLy8gbW9kaWZpY2F0aW9uIHRpbWUgKDIgYnl0ZXMgdGltZSwgMiBieXRlcyBkYXRlKVxuICAgIENFTkNSQzogMTYsIC8vIHVuY29tcHJlc3NlZCBmaWxlIGNyYy0zMiB2YWx1ZVxuICAgIENFTlNJWjogMjAsIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgIENFTkxFTjogMjQsIC8vIHVuY29tcHJlc3NlZCBzaXplXG4gICAgQ0VOTkFNOiAyOCwgLy8gZmlsZW5hbWUgbGVuZ3RoXG4gICAgQ0VORVhUOiAzMCwgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG4gICAgQ0VOQ09NOiAzMiwgLy8gZmlsZSBjb21tZW50IGxlbmd0aFxuICAgIENFTkRTSzogMzQsIC8vIHZvbHVtZSBudW1iZXIgc3RhcnRcbiAgICBDRU5BVFQ6IDM2LCAvLyBpbnRlcm5hbCBmaWxlIGF0dHJpYnV0ZXNcbiAgICBDRU5BVFg6IDM4LCAvLyBleHRlcm5hbCBmaWxlIGF0dHJpYnV0ZXMgKGhvc3Qgc3lzdGVtIGRlcGVuZGVudClcbiAgICBDRU5PRkY6IDQyLCAvLyBMT0MgaGVhZGVyIG9mZnNldFxuXG4gICAgLyogVGhlIGVudHJpZXMgaW4gdGhlIGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeSAqL1xuICAgIEVOREhEUjogMjIsIC8vIEVORCBoZWFkZXIgc2l6ZVxuICAgIEVORFNJRzogMHgwNjA1NGI1MCwgLy8gXCJQS1xcMDA1XFwwMDZcIlxuICAgIEVORFNJR0ZJUlNUOiAweDUwLFxuICAgIEVORFNVQjogOCwgLy8gbnVtYmVyIG9mIGVudHJpZXMgb24gdGhpcyBkaXNrXG4gICAgRU5EVE9UOiAxMCwgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXNcbiAgICBFTkRTSVo6IDEyLCAvLyBjZW50cmFsIGRpcmVjdG9yeSBzaXplIGluIGJ5dGVzXG4gICAgRU5ET0ZGOiAxNiwgLy8gb2Zmc2V0IG9mIGZpcnN0IENFTiBoZWFkZXJcbiAgICBFTkRDT006IDIwLCAvLyB6aXAgZmlsZSBjb21tZW50IGxlbmd0aFxuICAgIE1BWEZJTEVDT01NRU5UOiAweGZmZmYsXG5cbiAgICAvKiBUaGUgZW50cmllcyBpbiB0aGUgZW5kIG9mIFpJUDY0IGNlbnRyYWwgZGlyZWN0b3J5IGxvY2F0b3IgKi9cbiAgICBFTkRMNjRIRFI6IDIwLCAvLyBaSVA2NCBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnkgbG9jYXRvciBoZWFkZXIgc2l6ZVxuICAgIEVOREw2NFNJRzogMHgwNzA2NGI1MCwgLy8gWklQNjQgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5IGxvY2F0b3Igc2lnbmF0dXJlXG4gICAgRU5ETDY0U0lHRklSU1Q6IDB4NTAsXG4gICAgRU5ETDY0T0ZTOiA4LCAvLyBaSVA2NCBlbmQgb2YgY2VudHJhbCBkaXJlY3Rvcnkgb2Zmc2V0XG5cbiAgICAvKiBUaGUgZW50cmllcyBpbiB0aGUgZW5kIG9mIFpJUDY0IGNlbnRyYWwgZGlyZWN0b3J5ICovXG4gICAgRU5ENjRIRFI6IDU2LCAvLyBaSVA2NCBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnkgaGVhZGVyIHNpemVcbiAgICBFTkQ2NFNJRzogMHgwNjA2NGI1MCwgLy8gWklQNjQgZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5IHNpZ25hdHVyZVxuICAgIEVORDY0U0lHRklSU1Q6IDB4NTAsXG4gICAgRU5ENjRTVUI6IDI0LCAvLyBudW1iZXIgb2YgZW50cmllcyBvbiB0aGlzIGRpc2tcbiAgICBFTkQ2NFRPVDogMzIsIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzXG4gICAgRU5ENjRTSVo6IDQwLFxuICAgIEVORDY0T0ZGOiA0OCxcblxuICAgIC8qIENvbXByZXNzaW9uIG1ldGhvZHMgKi9cbiAgICBTVE9SRUQ6IDAsIC8vIG5vIGNvbXByZXNzaW9uXG4gICAgU0hSVU5LOiAxLCAvLyBzaHJ1bmtcbiAgICBSRURVQ0VEMTogMiwgLy8gcmVkdWNlZCB3aXRoIGNvbXByZXNzaW9uIGZhY3RvciAxXG4gICAgUkVEVUNFRDI6IDMsIC8vIHJlZHVjZWQgd2l0aCBjb21wcmVzc2lvbiBmYWN0b3IgMlxuICAgIFJFRFVDRUQzOiA0LCAvLyByZWR1Y2VkIHdpdGggY29tcHJlc3Npb24gZmFjdG9yIDNcbiAgICBSRURVQ0VENDogNSwgLy8gcmVkdWNlZCB3aXRoIGNvbXByZXNzaW9uIGZhY3RvciA0XG4gICAgSU1QTE9ERUQ6IDYsIC8vIGltcGxvZGVkXG4gICAgLy8gNyByZXNlcnZlZFxuICAgIERFRkxBVEVEOiA4LCAvLyBkZWZsYXRlZFxuICAgIEVOSEFOQ0VEX0RFRkxBVEVEOiA5LCAvLyBkZWZsYXRlNjRcbiAgICBQS1dBUkU6IDEwLCAvLyBQS1dhcmUgRENMIGltcGxvZGVkXG4gICAgLy8gMTEgcmVzZXJ2ZWRcbiAgICBCWklQMjogMTIsIC8vICBjb21wcmVzc2VkIHVzaW5nIEJaSVAyXG4gICAgLy8gMTMgcmVzZXJ2ZWRcbiAgICBMWk1BOiAxNCwgLy8gTFpNQVxuICAgIC8vIDE1LTE3IHJlc2VydmVkXG4gICAgSUJNX1RFUlNFOiAxOCwgLy8gY29tcHJlc3NlZCB1c2luZyBJQk0gVEVSU0VcbiAgICBJQk1fTFo3NzogMTksIC8vSUJNIExaNzcgelxuXG4gICAgLyogR2VuZXJhbCBwdXJwb3NlIGJpdCBmbGFnICovXG4gICAgRkxHX0VOQzogMCwgLy8gZW5jcnlwdGVkIGZpbGVcbiAgICBGTEdfQ09NUDE6IDEsIC8vIGNvbXByZXNzaW9uIG9wdGlvblxuICAgIEZMR19DT01QMjogMiwgLy8gY29tcHJlc3Npb24gb3B0aW9uXG4gICAgRkxHX0RFU0M6IDQsIC8vIGRhdGEgZGVzY3JpcHRvclxuICAgIEZMR19FTkg6IDgsIC8vIGVuaGFuY2VkIGRlZmxhdGlvblxuICAgIEZMR19TVFI6IDE2LCAvLyBzdHJvbmcgZW5jcnlwdGlvblxuICAgIEZMR19MTkc6IDEwMjQsIC8vIGxhbmd1YWdlIGVuY29kaW5nXG4gICAgRkxHX01TSzogNDA5NiwgLy8gbWFzayBoZWFkZXIgdmFsdWVzXG4gICAgRkxHX0VOVFJZX0VOQzogMSxcblxuICAgIC8qIDQuNSBFeHRlbnNpYmxlIGRhdGEgZmllbGRzICovXG4gICAgRUZfSUQ6IDAsXG4gICAgRUZfU0laRTogMixcblxuICAgIC8qIEhlYWRlciBJRHMgKi9cbiAgICBJRF9aSVA2NDogMHgwMDAxLFxuICAgIElEX0FWSU5GTzogMHgwMDA3LFxuICAgIElEX1BGUzogMHgwMDA4LFxuICAgIElEX09TMjogMHgwMDA5LFxuICAgIElEX05URlM6IDB4MDAwYSxcbiAgICBJRF9PUEVOVk1TOiAweDAwMGMsXG4gICAgSURfVU5JWDogMHgwMDBkLFxuICAgIElEX0ZPUks6IDB4MDAwZSxcbiAgICBJRF9QQVRDSDogMHgwMDBmLFxuICAgIElEX1g1MDlfUEtDUzc6IDB4MDAxNCxcbiAgICBJRF9YNTA5X0NFUlRJRF9GOiAweDAwMTUsXG4gICAgSURfWDUwOV9DRVJUSURfQzogMHgwMDE2LFxuICAgIElEX1NUUk9OR0VOQzogMHgwMDE3LFxuICAgIElEX1JFQ09SRF9NR1Q6IDB4MDAxOCxcbiAgICBJRF9YNTA5X1BLQ1M3X1JMOiAweDAwMTksXG4gICAgSURfSUJNMTogMHgwMDY1LFxuICAgIElEX0lCTTI6IDB4MDA2NixcbiAgICBJRF9QT1NaSVA6IDB4NDY5MCxcblxuICAgIEVGX1pJUDY0X09SXzMyOiAweGZmZmZmZmZmLFxuICAgIEVGX1pJUDY0X09SXzE2OiAweGZmZmYsXG59O1xuXG5jb25zdCBTdHJlYW1aaXAgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgbGV0IGZkLCBmaWxlU2l6ZSwgY2h1bmtTaXplLCBvcCwgY2VudHJhbERpcmVjdG9yeSwgY2xvc2VkO1xuICAgIGNvbnN0IHJlYWR5ID0gZmFsc2UsXG4gICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICBlbnRyaWVzID0gY29uZmlnLnN0b3JlRW50cmllcyAhPT0gZmFsc2UgPyB7fSA6IG51bGwsXG4gICAgICAgIGZpbGVOYW1lID0gY29uZmlnLmZpbGUsXG4gICAgICAgIHRleHREZWNvZGVyID0gY29uZmlnLm5hbWVFbmNvZGluZyA/IG5ldyBUZXh0RGVjb2Rlcihjb25maWcubmFtZUVuY29kaW5nKSA6IG51bGw7XG5cbiAgICBvcGVuKCk7XG5cbiAgICBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgICBpZiAoY29uZmlnLmZkKSB7XG4gICAgICAgICAgICBmZCA9IGNvbmZpZy5mZDtcbiAgICAgICAgICAgIHJlYWRGaWxlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcy5vcGVuKGZpbGVOYW1lLCAncicsIChlcnIsIGYpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGF0LmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmQgPSBmO1xuICAgICAgICAgICAgICAgIHJlYWRGaWxlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRGaWxlKCkge1xuICAgICAgICBmcy5mc3RhdChmZCwgKGVyciwgc3RhdCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGF0LmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGVTaXplID0gc3RhdC5zaXplO1xuICAgICAgICAgICAgY2h1bmtTaXplID0gY29uZmlnLmNodW5rU2l6ZSB8fCBNYXRoLnJvdW5kKGZpbGVTaXplIC8gMTAwMCk7XG4gICAgICAgICAgICBjaHVua1NpemUgPSBNYXRoLm1heChcbiAgICAgICAgICAgICAgICBNYXRoLm1pbihjaHVua1NpemUsIE1hdGgubWluKDEyOCAqIDEwMjQsIGZpbGVTaXplKSksXG4gICAgICAgICAgICAgICAgTWF0aC5taW4oMTAyNCwgZmlsZVNpemUpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmVhZENlbnRyYWxEaXJlY3RvcnkoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZFVudGlsRm91bmRDYWxsYmFjayhlcnIsIGJ5dGVzUmVhZCkge1xuICAgICAgICBpZiAoZXJyIHx8ICFieXRlc1JlYWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmVtaXQoJ2Vycm9yJywgZXJyIHx8IG5ldyBFcnJvcignQXJjaGl2ZSByZWFkIGVycm9yJykpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBwb3MgPSBvcC5sYXN0UG9zO1xuICAgICAgICBsZXQgYnVmZmVyUG9zaXRpb24gPSBwb3MgLSBvcC53aW4ucG9zaXRpb247XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IG9wLndpbi5idWZmZXI7XG4gICAgICAgIGNvbnN0IG1pblBvcyA9IG9wLm1pblBvcztcbiAgICAgICAgd2hpbGUgKC0tcG9zID49IG1pblBvcyAmJiAtLWJ1ZmZlclBvc2l0aW9uID49IDApIHtcbiAgICAgICAgICAgIGlmIChidWZmZXIubGVuZ3RoIC0gYnVmZmVyUG9zaXRpb24gPj0gNCAmJiBidWZmZXJbYnVmZmVyUG9zaXRpb25dID09PSBvcC5maXJzdEJ5dGUpIHtcbiAgICAgICAgICAgICAgICAvLyBxdWljayBjaGVjayBmaXJzdCBzaWduYXR1cmUgYnl0ZVxuICAgICAgICAgICAgICAgIGlmIChidWZmZXIucmVhZFVJbnQzMkxFKGJ1ZmZlclBvc2l0aW9uKSA9PT0gb3Auc2lnKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wLmxhc3RCdWZmZXJQb3NpdGlvbiA9IGJ1ZmZlclBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgICBvcC5sYXN0Qnl0ZXNSZWFkID0gYnl0ZXNSZWFkO1xuICAgICAgICAgICAgICAgICAgICBvcC5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwb3MgPT09IG1pblBvcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ0JhZCBhcmNoaXZlJykpO1xuICAgICAgICB9XG4gICAgICAgIG9wLmxhc3RQb3MgPSBwb3MgKyAxO1xuICAgICAgICBvcC5jaHVua1NpemUgKj0gMjtcbiAgICAgICAgaWYgKHBvcyA8PSBtaW5Qb3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdCYWQgYXJjaGl2ZScpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBleHBhbmRMZW5ndGggPSBNYXRoLm1pbihvcC5jaHVua1NpemUsIHBvcyAtIG1pblBvcyk7XG4gICAgICAgIG9wLndpbi5leHBhbmRMZWZ0KGV4cGFuZExlbmd0aCwgcmVhZFVudGlsRm91bmRDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZENlbnRyYWxEaXJlY3RvcnkoKSB7XG4gICAgICAgIGNvbnN0IHRvdGFsUmVhZExlbmd0aCA9IE1hdGgubWluKGNvbnN0cy5FTkRIRFIgKyBjb25zdHMuTUFYRklMRUNPTU1FTlQsIGZpbGVTaXplKTtcbiAgICAgICAgb3AgPSB7XG4gICAgICAgICAgICB3aW46IG5ldyBGaWxlV2luZG93QnVmZmVyKGZkKSxcbiAgICAgICAgICAgIHRvdGFsUmVhZExlbmd0aCxcbiAgICAgICAgICAgIG1pblBvczogZmlsZVNpemUgLSB0b3RhbFJlYWRMZW5ndGgsXG4gICAgICAgICAgICBsYXN0UG9zOiBmaWxlU2l6ZSxcbiAgICAgICAgICAgIGNodW5rU2l6ZTogTWF0aC5taW4oMTAyNCwgY2h1bmtTaXplKSxcbiAgICAgICAgICAgIGZpcnN0Qnl0ZTogY29uc3RzLkVORFNJR0ZJUlNULFxuICAgICAgICAgICAgc2lnOiBjb25zdHMuRU5EU0lHLFxuICAgICAgICAgICAgY29tcGxldGU6IHJlYWRDZW50cmFsRGlyZWN0b3J5Q29tcGxldGUsXG4gICAgICAgIH07XG4gICAgICAgIG9wLndpbi5yZWFkKGZpbGVTaXplIC0gb3AuY2h1bmtTaXplLCBvcC5jaHVua1NpemUsIHJlYWRVbnRpbEZvdW5kQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRDZW50cmFsRGlyZWN0b3J5Q29tcGxldGUoKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IG9wLndpbi5idWZmZXI7XG4gICAgICAgIGNvbnN0IHBvcyA9IG9wLmxhc3RCdWZmZXJQb3NpdGlvbjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNlbnRyYWxEaXJlY3RvcnkgPSBuZXcgQ2VudHJhbERpcmVjdG9yeUhlYWRlcigpO1xuICAgICAgICAgICAgY2VudHJhbERpcmVjdG9yeS5yZWFkKGJ1ZmZlci5zbGljZShwb3MsIHBvcyArIGNvbnN0cy5FTkRIRFIpKTtcbiAgICAgICAgICAgIGNlbnRyYWxEaXJlY3RvcnkuaGVhZGVyT2Zmc2V0ID0gb3Aud2luLnBvc2l0aW9uICsgcG9zO1xuICAgICAgICAgICAgaWYgKGNlbnRyYWxEaXJlY3RvcnkuY29tbWVudExlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoYXQuY29tbWVudCA9IGJ1ZmZlclxuICAgICAgICAgICAgICAgICAgICAuc2xpY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgKyBjb25zdHMuRU5ESERSLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zICsgY29uc3RzLkVOREhEUiArIGNlbnRyYWxEaXJlY3RvcnkuY29tbWVudExlbmd0aFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC50b1N0cmluZygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGF0LmNvbW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5lbnRyaWVzQ291bnQgPSBjZW50cmFsRGlyZWN0b3J5LnZvbHVtZUVudHJpZXM7XG4gICAgICAgICAgICB0aGF0LmNlbnRyYWxEaXJlY3RvcnkgPSBjZW50cmFsRGlyZWN0b3J5O1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIChjZW50cmFsRGlyZWN0b3J5LnZvbHVtZUVudHJpZXMgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8xNiAmJlxuICAgICAgICAgICAgICAgICAgICBjZW50cmFsRGlyZWN0b3J5LnRvdGFsRW50cmllcyA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzE2KSB8fFxuICAgICAgICAgICAgICAgIGNlbnRyYWxEaXJlY3Rvcnkuc2l6ZSA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzMyIHx8XG4gICAgICAgICAgICAgICAgY2VudHJhbERpcmVjdG9yeS5vZmZzZXQgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUxvY2F0b3IoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3AgPSB7fTtcbiAgICAgICAgICAgICAgICByZWFkRW50cmllcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoYXQuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZFppcDY0Q2VudHJhbERpcmVjdG9yeUxvY2F0b3IoKSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGNvbnN0cy5FTkRMNjRIRFI7XG4gICAgICAgIGlmIChvcC5sYXN0QnVmZmVyUG9zaXRpb24gPiBsZW5ndGgpIHtcbiAgICAgICAgICAgIG9wLmxhc3RCdWZmZXJQb3NpdGlvbiAtPSBsZW5ndGg7XG4gICAgICAgICAgICByZWFkWmlwNjRDZW50cmFsRGlyZWN0b3J5TG9jYXRvckNvbXBsZXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcCA9IHtcbiAgICAgICAgICAgICAgICB3aW46IG9wLndpbixcbiAgICAgICAgICAgICAgICB0b3RhbFJlYWRMZW5ndGg6IGxlbmd0aCxcbiAgICAgICAgICAgICAgICBtaW5Qb3M6IG9wLndpbi5wb3NpdGlvbiAtIGxlbmd0aCxcbiAgICAgICAgICAgICAgICBsYXN0UG9zOiBvcC53aW4ucG9zaXRpb24sXG4gICAgICAgICAgICAgICAgY2h1bmtTaXplOiBvcC5jaHVua1NpemUsXG4gICAgICAgICAgICAgICAgZmlyc3RCeXRlOiBjb25zdHMuRU5ETDY0U0lHRklSU1QsXG4gICAgICAgICAgICAgICAgc2lnOiBjb25zdHMuRU5ETDY0U0lHLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiByZWFkWmlwNjRDZW50cmFsRGlyZWN0b3J5TG9jYXRvckNvbXBsZXRlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG9wLndpbi5yZWFkKG9wLmxhc3RQb3MgLSBvcC5jaHVua1NpemUsIG9wLmNodW5rU2l6ZSwgcmVhZFVudGlsRm91bmRDYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkWmlwNjRDZW50cmFsRGlyZWN0b3J5TG9jYXRvckNvbXBsZXRlKCkge1xuICAgICAgICBjb25zdCBidWZmZXIgPSBvcC53aW4uYnVmZmVyO1xuICAgICAgICBjb25zdCBsb2NIZWFkZXIgPSBuZXcgQ2VudHJhbERpcmVjdG9yeUxvYzY0SGVhZGVyKCk7XG4gICAgICAgIGxvY0hlYWRlci5yZWFkKFxuICAgICAgICAgICAgYnVmZmVyLnNsaWNlKG9wLmxhc3RCdWZmZXJQb3NpdGlvbiwgb3AubGFzdEJ1ZmZlclBvc2l0aW9uICsgY29uc3RzLkVOREw2NEhEUilcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgcmVhZExlbmd0aCA9IGZpbGVTaXplIC0gbG9jSGVhZGVyLmhlYWRlck9mZnNldDtcbiAgICAgICAgb3AgPSB7XG4gICAgICAgICAgICB3aW46IG9wLndpbixcbiAgICAgICAgICAgIHRvdGFsUmVhZExlbmd0aDogcmVhZExlbmd0aCxcbiAgICAgICAgICAgIG1pblBvczogbG9jSGVhZGVyLmhlYWRlck9mZnNldCxcbiAgICAgICAgICAgIGxhc3RQb3M6IG9wLmxhc3RQb3MsXG4gICAgICAgICAgICBjaHVua1NpemU6IG9wLmNodW5rU2l6ZSxcbiAgICAgICAgICAgIGZpcnN0Qnl0ZTogY29uc3RzLkVORDY0U0lHRklSU1QsXG4gICAgICAgICAgICBzaWc6IGNvbnN0cy5FTkQ2NFNJRyxcbiAgICAgICAgICAgIGNvbXBsZXRlOiByZWFkWmlwNjRDZW50cmFsRGlyZWN0b3J5Q29tcGxldGUsXG4gICAgICAgIH07XG4gICAgICAgIG9wLndpbi5yZWFkKGZpbGVTaXplIC0gb3AuY2h1bmtTaXplLCBvcC5jaHVua1NpemUsIHJlYWRVbnRpbEZvdW5kQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRaaXA2NENlbnRyYWxEaXJlY3RvcnlDb21wbGV0ZSgpIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gb3Aud2luLmJ1ZmZlcjtcbiAgICAgICAgY29uc3QgemlwNjRjZCA9IG5ldyBDZW50cmFsRGlyZWN0b3J5WmlwNjRIZWFkZXIoKTtcbiAgICAgICAgemlwNjRjZC5yZWFkKGJ1ZmZlci5zbGljZShvcC5sYXN0QnVmZmVyUG9zaXRpb24sIG9wLmxhc3RCdWZmZXJQb3NpdGlvbiArIGNvbnN0cy5FTkQ2NEhEUikpO1xuICAgICAgICB0aGF0LmNlbnRyYWxEaXJlY3Rvcnkudm9sdW1lRW50cmllcyA9IHppcDY0Y2Qudm9sdW1lRW50cmllcztcbiAgICAgICAgdGhhdC5jZW50cmFsRGlyZWN0b3J5LnRvdGFsRW50cmllcyA9IHppcDY0Y2QudG90YWxFbnRyaWVzO1xuICAgICAgICB0aGF0LmNlbnRyYWxEaXJlY3Rvcnkuc2l6ZSA9IHppcDY0Y2Quc2l6ZTtcbiAgICAgICAgdGhhdC5jZW50cmFsRGlyZWN0b3J5Lm9mZnNldCA9IHppcDY0Y2Qub2Zmc2V0O1xuICAgICAgICB0aGF0LmVudHJpZXNDb3VudCA9IHppcDY0Y2Qudm9sdW1lRW50cmllcztcbiAgICAgICAgb3AgPSB7fTtcbiAgICAgICAgcmVhZEVudHJpZXMoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkRW50cmllcygpIHtcbiAgICAgICAgb3AgPSB7XG4gICAgICAgICAgICB3aW46IG5ldyBGaWxlV2luZG93QnVmZmVyKGZkKSxcbiAgICAgICAgICAgIHBvczogY2VudHJhbERpcmVjdG9yeS5vZmZzZXQsXG4gICAgICAgICAgICBjaHVua1NpemUsXG4gICAgICAgICAgICBlbnRyaWVzTGVmdDogY2VudHJhbERpcmVjdG9yeS52b2x1bWVFbnRyaWVzLFxuICAgICAgICB9O1xuICAgICAgICBvcC53aW4ucmVhZChvcC5wb3MsIE1hdGgubWluKGNodW5rU2l6ZSwgZmlsZVNpemUgLSBvcC5wb3MpLCByZWFkRW50cmllc0NhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkRW50cmllc0NhbGxiYWNrKGVyciwgYnl0ZXNSZWFkKSB7XG4gICAgICAgIGlmIChlcnIgfHwgIWJ5dGVzUmVhZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW1pdCgnZXJyb3InLCBlcnIgfHwgbmV3IEVycm9yKCdFbnRyaWVzIHJlYWQgZXJyb3InKSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGJ1ZmZlclBvcyA9IG9wLnBvcyAtIG9wLndpbi5wb3NpdGlvbjtcbiAgICAgICAgbGV0IGVudHJ5ID0gb3AuZW50cnk7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IG9wLndpbi5idWZmZXI7XG4gICAgICAgIGNvbnN0IGJ1ZmZlckxlbmd0aCA9IGJ1ZmZlci5sZW5ndGg7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB3aGlsZSAob3AuZW50cmllc0xlZnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeSA9IG5ldyBaaXBFbnRyeSgpO1xuICAgICAgICAgICAgICAgICAgICBlbnRyeS5yZWFkSGVhZGVyKGJ1ZmZlciwgYnVmZmVyUG9zKTtcbiAgICAgICAgICAgICAgICAgICAgZW50cnkuaGVhZGVyT2Zmc2V0ID0gb3Aud2luLnBvc2l0aW9uICsgYnVmZmVyUG9zO1xuICAgICAgICAgICAgICAgICAgICBvcC5lbnRyeSA9IGVudHJ5O1xuICAgICAgICAgICAgICAgICAgICBvcC5wb3MgKz0gY29uc3RzLkNFTkhEUjtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyUG9zICs9IGNvbnN0cy5DRU5IRFI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGVudHJ5SGVhZGVyU2l6ZSA9IGVudHJ5LmZuYW1lTGVuICsgZW50cnkuZXh0cmFMZW4gKyBlbnRyeS5jb21MZW47XG4gICAgICAgICAgICAgICAgY29uc3QgYWR2YW5jZUJ5dGVzID0gZW50cnlIZWFkZXJTaXplICsgKG9wLmVudHJpZXNMZWZ0ID4gMSA/IGNvbnN0cy5DRU5IRFIgOiAwKTtcbiAgICAgICAgICAgICAgICBpZiAoYnVmZmVyTGVuZ3RoIC0gYnVmZmVyUG9zIDwgYWR2YW5jZUJ5dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wLndpbi5tb3ZlUmlnaHQoY2h1bmtTaXplLCByZWFkRW50cmllc0NhbGxiYWNrLCBidWZmZXJQb3MpO1xuICAgICAgICAgICAgICAgICAgICBvcC5tb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbnRyeS5yZWFkKGJ1ZmZlciwgYnVmZmVyUG9zLCB0ZXh0RGVjb2Rlcik7XG4gICAgICAgICAgICAgICAgaWYgKCFjb25maWcuc2tpcEVudHJ5TmFtZVZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cnkudmFsaWRhdGVOYW1lKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlbnRyaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJpZXNbZW50cnkubmFtZV0gPSBlbnRyeTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhhdC5lbWl0KCdlbnRyeScsIGVudHJ5KTtcbiAgICAgICAgICAgICAgICBvcC5lbnRyeSA9IGVudHJ5ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBvcC5lbnRyaWVzTGVmdC0tO1xuICAgICAgICAgICAgICAgIG9wLnBvcyArPSBlbnRyeUhlYWRlclNpemU7XG4gICAgICAgICAgICAgICAgYnVmZmVyUG9zICs9IGVudHJ5SGVhZGVyU2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuZW1pdCgncmVhZHknKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGF0LmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrRW50cmllc0V4aXN0KCkge1xuICAgICAgICBpZiAoIWVudHJpZXMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc3RvcmVFbnRyaWVzIGRpc2FibGVkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3JlYWR5Jywge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVhZHk7XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmVudHJ5ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgY2hlY2tFbnRyaWVzRXhpc3QoKTtcbiAgICAgICAgcmV0dXJuIGVudHJpZXNbbmFtZV07XG4gICAgfTtcblxuICAgIHRoaXMuZW50cmllcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hlY2tFbnRyaWVzRXhpc3QoKTtcbiAgICAgICAgcmV0dXJuIGVudHJpZXM7XG4gICAgfTtcblxuICAgIHRoaXMuc3RyZWFtID0gZnVuY3Rpb24gKGVudHJ5LCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gdGhpcy5vcGVuRW50cnkoXG4gICAgICAgICAgICBlbnRyeSxcbiAgICAgICAgICAgIChlcnIsIGVudHJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gZGF0YU9mZnNldChlbnRyeSk7XG4gICAgICAgICAgICAgICAgbGV0IGVudHJ5U3RyZWFtID0gbmV3IEVudHJ5RGF0YVJlYWRlclN0cmVhbShmZCwgb2Zmc2V0LCBlbnRyeS5jb21wcmVzc2VkU2l6ZSk7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5Lm1ldGhvZCA9PT0gY29uc3RzLlNUT1JFRCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBub3RoaW5nIHRvIGRvXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5tZXRob2QgPT09IGNvbnN0cy5ERUZMQVRFRCkge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeVN0cmVhbSA9IGVudHJ5U3RyZWFtLnBpcGUoemxpYi5jcmVhdGVJbmZsYXRlUmF3KCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ1Vua25vd24gY29tcHJlc3Npb24gbWV0aG9kOiAnICsgZW50cnkubWV0aG9kKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjYW5WZXJpZnlDcmMoZW50cnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5U3RyZWFtID0gZW50cnlTdHJlYW0ucGlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBFbnRyeVZlcmlmeVN0cmVhbShlbnRyeVN0cmVhbSwgZW50cnkuY3JjLCBlbnRyeS5zaXplKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBlbnRyeVN0cmVhbSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgdGhpcy5lbnRyeURhdGFTeW5jID0gZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgIGxldCBlcnIgPSBudWxsO1xuICAgICAgICB0aGlzLm9wZW5FbnRyeShcbiAgICAgICAgICAgIGVudHJ5LFxuICAgICAgICAgICAgKGUsIGVuKSA9PiB7XG4gICAgICAgICAgICAgICAgZXJyID0gZTtcbiAgICAgICAgICAgICAgICBlbnRyeSA9IGVuO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkYXRhID0gQnVmZmVyLmFsbG9jKGVudHJ5LmNvbXByZXNzZWRTaXplKTtcbiAgICAgICAgbmV3IEZzUmVhZChmZCwgZGF0YSwgMCwgZW50cnkuY29tcHJlc3NlZFNpemUsIGRhdGFPZmZzZXQoZW50cnkpLCAoZSkgPT4ge1xuICAgICAgICAgICAgZXJyID0gZTtcbiAgICAgICAgfSkucmVhZCh0cnVlKTtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbnRyeS5tZXRob2QgPT09IGNvbnN0cy5TVE9SRUQpIHtcbiAgICAgICAgICAgIC8vIG5vdGhpbmcgdG8gZG9cbiAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5tZXRob2QgPT09IGNvbnN0cy5ERUZMQVRFRCB8fCBlbnRyeS5tZXRob2QgPT09IGNvbnN0cy5FTkhBTkNFRF9ERUZMQVRFRCkge1xuICAgICAgICAgICAgZGF0YSA9IHpsaWIuaW5mbGF0ZVJhd1N5bmMoZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gY29tcHJlc3Npb24gbWV0aG9kOiAnICsgZW50cnkubWV0aG9kKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5sZW5ndGggIT09IGVudHJ5LnNpemUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzaXplJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhblZlcmlmeUNyYyhlbnRyeSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHZlcmlmeSA9IG5ldyBDcmNWZXJpZnkoZW50cnkuY3JjLCBlbnRyeS5zaXplKTtcbiAgICAgICAgICAgIHZlcmlmeS5kYXRhKGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH07XG5cbiAgICB0aGlzLm9wZW5FbnRyeSA9IGZ1bmN0aW9uIChlbnRyeSwgY2FsbGJhY2ssIHN5bmMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbnRyeSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGNoZWNrRW50cmllc0V4aXN0KCk7XG4gICAgICAgICAgICBlbnRyeSA9IGVudHJpZXNbZW50cnldO1xuICAgICAgICAgICAgaWYgKCFlbnRyeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ0VudHJ5IG5vdCBmb3VuZCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVudHJ5LmlzRmlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcignRW50cnkgaXMgbm90IGZpbGUnKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcignQXJjaGl2ZSBjbG9zZWQnKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jKGNvbnN0cy5MT0NIRFIpO1xuICAgICAgICBuZXcgRnNSZWFkKGZkLCBidWZmZXIsIDAsIGJ1ZmZlci5sZW5ndGgsIGVudHJ5Lm9mZnNldCwgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHJlYWRFeDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZW50cnkucmVhZERhdGFIZWFkZXIoYnVmZmVyKTtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkuZW5jcnlwdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWRFeCA9IG5ldyBFcnJvcignRW50cnkgZW5jcnlwdGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICByZWFkRXggPSBleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKHJlYWRFeCwgZW50cnkpO1xuICAgICAgICB9KS5yZWFkKHN5bmMpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBkYXRhT2Zmc2V0KGVudHJ5KSB7XG4gICAgICAgIHJldHVybiBlbnRyeS5vZmZzZXQgKyBjb25zdHMuTE9DSERSICsgZW50cnkuZm5hbWVMZW4gKyBlbnRyeS5leHRyYUxlbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5WZXJpZnlDcmMoZW50cnkpIHtcbiAgICAgICAgLy8gaWYgYml0IDMgKDB4MDgpIG9mIHRoZSBnZW5lcmFsLXB1cnBvc2UgZmxhZ3MgZmllbGQgaXMgc2V0LCB0aGVuIHRoZSBDUkMtMzIgYW5kIGZpbGUgc2l6ZXMgYXJlIG5vdCBrbm93biB3aGVuIHRoZSBoZWFkZXIgaXMgd3JpdHRlblxuICAgICAgICByZXR1cm4gKGVudHJ5LmZsYWdzICYgMHg4KSAhPT0gMHg4O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4dHJhY3QoZW50cnksIG91dFBhdGgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoYXQuc3RyZWFtKGVudHJ5LCAoZXJyLCBzdG0pID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgZnNTdG0sIGVyclRocm93bjtcbiAgICAgICAgICAgICAgICBzdG0ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJUaHJvd24gPSBlcnI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmc1N0bSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RtLnVucGlwZShmc1N0bSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmc1N0bS5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZnMub3BlbihvdXRQYXRoLCAndycsIChlcnIsIGZkRmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5jbG9zZShmZCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyclRocm93bik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmc1N0bSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKG91dFBhdGgsIHsgZmQ6IGZkRmlsZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZnNTdG0ub24oJ2ZpbmlzaCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuZW1pdCgnZXh0cmFjdCcsIGVudHJ5LCBvdXRQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXJyVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0bS5waXBlKGZzU3RtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlRGlyZWN0b3JpZXMoYmFzZURpciwgZGlycywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKCFkaXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRpciA9IGRpcnMuc2hpZnQoKTtcbiAgICAgICAgZGlyID0gcGF0aC5qb2luKGJhc2VEaXIsIHBhdGguam9pbiguLi5kaXIpKTtcbiAgICAgICAgZnMubWtkaXIoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyICYmIGVyci5jb2RlICE9PSAnRUVYSVNUJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3JlYXRlRGlyZWN0b3JpZXMoYmFzZURpciwgZGlycywgY2FsbGJhY2spO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRyYWN0RmlsZXMoYmFzZURpciwgYmFzZVJlbFBhdGgsIGZpbGVzLCBjYWxsYmFjaywgZXh0cmFjdGVkQ291bnQpIHtcbiAgICAgICAgaWYgKCFmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBleHRyYWN0ZWRDb3VudCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsZSA9IGZpbGVzLnNoaWZ0KCk7XG4gICAgICAgIGNvbnN0IHRhcmdldFBhdGggPSBwYXRoLmpvaW4oYmFzZURpciwgZmlsZS5uYW1lLnJlcGxhY2UoYmFzZVJlbFBhdGgsICcnKSk7XG4gICAgICAgIGV4dHJhY3QoZmlsZSwgdGFyZ2V0UGF0aCwgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIGV4dHJhY3RlZENvdW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4dHJhY3RGaWxlcyhiYXNlRGlyLCBiYXNlUmVsUGF0aCwgZmlsZXMsIGNhbGxiYWNrLCBleHRyYWN0ZWRDb3VudCArIDEpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmV4dHJhY3QgPSBmdW5jdGlvbiAoZW50cnksIG91dFBhdGgsIGNhbGxiYWNrKSB7XG4gICAgICAgIGxldCBlbnRyeU5hbWUgPSBlbnRyeSB8fCAnJztcbiAgICAgICAgaWYgKHR5cGVvZiBlbnRyeSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGVudHJ5ID0gdGhpcy5lbnRyeShlbnRyeSk7XG4gICAgICAgICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICBlbnRyeU5hbWUgPSBlbnRyeS5uYW1lO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnlOYW1lLmxlbmd0aCAmJiBlbnRyeU5hbWVbZW50cnlOYW1lLmxlbmd0aCAtIDFdICE9PSAnLycpIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cnlOYW1lICs9ICcvJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbnRyeSB8fCBlbnRyeS5pc0RpcmVjdG9yeSkge1xuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBkaXJzID0gW10sXG4gICAgICAgICAgICAgICAgYWxsRGlycyA9IHt9O1xuICAgICAgICAgICAgZm9yIChjb25zdCBlIGluIGVudHJpZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlbnRyaWVzLCBlKSAmJlxuICAgICAgICAgICAgICAgICAgICBlLmxhc3RJbmRleE9mKGVudHJ5TmFtZSwgMCkgPT09IDBcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlbFBhdGggPSBlLnJlcGxhY2UoZW50cnlOYW1lLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkRW50cnkgPSBlbnRyaWVzW2VdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRFbnRyeS5pc0ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goY2hpbGRFbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWxQYXRoID0gcGF0aC5kaXJuYW1lKHJlbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWxQYXRoICYmICFhbGxEaXJzW3JlbFBhdGhdICYmIHJlbFBhdGggIT09ICcuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsRGlyc1tyZWxQYXRoXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydHMgPSByZWxQYXRoLnNwbGl0KCcvJykuZmlsdGVyKChmKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGY7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJzLnB1c2gocGFydHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0cyA9IHBhcnRzLnNsaWNlKDAsIHBhcnRzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRzUGF0aCA9IHBhcnRzLmpvaW4oJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxsRGlyc1twYXJ0c1BhdGhdIHx8IHBhcnRzUGF0aCA9PT0gJy4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxEaXJzW3BhcnRzUGF0aF0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcnMucHVzaChwYXJ0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXJzLnNvcnQoKHgsIHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC5sZW5ndGggLSB5Lmxlbmd0aDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGRpcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlRGlyZWN0b3JpZXMob3V0UGF0aCwgZGlycywgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFjdEZpbGVzKG91dFBhdGgsIGVudHJ5TmFtZSwgZmlsZXMsIGNhbGxiYWNrLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBleHRyYWN0RmlsZXMob3V0UGF0aCwgZW50cnlOYW1lLCBmaWxlcywgY2FsbGJhY2ssIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnMuc3RhdChvdXRQYXRoLCAoZXJyLCBzdGF0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXQgJiYgc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhY3QoZW50cnksIHBhdGguam9pbihvdXRQYXRoLCBwYXRoLmJhc2VuYW1lKGVudHJ5Lm5hbWUpKSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhY3QoZW50cnksIG91dFBhdGgsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmNsb3NlID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChjbG9zZWQgfHwgIWZkKSB7XG4gICAgICAgICAgICBjbG9zZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsb3NlZCA9IHRydWU7XG4gICAgICAgICAgICBmcy5jbG9zZShmZCwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGZkID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvcmlnaW5hbEVtaXQgPSBldmVudHMuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0O1xuICAgIHRoaXMuZW1pdCA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIGlmICghY2xvc2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxFbWl0LmNhbGwodGhpcywgLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuU3RyZWFtWmlwLnNldEZzID0gZnVuY3Rpb24gKGN1c3RvbUZzKSB7XG4gICAgZnMgPSBjdXN0b21Gcztcbn07XG5cblN0cmVhbVppcC5kZWJ1Z0xvZyA9ICguLi5hcmdzKSA9PiB7XG4gICAgaWYgKFN0cmVhbVppcC5kZWJ1Zykge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmxvZyguLi5hcmdzKTtcbiAgICB9XG59O1xuXG51dGlsLmluaGVyaXRzKFN0cmVhbVppcCwgZXZlbnRzLkV2ZW50RW1pdHRlcik7XG5cbmNvbnN0IHByb3BaaXAgPSBTeW1ib2woJ3ppcCcpO1xuXG5TdHJlYW1aaXAuYXN5bmMgPSBjbGFzcyBTdHJlYW1aaXBBc3luYyBleHRlbmRzIGV2ZW50cy5FdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGNvbnN0IHppcCA9IG5ldyBTdHJlYW1aaXAoY29uZmlnKTtcblxuICAgICAgICB6aXAub24oJ2VudHJ5JywgKGVudHJ5KSA9PiB0aGlzLmVtaXQoJ2VudHJ5JywgZW50cnkpKTtcbiAgICAgICAgemlwLm9uKCdleHRyYWN0JywgKGVudHJ5LCBvdXRQYXRoKSA9PiB0aGlzLmVtaXQoJ2V4dHJhY3QnLCBlbnRyeSwgb3V0UGF0aCkpO1xuXG4gICAgICAgIHRoaXNbcHJvcFppcF0gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6aXAub24oJ3JlYWR5JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHppcC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCByZWplY3QpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoemlwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgemlwLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBlbnRyaWVzQ291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW3Byb3BaaXBdLnRoZW4oKHppcCkgPT4gemlwLmVudHJpZXNDb3VudCk7XG4gICAgfVxuXG4gICAgZ2V0IGNvbW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW3Byb3BaaXBdLnRoZW4oKHppcCkgPT4gemlwLmNvbW1lbnQpO1xuICAgIH1cblxuICAgIGFzeW5jIGVudHJ5KG5hbWUpIHtcbiAgICAgICAgY29uc3QgemlwID0gYXdhaXQgdGhpc1twcm9wWmlwXTtcbiAgICAgICAgcmV0dXJuIHppcC5lbnRyeShuYW1lKTtcbiAgICB9XG5cbiAgICBhc3luYyBlbnRyaWVzKCkge1xuICAgICAgICBjb25zdCB6aXAgPSBhd2FpdCB0aGlzW3Byb3BaaXBdO1xuICAgICAgICByZXR1cm4gemlwLmVudHJpZXMoKTtcbiAgICB9XG5cbiAgICBhc3luYyBzdHJlYW0oZW50cnkpIHtcbiAgICAgICAgY29uc3QgemlwID0gYXdhaXQgdGhpc1twcm9wWmlwXTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHppcC5zdHJlYW0oZW50cnksIChlcnIsIHN0bSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzdG0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBlbnRyeURhdGEoZW50cnkpIHtcbiAgICAgICAgY29uc3Qgc3RtID0gYXdhaXQgdGhpcy5zdHJlYW0oZW50cnkpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IFtdO1xuICAgICAgICAgICAgc3RtLm9uKCdkYXRhJywgKGNodW5rKSA9PiBkYXRhLnB1c2goY2h1bmspKTtcbiAgICAgICAgICAgIHN0bS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoQnVmZmVyLmNvbmNhdChkYXRhKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0bS5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RtLnJlbW92ZUFsbExpc3RlbmVycygnZW5kJyk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZXh0cmFjdChlbnRyeSwgb3V0UGF0aCkge1xuICAgICAgICBjb25zdCB6aXAgPSBhd2FpdCB0aGlzW3Byb3BaaXBdO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemlwLmV4dHJhY3QoZW50cnksIG91dFBhdGgsIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBjbG9zZSgpIHtcbiAgICAgICAgY29uc3QgemlwID0gYXdhaXQgdGhpc1twcm9wWmlwXTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHppcC5jbG9zZSgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmNsYXNzIENlbnRyYWxEaXJlY3RvcnlIZWFkZXIge1xuICAgIHJlYWQoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5sZW5ndGggIT09IGNvbnN0cy5FTkRIRFIgfHwgZGF0YS5yZWFkVUludDMyTEUoMCkgIT09IGNvbnN0cy5FTkRTSUcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjZW50cmFsIGRpcmVjdG9yeScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG51bWJlciBvZiBlbnRyaWVzIG9uIHRoaXMgdm9sdW1lXG4gICAgICAgIHRoaXMudm9sdW1lRW50cmllcyA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5FTkRTVUIpO1xuICAgICAgICAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllc1xuICAgICAgICB0aGlzLnRvdGFsRW50cmllcyA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5FTkRUT1QpO1xuICAgICAgICAvLyBjZW50cmFsIGRpcmVjdG9yeSBzaXplIGluIGJ5dGVzXG4gICAgICAgIHRoaXMuc2l6ZSA9IGRhdGEucmVhZFVJbnQzMkxFKGNvbnN0cy5FTkRTSVopO1xuICAgICAgICAvLyBvZmZzZXQgb2YgZmlyc3QgQ0VOIGhlYWRlclxuICAgICAgICB0aGlzLm9mZnNldCA9IGRhdGEucmVhZFVJbnQzMkxFKGNvbnN0cy5FTkRPRkYpO1xuICAgICAgICAvLyB6aXAgZmlsZSBjb21tZW50IGxlbmd0aFxuICAgICAgICB0aGlzLmNvbW1lbnRMZW5ndGggPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuRU5EQ09NKTtcbiAgICB9XG59XG5cbmNsYXNzIENlbnRyYWxEaXJlY3RvcnlMb2M2NEhlYWRlciB7XG4gICAgcmVhZChkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCAhPT0gY29uc3RzLkVOREw2NEhEUiB8fCBkYXRhLnJlYWRVSW50MzJMRSgwKSAhPT0gY29uc3RzLkVOREw2NFNJRykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHppcDY0IGNlbnRyYWwgZGlyZWN0b3J5IGxvY2F0b3InKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBaSVA2NCBFT0NEIGhlYWRlciBvZmZzZXRcbiAgICAgICAgdGhpcy5oZWFkZXJPZmZzZXQgPSByZWFkVUludDY0TEUoZGF0YSwgY29uc3RzLkVORFNVQik7XG4gICAgfVxufVxuXG5jbGFzcyBDZW50cmFsRGlyZWN0b3J5WmlwNjRIZWFkZXIge1xuICAgIHJlYWQoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5sZW5ndGggIT09IGNvbnN0cy5FTkQ2NEhEUiB8fCBkYXRhLnJlYWRVSW50MzJMRSgwKSAhPT0gY29uc3RzLkVORDY0U0lHKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY2VudHJhbCBkaXJlY3RvcnknKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBudW1iZXIgb2YgZW50cmllcyBvbiB0aGlzIHZvbHVtZVxuICAgICAgICB0aGlzLnZvbHVtZUVudHJpZXMgPSByZWFkVUludDY0TEUoZGF0YSwgY29uc3RzLkVORDY0U1VCKTtcbiAgICAgICAgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXNcbiAgICAgICAgdGhpcy50b3RhbEVudHJpZXMgPSByZWFkVUludDY0TEUoZGF0YSwgY29uc3RzLkVORDY0VE9UKTtcbiAgICAgICAgLy8gY2VudHJhbCBkaXJlY3Rvcnkgc2l6ZSBpbiBieXRlc1xuICAgICAgICB0aGlzLnNpemUgPSByZWFkVUludDY0TEUoZGF0YSwgY29uc3RzLkVORDY0U0laKTtcbiAgICAgICAgLy8gb2Zmc2V0IG9mIGZpcnN0IENFTiBoZWFkZXJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSByZWFkVUludDY0TEUoZGF0YSwgY29uc3RzLkVORDY0T0ZGKTtcbiAgICB9XG59XG5cbmNsYXNzIFppcEVudHJ5IHtcbiAgICByZWFkSGVhZGVyKGRhdGEsIG9mZnNldCkge1xuICAgICAgICAvLyBkYXRhIHNob3VsZCBiZSA0NiBieXRlcyBhbmQgc3RhcnQgd2l0aCBcIlBLIDAxIDAyXCJcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoIDwgb2Zmc2V0ICsgY29uc3RzLkNFTkhEUiB8fCBkYXRhLnJlYWRVSW50MzJMRShvZmZzZXQpICE9PSBjb25zdHMuQ0VOU0lHKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZW50cnkgaGVhZGVyJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdmVyc2lvbiBtYWRlIGJ5XG4gICAgICAgIHRoaXMudmVyTWFkZSA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5WRU0pO1xuICAgICAgICAvLyB2ZXJzaW9uIG5lZWRlZCB0byBleHRyYWN0XG4gICAgICAgIHRoaXMudmVyc2lvbiA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5WRVIpO1xuICAgICAgICAvLyBlbmNyeXB0LCBkZWNyeXB0IGZsYWdzXG4gICAgICAgIHRoaXMuZmxhZ3MgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VORkxHKTtcbiAgICAgICAgLy8gY29tcHJlc3Npb24gbWV0aG9kXG4gICAgICAgIHRoaXMubWV0aG9kID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkhPVyk7XG4gICAgICAgIC8vIG1vZGlmaWNhdGlvbiB0aW1lICgyIGJ5dGVzIHRpbWUsIDIgYnl0ZXMgZGF0ZSlcbiAgICAgICAgY29uc3QgdGltZWJ5dGVzID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTlRJTSk7XG4gICAgICAgIGNvbnN0IGRhdGVieXRlcyA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5USU0gKyAyKTtcbiAgICAgICAgdGhpcy50aW1lID0gcGFyc2VaaXBUaW1lKHRpbWVieXRlcywgZGF0ZWJ5dGVzKTtcblxuICAgICAgICAvLyB1bmNvbXByZXNzZWQgZmlsZSBjcmMtMzIgdmFsdWVcbiAgICAgICAgdGhpcy5jcmMgPSBkYXRhLnJlYWRVSW50MzJMRShvZmZzZXQgKyBjb25zdHMuQ0VOQ1JDKTtcbiAgICAgICAgLy8gY29tcHJlc3NlZCBzaXplXG4gICAgICAgIHRoaXMuY29tcHJlc3NlZFNpemUgPSBkYXRhLnJlYWRVSW50MzJMRShvZmZzZXQgKyBjb25zdHMuQ0VOU0laKTtcbiAgICAgICAgLy8gdW5jb21wcmVzc2VkIHNpemVcbiAgICAgICAgdGhpcy5zaXplID0gZGF0YS5yZWFkVUludDMyTEUob2Zmc2V0ICsgY29uc3RzLkNFTkxFTik7XG4gICAgICAgIC8vIGZpbGVuYW1lIGxlbmd0aFxuICAgICAgICB0aGlzLmZuYW1lTGVuID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTk5BTSk7XG4gICAgICAgIC8vIGV4dHJhIGZpZWxkIGxlbmd0aFxuICAgICAgICB0aGlzLmV4dHJhTGVuID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0ICsgY29uc3RzLkNFTkVYVCk7XG4gICAgICAgIC8vIGZpbGUgY29tbWVudCBsZW5ndGhcbiAgICAgICAgdGhpcy5jb21MZW4gPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOQ09NKTtcbiAgICAgICAgLy8gdm9sdW1lIG51bWJlciBzdGFydFxuICAgICAgICB0aGlzLmRpc2tTdGFydCA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCArIGNvbnN0cy5DRU5EU0spO1xuICAgICAgICAvLyBpbnRlcm5hbCBmaWxlIGF0dHJpYnV0ZXNcbiAgICAgICAgdGhpcy5pbmF0dHIgPSBkYXRhLnJlYWRVSW50MTZMRShvZmZzZXQgKyBjb25zdHMuQ0VOQVRUKTtcbiAgICAgICAgLy8gZXh0ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXG4gICAgICAgIHRoaXMuYXR0ciA9IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCArIGNvbnN0cy5DRU5BVFgpO1xuICAgICAgICAvLyBMT0MgaGVhZGVyIG9mZnNldFxuICAgICAgICB0aGlzLm9mZnNldCA9IGRhdGEucmVhZFVJbnQzMkxFKG9mZnNldCArIGNvbnN0cy5DRU5PRkYpO1xuICAgIH1cblxuICAgIHJlYWREYXRhSGVhZGVyKGRhdGEpIHtcbiAgICAgICAgLy8gMzAgYnl0ZXMgYW5kIHNob3VsZCBzdGFydCB3aXRoIFwiUEtcXDAwM1xcMDA0XCJcbiAgICAgICAgaWYgKGRhdGEucmVhZFVJbnQzMkxFKDApICE9PSBjb25zdHMuTE9DU0lHKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbG9jYWwgaGVhZGVyJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdmVyc2lvbiBuZWVkZWQgdG8gZXh0cmFjdFxuICAgICAgICB0aGlzLnZlcnNpb24gPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuTE9DVkVSKTtcbiAgICAgICAgLy8gZ2VuZXJhbCBwdXJwb3NlIGJpdCBmbGFnXG4gICAgICAgIHRoaXMuZmxhZ3MgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuTE9DRkxHKTtcbiAgICAgICAgLy8gY29tcHJlc3Npb24gbWV0aG9kXG4gICAgICAgIHRoaXMubWV0aG9kID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ0hPVyk7XG4gICAgICAgIC8vIG1vZGlmaWNhdGlvbiB0aW1lICgyIGJ5dGVzIHRpbWUgOyAyIGJ5dGVzIGRhdGUpXG4gICAgICAgIGNvbnN0IHRpbWVieXRlcyA9IGRhdGEucmVhZFVJbnQxNkxFKGNvbnN0cy5MT0NUSU0pO1xuICAgICAgICBjb25zdCBkYXRlYnl0ZXMgPSBkYXRhLnJlYWRVSW50MTZMRShjb25zdHMuTE9DVElNICsgMik7XG4gICAgICAgIHRoaXMudGltZSA9IHBhcnNlWmlwVGltZSh0aW1lYnl0ZXMsIGRhdGVieXRlcyk7XG5cbiAgICAgICAgLy8gdW5jb21wcmVzc2VkIGZpbGUgY3JjLTMyIHZhbHVlXG4gICAgICAgIHRoaXMuY3JjID0gZGF0YS5yZWFkVUludDMyTEUoY29uc3RzLkxPQ0NSQykgfHwgdGhpcy5jcmM7XG4gICAgICAgIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgICAgICBjb25zdCBjb21wcmVzc2VkU2l6ZSA9IGRhdGEucmVhZFVJbnQzMkxFKGNvbnN0cy5MT0NTSVopO1xuICAgICAgICBpZiAoY29tcHJlc3NlZFNpemUgJiYgY29tcHJlc3NlZFNpemUgIT09IGNvbnN0cy5FRl9aSVA2NF9PUl8zMikge1xuICAgICAgICAgICAgdGhpcy5jb21wcmVzc2VkU2l6ZSA9IGNvbXByZXNzZWRTaXplO1xuICAgICAgICB9XG4gICAgICAgIC8vIHVuY29tcHJlc3NlZCBzaXplXG4gICAgICAgIGNvbnN0IHNpemUgPSBkYXRhLnJlYWRVSW50MzJMRShjb25zdHMuTE9DTEVOKTtcbiAgICAgICAgaWYgKHNpemUgJiYgc2l6ZSAhPT0gY29uc3RzLkVGX1pJUDY0X09SXzMyKSB7XG4gICAgICAgICAgICB0aGlzLnNpemUgPSBzaXplO1xuICAgICAgICB9XG4gICAgICAgIC8vIGZpbGVuYW1lIGxlbmd0aFxuICAgICAgICB0aGlzLmZuYW1lTGVuID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ05BTSk7XG4gICAgICAgIC8vIGV4dHJhIGZpZWxkIGxlbmd0aFxuICAgICAgICB0aGlzLmV4dHJhTGVuID0gZGF0YS5yZWFkVUludDE2TEUoY29uc3RzLkxPQ0VYVCk7XG4gICAgfVxuXG4gICAgcmVhZChkYXRhLCBvZmZzZXQsIHRleHREZWNvZGVyKSB7XG4gICAgICAgIGNvbnN0IG5hbWVEYXRhID0gZGF0YS5zbGljZShvZmZzZXQsIChvZmZzZXQgKz0gdGhpcy5mbmFtZUxlbikpO1xuICAgICAgICB0aGlzLm5hbWUgPSB0ZXh0RGVjb2RlclxuICAgICAgICAgICAgPyB0ZXh0RGVjb2Rlci5kZWNvZGUobmV3IFVpbnQ4QXJyYXkobmFtZURhdGEpKVxuICAgICAgICAgICAgOiBuYW1lRGF0YS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICBjb25zdCBsYXN0Q2hhciA9IGRhdGFbb2Zmc2V0IC0gMV07XG4gICAgICAgIHRoaXMuaXNEaXJlY3RvcnkgPSBsYXN0Q2hhciA9PT0gNDcgfHwgbGFzdENoYXIgPT09IDkyO1xuXG4gICAgICAgIGlmICh0aGlzLmV4dHJhTGVuKSB7XG4gICAgICAgICAgICB0aGlzLnJlYWRFeHRyYShkYXRhLCBvZmZzZXQpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IHRoaXMuZXh0cmFMZW47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb21tZW50ID0gdGhpcy5jb21MZW4gPyBkYXRhLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgdGhpcy5jb21MZW4pLnRvU3RyaW5nKCkgOiBudWxsO1xuICAgIH1cblxuICAgIHZhbGlkYXRlTmFtZSgpIHtcbiAgICAgICAgaWYgKC9cXFxcfF5cXHcrOnxeXFwvfChefFxcLylcXC5cXC4oXFwvfCQpLy50ZXN0KHRoaXMubmFtZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWFsaWNpb3VzIGVudHJ5OiAnICsgdGhpcy5uYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlYWRFeHRyYShkYXRhLCBvZmZzZXQpIHtcbiAgICAgICAgbGV0IHNpZ25hdHVyZSwgc2l6ZTtcbiAgICAgICAgY29uc3QgbWF4UG9zID0gb2Zmc2V0ICsgdGhpcy5leHRyYUxlbjtcbiAgICAgICAgd2hpbGUgKG9mZnNldCA8IG1heFBvcykge1xuICAgICAgICAgICAgc2lnbmF0dXJlID0gZGF0YS5yZWFkVUludDE2TEUob2Zmc2V0KTtcbiAgICAgICAgICAgIG9mZnNldCArPSAyO1xuICAgICAgICAgICAgc2l6ZSA9IGRhdGEucmVhZFVJbnQxNkxFKG9mZnNldCk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gMjtcbiAgICAgICAgICAgIGlmIChjb25zdHMuSURfWklQNjQgPT09IHNpZ25hdHVyZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VaaXA2NEV4dHJhKGRhdGEsIG9mZnNldCwgc2l6ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvZmZzZXQgKz0gc2l6ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBhcnNlWmlwNjRFeHRyYShkYXRhLCBvZmZzZXQsIGxlbmd0aCkge1xuICAgICAgICBpZiAobGVuZ3RoID49IDggJiYgdGhpcy5zaXplID09PSBjb25zdHMuRUZfWklQNjRfT1JfMzIpIHtcbiAgICAgICAgICAgIHRoaXMuc2l6ZSA9IHJlYWRVSW50NjRMRShkYXRhLCBvZmZzZXQpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDg7XG4gICAgICAgICAgICBsZW5ndGggLT0gODtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoID49IDggJiYgdGhpcy5jb21wcmVzc2VkU2l6ZSA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzMyKSB7XG4gICAgICAgICAgICB0aGlzLmNvbXByZXNzZWRTaXplID0gcmVhZFVJbnQ2NExFKGRhdGEsIG9mZnNldCk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gODtcbiAgICAgICAgICAgIGxlbmd0aCAtPSA4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPj0gOCAmJiB0aGlzLm9mZnNldCA9PT0gY29uc3RzLkVGX1pJUDY0X09SXzMyKSB7XG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IHJlYWRVSW50NjRMRShkYXRhLCBvZmZzZXQpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDg7XG4gICAgICAgICAgICBsZW5ndGggLT0gODtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoID49IDQgJiYgdGhpcy5kaXNrU3RhcnQgPT09IGNvbnN0cy5FRl9aSVA2NF9PUl8xNikge1xuICAgICAgICAgICAgdGhpcy5kaXNrU3RhcnQgPSBkYXRhLnJlYWRVSW50MzJMRShvZmZzZXQpO1xuICAgICAgICAgICAgLy8gb2Zmc2V0ICs9IDQ7IGxlbmd0aCAtPSA0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGVuY3J5cHRlZCgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmZsYWdzICYgY29uc3RzLkZMR19FTlRSWV9FTkMpID09PSBjb25zdHMuRkxHX0VOVFJZX0VOQztcbiAgICB9XG5cbiAgICBnZXQgaXNGaWxlKCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuaXNEaXJlY3Rvcnk7XG4gICAgfVxufVxuXG5jbGFzcyBGc1JlYWQge1xuICAgIGNvbnN0cnVjdG9yKGZkLCBidWZmZXIsIG9mZnNldCwgbGVuZ3RoLCBwb3NpdGlvbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5mZCA9IGZkO1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5ieXRlc1JlYWQgPSAwO1xuICAgICAgICB0aGlzLndhaXRpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByZWFkKHN5bmMpIHtcbiAgICAgICAgU3RyZWFtWmlwLmRlYnVnTG9nKCdyZWFkJywgdGhpcy5wb3NpdGlvbiwgdGhpcy5ieXRlc1JlYWQsIHRoaXMubGVuZ3RoLCB0aGlzLm9mZnNldCk7XG4gICAgICAgIHRoaXMud2FpdGluZyA9IHRydWU7XG4gICAgICAgIGxldCBlcnI7XG4gICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICBsZXQgYnl0ZXNSZWFkID0gMDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYnl0ZXNSZWFkID0gZnMucmVhZFN5bmMoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9mZnNldCArIHRoaXMuYnl0ZXNSZWFkLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxlbmd0aCAtIHRoaXMuYnl0ZXNSZWFkLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uICsgdGhpcy5ieXRlc1JlYWRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlYWRDYWxsYmFjayhzeW5jLCBlcnIsIGVyciA/IGJ5dGVzUmVhZCA6IG51bGwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnMucmVhZChcbiAgICAgICAgICAgICAgICB0aGlzLmZkLFxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyLFxuICAgICAgICAgICAgICAgIHRoaXMub2Zmc2V0ICsgdGhpcy5ieXRlc1JlYWQsXG4gICAgICAgICAgICAgICAgdGhpcy5sZW5ndGggLSB0aGlzLmJ5dGVzUmVhZCxcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uICsgdGhpcy5ieXRlc1JlYWQsXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkQ2FsbGJhY2suYmluZCh0aGlzLCBzeW5jKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlYWRDYWxsYmFjayhzeW5jLCBlcnIsIGJ5dGVzUmVhZCkge1xuICAgICAgICBpZiAodHlwZW9mIGJ5dGVzUmVhZCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRoaXMuYnl0ZXNSZWFkICs9IGJ5dGVzUmVhZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXJyIHx8ICFieXRlc1JlYWQgfHwgdGhpcy5ieXRlc1JlYWQgPT09IHRoaXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLndhaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKGVyciwgdGhpcy5ieXRlc1JlYWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZWFkKHN5bmMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBGaWxlV2luZG93QnVmZmVyIHtcbiAgICBjb25zdHJ1Y3RvcihmZCkge1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgICAgICAgdGhpcy5idWZmZXIgPSBCdWZmZXIuYWxsb2MoMCk7XG4gICAgICAgIHRoaXMuZmQgPSBmZDtcbiAgICAgICAgdGhpcy5mc09wID0gbnVsbDtcbiAgICB9XG5cbiAgICBjaGVja09wKCkge1xuICAgICAgICBpZiAodGhpcy5mc09wICYmIHRoaXMuZnNPcC53YWl0aW5nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09wZXJhdGlvbiBpbiBwcm9ncmVzcycpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVhZChwb3MsIGxlbmd0aCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jaGVja09wKCk7XG4gICAgICAgIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmFsbG9jKGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvcztcbiAgICAgICAgdGhpcy5mc09wID0gbmV3IEZzUmVhZCh0aGlzLmZkLCB0aGlzLmJ1ZmZlciwgMCwgbGVuZ3RoLCB0aGlzLnBvc2l0aW9uLCBjYWxsYmFjaykucmVhZCgpO1xuICAgIH1cblxuICAgIGV4cGFuZExlZnQobGVuZ3RoLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNoZWNrT3AoKTtcbiAgICAgICAgdGhpcy5idWZmZXIgPSBCdWZmZXIuY29uY2F0KFtCdWZmZXIuYWxsb2MobGVuZ3RoKSwgdGhpcy5idWZmZXJdKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiAtPSBsZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLnBvc2l0aW9uIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mc09wID0gbmV3IEZzUmVhZCh0aGlzLmZkLCB0aGlzLmJ1ZmZlciwgMCwgbGVuZ3RoLCB0aGlzLnBvc2l0aW9uLCBjYWxsYmFjaykucmVhZCgpO1xuICAgIH1cblxuICAgIGV4cGFuZFJpZ2h0KGxlbmd0aCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jaGVja09wKCk7XG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgdGhpcy5idWZmZXIgPSBCdWZmZXIuY29uY2F0KFt0aGlzLmJ1ZmZlciwgQnVmZmVyLmFsbG9jKGxlbmd0aCldKTtcbiAgICAgICAgdGhpcy5mc09wID0gbmV3IEZzUmVhZChcbiAgICAgICAgICAgIHRoaXMuZmQsXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlcixcbiAgICAgICAgICAgIG9mZnNldCxcbiAgICAgICAgICAgIGxlbmd0aCxcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gKyBvZmZzZXQsXG4gICAgICAgICAgICBjYWxsYmFja1xuICAgICAgICApLnJlYWQoKTtcbiAgICB9XG5cbiAgICBtb3ZlUmlnaHQobGVuZ3RoLCBjYWxsYmFjaywgc2hpZnQpIHtcbiAgICAgICAgdGhpcy5jaGVja09wKCk7XG4gICAgICAgIGlmIChzaGlmdCkge1xuICAgICAgICAgICAgdGhpcy5idWZmZXIuY29weSh0aGlzLmJ1ZmZlciwgMCwgc2hpZnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2hpZnQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9zaXRpb24gKz0gc2hpZnQ7XG4gICAgICAgIHRoaXMuZnNPcCA9IG5ldyBGc1JlYWQoXG4gICAgICAgICAgICB0aGlzLmZkLFxuICAgICAgICAgICAgdGhpcy5idWZmZXIsXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlci5sZW5ndGggLSBzaGlmdCxcbiAgICAgICAgICAgIHNoaWZ0LFxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiArIHRoaXMuYnVmZmVyLmxlbmd0aCAtIHNoaWZ0LFxuICAgICAgICAgICAgY2FsbGJhY2tcbiAgICAgICAgKS5yZWFkKCk7XG4gICAgfVxufVxuXG5jbGFzcyBFbnRyeURhdGFSZWFkZXJTdHJlYW0gZXh0ZW5kcyBzdHJlYW0uUmVhZGFibGUge1xuICAgIGNvbnN0cnVjdG9yKGZkLCBvZmZzZXQsIGxlbmd0aCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmZkID0gZmQ7XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgICAgdGhpcy5wb3MgPSAwO1xuICAgICAgICB0aGlzLnJlYWRDYWxsYmFjayA9IHRoaXMucmVhZENhbGxiYWNrLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgX3JlYWQobikge1xuICAgICAgICBjb25zdCBidWZmZXIgPSBCdWZmZXIuYWxsb2MoTWF0aC5taW4obiwgdGhpcy5sZW5ndGggLSB0aGlzLnBvcykpO1xuICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICAgICAgZnMucmVhZCh0aGlzLmZkLCBidWZmZXIsIDAsIGJ1ZmZlci5sZW5ndGgsIHRoaXMub2Zmc2V0ICsgdGhpcy5wb3MsIHRoaXMucmVhZENhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHVzaChudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlYWRDYWxsYmFjayhlcnIsIGJ5dGVzUmVhZCwgYnVmZmVyKSB7XG4gICAgICAgIHRoaXMucG9zICs9IGJ5dGVzUmVhZDtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB0aGlzLnB1c2gobnVsbCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIWJ5dGVzUmVhZCkge1xuICAgICAgICAgICAgdGhpcy5wdXNoKG51bGwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGJ5dGVzUmVhZCAhPT0gYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGJ1ZmZlciA9IGJ1ZmZlci5zbGljZSgwLCBieXRlc1JlYWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wdXNoKGJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIEVudHJ5VmVyaWZ5U3RyZWFtIGV4dGVuZHMgc3RyZWFtLlRyYW5zZm9ybSB7XG4gICAgY29uc3RydWN0b3IoYmFzZVN0bSwgY3JjLCBzaXplKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMudmVyaWZ5ID0gbmV3IENyY1ZlcmlmeShjcmMsIHNpemUpO1xuICAgICAgICBiYXNlU3RtLm9uKCdlcnJvcicsIChlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF90cmFuc2Zvcm0oZGF0YSwgZW5jb2RpbmcsIGNhbGxiYWNrKSB7XG4gICAgICAgIGxldCBlcnI7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnZlcmlmeS5kYXRhKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBlcnIgPSBlO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKGVyciwgZGF0YSk7XG4gICAgfVxufVxuXG5jbGFzcyBDcmNWZXJpZnkge1xuICAgIGNvbnN0cnVjdG9yKGNyYywgc2l6ZSkge1xuICAgICAgICB0aGlzLmNyYyA9IGNyYztcbiAgICAgICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGNyYzogfjAsXG4gICAgICAgICAgICBzaXplOiAwLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGRhdGEoZGF0YSkge1xuICAgICAgICBjb25zdCBjcmNUYWJsZSA9IENyY1ZlcmlmeS5nZXRDcmNUYWJsZSgpO1xuICAgICAgICBsZXQgY3JjID0gdGhpcy5zdGF0ZS5jcmM7XG4gICAgICAgIGxldCBvZmYgPSAwO1xuICAgICAgICBsZXQgbGVuID0gZGF0YS5sZW5ndGg7XG4gICAgICAgIHdoaWxlICgtLWxlbiA+PSAwKSB7XG4gICAgICAgICAgICBjcmMgPSBjcmNUYWJsZVsoY3JjIF4gZGF0YVtvZmYrK10pICYgMHhmZl0gXiAoY3JjID4+PiA4KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0YXRlLmNyYyA9IGNyYztcbiAgICAgICAgdGhpcy5zdGF0ZS5zaXplICs9IGRhdGEubGVuZ3RoO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaXplID49IHRoaXMuc2l6ZSkge1xuICAgICAgICAgICAgY29uc3QgYnVmID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgICAgICAgICAgYnVmLndyaXRlSW50MzJMRSh+dGhpcy5zdGF0ZS5jcmMgJiAweGZmZmZmZmZmLCAwKTtcbiAgICAgICAgICAgIGNyYyA9IGJ1Zi5yZWFkVUludDMyTEUoMCk7XG4gICAgICAgICAgICBpZiAoY3JjICE9PSB0aGlzLmNyYykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBDUkMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnNpemUgIT09IHRoaXMuc2l6ZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzaXplJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0Q3JjVGFibGUoKSB7XG4gICAgICAgIGxldCBjcmNUYWJsZSA9IENyY1ZlcmlmeS5jcmNUYWJsZTtcbiAgICAgICAgaWYgKCFjcmNUYWJsZSkge1xuICAgICAgICAgICAgQ3JjVmVyaWZ5LmNyY1RhYmxlID0gY3JjVGFibGUgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IDI1NjsgbisrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGMgPSBuO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGsgPSA4OyAtLWsgPj0gMDsgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoYyAmIDEpICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gMHhlZGI4ODMyMCBeIChjID4+PiAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBjID4+PiAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBiLndyaXRlSW50MzJMRShjLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgYyA9IGIucmVhZFVJbnQzMkxFKDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjcmNUYWJsZVtuXSA9IGM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyY1RhYmxlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VaaXBUaW1lKHRpbWVieXRlcywgZGF0ZWJ5dGVzKSB7XG4gICAgY29uc3QgdGltZWJpdHMgPSB0b0JpdHModGltZWJ5dGVzLCAxNik7XG4gICAgY29uc3QgZGF0ZWJpdHMgPSB0b0JpdHMoZGF0ZWJ5dGVzLCAxNik7XG5cbiAgICBjb25zdCBtdCA9IHtcbiAgICAgICAgaDogcGFyc2VJbnQodGltZWJpdHMuc2xpY2UoMCwgNSkuam9pbignJyksIDIpLFxuICAgICAgICBtOiBwYXJzZUludCh0aW1lYml0cy5zbGljZSg1LCAxMSkuam9pbignJyksIDIpLFxuICAgICAgICBzOiBwYXJzZUludCh0aW1lYml0cy5zbGljZSgxMSwgMTYpLmpvaW4oJycpLCAyKSAqIDIsXG4gICAgICAgIFk6IHBhcnNlSW50KGRhdGViaXRzLnNsaWNlKDAsIDcpLmpvaW4oJycpLCAyKSArIDE5ODAsXG4gICAgICAgIE06IHBhcnNlSW50KGRhdGViaXRzLnNsaWNlKDcsIDExKS5qb2luKCcnKSwgMiksXG4gICAgICAgIEQ6IHBhcnNlSW50KGRhdGViaXRzLnNsaWNlKDExLCAxNikuam9pbignJyksIDIpLFxuICAgIH07XG4gICAgY29uc3QgZHRfc3RyID0gW210LlksIG10Lk0sIG10LkRdLmpvaW4oJy0nKSArICcgJyArIFttdC5oLCBtdC5tLCBtdC5zXS5qb2luKCc6JykgKyAnIEdNVCswJztcbiAgICByZXR1cm4gbmV3IERhdGUoZHRfc3RyKS5nZXRUaW1lKCk7XG59XG5cbmZ1bmN0aW9uIHRvQml0cyhkZWMsIHNpemUpIHtcbiAgICBsZXQgYiA9IChkZWMgPj4+IDApLnRvU3RyaW5nKDIpO1xuICAgIHdoaWxlIChiLmxlbmd0aCA8IHNpemUpIHtcbiAgICAgICAgYiA9ICcwJyArIGI7XG4gICAgfVxuICAgIHJldHVybiBiLnNwbGl0KCcnKTtcbn1cblxuZnVuY3Rpb24gcmVhZFVJbnQ2NExFKGJ1ZmZlciwgb2Zmc2V0KSB7XG4gICAgcmV0dXJuIGJ1ZmZlci5yZWFkVUludDMyTEUob2Zmc2V0ICsgNCkgKiAweDAwMDAwMDAxMDAwMDAwMDAgKyBidWZmZXIucmVhZFVJbnQzMkxFKG9mZnNldCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RyZWFtWmlwO1xuIiwgImltcG9ydCB7IENsaXBib2FyZCwgZ2V0UHJlZmVyZW5jZVZhbHVlcywgc2hvd0hVRCwgc2hvd1RvYXN0LCBUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IEJpdHdhcmRlbiB9IGZyb20gXCJ+L2FwaS9iaXR3YXJkZW5cIjtcbmltcG9ydCB7IHNob3dDb3B5U3VjY2Vzc01lc3NhZ2UgfSBmcm9tIFwifi91dGlscy9jbGlwYm9hcmRcIjtcbmltcG9ydCB7IGNhcHR1cmVFeGNlcHRpb24gfSBmcm9tIFwifi91dGlscy9kZXZlbG9wbWVudFwiO1xuaW1wb3J0IHsgZ2V0UGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zIH0gZnJvbSBcIn4vdXRpbHMvcGFzc3dvcmRzXCI7XG5pbXBvcnQgeyBnZXRUcmFuc2llbnRDb3B5UHJlZmVyZW5jZSB9IGZyb20gXCJ+L3V0aWxzL3ByZWZlcmVuY2VzXCI7XG5cbmNvbnN0IHsgZ2VuZXJhdGVQYXNzd29yZFF1aWNrQWN0aW9uIH0gPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmRRdWljaz4oKTtcblxuY29uc3QgYWN0aW9uczogUmVjb3JkPFxuICBQcmVmZXJlbmNlcy5HZW5lcmF0ZVBhc3N3b3JkUXVpY2tbXCJnZW5lcmF0ZVBhc3N3b3JkUXVpY2tBY3Rpb25cIl0sXG4gIChwYXNzd29yZDogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+XG4+ID0ge1xuICBjb3B5OiBhc3luYyAocGFzc3dvcmQpID0+IHtcbiAgICBhd2FpdCBDbGlwYm9hcmQuY29weShwYXNzd29yZCwgeyB0cmFuc2llbnQ6IGdldFRyYW5zaWVudENvcHlQcmVmZXJlbmNlKFwicGFzc3dvcmRcIikgfSk7XG4gICAgYXdhaXQgc2hvd0NvcHlTdWNjZXNzTWVzc2FnZShcIkNvcGllZCBwYXNzd29yZCB0byBjbGlwYm9hcmRcIik7XG4gIH0sXG4gIHBhc3RlOiBhc3luYyAocGFzc3dvcmQpID0+IHtcbiAgICBhd2FpdCBDbGlwYm9hcmQucGFzdGUocGFzc3dvcmQpO1xuICB9LFxuICBjb3B5QW5kUGFzdGU6IGFzeW5jIChwYXNzd29yZCkgPT4ge1xuICAgIGF3YWl0IENsaXBib2FyZC5jb3B5KHBhc3N3b3JkLCB7IHRyYW5zaWVudDogZ2V0VHJhbnNpZW50Q29weVByZWZlcmVuY2UoXCJwYXNzd29yZFwiKSB9KTtcbiAgICBhd2FpdCBDbGlwYm9hcmQucGFzdGUocGFzc3dvcmQpO1xuICAgIGF3YWl0IHNob3dIVUQoXCJDb3BpZWQgcGFzc3dvcmQgdG8gY2xpcGJvYXJkXCIpO1xuICB9LFxufTtcblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQYXNzd29yZFF1aWNrQ29tbWFuZCgpIHtcbiAgY29uc3QgdG9hc3QgPSBhd2FpdCBzaG93VG9hc3QoVG9hc3QuU3R5bGUuQW5pbWF0ZWQsIFwiR2VuZXJhdGluZyBwYXNzd29yZC4uLlwiKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBiaXR3YXJkZW4gPSBhd2FpdCBuZXcgQml0d2FyZGVuKHRvYXN0KS5pbml0aWFsaXplKCk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IGF3YWl0IGdldFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucygpO1xuICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgYml0d2FyZGVuLmdlbmVyYXRlUGFzc3dvcmQob3B0aW9ucyk7XG4gICAgYXdhaXQgYWN0aW9uc1tnZW5lcmF0ZVBhc3N3b3JkUXVpY2tBY3Rpb25dKHBhc3N3b3JkKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLkZhaWx1cmU7XG4gICAgdG9hc3QubWVzc2FnZSA9IFwiRmFpbGVkIHRvIGdlbmVyYXRlXCI7XG4gICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBnZW5lcmF0ZSBwYXNzd29yZFwiLCBlcnJvcik7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2VuZXJhdGVQYXNzd29yZFF1aWNrQ29tbWFuZDtcbiIsICJpbXBvcnQgeyBlbnZpcm9ubWVudCwgZ2V0UHJlZmVyZW5jZVZhbHVlcywgTG9jYWxTdG9yYWdlLCBvcGVuLCBzaG93VG9hc3QsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgZXhlY2EsIEV4ZWNhQ2hpbGRQcm9jZXNzLCBFeGVjYUVycm9yLCBFeGVjYVJldHVyblZhbHVlIH0gZnJvbSBcImV4ZWNhXCI7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCB1bmxpbmtTeW5jLCB3cml0ZUZpbGVTeW5jLCBhY2Nlc3NTeW5jLCBjb25zdGFudHMsIGNobW9kU3luYyB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgTE9DQUxfU1RPUkFHRV9LRVksIERFRkFVTFRfU0VSVkVSX1VSTCwgQ0FDSEVfS0VZUyB9IGZyb20gXCJ+L2NvbnN0YW50cy9nZW5lcmFsXCI7XG5pbXBvcnQgeyBWYXVsdFN0YXRlLCBWYXVsdFN0YXR1cyB9IGZyb20gXCJ+L3R5cGVzL2dlbmVyYWxcIjtcbmltcG9ydCB7IFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gXCJ+L3R5cGVzL3Bhc3N3b3Jkc1wiO1xuaW1wb3J0IHsgRm9sZGVyLCBJdGVtLCBJdGVtVHlwZSwgTG9naW4gfSBmcm9tIFwifi90eXBlcy92YXVsdFwiO1xuaW1wb3J0IHsgZ2V0UGFzc3dvcmRHZW5lcmF0aW5nQXJncyB9IGZyb20gXCJ+L3V0aWxzL3Bhc3N3b3Jkc1wiO1xuaW1wb3J0IHsgZ2V0U2VydmVyVXJsUHJlZmVyZW5jZSB9IGZyb20gXCJ+L3V0aWxzL3ByZWZlcmVuY2VzXCI7XG5pbXBvcnQge1xuICBFbnN1cmVDbGlCaW5FcnJvcixcbiAgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvcixcbiAgTWFudWFsbHlUaHJvd25FcnJvcixcbiAgTm90TG9nZ2VkSW5FcnJvcixcbiAgUHJlbWl1bUZlYXR1cmVFcnJvcixcbiAgU2VuZEludmFsaWRQYXNzd29yZEVycm9yLFxuICBTZW5kTmVlZHNQYXNzd29yZEVycm9yLFxuICB0cnlFeGVjLFxuICBWYXVsdElzTG9ja2VkRXJyb3IsXG59IGZyb20gXCJ+L3V0aWxzL2Vycm9yc1wiO1xuaW1wb3J0IHsgam9pbiwgZGlybmFtZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjaG1vZCwgcmVuYW1lLCBybSB9IGZyb20gXCJmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHsgZGVjb21wcmVzc0ZpbGUsIHJlbW92ZUZpbGVzVGhhdFN0YXJ0V2l0aCwgdW5saW5rQWxsU3luYywgd2FpdEZvckZpbGVBdmFpbGFibGUgfSBmcm9tIFwifi91dGlscy9mc1wiO1xuaW1wb3J0IHsgZG93bmxvYWQgfSBmcm9tIFwifi91dGlscy9uZXR3b3JrXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIH0gZnJvbSBcIn4vdXRpbHMvZGV2ZWxvcG1lbnRcIjtcbmltcG9ydCB7IFJlY2VpdmVkU2VuZCwgU2VuZCwgU2VuZENyZWF0ZVBheWxvYWQsIFNlbmRUeXBlIH0gZnJvbSBcIn4vdHlwZXMvc2VuZFwiO1xuaW1wb3J0IHsgcHJlcGFyZVNlbmRQYXlsb2FkIH0gZnJvbSBcIn4vYXBpL2JpdHdhcmRlbi5oZWxwZXJzXCI7XG5pbXBvcnQgeyBDYWNoZSB9IGZyb20gXCJ+L3V0aWxzL2NhY2hlXCI7XG5pbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gXCJ+L3V0aWxzL3BsYXRmb3JtXCI7XG5cbnR5cGUgRW52ID0ge1xuICBCSVRXQVJERU5DTElfQVBQREFUQV9ESVI6IHN0cmluZztcbiAgQldfQ0xJRU5UU0VDUkVUOiBzdHJpbmc7XG4gIEJXX0NMSUVOVElEOiBzdHJpbmc7XG4gIFBBVEg6IHN0cmluZztcbiAgTk9ERV9FWFRSQV9DQV9DRVJUUz86IHN0cmluZztcbiAgQldfU0VTU0lPTj86IHN0cmluZztcbn07XG5cbnR5cGUgQWN0aW9uTGlzdGVuZXJzID0ge1xuICBsb2dpbj86ICgpID0+IE1heWJlUHJvbWlzZTx2b2lkPjtcbiAgbG9nb3V0PzogKHJlYXNvbj86IHN0cmluZykgPT4gTWF5YmVQcm9taXNlPHZvaWQ+O1xuICBsb2NrPzogKHJlYXNvbj86IHN0cmluZykgPT4gTWF5YmVQcm9taXNlPHZvaWQ+O1xuICB1bmxvY2s/OiAocGFzc3dvcmQ6IHN0cmluZywgc2Vzc2lvblRva2VuOiBzdHJpbmcpID0+IE1heWJlUHJvbWlzZTx2b2lkPjtcbn07XG5cbnR5cGUgQWN0aW9uTGlzdGVuZXJzTWFwPFQgZXh0ZW5kcyBrZXlvZiBBY3Rpb25MaXN0ZW5lcnMgPSBrZXlvZiBBY3Rpb25MaXN0ZW5lcnM+ID0gTWFwPFQsIFNldDxBY3Rpb25MaXN0ZW5lcnNbVF0+PjtcblxudHlwZSBNYXliZUVycm9yPFQgPSB1bmRlZmluZWQ+ID0geyByZXN1bHQ6IFQ7IGVycm9yPzogdW5kZWZpbmVkIH0gfCB7IHJlc3VsdD86IHVuZGVmaW5lZDsgZXJyb3I6IE1hbnVhbGx5VGhyb3duRXJyb3IgfTtcblxudHlwZSBFeGVjUHJvcHMgPSB7XG4gIC8qKiBSZXNldCB0aGUgdGltZSBvZiB0aGUgbGFzdCBjb21tYW5kIHRoYXQgYWNjZXNzZWQgZGF0YSBvciBtb2RpZmllZCB0aGUgdmF1bHQsIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSB2YXVsdCB0aW1lZCBvdXQgKi9cbiAgcmVzZXRWYXVsdFRpbWVvdXQ6IGJvb2xlYW47XG4gIGFib3J0Q29udHJvbGxlcj86IEFib3J0Q29udHJvbGxlcjtcbiAgaW5wdXQ/OiBzdHJpbmc7XG59O1xuXG50eXBlIExvY2tPcHRpb25zID0ge1xuICAvKiogVGhlIHJlYXNvbiBmb3IgbG9ja2luZyB0aGUgdmF1bHQgKi9cbiAgcmVhc29uPzogc3RyaW5nO1xuICBjaGVja1ZhdWx0U3RhdHVzPzogYm9vbGVhbjtcbiAgLyoqIFRoZSBjYWxsYmFja3MgYXJlIGNhbGxlZCBiZWZvcmUgdGhlIG9wZXJhdGlvbiBpcyBmaW5pc2hlZCAob3B0aW1pc3RpYykgKi9cbiAgaW1tZWRpYXRlPzogYm9vbGVhbjtcbn07XG5cbnR5cGUgTG9nb3V0T3B0aW9ucyA9IHtcbiAgLyoqIFRoZSByZWFzb24gZm9yIGxvY2tpbmcgdGhlIHZhdWx0ICovXG4gIHJlYXNvbj86IHN0cmluZztcbiAgLyoqIFRoZSBjYWxsYmFja3MgYXJlIGNhbGxlZCBiZWZvcmUgdGhlIG9wZXJhdGlvbiBpcyBmaW5pc2hlZCAob3B0aW1pc3RpYykgKi9cbiAgaW1tZWRpYXRlPzogYm9vbGVhbjtcbn07XG5cbnR5cGUgUmVjZWl2ZVNlbmRPcHRpb25zID0ge1xuICBzYXZlUGF0aD86IHN0cmluZztcbiAgcGFzc3dvcmQ/OiBzdHJpbmc7XG59O1xuXG50eXBlIENyZWF0ZUxvZ2luSXRlbU9wdGlvbnMgPSB7XG4gIG5hbWU6IHN0cmluZztcbiAgdXNlcm5hbWU/OiBzdHJpbmc7XG4gIHBhc3N3b3JkOiBzdHJpbmc7XG4gIGZvbGRlcklkOiBzdHJpbmcgfCBudWxsO1xuICB1cmk/OiBzdHJpbmc7XG59O1xuXG5jb25zdCB7IHN1cHBvcnRQYXRoIH0gPSBlbnZpcm9ubWVudDtcblxuY29uc3QgXHUwMzk0ID0gXCI0XCI7IC8vIGNoYW5naW5nIHRoaXMgZm9yY2VzIGEgbmV3IGJpbiBkb3dubG9hZCBmb3IgcGVvcGxlIHRoYXQgaGFkIGEgZmFpbGVkIG9uZVxuY29uc3QgQmluRG93bmxvYWRMb2dnZXIgPSAoKCkgPT4ge1xuICAvKiBUaGUgaWRlYSBvZiB0aGlzIGxvZ2dlciBpcyB0byB3cml0ZSBhIGxvZyBmaWxlIHdoZW4gdGhlIGJpbiBkb3dubG9hZCBmYWlscywgc28gdGhhdCB3ZSBjYW4gbGV0IHRoZSBleHRlbnNpb24gY3Jhc2gsXG4gICBidXQgZmFsbGJhY2sgdG8gdGhlIGxvY2FsIGNsaSBwYXRoIGluIHRoZSBuZXh0IGxhdW5jaC4gVGhpcyBhbGxvd3MgdGhlIGVycm9yIHRvIGJlIHJlcG9ydGVkIGluIHRoZSBpc3N1ZXMgZGFzaGJvYXJkLiBJdCB1c2VzIGZpbGVzIHRvIGtlZXAgaXQgc3luY2hyb25vdXMsIGFzIGl0J3MgbmVlZGVkIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgIEFsdGhvdWdoLCB0aGUgcGxhbiBpcyB0byBkaXNjb250aW51ZSB0aGlzIG1ldGhvZCwgaWYgdGhlcmUncyBhIGJldHRlciB3YXkgb2YgbG9nZ2luZyBlcnJvcnMgaW4gdGhlIGlzc3VlcyBkYXNoYm9hcmRcbiAgIG9yIHRoZXJlIGFyZSBubyBjcmFzaGVzIHJlcG9ydGVkIHdpdGggdGhlIGJpbiBkb3dubG9hZCBhZnRlciBzb21lIHRpbWUuICovXG4gIGNvbnN0IGZpbGVQYXRoID0gam9pbihzdXBwb3J0UGF0aCwgYGJ3LWJpbi1kb3dubG9hZC1lcnJvci0ke1x1MDM5NH0ubG9nYCk7XG4gIHJldHVybiB7XG4gICAgbG9nRXJyb3I6IChlcnJvcjogYW55KSA9PiB0cnlFeGVjKCgpID0+IHdyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGVycm9yPy5tZXNzYWdlID8/IFwiVW5leHBlY3RlZCBlcnJvclwiKSksXG4gICAgY2xlYXJFcnJvcjogKCkgPT4gdHJ5RXhlYygoKSA9PiB1bmxpbmtTeW5jKGZpbGVQYXRoKSksXG4gICAgaGFzRXJyb3I6ICgpID0+IHRyeUV4ZWMoKCkgPT4gZXhpc3RzU3luYyhmaWxlUGF0aCksIGZhbHNlKSxcbiAgfTtcbn0pKCk7XG5cbmV4cG9ydCBjb25zdCBjbGlJbmZvID0ge1xuICB2ZXJzaW9uOiBcIjIwMjUuMi4wXCIsXG4gIGdldCBzaGEyNTYoKSB7XG4gICAgaWYgKHBsYXRmb3JtID09PSBcIndpbmRvd3NcIikgcmV0dXJuIFwiMzNhMTMxMDE3YWM5Yzk5ZDcyMWU0MzBhODZlOTI5MzgzMzE0ZDNmOTFjOWYyZmJmNDEzZDg3MjU2NTY1NGMxOFwiO1xuICAgIHJldHVybiBcImZhZGU1MTAxMmE0NjAxMWMwMTZhMmU1YWVlMmYyZTUzNGMxZWQwNzhlNDlkMTE3OGE2OWUyODg5ZDI4MTJhOTZcIjtcbiAgfSxcbiAgZG93bmxvYWRQYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iaXR3YXJkZW4vY2xpZW50cy9yZWxlYXNlc1wiLFxuICBwYXRoOiB7XG4gICAgZ2V0IGRvd25sb2FkZWRCaW4oKSB7XG4gICAgICByZXR1cm4gam9pbihzdXBwb3J0UGF0aCwgY2xpSW5mby5iaW5GaWxlbmFtZVZlcnNpb25lZCk7XG4gICAgfSxcbiAgICBnZXQgaW5zdGFsbGVkQmluKCkge1xuICAgICAgLy8gV2UgYXNzdW1lIHRoYXQgaXQgd2FzIGluc3RhbGxlZCB1c2luZyBDaG9jb2xhdGV5LCBpZiBub3QsIGl0J3MgaGFyZCB0byBtYWtlIGEgZ29vZCBndWVzcy5cbiAgICAgIGlmIChwbGF0Zm9ybSA9PT0gXCJ3aW5kb3dzXCIpIHJldHVybiBcIkM6XFxcXFByb2dyYW1EYXRhXFxcXGNob2NvbGF0ZXlcXFxcYmluXFxcXGJ3LmV4ZVwiO1xuICAgICAgcmV0dXJuIHByb2Nlc3MuYXJjaCA9PT0gXCJhcm02NFwiID8gXCIvb3B0L2hvbWVicmV3L2Jpbi9id1wiIDogXCIvdXNyL2xvY2FsL2Jpbi9id1wiO1xuICAgIH0sXG4gICAgZ2V0IGJpbigpIHtcbiAgICAgIHJldHVybiAhQmluRG93bmxvYWRMb2dnZXIuaGFzRXJyb3IoKSA/IHRoaXMuZG93bmxvYWRlZEJpbiA6IHRoaXMuaW5zdGFsbGVkQmluO1xuICAgIH0sXG4gIH0sXG4gIGdldCBiaW5GaWxlbmFtZSgpIHtcbiAgICByZXR1cm4gcGxhdGZvcm0gPT09IFwid2luZG93c1wiID8gXCJidy5leGVcIiA6IFwiYndcIjtcbiAgfSxcbiAgZ2V0IGJpbkZpbGVuYW1lVmVyc2lvbmVkKCkge1xuICAgIGNvbnN0IG5hbWUgPSBgYnctJHt0aGlzLnZlcnNpb259YDtcbiAgICByZXR1cm4gcGxhdGZvcm0gPT09IFwid2luZG93c1wiID8gYCR7bmFtZX0uZXhlYCA6IGAke25hbWV9YDtcbiAgfSxcbiAgZ2V0IGRvd25sb2FkVXJsKCkge1xuICAgIGxldCBhcmNoU3VmZml4ID0gXCJcIjtcbiAgICBpZiAocGxhdGZvcm0gPT09IFwibWFjb3NcIikge1xuICAgICAgYXJjaFN1ZmZpeCA9IHByb2Nlc3MuYXJjaCA9PT0gXCJhcm02NFwiID8gXCItYXJtNjRcIiA6IFwiXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAke3RoaXMuZG93bmxvYWRQYWdlfS9kb3dubG9hZC9jbGktdiR7dGhpcy52ZXJzaW9ufS9idy0ke3BsYXRmb3JtfSR7YXJjaFN1ZmZpeH0tJHt0aGlzLnZlcnNpb259LnppcGA7XG4gIH0sXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY2xhc3MgQml0d2FyZGVuIHtcbiAgcHJpdmF0ZSBlbnY6IEVudjtcbiAgcHJpdmF0ZSBpbml0UHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcbiAgcHJpdmF0ZSB0ZW1wU2Vzc2lvblRva2VuPzogc3RyaW5nO1xuICBwcml2YXRlIGFjdGlvbkxpc3RlbmVyczogQWN0aW9uTGlzdGVuZXJzTWFwID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIHByZWZlcmVuY2VzID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcz4oKTtcbiAgcHJpdmF0ZSBjbGlQYXRoOiBzdHJpbmc7XG4gIHByaXZhdGUgdG9hc3RJbnN0YW5jZTogVG9hc3QgfCB1bmRlZmluZWQ7XG4gIHdhc0NsaVVwZGF0ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3Rvcih0b2FzdEluc3RhbmNlPzogVG9hc3QpIHtcbiAgICBjb25zdCB7IGNsaVBhdGg6IGNsaVBhdGhQcmVmZXJlbmNlLCBjbGllbnRJZCwgY2xpZW50U2VjcmV0LCBzZXJ2ZXJDZXJ0c1BhdGggfSA9IHRoaXMucHJlZmVyZW5jZXM7XG4gICAgY29uc3Qgc2VydmVyVXJsID0gZ2V0U2VydmVyVXJsUHJlZmVyZW5jZSgpO1xuXG4gICAgdGhpcy50b2FzdEluc3RhbmNlID0gdG9hc3RJbnN0YW5jZTtcbiAgICB0aGlzLmNsaVBhdGggPSBjbGlQYXRoUHJlZmVyZW5jZSB8fCBjbGlJbmZvLnBhdGguYmluO1xuICAgIHRoaXMuZW52ID0ge1xuICAgICAgQklUV0FSREVOQ0xJX0FQUERBVEFfRElSOiBzdXBwb3J0UGF0aCxcbiAgICAgIEJXX0NMSUVOVFNFQ1JFVDogY2xpZW50U2VjcmV0LnRyaW0oKSxcbiAgICAgIEJXX0NMSUVOVElEOiBjbGllbnRJZC50cmltKCksXG4gICAgICBQQVRIOiBkaXJuYW1lKHByb2Nlc3MuZXhlY1BhdGgpLFxuICAgICAgLi4uKHNlcnZlclVybCAmJiBzZXJ2ZXJDZXJ0c1BhdGggPyB7IE5PREVfRVhUUkFfQ0FfQ0VSVFM6IHNlcnZlckNlcnRzUGF0aCB9IDoge30pLFxuICAgIH07XG5cbiAgICB0aGlzLmluaXRQcm9taXNlID0gKGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuZW5zdXJlQ2xpQmluYXJ5KCk7XG4gICAgICB2b2lkIHRoaXMucmV0cmlldmVBbmRDYWNoZUNsaVZlcnNpb24oKTtcbiAgICAgIGF3YWl0IHRoaXMuY2hlY2tTZXJ2ZXJVcmwoc2VydmVyVXJsKTtcbiAgICB9KSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVDbGlCaW5hcnkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuY2hlY2tDbGlCaW5Jc1JlYWR5KHRoaXMuY2xpUGF0aCkpIHJldHVybjtcbiAgICBpZiAodGhpcy5jbGlQYXRoID09PSB0aGlzLnByZWZlcmVuY2VzLmNsaVBhdGggfHwgdGhpcy5jbGlQYXRoID09PSBjbGlJbmZvLnBhdGguaW5zdGFsbGVkQmluKSB7XG4gICAgICB0aHJvdyBuZXcgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvcihgQml0d2FyZGVuIENMSSBub3QgZm91bmQgYXQgJHt0aGlzLmNsaVBhdGh9YCk7XG4gICAgfVxuICAgIGlmIChCaW5Eb3dubG9hZExvZ2dlci5oYXNFcnJvcigpKSBCaW5Eb3dubG9hZExvZ2dlci5jbGVhckVycm9yKCk7XG5cbiAgICAvLyByZW1vdmUgb2xkIGJpbmFyaWVzIHRvIGNoZWNrIGlmIGl0J3MgYW4gdXBkYXRlIGFuZCBiZWNhdXNlIHRoZXkgYXJlIDEwME1CK1xuICAgIGNvbnN0IGhhZE9sZEJpbmFyaWVzID0gYXdhaXQgcmVtb3ZlRmlsZXNUaGF0U3RhcnRXaXRoKFwiYnctXCIsIHN1cHBvcnRQYXRoKTtcbiAgICBjb25zdCB0b2FzdCA9IGF3YWl0IHRoaXMuc2hvd1RvYXN0KHtcbiAgICAgIHRpdGxlOiBgJHtoYWRPbGRCaW5hcmllcyA/IFwiVXBkYXRpbmdcIiA6IFwiSW5pdGlhbGl6aW5nXCJ9IEJpdHdhcmRlbiBDTElgLFxuICAgICAgc3R5bGU6IFRvYXN0LlN0eWxlLkFuaW1hdGVkLFxuICAgICAgcHJpbWFyeUFjdGlvbjogeyB0aXRsZTogXCJPcGVuIERvd25sb2FkIFBhZ2VcIiwgb25BY3Rpb246ICgpID0+IG9wZW4oY2xpSW5mby5kb3dubG9hZFBhZ2UpIH0sXG4gICAgfSk7XG4gICAgY29uc3QgdG1wRmlsZU5hbWUgPSBcImJ3LnppcFwiO1xuICAgIGNvbnN0IHppcFBhdGggPSBqb2luKHN1cHBvcnRQYXRoLCB0bXBGaWxlTmFtZSk7XG5cbiAgICB0cnkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdG9hc3QubWVzc2FnZSA9IFwiRG93bmxvYWRpbmcuLi5cIjtcbiAgICAgICAgYXdhaXQgZG93bmxvYWQoY2xpSW5mby5kb3dubG9hZFVybCwgemlwUGF0aCwge1xuICAgICAgICAgIG9uUHJvZ3Jlc3M6IChwZXJjZW50KSA9PiAodG9hc3QubWVzc2FnZSA9IGBEb3dubG9hZGluZyAke3BlcmNlbnR9JWApLFxuICAgICAgICAgIHNoYTI1NjogY2xpSW5mby5zaGEyNTYsXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZG93bmxvYWRFcnJvcikge1xuICAgICAgICB0b2FzdC50aXRsZSA9IFwiRmFpbGVkIHRvIGRvd25sb2FkIEJpdHdhcmRlbiBDTElcIjtcbiAgICAgICAgdGhyb3cgZG93bmxvYWRFcnJvcjtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgdG9hc3QubWVzc2FnZSA9IFwiRXh0cmFjdGluZy4uLlwiO1xuICAgICAgICBhd2FpdCBkZWNvbXByZXNzRmlsZSh6aXBQYXRoLCBzdXBwb3J0UGF0aCk7XG4gICAgICAgIGNvbnN0IGRlY29tcHJlc3NlZEJpblBhdGggPSBqb2luKHN1cHBvcnRQYXRoLCBjbGlJbmZvLmJpbkZpbGVuYW1lKTtcblxuICAgICAgICAvLyBGb3Igc29tZSByZWFzb24gdGhpcyByZW5hbWUgc3RhcnRlZCB0aHJvd2luZyBhbiBlcnJvciBhZnRlciBzdWNjZWVkaW5nLCBzbyBmb3Igbm93IHdlJ3JlIGp1c3RcbiAgICAgICAgLy8gY2F0Y2hpbmcgaXQgYW5kIGNoZWNraW5nIGlmIHRoZSBmaWxlIGV4aXN0cyBcdTAwQUZcXF8oXHUzMEM0KV8vXHUwMEFGXG4gICAgICAgIGF3YWl0IHJlbmFtZShkZWNvbXByZXNzZWRCaW5QYXRoLCB0aGlzLmNsaVBhdGgpLmNhdGNoKCgpID0+IG51bGwpO1xuICAgICAgICBhd2FpdCB3YWl0Rm9yRmlsZUF2YWlsYWJsZSh0aGlzLmNsaVBhdGgpO1xuXG4gICAgICAgIGF3YWl0IGNobW9kKHRoaXMuY2xpUGF0aCwgXCI3NTVcIik7XG4gICAgICAgIGF3YWl0IHJtKHppcFBhdGgsIHsgZm9yY2U6IHRydWUgfSk7XG5cbiAgICAgICAgQ2FjaGUuc2V0KENBQ0hFX0tFWVMuQ0xJX1ZFUlNJT04sIGNsaUluZm8udmVyc2lvbik7XG4gICAgICAgIHRoaXMud2FzQ2xpVXBkYXRlZCA9IHRydWU7XG4gICAgICB9IGNhdGNoIChleHRyYWN0RXJyb3IpIHtcbiAgICAgICAgdG9hc3QudGl0bGUgPSBcIkZhaWxlZCB0byBleHRyYWN0IEJpdHdhcmRlbiBDTElcIjtcbiAgICAgICAgdGhyb3cgZXh0cmFjdEVycm9yO1xuICAgICAgfVxuICAgICAgYXdhaXQgdG9hc3QuaGlkZSgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0b2FzdC5tZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFbnN1cmVDbGlCaW5FcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlBsZWFzZSB0cnkgYWdhaW5cIjtcbiAgICAgIHRvYXN0LnN0eWxlID0gVG9hc3QuU3R5bGUuRmFpbHVyZTtcblxuICAgICAgdW5saW5rQWxsU3luYyh6aXBQYXRoLCB0aGlzLmNsaVBhdGgpO1xuXG4gICAgICBpZiAoIWVudmlyb25tZW50LmlzRGV2ZWxvcG1lbnQpIEJpbkRvd25sb2FkTG9nZ2VyLmxvZ0Vycm9yKGVycm9yKTtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB0aHJvdyBuZXcgRW5zdXJlQ2xpQmluRXJyb3IoZXJyb3IubWVzc2FnZSwgZXJyb3Iuc3RhY2spO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGF3YWl0IHRvYXN0LnJlc3RvcmUoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHJldHJpZXZlQW5kQ2FjaGVDbGlWZXJzaW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVycm9yLCByZXN1bHQgfSA9IGF3YWl0IHRoaXMuZ2V0VmVyc2lvbigpO1xuICAgICAgaWYgKCFlcnJvcikgQ2FjaGUuc2V0KENBQ0hFX0tFWVMuQ0xJX1ZFUlNJT04sIHJlc3VsdCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gcmV0cmlldmUgYW5kIGNhY2hlIGNsaSB2ZXJzaW9uXCIsIGVycm9yLCB7IGNhcHR1cmVUb1JheWNhc3Q6IHRydWUgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0NsaUJpbklzUmVhZHkoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWV4aXN0c1N5bmModGhpcy5jbGlQYXRoKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgYWNjZXNzU3luYyhmaWxlUGF0aCwgY29uc3RhbnRzLlhfT0spO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCB7XG4gICAgICBjaG1vZFN5bmMoZmlsZVBhdGgsIFwiNzU1XCIpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgc2V0U2Vzc2lvblRva2VuKHRva2VuOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmVudiA9IHtcbiAgICAgIC4uLnRoaXMuZW52LFxuICAgICAgQldfU0VTU0lPTjogdG9rZW4sXG4gICAgfTtcbiAgfVxuXG4gIGNsZWFyU2Vzc2lvblRva2VuKCk6IHZvaWQge1xuICAgIGRlbGV0ZSB0aGlzLmVudi5CV19TRVNTSU9OO1xuICB9XG5cbiAgd2l0aFNlc3Npb24odG9rZW46IHN0cmluZyk6IHRoaXMge1xuICAgIHRoaXMudGVtcFNlc3Npb25Ub2tlbiA9IHRva2VuO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHRoaXM+IHtcbiAgICBhd2FpdCB0aGlzLmluaXRQcm9taXNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXN5bmMgY2hlY2tTZXJ2ZXJVcmwoc2VydmVyVXJsOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBDaGVjayB0aGUgQ0xJIGhhcyBiZWVuIGNvbmZpZ3VyZWQgdG8gdXNlIHRoZSBwcmVmZXJlbmNlIFVybFxuICAgIGNvbnN0IHN0b3JlZFNlcnZlciA9IGF3YWl0IExvY2FsU3RvcmFnZS5nZXRJdGVtPHN0cmluZz4oTE9DQUxfU1RPUkFHRV9LRVkuU0VSVkVSX1VSTCk7XG4gICAgaWYgKCFzZXJ2ZXJVcmwgfHwgc3RvcmVkU2VydmVyID09PSBzZXJ2ZXJVcmwpIHJldHVybjtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc2VydmVyIFVybFxuICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgdGhpcy5zaG93VG9hc3Qoe1xuICAgICAgc3R5bGU6IFRvYXN0LlN0eWxlLkFuaW1hdGVkLFxuICAgICAgdGl0bGU6IFwiU3dpdGNoaW5nIHNlcnZlci4uLlwiLFxuICAgICAgbWVzc2FnZTogXCJCaXR3YXJkZW4gc2VydmVyIHByZWZlcmVuY2UgY2hhbmdlZFwiLFxuICAgIH0pO1xuICAgIHRyeSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmxvZ291dCgpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIEl0IGRvZXNuJ3QgbWF0dGVyIGlmIHdlIHdlcmVuJ3QgbG9nZ2VkIGluLlxuICAgICAgfVxuICAgICAgLy8gSWYgVVJMIGlzIGVtcHR5LCBzZXQgaXQgdG8gdGhlIGRlZmF1bHRcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJjb25maWdcIiwgXCJzZXJ2ZXJcIiwgc2VydmVyVXJsIHx8IERFRkFVTFRfU0VSVkVSX1VSTF0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgYXdhaXQgTG9jYWxTdG9yYWdlLnNldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuU0VSVkVSX1VSTCwgc2VydmVyVXJsKTtcblxuICAgICAgdG9hc3Quc3R5bGUgPSBUb2FzdC5TdHlsZS5TdWNjZXNzO1xuICAgICAgdG9hc3QudGl0bGUgPSBcIlN1Y2Nlc3NcIjtcbiAgICAgIHRvYXN0Lm1lc3NhZ2UgPSBcIkJpdHdhcmRlbiBzZXJ2ZXIgY2hhbmdlZFwiO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0b2FzdC5zdHlsZSA9IFRvYXN0LlN0eWxlLkZhaWx1cmU7XG4gICAgICB0b2FzdC50aXRsZSA9IFwiRmFpbGVkIHRvIHN3aXRjaCBzZXJ2ZXJcIjtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRvYXN0Lm1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9hc3QubWVzc2FnZSA9IFwiVW5rbm93biBlcnJvciBvY2N1cnJlZFwiO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBhd2FpdCB0b2FzdC5yZXN0b3JlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBleGVjKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBFeGVjUHJvcHMpOiBQcm9taXNlPEV4ZWNhQ2hpbGRQcm9jZXNzPiB7XG4gICAgY29uc3QgeyBhYm9ydENvbnRyb2xsZXIsIGlucHV0ID0gXCJcIiwgcmVzZXRWYXVsdFRpbWVvdXQgfSA9IG9wdGlvbnMgPz8ge307XG5cbiAgICBsZXQgZW52ID0gdGhpcy5lbnY7XG4gICAgaWYgKHRoaXMudGVtcFNlc3Npb25Ub2tlbikge1xuICAgICAgZW52ID0geyAuLi5lbnYsIEJXX1NFU1NJT046IHRoaXMudGVtcFNlc3Npb25Ub2tlbiB9O1xuICAgICAgdGhpcy50ZW1wU2Vzc2lvblRva2VuID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWNhKHRoaXMuY2xpUGF0aCwgYXJncywgeyBpbnB1dCwgZW52LCBzaWduYWw6IGFib3J0Q29udHJvbGxlcj8uc2lnbmFsIH0pO1xuXG4gICAgaWYgKHRoaXMuaXNQcm9tcHRXYWl0aW5nRm9yTWFzdGVyUGFzc3dvcmQocmVzdWx0KSkge1xuICAgICAgLyogc2luY2Ugd2UgaGF2ZSB0aGUgc2Vzc2lvbiB0b2tlbiBpbiB0aGUgZW52LCB0aGUgcGFzc3dvcmQgXG4gICAgICBzaG91bGQgbm90IGJlIHJlcXVlc3RlZCwgdW5sZXNzIHRoZSB2YXVsdCBpcyBsb2NrZWQgKi9cbiAgICAgIGF3YWl0IHRoaXMubG9jaygpO1xuICAgICAgdGhyb3cgbmV3IFZhdWx0SXNMb2NrZWRFcnJvcigpO1xuICAgIH1cblxuICAgIGlmIChyZXNldFZhdWx0VGltZW91dCkge1xuICAgICAgYXdhaXQgTG9jYWxTdG9yYWdlLnNldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuTEFTVF9BQ1RJVklUWV9USU1FLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBhc3luYyBnZXRWZXJzaW9uKCk6IFByb21pc2U8TWF5YmVFcnJvcjxzdHJpbmc+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0OiByZXN1bHQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCItLXZlcnNpb25cIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0IH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGdldCBjbGkgdmVyc2lvblwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbG9naW4oKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJsb2dpblwiLCBcIi0tYXBpa2V5XCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwibG9naW5cIiwgXCJ1bmxvY2tlZFwiKTtcbiAgICAgIGF3YWl0IHRoaXMuY2FsbEFjdGlvbkxpc3RlbmVycyhcImxvZ2luXCIpO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gbG9naW5cIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxvZ291dChvcHRpb25zPzogTG9nb3V0T3B0aW9ucyk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIGNvbnN0IHsgcmVhc29uLCBpbW1lZGlhdGUgPSBmYWxzZSB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICB0cnkge1xuICAgICAgaWYgKGltbWVkaWF0ZSkgYXdhaXQgdGhpcy5oYW5kbGVQb3N0TG9nb3V0KHJlYXNvbik7XG5cbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJsb2dvdXRcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwibG9nb3V0XCIsIFwidW5hdXRoZW50aWNhdGVkXCIpO1xuICAgICAgaWYgKCFpbW1lZGlhdGUpIGF3YWl0IHRoaXMuaGFuZGxlUG9zdExvZ291dChyZWFzb24pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gbG9nb3V0XCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsb2NrKG9wdGlvbnM/OiBMb2NrT3B0aW9ucyk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIGNvbnN0IHsgcmVhc29uLCBjaGVja1ZhdWx0U3RhdHVzID0gZmFsc2UsIGltbWVkaWF0ZSA9IGZhbHNlIH0gPSBvcHRpb25zID8/IHt9O1xuICAgIHRyeSB7XG4gICAgICBpZiAoaW1tZWRpYXRlKSBhd2FpdCB0aGlzLmNhbGxBY3Rpb25MaXN0ZW5lcnMoXCJsb2NrXCIsIHJlYXNvbik7XG4gICAgICBpZiAoY2hlY2tWYXVsdFN0YXR1cykge1xuICAgICAgICBjb25zdCB7IGVycm9yLCByZXN1bHQgfSA9IGF3YWl0IHRoaXMuc3RhdHVzKCk7XG4gICAgICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG4gICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcInVuYXV0aGVudGljYXRlZFwiKSByZXR1cm4geyBlcnJvcjogbmV3IE5vdExvZ2dlZEluRXJyb3IoXCJOb3QgbG9nZ2VkIGluXCIpIH07XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJsb2NrXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUxhc3RWYXVsdFN0YXR1cyhcImxvY2tcIiwgXCJsb2NrZWRcIik7XG4gICAgICBpZiAoIWltbWVkaWF0ZSkgYXdhaXQgdGhpcy5jYWxsQWN0aW9uTGlzdGVuZXJzKFwibG9ja1wiLCByZWFzb24pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gbG9jayB2YXVsdFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgdW5sb2NrKHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I8c3RyaW5nPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dDogc2Vzc2lvblRva2VuIH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1widW5sb2NrXCIsIHBhc3N3b3JkLCBcIi0tcmF3XCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgdGhpcy5zZXRTZXNzaW9uVG9rZW4oc2Vzc2lvblRva2VuKTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUxhc3RWYXVsdFN0YXR1cyhcInVubG9ja1wiLCBcInVubG9ja2VkXCIpO1xuICAgICAgYXdhaXQgdGhpcy5jYWxsQWN0aW9uTGlzdGVuZXJzKFwidW5sb2NrXCIsIHBhc3N3b3JkLCBzZXNzaW9uVG9rZW4pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBzZXNzaW9uVG9rZW4gfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gdW5sb2NrIHZhdWx0XCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzeW5jKCk6IFByb21pc2U8TWF5YmVFcnJvcj4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoW1wic3luY1wiXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogdW5kZWZpbmVkIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHN5bmMgdmF1bHRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEl0ZW0oaWQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcjxJdGVtPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImdldFwiLCBcIml0ZW1cIiwgaWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPEl0ZW0+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IGl0ZW1cIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxpc3RJdGVtcygpOiBQcm9taXNlPE1heWJlRXJyb3I8SXRlbVtdPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImxpc3RcIiwgXCJpdGVtc1wiXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIGNvbnN0IGl0ZW1zID0gSlNPTi5wYXJzZTxJdGVtW10+KHN0ZG91dCk7XG4gICAgICAvLyBGaWx0ZXIgb3V0IGl0ZW1zIHdpdGhvdXQgYSBuYW1lIHByb3BlcnR5ICh0aGV5IGFyZSBub3QgZGlzcGxheWVkIGluIHRoZSBiaXR3YXJkZW4gYXBwKVxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBpdGVtcy5maWx0ZXIoKGl0ZW06IEl0ZW0pID0+ICEhaXRlbS5uYW1lKSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBsaXN0IGl0ZW1zXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjcmVhdGVMb2dpbkl0ZW0ob3B0aW9uczogQ3JlYXRlTG9naW5JdGVtT3B0aW9ucyk6IFByb21pc2U8TWF5YmVFcnJvcjxJdGVtPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVycm9yOiBpdGVtVGVtcGxhdGVFcnJvciwgcmVzdWx0OiBpdGVtVGVtcGxhdGUgfSA9IGF3YWl0IHRoaXMuZ2V0VGVtcGxhdGU8SXRlbT4oXCJpdGVtXCIpO1xuICAgICAgaWYgKGl0ZW1UZW1wbGF0ZUVycm9yKSB0aHJvdyBpdGVtVGVtcGxhdGVFcnJvcjtcblxuICAgICAgY29uc3QgeyBlcnJvcjogbG9naW5UZW1wbGF0ZUVycm9yLCByZXN1bHQ6IGxvZ2luVGVtcGxhdGUgfSA9IGF3YWl0IHRoaXMuZ2V0VGVtcGxhdGU8TG9naW4+KFwiaXRlbS5sb2dpblwiKTtcbiAgICAgIGlmIChsb2dpblRlbXBsYXRlRXJyb3IpIHRocm93IGxvZ2luVGVtcGxhdGVFcnJvcjtcblxuICAgICAgaXRlbVRlbXBsYXRlLm5hbWUgPSBvcHRpb25zLm5hbWU7XG4gICAgICBpdGVtVGVtcGxhdGUudHlwZSA9IEl0ZW1UeXBlLkxPR0lOO1xuICAgICAgaXRlbVRlbXBsYXRlLmZvbGRlcklkID0gb3B0aW9ucy5mb2xkZXJJZCB8fCBudWxsO1xuICAgICAgaXRlbVRlbXBsYXRlLmxvZ2luID0gbG9naW5UZW1wbGF0ZTtcbiAgICAgIGl0ZW1UZW1wbGF0ZS5ub3RlcyA9IG51bGw7XG5cbiAgICAgIGxvZ2luVGVtcGxhdGUudXNlcm5hbWUgPSBvcHRpb25zLnVzZXJuYW1lIHx8IG51bGw7XG4gICAgICBsb2dpblRlbXBsYXRlLnBhc3N3b3JkID0gb3B0aW9ucy5wYXNzd29yZDtcbiAgICAgIGxvZ2luVGVtcGxhdGUudG90cCA9IG51bGw7XG4gICAgICBsb2dpblRlbXBsYXRlLmZpZG8yQ3JlZGVudGlhbHMgPSB1bmRlZmluZWQ7XG5cbiAgICAgIGlmIChvcHRpb25zLnVyaSkge1xuICAgICAgICBsb2dpblRlbXBsYXRlLnVyaXMgPSBbeyBtYXRjaDogbnVsbCwgdXJpOiBvcHRpb25zLnVyaSB9XTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgeyByZXN1bHQ6IGVuY29kZWRJdGVtLCBlcnJvcjogZW5jb2RlRXJyb3IgfSA9IGF3YWl0IHRoaXMuZW5jb2RlKEpTT04uc3RyaW5naWZ5KGl0ZW1UZW1wbGF0ZSkpO1xuICAgICAgaWYgKGVuY29kZUVycm9yKSB0aHJvdyBlbmNvZGVFcnJvcjtcblxuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJjcmVhdGVcIiwgXCJpdGVtXCIsIGVuY29kZWRJdGVtXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxJdGVtPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGNyZWF0ZSBsb2dpbiBpdGVtXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsaXN0Rm9sZGVycygpOiBQcm9taXNlPE1heWJlRXJyb3I8Rm9sZGVyW10+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wibGlzdFwiLCBcImZvbGRlcnNcIl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8Rm9sZGVyW10+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gbGlzdCBmb2xkZXJcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZUZvbGRlcihuYW1lOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBlcnJvciwgcmVzdWx0OiBmb2xkZXIgfSA9IGF3YWl0IHRoaXMuZ2V0VGVtcGxhdGUoXCJmb2xkZXJcIik7XG4gICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuXG4gICAgICBmb2xkZXIubmFtZSA9IG5hbWU7XG4gICAgICBjb25zdCB7IHJlc3VsdDogZW5jb2RlZEZvbGRlciwgZXJyb3I6IGVuY29kZUVycm9yIH0gPSBhd2FpdCB0aGlzLmVuY29kZShKU09OLnN0cmluZ2lmeShmb2xkZXIpKTtcbiAgICAgIGlmIChlbmNvZGVFcnJvcikgdGhyb3cgZW5jb2RlRXJyb3I7XG5cbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJjcmVhdGVcIiwgXCJmb2xkZXJcIiwgZW5jb2RlZEZvbGRlcl0sIHsgcmVzZXRWYXVsdFRpbWVvdXQ6IHRydWUgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHVuZGVmaW5lZCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBjcmVhdGUgZm9sZGVyXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRUb3RwKGlkOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I8c3RyaW5nPj4ge1xuICAgIHRyeSB7XG4gICAgICAvLyB0aGlzIGNvdWxkIHJldHVybiBzb21ldGhpbmcgbGlrZSBcIk5vdCBmb3VuZC5cIiBidXQgY2hlY2tzIGZvciB0b3RwIGNvZGUgYXJlIGRvbmUgYmVmb3JlIGNhbGxpbmcgdGhpcyBmdW5jdGlvblxuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJnZXRcIiwgXCJ0b3RwXCIsIGlkXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogc3Rkb3V0IH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGdldCBUT1RQXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzdGF0dXMoKTogUHJvbWlzZTxNYXliZUVycm9yPFZhdWx0U3RhdGU+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wic3RhdHVzXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxWYXVsdFN0YXRlPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGdldCBzdGF0dXNcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNoZWNrTG9ja1N0YXR1cygpOiBQcm9taXNlPFZhdWx0U3RhdHVzPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJ1bmxvY2tcIiwgXCItLWNoZWNrXCJdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiBmYWxzZSB9KTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUxhc3RWYXVsdFN0YXR1cyhcImNoZWNrTG9ja1N0YXR1c1wiLCBcInVubG9ja2VkXCIpO1xuICAgICAgcmV0dXJuIFwidW5sb2NrZWRcIjtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBjaGVjayBsb2NrIHN0YXR1c1wiLCBlcnJvcik7XG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAoZXJyb3IgYXMgRXhlY2FFcnJvcikuc3RkZXJyO1xuICAgICAgaWYgKGVycm9yTWVzc2FnZSA9PT0gXCJWYXVsdCBpcyBsb2NrZWQuXCIpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5zYXZlTGFzdFZhdWx0U3RhdHVzKFwiY2hlY2tMb2NrU3RhdHVzXCIsIFwibG9ja2VkXCIpO1xuICAgICAgICByZXR1cm4gXCJsb2NrZWRcIjtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUxhc3RWYXVsdFN0YXR1cyhcImNoZWNrTG9ja1N0YXR1c1wiLCBcInVuYXV0aGVudGljYXRlZFwiKTtcbiAgICAgIHJldHVybiBcInVuYXV0aGVudGljYXRlZFwiO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldFRlbXBsYXRlPFQgPSBhbnk+KHR5cGU6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcjxUPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImdldFwiLCBcInRlbXBsYXRlXCIsIHR5cGVdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFQ+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZ2V0IHRlbXBsYXRlXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBlbmNvZGUoaW5wdXQ6IHN0cmluZyk6IFByb21pc2U8TWF5YmVFcnJvcjxzdHJpbmc+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wiZW5jb2RlXCJdLCB7IGlucHV0LCByZXNldFZhdWx0VGltZW91dDogZmFsc2UgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHN0ZG91dCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBlbmNvZGVcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdlbmVyYXRlUGFzc3dvcmQob3B0aW9ucz86IFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucywgYWJvcnRDb250cm9sbGVyPzogQWJvcnRDb250cm9sbGVyKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBhcmdzID0gb3B0aW9ucyA/IGdldFBhc3N3b3JkR2VuZXJhdGluZ0FyZ3Mob3B0aW9ucykgOiBbXTtcbiAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcImdlbmVyYXRlXCIsIC4uLmFyZ3NdLCB7IGFib3J0Q29udHJvbGxlciwgcmVzZXRWYXVsdFRpbWVvdXQ6IGZhbHNlIH0pO1xuICAgIHJldHVybiBzdGRvdXQ7XG4gIH1cblxuICBhc3luYyBsaXN0U2VuZHMoKTogUHJvbWlzZTxNYXliZUVycm9yPFNlbmRbXT4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhbXCJzZW5kXCIsIFwibGlzdFwiXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxTZW5kW10+KHN0ZG91dCkgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gbGlzdCBzZW5kc1wiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY3JlYXRlU2VuZCh2YWx1ZXM6IFNlbmRDcmVhdGVQYXlsb2FkKTogUHJvbWlzZTxNYXliZUVycm9yPFNlbmQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZXJyb3I6IHRlbXBsYXRlRXJyb3IsIHJlc3VsdDogdGVtcGxhdGUgfSA9IGF3YWl0IHRoaXMuZ2V0VGVtcGxhdGUoXG4gICAgICAgIHZhbHVlcy50eXBlID09PSBTZW5kVHlwZS5UZXh0ID8gXCJzZW5kLnRleHRcIiA6IFwic2VuZC5maWxlXCJcbiAgICAgICk7XG4gICAgICBpZiAodGVtcGxhdGVFcnJvcikgdGhyb3cgdGVtcGxhdGVFcnJvcjtcblxuICAgICAgY29uc3QgcGF5bG9hZCA9IHByZXBhcmVTZW5kUGF5bG9hZCh0ZW1wbGF0ZSwgdmFsdWVzKTtcbiAgICAgIGNvbnN0IHsgcmVzdWx0OiBlbmNvZGVkUGF5bG9hZCwgZXJyb3I6IGVuY29kZUVycm9yIH0gPSBhd2FpdCB0aGlzLmVuY29kZShKU09OLnN0cmluZ2lmeShwYXlsb2FkKSk7XG4gICAgICBpZiAoZW5jb2RlRXJyb3IpIHRocm93IGVuY29kZUVycm9yO1xuXG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJjcmVhdGVcIiwgZW5jb2RlZFBheWxvYWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuXG4gICAgICByZXR1cm4geyByZXN1bHQ6IEpTT04ucGFyc2U8U2VuZD4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byBjcmVhdGUgc2VuZFwiLCBleGVjRXJyb3IpO1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgdGhpcy5oYW5kbGVDb21tb25FcnJvcnMoZXhlY0Vycm9yKTtcbiAgICAgIGlmICghZXJyb3IpIHRocm93IGV4ZWNFcnJvcjtcbiAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZWRpdFNlbmQodmFsdWVzOiBTZW5kQ3JlYXRlUGF5bG9hZCk6IFByb21pc2U8TWF5YmVFcnJvcjxTZW5kPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHJlc3VsdDogZW5jb2RlZFBheWxvYWQsIGVycm9yOiBlbmNvZGVFcnJvciB9ID0gYXdhaXQgdGhpcy5lbmNvZGUoSlNPTi5zdHJpbmdpZnkodmFsdWVzKSk7XG4gICAgICBpZiAoZW5jb2RlRXJyb3IpIHRocm93IGVuY29kZUVycm9yO1xuXG4gICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJlZGl0XCIsIGVuY29kZWRQYXlsb2FkXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogSlNPTi5wYXJzZTxTZW5kPihzdGRvdXQpIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIGRlbGV0ZSBzZW5kXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBkZWxldGVTZW5kKGlkOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlRXJyb3I+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKFtcInNlbmRcIiwgXCJkZWxldGVcIiwgaWRdLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlIH0pO1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB1bmRlZmluZWQgfTtcbiAgICB9IGNhdGNoIChleGVjRXJyb3IpIHtcbiAgICAgIGNhcHR1cmVFeGNlcHRpb24oXCJGYWlsZWQgdG8gZGVsZXRlIHNlbmRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlbW92ZVNlbmRQYXNzd29yZChpZDogc3RyaW5nKTogUHJvbWlzZTxNYXliZUVycm9yPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyhbXCJzZW5kXCIsIFwicmVtb3ZlLXBhc3N3b3JkXCIsIGlkXSwgeyByZXNldFZhdWx0VGltZW91dDogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogdW5kZWZpbmVkIH07XG4gICAgfSBjYXRjaCAoZXhlY0Vycm9yKSB7XG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHJlbW92ZSBzZW5kIHBhc3N3b3JkXCIsIGV4ZWNFcnJvcik7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCB0aGlzLmhhbmRsZUNvbW1vbkVycm9ycyhleGVjRXJyb3IpO1xuICAgICAgaWYgKCFlcnJvcikgdGhyb3cgZXhlY0Vycm9yO1xuICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyByZWNlaXZlU2VuZEluZm8odXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZWNlaXZlU2VuZE9wdGlvbnMpOiBQcm9taXNlPE1heWJlRXJyb3I8UmVjZWl2ZWRTZW5kPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCwgc3RkZXJyIH0gPSBhd2FpdCB0aGlzLmV4ZWMoW1wic2VuZFwiLCBcInJlY2VpdmVcIiwgdXJsLCBcIi0tb2JqXCJdLCB7XG4gICAgICAgIHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlLFxuICAgICAgICBpbnB1dDogb3B0aW9ucz8ucGFzc3dvcmQsXG4gICAgICB9KTtcbiAgICAgIGlmICghc3Rkb3V0ICYmIC9JbnZhbGlkIHBhc3N3b3JkL2kudGVzdChzdGRlcnIpKSByZXR1cm4geyBlcnJvcjogbmV3IFNlbmRJbnZhbGlkUGFzc3dvcmRFcnJvcigpIH07XG4gICAgICBpZiAoIXN0ZG91dCAmJiAvU2VuZCBwYXNzd29yZC9pLnRlc3Qoc3RkZXJyKSkgcmV0dXJuIHsgZXJyb3I6IG5ldyBTZW5kTmVlZHNQYXNzd29yZEVycm9yKCkgfTtcblxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBKU09OLnBhcnNlPFJlY2VpdmVkU2VuZD4oc3Rkb3V0KSB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gKGV4ZWNFcnJvciBhcyBFeGVjYUVycm9yKS5zdGRlcnI7XG4gICAgICBpZiAoL0ludmFsaWQgcGFzc3dvcmQvZ2kudGVzdChlcnJvck1lc3NhZ2UpKSByZXR1cm4geyBlcnJvcjogbmV3IFNlbmRJbnZhbGlkUGFzc3dvcmRFcnJvcigpIH07XG4gICAgICBpZiAoL1NlbmQgcGFzc3dvcmQvZ2kudGVzdChlcnJvck1lc3NhZ2UpKSByZXR1cm4geyBlcnJvcjogbmV3IFNlbmROZWVkc1Bhc3N3b3JkRXJyb3IoKSB9O1xuXG4gICAgICBjYXB0dXJlRXhjZXB0aW9uKFwiRmFpbGVkIHRvIHJlY2VpdmUgc2VuZCBvYmpcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlY2VpdmVTZW5kKHVybDogc3RyaW5nLCBvcHRpb25zPzogUmVjZWl2ZVNlbmRPcHRpb25zKTogUHJvbWlzZTxNYXliZUVycm9yPHN0cmluZz4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzYXZlUGF0aCwgcGFzc3dvcmQgfSA9IG9wdGlvbnMgPz8ge307XG4gICAgICBjb25zdCBhcmdzID0gW1wic2VuZFwiLCBcInJlY2VpdmVcIiwgdXJsXTtcbiAgICAgIGlmIChzYXZlUGF0aCkgYXJncy5wdXNoKFwiLS1vdXRwdXRcIiwgc2F2ZVBhdGgpO1xuICAgICAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IHRoaXMuZXhlYyhhcmdzLCB7IHJlc2V0VmF1bHRUaW1lb3V0OiB0cnVlLCBpbnB1dDogcGFzc3dvcmQgfSk7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHN0ZG91dCB9O1xuICAgIH0gY2F0Y2ggKGV4ZWNFcnJvcikge1xuICAgICAgY2FwdHVyZUV4Y2VwdGlvbihcIkZhaWxlZCB0byByZWNlaXZlIHNlbmRcIiwgZXhlY0Vycm9yKTtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHRoaXMuaGFuZGxlQ29tbW9uRXJyb3JzKGV4ZWNFcnJvcik7XG4gICAgICBpZiAoIWVycm9yKSB0aHJvdyBleGVjRXJyb3I7XG4gICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIHV0aWxzIGJlbG93XG5cbiAgYXN5bmMgc2F2ZUxhc3RWYXVsdFN0YXR1cyhjYWxsTmFtZTogc3RyaW5nLCBzdGF0dXM6IFZhdWx0U3RhdHVzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgTG9jYWxTdG9yYWdlLnNldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkuVkFVTFRfTEFTVF9TVEFUVVMsIHN0YXR1cyk7XG4gIH1cblxuICBhc3luYyBnZXRMYXN0U2F2ZWRWYXVsdFN0YXR1cygpOiBQcm9taXNlPFZhdWx0U3RhdHVzIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgbGFzdFNhdmVkU3RhdHVzID0gYXdhaXQgTG9jYWxTdG9yYWdlLmdldEl0ZW08VmF1bHRTdGF0dXM+KExPQ0FMX1NUT1JBR0VfS0VZLlZBVUxUX0xBU1RfU1RBVFVTKTtcbiAgICBpZiAoIWxhc3RTYXZlZFN0YXR1cykge1xuICAgICAgY29uc3QgdmF1bHRTdGF0dXMgPSBhd2FpdCB0aGlzLnN0YXR1cygpO1xuICAgICAgcmV0dXJuIHZhdWx0U3RhdHVzLnJlc3VsdD8uc3RhdHVzO1xuICAgIH1cbiAgICByZXR1cm4gbGFzdFNhdmVkU3RhdHVzO1xuICB9XG5cbiAgcHJpdmF0ZSBpc1Byb21wdFdhaXRpbmdGb3JNYXN0ZXJQYXNzd29yZChyZXN1bHQ6IEV4ZWNhUmV0dXJuVmFsdWUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEocmVzdWx0LnN0ZGVyciAmJiByZXN1bHQuc3RkZXJyLmluY2x1ZGVzKFwiTWFzdGVyIHBhc3N3b3JkXCIpKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlUG9zdExvZ291dChyZWFzb24/OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmNsZWFyU2Vzc2lvblRva2VuKCk7XG4gICAgYXdhaXQgdGhpcy5jYWxsQWN0aW9uTGlzdGVuZXJzKFwibG9nb3V0XCIsIHJlYXNvbik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGhhbmRsZUNvbW1vbkVycm9ycyhlcnJvcjogYW55KTogUHJvbWlzZTx7IGVycm9yPzogTWFudWFsbHlUaHJvd25FcnJvciB9PiB7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gKGVycm9yIGFzIEV4ZWNhRXJyb3IpLnN0ZGVycjtcbiAgICBpZiAoIWVycm9yTWVzc2FnZSkgcmV0dXJuIHt9O1xuXG4gICAgaWYgKC9ub3QgbG9nZ2VkIGluL2kudGVzdChlcnJvck1lc3NhZ2UpKSB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZVBvc3RMb2dvdXQoKTtcbiAgICAgIHJldHVybiB7IGVycm9yOiBuZXcgTm90TG9nZ2VkSW5FcnJvcihcIk5vdCBsb2dnZWQgaW5cIikgfTtcbiAgICB9XG4gICAgaWYgKC9QcmVtaXVtIHN0YXR1cy9pLnRlc3QoZXJyb3JNZXNzYWdlKSkge1xuICAgICAgcmV0dXJuIHsgZXJyb3I6IG5ldyBQcmVtaXVtRmVhdHVyZUVycm9yKCkgfTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgc2V0QWN0aW9uTGlzdGVuZXI8QSBleHRlbmRzIGtleW9mIEFjdGlvbkxpc3RlbmVycz4oYWN0aW9uOiBBLCBsaXN0ZW5lcjogQWN0aW9uTGlzdGVuZXJzW0FdKTogdGhpcyB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5hY3Rpb25MaXN0ZW5lcnMuZ2V0KGFjdGlvbik7XG4gICAgaWYgKGxpc3RlbmVycyAmJiBsaXN0ZW5lcnMuc2l6ZSA+IDApIHtcbiAgICAgIGxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFjdGlvbkxpc3RlbmVycy5zZXQoYWN0aW9uLCBuZXcgU2V0KFtsaXN0ZW5lcl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZW1vdmVBY3Rpb25MaXN0ZW5lcjxBIGV4dGVuZHMga2V5b2YgQWN0aW9uTGlzdGVuZXJzPihhY3Rpb246IEEsIGxpc3RlbmVyOiBBY3Rpb25MaXN0ZW5lcnNbQV0pOiB0aGlzIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmFjdGlvbkxpc3RlbmVycy5nZXQoYWN0aW9uKTtcbiAgICBpZiAobGlzdGVuZXJzICYmIGxpc3RlbmVycy5zaXplID4gMCkge1xuICAgICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjYWxsQWN0aW9uTGlzdGVuZXJzPEEgZXh0ZW5kcyBrZXlvZiBBY3Rpb25MaXN0ZW5lcnM+KFxuICAgIGFjdGlvbjogQSxcbiAgICAuLi5hcmdzOiBQYXJhbWV0ZXJzPE5vbk51bGxhYmxlPEFjdGlvbkxpc3RlbmVyc1tBXT4+XG4gICkge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuYWN0aW9uTGlzdGVuZXJzLmdldChhY3Rpb24pO1xuICAgIGlmIChsaXN0ZW5lcnMgJiYgbGlzdGVuZXJzLnNpemUgPiAwKSB7XG4gICAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIGxpc3RlbmVycykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IChsaXN0ZW5lciBhcyBhbnkpPy4oLi4uYXJncyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY2FwdHVyZUV4Y2VwdGlvbihgRXJyb3IgY2FsbGluZyBiaXR3YXJkZW4gYWN0aW9uIGxpc3RlbmVyIGZvciAke2FjdGlvbn1gLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNob3dUb2FzdCA9IGFzeW5jICh0b2FzdE9wdHM6IFRvYXN0Lk9wdGlvbnMpOiBQcm9taXNlPFRvYXN0ICYgeyByZXN0b3JlOiAoKSA9PiBQcm9taXNlPHZvaWQ+IH0+ID0+IHtcbiAgICBpZiAodGhpcy50b2FzdEluc3RhbmNlKSB7XG4gICAgICBjb25zdCBwcmV2aW91c1N0YXRlVG9hc3RPcHRzOiBUb2FzdC5PcHRpb25zID0ge1xuICAgICAgICBtZXNzYWdlOiB0aGlzLnRvYXN0SW5zdGFuY2UubWVzc2FnZSxcbiAgICAgICAgdGl0bGU6IHRoaXMudG9hc3RJbnN0YW5jZS50aXRsZSxcbiAgICAgICAgcHJpbWFyeUFjdGlvbjogdGhpcy50b2FzdEluc3RhbmNlLnByaW1hcnlBY3Rpb24sXG4gICAgICAgIHNlY29uZGFyeUFjdGlvbjogdGhpcy50b2FzdEluc3RhbmNlLnNlY29uZGFyeUFjdGlvbixcbiAgICAgIH07XG5cbiAgICAgIGlmICh0b2FzdE9wdHMuc3R5bGUpIHRoaXMudG9hc3RJbnN0YW5jZS5zdHlsZSA9IHRvYXN0T3B0cy5zdHlsZTtcbiAgICAgIHRoaXMudG9hc3RJbnN0YW5jZS5tZXNzYWdlID0gdG9hc3RPcHRzLm1lc3NhZ2U7XG4gICAgICB0aGlzLnRvYXN0SW5zdGFuY2UudGl0bGUgPSB0b2FzdE9wdHMudGl0bGU7XG4gICAgICB0aGlzLnRvYXN0SW5zdGFuY2UucHJpbWFyeUFjdGlvbiA9IHRvYXN0T3B0cy5wcmltYXJ5QWN0aW9uO1xuICAgICAgdGhpcy50b2FzdEluc3RhbmNlLnNlY29uZGFyeUFjdGlvbiA9IHRvYXN0T3B0cy5zZWNvbmRhcnlBY3Rpb247XG4gICAgICBhd2FpdCB0aGlzLnRvYXN0SW5zdGFuY2Uuc2hvdygpO1xuXG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih0aGlzLnRvYXN0SW5zdGFuY2UsIHtcbiAgICAgICAgcmVzdG9yZTogYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGF3YWl0IHRoaXMuc2hvd1RvYXN0KHByZXZpb3VzU3RhdGVUb2FzdE9wdHMpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHRvYXN0ID0gYXdhaXQgc2hvd1RvYXN0KHRvYXN0T3B0cyk7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih0b2FzdCwgeyByZXN0b3JlOiAoKSA9PiB0b2FzdC5oaWRlKCkgfSk7XG4gICAgfVxuICB9O1xufVxuIiwgImltcG9ydCB7QnVmZmVyfSBmcm9tICdub2RlOmJ1ZmZlcic7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IGNoaWxkUHJvY2VzcyBmcm9tICdub2RlOmNoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCBjcm9zc1NwYXduIGZyb20gJ2Nyb3NzLXNwYXduJztcbmltcG9ydCBzdHJpcEZpbmFsTmV3bGluZSBmcm9tICdzdHJpcC1maW5hbC1uZXdsaW5lJztcbmltcG9ydCB7bnBtUnVuUGF0aEVudn0gZnJvbSAnbnBtLXJ1bi1wYXRoJztcbmltcG9ydCBvbmV0aW1lIGZyb20gJ29uZXRpbWUnO1xuaW1wb3J0IHttYWtlRXJyb3J9IGZyb20gJy4vbGliL2Vycm9yLmpzJztcbmltcG9ydCB7bm9ybWFsaXplU3RkaW8sIG5vcm1hbGl6ZVN0ZGlvTm9kZX0gZnJvbSAnLi9saWIvc3RkaW8uanMnO1xuaW1wb3J0IHtzcGF3bmVkS2lsbCwgc3Bhd25lZENhbmNlbCwgc2V0dXBUaW1lb3V0LCB2YWxpZGF0ZVRpbWVvdXQsIHNldEV4aXRIYW5kbGVyfSBmcm9tICcuL2xpYi9raWxsLmpzJztcbmltcG9ydCB7aGFuZGxlSW5wdXQsIGdldFNwYXduZWRSZXN1bHQsIG1ha2VBbGxTdHJlYW0sIHZhbGlkYXRlSW5wdXRTeW5jfSBmcm9tICcuL2xpYi9zdHJlYW0uanMnO1xuaW1wb3J0IHttZXJnZVByb21pc2UsIGdldFNwYXduZWRQcm9taXNlfSBmcm9tICcuL2xpYi9wcm9taXNlLmpzJztcbmltcG9ydCB7am9pbkNvbW1hbmQsIHBhcnNlQ29tbWFuZCwgZ2V0RXNjYXBlZENvbW1hbmR9IGZyb20gJy4vbGliL2NvbW1hbmQuanMnO1xuXG5jb25zdCBERUZBVUxUX01BWF9CVUZGRVIgPSAxMDAwICogMTAwMCAqIDEwMDtcblxuY29uc3QgZ2V0RW52ID0gKHtlbnY6IGVudk9wdGlvbiwgZXh0ZW5kRW52LCBwcmVmZXJMb2NhbCwgbG9jYWxEaXIsIGV4ZWNQYXRofSkgPT4ge1xuXHRjb25zdCBlbnYgPSBleHRlbmRFbnYgPyB7Li4ucHJvY2Vzcy5lbnYsIC4uLmVudk9wdGlvbn0gOiBlbnZPcHRpb247XG5cblx0aWYgKHByZWZlckxvY2FsKSB7XG5cdFx0cmV0dXJuIG5wbVJ1blBhdGhFbnYoe2VudiwgY3dkOiBsb2NhbERpciwgZXhlY1BhdGh9KTtcblx0fVxuXG5cdHJldHVybiBlbnY7XG59O1xuXG5jb25zdCBoYW5kbGVBcmd1bWVudHMgPSAoZmlsZSwgYXJncywgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IHBhcnNlZCA9IGNyb3NzU3Bhd24uX3BhcnNlKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xuXHRmaWxlID0gcGFyc2VkLmNvbW1hbmQ7XG5cdGFyZ3MgPSBwYXJzZWQuYXJncztcblx0b3B0aW9ucyA9IHBhcnNlZC5vcHRpb25zO1xuXG5cdG9wdGlvbnMgPSB7XG5cdFx0bWF4QnVmZmVyOiBERUZBVUxUX01BWF9CVUZGRVIsXG5cdFx0YnVmZmVyOiB0cnVlLFxuXHRcdHN0cmlwRmluYWxOZXdsaW5lOiB0cnVlLFxuXHRcdGV4dGVuZEVudjogdHJ1ZSxcblx0XHRwcmVmZXJMb2NhbDogZmFsc2UsXG5cdFx0bG9jYWxEaXI6IG9wdGlvbnMuY3dkIHx8IHByb2Nlc3MuY3dkKCksXG5cdFx0ZXhlY1BhdGg6IHByb2Nlc3MuZXhlY1BhdGgsXG5cdFx0ZW5jb2Rpbmc6ICd1dGY4Jyxcblx0XHRyZWplY3Q6IHRydWUsXG5cdFx0Y2xlYW51cDogdHJ1ZSxcblx0XHRhbGw6IGZhbHNlLFxuXHRcdHdpbmRvd3NIaWRlOiB0cnVlLFxuXHRcdC4uLm9wdGlvbnMsXG5cdH07XG5cblx0b3B0aW9ucy5lbnYgPSBnZXRFbnYob3B0aW9ucyk7XG5cblx0b3B0aW9ucy5zdGRpbyA9IG5vcm1hbGl6ZVN0ZGlvKG9wdGlvbnMpO1xuXG5cdGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInICYmIHBhdGguYmFzZW5hbWUoZmlsZSwgJy5leGUnKSA9PT0gJ2NtZCcpIHtcblx0XHQvLyAjMTE2XG5cdFx0YXJncy51bnNoaWZ0KCcvcScpO1xuXHR9XG5cblx0cmV0dXJuIHtmaWxlLCBhcmdzLCBvcHRpb25zLCBwYXJzZWR9O1xufTtcblxuY29uc3QgaGFuZGxlT3V0cHV0ID0gKG9wdGlvbnMsIHZhbHVlLCBlcnJvcikgPT4ge1xuXHRpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzQnVmZmVyKHZhbHVlKSkge1xuXHRcdC8vIFdoZW4gYGV4ZWNhU3luYygpYCBlcnJvcnMsIHdlIG5vcm1hbGl6ZSBpdCB0byAnJyB0byBtaW1pYyBgZXhlY2EoKWBcblx0XHRyZXR1cm4gZXJyb3IgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6ICcnO1xuXHR9XG5cblx0aWYgKG9wdGlvbnMuc3RyaXBGaW5hbE5ld2xpbmUpIHtcblx0XHRyZXR1cm4gc3RyaXBGaW5hbE5ld2xpbmUodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWNhKGZpbGUsIGFyZ3MsIG9wdGlvbnMpIHtcblx0Y29uc3QgcGFyc2VkID0gaGFuZGxlQXJndW1lbnRzKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xuXHRjb25zdCBjb21tYW5kID0gam9pbkNvbW1hbmQoZmlsZSwgYXJncyk7XG5cdGNvbnN0IGVzY2FwZWRDb21tYW5kID0gZ2V0RXNjYXBlZENvbW1hbmQoZmlsZSwgYXJncyk7XG5cblx0dmFsaWRhdGVUaW1lb3V0KHBhcnNlZC5vcHRpb25zKTtcblxuXHRsZXQgc3Bhd25lZDtcblx0dHJ5IHtcblx0XHRzcGF3bmVkID0gY2hpbGRQcm9jZXNzLnNwYXduKHBhcnNlZC5maWxlLCBwYXJzZWQuYXJncywgcGFyc2VkLm9wdGlvbnMpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdC8vIEVuc3VyZSB0aGUgcmV0dXJuZWQgZXJyb3IgaXMgYWx3YXlzIGJvdGggYSBwcm9taXNlIGFuZCBhIGNoaWxkIHByb2Nlc3Ncblx0XHRjb25zdCBkdW1teVNwYXduZWQgPSBuZXcgY2hpbGRQcm9jZXNzLkNoaWxkUHJvY2VzcygpO1xuXHRcdGNvbnN0IGVycm9yUHJvbWlzZSA9IFByb21pc2UucmVqZWN0KG1ha2VFcnJvcih7XG5cdFx0XHRlcnJvcixcblx0XHRcdHN0ZG91dDogJycsXG5cdFx0XHRzdGRlcnI6ICcnLFxuXHRcdFx0YWxsOiAnJyxcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdHBhcnNlZCxcblx0XHRcdHRpbWVkT3V0OiBmYWxzZSxcblx0XHRcdGlzQ2FuY2VsZWQ6IGZhbHNlLFxuXHRcdFx0a2lsbGVkOiBmYWxzZSxcblx0XHR9KSk7XG5cdFx0cmV0dXJuIG1lcmdlUHJvbWlzZShkdW1teVNwYXduZWQsIGVycm9yUHJvbWlzZSk7XG5cdH1cblxuXHRjb25zdCBzcGF3bmVkUHJvbWlzZSA9IGdldFNwYXduZWRQcm9taXNlKHNwYXduZWQpO1xuXHRjb25zdCB0aW1lZFByb21pc2UgPSBzZXR1cFRpbWVvdXQoc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMsIHNwYXduZWRQcm9taXNlKTtcblx0Y29uc3QgcHJvY2Vzc0RvbmUgPSBzZXRFeGl0SGFuZGxlcihzcGF3bmVkLCBwYXJzZWQub3B0aW9ucywgdGltZWRQcm9taXNlKTtcblxuXHRjb25zdCBjb250ZXh0ID0ge2lzQ2FuY2VsZWQ6IGZhbHNlfTtcblxuXHRzcGF3bmVkLmtpbGwgPSBzcGF3bmVkS2lsbC5iaW5kKG51bGwsIHNwYXduZWQua2lsbC5iaW5kKHNwYXduZWQpKTtcblx0c3Bhd25lZC5jYW5jZWwgPSBzcGF3bmVkQ2FuY2VsLmJpbmQobnVsbCwgc3Bhd25lZCwgY29udGV4dCk7XG5cblx0Y29uc3QgaGFuZGxlUHJvbWlzZSA9IGFzeW5jICgpID0+IHtcblx0XHRjb25zdCBbe2Vycm9yLCBleGl0Q29kZSwgc2lnbmFsLCB0aW1lZE91dH0sIHN0ZG91dFJlc3VsdCwgc3RkZXJyUmVzdWx0LCBhbGxSZXN1bHRdID0gYXdhaXQgZ2V0U3Bhd25lZFJlc3VsdChzcGF3bmVkLCBwYXJzZWQub3B0aW9ucywgcHJvY2Vzc0RvbmUpO1xuXHRcdGNvbnN0IHN0ZG91dCA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgc3Rkb3V0UmVzdWx0KTtcblx0XHRjb25zdCBzdGRlcnIgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIHN0ZGVyclJlc3VsdCk7XG5cdFx0Y29uc3QgYWxsID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCBhbGxSZXN1bHQpO1xuXG5cdFx0aWYgKGVycm9yIHx8IGV4aXRDb2RlICE9PSAwIHx8IHNpZ25hbCAhPT0gbnVsbCkge1xuXHRcdFx0Y29uc3QgcmV0dXJuZWRFcnJvciA9IG1ha2VFcnJvcih7XG5cdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRleGl0Q29kZSxcblx0XHRcdFx0c2lnbmFsLFxuXHRcdFx0XHRzdGRvdXQsXG5cdFx0XHRcdHN0ZGVycixcblx0XHRcdFx0YWxsLFxuXHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdFx0cGFyc2VkLFxuXHRcdFx0XHR0aW1lZE91dCxcblx0XHRcdFx0aXNDYW5jZWxlZDogY29udGV4dC5pc0NhbmNlbGVkIHx8IChwYXJzZWQub3B0aW9ucy5zaWduYWwgPyBwYXJzZWQub3B0aW9ucy5zaWduYWwuYWJvcnRlZCA6IGZhbHNlKSxcblx0XHRcdFx0a2lsbGVkOiBzcGF3bmVkLmtpbGxlZCxcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoIXBhcnNlZC5vcHRpb25zLnJlamVjdCkge1xuXHRcdFx0XHRyZXR1cm4gcmV0dXJuZWRFcnJvcjtcblx0XHRcdH1cblxuXHRcdFx0dGhyb3cgcmV0dXJuZWRFcnJvcjtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0ZXhpdENvZGU6IDAsXG5cdFx0XHRzdGRvdXQsXG5cdFx0XHRzdGRlcnIsXG5cdFx0XHRhbGwsXG5cdFx0XHRmYWlsZWQ6IGZhbHNlLFxuXHRcdFx0dGltZWRPdXQ6IGZhbHNlLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IGZhbHNlLFxuXHRcdH07XG5cdH07XG5cblx0Y29uc3QgaGFuZGxlUHJvbWlzZU9uY2UgPSBvbmV0aW1lKGhhbmRsZVByb21pc2UpO1xuXG5cdGhhbmRsZUlucHV0KHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLmlucHV0KTtcblxuXHRzcGF3bmVkLmFsbCA9IG1ha2VBbGxTdHJlYW0oc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMpO1xuXG5cdHJldHVybiBtZXJnZVByb21pc2Uoc3Bhd25lZCwgaGFuZGxlUHJvbWlzZU9uY2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2FTeW5jKGZpbGUsIGFyZ3MsIG9wdGlvbnMpIHtcblx0Y29uc3QgcGFyc2VkID0gaGFuZGxlQXJndW1lbnRzKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xuXHRjb25zdCBjb21tYW5kID0gam9pbkNvbW1hbmQoZmlsZSwgYXJncyk7XG5cdGNvbnN0IGVzY2FwZWRDb21tYW5kID0gZ2V0RXNjYXBlZENvbW1hbmQoZmlsZSwgYXJncyk7XG5cblx0dmFsaWRhdGVJbnB1dFN5bmMocGFyc2VkLm9wdGlvbnMpO1xuXG5cdGxldCByZXN1bHQ7XG5cdHRyeSB7XG5cdFx0cmVzdWx0ID0gY2hpbGRQcm9jZXNzLnNwYXduU3luYyhwYXJzZWQuZmlsZSwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHR0aHJvdyBtYWtlRXJyb3Ioe1xuXHRcdFx0ZXJyb3IsXG5cdFx0XHRzdGRvdXQ6ICcnLFxuXHRcdFx0c3RkZXJyOiAnJyxcblx0XHRcdGFsbDogJycsXG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRwYXJzZWQsXG5cdFx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogZmFsc2UsXG5cdFx0fSk7XG5cdH1cblxuXHRjb25zdCBzdGRvdXQgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIHJlc3VsdC5zdGRvdXQsIHJlc3VsdC5lcnJvcik7XG5cdGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgcmVzdWx0LnN0ZGVyciwgcmVzdWx0LmVycm9yKTtcblxuXHRpZiAocmVzdWx0LmVycm9yIHx8IHJlc3VsdC5zdGF0dXMgIT09IDAgfHwgcmVzdWx0LnNpZ25hbCAhPT0gbnVsbCkge1xuXHRcdGNvbnN0IGVycm9yID0gbWFrZUVycm9yKHtcblx0XHRcdHN0ZG91dCxcblx0XHRcdHN0ZGVycixcblx0XHRcdGVycm9yOiByZXN1bHQuZXJyb3IsXG5cdFx0XHRzaWduYWw6IHJlc3VsdC5zaWduYWwsXG5cdFx0XHRleGl0Q29kZTogcmVzdWx0LnN0YXR1cyxcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdHBhcnNlZCxcblx0XHRcdHRpbWVkT3V0OiByZXN1bHQuZXJyb3IgJiYgcmVzdWx0LmVycm9yLmNvZGUgPT09ICdFVElNRURPVVQnLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IHJlc3VsdC5zaWduYWwgIT09IG51bGwsXG5cdFx0fSk7XG5cblx0XHRpZiAoIXBhcnNlZC5vcHRpb25zLnJlamVjdCkge1xuXHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdH1cblxuXHRcdHRocm93IGVycm9yO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRjb21tYW5kLFxuXHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdGV4aXRDb2RlOiAwLFxuXHRcdHN0ZG91dCxcblx0XHRzdGRlcnIsXG5cdFx0ZmFpbGVkOiBmYWxzZSxcblx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0a2lsbGVkOiBmYWxzZSxcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWNhQ29tbWFuZChjb21tYW5kLCBvcHRpb25zKSB7XG5cdGNvbnN0IFtmaWxlLCAuLi5hcmdzXSA9IHBhcnNlQ29tbWFuZChjb21tYW5kKTtcblx0cmV0dXJuIGV4ZWNhKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2FDb21tYW5kU3luYyhjb21tYW5kLCBvcHRpb25zKSB7XG5cdGNvbnN0IFtmaWxlLCAuLi5hcmdzXSA9IHBhcnNlQ29tbWFuZChjb21tYW5kKTtcblx0cmV0dXJuIGV4ZWNhU3luYyhmaWxlLCBhcmdzLCBvcHRpb25zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWNhTm9kZShzY3JpcHRQYXRoLCBhcmdzLCBvcHRpb25zID0ge30pIHtcblx0aWYgKGFyZ3MgJiYgIUFycmF5LmlzQXJyYXkoYXJncykgJiYgdHlwZW9mIGFyZ3MgPT09ICdvYmplY3QnKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3M7XG5cdFx0YXJncyA9IFtdO1xuXHR9XG5cblx0Y29uc3Qgc3RkaW8gPSBub3JtYWxpemVTdGRpb05vZGUob3B0aW9ucyk7XG5cdGNvbnN0IGRlZmF1bHRFeGVjQXJndiA9IHByb2Nlc3MuZXhlY0FyZ3YuZmlsdGVyKGFyZyA9PiAhYXJnLnN0YXJ0c1dpdGgoJy0taW5zcGVjdCcpKTtcblxuXHRjb25zdCB7XG5cdFx0bm9kZVBhdGggPSBwcm9jZXNzLmV4ZWNQYXRoLFxuXHRcdG5vZGVPcHRpb25zID0gZGVmYXVsdEV4ZWNBcmd2LFxuXHR9ID0gb3B0aW9ucztcblxuXHRyZXR1cm4gZXhlY2EoXG5cdFx0bm9kZVBhdGgsXG5cdFx0W1xuXHRcdFx0Li4ubm9kZU9wdGlvbnMsXG5cdFx0XHRzY3JpcHRQYXRoLFxuXHRcdFx0Li4uKEFycmF5LmlzQXJyYXkoYXJncykgPyBhcmdzIDogW10pLFxuXHRcdF0sXG5cdFx0e1xuXHRcdFx0Li4ub3B0aW9ucyxcblx0XHRcdHN0ZGluOiB1bmRlZmluZWQsXG5cdFx0XHRzdGRvdXQ6IHVuZGVmaW5lZCxcblx0XHRcdHN0ZGVycjogdW5kZWZpbmVkLFxuXHRcdFx0c3RkaW8sXG5cdFx0XHRzaGVsbDogZmFsc2UsXG5cdFx0fSxcblx0KTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzdHJpcEZpbmFsTmV3bGluZShpbnB1dCkge1xuXHRjb25zdCBMRiA9IHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgPyAnXFxuJyA6ICdcXG4nLmNoYXJDb2RlQXQoKTtcblx0Y29uc3QgQ1IgPSB0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnID8gJ1xccicgOiAnXFxyJy5jaGFyQ29kZUF0KCk7XG5cblx0aWYgKGlucHV0W2lucHV0Lmxlbmd0aCAtIDFdID09PSBMRikge1xuXHRcdGlucHV0ID0gaW5wdXQuc2xpY2UoMCwgLTEpO1xuXHR9XG5cblx0aWYgKGlucHV0W2lucHV0Lmxlbmd0aCAtIDFdID09PSBDUikge1xuXHRcdGlucHV0ID0gaW5wdXQuc2xpY2UoMCwgLTEpO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuIiwgImltcG9ydCBwcm9jZXNzIGZyb20gJ25vZGU6cHJvY2Vzcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHVybCBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgcGF0aEtleSBmcm9tICdwYXRoLWtleSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBucG1SdW5QYXRoKG9wdGlvbnMgPSB7fSkge1xuXHRjb25zdCB7XG5cdFx0Y3dkID0gcHJvY2Vzcy5jd2QoKSxcblx0XHRwYXRoOiBwYXRoXyA9IHByb2Nlc3MuZW52W3BhdGhLZXkoKV0sXG5cdFx0ZXhlY1BhdGggPSBwcm9jZXNzLmV4ZWNQYXRoLFxuXHR9ID0gb3B0aW9ucztcblxuXHRsZXQgcHJldmlvdXM7XG5cdGNvbnN0IGN3ZFN0cmluZyA9IGN3ZCBpbnN0YW5jZW9mIFVSTCA/IHVybC5maWxlVVJMVG9QYXRoKGN3ZCkgOiBjd2Q7XG5cdGxldCBjd2RQYXRoID0gcGF0aC5yZXNvbHZlKGN3ZFN0cmluZyk7XG5cdGNvbnN0IHJlc3VsdCA9IFtdO1xuXG5cdHdoaWxlIChwcmV2aW91cyAhPT0gY3dkUGF0aCkge1xuXHRcdHJlc3VsdC5wdXNoKHBhdGguam9pbihjd2RQYXRoLCAnbm9kZV9tb2R1bGVzLy5iaW4nKSk7XG5cdFx0cHJldmlvdXMgPSBjd2RQYXRoO1xuXHRcdGN3ZFBhdGggPSBwYXRoLnJlc29sdmUoY3dkUGF0aCwgJy4uJyk7XG5cdH1cblxuXHQvLyBFbnN1cmUgdGhlIHJ1bm5pbmcgYG5vZGVgIGJpbmFyeSBpcyB1c2VkLlxuXHRyZXN1bHQucHVzaChwYXRoLnJlc29sdmUoY3dkU3RyaW5nLCBleGVjUGF0aCwgJy4uJykpO1xuXG5cdHJldHVybiBbLi4ucmVzdWx0LCBwYXRoX10uam9pbihwYXRoLmRlbGltaXRlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBucG1SdW5QYXRoRW52KHtlbnYgPSBwcm9jZXNzLmVudiwgLi4ub3B0aW9uc30gPSB7fSkge1xuXHRlbnYgPSB7Li4uZW52fTtcblxuXHRjb25zdCBwYXRoID0gcGF0aEtleSh7ZW52fSk7XG5cdG9wdGlvbnMucGF0aCA9IGVudltwYXRoXTtcblx0ZW52W3BhdGhdID0gbnBtUnVuUGF0aChvcHRpb25zKTtcblxuXHRyZXR1cm4gZW52O1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhdGhLZXkob3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IHtcblx0XHRlbnYgPSBwcm9jZXNzLmVudixcblx0XHRwbGF0Zm9ybSA9IHByb2Nlc3MucGxhdGZvcm1cblx0fSA9IG9wdGlvbnM7XG5cblx0aWYgKHBsYXRmb3JtICE9PSAnd2luMzInKSB7XG5cdFx0cmV0dXJuICdQQVRIJztcblx0fVxuXG5cdHJldHVybiBPYmplY3Qua2V5cyhlbnYpLnJldmVyc2UoKS5maW5kKGtleSA9PiBrZXkudG9VcHBlckNhc2UoKSA9PT0gJ1BBVEgnKSB8fCAnUGF0aCc7XG59XG4iLCAiY29uc3QgY29weVByb3BlcnR5ID0gKHRvLCBmcm9tLCBwcm9wZXJ0eSwgaWdub3JlTm9uQ29uZmlndXJhYmxlKSA9PiB7XG5cdC8vIGBGdW5jdGlvbiNsZW5ndGhgIHNob3VsZCByZWZsZWN0IHRoZSBwYXJhbWV0ZXJzIG9mIGB0b2Agbm90IGBmcm9tYCBzaW5jZSB3ZSBrZWVwIGl0cyBib2R5LlxuXHQvLyBgRnVuY3Rpb24jcHJvdG90eXBlYCBpcyBub24td3JpdGFibGUgYW5kIG5vbi1jb25maWd1cmFibGUgc28gY2FuIG5ldmVyIGJlIG1vZGlmaWVkLlxuXHRpZiAocHJvcGVydHkgPT09ICdsZW5ndGgnIHx8IHByb3BlcnR5ID09PSAncHJvdG90eXBlJykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIGBGdW5jdGlvbiNhcmd1bWVudHNgIGFuZCBgRnVuY3Rpb24jY2FsbGVyYCBzaG91bGQgbm90IGJlIGNvcGllZC4gVGhleSB3ZXJlIHJlcG9ydGVkIHRvIGJlIHByZXNlbnQgaW4gYFJlZmxlY3Qub3duS2V5c2AgZm9yIHNvbWUgZGV2aWNlcyBpbiBSZWFjdCBOYXRpdmUgKCM0MSksIHNvIHdlIGV4cGxpY2l0bHkgaWdub3JlIHRoZW0gaGVyZS5cblx0aWYgKHByb3BlcnR5ID09PSAnYXJndW1lbnRzJyB8fCBwcm9wZXJ0eSA9PT0gJ2NhbGxlcicpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCB0b0Rlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRvLCBwcm9wZXJ0eSk7XG5cdGNvbnN0IGZyb21EZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihmcm9tLCBwcm9wZXJ0eSk7XG5cblx0aWYgKCFjYW5Db3B5UHJvcGVydHkodG9EZXNjcmlwdG9yLCBmcm9tRGVzY3JpcHRvcikgJiYgaWdub3JlTm9uQ29uZmlndXJhYmxlKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRvLCBwcm9wZXJ0eSwgZnJvbURlc2NyaXB0b3IpO1xufTtcblxuLy8gYE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgpYCB0aHJvd3MgaWYgdGhlIHByb3BlcnR5IGV4aXN0cywgaXMgbm90IGNvbmZpZ3VyYWJsZSBhbmQgZWl0aGVyOlxuLy8gLSBvbmUgaXRzIGRlc2NyaXB0b3JzIGlzIGNoYW5nZWRcbi8vIC0gaXQgaXMgbm9uLXdyaXRhYmxlIGFuZCBpdHMgdmFsdWUgaXMgY2hhbmdlZFxuY29uc3QgY2FuQ29weVByb3BlcnR5ID0gZnVuY3Rpb24gKHRvRGVzY3JpcHRvciwgZnJvbURlc2NyaXB0b3IpIHtcblx0cmV0dXJuIHRvRGVzY3JpcHRvciA9PT0gdW5kZWZpbmVkIHx8IHRvRGVzY3JpcHRvci5jb25maWd1cmFibGUgfHwgKFxuXHRcdHRvRGVzY3JpcHRvci53cml0YWJsZSA9PT0gZnJvbURlc2NyaXB0b3Iud3JpdGFibGUgJiZcblx0XHR0b0Rlc2NyaXB0b3IuZW51bWVyYWJsZSA9PT0gZnJvbURlc2NyaXB0b3IuZW51bWVyYWJsZSAmJlxuXHRcdHRvRGVzY3JpcHRvci5jb25maWd1cmFibGUgPT09IGZyb21EZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSAmJlxuXHRcdCh0b0Rlc2NyaXB0b3Iud3JpdGFibGUgfHwgdG9EZXNjcmlwdG9yLnZhbHVlID09PSBmcm9tRGVzY3JpcHRvci52YWx1ZSlcblx0KTtcbn07XG5cbmNvbnN0IGNoYW5nZVByb3RvdHlwZSA9ICh0bywgZnJvbSkgPT4ge1xuXHRjb25zdCBmcm9tUHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGZyb20pO1xuXHRpZiAoZnJvbVByb3RvdHlwZSA9PT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRvKSkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdE9iamVjdC5zZXRQcm90b3R5cGVPZih0bywgZnJvbVByb3RvdHlwZSk7XG59O1xuXG5jb25zdCB3cmFwcGVkVG9TdHJpbmcgPSAod2l0aE5hbWUsIGZyb21Cb2R5KSA9PiBgLyogV3JhcHBlZCAke3dpdGhOYW1lfSovXFxuJHtmcm9tQm9keX1gO1xuXG5jb25zdCB0b1N0cmluZ0Rlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEZ1bmN0aW9uLnByb3RvdHlwZSwgJ3RvU3RyaW5nJyk7XG5jb25zdCB0b1N0cmluZ05hbWUgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZywgJ25hbWUnKTtcblxuLy8gV2UgY2FsbCBgZnJvbS50b1N0cmluZygpYCBlYXJseSAobm90IGxhemlseSkgdG8gZW5zdXJlIGBmcm9tYCBjYW4gYmUgZ2FyYmFnZSBjb2xsZWN0ZWQuXG4vLyBXZSB1c2UgYGJpbmQoKWAgaW5zdGVhZCBvZiBhIGNsb3N1cmUgZm9yIHRoZSBzYW1lIHJlYXNvbi5cbi8vIENhbGxpbmcgYGZyb20udG9TdHJpbmcoKWAgZWFybHkgYWxzbyBhbGxvd3MgY2FjaGluZyBpdCBpbiBjYXNlIGB0by50b1N0cmluZygpYCBpcyBjYWxsZWQgc2V2ZXJhbCB0aW1lcy5cbmNvbnN0IGNoYW5nZVRvU3RyaW5nID0gKHRvLCBmcm9tLCBuYW1lKSA9PiB7XG5cdGNvbnN0IHdpdGhOYW1lID0gbmFtZSA9PT0gJycgPyAnJyA6IGB3aXRoICR7bmFtZS50cmltKCl9KCkgYDtcblx0Y29uc3QgbmV3VG9TdHJpbmcgPSB3cmFwcGVkVG9TdHJpbmcuYmluZChudWxsLCB3aXRoTmFtZSwgZnJvbS50b1N0cmluZygpKTtcblx0Ly8gRW5zdXJlIGB0by50b1N0cmluZy50b1N0cmluZ2AgaXMgbm9uLWVudW1lcmFibGUgYW5kIGhhcyB0aGUgc2FtZSBgc2FtZWBcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5ld1RvU3RyaW5nLCAnbmFtZScsIHRvU3RyaW5nTmFtZSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0bywgJ3RvU3RyaW5nJywgey4uLnRvU3RyaW5nRGVzY3JpcHRvciwgdmFsdWU6IG5ld1RvU3RyaW5nfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtaW1pY0Z1bmN0aW9uKHRvLCBmcm9tLCB7aWdub3JlTm9uQ29uZmlndXJhYmxlID0gZmFsc2V9ID0ge30pIHtcblx0Y29uc3Qge25hbWV9ID0gdG87XG5cblx0Zm9yIChjb25zdCBwcm9wZXJ0eSBvZiBSZWZsZWN0Lm93bktleXMoZnJvbSkpIHtcblx0XHRjb3B5UHJvcGVydHkodG8sIGZyb20sIHByb3BlcnR5LCBpZ25vcmVOb25Db25maWd1cmFibGUpO1xuXHR9XG5cblx0Y2hhbmdlUHJvdG90eXBlKHRvLCBmcm9tKTtcblx0Y2hhbmdlVG9TdHJpbmcodG8sIGZyb20sIG5hbWUpO1xuXG5cdHJldHVybiB0bztcbn1cbiIsICJpbXBvcnQgbWltaWNGdW5jdGlvbiBmcm9tICdtaW1pYy1mbic7XG5cbmNvbnN0IGNhbGxlZEZ1bmN0aW9ucyA9IG5ldyBXZWFrTWFwKCk7XG5cbmNvbnN0IG9uZXRpbWUgPSAoZnVuY3Rpb25fLCBvcHRpb25zID0ge30pID0+IHtcblx0aWYgKHR5cGVvZiBmdW5jdGlvbl8gIT09ICdmdW5jdGlvbicpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIGZ1bmN0aW9uJyk7XG5cdH1cblxuXHRsZXQgcmV0dXJuVmFsdWU7XG5cdGxldCBjYWxsQ291bnQgPSAwO1xuXHRjb25zdCBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbl8uZGlzcGxheU5hbWUgfHwgZnVuY3Rpb25fLm5hbWUgfHwgJzxhbm9ueW1vdXM+JztcblxuXHRjb25zdCBvbmV0aW1lID0gZnVuY3Rpb24gKC4uLmFyZ3VtZW50c18pIHtcblx0XHRjYWxsZWRGdW5jdGlvbnMuc2V0KG9uZXRpbWUsICsrY2FsbENvdW50KTtcblxuXHRcdGlmIChjYWxsQ291bnQgPT09IDEpIHtcblx0XHRcdHJldHVyblZhbHVlID0gZnVuY3Rpb25fLmFwcGx5KHRoaXMsIGFyZ3VtZW50c18pO1xuXHRcdFx0ZnVuY3Rpb25fID0gbnVsbDtcblx0XHR9IGVsc2UgaWYgKG9wdGlvbnMudGhyb3cgPT09IHRydWUpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgRnVuY3Rpb24gXFxgJHtmdW5jdGlvbk5hbWV9XFxgIGNhbiBvbmx5IGJlIGNhbGxlZCBvbmNlYCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldHVyblZhbHVlO1xuXHR9O1xuXG5cdG1pbWljRnVuY3Rpb24ob25ldGltZSwgZnVuY3Rpb25fKTtcblx0Y2FsbGVkRnVuY3Rpb25zLnNldChvbmV0aW1lLCBjYWxsQ291bnQpO1xuXG5cdHJldHVybiBvbmV0aW1lO1xufTtcblxub25ldGltZS5jYWxsQ291bnQgPSBmdW5jdGlvbl8gPT4ge1xuXHRpZiAoIWNhbGxlZEZ1bmN0aW9ucy5oYXMoZnVuY3Rpb25fKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgVGhlIGdpdmVuIGZ1bmN0aW9uIFxcYCR7ZnVuY3Rpb25fLm5hbWV9XFxgIGlzIG5vdCB3cmFwcGVkIGJ5IHRoZSBcXGBvbmV0aW1lXFxgIHBhY2thZ2VgKTtcblx0fVxuXG5cdHJldHVybiBjYWxsZWRGdW5jdGlvbnMuZ2V0KGZ1bmN0aW9uXyk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBvbmV0aW1lO1xuIiwgImltcG9ydHtjb25zdGFudHN9ZnJvbVwibm9kZTpvc1wiO1xuXG5pbXBvcnR7U0lHUlRNQVh9ZnJvbVwiLi9yZWFsdGltZS5qc1wiO1xuaW1wb3J0e2dldFNpZ25hbHN9ZnJvbVwiLi9zaWduYWxzLmpzXCI7XG5cblxuXG5jb25zdCBnZXRTaWduYWxzQnlOYW1lPWZ1bmN0aW9uKCl7XG5jb25zdCBzaWduYWxzPWdldFNpZ25hbHMoKTtcbnJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoc2lnbmFscy5tYXAoZ2V0U2lnbmFsQnlOYW1lKSk7XG59O1xuXG5jb25zdCBnZXRTaWduYWxCeU5hbWU9ZnVuY3Rpb24oe1xubmFtZSxcbm51bWJlcixcbmRlc2NyaXB0aW9uLFxuc3VwcG9ydGVkLFxuYWN0aW9uLFxuZm9yY2VkLFxuc3RhbmRhcmR9KVxue1xucmV0dXJuW1xubmFtZSxcbntuYW1lLG51bWJlcixkZXNjcmlwdGlvbixzdXBwb3J0ZWQsYWN0aW9uLGZvcmNlZCxzdGFuZGFyZH1dO1xuXG59O1xuXG5leHBvcnQgY29uc3Qgc2lnbmFsc0J5TmFtZT1nZXRTaWduYWxzQnlOYW1lKCk7XG5cblxuXG5cbmNvbnN0IGdldFNpZ25hbHNCeU51bWJlcj1mdW5jdGlvbigpe1xuY29uc3Qgc2lnbmFscz1nZXRTaWduYWxzKCk7XG5jb25zdCBsZW5ndGg9U0lHUlRNQVgrMTtcbmNvbnN0IHNpZ25hbHNBPUFycmF5LmZyb20oe2xlbmd0aH0sKHZhbHVlLG51bWJlcik9PlxuZ2V0U2lnbmFsQnlOdW1iZXIobnVtYmVyLHNpZ25hbHMpKTtcblxucmV0dXJuIE9iamVjdC5hc3NpZ24oe30sLi4uc2lnbmFsc0EpO1xufTtcblxuY29uc3QgZ2V0U2lnbmFsQnlOdW1iZXI9ZnVuY3Rpb24obnVtYmVyLHNpZ25hbHMpe1xuY29uc3Qgc2lnbmFsPWZpbmRTaWduYWxCeU51bWJlcihudW1iZXIsc2lnbmFscyk7XG5cbmlmKHNpZ25hbD09PXVuZGVmaW5lZCl7XG5yZXR1cm57fTtcbn1cblxuY29uc3R7bmFtZSxkZXNjcmlwdGlvbixzdXBwb3J0ZWQsYWN0aW9uLGZvcmNlZCxzdGFuZGFyZH09c2lnbmFsO1xucmV0dXJue1xuW251bWJlcl06e1xubmFtZSxcbm51bWJlcixcbmRlc2NyaXB0aW9uLFxuc3VwcG9ydGVkLFxuYWN0aW9uLFxuZm9yY2VkLFxuc3RhbmRhcmR9fTtcblxuXG59O1xuXG5cblxuY29uc3QgZmluZFNpZ25hbEJ5TnVtYmVyPWZ1bmN0aW9uKG51bWJlcixzaWduYWxzKXtcbmNvbnN0IHNpZ25hbD1zaWduYWxzLmZpbmQoKHtuYW1lfSk9PmNvbnN0YW50cy5zaWduYWxzW25hbWVdPT09bnVtYmVyKTtcblxuaWYoc2lnbmFsIT09dW5kZWZpbmVkKXtcbnJldHVybiBzaWduYWw7XG59XG5cbnJldHVybiBzaWduYWxzLmZpbmQoKHNpZ25hbEEpPT5zaWduYWxBLm51bWJlcj09PW51bWJlcik7XG59O1xuXG5leHBvcnQgY29uc3Qgc2lnbmFsc0J5TnVtYmVyPWdldFNpZ25hbHNCeU51bWJlcigpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFpbi5qcy5tYXAiLCAiXG5leHBvcnQgY29uc3QgZ2V0UmVhbHRpbWVTaWduYWxzPWZ1bmN0aW9uKCl7XG5jb25zdCBsZW5ndGg9U0lHUlRNQVgtU0lHUlRNSU4rMTtcbnJldHVybiBBcnJheS5mcm9tKHtsZW5ndGh9LGdldFJlYWx0aW1lU2lnbmFsKTtcbn07XG5cbmNvbnN0IGdldFJlYWx0aW1lU2lnbmFsPWZ1bmN0aW9uKHZhbHVlLGluZGV4KXtcbnJldHVybntcbm5hbWU6YFNJR1JUJHtpbmRleCsxfWAsXG5udW1iZXI6U0lHUlRNSU4raW5kZXgsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQXBwbGljYXRpb24tc3BlY2lmaWMgc2lnbmFsIChyZWFsdGltZSlcIixcbnN0YW5kYXJkOlwicG9zaXhcIn07XG5cbn07XG5cbmNvbnN0IFNJR1JUTUlOPTM0O1xuZXhwb3J0IGNvbnN0IFNJR1JUTUFYPTY0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVhbHRpbWUuanMubWFwIiwgImltcG9ydHtjb25zdGFudHN9ZnJvbVwibm9kZTpvc1wiO1xuXG5pbXBvcnR7U0lHTkFMU31mcm9tXCIuL2NvcmUuanNcIjtcbmltcG9ydHtnZXRSZWFsdGltZVNpZ25hbHN9ZnJvbVwiLi9yZWFsdGltZS5qc1wiO1xuXG5cblxuZXhwb3J0IGNvbnN0IGdldFNpZ25hbHM9ZnVuY3Rpb24oKXtcbmNvbnN0IHJlYWx0aW1lU2lnbmFscz1nZXRSZWFsdGltZVNpZ25hbHMoKTtcbmNvbnN0IHNpZ25hbHM9Wy4uLlNJR05BTFMsLi4ucmVhbHRpbWVTaWduYWxzXS5tYXAobm9ybWFsaXplU2lnbmFsKTtcbnJldHVybiBzaWduYWxzO1xufTtcblxuXG5cblxuXG5cblxuY29uc3Qgbm9ybWFsaXplU2lnbmFsPWZ1bmN0aW9uKHtcbm5hbWUsXG5udW1iZXI6ZGVmYXVsdE51bWJlcixcbmRlc2NyaXB0aW9uLFxuYWN0aW9uLFxuZm9yY2VkPWZhbHNlLFxuc3RhbmRhcmR9KVxue1xuY29uc3R7XG5zaWduYWxzOntbbmFtZV06Y29uc3RhbnRTaWduYWx9fT1cbmNvbnN0YW50cztcbmNvbnN0IHN1cHBvcnRlZD1jb25zdGFudFNpZ25hbCE9PXVuZGVmaW5lZDtcbmNvbnN0IG51bWJlcj1zdXBwb3J0ZWQ/Y29uc3RhbnRTaWduYWw6ZGVmYXVsdE51bWJlcjtcbnJldHVybntuYW1lLG51bWJlcixkZXNjcmlwdGlvbixzdXBwb3J0ZWQsYWN0aW9uLGZvcmNlZCxzdGFuZGFyZH07XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2lnbmFscy5qcy5tYXAiLCAiXG5cbmV4cG9ydCBjb25zdCBTSUdOQUxTPVtcbntcbm5hbWU6XCJTSUdIVVBcIixcbm51bWJlcjoxLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlRlcm1pbmFsIGNsb3NlZFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0lOVFwiLFxubnVtYmVyOjIsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVXNlciBpbnRlcnJ1cHRpb24gd2l0aCBDVFJMLUNcIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR1FVSVRcIixcbm51bWJlcjozLFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJVc2VyIGludGVycnVwdGlvbiB3aXRoIENUUkwtXFxcXFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0lMTFwiLFxubnVtYmVyOjQsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkludmFsaWQgbWFjaGluZSBpbnN0cnVjdGlvblwiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHVFJBUFwiLFxubnVtYmVyOjUsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkRlYnVnZ2VyIGJyZWFrcG9pbnRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdBQlJUXCIsXG5udW1iZXI6NixcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiQWJvcnRlZFwiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHSU9UXCIsXG5udW1iZXI6NixcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiQWJvcnRlZFwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdCVVNcIixcbm51bWJlcjo3LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XG5cIkJ1cyBlcnJvciBkdWUgdG8gbWlzYWxpZ25lZCwgbm9uLWV4aXN0aW5nIGFkZHJlc3Mgb3IgcGFnaW5nIGVycm9yXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR0VNVFwiLFxubnVtYmVyOjcsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQ29tbWFuZCBzaG91bGQgYmUgZW11bGF0ZWQgYnV0IGlzIG5vdCBpbXBsZW1lbnRlZFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR0ZQRVwiLFxubnVtYmVyOjgsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkZsb2F0aW5nIHBvaW50IGFyaXRobWV0aWMgZXJyb3JcIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR0tJTExcIixcbm51bWJlcjo5LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkZvcmNlZCB0ZXJtaW5hdGlvblwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwiLFxuZm9yY2VkOnRydWV9LFxuXG57XG5uYW1lOlwiU0lHVVNSMVwiLFxubnVtYmVyOjEwLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkFwcGxpY2F0aW9uLXNwZWNpZmljIHNpZ25hbFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR1NFR1ZcIixcbm51bWJlcjoxMSxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiU2VnbWVudGF0aW9uIGZhdWx0XCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdVU1IyXCIsXG5udW1iZXI6MTIsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQXBwbGljYXRpb24tc3BlY2lmaWMgc2lnbmFsXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHUElQRVwiLFxubnVtYmVyOjEzLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkJyb2tlbiBwaXBlIG9yIHNvY2tldFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0FMUk1cIixcbm51bWJlcjoxNCxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUaW1lb3V0IG9yIHRpbWVyXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHVEVSTVwiLFxubnVtYmVyOjE1LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlRlcm1pbmF0aW9uXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdTVEtGTFRcIixcbm51bWJlcjoxNixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJTdGFjayBpcyBlbXB0eSBvciBvdmVyZmxvd2VkXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHQ0hMRFwiLFxubnVtYmVyOjE3LFxuYWN0aW9uOlwiaWdub3JlXCIsXG5kZXNjcmlwdGlvbjpcIkNoaWxkIHByb2Nlc3MgdGVybWluYXRlZCwgcGF1c2VkIG9yIHVucGF1c2VkXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHQ0xEXCIsXG5udW1iZXI6MTcsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiQ2hpbGQgcHJvY2VzcyB0ZXJtaW5hdGVkLCBwYXVzZWQgb3IgdW5wYXVzZWRcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdDT05UXCIsXG5udW1iZXI6MTgsXG5hY3Rpb246XCJ1bnBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIlVucGF1c2VkXCIsXG5zdGFuZGFyZDpcInBvc2l4XCIsXG5mb3JjZWQ6dHJ1ZX0sXG5cbntcbm5hbWU6XCJTSUdTVE9QXCIsXG5udW1iZXI6MTksXG5hY3Rpb246XCJwYXVzZVwiLFxuZGVzY3JpcHRpb246XCJQYXVzZWRcIixcbnN0YW5kYXJkOlwicG9zaXhcIixcbmZvcmNlZDp0cnVlfSxcblxue1xubmFtZTpcIlNJR1RTVFBcIixcbm51bWJlcjoyMCxcbmFjdGlvbjpcInBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIlBhdXNlZCB1c2luZyBDVFJMLVogb3IgXFxcInN1c3BlbmRcXFwiXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHVFRJTlwiLFxubnVtYmVyOjIxLFxuYWN0aW9uOlwicGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiQmFja2dyb3VuZCBwcm9jZXNzIGNhbm5vdCByZWFkIHRlcm1pbmFsIGlucHV0XCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHQlJFQUtcIixcbm51bWJlcjoyMSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJVc2VyIGludGVycnVwdGlvbiB3aXRoIENUUkwtQlJFQUtcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdUVE9VXCIsXG5udW1iZXI6MjIsXG5hY3Rpb246XCJwYXVzZVwiLFxuZGVzY3JpcHRpb246XCJCYWNrZ3JvdW5kIHByb2Nlc3MgY2Fubm90IHdyaXRlIHRvIHRlcm1pbmFsIG91dHB1dFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR1VSR1wiLFxubnVtYmVyOjIzLFxuYWN0aW9uOlwiaWdub3JlXCIsXG5kZXNjcmlwdGlvbjpcIlNvY2tldCByZWNlaXZlZCBvdXQtb2YtYmFuZCBkYXRhXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1hDUFVcIixcbm51bWJlcjoyNCxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiUHJvY2VzcyB0aW1lZCBvdXRcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHWEZTWlwiLFxubnVtYmVyOjI1LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJGaWxlIHRvbyBiaWdcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHVlRBTFJNXCIsXG5udW1iZXI6MjYsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGltZW91dCBvciB0aW1lclwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdQUk9GXCIsXG5udW1iZXI6MjcsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGltZW91dCBvciB0aW1lclwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdXSU5DSFwiLFxubnVtYmVyOjI4LFxuYWN0aW9uOlwiaWdub3JlXCIsXG5kZXNjcmlwdGlvbjpcIlRlcm1pbmFsIHdpbmRvdyBzaXplIGNoYW5nZWRcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHSU9cIixcbm51bWJlcjoyOSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJJL08gaXMgYXZhaWxhYmxlXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHUE9MTFwiLFxubnVtYmVyOjI5LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIldhdGNoZWQgZXZlbnRcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdJTkZPXCIsXG5udW1iZXI6MjksXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiUmVxdWVzdCBmb3IgcHJvY2VzcyBpbmZvcm1hdGlvblwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR1BXUlwiLFxubnVtYmVyOjMwLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkRldmljZSBydW5uaW5nIG91dCBvZiBwb3dlclwiLFxuc3RhbmRhcmQ6XCJzeXN0ZW12XCJ9LFxuXG57XG5uYW1lOlwiU0lHU1lTXCIsXG5udW1iZXI6MzEsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkludmFsaWQgc3lzdGVtIGNhbGxcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdVTlVTRURcIixcbm51bWJlcjozMSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJJbnZhbGlkIHN5c3RlbSBjYWxsXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9XTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvcmUuanMubWFwIiwgImltcG9ydCB7c2lnbmFsc0J5TmFtZX0gZnJvbSAnaHVtYW4tc2lnbmFscyc7XG5cbmNvbnN0IGdldEVycm9yUHJlZml4ID0gKHt0aW1lZE91dCwgdGltZW91dCwgZXJyb3JDb2RlLCBzaWduYWwsIHNpZ25hbERlc2NyaXB0aW9uLCBleGl0Q29kZSwgaXNDYW5jZWxlZH0pID0+IHtcblx0aWYgKHRpbWVkT3V0KSB7XG5cdFx0cmV0dXJuIGB0aW1lZCBvdXQgYWZ0ZXIgJHt0aW1lb3V0fSBtaWxsaXNlY29uZHNgO1xuXHR9XG5cblx0aWYgKGlzQ2FuY2VsZWQpIHtcblx0XHRyZXR1cm4gJ3dhcyBjYW5jZWxlZCc7XG5cdH1cblxuXHRpZiAoZXJyb3JDb2RlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYGZhaWxlZCB3aXRoICR7ZXJyb3JDb2RlfWA7XG5cdH1cblxuXHRpZiAoc2lnbmFsICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYHdhcyBraWxsZWQgd2l0aCAke3NpZ25hbH0gKCR7c2lnbmFsRGVzY3JpcHRpb259KWA7XG5cdH1cblxuXHRpZiAoZXhpdENvZGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBgZmFpbGVkIHdpdGggZXhpdCBjb2RlICR7ZXhpdENvZGV9YDtcblx0fVxuXG5cdHJldHVybiAnZmFpbGVkJztcbn07XG5cbmV4cG9ydCBjb25zdCBtYWtlRXJyb3IgPSAoe1xuXHRzdGRvdXQsXG5cdHN0ZGVycixcblx0YWxsLFxuXHRlcnJvcixcblx0c2lnbmFsLFxuXHRleGl0Q29kZSxcblx0Y29tbWFuZCxcblx0ZXNjYXBlZENvbW1hbmQsXG5cdHRpbWVkT3V0LFxuXHRpc0NhbmNlbGVkLFxuXHRraWxsZWQsXG5cdHBhcnNlZDoge29wdGlvbnM6IHt0aW1lb3V0fX0sXG59KSA9PiB7XG5cdC8vIGBzaWduYWxgIGFuZCBgZXhpdENvZGVgIGVtaXR0ZWQgb24gYHNwYXduZWQub24oJ2V4aXQnKWAgZXZlbnQgY2FuIGJlIGBudWxsYC5cblx0Ly8gV2Ugbm9ybWFsaXplIHRoZW0gdG8gYHVuZGVmaW5lZGBcblx0ZXhpdENvZGUgPSBleGl0Q29kZSA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGV4aXRDb2RlO1xuXHRzaWduYWwgPSBzaWduYWwgPT09IG51bGwgPyB1bmRlZmluZWQgOiBzaWduYWw7XG5cdGNvbnN0IHNpZ25hbERlc2NyaXB0aW9uID0gc2lnbmFsID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBzaWduYWxzQnlOYW1lW3NpZ25hbF0uZGVzY3JpcHRpb247XG5cblx0Y29uc3QgZXJyb3JDb2RlID0gZXJyb3IgJiYgZXJyb3IuY29kZTtcblxuXHRjb25zdCBwcmVmaXggPSBnZXRFcnJvclByZWZpeCh7dGltZWRPdXQsIHRpbWVvdXQsIGVycm9yQ29kZSwgc2lnbmFsLCBzaWduYWxEZXNjcmlwdGlvbiwgZXhpdENvZGUsIGlzQ2FuY2VsZWR9KTtcblx0Y29uc3QgZXhlY2FNZXNzYWdlID0gYENvbW1hbmQgJHtwcmVmaXh9OiAke2NvbW1hbmR9YDtcblx0Y29uc3QgaXNFcnJvciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlcnJvcikgPT09ICdbb2JqZWN0IEVycm9yXSc7XG5cdGNvbnN0IHNob3J0TWVzc2FnZSA9IGlzRXJyb3IgPyBgJHtleGVjYU1lc3NhZ2V9XFxuJHtlcnJvci5tZXNzYWdlfWAgOiBleGVjYU1lc3NhZ2U7XG5cdGNvbnN0IG1lc3NhZ2UgPSBbc2hvcnRNZXNzYWdlLCBzdGRlcnIsIHN0ZG91dF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuXG5cdGlmIChpc0Vycm9yKSB7XG5cdFx0ZXJyb3Iub3JpZ2luYWxNZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcblx0XHRlcnJvci5tZXNzYWdlID0gbWVzc2FnZTtcblx0fSBlbHNlIHtcblx0XHRlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcblx0fVxuXG5cdGVycm9yLnNob3J0TWVzc2FnZSA9IHNob3J0TWVzc2FnZTtcblx0ZXJyb3IuY29tbWFuZCA9IGNvbW1hbmQ7XG5cdGVycm9yLmVzY2FwZWRDb21tYW5kID0gZXNjYXBlZENvbW1hbmQ7XG5cdGVycm9yLmV4aXRDb2RlID0gZXhpdENvZGU7XG5cdGVycm9yLnNpZ25hbCA9IHNpZ25hbDtcblx0ZXJyb3Iuc2lnbmFsRGVzY3JpcHRpb24gPSBzaWduYWxEZXNjcmlwdGlvbjtcblx0ZXJyb3Iuc3Rkb3V0ID0gc3Rkb3V0O1xuXHRlcnJvci5zdGRlcnIgPSBzdGRlcnI7XG5cblx0aWYgKGFsbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0ZXJyb3IuYWxsID0gYWxsO1xuXHR9XG5cblx0aWYgKCdidWZmZXJlZERhdGEnIGluIGVycm9yKSB7XG5cdFx0ZGVsZXRlIGVycm9yLmJ1ZmZlcmVkRGF0YTtcblx0fVxuXG5cdGVycm9yLmZhaWxlZCA9IHRydWU7XG5cdGVycm9yLnRpbWVkT3V0ID0gQm9vbGVhbih0aW1lZE91dCk7XG5cdGVycm9yLmlzQ2FuY2VsZWQgPSBpc0NhbmNlbGVkO1xuXHRlcnJvci5raWxsZWQgPSBraWxsZWQgJiYgIXRpbWVkT3V0O1xuXG5cdHJldHVybiBlcnJvcjtcbn07XG4iLCAiY29uc3QgYWxpYXNlcyA9IFsnc3RkaW4nLCAnc3Rkb3V0JywgJ3N0ZGVyciddO1xuXG5jb25zdCBoYXNBbGlhcyA9IG9wdGlvbnMgPT4gYWxpYXNlcy5zb21lKGFsaWFzID0+IG9wdGlvbnNbYWxpYXNdICE9PSB1bmRlZmluZWQpO1xuXG5leHBvcnQgY29uc3Qgbm9ybWFsaXplU3RkaW8gPSBvcHRpb25zID0+IHtcblx0aWYgKCFvcHRpb25zKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3Qge3N0ZGlvfSA9IG9wdGlvbnM7XG5cblx0aWYgKHN0ZGlvID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYWxpYXNlcy5tYXAoYWxpYXMgPT4gb3B0aW9uc1thbGlhc10pO1xuXHR9XG5cblx0aWYgKGhhc0FsaWFzKG9wdGlvbnMpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBJdCdzIG5vdCBwb3NzaWJsZSB0byBwcm92aWRlIFxcYHN0ZGlvXFxgIGluIGNvbWJpbmF0aW9uIHdpdGggb25lIG9mICR7YWxpYXNlcy5tYXAoYWxpYXMgPT4gYFxcYCR7YWxpYXN9XFxgYCkuam9pbignLCAnKX1gKTtcblx0fVxuXG5cdGlmICh0eXBlb2Ygc3RkaW8gPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHN0ZGlvO1xuXHR9XG5cblx0aWYgKCFBcnJheS5pc0FycmF5KHN0ZGlvKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFxcYHN0ZGlvXFxgIHRvIGJlIG9mIHR5cGUgXFxgc3RyaW5nXFxgIG9yIFxcYEFycmF5XFxgLCBnb3QgXFxgJHt0eXBlb2Ygc3RkaW99XFxgYCk7XG5cdH1cblxuXHRjb25zdCBsZW5ndGggPSBNYXRoLm1heChzdGRpby5sZW5ndGgsIGFsaWFzZXMubGVuZ3RoKTtcblx0cmV0dXJuIEFycmF5LmZyb20oe2xlbmd0aH0sICh2YWx1ZSwgaW5kZXgpID0+IHN0ZGlvW2luZGV4XSk7XG59O1xuXG4vLyBgaXBjYCBpcyBwdXNoZWQgdW5sZXNzIGl0IGlzIGFscmVhZHkgcHJlc2VudFxuZXhwb3J0IGNvbnN0IG5vcm1hbGl6ZVN0ZGlvTm9kZSA9IG9wdGlvbnMgPT4ge1xuXHRjb25zdCBzdGRpbyA9IG5vcm1hbGl6ZVN0ZGlvKG9wdGlvbnMpO1xuXG5cdGlmIChzdGRpbyA9PT0gJ2lwYycpIHtcblx0XHRyZXR1cm4gJ2lwYyc7XG5cdH1cblxuXHRpZiAoc3RkaW8gPT09IHVuZGVmaW5lZCB8fCB0eXBlb2Ygc3RkaW8gPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIFtzdGRpbywgc3RkaW8sIHN0ZGlvLCAnaXBjJ107XG5cdH1cblxuXHRpZiAoc3RkaW8uaW5jbHVkZXMoJ2lwYycpKSB7XG5cdFx0cmV0dXJuIHN0ZGlvO1xuXHR9XG5cblx0cmV0dXJuIFsuLi5zdGRpbywgJ2lwYyddO1xufTtcbiIsICJpbXBvcnQgb3MgZnJvbSAnbm9kZTpvcyc7XG5pbXBvcnQgb25FeGl0IGZyb20gJ3NpZ25hbC1leGl0JztcblxuY29uc3QgREVGQVVMVF9GT1JDRV9LSUxMX1RJTUVPVVQgPSAxMDAwICogNTtcblxuLy8gTW9ua2V5LXBhdGNoZXMgYGNoaWxkUHJvY2Vzcy5raWxsKClgIHRvIGFkZCBgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0YCBiZWhhdmlvclxuZXhwb3J0IGNvbnN0IHNwYXduZWRLaWxsID0gKGtpbGwsIHNpZ25hbCA9ICdTSUdURVJNJywgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IGtpbGxSZXN1bHQgPSBraWxsKHNpZ25hbCk7XG5cdHNldEtpbGxUaW1lb3V0KGtpbGwsIHNpZ25hbCwgb3B0aW9ucywga2lsbFJlc3VsdCk7XG5cdHJldHVybiBraWxsUmVzdWx0O1xufTtcblxuY29uc3Qgc2V0S2lsbFRpbWVvdXQgPSAoa2lsbCwgc2lnbmFsLCBvcHRpb25zLCBraWxsUmVzdWx0KSA9PiB7XG5cdGlmICghc2hvdWxkRm9yY2VLaWxsKHNpZ25hbCwgb3B0aW9ucywga2lsbFJlc3VsdCkpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCB0aW1lb3V0ID0gZ2V0Rm9yY2VLaWxsQWZ0ZXJUaW1lb3V0KG9wdGlvbnMpO1xuXHRjb25zdCB0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0a2lsbCgnU0lHS0lMTCcpO1xuXHR9LCB0aW1lb3V0KTtcblxuXHQvLyBHdWFyZGVkIGJlY2F1c2UgdGhlcmUncyBubyBgLnVucmVmKClgIHdoZW4gYGV4ZWNhYCBpcyB1c2VkIGluIHRoZSByZW5kZXJlclxuXHQvLyBwcm9jZXNzIGluIEVsZWN0cm9uLiBUaGlzIGNhbm5vdCBiZSB0ZXN0ZWQgc2luY2Ugd2UgZG9uJ3QgcnVuIHRlc3RzIGluXG5cdC8vIEVsZWN0cm9uLlxuXHQvLyBpc3RhbmJ1bCBpZ25vcmUgZWxzZVxuXHRpZiAodC51bnJlZikge1xuXHRcdHQudW5yZWYoKTtcblx0fVxufTtcblxuY29uc3Qgc2hvdWxkRm9yY2VLaWxsID0gKHNpZ25hbCwge2ZvcmNlS2lsbEFmdGVyVGltZW91dH0sIGtpbGxSZXN1bHQpID0+IGlzU2lndGVybShzaWduYWwpICYmIGZvcmNlS2lsbEFmdGVyVGltZW91dCAhPT0gZmFsc2UgJiYga2lsbFJlc3VsdDtcblxuY29uc3QgaXNTaWd0ZXJtID0gc2lnbmFsID0+IHNpZ25hbCA9PT0gb3MuY29uc3RhbnRzLnNpZ25hbHMuU0lHVEVSTVxuXHRcdHx8ICh0eXBlb2Ygc2lnbmFsID09PSAnc3RyaW5nJyAmJiBzaWduYWwudG9VcHBlckNhc2UoKSA9PT0gJ1NJR1RFUk0nKTtcblxuY29uc3QgZ2V0Rm9yY2VLaWxsQWZ0ZXJUaW1lb3V0ID0gKHtmb3JjZUtpbGxBZnRlclRpbWVvdXQgPSB0cnVlfSkgPT4ge1xuXHRpZiAoZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0ID09PSB0cnVlKSB7XG5cdFx0cmV0dXJuIERFRkFVTFRfRk9SQ0VfS0lMTF9USU1FT1VUO1xuXHR9XG5cblx0aWYgKCFOdW1iZXIuaXNGaW5pdGUoZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0KSB8fCBmb3JjZUtpbGxBZnRlclRpbWVvdXQgPCAwKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgdGhlIFxcYGZvcmNlS2lsbEFmdGVyVGltZW91dFxcYCBvcHRpb24gdG8gYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlciwgZ290IFxcYCR7Zm9yY2VLaWxsQWZ0ZXJUaW1lb3V0fVxcYCAoJHt0eXBlb2YgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0fSlgKTtcblx0fVxuXG5cdHJldHVybiBmb3JjZUtpbGxBZnRlclRpbWVvdXQ7XG59O1xuXG4vLyBgY2hpbGRQcm9jZXNzLmNhbmNlbCgpYFxuZXhwb3J0IGNvbnN0IHNwYXduZWRDYW5jZWwgPSAoc3Bhd25lZCwgY29udGV4dCkgPT4ge1xuXHRjb25zdCBraWxsUmVzdWx0ID0gc3Bhd25lZC5raWxsKCk7XG5cblx0aWYgKGtpbGxSZXN1bHQpIHtcblx0XHRjb250ZXh0LmlzQ2FuY2VsZWQgPSB0cnVlO1xuXHR9XG59O1xuXG5jb25zdCB0aW1lb3V0S2lsbCA9IChzcGF3bmVkLCBzaWduYWwsIHJlamVjdCkgPT4ge1xuXHRzcGF3bmVkLmtpbGwoc2lnbmFsKTtcblx0cmVqZWN0KE9iamVjdC5hc3NpZ24obmV3IEVycm9yKCdUaW1lZCBvdXQnKSwge3RpbWVkT3V0OiB0cnVlLCBzaWduYWx9KSk7XG59O1xuXG4vLyBgdGltZW91dGAgb3B0aW9uIGhhbmRsaW5nXG5leHBvcnQgY29uc3Qgc2V0dXBUaW1lb3V0ID0gKHNwYXduZWQsIHt0aW1lb3V0LCBraWxsU2lnbmFsID0gJ1NJR1RFUk0nfSwgc3Bhd25lZFByb21pc2UpID0+IHtcblx0aWYgKHRpbWVvdXQgPT09IDAgfHwgdGltZW91dCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIHNwYXduZWRQcm9taXNlO1xuXHR9XG5cblx0bGV0IHRpbWVvdXRJZDtcblx0Y29uc3QgdGltZW91dFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0dGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHR0aW1lb3V0S2lsbChzcGF3bmVkLCBraWxsU2lnbmFsLCByZWplY3QpO1xuXHRcdH0sIHRpbWVvdXQpO1xuXHR9KTtcblxuXHRjb25zdCBzYWZlU3Bhd25lZFByb21pc2UgPSBzcGF3bmVkUHJvbWlzZS5maW5hbGx5KCgpID0+IHtcblx0XHRjbGVhclRpbWVvdXQodGltZW91dElkKTtcblx0fSk7XG5cblx0cmV0dXJuIFByb21pc2UucmFjZShbdGltZW91dFByb21pc2UsIHNhZmVTcGF3bmVkUHJvbWlzZV0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHZhbGlkYXRlVGltZW91dCA9ICh7dGltZW91dH0pID0+IHtcblx0aWYgKHRpbWVvdXQgIT09IHVuZGVmaW5lZCAmJiAoIU51bWJlci5pc0Zpbml0ZSh0aW1lb3V0KSB8fCB0aW1lb3V0IDwgMCkpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCB0aGUgXFxgdGltZW91dFxcYCBvcHRpb24gdG8gYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlciwgZ290IFxcYCR7dGltZW91dH1cXGAgKCR7dHlwZW9mIHRpbWVvdXR9KWApO1xuXHR9XG59O1xuXG4vLyBgY2xlYW51cGAgb3B0aW9uIGhhbmRsaW5nXG5leHBvcnQgY29uc3Qgc2V0RXhpdEhhbmRsZXIgPSBhc3luYyAoc3Bhd25lZCwge2NsZWFudXAsIGRldGFjaGVkfSwgdGltZWRQcm9taXNlKSA9PiB7XG5cdGlmICghY2xlYW51cCB8fCBkZXRhY2hlZCkge1xuXHRcdHJldHVybiB0aW1lZFByb21pc2U7XG5cdH1cblxuXHRjb25zdCByZW1vdmVFeGl0SGFuZGxlciA9IG9uRXhpdCgoKSA9PiB7XG5cdFx0c3Bhd25lZC5raWxsKCk7XG5cdH0pO1xuXG5cdHJldHVybiB0aW1lZFByb21pc2UuZmluYWxseSgoKSA9PiB7XG5cdFx0cmVtb3ZlRXhpdEhhbmRsZXIoKTtcblx0fSk7XG59O1xuIiwgImV4cG9ydCBmdW5jdGlvbiBpc1N0cmVhbShzdHJlYW0pIHtcblx0cmV0dXJuIHN0cmVhbSAhPT0gbnVsbFxuXHRcdCYmIHR5cGVvZiBzdHJlYW0gPT09ICdvYmplY3QnXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5waXBlID09PSAnZnVuY3Rpb24nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNXcml0YWJsZVN0cmVhbShzdHJlYW0pIHtcblx0cmV0dXJuIGlzU3RyZWFtKHN0cmVhbSlcblx0XHQmJiBzdHJlYW0ud3JpdGFibGUgIT09IGZhbHNlXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5fd3JpdGUgPT09ICdmdW5jdGlvbidcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLl93cml0YWJsZVN0YXRlID09PSAnb2JqZWN0Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVhZGFibGVTdHJlYW0oc3RyZWFtKSB7XG5cdHJldHVybiBpc1N0cmVhbShzdHJlYW0pXG5cdFx0JiYgc3RyZWFtLnJlYWRhYmxlICE9PSBmYWxzZVxuXHRcdCYmIHR5cGVvZiBzdHJlYW0uX3JlYWQgPT09ICdmdW5jdGlvbidcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLl9yZWFkYWJsZVN0YXRlID09PSAnb2JqZWN0Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHVwbGV4U3RyZWFtKHN0cmVhbSkge1xuXHRyZXR1cm4gaXNXcml0YWJsZVN0cmVhbShzdHJlYW0pXG5cdFx0JiYgaXNSZWFkYWJsZVN0cmVhbShzdHJlYW0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUcmFuc2Zvcm1TdHJlYW0oc3RyZWFtKSB7XG5cdHJldHVybiBpc0R1cGxleFN0cmVhbShzdHJlYW0pXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5fdHJhbnNmb3JtID09PSAnZnVuY3Rpb24nO1xufVxuIiwgImltcG9ydCB7aXNTdHJlYW19IGZyb20gJ2lzLXN0cmVhbSc7XG5pbXBvcnQgZ2V0U3RyZWFtIGZyb20gJ2dldC1zdHJlYW0nO1xuaW1wb3J0IG1lcmdlU3RyZWFtIGZyb20gJ21lcmdlLXN0cmVhbSc7XG5cbi8vIGBpbnB1dGAgb3B0aW9uXG5leHBvcnQgY29uc3QgaGFuZGxlSW5wdXQgPSAoc3Bhd25lZCwgaW5wdXQpID0+IHtcblx0aWYgKGlucHV0ID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAoaXNTdHJlYW0oaW5wdXQpKSB7XG5cdFx0aW5wdXQucGlwZShzcGF3bmVkLnN0ZGluKTtcblx0fSBlbHNlIHtcblx0XHRzcGF3bmVkLnN0ZGluLmVuZChpbnB1dCk7XG5cdH1cbn07XG5cbi8vIGBhbGxgIGludGVybGVhdmVzIGBzdGRvdXRgIGFuZCBgc3RkZXJyYFxuZXhwb3J0IGNvbnN0IG1ha2VBbGxTdHJlYW0gPSAoc3Bhd25lZCwge2FsbH0pID0+IHtcblx0aWYgKCFhbGwgfHwgKCFzcGF3bmVkLnN0ZG91dCAmJiAhc3Bhd25lZC5zdGRlcnIpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgbWl4ZWQgPSBtZXJnZVN0cmVhbSgpO1xuXG5cdGlmIChzcGF3bmVkLnN0ZG91dCkge1xuXHRcdG1peGVkLmFkZChzcGF3bmVkLnN0ZG91dCk7XG5cdH1cblxuXHRpZiAoc3Bhd25lZC5zdGRlcnIpIHtcblx0XHRtaXhlZC5hZGQoc3Bhd25lZC5zdGRlcnIpO1xuXHR9XG5cblx0cmV0dXJuIG1peGVkO1xufTtcblxuLy8gT24gZmFpbHVyZSwgYHJlc3VsdC5zdGRvdXR8c3RkZXJyfGFsbGAgc2hvdWxkIGNvbnRhaW4gdGhlIGN1cnJlbnRseSBidWZmZXJlZCBzdHJlYW1cbmNvbnN0IGdldEJ1ZmZlcmVkRGF0YSA9IGFzeW5jIChzdHJlYW0sIHN0cmVhbVByb21pc2UpID0+IHtcblx0Ly8gV2hlbiBgYnVmZmVyYCBpcyBgZmFsc2VgLCBgc3RyZWFtUHJvbWlzZWAgaXMgYHVuZGVmaW5lZGAgYW5kIHRoZXJlIGlzIG5vIGJ1ZmZlcmVkIGRhdGEgdG8gcmV0cmlldmVcblx0aWYgKCFzdHJlYW0gfHwgc3RyZWFtUHJvbWlzZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0c3RyZWFtLmRlc3Ryb3koKTtcblxuXHR0cnkge1xuXHRcdHJldHVybiBhd2FpdCBzdHJlYW1Qcm9taXNlO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHJldHVybiBlcnJvci5idWZmZXJlZERhdGE7XG5cdH1cbn07XG5cbmNvbnN0IGdldFN0cmVhbVByb21pc2UgPSAoc3RyZWFtLCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyfSkgPT4ge1xuXHRpZiAoIXN0cmVhbSB8fCAhYnVmZmVyKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKGVuY29kaW5nKSB7XG5cdFx0cmV0dXJuIGdldFN0cmVhbShzdHJlYW0sIHtlbmNvZGluZywgbWF4QnVmZmVyfSk7XG5cdH1cblxuXHRyZXR1cm4gZ2V0U3RyZWFtLmJ1ZmZlcihzdHJlYW0sIHttYXhCdWZmZXJ9KTtcbn07XG5cbi8vIFJldHJpZXZlIHJlc3VsdCBvZiBjaGlsZCBwcm9jZXNzOiBleGl0IGNvZGUsIHNpZ25hbCwgZXJyb3IsIHN0cmVhbXMgKHN0ZG91dC9zdGRlcnIvYWxsKVxuZXhwb3J0IGNvbnN0IGdldFNwYXduZWRSZXN1bHQgPSBhc3luYyAoe3N0ZG91dCwgc3RkZXJyLCBhbGx9LCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyfSwgcHJvY2Vzc0RvbmUpID0+IHtcblx0Y29uc3Qgc3Rkb3V0UHJvbWlzZSA9IGdldFN0cmVhbVByb21pc2Uoc3Rkb3V0LCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyfSk7XG5cdGNvbnN0IHN0ZGVyclByb21pc2UgPSBnZXRTdHJlYW1Qcm9taXNlKHN0ZGVyciwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcn0pO1xuXHRjb25zdCBhbGxQcm9taXNlID0gZ2V0U3RyZWFtUHJvbWlzZShhbGwsIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXI6IG1heEJ1ZmZlciAqIDJ9KTtcblxuXHR0cnkge1xuXHRcdHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChbcHJvY2Vzc0RvbmUsIHN0ZG91dFByb21pc2UsIHN0ZGVyclByb21pc2UsIGFsbFByb21pc2VdKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoW1xuXHRcdFx0e2Vycm9yLCBzaWduYWw6IGVycm9yLnNpZ25hbCwgdGltZWRPdXQ6IGVycm9yLnRpbWVkT3V0fSxcblx0XHRcdGdldEJ1ZmZlcmVkRGF0YShzdGRvdXQsIHN0ZG91dFByb21pc2UpLFxuXHRcdFx0Z2V0QnVmZmVyZWREYXRhKHN0ZGVyciwgc3RkZXJyUHJvbWlzZSksXG5cdFx0XHRnZXRCdWZmZXJlZERhdGEoYWxsLCBhbGxQcm9taXNlKSxcblx0XHRdKTtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IHZhbGlkYXRlSW5wdXRTeW5jID0gKHtpbnB1dH0pID0+IHtcblx0aWYgKGlzU3RyZWFtKGlucHV0KSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBgaW5wdXRgIG9wdGlvbiBjYW5ub3QgYmUgYSBzdHJlYW0gaW4gc3luYyBtb2RlJyk7XG5cdH1cbn07XG4iLCAiLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHVuaWNvcm4vcHJlZmVyLXRvcC1sZXZlbC1hd2FpdFxuY29uc3QgbmF0aXZlUHJvbWlzZVByb3RvdHlwZSA9IChhc3luYyAoKSA9PiB7fSkoKS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG5cbmNvbnN0IGRlc2NyaXB0b3JzID0gWyd0aGVuJywgJ2NhdGNoJywgJ2ZpbmFsbHknXS5tYXAocHJvcGVydHkgPT4gW1xuXHRwcm9wZXJ0eSxcblx0UmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobmF0aXZlUHJvbWlzZVByb3RvdHlwZSwgcHJvcGVydHkpLFxuXSk7XG5cbi8vIFRoZSByZXR1cm4gdmFsdWUgaXMgYSBtaXhpbiBvZiBgY2hpbGRQcm9jZXNzYCBhbmQgYFByb21pc2VgXG5leHBvcnQgY29uc3QgbWVyZ2VQcm9taXNlID0gKHNwYXduZWQsIHByb21pc2UpID0+IHtcblx0Zm9yIChjb25zdCBbcHJvcGVydHksIGRlc2NyaXB0b3JdIG9mIGRlc2NyaXB0b3JzKSB7XG5cdFx0Ly8gU3RhcnRpbmcgdGhlIG1haW4gYHByb21pc2VgIGlzIGRlZmVycmVkIHRvIGF2b2lkIGNvbnN1bWluZyBzdHJlYW1zXG5cdFx0Y29uc3QgdmFsdWUgPSB0eXBlb2YgcHJvbWlzZSA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdFx0PyAoLi4uYXJncykgPT4gUmVmbGVjdC5hcHBseShkZXNjcmlwdG9yLnZhbHVlLCBwcm9taXNlKCksIGFyZ3MpXG5cdFx0XHQ6IGRlc2NyaXB0b3IudmFsdWUuYmluZChwcm9taXNlKTtcblxuXHRcdFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoc3Bhd25lZCwgcHJvcGVydHksIHsuLi5kZXNjcmlwdG9yLCB2YWx1ZX0pO1xuXHR9XG5cblx0cmV0dXJuIHNwYXduZWQ7XG59O1xuXG4vLyBVc2UgcHJvbWlzZXMgaW5zdGVhZCBvZiBgY2hpbGRfcHJvY2Vzc2AgZXZlbnRzXG5leHBvcnQgY29uc3QgZ2V0U3Bhd25lZFByb21pc2UgPSBzcGF3bmVkID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0c3Bhd25lZC5vbignZXhpdCcsIChleGl0Q29kZSwgc2lnbmFsKSA9PiB7XG5cdFx0cmVzb2x2ZSh7ZXhpdENvZGUsIHNpZ25hbH0pO1xuXHR9KTtcblxuXHRzcGF3bmVkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcblx0XHRyZWplY3QoZXJyb3IpO1xuXHR9KTtcblxuXHRpZiAoc3Bhd25lZC5zdGRpbikge1xuXHRcdHNwYXduZWQuc3RkaW4ub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuXHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHR9KTtcblx0fVxufSk7XG4iLCAiY29uc3Qgbm9ybWFsaXplQXJncyA9IChmaWxlLCBhcmdzID0gW10pID0+IHtcblx0aWYgKCFBcnJheS5pc0FycmF5KGFyZ3MpKSB7XG5cdFx0cmV0dXJuIFtmaWxlXTtcblx0fVxuXG5cdHJldHVybiBbZmlsZSwgLi4uYXJnc107XG59O1xuXG5jb25zdCBOT19FU0NBUEVfUkVHRVhQID0gL15bXFx3Li1dKyQvO1xuY29uc3QgRE9VQkxFX1FVT1RFU19SRUdFWFAgPSAvXCIvZztcblxuY29uc3QgZXNjYXBlQXJnID0gYXJnID0+IHtcblx0aWYgKHR5cGVvZiBhcmcgIT09ICdzdHJpbmcnIHx8IE5PX0VTQ0FQRV9SRUdFWFAudGVzdChhcmcpKSB7XG5cdFx0cmV0dXJuIGFyZztcblx0fVxuXG5cdHJldHVybiBgXCIke2FyZy5yZXBsYWNlKERPVUJMRV9RVU9URVNfUkVHRVhQLCAnXFxcXFwiJyl9XCJgO1xufTtcblxuZXhwb3J0IGNvbnN0IGpvaW5Db21tYW5kID0gKGZpbGUsIGFyZ3MpID0+IG5vcm1hbGl6ZUFyZ3MoZmlsZSwgYXJncykuam9pbignICcpO1xuXG5leHBvcnQgY29uc3QgZ2V0RXNjYXBlZENvbW1hbmQgPSAoZmlsZSwgYXJncykgPT4gbm9ybWFsaXplQXJncyhmaWxlLCBhcmdzKS5tYXAoYXJnID0+IGVzY2FwZUFyZyhhcmcpKS5qb2luKCcgJyk7XG5cbmNvbnN0IFNQQUNFU19SRUdFWFAgPSAvICsvZztcblxuLy8gSGFuZGxlIGBleGVjYUNvbW1hbmQoKWBcbmV4cG9ydCBjb25zdCBwYXJzZUNvbW1hbmQgPSBjb21tYW5kID0+IHtcblx0Y29uc3QgdG9rZW5zID0gW107XG5cdGZvciAoY29uc3QgdG9rZW4gb2YgY29tbWFuZC50cmltKCkuc3BsaXQoU1BBQ0VTX1JFR0VYUCkpIHtcblx0XHQvLyBBbGxvdyBzcGFjZXMgdG8gYmUgZXNjYXBlZCBieSBhIGJhY2tzbGFzaCBpZiBub3QgbWVhbnQgYXMgYSBkZWxpbWl0ZXJcblx0XHRjb25zdCBwcmV2aW91c1Rva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcblx0XHRpZiAocHJldmlvdXNUb2tlbiAmJiBwcmV2aW91c1Rva2VuLmVuZHNXaXRoKCdcXFxcJykpIHtcblx0XHRcdC8vIE1lcmdlIHByZXZpb3VzIHRva2VuIHdpdGggY3VycmVudCBvbmVcblx0XHRcdHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0gPSBgJHtwcmV2aW91c1Rva2VuLnNsaWNlKDAsIC0xKX0gJHt0b2tlbn1gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0b2tlbnMucHVzaCh0b2tlbik7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRva2Vucztcbn07XG4iLCAiLyogUHV0IGNvbnN0YW50cyB0aGF0IHlvdSBmZWVsIGxpa2UgdGhleSBzdGlsbCBkb24ndCBkZXNlcnZlIGEgZmlsZSBvZiB0aGVpciBvd24gaGVyZSAqL1xuXG5pbXBvcnQgeyBJY29uLCBLZXlib2FyZCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IEl0ZW1UeXBlIH0gZnJvbSBcIn4vdHlwZXMvdmF1bHRcIjtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VSVkVSX1VSTCA9IFwiaHR0cHM6Ly9iaXR3YXJkZW4uY29tXCI7XG5cbmV4cG9ydCBjb25zdCBTRU5TSVRJVkVfVkFMVUVfUExBQ0VIT0xERVIgPSBcIkhJRERFTi1WQUxVRVwiO1xuXG5leHBvcnQgY29uc3QgTE9DQUxfU1RPUkFHRV9LRVkgPSB7XG4gIFBBU1NXT1JEX09QVElPTlM6IFwiYnctZ2VuZXJhdGUtcGFzc3dvcmQtb3B0aW9uc1wiLFxuICBQQVNTV09SRF9PTkVfVElNRV9XQVJOSU5HOiBcImJ3LWdlbmVyYXRlLXBhc3N3b3JkLXdhcm5pbmctYWNjZXB0ZWRcIixcbiAgU0VTU0lPTl9UT0tFTjogXCJzZXNzaW9uVG9rZW5cIixcbiAgUkVQUk9NUFRfSEFTSDogXCJzZXNzaW9uUmVwcm9tcHRIYXNoXCIsXG4gIFNFUlZFUl9VUkw6IFwiY2xpU2VydmVyXCIsXG4gIExBU1RfQUNUSVZJVFlfVElNRTogXCJsYXN0QWN0aXZpdHlUaW1lXCIsXG4gIFZBVUxUX0xPQ0tfUkVBU09OOiBcInZhdWx0TG9ja1JlYXNvblwiLFxuICBWQVVMVF9GQVZPUklURV9PUkRFUjogXCJ2YXVsdEZhdm9yaXRlT3JkZXJcIixcbiAgVkFVTFRfTEFTVF9TVEFUVVM6IFwibGFzdFZhdWx0U3RhdHVzXCIsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgVkFVTFRfTE9DS19NRVNTQUdFUyA9IHtcbiAgVElNRU9VVDogXCJWYXVsdCB0aW1lZCBvdXQgZHVlIHRvIGluYWN0aXZpdHlcIixcbiAgTUFOVUFMOiBcIk1hbnVhbGx5IGxvY2tlZCBieSB0aGUgdXNlclwiLFxuICBTWVNURU1fTE9DSzogXCJTY3JlZW4gd2FzIGxvY2tlZFwiLFxuICBTWVNURU1fU0xFRVA6IFwiU3lzdGVtIHdlbnQgdG8gc2xlZXBcIixcbiAgQ0xJX1VQREFURUQ6IFwiQml0d2FyZGVuIGhhcyBiZWVuIHVwZGF0ZWQuIFBsZWFzZSBsb2dpbiBhZ2Fpbi5cIixcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBTSE9SVENVVF9LRVlfU0VRVUVOQ0U6IEtleWJvYXJkLktleUVxdWl2YWxlbnRbXSA9IFtcbiAgXCIxXCIsXG4gIFwiMlwiLFxuICBcIjNcIixcbiAgXCI0XCIsXG4gIFwiNVwiLFxuICBcIjZcIixcbiAgXCI3XCIsXG4gIFwiOFwiLFxuICBcIjlcIixcbiAgXCJiXCIsXG4gIFwiY1wiLFxuICBcImRcIixcbiAgXCJlXCIsXG4gIFwiZlwiLFxuICBcImdcIixcbiAgXCJoXCIsXG4gIFwiaVwiLFxuICBcImpcIixcbiAgXCJrXCIsXG4gIFwibFwiLFxuICBcIm1cIixcbiAgXCJuXCIsXG4gIFwib1wiLFxuICBcInBcIixcbiAgXCJxXCIsXG4gIFwiclwiLFxuICBcInNcIixcbiAgXCJ0XCIsXG4gIFwidVwiLFxuICBcInZcIixcbiAgXCJ3XCIsXG4gIFwieFwiLFxuICBcInlcIixcbiAgXCJ6XCIsXG4gIFwiK1wiLFxuICBcIi1cIixcbiAgXCIuXCIsXG4gIFwiLFwiLFxuXTtcblxuZXhwb3J0IGNvbnN0IEZPTERFUl9PUFRJT05TID0ge1xuICBBTEw6IFwiYWxsXCIsXG4gIE5PX0ZPTERFUjogXCJuby1mb2xkZXJcIixcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBDQUNIRV9LRVlTID0ge1xuICBJVjogXCJpdlwiLFxuICBWQVVMVDogXCJ2YXVsdFwiLFxuICBDVVJSRU5UX0ZPTERFUl9JRDogXCJjdXJyZW50Rm9sZGVySWRcIixcbiAgU0VORF9UWVBFX0ZJTFRFUjogXCJzZW5kVHlwZUZpbHRlclwiLFxuICBDTElfVkVSU0lPTjogXCJjbGlWZXJzaW9uXCIsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgSVRFTV9UWVBFX1RPX0lDT05fTUFQOiBSZWNvcmQ8SXRlbVR5cGUsIEljb24+ID0ge1xuICBbSXRlbVR5cGUuTE9HSU5dOiBJY29uLkdsb2JlLFxuICBbSXRlbVR5cGUuQ0FSRF06IEljb24uQ3JlZGl0Q2FyZCxcbiAgW0l0ZW1UeXBlLklERU5USVRZXTogSWNvbi5QZXJzb24sXG4gIFtJdGVtVHlwZS5OT1RFXTogSWNvbi5Eb2N1bWVudCxcbiAgW0l0ZW1UeXBlLlNTSF9LRVldOiBJY29uLktleSxcbn07XG4iLCAiaW1wb3J0IHsgTG9jYWxTdG9yYWdlIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgcGJrZGYyIH0gZnJvbSBcImNyeXB0b1wiO1xuaW1wb3J0IHsgTE9DQUxfU1RPUkFHRV9LRVkgfSBmcm9tIFwifi9jb25zdGFudHMvZ2VuZXJhbFwiO1xuaW1wb3J0IHsgREVGQVVMVF9QQVNTV09SRF9PUFRJT05TLCBSRVBST01QVF9IQVNIX1NBTFQgfSBmcm9tIFwifi9jb25zdGFudHMvcGFzc3dvcmRzXCI7XG5pbXBvcnQgeyBQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMgfSBmcm9tIFwifi90eXBlcy9wYXNzd29yZHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhc3N3b3JkR2VuZXJhdGluZ0FyZ3Mob3B0aW9uczogUGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zKTogc3RyaW5nW10ge1xuICByZXR1cm4gT2JqZWN0LmVudHJpZXMob3B0aW9ucykuZmxhdE1hcCgoW2FyZywgdmFsdWVdKSA9PiAodmFsdWUgPyBbYC0tJHthcmd9YCwgdmFsdWVdIDogW10pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc2hNYXN0ZXJQYXNzd29yZEZvclJlcHJvbXB0aW5nKHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHBia2RmMihwYXNzd29yZCwgUkVQUk9NUFRfSEFTSF9TQUxULCAxMDAwMDAsIDY0LCBcInNoYTUxMlwiLCAoZXJyb3IsIGhhc2hlZCkgPT4ge1xuICAgICAgaWYgKGVycm9yICE9IG51bGwpIHtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZXNvbHZlKGhhc2hlZC50b1N0cmluZyhcImhleFwiKSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zKCkge1xuICBjb25zdCBzdG9yZWRPcHRpb25zID0gYXdhaXQgTG9jYWxTdG9yYWdlLmdldEl0ZW08c3RyaW5nPihMT0NBTF9TVE9SQUdFX0tFWS5QQVNTV09SRF9PUFRJT05TKTtcbiAgcmV0dXJuIHtcbiAgICAuLi5ERUZBVUxUX1BBU1NXT1JEX09QVElPTlMsXG4gICAgLi4uKHN0b3JlZE9wdGlvbnMgPyBKU09OLnBhcnNlKHN0b3JlZE9wdGlvbnMpIDoge30pLFxuICB9IGFzIFBhc3N3b3JkR2VuZXJhdG9yT3B0aW9ucztcbn1cbiIsICJpbXBvcnQgeyBQYXNzd29yZEdlbmVyYXRvck9wdGlvbnMgfSBmcm9tIFwifi90eXBlcy9wYXNzd29yZHNcIjtcblxuZXhwb3J0IGNvbnN0IFJFUFJPTVBUX0hBU0hfU0FMVCA9IFwiZm9vYmFyYmF6enliYXpcIjtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUEFTU1dPUkRfT1BUSU9OUzogUmVxdWlyZWQ8UGFzc3dvcmRHZW5lcmF0b3JPcHRpb25zPiA9IHtcbiAgbG93ZXJjYXNlOiB0cnVlLFxuICB1cHBlcmNhc2U6IHRydWUsXG4gIG51bWJlcjogZmFsc2UsXG4gIHNwZWNpYWw6IGZhbHNlLFxuICBwYXNzcGhyYXNlOiBmYWxzZSxcbiAgbGVuZ3RoOiBcIjE0XCIsXG4gIHdvcmRzOiBcIjNcIixcbiAgc2VwYXJhdG9yOiBcIi1cIixcbiAgY2FwaXRhbGl6ZTogZmFsc2UsXG4gIGluY2x1ZGVOdW1iZXI6IGZhbHNlLFxuICBtaW5OdW1iZXI6IFwiMVwiLFxuICBtaW5TcGVjaWFsOiBcIjFcIixcbn07XG4iLCAiaW1wb3J0IHsgZW52aXJvbm1lbnQsIGdldFByZWZlcmVuY2VWYWx1ZXMgfSBmcm9tIFwiQHJheWNhc3QvYXBpXCI7XG5pbXBvcnQgeyBWQVVMVF9USU1FT1VUX01TX1RPX0xBQkVMIH0gZnJvbSBcIn4vY29uc3RhbnRzL2xhYmVsc1wiO1xuaW1wb3J0IHsgQ29tbWFuZE5hbWUgfSBmcm9tIFwifi90eXBlcy9nZW5lcmFsXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXJ2ZXJVcmxQcmVmZXJlbmNlKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHsgc2VydmVyVXJsIH0gPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpO1xuICByZXR1cm4gIXNlcnZlclVybCB8fCBzZXJ2ZXJVcmwgPT09IFwiYml0d2FyZGVuLmNvbVwiIHx8IHNlcnZlclVybCA9PT0gXCJodHRwczovL2JpdHdhcmRlbi5jb21cIiA/IHVuZGVmaW5lZCA6IHNlcnZlclVybDtcbn1cblxudHlwZSBQcmVmZXJlbmNlS2V5T2ZDb21tYW5kc1dpdGhUcmFuc2llbnRPcHRpb25zID1cbiAgfCBrZXlvZiBQcmVmZXJlbmNlcy5TZWFyY2hcbiAgfCBrZXlvZiBQcmVmZXJlbmNlcy5HZW5lcmF0ZVBhc3N3b3JkXG4gIHwga2V5b2YgUHJlZmVyZW5jZXMuR2VuZXJhdGVQYXNzd29yZFF1aWNrO1xuXG50eXBlIFRyYW5zaWVudE9wdGlvbnNWYWx1ZSA9XG4gIHwgUHJlZmVyZW5jZXMuU2VhcmNoW1widHJhbnNpZW50Q29weVNlYXJjaFwiXVxuICB8IFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmRbXCJ0cmFuc2llbnRDb3B5R2VuZXJhdGVQYXNzd29yZFwiXVxuICB8IFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmRRdWlja1tcInRyYW5zaWVudENvcHlHZW5lcmF0ZVBhc3N3b3JkUXVpY2tcIl07XG5cbmNvbnN0IENPTU1BTkRfTkFNRV9UT19QUkVGRVJFTkNFX0tFWV9NQVA6IFJlY29yZDxDb21tYW5kTmFtZSwgUHJlZmVyZW5jZUtleU9mQ29tbWFuZHNXaXRoVHJhbnNpZW50T3B0aW9ucz4gPSB7XG4gIHNlYXJjaDogXCJ0cmFuc2llbnRDb3B5U2VhcmNoXCIsXG4gIFwiZ2VuZXJhdGUtcGFzc3dvcmRcIjogXCJ0cmFuc2llbnRDb3B5R2VuZXJhdGVQYXNzd29yZFwiLFxuICBcImdlbmVyYXRlLXBhc3N3b3JkLXF1aWNrXCI6IFwidHJhbnNpZW50Q29weUdlbmVyYXRlUGFzc3dvcmRRdWlja1wiLFxufTtcblxudHlwZSBQcmVmZXJlbmNlcyA9IFByZWZlcmVuY2VzLlNlYXJjaCAmIFByZWZlcmVuY2VzLkdlbmVyYXRlUGFzc3dvcmQgJiBQcmVmZXJlbmNlcy5HZW5lcmF0ZVBhc3N3b3JkUXVpY2s7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2llbnRDb3B5UHJlZmVyZW5jZSh0eXBlOiBcInBhc3N3b3JkXCIgfCBcIm90aGVyXCIpOiBib29sZWFuIHtcbiAgY29uc3QgcHJlZmVyZW5jZUtleSA9IENPTU1BTkRfTkFNRV9UT19QUkVGRVJFTkNFX0tFWV9NQVBbZW52aXJvbm1lbnQuY29tbWFuZE5hbWUgYXMgQ29tbWFuZE5hbWVdO1xuICBjb25zdCB0cmFuc2llbnRQcmVmZXJlbmNlID0gZ2V0UHJlZmVyZW5jZVZhbHVlczxQcmVmZXJlbmNlcz4oKVtwcmVmZXJlbmNlS2V5XSBhcyBUcmFuc2llbnRPcHRpb25zVmFsdWU7XG4gIGlmICh0cmFuc2llbnRQcmVmZXJlbmNlID09PSBcIm5ldmVyXCIpIHJldHVybiBmYWxzZTtcbiAgaWYgKHRyYW5zaWVudFByZWZlcmVuY2UgPT09IFwiYWx3YXlzXCIpIHJldHVybiB0cnVlO1xuICBpZiAodHJhbnNpZW50UHJlZmVyZW5jZSA9PT0gXCJwYXNzd29yZHNcIikgcmV0dXJuIHR5cGUgPT09IFwicGFzc3dvcmRcIjtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMYWJlbEZvclRpbWVvdXRQcmVmZXJlbmNlKHRpbWVvdXQ6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBWQVVMVF9USU1FT1VUX01TX1RPX0xBQkVMW3RpbWVvdXQgYXMga2V5b2YgdHlwZW9mIFZBVUxUX1RJTUVPVVRfTVNfVE9fTEFCRUxdO1xufVxuIiwgImNvbnN0IFZBVUxUX1RJTUVPVVRfT1BUSU9OUyA9IHtcbiAgSU1NRURJQVRFTFk6IFwiMFwiLFxuICBPTkVfTUlOVVRFOiBcIjYwMDAwXCIsXG4gIEZJVkVfTUlOVVRFUzogXCIzMDAwMDBcIixcbiAgRklGVEVFTl9NSU5VVEVTOiBcIjkwMDAwMFwiLFxuICBUSElSVFlfTUlOVVRFUzogXCIxODAwMDAwXCIsXG4gIE9ORV9IT1VSOiBcIjM2MDAwMDBcIixcbiAgRk9VUl9IT1VSUzogXCIxNDQwMDAwMFwiLFxuICBFSUdIVF9IT1VSUzogXCIyODgwMDAwMFwiLFxuICBPTkVfREFZOiBcIjg2NDAwMDAwXCIsXG4gIE5FVkVSOiBcIi0xXCIsXG4gIFNZU1RFTV9MT0NLOiBcIi0yXCIsXG4gIFNZU1RFTV9TTEVFUDogXCItM1wiLFxufSBhcyBjb25zdCBzYXRpc2ZpZXMgUmVjb3JkPHN0cmluZywgUHJlZmVyZW5jZXNbXCJyZXByb21wdElnbm9yZUR1cmF0aW9uXCJdPjtcblxuZXhwb3J0IGNvbnN0IFZBVUxUX1RJTUVPVVQgPSBPYmplY3QuZW50cmllcyhWQVVMVF9USU1FT1VUX09QVElPTlMpLnJlZHVjZSgoYWNjLCBba2V5LCB2YWx1ZV0pID0+IHtcbiAgYWNjW2tleSBhcyBrZXlvZiB0eXBlb2YgVkFVTFRfVElNRU9VVF9PUFRJT05TXSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgcmV0dXJuIGFjYztcbn0sIHt9IGFzIFJlY29yZDxrZXlvZiB0eXBlb2YgVkFVTFRfVElNRU9VVF9PUFRJT05TLCBudW1iZXI+KTtcbiIsICJpbXBvcnQgeyBWQVVMVF9USU1FT1VUIH0gZnJvbSBcIn4vY29uc3RhbnRzL3ByZWZlcmVuY2VzXCI7XG5pbXBvcnQgeyBDYXJkLCBJZGVudGl0eSwgSXRlbVR5cGUgfSBmcm9tIFwifi90eXBlcy92YXVsdFwiO1xuXG5leHBvcnQgY29uc3QgVkFVTFRfVElNRU9VVF9NU19UT19MQUJFTDogUGFydGlhbDxSZWNvcmQ8a2V5b2YgdHlwZW9mIFZBVUxUX1RJTUVPVVQsIHN0cmluZz4+ID0ge1xuICBbVkFVTFRfVElNRU9VVC5JTU1FRElBVEVMWV06IFwiSW1tZWRpYXRlbHlcIixcbiAgW1ZBVUxUX1RJTUVPVVQuT05FX01JTlVURV06IFwiMSBNaW51dGVcIixcbiAgW1ZBVUxUX1RJTUVPVVQuRklWRV9NSU5VVEVTXTogXCI1IE1pbnV0ZXNcIixcbiAgW1ZBVUxUX1RJTUVPVVQuRklGVEVFTl9NSU5VVEVTXTogXCIxNSBNaW51dGVzXCIsXG4gIFtWQVVMVF9USU1FT1VULlRISVJUWV9NSU5VVEVTXTogXCIzMCBNaW51dGVzXCIsXG4gIFtWQVVMVF9USU1FT1VULk9ORV9IT1VSXTogXCIxIEhvdXJcIixcbiAgW1ZBVUxUX1RJTUVPVVQuRk9VUl9IT1VSU106IFwiNCBIb3Vyc1wiLFxuICBbVkFVTFRfVElNRU9VVC5FSUdIVF9IT1VSU106IFwiOCBIb3Vyc1wiLFxuICBbVkFVTFRfVElNRU9VVC5PTkVfREFZXTogXCIxIERheVwiLFxufTtcblxuZXhwb3J0IGNvbnN0IENBUkRfS0VZX0xBQkVMOiBSZWNvcmQ8a2V5b2YgQ2FyZCwgc3RyaW5nPiA9IHtcbiAgY2FyZGhvbGRlck5hbWU6IFwiQ2FyZGhvbGRlciBuYW1lXCIsXG4gIGJyYW5kOiBcIkJyYW5kXCIsXG4gIG51bWJlcjogXCJOdW1iZXJcIixcbiAgZXhwTW9udGg6IFwiRXhwaXJhdGlvbiBtb250aFwiLFxuICBleHBZZWFyOiBcIkV4cGlyYXRpb24geWVhclwiLFxuICBjb2RlOiBcIlNlY3VyaXR5IGNvZGUgKENWVilcIixcbn07XG5cbmV4cG9ydCBjb25zdCBJREVOVElUWV9LRVlfTEFCRUw6IFJlY29yZDxrZXlvZiBJZGVudGl0eSwgc3RyaW5nPiA9IHtcbiAgdGl0bGU6IFwiVGl0bGVcIixcbiAgZmlyc3ROYW1lOiBcIkZpcnN0IG5hbWVcIixcbiAgbWlkZGxlTmFtZTogXCJNaWRkbGUgbmFtZVwiLFxuICBsYXN0TmFtZTogXCJMYXN0IG5hbWVcIixcbiAgdXNlcm5hbWU6IFwiVXNlcm5hbWVcIixcbiAgY29tcGFueTogXCJDb21wYW55XCIsXG4gIHNzbjogXCJTb2NpYWwgU2VjdXJpdHkgbnVtYmVyXCIsXG4gIHBhc3Nwb3J0TnVtYmVyOiBcIlBhc3Nwb3J0IG51bWJlclwiLFxuICBsaWNlbnNlTnVtYmVyOiBcIkxpY2Vuc2UgbnVtYmVyXCIsXG4gIGVtYWlsOiBcIkVtYWlsXCIsXG4gIHBob25lOiBcIlBob25lXCIsXG4gIGFkZHJlc3MxOiBcIkFkZHJlc3MgMVwiLFxuICBhZGRyZXNzMjogXCJBZGRyZXNzIDJcIixcbiAgYWRkcmVzczM6IFwiQWRkcmVzcyAzXCIsXG4gIGNpdHk6IFwiQ2l0eSAvIFRvd25cIixcbiAgc3RhdGU6IFwiU3RhdGUgLyBQcm92aW5jZVwiLFxuICBwb3N0YWxDb2RlOiBcIlppcCAvIFBvc3RhbCBjb2RlXCIsXG4gIGNvdW50cnk6IFwiQ291bnRyeVwiLFxufTtcblxuZXhwb3J0IGNvbnN0IElURU1fVFlQRV9UT19MQUJFTDogUmVjb3JkPEl0ZW1UeXBlLCBzdHJpbmc+ID0ge1xuICBbSXRlbVR5cGUuTE9HSU5dOiBcIkxvZ2luXCIsXG4gIFtJdGVtVHlwZS5DQVJEXTogXCJDYXJkXCIsXG4gIFtJdGVtVHlwZS5JREVOVElUWV06IFwiSWRlbnRpdHlcIixcbiAgW0l0ZW1UeXBlLk5PVEVdOiBcIlNlY3VyZSBOb3RlXCIsXG4gIFtJdGVtVHlwZS5TU0hfS0VZXTogXCJTU0ggS2V5XCIsXG59O1xuIiwgImV4cG9ydCBjbGFzcyBNYW51YWxseVRocm93bkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5zdGFjayA9IHN0YWNrO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEaXNwbGF5YWJsZUVycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlLCBzdGFjayk7XG4gIH1cbn1cblxuLyogLS0gc3BlY2lmaWMgZXJyb3JzIGJlbG93IC0tICovXG5cbmV4cG9ydCBjbGFzcyBDTElOb3RGb3VuZEVycm9yIGV4dGVuZHMgRGlzcGxheWFibGVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiQml0d2FyZGVuIENMSSBub3QgZm91bmRcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiQ0xJTm90Rm91bmRFcnJvclwiO1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW5zdGFsbGVkQ0xJTm90Rm91bmRFcnJvciBleHRlbmRzIERpc3BsYXlhYmxlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIkJpdHdhcmRlbiBDTEkgbm90IGZvdW5kXCIsIHN0YWNrKTtcbiAgICB0aGlzLm5hbWUgPSBcIkluc3RhbGxlZENMSU5vdEZvdW5kRXJyb3JcIjtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZhaWxlZFRvTG9hZFZhdWx0SXRlbXNFcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJGYWlsZWQgdG8gbG9hZCB2YXVsdCBpdGVtc1wiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJGYWlsZWRUb0xvYWRWYXVsdEl0ZW1zRXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVmF1bHRJc0xvY2tlZEVycm9yIGV4dGVuZHMgRGlzcGxheWFibGVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIlZhdWx0IGlzIGxvY2tlZFwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJWYXVsdElzTG9ja2VkRXJyb3JcIjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTm90TG9nZ2VkSW5FcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIk5vdCBsb2dnZWQgaW5cIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiTm90TG9nZ2VkSW5FcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFbnN1cmVDbGlCaW5FcnJvciBleHRlbmRzIERpc3BsYXlhYmxlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJGYWlsZWQgZG8gZG93bmxvYWQgQml0d2FyZGVuIENMSVwiLCBzdGFjayk7XG4gICAgdGhpcy5uYW1lID0gXCJFbnN1cmVDbGlCaW5FcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcmVtaXVtRmVhdHVyZUVycm9yIGV4dGVuZHMgTWFudWFsbHlUaHJvd25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHN0YWNrPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyBcIlByZW1pdW0gc3RhdHVzIGlzIHJlcXVpcmVkIHRvIHVzZSB0aGlzIGZlYXR1cmVcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiUHJlbWl1bUZlYXR1cmVFcnJvclwiO1xuICB9XG59XG5leHBvcnQgY2xhc3MgU2VuZE5lZWRzUGFzc3dvcmRFcnJvciBleHRlbmRzIE1hbnVhbGx5VGhyb3duRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBzdGFjaz86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gXCJUaGlzIFNlbmQgaGFzIGEgaXMgcHJvdGVjdGVkIGJ5IGEgcGFzc3dvcmRcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiU2VuZE5lZWRzUGFzc3dvcmRFcnJvclwiO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZW5kSW52YWxpZFBhc3N3b3JkRXJyb3IgZXh0ZW5kcyBNYW51YWxseVRocm93bkVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgc3RhY2s/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IFwiVGhlIHBhc3N3b3JkIHlvdSBlbnRlcmVkIGlzIGludmFsaWRcIiwgc3RhY2spO1xuICAgIHRoaXMubmFtZSA9IFwiU2VuZEludmFsaWRQYXNzd29yZEVycm9yXCI7XG4gIH1cbn1cblxuLyogLS0gZXJyb3IgdXRpbHMgYmVsb3cgLS0gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHRyeUV4ZWM8VD4oZm46ICgpID0+IFQpOiBUIGV4dGVuZHMgdm9pZCA/IFQgOiBUIHwgdW5kZWZpbmVkO1xuZXhwb3J0IGZ1bmN0aW9uIHRyeUV4ZWM8VCwgRj4oZm46ICgpID0+IFQsIGZhbGxiYWNrVmFsdWU6IEYpOiBUIHwgRjtcbmV4cG9ydCBmdW5jdGlvbiB0cnlFeGVjPFQsIEY+KGZuOiAoKSA9PiBULCBmYWxsYmFja1ZhbHVlPzogRik6IFQgfCBGIHwgdW5kZWZpbmVkIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZm4oKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbGxiYWNrVmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERpc3BsYXlhYmxlRXJyb3JNZXNzYWdlKGVycm9yOiBhbnkpIHtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgRGlzcGxheWFibGVFcnJvcikgcmV0dXJuIGVycm9yLm1lc3NhZ2U7XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBjb25zdCBnZXRFcnJvclN0cmluZyA9IChlcnJvcjogYW55KTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgaWYgKCFlcnJvcikgcmV0dXJuIHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBlcnJvciA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIGVycm9yO1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgbmFtZSB9ID0gZXJyb3I7XG4gICAgaWYgKGVycm9yLnN0YWNrKSByZXR1cm4gZXJyb3Iuc3RhY2s7XG4gICAgcmV0dXJuIGAke25hbWV9OiAke21lc3NhZ2V9YDtcbiAgfVxuICByZXR1cm4gU3RyaW5nKGVycm9yKTtcbn07XG5cbmV4cG9ydCB0eXBlIFN1Y2Nlc3M8VD4gPSBbVCwgbnVsbF07XG5leHBvcnQgdHlwZSBGYWlsdXJlPEU+ID0gW251bGwsIEVdO1xuZXhwb3J0IHR5cGUgUmVzdWx0PFQsIEUgPSBFcnJvcj4gPSBTdWNjZXNzPFQ+IHwgRmFpbHVyZTxFPjtcblxuZXhwb3J0IGZ1bmN0aW9uIE9rPFQ+KGRhdGE6IFQpOiBTdWNjZXNzPFQ+IHtcbiAgcmV0dXJuIFtkYXRhLCBudWxsXTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBFcnI8RSA9IEVycm9yPihlcnJvcjogRSk6IEZhaWx1cmU8RT4ge1xuICByZXR1cm4gW251bGwsIGVycm9yXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyeUNhdGNoPFQsIEUgPSBFcnJvcj4oZm46ICgpID0+IFQpOiBSZXN1bHQ8VCwgRT47XG5leHBvcnQgZnVuY3Rpb24gdHJ5Q2F0Y2g8VCwgRSA9IEVycm9yPihwcm9taXNlOiBQcm9taXNlPFQ+KTogUHJvbWlzZTxSZXN1bHQ8VCwgRT4+O1xuLyoqXG4gKiBFeGVjdXRlcyBhIGZ1bmN0aW9uIG9yIGEgcHJvbWlzZSBzYWZlbHkgaW5zaWRlIGEgdHJ5L2NhdGNoIGFuZFxuICogcmV0dXJucyBhIGBSZXN1bHRgIChgW2RhdGEsIGVycm9yXWApLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ5Q2F0Y2g8VCwgRSA9IEVycm9yPihmbk9yUHJvbWlzZTogKCgpID0+IFQpIHwgUHJvbWlzZTxUPik6IE1heWJlUHJvbWlzZTxSZXN1bHQ8VCwgRT4+IHtcbiAgaWYgKHR5cGVvZiBmbk9yUHJvbWlzZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBPayhmbk9yUHJvbWlzZSgpKTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICByZXR1cm4gRXJyKGVycm9yKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZuT3JQcm9taXNlLnRoZW4oKGRhdGEpID0+IE9rKGRhdGEpKS5jYXRjaCgoZXJyb3IpID0+IEVycihlcnJvcikpO1xufVxuIiwgImltcG9ydCB7IGV4aXN0c1N5bmMsIG1rZGlyU3luYywgc3RhdFN5bmMsIHVubGlua1N5bmMgfSBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IHJlYWRkaXIsIHVubGluayB9IGZyb20gXCJmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgc3RyZWFtWmlwIGZyb20gXCJub2RlLXN0cmVhbS16aXBcIjtcbmltcG9ydCB7IHRyeUV4ZWMgfSBmcm9tIFwifi91dGlscy9lcnJvcnNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JGaWxlQXZhaWxhYmxlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgaWYgKCFleGlzdHNTeW5jKHBhdGgpKSByZXR1cm47XG4gICAgICBjb25zdCBzdGF0cyA9IHN0YXRTeW5jKHBhdGgpO1xuICAgICAgaWYgKHN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSwgMzAwKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICByZWplY3QobmV3IEVycm9yKGBGaWxlICR7cGF0aH0gbm90IGZvdW5kLmApKTtcbiAgICB9LCA1MDAwKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNvbXByZXNzRmlsZShmaWxlUGF0aDogc3RyaW5nLCB0YXJnZXRQYXRoOiBzdHJpbmcpIHtcbiAgY29uc3QgemlwID0gbmV3IHN0cmVhbVppcC5hc3luYyh7IGZpbGU6IGZpbGVQYXRoIH0pO1xuICBpZiAoIWV4aXN0c1N5bmModGFyZ2V0UGF0aCkpIG1rZGlyU3luYyh0YXJnZXRQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgYXdhaXQgemlwLmV4dHJhY3QobnVsbCwgdGFyZ2V0UGF0aCk7XG4gIGF3YWl0IHppcC5jbG9zZSgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlRmlsZXNUaGF0U3RhcnRXaXRoKHN0YXJ0aW5nV2l0aDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpIHtcbiAgbGV0IHJlbW92ZWRBdExlYXN0T25lID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCByZWFkZGlyKHBhdGgpO1xuICAgIGZvciBhd2FpdCAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgaWYgKCFmaWxlLnN0YXJ0c1dpdGgoc3RhcnRpbmdXaXRoKSkgY29udGludWU7XG4gICAgICBhd2FpdCB0cnlFeGVjKGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdW5saW5rKGpvaW4ocGF0aCwgZmlsZSkpO1xuICAgICAgICByZW1vdmVkQXRMZWFzdE9uZSA9IHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcmVtb3ZlZEF0TGVhc3RPbmU7XG59XG5leHBvcnQgZnVuY3Rpb24gdW5saW5rQWxsU3luYyguLi5wYXRoczogc3RyaW5nW10pIHtcbiAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgdHJ5RXhlYygoKSA9PiB1bmxpbmtTeW5jKHBhdGgpKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IGNyZWF0ZVdyaXRlU3RyZWFtLCB1bmxpbmsgfSBmcm9tIFwiZnNcIjtcbmltcG9ydCBodHRwIGZyb20gXCJodHRwXCI7XG5pbXBvcnQgaHR0cHMgZnJvbSBcImh0dHBzXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIH0gZnJvbSBcIn4vdXRpbHMvZGV2ZWxvcG1lbnRcIjtcbmltcG9ydCB7IGdldEZpbGVTaGEyNTYgfSBmcm9tIFwifi91dGlscy9jcnlwdG9cIjtcbmltcG9ydCB7IHdhaXRGb3JGaWxlQXZhaWxhYmxlIH0gZnJvbSBcIn4vdXRpbHMvZnNcIjtcblxudHlwZSBEb3dubG9hZE9wdGlvbnMgPSB7XG4gIG9uUHJvZ3Jlc3M/OiAocGVyY2VudDogbnVtYmVyKSA9PiB2b2lkO1xuICBzaGEyNTY/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZG93bmxvYWQodXJsOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgb3B0aW9ucz86IERvd25sb2FkT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IG9uUHJvZ3Jlc3MsIHNoYTI1NiB9ID0gb3B0aW9ucyA/PyB7fTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHVyaSA9IG5ldyBVUkwodXJsKTtcbiAgICBjb25zdCBwcm90b2NvbCA9IHVyaS5wcm90b2NvbCA9PT0gXCJodHRwczpcIiA/IGh0dHBzIDogaHR0cDtcblxuICAgIGxldCByZWRpcmVjdENvdW50ID0gMDtcbiAgICBjb25zdCByZXF1ZXN0ID0gcHJvdG9jb2wuZ2V0KHVyaS5ocmVmLCAocmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPj0gMzAwICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPCA0MDApIHtcbiAgICAgICAgcmVxdWVzdC5kZXN0cm95KCk7XG4gICAgICAgIHJlc3BvbnNlLmRlc3Ryb3koKTtcblxuICAgICAgICBjb25zdCByZWRpcmVjdFVybCA9IHJlc3BvbnNlLmhlYWRlcnMubG9jYXRpb247XG4gICAgICAgIGlmICghcmVkaXJlY3RVcmwpIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBSZWRpcmVjdCByZXNwb25zZSB3aXRob3V0IGxvY2F0aW9uIGhlYWRlcmApKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKytyZWRpcmVjdENvdW50ID49IDEwKSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlRvbyBtYW55IHJlZGlyZWN0c1wiKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZG93bmxvYWQocmVkaXJlY3RVcmwsIHBhdGgsIG9wdGlvbnMpLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFJlc3BvbnNlIHN0YXR1cyAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9OiAke3Jlc3BvbnNlLnN0YXR1c01lc3NhZ2V9YCkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpbGVTaXplID0gcGFyc2VJbnQocmVzcG9uc2UuaGVhZGVyc1tcImNvbnRlbnQtbGVuZ3RoXCJdIHx8IFwiMFwiLCAxMCk7XG4gICAgICBpZiAoZmlsZVNpemUgPT09IDApIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkludmFsaWQgZmlsZSBzaXplXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBmaWxlU3RyZWFtID0gY3JlYXRlV3JpdGVTdHJlYW0ocGF0aCwgeyBhdXRvQ2xvc2U6IHRydWUgfSk7XG4gICAgICBsZXQgZG93bmxvYWRlZEJ5dGVzID0gMDtcblxuICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHtcbiAgICAgICAgcmVxdWVzdC5kZXN0cm95KCk7XG4gICAgICAgIHJlc3BvbnNlLmRlc3Ryb3koKTtcbiAgICAgICAgZmlsZVN0cmVhbS5jbG9zZSgpO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgY2xlYW51cEFuZFJlamVjdCA9IChlcnJvcj86IEVycm9yKSA9PiB7XG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH07XG5cbiAgICAgIHJlc3BvbnNlLm9uKFwiZGF0YVwiLCAoY2h1bmspID0+IHtcbiAgICAgICAgZG93bmxvYWRlZEJ5dGVzICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcGVyY2VudCA9IE1hdGguZmxvb3IoKGRvd25sb2FkZWRCeXRlcyAvIGZpbGVTaXplKSAqIDEwMCk7XG4gICAgICAgIG9uUHJvZ3Jlc3M/LihwZXJjZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICBmaWxlU3RyZWFtLm9uKFwiZmluaXNoXCIsIGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCB3YWl0Rm9yRmlsZUF2YWlsYWJsZShwYXRoKTtcbiAgICAgICAgICBpZiAoc2hhMjU2KSBhd2FpdCB3YWl0Rm9ySGFzaFRvTWF0Y2gocGF0aCwgc2hhMjU2KTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBmaWxlU3RyZWFtLm9uKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XG4gICAgICAgIGNhcHR1cmVFeGNlcHRpb24oYEZpbGUgc3RyZWFtIGVycm9yIHdoaWxlIGRvd25sb2FkaW5nICR7dXJsfWAsIGVycm9yKTtcbiAgICAgICAgdW5saW5rKHBhdGgsICgpID0+IGNsZWFudXBBbmRSZWplY3QoZXJyb3IpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXNwb25zZS5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKGBSZXNwb25zZSBlcnJvciB3aGlsZSBkb3dubG9hZGluZyAke3VybH1gLCBlcnJvcik7XG4gICAgICAgIHVubGluayhwYXRoLCAoKSA9PiBjbGVhbnVwQW5kUmVqZWN0KGVycm9yKSk7XG4gICAgICB9KTtcblxuICAgICAgcmVxdWVzdC5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICBjYXB0dXJlRXhjZXB0aW9uKGBSZXF1ZXN0IGVycm9yIHdoaWxlIGRvd25sb2FkaW5nICR7dXJsfWAsIGVycm9yKTtcbiAgICAgICAgdW5saW5rKHBhdGgsICgpID0+IGNsZWFudXBBbmRSZWplY3QoZXJyb3IpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXNwb25zZS5waXBlKGZpbGVTdHJlYW0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gd2FpdEZvckhhc2hUb01hdGNoKHBhdGg6IHN0cmluZywgc2hhMjU2OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBmaWxlU2hhID0gZ2V0RmlsZVNoYTI1NihwYXRoKTtcbiAgICBpZiAoIWZpbGVTaGEpIHJldHVybiByZWplY3QobmV3IEVycm9yKGBDb3VsZCBub3QgZ2VuZXJhdGUgaGFzaCBmb3IgZmlsZSAke3BhdGh9LmApKTtcbiAgICBpZiAoZmlsZVNoYSA9PT0gc2hhMjU2KSByZXR1cm4gcmVzb2x2ZSgpO1xuXG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAoZ2V0RmlsZVNoYTI1NihwYXRoKSA9PT0gc2hhMjU2KSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSwgMTAwMCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcihgSGFzaCBkaWQgbm90IG1hdGNoLCBleHBlY3RlZCAke3NoYTI1Ni5zdWJzdHJpbmcoMCwgNyl9LCBnb3QgJHtmaWxlU2hhLnN1YnN0cmluZygwLCA3KX0uYCkpO1xuICAgIH0sIDUwMDApO1xuICB9KTtcbn1cbiIsICJpbXBvcnQgeyBlbnZpcm9ubWVudCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IGdldEVycm9yU3RyaW5nIH0gZnJvbSBcIn4vdXRpbHMvZXJyb3JzXCI7XG5pbXBvcnQgeyBjYXB0dXJlRXhjZXB0aW9uIGFzIGNhcHR1cmVFeGNlcHRpb25SYXljYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuXG50eXBlIExvZyA9IHtcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBlcnJvcjogYW55O1xufTtcblxuY29uc3QgX2V4Y2VwdGlvbnMgPSB7XG4gIGxvZ3M6IG5ldyBNYXA8RGF0ZSwgTG9nPigpLFxuICBzZXQ6IChtZXNzYWdlOiBzdHJpbmcsIGVycm9yPzogYW55KTogdm9pZCA9PiB7XG4gICAgY2FwdHVyZWRFeGNlcHRpb25zLmxvZ3Muc2V0KG5ldyBEYXRlKCksIHsgbWVzc2FnZSwgZXJyb3IgfSk7XG4gIH0sXG4gIGNsZWFyOiAoKTogdm9pZCA9PiBjYXB0dXJlZEV4Y2VwdGlvbnMubG9ncy5jbGVhcigpLFxuICB0b1N0cmluZzogKCk6IHN0cmluZyA9PiB7XG4gICAgbGV0IHN0ciA9IFwiXCI7XG4gICAgY2FwdHVyZWRFeGNlcHRpb25zLmxvZ3MuZm9yRWFjaCgobG9nLCBkYXRlKSA9PiB7XG4gICAgICBpZiAoc3RyLmxlbmd0aCA+IDApIHN0ciArPSBcIlxcblxcblwiO1xuICAgICAgc3RyICs9IGBbJHtkYXRlLnRvSVNPU3RyaW5nKCl9XSAke2xvZy5tZXNzYWdlfWA7XG4gICAgICBpZiAobG9nLmVycm9yKSBzdHIgKz0gYDogJHtnZXRFcnJvclN0cmluZyhsb2cuZXJyb3IpfWA7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3RyO1xuICB9LFxufTtcblxuZXhwb3J0IGNvbnN0IGNhcHR1cmVkRXhjZXB0aW9ucyA9IE9iamVjdC5mcmVlemUoX2V4Y2VwdGlvbnMpO1xuXG50eXBlIENhcHR1cmVFeGNlcHRpb25PcHRpb25zID0ge1xuICBjYXB0dXJlVG9SYXljYXN0PzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCBjb25zdCBjYXB0dXJlRXhjZXB0aW9uID0gKFxuICBkZXNjcmlwdGlvbjogc3RyaW5nIHwgRmFsc3kgfCAoc3RyaW5nIHwgRmFsc3kpW10sXG4gIGVycm9yOiBhbnksXG4gIG9wdGlvbnM/OiBDYXB0dXJlRXhjZXB0aW9uT3B0aW9uc1xuKSA9PiB7XG4gIGNvbnN0IHsgY2FwdHVyZVRvUmF5Y2FzdCA9IGZhbHNlIH0gPSBvcHRpb25zID8/IHt9O1xuICBjb25zdCBkZXNjID0gQXJyYXkuaXNBcnJheShkZXNjcmlwdGlvbikgPyBkZXNjcmlwdGlvbi5maWx0ZXIoQm9vbGVhbikuam9pbihcIiBcIikgOiBkZXNjcmlwdGlvbiB8fCBcIkNhcHR1cmVkIGV4Y2VwdGlvblwiO1xuICBjYXB0dXJlZEV4Y2VwdGlvbnMuc2V0KGRlc2MsIGVycm9yKTtcbiAgaWYgKGVudmlyb25tZW50LmlzRGV2ZWxvcG1lbnQpIHtcbiAgICBjb25zb2xlLmVycm9yKGRlc2MsIGVycm9yKTtcbiAgfSBlbHNlIGlmIChjYXB0dXJlVG9SYXljYXN0KSB7XG4gICAgY2FwdHVyZUV4Y2VwdGlvblJheWNhc3QoZXJyb3IpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZGVidWdMb2cgPSAoLi4uYXJnczogYW55W10pID0+IHtcbiAgaWYgKCFlbnZpcm9ubWVudC5pc0RldmVsb3BtZW50KSByZXR1cm47XG4gIGNvbnNvbGUuZGVidWcoLi4uYXJncyk7XG59O1xuIiwgImltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gXCJjcnlwdG9cIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVTaGEyNTYoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICB0cnkge1xuICAgIHJldHVybiBjcmVhdGVIYXNoKFwic2hhMjU2XCIpLnVwZGF0ZShyZWFkRmlsZVN5bmMoZmlsZVBhdGgpKS5kaWdlc3QoXCJoZXhcIik7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBTZW5kQ3JlYXRlUGF5bG9hZCB9IGZyb20gXCJ+L3R5cGVzL3NlbmRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVTZW5kUGF5bG9hZCh0ZW1wbGF0ZTogU2VuZENyZWF0ZVBheWxvYWQsIHZhbHVlczogU2VuZENyZWF0ZVBheWxvYWQpOiBTZW5kQ3JlYXRlUGF5bG9hZCB7XG4gIHJldHVybiB7XG4gICAgLi4udGVtcGxhdGUsXG4gICAgLi4udmFsdWVzLFxuICAgIGZpbGU6IHZhbHVlcy5maWxlID8geyAuLi50ZW1wbGF0ZS5maWxlLCAuLi52YWx1ZXMuZmlsZSB9IDogdGVtcGxhdGUuZmlsZSxcbiAgICB0ZXh0OiB2YWx1ZXMudGV4dCA/IHsgLi4udGVtcGxhdGUudGV4dCwgLi4udmFsdWVzLnRleHQgfSA6IHRlbXBsYXRlLnRleHQsXG4gIH07XG59XG4iLCAiaW1wb3J0IHsgQ2FjaGUgYXMgUmF5Y2FzdENhY2hlIH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuXG5leHBvcnQgY29uc3QgQ2FjaGUgPSBuZXcgUmF5Y2FzdENhY2hlKHsgbmFtZXNwYWNlOiBcImJ3LWNhY2hlXCIgfSk7XG4iLCAiZXhwb3J0IGNvbnN0IHBsYXRmb3JtID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJkYXJ3aW5cIiA/IFwibWFjb3NcIiA6IFwid2luZG93c1wiO1xuIiwgImltcG9ydCB7IFRvYXN0LCBnZXRQcmVmZXJlbmNlVmFsdWVzLCBwb3BUb1Jvb3QsIHNob3dIVUQsIHNob3dUb2FzdCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IGNhcGl0YWxpemUgfSBmcm9tIFwifi91dGlscy9zdHJpbmdzXCI7XG5cbi8qKiBEaXNwbGF5cyBhIEhVRCBvciBUb2FzdCBhbmQgY2xvc2VzIHRoZSB3aW5kb3cgb3Igbm90LCBkZXBlbmRpbmcgb24gdGhlIHByZWZlcmVuY2VzLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNob3dDb3B5U3VjY2Vzc01lc3NhZ2UodGl0bGU6IHN0cmluZywgbWVzc2FnZT86IHN0cmluZykge1xuICBjb25zdCBhY3Rpb24gPSBnZXRQcmVmZXJlbmNlVmFsdWVzPFByZWZlcmVuY2VzPigpLndpbmRvd0FjdGlvbk9uQ29weTtcbiAgY29uc3QgbWVzc2FnZVRpdGxlID0gY2FwaXRhbGl6ZSh0aXRsZSwgdHJ1ZSk7XG5cbiAgaWYgKGFjdGlvbiA9PT0gXCJrZWVwT3BlblwiKSB7XG4gICAgYXdhaXQgc2hvd1RvYXN0KHsgdGl0bGU6IG1lc3NhZ2VUaXRsZSwgbWVzc2FnZSwgc3R5bGU6IFRvYXN0LlN0eWxlLlN1Y2Nlc3MgfSk7XG4gIH0gZWxzZSBpZiAoYWN0aW9uID09PSBcImNsb3NlQW5kUG9wVG9Sb290XCIpIHtcbiAgICBhd2FpdCBzaG93SFVEKG1lc3NhZ2VUaXRsZSk7XG4gICAgYXdhaXQgcG9wVG9Sb290KCk7XG4gIH0gZWxzZSB7XG4gICAgYXdhaXQgc2hvd0hVRChtZXNzYWdlVGl0bGUpO1xuICB9XG59XG4iLCAiZXhwb3J0IGNvbnN0IGNhcGl0YWxpemUgPSAodmFsdWU6IHN0cmluZywgbG93ZXJjYXNlUmVzdCA9IGZhbHNlKSA9PiB7XG4gIGNvbnN0IGZpcnN0TGV0dGVyID0gdmFsdWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCk7XG4gIGNvbnN0IHJlc3QgPSBsb3dlcmNhc2VSZXN0ID8gdmFsdWUuc2xpY2UoMSkudG9Mb3dlckNhc2UoKSA6IHZhbHVlLnNsaWNlKDEpO1xuXG4gIHJldHVybiBmaXJzdExldHRlciArIHJlc3Q7XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQSxrQ0FBQUEsVUFBQUMsU0FBQTtBQUFBLElBQUFBLFFBQU8sVUFBVTtBQUNqQixVQUFNLE9BQU87QUFFYixRQUFJLEtBQUssUUFBUSxJQUFJO0FB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QVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBO0FBQUEsTUFHUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBO0FBQUEsTUFHUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsYUFBYTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLGdCQUFnQjtBQUFBO0FBQUEsTUFHaEIsV0FBVztBQUFBO0FBQUEsTUFDWCxXQUFXO0FBQUE7QUFBQSxNQUNYLGdCQUFnQjtBQUFBLE1BQ2hCLFdBQVc7QUFBQTtBQUFBO0FBQUEsTUFHWCxVQUFVO0FBQUE7QUFBQSxNQUNWLFVBQVU7QUFBQTtBQUFBLE1BQ1YsZUFBZTtBQUFBLE1BQ2YsVUFBVTtBQUFBO0FBQUEsTUFDVixVQUFVO0FBQUE7QUFBQSxNQUNWLFVBQVU7QUFBQSxNQUNWLFVBQVU7QUFBQTtBQUFBLE1BR1YsUUFBUTtBQUFBO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUNSLFVBQVU7QUFBQTtBQUFBLE1BQ1YsVUFBVTtBQUFBO0FBQUEsTUFDVixV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LFVBQVM7QUFBQSxFQUFNO0FBQUEsRUFFZjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLElBQ1QsUUFBTztBQUFBLEVBQUk7QUFBQSxFQUVYO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBTztBQUFBLEVBRWhCO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBTTtBQUFBLEVBRWY7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFNO0FBQUEsRUFFZjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQU87QUFBQSxFQUVoQjtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLElBQ1QsUUFBTztBQUFBLEVBQUk7QUFBQSxFQUVYO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsSUFDVCxRQUFPO0FBQUEsRUFBSTtBQUFBLEVBRVg7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFLO0FBQUEsRUFFZDtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQUs7QUFBQSxFQUVkO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFLO0FBQUEsRUFFZDtBQUFBLElBQ0EsTUFBSztBQUFBLElBQ0wsUUFBTztBQUFBLElBQ1AsUUFBTztBQUFBLElBQ1AsYUFBWTtBQUFBLElBQ1osVUFBUztBQUFBLEVBQUs7QUFBQSxFQUVkO0FBQUEsSUFDQSxNQUFLO0FBQUEsSUFDTCxRQUFPO0FBQUEsSUFDUCxRQUFPO0FBQUEsSUFDUCxhQUFZO0FBQUEsSUFDWixVQUFTO0FBQUEsRUFBSztBQUFBLEVBRWQ7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFTO0FBQUEsRUFFbEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFBQSxJQUNQLGFBQVk7QUFBQSxJQUNaLFVBQVM7QUFBQSxFQUFPO0FBQUEsRUFFaEI7QUFBQSxJQUNBLE1BQUs7QUFBQSxJQUNMLFFBQU87QUFBQSxJQUNQLFFBQU87QUFB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VUFBTSxRQUFRLDJCQUEyQixFQUFFLFFBQVE7QUFBQSxFQUNyRCxTQUFTLE9BQU87QUFDZCxVQUFNLFFBQVEsa0JBQU0sTUFBTTtBQUMxQixVQUFNLFVBQVU7QUFDaEIscUJBQWlCLCtCQUErQixLQUFLO0FBQUEsRUFDdkQ7QUFDRjtBQUVBLElBQU8sa0NBQVE7IiwKICAibmFtZXMiOiBbImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aEtleSIsICJlbnZpcm9ubWVudCIsICJwbGF0Zm9ybSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgInBhdGgiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicGF0aCIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwcm9jZXNzIiwgInVubG9hZCIsICJlbWl0IiwgImxvYWQiLCAicHJvY2Vzc1JlYWxseUV4aXQiLCAicHJvY2Vzc0VtaXQiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZ2V0U3RyZWFtIiwgInN0cmVhbSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJwYXRoIiwgIm9wZW4iLCAiZXJyIiwgImVudHJ5IiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X2FwaSIsICJpbXBvcnRfbm9kZV9wYXRoIiwgImltcG9ydF9ub2RlX3Byb2Nlc3MiLCAicGxhdGZvcm0iLCAicHJvY2VzcyIsICJ1cmwiLCAicGF0aCIsICJvbmV0aW1lIiwgImltcG9ydF9ub2RlX29zIiwgImltcG9ydF9ub2RlX29zIiwgIm9zIiwgIm9uRXhpdCIsICJtZXJnZVN0cmVhbSIsICJnZXRTdHJlYW0iLCAicHJvY2VzcyIsICJjcm9zc1NwYXduIiwgInBhdGgiLCAiY2hpbGRQcm9jZXNzIiwgImltcG9ydF9mcyIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9hcGkiLCAiaW1wb3J0X3BhdGgiLCAiaW1wb3J0X3Byb21pc2VzIiwgInBhdGgiLCAic3RyZWFtWmlwIiwgImltcG9ydF9mcyIsICJpbXBvcnRfYXBpIiwgImltcG9ydF9hcGkiLCAiY2FwdHVyZUV4Y2VwdGlvblJheWNhc3QiLCAiaW1wb3J0X2ZzIiwgInVybCIsICJwYXRoIiwgImh0dHBzIiwgImh0dHAiLCAiaW1wb3J0X2FwaSIsICJSYXljYXN0Q2FjaGUiLCAidXJsIiwgImltcG9ydF9hcGkiXQp9Cg==
