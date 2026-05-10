import { useEffect, useState } from 'react'
import Dropdown from 'rc-dropdown';
import { useSnapshot } from 'valtio';
import { User } from './user'
import 'rc-dropdown/assets/index.css';
import { styled } from '@linaria/react';
import UserRound from './asserts/user-round.svg?react';
import Github from './asserts/github.svg?react';
import Google from './asserts/google.svg?react';
import Alipay from './asserts/alipay.svg?react';
import Weibo from './asserts/weibo.svg?react';

export { User } from './user'

const Menu = styled.div`
  padding: 5px 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: grey 0px 0px 3px;
`
const MenuItem = styled.div`
  line-height: 1.5;
  font-size: 12px;
  padding: 8px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  justify-content: flex-start;
  &:hover {
    cursor: pointer;
  }
  &.disable {
    background-color: lightgrey;
    opacity: 0.7;
    cursor: not-allowed;
  }
`
const Avatar = styled.img`
  height: 30px;
  border-radius: 50%;
`
const Login = styled.div`
  padding: 3px 10px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  color: white;
  background-color: #999;
  white-space: nowrap;
`

function authorize(app) {
  window.location.href = `https://jiayou.work/gw/user/sns/${app}/authorize?redirect_url=${window.location.href}`
}

const UserInfo = ({ onLogout }) => {
  const state = useSnapshot(User)
  const [isRefreshProfile, setIsRefreshProfile] = useState(false)
  const [isRefreshToken, setIsRefreshToken] = useState(false)
  useEffect(() => {
    if (isRefreshToken) {
      return;
    }
    if (state.refresh_token && !state.access_token) {
      setIsRefreshToken(true)
      User.refreshToken(() => {
        setIsRefreshToken(false)
      })
    }
  }, [state.refresh_token])
  useEffect(() => {
    if (isRefreshProfile) {
      return;
    }
    if (!state.profile && state.access_token) {
      setIsRefreshProfile(true)
      User.refreshProfile(() => {
        setIsRefreshProfile(false)
      })
    }
  }, [state.access_token])
  return <div>
    {(state.isLogin && state.profile)
      ? <Dropdown
        trigger={['click']}
        overlay={<Menu>
          <MenuItem>{state.profile.nickname}</MenuItem>
          <MenuItem onClick={() => {
            if (onLogout) {
              onLogout();
            }
            User.logout()
          }}>退出</MenuItem>
        </Menu>}
        animation="slide-up"
      >
        {state.profile.avatar ? <Avatar src={state.profile.avatar} /> : <UserRound width={30} />}
      </Dropdown>
      : <Dropdown
        trigger={['click']}
        overlay={<Menu>
          <MenuItem onClick={() => authorize('google')}><Google style={{ height: 15 }} />google</MenuItem>
          <MenuItem onClick={() => authorize('alipay')}><Alipay style={{ height: 16 }} />支付宝</MenuItem>
          <MenuItem onClick={() => {
            authorize('github')
          }}><Github style={{ height: 16 }} />github</MenuItem>
          <MenuItem className="disable" onClick={() => {
            // authorize('weibo')
          }}><Weibo style={{ height: 16 }} />新浪微博</MenuItem>
        </Menu>}
        animation="slide-up"
        onVisibleChange={() => {

        }}
      >
        <Login>登录</Login>
      </Dropdown>
    }
  </div>
}

export default UserInfo;