/**
 * Created by v_sameli on 2018/11/6.
 */
const path = require('path');
const fs = require('fs');
const babel = require('@babel/core');
const parse = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

module.exports = function(PATH, OUTPUT_PATH){
	const code = fs.readFileSync(path.join(PATH, './app.js'));
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
			['decorators', {decoratorsBeforeExport: false}],
			'dynamicImport'
		]
	});

	let configObj = {};

	traverse(ast, {
		ClassProperty(astPath){
			const node = astPath.node;
			if(node.key.name === 'config'){
				configObj = traverseObjectNode(node);
			}
		}
	});

	fs.writeFileSync(path.join(OUTPUT_PATH, './plugin.json'), JSON.stringify(configObj, null, 4));

};

function traverseObjectNode(node, obj){

	if(node.type === 'ClassProperty' || node.type === 'ObjectProperty'){
		const properties = node.value.properties;
		obj = {};
		properties.forEach(p=>{
			let key = t.isIdentifier(p.key) ? p.key.name : p.key.value;
			obj[key] = traverseObjectNode(p.value);
		});
		return obj;
	}
	if(node.type === 'ObjectExpression'){
		const properties = node.properties;
		obj = {};
		properties.forEach(p=>{
			let key = t.isIdentifier(p.key) ? p.key.name : p.key.value;
			obj[key] = traverseObjectNode(p.value);
		});
		return obj;
	}
	if(node.type === 'ArrayExpression'){
		return node.elements.map(item=>traverseObjectNode(item));
	}
	if(node.type === 'NullLiteral'){
		return null;
	}
	return node.value;
}
