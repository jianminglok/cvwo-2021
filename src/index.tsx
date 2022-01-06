import * as React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import theme from './theme';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./app/store"

ReactDOM.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <Provider store={store}>
      <React.StrictMode>
        <Router>
          <App />
        </Router>
      </React.StrictMode>
    </Provider>
  </ThemeProvider>,
  document.querySelector('#root'),
);
