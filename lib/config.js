/**
 * Created by tsesamli on 2018/11/23.
 */
const {
	rootPath
} = require('./util');

const path = require('path');
const _ = require('lodash');

const CONFIG_PATH = `./config/index`;
const config = require(rootPath(CONFIG_PATH))(_.merge);

const {
	sourceRoot,
	outputRoot
} = config;

const PROJECT_PATH = {
	INDEX: './index.js',
	DOC: './assets/doc',
	DEMO: './assets/miniprogram'
};

const TEMP_ROOT = '../temp';
const SOURCE_PATH = path.join(process.cwd(), sourceRoot);
// 小程序插件的输出目录
const OUTPUT_PATH = path.join(process.cwd(), outputRoot, 'weapp-plugin/plugin');
const SOURCE_SCRIPT_PATH = path.join(SOURCE_PATH, PROJECT_PATH.INDEX);
const OUTPUT_SCRIPT_PATH = path.join(OUTPUT_PATH, PROJECT_PATH.INDEX);

const SOURCE_DOC_PATH = path.join(SOURCE_PATH, PROJECT_PATH.DOC);
const OUTPUT_DOC_PATH = path.join(OUTPUT_PATH, '../doc');
const SOURCE_MINI_PROGRAM_PATH = path.join(SOURCE_PATH, PROJECT_PATH.DEMO);
const OUTPUT_MINI_PROGRAM_PATH = path.join(OUTPUT_PATH, '../miniprogram');

module.exports = {
	PROJECT_PATH,
	CONFIG_PATH,
	TEMP_ROOT,
	SOURCE_PATH,
	OUTPUT_PATH,
	SOURCE_SCRIPT_PATH,
	OUTPUT_SCRIPT_PATH,
	SOURCE_DOC_PATH,
	OUTPUT_DOC_PATH,
	SOURCE_MINI_PROGRAM_PATH,
	OUTPUT_MINI_PROGRAM_PATH,
	config
};