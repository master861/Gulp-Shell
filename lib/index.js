"use strict";
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const child_process_1 = require("child_process");
const ejs_1 = tslib_1.__importDefault(require("ejs"));
const fancy_log_1 = tslib_1.__importDefault(require("fancy-log"));
const path = tslib_1.__importStar(require("path"));
const plugin_error_1 = tslib_1.__importDefault(require("plugin-error"));
const through2_1 = require("through2");
const PLUGIN_NAME = 'gulp-shell';
const normalizeCommands = (commands) => {
    if (typeof commands === 'string') {
        commands = [commands];
    }
    if (!Array.isArray(commands)) {
        throw new plugin_error_1.default(PLUGIN_NAME, 'Missing commands');
    }
    return commands;
};
const normalizeOptions = (options = {}) => {
    const pathToBin = path.join(process.cwd(), 'node_modules', '.bin');
    /* istanbul ignore next */
    const pathName = process.platform === 'win32' ? 'Path' : 'PATH';
    const newPath = pathToBin + path.delimiter + process.env[pathName];
    const env = {
        ...process.env,
        [pathName]: newPath,
        ...options.env
    };
    return {
        cwd: process.cwd(),
        env,
        shell: true,
        quiet: false,
        verbose: false,
        ignoreErrors: false,
        errorMessage: 'Command `<%= command %>` failed with exit code <%= error.code %>',
        templateData: {},
        ...options
    };
};
const runCommand = (command, options, file) => {
    const context = { file, ...options.templateData };
    command = template(command)(context);
    if (options.verbose) {
        (0, fancy_log_1.default)(`${PLUGIN_NAME}:`, chalk_1.default.cyan(command));
    }
    const child = (0, child_process_1.spawn)(command, {
        env: options.env,
        cwd: template(options.cwd)(context),
        shell: options.shell,
        stdio: options.quiet ? 'ignore' : 'inherit'
    });
    return new Promise((resolve, reject) => {
        child.on('exit', code => {
            if (code === 0 || options.ignoreErrors) {
                return resolve();
            }
            const context = {
                command,
                file,
                error: { code },
                ...options.templateData
            };
            const message = ejs_1.default.compile(options.errorMessage)(context);
            reject(new plugin_error_1.default(PLUGIN_NAME, message));
        });
    });
};
const runCommands = async (commands, options, file) => {
    for (const command of commands) {
        await runCommand(command, options, file);
    }
};
const shell = (commands, options) => {
    const normalizedCommands = normalizeCommands(commands);
    const normalizedOptions = normalizeOptions(options);
    const stream = (0, through2_1.obj)(function (file, _encoding, done) {
        runCommands(normalizedCommands, normalizedOptions, file)
            .then(() => {
            this.push(file);
        })
            .catch(error => {
            this.emit('error', error);
        })
            .finally(done);
    });
    stream.resume();
    return stream;
};
shell.task = (commands, options) => () => runCommands(normalizeCommands(commands), normalizeOptions(options), null);
function template(cwd) {
    const compiled = ejs_1.default.compile(String(cwd));
    return (context) => {
        try {
            const result = compiled(context);
            return result == null ? cwd : String(result);
        }
        catch {
            return cwd;
        }
    };
}
module.exports = shell;
//# sourceMappingURL=index.js.map