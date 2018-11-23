
const config =  {
    "projectName": "simple",
    "date": "2018-11-22",
    "designWidth": 750,
    "deviceRatio": {
        "640": 1.17,
        "750": 1,
        "828": 0.905
    },
    "sourceRoot": "src",
    "outputRoot": "dist/weapp-plugin/plugin",
    "plugins": {
        "babel": {
            "sourceMap": true,
            "presets": [
                "env"
            ],
            "plugins": [
                "transform-class-properties",
                "transform-decorators-legacy",
                "transform-object-rest-spread"
            ]
        }
    },
    "defineConstants": {},
    "copy": {
        "patterns": [],
        "options": {}
    },
    "pluhin": {},
    "weapp": {
        "module": {
            "postcss": {
                "autoprefixer": {
                    "enable": true,
                    "config": {
                        "browsers": [
                            "last 3 versions",
                            "Android >= 4.1",
                            "ios >= 8"
                        ]
                    }
                },
                "pxtransform": {
                    "enable": true,
                    "config": {}
                },
                "url": {
                    "enable": true,
                    "config": {
                        "limit": 10240
                    }
                }
            }
        }
    },
    "env": {
        "NODE_ENV": "\"production\""
    },
    "h5": {}
};

module.exports = function(merge){
  if(process.env.NODE_ENV === 'development'){
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
