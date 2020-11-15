import React, { useState, useEffect } from 'react';
import '../styles/namecard.scss'
import NameCard from '../components/NameCard';
import Header from '../components/Header';
import Draggable from 'react-draggable';
import axios from 'axios';
import {
  setPartner,
  setMatches,
  setLoading,
  getLikedNames,
  getPartnerLikedNames,
} from '../redux/actions';
import { connect } from 'react-redux';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const BASE_URL = 'http://localhost:4002';

function Deck({ user, partner, partnerLikedNames, loading, matches, setPartner, setLoading, setMatches, getPartnerLikedNames, getLikedNames, gender }) {
  const [names, setNames] = useState([]);
  const [seen, setSeen] = useState([]);
  const [liked, setLiked] = useState([]);

  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [direction, setDirection] = useState(null);

  let filteredNames = filterNames();
  let open = false;

  function filterNames() {
    if (names.length && seen.length) {
      const results = names.filter(({ id: id1 }) => !seen.some(({ id: id2 }) => id2 === id1));
      return results;
    } else {
      return names;
    }
  }

  function getNames() {
    axios
      .get(`${BASE_URL}/names/${gender}`)
      .then(allnames => setNames(allnames.data))
      .then(setLoading(false))
      .catch(err => console.error(err))
  }

  function seenNames() {
    axios
      .get(`${BASE_URL}/user/${user.id}/seen`)
      .then(res => setSeen(res.data))
      .catch(err => console.error(err))
  }

  function postSeenNames(userId, nameId) {
    axios
      .post(`${BASE_URL}/user/${userId}/seen/${nameId}`)
      .then(res => res.status <= 400 ? res : Promise.reject(res))
      .catch(err => console.error(err))
  }

  function likedNames() {
    axios
      .get(`${BASE_URL}/user/${user.id}/liked`)
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setLiked(res.data)
        }
      })
      .catch(err => console.error(err));
  }

  function postLikedNames(userId, nameId) {
    axios
      .post(`${BASE_URL}/user/${userId}/liked/${nameId}`)
      .then(res => res.status <= 400 ? res : Promise.reject(res))
      .catch(err => console.error(err))
  }

   function setNewMatch(target) {
     console.log('target', target)
     if (liked.length && partnerLikedNames.length) {
      const result = partnerLikedNames.filter(({ name: name1 }) => name1 === target);
      console.log('result after filter', result);
      if(result.id) {
        const newMatch = [...matches, result];
        console.log('new matches', newMatch)
        setMatches(newMatch);
        alert('its a match: ' + target)
      }
     }
    }

  useEffect(() => {
    getNames();
    seenNames();
    likedNames();
    if (partner) {
      setPartner(user);
      getPartnerLikedNames(user.partnerId);
    };
  }, []);

  useEffect(() => {
    if (liked.length && partnerLikedNames.length) {
      const result = liked.filter(({ id: id1 }) => partnerLikedNames.some(({ id: id2 }) => id2 === id1));
      setMatches(result);
    }
  
  }, [liked, partnerLikedNames, setMatches])

  const swipe = (direction) => {
    if (direction === "right") {
      setDirection("right");

      postSeenNames(user.id, filteredNames[index].id);
      setSeen(prev => [...prev, filteredNames[index]]);

      postLikedNames(user.id, filteredNames[index].id)
      setLiked(prev => { const likedarray = [...prev, filteredNames[index]]; console.log('liked', likedarray); return likedarray });

      setNewMatch(filteredNames[index]);
   
    } else {
      setDirection("left");
      postSeenNames(user.id, filteredNames[index].id);
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


  return (
    <>
      { !loading
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
              names={filteredNames}
              index={index}
            />
          </div>

        </Draggable>

        :
        //TODO add spinner
        'LOADING.....'
      }
      <Snackbar open={open} autoHideDuration={3000}>
        <Alert severity="success">
          It's a Match
        </Alert>
      </Snackbar>
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