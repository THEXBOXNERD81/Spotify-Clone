import { useEffect, useState } from 'react'
import axios from 'axios'

const useAuth = (code) => {
    const [accessToken, setAccessToken] = useState()
    const [refreshToken, setRefreshToken] = useState()
    const [expiresIn, setExpiresIn] = useState()

    useEffect(() => {
        axios.post('http://localhost:8080/login', {
                code, 
            }).then(res => {
                setAccessToken(res.data.accessToken)
                setRefreshToken(res.data.refreshToken)
                setExpiresIn(res.data.expiresIn)
                window.history.pushState({}, null, '/')
            }).catch(error => {
                console.log(error)
                window.location = '/'
            })
    }, [code])

    useEffect(() => {
        if (!refreshToken || !expiresIn) return
        const interval = setInterval(() => {
            axios.post('http://localhost:8080/refresh', {
                refreshToken, 
            }).then(res => {
                setAccessToken(res.data.accessToken)
                setExpiresIn(res.data.expiresIn)
            }).catch(error => {
                console.log(error)
                window.location = '/'
            })
        }, (expiresIn - 60) * 1000)

        return () => clearInterval(interval)
    }, [expiresIn, refreshToken])

    return accessToken
}

export default useAuth