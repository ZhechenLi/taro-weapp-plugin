/**
 * Created by tsesamli on 2018/11/29.
 */
import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';
import buildWeappWithTaro from './build-weapp-with-taro';
import buildPluginJson from './util/build-plugin-json';
import { RootShouldBeDelete } from './util';
import chokidar from 'chokidar';

export default function({
  watch = false,
  type = 'weapp-plugin',
  clean = false
} = {}) {
  const config = parseConfig();

  const {
    sourceRoot = '',
    outputRoot = '',
    weappPlugin: { miniprogramRoot = '', docRoot = '' }
  } = config;

  // console.log(sourceRoot, outputRoot);
  // chokidar
  //   .watch("./temp-weapp-plugin", {
  //     ignored: /(^|[/\\])\../,
  //     persistent: true,
  //     ignoreInitial: true
  //   })
  //   .on("all", (event, PATH) => {
  //     console.log(event, PATH);
  //   })
  //   .on("change", PATH => {
  //     console.log(PATH);
  //   });

  if (outputRoot.match(/dist/)) {
    throw new Error('不要放在 dist');
  }

  if (type === 'weapp-plugin') {
    buildWeappPlugin({
      watch,
      sourceRoot,
      outputRoot,
      clean,
      miniprogramRoot,
      docRoot
    });
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
    watch = false,
    outputRoot = '',
    sourceRoot = '',
    clean = false,
    miniprogramRoot = '',
    docRoot = ''
  } = config;

  const NAMESPACE = '';

  const tempPath = 'temp-weapp-plugin';
  // 输出目录在 cwd，tempDir 用于 link 源文件
  const cwd = path.join(process.cwd(), outputRoot, NAMESPACE);
  const tempDir = path.join(process.cwd(), tempPath);

  if (clean) {
    fs.removeSync(tempDir);
    fs.removeSync(cwd);
  }

  fs.ensureDirSync(cwd);

  const dir = fs.readdirSync(sourceRoot);
  console.log(dir);

  // 生成新的 config
  fs.outputFileSync(
    path.join(tempDir, 'config/index.js'),
    `const config = ${JSON.stringify(
      {
        ...parseConfig(),
        sourceRoot: path.join(
          path.relative(tempPath, process.cwd()),
          sourceRoot
        ),
        outputRoot: path.join('..', outputRoot, 'plugin')
      },
      null,
      4
    )}

module.exports = function (merge) {
    return config
}`
  );

  // 生成 project.config.json
  let projectConfig: any = JSON.parse(
    fs
      .readFileSync(path.join(sourceRoot, 'project.config.plugin.json'))
      .toString()
  );

  projectConfig = {
    ...projectConfig,
    compileType: 'plugin',
    pluginRoot: 'plugin',
    miniprogramRoot: 'miniprogram'
  };
  fs.outputFileSync(
    path.join(cwd, 'project.config.json'),
    JSON.stringify(projectConfig, null, 4)
  );

  // 软链 doc, doc 只能放在根目录
  if (docRoot) {
    fs.symlinkSync(path.join(process.cwd(), docRoot), path.join(cwd, 'doc'));
  }

  // 软链 miniprogram, miniprogram 默认是不编译的，如果需要编译，可以使用
  if (miniprogramRoot) {
    fs.symlinkSync(
      path.join(process.cwd(), miniprogramRoot),
      path.join(cwd, 'miniprogram')
    );
  }

  // 输出 plugin.json
  const pluginConfig = buildPluginJson(
    path.join(process.cwd(), sourceRoot),
    path.join(cwd, 'plugin')
  );

  //  main 存在时软链 main
  if (pluginConfig.main) {
    console.log(
      `生成  main 文件 ${path.join(
        process.cwd(),
        sourceRoot,
        pluginConfig.main
      )} ->  ${path.join(cwd, 'plugin', pluginConfig.main)}`
    );
    fs.symlinkSync(
      path.join(process.cwd(), sourceRoot, pluginConfig.main),
      path.join(cwd, 'plugin', pluginConfig.main)
    );
  }

  // process.exit();

  console.log(tempDir);
  const weappPluginEmitter = buildWeappWithTaro({
    args: ['build', '--type', 'weapp', '--watch'],
    cwd: tempDir,
    dev: true
  });

  // TODO: 清理门户
  // 删除 project.config.json, app.*

  // 子进程退出或 watch mode 下完成第一次构建
  weappPluginEmitter.on('done', () => {
    deleteBasenameStartWithApp(path.join(cwd, 'plugin'));
  });

  if (watch) {
    const sourceWatcher = chokidar.watch(path.join(process.cwd(), sourceRoot), {
      ignored: /(^|[/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    const outputWatcher = chokidar.watch(
      path.join(process.cwd(), path.join(process.cwd(), outputRoot, 'plugin')),
      {
        ignored: /(^|[/\\])\../,
        persistent: true,
        ignoreInitial: true
      }
    );
  }
}

/**
 * 检索 PATH 目录，并删除 PATH 目录下的符合 app.* scheme 的文件
 * 在插件开发中 root/to/plugin/app.* 这些文件的存在可能会导致真机调试异常
 * TODO： 考虑如何迁移写在 app.js 中的逻辑
 * @param {Path} PATH 输出目录下 plugin 的路径
 * */
function deleteBasenameStartWithApp(PATH: string) {
  fs.readdirSync(PATH).forEach(e => {
    const OUTPUT_DELETE_PATH = path.join(PATH, e);
    if (RootShouldBeDelete(OUTPUT_DELETE_PATH, PATH)) {
      console.log(`删除  多余文件  ${OUTPUT_DELETE_PATH}`);
      fs.remove(OUTPUT_DELETE_PATH);
    }
  });
}
