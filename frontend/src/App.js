import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import getIcons from "./icons";

//components
import Navbar from "./components/Navbar.component";
import Footer from "./components/Footer.component";
//views
import Landing from "./views/Landing.view";
import Galeria from "./views/Galeria.view";
import Detail from "./views/Detail.view";
import Mint from "./views/mintNft.view";
import MisNfts from "./views/MisTokens.view";
import AuctionGaleria from "./views/AuctionGaleria.view";
import Auction from "./views/auction.view";
import SendAuction from "./views/SendAuction.view";
import Perfil from "./views/Perfil.view";

import notFound from "./views/notFound.view";

//este hoc nos regresa el componente que le mandamos si tiene instalado metamask
//import MetamaskProtectedRoute from "./HOCS/MetamaskProtectedRoute.hoc";
import BlockchainProtectedRoute from "./HOCS/BlockchainProtectedRoute.hoc";
const { create } = require("ipfs-http-client");

//instancia de ipfs
window.ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});
const iconList = getIcons();
const blockListArr = [];

Object.entries(iconList).forEach(([type, icons]) => {
  Object.keys(icons).map((name) => blockListArr.push(`${name},${type}`));
});

/* const themeList = [
  "indigo",
  "yellow",
  "red",
  "purple",
  "pink",
  "blue",
  "green",
]; */

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      darkMode: false,
      theme: "yellow",
    };
  }
    
  render() {
    return (
      <>
        <Router>
          <Navbar theme={this.state.theme} />
          <Switch>
            <Route exact path="/" component={Landing} />
            <BlockchainProtectedRoute path="/minar" component={Mint} />
            <Route path="/galeria" component={Galeria} />
            <Route path="/perfil/:tokenid" component={Perfil} />
            <Route path="/auctions" component={AuctionGaleria} />
            <Route path="/auction/:tokenid" component={Auction} />
            <BlockchainProtectedRoute path="/sendauction/:tokenid" component={SendAuction} />
            <Route path="/detail/:tokenid" component={Detail}/>
            <BlockchainProtectedRoute path="/mis_nfts" component={MisNfts} />
            <Route component={notFound} />
          </Switch>
          <Footer theme={this.state.theme} />
        </Router>
      </>
    );
  }
}

export default App;
