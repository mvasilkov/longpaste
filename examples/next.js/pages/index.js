import React from 'react'
import jwtDecode from 'jwt-decode'
import { solve } from 'longpaste/scripts/pow'
import 'isomorphic-fetch'

const defaults = {
    credentials: 'same-origin',
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
    },
}

export default class extends React.Component {
    constructor(props) {
        super(props)

        this.submit = this.submit.bind(this)
    }

    static async getInitialProps({ req }) {
        // Development only
        const host = req ? 'http://' + req.headers['host'] : ''

        // Get the Longpaste challenge
        let ch = await fetch(`${host}/longpaste`, defaults)
        ch = await ch.json() // { token: '...' }
        return { host, ...ch }
    }

    render() {
        return <button onClick={this.submit}>hello, world</button>
    }

    async submit(event) {
        const { host, token } = this.props
        const { salt, n } = jwtDecode(token)
        const contents = '# hello, world'

        solve(salt, n, contents, async nonce => {
            const body = JSON.stringify({
                token,
                contents,
                nonce,
            })
            let res = await fetch(`${host}/longpaste/p`, { method: 'post', body, ...defaults })
            console.log(res)
            res = await res.json()
            console.log(res)
        })
    }
}
