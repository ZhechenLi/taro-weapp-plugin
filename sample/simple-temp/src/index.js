/**
 * Created by v_sameli on 2018/11/21.
 *
 */

/**
 * 用于吐槽小程序插件接入，未来可能会集成其他平台
 * TODO: 事件监听
 */
class Tucao {
  constructor(options = {}) {
    // 小程序插件默认没有 scene 的判断, 手工构造
    this.scene = '1099';
    this.entry = 'home';
    this.wx = (window && window.wx) || Object.create(null);
    this.navigateTo = this.wx.navigateTo;
    this.set(options);
  }

  /**
   *  接入方触发初始化，用于接收接入方作用域
   *  @param {Object} scope - 可以理解为是接入方的全局作用域，从里面提取 wx 对象（用插件的 wx 对象是触发不了接入方小程序跳转的。
   *  以后可能可以做更多事情
   *  @param {Object} options - 详见 Tucao#set@params#options
   */
  init(scope = { wx: this.wx }, options = {}) {
    if (scope === null) {
      console.warn(`讲真，传 undefined 都好过传 null`);
      scope = {};
    }
    // scope 可能为 undefined
    this.wx = scope.wx;
    this.navigateTo = this.wx.navigateTo || options.navigateTo;
    this.set(options);
    return this;
  }

  /**
   * 用于更新跳转的配置
   *  @param {Object} options
   *  @param {String} options.scene - 场景值，在插件跳转中该值始终为 1099
   *  @param {Enum [home, post-detail}} options.entry - home|post-detail, 你需要跳转的页面具体路径，目前只支持 'home' 和' post-detail'
   *  @param {String} options.productId - 必填 需要跳转的产品 id
   *  @param {String} options.postId - 在 entry 为 post-detail 时用于指定具体跳转的帖子
   *  @param {String} options.nickname - 第三方登录的昵称
   *  @param {String} options.openid - 第三方登录的 openid 作为该用户唯一的标识
   *  @param {String} options.avatar - 第三方登录的用户头像，小程序端目前只支持外链
   *  @param {Object} options.extraData - 自定义参数，最后会被序列化成字符串，关于如何构造本参数请看 @link(https://tucao.qq.com/helper/configCustomParameter)
   */
  set(options = {}) {
    for (let key in options) {
      // TODO:仅迭代自身的属性
      this[key] = options[key];
    }
    return this;
  }

  /**
   * 用于获取跳转的链接
   * @param {Object} options - 详见 Tucao#set@params#options
   * @return {String} - 根据当前参数生成的跳转链接
   */
  getUrl(options = {}) {
    this.set(options);

    const {
      scene,
      entry,
      productId: product_id,
      postId: post_id,
      nickname,
      avatar,
      openid,
      extraData: {
        clientInfo,
        clientVersion,
        os,
        osVersion,
        netType,
        imei,
        customInfo
      } = {},
      debug = false
    } = this;

    if (!product_id) {
      throw new Error(`缺少必填项: options.product_id`);
    }

    // 忽略其余字段
    const extraData = {
      clientInfo,
      clientVersion,
      os,
      osVersion,
      netType,
      imei,
      customInfo
    };

    try {
      JSON.stringify(extraData);
    } catch (e) {
      throw new Error(`Tucao#extraData 格式异常`);
    }

    // 类似 const params = `scene=${scene}&product_id=${product_id}&post_id=${post_id}&nickname=${nickname}&openid=${openid}&avatar=${avatar}&extraData=${JSON.stringify(extraData) || ''}`;
    const params =
      Object.entries({
        scene,
        product_id,
        post_id,
        nickname,
        avatar,
        openid,
        debug
      })
        .filter(([_, value]) => !!value) //过滤 Falsy
        .map(([key, value]) => `${key}=${value}`)
        .join('&') + `&extraData=${JSON.stringify(extraData) || ''}`;

    return `plugin://tucao/${entry}?${params}`;
  }

  /**
   * 触发跳转
   * @param {Object} options - 详见 Tucao#set@params#options
   */
  go(options = {}) {
    const url = this.getUrl(options);
    console.info(`跳转的 url 为 ${url}`);
    if (!this.navigateTo) {
      throw new Error('环境异常, 无法跳转');
    }
    this.navigateTo({
      url
    });
  }
}

export default new Tucao();
