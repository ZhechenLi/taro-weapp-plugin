/**
 * Created by v_sameli on 2018/11/7.
 */
const buildPluginJson = require('./util/build-plugin-json');
const fs = require('fs-extra');
const path = require('path');
const buildWeappWithTaro = require('./build-weapp-with-taro');
const {
	copySpecificDir,
	RootShouldBeDelete
} = require('./util');

const chokidar = require('chokidar');

const {
	config,
	TEMP_ROOT,
	SOURCE_PATH,
	OUTPUT_PATH,
	SOURCE_SCRIPT_PATH,
	OUTPUT_SCRIPT_PATH,
	SOURCE_DOC_PATH,
	OUTPUT_DOC_PATH,
	SOURCE_MINI_PROGRAM_PATH,
	OUTPUT_MINI_PROGRAM_PATH
} = require('./config');

/**
 * 删除 plugin/app.*，这些文件会导致真机调试异常
 * */
function deleteBasenameStartWithApp() {

	fs.readdirSync(OUTPUT_PATH).forEach(e => {
		const OUTPUT_DELETE_PATH = path.join(OUTPUT_PATH, e);
		if(RootShouldBeDelete(OUTPUT_DELETE_PATH, OUTPUT_PATH)) {
			console.log('删除 APP 相关', OUTPUT_DELETE_PATH);
			fs.unlinkSync(OUTPUT_DELETE_PATH);
		}
	});
};

function copyDocAndMiniProgram() {
	const COPY_DOC_MINI_PROGRAM_LIST = [
		{ from: SOURCE_DOC_PATH, to: OUTPUT_DOC_PATH },
		{ from: SOURCE_MINI_PROGRAM_PATH, to: OUTPUT_MINI_PROGRAM_PATH },
		{ from: SOURCE_SCRIPT_PATH, to: OUTPUT_SCRIPT_PATH }
	];

	COPY_DOC_MINI_PROGRAM_LIST.forEach(({ from, to }) => {
		copySpecificDir(from, to);
	});
}

function watchFileChange() {

	chokidar.watch(OUTPUT_PATH, { ignored: /(^|[\/\\])\../ })
	.on('add', (PATH) => {
		if(RootShouldBeDelete(PATH, OUTPUT_PATH)) {
			deleteBasenameStartWithApp(OUTPUT_PATH);
		}
	});

	chokidar.watch(SOURCE_PATH, { ignored: /(^|[\/\\])\../ })
	.on('all', (event, PATH) => {

		if(PATH === path.join(SOURCE_PATH, './app.js')) {
			console.log('生成 plugin JSON', PATH);
			buildPluginJson(SOURCE_PATH, OUTPUT_PATH);
		}

	});

	chokidar.watch([SOURCE_DOC_PATH, SOURCE_MINI_PROGRAM_PATH, SOURCE_SCRIPT_PATH], { ignored: /(^|[\/\\])\../ })
	.on('change', (PATH) => {
		if(PATH.search(SOURCE_DOC_PATH) !== -1 || PATH.search(SOURCE_MINI_PROGRAM_PATH) !== -1 || PATH.search(SOURCE_SCRIPT_PATH) !== -1) {
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

// 先将 link 缓存到当前目录下
function linkProject() {
	const filterCondition = (e) => !['config'].includes(e);

	const dir = fs.readdirSync('.');

	dir.filter(filterCondition).map(e => fs.ensureSymlink(e, path.join(__dirname, TEMP_ROOT, e)));
	fs.ensureSymlinkSync('./config/dev.js', path.join(__dirname, TEMP_ROOT, 'config/dev.js'));
	fs.ensureSymlinkSync('./config/prod.js', path.join(__dirname, TEMP_ROOT, 'config/prod.js'));
}

async function init() {

	fs.ensureDirSync(OUTPUT_PATH);

	// await linkProject();
	// debugger;

	// let configTemp = { ...config };

	// configTemp.outputRoot = 'dist/weapp-plugin/plugin';
	// 	fs.outputFileSync(path.join(__dirname, TEMP_ROOT, 'config/index.js'), `
	//
	// const config =  ${JSON.stringify(configTemp, null, 4)};
	//
	// module.exports = function(merge){
	//   if(process.env.NODE_ENV === 'development'){
	//     return merge({}, config, require('./dev'));
	//   }
	//   return merge({}, config, require('./prod'));
	// };
	// `);

}

function buildPluginProjectConfigJson(OUTPUT_PATH) {
	// TODO: 为插件生成 project.config.json
	let res = require(path.resolve('./project.config.json'));
	res = {
		...res,
		miniprogramRoot: 'miniprogram/',
		pluginRoot: 'plugin/',
		compileType: 'plugin',
		setting: {
			urlCheck: false,
			es6: false,
			postcss: false,
			minified: false,
			newFeature: true
		}
	};

	fs.outputFileSync(path.join(OUTPUT_PATH, '../project.config.json'), JSON.stringify(res, null, 4));
}

module.exports = async function buildWeAppPlugin({
	watch = false
} = {}) {

	await init();
	deleteBasenameStartWithApp();

	const taroEmitter = buildWeappWithTaro({
		cwd: path.join(__dirname, TEMP_ROOT)
	});

	buildPluginProjectConfigJson(OUTPUT_PATH);

	taroEmitter.on('load', () => {
		const pluginConfig = buildPluginJson(SOURCE_PATH, OUTPUT_PATH);
		copyDocAndMiniProgram();
	});

	if(watch) {
		watchFileChange();
	}
};