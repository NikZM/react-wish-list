import React from 'react';
import './App.scss';
import { WishList } from './components/wish-list.component';
import { AppBar, Toolbar, Typography } from '@mui/material';

class App extends React.Component {

  render() {
    return (
      <div className="App">
          <AppBar position="sticky">
            <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
              <Typography variant="h5" color="inherit" noWrap>
                Wish List
              </Typography>
            </Toolbar>
          </AppBar>
        <WishList></WishList>
      </div>
    );
  }
}

export default App;
