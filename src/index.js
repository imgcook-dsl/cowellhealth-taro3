module.exports = function(schema, option) {
  const { _, prettier } = option;
  const width = option.responsive.width || 750;
  const rpx = width == 375 ? 2 : 1;

  console.log({width}, {rpx}, option.responsive.width)

  // imports
  const imports = [];

  // inline style
  const style = {};

  // Global Public Functions
  const utils = [];

  // Classes
  const classes = [];

  // 1vw = width / 100
  const _w = option.responsive.width / 100;

  const isExpression = (value) => {
    return /^\{\{.*\}\}$/.test(value);
  };

  const toString = (value) => {
    if ({}.toString.call(value) === '[object Function]') {
      return value.toString();
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, (key, value) => {
        if (typeof value === 'function') {
          return value.toString();
        } else {
          return value;
        }
      });
    }

    return String(value);
  };

  const generateLess = (schema) => {
    let strLess = '';

    function walk(json) {
      if (json.props.className) {
        let className = json.props.className;

        strLess += `.${className} {`;

        for (let key in style[className]) {
          // console.log(style[className])
          strLess += `${_.kebabCase(key)}: ${style[className][key]};\n`;
        }
      }

      if (json.children && json.children.length > 0) {
        json.children.forEach((child) => walk(child));
      }

      if (json.props.className) {
        strLess += '}';
      }
    }

    walk(schema);

    return strLess;
  };

  // convert to responsive unit, such as vw
  const parseStyle = (styles) => {
    for (let style in styles) {
      console.log(style, styles[style])
      // for (let key in styles[style]) {
        switch (style) {
          case 'fontSize':
          case 'marginTop':
          case 'marginBottom':
          case 'paddingTop':
          case 'paddingBottom':
          case 'height':
          case 'top':
          case 'bottom':
          case 'width':
          case 'maxWidth':
          case 'left':
          case 'right':
          case 'paddingRight':
          case 'paddingLeft':
          case 'marginLeft':
          case 'marginRight':
          case 'lineHeight':
          case 'borderBottomRightRadius':
          case 'borderBottomLeftRadius':
          case 'borderTopRightRadius':
          case 'borderTopLeftRadius':
          case 'borderRadius':
            // styles[style][key] = (parseInt(styles[style][key]) / _w).toFixed(2) + 'vw';
            console.log(rpx)
            styles[style] = rpx == 1 ? parseInt(styles[style]) + 'px' : (parseInt(styles[style]) * 2) + 'px';
            break;
        }
      // }
    }

    return styles;
  };

  // parse function, return params and content
  const parseFunction = (func) => {
    const funcString = func.toString();
    const params = funcString.match(/\([^\(\)]*\)/)[0].slice(1, -1);
    const content = funcString.slice(funcString.indexOf('{') + 1, funcString.lastIndexOf('}'));
    return {
      params,
      content,
    };
  };

  // parse layer props(static values or expression)
  const parseProps = (value, isReactNode) => {
    if (typeof value === 'string') {
      if (isExpression(value)) {
        if (isReactNode) {
          return value.slice(1, -1);
        } else {
          return value.slice(2, -2);
        }
      }

      if (isReactNode) {
        return value;
      } else {
        return `'${value}'`;
      }
    } else if (typeof value === 'function') {
      const { params, content } = parseFunction(value);
      return `(${params}) => {${content}}`;
    }
    return value
  };

  // parse async dataSource
  const parseDataSource = (data) => {
    const name = data.id;
    const { uri, method, params } = data.options;
    const action = data.type;
    let payload = {};

    switch (action) {
      case 'fetch':
        if (imports.indexOf(`import {fetch} from whatwg-fetch`) === -1) {
          imports.push(`import {fetch} from 'whatwg-fetch'`);
        }
        payload = {
          method: method,
        };

        break;
      case 'jsonp':
        if (imports.indexOf(`import {fetchJsonp} from fetch-jsonp`) === -1) {
          imports.push(`import jsonp from 'fetch-jsonp'`);
        }
        break;
    }

    Object.keys(data.options).forEach((key) => {
      if (['uri', 'method', 'params'].indexOf(key) === -1) {
        payload[key] = toString(data.options[key]);
      }
    });

    // params parse should in string template
    if (params) {
      payload = `${toString(payload).slice(0, -1)} ,body: ${isExpression(params) ? parseProps(params) : toString(params)}}`;
    } else {
      payload = toString(payload);
    }

    let result = `{
      ${action}(${parseProps(uri)}, ${toString(payload)})
        .then((response) => response.json())
    `;

    if (data.dataHandler) {
      const { params, content } = parseFunction(data.dataHandler);
      result += `.then((${params}) => {${content}})
        .catch((e) => {
          console.log('error', e);
        })
      `;
    }

    result += '}';

    return `${name}() ${result}`;
  };

  // parse condition: whether render the layer
  const parseCondition = (condition, render) => {
    if (typeof condition === 'boolean') {
      return `${condition} && ${render}`;
    } else if (typeof condition === 'string') {
      return `${condition.slice(2, -2)} && ${render}`;
    }
  };

  // parse loop render
  const parseLoop = (loop, loopArg, render) => {
    let data;
    let loopArgItem = (loopArg && loopArg[0]) || 'item';
    let loopArgIndex = (loopArg && loopArg[1]) || 'index';

    if (Array.isArray(loop)) {
      data = toString(loop);
    } else if (isExpression(loop)) {
      data = loop.slice(2, -2);
    }

    // add loop key
    const tagEnd = render.match(/^<.+?\s/)[0].length;
    render = `${render.slice(0, tagEnd)} key={${loopArgIndex}}${render.slice(tagEnd)}`;

    // remove `this`
    const re = new RegExp(`this.${loopArgItem}`, 'g');
    render = render.replace(re, loopArgItem);

    return `${data}.map((${loopArgItem}, ${loopArgIndex}) => {
      return (${render});
    })`;
  };

  // generate render xml
  const generateRender = (schema) => {
    const type = schema.componentName.toLowerCase();
    const className = schema.props && schema.props.className;
    const classString = className ? ` className={sty['${className}']}` : '';

    if (className) {
      style[className] = parseStyle(schema.props.style);
    }

    let xml;
    let props = '';

    Object.keys(schema.props).forEach((key) => {
      if (['className', 'style', 'text', 'src', 'lines'].indexOf(key) === -1) {
        props += ` ${key}={${parseProps(schema.props[key])}}`;
      }
    });

    switch (type) {
      case 'text':
        const innerText = parseProps(schema.props.text, true);
        xml = `<Text${classString}${props}>${innerText}</Text>`;
        break;
      case 'image':
        const source = parseProps(schema.props.src);
        xml = `<Image${classString}${props} src={${source}} />`;
        break;
      case 'div':
      case 'page':
      case 'block':
        if (schema.children && schema.children.length) {
          xml = `<View${classString}${props}>${transform(schema.children)}</View>`;
        } else {
          xml = `<View${classString}${props} />`;
        }
        break;
    }

    if (schema.loop) {
      xml = parseLoop(schema.loop, schema.loopArgs, xml);
    }
    if (schema.condition) {
      xml = parseCondition(schema.condition, xml);
    }
    if (schema.loop || schema.condition) {
      xml = `{${xml}}`;
    }

    return xml;
  };

  const myComponentName = schema.myComponentName || `${schema.componentName}${new Date().getTime()}`;

  // parse schema
  const transform = (schema) => {
    let result = '';

    if (Array.isArray(schema)) {
      schema.forEach((layer) => {
        result += transform(layer);
      });
    } else {
      const type = schema.componentName.toLowerCase();

      if (['page'].indexOf(type) !== -1) {
        // ??????????????????: state/method/dataSource/lifeCycle/render
        const states = [];
        const lifeCycles = [];
        const methods = [];
        const init = [];
        const render = [`render(){ return (`];
        let classData = [`export default class ${myComponentName} extends PureComponent {`];
        classData.push('@Inject(IndexService) indexService: IndexService;\n');
        if (schema.state) {
          states.push(`state = ${toString(schema.state)}\n`);
        }

        if (schema.methods) {
          Object.keys(schema.methods).forEach((name) => {
            const { params, content } = parseFunction(schema.methods[name]);
            methods.push(`${name}(${params}) {${content}}\n`);
          });
        }

        // if (schema.dataSource && Array.isArray(schema.dataSource.list)) {
        //   schema.dataSource.list.forEach((item) => {
        //     if (typeof item.isInit === 'boolean' && item.isInit) {
        //       init.push(`this.${item.id}();`);
        //     } else if (typeof item.isInit === 'string') {
        //       init.push(`if (${parseProps(item.isInit)}) { this.${item.id}(); }`);
        //     }
        //     methods.push(parseDataSource(item));
        //     methods.push('\n');
        //   });

        //   if (schema.dataSource.dataHandler) {
        //     const { params, content } = parseFunction(schema.dataSource.dataHandler);
        //     methods.push(`dataHandler(${params}) {${content}}`);
        //     init.push(`this.dataHandler()`);
        //   }
        // }

        if (schema.lifeCycles) {
          if (!schema.lifeCycles['_constructor']) {
            lifeCycles.push(`constructor(props, context) { super(); ${init.join('\n')}}\n`);
          }

          Object.keys(schema.lifeCycles).forEach((name) => {
            const { params, content } = parseFunction(schema.lifeCycles[name]);

            if (name === '_constructor') {
              lifeCycles.push(`constructor(${params}) { super(); ${content} ${init.join('\n')}}\n`);
            } else {
              lifeCycles.push(`${name}(${params}) {${content}}\n`);
            }
          });
        }

        render.push(generateRender(schema));
        render.push(`);}`);

        classData = classData
          .concat(states)
          .concat(lifeCycles)
          .concat(methods)
          .concat(render);
        classData.push('}');

        classes.push(classData.join('\n'));
      } else {
        result += generateRender(schema);
      }
    }

    return result;
  };

  // if (option.utils) {
  //   Object.keys(option.utils).forEach((name) => {
  //     utils.push(`const ${name} = ${option.utils[name]}`);
  //   });
  // }

  // start parse schema
  transform(schema);

  const prettierOpt = {
    parser: 'babel',
    printWidth: 120,
    singleQuote: true,
  };

  return {
    panelDisplay: [
      {
        panelName: `index.tsx`,
        panelValue: prettier.format(
          `
          import Taro from '@tarojs/taro'
          import React, { PureComponent } from 'react';
          import { View, Image, Text } from '@tarojs/components';
          import { Inject, posi, auth2 } from 'utils';
          ${imports.join('\n')}
          import { IndexService } from './index.service';
          import sty from './index.module.less';\n
          ${utils.join('\n')}\n
          ${classes.join('\n')}
        `,
          prettierOpt
        ),
        panelType: 'ts',
      },
      {
        panelName: `index.module.less`,
        panelValue: prettier.format(generateLess(schema), {
          parser: 'less',
        }),
        panelType: 'less',
      },
      {
        panelName: `index.config.ts`,
        panelValue: prettier.format(
          `export default {
          navigationBarTitleText: '',
          navigationBarTextStyle: 'black',
          backgroundTextStyle: 'light',
          backgroundColorTop: '#f5f5f5',
          backgroundColorBottom: '#f5f5f5',
          enableShareAppMessage: true
        }`,
          prettierOpt
        ),
        panelType: 'ts',
      },
      {
        panelName: `index.service.ts`,
        panelValue: prettier.format(
          `import { Injectable, http } from 'utils';
          \n
          @Injectable()
          export class IndexService {}
          `,
          prettierOpt
        ),
        panelType: 'ts',
      },
    ],
    noTemplate: true,
  };
};
