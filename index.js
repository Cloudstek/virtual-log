'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ansiEscapes = require('ansi-escapes');
var cliCursor = require('cli-cursor');
var cursorPos = require('get-cursor-position');
var tty = require('tty');
var stream = require('stream');
var wrapAnsi = require('wrap-ansi');

var VirtualLog = function () {
    function VirtualLog(stream) {
        var _this = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        (0, _classCallCheck3.default)(this, VirtualLog);

        _initialiseProps.call(this);

        this.stream = stream;
        this.options = (0, _assign2.default)({}, {
            minLines: 1,
            wordWrap: true,
            hardWrap: false,
            columns: process.stdout.columns || 80,
            clearEnd: false
        }, options);

        if (!this.options.lines) {
            this.options.lines = this.availableLines;
        }

        process.stdout.on('resize', function () {
            _this.options.lines = _this.availableLines;
        });
    }

    (0, _createClass3.default)(VirtualLog, [{
        key: 'pipe',
        value: function pipe(stream) {
            var _this2 = this;

            stream.on('data', function (chunk) {
                _this2.log(chunk);
            });

            stream.on('end', function () {
                _this2.done();
            });

            return this;
        }
    }, {
        key: 'log',
        value: function log(str) {
            cliCursor.hide();

            if (this.lines.length > 0) {
                this.stream.write(ansiEscapes.eraseLines(this.lines.length));
            }

            var out = wrapAnsi(str, this.options.columns, { wordWrap: this.options.wordWrap, hard: this.options.hardWrap });

            this.lines.push(out.split('\n').slice(-this.options.lines));
            this.lines = this.lines.slice(-this.options.lines);
            this.stream.write(this.lines.join('\n'));

            return this;
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.stream.write(ansiEscapes.eraseLines(this.lines.length));
            this.lines = [];

            return this;
        }
    }, {
        key: 'done',
        value: function done() {
            if (this.options.clearEnd === true) {
                this.clear();
            } else {
                this.lines = [];
                this.stream.write('\n');
            }

            cliCursor.show();
        }
    }, {
        key: 'availableLines',
        get: function get() {
            var availableLines = 10;

            if (this.stream instanceof tty.WriteStream) {
                var height = this.stream.rows;
                availableLines = height - cursorPos.sync().row;

                if (availableLines < (this.options.minLines || 1)) {
                    availableLines = this.options.minLines || 1;
                }
            }

            return availableLines;
        }
    }]);
    return VirtualLog;
}();

var _initialiseProps = function _initialiseProps() {
    this.lines = [];
    this.options = {};
};

module.exports = VirtualLog;