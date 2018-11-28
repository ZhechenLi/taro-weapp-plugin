// 因为 taro 在构建非 h5 目标的时候会先清空 dist (写死的)，所以建议普通小程序和小程序插件不要放在一个文件内
const outputMap = {
  'weapp': 'temp/miniprogram',
  'weapp-plugin': 'temp/plugin'
};

const sourceRootMap = {
  'weapp': 'src/miniprogram',
  'weapp-plugin': 'src/plugin'
};

const copyMap = {
  'weapp': {},
  'weapp-plugin': {
    patterns: [
      // 拷贝文档
      { from: 'src/doc', to: 'temp/doc' },
      { from: 'src/miniprogram', to: 'temp/miniprogram' },
      { from: 'src/plugin/index.js', to: 'temp/plugin/index.js' }
    ]
  }
};

const config = {
  'projectName': 'simple',
  'date': '2018-11-22',
  'designWidth': 750,
  'deviceRatio': {
    '640': 1.17,
    '750': 1,
    '828': 0.905
  },
  sourceRoot: sourceRootMap[process.env.TYPE],
  outputRoot: outputMap[process.env.TYPE],
  'plugins': {
    'babel': {
      'sourceMap': true,
      'presets': [
        'env'
      ],
      'plugins': [
        'transform-class-properties',
        'transform-decorators-legacy',
        'transform-object-rest-spread'
      ]
    }
  },
  'defineConstants': {},
  'copy': copyMap[process.env.TYPE],
  'weapp': {
    'module': {
      'postcss': {
        'autoprefixer': {
          'enable': true,
          'config': {
            'browsers': [
              'last 3 versions',
              'Android >= 4.1',
              'ios >= 8'
            ]
          }
        },
        'pxtransform': {
          'enable': true,
          'config': {}
        },
        'url': {
          'enable': true,
          'config': {
            'limit': 10240
          }
        }
      }
    }
  },
  'h5': {},
  env: {
    TYPE: process.env.TYPE
  }
};
module.exports = function(merge) {
  if(process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};

