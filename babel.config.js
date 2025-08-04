module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // 使用 package.json 中的 browserslist 配置
        useBuiltIns: 'entry',
        corejs: 3,
        // 明确包含必要的转换以支持现代语法
        include: [
          'proposal-async-generator-functions'
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
