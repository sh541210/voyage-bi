module.exports = {
  content: [
    './src/pages/**/*.tsx',
    './src/components/**/*.tsx',
    './src/layouts/**/*.tsx',
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      boxShadow: {
        sticky: '0 0.5px 0 rgb(229 231 235 / var(--tw-border-opacity)), 0 -1px 0 rgb(229 231 235 / var(--tw-border-opacity))',
        'sticky-dark': '0 0.5px 0 rgb(48 48 48 / var(--tw-border-opacity)), 0 -1px 0 rgb(48 48 48 / var(--tw-border-opacity))'
      },
      colors: {
        // echartDark: 'rgb(15,12,40)',
        antdDarkContainer: 'rgb(20, 20, 20)',
        antdDarkColorFill: 'rgba(255, 255, 255, 0.18)',
        antdDarkColorFillSecondary: 'rgba(255, 255, 255, 0.12)',
        antdDarkColorFillTertiary: 'rgba(255, 255, 255, 0.08)',
        antdDarkColorFillQuaternary: 'rgba(255, 255, 255, 0.04)',
        antdDarkBorder: 'rgb(48, 48, 48)',
        primaryColor: '#4A5FDF',
        antdColorBgLayout: 'rgb(245, 245, 245)',
        antdColorFillSecondary: 'rgba(0, 0, 0, 0.06)',
        antdColorTextTertiary: 'rgba(0, 0, 0, 0.45)',
        antdColorTextSecondary: 'rgba(0, 0, 0, 0.65)',
        antdColorBorder: 'rgb(217, 217, 217)',
        reactColor: 'rgb(9,126,164)',
        echartsColor: 'rgb(228,57,97)'
      }
    }
  }
}
