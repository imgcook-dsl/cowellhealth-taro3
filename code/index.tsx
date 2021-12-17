import Taro from '@tarojs/taro';
import React, { PureComponent } from 'react';
import { View, Image, Text } from '@tarojs/components';

import { IndexService } from './index.service';
import sty from './index.module';

const print = function(value) {
  console.log(value);
};

export default class Page1639733986765 extends PureComponent {
  @Inject(IndexService) indexService: IndexService;

  state = {
    data: [
      {
        title: '小户型卫浴怎样才能装得高大上？',
        coverImage: 'https://img.alicdn.com/tfs/TB1Txq6o7T2gK0jSZFkXXcIQFXa-684-684.png',
        readCount: 200,
        user: { userImage: 'https://img.alicdn.com/tfs/TB1DWe6oYj1gK0jSZFOXXc7GpXa-60-60.png', userName: '时尚家居' },
        url: 'https://www.imgcook.com'
      },
      {
        title: '拥有超多功能的40平米简约小公寓了解一下',
        coverImage: 'https://img.alicdn.com/tfs/TB1XRQTo7P2gK0jSZPxXXacQpXa-684-648.png',
        readCount: 500,
        user: {
          userImage: 'https://img.alicdn.com/tfs/TB1DWe6oYj1gK0jSZFOXXc7GpXa-60-60.png',
          userName: '花花设计工作'
        },
        url: 'https://www.imgcook.com/docs'
      }
    ]
  };

  constructor(props, context) {
    super();
    console.log('super props');
  }

  componentDidUpdate(prevProps, prevState, snapshot) {}

  isReadCountShow(readCount) {
    return readCount > 300;
  }

  render() {
    return (
      <View className={sty['box']}>
        {this.state.data.map((item, index) => {
          return (
            <View
              key={index}
              onClick={e => {
                window.open(item.url, '_blank');
              }}
              data-url={item.url}
              key={item.index}
            >
              <View className={sty['bd']}>
                <Image
                  className={sty['layer']}
                  src={'https://img.alicdn.com/tfs/TB1bLoWoYH1gK0jSZFwXXc7aXXa-684-684.png'}
                />
                <Image className={sty['bg']} src={item.coverImage} />
                <View className={sty['wrap']}>
                  <Image
                    className={sty['riverdinwei']}
                    src={'https://img.alicdn.com/tfs/TB1mtZRoVT7gK0jSZFpXXaTkpXa-28-36.png'}
                  />
                  <Text className={sty['distance']}>距离500m</Text>
                </View>
              </View>
              <View className={sty['main']}>
                <Text className={sty['title']}>{item.title}</Text>
              </View>
              <View className={sty['ft']}>
                <View className={sty['block']}>
                  <Image
                    className={sty['xianjin']}
                    src={'https://img.alicdn.com/tfs/TB1OvsYoW61gK0jSZFlXXXDKFXa-60-60.png'}
                  />
                  <Text className={sty['fashionHome']}>{item.user.userName}</Text>
                </View>
                {this.isReadCountShow(item.readCount) && (
                  <View className={sty['group']}>
                    <Image
                      className={sty['favorite']}
                      src={'https://img.alicdn.com/tfs/TB1arwYo7T2gK0jSZFkXXcIQFXa-46-44.png'}
                    />
                    <Text className={sty['num']}>{item.readCount}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  }
}
