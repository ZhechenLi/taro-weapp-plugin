const Tucao = requirePlugin('tucao').default;

// Tucao 会从 this 中提取 wx 对象，用于简化接入方的接入逻辑
// 如果开启了微信开发者工具的 ES5 转 ES6 会有异常,
// 开启之后微信开发者工具会把每个 js 文件封装在一个严格模式的函数中，this 将返回 undefined
// 作为兼容手段支持直接在 options 中传入 navigateTo 方法（如果担心 wx 对象被我们玩坏，也可以使用这种方式
// 如果没有传入 wx 对象或 navigateTo 方法，请使用 Tucao#getUrl 来获取跳转链接
Tucao.init(this);
/**
 * Tucao.init(undefined, {
 *    navigateTo: wx.navigateTo
 * });
 */

const { SDKVersion } = wx.getSystemInfoSync();

const CONSTANT = {
  PARAMS_INIT_FROM_STORGE: [
    'productId',
    'postId',
    'nickname',
    'openid',
    'extraData',
    'entry',
    'getCookie'
  ],
  PARAMS_STATIC: {
    avatar:
      'https://tucao.qq.com/static/desktop/img/products/def-product-logo.png',
    entries: ['index', 'post-detail'],
    entry: 'index',
    productId: '1368',
    debug: true,
    SDKVersion
  }
};

Page({
  data: (function getInitialData(params, extra = {}) {
    return {
      ...extra,
      ...params.reduce(
        (acc = {}, cur) => ({
          ...acc,
          [cur]: wx.getStorageSync(cur) || extra[cur]
        }),
        {}
      )
    };
  })(CONSTANT.PARAMS_INIT_FROM_STORGE, CONSTANT.PARAMS_STATIC),
  onLoad() {
    this.setData({
      url: Tucao.getUrl(this.data)
    });
  },
  go() {
    Tucao.go(this.data);
  },
  onFormChange(e) {
    switch (e.currentTarget.id) {
      case 'productId':
      case 'nickname':
      case 'openid':
      case 'postId':
        this.setDataAndStorge(e.currentTarget.id, e.detail.value);
        break;
      case 'getCookie':
        if (!e.detail.value) {
          this.setDataAndStorge('openid', '');
          this.setDataAndStorge('nickname', '');
        }
        this.setDataAndStorge(e.currentTarget.id, e.detail.value);
        break;
      case 'entry':
        this.setDataAndStorge(
          e.currentTarget.id,
          this.data.entries[e.detail.value]
        );
        break;
    }
  },
  setDataAndStorge(key, value) {
    const url = Tucao.getUrl({ ...this.data, [key]: value });
    this.setData({
      [key]: value,
      url
    });
    wx.setStorageSync(key, value);
  }
});
