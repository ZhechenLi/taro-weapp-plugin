







## 题外话：为什么用 Taro 来开发小程序

其实这个问题可以分成两点来看：

1. 为什么我们需要小程序框架
2. 为什么我最终选择了 Taro

#### 1. 为什么我们需要小程序框架

其实早在去年吐槽第一版小程序开发时，就有朋友推荐我使用 wepy 之类的小程序框架（主要是还能帮他的毕设填坑）。彼时小程序正式发布不到一年，坑还非常的多。框架的引入主要也是为了解决这些坑。

那时候原生的小程序语法主要有以下几个痛点（当然有些痛点持续至今）：

1. 没有原生的组件化/模块化方案
2. 没办法无缝使用 npm 包
3. 样板代码多
4. 与前端工程化生态脱节

但是考虑到当时小程序的很多语法标准其实并未统一，很多的接口或者写法并未成型。而且使用框架也不意味着一劳永逸，也出现了不少不和谐的声音。为了避免踩不必要的坑，所以当时还是决定使用原生的小程序语法来编写小程序。

>  为了解决模块化，笔者当时使用了 Mixin + template的方式，将方法拼接到 Page 参数对象中来实现简单的模块化，当然后期维护起来非常的蛋疼...

然而随着时间的推移，小程序的语法也逐渐稳定下来，类似 mpvue，omi，Taro，nanachi之类的框架也如雨后春笋般涌出，社区针对这个领域的讨论也愈发的活跃。这时候我也开始动摇，要不要也尝试一下使用这类小程序框架呢？

#### 2. 为什么我最终选择了 Taro

其实一开始并没有想太多，对于我来说框架只要比原生好用就行没什么追求（毕竟被小程序荼毒已久）。

> 笔者并不止维护吐槽小程序这一个项目，所以时隔数月后再看回小程序“落后”的写法后感觉十分的心累...

起初大部分小程序框架都是以 vue 作为模板来开发的，虽然个人并不排斥 vue，但是如果能用 React 来开发小程序那是最吼的啦。

> 用正妹大大的话来说就是对使用 React 栈的同学来说不公平

类 React 的库比较靠谱的有 Taro 和 nanachi。

Taro 的开发团队 O2 也算是我们部门的友军了，早在去年前端体验大会上就听他们团队的成员在介绍 Nerv，也是业界小有名气的项目，Taro 的 web view层的运行时就是 Nerv（emmm，web 的 view？）。

nanachi 来自去哪儿 TMFE 团队，目前还是作为 anujs 的一部分，给人感觉还是个半成品，就不考虑了。

> anujs 的作者大家应该都认识吧~

再加上以后可能会有跟 Taro 的合作，所以 Taro 的优先级排到了最高，花了点时间简单试了一下 demo 以及体验了一些基本用法。语法大部分都能兼容，集成了工作流，能自己拓展 babel 插件，预估能满足小程序开发的需求，就开始动手干了。



### 代码时间

笔者的重点将放在如何在 Taro 的基础上进行小程序插件的开发，关于 Taro 本身及开发普通小程序的问题大部分都一笔带过。

> 本文仅供折腾，在没有对框架有足够掌控的情况下还是不建议过早的使用，以免耽误项目进度...

##### 1. 初始化

开发小程序插件和开发普通小程序的流程大体类似，除了少部分特殊接口需要用特殊的组件来触发以外，其余的大部分逻辑其实都是可以共用的。

所以理论上来说一个能够正常运行的普通小程序转换成插件之后大部分代码也应该都是能继续复用的。

> 事实证明“大部分”代码确实是可以兼容，只不过剩下的坑也不小，这是后话。

我们先用 Taro 写一个普通的小程序。

找一个空项目，然后执行以下命令：

```shell
npx @tarojs/cli init sample
```

 根据提示输入对应的选项，这是笔者的配置：

![image-20181112200511339](/Users/tsesamli/Library/Application Support/typora-user-images/image-20181112200511339.png)

然后你会发现当前目录多了一个新的 sample 目录，结构如下：

![image-20181112201809920](/Users/tsesamli/Library/Application Support/typora-user-images/image-20181112201809920.png)

执行下面的语句，然后 taro 就会将我们的代码转换成能够在小程序环境下运行的代码了。
```shell
cd sample
npm run dev:weapp
```

生成的代码在 /dist 目录下：

![image-20181112201938992](/Users/tsesamli/Library/Application Support/typora-user-images/image-20181112201938992.png)

用小程序开发工具打开这个目录，可以看到我们的 demo 顺利地跑起来了。

![image-20181112202132162](/Users/tsesamli/Library/Application Support/typora-user-images/image-20181112202132162.png)

其余的用法基本上就是按照 React 开发 web 应用的习惯来进行即可。

比如定义一个组件 MyButton:

