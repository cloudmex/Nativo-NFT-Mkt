/* global BigInt */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useParams, useHistory } from "react-router-dom";
// import { Helmet } from "react-helmet";
import { isNearReady } from "../utils/near_interaction";
import { nearSignIn } from "../utils/near_interaction";
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import {
  syncNets,
  getSelectedAccount,
  getContract,
  fromWEItoEth,
  fromETHtoWei,
} from "../utils/blockchain_interaction";
import { currencys } from "../utils/constraint";
import {
  fromNearToYocto,
  fromYoctoToNear,
  getNearAccount,
  getNearContract,
} from "../utils/near_interaction";
import Modal from "../components/modal.component";
import flechaiz from '../assets/landingSlider/img/flechaIz.png'
import ReactHashtag from "react-hashtag";
import OfferModal from "../components/offerModal.component";

function LightEcommerceB(props) {
  //guarda el estado de  toda la vista
  const [state, setstate] = useState();
  const [btn, setbtn] = useState(true);
  //guarda el estado de el modal
  const [modal, setModal] = React.useState({
    show: false,
  });
  //Esta logeado
  const [stateLogin, setStateLogin] = useState(false);
  //es el parametro de tokenid
  const { data } = useParams();
  //es el historial de busqueda
  //let history = useHistory();
  const APIURL = 'https://api.thegraph.com/subgraphs/name/luisdaniel2166/nativojson'
  React.useEffect(() => {
    (async () => {
      setStateLogin(await isNearReady());
      let ownerAccount = await getNearAccount();
 

      let totalSupply;

      if (localStorage.getItem("blockchain") == "0") {
        //primero nos aseguramos de que la red de nuestro combo sea igual a la que esta en metamask
        // await syncNets();

        // //obtener cuantos tokens tiene el contrato
        // totalSupply = await getContract().methods.totalSupply().call();

        // //si es mayor que el total de tokens
        // if (parseInt(tokenid) >= parseInt(totalSupply)) {
        //   window.location.href = "/galeria";
        // } else {
        //   //obtener los datos del token que se queire
        //   let toks = await getContract().methods.tokensData(tokenid).call();
        //   toks.price = fromWEItoEth(toks.price);
        //   //obtener el dueño del contrato
        //   let owner = await getContract().methods.ownerOf(tokenid).call();
        //   //agregar el dueño y los datos del token
        //   //console.log(JSON.parse(toks.data));
        //   setstate({
        //     ...state,
        //     tokens: toks,
        //     jdata: JSON.parse(toks.data),
        //     owner,
        //   });
        //   //console.log(toks.data);
        // }
      } else {
        //Funciones y variables necesarias para the graph
        let info = data.split(":");
        let toksData
        const queryData = `
          query($tokenId: String, $collectionID: String){
            tokens(where: {tokenId: $tokenId, collectionID: $collectionID}) {
              id
              collection
              collectionID
              contract
              tokenId
              owner_id
              title
              description
              media
              creator
              price
              status
              adressbidder
              highestbidder
              lowestbidder
              expires_at
              starts_at
              extra
            }
          }
        `
        //Declaramos el cliente
        const client = new ApolloClient({
          uri: APIURL,
          cache: new InMemoryCache(),
        })

        await client
          .query({
            query: gql(queryData),
            variables: {
              tokenId: info[0],
              collectionID: info[1],
            }
          })
          .then((data) => {
            console.log("tokens data: ", data.data.tokens[0])
            toksData = data.data.tokens[0]
          })
          .catch((err) => {
            console.log('Error ferching data: ', err)
          })

        /* Retrieve offers on this token*/
        let toknOffersData;
        const queryDataOffers = `
          query($tokenId: Int, $collectionID: Int){
            offers(orderBy: offerID, where: {tokenId: $tokenId, collectionID: $collectionID}, orderDirection: desc) {
              offerID
              tokenId
              contract
              price
              collectionID
              owner_id
            }
          }
        `
        //Declaramos el cliente
        const Offers = new ApolloClient({
          uri: APIURL,
          cache: new InMemoryCache(),
        })

        await Offers
          .query({
            query: gql(queryDataOffers),
            variables: {
              tokenId: parseInt(info[0]),
              collectionID: parseInt(info[1])
            }
          })
          .then((data) => {
            console.log("offer tokens: ", data.data.offers)
            toknOffersData = data.data.offers

          })
          .catch((err) => {
            console.log('Error ferching data: ', err)
          })
 


        //instanciar contracto
        let contract = await getNearContract();
        // totalSupply = await contract.nft_total_supply();
        //console.log(totalSupply);

        //si es mayor que el total de tokens
        // if (parseInt(tokenid) >= parseInt(totalSupply)) {
        //   window.location.href = "/galeria";
        // } else {
        // let toks = await contract.get_token({ token_id: tokenid });
        // //console.log("Token")
        // //console.log(toks)
        // if(toks.on_auction){
        //   window.location.href = "/auction/"+tokenid;
        // }
        let saleState
        if (toksData.status != 'S') {
          saleState = false
        }
        else {
          saleState = true
        }
        setbtn(!saleState);
        // console.log({
        //   tokenID: toks.token_id,
        //   onSale: toks.metadata.on_sale,
        //   price: toks.metadata.price,
        //   culture:toks.metadata.culture,
        //   country:toks.metadata.country,
        //   creator:toks.metadata.creator,
        // });

        let extra = toksData.extra.split(":")
        setstate({
          ...state,
          tokens: {
            tokenID: toksData.tokenId,
            //chunk: parseInt(toks.token_id/2400),
            onSale: saleState,
            price: fromYoctoToNear(toksData.price),
            contract: toksData.contract,
            collection: toksData.collection,
            collectionID: toksData.collectionID,
            addressbidder: toksData.adressbidder, //default value accountbidder
            highestbidder: toksData.highestbidder, //default value notienealtos
            lowestbidder: toksData.lowestbidder, //default value notienebajos
            // culture:toks.culture,
            // country:toks.country,
            // creator:toks.metadata.creator,
          },
          jdata: {
            image: toksData.media,
            title: toksData.title,
            description: toksData.description,
            tags: extra[0].split(' '),
            creator: toksData.creator,
            collection: toksData.collection,
            contract: toksData.contract,
            collectionID: toksData.collectionID
          },
          owner: toksData.owner_id,
          ownerAccount: ownerAccount,
          toknOffersData: toknOffersData
        });
        //console.log("state", state)



      }
    })();
  }, []);

  async function manageOffer(option){

    
      //get contract
      let contract = await getNearContract();
      //construct payload
      let payload = {
        address_contract: state.tokens.contract,
        token_id: state.tokens.tokenID,
        collection_id: state.tokens.collectionID,
        collection: state.tokens.collection,
        status: Boolean(option) //true or false to  decline offer 
      }

      let amount = BigInt(state.tokens.highestbidder);
      let bigAmount = BigInt(amount);

      //accept the offer
      let toks = await contract.market_close_bid_generic(
        payload,
        300000000000000,
        fromNearToYocto(0.05)
      );
  }

  async function comprar() {
    //evitar doble compra
    setstate({ ...state, btnDisabled: true });
    let account, toks;
    if (localStorage.getItem("blockchain") == "0") {
      //primero nos aseguramos de que la red de nuestro combo sea igual a la que esta en metamask
      await syncNets();
      //la cuenta a la cual mandaremos el token
      account = await getSelectedAccount();
    } else {
      account = await getNearAccount();
    }

    //si el dueño intenta comprar un token le decimos que no lo puede comprar
    if (state.owner.toUpperCase() === account.toUpperCase()) {
      setModal({
        show: true,
        title: "Error",
        message: "El dueño del token no puede recomparlo",
        loading: false,
        disabled: false,
        change: setModal,
      });
      //desbloquear el boton
      setstate({ ...state, btnDisabled: false });
      return;
    }

    //modal de espera
    setModal({
      show: true,
      title: "cargando",
      message: "hola como estas",
      loading: true,
      disabled: true,
      change: setModal,
    });

    if (localStorage.getItem("blockchain") == "0") {
      //llamar el metodo de comprar
      toks = await getContract()
        .methods.comprarNft(state.tokens.tokenID)
        .send({
          from: account,
          value: fromETHtoWei(Number(state.tokens.price)),
        })
        .catch((err) => {
          return err;
        });
    } else {

      let amount = parseFloat(state.tokens.price);
      //console.log("amount", amount)

      //instanciar contracto
      let contract = await getNearContract();
      //obtener tokens a la venta
      toks = await contract.market_buy_generic(
        {
          address_contract: state.tokens.contract,
          token_id: state.tokens.tokenID,
          collection: state.tokens.collection,
          collection_id: state.tokens.collectionID
        },
        300000000000000,
        fromNearToYocto(amount)
      );

      //console.log(toks);
    }

    //si status esta undefined o falso le mandamos el modal de error
    if (!toks.status) {
      setModal({
        show: true,
        title: "Error",
        message: "intentalo de nuevo",
        loading: false,
        disabled: false,
        change: setModal,
      });
      //desbloquear el boton
      setstate({ ...state, btnDisabled: false });
    } else {
      setModal({
        show: true,
        title: "exito",
        message: "token comprado con exito",
        loading: false,
        disabled: false,
        change: setModal,
      });
      //desbloquear el boton
      setstate({ ...state, btnDisabled: false });
    }
  }

  async function makeAnOffer() {
    setOfferModal({
      ...state,
      show: true,
      title: "Hacer una oferta",
      message: "Haz una oferta atractiva para obtener este token",
      loading: false,
      disabled: false,
      change: setOfferModal,
      buttonName: 'X',
      tokenId: 'hardcoded'
    })
  }


  //setting state for the offer modal
  const [offerModal, setOfferModal] = useState({
    show: false,
  });
  return (
    <>
      <section className="text-gray-600 body-font overflow-hidden">
        <div className="container px-5 py-8 mx-auto">
          <div
            className="regresar"
          >
            <a href={'/collection/' + state?.jdata.collectionID} >
              <img
                className="hover:cursor-pointer h-[50px] "
                src={flechaiz}
              />
            </a>
          </div>
          <div className="lg:w-4/5 mx-auto flex flex-wrap">
            <img
              alt="ecommerce"
              className="lg:w-1/2 w-full lg:h-auto h-64 object-fill  object-fill md:object-scale-down  rounded"
              src={`https://ipfs.io/ipfs/${state?.jdata.image}`}
            />
            <div className="lg:w-1/2 w-full lg:pl-10 lg:mt-0">

              <h1 className="text-gray-900 text-3xl title-font font-medium mb-1 mb-6">
                {state?.jdata.title}
              </h1>
              <p className="leading-relaxed mt-2 mb-6 font-mono ">
                {state?.jdata.description}
              </p>

              <div
                className={`flex border-l-4 border-${props.theme}-500 py-2 px-2 my-2 bg-gray-50`}
              >
                <span className="text-gray-500">Colección</span>
                <span className="ml-auto text-gray-900">
                  <span
                    className={`transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 inline-flex items-center justify-center px-2 py-1 text-sm font-bold leading-none text-white bg-yellow-500 rounded-full`}
                  >
                    <a href={'/collection/' + state?.jdata.collectionID}>{state?.jdata.collection}</a>
                  </span>
                </span>
              </div>

              <div
                className={`flex border-l-4 border-${props.theme}-500 py-2 px-2 my-2 bg-gray-50`}
              >
                <span className="text-gray-500">TokenId</span>
                <span className="ml-auto text-gray-900">
                  {state?.tokens.tokenID}
                </span>
              </div>

              <div
                className={`flex border-l-4 border-${props.theme}-500 py-2 px-2 my-2 bg-gray-50`}
              >
                <span className="text-gray-500">En venta</span>
                <span className="ml-auto text-gray-900">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-1  text-xs font-bold leading-none ${state?.tokens.onSale
                      ? "text-green-100 bg-green-500"
                      : "text-red-100 bg-red-500"
                      } rounded-full`}
                  >
                    {state?.tokens.onSale ? "Disponible" : "No disponible"}
                  </span>
                </span>
              </div>
              <div
                className={`flex border-l-4 border-${props.theme}-500 py-2 px-2 my-2 bg-gray-50`}
              >
                <span className="text-gray-500">Tags</span>
                <span className="ml-auto text-gray-900">
                  {
                    state?.jdata.tags.length > 0 ?
                      state?.jdata.tags.map((element) =>
                        <span
                          key={element}
                          className={`inline-flex items-center justify-center px-2 py-1 ml-2 text-xs font-bold leading-none ${state?.jdata.tags
                            ? "text-green-100 bg-green-500"
                            : "text-red-100 bg-red-500"
                            } rounded-full`}
                        >
                          {element}
                        </span>
                      ) : null
                  }

                </span>
              </div>



              <div
                className={`flex border-l-4 border-${props.theme}-500 py-2 px-2 my-2 bg-gray-50`}
              >
                <span className="text-gray-500">Propietario</span>
                <span className="ml-auto text-gray-900 text-xs self-center">
                  {state?.owner}
                </span>
              </div>

              <div
                className={`flex border-l-4 border-${props.theme}-500 py-2 px-2 bg-gray-50`}
              >
                <span className="text-gray-500">Creador</span>
                <span className="ml-auto text-gray-900 text-xs self-center">
                  {state?.jdata.creator}
                </span>
              </div>

              <div
                className={`flex border-l-4 border-${props.theme}-500 py-2 px-2 my-2 bg-gray-50`}
              >
                <span className="text-gray-500">Contrato</span>
                <span className="ml-auto text-gray-900 text-xs">
                  {state?.jdata.contract}
                </span>
              </div>




              <meta property="og:url" content={`https://develop.nativonft.app/detail/${state?.tokens.tokenID}`} />
              <meta property="og:type" content="article" />
              <meta property="og:title" content={`${state?.jdata.title}`} />
              <meta property="og:description" content={`${state?.jdata.description}`} />
              <meta property="og:image" content={`https://ipfs.io/ipfs/${state?.jdata.image}`} />

              <div className="flex mt-6 items-center pb-5 border-b-2 border-gray-100 mb-5"></div>
              <div className="flex flex-col">
                <span className="title-font font-medium text-2xl text-gray-900 text-center w-full">
                  {
                    btn ?
                      ""
                      :
                      "$ " + state?.tokens.price + " " + currencys[parseInt(localStorage.getItem("blockchain"))]
                  }
                </span>
                {stateLogin ?
                  btn ?
                    ""
                    :
                    <div className="flex flex-row flex-wrap justify-around mt-3 text-center">
                      <button
                        className={`w-full m-2 lg:w-40 content-center justify-center text-center font-bold text-white bg-${props.theme}-500 border-0 py-2 px-6 focus:outline-none hover:bg-yellow-600 rounded`}
                        disabled={btn}
                        onClick={async () => {
                          comprar();
                        }}
                      >
                        Comprar
                      </button>
                      {state?.owner != state?.ownerAccount ?
                        <button
                          className={`w-full m-2 lg:w-40 justify-center flex  text-center font-bold text-${props.theme}-500 bg-white-500 border-2 border-${props.theme}-500 py-2 px-6  hover:text-white hover:bg-yellow-500 border-0 rounded`}
                          disabled={btn}
                          onClick={async () => {
                            makeAnOffer();
                          }}
                        >
                          Ofertar
                        </button>
                        : "" }
                    </div>
                  :
                  <button
                    className={`flex ml-auto mt-2 text-white bg-${props.theme}-500 border-0 py-2 px-6 focus:outline-none hover:bg-${props.theme}-600 rounded`}
                    style={
                      btn
                        ?
                        { width: "100%", justifyContent: "center" }
                        :
                        {}
                    }
                    // disabled={state?.tokens.onSale}
                    onClick={async () => {
                      nearSignIn(window.location.href);
                    }}
                  >
                    Iniciar Sesión para Comprar
                  </button>
                }
              </div>
            </div>

            {//CURRENT OFFER TO i 
            state  && state.tokens && state.tokens.addressbidder != 'accountbidder' &&  state.tokens.highestbidder != "notienealtos" ?
            <div className="w-full">
              <div className="w-full border-4 rounded-lg border-[#eab308] border-white-500 mt-10">
                <div className="text-center p-2 bg-[#eab308] text-white font-bold text-xl">Oferta Actual</div>
                <div className="w-full flex flex-row py-1 justify-between text-gray-500 bg-gray-50">
                  <div className="w-6/12 md:w-4/12 text-center  text-lg font-bold text-gray-500">Ofertante</div>
                  <div className="w-6/12 md:w-4/12 text-center  text-lg font-bold text-gray-500">Precio</div>
                  <div className="w-0 md:w-4/12 text-center  text-lg font-bold text-gray-500"></div>
                </div>
                  <div className=" w-full h-[75px] md:h-[50px] overscroll-none">
                    <div className={`w-full flex flex-row  flex-wrap justify-around md:justify-between py-2 border-b-4 border-gray-50`}>
                      <div className="w-4/12 text-center text-gray-500">{state?.tokens.addressbidder}</div>
                      <div className="w-4/12 text-center text-gray-500">{state?.tokens.highestbidder ? fromYoctoToNear(state?.tokens.highestbidder) : ""} NEAR</div>
                      <div className="w-full md:w-4/12 text-center text-gray-500 flex justify-around">
                        { state.owner == state.ownerAccount ? 
                        <button
                          disabled={btn}
                          onClick={async () => {
                            manageOffer(true);
                          }}
                        >
                          <span
                            className={`inline-flex items-center justify-center px-6 py-2  text-xs font-bold leading-none  text-green-100 bg-green-500 rounded-full`}
                          >
                            Aceptar
                          </span>
                        </button> : ""
                        }
                        { state.owner == state.ownerAccount || state.ownerAccount == state.tokens.addressbidder ? 
                        <button
                          disabled={btn}
                          onClick={async () => {
                            manageOffer(false);
                          }}
                        >
                          <span
                            className={`inline-flex items-center justify-center px-6 py-2  text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full` } 
                          >
                            Declinar
                          </span>
                        </button> : ""
                          }
                      </div>
                    </div>
                  </div>
              </div>
            </div>
            : ""
            }
            {state && state.toknOffersData != 0 ?
              <div className="w-full border-4 rounded-lg border-[#eab308] border-white-500 mt-10">
                <div className="text-center p-2 bg-[#eab308] text-white font-bold text-xl">Ofertas Realizadas</div>
                <div className="w-full flex flex-row py-1 justify-between text-gray-500 bg-gray-50">
                  <div className="w-4/12 text-center  text-lg font-bold text-gray-500">Ofertante</div>
                  <div className="w-4/12 text-center  text-lg font-bold text-gray-500">Precio</div>
                </div>
                <div className="h-[250px] overflow-scroll">
                  {state?.toknOffersData.map((offer, i) => {
                    return (
                      <div key={i} className={`w-full flex flex-row justify-between py-2 border-b-4 border-gray-50`}>
                        <div className="w-4/12 text-center text-gray-500">{offer.owner_id}</div>
                        <div className="w-4/12 text-center text-gray-500">{fromYoctoToNear(offer.price)} NEAR</div>
                      </div>
                    );
                  })
                  }
                </div>
              </div>
              : ""
            }
          </div>


        </div>
        <Modal {...modal} />
        <OfferModal {...offerModal}  />
      </section>
    </>
  );
}

LightEcommerceB.defaultProps = {
  theme: "yellow",
};

LightEcommerceB.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default LightEcommerceB;
