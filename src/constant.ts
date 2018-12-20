import { pathExists } from 'fs-extra';
import path from 'path';
import { parseConfig } from './util';

export const config = parseConfig();

/**
 * Created by v_sameli on 2018/11/21.
 */
// export default {};

const RELATIVE_PATH = {
  taroCwd: '.temp-weapp-plugin',
  docDir: 'doc',
  demoDir: 'demo'
};

export const PATH = {
  cwd: process.cwd(), // 工作目录
  taroCwd: path.join(process.cwd(), RELATIVE_PATH.taroCwd), // taro 子进程的工作目录
  /**
   * 输出目录
   * outputDir
   *    |- plugin
   *    |- demo
   *    |- doc
   *    |- project.config.json
   */
  outputDir: path.join(process.cwd(), config.outputRoot), // 插件输出的根目录
  outputPluginDir: path.join(process.cwd(), config.outputRoot),
  outputDemoDir: path.join(process.cwd(), config.outputRoot),
  outputDocDir: path.join(process.cwd(), config.outputRoot)
};
