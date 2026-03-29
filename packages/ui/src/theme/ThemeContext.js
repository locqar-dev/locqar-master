import React, { createContext, useContext } from 'react';
import { defaultTheme } from './adapter.js';

var UIThemeContext = createContext(null);

export function UIThemeProvider({ theme, children }) {
  return React.createElement(UIThemeContext.Provider, { value: theme }, children);
}

// Components call this to resolve theme: prop > context > default
export function useResolvedTheme(propTheme) {
  var ctx = useContext(UIThemeContext);
  return propTheme || ctx || defaultTheme;
}

export default UIThemeContext;
