import { useEffect, useState } from 'react'
import Dropdown from 'rc-dropdown';
import { useSnapshot } from 'valtio';
import { User } from './user'
import 'rc-dropdown/assets/index.css';
import './index.css'
import UserRound from './asserts/user-round.svg?react';
import Github from './asserts/github.svg?react';
import Google from './asserts/google.svg?react';
import Alipay from './asserts/alipay.svg?react';
import Weibo from './asserts/weibo.svg?react';

export { User } from './user'

window.addEventListener('pageshow', (event) => {
  // event.persisted 为 true 表示页面是从 BFCache（往返缓存）中恢复的
  const navLoading = document.getElementById('navLoading');
  if (navLoading) {
    navLoading.style.display = 'none';
  }
});
let currentMode = 'login';

// 切换 登录 / 注册 模式
function switchTab(mode) {
  currentMode = mode;
  const btns = document.querySelectorAll('.tab-btn');
  const emailGroup = document.getElementById('emailGroup');
  const verifyGroup = document.getElementById('verifyGroup');
  const submitBtn = document.getElementById('submitBtn');
  const accountLabel = document.querySelector('label[for="account"]');

  // 更新 Tab 样式
  btns[0].classList.toggle('active', mode === 'login');
  btns[1].classList.toggle('active', mode === 'register');

  if (mode === 'register') {
    emailGroup.classList.remove('hidden');
    verifyGroup.classList.remove('hidden');
    submitBtn.innerText = '立即注册';
    accountLabel.innerText = '账号';
    document.getElementById('email').required = true;
  } else {
    emailGroup.classList.add('hidden');
    submitBtn.innerText = '立即登录';
    accountLabel.innerText = '账号 / 邮箱';
    document.getElementById('email').required = false;
  }
}

// 提交逻辑
async function handleAuth(event, cb) {
  event.preventDefault(); // 阻止表单刷新

  const data = {
    account: document.getElementById('account').value.trim(),
    password: document.getElementById('password').value.trim(),
    email: currentMode === 'register' ? document.getElementById('email').value.trim() : null
  };
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = '发送中...';

  try {
    if (currentMode === 'login') {
      const err = await User.login({
        type: 'account',
        account: data.account,
        value: data.password
      });
      if (err) {
        alert(err)
      } else {
        cb && cb('login')
      }
    } else {
      const success = await User.register(data);
      if (!success) {
        alert('注册失败')
      } else {
        cb && cb('register')
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = currentMode === 'login' ? '立即登录' : '立即注册';
  }
}

function authorize(app) {
  const navLoading = document.getElementById('navLoading');
  if (navLoading) {
    navLoading.style.display = 'block';
  }
  setTimeout(() => {
    window.location.href = `https://jiayou.work/gw/user/sns/${app}/authorize?redirect_url=${window.location.href}`
  }, 200);
}

const UserInfo = ({ afterLogin, afterLogout }) => {
  const state = useSnapshot(User)
  const [showLogin, setShowLogin] = useState(false)
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
  return <div style={{ display: 'flex' }}>
    {(state.isLogin && state.profile)
      ? <Dropdown
        trigger={['click']}
        overlay={<div className='cms__menu'>
          <div className='cms__menu-item'>{state.profile.nickname}</div>
          <div className='cms__menu-item' onClick={() => {
            if (afterLogout) {
              afterLogout();
            }
            User.logout()
          }}>退出</div>
        </div>}
        animation="slide-up"
      >
        {state.profile.avatar ? <img src={state.profile.avatar} style={{ width: 30, height: 30, borderRadius: 30, }} /> : <UserRound width={30} />}
      </Dropdown>
      : <Dropdown
        trigger={['click']}
        overlay={<div className='cms__menu'>
          <div className='cms__menu-item cms__login-text' style={{ textAlign: 'center' }} onClick={() => setShowLogin(true)}>
            <span>登录/注册</span>
          </div>
          <div className='cms__menu-item' onClick={() => authorize('google')}><Google style={{ height: 15 }} />google</div>
          <div className='cms__menu-item' onClick={() => authorize('alipay')}><Alipay style={{ height: 16 }} />支付宝</div>
          <div className='cms__menu-item' onClick={() => { authorize('github') }}><Github style={{ height: 16 }} />github</div>
          <div className='cms__menu-item' onClick={() => { authorize('weibo') }}><Weibo style={{ height: 16 }} />新浪微博</div>
        </div>}
        animation="slide-up"
        onVisibleChange={() => {

        }}
      >
        <div className='cms__login-btn'>登录</div>
      </Dropdown>
    }
    {showLogin && (
      <div className="cms__mask">
        <div className="cms__login-modal">
          <div className="modal-content">
            <span style={{ position: 'absolute', top: 5, right: 5, color: '#333', fontSize: 12, cursor: 'pointer' }} onClick={() => setShowLogin(false)}>关闭</span>
            <div className="tab-header">
              <button className="tab-btn active" onClick={() => switchTab('login')} >登录</button>
              <button className="tab-btn" onClick={() => switchTab('register')} >注册</button>
            </div>

            <form id="authForm">
              <div className="input-group">
                <label htmlFor="account">账号 / 邮箱</label>
                <input type="text" id="account" name="account" placeholder="请输入账号或邮箱" required />
              </div>

              <div id="emailGroup" className="input-group hidden">
                <label htmlFor="email">邮箱</label>
                <input type="email" id="email" placeholder="请输入有效邮箱" />
              </div>

              <div className="input-group">
                <label htmlFor="password">密码</label>
                <input type="password" id="password" placeholder="请输入密码" required />
              </div>

              <div className="input-group hidden">
                <label htmlFor="verifyGroup">验证码</label>
                <input type="password" id="verifyGroup" placeholder="请输入验证码" required />
              </div>

              <button id="submitBtn" className="submit-btn" onClick={(event) => {
                handleAuth(event, (type) => {
                  setShowLogin(false)
                  afterLogin && type === 'login' && afterLogin()
                })
              }}>立即登录</button>
            </form>
          </div>
        </div>
      </div>
    )}
  </div>
}

export default UserInfo;