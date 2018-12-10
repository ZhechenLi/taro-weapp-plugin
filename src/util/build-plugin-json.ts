/**
 * Created by v_sameli on 2018/11/6.
 */
import path from 'path';
import fs from 'fs-extra';
const parse = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
import { config } from '../constant';

/**
 * 读取 SOURCE_PATH 目录下的 app.js，解析出类中含有静态属性 config，并在 OUTPUT_PATH 下生成 plugin.json
 * @return {Object} configObj 最终生成的 plugin.json
 * */
export default function buildPluginJson(
  SOURCE_PATH: string,
  OUTPUT_PATH: string
) {
  const code = fs.readFileSync(path.join(SOURCE_PATH, './app.js'));
  const ast = parse(code.toString(), {
    sourceType: 'module',
    plugins: [
      'classProperties',
      'jsx',
      'flow',
      'flowComment',
      'trailingFunctionCommas',
      'asyncFunctions',
      'exponentiationOperator',
      'asyncGenerators',
      'objectRestSpread',
      ['decorators', { decoratorsBeforeExport: false }],
      'dynamicImport'
    ]
  });

  let configObj: {
    pages?: string[];
    main?: string;
    publicComponents?: object;
  } = { pages: [] };

  traverse(ast, {
    ClassProperty(astPath: any) {
      const node = astPath.node;
      if (node.key.name === 'config') {
        configObj = traverseObjectNode(node);
      }
    }
  });

  /**
   * 插件的 page 选项需要指定名称
   * */
  let pluginConfigObj = {
    ...configObj,
    pages: getPageName(configObj.pages)
  };

  if (
    config.weappPlugin.mainRoot &&
    !fs.existsSync(`${config.weappPlugin.mainRoot}.js`)
  ) {
    throw new Error(
      `weappPlugin#mainRoot: ${config.weappPlugin.mainRoot} 不存在`
    );
  }

  // TODO: publicComponents 未做额外处理
  fs.outputFileSync(
    path.join(OUTPUT_PATH, './plugin.json'),
    JSON.stringify(
      {
        // 先假设没有后缀名
        main: `${path.relative(
          config.sourceRoot,
          config.weappPlugin.mainRoot
        )}.js`,
        pages: pluginConfigObj.pages,
        publicComponents: pluginConfigObj.publicComponents
      },
      null,
      4
    )
  );

  return configObj;
}

/**
 * 将 ['pages/faq/index'] 转换成 {faq: 'pages/faq/index'}
 * 为了兼容普通小程序还是在这里做一个转换吧
 * @params pages{Array} pages 列表
 * @return {Array} 一个符合插件的 pages 列表
 * */
function getPageName(pages: string[] = []) {
  if (!Array.isArray(pages)) return pages;

  const pageFormat: any = {};

  pages.forEach(e => {
    let key = e.split('/').slice(-1)[0];
    if (key === 'index') {
      key = e.split('/').slice(-2, -1)[0];
    }
    pageFormat[key] = e;
  });

  return pageFormat;
}

/**
 * copy from taro
 * 用于解析 config
 * */
function traverseObjectNode(node: any, obj?: any) {
  if (node.type === 'ClassProperty' || node.type === 'ObjectProperty') {
    const properties = node.value.properties;
    obj = {};
    properties.forEach((p: any) => {
      let key = t.isIdentifier(p.key) ? p.key.name : p.key.value;
      obj[key] = traverseObjectNode(p.value);
    });
    return obj;
  }
  if (node.type === 'ObjectExpression') {
    const properties = node.properties;
    obj = {};
    properties.forEach(p => {
      let key = t.isIdentifier(p.key) ? p.key.name : p.key.value;
      obj[key] = traverseObjectNode(p.value);
    });
    return obj;
  }
  if (node.type === 'ArrayExpression') {
    return node.elements.map((item: any) => traverseObjectNode(item));
  }
  if (node.type === 'NullLiteral') {
    return null;
  }
  return node.value;
}
