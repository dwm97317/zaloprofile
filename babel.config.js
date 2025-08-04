module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // 针对移动端和较老的 JavaScript 引擎
        targets: {
          browsers: [
            'Android >= 5',
            'iOS >= 9.3',
            'Chrome >= 49',
            'Safari >= 9.1',
            'Samsung >= 5'
          ]
        },
        // 确保兼容性
        useBuiltIns: 'entry',
        corejs: 3,
        // 避免使用可能不兼容的语法
        exclude: [
          'transform-async-generator-functions',
          'transform-for-of'
        ]
      }
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic'
      }
    ]
  ],
  plugins: [
    // 确保 async/await 正确转换
    '@babel/plugin-transform-async-to-generator',
    // 使用新的插件名称
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-class-properties', { loose: true }]
  ],
  // 针对不同环境的配置
  env: {
    development: {
      plugins: [
        // 开发环境下的热重载支持
        'react-refresh/babel'
      ]
    }
  }
};
