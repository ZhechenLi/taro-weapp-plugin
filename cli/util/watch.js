/**
 * Created by v_sameli on 2018/11/6.
 * app.js, app.json 的存在会导致真机调试出现异常,
 * 这个脚本用于将 plugin 根目录下所有的 app. 开头的文件都删除
 */
const fs = require('fs');
const path = require('path');

/**
 * app.js, app.json, app.wxss, app.scss, app.less, app.css 都要删
 * @param name {String} 文件名
 * @return {Boolean} 是否需要删除
 * */
function shouldBeDelete(name){
	return !!name.match(/app\.(js(on)*|(wx|le|c|sc)ss)/);
}

module.exports = function deleteBasenameStartAtApp(output){


	fs.readdirSync(output).forEach(e=>{
		if(shouldBeDelete(e)){
			fs.unlinkSync(path.join(output, e));
		}
	});



};