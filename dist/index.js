"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var babel = _interopRequireWildcard(require("@babel/core"));

var _traverse = _interopRequireDefault(require("@babel/traverse"));

var _filter = _interopRequireDefault(require("@dword-design/functions/dist/filter"));

var _forEach = _interopRequireDefault(require("@dword-design/functions/dist/for-each"));

var _fromPairs = _interopRequireDefault(require("@dword-design/functions/dist/from-pairs"));

var _keys = _interopRequireDefault(require("@dword-design/functions/dist/keys"));

var _map = _interopRequireDefault(require("@dword-design/functions/dist/map"));

var _omit = _interopRequireDefault(require("@dword-design/functions/dist/omit"));

var _pick = _interopRequireDefault(require("@dword-design/functions/dist/pick"));

var _some = _interopRequireDefault(require("@dword-design/functions/dist/some"));

var _astToLiteral = _interopRequireDefault(require("ast-to-literal"));

var _fsExtra = require("fs-extra");

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const predefinedProperties = {
  computed: true,
  data: true,
  methods: true,
  mixins: true,
  render: true,
  watch: true
};

function _default() {
  const extractMeta = filename => {
    var _Component$script, _data, _predefinedProperties;

    const fileContent = (0, _fsExtra.readFileSync)(filename, 'utf8');
    let data = {};
    const Component = _path.default.extname(filename) === '.vue' ? (() => {
      const vueTemplateCompiler = require('vue-template-compiler');

      return vueTemplateCompiler.parseComponent(fileContent);
    })() : {
      script: {
        content: fileContent,
        lang: 'js'
      }
    };
    const scriptContent = (_Component$script = Component.script) === null || _Component$script === void 0 ? void 0 : _Component$script.content;

    if (scriptContent) {
      if (Component.script.lang === 'ts') {
        const ts = require('typescript');

        const tsAstToLiteral = require('ts-ast-to-literal');

        const rootNode = ts.createSourceFile('x.ts', scriptContent, ts.ScriptTarget.Latest);
        ts.forEachChild(rootNode, node => {
          switch (node.kind) {
            case ts.SyntaxKind.ExportAssignment:
              {
                var _object;

                const object = node.expression.kind === ts.SyntaxKind.CallExpression && (node.expression.expression.kind === ts.SyntaxKind.PropertyAccessExpression && node.expression.expression.expression.escapedText === 'Vue' && node.expression.expression.name.escapedText === 'extend' && node.expression.arguments.length === 1 || node.expression.expression.kind === ts.SyntaxKind.Identifier && node.expression.expression.escapedText === 'defineComponent') ? node.expression.arguments[0] : node.expression;
                data = (_object = object, tsAstToLiteral(_object));
                break;
              }

            case ts.SyntaxKind.ClassDeclaration:
              {
                var _ref, _ref2, _ref3;

                if ((_ref = node.modifiers || [], (0, _some.default)(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)(_ref)) && (_ref2 = node.modifiers || [], (0, _some.default)(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword)(_ref2)) && (_ref3 = node.heritageClauses || [], (0, _some.default)(clause => {
                  var _clause$types;

                  return _clause$types = clause.types, (0, _some.default)(type => type.expression.escapedText === 'Vue')(_clause$types);
                })(_ref3))) {
                  var _ref4, _ref5, _node$members;

                  data = (_ref4 = (_ref5 = (_node$members = node.members, (0, _filter.default)(member => member.initializer !== undefined)(_node$members)), (0, _map.default)(member => {
                    var _member$initializer;

                    return [member.name.escapedText, (_member$initializer = member.initializer, tsAstToLiteral(_member$initializer))];
                  })(_ref5)), (0, _fromPairs.default)(_ref4));
                }

                break;
              }

            default:
          }
        });
      } else {
        var _this$options$build$b;

        const ast = babel.parseSync(scriptContent, {
          filename,
          ...(_this$options$build$b = this.options.build.babel, (0, _pick.default)(['configFile', 'babelrc'])(_this$options$build$b)),
          ...(!this.options.build.babel.configFile && !this.options.build.babel.babelrc && {
            extends: '@nuxt/babel-preset-app'
          })
        });
        (0, _traverse.default)(ast, {
          ExportDefaultDeclaration: path => {
            var _path$node$declaratio;

            data = (_path$node$declaratio = path.node.declaration, (0, _astToLiteral.default)(_path$node$declaratio));
          }
        });
      }
    }

    return { ...(_data = data, (0, _omit.default)(['meta', ...(_predefinedProperties = predefinedProperties, (0, _keys.default)(_predefinedProperties))])(_data)),
      ...data.meta
    };
  };

  this.extendRoutes(routes => (0, _forEach.default)(routes, route => {
    var _route$component;

    return route.meta = (_route$component = route.component, extractMeta(_route$component));
  }));
}

module.exports = exports.default;