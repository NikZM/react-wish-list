import React from 'react';
import logo from './logo.svg';
import './App.scss';
import { WishList } from './components/wish-list.component';
import { AppBar, Slide, Toolbar, Typography, useScrollTrigger } from '@mui/material';

class App extends React.Component {

  render() {
    return (
      <div className="App">
        <HideOnScroll {...this.props}>
          <AppBar position="relative">
            <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
              <Typography variant="h6" color="inherit" noWrap>
                Wish List
              </Typography>
            </Toolbar>
          </AppBar>
        </HideOnScroll>
        <WishList></WishList>
      </div>
    );
  }
}
function HideOnScroll(props: any) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}
export default App;
