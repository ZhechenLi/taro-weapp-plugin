/**
 * Created by v_sameli on 2018/11/6.
 */
const path = require('path');
const fs = require('fs-extra');
const parse = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

/**
 * 读取 SOURCE_PATH 目录下的 app.js，解析出类中含有静态属性 config，并在 OUTPUT_PATH 下生成 plugin.json
 * @return {Object} configObj 最终生成的 plugin.json
 * */
module.exports = function buildPluginJson(SOURCE_PATH, OUTPUT_PATH) {
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

	let configObj = {};

	traverse(ast, {
		ClassProperty(astPath) {
			const node = astPath.node;
			if(node.key.name === 'config') {
				configObj = traverseObjectNode(node);
			}
		}
	});

	/**
	 * 插件的 page 选项需要指定名称
	 * */
	configObj.pages = getPageName(configObj.pages);
	// TODO：貌似不需要了
	// if(fs.existsSync(path.join(OUTPUT_PATH, './index.js'))) {
	// 	configObj.main = 'index.js';
	// }

	fs.outputFileSync(path.join(OUTPUT_PATH, './plugin.json'), JSON.stringify(configObj, null, 4));

	return configObj;

};

/**
 * 将 ['pages/faq/index'] 转换成 {faq: 'pages/faq/index'}
 * 为了兼容普通小程序还是在这里做一个转换吧
 * @params pages{Array} pages 列表
 * @return {Array} 一个符合插件的 pages 列表
 * */
function getPageName(pages = []) {

	if(!Array.isArray(pages)) return pages;

	const pageFormat = {};

	pages.forEach(e => {
		let key = e.split('/').slice(-1)[0];
		if(key === 'index') {
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
function traverseObjectNode(node, obj) {

	if(node.type === 'ClassProperty' || node.type === 'ObjectProperty') {
		const properties = node.value.properties;
		obj = {};
		properties.forEach(p => {
			let key = t.isIdentifier(p.key) ? p.key.name : p.key.value;
			obj[key] = traverseObjectNode(p.value);
		});
		return obj;
	}
	if(node.type === 'ObjectExpression') {
		const properties = node.properties;
		obj = {};
		properties.forEach(p => {
			let key = t.isIdentifier(p.key) ? p.key.name : p.key.value;
			obj[key] = traverseObjectNode(p.value);
		});
		return obj;
	}
	if(node.type === 'ArrayExpression') {
		return node.elements.map(item => traverseObjectNode(item));
	}
	if(node.type === 'NullLiteral') {
		return null;
	}
	return node.value;
}
