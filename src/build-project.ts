/**
 * Created by tsesamli on 2018/11/29.
 */
import fs from 'fs-extra';
import path from 'path';
import buildWeappWithTaro from './build-weapp-with-taro';
import buildPluginJson from './util/build-plugin-json';
import { RootShouldBeDelete, parseConfig } from './util';
import chokidar from 'chokidar';
import { config } from './constant';
import { transform, transformSync, transformFileSync } from '@babel/core';

export default function({
  watch = false,
  type = 'weapp-plugin',
  clean = false
} = {}) {
  const {
    sourceRoot = '',
    outputRoot = '',
    weappPlugin: { miniprogramRoot = '', docRoot = '' }
  } = config;

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
 *
 */
function buildWeappPlugin(options: any) {
  const { watch = false, clean = false } = options;

  const config = parseConfig();

  const {
    sourceRoot = '',
    outputRoot = '',
    weappPlugin: {
      miniprogramRoot = '',
      docRoot = '',
      mainRoot = '',
      debugTaro = false,
      compile = {}
    }
  } = config;

  // 暂存目录
  const tempPath = '.temp-weapp-plugin';
  // 输出目录在 cwd，tempDir 用于 link 源文件以及
  const cwd = path.join(process.cwd(), outputRoot);
  const tempDir = path.join(process.cwd(), tempPath);

  if (clean) {
    fs.removeSync(tempDir);
    fs.removeSync(cwd);
  }

  fs.ensureDirSync(cwd);

  // 生成 project.config.json 并输出
  const projectConfig: any = {
    ...JSON.parse(
      fs
        .readFileSync(path.join(sourceRoot, 'project.config.plugin.json'))
        .toString()
    ),
    compileType: 'plugin',
    pluginRoot: 'plugin',
    miniprogramRoot: 'miniprogram'
  };

  fs.outputFileSync(
    path.join(cwd, 'project.config.json'),
    JSON.stringify(projectConfig, null, 4)
  );

  // 输出 plugin.json
  const pluginConfig = buildPluginJson(
    path.join(process.cwd(), sourceRoot),
    path.join(cwd, 'plugin')
  );

  // 生成新的 config, cwd 为 .temp-weapp-plugin
  fs.outputFileSync(
    path.join(tempDir, 'config/index.js'),
    `const config = ${JSON.stringify(
      {
        ...config,
        sourceRoot: path.join(
          path.relative(tempPath, process.cwd()),
          sourceRoot
        ),
        outputRoot: path.join('..', outputRoot, 'plugin'),
        // 由于工作目录发生变动，这里会找不到需要拷贝的目标路径
        copy: {
          ...config.copy,
          patterns: (() => {
            interface Patterns {
              from: string;
              to: string;
            }

            let tempList: Array<Patterns> = [];
            // doc 只能放在根目录
            if (docRoot) {
              tempList.push({
                from: path.join('..', docRoot),
                to: path.join('..', outputRoot, 'doc')
              });
            }

            // 生成 miniprogram
            // TODO: miniprogram 默认是不编译的
            if (miniprogramRoot) {
              tempList.push({
                from: path.join('..', miniprogramRoot),
                to: path.join('..', outputRoot, 'miniprogram')
              });
            }

            // 如果不需要编译，直接复制即可
            if (!compile.main && pluginConfig.main) {
              tempList.push({
                from: path.join('..', sourceRoot, pluginConfig.main),
                to: path.join('..', outputRoot, 'plugin', pluginConfig.main)
              });
            }

            return [
              ...config.copy.patterns.map(e => ({
                ...e,
                from: path.join('..', e.from)
              })),
              ...tempList
            ];
          })()
        }
      },
      null,
      4
    )}

module.exports = function (merge) {
    return config
}`
  );

  // const weappPluginEmitter = buildWeappWithTaro({
  //   args: ['build', '--type', 'weapp', '--watch'],
  //   cwd: tempDir,
  //   dev: debugTaro
  // });

  // // TODO: 清理门户

  // // 子进程退出或 watch mode 下完成第一次构建
  // weappPluginEmitter.on('done', () => {
  //   deleteBasenameStartWithApp(path.join(cwd, 'plugin'));
  // });

  buildMainRoot();

  if (watch) {
    const sourceWatcher = chokidar.watch(path.join(sourceRoot), {
      ignored: /(^|[/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    // TODO: project.config, plugin.json, component watch mode
    sourceWatcher.on('change', filePath => {
      if (filePath === `${mainRoot}.js`) {
        console.log(`编译  JS文件  ${mainRoot} 没事，我帮你编译`);
        buildMainRoot();
      }

      if (filePath.search(docRoot) === 0) {
        const targetPath = path.join(
          outputRoot,
          'doc',
          path.relative(docRoot, filePath)
        );
        console.log(`拷贝  资源  ${filePath} -> ${targetPath}`);
        fs.copySync(filePath, targetPath);
      }

      if (filePath.search(miniprogramRoot) === 0) {
        const targetPath = path.join(
          outputRoot,
          'miniprogram',
          path.relative(miniprogramRoot, filePath)
        );
        console.log(`拷贝  资源  ${filePath} -> ${targetPath}`);
        fs.copySync(filePath, targetPath);
      }
    });

    const outputWatcher = chokidar.watch(path.join(outputRoot), {
      ignored: /(^|[/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    outputWatcher.on('change', filePath => {
      //  同步 project.config.plugin.json
      if (filePath.search(path.join(outputRoot, 'project.config.json')) === 0) {
        const {
          projectname,
          description,
          appid,
          setting,
          condition
        } = JSON.parse(fs.readFileSync(filePath).toString());
        const originConfig = JSON.parse(
          fs
            .readFileSync(path.join(sourceRoot, 'project.config.plugin.json'))
            .toString()
        );

        fs.outputFileSync(
          path.join(sourceRoot, 'project.config.plugin.json'),
          JSON.stringify(
            {
              ...originConfig,
              projectname,
              description,
              appid,
              setting,
              condition
            },
            null,
            4
          )
        );
      }
    });
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

function buildMainRoot() {
  const {
    outputRoot = '',
    weappPlugin: { mainRoot = '', compile = {} }
  } = config;

  // 编译 main
  if (compile.main) {
    const result = transformFileSync(`${mainRoot}.js`, {
      presets: [
        [
          require('@babel/preset-env'),
          {
            targets: ['last 2 versions', 'Android >= 4.2', 'iOS 9']
          }
        ]
      ]
    });
    fs.outputFileSync(path.join(outputRoot, 'plugin', 'index.js'), result.code);
  }
}
