const config = {
    "projectName": "sample",
    "date": "2018-11-12",
    "designWidth": 750,
    "deviceRatio": {
        "640": 1.17,
        "750": 1,
        "828": 0.905
    },
    "sourceRoot": "../src",
    "outputRoot": "../temp/plugin",
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
        "patterns": []
    },
    "weappPlugin": {
        "miniprogramRoot": "src/assets/demo",
        "docRoot": "src/assets/doc"
    },
    "h5": {
        "publicPath": "/",
        "staticDirectory": "static",
        "module": {
            "postcss": {
                "autoprefixer": {
                    "enable": true
                }
            }
        }
    },
    "env": {
        "NODE_ENV": "\"production\""
    },
    "weapp": {}
}

module.exports = function (merge) {
    return config
}