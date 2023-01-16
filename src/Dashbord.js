import React, { useEffect, useState } from 'react'
import { Container, Form } from 'react-bootstrap'
import useAuth from './useAuth'
import SpotifyWebApi from 'spotify-web-api-node'
import TrackSearchResult from './TrackSearchResult'
import Player from './Player'
import axios from 'axios'


const spotifyApi = new SpotifyWebApi({
  clientId: '63355569b21c403bb508e405ac0af6a8',
})


const Dashbord = ({ code }) => {
  const accessToken = useAuth(code)
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [playingTrack, setPlayingTrack] = useState()
  const [lyrics, setLyrcis] = useState('')

  const chooseTrack = (track) => {
    setPlayingTrack(track)
    setSearch('')
    setSearchResult([])
    setLyrcis('')
  } 
  
  useEffect(() =>  {
    if (!playingTrack) return
    
    axios.get('http://localhost:8080/lyrics', {
      params: {
        track: playingTrack.title,
        artist: playingTrack.artist
      }
    }).then(res => {
      setLyrcis(res.data.lyrics)
    })
  }, [playingTrack])

  useEffect(() => {
    if (!accessToken) return
    spotifyApi.setAccessToken(accessToken)
  }, [accessToken])

  useEffect(() => {
    if (!search) return setSearch('')
    if (!accessToken) return 

    let cancel = false
    spotifyApi.searchTracks(search).then(res => {
      if (cancel) return
      setSearchResult(
      res.body.tracks.items.map(track => {
        const smallestAlbumImage = track.album.images.reduce((smallest, image) => {
          if (image.height < smallest.height) return image
          return smallest
        }, track.album.images[0])
        return {
          artist: track.artists[0].name,
          title: track.name,
          uri: track.uri,
          albumUrl: smallestAlbumImage.url
        }
      })
      )
    })
    return () => cancel = true
  }, [search, accessToken])
  
  return (
    <Container className='d-flex flex-column py-2' style={{height: '100vh'}}>
      <Form.Control 
        type='search' 
        placeholder='Search Songs Artist' 
        value={search} 
        onChange={e => setSearch(e.target.value) } />
        <div className='flex-grow-1 my-2' style={{ overflowY: 'auto' }}>
          {searchResult.map(track => (
            <TrackSearchResult 
            track={track} 
            key={track.uri} 
            chooseTrack={chooseTrack}
            />
            ))}
          {searchResult.length === 0 && (
            <div className='text-center' style={{ whiteSpace: 'pre' }}>
              {lyrics}
            </div>
          )}
        </div>
        <div><Player accessToken={accessToken} trackUri={playingTrack?.uri}/></div>
    </Container>
  )
}

export default Dashbord
