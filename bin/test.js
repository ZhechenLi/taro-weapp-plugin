/**
 * Created by tsesamli on 2018/11/23.
 */
const fs = require('fs-extra');
const path = require('path');

const TEMP_ROOT = './temp/root';


fs.symlink('./src', path.join(__dirname, TEMP_ROOT));
