import React, { useState, useEffect } from 'react';
import '../styles/namecard.scss'
import NameCard from './NameCard';
import Header from './Header';
import Draggable from 'react-draggable';
import axios from 'axios';
import { setUser, setPartner, findMatches, setLoading } from '../redux/actions';
import { connect } from 'react-redux';
const BASE_URL = 'http://localhost:4002';

function Deck(props) {
  const [names, setNames] = useState([]);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [direction, setDirection] = useState(null);

  function getNames() {
    console.log(props)
    axios
      .get(`${BASE_URL}/names/${props.gender}`)
      .then(allnames => {
        console.log(allnames);
        return setNames(allnames.data)
      })
      .then(status => {
        return props.setLoading(status = false)
      })
  }

  useEffect(() => getNames(), []);
  useEffect(() => {if(props.user.data.partnerId) props.setPartner(props.user)}, [])

  const swipe = (direction) => {
    if (direction === "right") {
      setDirection("right");
      //TODO set seen/liked/matched

    } else {
      setDirection("left");
    }
    setTimeout(() => {
      setIndex(index + 1);
      setDirection(null);
      setDragging(false);
    }, 400);
  };

  const handleDrag = (e, d) => {
    // swiping animations
    if (d.x > 100) {
      swipe("right");
    } else if (d.x < -100) {
      swipe("left");
    } else {
      setDragging(false);
    };






  };
  return (
    <>
      { !props.loading
        ?
        <Draggable
          onStart={() => { setDragging(true); }}
          onStop={handleDrag}
          key={index}
          position={dragging ? null : { x: 0, y: 0 }}
        >
          <div>
            <NameCard
              direction={direction}
              names={names}
              index={index}
               />
          </div>
        </Draggable>
        :
        //TODO add spinner
        'LOADING...'
      }
      <Header />
    </>
  )
}

const mapStateToProps = (state) => ({
  loading: state.loading,
  user: state.user,
  partner: state.partner,
  seenNames: state.seenNames,
  likedNames: state.likedNames,
  partnerLikedNames: state.partnerLikedNames,
  matches: state.mapDispatchToProps
})

const mapDispatchToProps = (dispatch) => ({
  setPartner: (partnerData) => dispatch(setPartner(partnerData)),
  setLoading: (status) => dispatch(setLoading(status))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Deck);
