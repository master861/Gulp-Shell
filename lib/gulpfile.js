"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const gulp_1 = tslib_1.__importDefault(require("gulp"));
const index_1 = tslib_1.__importDefault(require("./index"));
const files = ['*.ts', 'test/*.js'];
gulp_1.default.task('build', index_1.default.task('tsc'));
gulp_1.default.task('test', index_1.default.task('mocha'));
gulp_1.default.task('coverage', index_1.default.task('nyc mocha'));
gulp_1.default.task('coveralls', gulp_1.default.series('coverage', index_1.default.task('nyc report --reporter=text-lcov | coveralls')));
gulp_1.default.task('lint', index_1.default.task('eslint ' + files.join(' ')));
gulp_1.default.task('format', index_1.default.task('prettier --write ' + files.join(' ')));
gulp_1.default.task('default', gulp_1.default.series('build', 'coverage', 'lint', 'format'));
gulp_1.default.task('watch', gulp_1.default.series('default', () => {
    gulp_1.default.watch(files, gulp_1.default.task('default'));
}));
//# sourceMappingURL=gulpfile.js.map