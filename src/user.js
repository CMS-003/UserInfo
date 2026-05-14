import { proxy } from 'valtio'

const KEYS = {
  ACCESS_TOKEN: 'cms:access_token',
  REFRESH_TOKEN: 'cms:refresh_token',
  USER_PROFILE: 'cms:user'
}

let profile = null;
try {
  profile = JSON.parse(localStorage.getItem(KEYS.USER_PROFILE) || '')
} catch (err) {

}
export const User = proxy({
  baseURL: 'https://jiayou.work',
  profile,
  access_token: localStorage.getItem(KEYS.ACCESS_TOKEN) || '',
  refresh_token: localStorage.getItem(KEYS.REFRESH_TOKEN) || '',
  get isLogin() {
    return this.access_token !== '' && this.profile !== null
  },
  setRefreshToken(token) {
    localStorage.setItem(KEYS.REFRESH_TOKEN, token)
    this.refresh_token = token;
  },
  setAccessToken(token) {
    localStorage.setItem(KEYS.ACCESS_TOKEN, token)
    this.access_token = token;
  },
  refreshToken(cb) {
    const that = this;
    fetch(this.baseURL + '/gw/user/oauth/refresh', {
      method: 'post',
      headers: {
        Authorization: this.refresh_token
      }
    })
      .then(async (resp) => {
        if (resp.status === 200) {
          const body = await resp.json()
          if (body.code === 0) {
            const data = body.data;
            that.setAccessToken(data.access_token)
            that.setRefreshToken(data.refresh_token)
          } else {
            that.setAccessToken('')
          }
        } else {
          that.setAccessToken('')
        }
      })
      .catch(err => {
        that.setAccessToken('')
      })
      .finally(() => {
        if (cb) {
          cb()
        }
      });
  },
  refreshProfile(cb) {
    const that = this;
    fetch(this.baseURL + '/gw/user/profile', {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + this.access_token
      }
    })
      .then(async (resp) => {
        if (resp.status === 200) {
          const body = await resp.json()
          if (body.code === 0) {
            const data = body.data;
            that.setProfile(data.item)
          } else {
            that.setAccessToken('')
          }
        } else {

        }
      })
      .catch(err => {

      })
      .finally(() => {
        if (cb) {
          cb()
        }
      });
  },
  setProfile(profile) {
    if (profile) {
      this.profile = profile
      localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile))
    } else {
      this.profile = null
    }
  },
  logout() {
    localStorage.setItem(KEYS.USER_PROFILE, '')
    this.profile = null
    this.setAccessToken('')
    this.setRefreshToken('')
  },
  async login(data) {
    const that = this;
    try {
      const resp = await fetch(this.baseURL + '/gw/user/oauth/sign-in', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (resp.status === 200) {
        const body = await resp.json();
        if (body.code === 0) {
          that.setAccessToken(body.data.access_token)
          that.setRefreshToken(body.data.refresh_token)
          return '';
        }
        return body.message;
      }
    } catch (err) {
      return err.message;
    }
  },
  async register() {
    const that = this;
    try {
      const resp = await fetch(this.baseURL + '/gw/user/oauth/sign-up', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (resp.status === 200) {
        const body = await resp.json();
        if (body.code === 0) {
          return true;
        }
        return false;
      }
    } catch (err) {
      return false;
    }
  }
})