```react
// component/MyButton/index.js
import Taro, { Component } from '@tarojs/taro'
import { Button } from '@tarojs/components'
import './index.scss'

class MyButton extends Component {
    onClick(e) {
        e.stopPropagation()
        console.log('aloha')
        this.props.onClick && this.props.onClick(e)
    }

    render() {
        return (
            <Button className="root-component__my-button_normal" onClick={this.onClick}>
                {this.props.name}:{this.props.children}
                <div ></div>
            </Button>
        )
    }
}

export default MyButton
```

使用方式非常亲切：

```react
// pages/index/index.js
class Index extends Component {
  ...
  render() {

    return (
      <View className='pages__index'>
        <MyButton onClick={this.props.onClick} name="卧底">
          <Text>对不起</Text>
          <Text>我是差佬</Text>
        </MyButton>
		...
      </View>
    )
  }
}
```

有人可能会好奇这究竟是怎么做到的？让我们来看一下生成的代码吧。

可以看到，Taro 帮我们把 React 语法编写的代码转换成了下面的格式：

```react
// dist/component/MyButton/index.js
<block>
    <button class="pages__index__component__my-button" catchtap="onClick">{{name}}:
        <slot></slot>
    </button>
</block>
```

还有对应的 

接着来试一下列表渲染：

```react

```

> Array#map 的回调中不能使用分支判断 [详见](#Array#map 的回调中不能使用分支判断)



