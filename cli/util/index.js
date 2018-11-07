/**
 * Created by v_sameli on 2018/11/7.
 */
const path = require('path');
const fs = require('fs');

exports.rootPath = function rootPath(strings = [], ...args){
	return path.join(process.cwd(), Array.isArray(strings) ? strings[0] : strings);
};

/**
 * 将某个目录的文件递归复制到另外一个目录
 * @param src{String} 需要复制的目录
 * @param dest{String} 目标目录
 * TODO: 未删除多余的文件,只是单方向的复制, 目前是无脑全量复制
 * */
exports.copySpecificDir = function copySpecificDir(src, dest){

	if(!fs.existsSync(src)){
		console.log(`警告 不存在 ${src}`);
		return;
	}

	if(!fs.existsSync(dest)){
		fs.mkdirSync(dest);
	}

	let stack = fs.readdirSync(src).map(e=>path.join(src, e));

	while(stack.length > 0){
		const CURRENT_PATH = stack.pop();

		if(!fs.existsSync(CURRENT_PATH)){
			fs.mkdirSync(CURRENT_PATH);
		}
		if(fs.statSync(CURRENT_PATH).isDirectory()){
			stack = [...stack, ...fs.readdirSync(CURRENT_PATH).map(e=>path.join(CURRENT_PATH, e))];
		}else{
			console.log(`复制 ${CURRENT_PATH} -> ${path.join(dest, path.relative(src, CURRENT_PATH))}`);
			fs.copyFileSync(CURRENT_PATH, path.join(dest, path.relative(src, CURRENT_PATH)));
		}
	}
};

/**
 * 插件根目录下 app.js, app.json, app.wxss, app.scss, app.less, app.css 都要删
 * @param name {String} 文件名
 * @return {Boolean} 是否需要删除
 * */
exports.RootShouldBeDelete = function RootShouldBeDelete(name, OUTPUT_PATH){
	return path.dirname(name) === OUTPUT_PATH && (!!path.basename(name)
	.match(/app\.(js(on)*|(wx|le|c|sc)ss)/) || !!path.basename(name).match(/project\.config\.json/));
};