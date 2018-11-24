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
 * 检索 PATH 目录，并删除 PATH 目录下的符合 app.* scheme 的文件
 * 在插件开发中 root/to/plugin/app.* 这些文件的存在可能会导致真机调试异常
 * TODO： 考虑如何迁移写在 app.js 中的逻辑
 * @param {Path} PATH 输出目录下 plugin 的路径
 * */
function deleteBasenameStartWithApp(PATH) {

	fs.readdirSync(PATH).forEach(e => {
		const OUTPUT_DELETE_PATH = path.join(PATH, e);
		if(RootShouldBeDelete(OUTPUT_DELETE_PATH, PATH)) {
			console.log(`删除  多余文件  ${OUTPUT_DELETE_PATH}`);
			fs.removeSync(OUTPUT_DELETE_PATH);
		}
	});
};

/**
 * doc 和 miniprogram 先直接复制
 * 后期考虑 miniprogram 先过一次 taro 编译
 * */
function copyDocAndMiniProgram({
	watch = false
} = {}) {

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
			console.log(`删除  多余文件  ${PATH}`);
			fs.removeSync(PATH);
		}
	});

	chokidar.watch(SOURCE_PATH, { ignored: /(^|[\/\\])\../ })
	.on('all', (event, PATH) => {

		if(PATH === path.join(SOURCE_PATH, './app.js')) {
			console.log(`生成  页面配置  ${PATH}`);
			buildPluginJson(SOURCE_PATH, OUTPUT_PATH);
		}
	});

	chokidar.watch(config.copy.patterns.map(e => e.from), { ignored: /(^|[\/\\])\../ })
	.on('change', (PATH) => {
		const {
			from,
			to
		} = config.copy.patterns.find(e => PATH.search(e.from) !== -1);

		const target = path.join(to, path.relative(from, PATH));

		console.log(`拷贝 文件  ${PATH} -> ${target}`);

		fs.copySync(PATH, target);

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
function linkProject(TEMP_ROOT) {
	const filterCondition = (e) => !['config'].includes(e);

	const dir = fs.readdirSync('.');

	dir.filter(filterCondition).map(e => fs.ensureSymlink(e, path.join(__dirname, TEMP_ROOT, e)));
	fs.ensureSymlinkSync('./config/dev.js', path.join(__dirname, TEMP_ROOT, 'config/dev.js'));
	fs.ensureSymlinkSync('./config/prod.js', path.join(__dirname, TEMP_ROOT, 'config/prod.js'));
}

async function init() {

	fs.ensureDirSync(OUTPUT_PATH);

	// await linkProject();

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

	init();
	/**
	 * 生成 plugin.json
	 * 删除 app.*
	 * TODO: app.scss, app.js 里面的逻辑还要不要?
	 * 文档，demo 更新
	 * 抹平一些环境差异(async, setStore 等)
	 * watch mode
	 * */
	const weappPluginEmitter = buildWeappWithTaro();

	weappPluginEmitter.on('load', () => {
		const pluginConfig = buildPluginJson(SOURCE_PATH, OUTPUT_PATH);
		// 这里的文件变动时候再次触发复制操作

		if(watch) {
			watchFileChange();
		}
	});

	// 子进程退出
	weappPluginEmitter.on('done', () => {
		deleteBasenameStartWithApp(OUTPUT_PATH);
	});

	// const weappEmitter = buildWeappWithTaro({
	// 	env: {
	// 		TYPE: 'weapp'
	// 	}
	// });

};