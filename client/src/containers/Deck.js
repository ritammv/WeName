import React, { useState, useEffect, useCallback } from 'react';
import '../styles/namecard.scss';
import '../styles/game.scss';
import NameCard from '../components/NameCard';
import Header from '../components/Header';
import Draggable from 'react-draggable';
import { IconButton } from '@material-ui/core';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import Snack from '../components/Snack';
import * as apiclient from '../services/apiclient';

import {
  setPartner,
  setMatches,
  setLoading,
  getLikedNames,
  getPartnerLikedNames,
} from '../redux/actions';
import { connect } from 'react-redux';

function Deck({ user, partner, partnerLikedNames, loading, setPartner, setLoading, setMatches, getPartnerLikedNames, gender }) {
  const [names, setNames] = useState([]);
  const [seen, setSeen] = useState([]);
  const [liked, setLiked] = useState([]);

  const [newMatch, setNewMatch] = useState(false);

  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [direction, setDirection] = useState(null);

  let filteredNames = filterNames();


  function filterNames() {
    if (names.length && seen.length) {
      const results = names.filter(({ id: id1 }) => !seen.some(({ id: id2 }) => id2 === id1));
      return results;
    } else {
      return names;
    }
  }

const startGame = useCallback(() => {
  apiclient.getNames(gender, setNames, setLoading);
  apiclient.seenNames(user.id, setSeen);
  apiclient.likedNames(user.id, setLiked);
  if (partner) {
    setPartner(user);
    getPartnerLikedNames(user.partnerId);
  };
}, [gender, getPartnerLikedNames, partner, setLoading, setPartner, user]) 

  useEffect(() => {
    startGame()
  }, []);

  // with every new update of liked names, this will run and update matched names
  useEffect(() => {
    if (liked.length && partnerLikedNames.length) {
      const result = liked.filter(({ id: id1 }) => partnerLikedNames.some(({ id: id2 }) => id2 === id1));
      setMatches(result);
    }
  }, [liked, partnerLikedNames, setMatches])

  const swipe = (direction) => {
    if (direction === "right") {
      setDirection("right");

      apiclient.postSeenNames(user.id, filteredNames[index].id);
      setSeen(prev => [...prev, filteredNames[index]]);

      apiclient.postLikedNames(user.id, filteredNames[index].id)
      setLiked(prev => [...prev, filteredNames[index]]);

      const nameArray = partnerLikedNames.map(obj => (obj.name));
      if (nameArray.includes(filteredNames[index].name)) {
        setNewMatch(status => status = true);
      }

    } else {
      setDirection("left");
      apiclient.postSeenNames(user.id, filteredNames[index].id);
      setSeen(prev => [...prev, filteredNames[index]]);
    }

    setTimeout(() => {
      setIndex(index + 1);
      setDirection(null);
      setDragging(false);
    }, 400);
  };

  const handleDrag = (e, d) => {
    // swiping animations
    if (d.x > 50) {
      swipe("right");
    } else if (d.x < -50) {
      swipe("left");
    } else {
      setDragging(false);
    };
  };

  function handleClose(_, reason) {
    if (reason === 'clickaway') return;
    setNewMatch(status => status = false)
  };

  return (
    <>
      { !loading
        ?
        <div>
          <div className='deck' style={{
            height: '80%',
            width: '100%',
            overflow: 'hidden'
          }}>
            <Draggable
              onStart={() => { setDragging(true); }}
              onStop={handleDrag}
              key={index}
              position={dragging ? null : { x: 0, y: 0 }}
            >
              <div>
                <NameCard
                  direction={direction}
                  names={filteredNames}
                  index={index}
                  click={swipe}
                />
              </div>
            </Draggable>
            
            <div className='card-buttons'>
              <IconButton
                onClick={() => swipe('right')}
                className='card-button'>
                <ThumbUpIcon className='card-icon' />
              </IconButton>
              <IconButton
                onClick={() => swipe('left')}
                className='card-button'>
                <ThumbDownIcon className='card-icon' />
              </IconButton>
            </div>

          </div>
          <Snack open={newMatch} onClose={handleClose}/>
        </div>

        :
        //TODO add spinner
        'LOADING.....'
      }

      <Header />
    </>
  )
}

const mapStateToProps = (state) => ({
  loading: state.loading,
  user: state.user,
  partner: state.partner,
  partnerLikedNames: state.partnerLikedNames,
  matches: state.matches
})

const mapDispatchToProps = (dispatch) => ({
  setPartner: (partnerData) => dispatch(setPartner(partnerData)),
  setLoading: (status) => dispatch(setLoading(status)),
  getLikedNames: (userId) => dispatch(getLikedNames(userId)),
  setMatches: (matches) => dispatch(setMatches(matches)),
  getPartnerLikedNames: (partnerId) => dispatch(getPartnerLikedNames(partnerId)),

})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Deck);

//TODO bug: make game redirect to login if there is no user (authorization)