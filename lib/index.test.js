"use strict";
/* eslint-env mocha */
/* eslint-disable @typescript-eslint/no-var-requires */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = require("path");
const vinyl_1 = tslib_1.__importDefault(require("vinyl"));
const chai_1 = require("chai");
const shell = require('..');
const expectToBeOk = (stream, done) => {
    stream.on('error', done).on('data', () => {
        done();
    });
};
describe('gulp-shell(commands, options)', () => {
    const fakeFile = new vinyl_1.default({
        cwd: __dirname,
        base: __dirname,
        path: (0, path_1.join)(__dirname, 'test-file')
    });
    it('throws when `commands` is missing', () => {
        (0, chai_1.expect)(shell).to.Throw('Missing commands');
    });
    it('works when `commands` is a string', () => {
        (0, chai_1.expect)(shell.bind(null, 'true')).to.not.throw();
    });
    it('passes file through', () => new Promise(resolve => {
        const stream = shell(['true']);
        stream.on('data', file => {
            (0, chai_1.expect)(file).to.equal(fakeFile);
            resolve();
        });
        stream.write(fakeFile);
    }));
    it('executes command after interpolation', () => new Promise(resolve => {
        const stream = shell([`test <%= file.path %> = ${fakeFile.path}`]);
        expectToFlow(stream, resolve);
        stream.write(fakeFile);
    }));
    it('prepends `./node_modules/.bin` to `PATH`', () => new Promise(resolve => {
        const stream = shell([`echo $PATH | grep -q "${(0, path_1.join)(process.cwd(), 'node_modules/.bin')}"`], { shell: 'bash' });
        expectToFlow(stream, resolve);
        stream.write(fakeFile);
    }));
    describe('.task(commands, options)', () => {
        it('returns a function which returns a promise', () => new Promise(resolve => {
            const task = shell.task(['echo hello world']);
            const promise = task();
            (0, chai_1.expect)(promise).to.be.a('Promise');
            promise.then(resolve);
        }));
    });
    describe('options', () => {
        describe('cwd', () => {
            it('sets the current working directory when `cwd` is a string', () => new Promise(resolve => {
                const stream = shell([`test $PWD = ${(0, path_1.join)(__dirname, '../..')}`], {
                    cwd: '..'
                });
                expectToFlow(stream, resolve);
                stream.write(fakeFile);
            }));
            it('uses the process current working directory when `cwd` is not passed', () => new Promise(resolve => {
                const stream = shell([`test $PWD = ${(0, path_1.join)(__dirname, '..')}`]);
                expectToFlow(stream, resolve);
                stream.write(fakeFile);
            }));
        });
        describe('shell', () => {
            it('changes the shell', () => new Promise(resolve => {
                const stream = shell(['[[ $0 = bash ]]'], { shell: 'bash' });
                expectToFlow(stream, resolve);
                stream.write(fakeFile);
            }));
        });
        describe('quiet', () => {
            it("won't output anything when `quiet` == true", () => new Promise(resolve => {
                const stream = shell(['echo cannot see me!'], { quiet: true });
                expectToFlow(stream, resolve);
                stream.write(fakeFile);
            }));
        });
        describe('verbose', () => {
            it('prints the command', () => new Promise(resolve => {
                const stream = shell(['echo you can see me twice'], {
                    verbose: true
                });
                expectToFlow(stream, resolve);
                stream.write(fakeFile);
            }));
        });
        describe('ignoreErrors', () => {
            it('emits error by default', () => new Promise(resolve => {
                const stream = shell(['false']);
                stream.on('error', error => {
                    (0, chai_1.expect)(error.message).not.to.equal(errorMessage);
                    resolve();
                });
                stream.write(fakeFile);
            }));
            it("won't emit error when `ignoreErrors` == true", () => new Promise((resolve, reject) => {
                const stream = shell(['false'], { ignoreErrors: true });
                stream.on('error', reject);
                stream.on('data', data => {
                    (0, chai_1.expect)(data).toBe(fakeFile);
                    resolve();
                });
                stream.write(fakeFile);
            }));
        });
        describe('errorMessage', () => {
            it('allows for custom messages', () => new Promise(resolve => {
                const errorMessage = 'foo';
                const stream = shell(['false'], { errorMessage });
                stream.on('error', error => {
                    (0, chai_1.expect)(error.message).toBe(errorMessage);
                    resolve();
                });
                stream.write(fakeFile);
            }));
            it('includes the error object in the error context', () => new Promise(resolve => {
                const errorMessage = 'Foo <%= error.code %>';
                const expectedMessage = 'Foo 2';
                const stream = shell(['exit 2'], { errorMessage });
                stream.on('error', error => {
                    (0, chai_1.expect)(error.message).toBe(expectedMessage);
                    resolve();
                });
                stream.write(fakeFile);
            }));
        });
    });
});
//# sourceMappingURL=index.test.js.map