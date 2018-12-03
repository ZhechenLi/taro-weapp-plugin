/**
 * Created by tsesamli on 2018/11/29.
 */
import fs from 'fs-extra';
import _ from 'lodash'
import path from 'path'
import buildWeappWithTaro from './build-weapp-with-taro'

export default function ({ watch = false, type = 'weapp-plugin', clean = false } = {}) {

    const config = parseConfig();

    const {
        sourceRoot = '',
        outputRoot = '',
    } = config;

    console.log(sourceRoot, outputRoot)

    if (type === 'weapp-plugin') {
        buildWeappPlugin({
            sourceRoot,
            outputRoot,
            clean
        })
    }


}


/**
 * 从默认路径 cwd/config/index 中获取 config
 */
function parseConfig() {
    return require(path.join(process.cwd(), `./config/index`))(_.merge);
}


/**
 * 
 */
function buildWeappPlugin(config: any) {

    const {
        outputRoot = '',
        sourceRoot = '',
        clean = false,
        miniprogramRoot = ''
    } = config;
    const NAMESPACE = '';
    const cwd = path.join(process.cwd(), outputRoot, NAMESPACE);
    const tempDir = path.join(process.cwd(), outputRoot, '.temp')

    console.log(clean, tempDir)
    if (clean) {
        fs.removeSync(tempDir);
    }

    fs.ensureDirSync(cwd);

    const dir = fs.readdirSync(sourceRoot)
    console.log(dir);




    // 生成.temp 
    dir.filter(e => !e.match(/^project\.config|^config/gm)).forEach(e => {
        fs.ensureSymlinkSync(path.join(sourceRoot, e), path.join(tempDir, e))
    })

    // 生成新的 config 
    fs.outputFileSync(path.join(tempDir, 'config/index.js'), `const config = ${JSON.stringify({ ...parseConfig(), sourceRoot: '/', outputRoot: '../' }, null, 4)}

module.exports = function (merge) {
    return config
}`)

    let projectConfig: any = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'project.config.plugin.json')).toString())

    projectConfig = {
        ...projectConfig,
        compileType: "plugin",
        pluginRoot: 'plugin',
        miniprogramRoot: "miniprogram",
    }
    fs.outputFileSync(path.join(tempDir, 'project.config.json'), JSON.stringify(projectConfig, null, 4))


    buildWeappWithTaro({
        args: ['build', '--type', 'weapp', '--watch'],
        cwd: tempDir
    })
}