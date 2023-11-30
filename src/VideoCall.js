
// src/components/VideoCall.js
import React, { useEffect, useRef, useState } from 'react';
import {
  Paper,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  Switch, Box,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

} from '@mui/material';
import io from 'socket.io-client';
import "./App.css"
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, IconButton, Grid } from '@material-ui/core';
import VideocamIcon from '@material-ui/icons/Videocam';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import PeopleIcon from '@material-ui/icons/People';
import ChatIcon from '@material-ui/icons/Chat';
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    height: '100vh', // 100% of viewport height
    overflow: 'hidden',
    background: "black"
  },
  appBar: {
    backgroundColor: '#3363b1',
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    flexGrow: 1,
  },
  centerIcons: {
    display: 'flex',
    alignItems: 'center',
  },
  iconButton: {
    margin: theme.spacing(2),
  },
  videoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 64px)',
    width: '100%', // Make it cover the full width
  },
  video: {
    width: '100%',
    height: '100%',
  },
  drawer: {
    width: '300px',
  },
  drawerPaper: {
    padding: "15px",
    width: '350px',
  },
  drawerList: {
    padding: theme.spacing(2),
  },
  commentInputRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(2),
  },
}));
const VideoCall = () => {
  const classes = useStyles();
  const [showMessages, setShowMessages] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [openModal, setOpenModal] = useState(true); // Set to true to open modal initially

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [roomId, setRoomId] = useState('Tellignet');
  const [username, setUsername] = useState('');
  const [participants, setParticipants] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [isAudioMuted, setIsAudioMinuted] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [hideField, setHideField] = useState(false)
  const [stream, setStream] = useState(null);
  const [isNameEntered, setIsNameEntered] = useState(false);
  const socket = io('http://localhost:3002'); // Replace with your server address

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(stream);
        localVideoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    getMedia();

    return () => {
      // Clean up logic if needed
    };
  }, []);

  const joinRoom = () => {
    setHideField(true)
    socket.emit('join-room', roomId, username);
  };

  const dropCall = () => {
    socket.disconnect();
  };

  const toggleAudio = () => {
    socket.emit('toggle-audio', roomId);
    setIsAudioMinuted(!isAudioMuted);
  };

  const toggleVideo = () => {
    socket.emit('toggle-video', roomId);
    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach((track) => (track.enabled = !isVideoMuted));
    setIsVideoMuted(!isVideoMuted);
  };

  const sendComment = () => {
    socket.emit('send-comment', roomId, commentInput, username);
    setCommentInput('');
  };

  socket.on('user-joined', (user) => {
    // Handle user joined
    console.log(`${user} joined the call`);
  });

  socket.on('user-left', (user) => {
    // Handle user left
    console.log(`${user} left the call`);
  });

  socket.on('update-participants', (newParticipants) => {
    setParticipants(newParticipants);
  });

  socket.on('toggle-audio', (userId) => {
    // Handle toggle audio
    console.log(`${userId} toggled audio`);
  });

  socket.on('toggle-video', (userId) => {
    // Handle toggle video
    console.log(`${userId} toggled video`);
  });

  socket.on('receive-comment', (data) => {
    console.log('✌️data --->', data);
    setComments((prevComments) => [...prevComments, data]);
  });
  const toggleMessages = () => {
    setShowMessages(!showMessages);
  };

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };
  const handleModalClose = () => {
    if (username.trim() !== ''
      //  && roomId.trim() !== ''
    ) {
      setOpenModal(false);
      setIsNameEntered(true);
    } else {
      // Optionally show an error message or prevent closing
      alert('Please enter your name to join the call');
    }
  };
  const handleJoinCall = () => {
    joinRoom()
    handleModalClose()
  }
  console.log('✌️comments --->', comments);
  return (
    <div style={{ height: "100%" }}>
      <Dialog open={openModal && !isNameEntered} onClose={handleModalClose}>
        <DialogTitle>Enter Name to Join Call</DialogTitle>
        <DialogContent>
          <TextField
            label="Your Name"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleJoinCall}>
            Join Call
          </Button>
        </DialogActions>
      </Dialog>

      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Meet At Voli
          </Typography>
          <div className={classes.centerIcons}>
            <IconButton color="inherit" onClick={toggleAudio} className={classes.iconButton}>
              {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            <IconButton color="inherit" onClick={toggleVideo} className={classes.iconButton}>
              {isVideoMuted ? <VideocamIcon /> : <VideocamOffIcon /> }
            </IconButton>
            <IconButton color="inherit" onClick={toggleMessages} className={classes.iconButton}>
              <ChatIcon />
            </IconButton>
            <IconButton color="inherit" onClick={toggleParticipants} className={classes.iconButton}>
              <PeopleIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      <Box className={classes.videoContainer}>
        <video ref={localVideoRef} autoPlay muted={isAudioMuted} playsInline className={classes.video}></video>
      </Box>

      <Drawer
        anchor="right"
        open={showMessages}
        onClose={toggleMessages}
        classes={{ paper: classes.drawerPaper }}
      >
        <List className={classes.drawerList}>
          <div className={classes.commentsContainer}>
            <Typography variant="h6">Comments</Typography>
            <List>
              {comments.map((comment, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`${comment.username}: ${comment.comment}`} />
                </ListItem>
              ))}
            </List>
            <div className={classes.commentInputRow}>
              <TextField
                label="Add a comment"
                variant="outlined"
                fullWidth
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className={classes.commentInput}
              />
              <Button variant="contained" color="primary" onClick={sendComment} sx={{ padding: "15px" }}>
                Send
              </Button>
            </div>
          </div>
        </List>
      </Drawer>

      <Drawer
        anchor="right"
        open={showParticipants}
        onClose={toggleParticipants}
        classes={{ paper: classes.drawerPaper }}
      >
        <Typography variant="h6">Participants</Typography>
        <List className={classes.drawerList}>
          {participants.map((participant, index) => (
            <ListItem key={index}>
              <ListItemText primary={participant} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </div>

  );
};

export default VideoCall;