> 注意
>
> 组件需要放在独立的文件夹中， [详见](#组件需要定义在独立的文件中)









比如我定义一个







坑：
##### 组件需要定义在独立的文件中

Taro 把每一个 PathToPage/index.js 中最后一个 Taro#Component 类定义为 mainClass：

```react
// PathToPage/index.js
class Index
```

在 mainClass 中使用不存在的组件是不会报错的，原因我们看下源码就知道了(什么？不会 babel？[详见](#教你撸 babel))，代码如下：

```js
// transformer-ws/lib/src/class.js 299
JSXElement(path) {
    const id = path.node.openingElement.name;
    if (t.isJSXIdentifier(id) &&
        !constant_1.DEFAULT_Component_SET.has(id.name) &&
        self.moduleNames.indexOf(id.name) !== -1) {
        const name = id.name;
        const binding = self.classPath.scope.getBinding(name);
        // 看这里！！！
        if (binding && t.isImportDeclaration(binding.path.parent)) {
            const sourcePath = binding.path.parent.source.value;
            if (binding.path.isImportDefaultSpecifier()) {
                self.customComponents.set(name, {
                    sourcePath,
                    type: 'default'
                });
            }
            else {
                self.customComponents.set(name, {
                    sourcePath,
                    type: 'pattern'
                });
            }
        }
    }
}
```

注意 ```// 看这里！！！``` 的部分，大意就是我遍历所有的 JSX 元素实例得到组件名，然后找一下 import 里面有没有定义这个组件，如果没有我就不管啦。

这里只会去查找从外部 import 的组件，所以如果组件和当前父组件是定义在同一文件夹中，taro 是找不到的额，所以类似下面的场景是不会生效的。

```react
class MyButton extends Component {
    ...
} 

class Index extends Component {
  render() {
    return (
      <View className='index'>
        {/*这里不会报错，但是 MyButton 会被忽略*/}
        <MyButton onClick={this.props.onClick} name="卧底">
			...
        </MyButton>
      </View>
    )
  }
}
```

有人可能会好奇那 MyButton 会被编译成什么呢？

emmmm, 由于 Taro 并没有对其做特殊处理，所以 JSX 会被处理成 React.createElement(...)  的形式（捂脸）

![image-20181116130959199](/Users/tsesamli/Library/Application Support/typora-user-images/image-20181116130959199.png)

所以还是建议大家还是养成一个文件一个组件的习惯吧，虽然不知道官方什么时候会调整。

如果有折腾党坚持要将组件和入口组件写在一起，可以尝试下修改源码中的 Transformer#customComponents，格式如下：

![image-20181116132041396](/Users/tsesamli/Library/Application Support/typora-user-images/image-20181116132041396.png)













##### 定义了组件可以没有生效？

组件需要放在独立的文件中，



##### Array#map 的回调中不能使用分支判断

##### map 中参数丢失

有时我发现我在 Array#map 传递中传递的参数会被莫名忽略

##### 修改某个模块没有及时更新

有时我修改了 store 中的某个文件，可是并没有更新



##### 不支持 render props，不支持高阶组件

高阶组件和 render props 是 React 开发中常用的抽象手段，可惜在 Taro 中我们无法完美的沿用这套模式，原因在于 Taro 针对小程序环境下组件 children 及 JSX的处理机制限制。

关于 children：

taro 实际上会把 children 当做 slot 来处理。这也就意味着我们不能做对 children 任何额外的操作(slot 的限制)，只能直接展示。如果你尝试在组件中打印 this.props.children，在小程序环境永远都是 undefined。

```jsx
render(){
    console.log(this.props.children) // undefined
    // 能展示但是不能操作
    return <View>{this.props.children}</View> 
}
```

编译结果如下：
```jsx
<block>
    <button class="pages__index__component__my-button" bindtap="onClick">
        <slot></slot>
    </button>
</block>
```



> 顺带一提，如果不是直接用 this.props.children 的方式使用，children 可能会被忽略。
> ```react
> render(){
>   const {children} = this.props;
>   return <View>{children}</View> // doesn't work
> }
> ```
>

除此之外，不能在 props 中传递 JSX，或者返回值包含 JSX 的函数，这两种情况 compiler 会直接报错。

所以 render props 和高阶组件就别想了，当然，在小程序的环境下即使能支持高阶组件，使用起来也还是有诸多限制（没有类 DOM 接口是硬伤啊）。





##### 在非 H5 打包的情况下，Taro 每次打包都会清空目标文件夹。

![image-20181115145822193](/Users/tsesamli/Library/Application Support/typora-user-images/image-20181115145822193.png)

##### 我自己用脚本生成的文件不见了



不支持 iconfont，

SVG 支持



不支持小程序 alias

Taro 的 alias 默认只支持 h5，

无法控制 svg 元素的 fill

在 web 端使用SVG 图像时，可以通过设置父元素的 fill 样式来控制子元素中 SVG 元素的 fill 样式（前提是子元素没有内联的 fill 样式）



看到这里似乎一切都非常的顺利，但是别忘了，我们最主要的目的是使用 Taro 来开发小程序插件，所以接下来我们将进行普通小程序到小程序插件的改造工作。





async 

store 异常

```

```



#### 性能问题

避免传入结构太深的组件

和 react-redux 类似，@tarojs 也会对 mapStateToProps 做一次浅比较以优化性能。

##### 子进程高亮





copy plugin 不会监听文件变化



输出格式化

判断 stdout

main 打包编译

miniProgram 打包

plugin component 打包

plugin index 打包



## 插件兼容

插件的兼容主要考虑以下几个因素：

目录结构不同，需要有对应的 miniProgram 和 doc，plugin 目录，且配置文件的位置也不同。

一些多余的配置会导致插件出现异常，如：出现在 plugin 目录中的 app.json，app.js 会导致无法跳转，project.config.json 需要在根目录而不是在 plugin 目录，

需要生成 plugin.json ，虽然结构类似 app.json，但是有些字段是不同的。

alias 

在不动源码的情况实现 alias 有点难度且效率不是很高，因为 taro 会前置判断所有的绝对路径包名并自作主张地帮你下载...



在子进程中执行 taro，标准输出高亮

有时你需要将 taro 封装到自己的脚本中，这时候你可能会用类似下面的代码来实现：

```js
const {spawn} = require('child_process');
const cp = spawn(
    'taro',
    [...process.argv.slice(process.argv.findIndex(e=>e === 'build'))],
);

cp.stdout.on('data', data=>{
    console.log(data);
});
```

然后你就会发现 taro 原本实现的高亮消失了

![image-20181122193301645](/Users/tsesamli/Library/Application Support/typora-user-images/image-20181122193301645.png)

before

![image-20181122193350138](/Users/tsesamli/Library/Application Support/typora-user-images/image-20181122193350138.png)after

一般这种情况是因为 chalk 的判断，chalk 会通过 process.stdout.isTTY 来判断是否运行在一个 TTY 下。在使用 child_process 相关的接口执行一个子进程时 process.stdout.isTTY 为 undefined（具体为啥会这样还请大神指教）。

经笔者实践最简单的方式就是设置一个环境变量 FORCE_COLOR="true" 就完事了，具体为啥可以看 [**chalk/supports-color**](https://github.com/chalk/supports-color/blob/master/index.js#L41)。

```js
const {spawn} = require('child_process');

process.env.FORCE_COLOR = 'true';
const cp = spawn(
    'taro',
    [...process.argv.slice(process.argv.findIndex(e=>e === 'build'))],
);

cp.stdout.on('data', data=>{
    console.log(data);
});
```

> 网上还流行两种方案，分别是设置 stdio 和 process.argv 中带上 '--color' 参数，代码如下：
>
> ```js
> // 设置 stdio 为 inherit
> const cp = spawn(
>     'taro',
>     [...process.argv.slice(process.argv.findIndex(e=>e === 'build'))],
>     {stdio: 'inderit'}
> );
> 
> // 带上 --color 参数
> const cp = spawn(
>     'taro',
>     [...process.argv.slice(process.argv.findIndex(e=>e === 'build')), '--color'],
> );
> ```
>
> 前者的弊端是父进程无法操作子进程的 stdout，后者在 taro 中根本跑不通