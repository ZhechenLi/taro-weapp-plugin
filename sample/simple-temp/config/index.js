const config = {
  projectName: 'sample',
  date: '2018-11-12',
  designWidth: 750,
  deviceRatio: {
    '640': 2.34 / 2,
    '750': 1,
    '828': 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'temp',
  plugins: {
    babel: {
      sourceMap: true,
      presets: ['env'],
      plugins: [
        'transform-class-properties',
        'transform-decorators-legacy',
        'transform-object-rest-spread',
        babel => {
          const t = babel.types;
          return {
            visitor: {
              Identifier(path, state) {
                if (path.node.name === 'regeneratorRuntime') {
                  if (path.parent.property === path.node) {
                    return;
                  }

                  path.replaceWith(
                    t.memberExpression(t.identifier('global'), path.node)
                  );
                }
              }
            }
          };
        }
      ]
    }
  },
  defineConstants: {},
  copy: {
    patterns: []
  },
  weapp: {},
  weappPlugin: {
    // debugTaro: true,
    miniprogramRoot: 'src/assets/demo',
    docRoot: 'src/assets/doc',
    mainRoot: 'src/index',
    compile: {
      main: true
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    module: {
      postcss: {
        autoprefixer: {
          enable: true
        }
      }
    }
  }
};

module.exports = function(merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
