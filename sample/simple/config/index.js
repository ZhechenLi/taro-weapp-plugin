const outputRoot = process.env.BUILD_TYPE === 'weapp-plugin' ? 'weapp-plugin/plugin' : 'dist';

const config = {
  projectName: 'simple',
  date: '2018-11-22',
  designWidth: 750,
  deviceRatio: {
    '640': 2.34 / 2,
    '750': 1,
    '828': 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: {
    babel: {
      sourceMap: true,
      presets: [
        'env'
      ],
      plugins: [
        'transform-class-properties',
        'transform-decorators-legacy',
        'transform-object-rest-spread',
        (babel)=>{

          return {
            visitor: {
              Identifier(path, state){
                if(path.node.name === 'regeneratorRuntime'){
                  if(path.parent.property === path.node){
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
    patterns: [],
    options: {}
  },
  weapp: {
    module: {
      postcss: {
        autoprefixer: {
          enable: true,
          config: {
            browsers: [
              'last 3 versions',
              'Android >= 4.1',
              'ios >= 8'
            ]
          }
        },
        pxtransform: {
          enable: true,
          config: {}
        },
        url: {
          enable: true,
          config: {
            limit: 10240 // 设定转换尺寸上限
          }
        }
      }
    }

  },
};

module.exports = function(merge){
  if(process.env.NODE_ENV === 'development'){
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
