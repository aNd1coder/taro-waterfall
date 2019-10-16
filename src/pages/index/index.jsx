import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'

Taro.initPxTransform({ designWidth: 750 })

// 一般app 只有竖屏模式，所以可以只获取一次 width
const deviceWidthDp = Dimensions.get('window').width
const uiWidthPx = 375

let wrapperOffsetY = 0
let index = 0

export default class Index extends Component {
  config = {
    navigationBarTitleText: '首页'
  }
  
  state = {
    list: [
      {
        cover: 'https://jdc.jd.com/img/375',
        title: '测试'
      }
    ]
  }

  _onLayout(event) {
    const { layout } = event.nativeEvent
    const { y } = layout
    wrapperOffsetY = y
  }

  scalePx2dp(uiElementPx) {
    return uiElementPx * deviceWidthDp / uiWidthPx
  }

  pxTransform(value) {
    return process.env.TARO_ENV === 'rn' ?  Taro.pxTransform(this.scalePx2dp(value)) : Taro.pxTransform(value)
  }

  // 获取视窗高度
  getMainHeight () {
    const info = Taro.getSystemInfoSync()
    const { windowHeight } = info

    return windowHeight
  }

  loadData () {
    index++
    const list = [{
      cover: 'https://jdc.jd.com/img/375',
      title: `测试${index}`
    }].concat(this.state.list)

    this.setState({ list })
  }

  // 下拉加载数据
  handleReachBottom() {
    this.loadData()
  }

  // 检查元素是否在视窗内
  checkItemIsInView(item, itemOffsetY) {
    const info = Taro.getSystemInfoSync()
    const { windowHeight } = info
    const threshold = windowHeight * 3
    const { scrollTop } = this.props
    const titleHeight = this.pxTransform(40) // 可以根据实际场景动态计算
    const offsetY = wrapperOffsetY + itemOffsetY + titleHeight
    const itemBottom = offsetY + item.realHeight
    const bottom = windowHeight + scrollTop

    if ((offsetY - threshold) > bottom || (itemBottom + threshold) < scrollTop) {
      return false
    }

    return true
  }

  render() {
    const data = this.props.data

    if (!data) return null

    const listLeft = []
    const listRight = []
    const gap = 20

    let leftTotalHeigt = 0
    let rightTotalHeigt = 0

    data.forEach((item, index) => {
      const itemHeight = 500 // 根据实际场景动态计算
      const realHeight = pxTransform(itemHeight)
      const addedHeight = itemHeight + gap
      item.index = index + 1
      item.height = itemHeight
      item.realHeight = realHeight

      if (leftTotalHeigt <= rightTotalHeigt) {
        item.isInView = this.checkItemIsInView(item, this.pxTransform(leftTotalHeigt))
        listLeft.push(item)
        leftTotalHeigt += addedHeight
      } else {
        item.isInView = this.checkItemIsInView(item, this.pxTransform(rightTotalHeigt))
        listRight.push(item)
        rightTotalHeigt += addedHeight
      }
    })

    const style = {
      height: data.realHeight
    }

    const renderWaterfallBlock = (data) => {
      <View style={style}>
        {data.isInView && (
          <View className='waterfall-block'>
            <Image src={data.cover} className='waterfall-block__cover' />
            <View className='waterfall-block__title'>
              <Text>
                {data.title}
              </Text>
            </View>
          </View>
        )}
      </View>
    }

    return (
      <ScrollView
          scrollY
          bounces={false}
          enableBackToTop
          lowerThreshold={500}
          onScrollToLower={this.handleReachBottom.bind(this)}
          style={{ height: this.getMainHeight() }}
          // ScrollView 不响应的问题：
          // https://stackoverflow.com/questions/39548664/react-native-scroll-view-not-scrolling
        >
          <View className='waterfall' onLayout={this._onLayout.bind(this)}>
            <View className='waterfall-col waterfall-col--left'>
            {
              listLeft.map(item => {
                return renderWaterfallBlock(item)
              })
            }
            </View>
            <View className='waterfall-col waterfall-col--right'>
            {
              listRight.map(item => {
                return renderWaterfallBlock(item)
              })
            }
            </View>
        </View>
      </ScrollView>
    )
  }
}
