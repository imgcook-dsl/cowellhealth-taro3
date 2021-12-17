import Taro from '@tarojs/taro';
import React, { PureComponent } from 'react';
import { View, Image, Text } from '@tarojs/components';
import { Inject, posi, auth2 } from 'utils';

import { IndexService } from './index.service';
import sty from './index.module.less';

export default class Page1639736333355 extends PureComponent {
  @Inject(IndexService) indexService: IndexService;

  render() {
    return (
      <View className={sty['page']}>
        <View className={sty['my-page-wrap']}>
          <View className={sty['activity-list']}>
            <View className={sty['activity-item']}>
              <View className={sty['time-box']}>
                <Text className={sty['left-txt']} lines={1}>
                  明天
                </Text>
                <Text className={sty['time']} lines={1}>
                  00:00:00
                </Text>
                <Text className={sty['right-txt']} lines={1}>
                  开始
                </Text>
              </View>
              <View className={sty['banner']}>
                <Image
                  className={sty['activity-bg']}
                  src={'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/c78d8ad05cb911ec8289c5c5d5470730.png'}
                />
                <View className={sty['bg']}>
                  <View className={sty['lab']}>
                    <Text className={sty['txt']} lines={1}>
                      已订阅
                    </Text>
                  </View>
                </View>
              </View>
              <View className={sty['banner']}>
                <Image
                  className={sty['activity-bg']}
                  src={'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/c6f4cd405cb911ecb17a9d61965c76fc.png'}
                />
                <View className={sty['bg']}>
                  <View className={sty['lab']}>
                    <Text className={sty['txt']} lines={1}>
                      已订阅
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View className={sty['activity-item']}>
              <View className={sty['time-box']}>
                <Text className={sty['left-txt']} lines={1}>
                  明天
                </Text>
                <Text className={sty['time']} lines={1}>
                  00:00:00
                </Text>
                <Text className={sty['right-txt']} lines={1}>
                  开始
                </Text>
              </View>
              <View className={sty['banner']}>
                <Image
                  className={sty['activity-bg']}
                  src={'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/c66adcc05cb911ecb4a683cf9568e979.png'}
                />
                <View className={sty['bg']}>
                  <View className={sty['lab']}>
                    <Text className={sty['txt']} lines={1}>
                      已订阅
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View className={sty['tips']}>
            <Text className={sty['tips-txt']} lines={1}>
              更多惊喜，请到店咨询～
            </Text>
          </View>
        </View>
      </View>
    );
  }
}
