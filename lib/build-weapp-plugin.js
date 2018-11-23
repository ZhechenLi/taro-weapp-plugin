/**
 * Created by v_sameli on 2018/11/7.
 */
const buildPluginJson = require('./util/build-plugin-json');
// const fs = require('fs');
const fs = require('fs-extra');
const path = require('path');
const buildWeappWithTaro = require('./build-weapp-with-taro');
const program = require('commander');
const _ = require('lodash');
const {
	rootPath,
	copySpecificDir,
	RootShouldBeDelete
} = require('./util');
var chokidar = require('chokidar');

const config = require(rootPath`./config/index`)(_.merge);

const {
	sourceRoot,
	outputRoot
} = config;

const SOURCE_PATH = rootPath(sourceRoot);
const OUTPUT_PATH = rootPath(outputRoot);
const SOURCE_SCRIPT_PATH = path.join(SOURCE_PATH, './index.js');
const OUTPUT_SCRIPT_PATH = path.join(OUTPUT_PATH, './index.js');

const SOURCE_DOC_PATH = path.join(SOURCE_PATH, '../doc');
const OUTPUT_DOC_PATH = path.join(OUTPUT_PATH, '../doc');
const SOURCE_MINI_PROGRAM_PATH = path.join(SOURCE_PATH, '../miniprogram');
const OUTPUT_MINI_PROGRAM_PATH = path.join(OUTPUT_PATH, '../miniprogram');

function deleteBasenameStartWithApp(){

	fs.readdirSync(OUTPUT_PATH).forEach(e=>{
		const OUTPUT_DELETE_PATH = path.join(OUTPUT_PATH, e);
		if(RootShouldBeDelete(OUTPUT_DELETE_PATH, OUTPUT_PATH)){
			console.log('删除 APP 相关', OUTPUT_DELETE_PATH);
			fs.unlinkSync(OUTPUT_DELETE_PATH);
		}
	});
};

function copyDocAndMiniProgram(){
	const COPY_DOC_MINI_PROGRAM_LIST = [
		{from: SOURCE_DOC_PATH, to: OUTPUT_DOC_PATH},
		{from: SOURCE_MINI_PROGRAM_PATH, to: OUTPUT_MINI_PROGRAM_PATH},
		{from: SOURCE_SCRIPT_PATH, to: OUTPUT_SCRIPT_PATH}
	];

	COPY_DOC_MINI_PROGRAM_LIST.forEach(({from, to})=>{
		copySpecificDir(from, to);
	});
}

function watchFileChange(){

	chokidar.watch(OUTPUT_PATH, {ignored: /(^|[\/\\])\../})
	.on('add', (PATH)=>{
		if(RootShouldBeDelete(PATH, OUTPUT_PATH)){
			deleteBasenameStartWithApp(OUTPUT_PATH);
		}
	});

	chokidar.watch(SOURCE_PATH, {ignored: /(^|[\/\\])\../})
	.on('all', (event, PATH)=>{

		if(PATH === path.join(SOURCE_PATH, './app.js')){
			console.log('生成 plugin JSON', PATH);
			buildPluginJson(SOURCE_PATH, OUTPUT_PATH);
		}

	});

	chokidar.watch([SOURCE_DOC_PATH, SOURCE_MINI_PROGRAM_PATH, SOURCE_SCRIPT_PATH], {ignored: /(^|[\/\\])\../})
	.on('change', (PATH)=>{
		if(PATH.search(SOURCE_DOC_PATH) !== -1 || PATH.search(SOURCE_MINI_PROGRAM_PATH) !== -1 || PATH.search(SOURCE_SCRIPT_PATH) !== -1){
			copyDocAndMiniProgram();
		}
	});

	// chokidar.watch([OUTPUT_DOC_PATH, OUTPUT_MINI_PROGRAM_PATH, OUTPUT_SCRIPT_PATH], {ignored: /(^|[\/\\])\../})
	// .on('unlink', (PATH)=>{
	// 	try{
	// 		copyDocAndMiniProgram();
	// 	}catch(e){
	// 		debugger;
	// 	}
	//
	// });

}

function cacheProject(){

}

function init(){
	fs.ensureDirSync(OUTPUT_PATH);
}

module.exports = async function buildWeAppPlugin({
	watch = false
} = {}){

	init();
	deleteBasenameStartWithApp();
	buildPluginJson(SOURCE_PATH, OUTPUT_PATH);
	copyDocAndMiniProgram();
	buildWeappWithTaro();

	if(watch){
		watchFileChange();
	}
};